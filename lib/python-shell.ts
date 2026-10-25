export type ShellResult={type:'result';id:number;incomplete?:boolean;output:string;stderr:string;error:string;truncated?:boolean;ms:number};
export class PythonShellRuntime{
 private worker:Worker|null=null;
 private initialized=false;
 private sequence=0;
 private pending:((error:Error)=>void)|null=null;
 private timer:ReturnType<typeof setTimeout>|null=null;
 private ready:Promise<void>|null=null;
 private disposed=false;
 constructor(private onStatus:(message:string)=>void){}
 async initialize(){
  if(this.disposed)throw Error('Shell 会话已停止，请重新运行。');
  if(this.initialized)return;
  if(this.ready)return this.ready;
  this.onStatus('正在启动 Python…');
  this.ready=new Promise<void>((resolve,reject)=>{
   try{
    const w=new Worker('/python-shell-worker.js');this.worker=w;this.pending=reject;
    const fail=(error:Error)=>{if(this.timer)clearTimeout(this.timer);this.worker?.terminate();this.worker=null;this.ready=null;this.pending=null;reject(error);};
    this.timer=setTimeout(()=>fail(Error('Python 启动超时，请重试。')),120000);
    w.onmessage=({data})=>{if(data.type==='ready'){if(this.timer)clearTimeout(this.timer);this.initialized=true;this.pending=null;this.onStatus(`Python ${data.version} · 会话变量已保留`);resolve();}else if(data.type==='error')fail(Error(data.error));};
    w.onerror=()=>fail(Error('Python 环境加载失败，请重试。'));w.postMessage({type:'init'});
   }catch(error){this.ready=null;reject(error);}
  });
  return this.ready;
 }
 async execute(code:string,input='',force=false):Promise<ShellResult>{
  await this.initialize();if(this.disposed||!this.worker)throw Error('Shell 会话已停止。');
  if(this.pending)throw Error('请等待当前代码执行结束。');
  const w=this.worker,id=++this.sequence;this.onStatus('正在执行…');
  return new Promise((resolve,reject)=>{
   this.pending=reject;
   this.timer=setTimeout(()=>{this.stop('执行超过 10 秒，已停止并重置会话变量。');},10000);
   w.onmessage=({data})=>{if(data.id!==id)return;if(this.timer)clearTimeout(this.timer);this.pending=null;if(data.type==='error'){reject(Error(data.error));return;}if(data.type==='result'){this.onStatus(data.incomplete?'代码未结束，继续输入…':'就绪 · 会话变量已保留');resolve(data);}};
   w.onerror=()=>{this.stop('Python 执行失败，会话已重置。');};
   w.postMessage({type:'execute',id,code,input,force});
  });
 }
 stop(message='已停止并重置会话变量。'){
  this.disposed=true;this.worker?.terminate();this.worker=null;this.initialized=false;this.ready=null;
  if(this.timer)clearTimeout(this.timer);this.timer=null;const reject=this.pending;this.pending=null;reject?.(Error(message));
 }
}
