#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("billboard.in").good()) {
        freopen("billboard.in", "r", stdin);
        freopen("billboard.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    array<int, 4> a[3];
    for (auto& r : a)
        for (int& x : r) cin >> x;
    int ans = 0;
    for (int i = 0; i < 2; i++)
        ans += (a[i][2] - a[i][0]) * (a[i][3] - a[i][1]) -
               max(0, min(a[i][2], a[2][2]) - max(a[i][0], a[2][0])) *
                   max(0, min(a[i][3], a[2][3]) - max(a[i][1], a[2][1]));
    cout << ans << '\n';
    return 0;
}
