import sys, itertools
from collections import defaultdict
import os

if os.path.exists("circlecross.in"):
    sys.stdin = open("circlecross.in")
    sys.stdout = open("circlecross.out", "w")

it = iter(sys.stdin.read().split())


def S():
    return next(it)


s = S()
pos = defaultdict(list)
for i, c in enumerate(s):
    pos[c].append(i)
ans = 0
for a, b in itertools.combinations(pos.values(), 2):
    ans += (a[0] < b[0] < a[1] < b[1]) or (b[0] < a[0] < b[1] < a[1])
print(ans)
