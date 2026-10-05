'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {isStoryKind,type StoryKind} from '@/lib/farm-scenarios';
import {drawFarmScene} from './farm-scene';
import {cow,farmer} from './farm-actors';
export type SceneKind=StoryKind|'fence'|'cheese'|'reflection'|'moo'|'printing'|'array'|'dp'|'binary';
export const cheeseMoves=[[0,0,0],[1,1,1],[0,1,0],[1,0,0],[1,1,0]];
export function cheeseCount(step:number){let count=0;const removed=new Set(cheeseMoves.slice(0,step).map(x=>x.join(',')));for(let axis=0;axis<3;axis++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){let ok=true;for(let i=0;i<2;i++){let p=axis===0?[i,a,b]:axis===1?[a,i,b]:[a,b,i];if(!removed.has(p.join(',')))ok=false;}if(ok)count++;}return count;}
export function LearningScene({kind,step=0,interval=[7,10,4,8],boardMask=17,flat=false,onUnavailable}:{kind:SceneKind,step?:number,interval?:number[],boardMask?:number,flat?:boolean,onUnavailable?:()=>void}){
 const host=useRef<HTMLDivElement>(null);const cam=useRef<number[]|null>(null);const [failed,setFailed]=useState(false);
 useEffect(()=>{if(!host.current)return; const node=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setFailed(true);onUnavailable?.();return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.setClearColor('#eaf2f7');renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;node.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(...((cam.current||[11,9,14]) as [number,number,number]));
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.enableDamping=false;controls.minDistance=7;controls.maxDistance=30;controls.maxPolarAngle=Math.PI/2.02;controls.enablePan=false;controls.enableZoom=false;
 scene.add(new THREE.HemisphereLight(0xffffff,0xa7b1bf,1.5));const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-4,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});scene.add(sun);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xeaf2f7,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.04;scene.add(ground);
 const grid=new THREE.GridHelper(24,24,0xdde4ec,0xe8edf2);grid.position.y=-.025;scene.add(grid);
 const meshes:THREE.Object3D[]=[];
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:THREE.ColorRepresentation,opacity=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.72,transparent:opacity<1,opacity}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);meshes.push(m);return m;}
 function label(text:string,x:number,y:number,z:number,color='#24384c',width=2.2){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.roundRect(4,4,504,120,20);ctx.fill();ctx.fillStyle=color;ctx.font='500 45px Arial,"PingFang SC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,66,480);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sp.position.set(x,y,z);sp.scale.set(width,width/4,1);scene.add(sp);return sp;}
 function line(points:number[][],color=0x446f93){const g=new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v as [number,number,number])));scene.add(new THREE.Line(g,new THREE.LineBasicMaterial({color})));}
 const kit={box,label,line};
 if(isStoryKind(kind)){drawFarmScene(kit,kind,step);camera.position.copy(new THREE.Vector3(...((cam.current||[6,8,15]) as [number,number,number])));}
 else if(kind==='fence'){
  const [a,b,c,d]=interval;for(let x=0;x<12;x++){const fj=step>=1&&x>=a&&x<b,bs=step>=2&&x>=c&&x<d;const col=fj&&bs&&step>=3?0x8972ba:bs?0xc99152:fj?0x4a7da5:0xd4dce3;box(x-5.5,1.15,0,.94,1.8,.18,col);label(String(x),x-6,.23,.5,'#6a7885',.45);}label('12',6,.23,.5,'#6a7885',.5);
  for(const x of [-6,0,6])box(x,1,0,.16,2.1,.28,0x8999a8);
  box(0,.7,-.14,12,.12,.12,0xa4b0bb);box(0,1.6,-.14,12,.12,.12,0xa4b0bb);
  // Farmer and cow are manipulable 3D teaching models, tied to the interval actors.
  const fx=(a+b)/2-6;box(fx,.83,1.8,.45,.8,.35,0x3d6e97);box(fx,1.47,1.8,.4,.4,.4,0xdfb997);box(fx,1.72,1.8,.8,.1,.65,0xb68e57);box(fx,1.82,1.8,.42,.19,.4,0xb68e57);for(let s of [-1,1])box(fx+s*.14,.3,1.8,.17,.6,.24,0x3f4651);box(fx+.4,.9,1.7,.4,.13,.15,0xdfb997);box(fx+.65,1.2,1.3,.12,.65,.12,0xb68e57);box(fx+.65,1.55,1.3,.36,.18,.16,0x4a7da5);label('FJ',fx,2.4,1.8,'#315e87',1.05);
  const bx=(c+d)/2-6;box(bx,.78,2,1.1,.65,.58,0xfafafa);box(bx+.35,1.05,1.7,.55,.55,.5,0xfafafa);box(bx+.4,.94,1.43,.52,.24,.19,0xdba9a0);box(bx-.15,.83,2.31,.37,.35,.015,0x3c4650);box(bx+.15,1.36,1.68,.16,.12,.22,0xc59d64);for(let x of [-.35,.35])for(let z of [-.2,.2])box(bx+x,.3,2+z,.13,.55,.14,0x39424d);label('Bessie',bx,2.05,2,'#9b632d',1.45);
  label('x · 每小段长度 = 1',0,.1,3.8,'#5c6b79',3.2);camera.position.copy(new THREE.Vector3(...((cam.current||[5,6,15]) as [number,number,number])));
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
  const vals=kind==='binary'?[1,3,4,7,9,12]:[4,2,7,1,3,5];vals.forEach((v,i)=>{const active=kind==='binary'?i===[2,4,3][step%3]:i===Math.min(step,5);box((i-2.5)*1.45,v*.15,0,1.12,v*.3,1.1,active?0xc38b4d:i<step?0x5c87a8:0xaac0d2);label(String(v),(i-2.5)*1.45,v*.3+.45,0,'#29485f',.8);label(`a[${i}]`,(i-2.5)*1.45,.1,1.25,'#637787',1);});const at=kind==='binary'?[2,4,3][step%3]:Math.min(step,5);cow(kit,(at-2.5)*1.45,2.1,'Bessie',0x263a4d,.72);farmer(kit,-5,2.7);label(kind==='binary'?'FJ 按容量排牛槽 · 找到容量 7':'FJ 的六个牛槽 · 数字是草料份数',0,4.8,0,'#345b77',5.5);
 }
 if(flat){camera.position.set(0,18,.01);controls.enableRotate=false;controls.target.set(0,0,0);}controls.update();
 function render(){if(!node.clientWidth)return;camera.aspect=node.clientWidth/node.clientHeight;camera.updateProjectionMatrix();renderer.setSize(node.clientWidth,node.clientHeight);renderer.render(scene,camera);}
 controls.addEventListener('change',render);const ro=new ResizeObserver(render);ro.observe(node);render();
 return()=>{cam.current=camera.position.toArray();ro.disconnect();controls.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(mat=>{if(mat){const mp=(mat as THREE.MeshStandardMaterial).map;if(mp)mp.dispose();mat.dispose();}})});renderer.dispose();renderer.domElement.remove();};
 },[kind,step,interval.join(','),boardMask,flat]);
 return <div className="scene" ref={host} role="img" aria-label={`${kind} 三维教学场景，第 ${step} 步`}>{failed&&<div className="scene-fallback">3D 显示不可用，请使用下方二维示意与步骤讲解。</div>}<span className="scene-help">拖动旋转 · 滚轮浏览页面</span></div>
}
