import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = sorted(I() for _ in range(n))
best = price = 0
for i, v in enumerate(a):
    value = v * (n - i)
    if value > best:
        best = value
        price = v
print(best, price)
