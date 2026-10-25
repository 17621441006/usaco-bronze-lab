import type * as Monaco from 'monaco-editor';
import {issuePreview,type InspectionSnapshot,type PythonIssue} from './python-diagnostics';
let serial=0;
const owner='usaco-python-inspection';
const escaped=(text:string)=>text.replace(/[\\`*_{}[\]()#+.!<>|]/g,'\\$&');
export function attachPythonInspection(editor:Monaco.editor.IStandaloneCodeEditor,m:typeof Monaco,onDismiss:(id:string)=>void,hoverHost?:HTMLElement|null){
 let snapshot:InspectionSnapshot|null=null,uri='',revision=0,disposed=false;
 const suffix=++serial,accept=`usaco.inspection.accept.${suffix}`,dismiss=`usaco.inspection.dismiss.${suffix}`;
 const clear=()=>{if(uri){const model=m.editor.getModel(m.Uri.parse(uri));if(model&&!model.isDisposed())m.editor.setModelMarkers(model,owner,[]);}};
 function current(){const model=editor.getModel();return !disposed&&snapshot&&model?.uri.toString()===uri&&model.getValue()===snapshot.source?model:null;}
 function action(id:string,version:number,apply:boolean){
  const model=current(),issue=snapshot?.issues.find(d=>d.id===id);if(!model||!issue||version!==revision)return;
  if(!apply){onDismiss(id);void editor.getAction?.('editor.action.hideHover')?.run();editor.focus();return;}
  if(!issue.fix||issue.dismissed)return;
  void editor.getAction?.('editor.action.hideHover')?.run();
  editor.pushUndoStop();editor.executeEdits('python-inspection',issue.fix.edits.map(e=>({range:new m.Range(e.startLineNumber,e.startColumn,e.endLineNumber,e.endColumn),text:e.text,forceMoveMarkers:true})));editor.pushUndoStop();editor.focus();
 }
 const subscriptions=[
  m.editor.registerCommand(accept,(_accessor,id,version)=>action(id,version,true)),
  m.editor.registerCommand(dismiss,(_accessor,id,version)=>action(id,version,false)),
  m.languages.registerHoverProvider('python',{provideHover(model,position){
   if(!current()||model.uri.toString()!==uri)return null;
   const found=snapshot!.issues.filter(d=>(d.severity==='error'||!d.dismissed)&&new m.Range(d.range.startLineNumber,d.range.startColumn,d.range.endLineNumber,Math.max(d.range.endColumn,d.range.startColumn+1)).containsPosition(position));
   if(!found.length)return null;
   return {range:found[0].range,contents:found.slice(0,4).map(issue=>{
    const caption=issue.severity==='error'?'错误':issue.severity==='style'?'PEP 8 提醒':'代码提醒';
    let value=`**${caption} · ${escaped(issue.title)}**\n\n${escaped(issue.reason)}\n\n建议：${escaped(issue.suggestion)}`;
    if(issue.fix&&!issue.dismissed){const preview=issuePreview(issue,snapshot!.source).replace(/`/g,'ˋ');value+=`\n\n修改后预览：\n\n\`\`\`python\n${preview}\n\`\`\``;}
    const args=encodeURIComponent(JSON.stringify([issue.id,revision]));
    if(!issue.dismissed){value+='\n\n';if(issue.fix)value+=`[${escaped(issue.fix.title)} · Y](command:${accept}?${args})  `;value+=`[忽略 · N](command:${dismiss}?${args})`;}else value+='\n\n已忽略建议，错误标记仍保留。';
    return {value,isTrusted:{enabledCommands:[accept,dismiss]},supportHtml:false};
   })};
  }}),
  m.languages.registerCodeActionProvider('python',{provideCodeActions(model,range){if(!current()||model.uri.toString()!==uri)return {actions:[],dispose(){}};const issues=snapshot!.issues.filter(d=>!d.dismissed&&d.range.startLineNumber<=range.endLineNumber&&d.range.endLineNumber>=range.startLineNumber);return {actions:issues.flatMap(issue=>[...(issue.fix?[{title:`${issue.fix.title} · ${issue.title}`,kind:'quickfix',command:{id:accept,title:issue.fix.title,arguments:[issue.id,revision]}}]:[]),{title:`忽略 · ${issue.title}`,kind:'quickfix',command:{id:dismiss,title:'忽略',arguments:[issue.id,revision]}}]),dispose(){}};}},{providedCodeActionKinds:['quickfix']}),
  editor.onDidChangeModelContent(()=>{clear();const model=editor.getModel();if(model)m.editor.setModelMarkers(model,'python',[]);snapshot=null;revision++;}),
  editor.onDidChangeModel(()=>{clear();snapshot=null;revision++;}),
 ];
 // The editor keeps keyboard focus while hovering a marker. A visible actionable
 // card must therefore work without moving the pointer into that card first.
 if(hoverHost){
  let pointed:HTMLElement|null=null,consumed='';
  const over=(event:PointerEvent)=>{const target=event.target as Element|null;pointed=target?.closest<HTMLElement>('.monaco-hover')||null;};
  const out=(event:PointerEvent)=>{if(pointed&&!pointed.contains(event.relatedTarget as Node|null))pointed=null;};
  const key=(event:KeyboardEvent)=>{
   if(event.repeat&&consumed===event.key.toLowerCase()){event.preventDefault();event.stopImmediatePropagation();return;}
   if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.isComposing||!['y','n'].includes(event.key.toLowerCase()))return;
   const command=event.key.toLowerCase()==='y'?accept:dismiss;
   const active=document.activeElement,focused=active?.closest<HTMLElement>('.monaco-hover');
   const editorFocused=editor.hasTextFocus()||!!(active&&editor.getDomNode()?.contains(active));
   const editorHover=editorFocused?hoverHost.querySelector<HTMLAnchorElement>(`a[data-href^="command:${command}?"]`)?.closest<HTMLElement>('.monaco-hover'):null;
   const hover=(focused&&hoverHost.contains(focused)?focused:null)||editorHover||pointed;
   // Do not intercept typing into an unrelated field, even if an old hover remains.
   if(!editorFocused&&!focused&&active?.closest('input,textarea,[contenteditable=true],[role=textbox]'))return;
   if(!hover||!hover.isConnected||!hover.getClientRects().length||getComputedStyle(hover).visibility==='hidden'||getComputedStyle(hover).display==='none')return;
   const link=hover.querySelector<HTMLAnchorElement>(`a[data-href^="command:${command}?"]`);
   if(!link)return;
   try{const [id,version]=JSON.parse(decodeURIComponent(link.dataset.href!.split('?')[1]));if(typeof id!=='string'||typeof version!=='number')return;consumed=event.key.toLowerCase();event.preventDefault();event.stopImmediatePropagation();action(id,version,command===accept);}catch{}
  };
  const release=()=>{consumed='';};
  hoverHost.addEventListener('pointerover',over);hoverHost.addEventListener('pointerout',out);document.addEventListener('keydown',key,true);document.addEventListener('keyup',release,true);
  subscriptions.push({dispose(){hoverHost.removeEventListener('pointerover',over);hoverHost.removeEventListener('pointerout',out);document.removeEventListener('keydown',key,true);document.removeEventListener('keyup',release,true);}});
 }
 return {
  update(next:InspectionSnapshot|null){clear();snapshot=next;revision++;const model=editor.getModel();uri=model?.uri.toString()||'';if(!next||!model||model.getValue()!==next.source)return;
   m.editor.setModelMarkers(model,owner,next.issues.filter(d=>d.severity==='error'||!d.dismissed).map(d=>({...d.range,modelVersionId:model.getVersionId(),severity:d.severity==='error'?m.MarkerSeverity.Error:d.severity==='warning'?m.MarkerSeverity.Warning:m.MarkerSeverity.Info,message:d.title,source:d.severity==='style'?'PEP 8':'Python',code:d.code})));
  },
  apply(id:string){action(id,revision,true);},
  reveal(issue:PythonIssue){const model=current();if(!model)return;editor.revealLineInCenterIfOutsideViewport(issue.range.startLineNumber);editor.setPosition({lineNumber:issue.range.startLineNumber,column:issue.range.startColumn});editor.focus();},
  dispose(){disposed=true;clear();subscriptions.forEach(s=>s.dispose());snapshot=null;},
 };
}
export type MonacoInspection=ReturnType<typeof attachPythonInspection>;
