import json,textwrap
from pathlib import Path
R=Path(__file__).resolve().parents[1]
CAT={p['id']:p for p in json.loads((R/'data/catalog.json').read_text())}
M={}
def add(id,py,cpp,complexity,approach):
 p=CAT[id]
 prefix='import sys, math, itertools, heapq\nfrom collections import Counter, defaultdict, deque\nfrom bisect import bisect_left, bisect_right\n'
 if p.get('inputFile'):
  f=p['inputFile'];prefix+=f'import os\nif os.path.exists({f!r}):\n    sys.stdin = open({f!r})\n    sys.stdout = open({f.replace(".in",".out")!r}, "w")\n'
 py=prefix+'\nit = iter(sys.stdin.read().split())\ndef I(): return int(next(it))\ndef S(): return next(it)\n\n'+textwrap.dedent(py).strip()+'\n'
 io=''
 if p.get('inputFile'):
  f=p['inputFile'];io=f'if (ifstream("{f}").good()) {{ freopen("{f}","r",stdin); freopen("{f.replace(".in",".out")}","w",stdout); }}\n'
 cpp='#include <bits/stdc++.h>\nusing namespace std;\nusing ll = long long;\nint main() {\n'+io+'ios::sync_with_stdio(false); cin.tie(nullptr);\n'+textwrap.dedent(cpp).strip()+'\nreturn 0;\n}\n'
 (R/f'reference-solutions/{id}.py').write_text(py)
 (R/f'reference-solutions/{id}.cpp').write_text(cpp)
 M[id]={'problemId':id,'python':py,'cpp':cpp,'complexity':complexity,'approach':approach,'source':p['editorial'],'authorship':'本站独立编写，按官方题意验证','verified':False}
 (R/f'public/solutions/{id}.json').write_text(json.dumps(M[id],ensure_ascii=False))
