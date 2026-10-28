'use client';
import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {ArrowDownToLine,ArrowUpRight,MoveHorizontal,Triangle,Camera,CameraOff,Check,ChevronLeft,ChevronRight,Circle,Box,Eraser,HelpCircle,Maximize2,Minimize2,Minus,PenLine,Plus,Redo2,Save,Square,Sun,Moon,Trash2,Undo2,X,BookOpen,Presentation,MousePointer2,Shapes} from 'lucide-react';
import {DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {OfficialStatement} from './official-statement';
import {WhiteboardShelf} from './whiteboard-shelf';
import {BOARD_WIDTH as W,BOARD_HEIGHT as H,boardKey,readBoard,newBoard,newSheet,drawInk,drawPaper,inks,distance,tidyMark,type Board,type BoardContext,type Mark,type Sheet,type Tool,type Ink,type Point} from '@/lib/whiteboard';
import {tidyRecentCuboid,recognizeCuboid,liveShape} from '@/lib/whiteboard-shapes';
import {elementCatalog,makeElement,type ElementKind,type TeachingElement} from '@/lib/whiteboard-elements';
import {useGestureCamera} from '@/lib/use-gesture-camera';
import type {GestureSignal,PenControl} from '@/lib/whiteboard-gestures';
type UITool=Tool|'select';
const tools=[{id:'select',title:'选择元素',icon:MousePointer2},{id:'pen',title:'画笔',icon:PenLine},{id:'line',title:'线段',icon:Minus},{id:'arrow',title:'箭头',icon:ArrowUpRight},{id:'doubleArrow',title:'双向箭头',icon:MoveHorizontal},{id:'rect',title:'矩形',icon:Square},{id:'ellipse',title:'圆形',icon:Circle},{id:'triangle',title:'三角形',icon:Triangle},{id:'cuboid',title:'长方体',icon:Box},{id:'erase',title:'橡皮',icon:Eraser}] as const;
const idle:GestureSignal={mode:'none',point:null,label:'手势书写未开启',progress:0,breakStroke:true};
const shapeNames:Record<string,string>={line:'直线',rect:'矩形',ellipse:'圆形',triangle:'三角形',cuboid:'长方体'};
const isEditing=(el:Element|null)=>el instanceof Element&&el.matches('textarea,input:not([type=checkbox]):not([type=range]):not([type=color]),[contenteditable="true"]');
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export default function AIWhiteboard({context,onClose}:{context:BoardContext;onClose:()=>void}){
 const load=useRef<{board:Board;error:string}|null>(null);
 if(!load.current){try{load.current={board:readBoard(localStorage.getItem(boardKey(context.id))),error:''};}catch{load.current={board:newBoard(),error:'原有板书无法读取。当前画板可继续使用，请导出重要内容。'};}}
 const [board,setBoard]=useState(load.current.board),[saveStatus,setSaveStatus]=useState(load.current.error||'保存在此浏览器');
 const [tool,setTool]=useState<UITool>('pen'),[color,setColor]=useState<Ink>('ink'),[width,setWidth]=useState(5),[eraserSize,setEraserSize]=useState(240),[mousePoint,setMousePoint]=useState<Point|null>(null),[snap,setSnap]=useState(true);
 const [maximized,setMaximized]=useState(false),[reference,setReference]=useState(false),[shelf,setShelf]=useState(true),[help,setHelp]=useState(false),[signal,setSignal]=useState<GestureSignal>(idle),[pendingBox,setPendingBox]=useState(false),[historyCount,setHistoryCount]=useState({undo:0,redo:0});
 const [control,setControl]=useState<PenControl>(()=>{try{return localStorage.getItem('usaco-whiteboard-pen-control')==='gesture'?'gesture':'space';}catch{return 'space';}}),[spaceHeld,setSpaceHeld]=useState(false),[notice,setNotice]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null),[objectPreview,setObjectPreview]=useState<TeachingElement|null>(null);
 const boardRef=useRef(board),contextRef=useRef(context),settings=useRef({tool,color,width,snap,eraserSize,control});settings.current={tool,color,width,snap,eraserSize,control};contextRef.current=context;
 const canvas=useRef<HTMLCanvasElement>(null),paper=useRef<HTMLCanvasElement>(null),wrap=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null);
 const draft=useRef<Mark|null>(null),snapped=useRef<Mark|null>(null),box=useRef<Mark|null>(null),depthStart=useRef<Point|null>(null),source=useRef<'pointer'|'hand'|null>(null),pointer=useRef<number|null>(null);
 const history=useRef<Record<number,{past:Sheet[];future:Sheet[]}>>({}),dirty=useRef(false),drawFrame=useRef(0),mounted=useRef(true),pressed=useRef(false),cameraRunning=useRef(false),pauseTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),pauseAnchor=useRef<Point|null>(null);
 const objectDrag=useRef<{start:Point;before:TeachingElement;latest:TeachingElement;resize:boolean;pointerId:number}|null>(null),previewRef=useRef<TeachingElement|null>(null);
 const variant=useRef(Math.max(0,...load.current.board.pages.flatMap(p=>(p.objects||[]).map(o=>o.variant+1))));
 const cowVariant=useRef(Math.max(0,...load.current.board.pages.flatMap(p=>(p.objects||[]).filter(o=>o.kind==='cow').map(o=>o.variant+1))));
 const repaint=useCallback(()=>{
  if(drawFrame.current)return;drawFrame.current=requestAnimationFrame(()=>{
   drawFrame.current=0;const ctx=canvas.current?.getContext('2d'),bg=paper.current?.getContext('2d'),b=boardRef.current,s=b.pages[b.page];
   if(bg)drawPaper(bg,previewRef.current?{...s,objects:(s.objects||[]).map(o=>o.id===previewRef.current!.id?previewRef.current!:o)}:s,b.dark,contextRef.current);
   const current=draft.current;
   const preview=snapped.current||(current&&settings.current.snap?liveShape(current):current)||box.current;
   if(ctx)drawInk(ctx,s.marks,b.dark,preview);
  });
 },[]);
 const replace=useCallback((next:Board)=>{boardRef.current=next;dirty.current=true;setBoard(next);setSaveStatus('正在保存…');repaint();},[repaint]);
 const persist=useCallback(()=>{
  if(!dirty.current)return;try{localStorage.setItem(boardKey(context.id),JSON.stringify(boardRef.current));dirty.current=false;if(mounted.current)setSaveStatus('已保存到此浏览器');}catch{if(mounted.current)setSaveStatus('保存失败：浏览器空间不足或禁止存储，请导出板书');}
 },[context.id]);
 const commitSheet=useCallback((sheet:Sheet)=>{
  const b=boardRef.current,h=history.current[b.page]||{past:[],future:[]};h.past.push(b.pages[b.page]);if(h.past.length>80)h.past.shift();h.future=[];history.current[b.page]=h;setHistoryCount({undo:h.past.length,redo:0});
  const pages=[...b.pages];pages[b.page]=sheet;replace({...b,pages});
 },[replace]);
 const commit=useCallback((mark:Mark)=>{
  const b=boardRef.current,s=b.pages[b.page];if(s.marks.length>=5000){setSaveStatus('本页笔迹较多，请新建一页继续');return;}
  let marks=[...s.marks,mark];if(settings.current.snap&&mark.kind!=='clear'){
   const result=tidyRecentCuboid(marks);marks=result.marks;if(result.recognized)setNotice(`已整理为${shapeNames[marks.at(-1)!.kind]||'图形'}`);
  }
  commitSheet({...s,marks,...(mark.kind==='clear'?{objects:[]}:{} )});
 },[commitSheet]);
 const finish=useCallback((cancel=false)=>{
  clearTimeout(pauseTimer.current);pauseAnchor.current=null;const raw=draft.current,mark=snapped.current||raw;draft.current=null;snapped.current=null;source.current=null;pointer.current=null;
  if(mark&&!cancel){
   if(raw?.kind==='cuboid'&&!depthStart.current){if(distance(mark.points[0],mark.points.at(-1)!)>12){box.current=mark;setPendingBox(true);}}
   else{if(raw?.kind==='cuboid'){box.current=null;setPendingBox(false);}const final=settings.current.snap?tidyMark(mark):mark;if(final.kind!==mark.kind)setNotice(`已整理为${shapeNames[final.kind]||'图形'}`);commit(final);}
  }
  depthStart.current=null;repaint();
 },[commit,repaint]);
 const cancelBox=useCallback(()=>{clearTimeout(pauseTimer.current);pauseAnchor.current=null;draft.current=null;snapped.current=null;box.current=null;depthStart.current=null;source.current=null;pointer.current=null;setPendingBox(false);repaint();},[repaint]);
 const checkPause=useCallback((p:Point)=>{
  if(!settings.current.snap||draft.current?.kind!=='pen')return;
  if(pauseAnchor.current&&distance(p,pauseAnchor.current)<12)return;
  pauseAnchor.current=p;snapped.current=null;clearTimeout(pauseTimer.current);
  pauseTimer.current=setTimeout(()=>{
   const m=draft.current;if(!m||m.kind!=='pen'||!settings.current.snap)return;
   const shape=recognizeCuboid([m])||tidyMark(m);if(shape.kind==='pen')return;
   snapped.current=shape;setNotice(`已整理为${shapeNames[shape.kind]} · 移动可继续画`);repaint();
  },550);
 },[repaint]);
 const begin=useCallback((p:Point,origin:'pointer'|'hand',erase=false)=>{
  if(source.current||settings.current.tool==='select')return;const s=settings.current;source.current=origin;setSelectedId(null);
  if(box.current&&!erase&&s.tool==='cuboid'){depthStart.current=p;draft.current={...box.current,depth:{x:0,y:0}};}
  else{if(erase&&box.current){box.current=null;setPendingBox(false);}draft.current={kind:erase?'erase':s.tool as Tool,color:s.color,width:erase||s.tool==='erase'?s.eraserSize:s.width,points:[p],...(s.tool==='cuboid'?{depth:{x:70,y:-55}}:{})};}
  checkPause(p);repaint();
 },[repaint,checkPause]);
 const move=useCallback((p:Point)=>{
  const m=draft.current;if(!m)return;
  checkPause(p);
  if(snapped.current)return;
  if(depthStart.current&&m.kind==='cuboid')m.depth={x:Math.max(-300,Math.min(300,p.x-depthStart.current.x)),y:Math.max(-300,Math.min(300,p.y-depthStart.current.y))};
  else if(m.kind==='pen'||m.kind==='erase'){
   if(distance(m.points[m.points.length-1],p)<1.4)return;
   if(m.points.length<5800)m.points.push(p);
   else{const origin=source.current||'pointer',id=pointer.current;finish();begin(p,origin,m.kind==='erase');pointer.current=id;}
  }else m.points=[m.points[0],p];
  repaint();
 },[repaint,finish,begin,checkPause]);
 const onGesture=useCallback((s:GestureSignal)=>{
  setSignal(s);if(source.current==='pointer'||objectDrag.current)return;
  if(isEditing(document.activeElement)||settings.current.tool==='select'){if(source.current==='hand')finish();return;}
  if(s.holdStroke)return;
  if(s.breakStroke&&source.current==='hand')finish();
  // The key-up event ends ink immediately, even between camera frames.
  if(s.mode==='draw'&&settings.current.control==='space'&&!pressed.current){if(source.current==='hand')finish();return;}
  if((s.mode==='draw'||s.mode==='erase')&&s.point){if(source.current!=='hand')begin(s.point,'hand',s.mode==='erase');else move(s.point);}
  else if(source.current==='hand')finish();
 },[begin,move,finish]);
 const camera=useGestureCamera(onGesture,()=>({control:settings.current.control,pressed:pressed.current}));cameraRunning.current=camera.phase==='running';
 useEffect(()=>{repaint();const timer=setTimeout(persist,350);return()=>clearTimeout(timer);},[board,context,persist,repaint]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2200);return()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{
  mounted.current=true;const before=()=>{finish();persist();};window.addEventListener('pagehide',before);
  return()=>{mounted.current=false;finish();persist();cancelAnimationFrame(drawFrame.current);drawFrame.current=0;clearTimeout(pauseTimer.current);window.removeEventListener('pagehide',before);};
 },[finish,persist]);
 function undoMark(){
  if(draft.current||box.current){cancelBox();return;}const b=boardRef.current,h=history.current[b.page];if(!h?.past.length)return;const s=h.past.pop()!;h.future.push(b.pages[b.page]);const pages=[...b.pages];pages[b.page]=s;replace({...b,pages});setHistoryCount({undo:h.past.length,redo:h.future.length});setSelectedId(null);
 }
 function redoMark(){finish();const b=boardRef.current,h=history.current[b.page];if(!h?.future.length)return;h.past.push(b.pages[b.page]);const pages=[...b.pages];pages[b.page]=h.future.pop()!;replace({...b,pages});setHistoryCount({undo:h.past.length,redo:h.future.length});setSelectedId(null);}
 function removeObject(){if(!selectedId)return;finish();const s=boardRef.current.pages[boardRef.current.page];commitSheet({...s,objects:(s.objects||[]).filter(o=>o.id!==selectedId)});setSelectedId(null);}
 const actions=useRef({undoMark,redoMark,persist,removeObject});actions.current={undoMark,redoMark,persist,removeObject};
 useEffect(()=>{
  const release=()=>{pressed.current=false;setSpaceHeld(false);if(source.current==='hand')finish();setSignal(s=>s.mode==='draw'?{...s,mode:'hover',label:'按住空格书写'}:s);};
  const key=(e:KeyboardEvent)=>{
   if(isEditing(e.target as Element))return;
   if(e.code==='Space'&&cameraRunning.current&&settings.current.control==='space'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();pressed.current=true;setSpaceHeld(true);return;}
   if((e.target as Element)?.matches?.('select'))return;
   if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?actions.current.redoMark():actions.current.undoMark();}if(e.key.toLowerCase()==='y'){e.preventDefault();actions.current.redoMark();}if(e.key.toLowerCase()==='s'){e.preventDefault();finish();actions.current.persist();}}
   else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();actions.current.removeObject();}
  };
  const up=(e:KeyboardEvent)=>{if(e.code==='Space'){if(pressed.current)e.preventDefault();release();}};
  const visibility=()=>{if(document.hidden)release();};window.addEventListener('keydown',key);window.addEventListener('keyup',up);window.addEventListener('blur',release);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',up);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',visibility);};
 },[finish]);
 function chooseTool(t:UITool){finish();if(box.current)cancelBox();setMousePoint(null);setTool(t);if(t!=='select')setSelectedId(null);}
 function localPoint(e:{clientX:number;clientY:number}):Point{const r=canvas.current!.getBoundingClientRect();return {x:Math.max(0,Math.min(W,(e.clientX-r.left)/r.width*W)),y:Math.max(0,Math.min(H,(e.clientY-r.top)/r.height*H))};}
 function startObject(e:ReactPointerEvent<HTMLElement>,o:TeachingElement,resize=false){e.preventDefault();e.stopPropagation();finish();objectDrag.current={start:localPoint(e),before:o,latest:o,resize,pointerId:e.pointerId};setSelectedId(o.id);e.currentTarget.setPointerCapture(e.pointerId);}
 function down(e:ReactPointerEvent<HTMLCanvasElement>){
  if(!e.isPrimary||e.button!==0)return;e.preventDefault();if(source.current==='hand')finish();e.currentTarget.focus();
  if(tool==='select'){const p=localPoint(e),s=boardRef.current.pages[boardRef.current.page],hit=[...(s.objects||[])].reverse().find(o=>p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h);if(hit)startObject(e,hit);else setSelectedId(null);return;}
  begin(localPoint(e),'pointer');pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);
 }
 function update(e:ReactPointerEvent<HTMLElement>){
  const d=objectDrag.current;if(d&&e.pointerId===d.pointerId){const p=localPoint(e),dx=p.x-d.start.x,dy=p.y-d.start.y,o=d.before;let next:TeachingElement;
   if(d.resize){const factor=Math.max(Math.max(50/o.w,50/o.h),Math.min((o.w+dx)/o.w,(o.h+dy)/o.h,(W-o.x)/o.w,(H-o.y)/o.h));next={...o,w:o.w*factor,h:o.h*factor};}
   else next={...o,x:Math.max(0,Math.min(W-o.w,o.x+dx)),y:Math.max(0,Math.min(H-o.h,o.y+dy))};
   d.latest=next;previewRef.current=next;setObjectPreview(next);repaint();return;
  }
  if(tool==='erase')setMousePoint(localPoint(e));if(pointer.current===e.pointerId&&source.current==='pointer')move(localPoint(e));
 }
 function endObject(cancel=false){const d=objectDrag.current;if(!d)return;objectDrag.current=null;previewRef.current=null;setObjectPreview(null);if(!cancel&&JSON.stringify(d.latest)!==JSON.stringify(d.before)){const b=boardRef.current,s=b.pages[b.page];commitSheet({...s,objects:(s.objects||[]).map(o=>o.id===d.before.id?d.latest:o)});}repaint();}
 function up(e:ReactPointerEvent<HTMLElement>){if(objectDrag.current?.pointerId===e.pointerId){update(e);endObject();}else if(pointer.current===e.pointerId){move(localPoint(e));finish();}else return;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}
 function switchPage(page:number){finish();cancelBox();endObject();const b=boardRef.current;replace({...b,page});const h=history.current[page];setHistoryCount({undo:h?.past.length||0,redo:h?.future.length||0});setSelectedId(null);}
 function addPage(){finish();cancelBox();endObject();const b=boardRef.current;if(b.pages.length<12){replace({...b,pages:[...b.pages,newSheet()],page:b.pages.length});setHistoryCount({undo:0,redo:0});setSelectedId(null);}}
 function setPaper(value:string){finish();const b=boardRef.current;commitSheet({...b.pages[b.page],paper:value as Sheet['paper']});}
 function insertObject(kind:ElementKind,p:Point={x:W/2,y:H/2}){finish();cancelBox();const b=boardRef.current,s=b.pages[b.page];if((s.objects?.length||0)>=200){setNotice('本页元素较多，请新建一页');return;}const item=makeElement(kind,p,kind==='cow'?cowVariant.current++:variant.current++);commitSheet({...s,objects:[...(s.objects||[]),item]});setTool('select');setSelectedId(item.id);setShelf(true);canvas.current?.focus();}
 function updateObject(o:TeachingElement){const b=boardRef.current,s=b.pages[b.page];commitSheet({...s,objects:(s.objects||[]).map(v=>v.id===o.id?o:v)});}
 function duplicateObject(){const b=boardRef.current,s=b.pages[b.page],o=(s.objects||[]).find(v=>v.id===selectedId);if(!o||((s.objects?.length||0)>=200))return;const base=makeElement(o.kind,{x:0,y:0},o.kind==='cow'?cowVariant.current++:variant.current++),item={...base,label:o.kind==='cow'?base.label:o.label,values:[...o.values],w:o.w,h:o.h,x:Math.min(W-o.w,o.x+35),y:Math.min(H-o.h,o.y+35)};commitSheet({...s,objects:[...(s.objects||[]),item]});setSelectedId(item.id);}
 function exportPNG(){finish();endObject();if(box.current){commit(box.current);cancelBox();}const b=boardRef.current,output=document.createElement('canvas'),layer=document.createElement('canvas');output.width=layer.width=W;output.height=layer.height=H;const ctx=output.getContext('2d'),ink=layer.getContext('2d');if(!ctx||!ink){setSaveStatus('图片导出失败，请先保存板书');return;}drawPaper(ctx,b.pages[b.page],b.dark,context);drawInk(ink,b.pages[b.page].marks,b.dark);ctx.drawImage(layer,0,0);output.toBlob(blob=>{if(blob)download(blob,`AI白板-${context.id}-${b.page+1}.png`);else setSaveStatus('图片导出失败，请重试');},'image/png');}
 function close(){finish();endObject();if(box.current){commit(box.current);cancelBox();}camera.stop();persist();onClose();}
 const sheet=board.pages[board.page],activeCamera=['permission','loading','running'].includes(camera.phase),hasInk=sheet.marks.length>0||!!sheet.objects?.length,selected=objectPreview||(sheet.objects||[]).find(o=>o.id===selectedId)||null;
 return <DialogContent ref={panel} className={`ai-whiteboard ${board.dark?'wb-dark':''} ${maximized?'wb-maximized':''}`} showCloseButton={false} onPointerDownOutside={e=>e.preventDefault()} onEscapeKeyDown={e=>{e.preventDefault();if(help)setHelp(false);else if(objectDrag.current)endObject(true);else if(selectedId)setSelectedId(null);else if(box.current)cancelBox();else if(maximized)setMaximized(false);else close();}}>
  <header className="wb-topbar">
   <div className="wb-identity" title={context.title}><Presentation size={19}/><DialogTitle>AI白板</DialogTitle></div>
   <div className="wb-toolbar" role="toolbar" aria-label="白板工具">
    <div className="wb-tool-group wb-drawing-tools">{tools.map(t=><button key={t.id} title={t.title} aria-label={t.title} aria-pressed={tool===t.id} className={tool===t.id?'selected':''} onClick={()=>chooseTool(t.id)}><t.icon size={18}/><span>{t.title}</span></button>)}</div>
    <div className="wb-tool-group wb-colors">{(Object.keys(inks) as Ink[]).map(c=><button key={c} title={inks[c].label} aria-label={inks[c].label} aria-pressed={color===c} onClick={()=>setColor(c)} className={color===c?'selected':''}><i style={{background:inks[c][board.dark?'dark':'light']}}/>{color===c&&<Check size={12}/>}</button>)}</div>
    <select aria-label="白板笔宽" title="画笔粗细" value={width} onChange={e=>setWidth(+e.target.value)}><option value={3}>笔·细</option><option value={5}>笔·中</option><option value={9}>笔·粗</option></select>
    <select aria-label="橡皮大小" title="鼠标与手掌橡皮大小" value={eraserSize} onChange={e=>{finish();setEraserSize(+e.target.value);}}><option value={120}>橡皮·小</option><option value={240}>橡皮·大</option><option value={360}>橡皮·特大</option></select>
    <label className="wb-snap" title="画线时实时拉直；闭合图形自动整理为矩形、三角形或圆形，完整框线可整理为长方体"><input aria-label="形状整理" type="checkbox" checked={snap} onChange={e=>{snapped.current=null;setSnap(e.target.checked);repaint();}}/>整理</label>
    <select aria-label="手势落笔方式" title="空格模式：保持右手食指伸直，左手按空格落笔，松开立即抬笔" value={control} onChange={e=>{finish();pressed.current=false;setSpaceHeld(false);const value=e.target.value as PenControl;setControl(value);try{localStorage.setItem('usaco-whiteboard-pen-control',value);}catch{}canvas.current?.focus();}}><option value="space">空格落笔</option><option value="gesture">纯手势</option></select>
    <div className="wb-tool-group"><button aria-label="撤销" title="撤销 Ctrl+Z" disabled={!historyCount.undo&&!pendingBox} onClick={undoMark}><Undo2 size={18}/></button><button aria-label="重做" title="重做 Ctrl+Shift+Z" disabled={!historyCount.redo} onClick={redoMark}><Redo2 size={18}/></button><button aria-label="清空本页" title="清空笔迹和元素（可撤销）" disabled={!hasInk} onClick={()=>{cancelBox();commit({kind:'clear',points:[],color:'ink',width:1});setSelectedId(null);}}><Trash2 size={17}/></button></div>
    <select aria-label="白板底稿" title="画布底稿" value={sheet.paper} onChange={e=>setPaper(e.target.value)}><option value="plain">空白</option><option value="grid">点阵</option>{!!context.samples?.length&&<option value="sample">样例底稿</option>}</select>
    {sheet.paper==='sample'&&(context.samples?.length||0)>1&&<select aria-label="底稿样例" value={sheet.sample} onChange={e=>commitSheet({...boardRef.current.pages[boardRef.current.page],sample:+e.target.value})}>{context.samples?.map((_,i)=><option key={i} value={i}>样例 {i+1}</option>)}</select>}
    <div className="wb-tool-group"><button aria-label={board.dark?'切换白色画布':'切换深色画布'} title={board.dark?'切换白色画布':'切换深色画布'} onClick={()=>replace({...boardRef.current,dark:!board.dark})}>{board.dark?<Sun size={17}/>:<Moon size={17}/>}</button><button title={context.problemId?'题目参考':'课堂参考'} aria-label={context.problemId?'题目参考':'课堂参考'} aria-expanded={reference} className={reference?'selected':''} onClick={()=>setReference(v=>!v)}><BookOpen size={17}/></button><button aria-label="教学元素" title="教学元素" aria-expanded={shelf} className={shelf?'selected':''} onClick={()=>setShelf(v=>!v)}><Shapes size={18}/></button><button title="操作说明" aria-label="操作说明" aria-expanded={help} className={help?'selected':''} onClick={()=>setHelp(v=>!v)}><HelpCircle size={17}/></button></div>
    <div className="wb-tool-group wb-pages"><button aria-label="上一页板书" title="上一页" disabled={board.page===0} onClick={()=>switchPage(board.page-1)}><ChevronLeft size={16}/></button><span title={`第 ${board.page+1} / ${board.pages.length} 页`}>{board.page+1}/{board.pages.length}</span><button aria-label="下一页板书" title="下一页" disabled={board.page===board.pages.length-1} onClick={()=>switchPage(board.page+1)}><ChevronRight size={16}/></button><button aria-label="新一页" title="新一页（最多 12 页）" disabled={board.pages.length>=12} onClick={addPage}><Plus size={16}/></button></div>
    <div className="wb-tool-group"><button aria-label="保存" title={saveStatus+' · Ctrl+S'} onClick={()=>{finish();endObject();persist();}}><Save size={17}/></button><button aria-label="导出图片" title="导出当前页图片" onClick={exportPNG}><ArrowDownToLine size={17}/></button></div>
   </div>
   <div className="wb-window-actions"><button aria-label={activeCamera?'关闭摄像头':'开启手势书写'} className={activeCamera?'wb-camera selected':'wb-camera'} title={activeCamera?'关闭摄像头':'开启手势书写'} onClick={()=>{pressed.current=false;setSpaceHeld(false);activeCamera?camera.stop():void camera.start();}}>{activeCamera?<CameraOff size={18}/>:<Camera size={18}/>}</button>{activeCamera&&<span className="wb-camera-status" role="status" title={camera.phase==='running'?signal.label:'正在准备摄像头与手势模型'}><i className="wb-live-dot"/>{camera.phase==='permission'?'等待授权':camera.phase==='loading'?'载入模型…':signal.label}</span>}<button aria-label={maximized?'退出全屏白板':'全屏白板'} title={maximized?'退出全屏白板':'全屏白板'} onClick={()=>setMaximized(v=>!v)}>{maximized?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button><button aria-label="关闭AI白板" title="关闭AI白板" onClick={close}><X size={20}/></button></div>
  </header>
  <DialogDescription className="sr-only">{context.title}。可使用鼠标、触控笔或摄像头手势书写。板书按题目保存在当前浏览器。</DialogDescription>
  <span className="sr-only" role="status">{saveStatus}</span>
  {help&&<div className="wb-help"><button className="wb-help-close" aria-label="收起操作说明" onClick={()=>setHelp(false)}><X size={17}/></button><p><b>空格落笔（默认）</b> 右手食指保持伸直，左手按住空格书写，松开立即抬笔；右手移动到下一处再按。无需握拳。</p><p><b>纯手势</b> 先伸两指或握拳准备。伸一根食指写，伸食指和中指（V 手势）抬笔，食指不用收回。握拳也可抬笔。张掌停留半秒后移动擦除。</p><p><b>防抖与整理</b> 线条在书写时就会拉直，接近横向或竖向时自动对齐。矩形（可倾斜）、三角形、圆形在轮廓完成后整理；停住半秒可锁定预览，抬笔确认。长方体可分笔画出正面、侧面和顶面，边线齐全后规整。“整理”可关闭以保留自由笔迹。</p><p><b>标准长方体</b> 选择长方体工具，第一次拖动画正面，第二次拖动决定深度。Esc 取消。</p><p><b>教学元素</b> 从右栏拖入或点击添加。选择工具可移动元素，拖右下角缩放；标签和数值在右栏修改。橡皮只擦笔迹；选中元素后按 Delete 删除。撤销支持笔迹和元素。</p><p><b>摄像头与保存</b> 操作范围已下移，食指在摄像头画面的中下部即可覆盖画布。本机识别，不展示、不录制、不上传画面。关闭白板或切换浏览器标签后停止摄像头。自动保存到此浏览器，导出图片包含教学元素。</p></div>}
  {camera.error&&<p className="wb-error" role="alert">{camera.error}</p>}
  {(saveStatus.includes('失败')||saveStatus.includes('无法'))&&<p className="wb-save-error" role="alert">{saveStatus}</p>}
  <main className={`wb-workarea ${reference?'wb-with-reference':''}`}>
   {reference&&<aside className="wb-reference">{context.problemId?<OfficialStatement id={context.problemId} title={context.title}/>:<><h3>{context.title}</h3>{context.notes?.map((n,i)=><p key={i}>{n}</p>)}</>}{context.samples?.map((s,i)=><section key={i}><h4>样例 {i+1}</h4><label>输入</label><pre>{s.input}</pre><label>输出</label><pre>{s.output}</pre></section>)}</aside>}
   <div className="wb-stage"><div ref={wrap} className="wb-canvas-wrap" onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-usaco-element')){e.preventDefault();e.dataTransfer.dropEffect='copy';}}} onDrop={e=>{const kind=e.dataTransfer.getData('application/x-usaco-element') as ElementKind;if(elementCatalog.some(v=>v.kind===kind)){e.preventDefault();insertObject(kind,localPoint(e));}}}>
    <canvas ref={paper} width={W} height={H} aria-hidden="true"/><canvas ref={canvas} width={W} height={H} tabIndex={0} aria-label="AI白板画布" className={`wb-ink wb-tool-${tool}`} onPointerDown={down} onPointerMove={update} onPointerUp={up} onPointerLeave={()=>setMousePoint(null)} onPointerCancel={()=>{finish(true);endObject(true);}} onLostPointerCapture={()=>{if(source.current==='pointer')finish();if(objectDrag.current)endObject();}}/>
    {selected&&tool==='select'&&<div className="wb-object-selection" style={{left:`${selected.x/W*100}%`,top:`${selected.y/H*100}%`,width:`${selected.w/W*100}%`,height:`${selected.h/H*100}%`}}><span>{selected.label||elementCatalog.find(v=>v.kind===selected.kind)?.title}</span><button aria-label="调整元素大小" title="拖动调整大小" onPointerDown={e=>startObject(e,selected,true)} onPointerMove={update} onPointerUp={up} onPointerCancel={()=>endObject(true)} onLostPointerCapture={()=>endObject()}/></div>}
    {camera.phase==='running'&&signal.point&&tool!=='select'&&<div className={`wb-hand-cursor wb-cursor-${signal.mode==='draw'&&tool==='erase'?'erase':signal.mode}`} style={{left:`${signal.point.x/W*100}%`,top:`${signal.point.y/H*100}%`,width:signal.mode==='erase'||(signal.mode==='draw'&&tool==='erase')?`${eraserSize/W*100}%`:undefined}} aria-hidden="true"/>}
    {tool==='erase'&&mousePoint&&<div className="wb-hand-cursor wb-cursor-erase wb-mouse-eraser" style={{left:`${mousePoint.x/W*100}%`,top:`${mousePoint.y/H*100}%`,width:`${eraserSize/W*100}%`}} aria-hidden="true"/>}
    {!hasInk&&!pendingBox&&<div className="wb-empty"><PenLine size={30}/><span>在这里写画、推演</span><small>鼠标可直接画；右侧教学元素可拖入</small></div>}
    {pendingBox&&<div className="wb-hint"><span>正面已画好，再拖动一次设置深度</span><button onClick={()=>{if(box.current)commit(box.current);cancelBox();}}>使用当前深度</button><button aria-label="取消长方体" onClick={cancelBox}><X size={14}/></button></div>}
   </div>{notice&&<div className="wb-shape-notice" role="status">{notice}</div>}{camera.phase==='running'&&<div className={`wb-pen-state ${spaceHeld?'is-writing':''}`}>{tool==='select'?'选择模式 · 用鼠标移动元素':control==='space'?spaceHeld?'正在书写 · 松开空格抬笔':'按住空格写 · 松开抬笔':'食指写 · 两指抬笔 · 张掌擦除'}</div>}</div>
   {shelf&&<WhiteboardShelf dark={board.dark} selected={selected} onInsert={insertObject} onUpdate={updateObject} onDelete={removeObject} onDuplicate={duplicateObject} onClose={()=>setShelf(false)}/>}
  </main>
 </DialogContent>;
}
