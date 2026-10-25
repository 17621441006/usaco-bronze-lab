'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal,flushSync} from 'react-dom';
import {ExternalLink,Maximize2,Minimize2,Minus,Plus,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import sources from '@/data/statement-sources.json';
import builtIn from '@/data/local-statements.json';
import {sanitizeStatement,statementKey,type StatementDocument} from '@/lib/statement-document';
import {LocalStatement} from './local-statement';
import {AnnotationLauncher} from './annotation-launcher';
import {CodingToolLaunchers} from './coding-tool-launchers';

/** Supplied statements are bundled; older documents retain their official reader. */
export function OfficialStatement({id,title,exam=false,toolbarHost}:{id:number;title:string;exam?:boolean;toolbarHost?:HTMLElement|null}){
 const baked=(builtIn as Record<string,StatementDocument>)[id];
 const [saved,setSaved]=useState<{id:number;document:StatementDocument}|null>(null),[checkedId,setCheckedId]=useState<number|null>(null);
 const localDocument=baked||(saved?.id===id?saved.document:null),documentReady=!!baked||checkedId===id;
 useEffect(()=>{if(!baked)try{const value=localStorage.getItem(statementKey(id));if(value){const d=JSON.parse(value);setSaved({id,document:{source:String(d.source||'本机题面'),updatedAt:String(d.updatedAt||''),en:typeof d.en==='string'?sanitizeStatement(d.en):undefined,zh:typeof d.zh==='string'?sanitizeStatement(d.zh):undefined}});}}catch{}finally{setCheckedId(id);}},[id,baked]);
 const source=sources.problems.find(p=>p.id===id);
 const [language,setLanguage]=useState('en'),[expanded,setExpanded]=useState(false),[reload,setReload]=useState(0),[zoom,setZoom]=useState(100),[fontSize,setFontSize]=useState(18),[fullscreenNote,setFullscreenNote]=useState('');
 const panel=useRef<HTMLDivElement>(null),native=useRef(false),previousFocus=useRef<HTMLElement|null>(null);
 const [loadState,setLoadState]=useState<'loading'|'loaded'|'slow'|'error'>('loading');
 const selectedLanguage=exam?'en':language,englishUrl=source?.englishUrl||`https://usaco.org/index.php?page=viewproblem2&cpid=${id}&lang=en`;
 const pageUrl=selectedLanguage==='zh'&&source?.chineseUrl?source.chineseUrl:englishUrl,frameUrl=`${pageUrl}#probtext-text`;
 const localHtml=selectedLanguage==='zh'?localDocument?.zh:localDocument?.en,hasChinese=!!localDocument?.zh||!!source?.chineseUrl;
 function closeReader(){if(document.fullscreenElement===panel.current)void document.exitFullscreen().catch(()=>{});native.current=false;setExpanded(false);}
 async function openReader(){previousFocus.current=document.activeElement as HTMLElement;setFullscreenNote('');flushSync(()=>setExpanded(true));try{if(!panel.current?.requestFullscreen)throw new Error('unsupported');await panel.current.requestFullscreen();native.current=true;}catch{setFullscreenNote('浏览器未允许系统全屏，已使用整窗阅读。');}}
 useEffect(()=>{setLanguage('en');closeReader();},[id,exam]);
 useEffect(()=>{if(localHtml)return;setLoadState('loading');const timeout=setTimeout(()=>setLoadState(s=>s==='loading'?'slow':s),12000);return()=>clearTimeout(timeout);},[frameUrl,expanded,reload,localHtml]);
 useEffect(()=>{
  if(!expanded)return;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.focus();window.dispatchEvent(new Event('usaco-reader-change'));
  const changed=()=>{if(document.fullscreenElement===panel.current)native.current=true;else if(native.current){native.current=false;setExpanded(false);}};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeReader();}if(e.key==='Tab'&&panel.current){const nodes=[...panel.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')].filter(el=>el.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}};
  document.addEventListener('fullscreenchange',changed);document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('fullscreenchange',changed);document.removeEventListener('keydown',key);previousFocus.current?.focus();requestAnimationFrame(()=>window.dispatchEvent(new Event('usaco-reader-change')));};
 },[expanded]);
 const toolbar=<div className="original-toolbar"><Tabs value={selectedLanguage} onValueChange={setLanguage}><TabsList aria-label="题面语言"><TabsTrigger value="en" title="完整英文原题">English</TabsTrigger>{!exam&&hasChinese&&<TabsTrigger value="zh" title={localDocument?.translation==='unofficial'?'中文译文 · 非官方翻译':'完整中文题面'}>中文</TabsTrigger>}</TabsList></Tabs><div className="original-actions">{!expanded&&<Button variant="ghost" size="icon" aria-label="全屏读题" title="全屏读题" onClick={openReader}><Maximize2 size={15}/></Button>}<a href={pageUrl} target="_blank" rel="noreferrer" aria-label="官方来源" title="官方来源"><ExternalLink size={15}/></a></div></div>;
 const content=<div className="statement-document" data-annotation-anchor={`statement-${id}-${selectedLanguage}`}>
  {!documentReady?<p role="status">正在读取题面…</p>:localHtml?<LocalStatement key={`${id}-${selectedLanguage}`} html={localHtml}/>:<><div className="original-frame-wrap" aria-busy={loadState==='loading'}>{loadState==='loading'&&<p className="original-loading" role="status">正在载入官方原题…</p>}<iframe key={`${frameUrl}-${reload}`} className="original-frame" src={frameUrl} title={`${title} · ${selectedLanguage==='zh'?'官方中文题面':'Official English statement'}`} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" onLoad={()=>setLoadState('loaded')} onError={()=>setLoadState('error')}/></div>{(loadState==='slow'||loadState==='error')&&<div className="original-load-help" role="status"><span>原题可能仍在加载，也可以在新页直接阅读。</span><Button size="sm" variant="outline" onClick={()=>setReload(v=>v+1)}><RotateCcw size={14}/>重新载入</Button><a href={pageUrl} target="_blank" rel="noreferrer">打开官方原题</a></div>}<p className="original-mobile-note">这道经典题目前通过官网阅读。{!exam&&!hasChinese?'暂无中文全文。':''}</p></>}
 </div>;
 return <section className="official-statement" aria-label="完整官方原题">{!expanded&&toolbarHost&&createPortal(toolbar,toolbarHost)}{!expanded&&<>{!toolbarHost&&toolbar}{content}</>}{expanded&&createPortal(<div ref={panel} className="statement-fullscreen" role="dialog" aria-modal="true" aria-label={`${title} · 全屏读题`} tabIndex={-1}>
  <header className="reader-fullscreen-toolbar"><strong>{title}</strong>{toolbar}<div className="reader-zoom" role="group" aria-label="题面整体缩放"><button aria-label="缩小题面" disabled={zoom<=60} onClick={()=>setZoom(z=>Math.max(60,z-10))}><Minus size={15}/></button><button aria-label="还原题面缩放" title="还原至 100%" onClick={()=>setZoom(100)}>{zoom}%</button><button aria-label="放大题面" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+10))}><Plus size={15}/></button></div><label className="reader-font" title={!localHtml?'官网嵌入题面请使用整体缩放调整文字':'只调整题面字号'}>字号<select aria-label="题面字号" value={fontSize} disabled={!localHtml} onChange={e=>setFontSize(+e.target.value)}>{[14,16,18,20,22,24,28,32].map(n=><option key={n} value={n}>{n}px</option>)}</select></label><CodingToolLaunchers/><AnnotationLauncher/><button className="reader-exit" aria-label="退出全屏读题" onClick={closeReader}><Minimize2 size={15}/><span>退出</span><kbd>Esc</kbd></button></header>
  {fullscreenNote&&<p className="reader-notice" role="status">{fullscreenNote}</p>}
  <div className={`statement-fullscreen-scroll ${localHtml?'':'is-embedded'}`}><div className="statement-zoom-content" style={{zoom:zoom/100,'--reader-font-size':`${fontSize}px`,'--reader-zoom':zoom/100} as CSSProperties}>{content}</div></div>
 </div>,document.body)}</section>;
}
