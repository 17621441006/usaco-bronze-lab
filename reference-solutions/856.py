import sys
import os

if os.path.exists("blist.in"):
    sys.stdin = open("blist.in")
    sys.stdout = open("blist.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


events = []
for _ in range(I()):
    s, t, b = I(), I(), I()
    events.extend([(s, b), (t, -b)])
now = ans = 0
for t, d in sorted(events):
    now += d
    ans = max(ans, now)
print(ans)
