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
 useEffect(()=>{if(!host.current)return; const node=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setFailed(true);onUnavailable?.();return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.setClearColor('#eaf2f7');renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;node.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 const defaultDirection=new THREE.Vector3(...(kind==='fence'?[.22,.55,1.4]:kind==='cheese'?[1,.8,1.4]:[.2,.75,1.5]) as [number,number,number]);camera.position.copy(cam.current?.kind===kind?cam.current.direction:defaultDirection);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=false;controls.maxPolarAngle=Math.PI/2.02;controls.enablePan=false;controls.enableZoom=false;
 scene.add(new THREE.HemisphereLight(0xffffff,0xa7b1bf,1.5));const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-4,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});scene.add(sun);
 const objects:THREE.Object3D[]=[];
 function add(object:THREE.Object3D){scene.add(object);objects.push(object);}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:THREE.ColorRepresentation,opacity=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.72,transparent:opacity<1,opacity}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;add(m);return m;}
 function label(text:string,x:number,y:number,z:number,color='#24384c',width=2.2){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.roundRect(4,4,504,120,20);ctx.fill();ctx.fillStyle=color;ctx.font='500 45px Arial,"PingFang SC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,66,480);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,toneMapped:false}));sp.position.set(x,y,z);sp.scale.set(width,width/4,1);add(sp);return sp;}
 function line(points:number[][],color=0x446f93){const g=new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v as [number,number,number])));add(new THREE.Line(g,new THREE.LineBasicMaterial({color})));}
 const kit={add,box,label,line};
 if(isStoryKind(kind)){drawFarmScene(kit,kind,step);}
 else if(kind==='fence'){
  const [a,b,c,d]=interval;for(let x=0;x<12;x++){const fj=step>=1&&x>=a&&x<b,bs=step>=2&&x>=c&&x<d;const col=fj&&bs&&step>=3?0x8972ba:bs?0xc99152:fj?0x4a7da5:0xd4dce3;box(x-5.5,1.15,0,.94,1.8,.18,col);label(String(x),x-6,.23,.5,'#6a7885',.45);}label('12',6,.23,.5,'#6a7885',.5);
  for(const x of [-6,0,6])box(x,1,0,.16,2.1,.28,0x8999a8);
  box(0,.7,-.14,12,.12,.12,0xa4b0bb);box(0,1.6,-.14,12,.12,.12,0xa4b0bb);
  const fx=(a+b)/2-6,bx=(c+d)/2-6;farmer(kit,fx,1.6);cow(kit,bx,1.65,'Bessie');
  box(fx+.48,1.05,1.25,.08,.8,.08,0x9b764c);box(fx+.48,1.48,1.25,.3,.16,.14,0x4a7da5);
  label('x · 每小段长度 = 1',0,.1,3,'#5c6b79',3.2);
 } else if(kind==='cheese'){
  const removed=new Set(cheeseMoves.slice(0,step).map(x=>x.join(',')));for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++){
   const m=box((x-.5)*2,1.05+y*2,(z-.5)*2,1.9,1.9,1.9,0xe8b74c,removed.has([x,y,z].join(','))?.07:1);
   if(!removed.has([x,y,z].join(',')))label(`${x},${y},${z}`,(x-.5)*2,1.4+y*2,(z-.5)*2,'#785c25',1.4);
   scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0xb6a06a,transparent:true,opacity:.25})).translateX(m.position.x).translateY(m.position.y).translateZ(m.position.z));
  }
  for(let axis=0;axis<3;axis++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){let coords=[];for(let i=0;i<2;i++)coords.push(axis===0?[i,a,b]:axis===1?[a,i,b]:[a,b,i]);if(coords.every(p=>removed.has(p.join(',')))){const p=coords[0];const cx=(p[0]-.5)*2,cy=1.05+p[1]*2,cz=(p[2]-.5)*2;box(axis===0?0:cx,axis===1?2.05:cy,axis===2?0:cz,axis===0?4.2:.28,axis===1?4.2:.28,axis===2?4.2:.28,0x4e91a1,.8);}}
  farmer(kit,-4,2);cow(kit,4,2,'Bessie',0x263a4d,.85);label('FJ 移除奶酪，Bessie 找通道',0,5.5,0,'#326a78',5);label(`空通道 ${cheeseCount(step)}`,0,.3,4,'#326a78',2.3);line([[0,.05,0],[3,.05,0]],0xc3692c);label('x',3.4,.15,0,'#9c4b21',.6);label('y · 向上',-2.8,4,0,'#275a7b',1.7);label('z',0,.15,3.1,'#237667',.6);
 } else if(kind==='reflection'){
  const rows=['..#.','..#.','#..#','####'];for(let r=0;r<4;r++)for(let c=0;c<4;c++){const group=(r===0||r===3)&&(c===1||c===2);box((c-1.5)*1.4,.15,(r-1.5)*1.4,1.26,.3,1.26,group&&step===1?0xd59c58:(group&&step>=3||rows[r][c]==='#')?0x3e607e:0xdde5ec);if(group&&step>0)label(step>=3?'已统一':'同一组',(c-1.5)*1.4,.8,(r-1.5)*1.4,'#855320',1.2);}line([[0,.4,-3],[0,.4,3]],0xb06d58);line([[-3,.4,0],[3,.4,0]],0xb06d58);farmer(kit,-4,1);cow(kit,4,1,'Bessie',0x263a4d,.8);label(step>=3?'补涂 1 格 · 四格统一':'FJ 的画布 · 3 格涂色，1 格空白',0,3.2,0,'#345b77',5);
 } else if(kind==='moo'){
  const a=Array.from({length:5},(_,i)=>(boardMask>>i)&1?'M':'O');a.forEach((v,i)=>{box((i-2)*1.7,.5,0,1.4,1,1.4,step>=1&&i<3?0xcc873f:v==='M'?0x47799f:0xcbd6df);label(v,(i-2)*1.7,1.3,0,'#233b50',1);label(String(i+1),(i-2)*1.7,.1,1.2,'#6c7f8e',.6);});if(step>=1){line([[-3.4,1.7,0],[-1.7,1.7,0],[0,1.7,0]],0xc3692c);label(step===2?'(1,2,3) 重复两次 · 满足 MOO 时得 2 分':'按 1 → 2 → 3 的顺序读',0,.1,2,'#9b5225',5);}
  cow(kit,-4.5,2.5,'Bessie',0x263a4d,.8);farmer(kit,4.5,2.5);label(`FJ 的棋盘 · ${boardMask.toString(2).padStart(5,'0')}`,0,3.2,0,'#345b77',4.5);
 } else if(kind==='printing'){
  const vals=[1,1,2,1,1,2];vals.forEach((v,i)=>{box((i-2.5)*1.45,.4,0,1.2,.8,1.15,v===1?0x507c9d:0xd0a362);label(String(v),(i-2.5)*1.45,1.05,0,'#31495e',.75);});if(step>0){box(-2.15,.09,0,4.2,.1,1.7,0x52748d,.2);box(2.15,.09,0,4.2,.1,1.7,0x52748d,.2);label('重复块 [1, 1, 2] × 2',0,2.7,0,'#536b80',4.5);}farmer(kit,-5,2.5);cow(kit,5,2.5,'Bessie',0x263a4d,.8);label(step>1?'FJ 写 2 条 PRINT · Bessie 读到 6 个数':'FJ 写程序，Bessie 检查输出',0,.4,3,'#326f69',6);
 } else if(kind==='dp'){
  const vals=[1,1,2,3,5,8,13];vals.forEach((v,i)=>{box((i-3)*1.3,.2+i*.2,0,1.1,.4+i*.4,1.2,i===step?0xc38b4d:i<step?0x527da0:0xd5dfe8);label(i<=step?String(v):'?',(i-3)*1.3,.7+i*.4,0,'#29485f',.75);label(`dp[${i}]`,(i-3)*1.3,.1,1.5,'#637787',.9);});if(step>=2)line([[(step-2-3)*1.3,2.8,0],[(step-3)*1.3,3.5,0]],0xc38b4d);cow(kit,(step-3)*1.3,0,'Bessie',0x263a4d,.65,.4+step*.4);label('Bessie 每次走 1 或 2 阶 · 统计走法',0,5,0,'#345b77',5.8);if(step>=2)line([[(step-1-3)*1.3,2.4,1],[(step-3)*1.3,3.1,1]],0x238575);
 } else {
  const vals=kind==='binary'?[1,3,4,7,9,12]:[4,2,7,1,3,5];
  vals.forEach((v,i)=>{const active=kind==='binary'?i===[2,4,3][step%3]:i===Math.min(step,5);const x=(i-2.5)*1.6;
   const trough=createTrough(kind==='binary'?0:v,active);trough.position.x=x;add(trough);
   if(active)box(x,.015,0,1.48,.025,1.12,0xd69749,.24);
   label(kind==='binary'?`${v} 升`:String(v),x,1.43,0,active?'#9b5225':'#29485f',kind==='binary'?1.1:.65);
   label(`a[${i}]`,x,.08,.86,'#637787',.86);
  });
  const at=kind==='binary'?[2,4,3][step%3]:Math.min(step,5);cow(kit,(at-2.5)*1.6,1.85,'Bessie',0x263a4d,.78);farmer(kit,-5.15,1.5);

 }
 if(flat){camera.position.set(0,18,.01);controls.enableRotate=false;}
 const bounds=teachingBounds(objects);scene.add(createFarmEnvironment(bounds));
 function render(){renderer.render(scene,camera);}
 function frame(direction=camera.position.clone().sub(controls.target)){
  const w=node.clientWidth,h=node.clientHeight;if(!w||!h)return;
  camera.aspect=w/h;camera.zoom=zoomValue.current;controls.target.copy(fitTeachingCamera(camera,bounds,direction));renderer.setSize(w,h);controls.update();render();
 }
 changeZoom.current=value=>{zoomValue.current=clampSceneZoom(value);setZoom(zoomValue.current);camera.zoom=zoomValue.current;camera.updateProjectionMatrix();render();};
 resetView.current=()=>{zoomValue.current=1;setZoom(1);frame(flat?new THREE.Vector3(0,18,.01):defaultDirection);};
 controls.addEventListener('change',render);const ro=new ResizeObserver(()=>frame());ro.observe(node);frame();
 return()=>{cam.current={kind,direction:camera.position.clone().sub(controls.target)};ro.disconnect();controls.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(mat=>{if(mat){const mp=(mat as THREE.MeshStandardMaterial).map;if(mp)mp.dispose();mat.dispose();}})});renderer.dispose();renderer.domElement.remove();};

 },[kind,step,interval.join(','),boardMask,flat]);
 return <div className="scene" ref={host} role="group" aria-label={`${kind} 三维教学场景，第 ${step} 步`}>{failed&&<div className="scene-fallback">3D 显示不可用，请使用下方二维示意与步骤讲解。</div>}<span className="scene-help">拖动旋转 · 滚轮浏览页面</span><SceneZoomControls zoom={zoom} onChange={v=>changeZoom.current(v)} onFit={()=>resetView.current()}/></div>
}
