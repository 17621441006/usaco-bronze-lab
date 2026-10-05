import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
pos = {I(): i for i in range(n)}
mx = -1
ans = 0
for v in a:
    x = pos[v]
    ans += x < mx
    mx = max(mx, x)
print(ans)
