import sys
import os

if os.path.exists("badmilk.in"):
    sys.stdin = open("badmilk.in")
    sys.stdout = open("badmilk.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, m, d, s = I(), I(), I(), I()
drinks = [(I(), I(), I()) for _ in range(d)]
sick = [(I(), I()) for _ in range(s)]
ans = 0
for milk in range(1, m + 1):
    if all(
        any(p == person and q == milk and t < when for p, q, t in drinks)
        for person, when in sick
    ):
        ans = max(ans, len({p for p, q, t in drinks if q == milk}))
print(ans)
