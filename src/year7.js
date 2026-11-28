/* year7.js — Year 7 (KS3), Fractions and Mixed Numbers.
   The first Year 7 topic. Year 6 already covers converting between mixed numbers and
   improper fractions; KS3 goes past that, and these levels are the step up, modelled on
   Section 5 of the CGP Foundation book the school issues:

     5.2  improper -> mixed IN ITS LOWEST TERMS (26/4 -> 13/2 -> 6 1/2), and whole
          numbers written as improper fractions
     5.4  adding and subtracting MIXED NUMBERS — see the block further down, which
          follows the class's own method rather than the book's improper-fraction one.
          Adding two top-heavy fractions over a shared denominator had its own level
          once; it came out because that step is already inside carrying, borrowing and
          the different-denominator questions, and did not need a section of its own.
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
      given: `Work out  ${mixStr(w1, n1, d1)} × ${mixStr(w2, n2, d2)}`, note: 'Give your answer in its simplest form.',
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
      given: `Work out  ${leftStr} ÷ ${n2}/${d2}`, note: 'Give your answer in its simplest form.',
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


  // ============================================================================
  // ADDING AND SUBTRACTING MIXED NUMBERS — the actual lesson
  //
  // Built from the homework itself: a Dr Frost sheet, "Adding and Subtracting Mixed
  // Numbers with the Same Denominator", plus the online questions that go with it.
  //
  // The mistake worth designing around is a real one he made: asked for
  //     3 2/15 + 6/5
  // he picked 4 5/15 out of a list that also contained 4 1/3. The VALUE was right and
  // the answer was still marked wrong, because every one of these questions ends
  // "give your answer as a mixed number in its simplest form". So the unsimplified
  // form is offered as a choice at the end of every level here, and choosing it gets
  // its own explanation rather than a generic "wrong".

  // is n/d already as simple as it goes?
  const SIMPLEST_NOTE = 'Give your answer as a mixed number in its simplest form.';
  const inLowest = (n, d) => gcd(n, d) === 1;
  // the finishing step, shared by every level: pick the answer IN ITS SIMPLEST FORM
  function finishStep(w, rawN, d, longWay) {
    const g = gcd(rawN, d), sn = rawN / g, sd = d / g;
    const right = mixStr(w, sn, sd);
    const pool = [right];
    if (g > 1) pool.push(mixStr(w, rawN, d));            // the trap: right value, wrong form
    pool.push(mixStr(w + 1, sn, sd));
    if (sn !== sd - sn) pool.push(mixStr(w, sd - sn, sd));
    return sStep({ key: 'simplest', prompt: `Give the answer as a mixed number in its simplest form.`,
      hint: g > 1 ? `${rawN}/${d} simplifies by ${g} to ${sn}/${sd}, so ${right}.` : `${rawN}/${d} is already as simple as it goes, so ${right}.`,
      why: g > 1
        ? `The value ${mixStr(w, rawN, d)} is right, but it is not finished. ${rawN} and ${d} both divide by ${g}, so ${rawN}/${d} = ${sn}/${sd} — the same amount written with smaller numbers. Every one of these questions asks for the SIMPLEST form, and an unsimplified answer is marked wrong even though the value is correct. Always check the last line: can the top and the bottom both be divided by something?`
        : `Check before you write it down: ${sn} and ${sd} share no common factor, so ${sn}/${sd} cannot be simplified and ${right} is the finished answer.`,
      longWay,
      resultText: right, answer: right, pool: shuffle([...new Set(pool)]),
      expr: `${mixStr(w, rawN, d)} in its simplest form`, isAnswer: true });
  }

  // ---------- top-heavy fractions over the same denominator (Dr Frost Q1) ----------
  // No tile of its own — that section came out because the step is already inside
  // carrying, borrowing and the different-denominator questions. The SKILL is still
  // tested though: these turn up as a minority of the same-denominator level, and in
  // the no-steps pool. Removing the section is not the same as dropping the skill.
  function sameDenTopHeavy() {
    const d = pick([6, 7, 8, 9, 11, 12]);
    const add = Math.random() < 0.5;
    const a = rand(d + 1, d * 5), b = add ? rand(d + 1, d * 4) : rand(2, a - d - 1);
    const tot = add ? a + b : a - b;
    if (tot <= d) return sameDenTopHeavy();
    const w = Math.floor(tot / d), rem = tot % d;
    if (rem === 0) return sameDenTopHeavy();
    const op = add ? '+' : '−';
    return {
      subject: 'y7frac', sig: `sd:${a}${op}${b}/${d}`,
      given: `Work out  ${a}/${d} ${op} ${b}/${d}`, note: SIMPLEST_NOTE,
      answer: mixStr(w, rem / gcd(rem, d), d / gcd(rem, d)),
      steps: [
        nStep({ key: 'top', prompt: `The denominators already match, so work on the numerators: ${a} ${op} ${b} = ?`,
          hint: `${a} ${op} ${b} = ${tot}.`,
          why: `Both fractions are already cut into ${d}ths, so the pieces are the same size — just ${add ? 'count them all' : 'take one lot away from the other'}. The denominator stays ${d}; it is never ${add ? 'added' : 'subtracted'}.`,
          resultText: `${tot}/${d}`, answer: tot, lo: 1, hi: tot + 15, expr: `${a} ${op} ${b}` }),
        nStep({ key: 'whole', prompt: `${tot}/${d} is top-heavy. How many whole ones are in it? ${tot} ÷ ${d} = ? (whole part only)`,
          hint: `${d} × ${w} = ${w * d}, which leaves ${rem}. So ${w} whole ones.`,
          why: `${d} pieces make one whole, so divide to see how many whole ones ${tot} pieces make. The ${rem} left over stay as the fraction part.`,
          resultText: `${w} whole ones, ${rem} left over`, answer: w, lo: 1, hi: w + 8, expr: `${tot} ÷ ${d}, whole part` }),
        nStep({ key: 'rem', prompt: `And how many ${d}ths are left over? ${tot} − ${w * d} = ?`,
          hint: `${tot} − ${w * d} = ${rem}.`,
          why: `${w} whole ones use up ${w} × ${d} = ${w * d} of the ${tot} pieces. What is left is the fraction part: ${rem}/${d}.`,
          resultText: `${rem}/${d} left over`, answer: rem, lo: 1, hi: d, expr: `${tot} − ${w * d}` }),
        finishStep(w, rem, d, `${a}/${d} ${op} ${b}/${d} = ${tot}/${d}\n${tot} ÷ ${d} = ${w} remainder ${rem}\n= ${mixStr(w, rem, d)}${gcd(rem, d) > 1 ? `\n= ${mixStr(w, rem / gcd(rem, d), d / gcd(rem, d))}` : ''}`),
      ],
    };
  }

  // ---------- mixed numbers, same denominator, nothing to carry or borrow ----------
  function sameDenMixed() {
    const d = pick([7, 9, 12, 13, 15, 20]);
    const add = Math.random() < 0.5;
    const n1 = rand(1, d - 2), n2 = add ? rand(1, d - 1 - n1) : rand(1, n1 - 1 || 1);
    if (!add && n2 >= n1) return sameDenMixed();
    if (add && n1 + n2 >= d) return sameDenMixed();
    const w1 = rand(3, 9), w2 = add ? rand(1, 4) : rand(1, w1 - 1);
    const w = add ? w1 + w2 : w1 - w2, n = add ? n1 + n2 : n1 - n2;
    if (w < 1 || n < 1) return sameDenMixed();
    const op = add ? '+' : '−';
    const g = gcd(n, d);
    return {
      subject: 'y7frac', sig: `sm:${w1}_${n1}${op}${w2}_${n2}/${d}`,
      given: `Work out  ${mixStr(w1, n1, d)} ${op} ${mixStr(w2, n2, d)}`, note: SIMPLEST_NOTE,
      answer: mixStr(w, n / g, d / g),
      steps: [
        nStep({ key: 'wholes', prompt: `Deal with the whole numbers first: ${w1} ${op} ${w2} = ?`,
          hint: `${w1} ${op} ${w2} = ${w}.`,
          why: `A mixed number is a whole plus a fraction, so you can handle the two parts separately — as long as the fraction part does not overflow, which it does not here.`,
          resultText: `${w} whole`, answer: w, lo: 0, hi: w + 10, expr: `${w1} ${op} ${w2}` }),
        nStep({ key: 'parts', prompt: `Now the fractions. The bottoms match, so: ${n1} ${op} ${n2} = ?`,
          hint: `${n1} ${op} ${n2} = ${n}, giving ${n}/${d}.`,
          why: `Both fractions are ${d}ths, so ${add ? 'add' : 'subtract'} the numerators and keep the denominator ${d}. ${add ? `${n1} + ${n2} = ${n}, which is still less than ${d}, so nothing carries over into the whole numbers.` : `${n1} is bigger than ${n2}, so there is nothing to borrow.`}`,
          resultText: `${n}/${d}`, answer: n, lo: 0, hi: d, expr: `${n1} ${op} ${n2}` }),
        finishStep(w, n, d, `${mixStr(w1, n1, d)} ${op} ${mixStr(w2, n2, d)}\n= ${w} and ${n}/${d}\n= ${mixStr(w, n / g, d / g)}`),
      ],
    };
  }

  // ---------- adding where the fractions spill over a whole ----------
  function carryMixed() {
    const d = pick([7, 9, 12, 13, 15, 20]);
    const n1 = rand(2, d - 1), n2 = rand(d - n1 + 1, d - 1);
    if (n1 + n2 <= d) return carryMixed();
    const w1 = rand(2, 9), w2 = rand(1, 5);
    const sum = n1 + n2, rem = sum - d, w = w1 + w2 + 1;
    if (rem < 1) return carryMixed();
    const g = gcd(rem, d);
    return {
      subject: 'y7frac', sig: `cy:${w1}_${n1}+${w2}_${n2}/${d}`,
      given: `Work out  ${mixStr(w1, n1, d)} + ${mixStr(w2, n2, d)}`, note: SIMPLEST_NOTE,
      answer: mixStr(w, rem / g, d / g),
      steps: [
        nStep({ key: 'wholes', prompt: `Start with the whole numbers: ${w1} + ${w2} = ?`,
          hint: `${w1} + ${w2} = ${w1 + w2}.`,
          why: `Add the wholes first, but do not write the answer down yet — the fractions are about to make another whole one, and it has to be added on here.`,
          resultText: `${w1 + w2} so far`, answer: w1 + w2, lo: 1, hi: w1 + w2 + 10, expr: `${w1} + ${w2}` }),
        nStep({ key: 'parts', prompt: `Now the fractions: ${n1} + ${n2} = ?`,
          hint: `${n1} + ${n2} = ${sum}, so ${sum}/${d}.`,
          why: `The bottoms match, so add the numerators. Look at what you get: ${sum} is bigger than ${d}, which means ${sum}/${d} is MORE than one whole. That is the bit most people miss.`,
          resultText: `${sum}/${d}`, answer: sum, lo: d, hi: sum + 10, expr: `${n1} + ${n2}` }),
        nStep({ key: 'carry', prompt: `${sum}/${d} is more than 1. Take one whole out of it: ${sum} − ${d} = ? (what is left over)`,
          hint: `${sum} − ${d} = ${rem}, so ${sum}/${d} = 1 ${rem}/${d}.`,
          why: `${d}/${d} is exactly one whole, so ${sum}/${d} = 1 + ${rem}/${d}. That extra whole one has to be CARRIED across and added to the ${w1 + w2}, giving ${w}. Leaving the answer as ${mixStr(w1 + w2, sum, d)} is wrong — the fraction part of a mixed number must always be less than 1.`,
          resultText: `1 whole and ${rem}/${d} left`, answer: rem, lo: 1, hi: d, expr: `${sum} − ${d}` }),
        finishStep(w, rem, d, `${mixStr(w1, n1, d)} + ${mixStr(w2, n2, d)}\n= ${w1 + w2} and ${sum}/${d}\n= ${w1 + w2} + 1 + ${rem}/${d}\n= ${mixStr(w, rem, d)}${g > 1 ? `\n= ${mixStr(w, rem / g, d / g)}` : ''}`),
      ],
    };
  }

  // ---------- subtracting where you have to borrow, and whole − fraction ----------
  function borrowMixed() {
    // a whole number take a fraction is the same idea stripped bare, so it lives here
    if (Math.random() < 0.3) {
      const d = pick([10, 15, 12, 9, 20]), n = rand(1, d - 1), whole = rand(1, 8);
      const w = whole - 1, rem = d - n, g = gcd(rem, d);
      if (rem < 1) return borrowMixed();
      return {
        subject: 'y7frac', sig: `wf:${whole}-${n}/${d}`,
        given: `Work out  ${whole} − ${n}/${d}`, note: w === 0 ? 'Give your answer in its simplest form.' : SIMPLEST_NOTE,
        answer: w === 0 ? `${rem / g}/${d / g}` : mixStr(w, rem / g, d / g),
        steps: [
          nStep({ key: 'split', prompt: `There is no fraction to take ${n}/${d} from yet. Split one whole off the ${whole}: how many ${d}ths is that one whole?`,
            hint: `One whole is ${d}/${d}.`,
            why: `You cannot subtract a fraction from nothing, so turn ONE of the wholes into fraction pieces. One whole cut into ${d}ths is ${d}/${d}, which leaves ${w} whole${w === 1 ? '' : 's'} beside it.`,
            resultText: `1 = ${d}/${d}, leaving ${w}`, answer: d, pool: uniqSort([d, d - 1, d + 1, n]), expr: `one whole as ${d}ths` }),
          nStep({ key: 'sub', prompt: `Now subtract: ${d} − ${n} = ?`,
            hint: `${d} − ${n} = ${rem}, so ${rem}/${d}.`,
            why: `Take the ${n} pieces from the ${d} pieces you just made. The ${w} remaining whole${w === 1 ? '' : 's'} ${w === 1 ? 'is' : 'are'} untouched.`,
            resultText: `${rem}/${d}`, answer: rem, lo: 1, hi: d, expr: `${d} − ${n}` }),
          w === 0
            ? sStep({ key: 'simplest', prompt: `Give the answer in its simplest form.`,
              hint: g > 1 ? `${rem}/${d} simplifies by ${g} to ${rem / g}/${d / g}.` : `${rem}/${d} is already in its simplest form.`,
              why: g > 1 ? `${rem} and ${d} both divide by ${g}, so ${rem}/${d} = ${rem / g}/${d / g}. The question asks for the simplest form, so the unsimplified version would be marked wrong.` : `${rem} and ${d} share no common factor, so this is already finished.`,
              longWay: `${whole} − ${n}/${d}\n= ${d}/${d} − ${n}/${d}\n= ${rem}/${d}${g > 1 ? `\n= ${rem / g}/${d / g}` : ''}`,
              resultText: `${rem / g}/${d / g}`, answer: `${rem / g}/${d / g}`,
              pool: shuffle([...new Set([`${rem / g}/${d / g}`, `${rem}/${d}`, `${d / g}/${rem / g}`, `${n}/${d}`])]),
              expr: `${rem}/${d} simplified`, isAnswer: true })
            : finishStep(w, rem, d, `${whole} − ${n}/${d}\n= ${w} + ${d}/${d} − ${n}/${d}\n= ${mixStr(w, rem, d)}${g > 1 ? `\n= ${mixStr(w, rem / g, d / g)}` : ''}`),
        ],
      };
    }
    const d = pick([7, 9, 12, 13, 27, 28]);
    const n1 = rand(1, d - 2), n2 = rand(n1 + 1, d - 1);     // n1 < n2 forces a borrow
    const w1 = rand(3, 9), w2 = rand(1, w1 - 1);
    const w = w1 - 1 - w2, rem = n1 + d - n2;
    if (w < 0 || rem < 1 || rem >= d) return borrowMixed();
    const g = gcd(rem, d);
    return {
      subject: 'y7frac', sig: `bw:${w1}_${n1}-${w2}_${n2}/${d}`,
      given: `Work out  ${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}`,
      note: w === 0 ? 'Give your answer in its simplest form.' : SIMPLEST_NOTE,
      answer: w === 0 ? `${rem / g}/${d / g}` : mixStr(w, rem / g, d / g),
      steps: [
        sStep({ key: 'spot', prompt: `Look at the fractions first: can you do ${n1}/${d} − ${n2}/${d}?`,
          hint: `No — ${n1} is smaller than ${n2}, so you have to borrow.`,
          why: `${n1}/${d} is SMALLER than ${n2}/${d}, so taking the second from the first would go below zero. When that happens you borrow one whole from the ${w1}, exactly like borrowing a ten in column subtraction.`,
          resultText: `no — we must borrow`, answer: 'No, I must borrow one whole',
          pool: shuffle(['No, I must borrow one whole', 'Yes, subtract straight away', 'Swap them round and subtract', 'Turn both upside down first']),
          expr: `whether ${n1}/${d} − ${n2}/${d} works` }),
        nStep({ key: 'borrow', prompt: `Borrow 1 from the ${w1}, making it ${w1 - 1}. Added to ${n1}/${d}, the fraction becomes ?/${d}`,
          hint: `${n1} + ${d} = ${n1 + d}, so ${mixStr(w1, n1, d)} = ${w1 - 1} ${n1 + d}/${d}.`,
          why: `The one whole you borrowed is ${d}/${d}, so add ${d} to the numerator: ${n1} + ${d} = ${n1 + d}. The number has not changed — ${mixStr(w1, n1, d)} and ${w1 - 1} ${n1 + d}/${d} are the same amount, just rearranged so the subtraction can be done.`,
          resultText: `${w1 - 1} ${n1 + d}/${d}`, answer: n1 + d, lo: d, hi: n1 + d + 8, expr: `${n1} + ${d}` }),
        nStep({ key: 'subw', prompt: `Now subtract the whole numbers. Remember the ${w1} became ${w1 - 1}: ${w1 - 1} − ${w2} = ?`,
          hint: `${w1 - 1} − ${w2} = ${w}.`,
          why: `Use ${w1 - 1}, not ${w1} — one whole was borrowed and is now sitting in the fraction. Forgetting that is the commonest slip in the whole method.`,
          resultText: `${w} whole`, answer: w, lo: 0, hi: w + 8, expr: `${w1 - 1} − ${w2}` }),
        nStep({ key: 'subf', prompt: `And now the fractions: ${n1 + d} − ${n2} = ?`,
          hint: `${n1 + d} − ${n2} = ${rem}, so ${rem}/${d}.`,
          why: `Both are ${d}ths, so subtract the numerators and keep the denominator ${d}. This works now only because of the borrow — before it, ${n1} − ${n2} would have gone below zero.`,
          resultText: `${rem}/${d}`, answer: rem, lo: 1, hi: d, expr: `${n1 + d} − ${n2}` }),
        w === 0
          ? sStep({ key: 'simplest', prompt: `Give the answer in its simplest form.`,
            hint: g > 1 ? `${rem}/${d} simplifies by ${g} to ${rem / g}/${d / g}.` : `${rem}/${d} is already in its simplest form.`,
            why: g > 1 ? `${rem} and ${d} both divide by ${g}. The question asks for the simplest form.` : `${rem} and ${d} share no common factor, so this is finished.`,
            longWay: `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}\n= ${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)}\n= ${rem}/${d}${g > 1 ? `\n= ${rem / g}/${d / g}` : ''}`,
            resultText: `${rem / g}/${d / g}`, answer: `${rem / g}/${d / g}`,
            pool: shuffle([...new Set([`${rem / g}/${d / g}`, `${rem}/${d}`, `${d / g}/${rem / g}`, `${n2}/${d}`])]),
            expr: `${rem}/${d} simplified`, isAnswer: true })
          : finishStep(w, rem, d, `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}\n= ${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)}\n= ${mixStr(w, rem, d)}${g > 1 ? `\n= ${mixStr(w, rem / g, d / g)}` : ''}`),
      ],
    };
  }

  // ---------- a mixed number and a loose fraction, different denominators ----------
  // This is the shape of the online questions: 3 2/15 + 6/5, and 3 15/22 − 5/2.
  function mixedPlusFraction() {
    const add = Math.random() < 0.5;
    const pairs = [[15, 5], [22, 2], [12, 4], [12, 6], [20, 5], [10, 2], [9, 3], [12, 3], [21, 7], [14, 7]];
    const [d, d2] = pick(pairs);
    const k = d / d2;
    const n1 = rand(1, d - 1);
    const n2 = rand(1, d2 * 3);                 // may itself be top-heavy, as 6/5 is
    if (n2 % d2 === 0) return mixedPlusFraction();   // 6/6 is just 1 dressed up
    const conv = n2 * k;
    const w1 = rand(2, 6);
    const totN = add ? n1 + conv : n1 - conv;
    // Math.floor already rounds DOWN for negatives, so it handles the borrow on its
    // own: 3 15/22 − 5/2 gives totN = −40, floor(−40/22) = −2, and 3 − 2 = 1 with
    // ((−40 mod 22) + 22) mod 22 = 4 left over — that is 1 4/22 = 1 2/11. Subtracting
    // a further 1 here (as this line first did) took it to 0 4/22 and was simply wrong.
    const w = w1 + Math.floor(totN / d);
    let rem = ((totN % d) + d) % d;
    if (rem === 0) return mixedPlusFraction();
    if (w < 1) return mixedPlusFraction();
    const g = gcd(rem, d);
    const op = add ? '+' : '−';
    const carried = w - w1;
    return {
      subject: 'y7frac', sig: `mf:${w1}_${n1}/${d}${op}${n2}/${d2}`,
      given: `Work out  ${mixStr(w1, n1, d)} ${op} ${n2}/${d2}`, note: SIMPLEST_NOTE,
      answer: mixStr(w, rem / g, d / g),
      steps: [
        nStep({ key: 'lcd', prompt: `The bottoms are different (${d} and ${d2}). What denominator will they both go into?`,
          hint: `${d2} × ${k} = ${d}, so ${d} works for both.`,
          why: `Fractions can only be added or subtracted when the pieces are the same size. ${d2} divides into ${d}, so ${d} is the common denominator — no need for anything bigger.`,
          resultText: `use ${d}ths`, answer: d, pool: uniqSort([d, d2, d * d2, d + d2]), expr: `a denominator ${d} and ${d2} both divide into` }),
        sStep({ key: 'conv', prompt: `Rewrite ${n2}/${d2} over ${d}.`,
          hint: `× top and bottom by ${k}: ${n2} × ${k} = ${conv}, so ${conv}/${d}.`,
          why: `Multiply the top AND the bottom by ${k}, so the value does not change — only the way it is written. ${n2}/${d2} and ${conv}/${d} are equivalent fractions.`,
          resultText: `${n2}/${d2} = ${conv}/${d}`, answer: `${conv}/${d}`,
          pool: shuffle([...new Set([`${conv}/${d}`, `${n2}/${d}`, `${n2 * k}/${d2}`, `${conv + k}/${d}`])]),
          expr: `${n2}/${d2} over ${d}` }),
        nStep({ key: 'parts', prompt: `Now the fraction parts: ${n1} ${op} ${conv} = ?`,
          hint: `${n1} ${op} ${conv} = ${totN}, so ${totN}/${d}.`,
          why: `Both are ${d}ths now, so ${add ? 'add' : 'subtract'} the numerators. ${totN >= d ? `Notice ${totN} is bigger than ${d} — that is more than a whole one, and it will have to carry.` : totN < 0 ? `Notice it has gone below zero — a whole one will have to be borrowed from the ${w1}.` : `It stays under ${d}, so the whole number is unchanged.`}`,
          resultText: `${totN}/${d}`, answer: totN, lo: totN - 10, hi: totN + 10, expr: `${n1} ${op} ${conv}` }),
        ...(carried === 0 ? [] : [carried > 0
          ? nStep({ key: 'adjust', prompt: `${totN}/${d} is more than one whole. Take ${carried === 1 ? 'one whole' : `${carried} wholes`} out of it: ${totN} − ${carried * d} = ?`,
            hint: `${totN} − ${carried * d} = ${rem}, so ${totN}/${d} = ${carried} ${rem}/${d}.`,
            why: `${d}/${d} is exactly one whole, so every ${d} pieces make another one. ${totN}/${d} holds ${carried} whole one${carried === 1 ? '' : 's'} with ${rem}/${d} left over. Those whole ones have to be carried across to the whole-number part — the fraction part of a finished mixed number is always less than 1.`,
            resultText: `${carried} whole and ${rem}/${d} left`, answer: rem, lo: 1, hi: d, expr: `${totN} − ${carried * d}` })
          : nStep({ key: 'adjust', prompt: `${totN} is below zero, so borrow ${-carried === 1 ? 'one whole' : `${-carried} wholes`} from the ${w1}: ${totN} + ${-carried * d} = ?`,
            hint: `${totN} + ${-carried * d} = ${rem}, so the fraction part is ${rem}/${d}.`,
            why: `You cannot leave a negative fraction part. Each whole you borrow is ${d}/${d}, so borrowing ${-carried} adds ${-carried * d} to the numerator and takes ${-carried} off the whole number. The value has not changed — it has just been rearranged so the fraction part sits between 0 and 1.`,
            resultText: `fraction part = ${rem}/${d}`, answer: rem, lo: 1, hi: d, expr: `${totN} + ${-carried * d}` })]),
        nStep({ key: 'whole', prompt: `So what is the whole-number part of the answer?`,
          hint: `${carried === 0 ? `It stays ${w1}.` : carried > 0 ? `${totN}/${d} holds ${carried} extra whole one${carried === 1 ? '' : 's'}, so ${w1} + ${carried} = ${w}.` : `One whole is borrowed, so ${w1} − 1 = ${w}.`}`,
          why: `${carried === 0 ? `${totN}/${d} is less than one whole, so the ${w1} is untouched.` : carried > 0 ? `${totN}/${d} is more than one whole: ${d}/${d} makes 1, leaving ${rem}/${d}. That whole one carries across, so ${w1} becomes ${w}.` : `The fraction part went negative, so borrow one whole from the ${w1} — it becomes ${w}, and the fraction part becomes ${rem}/${d}.`}`,
          resultText: `${w} and ${rem}/${d}`, answer: w, lo: Math.max(0, w - 5), hi: w + 5, expr: `the whole part` }),
        finishStep(w, rem, d, `${mixStr(w1, n1, d)} ${op} ${n2}/${d2}\n= ${mixStr(w1, n1, d)} ${op} ${conv}/${d}\n= ${mixStr(w, rem, d)}${g > 1 ? `\n= ${mixStr(w, rem / g, d / g)}` : ''}`),
      ],
    };
  }


  // ============================================================================
  // NO STEPS — the same questions with the scaffolding taken away.
  //
  // Every other level walks him through: find the common denominator, rewrite, add the
  // numerators, carry, simplify. That is how you LEARN the method, but it is not how he
  // is asked in class, where a question arrives on its own and the steps have to come
  // out of his own head. A child can look fluent all the way down a guided ladder and
  // still stall on a bare question, because choosing the first move was never his job.
  //
  // So this level takes a question from the lesson and asks only for the finished
  // answer. He builds it from cards rather than picking from a list, so there is
  // nothing to recognise or guess between. The full worked solution is still behind the
  // Hint and "why" buttons — help on request, not help by default.
  const UNAIDED_SOURCES = [sameDenTopHeavy, sameDenMixed, carryMixed, borrowMixed,
    mixedPlusFraction, improperLowestTerms];

  // "2 3/4" -> {w:2,n:3,d:4} · "7/12" -> {n:7,d:12} · "3" -> {w:3}
  function readAnswer(a) {
    const t = String(a).trim();
    let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return { w: +m[1], n: +m[2], d: +m[3] };
    m = t.match(/^(\d+)\/(\d+)$/);
    if (m) return { w: 0, n: +m[1], d: +m[2] };
    m = t.match(/^(\d+)$/);
    if (m) return { w: +m[1], n: 0, d: 0 };
    return null;
  }

  function unaided() {
    const src = pick(UNAIDED_SOURCES)();
    const a = readAnswer(src.answer);
    if (!a) return unaided();                       // only questions with a clean answer
    const pieces = a.n === 0 ? [String(a.w)]
      : a.w === 0 ? [String(a.n), '/', String(a.d)]
        : [String(a.w), String(a.n), '/', String(a.d)];
    // Spare cards so the number of them gives nothing away. They must not let a WRONG
    // answer be built that the check would accept — it only accepts the exact sequence,
    // so any spare is safe.
    const spare = [...new Set([String(a.w + 1), String(a.d + 1), String(a.n + 1),
      String(Math.max(1, a.n - 1)), String(a.d * 2)])].filter((x) => !pieces.includes(x)).slice(0, 4);
    // The whole method, kept for the Hint and "why" buttons only. The last step of each
    // guided level already carries a properly laid-out chain of working; use it. Strung
    // together, the per-step result lines read as disconnected fragments ("1/12",
    // "5 and 1/12") that help nobody.
    const last = src.steps[src.steps.length - 1];
    const working = last.longWay
      || src.steps.map((st) => st.resultText).filter(Boolean).join('\n');
    return {
      subject: 'y7frac', sig: `un:${src.sig}`,
      given: src.given, note: src.note,
      answer: src.answer,
      steps: [buildStep({ key: 'answer',
        prompt: `Work it out on paper, then build the answer. No steps this time — you choose what to do first.`,
        hint: `The answer is ${src.answer}. Step by step it goes:\n${working}`,
        why: `In class the question arrives on its own: nobody tells you to find a common denominator first, or that this one needs a carry. Deciding the first move IS the skill, and it is the only part a guided ladder never makes you practise.\n\nIf you are stuck, the order is always the same — make the bottoms match, deal with the whole numbers and the fractions, carry or borrow if the fraction part spills over or goes below zero, then simplify. Here that gives:\n${working}`,
        longWay: working,
        resultText: `${src.answer}`,
        pieces, distractors: spare, isAnswer: true,
        check: (raw) => {
          const q = parseNumberList(String(raw).replace(/\//g, ' '));
          const wrong = { correct: false, id: 'mixed-form', ctx: { whole: a.w, n: a.n, d: a.d } };
          if (a.n === 0) return q.length === 1 && q[0] === a.w ? { correct: true } : wrong;
          if (a.w === 0) return q.length === 2 && q[0] === a.n && q[1] === a.d ? { correct: true } : wrong;
          return q.length === 3 && q[0] === a.w && q[1] === a.n && q[2] === a.d ? { correct: true } : wrong;
        } })],
    };
  }


  // ============================================================================
  // BORROWING — its own lesson, built to the six worked examples Naima sent.
  //
  // Their shape is the thing to copy, because it is the shape she wants him reading:
  //
  //   1  write the question          9 7/13 − 3 8/13
  //   2  compare the fractions       7 < 8, so borrow one whole
  //   3  rename the first number     9 7/13 = 8 20/13     (13/13 + 7/13 = 20/13)
  //   4  subtract                    8 20/13 − 3 8/13 = 5 12/13
  //   5  simplify, only if needed    2 15/27 = 2 5/9
  //
  // Two of the six start from a whole number rather than a mixed one (1 − 7/10 and
  // 7 − 8/15), where the rename is the whole lesson: 1 = 10/10, 7 = 6 15/15. And one
  // ends below one whole, where the answer is a plain fraction — the sheet says so in
  // as many words, "do not show a mixed number because the result is less than one".
  // Both cases are levels here, not footnotes.

  // A wrong option has to be a mistake someone could actually make. "1 2/1" is not one:
  // a top-heavy fraction part is never a candidate answer, and leaving such options in
  // narrows the real choice for free.
  const plausible = (opts) => opts.filter((o) => {
    if (o == null) return false;
    const m = String(o).match(/(\d+)\/(\d+)$/);
    return !m || Number(m[1]) < Number(m[2]);
  });
  // the rename line the examples print under step 3
  const renameLine = (d, n) => `${d}/${d} + ${n}/${d} = ${n + d}/${d}`;

  // ---------- a whole number take a fraction (examples 1 and 2) ----------
  function borrowFromWhole() {
    const d = pick([7, 9, 10, 12, 15, 20]);
    const n = rand(1, d - 1);
    const whole = Math.random() < 0.35 ? 1 : rand(2, 9);
    const w = whole - 1, rem = d - n, g = gcd(rem, d);
    const sn = rem / g, sd = d / g;
    const answer = w === 0 ? `${sn}/${sd}` : mixStr(w, sn, sd);
    const steps = [
      nStep({ key: 'rename', prompt: `There is no fraction to take ${n}/${d} from yet. Rename one whole as ${d}ths: 1 = ?/${d}`,
        hint: `One whole is ${d}/${d}.`,
        why: `You cannot subtract a fraction from a whole number as it stands. Turn ONE of the wholes into ${d}ths — one whole cut into ${d} pieces is ${d}/${d}${w ? `, which leaves ${w} whole${w === 1 ? '' : 's'} beside it, so ${whole} = ${mixStr(w, d, d)}` : ''}.`,
        resultText: w === 0 ? `1 = ${d}/${d}` : `${whole} = ${mixStr(w, d, d)}`,
        answer: d, pool: uniqSort([d, d - 1, d + 1, n, n + d]), expr: `one whole as ${d}ths` }),
      nStep({ key: 'sub', prompt: `Now subtract the fractions: ${d} − ${n} = ?`,
        hint: `${d} − ${n} = ${rem}, so ${rem}/${d}.`,
        why: `Take the ${n} pieces from the ${d} you just made.${w ? ` The other ${w} whole${w === 1 ? ' is' : 's are'} untouched.` : ''}`,
        resultText: w === 0 ? `${rem}/${d}` : `${mixStr(w, rem, d)}`,
        answer: rem, lo: 1, hi: d, expr: `${d} − ${n}` }),
      sStep({ key: 'final', prompt: w === 0 ? `Give the answer in its simplest form.` : `Give the answer as a mixed number in its simplest form.`,
        hint: g > 1 ? `${rem}/${d} simplifies by ${g}, giving ${answer}.` : `${answer}.`,
        why: (w === 0
          ? `The result is LESS THAN ONE, so it stays a plain fraction — there is no whole number to write in front of it. `
          : `${whole} became ${mixStr(w, d, d)}, and ${d}/${d} − ${n}/${d} = ${rem}/${d}, so the answer is ${mixStr(w, rem, d)}. `)
          + (g > 1 ? `${rem} and ${d} both divide by ${g}, so it simplifies to ${answer}.` : `${sn} and ${sd} share no factor, so this is already simplest.`),
        longWay: `${whole} − ${n}/${d}\n= ${w === 0 ? `${d}/${d}` : mixStr(w, d, d)} − ${n}/${d}\n= ${w === 0 ? `${rem}/${d}` : mixStr(w, rem, d)}${g > 1 ? `\n= ${answer}` : ''}`,
        resultText: answer, answer,
        pool: shuffle([...new Set(plausible([answer, w === 0 ? `${rem}/${d}` : mixStr(w, rem, d),
          mixStr(whole, sn, sd), mixStr(w, sn, sd + 1)]))]),
        expr: `${whole} − ${n}/${d}`, isAnswer: true }),
    ];
    return { subject: 'y7frac', sig: `bw:${whole}-${n}/${d}`,
      given: `Work out  ${whole} − ${n}/${d}`,
      note: w === 0 ? 'Give your answer in its simplest form.' : SIMPLEST_NOTE,
      answer, steps };
  }

  // ---------- mixed take mixed, borrowing (examples 3 to 6) ----------
  // needSimplify picks whether the answer has to be simplified at the end, so the two
  // can be separate levels the way the examples separate them.
  function borrowMixedPair(needSimplify) {
    const d = needSimplify ? pick([12, 27, 15, 20, 18]) : pick([7, 13, 11, 9, 8]);
    const n2 = rand(2, d - 1), n1 = rand(1, n2 - 1);
    const w2 = rand(2, 4), w1 = rand(w2 + 1, w2 + 5);
    const rem = n1 + d - n2, w = w1 - 1 - w2;
    if (rem < 1 || rem >= d || w < 0) return borrowMixedPair(needSimplify);
    const g = gcd(rem, d);
    if (needSimplify ? g === 1 : g !== 1) return borrowMixedPair(needSimplify);
    const sn = rem / g, sd = d / g;
    const answer = w === 0 ? `${sn}/${sd}` : mixStr(w, sn, sd);
    const steps = [
      sStep({ key: 'compare', prompt: `Compare the fractions: ${n1}/${d} and ${n2}/${d}. Which is true?`,
        hint: `${n1} < ${n2}, so you have to borrow one whole.`,
        why: `Always look at the fractions before you touch the whole numbers. ${n1}/${d} is SMALLER than ${n2}/${d}, so ${n1}/${d} − ${n2}/${d} would drop below zero. That is the signal to borrow one whole from the ${w1}.`,
        resultText: `${n1} < ${n2}, so borrow one whole`, answer: `${n1} < ${n2}, so borrow one whole`,
        pool: shuffle([`${n1} < ${n2}, so borrow one whole`, `${n1} > ${n2}, so subtract straight away`,
          `They are equal, so the fraction part is 0`, `Swap them round and subtract`]),
        expr: `whether ${n1}/${d} − ${n2}/${d} works as it stands` }),
      nStep({ key: 'rename', prompt: `Rename ${mixStr(w1, n1, d)}. Borrow one whole, so the ${w1} becomes ${w1 - 1} and the fraction becomes ?/${d}`,
        hint: `${renameLine(d, n1)} — so ${mixStr(w1, n1, d)} = ${w1 - 1} ${n1 + d}/${d}.`,
        why: `The whole you borrowed is ${d}/${d}. Add it to the fraction you already had: ${renameLine(d, n1)}. Nothing has changed in value — ${mixStr(w1, n1, d)} and ${w1 - 1} ${n1 + d}/${d} are the same amount, written so the subtraction is now possible.`,
        resultText: `${mixStr(w1, n1, d)} = ${w1 - 1} ${n1 + d}/${d}`,
        answer: n1 + d, lo: d, hi: n1 + d + 6, expr: `${d} + ${n1}` }),
      sStep({ key: 'sub', prompt: `Now subtract: ${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)} = ?`,
        hint: `Wholes: ${w1 - 1} − ${w2} = ${w}. Fractions: ${n1 + d} − ${n2} = ${rem}. So ${w === 0 ? `${rem}/${d}` : mixStr(w, rem, d)}.`,
        why: `With the borrow done, both parts subtract normally: the whole numbers ${w1 - 1} − ${w2} = ${w}, and the fractions ${n1 + d} − ${n2} = ${rem} over the same denominator ${d}. Use ${w1 - 1}, not ${w1} — forgetting the borrow is the commonest slip in the whole method.`,
        resultText: w === 0 ? `${rem}/${d}` : mixStr(w, rem, d),
        answer: w === 0 ? `${rem}/${d}` : mixStr(w, rem, d),
        pool: shuffle([...new Set(plausible([w === 0 ? `${rem}/${d}` : mixStr(w, rem, d),
          mixStr(w + 1, rem, d), mixStr(w, Math.abs(n2 - n1), d), mixStr(w, rem, d + 1)]))]),
        expr: `${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)}` }),
    ];
    if (needSimplify) {
      steps.push(sStep({ key: 'simplify', prompt: `Simplify. ${rem} and ${d} both divide by ${g} — what does ${w === 0 ? `${rem}/${d}` : mixStr(w, rem, d)} become?`,
        hint: `${rem} ÷ ${g} = ${sn} and ${d} ÷ ${g} = ${sd}, so ${answer}.`,
        why: `The subtraction is done, but the answer is not finished: ${rem}/${d} is not in its lowest terms. Divide top and bottom by ${g}. The whole number ${w === 0 ? 'part' : `${w}`} does not change — only the fraction is simplified.`,
        longWay: `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}\n= ${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)}\n= ${w === 0 ? `${rem}/${d}` : mixStr(w, rem, d)}\n= ${answer}`,
        resultText: answer, answer,
        pool: shuffle([...new Set(plausible([answer, w === 0 ? `${rem}/${d}` : mixStr(w, rem, d),
          mixStr(w, sn, sd + 1), mixStr(w, sn + 1, sd)]))]),
        expr: `${rem}/${d} in its lowest terms`, isAnswer: true }));
    } else {
      steps.push(sStep({ key: 'final', prompt: `Final answer — is ${w === 0 ? `${rem}/${d}` : mixStr(w, rem, d)} already in its simplest form?`,
        hint: `Yes. ${rem} and ${d} share no common factor, so the answer is ${answer}.`,
        why: `Check before writing it down: ${rem} and ${d} have no common factor, so ${rem}/${d} cannot be simplified and ${answer} is finished. Checking is the habit — most of these DO simplify, and an unsimplified answer is marked wrong even when the value is right.`,
        longWay: `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}\n= ${w1 - 1} ${n1 + d}/${d} − ${mixStr(w2, n2, d)}\n= ${answer}`,
        resultText: answer, answer,
        pool: shuffle([...new Set(plausible([answer, mixStr(w + 1, rem, d), mixStr(w, rem, d + 1), `${rem}/${d}`]))]),
        expr: `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}`, isAnswer: true }));
    }
    return { subject: 'y7frac', sig: `bm:${w1}_${n1}-${w2}_${n2}/${d}:${needSimplify ? 's' : 'p'}`,
      given: `Work out  ${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}`,
      // Below one whole the answer is a plain fraction, so do not ask for a mixed
      // number — the worked examples say this in as many words.
      note: w === 0 ? 'Give your answer in its simplest form.' : SIMPLEST_NOTE,
      answer, steps };
  }

  // ---------- does it even need a borrow? (the decision, on its own) ----------
  function borrowOrNot() {
    if (Math.random() < 0.5) return borrowMixedPair(Math.random() < 0.5);
    // the same shape, but no borrow needed — he has to notice
    const d = pick([7, 9, 12, 13, 15, 20]);
    const n1 = rand(2, d - 1), n2 = rand(1, n1 - 1);
    const w2 = rand(1, 3), w1 = rand(w2 + 1, w2 + 5);
    const rem = n1 - n2, w = w1 - w2, g = gcd(rem, d);
    if (rem < 1) return borrowOrNot();
    const answer = mixStr(w, rem / g, d / g);
    return { subject: 'y7frac', sig: `nb:${w1}_${n1}-${w2}_${n2}/${d}`,
      given: `Work out  ${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}`,
      note: SIMPLEST_NOTE, answer,
      steps: [
        sStep({ key: 'compare', prompt: `Compare the fractions: ${n1}/${d} and ${n2}/${d}. Which is true?`,
          hint: `${n1} > ${n2}, so you can subtract straight away — no borrowing.`,
          why: `Check the fractions FIRST, every time. Here ${n1}/${d} is bigger than ${n2}/${d}, so the subtraction works as it stands and there is nothing to borrow. Borrowing when you do not need to is just as wrong as forgetting to.`,
          resultText: `${n1} > ${n2}, so no borrowing needed`, answer: `${n1} > ${n2}, so subtract straight away`,
          pool: shuffle([`${n1} > ${n2}, so subtract straight away`, `${n1} < ${n2}, so borrow one whole`,
            `Borrow one whole to be safe`, `Turn both into improper fractions first`]),
          expr: `whether ${n1}/${d} − ${n2}/${d} works as it stands` }),
        sStep({ key: 'sub', prompt: `Subtract: wholes ${w1} − ${w2}, fractions ${n1} − ${n2}. What do you get?`,
          hint: `${w1} − ${w2} = ${w} and ${n1} − ${n2} = ${rem}, so ${mixStr(w, rem, d)}.`,
          why: `Both parts subtract straight across, keeping the denominator ${d}.`,
          resultText: mixStr(w, rem, d), answer: mixStr(w, rem, d),
          pool: shuffle([...new Set(plausible([mixStr(w, rem, d), mixStr(w - 1, rem, d), mixStr(w, n1 + n2, d), mixStr(w, rem, d + 1)]))]),
          expr: `${w1} − ${w2} and ${n1} − ${n2}` }),
        sStep({ key: 'final', prompt: `Give the answer as a mixed number in its simplest form.`,
          hint: g > 1 ? `${rem}/${d} simplifies by ${g}, giving ${answer}.` : `${answer} — already simplest.`,
          why: g > 1 ? `${rem} and ${d} both divide by ${g}, so ${mixStr(w, rem, d)} becomes ${answer}.`
            : `${rem} and ${d} share no common factor, so ${answer} is finished.`,
          longWay: `${mixStr(w1, n1, d)} − ${mixStr(w2, n2, d)}\n= ${mixStr(w, rem, d)}${g > 1 ? `\n= ${answer}` : ''}`,
          resultText: answer, answer,
          pool: shuffle([...new Set(plausible([answer, mixStr(w, rem, d), mixStr(w + 1, rem / g, d / g), mixStr(w, rem / g, d / g + 1)]))]),
          expr: `${mixStr(w, rem, d)} in its simplest form`, isAnswer: true }),
      ] };
  }


  // ================================================================== CGP Section 5, checked
  // These six follow sections of the CGP Foundation book (Section 5, Fractions) that the
  // levels above did not reach: 5.1 equivalent fractions and lowest terms, 5.3 ordering,
  // 5.4 "the rest" problems, 5.5 multiplying, 5.6 fractions and decimals. One move per step.
  const say = (msg) => ({ correct: false, id: 'g7-say', ctx: { msg } });
  const uniq = (a) => [...new Set(a.map(String))];
  const primeFactors = (n) => { const out = []; for (let p = 2; n > 1; p++) while (n % p === 0) { out.push(p); n /= p; } return out; };

  // ---- 5.1 the missing number in a pair of equivalent fractions
  function equivMissing() {
    const d = pick([2, 3, 4, 5, 6, 7, 8]), n = rand(1, d - 1), k = rand(2, 6);
    if (gcd(n, d) !== 1) return equivMissing();
    const up = Math.random() < 0.6;
    if (up) {
      const D = d * k, N = n * k;
      return { subject: 'y7frac', sig: `eq:${n}/${d}=${D}`, given: `Fill in the missing number:  ${n}/${d} = ?/${D}`, answer: String(N),
        steps: [
          nStep({ key: 'k', prompt: `The bottoms: what do you multiply ${d} by to get ${D}?`, answer: k, lo: 1, hi: k + 6, hint: `${d} × ${k} = ${D}.`, why: 'Equivalent fractions have the same value. Whatever you do to the bottom, you must do to the top.', resultText: `× ${k}`, expr: `${D} ÷ ${d}` }),
          nStep({ key: 'n', prompt: `Do the same to the top: ${n} × ${k} = ?`, answer: N, lo: Math.max(1, N - 8), hi: N + 8, hint: `${n} × ${k} = ${N}.`, why: `${n}/${d} and ${N}/${D} are the same amount, cut into ${k} times as many pieces.`, longWay: `${d} × ${k} = ${D}\n${n} × ${k} = ${N}\nso ${n}/${d} = ${N}/${D}`, resultText: `${n}/${d} = ${N}/${D}`, expr: `${n} × ${k}`, isAnswer: true }),
        ] };
    }
    const N = n * k, D = d * k;
    return { subject: 'y7frac', sig: `eqd:${N}/${D}=${n}`, given: `Find b:  ${N}/${D} = ${n}/b`, answer: String(d),
      steps: [
        nStep({ key: 'k', prompt: `The tops: what do you divide ${N} by to get ${n}?`, answer: k, lo: 1, hi: k + 6, hint: `${N} ÷ ${k} = ${n}.`, why: 'Whatever you do to the top, do to the bottom.', resultText: `÷ ${k}`, expr: `${N} ÷ ${n}` }),
        nStep({ key: 'b', prompt: `Do the same to the bottom: ${D} ÷ ${k} = ?`, answer: d, lo: 1, hi: d + 8, hint: `${D} ÷ ${k} = ${d}.`, why: 'Dividing top and bottom by the same number keeps the value the same.', longWay: `${N} ÷ ${k} = ${n}\n${D} ÷ ${k} = ${d}\nso b = ${d}`, resultText: `b = ${d}`, expr: `${D} ÷ ${k}`, isAnswer: true }),
      ] };
  }

  // ---- 5.1 cancel down one common factor at a time (and "A as a fraction of B")
  function cancelDown() {
    const q = pick([3, 4, 5, 7, 8, 9]), p = rand(1, q - 1);
    const g = pick([4, 6, 8, 9, 10, 12]);
    if (gcd(p, q) !== 1) return cancelDown();
    const A = p * g, B = q * g;
    const asFrac = Math.random() < 0.4;
    const steps = [];
    if (asFrac) steps.push(sStep({ key: 'write', prompt: `Express ${A} as a fraction of ${B}. First, write it as a fraction:`, answer: `${A}/${B}`, pool: shuffle(uniq([`${A}/${B}`, `${B}/${A}`, `${A}/${A + B}`, `${B - A}/${B}`])),
      diagnose: (v) => say(`The first number goes on top, the second underneath: ${A}/${B}.`), hint: `“${A} as a fraction of ${B}” is ${A}/${B}.`, why: 'Write the first number over the second, then simplify.', resultText: `${A}/${B}` }));
    let a = A, b = B;
    primeFactors(g).forEach((f, i) => {
      const notF = [2, 3, 5, 7, 11].filter((x) => x !== f && !(a % x === 0 && b % x === 0)).slice(0, 3);
      steps.push(nStep({ key: 'f' + i, prompt: `${a}/${b}: which of these is a common factor of ${a} and ${b}?`, answer: f, pool: shuffle([f, ...notF]), hint: `${f} goes into both ${a} and ${b}.`, why: 'A common factor divides both the numerator and the denominator exactly.', resultText: `${f} is a common factor`, expr: `a number that divides ${a} and ${b}` }));
      const na = a / f, nb = b / f;
      steps.push(sStep({ key: 'd' + i, prompt: `Divide top and bottom by ${f}:`, answer: `${na}/${nb}`, pool: shuffle(uniq([`${na}/${nb}`, `${na}/${b}`, `${a}/${nb}`, `${a - f}/${b - f}`])),
        diagnose: () => say(`Divide BOTH: ${a} ÷ ${f} = ${na} and ${b} ÷ ${f} = ${nb}.`), hint: `${a} ÷ ${f} = ${na}, ${b} ÷ ${f} = ${nb}.`, why: 'Cancelling down: divide top and bottom by the same number.', resultText: `${na}/${nb}` }));
      a = na; b = nb;
    });
    steps.push(sStep({ key: 'done', prompt: `${p}/${q}: is there any common factor left (apart from 1)? So the lowest terms are…`, answer: `${p}/${q}`, pool: shuffle(uniq([`${p}/${q}`, `${p * 2}/${q * 2}`, `${q}/${p}`, `${p}/${q + 1}`])), isAnswer: true,
      diagnose: () => say(`${p} and ${q} share no factor except 1, so ${p}/${q} is in its lowest terms.`), hint: `${p} and ${q} have no common factor: ${p}/${q}.`, why: 'Keep cancelling until top and bottom have no common factor. Then it is in its lowest terms.', longWay: `${A}/${B}` + primeFactors(g).map((f) => ` → ÷${f}`).join('') + ` → ${p}/${q}`, resultText: `${A}/${B} = ${p}/${q}` }));
    return { subject: 'y7frac', sig: `cd:${A}/${B}:${asFrac}`, given: asFrac ? `Express ${A} as a fraction of ${B}, in its lowest terms.` : `Write ${A}/${B} in its lowest terms.`, answer: `${p}/${q}`, steps };
  }

  // ---- 5.3 put three fractions in order
  function y7OrderFractions() {
    const sets = [[2, 4, 8], [3, 4, 6], [2, 3, 6], [4, 5, 10], [2, 5, 10], [3, 4, 12], [2, 3, 4], [5, 6, 10]];
    const ds = shuffle(pick(sets));
    const fr = ds.map((d) => { let n; do { n = rand(1, d - 1); } while (gcd(n, d) !== 1); return [n, d]; });
    const L = ds.reduce((a, b) => lcm(a, b), 1);
    const scaled = fr.map(([n, d]) => n * (L / d));
    if (new Set(scaled).size < 3) return y7OrderFractions();
    const str = (f) => `${f[0]}/${f[1]}`;
    const sorted = fr.map((f, i) => [f, scaled[i]]).sort((a, b) => a[1] - b[1]);
    const ans = sorted.map((x) => str(x[0])).join(', ');
    const wrongOrders = uniq([fr.map(str).join(', '), sorted.slice().reverse().map((x) => str(x[0])).join(', '), fr.slice().sort((a, b) => a[1] - b[1]).map(str).join(', '), fr.slice().sort((a, b) => a[0] - b[0]).map(str).join(', ')]).filter((o) => o !== ans).slice(0, 3);
    const steps = [
      nStep({ key: 'L', prompt: `Find a common denominator: the smallest number that ${ds.join(', ')} all go into.`, answer: L, pool: uniq([L, ds[0] * ds[1] * ds[2], Math.max(...ds), L * 2]).map(Number).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4), hint: `${L} is in the ${ds.join(', ')} times tables.`, why: 'You can only compare fractions fairly when they are cut into the same size pieces: a common denominator.', resultText: `common denominator ${L}`, expr: `the LCM of ${ds.join(', ')}` }),
    ];
    fr.forEach(([n, d], i) => steps.push(nStep({ key: 'r' + i, prompt: `${n}/${d} = ?/${L}`, answer: scaled[i], lo: 1, hi: L, hint: `× ${L / d}: ${n} × ${L / d} = ${scaled[i]}.`, why: 'Multiply top and bottom by the same number.', resultText: `${n}/${d} = ${scaled[i]}/${L}`, expr: `${n} × ${L / d}` })));
    steps.push(sStep({ key: 'order', prompt: `Now compare the numerators (${scaled.join(', ')}). Smallest to largest, in their ORIGINAL form:`, answer: ans, pool: shuffle([ans, ...wrongOrders]), isAnswer: true,
      diagnose: () => say(`Over ${L}ths they are ${sorted.map((x) => x[1] + '/' + L).join(', ')}. In original form: ${ans}.`), hint: `${sorted.map((x) => x[1]).join(' < ')}.`, why: 'Same denominator: the bigger numerator is the bigger fraction. Then write them back the way they started.', longWay: fr.map((f, i) => `${str(f)} = ${scaled[i]}/${L}`).join('\n') + `\norder: ${ans}`, resultText: ans }));
    return { subject: 'y7frac', sig: `or:${fr.map(str).join(',')}`, given: `Put in order, smallest first:  ${fr.map(str).join(',  ')}`, answer: ans, steps };
  }

  // ---- 5.4 what fraction is left? ("the rest are…")
  const REST = [
    ['A maths exam has some questions.', 'are on number', 'are on algebra', 'the rest are on geometry', 'What fraction are on geometry?'],
    ['In a school survey,', 'of the pupils walk to school', 'catch the bus', 'the rest come by car', 'What fraction come by car?'],
    ['A bag of sweets:', 'are chocolates', 'are toffees', 'the rest are mints', 'What fraction are mints?'],
    ['In a garden,', 'of the flowers are roses', 'are tulips', 'the rest are daisies', 'What fraction are daisies?'],
  ];
  function restFraction() {
    const [d1, d2] = pick([[2, 3], [2, 5], [3, 4], [4, 5], [2, 7], [3, 5], [4, 6], [5, 6]]);
    let n1, n2;
    do { n1 = rand(1, d1 - 1); n2 = rand(1, d2 - 1); } while (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || n1 / d1 + n2 / d2 >= 1);
    const L = lcm(d1, d2), a = n1 * L / d1, b = n2 * L / d2, r = L - a - b, g = gcd(r, L);
    const ctx = pick(REST);
    const fin = `${r / g}/${L / g}`;
    return { subject: 'y7frac', sig: `rest:${n1}/${d1}+${n2}/${d2}`, given: `${ctx[0]} ${n1}/${d1} ${ctx[1]}, ${n2}/${d2} ${ctx[2]} and ${ctx[3]}. ${ctx[4]}`, answer: fin,
      steps: [
        nStep({ key: 'whole', prompt: 'All the parts together make the whole. As a number, the whole is…', answer: 1, pool: [1, 100, 2, 10], hint: 'Everything = 1 whole.', why: 'The fractions of every group must add up to 1.', resultText: 'everything = 1', expr: 'the whole thing' }),
        nStep({ key: 'L', prompt: `Common denominator for ${d1} and ${d2}?`, answer: L, pool: uniq([L, d1 * d2 === L ? L * 2 : d1 * d2, d1 + d2, Math.max(d1, d2)]).map(Number), hint: `${L} is in both times tables.`, why: 'To take fractions away, they need the same denominator.', resultText: `${L}ths`, expr: `the LCM of ${d1} and ${d2}` }),
        nStep({ key: 'a', prompt: `${n1}/${d1} = ?/${L}`, answer: a, lo: 1, hi: L, hint: `${n1} × ${L / d1} = ${a}.`, why: 'Multiply top and bottom by the same number.', resultText: `${a}/${L}`, expr: `${n1} × ${L / d1}` }),
        nStep({ key: 'b', prompt: `${n2}/${d2} = ?/${L}`, answer: b, lo: 1, hi: L, hint: `${n2} × ${L / d2} = ${b}.`, why: 'Multiply top and bottom by the same number.', resultText: `${b}/${L}`, expr: `${n2} × ${L / d2}` }),
        sStep({ key: 'rest', prompt: `1 = ${L}/${L}. So the rest = ${L}/${L} − ${a}/${L} − ${b}/${L} = ? (simplest form)`, answer: fin, pool: shuffle(uniq([fin, `${r}/${L}` === fin ? `${r + 1}/${L}` : `${r}/${L}`, `${a + b}/${L}`, `${r}/${d1 + d2}`])), isAnswer: true,
          diagnose: (v) => say(v === `${r}/${L}` ? 'The value is right, but it is not finished: simplify it.' : v === `${a + b}/${L}` ? 'That is the two groups you know. The rest is what is LEFT of 1.' : `${L} − ${a} − ${b} = ${r}, so ${r}/${L}${g > 1 ? ` = ${fin}` : ''}.`),
          hint: `${L} − ${a} − ${b} = ${r}: ${r}/${L}${g > 1 ? ` = ${fin}` : ''}.`, why: 'Take the known fractions away from 1 whole.', longWay: `1 − ${n1}/${d1} − ${n2}/${d2}\n= ${L}/${L} − ${a}/${L} − ${b}/${L}\n= ${r}/${L}${g > 1 ? ` = ${fin}` : ''}`, resultText: `the rest = ${fin}` }),
      ] };
  }

  // ---- 5.5 multiplying: by a unit fraction, whole × fraction, fraction "of", fraction × fraction
  function timesFraction() {
    const kind = pick(['unit', 'whole', 'of', 'two']);
    if (kind === 'unit') {
      const d = rand(2, 9), q = rand(2, 12), W = d * q;
      return { subject: 'y7frac', sig: `tu:${W}x1/${d}`, given: `Work out  ${W} × 1/${d}`, answer: String(q),
        steps: [
          sStep({ key: 'rule', prompt: `Multiplying by 1/${d} is the same as…`, answer: `dividing by ${d}`, pool: shuffle([`dividing by ${d}`, `multiplying by ${d}`, `adding ${d}`, `taking away ${d}`]), diagnose: () => say(`× 1/${d} means one ${d === 2 ? 'half' : `${d}th`} of it: that is ÷ ${d}.`), hint: `× 1/${d} = ÷ ${d}.`, why: 'Multiplying by a unit fraction (1 on top) is the same as dividing by the bottom number.', resultText: `÷ ${d}` }),
          nStep({ key: 'q', prompt: `${W} ÷ ${d} = ?`, answer: q, lo: 1, hi: q + 10, hint: `${W} ÷ ${d} = ${q}.`, why: `${W} × 1/${d} = ${W} ÷ ${d}.`, longWay: `${W} × 1/${d} = ${W} ÷ ${d} = ${q}`, resultText: `${q}`, expr: `${W} ÷ ${d}`, isAnswer: true }),
        ] };
    }
    if (kind === 'whole' || kind === 'of') {
      const d = rand(3, 9), n = rand(2, d - 1), q = rand(2, 9), W = d * q;
      if (gcd(n, d) !== 1) return timesFraction();
      const steps = [];
      if (kind === 'of') steps.push(sStep({ key: 'of', prompt: `${n}/${d} of ${W}: what does “of” mean here?`, answer: '×', pool: ['×', '+', '−', '÷'], diagnose: () => say('In maths, “of” means multiply: 3/5 of 20 = 3/5 × 20.'), hint: '“of” = ×.', why: 'You can replace “of” with a multiplication sign.', resultText: `${n}/${d} × ${W}` }));
      steps.push(nStep({ key: 'div', prompt: `Divide by the bottom: ${W} ÷ ${d} = ?`, answer: q, lo: 1, hi: q + 10, hint: `${W} ÷ ${d} = ${q}.`, why: 'Multiplying by a fraction: divide by the denominator and multiply by the numerator (either order).', resultText: `${W} ÷ ${d} = ${q}`, expr: `${W} ÷ ${d}` }));
      steps.push(nStep({ key: 'mul', prompt: `Multiply by the top: ${q} × ${n} = ?`, answer: q * n, lo: Math.max(1, q * n - 10), hi: q * n + 10, hint: `${q} × ${n} = ${q * n}.`, why: `${W} ÷ ${d} is one ${d}th; ${n} of them is ${q * n}.`, longWay: `${W} ÷ ${d} = ${q}\n${q} × ${n} = ${q * n}`, resultText: `${q * n}`, expr: `${q} × ${n}`, isAnswer: true }));
      return { subject: 'y7frac', sig: `tw:${kind}:${n}/${d}x${W}`, given: kind === 'of' ? `Find ${n}/${d} of ${W}` : `Work out  ${W} × ${n}/${d}`, answer: String(q * n), steps };
    }
    const b = rand(2, 7), d = rand(2, 9), a = rand(1, b - 1), c = rand(1, d - 1);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1) return timesFraction();
    const N = a * c, D = b * d, g = gcd(N, D), fin = `${N / g}/${D / g}`;
    return { subject: 'y7frac', sig: `tt:${a}/${b}x${c}/${d}`, given: `Work out  ${a}/${b} × ${c}/${d}  (simplest form)`, answer: fin,
      steps: [
        nStep({ key: 'top', prompt: `Multiply the tops: ${a} × ${c} = ?`, answer: N, lo: 1, hi: N + 10, hint: `${a} × ${c} = ${N}.`, why: 'To multiply fractions, multiply the numerators and the denominators separately.', resultText: `top ${N}`, expr: `${a} × ${c}` }),
        nStep({ key: 'bot', prompt: `Multiply the bottoms: ${b} × ${d} = ?`, answer: D, lo: Math.max(2, D - 10), hi: D + 10, hint: `${b} × ${d} = ${D}.`, why: 'No common denominator needed when you multiply.', resultText: `bottom ${D}`, expr: `${b} × ${d}` }),
        sStep({ key: 'simp', prompt: `${N}/${D} in its simplest form:`, answer: fin, pool: shuffle(uniq([fin, g > 1 ? `${N}/${D}` : `${N}/${D + 1}`, `${a + c}/${b + d}`, `${N}/${b + d}`])), isAnswer: true,
          diagnose: (v) => say(v === `${N}/${D}` ? 'Right value, but not finished: simplify it.' : v === `${a + c}/${b + d}` ? 'Don’t add: multiply top × top and bottom × bottom.' : `${N}/${D}${g > 1 ? ` ÷ ${g} = ${fin}` : ' is already as simple as it gets'}.`),
          hint: g > 1 ? `Divide top and bottom by ${g}: ${fin}.` : `${fin} can’t be simplified.`, why: 'Always give fractions in their simplest form.', longWay: `${a}/${b} × ${c}/${d} = ${N}/${D}${g > 1 ? ` = ${fin}` : ''}`, resultText: fin }),
      ] };
  }

  // ---- 5.6 fractions and decimals, without a calculator
  function fracDecimal() {
    const kind = pick(['to', 'to', 'recur', 'back']);
    if (kind === 'to') {
      const opts = [[1, 2], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [7, 20], [9, 20], [3, 25], [11, 25], [7, 50], [17, 50], [3, 8], [5, 8]];
      const [n, d] = pick(opts);
      const T = [10, 100, 1000].find((t) => t % d === 0), k = T / d, N = n * k;
      const dec = (n / d).toString();
      return { subject: 'y7frac', sig: `fd:${n}/${d}`, given: `Write ${n}/${d} as a decimal (no calculator).`, answer: dec,
        steps: [
          nStep({ key: 'T', prompt: `Which of 10, 100, 1000 can ${d} be turned into by multiplying?`, answer: T, pool: [10, 100, 1000], hint: `${d} × ${k} = ${T}.`, why: 'Fractions over 10, 100 or 1000 turn straight into decimals: tenths, hundredths, thousandths.', resultText: `over ${T}`, expr: `${d} × ${k}` }),
          nStep({ key: 'N', prompt: `${n}/${d} = ?/${T}  (multiply the top by ${k} too)`, answer: N, lo: 1, hi: N + 20, hint: `${n} × ${k} = ${N}.`, why: 'Do the same to the top as the bottom.', resultText: `${N}/${T}`, expr: `${n} × ${k}` }),
          sStep({ key: 'dec', prompt: `${N}/${T} as a decimal:`, answer: dec, pool: shuffle(uniq([dec, (N / (T * 10)).toString(), (N / (T / 10)).toString(), `0.${n}${d}`])), isAnswer: true,
            diagnose: () => say(`${N}/${T} is ${N} ${T === 10 ? 'tenths' : T === 100 ? 'hundredths' : 'thousandths'}: ${dec}.`), hint: `${N} ÷ ${T} = ${dec}.`, why: `Over ${T}: the last digit sits in the ${T === 10 ? 'tenths' : T === 100 ? 'hundredths' : 'thousandths'} column.`, longWay: `${n}/${d} = ${N}/${T} = ${dec}`, resultText: `${n}/${d} = ${dec}` }),
        ] };
    }
    if (kind === 'recur') {
      const R = pick([[1, 3, '0.333…'], [2, 3, '0.666…'], [1, 9, '0.111…'], [4, 9, '0.444…'], [1, 6, '0.1666…'], [5, 6, '0.8333…']]);
      const [n, d, dec] = R;
      return { subject: 'y7frac', sig: `fr:${n}/${d}`, given: `Write ${n}/${d} as a decimal.`, answer: dec,
        steps: [
          sStep({ key: 'kind', prompt: `Can ${d} be turned into 10, 100 or 1000 by multiplying?`, answer: 'No, so the decimal goes on for ever (recurring)', pool: ['No, so the decimal goes on for ever (recurring)', 'Yes, so it stops (terminating)'], diagnose: () => say(`${d} has a factor of 3, and 10, 100, 1000 are only made of 2s and 5s. So it can't: the decimal recurs.`), hint: `${d} is not a factor of 10, 100 or 1000.`, why: 'If the denominator (in lowest terms) has only 2s and 5s as prime factors, the decimal stops. Otherwise it recurs.', resultText: 'recurring' }),
          sStep({ key: 'dec', prompt: `${n} ÷ ${d} = ?`, answer: dec, pool: shuffle(uniq([dec, dec.replace('…', ''), `0.${n}${d}`, `${d}.${n}`])), isAnswer: true, diagnose: () => say(`${n} ÷ ${d} = ${dec}: it never stops. We write it with a dot over the repeating digit.`), hint: `${n} ÷ ${d} = ${dec}`, why: 'A recurring decimal repeats for ever; a dot goes over the repeating digit.', longWay: `${n}/${d} = ${n} ÷ ${d} = ${dec}`, resultText: `${n}/${d} = ${dec}` }),
        ] };
    }
    const D = pick([10, 100]), N = D === 10 ? pick([2, 4, 5, 6, 8]) : pick([15, 24, 35, 45, 64, 75, 85, 36]);
    const g = gcd(N, D), fin = `${N / g}/${D / g}`, dec = (N / D).toString();
    return { subject: 'y7frac', sig: `fb:${dec}`, given: `Write ${dec} as a fraction in its simplest form.`, answer: fin,
      steps: [
        sStep({ key: 'over', prompt: `${dec} has its last digit in the ${D === 10 ? 'tenths' : 'hundredths'} column. So ${dec} = ?`, answer: `${N}/${D}`, pool: shuffle(uniq([`${N}/${D}`, `${N}/${D * 10}`, `${N}/${D / 10 || 1}`, `${D}/${N}`])), diagnose: () => say(`${dec} = ${N} ${D === 10 ? 'tenths' : 'hundredths'} = ${N}/${D}.`), hint: `${N}/${D}.`, why: 'Tenths go over 10, hundredths over 100.', resultText: `${N}/${D}` }),
        sStep({ key: 'simp', prompt: `Simplify ${N}/${D}:`, answer: fin, pool: shuffle(uniq([fin, `${N}/${D}`, `${N / g}/${D}`, `${N}/${D / g}`])), isAnswer: true, diagnose: (v) => say(v === `${N}/${D}` ? 'Right value, not finished: simplify.' : `Divide top AND bottom by ${g}: ${fin}.`), hint: `÷ ${g}: ${fin}.`, why: 'Cancel down by the highest common factor.', longWay: `${dec} = ${N}/${D} = ${fin}`, resultText: `${dec} = ${fin}` }),
      ] };
  }

  const api = { equivMissing, cancelDown, y7OrderFractions, restFraction, timesFraction, fracDecimal, improperLowestTerms, multMixed, divideFractions, oddOneOut,
    sameDenTopHeavy, sameDenMixed, carryMixed, borrowMixed, mixedPlusFraction, unaided,
    borrowFromWhole, borrowMixedPair, borrowOrNot };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
