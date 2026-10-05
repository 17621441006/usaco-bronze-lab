import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    s = S()
    values = [
        len(s) - 3 + (s[i] != "M") + (s[i + 2] != "O")
        for i in range(len(s) - 2)
        if s[i + 1] == "O"
    ]
    print(min(values, default=-1))
