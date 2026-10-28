'use client';
import {useMemo,useState} from 'react';
import {Grid3x3,MousePointerClick,Sigma,Table2,Square,RotateCcw} from 'lucide-react';

type Rect={r1:number;c1:number;r2:number;c2:number};
const norm=(a:[number,number],b:[number,number]):Rect=>({r1:Math.min(a[0],b[0]),c1:Math.min(a[1],b[1]),r2:Math.max(a[0],b[0]),c2:Math.max(a[1],b[1])});
const inside=(r:number,c:number,q:Rect|null)=>!!q&&r>=q.r1&&r<=q.r2&&c>=q.c1&&c<=q.c2;

/** Drag-to-select helper shared by both labs. */
function useDragSelect(onDone:(rect:Rect)=>void){
 const [anchor,setAnchor]=useState<[number,number]|null>(null),[hover,setHover]=useState<[number,number]|null>(null);
 const live=anchor&&hover?norm(anchor,hover):null;
 return {live,dragging:!!anchor,
  down:(r:number,c:number)=>{setAnchor([r,c]);setHover([r,c]);},
  enter:(r:number,c:number)=>{if(anchor)setHover([r,c]);},
  up:()=>{if(anchor&&hover)onDone(norm(anchor,hover));setAnchor(null);setHover(null);}};
}

/* ========================= 2D prefix sums ========================= */
const HAY=[[3,1,4,1,5,9,2,6],[5,3,5,8,9,7,9,3],[2,3,8,4,6,2,6,4],[3,3,8,3,2,7,9,5],[0,2,8,8,4,1,9,7],[1,6,9,3,9,9,3,7]];
const R=HAY.length,C=HAY[0].length;

