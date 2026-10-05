import sys
import os

if os.path.exists("cowsignal.in"):
    sys.stdin = open("cowsignal.in")
    sys.stdout = open("cowsignal.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n, m, k = I(), I(), I()
for _ in range(n):
    row = "".join(c * k for c in S())
    for j in range(k):
        print(row)
