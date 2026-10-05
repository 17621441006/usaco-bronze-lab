#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("cowqueue.in").good()) {
        freopen("cowqueue.in", "r", stdin);
        freopen("cowqueue.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<int, int>> a(n);
    for (auto& p : a) cin >> p.first >> p.second;
    sort(a.begin(), a.end());
    ll t = 0;
    for (auto [x, y] : a) t = max(t, (ll)x) + y;
    cout << t << '\n';
    return 0;
}
