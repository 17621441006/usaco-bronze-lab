import sys
import os

if os.path.exists("photo.in"):
    sys.stdin = open("photo.in")
    sys.stdout = open("photo.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
b = [I() for _ in range(n - 1)]
for first in range(1, n + 1):
    a = [first]
    seen = {first}
    for v in b:
        x = v - a[-1]
        if x < 1 or x > n or x in seen:
            break
        a.append(x)
        seen.add(x)
    if len(a) == n:
        print(*a)
        break
