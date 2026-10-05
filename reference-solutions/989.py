import sys
import os

if os.path.exists("race.in"):
    sys.stdin = open("race.in")
    sys.stdout = open("race.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


k, n = I(), I()
for _ in range(n):
    x = I()
    lo, hi = 1, 2 * k
    while lo < hi:
        t = (lo + hi) // 2
        m = min(t, (x + t) // 2)
        r = t - m
        distance = m * (m + 1) // 2 + r * (x + t) - (m + 1 + t) * r // 2
        if distance >= k:
            hi = t
        else:
            lo = t + 1
    print(lo)
