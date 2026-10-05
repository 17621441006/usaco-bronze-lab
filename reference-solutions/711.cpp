#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("crossroad.in").good()) {
        freopen("crossroad.in", "r", stdin);
        freopen("crossroad.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, ans = 0;
    cin >> n;
    map<int, int> last;
    while (n--) {
        int c, s;
        cin >> c >> s;
        if (last.count(c) && last[c] != s) ans++;
        last[c] = s;
    }
    cout << ans << '\n';
    return 0;
}
