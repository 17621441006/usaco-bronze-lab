#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string a, b, s;
    for (int i = 0; i < 3; i++) {
        cin >> s;
        a += s;
    }
    for (int i = 0; i < 3; i++) {
        cin >> s;
        b += s;
    }
    int g = 0, x[26] = {}, y[26] = {}, total = 0;
    for (int i = 0; i < 9; i++) {
        g += a[i] == b[i];
        x[a[i] - 'A']++;
        y[b[i] - 'A']++;
    }
    for (int i = 0; i < 26; i++) total += min(x[i], y[i]);
    cout << g << '\n' << total - g << '\n';
    return 0;
}
