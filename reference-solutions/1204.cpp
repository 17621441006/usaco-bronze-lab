#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), pos(n + 1);
    for (int& x : a) cin >> x;
    for (int i = 0, v; i < n; i++) {
        cin >> v;
        pos[v] = i;
    }
    int mx = -1, ans = 0;
    for (int v : a) {
        ans += pos[v] < mx;
        mx = max(mx, pos[v]);
    }
    cout << ans << '\n';
    return 0;
}
