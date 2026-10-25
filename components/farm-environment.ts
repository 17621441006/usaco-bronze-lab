import * as THREE from 'three';
import {createBarn} from './farm-models';

/** Decorative scenery only: add directly to the scene, never to teachingBounds. */
export function createFarmEnvironment(bounds:THREE.Box3):THREE.Group{
 const group=new THREE.Group();group.name='farm-environment';
 const safe=bounds.isEmpty()?new THREE.Box3(new THREE.Vector3(-4,0,-2),new THREE.Vector3(4,3,2)):bounds;
 const center=safe.getCenter(new THREE.Vector3()),size=safe.getSize(new THREE.Vector3());
 const yardWidth=Math.max(7,size.x+2.6),yardDepth=Math.max(5.5,size.z+2.4),unit=THREE.MathUtils.clamp(Math.max(size.x,size.z)/10,.9,1.5);
 const left=center.x-yardWidth/2,right=center.x+yardWidth/2,back=center.z-yardDepth/2,front=center.z+yardDepth/2;
 const material=(color:THREE.ColorRepresentation)=>new THREE.MeshStandardMaterial({color,roughness:1});
 const grass=material(0xc7d6b5),earth=material(0xe3dcc7),path=material(0xd4c7a7),timber=material(0xa2957a),bark=material(0x93806b),leaves=material(0x89a581),lightLeaves=material(0xa7ba91),field=material(0xbfae77),hay=material(0xc9b47d),rope=material(0x9e8c64);
 const cube=new THREE.BoxGeometry(1,1,1),ball=new THREE.IcosahedronGeometry(1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10);
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
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,4),mat);mesh.name=name;mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;group.add(mesh);
 }
 // All floor surfaces sit below y=0, where the teaching props are placed.
 patch('pasture',center.x,center.z,Math.max(45,yardWidth+28),Math.max(45,yardDepth+28),8,grass,-.095);
 patch('teaching-yard',center.x,center.z,yardWidth,yardDepth,.9,earth,-.055);
 patch('barn-path',left+1.3*unit,back-1.4*unit,1.5*unit,4.8*unit,.4,path,-.07);

 // An open front keeps both the default view and the lesson labels unobstructed.
 const posts:Instance[]=[],rails:Instance[]=[];
 function fence(x1:number,z1:number,x2:number,z2:number){
  const length=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(length/(1.8*unit))),angle=-Math.atan2(z2-z1,x2-x1);
  for(let i=0;i<=steps;i++)posts.push({x:x1+(x2-x1)*i/steps,y:.36*unit,z:z1+(z2-z1)*i/steps,sx:.105*unit,sy:.78*unit,sz:.105*unit});
  for(const y of [.24,.58])rails.push({x:(x1+x2)/2,y:y*unit,z:(z1+z2)/2,sx:length,sy:.075*unit,sz:.075*unit,rotation:angle});
 }
 fence(left-.6*unit,back-.9*unit,right+.6*unit,back-.9*unit);
 fence(left-.6*unit,back-.9*unit,left-.6*unit,center.z);
 fence(right+.6*unit,back-.9*unit,right+.6*unit,center.z);
 instances('pasture-fence-posts',cube,timber,posts,true);instances('pasture-fence-rails',cube,timber,rails,true);

 const barn=createBarn(0xaa7d6b);barn.name='distant-barn';barn.scale.setScalar(1.1*unit);barn.position.set(left+1.3*unit,0,back-2.5*unit);barn.rotation.y=.1;group.add(barn);
 const treeCenters=[{x:left-1.7*unit,z:back-1.8*unit,h:1.8*unit},{x:right+1.5*unit,z:back-1.4*unit,h:2.1*unit},{x:right-.3*unit,z:back-3.6*unit,h:1.65*unit},{x:left-2.1*unit,z:center.z-.4*unit,h:1.5*unit}];
 instances('orchard-trunks',cylinder,bark,treeCenters.map(t=>({x:t.x,y:t.h*.42,z:t.z,sx:.10*unit,sy:t.h*.84,sz:.10*unit})),true);
 instances('orchard-canopies',ball,leaves,treeCenters.map(t=>({x:t.x,y:t.h,z:t.z,sx:.73*unit,sy:.9*unit,sz:.68*unit,rotation:.2})),true);
 instances('orchard-sunlit-crowns',ball,lightLeaves,treeCenters.map(t=>({x:t.x-.21*unit,y:t.h+.24*unit,z:t.z+.16*unit,sx:.56*unit,sy:.62*unit,sz:.5*unit})),true);

 // A small cultivated plot behind the right-hand fence, outside the teaching yard.
 const fieldX=right-1.8*unit,fieldZ=back-2.5*unit;
 patch('field-bed',fieldX,fieldZ,3.4*unit,2*unit,.2,path,-.07);
 instances('field-rows',cube,field,Array.from({length:6},(_,i)=>({x:fieldX+(i-2.5)*.49*unit,y:.035,z:fieldZ,sx:.18*unit,sy:.12*unit,sz:1.7*unit})));
 const bales:Instance[]=[{x:left-.95*unit,y:.31*unit,z:front-.4*unit,sx:.38*unit,sy:.6*unit,sz:.38*unit},{x:left-1.7*unit,y:.26*unit,z:front-.8*unit,sx:.32*unit,sy:.5*unit,sz:.32*unit}];
 instances('stored-hay-rolls',cylinder,hay,bales,true);
 instances('hay-roll-ties',cylinder,rope,bales.flatMap(b=>[-.12,.12].map(d=>({...b,y:b.y+d*unit,sx:b.sx+.006,sy:.025*unit,sz:b.sz+.006}))));
 // Sparse grass tufts belong to the border, not the numerical teaching objects.
 const tufts:Instance[]=[];
 for(let i=0;i<18;i++){
  const side=i%2===0?-1:1,z=back+(front-back)*(i+.5)/18,x=side<0?left-.9*unit:right+.9*unit;
  tufts.push({x:x+(i%3)*.12*unit,y:.05,z,sx:.025*unit,sy:.16*unit,sz:.18*unit,rotation:i*.7});
 }
 instances('border-grass',cube,leaves,tufts);
 group.userData.decorative=true;group.userData.teachingClearance={left,right,back,front};
 return group;
}
