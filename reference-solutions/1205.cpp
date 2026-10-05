#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    string b[4];
    for (auto& s : b) cin >> s;
    while (n--) {
        string w;
        cin >> w;
        vector<int> p{0, 1, 2, 3};
        bool ok = false;
        do {
            bool good = true;
            for (int i = 0; i < (int)w.size(); i++)
                good &= b[p[i]].find(w[i]) != string::npos;
            ok |= good;
        } while (next_permutation(p.begin(), p.end()));
        cout << (ok ? "YES" : "NO") << '\n';
    }
    return 0;
}
