import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
b = [I() for _ in range(n)]
prev = 0
ans = 0
for x, y in zip(a, b):
    d = x - y
    ans += max(0, abs(d) - (abs(prev) if d * prev > 0 else 0))
    prev = d
print(ans)
