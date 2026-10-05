#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    ll prev = 0, dprev = 0, ans = 0;
    while (n--) {
        ll x;
        cin >> x;
        ll d = x - prev;
        ans += llabs(d - dprev);
        prev = x;
        dprev = d;
    }
    cout << ans << '\n';
    return 0;
}
