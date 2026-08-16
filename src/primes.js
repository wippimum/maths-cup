/* primes.js — the Primes topic, rebuilt to match the Foundation book (Section 4).
   Levels (easy → hard): is-it-prime (tap ALL factors), prime hunt (+ range),
   two prime factors, factor tree in index form, make-a-square (beyond Y7),
   HCF & LCM from prime factors (beyond Y7). */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, chooseStep = W._chooseStep, buildStep = W._buildStep, numberPool = W._numberPool, list = W._list, S = W._S;
  const N = root.WAC || require('./numbers.js');
  const { factors, isPrime, primesUpTo, primeFactorisation, properFactor, gcd, common, uniqSort, parseNumberList, nearbyDistractors } = N;

  // ---- index-form helpers ----
  function factorMap(n) { const m = {}; primeFactorisation(n).forEach((p) => m[p] = (m[p] || 0) + 1); return m; }
  function indexForm(n) { const m = factorMap(n); return Object.keys(m).map(Number).sort((a, b) => a - b).map((p) => m[p] === 1 ? `${p}` : `${p}^${m[p]}`).join(' × '); }
  function indexPieces(n) { const m = factorMap(n), ps = Object.keys(m).map(Number).sort((a, b) => a - b), out = []; ps.forEach((p, i) => { if (i) out.push('×'); out.push(String(p)); if (m[p] > 1) { out.push('^'); out.push(String(m[p])); } }); return out; }
  function parseProduct(str) {
    const s = String(str).replace(/[−–—]/g, '-').replace(/\s*\^\s*/g, '^').replace(/[×xX*]/g, ' ').trim();
    const toks = s ? s.split(/\s+/) : [];
    const map = {};
    for (const t of toks) {
      if (t.includes('^')) { const [b, e] = t.split('^'); if (!/^\d+$/.test(b) || !/^\d+$/.test(e)) return null; map[b] = (map[b] || 0) + parseInt(e, 10); }
      else if (/^\d+$/.test(t)) { map[t] = (map[t] || 0) + 1; }
      else return null;
    }
    return { map, tokens: toks };
  }
  function mapsEqual(a, b) { const ka = Object.keys(a), kb = Object.keys(b); if (ka.length !== kb.length) return false; return ka.every((k) => a[k] === b[k]); }

  // ================= LEVEL 1 — is it prime? (tap ALL factors) =================
  function isItPrime(n) {
    const prime = isPrime(n);
    const steps = [pickStep({
      key: 'yesno', prompt: `Is ${n} a prime number?`,
      hint: `A prime has EXACTLY two factors: 1 and itself. Does any other number divide ${n}?`,
      why: `A prime number has exactly two factors — 1 and itself. If any other number divides it, it is NOT prime. (1 is not prime; 2 is the only even prime.)`,
      longWay: prime ? `Nothing from 2 to ${n - 1} divides ${n}, so only 1 and ${n} do → prime.` : `${properFactor(n)} divides ${n} (${properFactor(n)} × ${n / properFactor(n)} = ${n}), so it has more than two factors → not prime.`,
      resultText: `${n} is ${prime ? 'prime' : 'not prime'}`, expected: [prime ? 'Prime' : 'Not prime'], pool: ['Prime', 'Not prime'], isAnswer: prime,
      diagnose: () => ({ correct: false, id: 'prime-yesno', ctx: { n, prime, factor: prime ? null : properFactor(n) } }),
    })];
    if (!prime) {
      const proper = factors(n).filter((x) => x !== 1 && x !== n);
      const pool = uniqSort([1, n, ...proper, ...nearbyDistractors(factors(n), 4, 2, n)]);
      steps.push(chooseStep({
        key: 'all-factors',
        prompt: `${n} is not prime. Tap ALL the numbers (other than 1 and ${n}) that divide ${n} exactly.`,
        hint: `Check each: does 2 divide ${n}? 3? 4? … Tap every one that fits. The factors of ${n} are ${list(factors(n))}.`,
        why: `A prime would have NO factors besides 1 and itself. Finding every "middle" factor proves ${n} isn't prime and shows what it's made of.`,
        longWay: `Factors of ${n}: ${list(factors(n))}. Take away 1 and ${n} → ${list(proper)}.`,
        resultText: `factors of ${n} (not 1 or ${n}): ${list(proper)}`, expected: proper, pool, isAnswer: true,
        diagnose: (sel) => {
          if (sel.includes('1') || sel.includes(String(n))) return { correct: false, id: 'prime-ends', ctx: { n } };
          const bad = sel.find((x) => n % Number(x) !== 0);
          if (bad) return { correct: false, id: 'prime-notdiv', ctx: { n, bad } };
          return { correct: false, id: 'prime-missed', ctx: { n, all: list(proper) } };
        },
      }));
    }
    return { subject: 'primes', given: `Is ${n} a prime number?`, sig: `isp:${n}`, answer: prime ? 'prime' : 'not prime', steps };
  }

  // ================= LEVEL 2 — prime hunt (set or range) =================
  function primeHunt(nums) {
    const primesIn = nums.filter(isPrime);
    return { subject: 'primes', given: `Tap all the prime numbers`, sig: 'hunt:' + nums.join(','), answer: list(primesIn),
      steps: [chooseStep({ key: 'hunt', prompt: `Tap all the prime numbers in this set.`, hint: `A prime has exactly two factors. Remember 1 is NOT prime and 2 is the only even prime.`,
        why: `Check each number — if anything besides 1 and itself divides it, it's not prime.`, longWay: nums.map((x) => `${x}: ${isPrime(x) ? 'prime' : 'not (÷ ' + properFactor(x) + ')'}`).join('\n'),
        resultText: `primes: ${list(primesIn)}`, expected: primesIn, pool: nums, isAnswer: true,
        diagnose: (sel) => { const bad = sel.find((x) => !isPrime(Number(x))); if (bad) return { correct: false, id: 'primes-not', ctx: { bad, factor: properFactor(Number(bad)) } }; return { correct: false, id: 'primes-missed', ctx: {} }; } })] };
  }
  function primeHuntRange(lo, hi) {
    const nums = []; for (let i = lo; i <= hi; i++) nums.push(i);
    const primesIn = nums.filter(isPrime);
    return { subject: 'primes', given: `Tap all the prime numbers between ${lo} and ${hi}`, sig: `range:${lo}-${hi}`, answer: list(primesIn),
      steps: [chooseStep({ key: 'range', prompt: `Tap all the prime numbers from ${lo} to ${hi}.`, hint: `Skip even numbers (except 2) and multiples of 3 and 5. What's left is usually prime.`,
        why: `Between ${lo} and ${hi}, cross off multiples of 2, 3, 5, 7 — the survivors are prime.`, longWay: `Primes ${lo}–${hi}: ${list(primesIn)}`,
        resultText: `primes: ${list(primesIn)}`, expected: primesIn, pool: nums, isAnswer: true,
        diagnose: (sel) => { const bad = sel.find((x) => !isPrime(Number(x))); if (bad) return { correct: false, id: 'primes-not', ctx: { bad, factor: properFactor(Number(bad)) } }; return { correct: false, id: 'primes-missed', ctx: {} }; } })] };
  }

  // ================= LEVEL 3 — write as a product of TWO primes =================
  function twoPrimes(p, q) {
    const n = p * q, a = Math.min(p, q), b = Math.max(p, q), primeChoices = uniqSort(primesUpTo(Math.max(13, b)).filter((x) => x <= n));
    return { subject: 'primes', given: `Write ${n} as a product of two prime numbers`, sig: `two:${n}`, answer: `${a} × ${b}`,
      steps: [
        pickStep({ key: 'p1', prompt: `Find the smallest prime that divides ${n}.`, hint: `Try 2, then 3, then 5… the first prime that goes into ${n} is ${a}.`, why: `Start with the smallest prime — it's the easiest factor to spot.`,
          resultText: `${a} divides ${n}`, expected: [a], pool: primeChoices.slice(0, 6), diagnose: (v) => n % Number(v) !== 0 ? { correct: false, id: 'spf-not-divisor', ctx: { cur: n, v } } : (!isPrime(Number(v)) ? { correct: false, id: 'spf-not-prime', ctx: { cur: n, v } } : { correct: false, id: 'spf-not-smallest', ctx: { cur: n, p: a } }) }),
        pickStep({ key: 'p2', prompt: `Now ${n} ÷ ${a} = ? (it's the other prime)`, hint: `${n} ÷ ${a} = ${b}, and ${b} is prime too.`, why: `Dividing by the first prime leaves the second prime, because ${n} is just two primes multiplied.`,
          resultText: `${n} ÷ ${a} = ${b}`, expected: [b], pool: numberPool([b], 4, 2, n), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: b, expr: `${n} ÷ ${a}` } }) }),
        buildStep({ key: 'build', prompt: `Write ${n} as prime × prime (use the cards).`, hint: `${a} × ${b}.`, why: `${n} = ${a} × ${b}, and both are prime — that's the answer.`, longWay: `${n} = ${a} × ${b}`, resultText: `${n} = ${a} × ${b}`,
          pieces: [String(a), '×', String(b)], distractors: [String(n), String(a + 1), String(b - 1 > 1 ? b - 1 : b + 2)], isAnswer: true,
          check: (raw) => { const r = parseProduct(raw); if (!r || !r.tokens.length) return { correct: false, id: 'two-form', ctx: { a, b } }; const nums = Object.keys(r.map).flatMap((k) => Array(r.map[k]).fill(Number(k))); if (nums.length !== 2) return { correct: false, id: 'two-count', ctx: { a, b } }; if (!nums.every(isPrime)) return { correct: false, id: 'two-notprime', ctx: { a, b } }; if (nums[0] * nums[1] === n) return { correct: true }; return { correct: false, id: 'two-form', ctx: { a, b } }; } }),
      ] };
  }

  // ================= LEVEL 4 — factor tree in INDEX FORM =================
  function factorIndex(n) {
    const pf = primeFactorisation(n), steps = []; let m = n;
    const smallPrimes = primesUpTo(Math.max(13, n));
    pf.forEach((p, i) => {
      const cur = m;
      steps.push(pickStep({ key: 'spf-' + i, prompt: `Current number: ${cur}. What is the smallest prime that divides ${cur}?`, hint: `Try 2, then 3, then 5… the first prime that fits ${cur} is ${p}.`,
        why: `Building a factor tree: keep splitting off the smallest prime until you reach 1.`, longWay: `${cur} ÷ ${p} = ${cur / p}. Carry on with ${cur / p}.`, resultText: `${cur} ÷ ${p} = ${cur / p}`,
        expected: [p], pool: uniqSort(smallPrimes.filter((q) => q <= cur).slice(0, 6).concat([p])),
        diagnose: (v) => cur % Number(v) !== 0 ? { correct: false, id: 'spf-not-divisor', ctx: { cur, v } } : (!isPrime(Number(v)) ? { correct: false, id: 'spf-not-prime', ctx: { cur, v } } : { correct: false, id: 'spf-not-smallest', ctx: { cur, p } }) }));
      m = m / p;
    });
    const idx = indexForm(n), distinct = Object.keys(factorMap(n)).length;
    steps.push(buildStep({ key: 'index', prompt: `Write ${n} in index form (use the cards — the ^ card makes a power).`, hint: `Collect repeats as powers: ${idx}.`,
      why: `"Index form" writes repeated primes as powers, e.g. 2 × 2 × 2 = 2³. So ${n} = ${idx}.`, longWay: `${n} = ${pf.join(' × ')} = ${idx}`, resultText: `${n} = ${idx}`,
      pieces: indexPieces(n), distractors: uniqSort([String((pf[0] || 2) + 1), String((factorMap(n)[Object.keys(factorMap(n))[0]] || 1) + 1)]).slice(0, 3), isAnswer: true,
      check: (raw) => { const r = parseProduct(raw); if (!r || !r.tokens.length) return { correct: false, id: 'pf-index-form', ctx: { n, idx } }; if (!mapsEqual(r.map, factorMap(n))) { const nums = Object.keys(r.map).flatMap((k) => Array(r.map[k]).fill(Number(k))); if (nums.some((x) => !isPrime(x))) return { correct: false, id: 'pf-not-all-prime', ctx: { n, pf: idx } }; return { correct: false, id: 'pf-index-wrong', ctx: { n, idx } }; } if (r.tokens.length !== distinct) return { correct: false, soft: true, id: 'use-index', ctx: { idx } }; return { correct: true }; } }));
    return { subject: 'primes', given: `Write ${n} as a product of primes (index form)`, sig: `idx:${n}`, answer: indexForm(n), steps };
  }

  // ================= LEVEL 5 — make a square (beyond Y7) =================
  const SQUARE_BANK = [[8, 2, 16], [12, 3, 36], [18, 2, 36], [20, 5, 100], [27, 3, 81], [45, 5, 225], [48, 3, 144], [50, 2, 100], [75, 3, 225], [98, 2, 196], [28, 7, 196], [63, 7, 441]];
  function makeSquare(entry) {
    const [n, mult, sq] = entry, idx = indexForm(n), m = factorMap(n);
    const oddPrime = Object.keys(m).map(Number).find((p) => m[p] % 2 === 1);
    const primesPresent = Object.keys(m).map(Number);
    return { subject: 'primes', given: `${n} = ${idx}. What is the smallest number to multiply ${n} by to make a SQUARE number?`, sig: `sq:${n}`, answer: `${mult} → ${sq}`,
      steps: [
        pickStep({ key: 'odd', prompt: `In ${n} = ${idx}, which prime has an ODD power? (that's the one to fix)`, hint: `A square number has every prime power EVEN. Here ${oddPrime} has an odd power.`,
          why: `A perfect square factorises into primes with all EVEN powers (e.g. 36 = 2² × 3²). Find the prime whose power is odd.`, resultText: `${oddPrime} has an odd power`, expected: [oddPrime],
          // n may have a single prime factor (8 = 2³), which would leave one card and
          // give the answer away — offer other small primes as real alternatives.
          pool: uniqSort(primesPresent.concat([oddPrime], primesPresent.length > 2 ? [] : [2, 3, 5, 7].filter((p) => !primesPresent.includes(p)).slice(0, 3))),
          diagnose: () => ({ correct: false, id: 'square-odd', ctx: { n, idx, oddPrime } }) }),
        pickStep({ key: 'sq', prompt: `Multiply by ${mult} to make every power even. What square do you get? ${n} × ${mult} = ?`, hint: `${n} × ${mult} = ${sq} (a square number).`, why: `Multiplying by ${mult} bumps the odd power up to even, so the result is a perfect square: ${sq}.`,
          resultText: `${n} × ${mult} = ${sq}`, expected: [sq], pool: numberPool([sq], 4, sq - 20, sq + 20), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: sq, expr: `${n} × ${mult}` } }) }),
      ] };
  }

  // ================= LEVEL 6 — HCF & LCM from prime factors (beyond Y7) =================
  function hcfLcmByPrimes(a, b) {
    const ma = factorMap(a), mb = factorMap(b), allP = uniqSort(Object.keys(ma).concat(Object.keys(mb)).map(Number));
    let hcf = 1, lcm = 1;
    allP.forEach((p) => { const ea = ma[p] || 0, eb = mb[p] || 0; hcf *= Math.pow(p, Math.min(ea, eb)); lcm *= Math.pow(p, Math.max(ea, eb)); });
    const commonPrimes = allP.filter((p) => ma[p] && mb[p]);
    return { subject: 'primes', given: `${a} = ${indexForm(a)} and ${b} = ${indexForm(b)}. Find the HCF and the LCM.`, sig: `hl:${a},${b}`, answer: `HCF ${hcf}, LCM ${lcm}`,
      steps: [
        pickStep({ key: 'hcf', prompt: `HCF: multiply the primes in BOTH numbers, each at its LOWEST power. HCF = ?`, hint: commonPrimes.length ? `Shared primes at lowest power: ${commonPrimes.map((p) => `${p}^${Math.min(ma[p], mb[p])}`).join(' × ')} = ${hcf}.` : `They share no prime factors, so the HCF is 1.`,
          why: `The HCF is built from the primes both numbers have — each taken at the SMALLER power.`, resultText: `HCF = ${hcf}`, expected: [hcf], pool: numberPool([hcf], 4, 1, Math.max(hcf + 6, lcm)), diagnose: () => ({ correct: false, id: 'hcf-primes', ctx: { hcf } }) }),
        pickStep({ key: 'lcm', prompt: `LCM: multiply EVERY prime (from either number) at its HIGHEST power. LCM = ?`, hint: `Every prime at highest power: ${allP.map((p) => `${p}^${Math.max(ma[p] || 0, mb[p] || 0)}`).join(' × ')} = ${lcm}.`,
          why: `The LCM must contain enough of every prime — so take each at its BIGGER power.`, resultText: `LCM = ${lcm}`, expected: [lcm], pool: numberPool([lcm], 4, hcf, lcm + 12), isAnswer: true, diagnose: () => ({ correct: false, id: 'lcm-primes', ctx: { lcm } }) }),
      ] };
  }

  const api = { isItPrime, primeHunt, primeHuntRange, twoPrimes, factorIndex, makeSquare, hcfLcmByPrimes, SQUARE_BANK, indexForm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
