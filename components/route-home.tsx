'use client';
import {Fragment} from 'react';
import {ArrowRight,BookOpen,Check,ChevronRight,Code2,Library,LockKeyhole,Play,Timer,BookMarked,Flag} from 'lucide-react';
import {pythonLessons,algorithmLessons} from '@/data/course-lessons';

export type RouteModule={num:string;name:string;sub:string;desc:string;lesson:string;level:string;ids:number[]};

/** Algorithm lessons that belong to each route stage (01 = all Python lessons, 08 = contest practice). */
const stageLessons:Record<string,string[]>={
 '02':['complexity','simulation','enumeration','interval'],
 '03':['sorting','counting'],
 '04':['adhoc','greedy'],
 '05':['geometry','prefix','recursion','graphs'],
 '06':['grid','symmetry','printing','bitmask'],
 '07':['binary','dp'],
};

const divisions=[
 {name:'Bronze',zh:'铜组',state:'current'},
 {name:'Silver',zh:'银组',state:'next'},
 {name:'Gold',zh:'金组',state:'locked'},
 {name:'Platinum',zh:'铂金组',state:'locked'},
] as const;

function lessonIdsFor(num:string){
 if(num==='01')return pythonLessons.map(l=>l.id);
 return stageLessons[num]||[];
}

