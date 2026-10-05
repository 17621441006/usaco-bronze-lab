exec(open(__file__.replace('author-batch4.py','solution-authoring.py')).read())
add(1443,r'''
for _ in range(I()):
    n=I();lo,hi=45,49;ans=0
    while lo<=n:ans+=max(0,min(n,hi)-lo+1);lo=lo*10-5;hi=hi*10+9
    print(ans)
''',r'''
int T;cin>>T;while(T--){ll n,lo=45,hi=49,ans=0;cin>>n;while(lo<=n){ans+=max(0LL,min(n,hi)-lo+1);lo=lo*10-5;hi=hi*10+9;}cout<<ans<<'\n';}
''','O(T log N)','两种舍入结果不同的数形成区间 [45,49]、[445,499]、[4445,4999]……分别截取到 N 后累加。')
add(1444,r'''
n,q=I(),I();x=[0]*(n*n);y=[0]*(n*n);z=[0]*(n*n);ans=0;out=[]
for _ in range(q):
    a,b,c=I(),I(),I();u=b*n+c;v=a*n+c;w=a*n+b;x[u]+=1;y[v]+=1;z[w]+=1;ans+=(x[u]==n)+(y[v]==n)+(z[w]==n);out.append(str(ans))
print('\n'.join(out))
''',r'''
int n,q;cin>>n>>q;vector<int>x(n*n),y(n*n),z(n*n);int ans=0;while(q--){int a,b,c;cin>>a>>b>>c;ans+=(++x[b*n+c]==n)+(++y[a*n+c]==n)+(++z[a*n+b]==n);cout<<ans<<'\n';}
''','O(N²+Q) 时间，O(N²) 空间','每次移除方块，只更新经过它的三条轴线；某条线移除数达到 N 时，新增长条放置方式。')
add(1445,r'''
n,f=I(),I();a=list(S());count=Counter()
def pattern(j):
    if a[j]!=a[j+1] and a[j+1]==a[j+2]:return ''.join(a[j:j+3])
for j in range(n-2):
    key=pattern(j)
    if key:count[key]+=1
ans={x for x,c in count.items() if c>=f}
for i in range(n):
    starts=range(max(0,i-2),min(i,n-3)+1);old=a[i]
    for j in starts:
        key=pattern(j)
        if key:count[key]-=1
    for new in 'abcdefghijklmnopqrstuvwxyz':
        a[i]=new;extra=Counter(pattern(j) for j in starts)
        for key,v in extra.items():
            if key and count[key]+v>=f:ans.add(key)
    a[i]=old
    for j in starts:
        key=pattern(j)
        if key:count[key]+=1
print(len(ans));print('\n'.join(sorted(ans)))
''',r'''
int n,f;string s;cin>>n>>f>>s;int count[676]={};auto key=[&](int j){return s[j]!=s[j+1]&&s[j+1]==s[j+2]?(s[j]-'a')*26+s[j+1]-'a':-1;};for(int j=0;j+2<n;j++){int k=key(j);if(k>=0)count[k]++;}set<int>ans;for(int k=0;k<676;k++)if(count[k]>=f)ans.insert(k);for(int i=0;i<n;i++){char old=s[i];int l=max(0,i-2),r=min(i,n-3);for(int j=l;j<=r;j++){int k=key(j);if(k>=0)count[k]--;}for(char c='a';c<='z';c++){s[i]=c;vector<int>keys;for(int j=l;j<=r;j++){int k=key(j);if(k>=0){count[k]++;keys.push_back(k);}}for(int k:keys)if(count[k]>=f)ans.insert(k);for(int k:keys)count[k]--;}s[i]=old;for(int j=l;j<=r;j++){int k=key(j);if(k>=0)count[k]++;}}cout<<ans.size()<<'\n';for(int k:ans)cout<<char('a'+k/26)<<char('a'+k%26)<<char('a'+k%26)<<'\n';
''','O(26N) 时间，O(N+26²) 空间','一次改字只影响最多三个长度为 3 的窗口。先扣旧贡献，再试新字母并检查频次，最后恢复。')
add(1467,r'''
for _ in range(I()):
    n,A,B=I(),I(),I();a=[S() for _ in range(n)];stars=[bytearray(n) for _ in range(n)];ok=True
    if A==B==0:print(sum(c!='W' for row in a for c in row));continue
    for r in range(n):
        for c in range(n):
            if a[r][c]=='B':
                if r<B or c<A:ok=False
                else:stars[r][c]=stars[r-B][c-A]=1
    for r in range(n):
        for c in range(n):
            if a[r][c]=='W' and stars[r][c]:ok=False
            elif a[r][c]=='G' and not stars[r][c] and not(r>=B and c>=A and stars[r-B][c-A]):stars[r][c]=1
    print(sum(map(sum,stars)) if ok else -1)
''',r'''
int T;cin>>T;while(T--){int n,A,B;cin>>n>>A>>B;vector<string>a(n);for(auto &s:a)cin>>s;vector<vector<int>>star(n,vector<int>(n));bool ok=true;if(A==0&&B==0){int ans=0;for(auto s:a)for(char c:s)ans+=c!='W';cout<<ans<<'\n';continue;}for(int r=0;r<n;r++)for(int c=0;c<n;c++)if(a[r][c]=='B'){if(r<B||c<A)ok=false;else star[r][c]=star[r-B][c-A]=1;}for(int r=0;r<n;r++)for(int c=0;c<n;c++){if(a[r][c]=='W'&&star[r][c])ok=false;else if(a[r][c]=='G'&&!star[r][c]&&!(r>=B&&c>=A&&star[r-B][c-A]))star[r][c]=1;}int ans=0;for(auto row:star)for(int v:row)ans+=v;cout<<(ok?ans:-1)<<'\n';}
''','O(N²) 时间与空间','先由黑格确定必须存在的原始星星，再检查白格冲突；按移动依赖顺序，为仍未满足的灰格贪心补星。')
add(1468,r'''
n=I();a=[I() for _ in range(n)];first={};pref=[]
for i,v in enumerate(a):
    if v not in first:first[v]=i
    pref.append(len(first))
seen=Counter();ans=0
for i in range(n-1,-1,-1):
    v=a[i];seen[v]+=1
    if seen[v]==2:ans+=(pref[i-1] if i else 0)-(first[v]<i)
print(ans)
''',r'''
int n;cin>>n;vector<int>a(n),pref(n);unordered_map<int,int>first,seen;for(int i=0;i<n;i++){cin>>a[i];if(!first.count(a[i]))first[a[i]]=i;pref[i]=first.size();}ll ans=0;for(int i=n-1;i>=0;i--)if(++seen[a[i]]==2)ans+=(i?pref[i-1]:0)-(first[a[i]]<i);cout<<ans<<'\n';
''','期望 O(N) 时间，O(N) 空间','后两个相同数只需选择最右两次出现；前面不同数的种数用前缀统计得到，并排除与后两项相同的值。')
add(1469,r'''
n=I();a=[I() for _ in range(n)];b=[I() for _ in range(n)];same=[int(x==y) for x,y in zip(a,b)];base=sum(same);ans=[0]*(n+1)
for center in range(2*n-1):
    l=center//2;r=(center+1)//2;score=base
    while l>=0 and r<n:
        if l!=r:score+=(a[l]==b[r])+(a[r]==b[l])-same[l]-same[r]
        ans[score]+=1;l-=1;r+=1
print(*ans,sep='\n')
''',r'''
int n;cin>>n;vector<int>a(n),b(n),same(n);for(int &x:a)cin>>x;for(int &x:b)cin>>x;int base=0;for(int i=0;i<n;i++){same[i]=a[i]==b[i];base+=same[i];}vector<ll>ans(n+1);for(int center=0;center<2*n-1;center++){int l=center/2,r=(center+1)/2,score=base;while(l>=0&&r<n){if(l!=r)score+=(a[l]==b[r])+(a[r]==b[l])-same[l]-same[r];ans[score]++;l--;r++;}}for(ll x:ans)cout<<x<<'\n';
''','O(N²) 时间，O(N) 空间；官方提示满分优先使用非 Python 语言','按反转中心向两端扩展，新增一对交换只改变两个位置的匹配贡献，不再重新反转和扫描整个数组。')
add(1491,r'''
n,q=I(),I();a=[bytearray(1 if c=='#' else 0 for c in S()) for _ in range(n)];h=n//2;count=[0]*(h*h)
def group(r,c):return min(r,n-1-r)*h+min(c,n-1-c)
for r in range(n):
    for c in range(n):count[group(r,c)]+=a[r][c]
ans=sum(min(v,4-v) for v in count);out=[str(ans)]
for _ in range(q):
    r,c=I()-1,I()-1;g=group(r,c);ans-=min(count[g],4-count[g]);count[g]+=1-2*a[r][c];a[r][c]^=1;ans+=min(count[g],4-count[g]);out.append(str(ans))
print('\n'.join(out))
''',r'''
int n,q;cin>>n>>q;vector<string>a(n);for(auto &s:a)cin>>s;int h=n/2;vector<int>count(h*h);auto group=[&](int r,int c){return min(r,n-1-r)*h+min(c,n-1-c);};for(int r=0;r<n;r++)for(int c=0;c<n;c++)count[group(r,c)]+=a[r][c]=='#';int ans=0;for(int v:count)ans+=min(v,4-v);cout<<ans<<'\n';while(q--){int r,c;cin>>r>>c;--r;--c;int g=group(r,c);ans-=min(count[g],4-count[g]);count[g]+=a[r][c]=='#'?-1:1;a[r][c]=a[r][c]=='#'?'.':'#';ans+=min(count[g],4-count[g]);cout<<ans<<'\n';}
''','O(N²+Q) 时间，O(N²) 空间','四个镜像位置组成独立组；代价是 min(黑格数,4−黑格数)。修改单格时只更新一组。')
add(1492,r'''
n=I();freq=Counter(I() for _ in range(n));missing=0
for x in range(n+1):print(max(missing,freq[x]));missing+=freq[x]==0
''',r'''
int n;cin>>n;vector<int>f(n+1);for(int i=0,x;i<n;i++){cin>>x;f[x]++;}int missing=0;for(int x=0;x<=n;x++){cout<<max(missing,f[x])<<'\n';missing+=f[x]==0;}
''','O(N)','令 MEX=x，既要消除所有 x，也要补齐小于 x 的缺失值；一次改动可同时完成两件事，所以取两个数量的较大值。')
add(1493,r'''
def one(a):return not a or min(a)==max(a)
def two(a):
    runs=[(v,len(list(g))) for v,g in itertools.groupby(a)]
    return len(runs)<=2 or len(runs)%2==0 and all(runs[i]==runs[i%2] for i in range(2,len(runs)))
for _ in range(I()):
    n,k=I(),I();a=[I() for _ in range(n)];ok=one(a) if k==1 else two(a)
    if k==3 and not ok:
        for length in range(1,n+1):
            if n%length or any(a[i]!=a[i%length] for i in range(length,n)):continue
            block=a[:length]
            if any(one(block[:cut]) and two(block[cut:]) or two(block[:cut]) and one(block[cut:]) for cut in range(length+1)):ok=True;break
    print('YES' if ok else 'NO')
''',r'''
auto one=[](const vector<int>&a,int l,int r){for(int i=l+1;i<r;i++)if(a[i]!=a[l])return false;return true;};auto two=[](const vector<int>&a,int l,int r){vector<pair<int,int>>v;for(int i=l;i<r;i++){if(!v.empty()&&v.back().first==a[i])v.back().second++;else v.emplace_back(a[i],1);}if(v.size()<=2)return true;if(v.size()%2)return false;for(int i=2;i<(int)v.size();i++)if(v[i]!=v[i%2])return false;return true;};int T;cin>>T;while(T--){int n,k;cin>>n>>k;vector<int>a(n);for(int &x:a)cin>>x;bool ok=k==1?one(a,0,n):two(a,0,n);if(k==3&&!ok)for(int len=1;len<=n&&!ok;len++)if(n%len==0){bool repeated=true;for(int i=len;i<n;i++)if(a[i]!=a[i%len])repeated=false;if(repeated)for(int c=0;c<=len;c++)if((one(a,0,c)&&two(a,c,len))||(two(a,0,c)&&one(a,c,len))){ok=true;break;}}cout<<(ok?"YES":"NO")<<'\n';}
''','O(TN²) 级时间，O(N) 空间','最多三条 PRINT 时，去掉最外层重复后，主体可拆成“一条 PRINT 的程序”和“两条 PRINT 的程序”。枚举重复块与分割点。')
add(1539,r'''
for _ in range(I()):
    a,b,ca,cb,target=I(),I(),I(),I(),I();current=a+b//cb*ca
    if current>=target:print(0);continue
    extra_a=target-current-1;extra_b=cb-1-b%cb;cycles=extra_a//ca if cb>ca else 0
    print(extra_a+extra_b+cycles*(cb-ca)+1)
''',r'''
int T;cin>>T;while(T--){ll a,b,ca,cb,f;cin>>a>>b>>ca>>cb>>f;ll current=a+b/cb*ca;if(current>=f){cout<<0<<'\n';continue;}ll A=f-current-1,B=cb-1-b%cb,k=cb>ca?A/ca:0;cout<<A+B+k*(cb-ca)+1<<'\n';}
''','O(T) 时间，O(1) 每次查询空间','先求“仍然可能不够”的最大新增筹码数：B 类停在下一次兑换前一枚；再根据兑换比率选择增加多少整批，最后加一。')
add(1540,r'''
t,k=I(),I()
for _ in range(t):
    n=I();s=S()
    if n%2:print(-1);continue
    half=len(s)//2
    if s[:half]==s[half:]:print(1);print(*([1]*len(s)));continue
    mark=[1]*len(s)
    for i in range(0,half,3):
        left,right=s[i:i+3],s[i+half:i+half+3]
        if left==right:continue
        found=False
        for u in range(3):
            for v in range(3):
                if left[:u]+left[u+1:]==right[:v]+right[v+1:]:
                    mark[i+u]=mark[i+half+v]=2;found=True;break
            if found:break
    print(2);print(*mark)
''',r'''
int T,k;cin>>T>>k;while(T--){int n;string s;cin>>n>>s;if(n%2){cout<<-1<<'\n';continue;}int h=s.size()/2;if(s.substr(0,h)==s.substr(h)){cout<<1<<'\n';for(int i=0;i<2*h;i++)cout<<1<<' ';cout<<'\n';continue;}vector<int>mark(2*h,1);for(int i=0;i<h;i+=3){string a=s.substr(i,3),b=s.substr(i+h,3);if(a==b)continue;bool done=false;for(int u=0;u<3&&!done;u++)for(int v=0;v<3;v++){string x=a,y=b;x.erase(u,1);y.erase(v,1);if(x==y){mark[i+u]=mark[i+h+v]=2;done=true;break;}}}cout<<2<<'\n';for(int x:mark)cout<<x<<' ';cout<<'\n';}
''','O(总字符串长度)','奇数块无法清空；原串已为方串时一次删除。否则将两半对应三字母块的公共有序对子分到操作 1，余下同字母分到操作 2。')
add(1541,r'''
n,k=I(),I();q=I();size=n-k+1;value=[[0]*n for _ in range(n)];windows=[[0]*size for _ in range(size)];best=0;out=[]
for _ in range(q):
    r,c,v=I()-1,I()-1,I();delta=v-value[r][c];value[r][c]=v;clo,chi=max(0,c-k+1),min(c,size-1)
    for x in range(max(0,r-k+1),min(r,size-1)+1):
        row=windows[x]
        for y in range(clo,chi+1):
            row[y]+=delta
            if row[y]>best:best=row[y]
    out.append(str(best))
print('\n'.join(out))
''',r'''
int n,k,q;cin>>n>>k>>q;int size=n-k+1;vector<vector<ll>>a(n,vector<ll>(n)),w(size,vector<ll>(size));ll best=0;while(q--){int r,c;ll v;cin>>r>>c>>v;--r;--c;ll delta=v-a[r][c];a[r][c]=v;for(int x=max(0,r-k+1);x<=min(r,size-1);x++)for(int y=max(0,c-k+1);y<=min(c,size-1);y++){w[x][y]+=delta;best=max(best,w[x][y]);}cout<<best<<'\n';}
''','O(N²+QK²) 时间，O(N²) 空间','输入给的是新值，先减去旧值得到增量；只更新包含这个格子的窗口。所有更新均为增加，因此全局最大值只需与新窗口比较。')
add(1563,r'''
t,k=I(),I()
for _ in range(t):
    n=I();s=S();print('YES')
    if k:
        result=['']*n;flip=0
        for i in range(n-1,-1,-1):
            typed=(s[i]=='O')^flip;result[i]='O' if typed else 'M';flip^=typed
        print(''.join(result))
''',r'''
int T,k;cin>>T>>k;while(T--){int n;string s;cin>>n>>s;cout<<"YES\n";if(k){string out(n,'M');bool flip=false;for(int i=n-1;i>=0;i--){bool typed=(s[i]=='O')^flip;out[i]=typed?'O':'M';flip^=typed;}cout<<out<<'\n';}}
''','O(总字符串长度)','从右向左决定按键；记录后续 O 按键造成的翻转奇偶性，据此确定当前应按 M 还是 O。任意目标串都可构造。')
add(1564,r'''
n,k=I(),I();size=1<<n;score=[0]*size
for _ in range(k):
    x,y,z=1<<(I()-1),1<<(I()-1),1<<(I()-1)
    score[x]+=1;score[x|y]-=1;score[x|z]-=1;score[x|y|z]+=1
bit=1
while bit<size:
    for base in range(0,size,bit*2):
        for j in range(base,base+bit):score[j+bit]+=score[j]
    bit*=2
best=max(score);print(best,score.count(best))
''',r'''
int n,k;cin>>n>>k;int size=1<<n;vector<int>score(size);while(k--){int a,b,c;cin>>a>>b>>c;int x=1<<(a-1),y=1<<(b-1),z=1<<(c-1);score[x]++;score[x|y]--;score[x|z]--;score[x|y|z]++;}for(int bit=1;bit<size;bit<<=1)for(int base=0;base<size;base+=2*bit)for(int j=base;j<base+bit;j++)score[j+bit]+=score[j];int best=*max_element(score.begin(),score.end());cout<<best<<' '<<count(score.begin(),score.end(),best)<<'\n';
''','O(K+N·2ᴺ) 时间，O(2ᴺ) 空间；进阶 SOS DP 解法','把得分写成 mₓ(1−mᵧ)(1−m_z)，展开为四个子集系数，再通过子集和 DP 一次算出所有棋盘得分。此为进阶可选路线。')
add(1565,r'''
n,q=I(),I();prices=[I() for _ in range(n)][:31]
for i in range(1,len(prices)):prices[i]=min(prices[i],2*prices[i-1])
for _ in range(q):
    remaining=I();cost=0;best=10**30
    for i in range(len(prices)-1,-1,-1):
        take,remaining=divmod(remaining,1<<i);cost+=take*prices[i];best=min(best,cost+(prices[i] if remaining else 0))
    print(best)
''',r'''
int n,q;cin>>n>>q;vector<ll>a(min(n,31));for(int i=0;i<n;i++){ll x;cin>>x;if(i<31)a[i]=x;}for(int i=1;i<(int)a.size();i++)a[i]=min(a[i],2*a[i-1]);while(q--){ll x;cin>>x;ll cost=0,best=LLONG_MAX;for(int i=(int)a.size()-1;i>=0;i--){ll size=1LL<<i;cost+=x/size*a[i];x%=size;best=min(best,cost+(x?a[i]:0));}cout<<best<<'\n';}
''','O(N+31Q) 时间','先用两份小套餐优化大套餐价格，再从大到小购买；每一层额外比较“多买一份直接满足需求”的候选费用。')
add(1587,r'''
for _ in range(I()):
    n,k=I(),I();a=[I() for _ in range(n)]
    if k<0:a=[n+1-v for v in a];k=-k
    count=[0]*(n+1)
    for v in a:count[v]+=1
    ans=0
    for r in range(1,k+1):
        pos=r;carry=0
        while pos<=n or carry:
            if pos<=n:carry+=count[pos]
            carry=max(0,carry-1);ans+=carry;pos+=k
    print(ans)
''',r'''
int T;cin>>T;while(T--){int n,k;cin>>n>>k;vector<int>f(n+1);for(int i=0,x;i<n;i++){cin>>x;if(k<0)x=n+1-x;f[x]++;}k=abs(k);ll ans=0;for(int r=1;r<=k;r++){ll pos=r;int carry=0;while(pos<=n||carry){if(pos<=n)carry+=f[pos];carry=max(0,carry-1);ans+=carry;pos+=k;}}cout<<ans<<'\n';}
''','O(N) 时间与空间','负 K 先镜像成正 K。相同余数构成独立链，每个数值位置保留一个元素，剩余元素向下一位置移动并累加操作数。')
add(1588,r'''
MOD=10**9+7
for _ in range(I()):
    s=S();extra=int(any(c not in '01' for c in s));prefix=0
    for c in s[:-1]:prefix=(prefix*2+(ord(c)-48)%2)%MOD
    print((3*prefix+(ord(s[-1])-48)%2+extra)%MOD)
''',r'''
const ll MOD=1000000007;int T;cin>>T;while(T--){string s;cin>>s;bool extra=false;for(char c:s)extra |= c!='0'&&c!='1';ll prefix=0;for(int i=0;i+1<(int)s.size();i++)prefix=(2*prefix+(s[i]-'0')%2)%MOD;cout<<(3*prefix+(s.back()-'0')%2+extra)%MOD<<'\n';}
''','O(总位数) 时间，O(1) 额外空间','最多一次奇偶映射后只剩 0/1 数位；将末位之外的这些位按二进制求值乘 3，再加末位和首次映射次数。')
add(1589,r'''
for _ in range(I()):
    n,m=I(),I();target=S();grid=[list(S()) for _ in range(n)];positions=defaultdict(list);ops=[]
    for r in range(n):
        for c in range(m):positions[grid[r][c]].append(r*m+c)
    def swap(r,c,u,v):
        if r==u and c==v:return
        a,b=grid[r][c],grid[u][v];grid[r][c],grid[u][v]=b,a;positions[a].append(u*m+v);positions[b].append(r*m+c)
        ops.append((1,r+1,c+1,v+1) if r==u else (2,r+1,u+1,c+1))
    for c,wanted in enumerate(target):
        if grid[0][c]==wanted:continue
        bucket=positions[wanted]
        while bucket:
            code=bucket[-1];r,j=divmod(code,m)
            if code<c or grid[r][j]!=wanted:bucket.pop()
            else:break
        r,j=divmod(bucket.pop(),m)
        if r==0:swap(0,j,0,c)
        else:swap(r,j,r,c);swap(r,c,0,c)
    print(len(ops))
    for op in ops:print(*op)
''',r'''
int T;cin>>T;while(T--){int n,m;string t;cin>>n>>m>>t;vector<string>a(n);vector<vector<int>>pos(26);for(int r=0;r<n;r++){cin>>a[r];for(int c=0;c<m;c++)pos[a[r][c]-'a'].push_back(r*m+c);}vector<array<int,4>>ops;auto sw=[&](int r,int c,int u,int v){if(r==u&&c==v)return;char x=a[r][c],y=a[u][v];swap(a[r][c],a[u][v]);pos[x-'a'].push_back(u*m+v);pos[y-'a'].push_back(r*m+c);if(r==u)ops.push_back({1,r+1,c+1,v+1});else ops.push_back({2,r+1,u+1,c+1});};for(int c=0;c<m;c++)if(a[0][c]!=t[c]){auto &b=pos[t[c]-'a'];while(!b.empty()){int p=b.back();if(p<c||a[p/m][p%m]!=t[c])b.pop_back();else break;}int p=b.back();b.pop_back();int r=p/m,j=p%m;if(r==0)sw(0,j,0,c);else{sw(r,j,r,c);sw(r,c,0,c);}}cout<<ops.size()<<'\n';for(auto v:ops)cout<<v[0]<<' '<<v[1]<<' '<<v[2]<<' '<<v[3]<<'\n';}
''','摊还 O(NM+M) 时间与空间','按列固定第一行。按字母维护候选位置栈，惰性丢弃失效位置；同一行一次交换，其他行先横向再纵向，至多 2M 次。')
print('authored',len(M))
