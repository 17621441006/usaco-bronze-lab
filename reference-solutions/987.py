import sys
import os

if os.path.exists("word.in"):
    sys.stdin = open("word.in")
    sys.stdout = open("word.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n, k = I(), I()
line = []
size = 0
for _ in range(n):
    w = S()
    if size + len(w) > k:
        print(" ".join(line))
        line = []
        size = 0
    line.append(w)
    size += len(w)
if line:
    print(" ".join(line))
