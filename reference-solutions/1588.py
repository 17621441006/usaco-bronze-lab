import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


MOD = 10**9 + 7
for _ in range(I()):
    s = S()
    extra = int(any(c not in "01" for c in s))
    prefix = 0
    for c in s[:-1]:
        prefix = (prefix * 2 + (ord(c) - 48) % 2) % MOD
    print((3 * prefix + (ord(s[-1]) - 48) % 2 + extra) % MOD)
