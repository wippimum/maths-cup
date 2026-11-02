/* test-computing.js — the Year 7 Computing (Term 1 test) module.

   1. GLOSSARY: every key term the parent listed has a definition; every definition says
      what the school's revision poster says; every glossary entry is actually used; the
      wrapper never breaks markup; and a definition never hands over the answer to the
      step it sits in (such steps must carry noGloss).
   2. MASTERY: the store survives a reload (JSON round trip), an old save with no mastery
      at all, and a damaged one — repaired, never wiped. The mastery rule itself.
   3. COVERAGE: every step names a concept and a kind; every concept can be met in at
      least two kinds of question (or it could never be mastered); every concept can be
      replayed; the test level walks all seven sections.
   4. FACTS: the right answers agree with the poster, re-checked against a table written
      out here independently of src/computing7.js.

   Arithmetic (unit conversions, formula results) is re-derived in test-truth.js.
   Run: node test/test-computing.js */
const fs = require('fs');
const path = require('path');
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'mathfmt', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2',
  'year7', 'computing7', 'unaided', 'harder', 'harder2', 'bidmas', 'solving', 'problems']) {
  Object.assign(W, require('../src/' + f + '.js'));
}
const REPS = Number(process.env.REPS || 80);
let checks = 0, fails = 0, shown = 0;
const bad = (m) => { fails++; if (shown++ < 40) console.log('  ✗ ' + m); };
const ok = () => { checks++; };
const SUBJ = W.SUBJECTS.find((s) => s.id === 'y7comp');
const norm = (s) => String(s).toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^a-z0-9%=:]+/g, ' ').trim();

if (!SUBJ) { console.log('✗ no y7comp subject'); process.exit(1); }

// one big sample of every level, reused below
const SAMPLES = [];
for (const l of SUBJ.levels) for (let i = 0; i < REPS; i++) SAMPLES.push({ level: l.id, p: l.generate() });

