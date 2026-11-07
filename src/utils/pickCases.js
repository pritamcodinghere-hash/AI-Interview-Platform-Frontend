// Pick a small representative set of test cases spread across the full suite
// so 4 visible cases cover basic, edge and corner scenarios of the hidden set.
export function pickCases(cases, n = 4) {
    if (!Array.isArray(cases) || cases.length === 0) return [];
    if (cases.length <= n) return cases;

    const idx = [0, 1, Math.floor((cases.length - 1) / 2), cases.length - 1];
    const picked = [];
    for (const i of idx) {
        if (i >= 0 && i < cases.length && !picked.includes(cases[i])) {
            picked.push(cases[i]);
        }
        if (picked.length === n) break;
    }
    let k = 0;
    while (picked.length < n && k < cases.length) {
        if (!picked.includes(cases[k])) picked.push(cases[k]);
        k++;
    }
    return picked;
}

export default pickCases;
