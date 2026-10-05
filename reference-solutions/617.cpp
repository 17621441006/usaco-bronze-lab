#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("balancing.in").good()) {
        freopen("balancing.in", "r", stdin);
        freopen("balancing.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, b;
    cin >> n >> b;
    vector<pair<int, int>> a(n);
    for (auto& p : a) cin >> p.first >> p.second;
    int ans = n;
    for (auto px : a)
        for (auto py : a) {
            int c[4] = {};
            for (auto p : a)
                c[2 * (p.first > px.first + 1) + (p.second > py.second + 1)]++;
            ans = min(ans, *max_element(c, c + 4));
        }
    cout << ans << '\n';
    return 0;
}
