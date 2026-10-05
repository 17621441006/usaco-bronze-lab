#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, k;
        string s;
        cin >> n >> k >> s;
        string p(n, '.');
        int reach[256];
        fill(reach, reach + 256, -1);
        int count = 0;
        for (int i = 0; i < n; i++) {
            int c = s[i];
            if (i <= reach[c]) continue;
            int pos = min(n - 1, i + k);
            if (p[pos] != '.') pos--;
            p[pos] = c;
            reach[c] = pos + k;
            count++;
        }
        cout << count << '\n' << p << '\n';
    }
    return 0;
}
