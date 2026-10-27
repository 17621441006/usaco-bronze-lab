import * as THREE from 'three';
import {createBarn} from './farm-models';

/** Decorative scenery only: add directly to the scene, never to teachingBounds. */
export function createFarmEnvironment(bounds:THREE.Box3):THREE.Group{
 const group=new THREE.Group();group.name='farm-environment';
 const safe=bounds.isEmpty()?new THREE.Box3(new THREE.Vector3(-4,0,-2),new THREE.Vector3(4,3,2)):bounds;
 const center=safe.getCenter(new THREE.Vector3()),size=safe.getSize(new THREE.Vector3());
 const yardWidth=Math.max(7.0,size.x+2.2),yardDepth=Math.max(5.2,size.z+2.0),unit=THREE.MathUtils.clamp(Math.max(size.x,size.z)/10,.88,1.35);
 const left=center.x-yardWidth/2,right=center.x+yardWidth/2,back=center.z-yardDepth/2,front=center.z+yardDepth/2;
 const material=(color:THREE.ColorRepresentation,roughness=.78,metalness=.02)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const plinthRim=material(0x9c6d44,.58,.06),plinthSoil=material(0x5c3d24,.88,0),shadowPadMat=new THREE.MeshBasicMaterial({color:0x94a3b8,transparent:true,opacity:.24});
 const grass=material(0x5b8a42,.82,0),innerLawn=material(0x6da14f,.8,0),stripeLawn=material(0x76ad57,.8,0),path=material(0xe2d5be,.84,0),timber=material(0xa8703e,.62,.04),bark=material(0x6e4d35,.84,0),leaves=material(0x3f6e33,.76,0),lightLeaves=material(0x689f4c,.72,0),field=material(0x8c5828,.85,0),hay=material(0xdfa035,.74,0),rope=material(0x7c3f16,.8,0);
 const cube=new THREE.BoxGeometry(1,1,1),ball=new THREE.IcosahedronGeometry(1,2),cylinder=new THREE.CylinderGeometry(1,1,1,14);
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3();
 type Instance={x:number;y:number;z:number;sx:number;sy:number;sz:number;rotation?:number};
 function instances(name:string,geometry:THREE.BufferGeometry,mat:THREE.Material,values:Instance[],shadows=false){
  const mesh=new THREE.InstancedMesh(geometry,mat,values.length);mesh.name=name;mesh.castShadow=shadows;mesh.receiveShadow=true;
  values.forEach((v,i)=>{position.set(v.x,v.y,v.z);scale.set(v.sx,v.sy,v.sz);q.setFromAxisAngle(new THREE.Vector3(0,1,0),v.rotation||0);matrix.compose(position,q,scale);mesh.setMatrixAt(i,matrix);});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh);return mesh;
 }
 function patch(name:string,x:number,z:number,w:number,d:number,r:number,mat:THREE.Material,y:number){
  const shape=new THREE.Shape(),halfW=w/2,halfD=d/2;
  shape.moveTo(-halfW+r,-halfD);shape.lineTo(halfW-r,-halfD);shape.quadraticCurveTo(halfW,-halfD,halfW,-halfD+r);shape.lineTo(halfW,halfD-r);shape.quadraticCurveTo(halfW,halfD,halfW-r,halfD);shape.lineTo(-halfW+r,halfD);shape.quadraticCurveTo(-halfW,halfD,-halfW,halfD-r);shape.lineTo(-halfW,-halfD+r);shape.quadraticCurveTo(-halfW,-halfD,-halfW+r,-halfD);
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,8),mat);mesh.name=name;mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;group.add(mesh);
 }
 function slab(name:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
 }
 // Compact isometric diorama island base so the entire 3D board is framed like a floating tabletop model.
 const islandW=yardWidth+1.5*unit,islandD=yardDepth+1.45*unit,islandZ=center.z-.22*unit;
 patch('diorama-shadow-pad',center.x,islandZ,islandW+1.1*unit,islandD+1.1*unit,1.2,shadowPadMat,-.39);
 slab('diorama-soil-plinth',center.x,-.25,islandZ,islandW-.2,.26,islandD-.2,plinthSoil);
 slab('diorama-timber-rim',center.x,-.095,islandZ,islandW,.1,islandD,plinthRim);
 patch('pasture',center.x,islandZ,islandW-.14,islandD-.14,.65,grass,-.042);
 patch('teaching-yard',center.x,center.z,yardWidth,yardDepth,.52,innerLawn,-.028);
 // Subtle mowed lawn stripes across the teaching yard for spatial depth and grid clarity.
 const stripeCount=5,stripeW=yardWidth/(stripeCount*2);
 for(let i=0;i<stripeCount;i++){
  const sx=left+stripeW*(2*i+1);
  patch(`lawn-stripe-${i}`,sx,center.z,stripeW*.88,yardDepth-.24,.12,stripeLawn,-.022);
 }
 patch('barn-path',left-.55*unit,back-1.05*unit,1.15*unit,2.2*unit,.28,path,-.034);

 // An open front keeps both the default view and the lesson labels unobstructed.
 const posts:Instance[]=[],rails:Instance[]=[];
 function fence(x1:number,z1:number,x2:number,z2:number){
  const length=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(length/(1.65*unit))),angle=-Math.atan2(z2-z1,x2-x1);
  for(let i=0;i<=steps;i++)posts.push({x:x1+(x2-x1)*i/steps,y:.34*unit,z:z1+(z2-z1)*i/steps,sx:.1*unit,sy:.72*unit,sz:.1*unit});
  for(const y of [.22,.52])rails.push({x:(x1+x2)/2,y:y*unit,z:(z1+z2)/2,sx:length,sy:.068*unit,sz:.068*unit,rotation:angle});
 }
 fence(left-.25*unit,back-.42*unit,right+.25*unit,back-.42*unit);
 fence(left-.25*unit,back-.42*unit,left-.25*unit,center.z+.2*unit);
 fence(right+.25*unit,back-.42*unit,right+.25*unit,center.z+.2*unit);
 instances('pasture-fence-posts',cube,timber,posts,true);instances('pasture-fence-rails',cube,timber,rails,true);

 const barn=createBarn(0xb93815);barn.name='distant-barn';barn.scale.setScalar(.86*unit);barn.position.set(left-.65*unit,0,back-1.45*unit);barn.rotation.y=.18;group.add(barn);
 const treeCenters=[{x:left-1.05*unit,z:back-.95*unit,h:1.45*unit},{x:right+.92*unit,z:back-.88*unit,h:1.62*unit},{x:right-.35*unit,z:back-1.48*unit,h:1.32*unit},{x:left-1.12*unit,z:center.z-.25*unit,h:1.22*unit}];
 instances('orchard-trunks',cylinder,bark,treeCenters.map(t=>({x:t.x,y:t.h*.42,z:t.z,sx:.095*unit,sy:t.h*.84,sz:.095*unit})),true);
 instances('orchard-canopies',ball,leaves,treeCenters.map(t=>({x:t.x,y:t.h,z:t.z,sx:.58*unit,sy:.72*unit,sz:.55*unit,rotation:.2})),true);
 instances('orchard-sunlit-crowns',ball,lightLeaves,treeCenters.map(t=>({x:t.x-.15*unit,y:t.h+.2*unit,z:t.z+.12*unit,sx:.44*unit,sy:.48*unit,sz:.42*unit})),true);

 const fieldX=right-1.25*unit,fieldZ=back-1.25*unit;
 patch('field-bed',fieldX,fieldZ,2.2*unit,1.15*unit,.18,path,-.034);
 instances('field-rows',cube,field,Array.from({length:4},(_,i)=>({x:fieldX+(i-1.5)*.42*unit,y:.02,z:fieldZ,sx:.14*unit,sy:.08*unit,sz:.92*unit})));
 const bales:Instance[]=[{x:left-.58*unit,y:.24*unit,z:front-.25*unit,sx:.28*unit,sy:.44*unit,sz:.28*unit},{x:left-1.02*unit,y:.2*unit,z:front-.52*unit,sx:.24*unit,sy:.38*unit,sz:.24*unit}];
 instances('stored-hay-rolls',cylinder,hay,bales,true);
 instances('hay-roll-ties',cylinder,rope,bales.flatMap(b=>[-.09,.09].map(d=>({...b,y:b.y+d*unit,sx:b.sx+.005,sy:.02*unit,sz:b.sz+.005}))));
 const tufts:Instance[]=[];
 for(let i=0;i<14;i++){
  const side=i%2===0?-1:1,z=back+(front-back)*(i+.5)/14,x=side<0?left-.48*unit:right+.48*unit;
  tufts.push({x:x+(i%3)*.08*unit,y:.04,z,sx:.025*unit,sy:.12*unit,sz:.13*unit,rotation:i*.7});
 }
 instances('border-grass',cube,lightLeaves,tufts);
 group.userData.decorative=true;group.userData.teachingClearance={left,right,back,front};
 return group;
}
