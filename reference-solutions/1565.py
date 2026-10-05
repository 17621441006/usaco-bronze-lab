import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n, q = I(), I()
prices = [I() for _ in range(n)][:31]
for i in range(1, len(prices)):
    prices[i] = min(prices[i], 2 * prices[i - 1])
for _ in range(q):
    remaining = I()
    cost = 0
    best = 10**30
    for i in range(len(prices) - 1, -1, -1):
        take, remaining = divmod(remaining, 1 << i)
        cost += take * prices[i]
        best = min(best, cost + (prices[i] if remaining else 0))
    print(best)
