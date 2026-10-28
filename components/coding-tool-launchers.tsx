'use client';
import {Code2,Terminal} from 'lucide-react';
export type CodingTool='shell'|'editor';
export function CodingToolLaunchers(){
 const open=(tool:CodingTool)=>window.dispatchEvent(new CustomEvent('usaco-open-coding-tool',{detail:tool}));
 return <div className="lx-tool-group" role="group" aria-label="编程工具">
  <button type="button" className="lx-tool lx-tool-shell" aria-label="打开 Python Shell" title="Python Shell：逐行执行语句，保留会话变量" onClick={()=>open('shell')}><span className="lx-tool-ico"><Terminal size={14}/></span><span className="lx-tool-text">Shell</span></button>
  <button type="button" className="lx-tool lx-tool-editor" aria-label="打开独立代码编辑器" title="代码编辑器：新建、运行和保存代码文件" onClick={()=>open('editor')}><span className="lx-tool-ico"><Code2 size={14}/></span><span className="lx-tool-text">代码编辑器</span></button>
 </div>;
}
