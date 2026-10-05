"""Teaching taxonomy reviewed against the site's existing reference explanations.
These labels are learning routes, not new claims about official mandatory techniques.
"""
import json,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]
topics=[
 ('simulation','模拟与状态','把规则按顺序执行，处理时间、位置和状态变化。','simulation'),
 ('enumeration','枚举与搜索','先确定候选规模，再枚举、回溯或用位掩码表示选择。','enumeration'),
 ('strings','字符串与序列','下标、子串、排列和连续段，先区分子串与子序列。','strings'),
 ('sorting','排序与查找','利用顺序、排名或单调性减少反复查找。','sorting'),
 ('counting','计数与集合','用频次、字典和集合统计贡献，避免重复计数。','counting'),
 ('geometry','区间与几何','区间交并、坐标、距离与面积，注意边界和端点。','interval'),
 ('grid','网格与空间','二维、三维下标，以及一次修改影响的局部位置。','grid'),
 ('greedy','贪心与构造','说明当前选择为什么安全，或构造满足条件的答案。','greedy'),
 ('math','数学与规律','奇偶、余数、取整、数位、递推与约束推导。','arithmetic'),
 ('prefix','前缀与差分','复用累计信息，用变化量替代反复扫描。','prefix'),
 ('graphs','图与关系','把相邻、传递和限制关系画成点与边。','graphs'),
 ('adhoc','Ad Hoc 与分类讨论','画小例子、找不变量、构造并用反例检验；它是思考训练，不是单一算法。','adhoc'),
 ('dp','动态规划','明确状态和转移；同时区分主解与可选拓展。','dp'),
]
# id | practice stage (1 foundation / 2 intermediate / 3 synthesis) | main and secondary topic IDs
rows='''
1589 3 greedy grid counting
1588 3 math
1587 3 greedy counting math
1565 3 greedy math
1564 3 enumeration counting
1563 2 strings greedy math
1541 3 grid prefix
1540 3 greedy strings math
1539 3 math
1493 3 enumeration strings
1492 2 counting prefix greedy
1491 2 grid counting
1469 3 enumeration strings prefix
1468 2 counting prefix strings
1467 3 grid greedy
1445 2 strings enumeration counting
1444 2 grid counting
1443 2 math enumeration
1397 2 sorting math
1396 3 simulation strings greedy
1395 1 math
1373 3 prefix math
1372 2 simulation counting
1371 2 strings math
1349 3 math sorting
1348 3 greedy strings math
1347 2 simulation
1301 2 greedy math
1300 2 grid enumeration
1299 2 simulation greedy
1277 1 strings enumeration
1276 2 enumeration simulation
1275 2 enumeration strings
1253 3 greedy strings
1252 2 greedy strings
1251 1 sorting greedy
1205 1 enumeration strings
1204 2 greedy sorting
1203 2 enumeration prefix math
1181 3 math greedy
1180 2 enumeration math
1179 1 counting strings
1157 2 enumeration grid
1156 2 greedy prefix
1155 2 counting strings
1109 2 geometry simulation
1108 2 grid counting
1107 2 simulation math
1085 2 sorting counting
1084 2 math greedy
1083 1 strings simulation
1061 3 simulation sorting geometry
1060 1 enumeration counting math
1059 1 sorting math
1013 2 simulation math
1012 1 strings greedy
1011 1 geometry counting
989 2 sorting math
988 1 enumeration strings
987 1 simulation strings
965 1 enumeration strings
964 1 strings enumeration counting
963 1 enumeration sorting
917 2 geometry simulation
916 2 graphs greedy
915 1 math geometry
893 1 counting enumeration
892 1 greedy sorting
891 1 simulation enumeration
857 2 enumeration simulation counting
856 1 simulation sorting prefix
855 1 simulation
809 2 simulation strings
808 2 graphs counting sorting
807 1 geometry enumeration
785 1 sorting counting
784 2 geometry sorting counting
783 2 geometry
761 1 simulation sorting counting
760 1 simulation strings
759 1 geometry
713 1 sorting simulation greedy
712 1 enumeration geometry
711 1 simulation counting
689 2 grid greedy
688 1 enumeration simulation
687 1 counting sorting
665 1 strings grid
664 1 counting strings
663 1 geometry
617 2 enumeration geometry
616 1 enumeration simulation
615 1 enumeration math
593 2 simulation geometry counting
592 2 simulation enumeration sorting
591 1 math counting
569 2 enumeration simulation
568 1 simulation
567 1 geometry simulation
'''
classification={};labels={t[0]:t[1] for t in topics};stages={'1':'基础巩固','2':'专项进阶','3':'综合挑战'}
for line in rows.strip().splitlines():
 pid,stage,*tags=line.split();pid=int(pid);assert pid not in classification;assert set(tags)<=set(labels)
 ref=json.loads((R/f'public/solutions/{pid}.json').read_text())
 classification[pid]={'learningTopics':tags,'optionalTopics':['dp'] if pid in (1157,1493,1564) else [],'practiceStage':stages[stage],'classificationBasis':ref['approach']}
 if pid==1157:classification[pid]['classificationBasis']='官方主解按转弯次数分类并枚举转弯位置；本站参考实现使用位置、方向和转弯数 DP，列作可选拓展。'
 if pid==1493:classification[pid]['classificationBasis']='按重复块和切分点分类枚举；区间 DP 作为可选拓展，不视为唯一解法。'
 if pid==1564:classification[pid]['classificationBasis']='棋盘枚举为基础路线，本站参考代码采用子集和 DP 优化；DP 属于可选进阶路线。'
