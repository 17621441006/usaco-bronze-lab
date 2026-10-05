import sys
import os

if os.path.exists("shell.in"):
    sys.stdin = open("shell.in")
    sys.stdout = open("shell.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [(I() - 1, I() - 1, I() - 1) for _ in range(I())]
best = 0
for start in range(3):
    pos = start
    score = 0
    for x, y, g in a:
        if pos == x:
            pos = y
        elif pos == y:
            pos = x
        score += pos == g
    best = max(best, score)
print(best)
