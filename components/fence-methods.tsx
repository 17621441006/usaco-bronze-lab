'use client';
import {useState} from 'react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {fenceMethods} from '@/data/fence-methods';
export function FenceMethods({interval,step}:{interval:number[];step:number}){
 const [method,setMethod]=useState<'marking'|'formula'>('marking'),[language,setLanguage]=useState<'python'|'cpp'>('python');const [a,b,c,d]=interval;const overlap=Math.max(0,Math.min(b,d)-Math.max(a,c));
 const painted=Array.from({length:12},(_,x)=>({fj:step>=1&&x>=a&&x<b,bessie:step>=2&&x>=c&&x<d}));
 return <section className="method-compare"><h3>同一道题，两种建模方法</h3><Tabs value={method} onValueChange={v=>setMethod(v as 'marking'|'formula')}><TabsList><TabsTrigger value="marking">一维列表标记</TabsTrigger><TabsTrigger value="formula">区间长度公式</TabsTrigger></TabsList></Tabs>{method==='marking'?<><p>painted[x] 记录的是从 x 到 x+1 的一段栅栏。刷过就设为 1；重复刷仍为 1，不需要再加一次。</p><div className="marker-strip" aria-label="单位区间标记数组">{painted.map((p,x)=><div key={x} className={'marker-unit '+(p.fj&&p.bessie?'both':p.fj?'fj':p.bessie?'bessie':'')}>{p.fj||p.bessie?1:0}<small>[{x},{x+1})</small></div>)}</div><p>当前标记之和：<strong>{painted.filter(p=>p.fj||p.bessie).length}</strong>。拖动上方端点，再观察数组如何变化。颜色区分两位角色；紫色虽然刷了两遍，数值仍是 1。</p></>:<p>先相加，再减去重复部分：({b}−{a}) + ({d}−{c}) − {overlap} = <strong>{b-a+d-c-overlap}</strong>。若不相交或仅端点相接，重叠长度就是 0。</p>}<p>{fenceMethods[method].complexity}</p><Tabs value={language} onValueChange={v=>setLanguage(v as 'python'|'cpp')}><TabsList><TabsTrigger value="python">Python 3</TabsTrigger><TabsTrigger value="cpp">C++17</TabsTrigger></TabsList></Tabs><pre><code>{fenceMethods[method][language]}</code></pre><p>这里使用站内标准输入输出。标记法假设本题的坐标是非负整数；负坐标需要偏移，非整数或巨大范围应改用区间方法。</p></section>;
}