export function PrefixLab(){
 const P=useMemo(()=>{const p=Array.from({length:R+1},()=>Array(C+1).fill(0));for(let r=1;r<=R;r++)for(let c=1;c<=C;c++)p[r][c]=HAY[r-1][c-1]+p[r-1][c]+p[r][c-1]-p[r-1][c-1];return p;},[]);
 const [sel,setSel]=useState<Rect>({r1:1,c1:2,r2:3,c2:5}),[view,setView]=useState<'raw'|'prefix'>('raw');
 const drag=useDragSelect(setSel);
 const q=drag.live||sel;
 // 1-based corners for the formula
 const a=q.r1,b=q.c1,cR=q.r2+1,cC=q.c2+1;
 const big=P[cR][cC],top=P[a][cC],left=P[cR][b],corner=P[a][b];
 const ans=big-top-left+corner;
 let brute=0;for(let r=q.r1;r<=q.r2;r++)for(let c=q.c1;c<=q.c2;c++)brute+=HAY[r][c];
 const cells=(q.r2-q.r1+1)*(q.c2-q.c1+1);
 const role=(r:number,c:number)=>{ // r,c are 1-based prefix-table coordinates
  if(r===cR&&c===cC)return 'is-big';if(r===a&&c===cC)return 'is-top';if(r===cR&&c===b)return 'is-left';if(r===a&&c===b)return 'is-corner';return '';};
 return <section className="lx-gridlab lx-geolab" aria-label="二维前缀和实验">
  <header className="lx-gl-head">
   <div><span className="lx-eyebrow"><Grid3x3 size={13}/>交互实验 · 平面网格</span><h3>二维前缀和：O(1) 求任意矩形的草料总数</h3><p>每格数字是草料捆数。<MousePointerClick size={13}/>在网格上拖动，框出任意矩形。</p></div>
   <div className="lx-segmented lx-segmented-sm" role="tablist"><button type="button" role="tab" aria-selected={view==='raw'} onClick={()=>setView('raw')}><Grid3x3 size={12}/>原数组 a</button><button type="button" role="tab" aria-selected={view==='prefix'} onClick={()=>setView('prefix')}><Table2 size={12}/>前缀和表 P</button></div>
  </header>
  <div className="lx-gl-body">
   <div className="lx-gl-main">
    {view==='raw'?<div className="lx-geo-grid" style={{gridTemplateColumns:`28px repeat(${C},1fr)`}} onPointerLeave={drag.up} onPointerUp={drag.up}>
     <span/>{Array.from({length:C},(_,c)=><span key={c} className="lx-geo-axis">{c}</span>)}
     {HAY.map((row,r)=><div key={r} style={{display:'contents'}}><span className="lx-geo-axis">{r}</span>{row.map((v,c)=><button type="button" key={c} className={`lx-tile lx-geo-cell ${inside(r,c,q)?'is-front':'is-grass'}`} onPointerDown={e=>{e.preventDefault();drag.down(r,c);}} onPointerEnter={()=>drag.enter(r,c)}><b>{v}</b></button>)}</div>)}
    </div>:<div className="lx-geo-grid is-prefix" style={{gridTemplateColumns:`28px repeat(${C+1},1fr)`}}>
     <span/>{Array.from({length:C+1},(_,c)=><span key={c} className="lx-geo-axis">{c}</span>)}
     {P.map((row,r)=><div key={r} style={{display:'contents'}}><span className="lx-geo-axis">{r}</span>{row.map((v,c)=><span key={c} className={`lx-geo-p ${r===0||c===0?'is-pad':''} ${role(r,c)}`}>{v}</span>)}</div>)}
    </div>}
    <div className="lx-geo-formula">
     <span className="lx-geo-term is-big">P[{cR}][{cC}]<b>{big}</b></span><em>−</em>
     <span className="lx-geo-term is-top">P[{a}][{cC}]<b>{top}</b></span><em>−</em>
     <span className="lx-geo-term is-left">P[{cR}][{b}]<b>{left}</b></span><em>+</em>
     <span className="lx-geo-term is-corner">P[{a}][{b}]<b>{corner}</b></span><em>=</em>
     <span className="lx-geo-term is-ans">答案<b>{ans}</b></span>
    </div>
    <p className="lx-caption"><span className="lx-caption-step">选区</span><span>行 {q.r1}–{q.r2}、列 {q.c1}–{q.c2}，共 {cells} 格。暴力逐格相加 = {brute}，{brute===ans?'和公式结果一致 ✓':'不一致'}。切到「前缀和表」看四个角分别取自哪里。</span></p>
   </div>
   <aside className="lx-gl-side">
    <section className="lx-code lx-gl-code"><header className="lx-code-bar"><span className="lx-code-tab"><Sigma size={13}/>prefix2d.py</span></header>
     <div className="lx-code-body">{['# P 多一行一列 0，避免下标越界','P = [[0]*(C+1) for _ in range(R+1)]','for r in range(1, R+1):','    for c in range(1, C+1):','        P[r][c] = a[r-1][c-1] + P[r-1][c] \\','                  + P[r][c-1] - P[r-1][c-1]','','def area_sum(r1, c1, r2, c2):  # 0-based 闭区间','    return (P[r2+1][c2+1] - P[r1][c2+1]','            - P[r2+1][c1] + P[r1][c1])'].map((l,i)=><div key={i} className={`lx-code-line ${i>=7?'is-active':''}`}><span className="lx-ln">{i+1}</span><code>{l||' '}</code></div>)}</div>
    </section>
    <section className="lx-card lx-gl-stats">
     <div><b>{cells}</b><small>暴力：逐格相加</small></div>
     <div><b>4</b><small>前缀和：查表次数</small></div>
     <div><b>{R*C}</b><small>预处理一次</small></div>
     <p>预处理 O(R·C)，之后每次询问 O(1)。Q 次询问时总复杂度从 O(Q·R·C) 降到 O(R·C + Q)。</p>
    </section>
   </aside>
  </div>
 </section>;
}

