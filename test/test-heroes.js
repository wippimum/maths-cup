/* test-heroes.js — Year 2, Web Hero Academy (heroes.html).

   heroes.html is a single self-contained page, not part of the src/ module tree, so
   it needs its own harness: pull the <script> out, run it against a stub DOM, and
   then hammer every level generator.

   What it checks, per level, over many draws:
     · the question has an answer, a hint, a spoken line and some HTML
     · a multiple-choice pool contains the right answer EXACTLY once — a pool that
       holds the answer twice, or not at all, is the bug that hands a 6-year-old
       either a free point or an impossible question
     · a keypad answer is a whole number of at most 3 digits, because the pad stops
       at 3 characters (G.typed.length<3) and a 4-digit answer could never be typed
     · the numbers are Year 2 numbers — nothing above 120
     · for every counting level the answer is RE-DERIVED from the sequence shown on
       screen, independently of what the generator claimed
     · for the true/false and sign levels the claim is re-derived from arithmetic

   Run: node test/test-heroes.js */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'heroes.html'), 'utf8');
const body = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
if (!body) { console.log('✗ no <script> found in heroes.html'); process.exit(1); }

// ---------- the smallest DOM the page will start against ----------
const el = () => ({
  innerHTML: '', textContent: '', className: '', style: {}, dataset: {}, value: '',
  classList: { add() {}, remove() {}, contains: () => false },
  appendChild() {}, insertAdjacentHTML() {}, remove() {}, focus() {},
  querySelector: () => el(), querySelectorAll: () => [],
  addEventListener() {}, getContext: () => ({
    clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillRect() {},
  }),
});
const store = {};
const sandbox = {
  document: {
    getElementById: () => el(), createElement: () => el(), querySelectorAll: () => [],
    addEventListener() {}, body: el(),
  },
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  },
  matchMedia: () => ({ matches: true }),          // reduced motion: skips confetti
  requestAnimationFrame() {}, setTimeout() {},
  innerWidth: 900, innerHeight: 600,
  Math, Date, JSON, Array, Object, String, Number, Set, isNaN, parseInt, parseFloat, console,
};
sandbox.window = sandbox;

let api;
try {
  const fn = new Function(...Object.keys(sandbox),
    `${body}\n;return { LEVELS, BADGES, BADGE_TEST, S, checkBadges };`);
  api = fn(...Object.values(sandbox));
} catch (e) {
  console.log('✗ heroes.html threw while loading: ' + e.message);
  process.exit(1);
}
const { LEVELS, BADGES, BADGE_TEST, S } = api;

let checks = 0, fails = 0;
const ok = () => { checks++; };
const bad = (m) => { checks++; fails++; if (fails <= 30) console.log('  ✗ ' + m); };

