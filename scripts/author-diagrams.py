"""Sample-specific teaching diagrams: data geometry, not decorative artwork."""
import json,math,copy
from pathlib import Path
from collections import Counter,defaultdict
R=Path(__file__).resolve().parents[1];OUT=R/'public/diagrams';OUT.mkdir(exist_ok=True)
CAT=json.loads((R/'data/catalog.json').read_text())
BLUE='#608cad';GOLD='#c69b58';GREEN='#5b9884';RED='#be7f72';GREY='#c4d0db';PURPLE='#9384b1'
def scene(title,text,items,edges=None):return {'title':title,'text':text,'items':items,'edges':edges or []}
def tile(label,x,y,color=BLUE,w=1,h=1,height=.35):return {'label':str(label),'x':x,'y':y,'w':w,'h':h,'height':height,'color':color}
def row(values,y=0,color=BLUE,label='',maxcols=12):
 items=[]
 if label:items.append(tile(label,-1.7,y,GREY,w=2.6,h=.7,height=.05))
 width=max([1]+[(sum(15 if ord(c)>255 else 8 for c in str(v))+14)/55 for v in values]);maxcols=min(maxcols,max(1,int(14/(width+.25))))
 for i,v in enumerate(values):items.append(tile(v,.6+width/2+(i%maxcols)*(width+.25),y+(i//maxcols)*1.5,color,w=width,height=.4))
 return items

def rows(groups):
 items=[];y=0
 for label,v in groups:
  block=row(v,y,label=label);items+=block;y=max(item['y']+item['h']/2 for item in block)+1.3
 return items

def bars(values,label='样例数据',colors=None):
 mx=max([abs(float(v)) for v in values]+[1]);items=[]
 for i,v in enumerate(values):items.append(tile(v,i*1.35,0,colors[i] if colors else BLUE,height=.3+abs(float(v))/mx*2.5))
 items.append(tile(label,max(0,len(values)-1)*.675,-1.3,GREY,w=max(3,len(values)*.7),h=.65,height=.05))
 return items

def grid(a,label='',xoff=0,yoff=0):
 out=[]
 for r,line in enumerate(a):
  for c,v in enumerate(line):
   color=GREY if str(v) in ['.','0','W'] else RED if v=='H' else BLUE
   if str(v).lstrip('-').isdigit() and int(v)>0:color=GOLD
   out.append(tile(v,xoff+c*1.15,yoff+r*1.15,color,height=.22))
 if label:out.append(tile(label,xoff+(len(a[0])-1)*.575,yoff-1.1,GREY,w=max(3,len(a[0])*.7),h=.6,height=.05))
 return out

def intervals(a,names):
 lo=min(x for x,y in a);hi=max(y for x,y in a);span=max(1,hi-lo);items=[]
 for i,((x,y),name) in enumerate(zip(a,names)):
  items.append(tile(f'{name} [{x},{y}]',(x+y-2*lo)/span*6,i*1.8,[BLUE,GOLD,GREEN,PURPLE][i%4],w=max(.2,(y-x)/span*12),h=.8,height=.3))
 return items

def points(a,labels=None,connect=False):
 xs=[p[0] for p in a];ys=[p[1] for p in a];x0=min(xs);y0=min(ys);dx=max(1,max(xs)-x0);dy=max(1,max(ys)-y0)
 items=[tile(labels[i] if labels else f'({x},{y})',(x-x0)/dx*11,(max(ys)-y)/dy*7,BLUE,w=.9,h=.9,height=.55) for i,(x,y) in enumerate(a)];edges=[]
 if connect:
  for u,v in zip(items,items[1:]):edges.append({'from':[u['x'],u['y']],'to':[v['x'],v['y']],'color':BLUE})
 # A closed route revisits the start: combine its visit labels.
 unique={}
 for item in items:
  key=(item['x'],item['y'])
  if key in unique:unique[key]['label']+=' / '+item['label']
  else:unique[key]=item
 return list(unique.values()),edges

def draw(p):
 pid=p['id'];sample=p['samples'][0];tok=iter(sample['input'].split());I=lambda:int(next(tok));S=lambda:next(tok);frames=[];items=[];extra=[];text=''
 sol=json.loads((R/f'public/solutions/{pid}.json').read_text());approach=sol['approach']
 if pid==567:
  a,b,c,d=I(),I(),I(),I();items=intervals([(a,b),(c,d)],['FJ','Bessie']);extra=intervals([(a,b),(c,d),(max(a,c),min(b,d))],['FJ','Bessie','重复涂色']);text='两段涂色的总长度；重叠部分只计算一次。'
 elif pid==568:
  n,m=I(),I();a=[(I(),I()) for _ in range(n)];b=[(I(),I()) for _ in range(m)];items=rows([('限速：长度/速度',[f'{x}/{v}' for x,v in a]),('行驶：长度/速度',[f'{x}/{v}' for x,v in b])]);text='同一段 100 英里的路，上排是限速分段，下排是实际行驶分段；必须按道路位置对齐。'
 elif pid==569:
  n,m,d,s=I(),I(),I(),I();records=[(I(),I(),I()) for _ in range(d)];sick=[(I(),I()) for _ in range(s)];items=rows([('饮用：人/奶/时间',[f'{a}/{b}/{c}' for a,b,c in records]),('发病：人/时间',[f'{a}/{b}' for a,b in sick])]);text='先对照每名病人的发病时刻；污染牛奶必须在此之前被喝过。'
 elif pid==591:
  a=[(I(),I()) for _ in range(4)];items=rows([('比赛前',[x for x,y in a]),('比赛后',[y for x,y in a]),('级别',['铜','银','金','铂金'])]);text='晋级只向更高级别流动，人数差需要从最高组逐级向下累计。'
 elif pid==592:
  n=I();a=sorted(I() for _ in range(n));items,_=points([(v,0) for v in a],[str(v) for v in a]);text='干草堆位于数轴；选择起爆点，每轮爆炸距离增加 1。图中间隔按真实坐标缩放。'
 elif pid==593:
  n=I();a=[(S(),I()) for _ in range(n)];x=y=0;path=[(0,0)]
  for d,k in a:dx,dy={'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0)}[d];x+=dx*k;y+=dy*k;path.append((x,y))
  items,edges=points(path,[f'{i}:({x},{y})' for i,(x,y) in enumerate(path)],True);frames.append(scene('画出移动路线','数字为转弯点次序；程序仍须按每一小步记录重新经过的时间。',items,edges));text='寻找重复经过同一格的最短时间差。'
 elif pid==615:
  x,y,m=I(),I(),I();items=bars([x,y,m],'小桶 / 大桶 / 容量上限');text='两种桶可以反复使用；总奶量必须不超过第三根柱子表示的上限。'
 elif pid==616:
  n=I();a=[I() for _ in range(n)];items=[tile(f'房{i+1}: {v}',5+4*math.cos(i*2*math.pi/n),4+4*math.sin(i*2*math.pi/n),BLUE,height=.3+v/max(a)*1.5) for i,v in enumerate(a)];text='房间环形连接，每个标签是所需牛数；选择入口后只能沿同一方向步行。'
 elif pid==617:
  n,b=I(),I();a=[(I(),I()) for _ in range(n)];items,edges=points(a);frames.append(scene('牛的位置', '两条分隔线不能穿过牛；目标是让最拥挤象限的牛尽可能少。',items,edges));text='移动横、竖两条线，比较四个区域的人数。'
 elif pid in [663,759,783]:
  count=3 if pid==759 else 2;rects=[tuple(I() for _ in range(4)) for _ in range(count)];minx=min(v[0] for v in rects);maxx=max(v[2] for v in rects);miny=min(v[1] for v in rects);maxy=max(v[3] for v in rects);scale=10/max(maxx-minx,maxy-miny)
  for i,(x,y,X,Y) in enumerate(rects):items.append(tile(f'{i+1}:({x},{y})–({X},{Y})',((x+X)/2-minx)*scale,(maxy-(y+Y)/2)*scale,[BLUE,GOLD,RED][i],w=(X-x)*scale,h=(Y-y)*scale,height=.15+i*.25))
  text='两个牧场的整体外接正方形。' if pid==663 else '后方是广告牌，前方矩形形成遮挡；按实际坐标绘制重叠区域。'
 elif pid==664:
  n=I();pairs=[(S(),S()) for _ in range(n)];items=rows([(f'木板{i+1}',[a,b]) for i,(a,b) in enumerate(pairs)]);text='同一块木板的两面只能二选一；每个字母分别取两面需求的较大值。'
 elif pid==665:
  n,m,k=I(),I(),I();a=[S() for _ in range(n)];items=grid(a,'原始信号');extra=grid([''.join(c*k for c in s) for s in a for j in range(k)],f'横纵各放大 {k} 倍');text='每个原始像素扩展为 K×K 的小方块。'
 elif pid==687:
  n=I();values=dict.fromkeys('Bessie Elsie Daisy Gertie Annabelle Maggie Henrietta'.split(),0)
  for _ in range(n):name,v=S(),I();values[name]+=v
  items=rows([('牛名',list(values)),('总产奶量',list(values.values()))]);text='找第二小的不同总产奶量；同产量若有多头牛则不能唯一确定。'
 elif pid==688:
  n=I();a=[(I(),I()) for _ in range(n)];items=rows([('第一头牛',[x for x,y in a]),('第二头牛',[y for x,y in a])]);text='1、2、3 对应的真实手势未知；比较两种克制方向所能得到的胜场。'
 elif pid==689:
  n=I();a=[S() for _ in range(n)];items=grid(a,'牛的朝向');text='一次操作翻转从左上角到所选格子的整个矩形；从右下角确定必须做的操作。'
 elif pid==711:
  n=I();a=[(I(),I()) for _ in range(n)];items=rows([('牛编号',[x for x,y in a]),('道路一侧',[y for x,y in a])]);text='按时间从左到右观察；只比较同一头牛的前后记录。'
 elif pid==712:
  s=S();items=row(list(s),maxcols=13);text='两头牛的端点若按 A、B、A、B 交替出现，连线会相交；样例中只有 A 和 B 满足。';extra=copy.deepcopy(items)
  for item in extra:
   if item['label'] in 'AB':item['color']=GOLD
 elif pid==713:
  n=I();a=sorted((I(),I()) for _ in range(n));items=rows([('到达时间',[x for x,y in a]),('服务时长',[y for x,y in a])]);text='先到先服务。若前一头尚未结束，后一头必须等待。'
 elif pid==760:
  n=I();mapping=[I() for _ in range(n)];a=[S() for _ in range(n)];items=rows([('起点位置',list(range(1,n+1))),('移动到',mapping),('三次后编号',a)]);text='箭头表示一轮位置映射；已知三轮后的牛编号，要反向还原初始顺序。'
 elif pid==761:
  n=I();a=sorted((I(),S(),I()) for _ in range(n));items=rows([('日期',[x for x,y,z in a]),('奶牛',[y for x,y,z in a]),('产量变化',[f'{z:+}' for x,y,z in a])]);text='三头牛最初均产奶 7；按日期更新，观察最高产量对应的名字集合是否变化。'
 elif pid==784:
  n=I();a=[(I(),I()) for _ in range(n)];items=intervals(a,[f'救生员 {i+1}' for i in range(n)]);text='解雇一人后，求其余时间段并集长度的最大值。'
 elif pid in [785,892,988,1085,1204,1251]:
  n=I();a=[I() for _ in range(n if pid!=988 else n-1)];groups=[('输入',a)]
  if pid in [1085,1204]:groups.append(('畜栏容量' if pid==1085 else '目标顺序',[I() for _ in range(n)]))
  items=rows(groups);extra=rows([('从小到大',sorted(a))]) if pid in [785,1085,1251] else [];text={785:'只有一头牛站错位置；比较排序前后的不同位置。',892:'找最长递增后缀，前缀中的牛需要逐个移走。',988:'输入是相邻两头牛编号之和；猜测首项后，其余编号可顺次推回。',1085:'每头牛需要不小于自身身高的畜栏，统计一对一合法匹配数。',1204:'把上排变成下排，允许选择牛向前移动；判断哪些牛必须被选择。',1251:'柱子/格子是各学生愿付学费；统一定价后统计收入。'}[pid]
 elif pid==807:
  a,b,x,y=I(),I(),I(),I();items,edges=points([(a,0),(b,0),(x,1),(y,1)],['起点 '+str(a),'终点 '+str(b),'传送口 '+str(x),'传送口 '+str(y)]);text='可直接走，也可从任一传送口瞬间到另一个口；比较总步行距离。'
 elif pid==808:
  n=I();a=sorted(I() for _ in range(n));items,_=points([(x,0) for x in a],[str(x) for x in a]);edges=[]
  if n>1:
   for i in range(n):
    j=1 if i==0 else n-2 if i==n-1 else i-1 if a[i]-a[i-1]<=a[i+1]-a[i] else i+1;edges.append({'from':[items[i]['x'],0],'to':[items[j]['x'],0],'color':GOLD})
  frames.append(scene('最近邻传球','箭头指向最近的一头牛；距离相同时选择左边。',items,edges));text='需要多少个初始球，才能让所有牛最终接到球？'
 elif pid==809:
  n=I();a=[I() for _ in range(n)];items=row(['?' if x==-1 else x for x in a]);text='每格是距上次逃跑的天数；? 表示丢失记录。第 1 天一定发生逃跑。'
 elif pid==855:
  a=[(I(),I()) for _ in range(3)];items=rows([('桶容量',[x for x,y in a]),('当前奶量',[y for x,y in a])]);text='按桶 1→2→3→1 的循环倒奶 100 次，每次尽可能多倒且不得溢出。'
 elif pid==856:
  n=I();a=[(I(),I(),I()) for _ in range(n)];items=intervals([(x,y) for x,y,v in a],[f'{v} 桶' for x,y,v in a]);text='同时工作的牛需要同时占有各自桶数；找到任意时刻的最大桶需求。'
 elif pid==857:
  a=[I() for _ in range(10)];b=[I() for _ in range(10)];items=rows([('A 农场桶容量',a),('B 农场桶容量',b)]);text='两农场各有 1000 单位奶。四天按 A→B→A→B→A 搬桶，桶本身也随牛奶移动。'
 elif pid==891:
  n=I();a=[(I(),I(),I()) for _ in range(n)];items=rows([('交换',[f'{x}↔{y}' for x,y,z in a]),('猜测的杯子',[z for x,y,z in a])]);text='石子最初位置未知；分别让石子从 1、2、3 号杯出发完整模拟。'
 elif pid==893:
  n=I();a=[]
  for j in range(n):name=S();a.append((name,[S() for _ in range(I())]))
  items=rows(a);text='每行是一种动物拥有的特征；交集越大，两种动物越难通过提问区分。'
 elif pid==915:
  a=sorted([I(),I(),I()]);items,_=points([(x,0) for x in a],[str(x) for x in a]);text='每次把端点牛移到另外两头牛之间；目标是三头牛连续站立。'
 elif pid==916:
  n,m=I(),I();a=[(I()-1,I()-1) for _ in range(m)];items=[tile(i+1,4+3.5*math.cos(i*2*math.pi/n),4+3.5*math.sin(i*2*math.pi/n)) for i in range(n)];edges=[{'from':[items[x]['x'],items[x]['y']],'to':[items[y]['x'],items[y]['y']],'color':GOLD} for x,y in a];frames.append(scene('牧场约束图','一条边连接的两个牧场不能种同一种草。编号小的牧场优先选择最小可用草种。',items,edges));text='使用 1～4 号草种，求字典序最小的合法分配。'
 elif pid==917:
  n=I();a=[(S(),I(),I()) for _ in range(n)];items=rows([('路段类型',[x for x,y,z in a]),('范围',[f'{y}..{z}' for x,y,z in a])]);text='on 增加车流，off 减少车流，none 给出路上实测范围；求起点与终点的可能区间。'
 elif pid==963:
  k,n=I(),I();items=rows([(f'第 {j+1} 次',[I() for _ in range(n)]) for j in range(k)]);text='每行从左到右为本次排名；找在所有行中相对顺序都相同的牛对。'
 elif pid==964:
  n=I();s=S();items=row(list(s));text='只能看到连续 K 个路标；选择最小 K，使每个长度 K 的窗口都不重复。'
 elif pid==965:
  n=I();pairs=[]
  for _ in range(n):a=S();S();S();S();S();pairs.append((a,S()))
  items=rows([(f'相邻约束 {j+1}',list(pair)) for j,pair in enumerate(pairs)]);text='每行的两头牛必须挨在一起；在全部合法八牛队列中选字典序最小的。'
 elif pid==987:
  n,k=I(),I();a=[S() for _ in range(n)];items=row(a,maxcols=5);text=f'每行最多 {k} 个非空格字符；完整单词不能拆开，空格不占字数。'
 elif pid==989:
  k,n=I(),I();a=[I() for _ in range(n)];items=bars(a,'每次询问的终点速度上限');text=f'赛程 {k}。速度从 0 开始，每秒最多增减 1；每根柱子代表一个独立询问。'
 elif pid==1011:
  n=I();a=[(I(),I()) for _ in range(n)];items,edges=points(a);frames.append(scene('样例坐标','选择三个点，形成一条竖直边和一条水平边，最大化三角形面积。',items,edges));text='题目输出两倍面积，避免小数。'
 elif pid==1012:
  n=I();a,b=S(),S();items=rows([('当前',list(a)),('目标',list(b))]);extra=copy.deepcopy(items)
  for j in range(n):
   if a[j]!=b[j]:extra[1+j]['color']=GOLD
  text='找出两排相同位置的差异；每个连续差异段可一次翻转。'
 elif pid==1013:
  n,k=I(),I();a,b,c,d=I(),I(),I(),I();items=row(list(range(1,n+1)));v=list(range(1,n+1));v[a-1:b]=v[a-1:b][::-1];v[c-1:d]=v[c-1:d][::-1];extra=row(v);text=f'每轮先翻转 [{a},{b}]，再翻转 [{c},{d}]，共做 {k} 轮。第二帧展示一轮结果。'
 elif pid==1059:
  a=[I() for _ in range(7)];items=bars(a,'A、B、C 及各种和（打乱）');extra=bars(sorted(a),'排序后');text='七个数包含 A、B、C、A+B、A+C、B+C、A+B+C。'
 elif pid==1060:
  n=I();a=[I() for _ in range(n)];items=bars(a,'每朵花的花瓣数');text='选连续的一段花，如果其中存在一朵花的花瓣数等于整段平均数，这张照片就有效。'
 elif pid==1061:
  n=I();a=[(S(),I(),I()) for _ in range(n)];items,edges=points([(x,y) for d,x,y in a],[f'{i+1}:{d}' for i,(d,x,y) in enumerate(a)]);frames.append(scene('起点与朝向','E 向右，N 向上；牛会留下已吃草的轨迹，碰到先前留下的轨迹就停下。',items,edges));text='同时到达交点不会相互阻挡。'
 elif pid==1083:
  alphabet=S();word=S();items=rows([('字母顺序',list(alphabet)),('听到的字母',list(word))]);text='每次唱歌都按上排顺序从头开始；下排字母可以跳过没听到的字母，但不能倒着读。'
 elif pid==1084:
  n=I();a=[I() for _ in range(n)];items=bars(a,'牛的编号',[BLUE if v%2==0 else GOLD for v in a]);text='蓝色为偶数，赭色为奇数。分组后每组编号总和必须偶、奇、偶、奇交替。'
 elif pid==1107:
  n=I();records=[]
  for _ in range(n):a=S();S();S();d=S();z=S();S();S();b=S();records.append((a,[d,z,b]))
  items=rows(records);text='每行表示“该牛出生于参照牛之前/之后的最近一个指定生肖年”；以 Bessie 年份为 0 推算。'
 elif pid==1108:
  n=I();a=[(I(),I()) for _ in range(n)];items,edges=points(a,[f'{j+1}:({x},{y})' for j,(x,y) in enumerate(a)]);frames.append(scene('按编号放牛','序号代表放置次序。某头牛恰好有三个上下左右邻居时才舒适。',items,edges));text='输出每次放置后的舒适牛总数。'
 elif pid==1109:
  t=I();s=S();x=y=0;path=[(0,0)]
  for c in s:x+=(c=='E')-(c=='W');y+=(c=='N')-(c=='S');path.append((x,y))
  items,edges=points(path,[str(i) for i in range(len(path))],True);frames.append(scene('第一条闭合路线','从 0 号点按序行走，判断是顺时针还是逆时针。',items,edges));text='N 向上、E 向右；同样处理后续每条独立路径。'
 elif pid==1155:
  n=I();s=S();items=row(list(s));text='选取长度至少 3 的连续照片，其中 G 或 H 恰好只有一头；这头牛就是“孤独牛”。'
 elif pid==1156:
  n=I();a=[I() for _ in range(n)];b=[I() for _ in range(n)];items=rows([('目标温度',a),('当前温度',b)]);extra=bars([x-y for x,y in zip(a,b)],'需要调整的温差');text='一次可以让任意连续区间的温度全部加 1 或减 1，求最少次数。'
 elif pid==1157:
  t=I();n,k=I(),I();a=[S() for _ in range(n)];items=grid(a,f'第 1 个样例：最多 {k} 次转弯');text='从左上走到右下，只能向右或向下；H 格不可通行，统计转弯数不超过 K 的路线。'
 elif pid==1179:
  a=[S() for _ in range(3)];b=[S() for _ in range(3)];items=grid(a,'正确答案')+grid(b,'猜测',xoff=5);text='先匹配位置和字母都正确的绿色，再按剩余字母频次匹配黄色。'
 elif pid==1180:
  t=I();a=[I() for _ in range(4)];b=[I() for _ in range(4)];items=rows([('骰子 A 四面',a),('骰子 B 四面',b),('待设计骰子 C',['?']*4)]);text='为 C 的四个面选择 1～10，使三个骰子形成 A 胜 B、B 胜 C、C 胜 A 的循环（或反向）。'
 elif pid in [1181,1203]:
  t=I();n=I();a=[I() for _ in range(n)];items=bars(a,'第 1 个独立测试');text='一次同时减少相邻两头牛的饥饿值，直到全部相等且非负。' if pid==1181 else '一次合并相邻两个记录，数值相加；目标是让剩余记录全部相等。'
 elif pid==1205:
  n=I();blocks=[S() for _ in range(4)];words=[S() for _ in range(n)];items=rows([(f'积木 {j+1}',list(s)) for j,s in enumerate(blocks)]+[('目标单词',words)]);text='每个单词单独判断；一个字母使用一块积木，一块积木在同一单词中只能用一次。'
 elif pid==1252:
  t=I();n,k=I(),I();s=S();items=rows([('牛的品种',list(s)),('可种植位置',['.']*n)]);text=f'第一组样例 K={k}。每头牛需要在距离 K 以内找到同品种草；每个位置最多一种草。'
 elif pid==1253:
  t=I();n,m=I(),I();a=[(S(),S()) for _ in range(m)];items=rows([(f'输入 {x}',[y]) for x,y in a]);text='能否用逐个变量判断的 if / else 程序同时解释这些输入输出？同一分支被截获的样本必须输出一致。'
 elif pid==1275:
  n=I();s=S();e=[I() for _ in range(n)];items=rows([('品种',list(s)),('访问到编号',e)]);text='牛 i 访问 [i,Eᵢ]。两品种各选一名领袖，每名领袖必须访问全部同品种牛，或访问另一名领袖。'
 elif pid==1276:
  n,m=I(),I();cows=[(I(),I(),I()) for _ in range(n)];acs=[(I(),I(),I(),I()) for _ in range(m)];items=intervals([(l,r+1) for l,r,c in cows],[f'需求 {c}' for l,r,c in cows]);extra=intervals([(l,r+1) for l,r,p,c in acs],[f'冷{p}/价{c}' for l,r,p,c in acs]);text='各牛栏冷量需求必须全部满足；空调范围可重叠、冷量可叠加，求最低费用。右端加 1 用于展示包含端点的整数牛栏。'
 elif pid==1277:
  t=I();s=S();items=row(list(s));text='可以删除两端字符、修改指定端点；目标是得到 MOO，保留窗口中心必须已经是 O。'
 elif pid==1299:
  n,t=I(),I();a=[(I(),I()) for _ in range(n)];items=rows([('到达日',[x for x,y in a]),('草料数量',[y for x,y in a])]);text=f'每天吃一捆，收到的草料可积存；计算到第 {t} 天共吃了多少。'
 elif pid==1300:
  t=I();n=I();a=[S() for _ in range(n)];k=I();b=[S() for _ in range(k)];items=grid(a,'目标图案')+grid(b,'印章',xoff=n+2);text='印章可以旋转并反复盖，但不能涂黑目标中的白格；检查是否能覆盖全部目标黑格。'
 elif pid==1301:
  n,k=I(),I();a=[I() for _ in range(n)];items,_=points([(x,0) for x in a],[f'第 {x} 天' for x in a]);text=f'每次开启订阅支付 {k}，每个订阅日再付 1；相邻观看日之间可以保持订阅或重新开启。'
 elif pid==1347:
  n,m=I(),I();a=[I() for _ in range(n)];b=[I() for _ in range(m)];items=rows([('奶牛初始高度',a),('糖杖长度',b)]);text='每根糖杖从地面竖起，牛按顺序吃自己够得到且尚未被吃的部分，再按吃掉的长度长高。'
 elif pid==1348:
  n=I();s=S();items=row(list(s));text='1 表示现在感染，0 表示未感染；每天向左右传播一格，反推最少最初感染牛数。'
 elif pid==1349:
  t=I();n=I();h=[I() for _ in range(n)];a=[I() for _ in range(n)];rank=[I() for _ in range(n)];items=rows([('初始高度',h),('每日生长',a),('目标更高株数',rank)]);text='第一组独立测试。每株高度随天数线性增加；找最早使每株都满足指定排名的整数天数。'
 elif pid==1371:
  t=I();n=I();a=[I() for _ in range(n)];items=row(a);text='在某连续区间形成严格多数的偏好可传播到整个区间；判断哪些偏好最终能统一全队。'
 elif pid==1372:
  n,start=I(),I();a=[(I(),I()) for _ in range(n)];items=rows([('编号',list(range(1,n+1))),('类型',['跳板' if x==0 else '目标' for x,y in a]),('增幅/强度',[y for x,y in a])]);text=f'从 {start} 号位置向右、弹力 1 出发。跳板使方向翻转并加大弹力；目标只在弹力足够时破碎。'
 elif pid==1373:
  n=I();a=[I() for _ in range(n)];items=bars(a,'当前细菌数（可以为负）');prev=0;diff=[]
  for v in a:diff.append(v-prev);prev=v
  extra=bars(diff,'一阶差分');text='选一个起点，之后各格依次增减 1、2、3……，让所有格子归零。'
 elif pid==1395:
  t=I();a=[S() for _ in range(t)];items=row(a);text='两人轮流减去正回文数，不能操作者输；每个数字是独立的初始局面。'
 elif pid==1396:
  n,m=I(),I();s=S();a=[I() for _ in range(n)];items=[tile(f'{s[i]} · {a[i]}',5+3.5*math.cos(i*2*math.pi/n),4+3.5*math.sin(i*2*math.pi/n),BLUE if s[i]=='R' else GOLD,height=.4) for i in range(n)];text=f'桶围成圆环，初始装满；每分钟同时按 L/R 传 1 单位奶，超过容量会溢出。求 {m} 分钟后的总奶量。'
 elif pid==1397:
  n,q=I(),I();a=[I() for _ in range(n)];b=[I() for _ in range(n)];items=rows([('关闭时间',a),('路程时间',b)]);extra=bars([x-y for x,y in zip(a,b)],'关闭时间 − 路程时间');text='询问出发时刻 S 能否及时抵达至少 V 个农场；到达必须严格早于关闭时间。'
 elif pid==1443:
  t=I();a=[I() for _ in range(t)];items=row(a);extra=rows([('差异区间',['45–49','445–499','4445–4999'])]);text='每个 N 独立统计 2..N：直接舍入到最高位与逐位连锁舍入，结果有多少次不同？'
 elif pid==1444:
  n,q=I(),I();a=[(I(),I(),I()) for _ in range(q)];items=rows([('依次移除坐标',[f'{x},{y},{z}' for x,y,z in a])]);text=f'{n}×{n}×{n} 奶酪中挖掉这些方块，每次统计沿三条轴的完整空通道；专属三维模型可切换查看。'
 elif pid==1445:
  n,f=I(),I();s=S();items=row(list(s));text=f'原串至多一个字符出错；找可能至少出现 {f} 次的 abb 模式，其中 a≠b，子串可以重叠。'
 elif pid==1467:
  t=I();n,a,b=I(),I(),I();g=[S() for _ in range(n)];items=grid(g,'叠加照片');text=f'星星可消失，或向右 {a}、向下 {b} 移动。W/G/B 表示两张照片合计出现 0/1/2 次，求最少原始星星。'
 elif pid==1468:
  n=I();a=[I() for _ in range(n)];items=row(a);text='保持相对顺序选三个数：后两个相等，且不同于第一个。统计不同数值三元组，不重复计算不同位置。'
 elif pid==1469:
  n=I();a=[I() for _ in range(n)];b=[I() for _ in range(n)];items=rows([('牛的品种',a),('目标品种',b)]);text='反转上排某一连续区间后，与下排逐位比较；对每种匹配数量统计能产生它的区间数。'
 elif pid==1491:
  n,q=I(),I();g=[S() for _ in range(n)];items=grid(g,'官方样例初始画布');text='关于中央水平轴、竖直轴同时对称；每个位置对应四格一组，单次修改只影响一组。'
 elif pid==1492:
  n=I();a=[I() for _ in range(n)];items=row(a);freq=Counter(a);extra=rows([('候选 MEX',list(range(n+1))),('出现次数',[freq[x] for x in range(n+1)])]);text='对每个候选 MEX，消除该值，并补齐比它小的所有非负整数。'
 elif pid==1493:
  t=I();n,k=I(),I();a=[I() for _ in range(n)];items=row(a);text=f'第一组样例序列。最多写 {k} 条 PRINT，可嵌套 REP 循环；限制的是代码中的语句条数，不是输出次数。'
 elif pid==1539:
  t=I();a,b,ca,cb,fa=I(),I(),I(),I(),I();items=rows([('已有筹码',[f'A={a}',f'B={b}']),('兑换',[f'{cb} B',f'{ca} A']),('目标',[f'A ≥ {fa}'])]);text='新增筹码类型由最坏情况决定；求收到多少枚后，无论 A/B 如何分配都能达到目标。'
 elif pid==1540:
  t,k=I(),I();n=I();s=S();items=row([s[i:i+3] for i in range(0,len(s),3)]);text=f'每格是 COW 的循环移位块。每次删除一个形如 Y+Y 的子序列；k={k} 控制允许的操作次数。'
 elif pid==1541:
  n,k=I(),I();q=I();a=[(I()-1,I()-1,I()) for _ in range(q)];g=[[0]*n for _ in range(n)];items=grid(g,'初始全为 0')
  for r,c,v in a:
   g[r][c]=v;frames.append(scene(f'更新 ({r+1},{c+1})={v}',f'在当前网格中寻找和最大的 {k}×{k} 窗口。',grid(g)))
  text='输入的是该格的新值，更新量需要先减去旧值。'
 elif pid==1563:
  t,k=I(),I();n=I();s=S();items=row(list(s));text='上排为目标字符串。按 O 前会翻转已经输入的全部字符；从末尾逆推按键，避免反复修改长前缀。'
 elif pid==1564:
  n,k=I(),I();a=[(I(),I(),I()) for _ in range(k)];items=rows([('可选棋盘',list('MOOOM') if n==5 else ['?']*n),('点击三元组',[f'{x},{y},{z}' for x,y,z in a])]);text='每个三元组依次读出 MOO 才得分；重复三元组重复计分，求最大得分及达到它的棋盘数量。'
 elif pid==1565:
  n,q=I(),I();a=[I() for _ in range(n)];items=rows([('套餐桶数',[2**i for i in range(n)]),('套餐价格',a)]);text='每种套餐可重复购买，要买至少 x 桶；有时买多一点反而更便宜。'
 elif pid==1587:
  t=I();n,k=I(),I();a=[I() for _ in range(n)];items=row(a);text=f'每次任选一个数加 {k}，使所有数互不相同。相同余数构成互不干扰的数值链。'
 elif pid==1588:
  t=I();s=S();items=row(list(s));extra=row([int(c)%2 for c in s]);text='若含有 0、1 之外的数字，逐位映射为奇偶性；否则整数减 1。第二帧是一次奇偶映射的结果。'
 elif pid==1589:
  t=I();n,m=I(),I();target=S();g=[S() for _ in range(n)];items=grid(g,'原始字符串网格');extra=grid([target],'目标第一行');text=f'同一行内交换，或同一列跨行交换；最多 {2*m} 次操作把第一行变成目标。'
 else:raise ValueError('Missing diagram '+str(pid))
 first=scene('读懂样例中的对象',text,items)
 if frames:
  if pid==1541:frames=[first]+frames
 else:frames=[first]
 if extra:frames.append(scene('观察结构变化',approach,extra))
 else:
  highlighted=copy.deepcopy(items)
  frames.append(scene('从图中找关键关系',approach,highlighted))
 # Final frame anchors the drawing to the official expected output, without inventing an algorithm trace.
 frames.append(scene('回到题目要求', '官方样例输出（可能含多个独立测试）：\n'+sample['output'],copy.deepcopy(extra or items)))
 result={'problemId':pid,'source':p['official'],'sampleIndex':0,'caption':text,'frames':frames,'note':'按官方第一个 Sample Input 绘制；多测试输入重点展示首个测试。'}
 (OUT/f'{pid}.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
for p in CAT:draw(p)
print('sample diagrams:',len(CAT))
