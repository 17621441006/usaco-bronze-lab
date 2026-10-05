#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        vector<int> a(n);
        for (int& x : a) cin >> x;
        set<int> s;
        for (int i = 0; i < n; i++)
            if ((i + 1 < n && a[i] == a[i + 1]) || (i + 2 < n && a[i] == a[i + 2]))
                s.insert(a[i]);
        if (s.empty())
            cout << -1;
        else
            for (int x : s) cout << x << ' ';
        cout << '\n';
    }
    return 0;
}
