/* test-vocab.js — the words the app puts in front of Hamdan must be the words his
   class uses. Every term below is taken from the "Specific understandings" of his
   Toddle unit plans (~/Toddle_Hamdan_6M-MAT2/Topic_NN_*.docx); the school's phrasing
   wins over any synonym that happens to be correct maths.

   The corpus is NOT the source code — a term sitting in a code comment is a term the
   child never reads, and grepping src/ made exactly that mistake once. So this builds
   the corpus by generating real problems from every level and harvesting the text a
   player actually sees: the question, every step prompt, hint, "why", and result line,
   plus the tile names and blurbs and every wrong-answer explanation. */
require('../src/numbers.js');
require('../src/format.js');
require('../src/parser.js');
require('../src/fraction.js');
const EX = require('../src/explanations.js');
require('../src/figures.js');
require('../src/steps.js');
require('../src/topics.js');
['topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1',
  'curriculum1', 'curriculum2', 'harder', 'harder2', 'bidmas', 'solving'].forEach((m) => require(`../src/${m}.js`));
const W = require('../src/problems.js');

let checks = 0, fails = 0;
const ok = () => { checks++; };
const bad = (m) => { checks++; fails++; console.log('  ✗ ' + m); };

// ---------- the corpus: everything a player can read ----------
const PER_LEVEL = 40;
const seen = [];
function harvest(v) {
  if (v == null) return;
  if (Array.isArray(v)) return v.forEach(harvest);
  seen.push(String(v));
}
for (const s of W.SUBJECTS) {
  harvest([s.name, s.blurb]);
  for (const l of s.levels) {
    harvest([l.name]);
    let probs = [];
    try { probs = W.buildMatchFor(s.id, l.id, PER_LEVEL); }
    catch (e) { bad(`${s.id}/${l.id} threw while generating: ${e.message}`); continue; }
    for (const p of probs) {
      harvest([p.given, p.answer]);
      (p.steps || []).forEach((st) => harvest([st.prompt, st.hint, st.why, st.resultText, st.longWay]));
    }
  }
}
// wrong-answer feedback: the template wording is what matters, not the numbers in it
for (const id of Object.keys(EX.EXPLAIN)) {
  try { harvest(EX.explain(id, {})); } catch (e) { /* needs real ctx; wording checked elsewhere */ }
}
const CORPUS = seen.join('\n').toLowerCase();
console.log(`Vocabulary corpus: ${seen.length} strings from ${W.SUBJECTS.length} topics\n`);

// ---------- terms the unit plans use, and where they come from ----------
const REQUIRED = [
  ['T2',  'directed number'],
  ['T3',  'listing method'],
  ['T3',  'prime factor'],
  ['T3',  'square root'],
  ['T3',  'cube root'],
  ['T4',  'equivalent fraction'],
  ['T4',  'numerator'],
  ['T4',  'denominator'],
  ['T4',  'improper'],
  ['T4',  'mixed number'],
  ['T4',  'common denominator'],
  ['T5',  'like terms'],
  ['T5',  'substitut'],
  ['T6',  'rotational symmetry'],
  ['T6',  'quadrant'],
  ['T6',  'line of symmetry'],
  ['T10', 'vertically opposite'],
  ['T10', 'interior angle'],
  ['T10', 'exterior angle'],
  ['T10', 'reflex'],
  ['T10', 'isosceles'],
  ['T11', 'lowest terms'],
  ['T12', 'composite shape'],
  ['T12', 'perpendicular height'],
  ['T12', 'parallelogram'],
  ['T13', 'outlier'],
  ['T13', 'median'],
  ['T13', 'range'],
  ['T14', 'frequency'],
  ['T14', 'pictogram'],
  ['T14', 'venn'],
  ['T16', 'irregular'],
  ['T16', 'circumference'],
  ['T16', 'chord'],
  ['T16', 'tangent'],
  ['T16', 'sector'],
  ['T16', 'segment'],
  ['T17', 'vertices'],
  ['T17', 'net'],
];

// Synonyms that are perfectly good maths but not HIS course's word. The school's
// phrasing wins, so a child never has to translate between the app and the lesson.
const BANNED = [
  ['compound shape', 'composite shape (T12 says "composite")'],
  ['compound area', 'composite shape (T12 says "composite")'],
];

console.log('Terms the unit plans use:');
for (const [topic, term] of REQUIRED) {
  if (CORPUS.includes(term.toLowerCase())) ok();
  else bad(`${topic}: "${term}" never appears in anything the child reads`);
}

console.log('\nSynonyms that should not appear:');
for (const [term, instead] of BANNED) {
  if (!CORPUS.includes(term.toLowerCase())) ok();
  else bad(`"${term}" is used, but the course says ${instead}`);
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
