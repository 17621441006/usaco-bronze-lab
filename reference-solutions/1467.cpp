#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, A, B;
        cin >> n >> A >> B;
        vector<string> a(n);
        for (auto& s : a) cin >> s;
        vector<vector<int>> star(n, vector<int>(n));
        bool ok = true;
        if (A == 0 && B == 0) {
            int ans = 0;
            for (auto s : a)
                for (char c : s) ans += c != 'W';
            cout << ans << '\n';
            continue;
        }
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                if (a[r][c] == 'B') {
                    if (r < B || c < A)
                        ok = false;
                    else
                        star[r][c] = star[r - B][c - A] = 1;
                }
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                if (a[r][c] == 'W' && star[r][c])
                    ok = false;
                else if (a[r][c] == 'G' && !star[r][c] &&
                         !(r >= B && c >= A && star[r - B][c - A]))
                    star[r][c] = 1;
            }
        int ans = 0;
        for (auto row : star)
            for (int v : row) ans += v;
        cout << (ok ? ans : -1) << '\n';
    }
    return 0;
}
