import sys, itertools

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def beats(a, b):
    return sum((x > y) - (x < y) for x in a for y in b) > 0


for _ in range(I()):
    a = [I() for _ in range(4)]
    b = [I() for _ in range(4)]
    ok = False
    if beats(b, a):
        a, b = b, a
    if beats(a, b):
        ok = any(
            beats(b, c) and beats(c, a)
            for c in itertools.combinations_with_replacement(range(1, 11), 4)
        )
    print("yes" if ok else "no")
