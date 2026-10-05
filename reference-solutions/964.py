import sys
import os

if os.path.exists("whereami.in"):
    sys.stdin = open("whereami.in")
    sys.stdout = open("whereami.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
s = S()
for k in range(1, n + 1):
    if len({s[i : i + k] for i in range(n - k + 1)}) == n - k + 1:
        print(k)
        break
