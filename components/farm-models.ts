import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Small local meshes keep the moving feed/water separate from their containers.
// Dimensions and counts come from the lesson, without a remote model request.
function material(color:THREE.ColorRepresentation,metalness=0,roughness=.58){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function part(group:THREE.Group,geometry:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function round(group:THREE.Group,w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,r=.05){return part(group,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,x,y,z);}
function oval(group:THREE.Group,size:[number,number,number],mat:THREE.Material,x:number,y:number,z:number){const m=part(group,new THREE.SphereGeometry(1,22,16),mat,x,y,z);m.scale.set(...size);return m;}
function rod(group:THREE.Group,a:number[],b:number[],radius:number,mat:THREE.Material){const start=new THREE.Vector3(...a as [number,number,number]),end=new THREE.Vector3(...b as [number,number,number]),delta=end.clone().sub(start);const m=part(group,new THREE.CylinderGeometry(radius,radius,delta.length(),12),mat);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}

export function createCow(accent:THREE.ColorRepresentation=0x1e293b){
 const g=new THREE.Group();g.name='cow';
 const white=material(0xffffff,.02,.48),spot=material(accent,.03,.52),pink=material(0xfda4af,.02,.45),horn=material(0xfde68a,.05,.4),eye=material(0x0f172a,.1,.2),bellGold=material(0xf59e0b,.45,.3);
 oval(g,[.62,.35,.35],white,0,.85,0);oval(g,[.27,.35,.28],white,.48,1.03,.07);
 oval(g,[.3,.31,.27],white,.55,1.16,.2);oval(g,[.29,.15,.17],pink,.55,1.02,.43);
 for(const x of [-.37,.37])for(const z of [-.21,.21]){rod(g,[x,.12,z],[x,.74,z],.078,white);round(g,.175,.14,.195,spot,x,.09,z,.04);}
 oval(g,[.23,.22,.038],spot,-.22,.9,.322);oval(g,[.16,.19,.032],spot,.17,.85,-.325);oval(g,[.19,.028,.22],spot,-.18,1.17,.01);
 for(const x of [.39,.72]){oval(g,[.038,.046,.022],eye,x,1.24,.423);oval(g,[.026,.02,.017],spot,x,1.035,.577);}
 for(const x of [.22,.87]){const ear=oval(g,[.16,.075,.09],white,x,1.32,.16);ear.rotation.z=x<.5?.3:-.3;oval(g,[.11,.032,.06],pink,x,1.354,.185);part(g,new THREE.ConeGeometry(.05,.2,12),horn,x<.5?.36:.73,1.5,.12);}
 oval(g,[.065,.07,.065],bellGold,.52,.78,.22);
 const tail=new THREE.CatmullRomCurve3([new THREE.Vector3(-.58,.95,0),new THREE.Vector3(-.75,.82,0),new THREE.Vector3(-.8,.43,.04)]);
 part(g,new THREE.TubeGeometry(tail,12,.026,8,false),white);oval(g,[.065,.1,.06],spot,-.8,.4,.04);
 return g;
}
export function createFarmer(){
 const g=new THREE.Group();g.name='farmer';
 const shirt=material(0xea580c,.02,.55),overalls=material(0x2563eb,.04,.52),skin=material(0xfdba74,.02,.48),hat=material(0xf59e0b,.05,.5),hatBand=material(0x78350f,.05,.6),boots=material(0x451a03,.08,.55);
 round(g,.5,.57,.34,shirt,0,1.02,0,.1);round(g,.31,.37,.37,overalls,0,.83,0,.07);
 for(const s of [-1,1]){rod(g,[s*.14,.16,0],[s*.14,.72,0],.105,overalls);round(g,.22,.18,.35,boots,s*.14,.09,.06,.05);rod(g,[s*.26,1.2,0],[s*.35,.82,.05],.078,shirt);oval(g,[.078,.09,.078],skin,s*.35,.74,.05);round(g,.048,.43,.048,overalls,s*.13,1.04,.185,.015);}
 oval(g,[.215,.25,.205],skin,0,1.51,0);oval(g,[.16,.06,.1],material(0x78350f),0,1.42,.17);
 const brim=part(g,new THREE.CylinderGeometry(.4,.4,.05,28),hat,0,1.74,0);brim.scale.z=.82;
 const ribbon=part(g,new THREE.CylinderGeometry(.228,.235,.045,24),hatBand,0,1.78,0);ribbon.scale.z=.85;
 const crown=part(g,new THREE.CylinderGeometry(.21,.24,.19,24),hat,0,1.85,0);crown.scale.z=.85;
 for(const x of [-.075,.075])oval(g,[.02,.025,.016],material(0x0f172a),x,1.54,.188);
 return g;
}
export function createTrough(portions:number,active=false){
 const g=new THREE.Group();g.name='feeding-trough';const steel=material(active?0xd97706:0x64748b,.45,.38),rim=material(active?0xfbbf24:0x94a3b8,.55,.28),stand=material(0x475569,.35,.55),hay=material(0xeab308,.05,.55),straw=material(0xca8a04,.05,.6);
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
 const g=new THREE.Group();g.name='milk-bucket';const metal=material(0x94a3b8,.52,.32),edge=material(0xe2e8f0,.65,.22),milk=material(0xfffbeb,.02,.25);
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
export function createHayBale(color:THREE.ColorRepresentation=0xeab308){
 const g=new THREE.Group();g.name='hay-bale';const hay=material(color,.02,.58),string=material(0x92400e,.05,.65);round(g,.44,.35,.7,hay,0,0,0,.07);
 for(const z of [-.2,.2]){rod(g,[-.222,.13,z],[.222,.13,z],.009,string);rod(g,[-.225,-.13,z],[-.225,.13,z],.009,string);rod(g,[.225,-.13,z],[.225,.13,z],.009,string);}
 for(let i=0;i<5;i++)rod(g,[-.14+i*.07,.178,-.31],[-.12+i*.07,.178,.31],.005,string);
 return g;
}
export function createBarn(color:THREE.ColorRepresentation){
 const g=new THREE.Group();g.name='barn';const timber=material(color,.04,.62),trim=material(0xfef3c7,.02,.5),roof=material(0x334155,.15,.55);
 round(g,1.3,1.35,1.2,timber,0,.69,0,.04);
 for(const side of [-1,1]){const r=round(g,.94,.09,1.46,roof,side*.37,1.62,0,.02);r.rotation.z=-side*.56;}
 const triangle=new THREE.Shape();triangle.moveTo(-.65,0);triangle.lineTo(.65,0);triangle.lineTo(0,.43);triangle.closePath();part(g,new THREE.ShapeGeometry(triangle),timber,0,1.35,.605);
 round(g,.72,1.02,.04,trim,0,.54,.63,.015);round(g,.63,.93,.055,material(0x78350f),0,.51,.66,.01);
 rod(g,[-.27,.11,.7],[.27,.94,.7],.018,trim);rod(g,[.27,.11,.7],[-.27,.94,.7],.018,trim);
 for(const x of [-.55,-.4,.4,.55])rod(g,[x,.08,.611],[x,1.3,.611],.012,trim);
 return g;
}
