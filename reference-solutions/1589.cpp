#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, m;
        string t;
        cin >> n >> m >> t;
        vector<string> a(n);
        vector<vector<int>> pos(26);
        for (int r = 0; r < n; r++) {
            cin >> a[r];
            for (int c = 0; c < m; c++) pos[a[r][c] - 'a'].push_back(r * m + c);
        }
        vector<array<int, 4>> ops;
        auto sw = [&](int r, int c, int u, int v) {
            if (r == u && c == v) return;
            char x = a[r][c], y = a[u][v];
            swap(a[r][c], a[u][v]);
            pos[x - 'a'].push_back(u * m + v);
            pos[y - 'a'].push_back(r * m + c);
            if (r == u)
                ops.push_back({1, r + 1, c + 1, v + 1});
            else
                ops.push_back({2, r + 1, u + 1, c + 1});
        };
        for (int c = 0; c < m; c++)
            if (a[0][c] != t[c]) {
                auto& b = pos[t[c] - 'a'];
                while (!b.empty()) {
                    int p = b.back();
                    if (p < c || a[p / m][p % m] != t[c])
                        b.pop_back();
                    else
                        break;
                }
                int p = b.back();
                b.pop_back();
                int r = p / m, j = p % m;
                if (r == 0)
                    sw(0, j, 0, c);
                else {
                    sw(r, j, r, c);
                    sw(r, c, 0, c);
                }
            }
        cout << ops.size() << '\n';
        for (auto v : ops)
            cout << v[0] << ' ' << v[1] << ' ' << v[2] << ' ' << v[3] << '\n';
    }
    return 0;
}
