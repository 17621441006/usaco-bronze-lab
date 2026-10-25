'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Editor,{loader} from '@monaco-editor/react';
import {defaultEditorPreferences,readEditorPreferences} from '@/lib/editor-preferences';
import {useEditorOverlays} from '@/hooks/use-editor-overlays';
import {usePythonInspection} from '@/hooks/use-python-inspection';
import {attachPythonInspection,type MonacoInspection} from '@/lib/monaco-python-inspection';
import {applyInspectionEdits,type PythonIssue} from '@/lib/python-diagnostics';
import {PythonInspectionPanel} from './python-inspection-panel';
import {registerCodeCompletions} from '@/lib/code-completions';
loader.config({paths:{vs:'/editor/vs'}});
import {Code2,FileCode2,FileText,FolderOpen,PanelLeftClose,PanelLeftOpen,Plus,Play,Square,Download,X,Check,Terminal,ChevronDown,Save,Maximize2,Minimize2,Sun,Moon,GripHorizontal,Braces,AlertCircle,Info,LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ContestSnippets} from './contest-snippets';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {PracticeRunner,type OfficialManifest,type TestCase,type TestResult} from '@/lib/practice-runner';
import {createProject,readProject,selectFile,validFilename,codeLanguage,executable,type CodeProject} from '@/lib/project-files';
import type {Problem,Attempt} from './practice-workspace';

type RunMode='run'|'sample'|'all';

