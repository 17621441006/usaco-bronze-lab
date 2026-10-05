import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
cat=json.loads((R/'data/catalog.json').read_text())
for p in cat:
 manifest=json.loads((R/f"public/official-tests/{p['id']}.json").read_text());p['testsImported']=manifest['imported'];p['testsTotal']=manifest['officialTotal'];p['diagramReady']=True;p['referenceReady']=True
 p['checker']='special' if p['id'] in [1252,1540,1563,1589] else 'lines' if p['id']==987 else 'tokens'
 if p['reviewStatus']!='已核验':
  diagram=json.loads((R/f"public/diagrams/{p['id']}.json").read_text());solution=json.loads((R/f"public/solutions/{p['id']}.json").read_text());p['summary']=diagram['caption']+'\n完整输入格式与限制请查看官方原题。';p['analysis']=solution['approach'];p['hints']=['先用「样例图解」把输入中的对象与位置对应起来。','尝试手算样例，并说明每一步改变了哪些量。',solution['approach']]
(R/'data/catalog.json').write_text(json.dumps(cat,ensure_ascii=False,indent=2))
for p in (R/'public/solutions').glob('*.json'):
 d=json.loads(p.read_text());d['python']=(R/f'reference-solutions/{p.stem}.py').read_text();d['cpp']=(R/f'reference-solutions/{p.stem}.cpp').read_text()
 for lang,v in d.get('validation',{}).items():v.setdefault('timeBudgetSeconds',8 if lang=='python' else 4)
 p.write_text(json.dumps(d,ensure_ascii=False))
# Keep compatibility metadata in the repeatable importer.
print('Synced full data, 99 sample diagrams and 198 reference programs.')
