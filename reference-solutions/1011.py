import sys
from collections import defaultdict
import os

if os.path.exists("triangles.in"):
    sys.stdin = open("triangles.in")
    sys.stdout = open("triangles.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [(I(), I()) for _ in range(n)]
xs = defaultdict(list)
ys = defaultdict(list)
for x, y in a:
    xs[x].append(y)
    ys[y].append(x)
xb = {x: (min(v), max(v)) for x, v in xs.items()}
yb = {y: (min(v), max(v)) for y, v in ys.items()}
print(
    max(max(y - xb[x][0], xb[x][1] - y) * max(x - yb[y][0], yb[y][1] - x) for x, y in a)
)
