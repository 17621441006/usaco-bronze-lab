#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("backforth.in").good()) {
        freopen("backforth.in", "r", stdin);
        freopen("backforth.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> a(10), b(10);
    for (int& x : a) cin >> x;
    for (int& x : b) cin >> x;
    set<int> ans;
    function<void(int, vector<int>, vector<int>, int)> dfs =
        [&](int day, vector<int> l, vector<int> r, int milk) {
            if (day == 4) {
                ans.insert(milk);
                return;
            }
            auto s = day % 2 ? r : l, d = day % 2 ? l : r;
            set<int> seen;
            for (int i = 0; i < (int)s.size(); i++)
                if (seen.insert(s[i]).second) {
                    auto u = s, v = d;
                    int x = u[i];
                    u.erase(u.begin() + i);
                    v.push_back(x);
                    if (day % 2)
                        dfs(day + 1, v, u, milk + x);
                    else
                        dfs(day + 1, u, v, milk - x);
                }
        };
    dfs(0, a, b, 1000);
    cout << ans.size() << '\n';
    return 0;
}
