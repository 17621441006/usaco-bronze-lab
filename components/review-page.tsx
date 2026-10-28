'use client';
import {useState} from 'react';
import {BookMarked,RotateCcw,Check,Play,History,NotebookPen,ChevronRight} from 'lucide-react';
import type {Problem,Attempt} from './practice-workspace';

type Tab='wrong'|'notes'|'history';
export function ReviewPage({problems,attempts,wrong,onOpen}:{problems:Problem[];attempts:Attempt[];wrong:Attempt[];onOpen:(id:number)=>void}){
 const [tab,setTab]=useState<Tab>('wrong');
 const [notes]=useState(()=>{if(typeof window==='undefined')return [] as {p:Problem;text:string}[];return problems.map(p=>({p,text:localStorage.getItem(`usaco-note-${p.id}`)||''})).filter(x=>x.text.trim());});
 const solved=new Set(attempts.filter(a=>a.status==='本次通过'&&/完整|全部/.test(a.detail)).map(a=>a.id));
 const touched=new Set(attempts.map(a=>a.id));
 const statusClass=(s:string)=>s==='本次通过'?'is-ac':s==='待复习'?'is-review':'is-run';
 return <div className="lx-review">
  <header className="lx-page-head"><div><span className="lx-kicker-light"><BookMarked size={13}/>训练与复盘</span><h1>错题与笔记</h1><p>这里显示当前浏览器的运行记录。通过样例不等于已经独立掌握，建议隔几天再重做一遍。</p></div></header>
  <section className="lx-kpis lx-kpis-4">
   <div className="lx-kpi"><b>{touched.size}</b><span>做过的题</span><small>共 {problems.length} 题</small></div>
   <div className="lx-kpi is-green"><b>{solved.size}</b><span>完整评测通过</span><small>{touched.size?Math.round(solved.size/touched.size*100):0}% 的已做题</small></div>
   <div className="lx-kpi is-amber"><b>{wrong.length}</b><span>待复习</span><small>最近一次运行未通过</small></div>
   <div className="lx-kpi"><b>{notes.length}</b><span>篇笔记</span><small>保存在本机</small></div>
  </section>
  <div className="lx-segmented" role="tablist">
   <button type="button" role="tab" aria-selected={tab==='wrong'} onClick={()=>setTab('wrong')}><RotateCcw size={14}/>待复习<small>{wrong.length}</small></button>
   <button type="button" role="tab" aria-selected={tab==='notes'} onClick={()=>setTab('notes')}><NotebookPen size={14}/>我的笔记<small>{notes.length}</small></button>
   <button type="button" role="tab" aria-selected={tab==='history'} onClick={()=>setTab('history')}><History size={14}/>全部运行<small>{attempts.length}</small></button>
  </div>
  {tab==='wrong'&&(wrong.length?<div className="lx-rlist">{wrong.map(a=><div key={a.id} className="lx-rrow"><span className="lx-pstatus is-review"><RotateCcw size={11}/></span><div className="lx-rrow-main"><button type="button" onClick={()=>onOpen(a.id)}>{a.title}</button><p>{a.detail}</p><small>{new Date(a.date).toLocaleString('zh-CN')}</small></div><button type="button" className="lx-btn lx-btn-primary lx-btn-sm" onClick={()=>onOpen(a.id)}><Play size={13}/>重新尝试</button></div>)}</div>
   :<div className="lx-empty"><span><Check size={22}/></span><h3>暂无待复习题目</h3><p>运行中出现的错误会记录在这里，之后可以返回题目修改并重练。</p><button type="button" className="lx-btn lx-btn-primary" onClick={()=>onOpen(987)}>练习 Word Processor</button></div>)}
  {tab==='notes'&&(notes.length?<div className="lx-note-cards">{notes.map(({p,text})=><article key={p.id} className="lx-card lx-note-card"><header><div><b>{p.title}</b><small>{p.roundLabel}</small></div><button type="button" className="lx-icon-btn" onClick={()=>onOpen(p.id)} aria-label="打开题目"><ChevronRight size={16}/></button></header><p>{text}</p></article>)}</div>
   :<div className="lx-empty"><span><NotebookPen size={22}/></span><h3>还没有笔记</h3><p>在做题页的「笔记」标签里写下：卡在哪里、为什么错、下次怎么识别。</p></div>)}
  {tab==='history'&&(attempts.length?<div className="lx-rlist">{attempts.map((a,i)=><div key={i} className="lx-rrow"><span className={`lx-pstatus ${statusClass(a.status)}`}>{a.status==='本次通过'?<Check size={12}/>:a.status==='待复习'?<RotateCcw size={11}/>:null}</span><div className="lx-rrow-main"><button type="button" onClick={()=>onOpen(a.id)}>{a.title}</button><p>{a.status} · {a.detail}</p><small>{new Date(a.date).toLocaleString('zh-CN')}</small></div><button type="button" className="lx-btn lx-btn-outline lx-btn-sm" onClick={()=>onOpen(a.id)}>打开题目</button></div>)}</div>
   :<div className="lx-empty"><span><History size={22}/></span><h3>还没有运行记录</h3><p>在任意题目中运行或评测代码后，记录会出现在这里。</p></div>)}
 </div>;
}
