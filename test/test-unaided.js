/* test-unaided.js — the "No steps — just the answer" level of every topic.

   These levels remove the scaffolding: one question, one answer, no walk-through. That
   makes them easy to get subtly wrong in ways the other suites would not catch, because
   nothing here is a new generator — it is existing questions with their steps taken off.
   Four things have to hold, and each of them was broken at some point while building it:

     · it really is ONE step (Problem Solving quietly served a full guided lesson,
       because buildMatchFor special-cases that subject and never called the level)
     · the step can be answered on its own — it has options or cards. A step with
       neither is a typed LINE, transforming the line above it, and with those lines
       gone there is nothing to transform (the equation topics work that way)
     · it is never a coin toss: at least three options when it is a choice
     · the worked solution is still reachable behind Hint, and names the answer

   Run: node test/test-unaided.js */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'mathfmt', 'unaided', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2', 'year7',
  'harder', 'harder2', 'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}
const REPS = Number(process.env.REPS || 60);
let checks = 0, fails = 0, shown = 0;
const bad = (m) => { fails++; if (shown++ < 20) console.log('  ✗ ' + m); };
const ok = () => { checks++; };

const solo = [];
for (const s of W.SUBJECTS) {
  const ls = s.levels.filter((l) => /-solo$/.test(l.id));
  if (ls.length > 1) bad(`${s.id} has ${ls.length} no-steps levels — there should be exactly one`);
  for (const l of ls) solo.push({ subject: s.id, level: l.id, year: s.year || 6 });
}
if (!solo.length) bad('no no-steps levels found at all');
console.log(`Checking ${solo.length} "no steps" levels, ${REPS} questions each…\n`);

for (const { subject, level } of solo) {
  let faults = 0;
  const note = (m) => { faults++; bad(`${level}: ${m}`); };
  for (let i = 0; i < REPS; i++) {
    let p;
    try { p = W.buildMatchFor(subject, level, 1)[0]; }
    catch (e) { note(`threw: ${e.message}`); continue; }
    if (!p) { note('produced nothing'); continue; }

    if (p.steps.length === 1) ok();
    else { note(`${p.steps.length} steps — the whole point is that there is one`); continue; }
    const st = p.steps[0];

    if (st.isAnswer) ok(); else note('its only step is not marked as the answer');
    // answerable standing alone
    if (W.unaidedIsSelfContained(st)) ok();
    else note(`nothing to answer with — no cards, and ${(st.pool || []).length} options`);
    if (!st.pool || st.pool.length >= 3) ok(); else note(`only ${st.pool.length} options — that is a guess, not a question`);
    // Exactly one right answer among the options — but only for single-choice steps.
    // A "tap everything that belongs" step is checked against the whole SELECTION, so
    // testing its options one at a time is meaningless; what matters there is that it
    // discriminates at all, i.e. tapping the lot is not accepted.
    if (st.pool && !st.multi) {
      const right = st.pool.filter((v) => { try { return st.check(v).correct; } catch (e) { return false; } }).length;
      if (right === 1) ok(); else note(`${right} of ${st.pool.length} options are accepted`);
    } else if (st.pool && st.multi) {
      let all = false;
      try { all = st.check(st.pool.slice()).correct; } catch (e) { all = false; }
      if (!all) ok(); else note('tapping every option is accepted — it does not discriminate');
    }
    // help on request
    if ((st.hint || '').includes(String(p.answer))) ok(); else note('the hint does not give the answer');
    if ((st.longWay || '').length > 3) ok(); else note('no working behind the hint');
    if ((st.why || '').length > 40) ok(); else note('no "why" worth reading');
    // the prompt must not refer to work that is no longer on screen
    if (!/\b(now add|now take|now the|so far|you just|the answer you)\b/i.test(st.prompt)) ok();
    else note(`the prompt refers back to steps that are gone: "${st.prompt}"`);
    // a diagram question must keep its diagram, or it cannot be answered
    if (!/angles|area|volume|graphs|coords/.test(subject) || p.diagram || !/diagram|shown|this /i.test(p.given)) ok();
    else note(`"${p.given}" needs a diagram and has none`);
  }
  console.log(`  ${faults ? '✗' : '✓'} ${level.padEnd(16)} ${faults ? faults + ' faults' : 'ok'}`);
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
