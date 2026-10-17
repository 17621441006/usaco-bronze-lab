import type {Mark,Point} from './whiteboard';
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
function bounds(p:Point[]){return {l:Math.min(...p.map(v=>v.x)),r:Math.max(...p.map(v=>v.x)),t:Math.min(...p.map(v=>v.y)),b:Math.max(...p.map(v=>v.y))};}
function segmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,k=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return dist(p,{x:a.x+k*dx,y:a.y+k*dy});}
function simplify(p:Point[],tolerance:number):Point[]{
 if(p.length<3)return p;let best=tolerance,index=0;
 for(let i=1;i<p.length-1;i++){const d=segmentDistance(p[i],p[0],p[p.length-1]);if(d>best){best=d;index=i;}}
 return index?[...simplify(p.slice(0,index+1),tolerance).slice(0,-1),...simplify(p.slice(index),tolerance)]:[p[0],p[p.length-1]];
}
function samplePath(p:Point[],step=8){step=Math.max(step,p.slice(1).reduce((sum,v,i)=>sum+dist(v,p[i]),0)/2400);const out:Point[]=[];for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],n=Math.max(1,Math.ceil(dist(a,b)/step));for(let j=0;j<n;j++)out.push({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n});}if(p.length)out.push(p[p.length-1]);return out;}
function pathLength(p:Point[]){return p.slice(1).reduce((sum,v,i)=>sum+dist(v,p[i]),0);}
function quantile(values:number[],q:number){const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*q)];}
function principal(points:Point[]){
 const c=points.reduce((s,p)=>({x:s.x+p.x/points.length,y:s.y+p.y/points.length}),{x:0,y:0});let xx=0,yy=0,xy=0;
 for(const p of points){xx+=(p.x-c.x)**2;yy+=(p.y-c.y)**2;xy+=(p.x-c.x)*(p.y-c.y);}
 return {center:c,angle:.5*Math.atan2(2*xy,xx-yy)};
}
/** Least-squares line fitting tolerates endpoint wobble and works with 2–3 camera samples. */
export function fitLine(mark:Mark):Mark|null{
 if(mark.kind!=='pen'||mark.points.length<2)return null;
 const pts=samplePath(simplify(mark.points,3),9),start=pts[0],end=pts.at(-1)!,span=dist(start,end);if(span<42)return null;
 const {center,angle}=principal(pts),ux=Math.cos(angle),uy=Math.sin(angle),projections=pts.map(p=>(p.x-center.x)*ux+(p.y-center.y)*uy),errors=pts.map(p=>Math.abs((p.x-center.x)*uy-(p.y-center.y)*ux));
 const extent=Math.max(...projections)-Math.min(...projections),rms=Math.sqrt(errors.reduce((s,v)=>s+v*v,0)/errors.length);
 // A sustained bend is intentional geometry, unlike small alternating hand jitter.
 if(span<extent*.88||rms>Math.max(6,extent*.055)||quantile(errors,.96)>Math.max(13,extent*.11))return null;
 const coarse=simplify(pts,Math.max(9,extent*.085));if(pathLength(coarse)>extent*1.4)return null;
 for(let i=1;i<coarse.length-1;i++){
  const a=coarse[i-1],b=coarse[i],c=coarse[i+1],ab=dist(a,b),bc=dist(b,c);
  if(Math.min(ab,bc)>Math.max(24,extent*.16)&&((b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y))/(ab*bc)<.84)return null;
 }
 let a={x:center.x+ux*projections[0],y:center.y+uy*projections[0]},b={x:center.x+ux*projections.at(-1)!,y:center.y+uy*projections.at(-1)!};
 if(Math.abs(uy)<.23){a={x:start.x,y:center.y};b={x:end.x,y:center.y};}else if(Math.abs(ux)<.23){a={x:center.x,y:start.y};b={x:center.x,y:end.y};}
 return {...mark,kind:'line',points:[a,b]};
}
function rectangleFit(points:Point[],allowOpen=false):Point[]|null{
 const big=bounds(points),scale=Math.min(big.r-big.l,big.b-big.t);if(scale<32)return null;
 const coarse=simplify(points,Math.max(7,scale*.065));
 const angles=[0];
 // Candidate axes come from substantial edges, not from the covariance of a square.
 angles.length=1;for(let i=1;i<coarse.length;i++)if(dist(coarse[i],coarse[i-1])>scale*.25)angles.push(Math.atan2(coarse[i].y-coarse[i-1].y,coarse[i].x-coarse[i-1].x));
 let best:Point[]|null=null,bestScore=Infinity;
 for(let angle of angles.slice(0,18)){
  angle=((angle%(Math.PI/2))+Math.PI/2)%(Math.PI/2);if(angle<.12||angle>Math.PI/2-.12)angle=0;
  const c=Math.cos(angle),s=Math.sin(angle),p=points.map(v=>({x:v.x*c+v.y*s,y:-v.x*s+v.y*c})),b=bounds(p),w=b.r-b.l,h=b.b-b.t,small=Math.min(w,h);if(small<32)continue;
  if(!allowOpen&&dist(points[0],points.at(-1)!)>Math.max(32,small*.48))continue;
  const corners=[{x:b.l,y:b.t},{x:b.r,y:b.t},{x:b.r,y:b.b},{x:b.l,y:b.b}],error=p.reduce((sum,v)=>sum+Math.min(Math.abs(v.x-b.l),Math.abs(v.x-b.r),Math.abs(v.y-b.t),Math.abs(v.y-b.b)),0)/p.length;
  if(error>small*.092||corners.some(v=>Math.min(...p.map(q=>dist(v,q)))>small*.19))continue;
  if(!corners.every((a,i)=>[.2,.4,.6,.8].every(k=>{const z=corners[(i+1)%4];return p.some(v=>dist(v,{x:a.x+(z.x-a.x)*k,y:a.y+(z.y-a.y)*k})<small*.17);})))continue;
  const score=error/small;if(score<bestScore){bestScore=score;best=corners.map(v=>({x:v.x*c-v.y*s,y:v.x*s+v.y*c}));}
 }
 return best;
}
function triangleFit(points:Point[]):Point[]|null{
 const b=bounds(points),small=Math.min(b.r-b.l,b.b-b.t);if(small<40||dist(points[0],points.at(-1)!)>small*.42)return null;
 const path=simplify(points,small*.12);if(dist(path[0],path.at(-1)!)<small*.42)path.pop();
 // A closed sketch may start in the middle of an edge: remove that redundant point.
 while(path.length>3){let changed=false;for(let i=0;i<path.length;i++)if(segmentDistance(path[i],path[(i+path.length-1)%path.length],path[(i+1)%path.length])<small*.13){path.splice(i,1);changed=true;break;}if(!changed)break;}
 if(path.length!==3)return null;
 const area=Math.abs((path[1].x-path[0].x)*(path[2].y-path[0].y)-(path[2].x-path[0].x)*(path[1].y-path[0].y))/2;if(area<small*small*.16)return null;
 const error=points.reduce((sum,v)=>sum+Math.min(...path.map((a,i)=>segmentDistance(v,a,path[(i+1)%3]))),0)/points.length;
 return error<small*.075?path:null;
}
/** Compare whole-path geometry; never require a perfectly closed or axis-aligned sketch. */
export function tidyMark(mark:Mark):Mark{
 if(mark.kind!=='pen'||mark.points.length<2)return mark;
 const line=fitLine(mark);if(line)return line;
 if(mark.points.length<5)return mark;
 const pts=samplePath(simplify(mark.points,2),7),box=bounds(pts),w=box.r-box.l,h=box.b-box.t,small=Math.min(w,h);if(small<32)return mark;
 const rect=rectangleFit(pts);if(rect){const axis=Math.abs(rect[0].y-rect[1].y)<.1;return {...mark,kind:'rect',points:axis?[rect[0],rect[2]]:rect};}
 const triangle=triangleFit(pts);if(triangle)return {...mark,kind:'triangle',points:triangle};
 if(dist(pts[0],pts.at(-1)!)>Math.max(32,small*.38))return mark;
 const cx=(box.l+box.r)/2,cy=(box.t+box.b)/2,rx=w/2,ry=h/2,radii=pts.map(p=>Math.hypot((p.x-cx)/rx,(p.y-cy)/ry));
 const length=pathLength(simplify(pts,Math.max(4,small*.025))),circumference=Math.PI*(3*(rx+ry)-Math.sqrt((3*rx+ry)*(rx+3*ry)));
 if(radii.reduce((sum,r)=>sum+Math.abs(r-1),0)/radii.length<.15&&length/circumference>.72&&length/circumference<1.4)return {...mark,kind:'ellipse',points:[{x:box.l,y:box.t},{x:box.r,y:box.b}]};
 return mark;
}
/** Called during drawing: useful even before pen-up; complex paths remain untouched. */
export function liveShape(mark:Mark):Mark{return tidyMark(mark);}
function markPath(m:Mark):Point[]{
 if(m.kind==='rect'&&m.points.length>=4)return [...m.points,m.points[0]];
 if(m.kind==='rect'){const a=m.points[0],b=m.points.at(-1)!;return [a,{x:b.x,y:a.y},b,{x:a.x,y:b.y},a];}
 return m.points;
}
function cuboidEdges(l:number,t:number,w:number,h:number,d:Point){
 const f=[{x:l,y:t},{x:l+w,y:t},{x:l+w,y:t+h},{x:l,y:t+h}],back=f.map(p=>({x:p.x+d.x,y:p.y+d.y})),hidden=d.x>=0?(d.y<=0?3:0):(d.y<=0?2:1),visible:[Point,Point][]=[],all:[Point,Point][]=[];
 for(let i=0;i<4;i++){const n=(i+1)%4;visible.push([f[i],f[n]]);all.push([f[i],f[n]],[back[i],back[n]],[f[i],back[i]]);if(i!==hidden&&n!==hidden)visible.push([back[i],back[n]]);if(i!==hidden)visible.push([f[i],back[i]]);}
 return {visible,all};
}
/** Recognize the nine visible edges of a box, even when drawn as several strokes.
 * Coverage of every edge is required; adjacent writing is never silently consumed.
 */
