#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n, m;
        cin >> n >> m;
        vector<pair<string, int>> a(m);
        for (auto& p : a) cin >> p.first >> p.second;
        while (!a.empty()) {
            bool removed = false;
            for (int bit = 0; bit < n && !removed; bit++)
                for (char v : {'0', '1'}) {
                    set<int> out;
                    for (auto p : a)
                        if (p.first[bit] == v) out.insert(p.second);
                    if (out.size() == 1) {
                        vector<pair<string, int>> b;
                        for (auto p : a)
                            if (p.first[bit] != v) b.push_back(p);
                        a = b;
                        removed = true;
                        break;
                    }
                }
            if (!removed) break;
        }
        cout << (a.empty() ? "OK" : "LIE") << '\n';
    }
    return 0;
}
