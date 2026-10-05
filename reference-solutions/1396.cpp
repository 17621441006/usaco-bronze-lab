#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    ll m;
    string s;
    cin >> n >> m >> s;
    vector<ll> a(n);
    ll ans = 0;
    for (ll& x : a) {
        cin >> x;
        ans += x;
    }
    int start = -1;
    for (int i = 0; i < n; i++)
        if (s[i] != s[(i + n - 1) % n]) {
            start = i;
            break;
        }
    if (start != -1)
        for (int i = 0; i < n;) {
            int j = i + 1;
            char dir = s[(start + i) % n];
            ll sum = a[(start + i) % n];
            while (j < n && s[(start + j) % n] == dir) {
                sum += a[(start + j) % n];
                j++;
            }
            ll end = dir == 'R' ? a[(start + j - 1) % n] : a[(start + i) % n];
            ans -= min(m, sum - end);
            i = j;
        }
    cout << ans << '\n';
    return 0;
}
