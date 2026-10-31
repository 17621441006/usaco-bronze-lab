// Focus/scroll regression with real Radix/React components and a mock Monaco adapter.
// npm install --prefix /tmp/usaco-dom-tests jsdom@26.1.0
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const root=process.cwd(),ts=require('typescript');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-dom-tests/node_modules/jsdom');
const dom=new JSDOM('<!doctype html><html><body><main id="page"><div id="root"></div></main></body></html>',{url:'https://example.test/',pretendToBeVisual:true});
for(const key of ['window','document','Node','NodeFilter','HTMLElement','Element','HTMLInputElement','HTMLTextAreaElement','DocumentFragment','MutationObserver','DOMParser','DOMRect','Event','CustomEvent','MouseEvent','KeyboardEvent','getComputedStyle','localStorage'])global[key]=dom.window[key];
for(const key of Object.getOwnPropertyNames(dom.window).filter(n=>/^HTML\w*Element$/.test(n)))global[key]=dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT=true;global.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);global.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
global.ResizeObserver=dom.window.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
global.matchMedia=dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
HTMLElement.prototype.scrollTo=function({top,left}){this.scrollTop=top;this.scrollLeft=left;};
HTMLElement.prototype.scrollIntoView=()=>{};
const focusCalls=[],nativeFocus=HTMLElement.prototype.focus;
HTMLElement.prototype.focus=function(options){focusCalls.push({element:this,options});nativeFocus.call(this,options);};
const originalResolve=Module._resolveFilename,originalLoad=Module._load;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const page=document.getElementById('page'),container=document.getElementById('root');
let pendingCaret=null,undoStops=0;
function MockEditor(props){
 const current=React.useRef(props);current.current=props;
 const input=React.useRef(null);
 React.useEffect(()=>{
  props.onMount({getSelection:()=>({start:input.current.selectionStart,end:input.current.selectionEnd}),pushUndoStop(){undoStops++;},executeEdits(_source,[edit]){const p=current.current;pendingCaret=edit.range.start+edit.text.length;p.onChange(p.value.slice(0,edit.range.start)+edit.text+p.value.slice(edit.range.end));},focus(){page.scrollTop=0;page.scrollLeft=0;document.documentElement.scrollTop=0;input.current.focus();},layout(){},onDidChangeCursorPosition(){}},{editor:{getModels:()=>[]}});
 },[]);
 React.useLayoutEffect(()=>{if(pendingCaret!==null){input.current.setSelectionRange(pendingCaret,pendingCaret);pendingCaret=null;}},[props.value]);
 return React.createElement('textarea',{ref:input,'aria-label':'Test editor',value:props.value,onChange:e=>props.onChange(e.target.value)});
}
Module._load=function(name,parent,...args){
 if(name==='@monaco-editor/react')return {__esModule:true,loader:{config(){}},default:MockEditor};
 if(name==='@/hooks/use-python-inspection')return {usePythonInspection:()=>({snapshot:null,visibleIssues:[],dismiss(){}})};
 if(name==='@/lib/monaco-python-inspection')return {attachPythonInspection:()=>({update(){},dispose(){}})};
 if(name==='@/lib/editor-shortcuts')return {bindProjectShortcuts(){}};
 return originalLoad.call(this,name,parent,...args);
};
const {ProjectIDE}=require(root+'/components/project-ide.tsx'),{contestSnippets}=require(root+'/data/contest-snippets.ts'),{withPreservedPageScroll}=require(root+'/lib/editor-scroll.ts');
const view=createRoot(container),tick=()=>new Promise(resolve=>setTimeout(resolve,30));
const button=label=>{const el=[...document.querySelectorAll('button')].find(el=>el.getAttribute('aria-label')===label||el.textContent.trim()===label);assert(el,`Missing button ${label}`);return el;};
const click=async label=>act(async()=>{button(label).click();await tick();});
const scrolled=()=>{page.scrollTop=900;page.scrollLeft=24;document.documentElement.scrollTop=1200;};
const checkScroll=()=>assert.deepEqual([page.scrollTop,page.scrollLeft,document.documentElement.scrollTop],[900,24,1200]);
const editor=()=>document.querySelector('[aria-label="Test editor"]');
const focusWasPrevented=el=>assert(focusCalls.filter(c=>c.element===el).at(-1)?.options?.preventScroll,'Focus must not scroll the page');
(async()=>{try{
 const source='before = 1\n\nprint(before)\n',insertAt=source.indexOf('\n')+1;
 await act(async()=>{view.render(React.createElement(ProjectIDE,{problem:{id:999,title:'Regression',samples:[],testsTotal:0},mode:'learn',onAttempt:()=>{},initialPython:source}));await tick();});
 editor().setSelectionRange(insertAt,insertAt);scrolled();
 await click('常用竞赛语句');checkScroll();
 let panel=document.querySelector('[aria-label="竞赛常用语句"]');assert(panel);assert(!container.contains(panel),'Panel must escape the editor overflow container');
 assert.equal(panel.closest('[data-radix-popper-content-wrapper]').style.position,'fixed');
 const search=panel.querySelector('input');assert.strictEqual(document.activeElement,search);focusWasPrevented(search);
 assert(panel.querySelector('[role="option"]').textContent.includes('大量数据 · 整批读入'));
 assert.equal(panel.querySelector('pre').textContent,contestSnippets[0].python);assert.equal(contestSnippets[0].id,'tokens');
 assert(panel.textContent.includes('更多内存'));assert(panel.textContent.includes('不保留空格与换行'));
 await click('插入光标位置');checkScroll();
 assert(!document.querySelector('[aria-label="竞赛常用语句"]'));assert.strictEqual(document.activeElement,editor());
 assert.equal(editor().value,source.slice(0,insertAt)+contestSnippets[0].python+source.slice(insertAt));
 assert.equal(editor().selectionStart,insertAt+contestSnippets[0].python.length);assert.equal(undoStops,2);
 console.log('PASS: anchored portal, preventScroll search focus, prioritized bulk input, insertion retains page offsets and caret');

 await click('常用竞赛语句');await click('关闭常用语句');checkScroll();focusWasPrevented(button('常用竞赛语句'));assert.strictEqual(document.activeElement,button('常用竞赛语句'));
 await click('切换浅色编辑器');await click('常用竞赛语句');assert(document.querySelector('.contest-snippets.snippets-light'));
 await act(async()=>{document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await tick();});checkScroll();assert(!document.querySelector('.contest-snippets'));
 await click('展开工程目录');await act(async()=>{[...document.querySelectorAll('.pi-tree button')].find(b=>b.textContent==='main.cpp').click();await tick();});
 const cppBefore=editor().value;editor().setSelectionRange(0,0);
 await click('常用竞赛语句');panel=document.querySelector('.contest-snippets');assert(!panel.querySelector('.snippet-badge'));assert.equal(panel.querySelector('pre').textContent,contestSnippets[0].cpp);
 await act(async()=>{panel.querySelector('[role="option"]').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));await tick();});
 checkScroll();assert.equal(editor().value,contestSnippets[0].cpp+cppBefore);assert.strictEqual(document.activeElement,editor());
 console.log('PASS: close/Escape focus, light theme, C++ language note and double-click insertion');

 await click('常用竞赛语句');await act(async()=>{view.render(React.createElement(ProjectIDE,{problem:{id:999,title:'Regression',samples:[],testsTotal:0},mode:'learn',onAttempt:()=>{},visible:false}));await tick();});assert(!document.querySelector('.contest-snippets'));
 assert.throws(()=>withPreservedPageScroll(container,()=>{page.scrollTop=0;document.documentElement.scrollTop=0;throw Error('abort');}));checkScroll();
 console.log('PASS: hidden pages close their popup; scroll restoration also survives interrupted editor actions');
}finally{await act(async()=>view.unmount());dom.window.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
