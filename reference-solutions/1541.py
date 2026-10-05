import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, k = I(), I()
q = I()
size = n - k + 1
value = [[0] * n for _ in range(n)]
windows = [[0] * size for _ in range(size)]
best = 0
out = []
for _ in range(q):
    r, c, v = I() - 1, I() - 1, I()
    delta = v - value[r][c]
    value[r][c] = v
    clo, chi = max(0, c - k + 1), min(c, size - 1)
    for x in range(max(0, r - k + 1), min(r, size - 1) + 1):
        row = windows[x]
        for y in range(clo, chi + 1):
            row[y] += delta
            if row[y] > best:
                best = row[y]
    out.append(str(best))
print("\n".join(out))
