#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, o = 0;
    cin >> n;
    for (int i = 0, x; i < n; i++) {
        cin >> x;
        o += x % 2;
    }
    int e = n - o;
    while (o > e) {
        o -= 2;
        e++;
    }
    cout << (o < 0 ? e - 1 : 2 * o + min(1, e - o)) << '\n';
    return 0;
}
