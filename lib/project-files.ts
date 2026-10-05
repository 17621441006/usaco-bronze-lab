export type CodeProject={version:1;files:Record<string,string>;openFiles:string[];activeFile:string;entryFile:string};
export const starters={python:'',cpp:'#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    return 0;\n}\n'};
export function validFilename(name:string){return /^[A-Za-z_][A-Za-z0-9_-]*\.(py|cpp|h|hpp|txt|in|out)$/.test(name)&&name.length<=64;}
export function codeLanguage(name:string){return name.endsWith('.py')?'python':/\.(cpp|h|hpp)$/.test(name)?'cpp':'plaintext';}
export function executable(name:string){return /\.(py|cpp)$/.test(name);}
const cleanStarter=(code:string)=>code.replace(/^# (?:先读题，再独立尝试|新的解题尝试)\r?\n(?:\r?\n)?/,'');
export function createProject(python?:string|null,cpp?:string|null):CodeProject{return {version:1,files:{'main.py':cleanStarter(python??starters.python),'main.cpp':cpp??starters.cpp},openFiles:['main.py'],activeFile:'main.py',entryFile:'main.py'};}
export function readProject(raw:string|null,python?:string|null,cpp?:string|null):CodeProject{
 try{const data=JSON.parse(raw||'null');if(!data||data.version!==1||!data.files||typeof data.files!=='object')return createProject(python,cpp);
 const files=Object.fromEntries(Object.entries(data.files).filter(([name,code])=>validFilename(name)&&typeof code==='string').map(([name,code])=>[name,cleanStarter(code as string)])) as Record<string,string>;
 if(!Object.keys(files).length)return createProject(python,cpp);const names=Object.keys(files),openFiles=Array.isArray(data.openFiles)?data.openFiles.filter((n:string)=>n in files):[];
 const activeFile=data.activeFile in files?data.activeFile:names[0],entryFile=data.entryFile in files&&executable(data.entryFile)?data.entryFile:names.find(executable)||names[0];
 return {version:1,files,openFiles:[...new Set<string>([...openFiles,activeFile])],activeFile,entryFile};
 }catch{return createProject(python,cpp);}
}
export function selectFile(project:CodeProject,name:string):CodeProject{return {...project,activeFile:name,openFiles:project.openFiles.includes(name)?project.openFiles:[...project.openFiles,name],entryFile:executable(name)?name:project.entryFile};}
