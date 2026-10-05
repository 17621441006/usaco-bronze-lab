import sys
import os

if os.path.exists("square.in"):
    sys.stdin = open("square.in")
    sys.stdout = open("square.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [I() for _ in range(8)]
side = max(max(a[2], a[6]) - min(a[0], a[4]), max(a[3], a[7]) - min(a[1], a[5]))
print(side * side)
