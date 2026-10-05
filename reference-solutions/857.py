import sys
import os

if os.path.exists("backforth.in"):
    sys.stdin = open("backforth.in")
    sys.stdout = open("backforth.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [I() for _ in range(10)]
b = [I() for _ in range(10)]
ans = set()


def dfs(day, left, right, milk):
    if day == 4:
        ans.add(milk)
        return
    src, dst = (left, right) if day % 2 == 0 else (right, left)
    for v in set(src):
        s = src.copy()
        s.remove(v)
        d = dst + [v]
        if day % 2 == 0:
            dfs(day + 1, s, d, milk - v)
        else:
            dfs(day + 1, d, s, milk + v)


dfs(0, a, b, 1000)
print(len(ans))
