import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n = I()
    h = [I() for _ in range(n)]
    a = [I() for _ in range(n)]
    rank = [I() for _ in range(n)]
    order = [0] * n
    for i, r in enumerate(rank):
        order[r] = i
    lo = 0
    hi = 10**30
    for u, v in zip(order, order[1:]):
        growth = a[u] - a[v]
        need = h[v] - h[u] + 1
        if growth > 0:
            lo = max(lo, -((-need) // growth))
        elif growth == 0:
            if need > 0:
                hi = -1
        else:
            hi = min(hi, (-need) // (-growth))
    print(lo if lo <= hi else -1)
