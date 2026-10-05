#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("photo.in").good()) {
        freopen("photo.in", "r", stdin);
        freopen("photo.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> b(n - 1);
    for (int& x : b) cin >> x;
    for (int first = 1; first <= n; first++) {
        vector<int> a{first};
        vector<bool> seen(n + 1);
        seen[first] = true;
        for (int s : b) {
            int x = s - a.back();
            if (x < 1 || x > n || seen[x]) break;
            a.push_back(x);
            seen[x] = true;
        }
        if ((int)a.size() == n) {
            for (int x : a) cout << x << ' ';
            cout << '\n';
            break;
        }
    }
    return 0;
}
