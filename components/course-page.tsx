'use client';
import {useEffect,useRef,useState,lazy,Suspense,Fragment,type PointerEvent,type ReactNode} from 'react';
import {Check,ChevronRight,Code2,Play,RotateCcw,GripVertical,ArrowDownToLine,ArrowUpFromLine,PanelLeftClose,PanelLeftOpen,BookOpen,Terminal,Copy,Zap,AlertTriangle,CheckCircle2,Gauge,Layers} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useSidebar} from '@/components/ui/sidebar';
import {VisualLesson} from './visual-lesson';
import {WhiteboardLauncher} from './whiteboard-launcher';
import {pythonLessons,algorithmLessons,type CourseLesson} from '@/data/course-lessons';
import exerciseData from '@/data/course-exercises.json';
import type {Problem} from './practice-workspace';
const ProjectIDE=lazy(()=>import('./project-ide').then(m=>({default:m.ProjectIDE})));
type Exercise=(typeof exerciseData)[number];
const progressKey='usaco-course-exercise-progress-v1';

type DataKind='int'|'str'|'float'|'bool'|'collection'|'default';

function inferDataKind(label:string,value:string):DataKind{
 const s=(label+' '+value).toLowerCase();
 if(/\bint\b|整数|数量|记录数|总量|最小值|最大值|下标|编号|长度|次数|余数|商/.test(s))return 'int';
 if(/\bstr\b|文字|字符串|文本|^".*"$|^'.*'$/.test(s))return 'str';
 if(/\bfloat\b|小数|\d+\.\d+/.test(s))return 'float';
 if(/\bbool\b|true|false|真假|判断|条件/.test(s))return 'bool';
 if(/\blist\b|\btuple\b|\bset\b|\bdict\b|\[.*\]|\{.*\}|→/.test(s))return 'collection';
 return 'default';
}

const kindBadgeLabel:Record<DataKind,string>={
 int:'int · 精确整数',
 str:'str · 字符序列',
 float:'float · 浮点刻度',
 bool:'bool · 逻辑开关',
 collection:'容器 · 内存视图',
 default:'var · 状态快照',
};

