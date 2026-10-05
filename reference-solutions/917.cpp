#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("traffic.in").good()) {
        freopen("traffic.in", "r", stdin);
        freopen("traffic.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<tuple<string, int, int>> a(n);
    for (auto& [s, x, y] : a) cin >> s >> x >> y;
    auto solve = [&](bool rev) {
        int lo = 0, hi = 1000000000;
        for (int k = 0; k < n; k++) {
            auto [s, x, y] = a[rev ? n - 1 - k : k];
            if (s == "none") {
                lo = max(lo, x);
                hi = min(hi, y);
            } else if ((s == "on") != rev) {
                lo += x;
                hi += y;
            } else {
                lo = max(0, lo - y);
                hi -= x;
            }
        }
        cout << lo << ' ' << hi << '\n';
    };
    solve(true);
    solve(false);
    return 0;
}
