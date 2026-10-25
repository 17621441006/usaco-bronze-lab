'use client';
import {useEffect,useRef,useState,useMemo} from 'react';
import {normalizePythonDiagnostics,type InspectionSnapshot,type PythonIssue} from '@/lib/python-diagnostics';
export type InspectionState='idle'|'loading'|'checking'|'ready'|'unavailable'|'unsupported';
export function usePythonInspection(file:string,source:string,enabled:boolean){
 const [snapshot,setSnapshot]=useState<InspectionSnapshot|null>(null),[state,setState]=useState<InspectionState>('idle'),[message,setMessage]=useState(''),[retry,setRetry]=useState(0),[dismissed,setDismissed]=useState<Set<string>>(new Set());
 const worker=useRef<Worker|null>(null),request=useRef(0),loaded=useRef(false);
 useEffect(()=>()=>{request.current++;worker.current?.terminate();worker.current=null;},[]);
 useEffect(()=>{
  const id=++request.current;let timer:ReturnType<typeof setTimeout>|undefined;setSnapshot(null);setDismissed(new Set());setMessage('');
  if(!enabled){setState(file.endsWith('.cpp')?'unsupported':'idle');return;}
  if(!source.trim()){setSnapshot({file,source,issues:[]});setState('ready');return;}
  setState(loaded.current?'checking':'loading');
  const debounce=setTimeout(()=>{
   try{
    if(!worker.current)worker.current=new Worker('/python-lint/worker.js',{type:'module',name:'usaco-python-inspection'});
    const w=worker.current;
    const fail=(text:string)=>{if(id!==request.current)return;clearTimeout(timer);w.terminate();if(worker.current===w)worker.current=null;loaded.current=false;setState('unavailable');setMessage(text);};
    w.onmessage=({data})=>{if(data.id!==id||id!==request.current)return;clearTimeout(timer);if(data.type==='error'){fail(data.error);return;}if(data.type!=='result')return;try{const issues=normalizePythonDiagnostics(data.diagnostics,source,data.formatted);loaded.current=true;setSnapshot({file,source,issues});setState('ready');if(data.diagnostics.length>160)setMessage('问题较多，仅展示优先级最高的 160 项。');}catch{fail('检查结果无法读取，请重试。');}};
    w.onerror=()=>fail('即时检查加载失败；仍可编辑和运行，请重试检查。');
    timer=setTimeout(()=>fail('即时检查响应超时；仍可编辑和运行，请重试检查。'),20000);
    w.postMessage({id,code:source});
   }catch{setState('unavailable');setMessage('浏览器未能启动即时检查，请重试。');}
  },400);
  return()=>{clearTimeout(debounce);clearTimeout(timer);request.current++;};
 },[file,source,enabled,retry]);
 const issues:PythonIssue[]=useMemo(()=>snapshot?.file===file&&snapshot.source===source?snapshot.issues.map(issue=>({...issue,dismissed:dismissed.has(issue.id)})):[],[snapshot,file,source,dismissed]);
 const currentSnapshot=useMemo(()=>snapshot?.file===file&&snapshot.source===source?{...snapshot,issues}:null,[snapshot,file,source,issues]);
 return {snapshot:currentSnapshot,state,message,issues,visibleIssues:issues.filter(d=>d.severity==='error'||!d.dismissed),dismissedCount:dismissed.size,dismiss:(id:string)=>setDismissed(s=>new Set([...s,id])),restore:()=>setDismissed(new Set()),recheck:()=>setRetry(v=>v+1)};
}
