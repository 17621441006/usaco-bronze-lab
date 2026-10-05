import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
ans = 0
for l in range(n):
    total = 0
    values = set()
    for r in range(l, n):
        total += a[r]
        values.add(a[r])
        length = r - l + 1
        ans += total % length == 0 and total // length in values
print(ans)
