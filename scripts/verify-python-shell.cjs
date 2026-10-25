// Execute the production Shell worker against real Pyodide; persistent state is essential.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort}=require('worker_threads'),root=process.cwd(),pyodideDir=process.env.PYODIDE_TEST_DIR||'/tmp/usaco-qa/node_modules/pyodide';
if(!isMainThread){
 global.self=global;global.postMessage=data=>parentPort.postMessage(data);
 global.importScripts=()=>{global.loadPyodide=options=>require(path.join(pyodideDir,'pyodide.js')).loadPyodide({...options,indexURL:pyodideDir+'/'});};
 vm.runInThisContext(fs.readFileSync(root+'/public/python-shell-worker.js','utf8'));
 parentPort.on('message',data=>self.onmessage({data}));
}else{(async()=>{
 const w=new Worker(__filename);let id=0;
 const message=data=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Shell worker timeout')),20000);const listener=result=>{if(data.type==='init'&&result.type!=='ready'&&result.type!=='error')return;if(data.type!=='init'&&result.id!==data.id)return;w.off('message',listener);clearTimeout(timeout);if(result.type==='error')reject(Error(result.error));else resolve(result);};w.on('message',listener);w.postMessage(data);});
 const run=(code,input='',force=false)=>message({type:'execute',id:++id,code,input,force});
 try{
  const ready=await message({type:'init'});assert.match(ready.version,/^3\./);
  assert.equal((await run('1 + 5')).output,'6\n');
  assert.equal((await run('print(1 + 5)')).output,'6\n');
  assert.equal((await run('cows = [2, 3, 5]')).error,'');
  assert.equal((await run('sum(cows)')).output,'10\n');
  assert.equal((await run('def total(a):')).incomplete,true);
  assert.equal((await run('def total(a):\n    return sum(a)')).error,'');
  assert.equal((await run('total(cows)')).output,'10\n');
  assert.equal((await run('for x in cows:\n    print(x)')).output,'2\n3\n5\n');
  assert.equal((await run('a = 4\nb = 6\na + b')).output,'10\n');
  assert.equal((await run('_ * 2')).output,'20\n');
  assert.equal((await run('from collections import Counter\nCounter("Bessie")')).output,"Counter({'e': 2, 's': 2, 'B': 1, 'i': 1})\n");
  let r=await run('print("before")\n1 / 0');assert.equal(r.output,'before\n');assert.match(r.error,/ZeroDivisionError/);assert(!r.error.includes('_shell_execute'));assert.equal((await run('a + b')).output,'10\n');
  assert.match((await run('if True', '', true)).error,/SyntaxError/);
  assert.equal((await run('print(sum(map(int, input().split())))','2 3 5\n')).output,'10\n');
  assert.match((await run('input()')).error,/EOFError/);
  assert.equal((await run('import sys\nprint("notice", file=sys.stderr)')).stderr,'notice\n');
  r=await run('print("x" * 25000)');assert(r.truncated);assert.equal(r.output.length,20000);
  console.log('PASS: real persistent Shell, expressions, print, assignment, functions, incomplete/multiline blocks, history value _, imports, stdin, stderr, recoverable errors and bounded output');
  // The browser controller must terminate an infinite loop and allow a fresh interpreter.
  const ts=require(root+'/node_modules/typescript');const compiled=ts.transpileModule(fs.readFileSync(root+'/lib/python-shell.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};new Function('module','exports',compiled)(mod,mod.exports);
  global.Worker=class{constructor(){this.w=new Worker(__filename);this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',e=>this.onerror?.(e));}postMessage(data){this.w.postMessage(data)}terminate(){void this.w.terminate()}};
  const {PythonShellRuntime}=mod.exports,engine=new PythonShellRuntime(()=>{});await engine.initialize();
  const pending=engine.execute('while True:\n    pass');setTimeout(()=>engine.stop('Stopped test'),100);await assert.rejects(pending,/Stopped test/);
  const fresh=new PythonShellRuntime(()=>{});try{assert.equal((await fresh.execute('1 + 5')).output,'6\n');assert.match((await fresh.execute('cows')).error,/NameError/);}finally{fresh.stop();}
  console.log('PASS: stop terminates busy worker; restarting uses a clean namespace');
 }finally{await w.terminate();}
})().catch(e=>{console.error(e);process.exitCode=1;});}
