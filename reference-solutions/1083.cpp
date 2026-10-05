#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s, t;
    cin >> s >> t;
    int p[26];
    for (int i = 0; i < 26; i++) p[s[i] - 'a'] = i;
    int ans = 1;
    for (int i = 1; i < (int)t.size(); i++) ans += p[t[i] - 'a'] <= p[t[i - 1] - 'a'];
    cout << ans << '\n';
    return 0;
}
