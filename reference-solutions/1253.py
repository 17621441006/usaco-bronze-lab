import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n, m = I(), I()
    a = [(S(), S()) for _ in range(m)]
    while a:
        removed = False
        for bit in range(n):
            for value in "01":
                outputs = {y for x, y in a if x[bit] == value}
                if len(outputs) == 1:
                    a = [(x, y) for x, y in a if x[bit] != value]
                    removed = True
                    break
            if removed:
                break
        if not removed:
            break
    print("OK" if not a else "LIE")
