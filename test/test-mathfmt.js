/* test-mathfmt.js — the fraction renderer must change how text LOOKS, never what it says.

   mathHTML() rewrites "3 15/22" into stacked markup for every question, prompt, option
   and solved line in the app. A regex that fires one character too wide would silently
   corrupt maths on every screen, so the main check here is a faithfulness sweep: strip
   the tags back off everything the app can display and it must read exactly as before.

   Run: node test/test-mathfmt.js */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'mathfmt', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2', 'year7', 'unaided',
  'harder', 'harder2', 'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}
const { mathHTML } = W;
let checks = 0, fails = 0, shown = 0;
const bad = (m) => { fails++; if (shown++ < 20) console.log('  ✗ ' + m); };
const ok = () => { checks++; };
const eq = (got, want, what) => (got === want ? checks++ : bad(`${what}: got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`));

// what the reader actually sees, once the markup is taken back off
// The whole number of a mixed number is separated from its stack by a CSS gap, not by
// a space character, so put the space back when reading the markup as text.
const plain = (html) => String(html)
  .replace(/<span class="mx-w">(.*?)<\/span>/g, '$1 ')
  .replace(/<span class="fr-n">(.*?)<\/span>/g, '$1/')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

// ---------- the shapes ----------
ok(/fr-n/.test(mathHTML('5/2')) ? checks++ : bad('a simple fraction is stacked'));
ok(/mx-w/.test(mathHTML('3 15/22')) ? checks++ : bad('a mixed number keeps its whole number'));
eq(plain(mathHTML('3 15/22 − 5/2')), '3 15/22 − 5/2', 'a mixed number and a fraction survive');
eq(plain(mathHTML('62/12 − 49/12')), '62/12 − 49/12', 'two top-heavy fractions survive');

// ---------- things that must NOT become fractions ----------
eq(mathHTML('/'), '/', 'the lone / card is untouched');
eq(mathHTML('above/below'), 'above/below', 'a word pair is untouched');
eq(mathHTML('and/or'), 'and/or', 'and/or is untouched');
eq(mathHTML('Common factors: 1, 2, 3'), 'Common factors: 1, 2, 3', 'a plain list is untouched');
ok(!/fr-n/.test(mathHTML('24 ÷ 3')) ? checks++ : bad('division with ÷ is not a fraction'));

// ---------- markup can never be injected ----------
eq(mathHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;', 'html is escaped');
ok(!/<img/.test(mathHTML('<img src=x>')) ? checks++ : bad('no raw tag survives'));
eq(plain(mathHTML('a & b')), 'a & b', 'an ampersand round-trips');

// ---------- the faithfulness sweep ----------
// Every string the app can put on screen, rendered and stripped back.
let strings = 0;
const check = (s, where) => {
  if (s == null) return;
  const t = String(s);
  strings++;
  const back = plain(mathHTML(t));
  if (back === t) ok();
  else bad(`${where}: "${t}" renders as "${back}"`);
};
for (const s of W.SUBJECTS) {
  for (const l of s.levels) {
    let probs = [];
    try { probs = W.buildMatchFor(s.id, l.id, 12); } catch (e) { bad(`${s.id}/${l.id} threw: ${e.message}`); continue; }
    for (const p of probs) {
      check(p.given, `${l.id} given`);
      check(p.answer, `${l.id} answer`);
      for (const st of p.steps || []) {
        check(st.prompt, `${l.id}/${st.key} prompt`);
        check(st.hint, `${l.id}/${st.key} hint`);
        check(st.why, `${l.id}/${st.key} why`);
        check(st.resultText, `${l.id}/${st.key} result`);
        check(st.longWay, `${l.id}/${st.key} longWay`);
        for (const v of st.pool || []) check(v, `${l.id}/${st.key} option`);
        for (const v of st.pieces || []) check(v, `${l.id}/${st.key} card`);
      }
    }
  }
}
console.log(`Faithfulness sweep: ${strings} strings from every level.`);

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
