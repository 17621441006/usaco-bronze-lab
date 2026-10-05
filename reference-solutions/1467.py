import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


for _ in range(I()):
    n, A, B = I(), I(), I()
    a = [S() for _ in range(n)]
    stars = [bytearray(n) for _ in range(n)]
    ok = True
    if A == B == 0:
        print(sum(c != "W" for row in a for c in row))
        continue
    for r in range(n):
        for c in range(n):
            if a[r][c] == "B":
                if r < B or c < A:
                    ok = False
                else:
                    stars[r][c] = stars[r - B][c - A] = 1
    for r in range(n):
        for c in range(n):
            if a[r][c] == "W" and stars[r][c]:
                ok = False
            elif (
                a[r][c] == "G"
                and not stars[r][c]
                and not (r >= B and c >= A and stars[r - B][c - A])
            ):
                stars[r][c] = 1
    print(sum(map(sum, stars)) if ok else -1)
