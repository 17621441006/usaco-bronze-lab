#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("teleport.in").good()) {
        freopen("teleport.in", "r", stdin);
        freopen("teleport.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int a, b, x, y;
    cin >> a >> b >> x >> y;
    cout << min({abs(a - b), abs(a - x) + abs(b - y), abs(a - y) + abs(b - x)}) << '\n';
    return 0;
}
