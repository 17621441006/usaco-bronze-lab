'use client';
import {Play,Pause,RotateCcw,ChevronLeft,ChevronRight} from 'lucide-react';

export type PlaybackSpeed=0.75|1|1.5;

/** Media-player style transport shared by every lesson stage (3D, 2D and Python memory views). */
export function LessonTransport({step,total,playing,speed,labels,onStep,onTogglePlay,onReset,onSpeed}:{step:number;total:number;playing:boolean;speed:PlaybackSpeed;labels?:readonly string[];onStep:(step:number)=>void;onTogglePlay:()=>void;onReset:()=>void;onSpeed:(speed:PlaybackSpeed)=>void}){
 const pct=total>1?step/(total-1)*100:100;
 return <div className="lx-transport" role="group" aria-label="演示播放控制">
  <div className="lx-transport-buttons">
   <button type="button" className="lx-tbtn" onClick={onReset} aria-label="重置演示" title="重置"><RotateCcw size={15}/></button>
   <button type="button" className="lx-tbtn" onClick={()=>onStep(Math.max(0,step-1))} disabled={step===0} aria-label="上一步" title="上一步"><ChevronLeft size={17}/></button>
   <button type="button" className="lx-tbtn lx-tbtn-play" onClick={onTogglePlay} aria-label={playing?'暂停':'播放'} title={playing?'暂停':'自动播放'}>{playing?<Pause size={16}/>:<Play size={16}/>}</button>
   <button type="button" className="lx-tbtn" onClick={()=>onStep(Math.min(total-1,step+1))} disabled={step>=total-1} aria-label="下一步" title="下一步"><ChevronRight size={17}/></button>
   <button type="button" className="lx-speed" onClick={()=>onSpeed(speed===1?1.5:speed===1.5?0.75:1)} title="切换播放倍速">{speed}×</button>
  </div>
  <div className="lx-timeline" style={{'--lx-steps':total} as React.CSSProperties}>
   <div className="lx-timeline-track"><i style={{width:`${pct}%`}}/></div>
   {Array.from({length:total},(_,i)=><button key={i} type="button" className={`lx-tick ${i===step?'is-active':i<step?'is-done':''}`} style={{left:total>1?`${i/(total-1)*100}%`:'50%'}} onClick={()=>onStep(i)} title={labels?.[i]?`第 ${i+1} 步：${labels[i]}`:`第 ${i+1} 步`} aria-label={`跳到第 ${i+1} 步`} aria-current={i===step?'step':undefined}><span>{i+1}</span></button>)}
  </div>
  <span className="lx-counter"><b>{step+1}</b>/{total}</span>
 </div>;
}
