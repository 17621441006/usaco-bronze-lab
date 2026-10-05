import sys

it = iter(sys.stdin.read().split())


def S():
    return next(it)


order = S()
word = S()
p = {c: i for i, c in enumerate(order)}
print(1 + sum(p[a] >= p[b] for a, b in zip(word, word[1:])))
