import type * as THREE from 'three';
export type SceneKit={box:(x:number,y:number,z:number,w:number,h:number,d:number,color:THREE.ColorRepresentation,opacity?:number)=>THREE.Mesh;label:(text:string,x:number,y:number,z:number,color?:string,width?:number)=>THREE.Sprite;line:(points:number[][],color?:number)=>void};
export function cow(k:SceneKit,x:number,z:number,name='Bessie',accent=0x263a4d,scale=1,y=0){
 const b=(dx:number,dy:number,dz:number,w:number,h:number,d:number,c:number)=>k.box(x+dx*scale,y+dy*scale,z+dz*scale,w*scale,h*scale,d*scale,c);
 b(0,.75,0,1.15,.62,.56,0xfafcfb);b(.4,1,-.18,.5,.5,.48,0xfafcfb);b(.44,.91,-.48,.51,.22,.18,0xdfac9e);b(-.18,.84,.29,.38,.34,.025,accent);b(.36,1.12,-.43,.06,.08,.035,0x243446);b(.59,1.12,-.43,.06,.08,.035,0x243446);for(const dx of [-.36,.36])for(const dz of [-.18,.18])b(dx,.29,dz,.14,.5,.14,accent);for(const dx of [.2,.62])b(dx,1.3,-.17,.13,.18,.14,0xd6b681);if(name)k.label(name,x,y+1.8*scale,z,'#244862',1.5*scale);
}
export function farmer(k:SceneKit,x:number,z:number,name='FJ',y=0){k.box(x,y+.9,z,.45,.8,.36,0x2d6598);k.box(x,y+1.5,z,.42,.4,.4,0xdfb58b);k.box(x,y+1.76,z,.76,.1,.61,0xc38432);k.box(x,y+1.87,z,.42,.2,.4,0xc38432);for(const side of [-1,1]){k.box(x+side*.14,y+.32,z,.17,.6,.23,0x344657);k.box(x+side*.34,y+1,z,.2,.45,.18,0xdfb58b);}if(name)k.label(name,x,y+2.35,z,'#2c567e',1.15);}
