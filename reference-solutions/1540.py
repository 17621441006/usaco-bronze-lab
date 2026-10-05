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
    if n % 2:
        print(-1)
        continue
    half = len(s) // 2
    if s[:half] == s[half:]:
        print(1)
        print(*([1] * len(s)))
        continue
    mark = [1] * len(s)
    for i in range(0, half, 3):
        left, right = s[i : i + 3], s[i + half : i + half + 3]
        if left == right:
            continue
        found = False
        for u in range(3):
            for v in range(3):
                if left[:u] + left[u + 1 :] == right[:v] + right[v + 1 :]:
                    mark[i + u] = mark[i + half + v] = 2
                    found = True
                    break
            if found:
                break
    print(2)
    print(*mark)
