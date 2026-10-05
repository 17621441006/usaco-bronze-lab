import sys
import os

if os.path.exists("swap.in"):
    sys.stdin = open("swap.in")
    sys.stdout = open("swap.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, k = I(), I()
a, b, c, d = I() - 1, I(), I() - 1, I()
p = list(range(n))
p[a:b] = p[a:b][::-1]
p[c:d] = p[c:d][::-1]
ans = [0] * n
seen = [False] * n
for i in range(n):
    if seen[i]:
        continue
    cycle = []
    j = i
    while not seen[j]:
        seen[j] = True
        cycle.append(j)
        j = p[j]
    for t, v in enumerate(cycle):
        ans[v] = cycle[(t + k) % len(cycle)] + 1
print(*ans, sep="\n")
