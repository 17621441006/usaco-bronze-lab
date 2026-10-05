#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> z = {"Ox",   "Tiger",  "Rabbit",  "Dragon", "Snake", "Horse",
                        "Goat", "Monkey", "Rooster", "Dog",    "Pig",   "Rat"};
    map<string, int> year;
    year["Bessie"] = 0;
    int n;
    cin >> n;
    while (n--) {
        string who, t, dir, animal, base;
        cin >> who >> t >> t >> dir >> animal >> t >> t >> base;
        int step = dir == "previous" ? -1 : 1, v = year[base] + step;
        while (z[(v % 12 + 12) % 12] != animal) v += step;
        year[who] = v;
    }
    cout << abs(year["Elsie"]) << '\n';
    return 0;
}
