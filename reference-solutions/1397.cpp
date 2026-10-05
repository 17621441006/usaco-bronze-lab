#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<ll> a(n);
    for (ll& x : a) cin >> x;
    for (ll& x : a) {
        ll t;
        cin >> t;
        x -= t;
    }
    sort(a.rbegin(), a.rend());
    while (q--) {
        int v;
        ll s;
        cin >> v >> s;
        cout << (a[v - 1] > s ? "YES" : "NO") << '\n';
    }
    return 0;
}
