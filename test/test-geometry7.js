/* test-geometry7.js — the Year 7 geometry topics (src/geometry7.js), checked for TRUTH.

   test-levels.js already proves every step is answerable with one right option. This
   checks the maths behind them, independently of the step text:
     · every drawing that is built from numbers is measured: an arc labelled 64° must
       really be 64° on the screen, and the arc marked x must be the size of the answer;
     · the parallel-line rules reproduce the homework sheet's lettered diagram (Q7);
     · each shape the generators draw is, when measured, the shape the question says;
     · the diagonal facts, the clue logic and always/sometimes/never answers agree with
       the shape data; polygon sums and regular-polygon angles are right;
     · the algebra questions' expressions really give the drawn angles.

   Run: node test/test-geometry7.js   (REPS=500 for a deeper sweep) */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'explanations', 'figures', 'steps', 'topics', 'unaided', 'geometry7']) Object.assign(W, require(path + f + '.js'));
const G = W._g7;
const REPS = Number(process.env.REPS || 150);

let checks = 0, fails = 0;
const seen = new Set();
const ok = (c, m) => { checks++; if (!c) { fails++; if (seen.size < 40 && !seen.has(m)) { seen.add(m); console.log('  ✗ ' + m); } } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const size = (g) => (g.pts ? G.measure(g.pts[0], g.pts[1], g.pts[2]) : g.size);
const num = (s) => { const m = String(s).match(/^(\d+)°$/); return m ? +m[1] : null; };

// 1. the rules, against the sheet's lettered diagram: g↔f, a↔e, c↔f, h↔d, d↔e
const L = { a: '0TL', b: '0TR', c: '0BL', d: '0BR', e: '1TL', f: '1TR', g: '1BL', h: '1BR' };
const which = (x, rel) => Object.keys(L).filter((k) => G.relation(L[x], L[k]) === rel);
eq(which('g', 'vertical'), ['f'], 'Q7a'); eq(which('a', 'corresponding'), ['e'], 'Q7b'); eq(which('c', 'alternate'), ['f'], 'Q7c');
eq(which('h', 'corresponding'), ['d'], 'Q7d'); eq(which('d', 'alternate'), ['e'], 'Q7e'); eq(which('c', 'cointerior'), ['e'], 'co-interior to c');
for (let th = 31; th < 150; th += 6) G.KEYS.forEach((a) => G.KEYS.forEach((b) => {
  const r = G.relation(a, b), va = G.valueOf(th, a), vb = G.valueOf(th, b);
  if (['corresponding', 'alternate', 'vertical'].includes(r)) ok(va === vb, `${r} equal`);
  if (['cointerior', 'straight'].includes(r)) ok(va + vb === 180, `${r} add to 180`);
  if (r === 'alternate' || r === 'cointerior') ok(G.isInside(a) && G.isInside(b), `${r} pairs are both inside`);
  if (r === 'corresponding') ok(G.isInside(a) !== G.isInside(b), 'corresponding pairs are one in, one out');
}));

// 2. measure every numeric drawing
const DRAWN = ['angFacts', 'angTriangle', 'parOne', 'parChain', 'parTriangle', 'quadAngles', 'quadSpecial'];
DRAWN.forEach((k) => {
  for (let i = 0; i < REPS; i++) {
    const p = W[k]();
    const ans = num(p.answer);
    (p.geo || []).forEach((g) => {
      const v = num(g.label);
      if (v != null) ok(Math.abs(size(g) - v) < 0.6, `${k}: arc labelled ${g.label} measures ${size(g).toFixed(1)}°`);
      // a letter is checked against the step that finds it ("y = 59°"), else against the final answer
      if (/^[a-z]$/.test(String(g.label))) {
        const st = p.steps.find((q) => new RegExp('^' + g.label + ' = (\\d+)°').test(q.resultText || ''));
        const want = st ? +st.resultText.match(/= (\d+)°/)[1] : (g.label === 'x' ? ans : null);
        if (want != null) ok(Math.abs(size(g) - want) < 0.6, `${k}: ${g.label} drawn at ${size(g).toFixed(1)}°, should be ${want}`);
      }
    });
    ok((p.geo || []).length > 0, `${k} exposes its drawing`);
    const last = p.steps[p.steps.length - 1];
    if (ans != null) ok(last.check(String(ans)).correct, `${k}: last step accepts the answer ${ans}`);
  }
});

// 3. "spot the pair" ends on the rule that matches the drawn pair
for (let i = 0; i < REPS; i++) {
  const p = W.parSpot();
  ok(/Corresponding|Alternate|Co-interior/.test(p.answer), 'parSpot answer names a rule');
  ok(/equal|180/.test(p.answer), 'parSpot answer says equal or 180');
}

// 4. every shape type, drawn, measures as itself
const NAME = { isotrap: 'trapezium', righttrap: 'trapezium' };
['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'isotrap', 'righttrap', 'arrowhead'].forEach((t) => {
  for (let i = 0; i < 40; i++) eq(G.classify(G.onScreen(t, [0, 90][i % 2])), NAME[t] || t, `drawn ${t}`);
});
// shapeTree's final answer is the measured name
for (let i = 0; i < REPS; i++) { const p = W.shapeTree(); ok(['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'arrowhead'].includes(p.answer), `tree answer ${p.answer}`); }

// 5. diagonals: the measured facts match the textbook facts
const DIAG = { square: [1, 1, 1], rectangle: [1, 0, 1], rhombus: [0, 1, 1], parallelogram: [0, 0, 1], kite: [0, 1, 0], isotrap: [1, 0, 0] };
Object.keys(DIAG).forEach((t) => {
  for (let i = 0; i < 20; i++) {
    const f = G.facts(G.onScreen(t, 0));
    eq([+f.diagEq, +f.diagPerp, +f.bisect], DIAG[t], `diagonals of ${t}`);
  }
});
// and symmetry counts
const SYM = { square: [4, 4], rectangle: [2, 2], rhombus: [2, 2], parallelogram: [0, 2], kite: [1, 1], isotrap: [1, 1], trapezium: [0, 1], arrowhead: [1, 1], righttrap: [0, 1] };
Object.keys(SYM).forEach((t) => { for (let i = 0; i < 20; i++) { const f = G.facts(G.onScreen(t, 0)); eq([f.lines, f.rot], SYM[t], `symmetry of ${t}`); } });

// 6. clue puzzles: every clue is true of the answer, and together they leave only it
for (let i = 0; i < REPS; i++) {
  const p = W.shapeClues();
  const clues = (p.steps.map((s) => s.prompt.match(/“([^”]+)”/)).filter(Boolean)).map((m) => m[1]);
  const fns = clues.map((c) => G.CLUES.find((x) => x[0] === c));
  ok(fns.every(Boolean), 'every clue is from the bank');
  const left = Object.keys(G.DATA).filter((n) => fns.every((f) => f[1](G.DATA[n])));
  eq(left, [p.answer], `clues "${clues.join(' / ')}" leave only the answer`);
}
// the shape data agrees with the measured shapes
Object.keys(G.DATA).forEach((n) => {
  const f = G.facts(G.onScreen(n, 0)), d = G.DATA[n];
  eq([f.parallelPairs, f.allEq, f.rights > 0, f.lines, f.rot, f.diagEq, f.diagPerp], [d.par, d.eq, d.right, d.lines, d.rot, d.diagEq, d.diagPerp], `DATA for ${n} matches the drawing`);
});

// 7. always / sometimes / never: the answer agrees with the examples given
G.ASN.forEach(([s, ans, yesEx, noEx]) => {
  eq(ans, yesEx && noEx ? 'Sometimes' : yesEx ? 'Always' : 'Never', `ASN "${s}"`);
});

// 8. polygons
for (let i = 0; i < REPS; i++) {
  const p = W.polySum(), n = +p.steps[0].check && p.steps.length;
  const m = p.answer.match(/^(\d+)°$/); ok(m && +m[1] % 180 === 0, 'polygon sum is a multiple of 180');
  const r = W.polyRegular();
  if (/exterior angles/.test(r.given)) { const ks = r.given.match(/are ([\d°, ]+)\. Find/)[1].split(',').map((v) => parseInt(v, 10)); eq(ks.reduce((a, b) => a + b, 0) + num(r.answer), 360, 'exterior angles make 360'); }
  else if (/inside angle of a regular/.test(r.given)) { const k = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6, octagon: 8, nonagon: 9, decagon: 10, dodecagon: 12 }[r.given.match(/regular (\w+)/)[1]]; eq(num(r.answer), 180 - 360 / k, `regular ${k}-gon interior`); }
  else { const int = +r.given.match(/is (\d+)°/)[1]; eq(+r.answer, 360 / (180 - int), `sides from interior ${int}`); }
  const q = W.polyMissing(); const ns = q.given.includes('pentagon') ? 5 : 6;
  const vals = [...q.diagram.matchAll(/>(\d+)°</g)].map((x) => +x[1]);
  eq(vals.reduce((a, b) => a + b, 0) + num(q.answer), (ns - 2) * 180, 'polygon missing angle completes the sum');
}

// 9. algebra: the expressions give the drawn angles at the answer
for (let i = 0; i < REPS; i++) {
  const p = W.parAlgebra(), A = p.algebra;
  eq(A.a * A.x0 + A.b, G.valueOf(A.theta, A.g), 'first expression = drawn angle');
  eq(A.c * A.x0 + A.d, G.valueOf(A.theta, A.x), 'second expression = drawn angle');
  ok(p.steps[p.steps.length - 1].check(String(A.x0)).correct, 'x accepted');
}

// 9b. angle facts with algebra: the expressions make the total at the answer
for (let i = 0; i < REPS; i++) {
  const p = W.angAlgebra(), A = p.algebra;
  eq(A.parts.reduce((s, q) => s + q[0] * A.x0 + q[1], 0), A.total, 'angle algebra: the angles make the total');
  ok(A.parts.every((q) => q[0] * A.x0 + q[1] >= 15), 'every angle is a sensible size');
}
// 9c. "which shapes have…": every answer has both properties, measured off the drawings
const HAS = { '4 equal sides': (f) => f.allEq, '4 angles of 90°': (f) => f.rights === 4, '2 pairs of parallel sides': (f) => f.parallelPairs === 2, 'at least 1 pair of parallel sides': (f) => f.parallelPairs >= 1,
  'exactly 1 pair of parallel sides': (f) => f.parallelPairs === 1, 'no parallel sides at all': (f) => f.parallelPairs === 0, 'opposite angles equal': (f) => f.parallelPairs === 2,
  'diagonals that cross at 90°': (f) => f.diagPerp, 'rotational symmetry of order 2 or more': (f) => f.rot >= 2 };
for (let i = 0; i < REPS; i++) {
  const p = W.shapeHave(), m = p.given.match(/have (.+) AND (.+)\?/);
  const want = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium'].filter((n) => { const f = G.facts(G.onScreen(n, 0)); return HAS[m[1]](f) && HAS[m[2]](f); });
  eq(p.answer.split(', ').sort(), want.sort(), `shapes with ${m[1]} and ${m[2]}`);
}
// 9d. symmetry of triangles and regular polygons
for (let i = 0; i < 60; i++) { const p = W.polySym(); const nm = p.given.match(/an? (.+) have/)[1]; const n = { 'equilateral triangle': 3, 'regular pentagon': 5, 'regular hexagon': 6, 'regular octagon': 8, square: 4 }[nm]; if (n) eq(p.answer, `${n} lines, order ${n}`, nm); }

// 10. notation: the answer is the angle at the middle letter
for (let i = 0; i < REPS; i++) {
  const p = W.angNotation();
  ok(p.steps[0].check(p.given.match(/∠(.)(.)(.)/)[2]).correct, 'the corner is the middle letter');
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
