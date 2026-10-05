import sys
from collections import Counter

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
freq = Counter(I() for _ in range(n))
missing = 0
for x in range(n + 1):
    print(max(missing, freq[x]))
    missing += freq[x] == 0
