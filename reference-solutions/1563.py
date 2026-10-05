import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


t, k = I(), I()
for _ in range(t):
    n = I()
    s = S()
    print("YES")
    if k:
        result = [""] * n
        flip = 0
        for i in range(n - 1, -1, -1):
            typed = (s[i] == "O") ^ flip
            result[i] = "O" if typed else "M"
            flip ^= typed
        print("".join(result))
