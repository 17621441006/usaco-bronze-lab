import sys
import os

if os.path.exists("taming.in"):
    sys.stdin = open("taming.in")
    sys.stdout = open("taming.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
need = [-1] * n
need[0] = 1
ok = True
for i, v in enumerate(a):
    if v == -1:
        continue
    if v > i:
        ok = False
        continue
    for j in range(v + 1):
        pos = i - j
        value = int(j == v)
        if need[pos] != -1 and need[pos] != value:
            ok = False
        need[pos] = value
print(-1 if not ok else f"{need.count(1)} {need.count(1)+need.count(-1)}")
