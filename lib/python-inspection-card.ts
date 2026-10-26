import type * as Monaco from 'monaco-editor';
import {issuePreview,type InspectionSnapshot,type PythonIssue} from './python-diagnostics';

// Interactive advice is a persistent card, not a timed Monaco tooltip. Leaving
// the marked text (or crossing another line) must never cancel an intended click.
export function attachInspectionCard(editor:Monaco.editor.IStandaloneCodeEditor,m:typeof Monaco,host:HTMLElement,getSnapshot:()=>{snapshot:InspectionSnapshot;revision:number}|null,onAction:(id:string,revision:number,apply:boolean)=>void){
 let card:HTMLElement|null=null,pending:ReturnType<typeof setTimeout>|undefined,pendingId='',active:{id:string;revision:number;canApply:boolean}|null=null,consumed='';
 const cancelPending=()=>{clearTimeout(pending);pending=undefined;pendingId='';};
 const close=()=>{cancelPending();card?.remove();card=null;active=null;};
 function at(position:Monaco.IPosition|null){
  const state=getSnapshot();
  if(!state||!position)return null;
  const issues=state.snapshot.issues.filter(d=>!d.dismissed&&new m.Range(d.range.startLineNumber,d.range.startColumn,d.range.endLineNumber,Math.max(d.range.endColumn,d.range.startColumn+1)).containsPosition(position));
  return issues.length?{...state,issues}:null;
 }
 function act(apply:boolean){if(!active)return;const {id,revision}=active;close();onAction(id,revision,apply);}
 function show(issue:PythonIssue,revision:number,source:string,index:number,total:number,choose:(index:number)=>void){
  close();
  const anchor=editor.getScrolledVisiblePosition({lineNumber:issue.range.startLineNumber,column:issue.range.startColumn}),editorNode=editor.getDomNode();
  if(!anchor||!editorNode)return;
  const node=document.createElement('section');card=node;active={id:issue.id,revision,canApply:!!issue.fix};
  node.className='python-inspection-card';node.setAttribute('role','dialog');node.setAttribute('aria-label','代码修改建议');
  const el=(tag:string,text:string,parent:HTMLElement=node)=>{const child=document.createElement(tag);child.textContent=text;parent.appendChild(child);return child;};
  const button=(text:string,label:string,parent:HTMLElement,fn:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label);b.onclick=fn;parent.appendChild(b);return b;};
  const header=el('header','');el('strong',`${issue.severity==='style'?'PEP 8 提醒':issue.severity==='error'?'代码错误':'代码提醒'} · ${issue.title}`,header);
  button('×','关闭修改建议',header,()=>{close();editor.focus();});
  el('small',`${issue.code} · 第 ${issue.range.startLineNumber} 行 · Esc 关闭`);
  const actions=el('div','');actions.className='inspection-card-actions';
  if(issue.fix)button(`${issue.fix.title} · Y`,'采纳建议',actions,()=>act(true)).className='inspection-accept';
  button('忽略 · N','忽略建议',actions,()=>act(false));
  if(total>1){button('‹','上一条建议',actions,()=>choose((index+total-1)%total));el('span',`${index+1}/${total}`,actions);button('›','下一条建议',actions,()=>choose((index+1)%total));}
  const body=el('div','');body.className='inspection-card-body';el('p',issue.reason,body);el('p',`建议：${issue.suggestion}`,body);
  if(issue.fix){el('small','修改后预览',body);el('pre',issuePreview(issue,source),body);}
  node.addEventListener('wheel',event=>event.stopPropagation());
  host.appendChild(node);node.dispatchEvent(new Event('usaco-inspection-open',{bubbles:true}));
  const bounds=editorNode.getBoundingClientRect(),viewportWidth=document.documentElement.clientWidth,viewportHeight=window.innerHeight;
  const x=bounds.left+anchor.left,y=bounds.top+anchor.top+anchor.height+6;
  node.style.left=`${Math.max(12,Math.min(x,viewportWidth-node.offsetWidth-12))}px`;
  node.style.top=`${Math.max(12,Math.min(y,viewportHeight-node.offsetHeight-12))}px`;
 }
 function open(position:Monaco.IPosition|null){const state=at(position);if(!state)return;const choose=(index:number)=>show(state.issues[index],state.revision,state.snapshot.source,index,state.issues.length,choose);choose(0);}
 const subscriptions=[
  editor.onMouseMove(event=>{if(card)return;const position=event.target.position,state=at(position);if(!state){cancelPending();return;}if(pendingId===state.issues[0].id)return;cancelPending();pendingId=state.issues[0].id;pending=setTimeout(()=>open(position),350);}),
  editor.onMouseLeave(()=>{if(!card)cancelPending();}),
  editor.onMouseDown(event=>{if(event.event.leftButton)open(event.target.position);}),
  editor.onDidChangeModelContent(close),editor.onDidChangeModel(close),editor.onDidScrollChange(close),editor.onDidLayoutChange(close),
 ];
 const outside=(event:Event)=>{if(!card?.contains(event.target as Node))close();};
 const scroll=(event:Event)=>{if(!card?.contains(event.target as Node))close();};
 const otherCard=(event:Event)=>{if(event.target!==card)close();};
 const key=(event:KeyboardEvent)=>{
  if(event.repeat&&consumed===event.key.toLowerCase()){event.preventDefault();event.stopImmediatePropagation();return;}
  if(!card||!card.getClientRects().length||event.defaultPrevented||event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
  const focused=document.activeElement;
  if(!editor.hasTextFocus()&&!card.contains(focused))return;
  const k=event.key.toLowerCase();
  if(k==='escape'){event.preventDefault();event.stopImmediatePropagation();close();editor.focus();}
  else if(!event.repeat&&(k==='n'||(k==='y'&&active?.canApply))){consumed=k;event.preventDefault();event.stopImmediatePropagation();act(k==='y');}
 };
 const release=()=>{consumed='';};
 document.addEventListener('pointerdown',outside,true);document.addEventListener('scroll',scroll,true);document.addEventListener('usaco-inspection-open',otherCard);
 document.addEventListener('keydown',key,true);document.addEventListener('keyup',release,true);window.addEventListener('resize',close);
 return {close,dispose(){close();subscriptions.forEach(s=>s.dispose());document.removeEventListener('pointerdown',outside,true);document.removeEventListener('scroll',scroll,true);document.removeEventListener('usaco-inspection-open',otherCard);document.removeEventListener('keydown',key,true);document.removeEventListener('keyup',release,true);window.removeEventListener('resize',close);}};
}
