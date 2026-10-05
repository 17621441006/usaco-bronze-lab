#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("race.in").good()) {
        freopen("race.in", "r", stdin);
        freopen("race.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    ll k;
    int n;
    cin >> k >> n;
    while (n--) {
        ll x;
        cin >> x;
        ll lo = 1, hi = 2 * k;
        while (lo < hi) {
            ll t = (lo + hi) / 2, m = min(t, (x + t) / 2), r = t - m;
            ll distance = m * (m + 1) / 2 + r * (x + t) - (m + 1 + t) * r / 2;
            if (distance >= k)
                hi = t;
            else
                lo = t + 1;
        }
        cout << lo << '\n';
    }
    return 0;
}
