const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {JSDOM}=require(process.env.JSDOM_TEST_DIR||'/tmp/usaco-dom-tests/node_modules/jsdom');
const renderMath=require('katex/contrib/auto-render');
const root=process.cwd(),sources=process.argv.slice(2);assert.equal(sources.length,2,'Pass both supplied anthology paths');
const originals=new Map(),sourceRecords=[];
for(const source of sources){const document=new JSDOM(fs.readFileSync(source,'utf8')).window.document;sourceRecords.push({name:path.basename(source),sha:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),document});for(const p of document.querySelectorAll('.problem[id]')){assert(!originals.has(p.id));originals.set(p.id,p);}}
const docs=require('../data/local-statements.json'),catalog=require('../data/catalog.json'),report=require('../data/statement-import-report.json');
const normalize=s=>s.replace(/\s+/g,' ').trim();
let mathCount=0,images=0,samples=0,verbatim=0;const failures=[];
assert.equal(Object.keys(docs).length,106);assert.equal(catalog.length,106);assert.equal(report.excludedUSOpenIds.length,34);
assert.equal(catalog.filter(p=>p.year<2020).length,46);assert.equal(catalog.filter(p=>p.statementOnly).length,7);
assert.deepEqual(Object.keys(docs).map(Number).sort((a,b)=>a-b),catalog.map(p=>p.id).sort((a,b)=>a-b));
for(const source of sourceRecords){const item=report.sources.find(s=>s.sourceFile===source.name);assert(item);assert.equal(item.sourceSha256,source.sha);for(const id of item.excludedUSOpenIds)assert(!docs[id]);}
for(const [id,doc] of Object.entries(docs)){
 const p=catalog.find(p=>p.id===+id);assert(p&&p.statementAvailable);assert(!report.excludedUSOpenIds.includes(+id));
 const raw=[...originals.get(`p${id}`).querySelectorAll('.problem-text')];assert.equal(raw.length,2);
 for(const [index,language] of ['en','zh'].entries()){
  const dom=new JSDOM('<!doctype html><html><body><main>'+doc[language]+'</main></body></html>');
  const node=dom.window.document.querySelector('main');assert.equal(normalize(node.textContent),normalize(raw[index].textContent),`Full text differs: ${id} ${language}`);
  assert(!node.querySelector('script,style,iframe,object,embed,form'));for(const el of node.querySelectorAll('*'))for(const a of el.attributes)assert(!a.name.startsWith('on'));
  assert.deepEqual([...node.querySelectorAll('pre')].map(x=>x.textContent),[...raw[index].querySelectorAll('pre')].map(x=>x.textContent),`Sample/preformatted data changed: ${id} ${language}`);
  const literal=raw[index].querySelector('.prewrap');if(literal){assert.equal(node.querySelector('.statement-verbatim')?.textContent,literal.textContent);verbatim++;}
  for(const sample of p.samples)for(const value of [sample.input,sample.output]){assert(normalize(node.textContent).includes(normalize(value)),`Missing sample ${id} ${language}: ${value.slice(0,30)}`);samples++;}
  const rawImages=[...raw[index].querySelectorAll('img')],localImages=[...node.querySelectorAll('img')];assert.equal(localImages.length,rawImages.length);
  for(const [i,img] of localImages.entries()){assert(/^\/statements\/assets\/[a-f0-9]{64}\.(png|jpeg|webp|gif)$/.test(img.getAttribute('src')));const bytes=fs.readFileSync(path.join(root,'public',img.getAttribute('src')));assert.deepEqual(bytes,Buffer.from(rawImages[i].src.split(',')[1],'base64'));images++;}
  global.document=dom.window.document;global.Node=dom.window.Node;
  renderMath(node,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false,trust:false,maxExpand:1000,strict:'ignore'});
  mathCount+=node.querySelectorAll('.katex').length;
  for(const el of node.querySelectorAll('.katex-error'))failures.push({id,language,tex:el.textContent,error:el.title});
  dom.window.close();
 }
}
assert.deepEqual(failures,[]);assert.equal(catalog.filter(p=>!p.statementAvailable).length,0);
for(const p of catalog.filter(p=>p.statementOnly)){assert.equal(p.testsTotal,0);assert.equal(p.referenceReady,false);assert(p.samples.length>0);}
for(const source of sourceRecords)source.document.defaultView.close();
console.log(JSON.stringify({documents:Object.keys(docs).length,languages:Object.keys(docs).length*2,formulae:mathCount,images,verbatimBlocks:verbatim,sampleBlocksChecked:samples,mathErrors:failures.length,excludedUSOpen:report.excludedUSOpenIds.length}));
