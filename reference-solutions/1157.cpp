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
        vector<string> a(n);
        for (auto& s : a) cin >> s;
        if (a[0][0] == 'H' || a[n - 1][n - 1] == 'H') {
            cout << 0 << '\n';
            continue;
        }
        if (n == 1) {
            cout << 1 << '\n';
            continue;
        }
        vector dp(n, vector(n, vector<array<ll, 2>>(k + 1)));
        if (a[0][1] == '.') dp[0][1][0][0] = 1;
        if (a[1][0] == '.') dp[1][0][0][1] = 1;
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                if (a[r][c] == '.')
                    for (int t = 0; t <= k; t++)
                        for (int d = 0; d < 2; d++)
                            for (int nd = 0; nd < 2; nd++) {
                                int R = r + (nd == 1), C = c + (nd == 0),
                                    nt = t + (d != nd);
                                if (R < n && C < n && nt <= k && a[R][C] == '.')
                                    dp[R][C][nt][nd] += dp[r][c][t][d];
                            }
        ll ans = 0;
        for (auto v : dp[n - 1][n - 1]) ans += v[0] + v[1];
        cout << ans << '\n';
    }
    return 0;
}
