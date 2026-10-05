#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    vector<int> e(n);
    for (int& x : e) {
        cin >> x;
        x--;
    }
    int first[256], last[256];
    fill(first, first + 256, n);
    fill(last, last + 256, -1);
    for (int i = 0; i < n; i++) {
        first[(int)s[i]] = min(first[(int)s[i]], i);
        last[(int)s[i]] = i;
    }
    set<pair<int, int>> pairs;
    for (char c : {'G', 'H'}) {
        char o = c == 'G' ? 'H' : 'G';
        int l = first[(int)c];
        if (e[l] < last[(int)c]) continue;
        for (int j = 0; j < n; j++)
            if (s[j] == o &&
                ((j == first[(int)o] && e[j] >= last[(int)o]) || (j <= l && l <= e[j])))
                pairs.insert(minmax(l, j));
    }
    cout << pairs.size() << '\n';
    return 0;
}
