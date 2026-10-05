export type StatementDocument={en?:string;zh?:string;source:string;updatedAt:string;translation?:'official'|'unofficial';title?:string;year?:number};
export const statementKey=(id:number)=>`usaco-local-statement-${id}`;
/** Keep only inert, readable structure from a user-provided document. */
export function sanitizeStatement(raw:string,isPlain=false):string {
 const document=new DOMParser().parseFromString(raw,'text/html');
 if(isPlain){const block=document.createElement('pre');block.textContent=raw;return block.outerHTML;}
 const body=document.querySelector('#probtext-text')||document.querySelector('.problem-text')||document.body;
 const allowed=new Set('P DIV SPAN H1 H2 H3 H4 H5 H6 B STRONG I EM U S SUB SUP BR HR PRE CODE UL OL LI TABLE THEAD TBODY TR TH TD BLOCKQUOTE IMG A'.split(' '));
 const drop=new Set('SCRIPT STYLE IFRAME OBJECT EMBED FORM INPUT BUTTON SELECT TEXTAREA SVG MATH LINK META NOSCRIPT'.split(' '));
 function clean(node:Node):Node|null {
  if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent||'');
  if(node.nodeType!==Node.ELEMENT_NODE)return null;const el=node as HTMLElement;if(drop.has(el.tagName))return null;
  const out=document.createElement(allowed.has(el.tagName)?el.tagName.toLowerCase():'span');
  if(el.tagName==='IMG'){const src=el.getAttribute('src')||'';if(!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(src)&&!/^\/statements\/assets\/[a-f0-9]{64}\.(png|jpeg|webp|gif)$/.test(src)){out.setAttribute('alt',el.getAttribute('alt')||'图示未嵌入，请对照官方原题');}else{out.setAttribute('src',src);out.setAttribute('alt',el.getAttribute('alt')||'题目图示');}}
  if(el.tagName==='A'){const href=el.getAttribute('href')||'';if(/^https?:\/\//i.test(href)){out.setAttribute('href',href);out.setAttribute('target','_blank');out.setAttribute('rel','noopener noreferrer');}}
  for(const child of [...node.childNodes]){const c=clean(child);if(c)out.appendChild(c);}return out;
 }
 const result=document.createElement('div');for(const child of [...body.childNodes]){const c=clean(child);if(c)result.appendChild(c);}
 if(!result.textContent?.trim())throw Error('没有找到可阅读的题面正文。');return result.innerHTML;
}
