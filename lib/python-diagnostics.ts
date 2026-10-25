import type {Diagnostic} from '@astral-sh/ruff-wasm-web';
import vocabulary from '@/data/python-completions.json';
export type InspectionEdit={startLineNumber:number;startColumn:number;endLineNumber:number;endColumn:number;text:string};
export type PythonIssue={id:string;rule:string;code:string;title:string;reason:string;suggestion:string;severity:'error'|'warning'|'style';range:Omit<InspectionEdit,'text'>;fix?:{title:string;edits:InspectionEdit[];preview:string};dismissed?:boolean};
export type InspectionSnapshot={file:string;source:string;issues:PythonIssue[]};
// Only presentation changes here; parsing and name resolution are performed by Ruff.
const explanations:Record<string,[string,string,string,string]>={
 'undefined-name':['F821','名称未定义','当前作用域中没有找到这个名称。','检查拼写，或先定义 / 导入这个名称。'],
 'undefined-local':['F823','局部变量赋值前被使用','Python 将这个名称视为局部变量，但在赋值前就读取了它。','先赋值再使用；若需读取外层变量，请检查作用域。'],
 'unused-import':['F401','导入后尚未使用','当前文件没有使用这个导入。','如果后续不需要，可以删除；准备继续使用则保留。'],
 'unused-variable':['F841','局部变量尚未使用','赋值后没有读取该变量。','检查是否漏了使用，或删除不需要的赋值。'],
 'f-string-missing-placeholders':['F541','f 字符串没有占位表达式','字符串中没有需要求值的花括号表达式。','可以使用普通字符串；若本来要插值，请补充表达式。'],
 'assert-tuple':['F631','assert 使用了非空元组','非空元组始终为真，断言不会按预期检查条件。','写成 assert 条件, 提示信息。'],
 'if-tuple':['F634','条件使用了非空元组','非空元组始终为真。','检查条件中是否误加了逗号。'],
 'useless-semicolon':['E703','不需要行末分号','Python 通常用换行结束语句，行末分号没有必要。','删除行末分号。'],
 'multiple-statements-on-one-line-semicolon':['E702','一行包含多条语句','多条语句挤在同一行，不便于逐步阅读和调试。','把分号两侧的语句拆到不同的行。'],
 'multiple-statements-on-one-line-colon':['E701','复合语句写在同一行','条件、循环和函数体通常分行并缩进。','在冒号后换行，将代码块缩进 4 个空格。'],
 'missing-whitespace-around-operator':['E225','运算符两侧缺少空格','赋值、比较等运算符两侧的空格有助于区分操作。','在运算符两侧各添加一个空格。'],
 'missing-whitespace-around-arithmetic-operator':['E226','算术运算符两侧缺少空格','适当留空格能让算式更易阅读。','在此算术运算符两侧添加空格。'],
 'missing-whitespace-around-bitwise-or-shift-operator':['E227','位运算符两侧缺少空格','位运算符需要与两侧的操作数分开。','在运算符两侧添加空格。'],
 'missing-whitespace-after-punctuation':['E231','分隔符后缺少空格','逗号等分隔符后通常需要一个空格。','在分隔符后添加空格。'],
 'whitespace-after-open-bracket':['E201','左括号后有多余空格','括号内侧通常不留额外空格。','删除左括号紧邻的多余空格。'],
 'whitespace-before-close-bracket':['E202','右括号前有多余空格','括号内侧通常不留额外空格。','删除右括号紧邻的多余空格。'],
 'whitespace-before-parameters':['E211','调用括号前有空格','函数名与调用括号之间通常不留空格。','删除函数名与左括号之间的空格。'],
 'trailing-whitespace':['W291','行末有多余空格','行末空格不会帮助阅读，也容易造成无意义的差异。','删除这行末尾的空格。'],
 'blank-line-with-whitespace':['W293','空行中含空格','空行不需要保留空格或制表符。','清除空行中的空白字符。'],
 'missing-newline-at-end-of-file':['W292','文件末尾缺少换行','文本源码通常以换行符结束。','在文件末尾添加一个换行。'],
 'too-many-newlines-at-end-of-file':['W391','文件末尾有多余空行','文件末尾保留一个换行即可。','删除多余的空行。'],
 'line-too-long':['E501','单行代码较长','PEP 8 通常建议代码行不超过 79 个字符，便于并排阅读。','在括号内合理换行；不要把字符串内容直接截断。'],
 'indentation-with-invalid-multiple':['E111','缩进不是 4 的倍数','PEP 8 推荐每层缩进使用 4 个空格；这不等同于语法错误。','使用 4 空格缩进，保持同一代码块的层级一致。'],
 'tab-indentation':['W191','缩进使用了 Tab','PEP 8 推荐空格缩进；混用 Tab 和空格可能引起错误。','统一使用 4 空格缩进。'],
 'mixed-spaces-and-tabs':['E101','缩进混用了空格和 Tab','混用缩进会让代码块层级难以辨认。','统一使用空格，并核对代码块层级。'],
 'blank-lines-top-level':['E302','顶层定义之间空行不足','顶层函数或类之间通常保留两行空行。','在独立定义之间补足空行。'],
 'blank-lines-after-function-or-class':['E305','定义后空行不足','顶层函数或类之后通常保留两行空行。','在定义结束后补足空行。'],
 'too-many-blank-lines':['E303','连续空行过多','过多空行打断阅读。','按代码所在位置减少空行。'],
 'multiple-imports-on-one-line':['E401','一行导入多个模块','不同模块通常各占一行导入。','将 import a, b 拆为两行。'],
 'module-import-not-at-top-of-file':['E402','导入位置较靠后','模块导入通常放在文件开头。','如果没有运行顺序要求，将导入移动到文件开头。'],
 'invalid-function-name':['N802','函数名建议使用小写','Python 函数通常采用小写单词和下划线命名。','修改函数名时，也要同步修改所有调用位置。'],
 'invalid-argument-name':['N803','参数名建议使用小写','函数参数通常采用小写单词和下划线命名。','同时更新函数内对该参数的引用。'],
 'non-lowercase-variable-in-function':['N806','局部变量名建议使用小写','局部变量通常采用小写单词和下划线命名。','保持命名一致，并同步修改所有引用。'],
 'invalid-class-name':['N801','类名建议使用 CapWords','Python 类名通常使用单词首字母大写。','修改定义和引用中的类名。'],
};
const errors=new Set(['undefined-name','undefined-local','undefined-export','break-outside-loop','continue-outside-loop','yield-outside-function','return-outside-function','default-except-not-last','duplicate-argument-name','future-feature-not-defined','late-future-import','forward-annotation-syntax-error','too-many-expressions-in-starred-assignment','two-starred-expressions','repeated-keyword-argument','invalid-print-syntax']);
const warnings=new Set(['unused-import','unused-variable','unused-annotation','f-string-missing-placeholders','assert-tuple','if-tuple','is-literal','invalid-escape-sequence','multi-value-repeated-key-literal','multi-value-repeated-key-variable','redefined-while-unused','import-star-used','import-star-usage']);
const syntaxRule=(rule:string)=>!rule||/syntax|unexpected-indentation|unindent|expected-an-indented-block/.test(rule);
const formattingRules=new Set(['indentation-with-invalid-multiple','tab-indentation']);
function rangeOf(start:{row:number;column:number},end:{row:number;column:number},source:string){const lines=source.split('\n'),sr=Math.max(1,Math.min(start.row,lines.length)),er=Math.max(sr,Math.min(end.row,lines.length));const sc=Math.max(1,Math.min(start.column,(lines[sr-1]?.length||0)+1)),ec=Math.max(er===sr?sc:1,Math.min(end.column,(lines[er-1]?.length||0)+1));return {startLineNumber:sr,startColumn:sc,endLineNumber:er,endColumn:ec};}
export function offsetAt(source:string,row:number,column:number){const lines=source.split('\n');let n=0;for(let i=1;i<row&&i<=lines.length;i++)n+=lines[i-1].length+1;return Math.min(source.length,n+column-1);}
export function applyInspectionEdits(source:string,edits:InspectionEdit[]){const spans=edits.map(e=>({...e,start:offsetAt(source,e.startLineNumber,e.startColumn),end:offsetAt(source,e.endLineNumber,e.endColumn)})).sort((a,b)=>b.start-a.start||b.end-a.end);let right=source.length;for(const e of spans){if(e.end>right||e.end<e.start)throw Error('Conflicting diagnostic edits');source=source.slice(0,e.start)+e.text+source.slice(e.end);right=e.start;}return source;}
function editDistance(a:string,b:string){let last=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,last[j]+1,last[j-1]+(a[i-1]===b[j-1]?0:1));last=next;}return last[b.length];}
function suggestBuiltin(name:string){if(name.length<3)return null;const ranked=vocabulary.globals.map(v=>({name:v.label,distance:editDistance(name,v.label)})).filter(v=>v.distance>0&&v.distance<=Math.min(2,Math.floor(name.length/2))).sort((a,b)=>a.distance-b.distance);return ranked.length&&(!ranked[1]||ranked[1].distance>ranked[0].distance)?ranked[0].name:null;}
export function normalizePythonDiagnostics(raw:Diagnostic[],source:string,formatted?:string|null):PythonIssue[]{
 return raw.map((d,index)=>{
  const rule=d.code||'invalid-syntax',syntax=syntaxRule(rule),severity=syntax||errors.has(rule)?'error':warnings.has(rule)?'warning':'style',ex=explanations[rule];
  let title=ex?.[1]||(syntax?'Python 语法错误':severity==='style'?'代码风格建议':'代码检查提醒'),reason=ex?.[2]||d.message,suggestion=ex?.[3]||(syntax?'检查标记处及上一行的括号、冒号、引号和缩进。':'根据说明核对这一处代码。');
  if(syntax){if(d.message.includes('Expected `:`')){reason='这里的条件、循环或定义缺少冒号。';suggestion='在语句头末尾添加冒号，下一行按层级缩进。';}else if(/unexpected indent/i.test(d.message)){reason='这一行的缩进不符合当前代码块结构。';suggestion='与同一代码块的其他语句对齐，并检查上一行是否开启代码块。';}}
  const range=rangeOf(d.start_location,d.end_location,source),issue:PythonIssue={id:`${index}:${rule}:${range.startLineNumber}:${range.startColumn}`,rule,code:ex?.[0]||(syntax?'SyntaxError':rule),title,reason,suggestion,severity,range};
  if(d.fix?.edits.length){const edits=d.fix.edits.map(e=>({...rangeOf(e.location,e.end_location,source),text:e.content||''}));issue.fix={title:'采纳此修改',edits,preview:applyInspectionEdits(source,edits)};}
  if(rule==='undefined-name'){const name=d.message.match(/`([^`]+)`/)?.[1],candidate=name&&suggestBuiltin(name);if(candidate){issue.suggestion=`是否想使用内置函数 ${candidate}？只有确认意图一致时再采纳。`;const edits=[{...range,text:candidate}];issue.fix={title:`改为 ${candidate}`,edits,preview:applyInspectionEdits(source,edits)};}}
  if(!issue.fix&&formattingRules.has(rule)&&formatted&&formatted!==source){const lines=source.split('\n'),edits=[{startLineNumber:1,startColumn:1,endLineNumber:lines.length,endColumn:lines.at(-1)!.length+1,text:formatted}];issue.fix={title:'规范本文件缩进与格式',edits,preview:formatted};issue.suggestion+=' 采纳会规范整个文件的格式，预览如下。';}
  // Keep the engine's precise diagnostic available alongside the Chinese explanation.
  if(ex&&severity==='error')issue.reason+=`（${d.message}）`;
  return issue;
 }).sort((a,b)=>({error:0,warning:1,style:2}[a.severity]-{error:0,warning:1,style:2}[b.severity])||a.range.startLineNumber-b.range.startLineNumber||a.range.startColumn-b.range.startColumn).slice(0,160);
}
export function issuePreview(issue:PythonIssue,source:string){if(!issue.fix)return '';const lines=issue.fix.preview.split('\n'),row=Math.max(0,issue.range.startLineNumber-2);return (issue.fix.title.startsWith('规范本文件')?lines.slice(0,20):lines.slice(row,Math.min(lines.length,row+5))).join('\n').slice(0,1400);}
