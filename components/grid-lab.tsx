'use client';
import {useEffect,useMemo,useState} from 'react';
import {Play,Pause,ChevronLeft,ChevronRight,RotateCcw,Lightbulb,Check,X,Grid3x3,MousePointerClick,FileCode2} from 'lucide-react';

type Cell=[number,number];
type Mode='bfs'|'dfs';
type Frame={cur:Cell|null;frontier:Cell[];order:Map<string,number>;dist:Map<string,number>;line:number;note:string};

const ROWS=8,COLS=12;
const START:Cell=[0,0],BARN:Cell=[6,10];
const defaultFences=['1,3','1,4','1,5','1,6','2,6','3,6','3,2','4,2','5,2','5,6','5,7','5,8','6,8','2,9','3,9','4,9','4,10'];
const key=(c:Cell)=>c[0]+','+c[1];
const dirs:Cell[]=[[1,0],[-1,0],[0,1],[0,-1]];

const code:Record<Mode,string[]>={
 bfs:['from collections import deque','q = deque([start]); dist = {start: 0}','while q:','    r, c = q.popleft()  # 出队','    for dr, dc in DIRS:','        nr, nc = r + dr, c + dc','        if ok(nr, nc) and (nr, nc) not in dist:','            dist[(nr, nc)] = dist[(r, c)] + 1','            q.append((nr, nc))'],
 dfs:['stack = [start]; seen = {start}','while stack:','    r, c = stack.pop()  # 出栈','    for dr, dc in DIRS:','        nr, nc = r + dr, c + dc','        if ok(nr, nc) and (nr, nc) not in seen:','            seen.add((nr, nc))','            stack.append((nr, nc))','# 换成 stack 后，访问顺序变成“一路走到底”'],
};

function simulate(fences:Set<string>,mode:Mode):Frame[]{
 const ok=(r:number,c:number)=>r>=0&&c>=0&&r<ROWS&&c<COLS&&!fences.has(r+','+c);
 const frames:Frame[]=[];const order=new Map<string,number>(),dist=new Map<string,number>([[key(START),0]]);
 const box:Cell[]=[START];let n=0;
 frames.push({cur:null,frontier:[...box],order:new Map(order),dist:new Map(dist),line:mode==='bfs'?1:0,note:mode==='bfs'?'起点入队，距离记为 0。':'起点入栈。'});
 while(box.length){
  const cur=mode==='bfs'?box.shift()!:box.pop()!;
  order.set(key(cur),++n);
  const added:string[]=[];
  for(const [dr,dc] of dirs){const nr=cur[0]+dr,nc=cur[1]+dc;if(ok(nr,nc)&&!dist.has(nr+','+nc)){dist.set(nr+','+nc,dist.get(key(cur))!+1);box.push([nr,nc]);added.push(`(${nr},${nc})`);}}
  const d=dist.get(key(cur))!;
  frames.push({cur,frontier:[...box],order:new Map(order),dist:new Map(dist),line:mode==='bfs'?3:2,note:`${mode==='bfs'?'出队':'出栈'} (${cur[0]},${cur[1]})${mode==='bfs'?`，距离 ${d}`:''}；${added.length?`新加入 ${added.join(' ')}`:'四周没有新格子'}。${key(cur)===key(BARN)?' 🏁 到达谷仓！':''}`});
 }
 return frames;
}

function pathTo(dist:Map<string,number>):Set<string>{
 const out=new Set<string>();if(!dist.has(key(BARN)))return out;
 let cur=BARN;out.add(key(cur));
 while(dist.get(key(cur))!>0){const d=dist.get(key(cur))!;const nb=dirs.map(([a,b])=>[cur[0]+a,cur[1]+b] as Cell).find(c=>dist.get(key(c))===d-1);if(!nb)break;cur=nb;out.add(key(cur));}
 return out;
}

