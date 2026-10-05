#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        string s;
        cin >> s;
        int ans = INT_MAX;
        for (int i = 0; i + 2 < (int)s.size(); i++)
            if (s[i + 1] == 'O')
                ans = min(ans, (int)s.size() - 3 + (s[i] != 'M') + (s[i + 2] != 'O'));
        cout << (ans == INT_MAX ? -1 : ans) << '\n';
    }
    return 0;
}
