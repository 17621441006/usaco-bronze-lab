import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
b = [I() for _ in range(n)]
same = [int(x == y) for x, y in zip(a, b)]
base = sum(same)
ans = [0] * (n + 1)
for center in range(2 * n - 1):
    l = center // 2
    r = (center + 1) // 2
    score = base
    while l >= 0 and r < n:
        if l != r:
            score += (a[l] == b[r]) + (a[r] == b[l]) - same[l] - same[r]
        ans[score] += 1
        l -= 1
        r += 1
print(*ans, sep="\n")
