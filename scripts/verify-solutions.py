"""Compile independently authored reference programs and check official files."""
import concurrent.futures as cf,json,gzip,subprocess,time,sys,tempfile
from pathlib import Path
R=Path(__file__).resolve().parents[1];B=R/'.research-cache/bin';B.mkdir(parents=True,exist_ok=True)
exec((R/'scripts/special-checkers.py').read_text())
check_output=check
ids=[int(p.stem) for p in (R/'public/solutions').glob('*.json')]
if len(sys.argv)>1:ids=[int(x) for x in sys.argv[1:]]

def check(pid):
 sol=R/f'public/solutions/{pid}.json';s=json.loads(sol.read_text());manifest=R/f'public/official-tests/{pid}.json'
 if not manifest.exists():return pid,'missing data'
 cases=json.loads(manifest.read_text())['cases'];results={}
 c=subprocess.run(['g++','-std=c++17','-O2',str(R/f'reference-solutions/{pid}.cpp'),'-o',str(B/str(pid))],capture_output=True)
 if c.returncode:results['cpp']={'error':c.stderr.decode()[:1600]}
 for lang,cmd,limit in [('cpp',[str(B/str(pid))],4),('python',[sys.executable,str(R/f'reference-solutions/{pid}.py')],8)]:
  if lang in results:continue
  states=[]
  for case in cases:
   data=json.loads(gzip.decompress((R/'public'/case['url'].lstrip('/')).read_bytes()))
   start=time.monotonic()
   try:
    run=subprocess.run(cmd,input=data['input'].encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=limit,cwd='/tmp')
    status='RE' if run.returncode else 'AC' if check_output(pid,data['input'],data['output'],run.stdout.decode(errors='replace')) else 'WA'
    info={'name':case['name'],'status':status,'ms':round((time.monotonic()-start)*1000)}
    if status!='AC':info.update(actual=run.stdout.decode(errors='replace')[:250],expected=data['output'][:250],error=run.stderr.decode(errors='replace')[:400])
    states.append(info)
    if status in ['WA','RE']:break
   except subprocess.TimeoutExpired:states.append({'name':case['name'],'status':'LOCAL_TIMEOUT','limit':limit})
  results[lang]={'passed':sum(t['status']=='AC' for t in states),'total':len(cases),'cases':states}
 s['validation']=results;s['verified']=all(results.get(l,{}).get('passed')==len(cases) for l in ['python','cpp']);sol.write_text(json.dumps(s,ensure_ascii=False))
 return pid,{l:({k:v for k,v in r.items() if k!='cases'}|{'failures':[c for c in r.get('cases',[]) if c['status']!='AC']}) for l,r in results.items()}
with cf.ThreadPoolExecutor(max_workers=3) as pool:
 for r in pool.map(check,ids):print(json.dumps(r,ensure_ascii=False),flush=True)
