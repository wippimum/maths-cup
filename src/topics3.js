/* topics3.js — Fractions, Statistics, Rounding, Integers.
   Year 6 methods matching the Toddle/Corbettmaths worksheets. Reuses the step
   factories from topics.js and the exact Fraction class from fraction.js. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, chooseStep = W._chooseStep;
  const numberPool = W._numberPool, list = W._list, S = W._S;
  const { Fraction, gcd, lcm, factors, common, parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const intPool = (c, spread) => numberPool([c], 4, c - (spread || 6), c + (spread || 6));

  // ===================== FRACTIONS =====================
  function fracSimplify(n, d) {
    const g = gcd(n, d), sn = n / g, sd = d / g, cf = common(factors(n), factors(d));
    return {
      subject: 'fractions', given: `Simplify ${n}/${d}`, answer: `${sn}/${sd}`,
      steps: [
        pickStep({ key: 'hcf',
          prompt: `Simplify ${n}/${d}. First, what is the highest common factor (HCF) of ${n} and ${d}?`,
          hint: `Common factors: ${list(cf)} — pick the biggest.`,
          why: `To simplify a fraction you divide the top and bottom by the SAME number. Using the HCF gets it to simplest form in one go.`,
          longWay: `Common factors of ${n} and ${d}: ${list(cf)} → HCF = ${g}.`,
          resultText: `HCF = ${g}`, expected: [g], pool: cf,
          diagnose: (v) => S(cf).includes(v) ? { correct: false, id: 'hcf-not-highest', ctx: { h: g } } : { correct: false, id: 'hcf-wrong', ctx: { h: g, cf: list(cf) } } }),
        pickStep({ key: 'top', prompt: `Divide the top by the HCF: ${n} ÷ ${g} = ?`, hint: `${n} ÷ ${g}.`,
          why: `Divide the numerator (top number) by the HCF.`, resultText: `top: ${sn}`, expected: [sn],
          pool: numberPool([sn], 4, 1, Math.max(sn + 4, n)), diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: n, h: g, ans: sn } }) }),
        pickStep({ key: 'bot', prompt: `Divide the bottom by the HCF: ${d} ÷ ${g} = ?`, hint: `${d} ÷ ${g}.`,
          why: `Divide the denominator (bottom number) by the same HCF.`, resultText: `bottom: ${sd}`, expected: [sd],
          pool: numberPool([sd], 4, 1, Math.max(sd + 4, d)), diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: d, h: g, ans: sd } }) }),
        buildStep({ key: 'write', prompt: `Write the simplified fraction (use the number and / cards).`,
          hint: `Your two answers, top over bottom: ${sn}/${sd}.`,
          why: `The simplified fraction is the new top over the new bottom.`,
          longWay: `${n}/${d} = ${sn}/${sd}`, resultText: `${n}/${d} = ${sn}/${sd}`,
          pieces: [String(sn), '/', String(sd)], distractors: [String(n), String(d), String(sd + 1)], isAnswer: true,
          check: (raw) => { const p = parseNumberList(String(raw).replace(/[/]/g, ' ')); if (p.length < 2) return { correct: false, id: 'frac-form', ctx: { sn, sd } }; if (p[0] === sn && p[1] === sd) return { correct: true }; if (p[0] === sd && p[1] === sn) return { correct: false, id: 'frac-flip', ctx: { sn, sd } }; return { correct: false, id: 'frac-form', ctx: { sn, sd } }; } }),
      ],
    };
  }
  function fracOfAmount(num, den, amount) {
    const per = amount / den, ans = per * num;
    return {
      subject: 'fractions', given: `Find ${num}/${den} of ${amount}`, answer: String(ans),
      steps: [
        pickStep({ key: 'part', prompt: `Find ${num}/${den} of ${amount}. First divide by the bottom: ${amount} ÷ ${den} = ? (that's one ${den}th)`,
          hint: `${amount} ÷ ${den}.`, why: `To find a fraction of an amount, divide by the denominator to get one part, then multiply by the numerator.`,
          resultText: `one ${den}th = ${per}`, expected: [per], pool: numberPool([per], 4, 1, per + Math.max(6, per)),
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: per, expr: `${amount} ÷ ${den}` } }) }),
        pickStep({ key: 'mult', prompt: `Now multiply by the top: ${per} × ${num} = ?`, hint: `${per} × ${num}.`,
          why: `${num}/${den} means ${num} of those ${den}ths, so multiply one part by ${num}.`,
          resultText: `${num}/${den} of ${amount} = ${ans}`, expected: [ans], pool: numberPool([ans], 4, 1, ans + Math.max(6, per)), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: ans, expr: `${per} × ${num}` } }) }),
      ],
    };
  }
  function fracAdd(a, d1, b, d2, sub) {
    const L = lcm(d1, d2), na = a * (L / d1), nb = b * (L / d2), sumNum = sub ? na - nb : na + nb;
    const res = new Fraction(sumNum, L), opw = sub ? '−' : '+';
    const steps = [];
    if (d1 === d2) {
      const sn2 = sub ? a - b : a + b;
      steps.push(pickStep({ key: 'num', prompt: `${a}/${d1} ${opw} ${b}/${d2}: the bottoms are the same, so just ${sub ? 'subtract' : 'add'} the tops: ${a} ${opw} ${b} = ?`,
        hint: `${a} ${opw} ${b}, and keep the bottom as ${d1}.`, why: `When the denominators match, ${sub ? 'subtract' : 'add'} the numerators and keep the denominator.`,
        resultText: `${sn2}/${d1}`, expected: [sn2], pool: numberPool([sn2], 4, 0, a + b + 2),
        diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: sn2, expr: `${a} ${opw} ${b}` } }) }));
    } else {
      steps.push(pickStep({ key: 'lcd', prompt: `${a}/${d1} ${opw} ${b}/${d2}: first find a common denominator — the LCM of ${d1} and ${d2}?`,
        hint: `The smallest number both ${d1} and ${d2} go into.`, why: `Fractions can only be added or subtracted when the bottoms match. The LCM is the smallest common denominator.`,
        resultText: `common denominator = ${L}`, expected: [L], pool: numberPool([L], 4, Math.max(d1, d2), L + d1),
        diagnose: () => ({ correct: false, id: 'lcd', ctx: { d1, d2, L } }) }));
      steps.push(pickStep({ key: 'c1', prompt: `Change ${a}/${d1} into ${L}ths: ${a} × ${L / d1} = ? (the new top)`, hint: `${a} × ${L / d1}.`,
        why: `Multiply top and bottom by ${L / d1} so the denominator becomes ${L}.`, resultText: `${a}/${d1} = ${na}/${L}`, expected: [na],
        pool: numberPool([na], 4, 1, na + 6), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: na, expr: `${a} × ${L / d1}` } }) }));
      steps.push(pickStep({ key: 'c2', prompt: `Change ${b}/${d2} into ${L}ths: ${b} × ${L / d2} = ? (the new top)`, hint: `${b} × ${L / d2}.`,
        why: `Multiply top and bottom by ${L / d2} so the denominator becomes ${L}.`, resultText: `${b}/${d2} = ${nb}/${L}`, expected: [nb],
        pool: numberPool([nb], 4, 1, nb + 6), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: nb, expr: `${b} × ${L / d2}` } }) }));
      steps.push(pickStep({ key: 'num', prompt: `Now ${sub ? 'subtract' : 'add'} the tops: ${na} ${opw} ${nb} = ? (over ${L})`, hint: `${na} ${opw} ${nb}.`,
        why: `The bottoms match now, so ${sub ? 'subtract' : 'add'} the numerators over ${L}.`, resultText: `${sumNum}/${L}`, expected: [sumNum],
        pool: numberPool([sumNum], 4, 0, na + nb + 2), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: sumNum, expr: `${na} ${opw} ${nb}` } }) }));
    }
    const whole = res.d === 1;
    steps.push(buildStep({ key: 'final', prompt: `Write the answer${whole ? '' : ' as a fraction, simplified if you can'} (use the cards).`,
      hint: `${res.toString()}.`, why: whole ? `It works out to a whole number.` : `Simplify by dividing top and bottom by their HCF where possible.`,
      longWay: `${a}/${d1} ${opw} ${b}/${d2} = ${res.toString()}`, resultText: `= ${res.toString()}`,
      pieces: whole ? [String(res.n)] : [String(Math.abs(res.n)), '/', String(res.d)],
      distractors: whole ? [String(sumNum), String(L)] : [String(sumNum), String(L), String(res.d + 1)], isAnswer: true,
      check: (raw) => {
        const p = parseNumberList(String(raw).replace(/[/]/g, ' '));
        if (!p.length) return { correct: false, id: 'frac-form', ctx: { sn: Math.abs(res.n), sd: res.d } };
        if (whole) return p[0] === res.n ? { correct: true } : { correct: false, id: 'num-wrong', ctx: { answer: res.n, expr: 'the total' } };
        if (p.length < 2) return { correct: false, id: 'frac-form', ctx: { sn: res.n, sd: res.d } };
        const f = new Fraction(p[0], p[1]);
        if (f.equals(res)) return f.n === res.n && f.d === res.d ? { correct: true } : { correct: true };
        // equivalent-but-unsimplified (e.g. sumNum/L) → gentle nudge, not a mistake
        if (p[0] === sumNum && p[1] === L && !(res.d === L)) return { correct: false, soft: true, id: 'not-simplified-frac', ctx: { res: res.toString() } };
        return { correct: false, id: 'frac-form', ctx: { sn: res.n, sd: res.d } };
      } }));
    return { subject: 'fractions', given: `${a}/${d1} ${opw} ${b}/${d2}`, answer: res.toString(), steps };
  }

  // ===================== STATISTICS =====================
  function statMode(data) {
    const counts = {}; data.forEach((x) => counts[x] = (counts[x] || 0) + 1);
    let mode = data[0], best = 0; for (const k in counts) if (counts[k] > best) { best = counts[k]; mode = Number(k); }
    return {
      subject: 'stats', given: `Find the MODE of: ${list(data)}`, answer: String(mode),
      steps: [pickStep({ key: 'mode', prompt: `Which number appears MOST often? Tap the mode.`, hint: `Count how many times each number appears — the mode is the most common one.`,
        why: `The mode is the value that occurs most frequently in the data.`, longWay: Object.keys(counts).map((k) => `${k}: appears ${counts[k]}×`).join('\n'),
        resultText: `Mode = ${mode}`, expected: [mode], pool: uniqSort(data), isAnswer: true,
        diagnose: () => ({ correct: false, id: 'stat-mode', ctx: { mode } }) })],
    };
  }
  function statRange(data) {
    const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn;
    return {
      subject: 'stats', given: `Find the RANGE of: ${list(data)}`, answer: String(r),
      steps: [
        pickStep({ key: 'max', prompt: `What is the BIGGEST number in the set?`, hint: `Scan for the largest value.`, why: `The range uses the biggest and smallest values.`,
          resultText: `biggest = ${mx}`, expected: [mx], pool: uniqSort(data), diagnose: () => ({ correct: false, id: 'stat-wrong', ctx: { what: 'biggest', v: mx } }) }),
        pickStep({ key: 'min', prompt: `What is the SMALLEST number in the set?`, hint: `Scan for the smallest value.`, why: `The range is biggest minus smallest.`,
          resultText: `smallest = ${mn}`, expected: [mn], pool: uniqSort(data), diagnose: () => ({ correct: false, id: 'stat-wrong', ctx: { what: 'smallest', v: mn } }) }),
        pickStep({ key: 'range', prompt: `Range = biggest − smallest = ${mx} − ${mn} = ?`, hint: `${mx} − ${mn}.`, why: `The range measures the spread: the biggest value take away the smallest.`,
          resultText: `Range = ${r}`, expected: [r], pool: numberPool([r], 4, 0, r + 6), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: r, expr: `${mx} − ${mn}` } }) }),
      ],
    };
  }
  function statMean(data) {
    const sum = data.reduce((a, b) => a + b, 0), n = data.length, mean = sum / n;
    return {
      subject: 'stats', given: `Find the MEAN of: ${list(data)}`, answer: String(mean),
      steps: [
        pickStep({ key: 'sum', prompt: `First add ALL the numbers: ${data.join(' + ')} = ?`, hint: `Add them one at a time.`, why: `The mean ("average") is the total shared equally, so first find the total.`,
          resultText: `sum = ${sum}`, expected: [sum], pool: numberPool([sum], 4, sum - 8, sum + 8), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: sum, expr: data.join(' + ') } }) }),
        pickStep({ key: 'count', prompt: `How many numbers are there?`, hint: `Count them.`, why: `We share the total between all the values, so we need how many there are.`,
          resultText: `count = ${n}`, expected: [n], pool: numberPool([n], 3, 2, n + 3), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: n, expr: 'the count' } }) }),
        pickStep({ key: 'mean', prompt: `Mean = sum ÷ count = ${sum} ÷ ${n} = ?`, hint: `${sum} ÷ ${n}.`, why: `The mean is the total divided by how many numbers there are.`,
          resultText: `Mean = ${mean}`, expected: [mean], pool: numberPool([mean], 4, 1, mean + 6), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: mean, expr: `${sum} ÷ ${n}` } }) }),
      ],
    };
  }
  function statMedian(data) {
    const sorted = data.slice().sort((a, b) => a - b), mid = sorted[(sorted.length - 1) / 2];
    return {
      subject: 'stats', given: `Find the MEDIAN of: ${list(data)}`, answer: String(mid),
      steps: [
        buildStep({ key: 'order', prompt: `First put the numbers in order, smallest to biggest (tap the cards in order).`,
          hint: `Start with the smallest and work up: ${sorted.join(', ')}.`, why: `The median is the middle value, so the data must be in order first.`,
          longWay: `In order: ${sorted.join(', ')}`, resultText: `ordered: ${sorted.join(', ')}`,
          pieces: data.map(String), distractors: [], isAnswer: false,
          check: (raw) => { const p = parseNumberList(raw); return (p.length === sorted.length && p.every((v, i) => v === sorted[i])) ? { correct: true } : { correct: false, id: 'stat-median-order', ctx: { sorted: sorted.join(', ') } }; } }),
        pickStep({ key: 'mid', prompt: `Now tap the MIDDLE number (the same amount on each side).`, hint: `Cross off from both ends until one is left: ${mid}.`, why: `With them in order, the median is the middle value.`,
          resultText: `Median = ${mid}`, expected: [mid], pool: uniqSort(sorted), isAnswer: true, diagnose: () => ({ correct: false, id: 'stat-wrong', ctx: { what: 'middle', v: mid } }) }),
      ],
    };
  }

  // ===================== ROUNDING =====================
  const PLACE_NAME = { 10: 'ten', 100: 'hundred', 1000: 'thousand' };
  const LOOK_DIGIT = { 10: 'ones', 100: 'tens', 1000: 'hundreds' };
  function roundNearest(n, place) {
    const digit = Math.floor(n / (place / 10)) % 10, up = digit >= 5, ans = Math.round(n / place) * place;
    return {
      subject: 'rounding', given: `Round ${n} to the nearest ${place}`, answer: String(ans),
      steps: [
        pickStep({ key: 'digit', prompt: `To round ${n} to the nearest ${place}, look at the ${LOOK_DIGIT[place]} digit. What is it?`,
          hint: `In ${n}, the ${LOOK_DIGIT[place]} digit is ${digit}.`, why: `To round to the nearest ${place}, you check the digit ONE place to the right (the ${LOOK_DIGIT[place]}).`,
          resultText: `${LOOK_DIGIT[place]} digit = ${digit}`, expected: [digit], pool: uniqSort([digit, (digit + 3) % 10, (digit + 7) % 10, (digit + 5) % 10]),
          diagnose: () => ({ correct: false, id: 'round-digit', ctx: { n, place, look: LOOK_DIGIT[place], digit } }) }),
        pickStep({ key: 'updown', prompt: `The digit is ${digit}. Is that 5 or more (round up) or less than 5 (round down)?`,
          hint: `${digit} ${up ? 'is 5 or more → round UP' : 'is less than 5 → round DOWN'}.`, why: `5 or more rounds UP; 4 or less rounds DOWN. That's the rounding rule.`,
          resultText: up ? 'round up' : 'round down', expected: [up ? 'Round up' : 'Round down'], pool: ['Round up', 'Round down'],
          diagnose: () => ({ correct: false, id: 'round-updown', ctx: { digit, up } }) }),
        pickStep({ key: 'ans', prompt: `So ${n} to the nearest ${place} is?`, hint: `Round ${up ? 'up' : 'down'} to the nearest ${place}: ${ans}.`, why: `Rounding ${up ? 'up' : 'down'} to the nearest ${place} gives ${ans}.`,
          resultText: `≈ ${ans}`, expected: [ans], pool: uniqSort([ans, ans + place, ans - place, Math.floor(n / place) * place, Math.ceil(n / place) * place].filter((x) => x >= 0)), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'round-wrong', ctx: { n, place, ans } }) }),
      ],
    };
  }
  function roundDP(xStr, dp) {
    const val = parseFloat(xStr), factor = Math.pow(10, dp);
    const ans = (Math.round(val * factor) / factor).toFixed(dp);
    const nextDigit = Math.floor(Math.abs(val) * factor * 10) % 10, up = nextDigit >= 5;
    return {
      subject: 'rounding', given: `Round ${xStr} to ${dp} decimal place${dp > 1 ? 's' : ''}`, answer: ans,
      steps: [
        pickStep({ key: 'digit', prompt: `To round ${xStr} to ${dp} d.p., look at the digit just AFTER the ${dp}${dp === 1 ? 'st' : dp === 2 ? 'nd' : 'rd'} decimal place. What is it?`,
          hint: `The deciding digit is ${nextDigit}.`, why: `To round to ${dp} decimal place${dp > 1 ? 's' : ''}, look at the next digit along — the one you're about to cut off.`,
          resultText: `deciding digit = ${nextDigit}`, expected: [nextDigit], pool: uniqSort([nextDigit, (nextDigit + 3) % 10, (nextDigit + 6) % 10, (nextDigit + 5) % 10]),
          diagnose: () => ({ correct: false, id: 'round-digit', ctx: { n: xStr, place: dp + ' d.p.', look: 'next', digit: nextDigit } }) }),
        pickStep({ key: 'updown', prompt: `That digit is ${nextDigit}. Round up or down?`, hint: `${nextDigit} ${up ? '≥ 5 → up' : '< 5 → down'}.`, why: `5 or more rounds up; less than 5 rounds down.`,
          resultText: up ? 'round up' : 'round down', expected: [up ? 'Round up' : 'Round down'], pool: ['Round up', 'Round down'],
          diagnose: () => ({ correct: false, id: 'round-updown', ctx: { digit: nextDigit, up } }) }),
        pickStep({ key: 'ans', prompt: `So ${xStr} to ${dp} d.p. is?`, hint: `${ans}.`, why: `Keeping ${dp} decimal place${dp > 1 ? 's' : ''} and rounding ${up ? 'up' : 'down'} gives ${ans}.`,
          resultText: `≈ ${ans}`, expected: [ans], pool: uniqSort([ans, (parseFloat(ans) + 1 / factor).toFixed(dp), (parseFloat(ans) - 1 / factor).toFixed(dp), val.toFixed(dp + 1)]).map(String), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'round-wrong', ctx: { n: xStr, place: dp + ' d.p.', ans } }) }),
      ],
    };
  }

  // ===================== INTEGERS =====================
  function negAddSub(a, b, minus) {
    // compute a (+/−) b, allowing negatives; special-case subtracting a negative
    const steps = [];
    let expr, result;
    if (minus && b < 0) {
      const bb = -b, res = a + bb;
      steps.push(pickStep({ key: 'rewrite', prompt: `${a} − (${b}): subtracting a negative is the same as ADDING. Rewrite ${a} − (${b}) as?`,
        hint: `Two minuses make a plus: ${a} − (${b}) = ${a} + ${bb}.`, why: `Subtracting a negative number is the same as adding the positive: − (−n) becomes + n.`,
        resultText: `${a} + ${bb}`, expected: [`${a} + ${bb}`], pool: [`${a} + ${bb}`, `${a} − ${bb}`, `${a} + ${b}`],
        diagnose: () => ({ correct: false, id: 'neg-rewrite', ctx: { a, b } }) }));
      result = res; expr = `${a} + ${bb}`;
      steps.push(pickStep({ key: 'ans', prompt: `Now work it out: ${a} + ${bb} = ?`, hint: `${a} + ${bb}.`, why: `Add as normal once the double-negative is fixed.`,
        resultText: `= ${result}`, expected: [result], pool: intPool(result), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: result, expr } }) }));
    } else {
      result = minus ? a - b : a + b; expr = `${a} ${minus ? '−' : '+'} ${b}`;
      steps.push(pickStep({ key: 'ans', prompt: `Work it out: ${expr} = ?`,
        hint: minus ? `Count back ${b} from ${a} on the number line.` : (a < 0 ? `Start at ${a} and count on ${b}.` : `${a} + ${b}.`),
        why: `Think of a number line: + moves right, − moves left. Crossing zero is fine — you can go negative.`,
        resultText: `= ${result}`, expected: [result], pool: intPool(result), isAnswer: true,
        diagnose: () => ({ correct: false, id: 'neg-line', ctx: { expr, answer: result } }) }));
    }
    return { subject: 'integers', given: expr.replace(/\+ -/, '+ ') , answer: String(result), steps: steps };
  }
  function negMulDiv(a, b, divide) {
    const result = divide ? a / b : a * b, negResult = result < 0;
    const bothNeg = a < 0 && b < 0, oneNeg = (a < 0) !== (b < 0);
    return {
      subject: 'integers', given: `${a} ${divide ? '÷' : '×'} ${b}`, answer: String(result),
      steps: [
        pickStep({ key: 'sign', prompt: `${a} ${divide ? '÷' : '×'} ${b}: will the answer be positive or negative?`,
          hint: oneNeg ? `One negative → the answer is NEGATIVE.` : `${bothNeg ? 'Two negatives' : 'Two positives'} → the answer is POSITIVE.`,
          why: `Same signs (++ or −−) give a POSITIVE answer. Different signs (+− or −+) give a NEGATIVE answer.`,
          resultText: negResult ? 'negative' : 'positive', expected: [negResult ? 'Negative' : 'Positive'], pool: ['Positive', 'Negative'],
          diagnose: () => ({ correct: false, id: 'neg-sign', ctx: { neg: negResult } }) }),
        pickStep({ key: 'ans', prompt: `Now the value: ${Math.abs(a)} ${divide ? '÷' : '×'} ${Math.abs(b)} ${negResult ? '(then make it negative)' : ''} = ?`,
          hint: `${Math.abs(a)} ${divide ? '÷' : '×'} ${Math.abs(b)} = ${Math.abs(result)}${negResult ? ', so −' + Math.abs(result) : ''}.`,
          why: `Work out the numbers ignoring signs, then apply the sign you decided.`, resultText: `= ${result}`, expected: [result], pool: intPool(result, Math.max(6, Math.abs(result))), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: result, expr: `${a} ${divide ? '÷' : '×'} ${b}` } }) }),
      ],
    };
  }
  function orderOps(a, b, c, op1, op2) {
    // a op1 b op2 c, with one of them × so BODMAS matters. Keep it simple: a + b × c  or  a × b + c
    // We'll always make the middle be × so "do × first".
    const first = b * c, ans = op1 === '+' ? a + first : a - first;
    return {
      subject: 'integers', given: `${a} ${op1} ${b} × ${c}`, answer: String(ans),
      steps: [
        pickStep({ key: 'which', prompt: `${a} ${op1} ${b} × ${c}: which do you do FIRST?`, hint: `× and ÷ come before + and −.`, why: `Order of operations (BODMAS): do multiplication and division before addition and subtraction.`,
          resultText: `do ${b} × ${c} first`, expected: [`${b} × ${c}`], pool: [`${b} × ${c}`, `${a} ${op1} ${b}`], diagnose: () => ({ correct: false, id: 'order-first', ctx: { b, c } }) }),
        pickStep({ key: 'mult', prompt: `${b} × ${c} = ?`, hint: `${b} × ${c}.`, why: `Multiply first.`, resultText: `${b} × ${c} = ${first}`, expected: [first], pool: numberPool([first], 4, 0, first + 8),
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: first, expr: `${b} × ${c}` } }) }),
        pickStep({ key: 'ans', prompt: `Now ${a} ${op1} ${first} = ?`, hint: `${a} ${op1} ${first}.`, why: `Finish with the addition or subtraction.`, resultText: `= ${ans}`, expected: [ans], pool: numberPool([ans], 4, ans - 8, ans + 8), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: ans, expr: `${a} ${op1} ${first}` } }) }),
      ],
    };
  }

  const api = {
    fracSimplify, fracOfAmount, fracAdd,
    statMode, statRange, statMean, statMedian,
    roundNearest, roundDP,
    negAddSub, negMulDiv, orderOps,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
