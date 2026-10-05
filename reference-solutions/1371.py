import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n = I()
    a = [I() for _ in range(n)]
    ans = set()
    for i, x in enumerate(a):
        if i + 1 < n and a[i + 1] == x or i + 2 < n and a[i + 2] == x:
            ans.add(x)
    print(*sorted(ans)) if ans else print(-1)
