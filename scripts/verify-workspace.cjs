// DOM interaction checks; no browser rendering is simulated or claimed.
// npm install --prefix /tmp/usaco-dom-tests jsdom@26.1.0
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict');
const root=process.cwd(),ts=require('typescript');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-dom-tests/node_modules/jsdom');
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test/#practice/567',pretendToBeVisual:true});
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
const rules=require('postcss').parse(fs.readFileSync(root+'/app/globals.css','utf8')).nodes.filter(n=>n.type==='rule'&&(/(?:page-tab|practice-panel-inner|reading-panel-scroll|coding-panel-scroll)/.test(n.selector)));
style.textContent=rules.map(n=>n.toString()).join('\n');document.head.appendChild(style);
Module._load=function(name,parent,...args){
 if(name==='@/lib/practice-runner')return {PracticeRunner:class{stop(){}async run(args){lastCourseCases=args.cases;const results=args.cases.map(c=>({name:c.name,status:gradeStatus,output:c.output,ms:1}));results.forEach(args.onResult);return results;}}};
 if(name==='@monaco-editor/react')return {__esModule:true,loader:{config(){}},default:props=>React.createElement('textarea',{'aria-label':'Test editor',value:props.value,readOnly:props.options?.readOnly,'data-fontsize':props.options.fontSize,'data-theme':props.theme,'data-path':props.path,onChange:e=>props.onChange(e.target.value)})};
 if(name==='./visual-lesson')return {VisualLesson:()=>null};
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
assert.equal(filterProblems(catalog,defaultArchiveFilters).length,60);assert.equal(filterProblems(catalog,{...defaultArchiveFilters,period:'classic'}).length,39);assert.equal(filterProblems(catalog,{...defaultArchiveFilters,period:'all'}).length,99);
assert.equal(filterProblems(catalog,{...defaultArchiveFilters,query:'Fence Painting'})[0].id,567);assert(catalog.every(p=>p.learningTopics.length&&p.learningTopics.every(id=>topicData.some(t=>t.id===id))));assert.deepEqual(catalog.filter(p=>topicMatches(p,'dp')).map(p=>p.id).sort((a,b)=>a-b),[1157,1493,1564]);
console.log('PASS: 60 recent / 39 classic / 99 searchable problems, complete taxonomy, separate optional DP labels');

global.fetch=async url=>new Response(fs.readFileSync(root+'/public'+url));
const container=document.getElementById('root'),view=createRoot(container),tick=()=>new Promise(r=>setTimeout(r,25));
function find(label,scope=document){const element=[...scope.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')===label||n.textContent.trim()===label);assert(element,`Missing button: ${label}`);return element;}
async function click(label,scope=document){await act(async()=>{const button=find(label,scope);button.dispatchEvent(new dom.window.MouseEvent('mousedown',{bubbles:true,button:0}));button.click();await tick();});}
async function input(element,value){await act(async()=>{Object.getOwnPropertyDescriptor(element.tagName==='INPUT'?dom.window.HTMLInputElement.prototype:dom.window.HTMLTextAreaElement.prototype,'value').set.call(element,value);element.dispatchEvent(new dom.window.Event('input',{bubbles:true}));await tick();});}
(async()=>{try{
 const StudyApp=require(root+'/components/study-app.tsx').default;
 await act(async()=>{view.render(React.createElement(StudyApp));await tick();});
 assert(container.querySelector('.workspace-read'));assert(!container.querySelector('.project-ide'));assert(container.querySelector('[data-state="expanded"][data-sidebar]')||container.querySelector('[data-state="expanded"][data-slot="sidebar"]'));
 const tabTitle=container.querySelector('.page-tab-item [role="tab"]'),closeButton=container.querySelector('.page-tab-close');
 assert.equal(getComputedStyle(tabTitle).display,'flex');assert.equal(getComputedStyle(tabTitle).width,'auto');assert.equal(getComputedStyle(closeButton).width,'24px');assert.equal(getComputedStyle(container.querySelector('.page-tab-item')).minWidth,'145px');
 assert(!container.textContent.includes('导入题面'));assert(!container.textContent.includes('导入本机题面'));
 assert(container.querySelector('.sample-copy-section [data-state="open"]'));assert(container.querySelector('.sample-block pre').textContent.trim());assert(!container.querySelector('.statement'));
 console.log('PASS: default expanded navigation, read-only workspace, visible samples, no summary on the original tab');
 await click('开始编程',container.querySelector('.work-header'));await act(tick);assert(container.querySelector('.workspace-split'));assert(container.querySelector('.project-ide'));
 assert.equal(container.querySelector('[aria-label="Test editor"]').value,'');
 await click('切换浅色编辑器');assert(container.querySelector('.ide-light'));assert.equal(container.querySelector('[aria-label="Test editor"]').dataset.theme,'vs');
 await act(async()=>{const size=container.querySelector('[aria-label="代码字号"]');size.value='20';size.dispatchEvent(new Event('change',{bubbles:true}));await tick();});assert.equal(container.querySelector('[aria-label="Test editor"]').dataset.fontsize,'20');
 const separator=container.querySelector('[aria-label="上下调整代码区高度"]'),before=+separator.getAttribute('aria-valuenow');await act(async()=>{separator.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));await tick();});assert.equal(+separator.getAttribute('aria-valuenow'),before+40);
 await click('全屏编程');assert(container.querySelector('.ide-maximized'));assert.equal(document.body.style.overflow,'hidden');await act(async()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await tick();});assert(!container.querySelector('.ide-maximized'));assert.notEqual(document.body.style.overflow,'hidden');
 await click('切换深色编辑器');assert(container.querySelector('.ide-dark'));
 console.log('PASS: blank first line, light/dark theme, font-size preference, keyboard height resize, fullscreen and Escape');
 assert(!container.querySelector('.ide-project-tree'));await click('展开工程目录');
 await input(container.querySelector('[aria-label="Test editor"]'),'print("keep my draft")');await click('保存');assert(JSON.parse(localStorage.getItem('usaco-project-567')).files['main.py']==='print("keep my draft")');
 await click('main.cpp',container.querySelector('.ide-project-tree'));assert(container.textContent.includes('在线编译尚未接入'));
 await click('main.py',container.querySelector('.ide-project-tree'));assert.equal(container.querySelector('[aria-label="Test editor"]').value,'print("keep my draft")');
 await click('新建文件');await input(document.querySelector('[aria-label="文件名"]'),'helpers.py');await click('创建文件');assert(container.querySelector('[aria-label="Test editor"]').dataset.path.endsWith('/helpers.py'));
 await input(container.querySelector('[aria-label="Test editor"]'),'answer = 42');await click('关闭文件标签 helpers.py');await click('helpers.py',container.querySelector('.ide-project-tree'));assert.equal(container.querySelector('[aria-label="Test editor"]').value,'answer = 42');
 await click('1.in',container.querySelector('.ide-project-tree'));assert(container.querySelector('[aria-label="Test editor"]').readOnly);
 await click('收起工程目录');assert(!container.querySelector('.ide-project-tree'));await click('展开工程目录');
 await click('读题',container.querySelector('.workspace-controls'));await click('解题引导');for(let i=1;i<=3;i++)if([...container.querySelectorAll('button')].some(e=>e.textContent===`展开第 ${i} 层提示`))await click(`展开第 ${i} 层提示`);assert(container.querySelectorAll('.hint').length>0);assert.equal(getComputedStyle(container.querySelector('.reading-panel-scroll')).overflowY,'auto');assert.equal(getComputedStyle(container.querySelector('.practice-panel-inner')).height,'100%');assert(container.querySelector('.workspace-read'));assert(container.querySelector('.project-ide'));
 console.log('PASS: on-demand IDE, Python/C++ switching, create/close/reopen file, read-only samples, collapsible project tree, return to reading');
 await click('学习路线',container.querySelector('.page-tabbar'));assert(container.querySelector('.kept-problem-page').hidden);
 await click('Fence Painting',container.querySelector('.page-tabbar'));assert(!container.querySelector('.kept-problem-page').hidden);await click('编程',container.querySelector('.workspace-controls'));await click('helpers.py',container.querySelector('.ide-project-tree'));assert.equal(container.querySelector('[aria-label="Test editor"]').value,'answer = 42');
 await click('关闭 Fence Painting');assert(!container.querySelector('.workspace'));assert(JSON.parse(localStorage.getItem('usaco-project-567')).files['helpers.py']==='answer = 42');
 console.log('PASS: page-tab switching preserves workspace and closing keeps saved project');
 assert(![...container.querySelectorAll('[data-slot="sidebar-menu-button"]')].some(e=>e.textContent==='编程工作台'));
 await click('Python 基础',container.querySelector('[data-slot="sidebar-content"]'));assert(container.querySelector('[aria-label="Python 基础课程"]'));assert.equal(container.querySelectorAll('.lesson-list button').length,8);assert.equal(container.querySelectorAll('.exercise-levels button').length,3);
 await click('下一步',container.querySelector('.foundation-controls'));assert(container.querySelector('.foundation-frame').textContent.includes('切分'));
 await click('开始练习');await act(tick);await input(container.querySelector('[aria-label="Test editor"]'),'print(int(input()))');
 await click('运行样例',container.querySelector('.ide-run-bar'));assert.equal(container.querySelector('.lesson-practice .course-progress').textContent,'0 / 3 已通过');
 gradeStatus='WA';await click('检查全部 3 例');assert.equal(container.querySelector('.lesson-practice .course-progress').textContent,'0 / 3 已通过');
 gradeStatus='AC';await click('检查全部 3 例');assert.equal(lastCourseCases.length,3);assert.equal(container.querySelector('.lesson-practice .course-progress').textContent,'1 / 3 已通过');
 for(const index of [1,2]){await act(async()=>{container.querySelectorAll('.exercise-levels button')[index].click();await tick();});await click('开始练习');await act(tick);await input(container.querySelector('[aria-label="Test editor"]'),'print(0)');await click('检查全部 3 例');}
 assert.equal(container.querySelector('.lesson-practice .course-progress').textContent,'3 / 3 已通过');assert(JSON.parse(localStorage.getItem('usaco-course-completed-v2')).includes('io'));
 await click('算法课堂',container.querySelector('[data-slot="sidebar-content"]'));assert.equal(container.querySelectorAll('.lesson-list button').length,18);assert.equal(container.querySelectorAll('.exercise-levels button').length,3);
 console.log('PASS: 8 Python / 18 algorithm lessons, 3 progressive exercises each, inline IDE; only successful full checks mark course progress (runner mocked here)');
 await click('真题练习',container.querySelector('[data-slot="sidebar-content"]'));assert.equal(container.querySelectorAll('.topic-directory button').length,13);assert(container.querySelector('.archive-filter-row').textContent.includes('60 道题'));
 await input(container.querySelector('[aria-label="搜索全部题目"]'),'567');assert(container.querySelector('.archive-table').textContent.includes('Fence Painting'));assert(container.querySelector('.archive-filter-row').textContent.includes('1 道题'));
 await input(container.querySelector('[aria-label="搜索全部题目"]'),'');assert(container.querySelector('.archive-filter-row').textContent.includes('60 道题'));
 const graph=[...container.querySelectorAll('.topic-directory button')].find(n=>n.textContent.startsWith('图与关系'));await click(graph.textContent);assert(container.querySelector('.archive-filter-row').textContent.includes('2 道题'));assert.equal(container.querySelector('.archive-periods [aria-selected="true"]').textContent.trim(),'全部题目 99');
 await click('全部分类',container.querySelector('.archive-topic-guide'));const recentTab=[...container.querySelectorAll('.archive-periods [role="tab"]')].find(n=>n.textContent.startsWith('2020'));await click(recentTab.textContent.trim());
 await click('按场次练');assert.equal(container.querySelectorAll('.round-card').length,6);assert([...container.querySelectorAll('.round-card')].every(c=>c.querySelectorAll('li').length===3));assert(container.querySelector('.archive-filter-row').textContent.includes('20 场'));
 await click('整场训练',container.querySelector('.round-card'));assert(container.querySelector('.exam-setup'));assert(container.querySelector('.exam-setup').textContent.includes('2026 第 3 场'));
 await click('真题练习',container.querySelector('.page-tabbar'));assert(container.querySelector('.round-directory'));await click('按知识点练');await input(container.querySelector('[aria-label="搜索全部题目"]'),'1589');await click('Swap to Win',container.querySelector('.archive-table'));
 const active=container.querySelector('.kept-problem-page:not([hidden])');assert(active);assert(!active.querySelector('iframe'));assert(active.querySelector('.local-statement-body').textContent.includes('Farmer John'));assert(active.querySelector('.katex'));assert(!active.querySelector('.sample-copy-section'));
 await click('中文题面',active);assert(active.querySelector('.statement-provenance').textContent.includes('非官方翻译'));assert(active.querySelector('.local-statement-body').textContent.includes('最喜欢'));assert(!active.querySelector('iframe'));
 await click('全屏读题',active);assert(document.querySelector('[role="dialog"] .local-statement-body').textContent.includes('最喜欢'));await click('Close');
 const {renderToString}=require('react-dom/server'),StaticStatement=require(root+'/components/official-statement.tsx').OfficialStatement;const initial=renderToString(React.createElement(StaticStatement,{id:1589,title:'Swap to Win',exam:true}));assert(initial.includes('Farmer John'));assert(!initial.includes('<iframe'));assert(!initial.includes('正在读取'));assert(!initial.includes('中文题面'));
 console.log('PASS: topic navigation, cross-year search, complete 3-problem rounds, route to timed training, persistent archive tabs, immediate bilingual reading, translated provenance and fullscreen');


 await act(async()=>{view.unmount();await tick();});
 const stored={en:'<p>My full task $N$</p><pre>1 2</pre>',zh:'<p>我的完整中文题面</p>',source:'provided.html',updatedAt:'2026-10-03'};
 localStorage.setItem('usaco-local-statement-567',JSON.stringify(stored));const fresh=createRoot(container),{OfficialStatement}=require(root+'/components/official-statement.tsx');
 await act(async()=>{fresh.render(React.createElement(OfficialStatement,{id:567,title:'Example'}));await tick();});await act(tick);
 assert(!container.querySelector('iframe'));assert(container.textContent.includes('My full task'));
 await click('中文题面');assert(container.textContent.includes('我的完整中文题面'));assert(!container.querySelector('iframe'));
 console.log('PASS: local full-document reload and Chinese switch avoid the external reader');
 await act(()=>fresh.unmount());
 }finally{dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
