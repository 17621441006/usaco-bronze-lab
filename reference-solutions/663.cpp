#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("square.in").good()) {
        freopen("square.in", "r", stdin);
        freopen("square.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int a, b, c, d, e, f, g, h;
    cin >> a >> b >> c >> d >> e >> f >> g >> h;
    int s = max(max(c, g) - min(a, e), max(d, h) - min(b, f));
    cout << s * s << '\n';
    return 0;
}
