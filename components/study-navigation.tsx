'use client';
import {useEffect,useRef,useState} from 'react';
import {Code2,Route,Library,Box,Timer,BookMarked,Database,LockKeyhole} from 'lucide-react';
import {Sidebar,SidebarHeader,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupLabel,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarTrigger,useSidebar} from './ui/sidebar';
const items=[['route','学习路线',Route],['python','Python 基础',Code2],['classroom','算法课堂',Box],['library','真题练习',Library],['exam','模拟考试',Timer],['review','错题与笔记',BookMarked],['sources','考点与来源',Database]] as const;
const groups=[{title:'学习',keys:['route','python','classroom']},{title:'训练与复盘',keys:['library','exam','review']},{title:'资料',keys:['sources']}];
export function StudyNavigation({page,wrong,onNavigate}:{page:string;wrong:number;onNavigate:(page:string)=>void}){
 const {open,isMobile,setOpenMobile}=useSidebar(),[peek,setPeek]=useState(false),delay=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),inside=useRef(false),suppress=useRef(false);
 useEffect(()=>{setPeek(false);return()=>clearTimeout(delay.current);},[open,page]);
 function enter(){inside.current=true;clearTimeout(delay.current);if(!open&&!suppress.current)delay.current=setTimeout(()=>setPeek(true),100);}
 function leave(){inside.current=false;suppress.current=false;clearTimeout(delay.current);delay.current=setTimeout(()=>setPeek(false),180);}
 function navigate(dest:string){clearTimeout(delay.current);setPeek(false);setOpenMobile(false);onNavigate(dest);}
 return <Sidebar collapsible="icon" peek={peek} className={`study-sidebar ${peek?'nav-peek':''}`} data-peekable={!open} onPointerEnter={e=>{if(e.pointerType!=='touch')enter();}} onPointerLeave={e=>{if(e.pointerType!=='touch')leave();}} onFocusCapture={()=>{if(!open&&!suppress.current)setPeek(true);}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&!inside.current)leave();}}>
  <SidebarHeader><div className="nav-brand-row"><a className="brand" href="#route" onClick={e=>{e.preventDefault();navigate('route');}} aria-label="返回学习路线"><img src="/brand/usaco-logo.png" width="900" height="130" alt="USA Computing Olympiad"/><span className="brand-lab">LAB <span>铜组升银组</span></span></a><SidebarTrigger aria-label={isMobile?'关闭导航':open?'收起导航':'固定展开导航'} title={open?'收起导航；靠近左侧可临时展开':'固定展开导航'} onClick={()=>{suppress.current=true;setPeek(false);}}/></div></SidebarHeader>
  <SidebarContent>{groups.map(group=><SidebarGroup key={group.title} className="learning-nav-group"><SidebarGroupLabel>{group.title}</SidebarGroupLabel><SidebarMenu>{items.filter(([key])=>group.keys.includes(key)).map(([key,label,Icon])=><SidebarMenuItem key={key}><SidebarMenuButton isActive={page===key||(key==='library'&&page==='practice')} onClick={()=>navigate(key)} tooltip={peek?undefined:label}><Icon/><span>{label}</span>{key==='review'&&wrong>0&&<small>{wrong}</small>}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>)}<SidebarGroup className="nav-reserved"><SidebarGroupLabel>进阶路线</SidebarGroupLabel>{['Silver 银组','Gold 金组','Platinum 铂金组'].map(x=><div className="reserved" key={x}><span>{x}</span><LockKeyhole size={12}/><small>规划中</small></div>)}</SidebarGroup></SidebarContent>
  <SidebarFooter><div className="sidebar-source"><b>Bronze → Silver</b><small>非官方学习平台 · 不含 US Open</small></div></SidebarFooter>
 </Sidebar>;
}
