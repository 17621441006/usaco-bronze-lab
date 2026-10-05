#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll k;
    cin >> n >> k;
    vector<ll> a(n);
    for (ll& x : a) cin >> x;
    ll ans = k + 1;
    for (int i = 1; i < n; i++) ans += min(k + 1, a[i] - a[i - 1]);
    cout << ans << '\n';
    return 0;
}
