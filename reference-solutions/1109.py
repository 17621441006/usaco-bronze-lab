import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    s = S()
    x = y = area = 0
    for c in s:
        dx, dy = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}[c]
        nx, ny = x + dx, y + dy
        area += x * ny - y * nx
        x, y = nx, ny
    print("CW" if area < 0 else "CCW")
