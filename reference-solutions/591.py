import sys
import os

if os.path.exists("promote.in"):
    sys.stdin = open("promote.in")
    sys.stdout = open("promote.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [(I(), I()) for _ in range(4)]
p = 0
ans = []
for i in range(3, 0, -1):
    p += a[i][1] - a[i][0]
    ans.append(p)
print(*ans[::-1], sep="\n")
