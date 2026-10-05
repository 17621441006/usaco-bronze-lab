import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


for _ in range(I()):
    a, b, ca, cb, target = I(), I(), I(), I(), I()
    current = a + b // cb * ca
    if current >= target:
        print(0)
        continue
    extra_a = target - current - 1
    extra_b = cb - 1 - b % cb
    cycles = extra_a // ca if cb > ca else 0
    print(extra_a + extra_b + cycles * (cb - ca) + 1)
