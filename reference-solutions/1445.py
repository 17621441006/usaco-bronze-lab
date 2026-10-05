import sys
from collections import Counter

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n, f = I(), I()
a = list(S())
count = Counter()


def pattern(j):
    if a[j] != a[j + 1] and a[j + 1] == a[j + 2]:
        return "".join(a[j : j + 3])


for j in range(n - 2):
    key = pattern(j)
    if key:
        count[key] += 1
ans = {x for x, c in count.items() if c >= f}
for i in range(n):
    starts = range(max(0, i - 2), min(i, n - 3) + 1)
    old = a[i]
    for j in starts:
        key = pattern(j)
        if key:
            count[key] -= 1
    for new in "abcdefghijklmnopqrstuvwxyz":
        a[i] = new
        extra = Counter(pattern(j) for j in starts)
        for key, v in extra.items():
            if key and count[key] + v >= f:
                ans.add(key)
    a[i] = old
    for j in starts:
        key = pattern(j)
        if key:
            count[key] += 1
print(len(ans))
print("\n".join(sorted(ans)))
