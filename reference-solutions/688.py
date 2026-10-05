import sys
import os

if os.path.exists("hps.in"):
    sys.stdin = open("hps.in")
    sys.stdout = open("hps.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [(I(), I()) for _ in range(I())]
wins = sum((x - y) % 3 == 1 for x, y in a)
other = sum((y - x) % 3 == 1 for x, y in a)
print(max(wins, other))
