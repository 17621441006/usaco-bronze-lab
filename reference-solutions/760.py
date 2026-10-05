import sys
import os

if os.path.exists("shuffle.in"):
    sys.stdin = open("shuffle.in")
    sys.stdout = open("shuffle.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
p = [I() - 1 for _ in range(n)]
a = [S() for _ in range(n)]
for _ in range(3):
    a = [a[p[i]] for i in range(n)]
print(*a, sep="\n")
