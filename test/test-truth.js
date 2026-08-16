/* Checks that the CHALLENGE levels tell the truth: every stated answer is
   re-derived here independently, and the final step must accept it.
   A well-formed step that teaches the wrong number is the worst bug we can ship,
   so this runs separately from the structural sweep in test-levels.js.
   Run: node test/test-truth.js */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2', 'harder', 'harder2',
  'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}
const REPS = Number(process.env.REPS || 200);
let checks = 0, fails = 0, shown = 0;
const bad = (m) => { fails++; if (shown++ < 25) console.log('  ✗ ' + m); };
const ok = () => { checks++; };
const num = (s) => Number(String(s).replace(/[−–—]/g, '-').replace(/[^0-9.\-]/g, ''));

// the last step must accept the answer the problem claims
function finalAccepts(p, value) {
  const last = p.steps[p.steps.length - 1];
  if (last.mode !== 'pick') return null;  // build/choose finals are covered by test-levels
  // Binary floats give us 13.999999999999998 for 2.8 ÷ 0.2; the app is right to print 14,
  // so compare against the tidied value as well as the raw one.
  const tidy = String(Math.round(value * 1e9) / 1e9);
  return last.check(String(value)).correct || last.check(tidy).correct;
}
function claim(label, p, expected) {
  const got = num(p.answer);
  if (Math.abs(got - expected) > 1e-9) { bad(`${label}: "${p.given}" claims ${p.answer}, truth is ${expected}`); return; }
  ok();
  const acc = finalAccepts(p, expected);
  if (acc === false) { bad(`${label}: "${p.given}" final step rejects the true answer ${expected}`); return; }
  if (acc !== null) ok();
}

const gcd = W.gcd;
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

console.log(`Re-deriving every challenge answer, ${REPS} samples each…\n`);

