import sys
import os

if os.path.exists("revegetate.in"):
    sys.stdin = open("revegetate.in")
    sys.stdout = open("revegetate.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, m = I(), I()
g = [[] for _ in range(n)]
for _ in range(m):
    u, v = I() - 1, I() - 1
    g[u].append(v)
    g[v].append(u)
c = [0] * n
for u in range(n):
    c[u] = next(k for k in range(1, 5) if all(c[v] != k for v in g[u]))
print("".join(map(str, c)))
