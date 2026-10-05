import sys
import os

if os.path.exists("herding.in"):
    sys.stdin = open("herding.in")
    sys.stdout = open("herding.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a, b, c = sorted([I(), I(), I()])
lo = 0 if c - a == 2 else 1 if b - a == 2 or c - b == 2 else 2
print(lo)
print(max(b - a, c - b) - 1)
