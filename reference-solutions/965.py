import sys, itertools
import os

if os.path.exists("lineup.in"):
    sys.stdin = open("lineup.in")
    sys.stdout = open("lineup.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
pairs = []
for _ in range(n):
    a = S()
    S()
    S()
    S()
    S()
    b = S()
    pairs.append((a, b))
names = sorted("Bessie Buttercup Belinda Beatrice Bella Blue Betsy Sue".split())
for order in itertools.permutations(names):
    pos = {v: i for i, v in enumerate(order)}
    if all(abs(pos[x] - pos[y]) == 1 for x, y in pairs):
        print(*order, sep="\n")
        break
