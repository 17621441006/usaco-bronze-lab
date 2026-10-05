#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("pails.in").good()) {
        freopen("pails.in", "r", stdin);
        freopen("pails.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int x, y, m;
    cin >> x >> y >> m;
    int ans = 0;
    for (int i = 0; i * x <= m; i++) ans = max(ans, i * x + (m - i * x) / y * y);
    cout << ans << '\n';
    return 0;
}
