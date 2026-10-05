#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    vector<int> l(n), r(n);
    int last[256];
    fill(last, last + 256, -1);
    for (int i = 0; i < n; i++) {
        l[i] = i - last[(int)s[i]] - 1;
        last[(int)s[i]] = i;
    }
    fill(last, last + 256, n);
    for (int i = n - 1; i >= 0; i--) {
        r[i] = last[(int)s[i]] - i - 1;
        last[(int)s[i]] = i;
    }
    ll ans = 0;
    for (int i = 0; i < n; i++)
        ans += 1LL * l[i] * r[i] + max(0, l[i] - 1) + max(0, r[i] - 1);
    cout << ans << '\n';
    return 0;
}
