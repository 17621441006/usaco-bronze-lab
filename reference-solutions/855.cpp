#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("mixmilk.in").good()) {
        freopen("mixmilk.in", "r", stdin);
        freopen("mixmilk.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int c[3], a[3];
    for (int i = 0; i < 3; i++) cin >> c[i] >> a[i];
    for (int t = 0; t < 100; t++) {
        int i = t % 3, j = (i + 1) % 3, v = min(a[i], c[j] - a[j]);
        a[i] -= v;
        a[j] += v;
    }
    for (int x : a) cout << x << '\n';
    return 0;
}