export function ProjectIDE({problem:p,mode,onAttempt,examExpired=false,visible=true,practiceCases,initialPython,onGraded,standalone=false}:{problem:Problem;mode:string;onAttempt:(a:Attempt)=>void;examExpired?:boolean;visible?:boolean;practiceCases?:TestCase[];initialPython?:string;onGraded?:(passed:boolean)=>void;standalone?:boolean}){
 const [project,setProject]=useState<CodeProject>(()=>createProject(initialPython)),[ready,setReady]=useState(false),[treeOpen,setTreeOpen]=useState(false),[newFileOpen,setNewFileOpen]=useState(false),[filename,setFilename]=useState(''),[fileError,setFileError]=useState(''),[saveError,setSaveError]=useState(''),[fallback,setFallback]=useState(false);
 const [preferences,setPreferences]=useState(defaultEditorPreferences),[preferencesReady,setPreferencesReady]=useState(false),[maximized,setMaximized]=useState(false),[savedNotice,setSavedNotice]=useState('');
 const [snippetsOpen,setSnippetsOpen]=useState(false),[standardInput,setStandardInput]=useState('');
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
 function resizeHeight(event:React.PointerEvent<HTMLDivElement>){const start=event.clientY,height=preferences.height;event.currentTarget.setPointerCapture(event.pointerId);const node=event.currentTarget;const move=(e:PointerEvent)=>setPreferences(prev=>({...prev,height:Math.max(220,Math.min(1400,height+e.clientY-start))}));const end=()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);};node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);}
 function choose(name:string){setProject(prev=>selectFile(prev,name));}
 function closeFile(name:string){setProject(prev=>{const open=prev.openFiles.filter(n=>n!==name);const active=prev.activeFile===name?(open[Math.max(0,prev.openFiles.indexOf(name)-1)]||open[0]||prev.entryFile):prev.activeFile;return {...prev,openFiles:open.length?open:[active],activeFile:active};});}
 function addFile(){const name=filename.trim();if(!validFilename(name)){setFileError('使用英文文件名，例如 solution2.py、helpers.py 或 main.cpp。');return;}if(name in project.files){setFileError('已有同名文件，请换一个名字。');return;}if(Object.keys(project.files).length>=40){setFileError('每个工程最多保留 40 个代码或数据文件。');return;}setProject(prev=>selectFile({...prev,files:{...prev.files,[name]:name.endsWith('.py')?'':name.endsWith('.cpp')?createProject().files['main.cpp']:''}},name));setNewFileOpen(false);setFilename('');setFileError('');}
 function download(){const url=URL.createObjectURL(new Blob([activeCode],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=project.activeFile.split('/').pop()!;a.click();URL.revokeObjectURL(url);}
 function stop(){runner.current?.stop();runner.current=null;setBusy(false);setStatus('已停止。已完成的测试结果保留。');}
 async function run(action:RunMode='run'){
  if(busy||examExpired)return;
  if(standalone)action='run';
  const entry=project.entryFile,code=project.files[entry];
  if(codeLanguage(entry)!=='python'){setStatus('C++ 可编辑与下载；在线 C++ 编译尚未接入。');return;}
  if(!code?.trim()){setStatus('请先在运行入口中写入代码。');return;}
  const engine=new PracticeRunner();runner.current=engine;
  setBusy(true);setResults([]);setPlanned([]);setSelectedResult(null);setRunMode(action);
  requestAnimationFrame(()=>document.getElementById(`console-${p.id}`)?.scrollIntoView({block:'nearest'}));
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
 return <section ref={root} className={`project-ide ide-${preferences.theme} ${maximized?'ide-maximized':''}`} aria-label="代码编辑器">
  <div className="ide-topbar"><div className="ide-project-title"><Code2 size={18}/><span>{standalone?'代码文件':practiceCases?'课堂练习':<>USACO <b>#{p.id}</b></>}</span></div><div className="ide-run-config"><Select value={project.entryFile} onValueChange={name=>setProject(prev=>({...prev,entryFile:name}))}><SelectTrigger aria-label="运行入口"><Play size={12}/><SelectValue/></SelectTrigger><SelectContent portalContainer={overlayNode?.parentElement} className={standalone?'coding-tools-select':undefined}>{Object.keys(project.files).filter(executable).map(n=><SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select><Button variant="ghost" size="icon" disabled={busy||examExpired||entryLanguage!=='python'} onClick={()=>run('run')} aria-label="运行当前入口" title="运行 · Ctrl+Enter"><Play size={17}/></Button>{busy&&<Button variant="ghost" size="icon" onClick={stop} aria-label="停止运行"><Square size={15}/></Button>}</div></div>
  <div className="ide-view-toolbar"><div><Button size="sm" variant="ghost" onClick={()=>setPreferences(v=>({...v,theme:v.theme==='dark'?'light':'dark'}))} aria-label={preferences.theme==='dark'?'切换浅色编辑器':'切换深色编辑器'}>{preferences.theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}<span>{preferences.theme==='dark'?'浅色':'深色'}</span></Button><label>字号 <select aria-label="代码字号" value={preferences.fontSize} onChange={e=>setPreferences(v=>({...v,fontSize:+e.target.value}))}>{[12,14,15,16,18,20,22,24,28].map(n=><option key={n} value={n}>{n}px</option>)}</select></label></div><div><Button size="sm" variant="ghost" disabled={readOnly||!["python","cpp"].includes(language)} onClick={()=>setSnippetsOpen(v=>!v)} aria-expanded={snippetsOpen} aria-label="常用竞赛语句"><Braces size={15}/><span>常用语句</span></Button><Button size="sm" variant="ghost" onClick={save} title="Ctrl / Cmd + S"><Save size={15}/>{savedNotice?'已保存':'保存'}</Button><Button size="sm" variant="ghost" onClick={()=>setMaximized(v=>!v)} aria-label={maximized?'退出全屏编程':'全屏编程'}>{maximized?<Minimize2 size={15}/>:<Maximize2 size={15}/>}<span>{maximized?'退出全屏':'全屏'}</span></Button></div></div>
  {snippetsOpen&&<ContestSnippets language={language} onInsert={insertSnippet} onClose={()=>setSnippetsOpen(false)}/>}
  <div className={'ide-body '+(!treeOpen?'tree-closed':'')}><aside className="ide-activitybar"><button title={treeOpen?'收起工程目录':'展开工程目录'} aria-label={treeOpen?'收起工程目录':'展开工程目录'} onClick={()=>setTreeOpen(!treeOpen)}>{treeOpen?<PanelLeftClose size={19}/>:<PanelLeftOpen size={19}/>}</button><button title="运行结果" aria-label="查看运行结果" onClick={()=>document.getElementById(`console-${p.id}`)?.scrollIntoView({block:'nearest'})}><Terminal size={19}/></button></aside>
  {treeOpen&&<aside className="ide-project-tree"><div className="ide-tree-heading"><span>Project</span><Button size="icon" variant="ghost" aria-label="新建文件" onClick={()=>{setNewFileOpen(true);setFileError('');}}><Plus size={15}/></Button></div><div className="ide-root-folder"><ChevronDown size={12}/><FolderOpen size={15}/>{standalone?'my-code':`problem-${p.id}`}</div><nav aria-label="工程文件">{Object.keys(project.files).map(name=><button key={name} className={project.activeFile===name?'selected':''} onClick={()=>choose(name)}>{executable(name)?<FileCode2 size={15}/>:<FileText size={15}/>}<span>{name}</span>{project.entryFile===name&&<Play size={10}/>}</button>)}{!standalone&&<div className="ide-root-folder samples-folder"><ChevronDown size={12}/><FolderOpen size={15}/>samples</div>}{Object.keys(samples).map(name=><button key={name} className={project.activeFile===name?'selected':''} onClick={()=>choose(name)}><FileText size={14}/><span>{name.slice(8)}</span></button>)}</nav></aside>}
  <div className="ide-editor-column"><Tabs value={project.activeFile} onValueChange={choose} className="ide-file-tabs"><TabsList variant="line" aria-label="打开的代码文件">{project.openFiles.map(name=><div className={'ide-file-tab '+(project.activeFile===name?'active':'')} key={name}><TabsTrigger value={name}>{name.split('/').pop()}</TabsTrigger><button className="ide-file-close" onClick={()=>closeFile(name)} aria-label={`关闭文件标签 ${name}`}><X size={12}/></button></div>)}</TabsList><Button size="icon" variant="ghost" aria-label="添加代码文件" onClick={()=>setNewFileOpen(true)}><Plus size={14}/></Button></Tabs>
  <div className="ide-editor-surface" style={{height:preferences.height}}>{fallback?<Textarea ref={fallbackEditor} value={activeCode} className="fallback-code" readOnly={readOnly} spellCheck={false} aria-label="代码编辑器" onChange={e=>setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:e.target.value}}))}/>:!overlayNode?<div className="editor-loading">正在打开编辑器…</div>:<Editor height="100%" path={`inmemory://usaco/${p.id}/${project.activeFile}`} language={language} value={activeCode} theme={preferences.theme==='dark'?'usaco-idea':'vs'} saveViewState keepCurrentModel onChange={value=>{if(!readOnly)setProject(prev=>({...prev,files:{...prev.files,[prev.activeFile]:value||''}}));}} beforeMount={m=>{registerCodeCompletions(m);m.editor.defineTheme('usaco-idea',{base:'vs-dark',inherit:true,rules:[{token:'comment',foreground:'7A7E85'},{token:'keyword',foreground:'CF8E6D'},{token:'string',foreground:'6AAB73'},{token:'number',foreground:'2AACB8'},{token:'type.identifier',foreground:'BCBEC4'},{token:'function',foreground:'56A8F5'}],colors:{'editor.background':'#1E1F22','editor.foreground':'#BCBEC4','editorLineNumber.foreground':'#61656D','editorLineNumber.activeForeground':'#A8ADBD','editor.lineHighlightBackground':'#26282E','editor.selectionBackground':'#214283','editorCursor.foreground':'#CED0D6','editorIndentGuide.background1':'#31343A','editorInfo.foreground':'#6B8799','editorWarning.foreground':'#D0AA66','editorError.foreground':'#E46A70'}});}} onMount={(ed,m)=>{editor.current=ed;monaco.current=m;setFallback(false);inspectionBridge.current?.dispose();inspectionBridge.current=attachPythonInspection(ed,m,id=>inspectionRef.current.dismiss(id),overlayNode);setEditorEpoch(v=>v+1);ed.addCommand(m.KeyMod.CtrlCmd|m.KeyCode.Enter,()=>runAction.current('run'));ed.addCommand(m.KeyMod.CtrlCmd|m.KeyCode.KeyS,()=>saveAction.current());}} loading={<div className="editor-loading">正在打开编辑器…</div>} options={{overflowWidgetsDomNode:overlayNode,fixedOverflowWidgets:true,allowOverflow:true,fontSize:preferences.fontSize,lineHeight:Math.round(preferences.fontSize*1.6),fontFamily:'JetBrains Mono,Consolas,monospace',minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,tabSize:4,insertSpaces:true,detectIndentation:false,renderValidationDecorations:'on',hover:{enabled:'on',delay:350,sticky:true,hidingDelay:1500,above:false},padding:{top:15},wordWrap:'on',readOnly,quickSuggestions:{other:'on',comments:'off',strings:'off'},quickSuggestionsDelay:80,suggestOnTriggerCharacters:true,tabCompletion:'on',acceptSuggestionOnEnter:'on',snippetSuggestions:'top',suggestSelection:'first',wordBasedSuggestions:'currentDocument',parameterHints:{enabled:true},bracketPairColorization:{enabled:true}}}/>}</div>
  <div className="ide-height-resizer" role="separator" aria-label="上下调整代码区高度" aria-orientation="horizontal" aria-valuemin={220} aria-valuemax={1400} aria-valuenow={preferences.height} tabIndex={0} onPointerDown={resizeHeight} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();setPreferences(v=>({...v,height:Math.max(220,Math.min(1400,v.height+(e.key==='ArrowDown'?40:-40)))}));}}}><GripHorizontal size={18}/></div>
  <div className="ide-statusbar"><span title={readOnly?'样例不可编辑':'输入 pr 可补全 print()；Tab / Enter 确认，Ctrl+Space 显示建议'}>{readOnly?'样例 · 只读':saveError?'尚未保存':'本机已保存'}</span>{!readOnly&&['python','cpp'].includes(language)&&<button className={`inspection-status ${inspectionErrors?'has-errors':''}`} aria-label="代码检查" aria-expanded={inspectionOpen} title="查看语法、名称与 PEP 8 提醒；悬停代码标记可查看修改建议" onClick={()=>setInspectionOpen(v=>!v)}>{inspection.state==='checking'||inspection.state==='loading'?<LoaderCircle size={12}/>:inspectionErrors?<AlertCircle size={12}/>:<Info size={12}/>}<span>{inspection.state==='loading'?'启动检查…':inspection.state==='checking'?'检查中…':inspection.state==='unavailable'?'检查不可用':inspection.state==='unsupported'?'C++ 检查未接入':`${inspectionErrors} 错误 · ${inspectionHints} 提醒`}</span></button>}<span>{language==='python'?'Python 3':language==='cpp'?'C++17':'文本'} · UTF-8 · LF</span><button onClick={download} aria-label="下载当前文件" title="下载当前文件"><Download size={14}/>{standalone&&<span>下载文件</span>}</button></div></div></div>
  {inspectionOpen&&<PythonInspectionPanel snapshot={inspection.snapshot} state={inspection.state} message={inspection.message} dismissedCount={inspection.dismissedCount} onApply={acceptInspection} onDismiss={inspection.dismiss} onReveal={revealInspection} onRestore={inspection.restore} onRetry={inspection.recheck} onClose={()=>setInspectionOpen(false)}/>}
  {saveError&&<p className="ide-storage-error" role="alert">{saveError}</p>}
  {standalone&&<label className="playground-stdin">标准输入 <span>供 input() / sys.stdin 读取</span><Textarea aria-label="独立编辑器标准输入" rows={2} value={standardInput} onChange={e=>{setStandardInput(e.target.value);try{localStorage.setItem('usaco-playground-stdin',e.target.value);}catch{}}} placeholder="程序需要输入时，将数据粘贴到这里"/></label>}
  <div className="ide-run-bar"><div><span className="ide-entry-label">入口 {project.entryFile}</span><Select value={limit} onValueChange={setLimit}><SelectTrigger aria-label="单文件本机限时"><SelectValue/></SelectTrigger><SelectContent portalContainer={overlayNode?.parentElement} className={standalone?'coding-tools-select':undefined}>{[2,5,10,20,60].map(n=><SelectItem key={n} value={String(n)}>{n} 秒/文件</SelectItem>)}</SelectContent></Select></div><div><Button variant="outline" disabled={busy||examExpired||entryLanguage!=='python'} onClick={()=>run('run')}><Play size={14}/>运行代码</Button>{!standalone&&<><Button variant="outline" disabled={busy||examExpired||entryLanguage!=='python'} onClick={()=>run('sample')}>检查样例</Button><Button disabled={busy||examExpired||entryLanguage!=='python'} onClick={()=>run('all')}>{practiceCases?'检查全部':'评测全部'} {p.testsTotal} 例</Button></>}{busy&&<Button variant="outline" onClick={stop}><Square size={14}/>停止</Button>}</div></div>
  {entryLanguage==='cpp'&&<p className="ide-runtime-note">C++ 当前支持编辑和下载；在线编译尚未接入。</p>}
  <section className="ide-console" id={`console-${p.id}`} aria-label="程序运行输出">
   <div className="console-heading"><h3><Terminal size={15}/>输出</h3>{!standalone&&<label className="console-input-choice">运行时输入 <select aria-label="运行时使用的样例输入" value={inputSample} disabled={busy} onChange={e=>setInputSample(e.target.value)}><option value="none">无输入</option>{p.samples.map((_,i)=><option key={i} value={String(i)}>样例 {i+1}</option>)}</select></label>}</div>
   <p className="runtime-status" role="status">{status||(standalone?'点击“运行代码”查看输出。':'点击“运行代码”查看程序输出；需要核对答案时，点击“检查样例”或“检查全部”。')}</p>
   {planned.length>0&&runMode!=='run'&&<><p className="ide-test-caption">{runMode==='all'?`每个用例使用各自的输入独立运行；样例通过不代表全部通过。`:"点击用例查看输入、实际输出和预期输出。"}</p><div className="test-grid" aria-label="选择测试结果">{planned.map((name,i)=><button type="button" key={name} disabled={!results[i]} aria-pressed={activeResultIndex===i} onClick={()=>setSelectedResult(i)} className={`test-badge ${(results[i]?.status||'waiting').toLowerCase()}`}>{name} · {results[i]?.status||'待运行'}</button>)}</div></>}
   {showOutput&&<div className="console-result">
    {result&&<div className="console-result-heading"><b>{runMode==='run'?'本次运行':`${result.name} · ${result.status}`}</b><span>{result.ms} ms</span></div>}
    <div className="console-output-grid">
     <section><h4>程序输出{result?.outputSource&&result.outputSource!=='stdout'?` · ${result.outputSource}`:''}</h4><pre className="program-output" aria-label="程序输出数据">{result?result.output|| (result.status==='TLE'?'超过本机限时，运行已停止。':'（没有输出）'):busy?'正在执行…':'等待运行'}</pre></section>
     {runMode!=='run'&&result?.expected!=null&&<section><h4>预期输出</h4><pre className="expected-output" aria-label="预期输出数据">{result.expected||'（空输出）'}</pre></section>}
    </div>
    {result&&<section className="console-input-data"><h4>本次输入 · {runMode==='run'?result.name:result.name+' 输入'}</h4><pre>{result.input||"（无输入）"}</pre></section>}
    {result?.stderr&&<section className="console-diagnostic"><h4>诊断输出 · stderr</h4><pre>{result.stderr}</pre></section>}
    {result?.error&&<section className="console-error" role="alert"><h4>Python 错误</h4><pre>{result.error}</pre></section>}
    {result?.purpose&&runMode!=='run'&&<p className="case-purpose"><b>本例检查：</b>{result.purpose}</p>}
    {result?.detail&&runMode!=='run'&&<p className="console-detail">{result.detail}</p>}
    {result?.truncated&&<p className="console-detail">长数据仅展示前 12,000 个字符；判题使用完整输出。</p>}
   </div>}
   {runMode==='run'?<p className="ide-runtime-note">{standalone?'代码自动保存在本机；“下载文件”可保存到电脑。每次运行从头执行，独立于 Shell 会话。':'普通运行只执行代码，不判断题目对错。input() 使用上方选定的样例输入；无输入时会报告 EOFError。'}</p>:<p className="ide-runtime-note">{practiceCases?'练习数据':'官方数据'} {p.testsImported}/{p.testsTotal} 个文件 · AC 正确 / WA 错误 / RE 异常 / TLE 本机超时。耗时与官方服务器可能不同。</p>}
  </section>

  <Dialog open={newFileOpen} onOpenChange={setNewFileOpen}><DialogContent portalContainer={overlayNode?.parentElement} className={standalone?'coding-tools-file-dialog':undefined}><DialogTitle>新建文件</DialogTitle><DialogDescription>{standalone?'创建代码文件、数据文件或可导入的辅助模块。':'在这道题的工程中保存另一种解法，或添加可导入的辅助模块。'}</DialogDescription><form onSubmit={e=>{e.preventDefault();addFile();}} className="new-file-form"><Input autoFocus value={filename} onChange={e=>setFilename(e.target.value)} placeholder="solution2.py" aria-label="文件名"/>{fileError&&<p role="alert">{fileError}</p>}<Button type="submit">创建文件</Button></form></DialogContent></Dialog>
 </section>;
}
