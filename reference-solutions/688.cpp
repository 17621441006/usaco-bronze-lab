#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("hps.in").good()) {
        freopen("hps.in", "r", stdin);
        freopen("hps.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, a = 0, b = 0;
    cin >> n;
    while (n--) {
        int x, y;
        cin >> x >> y;
        a += (x - y + 3) % 3 == 1;
        b += (y - x + 3) % 3 == 1;
    }
    cout << max(a, b) << '\n';
    return 0;
}
