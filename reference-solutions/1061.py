import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


n = I()
a = [(S(), I(), I()) for _ in range(n)]
events = []
for i, (di, xi, yi) in enumerate(a):
    for j, (dj, xj, yj) in enumerate(a):
        if di != "E" or dj != "N":
            continue
        te, tn = xj - xi, yi - yj
        if te < 0 or tn < 0 or te == tn:
            continue
        if te > tn:
            events.append((te, tn, i, j))
        else:
            events.append((tn, te, j, i))
stop = [10**30] * n
for late, early, victim, blocker in sorted(events):
    if stop[victim] > late and stop[blocker] > early:
        stop[victim] = late
print(*(x if x < 10**30 else "Infinity" for x in stop), sep="\n")
