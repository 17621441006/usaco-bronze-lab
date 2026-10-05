#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<ll> a(min(n, 31));
    for (int i = 0; i < n; i++) {
        ll x;
        cin >> x;
        if (i < 31) a[i] = x;
    }
    for (int i = 1; i < (int)a.size(); i++) a[i] = min(a[i], 2 * a[i - 1]);
    while (q--) {
        ll x;
        cin >> x;
        ll cost = 0, best = LLONG_MAX;
        for (int i = (int)a.size() - 1; i >= 0; i--) {
            ll size = 1LL << i;
            cost += x / size * a[i];
            x %= size;
            best = min(best, cost + (x ? a[i] : 0));
        }
        cout << best << '\n';
    }
    return 0;
}
