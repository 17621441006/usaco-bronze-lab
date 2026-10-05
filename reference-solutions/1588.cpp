#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const ll MOD = 1000000007;
    int T;
    cin >> T;
    while (T--) {
        string s;
        cin >> s;
        bool extra = false;
        for (char c : s) extra |= c != '0' && c != '1';
        ll prefix = 0;
        for (int i = 0; i + 1 < (int)s.size(); i++)
            prefix = (2 * prefix + (s[i] - '0') % 2) % MOD;
        cout << (3 * prefix + (s.back() - '0') % 2 + extra) % MOD << '\n';
    }
    return 0;
}
