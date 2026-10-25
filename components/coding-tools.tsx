'use client';
import {useEffect,useRef,useState,lazy,Suspense,type PointerEvent,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {Terminal,Code2,Minus,Maximize2,Minimize2,GripVertical,Scaling} from 'lucide-react';
import type {CodingTool} from './coding-tool-launchers';
import {PythonShell} from './python-shell';
import {fitWindow,initialWindow,type WindowFrame} from '@/lib/floating-window';
import type {Problem} from './practice-workspace';
const ProjectIDE=lazy(()=>import('./project-ide').then(m=>({default:m.ProjectIDE})));
const project:Problem={id:-1,title:'独立代码编辑器',zhTitle:'独立代码编辑器',roundLabel:'',year:0,season:'',tags:[],reviewStatus:'',level:'',visual:'',official:'',editorial:'',testsUrl:'',summary:'',summaryEn:'',analysis:'',hints:[],samples:[],io:'',checker:'tokens',testsImported:0,testsTotal:0};
const viewport=()=>({width:document.documentElement.clientWidth||window.innerWidth,height:window.visualViewport?.height||window.innerHeight});
export default function CodingTools(){
 const [tool,setTool]=useState<CodingTool>('shell'),[open,setOpen]=useState(false),[seen,setSeen]=useState({shell:false,editor:false}),[maximized,setMaximized]=useState(false),[host,setHost]=useState<HTMLDivElement|null>(null),[toolbarHost,setToolbarHost]=useState<HTMLDivElement|null>(null);
 const [frames,setFrames]=useState<Partial<Record<CodingTool,WindowFrame>>>({}),[moving,setMoving]=useState(false);
 const previousFocus=useRef<HTMLElement|null>(null),heading=useRef<HTMLDivElement|null>(null),panel=useRef<HTMLElement|null>(null);
 const gesture=useRef<{mode:'move'|'resize';x:number;y:number;frame:WindowFrame;tool:CodingTool}|null>(null);
 useEffect(()=>{
  const node=document.createElement('div');node.className='coding-tools-portal';const place=()=>{const reader=document.querySelector('.statement-fullscreen');(document.fullscreenElement||reader||document.body).appendChild(node);};place();setHost(node);
  const show=(event:Event)=>{const next:unknown=(event as CustomEvent).detail;if(next!=='shell'&&next!=='editor')return;previousFocus.current=document.activeElement as HTMLElement;place();setFrames(v=>({...v,[next]:fitWindow(v[next]||initialWindow(next,viewport()),viewport())}));setTool(next);setSeen(v=>({...v,[next]:true}));setOpen(true);};
  const fit=()=>setFrames(v=>Object.fromEntries(Object.entries(v).map(([key,frame])=>[key,fitWindow(frame!,viewport())])));
  window.addEventListener('usaco-open-coding-tool',show);document.addEventListener('fullscreenchange',place);window.addEventListener('usaco-reader-change',place);window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
  return()=>{window.removeEventListener('usaco-open-coding-tool',show);document.removeEventListener('fullscreenchange',place);window.removeEventListener('usaco-reader-change',place);window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);node.remove();};
 },[]);
 useEffect(()=>{if(open)heading.current?.focus();gesture.current=null;setMoving(false);},[open,tool,maximized]);
 function minimize(){setOpen(false);previousFocus.current?.focus();}
 function select(next:CodingTool){setTool(next);setSeen(v=>({...v,[next]:true}));setFrames(v=>({...v,[next]:fitWindow(v[next]||initialWindow(next,viewport()),viewport())}));}
 function start(event:PointerEvent<HTMLElement>,mode:'move'|'resize'){
  if(maximized||event.button!==0)return;
  const control=(event.target as Element).closest('button,select,input,a,[role=tab]');if(mode==='move'&&control&&!control.hasAttribute('data-window-drag'))return;
  const rect=panel.current?.getBoundingClientRect();if(!rect)return;
  event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);gesture.current={mode,x:event.clientX,y:event.clientY,frame:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},tool};setMoving(true);
 }
 function move(event:PointerEvent<HTMLElement>){
  const g=gesture.current;if(!g)return;const dx=event.clientX-g.x,dy=event.clientY-g.y;let frame={...g.frame};
  if(g.mode==='move'){frame.x+=dx;frame.y+=dy;}else{const view=viewport();frame.width=Math.min(frame.width+dx,view.width-frame.x-10);frame.height=Math.min(frame.height+dy,view.height-frame.y-Math.min(72,view.height*.15));}
  frame=fitWindow(frame,viewport());setFrames(v=>({...v,[g.tool]:frame}));
 }
 function end(event:PointerEvent<HTMLElement>){gesture.current=null;setMoving(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
 function keyboard(event:KeyboardEvent<HTMLButtonElement>,resize=false){
  if(maximized||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const delta=event.shiftKey?40:12;
  setFrames(v=>{const frame={...(v[tool]||initialWindow(tool,viewport()))};if(event.key==='ArrowLeft')frame[resize?'width':'x']-=delta;if(event.key==='ArrowRight')frame[resize?'width':'x']+=delta;if(event.key==='ArrowUp')frame[resize?'height':'y']-=delta;if(event.key==='ArrowDown')frame[resize?'height':'y']+=delta;return {...v,[tool]:fitWindow(frame,viewport())};});
 }
 if(!host)return null;
 const frame=frames[tool],style=!maximized&&frame?{left:frame.x,top:frame.y,width:frame.width,height:frame.height}:undefined;
 return createPortal(<section ref={panel} hidden={!open} style={style} className={`coding-tools-window ${maximized?'is-maximized':''} ${moving?'is-moving':''}`} role="dialog" aria-modal="false" aria-label="编程工具">
  <header className="coding-tools-header" ref={heading} tabIndex={-1} onPointerDown={e=>start(e,'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
   <button className="coding-window-drag" data-window-drag aria-label="移动编程工具窗口" title="拖动窗口；方向键微调位置" disabled={maximized} onKeyDown={e=>keyboard(e)}><GripVertical size={14}/></button>
   <div role="tablist" aria-label="编程工具切换">{(['shell','editor'] as const).map(key=><button role="tab" id={`coding-tool-${key}`} aria-controls={`coding-panel-${key}`} aria-selected={tool===key} key={key} onClick={()=>select(key)} title={key==='shell'?'Python 3 Shell':'代码编辑器'}>{key==='shell'?<Terminal size={15}/>:<Code2 size={15}/>}<span>{key==='shell'?'Python 3 Shell':'代码编辑器'}</span></button>)}</div>
   <div className="coding-tools-shell-actions" ref={setToolbarHost} hidden={tool!=='shell'}/>
   <div className="coding-window-actions"><button title={maximized?'还原窗口':'放大窗口'} aria-label={maximized?'还原编程工具窗口':'放大编程工具窗口'} onClick={()=>setMaximized(v=>!v)}>{maximized?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button><button title="收起窗口，保留代码和 Shell 变量" aria-label="收起编程工具" onClick={minimize}><Minus size={17}/></button></div>
  </header>
  <div className="coding-tool-content" id="coding-panel-shell" role="tabpanel" aria-labelledby="coding-tool-shell" hidden={tool!=='shell'}>{seen.shell&&<PythonShell visible={open&&tool==='shell'} toolbarHost={toolbarHost}/>}</div>
  <div className="coding-tool-content coding-editor-content" id="coding-panel-editor" role="tabpanel" aria-labelledby="coding-tool-editor" hidden={tool!=='editor'}>{seen.editor&&<Suspense fallback={<p>正在打开编辑器…</p>}><ProjectIDE problem={project} mode="learning" standalone visible={open&&tool==='editor'} onAttempt={()=>{}}/></Suspense>}</div>
  {!maximized&&<button className="coding-window-resize" aria-label="调整编程工具窗口大小" title="拖动调整窗口大小；方向键微调" onPointerDown={e=>start(e,'resize')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={e=>keyboard(e,true)}><Scaling size={13}/></button>}
 </section>,host);
}
