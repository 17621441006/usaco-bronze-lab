import sys
import os

if os.path.exists("angry.in"):
    sys.stdin = open("angry.in")
    sys.stdout = open("angry.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = sorted(I() for _ in range(n))


def reach(start, direction):
    pos = start
    radius = 1
    while True:
        nxt = pos
        while 0 <= nxt + direction < n and abs(a[nxt + direction] - a[pos]) <= radius:
            nxt += direction
        if nxt == pos:
            return pos
        pos = nxt
        radius += 1


print(max(reach(i, 1) - reach(i, -1) + 1 for i in range(n)))
