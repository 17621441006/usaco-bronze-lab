"""Check cleaned reference samples, the short fence solution, and course exercises."""
import ast, gzip, json, subprocess, sys, tempfile
from pathlib import Path
R=Path(__file__).resolve().parents[1]
exec((R/'scripts/special-checkers.py').read_text())
exercises=json.loads((R/'data/course-exercises.json').read_text())
catalog=json.loads((R/'data/catalog.json').read_text())
report={'referencePrograms':0,'referenceSamples':0,'fenceOfficialFiles':0,'courseExercises':0,'courseCases':0}
def run(code,case,pid):
    with tempfile.TemporaryDirectory(prefix='usaco-content-') as cwd:
        result=subprocess.run([sys.executable,'-c',code],input=case['input'],text=True,capture_output=True,timeout=10,cwd=cwd)
    assert result.returncode==0,(pid,result.stderr)
    assert check(pid,case['input'],case['output'],result.stdout),(pid,case,result.stdout)
for p in catalog:
    code=(R/f'reference-solutions/{p["id"]}.py').read_text()
    assert code==json.loads((R/f'public/solutions/{p["id"]}.json').read_text())['python']
    tree=ast.parse(code);used={n.id for n in ast.walk(tree) if isinstance(n,ast.Name) and isinstance(n.ctx,ast.Load)}
    for node in tree.body:
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            for alias in node.names:assert (alias.asname or alias.name.split('.')[0]) in used,(p['id'],alias.name)
    for case in p['samples']:run(code,case,p['id']);report['referenceSamples']+=1
    report['referencePrograms']+=1
fence=json.loads((R/'public/solutions/567.json').read_text())['pythonTeaching']
for item in json.loads((R/'public/official-tests/567.json').read_text())['cases']:
    case=json.loads(gzip.decompress((R/'public'/item['url'].lstrip('/')).read_bytes()))
    run(fence,case,567);report['fenceOfficialFiles']+=1
for ex in exercises:
    for case in ex['cases']:run(ex['solution'],case,ex['id']);report['courseCases']+=1
    report['courseExercises']+=1
assert len({e['id'] for e in exercises})==78
assert len({e['lesson'] for e in exercises})==26
for lesson in {e['lesson'] for e in exercises}:assert [e['level'] for e in exercises if e['lesson']==lesson]==['基础','巩固','挑战']
(R/'data/learning-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
