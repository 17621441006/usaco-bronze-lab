#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    int ans = 0;
    for (int l = 0; l < n; l++) {
        int sum = 0;
        set<int> s;
        for (int r = l; r < n; r++) {
            sum += a[r];
            s.insert(a[r]);
            int len = r - l + 1;
            ans += sum % len == 0 && s.count(sum / len);
        }
    }
    cout << ans << '\n';
    return 0;
}
