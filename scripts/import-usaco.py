"""Read publicly released Bronze regular-season archives; no login or submission automation.

Raw pages are cached locally for review. Published catalog contains metadata,
sample facts, and official links. Editorial tags are added by human review.
"""
import concurrent.futures as cf
from datetime import date
import hashlib, html, json, re, subprocess, time, zipfile
from pathlib import Path
from urllib.parse import urljoin

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.research-cache'; CACHE.mkdir(exist_ok=True)
OUT=ROOT/'data'; OUT.mkdir(exist_ok=True)
BASE='https://usaco.org/'

def fetch(url, filename):
    p=CACHE/filename
    if not p.exists():
        r=subprocess.run(['curl','-fsSL','--max-time','25','--retry','1',url,'-o',str(p)],capture_output=True)
        if r.returncode: raise RuntimeError(url+' '+r.stderr.decode()[:120])
    return p

def plain(s):
    s=re.sub(r'<(script|style)[\s\S]*?</\1>','',s,flags=re.I)
    s=re.sub(r'<br\s*/?>|</p>|</div>|</li>|</h[1-6]>', '\n',s,flags=re.I)
    return re.sub(r'\n\s*\n+', '\n\n', html.unescape(re.sub('<[^>]+>','',s))).strip()

def parse_round(key):
    url=BASE+'index.php?page='+key
    s=fetch(url,'round-'+key+'.html').read_text(errors='replace')
    match=re.search(r'<h2[^>]*>[^<]*(?:<img[^>]*>)?[^<]*Bronze.*?</h2>([\s\S]*?)(?:<h[23]|$)',s,re.I)
    if not match: raise RuntimeError('Missing Bronze '+key)
    section=match.group(1)
    records=[]
    patt=r'<b>([^<]+)</b>\s*<br\s*/?>\s*<a href=[\'"]([^\'"]+)[\'"]>View problem</a>[\s\S]*?<a href=[\'"]([^\'"]+)[\'"]>Test data</a>[\s\S]*?<a href=[\'"]([^\'"]+)[\'"]>Solution</a>'
    for title,p,t,e in re.findall(patt,section,re.I):
        cpid=int(re.search(r'cpid=(\d+)',p).group(1))
        records.append(dict(id=cpid,title=html.unescape(title),round=key,official=urljoin(BASE,p),testsUrl=urljoin(BASE,t),editorial=urljoin(BASE,e),division='Bronze',source=url,reviewStatus='待复核',tags=[]))
    if len(records)!=3: raise RuntimeError(f'{key}: expected 3 got {len(records)}')
    return records

def enrich(p):
    raw=fetch(p['official'],f"problem-{p['id']}.html").read_text(errors='replace')
    article=raw.split('id="probtext-text"',1)[-1].split('>',1)[-1].split('</span>',1)[0]
    samples=[]
    inputs=re.findall(r'SAMPLE INPUT:\s*</h4>\s*<pre[^>]*>([\s\S]*?)</pre>',article,re.I)
    outputs=re.findall(r'SAMPLE OUTPUT:\s*</h4>\s*<pre[^>]*>([\s\S]*?)</pre>',article,re.I)
    for a,b in zip(inputs,outputs): samples.append({'input':plain(a),'output':plain(b)})
    if not samples:
        parts=re.findall(r'<h4>\s*SAMPLE (INPUT|OUTPUT):\s*</h4>\s*<pre[^>]*>([\s\S]*?)</pre>',raw,re.I)
        for i in range(0,len(parts)-1,2): samples.append({'input':plain(parts[i][1]),'output':plain(parts[i+1][1])})
    p['samples']=samples
    p['io']='file' if re.search(r'INPUT FORMAT\s*\(file',article) else 'stdio'
    filematch=re.search(r'INPUT FORMAT\s*\(file ([^<)]+)',article)
    p['inputFile']=filematch.group(1) if filematch else None
    edi=fetch(p['editorial'],f"editorial-{p['id']}.html").read_text(errors='replace')
    (CACHE/f"editorial-{p['id']}.txt").write_text(plain(re.sub(r'<pre[\s\S]*?</pre>','',edi,flags=re.I)))
    (CACHE/f"problem-{p['id']}.txt").write_text(plain(article))
    p['fetchedAt']=date.today().isoformat()
    p['statementHash']=hashlib.sha256(raw.encode()).hexdigest()
    p['editorialHash']=hashlib.sha256(edi.encode()).hexdigest()
    return p

def main():
    rounds=[]
    for y in range(15,25): rounds.extend([f'dec{y}results',f'jan{y+1}results',f'feb{y+1}results'])
    rounds += [f'season26contest{i}results' for i in (1,2,3)]
    records=[]; errors=[]
    with cf.ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(parse_round,k):k for k in rounds}
        for f in cf.as_completed(jobs):
            try: records.extend(f.result())
            except Exception as e: errors.append(str(e))
    print('rounds read',len(records)//3,'errors',errors,flush=True)
    result=[]
    with cf.ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(enrich,p):p for p in records}
        for f in cf.as_completed(jobs):
            try: result.append(f.result())
            except Exception as e: errors.append(str(e));result.append(jobs[f])
    result.sort(key=lambda p:p['id'],reverse=True)
    (OUT/'catalog-raw.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    (OUT/'import-report.json').write_text(json.dumps(dict(checkedAt=date.today().isoformat(),scope='2015 December–2026 Contest 3 / Bronze regular contests / excludes every US Open',rounds=len(rounds),problems=len(result),sampled=sum(bool(p.get('samples')) for p in result),errors=errors),ensure_ascii=False,indent=2))
    print(json.dumps(dict(problems=len(result),samples=sum(bool(p.get('samples')) for p in result),errors=errors),ensure_ascii=False),flush=True)

if __name__=='__main__': main()
