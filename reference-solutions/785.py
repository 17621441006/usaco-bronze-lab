import sys
import os

if os.path.exists("outofplace.in"):
    sys.stdin = open("outofplace.in")
    sys.stdout = open("outofplace.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [I() for _ in range(I())]
print(max(0, sum(x != y for x, y in zip(a, sorted(a))) - 1))
