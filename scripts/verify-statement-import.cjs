const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-dom-tests/node_modules/jsdom');
const renderMath=require('katex/contrib/auto-render');
const root=process.cwd(),source=process.argv[2];assert(source,'Pass the supplied anthology path');
const original=new JSDOM(fs.readFileSync(source,'utf8')).window.document;
const docs=require('../data/local-statements.json'),catalog=require('../data/catalog.json'),report=require('../data/statement-import-report.json');
const normalize=s=>s.replace(/\s+/g,' ').trim();
let mathCount=0,images=0,samples=0;const failures=[];
assert.equal(Object.keys(docs).length,60);assert.equal(report.excludedUSOpenIds.length,18);
for(const [id,doc] of Object.entries(docs)){
 const p=catalog.find(p=>p.id===+id);assert(p&&p.year>=2020);assert(p.statementAvailable);
 const raw=[...original.querySelector(`#p${id}`).querySelectorAll('.problem-text')];
 for(const [index,language] of ['en','zh'].entries()){
  const dom=new JSDOM('<!doctype html><html><body><main>'+doc[language]+'</main></body></html>');
  const node=dom.window.document.querySelector('main');assert.equal(normalize(node.textContent),normalize(raw[index].textContent),`Full text differs: ${id} ${language}`);
  assert(!node.querySelector('script,style,iframe,object,embed,form'));for(const el of node.querySelectorAll('*'))for(const a of el.attributes)assert(!a.name.startsWith('on'));
  const pre=[...node.querySelectorAll('pre')].map(x=>normalize(x.textContent));
  for(const sample of p.samples)for(const value of [sample.input,sample.output]){assert(pre.includes(normalize(value)),`Missing sample ${id} ${language}: ${value.slice(0,30)}`);samples++;}
  for(const img of node.querySelectorAll('img')){assert(/^\/statements\/assets\/[a-f0-9]{64}\.(png|jpeg|webp|gif)$/.test(img.getAttribute('src')));assert(fs.existsSync(path.join(root,'public',img.getAttribute('src'))));images++;}
  global.document=dom.window.document;global.Node=dom.window.Node;
  renderMath(node,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false,trust:false,maxExpand:1000,strict:'ignore'});
  mathCount+=node.querySelectorAll('.katex').length;
  for(const el of node.querySelectorAll('.katex-error'))failures.push({id,language,tex:el.textContent,error:el.title});
  dom.window.close();
 }
}
assert.deepEqual(failures,[]);assert.equal(images,4);
assert.equal(catalog.filter(p=>!p.statementAvailable).length,39);
console.log(JSON.stringify({documents:60,languages:120,formulae:mathCount,images,sampleBlocksChecked:samples,mathErrors:failures.length}));
