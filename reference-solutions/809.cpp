#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("taming.in").good()) {
        freopen("taming.in", "r", stdin);
        freopen("taming.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), need(n, -1);
    for (int& x : a) cin >> x;
    need[0] = 1;
    bool ok = true;
    for (int i = 0; i < n; i++)
        if (a[i] != -1) {
            if (a[i] > i) {
                ok = false;
                continue;
            }
            for (int j = 0; j <= a[i]; j++) {
                int v = j == a[i], p = i - j;
                if (need[p] != -1 && need[p] != v) ok = false;
                need[p] = v;
            }
        }
    if (!ok)
        cout << -1;
    else {
        int lo = count(need.begin(), need.end(), 1);
        cout << lo << ' ' << lo + count(need.begin(), need.end(), -1);
    }
    cout << '\n';
    return 0;
}