export function recognizeCuboid(marks:Mark[]):Mark|null{
 if(!marks.length||marks.some(m=>!['pen','line','rect'].includes(m.kind)||m.points.length<2))return null;
 const paths=marks.map(markPath),allPoints=paths.flat();if(allPoints.length>15000)return null;
 const box=bounds(allPoints),bw=box.r-box.l,bh=box.b-box.t;if(bw<100||bh<85)return null;
 const tolerance=Math.max(7,Math.min(bw,bh)*.035),segments=paths.flatMap(p=>{const simple=simplify(p,tolerance);return simple.slice(1).map((b,i)=>[simple[i],b] as [Point,Point]);});
 if(segments.length>90)return null;
 const diagonal=segments.filter(([a,b])=>Math.abs(b.x-a.x)>18&&Math.abs(b.y-a.y)>18&&Math.abs((b.y-a.y)/(b.x-a.x))>.18&&Math.abs((b.y-a.y)/(b.x-a.x))<3.5);
 if(diagonal.length<2)return null;
 const samples=paths.flatMap(p=>samplePath(p,9));
 for(const [a,b] of diagonal){for(const sign of [1,-1]){
  const d={x:(b.x-a.x)*sign,y:(b.y-a.y)*sign},w=bw-Math.abs(d.x),h=bh-Math.abs(d.y);if(w<50||h<45||Math.abs(d.x)>w*1.3||Math.abs(d.y)>h*1.3)continue;
  // At least two independent, roughly parallel depth edges must agree.
  if(diagonal.filter(([u,v])=>Math.min(dist({x:v.x-u.x,y:v.y-u.y},d),dist({x:u.x-v.x,y:u.y-v.y},d))<tolerance*2.5).length<2)continue;
  const l=box.l+Math.max(0,-d.x),t=box.t+Math.max(0,-d.y),edges=cuboidEdges(l,t,w,h,d),limit=Math.max(10,Math.min(w,h)*.105);
  const errors=samples.map(p=>Math.min(...edges.all.map(([u,v])=>segmentDistance(p,u,v))));
  if(errors.reduce((s,v)=>s+v,0)/errors.length>limit*.6||errors.filter(v=>v>limit*1.6).length>samples.length*.035)continue;
  const covered=edges.visible.every(([u,v])=>[.08,.30,.5,.70,.92].every(f=>samples.some(p=>dist(p,{x:u.x+(v.x-u.x)*f,y:u.y+(v.y-u.y)*f})<limit*1.6)));
  if(covered)return {...marks[0],kind:'cuboid',points:[{x:l,y:t},{x:l+w,y:t+h}],depth:d};
 }}
 return null;
}
export function tidyRecentCuboid(marks:Mark[]):{marks:Mark[];recognized:boolean}{
 const last=marks.at(-1);if(!last)return {marks,recognized:false};
 for(let count=1;count<=Math.min(12,marks.length);count++){
  const part=marks.slice(-count);if(part.some(m=>!['pen','line','rect'].includes(m.kind)||m.color!==last.color))break;
  const shape=recognizeCuboid(part);if(shape)return {marks:[...marks.slice(0,-count),shape],recognized:true};
  if(count>=2&&count<=4&&part.every(m=>m.kind==='line'||m.kind==='pen')){
   const paths=part.map(markPath),points=paths.flatMap(p=>samplePath(p,8)),box=bounds(points),small=Math.min(box.r-box.l,box.b-box.t);
   // Require connected endpoints and clean edges before joining separate strokes.
   const ends=paths.flatMap(p=>[p[0],p.at(-1)!]);
   if(small>45&&ends.every((v,i)=>ends.some((q,j)=>j!==i&&dist(v,q)<small*.23))){const corners=rectangleFit(points,true);if(corners)return {marks:[...marks.slice(0,-count),{...last,kind:'rect',points:Math.abs(corners[0].y-corners[1].y)<.1?[corners[0],corners[2]]:corners}],recognized:true};}
  }
 }
 return {marks,recognized:false};
}
