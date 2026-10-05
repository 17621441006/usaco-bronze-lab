import sys
from bisect import bisect_right

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = sorted(I() for _ in range(n))
b = sorted(I() for _ in range(n))
ans = 1
for i, v in enumerate(b):
    ans *= max(0, bisect_right(a, v) - i)
print(ans)
