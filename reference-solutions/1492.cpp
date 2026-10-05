#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> f(n + 1);
    for (int i = 0, x; i < n; i++) {
        cin >> x;
        f[x]++;
    }
    int missing = 0;
    for (int x = 0; x <= n; x++) {
        cout << max(missing, f[x]) << '\n';
        missing += f[x] == 0;
    }
    return 0;
}
