import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const source=new URL('../node_modules/@astral-sh/ruff-wasm-web/',import.meta.url);
const target=new URL('../public/python-lint/vendor/',import.meta.url);
const version=JSON.parse(readFileSync(new URL('package.json',source),'utf8')).version;
const stamp=new URL('version.txt',target);
if(!existsSync(stamp)||readFileSync(stamp,'utf8')!==version||!existsSync(new URL('ruff_wasm_bg.wasm',target))){
 mkdirSync(target,{recursive:true});
 for(const file of ['ruff_wasm.js','ruff_wasm_bg.wasm','LICENSE'])cpSync(new URL(file,source),new URL(file,target));
 writeFileSync(stamp,version);
}
