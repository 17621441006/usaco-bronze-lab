exec(open(__file__.replace('author-batch1.py','solution-authoring.py')).read())
add(567,r'''
a,b,c,d=I(),I(),I(),I()
print(b-a+d-c-max(0,min(b,d)-max(a,c)))
''',r'''
int a,b,c,d;cin>>a>>b>>c>>d;
cout<<b-a+d-c-max(0,min(b,d)-max(a,c))<<'\n';
''', 'O(1) 时间，O(1) 额外空间','两段长度相加，再减去被重复计算的交集长度。')
add(568,r'''
n,m=I(),I();limit=[];speed=[]
for _ in range(n):
    length,value=I(),I();limit += [value]*length
for _ in range(m):
    length,value=I(),I();speed += [value]*length
print(max([0]+[v-u for u,v in zip(limit,speed)]))
''',r'''
int n,m;cin>>n>>m;vector<int>a,b;
for(int i=0,l,v;i<n;i++){cin>>l>>v;a.insert(a.end(),l,v);}
for(int i=0,l,v;i<m;i++){cin>>l>>v;b.insert(b.end(),l,v);}
int ans=0;for(int i=0;i<100;i++)ans=max(ans,b[i]-a[i]);cout<<ans<<'\n';
''','O(道路长度) 时间与空间','把限速和实际速度对齐到每一英里，取超速差的最大值。')
add(569,r'''
n,m,d,s=I(),I(),I(),I();drinks=[(I(),I(),I()) for _ in range(d)];sick=[(I(),I()) for _ in range(s)];ans=0
for milk in range(1,m+1):
    if all(any(p==person and q==milk and t<when for p,q,t in drinks) for person,when in sick):
        ans=max(ans,len({p for p,q,t in drinks if q==milk}))
print(ans)
''',r'''
int n,m,d,s;cin>>n>>m>>d>>s;vector<array<int,3>>a(d);vector<pair<int,int>>b(s);
for(auto &v:a)cin>>v[0]>>v[1]>>v[2];for(auto &v:b)cin>>v.first>>v.second;
int ans=0;for(int milk=1;milk<=m;milk++){bool ok=true;set<int>people;for(auto v:a)if(v[1]==milk)people.insert(v[0]);for(auto [p,t]:b){bool found=false;for(auto v:a)if(v[0]==p&&v[1]==milk&&v[2]<t)found=true;ok &= found;}if(ok)ans=max(ans,(int)people.size());}cout<<ans<<'\n';
''','O(MSD) 时间，O(D+S) 空间','枚举污染牛奶；它必须在发病前被每名已知病人喝过，再统计喝过它的全部人数。')
add(591,r'''
a=[(I(),I()) for _ in range(4)];p=0;ans=[]
for i in range(3,0,-1):
    p+=a[i][1]-a[i][0];ans.append(p)
print(*ans[::-1],sep='\n')
''',r'''
int a[4],b[4];for(int i=0;i<4;i++)cin>>a[i]>>b[i];int p=0;vector<int>v;for(int i=3;i>0;i--){p+=b[i]-a[i];v.push_back(p);}reverse(v.begin(),v.end());for(int x:v)cout<<x<<'\n';
''','O(1)','从最高组往下计算；当前组新增人数加上向更高组晋级的人数，就是流入本组的人数。')
add(592,r'''
n=I();a=sorted(I() for _ in range(n))
def reach(start,direction):
    pos=start;radius=1
    while True:
        nxt=pos
        while 0<=nxt+direction<n and abs(a[nxt+direction]-a[pos])<=radius:nxt+=direction
        if nxt==pos:return pos
        pos=nxt;radius+=1
print(max(reach(i,1)-reach(i,-1)+1 for i in range(n)))
''',r'''
int n;cin>>n;vector<int>a(n);for(int &v:a)cin>>v;sort(a.begin(),a.end());auto reach=[&](int p,int d){int r=1;while(true){int q=p;while(q+d>=0&&q+d<n&&abs(a[q+d]-a[p])<=r)q+=d;if(q==p)return p;p=q;r++;}};int ans=0;for(int i=0;i<n;i++)ans=max(ans,reach(i,1)-reach(i,-1)+1);cout<<ans<<'\n';
''','O(N²) 时间，O(N) 空间','依次试每个起爆点，左右独立扩展；每一轮爆炸半径增加 1。')
add(593,r'''
n=I();x=y=t=0;last={(0,0):0};ans=10**18
for _ in range(n):
    d,k=S(),I();dx,dy={'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0)}[d]
    for j in range(k):
        x+=dx;y+=dy;t+=1
        if (x,y) in last:ans=min(ans,t-last[x,y])
        last[x,y]=t
print(-1 if ans==10**18 else ans)
''',r'''
int n;cin>>n;int x=0,y=0,t=0,ans=INT_MAX;map<pair<int,int>,int>last;last[{0,0}]=0;while(n--){char d;int k;cin>>d>>k;while(k--){x+=(d=='E')-(d=='W');y+=(d=='N')-(d=='S');t++;auto p=make_pair(x,y);if(last.count(p))ans=min(ans,t-last[p]);last[p]=t;}}cout<<(ans==INT_MAX?-1:ans)<<'\n';
''','Python 期望 O(总步数)，C++ O(总步数 log 总步数)','逐步移动，记录每个格子最近一次经过的时间；同格两次访问的最小间隔决定答案。')
add(615,r'''
x,y,m=I(),I(),I();print(max(i*x+(m-i*x)//y*y for i in range(m//x+1)))
''',r'''
int x,y,m;cin>>x>>y>>m;int ans=0;for(int i=0;i*x<=m;i++)ans=max(ans,i*x+(m-i*x)/y*y);cout<<ans<<'\n';
''','O(M/X) 时间，O(1) 空间','枚举小桶数量，剩余容量尽可能装大桶。')
add(616,r'''
n=I();a=[I() for _ in range(n)];print(min(sum(k*a[(s+k)%n] for k in range(n)) for s in range(n)))
''',r'''
int n;cin>>n;vector<int>a(n);for(int &v:a)cin>>v;ll ans=LLONG_MAX;for(int s=0;s<n;s++){ll sum=0;for(int k=0;k<n;k++)sum+=1LL*k*a[(s+k)%n];ans=min(ans,sum);}cout<<ans<<'\n';
''','O(N²) 时间，O(N) 空间','枚举入口，将每个房间所需牛数乘以从入口顺时针走到它的距离。')
add(617,r'''
n,b=I(),I();a=[(I(),I()) for _ in range(n)];ans=n
for x in {x+1 for x,y in a}:
    for y in {y+1 for x,y in a}:
        cnt=[0]*4
        for u,v in a:cnt[(u>x)*2+(v>y)]+=1
        ans=min(ans,max(cnt))
print(ans)
''',r'''
int n,b;cin>>n>>b;vector<pair<int,int>>a(n);for(auto &p:a)cin>>p.first>>p.second;int ans=n;for(auto px:a)for(auto py:a){int c[4]={};for(auto p:a)c[2*(p.first>px.first+1)+(p.second>py.second+1)]++;ans=min(ans,*max_element(c,c+4));}cout<<ans<<'\n';
''','O(N³) 时间，O(N) 空间；适用于本铜组约束','分隔线只需放在某头牛坐标的右侧和上侧；枚举两条线，统计四个象限。')
add(663,r'''
a=[I() for _ in range(8)];side=max(max(a[2],a[6])-min(a[0],a[4]),max(a[3],a[7])-min(a[1],a[5]));print(side*side)
''',r'''
int a,b,c,d,e,f,g,h;cin>>a>>b>>c>>d>>e>>f>>g>>h;int s=max(max(c,g)-min(a,e),max(d,h)-min(b,f));cout<<s*s<<'\n';
''','O(1)','取两个矩形的整体宽度与高度，较大值就是最小正方形的边长。')
add(664,r'''
ans=Counter()
for _ in range(I()):
    a,b=Counter(S()),Counter(S())
    for c in set(a)|set(b):ans[c]+=max(a[c],b[c])
print(*(ans[chr(97+i)] for i in range(26)),sep='\n')
''',r'''
int n;cin>>n;int ans[26]={};while(n--){string a,b;cin>>a>>b;int x[26]={},y[26]={};for(char c:a)x[c-'a']++;for(char c:b)y[c-'a']++;for(int i=0;i<26;i++)ans[i]+=max(x[i],y[i]);}for(int x:ans)cout<<x<<'\n';
''','O(全部字符串长度+26N)','同一块木板的两面不能同时使用，所以每个字母取两面需求的较大值，再把各块木板累加。')
add(665,r'''
n,m,k=I(),I(),I()
for _ in range(n):
    row=''.join(c*k for c in S())
    for j in range(k):print(row)
''',r'''
int n,m,k;cin>>n>>m>>k;while(n--){string s,t;cin>>s;for(char c:s)t+=string(k,c);for(int j=0;j<k;j++)cout<<t<<'\n';}
''','O(NMK²)，与输出大小相同','每个字符横向复制 K 次，再将扩展后的整行纵向复制 K 次。')
add(687,r'''
a=dict.fromkeys('Bessie Elsie Daisy Gertie Annabelle Maggie Henrietta'.split(),0)
for _ in range(I()):
    name,v=S(),I();a[name]+=v
values=sorted(set(a.values()));names=[k for k,v in a.items() if len(values)>1 and v==values[1]];print(names[0] if len(names)==1 else 'Tie')
''',r'''
map<string,int>a;for(string s:{"Bessie","Elsie","Daisy","Gertie","Annabelle","Maggie","Henrietta"})a[s]=0;int n;cin>>n;while(n--){string s;int v;cin>>s>>v;a[s]+=v;}set<int>v;for(auto [s,x]:a)v.insert(x);vector<string>names;if(v.size()>1){int target=*next(v.begin());for(auto [s,x]:a)if(x==target)names.push_back(s);}cout<<(names.size()==1?names[0]:"Tie")<<'\n';
''','O(N)','未出现在记录中的牛产奶量也为 0；寻找第二小的不同产量，并检查是否唯一。')
add(688,r'''
a=[(I(),I()) for _ in range(I())];wins=sum((x-y)%3==1 for x,y in a);other=sum((y-x)%3==1 for x,y in a);print(max(wins,other))
''',r'''
int n,a=0,b=0;cin>>n;while(n--){int x,y;cin>>x>>y;a+=(x-y+3)%3==1;b+=(y-x+3)%3==1;}cout<<max(a,b)<<'\n';
''','O(N) 时间，O(1) 额外空间','三种手势的编号映射只会产生两种不同的克制方向，分别统计胜场。')
add(689,r'''
n=I();a=[[int(c) for c in S()] for _ in range(n)];ans=0
for r in range(n-1,-1,-1):
    for c in range(n-1,-1,-1):
        if a[r][c]:
            ans+=1
            for i in range(r+1):
                for j in range(c+1):a[i][j]^=1
print(ans)
''',r'''
int n;cin>>n;vector<string>a(n);for(auto &s:a)cin>>s;int ans=0;for(int r=n-1;r>=0;r--)for(int c=n-1;c>=0;c--)if(a[r][c]=='1'){ans++;for(int i=0;i<=r;i++)for(int j=0;j<=c;j++)a[i][j]=(a[i][j]=='1'?'0':'1');}cout<<ans<<'\n';
''','O(N⁴) 时间，O(N²) 空间；N≤10','从右下向左上处理；如果当前格为 1，翻转以它为右下角的矩形是唯一可行决定。')
add(711,r'''
last={};ans=0
for _ in range(I()):
    cow,side=I(),I();ans+=cow in last and last[cow]!=side;last[cow]=side
print(ans)
''',r'''
int n,ans=0;cin>>n;map<int,int>last;while(n--){int c,s;cin>>c>>s;if(last.count(c)&&last[c]!=s)ans++;last[c]=s;}cout<<ans<<'\n';
''','O(N)','为每头牛记住上一次所在的道路一侧；只有同一头牛从一侧变到另一侧才计一次。')
add(712,r'''
s=S();pos=defaultdict(list)
for i,c in enumerate(s):pos[c].append(i)
ans=0
for a,b in itertools.combinations(pos.values(),2):
    ans+=(a[0]<b[0]<a[1]<b[1]) or (b[0]<a[0]<b[1]<a[1])
print(ans)
''',r'''
string s;cin>>s;vector<int>p[26];for(int i=0;i<(int)s.size();i++)p[s[i]-'A'].push_back(i);int ans=0;for(int a=0;a<26;a++)for(int b=a+1;b<26;b++)ans+=(p[a][0]<p[b][0]&&p[b][0]<p[a][1]&&p[a][1]<p[b][1])||(p[b][0]<p[a][0]&&p[a][0]<p[b][1]&&p[b][1]<p[a][1]);cout<<ans<<'\n';
''','O(26²)','两头牛的四个端点必须交替出现（ABAB 或 BABA），它们的路线才相交。')
add(713,r'''
a=sorted((I(),I()) for _ in range(I()));t=0
for arrival,duration in a:t=max(t,arrival)+duration
print(t)
''',r'''
int n;cin>>n;vector<pair<int,int>>a(n);for(auto &p:a)cin>>p.first>>p.second;sort(a.begin(),a.end());ll t=0;for(auto [x,y]:a)t=max(t,(ll)x)+y;cout<<t<<'\n';
''','O(N log N)','按到达时间排队；服务开始时间取“上一头牛结束”和“本牛到达”的较大值。')
add(759,r'''
a=[tuple(I() for _ in range(4)) for _ in range(3)]
def area(r):return (r[2]-r[0])*(r[3]-r[1])
def overlap(r,s):return max(0,min(r[2],s[2])-max(r[0],s[0]))*max(0,min(r[3],s[3])-max(r[1],s[1]))
print(sum(area(r)-overlap(r,a[2]) for r in a[:2]))
''',r'''
array<int,4>a[3];for(auto &r:a)for(int &x:r)cin>>x;int ans=0;for(int i=0;i<2;i++)ans+=(a[i][2]-a[i][0])*(a[i][3]-a[i][1])-max(0,min(a[i][2],a[2][2])-max(a[i][0],a[2][0]))*max(0,min(a[i][3],a[2][3])-max(a[i][1],a[2][1]));cout<<ans<<'\n';
''','O(1)','每块广告牌的可见面积等于自身面积减去与卡车矩形的交集面积。')
add(760,r'''
n=I();p=[I()-1 for _ in range(n)];a=[S() for _ in range(n)]
for _ in range(3):a=[a[p[i]] for i in range(n)]
print(*a,sep='\n')
''',r'''
int n;cin>>n;vector<int>p(n);for(int &x:p){cin>>x;x--;}vector<string>a(n),b(n);for(auto &x:a)cin>>x;for(int t=0;t<3;t++){for(int i=0;i<n;i++)b[i]=a[p[i]];a=b;}for(auto x:a)cout<<x<<'\n';
''','O(N) 时间与空间','已知移动后的位置，按原映射反向取回每头牛，连续逆推三次。')
add(761,r'''
a=sorted((I(),S(),I()) for _ in range(I()));milk=dict.fromkeys(['Bessie','Elsie','Mildred'],7);old=set(milk);ans=0
for day,name,change in a:
    milk[name]+=change;top=max(milk.values());new={k for k,v in milk.items() if v==top};ans+=new!=old;old=new
print(ans)
''',r'''
int n;cin>>n;vector<tuple<int,string,int>>a(n);for(auto &[d,s,v]:a)cin>>d>>s>>v;sort(a.begin(),a.end());map<string,int>m{{"Bessie",7},{"Elsie",7},{"Mildred",7}};set<string>old{"Bessie","Elsie","Mildred"};int ans=0;for(auto [d,s,v]:a){m[s]+=v;int mx=0;for(auto p:m)mx=max(mx,p.second);set<string>now;for(auto p:m)if(p.second==mx)now.insert(p.first);ans+=now!=old;old=now;}cout<<ans<<'\n';
''','O(N log N)','按日期排序；每次更新产量后比较榜首牛的集合，而不是只比较最大产量数值。')
add(783,r'''
x1,y1,x2,y2=I(),I(),I(),I();a,b,c,d=I(),I(),I(),I()
if b<=y1 and d>=y2:
    if a<=x1:x1=min(x2,max(x1,c))
    elif c>=x2:x2=max(x1,min(x2,a))
if a<=x1 and c>=x2:
    if b<=y1:y1=min(y2,max(y1,d))
    elif d>=y2:y2=max(y1,min(y2,b))
print((x2-x1)*(y2-y1))
''',r'''
int x,y,X,Y,a,b,c,d;cin>>x>>y>>X>>Y>>a>>b>>c>>d;if(b<=y&&d>=Y){if(a<=x)x=min(X,max(x,c));else if(c>=X)X=max(x,min(X,a));}if(a<=x&&c>=X){if(b<=y)y=min(Y,max(y,d));else if(d>=Y)Y=max(y,min(Y,b));}cout<<(X-x)*(Y-y)<<'\n';
''','O(1)','求所有可见部分的最小外接矩形。只有遮挡覆盖整条宽或高且贴着边缘时，遮布才能缩小。')
add(784,r'''
n=I();a=[(I(),I()) for _ in range(n)];events=[]
for i,(l,r) in enumerate(a):events.extend([(l,1,i),(r,-1,i)])
events.sort();active=set();alone=[0]*n;total=0;prev=events[0][0]
for t,kind,i in events:
    if active:total+=t-prev
    if len(active)==1:alone[next(iter(active))]+=t-prev
    if kind==1:active.add(i)
    else:active.remove(i)
    prev=t
print(total-min(alone))
''',r'''
int n;cin>>n;vector<tuple<int,int,int>>ev;for(int i=0,l,r;i<n;i++){cin>>l>>r;ev.emplace_back(l,1,i);ev.emplace_back(r,-1,i);}sort(ev.begin(),ev.end());set<int>active;vector<int>alone(n);int prev=get<0>(ev[0]),total=0;for(auto [t,k,i]:ev){if(!active.empty())total+=t-prev;if(active.size()==1)alone[*active.begin()]+=t-prev;if(k==1)active.insert(i);else active.erase(i);prev=t;}cout<<total-*min_element(alone.begin(),alone.end())<<'\n';
''','O(N log N) 时间，O(N) 空间','扫描时间事件，计算总覆盖时间和每个人独自覆盖的时间；解雇独占时间最少的人。')
add(785,r'''
a=[I() for _ in range(I())];print(max(0,sum(x!=y for x,y in zip(a,sorted(a)))-1))
''',r'''
int n;cin>>n;vector<int>a(n);for(int &x:a)cin>>x;auto b=a;sort(b.begin(),b.end());int diff=0;for(int i=0;i<n;i++)diff+=a[i]!=b[i];cout<<max(0,diff-1)<<'\n';
''','O(N log N)','只有一头牛站错位置；比较排序前后的不同位置，跨过每种被错开的身高只需交换一次。')
add(807,r'''
a,b,x,y=I(),I(),I(),I();print(min(abs(a-b),abs(a-x)+abs(b-y),abs(a-y)+abs(b-x)))
''',r'''
int a,b,x,y;cin>>a>>b>>x>>y;cout<<min({abs(a-b),abs(a-x)+abs(b-y),abs(a-y)+abs(b-x)})<<'\n';
''','O(1)','比较直接走、从第一个传送口进入、从第二个传送口进入三条路线。')
add(808,r'''
n=I();a=sorted(I() for _ in range(n))
if n==1:print(1)
else:
    nxt=[0]*n;deg=[0]*n
    for i in range(n):
        j=1 if i==0 else n-2 if i==n-1 else i-1 if a[i]-a[i-1]<=a[i+1]-a[i] else i+1
        nxt[i]=j;deg[j]+=1
    ans=sum(v==0 for v in deg)
    ans+=sum(nxt[nxt[i]]==i and i<nxt[i] and deg[i]==deg[nxt[i]]==1 for i in range(n))
    print(ans)
''',r'''
int n;cin>>n;vector<int>a(n);for(int &x:a)cin>>x;sort(a.begin(),a.end());if(n==1){cout<<1;return 0;}vector<int>to(n),deg(n);for(int i=0;i<n;i++){to[i]=i==0?1:i==n-1?n-2:a[i]-a[i-1]<=a[i+1]-a[i]?i-1:i+1;deg[to[i]]++;}int ans=count(deg.begin(),deg.end(),0);for(int i=0;i<n;i++)if(to[to[i]]==i&&i<to[i]&&deg[i]==1&&deg[to[i]]==1)ans++;cout<<ans<<'\n';
''','O(N log N)','画出每头牛传给最近邻的箭头。入度为零的牛需要初始球；没有外来箭头的互传二元环再加一个球。')
add(809,r'''
n=I();a=[I() for _ in range(n)];need=[-1]*n;need[0]=1;ok=True
for i,v in enumerate(a):
    if v==-1:continue
    if v>i:ok=False;continue
    for j in range(v+1):
        pos=i-j;value=int(j==v)
        if need[pos]!=-1 and need[pos]!=value:ok=False
        need[pos]=value
print(-1 if not ok else f'{need.count(1)} {need.count(1)+need.count(-1)}')
''',r'''
int n;cin>>n;vector<int>a(n),need(n,-1);for(int &x:a)cin>>x;need[0]=1;bool ok=true;for(int i=0;i<n;i++)if(a[i]!=-1){if(a[i]>i){ok=false;continue;}for(int j=0;j<=a[i];j++){int v=j==a[i],p=i-j;if(need[p]!=-1&&need[p]!=v)ok=false;need[p]=v;}}if(!ok)cout<<-1;else{int lo=count(need.begin(),need.end(),1);cout<<lo<<' '<<lo+count(need.begin(),need.end(),-1);}cout<<'\n';
''','O(N²)','一条“距离上次逃跑 v 天”的记录，强制确定前 v 天没有逃跑以及第 i−v 天逃跑；检查冲突后数确定和未定位置。')
add(855,r'''
a=[(I(),I()) for _ in range(3)];cap=[x for x,y in a];milk=[y for x,y in a]
for t in range(100):
    i=t%3;j=(i+1)%3;v=min(milk[i],cap[j]-milk[j]);milk[i]-=v;milk[j]+=v
print(*milk,sep='\n')
''',r'''
int c[3],a[3];for(int i=0;i<3;i++)cin>>c[i]>>a[i];for(int t=0;t<100;t++){int i=t%3,j=(i+1)%3,v=min(a[i],c[j]-a[j]);a[i]-=v;a[j]+=v;}for(int x:a)cout<<x<<'\n';
''','O(100)','按 1→2→3→1 的顺序倒奶；实际倒入量由来源剩余和目标空余容量共同决定。')
add(856,r'''
events=[]
for _ in range(I()):
    s,t,b=I(),I(),I();events.extend([(s,b),(t,-b)])
now=ans=0
for t,d in sorted(events):now+=d;ans=max(ans,now)
print(ans)
''',r'''
int n;cin>>n;vector<pair<int,int>>e;while(n--){int s,t,b;cin>>s>>t>>b;e.emplace_back(s,b);e.emplace_back(t,-b);}sort(e.begin(),e.end());int cur=0,ans=0;for(auto [t,d]:e){cur+=d;ans=max(ans,cur);}cout<<ans<<'\n';
''','O(N log N)','把开始时间视作桶需求增加、结束时间视作归还；最大同时占用数就是所需桶数。')
add(857,r'''
a=[I() for _ in range(10)];b=[I() for _ in range(10)];ans=set()
def dfs(day,left,right,milk):
    if day==4:ans.add(milk);return
    src,dst=(left,right) if day%2==0 else (right,left)
    for v in set(src):
        s=src.copy();s.remove(v);d=dst+[v]
        if day%2==0:dfs(day+1,s,d,milk-v)
        else:dfs(day+1,d,s,milk+v)
dfs(0,a,b,1000);print(len(ans))
''',r'''
vector<int>a(10),b(10);for(int &x:a)cin>>x;for(int &x:b)cin>>x;set<int>ans;function<void(int,vector<int>,vector<int>,int)>dfs=[&](int day,vector<int>l,vector<int>r,int milk){if(day==4){ans.insert(milk);return;}auto s=day%2?r:l,d=day%2?l:r;set<int>seen;for(int i=0;i<(int)s.size();i++)if(seen.insert(s[i]).second){auto u=s,v=d;int x=u[i];u.erase(u.begin()+i);v.push_back(x);if(day%2)dfs(day+1,v,u,milk+x);else dfs(day+1,u,v,milk-x);}};dfs(0,a,b,1000);cout<<ans.size()<<'\n';
''','O(B⁴·B)，B≈10；仅四天搜索','枚举四次搬桶，移动的桶要从原集合删除并加入另一边；用集合去重最终奶量。')
print('authored',len(M))
