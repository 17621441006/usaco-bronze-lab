import sys
import os

if os.path.exists("gymnastics.in"):
    sys.stdin = open("gymnastics.in")
    sys.stdout = open("gymnastics.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


k, n = I(), I()
pos = []
for _ in range(k):
    row = [I() for _ in range(n)]
    pos.append({v: i for i, v in enumerate(row)})
print(
    sum(
        all(p[x] < p[y] for p in pos)
        for x in range(1, n + 1)
        for y in range(1, n + 1)
        if x != y
    )
)
