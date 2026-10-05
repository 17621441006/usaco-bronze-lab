import sys, itertools

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
blocks = [set(S()) for _ in range(4)]
for _ in range(n):
    w = S()
    ok = any(
        all(c in blocks[j] for c, j in zip(w, order))
        for order in itertools.permutations(range(4), len(w))
    )
    print("YES" if ok else "NO")
