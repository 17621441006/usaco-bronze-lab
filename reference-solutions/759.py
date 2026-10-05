import sys
import os

if os.path.exists("billboard.in"):
    sys.stdin = open("billboard.in")
    sys.stdout = open("billboard.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [tuple(I() for _ in range(4)) for _ in range(3)]


def area(r):
    return (r[2] - r[0]) * (r[3] - r[1])


def overlap(r, s):
    return max(0, min(r[2], s[2]) - max(r[0], s[0])) * max(
        0, min(r[3], s[3]) - max(r[1], s[1])
    )


print(sum(area(r) - overlap(r, a[2]) for r in a[:2]))
