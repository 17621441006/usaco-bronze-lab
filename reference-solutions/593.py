import sys
import os

if os.path.exists("mowing.in"):
    sys.stdin = open("mowing.in")
    sys.stdout = open("mowing.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
x = y = t = 0
last = {(0, 0): 0}
ans = 10**18
for _ in range(n):
    d, k = S(), I()
    dx, dy = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}[d]
    for j in range(k):
        x += dx
        y += dy
        t += 1
        if (x, y) in last:
            ans = min(ans, t - last[x, y])
        last[x, y] = t
print(-1 if ans == 10**18 else ans)
