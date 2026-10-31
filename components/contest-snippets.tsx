'use client';
import {useRef,useState} from 'react';
import {Popover} from 'radix-ui';
import {X,Search,Plus} from 'lucide-react';
import {contestSnippets} from '@/data/contest-snippets';

export function ContestSnippets({language,theme,portalContainer,onInsert,onClose}:{language:string;theme:string;portalContainer?:HTMLElement|null;onInsert:(code:string)=>void;onClose:()=>void}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('全部'),[selected,setSelected]=useState('tokens');
 const search=useRef<HTMLInputElement>(null),isPython=language!=='cpp';
 const matches=contestSnippets.filter(s=>(category==='全部'||s.category===category)&&`${s.title} ${s.note} ${isPython?s.pythonBadge||'':''} ${s.python} ${s.cpp}`.toLowerCase().includes(query.toLowerCase()));
 const item=matches.find(s=>s.id===selected)||matches[0],code=item?.[isPython?'python':'cpp'];
 return <Popover.Portal container={portalContainer}>
  <Popover.Content className={`contest-snippets snippets-${theme}`} aria-label="竞赛常用语句" align="end" sideOffset={8} collisionPadding={12}
   onOpenAutoFocus={event=>{event.preventDefault();search.current?.focus({preventScroll:true});}}
   onCloseAutoFocus={event=>event.preventDefault()}
   onEscapeKeyDown={event=>{event.stopPropagation();onClose();}}>
   <header><strong>常用语句 · {isPython?'Python 3':'C++17'}</strong><button type="button" onClick={onClose} aria-label="关闭常用语句"><X size={17}/></button></header>
   <label className="snippet-search"><Search size={15}/><input ref={search} aria-label="搜索常用语句" placeholder="搜索 read、input、排序、计数…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <select aria-label="语句分类" value={category} onChange={e=>setCategory(e.target.value)}>{['全部',...new Set(contestSnippets.map(s=>s.category))].map(c=><option key={c}>{c}</option>)}</select>
   <div className="snippet-options" role="listbox" aria-label="选择代码片段">{matches.map(s=><button type="button" role="option" aria-selected={s.id===item?.id} key={s.id} onClick={()=>setSelected(s.id)} onDoubleClick={()=>onInsert(s[isPython?'python':'cpp'])} title="双击插入光标位置"><span className="snippet-option-label">{s.title}{isPython&&s.pythonBadge&&<span className="snippet-badge">{s.pythonBadge}</span>}</span><small>{s.category}</small></button>)}{!matches.length&&<p>没有匹配的语句</p>}</div>
   {item&&<div className="snippet-preview"><pre>{code}</pre><p>{!isPython&&item.cppNote?item.cppNote:item.note}</p><small>{isPython?'按题意调整变量名；已有 import sys 时无需重复导入。':'按题意调整变量名。C++ 片段需自行补齐头文件。'}</small><button type="button" className="snippet-insert" onClick={()=>onInsert(code!)}><Plus size={15}/>插入光标位置</button></div>}
  </Popover.Content>
 </Popover.Portal>;
}
