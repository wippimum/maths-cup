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
  // Graded to match the CGP Foundation exercises the school sets (pp. 89-90):
  //   tier 1  b + b + b + b        one letter, all positive        (Ex 1)
  //   tier 2  q − 3q − 2q          one letter, ANSWER CAN BE NEGATIVE (Ex 2)
  //   tier 3  5x + 2y + 3x         two letters                     (Ex 3)
  //   tier 4  3x + 6 − 6x − 4      letters and plain numbers       (Ex 4-5)
  //   tier 5  x² + 3x + 2 + 2x + 3 with a squared term             (Ex 7)
  // The book starts far easier than a two-letter expression, and it lets the answer come
  // out negative — both of which the first version of this level skipped.
  const LETTERS = ['a', 'b', 'c', 'd', 'm', 'n', 'p', 'q', 's', 'x', 'y', 'z'];
  function twoLetters() {
    const a = pick(LETTERS);
    let b = pick(LETTERS); let g = 0;
    while (b === a && g++ < 20) b = pick(LETTERS);
    return [a, b];
  }
  function collectLikeTerms(tier) {
    const t = tier || 1;
    // each "kind" is a letter part with the coefficients written in the question
    let kinds;
    if (t === 1) {
      const L = pick(LETTERS);
      kinds = [{ l: L, coefs: Array.from({ length: rand(3, 4) }, () => rand(1, 6)) }];
    } else if (t === 2) {
      const L = pick(LETTERS);
      const n = rand(3, 4);
      kinds = [{ l: L, coefs: Array.from({ length: n }, (_, i) => (i === 0 ? rand(1, 8) : nz(-6, 5))) }];
    } else if (t === 3) {
      const [A, B] = twoLetters();
      kinds = [{ l: A, coefs: [rand(1, 8), nz(-5, 6)] }, { l: B, coefs: [rand(1, 7), nz(-4, 5)] }];
    } else if (t === 4) {
      const L = pick(LETTERS);
      kinds = [{ l: L, coefs: [rand(1, 8), nz(-7, 6)] }, { l: '', coefs: [rand(2, 12), nz(-9, 9)] }];
    } else {
      const L = pick(['x', 'p', 'b']);
      kinds = [{ l: L + '²', coefs: [rand(1, 3), rand(1, 3)] },
        { l: L, coefs: [rand(1, 6), nz(-4, 5)] },
        { l: '', coefs: [rand(1, 9), nz(-6, 6)] }];
    }
    // no kind may vanish, or the answer gets a hole in it
    kinds.forEach((k) => { k.sum = k.coefs.reduce((a, b) => a + b, 0); });
    if (kinds.some((k) => k.sum === 0)) return collectLikeTerms(t);

    // write the terms interleaved, the way a question actually looks
    const written = [];
    const queues = kinds.map((k) => k.coefs.slice());
    while (queues.some((q) => q.length)) {
      for (let i = 0; i < queues.length; i++) {
        if (!queues[i].length) continue;
        // take one or two from a queue at a time so they don't come out perfectly alternating
        const take = queues[i].length > 1 && Math.random() < 0.35 ? 2 : 1;
        for (let k = 0; k < take; k++) if (queues[i].length) written.push([queues[i].shift(), kinds[i].l]);
      }
    }
    const shown = expr(written);
    const answer = expr(kinds.map((k) => [k.sum, k.l]));
    const first = kinds[0];
    const firstTerms = written.filter((w) => w[1] === first.l).map((w) => term(w[0], w[1]));

    const steps = [];
    if (kinds.length > 1) {
      steps.push(chooseStep({
        key: 'spot', prompt: `Tap every term that is a LIKE term with ${first.l ? term(1, first.l) : 'a plain number'}.`,
        hint: `They are ${firstTerms.join(' and ')}.`,
        why: first.l
          ? `Like terms contain exactly the same letter part. ${firstTerms.join(' and ')} are all lots of ${first.l}. A ${first.l}-term and a ${kinds[1].l || 'plain number'} can never be added together — they are different things.`
          : `Plain numbers are like terms with each other, so they collect together just like the letter terms do.`,
        resultText: `${first.l || 'number'} terms: ${firstTerms.join(', ')}`,
        expected: firstTerms,
        pool: written.map((w) => term(w[0], w[1])),
        diagnose: () => ({ correct: false, id: 'like-terms', ctx: { letter: first.l || 'number', terms: firstTerms.join(', ') } }),
      }));
    }
    kinds.forEach((k, i) => {
      const sum = k.coefs.map((c, j) => (j === 0 ? String(c) : (c < 0 ? `${M} ${Math.abs(c)}` : `+ ${c}`))).join(' ');
      steps.push(nStep({
        key: 'k' + i,
        prompt: `${i === 0 ? 'Now combine them' : 'Next'}: ${sum} = ? ${k.l ? `(that is how many ${k.l})` : '(the plain numbers)'}`,
        hint: `${sum} = ${k.sum}.`,
        why: k.l
          ? `Only the numbers in front are added — the ${k.l} itself does not change. ${k.sum < 0 ? `The answer here is negative, and that is fine: ${term(k.sum, k.l)} is a perfectly good term.` : ''}`
          : `The plain numbers collect together on their own.`,
        resultText: term(k.sum, k.l), answer: k.sum,
        lo: k.sum - 12, hi: k.sum + 12, expr: sum,
      }));
    });
    steps.push(buildStep({
      key: 'write', prompt: `Write the simplified expression.`,
      hint: `${answer}.`,
      why: kinds.length > 1
        ? `Put the collected terms together. It will not simplify further — ${kinds.map((k) => term(k.sum, k.l)).join(' and ')} are not like terms.`
        : `All the terms were like terms, so they collapse into the single term ${answer}.`,
      longWay: `${shown}\n= ${answer}`,
      resultText: answer,
      pieces: answer.split(/\s+/), solution: answer.split(/\s+/).join(' '),
      distractors: [term(kinds.reduce((a, k) => a + k.sum, 0), first.l), String(kinds.reduce((a, k) => a + k.sum, 0))],
      isAnswer: true,
      check: (raw) => {
        const got = String(raw).replace(/\s+/g, ' ').trim();
        return got === answer ? { correct: true } : { correct: false, id: 'collect-write', ctx: { answer } };
      },
    }));
    return { subject: 'algebra1', sig: `cl:${t}:${shown}`, given: `Simplify  ${shown}`, answer, steps };
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
