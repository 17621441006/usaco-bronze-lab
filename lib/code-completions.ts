import type * as Monaco from 'monaco-editor';
import vocabulary from '@/data/python-completions.json';

type Entry={label:string;insert:string;detail:string;documentation?:string;kind?:'snippet'|'keyword'|'module'};
const python:Entry[]=[
 {label:'print',insert:'print(${1})$0',detail:'print(*values, sep=" ", end="\\n") · 输出内容'},
 {label:'input',insert:'input(${1})$0',detail:'input() · 读取一行字符串'},
 {label:'int',insert:'int(${1:value})$0',detail:'int(value) · 转为整数'},
 {label:'float',insert:'float(${1:value})$0',detail:'float(value) · 转为小数'},
 {label:'str',insert:'str(${1:value})$0',detail:'str(value) · 转为字符串'},
 {label:'len',insert:'len(${1:items})$0',detail:'len(items) · 元素个数'},
 {label:'range',insert:'range(${1:n})$0',detail:'range(stop) / range(start, stop, step)'},
 {label:'list',insert:'list(${1:items})$0',detail:'list(iterable) · 转为列表'},
 {label:'dict',insert:'dict(${1})$0',detail:'dict() · 新建字典'},
 {label:'set',insert:'set(${1})$0',detail:'set(iterable) · 去重集合'},
 {label:'tuple',insert:'tuple(${1:items})$0',detail:'tuple(iterable) · 转为元组'},
 {label:'sum',insert:'sum(${1:items})$0',detail:'sum(items) · 求和'},
 {label:'min',insert:'min(${1:items})$0',detail:'min(items) · 最小值'},
 {label:'max',insert:'max(${1:items})$0',detail:'max(items) · 最大值'},
 {label:'abs',insert:'abs(${1:value})$0',detail:'abs(value) · 绝对值'},
 {label:'sorted',insert:'sorted(${1:items})$0',detail:'sorted(items, key=None, reverse=False) · 返回排序结果'},
 {label:'reversed',insert:'reversed(${1:items})$0',detail:'reversed(items) · 逆序遍历'},
 {label:'enumerate',insert:'enumerate(${1:items})$0',detail:'enumerate(items) · 同时遍历下标和值'},
 {label:'zip',insert:'zip(${1:a}, ${2:b})$0',detail:'zip(a, b) · 并行遍历'},
 {label:'map',insert:'map(${1:int}, ${2:items})$0',detail:'map(function, iterable) · 映射每个元素'},
 {label:'all',insert:'all(${1:items})$0',detail:'all(items) · 是否全部为真'},
 {label:'any',insert:'any(${1:items})$0',detail:'any(items) · 是否至少一个为真'},
 {label:'open',insert:'open(${1:"file.txt"}, ${2:"r"})$0',detail:'open(path, mode) · 打开文件'},
 {label:'for',insert:'for ${1:i} in range(${2:n}):\n\t${0:pass}',detail:'for · 按次数循环',kind:'snippet'},
 {label:'for_each',insert:'for ${1:item} in ${2:items}:\n\t${0:pass}',detail:'for · 遍历容器',kind:'snippet'},
 {label:'while',insert:'while ${1:condition}:\n\t${0:pass}',detail:'while · 条件循环',kind:'snippet'},
 {label:'if',insert:'if ${1:condition}:\n\t${0:pass}',detail:'if · 条件分支',kind:'snippet'},
 {label:'elif',insert:'elif ${1:condition}:\n\t${0:pass}',detail:'elif · 后续条件',kind:'snippet'},
 {label:'else',insert:'else:\n\t${0:pass}',detail:'else · 其他情况',kind:'snippet'},
 {label:'def',insert:'def ${1:solve}(${2}):\n\t${0:pass}',detail:'def · 定义函数',kind:'snippet'},
 {label:'read_ints',insert:'list(map(int, input().split()))$0',detail:'读取一行整数，保存为列表',kind:'snippet'},
 {label:'main',insert:'def solve():\n\t${1:pass}\n\nif __name__ == "__main__":\n\tsolve()$0',detail:'Python 程序入口',kind:'snippet'},
 ...['return','break','continue','pass','True','False','None','and','or','not','in','is','lambda','import','from'].map(label=>({label,insert:label,detail:'Python 关键字',kind:'keyword' as const})),
 ...['sys','math','collections','itertools','heapq','bisect'].map(label=>({label,insert:label,detail:'Python 标准库模块',kind:'module' as const})),
];
const methods:Entry[]=[
 {label:'append',insert:'append(${1:value})$0',detail:'list.append(value) · 末尾添加元素'},
 {label:'extend',insert:'extend(${1:items})$0',detail:'list.extend(items) · 合并元素'},
 {label:'pop',insert:'pop(${1})$0',detail:'pop() · 删除并返回元素'},
 {label:'sort',insert:'sort(${1})$0',detail:'list.sort() · 原地排序'},
 {label:'reverse',insert:'reverse()$0',detail:'list.reverse() · 原地反转'},
 {label:'split',insert:'split(${1})$0',detail:'str.split() · 拆分字符串'},
 {label:'strip',insert:'strip(${1})$0',detail:'str.strip() · 去除两端空白'},
 {label:'join',insert:'join(${1:items})$0',detail:'str.join(items) · 连接字符串'},
 {label:'count',insert:'count(${1:value})$0',detail:'count(value) · 出现次数'},
 {label:'index',insert:'index(${1:value})$0',detail:'index(value) · 第一次出现的位置'},
 {label:'get',insert:'get(${1:key}, ${2:0})$0',detail:'dict.get(key, default) · 读取键值'},
 {label:'items',insert:'items()$0',detail:'dict.items() · 键值对'},
 {label:'keys',insert:'keys()$0',detail:'dict.keys() · 所有键'},
 {label:'values',insert:'values()$0',detail:'dict.values() · 所有值'},
 {label:'add',insert:'add(${1:value})$0',detail:'set.add(value) · 添加集合元素'},
 {label:'discard',insert:'discard(${1:value})$0',detail:'set.discard(value) · 移除集合元素'},
];
const modules:Record<string,Entry[]>={
 sys:[{label:'stdin',insert:'stdin',detail:'sys.stdin · 标准输入'},{label:'stdout',insert:'stdout',detail:'sys.stdout · 标准输出'},{label:'setrecursionlimit',insert:'setrecursionlimit(${1:1000000})$0',detail:'设置递归深度上限'}],
 stdin:[{label:'readline',insert:'readline()$0',detail:'读取一行输入'},{label:'read',insert:'read()$0',detail:'读取全部输入'},{label:'buffer',insert:'buffer',detail:'二进制输入流'}],
 buffer:[{label:'readline',insert:'readline()$0',detail:'读取一行字节'},{label:'read',insert:'read()$0',detail:'读取全部字节'}],
 math:['gcd','lcm','sqrt','isqrt','ceil','floor'].map(label=>({label,insert:label+'(${1})$0',detail:'math.'+label+' · 数学函数'})),
 collections:['Counter','defaultdict','deque'].map(label=>({label,insert:label+'(${1})$0',detail:'collections.'+label+' · 容器'})),
 heapq:[{label:'heappush',insert:'heappush(${1:heap}, ${2:value})$0',detail:'heapq.heappush(heap, value) · 添加元素'},...['heappop','heapify'].map(label=>({label,insert:label+'(${1:heap})$0',detail:'heapq.'+label+' · 堆操作'}))],
 bisect:['bisect_left','bisect_right','insort'].map(label=>({label,insert:label+'(${1:a}, ${2:x})$0',detail:'bisect.'+label+' · 有序序列'})),
};
const cpp:Entry[]=[
 {label:'cout',insert:'cout << ${1:value} << "\\n";$0',detail:'标准输出'},
 {label:'cin',insert:'cin >> ${1:value};$0',detail:'标准输入'},
 {label:'vector',insert:'vector<${1:int}> ${2:values}(${3:n});$0',detail:'vector · 动态数组',kind:'snippet'},
 {label:'sort',insert:'sort(${1:a}.begin(), ${1:a}.end());$0',detail:'sort · 排序'},
 {label:'for',insert:'for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${0}\n}',detail:'for · 下标循环',kind:'snippet'},
 {label:'if',insert:'if (${1:condition}) {\n\t${0}\n}',detail:'if · 条件分支',kind:'snippet'},
 {label:'while',insert:'while (${1:condition}) {\n\t${0}\n}',detail:'while · 条件循环',kind:'snippet'},
 {label:'main',insert:'int main() {\n\tios::sync_with_stdio(false);\n\tcin.tie(nullptr);\n\t${0}\n\treturn 0;\n}',detail:'C++ 程序入口',kind:'snippet'},
 ...['int','long long','double','string','bool','return','break','continue','auto','const','true','false'].map(label=>({label,insert:label,detail:'C++ 类型或关键字',kind:'keyword' as const})),
];
const merge=(primary:Entry[],extra:Entry[])=>[...primary,...extra.filter(item=>!primary.some(p=>p.label===item.label))];
const pythonAll=merge(python,vocabulary.globals);
const methodsAll=merge(methods,vocabulary.methods);
const modulesAll:Record<string,Entry[]>={};
for(const name of new Set([...Object.keys(modules),...Object.keys(vocabulary.modules)]))modulesAll[name]=merge(modules[name]||[],(vocabulary.modules as Record<string,Entry[]>)[name]||[]);
const configured=new WeakSet<object>();
export function registerCodeCompletions(monaco:typeof Monaco){
 if(configured.has(monaco))return;configured.add(monaco);
 for(const language of ['python','cpp'])monaco.languages.registerCompletionItemProvider(language,{
  triggerCharacters:language==='python'?['.']:['.',':'],
  provideCompletionItems(model,position){
   const word=model.getWordUntilPosition(position),before=model.getLineContent(position.lineNumber).slice(0,word.startColumn-1);
   const member=language==='python'&&before.endsWith('.')?(before.match(/([A-Za-z_]\w*)\.$/)||['','']):null;
   const alias=member?new RegExp('import\\s+([A-Za-z_][\\w.]*)\\s+as\\s+'+member[1]+'\\b').exec(model.getValue()):null;
   const receiver=alias?alias[1]:member?.[1];
   const entries=language==='python'?(member?(modulesAll[receiver||'']||methodsAll):pythonAll):cpp;
   const range={startLineNumber:position.lineNumber,endLineNumber:position.lineNumber,startColumn:word.startColumn,endColumn:word.endColumn};
   const suggestions:Monaco.languages.CompletionItem[]=entries.map((entry,index)=>({label:entry.label,filterText:entry.label,insertText:entry.insert,detail:entry.detail,documentation:entry.documentation||entry.detail,range,sortText:String(index).padStart(3,'0'),kind:entry.kind==='keyword'?monaco.languages.CompletionItemKind.Keyword:entry.kind==='module'?monaco.languages.CompletionItemKind.Module:entry.kind==='snippet'?monaco.languages.CompletionItemKind.Snippet:member?monaco.languages.CompletionItemKind.Method:monaco.languages.CompletionItemKind.Function,insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet}));
   if(!member){
    const defined=new Set<string>(),text=model.getValue();
    const pattern=language==='python'?/(?:\b(?:def|class|for)\s+([A-Za-z_]\w*)|^\s*([A-Za-z_]\w*)\s*(?:=(?!=)|:))/gm:/\b(?:int|long|double|float|bool|string|auto)\s+([A-Za-z_]\w*)/g;
    for(const match of text.matchAll(pattern)){const label=match[1]||match[2];if(!defined.has(label)&&!entries.some(e=>e.label===label)){defined.add(label);suggestions.push({label,insertText:label,range,kind:monaco.languages.CompletionItemKind.Variable,detail:'当前文件中的名称',sortText:'900'+label});}}
   }
   return {suggestions};
  }
 });
}