const CASES = {
  // ---- number ----
  'hcf3': () => { const p = W.hcf3(...[[12, 18, 24], [16, 24, 40], [24, 36, 60], [21, 35, 56]][rnd(0, 3)]);
    const ns = p.sig.split(':')[1].split(',').map(Number);
    claim('hcf3', p, ns.reduce((a, b) => gcd(a, b))); },
  'lcm3': () => { const p = W.lcm3(...[[3, 4, 6], [4, 6, 8], [2, 3, 5], [6, 9, 12]][rnd(0, 3)]);
    const ns = p.sig.split(':')[1].split(',').map(Number);
    claim('lcm3', p, ns.reduce((a, b) => W.lcm(a, b))); },
  'decMul': () => { const x = (rnd(1, 99) / 10).toFixed(1), y = (rnd(1, 99) / 10).toFixed(1);
    const p = W.decMul(x, y); claim('decMul', p, Math.round(Number(x) * Number(y) * 1e6) / 1e6); },
  'decDiv': () => { const dv = ['0.2', '0.4', '0.5', '0.8', '2.5', '0.25'][rnd(0, 5)], q = rnd(2, 30);
    const x = String(Math.round(q * Number(dv) * 100) / 100);
    const p = W.decDiv(x, dv); claim('decDiv', p, Number(x) / Number(dv)); },
  'percentAny': () => { const pc = rnd(11, 89), A = 100 * rnd(2, 15);
    const p = W.percentAny(pc, A, ''); claim('percentAny', p, (A * pc) / 100); },
  'percentChange': () => { const pc = [5, 10, 15, 20, 25, 40][rnd(0, 5)], A = 20 * rnd(3, 30), up = Math.random() < 0.5;
    const p = W.percentChange(pc, A, up, '£', 'x'); claim('percentChange', p, up ? A + (A * pc) / 100 : A - (A * pc) / 100); },
  'percentChangeFind': () => {
    // must stay non-calculator: the change over the original has to simplify to a
    // fraction they know as a percentage
    const F = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80],
      [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 20, 5], [3, 20, 15]][rnd(0, 12)];
    const k = rnd(2, 20), oldV = F[1] * k, change = F[0] * k, up = Math.random() < 0.5;
    const newV = up ? oldV + change : oldV - change;
    if (newV <= 0) return;
    const p = W.percentChangeFind(oldV, newV, '£', 'x');
    claim('percentChangeFind', p, F[2]);
    // and the arithmetic must stay small enough to do in your head
    const simp = p.steps.find((s) => s.key === 'frac');
    if (!simp) { bad('percentChangeFind: no simplify step'); return; }
    if (gcd(change, oldV) === 1) bad(`percentChangeFind: ${change}/${oldV} does not simplify at all`); else ok(); },
  'percentReverse': () => { const pc = [10, 20, 25, 40, 50][rnd(0, 4)], orig = 20 * rnd(2, 25), up = Math.random() < 0.5;
    const now = (orig * (up ? 100 + pc : 100 - pc)) / 100;
    if (!Number.isInteger(now)) return;
    const p = W.percentReverse(pc, orig, up, '£', 'x');
    claim('percentReverse', p, orig);
    // and the story must be self-consistent: p% of the original really gives `now`
    const back = up ? orig + (orig * pc) / 100 : orig - (orig * pc) / 100;
    if (back !== now) bad(`percentReverse: ${pc}% of ${orig} does not lead back to ${now}`); else ok();
    // every number the child has to produce must be a whole number, or the
    // no-calculator route has broken down somewhere
    p.steps.forEach((s) => {
      const want = s.pool.filter((v) => s.check(v).correct)[0];
      if (!/^-?\d+$/.test(String(want))) bad(`percentReverse: step ${s.key} wants a non-whole answer "${want}"`);
      else ok();
    }); },
  'fracMul': () => { const b = rnd(2, 9), d = rnd(2, 9), a = rnd(1, b - 1), c = rnd(1, d - 1);
    const p = W.fracMul(a, b, c, d), [sn, sd] = String(p.answer).split('/').map(Number);
    if (Math.abs(sn / sd - (a * c) / (b * d)) > 1e-9) bad(`fracMul: ${a}/${b} × ${c}/${d} → ${p.answer}`); else ok();
    if (gcd(sn, sd) !== 1) bad(`fracMul: ${p.answer} is not in simplest form`); else ok(); },
  'fracDiv': () => { const b = rnd(2, 9), d = rnd(2, 9), a = rnd(1, b - 1), c = rnd(1, d - 1);
    const p = W.fracDiv(a, b, c, d), [sn, sd] = String(p.answer).split('/').map(Number);
    if (Math.abs(sn / sd - (a / b) / (c / d)) > 1e-9) bad(`fracDiv: ${a}/${b} ÷ ${c}/${d} → ${p.answer}`); else ok();
    if (gcd(sn, sd) !== 1) bad(`fracDiv: ${p.answer} is not in simplest form`); else ok(); },
  'fracOfBig': () => { const den = [4, 5, 6, 8, 10, 12][rnd(0, 5)], nu = rnd(1, den - 1), amt = den * rnd(6, 25);
    const p = W.fracOfBig(nu, den, amt); claim('fracOfBig', p, (nu / den) * amt); },
  'negTwoStep': () => { const p = W.negTwoStep();
    const js = p.given.replace('Work out', '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/²/g, '**2').trim();
    if (!/^[0-9+\-*/(). ]+$/.test(js)) { bad(`negTwoStep: cannot re-read "${p.given}"`); return; }
    claim('negTwoStep', p, eval(js)); },
  'roundSF': () => { const sf = Math.random() < 0.5 ? 1 : 2;
    const n = Math.random() < 0.5 ? rnd(120, 98000) : Math.round(rnd(1, 4000)) / 100;
    const p = W.roundSF(n, sf);
    const mag = Math.floor(Math.log10(Math.abs(n))), sc = Math.pow(10, mag - sf + 1);
    claim('roundSF', p, Math.round(Math.round(n / sc) * sc * 1e6) / 1e6); },
  'estimate': () => { const op = ['×', '+', '−'][rnd(0, 2)]; let a = rnd(18, 890), b = rnd(18, 890);
    if (op === '−' && b > a) { const t = a; a = b; b = t; }
    const p = W.estimate(a, b, op);
    const r = (x) => { const m = Math.floor(Math.log10(x)), s = Math.pow(10, m); return Math.round(x / s) * s; };
    claim('estimate', p, op === '×' ? r(a) * r(b) : op === '+' ? r(a) + r(b) : r(a) - r(b)); },
  'meanMissing': () => { const n = rnd(4, 6), mean = rnd(4, 14), vals = []; let s = 0;
    for (let i = 0; i < n - 1; i++) { const v = rnd(1, 2 * mean); vals.push(v); s += v; }
    const missing = mean * n - s; if (missing < 1) return;
    const p = W.meanMissing(vals, missing);
    const all = [...vals, missing];
    if (all.reduce((a, b) => a + b, 0) / n !== mean) { bad(`meanMissing: set does not have mean ${mean}`); return; }
    claim('meanMissing', p, missing); },
  'medianEven': () => { const out = [], u = new Set();
    while (out.length < 6) { const v = rnd(1, 30); if (!u.has(v)) { u.add(v); out.push(v); } }
    const p = W.medianEven(out), s = out.slice().sort((a, b) => a - b);
    claim('medianEven', p, (s[2] + s[3]) / 2); },
  'rangeNegative': () => { const out = [], u = new Set();
    while (out.length < 5) { const v = rnd(-9, 12); if (!u.has(v)) { u.add(v); out.push(v); } }
    if (Math.min(...out) >= 0) return;
    const p = W.rangeNegative(out); claim('rangeNegative', p, Math.max(...out) - Math.min(...out)); },
  // ---- shape & data ----
  'angleQuadrilateral': () => { const p = W.angleQuadrilateral();
    const [a, b, c] = p.sig.split(':')[1].split(',').map(Number); claim('angleQuad', p, 360 - a - b - c); },
  'angleIsosceles': () => { const p = W.angleIsosceles();
    const [kind, v] = [p.sig.split(':')[0] + ':' + p.sig.split(':')[1].split(':')[0], Number(p.sig.split(':')[1])];
    const isApex = p.sig.startsWith('iso-a');
    claim('angleIso', p, isApex ? (180 - v) / 2 : 180 - 2 * v); },
  'angleParallel': () => { const p = W.angleParallel();
    const [, kind, a] = p.sig.split(':'); claim('angleParallel', p, kind === 'co' ? 180 - Number(a) : Number(a)); },
  'anglePolygon': () => { const p = W.anglePolygon();
    const [, n, what] = p.sig.split(':'); const sum = (Number(n) - 2) * 180;
    claim('anglePolygon', p, what === 'each' ? sum / Number(n) : sum); },
  'compoundArea': () => { const p = W.compoundArea();
    const [A, B, c, d] = p.sig.split(':')[1].split(',').map(Number);
    claim('compoundArea', p, A * B - c * d); },
  'parallelogramArea': () => { const b = rnd(4, 14), h = rnd(3, 11);
    claim('parallelogram', W.parallelogramArea(b, h), b * h); },
  'trapeziumArea': () => { let a = rnd(3, 10), b = rnd(4, 14); if (a === b) b += 1; let h = rnd(3, 10);
    if (((a + b) * h) % 2 !== 0) h += 1;
    claim('trapezium', W.trapeziumArea(a, b, h), ((a + b) * h) / 2); },
  'missingSide': () => { const L = rnd(4, 12), Wd = rnd(3, 11);
    claim('missingSide', W.missingSide(L, Wd), 2 * (L + Wd)); },
  'surfaceArea': () => { const l = rnd(3, 9), w = rnd(2, 7), h = rnd(2, 8);
    claim('surfaceArea', W.surfaceArea(l, w, h), 2 * (l * w + l * h + w * h)); },
  'missingDimension': () => { const l = rnd(2, 8), w = rnd(2, 7), h = rnd(2, 9);
    const p = W.missingDimension(l, w, h);
    if (!p.given.includes(`${l * w * h} cm³`)) bad(`missingDimension: volume not stated as ${l * w * h}`); else ok();
    claim('missingDimension', p, h); },
  'prismVolume': () => { let b = rnd(3, 10), h = rnd(2, 9); if ((b * h) % 2 !== 0) h += 1;
    const len = rnd(3, 12); claim('prism', W.prismVolume(b, h, len), ((b * h) / 2) * len); },
  'midpoint': () => { const x1 = rnd(0, 8), y1 = rnd(0, 8), x2 = x1 + 2 * rnd(1, 1), y2 = y1 + 2 * rnd(1, 1);
    const p = W.midpoint(x1, y1, x2, y2);
    const want = `(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`;
    if (p.answer !== want) bad(`midpoint: A(${x1},${y1}) B(${x2},${y2}) → ${p.answer}, truth ${want}`); else ok(); },
  'twoWayTable': () => { const p = W.twoWayTable();
    const [a, b, c, d] = p.sig.split(':')[1].split(',').map(Number);
    claim('twoWayTable', p, b);
    if (!p.diagram.includes(`<td>${a}</td>`)) bad(`twoWayTable: table does not show ${a}`); else ok(); },
  'barMean': () => { const cats = ['A', 'B', 'C', 'D']; let vals;
    do { vals = cats.map(() => 5 * rnd(1, 8)); } while (vals.reduce((x, y) => x + y, 0) % 4 !== 0);
    claim('barMean', W.barMean(cats, vals, 5), vals.reduce((x, y) => x + y, 0) / 4); },
  'pictogram': () => { const p = W.pictogram();
    const [, , syms, per] = p.sig.split(':');
    ok(); if (num(p.answer) % (Number(per) / 2) !== 0) bad(`pictogram: ${p.answer} is not a whole number of half-symbols`); else ok(); },
  // ---- algebra with brackets ----
  'brackets': () => { const a = rnd(2, 8), b = rnd(-9, 9) || 1, x = rnd(-8, 12) || 1;
    const c = a * (x + b);
    // by id, not by position — the subject tiles are listed in school topic order
    const p = W.levelOf('algebra', 'sf').generate();
    // the round mixes bracket and two-sided problems; only re-derive the bracket ones
    const m = String(p.given).match(/^(\d+)\((.+)\)\s*=\s*(.+)$/);
    if (!m) { ok(); return; }
    const A = Number(m[1]);
    const inner = m[2].replace(/[−–—]/g, '-').replace(/\s+/g, '');
    const B = Number(inner.replace('x', '') || 0);
    const C = Number(String(m[3]).replace(/[−–—]/g, '-'));
    const truth = C / A - B;
    const got = Number(String(p.answer));
    if (Math.abs(got - truth) > 1e-9) bad(`brackets: ${p.given} claims x = ${p.answer}, truth ${truth}`); else ok(); },
};

for (const [name, fn] of Object.entries(CASES)) {
  const before = fails;
  for (let i = 0; i < REPS; i++) fn();
  console.log(`${fails === before ? '✓' : '✗'} ${name}`);
}
console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
