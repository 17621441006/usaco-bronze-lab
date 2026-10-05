#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("badmilk.in").good()) {
        freopen("badmilk.in", "r", stdin);
        freopen("badmilk.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, d, s;
    cin >> n >> m >> d >> s;
    vector<array<int, 3>> a(d);
    vector<pair<int, int>> b(s);
    for (auto& v : a) cin >> v[0] >> v[1] >> v[2];
    for (auto& v : b) cin >> v.first >> v.second;
    int ans = 0;
    for (int milk = 1; milk <= m; milk++) {
        bool ok = true;
        set<int> people;
        for (auto v : a)
            if (v[1] == milk) people.insert(v[0]);
        for (auto [p, t] : b) {
            bool found = false;
            for (auto v : a)
                if (v[0] == p && v[1] == milk && v[2] < t) found = true;
            ok &= found;
        }
        if (ok) ans = max(ans, (int)people.size());
    }
    cout << ans << '\n';
    return 0;
}
