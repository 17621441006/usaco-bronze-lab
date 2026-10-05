#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<string> a(n);
    for (auto& s : a) cin >> s;
    int h = n / 2;
    vector<int> count(h * h);
    auto group = [&](int r, int c) { return min(r, n - 1 - r) * h + min(c, n - 1 - c); };
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) count[group(r, c)] += a[r][c] == '#';
    int ans = 0;
    for (int v : count) ans += min(v, 4 - v);
    cout << ans << '\n';
    while (q--) {
        int r, c;
        cin >> r >> c;
        --r;
        --c;
        int g = group(r, c);
        ans -= min(count[g], 4 - count[g]);
        count[g] += a[r][c] == '#' ? -1 : 1;
        a[r][c] = a[r][c] == '#' ? '.' : '#';
        ans += min(count[g], 4 - count[g]);
        cout << ans << '\n';
    }
    return 0;
}
