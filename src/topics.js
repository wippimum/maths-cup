/* topics.js — step-by-step problems for HCF, LCM, Primes and Ratio.
   Each problem mirrors the algebra shape: { subject, given, answer, steps }.
   Every step exposes ONE small task and knows how to mark it and name the slip,
   the same way the algebra steps do. Methods follow the school book (Corbettmaths
   listing method for HCF/LCM). */
(function (root) {
  const W = root.WAC || require('./numbers.js');
  const {
    factors, multiples, common, gcd, lcm, isPrime, primesUpTo,
    smallestPrimeFactor, primeFactorisation, properFactor,
    parseNumberList, uniqSort, sameSet, nearbyDistractors,
  } = W;

  const S = (a) => a.map(String);
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const list = (a) => a.join(', ');
  const sameStrSet = (a, b) => {
    const A = [...new Set(S(a))].sort(), B = [...new Set(S(b))].sort();
    return A.length === B.length && A.every((x, i) => x === B[i]);
  };

  // ---------- generic step factories ----------
  function chooseStep(o) {
    const expected = S(o.expected);
    const s = {
      key: o.key, mode: 'choose', multi: true,
      prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, isAnswer: !!o.isAnswer,
      pool: shuffle([...new Set(S(o.pool))]),
    };
    s.check = function (sel) {
      const cur = S(sel);
      if (sameStrSet(cur, expected)) return { correct: true };
      return o.diagnose ? o.diagnose(cur, expected) : { correct: false, id: 'choose-wrong', ctx: {} };
    };
    return s;
  }
  function pickStep(o) {
    const accept = S(o.expected);            // any-of accepted
    const s = {
      key: o.key, mode: 'pick', multi: false,
      prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, isAnswer: !!o.isAnswer,
      pool: shuffle([...new Set(S(o.pool))]),
    };
    s.check = function (sel) {
      const v = Array.isArray(sel) ? sel[0] : sel;
      if (v == null || v === '') return { correct: false, id: 'empty', ctx: {} };
      if (accept.includes(String(v))) return { correct: true };
      return o.diagnose ? o.diagnose(String(v)) : { correct: false, id: 'pick-wrong', ctx: {} };
    };
    return s;
  }
  function buildStep(o) {
    const s = {
      key: o.key, mode: 'build',
      prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, isAnswer: !!o.isAnswer,
      pieces: o.pieces, distractors: o.distractors || [],
      // What a correct build looks like once the cards are laid out in order.
      // The cards themselves are shuffled on screen (and for ordering questions the
      // pieces are deliberately NOT in the right order), so the tests need this to
      // know what "solved" looks like. Defaults to the pieces as given.
      solution: o.solution != null ? o.solution : (o.pieces || []).join(' '),
    };
    s.check = o.check;
    return s;
  }

  // pool of numbers = correct set + a few nearby wrong ones
  function numberPool(correct, extra, lo, hi) {
    return uniqSort([...correct, ...nearbyDistractors(correct, extra, lo, hi)]);
  }

  // ============================================================ HCF
  function factorStep(n, keySuffix) {
    const f = factors(n);
    return chooseStep({
      key: 'factors-' + keySuffix,
      prompt: `List all the factors of ${n}. Tap every number that divides ${n} exactly (with nothing left over).`,
      hint: `Go in pairs: 1×${n}, 2×?, 3×? … Don't forget 1 and ${n} itself are always factors.`,
      why: `A factor divides the number with no remainder. Every number has 1 and itself as factors, so those two always belong on the list.`,
      longWay: `Factor pairs of ${n}:\n` + factorPairs(n) + `\nSo the factors are: ${list(f)}`,
      resultText: `Factors of ${n}: ${list(f)}`,
      expected: f,
      pool: numberPool(f, f.length > 9 ? 2 : 4, 2, n),
      diagnose: (sel, exp) => {
        const extra = sel.filter((x) => !exp.includes(x));
        if (extra.length) return { correct: false, id: 'factor-not', ctx: { n, bad: extra[0] } };
        const missing = exp.filter((x) => !sel.includes(x));
        if (missing.includes(String(1)) || missing.includes(String(n))) return { correct: false, id: 'factor-forgot-ends', ctx: { n } };
        return { correct: false, id: 'factor-missed', ctx: { n, missing: missing.join(', ') } };
      },
    });
  }
  function factorPairs(n) {
    const out = [];
    for (let i = 1; i * i <= n; i++) if (n % i === 0) out.push(`${i} × ${n / i} = ${n}`);
    return out.join('\n');
  }

  function hcfProblem(a, b, story) {
    const fa = factors(a), fb = factors(b), cf = common(fa, fb), h = cf[cf.length - 1];
    const steps = [
      factorStep(a, 'a'),
      factorStep(b, 'b'),
      chooseStep({
        key: 'common-factors',
        prompt: `Which numbers are factors of BOTH ${a} and ${b}? Tap the common factors.`,
        hint: `Look for the numbers that show up in the factors of ${a} AND the factors of ${b}.`,
        why: `A common factor divides both numbers. The biggest one will be our HCF. Writing out both sets and picking what they share is called the LISTING METHOD — it is slower than the prime-factor way, but you can see exactly why the answer is the answer.`,
        longWay: `Factors of ${a}: ${list(fa)}\nFactors of ${b}: ${list(fb)}\nIn both: ${list(cf)}`,
        resultText: `Common factors: ${list(cf)}`,
        expected: cf,
        pool: uniqSort([...fa, ...fb]),
        diagnose: (sel) => {
          const extra = sel.filter((x) => !S(cf).includes(x));
          if (extra.length) return { correct: false, id: 'cf-not-common', ctx: { a, b, bad: extra[0] } };
          return { correct: false, id: 'cf-missed', ctx: { a, b } };
        },
      }),
      pickStep({
        key: 'hcf',
        prompt: `So what is the highest common factor (HCF) of ${a} and ${b}? Tap the biggest common factor.`,
        hint: `From the common factors ${list(cf)}, pick the largest one.`,
        why: `"Highest common factor" = the biggest number that divides both. It's simply the largest number in the common list.`,
        longWay: `Common factors: ${list(cf)} → the highest is ${h}.`,
        resultText: `HCF = ${h}`,
        expected: [h],
        // When the HCF is 1 the common-factor list is a single card, which hands the
        // answer over for free. Top the pool up so there is always a real choice.
        pool: cf.length > 2 ? cf : numberPool(cf, 4, 2, Math.max(a, b)),
        isAnswer: true,
        diagnose: (v) => S(cf).includes(v)
          ? { correct: false, id: 'hcf-not-highest', ctx: { h } }
          : { correct: false, id: 'hcf-wrong', ctx: { h, cf: list(cf) } },
      }),
    ];
    return { subject: 'hcf', given: `Find the HCF of ${a} and ${b}`, answer: String(h), steps, story: story || null };
  }

  // ============================================================ LCM
  function multipleStep(n, k, keySuffix) {
    const m = multiples(n, k);
    const hi = n * k;
    return chooseStep({
      key: 'multiples-' + keySuffix,
      prompt: `Tap all the multiples of ${n} shown below (the numbers in ${n}'s times-table).`,
      hint: `Count up in ${n}s: ${n}, ${2 * n}, ${3 * n} … A multiple is ${n} times a whole number.`,
      why: `A multiple of ${n} is what you get by multiplying ${n} by 1, 2, 3, and so on.`,
      longWay: `${n} × 1 … ${n} × ${k}:\n${m.map((v, i) => `${n} × ${i + 1} = ${v}`).join('\n')}`,
      resultText: `Multiples of ${n}: ${list(m)}`,
      expected: m,
      pool: uniqSort([...m, ...nearbyDistractors(m, 4, n + 1, hi)]),
      diagnose: (sel, exp) => {
        const extra = sel.filter((x) => !exp.includes(x));
        if (extra.length) return { correct: false, id: 'mult-not', ctx: { n, bad: extra[0] } };
        return { correct: false, id: 'mult-missed', ctx: { n } };
      },
    });
  }

  function lcmProblem(a, b, story) {
    const L = lcm(a, b);
    // Show enough multiples to reach the LCM (a little past). If that's cheap,
    // extend to 2×LCM so there are two common multiples to spot.
    const mulCount = (x) => { const base = L / x; return 2 * base <= 8 ? 2 * base : Math.min(10, base + 1); };
    const kA = mulCount(a), kB = mulCount(b);
    const ma = multiples(a, kA), mb = multiples(b, kB);
    const cm = common(ma, mb);                 // shared multiples in the shown lists
    const ab = a * b;
    // Always offer the a×b trap alongside the real common multiples, and top up if
    // that still leaves only one card (which would give the answer away for free).
    let lcmPool = uniqSort(S(cm).map(Number).includes(ab) ? cm : [...cm, ab]);
    if (lcmPool.length < 3) lcmPool = numberPool(lcmPool, 3, Math.min(a, b), L + 2 * Math.max(a, b));
    const steps = [
      multipleStep(a, kA, 'a'),
      multipleStep(b, kB, 'b'),
      chooseStep({
        key: 'common-multiples',
        prompt: `Which numbers appear in BOTH lists? Tap the common multiples of ${a} and ${b}.`,
        hint: `Find the numbers that are in the ${a}-list and also in the ${b}-list.`,
        why: `A common multiple is in both times-tables. The smallest one will be our LCM.`,
        longWay: `Multiples of ${a}: ${list(ma)}\nMultiples of ${b}: ${list(mb)}\nIn both: ${list(cm)}`,
        resultText: `Common multiples: ${list(cm)}`,
        expected: cm,
        pool: uniqSort([...ma, ...mb]),
        diagnose: (sel) => {
          const extra = sel.filter((x) => !S(cm).includes(x));
          if (extra.length) return { correct: false, id: 'cm-not-common', ctx: { a, b, bad: extra[0] } };
          return { correct: false, id: 'cm-missed', ctx: { a, b } };
        },
      }),
      pickStep({
        key: 'lcm',
        prompt: `What is the lowest common multiple (LCM) of ${a} and ${b}? Tap the smallest number in both lists.`,
        hint: `From the common multiples ${list(cm)}, pick the smallest one.`,
        why: `"Lowest common multiple" = the smallest number both go into. Careful — it is NOT always ${a}×${b}; that only works when they share no factors.`,
        longWay: `Common multiples: ${list(cm)} → the lowest is ${L}.`,
        resultText: `LCM = ${L}`,
        expected: [L],
        pool: lcmPool,
        isAnswer: true,
        diagnose: (v) => {
          if (Number(v) === ab && ab !== L) return { correct: false, id: 'lcm-multiplied', ctx: { a, b, L, ab } };
          if (S(cm).includes(v)) return { correct: false, id: 'lcm-not-lowest', ctx: { L } };
          return { correct: false, id: 'lcm-wrong', ctx: { L, cm: list(cm) } };
        },
      }),
    ];
    return { subject: 'lcm', given: `Find the LCM of ${a} and ${b}`, answer: String(L), steps, story: story || null };
  }

  // ============================================================ PRIMES
  function primeSpotProblem(n) {
    const prime = isPrime(n);
    const steps = [
      pickStep({
        key: 'is-prime',
        prompt: `Is ${n} a prime number?`,
        hint: `A prime has EXACTLY two factors: 1 and itself. Can any other number divide ${n} exactly?`,
        why: `A prime number has exactly two factors — 1 and itself. If any other number divides it, it is NOT prime. (1 is not prime; 2 is the only even prime.)`,
        longWay: prime
          ? `Nothing between 2 and ${n - 1} divides ${n} exactly, so ${n} has only 1 and ${n} as factors → prime.`
          : `${properFactor(n)} divides ${n} (${properFactor(n)} × ${n / properFactor(n)} = ${n}), so ${n} has more than two factors → not prime.`,
        resultText: `${n} is ${prime ? 'prime' : 'not prime'}`,
        expected: [prime ? 'Prime' : 'Not prime'],
        pool: ['Prime', 'Not prime'],
        isAnswer: prime,
        diagnose: () => ({ correct: false, id: 'prime-yesno', ctx: { n, prime, factor: prime ? null : properFactor(n) } }),
      }),
    ];
    if (!prime) {
      const pf = factors(n).filter((x) => x !== 1 && x !== n);
      steps.push(pickStep({
        key: 'prime-factor-find',
        prompt: `${n} is not prime — tap a number (other than 1 and ${n}) that divides ${n} exactly.`,
        hint: `Try small numbers: does 2 go into ${n}? 3? Any that fits proves ${n} isn't prime.`,
        why: `To prove a number is not prime you just need ONE extra factor besides 1 and itself.`,
        longWay: `Factors of ${n}: ${list(factors(n))}. Any of ${list(pf)} works.`,
        resultText: `${pf[0]} divides ${n}`,
        expected: pf,
        pool: numberPool(pf.concat([1, n]), 3, 2, n),
        isAnswer: true,
        diagnose: (v) => ([String(1), String(n)].includes(v))
          ? { correct: false, id: 'prime-factor-trivial', ctx: { n, v } }
          : { correct: false, id: 'prime-factor-wrong', ctx: { n, v } },
      }));
    }
    return { subject: 'primes', given: `Is ${n} a prime number?`, answer: prime ? 'prime' : 'not prime', steps };
  }

  function primeHuntProblem(nums) {
    const primesIn = nums.filter(isPrime);
    return {
      subject: 'primes', given: `Tap all the prime numbers`, sig: 'hunt:' + nums.join(','), answer: list(primesIn),
      steps: [chooseStep({
        key: 'prime-hunt',
        prompt: `Tap all the prime numbers in this set.`,
        hint: `A prime has exactly two factors (1 and itself). Remember 1 is NOT prime, and 2 is the only even prime.`,
        why: `Check each number: if anything besides 1 and itself divides it, it's not prime.`,
        longWay: nums.map((x) => `${x}: ${isPrime(x) ? 'prime' : 'not (÷ ' + properFactor(x) + ')'}`).join('\n'),
        resultText: `Primes: ${list(primesIn)}`,
        expected: primesIn,
        pool: nums,
        isAnswer: true,
        diagnose: (sel) => {
          const extra = sel.filter((x) => !S(primesIn).includes(x));
          if (extra.length) return { correct: false, id: 'primes-not', ctx: { bad: extra[0], factor: properFactor(Number(extra[0])) } };
          return { correct: false, id: 'primes-missed', ctx: {} };
        },
      })],
    };
  }

  function primeFactorProblem(n) {
    const pf = primeFactorisation(n);
    const steps = [];
    let m = n;
    const smallPrimes = primesUpTo(Math.max(13, n));
    pf.forEach((p, i) => {
      const cur = m;
      steps.push(pickStep({
        key: 'spf-' + i,
        prompt: `Current number: ${cur}. What is the smallest prime number that divides ${cur}?`,
        hint: `Try 2 first, then 3, then 5 … the first prime that goes into ${cur} exactly.`,
        why: `Breaking a number into primes: keep dividing by the smallest prime that fits, until you reach 1.`,
        longWay: `${cur} ÷ ${p} = ${cur / p}. Keep going with ${cur / p}.`,
        resultText: `${cur} ÷ ${p} = ${cur / p}`,
        expected: [p],
        pool: uniqSort(smallPrimes.filter((q) => q <= cur).slice(0, 6).concat([p])),
        diagnose: (v) => {
          const num = Number(v);
          if (cur % num !== 0) return { correct: false, id: 'spf-not-divisor', ctx: { cur, v } };
          if (!isPrime(num)) return { correct: false, id: 'spf-not-prime', ctx: { cur, v } };
          return { correct: false, id: 'spf-not-smallest', ctx: { cur, p } };
        },
      }));
      m = m / p;
    });
    // final: build the product
    const pieces = [];
    pf.forEach((p, i) => { if (i) pieces.push('×'); pieces.push(String(p)); });
    steps.push(buildStep({
      key: 'pf-product',
      prompt: `Write ${n} as a product of its prime factors (use the × cards).`,
      hint: `Multiply all the primes you found together: ${pf.join(' × ')}.`,
      why: `Every whole number is a unique product of primes — that's its "prime factorisation".`,
      longWay: `${n} = ${pf.join(' × ')}`,
      resultText: `${n} = ${pf.join(' × ')}`,
      pieces,
      distractors: ['×', String((pf[0] || 2) + 1), String(n)],
      isAnswer: true,
      check: (raw) => {
        const nums = parseNumberList(String(raw).replace(/[×xX*]/g, ' '));
        if (!nums.length) return { correct: false, id: 'empty', ctx: {} };
        // Every factor must be prime (so 2 × 3 × 4 is rejected — 4 isn't prime)…
        if (nums.some((x) => !isPrime(x))) return { correct: false, id: 'pf-not-all-prime', ctx: { n, pf: pf.join(' × ') } };
        // …and they must multiply back to n.
        const prod = nums.reduce((a, b) => a * b, 1);
        if (prod === n) return { correct: true };
        return { correct: false, id: 'pf-product', ctx: { n, prod, pf: pf.join(' × ') } };
      },
    }));
    return { subject: 'primes', given: `Write ${n} as a product of primes`, answer: pf.join(' × '), steps };
  }
  function sameMultiset(a, b) {
    if (a.length !== b.length) return false;
    const x = a.slice().sort((m, n) => m - n), y = b.slice().sort((m, n) => m - n);
    return x.every((v, i) => v === y[i]);
  }

  // ============================================================ RATIO
  function ratioSimplifyProblem(a, b) {
    const h = gcd(a, b), sa = a / h, sb = b / h, cf = common(factors(a), factors(b));
    const steps = [
      pickStep({
        key: 'ratio-hcf',
        prompt: `To simplify ${a} : ${b}, first find the highest common factor (HCF) of ${a} and ${b}.`,
        hint: `What is the biggest number that divides both ${a} and ${b}? Common factors: ${list(cf)}.`,
        why: `To simplify a ratio you divide BOTH sides by the same number. Using the HCF gets it to simplest form in one go.`,
        longWay: `Common factors of ${a} and ${b}: ${list(cf)} → HCF = ${h}.`,
        resultText: `HCF of ${a} and ${b} = ${h}`,
        expected: [h],
        pool: cf,
        diagnose: (v) => S(cf).includes(v)
          ? { correct: false, id: 'hcf-not-highest', ctx: { h } }
          : { correct: false, id: 'hcf-wrong', ctx: { h, cf: list(cf) } },
      }),
      pickStep({
        key: 'ratio-div-a',
        prompt: `Divide the left side by the HCF: ${a} ÷ ${h} = ?`,
        hint: `${a} ÷ ${h}.`,
        why: `We divide each side of the ratio by the HCF to shrink it while keeping the same proportion.`,
        resultText: `${a} ÷ ${h} = ${sa}`,
        expected: [sa],
        pool: numberPool([sa], 4, 1, Math.max(sa + 4, a)),
        diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: a, h, ans: sa } }),
      }),
      pickStep({
        key: 'ratio-div-b',
        prompt: `Divide the right side by the HCF: ${b} ÷ ${h} = ?`,
        hint: `${b} ÷ ${h}.`,
        why: `Divide the other side by the same HCF so the ratio stays equivalent.`,
        resultText: `${b} ÷ ${h} = ${sb}`,
        expected: [sb],
        pool: numberPool([sb], 4, 1, Math.max(sb + 4, b)),
        diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: b, h, ans: sb } }),
      }),
      buildStep({
        key: 'ratio-write',
        prompt: `Write the simplified ratio (use the number and : cards).`,
        hint: `Put your two answers together: ${sa} : ${sb}.`,
        why: `The simplified ratio uses the two numbers you just worked out, in the same order.`,
        longWay: `${a} : ${b} = ${sa} : ${sb}`,
        resultText: `${a} : ${b} = ${sa} : ${sb}`,
        pieces: [String(sa), ':', String(sb)],
        distractors: [String(a), String(b), String(sb + 1)],
        isAnswer: true,
        check: (raw) => {
          const nums = parseNumberList(String(raw).replace(/:/g, ' '));
          if (nums.length < 2) return { correct: false, id: 'ratio-form', ctx: { sa, sb } };
          if (nums[0] === sa && nums[1] === sb) return { correct: true };
          if (nums[0] === sb && nums[1] === sa) return { correct: false, id: 'ratio-order', ctx: { sa, sb } };
          return { correct: false, id: 'ratio-form', ctx: { sa, sb } };
        },
      }),
    ];
    return { subject: 'ratio', given: `Simplify the ratio ${a} : ${b}`, answer: `${sa} : ${sb}`, steps };
  }

  function ratioShareProblem(amount, a, b, unit) {
    const totalParts = a + b, per = amount / totalParts, shareA = a * per, shareB = b * per;
    const u = unit || '';
    const steps = [
      pickStep({
        key: 'share-parts',
        prompt: `Share ${u}${amount} in the ratio ${a} : ${b}. First: how many parts are there altogether? ${a} + ${b} = ?`,
        hint: `Add the two numbers in the ratio: ${a} + ${b}.`,
        why: `The ratio ${a} : ${b} splits the whole into ${a} + ${b} equal parts. We find one part first, then build each share.`,
        resultText: `Parts: ${a} + ${b} = ${totalParts}`,
        expected: [totalParts],
        pool: numberPool([totalParts], 4, 2, totalParts + 5),
        diagnose: () => ({ correct: false, id: 'share-parts', ctx: { a, b, totalParts } }),
      }),
      pickStep({
        key: 'share-per',
        prompt: `What is ONE part worth? ${u}${amount} ÷ ${totalParts} = ?`,
        hint: `Divide the total by the number of parts: ${amount} ÷ ${totalParts}.`,
        why: `Splitting the amount equally between all the parts tells us what a single part is worth.`,
        resultText: `One part = ${u}${amount} ÷ ${totalParts} = ${u}${per}`,
        expected: [per],
        pool: numberPool([per], 4, 1, per + Math.max(6, per)),
        diagnose: () => ({ correct: false, id: 'share-per', ctx: { amount, totalParts, per } }),
      }),
      pickStep({
        key: 'share-a',
        prompt: `First share = ${a} parts. ${a} × ${per} = ?`,
        hint: `Multiply one part (${per}) by ${a}.`,
        why: `The first person gets ${a} of the equal parts, so multiply one part by ${a}.`,
        resultText: `First share = ${a} × ${per} = ${u}${shareA}`,
        expected: [shareA],
        pool: numberPool([shareA], 4, 1, shareA + Math.max(6, per)),
        diagnose: () => ({ correct: false, id: 'share-mult', ctx: { parts: a, per, ans: shareA } }),
      }),
      pickStep({
        key: 'share-b',
        prompt: `Second share = ${b} parts. ${b} × ${per} = ?`,
        hint: `Multiply one part (${per}) by ${b}. Tip: it should add with the first share to make ${u}${amount}.`,
        why: `The second person gets ${b} equal parts. The two shares together must come back to ${u}${amount}.`,
        resultText: `Second share = ${b} × ${per} = ${u}${shareB}`,
        expected: [shareB],
        pool: numberPool([shareB], 4, 1, shareB + Math.max(6, per)),
        isAnswer: true,
        diagnose: () => ({ correct: false, id: 'share-mult', ctx: { parts: b, per, ans: shareB } }),
      }),
    ];
    return { subject: 'ratio', given: `Share ${u}${amount} in the ratio ${a} : ${b}`, answer: `${u}${shareA} and ${u}${shareB}`, steps };
  }

  const api = {
    hcfProblem, lcmProblem,
    primeSpotProblem, primeHuntProblem, primeFactorProblem,
    ratioSimplifyProblem, ratioShareProblem,
    // shared factories/helpers reused by topics2.js
    _chooseStep: chooseStep, _pickStep: pickStep, _buildStep: buildStep,
    _numberPool: numberPool, _list: list, _S: S, _shuffle: shuffle,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
