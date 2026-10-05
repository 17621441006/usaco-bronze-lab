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
        cin >> n;
        vector<string> a(n);
        for (auto& s : a) cin >> s;
        cin >> k;
        vector<string> b(k);
        for (auto& s : b) cin >> s;
        vector<vector<bool>> cover(n, vector<bool>(n));
        for (int rot = 0; rot < 4; rot++) {
            vector<pair<int, int>> cells;
            for (int x = 0; x < k; x++)
                for (int y = 0; y < k; y++)
                    if (b[x][y] == '*') cells.emplace_back(x, y);
            for (int r = 0; r + k <= n; r++)
                for (int c = 0; c + k <= n; c++) {
                    bool ok = true;
                    for (auto [x, y] : cells) ok &= a[r + x][c + y] == '*';
                    if (ok)
                        for (auto [x, y] : cells) cover[r + x][c + y] = true;
                }
            auto next = b;
            for (int x = 0; x < k; x++)
                for (int y = 0; y < k; y++) next[x][y] = b[k - 1 - y][x];
            b = next;
        }
        bool ok = true;
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) ok &= (a[r][c] == '*') == cover[r][c];
        cout << (ok ? "YES" : "NO") << '\n';
    }
    return 0;
}
