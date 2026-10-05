import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const source=new URL('../node_modules/monaco-editor/',import.meta.url);
const target=new URL('../public/editor/',import.meta.url);
const version=JSON.parse(readFileSync(new URL('package.json',source),'utf8')).version;
const stamp=new URL('version.txt',target);
if(!existsSync(stamp)||readFileSync(stamp,'utf8')!==version||!existsSync(new URL('vs/loader.js',target))){
 mkdirSync(target,{recursive:true});
 cpSync(fileURLToPath(new URL('min/vs/',source)),fileURLToPath(new URL('vs/',target)),{recursive:true});
 for(const file of ['LICENSE','ThirdPartyNotices.txt'])if(existsSync(new URL(file,source)))cpSync(new URL(file,source),new URL(file,target));
 writeFileSync(stamp,version);
}
