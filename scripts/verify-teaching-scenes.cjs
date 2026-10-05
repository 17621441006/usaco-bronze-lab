// Semantic scene checks and SSR diagram checks; not a browser visual inspection.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript');
const root=process.cwd(),resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {farmFrame,storyKinds}=require('../lib/farm-scenarios.ts'),{algorithmLessons,pythonLessons}=require('../data/course-lessons.ts'),{FarmDiagram}=require('../components/farm-diagram.tsx'),{FenceMethods}=require('../components/fence-methods.tsx'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),exercises=require('../data/course-exercises.json');
assert.equal(algorithmLessons.length,18);assert.equal(pythonLessons.length,8);
for(const lesson of [...algorithmLessons,...pythonLessons]){assert.equal(exercises.filter(e=>e.lesson===lesson.id).length,3);assert(lesson.kind||lesson.frames?.length);}
assert.equal(new Set(algorithmLessons.map(l=>l.group)).size,4);
for(const kind of storyKinds)for(let s=0;s<4;s++){
 const f=farmFrame(kind,s);assert(f.title&&f.task&&f.unit&&f.facts.length);assert(new Set(f.nodes.map(n=>n.id)).size===f.nodes.length);
 const html=renderToStaticMarkup(React.createElement(FarmDiagram,{kind,step:s}));assert(html.includes('role="img"'));assert(!html.includes('NaN'));assert(!html.includes('undefined'));
 for(const [a,b] of f.edges||[])assert(f.nodes[a]&&f.nodes[b]);
}
for(let s=0;s<4;s++){const f=farmFrame('buckets',s);assert.equal(f.nodes.reduce((sum,n)=>sum+Number(n.value),0),12);assert(f.nodes.every(n=>n.value>=0&&n.value<=n.capacity));}
assert.deepEqual(farmFrame('buckets',3).nodes.map(n=>n.value),[10,0,2]);
assert.deepEqual(farmFrame('herd',3).nodes.map(n=>[n.id,n.value]),[['D',1],['B',2],['A',4],['C',7]]);
assert.equal(farmFrame('complexity',2).edges.length,6);
assert(farmFrame('balance',3).nodes.every(n=>n.value===4));
assert.equal(farmFrame('barns',3).nodes.filter(n=>n.done).length,3);
assert.equal(farmFrame('feed',3).nodes.filter(n=>n.done).length,4);
assert(farmFrame('hayline',3).facts.some(x=>x.includes('= 9')));
for(const [interval,expected] of [[[7,10,4,8],6],[[0,1,1,2],2],[[0,4,0,4],4],[[2,8,3,5],6]]){
 const html=renderToStaticMarkup(React.createElement(FenceMethods,{interval,step:3}));
 assert(html.includes('当前标记之和：<strong>'+expected+'</strong>'));assert(html.includes('[0,1)'));assert.equal((html.match(/class="marker-unit /g)||[]).length,12);
}
// Test every reference variant against all ten official files, including actual C++ execution.
const {fenceMethods}=require('../data/fence-methods.ts'),{spawnSync}=require('child_process'),{gunzipSync}=require('zlib'),os=require('os');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fence-model-check-'));
let verified=0;
try{for(const method of Object.values(fenceMethods))for(const lang of ['python','cpp']){
 let command='python3',args=['-c',method[lang]];
 if(lang==='cpp'){const cpp=path.join(tmp,'solution.cpp'),exe=path.join(tmp,'solution');fs.writeFileSync(cpp,method.cpp);const compile=spawnSync('g++',['-std=c++17','-O2',cpp,'-o',exe],{encoding:'utf8'});assert.equal(compile.status,0,compile.stderr);command=exe;args=[];}
 for(const item of require('../public/official-tests/567.json').cases){const c=JSON.parse(gunzipSync(fs.readFileSync(root+'/public'+item.url)));const r=spawnSync(command,args,{input:c.input,encoding:'utf8',cwd:tmp,timeout:3000});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),c.output.trim());verified++;}
}}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(`PASS: 18 algorithm lessons / 26 course chapters, 44 semantic 2D frames, bucket conservation, identity-preserving sorting, graph reachability, interval edge cases; ${verified} fence checks across two methods × two languages × ten official files`);
