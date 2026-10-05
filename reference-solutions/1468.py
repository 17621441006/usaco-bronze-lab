import sys
from collections import Counter

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
first = {}
pref = []
for i, v in enumerate(a):
    if v not in first:
        first[v] = i
    pref.append(len(first))
seen = Counter()
ans = 0
for i in range(n - 1, -1, -1):
    v = a[i]
    seen[v] += 1
    if seen[v] == 2:
        ans += (pref[i - 1] if i else 0) - (first[v] < i)
print(ans)