# Cross-cutting reasoning tags, reviewed individually from the linked approaches.
for pid in [567,689,785,915,1107,1157,1181,1253,1395,1493,1539,1540,1563,1588]:
 classification[pid]['learningTopics'].append('adhoc')
catalog=json.loads((R/'data/catalog.json').read_text());assert set(classification)=={p['id'] for p in catalog}
statements=json.loads((R/'data/local-statements.json').read_text())
for p in catalog:
 meta=classification[p['id']];p.update(meta,statementAvailable=str(p['id']) in statements)
 if p['statementAvailable']:p['summary']=p['summary'].replace('完整输入格式与限制请查看官方原题。','完整输入格式与限制请查看「原题」页。')
 if p['id']==987:p['summary']='按顺序把完整单词排成多行，每行至多 K 个非空格字符。下一个单词放不下时换行；单词之间只留一个空格，行尾不能有空格。'
 if p['reviewStatus']!='已核验':
  p['tags']=[labels[t] for t in meta['learningTopics']];p['reviewStatus']='参考解法归类';p['analysis']=meta['classificationBasis']
  p['classificationSource']='站内参考解法';p['classifiedAt']='2026-10-04'
(R/'data/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
(R/'data/learning-topics.json').write_text(json.dumps([dict(id=id,label=label,description=desc,lesson=lesson) for id,label,desc,lesson in topics],ensure_ascii=False,indent=2)+'\n')
(R/'data/classification-report.json').write_text(json.dumps({'updatedAt':'2026-10-04','basis':'按站内已验证参考解法整理；官方核验记录独立保留；可选 DP 单独标记','classified':len(catalog),'recent':sum(p['year']>=2020 for p in catalog),'classic':sum(p['year']<2020 for p in catalog),'officiallyReviewed':sum(p['reviewStatus']=='已核验' for p in catalog),'topics':{t[0]:{'recent':sum(p['year']>=2020 and t[0] in p['learningTopics']+p['optionalTopics'] for p in catalog),'total':sum(t[0] in p['learningTopics']+p['optionalTopics'] for p in catalog)} for t in topics}},ensure_ascii=False,indent=2)+'\n')
print('Classified',len(catalog),'problems across',len(topics),'topics; preserved',sum(p['reviewStatus']=='已核验' for p in catalog),'official reviews')
