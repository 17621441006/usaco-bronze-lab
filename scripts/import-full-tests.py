"""Import all released official test files; retain original count and provenance."""
import concurrent.futures as cf,hashlib,json,zipfile,subprocess,gzip,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];cache=ROOT/'.research-cache';cache.mkdir(exist_ok=True)
cat=json.loads((ROOT/'data/catalog.json').read_text());out=ROOT/'public/official-tests';out.mkdir(exist_ok=True)
def fetch(url,path):
 if not path.exists():
  p=subprocess.run(['curl','-fLsS','--max-time','90','--retry','2',url,'-o',str(path)],capture_output=True)
  if p.returncode:raise Exception(p.stderr.decode()[:150])
 return path

def job(p):
 z=fetch(p['testsUrl'],cache/f"tests-{p['id']}.zip");entries=[]
 with zipfile.ZipFile(z) as f:
  names={n for n in f.namelist() if not n.startswith('__MACOSX/')};ins=sorted([n for n in names if n.endswith('.in')],key=lambda n:[int(a) if a.isdigit() else a for a in re.split('(\\d+)',n)])
  if not ins:raise Exception('No input files')
  for i,name in enumerate(ins):
   other=name[:-3]+'.out'
   if other not in names:raise Exception('Missing output '+other)
   a=f.read(name).decode('utf-8',errors='replace');b=f.read(other).decode('utf-8',errors='replace');payload=json.dumps({'name':Path(name).name,'input':a,'output':b},ensure_ascii=False,separators=(',',':')).encode()
   path=out/str(p['id']);path.mkdir(exist_ok=True)
   packed=gzip.compress(payload,compresslevel=9,mtime=0);(path/f'{i+1}.json.gz').write_bytes(packed)
   entries.append({'name':Path(name).name,'url':f"/official-tests/{p['id']}/{i+1}.json.gz",'bytes':len(payload),'compressedBytes':len(packed),'sha256':hashlib.sha256(payload).hexdigest()})
 manifest={'problemId':p['id'],'source':p['testsUrl'],'archiveSha256':hashlib.sha256(z.read_bytes()).hexdigest(),'officialTotal':len(entries),'imported':len(entries),'cases':entries}
 (out/f"{p['id']}.json").write_text(json.dumps(manifest,ensure_ascii=False))
 return p['id'],len(entries),sum(e['compressedBytes'] for e in entries)
errors=[];results=[]
with cf.ThreadPoolExecutor(max_workers=3) as pool:
 futures={pool.submit(job,p):p for p in cat}
 for f in cf.as_completed(futures):
  try:
   r=f.result();results.append(r);print(*r,flush=True)
  except Exception as e:errors.append({'id':futures[f]['id'],'error':str(e)})
report={'problems':len(results),'testFiles':sum(r[1] for r in results),'compressedBytes':sum(r[2] for r in results),'range':[min(r[1] for r in results),max(r[1] for r in results)],'errors':errors}
(ROOT/'data/full-test-import.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report,flush=True)
