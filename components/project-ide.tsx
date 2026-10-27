'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Editor,{loader} from '@monaco-editor/react';
import {defaultEditorPreferences,readEditorPreferences} from '@/lib/editor-preferences';
import {useEditorOverlays} from '@/hooks/use-editor-overlays';
import {usePythonInspection} from '@/hooks/use-python-inspection';
import {attachPythonInspection,type MonacoInspection} from '@/lib/monaco-python-inspection';
import {applyInspectionEdits,type PythonIssue} from '@/lib/python-diagnostics';
import {PythonInspectionPanel} from './python-inspection-panel';
import {configureCodeEditor} from '@/lib/editor-theme';
import {bindProjectShortcuts} from '@/lib/editor-shortcuts';
loader.config({paths:{vs:'/editor/vs'}});
import {Code2,FileCode2,FileText,FolderOpen,Plus,Play,Square,Download,X,Check,Terminal,ChevronDown,Save,Maximize2,Minimize2,Sun,Moon,GripHorizontal,Braces,AlertCircle,Info,LoaderCircle,Files,ListChecks,Type,Timer,FlaskConical,Send} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ContestSnippets} from './contest-snippets';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {PracticeRunner,type OfficialManifest,type TestCase,type TestResult} from '@/lib/practice-runner';
import {createProject,readProject,selectFile,validFilename,codeLanguage,executable,type CodeProject} from '@/lib/project-files';
import type {Problem,Attempt} from './practice-workspace';

type RunMode='run'|'sample'|'all';

