#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    for (int& x : a) cin >> x;
    for (int& x : b) cin >> x;
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    ll ans = 1;
    for (int i = 0; i < n; i++)
        ans *= max(0, (int)(upper_bound(a.begin(), a.end(), b[i]) - a.begin()) - i);
    cout << ans << '\n';
    return 0;
}
