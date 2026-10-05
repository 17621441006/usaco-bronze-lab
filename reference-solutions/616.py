import sys
import os

if os.path.exists("cbarn.in"):
    sys.stdin = open("cbarn.in")
    sys.stdout = open("cbarn.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
print(min(sum(k * a[(s + k) % n] for k in range(n)) for s in range(n)))
