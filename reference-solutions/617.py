import sys
import os

if os.path.exists("balancing.in"):
    sys.stdin = open("balancing.in")
    sys.stdout = open("balancing.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, b = I(), I()
a = [(I(), I()) for _ in range(n)]
ans = n
for x in {x + 1 for x, y in a}:
    for y in {y + 1 for x, y in a}:
        cnt = [0] * 4
        for u, v in a:
            cnt[(u > x) * 2 + (v > y)] += 1
        ans = min(ans, max(cnt))
print(ans)