// ======================================================== 1. glossary
console.log('Glossary…');
{
  // the parent's list, verbatim, plus the rest of the poster's vocabulary
  const REQUIRED = ['hardware', 'software', 'system software', 'application software', 'storage', 'HDD', 'SSD',
    'USB flash drive', 'memory card', 'byte', 'KB', 'MB', 'GB', 'TB', 'data', 'information', 'spreadsheet', 'cell',
    'row', 'column', 'cell reference', 'formula', 'range', 'SUM', 'AVERAGE', 'mean', 'MAX', 'MIN', 'sample', 'fair test',
    'conditions', 'heading', 'error'];
  for (const t of REQUIRED) {
    const id = W.glossTermOf(t);
    if (!id) bad(`glossary has no entry for "${t}"`);
    else if (!W.GLOSS_BY_ID[id].def || W.GLOSS_BY_ID[id].def.length < 15) bad(`"${t}" has an empty definition`);
    else ok();
  }
  // what the poster says, phrase for phrase
  const POSTER = {
    hardware: 'physical parts of a computer that you can touch', software: 'programs and instructions that tell a computer what to do',
    'system-software': 'manages the hardware and supports other programs', 'application-software': 'carry out specific tasks',
    storage: 'saving files and data so they can be used later', hdd: 'large capacity, cheaper, but slower', ssd: 'faster and more reliable, but usually more expensive',
    usb: 'portable and easy to use for transferring files', 'memory-card': 'small, portable storage used in devices like cameras',
    byte: 'smallest unit', kb: '1,000 bytes', mb: '1,000 kb', gb: '1,000 mb', tb: '1,000 gb', data: 'raw facts and figures without context',
    information: 'processed or given meaning', spreadsheet: 'organise, store and analyse data', cell: 'where a row and a column meet',
    column: 'letters', row: 'numbers', formula: 'start with an =', sum: 'adds all the values together', average: 'average (mean)',
    max: 'largest value', min: 'smallest value', sample: 'fair and large enough', 'fair-test': 'same test', error: 'check for errors',
  };
  for (const [id, phrase] of Object.entries(POSTER)) {
    const e = W.GLOSS_BY_ID[id];
    if (!e) { bad(`glossary id ${id} missing`); continue; }
    if (e.def.toLowerCase().includes(phrase.toLowerCase())) ok(); else bad(`${id}: definition "${e.def}" does not say "${phrase}" as the poster does`);
  }
  // ids are unique and every term points at exactly one entry
  const ids = W.GLOSSARY.map((e) => e.id);
  if (new Set(ids).size === ids.length) ok(); else bad('duplicate glossary ids');
  const allTerms = W.GLOSSARY.flatMap((e) => e.terms.map((t) => t.toLowerCase()));
  if (new Set(allTerms).size === allTerms.length) ok(); else bad('a glossary term is listed under two entries');

  // every term the child can tap has a definition, and every definition is reachable
  const used = new Set();
  for (const { p } of SAMPLES) {
    const texts = [p.given, p.note || ''];
    p.steps.forEach((st) => texts.push(st.prompt, st.hint, st.why, st.longWay || '', ...(st.pool || [])));
    for (const t of texts) {
      const html = W.glossify(W.mathHTML(t));
      for (const id of W.glossTermsIn(html)) {
        if (W.GLOSS_BY_ID[id] && W.GLOSS_BY_ID[id].def) { used.add(id); ok(); } else bad(`"${t}" wraps "${id}", which has no definition`);
      }
      // wrapping must never change what is READ
      const back = html.replace(/<span class="gl"[^>]*>([^<]*)<\/span>/g, '$1');
      if (back === W.mathHTML(t)) ok(); else bad(`glossify changed the text of "${t}"`);
    }
  }
  for (const e of W.GLOSSARY) if (used.has(e.id)) ok(); else bad(`glossary entry "${e.id}" is never shown anywhere — dead definition`);

  // markup safety and the rules of the wrapper, each with a negative control
  const g = W.glossify;
  if (g('<span class="data">x</span>') === '<span class="data">x</span>') ok(); else bad('glossify reached inside a tag attribute');
  if (W.glossTermsIn(g('data data data')).length === 1) ok(); else bad('glossify should wrap only the FIRST use of a term');
  if (W.glossTermsIn(g('the sum of the min')).length === 0) ok(); else bad('"sum"/"min" in a sentence must not be read as =SUM / =MIN');
  if (W.glossTermsIn(g('=SUM(A1:A4) and =MIN(A1:A4)')).join() === 'sum,min') ok(); else bad('=SUM and =MIN should be wrapped');
  if (W.glossTermsIn(g('a database of hardwares')).length === 0) ok(); else bad('glossify wrapped part of a longer word');
  if (W.glossTermsIn(g('system software')).join() === 'system-software') ok(); else bad('"system software" must win over "software"');
  if (W.glossTermsIn(g(W.mathHTML('1/2 of the data'))).join() === 'data') ok(); else bad('glossify broke on fraction markup');
  if (W.glossTermOf('Hardware') === 'hardware' && W.glossTermOf('Windows') === null && W.glossTermOf('kb') === null) ok();
  else bad('glossTermOf: whole-card terms (Hardware → ⓘ), non-terms and lower-case "kb" are wrong');

  // A definition must never give away the answer. If the right option is a glossary word
  // and its definition is quoted in the prompt, or the right option is quoted inside a
  // definition the step lets you open, the step needs noGloss.
  const words = (s) => norm(s).split(' ').filter(Boolean);
  const windows = (s, n) => { const w = words(s), out = []; for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(' ')); return out; };
  const leaks = new Map();
  for (const { level, p } of SAMPLES) {
    if (p.gloss === false) continue;
    for (const st of p.steps) {
      // LEARN steps may show definitions — they teach. Using one there just means the
      // answer does not count towards mastery (app.js, stepHelped).
      if (st.mode !== 'pick' || st.noGloss || st.kind === 'learn') continue;
      const right = st.pool.find((v) => st.check(v).correct);
      const reach = new Set(W.glossTermsIn(W.glossify(W.mathHTML(`${p.given} ${p.note || ''} ${st.prompt}`))));
      st.pool.forEach((v) => { const id = W.glossTermOf(v); if (id) reach.add(id); else W.glossTermsIn(W.glossify(v)).forEach((x) => reach.add(x)); });
      let leak = null;
      for (const id of reach) {
        const def = norm(W.GLOSS_BY_ID[id].def);
        if (words(right).length >= 3 && W.glossTermOf(right) !== id && def.includes(norm(right))) leak = `the definition of "${id}" contains the answer "${right}"`;
        if (W.glossTermOf(right) === id && windows(W.GLOSS_BY_ID[id].def, 4).some((w) => norm(st.prompt).includes(w))) leak = `the answer "${right}" is a glossary word whose definition is quoted in the prompt`;
      }
      if (leak) leaks.set(`${level}/${st.key}`, `"${st.prompt}" — ${leak}; mark it noGloss`);
      else ok();
    }
  }
  for (const [where, why] of leaks) bad(`${where}: ${why}`);
  // negative control: the detector does fire on a definition question left glossed
  const ctrl = W._pickStep({ key: 'c', prompt: 'What is data?', expected: ['Raw facts and figures without context'],
    pool: ['Raw facts and figures without context', 'Programs'], hint: 'h', why: 'w', resultText: 'r' });
  const cdef = norm(W.GLOSS_BY_ID[W.glossTermsIn(W.glossify(ctrl.prompt))[0]].def);
  if (cdef.includes(norm('Raw facts and figures without context'))) ok(); else bad('giveaway detector negative control did not fire');
}