export function ProjectIDE({problem:p,mode,onAttempt,examExpired=false,visible=true,practiceCases,initialPython,onGraded,standalone=false}:{problem:Problem;mode:string;onAttempt:(a:Attempt)=>void;examExpired?:boolean;visible?:boolean;practiceCases?:TestCase[];initialPython?:string;onGraded?:(passed:boolean)=>void;standalone?:boolean}){
 const [project,setProject]=useState<CodeProject>(()=>createProject(initialPython)),[ready,setReady]=useState(false),[treeOpen,setTreeOpen]=useState(false),[newFileOpen,setNewFileOpen]=useState(false),[filename,setFilename]=useState(''),[fileError,setFileError]=useState(''),[saveError,setSaveError]=useState(''),[fallback,setFallback]=useState(false);
 const [preferences,setPreferences]=useState(defaultEditorPreferences),[preferencesReady,setPreferencesReady]=useState(false),[maximized,setMaximized]=useState(false),[savedNotice,setSavedNotice]=useState('');
 const [cursor,setCursor]=useState({line:1,col:1}),[snippetsOpen,setSnippetsOpen]=useState(false),[standardInput,setStandardInput]=useState(''),[consoleHeight,setConsoleHeight]=useState(145);
 const overlayNode=useEditorOverlays(preferences.theme,visible);
 useEffect(()=>{if(standalone)try{setStandardInput(localStorage.getItem('usaco-playground-stdin')||'');}catch{}},[standalone]);
 const fallbackEditor=useRef<HTMLTextAreaElement>(null);
 function insertSnippet(code:string){
  if(readOnly)return;
  const ed=editor.current;
  if(ed&&!fallback){const selection=ed.getSelection();if(selection){ed.pushUndoStop();ed.executeEdits('contest-snippet',[{range:selection,text:code,forceMoveMarkers:true}]);ed.pushUndoStop();ed.focus();}}
  else {const text=fallbackEditor.current,start=text?.selectionStart??activeCode.length,end=text?.selectionEnd??start;setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:activeCode.slice(0,start)+code+activeCode.slice(end)}}));requestAnimationFrame(()=>{text?.focus();text?.setSelectionRange(start+code.length,start+code.length);});}
  setSnippetsOpen(false);
 }
 const root=useRef<HTMLElement|null>(null),saveAction=useRef<()=>void>(()=>{}),projectNow=useRef(project);projectNow.current=project;
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[results,setResults]=useState<TestResult[]>([]),[planned,setPlanned]=useState<string[]>([]),[testType,setTestType]=useState(''),[limit,setLimit]=useState('10'),[runMode,setRunMode]=useState<RunMode>('run'),[inputSample,setInputSample]=useState(p.samples.length?'0':'none'),[selectedResult,setSelectedResult]=useState<number|null>(null);
 const runner=useRef<PracticeRunner|null>(null),editor=useRef<any>(null),monaco=useRef<any>(null),runAction=useRef<(mode?:RunMode)=>void>(()=>{});
 const samples=useMemo(()=>Object.fromEntries(p.samples.flatMap((s,i)=>[[`samples/${i+1}.in`,s.input],[`samples/${i+1}.out`,s.output]])),[p.id]);
 const readOnly=project.activeFile.startsWith('samples/'),activeCode=readOnly?samples[project.activeFile]||'':project.files[project.activeFile]||'',language=codeLanguage(project.activeFile),entryLanguage=codeLanguage(project.entryFile);
 const inspection=usePythonInspection(project.activeFile,activeCode,ready&&visible&&!readOnly&&language==='python');
 const inspectionBridge=useRef<MonacoInspection|null>(null),[editorEpoch,setEditorEpoch]=useState(0),[inspectionOpen,setInspectionOpen]=useState(false);
 const inspectionRef=useRef(inspection);inspectionRef.current=inspection;
 useEffect(()=>{inspectionBridge.current?.update(inspection.snapshot);},[inspection.snapshot,editorEpoch]);
 useEffect(()=>()=>{inspectionBridge.current?.dispose();},[]);
 function acceptInspection(id:string){const snapshot=inspection.snapshot,issue=snapshot?.issues.find(d=>d.id===id);if(!snapshot||snapshot.source!==activeCode||snapshot.file!==project.activeFile||!issue?.fix||readOnly)return;if(inspectionBridge.current&&!fallback){inspectionBridge.current.apply(id);return;}const code=applyInspectionEdits(activeCode,issue.fix.edits);setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:code}}));}
 function revealInspection(issue:PythonIssue){if(inspectionBridge.current&&!fallback){inspectionBridge.current.reveal(issue);return;}fallbackEditor.current?.focus();}
 const inspectionErrors=inspection.visibleIssues.filter(d=>d.severity==='error').length,inspectionHints=inspection.visibleIssues.length-inspectionErrors;

 useEffect(()=>{try{setProject(readProject(localStorage.getItem(`usaco-project-${p.id}`),localStorage.getItem(`usaco-code-${p.id}-python`)??initialPython,localStorage.getItem(`usaco-code-${p.id}-cpp`)));}catch{setSaveError('无法读取本机草稿，请下载代码留存。');}setReady(true);return()=>{runner.current?.stop();const prefix=`inmemory://usaco/${p.id}/`;monaco.current?.editor.getModels().filter((m:any)=>m.uri.toString().startsWith(prefix)).forEach((m:any)=>m.dispose());};},[p.id]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(`usaco-project-${p.id}`,JSON.stringify(project));setSaveError('');}catch{setSaveError('本机存储空间不足，当前修改尚未保存。请下载代码。');}},[project,ready,p.id]);
 useEffect(()=>{if(!visible)return;const timer=setTimeout(()=>{if(!editor.current)setFallback(true);},14000);return()=>clearTimeout(timer);},[visible]);
 useEffect(()=>{if(visible)requestAnimationFrame(()=>editor.current?.layout());},[visible,treeOpen]);
 useEffect(()=>{setPreferences(readEditorPreferences());setPreferencesReady(true);},[]);
 useEffect(()=>{if(preferencesReady)try{localStorage.setItem('usaco-editor-preferences',JSON.stringify(preferences));}catch{}},[preferences,preferencesReady]);
 useEffect(()=>{if(!maximized)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setMaximized(false);};window.addEventListener('keydown',esc);requestAnimationFrame(()=>editor.current?.layout());return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',esc);requestAnimationFrame(()=>editor.current?.layout());};},[maximized]);
 useEffect(()=>{if(!savedNotice)return;const timer=setTimeout(()=>setSavedNotice(''),2000);return()=>clearTimeout(timer);},[savedNotice]);
 function save(){try{localStorage.setItem(`usaco-project-${p.id}`,JSON.stringify(projectNow.current));setSavedNotice('已保存到本机');setSaveError('');}catch{setSaveError('保存失败，请下载文件留存。');}}
 saveAction.current=save;
 function resizeHeight(event:React.PointerEvent<HTMLDivElement>){const start=event.clientY,height=preferences.height,consoleStart=root.current?.querySelector('.pi-console')?.getBoundingClientRect().height||consoleHeight;event.currentTarget.setPointerCapture(event.pointerId);const node=event.currentTarget;const move=(e:PointerEvent)=>{if(standalone&&!maximized)setConsoleHeight(Math.max(80,Math.min((root.current?.clientHeight||600)*.5,consoleStart-e.clientY+start)));else setPreferences(prev=>({...prev,height:Math.max(220,Math.min(1400,height+e.clientY-start))}));};const end=()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);};node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);}
 function choose(name:string){setProject(prev=>selectFile(prev,name));}
 function closeFile(name:string){setProject(prev=>{const open=prev.openFiles.filter(n=>n!==name);const active=prev.activeFile===name?(open[Math.max(0,prev.openFiles.indexOf(name)-1)]||open[0]||prev.entryFile):prev.activeFile;return {...prev,openFiles:open.length?open:[active],activeFile:active};});}
 function addFile(){const name=filename.trim();if(!validFilename(name)){setFileError('使用英文文件名，例如 solution2.py、helpers.py 或 main.cpp。');return;}if(name in project.files){setFileError('已有同名文件，请换一个名字。');return;}if(Object.keys(project.files).length>=40){setFileError('每个工程最多保留 40 个代码或数据文件。');return;}setProject(prev=>selectFile({...prev,files:{...prev.files,[name]:name.endsWith('.py')?'':name.endsWith('.cpp')?createProject().files['main.cpp']:''}},name));setNewFileOpen(false);setFilename('');setFileError('');}
 function download(){const url=URL.createObjectURL(new Blob([activeCode],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=project.activeFile.split('/').pop()!;a.click();URL.revokeObjectURL(url);}
 function stop(){runner.current?.stop();runner.current=null;setBusy(false);setStatus('已停止。已完成的测试结果保留。');}
 async function run(action:RunMode='run'){
  if(busy||examExpired)return;
  if(standalone)action='run';
  if(action==='all'&&!practiceCases&&p.testsTotal===0){setStatus('本题尚未接入完整官方测试，可先运行代码或检查样例。');return;}
  const entry=project.entryFile,code=project.files[entry];
  if(codeLanguage(entry)!=='python'){setStatus('C++ 可编辑与下载；在线 C++ 编译尚未接入。');return;}
  if(!code?.trim()){setStatus('请先在运行入口中写入代码。');return;}
  const engine=new PracticeRunner();runner.current=engine;
  setBusy(true);setResults([]);setPlanned([]);setSelectedResult(null);setRunMode(action);
  requestAnimationFrame(()=>{const output=document.getElementById(`console-${p.id}`);if(standalone&&output)output.scrollTop=0;else output?.scrollIntoView({block:'nearest'});});
  monaco.current?.editor.getModels().forEach((m:any)=>{if(m.uri.toString().startsWith(`inmemory://usaco/${p.id}/`))monaco.current.editor.setModelMarkers(m,'python',[]);});
  try{
   let cases:(TestCase|OfficialManifest['cases'][number])[]=p.samples.map((s,i)=>({...s,name:`样例 ${i+1}`})),type='样例检查';
   if(action==='run'){
    const sample=inputSample==='none'?undefined:p.samples[+inputSample];
    cases=[{name:standalone?'标准输入':sample?`样例 ${+inputSample+1} 输入`:'无输入',input:standalone?standardInput:sample?.input||'',output:null}];type='普通运行';
   }else if(action==='all'&&practiceCases){cases=practiceCases;type='完整练习数据';}
   else if(action==='all'){
    setStatus('正在读取官方测试清单…');const response=await fetch(`/official-tests/${p.id}.json`);
    if(!response.ok)throw Error('测试清单加载失败，请重试');
    const manifest:OfficialManifest=await response.json();cases=manifest.cases;type=`完整官方数据 · ${manifest.officialTotal} 文件`;
   }
   if(runner.current!==engine)return;
   setTestType(type);setPlanned(cases.map(c=>c.name));
   const finished=await engine.run({id:p.id,code,files:{...project.files,...samples},entryFile:entry,inputFile:p.inputFile,cases,limitSeconds:+limit,onStatus:setStatus,onResult:r=>setResults(prev=>[...prev,r])});
   if(runner.current!==engine)return;
   const passed=finished.filter(r=>r.status==='AC').length,bad=finished.find(r=>['WA','RE','TLE'].includes(r.status));
   const detail=action==='run'?`${entry} · ${bad?'运行未正常结束':'运行完成'} · ${finished[0]?.ms||0} ms`:`${entry} · ${type} · ${passed}/${cases.length} 通过`;
   setStatus(detail);
   onAttempt({id:p.id,title:p.title,date:new Date().toISOString(),status:bad?'待复习':action==='run'?'已运行':'本次通过',detail});
   if(action==='all')onGraded?.(!bad&&finished.length===cases.length&&cases.length>0);
   if(bad?.error){const matches=[...bad.error.matchAll(/File "(?:\/workspace\/)?([^"/]+\.py)", line (\d+)/g)];const match=matches.at(-1);if(match){const model=monaco.current?.editor.getModels().find((m:any)=>m.uri.toString()===`inmemory://usaco/${p.id}/${match[1]}`);if(model&&model.getValue()===project.files[match[1]])monaco.current.editor.setModelMarkers(model,'python',[{startLineNumber:+match[2],startColumn:1,endLineNumber:+match[2],endColumn:100,message:bad.error,severity:monaco.current.MarkerSeverity.Error}]);}}
  }catch(e){if(runner.current===engine)setStatus(e instanceof Error?e.message:String(e));}
  finally{if(runner.current===engine){runner.current=null;setBusy(false);}}
 }
 const activeResultIndex=selectedResult??Math.max(0,results.findIndex(r=>['WA','RE','TLE'].includes(r.status)));
 const result=results[activeResultIndex],showOutput=runMode!=='all'||mode!=='exam';

 runAction.current=run;
  const runDisabled=busy||examExpired||entryLanguage!=='python';
  const statusSymbol=(status?:string)=>status==='AC'?'*':status==='WA'?'x':status==='TLE'?'t':status==='RE'?'!':status?'?':'·';
  const doneCount=results.filter(r=>r.status==='AC').length;
  return <section ref={root} className={`pi pi-${preferences.theme} ${standalone?'pi-standalone':''} ${maximized?'pi-max':''}`} aria-label="代码编辑器">
   <header className="pi-header">
    {!standalone&&<div className="pi-project"><span className="pi-project-icon"><Code2 size={14}/></span><span className="pi-project-name">{practiceCases?'课堂练习':<>USACO <b>#{p.id}</b></>}</span></div>}
    {!standalone&&<div className="pi-run-config"><Select value={project.entryFile} onValueChange={name=>setProject(prev=>({...prev,entryFile:name}))}><SelectTrigger aria-label="运行入口" className="pi-entry-trigger"><FileCode2 size={13}/><SelectValue/></SelectTrigger><SelectContent portalContainer={overlayNode?.parentElement}>{Object.keys(project.files).filter(executable).map(n=><SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select><button type="button" className="pi-run-icon" disabled={runDisabled} onClick={()=>run('run')} aria-label="运行当前入口" title="运行 · Ctrl+Enter"><Play size={14}/></button>{busy&&<button type="button" className="pi-run-icon is-stop" onClick={stop} aria-label="停止运行" title="停止"><Square size={12}/></button>}</div>}
    <div className="pi-header-tools">
     <button type="button" className="pi-tool" disabled={readOnly||!["python","cpp"].includes(language)} onClick={()=>setSnippetsOpen(v=>!v)} aria-expanded={snippetsOpen} aria-label="常用竞赛语句" title="常用竞赛语句"><Braces size={14}/><span>常用语句</span></button>
     <span className="pi-sep"/>
     <label className="pi-font" title="代码字号"><Type size={13}/><select aria-label="代码字号" value={preferences.fontSize} onChange={e=>setPreferences(v=>({...v,fontSize:+e.target.value}))}>{[12,13,14,15,16,18,20,22,24,28].map(n=><option key={n} value={n}>{n}px</option>)}</select></label>
     <button type="button" className="pi-tool pi-tool-icon" onClick={()=>setPreferences(v=>({...v,theme:v.theme==='dark'?'light':'dark'}))} aria-label={preferences.theme==='dark'?'切换浅色编辑器':'切换深色编辑器'} title={preferences.theme==='dark'?'浅色主题':'深色主题'}>{preferences.theme==='dark'?<Sun size={14}/>:<Moon size={14}/>}</button>
     <button type="button" className={`pi-tool pi-tool-icon ${savedNotice?'is-ok':''}`} onClick={save} title="保存 · Ctrl / Cmd + S" aria-label="保存">{savedNotice?<Check size={14}/>:<Save size={14}/>}</button>
     <button type="button" className="pi-tool pi-tool-icon" onClick={()=>setMaximized(v=>!v)} aria-label={maximized?'退出全屏编程':'全屏编程'} title={maximized?'退出全屏 · Esc':'全屏编程'}>{maximized?<Minimize2 size={14}/>:<Maximize2 size={14}/>}</button>
    </div>
   </header>
   {snippetsOpen&&<ContestSnippets language={language} onInsert={insertSnippet} onClose={()=>setSnippetsOpen(false)}/>}
   <div className={'pi-body '+(!treeOpen?'is-tree-closed':'')}>
    <aside className="pi-activity">
     <button type="button" className={treeOpen?'is-active':''} title={treeOpen?'收起工程目录':'展开工程目录'} aria-label={treeOpen?'收起工程目录':'展开工程目录'} onClick={()=>setTreeOpen(!treeOpen)}><Files size={17}/></button>
     <button type="button" title="运行结果" aria-label="查看运行结果" onClick={()=>document.getElementById(`console-${p.id}`)?.scrollIntoView({block:'nearest'})}><Terminal size={17}/></button>
     <button type="button" className={inspectionOpen?'is-active':''} title="代码检查" aria-label="代码检查" onClick={()=>setInspectionOpen(v=>!v)}><ListChecks size={17}/>{inspectionErrors>0&&<i className="pi-dot"/>}</button>
    </aside>
    {treeOpen&&<aside className="pi-tree"><div className="pi-tree-head"><span>资源管理器</span><button type="button" aria-label="新建文件" title="新建文件" onClick={()=>{setNewFileOpen(true);setFileError('');}}><Plus size={14}/></button></div><div className="pi-folder"><ChevronDown size={12}/><FolderOpen size={14}/>{standalone?'my-code':`problem-${p.id}`}</div><nav aria-label="工程文件">{Object.keys(project.files).map(name=><button type="button" key={name} className={project.activeFile===name?'is-selected':''} onClick={()=>choose(name)}>{executable(name)?<FileCode2 size={14}/>:<FileText size={14}/>}<span>{name}</span>{project.entryFile===name&&<Play size={9} className="pi-entry-mark"/>}</button>)}{!standalone&&<div className="pi-folder"><ChevronDown size={12}/><FolderOpen size={14}/>samples</div>}{Object.keys(samples).map(name=><button type="button" key={name} className={project.activeFile===name?'is-selected':''} onClick={()=>choose(name)}><FileText size={13}/><span>{name.slice(8)}</span></button>)}</nav></aside>}
    <div className="pi-editor-col">
     <div className="pi-tabs" role="tablist" aria-label="打开的代码文件">
      {project.openFiles.map(name=><div key={name} className={'pi-tab '+(project.activeFile===name?'is-active':'')}><button type="button" role="tab" aria-selected={project.activeFile===name} onClick={()=>choose(name)}>{name.endsWith('.py')?<span className="pi-lang pi-lang-py">py</span>:name.endsWith('.cpp')?<span className="pi-lang pi-lang-cpp">C++</span>:<FileText size={12}/>}{name.split('/').pop()}</button><button type="button" className="pi-tab-close" onClick={()=>closeFile(name)} aria-label={`关闭文件标签 ${name}`}><X size={12}/></button></div>)}
      <button type="button" className="pi-tab-add" aria-label="添加代码文件" title="新建文件" onClick={()=>setNewFileOpen(true)}><Plus size={14}/></button>
     </div>
     <div className="pi-surface" style={{height:preferences.height}}>{fallback?<Textarea ref={fallbackEditor} value={activeCode} className="pi-fallback" readOnly={readOnly} spellCheck={false} aria-label="代码编辑器" onChange={e=>setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:e.target.value}}))}/>:!overlayNode?<div className="pi-loading">正在打开编辑器…</div>:<Editor height="100%" path={`inmemory://usaco/${p.id}/${project.activeFile}`} language={language} value={activeCode} theme={preferences.theme==='dark'?'usaco-pro-dark':'usaco-pro-light'} saveViewState keepCurrentModel onChange={value=>{if(!readOnly)setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:value||''}}));}} beforeMount={configureCodeEditor} onMount={(ed,m)=>{editor.current=ed;monaco.current=m;setFallback(false);inspectionBridge.current?.dispose();inspectionBridge.current=attachPythonInspection(ed,m,id=>inspectionRef.current.dismiss(id),overlayNode);setEditorEpoch(v=>v+1);bindProjectShortcuts(ed,m,{run:()=>runAction.current('run'),save:()=>saveAction.current()});ed.onDidChangeCursorPosition((e:{position:{lineNumber:number;column:number}})=>setCursor({line:e.position.lineNumber,col:e.position.column}));}} loading={<div className="pi-loading">正在打开编辑器…</div>} options={{overflowWidgetsDomNode:overlayNode,fixedOverflowWidgets:true,allowOverflow:true,fontSize:preferences.fontSize,lineHeight:Math.round(preferences.fontSize*1.65),fontFamily:"'JetBrains Mono','Cascadia Code','Fira Code',Consolas,monospace",fontLigatures:true,minimap:{enabled:!standalone,renderCharacters:false,maxColumn:80,showSlider:'mouseover',scale:1},scrollBeyondLastLine:false,automaticLayout:true,tabSize:4,insertSpaces:true,detectIndentation:false,renderValidationDecorations:'on',hover:{enabled:language==='python'?'off':'on',delay:350,sticky:true,hidingDelay:1500,above:false},padding:{top:12,bottom:12},wordWrap:'on',readOnly,quickSuggestions:{other:'on',comments:'off',strings:'off'},quickSuggestionsDelay:80,suggestOnTriggerCharacters:true,tabCompletion:'on',acceptSuggestionOnEnter:'on',snippetSuggestions:'top',suggestSelection:'first',wordBasedSuggestions:'currentDocument',parameterHints:{enabled:true},bracketPairColorization:{enabled:true},guides:{bracketPairs:'active',indentation:true,highlightActiveIndentation:true},renderLineHighlight:'all',cursorBlinking:'smooth',cursorSmoothCaretAnimation:'on',smoothScrolling:true,stickyScroll:{enabled:true},lineNumbersMinChars:3,glyphMargin:false,folding:true,roundedSelection:true,overviewRulerBorder:false,scrollbar:{verticalScrollbarSize:10,horizontalScrollbarSize:10,useShadows:false}}}/>}</div>
     <div className="pi-resizer" role="separator" aria-label="上下调整代码区高度" aria-orientation="horizontal" aria-valuemin={220} aria-valuemax={1400} aria-valuenow={preferences.height} tabIndex={0} onPointerDown={resizeHeight} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();if(standalone&&!maximized)setConsoleHeight(v=>Math.max(80,Math.min(260,v+(e.key==='ArrowDown'?-20:20))));else setPreferences(v=>({...v,height:Math.max(220,Math.min(1400,v.height+(e.key==='ArrowDown'?40:-40)))}));}}}><GripHorizontal size={14}/></div>
     <div className="pi-statusbar">
      <span className={`pi-sb-item pi-sb-save ${saveError?'is-warn':''}`} title={readOnly?'样例不可编辑':'输入 pr 可补全 print()；Tab / Enter 确认，Ctrl+Space 显示建议'}><i/>{readOnly?'只读样例':saveError?'尚未保存':'已保存到本机'}</span>
      {!readOnly&&['python','cpp'].includes(language)&&<button type="button" className={`pi-sb-item inspection-status ${inspectionErrors?'has-errors':''}`} aria-label="代码检查" aria-expanded={inspectionOpen} title="查看语法、名称与 PEP 8 提醒；悬停代码标记可查看修改建议" onClick={()=>setInspectionOpen(v=>!v)}>{inspection.state==='checking'||inspection.state==='loading'?<LoaderCircle size={12} className="pi-spin"/>:inspectionErrors?<AlertCircle size={12}/>:<Info size={12}/>}<span>{inspection.state==='loading'?'启动检查…':inspection.state==='checking'?'检查中…':inspection.state==='unavailable'?'检查不可用':inspection.state==='unsupported'?'C++ 检查未接入':`${inspectionErrors} 错误 · ${inspectionHints} 提醒`}</span></button>}
      <span className="pi-sb-spacer"/>
      <span className="pi-sb-item">行 {cursor.line}，列 {cursor.col}</span>
      <span className="pi-sb-item pi-sb-hide-sm">空格: 4</span>
      <span className="pi-sb-item pi-sb-hide-sm">UTF-8</span>
      <span className="pi-sb-item pi-sb-hide-sm">LF</span>
      <span className="pi-sb-item pi-sb-lang">{language==='python'?'Python 3':language==='cpp'?'C++17':'纯文本'}</span>
      <button type="button" className="pi-sb-item" onClick={download} aria-label="下载当前文件" title="下载当前文件"><Download size={12}/>{standalone&&<span>下载</span>}</button>
     </div>
    </div>
   </div>
   {inspectionOpen&&<PythonInspectionPanel snapshot={inspection.snapshot} state={inspection.state} message={inspection.message} dismissedCount={inspection.dismissedCount} onApply={acceptInspection} onDismiss={inspection.dismiss} onReveal={revealInspection} onRestore={inspection.restore} onRetry={inspection.recheck} onClose={()=>setInspectionOpen(false)}/>}
   {saveError&&<p className="pi-storage-error" role="alert">{saveError}</p>}
   {standalone&&<label className="pi-stdin"><span className="pi-stdin-label">标准输入 <small>供 input() / sys.stdin 读取</small></span><Textarea aria-label="独立编辑器标准输入" rows={2} value={standardInput} onChange={e=>{setStandardInput(e.target.value);try{localStorage.setItem('usaco-playground-stdin',e.target.value);}catch{}}} placeholder="程序需要输入时，将数据粘贴到这里"/></label>}
   <div className="pi-runbar">
    <div className="pi-runbar-left"><span className="pi-entry-label">{standalone?<select aria-label="运行入口" value={project.entryFile} onChange={e=>setProject(p=>({...p,entryFile:e.target.value}))}>{Object.keys(project.files).filter(executable).map(name=><option key={name}>{name}</option>)}</select>:<><FileCode2 size={13}/>{project.entryFile}</>}</span><Select value={limit} onValueChange={setLimit}><SelectTrigger aria-label="单文件本机限时" className="pi-limit-trigger"><Timer size={13}/><SelectValue/></SelectTrigger><SelectContent portalContainer={overlayNode?.parentElement}>{[2,5,10,20,60].map(n=><SelectItem key={n} value={String(n)}>{n} 秒/文件</SelectItem>)}</SelectContent></Select></div>
    <div className="pi-runbar-right">{busy&&<button type="button" className="pi-btn pi-btn-ghost" onClick={stop}><Square size={12}/>停止</button>}<button type="button" className="pi-btn pi-btn-ghost" disabled={runDisabled} onClick={()=>run('run')} title="Ctrl + Enter"><Play size={13}/>运行</button>{!standalone&&<><button type="button" className="pi-btn pi-btn-outline" disabled={runDisabled} onClick={()=>run('sample')}><FlaskConical size={13}/>检查样例</button><button type="button" className="pi-btn pi-btn-primary" disabled={runDisabled||(!practiceCases&&p.testsTotal===0)} title={!practiceCases&&p.testsTotal===0?'尚未接入完整官方测试，可检查样例':undefined} onClick={()=>run('all')}><Send size={13}/>{!practiceCases&&p.testsTotal===0?'完整测试待补充':`${practiceCases?'提交检查':'提交评测'} · ${p.testsTotal} 例`}</button></>}</div>
   </div>
   {entryLanguage==='cpp'&&<p className="pi-note">C++ 当前支持编辑和下载；在线编译尚未接入。</p>}
   <section className="pi-console" style={standalone&&!maximized?{height:consoleHeight}:undefined} id={`console-${p.id}`} aria-label="程序运行输出">
    <div className="pi-console-head"><div className="pi-console-tabs"><span className="is-active"><Terminal size={13}/>{runMode==='run'?'输出':'测试结果'}</span>{planned.length>0&&runMode!=='run'&&<span className="pi-score">{doneCount}/{planned.length} 通过</span>}</div>{!standalone&&<label className="pi-input-choice">运行时输入<select aria-label="运行时使用的样例输入" value={inputSample} disabled={busy} onChange={e=>setInputSample(e.target.value)}><option value="none">无输入</option>{p.samples.map((_,i)=><option key={i} value={String(i)}>样例 {i+1}</option>)}</select></label>}</div>
    <p className={`pi-status-line ${busy?'is-busy':''}`} role="status">{busy&&<LoaderCircle size={12} className="pi-spin"/>}{status||(standalone?'点击“运行”查看输出。':'点击“运行”查看程序输出；需要核对答案时，点击“检查样例”或“提交”。')}</p>
    {planned.length>0&&runMode!=='run'&&<><p className="pi-test-caption">{runMode==='all'?'每个用例使用各自的输入独立运行；样例通过不代表全部通过。':'点击用例查看输入、实际输出和预期输出。'}</p><div className="pi-tiles" aria-label="选择测试结果">{planned.map((name,i)=><button type="button" key={name} disabled={!results[i]} aria-pressed={activeResultIndex===i} onClick={()=>setSelectedResult(i)} className={`pi-tile is-${(results[i]?.status||'waiting').toLowerCase()}`} title={`${name} · ${results[i]?.status||'待运行'}`}><span className="pi-tile-no">{i+1}</span><span className="pi-tile-sym">{statusSymbol(results[i]?.status)}</span><span className="pi-tile-ms">{results[i]?`${results[i].ms}ms`:'待运行'}</span></button>)}</div></>}
    {showOutput&&<div className="pi-result">
     {result&&<div className="pi-result-head"><b>{runMode==='run'?'本次运行':`${result.name}`}</b>{runMode!=='run'&&<span className={`pi-verdict is-${result.status.toLowerCase()}`}>{result.status}</span>}<span className="pi-ms">{result.ms} ms</span></div>}
     <div className="pi-io-grid">
      <section><h4>程序输出{result?.outputSource&&result.outputSource!=='stdout'?` · ${result.outputSource}`:''}</h4><pre className="pi-out" aria-label="程序输出数据">{result?result.output|| (result.status==='TLE'?'超过本机限时，运行已停止。':'（没有输出）'):busy?'正在执行…':'等待运行'}</pre></section>
      {runMode!=='run'&&result?.expected!=null&&<section><h4>预期输出</h4><pre className="pi-out pi-expected" aria-label="预期输出数据">{result.expected||'（空输出）'}</pre></section>}
     </div>
     {result&&<section className="pi-io-input"><h4>本次输入 · {runMode==='run'?result.name:result.name+' 输入'}</h4><pre>{result.input||"（无输入）"}</pre></section>}
     {result?.stderr&&<section className="pi-io-stderr"><h4>诊断输出 · stderr</h4><pre>{result.stderr}</pre></section>}
     {result?.error&&<section className="pi-io-error" role="alert"><h4>Python 错误</h4><pre>{result.error}</pre></section>}
     {result?.purpose&&runMode!=='run'&&<p className="pi-case-note"><b>本例检查：</b>{result.purpose}</p>}
     {result?.detail&&runMode!=='run'&&<p className="pi-case-note">{result.detail}</p>}
     {result?.truncated&&<p className="pi-case-note">长数据仅展示前 12,000 个字符；判题使用完整输出。</p>}
    </div>}
    {runMode==='run'?<p className="pi-note">{standalone?'代码自动保存在本机；“下载”可保存到电脑。每次运行从头执行，独立于 Shell 会话。':'普通运行只执行代码，不判断题目对错。input() 使用上方选定的样例输入；无输入时会报告 EOFError。'}</p>:<p className="pi-note">{practiceCases?'练习数据':'官方数据'} {p.testsImported}/{p.testsTotal} 个文件 · <b className="ac">*</b> 正确　<b className="wa">x</b> 答案错误　<b className="re">!</b> 运行异常　<b className="tle">t</b> 本机超时。耗时与官方服务器可能不同。</p>}
   </section>

   <Dialog open={newFileOpen} onOpenChange={setNewFileOpen}><DialogContent portalContainer={overlayNode?.parentElement} className={standalone?'coding-tools-file-dialog':undefined}><DialogTitle>新建文件</DialogTitle><DialogDescription>{standalone?'创建代码文件、数据文件或可导入的辅助模块。':'在这道题的工程中保存另一种解法，或添加可导入的辅助模块。'}</DialogDescription><form onSubmit={e=>{e.preventDefault();addFile();}} className="new-file-form"><Input autoFocus value={filename} onChange={e=>setFilename(e.target.value)} placeholder="solution2.py" aria-label="文件名"/>{fileError&&<p role="alert">{fileError}</p>}<Button type="submit">创建文件</Button></form></DialogContent></Dialog>
  </section>;
 }
