import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n = I()
    a = [I() for _ in range(n)]
    total = sum(a)
    if total == 0:
        print(0)
        continue
    for groups in range(n, 0, -1):
        if total % groups:
            continue
        target = total // groups
        cur = 0
        ok = True
        for v in a:
            cur += v
            if cur > target:
                ok = False
                break
            if cur == target:
                cur = 0
        if ok and cur == 0:
            print(n - groups)
            break
