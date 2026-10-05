import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, m = I(), I()
need = [0] * 101
for _ in range(n):
    l, r, c = I(), I(), I()
    for j in range(l, r + 1):
        need[j] = c
ac = [(I(), I(), I(), I()) for _ in range(m)]
best = 10**18
cool = [0] * 101
for mask in range(1 << m):
    cost = 0
    cool = [0] * 101
    for i, (l, r, p, c) in enumerate(ac):
        if mask >> i & 1:
            cost += c
            for j in range(l, r + 1):
                cool[j] += p
    if cost < best and all(cool[j] >= need[j] for j in range(101)):
        best = cost
print(best)
