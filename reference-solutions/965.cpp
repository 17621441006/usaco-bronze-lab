#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("lineup.in").good()) {
        freopen("lineup.in", "r", stdin);
        freopen("lineup.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<string, string>> q;
    while (n--) {
        string a, b, s;
        cin >> a;
        for (int i = 0; i < 4; i++) cin >> s;
        cin >> b;
        q.emplace_back(a, b);
    }
    vector<string> a = {"Bessie", "Buttercup", "Belinda", "Beatrice",
                        "Bella",  "Blue",      "Betsy",   "Sue"};
    sort(a.begin(), a.end());
    do {
        map<string, int> p;
        for (int i = 0; i < 8; i++) p[a[i]] = i;
        bool ok = true;
        for (auto [x, y] : q) ok &= abs(p[x] - p[y]) == 1;
        if (ok) {
            for (auto s : a) cout << s << '\n';
            break;
        }
    } while (next_permutation(a.begin(), a.end()));
    return 0;
}
