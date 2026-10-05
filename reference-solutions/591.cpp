#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("promote.in").good()) {
        freopen("promote.in", "r", stdin);
        freopen("promote.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int a[4], b[4];
    for (int i = 0; i < 4; i++) cin >> a[i] >> b[i];
    int p = 0;
    vector<int> v;
    for (int i = 3; i > 0; i--) {
        p += b[i] - a[i];
        v.push_back(p);
    }
    reverse(v.begin(), v.end());
    for (int x : v) cout << x << '\n';
    return 0;
}
