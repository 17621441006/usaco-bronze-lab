// UI v2 release regression: DOM interactions with Monaco/WebGL/runner controls mocked.
// Real workers and canvas drawing are verified by the separate existing scripts.
// npm install --prefix /tmp/usaco-dom-tests jsdom@26.1.0
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const root=process.cwd(),ts=require('typescript');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-dom-tests/node_modules/jsdom');
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test/#route',pretendToBeVisual:true});
for(const key of ['window','document','Node','NodeFilter','HTMLElement','Element','HTMLInputElement','HTMLTextAreaElement','DocumentFragment','MutationObserver','DOMParser','DOMRect','Event','CustomEvent','MouseEvent','KeyboardEvent','getComputedStyle','localStorage'])global[key]=dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT=true;global.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);global.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
global.matchMedia=dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
global.ResizeObserver=dom.window.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
for(const key of Object.getOwnPropertyNames(dom.window).filter(n=>/^HTML\w*Element$/.test(n)))global[key]=dom.window[key];
dom.window.scrollTo=()=>{};dom.window.HTMLElement.prototype.scrollIntoView=()=>{};dom.window.HTMLElement.prototype.hasPointerCapture=()=>false;dom.window.HTMLElement.prototype.setPointerCapture=()=>{};dom.window.HTMLElement.prototype.releasePointerCapture=()=>{};
for(const [key,value] of Object.entries({offsetWidth:600,offsetHeight:800,clientWidth:600,clientHeight:800}))Object.defineProperty(dom.window.HTMLElement.prototype,key,{get(){return value;},configurable:true});
const originalResolve=Module._resolveFilename,originalLoad=Module._load;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
require.extensions['.css']=()=>{};
let gradeStatus='AC',lastCourseCases=[];
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const style=document.createElement('style');
const rules=require('postcss').parse(fs.readFileSync(root+'/app/globals.css','utf8')).nodes.filter(n=>n.type==='rule'&&(/(?:page-tab|practice-panel-inner|reading-panel-scroll|coding-panel-scroll|study-sidebar|nav-brand-row|page-title|reading-toolbar)/.test(n.selector)));
style.textContent=rules.map(n=>n.toString()).join('\n');document.head.appendChild(style);
Module._load=function(name,parent,...args){
 if(name==='@/lib/practice-runner')return {PracticeRunner:class{stop(){}async run(args){lastCourseCases=args.cases;const results=args.cases.map(c=>({name:c.name,status:c.output===null?'RUN':gradeStatus,input:c.input,expected:c.output,output:c.output===null?'6\n':gradeStatus==='WA'?'999\n':c.output,ms:1}));results.forEach(args.onResult);return results;}}};
 if(name==='@monaco-editor/react')return {__esModule:true,loader:{config(){}},default:props=>React.createElement('textarea',{'aria-label':props.options?.ariaLabel||'Test editor',value:props.value,readOnly:props.options?.readOnly,'data-fontsize':props.options.fontSize,'data-theme':props.theme,'data-path':props.path,onChange:e=>props.onChange(e.target.value)})};
 if(name==='./learning-scene'){const m=originalLoad.call(this,name,parent,...args);return {...m,LearningScene:()=>React.createElement('div',{'data-webgl-placeholder':true})};}
 if(name==='./problem-diagram')return {ProblemDiagram:()=>null};
 return originalLoad.call(this,name,parent,...args);
};
const {sanitizeStatement}=require(root+'/lib/statement-document.ts'),{readProject,selectFile}=require(root+'/lib/project-files.ts');
const safe=sanitizeStatement('<header>discard</header><div id="probtext-text"><p onclick="alert(1)">Task $N$</p><script>bad()</script><a href="javascript:bad()">link</a><img src="https://external.test/x" onerror="bad()"><pre>1 2\n3</pre></div>');
assert(!/script|onclick|onerror|javascript:|https:\/\/external|discard/.test(safe));assert(safe.includes('1 2\n3'));assert(safe.includes('$N$'));
assert.equal(sanitizeStatement('<script>as text</script>',true),'<pre>&lt;script&gt;as text&lt;/script&gt;</pre>');
assert.equal(readProject(null,'# 先读题，再独立尝试\n\nprint(8)').files['main.py'],'print(8)');assert.equal(readProject(null,'# My own note\nprint(8)').files['main.py'],'# My own note\nprint(8)');
assert.equal(readProject(null,'my saved Python','my saved C++').files['main.py'],'my saved Python');
const project=selectFile(readProject(null),'main.cpp');assert.equal(project.entryFile,'main.cpp');assert.equal(readProject(JSON.stringify(project)).entryFile,'main.cpp');
console.log('PASS: local document sanitization, literal text import and existing draft migration');
const {filterProblems,defaultArchiveFilters,topicMatches}=require(root+'/lib/problem-library.ts'),catalog=require(root+'/data/catalog.json'),topicData=require(root+'/data/learning-topics.json');
assert.equal(filterProblems(catalog,defaultArchiveFilters).length,60);assert.equal(filterProblems(catalog,{...defaultArchiveFilters,period:'classic'}).length,46);assert.equal(filterProblems(catalog,{...defaultArchiveFilters,period:'all'}).length,106);
assert.equal(filterProblems(catalog,{...defaultArchiveFilters,query:'Fence Painting'})[0].id,567);assert(catalog.every(p=>p.learningTopics.length&&p.learningTopics.every(id=>topicData.some(t=>t.id===id))));assert.deepEqual(catalog.filter(p=>topicMatches(p,'dp')).map(p=>p.id).sort((a,b)=>a-b),[510,528,1157,1493,1564]);
console.log('PASS: 60 recent / 46 classic / 106 searchable problems, complete taxonomy, separate optional DP labels');

