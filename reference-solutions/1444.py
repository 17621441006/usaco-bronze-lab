import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, q = I(), I()
x = [0] * (n * n)
y = [0] * (n * n)
z = [0] * (n * n)
ans = 0
out = []
for _ in range(q):
    a, b, c = I(), I(), I()
    u = b * n + c
    v = a * n + c
    w = a * n + b
    x[u] += 1
    y[v] += 1
    z[w] += 1
    ans += (x[u] == n) + (y[v] == n) + (z[w] == n)
    out.append(str(ans))
print("\n".join(out))
