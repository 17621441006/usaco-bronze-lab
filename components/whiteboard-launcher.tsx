'use client';
import {lazy,Suspense,useState} from 'react';
import {Presentation} from 'lucide-react';
import {Button} from './ui/button';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import type {BoardContext} from '@/lib/whiteboard';
const Whiteboard=lazy(()=>import('./ai-whiteboard'));
export function WhiteboardLauncher({context}:{context:BoardContext}){
 const [open,setOpen]=useState(false);
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="whiteboard-launcher"><Presentation size={16}/>AI白板</Button></DialogTrigger>{open&&<Suspense fallback={<DialogContent><DialogTitle>AI白板</DialogTitle><DialogDescription>正在打开画板…</DialogDescription></DialogContent>}><Whiteboard key={context.id} context={context} onClose={()=>setOpen(false)}/></Suspense>}</Dialog>;
}
