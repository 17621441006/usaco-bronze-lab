import sys
from collections import Counter

it = iter(sys.stdin.read().split())


def S():
    return next(it)


a = "".join(S() for _ in range(3))
b = "".join(S() for _ in range(3))
green = sum(x == y for x, y in zip(a, b))
common = sum((Counter(a) & Counter(b)).values())
print(green)
print(common - green)
