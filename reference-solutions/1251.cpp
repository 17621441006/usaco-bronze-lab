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
    sort(a.begin(), a.end());
    ll best = 0, price = 0;
    for (int i = 0; i < n; i++) {
        ll value = a[i] * (n - i);
        if (value > best) {
            best = value;
            price = a[i];
        }
    }
    cout << best << ' ' << price << '\n';
    return 0;
}
