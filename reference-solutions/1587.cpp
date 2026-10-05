#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, k;
        cin >> n >> k;
        vector<int> f(n + 1);
        for (int i = 0, x; i < n; i++) {
            cin >> x;
            if (k < 0) x = n + 1 - x;
            f[x]++;
        }
        k = abs(k);
        ll ans = 0;
        for (int r = 1; r <= k; r++) {
            ll pos = r;
            int carry = 0;
            while (pos <= n || carry) {
                if (pos <= n) carry += f[pos];
                carry = max(0, carry - 1);
                ans += carry;
                pos += k;
            }
        }
        cout << ans << '\n';
    }
    return 0;
}
