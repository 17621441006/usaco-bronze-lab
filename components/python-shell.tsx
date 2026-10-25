'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import Editor,{loader,type Monaco,type OnMount} from '@monaco-editor/react';
import type {editor as MonacoEditor} from 'monaco-editor';
import {Play,Square,Trash2,RotateCcw,TextCursorInput,Minus,Plus,Sun,Moon} from 'lucide-react';
import {PythonShellRuntime,type ShellResult} from '@/lib/python-shell';
import {configureCodeEditor} from '@/lib/editor-theme';
import {setCompletionContext} from '@/lib/code-completions';
import {useEditorOverlays} from '@/hooks/use-editor-overlays';
loader.config({paths:{vs:'/editor/vs'}});
type Entry={id:number;code?:string;output?:string;stderr?:string;error?:string;note?:string};
type Preferences={fontSize:number;theme:'dark'|'light'};
function ShellCommand({code,monaco}:{code:string;monaco:Monaco|null}){
 const lines=useMemo(()=>{const tokens:{offset:number;type:string}[][]|undefined=monaco?.editor.tokenize(code,'python');return code.split('\n').map((line,i)=>({line,tokens:tokens?.[i]}));},[code,monaco]);
 return <pre className="shell-command">{lines.map(({line,tokens},i)=><span className="shell-code-line" key={i}><b aria-hidden="true">{i?'...':'>>>'}</b><code>{tokens?.length?tokens.map((token,j)=><span className={`shell-token-${token.type.split('.')[0]||'plain'}`} key={j}>{line.slice(token.offset,tokens[j+1]?.offset)}</span>):line}</code>{'\n'}</span>)}</pre>;
}
export function PythonShell({visible,toolbarHost}:{visible:boolean;toolbarHost?:HTMLElement|null}){
 const [code,setCode]=useState(''),[input,setInput]=useState(''),[inputOpen,setInputOpen]=useState(false),[entries,setEntries]=useState<Entry[]>([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('Enter 执行'),[ready,setReady]=useState(false);
 const [preferences,setPreferences]=useState<Preferences>({fontSize:16,theme:'dark'}),[monaco,setMonaco]=useState<Monaco|null>(null),[fallback,setFallback]=useState(false);
 const editor=useRef<MonacoEditor.IStandaloneCodeEditor|null>(null),fallbackField=useRef<HTMLTextAreaElement>(null),transcript=useRef<HTMLDivElement>(null);
 const runtime=useRef<PythonShellRuntime|null>(null),sequence=useRef(0),generation=useRef(0),running=useRef(false),history=useRef<string[]>([]),historyIndex=useRef(-1),unfinished=useRef(''),context=useRef('');
 const actions=useRef({execute:(_force=false)=>{},nextLine:()=>{},recall:(_direction:number)=>{}});
 const overlayNode=useEditorOverlays(preferences.theme,visible);
 const focus=()=>{if(fallback)fallbackField.current?.focus();else editor.current?.focus();};
 useEffect(()=>{
  try{setCode(localStorage.getItem('usaco-shell-draft')||'');const saved=JSON.parse(localStorage.getItem('usaco-shell-history')||'[]');history.current=Array.isArray(saved)?saved.filter(x=>typeof x==='string').slice(-60):[];const prefs=JSON.parse(localStorage.getItem('usaco-shell-preferences')||'{}');setPreferences({fontSize:Math.max(12,Math.min(28,Number(prefs.fontSize)||16)),theme:prefs.theme==='light'?'light':'dark'});}catch{}
  setReady(true);return()=>{generation.current++;runtime.current?.stop();};
 },[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('usaco-shell-draft',code);localStorage.setItem('usaco-shell-preferences',JSON.stringify(preferences));}catch{}},[code,preferences,ready]);
 useEffect(()=>{if(visible)requestAnimationFrame(()=>{editor.current?.layout();focus();});},[visible,fallback]);
 useEffect(()=>{if(!visible)return;const timer=setTimeout(()=>{if(!editor.current)setFallback(true);},14000);return()=>clearTimeout(timer);},[visible]);
 useEffect(()=>{if(transcript.current)transcript.current.scrollTop=0;},[entries]);
 const append=(entry:Omit<Entry,'id'>)=>setEntries(items=>[...items.slice(-79),{id:++sequence.current,...entry}]);
 function freshRuntime(){if(!runtime.current)runtime.current=new PythonShellRuntime(setStatus);return runtime.current;}
 function updateContext(source:string){context.current=source;const model=editor.current?.getModel();if(model)setCompletionContext(model,source);}
 function nextLine(){
  if(running.current)return;
  const ed=editor.current,model=ed?.getModel(),selection=ed?.getSelection(),field=fallbackField.current,current=model?.getValue()??code;
  const start=model&&selection?model.getOffsetAt(selection.getStartPosition()):field?.selectionStart??current.length,end=model&&selection?model.getOffsetAt(selection.getEndPosition()):field?.selectionEnd??start;
  const previous=current.slice(0,start).split('\n').at(-1)||'',indent=(previous.match(/^\s*/)?.[0]||'')+(previous.trimEnd().endsWith(':')?'    ':'');const inserted='\n'+indent;
  if(ed&&model&&selection&&!fallback){ed.executeEdits('shell-newline',[{range:selection,text:inserted,forceMoveMarkers:true}]);ed.setPosition(model.getPositionAt(start+inserted.length));ed.focus();}
  else{setCode(current.slice(0,start)+inserted+current.slice(end));requestAnimationFrame(()=>{field?.focus();field?.setSelectionRange(start+inserted.length,start+inserted.length);});}
 }
 async function execute(force=false){
  const submitted=editor.current?.getValue()??code;if(running.current||!submitted.trim())return;
  running.current=true;setBusy(true);const version=generation.current,engine=freshRuntime();
  try{
   const result:ShellResult=await engine.execute(submitted,input,force);if(version!==generation.current)return;
   if(result.incomplete){requestAnimationFrame(()=>{editor.current?.updateOptions({readOnly:false});actions.current.nextLine();});return;}
   append({code:submitted,output:result.output,stderr:result.stderr,error:result.error,note:result.truncated?'输出较长，仅展示前 20,000 个字符。':undefined});updateContext((context.current+'\n'+submitted).slice(-30000));
   history.current=[...history.current.filter(x=>x!==submitted),submitted].slice(-60);try{localStorage.setItem('usaco-shell-history',JSON.stringify(history.current));}catch{}
   historyIndex.current=-1;unfinished.current='';setCode('');
  }catch(error){if(version!==generation.current)return;const message=error instanceof Error?error.message:String(error);append({code:submitted,error:message});setStatus(message);runtime.current?.stop();runtime.current=null;updateContext('');}
  finally{if(version===generation.current){running.current=false;setBusy(false);requestAnimationFrame(focus);}}
 }
 function reset(){generation.current++;runtime.current?.stop();runtime.current=null;updateContext('');running.current=false;setBusy(false);const message=busy?'执行已停止，变量已重置。':'变量已重置，历史记录保留。';setStatus(message);append({note:message});focus();}
 function recall(direction:number){
  const values=history.current;if(!values.length)return;if(historyIndex.current===-1){unfinished.current=code;historyIndex.current=values.length;}historyIndex.current=Math.max(0,Math.min(values.length,historyIndex.current+direction));const next=values[historyIndex.current]??unfinished.current;setCode(next);
  requestAnimationFrame(()=>{const model=editor.current?.getModel();if(model)editor.current?.setPosition(model.getPositionAt(next.length));fallbackField.current?.setSelectionRange(next.length,next.length);});
 }
 actions.current={execute,nextLine,recall};
 const mount:OnMount=(ed,m)=>{
  editor.current=ed;setMonaco(m);setFallback(false);setCompletionContext(ed.getModel()!,context.current);const singleLine=ed.createContextKey('shellSingleLine',ed.getModel()?.getLineCount()===1);
  ed.onDidChangeModelContent(()=>singleLine.set(ed.getModel()?.getLineCount()===1));
  // Enter accepts a visible completion first; the next Enter executes the cell.
  ed.addCommand(m.KeyCode.Enter,()=>actions.current.execute(false),'!suggestWidgetVisible');ed.addCommand(m.KeyMod.CtrlCmd|m.KeyCode.Enter,()=>actions.current.execute(true));ed.addCommand(m.KeyMod.Shift|m.KeyCode.Enter,()=>actions.current.nextLine());
  ed.addCommand(m.KeyCode.UpArrow,()=>actions.current.recall(-1),'!suggestWidgetVisible && shellSingleLine');ed.addCommand(m.KeyCode.DownArrow,()=>actions.current.recall(1),'!suggestWidgetVisible && shellSingleLine');ed.addCommand(m.KeyMod.Alt|m.KeyCode.UpArrow,()=>actions.current.recall(-1));ed.addCommand(m.KeyMod.Alt|m.KeyCode.DownArrow,()=>actions.current.recall(1));if(visible)ed.focus();
 };
 const controls=<>
  <div className="shell-font-controls" aria-label="Shell 字号"><button aria-label="缩小 Shell 字号" title="缩小字号" disabled={preferences.fontSize<=12} onClick={()=>setPreferences(p=>({...p,fontSize:Math.max(12,p.fontSize-2)}))}><Minus size={13}/></button><output aria-label="Shell 当前字号">{preferences.fontSize}</output><button aria-label="放大 Shell 字号" title="放大字号" disabled={preferences.fontSize>=28} onClick={()=>setPreferences(p=>({...p,fontSize:Math.min(28,p.fontSize+2)}))}><Plus size={13}/></button></div>
  <button title={preferences.theme==='dark'?'切换浅色 Shell':'切换深色 Shell'} aria-label={preferences.theme==='dark'?'切换浅色 Shell':'切换深色 Shell'} onClick={()=>setPreferences(p=>({...p,theme:p.theme==='dark'?'light':'dark'}))}>{preferences.theme==='dark'?<Sun size={14}/>:<Moon size={14}/>}</button>
  <button title="设置 input() 读取的数据" aria-label="Shell 标准输入设置" onClick={()=>setInputOpen(v=>!v)} aria-expanded={inputOpen}><TextCursorInput size={14}/><span>标准输入</span></button>
  <button onClick={()=>setEntries([])} title="清屏，保留变量" aria-label="Shell 清屏"><Trash2 size={14}/><span>清屏</span></button><button onClick={reset} title="重启并清空变量" aria-label="重启 Shell"><RotateCcw size={14}/><span>重启</span></button>
 </>;
 const lineCount=Math.max(2,Math.min(5,code.split('\n').length));
 return <section className={`python-shell shell-${preferences.theme}`} aria-label="Python Shell" style={{'--shell-font-size':`${preferences.fontSize}px`} as CSSProperties}>
  {toolbarHost?createPortal(controls,toolbarHost):<div className="shell-toolbar">{controls}</div>}
  <div className="shell-input-row"><span aria-hidden="true">&gt;&gt;&gt;</span><div className="shell-code-input" style={{height:lineCount*Math.round(preferences.fontSize*1.6)+18}}>
   {fallback?<textarea ref={fallbackField} aria-label="Python Shell 输入" spellCheck={false} value={code} disabled={busy} onChange={e=>setCode(e.target.value)} onKeyDown={e=>{if(e.nativeEvent.isComposing)return;if(e.key==='Enter'){e.preventDefault();if(e.shiftKey)nextLine();else void execute(e.ctrlKey||e.metaKey);}else if((e.key==='ArrowUp'||e.key==='ArrowDown')&&!code.includes('\n')){e.preventDefault();recall(e.key==='ArrowUp'?-1:1);}}}/>:overlayNode?<Editor height="100%" path="inmemory://usaco-shell/input.py" language="python" value={code} theme={preferences.theme==='dark'?'usaco-idea':'vs'} onChange={value=>{setCode(value||'');historyIndex.current=-1;}} beforeMount={configureCodeEditor} onMount={mount} loading={<span className="shell-editor-loading">正在打开输入框…</span>} options={{ariaLabel:'Python Shell 输入',fontSize:preferences.fontSize,lineHeight:Math.round(preferences.fontSize*1.6),fontFamily:'JetBrains Mono,Consolas,monospace',lineNumbers:'off',lineDecorationsWidth:5,glyphMargin:false,folding:false,minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,tabSize:4,insertSpaces:true,detectIndentation:false,padding:{top:8,bottom:8},wordWrap:'on',renderLineHighlight:'none',overviewRulerLanes:0,hideCursorInOverviewRuler:true,readOnly:busy,quickSuggestions:{other:'on',comments:'off',strings:'off'},quickSuggestionsDelay:80,suggestOnTriggerCharacters:true,tabCompletion:'on',acceptSuggestionOnEnter:'on',snippetSuggestions:'top',suggestSelection:'first',wordBasedSuggestions:'currentDocument',parameterHints:{enabled:true},bracketPairColorization:{enabled:true},overflowWidgetsDomNode:overlayNode,fixedOverflowWidgets:true,allowOverflow:true,hover:{enabled:'on',above:false,sticky:true,hidingDelay:1500},scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6}}}/>:null}
  </div>{busy?<button className="shell-stop" onClick={reset} aria-label="停止 Shell 执行"><Square size={14}/></button>:<button onClick={()=>void execute()} disabled={!code.trim()} aria-label="执行 Shell 代码" title="执行 · Enter"><Play size={16}/></button>}</div>
  {inputOpen&&<label className="shell-stdin">input() / sys.stdin · 每次从第一行读取<textarea aria-label="Shell 标准输入" rows={2} value={input} onChange={e=>setInput(e.target.value)} placeholder="在这里粘贴输入数据"/></label>}
  <div className="shell-transcript" ref={transcript} role="log" aria-label="Shell 执行记录" aria-live="polite">
   {!entries.length&&<p className="shell-empty">输入 <code>1 + 5</code> 后回车，结果显示在这里。</p>}
   {[...entries].reverse().map(entry=><div className="shell-entry" key={entry.id}>{entry.code&&<ShellCommand code={entry.code} monaco={monaco}/>}<div className="shell-result">{entry.output&&<pre className="shell-output">{entry.output}</pre>}{entry.stderr&&<pre className="shell-stderr">{entry.stderr}</pre>}{entry.error&&<pre className="shell-error">{entry.error}</pre>}{entry.note&&<p className="shell-note">{entry.note}</p>}{entry.code&&!entry.output&&!entry.stderr&&!entry.error&&<small className="shell-no-output">已执行，无输出</small>}</div></div>)}
  </div>
  <footer className="shell-footer"><span role="status" title={`${status}；切换页面保留变量，刷新后重置。`}>{status}</span><span title="Tab / Enter 采纳联想；Enter 执行；Shift+Enter 换行；单行时 ↑↓ 或 Alt+↑↓ 调用历史">Enter 执行 · Shift+Enter 换行</span></footer>
 </section>;
}
