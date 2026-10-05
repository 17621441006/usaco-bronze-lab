#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    if (ifstream("sleepy.in").good()) {
        freopen("sleepy.in", "r", stdin);
        freopen("sleepy.out", "w", stdout);
    }
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    int i = n - 1;
    while (i > 0 && a[i - 1] < a[i]) i--;
    cout << i << '\n';
    return 0;
}
