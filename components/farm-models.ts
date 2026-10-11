import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Small local meshes keep the moving feed/water separate from their containers.
// Dimensions and counts come from the lesson, without a remote model request.
function material(color:THREE.ColorRepresentation,metalness=0,roughness=.75){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function part(group:THREE.Group,geometry:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function round(group:THREE.Group,w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,r=.05){return part(group,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),mat,x,y,z);}
function oval(group:THREE.Group,size:[number,number,number],mat:THREE.Material,x:number,y:number,z:number){const m=part(group,new THREE.SphereGeometry(1,18,12),mat,x,y,z);m.scale.set(...size);return m;}
function rod(group:THREE.Group,a:number[],b:number[],radius:number,mat:THREE.Material){const start=new THREE.Vector3(...a as [number,number,number]),end=new THREE.Vector3(...b as [number,number,number]),delta=end.clone().sub(start);const m=part(group,new THREE.CylinderGeometry(radius,radius,delta.length(),10),mat);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}

export function createCow(accent:THREE.ColorRepresentation=0x263a4d){
 const g=new THREE.Group();g.name='cow';const white=material(0xf5f1e6),black=material(accent),pink=material(0xd6a298),horn=material(0xcdbb98),eye=material(0x18232b);
 oval(g,[.62,.34,.34],white,0,.85,0);oval(g,[.26,.34,.27],white,.48,1.03,.07);
 oval(g,[.29,.3,.26],white,.55,1.16,.2);oval(g,[.28,.14,.16],pink,.55,1.02,.43);
 for(const x of [-.37,.37])for(const z of [-.21,.21]){rod(g,[x,.12,z],[x,.74,z],.075,white);round(g,.17,.14,.19,black,x,.09,z);}
 oval(g,[.22,.21,.035],black,-.22,.9,.322);oval(g,[.15,.18,.03],black,.17,.85,-.325);oval(g,[.18,.025,.21],black,-.18,1.17,.01);
 for(const x of [.39,.72]){oval(g,[.035,.043,.02],eye,x,1.24,.423);oval(g,[.028,.021,.017],black,x,1.035,.577);}
 for(const x of [.22,.87]){const ear=oval(g,[.16,.07,.09],white,x,1.32,.16);ear.rotation.z=x<.5?.3:-.3;oval(g,[.11,.03,.06],pink,x,1.354,.185);part(g,new THREE.ConeGeometry(.048,.2,10),horn,x<.5?.36:.73,1.5,.12);}
 const tail=new THREE.CatmullRomCurve3([new THREE.Vector3(-.58,.95,0),new THREE.Vector3(-.75,.82,0),new THREE.Vector3(-.8,.43,.04)]);
 part(g,new THREE.TubeGeometry(tail,10,.025,6,false),white);oval(g,[.06,.1,.055],black,-.8,.4,.04);
 return g;
}
export function createFarmer(){
 const g=new THREE.Group();g.name='farmer';const shirt=material(0x527c86),overalls=material(0x2b5677),skin=material(0xdab08c),hat=material(0xbb8a45),boots=material(0x534839);
 round(g,.5,.57,.34,shirt,0,1.02,0,.1);round(g,.3,.36,.365,overalls,0,.83,0,.06);
 for(const s of [-1,1]){rod(g,[s*.14,.16,0],[s*.14,.72,0],.1,overalls);round(g,.22,.18,.35,boots,s*.14,.09,.06);rod(g,[s*.26,1.2,0],[s*.35,.82,.05],.075,shirt);oval(g,[.075,.09,.075],skin,s*.35,.74,.05);round(g,.045,.43,.045,overalls,s*.13,1.04,.185,.01);}
 oval(g,[.21,.25,.2],skin,0,1.51,0);oval(g,[.16,.06,.1],material(0x75614e),0,1.42,.17);
 const brim=part(g,new THREE.CylinderGeometry(.39,.39,.05,28),hat,0,1.74,0);brim.scale.z=.8;const crown=part(g,new THREE.CylinderGeometry(.21,.24,.19,24),hat,0,1.84,0);crown.scale.z=.85;
 for(const x of [-.075,.075])oval(g,[.018,.023,.015],material(0x243645),x,1.54,.186);
 return g;
}
export function createTrough(portions:number,active=false){
 const g=new THREE.Group();g.name='feeding-trough';const steel=material(active?0xaf713a:0x84979d,.52,.44),rim=material(active?0xe2ac64:0xb8c6c7,.65,.3),stand=material(0x596465,.35,.6),hay=material(0xd2b14d),straw=material(0x9e8438);
 const shape=new THREE.Shape();shape.moveTo(.47,0);
 for(let i=1;i<=24;i++){const t=i/24*Math.PI;shape.lineTo(.47*Math.cos(t),-.49*Math.sin(t));}
 for(let i=24;i>=0;i--){const t=i/24*Math.PI;shape.lineTo(.41*Math.cos(t),-.42*Math.sin(t));}shape.closePath();
 const body=part(g,new THREE.ExtrudeGeometry(shape,{depth:1.25,bevelEnabled:false,steps:1}),steel,-.625,.99,0);body.rotation.y=Math.PI/2;
 const cap=new THREE.Shape();cap.moveTo(.47,0);for(let i=1;i<=24;i++){const t=i/24*Math.PI;cap.lineTo(.47*Math.cos(t),-.49*Math.sin(t));}cap.closePath();
 for(const x of [-.64,.61]){const end=part(g,new THREE.ExtrudeGeometry(cap,{depth:.03,bevelEnabled:false}),steel,x,.99,0);end.rotation.y=Math.PI/2;}
 for(const z of [-.46,.46])rod(g,[-.64,.99,z],[.64,.99,z],.035,rim);
 for(const x of [-.45,.45]){for(const z of [-.33,.33])rod(g,[x,.05,z],[x,.79,z*.58],.035,stand);rod(g,[x,.05,-.4],[x,.05,.4],.035,stand);}
 rod(g,[-.48,.28,0],[.48,.28,0],.03,stand);
 // Each separate bundle is one portion, arranged inside the hollow basin.
 const rows=Math.ceil(portions/3);
 for(let i=0;i<portions;i++){
  const feed=new THREE.Group();feed.name='feed-portion';feed.position.set((i%3-1)*.32,.83,((Math.floor(i/3)-(rows-1)/2)*.2));g.add(feed);
  oval(feed,[.15,.095,.1],hay,0,0,0);
  for(let n=0;n<4;n++)rod(feed,[-.11+n*.055,.07,-.075],[.045+n*.026,.085,.07],.006,straw);
 }
 return g;
}
export function createBucket(value:number,capacity:number){
 const g=new THREE.Group();g.name='milk-bucket';const metal=material(0x96aab0,.55,.4),edge=material(0xd0d8d7,.65,.25),milk=material(0xf2eee0,0,.34);
 const profile=[new THREE.Vector2(.64,1.9),new THREE.Vector2(.49,.14),new THREE.Vector2(.42,.14),new THREE.Vector2(.57,1.9)];
 // Front cutaway exposes the actual fill level, with the back wall left intact.
 part(g,new THREE.LatheGeometry(profile,32,Math.PI/2,Math.PI),metal);
 part(g,new THREE.CylinderGeometry(.49,.49,.09,28),metal,0,.12,0);
 const lip=part(g,new THREE.TorusGeometry(.615,.028,8,36),edge,0,1.9,0);lip.rotation.x=Math.PI/2;
 if(value>0){const h=value/capacity*1.67,top=.43+.15*(h/1.67);part(g,new THREE.CylinderGeometry(top,.43,h,32),milk,0,.2+h/2,0);}
 const handle=new THREE.CatmullRomCurve3([new THREE.Vector3(-.62,1.67,0),new THREE.Vector3(-.66,2.2,0),new THREE.Vector3(0,2.5,0),new THREE.Vector3(.66,2.2,0),new THREE.Vector3(.62,1.67,0)]);
 part(g,new THREE.TubeGeometry(handle,24,.025,8,false),edge);
 for(let i=1;i<=4;i++){const y=.2+i*1.67/4;rod(g,[.67,y,-.04],[.78,y,-.04],.015,metal);}
 return g;
}
export function createHayBale(color:THREE.ColorRepresentation=0xcbaa52){
 const g=new THREE.Group();g.name='hay-bale';const hay=material(color),string=material(0x97723a);round(g,.44,.35,.7,hay,0,0,0,.07);
 for(const z of [-.2,.2]){rod(g,[-.222,.13,z],[.222,.13,z],.009,string);rod(g,[-.225,-.13,z],[-.225,.13,z],.009,string);rod(g,[.225,-.13,z],[.225,.13,z],.009,string);}
 for(let i=0;i<5;i++)rod(g,[-.14+i*.07,.178,-.31],[-.12+i*.07,.178,.31],.005,string);
 return g;
}
export function createBarn(color:THREE.ColorRepresentation){
 const g=new THREE.Group();g.name='barn';const timber=material(color),trim=material(0xf1e4c9),roof=material(0x435463);
 round(g,1.3,1.35,1.2,timber,0,.69,0,.035);
 for(const side of [-1,1]){const r=round(g,.94,.09,1.46,roof,side*.37,1.62,0,.02);r.rotation.z=-side*.56;}
 const triangle=new THREE.Shape();triangle.moveTo(-.65,0);triangle.lineTo(.65,0);triangle.lineTo(0,.43);triangle.closePath();part(g,new THREE.ShapeGeometry(triangle),timber,0,1.35,.605);
 round(g,.72,1.02,.04,trim,0,.54,.63,.015);round(g,.63,.93,.055,material(0x674e3d),0,.51,.66,.01);
 rod(g,[-.27,.11,.7],[.27,.94,.7],.018,trim);rod(g,[.27,.11,.7],[-.27,.94,.7],.018,trim);
 for(const x of [-.55,-.4,.4,.55])rod(g,[x,.08,.611],[x,1.3,.611],.012,trim);
 return g;
}
