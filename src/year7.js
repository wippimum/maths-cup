/* year7.js — Year 7 (KS3), Fractions and Mixed Numbers.
   The first Year 7 topic. Year 6 already covers converting between mixed numbers and
   improper fractions; KS3 goes past that, and these levels are the step up, modelled on
   Section 5 of the CGP Foundation book the school issues:

     5.2  improper -> mixed IN ITS LOWEST TERMS (26/4 -> 13/2 -> 6 1/2), and whole
          numbers written as improper fractions
     5.4  adding and subtracting MIXED NUMBERS: make them improper, give them a common
          denominator, then turn the answer back into a mixed number
     5.5  multiplying mixed numbers, reciprocals, and dividing by a fraction
     5.2  spotting which of three fractions is not equivalent to the other two

   The method is the book's method, step for step, so the app and the exercise book agree.
   Everything is built from integers and checked for exactness — nothing here relies on
   a decimal ever coming out right. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep;
  const numberPool = W._numberPool, list = W._list, shuffle = W._shuffle;
  const { gcd, factors, common, parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const lcm = (a, b) => a / gcd(a, b) * b;

  function nStep(o) {
    const a = o.answer;
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], isAnswer: !!o.isAnswer,
      pool: o.pool || numberPool([a], 4, o.lo != null ? o.lo : a - 12, o.hi != null ? o.hi : a + 12),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }
  function sStep(o) {
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [o.answer], pool: o.pool, isAnswer: !!o.isAnswer,
      diagnose: (v) => (o.diagnose ? o.diagnose(v) : { correct: false, id: 'num-wrong', ctx: { answer: o.answer, expr: o.expr } }),
    });
  }
  // "2 3/4" if there is a fraction part, "2" if it divides exactly
  const mixStr = (w, n, d) => (n === 0 ? `${w}` : w === 0 ? `${n}/${d}` : `${w} ${n}/${d}`);
  // an improper fraction as a mixed number in lowest terms
  function toMixed(num, den) {
    const g = gcd(num, den), n2 = num / g, d2 = den / g;
    return { w: Math.floor(n2 / d2), n: n2 % d2, d: d2, sn: n2, sd: d2, g };
  }

  // ============================================================ 5.2 · lowest terms first
  // 26/4 is improper AND unsimplified. Y6 stops at 13/2 -> 6 1/2; the KS3 version starts
  // one step earlier, and simplifying FIRST is what keeps the numbers small.
  function improperLowestTerms() {
    const d = pick([2, 3, 4, 5, 6]), whole = rand(2, 6), n = rand(1, d - 1);
    // n/d must already be in lowest terms, or the "answer" would not be either —
    // 28/8 would come out as 3 2/4, and the HCF the first step asks for would be
    // bigger than the k we scaled by.
    if (gcd(n, d) !== 1) return improperLowestTerms();
    const top = whole * d + n;
    const k = rand(2, 4);
    const bigTop = top * k, bigDen = d * k;
    const cf = common(factors(bigTop), factors(bigDen));
    return {
      subject: 'y7frac', sig: `il:${bigTop}/${bigDen}`,
      given: `Write  ${bigTop}/${bigDen}  as a mixed number in its lowest terms`,
      answer: mixStr(whole, n, d),
      steps: [
        nStep({ key: 'hcf', prompt: `Simplify first. What is the highest common factor (HCF) of ${bigTop} and ${bigDen}?`,
          hint: `Common factors: ${list(cf)} — the biggest is ${k}.`,
          why: `Simplifying BEFORE you split off the whole number keeps every number small. ${bigTop} and ${bigDen} share a factor, so ${bigTop}/${bigDen} is not in its lowest terms yet — and a mixed number in lowest terms has to start from a fraction in lowest terms.`,
          resultText: `HCF = ${k}`, answer: k, pool: cf.length > 2 ? cf : numberPool(cf, 3, 2, Math.max(bigTop, 12)),
          expr: `HCF of ${bigTop} and ${bigDen}` }),
        sStep({ key: 'simp', prompt: `Divide top and bottom by ${k}. What does ${bigTop}/${bigDen} simplify to?`,
          hint: `${bigTop} ÷ ${k} = ${top}, ${bigDen} ÷ ${k} = ${d}, so ${top}/${d}.`,
          why: `${bigTop}/${bigDen} and ${top}/${d} are equivalent fractions — the same value written with smaller numbers. It is still improper, because ${top} is bigger than ${d}.`,
          resultText: `${top}/${d}`, answer: `${top}/${d}`,
          pool: shuffle([...new Set([`${top}/${d}`, `${d}/${top}`, `${bigTop}/${d}`, `${top}/${bigDen}`])]),
          expr: `${bigTop}/${bigDen} ÷ ${k}` }),
        nStep({ key: 'whole', prompt: `Now split it up. How many whole ones are there? ${top} ÷ ${d} = ? (just the whole part)`,
          hint: `${d} goes into ${top} ${whole} times (${whole} × ${d} = ${whole * d}).`,
          why: `${d} of the pieces make one whole, so dividing tells you how many whole ones you can make. What is left over stays as a fraction.`,
          resultText: `${whole} whole ones`, answer: whole, lo: 1, hi: whole + 8, expr: `${top} ÷ ${d}, whole part` }),
        buildStep({ key: 'write', prompt: `Write the mixed number: whole, then top, then bottom.`,
          hint: `${top} − ${whole * d} = ${n} left over, so ${mixStr(whole, n, d)}.`,
          why: `${top} ÷ ${d} = ${whole} remainder ${n}, so ${bigTop}/${bigDen} = ${mixStr(whole, n, d)}. Check it is in lowest terms: ${n} and ${d} share no factor, so it is finished.`,
          longWay: `${bigTop}/${bigDen} = ${top}/${d}   (÷ ${k})\n${top} ÷ ${d} = ${whole} remainder ${n}\nso ${bigTop}/${bigDen} = ${mixStr(whole, n, d)}`,
          resultText: `${bigTop}/${bigDen} = ${mixStr(whole, n, d)}`,
          pieces: [String(whole), String(n), '/', String(d)], distractors: [String(top), String(bigTop), String(bigDen)], isAnswer: true,
          check: (raw) => {
            const q = parseNumberList(String(raw).replace(/\//g, ' '));
            if (q.length < 3) return { correct: false, id: 'mixed-form', ctx: { whole, n, d } };
            if (q[0] === whole && q[1] === n && q[2] === d) return { correct: true };
            return { correct: false, id: 'mixed-form', ctx: { whole, n, d } };
          } }),
      ],
    };
  }

  // ============================================================ 5.4 · add and subtract mixed numbers
  function addSubMixed() {
    const sub = Math.random() < 0.5;
    const same = Math.random() < 0.4;
    const d1 = pick([3, 4, 5, 6, 8]);
    const d2 = same ? d1 : pick([2, 3, 4, 6, 8].filter((x) => x !== d1));
    const w1 = rand(1, 4), n1 = rand(1, d1 - 1);
    const w2 = rand(1, 3), n2 = rand(1, d2 - 1);
    // A question in a lowest-terms topic must not itself show 2 2/4.
    if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) return addSubMixed();
    const i1 = w1 * d1 + n1, i2 = w2 * d2 + n2;
    const L = lcm(d1, d2);
    const a = i1 * (L / d1), b = i2 * (L / d2);
    if (sub && a - b <= 0) return addSubMixed();
    const tot = sub ? a - b : a + b;
    const m = toMixed(tot, L);
    if (m.w === 0) return addSubMixed();               // keep the answer a mixed number
    const op = sub ? '−' : '+';
    const steps = [
      sStep({ key: 'i1', prompt: `First, write ${mixStr(w1, n1, d1)} as an improper fraction.`,
        hint: `${w1} × ${d1} + ${n1} = ${i1}, so ${i1}/${d1}.`,
        why: `You cannot add or subtract a whole number and a fraction while they are apart. Turn each mixed number into a single improper fraction first: multiply the whole by the denominator and add the numerator.`,
        resultText: `${mixStr(w1, n1, d1)} = ${i1}/${d1}`, answer: `${i1}/${d1}`,
        pool: shuffle([...new Set([`${i1}/${d1}`, `${w1 * d1}/${d1}`, `${w1 + n1}/${d1}`, `${d1}/${i1}`])]),
        expr: `${w1} × ${d1} + ${n1}` }),
      sStep({ key: 'i2', prompt: `Now write ${mixStr(w2, n2, d2)} as an improper fraction.`,
        hint: `${w2} × ${d2} + ${n2} = ${i2}, so ${i2}/${d2}.`,
        why: `Same move for the second one. The denominator never changes when you do this — only the numerator grows.`,
        resultText: `${mixStr(w2, n2, d2)} = ${i2}/${d2}`, answer: `${i2}/${d2}`,
        pool: shuffle([...new Set([`${i2}/${d2}`, `${w2 * d2}/${d2}`, `${w2 + n2}/${d2}`, `${d2}/${i2}`])]),
        expr: `${w2} × ${d2} + ${n2}` }),
    ];
    if (!same) {
      steps.push(nStep({ key: 'lcd', prompt: `The bottoms are different. What is the lowest common denominator of ${d1} and ${d2}?`,
        hint: `The smallest number both ${d1} and ${d2} divide into is ${L}.`,
        why: `Fractions can only be added or subtracted when the pieces are the same size, and that means the same denominator. The lowest common denominator is the LCM of ${d1} and ${d2}.`,
        resultText: `common denominator = ${L}`, answer: L,
        pool: uniqSort([L, d1 * d2, Math.max(d1, d2), L + Math.min(d1, d2)]), expr: `LCM of ${d1} and ${d2}` }));
      steps.push(sStep({ key: 'conv', prompt: `Rewrite both over ${L}. Which pair is right?`,
        hint: `${i1}/${d1} = ${a}/${L} and ${i2}/${d2} = ${b}/${L}.`,
        why: `Multiply the top and the bottom of each fraction by the same number, so the value does not change — only the way it is written. ${i1}/${d1} needs × ${L / d1}, and ${i2}/${d2} needs × ${L / d2}.`,
        resultText: `${a}/${L} and ${b}/${L}`, answer: `${a}/${L} and ${b}/${L}`,
        pool: shuffle([...new Set([`${a}/${L} and ${b}/${L}`, `${i1}/${L} and ${i2}/${L}`, `${a}/${L} and ${i2}/${L}`])]),
        expr: `${i1}/${d1} and ${i2}/${d2} over ${L}` }));
    }
    steps.push(nStep({ key: 'op', prompt: `Now ${sub ? 'subtract' : 'add'} the numerators: ${a} ${op} ${b} = ?`,
      hint: `${a} ${op} ${b} = ${sub ? a - b : a + b}.`,
      why: `The bottoms match, so the pieces are the same size — ${sub ? 'take one numerator from the other' : 'just count them all'} and keep the denominator ${L}. The bottom never gets ${sub ? 'subtracted' : 'added'}.`,
      resultText: `${tot}/${L}`, answer: tot, lo: 1, hi: tot + 12, expr: `${a} ${op} ${b}` }));
    steps.push(buildStep({ key: 'back', prompt: `Turn ${tot}/${L} back into a mixed number in its lowest terms.`,
      hint: `${tot} ÷ ${L} = ${m.w} remainder ${tot % L}${m.g > 1 ? `, and it simplifies to ${mixStr(m.w, m.n, m.d)}` : ''}. Answer: ${mixStr(m.w, m.n, m.d)}.`,
      why: `An answer left as ${tot}/${L} is correct but not finished — KS3 answers are given as mixed numbers in their lowest terms.${m.g > 1 ? ` Here ${tot}/${L} simplifies by ${m.g} first.` : ''}`,
      longWay: `${mixStr(w1, n1, d1)} ${op} ${mixStr(w2, n2, d2)}\n= ${i1}/${d1} ${op} ${i2}/${d2}\n= ${a}/${L} ${op} ${b}/${L}\n= ${tot}/${L}\n= ${mixStr(m.w, m.n, m.d)}`,
      resultText: `${mixStr(w1, n1, d1)} ${op} ${mixStr(w2, n2, d2)} = ${mixStr(m.w, m.n, m.d)}`,
      pieces: m.n === 0 ? [String(m.w)] : [String(m.w), String(m.n), '/', String(m.d)],
      distractors: [String(tot), String(L), String(m.d + 1)], isAnswer: true,
      check: (raw) => {
        const q = parseNumberList(String(raw).replace(/\//g, ' '));
        if (m.n === 0) return q.length === 1 && q[0] === m.w ? { correct: true } : { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: 0, d: 1 } };
        if (q.length < 3) return { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: m.n, d: m.d } };
        if (q[0] === m.w && q[1] === m.n && q[2] === m.d) return { correct: true };
        return { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: m.n, d: m.d } };
      } }));
    return {
      subject: 'y7frac', sig: `am:${w1}_${n1}_${d1}${op}${w2}_${n2}_${d2}`,
      given: `Work out  ${mixStr(w1, n1, d1)} ${op} ${mixStr(w2, n2, d2)}   (give your answer in its simplest form)`,
      answer: mixStr(m.w, m.n, m.d), steps,
    };
  }

  // ============================================================ 5.5 · multiplying mixed numbers
  function multMixed() {
    const d1 = pick([2, 3, 4, 5]), d2 = pick([2, 3, 4, 5]);
    const w1 = rand(1, 3), n1 = rand(1, d1 - 1);
    const w2 = rand(1, 2), n2 = rand(1, d2 - 1);
    if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) return multMixed();
    const i1 = w1 * d1 + n1, i2 = w2 * d2 + n2;
    const num = i1 * i2, den = d1 * d2;
    const m = toMixed(num, den);
    return {
      subject: 'y7frac', sig: `mm:${w1}_${n1}_${d1}x${w2}_${n2}_${d2}`,
      given: `Work out  ${mixStr(w1, n1, d1)} × ${mixStr(w2, n2, d2)}   (give your answer in its simplest form)`,
      answer: mixStr(m.w, m.n, m.d),
      steps: [
        sStep({ key: 'i1', prompt: `Write ${mixStr(w1, n1, d1)} as an improper fraction.`,
          hint: `${w1} × ${d1} + ${n1} = ${i1}, so ${i1}/${d1}.`,
          why: `You cannot multiply mixed numbers by multiplying the wholes and the fractions separately — that gives the wrong answer. Turn each one into a single improper fraction first.`,
          resultText: `${i1}/${d1}`, answer: `${i1}/${d1}`,
          pool: shuffle([...new Set([`${i1}/${d1}`, `${w1 + n1}/${d1}`, `${w1 * n1}/${d1}`, `${d1}/${i1}`])]),
          expr: `${w1} × ${d1} + ${n1}` }),
        sStep({ key: 'i2', prompt: `And ${mixStr(w2, n2, d2)} as an improper fraction.`,
          hint: `${w2} × ${d2} + ${n2} = ${i2}, so ${i2}/${d2}.`,
          why: `Same move again. Now the question is just one fraction times another.`,
          resultText: `${i2}/${d2}`, answer: `${i2}/${d2}`,
          pool: shuffle([...new Set([`${i2}/${d2}`, `${w2 + n2}/${d2}`, `${w2 * n2}/${d2}`, `${d2}/${i2}`])]),
          expr: `${w2} × ${d2} + ${n2}` }),
        sStep({ key: 'mul', prompt: `Multiply straight across: ${i1}/${d1} × ${i2}/${d2} = ?`,
          hint: `${i1} × ${i2} = ${num} on top, ${d1} × ${d2} = ${den} underneath.`,
          why: `To multiply fractions you multiply the tops together and the bottoms together. There is no common denominator needed — that rule belongs to adding and subtracting only.`,
          resultText: `${num}/${den}`, answer: `${num}/${den}`,
          pool: shuffle([...new Set([`${num}/${den}`, `${den}/${num}`, `${i1 * i2}/${d1 + d2}`, `${i1 + i2}/${den}`])]),
          expr: `${i1} × ${i2} over ${d1} × ${d2}` }),
        buildStep({ key: 'back', prompt: `Now write ${num}/${den} as a mixed number in its lowest terms.`,
          hint: `${m.g > 1 ? `${num}/${den} simplifies to ${m.sn}/${m.sd}, and ` : ''}${m.sn} ÷ ${m.sd} = ${m.w} remainder ${m.n}. Answer: ${mixStr(m.w, m.n, m.d)}.`,
          why: `${m.g > 1 ? `${num} and ${den} share a factor of ${m.g}, so simplify to ${m.sn}/${m.sd} first — that keeps the division easy. ` : ''}Then split off the whole ones. An improper fraction is never the finished answer at KS3.`,
          longWay: `${mixStr(w1, n1, d1)} × ${mixStr(w2, n2, d2)}\n= ${i1}/${d1} × ${i2}/${d2}\n= ${num}/${den}${m.g > 1 ? `\n= ${m.sn}/${m.sd}   (÷ ${m.g})` : ''}\n= ${mixStr(m.w, m.n, m.d)}`,
          resultText: `${mixStr(m.w, m.n, m.d)}`,
          pieces: m.n === 0 ? [String(m.w)] : [String(m.w), String(m.n), '/', String(m.d)],
          distractors: [String(num), String(den), String(m.d + 1)], isAnswer: true,
          check: (raw) => {
            const q = parseNumberList(String(raw).replace(/\//g, ' '));
            if (m.n === 0) return q.length === 1 && q[0] === m.w ? { correct: true } : { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: 0, d: 1 } };
            if (q.length < 3) return { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: m.n, d: m.d } };
            if (q[0] === m.w && q[1] === m.n && q[2] === m.d) return { correct: true };
            return { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: m.n, d: m.d } };
          } }),
      ],
    };
  }

  // ============================================================ 5.5 · reciprocals and dividing
  function divideFractions() {
    const mixed = Math.random() < 0.5;
    const d1 = pick([2, 3, 4, 5]), d2 = pick([2, 3, 4, 5, 6]);
    const w1 = mixed ? rand(1, 3) : 0;
    const n1 = mixed ? rand(1, d1 - 1) : rand(1, d1 - 1);
    const i1 = w1 * d1 + n1;
    const n2 = rand(1, d2 - 1);
    // "2/4 ÷ 1/2" reads badly in a topic about lowest terms — keep both sides tidy.
    if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) return divideFractions();
    const num = i1 * d2, den = d1 * n2;
    const m = toMixed(num, den);
    const leftStr = mixed ? mixStr(w1, n1, d1) : `${n1}/${d1}`;
    const steps = [];
    if (mixed) {
      steps.push(sStep({ key: 'i1', prompt: `Write ${leftStr} as an improper fraction.`,
        hint: `${w1} × ${d1} + ${n1} = ${i1}, so ${i1}/${d1}.`,
        why: `Dividing only works once both parts are single fractions, so deal with the mixed number first.`,
        resultText: `${i1}/${d1}`, answer: `${i1}/${d1}`,
        pool: shuffle([...new Set([`${i1}/${d1}`, `${w1 + n1}/${d1}`, `${d1}/${i1}`, `${w1 * d1}/${d1}`])]),
        expr: `${w1} × ${d1} + ${n1}` }));
    }
    steps.push(sStep({ key: 'recip', prompt: `What is the reciprocal of ${n2}/${d2}?`,
      hint: `Turn it upside down: ${d2}/${n2}.`,
      why: `The RECIPROCAL of a fraction is that fraction turned upside down — swap the numerator and the denominator. ${n2}/${d2} becomes ${d2}/${n2}. A number times its reciprocal always makes 1, and that is what makes the next step work.`,
      resultText: `the reciprocal is ${d2}/${n2}`, answer: `${d2}/${n2}`,
      pool: shuffle([...new Set([`${d2}/${n2}`, `${n2}/${d2}`, `${d2}/${d2}`, `${n2 + 1}/${d2}`])]),
      expr: `${n2}/${d2} turned upside down` }));
    steps.push(sStep({ key: 'mul', prompt: `Dividing by ${n2}/${d2} is the same as multiplying by ${d2}/${n2}. Work out ${i1}/${d1} × ${d2}/${n2}.`,
      hint: `${i1} × ${d2} = ${num} on top, ${d1} × ${n2} = ${den} underneath.`,
      why: `Dividing by a fraction is the same as multiplying by its reciprocal. Once the ÷ has become a ×, multiply straight across — tops together, bottoms together.`,
      resultText: `${num}/${den}`, answer: `${num}/${den}`,
      pool: shuffle([...new Set([`${num}/${den}`, `${den}/${num}`, `${i1 * n2}/${d1 * d2}`, `${num}/${d1 * d2}`])]),
      expr: `${i1} × ${d2} over ${d1} × ${n2}` }));
    steps.push(buildStep({ key: 'ans', prompt: `Give ${num}/${den} in its simplest form${m.w > 0 && m.n > 0 ? ' as a mixed number' : ''}.`,
      hint: `${m.g > 1 ? `Divide top and bottom by ${m.g}: ${m.sn}/${m.sd}. ` : ''}Answer: ${mixStr(m.w, m.n, m.d)}.`,
      why: `${m.g > 1 ? `${num} and ${den} share a factor of ${m.g}, so this is not in its lowest terms yet. ` : ''}${m.w > 0 ? 'It is top-heavy, so split off the whole ones to finish it as a mixed number.' : 'The numerator is smaller than the denominator, so it stays a proper fraction.'}`,
      longWay: `${leftStr} ÷ ${n2}/${d2}\n= ${i1}/${d1} × ${d2}/${n2}\n= ${num}/${den}${m.g > 1 ? `\n= ${m.sn}/${m.sd}   (÷ ${m.g})` : ''}${m.w > 0 ? `\n= ${mixStr(m.w, m.n, m.d)}` : ''}`,
      resultText: `${mixStr(m.w, m.n, m.d)}`,
      pieces: m.w === 0 ? [String(m.n), '/', String(m.d)]
        : m.n === 0 ? [String(m.w)] : [String(m.w), String(m.n), '/', String(m.d)],
      distractors: [String(num), String(den), String(m.d + 1)], isAnswer: true,
      check: (raw) => {
        const q = parseNumberList(String(raw).replace(/\//g, ' '));
        const wrong = { correct: false, id: 'mixed-form', ctx: { whole: m.w, n: m.n, d: m.d } };
        if (m.w === 0) return q.length >= 2 && q[0] === m.n && q[1] === m.d ? { correct: true } : wrong;
        if (m.n === 0) return q.length === 1 && q[0] === m.w ? { correct: true } : wrong;
        if (q.length < 3) return wrong;
        return q[0] === m.w && q[1] === m.n && q[2] === m.d ? { correct: true } : wrong;
      } }));
    return {
      subject: 'y7frac', sig: `df:${leftStr}/${n2}_${d2}`,
      given: `Work out  ${leftStr} ÷ ${n2}/${d2}   (give your answer in its simplest form)`,
      answer: mixStr(m.w, m.n, m.d), steps,
    };
  }

  // ============================================================ 5.2 · which one is the odd one out
  // "Find the number in each list that is not equivalent to the other two." Reading a
  // mixed number, an improper fraction and a scaled fraction as the same value is the
  // whole point of the topic.
  function oddOneOut() {
    const d = pick([2, 3, 4, 5, 6]), w = rand(1, 4), n = rand(1, d - 1);
    if (gcd(n, d) !== 1) return oddOneOut();
    const imp = w * d + n;
    const k = rand(2, 3);
    const same = [mixStr(w, n, d), `${imp}/${d}`, `${imp * k}/${d * k}`];
    // the odd one: same denominator, numerator one out — close enough to need checking
    const oddNum = imp + pick([-1, 1]);
    if (oddNum <= d || gcd(oddNum, d) !== 1) return oddOneOut();
    const odd = `${oddNum}/${d}`;
    if (same.includes(odd)) return oddOneOut();
    // Always keep the mixed number on show — reading it as the same value as an
    // improper fraction is the whole point of the question — plus one of the two
    // fraction forms, plus the odd one out.
    const shown = shuffle([same[0], pick([same[1], same[2]]), odd]);
    const oddM = toMixed(oddNum, d);
    return {
      subject: 'y7frac', sig: `oo:${shown.join('|')}`,
      given: `One of these is NOT equal to the other two. Which one?   ${shown.join(' ,   ')}`,
      answer: odd,
      steps: [
        sStep({ key: 'pick', prompt: `Which one is the odd one out?   ${shown.join(' ,   ')}`,
          hint: `${mixStr(w, n, d)} = ${imp}/${d} = ${imp * k}/${d * k}. The one that is not ${imp}/${d} is ${odd}.`,
          why: `Put them all in the same form and they are easy to compare. ${mixStr(w, n, d)} as an improper fraction is ${w} × ${d} + ${n} = ${imp}/${d}, and ${imp * k}/${d * k} simplifies by ${k} to ${imp}/${d} as well — so those two are equivalent fractions. ${odd} is ${mixStr(oddM.w, oddM.n, oddM.d)}, which is not the same value.`,
          longWay: `${mixStr(w, n, d)} = ${imp}/${d}\n${imp * k}/${d * k} = ${imp}/${d}   (÷ ${k})\n${odd} = ${mixStr(oddM.w, oddM.n, oddM.d)}   ← different`,
          resultText: `${odd} is the odd one out`, answer: odd, pool: shown.slice(),
          expr: `the one that is not ${imp}/${d}`, isAnswer: true }),
      ],
    };
  }

  const api = { improperLowestTerms, addSubMixed, multMixed, divideFractions, oddOneOut };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
