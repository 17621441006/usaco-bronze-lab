#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k, q;
    cin >> n >> k >> q;
    int size = n - k + 1;
    vector<vector<ll>> a(n, vector<ll>(n)), w(size, vector<ll>(size));
    ll best = 0;
    while (q--) {
        int r, c;
        ll v;
        cin >> r >> c >> v;
        --r;
        --c;
        ll delta = v - a[r][c];
        a[r][c] = v;
        for (int x = max(0, r - k + 1); x <= min(r, size - 1); x++)
            for (int y = max(0, c - k + 1); y <= min(c, size - 1); y++) {
                w[x][y] += delta;
                best = max(best, w[x][y]);
            }
        cout << best << '\n';
    }
    return 0;
}
