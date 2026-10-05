import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
prev = prevdiff = 0
ans = 0
for _ in range(n):
    value = I()
    diff = value - prev
    ans += abs(diff - prevdiff)
    prev = value
    prevdiff = diff
print(ans)
