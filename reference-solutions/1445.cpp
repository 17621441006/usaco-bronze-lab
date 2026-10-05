#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, f;
    string s;
    cin >> n >> f >> s;
    int count[676] = {};
    auto key = [&](int j) {
        return s[j] != s[j + 1] && s[j + 1] == s[j + 2]
                   ? (s[j] - 'a') * 26 + s[j + 1] - 'a'
                   : -1;
    };
    for (int j = 0; j + 2 < n; j++) {
        int k = key(j);
        if (k >= 0) count[k]++;
    }
    set<int> ans;
    for (int k = 0; k < 676; k++)
        if (count[k] >= f) ans.insert(k);
    for (int i = 0; i < n; i++) {
        char old = s[i];
        int l = max(0, i - 2), r = min(i, n - 3);
        for (int j = l; j <= r; j++) {
            int k = key(j);
            if (k >= 0) count[k]--;
        }
        for (char c = 'a'; c <= 'z'; c++) {
            s[i] = c;
            vector<int> keys;
            for (int j = l; j <= r; j++) {
                int k = key(j);
                if (k >= 0) {
                    count[k]++;
                    keys.push_back(k);
                }
            }
            for (int k : keys)
                if (count[k] >= f) ans.insert(k);
            for (int k : keys) count[k]--;
        }
        s[i] = old;
        for (int j = l; j <= r; j++) {
            int k = key(j);
            if (k >= 0) count[k]++;
        }
    }
    cout << ans.size() << '\n';
    for (int k : ans)
        cout << char('a' + k / 26) << char('a' + k % 26) << char('a' + k % 26) << '\n';
    return 0;
}
