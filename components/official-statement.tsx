'use client';

import { useEffect, useState } from 'react';
import {createPortal} from 'react-dom';
import { ExternalLink, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import sources from '@/data/statement-sources.json';
import builtIn from '@/data/local-statements.json';
import {sanitizeStatement,statementKey,type StatementDocument} from '@/lib/statement-document';
import {LocalStatement} from './local-statement';

/** The supplied anthology is bundled with the site; older documents keep their existing reader. */
export function OfficialStatement({ id, title, exam = false, toolbarHost }: { id: number; title: string; exam?: boolean;toolbarHost?:HTMLElement|null }) {
  const baked=(builtIn as Record<string,StatementDocument>)[id];
  const [saved,setSaved]=useState<{id:number;document:StatementDocument}|null>(null),[checkedId,setCheckedId]=useState<number|null>(null);
  const localDocument=baked||(saved?.id===id?saved.document:null);
  const documentReady=!!baked||checkedId===id;
  useEffect(()=>{if(!baked)try{const value=localStorage.getItem(statementKey(id));if(value){const d=JSON.parse(value);setSaved({id,document:{source:String(d.source||'本机题面'),updatedAt:String(d.updatedAt||''),en:typeof d.en==='string'?sanitizeStatement(d.en):undefined,zh:typeof d.zh==='string'?sanitizeStatement(d.zh):undefined}});}}catch{}finally{setCheckedId(id);}},[id,baked]);
  const source=sources.problems.find(p=>p.id===id);
  const [language,setLanguage]=useState('en'),[expanded,setExpanded]=useState(false),[reload,setReload]=useState(0);
  const [loadState,setLoadState]=useState<'loading'|'loaded'|'slow'|'error'>('loading');
  useEffect(()=>{setLanguage('en');setExpanded(false);},[id,exam]);
  const selectedLanguage=exam?'en':language;
  const englishUrl=source?.englishUrl||`https://usaco.org/index.php?page=viewproblem2&cpid=${id}&lang=en`;
  const pageUrl=selectedLanguage==='zh'&&source?.chineseUrl?source.chineseUrl:englishUrl;
  const frameUrl=`${pageUrl}#probtext-text`;
  const localHtml=selectedLanguage==='zh'?localDocument?.zh:localDocument?.en;
  const hasChinese=!!localDocument?.zh||!!source?.chineseUrl;
  useEffect(()=>{if(localHtml)return;setLoadState('loading');const timeout=setTimeout(()=>setLoadState(s=>s==='loading'?'slow':s),12000);return()=>clearTimeout(timeout);},[frameUrl,expanded,reload,localHtml]);
  const toolbar=<div className="original-toolbar"><Tabs value={selectedLanguage} onValueChange={setLanguage}><TabsList aria-label="题面语言"><TabsTrigger value="en" title="完整英文原题">English</TabsTrigger>{!exam&&hasChinese&&<TabsTrigger value="zh" title={localDocument?.translation==='unofficial'?'中文译文 · 非官方翻译':'完整中文题面'}>中文</TabsTrigger>}</TabsList></Tabs><div className="original-actions">{!expanded&&<Button variant="ghost" size="icon" aria-label="全屏读题" title="全屏读题" onClick={()=>setExpanded(true)}><Maximize2 size={15}/></Button>}<a href={pageUrl} target="_blank" rel="noreferrer" aria-label="官方来源" title="官方来源"><ExternalLink size={15}/></a></div></div>;
  const reader=<>{(!toolbarHost||expanded)&&toolbar}
    {!documentReady?<p role="status">正在读取题面…</p>:localHtml?<LocalStatement key={`${id}-${selectedLanguage}`} html={localHtml}/>:<><div className="original-frame-wrap" aria-busy={loadState==='loading'}>{loadState==='loading'&&<p className="original-loading" role="status">正在载入官方原题…</p>}<iframe key={`${frameUrl}-${reload}`} className="original-frame" src={frameUrl} title={`${title} · ${selectedLanguage==='zh'?'官方中文题面':'Official English statement'}`} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" onLoad={()=>setLoadState('loaded')} onError={()=>setLoadState('error')}/></div>{(loadState==='slow'||loadState==='error')&&<div className="original-load-help" role="status"><span>原题可能仍在加载。也可以在新页直接阅读。</span><Button size="sm" variant="outline" onClick={()=>setReload(v=>v+1)}><RotateCcw size={14}/>重新载入</Button><a href={pageUrl} target="_blank" rel="noreferrer">打开官方原题</a></div>}<p className="original-mobile-note">这道经典题目前通过官网阅读。{!exam&&!hasChinese?'暂无中文全文。':''}</p></>}
  </>;
  return <section className="official-statement" aria-label="完整官方原题">{!expanded&&toolbarHost&&createPortal(toolbar,toolbarHost)}{!expanded&&reader}<Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="statement-reader-dialog"><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">完整题目阅读区，关闭后返回原页面。</DialogDescription><div className="statement-reader-body">{expanded&&reader}</div></DialogContent></Dialog></section>;
}
