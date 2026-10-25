// Pinned Ruff 0.17.2, served from this site. Static analysis never executes code.
import init,{Workspace,PositionEncoding} from './vendor/ruff_wasm.js';
let workspace,loading,latest=0;
const settings={
 'target-version':'py312','line-length':79,'indent-width':4,
 lint:{select:['E','W','F','N801','N802','N803','N806'],preview:true},
 format:{'indent-style':'space','quote-style':'preserve'},
};
async function engine(){
 if(!loading)loading=init().then(()=>workspace=new Workspace(settings,PositionEncoding.Utf16));
 return loading;
}
self.onmessage=async({data})=>{
 const {id,code}=data;latest=id;
 if(typeof code!=='string'||code.length>300000){self.postMessage({type:'error',id,error:'文件超过 30 万字符，已暂停即时检查；仍可保存和运行。'});return;}
 try{
  const w=await engine();if(id!==latest)return;
  const diagnostics=w.check(code);let formatted=null;
  // For valid but inconsistent indentation, offer a whole-file formatting preview.
  if(diagnostics.some(d=>['indentation-with-invalid-multiple','tab-indentation'].includes(d.code))&&!diagnostics.some(d=>!d.code||['invalid-syntax','unexpected-indentation','unindent-does-not-match-any-outer-indentation-level'].includes(d.code))){try{formatted=w.format(code);}catch{}}
  if(id===latest)self.postMessage({type:'result',id,diagnostics,formatted});
 }catch(error){if(id===latest)self.postMessage({type:'error',id,error:'即时检查暂时不可用，请重试。'+String(error?.message||error).slice(0,100)});}
};
