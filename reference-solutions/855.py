import sys
import os

if os.path.exists("mixmilk.in"):
    sys.stdin = open("mixmilk.in")
    sys.stdout = open("mixmilk.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = [(I(), I()) for _ in range(3)]
cap = [x for x, y in a]
milk = [y for x, y in a]
for t in range(100):
    i = t % 3
    j = (i + 1) % 3
    v = min(milk[i], cap[j] - milk[j])
    milk[i] -= v
    milk[j] += v
print(*milk, sep="\n")
