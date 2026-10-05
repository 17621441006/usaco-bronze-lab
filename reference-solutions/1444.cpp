#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> x(n * n), y(n * n), z(n * n);
    int ans = 0;
    while (q--) {
        int a, b, c;
        cin >> a >> b >> c;
        ans += (++x[b * n + c] == n) + (++y[a * n + c] == n) + (++z[a * n + b] == n);
        cout << ans << '\n';
    }
    return 0;
}
