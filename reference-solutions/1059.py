import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


a = sorted(I() for _ in range(7))
print(a[0], a[1], a[-1] - a[0] - a[1])