// numbers written on the rooftop tiles, in order
function roofNums(htmlStr) {
  const tiles = [...htmlStr.matchAll(/<div class="roof[^"]*">([^<]*)<\/div>/g)].map((m) => m[1].trim());
  return tiles.map((t) => (t === '?' ? null : Number(t)));
}
// re-derive the missing term of an arithmetic sequence from what is on screen
function missingFromSequence(nums) {
  const i = nums.indexOf(null);
  if (i < 0) return null;
  const known = nums.map((v, j) => [j, v]).filter(([, v]) => v !== null);
  if (known.length < 2) return null;
  const [j0, v0] = known[0], [j1, v1] = known[1];
  const step = (v1 - v0) / (j1 - j0);
  if (!Number.isInteger(step)) return null;
  // every known term must sit on the same line, or the sequence itself is broken
  for (const [j, v] of known) if (v !== v0 + step * (j - j0)) return null;
  return v0 + step * (i - j0);
}

console.log(`Web Hero Academy: ${LEVELS.length} levels, ${BADGES.length} badges\n`);

const REPS = Number(process.env.REPS || 400);
for (let i = 0; i < LEVELS.length; i++) {
  const L = LEVELS[i];
  const before = fails;
  const kinds = new Set(), sigs = new Set();

  for (let r = 0; r < REPS; r++) {
    let q;
    try { q = L.gen(); } catch (e) { bad(`L${i + 1} ${L.t}: threw — ${e.message}`); continue; }
    if (!q) { bad(`L${i + 1} ${L.t}: generated nothing`); continue; }
    kinds.add(q.kind); sigs.add(String(q.html));

    if (!q.html || !String(q.html).trim()) bad(`L${i + 1} ${L.t}: empty question HTML`);
    if (!q.say || !String(q.say).trim()) bad(`L${i + 1} ${L.t}: nothing for the voice to read`);
    if (!q.hint || !String(q.hint).trim()) bad(`L${i + 1} ${L.t}: no hint — the hint IS the teaching`);
    if (q.ans === undefined || q.ans === null || q.ans === '') { bad(`L${i + 1} ${L.t}: no answer`); continue; }

    if (q.kind === 'choice') {
      if (!Array.isArray(q.opts) || q.opts.length < 2) {
        bad(`L${i + 1} ${L.t}: only ${(q.opts || []).length} option(s) — one card hands over the answer`);
      } else {
        const hits = q.opts.filter((o) => String(o) === String(q.ans)).length;
        if (hits !== 1) bad(`L${i + 1} ${L.t}: answer ${q.ans} appears ${hits}× in [${q.opts.join(', ')}]`);
        else ok();
      }
    } else if (q.kind === 'pad') {
      const n = Number(q.ans);
      if (!Number.isInteger(n) || n < 0) bad(`L${i + 1} ${L.t}: keypad answer "${q.ans}" is not a whole number`);
      else if (String(n).length > 3) bad(`L${i + 1} ${L.t}: answer ${n} needs ${String(n).length} digits, the pad allows 3`);
      else ok();
    } else {
      bad(`L${i + 1} ${L.t}: unknown question kind "${q.kind}"`);
    }

    // Year 2 numbers only. Scan the TEXT the child reads, never the markup — the
    // first version of this test read "max-width:360px" out of a style attribute
    // and reported 360 as an out-of-range number 170 times.
    const shown = String(q.html).replace(/<[^>]*>/g, ' ');
    const big = (shown.match(/\d+/g) || []).map(Number).filter((v) => v > 120);
    if (big.length) bad(`L${i + 1} ${L.t}: ${big[0]} is past Year 2 (keep it to 120)`);
    else ok();

    // independent re-derivation
    if (String(q.html).includes('class="roof')) {
      const nums = roofNums(q.html);
      const want = missingFromSequence(nums);
      if (want === null) bad(`L${i + 1} ${L.t}: the sequence on screen is not a steady count — ${nums.join(', ')}`);
      else if (want !== Number(q.ans)) bad(`L${i + 1} ${L.t}: screen says ${nums.join(', ')} so the gap is ${want}, but the answer is ${q.ans}`);
      else ok();
      if (nums.some((v) => v !== null && v < 0)) bad(`L${i + 1} ${L.t}: counted past zero into negatives — ${nums.join(', ')}`);
      else ok();
    }
    const tf = String(q.html).match(/<span class="big">(\d+)\s*([×÷])\s*(\d+)\s*=\s*(\d+)\s*([×÷])\s*(\d+)<\/span>/);
    if (tf) {
      const [, a, s1, b, c, s2, d] = tf;
      const ev = (x, s, y) => (s === '×' ? Number(x) * Number(y) : Number(x) / Number(y));
      const want = ev(a, s1, b) === ev(c, s2, d) ? 'True' : 'False';
      if (want !== String(q.ans)) bad(`L${i + 1} ${L.t}: ${a}${s1}${b} = ${c}${s2}${d} is ${want}, answered ${q.ans}`);
      else ok();
    }
    const sign = String(q.html).match(/<span class="big">(\d+) \? (\d+) = (\d+)<\/span>/);
    if (sign) {
      const [, a, b, c] = sign.map(Number);
      const want = a * b === c ? '×' : a / b === c ? '÷' : a + b === c ? '+' : null;
      if (want === null) bad(`L${i + 1} ${L.t}: no sign makes ${a} ? ${b} = ${c} true`);
      else if (want !== String(q.ans)) bad(`L${i + 1} ${L.t}: ${a} ? ${b} = ${c} needs ${want}, answered ${q.ans}`);
      else ok();
    }
  }

  // a level that always asks the same thing is a level she has already finished
  if (sigs.size < 6) bad(`L${i + 1} ${L.t}: only ${sigs.size} different question(s) in ${REPS} draws`);
  else ok();
  console.log(`${fails === before ? '✓' : '✗'} ${String(i + 1).padStart(2)} ${L.t.padEnd(28)} ${[...kinds].join('+').padEnd(12)} ${sigs.size} distinct`);
}

// ---------- badges ----------
console.log('\nBadges:');
const ids = new Set();
for (const b of BADGES) {
  if (ids.has(b.id)) bad(`duplicate badge id "${b.id}"`); else { ids.add(b.id); ok(); }
  if (!BADGE_TEST[b.id]) bad(`badge "${b.id}" has no test`); else ok();
  if (!b.e || !b.n || !b.w) bad(`badge "${b.id}" is missing its emoji, name or how-to`); else ok();
}
// a fresh save must win nothing, and a maxed-out save must win everything
const fresh = { stars: Array(LEVELS.length).fill(0), best: 0, correct: 0, perfect: 0, days: ['x'], badges: [], flawless: false };
const maxed = { stars: Array(LEVELS.length).fill(3), best: 99, correct: 999, perfect: 9, days: ['a','b','c','d','e','f','g'], badges: [], flawless: true };
for (const [label, st] of [['a brand-new save', fresh], ['a completed save', maxed]]) {
  Object.assign(S, st);
  const won = BADGES.filter((b) => { try { return BADGE_TEST[b.id](); } catch (e) { return false; } });
  const want = label === 'a brand-new save' ? 0 : BADGES.length;
  if (won.length !== want) bad(`${label}: ${won.length} badge(s) win, expected ${want} (${won.map((b) => b.id).join(',')})`);
  else ok();
  console.log(`  ${won.length === want ? '✓' : '✗'} ${label}: ${won.length}/${BADGES.length} badges`);
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
