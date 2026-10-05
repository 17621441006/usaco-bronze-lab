import sys
import os

if os.path.exists("teleport.in"):
    sys.stdin = open("teleport.in")
    sys.stdout = open("teleport.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a, b, x, y = I(), I(), I(), I()
print(min(abs(a - b), abs(a - x) + abs(b - y), abs(a - y) + abs(b - x)))
