#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("speeding.in").good()) {
        freopen("speeding.in", "r", stdin);
        freopen("speeding.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> a, b;
    for (int i = 0, l, v; i < n; i++) {
        cin >> l >> v;
        a.insert(a.end(), l, v);
    }
    for (int i = 0, l, v; i < m; i++) {
        cin >> l >> v;
        b.insert(b.end(), l, v);
    }
    int ans = 0;
    for (int i = 0; i < 100; i++) ans = max(ans, b[i] - a[i]);
    cout << ans << '\n';
    return 0;
}
