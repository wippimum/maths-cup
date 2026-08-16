/* problems.js — build problems for each World Cup round, plus worksheet samples
   and football story problems. Every problem carries its own vertical steps. */
(function (root) {
  const W = root.WAC || require('./steps.js');
  const { Fraction, fmtN, side, typeASteps, typeBSteps, warmupSteps, bracketSteps } = W;

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
  // a(x + b) = c — the bracket has to be expanded before anything else moves.
  function problemC(a, b, c, story) {
    return { subject: 'algebra', type: 'C', given: `${a}(${side(1, b)}) = ${fmtN(c)}`,
      answer: new Fraction(c - a * b, a), steps: bracketSteps(a, b, c), story: story || null };
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

  // a(x + b) = c with a whole-number answer.
  function genBracket(hard) {
    const a = rand(2, hard ? 8 : 5);
    const b = hard ? nz(-9, 9) : nz(-6, 6);
    const ans = hard ? nz(-8, 12) : rand(1, 12);
    return problemC(a, b, a * (ans + b));
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
    { id: 'sf', name: 'Semi-final', badge: '🥈',
      generate: () => Math.random() < 0.5 ? genA(-20, 20, true) : genB(true) },
    // Brackets — the first thing Y7 meets that the earlier rounds don't prepare you for.
    { id: 'final', name: 'The Final 🏆', badge: '🏆',
      generate: () => Math.random() < 0.55 ? genBracket(true) : genB(true) },
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
  // Bars must differ: "how many more?" needs a gap of at least 2, and equal bars
  // collapse the option cards down to a single choice.
  function genBarVals(k) {
    let out, guard = 0;
    do { out = []; for (let i = 0; i < k; i++) out.push(rand(1, 9)); guard++; }
    while (guard < 60 && (new Set(out).size < 3 || Math.max(...out) - Math.min(...out) < 2));
    return out;
  }
  function genBar() { const cats = pick(BAR_CATS), vals = genBarVals(cats.length); return Math.random() < 0.5 ? T.barRead(cats, vals) : T.barDiff(cats, vals); }

  // ---- Primes (rebuilt, Foundation-aligned) ----
  const TWO_BANK = [[3, 5], [3, 7], [2, 11], [5, 7], [3, 13], [3, 11], [2, 13], [2, 7], [2, 5], [5, 11], [5, 13], [2, 17]];
  const INDEX_BANK = [12, 18, 20, 24, 28, 36, 40, 44, 45, 48, 50, 63, 72, 98];
  const HL_BANK = [[12, 18], [12, 8], [20, 30], [24, 36], [18, 24], [16, 24], [45, 75], [30, 45], [28, 42], [36, 60]];
  // A random six-number set can happen to contain no primes at all, which leaves the
  // child with nothing to tap and an empty answer. Seed two primes, then fill up.
  function genPrimeHunt() {
    if (Math.random() < 0.5) {
      // ...and an all-prime set makes "tap them all" correct, so there must be
      // non-primes in there too or the question teaches nothing.
      const primes = W.primesUpTo(30), s = new Set();
      while (s.size < 2) s.add(pick(primes));
      while (s.size < 4) { const v = rand(4, 30); if (!W.isPrime(v)) s.add(v); }
      while (s.size < 6) s.add(rand(2, 30));
      return T.primeHunt([...s].sort((a, b) => a - b));
    }
    const lo = pick([10, 20, 30, 40, 50, 60, 80]);
    return T.primeHuntRange(lo, lo + 14);
  }
  function genTwoPrimes() { const pr = pick(TWO_BANK); return T.twoPrimes(pr[0], pr[1]); }

  // ===================== CHALLENGE generators (level 3 of each ladder) =====================
  // These are the Y7-and-beyond rungs. The old levels stay as levels 1 and 2.

  // ---- HCF / LCM with three numbers ----
  const HCF3_BANK = [[12, 18, 24], [16, 24, 40], [18, 27, 45], [20, 30, 50], [24, 36, 60],
    [15, 25, 40], [28, 42, 70], [36, 54, 72], [30, 45, 75], [32, 48, 80], [21, 35, 56], [44, 66, 88]];
  const LCM3_BANK = [[2, 3, 4], [3, 4, 6], [2, 4, 5], [4, 6, 8], [2, 3, 5], [3, 5, 6], [4, 5, 10],
    [6, 8, 12], [2, 5, 6], [3, 4, 8], [5, 6, 10], [4, 9, 12], [6, 9, 12], [3, 8, 12], [2, 6, 9], [6, 10, 15]];
  const HCF3_STORIES = [
    () => T.hcf3(24, 36, 60, 'A caterer has 24 samosas, 36 spring rolls and 60 falafels. She makes identical platters using every single item. What is the greatest number of platters she can make?'),
    () => T.hcf3(18, 27, 45, 'Three ribbons are 18 cm, 27 cm and 45 cm long. They are cut into equal pieces with none left over. What is the longest each piece can be?'),
  ];
  const LCM3_STORIES = [
    () => T.lcm3(4, 6, 8, 'Three lighthouses flash every 4, 6 and 8 seconds. They flash together now — after how many seconds do all three flash together again?'),
    () => T.lcm3(3, 5, 6, 'Buses to three towns leave every 3, 5 and 6 minutes. They all leave at 9:00 — after how many minutes do all three leave together again?'),
  ];
  function genHcf3() { return Math.random() < 0.3 ? pick(HCF3_STORIES)() : T.hcf3(...pick(HCF3_BANK)); }
  function genLcm3() { return Math.random() < 0.3 ? pick(LCM3_STORIES)() : T.lcm3(...pick(LCM3_BANK)); }

  // ---- Ratio ----
  const RATIO3_BANK = [[1, 2, 3], [2, 3, 5], [1, 3, 4], [2, 2, 3], [1, 2, 4], [3, 4, 5], [1, 1, 2], [2, 3, 4], [1, 4, 5], [2, 5, 8]];
  const THINGS = ['Sweets', 'Stickers', 'Marbles', 'The prize money', 'The tokens'];
  const PAIRS = [['Red counters', 'Blue counters'], ['Boys', 'Girls'], ['Cats', 'Dogs'], ['Apples', 'Oranges'], ['Wins', 'Losses']];
  function genRatioHard() {
    const r = rand(1, 3);
    if (r === 1) {
      const p = pick(RATIO3_BANK), one = rand(3, 15) * (Math.random() < 0.5 ? 1 : 2);
      const total = (p[0] + p[1] + p[2]) * one;
      return T.ratio3(total, p[0], p[1], p[2], Math.random() < 0.5 ? '£' : '');
    }
    if (r === 2) {
      let a = rand(1, 6), b = rand(1, 8);
      if (a === b) b = a + 1;
      return T.ratioDifference(a, b, rand(3, 15), Math.random() < 0.5 ? '£' : '', pick(THINGS));
    }
    let a = rand(2, 7), b = rand(2, 9);
    if (a === b) b = a + 1;
    return T.ratioOnePart(a, b, rand(3, 12), pick(PAIRS));
  }

  // ---- Decimals: × and ÷ a decimal ----
  function genDecMulDiv() {
    if (Math.random() < 0.55) {
      const one = Math.random() < 0.5;
      const x = one ? T._randDec(1, 0, 9) : T._randDec(1, 1, 12);
      const y = Math.random() < 0.4 ? String(rand(3, 19)) : T._randDec(1, 0, 9);
      if (Number(x) === 0 || Number(y) === 0) return genDecMulDiv();
      return T.decMul(x, y);
    }
    // build a clean division: quotient × divisor = dividend, divisor is a decimal
    const q = rand(2, 30), dv = pick(['0.2', '0.4', '0.5', '0.8', '1.5', '2.5', '0.25']);
    const prodScaled = Math.round(q * Number(dv) * 100);
    const x = T._fromScaled(prodScaled, 2);
    return T.decDiv(x, dv);
  }

  // ---- Percentages ----
  const PC_ITEMS = [['jacket', '£'], ['bike', '£'], ['phone', '£'], ['pair of boots', '£'], ['season ticket', '£']];
  function genPercentHard() {
    const r = rand(1, 4);
    const A100 = 100 * rand(2, 15);
    if (r === 1) {                                    // increase / decrease
      const p = pick([5, 10, 12, 15, 20, 25, 30, 35, 40]);
      const up = Math.random() < 0.45;
      const item = pick(PC_ITEMS), A = 20 * rand(3, 30);
      const story = up
        ? `A ${item[0]} costs £${A}. The price goes UP by ${p}%. What does it cost now?`
        : `A ${item[0]} costs £${A}. In a sale it is reduced by ${p}%. What is the sale price?`;
      return T.percentChange(p, A, up, '£', story);
    }
    if (r === 2) {                                    // find the percentage change
      const oldV = 10 * rand(2, 20);
      const pct = pick([5, 10, 20, 25, 40, 50]);
      const up = Math.random() < 0.5;
      const newV = up ? oldV + (oldV * pct) / 100 : oldV - (oldV * pct) / 100;
      if (!Number.isInteger(newV) || newV <= 0) return genPercentHard();
      const story = `A season ticket cost £${oldV} last year and costs £${newV} this year. What is the percentage ${up ? 'increase' : 'decrease'}?`;
      return T.percentChangeFind(oldV, newV, '£', story);
    }
    if (r === 3) {                                    // REVERSE percentage
      const p = pick([10, 20, 25, 40, 50]);
      const orig = 20 * rand(2, 25);
      const up = Math.random() < 0.4;
      const now = (orig * (up ? 100 + p : 100 - p)) / 100;
      if (!Number.isInteger(now) || !Number.isInteger(orig / 100 * 1) ) { /* 1% may be a decimal — that's fine */ }
      if (!Number.isInteger(now)) return genPercentHard();
      const item = pick(PC_ITEMS);
      const story = up
        ? `After a ${p}% price rise a ${item[0]} costs £${now}. What did it cost BEFORE the rise?`
        : `In a ${p}% off sale a ${item[0]} costs £${now}. What was its ORIGINAL price?`;
      return T.percentReverse(p, orig, up, '£', story);
    }
    const p = rand(11, 89);                           // awkward percentage of an amount
    if (p % 10 === 0) return genPercentHard();
    return T.percentAny(p, A100, Math.random() < 0.5 ? '£' : '');
  }
  function genPercentMain() {                          // level 2: any whole %, built from 10% and 1%
    const p = pick([12, 15, 18, 22, 24, 35, 45, 55, 60, 65, 70, 80, 90, 95]);
    return T.percentAny(p, 100 * rand(2, 12), Math.random() < 0.5 ? '£' : '');
  }

  // ---- Fractions: × and ÷ ----
  function genFracMulDiv() {
    const r = rand(1, 3);
    const smallFrac = () => { const d = rand(2, 9); return [rand(1, d - 1), d]; };
    if (r === 1) { const [a, b] = smallFrac(), [c, d] = smallFrac(); return T.fracMul(a, b, c, d); }
    if (r === 2) { const [a, b] = smallFrac(), [c, d] = smallFrac(); return T.fracDiv(a, b, c, d); }
    const den = pick([4, 5, 6, 8, 10, 12]), num = rand(1, den - 1);
    const amount = den * rand(6, 25);
    return T.fracOfBig(num, den, amount);
  }

  // ---- Integers: two operations, signs everywhere ----
  function genNegHard() { return T.negTwoStep(); }

  // ---- Rounding: significant figures & estimating ----
  function genRoundHard() {
    if (Math.random() < 0.55) {
      const sf = Math.random() < 0.5 ? 1 : 2;
      const n = Math.random() < 0.5 ? rand(120, 98000) : Number(T._randDec(rand(2, 3), 0, 40));
      if (!n) return genRoundHard();
      return T.roundSF(n, sf);
    }
    const op = pick(['×', '+', '−']);
    let a = rand(18, 890), b = rand(18, 890);
    if (op === '−' && b > a) { const t = a; a = b; b = t; }
    return T.estimate(a, b, op);
  }

  // ---- Statistics: reverse mean, even median, negatives ----
  function genStatHard() {
    const r = rand(1, 3);
    if (r === 1) {
      const n = rand(4, 6), mean = rand(4, 14);
      const vals = []; let s = 0;
      for (let i = 0; i < n - 1; i++) { const v = rand(1, 2 * mean); vals.push(v); s += v; }
      const missing = mean * n - s;
      if (missing < 1 || missing > 2 * mean + 6) return genStatHard();
      return T.meanMissing(vals, missing);
    }
    if (r === 2) {
      const out = [], used = new Set();
      while (out.length < 6) { const v = rand(1, 30); if (!used.has(v)) { used.add(v); out.push(v); } }
      return T.medianEven(out);
    }
    const out = [], used = new Set();
    while (out.length < 5) { const v = rand(-9, 12); if (!used.has(v)) { used.add(v); out.push(v); } }
    if (Math.min(...out) >= 0) return genStatHard();
    return T.rangeNegative(out);
  }

  // ---- FDP: compare and order mixed forms ----
  const FDP_ITEMS = [
    { label: '1/2', pct: 50 }, { label: '1/4', pct: 25 }, { label: '3/4', pct: 75 }, { label: '1/5', pct: 20 },
    { label: '2/5', pct: 40 }, { label: '3/5', pct: 60 }, { label: '4/5', pct: 80 }, { label: '1/10', pct: 10 },
    { label: '3/10', pct: 30 }, { label: '7/10', pct: 70 }, { label: '1/20', pct: 5 }, { label: '3/8', pct: 37.5 },
    { label: '0.15', pct: 15 }, { label: '0.35', pct: 35 }, { label: '0.6', pct: 60 }, { label: '0.9', pct: 90 },
    { label: '0.45', pct: 45 }, { label: '0.05', pct: 5 }, { label: '0.72', pct: 72 }, { label: '0.28', pct: 28 },
    { label: '55%', pct: 55 }, { label: '85%', pct: 85 }, { label: '12%', pct: 12 }, { label: '65%', pct: 65 },
    { label: '48%', pct: 48 }, { label: '33%', pct: 33 },
  ];
  function genFdpOrder() {
    const k = rand(3, 4), chosen = [], usedPct = new Set(), usedForm = {};
    let guard = 0;
    while (chosen.length < k && guard++ < 200) {
      const it = pick(FDP_ITEMS);
      const form = it.label.includes('/') ? 'f' : it.label.includes('%') ? 'p' : 'd';
      if (usedPct.has(it.pct)) continue;
      if ((usedForm[form] || 0) >= 2) continue;
      if (!Number.isInteger(it.pct)) continue;
      usedPct.add(it.pct); usedForm[form] = (usedForm[form] || 0) + 1;
      chosen.push(it);
    }
    if (chosen.length < 3) return genFdpOrder();
    const forms = new Set(chosen.map((c) => (c.label.includes('/') ? 'f' : c.label.includes('%') ? 'p' : 'd')));
    if (forms.size < 2) return genFdpOrder();          // must be a genuinely MIXED set
    return T.fdpOrder(chosen, Math.random() < 0.5);
  }

  // ---- Numeracy: decimal place value, ordering with negatives ----
  function genNumHard() {
    if (Math.random() < 0.5) {
      const whole = rand(0, 40), dp = rand(2, 3);
      let f = ''; for (let i = 0; i < dp; i++) f += rand(0, 9);
      if (!/[1-9]/.test(f)) return genNumHard();
      return T.placeValueDecimal(`${whole}.${f}`);
    }
    const out = [], used = new Set();
    const k = rand(4, 5);
    const withDec = Math.random() < 0.5;
    let g = 0;
    while (out.length < k && g++ < 200) {
      const v = withDec ? Math.round(rand(-40, 40) * 10) / 10 : rand(-30, 30);
      if (used.has(v)) continue;
      used.add(v); out.push(v);
    }
    if (out.length < k || Math.min(...out) >= 0) return genNumHard();
    return T.orderMixed(out, Math.random() < 0.5);
  }

  // ---- Angles, area, volume, coordinates ----
  function genAngleHard() {
    const r = rand(1, 4);
    if (r === 1) return T.angleQuadrilateral();
    if (r === 2) return T.angleIsosceles();
    if (r === 3) return T.angleParallel();
    return T.anglePolygon();
  }
  function genAreaHard() {
    const r = rand(1, 4);
    if (r === 1) return T.compoundArea();
    if (r === 2) return T.parallelogramArea(rand(4, 14), rand(3, 11));
    if (r === 3) { let a = rand(3, 10), b = rand(4, 14); if (a === b) b += 1; let h = rand(3, 10); if (((a + b) * h) % 2 !== 0) h += 1; return T.trapeziumArea(a, b, h); }
    return T.missingSide(rand(4, 12), rand(3, 11));
  }
  function genVolumeHard() {
    const r = rand(1, 3);
    if (r === 1) return T.surfaceArea(rand(3, 9), rand(2, 7), rand(2, 8));
    if (r === 2) return T.missingDimension(rand(2, 8), rand(2, 7), rand(2, 9));
    let b = rand(3, 10), h = rand(2, 9); if ((b * h) % 2 !== 0) h += 1;
    return T.prismVolume(b, h, rand(3, 12));
  }
  function genMidpoint() {
    // keep both coordinates whole: the two x's (and y's) must share parity
    const x1 = rand(0, 10), x2 = x1 + 2 * rand(1, Math.max(1, Math.floor((10 - x1) / 2)));
    const y1 = rand(0, 10), y2 = y1 + 2 * rand(1, Math.max(1, Math.floor((10 - y1) / 2)));
    if (x2 > 10 || y2 > 10) return genMidpoint();
    return T.midpoint(x1, y1, x2, y2);
  }

  // ---- Geometry: properties then symmetry ----
  function genShapeProp() { return T.shapeProperty(pick(T.PROPS)); }
  function genSymmetry() { return T.symmetry(pick(T.SYMS), Math.random() < 0.5); }

  // ---- Graphs: scaled charts, tables, pictograms ----
  const BAR_CATS2 = [['Mon', 'Tue', 'Wed', 'Thu'], ['Red', 'Blue', 'Green', 'Gold'], ['Ali', 'Ben', 'Cara', 'Dan'], ['W1', 'W2', 'W3', 'W4']];
  function genBarScaled() {
    const step = pick([2, 5, 10]);
    const cats = pick(BAR_CATS2);
    const vals = cats.map(() => (Math.random() < 0.4 ? step * rand(1, 6) + step / 2 : step * rand(1, 7)));
    return T.barScaled(cats, vals.map((v) => Math.round(v * 2) / 2), step);
  }
  function genGraphHard() {
    const r = rand(1, 3);
    if (r === 1) return T.twoWayTable();
    if (r === 2) return T.pictogram();
    const step = pick([2, 5]);
    const cats = pick(BAR_CATS2);
    const n = cats.length;
    // make the mean come out whole
    let vals, g = 0;
    do { vals = cats.map(() => step * rand(1, 8)); g++; } while (vals.reduce((a, b) => a + b, 0) % n !== 0 && g < 200);
    if (vals.reduce((a, b) => a + b, 0) % n !== 0) return genGraphHard();
    return T.barMean(cats, vals, step);
  }

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
      { id: 'hcf-big', name: 'Bigger numbers', badge: '🔴', generate: () => Math.random() < 0.3 ? hcfStory() : T.hcfProblem(...pick(HCF_BIG)) },
      { id: 'hcf-pro', name: 'Three numbers 🏆', badge: '🏆', generate: () => genHcf3() },
    ] },
    { id: 'lcm', name: 'LCM — Lowest Common Multiple', icon: '🟢', blurb: 'List multiples, find the smallest shared one.', levels: [
      { id: 'lcm-warm', name: 'Warm-up', badge: '🤝', generate: () => T.lcmProblem(...pick(LCM_WARM)) },
      { id: 'lcm-main', name: 'Main', badge: '🟢', generate: () => Math.random() < 0.5 ? T.lcmProblem(...pick(LCM_MAIN)) : T.lcmProblem(...genLcmPair(3, 12)) },
      { id: 'lcm-big', name: 'Bigger numbers', badge: '🟡', generate: () => Math.random() < 0.4 ? lcmStory() : T.lcmProblem(...genLcmPair(4, 15)) },
      { id: 'lcm-pro', name: 'Three numbers 🏆', badge: '🏆', generate: () => genLcm3() },
    ] },
    { id: 'primes', name: 'Prime Numbers', icon: '🔢', blurb: 'Spot primes, factor trees, index form.', levels: [
      { id: 'prime-spot', name: 'Is it prime?', badge: '🕵️', generate: () => T.isItPrime(rand(2, 40)) },
      { id: 'prime-hunt', name: 'Prime hunt', badge: '🎯', generate: () => genPrimeHunt() },
      { id: 'prime-two', name: 'Two prime factors', badge: '✖️', generate: () => genTwoPrimes() },
      { id: 'prime-index', name: 'Factor tree (index form)', badge: '🌳', generate: () => T.factorIndex(pick(INDEX_BANK)) },
      { id: 'prime-square', name: 'Make a square ⭐ (beyond Y7)', badge: '⭐', generate: () => T.makeSquare(pick(T.SQUARE_BANK)) },
      { id: 'prime-hcflcm', name: 'HCF & LCM by primes ⭐ (beyond Y7)', badge: '⭐', generate: () => { const p = pick(HL_BANK); return T.hcfLcmByPrimes(p[0], p[1]); } },
    ] },
    { id: 'ratio', name: 'Ratio', icon: '⚖️', blurb: 'Simplify, share, and work backwards from one share.', levels: [
      { id: 'ratio-simplify', name: 'Simplify', badge: '➗', generate: () => genRatioSimplify() },
      { id: 'ratio-share', name: 'Share an amount', badge: '🤝', generate: () => genRatioShare() },
      { id: 'ratio-hard', name: 'Three-way & backwards 🏆', badge: '🏆', generate: () => genRatioHard() },
    ] },
    { id: 'decimals', name: 'Decimals', icon: '🔟', blurb: '× and ÷ by powers of ten, add, subtract, then × and ÷ decimals.', levels: [
      { id: 'dec-power', name: '× and ÷ by 10, 100, 1000', badge: '📍', generate: () => genDecPower() },
      { id: 'dec-addsub', name: 'Add & subtract', badge: '➕', generate: () => genDecAddSub() },
      { id: 'dec-muldiv', name: '× and ÷ decimals 🏆', badge: '🏆', generate: () => genDecMulDiv() },
    ] },
    { id: 'percent', name: 'Percentages', icon: '％', blurb: 'Of an amount, then increase/decrease, then working backwards.', levels: [
      { id: 'pc-of', name: '% of an amount', badge: '％', generate: () => genPercent() },
      { id: 'pc-any', name: 'Any percentage (10% + 1%)', badge: '🔢', generate: () => genPercentMain() },
      { id: 'pc-hard', name: 'Increase, decrease & reverse 🏆', badge: '🏆', generate: () => genPercentHard() },
    ] },
    { id: 'fractions', name: 'Fractions', icon: '½', blurb: 'Simplify, add & subtract, then multiply & divide.', levels: [
      { id: 'frac-simplify', name: 'Simplify', badge: '➗', generate: () => genFracSimplify() },
      { id: 'frac-of', name: 'Fraction of an amount', badge: '½', generate: () => genFracOfAmount() },
      { id: 'frac-add', name: 'Add & subtract', badge: '➕', generate: () => Math.random() < 0.4 ? genFracAddSame() : genFracAddDiff() },
      { id: 'frac-muldiv', name: 'Multiply & divide 🏆', badge: '🏆', generate: () => genFracMulDiv() },
    ] },
    { id: 'integers', name: 'Integers (negatives)', icon: '±', blurb: 'Add, subtract, multiply, divide — then two moves at once.', levels: [
      { id: 'int-addsub', name: 'Add & subtract', badge: '±', generate: () => genNegAddSub() },
      { id: 'int-muldiv', name: 'Multiply & divide', badge: '✖️', generate: () => genNegMulDiv() },
      { id: 'int-hard', name: 'Two steps with negatives 🏆', badge: '🏆', generate: () => genNegHard() },
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
    { id: 'rounding', name: 'Rounding', icon: '≈', blurb: 'Nearest 10/100/1000, decimal places, then significant figures.', levels: [
      { id: 'round-nearest', name: 'Nearest 10 / 100 / 1000', badge: '🎯', generate: () => genRoundNearest() },
      { id: 'round-dp', name: 'Decimal places', badge: '📍', generate: () => genRoundDP() },
      { id: 'round-sf', name: 'Significant figures & estimating 🏆', badge: '🏆', generate: () => genRoundHard() },
    ] },
    { id: 'stats', name: 'Statistics', icon: '📊', blurb: 'Mode, range, mean, median — then working backwards.', levels: [
      { id: 'stat-modrange', name: 'Mode & range', badge: '📊', generate: () => Math.random() < 0.5 ? genStatMode() : genStatRange() },
      { id: 'stat-mean', name: 'Mean', badge: '➗', generate: () => genStatMean() },
      { id: 'stat-median', name: 'Median', badge: '🔽', generate: () => genStatMedian() },
      { id: 'stat-hard', name: 'Missing values & negatives 🏆', badge: '🏆', generate: () => genStatHard() },
    ] },
    { id: 'fdp', name: 'Fractions, Decimals & %', icon: '🔗', blurb: 'Convert between them, then compare and order a mixed set.', levels: [
      { id: 'fdp-fd', name: 'Fraction → decimal → %', badge: '➡️', generate: () => genFdpFromFraction() },
      { id: 'fdp-pf', name: '% → fraction', badge: '½', generate: () => genFdpPercentToFraction() },
      { id: 'fdp-order', name: 'Order a mixed set 🏆', badge: '🏆', generate: () => genFdpOrder() },
    ] },
    { id: 'numeracy', name: 'Place value & ordering', icon: '#️⃣', blurb: 'Digit values and ordering — up to decimals and negatives.', levels: [
      { id: 'num-pv', name: 'Place value', badge: '🔢', generate: () => genPlaceValue() },
      { id: 'num-order', name: 'Ordering numbers', badge: '🔽', generate: () => genOrdering() },
      { id: 'num-hard', name: 'Decimals & negatives 🏆', badge: '🏆', generate: () => genNumHard() },
    ] },
    { id: 'angles', name: 'Angles', icon: '📐', blurb: 'Lines and triangles, then quadrilaterals, parallel lines & polygons.', levels: [
      { id: 'ang-missing', name: 'On a line / around a point', badge: '📏', generate: () => genAngleMissing() },
      { id: 'ang-tri', name: 'Triangles', badge: '🔺', generate: () => T.angleTriangle() },
      { id: 'ang-hard', name: 'Quadrilaterals, parallels & polygons 🏆', badge: '🏆', generate: () => genAngleHard() },
    ] },
    { id: 'area', name: 'Perimeter & Area', icon: '🟩', blurb: 'Rectangles and triangles, then compound shapes and working backwards.', levels: [
      { id: 'area-rect', name: 'Rectangles', badge: '🟩', generate: () => genRect() },
      { id: 'area-tri', name: 'Triangle area', badge: '🔺', generate: () => genTri() },
      { id: 'area-hard', name: 'Compound shapes & backwards 🏆', badge: '🏆', generate: () => genAreaHard() },
    ] },
    { id: 'volume', name: '3D Shapes & Volume', icon: '🧊', blurb: 'Cuboids and solids, then surface area and prisms.', levels: [
      { id: 'vol-cuboid', name: 'Volume of a cuboid', badge: '🧊', generate: () => genCuboid() },
      { id: 'vol-fev', name: 'Faces, edges & vertices', badge: '🔷', generate: () => genSolidCount() },
      { id: 'vol-hard', name: 'Surface area & prisms 🏆', badge: '🏆', generate: () => genVolumeHard() },
    ] },
    { id: 'coords', name: 'Coordinates', icon: '📍', blurb: 'Read, reflect, complete shapes, then find midpoints.', levels: [
      { id: 'co-read', name: 'Read coordinates', badge: '📍', generate: () => genReadCoord() },
      { id: 'co-read-neg', name: 'Read (with negatives)', badge: '➖', generate: () => genReadCoordNeg() },
      { id: 'co-reflect', name: 'Reflect a point', badge: '🪞', generate: () => genReflect() },
      { id: 'co-complete', name: 'Complete the figure', badge: '⬜', generate: () => genComplete() },
      { id: 'co-mid', name: 'Midpoint of a line 🏆', badge: '🏆', generate: () => genMidpoint() },
    ] },
    { id: 'geometry', name: 'Shape Facts', icon: '🔷', blurb: 'Sides and angles, shape properties, then symmetry.', levels: [
      { id: 'geo-facts', name: 'Shape facts', badge: '🔷', generate: () => genGeomFact() },
      { id: 'geo-props', name: 'Properties of shapes', badge: '🔍', generate: () => genShapeProp() },
      { id: 'geo-sym', name: 'Symmetry 🏆', badge: '🏆', generate: () => genSymmetry() },
    ] },
    { id: 'graphs', name: 'Data & Graphs', icon: '📈', blurb: 'Bar charts, awkward scales, then tables and pictograms.', levels: [
      { id: 'gr-bar', name: 'Bar charts', badge: '📊', generate: () => genBar() },
      { id: 'gr-scale', name: 'Mind the scale', badge: '📏', generate: () => genBarScaled() },
      { id: 'gr-hard', name: 'Tables, pictograms & means 🏆', badge: '🏆', generate: () => genGraphHard() },
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
