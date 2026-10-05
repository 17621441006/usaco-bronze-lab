import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, t = I(), I()
free = 1
ans = 0
for _ in range(n):
    day, bales = I(), I()
    start = max(day, free)
    end = min(t + 1, start + bales)
    ans += max(0, end - start)
    free = start + bales
print(ans)
