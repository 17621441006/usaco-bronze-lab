import * as THREE from 'three';
import {createBarn} from './farm-models';

/** Decorative scenery only: add directly to the scene, never to teachingBounds. */
export function createFarmEnvironment(bounds:THREE.Box3):THREE.Group{
 const group=new THREE.Group();group.name='farm-environment';
 const safe=bounds.isEmpty()?new THREE.Box3(new THREE.Vector3(-4,0,-2),new THREE.Vector3(4,3,2)):bounds;
 const center=safe.getCenter(new THREE.Vector3()),size=safe.getSize(new THREE.Vector3());
 const yardWidth=Math.max(7.2,size.x+2.8),yardDepth=Math.max(5.6,size.z+2.6),unit=THREE.MathUtils.clamp(Math.max(size.x,size.z)/10,.9,1.5);
 const left=center.x-yardWidth/2,right=center.x+yardWidth/2,back=center.z-yardDepth/2,front=center.z+yardDepth/2;
 const material=(color:THREE.ColorRepresentation,roughness=.76,metalness=.02)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const plinthRim=material(0x9a6b43,.64,.05),plinthSoil=material(0x78502e,.84,0),grass=material(0x65a30d,.74,0),innerLawn=material(0x84cc16,.72,0),path=material(0xe7dbc0,.8,0),timber=material(0xb87d46,.62,.04),bark=material(0x78553a,.82,0),leaves=material(0x3f7d20,.7,0),lightLeaves=material(0x84cc16,.66,0),field=material(0xa16207,.82,0),hay=material(0xf59e0b,.7,0),rope=material(0x92400e,.78,0);
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
 // Isometric diorama island base sitting below y=0 where teaching props live.
 const islandW=yardWidth+5.2*unit,islandD=yardDepth+4.8*unit,islandZ=center.z-.55*unit;
 slab('diorama-soil-plinth',center.x,-.34,islandZ,islandW-.24,.32,islandD-.24,plinthSoil);
 slab('diorama-timber-rim',center.x,-.15,islandZ,islandW,.12,islandD,plinthRim);
 patch('pasture',center.x,islandZ,islandW-.16,islandD-.16,1.1,grass,-.082);
 patch('teaching-yard',center.x,center.z,yardWidth,yardDepth,.85,innerLawn,-.052);
 patch('barn-path',left+1.3*unit,back-1.35*unit,1.45*unit,4.2*unit,.38,path,-.068);

 // An open front keeps both the default view and the lesson labels unobstructed.
 const posts:Instance[]=[],rails:Instance[]=[];
 function fence(x1:number,z1:number,x2:number,z2:number){
  const length=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(length/(1.65*unit))),angle=-Math.atan2(z2-z1,x2-x1);
  for(let i=0;i<=steps;i++)posts.push({x:x1+(x2-x1)*i/steps,y:.38*unit,z:z1+(z2-z1)*i/steps,sx:.115*unit,sy:.82*unit,sz:.115*unit});
  for(const y of [.25,.59])rails.push({x:(x1+x2)/2,y:y*unit,z:(z1+z2)/2,sx:length,sy:.08*unit,sz:.08*unit,rotation:angle});
 }
 fence(left-.55*unit,back-.85*unit,right+.55*unit,back-.85*unit);
 fence(left-.55*unit,back-.85*unit,left-.55*unit,center.z+.35*unit);
 fence(right+.55*unit,back-.85*unit,right+.55*unit,center.z+.35*unit);
 instances('pasture-fence-posts',cube,timber,posts,true);instances('pasture-fence-rails',cube,timber,rails,true);

 const barn=createBarn(0xc2410c);barn.name='distant-barn';barn.scale.setScalar(1.08*unit);barn.position.set(left+1.3*unit,0,back-2.15*unit);barn.rotation.y=.12;group.add(barn);
 const treeCenters=[{x:left-1.35*unit,z:back-1.5*unit,h:1.75*unit},{x:right+1.25*unit,z:back-1.25*unit,h:2.0*unit},{x:right-.35*unit,z:back-2.3*unit,h:1.6*unit},{x:left-1.55*unit,z:center.z-.35*unit,h:1.45*unit}];
 instances('orchard-trunks',cylinder,bark,treeCenters.map(t=>({x:t.x,y:t.h*.42,z:t.z,sx:.11*unit,sy:t.h*.84,sz:.11*unit})),true);
 instances('orchard-canopies',ball,leaves,treeCenters.map(t=>({x:t.x,y:t.h,z:t.z,sx:.72*unit,sy:.86*unit,sz:.68*unit,rotation:.2})),true);
 instances('orchard-sunlit-crowns',ball,lightLeaves,treeCenters.map(t=>({x:t.x-.19*unit,y:t.h+.25*unit,z:t.z+.15*unit,sx:.54*unit,sy:.58*unit,sz:.5*unit})),true);

 // A small cultivated plot behind the right-hand fence, outside the teaching yard.
 const fieldX=right-1.65*unit,fieldZ=back-1.95*unit;
 patch('field-bed',fieldX,fieldZ,3.0*unit,1.65*unit,.22,path,-.068);
 instances('field-rows',cube,field,Array.from({length:5},(_,i)=>({x:fieldX+(i-2)*.48*unit,y:.03,z:fieldZ,sx:.17*unit,sy:.1*unit,sz:1.35*unit})));
 const bales:Instance[]=[{x:left-.9*unit,y:.3*unit,z:front-.35*unit,sx:.36*unit,sy:.56*unit,sz:.36*unit},{x:left-1.5*unit,y:.25*unit,z:front-.7*unit,sx:.3*unit,sy:.46*unit,sz:.3*unit}];
 instances('stored-hay-rolls',cylinder,hay,bales,true);
 instances('hay-roll-ties',cylinder,rope,bales.flatMap(b=>[-.11,.11].map(d=>({...b,y:b.y+d*unit,sx:b.sx+.006,sy:.024*unit,sz:b.sz+.006}))));
 // Sparse grass tufts belong to the border, not the numerical teaching objects.
 const tufts:Instance[]=[];
 for(let i=0;i<18;i++){
  const side=i%2===0?-1:1,z=back+(front-back)*(i+.5)/18,x=side<0?left-.82*unit:right+.82*unit;
  tufts.push({x:x+(i%3)*.11*unit,y:.05,z,sx:.03*unit,sy:.15*unit,sz:.16*unit,rotation:i*.7});
 }
 instances('border-grass',cube,lightLeaves,tufts);
 group.userData.decorative=true;group.userData.teachingClearance={left,right,back,front};
 return group;
}
