#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("cbarn.in").good()) {
        freopen("cbarn.in", "r", stdin);
        freopen("cbarn.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& v : a) cin >> v;
    ll ans = LLONG_MAX;
    for (int s = 0; s < n; s++) {
        ll sum = 0;
        for (int k = 0; k < n; k++) sum += 1LL * k * a[(s + k) % n];
        ans = min(ans, sum);
    }
    cout << ans << '\n';
    return 0;
}
