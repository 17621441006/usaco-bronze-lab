'use client';
import {useEffect,useState} from 'react';

// Keep Monaco popovers outside scroll/overflow containers, including native fullscreen.
export function useEditorOverlays(theme:string,visible:boolean){
 const [node,setNode]=useState<HTMLDivElement|null>(null);
 useEffect(()=>{
  const el=document.createElement('div');
  const place=()=>{(document.fullscreenElement||document.querySelector('.statement-fullscreen')||document.body).appendChild(el);};
  place();setNode(el);document.addEventListener('fullscreenchange',place);window.addEventListener('usaco-reader-change',place);
  return()=>{document.removeEventListener('fullscreenchange',place);window.removeEventListener('usaco-reader-change',place);el.remove();};
 },[]);
 useEffect(()=>{if(node){node.className=`monaco-editor usaco-editor-overlays ${theme==='dark'?'vs-dark':'vs'}`;node.style.display=visible?'':'none';}},[node,theme,visible]);
 return node;
}
