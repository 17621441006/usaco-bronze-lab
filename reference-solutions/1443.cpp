#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        ll n, lo = 45, hi = 49, ans = 0;
        cin >> n;
        while (lo <= n) {
            ans += max(0LL, min(n, hi) - lo + 1);
            lo = lo * 10 - 5;
            hi = hi * 10 + 9;
        }
        cout << ans << '\n';
    }
    return 0;
}
