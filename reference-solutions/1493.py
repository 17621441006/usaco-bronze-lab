import sys, itertools

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def one(a):
    return not a or min(a) == max(a)


def two(a):
    runs = [(v, len(list(g))) for v, g in itertools.groupby(a)]
    return (
        len(runs) <= 2
        or len(runs) % 2 == 0
        and all(runs[i] == runs[i % 2] for i in range(2, len(runs)))
    )


for _ in range(I()):
    n, k = I(), I()
    a = [I() for _ in range(n)]
    ok = one(a) if k == 1 else two(a)
    if k == 3 and not ok:
        for length in range(1, n + 1):
            if n % length or any(a[i] != a[i % length] for i in range(length, n)):
                continue
            block = a[:length]
            if any(
                one(block[:cut])
                and two(block[cut:])
                or two(block[:cut])
                and one(block[cut:])
                for cut in range(length + 1)
            ):
                ok = True
                break
    print("YES" if ok else "NO")
