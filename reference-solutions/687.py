import sys
import os

if os.path.exists("notlast.in"):
    sys.stdin = open("notlast.in")
    sys.stdout = open("notlast.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


a = dict.fromkeys("Bessie Elsie Daisy Gertie Annabelle Maggie Henrietta".split(), 0)
for _ in range(I()):
    name, v = S(), I()
    a[name] += v
values = sorted(set(a.values()))
names = [k for k, v in a.items() if len(values) > 1 and v == values[1]]
print(names[0] if len(names) == 1 else "Tie")
