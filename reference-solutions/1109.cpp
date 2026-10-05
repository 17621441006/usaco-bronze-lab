#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        ll x = 0, y = 0, area = 0;
        for (char c : s) {
            ll X = x + (c == 'E') - (c == 'W'), Y = y + (c == 'N') - (c == 'S');
            area += x * Y - y * X;
            x = X;
            y = Y;
        }
        cout << (area < 0 ? "CW" : "CCW") << '\n';
    }
    return 0;
}