/* ========================= rectangle overlap ========================= */
const GR=10,GC=14;
export function RectLab(){
 const [rects,setRects]=useState<{A:Rect;B:Rect}>({A:{r1:1,c1:1,r2:6,c2:7},B:{r1:4,c1:5,r2:8,c2:12}}),[edit,setEdit]=useState<'A'|'B'>('B');
 const drag=useDragSelect(r=>setRects(v=>({...v,[edit]:r})));
 const A=edit==='A'&&drag.live?drag.live:rects.A,B=edit==='B'&&drag.live?drag.live:rects.B;
 const area=(q:Rect)=>(q.r2-q.r1+1)*(q.c2-q.c1+1);
 const ow=Math.max(0,Math.min(A.c2,B.c2)-Math.max(A.c1,B.c1)+1),oh=Math.max(0,Math.min(A.r2,B.r2)-Math.max(A.r1,B.r1)+1),ov=ow*oh;
 // Coordinates in USACO style: cell (r,c) spans x∈[c,c+1], y∈[r,r+1]
 return <section className="lx-gridlab lx-geolab" aria-label="矩形重叠实验">
  <header className="lx-gl-head">
   <div><span className="lx-eyebrow"><Square size={13}/>交互实验 · 平面网格</span><h3>矩形重叠：面积、并集与被遮挡部分</h3><p>选择要修改的矩形，<MousePointerClick size={13}/>在牧场上拖动重新画出它。</p></div>
   <div className="lx-segmented lx-segmented-sm" role="tablist"><button type="button" role="tab" aria-selected={edit==='A'} onClick={()=>setEdit('A')}><i className="lx-sw is-a"/>画 A（FJ 的广告牌）</button><button type="button" role="tab" aria-selected={edit==='B'} onClick={()=>setEdit('B')}><i className="lx-sw is-b"/>画 B（遮挡的卡车）</button></div>
  </header>
  <div className="lx-gl-body">
   <div className="lx-gl-main">
    <div className="lx-gl-legend"><span><i className="t-a"/>只属于 A</span><span><i className="t-b"/>只属于 B</span><span><i className="t-ab"/>重叠 A∩B</span></div>
    <div className="lx-gl-grid" style={{gridTemplateColumns:`repeat(${GC},1fr)`}} onPointerLeave={drag.up} onPointerUp={drag.up}>
     {Array.from({length:GR*GC},(_,i)=>{const r=Math.floor(i/GC),c=i%GC,inA=inside(r,c,A),inB=inside(r,c,B);
      return <button type="button" key={i} className={`lx-tile ${inA&&inB?'is-ab':inA?'is-a':inB?'is-b':'is-grass'}`} onPointerDown={e=>{e.preventDefault();drag.down(r,c);}} onPointerEnter={()=>drag.enter(r,c)} aria-label={`格子 ${r},${c}`}>{null}</button>;})}
    </div>
    <div className="lx-geo-formula">
     <span className="lx-geo-term is-a">宽 = min({A.c2+1},{B.c2+1}) − max({A.c1},{B.c1})<b>{ow}</b></span><em>×</em>
     <span className="lx-geo-term is-b">高 = min({A.r2+1},{B.r2+1}) − max({A.r1},{B.r1})<b>{oh}</b></span><em>=</em>
     <span className="lx-geo-term is-ans">重叠<b>{ov}</b></span>
    </div>
    <p className="lx-caption"><span className="lx-caption-step">关键</span><span>宽或高算出来是负数时说明不相交，要用 max(0, …) 截断，否则会得到错误的“负面积”。</span></p>
   </div>
   <aside className="lx-gl-side">
    <section className="lx-card lx-geo-results">
     <header className="lx-card-head"><h3><Sigma size={15}/>计算结果</h3><button type="button" className="lx-link lx-link-muted" onClick={()=>setRects({A:{r1:1,c1:1,r2:6,c2:7},B:{r1:4,c1:5,r2:8,c2:12}})}><RotateCcw size={12}/>重置</button></header>
     <dl>
      <div><dt><i className="lx-sw is-a"/>面积 A</dt><dd>{area(A)}</dd></div>
      <div><dt><i className="lx-sw is-b"/>面积 B</dt><dd>{area(B)}</dd></div>
      <div><dt><i className="lx-sw is-ab"/>重叠 A∩B</dt><dd>{ov}</dd></div>
      <div className="is-key"><dt>并集 A∪B = A + B − 重叠</dt><dd>{area(A)+area(B)-ov}</dd></div>
      <div className="is-key"><dt>A 未被遮挡 = A − 重叠</dt><dd>{area(A)-ov}</dd></div>
     </dl>
    </section>
    <section className="lx-code lx-gl-code"><header className="lx-code-bar"><span className="lx-code-tab"><Sigma size={13}/>rect.py</span></header>
     <div className="lx-code-body">{['def overlap(a, b):  # (x1, y1, x2, y2)','    w = min(a[2], b[2]) - max(a[0], b[0])','    h = min(a[3], b[3]) - max(a[1], b[1])','    return max(0, w) * max(0, h)','','union = area(a) + area(b) - overlap(a, b)'].map((l,i)=><div key={i} className={`lx-code-line ${i===3?'is-active':''}`}><span className="lx-ln">{i+1}</span><code>{l||' '}</code></div>)}</div>
    </section>
   </aside>
  </div>
 </section>;
}
