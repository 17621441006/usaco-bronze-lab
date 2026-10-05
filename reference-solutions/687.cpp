#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("notlast.in").good()) {
        freopen("notlast.in", "r", stdin);
        freopen("notlast.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    map<string, int> a;
    for (string s :
         {"Bessie", "Elsie", "Daisy", "Gertie", "Annabelle", "Maggie", "Henrietta"})
        a[s] = 0;
    int n;
    cin >> n;
    while (n--) {
        string s;
        int v;
        cin >> s >> v;
        a[s] += v;
    }
    set<int> v;
    for (auto [s, x] : a) v.insert(x);
    vector<string> names;
    if (v.size() > 1) {
        int target = *next(v.begin());
        for (auto [s, x] : a)
            if (x == target) names.push_back(s);
    }
    cout << (names.size() == 1 ? names[0] : "Tie") << '\n';
    return 0;
}
