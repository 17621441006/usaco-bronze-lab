#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> a(7);
    for (int& x : a) cin >> x;
    sort(a.begin(), a.end());
    cout << a[0] << ' ' << a[1] << ' ' << a[6] - a[0] - a[1] << '\n';
    return 0;
}
