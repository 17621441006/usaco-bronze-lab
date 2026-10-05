#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("word.in").good()) {
        freopen("word.in", "r", stdin);
        freopen("word.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    int size = 0;
    bool first = true;
    while (n--) {
        string s;
        cin >> s;
        if (size + (int)s.size() > k) {
            cout << '\n';
            size = 0;
            first = true;
        }
        if (!first) cout << ' ';
        cout << s;
        size += s.size();
        first = false;
    }
    cout << '\n';
    return 0;
}
