import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n, k = I(), I()
    a = [S() for _ in range(n)]
    dp = [[[[0] * 2 for _ in range(k + 1)] for c in range(n)] for r in range(n)]
    if a[0][0] == "H" or a[-1][-1] == "H":
        print(0)
        continue
    if n == 1:
        print(1)
        continue
    if a[0][1] == ".":
        dp[0][1][0][0] = 1
    if a[1][0] == ".":
        dp[1][0][0][1] = 1
    for r in range(n):
        for c in range(n):
            if a[r][c] == "H":
                continue
            for turns in range(k + 1):
                for d in range(2):
                    value = dp[r][c][turns][d]
                    for nd, (dr, dc) in enumerate([(0, 1), (1, 0)]):
                        nr, nc = r + dr, c + dc
                        nt = turns + (nd != d)
                        if nr < n and nc < n and nt <= k and a[nr][nc] == ".":
                            dp[nr][nc][nt][nd] += value
    print(sum(sum(v) for v in dp[-1][-1]))
