import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


occupied = set()
ans = 0
dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]


def comfy(p):
    return (
        p in occupied
        and sum((p[0] + dx, p[1] + dy) in occupied for dx, dy in dirs) == 3
    )


for _ in range(I()):
    x, y = I(), I()
    affected = [(x, y)] + [(x + dx, y + dy) for dx, dy in dirs]
    ans -= sum(comfy(p) for p in affected)
    occupied.add((x, y))
    ans += sum(comfy(p) for p in affected)
    print(ans)
