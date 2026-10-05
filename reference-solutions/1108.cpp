#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    set<pair<int, int>> a;
    int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1}, ans = 0;
    auto comfy = [&](pair<int, int> p) {
        if (!a.count(p)) return false;
        int c = 0;
        for (int k = 0; k < 4; k++) c += a.count({p.first + dx[k], p.second + dy[k]});
        return c == 3;
    };
    while (n--) {
        int x, y;
        cin >> x >> y;
        vector<pair<int, int>> v{{x, y}};
        for (int k = 0; k < 4; k++) v.push_back({x + dx[k], y + dy[k]});
        for (auto p : v) ans -= comfy(p);
        a.insert({x, y});
        for (auto p : v) ans += comfy(p);
        cout << ans << '\n';
    }
    return 0;
}
