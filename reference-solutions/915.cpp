#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("herding.in").good()) {
        freopen("herding.in", "r", stdin);
        freopen("herding.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> a(3);
    for (int& x : a) cin >> x;
    sort(a.begin(), a.end());
    int x = a[0], y = a[1], z = a[2];
    cout << (z - x == 2                 ? 0
             : y - x == 2 || z - y == 2 ? 1
                                        : 2)
         << '\n'
         << max(y - x, z - y) - 1 << '\n';
    return 0;
}
