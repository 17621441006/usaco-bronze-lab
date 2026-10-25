'use client';
import {Code2,Terminal} from 'lucide-react';
import {Button} from '@/components/ui/button';
export type CodingTool='shell'|'editor';
export function CodingToolLaunchers(){
 const open=(tool:CodingTool)=>window.dispatchEvent(new CustomEvent('usaco-open-coding-tool',{detail:tool}));
 return <div className="coding-tool-launchers"><Button variant="ghost" size="sm" aria-label="打开 Python Shell" title="执行 Python 语句，保留会话变量" onClick={()=>open('shell')}><Terminal size={16}/><span>Shell</span></Button><Button variant="ghost" size="sm" aria-label="打开独立代码编辑器" title="新建、运行和保存代码文件" onClick={()=>open('editor')}><Code2 size={16}/><span>代码编辑器</span></Button></div>;
}
