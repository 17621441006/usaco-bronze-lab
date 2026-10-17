// Real canvas raster checks + DOM interactions. This is not browser/camera QA.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const root=process.cwd(),ts=require('typescript'),qa=process.env.WHITEBOARD_TEST_DIR||'/tmp/usaco-whiteboard-tests/node_modules';
const {createCanvas}=require(qa+'/@napi-rs/canvas'),{JSDOM}=require(qa+'/jsdom');
const originalResolve=Module._resolveFilename,originalLoad=Module._load;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const wb=require(root+'/lib/whiteboard.ts'),{GestureGate}=require(root+'/lib/whiteboard-gestures.ts');
const {cameraToBoard}=require(root+'/lib/whiteboard-gestures.ts');
assert(Math.abs(cameraToBoard({x:.5,y:.24}).y)<.001);assert(Math.abs(cameraToBoard({x:.5,y:.53}).y-450)<.001);assert(Math.abs(cameraToBoard({x:.5,y:.82}).y-900)<.001);
assert.equal(cameraToBoard({x:.5,y:.05}).y,0);assert.equal(cameraToBoard({x:.5,y:.99}).y,900);
const landmarks=Array.from({length:21},()=>({x:.5,y:.5,z:0}));
function arm(g){g.update({timestamp:10,gesture:'Closed_Fist',score:.95,landmarks});g.update({timestamp:110,gesture:'Closed_Fist',score:.95,landmarks});}
const gate=new GestureGate();const frame=(t,gesture,score=.95,ls=landmarks)=>gate.update({timestamp:t,gesture,score,landmarks:ls});
assert.equal(frame(100,'Pointing_Up').mode,'hover');assert.equal(frame(300,'Pointing_Up').mode,'hover','must first arm with fist');
frame(350,'Closed_Fist');frame(470,'Closed_Fist');frame(500,'Pointing_Up');assert.equal(frame(650,'Pointing_Up').mode,'draw');
for(const [t,g,s] of [[700,'None',0],[750,'Pointing_Up',.4],[800,'None',0],[850,'Pointing_Up',.59]]){const r=frame(t,g,s);assert.equal(r.mode,'draw','flickering confidence must preserve a stroke');assert(!r.breakStroke);}
const missing=frame(900,'None',0,[]);assert(missing.holdStroke);assert.equal(missing.point,null,'missing landmarks must never generate ink');const recovered=frame(1000,'Pointing_Up');assert.equal(recovered.mode,'draw');assert(!recovered.breakStroke);
frame(1050,'None',0,[]);assert.equal(frame(1300,'None',0,[]).mode,'none');frame(1350,'Pointing_Up');assert(frame(1450,'Pointing_Up').breakStroke,'long loss starts a new stroke');
assert.equal(frame(1480,'Closed_Fist').mode,'hover','intentional fist stops immediately');
assert.equal(frame(1500,'Open_Palm').mode,'hover');for(let t=1600;t<2000;t+=100)assert.equal(frame(t,'Open_Palm').mode,'hover');assert.equal(frame(2010,'Open_Palm').mode,'erase');
const jumped=landmarks.map(p=>({...p,x:.08}));assert(frame(2050,'Open_Palm',.95,jumped).breakStroke,'large position jump splits strokes');assert.equal(frame(3300,'Pointing_Up').mode,'hover','actual long stall stops strokes');
const slow=new GestureGate();arm(slow);for(let i=0;i<10;i++){const r=slow.update({timestamp:200+i*400,gesture:'Pointing_Up',score:.9,landmarks:landmarks.map(p=>({...p,x:.7-i*.025}))});if(i>0)assert.equal(r.mode,'draw','3 fps must still sustain writing');if(i>1)assert(!r.breakStroke);}
function hand(pose='point',angle=0,dx=0){
 const l=Array.from({length:21},()=>({x:.5,y:.85,z:0}));
 for(const [j,i] of [5,9,13,17].entries()){
  const x=.43+j*.065,y=.65+Math.abs(1-j)*.025,extended=pose==='palm'||(pose==='point'&&i===5)||(pose==='lift'&&(i===5||i===9));
  l[i]={x,y,z:0};l[i+1]={x,y:y-.12,z:0};l[i+2]={x,y:y-(extended?.22:.04),z:0};l[i+3]={x,y:y-(extended?.31:-.04),z:0};
 }
 return l.map(p=>({x:.5+(p.x-.5)*Math.cos(angle)-(p.y-.85)*Math.sin(angle)+dx,y:.85+(p.x-.5)*Math.sin(angle)+(p.y-.85)*Math.cos(angle),z:p.z}));
}
const {landmarkPose}=require(root+'/lib/whiteboard-gestures.ts');for(const pose of ['point','palm','fist','lift'])for(const angle of [-1.1,-.4,0,.7,1.3])assert.equal(landmarkPose(hand(pose,angle)),pose);
const rotated=new GestureGate();arm(rotated);let breaks=0;for(let i=0;i<100;i++){const r=rotated.update({timestamp:200+i*50,gesture:'None',score:0,landmarks:hand('point',Math.sin(i/30)*.9,i*.0004)});if(i>=2){assert.equal(r.mode,'draw','tilted index finger should not depend on Pointing_Up label');if(r.breakStroke)breaks++;}}assert.equal(breaks,1,'only the initial pen-down begins a stroke');
assert.equal(rotated.update({timestamp:5300,gesture:'None',score:0,landmarks:hand('fist')}).mode,'hover');
const space=new GestureGate(),option={control:'space',pressed:false};
assert.equal(space.update({timestamp:100,gesture:'None',score:0,landmarks:hand()},option).mode,'hover');
assert.equal(space.update({timestamp:150,gesture:'None',score:0,landmarks:hand()},{...option,pressed:true}).mode,'draw','space mode needs no fist');
assert.equal(space.update({timestamp:200,gesture:'None',score:0,landmarks:hand()},option).mode,'hover','release space lifts immediately');
const vGate=new GestureGate();vGate.update({timestamp:100,gesture:'None',score:0,landmarks:hand('lift')});vGate.update({timestamp:150,gesture:'None',score:0,landmarks:hand()});assert.equal(vGate.update({timestamp:250,gesture:'None',score:0,landmarks:hand()}).mode,'draw');assert.equal(vGate.update({timestamp:300,gesture:'None',score:0,landmarks:hand('lift')}).mode,'hover','two-finger lift never requires folding the index');
const bendGate=new GestureGate();arm(bendGate);bendGate.update({timestamp:200,gesture:'Pointing_Up',score:.95,landmarks:hand()});bendGate.update({timestamp:300,gesture:'Pointing_Up',score:.95,landmarks:hand()});const bendingHand=hand();bendingHand[8].y=bendingHand[5].y-.195;assert.equal(bendGate.update({timestamp:350,gesture:'Pointing_Up',score:.95,landmarks:bendingHand}).mode,'hover','bending index stops even if classifier still says Pointing_Up');
const noisy=new GestureGate(),filtered=[];for(let i=0;i<100;i++){const r=noisy.update({timestamp:100+i*50,gesture:'None',score:0,landmarks:hand('point',0,(i%2?.003:-.003))},{control:'space',pressed:true});if(i>20)filtered.push(r.point.x);}assert(Math.max(...filtered)-Math.min(...filtered)<5,'stationary hand jitter is damped, not amplified');
console.log('PASS: flicker/low-fps continuity, rotated finger, missing-frame safety, Space clutch, V lift, and jitter filtering');
const ink=createCanvas(1600,900),ctx=ink.getContext('2d');
const line={kind:'line',points:[{x:100,y:200},{x:500,y:200}],width:12,color:'teal'};
const erase={kind:'erase',points:[{x:300,y:100},{x:300,y:300}],width:84,color:'ink'};
const alpha=(x,y)=>ctx.getImageData(x,y,1,1).data[3];
wb.drawInk(ctx,[line,erase],false);assert(alpha(200,200)>240);assert.equal(alpha(300,200),0);assert(alpha(400,200)>240);
wb.drawInk(ctx,[line,{...erase,width:240}],false);assert.equal(alpha(200,200),0,'large eraser covers pixels beyond the old 84px diameter');assert(alpha(150,200)>240,'erasing stays local');
wb.drawInk(ctx,[line],false);assert(alpha(300,200)>240,'undo eraser restores stroke');
wb.drawInk(ctx,[line,{kind:'clear',points:[],width:1,color:'ink'}],false);assert.equal(alpha(200,200),0);
const rough={...line,kind:'pen',points:Array.from({length:20},(_,i)=>({x:100+i*10,y:200+(i%2)}))};assert.equal(wb.tidyMark(rough).kind,'line');
const round={...rough,points:Array.from({length:65},(_,i)=>({x:300+90*Math.cos(i/64*Math.PI*2),y:300+90*Math.sin(i/64*Math.PI*2)}))};assert.equal(wb.tidyMark(round).kind,'ellipse');
const arbitrary={...rough,points:Array.from({length:30},(_,i)=>({x:100+i*10,y:300+90*Math.sin(i/29*Math.PI*4)}))};assert.equal(wb.tidyMark(arbitrary).kind,'pen');
const shapes=require(root+'/lib/whiteboard-shapes.ts');
function roughPath(vertices,noise=4){const points=[];for(let i=1;i<vertices.length;i++){const a=vertices[i-1],b=vertices[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10);for(let j=0;j<n;j++){const k=j/n;points.push({x:a[0]+(b[0]-a[0])*k+Math.sin(j*2.2+i)*noise,y:a[1]+(b[1]-a[1])*k+Math.cos(j*1.6+i)*noise});}}points.push({x:vertices.at(-1)[0],y:vertices.at(-1)[1]});return {...rough,points};}
assert.equal(wb.tidyMark(roughPath([[100,200],[600,212]],9)).kind,'line','noticeably shaky line snaps');
assert.equal(wb.tidyMark(roughPath([[100,100],[450,100],[450,350],[100,350],[100,100]],7)).kind,'rect','rough rectangle snaps');
const downLine=wb.tidyMark(roughPath([[1000,150],[1007,670]],15));assert.equal(downLine.kind,'line');assert.equal(downLine.points[0].x,downLine.points[1].x,'vertical intent locks to a straight vertical axis');
assert.equal(wb.tidyMark({...rough,points:[{x:10,y:10},{x:110,y:14}]}).kind,'line','two camera samples are sufficient');
const rotate=(x,y)=>[550+(x-550)*Math.cos(.38)-(y-400)*Math.sin(.38),400+(x-550)*Math.sin(.38)+(y-400)*Math.cos(.38)];
const rotatedRect=wb.tidyMark(roughPath([[350,250],[750,250],[750,550],[350,550],[350,263]].map(p=>rotate(...p)),5));assert.equal(rotatedRect.kind,'rect','an almost-closed rotated rectangle is recognized');assert.equal(rotatedRect.points.length,4);
assert.equal(wb.tidyMark(roughPath([[500,150],[750,550],[250,550],[496,158]],5)).kind,'triangle');
const separateRectangle=[[[900,200],[1200,200]],[[1200,200],[1200,420]],[[1200,420],[900,420]],[[900,420],[900,200]]].map(p=>wb.tidyMark(roughPath(p,4)));
assert.equal(shapes.tidyRecentCuboid(separateRectangle.slice(0,3)).recognized,false,'three sides are not a rectangle');assert.equal(shapes.tidyRecentCuboid(separateRectangle).marks.at(-1).kind,'rect','four independently drawn sides join into one rectangle');
assert.equal(wb.tidyMark(roughPath([[200,200],[200,500],[300,590]],4)).kind,'pen','a deliberate bend must not disappear into a fitted line');
console.log('PASS: lowered camera mapping, low-sample lines, vertical axis snapping, rotated rectangle, triangle, multi-stroke rectangle and bend preservation');
const cubeStrokes=[roughPath([[300,300],[650,300],[650,560],[300,560],[300,300]]),roughPath([[300,300],[390,220],[740,220],[650,300]]),roughPath([[740,220],[740,480],[650,560]])];
const cube=shapes.recognizeCuboid(cubeStrokes);assert(cube&&cube.kind==='cuboid','freehand three-face box becomes a true cuboid');
assert(shapes.tidyRecentCuboid(cubeStrokes.map(wb.tidyMark)).recognized,'multi-stroke normalization also accepts already-snapped rectangle and line edges');
assert.equal(shapes.recognizeCuboid(cubeStrokes.slice(0,2)),null,'an incomplete box must remain a sketch');
assert.equal(shapes.recognizeCuboid([...cubeStrokes,arbitrary]),null,'nearby writing cannot be swallowed into a cuboid');
const {makeElement,elementCatalog,drawElement}=require(root+'/lib/whiteboard-elements.ts');
const cowA=makeElement('cow',{x:300,y:500},0),cowB=makeElement('cow',{x:300,y:500},1);const ca=createCanvas(200,180),cb=createCanvas(200,180);drawElement(ca.getContext('2d'),{...cowA,x:0,y:0},false);drawElement(cb.getContext('2d'),{...cowB,x:0,y:0},false);assert.notDeepEqual(ca.toBuffer('image/png'),cb.toBuffer('image/png'),'successive cows have visibly different coats');
for(const item of elementCatalog){const object=makeElement(item.kind,{x:1600,y:900},3);assert(object.x+object.w<=1600&&object.y+object.h<=900);drawElement(ctx,object,true);}
console.log('PASS: noisy line/rectangle, multi-stroke freehand cuboid, incomplete-box and handwriting rejection, varied teaching props');
const b=wb.newBoard();b.pages[0].marks=[line,erase];assert.deepEqual(wb.readBoard(JSON.stringify(b)),b);assert.throws(()=>wb.readBoard('{bad'));assert.throws(()=>wb.readBoard(JSON.stringify({...b,pages:[{marks:[{...line,points:[{x:NaN,y:0}]}],paper:'plain',sample:0}]})));
const preview=createCanvas(1600,900),pc=preview.getContext('2d');wb.drawPaper(pc,{...wb.newSheet(),paper:'grid'},false,{id:'test',title:'test'});
wb.drawInk(ctx,[line,{kind:'rect',points:[{x:100,y:350},{x:430,y:600}],width:5,color:'blue'},{kind:'ellipse',points:[{x:600,y:330},{x:900,y:630}],width:6,color:'red'},{kind:'cuboid',points:[{x:1090,y:420},{x:1390,y:680}],width:5,color:'teal',depth:{x:95,y:-100}}],false);pc.drawImage(ink,0,0);fs.writeFileSync('/tmp/usaco-whiteboard-drawing.png',preview.toBuffer('image/png'));
console.log('PASS: actual canvas pixels, partial erasing, restoration, clear, conservative shape snapping and stored-data validation');
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test',pretendToBeVisual:true});
for(const key of ['window','document','Node','NodeFilter','HTMLElement','Element','HTMLInputElement','HTMLTextAreaElement','DocumentFragment','MutationObserver','DOMParser','DOMRect','Event','CustomEvent','MouseEvent','KeyboardEvent','getComputedStyle','localStorage'])global[key]=dom.window[key];
const css=require('postcss').parse(fs.readFileSync(root+'/app/globals.css','utf8'));const style=document.createElement('style');style.textContent=css.nodes.filter(n=>n.type==='rule'&&/(?:wb-topbar|wb-toolbar|wb-help)/.test(n.selector)).map(n=>n.toString()).join('\n');document.head.appendChild(style);
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
for(const key of Object.getOwnPropertyNames(dom.window).filter(n=>/^HTML\w*Element$/.test(n)))global[key]=dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT=true;global.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);global.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
Object.defineProperty(window,'isSecureContext',{value:true});global.OffscreenCanvas=class{};global.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
dom.window.HTMLElement.prototype.scrollIntoView=()=>{};dom.window.HTMLElement.prototype.hasPointerCapture=()=>false;dom.window.HTMLElement.prototype.setPointerCapture=()=>{};dom.window.HTMLElement.prototype.releasePointerCapture=()=>{};
const canvases=new WeakMap();HTMLCanvasElement.prototype.getContext=function(){if(!canvases.has(this))canvases.set(this,createCanvas(this.width,this.height));return canvases.get(this).getContext('2d');};HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:1600,height:900});
const blobs=[];URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:example';};URL.revokeObjectURL=()=>{};HTMLAnchorElement.prototype.click=function(){};HTMLCanvasElement.prototype.toBlob=function(cb){cb(new Blob([canvases.get(this).toBuffer('image/png')],{type:'image/png'}));};
// drawImage needs the native backing canvas in this DOM-only adapter.
const nativeProto=Object.getPrototypeOf(createCanvas(1,1).getContext('2d')),nativeDraw=nativeProto.drawImage;nativeProto.drawImage=function(source,...args){return nativeDraw.call(this,canvases.get(source)||source,...args);};
HTMLMediaElement.prototype.play=async()=>{};HTMLMediaElement.prototype.pause=()=>{};Object.defineProperty(HTMLMediaElement.prototype,'readyState',{get:()=>4});Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{get:()=>performance.now()/1000});
let gumCalls=0,streams=[],deferred=null,workers=[];
function stream(){const track={stopped:false,onended:null,stop(){this.stopped=true;}};const s={track,getTracks:()=>[track],getVideoTracks:()=>[track]};streams.push(s);return s;}
Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async options=>{gumCalls++;assert.equal(options.audio,false);if(deferred)return deferred;return stream();}},configurable:true});
global.createImageBitmap=async()=>({width:640,height:480,close(){}});
global.Worker=class{constructor(url){assert.equal(url,'/whiteboard/gesture-worker.js');workers.push(this);}postMessage(message){if(message.type==='init')setTimeout(()=>this.onmessage?.({data:{type:'ready'}}),0);}terminate(){this.terminated=true;}emit(data){this.onmessage?.({data});}};
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
Module._load=function(name,parent,...args){if(name==='./official-statement')return {OfficialStatement:()=>React.createElement('p',{},'Original task')};return originalLoad.call(this,name,parent,...args);};
const {WhiteboardLauncher}=require(root+'/components/whiteboard-launcher.tsx'),container=document.getElementById('root'),view=createRoot(container),tick=()=>new Promise(r=>setTimeout(r,35));
const context={id:'problem-1083',title:'Uddered but not Herd',problemId:1083,samples:[{input:'abc\nab\n',output:'1\n'}]};
const button=label=>{const el=[...document.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')===label||n.textContent.trim()===label);assert(el,`Missing button ${label}`);return el;};
async function click(label){await act(async()=>{button(label).click();await tick();});}
async function draw(points){const c=document.querySelector('.wb-ink');await act(async()=>{for(let i=0;i<points.length;i++){const e=new MouseEvent(i===0?'pointerdown':i===points.length-1?'pointerup':'pointermove',{bubbles:true,button:0,clientX:points[i][0],clientY:points[i][1]});Object.defineProperties(e,{pointerId:{value:1},isPrimary:{value:true},pointerType:{value:'mouse'}});c.dispatchEvent(e);}await tick();});}
async function saved(){await click('保存');return JSON.parse(localStorage.getItem(wb.boardKey(context.id)));}
(async()=>{try{
 await act(async()=>{view.render(React.createElement(WhiteboardLauncher,{context}));await tick();});assert.equal(gumCalls,0);await click('AI白板');assert(document.querySelector('[role="dialog"]'));assert.equal(gumCalls,0,'opening never requests camera');assert(!document.querySelector('.wb-footer'));assert(!document.querySelector('.wb-options'));assert(document.querySelector('.wb-topbar .wb-toolbar'));assert(document.querySelector('.wb-topbar [aria-label=保存]'));assert(document.querySelector('.wb-topbar .wb-pages'));assert.equal(document.querySelector('[aria-label=橡皮大小]').value,'240');assert.equal(getComputedStyle(document.querySelector('.wb-topbar')).height,'48px');assert.equal(getComputedStyle(document.querySelector('.wb-toolbar')).flexWrap,'nowrap');await click('操作说明');assert.equal(getComputedStyle(document.querySelector('.wb-help')).position,'absolute');await click('收起操作说明');
 await click('线段');await draw([[100,100],[300,100]]);let stored=await saved();assert.equal(stored.pages[0].marks[0].kind,'line');
 await click('长方体');await draw([[400,300],[600,500]]);assert(document.querySelector('.wb-hint').textContent.includes('正面已画好'));await draw([[700,400],[780,330]]);stored=await saved();assert.deepEqual(stored.pages[0].marks[1].depth,{x:80,y:-70});
 await click('清空本页');stored=await saved();assert.equal(stored.pages[0].marks.at(-1).kind,'clear');await click('撤销');stored=await saved();assert.equal(stored.pages[0].marks.at(-1).kind,'cuboid');await click('重做');assert.equal((await saved()).pages[0].marks.at(-1).kind,'clear');await click('撤销');
 await click('新一页');await click('圆形');await draw([[200,200],[400,400]]);stored=await saved();assert.equal(stored.pages.length,2);assert.equal(stored.page,1);await click('画笔');
 for(const [label,kind] of [['箭头','arrow'],['双向箭头','doubleArrow'],['三角形','triangle']]){await click(label);await draw([[900,200],[1200,430]]);const next=await saved();assert.equal(next.pages[1].marks.at(-1).kind,kind);assert.doesNotThrow(()=>wb.readBoard(JSON.stringify(next)));await click('撤销');}await click('画笔');
 const liveCanvas=document.querySelector('.wb-ink'),livePoints=roughPath([[1000,150],[1007,670]],15).points;
 await act(async()=>{for(let i=0;i<livePoints.length;i++){const p=livePoints[i],ev=new MouseEvent(i?'pointermove':'pointerdown',{bubbles:true,button:0,clientX:p.x,clientY:p.y});Object.defineProperties(ev,{pointerId:{value:9},isPrimary:{value:true}});liveCanvas.dispatchEvent(ev);}await tick();});
 const raster=liveCanvas.getContext('2d').getImageData(940,180,130,440).data,columns=[];for(let x=0;x<130;x++)for(let y=0;y<440;y++)if(raster[(y*130+x)*4+3]>150){columns.push(x);break;}
 assert(columns.length>0&&Math.max(...columns)-Math.min(...columns)<9,'the visible stroke is already straight before release or the pause timer');
 await act(async()=>{const p=livePoints.at(-1),ev=new MouseEvent('pointerup',{bubbles:true,clientX:p.x,clientY:p.y});Object.defineProperties(ev,{pointerId:{value:9},isPrimary:{value:true}});liveCanvas.dispatchEvent(ev);await tick();});assert.equal((await saved()).pages[1].marks.at(-1).kind,'line');await click('撤销');
 console.log('PASS: arrow/triangle tools and actual straight-line pixels during an unfinished stroke');
 const pausedCanvas=document.querySelector('.wb-ink'),held=roughPath([[150,600],[700,613]],6).points;await act(async()=>{for(let i=0;i<held.length;i++){const p=held[i],ev=new MouseEvent(i?'pointermove':'pointerdown',{bubbles:true,button:0,clientX:p.x,clientY:p.y});Object.defineProperties(ev,{pointerId:{value:7},isPrimary:{value:true}});pausedCanvas.dispatchEvent(ev);}await new Promise(r=>setTimeout(r,620));});assert(document.querySelector('.wb-shape-notice').textContent.includes('直线'),'holding a rough line previews its normalized geometry before release');
 await act(async()=>{const p=held.at(-1),ev=new MouseEvent('pointerup',{bubbles:true,clientX:p.x,clientY:p.y});Object.defineProperties(ev,{pointerId:{value:7},isPrimary:{value:true}});pausedCanvas.dispatchEvent(ev);await tick();});assert.equal((await saved()).pages[1].marks.at(-1).kind,'line');await click('撤销');
 for(const m of cubeStrokes)await draw(m.points.map(p=>[p.x,p.y]));assert.equal((await saved()).pages[1].marks.at(-1).kind,'cuboid','separate freehand strokes collapse into a standardized cuboid in the actual component');await click('撤销');await click('撤销');await click('撤销');assert.equal((await saved()).pages[1].marks.length,1);
 await click('上一页板书');assert.equal((await saved()).page,0);
 await click('切换深色画布');assert(document.querySelector('.wb-dark'));await click('全屏白板');assert(document.querySelector('.wb-maximized'));await click('退出全屏白板');assert(!document.querySelector('.wb-maximized'));
 await click('导出图片');assert.equal(blobs.length,1);assert.equal(blobs[0].type,'image/png');assert(blobs[0].size>1000);
 await click('题目参考');assert(document.querySelector('.wb-reference').textContent.includes('Original task'));
 await click('关闭AI白板');assert(!document.querySelector('[role="dialog"]'));await click('AI白板');assert.equal((await saved()).pages[0].marks.length,2);assert(document.querySelector('.wb-dark'));
 console.log('PASS: lazy modal, mouse drawing, two-stage cuboid, clear/undo/redo, multiple pages, theme, fullscreen, original reference, PNG and reload persistence');
 assert(document.querySelector('.wb-elements'),'teaching shelf starts open');
 await click('添加奶牛');await click('添加奶牛');let props=(await saved()).pages[0].objects;assert.equal(props.length,2);assert.notEqual(props[0].variant,props[1].variant);assert.deepEqual(props.map(p=>p.label),['Bessie','Elsie']);assert.equal(document.querySelectorAll('.wb-element-card').length,17);
 const oldX=props[1].x;await draw([[800,450],[930,510]]);props=(await saved()).pages[0].objects;assert(Math.abs(props[1].x-oldX-130)<.01,'drag moves the selected cow');
 await click('撤销');assert.equal((await saved()).pages[0].objects[1].x,oldX);await click('重做');assert(Math.abs((await saved()).pages[0].objects[1].x-oldX-130)<.01);
 await click('添加数组');await act(async()=>{const field=document.querySelector('[aria-label=元素数据]');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,'9, 2, 6');field.dispatchEvent(new Event('input',{bubbles:true}));await tick();});await act(async()=>{document.querySelector('.wb-element-editor form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await tick();});assert.deepEqual((await saved()).pages[0].objects.at(-1).values,['9','2','6']);
 let selectedProp=(await saved()).pages[0].objects.at(-1);const resizeHandle=button('调整元素大小');await act(async()=>{for(const [type,dx,dy] of [['pointerdown',0,0],['pointermove',82,28],['pointerup',82,28]]){const ev=new MouseEvent(type,{bubbles:true,button:0,clientX:selectedProp.x+selectedProp.w+dx,clientY:selectedProp.y+selectedProp.h+dy});Object.defineProperties(ev,{pointerId:{value:8},isPrimary:{value:true}});resizeHandle.dispatchEvent(ev);}await tick();});assert((await saved()).pages[0].objects.at(-1).w>selectedProp.w,'corner drag resizes proportionally');
 const originalWidth=(await saved()).pages[0].objects.at(-1).w;await click('放大选中元素');assert((await saved()).pages[0].objects.at(-1).w>originalWidth);await click('复制选中元素');assert.equal((await saved()).pages[0].objects.length,4);await click('删除选中元素');assert.equal((await saved()).pages[0].objects.length,3);await click('撤销');assert.equal((await saved()).pages[0].objects.length,4);
 await click('清空本页');assert.equal((await saved()).pages[0].objects.length,0);await click('撤销');assert.equal((await saved()).pages[0].objects.length,4);assert.doesNotThrow(()=>wb.readBoard(JSON.stringify(JSON.parse(localStorage.getItem(wb.boardKey(context.id))))));
 await act(async()=>{const ev=new MouseEvent('drop',{bubbles:true,cancelable:true,clientX:250,clientY:300});Object.defineProperty(ev,'dataTransfer',{value:{getData:()=> 'dictionary',types:['application/x-usaco-element']}});document.querySelector('.wb-canvas-wrap').dispatchEvent(ev);await tick();});const dropped=(await saved()).pages[0].objects.at(-1);assert.equal(dropped.kind,'dictionary');assert(Math.abs(dropped.x+dropped.w/2-250)<.01&&Math.abs(dropped.y+dropped.h/2-300)<.01,'shelf drop uses pointer position');await click('撤销');
 await click('导出图片');assert(blobs.at(-1).size>1000);await click('收起教学元素');assert(!document.querySelector('.wb-elements'));await click('教学元素');assert(document.querySelector('.wb-elements'));
 await click('关闭AI白板');await click('AI白板');assert.equal((await saved()).pages[0].objects.length,4,'objects persist across reopening');
 await click('添加奶牛');assert.equal((await saved()).pages[0].objects.at(-1).label,'Alice','other objects do not advance the cow name sequence');await click('复制选中元素');assert.equal((await saved()).pages[0].objects.at(-1).label,'Mildred');await click('撤销');await click('撤销');
 // Edit the new formats through the actual shelf, then restore the original object count.
 for(const [label,value,expected] of [['二维网格','0 1 0\n1 # 0',['0 1 0','1 # 0']],['双指针','1,2,3,4,5,6,7,8,9,10,11,12,i=2,j=9',['1','2','3','4','5','6','7','8','9','10','11','12','i=2','j=9']],['二叉树','1,2,3,4,5,6,7,8,9,10,11,12,13,14,15',Array.from({length:15},(_,i)=>String(i+1))]]){
  await click('添加'+label);await act(async()=>{const field=document.querySelector('[aria-label=元素数据]');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,value);field.dispatchEvent(new Event('input',{bubbles:true}));await tick();});await act(async()=>{document.querySelector('.wb-element-editor form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await tick();});const board=await saved();assert.deepEqual(board.pages[0].objects.at(-1).values,expected);assert.doesNotThrow(()=>wb.readBoard(JSON.stringify(board)));await click('删除选中元素');
 }
 assert.equal((await saved()).pages[0].objects.length,4);
 console.log('PASS: new cow names and copies, 17 shelf entries, multiline grid editing, 14 pointer fields and 15 tree nodes survive storage');
 console.log('PASS: teaching shelf, varied cows, move, value editing, scaling, duplication, deletion, shared undo/redo/clear, export and persistence');
 await click('开启手势书写');await act(tick);assert.equal(gumCalls,1);assert(document.querySelector('video'));assert.equal(document.querySelector('video').getAttribute('aria-hidden'),'true');assert(document.querySelector('video').style.left==='-10000px');
 const worker=workers.at(-1);const emit=async(t,gesture,ls=landmarks,score=.95)=>act(async()=>{worker.emit({type:'result',timestamp:t,gesture,score,landmarks:ls});await tick();});
 await act(async()=>{const control=document.querySelector('[aria-label=手势落笔方式]');control.value='gesture';control.dispatchEvent(new Event('change',{bubbles:true}));await tick();});await click('画笔');await emit(100,'Closed_Fist');await emit(230,'Closed_Fist');await emit(250,'Pointing_Up');await emit(400,'Pointing_Up');await emit(440,'Pointing_Up',landmarks.map(p=>({...p,x:.45})));await emit(460,'None',landmarks.map(p=>({...p,x:.43})),0);await emit(480,'None',[],0);await emit(520,'Pointing_Up',landmarks.map(p=>({...p,x:.42})));await emit(550,'Closed_Fist');const written=await saved();assert(['pen','line'].includes(written.pages[0].marks.at(-1).kind));assert(written.pages[0].marks.at(-1).points.length>=2);assert.equal(written.pages[0].marks.length,3,'classification flicker and brief occlusion must remain one undoable stroke');
 await emit(600,'Open_Palm');await emit(800,'Open_Palm');await emit(1000,'Open_Palm');await emit(1120,'Open_Palm');await emit(1160,'Open_Palm',landmarks.map(p=>({...p,x:.46})));await emit(1200,'None',[]);const rubbed=await saved();assert.equal(rubbed.pages[0].marks.at(-1).kind,'erase');assert.equal(rubbed.pages[0].marks.at(-1).width,240);assert.doesNotThrow(()=>wb.readBoard(JSON.stringify(rubbed)));
 await act(async()=>{const size=document.querySelector('[aria-label=橡皮大小]');size.value='360';size.focus();size.dispatchEvent(new Event('change',{bubbles:true}));await tick();});await emit(1300,'Closed_Fist');await emit(1340,'Pointing_Up');await emit(1460,'Pointing_Up');await emit(1500,'Pointing_Up',landmarks.map(p=>({...p,x:.47})));await emit(1540,'Closed_Fist');assert(['pen','line'].includes((await saved()).pages[0].marks.at(-1).kind),'a focused dropdown must not block hand drawing');
 await click('橡皮');await draw([[300,300],[450,300]]);const huge=await saved();assert.equal(huge.pages[0].marks.at(-1).width,360);assert.doesNotThrow(()=>wb.readBoard(JSON.stringify(huge)));await click('画笔');
 await act(async()=>{const control=document.querySelector('[aria-label=手势落笔方式]');control.value='space';control.dispatchEvent(new Event('change',{bubbles:true}));await tick();});
 const beforeClutch=(await saved()).pages[0].marks.length;
 await emit(1600,'Pointing_Up',hand());assert.equal((await saved()).pages[0].marks.length,beforeClutch,'pointing alone only moves cursor in Space mode');
 const inkCanvas=document.querySelector('.wb-ink');await act(async()=>{const dropdown=document.querySelector('[aria-label=橡皮大小]');dropdown.focus();assert.equal(dropdown.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true,cancelable:true})),false,'Space clutch also works after a toolbar dropdown was used');await tick();});await emit(1700,'None',hand());await emit(1750,'None',hand('point',0,-.02));await emit(1800,'None',hand('point',0,-.04));
 await act(async()=>{inkCanvas.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' ',bubbles:true,cancelable:true}));await tick();});let afterClutch=await saved();assert.equal(afterClutch.pages[0].marks.length,beforeClutch+1,'keyup commits without waiting for another camera frame');
 await emit(1850,'None',hand('point',0,-.08));await emit(1900,'None',hand('point',0,-.12));assert.equal((await saved()).pages[0].marks.length,beforeClutch+1,'moving to the next position leaves no connecting stroke');
 await act(async()=>{inkCanvas.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true,cancelable:true}));await tick();});await emit(1950,'None',hand('point',0,-.12));await emit(2000,'None',hand('point',0,-.14));await act(async()=>{window.dispatchEvent(new Event('blur'));await tick();});assert.equal((await saved()).pages[0].marks.length,beforeClutch+2,'window blur releases held Space safely');
 console.log('PASS: real keyboard events control camera ink; release and window blur commit immediately; travel while lifted never joins strokes');
 await click('关闭AI白板');assert(streams[0].track.stopped);assert(worker.terminated);assert(!document.querySelector('video'));
 console.log('PASS: camera opt-in, hidden video, synthetic landmark writing/erasing, closing stops stream/worker and removes video');
 await click('AI白板');await click('开启手势书写');await act(tick);Object.defineProperty(document,'hidden',{value:true,configurable:true});await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));await tick();});assert(streams.at(-1).track.stopped);assert(!document.querySelector('video'));Object.defineProperty(document,'hidden',{value:false,configurable:true});
 let resolve;deferred=new Promise(r=>resolve=r);await click('开启手势书写');await click('关闭摄像头');const late=stream();await act(async()=>{resolve(late);await tick();});deferred=null;assert(late.track.stopped,'late permission response must stop immediately');assert(!document.querySelector('video'));
 await click('开启手势书写');await act(tick);const broken=streams.at(-1);await act(async()=>{workers.at(-1).emit({type:'error',stage:'init',message:'failed'});await tick();});assert(broken.track.stopped);assert(document.querySelector('[role="alert"]'));assert(!document.querySelector('video'));
 await click('关闭AI白板');await act(async()=>{view.render(React.createElement(WhiteboardLauncher,{context:{...context,id:'lesson-io',problemId:undefined}}));await tick();});await click('AI白板');assert.equal(document.querySelector('.wb-pages span').textContent,'1/1');assert(!localStorage.getItem(wb.boardKey('lesson-io')));assert(localStorage.getItem(wb.boardKey(context.id)));
 await click('关闭AI白板');await act(()=>view.unmount());
 console.log('PASS: background-tab cleanup, late-permission cancellation, error recovery, per-context storage isolation');
 }finally{try{await act(()=>view.unmount());}catch{}dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
