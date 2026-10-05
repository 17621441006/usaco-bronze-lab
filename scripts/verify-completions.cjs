const fs=require('fs'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript');
const source=fs.readFileSync('lib/code-completions.ts','utf8'),moduleCode=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const compiled=new Module('code-completions');compiled.require=name=>name==='@/data/python-completions.json'?require('../data/python-completions.json'):require(name);compiled._compile(moduleCode,'code-completions.cjs');
const providers={},calls=[],monaco={languages:{CompletionItemKind:{Keyword:1,Module:2,Snippet:3,Method:4,Function:5,Variable:6},CompletionItemInsertTextRule:{InsertAsSnippet:4},registerCompletionItemProvider(language,provider){calls.push(language);providers[language]=provider;return {dispose(){}};}}};
compiled.exports.registerCodeCompletions(monaco);compiled.exports.registerCodeCompletions(monaco);assert.deepEqual(calls,['python','cpp']);
function suggest(line,language='python',text=line){const column=line.length+1,word=line.match(/[A-Za-z_]\w*$/)?.[0]||'';return providers[language].provideCompletionItems({getWordUntilPosition:()=>({word,startColumn:column-word.length,endColumn:column}),getLineContent:()=>line,getValue:()=>text},{lineNumber:1,column}).suggestions;}
let list=suggest('pr'),print=list.find(item=>item.label==='print');assert(print);assert.equal(print.insertText,'print(${1})$0');assert.equal(print.insertTextRules,4);assert.deepEqual(print.range,{startLineNumber:1,endLineNumber:1,startColumn:1,endColumn:3});
assert.equal(print.insertText.replace(/\$\{\d+(?::([^}]*))?\}|\$\d+/g,(_,value)=>value||''),'print()');
assert(suggest('items.ap').some(item=>item.label==='append'));assert(!suggest('items.ap').some(item=>item.label==='print'));
assert(suggest('sys.stdin.re').some(item=>item.label==='readline'));assert(suggest('heapq.he').find(item=>item.label==='heappush').insertText.includes('${2:value}'));
assert(suggest('tot','python','total = 0\nfor cow in cows:\n    pass\ntot').some(item=>item.label==='total'));
assert(suggest('co','cpp').some(item=>item.label==='cout'));assert(suggest('fo','cpp').find(item=>item.label==='for').insertText.includes('\n'));
console.log('PASS: pr -> print(), snippet cursor/range, Python members/modules, file names, C++ templates, single provider registration');

const audit=require('../data/completion-audit.json');assert.deepEqual(audit.missing,[]);
for(const name of audit.requiredCalls)assert(suggest(name).some(s=>s.label===name),`Missing global ${name}`);
for(const name of audit.requiredMembers)assert(['a.','math.','itertools.','sys.','os.path.'].some(prefix=>suggest(prefix+name).some(s=>s.label===name)),`Missing member ${name}`);
for(const name of ['iter','next'])assert(suggest(name).find(s=>s.label===name).insertText.startsWith(name+'('));
assert(suggest('mask.bi').some(s=>s.label==='bit_count'));
assert(suggest('it.co','python','import itertools as it\nit.co').some(s=>s.label==='combinations'));
assert(suggest('a[0].sp').some(s=>s.label==='split'));
console.log(`PASS: all calls used across ${audit.referenceFiles} references and ${audit.exerciseSolutions} exercises; next/iter, int methods, module alias and chained receivers`);
