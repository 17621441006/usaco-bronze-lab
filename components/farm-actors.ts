import type * as THREE from 'three';
import {createCow,createFarmer} from './farm-models';
export type SceneKit={add:(object:THREE.Object3D)=>void;box:(x:number,y:number,z:number,w:number,h:number,d:number,color:THREE.ColorRepresentation,opacity?:number)=>THREE.Mesh;label:(text:string,x:number,y:number,z:number,color?:string,width?:number)=>THREE.Sprite;line:(points:number[][],color?:number)=>void};
export function cow(k:SceneKit,x:number,z:number,name='Bessie',accent=0x263a4d,scale=1,y=0){const model=createCow(accent);model.position.set(x,y,z);model.scale.setScalar(scale);k.add(model);if(name)k.label(name,x,y+1.84*scale,z,'#244862',1.5*scale);}
export function farmer(k:SceneKit,x:number,z:number,name='FJ',y=0){const model=createFarmer();model.position.set(x,y,z);k.add(model);if(name)k.label(name,x,y+2.25,z,'#2c567e',1.15);}
