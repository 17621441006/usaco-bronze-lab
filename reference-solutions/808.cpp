#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("hoofball.in").good()) {
        freopen("hoofball.in", "r", stdin);
        freopen("hoofball.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    sort(a.begin(), a.end());
    if (n == 1) {
        cout << 1;
        return 0;
    }
    vector<int> to(n), deg(n);
    for (int i = 0; i < n; i++) {
        to[i] = i == 0                               ? 1
                : i == n - 1                         ? n - 2
                : a[i] - a[i - 1] <= a[i + 1] - a[i] ? i - 1
                                                     : i + 1;
        deg[to[i]]++;
    }
    int ans = count(deg.begin(), deg.end(), 0);
    for (int i = 0; i < n; i++)
        if (to[to[i]] == i && i < to[i] && deg[i] == 1 && deg[to[i]] == 1) ans++;
    cout << ans << '\n';
    return 0;
}
