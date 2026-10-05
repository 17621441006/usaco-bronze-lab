#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("blocks.in").good()) {
        freopen("blocks.in", "r", stdin);
        freopen("blocks.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int ans[26] = {};
    while (n--) {
        string a, b;
        cin >> a >> b;
        int x[26] = {}, y[26] = {};
        for (char c : a) x[c - 'a']++;
        for (char c : b) y[c - 'a']++;
        for (int i = 0; i < 26; i++) ans[i] += max(x[i], y[i]);
    }
    for (int x : ans) cout << x << '\n';
    return 0;
}
