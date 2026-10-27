'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {isStoryKind,type StoryKind} from '@/lib/farm-scenarios';
import {drawFarmScene} from './farm-scene';
import {cow,farmer} from './farm-actors';
import {createTrough} from './farm-models';
import {createFarmEnvironment} from './farm-environment';
import {fitTeachingCamera,teachingBounds} from '@/lib/scene-framing';
import {SceneZoomControls,clampSceneZoom} from './scene-zoom-controls';
export type SceneKind=StoryKind|'fence'|'cheese'|'reflection'|'moo'|'printing'|'array'|'dp'|'binary';
export const cheeseMoves=[[0,0,0],[1,1,1],[0,1,0],[1,0,0],[1,1,0]];
export function cheeseCount(step:number){let count=0;const removed=new Set(cheeseMoves.slice(0,step).map(x=>x.join(',')));for(let axis=0;axis<3;axis++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){let ok=true;for(let i=0;i<2;i++){let p=axis===0?[i,a,b]:axis===1?[a,i,b]:[a,b,i];if(!removed.has(p.join(',')))ok=false;}if(ok)count++;}return count;}
export function LearningScene({kind,step=0,interval=[7,10,4,8],boardMask=17,flat=false,onUnavailable}:{kind:SceneKind,step?:number,interval?:number[],boardMask?:number,flat?:boolean,onUnavailable?:()=>void}){
 const host=useRef<HTMLDivElement>(null);const cam=useRef<{kind:SceneKind;direction:THREE.Vector3}|null>(null);const resetView=useRef<()=>void>(()=>{});const [failed,setFailed]=useState(false),[zoom,setZoom]=useState(1);const zoomValue=useRef(1),changeZoom=useRef<(value:number)=>void>(()=>{});
 useEffect(()=>{if(!host.current)return; const node=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);onUnavailable?.();return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor('#f1f5f9',0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;node.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,120);
 const defaultDirection=new THREE.Vector3(...(kind==='fence'?[.36,.72,1.42]:kind==='cheese'?[1,.84,1.38]:[.54,.88,1.38]) as [number,number,number]);camera.position.copy(cam.current?.kind===kind?cam.current.direction:defaultDirection);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=false;controls.maxPolarAngle=Math.PI/2.05;controls.enablePan=false;controls.enableZoom=false;
 scene.add(new THREE.HemisphereLight(0xf8fafc,0xdbeafe,1.55));
 const sun=new THREE.DirectionalLight(0xfffbeb,2.35);sun.position.set(-6,14,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-0.0005;Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13});scene.add(sun);
 const fillLight=new THREE.DirectionalLight(0xe0f2fe,.8);fillLight.position.set(7,6,8);scene.add(fillLight);
 const objects:THREE.Object3D[]=[];
 function add(object:THREE.Object3D){scene.add(object);objects.push(object);}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:THREE.ColorRepresentation,opacity=1){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.54,metalness:.06,transparent:opacity<1,opacity:opacity<.4?0:opacity}));
  m.position.set(x,y,z);m.castShadow=opacity>=.4;m.receiveShadow=true;add(m);
  // Render a glowing circular holographic telemetry pedestal for ground markers (keeps exact teachingBounds on m).
  if(h<=.08&&opacity<.4){
   const hex=new THREE.Color(color).getHex();
   const isOrange=hex===0xc66628||hex===0xd69749||hex===0xcc873f;
   const isGreen=hex===0x238575||hex===0x269888;
   const ringColor=isOrange?0xf59e0b:isGreen?0x10b981:0x38bdf8;
   const baseColor=isOrange?0x78350f:isGreen?0x064e3b:0x0f172a;
   const radius=Math.min(w,d)*.54;
   const ped=new THREE.Group();ped.position.set(x,y,z);
   const disc=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*1.08,.06,36),new THREE.MeshStandardMaterial({color:baseColor,roughness:.3,metalness:.28,transparent:true,opacity:.86}));
   disc.receiveShadow=true;ped.add(disc);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*.94,.038,14,48),new THREE.MeshStandardMaterial({color:ringColor,emissive:ringColor,emissiveIntensity:isOrange?1.05:isGreen?.75:.55,roughness:.18}));
   ring.rotation.x=Math.PI/2;ring.position.y=.034;ped.add(ring);
   const innerRing=new THREE.Mesh(new THREE.TorusGeometry(radius*.68,.02,12,40),new THREE.MeshStandardMaterial({color:0xffffff,emissive:ringColor,emissiveIntensity:.65,transparent:true,opacity:.82}));
   innerRing.rotation.x=Math.PI/2;innerRing.position.y=.038;ped.add(innerRing);
   scene.add(ped);
  }
  return m;
 }
 function label(text:string,x:number,y:number,z:number,color='#1e293b',width=2.2){
  const c=document.createElement('canvas');c.width=640;c.height=160;const ctx=c.getContext('2d')!;
  const isActive=/a24d20|9b5225|9b461c|855320/.test(color);
  const isDone=/238575|326f69|237667/.test(color);
  const borderCol=isActive?'rgba(245, 158, 11, 0.92)':isDone?'rgba(16, 185, 129, 0.9)':'rgba(148, 163, 184, 0.65)';
  const dotCol=isActive?'#f59e0b':isDone?'#10b981':'#38bdf8';
  ctx.save();
  ctx.shadowColor='rgba(15, 23, 42, 0.18)';ctx.shadowBlur=16;ctx.shadowOffsetY=5;
  ctx.fillStyle=isActive?'rgba(255, 251, 235, 0.98)':'rgba(255, 255, 255, 0.97)';
  ctx.beginPath();ctx.roundRect(12,14,616,128,64);ctx.fill();
  ctx.restore();
  ctx.strokeStyle=borderCol;ctx.lineWidth=4.5;
  ctx.beginPath();ctx.roundRect(12,14,616,128,64);ctx.stroke();
  if(width>=1.05){
   ctx.fillStyle=dotCol;ctx.beginPath();ctx.arc(54,78,12,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=isActive?'#b45309':isDone?'#047857':'#0f172a';
  ctx.font=`700 ${width<.8?54:48}px Inter, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,width>=1.05?336:320,80,width>=1.05?520:575);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,toneMapped:false}));
  sp.position.set(x,y,z);sp.scale.set(width,width/4,1);add(sp);return sp;
 }
 function line(points:number[][],color=0x06b6d4){
  const pts=points.map(v=>new THREE.Vector3(...v as [number,number,number]));
  const baseLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:.01}));
  add(baseLine);
  // Render a high-arching glowing 3D Bézier energy trajectory with endpoint & apex light orbs.
  if(pts.length>=2){
   const curvePts=pts.map(p=>p.clone());
   if(curvePts.length===3){
    const span=curvePts[0].distanceTo(curvePts[2]);
    const baseMidY=(curvePts[0].y+curvePts[2].y)/2;
    if(curvePts[1].y-baseMidY<.45)curvePts[1].y=baseMidY+Math.max(.55,span*.22);
   }
   const curve=curvePts.length===3?new THREE.QuadraticBezierCurve3(curvePts[0],curvePts[1],curvePts[2]):new THREE.CatmullRomCurve3(curvePts);
   const isWarm=color===0xc3692c||color===0xc38b4d||color===0xb06d58;
   const beamColor=isWarm?0x06b6d4:0x6366f1;
   const coreMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:beamColor,emissiveIntensity:1.25,roughness:.12});
   const haloMat=new THREE.MeshStandardMaterial({color:beamColor,emissive:beamColor,emissiveIntensity:.75,transparent:true,opacity:.36,roughness:.2});
   scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,36,.042,12,false),coreMat));
   scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,36,.096,12,false),haloMat));
   for(const ep of [curvePts[0],curve.getPoint(.5),curvePts[curvePts.length-1]]){
    const nodeSphere=new THREE.Mesh(new THREE.SphereGeometry(.095,16,16),coreMat);
    nodeSphere.position.copy(ep);scene.add(nodeSphere);
   }
  }
 }
 const kit={add,box,label,line};
 if(isStoryKind(kind)){drawFarmScene(kit,kind,step);}
 else if(kind==='fence'){
  const [a,b,c,d]=interval;for(let x=0;x<12;x++){const fj=step>=1&&x>=a&&x<b,bs=step>=2&&x>=c&&x<d;const col=fj&&bs&&step>=3?0x8b5cf6:bs?0xf59e0b:fj?0x3b82f6:0xe2e8f0;box(x-5.5,1.15,0,.92,1.76,.22,col);if(fj||bs)box(x-5.5,.02,0,.96,.04,.65,fj&&bs&&step>=3?0x238575:bs?0xc66628:0x3b82f6,.22);label(String(x),x-6,.26,.58,'#1e293b',.68);}label('12',6,.26,.58,'#1e293b',.72);
  for(const x of [-6,0,6])box(x,1,0,.18,2.15,.3,0x475569);
  box(0,.7,-.15,12.1,.13,.13,0x94a3b8);box(0,1.6,-.15,12.1,.13,.13,0x94a3b8);
  const fx=(a+b)/2-6,bx=(c+d)/2-6;farmer(kit,fx,1.65);cow(kit,bx,1.7,'Bessie');
  if(step>=1)line([[a-6,2.15,0],[fx,2.75,0],[b-6,2.15,0]],0x3b82f6);
  if(step>=2)line([[c-6,2.25,.25],[bx,2.88,.25],[d-6,2.25,.25]],0xc3692c);
  box(fx+.48,1.05,1.25,.08,.8,.08,0x9b764c);box(fx+.48,1.48,1.25,.3,.16,.14,0x3b82f6);
  label(`FJ [${a},${b}] · Bessie [${c},${d}]`,0,.12,3.05,'#0f172a',3.8);
 } else if(kind==='cheese'){
  const removed=new Set(cheeseMoves.slice(0,step).map(x=>x.join(',')));for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++){
   const m=box((x-.5)*2,1.05+y*2,(z-.5)*2,1.9,1.9,1.9,0xfbbf24,removed.has([x,y,z].join(','))?.08:1);
   if(!removed.has([x,y,z].join(',')))label(`${x},${y},${z}`,(x-.5)*2,1.4+y*2,(z-.5)*2,'#78350f',1.4);
   scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0xd97706,transparent:true,opacity:.3})).translateX(m.position.x).translateY(m.position.y).translateZ(m.position.z));
  }
  for(let axis=0;axis<3;axis++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){const coords=[];for(let i=0;i<2;i++)coords.push(axis===0?[i,a,b]:axis===1?[a,i,b]:[a,b,i]);if(coords.every(p=>removed.has(p.join(',')))){const p=coords[0];const cx=(p[0]-.5)*2,cy=1.05+p[1]*2,cz=(p[2]-.5)*2;box(axis===0?0:cx,axis===1?2.05:cy,axis===2?0:cz,axis===0?4.2:.28,axis===1?4.2:.28,axis===2?4.2:.28,0x06b6d4,.85);}}
  farmer(kit,-4,2);cow(kit,4,2,'Bessie',0x1e293b,.85);label('FJ 移除奶酪，Bessie 找通道',0,5.5,0,'#0f172a',5);label(`空通道 ${cheeseCount(step)}`,0,.3,4,'#047857',2.3);line([[0,.05,0],[3,.05,0]],0xc3692c);label('x',3.4,.15,0,'#a24d20',.6);label('y · 向上',-2.8,4,0,'#1e293b',1.7);label('z',0,.15,3.1,'#238575',.6);
 } else if(kind==='reflection'){
  const rows=['..#.','..#.','#..#','####'];for(let r=0;r<4;r++)for(let c=0;c<4;c++){const group=(r===0||r===3)&&(c===1||c===2);box((c-1.5)*1.4,.15,(r-1.5)*1.4,1.26,.3,1.26,group&&step===1?0xf59e0b:(group&&step>=3||rows[r][c]==='#')?0x4f46e5:0xe2e8f0);if(group&&step>0)label(step>=3?'已统一':'同一组',(c-1.5)*1.4,.8,(r-1.5)*1.4,'#a24d20',1.2);}line([[0,.4,-3],[0,.4,3]],0xb06d58);line([[-3,.4,0],[3,.4,0]],0xb06d58);farmer(kit,-4,1);cow(kit,4,1,'Bessie',0x1e293b,.8);label(step>=3?'补涂 1 格 · 四格统一':'FJ 的画布 · 3 格涂色，1 格空白',0,3.2,0,'#0f172a',5);
 } else if(kind==='moo'){
  const a=Array.from({length:5},(_,i)=>(boardMask>>i)&1?'M':'O');a.forEach((v,i)=>{box((i-2)*1.7,.5,0,1.4,1,1.4,step>=1&&i<3?0xf59e0b:v==='M'?0x4f46e5:0xe2e8f0);label(v,(i-2)*1.7,1.3,0,'#0f172a',1);label(String(i+1),(i-2)*1.7,.1,1.2,'#475569',.65);});if(step>=1){line([[-3.4,1.7,0],[-1.7,2.15,0],[0,1.7,0]],0xc3692c);label(step===2?'(1,2,3) 重复两次 · 满足 MOO 时得 2 分':'按 1 → 2 → 3 的顺序读',0,.1,2,'#9b5225',5);}
  cow(kit,-4.5,2.5,'Bessie',0x1e293b,.8);farmer(kit,4.5,2.5);label(`FJ 的棋盘 · ${boardMask.toString(2).padStart(5,'0')}`,0,3.2,0,'#0f172a',4.5);
 } else if(kind==='printing'){
  const vals=[1,1,2,1,1,2];vals.forEach((v,i)=>{box((i-2.5)*1.45,.4,0,1.2,.8,1.15,v===1?0x4f46e5:0xf59e0b);label(String(v),(i-2.5)*1.45,1.05,0,'#0f172a',.75);});if(step>0){box(-2.15,.03,0,4.2,.04,1.7,0x3b82f6,.2);box(2.15,.03,0,4.2,.04,1.7,0x238575,.2);label('重复块 [1, 1, 2] × 2',0,2.7,0,'#0f172a',4.5);}farmer(kit,-5,2.5);cow(kit,5,2.5,'Bessie',0x1e293b,.8);label(step>1?'FJ 写 2 条 PRINT · Bessie 读到 6 个数':'FJ 写程序，Bessie 检查输出',0,.4,3,'#238575',6);
 } else if(kind==='dp'){
  const vals=[1,1,2,3,5,8,13];vals.forEach((v,i)=>{box((i-3)*1.3,.2+i*.2,0,1.1,.4+i*.4,1.2,i===step?0xf59e0b:i<step?0x4f46e5:0xe2e8f0);label(i<=step?String(v):'?',(i-3)*1.3,.7+i*.4,0,'#0f172a',.75);label(`dp[${i}]`,(i-3)*1.3,.1,1.5,'#475569',.9);});if(step>=2)line([[(step-2-3)*1.3,2.8,0],[(step-1-3)*1.3,3.5,0],[(step-3)*1.3,3.5,0]],0xc38b4d);cow(kit,(step-3)*1.3,0,'Bessie',0x1e293b,.65,.4+step*.4);label('Bessie 每次走 1 或 2 阶 · 统计走法',0,5,0,'#0f172a',5.8);if(step>=2)line([[(step-1-3)*1.3,2.4,1],[(step-.5-3)*1.3,2.95,1],[(step-3)*1.3,3.1,1]],0x238575);
 } else {
  const vals=kind==='binary'?[1,3,4,7,9,12]:[4,2,7,1,3,5];
  vals.forEach((v,i)=>{const active=kind==='binary'?i===[2,4,3][step%3]:i===Math.min(step,5);const x=(i-2.5)*1.6;
   const trough=createTrough(kind==='binary'?0:v,active);trough.position.x=x;add(trough);
   if(active)box(x,.015,0,1.48,.025,1.12,0xd69749,.24);
   label(kind==='binary'?`${v} 升`:String(v),x,1.43,0,active?'#9b5225':'#0f172a',kind==='binary'?1.1:.68);
   label(`a[${i}]`,x,.08,.86,'#475569',.86);
  });
  const at=kind==='binary'?[2,4,3][step%3]:Math.min(step,5);cow(kit,(at-2.5)*1.6,1.85,'Bessie',0x1e293b,.78);farmer(kit,-5.15,1.5);
 }
 if(flat){camera.position.set(0,18,.01);controls.enableRotate=false;}
 const bounds=teachingBounds(objects);scene.add(createFarmEnvironment(bounds));
 function render(){renderer.render(scene,camera);}
 function frame(direction=camera.position.clone().sub(controls.target)){
  const w=node.clientWidth,h=node.clientHeight;if(!w||!h)return;
  camera.aspect=w/h;camera.zoom=zoomValue.current;
  // Use fill=0.68 so the floating isometric diorama island and surrounding studio margin are framed cleanly.
  controls.target.copy(fitTeachingCamera(camera,bounds,direction,.68));
  renderer.setSize(w,h);controls.update();render();
 }
 changeZoom.current=value=>{zoomValue.current=clampSceneZoom(value);setZoom(zoomValue.current);camera.zoom=zoomValue.current;camera.updateProjectionMatrix();render();};
 resetView.current=()=>{zoomValue.current=1;setZoom(1);frame(flat?new THREE.Vector3(0,18,.01):defaultDirection);};
 controls.addEventListener('change',render);const ro=new ResizeObserver(()=>frame());ro.observe(node);frame();
 return()=>{cam.current={kind,direction:camera.position.clone().sub(controls.target)};ro.disconnect();controls.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(mat=>{if(mat){const mp=(mat as THREE.MeshStandardMaterial).map;if(mp)mp.dispose();mat.dispose();}})});renderer.dispose();renderer.domElement.remove();};

 },[kind,step,interval.join(','),boardMask,flat]);
 return <div className="scene" ref={host} role="group" aria-label={`${kind} 三维教学场景，第 ${step} 步`}>{failed&&<div className="scene-fallback">3D 显示不可用，请使用下方二维示意与步骤讲解。</div>}<span className="scene-help">拖动旋转 · 滚轮浏览页面</span><SceneZoomControls zoom={zoom} onChange={v=>changeZoom.current(v)} onFit={()=>resetView.current()}/></div>
}
