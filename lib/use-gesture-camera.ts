'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {GestureGate,type GestureSignal,type VisionFrame,type GestureOptions} from './whiteboard-gestures';
export type CameraPhase='off'|'permission'|'loading'|'running'|'error';
const lifted:GestureSignal={mode:'none',point:null,label:'手势书写未开启',progress:0,breakStroke:true};
export function useGestureCamera(onSignal:(signal:GestureSignal)=>void,options?:()=>GestureOptions){
 const [phase,setPhase]=useState<CameraPhase>('off'),[error,setError]=useState('');
 const callback=useRef(onSignal);callback.current=onSignal;
 const gateOptions=useRef(options);gateOptions.current=options;
 const session=useRef(0),cleanup=useRef<()=>void>(()=>{});
 const stop=useCallback(()=>{session.current++;cleanup.current();cleanup.current=()=>{};callback.current(lifted);setPhase('off');},[]);
 const start=useCallback(async()=>{
  stop();setError('');const id=session.current;setPhase('permission');
  let stream:MediaStream|null=null,worker:Worker|null=null,video:HTMLVideoElement|null=null,raf=0,readyTimer:ReturnType<typeof setTimeout>|undefined,frameTimer:ReturnType<typeof setTimeout>|undefined;
  const dispose=()=>{cancelAnimationFrame(raf);clearTimeout(readyTimer);clearTimeout(frameTimer);worker?.terminate();if(video){video.pause();video.srcObject=null;video.remove();}stream?.getTracks().forEach(t=>{t.onended=null;t.stop();});};
  cleanup.current=dispose;
  const fail=(message:string)=>{if(session.current!==id)return;session.current++;dispose();cleanup.current=()=>{};callback.current(lifted);setError(message);setPhase('error');};
  try{
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('请在 HTTPS 页面中使用摄像头；当前仍可用鼠标或触控笔书写。');
   if(typeof Worker==='undefined'||typeof createImageBitmap==='undefined'||typeof OffscreenCanvas==='undefined')throw new Error('此浏览器暂不支持手势书写，请用新版 Chrome 或 Edge。鼠标与触控笔仍可使用。');
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}},audio:false});
   if(session.current!==id){dispose();return;}
   stream.getVideoTracks().forEach(t=>{t.onended=()=>fail('摄像头已断开，请重新开启手势书写。');});
   video=document.createElement('video');video.muted=true;video.playsInline=true;video.autoplay=true;video.setAttribute('aria-hidden','true');video.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;top:0;opacity:0;pointer-events:none';
   document.body.appendChild(video);video.srcObject=stream;await video.play();
   if(session.current!==id){dispose();return;}
   setPhase('loading');worker=new Worker('/whiteboard/gesture-worker.js');const gate=new GestureGate();
   readyTimer=setTimeout(()=>fail('手势模型载入超时。请检查网络后重试；白板仍可正常书写。'),60000);
   let busy=false,lastFrame=0,lastVideo=-1;
   const tick=async(time:number)=>{
    if(session.current!==id)return;raf=requestAnimationFrame(tick);
    if(busy||time-lastFrame<45||!video||video.readyState<2||video.currentTime===lastVideo)return;
    busy=true;lastFrame=time;lastVideo=video.currentTime;
    try{const bitmap=await createImageBitmap(video);if(session.current!==id){bitmap.close();return;}
     worker!.postMessage({type:'frame',bitmap,timestamp:performance.now()},[bitmap]);frameTimer=setTimeout(()=>fail('手势识别暂时没有响应，请关闭后重新开启。'),10000);
    }catch{fail('摄像头画面读取失败，请关闭占用摄像头的其他应用后重试。');}
   };
   worker.onmessage=(event:MessageEvent)=>{
    if(session.current!==id)return;const message=event.data;
    if(message.type==='ready'){clearTimeout(readyTimer);setPhase('running');raf=requestAnimationFrame(tick);}
    else if(message.type==='result'){clearTimeout(frameTimer);busy=false;callback.current(gate.update(message as VisionFrame,gateOptions.current?.()));}
    else if(message.type==='error')fail('手势模型未能启动。请使用新版 Chrome 或 Edge，再试一次；鼠标书写不受影响。');
   };
   worker.onerror=()=>fail('手势识别加载失败，请刷新页面后重试。鼠标与触控笔仍可使用。');
   worker.postMessage({type:'init'});
  }catch(e){
   const name=e instanceof Error?e.name:'',message=e instanceof Error?e.message:'无法启用摄像头';
   fail(name==='NotAllowedError'?(window.self!==window.top?'请在浏览器新标签页直接打开网站，并允许摄像头权限后重试。':'摄像头权限未开放。请在浏览器地址栏允许此网站使用摄像头，然后重试。'):name==='NotFoundError'?'未找到摄像头。请连接摄像头，或继续使用鼠标与触控笔。':name==='NotReadableError'?'摄像头正被其他应用占用，请关闭占用后重试。':message);
  }
 },[stop]);
 useEffect(()=>{
  const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
  return()=>{session.current++;cleanup.current();callback.current(lifted);document.removeEventListener('visibilitychange',hidden);};
 },[stop]);
 return {phase,error,start,stop};
}
