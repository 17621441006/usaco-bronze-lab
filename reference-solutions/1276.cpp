#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    int need[101] = {};
    for (int i = 0, l, r, c; i < n; i++) {
        cin >> l >> r >> c;
        for (int j = l; j <= r; j++) need[j] = c;
    }
    vector<array<int, 4>> a(m);
    for (auto& v : a)
        for (int& x : v) cin >> x;
    int best = INT_MAX;
    for (int mask = 0; mask < (1 << m); mask++) {
        int cool[101] = {}, cost = 0;
        for (int i = 0; i < m; i++)
            if (mask >> i & 1) {
                auto [l, r, p, c] = a[i];
                cost += c;
                for (int j = l; j <= r; j++) cool[j] += p;
            }
        bool ok = true;
        for (int j = 0; j <= 100; j++) ok &= cool[j] >= need[j];
        if (ok) best = min(best, cost);
    }
    cout << best << '\n';
    return 0;
}
