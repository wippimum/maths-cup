/* problems.js — build problems for each World Cup round, plus worksheet samples
   and football story problems. Every problem carries its own vertical steps. */
(function (root) {
  const W = root.WAC || require('./steps.js');
  const { Fraction, fmtN, side, typeASteps, typeBSteps, warmupSteps } = W;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const nz = (min, max) => { let v = 0; while (v === 0) v = rand(min, max); return v; };
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

  // ---- problem constructors ----
  function problemWarm(b, c, story) {
    return { subject: 'algebra', type: 'warmup', given: `${side(1, b)} = ${fmtN(c)}`,
      answer: new Fraction(c - b, 1), steps: warmupSteps(b, c), story: story || null };
  }
  function problemA(a, b, c, story) {
    return { subject: 'algebra', type: 'A', given: `${side(a, b)} = ${fmtN(c)}`,
      answer: new Fraction(c - b, a), steps: typeASteps(a, b, c), story: story || null };
  }
  function problemB(a, b, c, d, story) {
    return { subject: 'algebra', type: 'B', given: `${side(a, b)} = ${side(c, d)}`,
      answer: new Fraction(d - b, a - c), steps: typeBSteps(a, b, c, d), story: story || null };
  }

  // ---- worksheet samples (so the app shows the real ones too) ----
  const SAMPLE_A = [[5, 3, 7], [9, 6, 10], [72, -32, 144], [63, -12, 22]];
  const SAMPLE_B = [[10, -2, 3, 5], [60, 12, 22, -3], [33, -10, 2, 3], [32, 3, -2, 7]];

  // ---- football story problems (whole-number answers only) ----
  const STORY_BANK = [
    () => problemA(3, 2, 14, 'A striker scores x goals in each of 3 group matches, then 2 more in a friendly — 14 goals in total. Goals per group match?'),
    () => problemA(2, 2, 12, 'A player runs x km each half plus 2 km in extra time, 12 km total. How far per half?'),
    () => problemB(4, 1, 2, 7, "Team A has scored 4x + 1 goals this tournament; Team B has scored 2x + 7. They're level. Find x."),
    () => problemWarm(5, 50, 'A stadium has x rows of seats. Add 5 VIP seats and it holds 50. How many rows?'),
  ];
  function randomStory() {
    // build a fresh whole-answer story
    if (Math.random() < 0.5) {
      const w = rand(2, 9), m = rand(2, 5), p = rand(1, 6), c = m * w + p;
      const kits = ['group match', 'training drill', 'penalty round'];
      return problemA(m, p, c, `A player scores x goals in each of ${m} ${pick(kits)}s, then ${p} more, ${c} in total. Goals each time?`);
    }
    const w = rand(2, 8), a = rand(3, 6), cc = rand(1, a - 1), b = rand(1, 6), d = b + (a - cc) * w;
    return problemB(a, b, cc, d, `Team A has ${side(a, b)} points; Team B has ${side(cc, d)}. They're level. Find x.`);
  }

  // ---- per-round random generators ----
  // Type A from a chosen numerator N = c - b so we control the answer exactly.
  function genA(Nmin, Nmax, allowNegConst) {
    const a = rand(2, 9);
    const N = nz(Nmin, Nmax);
    const b = allowNegConst ? nz(-12, 12) : rand(1, 12);
    return problemA(a, b, b + N);
  }
  function genWarm() {
    const answer = rand(1, 12), b = nz(-10, 10);
    return problemWarm(b, answer + b);
  }
  function genB(negs) {
    const k = negs ? nz(-8, 8) : rand(2, 9);
    const c = negs ? nz(-6, 6) : rand(1, 8);
    const a = c + k;
    if (a === 0) return genB(negs);        // avoid 0x on the left
    const R = nz(-15, 15);
    const b = negs ? nz(-12, 12) : rand(1, 12);
    const d = b + R;
    if (d === 0) return genB(negs);        // keep a real number on the right
    return problemB(a, b, c, d);
  }

  const ROUNDS = [
    { id: 'warmup', name: 'Friendly (Warm-up)', badge: '🤝',
      generate: () => Math.random() < 0.35 ? problemWarm(...pickWarmSample()) : genWarm() },
    { id: 'group', name: 'Group Stage', badge: '⚽',
      generate: () => Math.random() < 0.4 ? problemA(...pick(SAMPLE_A)) : genA(1, 20, false) },
    { id: 'r16', name: 'Round of 16', badge: '🥅',
      generate: () => genA(-20, -1, true) },
    { id: 'qf', name: 'Quarter-final', badge: '🏟️',
      generate: () => Math.random() < 0.4 ? problemB(...pick(SAMPLE_B)) : genB(false) },
    { id: 'sf', name: 'Semi-final / Final', badge: '🏆',
      generate: () => Math.random() < 0.5 ? genA(-20, 20, true) : genB(true) },
  ];
  function pickWarmSample() {
    const answer = rand(2, 9), b = nz(-8, 8);
    return [b, answer + b];
  }

  function roundById(id) { return ROUNDS.find(r => r.id === id) || ROUNDS[1]; }

  // ===================== other subjects =====================
  const T = W; // topics live on the same WAC object

  // ---- HCF ----
  const HCF_WARM = [[10, 15], [12, 18], [14, 21], [9, 15], [8, 12], [6, 9]];
  const HCF_MAIN = [[4, 14], [6, 9], [9, 21], [8, 12], [30, 45], [40, 60], [28, 63], [24, 36], [16, 28], [18, 45]];
  const HCF_BIG = [[48, 72], [36, 60], [24, 64], [45, 60], [42, 56], [40, 72], [39, 65]];
  const genPair = (lo, hi) => { let a = rand(lo, hi), b = rand(lo, hi); while (a === b) b = rand(lo, hi); return [a, b]; };
  function hcfStory() {
    const bank = [
      () => T.hcfProblem(36, 45, 'Alannah has ribbons 36 cm and 45 cm long. She cuts them into equal shorter lengths with none left over. What is the longest each piece can be?'),
      () => T.hcfProblem(24, 40, 'A baker has 24 muffins and 40 cookies. She makes identical treat bags using them all. What is the greatest number of bags?'),
    ];
    return pick(bank)();
  }

  // ---- LCM ----
  const LCM_WARM = [[2, 3], [4, 5], [2, 5], [3, 4], [6, 8], [4, 6]];
  const LCM_MAIN = [[5, 6], [3, 8], [4, 10], [5, 8], [6, 8], [9, 12], [12, 20], [8, 12], [10, 15], [6, 15]];
  const okLcm = (a, b) => { const L = W.lcm(a, b); return L / a <= 8 && L / b <= 8; };
  function genLcmPair(lo, hi) { let p; let g = 0; do { p = genPair(lo, hi); g++; } while (!okLcm(p[0], p[1]) && g < 40); return p; }
  function lcmStory() {
    const bank = [
      () => T.lcmProblem(8, 6, 'A toad croaks every 8 seconds and a frog every 6 seconds. They croak together now — after how many seconds will they next croak together?'),
      () => T.lcmProblem(12, 18, 'A bus leaves every 12 minutes and a train every 18 minutes. They leave together at 8am — after how many minutes do they next leave together?'),
      () => T.lcmProblem(6, 15, 'A red light flashes every 6 seconds and a green light every 15 seconds. They flash together now — after how many seconds do they next flash together?'),
    ];
    return pick(bank)();
  }

  // ---- Primes ----
  const genComposite = (lo, hi) => { let n; do { n = rand(lo, hi); } while (W.isPrime(n)); return n; };
  function primeHuntSet() {
    const nums = new Set();
    while (nums.size < 6) nums.add(rand(2, 30));
    return T.primeHuntProblem([...nums].sort((a, b) => a - b));
  }

  // ---- Ratio ----
  function genRatioSimplify() {
    const h = rand(2, 6);
    let sa = rand(1, 6), sb = rand(1, 6), g = 0;
    while ((sa === sb || W.gcd(sa, sb) !== 1) && g++ < 30) { sa = rand(1, 6); sb = rand(1, 6); }
    return T.ratioSimplifyProblem(h * sa, h * sb);
  }
  function genRatioShare() {
    const a = rand(1, 5), b = rand(1, 5), per = rand(2, 9), unit = Math.random() < 0.5 ? '£' : '';
    return T.ratioShareProblem((a + b) * per, a, b, unit);
  }

  // ---- Decimals ----
  function genDecPower() {
    const dp = Math.random() < 0.5 ? 1 : 2;
    const dec = T._randDec(dp, 1, 60);
    const mult = pick([10, 100, 1000]);
    const op = Math.random() < 0.5 ? 'x' : '/';
    return T.decPowerProblem(dec, mult, op);
  }
  function genDecAddSub() {
    const sub = Math.random() < 0.5;
    let a = T._randDec(Math.random() < 0.5 ? 1 : 2, 2, 40);
    let b = T._randDec(Math.random() < 0.5 ? 1 : 2, 1, 20);
    if (sub && Number(a) < Number(b)) { const t = a; a = b; b = t; }
    return T.decAddSubProblem(a, b, sub);
  }

  // ---- Percentages ----
  function genPercent() {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 75]);
    const A = 20 * rand(2, 12);          // multiple of 20 so 5% is whole
    const unit = Math.random() < 0.5 ? '£' : '';
    return T.percentOfProblem(p, A, unit);
  }

  // ---- Fractions ----
  function genFracSimplify() { const h = rand(2, 6); let sn = rand(1, 5), sd = rand(2, 6), g = 0; while ((sn >= sd || W.gcd(sn, sd) !== 1) && g++ < 40) { sn = rand(1, 5); sd = rand(2, 6); } return T.fracSimplify(h * sn, h * sd); }
  function genFracOfAmount() { const den = rand(2, 6), num = rand(1, den - 1), per = rand(2, 9); return T.fracOfAmount(num, den, den * per); }
  function genFracAddSame() { const d = rand(3, 8); let a = rand(1, d - 1), b = rand(1, d - 1); const sub = Math.random() < 0.5; if (sub && a < b) { const t = a; a = b; b = t; } if (sub && a === b) a = Math.min(d - 1, a + 1); return T.fracAdd(a, d, b, d, sub); }
  function genFracAddDiff() { let d1, d2, g = 0; do { d1 = rand(2, 6); d2 = rand(2, 6); } while ((d1 === d2 || W.lcm(d1, d2) > 24) && g++ < 40); let a = rand(1, d1 - 1), b = rand(1, d2 - 1); const sub = Math.random() < 0.55; if (sub) { const L = W.lcm(d1, d2); if (a * (L / d1) < b * (L / d2)) { const ta = a, td = d1; a = b; d1 = d2; b = ta; d2 = td; } } return T.fracAdd(a, d1, b, d2, sub); }

  // ---- Statistics ----
  function genData(nmin, nmax, lo, hi) { const n = rand(nmin, nmax), out = []; for (let i = 0; i < n; i++) out.push(rand(lo, hi)); return out; }
  function genStatMode() { const mode = rand(2, 12), k = rand(3, 4), out = [mode, mode, mode], used = new Set([mode]); while (out.length < 3 + k) { const v = rand(1, 14); if (!used.has(v)) { used.add(v); out.push(v); } } return T.statMode(shuffle(out)); }
  function genStatRange() { return T.statRange(genData(5, 6, 1, 20)); }
  function genStatMean() { const n = rand(3, 5), mean = rand(3, 9); let vals, g = 0; do { vals = []; let s = 0; for (let i = 0; i < n - 1; i++) { const v = rand(1, 2 * mean); vals.push(v); s += v; } vals.push(mean * n - s); } while ((vals[vals.length - 1] < 1 || vals[vals.length - 1] > 2 * mean + 3) && g++ < 80); return T.statMean(vals); }
  function genStatMedian() { const out = [], used = new Set(); while (out.length < 5) { const v = rand(1, 20); if (!used.has(v)) { used.add(v); out.push(v); } } return T.statMedian(out); }

  // ---- Rounding ----
  function genRoundNearest() { const place = pick([10, 100, 1000]); let n; if (place === 10) n = rand(11, 999); else if (place === 100) n = rand(150, 9990); else n = rand(1200, 79000); return T.roundNearest(n, place); }
  function genRoundDP() { const dp = Math.random() < 0.5 ? 1 : 2; const whole = rand(0, 30); let f = ''; for (let i = 0; i <= dp; i++) f += rand(0, 9); return T.roundDP(`${whole}.${f}`, dp); }

  // ---- Integers ----
  function genNegAddSub() { const r = rand(1, 4); if (r === 1) return T.negAddSub(rand(-9, -1), rand(2, 9), false); if (r === 2) return T.negAddSub(rand(1, 9), rand(3, 12), true); if (r === 3) return T.negAddSub(rand(-9, -1), rand(2, 9), true); return T.negAddSub(rand(1, 9), -rand(2, 9), true); }
  function genNegMulDiv() { if (Math.random() < 0.5) { let a = nz(-9, 9), b = nz(-9, 9); if (a > 0 && b > 0 && Math.random() < 0.7) a = -a; return T.negMulDiv(a, b, false); } const b = nz(2, 9) * (Math.random() < 0.5 ? -1 : 1), q = nz(-9, 9); return T.negMulDiv(b * q, b, true); }

  // ---- FDP ----
  function genFdpFromFraction() { const den = pick([2, 4, 5, 10, 20, 25]); const num = rand(1, den - 1); return T.fdpFromFraction(num, den); }
  function genFdpPercentToFraction() { return T.fdpPercentToFraction(pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80])); }

  // ---- Numeracy ----
  function genPlaceValue() { return T.placeValue(rand(1000, 99999)); }
  function genOrdering() { const k = rand(4, 5), base = pick([100, 1000]), out = [], used = new Set(); while (out.length < k) { const v = rand(base, base * 10 - 1); if (!used.has(v)) { used.add(v); out.push(v); } } return T.ordering(out, Math.random() < 0.4); }

  // ---- Angles ----
  function genAngleMissing() { return Math.random() < 0.5 ? T.angleOnLine() : T.angleAroundPoint(); }

  // ---- Perimeter & Area ----
  function genRect() { let L = rand(3, 12), Wd = rand(2, 10); if (L === Wd) Wd = Wd === 10 ? 9 : Wd + 1; return Math.random() < 0.5 ? T.rectArea(L, Wd) : T.rectPerimeter(L, Wd); }
  function genTri() { let b = rand(3, 12), h = rand(2, 10); if ((b * h) % 2 !== 0) h += 1; return T.triArea(b, h); }

  // ---- Volume ----
  function genCuboid() { return T.cuboidVolume(rand(2, 6), rand(2, 5), rand(2, 6)); }
  function genSolidCount() { return T.solidCount(pick(T.SOLIDS), pick(['faces', 'edges', 'vertices'])); }

  // ---- Coordinates (upgraded: brackets mandated, negatives, complete-the-figure) ----
  function genReadCoord() { return T.readCoordinate(rand(1, 6), rand(1, 6), 0, 6); }
  function genReadCoordNeg() { let x = nz(-4, 4), y = nz(-4, 4); return T.readCoordinate(x, y, -5, 5); }
  function genReflect() { return T.reflectPoint(nz(-4, 4), nz(-4, 4), Math.random() < 0.5 ? 'x' : 'y'); }
  function genComplete() {
    const square = Math.random() < 0.5;
    const x1 = rand(0, 3), y1 = rand(0, 3), side = rand(2, 3);
    const x2 = x1 + side, y2 = square ? y1 + side : y1 + rand(2, 4);
    return T.completeFigure(x1, y1, x2, Math.min(y2, 7), rand(0, 3), square);
  }

  // ---- Geometry facts ----
  function genGeomFact() { return T.geometryFact(pick(T.FACTS)); }

  // ---- Data & graphs ----
  const BAR_CATS = [['Mon', 'Tue', 'Wed', 'Thu'], ['Red', 'Blue', 'Green', 'Gold'], ['Cats', 'Dogs', 'Fish', 'Birds'], ['A', 'B', 'C', 'D']];
  function genBarVals(k) { const out = []; const used = new Set(); while (out.length < k) { const v = rand(1, 9); out.push(v); used.add(v); } return out; }
  function genBar() { const cats = pick(BAR_CATS), vals = genBarVals(cats.length); return Math.random() < 0.5 ? T.barRead(cats, vals) : T.barDiff(cats, vals); }

  // ---- Primes (rebuilt, Foundation-aligned) ----
  const TWO_BANK = [[3, 5], [3, 7], [2, 11], [5, 7], [3, 13], [3, 11], [2, 13], [2, 7], [2, 5], [5, 11], [5, 13], [2, 17]];
  const INDEX_BANK = [12, 18, 20, 24, 28, 36, 40, 44, 45, 48, 50, 63, 72, 98];
  const HL_BANK = [[12, 18], [12, 8], [20, 30], [24, 36], [18, 24], [16, 24], [45, 75], [30, 45], [28, 42], [36, 60]];
  function genPrimeHunt() { if (Math.random() < 0.5) { const s = new Set(); while (s.size < 6) s.add(rand(2, 30)); return T.primeHunt([...s].sort((a, b) => a - b)); } const lo = pick([10, 20, 30, 40, 50, 60, 80]); return T.primeHuntRange(lo, lo + 14); }
  function genTwoPrimes() { const pr = pick(TWO_BANK); return T.twoPrimes(pr[0], pr[1]); }

  // ===================== subject menu =====================
  const ALG_LEVELS = ROUNDS.map((r) => ({
    id: r.id, name: r.name, badge: r.badge,
    generate() {
      const useStory = (r.id === 'warmup' || r.id === 'group' || r.id === 'qf') && Math.random() < 0.25;
      if (useStory) return Math.random() < 0.5 ? pick(STORY_BANK)() : randomStory();
      return r.generate();
    },
  }));

  const SUBJECTS = [
    { id: 'algebra', name: 'Equation World Cup', icon: '⚽', blurb: 'Solve linear equations, move-and-flip.', levels: ALG_LEVELS },
    { id: 'hcf', name: 'HCF — Highest Common Factor', icon: '🔵', blurb: 'List factors, find the biggest shared one.', levels: [
      { id: 'hcf-warm', name: 'Warm-up', badge: '🤝', generate: () => T.hcfProblem(...pick(HCF_WARM)) },
      { id: 'hcf-main', name: 'Main', badge: '🔵', generate: () => Math.random() < 0.5 ? T.hcfProblem(...pick(HCF_MAIN)) : T.hcfProblem(...genPair(10, 40)) },
      { id: 'hcf-pro', name: 'Challenge', badge: '🏆', generate: () => Math.random() < 0.3 ? hcfStory() : T.hcfProblem(...pick(HCF_BIG)) },
    ] },
    { id: 'lcm', name: 'LCM — Lowest Common Multiple', icon: '🟢', blurb: 'List multiples, find the smallest shared one.', levels: [
      { id: 'lcm-warm', name: 'Warm-up', badge: '🤝', generate: () => T.lcmProblem(...pick(LCM_WARM)) },
      { id: 'lcm-main', name: 'Main', badge: '🟢', generate: () => Math.random() < 0.5 ? T.lcmProblem(...pick(LCM_MAIN)) : T.lcmProblem(...genLcmPair(3, 12)) },
      { id: 'lcm-pro', name: 'Challenge', badge: '🏆', generate: () => Math.random() < 0.4 ? lcmStory() : T.lcmProblem(...genLcmPair(4, 15)) },
    ] },
    { id: 'primes', name: 'Prime Numbers', icon: '🔢', blurb: 'Spot primes, factor trees, index form.', levels: [
      { id: 'prime-spot', name: 'Is it prime?', badge: '🕵️', generate: () => T.isItPrime(rand(2, 40)) },
      { id: 'prime-hunt', name: 'Prime hunt', badge: '🎯', generate: () => genPrimeHunt() },
      { id: 'prime-two', name: 'Two prime factors', badge: '✖️', generate: () => genTwoPrimes() },
      { id: 'prime-index', name: 'Factor tree (index form)', badge: '🌳', generate: () => T.factorIndex(pick(INDEX_BANK)) },
      { id: 'prime-square', name: 'Make a square ⭐ (beyond Y7)', badge: '⭐', generate: () => T.makeSquare(pick(T.SQUARE_BANK)) },
      { id: 'prime-hcflcm', name: 'HCF & LCM by primes ⭐ (beyond Y7)', badge: '⭐', generate: () => { const p = pick(HL_BANK); return T.hcfLcmByPrimes(p[0], p[1]); } },
    ] },
    { id: 'ratio', name: 'Ratio', icon: '⚖️', blurb: 'Simplify ratios and share amounts.', levels: [
      { id: 'ratio-simplify', name: 'Simplify', badge: '➗', generate: () => genRatioSimplify() },
      { id: 'ratio-share', name: 'Share an amount', badge: '🤝', generate: () => genRatioShare() },
    ] },
    { id: 'decimals', name: 'Decimals', icon: '🔟', blurb: '× and ÷ by 10/100/1000, add and subtract.', levels: [
      { id: 'dec-power', name: '× and ÷ by 10, 100, 1000', badge: '📍', generate: () => genDecPower() },
      { id: 'dec-addsub', name: 'Add & subtract', badge: '➕', generate: () => genDecAddSub() },
    ] },
    { id: 'percent', name: 'Percentages', icon: '％', blurb: 'Find a percentage of an amount.', levels: [
      { id: 'pc-of', name: '% of an amount', badge: '％', generate: () => genPercent() },
    ] },
    { id: 'fractions', name: 'Fractions', icon: '½', blurb: 'Simplify, add & subtract, fraction of an amount.', levels: [
      { id: 'frac-simplify', name: 'Simplify', badge: '➗', generate: () => genFracSimplify() },
      { id: 'frac-of', name: 'Fraction of an amount', badge: '½', generate: () => genFracOfAmount() },
      { id: 'frac-add', name: 'Add & subtract', badge: '➕', generate: () => Math.random() < 0.4 ? genFracAddSame() : genFracAddDiff() },
    ] },
    { id: 'integers', name: 'Integers (negatives)', icon: '±', blurb: 'Add, subtract, multiply & divide negatives.', levels: [
      { id: 'int-addsub', name: 'Add & subtract', badge: '±', generate: () => genNegAddSub() },
      { id: 'int-muldiv', name: 'Multiply & divide', badge: '✖️', generate: () => genNegMulDiv() },
    ] },
    // Order of operations used to be one thin level under Integers (a + b × c, and
    // nothing else). It's the hard part of school Topic 2, so it's its own ladder now.
    { id: 'bidmas', name: 'BIDMAS — order of operations', icon: '🧮', blurb: 'Which part of the sum do you do first?', levels: [
      { id: 'bid-spot', name: 'Which part first?', badge: '🔍', generate: () => T.bidmasSpot() },
      { id: 'bid-md', name: '× and ÷ before + and −', badge: '✖️', generate: () => T.bidmasMD() },
      { id: 'bid-brackets', name: 'Brackets first', badge: '🔵', generate: () => T.bidmasBrackets() },
      { id: 'bid-lr', name: 'Left to right', badge: '➡️', generate: () => T.bidmasLR() },
      { id: 'bid-indices', name: 'Powers (indices)', badge: '²', generate: () => T.bidmasIndices() },
      { id: 'bid-mix', name: 'Full BIDMAS 🏆', badge: '🏆', generate: () => T.bidmasMix() },
    ] },
    { id: 'rounding', name: 'Rounding', icon: '≈', blurb: 'Round whole numbers and decimals.', levels: [
      { id: 'round-nearest', name: 'Nearest 10 / 100 / 1000', badge: '🎯', generate: () => genRoundNearest() },
      { id: 'round-dp', name: 'Decimal places', badge: '📍', generate: () => genRoundDP() },
    ] },
    { id: 'stats', name: 'Statistics', icon: '📊', blurb: 'Mean, median, mode and range.', levels: [
      { id: 'stat-modrange', name: 'Mode & range', badge: '📊', generate: () => Math.random() < 0.5 ? genStatMode() : genStatRange() },
      { id: 'stat-mean', name: 'Mean', badge: '➗', generate: () => genStatMean() },
      { id: 'stat-median', name: 'Median', badge: '🔽', generate: () => genStatMedian() },
    ] },
    { id: 'fdp', name: 'Fractions, Decimals & %', icon: '🔗', blurb: 'Convert between fractions, decimals and %.', levels: [
      { id: 'fdp-fd', name: 'Fraction → decimal → %', badge: '➡️', generate: () => genFdpFromFraction() },
      { id: 'fdp-pf', name: '% → fraction', badge: '½', generate: () => genFdpPercentToFraction() },
    ] },
    { id: 'numeracy', name: 'Place value & ordering', icon: '#️⃣', blurb: 'Digit values and putting numbers in order.', levels: [
      { id: 'num-pv', name: 'Place value', badge: '🔢', generate: () => genPlaceValue() },
      { id: 'num-order', name: 'Ordering numbers', badge: '🔽', generate: () => genOrdering() },
    ] },
    { id: 'angles', name: 'Angles', icon: '📐', blurb: 'Missing angles on lines, points and triangles.', levels: [
      { id: 'ang-missing', name: 'On a line / around a point', badge: '📏', generate: () => genAngleMissing() },
      { id: 'ang-tri', name: 'Triangles', badge: '🔺', generate: () => T.angleTriangle() },
    ] },
    { id: 'area', name: 'Perimeter & Area', icon: '🟩', blurb: 'Area & perimeter of rectangles and triangles.', levels: [
      { id: 'area-rect', name: 'Rectangles', badge: '🟩', generate: () => genRect() },
      { id: 'area-tri', name: 'Triangle area', badge: '🔺', generate: () => genTri() },
    ] },
    { id: 'volume', name: '3D Shapes & Volume', icon: '🧊', blurb: 'Volume of cuboids; faces, edges & vertices.', levels: [
      { id: 'vol-cuboid', name: 'Volume of a cuboid', badge: '🧊', generate: () => genCuboid() },
      { id: 'vol-fev', name: 'Faces, edges & vertices', badge: '🔷', generate: () => genSolidCount() },
    ] },
    { id: 'coords', name: 'Coordinates', icon: '📍', blurb: 'Read, reflect & complete shapes (incl. negatives).', levels: [
      { id: 'co-read', name: 'Read coordinates', badge: '📍', generate: () => genReadCoord() },
      { id: 'co-read-neg', name: 'Read (with negatives)', badge: '➖', generate: () => genReadCoordNeg() },
      { id: 'co-reflect', name: 'Reflect a point', badge: '🪞', generate: () => genReflect() },
      { id: 'co-complete', name: 'Complete the figure', badge: '⬜', generate: () => genComplete() },
    ] },
    { id: 'geometry', name: 'Shape Facts', icon: '🔷', blurb: 'Sides, angles and properties of shapes.', levels: [
      { id: 'geo-facts', name: 'Shape facts', badge: '🔷', generate: () => genGeomFact() },
    ] },
    { id: 'graphs', name: 'Data & Graphs', icon: '📈', blurb: 'Read bar charts and answer questions.', levels: [
      { id: 'gr-bar', name: 'Bar charts', badge: '📊', generate: () => genBar() },
    ] },
    { id: 'solve', name: 'Problem Solving', icon: '🧩', blurb: '10 problems, easy → hard, in tiny steps.', levels: [
      { id: 'solve-easy', name: 'Warm-up (easier)', badge: '🌱', generate: () => T.solveRandom() },
      { id: 'solve-lesson', name: 'Lesson (easy → hard)', badge: '🧩', generate: () => T.solveRandom() },
      { id: 'solve-hard', name: 'Challenge (harder)', badge: '🔥', generate: () => T.solveRandom() },
    ] },
  ];
  function subjectById(id) { return SUBJECTS.find((s) => s.id === id) || SUBJECTS[0]; }
  function levelOf(subjectId, levelId) {
    const s = subjectById(subjectId);
    return s.levels.find((l) => l.id === levelId) || s.levels[0];
  }

  // Unified match builder: works for every subject, dedupes within the match.
  function buildMatchFor(subjectId, levelId, n) {
    // Problem Solving is a graded LESSON: 10 problems ramping easy → hard, in order.
    if (subjectId === 'solve') return T.buildSolveLesson(levelId, n || 10);
    const lvl = levelOf(subjectId, levelId);
    const out = [], seen = new Set(), count = n || 10;
    for (let i = 0; i < count; i++) {
      let p, tries = 0;
      do { p = lvl.generate(); tries++; } while (seen.has(p.sig || p.given) && tries < 60);
      seen.add(p.sig || p.given);
      out.push(p);
    }
    return out;
  }

  // Build the problems for "Today's Match" (default 10). Sprinkle a whole-answer
  // story on lower rounds (only when it stays whole).
  function buildMatch(roundId, n) {
    const round = roundById(id2(roundId));
    const out = [];
    const seen = new Set();          // no repeated equation within the same match
    const count = n || 10;
    for (let i = 0; i < count; i++) {
      let p, tries = 0;
      do {
        const useStory = (roundId === 'warmup' || roundId === 'group' || roundId === 'qf')
          && Math.random() < 0.25;
        p = useStory ? (Math.random() < 0.5 ? pick(STORY_BANK)() : randomStory()) : round.generate();
        tries++;
      } while (seen.has(p.given) && tries < 60);
      seen.add(p.given);
      out.push(p);
    }
    return out;
  }
  function id2(x) { return x; }

  const api = { ROUNDS, roundById, buildMatch, problemA, problemB, problemWarm, STORY_BANK, randomStory,
    SUBJECTS, subjectById, levelOf, buildMatchFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
