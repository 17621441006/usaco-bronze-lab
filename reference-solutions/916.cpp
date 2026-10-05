#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("revegetate.in").good()) {
        freopen("revegetate.in", "r", stdin);
        freopen("revegetate.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n);
    while (m--) {
        int u, v;
        cin >> u >> v;
        --u;
        --v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> c(n);
    for (int u = 0; u < n; u++) {
        bool used[5] = {};
        for (int v : g[u]) used[c[v]] = true;
        for (int k = 1; k <= 4; k++)
            if (!used[k]) {
                c[u] = k;
                break;
            }
    }
    for (int x : c) cout << x;
    cout << '\n';
    return 0;
}
