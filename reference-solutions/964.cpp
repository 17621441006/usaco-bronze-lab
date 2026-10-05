#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("whereami.in").good()) {
        freopen("whereami.in", "r", stdin);
        freopen("whereami.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    for (int k = 1; k <= n; k++) {
        set<string> q;
        for (int i = 0; i + k <= n; i++) q.insert(s.substr(i, k));
        if ((int)q.size() == n - k + 1) {
            cout << k << '\n';
            break;
        }
    }
    return 0;
}
