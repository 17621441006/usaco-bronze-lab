#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<ll> a(n);
    for (ll& x : a) cin >> x;
    ll ans = 0, prev = 0;
    for (int i = 0; i < n; i++) {
        ll b;
        cin >> b;
        ll d = a[i] - b;
        ans += max(0LL, llabs(d) - (d * prev > 0 ? llabs(prev) : 0));
        prev = d;
    }
    cout << ans << '\n';
    return 0;
}
