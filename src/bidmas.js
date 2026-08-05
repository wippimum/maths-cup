/* bidmas.js — BIDMAS / order of operations, worked ONE decision at a time.
   School Topic 2 (Integers) lists "order of operations"; this is that, as its own
   section, because the order is the hard part and it deserves its own ladder.

   Everything comes out of one small expression engine rather than hand-written
   shapes: reduce() applies exactly one BIDMAS reduction (brackets → indices →
   × ÷ left-to-right → + − left-to-right) and hands back the part it did, so the
   questions can never disagree with the maths. Each problem then becomes:
       which part FIRST?  →  work that part out  →  … →  finish the sum
   with the "which part first" question dropped once only one operation is left. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, numberPool = W._numberPool;

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const SUP = { 2: '²', 3: '³' };
  const WORD = { '+': 'add', '−': 'take away', '×': 'multiply', '÷': 'divide' };
  // said out loud, with the numbers in it — more use to a stuck child than "divide"
  const PHRASE = {
    '+': (x, y) => `add ${x} and ${y}`,
    '−': (x, y) => `take ${y} away from ${x}`,
    '×': (x, y) => `${x} lots of ${y}`,
    '÷': (x, y) => `how many ${y}s fit into ${x}`,
  };

  const LADDER =
    'BIDMAS — the order to work in:\n' +
    '  B  brackets           ( )\n' +
    '  I  indices (powers)   ²  ³\n' +
    '  DM divide & multiply  ÷  ×   ← same level, so go LEFT to RIGHT\n' +
    '  AS add & subtract     +  −   ← same level, so go LEFT to RIGHT';

  // ---------------- expression model ----------------
  const num = (v, pow) => (pow ? { k: 'num', v, pow } : { k: 'num', v });
  const op = (v) => ({ k: 'op', v });
  const grp = (items, pow) => (pow ? { k: 'grp', items, pow } : { k: 'grp', items });

  function renderTok(t) {
    if (t.k === 'op') return t.v;
    if (t.k === 'num') return String(t.v) + (t.pow ? SUP[t.pow] : '');
    return '(' + render(t.items) + ')' + (t.pow ? SUP[t.pow] : '');
  }
  function render(items) { return items.map(renderTok).join(' '); }

  function apply(o, x, y) {
    if (o === '+') return x + y;
    if (o === '−') return x - y;
    if (o === '×') return x * y;
    return x / y;
  }

  /* One BIDMAS reduction. Returns null when the expression is already a single number,
     otherwise { part, value, items, rule, work, … } where `part` is the bit that got
     worked out written the way the child sees it, `rule` is WHY it went first (that's
     what the "which part?" question teaches) and `work` is WHICH sum was actually done.
     The two differ inside brackets: "brackets first, and it's a power in there". */
  function reduce(items) {
    // B — go inside the first bracket that still has work left in it
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      if (t.k !== 'grp') continue;
      const inner = reduce(t.items);
      if (!inner) continue;
      let replacement = grp(inner.items, t.pow);
      let collapsed = false;
      // brackets holding a single number don't need brackets any more
      if (replacement.items.length === 1 && replacement.items[0].k === 'num' && !replacement.items[0].pow) {
        replacement = num(replacement.items[0].v, t.pow);
        collapsed = true;
      }
      const next = items.slice(); next[i] = replacement;
      return Object.assign({}, inner, {
        // when the whole bracket clears in this one move, name it with its brackets
        part: collapsed ? `(${inner.part})` : inner.part,
        rule: 'brackets', items: next,
      });
    }
    // I — powers
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      if (t.k === 'num' && t.pow) {
        const value = Math.pow(t.v, t.pow);
        const next = items.slice(); next[i] = num(value);
        return { part: `${t.v}${SUP[t.pow]}`, value, rule: 'indices', work: 'indices', items: next, x: t.v, pow: t.pow };
      }
    }
    // DM then AS — leftmost first, so equal-priority pairs run left to right
    for (const pair of [['×', '÷'], ['+', '−']]) {
      for (let i = 1; i < items.length; i += 2) {
        const o = items[i];
        if (o.k !== 'op' || !pair.includes(o.v)) continue;
        const L = items[i - 1], R = items[i + 1];
        const value = apply(o.v, L.v, R.v);
        const next = items.slice(0, i - 1).concat([num(value)], items.slice(i + 2));
        const rule = pair[0] === '×' ? 'md' : 'as';
        return {
          part: `${renderTok(L)} ${o.v} ${renderTok(R)}`, value,
          rule, work: rule, items: next, o: o.v, x: L.v, y: R.v,
          samePairs: countOps(items, pair),
        };
      }
    }
    return null;
  }
  function countOps(items, pair) {
    return items.filter((t) => t.k === 'op' && pair.includes(t.v)).length;
  }

  // The whole solution, one reduction per entry. Each move keeps the real tokens it
  // started from, so the wrong-answer options can be built from the tree rather than
  // re-read off the printed line (splitting "3 × (4 + 2)" on spaces gives "(4").
  function walk(items) {
    const out = []; let cur = items, guard = 0;
    while (guard++ < 24) {
      const r = reduce(cur);
      if (!r) break;
      out.push(Object.assign({ from: render(cur), to: render(r.items), itemsBefore: cur }, r));
      cur = r.items;
    }
    return { moves: out, value: cur.length === 1 && cur[0].k === 'num' ? cur[0].v : NaN };
  }

  /* The wrong options for "which part first": the neighbouring pairs a child sees
     when they read straight across and ignore the brackets. */
  function flatAtoms(items) {
    const out = [];
    items.forEach((t) => {
      if (t.k === 'grp') out.push(...flatAtoms(t.items));
      else out.push(renderTok(t));
    });
    return out;
  }
  function wrongParts(items, correct) {
    const a = flatAtoms(items), out = [];
    for (let i = 1; i < a.length - 1; i += 2) {
      const label = `${a[i - 1]} ${a[i]} ${a[i + 1]}`;
      // "(4 + 2)" is the answer, so don't also offer the bare "4 + 2"
      if (label === correct || `(${label})` === correct) continue;
      out.push(label);
    }
    // "(2 + 3)²" has no neighbouring pair left to offer once the right one is out,
    // so offer the mistake that shape actually invites: squaring just one number.
    if (!out.length) {
      for (const t of items) {
        if (t.k !== 'grp' || !t.pow) continue;
        const inside = flatAtoms(t.items).filter((s) => /^\d/.test(s));
        inside.forEach((n) => { const l = n + SUP[t.pow]; if (l !== correct && !out.includes(l)) out.push(l); });
      }
    }
    return out;
  }

  /* The one tempting wrong value: what you get from doing the OTHER operation —
     adding when it says subtract, and so on. Nothing else is worth offering, and it
     has to be a real answer (never negative) or it gives itself away. */
  function opTrap(o, x, y) {
    const v = (o === '−' || o === '×') ? x + y : x - y;
    return v >= 0 && v !== apply(o, x, y) ? v : null;
  }
  /* Options for a "work it out" question: the answer, that trap, and near misses.
     Near misses matter — distractors far from the answer can be dismissed without
     doing any maths, so the question stops testing anything. */
  function valuePool(o, x, y, value) {
    const out = [value];
    const trap = opTrap(o, x, y);
    if (trap != null) out.push(trap);
    for (const d of [1, -1, 2, -2, 3]) {
      if (out.length >= 5) break;
      const v = value + d;
      if (v >= 0 && !out.includes(v)) out.push(v);
    }
    return out;
  }

  // ---------------- step builders ----------------
  const RULE_HINT = {
    brackets: 'Brackets come first — always. Do the bit inside them before anything else.',
    indices: 'After brackets come the powers (the little raised number).',
    md: '× and ÷ are done before + and −.',
    as: 'Only + and − are left, so work left to right.',
  };
  const RULE_WHY = {
    brackets: 'Brackets are the top of the BIDMAS ladder. They are the writer telling you "do this bit first" — so you do, before any × ÷ + −.',
    indices: 'Indices (powers) are the second rung. 4² just means 4 × 4, and it gets done before the ordinary × ÷ + −.',
    md: '× and ÷ are stronger than + and −, so they get done first, wherever they sit in the line.',
    as: '+ and − are the same strength as each other, so neither one wins — you simply read left to right, like reading words.',
  };

  function lrNote(move) {
    // the trap: two operations of equal strength, so position alone decides.
    // Not used when brackets outrank them — there the brackets are the lesson.
    if (!move.samePairs || move.samePairs < 2 || move.rule !== move.work) return null;
    const kind = move.work === 'md' ? '× and ÷' : '+ and −';
    return `${kind} are the SAME strength, so the one on the LEFT goes first.`;
  }

  function whichFirstStep(move, items, i) {
    const wrong = wrongParts(items, move.part);
    const lr = lrNote(move);
    return pickStep({
      key: 'first-' + i,
      prompt: `${move.from} — which part do you work out FIRST?`,
      hint: lr || RULE_HINT[move.rule],
      why: (lr ? lr + ' ' : '') + RULE_WHY[move.rule],
      longWay: LADDER + `\n\nIn ${move.from} the first job is ${move.part}.`,
      resultText: `${move.part} first`,
      expected: [move.part],
      pool: [move.part, ...wrong.slice(0, 2)],
      diagnose: (v) => diagnoseOrder(move, v),
    });
  }

  function diagnoseOrder(move, picked) {
    const lr = lrNote(move);
    if (lr) return { correct: false, id: 'bid-lr', ctx: { part: move.part, picked, kind: move.rule === 'md' ? '× and ÷' : '+ and −' } };
    if (move.rule === 'brackets') return { correct: false, id: 'bid-brackets', ctx: { part: move.part } };
    if (move.rule === 'indices') return { correct: false, id: 'bid-indices', ctx: { part: move.part, base: String(move.part).replace(/[²³]/, ''), pow: /³/.test(move.part) ? 3 : 2 } };
    if (move.rule === 'md') return { correct: false, id: 'bid-md', ctx: { part: move.part, picked } };
    return { correct: false, id: 'bid-as', ctx: { part: move.part } };
  }

  function workOutStep(move, i, isLast) {
    const powered = move.work === 'indices';
    const o = move.o, x = move.x, y = move.y, pw = move.pow;
    const base = powered ? String(x) : null;
    // "(12 + 7)" reads better as "12 + 7" mid-sentence
    const bare = String(move.part).replace(/^\((.*)\)$/, '$1');
    const pool = powered
      ? numberPool([move.value, x * pw].filter((v) => v >= 0), 3, Math.max(0, move.value - 8), move.value + 10)
      : valuePool(o, x, y, move.value);
    return pickStep({
      key: 'work-' + i,
      prompt: isLast ? `Now work out ${move.from}. What is the answer?` : `Work out ${bare}. What does it come to?`,
      hint: powered
        ? `${base}${SUP[pw]} means ${Array(pw).fill(base).join(' × ')}.`
        : `${bare} means ${PHRASE[o](x, y)}.`,
      why: powered
        ? `A power tells you how many copies to multiply: ${base}${SUP[pw]} = ${Array(pw).fill(base).join(' × ')} = ${move.value}.`
        : `${bare} = ${move.value}. Replace that part with its answer and the sum gets shorter.`,
      longWay: isLast
        ? `${move.from}\n= ${move.value}`
        : `${move.from}\n${move.part} = ${move.value}\nso it becomes ${move.to}`,
      resultText: isLast ? `= ${move.value}` : `${move.part} = ${move.value}   →   ${move.to}`,
      expected: [move.value],
      pool,
      isAnswer: !!isLast,
      diagnose: (v) => {
        if (!powered && opTrap(o, x, y) != null && String(opTrap(o, x, y)) === String(v)) {
          return { correct: false, id: 'bid-wrong-op', ctx: { part: bare, word: WORD[o], answer: move.value, picked: v } };
        }
        if (powered && String(x * pw) === String(v)) {
          return { correct: false, id: 'bid-power-times', ctx: { base, pow: pw, answer: move.value, sup: SUP[pw] } };
        }
        return { correct: false, id: 'num-wrong', ctx: { expr: bare, answer: move.value } };
      },
    });
  }

  /* A whole problem from an expression: which-first + work-out for every move,
     with the last move asked as one plain "now finish it" question. */
  function problem(items, opts) {
    const o = opts || {};
    const { moves, value } = walk(items);
    const given = render(items);
    const steps = [];
    moves.forEach((mv, i) => {
      const isLast = i === moves.length - 1;
      // no point asking "which first?" when only one operation is left to do
      if ((!isLast || moves.length === 1) && countAllOps(mv.from) > 1) {
        steps.push(whichFirstStep(mv, mv.itemsBefore, i));
      }
      if (o.spotOnly) return;
      steps.push(workOutStep(mv, i, isLast));
    });
    // Spotting level: the "which part first" question IS the whole answer.
    if (o.spotOnly && steps.length) {
      steps.length = 1;
      steps[0] = Object.assign({}, steps[0], { isAnswer: true });
    }
    if (!steps.length) return problem(items, {});   // nothing to spot — ask it in full
    return { subject: 'bidmas', given, sig: given, answer: String(value), steps };
  }
  // A power counts as a job to be done here: in "17 − 3²" the whole lesson is that
  // the ² goes before the −, so that question has to get asked.
  function countAllOps(text) { return (String(text).match(/[+−×÷²³]/g) || []).length; }

  // ---------------- shapes, easiest first ----------------
  const divisible = (lo, hi, dlo, dhi) => { const d = rand(dlo, dhi), q = rand(lo, hi); return [d * q, d, q]; };

  // × ÷ before + −
  function shapeMD() {
    const b = rand(2, 9), c = rand(2, 9), p = b * c;
    const [bb, cc, q] = divisible(2, 9, 2, 6);
    return pick([
      () => [num(rand(2, 20)), op('+'), num(b), op('×'), num(c)],
      () => [num(b), op('×'), num(c), op('+'), num(rand(2, 20))],
      () => [num(p + rand(1, 12)), op('−'), num(b), op('×'), num(c)],
      () => [num(rand(2, 20)), op('+'), num(bb), op('÷'), num(cc)],
      () => [num(bb), op('÷'), num(cc), op('+'), num(rand(2, 20))],
      () => [num(q + rand(1, 12)), op('−'), num(bb), op('÷'), num(cc)],
    ])();
  }
  // brackets first
  function shapeBrackets() {
    const a = rand(2, 9), b = rand(2, 12), c = rand(2, 9);
    const hi = Math.max(b, c) + rand(1, 6);
    // (x + y) ÷ d: split a multiple of d into two parts so the division stays whole
    const d = rand(2, 6), total = d * rand(2, 9), x = rand(1, total - 1);
    return pick([
      () => [num(a), op('×'), grp([num(b), op('+'), num(c)])],
      () => [grp([num(b), op('+'), num(c)]), op('×'), num(a)],
      () => [num(a), op('×'), grp([num(hi), op('−'), num(c)])],
      () => [grp([num(x), op('+'), num(total - x)]), op('÷'), num(d)],
      () => [num(b + c + rand(1, 9)), op('−'), grp([num(b), op('+'), num(c)])],
      () => [num(a), op('+'), grp([num(hi), op('−'), num(c)])],
    ])();
  }
  // equal priority → left to right (the classic trap)
  function shapeLR() {
    const c = rand(2, 6), q = rand(2, 9), b = rand(2, 6);
    return pick([
      () => [num(b * q), op('÷'), num(b), op('×'), num(c)],
      () => [num(q), op('×'), num(b * c), op('÷'), num(b)],
      () => [num(q * b * c), op('÷'), num(b), op('÷'), num(c)],
      () => [num(rand(10, 30)), op('−'), num(rand(2, 9)), op('+'), num(rand(2, 9))],
      () => [num(rand(2, 20)), op('+'), num(rand(2, 12)), op('−'), num(rand(2, 9))],
    ])();
  }
  // indices
  function shapeIndices() {
    const b = rand(2, 9), sq = b * b, a = rand(2, 15), s = rand(2, 5), t = rand(2, 4);
    const cube = pick([2, 3, 4]);
    return pick([
      () => [num(a), op('+'), num(b, 2)],
      () => [num(b, 2), op('+'), num(a)],
      () => [num(sq + rand(1, 9)), op('−'), num(b, 2)],
      () => [num(rand(2, 6)), op('×'), num(rand(2, 6), 2)],
      () => [grp([num(s), op('+'), num(t)], 2)],
      () => [num(cube, 3), op('+'), num(a)],
    ])();
  }
  // everything together
  function shapeMix() {
    const a = rand(2, 9), b = rand(2, 8), c = rand(2, 7), d = rand(2, 6), s = rand(2, 4), t = rand(1, 4);
    return pick([
      () => [num(rand(2, 15)), op('+'), num(b), op('×'), grp([num(c), op('+'), num(d)])],
      () => [grp([num(a), op('+'), num(b)]), op('×'), num(c), op('−'), num(rand(2, 9))],
      () => [num(a), op('×'), num(b, 2), op('+'), num(rand(2, 15))],
      () => [num(b * c + rand(2, 20)), op('−'), num(b), op('×'), num(c)],
      () => [grp([num(s), op('+'), num(t)], 2), op('+'), num(rand(2, 12))],
      () => [num(rand(2, 12)), op('+'), num(b), op('×'), num(c), op('−'), num(d)],
      () => [num(a, 2), op('−'), num(b), op('×'), num(2)],
    ])();
  }

  /* Only keep a generated sum if it stays kind: whole numbers all the way down and
     nothing dips below zero, so a child meeting BIDMAS isn't also fighting negatives. */
  function tidy(items) {
    const { moves, value } = walk(items);
    if (!moves.length || !Number.isFinite(value)) return false;
    if (!Number.isInteger(value) || value < 0) return false;
    return moves.every((m) => Number.isInteger(m.value) && m.value >= 0);
  }
  function make(shape, opts) {
    for (let i = 0; i < 60; i++) {
      const items = shape();
      if (tidy(items)) return problem(items, opts);
    }
    return problem([num(4), op('+'), num(3), op('×'), num(2)], opts);
  }

  // Spotting only works as a question when there is a real choice to make, so the
  // shapes here always print at least two operations.
  function shapeSpot() {
    const b = rand(2, 9), a = rand(2, 15);
    return pick([shapeMD, shapeBrackets, shapeLR,
      () => [num(a), op('+'), num(b, 2)],
      () => [num(b, 2), op('−'), num(rand(2, 9))],
    ])();
  }

  const api = {
    bidmasSpot: () => make(shapeSpot, { spotOnly: true }),
    bidmasMD: () => make(shapeMD),
    bidmasBrackets: () => make(shapeBrackets),
    bidmasLR: () => make(shapeLR),
    bidmasIndices: () => make(shapeIndices),
    bidmasMix: () => make(shapeMix),
    // exposed for the tests
    _bidmasWalk: walk, _bidmasRender: render, _bidmasNum: num, _bidmasOp: op, _bidmasGrp: grp,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
