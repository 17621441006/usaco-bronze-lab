import sys
import os

if os.path.exists("breedflip.in"):
    sys.stdin = open("breedflip.in")
    sys.stdout = open("breedflip.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
a, b = S(), S()
ans = 0
bad = False
for x, y in zip(a, b):
    diff = x != y
    ans += diff and not bad
    bad = diff
print(ans)
