import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    n = I()
    a = [I() for _ in range(n)]
    constant = 0
    coef = 0
    upper = min(a)
    ok = True
    for h in a[:-1]:
        constant = h - constant
        coef = -1 - coef
        if coef == -1:
            upper = min(upper, constant)
        elif constant < 0:
            ok = False
    end = a[-1] - constant
    finalcoef = -1 - coef
    f = end if finalcoef == -1 else upper
    if finalcoef == 0 and end != 0:
        ok = False
    if f < 0 or f > upper:
        ok = False
    print(sum(a) - n * f if ok else -1)
