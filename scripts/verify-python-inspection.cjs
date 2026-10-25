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
 const {normalizePythonDiagnostics,applyInspectionEdits}=require(root+'/lib/python-diagnostics.ts'),{attachPythonInspection}=require(root+'/lib/monaco-python-inspection.ts');
 (async()=>{const w=new Worker(__filename);let sequence=0;try{
  await new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject);});
  const lint=code=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(Error('Timeout')),15000);const message=d=>{if(d.id!==id)return;w.off('message',message);clearTimeout(timer);if(d.type==='error')reject(Error(d.error));else resolve(normalizePythonDiagnostics(d.diagnostics,code,d.formatted));};w.on('message',message);w.postMessage({id,code});});
  const source='printdf(123+343);\nprint()\n',issues=await lint(source),undefinedName=issues.find(d=>d.rule==='undefined-name');assert.equal(undefinedName.severity,'error');assert.match(undefinedName.fix.title,/print/);assert.equal(applyInspectionEdits(source,undefinedName.fix.edits),'print(123+343);\nprint()\n');
  for(const rule of ['useless-semicolon','missing-whitespace-around-arithmetic-operator']){const d=issues.find(x=>x.rule===rule);assert.equal(d.severity,'style');assert(d.fix);}
  const semicolon=issues.find(d=>d.rule==='useless-semicolon');assert.equal(applyInspectionEdits(source,semicolon.fix.edits),'printdf(123+343)\nprint()\n');
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
  const actions=actionProvider.provideCodeActions(model,{startLineNumber:1,endLineNumber:1}).actions,apply=actions.find(d=>d.title.startsWith('改为 print')),reject=actions.find(d=>d.title==='忽略 · 名称未定义');assert(apply&&reject);
  commands.get(reject.command.id)(null,...reject.command.arguments);assert.equal(dismissed,undefinedName.id);assert.equal(text,source);
  commands.get(apply.command.id)(null,...apply.command.arguments);assert.equal(text,'print(123+343);\nprint()\n');assert.equal(undoStops,2);assert.deepEqual(markers,[]);
  // The old hover action must not mutate newer code.
  text='print(42)\n';commands.get(apply.command.id)(null,...apply.command.arguments);assert.equal(text,'print(42)\n');bridge.update({file:'main.py',source,issues});assert.equal(hoverProvider.provideHover(model,{lineNumber:1,column:2}),null);
  bridge.dispose();assert.equal(commands.size,0);assert.equal(disposed,6);
  console.log('PASS: Monaco errors vs mild style markers, trusted hover actions, decline leaves code intact, guarded edits, undo stops, stale-result rejection and provider cleanup');
 }finally{await w.terminate();}})().catch(e=>{console.error(e);process.exitCode=1;});
}
