/* algebra1.js — Topic 5, Introduction to Algebra.
   The school teaches a whole topic BEFORE solving equations (Topic 9): what the
   notation means, writing expressions from words, substituting numbers in, and
   collecting like terms. The app used to jump straight to solving, so this fills
   the gap. Objectives, verbatim from the Toddle unit plan:
     · Understanding algebraic notation to read and write expressions
     · Writing expressions in context
     · Substituting positive integers into expressions
     · Substituting negative integers into expressions
     · Recognising 'like terms' and simplify expressions by collecting like terms
     · Writing and simplifying expressions using real life contexts (area, perimeter) */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, chooseStep = W._chooseStep;
  const numberPool = W._numberPool, shuffle = W._shuffle;
  const { parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const nz = (a, b) => { let v = 0; while (v === 0) v = rand(a, b); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const M = '−';
  const n2 = (v) => (v < 0 ? M + Math.abs(v) : String(v));           // −3
  const br = (v) => (v < 0 ? `(${M}${Math.abs(v)})` : String(v));    // (−3)

  function nStep(o) {
    const a = o.answer;
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], isAnswer: !!o.isAnswer,
      pool: o.pool || numberPool([a], 4, a - 12, a + 12),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }
  function sStep(o) {
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [o.answer], pool: o.pool, isAnswer: !!o.isAnswer,
      diagnose: () => ({ correct: false, id: 'algebra-notation', ctx: { answer: o.answer, why: o.why } }),
    });
  }
  // "3a", "a", "−a", "7"
  function term(coef, letter) {
    if (!letter) return n2(coef);
    if (coef === 1) return letter;
    if (coef === -1) return M + letter;
    return n2(coef) + letter;
  }
  // join terms into "5a + 2b − 3"
  function expr(parts) {
    let s = '';
    parts.forEach(([c, l], i) => {
      if (c === 0) return;
      if (i === 0 || s === '') { s += term(c, l); return; }
      s += c < 0 ? ` ${M} ${term(Math.abs(c), l)}` : ` + ${term(c, l)}`;
    });
    return s || '0';
  }

  // ============================================================ 1. NOTATION
  const NOTATION = [
    { q: 'What does 5a mean?', a: '5 × a', opts: ['5 × a', '5 + a', 'a ÷ 5', 'a5'], why: 'A number written next to a letter means MULTIPLY. 5a is short for 5 × a — the × is left out to save writing it every time.' },
    { q: 'What does a² mean?', a: 'a × a', opts: ['a × a', 'a × 2', 'a + a', '2 × a'], why: 'A power tells you how many of the letter are multiplied together. a² = a × a, NOT a × 2. Getting this mixed up is the most common slip in algebra.' },
    { q: 'What does ab mean?', a: 'a × b', opts: ['a × b', 'a + b', 'a − b', 'a ÷ b'], why: 'Two letters written together are multiplied: ab = a × b.' },
    { q: 'How do you write "n divided by 4"?', a: 'n/4', opts: ['n/4', '4/n', '4n', 'n − 4'], why: 'Division in algebra is written as a fraction, with the thing being divided on top: n ÷ 4 = n/4.' },
    { q: 'How do you write "7 more than x"?', a: 'x + 7', opts: ['x + 7', '7x', 'x − 7', '7 − x'], why: '"More than" means add. 7 more than x is x + 7.' },
    { q: 'How do you write "6 less than y"?', a: 'y − 6', opts: ['y − 6', '6 − y', '6y', 'y + 6'], why: 'Careful with the order: "6 less than y" means start at y and take 6 away, so y − 6 — not 6 − y.' },
    { q: 'How do you write "double m, then add 3"?', a: '2m + 3', opts: ['2m + 3', '2(m + 3)', 'm² + 3', '3m + 2'], why: 'Double m is 2m, then add 3: 2m + 3. Brackets would mean you added first, which is a different instruction.' },
    { q: 'What does 4(x + 2) mean?', a: '4 lots of (x + 2)', opts: ['4 lots of (x + 2)', '4x + 2', '4 + x + 2', 'x + 8'], why: 'The 4 outside multiplies EVERYTHING in the bracket: 4 lots of (x + 2), which comes to 4x + 8.' },
    { q: 'Which of these means "3 times a number, take away 1"?', a: '3n − 1', opts: ['3n − 1', '1 − 3n', '3(n − 1)', 'n − 3'], why: '3 times the number is 3n; then take away 1 gives 3n − 1.' },
    { q: 'What does 2x + 2x simplify to?', a: '4x', opts: ['4x', '4x²', '2x²', '4'], why: '2 lots of x plus 2 more lots of x makes 4 lots of x. You add the numbers in front; the letter itself does not change.' },
  ];
  function notation() {
    const e = pick(NOTATION);
    return {
      subject: 'algebra1', given: e.q, sig: 'no:' + e.q, answer: e.a,
      steps: [sStep({ key: 'not', prompt: e.q, hint: e.why, why: e.why,
        resultText: e.a, answer: e.a, pool: shuffle(e.opts.slice()), isAnswer: true })],
    };
  }

  // ============================================================ 2. WRITING EXPRESSIONS IN CONTEXT
  const CONTEXTS = [
    (n) => { const k = rand(2, 9); return { story: `Sam has ${n} stickers. He buys ${k} more. How many does he have now?`, a: `${n} + ${k}`, opts: [`${n} + ${k}`, `${n} ${M} ${k}`, `${k}${n}`, `${n}/${k}`], why: `"More" means add, so ${n} + ${k}.` }; },
    (n) => { const k = rand(2, 9); return { story: `A bag holds ${n} sweets. How many sweets in ${k} bags?`, a: `${k}${n}`, opts: [`${k}${n}`, `${n} + ${k}`, `${n} ${M} ${k}`, `${n}/${k}`], why: `${k} bags of ${n} sweets each means MULTIPLY: ${k} × ${n}, written ${k}${n}.` }; },
    (n) => { const k = rand(2, 9); return { story: `${n} cakes are shared equally between ${k} friends. How many does each get?`, a: `${n}/${k}`, opts: [`${n}/${k}`, `${k}/${n}`, `${k}${n}`, `${n} ${M} ${k}`], why: `"Shared equally" means divide, and division is written as a fraction: ${n}/${k}.` }; },
    (n) => { const k = rand(2, 9); return { story: `A pen costs ${n} dirhams. What is the change from ${k * 10} dirhams?`, a: `${k * 10} ${M} ${n}`, opts: [`${k * 10} ${M} ${n}`, `${n} ${M} ${k * 10}`, `${n} + ${k * 10}`, `${k * 10}${n}`], why: `Change = what you paid − what it cost, so ${k * 10} ${M} ${n}. The order matters here.` }; },
    (n) => { const k = rand(2, 6); return { story: `${n} is a player's score. The team scores ${k} times that. Write the team's score.`, a: `${k}${n}`, opts: [`${k}${n}`, `${n} + ${k}`, `${n}/${k}`, `${n}^${k}`], why: `"${k} times that" means multiply by ${k}: ${k}${n}.` }; },
    (n) => { const k = rand(2, 9); return { story: `There are ${n} players. ${k} of them are injured and cannot play. How many can play?`, a: `${n} ${M} ${k}`, opts: [`${n} ${M} ${k}`, `${k} ${M} ${n}`, `${n} + ${k}`, `${k}${n}`], why: `Take the injured players away from the total: ${n} ${M} ${k}.` }; },
  ];
  function writeExpression() {
    const letter = pick(['n', 'x', 'p', 'c']);
    const e = pick(CONTEXTS)(letter);
    return {
      subject: 'algebra1', given: e.story, sig: 'we:' + e.story, answer: e.a,
      steps: [sStep({ key: 'expr', prompt: `Write this as an algebra expression, using ${letter}.`,
        hint: e.why, why: `${e.why} Writing the expression is the whole skill here — you are not working out a number, because ${letter} could be anything.`,
        resultText: e.a, answer: e.a, pool: shuffle(e.opts.slice()), isAnswer: true })],
    };
  }

  // ============================================================ 3. SUBSTITUTION
  // negatives:false → positive values only (the first substitution level)
  function substitute(negatives) {
    const a = negatives ? nz(-8, 8) : rand(2, 9);
    const b = negatives ? nz(-8, 8) : rand(2, 9);
    const ca = rand(2, 6), cb = rand(2, 5);
    const plus = Math.random() < 0.6;
    const t1 = ca * a, t2 = cb * b, total = plus ? t1 + t2 : t1 - t2;
    const e = `${term(ca, 'a')} ${plus ? '+' : M} ${term(cb, 'b')}`;
    return {
      subject: 'algebra1', sig: `sub:${negatives ? 'n' : 'p'}:${ca},${a},${cb},${b},${plus}`,
      given: `If a = ${n2(a)} and b = ${n2(b)}, work out  ${e}`, answer: String(total),
      steps: [
        nStep({ key: 't1', prompt: `${term(ca, 'a')} means ${ca} × a. With a = ${n2(a)}, what is ${ca} × ${br(a)}?`,
          hint: `${ca} × ${br(a)} = ${n2(t1)}.`,
          why: `Substituting means swapping the letter for its value. Put ${br(a)} in place of a — and keep the brackets, so the sign travels with the number.`,
          resultText: `${term(ca, 'a')} = ${n2(t1)}`, answer: t1, expr: `${ca} × ${br(a)}` }),
        nStep({ key: 't2', prompt: `Now ${term(cb, 'b')} with b = ${n2(b)}: ${cb} × ${br(b)} = ?`,
          hint: `${cb} × ${br(b)} = ${n2(t2)}.`,
          why: `Same again for the second term.`,
          resultText: `${term(cb, 'b')} = ${n2(t2)}`, answer: t2, expr: `${cb} × ${br(b)}` }),
        nStep({ key: 'tot', prompt: `Finally: ${n2(t1)} ${plus ? '+' : M} ${br(t2)} = ?`,
          hint: `${n2(t1)} ${plus ? '+' : M} ${br(t2)} = ${n2(total)}.`,
          why: negatives
            ? `Watch the signs. Subtracting a negative turns into adding, and adding a negative turns into subtracting.`
            : `Put the two pieces together to finish.`,
          longWay: `${e}\n= ${ca} × ${br(a)} ${plus ? '+' : M} ${cb} × ${br(b)}\n= ${n2(t1)} ${plus ? '+' : M} ${br(t2)}\n= ${n2(total)}`,
          resultText: `${e} = ${n2(total)}`, answer: total, expr: `${n2(t1)} ${plus ? '+' : M} ${br(t2)}`, isAnswer: true }),
      ],
    };
  }
  // Substitution into a formula with a square or a bracket.
  function substituteHarder() {
    const a = rand(2, 7), b = rand(2, 9), c = rand(1, 9);
    const shape = pick(['sq', 'bracket', 'ab']);
    if (shape === 'sq') {
      const sq = a * a, total = sq + c;
      return {
        subject: 'algebra1', sig: `sh:sq:${a},${c}`, given: `If a = ${a}, work out  a² + ${c}`, answer: String(total),
        steps: [
          nStep({ key: 'sq', prompt: `a² means a × a. With a = ${a}, what is ${a} × ${a}?`, hint: `${a} × ${a} = ${sq}.`,
            why: `a² is a MULTIPLIED by itself — not a × 2. With a = ${a} that is ${a} × ${a} = ${sq}, not ${2 * a}.`,
            resultText: `a² = ${sq}`, answer: sq, expr: `${a} × ${a}` }),
          nStep({ key: 'add', prompt: `Now add ${c}: ${sq} + ${c} = ?`, hint: `${sq} + ${c} = ${total}.`,
            why: `The power is worked out before the addition — that is BIDMAS.`,
            longWay: `a² + ${c}\n= ${a} × ${a} + ${c}\n= ${sq} + ${c}\n= ${total}`,
            resultText: `a² + ${c} = ${total}`, answer: total, expr: `${sq} + ${c}`, isAnswer: true }),
        ],
      };
    }
    if (shape === 'ab') {
      const prod = a * b;
      return {
        subject: 'algebra1', sig: `sh:ab:${a},${b}`, given: `If a = ${a} and b = ${b}, work out  ab`, answer: String(prod),
        steps: [nStep({ key: 'ab', prompt: `ab means a × b. So ${a} × ${b} = ?`, hint: `${a} × ${b} = ${prod}.`,
          why: `Two letters side by side are multiplied. ab is not "a then b" written together as digits — it means ${a} × ${b}.`,
          resultText: `ab = ${prod}`, answer: prod, expr: `${a} × ${b}`, isAnswer: true })],
      };
    }
    const inner = a + c, total = b * inner;
    return {
      subject: 'algebra1', sig: `sh:br:${a},${b},${c}`, given: `If a = ${a}, work out  ${b}(a + ${c})`, answer: String(total),
      steps: [
        nStep({ key: 'in', prompt: `Brackets first. With a = ${a}, what is ${a} + ${c}?`, hint: `${a} + ${c} = ${inner}.`,
          why: `Work out what is inside the bracket before multiplying by the number outside.`,
          resultText: `a + ${c} = ${inner}`, answer: inner, expr: `${a} + ${c}` }),
        nStep({ key: 'mul', prompt: `Now multiply by ${b}: ${b} × ${inner} = ?`, hint: `${b} × ${inner} = ${total}.`,
          why: `The ${b} outside multiplies the whole bracket.`,
          longWay: `${b}(a + ${c})\n= ${b}(${a} + ${c})\n= ${b} × ${inner}\n= ${total}`,
          resultText: `${b}(a + ${c}) = ${total}`, answer: total, expr: `${b} × ${inner}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ 4. COLLECTING LIKE TERMS
  function collectLikeTerms(withNumbers) {
    const a1 = rand(2, 8), a2 = nz(-4, 6), b1 = rand(2, 7), b2 = nz(-4, 5);
    const n1 = withNumbers ? rand(1, 9) : 0, n2v = withNumbers ? nz(-6, 6) : 0;
    const sa = a1 + a2, sb = b1 + b2, sn = n1 + n2v;
    if (sa <= 0 || sb <= 0) return collectLikeTerms(withNumbers);
    // the expression as written, in a deliberately jumbled order
    const parts = [[a1, 'a'], [b1, 'b'], [a2, 'a'], [b2, 'b']];
    if (withNumbers) { parts.splice(2, 0, [n1, '']); parts.push([n2v, '']); }
    const shown = expr(parts);
    const aTerms = parts.filter((p) => p[1] === 'a').map((p) => term(p[0], 'a'));
    const answer = expr(withNumbers ? [[sa, 'a'], [sb, 'b'], [sn, '']] : [[sa, 'a'], [sb, 'b']]);
    const steps = [
      chooseStep({
        key: 'spot', prompt: `Tap all the terms that are LIKE terms with a.`,
        hint: `The a-terms here are ${aTerms.join(' and ')}.`,
        why: `Like terms have exactly the same letter part. ${aTerms.join(' and ')} are all lots of a, so they can be combined. An a-term and a b-term can never be added together — they are different things.`,
        resultText: `a-terms: ${aTerms.join(', ')}`,
        expected: aTerms,
        pool: parts.filter((p) => p[0] !== 0).map((p) => term(p[0], p[1])),
        diagnose: () => ({ correct: false, id: 'like-terms', ctx: { letter: 'a', terms: aTerms.join(', ') } }),
      }),
      nStep({ key: 'a', prompt: `Combine them: ${a1} ${a2 < 0 ? M : '+'} ${Math.abs(a2)} = ? (that is how many a's)`,
        hint: `${a1} ${a2 < 0 ? M : '+'} ${Math.abs(a2)} = ${sa}.`,
        why: `Only the numbers in front get added — the a stays an a. ${a1} lots of a ${a2 < 0 ? 'take away' : 'plus'} ${Math.abs(a2)} lots of a gives ${sa} lots of a.`,
        resultText: `${term(sa, 'a')}`, answer: sa, expr: `${a1} ${a2 < 0 ? M : '+'} ${Math.abs(a2)}` }),
      nStep({ key: 'b', prompt: `Now the b's: ${b1} ${b2 < 0 ? M : '+'} ${Math.abs(b2)} = ?`,
        hint: `${b1} ${b2 < 0 ? M : '+'} ${Math.abs(b2)} = ${sb}.`,
        why: `Same again with the b-terms.`,
        resultText: `${term(sb, 'b')}`, answer: sb, expr: `${b1} ${b2 < 0 ? M : '+'} ${Math.abs(b2)}` }),
    ];
    if (withNumbers) {
      steps.push(nStep({ key: 'n', prompt: `And the plain numbers: ${n1} ${n2v < 0 ? M : '+'} ${Math.abs(n2v)} = ?`,
        hint: `${n1} ${n2v < 0 ? M : '+'} ${Math.abs(n2v)} = ${sn}.`,
        why: `Plain numbers are like terms with each other too.`,
        resultText: `${sn}`, answer: sn, expr: `${n1} ${n2v < 0 ? M : '+'} ${Math.abs(n2v)}` }));
    }
    steps.push(buildStep({
      key: 'write', prompt: `Write the simplified expression.`,
      hint: `${answer}.`,
      why: `Put the collected terms together. It cannot be simplified any further, because ${term(sa, 'a')} and ${term(sb, 'b')} are not like terms.`,
      longWay: `${shown}\n= ${answer}`,
      resultText: answer,
      pieces: answer.split(/\s+/),
      solution: answer.split(/\s+/).join(' '),
      distractors: [term(sa + sb, 'a'), 'ab', String(sa + sb)],
      isAnswer: true,
      check: (raw) => {
        const got = String(raw).replace(/\s+/g, ' ').trim();
        return got === answer ? { correct: true } : { correct: false, id: 'collect-write', ctx: { answer } };
      },
    }));
    return { subject: 'algebra1', sig: `cl:${shown}`, given: `Simplify  ${shown}`, answer, steps };
  }

  // ============================================================ 5. PERIMETER & AREA EXPRESSIONS
  function perimeterExpression() {
    const k = rand(1, 6);
    const wide = Math.random() < 0.5;
    // rectangle x by (x + k)
    const per = expr([[4, 'x'], [2 * k, '']]);
    const diagram = W.fig ? W.fig.rect('x', `x + ${k}`, { unit: false }) : undefined;
    return {
      subject: 'algebra1', sig: `pe:${k}`, diagram,
      given: `A rectangle is x cm long and (x + ${k}) cm wide. Write an expression for its PERIMETER.`,
      answer: per,
      steps: [
        sStep({ key: 'sum', prompt: `Perimeter is all four sides added. There are two lengths and two widths. What is 2 lots of x?`,
          hint: `2 × x = 2x.`, why: `Two sides are x cm each, so together they are 2x.`,
          resultText: `the two lengths are 2x`, answer: '2x', pool: shuffle(['2x', 'x²', 'x + 2', '2 + x']) }),
        sStep({ key: 'w', prompt: `And 2 lots of (x + ${k})?`,
          hint: `2(x + ${k}) = 2x + ${2 * k}.`,
          why: `The 2 multiplies EVERYTHING inside the bracket: 2 × x = 2x and 2 × ${k} = ${2 * k}.`,
          resultText: `the two widths are 2x + ${2 * k}`, answer: `2x + ${2 * k}`,
          pool: shuffle([`2x + ${2 * k}`, `2x + ${k}`, `x + ${2 * k}`, `2x${k}`]) }),
        buildStep({ key: 'total', prompt: `Add them and collect like terms: 2x + (2x + ${2 * k}).`,
          hint: `2x + 2x = 4x, so the perimeter is ${per}.`,
          why: `Collect the x-terms: 2x + 2x = 4x. The ${2 * k} is a plain number, so it stays on its own.`,
          longWay: `Perimeter = x + x + (x + ${k}) + (x + ${k})\n= 4x + ${2 * k}`,
          resultText: `Perimeter = ${per} cm`,
          pieces: per.split(/\s+/), solution: per.split(/\s+/).join(' '),
          distractors: ['2x', String(k), 'x²'], isAnswer: true,
          check: (raw) => {
            const got = String(raw).replace(/\s+/g, ' ').trim();
            return got === per ? { correct: true } : { correct: false, id: 'collect-write', ctx: { answer: per } };
          } }),
      ],
    };
  }

  const api = { notation, writeExpression, substitute, substituteHarder, collectLikeTerms, perimeterExpression };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
