'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Square,Trash2,RotateCcw,ChevronDown,Terminal} from 'lucide-react';
import {PythonShellRuntime,type ShellResult} from '@/lib/python-shell';
type Entry={id:number;code?:string;output?:string;stderr?:string;error?:string;note?:string};
export function PythonShell({visible}:{visible:boolean}){
 const [code,setCode]=useState(''),[input,setInput]=useState(''),[inputOpen,setInputOpen]=useState(false),[entries,setEntries]=useState<Entry[]>([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('输入代码后按 Enter 执行'),[ready,setReady]=useState(false);
 const runtime=useRef<PythonShellRuntime|null>(null),field=useRef<HTMLTextAreaElement>(null),transcript=useRef<HTMLDivElement>(null),sequence=useRef(0),generation=useRef(0),running=useRef(false),history=useRef<string[]>([]),historyIndex=useRef(-1),unfinished=useRef('');
 useEffect(()=>{try{setCode(localStorage.getItem('usaco-shell-draft')||'');const saved=JSON.parse(localStorage.getItem('usaco-shell-history')||'[]');history.current=Array.isArray(saved)?saved.filter(x=>typeof x==='string').slice(-60):[];}catch{}setReady(true);return()=>{generation.current++;runtime.current?.stop();};},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('usaco-shell-draft',code);}catch{}},[code,ready]);
 useEffect(()=>{if(visible)field.current?.focus();},[visible]);
 useEffect(()=>{if(transcript.current)transcript.current.scrollTop=transcript.current.scrollHeight;},[entries]);
 const append=(entry:Omit<Entry,'id'>)=>setEntries(items=>[...items.slice(-79),{id:++sequence.current,...entry}]);
 function freshRuntime(){if(!runtime.current)runtime.current=new PythonShellRuntime(setStatus);return runtime.current;}
 function nextLine(){const el=field.current,start=el?.selectionStart??code.length,end=el?.selectionEnd??start,previous=code.slice(0,start).split('\n').at(-1)||'',indent=(previous.match(/^\s*/)?.[0]||'')+(previous.trimEnd().endsWith(':')?'    ':'');const inserted='\n'+indent;setCode(code.slice(0,start)+inserted+code.slice(end));requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(start+inserted.length,start+inserted.length);});}
 async function execute(force=false){
  if(running.current||!code.trim())return;
  running.current=true;setBusy(true);const submitted=code,version=generation.current,engine=freshRuntime();
  try{
   const result:ShellResult=await engine.execute(submitted,input,force);if(version!==generation.current)return;
   if(result.incomplete){nextLine();return;}
   append({code:submitted,output:result.output,stderr:result.stderr,error:result.error,note:result.truncated?'输出较长，仅展示前 20,000 个字符。':undefined});
   history.current=[...history.current.filter(x=>x!==submitted),submitted].slice(-60);try{localStorage.setItem('usaco-shell-history',JSON.stringify(history.current));}catch{}
   historyIndex.current=-1;unfinished.current='';setCode('');
  }catch(error){if(version!==generation.current)return;const message=error instanceof Error?error.message:String(error);append({code:submitted,error:message});setStatus(message);runtime.current?.stop();runtime.current=null;}
  finally{if(version===generation.current){running.current=false;setBusy(false);requestAnimationFrame(()=>field.current?.focus());}}
 }
 function reset(){generation.current++;runtime.current?.stop();runtime.current=null;running.current=false;setBusy(false);const message=busy?'执行已停止，会话变量已重置。':'会话变量已重置，历史记录保留。';setStatus(message);append({note:message});field.current?.focus();}
 function recall(direction:number){const values=history.current;if(!values.length)return;if(historyIndex.current===-1){unfinished.current=code;historyIndex.current=values.length;}historyIndex.current=Math.max(0,Math.min(values.length,historyIndex.current+direction));setCode(values[historyIndex.current]??unfinished.current);requestAnimationFrame(()=>{field.current?.setSelectionRange(999999,999999);});}
 function keyDown(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.nativeEvent.isComposing)return;
  if(e.key==='Enter'){e.preventDefault();if(e.shiftKey)nextLine();else void execute(e.ctrlKey||e.metaKey);}
  else if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd;setCode(code.slice(0,start)+'    '+code.slice(end));requestAnimationFrame(()=>el.setSelectionRange(start+4,start+4));}
  else if((e.key==='ArrowUp'||e.key==='ArrowDown')&&!code.includes('\n')){e.preventDefault();recall(e.key==='ArrowUp'?-1:1);}
 }
 return <section className="python-shell" aria-label="Python Shell">
  <div className="shell-toolbar"><span><Terminal size={14}/>Python 3</span><button onClick={()=>setInputOpen(v=>!v)} aria-expanded={inputOpen}>标准输入<ChevronDown size={13}/></button><button onClick={()=>setEntries([])} title="仅清除显示内容，保留变量"><Trash2 size={14}/>清屏</button><button onClick={reset} title="停止运行并清空会话变量"><RotateCcw size={14}/>重启</button></div>
  {inputOpen&&<label className="shell-stdin">input() / sys.stdin 读取这里的内容，每次执行从第一行开始。<textarea aria-label="Shell 标准输入" rows={3} value={input} onChange={e=>setInput(e.target.value)} placeholder="代码需要输入数据时，先粘贴到这里"/></label>}
  <div className="shell-transcript" ref={transcript} role="log" aria-label="Shell 执行记录" aria-live="polite">
   {!entries.length&&<p className="shell-empty">例如输入 <code>1 + 5</code> 或 <code>print("Hello, Bessie!")</code>。</p>}
   {entries.map(entry=><div className="shell-entry" key={entry.id}>{entry.code&&<pre className="shell-command">{entry.code.split('\n').map((line,i)=><span key={i}><b aria-hidden="true">{i?'...':'>>>'}</b>{line}{'\n'}</span>)}</pre>}{entry.output&&<pre className="shell-output">{entry.output}</pre>}{entry.stderr&&<pre className="shell-stderr">{entry.stderr}</pre>}{entry.error&&<pre className="shell-error">{entry.error}</pre>}{entry.note&&<p className="shell-note">{entry.note}</p>}</div>)}
  </div>
  <div className="shell-input-row"><span aria-hidden="true">{code.includes('\n')?'...':'>>>'}</span><textarea ref={field} aria-label="Python Shell 输入" spellCheck={false} value={code} disabled={busy} rows={Math.min(9,Math.max(2,code.split('\n').length))} onChange={e=>{setCode(e.target.value);historyIndex.current=-1;}} onKeyDown={keyDown} placeholder="输入 Python 代码"/>{busy?<button className="shell-stop" onClick={reset} aria-label="停止 Shell 执行"><Square size={14}/></button>:<button onClick={()=>void execute()} disabled={!code.trim()} aria-label="执行 Shell 代码"><Play size={16}/></button>}</div>
  <footer className="shell-footer"><span role="status">{status}</span><span>Enter 执行 · Shift+Enter 换行 · ↑↓ 历史</span><small>切换页面保留变量；刷新页面后变量重置。</small></footer>
 </section>;
}
