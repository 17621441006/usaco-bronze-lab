import sys
import os

if os.path.exists("speeding.in"):
    sys.stdin = open("speeding.in")
    sys.stdout = open("speeding.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, m = I(), I()
limit = []
speed = []
for _ in range(n):
    length, value = I(), I()
    limit += [value] * length
for _ in range(m):
    length, value = I(), I()
    speed += [value] * length
print(max([0] + [v - u for u, v in zip(limit, speed)]))
