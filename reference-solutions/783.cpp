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
    int x, y, X, Y, a, b, c, d;
    cin >> x >> y >> X >> Y >> a >> b >> c >> d;
    if (b <= y && d >= Y) {
        if (a <= x)
            x = min(X, max(x, c));
        else if (c >= X)
            X = max(x, min(X, a));
    }
    if (a <= x && c >= X) {
        if (b <= y)
            y = min(Y, max(y, d));
        else if (d >= Y)
            Y = max(y, min(Y, b));
    }
    cout << (X - x) * (Y - y) << '\n';
    return 0;
}
