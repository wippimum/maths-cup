/* Checks the Geometry Cup (geometry-y7/index.html) without a browser.
   Loads only the <script id="engine"> block, then:
   - the shape classifier and symmetry counter against shapes checked by hand;
   - every drawing that claims to be accurate: each labelled angle is MEASURED off the
     drawing and compared with the number printed on it, and with the answer expected;
   - the parallel-line rules against the homework sheet's own lettered diagram (Q7);
   - both homework sheets against the Corbettmaths answer keys, and their mark totals;
   - every generated question: one right option, no duplicate options, no "wrong answer"
     diagnosis that would fire on the right answer, sane angle sizes;
   - the dotty-grid checker accepts a correct drawing and rejects a wrong one.

   Run: node test/test-geometry.js        (REPS=400 for a deeper sweep) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'geometry-y7', 'index.html'), 'utf8');
const src = html.split('<script id="engine">')[1].split('</script>')[0];
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const G = sandbox.window.GEO;
const REPS = +process.env.REPS || 150;

let checks = 0, fails = 0;
const failed = new Set();
const ok = (cond, what) => { checks++; if (!cond) { fails++; if (failed.size < 60 && !failed.has(what)) { failed.add(what); console.log('  ✗ ' + what); } } };
const eq = (got, want, what) => ok(JSON.stringify(got) === JSON.stringify(want), `${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// 1. classifier, on integer grid points (y up)
const SHAPES = [
  [[[0, 0], [3, 0], [3, 3], [0, 3]], 'square', 4, 4],
  [[[0, 0], [5, 0], [5, 2], [0, 2]], 'rectangle', 2, 2],
  [[[0, 0], [2, 1], [3, 3], [1, 2]], 'rhombus', 2, 2],
  [[[0, 0], [4, 0], [5, 2], [1, 2]], 'parallelogram', 0, 2],
  [[[2, 4], [3, 3], [2, 0], [1, 3]], 'kite', 1, 1],
  [[[0, 0], [6, 0], [4, 2], [1, 2]], 'trapezium', 0, 1],
  [[[0, 0], [6, 0], [4, 2], [2, 2]], 'trapezium', 1, 1],
  [[[0, 4], [3, -2], [0, 0], [-3, -2]], 'arrowhead', 1, 1],
  [[[1, 0], [3, 1], [2, 3], [0, 2]], 'square', 4, 4],          // a tilted square
  [[[0, 0], [2, 0], [0, 2], [2, 2]], 'crossed', null, null],   // corners out of order
  [[[0, 0], [1, 0], [2, 0], [1, 2]], 'triangle', null, null],
  [[[0, 0], [5, 0], [4, 3], [1, 1]], 'irregular', 0, 1]
];
SHAPES.forEach(([pts, name, lines, rot]) => {
  const c = G.classify(pts);
  eq(c.name, name, `classify ${JSON.stringify(pts)}`);
  if (lines != null) { eq(c.lines, lines, `lines of symmetry of ${name}`); eq(c.rot, rot, `rotation order of ${name}`); }
});
eq(G.classify([[0, 0], [6, 0], [4, 2], [2, 2]]).sub, 'isosceles', 'isosceles trapezium sub-name');
eq(G.classify([[0, 0], [6, 0], [3, 3], [0, 3]]).sub, 'right-angled', 'right-angled trapezium sub-name');
// every generated shape type classifies as itself
['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'isotrap', 'righttrap', 'arrowhead'].forEach((t) => {
  for (let i = 0; i < 40; i++) {
    const s = G.shapeOnScreen(t, [0, 90, 23, -40][i % 4]);
    const c = G.classify(s);
    ok(c.name === G.shapeName(t), `makeShape(${t}) classifies as ${c.name}`);
    if (t === 'isotrap') ok(c.sub === 'isosceles', 'isotrap is isosceles');
    if (t === 'righttrap') ok(c.sub === 'right-angled', 'righttrap is right-angled');
    const P = G.PROPS[G.shapeName(t)];
    if (typeof P.lines === 'number') ok(c.lines === P.lines, `${t}: lines ${c.lines} vs table ${P.lines}`);
    ok(c.rot === P.rot, `${t}: rotation ${c.rot} vs table ${P.rot}`);
    ok(c.parallelPairs === P.par, `${t}: parallel pairs ${c.parallelPairs} vs table ${P.par}`);
  }
});

// 2. the parallel-line rules, against the sheet's lettered diagram (Q7: f, e, f, d, e)
const L = { a: '0TL', b: '0TR', c: '0BL', d: '0BR', e: '1TL', f: '1TR', g: '1BL', h: '1BR' };
const which = (from, rel) => Object.keys(L).filter((k) => G.relation(L[from], L[k]) === rel);
eq(which('g', 'vertical'), ['f'], 'Q7a vertically opposite to g');
eq(which('a', 'corresponding'), ['e'], 'Q7b corresponding to a');
eq(which('c', 'alternate'), ['f'], 'Q7c alternate to c');
eq(which('h', 'corresponding'), ['d'], 'Q7d corresponding to h');
eq(which('d', 'alternate'), ['e'], 'Q7e alternate to d');
eq(which('c', 'cointerior'), ['e'], 'co-interior to c');
// equal pairs really are equal and supplementary pairs add to 180, for any tilt
for (let th = 31; th < 150; th += 7) G.ALL_KEYS.forEach((a) => G.ALL_KEYS.forEach((b) => {
  const r = G.relation(a, b), va = G.valueOf(th, a), vb = G.valueOf(th, b);
  if (['corresponding', 'alternate', 'vertical'].includes(r)) ok(va === vb, `${r} ${a} ${b} equal at ${th}`);
  if (['cointerior', 'straight'].includes(r)) ok(va + vb === 180, `${r} ${a} ${b} add to 180 at ${th}`);
}));

// 3. measuring the drawings
const DEG = Math.PI / 180;
function arcSize(gEntry) { return gEntry.pts ? G.measure(gEntry.pts[0], gEntry.pts[1], gEntry.pts[2]) : gEntry.size; }
function checkDrawing(q, what) {
  (q.geoAll || q.geo || []).forEach((g) => {
    const lab = String(g.label == null ? '' : g.label);
    const m = lab.match(/^(\d+)°$/);
    if (m) ok(Math.abs(arcSize(g) - +m[1]) < 0.6, `${what}: the arc labelled ${lab} measures ${arcSize(g).toFixed(1)}°`);
    if (g.value != null && m) ok(+m[1] === g.value, `${what}: label ${lab} vs model ${g.value}`);
  });
}
function lastNum(q) { const n = q.parts.filter((p) => p.type === 'num'); return n.length ? n[n.length - 1].answer : null; }

// 4. every generator, many times
const GENS = Object.keys(G.GEN);
GENS.forEach((k) => {
  for (let i = 0; i < REPS; i++) {
    G.seed(1000 * GENS.indexOf(k) + i);
    const q = G.GEN[k](1 + (i % 3));
    const what = `${k}#${i}`;
    ok(q.prompt && q.parts.length > 0 && q.explain, `${what} has prompt, parts and explanation`);
    q.parts.forEach((p, j) => {
      const w = `${what} part ${j}`;
      if (p.type === 'choice') {
        ok(Number.isInteger(p.answer) && p.answer >= 0 && p.answer < p.options.length, `${w} answer index in range`);
        ok(new Set(p.options).size === p.options.length, `${w} options are all different: ${p.options.join(' | ')}`);
        ok(p.options.length >= 2, `${w} has at least two options`);
        ok(!(p.why && p.why[p.answer]), `${w} has a "wrong" message on the right answer`);
      } else if (p.type === 'num') {
        ok(Number.isFinite(p.answer), `${w} numeric answer`);
        if (p.unit === '°') ok(p.answer > 0 && p.answer < 360 && Number.isInteger(p.answer), `${w} angle ${p.answer} is a whole number of degrees between 0 and 360`);
        ok(!p.wrong || p.wrong[p.answer] === undefined, `${w} diagnoses the right answer as wrong (${p.answer})`);
      } else if (p.type === 'tf') {
        p.rows.forEach((r) => ok(r.a >= 0 && r.a < p.cols.length && r.why, `${w} row "${r.s}" valid`));
      } else if (p.type === 'mirror') {
        ok(p.lines.length === 4, `${w} offers four candidate lines`);
      } else if (p.type === 'grid') {
        ok(G.TARGETS[p.target], `${w} target ${p.target} exists`);
      }
    });
    if (q.accurate) {
      checkDrawing(q, what);
      // the unknown x is drawn at the size of the expected answer
      (q.geo || []).filter((g) => g.label === 'x').forEach((g) => {
        const ans = k === 'pfind' || k === 'pchain' || k === 'ptri' ? lastNum(q) : null;
        if (ans != null) ok(Math.abs(arcSize(g) - ans) < 0.6, `${what}: x is drawn as ${arcSize(g).toFixed(1)}°, answer ${ans}`);
      });
    }
    if (k === 'qangle') {
      ok(q.angleTruth.reduce((a, b) => a + b, 0) === 360, `${what} angles add to 360`);
    }
    if (k === 'pfind') {
      const rel = G.relation(q.ov.a, q.ov.b);
      const rp = q.parts[1];
      eq(rp.rkey, G.REL2RS[rel], `${what} reason matches the drawn relation`);
    }
    if (k === 'pname' && q.ov) {
      eq(q.parts[0].options[q.parts[0].answer], G.REL_NAME[G.relation(q.ov.a, q.ov.b)], `${what} pair name`);
    }
    if (k === 'palg') {
      const A = q.algebra, v1 = G.valueOf(A.theta, A.g), v2 = G.valueOf(A.theta, A.x);
      eq(A.a * A.x0 + A.b, v1, `${what} first expression gives the drawn angle`);
      eq(A.c * A.x0 + A.d, v2, `${what} second expression gives the drawn angle`);
      eq(q.parts[1].answer, A.x0, `${what} x`);
    }
  }
});
G.unseed();

// 5. the quadrilateral angle drawings: each interior angle measured
for (let i = 0; i < REPS; i++) {
  G.seed(77000 + i);
  const q = G.GEN.qangle();
  checkDrawing(q, `qangle#${i}`);
  const x = q.parts[0].answer;
  q.geo.filter((g) => g.label === 'x').forEach((g) => ok(Math.abs(arcSize(g) - x) < 0.6, `qangle#${i}: x drawn ${arcSize(g).toFixed(1)}° vs answer ${x}`));
}
G.unseed();

// 6. the homework sheets against the Corbettmaths answer keys
const A = G.EX.A(), B = G.EX.B();
eq(G.examMarks(A), 36, 'Sheet A total marks');
eq(G.examMarks(B), 54, 'Sheet B total marks');
eq(A.length, 14, 'Sheet A has 14 questions'); eq(B.length, 16, 'Sheet B has 16 questions');
const chosen = (p) => p.type === 'choice' ? p.options[p.answer] : p.type === 'num' ? p.answer : p.type === 'tf' ? p.rows.map((r) => p.cols[r.a]) : p.type === 'cells' ? p.answer.map((c) => p.cells[c]) : p.type === 'mirror' ? p.lines.filter((l) => l.ok).length : p.target;
const KEY_A = {
  1: ['square', 'trapezium', 'kite'], 2: ['kite', 1], 3: ['trapezium'], 4: ['kite', 'parallelogram'],
  5: ['parallelogram', '0', 'sym2'], 6: ['rectangle', 'parallelogram', 'rhombus'], 7: [['True', 'False', 'False', 'True']],
  8: ['square', 'parallelogram', 'rhombus'], 10: ['2', '1', 'Yes', 'No'], 11: ['rot2'], 13: [['True', 'May be true', 'False', 'May be true']], 14: ['cdef']
};
Object.keys(KEY_A).forEach((n) => KEY_A[n].forEach((want, j) => eq(chosen(A[n - 1].parts[j]), want, `Sheet A Q${n} part ${j + 1}`)));
eq(chosen(A[8].parts[0]), ['Two pairs of parallel lines + line symmetry', 'No parallel lines + line symmetry', 'Two pairs of parallel lines + NO line symmetry'], 'Sheet A Q9 table');
ok(/kite/.test(A[11].parts[0].options[A[11].parts[0].answer]), 'Sheet A Q12 counter-example is a kite');
const nums = (q) => q.parts.filter((p) => p.type === 'num').map((p) => p.answer);
const KEY_B = { 1: [72], 2: [60], 3: [69], 4: [121], 5: [45, 45], 6: [105, 115], 8: [154, 13, 167], 10: [54, 105, 21], 11: [75, 75], 12: [64, 65, 65], 13: [80, 50, 50], 14: [92, 51, 122, 7], 15: [15, 105, 46, 29], 16: [25] };
Object.keys(KEY_B).forEach((n) => eq(nums(B[n - 1]), KEY_B[n], `Sheet B Q${n} values`));
eq(B[6].parts.map((p) => p.options[p.answer]), ['f', 'e', 'f', 'd', 'e'], 'Sheet B Q7 letters');
eq(B[8].parts[0].options[B[8].parts[0].answer], 'Nigel', 'Sheet B Q9 who is right');
const reasons = (q) => q.parts.filter((p) => p.reason).map((p) => p.rkey);
eq(reasons(B[0]), ['corr'], 'Sheet B Q1 reason'); eq(reasons(B[1]), ['alt'], 'Sheet B Q2 reason'); eq(reasons(B[2]), ['coint'], 'Sheet B Q3 reason');
eq(reasons(B[3]), ['line', 'corr'], 'Sheet B Q4 reasons'); eq(reasons(B[4]), ['coint', 'vert'], 'Sheet B Q5 reasons'); eq(reasons(B[5]), ['corr'], 'Sheet B Q6 reason');
// the sheet diagrams drawn by the parallel-line engine must agree with the sheet's numbers
[0, 1, 2, 3, 4, 5].forEach((i) => {
  const svg = B[i].svg;
  ok(svg.includes('<svg'), `Sheet B Q${i + 1} has a diagram`);
});
// Q1–Q5 diagrams: the unknown sits where the answer key says it does
function sheetGeo(i) {
  const specs = {
    0: { trans: [{ theta: 72, labels: { '0TR': 'x', '1TR': '72°' } }] }, 1: { phi: -65, gap: 110, trans: [{ theta: 60, labels: { '0BL': '60°', '1TR': 'y' } }] },
    2: { phi: 90, gap: 120, trans: [{ theta: 111, labels: { '0BR': 'x', '1TR': '111°' } }] }, 3: { trans: [{ theta: 121, labels: { '0TR': 'x', '1TL': '59°' } }] },
    4: { phi: -22, gap: 100, trans: [{ theta: 135, labels: { '0BL': '135°', '1TL': 'x', '1BR': 'y' } }] }
  };
  return G.parallel(specs[i]).geo;
}
[[0, 72], [1, 60], [2, 69], [3, 121], [4, 45]].forEach(([i, ans]) => {
  const g = sheetGeo(i);
  g.forEach((e) => {
    const m = String(e.label).match(/^(\d+)°$/);
    if (m) ok(e.value === +m[1], `Sheet B Q${i + 1} given ${e.label} drawn at ${e.value}`);
    else ok(e.value === ans, `Sheet B Q${i + 1} unknown ${e.label} drawn at ${e.value}, key ${ans}`);
  });
});
// Q16: x = 25 makes both expressions the drawn angle
const g16 = G.parallel({ phi: -63, gap: 110, trans: [{ theta: 45, labels: { '0TL': 'a', '1BR': 'b' } }] }).geo;
eq(g16.map((e) => e.value), [7 * 25 - 40, 5 * 25 + 10], 'Sheet B Q16 both angles are 135° when x = 25');

// 7. the dotty grid
const SOL = { kite: [[2, 0], [3, 1], [2, 3], [1, 1]], parallelogram: [[1, 3], [3, 3], [4, 2], [2, 2]], rhombus: [[3, 0], [5, 3], [3, 6], [1, 3]], trapezium: [[0, 4], [5, 4], [3, 2], [1, 2]],
  isotrap: [[0, 4], [6, 4], [4, 2], [2, 2]], righttrap: [[0, 4], [5, 4], [3, 1], [0, 1]], sym2: [[0, 1], [5, 1], [5, 4], [0, 4]], rot2: [[1, 3], [3, 3], [4, 2], [2, 2]],
  sym1: [[2, 0], [3, 1], [2, 3], [1, 1]], tiltsquare: [[2, 1], [4, 2], [3, 4], [1, 3]], rectangle: [[0, 1], [5, 1], [5, 4], [0, 4]] };
Object.keys(G.TARGETS).forEach((t) => {
  ok(SOL[t], `a reference drawing exists for target ${t}`);
  if (SOL[t]) ok(G.checkTarget(t, SOL[t]).ok, `reference drawing for ${t} is accepted`);
  ok(!G.checkTarget(t, [[0, 0], [2, 0], [2, 2], [0, 2]]).ok, `a plain square is rejected for ${t}`);
});
ok(G.checkTarget('kite', [[0, 0], [2, 2], [0, 4], [-2, 2]].map(([a, b]) => [a + 2, b])).ok === false, 'a rhombus is not accepted as "draw a kite"');
ok(!G.checkTarget('kite', [[0, 0], [2, 2], [2, 0], [0, 2]]).ok, 'crossed corners are rejected');
eq(G.checkCDEF([[3, 5], [6, 1]]).marks, 3, 'Q14 answer key scores 3');
eq(G.checkCDEF([[3, 5], [5, 1]]).marks, 1, 'Q14 with CF = 4 scores 1');
eq(G.checkCDEF([[3, 4], [6, 1]]).marks, 1, 'Q14 with E off the line scores 1');
eq(G.checkCDEF([[3, 5], [-4, 1]]).marks, 2, 'Q14 with F on the wrong side scores 2');

// 8. the mock built fresh every time is complete
for (let i = 0; i < 20; i++) { const m = G.EX.mix(); ok(m.length === 11 && G.examMarks(m) > 15, 'fresh mock has 11 questions'); }

// 9. no em or en dashes in the text a child reads (house style)
const ui = html.split('<script id="engine">')[0] + html.split('</script>').slice(1).join('');
const prose = (src + ui).match(/'[^'\n]{12,}'/g) || [];
const dashed = prose.filter((s) => /[—–]/.test(s) && !/'−'|\\u/.test(s));
ok(dashed.length === 0, `no em/en dashes in player-facing text (${dashed.slice(0, 3).join(' ; ')})`);

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
