import sys

it = iter(sys.stdin.read().split())


def I():
    return int(next(it))


def S():
    return next(it)


zodiac = "Ox Tiger Rabbit Dragon Snake Horse Goat Monkey Rooster Dog Pig Rat".split()
year = {"Bessie": 0}
for _ in range(I()):
    who = S()
    S()
    S()
    direction = S()
    animal = S()
    S()
    S()
    base = S()
    step = -1 if direction == "previous" else 1
    value = year[base] + step
    while zodiac[value % 12] != animal:
        value += step
    year[who] = value
print(abs(year["Elsie"]))
