import {BOARD_WIDTH,BOARD_HEIGHT,distance,type Point} from './whiteboard';
type Landmark={x:number;y:number;z?:number};
export type VisionFrame={timestamp:number;gesture:string;score:number;landmarks:Landmark[]};
export type GestureSignal={mode:'draw'|'erase'|'hover'|'none';point:Point|null;label:string;progress:number;breakStroke:boolean;holdStroke?:boolean};
export type PenControl='space'|'gesture';
export type GestureOptions={control:PenControl;pressed:boolean};
export function cameraToBoard(q:{x:number;y:number}):Point{return {x:Math.max(0,Math.min(1,(1-q.x-.18)/.64))*BOARD_WIDTH,y:Math.max(0,Math.min(1,(q.y-.24)/.58))*BOARD_HEIGHT};}
const norm=(a:Landmark,b:Landmark)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
function fingerShape(l:Landmark[],i:number){
 const total=norm(l[i],l[i+1])+norm(l[i+1],l[i+2])+norm(l[i+2],l[i+3]);
 const straight=norm(l[i],l[i+3])/Math.max(.001,total),reach=norm(l[0],l[i+3])/Math.max(.001,norm(l[0],l[i+1]));
 return {straight,reach,extended:straight>.82&&reach>1.12,folded:straight<.69||reach<.98};
}
/** Joint lengths / wrist distance work when the pointing finger tilts or turns sideways. */
export function landmarkPose(l:Landmark[]):'point'|'palm'|'fist'|'lift'|'unknown'{
 if(l.length<21||norm(l[5],l[17])<.015)return 'unknown';
 const fingers=[5,9,13,17].map(i=>fingerShape(l,i));
 if(fingers.every(f=>f.extended))return 'palm';
 if(fingers.every(f=>f.folded))return 'fist';
 if(fingers[0].extended&&fingers[1].extended&&fingers.slice(2).every(f=>f.folded))return 'lift';
 if(fingers[0].extended&&fingers.slice(1).filter(f=>f.folded).length>=2)return 'point';
 return 'unknown';
}
/** Hysteresis keeps a stroke through classifier flicker; missing frames never invent ink. */
export class GestureGate {
 private armed=false;private candidate='';private since=0;private previous:Point|null=null;private previousRaw:Point|null=null;
 private active:'draw'|'erase'|'hover'='hover';private lastMode='none';private lastAt=0;private lastSupport=0;private lostAt:number|null=null;
 private velocity:Point={x:0,y:0};
 reset(){this.armed=false;this.candidate='';this.since=0;this.previous=null;this.previousRaw=null;this.active='hover';this.lastMode='none';this.lastAt=0;this.lastSupport=0;this.lostAt=null;}
 update(frame:VisionFrame,options:GestureOptions={control:'gesture',pressed:false}):GestureSignal{
  const {timestamp:t,landmarks:l}=frame,dt=this.lastAt?Math.max(1,t-this.lastAt):50,gap=dt>1000;this.lastAt=t;
  if(gap){this.active='hover';this.candidate='';this.previous=null;this.previousRaw=null;}
  const valid=l.length>=21&&l.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z||0));
  if(!valid){
   if(this.lostAt===null)this.lostAt=t;
   // Hold the unfinished stroke briefly, but don't move the pen without coordinates.
   if(!gap&&this.active!=='hover'&&t-this.lostAt<220)return {mode:this.active,point:null,label:'定位中…',progress:0,breakStroke:false,holdStroke:true};
   this.active='hover';this.candidate='';this.previous=null;this.previousRaw=null;this.lastMode='none';
   return {mode:'none',point:null,label:'未检测到手 · 已抬笔',progress:0,breakStroke:true};
  }
  const missing=this.lostAt===null?0:t-this.lostAt;this.lostAt=null;
  if(missing>=220){this.active='hover';this.candidate='';this.previous=null;this.previousRaw=null;}
  const geometry=landmarkPose(l);
  let pose=geometry;
  // Distinguish a bending index from an uncertain classifier. A deliberate lift
  // must not use the continuity grace period, otherwise curling leaves a tail.
  const index=norm(l[5],l[17])>=.015?fingerShape(l,5):null;
  const bending=this.active==='draw'&&index&&(index.straight<.80||index.reach<1.07);
  if(pose==='unknown'){
   if(frame.gesture==='Closed_Fist'&&frame.score>=.62)pose='fist';
   else if(frame.gesture==='Open_Palm'&&frame.score>=.62)pose='palm';
   else if(frame.gesture==='Victory'&&frame.score>=.55)pose='lift';
   else if(!bending&&frame.gesture==='Pointing_Up'&&frame.score>=(this.active==='draw'?.38:.55))pose='point';
  }
  if(pose!=='unknown'&&pose!==this.candidate){this.candidate=pose;this.since=t;}
  const elapsed=t-this.since;let label='已抬笔 · 伸出食指书写',progress=0;
  if(pose==='lift'){
   this.armed=true;this.active='hover';label='两指抬笔';
  }else if(pose==='fist'||bending){
   this.active='hover';if(elapsed>=80)this.armed=true;label=this.armed?'已抬笔':'先握拳片刻';
  }else if(!this.armed&&options.control==='gesture'){this.active='hover';label='先握拳或伸两指准备';}
  else if(pose==='palm'){
   this.lastSupport=t;progress=Math.min(1,elapsed/500);
   this.active=this.active==='erase'||elapsed>=500?'erase':'hover';label=this.active==='erase'?'手掌擦除':'张掌保持…';
  }else if(pose==='point'){
   this.lastSupport=t;this.active=this.active==='draw'||elapsed>=80?'draw':'hover';label=this.active==='draw'?'食指书写':'食指定位';
  }else if(this.active!=='hover'&&t-this.lastSupport<=450){label=this.active==='draw'?'食指书写':'手掌擦除';}
  else if((this.candidate==='point'||this.candidate==='palm')&&t-this.lastSupport<=180){label=this.candidate==='point'?'食指定位':'张掌保持…';}
  else{this.active='hover';this.candidate='';label='已抬笔 · 伸出食指书写';}
  if(options.control==='space'&&pose!=='palm'&&this.active!=='erase'){
   const pointing=pose==='point'||(pose==='unknown'&&index?.extended);
   this.active=options.pressed&&pointing?'draw':'hover';
   label=this.active==='draw'?'书写中 · 松空格抬笔':pointing?'按住空格书写':'伸食指定位';
  }
  const q=this.active==='erase'||pose==='palm'?{x:(l[0].x+l[5].x+l[9].x+l[13].x+l[17].x)/5,y:(l[0].y+l[5].y+l[9].y+l[13].y+l[17].y)/5}:l[8];
  // Keep the wrist inside the camera: a comfortable central hand movement covers the board.
  const raw=cameraToBoard(q);
  const movement=this.previousRaw?distance(raw,this.previousRaw):0;
  // A slow CPU may produce 3–5 frames/s. Allow real travel proportional to elapsed time.
  const jump=!!this.previousRaw&&movement>(missing?140:Math.min(650,Math.max(280,dt*1.8)));
  const breakStroke=gap||jump||missing>=220||this.active!==this.lastMode;
  let point=raw;
  if(this.previous&&!breakStroke){
   const seconds=dt/1000,vx=(raw.x-(this.previousRaw?.x??raw.x))/seconds,vy=(raw.y-(this.previousRaw?.y??raw.y))/seconds;
   // Low-pass the velocity as well as the position: jitter alternates direction,
   // while purposeful travel accumulates. Slow strokes receive more damping.
   this.velocity={x:this.velocity.x*.75+vx*.25,y:this.velocity.y*.75+vy*.25};
   const speed=Math.hypot(this.velocity.x,this.velocity.y),cutoff=1.15+Math.min(7,speed/180),alpha=1-Math.exp(-2*Math.PI*cutoff*seconds);
   point={x:this.previous.x+(raw.x-this.previous.x)*alpha,y:this.previous.y+(raw.y-this.previous.y)*alpha};
   if(distance(point,this.previous)<1.7)point=this.previous;
  }else this.velocity={x:0,y:0};
  this.previous=point;this.previousRaw=raw;this.lastMode=this.active;
  return {mode:this.active,point,label,progress,breakStroke};
 }
}
