import sys
import os

if os.path.exists("cowtip.in"):
    sys.stdin = open("cowtip.in")
    sys.stdout = open("cowtip.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
a = [[int(c) for c in S()] for _ in range(n)]
ans = 0
for r in range(n - 1, -1, -1):
    for c in range(n - 1, -1, -1):
        if a[r][c]:
            ans += 1
            for i in range(r + 1):
                for j in range(c + 1):
                    a[i][j] ^= 1
print(ans)
