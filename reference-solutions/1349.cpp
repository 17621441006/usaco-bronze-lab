#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        vector<ll> h(n), a(n);
        vector<int> p(n);
        for (ll& x : h) cin >> x;
        for (ll& x : a) cin >> x;
        for (int i = 0, r; i < n; i++) {
            cin >> r;
            p[r] = i;
        }
        ll lo = 0, hi = LLONG_MAX;
        for (int i = 1; i < n; i++) {
            int u = p[i - 1], v = p[i];
            ll g = a[u] - a[v], need = h[v] - h[u] + 1;
            if (g > 0) {
                if (need > 0) lo = max(lo, (need + g - 1) / g);
            } else if (g == 0) {
                if (need > 0) hi = -1;
            } else {
                ll num = -need, den = -g;
                if (num < 0)
                    hi = -1;
                else
                    hi = min(hi, num / den);
            }
        }
        cout << (lo <= hi ? lo : -1) << '\n';
    }
    return 0;
}
