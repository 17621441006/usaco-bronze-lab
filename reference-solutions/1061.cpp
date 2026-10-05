#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<char> d(n);
    vector<ll> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> d[i] >> x[i] >> y[i];
    vector<tuple<ll, ll, int, int>> e;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (d[i] == 'E' && d[j] == 'N') {
                ll a = x[j] - x[i], b = y[i] - y[j];
                if (a < 0 || b < 0 || a == b) continue;
                if (a > b)
                    e.emplace_back(a, b, i, j);
                else
                    e.emplace_back(b, a, j, i);
            }
    sort(e.begin(), e.end());
    vector<ll> stop(n, LLONG_MAX);
    for (auto [late, early, v, b] : e)
        if (stop[v] > late && stop[b] > early) stop[v] = late;
    for (ll t : stop)
        if (t == LLONG_MAX)
            cout << "Infinity\n";
        else
            cout << t << '\n';
    return 0;
}