function renderDataSchematic(kind:DataKind,value:string):ReactNode{
 if(kind==='int'){
  const numMatch=value.match(/-?\d+/);
  const n=numMatch?Math.min(8,Math.max(1,Math.abs(parseInt(numMatch[0],10)))):4;
  return <div className="schematic-widget schematic-int" aria-hidden="true">
   <div className="schematic-int-blocks">
    {Array.from({length:8},(_,i)=><i key={i} className={i<n?'is-filled':''}/>)}
   </div>
   <span className="schematic-caption">离散计数单元 · 无精度损失</span>
  </div>;
 }
 if(kind==='str'){
  const clean=value.replace(/^["']|["']$/g,'').slice(0,6)||'USACO';
  return <div className="schematic-widget schematic-str" aria-hidden="true">
   <div className="schematic-char-tape">
    {Array.from(clean).map((ch,idx)=><span key={idx} className="char-cell"><b>{ch===' '?'␣':ch}</b><small>[{idx}]</small></span>)}
   </div>
  </div>;
 }
 if(kind==='float'){
  const numMatch=value.match(/\d+(?:\.\d+)?/);
  const pct=numMatch?Math.min(92,Math.max(15,(parseFloat(numMatch[0])*17)%85+12)):62;
  return <div className="schematic-widget schematic-float" aria-hidden="true">
   <div className="schematic-ruler">
    <div className="schematic-ruler-fill" style={{width:`${pct}%`}}/>
    <i className="schematic-ruler-pin" style={{left:`${pct}%`}}/>
   </div>
   <span className="schematic-caption">连续刻度 · 注意 IEEE-754 尾数误差</span>
  </div>;
 }
 if(kind==='bool'){
  const isTrue=!/false|假|0|不/i.test(value);
  return <div className="schematic-widget schematic-bool" aria-hidden="true">
   <div className={`schematic-switch ${isTrue?'is-on':'is-off'}`}>
    <i className="switch-knob"/>
    <span>{isTrue?'TRUE · 分支通行':'FALSE · 条件跳过'}</span>
   </div>
  </div>;
 }
 if(kind==='collection'){
  const tokens=value.replace(/^[\[\(\{]|[\]\)\}]$/g,'').split(/[,，]/).map(s=>s.trim()).filter(Boolean).slice(0,4);
  const cells=tokens.length?tokens:['a[0]','a[1]','a[2]'];
  return <div className="schematic-widget schematic-collection" aria-hidden="true">
   <div className="schematic-slots">
    {cells.map((c,idx)=><span key={idx} className="slot-cell"><b>{c.slice(0,8)}</b><small>#{idx}</small></span>)}
   </div>
  </div>;
 }
 return <div className="schematic-widget schematic-default" aria-hidden="true">
  <div className="schematic-pulse-bar"><i/></div>
  <span className="schematic-caption">实时内存绑定状态</span>
 </div>;
}

interface UsacoPythonTip {
 badge:string;
 title:string;
 why:string;
 badLabel:string;
 badCode:string;
 goodLabel:string;
 goodCode:string;
}

const usacoPythonPlaybook:Record<string,UsacoPythonTip>={
 intro:{
  badge:'USACO I/O 规范',
  title:'标准输入输出与禁止提示语原则',
  why:'USACO 评测机自 2020 年 12 月起全面采用标准输入输出（sys.stdin / print）。input() 括号内绝不能写提示文字，否则提示文字会直接混入 stdout 导致全题 WA。',
  badLabel:'❌ 携带提示语 / 多余空格',
  badCode:'n = int(input("请输入奶牛数量: "))\nprint("答案是:", ans)',
  goodLabel:'✅ 纯净标准输入输出',
  goodCode:'import sys\nn = int(sys.stdin.readline())\nprint(ans)',
 },
 variables:{
  badge:'竞赛哨兵值技巧',
  title:'用 float("inf") 初始化极值与同步交换变量',
  why:'求最小距离或最小代价时，不要硬编码 99999（USACO 坐标可达 10^9，极易溢出猜错上界），应使用 float("inf") 或 10**18。',
  badLabel:'❌ 魔法数字上界易被大样例卡穿',
  badCode:'best = 99999\ntemp = a; a = b; b = temp',
  goodLabel:'✅ 无穷大哨兵 + 元组一步交换',
  goodCode:'best = float("inf")\na, b = b, a  # 一步安全交换两头牛位置',
 },
 types:{
  badge:'精度防坑指南',
  title:'拒绝浮点数比较：用整除 // 与交叉相乘代替小数除法',
  why:'float 遵循 IEEE-754 二进制浮点标准（0.1 + 0.2 != 0.3）。USACO 中判断斜率、平均产奶量或向上取整时，尽量转化为纯 int 整数运算。',
  badLabel:'❌ 浮点除法在大数下丢失精度',
  badCode:'import math\nbuckets = math.ceil(milk / cap)\nif a / b == c / d: ...',
  goodLabel:'✅ 纯整数向上取整与交叉相乘',
  goodCode:'buckets = (milk + cap - 1) // cap\nif a * d == c * b:  # 零精度损失',
 },
 operators:{
  badge:'周期与环形牧场',
  title:'利用取模 % 处理环形下标与向上取整公式',
  why:'Python 的负数取模 (-1) % N 天然返回 N-1（C++/Java 会返回负数），非常适合处理环形牛棚顺逆时针移动！',
  badLabel:'❌ 手工分支容易漏掉边界',
  badCode:'prev_pos = pos - 1\nif prev_pos < 0:\n    prev_pos = n - 1',
  goodLabel:'✅ Python 模运算天然支持正负环绕',
  goodCode:'prev_pos = (pos - 1) % n\nnext_pos = (pos + 1) % n',
 },
 conditions:{
  badge:'区间重叠黄金公式',
  title:'链式比较与两段区间交集一行判定',
  why:'USACO 栅栏涂色、挤奶时间段等问题频繁判断 [a, b] 与 [c, d] 是否重叠，无需写 4 个 if-elif 分支，用 max/min 一行搞定。',
  badLabel:'❌ 繁琐且易漏等号的分类讨论',
  badCode:'if (c >= a and c <= b) or (a >= c and a <= d):\n    overlap = ...',
  goodLabel:'✅ 交集长度通用公式（零分支）',
  goodCode:'overlap = max(0, min(b, d) - max(a, c))\nif L <= x <= R:  # 原生支持链式比较',
 },
 loops:{
  badge:'Python 常数优化',
  title:'避免在紧密循环中重复计算，巧用 for-else 与 enumerate',
  why:'Python 在 USACO 有 4 秒时间上限（约可跑 10^7 次简单循环），把不变的边界计算移出内层循环能显著降低 TLE 风险。',
  badLabel:'❌ 每次迭代重复扫描或手写下标自增',
  badCode:'for i in range(len(cows)):\n    if cows[i] in visited_list: ...',
  goodLabel:'✅ enumerate 同时拿下标与值',
  goodCode:'for i, cow in enumerate(cows):\n    if cow in visited_set:  # O(1) 查找',
 },
 lists:{
  badge:'USACO 头号浅拷贝陷阱',
  title:'二维网格初始化与 1-Based 奶牛编号对齐',
  why:'USACO 奶牛与牧场编号几乎全是 1..N。在列表开头垫一个 [0] 哨兵即可直接用 a[1..N]；另外创建二维网格严禁用 [[0]*M]*N！',
  badLabel:'❌ [[0]*M]*N 导致改一格全列联动！',
  badCode:'grid = [[0] * M] * N  # N 行共享同一列表引用！\ngrid[0][1] = 1        # 所有行的第 1 列全变成 1',
  goodLabel:'✅ 列表推导独立成行 + 1-based 哨兵',
  goodCode:'grid = [[0] * M for _ in range(N)]\ncows = [0] + list(map(int, input().split()))',
 },
 strings:{
  badge:'字符串不可变性',
  title:'网格地图转为 list(str) 修改，拼接用 "".join()',
  why:'Python 的 str 不可原地修改（s[i] = "M" 会报错），在循环里用 s += ch 会产生 O(N^2) 拷贝开销，务必转为列表操作。',
  badLabel:'❌ 循环内字符串累加触发平方级耗时',
  badCode:'res = ""\nfor ch in s:\n    res = res + ch  # 每次新建字符串对象',
  goodLabel:'✅ 列表缓存字符 + join 一次性合并',
  goodCode:'grid = [list( input().strip() ) for _ in range(N)]\nans = "".join(chars)  # O(N) 线性时间',
 },
 tuples:{
  badge:'多关键字排序利器',
  title:'元组天然按字典序逐项比较，可直接作为 dict/set 键',
  why:'USACO 中经常需要先按坐标 x 升序、再按产奶量 y 降序排列。利用元组 (x, -y) 可直接完成多维排序；且坐标对 (r, c) 必须存为 tuple 才能放进 set。',
  badLabel:'❌ list 不能放入集合，报错 TypeError',
  badCode:'visited = set()\nvisited.add([r, c])  # TypeError: unhashable',
  goodLabel:'✅ tuple 存坐标状态 + 多关键字排序',
  goodCode:'visited.add((r, c))\nevents.sort(key=lambda e: (e[0], -e[1]))',
 },
 sets:{
  badge:'从 TLE 到 AC 的关键',
  title:'将 x in list 的 O(N) 线性扫描降维为 x in set 的 O(1) 哈希',
  why:'当 N = 10^5 时，在循环内执行 x in my_list 会产生 10^10 次比较直接超时（TLE）；只需提前转为 set，耗时立刻从 10 秒降到 0.05 秒！',
  badLabel:'❌ 在列表中反复查找（O(N^2) 超时）',
  badCode:'seen = []  # 列表查找是 O(N)\nfor x in a:\n    if x not in seen: seen.append(x)',
  goodLabel:'✅ 集合哈希去重与 O(1) 成员判定',
  goodCode:'seen = set()  # 哈希表查找均摊 O(1)\nfor x in a:\n    seen.add(x)',
 },
 dicts:{
  badge:'离散化与频次统计',
  title:'当坐标高达 10^9 无法开数组时，用 dict / Counter 稀疏映射',
  why:'USACO 数轴范围常给到 [-10^9, 10^9]，但实际事件点只有 N <= 10^5 个。此时不能开长度为 10^9 的列表，应该用 dict 或 collections.Counter。',
  badLabel:'❌ 试图按最大坐标开数组直接 MLE 爆内存',
  badCode:'cnt = [0] * (10**9 + 1)  # MemoryError!',
  goodLabel:'✅ Counter / defaultdict 按需存储',
  goodCode:'from collections import Counter\ncnt = Counter(cows)\nbest = cnt.most_common(1)[0][1]',
 },
 functions:{
  badge:'检验函数 check(x) 模式',
  title:'将题目判定逻辑封装为返回 bool 的纯函数',
  why:'在 USACO 枚举答案或二分查找题中，把「当容量为 K 时是否可行」独立成 can(K) -> bool，能让主循环清晰十倍，且支持 return 提前剪枝。',
  badLabel:'❌ 多重嵌套循环 + flag 标志位绕晕自己',
  badCode:'ok = True\nfor i in range(n):\n    for j in range(n):\n        if bad: ok = False; break',
  goodLabel:'✅ 独立 check 函数，随时 return 退出',
  goodCode:'def valid(limit: int) -> bool:\n    return all(abs(x - y) <= limit for x, y in pairs)',
 },
};

const defaultUsacoTip:UsacoPythonTip={
 badge:'USACO 流式快读模板',
 title:'使用 sys.stdin.read().split() 应对大规模或多行混排输入',
 why:'USACO 部分题目单测试点含 10^5 行数据，或将数字跨多行自由排版。使用 iter(sys.stdin.read().split()) 一次性读入全部 token 是最稳健的竞赛写法。',
 badLabel:'❌ 逐行 input() 慢且怕空行/跨行数据',
 badCode:'n = int(input())\na = [int(input()) for _ in range(n)]',
 goodLabel:'✅ 竞赛级流式 Token 读取器',
 goodCode:'import sys\nit = iter(sys.stdin.read().split())\nn = int(next(it))\na = [int(next(it)) for _ in range(n)]',
};

interface ComplexityBarItem {
 label:string;
 badge:string;
 pct:number;
 tone:'emerald'|'indigo'|'amber'|'rose';
}

const algorithmComplexityMeta:Record<string,{limit:string;bars:ComplexityBarItem[]}>={
 complexity:{
  limit:'USACO Python 4s 安全上限 ≈ 10^7 次基本操作',
  bars:[
   {label:'单次遍历 / 前缀和 O(N)',badge:'N ≤ 2·10⁵ 极速通过',pct:18,tone:'emerald'},
   {label:'排序 + 双指针 O(N log N)',badge:'N ≤ 10⁵ 稳定通过',pct:38,tone:'indigo'},
   {label:'双重循环枚举无序对 O(N²)',badge:'仅限 N ≤ 2000',pct:74,tone:'amber'},
   {label:'全排列 / 盲目三重循环 O(N³)',badge:'N > 300 必 TLE 超时',pct:96,tone:'rose'},
  ],
 },
 simulation:{
  limit:'按时间步或事件步精确推进状态',
  bars:[
   {label:'按关键事件跳跃模拟 O(N)',badge:'推荐：只停靠变化点',pct:24,tone:'emerald'},
   {label:'逐单位时间步模拟 O(T)',badge:'T ≤ 10⁶ 时可行',pct:58,tone:'indigo'},
   {label:'每秒重扫全部奶牛 O(T·N)',badge:'T=10⁶ 时易超时',pct:92,tone:'rose'},
  ],
 },
 enumeration:{
  limit:'Bronze 核心策略：看准数据规模大胆枚举全空间',
  bars:[
   {label:'利用对称性只枚举 i < j',badge:'N(N-1)/2 次比较 · 省一半常数',pct:34,tone:'emerald'},
   {label:'完整双层循环枚举 (i, j)',badge:'N² 次比较 · N ≤ 1000 适用',pct:66,tone:'indigo'},
   {label:'枚举后再套一层线性检验 O(N³)',badge:'仅限 N ≤ 100',pct:90,tone:'amber'},
  ],
 },
 sorting:{
  limit:'Timsort O(N log N) 将无序搜索转化为有序相邻关系',
  bars:[
   {label:'先排序再一次线性扫描 O(N log N)',badge:'N = 10⁵ 仅需 0.08s',pct:28,tone:'emerald'},
   {label:'每次找最值都重扫全表 O(N²)',badge:'N = 10⁵ 时耗时 > 10s (TLE)',pct:94,tone:'rose'},
  ],
 },
 prefix:{
  limit:'预处理 O(N) 换取任意区间 [L, R] 的 O(1) 瞬时回答',
  bars:[
   {label:'前缀和预计算 + O(1) 查询',badge:'Q = 10⁵ 次查询共 10⁵ 步',pct:16,tone:'emerald'},
   {label:'每次查询都 sum(a[L:R+1])',badge:'O(N·Q) 退化至 10¹⁰ 步 TLE',pct:96,tone:'rose'},
  ],
 },
 binary:{
  limit:'单调区间折半收敛：每次比较直接砍掉一半候选空间',
  bars:[
   {label:'二分查找 / 二分答案 O(log₂ N)',badge:'N = 10⁹ 仅需 30 次比较',pct:14,tone:'emerald'},
   {label:'从头到尾顺序扫描 O(N)',badge:'N = 10⁹ 时完全不可行',pct:95,tone:'rose'},
  ],
 },
};

const defaultAlgoComplexity={
 limit:'先看 N 的最大值反推可接受的时间复杂度，再动手写代码',
 bars:[
  {label:'当前课堂结构化解法',badge:'符合 Bronze 时间上界 · 稳健 AC',pct:26,tone:'emerald' as const},
  {label:'朴素暴力重算全部状态',badge:'常数偏大 · 大测试点易 TLE',pct:84,tone:'amber' as const},
 ],
};

function formatNoteText(note:string):ReactNode[]{
 const parts=note.split(/(\b(?:int|float|bool|str|list|tuple|set|dict|None|True|False|Counter|StopIteration|IndexError|TypeError|input|split|print|map|len|sum|min|max|abs|range|sorted|sort|iter|next|append|pop|add|discard|get|items|keys|values|bisect_left|bisect_right|dfs)\b(?:\([^)]*\))?|"[^"]*"|\[\d+(?:,\s*\d+)*\]|\{\d+(?:,\s*\d+)*\})/g);
 return parts.map((part,i)=>i%2===1?<code key={i} className="note-inline-token">{part}</code>:part);
}

function highlightPythonLine(line:string):ReactNode{
 const commentIdx=line.indexOf('#');
 const codePart=commentIdx>=0?line.slice(0,commentIdx):line;
 const commentPart=commentIdx>=0?line.slice(commentIdx):'';
 const tokens=codePart.split(/("[^"]*"|'[^']*'|\b(?:def|return|if|elif|else|for|while|in|and|or|not|import|from|True|False|None)\b|\b(?:int|float|str|bool|list|dict|set|tuple|print|input|split|map|len|sum|min|max|abs|range|sorted|iter|next)\b|\b\d+(?:\.\d+)?\b)/g);
 return <>
  {tokens.map((tok,i)=>{
   if(!tok)return null;
   if(/^(".*"|'.*')$/.test(tok))return <span key={i} className="py-tok-str">{tok}</span>;
   if(/^(def|return|if|elif|else|for|while|in|and|or|not|import|from|True|False|None)$/.test(tok))return <span key={i} className="py-tok-kw">{tok}</span>;
   if(/^(int|float|str|bool|list|dict|set|tuple|print|input|split|map|len|sum|min|max|abs|range|sorted|iter|next)$/.test(tok))return <span key={i} className="py-tok-fn">{tok}</span>;
   if(/^\d+(?:\.\d+)?$/.test(tok))return <span key={i} className="py-tok-num">{tok}</span>;
   return tok;
  })}
  {commentPart&&<span className="py-tok-com">{commentPart}</span>}
 </>;
}

function FoundationDiagram({lesson,onStepChange}:{lesson:CourseLesson;onStepChange?:(step:number)=>void}){
 const [step,setStep]=useState(0),frames=lesson.frames!,frame=frames[step];
 useEffect(()=>{onStepChange?.(step);},[step,onStepChange]);
 return <div className="foundation-diagram">
  <div className="foundation-stages" aria-label="执行步骤">
   {frames.map((f,i)=><button key={f.label} className={i<step?'is-done':''} aria-current={i===step?'step':undefined} onClick={()=>setStep(i)}>
    <span>{i<step?<Check size={12}/>:i+1}</span>
    <b>{f.label}</b>
    {i<frames.length-1&&<ChevronRight size={14} className="stage-chevron"/>}
   </button>)}
  </div>
  <div className="foundation-frame" aria-live="polite">
   <div className="foundation-frame-topline">
    <small className="foundation-step-badge">第 {step+1} / {frames.length} 步 · {frame.label}</small>
    <span className="foundation-memory-tag"><Layers size={13}/>Python 内存与类型具象视图</span>
   </div>
   {frame.items&&<div className="foundation-data-flow" aria-label="数据变化" style={{'--flow-cols':Math.min(frame.items.length,4)} as React.CSSProperties}>
    {frame.items.map((item,i)=>{
     const kind=inferDataKind(item.label,item.value);
     return <div key={item.label+'-'+i} className={`data-flow-card ${item.active?'active':''}`} data-kind={kind}>
      <div className="data-card-head">
       <small>{item.label}</small>
       <span className="data-kind-tag">{kindBadgeLabel[kind]}</span>
      </div>
      <code>{item.value}</code>
      {renderDataSchematic(kind,item.value)}
     </div>;
    })}
   </div>}
   <div className="foundation-inspector-grid">
    <div className="inspector-box inspector-code">
     <span className="inspector-label">当前执行语句 / 表达式求值</span>
     <pre>{frame.value}</pre>
    </div>
    <div className="inspector-box inspector-note">
     <span className="inspector-label">执行机制与 USACO 竞赛语义</span>
     <p>{frame.explanation}</p>
    </div>
   </div>
  </div>
  <div className="foundation-controls">
   <span>点击上方步骤胶囊或「下一步」观察变量内存变化</span>
   <div className="foundation-step-dots" aria-hidden="true">
    {frames.map((f,i)=><i key={f.label} className={i===step?'is-active':i<step?'is-done':''}/>)}
   </div>
   <Button variant="ghost" onClick={()=>setStep(0)}><RotateCcw size={14}/>重置</Button>
   <Button variant="outline" className="foundation-next-btn" onClick={()=>setStep(s=>Math.min(frames.length-1,s+1))} disabled={step===frames.length-1}><Play size={14}/>下一步</Button>
  </div>
 </div>;
}

function ExercisePanel({exercise,onPassed,onStartCoding}:{exercise:Exercise;onPassed:()=>void;onStartCoding:()=>void}){
 const [coding,setCoding]=useState(false),[started,setStarted]=useState(false),[help,setHelp]=useState(false),[reference,setReference]=useState(false),[split,setSplit]=useState(43);
 const workspace=useRef<HTMLDivElement>(null),drag=useRef<number|null>(null);
 const p:Problem={id:exercise.id,title:exercise.title,zhTitle:exercise.title,roundLabel:'课堂练习',year:2026,season:'course',tags:[],reviewStatus:'教学练习',level:'Bronze',visual:'',official:'',editorial:'',testsUrl:'',summary:exercise.prompt,summaryEn:'',analysis:'',hints:[exercise.hint],samples:[exercise.cases[0]],io:'stdin',checker:'tokens',testsImported:exercise.cases.length,testsTotal:exercise.cases.length};
 function resize(e:PointerEvent<HTMLDivElement>){if(drag.current!==e.pointerId||!workspace.current)return;const r=workspace.current.getBoundingClientRect();if(r.width)setSplit(Math.max(32,Math.min(60,(e.clientX-r.left)/r.width*100)));}
 return <div className="course-exercise"><div className="exercise-actions"><h3>{exercise.title}</h3><span>{exercise.cases.length} 组测试 · Python 3</span><WhiteboardLauncher context={{id:`exercise-${exercise.id}`,title:exercise.title,notes:[exercise.prompt,`输入：${exercise.inputFormat}`,`输出：${exercise.outputFormat}`],samples:exercise.cases.slice(0,1)}}/><Button onClick={()=>{setStarted(true);setCoding(!coding);if(!coding)onStartCoding();}} aria-expanded={coding}><Code2 size={15}/>{coding?'收起编程区':'开始编程'}</Button><Button variant="ghost" onClick={()=>setHelp(!help)} aria-expanded={help}>思路提示</Button><Button variant="ghost" onClick={()=>setReference(!reference)} aria-expanded={reference}>参考解法</Button></div>
  <div ref={workspace} className={`exercise-workspace ${coding?'is-coding':''}`} style={{'--exercise-reading-width':`${split}%`} as React.CSSProperties}>
   <div className="exercise-statement" data-annotation-anchor={`exercise-${exercise.id}`}><p className="exercise-prompt">{exercise.prompt}</p>
    <section className="exercise-io exercise-input"><header><h4><ArrowDownToLine size={15}/>输入</h4><span>Sample Input</span></header><p>{exercise.inputFormat}</p><pre aria-label="练习样例输入">{exercise.cases[0].input||'（无输入）'}</pre></section>
    <section className="exercise-io exercise-output"><header><h4><ArrowUpFromLine size={15}/>输出</h4><span>Sample Output</span></header><p>{exercise.outputFormat}</p><pre aria-label="练习样例输出">{exercise.cases[0].output}</pre></section>
    {help&&<p className="exercise-hint">{exercise.hint}</p>}{reference&&<pre className="code-sample">{exercise.solution}</pre>}
   </div>
   {coding&&<div className="exercise-divider" role="separator" aria-label="调整题目与编程区宽度" aria-orientation="vertical" aria-valuemin={32} aria-valuemax={60} aria-valuenow={Math.round(split)} tabIndex={0} onDoubleClick={()=>setSplit(43)} onPointerDown={e=>{e.preventDefault();drag.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={resize} onPointerUp={e=>{resize(e);drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setSplit(s=>e.key==='Home'?32:e.key==='End'?60:Math.max(32,Math.min(60,s+(e.key==='ArrowLeft'?-3:3))));}}}><GripVertical size={14}/></div>}
   {started&&<aside className="exercise-code-panel" hidden={!coding} aria-label="练习编程区"><Suspense fallback={<p className="ide-opening">正在打开编辑器…</p>}><ProjectIDE problem={p} mode="learning" visible={coding} onAttempt={()=>{}} practiceCases={exercise.cases} onGraded={passed=>{if(passed)onPassed();}}/></Suspense></aside>}
  </div>
 </div>;
}

function LessonPractice({lesson,onComplete,onStartCoding}:{lesson:CourseLesson;onComplete:()=>void;onStartCoding:()=>void}){
 const exercises=exerciseData.filter(e=>e.lesson===lesson.id),[selected,setSelected]=useState(0),[passed,setPassed]=useState<number[]>([]);
 useEffect(()=>{try{const values=JSON.parse(localStorage.getItem(progressKey)||'[]');if(Array.isArray(values))setPassed(values.filter(Number.isInteger));}catch{}},[]);
 function markPassed(id:number){let saved:number[]=[];try{const value=JSON.parse(localStorage.getItem(progressKey)||'[]');if(Array.isArray(value))saved=value.filter(Number.isInteger);}catch{}const next=[...new Set([...saved,...passed,id])];setPassed(next);try{localStorage.setItem(progressKey,JSON.stringify(next));}catch{}if(exercises.every(e=>next.includes(e.id)))onComplete();}
 return <section className="lesson-practice"><div className="practice-heading"><h2>编程练习</h2><p>运行看输出 · 检查全部后记录通过</p><span className="course-progress">{exercises.filter(e=>passed.includes(e.id)).length} / {exercises.length} 已通过</span></div><div className="exercise-levels" role="tablist" aria-label="练习难度">{exercises.map((e,i)=><button key={e.id} role="tab" aria-selected={i===selected} aria-controls={`exercise-${lesson.id}`} onClick={()=>setSelected(i)}><span>{passed.includes(e.id)?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><small>{e.level}</small><b>{e.title}</b></button>)}</div><div id={`exercise-${lesson.id}`} role="tabpanel"><ExercisePanel key={exercises[selected].id} exercise={exercises[selected]} onStartCoding={onStartCoding} onPassed={()=>markPassed(exercises[selected].id)}/></div></section>;
}

export function CoursePage({section,selected,onSelect,onOpenProblem,onLessonDone,done}:{section:'python'|'algorithm';selected:string;onSelect:(id:string)=>void;onOpenProblem:(id:number)=>void;onLessonDone:(id:string)=>void;done:string[]}){
 const {setOpen:setMainNavOpen}=useSidebar();
 const [directoryCollapsed,setDirectoryCollapsed]=useState(false),[directoryReady,setDirectoryReady]=useState(false),[copied,setCopied]=useState(false),[activeStep,setActiveStep]=useState(0);
 useEffect(()=>{try{setDirectoryCollapsed(localStorage.getItem('usaco-course-directory-collapsed')==='true');}catch{}setDirectoryReady(true);},[]);
 useEffect(()=>{if(directoryReady)try{localStorage.setItem('usaco-course-directory-collapsed',String(directoryCollapsed));}catch{}},[directoryCollapsed,directoryReady]);
 useEffect(()=>{setActiveStep(0);},[selected,section]);
 function beginCoding(){setDirectoryCollapsed(true);setMainNavOpen(false);}
 const list=section==='python'?pythonLessons:algorithmLessons,lesson=list.find(l=>l.id===selected)||list[0],index=list.findIndex(l=>l.id===lesson.id);
 const codeLines=lesson.code.split('\n');
 const totalSteps=lesson.steps?.length||lesson.frames?.length||4;
 const activeLineIdx=Math.min(codeLines.length-1,Math.floor((activeStep/Math.max(1,totalSteps-1))*Math.max(0,codeLines.length-1)));
 const pyTip=usacoPythonPlaybook[lesson.id]||defaultUsacoTip;
 const algoMeta=algorithmComplexityMeta[lesson.id]||defaultAlgoComplexity;
 function copyCode(){
  try{navigator.clipboard?.writeText(lesson.code);setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{}
 }
 return <section className="course-page"><header className="course-topline"><div className="course-identity"><h1>{section==='python'?'Python 基础':'算法课堂'}</h1><span className="course-slash">/</span><h2>{lesson.title}</h2><span className="course-position">{index+1} / {list.length}</span></div><p className="course-summary" title={lesson.desc}>{lesson.desc}</p><span className="course-progress">{list.filter(l=>done.includes(l.id)).length} / {list.length} 节完成</span><WhiteboardLauncher key={lesson.id} context={{id:`lesson-${lesson.id}`,title:lesson.title,notes:[lesson.desc,...lesson.notes]}}/></header>
  <div className={`classroom-layout ${directoryCollapsed?"directory-collapsed":""}`}><aside className="lesson-directory"><div className="directory-controls"><Button variant="ghost" onClick={()=>setDirectoryCollapsed(!directoryCollapsed)} aria-label={directoryCollapsed?"展开课程目录":"收起课程目录"} aria-expanded={!directoryCollapsed} title={directoryCollapsed?"展开课程目录":"收起课程目录"}>{directoryCollapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}<span>课程目录</span></Button></div><nav hidden={directoryCollapsed} className="lesson-list" aria-label={section==='python'?'Python 基础课程':'算法课程'}>{list.map((l,i)=><Fragment key={l.id}>{l.group&&(i===0||l.group!==list[i-1].group)&&<h3 className="lesson-group-label">{l.group}</h3>}<button className={l.id===lesson.id?'active':done.includes(l.id)?'is-completed':''} onClick={()=>onSelect(l.id)} aria-current={l.id===lesson.id?'page':undefined}><span>{done.includes(l.id)?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><div>{l.title}<small>{l.minutes} 分钟 · 3 道练习</small></div></button></Fragment>)}</nav></aside>
   <article className="lesson-content">
    <div className="lesson-overview" data-annotation-anchor={`lesson-${lesson.id}`}>
     {lesson.kind?<VisualLesson key={'visual-'+lesson.id} kind={lesson.kind} steps={lesson.steps} lessonId={lesson.id} onStepChange={setActiveStep}/>:<FoundationDiagram key={'visual-'+lesson.id} lesson={lesson} onStepChange={setActiveStep}/>}
     <div className="course-explanation">
      <section className="explanation-notes-card">
       <header className="explanation-card-header">
        <h3><BookOpen size={15}/>知识要点</h3>
        <span className="explanation-pill">Key Insights</span>
       </header>
       {section==='algorithm'&&<div className="algo-complexity-panel" aria-label="核心复杂度与规模对比">
        <div className="algo-complexity-head">
         <span><Gauge size={13}/>核心复杂度与规模对比</span>
         <small>{algoMeta.limit}</small>
        </div>
        <div className="algo-complexity-bars">
         {algoMeta.bars.map(bar=><div key={bar.label} className="algo-bar-row">
          <div className="algo-bar-labels"><b>{bar.label}</b><span>{bar.badge}</span></div>
          <div className="algo-bar-track"><div className={`algo-bar-fill tone-${bar.tone}`} style={{width:`${bar.pct}%`}}/></div>
         </div>)}
        </div>
       </div>}
       <ul>{lesson.notes.map(note=><li key={note}>{formatNoteText(note)}</li>)}</ul>
      </section>

      {section==='python'&&<section className="usaco-playbook-card" aria-label="USACO 竞赛实战锦囊">
       <header className="playbook-header">
        <div>
         <span className="playbook-badge"><Zap size={12}/>{pyTip.badge}</span>
         <h4>{pyTip.title}</h4>
        </div>
       </header>
       <p className="playbook-why">{pyTip.why}</p>
       <div className="playbook-compare">
        <div className="playbook-col is-bad">
         <span><AlertTriangle size={12}/>{pyTip.badLabel}</span>
         <pre>{pyTip.badCode}</pre>
        </div>
        <div className="playbook-col is-good">
         <span><CheckCircle2 size={12}/>{pyTip.goodLabel}</span>
         <pre>{pyTip.goodCode}</pre>
        </div>
       </div>
      </section>}

      <section className="explanation-code-card">
       <header className="code-window-bar">
        <div className="code-window-dots" aria-hidden="true"><i/><i/><i/></div>
        <h3><Terminal size={14}/>对应代码 / 伪代码</h3>
        <span className="code-sync-indicator">第 {activeLineIdx+1} 行联动中</span>
        <button type="button" className="code-copy-btn" onClick={copyCode} title="复制示例代码"><Copy size={12}/><span>{copied?'已复制':'复制'}</span></button>
       </header>
       <pre className="code-sample">{codeLines.map((line,idx)=><span key={idx} className={`code-line ${idx===activeLineIdx?'is-active-line':''}`} data-line={idx+1}>{highlightPythonLine(line)}{idx<codeLines.length-1?'\n':''}</span>)}</pre>
      </section>
     </div>
    </div>
    <LessonPractice key={'practice-'+lesson.id} lesson={lesson} onStartCoding={beginCoding} onComplete={()=>onLessonDone(lesson.id)}/>
    <div className="course-next">{lesson.problem&&<Button variant="outline" onClick={()=>onOpenProblem(lesson.problem!)}>练对应真题</Button>}<Button onClick={()=>onSelect(index<list.length-1?list[index+1].id:section==='python'?'complexity':'exam')}>{index<list.length-1?'下一课：'+list[index+1].title:section==='python'?'进入算法课堂':'进入模拟考试'}<ChevronRight size={15}/></Button></div>
    {section==='python'&&<p className="course-sources">延伸阅读：<a href="https://m.runoob.com/python3/" target="_blank" rel="noreferrer">菜鸟教程目录</a><a href="https://docs.python.org/zh-cn/3.12/library/functions.html" target="_blank" rel="noreferrer">Python 内置函数</a><a href="https://docs.python.org/zh-cn/3.12/tutorial/datastructures.html" target="_blank" rel="noreferrer">Python 数据结构</a></p>}
   </article>
  </div>
 </section>;
}
