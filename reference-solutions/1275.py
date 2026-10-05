import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
s = S()
end = [I() - 1 for _ in range(n)]
first = {c: s.index(c) for c in "GH"}
last = {c: s.rindex(c) for c in "GH"}
pairs = set()
for breed, other in [("G", "H"), ("H", "G")]:
    leader = first[breed]
    if end[leader] < last[breed]:
        continue
    for j, c in enumerate(s):
        if c == other and (
            (j == first[other] and end[j] >= last[other]) or j <= leader <= end[j]
        ):
            pairs.add(tuple(sorted((leader, j))))
print(len(pairs))
