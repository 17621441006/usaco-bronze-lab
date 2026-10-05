import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
odd = sum(I() % 2 for _ in range(n))
even = n - odd
while odd > even:
    odd -= 2
    even += 1
if odd < 0:
    print(even - 1)
else:
    print(2 * odd + min(1, even - odd))
