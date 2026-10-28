'use client';
import {useEffect,useRef,useState,lazy,Suspense,Fragment,type PointerEvent,type ReactNode} from 'react';
import {Check,ChevronRight,ChevronLeft,Code2,GripVertical,ArrowDownToLine,ArrowUpFromLine,PanelLeftClose,PanelLeftOpen,BookOpen,Terminal,Copy,Zap,AlertTriangle,CheckCircle2,Gauge,Layers,Lightbulb,FileCode2,Clock3,Grid3x3} from 'lucide-react';
import {useSidebar} from '@/components/ui/sidebar';
import {VisualLesson} from './visual-lesson';
import {LessonTransport,type PlaybackSpeed} from './lesson-transport';
import {WhiteboardLauncher} from './whiteboard-launcher';
import {GridLab} from './grid-lab';
import {PrefixLab,RectLab} from './geo-labs';
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
  return <div className="lx-sch lx-sch-int" aria-hidden="true">
   <div className="lx-sch-blocks">
    {Array.from({length:8},(_,i)=><i key={i} className={i<n?'is-filled':''}/>)}
   </div>
   <span className="lx-sch-cap">离散计数单元 · 无精度损失</span>
  </div>;
 }
 if(kind==='str'){
  const clean=value.replace(/^["']|["']$/g,'').slice(0,6)||'USACO';
  return <div className="lx-sch lx-sch-str" aria-hidden="true">
   <div className="lx-sch-tape">
    {Array.from(clean).map((ch,idx)=><span key={idx} className="lx-sch-char"><b>{ch===' '?'␣':ch}</b><small>[{idx}]</small></span>)}
   </div>
  </div>;
 }
 if(kind==='float'){
  const numMatch=value.match(/\d+(?:\.\d+)?/);
  const pct=numMatch?Math.min(92,Math.max(15,(parseFloat(numMatch[0])*17)%85+12)):62;
  return <div className="lx-sch lx-sch-float" aria-hidden="true">
   <div className="lx-sch-ruler">
    <div className="lx-sch-fill" style={{width:`${pct}%`}}/>
    <i className="lx-sch-pin" style={{left:`${pct}%`}}/>
   </div>
   <span className="lx-sch-cap">连续刻度 · 注意 IEEE-754 尾数误差</span>
  </div>;
 }
 if(kind==='bool'){
  const isTrue=!/false|假|0|不/i.test(value);
  return <div className="lx-sch lx-sch-bool" aria-hidden="true">
   <div className={`lx-sch-switch ${isTrue?'is-on':'is-off'}`}>
    <i className="lx-sch-knob"/>
    <span>{isTrue?'TRUE · 分支通行':'FALSE · 条件跳过'}</span>
   </div>
  </div>;
 }
 if(kind==='collection'){
  const tokens=value.replace(/^[\[\(\{]|[\]\)\}]$/g,'').split(/[,，]/).map(s=>s.trim()).filter(Boolean).slice(0,4);
  const cells=tokens.length?tokens:['a[0]','a[1]','a[2]'];
  return <div className="lx-sch lx-sch-collection" aria-hidden="true">
   <div className="lx-sch-slots">
    {cells.map((c,idx)=><span key={idx} className="lx-sch-slot"><b>{c.slice(0,8)}</b><small>#{idx}</small></span>)}
   </div>
  </div>;
 }
 return <div className="lx-sch lx-sch-default" aria-hidden="true">
  <div className="lx-sch-pulse"><i/></div>
  <span className="lx-sch-cap">实时内存绑定状态</span>
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
  badge:'标准 I/O 规范',
  title:'input() 严禁写提示语 + 大数据使用 sys.stdin 快读',
  why:'USACO 评测机比对全部标准输出。若写 input("请输入:")，提示语会直接混入输出导致全题 WA。',
  badLabel:'易错：带提示语污染输出',
  badCode:'n = int(input("请输入数量: "))\nprint("答案:", ans)',
  goodLabel:'推荐：纯净标准输入输出',
  goodCode:'import sys\nn = int(sys.stdin.readline())\nprint(ans)',
 },
 variables:{
  badge:'极值哨兵技巧',
  title:'用 float("inf") 初始化最小值，用元组一步交换变量',
  why:'USACO 坐标与权值常达 10^9，硬编码 99999 作初始最小值会被大测试点卡穿。',
  badLabel:'易错：魔法数字上界不够大',
  badCode:'best = 99999\ntemp = a; a = b; b = temp',
  goodLabel:'推荐：无穷大哨兵 + 元组交换',
  goodCode:'best = float("inf")\na, b = b, a',
 },
 types:{
  badge:'整数精度防坑',
  title:'拒绝浮点数比较：用整除 // 与交叉相乘代替小数除法',
  why:'float 存在二进制尾数误差（0.1+0.2 != 0.3）。判断比率或向上取整时应保持纯 int 运算。',
  badLabel:'易错：浮点除法在大数下失真',
  badCode:'buckets = math.ceil(milk / cap)\nif a / b == c / d: ...',
  goodLabel:'推荐：纯整数上取整与交叉相乘',
  goodCode:'buckets = (milk + cap - 1) // cap\nif a * d == c * b: ...',
 },
 operators:{
  badge:'环形牧场取模',
  title:'利用 Python 负数取模 % 自动环绕环形下标',
  why:'Python 中 (-1) % N 天然等于 N-1，处理顺逆时针环形牛棚移动时无需手写负数分支。',
  badLabel:'繁琐：手工判断负数越界',
  badCode:'prev_pos = pos - 1\nif prev_pos < 0: prev_pos = n - 1',
  goodLabel:'推荐：模运算一行自动环绕',
  goodCode:'prev_pos = (pos - 1) % n\nnext_pos = (pos + 1) % n',
 },
 conditions:{
  badge:'区间交集公式',
  title:'用 max/min 一行计算两段区间重叠长度',
  why:'栅栏涂色与时间段重叠问题若写 4 层 if-elif 极易漏掉端点包含关系。',
  badLabel:'易错：多层分支易漏边界情况',
  badCode:'if c >= a and c <= b:\n    overlap = min(b, d) - c',
  goodLabel:'推荐：零分支通用交集公式',
  goodCode:'overlap = max(0, min(b, d) - max(a, c))\nif L <= x <= R: ...',
 },
 loops:{
  badge:'4 秒常数优化',
  title:'避免在循环内对 list 做 in 查找，善用 enumerate',
  why:'USACO Python 时限 4 秒（约可跑 10^7 次简单循环），循环内嵌线性查找会退化为 O(N^2) 超时。',
  badLabel:'超时：循环内查列表 O(N²)',
  badCode:'for i in range(len(cows)):\n    if cows[i] in visited_list: ...',
  goodLabel:'推荐：enumerate + 集合 O(1) 查找',
  goodCode:'for i, cow in enumerate(cows):\n    if cow in visited_set: ...',
 },
 lists:{
  badge:'二维网格浅拷贝陷阱',
  title:'严禁用 [[0]*M]*N 初始化二维网格；善用 [0] 哨兵对齐 1..N',
  why:'[[0]*M]*N 会让 N 行指向同一个列表引用，改一格会导致整列全部被改！',
  badLabel:'致命错误：N 行共享同一列表引用',
  badCode:'grid = [[0] * M] * N\ngrid[0][1] = 1  # 全列都变成 1！',
  goodLabel:'推荐：列表推导独立建行',
  goodCode:'grid = [[0] * M for _ in range(N)]\ncows = [0] + a  # 1-based 下标对齐',
 },
 strings:{
  badge:'字符串不可变性',
  title:'字符网格转 list 修改，拼接使用 "".join()',
  why:'str 不可原地修改（s[i]="M" 会报错），且循环内 res += ch 会触发 O(N^2) 内存拷贝。',
  badLabel:'低效：循环内 += 反复新建字符串',
  badCode:'res = ""\nfor ch in s: res = res + ch',
  goodLabel:'推荐：转为列表修改 + join 合并',
  goodCode:'grid = [list(input().strip()) for _ in range(N)]\nans = "".join(chars)',
 },
 tuples:{
  badge:'多关键字排序',
  title:'坐标对存为 tuple 才能放入 set，利用 (x, -y) 多维排序',
  why:'list 不可哈希无法放入 set；而 tuple 天然支持按字典序逐项比较，适合多条件排序。',
  badLabel:'报错：list 放入 set 触发 TypeError',
  badCode:'visited = set()\nvisited.add([r, c])  # TypeError!',
  goodLabel:'推荐：tuple 存坐标 + lambda 多维排序',
  goodCode:'visited.add((r, c))\na.sort(key=lambda x: (x[0], -x[1]))',
 },
 sets:{
  badge:'查找降维防 TLE',
  title:'将 x in list 的 O(N) 扫描降维为 x in set 的 O(1) 哈希',
  why:'当 N=10^5 时，列表查找需 10^10 次比较必 TLE；转为 set 后仅需 0.05 秒即可通过。',
  badLabel:'超时：列表判重 O(N²) 必 TLE',
  badCode:'seen = []\nfor x in a:\n    if x not in seen: seen.append(x)',
  goodLabel:'推荐：集合哈希 O(1) 极速去重',
  goodCode:'seen = set()\nfor x in a:\n    seen.add(x)',
 },
 dicts:{
  badge:'大坐标稀疏映射',
  title:'坐标高达 10^9 时用 dict / Counter 代替超大数组',
  why:'USACO 数轴范围常达 [-10^9, 10^9]，直接开列表会 MemoryError，用字典只存出现过的点。',
  badLabel:'爆内存：按最大坐标开数组 MLE',
  badCode:'cnt = [0] * (10**9 + 1)  # MemoryError',
  goodLabel:'推荐：Counter / dict 稀疏统计',
  goodCode:'from collections import Counter\ncnt = Counter(cows)',
 },
 functions:{
  badge:'check(x) 判定抽离',
  title:'将复杂验证逻辑封装为返回 bool 的独立函数',
  why:'枚举答案或二分查找时，抽离 valid(k) -> bool 可随时 return 提前剪枝，避免多层 break 混乱。',
  badLabel:'混乱：多层嵌套循环与 flag 变量',
  badCode:'ok = True\nfor i in range(n):\n    if bad: ok = False; break',
  goodLabel:'推荐：纯函数封装 + all() 判定',
  goodCode:'def valid(k: int) -> bool:\n    return all(abs(x - y) <= k for x, y in pairs)',
 },
};

const defaultUsacoTip:UsacoPythonTip={
 badge:'流式快读模板',
 title:'使用 iter(sys.stdin.read().split()) 应对跨行或大规模输入',
 why:'USACO 部分题目将数字跨多行自由排版或单测含 10^5 行，流式 Token 读取器最稳健。',
 badLabel:'脆弱：逐行 input() 怕空行与多行混排',
 badCode:'n = int(input())\na = [int(input()) for _ in range(n)]',
 goodLabel:'推荐：流式 Token 迭代器模板',
 goodCode:'import sys\nit = iter(sys.stdin.read().split())\nn = int(next(it))',
};

interface ComplexityBarItem {
 label:string;
 badge:string;
 pct:number;
 tone:'emerald'|'indigo'|'amber'|'rose';
}

const algorithmComplexityMeta:Record<string,{limit:string;bars:ComplexityBarItem[]}>={
 complexity:{
  limit:'Python 4s 安全上限 ≈ 10⁷ 步',
  bars:[
   {label:'单次遍历 / 前缀和 O(N)',badge:'N ≤ 2·10⁵ 稳过',pct:18,tone:'emerald'},
   {label:'排序 + 扫描 O(N log N)',badge:'N ≤ 10⁵ 稳过',pct:38,tone:'indigo'},
   {label:'双层循环枚举对 O(N²)',badge:'仅限 N ≤ 2000',pct:74,tone:'amber'},
   {label:'三重循环 / 全排列 O(N³)',badge:'N > 300 必 TLE',pct:96,tone:'rose'},
  ],
 },
 simulation:{
  limit:'按关键事件或时间步推进状态',
  bars:[
   {label:'按关键事件跳跃模拟 O(N)',badge:'推荐：只停靠变化点',pct:24,tone:'emerald'},
   {label:'逐单位时间步模拟 O(T)',badge:'T ≤ 10⁶ 可行',pct:58,tone:'indigo'},
   {label:'每秒重扫全部奶牛 O(T·N)',badge:'T=10⁶ 时易 TLE',pct:92,tone:'rose'},
  ],
 },
 enumeration:{
  limit:'看准 N 的上界，枚举全部候选并逐一验证',
  bars:[
   {label:'利用对称性只枚举 i < j',badge:'N(N-1)/2 次 · 省一半常数',pct:34,tone:'emerald'},
   {label:'完整双层循环枚举 (i, j)',badge:'N² 次 · N ≤ 1000 适用',pct:66,tone:'indigo'},
   {label:'枚举后再套一层检验 O(N³)',badge:'仅限 N ≤ 100',pct:90,tone:'amber'},
  ],
 },
 sorting:{
  limit:'Timsort O(N log N) 将无序搜索转为相邻比较',
  bars:[
   {label:'先排序再一次线性扫描 O(N log N)',badge:'N = 10⁵ 仅 0.08s',pct:28,tone:'emerald'},
   {label:'每次找最值都重扫全表 O(N²)',badge:'N = 10⁵ 必 TLE',pct:94,tone:'rose'},
  ],
 },
 prefix:{
  limit:'O(N) 预处理换取每次区间查询 O(1)',
  bars:[
   {label:'前缀和预计算 + O(1) 查询',badge:'10⁵ 次查询瞬时完成',pct:16,tone:'emerald'},
   {label:'每次查询都切片求和 sum(a[L:R])',badge:'O(N·Q) 退化 TLE',pct:96,tone:'rose'},
  ],
 },
 binary:{
  limit:'单调区间每次折半排除一半候选',
  bars:[
   {label:'二分查找 / 二分答案 O(log₂ N)',badge:'N = 10⁹ 仅需 30 步',pct:14,tone:'emerald'},
   {label:'从头到尾顺序扫描 O(N)',badge:'N = 10⁹ 完全不可行',pct:95,tone:'rose'},
  ],
 },
};

const defaultAlgoComplexity={
 limit:'由数据规模 N 反推可接受的最高复杂度',
 bars:[
  {label:'当前课堂结构化解法',badge:'符合 Bronze 时间上界 · 稳健 AC',pct:26,tone:'emerald' as const},
  {label:'朴素暴力重复重算状态',badge:'常数偏大 · 大测试点易 TLE',pct:84,tone:'amber' as const},
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
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState<PlaybackSpeed>(1),frames=lesson.frames!,frame=frames[step];
 useEffect(()=>{onStepChange?.(step);},[step,onStepChange]);
 useEffect(()=>{if(!playing)return;const t=window.setInterval(()=>setStep(s=>{if(s>=frames.length-1){setPlaying(false);return s;}return s+1;}),Math.round(1900/speed));return()=>clearInterval(t);},[playing,speed,frames.length]);
 const cols=Math.min(frame.items?.length||1,4);
 return <div className="lx-stage lx-foundation">
  <header className="lx-stage-head">
   <div className="lx-stage-title"><span className="lx-eyebrow"><Layers size={13}/>Python 内存与类型视图</span><h3>{lesson.title}</h3><p>{lesson.desc}</p></div>
   <div className="lx-legend"><span><i style={{background:'#f59e0b'}}/>本步变化</span><span><i style={{background:'#94a3b8'}}/>已有数据</span></div>
  </header>
  <div className="lx-step-tabs" role="tablist" aria-label="执行步骤">
   {frames.map((f,i)=><button key={f.label} type="button" role="tab" aria-selected={i===step} className={i<step?'is-done':''} onClick={()=>{setPlaying(false);setStep(i);}}>
    <span>{i<step?<Check size={11}/>:i+1}</span><b>{f.label}</b>
   </button>)}
  </div>
  <div className="lx-memory" aria-live="polite">
   {frame.items?<div className="lx-mem-grid" style={{'--lx-cols':cols} as React.CSSProperties}>
    {frame.items.map((item,i)=>{
     const kind=inferDataKind(item.label,item.value);
     return <div key={item.label+'-'+i} className={`lx-mem-card ${item.active?'is-active':''}`} data-kind={kind}>
      <div className="lx-mem-head"><span className="lx-mem-name">{item.label}</span><span className="lx-mem-type">{kindBadgeLabel[kind]}</span></div>
      <code className="lx-mem-value">{item.value}</code>
      {renderDataSchematic(kind,item.value)}
     </div>;
    })}
   </div>:<div className="lx-mem-empty"><code>{frame.value}</code></div>}
  </div>
  <div className="lx-exec">
   <div className="lx-exec-stmt"><span>执行</span><code>{frame.value}</code></div>
   <p>{frame.explanation}</p>
  </div>
  <LessonTransport step={step} total={frames.length} playing={playing} speed={speed} labels={frames.map(f=>f.label)} onStep={s=>{setPlaying(false);setStep(s);}} onTogglePlay={()=>{if(step===frames.length-1)setStep(0);setPlaying(!playing);}} onReset={()=>{setPlaying(false);setStep(0);}} onSpeed={setSpeed}/>
 </div>;
}

function CodePanel({code,activeLine,title}:{code:string;activeLine:number;title:string}){
 const [copied,setCopied]=useState(false);
 const lines=code.split('\n');
 function copy(){try{navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{}}
 return <section className="lx-code" aria-label="对应代码">
  <header className="lx-code-bar">
   <span className="lx-code-tab"><FileCode2 size={13}/>{title}</span>
   <span className="lx-code-sync" title="随演示步骤同步高亮"><i/>第 {activeLine+1} 行</span>
   <button type="button" className="lx-code-copy" onClick={copy} title="复制代码">{copied?<Check size={13}/>:<Copy size={13}/>}<span>{copied?'已复制':'复制'}</span></button>
  </header>
  <div className="lx-code-body">
   {lines.map((line,idx)=><div key={idx} className={`lx-code-line ${idx===activeLine?'is-active':''}`}><span className="lx-ln">{idx+1}</span><code>{line?highlightPythonLine(line):' '}</code></div>)}
  </div>
  <footer className="lx-code-foot"><span>Python 3</span><span>{lines.length} 行</span><span>UTF-8</span></footer>
 </section>;
}

function ExercisePanel({exercise,onPassed,onStartCoding}:{exercise:Exercise;onPassed:()=>void;onStartCoding:()=>void}){
 const [coding,setCoding]=useState(false),[started,setStarted]=useState(false),[help,setHelp]=useState(false),[reference,setReference]=useState(false),[split,setSplit]=useState(40),[copiedIn,setCopiedIn]=useState(false);
 const workspace=useRef<HTMLDivElement>(null),drag=useRef<number|null>(null);
 const p:Problem={id:exercise.id,title:exercise.title,zhTitle:exercise.title,roundLabel:'课堂练习',year:2026,season:'course',tags:[],reviewStatus:'教学练习',level:'Bronze',visual:'',official:'',editorial:'',testsUrl:'',summary:exercise.prompt,summaryEn:'',analysis:'',hints:[exercise.hint],samples:[exercise.cases[0]],io:'stdin',checker:'tokens',testsImported:exercise.cases.length,testsTotal:exercise.cases.length};
 function resize(e:PointerEvent<HTMLDivElement>){if(drag.current!==e.pointerId||!workspace.current)return;const r=workspace.current.getBoundingClientRect();if(r.width)setSplit(Math.max(28,Math.min(60,(e.clientX-r.left)/r.width*100)));}
 function copySampleInput(){
  try{navigator.clipboard?.writeText(exercise.cases[0].input||'');setCopiedIn(true);setTimeout(()=>setCopiedIn(false),1400);}catch{}
 }
 return <div className="lx-ex">
  <div className="lx-ex-head">
   <div className="lx-ex-title">
    <span className="lx-ex-level">{exercise.level}</span>
    <h3>{exercise.title}</h3>
    <span className="lx-ex-meta">{exercise.cases.length} 组测试 · Python 3 · 标准输入输出</span>
   </div>
   <div className="lx-ex-actions">
    <WhiteboardLauncher context={{id:`exercise-${exercise.id}`,title:exercise.title,notes:[exercise.prompt,`输入：${exercise.inputFormat}`,`输出：${exercise.outputFormat}`],samples:exercise.cases.slice(0,1)}}/>
    <button type="button" className="lx-btn lx-btn-outline lx-btn-sm" onClick={()=>setHelp(!help)} aria-expanded={help}><Lightbulb size={14}/>思路提示</button>
    <button type="button" className="lx-btn lx-btn-outline lx-btn-sm" onClick={()=>setReference(!reference)} aria-expanded={reference}><FileCode2 size={14}/>参考解法</button>
    <button type="button" className="lx-btn lx-btn-primary lx-btn-sm" onClick={()=>{setStarted(true);setCoding(!coding);if(!coding)onStartCoding();}} aria-expanded={coding}><Code2 size={14}/>{coding?'收起编程区':'开始编程'}</button>
   </div>
  </div>
  <div ref={workspace} className={`lx-ex-body ${coding?'is-coding':''}`} style={{'--lx-read':`${split}%`} as React.CSSProperties}>
   <div className="lx-ex-statement" data-annotation-anchor={`exercise-${exercise.id}`}>
    <div className="lx-ex-prompt"><span className="lx-ex-eyebrow">题目要求</span><p>{exercise.prompt}</p></div>
    <div className="lx-ex-io">
     <section>
      <header><h4><ArrowDownToLine size={14}/>输入</h4><button type="button" className="lx-ex-copy" onClick={copySampleInput}>{copiedIn?<Check size={12}/>:<Copy size={12}/>}{copiedIn?'已复制':'复制'}</button></header>
      <p>{exercise.inputFormat}</p>
      <pre aria-label="练习样例输入">{exercise.cases[0].input||'（无输入）'}</pre>
     </section>
     <section>
      <header><h4><ArrowUpFromLine size={14}/>输出</h4><span>Sample Output</span></header>
      <p>{exercise.outputFormat}</p>
      <pre aria-label="练习样例输出">{exercise.cases[0].output}</pre>
     </section>
    </div>
    {help&&<div className="lx-ex-hint"><Lightbulb size={15}/><div><b>思路提示</b><span>{exercise.hint}</span></div></div>}
    {reference&&<div className="lx-ex-ref"><header><Terminal size={13}/><span>参考 Python 3 解法</span></header><pre>{exercise.solution}</pre></div>}
   </div>
   {coding&&<div className="lx-ex-divider" role="separator" aria-label="调整题目与编程区宽度" aria-orientation="vertical" aria-valuemin={28} aria-valuemax={60} aria-valuenow={Math.round(split)} tabIndex={0} onDoubleClick={()=>setSplit(40)} onPointerDown={e=>{e.preventDefault();drag.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={resize} onPointerUp={e=>{resize(e);drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setSplit(s=>e.key==='Home'?28:e.key==='End'?60:Math.max(28,Math.min(60,s+(e.key==='ArrowLeft'?-3:3))));}}}><GripVertical size={14}/></div>}
   {started&&<aside className="lx-ex-code" hidden={!coding} aria-label="练习编程区"><Suspense fallback={<p className="lx-ex-loading">正在打开编辑器…</p>}><ProjectIDE problem={p} mode="learning" visible={coding} onAttempt={()=>{}} practiceCases={exercise.cases} onGraded={passed=>{if(passed)onPassed();}}/></Suspense></aside>}
  </div>
 </div>;
}

function LessonPractice({lesson,onComplete,onStartCoding}:{lesson:CourseLesson;onComplete:()=>void;onStartCoding:()=>void}){
 const exercises=exerciseData.filter(e=>e.lesson===lesson.id),[selected,setSelected]=useState(0),[passed,setPassed]=useState<number[]>([]);
 useEffect(()=>{try{const values=JSON.parse(localStorage.getItem(progressKey)||'[]');if(Array.isArray(values))setPassed(values.filter(Number.isInteger));}catch{}},[]);
 function markPassed(id:number){let saved:number[]=[];try{const value=JSON.parse(localStorage.getItem(progressKey)||'[]');if(Array.isArray(value))saved=value.filter(Number.isInteger);}catch{}const next=[...new Set([...saved,...passed,id])];setPassed(next);try{localStorage.setItem(progressKey,JSON.stringify(next));}catch{}if(exercises.every(e=>next.includes(e.id)))onComplete();}
 if(!exercises.length)return null;
 const passedCount=exercises.filter(e=>passed.includes(e.id)).length;
 return <section className="lx-practice">
  <header className="lx-block-head">
   <div><span className="lx-block-icon"><Code2 size={16}/></span><div><h2>随堂编程练习</h2><p>在线运行调试，全部测试通过后自动记录完成。</p></div></div>
   <span className={`lx-pill ${passedCount===exercises.length?'is-done':''}`}>{passedCount} / {exercises.length} 已通过</span>
  </header>
  <div className="lx-levels" role="tablist" aria-label="练习难度">
   {exercises.map((e,i)=><button key={e.id} type="button" role="tab" aria-selected={i===selected} aria-controls={`exercise-${lesson.id}`} className={passed.includes(e.id)?'is-passed':''} onClick={()=>setSelected(i)}>
    <span className="lx-level-no">{passed.includes(e.id)?<Check size={13}/>:String(i+1).padStart(2,'0')}</span>
    <span className="lx-level-copy"><small>{e.level}</small><b>{e.title}</b></span>
   </button>)}
  </div>
  <div id={`exercise-${lesson.id}`} role="tabpanel">
   <ExercisePanel key={exercises[selected].id} exercise={exercises[selected]} onStartCoding={onStartCoding} onPassed={()=>markPassed(exercises[selected].id)}/>
  </div>
 </section>;
}

export function CoursePage({section,selected,onSelect,onOpenProblem,onLessonDone,done}:{section:'python'|'algorithm';selected:string;onSelect:(id:string)=>void;onOpenProblem:(id:number)=>void;onLessonDone:(id:string)=>void;done:string[]}){
 const {setOpen:setMainNavOpen}=useSidebar();
 const [directoryCollapsed,setDirectoryCollapsed]=useState(false),[directoryReady,setDirectoryReady]=useState(false),[activeStep,setActiveStep]=useState(0);
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
 const doneCount=list.filter(l=>done.includes(l.id)).length;
 const prev=index>0?list[index-1]:null,next=index<list.length-1?list[index+1]:null;
 const sectionLabel=section==='python'?'Python 基础':'算法课堂';
 const nextLabel=next?'下一课：'+next.title:section==='python'?'进入算法课堂':'进入模拟考试';
 const goNext=()=>onSelect(next?next.id:section==='python'?'complexity':'exam');
 return <section className={`lx-course is-${section}`}>
  <header className="lx-course-head">
   <div className="lx-course-heading">
    <nav className="lx-crumbs" aria-label="课程位置"><span>{sectionLabel}</span><ChevronRight size={13}/><span>{lesson.group||lesson.label}</span><ChevronRight size={13}/><b>{lesson.title}</b></nav>
    <div className="lx-course-title"><span className="lx-lesson-no">{String(index+1).padStart(2,'0')}</span><h1>{lesson.title}</h1><span className="lx-lesson-time"><Clock3 size={13}/>{lesson.minutes} 分钟</span></div>
   </div>
   <div className="lx-course-tools">
    <div className="lx-course-progress" title={`${doneCount} / ${list.length} 节完成`}><span>{doneCount}/{list.length} 节完成</span><div className="lx-bar"><i style={{width:`${doneCount/list.length*100}%`}}/></div></div>
    {['graphs','grid','recursion','prefix','geometry'].includes(lesson.id)&&<button type="button" className="lx-btn lx-btn-primary lx-btn-sm lx-lab-jump" onClick={()=>document.querySelector('.lx-gridlab')?.scrollIntoView({behavior:'smooth',block:'start'})}><Grid3x3 size={14}/>平面网格实验</button>}
    <WhiteboardLauncher key={lesson.id} context={{id:`lesson-${lesson.id}`,title:lesson.title,notes:[lesson.desc,...lesson.notes]}}/>
    <div className="lx-pager">
     <button type="button" className="lx-icon-btn" disabled={!prev} onClick={()=>prev&&onSelect(prev.id)} title={prev?'上一课：'+prev.title:'已是第一课'} aria-label="上一课"><ChevronLeft size={16}/></button>
     <button type="button" className="lx-icon-btn" onClick={goNext} title={nextLabel} aria-label="下一课"><ChevronRight size={16}/></button>
    </div>
   </div>
  </header>

  <div className={`lx-course-body ${directoryCollapsed?'is-collapsed':''}`}>
   <aside className="lx-rail" aria-label="课程目录">
    <button type="button" className="lx-rail-toggle" onClick={()=>setDirectoryCollapsed(!directoryCollapsed)} aria-expanded={!directoryCollapsed} title={directoryCollapsed?'展开课程目录':'收起课程目录'}>
     {directoryCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}<span>课程目录</span><small>{index+1}/{list.length}</small>
    </button>
    <nav className="lx-rail-list" aria-label={section==='python'?'Python 基础课程':'算法课程'}>
     {list.map((l,i)=><Fragment key={l.id}>
      {l.group&&(i===0||l.group!==list[i-1].group)&&<h3 className="lx-rail-group">{l.group}</h3>}
      <button type="button" className={`lx-rail-item ${l.id===lesson.id?'is-active':''} ${done.includes(l.id)?'is-done':''}`} onClick={()=>onSelect(l.id)} aria-current={l.id===lesson.id?'page':undefined} title={l.title}>
       <span className="lx-rail-no">{done.includes(l.id)?<Check size={12}/>:String(i+1).padStart(2,'0')}</span>
       <span className="lx-rail-copy"><b>{l.title}</b><small>{l.minutes} 分钟 · 3 道练习</small></span>
      </button>
     </Fragment>)}
    </nav>
   </aside>

   <article className="lx-lesson">
    <div className="lx-lesson-main" data-annotation-anchor={`lesson-${lesson.id}`}>
     <div className="lx-stage-col">
      {lesson.kind?<VisualLesson key={'visual-'+lesson.id} kind={lesson.kind} steps={lesson.steps} lessonId={lesson.id} onStepChange={setActiveStep}/>:<FoundationDiagram key={'visual-'+lesson.id} lesson={lesson} onStepChange={setActiveStep}/>}
     </div>
     <aside className="lx-inspector">
      <CodePanel code={lesson.code} activeLine={activeLineIdx} title={section==='python'?`${lesson.id}.py`:'solution.py'}/>
      {section==='algorithm'&&<section className="lx-card lx-complexity" aria-label="复杂度与数据规模对照">
       <header className="lx-card-head"><h3><Gauge size={15}/>复杂度 × 数据规模</h3><span className="lx-tag">{algoMeta.limit}</span></header>
       <div className="lx-cx-list">
        {algoMeta.bars.map(bar=><div key={bar.label} className={`lx-cx-row tone-${bar.tone}`}>
         <div className="lx-cx-label"><b>{bar.label}</b><span>{bar.badge}</span></div>
         <div className="lx-cx-track"><i style={{width:`${bar.pct}%`}}/></div>
        </div>)}
       </div>
       <p className="lx-cx-note">经验值：Python 每秒约 10⁷ 次简单运算；USACO 铜组时限通常为 Python 4 秒。</p>
      </section>}
      {section==='python'&&<section className="lx-card lx-tip" aria-label="USACO 赛场提示">
       <header className="lx-card-head"><h3><Zap size={15}/>USACO 赛场提示</h3><span className="lx-tag lx-tag-amber">{pyTip.badge}</span></header>
       <h4>{pyTip.title}</h4>
       <p className="lx-tip-why">{pyTip.why}</p>
       <div className="lx-compare">
        <div className="is-bad"><span><AlertTriangle size={12}/>{pyTip.badLabel}</span><pre>{pyTip.badCode}</pre></div>
        <div className="is-good"><span><CheckCircle2 size={12}/>{pyTip.goodLabel}</span><pre>{pyTip.goodCode}</pre></div>
       </div>
      </section>}
     </aside>
    </div>

    {['graphs','grid','recursion'].includes(lesson.id)&&<GridLab key={'grid-'+lesson.id} defaultMode={lesson.id==='recursion'?'dfs':'bfs'}/>}
    {lesson.id==='prefix'&&<PrefixLab/>}
    {lesson.id==='geometry'&&<RectLab/>}

    <section className="lx-notes" aria-label="知识要点">
     <header className="lx-block-head"><div><span className="lx-block-icon"><BookOpen size={16}/></span><div><h2>知识要点</h2><p>{lesson.desc}</p></div></div><span className="lx-pill">{lesson.notes.length} 条</span></header>
     <ol className="lx-note-grid">{lesson.notes.map((note,i)=><li key={note}><span className="lx-note-no">{String(i+1).padStart(2,'0')}</span><p>{formatNoteText(note)}</p></li>)}</ol>
    </section>

    <LessonPractice key={'practice-'+lesson.id} lesson={lesson} onStartCoding={beginCoding} onComplete={()=>onLessonDone(lesson.id)}/>

    <footer className="lx-course-next">
     <div className="lx-next-meta">{section==='python'&&<span>延伸阅读：<a href="https://m.runoob.com/python3/" target="_blank" rel="noreferrer">菜鸟教程目录</a><a href="https://docs.python.org/zh-cn/3.12/library/functions.html" target="_blank" rel="noreferrer">Python 内置函数</a><a href="https://docs.python.org/zh-cn/3.12/tutorial/datastructures.html" target="_blank" rel="noreferrer">Python 数据结构</a></span>}</div>
     <div className="lx-next-actions">{lesson.problem&&<button type="button" className="lx-btn lx-btn-outline" onClick={()=>onOpenProblem(lesson.problem!)}>练对应真题</button>}<button type="button" className="lx-btn lx-btn-primary" onClick={goNext}>{nextLabel}<ChevronRight size={15}/></button></div>
    </footer>
   </article>
  </div>
 </section>;
}
