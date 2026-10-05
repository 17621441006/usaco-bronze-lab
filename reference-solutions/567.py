import sys
import os

if os.path.exists("paint.in"):
    sys.stdin = open("paint.in")
    sys.stdout = open("paint.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a, b, c, d = I(), I(), I(), I()
print(b - a + d - c - max(0, min(b, d) - max(a, c)))
