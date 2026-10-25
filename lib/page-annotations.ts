import type {Ink,Mark,Point} from './whiteboard';
export type PageMark={id:string;anchor:string;basis:{w:number;h:number};ink:Mark;text?:string;fontSize?:number};
export const annotationKey=(context:string)=>'usaco-page-annotations-v1-'+context;
export function movePageMark(mark:PageMark,dx:number,dy:number):PageMark{return {...mark,ink:{...mark.ink,points:mark.ink.points.map(p=>({x:p.x+dx,y:p.y+dy}))}};}
export function markBounds(mark:PageMark){
 const p=mark.ink.points,x=p.map(p=>p.x),y=p.map(p=>p.y),pad=mark.ink.width/2;
 let left=Math.min(...x)-pad,top=Math.min(...y)-pad,right=Math.max(...x)+pad,bottom=Math.max(...y)+pad;
 if(mark.text){right=left+Math.max(...mark.text.split('\n').map(s=>[...s].reduce((n,c)=>n+(/[\u0000-\u00ff]/.test(c)?.62:1),0)))*(mark.fontSize||22)+8;bottom=top+mark.text.split('\n').length*(mark.fontSize||22)*1.4;}
 if(mark.ink.kind==='cuboid'){const d=mark.ink.depth||{x:70,y:-55};left+=Math.min(0,d.x);right+=Math.max(0,d.x);top+=Math.min(0,d.y);bottom+=Math.max(0,d.y);}
 return {left,top,right,bottom};
}
function segmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function hitPageMark(mark:PageMark,p:Point,tolerance=8){
 const b=markBounds(mark);if(p.x<b.left-tolerance||p.x>b.right+tolerance||p.y<b.top-tolerance||p.y>b.bottom+tolerance)return false;
 const points=mark.ink.points;if(mark.text)return true;
 if(['pen','line','arrow','doubleArrow'].includes(mark.ink.kind))return points.length===1?Math.hypot(p.x-points[0].x,p.y-points[0].y)<=tolerance+mark.ink.width/2:points.slice(1).some((q,i)=>segmentDistance(p,points[i],q)<=tolerance+mark.ink.width/2);
 return true;
}
export function readPageMarks(raw:string|null):PageMark[]{
 if(!raw)return [];try{const value=JSON.parse(raw),kinds=['pen','line','arrow','doubleArrow','rect','ellipse','triangle','cuboid'],colors:Ink[]=['ink','teal','blue','amber','red','violet'];
 if(!Array.isArray(value)||value.length>500)return [];
 return value.filter((m:PageMark)=>m&&typeof m.id==='string'&&typeof m.anchor==='string'&&m.anchor.length<200&&m.basis&&Number.isFinite(m.basis.w)&&m.basis.w>0&&Number.isFinite(m.basis.h)&&m.basis.h>0&&m.ink&&kinds.includes(m.ink.kind)&&colors.includes(m.ink.color)&&Number.isFinite(m.ink.width)&&m.ink.width>=1&&m.ink.width<=30&&Array.isArray(m.ink.points)&&m.ink.points.length>0&&m.ink.points.length<=3000&&m.ink.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<100000&&Math.abs(p.y)<100000)&&(!m.ink.depth||(Number.isFinite(m.ink.depth.x)&&Number.isFinite(m.ink.depth.y)))&&(!m.text||typeof m.text==='string'&&m.text.length<=500)&&(!m.fontSize||Number.isFinite(m.fontSize)&&m.fontSize>=12&&m.fontSize<=60));
 }catch{return [];}
}
