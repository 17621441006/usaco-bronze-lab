#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<ll> a(n);
    for (ll& x : a) cin >> x;
    while (m--) {
        ll top;
        cin >> top;
        ll bottom = 0;
        for (int i = 0; i < n && bottom < top; i++) {
            ll eat = max(0LL, min(top, a[i]) - bottom);
            a[i] += eat;
            bottom += eat;
        }
    }
    for (ll x : a) cout << x << '\n';
    return 0;
}
