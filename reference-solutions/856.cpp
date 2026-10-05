#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("blist.in").good()) {
        freopen("blist.in", "r", stdin);
        freopen("blist.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<int, int>> e;
    while (n--) {
        int s, t, b;
        cin >> s >> t >> b;
        e.emplace_back(s, b);
        e.emplace_back(t, -b);
    }
    sort(e.begin(), e.end());
    int cur = 0, ans = 0;
    for (auto [t, d] : e) {
        cur += d;
        ans = max(ans, cur);
    }
    cout << ans << '\n';
    return 0;
}