export function RouteHome({modules,done,courseCount,problemCount,wrongCount,attemptCount,onLesson,onProblem,onGo}:{modules:RouteModule[];done:string[];courseCount:number;problemCount:number;wrongCount:number;attemptCount:number;onLesson:(id:string)=>void;onProblem:(id:number)=>void;onGo:(page:string)=>void}){
 const stages=modules.map(m=>{
  const ids=lessonIdsFor(m.num),finished=ids.filter(id=>done.includes(id)).length;
  const pct=ids.length?Math.round(finished/ids.length*100):0;
  return {...m,ids:m.ids,lessonIds:ids,finished,total:ids.length,pct};
 });
 const currentIndex=Math.max(0,stages.findIndex(s=>s.total===0||s.finished<s.total));
 const current=stages[currentIndex];
 const allLessons=[...pythonLessons,...algorithmLessons];
 const nextLesson=allLessons.find(l=>current.lessonIds.includes(l.id)&&!done.includes(l.id))||allLessons.find(l=>!done.includes(l.id));
 const overall=courseCount?Math.round(done.length/courseCount*100):0;
 const ring=2*Math.PI*44;
 const isPython=nextLesson?pythonLessons.some(l=>l.id===nextLesson.id):false;
 const lessonList=isPython?pythonLessons:algorithmLessons;
 const lessonIndex=nextLesson?lessonList.findIndex(l=>l.id===nextLesson.id):-1;

 return <div className="lx-home">
  <section className="lx-home-hero" aria-label="继续学习">
   <div className="lx-continue">
    <div className="lx-continue-copy">
     <span className="lx-kicker"><Flag size={13}/>当前阶段 · {current.num} {current.name}</span>
     <h1>{nextLesson?nextLesson.title:'全部课程已完成'}</h1>
     <p>{nextLesson?nextLesson.desc:'进入真题与模考，把课堂方法迁移到陌生题目中。'}</p>
     <div className="lx-continue-meta">
      {nextLesson&&<span>{isPython?'Python 基础':'算法课堂'} · 第 {lessonIndex+1} / {lessonList.length} 课</span>}
      {nextLesson&&<span>约 {nextLesson.minutes} 分钟 · 3 道随堂练习</span>}
     </div>
     <div className="lx-continue-actions">
      <button type="button" className="lx-btn lx-btn-light" onClick={()=>nextLesson?onLesson(nextLesson.id):onGo('exam')}><Play size={15}/>{nextLesson?(done.length?'继续学习':'开始第一课'):'进入模拟考试'}</button>
      <button type="button" className="lx-btn lx-btn-ghost-dark" onClick={()=>onProblem(current.ids[0])}>对应真题<ArrowRight size={15}/></button>
     </div>
    </div>
    <div className="lx-continue-code" aria-hidden="true">
     <div className="lx-mini-window">
      <div className="lx-mini-bar"><i/><i/><i/><span>solution.py</span></div>
      <pre><code><b className="k">import</b> sys{'\n'}n = <b className="f">int</b>(<b className="f">input</b>()){'\n'}a = <b className="f">list</b>(<b className="f">map</b>(<b className="f">int</b>, <b className="f">input</b>().split())){'\n'}{'\n'}best = <b className="n">0</b>{'\n'}<b className="k">for</b> x <b className="k">in</b> <b className="f">sorted</b>(a):{'\n'}    best = <b className="f">max</b>(best, x){'\n'}<b className="f">print</b>(best)</code></pre>
     </div>
    </div>
   </div>

   <aside className="lx-progress-card" aria-label="学习进度">
    <div className="lx-ring-row">
     <svg viewBox="0 0 100 100" className="lx-ring" role="img" aria-label={`课程完成 ${overall}%`}>
      <circle cx="50" cy="50" r="44" className="track"/>
      <circle cx="50" cy="50" r="44" className="value" strokeDasharray={ring} strokeDashoffset={ring*(1-overall/100)}/>
      <text x="50" y="48" textAnchor="middle" className="pct">{overall}%</text>
      <text x="50" y="64" textAnchor="middle" className="cap">课程完成</text>
     </svg>
     <dl className="lx-stats">
      <div><dt>已学课时</dt><dd>{done.length}<small>/{courseCount}</small></dd></div>
      <div><dt>收录真题</dt><dd>{problemCount}</dd></div>
      <div><dt>运行记录</dt><dd>{attemptCount}</dd></div>
      <div className={wrongCount?'is-warn':''}><dt>待复习</dt><dd>{wrongCount}</dd></div>
     </dl>
    </div>
    <div className="lx-ladder" aria-label="段位路线">
     {divisions.map((d,i)=><Fragment key={d.name}>
      <div className={`lx-rung is-${d.state}`}>
       <span className="lx-rung-dot">{d.state==='current'?<Check size={11}/>:d.state==='locked'?<LockKeyhole size={10}/>:null}</span>
       <b>{d.name}</b><small>{d.state==='current'?'当前训练':'规划中'}</small>
      </div>
      {i<divisions.length-1&&<span className="lx-rung-line"/>}
     </Fragment>)}
    </div>
    <div className="lx-quick">
     <button type="button" onClick={()=>onGo('library')}><Library size={15}/>真题练习</button>
     <button type="button" onClick={()=>onGo('exam')}><Timer size={15}/>模拟考试</button>
     <button type="button" onClick={()=>onGo('review')}><BookMarked size={15}/>错题复盘</button>
    </div>
   </aside>
  </section>

  <section className="lx-route" aria-labelledby="lx-route-title">
   <header className="lx-section-head">
    <div>
     <h2 id="lx-route-title">学习路线</h2>
     <p>八个阶段，从 Python 必要基础到真题冲刺。每一站都有课堂、随堂练习和对应真题。</p>
    </div>
    <div className="lx-section-actions">
     <button type="button" className="lx-btn lx-btn-outline" onClick={()=>onGo('library')}><Library size={15}/>打开题库</button>
     <button type="button" className="lx-btn lx-btn-primary" onClick={()=>onLesson('types')}><Code2 size={15}/>Python 基础</button>
    </div>
   </header>

   <ol className="lx-stations">
    {stages.map((s,i)=>{
     const state=i<currentIndex||(s.total>0&&s.finished===s.total)?'done':i===currentIndex?'current':'todo';
     return <li key={s.num} className={`lx-station is-${state}`}>
      <div className="lx-station-rail" aria-hidden="true"><span className="lx-node">{state==='done'?<Check size={14}/>:s.num}</span></div>
      <article className="lx-station-card">
       <header>
        <span className="lx-level">{s.level}</span>
        {state==='current'&&<span className="lx-now">进行中</span>}
       </header>
       <h3>{s.name}</h3>
       <p>{s.desc}</p>
       <ul className="lx-chips">{s.sub.split(' · ').map(t=><li key={t}>{t}</li>)}</ul>
       <div className="lx-station-progress">
        {s.total>0?<><div className="lx-bar"><i style={{width:`${s.pct}%`}}/></div><span>{s.finished}/{s.total} 课</span></>:<span className="lx-muted">真题 · 限时 · 复盘</span>}
       </div>
       <footer>
        <button type="button" className="lx-link" onClick={()=>onLesson(s.lesson)}>进入学习<ChevronRight size={15}/></button>
        <button type="button" className="lx-link lx-link-muted" onClick={()=>onProblem(s.ids[0])}>对应真题</button>
       </footer>
      </article>
     </li>;
    })}
   </ol>
  </section>

  <section className="lx-coverage">
   <span className="lx-coverage-icon"><BookOpen size={18}/></span>
   <div>
    <b>课程覆盖范围</b>
    <p>模拟、枚举、Ad Hoc、贪心与建模同样重要。二分和 DP 单列为衔接；完整训练仍要包含陌生题、证明与复盘。</p>
   </div>
   <button type="button" className="lx-btn lx-btn-outline" onClick={()=>onGo('sources')}>查看依据</button>
  </section>
 </div>;
}
