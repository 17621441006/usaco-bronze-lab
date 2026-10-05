#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) {
        ll a, b, ca, cb, f;
        cin >> a >> b >> ca >> cb >> f;
        ll current = a + b / cb * ca;
        if (current >= f) {
            cout << 0 << '\n';
            continue;
        }
        ll A = f - current - 1, B = cb - 1 - b % cb, k = cb > ca ? A / ca : 0;
        cout << A + B + k * (cb - ca) + 1 << '\n';
    }
    return 0;
}
