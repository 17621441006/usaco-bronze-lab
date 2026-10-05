import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n, k = I(), I()
    s = S()
    patch = ["."] * n
    reach = {"G": -1, "H": -1}
    count = 0
    for i, c in enumerate(s):
        if i <= reach[c]:
            continue
        pos = min(n - 1, i + k)
        if patch[pos] != ".":
            pos -= 1
        patch[pos] = c
        reach[c] = pos + k
        count += 1
    print(count)
    print("".join(patch))
