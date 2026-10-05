#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("angry.in").good()) {
        freopen("angry.in", "r", stdin);
        freopen("angry.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& v : a) cin >> v;
    sort(a.begin(), a.end());
    auto reach = [&](int p, int d) {
        int r = 1;
        while (true) {
            int q = p;
            while (q + d >= 0 && q + d < n && abs(a[q + d] - a[p]) <= r) q += d;
            if (q == p) return p;
            p = q;
            r++;
        }
    };
    int ans = 0;
    for (int i = 0; i < n; i++) ans = max(ans, reach(i, 1) - reach(i, -1) + 1);
    cout << ans << '\n';
    return 0;
}
