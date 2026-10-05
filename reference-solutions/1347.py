import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, m = I(), I()
a = [I() for _ in range(n)]
for _ in range(m):
    height = I()
    bottom = 0
    for i in range(n):
        eaten = max(0, min(height, a[i]) - bottom)
        a[i] += eaten
        bottom += eaten
        if bottom == height:
            break
print(*a, sep="\n")
