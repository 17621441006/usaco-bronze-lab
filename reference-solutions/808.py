import sys
import os

if os.path.exists("hoofball.in"):
    sys.stdin = open("hoofball.in")
    sys.stdout = open("hoofball.out", "w")

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


n = I()
a = sorted(I() for _ in range(n))
if n == 1:
    print(1)
else:
    nxt = [0] * n
    deg = [0] * n
    for i in range(n):
        j = (
            1
            if i == 0
            else (
                n - 2
                if i == n - 1
                else i - 1 if a[i] - a[i - 1] <= a[i + 1] - a[i] else i + 1
            )
        )
        nxt[i] = j
        deg[j] += 1
    ans = sum(v == 0 for v in deg)
    ans += sum(
        nxt[nxt[i]] == i and i < nxt[i] and deg[i] == deg[nxt[i]] == 1 for i in range(n)
    )
    print(ans)