// ======================================================== 2. mastery store
console.log('Mastery…');
{
  const M = W;
  // brand-new and broken inputs all become an empty, valid store
  for (const junk of [undefined, null, [], 'x', 7, { c: [] }, { c: 'x' }]) {
    const m = M.masteryMigrate(junk);
    if (m && m.v === 1 && m.c && typeof m.c === 'object' && !Array.isArray(m.c) && Object.keys(m.c).length === 0) ok();
    else bad(`masteryMigrate(${JSON.stringify(junk)}) → ${JSON.stringify(m)}`);
  }
  // an OLD save (before build 47) loads exactly the way app.js load() does it, and keeps everything
  const KEY_DEFAULTS = { streak: 0, goalsScored: 0, progress: {}, history: [] };
  const oldSave = JSON.stringify({ streak: 4, goalsScored: 312, year: 7, subject: 'y7frac', progress: { y7frac: { levelId: 'y7-carry', consec: 2 } }, history: [{ d: '2026-10-01', s: 'y7frac', p: 90 }] });
  const s = Object.assign({}, KEY_DEFAULTS, JSON.parse(oldSave));
  s.mastery = M.masteryMigrate(s.mastery);
  if (s.goalsScored === 312 && s.streak === 4 && s.progress.y7frac.levelId === 'y7-carry' && s.history.length === 1 && s.mastery.v === 1) ok();
  else bad('migrating an old save lost something');

  // the rule: three in a row of ONE kind is not mastery…
  let m = M.masteryMigrate(undefined);
  [1, 2, 3].forEach(() => M.masteryRecord(m, 'hw-sw', 'sort', true));
  if (!m.c['hw-sw'].mastered) ok(); else bad('three right of the same kind should not count as mastered');
  // …a fourth of a different kind is (the run is the last three: sort, sort, scenario)
  const just = M.masteryRecord(m, 'hw-sw', 'scenario', true);
  if (just && m.c['hw-sw'].mastered) ok(); else bad('three in a row across two kinds should master the concept');
  // a miss resets the run on another concept
  M.masteryRecord(m, 'units-order', 'order', true); M.masteryRecord(m, 'units-order', 'compare', true);
  M.masteryRecord(m, 'units-order', 'order', false);
  M.masteryRecord(m, 'units-order', 'learn', true);
  if (!m.c['units-order'].mastered && m.c['units-order'].streak === 1) ok(); else bad('a miss must reset the streak');
  // mastered stays mastered; a slip is counted
  M.masteryRecord(m, 'hw-sw', 'sort', false);
  if (m.c['hw-sw'].mastered && m.c['hw-sw'].slips === 1) ok(); else bad('a slip after mastery should be counted, not un-master');

  // RELOAD: JSON round trip keeps every record and the summary
  const before = JSON.stringify(M.masterySummary(m));
  const reloaded = M.masteryMigrate(JSON.parse(JSON.stringify(m)));
  if (JSON.stringify(M.masterySummary(reloaded)) === before && reloaded.c['units-order'].streak === 1) ok();
  else bad('mastery did not survive a JSON round trip');
  // twice-migrated is unchanged (idempotent)
  if (JSON.stringify(M.masteryMigrate(JSON.parse(JSON.stringify(reloaded)))) === JSON.stringify(reloaded)) ok(); else bad('masteryMigrate is not idempotent');

  // DAMAGED record: repaired in place, not dropped; unknown concepts are kept
  const dmg = M.masteryMigrate({ c: { 'hw-sw': { streak: '2', kinds: 'x', mastered: 1 }, 'some-future-id': { right: 3 }, 'sys-app': null } });
  if (dmg.c['hw-sw'].streak === 2 && Array.isArray(dmg.c['hw-sw'].kinds) && dmg.c['hw-sw'].mastered === true) ok(); else bad('a damaged record was not repaired');
  if (dmg.c['some-future-id'] && dmg.c['some-future-id'].right === 3) ok(); else bad('an unknown concept record was wiped');
  if (dmg.c['sys-app'] && dmg.c['sys-app'].streak === 0) ok(); else bad('a null record should become an empty one');

  // summary shape mirrors the poster: 7 sections, the 8-line checklist
  const sum = M.masterySummary(m);
  if (sum.sections.length === 7 && sum.checklist.length === 8) ok(); else bad(`summary has ${sum.sections.length} sections / ${sum.checklist.length} checklist lines`);
  if (sum.checklist[0].done === true && sum.checklist[4].done === false) ok(); else bad('checklist ticks do not follow mastered concepts');

  // app.js really uses the store the way this test assumes
  const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  if (/s\.mastery = WAC\.masteryMigrate/.test(app)) ok(); else bad('app.js load() does not migrate save.mastery');
  if (/mastery: save\.mastery/.test(app)) ok(); else bad('the backup blob does not include mastery');
  if (/data\.mastery && WAC\.masteryMigrate/.test(app)) ok(); else bad('restore does not bring mastery back');
  if (/step\.concept && !game\.stepHelped \? recordConcept/.test(app)) ok(); else bad('a step answered after a hint or definition still counts towards mastery');
  if (/scheduleReview\(step\.concept\)/.test(app)) ok(); else bad('a missed concept is not booked for a replay');
  if (/addEventListener\('click',[\s\S]{0,400}stopPropagation\(\)[\s\S]{0,200}\}, true\)/.test(app)) ok();
  else bad('the glossary tap is not handled in the capture phase — tapping a word in a card would also select it');
}

