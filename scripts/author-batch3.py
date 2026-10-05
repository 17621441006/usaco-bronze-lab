exec(open(__file__.replace('author-batch3.py','solution-authoring.py')).read())
add(1203,r'''
for _ in range(I()):
    n=I();a=[I() for _ in range(n)];total=sum(a)
    if total==0:print(0);continue
    for groups in range(n,0,-1):
        if total%groups:continue
        target=total//groups;cur=0;ok=True
        for v in a:
            cur+=v
            if cur>target:ok=False;break
            if cur==target:cur=0
        if ok and cur==0:print(n-groups);break
''',r'''
int T;cin>>T;while(T--){int n;cin>>n;vector<int>a(n);int sum=0;for(int &x:a){cin>>x;sum+=x;}if(sum==0){cout<<0<<'\n';continue;}for(int g=n;g>=1;g--)if(sum%g==0){int target=sum/g,cur=0;bool ok=true;for(int x:a){cur+=x;if(cur>target){ok=false;break;}if(cur==target)cur=0;}if(ok&&cur==0){cout<<n-g<<'\n';break;}}}
''','O(N·约数个数+N)','合并不会改变总和。枚举最终组数，检查能否从左到右划成等和连续段。')
add(1204,r'''
n=I();a=[I() for _ in range(n)];pos={I():i for i in range(n)};mx=-1;ans=0
for v in a:
    x=pos[v];ans+=x<mx;mx=max(mx,x)
print(ans)
''',r'''
int n;cin>>n;vector<int>a(n),pos(n+1);for(int &x:a)cin>>x;for(int i=0,v;i<n;i++){cin>>v;pos[v]=i;}int mx=-1,ans=0;for(int v:a){ans+=pos[v]<mx;mx=max(mx,pos[v]);}cout<<ans<<'\n';
''','O(N)','按目标队列重新编号；若某头牛前面出现了本应在它后面的牛，这头牛必须被向前移动。')
add(1205,r'''
n=I();blocks=[set(S()) for _ in range(4)]
for _ in range(n):
    w=S();ok=any(all(c in blocks[j] for c,j in zip(w,order)) for order in itertools.permutations(range(4),len(w)));print('YES' if ok else 'NO')
''',r'''
int n;cin>>n;string b[4];for(auto &s:b)cin>>s;while(n--){string w;cin>>w;vector<int>p{0,1,2,3};bool ok=false;do{bool good=true;for(int i=0;i<(int)w.size();i++)good &= b[p[i]].find(w[i])!=string::npos;ok |= good;}while(next_permutation(p.begin(),p.end()));cout<<(ok?"YES":"NO")<<'\n';}
''','O(N·4!·4)','同一块积木只能使用一次。枚举字母分别选用哪块积木，检查是否存在一种合法分配。')
add(1251,r'''
n=I();a=sorted(I() for _ in range(n));best=price=0
for i,v in enumerate(a):
    value=v*(n-i)
    if value>best:best=value;price=v
print(best,price)
''',r'''
int n;cin>>n;vector<ll>a(n);for(ll &x:a)cin>>x;sort(a.begin(),a.end());ll best=0,price=0;for(int i=0;i<n;i++){ll value=a[i]*(n-i);if(value>best){best=value;price=a[i];}}cout<<best<<' '<<price<<'\n';
''','O(N log N)','按最高可接受学费排序；把每一种意愿价格作为学费，计算收入，收入相同保留更低学费。')
add(1252,r'''
for _ in range(I()):
    n,k=I(),I();s=S();patch=['.']*n;reach={'G':-1,'H':-1};count=0
    for i,c in enumerate(s):
        if i<=reach[c]:continue
        pos=min(n-1,i+k)
        if patch[pos]!='.':pos-=1
        patch[pos]=c;reach[c]=pos+k;count+=1
    print(count);print(''.join(patch))
''',r'''
int T;cin>>T;while(T--){int n,k;string s;cin>>n>>k>>s;string p(n,'.');int reach[256];fill(reach,reach+256,-1);int count=0;for(int i=0;i<n;i++){int c=s[i];if(i<=reach[c])continue;int pos=min(n-1,i+k);if(p[pos]!='.')pos--;p[pos]=c;reach[c]=pos+k;count++;}cout<<count<<'\n'<<p<<'\n';}
''','O(N)','从左向右找到尚未被喂到的牛，将对应草种尽量放到右侧 K 格处，延伸覆盖；末端冲突时向左错开一格。')
add(1253,r'''
for _ in range(I()):
    n,m=I(),I();a=[(S(),S()) for _ in range(m)]
    while a:
        removed=False
        for bit in range(n):
            for value in '01':
                outputs={y for x,y in a if x[bit]==value}
                if len(outputs)==1:
                    a=[(x,y) for x,y in a if x[bit]!=value];removed=True;break
            if removed:break
        if not removed:break
    print('OK' if not a else 'LIE')
''',r'''
int T;cin>>T;while(T--){int n,m;cin>>n>>m;vector<pair<string,int>>a(m);for(auto &p:a)cin>>p.first>>p.second;while(!a.empty()){bool removed=false;for(int bit=0;bit<n&&!removed;bit++)for(char v:{'0','1'}){set<int>out;for(auto p:a)if(p.first[bit]==v)out.insert(p.second);if(out.size()==1){vector<pair<string,int>>b;for(auto p:a)if(p.first[bit]!=v)b.push_back(p);a=b;removed=true;break;}}if(!removed)break;}cout<<(a.empty()?"OK":"LIE")<<'\n';}
''','O(NM²)','合法程序的第一个判断必须把某一位取某个值的所有样本映射到同一结果；反复找这样的分支并删除对应样本。')
add(1275,r'''
n=I();s=S();end=[I()-1 for _ in range(n)];first={c:s.index(c) for c in 'GH'};last={c:s.rindex(c) for c in 'GH'};pairs=set()
for breed,other in [('G','H'),('H','G')]:
    leader=first[breed]
    if end[leader]<last[breed]:continue
    for j,c in enumerate(s):
        if c==other and ((j==first[other] and end[j]>=last[other]) or j<=leader<=end[j]):pairs.add(tuple(sorted((leader,j))))
print(len(pairs))
''',r'''
int n;string s;cin>>n>>s;vector<int>e(n);for(int &x:e){cin>>x;x--;}int first[256],last[256];fill(first,first+256,n);fill(last,last+256,-1);for(int i=0;i<n;i++){first[(int)s[i]]=min(first[(int)s[i]],i);last[(int)s[i]]=i;}set<pair<int,int>>pairs;for(char c:{'G','H'}){char o=c=='G'?'H':'G';int l=first[(int)c];if(e[l]<last[(int)c])continue;for(int j=0;j<n;j++)if(s[j]==o&&((j==first[(int)o]&&e[j]>=last[(int)o])||(j<=l&&l<=e[j])))pairs.insert(minmax(l,j));}cout<<pairs.size()<<'\n';
''','O(N) 枚举，使用集合去重后 C++ O(N log N)','至少一名领袖必须是本品种最靠左且能覆盖所有同品种牛的牛；固定它，再枚举另一品种领袖。')
add(1276,r'''
n,m=I(),I();need=[0]*101
for _ in range(n):
    l,r,c=I(),I(),I()
    for j in range(l,r+1):need[j]=c
ac=[(I(),I(),I(),I()) for _ in range(m)];best=10**18;cool=[0]*101
for mask in range(1<<m):
    cost=0;cool=[0]*101
    for i,(l,r,p,c) in enumerate(ac):
        if mask>>i&1:
            cost+=c
            for j in range(l,r+1):cool[j]+=p
    if cost<best and all(cool[j]>=need[j] for j in range(101)):best=cost
print(best)
''',r'''
int n,m;cin>>n>>m;int need[101]={};for(int i=0,l,r,c;i<n;i++){cin>>l>>r>>c;for(int j=l;j<=r;j++)need[j]=c;}vector<array<int,4>>a(m);for(auto &v:a)for(int &x:v)cin>>x;int best=INT_MAX;for(int mask=0;mask<(1<<m);mask++){int cool[101]={},cost=0;for(int i=0;i<m;i++)if(mask>>i&1){auto [l,r,p,c]=a[i];cost+=c;for(int j=l;j<=r;j++)cool[j]+=p;}bool ok=true;for(int j=0;j<=100;j++)ok &= cool[j]>=need[j];if(ok)best=min(best,cost);}cout<<best<<'\n';
''','O(2ᴹ·100M)，M≤10','用位掩码枚举开关组合，累加每个牛栏的降温量，筛选满足全部需求的最低费用。')
add(1277,r'''
for _ in range(I()):
    s=S();values=[len(s)-3+(s[i]!='M')+(s[i+2]!='O') for i in range(len(s)-2) if s[i+1]=='O'];print(min(values,default=-1))
''',r'''
int T;cin>>T;while(T--){string s;cin>>s;int ans=INT_MAX;for(int i=0;i+2<(int)s.size();i++)if(s[i+1]=='O')ans=min(ans,(int)s.size()-3+(s[i]!='M')+(s[i+2]!='O'));cout<<(ans==INT_MAX?-1:ans)<<'\n';}
''','O(字符串长度)','最终保留一个长度为 3、中心为 O 的窗口；删除外部字符，再修正窗口两端。')
add(1299,r'''
n,t=I(),I();free=1;ans=0
for _ in range(n):
    day,bales=I(),I();start=max(day,free);end=min(t+1,start+bales);ans+=max(0,end-start);free=start+bales
print(ans)
''',r'''
int n;ll t;cin>>n>>t;ll free=1,ans=0;while(n--){ll day,b;cin>>day>>b;ll start=max(day,free),end=min(t+1,start+b);ans+=max(0LL,end-start);free=start+b;}cout<<ans<<'\n';
''','O(N)','把每批草料安排在到达后第一个空闲日开始连续食用，截断到第 T 天，无需逐日模拟。')
add(1300,r'''
for _ in range(I()):
    n=I();a=[S() for _ in range(n)];k=I();stamp=[S() for _ in range(k)];covered=[[False]*n for _ in range(n)]
    for rot in range(4):
        cells=[(r,c) for r in range(k) for c in range(k) if stamp[r][c]=='*']
        for r in range(n-k+1):
            for c in range(n-k+1):
                if all(a[r+x][c+y]=='*' for x,y in cells):
                    for x,y in cells:covered[r+x][c+y]=True
        stamp=[''.join(stamp[k-1-j][i] for j in range(k)) for i in range(k)]
    print('YES' if all((a[r][c]=='*')==covered[r][c] for r in range(n) for c in range(n)) else 'NO')
''',r'''
int T;cin>>T;while(T--){int n,k;cin>>n;vector<string>a(n);for(auto &s:a)cin>>s;cin>>k;vector<string>b(k);for(auto &s:b)cin>>s;vector<vector<bool>>cover(n,vector<bool>(n));for(int rot=0;rot<4;rot++){vector<pair<int,int>>cells;for(int x=0;x<k;x++)for(int y=0;y<k;y++)if(b[x][y]=='*')cells.emplace_back(x,y);for(int r=0;r+k<=n;r++)for(int c=0;c+k<=n;c++){bool ok=true;for(auto [x,y]:cells)ok &= a[r+x][c+y]=='*';if(ok)for(auto [x,y]:cells)cover[r+x][c+y]=true;}auto next=b;for(int x=0;x<k;x++)for(int y=0;y<k;y++)next[x][y]=b[k-1-y][x];b=next;}bool ok=true;for(int r=0;r<n;r++)for(int c=0;c<n;c++)ok &= (a[r][c]=='*')==cover[r][c];cout<<(ok?"YES":"NO")<<'\n';}
''','O(4N²K²)','枚举印章四种旋转和所有位置；凡是不会涂到目标白格的位置都盖一次，最后检查是否覆盖全部目标黑格。')
add(1301,r'''
n,k=I(),I();a=[I() for _ in range(n)];print(k+1+sum(min(k+1,y-x) for x,y in zip(a,a[1:])))
''',r'''
int n;ll k;cin>>n>>k;vector<ll>a(n);for(ll &x:a)cin>>x;ll ans=k+1;for(int i=1;i<n;i++)ans+=min(k+1,a[i]-a[i-1]);cout<<ans<<'\n';
''','O(N)','相邻观看日之间，比较一直保留订阅和重新支付启动费，选择更便宜的连接方式。')
add(1347,r'''
n,m=I(),I();a=[I() for _ in range(n)]
for _ in range(m):
    height=I();bottom=0
    for i in range(n):
        eaten=max(0,min(height,a[i])-bottom);a[i]+=eaten;bottom+=eaten
        if bottom==height:break
print(*a,sep='\n')
''',r'''
int n,m;cin>>n>>m;vector<ll>a(n);for(ll &x:a)cin>>x;while(m--){ll top;cin>>top;ll bottom=0;for(int i=0;i<n&&bottom<top;i++){ll eat=max(0LL,min(top,a[i])-bottom);a[i]+=eat;bottom+=eat;}}for(ll x:a)cout<<x<<'\n';
''','直接模拟；第一头牛未吃完时会翻倍，使昂贵轮数为 O(log 最大糖高)','维护糖杖尚未被吃掉的底部高度，每头牛只能吃到自己当前高度可及的那一段。')
add(1348,r'''
n=I();s=S();runs=[];i=0;days=n
while i<n:
    if s[i]=='0':i+=1;continue
    j=i
    while j<n and s[j]=='1':j+=1
    length=j-i;runs.append(length);days=min(days,length-1 if i==0 or j==n else (length-1)//2);i=j
width=2*days+1;print(sum((length+width-1)//width for length in runs))
''',r'''
int n;string s;cin>>n>>s;vector<int>runs;int days=n;for(int i=0;i<n;){if(s[i]=='0'){i++;continue;}int j=i;while(j<n&&s[j]=='1')j++;int len=j-i;runs.push_back(len);days=min(days,i==0||j==n?len-1:(len-1)/2);i=j;}int w=2*days+1,ans=0;for(int len:runs)ans+=(len+w-1)/w;cout<<ans<<'\n';
''','O(N)','每个连续感染段约束传播天数，边界段允许单侧传播；取最大的统一可行天数，再求覆盖每段需要多少初始感染源。')
add(1349,r'''
for _ in range(I()):
    n=I();h=[I() for _ in range(n)];a=[I() for _ in range(n)];rank=[I() for _ in range(n)];order=[0]*n
    for i,r in enumerate(rank):order[r]=i
    lo=0;hi=10**30
    for u,v in zip(order,order[1:]):
        growth=a[u]-a[v];need=h[v]-h[u]+1
        if growth>0:lo=max(lo,-((-need)//growth))
        elif growth==0:
            if need>0:hi=-1
        else:hi=min(hi,(-need)//(-growth))
    print(lo if lo<=hi else -1)
''',r'''
int T;cin>>T;while(T--){int n;cin>>n;vector<ll>h(n),a(n);vector<int>p(n);for(ll &x:h)cin>>x;for(ll &x:a)cin>>x;for(int i=0,r;i<n;i++){cin>>r;p[r]=i;}ll lo=0,hi=LLONG_MAX;for(int i=1;i<n;i++){int u=p[i-1],v=p[i];ll g=a[u]-a[v],need=h[v]-h[u]+1;if(g>0){if(need>0)lo=max(lo,(need+g-1)/g);}else if(g==0){if(need>0)hi=-1;}else{ll num=-need,den=-g;if(num<0)hi=-1;else hi=min(hi,num/den);}}cout<<(lo<=hi?lo:-1)<<'\n';}
''','O(N)','按目标排名直接建立顺序；相邻植物的严格高低关系转化成天数上下界，求所有不等式的交集。')
add(1371,r'''
for _ in range(I()):
    n=I();a=[I() for _ in range(n)];ans=set()
    for i,x in enumerate(a):
        if i+1<n and a[i+1]==x or i+2<n and a[i+2]==x:ans.add(x)
    print(*sorted(ans)) if ans else print(-1)
''',r'''
int T;cin>>T;while(T--){int n;cin>>n;vector<int>a(n);for(int &x:a)cin>>x;set<int>s;for(int i=0;i<n;i++)if((i+1<n&&a[i]==a[i+1])||(i+2<n&&a[i]==a[i+2]))s.insert(a[i]);if(s.empty())cout<<-1;else for(int x:s)cout<<x<<' ';cout<<'\n';}
''','O(N) 扫描，答案排序 O(N log N)','同一偏好只要在距离 1 或 2 的两个位置出现，就能形成严格多数并逐步向外扩张。')
add(1372,r'''
n,start=I(),I()-1;a=[(I(),I()) for _ in range(n)];power=1;direction=1;pos=start;seen=set();broken=set()
while 0<=pos<n and (pos,power,direction) not in seen:
    seen.add((pos,power,direction));kind,value=a[pos]
    if kind==0:power+=value;direction=-direction
    elif power>=value:broken.add(pos)
    pos+=power*direction
print(len(broken))
''',r'''
int n,pos;cin>>n>>pos;--pos;vector<pair<int,int>>a(n);for(auto &p:a)cin>>p.first>>p.second;ll power=1;int dir=1;set<tuple<int,ll,int>>seen;set<int>broken;while(pos>=0&&pos<n&&seen.insert({pos,power,dir}).second){auto [kind,v]=a[pos];if(kind==0){power+=v;dir=-dir;}else if(power>=v)broken.insert(pos);ll next=pos+power*dir;if(next<0||next>=n)break;pos=next;}cout<<broken.size()<<'\n';
''','模拟 O(N log N) 级跳跃次数；保存状态检测零增幅循环','跳板增加弹力并改变方向，目标只在弹力足够时破碎；记录位置、弹力和方向，遇到重复状态停止。')
add(1373,r'''
n=I();prev=prevdiff=0;ans=0
for _ in range(n):
    value=I();diff=value-prev;ans+=abs(diff-prevdiff);prev=value;prevdiff=diff
print(ans)
''',r'''
int n;cin>>n;ll prev=0,dprev=0,ans=0;while(n--){ll x;cin>>x;ll d=x-prev;ans+=llabs(d-dprev);prev=x;dprev=d;}cout<<ans<<'\n';
''','O(N) 时间，O(1) 额外空间','一次等差增减在二阶差分中只改变一个位置，因此最少次数是二阶差分各项绝对值之和。')
add(1395,r'''
for _ in range(I()):print('E' if S().endswith('0') else 'B')
''',r'''
int T;cin>>T;while(T--){string s;cin>>s;cout<<(s.back()=='0'?'E':'B')<<'\n';}
''','O(输入位数)','正回文数末位不能为 0；末位为 0 的局面是必败态，其他局面可减去个位数转移到必败态。')
add(1396,r'''
n,m=I(),I();s=S();a=[I() for _ in range(n)];ans=sum(a)
if len(set(s))>1:
    start=next(i for i in range(n) if s[i]!=s[i-1]);groups=[];i=0
    while i<n:
        j=i+1;direction=s[(start+i)%n];values=[a[(start+i)%n]]
        while j<n and s[(start+j)%n]==direction:values.append(a[(start+j)%n]);j+=1
        chain=sum(values)-(values[-1] if direction=='R' else values[0]);ans-=min(m,chain);i=j
print(ans)
''',r'''
int n;ll m;string s;cin>>n>>m>>s;vector<ll>a(n);ll ans=0;for(ll &x:a){cin>>x;ans+=x;}int start=-1;for(int i=0;i<n;i++)if(s[i]!=s[(i+n-1)%n]){start=i;break;}if(start!=-1)for(int i=0;i<n;){int j=i+1;char dir=s[(start+i)%n];ll sum=a[(start+i)%n];while(j<n&&s[(start+j)%n]==dir){sum+=a[(start+j)%n];j++;}ll end=dir=='R'?a[(start+j-1)%n]:a[(start+i)%n];ans-=min(m,sum-end);i=j;}cout<<ans<<'\n';
''','O(N)','圆环按连续同向段拆开。每段最靠近 RL 互传点的桶不会变空，其余链上的奶每分钟最多损失一单位。')
add(1397,r'''
n,q=I(),I();c=[I() for _ in range(n)];travel=[I() for _ in range(n)];latest=sorted((x-y for x,y in zip(c,travel)),reverse=True)
for _ in range(q):
    v,s=I(),I();print('YES' if latest[v-1]>s else 'NO')
''',r'''
int n,q;cin>>n>>q;vector<ll>a(n);for(ll &x:a)cin>>x;for(ll &x:a){ll t;cin>>t;x-=t;}sort(a.rbegin(),a.rend());while(q--){int v;ll s;cin>>v>>s;cout<<(a[v-1]>s?"YES":"NO")<<'\n';}
''','O(N log N+Q)','预处理每个农场的关闭时间减路程时间；能否访问至少 V 个农场，只需比较第 V 大值与出发时刻。')
print('authored',len(M))
