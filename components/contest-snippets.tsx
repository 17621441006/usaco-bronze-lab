'use client';
import {useState} from 'react';
import {X,Search,Plus} from 'lucide-react';
import {contestSnippets} from '@/data/contest-snippets';
export function ContestSnippets({language,onInsert,onClose}:{language:string;onInsert:(code:string)=>void;onClose:()=>void}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('全部'),[selected,setSelected]=useState('ints');
 const matches=contestSnippets.filter(s=>(category==='全部'||s.category===category)&&`${s.title} ${s.note} ${s.python} ${s.cpp}`.toLowerCase().includes(query.toLowerCase()));
 const item=matches.find(s=>s.id===selected)||matches[0],code=item?.[language==='cpp'?'cpp':'python'];
 return <aside className="contest-snippets" aria-label="竞赛常用语句"><header><strong>常用语句 · {language==='cpp'?'C++17':'Python 3'}</strong><button onClick={onClose} aria-label="关闭常用语句"><X size={17}/></button></header><label className="snippet-search"><Search size={15}/><input autoFocus aria-label="搜索常用语句" placeholder="搜索 input、排序、计数…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="语句分类" value={category} onChange={e=>setCategory(e.target.value)}>{['全部',...new Set(contestSnippets.map(s=>s.category))].map(c=><option key={c}>{c}</option>)}</select><div className="snippet-options" role="listbox" aria-label="选择代码片段">{matches.map(s=><button role="option" aria-selected={s.id===item?.id} key={s.id} onClick={()=>setSelected(s.id)}><span>{s.title}</span><small>{s.category}</small></button>)}{!matches.length&&<p>没有匹配的语句</p>}</div>{item&&<div className="snippet-preview"><pre>{code}</pre><p>{item.note}</p><small>按题意调整变量名。C++ 片段需自行补齐头文件。</small><button className="snippet-insert" onClick={()=>onInsert(code!)}><Plus size={15}/>插入光标位置</button></div>}</aside>;
}
