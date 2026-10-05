#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    int size = 1 << n;
    vector<int> score(size);
    while (k--) {
        int a, b, c;
        cin >> a >> b >> c;
        int x = 1 << (a - 1), y = 1 << (b - 1), z = 1 << (c - 1);
        score[x]++;
        score[x | y]--;
        score[x | z]--;
        score[x | y | z]++;
    }
    for (int bit = 1; bit < size; bit <<= 1)
        for (int base = 0; base < size; base += 2 * bit)
            for (int j = base; j < base + bit; j++) score[j + bit] += score[j];
    int best = *max_element(score.begin(), score.end());
    cout << best << ' ' << count(score.begin(), score.end(), best) << '\n';
    return 0;
}