// ======================================================== 3. coverage
console.log('Concepts, kinds and replay…');
{
  const kinds = {};
  for (const { level, p } of SAMPLES) {
    if (p.subject !== 'y7comp') bad(`${level}: subject ${p.subject}`);
    if (!p.section) bad(`${level}: no section`);
    for (const st of p.steps) {
      if (!st.concept || !W.CS_CONCEPTS[st.concept]) { bad(`${level}/${st.key}: concept "${st.concept}"`); continue; }
      if (!st.kind) { bad(`${level}/${st.key}: no kind`); continue; }
      ok();
      (kinds[st.concept] = kinds[st.concept] || new Set()).add(st.kind);
      if (W.CS_SECTIONS.find((s) => s.n === p.section).concepts.includes(st.concept) || p.review) ok();
      else bad(`${level}/${st.key}: concept ${st.concept} is not in section ${p.section}`);
    }
  }
  for (const c of Object.keys(W.CS_CONCEPTS)) {
    const k = kinds[c] ? kinds[c].size : 0;
    if (k >= W.MASTER_KINDS) ok(); else bad(`concept ${c} appears in only ${k} kind(s) of question — it could never be mastered`);
    for (let i = 0; i < 15; i++) {
      const r = W.csReview(c);
      if (r && r.review === c && r.steps.some((s) => s.concept === c) && /Replay/.test(r.note)) ok();
      else { bad(`csReview(${c}) did not return a replay of that concept`); break; }
    }
  }
  // each section has learn / practise / real-life levels, plus the test
  for (const s of W.CS_SECTIONS) {
    const ls = SUBJ.levels.filter((l) => l.id.startsWith(`cs${s.n}-`));
    if (ls.length >= 3) ok(); else bad(`section ${s.n} has ${ls.length} levels`);
  }
  const seen = new Set(); for (let i = 0; i < 7; i++) { const p = W.csTest(); seen.add(p.section); if (p.gloss === false) ok(); else bad('a test question has the glossary on'); }
  if (seen.size === 7) ok(); else bad(`7 test questions in a row covered only ${seen.size} sections`);
  // every level's match builds 10
  for (const l of SUBJ.levels) { const mt = W.buildMatchFor('y7comp', l.id, 10); if (mt.length === 10) ok(); else bad(`${l.id} match has ${mt.length}`); }
}

