#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("outofplace.in").good()) {
        freopen("outofplace.in", "r", stdin);
        freopen("outofplace.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    auto b = a;
    sort(b.begin(), b.end());
    int diff = 0;
    for (int i = 0; i < n; i++) diff += a[i] != b[i];
    cout << max(0, diff - 1) << '\n';
    return 0;
}
