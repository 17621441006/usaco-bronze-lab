import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n, q = I(), I()
a = [bytearray(1 if c == "#" else 0 for c in S()) for _ in range(n)]
h = n // 2
count = [0] * (h * h)


def group(r, c):
    return min(r, n - 1 - r) * h + min(c, n - 1 - c)


for r in range(n):
    for c in range(n):
        count[group(r, c)] += a[r][c]
ans = sum(min(v, 4 - v) for v in count)
out = [str(ans)]
for _ in range(q):
    r, c = I() - 1, I() - 1
    g = group(r, c)
    ans -= min(count[g], 4 - count[g])
    count[g] += 1 - 2 * a[r][c]
    a[r][c] ^= 1
    ans += min(count[g], 4 - count[g])
    out.append(str(ans))
print("\n".join(out))
