/* numeracy1.js — Topic 1 (Numeracy) and the two Topic 2 / Topic 9 objectives that were
   still missing after the first realignment.

   T1 · Recall times tables
   T1 · Add and subtract large integers
   T1 · Multiply integers
   T1 · Short division with no remainders
   T1 · Short division with decimal answers
   T2 · Use directed numbers in practical situations (temperature, finance, altitude, BC/AD)
   T9 · Form and solve one-step equations that include fractions

   Topic 1 is arithmetic fluency, and the app had nothing for it — the old "Numeracy" tile
   was place value and ordering, which the unit plans put under Topic 2. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep;
  const numberPool = W._numberPool, shuffle = W._shuffle;
  const { parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const M = '−';
  const n2 = (v) => (v < 0 ? M + Math.abs(v) : String(v));
  const grp = (v) => Math.abs(v).toLocaleString('en-US').replace(/,/g, ' ');   // 12 345

  function nStep(o) {
    const a = o.answer;
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], isAnswer: !!o.isAnswer,
      pool: o.pool || numberPool([a], 4, o.lo != null ? o.lo : a - 12, o.hi != null ? o.hi : a + 12),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }

  // ============================================================ T1 · times tables
  function timesTable() {
    const a = rand(2, 12), b = rand(2, 12), v = a * b;
    return {
      subject: 'numeracy', sig: `tt:${a}x${b}`, given: `${a} × ${b}`, answer: String(v),
      steps: [nStep({ key: 'tt', prompt: `What is ${a} × ${b}?`, hint: `${a} × ${b} = ${v}.`,
        why: `Knowing this instantly is what makes everything else quick — you use it in division, fractions, area and simplifying. If it doesn't come straight away: ${a} × 10 = ${a * 10}, so ${a} × ${b} is ${b < 10 ? `${10 - b} lots of ${a} less than that` : `${b - 10} more lot${b - 10 === 1 ? '' : 's'} of ${a}`} = ${v}.`,
        resultText: `${a} × ${b} = ${v}`, answer: v,
        pool: uniqSort([v, v + a, Math.max(1, v - a), v + b, a + b].filter((x) => x > 0)),
        expr: `${a} × ${b}`, isAnswer: true })],
    };
  }

  // ============================================================ T1 · add & subtract large integers
  // Partitioned the way it's taught mentally: add (or take) the thousands, then the
  // hundreds, then the tens, then the ones.
  function addSubLarge(sub) {
    const a = rand(2000, 89000);
    const b = sub ? rand(1000, a - 500) : rand(1000, 40000);
    const parts = [];
    let rest = b, place = 10000;
    while (place >= 1) {
      const d = Math.floor(rest / place) * place;
      if (d) parts.push(d);
      rest -= d; place /= 10;
    }
    if (parts.length < 2 || parts.length > 4) return addSubLarge(sub);
    const steps = [];
    let run = a;
    parts.forEach((p, i) => {
      const before = run;
      run = sub ? run - p : run + p;
      steps.push(nStep({
        key: 'p' + i,
        prompt: `${i === 0 ? `Break ${grp(b)} into its parts and ${sub ? 'take them away' : 'add them'} one at a time. First` : 'Now'} ${grp(before)} ${sub ? M : '+'} ${grp(p)} = ?`,
        hint: `${grp(before)} ${sub ? M : '+'} ${grp(p)} = ${grp(run)}.`,
        why: i === 0
          ? `Splitting ${grp(b)} into ${parts.map(grp).join(' + ')} turns one hard sum into a few easy ones. Deal with the biggest place value first and the rest stays simple.`
          : `Keep going down the place values. Only the ${p >= 1000 ? 'thousands' : p >= 100 ? 'hundreds' : p >= 10 ? 'tens' : 'ones'} digit changes here.`,
        resultText: `${grp(run)}`, answer: run, lo: run - 60, hi: run + 60,
        expr: `${before} ${sub ? M : '+'} ${p}`,
        isAnswer: i === parts.length - 1,
        longWay: i === parts.length - 1
          ? `${grp(a)} ${sub ? M : '+'} ${grp(b)}\n= ${grp(a)} ${sub ? M : '+'} (${parts.map(grp).join(' + ')})\n= ${grp(run)}` : undefined,
      }));
    });
    return { subject: 'numeracy', sig: `${sub ? 'sub' : 'add'}:${a}:${b}`, given: `${grp(a)} ${sub ? M : '+'} ${grp(b)}`, answer: String(sub ? a - b : a + b), steps };
  }

  // ============================================================ T1 · multiply integers
  // Partitioning, the written method the school uses before long multiplication.
  function multiplyIntegers() {
    const big = Math.random() < 0.45;
    const a = big ? rand(112, 989) : rand(13, 99);
    const b = rand(3, 9);
    const digits = [];
    let place = big ? 100 : 10;
    let rest = a;
    while (place >= 1) { const d = Math.floor(rest / place) * place; if (d) digits.push(d); rest -= d; place /= 10; }
    if (digits.length < 2) return multiplyIntegers();
    const partials = digits.map((d) => d * b);
    const total = a * b;
    const steps = digits.map((d, i) => nStep({
      key: 'm' + i,
      prompt: `${i === 0 ? `Split ${a} into ${digits.join(' + ')} and multiply each piece by ${b}. First` : 'Then'} ${d} × ${b} = ?`,
      hint: `${d} × ${b} = ${partials[i]}.`,
      why: i === 0
        ? `${a} × ${b} is easier in pieces: ${digits.join(' + ')} multiplied by ${b}. Each piece is just a times table fact with zeros on the end.`
        : `Same again — ${d} × ${b} is ${d / Math.pow(10, String(d).length - 1)} × ${b} with the zeros put back.`,
      resultText: `${d} × ${b} = ${partials[i]}`, answer: partials[i],
      lo: Math.max(0, partials[i] - 40), hi: partials[i] + 40, expr: `${d} × ${b}`,
    }));
    steps.push(nStep({
      key: 'tot', prompt: `Now add the pieces: ${partials.join(' + ')} = ?`,
      hint: `${partials.join(' + ')} = ${total}.`,
      why: `The parts add back to the whole answer. Check it looks sensible: ${a} is about ${Math.round(a / 10) * 10}, and ${Math.round(a / 10) * 10} × ${b} ≈ ${Math.round(a / 10) * 10 * b}.`,
      longWay: `${a} × ${b}\n= (${digits.join(' + ')}) × ${b}\n= ${partials.join(' + ')}\n= ${total}`,
      resultText: `${a} × ${b} = ${total}`, answer: total, lo: Math.max(0, total - 60), hi: total + 60,
      expr: partials.join(' + '), isAnswer: true,
    }));
    return { subject: 'numeracy', sig: `mul:${a}x${b}`, given: `${a} × ${b}`, answer: String(total), steps };
  }

  // ============================================================ T1 · short division (bus stop)
  // One step per digit, carrying the remainder across exactly as the written method does.
  function shortDivision(withDecimal) {
    const d = rand(2, 9);
    const q = withDecimal ? 0 : rand(112, 989);
    const n = withDecimal ? rand(23, 99) : q * d;
    if (!withDecimal && n > 9999) return shortDivision(withDecimal);
    if (withDecimal && n % d === 0) return shortDivision(withDecimal);       // must actually need a point
    const answer = n / d;
    if (withDecimal && String(answer).replace(/^\d+\./, '').length > 2) return shortDivision(withDecimal);

    // walk the digits, then the decimal places if we need them
    const seq = String(n).split('').map(Number);
    const steps = [];
    let carry = 0, qdigits = '', afterPoint = false;
    const MAXSTEPS = 5;
    for (let i = 0; i < seq.length + (withDecimal ? 2 : 0) && steps.length < MAXSTEPS; i++) {
      const digit = i < seq.length ? seq[i] : 0;
      if (i === seq.length) afterPoint = true;
      const cur = carry * 10 + digit;
      const qd = Math.floor(cur / d), rem = cur % d;
      qdigits += (i === seq.length ? '.' : '') + qd;
      steps.push(nStep({
        key: 'd' + i,
        prompt: `${i === 0 ? `Bus-stop method: divide each digit in turn. How many ${d}s in ${cur}?` : `Carry the ${carry} across to make ${cur}. How many ${d}s in ${cur}?`}`,
        hint: `${d} goes into ${cur} ${qd} time${qd === 1 ? '' : 's'}${rem ? `, remainder ${rem}` : ' exactly'}.`,
        why: i === 0
          ? `Short division works left to right, one digit at a time. Whatever is left over gets carried to the next digit — that is what the little number above the line means.`
          : afterPoint && i === seq.length
            ? `There are no digits left, but there is still ${carry} to share. Put a decimal point in the answer and carry on with a zero — that is where the decimal answer comes from.`
            : `${rem ? `${rem} is left over, so carry it.` : 'Nothing left over this time.'}`,
        resultText: `${qd}${rem ? ` remainder ${rem}` : ''}`, answer: qd, pool: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        expr: `${cur} ÷ ${d}`,
      }));
      carry = rem;
      if (!withDecimal && i === seq.length - 1) break;
      if (withDecimal && carry === 0 && i >= seq.length - 1) break;
    }
    steps.push(nStep({
      key: 'ans', prompt: `So ${n} ÷ ${d} = ?`, hint: `${answer}.`,
      why: `Read the digits you wrote above the line, in order. Check it: ${answer} × ${d} = ${n}.`,
      longWay: `${n} ÷ ${d}\nWorking left to right, carrying remainders\n= ${answer}`,
      resultText: `${n} ÷ ${d} = ${answer}`, answer,
      pool: uniqSort([answer, answer * 10, Math.round(answer / 10 * 100) / 100, answer + 1, answer - 1].filter((x) => x > 0)),
      expr: `${n} ÷ ${d}`, isAnswer: true,
    }));
    return { subject: 'numeracy', sig: `sd:${n}/${d}`, given: `${n} ÷ ${d}`, answer: String(answer), steps };
  }

  // ============================================================ T2 · directed numbers in real situations
  const DIRECTED = [
    () => { const start = rand(-8, 4), drop = rand(4, 14), end = start - drop;
      return { story: `At noon the temperature is ${n2(start)} °C. By midnight it has fallen by ${drop} °C. What is the temperature at midnight?`,
        a: end, expr: `${n2(start)} ${M} ${drop}`,
        why: `Falling means going DOWN the number line, further to the left. Starting at ${n2(start)} and going down ${drop} lands on ${n2(end)} — below zero is colder, not smaller in size.` }; },
    () => { const start = rand(-6, -1), rise = rand(3, 15), end = start + rise;
      return { story: `A freezer is at ${n2(start)} °C. It warms up by ${rise} °C. What is it now?`,
        a: end, expr: `${n2(start)} + ${rise}`,
        why: `Warming up moves RIGHT along the number line. From ${n2(start)}, counting up ${rise} passes through 0 and ends at ${n2(end)}.` }; },
    () => { const bal = -rand(20, 90), pay = rand(30, 160), end = bal + pay;
      return { story: `A bank account is overdrawn by £${Math.abs(bal)} (a balance of ${n2(bal)}). £${pay} is paid in. What is the balance now?`,
        a: end, expr: `${n2(bal)} + ${pay}`,
        why: `Overdrawn means a negative balance. Paying money in moves the balance up: ${n2(bal)} + ${pay} = ${n2(end)}. ${end < 0 ? 'It is still overdrawn, just by less.' : 'It is back in credit.'}` }; },
    () => { const sea = -rand(30, 200), up = rand(50, 400), end = sea + up;
      return { story: `A submarine is at ${n2(sea)} m (below sea level). It rises ${up} m. What is its height now?`,
        a: end, expr: `${n2(sea)} + ${up}`,
        why: `Below sea level is negative, above is positive. Rising ${up} m from ${n2(sea)} m gives ${n2(end)} m — ${end < 0 ? 'still below the surface' : 'now above the surface'}.` }; },
    () => { const bc = rand(50, 600), ad = rand(50, 900);
      return { story: `A temple was built in ${bc} BC and rebuilt in AD ${ad}. How many years apart is that?`,
        a: bc + ad, expr: `${bc} + ${ad}`,
        why: `Think of BC as negative years and AD as positive, with no year zero in between. The gap from ${M}${bc} up to ${ad} is ${bc} + ${ad} = ${bc + ad} years — you ADD across zero, you do not subtract.` }; },
  ];
  function directedContext() {
    const e = pick(DIRECTED)();
    return {
      subject: 'integers', sig: `dc:${e.story.slice(0, 30)}:${e.a}`, given: e.story, answer: String(e.a),
      steps: [nStep({ key: 'dc', prompt: `Work it out: ${e.expr} = ?`, hint: `${e.expr} = ${n2(e.a)}.`,
        why: e.why, resultText: `${n2(e.a)}`, answer: e.a, lo: e.a - 20, hi: e.a + 20, expr: e.expr, isAnswer: true })],
    };
  }

  // ============================================================ T9 · one-step equations with fractions
  function fractionEquation() {
    const kind = Math.random() < 0.55 ? 'div' : 'frac';
    if (kind === 'div') {
      const d = rand(2, 9), x = rand(2, 12), c = x / d === Math.floor(x / d) ? x : x;   // x/d = c
      const val = rand(2, 12), top = d * val;                                            // x = top, top/d = val
      return {
        subject: 'algebra', sig: `fe:d:${top}/${d}`, given: `x/${d} = ${val}`, answer: String(top),
        steps: [W._pickStep({
          key: 'undo', prompt: `x is being DIVIDED by ${d}. What do you do to both sides to undo that?`,
          hint: `The opposite of dividing by ${d} is multiplying by ${d}.`,
          why: `Whatever is happening to x, you do the opposite to BOTH sides. Here x has been divided by ${d}, so multiply both sides by ${d}: the ${d}s cancel on the left and the right becomes ${val} × ${d}.`,
          resultText: `multiply both sides by ${d}`, expected: [`× ${d}`],
          pool: shuffle([`× ${d}`, `÷ ${d}`, `+ ${d}`, `${M} ${d}`]),
          diagnose: () => ({ correct: false, id: 'frac-eq-undo', ctx: { d } }),
        }), nStep({
          key: 'x', prompt: `So x = ${val} × ${d} = ?`, hint: `${val} × ${d} = ${top}.`,
          why: `Check it: ${top} ÷ ${d} = ${val} ✓`,
          longWay: `x/${d} = ${val}\nMultiply both sides by ${d}\nx = ${val} × ${d} = ${top}`,
          resultText: `x = ${top}`, answer: top, lo: 1, hi: top + 15, expr: `${val} × ${d}`, isAnswer: true,
        })],
      };
    }
    // (a/b)x = c  →  x = c ÷ (a/b) = c × b / a, kept whole
    const b = rand(2, 5), a = rand(1, b - 1), x = b * rand(2, 8);
    const c = (a * x) / b;
    return {
      subject: 'algebra', sig: `fe:f:${a}/${b}:${x}`, given: `${a}/${b} of x = ${c}`, answer: String(x),
      steps: [nStep({
        key: 'one', prompt: `${a}/${b} of x is ${c}. So what is 1/${b} of x? ${c} ÷ ${a} = ?`,
        hint: `${c} ÷ ${a} = ${c / a}.`,
        why: `Work down to ONE part first. If ${a} parts are worth ${c}, then one part is ${c} ÷ ${a} = ${c / a}.`,
        resultText: `1/${b} of x = ${c / a}`, answer: c / a, lo: 1, hi: c / a + 15, expr: `${c} ÷ ${a}`,
      }), nStep({
        key: 'x', prompt: `The whole of x is ${b} of those parts: ${c / a} × ${b} = ?`,
        hint: `${c / a} × ${b} = ${x}.`,
        why: `${b} parts make the whole, so multiply one part by ${b}. Check: ${a}/${b} of ${x} = ${c} ✓`,
        longWay: `${a}/${b} of x = ${c}\n1/${b} of x = ${c} ÷ ${a} = ${c / a}\nx = ${c / a} × ${b} = ${x}`,
        resultText: `x = ${x}`, answer: x, lo: 1, hi: x + 15, expr: `${c / a} × ${b}`, isAnswer: true,
      })],
    };
  }

  const api = { timesTable, addSubLarge, multiplyIntegers, shortDivision, directedContext, fractionEquation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
