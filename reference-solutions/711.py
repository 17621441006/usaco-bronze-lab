import sys
import os

if os.path.exists("crossroad.in"):
    sys.stdin = open("crossroad.in")
    sys.stdout = open("crossroad.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


last = {}
ans = 0
for _ in range(I()):
    cow, side = I(), I()
    ans += cow in last and last[cow] != side
    last[cow] = side
print(ans)
