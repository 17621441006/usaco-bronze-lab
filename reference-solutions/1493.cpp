#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    auto one = [](const vector<int>& a, int l, int r) {
        for (int i = l + 1; i < r; i++)
            if (a[i] != a[l]) return false;
        return true;
    };
    auto two = [](const vector<int>& a, int l, int r) {
        vector<pair<int, int>> v;
        for (int i = l; i < r; i++) {
            if (!v.empty() && v.back().first == a[i])
                v.back().second++;
            else
                v.emplace_back(a[i], 1);
        }
        if (v.size() <= 2) return true;
        if (v.size() % 2) return false;
        for (int i = 2; i < (int)v.size(); i++)
            if (v[i] != v[i % 2]) return false;
        return true;
    };
    int T;
    cin >> T;
    while (T--) {
        int n, k;
        cin >> n >> k;
        vector<int> a(n);
        for (int& x : a) cin >> x;
        bool ok = k == 1 ? one(a, 0, n) : two(a, 0, n);
        if (k == 3 && !ok)
            for (int len = 1; len <= n && !ok; len++)
                if (n % len == 0) {
                    bool repeated = true;
                    for (int i = len; i < n; i++)
                        if (a[i] != a[i % len]) repeated = false;
                    if (repeated)
                        for (int c = 0; c <= len; c++)
                            if ((one(a, 0, c) && two(a, c, len)) ||
                                (two(a, 0, c) && one(a, c, len))) {
                                ok = true;
                                break;
                            }
                }
        cout << (ok ? "YES" : "NO") << '\n';
    }
    return 0;
}
