#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("swap.in").good()) {
        freopen("swap.in", "r", stdin);
        freopen("swap.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, a, b, c, d;
    ll k;
    cin >> n >> k >> a >> b >> c >> d;
    vector<int> p(n), ans(n);
    iota(p.begin(), p.end(), 0);
    reverse(p.begin() + a - 1, p.begin() + b);
    reverse(p.begin() + c - 1, p.begin() + d);
    vector<bool> seen(n);
    for (int i = 0; i < n; i++)
        if (!seen[i]) {
            vector<int> v;
            int j = i;
            while (!seen[j]) {
                seen[j] = true;
                v.push_back(j);
                j = p[j];
            }
            for (int t = 0; t < (int)v.size(); t++) ans[v[t]] = v[(t + k) % v.size()] + 1;
        }
    for (int x : ans) cout << x << '\n';
    return 0;
}
