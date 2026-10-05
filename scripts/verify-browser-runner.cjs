const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {Worker:NodeWorker,isMainThread,parentPort}=require('worker_threads');
const root=process.cwd();
const pyodideDir=process.env.PYODIDE_TEST_DIR||'/tmp/usaco-pyodide';
if(!isMainThread){
 global.self=global;global.postMessage=x=>parentPort.postMessage(x);
 global.importScripts=()=>{global.loadPyodide=opts=>require(path.join(pyodideDir,'pyodide.js')).loadPyodide({...opts,indexURL:pyodideDir+'/'});};
 vm.runInThisContext(fs.readFileSync(root+'/public/python-worker.js','utf8'));
 parentPort.on('message',data=>self.onmessage({data}));
}else{(async()=>{
 const ts=require(root+'/node_modules/typescript');fs.mkdirSync('/tmp/usaco-qa-lib',{recursive:true});
 for(const name of ['judge-output','practice-runner'])fs.writeFileSync('/tmp/usaco-qa-lib/'+name+'.js',ts.transpileModule(fs.readFileSync(root+'/lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);
 const {PracticeRunner}=require('/tmp/usaco-qa-lib/practice-runner.js'),{checkOutput}=require('/tmp/usaco-qa-lib/judge-output.js');
 global.Worker=class{constructor(){this.w=new NodeWorker(__filename);this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',e=>this.onerror?.(e));}postMessage(d){this.w.postMessage(d)}terminate(){this.w.terminate()}};
 global.fetch=async(url)=>new Response(fs.readFileSync(root+'/public'+url));
 const run=async(code,cases,extra={})=>new PracticeRunner().run({id:567,code,cases,limitSeconds:2,onStatus:()=>{},onResult:()=>{},...extra});
 const manifest=JSON.parse(fs.readFileSync(root+'/public/official-tests/567.json'));
 let result=await run(fs.readFileSync(root+'/reference-solutions/567.py','utf8'),manifest.cases,{inputFile:'paint.in'});
 assert.equal(result.filter(r=>r.status==='AC').length,10,JSON.stringify(result));console.log('PASS: 10 official gzip files, historical file I/O, Python reference');
 result=await run(JSON.parse(fs.readFileSync(root+'/public/solutions/567.json')).pythonTeaching,manifest.cases);assert.equal(result.filter(r=>r.status==='AC').length,10);console.log('PASS: four-line teaching solution against all 10 official files');
 const course=JSON.parse(fs.readFileSync(root+'/data/course-exercises.json'));for(const ex of course.filter(e=>['跨行读数','多组求和','选恰好 k 个'].includes(e.title))){result=await run(ex.solution,ex.cases,{id:ex.id});assert(result.every(r=>r.status==='AC'),JSON.stringify(result));}console.log('PASS: real Pyodide course cases for iter/next, repeated-group input and bit_count');

 result=await run('import sys\nn=int(sys.stdin.buffer.readline())\nif n == 0:\n while True: pass\nsys.stdout.buffer.write(b"ok\\n")\nsys.exit(0)',[{name:'infinite',input:'0\n',output:'ok'},{name:'next',input:'1\n',output:'ok'}],{limitSeconds:.2});
 assert.deepEqual(result.map(r=>r.status),['TLE','AC']);console.log('PASS: per-case timeout, worker restart, buffered I/O, normal SystemExit');
 result=await run('from helpers import values\nvalues.append(int(input()))\nprint(sum(values))\nprint(open("notes.txt").read().strip())',[{name:'first import',input:'2',output:'12\nproject data'},{name:'fresh module',input:'3',output:'13\nproject data'}],{files:{'solve.py':'# selected entry','helpers.py':'values = [10]','notes.txt':'project data','samples/1.in':'2'},entryFile:'solve.py'});
 assert.deepEqual(result.map(r=>r.status),['AC','AC'],JSON.stringify(result));console.log('PASS: project imports, selected entry, data files, module reset between cases');
 result=await run('from broken import fail\nfail()',[{name:'helper traceback',input:'',output:''}],{files:{'broken.py':'def fail():\n    return 1 / 0'},entryFile:'solution2.py'});
 assert.equal(result[0].status,'RE');assert.match(result[0].error,/broken.py/);assert.match(result[0].error,/line 2/);console.log('PASS: helper-file traceback');
 result=await run('print(999)',[{name:'wrong',input:'',output:'1'}]);assert.equal(result[0].status,'WA');
 result=await run('print(1/0)',[{name:'error',input:'',output:'1'}]);assert.equal(result[0].status,'RE');
 result=await run('print("hello")',[{name:'custom',input:'',output:null}]);assert.equal(result[0].status,'RUN');
 result=await run('print("x"*120001)',[{name:'long',input:'',output:'x'.repeat(120001)}]);assert.equal(result[0].status,'AC');console.log('PASS: WA, RE, custom run, compare full output before display truncation');
 for(const id of [1252,1540,1563,1589,987]){
  const cases=JSON.parse(fs.readFileSync(root+'/public/official-tests/'+id+'.json')).cases;
  for(const test of cases){const d=JSON.parse(require('zlib').gunzipSync(fs.readFileSync(root+'/public'+test.url)));assert.equal(checkOutput(id,d.input,d.output,d.output).ok,true,`${id} ${test.name}`);assert.equal(checkOutput(id,d.input,d.output,'').ok,false);}
 }
 assert.equal(checkOutput(1252,'1\n3 1\nGGG\n','1\n.G.\n','1\nG..\n').ok,false);
 assert.equal(checkOutput(1540,'1 0\n4\nCOWO\n','','2\n1 2 1 2\n').ok,false);
 assert.equal(checkOutput(1589,'1\n1 2\nMO\nOM\n','','1\n1 1 1 2\n').ok,true);
 assert.equal(checkOutput(1589,'1\n1 2\nMO\nOM\n','','1\n1 1 1 3\n').ok,false);
 assert.equal(checkOutput(987,'','hello\nworld','hello world').ok,false);
 console.log('PASS: all official outputs for 4 constructive validators and line-sensitive checker; invalid and alternative constructs');
})().catch(e=>{console.error(e);process.exitCode=1;});}
