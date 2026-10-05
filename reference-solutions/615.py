import sys
import os

if os.path.exists("pails.in"):
    sys.stdin = open("pails.in")
    sys.stdout = open("pails.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


x, y, m = I(), I(), I()
print(max(i * x + (m - i * x) // y * y for i in range(m // x + 1)))
