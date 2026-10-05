import sys
import os

if os.path.exists("sleepy.in"):
    sys.stdin = open("sleepy.in")
    sys.stdout = open("sleepy.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = [I() for _ in range(n)]
i = n - 1
while i > 0 and a[i - 1] < a[i]:
    i -= 1
print(i)
