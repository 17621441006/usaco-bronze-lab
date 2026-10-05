import sys, itertools
import os

if os.path.exists("guess.in"):
    sys.stdin = open("guess.in")
    sys.stdout = open("guess.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


a = []
for _ in range(I()):
    name = S()
    a.append({S() for _ in range(I())})
print(1 + max((len(x & y) for x, y in itertools.combinations(a, 2)), default=0))
