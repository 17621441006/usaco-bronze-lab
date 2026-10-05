#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("lifeguards.in").good()) {
        freopen("lifeguards.in", "r", stdin);
        freopen("lifeguards.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<tuple<int, int, int>> ev;
    for (int i = 0, l, r; i < n; i++) {
        cin >> l >> r;
        ev.emplace_back(l, 1, i);
        ev.emplace_back(r, -1, i);
    }
    sort(ev.begin(), ev.end());
    set<int> active;
    vector<int> alone(n);
    int prev = get<0>(ev[0]), total = 0;
    for (auto [t, k, i] : ev) {
        if (!active.empty()) total += t - prev;
        if (active.size() == 1) alone[*active.begin()] += t - prev;
        if (k == 1)
            active.insert(i);
        else
            active.erase(i);
        prev = t;
    }
    cout << total - *min_element(alone.begin(), alone.end()) << '\n';
    return 0;
}
