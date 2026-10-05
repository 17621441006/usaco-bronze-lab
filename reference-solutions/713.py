import sys
import os

if os.path.exists("cowqueue.in"):
    sys.stdin = open("cowqueue.in")
    sys.stdout = open("cowqueue.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = sorted((I(), I()) for _ in range(I()))
t = 0
for arrival, duration in a:
    t = max(t, arrival) + duration
print(t)
