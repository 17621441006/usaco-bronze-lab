import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, k = I(), I()
size = 1 << n
score = [0] * size
for _ in range(k):
    x, y, z = 1 << (I() - 1), 1 << (I() - 1), 1 << (I() - 1)
    score[x] += 1
    score[x | y] -= 1
    score[x | z] -= 1
    score[x | y | z] += 1
bit = 1
while bit < size:
    for base in range(0, size, bit * 2):
        for j in range(base, base + bit):
            score[j + bit] += score[j]
    bit *= 2
best = max(score)
print(best, score.count(best))
