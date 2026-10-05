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
        int sum = 0;
        for (int& x : a) {
            cin >> x;
            sum += x;
        }
        if (sum == 0) {
            cout << 0 << '\n';
            continue;
        }
        for (int g = n; g >= 1; g--)
            if (sum % g == 0) {
                int target = sum / g, cur = 0;
                bool ok = true;
                for (int x : a) {
                    cur += x;
                    if (cur > target) {
                        ok = false;
                        break;
                    }
                    if (cur == target) cur = 0;
                }
                if (ok && cur == 0) {
                    cout << n - g << '\n';
                    break;
                }
            }
    }
    return 0;
}
