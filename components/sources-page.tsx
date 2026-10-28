'use client';
import {useMemo} from 'react';
import {Database,FileText,Layers,ShieldCheck,ExternalLink,TrendingUp,TrendingDown,Grid3x3,GitMerge,FileInput,Split,BookOpen} from 'lucide-react';
import type {Problem} from './practice-workspace';
import learningTopics from '@/data/learning-topics.json';
import {topicMatches} from '@/lib/problem-library';

type Topic=(typeof learningTopics)[number];
const pct=(n:number,d:number)=>d?Math.round(n/d*1000)/10:0;
const stageOrder=['基础巩固','专项进阶','综合挑战'];
const stageColor:Record<string,string>={'基础巩固':'#12b76a','专项进阶':'#4f46e5','综合挑战':'#f59e0b'};

export function SourcesPage({problems,rounds,statementReport,pythonCount,algorithmCount,courseCount,onProblem,onTopic}:{problems:Problem[];rounds:string[];statementReport:{importedAt:string;included:number;unofficialChinese:number};pythonCount:number;algorithmCount:number;courseCount:number;onProblem:(id:number)=>void;onTopic:(id:string)=>void}){
 const s=useMemo(()=>{
  const classic=problems.filter(p=>p.year<2020),recent=problems.filter(p=>p.year>=2020);
  const years=[...new Set(problems.map(p=>p.year))].sort((a,b)=>a-b);
  const topics=learningTopics.map((t:Topic)=>{
   const all=problems.filter(p=>topicMatches(p,t.id));
   const c=all.filter(p=>p.year<2020).length,r=all.filter(p=>p.year>=2020).length;
   return {t,n:all.length,share:pct(all.length,problems.length),c,r,cShare:pct(c,classic.length),rShare:pct(r,recent.length),byYear:years.map(y=>all.filter(p=>p.year===y).length)};
  }).sort((a,b)=>b.n-a.n);
  const maxCell=Math.max(1,...topics.flatMap(x=>x.byYear));
  const stages=stageOrder.map(st=>({st,n:problems.filter(p=>p.practiceStage===st).length}));
  // Difficulty by position inside each contest (problem 1 / 2 / 3)
  const byRound=new Map<string,Problem[]>();problems.forEach(p=>byRound.set(p.roundLabel,[...(byRound.get(p.roundLabel)||[]),p]));
  const positions=[0,1,2].map(i=>{const list=[...byRound.values()].map(ps=>[...ps].sort((a,b)=>a.id-b.id)[i]).filter(Boolean) as Problem[];return {i,total:list.length,parts:stageOrder.map(st=>({st,n:list.filter(p=>p.practiceStage===st).length}))};});
  const tagCounts=[1,2,3,4].map(k=>({k,n:problems.filter(p=>(p.learningTopics||[]).length===k).length}));
  const multi=problems.filter(p=>(p.learningTopics||[]).length>=2).length;
  const pairMap=new Map<string,number>();
  problems.forEach(p=>{const ts=[...(p.learningTopics||[])].sort();for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const k=ts[i]+'|'+ts[j];pairMap.set(k,(pairMap.get(k)||0)+1);}});
  const label=(id:string)=>learningTopics.find(t=>t.id===id)?.label||id;
  const pairs=[...pairMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>({a:label(k.split('|')[0]),b:label(k.split('|')[1]),n}));
  const io=years.map(y=>{const ps=problems.filter(p=>p.year===y);return {y,file:ps.filter(p=>p.inputFile).length,std:ps.filter(p=>!p.inputFile).length};});
  const review=[['已核验','官方题解逐题核对'],['参考解法归类','按参考解法整理'],['题面已收录','仅收录题面与样例']].map(([k,d])=>({k,d,n:problems.filter(p=>p.reviewStatus===k).length}));
  const tests=problems.reduce((sum,p)=>sum+p.testsTotal,0);
  const movers=[...topics].filter(x=>x.n>=4).map(x=>({...x,delta:Math.round((x.rShare-x.cShare)*10)/10})).sort((a,b)=>b.delta-a.delta);
  return {classic,recent,years,topics,maxCell,stages,positions,tagCounts,multi,pairs,io,review,tests,rising:movers.slice(0,3),falling:movers.slice(-3).reverse()};
 },[problems]);
 const audited=problems.filter(p=>p.reviewStatus==='已核验');
 const dbMax=Math.ceil(Math.max(...s.topics.flatMap(x=>[x.cShare,x.rShare]))/10)*10||100,sc=(v:number)=>v/dbMax*100;
 const ring=2*Math.PI*38;let acc=0;

 return <div className="lx-src">
  <header className="lx-page-head">
   <div><span className="lx-kicker-light"><Database size={13}/>数据与依据</span><h1>题库范围与考点统计</h1><p>不按旧版级别目录推定考点，以实际题目、官方题解和经过核验的可选解法为依据。</p></div>
   <span className="lx-head-meta">最后核查 <b>{statementReport.importedAt}</b></span>
  </header>

  <section className="lx-kpis">
   {[[rounds.length,'场比赛','2015-01 至 2026 第三场 · 不含 US Open'],[problems.length,'道真题',`经典 ${s.classic.length} · 近年 ${s.recent.length}`],[s.tests.toLocaleString(),'个测试文件','官方数据，可整题评测'],[learningTopics.length,'个知识点分类',`${pct(s.multi,problems.length)}% 的题目跨 2 个以上分类`],[courseCount,'节课程',`Python ${pythonCount} · 算法 ${algorithmCount}`]].map(([n,l,d])=><div key={String(l)} className="lx-kpi"><b>{n}</b><span>{l}</span><small>{d}</small></div>)}
  </section>

  <div className="lx-src-grid">
   <section className="lx-card lx-src-share">
    <header className="lx-card-head"><h3><Layers size={15}/>知识点分布</h3><span className="lx-tag">多标签可重复计数 · 点击筛选题库</span></header>
    <div className="lx-share-list">{s.topics.map(({t,n,share})=><button type="button" key={t.id} onClick={()=>onTopic(t.id)} className="lx-share-row"><span className="lx-share-name">{t.label}</span><span className="lx-share-bar"><i style={{width:`${Math.max(3,share)}%`}}/></span><span className="lx-share-num"><b>{n}</b>{share}%</span></button>)}</div>
   </section>

   <section className="lx-card lx-src-trend">
    <header className="lx-card-head"><h3><TrendingUp size={15}/>经典 vs 近年：考点占比变化</h3><span className="lx-tag">2015–19 · {s.classic.length} 题　|　2020+ · {s.recent.length} 题</span></header>
    <div className="lx-dumbbell">{s.topics.map(x=><div key={x.t.id} className="lx-db-row"><span className="lx-db-name">{x.t.label}</span><span className="lx-db-track"><i className="lx-db-line" style={{left:`${sc(Math.min(x.cShare,x.rShare))}%`,width:`${sc(Math.abs(x.rShare-x.cShare))}%`}}/><i className="lx-db-dot is-classic" style={{left:`${sc(x.cShare)}%`}} title={`经典 ${x.cShare}%`}/><i className="lx-db-dot is-recent" style={{left:`${sc(x.rShare)}%`}} title={`近年 ${x.rShare}%`}/></span><span className={`lx-db-delta ${x.rShare>=x.cShare?'is-up':'is-down'}`}>{x.rShare>=x.cShare?'+':''}{Math.round((x.rShare-x.cShare)*10)/10}</span></div>)}</div>
    <div className="lx-db-legend"><span><i className="is-classic"/>经典占比</span><span><i className="is-recent"/>近年占比</span><span className="lx-muted">横轴：该分类题目占本时期题数的百分比（0–{dbMax}%）（0–{dbMax}%）</span></div>
    <div className="lx-insight"><div><TrendingUp size={14}/><b>近年上升</b>{s.rising.map(x=><span key={x.t.id}>{x.t.label}</span>)}</div><div><TrendingDown size={14}/><b>近年下降</b>{s.falling.map(x=><span key={x.t.id}>{x.t.label}</span>)}</div></div>
   </section>
  </div>

  <section className="lx-card lx-heat-card">
   <header className="lx-card-head"><h3><Grid3x3 size={15}/>年份 × 知识点热力图</h3><span className="lx-tag">格内数字 = 该年出现该分类的题数</span></header>
   <div className="lx-heat" style={{gridTemplateColumns:`150px repeat(${s.years.length},minmax(34px,1fr)) 48px`}}>
    <span/>{s.years.map(y=><span key={y} className="lx-heat-y">{String(y).slice(2)}</span>)}<span className="lx-heat-y">合计</span>
    {s.topics.map(x=><div key={x.t.id} className="lx-heat-row" style={{display:'contents'}}><button type="button" className="lx-heat-name" onClick={()=>onTopic(x.t.id)}>{x.t.label}</button>{x.byYear.map((v,i)=><span key={i} className="lx-heat-cell" style={{background:v?`rgba(79,70,229,${.12+.78*v/s.maxCell})`:undefined,color:v/s.maxCell>.5?'#fff':undefined}} title={`${s.years[i]} · ${x.t.label}：${v} 题`}>{v||''}</span>)}<b className="lx-heat-sum">{x.n}</b></div>)}
   </div>
  </section>

  <div className="lx-src-grid3">
   <section className="lx-card">
    <header className="lx-card-head"><h3><Split size={15}/>练习阶段</h3></header>
    <div className="lx-donut-wrap">
     <svg viewBox="0 0 100 100" className="lx-donut">{s.stages.map(({st,n})=>{const len=ring*n/problems.length,el=<circle key={st} cx="50" cy="50" r="38" stroke={stageColor[st]} strokeDasharray={`${len} ${ring-len}`} strokeDashoffset={-acc}/>;acc+=len;return el;})}<text x="50" y="49" textAnchor="middle" className="n">{problems.length}</text><text x="50" y="62" textAnchor="middle" className="c">道题</text></svg>
     <ul className="lx-legend-list">{s.stages.map(({st,n})=><li key={st}><i style={{background:stageColor[st]}}/>{st}<b>{n}</b><small>{pct(n,problems.length)}%</small></li>)}</ul>
    </div>
    <h4 className="lx-sub-h">按题号看难度（每场第 1 / 2 / 3 题）</h4>
    <div className="lx-stack-list">{s.positions.map(({i,total,parts})=><div key={i} className="lx-stack-row"><span>第 {i+1} 题</span><div className="lx-stack">{parts.map(({st,n})=>n?<i key={st} style={{width:`${n/total*100}%`,background:stageColor[st]}} title={`${st} ${n}`}/>:null)}</div><small>{total}</small></div>)}</div>
   </section>

   <section className="lx-card">
    <header className="lx-card-head"><h3><GitMerge size={15}/>综合度与常见组合</h3></header>
    <div className="lx-cols">{s.tagCounts.map(({k,n})=><div key={k} className="lx-col"><span className="lx-col-bar"><i style={{height:`${n/Math.max(...s.tagCounts.map(x=>x.n))*100}%`}}/></span><b>{n}</b><small>{k} 个分类</small></div>)}</div>
    <p className="lx-note-p">{pct(s.multi,problems.length)}% 的题目同时涉及两个以上知识点，单一模板很少能直接套用。</p>
    <h4 className="lx-sub-h">最常同时出现的知识点</h4>
    <ol className="lx-pairs">{s.pairs.map((p,i)=><li key={i}><span>{p.a}</span><em>+</em><span>{p.b}</span><b>{p.n}</b></li>)}</ol>
   </section>

   <section className="lx-card">
    <header className="lx-card-head"><h3><FileInput size={15}/>输入方式变化</h3></header>
    <div className="lx-io">{s.io.map(r=><div key={r.y} className="lx-io-col" title={`${r.y}：文件 ${r.file} · 标准输入 ${r.std}`}><div className="lx-io-bar"><i className="is-std" style={{height:`${r.std/(r.std+r.file)*100}%`}}/><i className="is-file" style={{height:`${r.file/(r.std+r.file)*100}%`}}/></div><small>{String(r.y).slice(2)}</small></div>)}</div>
    <div className="lx-db-legend"><span><i style={{background:'#94a3b8'}}/>文件读写 xxx.in / xxx.out</span><span><i style={{background:'#4f46e5'}}/>标准输入输出</span></div>
    <p className="lx-note-p">2020 年 12 月起 USACO 改用标准输入输出。练习 2019 年及以前的经典题时，要用 <code>open()</code> 读写题目指定的文件（本站会自动提供该文件）。</p>
    <h4 className="lx-sub-h">分类依据</h4>
    <ul className="lx-legend-list">{s.review.map(r=><li key={r.k}><ShieldCheck size={13}/>{r.k}<b>{r.n}</b><small>{r.d}</small></li>)}</ul>
   </section>
  </div>

  <section className="lx-card lx-evidence">
   <header className="lx-card-head"><h3><BookOpen size={15}/>课程覆盖与学习顺序</h3></header>
   <p>Python 基础 {pythonCount} 节、算法方法 {algorithmCount} 节，共 {courseCount*3} 道递进练习。除具体算法，还训练复杂度判断、边界检查、Ad Hoc 观察、分类讨论、不变量、构造与反例验证。</p>
   <p>USACO Guide 的铜组目录包含模拟、完整枚举、递归、排序、集合与映射、分类讨论、贪心、图、矩形几何及 Ad Hoc，并明确说明目录不是穷尽列表。本站的课程分类是学习安排，不是官方封闭考纲或晋级保证。</p>
   <div className="lx-links"><a href="https://usaco.guide/bronze" target="_blank" rel="noreferrer">USACO Guide 铜组目录<ExternalLink size={12}/></a><a href="https://usaco.guide/bronze/ad-hoc" target="_blank" rel="noreferrer">Ad Hoc 训练方法<ExternalLink size={12}/></a><a href="https://usaco.org/current/data/sol_prob3_bronze_dec21.html" target="_blank" rel="noreferrer">Walking Home 官方题解<ExternalLink size={12}/></a></div>
  </section>

  <section className="lx-card lx-evidence">
   <header className="lx-card-head"><h3><ShieldCheck size={15}/>关于“铜组也考 DP”的核验</h3><span className="lx-tag lx-tag-amber">可选拓展，不推断必考</span></header>
   <div className="lx-dp-cases">
    <article><b>Moo Hunt · 2026 第二场</b><p>官方满分解法 1 是聚合计数后枚举；解法 2 复用较小状态的得分，属于状态复用/状态压缩 DP 的可选路线。GitHub 另有 SOS DP 实现。</p><div className="lx-links"><a href="https://usaco.org/current/data/sol_prob2_bronze_season26contest2.html" target="_blank" rel="noreferrer">官方解法 1 / 2<ExternalLink size={12}/></a><a href="https://github.com/ZhaLuc/USACO/blob/main/bronze/02_moo_hunt.cpp" target="_blank" rel="noreferrer">GitHub SOS DP 实现<ExternalLink size={12}/></a></div></article>
    <article><b>Walking Home · 2021 十二月</b><p>官方主解按转弯次数分类，枚举转弯位置。官方也提到 DP 方案，并将它列为超出当时铜、银组讨论范围的拓展；本站将 DP 标签改为可选，不据此推断必考。</p></article>
    <article><b>Printing Sequences · 2025 二月</b><p>官方主解采用重复块和分类枚举。区间 DP 是可行的教学拓展，本版不把它写成官方要求或唯一解法。</p><div className="lx-links"><a href="https://usaco.org/current/data/sol_prob3_bronze_feb25.html" target="_blank" rel="noreferrer">查看官方题解<ExternalLink size={12}/></a></div></article>
   </div>
  </section>

  <section className="lx-card">
   <header className="lx-card-head"><h3><FileText size={15}/>近期真题与归类依据</h3><span className="lx-tag">{audited.length} 题逐题核验</span></header>
   <div className="lx-audit">{audited.map(p=><div key={p.id} className="lx-audit-row"><div><button type="button" onClick={()=>onProblem(p.id)}>{p.title}</button><small>{p.roundLabel}</small></div><p>{p.analysis}</p><a href={p.editorial} target="_blank" rel="noreferrer">官方题解<ExternalLink size={12}/></a></div>)}</div>
  </section>

  <p className="lx-lib-note">题面与题解来源于 USACO 公开档案，本站非官方产品。全部 {statementReport.included} 道题使用提供的中英题面资料，可直接站内阅读，保留原文、公式与样例；其中 {statementReport.unofficialChinese} 道中文题面在资料中标为非官方译文。原有 99 题继续提供 Python 3 / C++ 参考实现及官方测试数据。新增的 2015 年 1、2 月 7 题目前提供全文与样例练习，参考讲解及完整官方测试尚未接入。学习分类按题意与参考解法整理，不等于官方规定的唯一解法。Python 使用本机 WebAssembly 练习环境，TLE 表示超过自定的本机限时；C++ 云端评测尚未接入。构造题使用语义校验器。</p>
 </div>;
}
