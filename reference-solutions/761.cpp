#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("measurement.in").good()) {
        freopen("measurement.in", "r", stdin);
        freopen("measurement.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<tuple<int, string, int>> a(n);
    for (auto& [d, s, v] : a) cin >> d >> s >> v;
    sort(a.begin(), a.end());
    map<string, int> m{{"Bessie", 7}, {"Elsie", 7}, {"Mildred", 7}};
    set<string> old{"Bessie", "Elsie", "Mildred"};
    int ans = 0;
    for (auto [d, s, v] : a) {
        m[s] += v;
        int mx = 0;
        for (auto p : m) mx = max(mx, p.second);
        set<string> now;
        for (auto p : m)
            if (p.second == mx) now.insert(p.first);
        ans += now != old;
        old = now;
    }
    cout << ans << '\n';
    return 0;
}
