#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T, k;
    cin >> T >> k;
    while (T--) {
        int n;
        string s;
        cin >> n >> s;
        cout << "YES\n";
        if (k) {
            string out(n, 'M');
            bool flip = false;
            for (int i = n - 1; i >= 0; i--) {
                bool typed = (s[i] == 'O') ^ flip;
                out[i] = typed ? 'O' : 'M';
                flip ^= typed;
            }
            cout << out << '\n';
        }
    }
    return 0;
}
