// Regression checks for Windows CRLF and repeated Shell continuation lines.
const fs=require('fs'),Module=require('module'),assert=require('assert/strict'),ts=require('typescript');
const mod=new Module('shell-editing');
mod._compile(ts.transpileModule(fs.readFileSync('lib/shell-editing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,'shell-editing.cjs');
const {insertShellNewline}=mod.exports;
function fixture(source,eol){
 let text=source.replace(/\r?\n/g,eol),position={lineNumber:text.split(eol).length,column:text.split(eol).at(-1).length+1},selection=null;
 const offset=pos=>text.split(eol).slice(0,pos.lineNumber-1).reduce((n,line)=>n+line.length+eol.length,0)+pos.column-1;
 const editor={getModel:()=>({getLineContent:n=>text.split(eol)[n-1],getEOL:()=>eol}),getSelection:()=>selection||{startLineNumber:position.lineNumber,startColumn:position.column,endLineNumber:position.lineNumber,endColumn:position.column},pushUndoStop(){},focus(){},setPosition:next=>{position=next;selection=null;},executeEdits(_source,edits){for(const {range,text:value} of edits){const start=offset({lineNumber:range.startLineNumber,column:range.startColumn}),end=offset({lineNumber:range.endLineNumber,column:range.endColumn});text=text.slice(0,start)+value.replace(/\r?\n/g,eol)+text.slice(end);}}};
 return {editor,position:()=>position,lines:()=>text.split(eol),type(value){const start=offset(position);text=text.slice(0,start)+value+text.slice(start);position.column+=value.length;},select:value=>{selection=value;}};
}
for(const eol of ['\n','\r\n']){
 const f=fixture('for i in range(3):',eol);insertShellNewline(f.editor);assert.deepEqual(f.position(),{lineNumber:2,column:5});
 for(let i=0;i<5;i++){f.type('print(i)');insertShellNewline(f.editor);assert.equal(f.position().column,5);assert.equal(f.lines().at(-1),'    ');}
 assert(f.lines().slice(1,-1).every(line=>line==='    print(i)'));
 insertShellNewline(f.editor);assert.equal(f.position().column,5,'blank indented lines keep the same indent');
 const nested=fixture('for i in range(3):\n    if i > 0:',eol);insertShellNewline(nested.editor);assert.equal(nested.position().column,9);nested.type('print(i)');insertShellNewline(nested.editor);assert.equal(nested.position().column,9);
 const selection=fixture('for i in range(3):\n    pass',eol);selection.select({startLineNumber:2,startColumn:5,endLineNumber:2,endColumn:9});insertShellNewline(selection.editor);assert.deepEqual(selection.lines(),['for i in range(3):','    ','    ']);assert.equal(selection.position().column,5);
 const plain=fixture('print(1 + 5)',eol);insertShellNewline(plain.editor);assert.deepEqual(plain.lines(),['print(1 + 5)','']);assert.equal(plain.position().column,1);
}
console.log('PASS: LF/CRLF repeated lines, empty indented lines, nested blocks, selected completion placeholder and top-level newline');
