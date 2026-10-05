import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
s = S()
left = [0] * n
right = [0] * n
last = {}
for i, c in enumerate(s):
    left[i] = i - last.get(c, -1) - 1
    last[c] = i
last = {}
for i in range(n - 1, -1, -1):
    right[i] = last.get(s[i], n) - i - 1
    last[s[i]] = i
print(sum(l * r + max(0, l - 1) + max(0, r - 1) for l, r in zip(left, right)))
