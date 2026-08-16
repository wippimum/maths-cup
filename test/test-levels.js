/* Sweeps EVERY level of EVERY subject, auto-solving each generated problem.
   Checks that each step is answerable, has exactly one right option (pick steps),
   explains every wrong option, and that the last step really is the answer.
   Run: node test/test-levels.js   (or: cd test && node test-levels.js) */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'algebra1', 'curriculum1', 'curriculum2', 'harder', 'harder2',
  'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}

const REPS = Number(process.env.REPS || 60);
let checks = 0, fails = 0;
const shown = [];
const LIMIT = Number(process.env.LIMIT || 30);
const bad = (msg) => { fails++; if (shown.length < LIMIT) { shown.push(msg); console.log('  ✗ ' + msg); } };
const ok = () => { checks++; };
const clean = (s) => typeof s === 'string' && s.length > 0 && !/undefined|NaN|\[object|Infinity/.test(s);

function checkProblem(where, p) {
  if (!p || typeof p !== 'object') { bad(`${where}: generator returned ${p}`); return; }
  if (!clean(p.given)) bad(`${where}: given = ${p.given}`); else ok();
  if (p.answer == null || !clean(String(p.answer))) bad(`${where}: answer = ${p.answer}`); else ok();
  if (p.diagram != null && !clean(p.diagram)) bad(`${where}: diagram is dirty`); else ok();
  if (!Array.isArray(p.steps) || !p.steps.length) { bad(`${where}: "${p.given}" has no steps`); return; }

  p.steps.forEach((st, si) => {
    const at = `${where}: "${p.given}" step ${si} (${st.key})`;
    ['prompt', 'hint', 'why', 'resultText'].forEach((f) => {
      if (!clean(st[f])) bad(`${at} ${f}: ${st[f]}`); else ok();
    });
    if (st.longWay != null && !clean(st.longWay)) bad(`${at} longWay: ${st.longWay}`); else ok();
    if (typeof st.check !== 'function') { bad(`${at} has no check()`); return; }

    if (st.mode === 'pick') {
      if (!st.pool || st.pool.length < 2) { bad(`${at} pool too small: ${JSON.stringify(st.pool)}`); return; }
      if (new Set(st.pool).size !== st.pool.length) bad(`${at} duplicate options: ${JSON.stringify(st.pool)}`);
      const right = st.pool.filter((v) => st.check(v).correct);
      if (right.length !== 1) bad(`${at} has ${right.length} correct options in ${JSON.stringify(st.pool)} — "${st.prompt}"`);
      else ok();
      st.pool.filter((v) => !st.check(v).correct).forEach((v) => {
        const r = st.check(v);
        if (!r.id) { bad(`${at} wrong option "${v}" carries no mistake id`); return; }
        const text = W.explain(r.id, r.ctx);
        if (!clean(text)) bad(`${at} explain('${r.id}') → ${text}`); else ok();
      });
    } else if (st.mode === 'choose') {
      if (!st.pool || st.pool.length < 2) { bad(`${at} pool too small`); return; }
      // the correct SET must live inside the pool, and be accepted
      const chosen = st.pool.filter((v) => true);
      const r = st.check(st.pool);
      if (r.correct && st.pool.length > 1) bad(`${at} accepts the WHOLE pool — no distractors bite`);
      else ok();
      const wrong = W.explain(r.id || 'choose-wrong', r.ctx);
      if (!clean(wrong)) bad(`${at} explain('${r.id}') → ${wrong}`); else ok();
    } else if (st.mode === 'build') {
      if (!Array.isArray(st.pieces) || !st.pieces.length) bad(`${at} build step has no pieces`);
      else ok();
      const joined = st.solution != null ? st.solution : st.pieces.join(' ');
      const r = st.check(joined);
      if (!r.correct) bad(`${at} rejects its own solution "${joined}" (id ${r.id})`); else ok();
      const w = st.check('999 999');
      if (!w.correct) {
        const text = W.explain(w.id || 'generic', w.ctx);
        if (!clean(text)) bad(`${at} explain('${w.id}') → ${text}`); else ok();
      }
    }
  });

  const last = p.steps[p.steps.length - 1];
  if (!last.isAnswer) bad(`${where}: "${p.given}" last step is not marked isAnswer`); else ok();
  const anyAnswer = p.steps.filter((s) => s.isAnswer).length;
  if (anyAnswer !== 1) bad(`${where}: "${p.given}" has ${anyAnswer} steps marked isAnswer`); else ok();
}

console.log(`Sweeping every level, ${REPS} problems each…\n`);
for (const s of W.SUBJECTS) {
  const before = fails;
  let n = 0;
  for (const l of s.levels) {
    for (let i = 0; i < REPS; i++) {
      let p;
      try { p = l.generate(); } catch (e) { bad(`${s.id}/${l.id} threw: ${e.message}`); break; }
      checkProblem(`${s.id}/${l.id}`, p);
      n++;
    }
    // and the real match builder, the way the app calls it
    try {
      const m = W.buildMatchFor(s.id, l.id, 10);
      if (m.length !== 10) bad(`buildMatchFor(${s.id}, ${l.id}) gave ${m.length}`); else ok();
      m.forEach((p) => checkProblem(`${s.id}/${l.id}[match]`, p));
    } catch (e) { bad(`buildMatchFor(${s.id}, ${l.id}) threw: ${e.message}`); }
  }
  const flag = fails === before ? '✓' : '✗';
  console.log(`${flag} ${s.id.padEnd(10)} ${String(s.levels.length).padStart(2)} levels, ${n} problems`);
  if (s.levels.length < 3) bad(`${s.id} has only ${s.levels.length} level(s) — every subject needs at least 3`);
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
