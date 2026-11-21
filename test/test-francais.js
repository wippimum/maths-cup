/* Checks the French module (examen-de-francais/index.html): the conjugation engine
   against forms checked by hand, the teacher's worksheet answers, every question bank,
   and the mistake diagnoses. Loads only the <script id="engine"> block, no browser.

   Run: node test/test-francais.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'examen-de-francais', 'index.html'), 'utf8');
const src = html.split('<script id="engine">')[1].split('</script>')[0];
const textes = html.split('<script id="textes">')[1].split('</script>')[0];
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
vm.runInNewContext(textes, sandbox);
const F = sandbox.window.FR;

let checks = 0, fails = 0;
const eq = (got, want, what) => {
  checks++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) { fails++; console.log(`  ✗ ${what}: got ${g}, want ${w}`); }
};

// 1. imparfait, including the spelling traps (-ger, -cer, -iss-, être, -ier/-ire double i)
const IMP = [
  ['jouer', 0, 'jouais'], ['finir', 3, 'finissions'], ['être', 2, 'était'], ['être', 5, 'étaient'],
  ['manger', 0, 'mangeais'], ['manger', 3, 'mangions'], ['manger', 4, 'mangiez'], ['lancer', 2, 'lançait'],
  ['lancer', 3, 'lancions'], ['commencer', 5, 'commençaient'], ['faire', 1, 'faisais'], ['boire', 2, 'buvait'],
  ['voir', 3, 'voyions'], ['crier', 3, 'criions'], ['rire', 4, 'riiez'], ['avoir', 1, 'avais'],
  ['grandir', 5, 'grandissaient'], ['pleuvoir', 2, 'pleuvait'], ['neiger', 2, 'neigeait'], ['aboyer', 2, 'aboyait'],
  ['prendre', 0, 'prenais'], ['dire', 5, 'disaient'], ['écrire', 2, 'écrivait'], ['naître', 2, 'naissait'],
];
IMP.forEach(([v, p, w]) => eq(F.imp(v, p), w, `imparfait ${v} p${p}`));

// 2. passé composé, auxiliary and agreement
const PC = [
  ['manger', 0, null, ['ai mangé']], ['partir', 5, 'f', ['sont parties']], ['tomber', 2, 'm', ['est tombé']],
  ['aller', 0, null, ['suis allé', 'suis allée']], ['venir', 3, null, ['sommes venus', 'sommes venues']],
  ['être', 2, 'm', ['a été']], ['avoir', 3, null, ['avons eu']], ['naître', 2, 'f', ['est née']],
  ['mourir', 5, 'm', ['sont morts']], ['prendre', 1, null, ['as pris']], ['choisir', 1, null, ['as choisi']],
];
PC.forEach(([v, p, g, w]) => eq(F.pcForms(v, p, g), w, `passé composé ${v} p${p} ${g}`));

// 3. every verb of the maison d'être really takes être, and être/avoir take avoir
F.MAISON.forEach((v) => eq(F.V[v] && F.V[v].aux, 'être', `${v} in the maison d'être`));
eq(F.V['être'].aux, 'avoir', 'être takes avoir'); eq(F.V.avoir.aux, 'avoir', 'avoir takes avoir');

// 4. the worksheet, exercise by exercise
const answersOf = (line) => F.parseLine(line).filter((s) => typeof s !== 'string').map((s) => (s.type === 'pick' ? s.correct : s.accepts[0]));
const E = F.EXAM_A;
eq(E.ex1.map((c) => answersOf(c[0])), [['avons regardé'], ['jouais'], ['faisait', 'a éclaté'], ['buvait'], ['avons fini']], 'worksheet exercise 1');
eq(E.ex2.map(answersOf), [['avais'], ['habitions'], ['étaient'], ['chantiez'], ['grandissaient']], 'worksheet exercise 2');
eq(E.ex3.map(answersOf), [['ai mangé'], ['sont parties'], ['avons visité'], ['est tombé'], ['as choisi']], 'worksheet exercise 3');
eq(answersOf(E.ex4), ['pleuvait', 'était', 'étaient', 'est sorti', 'a aboyé'], 'worksheet exercise 4');

// 5. every bank parses: each choice has exactly one marked answer, each typed blank a known verb
F.CHOIX.forEach((c) => F.parseLine(c[0], c[1]).forEach((s) => {
  if (s.type === 'pick') { checks++; if (!s.correct || s.opts.length !== 2) { fails++; console.log(`  ✗ choice without one answer: ${c[0]}`); } }
}));
F.STORIES.forEach((st) => { let n = 0; F.parseLine(st.s).forEach((s) => { if (s.type === 'type') n++; }); checks++; if (n < 4) { fails++; console.log(`  ✗ story "${st.t}" has only ${n} blanks`); } });
F.VAR.forEach(([s, inf, t, why, ans]) => {
  checks++;
  if (!F.REASONS[why] || (t === 'i') !== ['hab', 'dec', 'dur'].includes(why)) { fails++; console.log(`  ✗ VAR reason does not match tense: ${s}`); }
  // the shown answer must be a real form of that verb in that tense
  const forms = t === 'i' ? [0, 1, 2, 3, 4, 5].map((p) => F.imp(inf, p))
    : [0, 1, 2, 3, 4, 5].flatMap((p) => F.pcForms(inf, p, null));
  checks++; if (!forms.includes(ans)) { fails++; console.log(`  ✗ VAR "${ans}" is not a form of ${inf}`); }
});

// 6. marking: right answers, tolerated extras, near misses and the specific diagnoses
const b = (inf, t, p, g) => F.blank(inf, t, p, g || null);
const ok = (given, bl, what) => eq(F.check(given, bl).ok, true, what);
ok('Ai mangé', b('manger', 'pc', 0), 'capitals ignored');
ok("j'ai mangé", b('manger', 'pc', 0), 'subject typed too');
ok('j’ai mangé', b('manger', 'pc', 0), 'curly apostrophe');
ok('nous finissions.', b('finir', 'imp', 3), 'full stop and subject');
ok('suis allée', b('aller', 'pc', 0), 'je, feminine accepted');
eq(F.check('etaient', b('être', 'imp', 5)).near, true, 'missing accent is a near miss');
const diag = (given, bl) => F.check(given, bl).msg;
const has = (msg, word, what) => { checks++; if (!msg || msg.indexOf(word) < 0) { fails++; console.log(`  ✗ ${what}: "${msg}"`); } };
has(diag('ont parties', b('partir', 'pc', 5, 'f')), 'Mauvais auxiliaire', 'wrong auxiliary');
has(diag('sont parti', b('partir', 'pc', 5, 'f')), 'accord', 'missing agreement with être');
has(diag('ont jouées', b('jouer', 'pc', 5, 'f')), 'ne s’accorde pas', 'agreement wrongly made with avoir');
has(diag('mangeait', b('manger', 'pc', 2)), 'imparfait', 'imparfait given for passé composé');
has(diag('a mangé', b('manger', 'imp', 2)), 'passé composé', 'passé composé given for imparfait');
has(diag('finissait', b('finir', 'imp', 3)), '-ions', 'right stem, wrong ending');
has(diag('sommes allés', b('aller', 'pc', 5, 'm')), 'mauvaise personne', 'wrong person of the auxiliary');

// 7. module 2: every text is complete and every tagged verb is a real form in the right tense
const AUX = F.AVOIR.concat(F.ETRE);
const IMPS = new Set(), PPS = new Set();
Object.keys(F.V).forEach((v) => { for (let p = 0; p < 6; p++) IMPS.add(F.imp(v, p)); ['', 'e', 's', 'es'].forEach((x) => PPS.add(F.V[v].pp + x)); });
const ids = new Set();
eq(F.TEXTS.length >= 20, true, 'at least 20 reading texts'); eq(F.MOCKS.length, 4, 'four mock exams');
F.TEXTS.concat(F.MOCKS).forEach((T) => {
  const who = `text "${T.t}"`;
  checks++; if (ids.has(T.id)) { fails++; console.log(`  ✗ duplicate id ${T.id}`); } ids.add(T.id);
  eq([T.q.length, T.vf.length, T.o.length, T.c.length], [3, 2, 3, 2], `${who} has every part`);
  if (T.w) eq([T.o2.length, T.w.length], [3, 2], `${who} (mock exam) has its second question and subject`);
  T.q.forEach((q) => { checks++; if ((q.match(/\*/g) || []).length !== 1 || q.split('|').length < 4) { fails++; console.log(`  ✗ ${who}: bad choice "${q}"`); } });
  const tags = [...T.x.matchAll(/\[([ip]):([^\]]+)\]/g)];
  const imps = tags.filter((m) => m[1] === 'i'), pcs = tags.filter((m) => m[1] === 'p');
  checks++; if (imps.length < 3 || pcs.length < 3) { fails++; console.log(`  ✗ ${who}: needs 3+ verbs of each tense (${imps.length}/${pcs.length})`); }
  imps.forEach((m) => { checks++; if (!IMPS.has(m[2])) { fails++; console.log(`  ✗ ${who}: "${m[2]}" is not an imparfait the engine knows`); } });
  pcs.forEach((m) => {
    const w = m[2].replace(/^n’/, '').replace(/ pas /, ' ').split(' ');
    checks++; if (w.length !== 2 || !AUX.includes(w[0]) || !PPS.has(w[1])) { fails++; console.log(`  ✗ ${who}: "${m[2]}" is not a passé composé the engine knows`); }
  });
  checks++; if (/\[[^ip]/.test(T.x.replace(/\[[ip]:[^\]]+\]/g, ''))) { fails++; console.log(`  ✗ ${who}: broken tag`); }
  T.c.forEach((line) => { checks++; try { F.parseLine(line); } catch (e) { fails++; console.log(`  ✗ ${who}: ${e.message}`); } });
  // the analyzer must see the same verbs as the tags (proves the tags are complete and not hiding a stray tense)
  const r = F.analyze(T.x.replace(/\[[ip]:([^\]]+)\]/g, '$1'));
  checks++; if (r.imp.length !== imps.length) { fails++; console.log(`  ✗ ${who}: tagged ${imps.length} imparfaits, the checker finds ${r.imp.length}`); }
});

// 8. the writing coach on the worksheet's model answer, and on typical slips
const model = F.analyze(F.MODEL);
eq([model.imp.length, model.pc.length, model.warn.length, model.sentences], [6, 6, 0, 8], 'coach on the model answer');
const slips = F.analyze('Elle est allé au parc. Il a tombé. C’est super. Il fait beau. Elles ont jouées. Nous sommes partis.');
eq(slips.warn.length, 5, 'coach flags the five slips (and accepts "nous sommes partis")');

// 9. nothing personal in the published page
[/\bHamdan\b/i, /\bSultan\b/i, /[\w.+-]+@[\w-]+\.[\w.]+/].forEach((re) => {
  checks++; const m = html.match(re); if (m) { fails++; console.log(`  ✗ the page contains "${m[0]}"; it is public`); }
});

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
