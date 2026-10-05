'use client';
import { BookOpen, Plus, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
export type PageTab = {key:string;page:string;label:string;problemId?:number};
export function PageTabs({tabs,active,onSelect,onClose,onOpen}:{tabs:PageTab[];active:string;onSelect:(tab:PageTab)=>void;onClose:(key:string)=>void;onOpen:(page:string)=>void}) {
 return <div className="page-tabbar"><Tabs value={active} onValueChange={key=>{const tab=tabs.find(t=>t.key===key);if(tab)onSelect(tab);}}><TabsList variant="line" aria-label="已打开的页面">{tabs.map(tab=><div key={tab.key} className={'page-tab-item '+(active===tab.key?'active':'')}><TabsTrigger value={tab.key}><BookOpen size={15}/><span>{tab.label}</span></TabsTrigger><button type="button" className="page-tab-close" aria-label={`关闭 ${tab.label}`} title="关闭页签，草稿仍保留" onClick={()=>onClose(tab.key)}><X size={13}/></button></div>)}</TabsList></Tabs><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="new-page-button"><Plus size={16}/><span>打开页面</span></Button></DropdownMenuTrigger><DropdownMenuContent align="start">{[['library','选择另一道题'],['route','学习路线'],['python','Python 基础'],['classroom','算法课堂'],['review','错题与笔记'],['exam','模拟考试'],['sources','考点与来源']].map(([page,label])=><DropdownMenuItem key={page} onSelect={()=>onOpen(page)}>{label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>;
}
