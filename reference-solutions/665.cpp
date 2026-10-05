#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("cowsignal.in").good()) {
        freopen("cowsignal.in", "r", stdin);
        freopen("cowsignal.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, k;
    cin >> n >> m >> k;
    while (n--) {
        string s, t;
        cin >> s;
        for (char c : s) t += string(k, c);
        for (int j = 0; j < k; j++) cout << t << '\n';
    }
    return 0;
}
