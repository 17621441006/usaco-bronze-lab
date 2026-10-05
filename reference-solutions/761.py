import sys
import os

if os.path.exists("measurement.in"):
    sys.stdin = open("measurement.in")
    sys.stdout = open("measurement.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


a = sorted((I(), S(), I()) for _ in range(I()))
milk = dict.fromkeys(["Bessie", "Elsie", "Mildred"], 7)
old = set(milk)
ans = 0
for day, name, change in a:
    milk[name] += change
    top = max(milk.values())
    new = {k for k, v in milk.items() if v == top}
    ans += new != old
    old = new
print(ans)
