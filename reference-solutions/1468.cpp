#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), pref(n);
    unordered_map<int, int> first, seen;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        if (!first.count(a[i])) first[a[i]] = i;
        pref[i] = first.size();
    }
    ll ans = 0;
    for (int i = n - 1; i >= 0; i--)
        if (++seen[a[i]] == 2) ans += (i ? pref[i - 1] : 0) - (first[a[i]] < i);
    cout << ans << '\n';
    return 0;
}
