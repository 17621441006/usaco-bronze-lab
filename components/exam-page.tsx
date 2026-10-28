'use client';
import {useMemo,useState} from 'react';
import {Timer,Play,Square,ChevronRight,Check,ListChecks,Eye,EyeOff,FileCode2,Trophy,Clock3,RotateCcw,Lightbulb} from 'lucide-react';
import type {Problem,Attempt} from './practice-workspace';

const EXAM_SECONDS=4*3600;
const scoreOf=(a?:Attempt)=>{if(!a)return null;const m=a.detail.match(/(\d+)\/(\d+) 通过/);if(!m||!/完整|全部/.test(a.detail))return null;return +m[1]/Math.max(1,+m[2]);};

export function ExamPage({problems,rounds,examRound,setExamRound,examEnd,seconds,clock,latest,onStart,onEnd,onOpen}:{problems:Problem[];rounds:string[];examRound:string;setExamRound:(r:string)=>void;examEnd:number|null;seconds:number;clock:string;latest:Map<number,Attempt>;onStart:()=>void;onEnd:()=>void;onOpen:(id:number)=>void}){
 const [era,setEra]=useState<'recent'|'classic'>(()=>(problems.find(p=>p.roundLabel===examRound)?.year||2026)>=2020?'recent':'classic');
 const paper=problems.filter(p=>p.roundLabel===examRound).sort((a,b)=>a.id-b.id);
 const weight=1000/Math.max(1,paper.length);
 const live=!!examEnd&&seconds>0,expired=!!examEnd&&seconds===0;
 const roundsByYear=useMemo(()=>{
  const m=new Map<number,string[]>();
  rounds.forEach(r=>{const p=problems.find(x=>x.roundLabel===r)!;if((p.year>=2020)!==(era==='recent'))return;m.set(p.year,[...(m.get(p.year)||[]),r]);});
  return [...m.entries()].sort((a,b)=>b[0]-a[0]);
 },[rounds,problems,era]);
 const est=paper.map(p=>scoreOf(latest.get(p.id)));
 const total=Math.round(est.reduce<number>((s,v)=>s+(v||0)*weight,0));
 const elapsed=examEnd?EXAM_SECONDS-seconds:0;
 const ring=2*Math.PI*52,frac=examEnd?seconds/EXAM_SECONDS:1;
 const roundSolved=(r:string)=>{const ps=problems.filter(p=>p.roundLabel===r);return {n:ps.length,ac:ps.filter(p=>latest.get(p.id)?.status==='本次通过').length};};

 return <div className="lx-exam">
  <header className="lx-page-head">
   <div><span className="lx-kicker-light"><Timer size={13}/>模拟考试</span><h1>计时模拟训练</h1><p>按原场次组卷，还原铜组常规赛：4 小时、整场题目、无提示。首版提供计时自练与本机估分。</p></div>
  </header>

  {examEnd?<section className={`lx-live ${expired?'is-expired':''}`}>
   <div className="lx-live-clock">
    <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" className="track"/><circle cx="60" cy="60" r="52" className="val" strokeDasharray={ring} strokeDashoffset={ring*(1-frac)}/></svg>
    <div><b>{clock}</b><small>{expired?'时间到':'剩余时间'}</small></div>
   </div>
   <div className="lx-live-info">
    <span className="lx-live-badge">{expired?'训练已结束':'进行中'} · {examRound}</span>
    <h2>{expired?'时间到，停止提交并开始复盘':'专注做题，按自己的节奏分配时间'}</h2>
    <p>已用时 {Math.floor(elapsed/3600)} 小时 {Math.floor(elapsed/60)%60} 分。建议先通读全部题目，再从最有把握的一题开始；卡住超过 40 分钟就先拿部分分。</p>
    <div className="lx-live-actions"><button type="button" className="lx-btn lx-btn-primary" onClick={()=>paper[0]&&onOpen(paper[0].id)}><FileCode2 size={15}/>继续做题</button><button type="button" className="lx-btn lx-btn-outline" onClick={onEnd}><Square size={13}/>结束本次训练</button></div>
   </div>
   <div className="lx-live-score"><small>本机估分</small><b>{total}</b><span>/ 1000</span><p>按「提交评测」的通过比例折算</p></div>
  </section>:null}

  <div className="lx-exam-grid">
   <section className="lx-card lx-exam-setup">
    <header className="lx-card-head"><h3><ListChecks size={15}/>{live?'当前场次':'选择场次'}</h3>
     {!live&&<div className="lx-segmented lx-segmented-sm" role="tablist"><button type="button" role="tab" aria-selected={era==='recent'} onClick={()=>setEra('recent')}>2020 以来</button><button type="button" role="tab" aria-selected={era==='classic'} onClick={()=>setEra('classic')}>2015–2019</button></div>}
    </header>
    {!live&&<div className="lx-round-picker">{roundsByYear.map(([y,rs])=><div key={y} className="lx-rp-year"><span className="lx-rp-label">{y}</span><div className="lx-rp-items">{rs.map(r=>{const st=roundSolved(r);return <button type="button" key={r} className={`lx-rp ${r===examRound?'is-active':''}`} onClick={()=>setExamRound(r)}><b>{(()=>{const t=r.replace(String(y),'').replace(/^\s*[·/]?\s*/,'')||r;return /^\d+$/.test(t)?`${+t} 月`:t;})()}</b><span className="lx-rp-dots">{Array.from({length:st.n},(_,i)=><i key={i} className={i<st.ac?'is-ac':''}/>)}</span></button>;})}</div></div>)}</div>}
    <div className="lx-rules">
     <div><Clock3 size={16}/><b>4 小时</b><small>一次性完成整场</small></div>
     <div><Trophy size={16}/><b>1000 分</b><small>{paper.length} 题均分，按测试点给分</small></div>
     <div><EyeOff size={16}/><b>隐藏辅助</b><small>中文、标签、图解、提示</small></div>
     <div><FileCode2 size={16}/><b>Python 3</b><small>{paper[0]?.inputFile?`文件读写 ${paper[0].inputFile}`:'标准输入输出'}</small></div>
    </div>
    {!live&&<button type="button" className="lx-btn lx-btn-primary lx-btn-lg" onClick={onStart} disabled={!paper.length}><Play size={15}/>开始 {examRound} · 4 小时训练</button>}
    <p className="lx-note-p">计时和记录保存在本机。完整云端判题、官方计分规则与防泄题机制将在后续接入；晋级分数线以官方每场公布为准。</p>
   </section>

   <section className="lx-card lx-paper">
    <header className="lx-card-head"><h3><FileCode2 size={15}/>试卷 · {examRound}</h3><span className="lx-tag">{paper.length} 题 · 每题 {Math.round(weight)} 分</span></header>
    <ol className="lx-paper-list">{paper.map((p,i)=>{const a=latest.get(p.id),sc=est[i];return <li key={p.id}>
     <span className="lx-paper-no">{String.fromCharCode(65+i)}</span>
     <div className="lx-paper-main"><button type="button" onClick={()=>onOpen(p.id)}>{p.title}</button><small>{live?'考点标签已隐藏':`#${p.id} · ${p.testsTotal||'样例'} 组测试`}</small>
      <div className="lx-paper-bar"><i style={{width:`${(sc||0)*100}%`}}/></div></div>
     <div className="lx-paper-score">{sc!=null?<><b>{Math.round(sc*weight)}</b><small>/ {Math.round(weight)}</small></>:<small>{a?a.status:'未提交'}</small>}</div>
     <button type="button" className="lx-icon-btn" onClick={()=>onOpen(p.id)} aria-label={`打开 ${p.title}`}><ChevronRight size={16}/></button>
    </li>;})}</ol>
    <div className="lx-review-tips">
     <h4><Lightbulb size={14}/>复盘时关注什么</h4>
     <ul><li><Eye size={13}/>哪里读错了题？哪个条件漏看了？</li><li><RotateCcw size={13}/>为什么选这个算法？复杂度是否符合数据范围？</li><li><Check size={13}/>何时应该先拿部分分？最后一次提交是否经过检查？</li></ul>
    </div>
   </section>
  </div>
 </div>;
}
