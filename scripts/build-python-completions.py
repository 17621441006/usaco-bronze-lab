"""Build completion vocabulary and an audit against every authored Python answer."""
import ast,builtins,inspect,json,importlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def item(name,obj,owner=''):
    doc=(inspect.getdoc(obj) or '').splitlines()
    try:sig=str(inspect.signature(obj))
    except (TypeError,ValueError):sig='(...)'
    return {'label':name,'insert':name+'(${1})$0' if callable(obj) else name,'detail':(owner+'.' if owner else '')+name+(sig if callable(obj) else ' = '+repr(obj)),'documentation':'\n'.join(doc[:5])}
global_items=[item(n,getattr(builtins,n)) for n in dir(builtins) if not n.startswith('_') and callable(getattr(builtins,n)) and not (isinstance(getattr(builtins,n),type) and issubclass(getattr(builtins,n),BaseException))]
modules={}
for name in ['sys','math','itertools','collections','heapq','bisect','functools','operator','os','os.path']:
    m=importlib.import_module(name);modules[name.split('.')[-1]]=[item(n,getattr(m,n),name) for n in dir(m) if not n.startswith('_') and (callable(getattr(m,n)) or isinstance(getattr(m,n),(int,float)))]
for name in ['Counter','defaultdict','deque']:
    global_items.append(item(name,getattr(importlib.import_module('collections'),name),'collections'))
for name in ['bisect_left','bisect_right','insort','insort_left','insort_right']:
    global_items.append(item(name,getattr(importlib.import_module('bisect'),name),'bisect'))
methods={}
for kind in [str,list,tuple,dict,set,frozenset,int,float,bytes,bytearray,*[getattr(importlib.import_module('collections'),n) for n in ['deque','Counter','defaultdict']]]:
    for n in dir(kind):
        if not n.startswith('_') and callable(getattr(kind,n)):methods.setdefault(n,item(n,getattr(kind,n),kind.__name__))
methods.update({n:{'label':n,'insert':n+'(${1})$0','detail':n+'(...) · 文件读写'} for n in ['read','readline','readlines','write','writelines','flush','close']})
data={'globals':global_items,'methods':list(methods.values()),'modules':modules}
(R/'data/python-completions.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
needed=set();members=set();custom=set()
sources=[p.read_text() for p in (R/'reference-solutions').glob('*.py')]
exercises=json.loads((R/'data/course-exercises.json').read_text())
sources.extend(e['solution'] for e in exercises)
for source in sources:
    tree=ast.parse(source);custom.update(n.name for n in ast.walk(tree) if isinstance(n,(ast.FunctionDef,ast.ClassDef)))
    for n in ast.walk(tree):
        if isinstance(n,ast.Call):
            if isinstance(n.func,ast.Name):needed.add(n.func.id)
            elif isinstance(n.func,ast.Attribute):members.add(n.func.attr)
available={i['label'] for i in global_items};available_members=set(methods)|{i['label'] for a in modules.values() for i in a}
missing=sorted((needed-custom-available)|(members-available_members))
audit={'referenceFiles':99,'exerciseSolutions':len(exercises),'globalCount':len(global_items),'methodCount':len(methods),'requiredCalls':sorted(needed-custom),'requiredMembers':sorted(members),'missing':missing}
(R/'data/completion-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2));print(json.dumps(audit))
if missing:raise SystemExit('Missing completion coverage')
