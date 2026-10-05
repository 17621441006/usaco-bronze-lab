import sys
from collections import Counter
import os

if os.path.exists("blocks.in"):
    sys.stdin = open("blocks.in")
    sys.stdout = open("blocks.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


ans = Counter()
for _ in range(I()):
    a, b = Counter(S()), Counter(S())
    for c in set(a) | set(b):
        ans[c] += max(a[c], b[c])
print(*(ans[chr(97 + i)] for i in range(26)), sep="\n")
