import sys
from collections import defaultdict

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n, m = I(), I()
    target = S()
    grid = [list(S()) for _ in range(n)]
    positions = defaultdict(list)
    ops = []
    for r in range(n):
        for c in range(m):
            positions[grid[r][c]].append(r * m + c)

    def swap(r, c, u, v):
        if r == u and c == v:
            return
        a, b = grid[r][c], grid[u][v]
        grid[r][c], grid[u][v] = b, a
        positions[a].append(u * m + v)
        positions[b].append(r * m + c)
        ops.append((1, r + 1, c + 1, v + 1) if r == u else (2, r + 1, u + 1, c + 1))

    for c, wanted in enumerate(target):
        if grid[0][c] == wanted:
            continue
        bucket = positions[wanted]
        while bucket:
            code = bucket[-1]
            r, j = divmod(code, m)
            if code < c or grid[r][j] != wanted:
                bucket.pop()
            else:
                break
        r, j = divmod(bucket.pop(), m)
        if r == 0:
            swap(0, j, 0, c)
        else:
            swap(r, j, r, c)
            swap(r, c, 0, c)
    print(len(ops))
    for op in ops:
        print(*op)
