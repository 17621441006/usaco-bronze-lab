'use client';
import {useEffect,useRef,useState} from 'react';
import {Copy,Trash2,X,Minus,Plus} from 'lucide-react';
import {drawElement,elementCatalog,makeElement,type ElementKind,type TeachingElement} from '@/lib/whiteboard-elements';
function Thumbnail({kind,dark}:{kind:ElementKind;dark:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;const item=makeElement(kind,{x:800,y:450},kind==='cow'?2:0);ctx.clearRect(0,0,240,140);const scale=Math.min(218/item.w,120/item.h);ctx.save();ctx.translate((240-item.w*scale)/2,(140-item.h*scale)/2);ctx.scale(scale,scale);drawElement(ctx,{...item,x:0,y:0},dark);ctx.restore();},[kind,dark]);
 return <canvas ref={canvas} width={240} height={140} aria-hidden="true"/>;
}
export function WhiteboardShelf({dark,selected,onInsert,onUpdate,onDelete,onDuplicate,onClose}:{dark:boolean;selected:TeachingElement|null;onInsert:(kind:ElementKind)=>void;onUpdate:(element:TeachingElement)=>void;onDelete:()=>void;onDuplicate:()=>void;onClose:()=>void}){
 const [label,setLabel]=useState(''),[values,setValues]=useState(''),[groupFilter,setGroupFilter]=useState('全部');
 const entry=elementCatalog.find(e=>e.kind===selected?.kind),groups=[...new Set(elementCatalog.map(e=>e.group))];
 useEffect(()=>{setLabel(selected?.label||'');setValues(selected?.values.join(entry?.rows?'\n':', ')||'');},[selected?.id,selected?.label,selected?.values,entry?.rows]);
 const data=selected&&!!entry?.maxValues;
 function resize(factor:number){if(!selected)return;const f=Math.min(factor,1600/selected.w,900/selected.h);onUpdate({...selected,w:Math.max(60,selected.w*f),h:Math.max(60,selected.h*f),x:Math.min(selected.x,1600-selected.w*f),y:Math.min(selected.y,900-selected.h*f)});}
 return <aside className="wb-elements" aria-label="教学元素">
  <div className="wb-shelf-heading"><strong>教学元素</strong><button aria-label="收起教学元素" title="收起教学元素" onClick={onClose}><X size={16}/></button></div>
  <p className="wb-shelf-caption">拖入画布，或点一下添加</p>
  {selected&&<section className="wb-element-editor" aria-label="编辑教学元素">
   <div className="wb-element-actions"><b>{elementCatalog.find(e=>e.kind===selected.kind)?.title}</b><button aria-label="缩小选中元素" title="缩小" onClick={()=>resize(.9)}><Minus size={15}/></button><button aria-label="放大选中元素" title="放大" onClick={()=>resize(1.1)}><Plus size={15}/></button><button aria-label="复制选中元素" title="复制" onClick={onDuplicate}><Copy size={15}/></button><button aria-label="删除选中元素" title="删除" onClick={onDelete}><Trash2 size={15}/></button></div>
   <form onSubmit={e=>{e.preventDefault();onUpdate({...selected,label:label.trim().slice(0,80),values:data?values.split(entry?.rows?/[\n]+/:/[\n,，]+/).map(v=>v.trim().slice(0,80)).filter(Boolean).slice(0,entry?.maxValues):selected.values});}}>
    <label>标签<input aria-label="元素标签" maxLength={80} value={label} onChange={e=>setLabel(e.target.value)}/></label>
    {data&&<label>{entry?.rows?'内容（每项一行）':'内容（逗号分隔）'}<textarea aria-label="元素数据" aria-describedby="wb-element-edit-hint" rows={entry?.rows?4:2} maxLength={1500} value={values} onChange={e=>setValues(e.target.value)}/><small id="wb-element-edit-hint">{entry?.editHint}</small></label>}
    <button className="wb-apply" type="submit">应用修改</button>
   </form>
  </section>}
  <select className="wb-shelf-filter" aria-label="筛选教学元素" value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}><option value="全部">全部元素 · {elementCatalog.length}</option>{groups.map(group=><option key={group}>{group}</option>)}</select>
  {groups.filter(group=>groupFilter==='全部'||group===groupFilter).map(group=><section className="wb-shelf-group" key={group}><h3>{group}</h3><div className="wb-element-grid">{elementCatalog.filter(e=>e.group===group).map(item=><button key={item.kind} className="wb-element-card" draggable aria-label={`添加${item.title}`} title={item.description} onClick={()=>onInsert(item.kind)} onDragStart={e=>{e.dataTransfer.setData('application/x-usaco-element',item.kind);e.dataTransfer.effectAllowed='copy';}}><Thumbnail kind={item.kind} dark={dark}/><span>{item.title}</span></button>)}</div></section>)}
 </aside>;
}
