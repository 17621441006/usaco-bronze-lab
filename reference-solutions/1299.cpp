#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll t;
    cin >> n >> t;
    ll free = 1, ans = 0;
    while (n--) {
        ll day, b;
        cin >> day >> b;
        ll start = max(day, free), end = min(t + 1, start + b);
        ans += max(0LL, end - start);
        free = start + b;
    }
    cout << ans << '\n';
    return 0;
}
