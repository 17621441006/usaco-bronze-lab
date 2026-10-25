'use client';
import {useEffect,useRef,useState,lazy,Suspense} from 'react';
import {createPortal} from 'react-dom';
import {Terminal,Code2,Minus,Maximize2,Minimize2} from 'lucide-react';
import type {CodingTool} from './coding-tool-launchers';
import {PythonShell} from './python-shell';
import type {Problem} from './practice-workspace';
const ProjectIDE=lazy(()=>import('./project-ide').then(m=>({default:m.ProjectIDE})));
const project:Problem={id:-1,title:'独立代码编辑器',zhTitle:'独立代码编辑器',roundLabel:'',year:0,season:'',tags:[],reviewStatus:'',level:'',visual:'',official:'',editorial:'',testsUrl:'',summary:'',summaryEn:'',analysis:'',hints:[],samples:[],io:'',checker:'tokens',testsImported:0,testsTotal:0};
export default function CodingTools(){
 const [tool,setTool]=useState<CodingTool>('shell'),[open,setOpen]=useState(false),[seen,setSeen]=useState({shell:false,editor:false}),[maximized,setMaximized]=useState(false),[host,setHost]=useState<HTMLDivElement|null>(null);
 const previousFocus=useRef<HTMLElement|null>(null),heading=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{
  const node=document.createElement('div');node.className='coding-tools-portal';const place=()=>{const reader=document.querySelector('.statement-fullscreen');(document.fullscreenElement||reader||document.body).appendChild(node);};place();setHost(node);
  const show=(event:Event)=>{const next=(event as CustomEvent).detail;if(next!=='shell'&&next!=='editor')return;previousFocus.current=document.activeElement as HTMLElement;place();setTool(next);setSeen(v=>({...v,[next]:true}));setOpen(true);};
  window.addEventListener('usaco-open-coding-tool',show);document.addEventListener('fullscreenchange',place);window.addEventListener('usaco-reader-change',place);
  return()=>{window.removeEventListener('usaco-open-coding-tool',show);document.removeEventListener('fullscreenchange',place);window.removeEventListener('usaco-reader-change',place);node.remove();};
 },[]);
 useEffect(()=>{if(open)heading.current?.focus();},[open,tool]);
 function minimize(){setOpen(false);previousFocus.current?.focus();}
 if(!host)return null;
 return createPortal(<section hidden={!open} className={`coding-tools-window ${maximized?'is-maximized':''}`} role="dialog" aria-modal="false" aria-label="编程工具">
  <header className="coding-tools-header" ref={heading} tabIndex={-1}><div role="tablist" aria-label="编程工具切换">{(['shell','editor'] as const).map(key=><button role="tab" id={`coding-tool-${key}`} aria-controls={`coding-panel-${key}`} aria-selected={tool===key} key={key} onClick={()=>{setTool(key);setSeen(v=>({...v,[key]:true}));}}>{key==='shell'?<Terminal size={15}/>:<Code2 size={15}/>}<span>{key==='shell'?'Python Shell':'代码编辑器'}</span></button>)}</div><div><button title={maximized?'还原窗口':'放大窗口'} aria-label={maximized?'还原编程工具窗口':'放大编程工具窗口'} onClick={()=>setMaximized(v=>!v)}>{maximized?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button><button title="收起窗口，保留代码和 Shell 变量" aria-label="收起编程工具" onClick={minimize}><Minus size={17}/></button></div></header>
  <div className="coding-tool-content" id="coding-panel-shell" role="tabpanel" aria-labelledby="coding-tool-shell" hidden={tool!=='shell'}>{seen.shell&&<PythonShell visible={open&&tool==='shell'}/>}</div>
  <div className="coding-tool-content coding-editor-content" id="coding-panel-editor" role="tabpanel" aria-labelledby="coding-tool-editor" hidden={tool!=='editor'}>{seen.editor&&<Suspense fallback={<p>正在打开编辑器…</p>}><ProjectIDE problem={project} mode="learning" standalone visible={open&&tool==='editor'} onAttempt={()=>{}}/></Suspense>}</div>
 </section>,host);
}
