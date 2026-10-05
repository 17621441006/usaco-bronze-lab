#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    auto beats = [](array<int, 4> a, array<int, 4> b) {
        int s = 0;
        for (int x : a)
            for (int y : b) s += (x > y) - (x < y);
        return s > 0;
    };
    while (T--) {
        array<int, 4> a, b;
        for (int& x : a) cin >> x;
        for (int& x : b) cin >> x;
        if (beats(b, a)) swap(a, b);
        bool ok = false;
        if (beats(a, b))
            for (int w = 1; w <= 10; w++)
                for (int x = w; x <= 10; x++)
                    for (int y = x; y <= 10; y++)
                        for (int z = y; z <= 10; z++) {
                            array<int, 4> c{w, x, y, z};
                            if (beats(b, c) && beats(c, a)) ok = true;
                        }
        cout << (ok ? "yes" : "no") << '\n';
    }
    return 0;
}
