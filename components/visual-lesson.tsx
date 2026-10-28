'use client';
import { useEffect, useState } from 'react';
import { Box, PanelTop, Sparkles } from 'lucide-react';
import { LearningScene, cheeseMoves, cheeseCount, type SceneKind } from './learning-scene';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {farmFrame,isStoryKind} from '@/lib/farm-scenarios';
import {FarmDiagram} from './farm-diagram';
import {FenceMethods} from './fence-methods';
import {SceneZoomControls} from './scene-zoom-controls';
import {LessonTransport,type PlaybackSpeed} from './lesson-transport';
export function VisualLesson({kind='fence',compact=false,steps,lessonId,onStepChange}:{kind:SceneKind,compact?:boolean,steps?:readonly string[],lessonId?:string,onStepChange?:(step:number)=>void}){
 const [step,setStep]=useState(0),[play,setPlay]=useState(false),[view,setView]=useState('3d'),[flatZoom,setFlatZoom]=useState(1),[speed,setSpeed]=useState<PlaybackSpeed>(1);
 const [interval,setIntervalValue]=useState([7,10,4,8]);const [mask,setMask]=useState(17);
 const defaults:Record<string,string[]>={fence:['先观察两段区间。','FJ 涂色：蓝色部分。','Bessie 涂色：赭色部分。','紫色是重叠区域，总长度只计算一次。'],cheese:['初始奶酪，没有通道。','移除 (0,0,0)。','移除 (1,1,1)。','移除 (0,1,0)，出现第一条通道。','移除 (1,0,0)，总共 2 条通道。','移除 (1,1,0)，总共 5 条通道。'],reflection:['示意画布：不是官方样例。','高亮四个镜像位置。','这四格必须统一颜色。','只更新受影响的一组。'],printing:['教学序列：6 个输出。','它由同一个块重复两次。','程序只需两条 PRINT 语句。'],moo:['官方样例中的 5 个格子。','点击格子，切换 M/O。','重复三元组也计入分数。','枚举 32 种棋盘，最大分是 4，共 2 种棋盘达到。'],array:['观察数据。','访问第二个元素。','继续向后处理。','关注变量如何变化。'],dp:['dp[0]=1','dp[1]=1','dp[2]=2','dp[3]=3','dp[4]=5','dp[5]=8','dp[6]=13'],binary:['比较 4 和 7。','比较 9 和 7。','找到 7。']};
 const lines=steps||defaults[kind]||defaults.array;
 const story=isStoryKind(kind)?farmFrame(kind,step):null;
 const context:Record<string,[string,string]>={fence:['FJ 和 Bessie 给栅栏涂色','蓝色属于 FJ，橙色属于 Bessie；紫色是两人都涂过的单位区间。'],cheese:['FJ 移除奶酪，Bessie 寻找贯穿的通道','每块是 1×1×1 奶酪；半透明表示已移除，青色细线表示整条已空。'],reflection:['修复 FJ 的对称画布','四个镜像位置必须同色。本组原有 3 格涂色、1 格空白，只需补涂 1 格。'],printing:['FJ 编写打印程序，Bessie 检查输出','每格是一次输出的数字；相同底色框表示相同的重复块。'],moo:['FJ 设置棋盘，Bessie 检查 MOO','字母是格子的状态，下面的数字是位置；按给定三元组的顺序读到 MOO 才得分。'],array:['Bessie 依次查看 FJ 的牛槽','槽内每捆草料表示 1 份，数字是总份数；a[i] 是下标为 i 的槽。'],dp:['Bessie 走台阶','阶数是位置，dp[i] 是到第 i 阶的不同走法数；每次可以走 1 或 2 阶。'],binary:['Bessie 寻找容量为 7 的牛槽','标签是容量（升），已从小到大排序；橙色槽是当前比较对象。']};
 const brief=story?[story.title,story.unit+(kind==='buckets'?' 桶的正面剖开，显示当前液面。':'')]:context[kind];
 const legend=kind==='fence'?[['FJ','#3b82f6'],['Bessie','#f59e0b'],['共同涂色','#8b5cf6']]:story?[['原始数据','#94a3b8'],['当前关注','#f59e0b'],['已完成','#10b981']]:[];
 useEffect(()=>{setStep(0);setPlay(false);},[kind]);
 useEffect(()=>{onStepChange?.(step);},[step,onStepChange]);
 useEffect(()=>{if(!play)return;const t=window.setInterval(()=>setStep(s=>{if(s>=lines.length-1){setPlay(false);return s;}return s+1;}),Math.round(1500/speed));return()=>clearInterval(t);},[play,lines.length,speed]);
 const [a,b,c,d]=interval,overlap=Math.max(0,Math.min(b,d)-Math.max(a,c));
 const triples=[[1,2,3],[1,2,3],[1,3,5],[2,3,4],[5,3,2],[5,2,3]];
 const score=triples.filter(([x,y,z])=>((mask>>(x-1))&1)&&!((mask>>(y-1))&1)&&!((mask>>(z-1))&1)).length;
 const caption=kind==='fence'?(step===0?`FJ [${a}, ${b}] · Bessie [${c}, ${d}]`:step===1?`FJ 涂色 ${b-a} 个单位长度。`:step===2?`Bessie 涂色 ${d-c} 个单位长度。`: `${b-a} + ${d-c} − ${overlap} = ${b-a+d-c-overlap}，重叠只计算一次。`):lines[Math.min(step,lines.length-1)];
 const facts=kind==='array'?[`当前 a[${Math.min(step,5)}] = ${[4,2,7,1,3,5][Math.min(step,5)]}`,...(lessonId==='loops'?[`累计 total = ${[4,6,13,14,17,22][Math.min(step,5)]}`]:[])]:story?story.facts:[];
 const flat=<div className="lx-flat"><SceneZoomControls zoom={flatZoom} onChange={setFlatZoom} onFit={()=>setFlatZoom(1)}/><div className="lx-flat-zoom" style={{transform:`scale(${flatZoom})`}}>{story&&isStoryKind(kind)?<div className="story-flat"><FarmDiagram kind={kind} step={step}/></div>:kind==='fence'?<svg viewBox="0 0 720 230" role="img" aria-label="FJ 与 Bessie 涂色的数轴图"><line x1="50" y1="176" x2="670" y2="176" stroke="#94a3b8" strokeWidth="2"/>{Array.from({length:13},(_,i)=><g key={i}><line x1={50+i*51.6} x2={50+i*51.6} y1="172" y2="181" stroke="#64748b"/><text x={50+i*51.6} y="205" textAnchor="middle" fontSize="15" fontWeight="500" fill="#334155">{i}</text></g>)}<rect x={50+a*51.6} width={(b-a)*51.6} y="45" height="35" rx="6" fill={step>=1?'#3b82f6':'#e2e8f0'}/><text x="40" y="68" textAnchor="end" fontSize="15" fontWeight="600" fill="#1d4ed8">FJ</text><rect x={50+c*51.6} width={(d-c)*51.6} y="98" height="35" rx="6" fill={step>=2?'#f59e0b':'#e2e8f0'}/><text x="40" y="122" textAnchor="end" fontSize="14" fontWeight="600" fill="#b45309">牛</text>{step>=3&&overlap>0&&<rect x={50+Math.max(a,c)*51.6} width={overlap*51.6} y="145" height="16" rx="4" fill="#8b5cf6"/>}</svg>:kind==='cheese'?<div><div className="cheese-layers">{[0,1].map(z=><div key={z}><p>z = {z}</p><div className="layer-grid">{[0,1].flatMap(y=>[0,1].map(x=><span key={`${x}${y}`} className={cheeseMoves.slice(0,step).some(p=>p[0]===x&&p[1]===y&&p[2]===z)?'removed':''}>{x},{y},{z}</span>))}</div></div>)}</div><p>空通道：{cheeseCount(step)}</p></div>:kind==='moo'?<div className="lx-cells">{Array.from({length:5},(_,i)=><span key={i}>{((mask>>i)&1)?'M':'O'}<small>{i+1}</small></span>)}</div>:kind==='reflection'?<div className="reflection-grid">{Array.from({length:16},(_,i)=><span key={i} className={(Math.floor(i/4)===0||Math.floor(i/4)===3)&&(i%4===1||i%4===2)&&step>0?'selected':''}>{step>=3&&i===1?'#':['..#.','..#.','#..#','####'][Math.floor(i/4)][i%4]}</span>)}</div>:<div className="lx-cells">{(kind==='dp'?[1,1,2,3,5,8,13]:kind==='printing'?[1,1,2,1,1,2]:kind==='binary'?[1,3,4,7,9,12]:[4,2,7,1,3,5]).map((v,i)=><span key={i} className={i===(kind==='binary'?[2,4,3][step%3]:step)?'is-current':i<step&&kind!=='binary'?'is-done':''}>{kind==='dp'&&i>step?'?':v}<small>{kind==='dp'?'dp':'a'}[{i}]</small></span>)}</div>}</div></div>;
 return <div className={'lx-stage '+(compact?'is-compact':'')}>
  {!compact&&brief&&<header className="lx-stage-head">
   <div className="lx-stage-title"><span className="lx-eyebrow">{view==='3d'?<Box size={13}/>:<PanelTop size={13}/>}{view==='3d'?'三维情境演示':'二维示意'}</span><h3>{brief[0]}</h3><p>{brief[1]}</p></div>
   {legend.length>0&&<div className="lx-legend">{legend.map(([name,color])=><span key={name}><i style={{background:color}}/>{name}</span>)}</div>}
  </header>}
  <div className="lx-viewport">
   <div className="lx-seg" role="tablist" aria-label="演示维度">
    <button type="button" role="tab" aria-selected={view==='3d'} onClick={()=>setView('3d')}><Box size={13}/>3D</button>
    <button type="button" role="tab" aria-selected={view==='2d'} onClick={()=>setView('2d')}><PanelTop size={13}/>2D</button>
   </div>
   {view==='3d'?<LearningScene kind={kind} step={step} interval={interval} boardMask={mask} onUnavailable={()=>setView('2d')}/>:flat}
   {facts.length>0&&<div className="lx-facts" aria-live="polite">{facts.map(f=><b key={f}>{f}</b>)}</div>}
  </div>
  <p className="lx-caption" aria-live="polite"><span className="lx-caption-step">步骤 {step+1}</span><Sparkles size={14}/><span>{caption}</span></p>
  <LessonTransport step={step} total={lines.length} playing={play} speed={speed} labels={lines} onStep={s=>{setPlay(false);setStep(s);}} onTogglePlay={()=>{if(step===lines.length-1)setStep(0);setPlay(!play);}} onReset={()=>{setStep(0);setPlay(false);setIntervalValue([7,10,4,8]);setMask(17);}} onSpeed={setSpeed}/>
  {kind==='fence'&&!compact&&<div className="lx-interval"><div><label>FJ 区间 [{a}, {b}]</label><Slider min={0} max={12} step={1} value={[a,b]} minStepsBetweenThumbs={1} onValueChange={v=>{setIntervalValue([v[0],v[1],c,d]);setStep(3);}}/></div><div><label>Bessie 区间 [{c}, {d}]</label><Slider min={0} max={12} step={1} value={[c,d]} minStepsBetweenThumbs={1} onValueChange={v=>{setIntervalValue([a,b,v[0],v[1]]);setStep(3);}}/></div></div>}
  {kind==='fence'&&!compact&&<FenceMethods interval={interval} step={step}/>}
  {kind==='moo'&&<div className="lx-moo"><div>{Array.from({length:5},(_,i)=><Button key={i} variant="outline" onClick={()=>setMask(mask^(1<<i))} aria-label={`切换第 ${i+1} 格`}>{(mask>>i)&1?'M':'O'}</Button>)}</div><p>当前棋盘得分 <b>{score}</b> / 6 · 样例最优 4 分</p></div>}
 </div>;
}
