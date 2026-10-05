import {farmFrame,type StoryKind} from '@/lib/farm-scenarios';
import {cow,farmer,type SceneKit} from './farm-actors';
export function drawFarmScene(k:SceneKit,kind:StoryKind,step:number){
 const f=farmFrame(kind,step),s=Math.min(step,3);
 if(kind==='pasture'){
  for(let x=0;x<5;x++)for(let z=0;z<4;z++){const a=x<4&&z<3,b=x>=2&&z>=1;if(a||b)k.box(x-2,.12,z-1.5,.93,.16,.93,a&&b?(s>0?0x8661b0:0x7b91ab):a?0x387dac:0xd48a43);}
  for(let x=0;x<=5;x++)k.label(String(x),x-2.5,.05,-2.6,'#3c607b',.5);
  for(let z=0;z<=4;z++)k.label(String(z),-3.2,.05,z-2,'#3c607b',.5);
  farmer(k,-4,1);cow(k,4,1);k.label('A 草地',-2,1,-2,'#286a98',1.5);k.label('B 草地',2,1,2.5,'#a45222',1.5);if(s>0)k.label('共同 4 格',1,1.2,.5,'#634384',2);return;
 }
 for(const n of f.nodes){
  const color=n.active?0xc66628:n.done?0x238575:0x557d9d;
  k.box(n.x,.02,n.z,1.65,.06,1.5,color,.15);
  if(n.type==='cow'){cow(k,n.x,n.z,'',color,.95);k.label(`${n.name} · ${n.value}`,n.x,1.9,n.z,n.active?'#a24d20':'#275576',1.8);}
  if(n.type==='hay'){
   const count=Number(n.value);for(let i=0;i<count;i++)k.box(n.x+(i%2-.5)*.48,.22+Math.floor(i/2)*.39,n.z,.44,.35,.7,n.active?0xc8772e:n.done?0x399582:0xd4b657);
   k.label(String(n.value),n.x,2.1,n.z,'#765621',1);k.label(n.name,n.x,.1,n.z+1,'#365e7a',1.2);
  }
  if(n.type==='bucket'){
   k.box(n.x,1,n.z,1.4,2,1.3,0x7695aa,.18);k.box(n.x,.08,n.z,1.4,.16,1.3,0x577287);const h=Number(n.value)/n.capacity!*1.9;if(h>0)k.box(n.x,.16+h/2,n.z,1.22,h,1.12,0x408ead,.92);k.label(`${n.value} / ${n.capacity}`,n.x,2.6,n.z,'#245877',1.6);k.label(n.name,n.x,.1,n.z+1.3,'#365e7a',1.5);
  }
  if(n.type==='barn'){
   k.box(n.x,.7,n.z,1.3,1.4,1.2,color);k.box(n.x,1.45,n.z,1.55,.16,1.45,0x334a62);k.box(n.x,.48,n.z+.61,.55,.95,.025,0xe8dfc9);k.label(n.name,n.x,2,n.z,'#2f5778',1.6);
  }
 }
 for(const [a,b] of f.edges||[]){const p=f.nodes[a],q=f.nodes[b];k.line([[p.x,.2,p.z+.8],[(p.x+q.x)/2,kind==='barns'?.2:1.4,(p.z+q.z)/2+1.8],[q.x,.2,q.z+.8]],kind==='barns'?0x51728e:0xc3692c);}
 if(kind==='feed')for(const at of f.selection||[]){const x=(at-3.5)*1.2;k.box(x,.3,1.8,.6,.6,.6,0xc56627);k.box(x,.01,1.8,2.4,.04,.8,0x269888,.3);k.label(`站 ${at}`,x,1.1,1.8,'#9b461c',1.2);}
 if(kind==='balance'&&s===2)k.label('搬 2 捆',0,3,1.5,'#9b461c',2);
 if(kind==='choices'){
  const cols=[-2.5,0,2.5];for(let i=0;i<3;i++){k.label(`${namesForChoices[i]}：${f.nodes[i].active?'取':'不取'}`,cols[i],.5,2,'#355e7d',2);if(i<2)k.line([[cols[i]+.8,.5,2],[cols[i+1]-.8,.5,2]],0x608099);}
 }
 if(kind==='barns'){const n=f.nodes[Math.min(s,2)];cow(k,n.x-.9,n.z+1.1,'Bessie',0x263a4d,.7);}
 else if(['pairs','feed','hayline','choices'].includes(kind))cow(k,-4.6,2.7,'Bessie',0x263a4d,.9);
 else farmer(k,-4.8,2.4);
}
const namesForChoices=['A','B','C'];
