'use client';
import {useEffect,useMemo,useState} from 'react';
import {BookOpen,Search,Library,Layers,Timer,Check,ChevronRight,ChevronLeft,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Empty} from '@/components/ui/empty';
import {Choice,type Problem} from './practice-workspace';
import topics from '@/data/learning-topics.json';
import {defaultArchiveFilters,filterProblems,inPeriod,topicMatches,stages,type ArchiveFilters,type ArchivePeriod} from '@/lib/problem-library';
export type LibraryRequest={topic:string;period:ArchivePeriod;nonce:number};
export function ProblemLibrary({problems,request,onOpen,onLesson,onRound,statusById}:{problems:Problem[];request?:LibraryRequest;onOpen:(id:number)=>void;onLesson:(id:string)=>void;onRound:(round:string)=>void;statusById?:Record<number,string>}){
 const [filters,setFilters]=useState<ArchiveFilters>(defaultArchiveFilters),[view,setView]=useState('topics'),[page,setPage]=useState(1);
 useEffect(()=>{if(request){setFilters({...defaultArchiveFilters,period:request.period,topic:request.topic,order:'learning'});setView('topics');}},[request]);
 useEffect(()=>{setPage(1);},[filters,view]);
 const recent=problems.filter(p=>p.year>=2020),classic=problems.filter(p=>p.year<2020),querying=!!filters.query.trim(),period=querying?'all':filters.period;
 const topic=topics.find(t=>t.id===filters.topic);
 const filtered=useMemo(()=>filterProblems(problems,view==='rounds'?{...filters,topic:'all',stage:'all',order:'newest'}:filters),[problems,filters,view]);
 const rounds=[...new Set(filtered.map(p=>p.roundLabel))],years=[...new Set(problems.filter(p=>inPeriod(p,period)).map(p=>p.year))].sort((a,b)=>b-a);
 const size=view==='topics'?12:6,count=view==='topics'?filtered.length:rounds.length,totalPages=Math.max(1,Math.ceil(count/size)),safePage=Math.min(page,totalPages);
 const shown=filtered.slice((safePage-1)*size,safePage*size),shownRounds=rounds.slice((safePage-1)*size,safePage*size);
 function changePeriod(value:string){setFilters(f=>({...f,period:value as ArchivePeriod,query:'',year:'all'}));}
 function chooseTopic(id:string){setFilters(f=>({...f,topic:f.topic===id?'all':id,query:'',year:'all',stage:'all',order:'learning',period:f.period==='recent'&&!recent.some(p=>topicMatches(p,id))?'all':f.period}));}
 function reset(){setFilters(defaultArchiveFilters);setView('topics');}
  const stageTone=(s?:string)=>!s?'':/挑战|综合/.test(s)?'is-hard':/巩固|进阶|提升/.test(s)?'is-mid':'is-easy';
  const statusOf=(id:number)=>statusById?.[id];
  return <div className="lx-lib">
  <header className="lx-lib-head">
   <div>
    <h1>真题练习</h1>
    <p><span>近年 <b>{recent.length}</b> 题</span><span>经典 <b>{classic.length}</b> 题</span><span><BookOpen size={13}/>{problems.filter(p=>p.statementAvailable).length} 题中英全文</span></p>
   </div>
   <label className="lx-search"><Search size={16}/><input value={filters.query} placeholder={`搜索全部 ${problems.length} 题：题名或编号`} aria-label="搜索全部题目" onChange={e=>{const query=e.target.value;setFilters(f=>({...f,query,...(query.trim()?{topic:'all',year:'all',stage:'all'}:{})}));}}/></label>
  </header>

  <div className="lx-lib-toolbar">
   <div className="lx-segmented" role="tablist" aria-label="选题方式">
    <button type="button" role="tab" aria-selected={view==='topics'} onClick={()=>setView('topics')}><Layers size={14}/>按知识点练</button>
    <button type="button" role="tab" aria-selected={view==='rounds'} onClick={()=>setView('rounds')}><Timer size={14}/>按场次练</button>
   </div>
   <div className="lx-segmented lx-segmented-soft" role="tablist" aria-label="题目年份范围">
    {([['recent','2020 年以来',recent.length],['classic','2015–2019 经典',classic.length],['all','全部题目',problems.length]] as const).map(([v,label,n])=><button key={v} type="button" role="tab" aria-selected={period===v} onClick={()=>changePeriod(v)}>{label}<small>{n}</small></button>)}
   </div>
  </div>

  {view==='topics'&&<>
   <div className="lx-topics" aria-label="全部知识点分类">{topics.map(t=>{const all=problems.filter(p=>topicMatches(p,t.id)),newer=all.filter(p=>p.year>=2020);return <button type="button" key={t.id} className={`lx-topic ${filters.topic===t.id?'is-active':''}`} aria-pressed={filters.topic===t.id} onClick={()=>chooseTopic(t.id)}><span>{t.label}</span><small><b>{newer.length}</b> 近年 · {all.length} 全部</small></button>;})}</div>
   {topic&&<div className="lx-topic-guide"><div><b>{topic.label}</b><p>{topic.description}{topic.id==='dp'?' 本分类包含主解与可选拓展，题目中会分别标注。':''}</p></div>{topic.lesson&&<button type="button" className="lx-btn lx-btn-outline lx-btn-sm" onClick={()=>onLesson(topic.lesson!)}>复习先修课</button>}<button type="button" className="lx-btn lx-btn-ghost lx-btn-sm" onClick={()=>setFilters(f=>({...f,topic:'all'}))}>全部分类</button></div>}
  </>}

  <div className="lx-filters">
   <div className="lx-filter-selects"><Choice value={filters.year} onChange={year=>setFilters(f=>({...f,year}))} label="比赛年份" options={[{value:'all',label:'全部年份'},...years.map(y=>({value:String(y),label:`${y} 年`}))]}/>{view==='topics'&&<><Choice value={filters.stage} onChange={stage=>setFilters(f=>({...f,stage}))} label="练习阶段" options={[{value:'all',label:'全部阶段'},...stages.map(s=>({value:s,label:s}))]}/><Choice value={filters.order} onChange={order=>setFilters(f=>({...f,order}))} label="题目排序" options={[{value:'newest',label:'最新场次优先'},{value:'learning',label:'由基础到挑战'}]}/></>}</div>
   <span className="lx-filter-count">{querying?'全库搜索 · ':''}{view==='topics'?<><b>{filtered.length}</b> 道题</>:<><b>{rounds.length}</b> 场 · {filtered.length} 题</>}{period==='classic'?' · 中英题面站内阅读':''}</span>
  </div>

  {view==='topics'?<div className="lx-plist" role="list">
   <div className="lx-plist-head" aria-hidden="true"><span>题目</span><span>场次</span><span>学习分类</span><span>练习阶段</span><span/></div>
   {shown.map(p=>{const st=statusOf(p.id);return <div role="listitem" key={p.id} className="lx-prow">
    <div className="lx-prow-main">
     <span className={`lx-pstatus ${st==='本次通过'?'is-ac':st==='待复习'?'is-review':st?'is-tried':''}`} title={st||'未开始'}>{st==='本次通过'?<Check size={12}/>:st==='待复习'?<RotateCcw size={11}/>:null}</span>
     <div className="lx-prow-title"><button type="button" onClick={()=>onOpen(p.id)}>{p.title}</button><span>#{p.id}{p.zhTitle!==p.title?' · '+p.zhTitle:''}</span><small>{p.statementAvailable?'中英题面 · 站内阅读':'经典题 · 官网阅读'} · {p.testsTotal>0?`${p.testsTotal} 组测试`:'样例练习'}</small></div>
    </div>
    <span className="lx-prow-round">{p.roundLabel}</span>
    <div className="lx-prow-tags">{(p.learningTopics||[]).slice(0,3).map(id=><button type="button" key={id} onClick={()=>chooseTopic(id)}>{topics.find(t=>t.id===id)?.label}</button>)}{p.optionalTopics?.includes('dp')&&<span className="is-optional">DP · 可选拓展</span>}</div>
    <span className={`lx-stage-badge ${stageTone(p.practiceStage)}`}>{p.practiceStage}</span>
    <button type="button" className="lx-btn lx-btn-outline lx-btn-sm lx-prow-open" onClick={()=>onOpen(p.id)}>读题<ChevronRight size={14}/></button>
   </div>;})}
  </div>:<>
   <p className="lx-rounds-note">按完整场次练习，不预先展示考点；进入计时训练后隐藏讲解和提示。</p>
   <div className="lx-rounds">{shownRounds.map(round=>{const paper=problems.filter(p=>p.roundLabel===round).sort((a,b)=>a.id-b.id);return <article key={round} className="lx-round">
    <header><div><h2>{round}</h2><p>Bronze · 常规赛 · {paper.length} 题</p></div><button type="button" className="lx-btn lx-btn-primary lx-btn-sm" onClick={()=>onRound(round)}><Timer size={13}/>整场训练</button></header>
    <ol>{paper.map((p,i)=>{const st=statusOf(p.id);return <li key={p.id}><span className="lx-round-no">{i+1}</span><button type="button" onClick={()=>onOpen(p.id)}>{p.title}</button>{st==='本次通过'?<Check size={14} className="is-ac"/>:<ChevronRight size={14}/>}</li>;})}</ol>
    <small>{paper.every(p=>p.statementAvailable)?'中英题面均可站内阅读':'经典场次 · 官网题面'}</small>
   </article>;})}</div>
  </>}
  {!count&&<Empty className="empty-state"><Library size={28}/><h3>当前筛选下没有题目</h3><p>可以切换到全部年份，或清除筛选重新选择。</p><Button variant="outline" onClick={reset}>清除筛选</Button></Empty>}
  {totalPages>1&&<nav className="lx-pages" aria-label="分页"><button type="button" className="lx-icon-btn" disabled={safePage===1} onClick={()=>setPage(Math.max(1,safePage-1))} aria-label="上一页"><ChevronLeft size={15}/></button>{Array.from({length:totalPages},(_,i)=><button type="button" key={i} className={`lx-page-no ${safePage===i+1?'is-active':''}`} aria-current={safePage===i+1?'page':undefined} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button type="button" className="lx-icon-btn" disabled={safePage===totalPages} onClick={()=>setPage(Math.min(totalPages,safePage+1))} aria-label="下一页"><ChevronRight size={15}/></button></nav>}
  <p className="lx-lib-note">练习阶段与学习分类由本站整理，不是官方难度评级。新增 2015 年 1、2 月题目按题意初步归类。多标签题会出现在多个分类中；US Open 不在当前范围内。</p>
  </div>;
}
