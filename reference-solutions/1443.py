import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n = I()
    lo, hi = 45, 49
    ans = 0
    while lo <= n:
        ans += max(0, min(n, hi) - lo + 1)
        lo = lo * 10 - 5
        hi = hi * 10 + 9
    print(ans)
