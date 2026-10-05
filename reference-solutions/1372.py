import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, start = I(), I() - 1
a = [(I(), I()) for _ in range(n)]
power = 1
direction = 1
pos = start
seen = set()
broken = set()
while 0 <= pos < n and (pos, power, direction) not in seen:
    seen.add((pos, power, direction))
    kind, value = a[pos]
    if kind == 0:
        power += value
        direction = -direction
    elif power >= value:
        broken.add(pos)
    pos += power * direction
print(len(broken))
