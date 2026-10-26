// Real Ruff WASM + public worker and Monaco command/model contracts; no browser is simulated.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript');
const {Worker,isMainThread,parentPort}=require('worker_threads'),{pathToFileURL}=require('url'),root=process.cwd();
if(!isMainThread){
 global.self=global;global.postMessage=data=>parentPort.postMessage(data);
 const fetch=global.fetch;global.fetch=async(input,options)=>String(input).startsWith('file:')?new Response(fs.readFileSync(new URL(input)),{headers:{'Content-Type':'application/wasm'}}):fetch(input,options);
 import(pathToFileURL(root+'/public/python-lint/worker.js').href).then(()=>{parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({type:'booted'});});
}else{
 const resolve=Module._resolveFilename;Module._resolveFilename=function(n,...a){return resolve.call(this,n.startsWith('@/')?path.join(root,n.slice(2)):n,...a);};
 require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
 const {normalizePythonDiagnostics,applyInspectionEdits,issuePreview}=require(root+'/lib/python-diagnostics.ts'),{attachPythonInspection}=require(root+'/lib/monaco-python-inspection.ts');
 (async()=>{const w=new Worker(__filename);let sequence=0;try{
  await new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject);});
  const lint=code=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(Error('Timeout')),15000);const message=d=>{if(d.id!==id)return;w.off('message',message);clearTimeout(timer);if(d.type==='error')reject(Error(d.error));else resolve(normalizePythonDiagnostics(d.diagnostics,code,d.formatted));};w.on('message',message);w.postMessage({id,code});});
  const source='printdf(123+343);\nprint()\n',issues=await lint(source),undefinedName=issues.find(d=>d.rule==='undefined-name');assert.equal(undefinedName.severity,'error');assert.match(undefinedName.fix.title,/print/);assert.equal(applyInspectionEdits(source,undefinedName.fix.edits),'print(123+343);\nprint()\n');
  for(const rule of ['useless-semicolon','missing-whitespace-around-arithmetic-operator']){const d=issues.find(x=>x.rule===rule);assert.equal(d.severity,'style');assert(d.fix);}
  const semicolon=issues.find(d=>d.rule==='useless-semicolon');assert.equal(applyInspectionEdits(source,semicolon.fix.edits),'printdf(123+343)\nprint()\n');
  const spacedSource='print(8+9)\n\n\na, b = map(int, input().split())\n',spacing=(await lint(spacedSource)).find(d=>d.code==='E226');assert(spacing.fix);assert.equal(issuePreview(spacing,spacedSource),'print(8 + 9)');assert.equal(issuePreview({...spacing,fix:{...spacing.fix,preview:spacing.fix.preview.replace(/\n/g,'\r\n')}},spacedSource.replace(/\n/g,'\r\n')),'print(8 + 9)');
  assert((await lint('for i in range(3)\n    print(i)\n')).some(d=>d.severity==='error'&&d.code==='SyntaxError'));
  assert((await lint('print("unclosed)\n')).some(d=>d.severity==='error'));
  assert((await lint('if True:\nprint(1)\n')).some(d=>d.severity==='error'));
  assert(!(await lint('def printdf(x):\n    print(x)\n\n\nprintdf(5)\n')).some(d=>d.rule==='undefined-name'));
  assert(!(await lint('from helpers import values\nprint(values)\n')).some(d=>d.severity==='error'));
  assert(!(await lint('text = "printdf(5); x=1"\n# printdf(5); x=1\nprint(text)\n')).some(d=>['undefined-name','useless-semicolon','missing-whitespace-around-operator'].includes(d.rule)));
  const unicode='s = "😀"; printdf(1)\n',u=(await lint(unicode)).find(d=>d.rule==='undefined-name');assert.equal(applyInspectionEdits(unicode,u.fix.edits),'s = "😀"; print(1)\n');
  const indentation='def solve(x):\n  return x+1\n',indent=(await lint(indentation)).find(d=>d.rule==='indentation-with-invalid-multiple');assert.equal(indent.severity,'style');assert.match(indent.fix.title,/本文件/);assert(applyInspectionEdits(indentation,indent.fix.edits).includes('    return x + 1'));
  assert((await lint('n=int(input())  \nprint(n)')).some(d=>d.rule==='trailing-whitespace'));
  // Linting must not run user code or block on an infinite loop.
  const before=Date.now();await lint('raise RuntimeError("MUST NOT RUN")\nwhile True:\n    pass\n');assert(Date.now()-before<3000);
  console.log('PASS: real worker/WASM, missing colon/quote/indentation, undefined and defined functions, imported names, comments/strings, Unicode columns, PEP 8 edits, whole-file format preview, no execution');
  // Contract test the exact providers/commands used by Monaco, including stale fixes and disposal.
  let text=source,markers=[],hoverProvider,actionProvider,changeContent,changeModel,undoStops=0,dismissed=null,disposed=0;
  const commands=new Map(),uri='inmemory://usaco/1/main.py',model={uri:{toString:()=>uri},getValue:()=>text,getVersionId:()=>1,isDisposed:()=>false};
  class Range{constructor(a,b,c,d){Object.assign(this,{startLineNumber:a,startColumn:b,endLineNumber:c,endColumn:d});}containsPosition(p){return p.lineNumber>=this.startLineNumber&&p.lineNumber<=this.endLineNumber&&p.column>=this.startColumn&&p.column<=this.endColumn;}}
  const disposable=()=>({dispose(){disposed++;}}),monaco={Range,Uri:{parse:x=>x},MarkerSeverity:{Error:8,Warning:4,Info:2},editor:{getModel:()=>model,setModelMarkers:(_m,owner,value)=>{if(owner==='usaco-python-inspection')markers=value;},registerCommand:(id,fn)=>{commands.set(id,fn);return {dispose(){commands.delete(id);disposed++;}};}},languages:{registerHoverProvider:(_l,p)=>{hoverProvider=p;return disposable();},registerCodeActionProvider:(_l,p)=>{actionProvider=p;return disposable();}}};
  const editor={getModel:()=>model,pushUndoStop:()=>undoStops++,executeEdits:(_s,edits)=>{text=applyInspectionEdits(text,edits.map(e=>({...e.range,text:e.text})));changeContent();},focus(){},onDidChangeModelContent:fn=>{changeContent=fn;return disposable();},onDidChangeModel:fn=>{changeModel=fn;return disposable();},setPosition(){},revealLineInCenterIfOutsideViewport(){}};
  const bridge=attachPythonInspection(editor,monaco,id=>dismissed=id);bridge.update({file:'main.py',source,issues});assert(markers.some(d=>d.severity===8));assert(markers.some(d=>d.severity===2));
  const hover=hoverProvider.provideHover(model,{lineNumber:1,column:2});assert(hover.contents[0].value.includes('修改后预览'));assert(hover.contents[0].value.includes('忽略'));assert.equal(hover.contents[0].isTrusted.enabledCommands.length,2);
  assert(hover.contents[0].value.indexOf('command:usaco.inspection.accept.')<hover.contents[0].value.indexOf('修改后预览'),'hover actions precede the potentially tall preview');
  const actions=actionProvider.provideCodeActions(model,{startLineNumber:1,endLineNumber:1}).actions,apply=actions.find(d=>d.title.startsWith('改为 print')),reject=actions.find(d=>d.title==='忽略 · 名称未定义');assert(apply&&reject);
  commands.get(reject.command.id)(null,...reject.command.arguments);assert.equal(dismissed,undefinedName.id);assert.equal(text,source);
  commands.get(apply.command.id)(null,...apply.command.arguments);assert.equal(text,'print(123+343);\nprint()\n');assert.equal(undoStops,2);assert.deepEqual(markers,[]);
  // The old hover action must not mutate newer code.
  text='print(42)\n';commands.get(apply.command.id)(null,...apply.command.arguments);assert.equal(text,'print(42)\n');bridge.update({file:'main.py',source,issues});assert.equal(hoverProvider.provideHover(model,{lineNumber:1,column:2}),null);
  bridge.dispose();assert.equal(commands.size,0);assert.equal(disposed,6);
  console.log('PASS: Monaco errors vs mild style markers, trusted hover actions, decline leaves code intact, guarded edits, undo stops, stale-result rejection and provider cleanup');

  // Exercise the persistent card lifecycle with real DOM events and delayed
  // pointer traversal, including edits/model changes that invalidate an action.
  const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-qa/node_modules/jsdom');
  const dom=new JSDOM('<div id="editor"><textarea></textarea></div><div id="hover"></div><input id="other">');
  global.document=dom.window.document;global.window=dom.window;global.Event=dom.window.Event;
  const editorNode=document.getElementById('editor'),field=editorNode.querySelector('textarea'),host=document.getElementById('hover');
  const listeners={};
  for(const name of ['onMouseMove','onMouseLeave','onMouseDown','onDidScrollChange','onDidLayoutChange'])editor[name]=fn=>{listeners[name]=fn;return disposable();};
  editor.getDomNode=()=>editorNode;editor.hasTextFocus=()=>document.activeElement===field;
  editor.getScrolledVisiblePosition=()=>({left:50,top:20,height:22});editor.focus=()=>field.focus();
  const keys=attachPythonInspection(editor,monaco,id=>dismissed=id,host);
  function show(){text=source;keys.update({file:'main.py',source,issues});listeners.onMouseDown({event:{leftButton:true},target:{position:{lineNumber:1,column:2}}});const card=host.querySelector('.python-inspection-card');assert(card);card.getClientRects=()=>[{width:360,height:220}];field.focus();return card;}
  function press(key,repeat=false){const event=new dom.window.KeyboardEvent('keydown',{key,repeat,bubbles:true,cancelable:true});document.activeElement.dispatchEvent(event);return event;}
  function release(){document.dispatchEvent(new dom.window.KeyboardEvent('keyup',{bubbles:true}));}
  text=source;keys.update({file:'main.py',source,issues});
  listeners.onMouseMove({target:{position:{lineNumber:1,column:2}}});
  await new Promise(r=>setTimeout(r,400));
  const persisted=host.querySelector('.python-inspection-card');assert(persisted,'hover opens a card');
  listeners.onMouseMove({target:{position:{lineNumber:2,column:1}}});listeners.onMouseLeave();
  await new Promise(r=>setTimeout(r,1700));assert(persisted.isConnected,'crossing blank code and waiting beyond the former timeout must not close advice');
  persisted.querySelector('[aria-label="采纳建议"]').click();assert.equal(text,'print(123+343);\nprint()\n');assert(!persisted.isConnected);
  show();assert(press('Y').defaultPrevented);assert.equal(text,'print(123+343);\nprint()\n');assert(press('Y',true).defaultPrevented);release();assert(!press('y').defaultPrevented,'ordinary typing resumes after action');
  show();dismissed=null;assert(press('n').defaultPrevented);assert.equal(dismissed,undefinedName.id);assert.equal(text,source);release();
  let card=show();document.getElementById('other').focus();assert(!press('y').defaultPrevented);assert.equal(text,source);
  field.focus();assert(press('Escape').defaultPrevented);assert(!card.isConnected);
  card=show();card.querySelector('button').dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true}));assert(card.isConnected,'pointerdown inside keeps the card clickable');
  document.getElementById('other').dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true}));assert(!card.isConnected);
  card=show();card.querySelector('.inspection-card-body').dispatchEvent(new dom.window.Event('scroll'));assert(card.isConnected,'preview scrolling does not close');listeners.onDidScrollChange();assert(!card.isConnected);
  card=show();text='print(99)\n';changeContent();assert(!card.isConnected);assert(!press('y').defaultPrevented);assert.equal(text,'print(99)\n');
  card=show();changeModel();assert(!card.isConnected);
  card=show();keys.dispose();assert(!card.isConnected);assert(!press('y').defaultPrevented);
  dom.window.close();delete global.document;delete global.window;delete global.Event;
  console.log('PASS: persistent hover across slow pointer travel, real accept click, Y/N capture, Escape/outside/edit/model/scroll cleanup, unrelated input isolation and listener disposal');

 }finally{await w.terminate();}})().catch(e=>{console.error(e);process.exitCode=1;});
}
