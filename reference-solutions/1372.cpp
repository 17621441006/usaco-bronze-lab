#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, pos;
    cin >> n >> pos;
    --pos;
    vector<pair<int, int>> a(n);
    for (auto& p : a) cin >> p.first >> p.second;
    ll power = 1;
    int dir = 1;
    set<tuple<int, ll, int>> seen;
    set<int> broken;
    while (pos >= 0 && pos < n && seen.insert({pos, power, dir}).second) {
        auto [kind, v] = a[pos];
        if (kind == 0) {
            power += v;
            dir = -dir;
        } else if (power >= v)
            broken.insert(pos);
        ll next = pos + power * dir;
        if (next < 0 || next >= n) break;
        pos = next;
    }
    cout << broken.size() << '\n';
    return 0;
}
