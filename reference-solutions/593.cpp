#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("mowing.in").good()) {
        freopen("mowing.in", "r", stdin);
        freopen("mowing.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int x = 0, y = 0, t = 0, ans = INT_MAX;
    map<pair<int, int>, int> last;
    last[{0, 0}] = 0;
    while (n--) {
        char d;
        int k;
        cin >> d >> k;
        while (k--) {
            x += (d == 'E') - (d == 'W');
            y += (d == 'N') - (d == 'S');
            t++;
            auto p = make_pair(x, y);
            if (last.count(p)) ans = min(ans, t - last[p]);
            last[p] = t;
        }
    }
    cout << (ans == INT_MAX ? -1 : ans) << '\n';
    return 0;
}
