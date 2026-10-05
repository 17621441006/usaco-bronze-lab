#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), b(n), same(n);
    for (int& x : a) cin >> x;
    for (int& x : b) cin >> x;
    int base = 0;
    for (int i = 0; i < n; i++) {
        same[i] = a[i] == b[i];
        base += same[i];
    }
    vector<ll> ans(n + 1);
    for (int center = 0; center < 2 * n - 1; center++) {
        int l = center / 2, r = (center + 1) / 2, score = base;
        while (l >= 0 && r < n) {
            if (l != r) score += (a[l] == b[r]) + (a[r] == b[l]) - same[l] - same[r];
            ans[score]++;
            l--;
            r++;
        }
    }
    for (ll x : ans) cout << x << '\n';
    return 0;
}
