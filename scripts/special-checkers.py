"""Semantic output checkers, independently implemented from problem constraints."""
def check(pid,input_text,expected,output):
 try:
  data=iter(input_text.split());out=iter(output.split())
  def ni():return int(next(data))
  def oi():return int(next(out))
  if pid==1252:
   for _ in range(ni()):
    n,k=ni(),ni();s=next(data);claimed=oi();patch=next(out)
    if len(patch)!=n or any(c not in '.GH' for c in patch) or sum(c!='.' for c in patch)!=claimed:return False
    reach={'G':-1,'H':-1};minimum=0
    for i,c in enumerate(s):
     if i>reach[c]:minimum+=1;reach[c]=i+2*k
    if claimed!=minimum:return False
    for c in 'GH':
     prefix=[0]
     for p in patch:prefix.append(prefix[-1]+(p==c))
     if any(prefix[min(n,i+k+1)]==prefix[max(0,i-k)] for i,v in enumerate(s) if v==c):return False
  elif pid==1540:
   t,k=ni(),ni()
   for _ in range(t):
    n=ni();s=next(data);m=oi()
    if n%2:
     if m!=-1:return False
     continue
    half=len(s)//2;optimal=1 if s[:half]==s[half:] else 2
    if not(1<=m<=optimal+k):return False
    groups=[[] for _ in range(m)]
    for c in s:
     label=oi()
     if not(1<=label<=m):return False
     groups[label-1].append(c)
    for group in groups:
     h=len(group)//2
     if not group or len(group)%2 or group[:h]!=group[h:]:return False
  elif pid==1563:
   t,k=ni(),ni()
   for _ in range(t):
    n=ni();s=next(data)
    if next(out)!='YES':return False
    if k:
     keys=next(out)
     if len(keys)!=n or any(c not in 'MO' for c in keys):return False
     flip=0
     for i in range(n-1,-1,-1):
      char=('O' if keys[i]=='M' else 'M') if flip else keys[i]
      if char!=s[i]:return False
      flip^=keys[i]=='O'
  elif pid==1589:
   for _ in range(ni()):
    n,m=ni(),ni();target=next(data);grid=[list(next(data)) for _ in range(n)];ops=oi()
    if not(0<=ops<=2*m):return False
    for j in range(ops):
     kind,x,p,q=oi(),oi()-1,oi()-1,oi()-1
     if kind==1:
      if not(0<=x<n and 0<=p<m and 0<=q<m):return False
      grid[x][p],grid[x][q]=grid[x][q],grid[x][p]
     elif kind==2:
      if not(0<=x<n and 0<=p<n and 0<=q<m):return False
      grid[x][q],grid[p][q]=grid[p][q],grid[x][q]
     else:return False
    if ''.join(grid[0])!=target:return False
  elif pid==987:return [s.strip() for s in output.strip().splitlines()]==[s.strip() for s in expected.strip().splitlines()]
  else:return output.split()==expected.split()
  try:next(out);return False
  except StopIteration:return True
 except (StopIteration,ValueError,IndexError,KeyError):return False
