import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, k = I(), I()
a = [I() for _ in range(n)]
print(k + 1 + sum(min(k + 1, y - x) for x, y in zip(a, a[1:])))
