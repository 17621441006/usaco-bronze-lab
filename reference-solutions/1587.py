import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n, k = I(), I()
    a = [I() for _ in range(n)]
    if k < 0:
        a = [n + 1 - v for v in a]
        k = -k
    count = [0] * (n + 1)
    for v in a:
        count[v] += 1
    ans = 0
    for r in range(1, k + 1):
        pos = r
        carry = 0
        while pos <= n or carry:
            if pos <= n:
                carry += count[pos]
            carry = max(0, carry - 1)
            ans += carry
            pos += k
    print(ans)
