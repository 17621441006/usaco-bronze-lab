import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, q = I(), I()
c = [I() for _ in range(n)]
travel = [I() for _ in range(n)]
latest = sorted((x - y for x, y in zip(c, travel)), reverse=True)
for _ in range(q):
    v, s = I(), I()
    print("YES" if latest[v - 1] > s else "NO")