export function GridLab({defaultMode='bfs'}:{defaultMode?:Mode}){
 const [mode,setMode]=useState<Mode>(defaultMode),[fences,setFences]=useState(()=>new Set(defaultFences)),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[guess,setGuess]=useState<string|null>(null);
 const frames=useMemo(()=>simulate(fences,mode),[fences,mode]);
 const last=frames.length-1,f=frames[Math.min(step,last)];
 const done=step>=last;
 const path=useMemo(()=>done&&mode==='bfs'?pathTo(f.dist):new Set<string>(),[done,mode,f]);
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>setStep(s=>{if(s>=last){setPlaying(false);return s;}return s+1;}),Math.round(420/speed));return()=>clearInterval(t);},[playing,last,speed]);
 const go=(s:number)=>{setPlaying(false);setGuess(null);setStep(Math.max(0,Math.min(last,s)));};
 const reset=(nextFences=fences,nextMode=mode)=>{setPlaying(false);setGuess(null);setStep(0);if(nextFences!==fences)setFences(nextFences);if(nextMode!==mode)setMode(nextMode);};
 const toggleFence=(r:number,c:number)=>{if(playing)return;const k=r+','+c;if(k===key(START)||k===key(BARN))return;const n=new Set(fences);if(n.has(k))n.delete(k);else n.add(k);reset(n);};
 // Predict-the-next-cell quiz
 const next=frames[step+1]?.cur||null;
 const options=useMemo(()=>{
  if(!next)return [];
  const pool=f.frontier.map(key).filter(k=>k!==key(next));
  const pick=[key(next),...pool.slice(mode==='bfs'?-2:0,mode==='bfs'?undefined:2)].slice(0,3);
  return pick.sort();
 },[next,f,mode]);
 const frontier=new Set(f.frontier.map(key));
 const maxD=Math.max(1,...f.dist.values());
 const reached=f.dist.has(key(BARN))&&f.order.has(key(BARN));
 return <section className="lx-gridlab" aria-label="网格搜索实验室">
  <header className="lx-gl-head">
   <div><span className="lx-eyebrow"><Grid3x3 size={13}/>交互实验 · 平面网格</span><h3>牧场网格 {mode==='bfs'?'BFS 洪水填充':'DFS 深度优先'}</h3><p>Bessie 从左上角出发，找到去谷仓的路。<MousePointerClick size={13}/>点击格子可以增删围栏，结果会实时重算。</p></div>
   <div className="lx-segmented lx-segmented-sm" role="tablist" aria-label="搜索方式"><button type="button" role="tab" aria-selected={mode==='bfs'} onClick={()=>reset(fences,'bfs')}>BFS · 队列</button><button type="button" role="tab" aria-selected={mode==='dfs'} onClick={()=>reset(fences,'dfs')}>DFS · 栈</button></div>
  </header>
  <div className="lx-gl-body">
   <div className="lx-gl-main">
    <div className="lx-gl-legend"><span><i className="t-start">🐮</i>起点</span><span><i className="t-seen"/>{mode==='bfs'?'已访问（数字=距离）':'已访问（数字=顺序）'}</span><span><i className="t-front"/>{mode==='bfs'?'队列中':'栈中'}</span><span><i className="t-fence"/>围栏</span><span><i className="t-barn">🏠</i>谷仓</span>{done&&mode==='bfs'&&<span><i className="t-path"/>最短路线</span>}</div>
    <div className="lx-gl-grid" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
     {Array.from({length:ROWS*COLS},(_,i)=>{const r=Math.floor(i/COLS),c=i%COLS,k=r+','+c;const isStart=k===key(START),isBarn=k===key(BARN),fence=fences.has(k),seen=f.order.has(k),front=frontier.has(k),cur=f.cur&&key(f.cur)===k,onPath=path.has(k);
      const d=f.dist.get(k),label=mode==='bfs'?(seen||front?d:undefined):f.order.get(k);
      const cls=['lx-tile',fence?'is-fence':seen?'is-seen':front?'is-front':'is-grass',cur?'is-cur':'',onPath?'is-path':'',isStart?'is-start':'',isBarn?'is-barn':''].join(' ');
      const shade=seen&&mode==='bfs'&&d!=null?{'--lx-depth':String(.35+.65*(1-d/maxD))} as React.CSSProperties:undefined;
      return <button type="button" key={k} className={cls} style={shade} onClick={()=>toggleFence(r,c)} title={`(${r},${c})${fence?' 围栏':''}`} aria-label={`格子 ${r},${c}`}>
       {isStart?<span className="lx-tile-emoji">🐮</span>:isBarn?<span className="lx-tile-emoji">🏠</span>:fence?null:label!=null?<b>{label}</b>:null}
      </button>;})}
    </div>
    <div className="lx-gl-queue">
     <span className="lx-gl-qlabel">{mode==='bfs'?'队列 deque':'栈 stack'}<small>{mode==='bfs'?'左出 · 右进':'右进 · 右出'}</small></span>
     <div className="lx-gl-belt">{f.frontier.length?f.frontier.slice(0,14).map((c,i)=><span key={key(c)+i} className={`lx-gl-chip ${(mode==='bfs'?i===0:i===f.frontier.length-1)?'is-next':''}`}>({c[0]},{c[1]})</span>):<em>空 — 搜索结束</em>}{f.frontier.length>14&&<em>+{f.frontier.length-14}</em>}</div>
    </div>
    <div className="lx-gl-transport">
     <button type="button" className="lx-tbtn" onClick={()=>reset()} aria-label="重置"><RotateCcw size={15}/></button>
     <button type="button" className="lx-tbtn" onClick={()=>go(step-1)} disabled={step===0} aria-label="上一步"><ChevronLeft size={17}/></button>
     <button type="button" className="lx-tbtn lx-tbtn-play" onClick={()=>{if(done)setStep(0);setGuess(null);setPlaying(!playing);}} aria-label={playing?'暂停':'播放'}>{playing?<Pause size={16}/>:<Play size={16}/>}</button>
     <button type="button" className="lx-tbtn" onClick={()=>go(step+1)} disabled={done} aria-label="下一步"><ChevronRight size={17}/></button>
     <button type="button" className="lx-speed" onClick={()=>setSpeed(s=>s===1?2:s===2?0.5:1)}>{speed}×</button>
     <input type="range" className="lx-range" min={0} max={last} value={step} onChange={e=>go(+e.target.value)} aria-label="拖动步骤" style={{'--lx-fill':`${step/Math.max(1,last)*100}%`} as React.CSSProperties}/>
     <span className="lx-counter"><b>{step}</b>/{last}</span>
    </div>
    <p className="lx-caption"><span className="lx-caption-step">步骤 {step}</span><span>{f.note}{done&&mode==='bfs'&&(reached?` 最短需要 ${f.dist.get(key(BARN))} 步。`:' 谷仓被围栏挡住，无法到达。')}</span></p>
   </div>
   <aside className="lx-gl-side">
    <section className="lx-card lx-gl-quiz">
     <header className="lx-card-head"><h3><Lightbulb size={15}/>预测下一步</h3></header>
     {next&&!playing?<>
      <p>下一步会从{mode==='bfs'?'队列':'栈'}中取出哪个格子？</p>
      <div className="lx-gl-options">{options.map(o=>{const right=o===key(next),chosen=guess===o;return <button type="button" key={o} className={`${chosen?(right?'is-right':'is-wrong'):''} ${guess&&right?'is-answer':''}`} disabled={!!guess} onClick={()=>setGuess(o)}>({o}){chosen&&(right?<Check size={13}/>:<X size={13}/>)}</button>;})}</div>
      {guess&&<p className={`lx-gl-feedback ${guess===key(next)?'is-right':'is-wrong'}`}>{guess===key(next)?'答对了！':'再想想：'}{mode==='bfs'?'队列先进先出，总是取最早加入（最左边）的格子。':'栈后进先出，总是取最后加入（最右边）的格子。'}<button type="button" className="lx-link" onClick={()=>go(step+1)}>看下一步<ChevronRight size={13}/></button></p>}
     </>:<p className="lx-muted">{playing?'暂停后可以先猜下一步，再点「下一步」验证。':'搜索已结束。点击格子改动围栏，再试一次。'}</p>}
    </section>
    <section className="lx-code lx-gl-code" aria-label="对应代码">
     <header className="lx-code-bar"><span className="lx-code-tab"><FileCode2 size={13}/>{mode}.py</span><span className="lx-code-sync"><i/>第 {f.line+1} 行</span></header>
     <div className="lx-code-body">{code[mode].map((l,i)=><div key={i} className={`lx-code-line ${i===f.line?'is-active':''}`}><span className="lx-ln">{i+1}</span><code>{l}</code></div>)}</div>
    </section>
    <section className="lx-card lx-gl-stats">
     <div><b>{f.order.size}</b><small>已访问</small></div>
     <div><b>{f.frontier.length}</b><small>{mode==='bfs'?'队列长度':'栈长度'}</small></div>
     <div><b>{ROWS*COLS-fences.size}</b><small>可走格子</small></div>
     <p>每个格子最多进出一次，复杂度 O(R·C)；铜组网格 R·C ≤ 10⁶ 时也能在时限内完成。</p>
    </section>
   </aside>
  </div>
 </section>;
}
