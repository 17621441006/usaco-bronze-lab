import sys
import os

if os.path.exists("billboard.in"):
    sys.stdin = open("billboard.in")
    sys.stdout = open("billboard.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


x1, y1, x2, y2 = I(), I(), I(), I()
a, b, c, d = I(), I(), I(), I()
if b <= y1 and d >= y2:
    if a <= x1:
        x1 = min(x2, max(x1, c))
    elif c >= x2:
        x2 = max(x1, min(x2, a))
if a <= x1 and c >= x2:
    if b <= y1:
        y1 = min(y2, max(y1, d))
    elif d >= y2:
        y2 = max(y1, min(y2, b))
print((x2 - x1) * (y2 - y1))
