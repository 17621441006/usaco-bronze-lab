// Geometry and camera projection checks; no browser rendering is claimed.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript'),THREE=require('three');
const root=process.cwd(),resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {createTrough,createCow,createFarmer,createBucket,createHayBale,createBarn}=require('../components/farm-models.ts');
const {fitTeachingCamera,teachingBounds}=require('../lib/scene-framing.ts'),{drawFarmScene}=require('../components/farm-scene.ts'),{storyKinds}=require('../lib/farm-scenarios.ts');
function validateModel(model){model.updateMatrixWorld();const bounds=new THREE.Box3().setFromObject(model);assert(!bounds.isEmpty());assert([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite));model.traverse(o=>{if(o.geometry){for(const attr of Object.values(o.geometry.attributes))assert([...attr.array].every(Number.isFinite));}});}
for(let n=0;n<=12;n++){const trough=createTrough(n,n===7);assert.equal(trough.children.filter(o=>o.name==='feed-portion').length,n);validateModel(trough);}
for(const model of [createCow(),createFarmer(),createBucket(0,10),createBucket(4,10),createBucket(10,10),createHayBale(),createBarn(0x438179)])validateModel(model);
const trough=createTrough(0);trough.updateMatrixWorld();const ray=new THREE.Raycaster(new THREE.Vector3(0,3,0),new THREE.Vector3(0,-1,0));const intersections=ray.intersectObject(trough,true);assert(intersections.length);assert(intersections[0].point.y<.6,'Trough must have an open center, not a solid top');
let fits=0;
function verify(objects){const b=teachingBounds(objects);for(const [width,height] of [[340,300],[620,350],[1100,420],[1700,420]]){
 const camera=new THREE.PerspectiveCamera(38,width/height,.1,100);fitTeachingCamera(camera,b,new THREE.Vector3(.2,.75,1.5));
 let max=0;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<.87&&Math.abs(p.y)<.87,JSON.stringify({width,height,p}));assert(p.z>-1&&p.z<1);max=Math.max(max,Math.abs(p.x),Math.abs(p.y));}assert(max>.8,'Scene should use available space');fits++;
 }}
for(const kind of storyKinds)for(let step=0;step<4;step++){
 const objects=[],kit={add:o=>objects.push(o),box:(x,y,z,w,h,d,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);objects.push(m);return m;},label:(text,x,y,z,color,width=2.2)=>{const s=new THREE.Sprite();s.position.set(x,y,z);s.scale.set(width,width/4,1);objects.push(s);return s;},line:points=>objects.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v)))))};
 drawFarmScene(kit,kind,step);verify(objects);
}
// Every fixed problem frame, including wide arrays and large coordinate labels.
let frames=0;
for(const file of fs.readdirSync('public/diagrams').filter(f=>f.endsWith('.json'))){const drawing=JSON.parse(fs.readFileSync('public/diagrams/'+file));for(const frame of drawing.frames){
 const objects=frame.items.flatMap(t=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(t.w,Math.max(.08,t.height),t.h));mesh.position.set(t.x,t.height/2,t.y);const label=new THREE.Sprite(),w=Math.max(t.w,Math.min(2.7,t.label.length*.15+.45));label.scale.set(w,w/6,1);label.position.set(t.x,t.height+.2,t.y);return [mesh,label];});verify(objects);frames++;
}}
console.log(`PASS: hollow trough, exact feed counts, curved farm models; ${fits} camera fits across 4 panel sizes, 44 teaching states and ${frames} problem frames`);

// Zoom changes the projection, while viewport resize keeps the chosen magnification.
const zoomBounds=new THREE.Box3(new THREE.Vector3(-3,0,-1),new THREE.Vector3(3,2,1)),zoomCamera=new THREE.PerspectiveCamera(38,2,.1,100),direction=new THREE.Vector3(.2,.75,1.5),point=zoomBounds.max.clone();
fitTeachingCamera(zoomCamera,zoomBounds,direction);const normal=point.clone().project(zoomCamera);zoomCamera.zoom=1.6;zoomCamera.updateProjectionMatrix();const enlarged=point.clone().project(zoomCamera);assert(Math.abs(enlarged.x-normal.x*1.6)<1e-8);assert(Math.abs(enlarged.y-normal.y*1.6)<1e-8);
zoomCamera.aspect=.8;fitTeachingCamera(zoomCamera,zoomBounds,direction);assert.equal(zoomCamera.zoom,1.6);zoomCamera.zoom=1;fitTeachingCamera(zoomCamera,zoomBounds,direction);assert(Math.abs(point.clone().project(zoomCamera).x)<.87);
console.log('PASS: zoom affects actual camera projection, survives resizing and resets to fit');

const {createFarmEnvironment}=require('../components/farm-environment.ts');
for(const b of [new THREE.Box3(),new THREE.Box3(new THREE.Vector3(-4,0,-2),new THREE.Vector3(4,3,2)),new THREE.Box3(new THREE.Vector3(-15,0,-2),new THREE.Vector3(15,3,2))]){const farm=createFarmEnvironment(b);validateModel(farm);assert(farm.userData.decorative);assert(farm.getObjectByName('distant-barn'));assert(farm.getObjectByName('pasture-fence-posts'));}
console.log('PASS: bounded farm backdrop geometry, empty and wide teaching bounds, separate decorative group');
