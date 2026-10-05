import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n, m = I(), I()
s = S()
a = [I() for _ in range(n)]
ans = sum(a)
if len(set(s)) > 1:
    start = next(i for i in range(n) if s[i] != s[i - 1])
    groups = []
    i = 0
    while i < n:
        j = i + 1
        direction = s[(start + i) % n]
        values = [a[(start + i) % n]]
        while j < n and s[(start + j) % n] == direction:
            values.append(a[(start + j) % n])
            j += 1
        chain = sum(values) - (values[-1] if direction == "R" else values[0])
        ans -= min(m, chain)
        i = j
print(ans)
