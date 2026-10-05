#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("triangles.in").good()) {
        freopen("triangles.in", "r", stdin);
        freopen("triangles.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<int, int>> a(n);
    map<int, pair<int, int>> xs, ys;
    for (auto& [x, y] : a) {
        cin >> x >> y;
        if (!xs.count(x))
            xs[x] = {y, y};
        else {
            xs[x].first = min(xs[x].first, y);
            xs[x].second = max(xs[x].second, y);
        }
        if (!ys.count(y))
            ys[y] = {x, x};
        else {
            ys[y].first = min(ys[y].first, x);
            ys[y].second = max(ys[y].second, x);
        }
    }
    ll ans = 0;
    for (auto [x, y] : a)
        ans = max(ans, 1LL * max(y - xs[x].first, xs[x].second - y) *
                           max(x - ys[y].first, ys[y].second - x));
    cout << ans << '\n';
    return 0;
}
