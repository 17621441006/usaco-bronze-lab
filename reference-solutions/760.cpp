#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("shuffle.in").good()) {
        freopen("shuffle.in", "r", stdin);
        freopen("shuffle.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> p(n);
    for (int& x : p) {
        cin >> x;
        x--;
    }
    vector<string> a(n), b(n);
    for (auto& x : a) cin >> x;
    for (int t = 0; t < 3; t++) {
        for (int i = 0; i < n; i++) b[i] = a[p[i]];
        a = b;
    }
    for (auto x : a) cout << x << '\n';
    return 0;
}
