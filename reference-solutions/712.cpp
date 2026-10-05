#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("circlecross.in").good()) {
        freopen("circlecross.in", "r", stdin);
        freopen("circlecross.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    vector<int> p[26];
    for (int i = 0; i < (int)s.size(); i++) p[s[i] - 'A'].push_back(i);
    int ans = 0;
    for (int a = 0; a < 26; a++)
        for (int b = a + 1; b < 26; b++)
            ans += (p[a][0] < p[b][0] && p[b][0] < p[a][1] && p[a][1] < p[b][1]) ||
                   (p[b][0] < p[a][0] && p[a][0] < p[b][1] && p[b][1] < p[a][1]);
    cout << ans << '\n';
    return 0;
}
