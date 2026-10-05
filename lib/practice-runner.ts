import {checkOutput} from './judge-output';
export type TestCase={name:string,input:string,output:string|null};
export type TestResult={name:string,status:'AC'|'WA'|'RE'|'TLE'|'RUN',output?:string,expected?:string|null,error?:string,detail?:string,ms:number};
export type OfficialManifest={officialTotal:number,imported:number,cases:{name:string,url:string,bytes:number,compressedBytes:number}[]};
export class PracticeRunner {
 private worker:Worker|null=null; private stopped=false; private pendingReject:((e:Error)=>void)|null=null; private timer:ReturnType<typeof setTimeout>|null=null; private abort=new AbortController();
 stop(){this.stopped=true;this.abort.abort();this.worker?.terminate();this.worker=null;if(this.timer)clearTimeout(this.timer);this.pendingReject?.(new Error('已停止运行'));this.pendingReject=null;}
 private async initialize(onStatus:(s:string)=>void){
  if(this.worker)return;
  if(this.stopped)throw Error('已停止运行');onStatus('正在加载 Python 环境（首次加载较慢）…');
  const worker=new Worker('/python-worker.js');this.worker=worker;
  await new Promise<void>((resolve,reject)=>{this.pendingReject=reject;this.timer=setTimeout(()=>{worker.terminate();this.worker=null;reject(Error('Python 环境加载超时，请重试。'));},120000);
   worker.onmessage=({data})=>{if(data.type==='ready'){if(this.timer)clearTimeout(this.timer);this.pendingReject=null;resolve();}else if(data.type==='error'){if(this.timer)clearTimeout(this.timer);reject(Error(data.error));}};
   worker.onerror=e=>{if(this.timer)clearTimeout(this.timer);reject(Error(e.message||'Python 运行环境不可用'));};worker.postMessage({type:'init'});
  });
 }
 async run({id,code,files,entryFile,inputFile,cases,limitSeconds,onStatus,onResult}:{id:number,code:string,files?:Record<string,string>,entryFile?:string,inputFile?:string|null,cases:(TestCase|OfficialManifest['cases'][number])[],limitSeconds:number,onStatus:(s:string)=>void,onResult:(r:TestResult,index:number)=>void}){
  const results:TestResult[]=[];
  try{await this.initialize(onStatus);
   for(let index=0;index<cases.length;index++){
    if(this.stopped)throw Error('已停止运行');let item=cases[index],test:TestCase;
    if('url' in item){onStatus(`正在读取官方文件 ${index+1}/${cases.length} · ${item.name}`);const response=await fetch(item.url,{signal:this.abort.signal});if(!response.ok)throw Error(`测试文件 ${item.name} 加载失败`);const bytes=await response.arrayBuffer();const header=new Uint8Array(bytes);if(header[0]===31&&header[1]===139){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));test=await new Response(stream).json() as TestCase;}else test=JSON.parse(new TextDecoder().decode(bytes)) as TestCase;}else test=item;
    await this.initialize(onStatus);const worker=this.worker!;onStatus(`正在执行 ${index+1}/${cases.length} · ${test.name}`);
    const raw:any=await new Promise((resolve,reject)=>{this.pendingReject=reject;worker.onmessage=({data})=>{if(data.type==='started'){this.timer=setTimeout(()=>{worker.terminate();this.worker=null;this.pendingReject=null;resolve({timeout:true,ms:limitSeconds*1000});},limitSeconds*1000);}else if(data.type==='result'){if(this.timer)clearTimeout(this.timer);this.pendingReject=null;resolve(data);}else if(data.type==='error'){if(this.timer)clearTimeout(this.timer);reject(Error(data.error));}};worker.onerror=e=>{if(this.timer)clearTimeout(this.timer);reject(Error(e.message||'Python 执行失败'));};worker.postMessage({type:'run',code,files,entryFile,input:test.input,inputFile,caseId:index});});
    let result:TestResult;
    if(raw.timeout)result={name:test.name,status:'TLE',ms:raw.ms,detail:`超过本机单文件 ${limitSeconds} 秒限制；不是官方服务器的 TLE 结论。`};
    else if(raw.error)result={name:test.name,status:'RE',error:raw.error,ms:raw.ms};
    else if(test.output===null)result={name:test.name,status:'RUN',output:raw.output.slice(0,12000),expected:null,ms:raw.ms,detail:'自定义输入，仅运行。'};
    else{const check=checkOutput(id,test.input,test.output,raw.output);result={name:test.name,status:check.ok?'AC':'WA',output:raw.output.slice(0,12000),expected:test.output.slice(0,12000),detail:check.detail,ms:raw.ms};}
    results.push(result);onResult(result,index);
   }
   return results;
  }finally{this.worker?.terminate();this.worker=null;if(this.timer)clearTimeout(this.timer);this.pendingReject=null;}
 }
}
