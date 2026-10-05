import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n = I()
    a = [S() for _ in range(n)]
    k = I()
    stamp = [S() for _ in range(k)]
    covered = [[False] * n for _ in range(n)]
    for rot in range(4):
        cells = [(r, c) for r in range(k) for c in range(k) if stamp[r][c] == "*"]
        for r in range(n - k + 1):
            for c in range(n - k + 1):
                if all(a[r + x][c + y] == "*" for x, y in cells):
                    for x, y in cells:
                        covered[r + x][c + y] = True
        stamp = ["".join(stamp[k - 1 - j][i] for j in range(k)) for i in range(k)]
    print(
        "YES"
        if all((a[r][c] == "*") == covered[r][c] for r in range(n) for c in range(n))
        else "NO"
    )
