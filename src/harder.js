/* harder.js — Challenge-level generators for the NUMBER topics.
   Everything here is the third rung of a ladder: the boys found the old levels
   too easy, so these are the Y7-and-beyond versions of each subject.
   Same contract as every other topic file:
     { subject, given, answer, steps[], sig?, diagram? }
   and each step is a pick/build/choose step from topics.js. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, chooseStep = W._chooseStep;
  const numberPool = W._numberPool, list = W._list, shuffle = W._shuffle;
  const { gcd, lcm, factors, common, parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- small shared helpers ----------
  // A numeric step: one number to tap, distractors drawn near the answer.
  function nStep(o) {
    const a = o.answer;
    const lo = o.lo != null ? o.lo : a - 12, hi = o.hi != null ? o.hi : a + 12;
    const pool = o.pool || numberPool([a], 4, lo, hi);
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], pool, isAnswer: !!o.isAnswer,
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }
  // A step whose answer is a string (decimals, "3/8", "25%").
  function sStep(o) {
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [o.answer], pool: o.pool, isAnswer: !!o.isAnswer,
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: o.answer, expr: o.expr } }),
    });
  }
  // exact decimal arithmetic via scaled integers (never trust binary floats)
  function toScaled(s) {
    const str = String(s), i = str.indexOf('.');
    const dp = i < 0 ? 0 : str.length - i - 1;
    return { v: Math.round(Number(str) * Math.pow(10, dp)), dp };
  }
  function fromScaled(v, dp) {
    if (dp <= 0) return String(v * Math.pow(10, -dp));
    const neg = v < 0; v = Math.abs(v);
    let s = String(v).padStart(dp + 1, '0');
    s = s.slice(0, s.length - dp) + '.' + s.slice(s.length - dp);
    s = s.replace(/\.?0+$/, '');
    if (s === '' || s === '-') s = '0';
    return (neg && Number(s) !== 0 ? '-' : '') + s;
  }
  const dpOf = (s) => toScaled(s).dp;
  const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000));
  // distinct string options around a decimal answer, keeping the same "look"
  function decPool(correct, others) {
    const out = [];
    [correct, ...others].forEach((x) => { const s = String(x); if (!out.includes(s)) out.push(s); });
    return shuffle(out);
  }

  // ============================================================ HCF of three
  function factorChoose(n, key) {
    const f = factors(n);
    return chooseStep({
      key: 'f-' + key,
      prompt: `List all the factors of ${n}. Tap every number that divides ${n} exactly.`,
      hint: `Work in pairs: 1×${n}, 2×?, 3×? … and 1 and ${n} always count.`,
      why: `A factor divides the number with nothing left over. With three numbers you need all three lists before you can compare them.`,
      resultText: `Factors of ${n}: ${list(f)}`,
      expected: f, pool: numberPool(f, f.length > 9 ? 2 : 4, 2, n),
      diagnose: (sel, exp) => {
        const extra = sel.filter((x) => !exp.includes(x));
        if (extra.length) return { correct: false, id: 'factor-not', ctx: { n, bad: extra[0] } };
        return { correct: false, id: 'factor-missed', ctx: { n, missing: exp.filter((x) => !sel.includes(x)).join(', ') } };
      },
    });
  }
  function hcf3(a, b, c, story) {
    const fa = factors(a), fb = factors(b), fc = factors(c);
    const cf = common(common(fa, fb), fc), h = cf[cf.length - 1];
    const steps = [
      factorChoose(a, 'a'), factorChoose(b, 'b'), factorChoose(c, 'c'),
      chooseStep({
        key: 'common',
        prompt: `Now tap the numbers that appear in ALL THREE lists (the common factors of ${a}, ${b} and ${c}).`,
        hint: `Common factors of all three: ${list(cf)}.`,
        why: `A common factor has to divide every one of the numbers. If it is missing from even one list, it does not count.`,
        longWay: `${a}: ${list(fa)}\n${b}: ${list(fb)}\n${c}: ${list(fc)}\nIn all three: ${list(cf)}`,
        resultText: `Common factors: ${list(cf)}`,
        expected: cf, pool: uniqSort([...fa, ...fb, ...fc]),
        diagnose: () => ({ correct: false, id: 'hcf-common', ctx: { cf: list(cf) } }),
      }),
      nStep({
        key: 'hcf', prompt: `The HCF is the biggest of those. HCF of ${a}, ${b} and ${c} = ?`,
        hint: `The largest number in ${list(cf)} is ${h}.`,
        why: `HCF means Highest Common Factor — of all the factors they share, take the largest.`,
        resultText: `HCF = ${h}`, answer: h, expr: `the largest of ${list(cf)}`,
        pool: cf.length > 1 ? cf : numberPool([h], 3, 1, h + 6), isAnswer: true,
      }),
    ];
    return { subject: 'hcf', given: story || `Find the HCF of ${a}, ${b} and ${c}`, sig: `hcf3:${a},${b},${c}`, answer: String(h), steps };
  }

  // ============================================================ LCM of three
  function multipleChoose(n, upto, key) {
    const ms = []; for (let i = 1; i * n <= upto; i++) ms.push(i * n);
    return chooseStep({
      key: 'm-' + key,
      prompt: `Tap the multiples of ${n} up to ${upto} (count up in ${n}s).`,
      hint: `${n}, ${2 * n}, ${3 * n}, … up to ${upto}.`,
      why: `A multiple is what you land on counting up in ${n}s. Listing all three sets lets you spot the first number they share.`,
      resultText: `Multiples of ${n}: ${list(ms)}`,
      expected: ms, pool: numberPool(ms, 4, 2, upto),
      diagnose: () => ({ correct: false, id: 'lcm-multiple', ctx: { n, ms: list(ms) } }),
    });
  }
  function lcm3(a, b, c, story) {
    const L = lcm(lcm(a, b), c);
    const upto = L;
    const steps = [
      multipleChoose(a, upto, 'a'), multipleChoose(b, upto, 'b'), multipleChoose(c, upto, 'c'),
      nStep({
        key: 'lcm', prompt: `What is the SMALLEST number that appears in all three lists?`,
        hint: `${a}, ${b} and ${c} all divide into ${L}, and nothing smaller works.`,
        why: `The LCM is the first number all three counts land on together. It must be a multiple of every one of them.`,
        longWay: `${L} ÷ ${a} = ${L / a}, ${L} ÷ ${b} = ${L / b}, ${L} ÷ ${c} = ${L / c} — all whole, and no smaller number does that.`,
        resultText: `LCM = ${L}`, answer: L, expr: `the first shared multiple of ${a}, ${b} and ${c}`,
        pool: uniqSort([L, a * b, L / 2, L + a, L - a].filter((x) => Number.isInteger(x) && x > 0)), isAnswer: true,
      }),
    ];
    return { subject: 'lcm', given: story || `Find the LCM of ${a}, ${b} and ${c}`, sig: `lcm3:${a},${b},${c}`, answer: String(L), steps };
  }

  // ============================================================ RATIO — challenge
  // Share in a THREE-part ratio.
  function ratio3(amount, a, b, c, unit) {
    const u = unit || '';
    const parts = a + b + c, one = amount / parts;
    const A = a * one, B = b * one, C = c * one;
    return {
      subject: 'ratio', given: `Share ${u}${amount} in the ratio ${a} : ${b} : ${c}`, sig: `r3:${amount}:${a}:${b}:${c}`,
      answer: `${u}${A}, ${u}${B} and ${u}${C}`,
      steps: [
        nStep({ key: 'parts', prompt: `How many parts altogether? ${a} + ${b} + ${c} = ?`, hint: `Add all three numbers in the ratio.`,
          why: `The ratio splits the amount into ${a} + ${b} + ${c} equal parts. You must know how many parts there are before you can size one.`,
          resultText: `${parts} parts`, answer: parts, expr: `${a} + ${b} + ${c}` }),
        nStep({ key: 'one', prompt: `What is ONE part worth? ${amount} ÷ ${parts} = ?`, hint: `${amount} ÷ ${parts}.`,
          why: `Divide the whole amount by the number of parts to find what a single part is worth.`,
          resultText: `1 part = ${u}${one}`, answer: one, expr: `${amount} ÷ ${parts}` }),
        nStep({ key: 'a', prompt: `First share: ${a} parts = ${a} × ${one} = ?`, hint: `${a} × ${one}.`,
          why: `Each person gets their number of parts, each part worth ${u}${one}.`,
          resultText: `${u}${A}`, answer: A, expr: `${a} × ${one}` }),
        nStep({ key: 'b', prompt: `Second share: ${b} parts = ${b} × ${one} = ?`, hint: `${b} × ${one}.`,
          why: `Same again with ${b} parts.`, resultText: `${u}${B}`, answer: B, expr: `${b} × ${one}` }),
        nStep({ key: 'c', prompt: `Third share: ${c} parts = ${c} × ${one} = ?`, hint: `${c} × ${one}.`,
          why: `The three shares must add back to ${u}${amount} — that is your check: ${A} + ${B} + ${C} = ${amount}.`,
          longWay: `${A} + ${B} + ${C} = ${amount} ✓`,
          resultText: `${u}${A}, ${u}${B} and ${u}${C}`, answer: C, expr: `${c} × ${one}`, isAnswer: true }),
      ],
    };
  }
  // The DIFFERENCE between two shares is given — find the total.
  function ratioDifference(a, b, one, unit, thing) {
    const u = unit || '';
    const hi = Math.max(a, b), lo = Math.min(a, b);
    const dParts = hi - lo, diff = dParts * one, parts = a + b, total = parts * one;
    return {
      subject: 'ratio', given: `${thing} are shared in the ratio ${a} : ${b}. One share is ${u}${diff} MORE than the other. How much was shared altogether?`,
      sig: `rdiff:${a}:${b}:${one}`, answer: `${u}${total}`,
      steps: [
        nStep({ key: 'dp', prompt: `How many parts is the difference? ${hi} − ${lo} = ?`, hint: `${hi} − ${lo}.`,
          why: `The bigger share has ${hi} parts and the smaller has ${lo}, so the gap between them is ${hi} − ${lo} parts. That gap is the ${u}${diff} you were told.`,
          resultText: `the difference is ${dParts} part${dParts > 1 ? 's' : ''}`, answer: dParts, expr: `${hi} − ${lo}`, lo: 0, hi: hi + 4 }),
        nStep({ key: 'one', prompt: `Those ${dParts} part${dParts > 1 ? 's are' : ' is'} worth ${u}${diff}. So ONE part = ${diff} ÷ ${dParts} = ?`, hint: `${diff} ÷ ${dParts}.`,
          why: `Once you know how many parts the difference is, divide to get the value of a single part. Everything else follows from that.`,
          resultText: `1 part = ${u}${one}`, answer: one, expr: `${diff} ÷ ${dParts}` }),
        nStep({ key: 'tp', prompt: `How many parts altogether? ${a} + ${b} = ?`, hint: `${a} + ${b}.`,
          why: `The total is made of ${a} + ${b} parts.`, resultText: `${parts} parts`, answer: parts, expr: `${a} + ${b}` }),
        nStep({ key: 'total', prompt: `Total shared: ${parts} × ${one} = ?`, hint: `${parts} × ${one}.`,
          why: `All ${parts} parts together make the whole amount.`, resultText: `Total = ${u}${total}`, answer: total, expr: `${parts} × ${one}`,
          lo: Math.max(0, total - 20), hi: total + 20, isAnswer: true }),
      ],
    };
  }
  // ONE share is known — find the other.
  function ratioOnePart(a, b, one, names) {
    const A = a * one, B = b * one;
    return {
      subject: 'ratio', given: `${names[0]} and ${names[1]} are in the ratio ${a} : ${b}. There are ${A} ${names[0].toLowerCase()}. How many ${names[1].toLowerCase()}?`,
      sig: `rone:${a}:${b}:${one}`, answer: String(B),
      steps: [
        nStep({ key: 'one', prompt: `${A} ${names[0].toLowerCase()} is ${a} part${a > 1 ? 's' : ''}. So ONE part = ${A} ÷ ${a} = ?`, hint: `${A} ÷ ${a}.`,
          why: `Find the value of a single part first — the ratio only tells you the size of the parts, never the totals.`,
          resultText: `1 part = ${one}`, answer: one, expr: `${A} ÷ ${a}` }),
        nStep({ key: 'other', prompt: `${names[1]} is ${b} part${b > 1 ? 's' : ''}: ${b} × ${one} = ?`, hint: `${b} × ${one}.`,
          why: `Multiply the value of one part by how many parts the other side has.`,
          resultText: `${B} ${names[1].toLowerCase()}`, answer: B, expr: `${b} × ${one}`, lo: Math.max(0, B - 15), hi: B + 15, isAnswer: true }),
      ],
    };
  }

  // ============================================================ DECIMALS — multiply & divide
  function decMul(x, y) {
    const sx = toScaled(x), sy = toScaled(y);
    const prod = sx.v * sy.v, places = sx.dp + sy.dp;
    const ans = fromScaled(prod, places);
    return {
      subject: 'decimals', given: `Work out ${x} × ${y}`, sig: `dm:${x}x${y}`, answer: ans,
      steps: [
        nStep({ key: 'whole', prompt: `Ignore the decimal points for a moment. What is ${sx.v} × ${sy.v}?`,
          hint: `${sx.v} × ${sy.v} = ${prod}.`,
          why: `Take the points out, multiply the whole numbers, then put the point back at the end. The digits are the same either way.`,
          resultText: `${sx.v} × ${sy.v} = ${prod}`, answer: prod, lo: Math.max(0, prod - 20), hi: prod + 20, expr: `${sx.v} × ${sy.v}` }),
        nStep({ key: 'places', prompt: `Count the decimal places in the question: ${x} has ${sx.dp}, ${y} has ${sy.dp}. How many altogether?`,
          hint: `${sx.dp} + ${sy.dp} = ${places}.`,
          why: `The answer must have the SAME number of decimal places as the question has in total. That is the rule that puts the point back in the right place.`,
          resultText: `${places} decimal place${places === 1 ? '' : 's'}`, answer: places, pool: [0, 1, 2, 3, 4], expr: `${sx.dp} + ${sy.dp}` }),
        sStep({ key: 'ans', prompt: `Now put the point back into ${prod}, ${places} place${places === 1 ? '' : 's'} from the right. ${x} × ${y} = ?`,
          hint: `${prod} with ${places} decimal place${places === 1 ? '' : 's'} is ${ans}.`,
          why: `Count ${places} digit${places === 1 ? '' : 's'} in from the right of ${prod} and drop the point there.`,
          longWay: `${sx.v} × ${sy.v} = ${prod}, and ${sx.dp} + ${sy.dp} = ${places} d.p. → ${ans}`,
          resultText: `${x} × ${y} = ${ans}`, answer: ans, expr: `${x} × ${y}`, isAnswer: true,
          pool: decPool(ans, [fromScaled(prod, Math.max(0, places - 1)), fromScaled(prod, places + 1), String(prod)]) }),
      ],
    };
  }
  function decDiv(x, y) {
    // scale BOTH until the divisor is a whole number, then divide
    const sy = toScaled(y), k = sy.dp;
    const bigX = fromScaled(toScaled(x).v * Math.pow(10, k), toScaled(x).dp);
    const bigY = fromScaled(sy.v, 0);
    const ansN = Number(x) / Number(y);
    const ans = fmt(Math.round(ansN * 1000) / 1000);
    const pow = Math.pow(10, k);
    return {
      subject: 'decimals', given: `Work out ${x} ÷ ${y}`, sig: `dd:${x}/${y}`, answer: ans,
      steps: [
        nStep({ key: 'pow', prompt: `Dividing by a decimal is awkward. Multiply BOTH numbers by what to make ${y} a whole number?`,
          hint: `${y} has ${k} decimal place${k === 1 ? '' : 's'}, so × ${pow}.`,
          why: `A division is a fraction. Multiplying top and bottom by the same amount does not change the answer — but it makes the divisor whole and easy.`,
          resultText: `× ${pow}`, answer: pow, pool: [10, 100, 1000], expr: `10 to the power of ${k}` }),
        sStep({ key: 'newq', prompt: `So ${x} ÷ ${y} becomes ${bigX} ÷ ? (the divisor, now whole)`,
          hint: `${y} × ${pow} = ${bigY}.`,
          why: `Both numbers scale up by ${pow}, so the division is now ${bigX} ÷ ${bigY} — same answer, no decimal on the bottom.`,
          resultText: `${bigX} ÷ ${bigY}`, answer: bigY, expr: `${y} × ${pow}`,
          pool: decPool(bigY, [String(Number(bigY) * 10), String(y), String(Number(bigY) / 10)]) }),
        sStep({ key: 'ans', prompt: `Now do it: ${bigX} ÷ ${bigY} = ?`, hint: `${bigX} ÷ ${bigY} = ${ans}.`,
          why: `Dividing by a whole number is the ordinary bus-stop method you already know.`,
          longWay: `${x} ÷ ${y} = ${bigX} ÷ ${bigY} = ${ans}`,
          resultText: `${x} ÷ ${y} = ${ans}`, answer: ans, expr: `${bigX} ÷ ${bigY}`, isAnswer: true,
          pool: decPool(ans, [fmt(Number(ans) * 10), fmt(Number(ans) / 10), fmt(Number(ans) + 1)]) }),
      ],
    };
  }

  // ============================================================ PERCENTAGES — challenge
  // Reusable: build p% of A out of 10% and 1% chunks. Returns {steps, value}.
  function pctPart(p, A, u, kp) {
    const per10 = A / 10, per1 = A / 100;
    const t = Math.floor(p / 10), r = p % 10;
    const tens = t * per10, ones = r * per1, value = tens + ones;
    const steps = [];
    steps.push(nStep({ key: kp + 'ten', prompt: `Find 10% of ${u}${A} first (÷ 10).`, hint: `${A} ÷ 10 = ${per10}.`,
      why: `10% and 1% are the two building blocks. From them you can make any whole percentage without a calculator.`,
      resultText: `10% = ${u}${per10}`, answer: per10, lo: 1, hi: per10 + Math.max(10, per10), expr: `${A} ÷ 10` }));
    if (r !== 0) {
      steps.push(nStep({ key: kp + 'one', prompt: `Now 1% of ${u}${A} (÷ 100).`, hint: `${A} ÷ 100 = ${per1}.`,
        why: `1% is a hundredth, so divide by 100. You will need ${r} of these.`,
        resultText: `1% = ${u}${per1}`, answer: per1, lo: 1, hi: per1 + Math.max(10, per1), expr: `${A} ÷ 100` }));
    }
    if (t > 0) {
      steps.push(nStep({ key: kp + 'tens', prompt: `${t * 10}% is ${t} lots of 10%: ${t} × ${per10} = ?`, hint: `${t} × ${per10}.`,
        why: `${t * 10}% = ${t} × 10%.`, resultText: `${t * 10}% = ${u}${tens}`, answer: tens, lo: 1, hi: tens + Math.max(10, per10), expr: `${t} × ${per10}` }));
    }
    if (r !== 0) {
      steps.push(nStep({ key: kp + 'ones', prompt: `${r}% is ${r} lots of 1%: ${r} × ${per1} = ?`, hint: `${r} × ${per1}.`,
        why: `${r}% = ${r} × 1%.`, resultText: `${r}% = ${u}${ones}`, answer: ones, lo: 1, hi: ones + Math.max(10, per1), expr: `${r} × ${per1}` }));
      steps.push(nStep({ key: kp + 'add', prompt: `Add the chunks: ${p}% = ${t * 10}% + ${r}% = ${tens} + ${ones} = ?`, hint: `${tens} + ${ones}.`,
        why: `${p}% = ${t * 10}% + ${r}%, so add the two amounts you just built.`,
        resultText: `${p}% of ${u}${A} = ${u}${value}`, answer: value, lo: Math.max(0, value - 15), hi: value + 15, expr: `${tens} + ${ones}` }));
    }
    return { steps, value };
  }
  // Any whole percentage of an amount (not just the friendly ones).
  function percentAny(p, A, unit) {
    const u = unit || '';
    const { steps, value } = pctPart(p, A, u, 'pa');
    steps[steps.length - 1].isAnswer = true;
    return { subject: 'percent', given: `Find ${p}% of ${u}${A}`, sig: `pa:${p}:${A}`, answer: `${u}${value}`, steps };
  }
  // Increase or decrease by a percentage.
  function percentChange(p, A, up, unit, story) {
    const u = unit || '';
    const { steps, value } = pctPart(p, A, u, 'pc');
    const final = up ? A + value : A - value;
    steps.push(nStep({
      key: 'final', prompt: `${up ? 'Add it on' : 'Take it off'}: ${A} ${up ? '+' : '−'} ${value} = ?`,
      hint: `${A} ${up ? '+' : '−'} ${value} = ${final}.`,
      why: `A ${p}% ${up ? 'increase' : 'decrease'} means work out the ${p}% and then ${up ? 'add it to' : 'subtract it from'} the original. The original amount is always 100% — you are ${up ? 'going above' : 'coming down from'} it.`,
      longWay: `${p}% of ${u}${A} = ${u}${value}, so the new amount is ${u}${A} ${up ? '+' : '−'} ${u}${value} = ${u}${final}`,
      resultText: `New amount = ${u}${final}`, answer: final, lo: Math.max(0, final - 20), hi: final + 20,
      expr: `${A} ${up ? '+' : '−'} ${value}`, isAnswer: true,
    }));
    return { subject: 'percent', given: story, sig: `pchg:${p}:${A}:${up ? 'u' : 'd'}`, answer: `${u}${final}`, steps };
  }
  // Find the percentage change from old → new.
  // NO CALCULATOR. "38 ÷ 190 × 100" is not something a Year 7 can do in their head, and
  // it isn't the school's method either — Topic 15 is non-calculator throughout. The
  // route taught is: change as a FRACTION of the original → simplify → use the common
  // fraction/percentage equivalents from Topic 11. So the generator only ever produces
  // changes that simplify to a friendly fraction.
  function percentChangeFind(oldV, newV, unit, story) {
    const u = unit || '';
    const up = newV > oldV, change = Math.abs(newV - oldV);
    const g = gcd(change, oldV), sn = change / g, sd = oldV / g;
    const pct = Math.round((change / oldV) * 100);
    const cf = common(factors(change), factors(oldV));
    return {
      subject: 'percent', given: story, sig: `pcf:${oldV}:${newV}`, answer: `${pct}% ${up ? 'increase' : 'decrease'}`,
      steps: [
        nStep({ key: 'change', prompt: `First, how big is the change? ${Math.max(oldV, newV)} − ${Math.min(oldV, newV)} = ?`,
          hint: `${Math.max(oldV, newV)} − ${Math.min(oldV, newV)} = ${change}.`,
          why: `Percentage change always starts with the actual change: how much it went ${up ? 'up' : 'down'} by.`,
          resultText: `change = ${u}${change}`, answer: change, lo: 0, hi: change + 15, expr: `${Math.max(oldV, newV)} − ${Math.min(oldV, newV)}` }),
        nStep({ key: 'hcf', prompt: `Now write the change as a fraction of the ORIGINAL: ${change}/${oldV}. To simplify it, what is the HCF of ${change} and ${oldV}?`,
          hint: `Common factors of ${change} and ${oldV}: ${list(cf)} — take the biggest, ${g}.`,
          why: `You compare the change to the ORIGINAL amount, never the new one — the original is the 100% you are measuring against. Simplifying ${change}/${oldV} first is what keeps this a no-calculator question.`,
          resultText: `HCF of ${change} and ${oldV} = ${g}`, answer: g, pool: cf.length > 2 ? cf : numberPool(cf, 3, 2, Math.max(change, 12)),
          expr: `the HCF of ${change} and ${oldV}` }),
        sStep({ key: 'frac', prompt: `Divide top and bottom by ${g}. What does ${change}/${oldV} simplify to?`,
          hint: `${change} ÷ ${g} = ${sn} and ${oldV} ÷ ${g} = ${sd}, so ${sn}/${sd}.`,
          why: `A simple fraction like ${sn}/${sd} is one you already know as a percentage — that is the whole point of simplifying first.`,
          resultText: `${change}/${oldV} = ${sn}/${sd}`, answer: `${sn}/${sd}`, expr: `${change}/${oldV} simplified`,
          pool: shuffle([...new Set([`${sn}/${sd}`, `${sd}/${sn}`, `${change}/${oldV}`, `${sn}/${sd + 1}`])]) }),
        nStep({ key: 'pct', prompt: `Last step: what is ${sn}/${sd} as a percentage?`,
          hint: `${sn}/${sd} = ${pct}%.`,
          why: `Use the equivalents you know: 1/2 = 50%, 1/4 = 25%, 1/5 = 20%, 1/10 = 10%, 1/20 = 5%. Here ${sn}/${sd} = ${pct}%.`,
          longWay: `Change: ${change}\nAs a fraction of the original: ${change}/${oldV}\nSimplify (÷${g}): ${sn}/${sd}\nAs a percentage: ${pct}%\nSo it is a ${pct}% ${up ? 'increase' : 'decrease'}.`,
          resultText: `${pct}% ${up ? 'increase' : 'decrease'}`, answer: pct,
          pool: uniqSort([pct, 100 - pct, sd, Math.round(pct / 2), pct * 2].filter((v) => v > 0 && v <= 100)),
          expr: `${sn}/${sd} as a percentage`, isAnswer: true }),
      ],
    };
  }
  // REVERSE percentage: the price AFTER the change is given; find the original.
  // Textbooks reach for 1%, but "£48 ÷ 80" is not a mental step. Stepping down to the
  // HCF of the percentage and 100 instead keeps every division small: for 80% you go
  // via 20% (÷4, then ×5), for 75% via 25% (÷3, then ×4), for 90% via 10% (÷9, ×10).
  function percentReverse(p, orig, up, unit, story) {
    const u = unit || '';
    const nowPct = up ? 100 + p : 100 - p;
    const now = (orig * nowPct) / 100;
    const step = gcd(nowPct, 100);            // the percentage we drop down to
    const parts = nowPct / step;              // how many of them make up `now`
    const unitVal = now / parts;              // what `step`% is worth
    const ups = 100 / step;                   // how many to build back to 100%
    const steps = [
      nStep({ key: 'pct', prompt: `The original price is 100%. After a ${p}% ${up ? 'increase' : 'decrease'}, ${u}${now} is what percentage of the original?`,
        hint: `100 ${up ? '+' : '−'} ${p} = ${nowPct}%.`,
        why: `This is the whole trick. ${u}${now} is NOT 100% — it is ${nowPct}% of the original. Taking ${p}% of ${u}${now} would be wrong, because the ${p}% came off the ORIGINAL price, not off this one.`,
        resultText: `${u}${now} = ${nowPct}%`, answer: nowPct, pool: uniqSort([nowPct, 100, p, up ? 100 - p : 100 + p]), expr: `100 ${up ? '+' : '−'} ${p}` }),
    ];
    if (parts > 1) {
      steps.push(nStep({ key: 'unit', prompt: `${nowPct}% = ${u}${now}, and ${nowPct}% is ${parts} lots of ${step}%. So what is ${step}%? ${now} ÷ ${parts} = ?`,
        hint: `${now} ÷ ${parts} = ${unitVal}.`,
        why: `Step down to a percentage that divides into both ${nowPct} and 100 — here ${step}%. That keeps the division small enough to do without a calculator, and ${step}% builds straight back up to 100%.`,
        resultText: `${step}% = ${u}${unitVal}`, answer: unitVal, lo: 1, hi: unitVal + Math.max(12, unitVal), expr: `${now} ÷ ${parts}` }));
    }
    steps.push(nStep({ key: 'orig', prompt: `100% is ${ups} lots of ${step}%. So the original = ${unitVal} × ${ups} = ?`,
      hint: `${unitVal} × ${ups} = ${orig}.`,
      why: `100% is the original price — the number the question asked for.`,
      longWay: `${nowPct}% = ${u}${now}\n${step}% = ${u}${now} ÷ ${parts} = ${u}${unitVal}\n100% = ${u}${unitVal} × ${ups} = ${u}${orig}\nCheck: ${p}% of ${u}${orig} is ${u}${(orig * p) / 100}, and ${u}${orig} ${up ? '+' : '−'} ${u}${(orig * p) / 100} = ${u}${now} ✓`,
      resultText: `Original = ${u}${orig}`, answer: orig, lo: Math.max(0, orig - 25), hi: orig + 25,
      expr: `${unitVal} × ${ups}`, isAnswer: true }));
    return { subject: 'percent', given: story, sig: `prev:${p}:${orig}:${up ? 'u' : 'd'}`, answer: `${u}${orig}`, steps };
  }

  // ============================================================ FRACTIONS — multiply & divide
  function fracMul(a, b, c, d) {
    const n = a * c, den = b * d, g = gcd(n, den), sn = n / g, sd = den / g;
    const simp = g > 1;
    const steps = [
      nStep({ key: 'top', prompt: `Multiplying fractions: tops × tops. ${a} × ${c} = ?`, hint: `${a} × ${c}.`,
        why: `To multiply fractions you do NOT need a common denominator — that rule is only for adding and subtracting. Just multiply straight across.`,
        resultText: `new top = ${n}`, answer: n, lo: 1, hi: n + 12, expr: `${a} × ${c}` }),
      nStep({ key: 'bot', prompt: `Now bottoms × bottoms. ${b} × ${d} = ?`, hint: `${b} × ${d}.`,
        why: `Straight across on the bottom too.`, resultText: `new bottom = ${den}`, answer: den, lo: 1, hi: den + 12, expr: `${b} × ${d}` }),
    ];
    if (simp) {
      steps.push(nStep({ key: 'hcf', prompt: `${n}/${den} can be simplified. What is the HCF of ${n} and ${den}?`,
        hint: `The biggest number that divides both ${n} and ${den} is ${g}.`,
        why: `An answer is only finished when the fraction is in its simplest form. Divide top and bottom by their HCF.`,
        resultText: `HCF = ${g}`, answer: g, pool: common(factors(n), factors(den)), expr: `HCF of ${n} and ${den}` }));
    }
    steps.push(buildStep({
      key: 'write', prompt: `Write the final answer as a fraction (number / number).`,
      hint: `${sn}/${sd}.`, why: simp ? `Divide both by ${g}: ${n} ÷ ${g} = ${sn} and ${den} ÷ ${g} = ${sd}.` : `${n}/${den} is already in its simplest form — nothing divides both.`,
      longWay: `${a}/${b} × ${c}/${d} = ${n}/${den}${simp ? ` = ${sn}/${sd}` : ''}`,
      resultText: `${a}/${b} × ${c}/${d} = ${sn}/${sd}`,
      pieces: [String(sn), '/', String(sd)], distractors: [String(n), String(den), String(sd + 1)], isAnswer: true,
      check: (raw) => {
        const q = parseNumberList(String(raw).replace(/[/]/g, ' '));
        if (q.length < 2) return { correct: false, id: 'frac-form', ctx: { sn, sd } };
        if (q[0] === sn && q[1] === sd) return { correct: true };
        if (q[0] === sd && q[1] === sn) return { correct: false, id: 'frac-flip', ctx: { sn, sd } };
        return { correct: false, id: 'frac-form', ctx: { sn, sd } };
      },
    }));
    return { subject: 'fractions', given: `Work out ${a}/${b} × ${c}/${d}`, sig: `fm:${a}/${b}x${c}/${d}`, answer: `${sn}/${sd}`, steps };
  }
  function fracDiv(a, b, c, d) {
    const n = a * d, den = b * c, g = gcd(n, den), sn = n / g, sd = den / g;
    return {
      subject: 'fractions', given: `Work out ${a}/${b} ÷ ${c}/${d}`, sig: `fd:${a}/${b}div${c}/${d}`, answer: `${sn}/${sd}`,
      steps: [
        pickStep({ key: 'flip', prompt: `Dividing by a fraction: keep the first, flip the second, change ÷ to ×. What does ${c}/${d} become when flipped?`,
          hint: `Turn ${c}/${d} upside down: ${d}/${c}.`,
          why: `Dividing by a fraction is the same as multiplying by its reciprocal (the flipped version). "Keep, Flip, Change" — keep ${a}/${b}, flip ${c}/${d}, change ÷ into ×.`,
          resultText: `${a}/${b} × ${d}/${c}`, expected: [`${d}/${c}`],
          pool: shuffle([...new Set([`${d}/${c}`, `${c}/${d}`, `${a}/${b}`, `${d}/${b}`])]),
          diagnose: () => ({ correct: false, id: 'frac-reciprocal', ctx: { c, d } }) }),
        nStep({ key: 'top', prompt: `Now multiply the tops: ${a} × ${d} = ?`, hint: `${a} × ${d}.`,
          why: `Once it is a multiplication, go straight across.`, resultText: `new top = ${n}`, answer: n, lo: 1, hi: n + 12, expr: `${a} × ${d}` }),
        nStep({ key: 'bot', prompt: `And the bottoms: ${b} × ${c} = ?`, hint: `${b} × ${c}.`,
          why: `Straight across on the bottom.`, resultText: `new bottom = ${den}`, answer: den, lo: 1, hi: den + 12, expr: `${b} × ${c}` }),
        buildStep({ key: 'write', prompt: `Write the answer in its simplest form (number / number).`,
          hint: `${n}/${den} simplifies to ${sn}/${sd}.`,
          why: g > 1 ? `Divide top and bottom by their HCF ${g}.` : `${n}/${den} is already as simple as it goes.`,
          longWay: `${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c} = ${n}/${den}${g > 1 ? ` = ${sn}/${sd}` : ''}`,
          resultText: `= ${sn}/${sd}`, pieces: [String(sn), '/', String(sd)], distractors: [String(n), String(den), String(b)], isAnswer: true,
          check: (raw) => {
            const q = parseNumberList(String(raw).replace(/[/]/g, ' '));
            if (q.length < 2) return { correct: false, id: 'frac-form', ctx: { sn, sd } };
            if (q[0] === sn && q[1] === sd) return { correct: true };
            if (q[0] === sd && q[1] === sn) return { correct: false, id: 'frac-flip', ctx: { sn, sd } };
            return { correct: false, id: 'frac-form', ctx: { sn, sd } };
          } }),
      ],
    };
  }
  // Fraction of an amount with awkward numbers, e.g. 5/8 of 240.
  function fracOfBig(num, den, amount) {
    const one = amount / den, val = num * one;
    return {
      subject: 'fractions', given: `Find ${num}/${den} of ${amount}`, sig: `fob:${num}/${den}:${amount}`, answer: String(val),
      steps: [
        nStep({ key: 'one', prompt: `The bottom tells you how many equal parts. ${amount} ÷ ${den} = ?`, hint: `${amount} ÷ ${den}.`,
          why: `Divide by the denominator to find ONE part — that is what 1/${den} of ${amount} is worth.`,
          resultText: `1/${den} of ${amount} = ${one}`, answer: one, lo: 1, hi: one + Math.max(12, one), expr: `${amount} ÷ ${den}` }),
        nStep({ key: 'mul', prompt: `The top tells you how many of those parts you want: ${num} × ${one} = ?`, hint: `${num} × ${one}.`,
          why: `Divide by the bottom, multiply by the top. ${num}/${den} means ${num} of the ${den} parts.`,
          longWay: `${amount} ÷ ${den} = ${one}\n${one} × ${num} = ${val}`,
          resultText: `${num}/${den} of ${amount} = ${val}`, answer: val, lo: Math.max(0, val - 20), hi: val + 20,
          expr: `${num} × ${one}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ INTEGERS — two-step negatives
  const NEGSHAPES = [
    () => { const a = -rand(2, 9), b = rand(2, 9), c = rand(2, 20); const first = a * b; return { text: `${nf(a)} × ${b} + ${c}`, firstText: `${nf(a)} × ${b}`, first, ans: first + c, opText: `+ ${c}`, finalExpr: `${nf(first)} + ${c}`, why: `× comes before + in BIDMAS. A negative times a positive is negative.` }; },
    () => { const a = -rand(2, 9), b = -rand(2, 9), c = rand(2, 20); const first = a * b; return { text: `${nf(a)} × ${nf(b)} − ${c}`, firstText: `${nf(a)} × ${nf(b)}`, first, ans: first - c, opText: `− ${c}`, finalExpr: `${first} − ${c}`, why: `Two negatives multiplied give a positive. Then subtract.` }; },
    () => { const q = -rand(2, 9), b = rand(2, 8), a = q * b, c = rand(2, 15); const first = q; return { text: `${nf(a)} ÷ ${b} + ${c}`, firstText: `${nf(a)} ÷ ${b}`, first, ans: first + c, opText: `+ ${c}`, finalExpr: `${nf(first)} + ${c}`, why: `÷ before +. A negative divided by a positive is negative.` }; },
    () => { const b = rand(2, 9), c = rand(2, 12), a = -rand(2, 9); const first = b * c; return { text: `${nf(a)} + ${b} × ${c}`, firstText: `${b} × ${c}`, first, ans: a + first, opText: `${nf(a)} +`, finalExpr: `${nf(a)} + ${first}`, why: `Do the × first even though it is written second.` }; },
    () => { const a = rand(2, 12), b = -rand(2, 9), c = rand(2, 6); const first = b * c; return { text: `${a} − ${nf(b)} × ${c}`, firstText: `${nf(b)} × ${c}`, first, ans: a - first, opText: `${a} −`, finalExpr: `${a} − (${nf(first)})`, why: `Multiply first. Subtracting a negative turns into adding.` }; },
    () => { const n = rand(2, 9), c = rand(2, 30); const first = n * n; return { text: `(${nf(-n)})² − ${c}`, firstText: `(${nf(-n)})²`, first, ans: first - c, opText: `− ${c}`, finalExpr: `${first} − ${c}`, why: `A negative squared is POSITIVE: (${nf(-n)})² = ${nf(-n)} × ${nf(-n)} = ${first}. The brackets matter.` }; },
  ];
  function nf(v) { return v < 0 ? `(−${Math.abs(v)})` : String(v); }
  function negTwoStep() {
    const s = pick(NEGSHAPES)();
    return {
      subject: 'integers', given: `Work out  ${s.text}`, sig: `n2:${s.text}`, answer: String(s.ans),
      steps: [
        nStep({ key: 'first', prompt: `Which part comes first? Work out ${s.firstText} = ?`,
          hint: `${s.firstText} = ${s.first}.`, why: s.why,
          resultText: `${s.firstText} = ${s.first}`, answer: s.first,
          lo: s.first - 14, hi: s.first + 14, expr: s.firstText }),
        nStep({ key: 'ans', prompt: `Now finish it: ${s.finalExpr} = ?`, hint: `${s.finalExpr} = ${s.ans}.`,
          why: `Put the piece you worked out back in and finish left to right. Watch the signs — subtracting a negative is the same as adding.`,
          longWay: `${s.text}\n= ${s.finalExpr}\n= ${s.ans}`,
          resultText: `${s.text} = ${s.ans}`, answer: s.ans, lo: s.ans - 14, hi: s.ans + 14,
          expr: s.finalExpr, isAnswer: true }),
      ],
    };
  }

  // ============================================================ ROUNDING — significant figures & estimating
  const ORD = ['', 'first', 'second', 'third'];
  function roundSF(n, sf) {
    const s = String(n);
    const digits = s.replace(/[.-]/g, '').replace(/^0+/, '');
    const mag = Math.floor(Math.log10(Math.abs(n)));
    const scale = Math.pow(10, mag - sf + 1);
    const rounded = Math.round(n / scale) * scale;
    const ans = fmt(Math.round(rounded * 1e6) / 1e6);
    const nextDigit = digits[sf] != null ? Number(digits[sf]) : 0;
    const kept = digits.slice(0, sf);
    return {
      subject: 'rounding', given: `Round ${n} to ${sf} significant figure${sf === 1 ? '' : 's'}`, sig: `sf:${n}:${sf}`, answer: ans,
      steps: [
        nStep({ key: 'first', prompt: `What is the FIRST significant figure of ${n}? (the first digit that is not a leading zero)`,
          hint: `Reading from the left, the first non-zero digit of ${n} is ${digits[0]}.`,
          why: `Significant figures are counted from the first non-zero digit. In ${n} the leading zeros are just place-holders — they do not count.`,
          resultText: `first significant figure = ${digits[0]}`, answer: Number(digits[0]), pool: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], expr: `the first non-zero digit of ${n}` }),
        nStep({ key: 'look', prompt: `You are keeping ${sf} figure${sf === 1 ? '' : 's'} (${kept}). What is the NEXT digit — the one that decides the rounding?`,
          hint: `The digit after ${kept} is ${nextDigit}.`,
          why: `Rounding always looks at the very next digit. 5 or more rounds up, 4 or less stays.`,
          resultText: `the deciding digit is ${nextDigit}`, answer: nextDigit, pool: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], expr: `the digit after ${kept}` }),
        sStep({ key: 'ans', prompt: `${nextDigit >= 5 ? 'That is 5 or more, so round UP.' : 'That is less than 5, so stay put.'} ${n} to ${sf} s.f. = ?`,
          hint: `${n} → ${ans}.`,
          why: `Keep ${sf} significant figure${sf === 1 ? '' : 's'} and fill the rest with zeros to hold the place value — the answer must stay roughly the same SIZE as ${n}.`,
          longWay: `${n} to ${sf} s.f.\nkeep: ${kept}\nnext digit: ${nextDigit} → ${nextDigit >= 5 ? 'round up' : 'round down'}\n= ${ans}`,
          resultText: `${n} = ${ans} (${sf} s.f.)`, answer: ans, expr: `${n} to ${sf} s.f.`, isAnswer: true,
          pool: decPool(ans, [fmt(Math.round(rounded / scale) * scale + scale), fmt(Math.max(0, Math.round(rounded / scale) * scale - scale)), String(kept)]) }),
      ],
    };
  }
  function estimate(a, b, op) {
    const r = (x) => { const m = Math.floor(Math.log10(x)); const s = Math.pow(10, m); return Math.round(x / s) * s; };
    const ra = r(a), rb = r(b);
    const est = op === '×' ? ra * rb : op === '+' ? ra + rb : ra - rb;
    return {
      subject: 'rounding', given: `Estimate ${a} ${op} ${b} by rounding each number to 1 significant figure`, sig: `est:${a}${op}${b}`, answer: String(est),
      steps: [
        nStep({ key: 'a', prompt: `Round ${a} to 1 significant figure.`, hint: `${a} → ${ra}.`,
          why: `Estimating means making the numbers easy first. 1 s.f. keeps only the leading digit and fills the rest with zeros.`,
          resultText: `${a} ≈ ${ra}`, answer: ra, pool: uniqSort([ra, ra + Math.pow(10, String(ra).length - 1), Math.max(1, ra - Math.pow(10, String(ra).length - 1)), a]), expr: `${a} to 1 s.f.` }),
        nStep({ key: 'b', prompt: `Round ${b} to 1 significant figure.`, hint: `${b} → ${rb}.`,
          why: `Same again for the second number.`,
          resultText: `${b} ≈ ${rb}`, answer: rb, pool: uniqSort([rb, rb + Math.pow(10, String(rb).length - 1), Math.max(1, rb - Math.pow(10, String(rb).length - 1)), b]), expr: `${b} to 1 s.f.` }),
        nStep({ key: 'ans', prompt: `Now do the easy sum: ${ra} ${op} ${rb} = ?`, hint: `${ra} ${op} ${rb} = ${est}.`,
          why: `The estimate is not the exact answer — it is a quick check that tells you roughly what to expect, so you would spot an answer that is wildly wrong.`,
          longWay: `${a} ${op} ${b}\n≈ ${ra} ${op} ${rb}\n= ${est}`,
          resultText: `≈ ${est}`, answer: est, lo: Math.max(0, est - Math.max(10, Math.round(est / 4))), hi: est + Math.max(10, Math.round(est / 4)),
          expr: `${ra} ${op} ${rb}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ STATISTICS — challenge
  // Reverse mean: the mean is given, one value is missing.
  function meanMissing(vals, missing) {
    const all = [...vals, missing], n = all.length;
    const total = all.reduce((x, y) => x + y, 0), mean = total / n;
    const knownSum = vals.reduce((x, y) => x + y, 0);
    return {
      subject: 'stats', given: `The mean of ${n} numbers is ${mean}. ${n - 1} of them are ${list(vals)}. Find the missing number.`,
      sig: `mm:${vals.join(',')}:${missing}`, answer: String(missing),
      steps: [
        nStep({ key: 'total', prompt: `Work backwards. If the mean of ${n} numbers is ${mean}, what must they TOTAL? ${mean} × ${n} = ?`,
          hint: `${mean} × ${n} = ${total}.`,
          why: `Mean = total ÷ how many. So total = mean × how many. Rearranging that is the whole trick to a reverse-mean question.`,
          resultText: `total = ${total}`, answer: total, lo: Math.max(0, total - 20), hi: total + 20, expr: `${mean} × ${n}` }),
        nStep({ key: 'known', prompt: `Now add the ${n - 1} numbers you were given: ${vals.join(' + ')} = ?`,
          hint: `${vals.join(' + ')} = ${knownSum}.`,
          why: `You need to know how much of the total is already accounted for.`,
          resultText: `they add to ${knownSum}`, answer: knownSum, lo: Math.max(0, knownSum - 20), hi: knownSum + 20, expr: vals.join(' + ') }),
        nStep({ key: 'miss', prompt: `The missing number is whatever is left: ${total} − ${knownSum} = ?`,
          hint: `${total} − ${knownSum} = ${missing}.`,
          why: `All ${n} numbers must add to ${total}. Take away the ones you know and what remains is the missing value.`,
          longWay: `Total needed: ${mean} × ${n} = ${total}\nGiven: ${vals.join(' + ')} = ${knownSum}\nMissing: ${total} − ${knownSum} = ${missing}\nCheck: (${all.join(' + ')}) ÷ ${n} = ${mean} ✓`,
          resultText: `the missing number is ${missing}`, answer: missing, lo: Math.max(0, missing - 15), hi: missing + 15,
          expr: `${total} − ${knownSum}`, isAnswer: true }),
      ],
    };
  }
  // Median of an EVEN-length list — the middle two must be averaged.
  function medianEven(data) {
    const sorted = data.slice().sort((a, b) => a - b);
    const n = sorted.length, i = n / 2 - 1;
    const a = sorted[i], b = sorted[i + 1], sum = a + b, med = sum / 2;
    return {
      subject: 'stats', given: `Find the MEDIAN of: ${list(data)}`, sig: `me:${data.join(',')}`, answer: fmt(med),
      steps: [
        buildStep({ key: 'sort', prompt: `First put them in order, smallest first. Tap them in order.`,
          hint: `In order: ${list(sorted)}.`,
          why: `The median is the middle value, so the list MUST be in order first. Finding the middle of an unordered list is the classic slip.`,
          longWay: `Ordered: ${list(sorted)}`, resultText: list(sorted), pieces: data.map(String), solution: sorted.join(' '), distractors: [],
          check: (raw) => { const p = parseNumberList(raw); return (p.length === n && p.every((v, k) => v === sorted[k])) ? { correct: true } : { correct: false, id: 'order-numbers', ctx: { sorted: list(sorted), desc: false } }; } }),
        nStep({ key: 'sum', prompt: `There are ${n} numbers — an even amount, so there is no single middle one. The middle TWO are ${a} and ${b}. Add them: ${a} + ${b} = ?`,
          hint: `${a} + ${b} = ${sum}.`,
          why: `With an even-length list the median sits between the two middle values, so you take their mean: add them and halve.`,
          resultText: `${a} + ${b} = ${sum}`, answer: sum, lo: Math.max(0, sum - 15), hi: sum + 15, expr: `${a} + ${b}` }),
        sStep({ key: 'med', prompt: `Now halve it: ${sum} ÷ 2 = ?`, hint: `${sum} ÷ 2 = ${fmt(med)}.`,
          why: `The median is exactly halfway between the two middle numbers. It is fine for it to end in .5 — it does not have to be one of the numbers in the list.`,
          longWay: `Ordered: ${list(sorted)}\nMiddle two: ${a} and ${b}\n(${a} + ${b}) ÷ 2 = ${fmt(med)}`,
          resultText: `Median = ${fmt(med)}`, answer: fmt(med), expr: `${sum} ÷ 2`, isAnswer: true,
          pool: decPool(fmt(med), [String(a), String(b), fmt(med + 1), String(sum)]) }),
      ],
    };
  }
  // Range and mean with negative values.
  function rangeNegative(data) {
    const hi = Math.max(...data), lo = Math.min(...data), r = hi - lo;
    const show = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));
    return {
      subject: 'stats', given: `Temperatures were recorded as: ${data.map(show).join(', ')} °C. Find the RANGE.`,
      sig: `rn:${data.join(',')}`, answer: `${r} °C`,
      steps: [
        nStep({ key: 'hi', prompt: `What is the HIGHEST temperature?`, hint: `${show(hi)} °C is the highest.`,
          why: `With negatives, the biggest number is the one furthest to the RIGHT on a number line — so −2 is bigger than −9.`,
          resultText: `highest = ${show(hi)}`, answer: hi, pool: uniqSort(data), expr: `the largest of ${data.map(show).join(', ')}` }),
        nStep({ key: 'lo', prompt: `And the LOWEST?`, hint: `${show(lo)} °C is the lowest.`,
          why: `The lowest is furthest to the LEFT on the number line — the most negative one.`,
          resultText: `lowest = ${show(lo)}`, answer: lo, pool: uniqSort(data), expr: `the smallest of ${data.map(show).join(', ')}` }),
        nStep({ key: 'r', prompt: `Range = highest − lowest = ${show(hi)} − (${show(lo)}) = ?`,
          hint: `${hi} − (${lo}) = ${hi} + ${Math.abs(lo)} = ${r}.`,
          why: `Subtracting a negative ADDS. The range is the whole distance from the coldest to the warmest, so it is always positive.`,
          longWay: `Range = ${show(hi)} − (${show(lo)})\n= ${hi} + ${Math.abs(lo)}\n= ${r} °C`,
          resultText: `Range = ${r} °C`, answer: r, lo: Math.max(0, r - 12), hi: r + 12,
          expr: `${show(hi)} − (${show(lo)})`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ FDP — ordering a mixed set
  function fdpOrder(items, desc) {
    // items: [{label, pct}]
    const sorted = items.slice().sort((a, b) => (desc ? b.pct - a.pct : a.pct - b.pct));
    const labels = items.map((i) => i.label);
    return {
      subject: 'fdp', given: `Put these in order, ${desc ? 'biggest first' : 'smallest first'}: ${labels.join(', ')}`,
      sig: `fo:${labels.join('|')}:${desc ? 'd' : 'a'}`, answer: sorted.map((i) => i.label).join(', '),
      steps: [
        chooseStep({ key: 'convert', prompt: `They are in different forms, so you cannot compare them yet. Tap ALL the percentages that these are worth: ${labels.join(', ')}`,
          hint: `${items.map((i) => `${i.label} = ${i.pct}%`).join(', ')}.`,
          why: `You can only compare like with like. Turning everything into percentages (or all into decimals) puts them on the same scale — mixing forms is how people get the order wrong.`,
          longWay: items.map((i) => `${i.label} = ${i.pct}%`).join('\n'),
          resultText: items.map((i) => `${i.label} = ${i.pct}%`).join(', '),
          expected: items.map((i) => i.pct), pool: numberPool(items.map((i) => i.pct), 3, 1, 99),
          diagnose: () => ({ correct: false, id: 'fdp-convert', ctx: { pairs: items.map((i) => `${i.label} = ${i.pct}%`).join(', ') } }) }),
        buildStep({ key: 'order', prompt: `Now tap them in order, ${desc ? 'biggest first' : 'smallest first'}.`,
          hint: `In order: ${sorted.map((i) => i.label).join(', ')}.`,
          why: `Order them by the percentages you just found, then write the ANSWER back in the original forms.`,
          longWay: sorted.map((i) => `${i.label} = ${i.pct}%`).join('\n'),
          resultText: sorted.map((i) => i.label).join(', '),
          pieces: labels.slice(), solution: sorted.map((i) => i.label).join(' '), distractors: [], isAnswer: true,
          check: (raw) => {
            const toks = String(raw).trim().split(/\s+/).filter(Boolean);
            const want = sorted.map((i) => i.label);
            if (toks.length === want.length && toks.every((t, k) => t === want[k])) return { correct: true };
            return { correct: false, id: 'fdp-order', ctx: { order: want.join(', ') } };
          } }),
      ],
    };
  }

  // ============================================================ NUMERACY — challenge
  const DPLACE = ['ones', 'tenths', 'hundredths', 'thousandths'];
  function placeValueDecimal(str) {
    const [wholePart, decPart] = String(str).split('.');
    const idxs = [];
    for (let i = 0; i < decPart.length; i++) if (decPart[i] !== '0') idxs.push(i);
    const i = pick(idxs.length ? idxs : [0]);
    const digit = Number(decPart[i]);
    const place = DPLACE[i + 1];
    const value = fromScaled(digit, i + 1);
    return {
      subject: 'numeracy', given: `In ${str}, what is the VALUE of the digit ${digit}?`, sig: `pvd:${str}:${i}`, answer: value,
      steps: [
        sStep({ key: 'col', prompt: `Which column is the ${digit} in?`, hint: `It is the ${place} column.`,
          why: `After the decimal point the columns go tenths, hundredths, thousandths — each one ten times smaller than the one before.`,
          resultText: `${place}`, answer: place, pool: shuffle(['ones', 'tenths', 'hundredths', 'thousandths']), expr: `the column of the ${digit} in ${str}` }),
        sStep({ key: 'val', prompt: `So what is that ${digit} actually WORTH?`, hint: `${digit} ${place} = ${value}.`,
          why: `A digit's value is the digit multiplied by its column. It is not just "${digit}" — position is everything in place value.`,
          longWay: `${str}\nThe ${digit} sits in the ${place} column\nValue = ${digit} × ${fromScaled(1, i + 1)} = ${value}`,
          resultText: `value = ${value}`, answer: value, expr: `${digit} ${place}`, isAnswer: true,
          pool: decPool(value, [String(digit), fromScaled(digit, i), fromScaled(digit, i + 2)]) }),
      ],
    };
  }
  function orderMixed(nums, desc) {
    const sorted = nums.slice().sort((a, b) => (desc ? b - a : a - b));
    const show = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));
    return {
      subject: 'numeracy', given: `Put these in order, ${desc ? 'biggest to smallest' : 'smallest to biggest'}: ${nums.map(show).join(', ')}`,
      sig: `om:${nums.join(',')}:${desc ? 'd' : 'a'}`, answer: sorted.map(show).join(', '),
      steps: [
        buildStep({ key: 'order', prompt: `Tap them in order, ${desc ? 'biggest first' : 'smallest first'}.`,
          hint: `In order: ${sorted.map(show).join(', ')}.`,
          why: `Picture a number line. Negatives sit to the left of zero, so −8 is SMALLER than −2 even though 8 looks bigger than 2. With decimals, compare the tenths before the hundredths — 0.7 is bigger than 0.65.`,
          longWay: `Ordered: ${sorted.map(show).join(', ')}`,
          resultText: sorted.map(show).join(', '), pieces: nums.map(show), solution: sorted.map(show).join(' '), distractors: [], isAnswer: true,
          check: (raw) => {
            const p = parseNumberList(String(raw).replace(/[−–—]/g, '-'));
            return (p.length === sorted.length && p.every((v, k) => v === sorted[k]))
              ? { correct: true } : { correct: false, id: 'order-numbers', ctx: { sorted: sorted.map(show).join(', '), desc } };
          } }),
      ],
    };
  }

  const api = {
    hcf3, lcm3,
    ratio3, ratioDifference, ratioOnePart,
    decMul, decDiv,
    percentAny, percentChange, percentChangeFind, percentReverse,
    fracMul, fracDiv, fracOfBig,
    negTwoStep,
    roundSF, estimate,
    meanMissing, medianEven, rangeNegative,
    fdpOrder, placeValueDecimal, orderMixed,
    _nStep: nStep, _sStep: sStep, _decPool: decPool, _fmt: fmt, _fromScaled: fromScaled, _toScaled: toScaled,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
