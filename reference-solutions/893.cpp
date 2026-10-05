#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("guess.in").good()) {
        freopen("guess.in", "r", stdin);
        freopen("guess.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<set<string>> a(n);
    for (int i = 0, k; i < n; i++) {
        string s;
        cin >> s >> k;
        while (k--) {
            cin >> s;
            a[i].insert(s);
        }
    }
    int ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++) {
            int common = 0;
            for (auto s : a[i]) common += a[j].count(s);
            ans = max(ans, common);
        }
    cout << ans + 1 << '\n';
    return 0;
}
