// DOM/canvas interaction checks; does not claim a rendered-browser verification.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-qa/node_modules/jsdom'),{createCanvas}=require(process.env.CANVAS_TEST_DIR||'/tmp/usaco-qa/node_modules/@napi-rs/canvas');
const root=process.cwd(),dom=new JSDOM('<!doctype html><html><body><div id="root"></div><article data-annotation-anchor="statement-1-en">A teaching statement</article></body></html>',{url:'https://example.test',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Element','HTMLCanvasElement','Event','MouseEvent','KeyboardEvent','localStorage','getComputedStyle'])global[key]=dom.window[key];
Object.assign(global,{innerWidth:1200,innerHeight:800,devicePixelRatio:1,scrollY:0,IS_REACT_ACT_ENVIRONMENT:true,requestAnimationFrame:dom.window.requestAnimationFrame.bind(dom.window),cancelAnimationFrame:dom.window.cancelAnimationFrame.bind(dom.window),ResizeObserver:class{observe(){}disconnect(){}}});
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,...a){return resolve.call(this,n.startsWith('@/')?path.join(root,n.slice(2)):n,...a);};for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
require.extensions['.css']=()=>{};
for(const key of ['Node','NodeFilter','DocumentFragment','MutationObserver','DOMParser'])global[key]=dom.window[key];
const contexts=new WeakMap();HTMLCanvasElement.prototype.getContext=function(){if(!contexts.has(this))contexts.set(this,createCanvas(1200,800).getContext('2d'));return contexts.get(this);};
HTMLElement.prototype.setPointerCapture=function(){};HTMLElement.prototype.releasePointerCapture=function(){};HTMLElement.prototype.hasPointerCapture=()=>false;
const article=document.querySelector('article');let rect={x:100,y:150,left:100,top:150,right:1100,bottom:650,width:1000,height:500};article.getBoundingClientRect=()=>rect;document.elementsFromPoint=()=>[article];
const {readPageMarks,hitPageMark,movePageMark}=require(root+'/lib/page-annotations.ts'),PageAnnotations=require(root+'/components/page-annotations.tsx').default;
assert.deepEqual(readPageMarks('bad'),[]);assert.deepEqual(readPageMarks(JSON.stringify([{id:'broken'}])),[]);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),view=createRoot(document.getElementById('root'));
const tick=()=>new Promise(r=>setTimeout(r,30));function find(label){const b=[...document.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')===label||n.textContent===label);assert(b,'Missing '+label);return b;}
async function click(label){await act(async()=>{find(label).click();await tick();});}
async function pointer(type,x,y){await act(async()=>{const e=new MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0});Object.defineProperty(e,'pointerId',{value:1});document.querySelector('canvas').dispatchEvent(e);await tick();});}
function saved(key='first'){return JSON.parse(localStorage.getItem('usaco-page-annotations-v1-'+key)||'[]');}
(async()=>{try{
 await act(async()=>{view.render(React.createElement(PageAnnotations,{contextKey:'first',onClose:()=>{}}));await tick();});
 assert.equal(document.querySelector('canvas').style.pointerEvents,'auto');assert.equal(find('AI画笔').getAttribute('aria-pressed'),'true');await click('蓝色画笔');await pointer('pointerdown',200,250);await pointer('pointermove',350,250);await pointer('pointerup',400,250);await click('保存标注');await click('保存到本机');
 let marks=saved();assert.equal(marks.length,1);assert.equal(marks[0].anchor,'statement-1-en');assert.equal(marks[0].ink.color,'blue');assert.equal(marks[0].ink.kind,'line');assert.equal(marks[0].ink.points[0].x,100);assert(hitPageMark(marks[0],{x:150,y:100}));assert(!hitPageMark(marks[0],{x:400,y:300}));assert.equal(movePageMark(marks[0],20,30).ink.points[0].x,120);
 await click('撤销标注');assert(!find('撤销标注').disabled===false);await click('重做标注');await click('选择');await pointer('pointerdown',280,250);await pointer('pointermove',330,300);await pointer('pointerup',330,300);await click('保存标注');await click('保存到本机');assert.equal(saved()[0].ink.points[0].x,150);
 await click('橡皮擦');await pointer('pointerdown',330,300);await pointer('pointerup',330,300);await click('保存标注');await click('保存到本机');assert.equal(saved().length,0);await click('撤销标注');
 await click('图形');await click('长方体');await pointer('pointerdown',550,350);await pointer('pointermove',700,500);await pointer('pointerup',700,500);await click('保存标注');await click('保存到本机');assert.equal(saved().length,2);assert.equal(saved()[1].ink.kind,'cuboid');
 await click('文本');await pointer('pointerdown',700,250);await act(async()=>{const el=document.querySelector('textarea');Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(el,'维护当前最大值');el.dispatchEvent(new Event('input',{bubbles:true}));await tick();});await click('添加文字');await click('保存标注');await click('保存到本机');assert.equal(saved().at(-1).text,'维护当前最大值');
 await click('清空本页标注');await click('撤销标注');assert(find('重做标注'));await click('鼠标');assert.equal(document.querySelector('canvas').style.pointerEvents,'none');
 // Anchor rect follows scrolling and scaling; stored coordinates remain relative to the task.
 rect={x:50,y:-50,left:50,top:-50,right:550,bottom:200,width:500,height:250};await act(async()=>{document.dispatchEvent(new Event('scroll'));await tick();});await click('保存标注');await click('保存到本机');assert.equal(saved()[0].ink.points[0].x,150);
 // A context switch must not save the previous problem's marks under the new key.
 await act(async()=>{view.render(React.createElement(PageAnnotations,{contextKey:'second',onClose:()=>{}}));await tick();});await act(async()=>{await new Promise(r=>setTimeout(r,350));});assert.equal(saved('second').length,0);assert.equal(saved('first').length,3);
 await act(async()=>{view.render(React.createElement(PageAnnotations,{contextKey:'first',onClose:()=>{}}));await tick();});await click('保存标注');await click('保存到本机');assert.equal(saved().length,3);
 console.log('PASS: annotation pen/shape recognition, color, anchor coordinates, selection/drag, eraser, text, undo/redo, mouse passthrough, per-page persistence and context isolation');
 await act(()=>view.unmount());
 // Fullscreen API lifecycle is exercised with DOM events, not a real display.
 const Reader=require(root+'/components/official-statement.tsx').OfficialStatement,readerRoot=createRoot(document.getElementById('root'));let fullscreen=null;Object.defineProperty(document,'fullscreenElement',{get:()=>fullscreen});HTMLElement.prototype.requestFullscreen=async function(){fullscreen=this;document.dispatchEvent(new Event('fullscreenchange'));};document.exitFullscreen=async()=>{fullscreen=null;document.dispatchEvent(new Event('fullscreenchange'));};
 await act(async()=>{readerRoot.render(React.createElement(Reader,{id:1589,title:'Swap to Win'}));await tick();});await click('全屏读题');assert.equal(fullscreen,document.querySelector('.statement-fullscreen'));await click('放大题面');assert.equal(document.querySelector('.statement-zoom-content').style.zoom,'1.1');await act(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await tick();});assert.equal(fullscreen,null);assert(!document.querySelector('.statement-fullscreen'));assert.equal(document.body.style.overflow,'');
 console.log('PASS: Fullscreen API request, zoom, Escape exit and scroll restoration (DOM events)');await act(()=>readerRoot.unmount());
 }finally{dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
