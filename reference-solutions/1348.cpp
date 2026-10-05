#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    vector<int> runs;
    int days = n;
    for (int i = 0; i < n;) {
        if (s[i] == '0') {
            i++;
            continue;
        }
        int j = i;
        while (j < n && s[j] == '1') j++;
        int len = j - i;
        runs.push_back(len);
        days = min(days, i == 0 || j == n ? len - 1 : (len - 1) / 2);
        i = j;
    }
    int w = 2 * days + 1, ans = 0;
    for (int len : runs) ans += (len + w - 1) / w;
    cout << ans << '\n';
    return 0;
}
