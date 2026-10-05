"""Original, progressive exercises for the eleven added method chapters."""
import json,textwrap
from pathlib import Path
R=Path(__file__).resolve().parents[1]
items=json.loads((R/'data/course-exercises.json').read_text());items=[x for x in items if x['id']<91045]
def add(lesson,title,prompt,fmt,code,hint,cases,out='输出一个整数。'):
    number=sum(x['lesson']==lesson for x in items)
    items.append(dict(id=91045+len(items)-45,lesson=lesson,title=title,level=['基础','巩固','挑战'][number],prompt=prompt,inputFormat=fmt,outputFormat=out,solution=textwrap.dedent(code).strip()+'\n',hint=hint,cases=[dict(name=str(i+1),input=a+'\n',output=b+'\n') for i,(a,b) in enumerate(cases)]))
add('complexity','有多少对牛','N 头不同的牛，选择两头组成一对。顺序不影响配对，不能选自己。0≤N≤100000。','一行整数 N。','n = int(input())\nprint(n * (n - 1) // 2)','每对在 N(N−1) 中出现两次。',[('4','6'),('1','0'),('0','0'),('100000','4999950000')])
add('complexity','这次枚举有多少检查','枚举所有 i<j 的牛对，并对每对检查 K 条规则。求检查总次数。0≤N≤100000，1≤K≤1000。','一行 N K。','n, k = map(int, input().split())\nprint(n * (n - 1) // 2 * k)','外层候选数乘每个候选的验证工作量。',[('4 3','18'),('1 1000','0'),('0 2','0'),('100000 1000','4999950000000')])
add('complexity','给程序补齐边界','牛的编号序列中，相同值连续出现算一段。输出段数。N 可以为 0；编号为 1 到 9。0≤N≤100000。','第一行 N，第二行 N 个编号；N=0 时第二行为空。', '''
n = int(input())
a = list(map(int, input().split()))
answer = 0
for i in range(n):
    if i == 0 or a[i] != a[i - 1]:
        answer += 1
print(answer)
''','只在第一项或与前一项不同的地方增加段数。检查空数组和全相同。',[('6\n1 1 2 2 1 3','4'),('0\n','0'),('1\n7','1'),('4\n2 2 2 2','1')])
add('simulation','倒一次牛奶','把 1 号桶倒入 2 号桶，直到 1 号空或 2 号满。容量不超过 100，奶量在 0 与容量之间。','两行，每行容量与当前奶量。', '''
c1, m1 = map(int, input().split())
c2, m2 = map(int, input().split())
amount = min(m1, c2 - m2)
print(m1 - amount, m2 + amount)
''','能倒多少同时受源桶现有量和目标桶剩余容量限制。',[('10 3\n11 4','0 7'),('10 9\n5 4','8 5'),('4 0\n4 4','0 4'),('5 5\n5 0','0 5')], '输出两个桶最终的奶量，用空格隔开。')
add('simulation','轮流倒奶','三个桶重复执行 1→2、2→3、3→1，共操作 T 次。容量≤100，0≤T≤1000。','第一行 T，接下来三行各为容量和奶量。', '''
t = int(input())
capacity, milk = [], []
for _ in range(3):
    c, m = map(int, input().split())
    capacity.append(c)
    milk.append(m)
for i in range(t):
    a, b = i % 3, (i + 1) % 3
    amount = min(milk[a], capacity[b] - milk[b])
    milk[a] -= amount
    milk[b] += amount
print(*milk)
''','用 i%3 决定源桶，每次只更新两个位置。',[('3\n10 3\n11 4\n12 5','10 0 2'),('0\n2 1\n3 2\n4 3','1 2 3'),('4\n5 5\n5 0\n5 0','0 5 0'),('10\n1 1\n1 1\n1 1','1 1 1')],'输出三个桶的最终奶量，用空格隔开。')
add('simulation','跟踪交换的贝壳','三个位置编号为 1、2、3。小球初始在 P，每次交换两个位置的贝壳，输出最后球的位置。0≤N≤1000。','第一行 N P；随后 N 行每行两个不同位置 a b。', '''
n, p = map(int, input().split())
for _ in range(n):
    a, b = map(int, input().split())
    if p == a:
        p = b
    elif p == b:
        p = a
print(p)
''','每次最多进入一个分支；两个独立 if 可能把刚移动的小球又移回去。',[('3 1\n1 2\n2 3\n1 2','3'),('0 2','2'),('2 1\n1 2\n1 2','1'),('1 3\n1 2','3')])
add('enumeration','两袋饲料','选择两个不同位置的袋子，使重量和恰好为 T。顺序不计；重复重量保留不同位置。1≤N≤200，重量与 T 为非负整数≤1000。','第一行 N T，第二行 N 个重量。', '''
n, target = map(int, input().split())
a = list(map(int, input().split()))
answer = 0
for i in range(n):
    for j in range(i + 1, n):
        if a[i] + a[j] == target:
            answer += 1
print(answer)
''','用 i<j 排除重复与自己配对。',[('4 9\n2 4 7 5','2'),('3 4\n2 2 2','3'),('1 4\n2','0'),('3 0\n0 0 0','3')])
add('enumeration','给每头牛送草','把一个供草点放在某头牛的位置，所有牛到此点的距离之和是多少的最小值？1≤N≤100，坐标绝对值≤1000。','第一行 N，第二行 N 个一维坐标。', '''
n = int(input())
a = list(map(int, input().split()))
answer = min(sum(abs(x - at) for x in a) for at in a)
print(answer)
''','枚举供草点，再遍历所有牛计算距离之和。',[('3\n1 4 8','7'),('1\n-9','0'),('4\n2 2 2 2','0'),('4\n-5 -1 1 5','12')])
add('enumeration','检查每个连续区间','给定正整数序列，统计连续区间的元素和恰好为 T 的个数。1≤N≤100，1≤a[i]≤100，0≤T≤10000。','第一行 N T，第二行 N 个整数。', '''
n, target = map(int, input().split())
a = list(map(int, input().split()))
answer = 0
for left in range(n):
    total = 0
    for right in range(left, n):
        total += a[right]
        if total == target:
            answer += 1
print(answer)
''','固定左端点，向右扩展时维护总和，每个区间恰好检查一次。',[('4 3\n1 2 1 2','3'),('3 2\n1 1 1','2'),('1 0\n1','0'),('1 7\n7','1')])
add('sorting','最近的两头牛','在一维坐标上找最近的两头牛，输出距离。不同牛可同坐标。2≤N≤10000，坐标绝对值≤1000000。','第一行 N，第二行 N 个坐标。', '''
n = int(input())
a = sorted(map(int, input().split()))
print(min(a[i] - a[i - 1] for i in range(1, n)))
''','排序后只需检查相邻牛；非相邻之间还夹着其他牛。',[('4\n7 1 4 2','1'),('2\n-5 5','10'),('3\n8 8 2','0'),('2\n1000000 -1000000','2000000')])
add('sorting','给身高排座次','按身高从小到大输出牛的原始编号。身高相同则原编号小的靠前，编号从 1 开始。1≤N≤10000，身高为 1 到 1000000。','第一行 N，第二行 N 个身高。', '''
n = int(input())
a = list(map(int, input().split()))
order = sorted(range(n), key=lambda i: (a[i], i))
print(*(i + 1 for i in order))
''','排序的是编号，比较键是 (身高, 编号)。',[('4\n4 2 7 1','4 2 1 3'),('3\n5 5 5','1 2 3'),('1\n9','1'),('4\n3 1 3 1','2 4 1 3')],'输出 N 个原始编号，用空格隔开。')
add('sorting','统一售价的最大收入','N 位顾客分别最多愿意支付 a[i]，售价不高于其意愿者都会购买。输出最大收入及最优售价；收入相同时取较小售价。1≤N≤10000，1≤a[i]≤1000000。','第一行 N，第二行 N 个意愿价格。', '''
n = int(input())
a = sorted(map(int, input().split()))
best, price = 0, 0
for i, value in enumerate(a):
    revenue = value * (n - i)
    if revenue > best:
        best, price = revenue, value
print(best, price)
''','升序枚举售价，后面的顾客都买得起。相同收入时不覆盖更小的售价。',[('4\n1 2 4 7','8 4'),('3\n2 2 2','6 2'),('2\n2 4','4 2'),('1\n9','9 9')],'输出最大收入和售价，用空格隔开。')
add('counting','牛的品种数','统计字符串中不同品种的数量。品种用大写字母表示，1≤字符串长度≤10000。','一行品种字符串。','s = input().strip()\nprint(len(set(s)))','集合只保留不同的值。',[('GHGGH','2'),('AAAA','1'),('ABCDEF','6'),('Z','1')])
add('counting','同品种配对','统计由两头同品种的不同牛组成的无序对。品种是大写字母，1≤长度≤10000。','一行品种字符串。', '''
s = input().strip()
counts = {}
for x in s:
    counts[x] = counts.get(x, 0) + 1
print(sum(c * (c - 1) // 2 for c in counts.values()))
''','同品种有 c 头时贡献 c(c−1)/2 对。',[('GHGGH','4'),('AAAA','6'),('ABC','0'),('Z','0')])
add('counting','新增一头牛的贡献','牛按顺序进入队伍，每进入一头，输出它与之前同品种的牛能组成多少新牛对。品种为大写字母，1≤长度≤10000。','一行品种字符串。', '''
s = input().strip()
counts, answers = {}, []
for x in s:
    old = counts.get(x, 0)
    answers.append(old)
    counts[x] = old + 1
print(*answers)
''','新牛的贡献等于之前该品种的数量，先读取再更新。',[('GHGGH','0 0 1 2 1'),('AAAA','0 1 2 3'),('ABC','0 0 0'),('Z','0')],'按到达顺序输出每头牛新增的配对数，用空格隔开。')
add('adhoc','步长二的脚印','Bessie 从坐标 A 出发，每步可以向左或右走 2。能否到 B？坐标绝对值≤10^9。','一行 A B。','a, b = map(int, input().split())\nprint("YES" if (b - a) % 2 == 0 else "NO")','每次移动后奇偶性不变；同奇偶时可以连续向一个方向走。',[('1 7','YES'),('1 8','NO'),('-3 3','YES'),('0 0','YES')],'输出 YES 或 NO。')
add('adhoc','平均分配草料','每次可从任意牛栏搬一捆草到另一栏。让所有栏草量相等，求最少次数；无法相等输出 −1。1≤N≤10000，0≤a[i]≤1000000。','第一行 N，第二行 N 个草量。', '''
n = int(input())
a = list(map(int, input().split()))
if sum(a) % n:
    print(-1)
else:
    target = sum(a) // n
    print(sum(max(0, x - target) for x in a))
''','总量不变决定目标。每次只能搬一捆，所有多余的捆数就是下界，也一定能搬给缺草栏。',[('4\n4 2 6 4','2'),('3\n1 1 2','-1'),('1\n8','0'),('3\n0 0 9','6')])
add('adhoc','构造脚印序列','构造 N 个数，每个为 1 或 −1，使总和为 S。要求所有 1 在所有 −1 前面；不可能时输出 IMPOSSIBLE。1≤N≤100，|S|≤200。','一行 N S。', '''
n, s = map(int, input().split())
if abs(s) > n or (n + s) % 2:
    print("IMPOSSIBLE")
else:
    positive = (n + s) // 2
    print(*([1] * positive + [-1] * (n - positive)))
''','设正步数量 p，负步是 N−p。由 p−(N−p)=S 求 p，并检查范围与整数性。',[('5 1','1 1 1 -1 -1'),('2 1','IMPOSSIBLE'),('1 -1','-1'),('2 4','IMPOSSIBLE')],'按要求输出序列，或 IMPOSSIBLE。')
add('greedy','尽量多买草袋','每袋只能买一次，预算 B，最多能买多少袋？1≤N≤10000，0≤B≤10^9，价格为 1 到 10^6。','第一行 N B，第二行 N 个价格。', '''
n, budget = map(int, input().split())
a = sorted(map(int, input().split()))
answer = 0
for cost in a:
    if cost > budget:
        break
    budget -= cost
    answer += 1
print(answer)
''','同样买一袋，更便宜不会减少以后能买的数量，可以交换到先买最便宜的方案。',[('4 7\n4 2 7 1','3'),('2 0\n1 2','0'),('3 6\n2 2 2','3'),('1 4\n5','0')])
add('greedy','覆盖一排牛','同品种牛在一维坐标上，饲喂站可放在任意位置，覆盖左右各 K 单位。求覆盖所有牛的最少站数。1≤N≤10000，0≤K≤100000，坐标绝对值≤10^6。','第一行 N K，第二行 N 个坐标。', '''
n, k = map(int, input().split())
a = sorted(map(int, input().split()))
i = answer = 0
while i < n:
    right = a[i] + 2 * k
    answer += 1
    while i < n and a[i] <= right:
        i += 1
print(answer)
''','覆盖最左未处理点 x 的站，可以尽量向右放在 x+K，最右覆盖 x+2K。',[('4 1\n1 2 5 6','2'),('3 0\n2 2 3','2'),('1 9\n-5','1'),('3 1\n0 2 4','2')])
add('greedy','寻找硬币贪心的反例','硬币面值为 1、3、4，每种无限多。凑出 N 的最少硬币数是多少？0≤N≤100。请通过枚举 3、4 元数量获得确切答案。','一行 N。', '''
n = int(input())
answer = n
for four in range(n // 4 + 1):
    for three in range((n - four * 4) // 3 + 1):
        one = n - four * 4 - three * 3
        answer = min(answer, four + three + one)
print(answer)
''','N=6 时先选 4 会用 3 枚，但 3+3 只需 2 枚。先验证贪心能否被反例推翻。',[('6','2'),('8','2'),('0','0'),('2','2')])
add('geometry','走到牛棚的距离','只能沿横轴或纵轴走。求从 (x1,y1) 到 (x2,y2) 的最短距离。坐标绝对值≤10^6。','一行 x1 y1 x2 y2。','x1, y1, x2, y2 = map(int, input().split())\nprint(abs(x1 - x2) + abs(y1 - y2))','每个方向都必须补齐坐标差，先横后纵能达到这个下界。',[('0 0 3 4','7'),('-2 3 2 -3','10'),('1 1 1 1','0'),('0 -2 0 5','7')])
add('geometry','两块草地的交集','两个轴对齐矩形，求重叠面积。每个矩形给定左下角和右上角，宽高均为正；坐标绝对值≤1000。','两行，每行 x1 y1 x2 y2。', '''
a, b, c, d = map(int, input().split())
e, f, g, h = map(int, input().split())
print(max(0, min(c, g) - max(a, e)) * max(0, min(d, h) - max(b, f)))
''','横向和纵向分别求交集长度，再相乘。',[('0 0 4 3\n2 1 5 4','4'),('0 0 1 1\n1 0 2 1','0'),('-2 -2 2 2\n-1 -1 1 1','4'),('0 0 2 2\n0 3 2 4','0')])
add('geometry','多块小草地的并集','N 个矩形都在整数网格中，统计至少被一块覆盖的面积。1≤N≤20；0≤x1<x2≤20，0≤y1<y2≤20。','第一行 N，随后 N 行各为 x1 y1 x2 y2。', '''
n = int(input())
covered = set()
for _ in range(n):
    x1, y1, x2, y2 = map(int, input().split())
    for x in range(x1, x2):
        for y in range(y1, y2):
            covered.add((x, y))
print(len(covered))
''','每个 (x,y) 代表一个单位小方格，把 Fence Painting 的标记方法扩展到二维。',[('2\n0 0 4 3\n2 1 5 4','17'),('2\n0 0 2 2\n0 0 2 2','4'),('2\n0 0 1 1\n1 0 2 1','2'),('1\n0 0 20 20','400')])
add('prefix','写出累计草量','输出前缀和数组 p，约定 p[0]=0，p[i] 为前 i 个元素之和。1≤N≤10000，元素绝对值≤1000。','第一行 N，第二行 N 个整数。', '''
n = int(input())
a = list(map(int, input().split()))
p = [0]
for x in a:
    p.append(p[-1] + x)
print(*p)
''','p 比原数组多一个初始的 0。',[('4\n4 2 7 1','0 4 6 13 14'),('1\n0','0 0'),('3\n1 -2 3','0 1 -1 2'),('2\n-3 -4','0 -3 -7')],'输出 N+1 个数，用空格隔开。')
add('prefix','多次查询牛槽','每次查询半开区间 [L,R) 的元素和。下标从 0 开始，0≤L≤R≤N；1≤N,Q≤10000，元素绝对值≤1000。','第一行 N Q；第二行 N 个数；随后 Q 行各为 L R。', '''
n, q = map(int, input().split())
a = list(map(int, input().split()))
p = [0]
for x in a:
    p.append(p[-1] + x)
for _ in range(q):
    l, r = map(int, input().split())
    print(p[r] - p[l])
''','半开区间可统一处理空区间和完整数组，答案为 p[R]−p[L]。',[('4 3\n4 2 7 1\n1 3\n0 4\n2 2','9\n14\n0'),('1 1\n-5\n0 1','-5'),('3 2\n1 -2 3\n0 2\n2 3','-1\n3'),('2 1\n0 0\n0 2','0')],'每个查询的答案单独一行。')
add('prefix','批量添加草料','N 个槽初始为 0。执行 Q 次对半开区间 [L,R) 每项加 V，输出最终各槽值。1≤N,Q≤10000，0≤L≤R≤N，0≤V≤1000。','第一行 N Q；随后 Q 行各为 L R V。', '''
n, q = map(int, input().split())
d = [0] * (n + 1)
for _ in range(q):
    l, r, v = map(int, input().split())
    d[l] += v
    d[r] -= v
answer, current = [], 0
for i in range(n):
    current += d[i]
    answer.append(current)
print(*answer)
''','只在两个端点记录变化，再累计一次。额外的 d[N] 用来接收右端减量。',[('4 2\n0 3 2\n1 4 1','2 3 3 1'),('1 1\n0 1 5','5'),('3 1\n1 1 7','0 0 0'),('2 2\n0 2 3\n0 2 4','7 7')],'输出 N 个最终值，用空格隔开。')
add('recursion','列完选择再计数','N 袋饲料，每袋选或不选。求总重量为 T 的子集数量，空集也算，重复重量按不同位置区分。0≤N≤18，0≤重量≤100，0≤T≤1800。','第一行 N T；第二行 N 个重量。', '''
n, target = map(int, input().split())
a = list(map(int, input().split()))
def dfs(i, total):
    if i == n:
        return int(total == target)
    return dfs(i + 1, total) + dfs(i + 1, total + a[i])
print(dfs(0, 0))
''','每层决定一袋是否选，直到所有位置决定完再判断总和。',[('3 6\n2 4 7','1'),('3 2\n1 1 1','3'),('0 0\n','1'),('2 0\n0 0','4')])
add('recursion','至少装到目标','每袋可取一次，找总重量至少为 T 的子集中的最小总重量。做不到输出 −1。1≤N≤18，重量为 1 到 100，0≤T≤2000。','第一行 N T，第二行 N 个重量。', '''
n, target = map(int, input().split())
a = list(map(int, input().split()))
best = sum(a) + 1
def dfs(i, total):
    global best
    if i == n:
        if total >= target:
            best = min(best, total)
        return
    dfs(i + 1, total)
    dfs(i + 1, total + a[i])
dfs(0, 0)
print(-1 if best == sum(a) + 1 else best)
''','先完整枚举保证正确，再讨论剪枝。空集在 T=0 时是合法最优解。',[('3 6\n2 4 7','6'),('2 8\n2 3','-1'),('1 0\n7','0'),('3 8\n2 4 7','9')])
add('recursion','不能相邻的两头牛','将编号 1 到 N 的牛排成一队，编号 1 和 2 不得相邻。求合法排列数。2≤N≤8。','一行 N。', '''
n = int(input())
used = [False] * (n + 1)
order = []
def dfs():
    if len(order) == n:
        return 1
    answer = 0
    for x in range(1, n + 1):
        if used[x]:
            continue
        if order and {order[-1], x} == {1, 2}:
            continue
        used[x] = True
        order.append(x)
        answer += dfs()
        order.pop()
        used[x] = False
    return answer
print(dfs())
''','每层放一头尚未使用的牛；放入和撤回必须成对出现。',[('2','0'),('3','2'),('4','12'),('8','30240')])
add('graphs','能到达的牛棚','N 个牛棚、M 条无向道路，从 S 出发求能到达的牛棚数，包含自己。1≤N≤1000，0≤M≤2000。','第一行 N M S；随后 M 行道路两端，编号 1 到 N。', '''
n, m, start = map(int, input().split())
graph = [[] for _ in range(n + 1)]
for _ in range(m):
    a, b = map(int, input().split())
    graph[a].append(b)
    graph[b].append(a)
seen, stack = {start}, [start]
while stack:
    v = stack.pop()
    for u in graph[v]:
        if u not in seen:
            seen.add(u)
            stack.append(u)
print(len(seen))
''','道路登记两遍。发现新点时立即标记 visited，避免重复入栈。',[('4 2 1\n1 2\n2 3','3'),('1 0 1','1'),('3 3 1\n1 2\n2 3\n3 1','3'),('4 1 4\n1 2','1')])
add('graphs','分成了几个牧场群','N 个牧场、M 条无向路，求连通块数。孤立牧场自己算一块。1≤N≤1000，0≤M≤2000。','第一行 N M，随后 M 行两个端点，编号 1 到 N。', '''
n, m = map(int, input().split())
graph = [[] for _ in range(n)]
for _ in range(m):
    a, b = map(int, input().split())
    graph[a - 1].append(b - 1)
    graph[b - 1].append(a - 1)
seen, answer = set(), 0
for start in range(n):
    if start in seen:
        continue
    answer += 1
    seen.add(start)
    stack = [start]
    while stack:
        v = stack.pop()
        for u in graph[v]:
            if u not in seen:
                seen.add(u)
                stack.append(u)
print(answer)
''','每次从未访问过的牧场重新出发，就发现一个新的连通块。',[('4 2\n1 2\n2 3','2'),('3 0','3'),('3 3\n1 2\n2 3\n3 1','1'),('1 0','1')])
add('graphs','跟着指示牌找循环','每个牧场恰有一个指向其他牧场或自己的指示牌。从 S 出发，最终进入的循环长度是多少？1≤N≤10000。','第一行 N S；第二行 N 个编号，第 i 项是 i 的下一站，编号从 1 开始。', '''
n, start = map(int, input().split())
nxt = list(map(int, input().split()))
first, step, v = {}, 0, start
while v not in first:
    first[v] = step
    step += 1
    v = nxt[v - 1]
print(step - first[v])
''','记录第一次到达每个牧场的步数，再次遇到它时，两次步数之差就是循环长度。',[('4 1\n2 3 2 4','2'),('1 1\n1','1'),('3 1\n2 3 1','3'),('4 4\n2 3 1 4','1')])
assert len(items)==78
(R/'data/course-exercises.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
print('Wrote',len(items),'exercises across',len({e['lesson'] for e in items}),'lessons')
