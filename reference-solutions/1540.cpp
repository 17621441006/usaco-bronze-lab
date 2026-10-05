#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T, k;
    cin >> T >> k;
    while (T--) {
        int n;
        string s;
        cin >> n >> s;
        if (n % 2) {
            cout << -1 << '\n';
            continue;
        }
        int h = s.size() / 2;
        if (s.substr(0, h) == s.substr(h)) {
            cout << 1 << '\n';
            for (int i = 0; i < 2 * h; i++) cout << 1 << ' ';
            cout << '\n';
            continue;
        }
        vector<int> mark(2 * h, 1);
        for (int i = 0; i < h; i += 3) {
            string a = s.substr(i, 3), b = s.substr(i + h, 3);
            if (a == b) continue;
            bool done = false;
            for (int u = 0; u < 3 && !done; u++)
                for (int v = 0; v < 3; v++) {
                    string x = a, y = b;
                    x.erase(u, 1);
                    y.erase(v, 1);
                    if (x == y) {
                        mark[i + u] = mark[i + h + v] = 2;
                        done = true;
                        break;
                    }
                }
        }
        cout << 2 << '\n';
        for (int x : mark) cout << x << ' ';
        cout << '\n';
    }
    return 0;
}
