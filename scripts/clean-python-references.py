"""Remove only statically unused template imports and I/S input helpers."""
import ast,json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
changed=[];removed_imports=0;removed_helpers=0
for path in sorted((R/'reference-solutions').glob('*.py')):
    original=path.read_text(); text=original
    tree=ast.parse(text);lines=text.splitlines(keepends=True);edits=[]
    for node in tree.body:
        if isinstance(node,ast.FunctionDef) and node.name in ('I','S'):
            others=[x for x in tree.body if x is not node]
            used={n.id for x in others for n in ast.walk(x) if isinstance(n,ast.Name) and isinstance(n.ctx,ast.Load)}
            if node.name not in used:edits.append((node.lineno-1,node.end_lineno,''));removed_helpers+=1
    for start,end,new in reversed(edits):lines[start:end]=[new]
    text=''.join(lines);tree=ast.parse(text);lines=text.splitlines(keepends=True);edits=[]
    used={n.id for n in ast.walk(tree) if isinstance(n,ast.Name) and isinstance(n.ctx,ast.Load)}
    for node in tree.body:
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            names=[a for a in node.names if (a.asname or (a.name.split('.')[0] if isinstance(node,ast.Import) else a.name)) in used]
            removed_imports+=len(node.names)-len(names)
            if len(names)!=len(node.names):
                new=''
                if names:
                    node.names=names;new=ast.unparse(node)+'\n'
                edits.append((node.lineno-1,node.end_lineno,new))
    for start,end,new in reversed(edits):lines[start:end]=[new]
    text=re.sub(r'\n{4,}','\n\n\n',''.join(lines)).lstrip()
    if text!=original:
        compile(text,str(path),'exec');path.write_text(text);changed.append(int(path.stem))
    solution=R/f'public/solutions/{path.stem}.json';data=json.loads(solution.read_text());data['python']=text
    if path.stem=='567':
        data['pythonTeaching']='a, b = map(int, input().split())\nc, d = map(int, input().split())\noverlap = max(0, min(b, d) - max(a, c))\nprint((b - a) + (d - c) - overlap)\n'
        data['teachingNote']='站内直接使用 input() 即可。下载提交版保留 paint.in / paint.out，以兼容这道历史题的官方文件输入输出。'
    solution.write_text(json.dumps(data,ensure_ascii=False))
if changed:(R/'data/reference-cleanup.json').write_text(json.dumps({'changed':changed,'removedImports':removed_imports,'removedHelpers':removed_helpers},indent=2))
print(json.dumps({'changed':len(changed),'removedImports':removed_imports,'removedHelpers':removed_helpers}))
