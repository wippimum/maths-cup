/* test-fractions7.js — the Year 7 fraction levels added from CGP Section 5 (year7.js),
   checked for TRUTH: each answer is recomputed here with exact fraction arithmetic,
   independently of the steps that teach it, and the last step must accept it.
   Run: node test/test-fractions7.js */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'explanations', 'figures', 'steps', 'topics', 'unaided', 'year7']) Object.assign(W, require(path + f + '.js'));
const REPS = Number(process.env.REPS || 300);
let checks = 0, fails = 0; const seen = new Set();
const ok = (c, m) => { checks++; if (!c) { fails++; if (!seen.has(m) && seen.size < 30) { seen.add(m); console.log('  ✗ ' + m); } } };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (s) => { const m = String(s).match(/^(\d+)\/(\d+)$/); return m ? [+m[1], +m[2]] : null; };
const nums = (s) => (s.match(/\d+\/\d+/g) || []).map(frac);
const lowest = (f) => gcd(f[0], f[1]) === 1;
const val = (f) => f[0] / f[1];
const lastOK = (p) => p.steps[p.steps.length - 1].check(String(p.answer)).correct;

for (let i = 0; i < REPS; i++) {
  let p = W.equivMissing();
  const fs = p.given.match(/(\d+)\/(\d+) = (\?|\d+)\/(\d+|b)/);
  if (fs[3] === '?') ok(+fs[1] / +fs[2] === +p.answer / +fs[4], `equiv ${p.given} → ${p.answer}`);
  else ok(+fs[1] / +fs[2] === +fs[3] / +p.answer, `equiv ${p.given} → ${p.answer}`);
  ok(lastOK(p), 'equiv last step');

  p = W.cancelDown();
  const src = p.given.match(/(\d+) as a fraction of (\d+)/) ? p.given.match(/(\d+) as a fraction of (\d+)/).slice(1).map(Number) : frac(p.given.match(/(\d+\/\d+)/)[1]);
  const a = frac(p.answer); ok(Math.abs(val(a) - src[0] / src[1]) < 1e-12 && lowest(a), `cancel ${p.given} → ${p.answer}`); ok(lastOK(p), 'cancel last step');

  p = W.y7OrderFractions();
  const given = nums(p.given.split(':')[1]), order = p.answer.split(', ').map(frac);
  ok(order.length === 3 && order.every((f, k) => k === 0 || val(order[k - 1]) < val(f)), `order ${p.answer} is smallest first`);
  ok(given.every((g) => order.some((o) => o[0] === g[0] && o[1] === g[1])), 'order uses the original fractions'); ok(lastOK(p), 'order last step');

  p = W.restFraction();
  const [f1, f2] = nums(p.given), r = frac(p.answer);
  ok(Math.abs(val(r) - (1 - val(f1) - val(f2))) < 1e-12 && lowest(r), `rest ${p.given} → ${p.answer}`); ok(lastOK(p), 'rest last step');

  p = W.timesFraction();
  let m;
  if ((m = p.given.match(/^Work out {2}(\d+) × 1\/(\d+)$/))) ok(+p.answer === +m[1] / +m[2], `unit ${p.given}`);
  else if ((m = p.given.match(/^Find (\d+)\/(\d+) of (\d+)$/)) || (m = p.given.match(/^Work out {2}(\d+) × (\d+)\/(\d+)$/))) {
    const v = p.given.startsWith('Find') ? (+m[1] / +m[2]) * +m[3] : +m[1] * (+m[2] / +m[3]);
    ok(Math.abs(+p.answer - v) < 1e-9, `times ${p.given} → ${p.answer}`);
  } else { const [x, y] = nums(p.given), z = frac(p.answer); ok(Math.abs(val(z) - val(x) * val(y)) < 1e-12 && lowest(z), `times ${p.given} → ${p.answer}`); }
  ok(lastOK(p), 'times last step');

  p = W.fracDecimal();
  if ((m = p.given.match(/^Write (\d+)\/(\d+) as a decimal/))) {
    if (/…/.test(p.answer)) ok(String(+m[1] / +m[2]).startsWith(p.answer.replace('…', '').slice(0, 5)), `recurring ${p.given} → ${p.answer}`);
    else ok(+p.answer === +m[1] / +m[2], `decimal ${p.given} → ${p.answer}`);
  } else { const d = +p.given.match(/Write ([\d.]+) as a fraction/)[1], z = frac(p.answer); ok(Math.abs(val(z) - d) < 1e-12 && lowest(z), `back ${p.given} → ${p.answer}`); }
  ok(lastOK(p), 'decimal last step');
}
console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
