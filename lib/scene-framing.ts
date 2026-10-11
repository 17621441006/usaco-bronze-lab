import * as THREE from 'three';

/** Frame teaching objects only; scenery never contributes to the camera distance. */
export function teachingBounds(objects:THREE.Object3D[]){
 const bounds=new THREE.Box3();
 for(const object of objects){
  object.updateWorldMatrix(true,true);
  if(object instanceof THREE.Sprite){
   // Sprite geometry rotates towards the camera, so allow its full label width.
   const p=object.getWorldPosition(new THREE.Vector3()),s=object.getWorldScale(new THREE.Vector3());
   bounds.expandByPoint(p.clone().add(new THREE.Vector3(s.x/2,s.y/2,.05)));
   bounds.expandByPoint(p.clone().sub(new THREE.Vector3(s.x/2,s.y/2,.05)));
  }else bounds.union(new THREE.Box3().setFromObject(object));
 }
 return bounds.isEmpty()?new THREE.Box3(new THREE.Vector3(-1,0,-1),new THREE.Vector3(1,2,1)):bounds;
}

/** Fits every corner in camera space, including its depth, at any panel aspect ratio. */
export function fitTeachingCamera(camera:THREE.PerspectiveCamera,bounds:THREE.Box3,direction:THREE.Vector3,fill=.86){
 const target=bounds.getCenter(new THREE.Vector3()),toward=direction.clone().normalize();
 if(Math.abs(toward.y)>.999)toward.z=.001;
 toward.normalize();const right=new THREE.Vector3().crossVectors(camera.up,toward).normalize(),up=new THREE.Vector3().crossVectors(toward,right).normalize();
 const tanY=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*fill,tanX=tanY*camera.aspect;
 let distance=.5;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const delta=new THREE.Vector3(x,y,z).sub(target),depth=delta.dot(toward);
  distance=Math.max(distance,depth+Math.abs(delta.dot(right))/tanX,depth+Math.abs(delta.dot(up))/tanY);
 }
 camera.position.copy(target).addScaledVector(toward,distance);camera.near=Math.max(.01,distance/1000);camera.far=Math.max(100,distance+bounds.getSize(new THREE.Vector3()).length()*3);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 return target;
}
