/* curriculum1.js — Toddle objectives the app had no question for (number & measure).
     T3  · Identify square and cube numbers; calculate squares, square roots, cubes, cube roots
     T4  · Convert between mixed numbers and improper fractions
     T4  · Express a number as a fraction of another number
     T15 · Express a given number as a percentage of another number
     T12 · Convert between metric units for length and mass, and for AREA and VOLUME
   Everything here is non-calculator, because every one of these topics is. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep;
  const numberPool = W._numberPool, list = W._list, shuffle = W._shuffle;
  const { gcd, factors, common, parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

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
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: o.answer, expr: o.expr } }),
    });
  }
  // exact decimal strings from scaled integers (never trust binary floats)
  function dec(v, dp) {
    if (dp <= 0) return String(v * Math.pow(10, -dp));
    const neg = v < 0; v = Math.abs(v);
    let s = String(v).padStart(dp + 1, '0');
    s = s.slice(0, s.length - dp) + '.' + s.slice(s.length - dp);
    s = s.replace(/\.?0+$/, '');
    if (s === '') s = '0';
    return (neg ? '-' : '') + s;
  }

  // ============================================================ T3 · squares, cubes and roots
  function powerRoot() {
    const kind = pick(['sq', 'cube', 'sqrt', 'cbrt']);
    if (kind === 'sq') {
      const n = rand(2, 15), v = n * n;
      return { subject: 'primes', sig: `pw:sq:${n}`, given: `Work out  ${n}²`, answer: String(v),
        steps: [nStep({ key: 'sq', prompt: `${n}² means ${n} × ${n}. What is it?`, hint: `${n} × ${n} = ${v}.`,
          why: `Squaring means multiplying a number by ITSELF. ${n}² = ${n} × ${n} = ${v} — it does not mean ${n} × 2, which would be ${2 * n}. It is called squaring because ${v} dots make a square ${n} by ${n}.`,
          resultText: `${n}² = ${v}`, answer: v, lo: Math.max(1, v - 20), hi: v + 20, expr: `${n} × ${n}`, isAnswer: true })] };
    }
    if (kind === 'cube') {
      const n = rand(2, 8), sq = n * n, v = sq * n;
      return { subject: 'primes', sig: `pw:cu:${n}`, given: `Work out  ${n}³`, answer: String(v),
        steps: [
          nStep({ key: 'a', prompt: `${n}³ means ${n} × ${n} × ${n}. Start with ${n} × ${n} = ?`, hint: `${n} × ${n} = ${sq}.`,
            why: `A cube is three of the same number multiplied. Do it in two goes: square it first, then multiply by the number once more.`,
            resultText: `${n} × ${n} = ${sq}`, answer: sq, lo: 1, hi: sq + 20, expr: `${n} × ${n}` }),
          nStep({ key: 'b', prompt: `Now × ${n} again: ${sq} × ${n} = ?`, hint: `${sq} × ${n} = ${v}.`,
            why: `That third multiplication is what makes it a cube — ${v} little cubes would stack into a cube ${n} by ${n} by ${n}.`,
            longWay: `${n}³ = ${n} × ${n} × ${n} = ${sq} × ${n} = ${v}`,
            resultText: `${n}³ = ${v}`, answer: v, lo: Math.max(1, v - 40), hi: v + 40, expr: `${sq} × ${n}`, isAnswer: true }),
        ] };
    }
    if (kind === 'sqrt') {
      const n = rand(2, 15), v = n * n;
      return { subject: 'primes', sig: `pw:sr:${v}`, given: `Work out  √${v}`, answer: String(n),
        steps: [nStep({ key: 'r', prompt: `√${v} asks: what number times ITSELF gives ${v}?`, hint: `${n} × ${n} = ${v}, so √${v} = ${n}.`,
          why: `A square root undoes a square. You are looking for the number that was squared to make ${v}: ${n} × ${n} = ${v}, so √${v} = ${n}.`,
          resultText: `√${v} = ${n}`, answer: n, pool: uniqSort([n, n + 1, n - 1, Math.round(v / 2), v].filter((x) => x > 0)),
          expr: `the number that squares to ${v}`, isAnswer: true })] };
    }
    const n = rand(2, 8), v = n * n * n;
    return { subject: 'primes', sig: `pw:cr:${v}`, given: `Work out  ∛${v}  (the cube root of ${v})`, answer: String(n),
      steps: [nStep({ key: 'r', prompt: `The cube root asks: what number times itself THREE times gives ${v}?`,
        hint: `${n} × ${n} × ${n} = ${v}, so ∛${v} = ${n}.`,
        why: `A cube root undoes a cube. ${n} × ${n} × ${n} = ${v}, so ∛${v} = ${n}.`,
        resultText: `∛${v} = ${n}`, answer: n, pool: uniqSort([n, n + 1, n - 1, n * n, Math.round(v / 3)].filter((x) => x > 0)),
        expr: `the number that cubes to ${v}`, isAnswer: true })] };
  }
  // Spot which numbers in a set are square (or cube) numbers.
  function spotSquares() {
    const cube = Math.random() < 0.35;
    const good = cube ? [8, 27, 64, 125, 216] : [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
    const want = shuffle(good).slice(0, rand(2, 3));
    const pool = new Set(want);
    while (pool.size < 7) { const v = rand(2, cube ? 220 : 150); if (!good.includes(v)) pool.add(v); }
    const nums = [...pool].sort((a, b) => a - b);
    const yes = nums.filter((n) => want.includes(n));
    return {
      subject: 'primes', sig: `sp:${cube ? 'c' : 's'}:${nums.join(',')}`,
      given: `Tap all the ${cube ? 'CUBE' : 'SQUARE'} numbers`, answer: list(yes),
      steps: [W._chooseStep({
        key: 'spot', prompt: `Which of these are ${cube ? 'cube' : 'square'} numbers?`,
        hint: `${cube ? 'Cube' : 'Square'} numbers here: ${list(yes)}.`,
        why: cube
          ? `A cube number is what you get by multiplying a number by itself three times: 1, 8 (2×2×2), 27 (3×3×3), 64, 125, 216 …`
          : `A square number is what you get by multiplying a number by itself: 1, 4 (2×2), 9 (3×3), 16, 25, 36, 49, 64, 81, 100 … Learning them by heart makes square roots instant.`,
        longWay: yes.map((v) => `${v} = ${Math.round(cube ? Math.cbrt(v) : Math.sqrt(v))}${cube ? '³' : '²'}`).join('\n'),
        resultText: `${cube ? 'Cube' : 'Square'} numbers: ${list(yes)}`,
        expected: yes, pool: nums, isAnswer: true,
        diagnose: () => ({ correct: false, id: 'spot-power', ctx: { cube, yes: list(yes) } }),
      })],
    };
  }

  // ============================================================ T4 · mixed numbers ↔ improper fractions
  function mixedToImproper() {
    const d = rand(2, 9), whole = rand(2, 6), n = rand(1, d - 1);
    const top = whole * d + n;
    return {
      subject: 'fractions', sig: `mi:${whole}_${n}/${d}`, given: `Write  ${whole} ${n}/${d}  as an improper fraction`, answer: `${top}/${d}`,
      steps: [
        nStep({ key: 'mul', prompt: `Each whole one is ${d} ${d === 2 ? 'half' : `/${d}`}s. So how many in ${whole} wholes? ${whole} × ${d} = ?`,
          hint: `${whole} × ${d} = ${whole * d}.`,
          why: `The bottom number tells you how many pieces make one whole. ${whole} wholes is ${whole} × ${d} = ${whole * d} pieces.`,
          resultText: `${whole} wholes = ${whole * d}/${d}`, answer: whole * d, lo: 1, hi: whole * d + 12, expr: `${whole} × ${d}` }),
        nStep({ key: 'add', prompt: `Now add the ${n} extra: ${whole * d} + ${n} = ?`, hint: `${whole * d} + ${n} = ${top}.`,
          why: `Add the leftover pieces to get the total number of pieces — that becomes the new top. The bottom never changes.`,
          resultText: `${top} pieces altogether`, answer: top, lo: 1, hi: top + 12, expr: `${whole * d} + ${n}` }),
        buildStep({ key: 'write', prompt: `Write the improper fraction.`, hint: `${top}/${d}.`,
          why: `The bottom stays ${d} — you have only changed how you are counting, not the size of the pieces.`,
          longWay: `${whole} ${n}/${d}\n= (${whole} × ${d} + ${n})/${d}\n= ${top}/${d}`,
          resultText: `${whole} ${n}/${d} = ${top}/${d}`,
          pieces: [String(top), '/', String(d)], distractors: [String(whole), String(n), String(top + d)], isAnswer: true,
          check: (raw) => { const q = parseNumberList(String(raw).replace(/\//g, ' '));
            if (q.length < 2) return { correct: false, id: 'frac-form', ctx: { sn: top, sd: d } };
            if (q[0] === top && q[1] === d) return { correct: true };
            if (q[0] === d && q[1] === top) return { correct: false, id: 'frac-flip', ctx: { sn: top, sd: d } };
            return { correct: false, id: 'frac-form', ctx: { sn: top, sd: d } }; } }),
      ],
    };
  }
  function improperToMixed() {
    const d = rand(2, 9), whole = rand(2, 6), n = rand(1, d - 1);
    const top = whole * d + n;
    return {
      subject: 'fractions', sig: `im:${top}/${d}`, given: `Write  ${top}/${d}  as a mixed number`, answer: `${whole} ${n}/${d}`,
      steps: [
        nStep({ key: 'div', prompt: `How many whole ones fit in? ${top} ÷ ${d} = ? (just the whole part)`,
          hint: `${d} goes into ${top} ${whole} times (${whole} × ${d} = ${whole * d}).`,
          why: `${d} pieces make one whole, so divide to see how many whole ones you can make. The remainder is what is left over.`,
          resultText: `${whole} whole ones`, answer: whole, lo: 1, hi: whole + 8, expr: `${top} ÷ ${d}, whole part` }),
        nStep({ key: 'rem', prompt: `What is left over? ${top} − ${whole * d} = ?`, hint: `${top} − ${whole * d} = ${n}.`,
          why: `The remainder becomes the top of the fraction part.`,
          resultText: `${n} left over`, answer: n, lo: 0, hi: d + 4, expr: `${top} − ${whole * d}` }),
        buildStep({ key: 'write', prompt: `Write the mixed number: whole, then top, then bottom.`, hint: `${whole} ${n}/${d}.`,
          why: `${whole} whole ones and ${n} pieces of ${d} left over.`,
          longWay: `${top} ÷ ${d} = ${whole} remainder ${n}\nso ${top}/${d} = ${whole} ${n}/${d}`,
          resultText: `${top}/${d} = ${whole} ${n}/${d}`,
          pieces: [String(whole), String(n), '/', String(d)], distractors: [String(top), String(whole + n)], isAnswer: true,
          check: (raw) => { const q = parseNumberList(String(raw).replace(/\//g, ' '));
            if (q.length < 3) return { correct: false, id: 'mixed-form', ctx: { whole, n, d } };
            if (q[0] === whole && q[1] === n && q[2] === d) return { correct: true };
            return { correct: false, id: 'mixed-form', ctx: { whole, n, d } }; } }),
      ],
    };
  }

  // ============================================================ T4/T15 · one number as a fraction / % of another
  // Restricted to friendly fractions so it stays non-calculator (see percentChangeFind).
  const FRIENDLY = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80],
    [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 20, 5], [3, 20, 15], [1, 25, 4]];
  function partOfWhole(asPercent) {
    const f = pick(FRIENDLY), k = rand(2, 12);
    const whole = f[1] * k, part = f[0] * k;
    const g = gcd(part, whole), sn = part / g, sd = whole / g;
    const cf = common(factors(part), factors(whole));
    const ctx = pick([
      { s: `${part} of the ${whole} pupils in a year group wear glasses.`, q: 'wear glasses' },
      { s: `A team played ${whole} matches and won ${part} of them.`, q: 'were wins' },
      { s: `${part} of the ${whole} seats on a bus are taken.`, q: 'are taken' },
      { s: `A quiz had ${whole} questions and Ali got ${part} right.`, q: 'were right' },
    ]);
    const steps = [
      sStep({ key: 'frac', prompt: `Write it as a fraction first: what goes on TOP, and what goes on the BOTTOM?`,
        hint: `The part (${part}) goes on top, the whole (${whole}) on the bottom: ${part}/${whole}.`,
        why: `"What fraction of ${whole} is ${part}" means ${part} out of ${whole}. The TOTAL always goes on the bottom — swapping them is the usual mistake.`,
        resultText: `${part}/${whole}`, answer: `${part}/${whole}`,
        pool: shuffle([`${part}/${whole}`, `${whole}/${part}`, `${part}/${whole - part}`, `${whole - part}/${whole}`]),
        expr: `${part} out of ${whole}` }),
      nStep({ key: 'hcf', prompt: `Simplify ${part}/${whole}. What is the HCF of ${part} and ${whole}?`,
        hint: `Common factors: ${list(cf)} — the biggest is ${g}.`,
        why: `Divide top and bottom by their highest common factor to get the simplest form.`,
        resultText: `HCF = ${g}`, answer: g, pool: cf.length > 2 ? cf : numberPool(cf, 3, 2, Math.max(part, 12)),
        expr: `HCF of ${part} and ${whole}` }),
      sStep({ key: 'simp', prompt: `So ${part}/${whole} in its simplest form is?`,
        hint: `${part} ÷ ${g} = ${sn}, ${whole} ÷ ${g} = ${sd}, so ${sn}/${sd}.`,
        why: `Both numbers divide by ${g}.`,
        resultText: `${sn}/${sd}`, answer: `${sn}/${sd}`,
        pool: shuffle([...new Set([`${sn}/${sd}`, `${sd}/${sn}`, `${part}/${whole}`, `${sn}/${sd + 1}`])]),
        expr: `${part}/${whole} ÷ ${g}`, isAnswer: !asPercent }),
    ];
    if (asPercent) {
      steps.push(nStep({ key: 'pct', prompt: `Now turn ${sn}/${sd} into a percentage.`,
        hint: `${sn}/${sd} = ${f[2]}%.`,
        why: `Use the equivalents you know: 1/2 = 50%, 1/4 = 25%, 1/5 = 20%, 1/10 = 10%, 1/20 = 5%. Here ${sn}/${sd} = ${f[2]}%.`,
        longWay: `${part} out of ${whole} = ${part}/${whole}\nSimplify (÷${g}): ${sn}/${sd}\nAs a percentage: ${f[2]}%`,
        resultText: `${f[2]}%`, answer: f[2],
        pool: uniqSort([f[2], 100 - f[2], sd, f[2] * 2].filter((v) => v > 0 && v <= 100)),
        expr: `${sn}/${sd} as a percentage`, isAnswer: true }));
    }
    return {
      subject: asPercent ? 'percent' : 'fractions', sig: `${asPercent ? 'pow' : 'fow'}:${part}/${whole}`,
      given: `${ctx.s} What ${asPercent ? 'PERCENTAGE' : 'FRACTION'} ${ctx.q}?`,
      answer: asPercent ? `${f[2]}%` : `${sn}/${sd}`, steps,
    };
  }

  // ============================================================ T12 · metric unit conversion
  // Each entry: [small, big, howManySmallInOneBig]
  const LENGTH = [['mm', 'cm', 10], ['cm', 'm', 100], ['m', 'km', 1000], ['mm', 'm', 1000]];
  const MASS = [['g', 'kg', 1000], ['kg', 'tonne', 1000], ['mg', 'g', 1000]];
  const AREA = [['mm²', 'cm²', 100], ['cm²', 'm²', 10000]];
  const VOLUME = [['mm³', 'cm³', 1000], ['cm³', 'm³', 1000000], ['ml', 'litre', 1000]];

  function convert(kind) {
    const table = kind === 'area' ? AREA : kind === 'volume' ? VOLUME : kind === 'mass' ? MASS : LENGTH;
    const [small, big, k] = pick(table);
    const toSmall = Math.random() < 0.5;
    // keep the numbers tidy: a whole number of the big unit, or a 1–2 dp amount
    const wholeBig = rand(2, 9), tenths = Math.random() < 0.5 ? 0 : rand(1, 9);
    const bigScaled = wholeBig * 10 + tenths;                   // value in big units × 10
    const bigStr = dec(bigScaled, 1);
    const smallVal = (bigScaled * k) / 10;
    const smallStr = String(smallVal);
    const from = toSmall ? `${bigStr} ${big}` : `${smallStr} ${small}`;
    const to = toSmall ? small : big;
    const answer = toSmall ? smallStr : bigStr;
    const linear = kind === 'area' ? Math.sqrt(k) : kind === 'volume' && k !== 1000 ? Math.cbrt(k) : null;
    const whyScale = kind === 'area'
      ? `Careful — for AREA the numbers are squared. 1 ${big} is ${Math.round(Math.sqrt(k))} ${small.replace('²', '')} along each side, so it holds ${Math.round(Math.sqrt(k))} × ${Math.round(Math.sqrt(k))} = ${k} ${small}. Not ${Math.round(Math.sqrt(k))}.`
      : kind === 'volume' && k !== 1000
        ? `For VOLUME the numbers are cubed. 1 ${big} is ${Math.round(Math.cbrt(k))} ${small.replace('³', '')} along each edge, so it holds ${Math.round(Math.cbrt(k))}³ = ${k} ${small}.`
        : `There are ${k} ${small} in 1 ${big}.`;
    return {
      subject: 'measures', sig: `cv:${kind}:${small}:${big}:${toSmall ? 's' : 'b'}:${bigScaled}`,
      given: `Convert  ${from}  into ${to}`, answer: `${answer} ${to}`,
      steps: [
        sStep({ key: 'dir', prompt: `Are you going to a ${toSmall ? 'SMALLER' : 'BIGGER'} unit — so will the number get bigger or smaller?`,
          hint: `${toSmall ? 'Smaller units, so you need MORE of them — multiply.' : 'Bigger units, so you need FEWER of them — divide.'}`,
          why: `Think about what the unit means, not the rule. A ${small} is smaller than a ${big}, so the same length is MORE ${small} and FEWER ${big}. That tells you whether to multiply or divide, every time.`,
          resultText: toSmall ? `multiply` : `divide`, answer: toSmall ? 'multiply' : 'divide',
          pool: shuffle(['multiply', 'divide']), expr: `going to ${to}` }),
        nStep({ key: 'k', prompt: `How many ${small} are there in 1 ${big}?`, hint: `${k}.`,
          why: whyScale, resultText: `1 ${big} = ${k} ${small}`, answer: k,
          pool: uniqSort([k, k * 10, Math.max(1, Math.round(k / 10)), linear ? Math.round(linear) : k * 100]),
          expr: `${small} in a ${big}` }),
        sStep({ key: 'ans', prompt: `So ${from} = ${toSmall ? `${bigStr} × ${k}` : `${smallStr} ÷ ${k}`} = ? ${to}`,
          hint: `${answer} ${to}.`,
          why: `${toSmall ? 'Multiplying' : 'Dividing'} by ${k} moves the digits ${String(k).length - 1} place${String(k).length - 1 === 1 ? '' : 's'} ${toSmall ? 'left' : 'right'}.`,
          longWay: `1 ${big} = ${k} ${small}\n${from} = ${toSmall ? `${bigStr} × ${k}` : `${smallStr} ÷ ${k}`} = ${answer} ${to}`,
          resultText: `${from} = ${answer} ${to}`, answer,
          pool: shuffle([...new Set([answer,
            String(dec(bigScaled * k, 2)), String(dec(bigScaled * k, 0)),
            toSmall ? String(smallVal * 10) : dec(bigScaled, 0)])]).slice(0, 4),
          expr: `${from} in ${to}`, isAnswer: true }),
      ],
    };
  }

  const api = { powerRoot, spotSquares, mixedToImproper, improperToMixed, partOfWhole, convert };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
