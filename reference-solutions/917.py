import sys
import os

if os.path.exists("traffic.in"):
    sys.stdin = open("traffic.in")
    sys.stdout = open("traffic.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


a = [(S(), I(), I()) for _ in range(I())]


def sweep(rows, reverse=False):
    lo, hi = 0, 10**9
    for kind, x, y in rows:
        if kind == "none":
            lo = max(lo, x)
            hi = min(hi, y)
        elif (kind == "on") != reverse:
            lo += x
            hi += y
        else:
            lo = max(0, lo - y)
            hi -= x
    return lo, hi


print(*sweep(a[::-1], True))
print(*sweep(a))
