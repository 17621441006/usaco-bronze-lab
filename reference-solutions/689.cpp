#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("cowtip.in").good()) {
        freopen("cowtip.in", "r", stdin);
        freopen("cowtip.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<string> a(n);
    for (auto& s : a) cin >> s;
    int ans = 0;
    for (int r = n - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--)
            if (a[r][c] == '1') {
                ans++;
                for (int i = 0; i <= r; i++)
                    for (int j = 0; j <= c; j++) a[i][j] = (a[i][j] == '1' ? '0' : '1');
            }
    cout << ans << '\n';
    return 0;
}
