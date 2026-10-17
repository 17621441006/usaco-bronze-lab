import {drawElement,elementCatalog,type TeachingElement} from './whiteboard-elements';
export {tidyMark} from './whiteboard-shapes';
/** Logical coordinates stay fixed across resizing, fullscreen and PNG export. */
export const BOARD_WIDTH = 1600;
export const BOARD_HEIGHT = 900;
export type Point = {x:number;y:number};
export type Ink = 'ink'|'teal'|'blue'|'amber'|'red'|'violet';
export type Tool = 'pen'|'line'|'arrow'|'doubleArrow'|'rect'|'ellipse'|'triangle'|'cuboid'|'erase';
export type Mark = {kind:Tool|'clear';points:Point[];color:Ink;width:number;depth?:Point};
export type Sheet = {marks:Mark[];objects?:TeachingElement[];paper:'plain'|'grid'|'sample';sample:number};
export type Board = {version:1;pages:Sheet[];page:number;dark:boolean};
export const newSheet = ():Sheet => ({marks:[],paper:'plain',sample:0});
export const newBoard = ():Board => ({version:1,pages:[newSheet()],page:0,dark:false});
export const boardKey = (id:string) => `usaco-whiteboard-v1-${id}`;
export const inks:Record<Ink,{label:string;light:string;dark:string}>={
 ink:{label:'墨色',light:'#243746',dark:'#edf4f5'},teal:{label:'青绿',light:'#087f7e',dark:'#54d5c7'},blue:{label:'蓝色',light:'#2c65c8',dark:'#86b3ff'},amber:{label:'橙色',light:'#c77713',dark:'#f7c56d'},red:{label:'红色',light:'#d24a54',dark:'#ff9098'},violet:{label:'紫色',light:'#8552bf',dark:'#c9a6ff'}
};
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const finitePoint=(p:unknown):p is Point=>!!p&&typeof p==='object'&&Number.isFinite((p as Point).x)&&Number.isFinite((p as Point).y)&&Math.abs((p as Point).x)<10000&&Math.abs((p as Point).y)<10000;
export function readBoard(raw:string|null):Board {
 if(!raw)return newBoard();
 const b=JSON.parse(raw);
 if(b.version!==1||!Array.isArray(b.pages)||!b.pages.length||b.pages.length>12)throw new Error('白板文件格式不正确');
 const kinds=['pen','line','arrow','doubleArrow','rect','ellipse','triangle','cuboid','erase','clear'];
 for(const p of b.pages){
  if(p.objects!==undefined&&(!Array.isArray(p.objects)||p.objects.length>200||p.objects.some((o:TeachingElement)=>!o||!elementCatalog.some(e=>e.kind===o.kind)||typeof o.id!=='string'||o.id.length>100||!finitePoint(o)||!Number.isFinite(o.w)||!Number.isFinite(o.h)||o.w<40||o.w>1600||o.h<40||o.h>900||!Number.isInteger(o.variant)||typeof o.label!=='string'||o.label.length>80||!Array.isArray(o.values)||o.values.length>24||o.values.some((v:string)=>typeof v!=='string'||v.length>80))))throw new Error('白板元素格式不正确');
  if(!['plain','grid','sample'].includes(p.paper)||!Number.isInteger(p.sample)||p.sample<0||!Array.isArray(p.marks)||p.marks.length>5000)throw new Error('白板页面格式不正确');
  for(const m of p.marks)if(!kinds.includes(m.kind)||!Array.isArray(m.points)||m.points.length>6000||!m.points.every(finitePoint)||!Object.hasOwn(inks,m.color)||!Number.isFinite(m.width)||m.width<1||m.width>600||(m.depth&&!finitePoint(m.depth)))throw new Error('白板笔迹格式不正确');
 }
 return {version:1,pages:b.pages,page:Math.max(0,Math.min(b.pages.length-1,Number.isInteger(b.page)?b.page:0)),dark:!!b.dark};
}
export function bounds(points:Point[]){return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};}
function path(ctx:CanvasRenderingContext2D,points:Point[]){
 if(!points.length)return;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
 if(points.length===1){ctx.lineTo(points[0].x+.01,points[0].y);return;}
 for(let i=1;i<points.length-1;i++){const p=points[i],n=points[i+1];ctx.quadraticCurveTo(p.x,p.y,(p.x+n.x)/2,(p.y+n.y)/2);}
 const last=points[points.length-1];ctx.lineTo(last.x,last.y);
}
export function drawMark(ctx:CanvasRenderingContext2D,m:Mark,dark:boolean){
 if(m.kind==='clear'){ctx.clearRect(0,0,BOARD_WIDTH,BOARD_HEIGHT);return;}
 if(!m.points.length)return;
 ctx.save();ctx.globalCompositeOperation=m.kind==='erase'?'destination-out':'source-over';ctx.strokeStyle=inks[m.color][dark?'dark':'light'];ctx.lineWidth=m.width;ctx.lineCap='round';ctx.lineJoin='round';
 const a=m.points[0],b=m.points[m.points.length-1];
 if(m.kind==='pen'||m.kind==='erase'){path(ctx,m.points);ctx.stroke();}
 else if(m.kind==='line'||m.kind==='arrow'||m.kind==='doubleArrow'){
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  const head=(start:Point,end:Point)=>{const angle=Math.atan2(end.y-start.y,end.x-start.x),length=Math.min(distance(start,end)*.35,Math.max(16,m.width*4));for(const turn of [-.45,.45]){ctx.moveTo(end.x,end.y);ctx.lineTo(end.x-Math.cos(angle+turn)*length,end.y-Math.sin(angle+turn)*length);}};
  if(m.kind!=='line')head(a,b);if(m.kind==='doubleArrow')head(b,a);ctx.stroke();
 }
 else if(m.kind==='ellipse'){ctx.beginPath();ctx.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.max(.1,Math.abs(b.x-a.x)/2),Math.max(.1,Math.abs(b.y-a.y)/2),0,0,Math.PI*2);ctx.stroke();}
 else if(m.kind==='rect'||m.kind==='triangle'){
  const vertices=m.points.length>=3?m.points:m.kind==='triangle'?[{x:(a.x+b.x)/2,y:Math.min(a.y,b.y)},{x:Math.max(a.x,b.x),y:Math.max(a.y,b.y)},{x:Math.min(a.x,b.x),y:Math.max(a.y,b.y)}]:null;
  if(vertices){ctx.beginPath();vertices.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();}else ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);
 }
 else if(m.kind==='cuboid'){
  const l=Math.min(a.x,b.x),r=Math.max(a.x,b.x),t=Math.min(a.y,b.y),bottom=Math.max(a.y,b.y),d=m.depth||{x:70,y:-55};
  const front=[{x:l,y:t},{x:r,y:t},{x:r,y:bottom},{x:l,y:bottom}];
  const back=front.map(p=>({x:p.x+d.x,y:p.y+d.y}));
  const hidden=d.x>=0?(d.y<=0?3:0):(d.y<=0?2:1);
  ctx.setLineDash([8,8]);ctx.globalAlpha=.45;ctx.beginPath();
  for(const i of [(hidden+3)%4,(hidden+1)%4]){ctx.moveTo(back[i].x,back[i].y);ctx.lineTo(back[hidden].x,back[hidden].y);}
  ctx.moveTo(front[hidden].x,front[hidden].y);ctx.lineTo(back[hidden].x,back[hidden].y);ctx.stroke();
  ctx.setLineDash([]);ctx.globalAlpha=1;ctx.strokeRect(l,t,r-l,bottom-t);ctx.beginPath();
  for(let i=0;i<4;i++){const n=(i+1)%4;if(i!==hidden&&n!==hidden){ctx.moveTo(back[i].x,back[i].y);ctx.lineTo(back[n].x,back[n].y);}if(i!==hidden){ctx.moveTo(front[i].x,front[i].y);ctx.lineTo(back[i].x,back[i].y);}}ctx.stroke();
 }
 ctx.restore();
}
export function drawInk(ctx:CanvasRenderingContext2D,marks:Mark[],dark:boolean,draft?:Mark|null){
 ctx.clearRect(0,0,BOARD_WIDTH,BOARD_HEIGHT);let start=0;for(let i=marks.length-1;i>=0;i--)if(marks[i].kind==='clear'){start=i+1;break;}
 for(let i=start;i<marks.length;i++)drawMark(ctx,marks[i],dark);if(draft)drawMark(ctx,draft,dark);
}
export type BoardContext={id:string;title:string;samples?:{input:string;output:string}[];notes?:string[];problemId?:number};
export function drawPaper(ctx:CanvasRenderingContext2D,sheet:Sheet,dark:boolean,context:BoardContext){
 ctx.fillStyle=dark?'#14252c':'#fffefa';ctx.fillRect(0,0,BOARD_WIDTH,BOARD_HEIGHT);
 if(sheet.paper==='grid'){
  ctx.fillStyle=dark?'#385058':'#dbe4e1';for(let x=32;x<BOARD_WIDTH;x+=32)for(let y=32;y<BOARD_HEIGHT;y+=32){ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill();}
 }
 if(sheet.paper==='sample'&&context.samples?.length){
  const sample=context.samples[Math.min(sheet.sample,context.samples.length-1)];ctx.fillStyle=dark?'#1f353e':'#eef4f1';ctx.fillRect(40,40,480,820);
  ctx.fillStyle=dark?'#8cbbb8':'#497d76';ctx.font='bold 22px sans-serif';ctx.fillText(`样例 ${sheet.sample+1} · 输入`,65,82);
  const lines=sample.input.trimEnd().split('\n');ctx.font='24px monospace';ctx.fillStyle=dark?'#d6e9e9':'#243746';
  lines.slice(0,17).forEach((line,i)=>ctx.fillText(line.length>28?line.slice(0,27)+'…':line,65,122+i*30));
  if(lines.length>17)ctx.fillText('…（完整数据见题目参考）',65,646);
  ctx.font='bold 22px sans-serif';ctx.fillStyle=dark?'#8cbbb8':'#497d76';ctx.fillText('样例输出',65,720);
  ctx.font='24px monospace';ctx.fillStyle=dark?'#d6e9e9':'#243746';sample.output.trimEnd().split('\n').slice(0,3).forEach((line,i)=>ctx.fillText(line.length>28?line.slice(0,27)+'…':line,65,760+i*30));
 }
 for(const object of sheet.objects||[])drawElement(ctx,object,dark);
}
