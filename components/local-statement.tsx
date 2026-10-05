'use client';
import {useEffect,useRef} from 'react';
import 'katex/dist/katex.min.css';
import renderMath from 'katex/contrib/auto-render';
export function LocalStatement({html}:{html:string}){
 const node=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(node.current)renderMath(node.current,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false,trust:false,maxExpand:1000,strict:'ignore'});},[html]);
 return <div ref={node} className="local-statement-body" dangerouslySetInnerHTML={{__html:html}}/>;
}