// ======================================================== 4. facts, against the poster
console.log('Facts against the poster…');
{
  // written out here, not imported, so a slip in src/ cannot agree with itself
  const KIND = { Monitor: 'hw', Keyboard: 'hw', Mouse: 'hw', Printer: 'hw', Speakers: 'hw', Webcam: 'hw', Microphone: 'hw', Scanner: 'hw',
    Windows: 'sys', macOS: 'sys', Word: 'app', Excel: 'app', Canva: 'app', Scratch: 'app', WhatsApp: 'app', PowerPoint: 'app' };
  const DEVICE = { HDD: 'Large capacity, cheaper, but slower (uses moving parts)', SSD: 'Faster and more reliable, but usually more expensive',
    'USB flash drive': 'Portable and easy to use for transferring files', 'Memory card': 'Small, portable storage used in devices like cameras' };
  const FNDOES = { SUM: 'Adds all the values together', AVERAGE: 'Finds the average (mean)', MAX: 'Finds the largest value', MIN: 'Finds the smallest value' };
  const LADDER = ['Byte', 'KB', 'MB', 'GB', 'TB'];
  const rightOf = (st) => st.pool.find((v) => st.check(v).correct);
  const nameIn = (text) => Object.keys(KIND).filter((n) => new RegExp(`\\b${n}\\b`).test(text));
  for (const { level, p } of SAMPLES) {
    for (const st of p.steps) {
      const at = `${level}/${st.key} "${st.prompt}"`;
      if (st.mode === 'pick') {
        const r = rightOf(st);
        // hardware / software / type
        if (/^(So is|So) .* (hardware or software)\?$/.test(st.prompt) || /^So is .* hardware or software\?$/.test(st.prompt)) {
          const n = nameIn(st.prompt)[0] || Object.keys(KIND).find((k) => st.prompt.toLowerCase().includes(k.toLowerCase()));
          const want = KIND[n] === 'hw' ? 'Hardware' : 'Software';
          if (r === want) ok(); else bad(`${at}: says ${r}, poster says ${want}`);
        }
        if (/type is|TYPE of software is/i.test(st.prompt)) {
          const n = nameIn(st.prompt)[0];
          const want = KIND[n] === 'sys' ? 'System software' : 'Application software';
          if (r === want) ok(); else bad(`${at}: says ${r}, should be ${want}`);
        }
        if (/Which one is SYSTEM software\?$/.test(st.prompt) || /manages its hardware and supports her other programs/.test(st.prompt)) {
          if (KIND[r] === 'sys') ok(); else bad(`${at}: ${r} is not system software`);
          st.pool.filter((v) => v !== r).forEach((v) => { if (KIND[v] !== 'sys') ok(); else bad(`${at}: a second system software ${v} in the pool`); });
        }
        // storage devices
        const descQ = st.prompt.match(/^Which description matches the (.+?)( \(.*\))?\?$/);
        if (descQ) { const dev = Object.keys(DEVICE).find((d) => descQ[1].startsWith(d)); if (r === DEVICE[dev]) ok(); else bad(`${at}: ${r} ≠ poster "${DEVICE[dev]}"`); }
        const whichQ = st.prompt.match(/^"(.+)\." Which storage device is that\?$/);
        if (whichQ) { const dev = Object.keys(DEVICE).find((d) => DEVICE[d] === whichQ[1]); if (r === dev) ok(); else bad(`${at}: ${r} ≠ ${dev}`); }
        if (/^HDD or SSD\?/.test(st.prompt)) {
          const want = /FASTER|MORE RELIABLE/.test(st.prompt) ? 'SSD' : 'HDD';
          if (r === want) ok(); else bad(`${at}: ${r}, poster says ${want}`);
        }
        // formulas
        const doesQ = st.prompt.match(/^What does =(SUM|AVERAGE|MAX|MIN)\(/);
        if (doesQ) { if (r === FNDOES[doesQ[1]]) ok(); else bad(`${at}: ${r}`); }
        if (/^Every formula starts with/.test(st.prompt)) { if (r === '=') ok(); else bad(`${at}: ${r}`); }
        // units
        if (/^1 (KB|MB|GB|TB) = how many/.test(st.prompt)) { if (r === '1,000') ok(); else bad(`${at}: ${r} — the poster uses 1,000`); }
        if (/SMALLEST unit/.test(st.prompt)) { if (r === 'Byte') ok(); else bad(`${at}: ${r}`); }
        const next = st.prompt.match(/comes straight after (\w+)\?/);
        if (next) { if (r === LADDER[LADDER.indexOf(next[1]) + 1]) ok(); else bad(`${at}: ${r}`); }
        // data vs information
        if (/^What is DATA\?$/.test(st.prompt)) { if (r === 'Raw facts and figures without context') ok(); else bad(`${at}: ${r}`); }
      }
      if (st.mode === 'choose' && /piece of hardware/.test(st.prompt)) {
        const want = st.pool.filter((v) => KIND[v] === 'hw');
        if (st.check(want).correct) ok(); else bad(`${at}: hardware set [${want}] not accepted`);
      }
      if (st.mode === 'build' && /Build the ladder/.test(st.prompt)) {
        const want = /SMALLEST/.test(st.prompt) ? LADDER.join(' ') : LADDER.slice().reverse().join(' ');
        if (st.check(want).correct && st.solution === want) ok(); else bad(`${at}: ladder ${st.solution}`);
        if (!st.check(LADDER.slice().reverse().join(' ')).correct || !/SMALLEST/.test(st.prompt)) ok(); else bad(`${at}: accepts the ladder backwards`);
      }
    }
  }
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
