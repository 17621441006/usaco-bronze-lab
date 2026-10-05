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
        vector<ll> a(n);
        for (ll& x : a) cin >> x;
        ll c = 0, coef = 0, upper = *min_element(a.begin(), a.end());
        bool ok = true;
        for (int i = 0; i < n - 1; i++) {
            c = a[i] - c;
            coef = -1 - coef;
            if (coef == -1)
                upper = min(upper, c);
            else if (c < 0)
                ok = false;
        }
        ll end = a.back() - c, finalcoef = -1 - coef, f = finalcoef == -1 ? end : upper;
        if (finalcoef == 0 && end != 0) ok = false;
        if (f < 0 || f > upper) ok = false;
        cout << (ok ? accumulate(a.begin(), a.end(), 0LL) - n * f : -1) << '\n';
    }
    return 0;
}
