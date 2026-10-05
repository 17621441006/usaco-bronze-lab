import sys
import os

if os.path.exists("lifeguards.in"):
    sys.stdin = open("lifeguards.in")
    sys.stdout = open("lifeguards.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [(I(), I()) for _ in range(n)]
events = []
for i, (l, r) in enumerate(a):
    events.extend([(l, 1, i), (r, -1, i)])
events.sort()
active = set()
alone = [0] * n
total = 0
prev = events[0][0]
for t, kind, i in events:
    if active:
        total += t - prev
    if len(active) == 1:
        alone[next(iter(active))] += t - prev
    if kind == 1:
        active.add(i)
    else:
        active.remove(i)
    prev = t
print(total - min(alone))
