#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("gymnastics.in").good()) {
        freopen("gymnastics.in", "r", stdin);
        freopen("gymnastics.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int k, n;
    cin >> k >> n;
    vector<vector<int>> p(k, vector<int>(n + 1));
    for (int i = 0; i < k; i++)
        for (int j = 0, x; j < n; j++) {
            cin >> x;
            p[i][x] = j;
        }
    int ans = 0;
    for (int x = 1; x <= n; x++)
        for (int y = 1; y <= n; y++)
            if (x != y) {
                bool ok = true;
                for (int i = 0; i < k; i++) ok &= p[i][x] < p[i][y];
                ans += ok;
            }
    cout << ans << '\n';
    return 0;
}
