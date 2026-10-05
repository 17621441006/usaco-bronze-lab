#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("shell.in").good()) {
        freopen("shell.in", "r", stdin);
        freopen("shell.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<array<int, 3>> a(n);
    for (auto& v : a) cin >> v[0] >> v[1] >> v[2];
    int ans = 0;
    for (int s = 1; s <= 3; s++) {
        int p = s, score = 0;
        for (auto v : a) {
            if (p == v[0])
                p = v[1];
            else if (p == v[1])
                p = v[0];
            score += p == v[2];
        }
        ans = max(ans, score);
    }
    cout << ans << '\n';
    return 0;
}
