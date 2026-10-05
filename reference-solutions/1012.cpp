#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("breedflip.in").good()) {
        freopen("breedflip.in", "r", stdin);
        freopen("breedflip.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string a, b;
    cin >> n >> a >> b;
    int ans = 0;
    bool prev = false;
    for (int i = 0; i < n; i++) {
        bool bad = a[i] != b[i];
        ans += bad && !prev;
        prev = bad;
    }
    cout << ans << '\n';
    return 0;
}
