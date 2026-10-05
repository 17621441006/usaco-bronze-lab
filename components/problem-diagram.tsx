'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {Box,PanelTop,ChevronLeft,ChevronRight,RotateCcw} from 'lucide-react';
import {VisualLesson} from './visual-lesson';
type Item={label:string,x:number,y:number,w:number,h:number,height:number,color:string};
type Frame={title:string,text:string,items:Item[],edges:{from:number[],to:number[],color:string}[]};
type Drawing={problemId:number,note:string,frames:Frame[]};
function bounds(items:Item[]){return {left:Math.min(...items.map(t=>t.x-t.w/2))-.7,right:Math.max(...items.map(t=>t.x+t.w/2))+.7,top:Math.min(...items.map(t=>t.y-t.h/2))-1,bottom:Math.max(...items.map(t=>t.y+t.h/2))+1};}
function SpatialDiagram({frame,onUnavailable}:{frame:Frame,onUnavailable:()=>void}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!host.current)return;const node=host.current;let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{onUnavailable();return;}
 const b=bounds(frame.items),width=b.right-b.left,depth=b.bottom-b.top,cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#f4f7fa');node.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x9bafbf,2.8));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-10,18,6);scene.add(light);
 const camera=new THREE.PerspectiveCamera(38,1,.1,300);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.4,0);controls.maxPolarAngle=Math.PI/2.04;controls.enablePan=true;
 const textures:THREE.Texture[]=[];
 for(const t of frame.items){const mesh=new THREE.Mesh(new THREE.BoxGeometry(t.w,Math.max(.08,t.height),t.h),new THREE.MeshStandardMaterial({color:t.color,roughness:.8}));mesh.position.set(t.x-cx,t.height/2,t.y-cy);scene.add(mesh);
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='rgba(255,255,255,.96)';c.beginPath();c.roundRect(3,4,762,120,16);c.fill();c.fillStyle='#263e51';c.font='500 45px Arial,"PingFang SC",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t.label,384,67,730);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));const lw=Math.max(t.w,Math.min(2.7,t.label.length*.15+.45));label.scale.set(lw,lw/6,1);label.position.set(t.x-cx,t.height+.2,t.y-cy);scene.add(label);}
 for(const e of frame.edges){const from=new THREE.Vector3(e.from[0]-cx,.09,e.from[1]-cy),to=new THREE.Vector3(e.to[0]-cx,.09,e.to[1]-cy),dir=to.clone().sub(from),len=dir.length();if(len>.01)scene.add(new THREE.ArrowHelper(dir.normalize(),from,len,e.color,.25,.12));}
 const grid=new THREE.GridHelper(Math.max(width,depth)+4,20,0xdce5ed,0xe9eef3);grid.position.y=-.08;scene.add(grid);
 let initialized=false;function render(){const w=node.clientWidth,h=node.clientHeight;if(!w||!h)return;camera.aspect=w/h;if(!initialized){const fit=Math.max(depth,width/camera.aspect,8);camera.position.set(fit*.25,fit*.95,fit*1.05);controls.minDistance=3;controls.maxDistance=fit*4;initialized=true;controls.update();}camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.render(scene,camera);}
 controls.addEventListener('change',render);const ro=new ResizeObserver(render);ro.observe(node);render();return()=>{ro.disconnect();controls.dispose();scene.traverse(obj=>{const m=obj as THREE.Mesh;m.geometry?.dispose();const mats=Array.isArray(m.material)?m.material:[m.material];mats.forEach(v=>v?.dispose());});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();};
 },[frame]);
 return <div className="problem-spatial" ref={host} role="img" aria-label={frame.title}><span className="scene-help">拖动旋转 · 滚轮缩放 · 标签为实际样例值</span></div>
}
export function ProblemDiagram({id}:{id:number}){
 const [data,setData]=useState<Drawing|null>(null),[error,setError]=useState(''),[step,setStep]=useState(0),[view,setView]=useState('3d'),[special,setSpecial]=useState(false);
 useEffect(()=>{const ac=new AbortController();setData(null);setStep(0);setError('');setSpecial([567,1444,1564].includes(id));fetch(`/diagrams/${id}.json`,{signal:ac.signal}).then(r=>{if(!r.ok)throw Error('图解加载失败，请重试');return r.json() as Promise<Drawing>}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ac.abort();},[id]);
 const dedicated:Record<number,'fence'|'cheese'|'moo'|'printing'|'reflection'>={567:'fence',1444:'cheese',1564:'moo',1493:'printing',1491:'reflection'};
 if(!data)return error?<p className="notice">{error}</p>:<Skeleton className="h-80 w-full"/>;
 const frame=data.frames[Math.min(step,data.frames.length-1)],b=bounds(frame.items),scale=55;
 return <div className="problem-drawing"><div className="drawing-heading"><div><span className="badge">官方样例图解</span><h3>{frame.title}</h3></div>{dedicated[id]&&<Button variant="outline" size="sm" onClick={()=>setSpecial(!special)}>{special?'返回题意图':'操作模型'}</Button>}</div>{special&&dedicated[id]?<VisualLesson kind={dedicated[id]}/>:<><div className="visual-toolbar"><span className="micro">每道题使用自己的样例数据</span><Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="3d"><Box size={14}/>3D</TabsTrigger><TabsTrigger value="2d"><PanelTop size={14}/>二维</TabsTrigger></TabsList></Tabs></div>{view==='3d'?<SpatialDiagram frame={frame} onUnavailable={()=>setView('2d')}/>:<div className="problem-flat"><svg viewBox={`${b.left*scale} ${b.top*scale} ${(b.right-b.left)*scale} ${(b.bottom-b.top)*scale}`} role="img" aria-label={frame.title}><defs><marker id={'arrow-'+id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8d9eac"/></marker></defs>{frame.edges.map((e,i)=><line key={'e'+i} x1={e.from[0]*scale} y1={e.from[1]*scale} x2={e.to[0]*scale} y2={e.to[1]*scale} stroke={e.color} strokeWidth="2" markerEnd={`url(#arrow-${id})`}/>)}{frame.items.map((t,i)=><g key={i}><rect x={(t.x-t.w/2)*scale} y={(t.y-t.h/2)*scale} width={t.w*scale} height={t.h*scale} rx="4" fill={t.color} fillOpacity=".22" stroke={t.color}/><text x={t.x*scale} y={t.y*scale} textAnchor="middle" dominantBaseline="central" fill="#29475e" fontSize={Math.min(15,t.w*scale/Math.max(2,t.label.length)*1.5)}>{t.label}</text></g>)}</svg></div>}<div className="scene-controls"><div><Button size="icon" variant="ghost" aria-label="回到第一步" onClick={()=>setStep(0)}><RotateCcw size={16}/></Button><Button size="icon" variant="outline" disabled={step===0} aria-label="上一步图解" onClick={()=>setStep(step-1)}><ChevronLeft size={16}/></Button><Button size="icon" variant="outline" disabled={step>=data.frames.length-1} aria-label="下一步图解" onClick={()=>setStep(step+1)}><ChevronRight size={16}/></Button></div><span className="micro">{step+1} / {data.frames.length}</span></div><p className="drawing-explanation" aria-live="polite">{frame.text}</p><p className="drawing-note">{data.note}</p></>}</div>
}