global.fetch=async url=>new Response(fs.readFileSync(root+'/public'+url));
const container=document.getElementById('root'),view=createRoot(container),tick=()=>new Promise(r=>setTimeout(r,25));
function find(label,scope=document){const element=[...scope.querySelectorAll('button,[role=menuitem]')].find(n=>n.getAttribute('aria-label')===label||n.textContent.trim()===label||n.getAttribute('title')===label);assert(element,`Missing button: ${label}`);return element;}
async function click(label,scope=document){await act(async()=>{const button=find(label,scope);button.dispatchEvent(new dom.window.MouseEvent('mousedown',{bubbles:true,button:0}));button.click();await tick();});}
async function input(element,value){await act(async()=>{Object.getOwnPropertyDescriptor(element.tagName==='INPUT'?dom.window.HTMLInputElement.prototype:dom.window.HTMLTextAreaElement.prototype,'value').set.call(element,value);element.dispatchEvent(new dom.window.Event('input',{bubbles:true}));await tick();});}

async function render(element){await act(async()=>{view.render(element);await tick();});}
async function navigate(page){await act(async()=>{window.location.hash=page;window.dispatchEvent(new Event('hashchange'));await tick();});}
const editor=(scope=container)=>scope.querySelector('[aria-label="Test editor"]');
(async()=>{try{
 const StudyApp=require(root+'/components/study-app.tsx').default;
 await render(React.createElement(StudyApp));
 assert(container.querySelector('.lx-home'));assert(container.querySelector('[data-slot=sidebar]').dataset.state==='expanded');
 await navigate('practice/567');let active=container.querySelector('.kept-problem-page:not([hidden])');
 assert(active.querySelector('.local-statement-body'));assert(!active.querySelector('iframe'));assert(!editor(active));
 await click('中文',active);assert(active.querySelector('.local-statement-body').textContent.includes('栅栏'));
 await click('开始编程',active);assert(editor(active));
 await input(editor(active),'print(1 + 5)');await click('保存',active);assert.equal(JSON.parse(localStorage.getItem('usaco-project-567')).files['main.py'],'print(1 + 5)');
 await click('运行',active);assert.equal(active.querySelector('[aria-label="程序输出数据"]').textContent,'6\n');
 await click('检查样例',active);assert.equal(lastCourseCases.length,1);assert.equal(active.querySelector('[aria-label="预期输出数据"]').textContent.trim(),catalog.find(p=>p.id===567).samples[0].output.trim());
 await click('提交评测 · 10 例',active);assert.equal(lastCourseCases.length,10);
 await click('切换浅色编辑器',active);assert.equal(editor(active).dataset.theme,'usaco-pro-light');
 await act(async()=>{const size=active.querySelector('[aria-label="代码字号"]');size.value='20';size.dispatchEvent(new Event('change',{bubbles:true}));await tick();});assert.equal(editor(active).dataset.fontsize,'20');
 await click('全屏编程',active);assert(active.querySelector('.pi-max'));await act(async()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await tick();});assert(!active.querySelector('.pi-max'));
 await click('展开工程目录',active);await click('main.cpp',active.querySelector('.pi-tree'));assert(active.textContent.includes('在线编译尚未接入'));await click('main.py',active.querySelector('.pi-tree'));assert.equal(editor(active).value,'print(1 + 5)');
 await navigate('route');assert(active.hidden);await act(async()=>{container.querySelector('.lx-tabs-more').dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0}));await tick();});await click('Fence Painting',document.querySelector('[role=menu]'));assert(!active.hidden);assert.equal(editor(active).value,'print(1 + 5)');
 console.log('PASS: reading-first bilingual problem, save/run/sample/full judge wiring, themes, font size, fullscreen, files and tab retention (Monaco/runner mocked)');

 await navigate('python');assert.equal(container.querySelectorAll('[aria-label="Python 基础课程"] button').length,18);
 await act(async()=>{[...container.querySelectorAll('.lx-rail-item')].find(b=>b.title==='输入、转换与输出').click();await tick();});
 await click('开始编程',container.querySelector('.lx-ex'));assert(container.querySelector('.lx-course-body.is-collapsed'));
 await input(editor(),'print(1 + 5)');await click('运行',container.querySelector('.lx-ex'));assert.equal(container.querySelector('[aria-label="程序输出数据"]').textContent,'6\n');
 await click('检查样例',container.querySelector('.lx-ex'));assert(!JSON.parse(localStorage.getItem('usaco-course-exercise-progress-v1')||'[]').length);
 gradeStatus='WA';await click('提交检查 · 3 例');assert(!JSON.parse(localStorage.getItem('usaco-course-exercise-progress-v1')||'[]').length);
 gradeStatus='AC';await click('提交检查 · 3 例');assert.equal(lastCourseCases.length,3);assert.equal(JSON.parse(localStorage.getItem('usaco-course-exercise-progress-v1')).length,1);
 await click('收起编程区');await click('开始编程');assert.equal(editor().value,'print(1 + 5)');
 await navigate('classroom');assert.equal(container.querySelectorAll('[aria-label="算法课程"] button').length,18);
 for(const [id,expected] of [['graphs','网格搜索实验室'],['prefix','二维前缀和实验'],['geometry','矩形重叠实验']]){
  const lesson=require(root+'/data/course-lessons.ts').algorithmLessons.find(l=>l.id===id);
  await click(lesson.title,container.querySelector('.lx-rail'));assert(container.querySelector(`[aria-label="${expected}"]`));await click('平面网格实验');
 }
 const {VisualLesson}=require(root+'/components/visual-lesson.tsx');await render(React.createElement(VisualLesson,{kind:'fence'}));await click('2D');assert(container.querySelector('svg[aria-label="FJ 与 Bessie 涂色的数轴图"]'));await click('3D');assert(container.querySelector('[data-webgl-placeholder]'));
 console.log('PASS: Python/algorithm directories, course grading/progress and draft retention, lab entry points, 3D/2D view switching (WebGL unverified)');

 const {GridLab}=require(root+'/components/grid-lab.tsx');await render(React.createElement(GridLab));assert.equal(container.querySelectorAll('.lx-tile').length,96);
 await click('下一步');assert(container.querySelector('.lx-caption').textContent.includes('(0,0)'));await click('DFS · 栈');await click('下一步');assert(container.querySelector('.lx-caption').textContent.includes('出栈'));await click('格子 1,3');assert(!find('格子 1,3').classList.contains('is-fence'));
 const {PrefixLab,RectLab}=require(root+'/components/geo-labs.tsx');
 const pointer=async(el,type)=>act(async()=>{el.dispatchEvent(new MouseEvent(type,{bubbles:true,button:0}));await tick();});
 await render(React.createElement(PrefixLab));assert(container.textContent.includes('和公式结果一致'));
 await pointer(container.querySelector('.lx-geo-cell'),'pointerdown');await pointer(container.querySelector('.lx-geo-grid'),'pointerup');assert.equal(container.querySelector('.is-ans b').textContent,'3');await click('前缀和表 P');assert(container.querySelector('.is-prefix'));
 await render(React.createElement(RectLab));const values=()=>[...container.querySelectorAll('.lx-geo-results dd')].map(e=>+e.textContent);assert.deepEqual(values(),[42,40,9,73,33]);
 await pointer(find('格子 0,0'),'pointerdown');await pointer(container.querySelector('.lx-gl-grid'),'pointerup');assert.deepEqual(values(),[42,1,0,43,42]);
 console.log('PASS: BFS/DFS stepping and editable fences; prefix single-cell sum; rectangle overlap, union and disjoint case');

 const {ReviewPage}=require(root+'/components/review-page.tsx');await render(React.createElement(ReviewPage,{problems:catalog,attempts:[{id:567,status:'本次通过',detail:'main.py · 样例检查 · 1/1 通过'},{id:987,status:'本次通过',detail:'main.py · 完整官方数据 · 10 文件 · 10/10 通过'}],wrong:[],onOpen:()=>{}}));assert.equal(container.querySelector('.lx-kpi.is-green b').textContent,'1','sample AC must not count as full-data AC');
 await render(React.createElement(StudyApp));await navigate('library');assert(container.textContent.includes('60 道题'));
 await input(container.querySelector('[aria-label="搜索全部题目"]'),'507');assert(container.textContent.includes('Cow Routing'));
 await navigate('practice/507');active=container.querySelector('.kept-problem-page:not([hidden])');assert(!active.querySelector('iframe'));await click('开始编程',active);assert(find('完整测试待补充',active).disabled);
 await navigate('exam');assert(container.querySelector('.lx-exam'));await click('2015–2019',container.querySelector('.lx-exam'));await click('1 月',container.querySelector('.lx-rp-year:last-child'));assert(container.querySelector('.lx-paper').textContent.includes('4 题'));await click('开始 2015 / 01 · 4 小时训练');assert(localStorage.getItem('usaco-exam-end'));assert(container.querySelector('.kept-problem-page:not([hidden])'));
 await navigate('exam');await click('结束本次训练');assert(!localStorage.getItem('usaco-exam-end'));
 localStorage.setItem('usaco-note-567','release note');await navigate('review');await click('我的笔记1');assert(container.textContent.includes('release note'));
 await navigate('sources');assert(container.querySelector('.lx-src'));assert(container.textContent.includes('106'));assert.equal(container.querySelectorAll('.lx-stack-row').length,4);
 await act(async()=>{container.querySelector('.lx-tabs-more').dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0}));await tick();});await click('关闭这些页面');assert.equal(container.querySelectorAll('.lx-tabs-probe [data-tab-key]').length,1,'close all hidden tabs must retain only the visible active tab');
 await click('打开 Python Shell',container.querySelector('.page-tabbar'));let shell=document.querySelector('[aria-label="Python Shell 输入"]');assert(shell);await input(shell,'cows = [2, 3, 5]');await click('收起编程工具');await click('打开 Python Shell',container.querySelector('.page-tabbar'));assert.strictEqual(document.querySelector('[aria-label="Python Shell 输入"]'),shell);assert.equal(shell.value,'cows = [2, 3, 5]');
 await click('打开独立代码编辑器',container.querySelector('.page-tabbar'));const standalone=document.getElementById('coding-panel-editor');await input(editor(standalone),'print(1 + 5)');await click('保存',standalone);await click('运行',standalone);assert.equal(standalone.querySelector('[aria-label="程序输出数据"]').textContent,'6\n');assert.equal(document.querySelectorAll('[data-resize-edge]').length,8);
 console.log('PASS: recent/classic library, sample-only safeguards, four-problem mock exam, notes, sources, global Shell retention and standalone save/run');
 await act(async()=>view.unmount());
 }finally{await act(async()=>view.unmount());dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
