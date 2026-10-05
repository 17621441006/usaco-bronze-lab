exec(open(__file__.replace('author-batch2.py','solution-authoring.py')).read())
add(891,r'''
a=[(I()-1,I()-1,I()-1) for _ in range(I())];best=0
for start in range(3):
    pos=start;score=0
    for x,y,g in a:
        if pos==x:pos=y
        elif pos==y:pos=x
        score+=pos==g
    best=max(best,score)
print(best)
''',r'''
int n;cin>>n;vector<array<int,3>>a(n);for(auto &v:a)cin>>v[0]>>v[1]>>v[2];int ans=0;for(int s=1;s<=3;s++){int p=s,score=0;for(auto v:a){if(p==v[0])p=v[1];else if(p==v[1])p=v[0];score+=p==v[2];}ans=max(ans,score);}cout<<ans<<'\n';
''','O(N)','分别假设石子最初在三个杯子下面，完整模拟交换和猜测。')
add(892,r'''
n=I();a=[I() for _ in range(n)];i=n-1
while i>0 and a[i-1]<a[i]:i-=1
print(i)
''',r'''
int n;cin>>n;vector<int>a(n);for(int &x:a)cin>>x;int i=n-1;while(i>0&&a[i-1]<a[i])i--;cout<<i<<'\n';
''','O(N)','保留末尾已经严格递增的后缀，前面的每头牛都必须从队首移走一次。')
add(893,r'''
a=[]
for _ in range(I()):
    name=S();a.append({S() for _ in range(I())})
print(1+max((len(x&y) for x,y in itertools.combinations(a,2)),default=0))
''',r'''
int n;cin>>n;vector<set<string>>a(n);for(int i=0,k;i<n;i++){string s;cin>>s>>k;while(k--){cin>>s;a[i].insert(s);}}int ans=0;for(int i=0;i<n;i++)for(int j=0;j<i;j++){int common=0;for(auto s:a[i])common+=a[j].count(s);ans=max(ans,common);}cout<<ans+1<<'\n';
''','O(N²K)','两种动物共同特征最多时，需要先问完这些相同特征，再问一个能够区分它们的问题。')
add(915,r'''
a,b,c=sorted([I(),I(),I()]);lo=0 if c-a==2 else 1 if b-a==2 or c-b==2 else 2;print(lo);print(max(b-a,c-b)-1)
''',r'''
vector<int>a(3);for(int &x:a)cin>>x;sort(a.begin(),a.end());int x=a[0],y=a[1],z=a[2];cout<<(z-x==2?0:y-x==2||z-y==2?1:2)<<'\n'<<max(y-x,z-y)-1<<'\n';
''','O(1)','最少步数由相邻空隙是否恰好为一格决定；最多步数来自较大的那段空隙。')
add(916,r'''
n,m=I(),I();g=[[] for _ in range(n)]
for _ in range(m):
    u,v=I()-1,I()-1;g[u].append(v);g[v].append(u)
c=[0]*n
for u in range(n):c[u]=next(k for k in range(1,5) if all(c[v]!=k for v in g[u]))
print(''.join(map(str,c)))
''',r'''
int n,m;cin>>n>>m;vector<vector<int>>g(n);while(m--){int u,v;cin>>u>>v;--u;--v;g[u].push_back(v);g[v].push_back(u);}vector<int>c(n);for(int u=0;u<n;u++){bool used[5]={};for(int v:g[u])used[c[v]]=true;for(int k=1;k<=4;k++)if(!used[k]){c[u]=k;break;}}for(int x:c)cout<<x;cout<<'\n';
''','O(N+M)','从编号最小的牧场开始，选择邻居尚未使用的最小草种，得到字典序最小的合法答案。')
add(917,r'''
a=[(S(),I(),I()) for _ in range(I())]
def sweep(rows,reverse=False):
    lo,hi=0,10**9
    for kind,x,y in rows:
        if kind=='none':lo=max(lo,x);hi=min(hi,y)
        elif (kind=='on')!=reverse:lo+=x;hi+=y
        else:lo=max(0,lo-y);hi-=x
    return lo,hi
print(*sweep(a[::-1],True));print(*sweep(a))
''',r'''
int n;cin>>n;vector<tuple<string,int,int>>a(n);for(auto &[s,x,y]:a)cin>>s>>x>>y;auto solve=[&](bool rev){int lo=0,hi=1000000000;for(int k=0;k<n;k++){auto [s,x,y]=a[rev?n-1-k:k];if(s=="none"){lo=max(lo,x);hi=min(hi,y);}else if((s=="on")!=rev){lo+=x;hi+=y;}else{lo=max(0,lo-y);hi-=x;}}cout<<lo<<' '<<hi<<'\n';};solve(true);solve(false);
''','O(N)','维护可能车流量区间；入口加区间、出口减区间、传感器取交集，再反向处理一次求起点。')
add(963,r'''
k,n=I(),I();pos=[]
for _ in range(k):
    row=[I() for _ in range(n)];pos.append({v:i for i,v in enumerate(row)})
print(sum(all(p[x]<p[y] for p in pos) for x in range(1,n+1) for y in range(1,n+1) if x!=y))
''',r'''
int k,n;cin>>k>>n;vector<vector<int>>p(k,vector<int>(n+1));for(int i=0;i<k;i++)for(int j=0,x;j<n;j++){cin>>x;p[i][x]=j;}int ans=0;for(int x=1;x<=n;x++)for(int y=1;y<=n;y++)if(x!=y){bool ok=true;for(int i=0;i<k;i++)ok &= p[i][x]<p[i][y];ans+=ok;}cout<<ans<<'\n';
''','O(KN²)','先记录每次训练中每头牛的位置；某对牛只有每次相对顺序一致才算稳定。')
add(964,r'''
n=I();s=S()
for k in range(1,n+1):
    if len({s[i:i+k] for i in range(n-k+1)})==n-k+1:print(k);break
''',r'''
int n;string s;cin>>n>>s;for(int k=1;k<=n;k++){set<string>q;for(int i=0;i+k<=n;i++)q.insert(s.substr(i,k));if((int)q.size()==n-k+1){cout<<k<<'\n';break;}}
''','O(N³) 字符处理量；N≤100','从短到长试观察窗口；当所有等长子串互不相同时，窗口就能唯一确定所在位置。')
add(965,r'''
n=I();pairs=[]
for _ in range(n):
    a=S();S();S();S();S();b=S();pairs.append((a,b))
names=sorted('Bessie Buttercup Belinda Beatrice Bella Blue Betsy Sue'.split())
for order in itertools.permutations(names):
    pos={v:i for i,v in enumerate(order)}
    if all(abs(pos[x]-pos[y])==1 for x,y in pairs):print(*order,sep='\n');break
''',r'''
int n;cin>>n;vector<pair<string,string>>q;while(n--){string a,b,s;cin>>a;for(int i=0;i<4;i++)cin>>s;cin>>b;q.emplace_back(a,b);}vector<string>a={"Bessie","Buttercup","Belinda","Beatrice","Bella","Blue","Betsy","Sue"};sort(a.begin(),a.end());do{map<string,int>p;for(int i=0;i<8;i++)p[a[i]]=i;bool ok=true;for(auto [x,y]:q)ok &= abs(p[x]-p[y])==1;if(ok){for(auto s:a)cout<<s<<'\n';break;}}while(next_permutation(a.begin(),a.end()));
''','O(8!·N)，固定八头牛','按字典序枚举排列，检查所有相邻约束，第一个合法排列就是所求。')
add(987,r'''
n,k=I(),I();line=[];size=0
for _ in range(n):
    w=S()
    if size+len(w)>k:print(' '.join(line));line=[];size=0
    line.append(w);size+=len(w)
if line:print(' '.join(line))
''',r'''
int n,k;cin>>n>>k;int size=0;bool first=true;while(n--){string s;cin>>s;if(size+(int)s.size()>k){cout<<'\n';size=0;first=true;}if(!first)cout<<' ';cout<<s;size+=s.size();first=false;}cout<<'\n';
''','O(总字符数)','按单词装入当前行，长度计算不包含空格；下一个单词超出 K 时换行。')
add(988,r'''
n=I();b=[I() for _ in range(n-1)]
for first in range(1,n+1):
    a=[first];seen={first}
    for v in b:
        x=v-a[-1]
        if x<1 or x>n or x in seen:break
        a.append(x);seen.add(x)
    if len(a)==n:print(*a);break
''',r'''
int n;cin>>n;vector<int>b(n-1);for(int &x:b)cin>>x;for(int first=1;first<=n;first++){vector<int>a{first};vector<bool>seen(n+1);seen[first]=true;for(int s:b){int x=s-a.back();if(x<1||x>n||seen[x])break;a.push_back(x);seen[x]=true;}if((int)a.size()==n){for(int x:a)cout<<x<<' ';cout<<'\n';break;}}
''','O(N²)','枚举最小可能首项；后一个数由相邻和减去前一个数唯一确定，立即检查范围与重复。')
add(989,r'''
k,n=I(),I()
for _ in range(n):
    x=I();lo,hi=1,2*k
    while lo<hi:
        t=(lo+hi)//2;m=min(t,(x+t)//2);r=t-m
        distance=m*(m+1)//2+r*(x+t)-(m+1+t)*r//2
        if distance>=k:hi=t
        else:lo=t+1
    print(lo)
''',r'''
ll k;int n;cin>>k>>n;while(n--){ll x;cin>>x;ll lo=1,hi=2*k;while(lo<hi){ll t=(lo+hi)/2,m=min(t,(x+t)/2),r=t-m;ll distance=m*(m+1)/2+r*(x+t)-(m+1+t)*r/2;if(distance>=k)hi=t;else lo=t+1;}cout<<lo<<'\n';}
''','O(N log K)，O(1) 额外空间','二分总用时 T。第 i 秒速度最多为 min(i, X+T−i)，用等差数列求可行最大距离。')
add(1011,r'''
n=I();a=[(I(),I()) for _ in range(n)];xs=defaultdict(list);ys=defaultdict(list)
for x,y in a:xs[x].append(y);ys[y].append(x)
xb={x:(min(v),max(v)) for x,v in xs.items()};yb={y:(min(v),max(v)) for y,v in ys.items()}
print(max(max(y-xb[x][0],xb[x][1]-y)*max(x-yb[y][0],yb[y][1]-x) for x,y in a))
''',r'''
int n;cin>>n;vector<pair<int,int>>a(n);map<int,pair<int,int>>xs,ys;for(auto &[x,y]:a){cin>>x>>y;if(!xs.count(x))xs[x]={y,y};else{xs[x].first=min(xs[x].first,y);xs[x].second=max(xs[x].second,y);}if(!ys.count(y))ys[y]={x,x};else{ys[y].first=min(ys[y].first,x);ys[y].second=max(ys[y].second,x);}}ll ans=0;for(auto [x,y]:a)ans=max(ans,1LL*max(y-xs[x].first,xs[x].second-y)*max(x-ys[y].first,ys[y].second-x));cout<<ans<<'\n';
''','Python 期望 O(N)，C++ O(N log N)','固定直角顶点，分别取同列和同行最远的点；两条直角边乘积就是两倍面积。')
add(1012,r'''
n=I();a,b=S(),S();ans=0;bad=False
for x,y in zip(a,b):
    diff=x!=y;ans+=diff and not bad;bad=diff
print(ans)
''',r'''
int n;string a,b;cin>>n>>a>>b;int ans=0;bool prev=false;for(int i=0;i<n;i++){bool bad=a[i]!=b[i];ans+=bad&&!prev;prev=bad;}cout<<ans<<'\n';
''','O(N) 时间，O(1) 额外空间','每一段连续不同的位置可用一次翻转修复，统计不同段的起点。')
add(1013,r'''
n,k=I(),I();a,b,c,d=I()-1,I(),I()-1,I();p=list(range(n));p[a:b]=p[a:b][::-1];p[c:d]=p[c:d][::-1];ans=[0]*n;seen=[False]*n
for i in range(n):
    if seen[i]:continue
    cycle=[];j=i
    while not seen[j]:seen[j]=True;cycle.append(j);j=p[j]
    for t,v in enumerate(cycle):ans[v]=cycle[(t+k)%len(cycle)]+1
print(*ans,sep='\n')
''',r'''
int n,a,b,c,d;ll k;cin>>n>>k>>a>>b>>c>>d;vector<int>p(n),ans(n);iota(p.begin(),p.end(),0);reverse(p.begin()+a-1,p.begin()+b);reverse(p.begin()+c-1,p.begin()+d);vector<bool>seen(n);for(int i=0;i<n;i++)if(!seen[i]){vector<int>v;int j=i;while(!seen[j]){seen[j]=true;v.push_back(j);j=p[j];}for(int t=0;t<(int)v.size();t++)ans[v[t]]=v[(t+k)%v.size()]+1;}for(int x:ans)cout<<x<<'\n';
''','O(N) 时间与空间','一轮两次翻转形成一个置换；拆成循环后，只需移动 K 对循环长度取模的位置。')
add(1059,r'''
a=sorted(I() for _ in range(7));print(a[0],a[1],a[-1]-a[0]-a[1])
''',r'''
vector<int>a(7);for(int &x:a)cin>>x;sort(a.begin(),a.end());cout<<a[0]<<' '<<a[1]<<' '<<a[6]-a[0]-a[1]<<'\n';
''','O(1)','最小两个数是 A 与 B，最大数是 A+B+C，因此可以直接还原 C。')
add(1060,r'''
n=I();a=[I() for _ in range(n)];ans=0
for l in range(n):
    total=0;values=set()
    for r in range(l,n):
        total+=a[r];values.add(a[r]);length=r-l+1
        ans+=total%length==0 and total//length in values
print(ans)
''',r'''
int n;cin>>n;vector<int>a(n);for(int &x:a)cin>>x;int ans=0;for(int l=0;l<n;l++){int sum=0;set<int>s;for(int r=l;r<n;r++){sum+=a[r];s.insert(a[r]);int len=r-l+1;ans+=sum%len==0&&s.count(sum/len);}}cout<<ans<<'\n';
''','Python 期望 O(N²)，C++ O(N² log N)','向右扩展照片区间，维护花瓣总数和出现过的花瓣数，检查平均值是否恰好出现在区间中。')
add(1061,r'''
n=I();a=[(S(),I(),I()) for _ in range(n)];events=[]
for i,(di,xi,yi) in enumerate(a):
    for j,(dj,xj,yj) in enumerate(a):
        if di!='E' or dj!='N':continue
        te,tn=xj-xi,yi-yj
        if te<0 or tn<0 or te==tn:continue
        if te>tn:events.append((te,tn,i,j))
        else:events.append((tn,te,j,i))
stop=[10**30]*n
for late,early,victim,blocker in sorted(events):
    if stop[victim]>late and stop[blocker]>early:stop[victim]=late
print(*(x if x<10**30 else 'Infinity' for x in stop),sep='\n')
''',r'''
int n;cin>>n;vector<char>d(n);vector<ll>x(n),y(n);for(int i=0;i<n;i++)cin>>d[i]>>x[i]>>y[i];vector<tuple<ll,ll,int,int>>e;for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(d[i]=='E'&&d[j]=='N'){ll a=x[j]-x[i],b=y[i]-y[j];if(a<0||b<0||a==b)continue;if(a>b)e.emplace_back(a,b,i,j);else e.emplace_back(b,a,j,i);}sort(e.begin(),e.end());vector<ll>stop(n,LLONG_MAX);for(auto [late,early,v,b]:e)if(stop[v]>late&&stop[b]>early)stop[v]=late;for(ll t:stop)if(t==LLONG_MAX)cout<<"Infinity\n";else cout<<t<<'\n';
''','O(N² log N) 时间，O(N²) 空间','列出可能的交叉相撞事件，按较晚到达时间处理；只有先到的牛实际经过交点，才留下能阻挡另一头牛的轨迹。')
add(1083,r'''
order=S();word=S();p={c:i for i,c in enumerate(order)};print(1+sum(p[a]>=p[b] for a,b in zip(word,word[1:])))
''',r'''
string s,t;cin>>s>>t;int p[26];for(int i=0;i<26;i++)p[s[i]-'a']=i;int ans=1;for(int i=1;i<(int)t.size();i++)ans+=p[t[i]-'a']<=p[t[i-1]-'a'];cout<<ans<<'\n';
''','O(字母表长度+单词长度)','当下一个字母在字母歌中的位置没有继续向后，就必须开始新一遍字母歌。')
add(1084,r'''
n=I();odd=sum(I()%2 for _ in range(n));even=n-odd
while odd>even:odd-=2;even+=1
if odd<0:print(even-1)
else:print(2*odd+min(1,even-odd))
''',r'''
int n,o=0;cin>>n;for(int i=0,x;i<n;i++){cin>>x;o+=x%2;}int e=n-o;while(o>e){o-=2;e++;}cout<<(o<0?e-1:2*o+min(1,e-o))<<'\n';
''','O(N)','两头奇数牛可以组成一个偶数组；先平衡奇偶组数，再按偶、奇交替排列。')
add(1085,r'''
n=I();a=sorted(I() for _ in range(n));b=sorted(I() for _ in range(n));ans=1
for i,v in enumerate(b):ans*=max(0,bisect_right(a,v)-i)
print(ans)
''',r'''
int n;cin>>n;vector<int>a(n),b(n);for(int &x:a)cin>>x;for(int &x:b)cin>>x;sort(a.begin(),a.end());sort(b.begin(),b.end());ll ans=1;for(int i=0;i<n;i++)ans*=max(0,(int)(upper_bound(a.begin(),a.end(),b[i])-a.begin())-i);cout<<ans<<'\n';
''','O(N log N)','从最小畜栏开始分配，可选择的牛数减去已经使用的牛数；各步选择数相乘。')
add(1107,r'''
zodiac='Ox Tiger Rabbit Dragon Snake Horse Goat Monkey Rooster Dog Pig Rat'.split();year={'Bessie':0}
for _ in range(I()):
    who=S();S();S();direction=S();animal=S();S();S();base=S();step=-1 if direction=='previous' else 1;value=year[base]+step
    while zodiac[value%12]!=animal:value+=step
    year[who]=value
print(abs(year['Elsie']))
''',r'''
vector<string>z={"Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig","Rat"};map<string,int>year;year["Bessie"]=0;int n;cin>>n;while(n--){string who,t,dir,animal,base;cin>>who>>t>>t>>dir>>animal>>t>>t>>base;int step=dir=="previous"?-1:1,v=year[base]+step;while(z[(v%12+12)%12]!=animal)v+=step;year[who]=v;}cout<<abs(year["Elsie"])<<'\n';
''','O(12N)','以 Bessie 的出生年为 0，按前一个或后一个指定生肖年推算相对年份，最后取年份差绝对值。')
add(1108,r'''
occupied=set();ans=0;dirs=[(1,0),(-1,0),(0,1),(0,-1)]
def comfy(p):return p in occupied and sum((p[0]+dx,p[1]+dy) in occupied for dx,dy in dirs)==3
for _ in range(I()):
    x,y=I(),I();affected=[(x,y)]+[(x+dx,y+dy) for dx,dy in dirs]
    ans-=sum(comfy(p) for p in affected);occupied.add((x,y));ans+=sum(comfy(p) for p in affected);print(ans)
''',r'''
int n;cin>>n;set<pair<int,int>>a;int dx[]={1,-1,0,0},dy[]={0,0,1,-1},ans=0;auto comfy=[&](pair<int,int>p){if(!a.count(p))return false;int c=0;for(int k=0;k<4;k++)c+=a.count({p.first+dx[k],p.second+dy[k]});return c==3;};while(n--){int x,y;cin>>x>>y;vector<pair<int,int>>v{{x,y}};for(int k=0;k<4;k++)v.push_back({x+dx[k],y+dy[k]});for(auto p:v)ans-=comfy(p);a.insert({x,y});for(auto p:v)ans+=comfy(p);cout<<ans<<'\n';}
''','Python 期望 O(N)，C++ O(N log N)','新牛只改变自身和四个邻居的舒适状态；更新前扣掉旧贡献，更新后加上新贡献。')
add(1109,r'''
for _ in range(I()):
    s=S();x=y=area=0
    for c in s:
        dx,dy={'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0)}[c];nx,ny=x+dx,y+dy;area+=x*ny-y*nx;x,y=nx,ny
    print('CW' if area<0 else 'CCW')
''',r'''
int t;cin>>t;while(t--){string s;cin>>s;ll x=0,y=0,area=0;for(char c:s){ll X=x+(c=='E')-(c=='W'),Y=y+(c=='N')-(c=='S');area+=x*Y-y*X;x=X;y=Y;}cout<<(area<0?"CW":"CCW")<<'\n';}
''','O(总路径长度)','用每段边的有向面积贡献判断多边形方向；在 x 向右、y 向上的坐标系中，负面积表示顺时针。')
add(1155,r'''
n=I();s=S();left=[0]*n;right=[0]*n;last={}
for i,c in enumerate(s):left[i]=i-last.get(c,-1)-1;last[c]=i
last={}
for i in range(n-1,-1,-1):right[i]=last.get(s[i],n)-i-1;last[s[i]]=i
print(sum(l*r+max(0,l-1)+max(0,r-1) for l,r in zip(left,right)))
''',r'''
int n;string s;cin>>n>>s;vector<int>l(n),r(n);int last[256];fill(last,last+256,-1);for(int i=0;i<n;i++){l[i]=i-last[(int)s[i]]-1;last[(int)s[i]]=i;}fill(last,last+256,n);for(int i=n-1;i>=0;i--){r[i]=last[(int)s[i]]-i-1;last[(int)s[i]]=i;}ll ans=0;for(int i=0;i<n;i++)ans+=1LL*l[i]*r[i]+max(0,l[i]-1)+max(0,r[i]-1);cout<<ans<<'\n';
''','O(N) 时间与空间','枚举照片中唯一不同的牛，数它左右连续异种牛的长度，再排除长度不足 3 的照片。')
add(1156,r'''
n=I();a=[I() for _ in range(n)];b=[I() for _ in range(n)];prev=0;ans=0
for x,y in zip(a,b):
    d=x-y;ans+=max(0,abs(d)-(abs(prev) if d*prev>0 else 0));prev=d
print(ans)
''',r'''
int n;cin>>n;vector<ll>a(n);for(ll &x:a)cin>>x;ll ans=0,prev=0;for(int i=0;i<n;i++){ll b;cin>>b;ll d=a[i]-b;ans+=max(0LL,llabs(d)-(d*prev>0?llabs(prev):0));prev=d;}cout<<ans<<'\n';
''','O(N)','同号相邻温差可以共享操作；只有绝对温差增加，或符号改变时，才需要新增操作。')
add(1157,r'''
for _ in range(I()):
    n,k=I(),I();a=[S() for _ in range(n)];dp=[[[[0]*2 for _ in range(k+1)] for c in range(n)] for r in range(n)]
    if a[0][0]=='H' or a[-1][-1]=='H':print(0);continue
    if n==1:print(1);continue
    if a[0][1]=='.':dp[0][1][0][0]=1
    if a[1][0]=='.':dp[1][0][0][1]=1
    for r in range(n):
        for c in range(n):
            if a[r][c]=='H':continue
            for turns in range(k+1):
                for d in range(2):
                    value=dp[r][c][turns][d]
                    for nd,(dr,dc) in enumerate([(0,1),(1,0)]):
                        nr,nc=r+dr,c+dc;nt=turns+(nd!=d)
                        if nr<n and nc<n and nt<=k and a[nr][nc]=='.':dp[nr][nc][nt][nd]+=value
    print(sum(sum(v) for v in dp[-1][-1]))
''',r'''
int T;cin>>T;while(T--){int n,k;cin>>n>>k;vector<string>a(n);for(auto &s:a)cin>>s;if(a[0][0]=='H'||a[n-1][n-1]=='H'){cout<<0<<'\n';continue;}if(n==1){cout<<1<<'\n';continue;}vector dp(n,vector(n,vector<array<ll,2>>(k+1)));if(a[0][1]=='.')dp[0][1][0][0]=1;if(a[1][0]=='.')dp[1][0][0][1]=1;for(int r=0;r<n;r++)for(int c=0;c<n;c++)if(a[r][c]=='.')for(int t=0;t<=k;t++)for(int d=0;d<2;d++)for(int nd=0;nd<2;nd++){int R=r+(nd==1),C=c+(nd==0),nt=t+(d!=nd);if(R<n&&C<n&&nt<=k&&a[R][C]=='.')dp[R][C][nt][nd]+=dp[r][c][t][d];}ll ans=0;for(auto v:dp[n-1][n-1])ans+=v[0]+v[1];cout<<ans<<'\n';}
''','O(TN²K) 时间，O(N²K) 空间','状态记录位置、转弯数和最后方向；向右或向下走时，仅在方向改变时增加转弯计数。')
add(1179,r'''
a=''.join(S() for _ in range(3));b=''.join(S() for _ in range(3));green=sum(x==y for x,y in zip(a,b));common=sum((Counter(a)&Counter(b)).values());print(green);print(common-green)
''',r'''
string a,b,s;for(int i=0;i<3;i++){cin>>s;a+=s;}for(int i=0;i<3;i++){cin>>s;b+=s;}int g=0,x[26]={},y[26]={},total=0;for(int i=0;i<9;i++){g+=a[i]==b[i];x[a[i]-'A']++;y[b[i]-'A']++;}for(int i=0;i<26;i++)total+=min(x[i],y[i]);cout<<g<<'\n'<<total-g<<'\n';
''','O(1)','同位置相同字符计绿色；每个字母能匹配的总数取两边频次较小值，减去绿色就是黄色。')
add(1180,r'''
def beats(a,b):return sum((x>y)-(x<y) for x in a for y in b)>0
for _ in range(I()):
    a=[I() for _ in range(4)];b=[I() for _ in range(4)];ok=False
    if beats(b,a):a,b=b,a
    if beats(a,b):
        ok=any(beats(b,c) and beats(c,a) for c in itertools.combinations_with_replacement(range(1,11),4))
    print('yes' if ok else 'no')
''',r'''
int T;cin>>T;auto beats=[](array<int,4>a,array<int,4>b){int s=0;for(int x:a)for(int y:b)s+=(x>y)-(x<y);return s>0;};while(T--){array<int,4>a,b;for(int &x:a)cin>>x;for(int &x:b)cin>>x;if(beats(b,a))swap(a,b);bool ok=false;if(beats(a,b))for(int w=1;w<=10;w++)for(int x=w;x<=10;x++)for(int y=x;y<=10;y++)for(int z=y;z<=10;z++){array<int,4>c{w,x,y,z};if(beats(b,c)&&beats(c,a))ok=true;}cout<<(ok?"yes":"no")<<'\n';}
''','O(T·C(13,4)·16)','先确定已知两个骰子的胜负方向；只枚举第三个骰子排好序的四个面，检查能否形成胜负环。')
add(1181,r'''
for _ in range(I()):
    n=I();a=[I() for _ in range(n)];constant=0;coef=0;upper=min(a);ok=True
    for h in a[:-1]:
        constant=h-constant;coef=-1-coef
        if coef==-1:upper=min(upper,constant)
        elif constant<0:ok=False
    end=a[-1]-constant;finalcoef=-1-coef
    f=end if finalcoef==-1 else upper
    if finalcoef==0 and end!=0:ok=False
    if f<0 or f>upper:ok=False
    print(sum(a)-n*f if ok else -1)
''',r'''
int T;cin>>T;while(T--){int n;cin>>n;vector<ll>a(n);for(ll &x:a)cin>>x;ll c=0,coef=0,upper=*min_element(a.begin(),a.end());bool ok=true;for(int i=0;i<n-1;i++){c=a[i]-c;coef=-1-coef;if(coef==-1)upper=min(upper,c);else if(c<0)ok=false;}ll end=a.back()-c,finalcoef=-1-coef,f=finalcoef==-1?end:upper;if(finalcoef==0&&end!=0)ok=false;if(f<0||f>upper)ok=false;cout<<(ok?accumulate(a.begin(),a.end(),0LL)-n*f:-1)<<'\n';}
''','O(N) 时间，O(N) 输入存储','设最终饥饿值为 f，相邻操作次数满足 oᵢ=hᵢ−f−oᵢ₋₁。维护关于 f 的一次式和非负约束，选择最大的可行 f。')
print('authored',len(M))
