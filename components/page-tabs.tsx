'use client';
import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {BookOpen,Plus,X,ChevronDown,Route,Code2,Box,Library,Timer,BookMarked,Database,FileText,Layers} from 'lucide-react';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
export type PageTab = {key:string;page:string;label:string;problemId?:number};

const pageIcons:Record<string,typeof BookOpen>={route:Route,python:Code2,classroom:Box,library:Library,exam:Timer,review:BookMarked,sources:Database,practice:FileText};
const openable=[['library','选择另一道题'],['route','学习路线'],['python','Python 基础'],['classroom','算法课堂'],['review','错题与笔记'],['exam','模拟考试'],['sources','考点与来源']] as const;
const MORE_WIDTH=92,GAP=4;

function TabIcon({page}:{page:string}){const Icon=pageIcons[page]||BookOpen;return <Icon size={14}/>;}

/** Browser-style page tabs. Tabs that do not fit are collected into a "更多" overflow menu; the active tab always stays visible. */
export function PageTabs({tabs,active,onSelect,onClose,onOpen,leading,trailing,tools}:{tabs:PageTab[];active:string;onSelect:(tab:PageTab)=>void;onClose:(key:string)=>void;onOpen:(page:string)=>void;leading?:ReactNode;trailing?:ReactNode;tools?:ReactNode}) {
 const strip=useRef<HTMLDivElement>(null),measure=useRef<HTMLDivElement>(null);
 const [visibleKeys,setVisibleKeys]=useState<string[]>(()=>tabs.map(t=>t.key));
 useLayoutEffect(()=>{
  const host=strip.current,probe=measure.current;if(!host||!probe)return;
  const compute=()=>{
   const avail=host.clientWidth;
   const widths=new Map<string,number>();
   probe.querySelectorAll<HTMLElement>('[data-tab-key]').forEach(el=>widths.set(el.dataset.tabKey!,el.offsetWidth+GAP));
   const total=tabs.reduce((s,t)=>s+(widths.get(t.key)||0),0);
   if(total<=avail){setVisibleKeys(tabs.map(t=>t.key));return;}
   const budget=avail-MORE_WIDTH;
   const keep=new Set<string>();let used=0;
   const activeTab=tabs.find(t=>t.key===active);
   if(activeTab){keep.add(activeTab.key);used+=widths.get(activeTab.key)||0;}
   for(const t of tabs){if(keep.has(t.key))continue;const w=widths.get(t.key)||0;if(used+w>budget)break;keep.add(t.key);used+=w;}
   setVisibleKeys(tabs.filter(t=>keep.has(t.key)).map(t=>t.key));
  };
  compute();
  const ro=new ResizeObserver(compute);ro.observe(host);
  return()=>ro.disconnect();
 },[tabs,active]);
 const visible=tabs.filter(t=>visibleKeys.includes(t.key)),hidden=tabs.filter(t=>!visibleKeys.includes(t.key));
 const tab=(t:PageTab,probe=false)=><div key={t.key} data-tab-key={probe?t.key:undefined} className={`lx-ptab ${active===t.key?'is-active':''}`} role={probe?undefined:'presentation'}>
  <button type="button" role={probe?undefined:'tab'} aria-selected={probe?undefined:active===t.key} tabIndex={probe?-1:undefined} className="lx-ptab-main" onClick={()=>onSelect(t)} title={t.label}><TabIcon page={t.page}/><span>{t.label}</span></button>
  <button type="button" tabIndex={probe?-1:undefined} className="lx-ptab-close" aria-label={`关闭 ${t.label}`} title="关闭页签，草稿仍保留" onClick={()=>onClose(t.key)}><X size={12}/></button>
 </div>;
 return <div className="page-tabbar lx-tabbar">
  {leading}
  <div className="lx-tabstrip" ref={strip}>
   <div className="lx-tabs" role="tablist" aria-label="已打开的页面">{visible.map(t=>tab(t))}</div>
   {hidden.length>0&&<DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="lx-tabs-more" aria-label={`另外 ${hidden.length} 个页面`} title="查看收起的页面"><Layers size={13}/><span>更多</span><b>{hidden.length}</b><ChevronDown size={12}/></button></DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="lx-tabs-menu">
     <DropdownMenuLabel>收起的页面 · {hidden.length}</DropdownMenuLabel>
     {hidden.map(t=><DropdownMenuItem key={t.key} onSelect={()=>onSelect(t)} className="lx-tabs-menu-item"><TabIcon page={t.page}/><span>{t.label}</span><button type="button" aria-label={`关闭 ${t.label}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.preventDefault();e.stopPropagation();onClose(t.key);}}><X size={12}/></button></DropdownMenuItem>)}
     <DropdownMenuSeparator/>
     <DropdownMenuItem onSelect={()=>hidden.forEach(t=>onClose(t.key))} className="lx-tabs-menu-danger">关闭这些页面</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu>}
   <div className="lx-tabs-probe" ref={measure} aria-hidden="true">{tabs.map(t=>tab(t,true))}</div>
  </div>
  <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="lx-tabs-add" aria-label="打开页面" title="打开新页面"><Plus size={15}/></button></DropdownMenuTrigger><DropdownMenuContent align="end">{openable.map(([page,label])=><DropdownMenuItem key={page} onSelect={()=>onOpen(page)}><TabIcon page={page}/>{label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
  <div className="lx-toolbox">{tools}{trailing}</div>
 </div>;
}
