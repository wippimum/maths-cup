/* Auto-solves every BIDMAS problem the app can generate and checks it independently.
   Run: node test/test-bidmas.js  (or: cd test && node test-bidmas.js) */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2', 'harder', 'harder2',
  'solving', 'bidmas', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}

let checks = 0, fails = 0;
const bad = (msg) => { fails++; if (fails < 25) console.log('  ✗ ' + msg); };
const ok = () => { checks++; };

// independent value of the printed line, via plain JS
function evalGiven(given) {
  const js = given
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/²/g, '**2').replace(/³/g, '**3');
  // guard: only digits, operators, brackets, spaces, *
  if (!/^[0-9+\-*/(). ]+$/.test(js)) throw new Error('unparseable: ' + given + ' -> ' + js);
  return eval(js);
}

const LEVELS = [
  ['bid-spot', W.bidmasSpot], ['bid-md', W.bidmasMD], ['bid-brackets', W.bidmasBrackets],
  ['bid-lr', W.bidmasLR], ['bid-indices', W.bidmasIndices], ['bid-mix', W.bidmasMix],
];

const clean = (s) => typeof s === 'string' && s.length > 0 && !/undefined|NaN|\[object/.test(s);

for (const [name, gen] of LEVELS) {
  const before = fails;
  const seen = new Set();
  for (let i = 0; i < 250; i++) {
    const p = gen();
    seen.add(p.given);
    const truth = evalGiven(p.given);

    // 1. the printed sum really evaluates to the stated answer
    if (name !== 'bid-spot') {
      if (Number(p.answer) !== truth) bad(`${name}: ${p.given} → app says ${p.answer}, really ${truth}`);
      else ok();
    }
    if (!Number.isInteger(truth) || truth < 0) bad(`${name}: ${p.given} = ${truth} (not a kind whole number)`);
    else ok();

    // 2. every step is solvable, with exactly one right option
    if (!p.steps.length) bad(`${name}: ${p.given} has no steps`);
    p.steps.forEach((st, si) => {
      if (!clean(st.prompt)) bad(`${name}: ${p.given} step ${si} prompt: ${st.prompt}`);
      else ok();
      if (!clean(st.hint)) bad(`${name}: ${p.given} step ${si} hint: ${st.hint}`);
      else ok();
      if (!clean(st.why)) bad(`${name}: ${p.given} step ${si} why: ${st.why}`);
      else ok();
      if (!clean(st.resultText)) bad(`${name}: ${p.given} step ${si} resultText: ${st.resultText}`);
      else ok();

      if (st.mode !== 'pick') { bad(`${name}: unexpected mode ${st.mode}`); return; }
      if (!st.pool || st.pool.length < 2) bad(`${name}: ${p.given} step ${si} pool too small: ${JSON.stringify(st.pool)}`);
      if (new Set(st.pool).size !== st.pool.length) bad(`${name}: ${p.given} step ${si} duplicate options: ${JSON.stringify(st.pool)}`);

      const right = st.pool.filter((v) => st.check(v).correct);
      if (right.length !== 1) {
        bad(`${name}: ${p.given} step ${si} has ${right.length} correct options in ${JSON.stringify(st.pool)} — prompt: ${st.prompt}`);
      } else ok();

      // 3. every wrong option produces a readable explanation
      st.pool.filter((v) => !st.check(v).correct).forEach((v) => {
        const r = st.check(v);
        if (!r.id) { bad(`${name}: ${p.given} step ${si} wrong option ${v} carries no mistake id`); return; }
        const text = W.explain(r.id, r.ctx);
        if (!clean(text)) bad(`${name}: explain('${r.id}') → ${text}`);
        else ok();
      });
    });

    // 4. the final step's right answer is the real answer
    const last = p.steps[p.steps.length - 1];
    if (!last.isAnswer) bad(`${name}: ${p.given} last step is not marked isAnswer`);
    else ok();
    if (name !== 'bid-spot') {
      if (!last.check(String(truth)).correct) bad(`${name}: ${p.given} final step rejects the true answer ${truth}`);
      else ok();
    }
  }
  console.log(`${fails === before ? '✓' : '✗'} ${name.padEnd(14)} ${seen.size} distinct sums`);
}

// the whole app still builds a match for every level of every subject
for (const s of W.SUBJECTS) {
  for (const l of s.levels) {
    try {
      const m = W.buildMatchFor(s.id, l.id, 10);
      if (m.length !== 10) bad(`buildMatchFor(${s.id}, ${l.id}) gave ${m.length}`); else ok();
    } catch (e) { bad(`buildMatchFor(${s.id}, ${l.id}) threw: ${e.message}`); }
  }
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
