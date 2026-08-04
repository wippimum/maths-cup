/* topics2.js — Decimals, Percentages and Problem-solving.
   Same one-small-step-per-line philosophy. Reuses the step factories from topics.js. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, numberPool = W._numberPool, list = W._list;
  const { nearbyDistractors, uniqSort } = (root.WAC || require('./numbers.js'));

  // ---------- exact decimal helpers (avoid floating-point mess) ----------
  function toScaled(s) {
    s = String(s).trim(); let sign = 1;
    if (s[0] === '-') { sign = -1; s = s.slice(1); }
    const [ip, fp = ''] = s.split('.');
    return { v: sign * parseInt(((ip || '0') + fp) || '0', 10), dp: fp.length };
  }
  function fromScaled(v, dp) {
    const neg = v < 0; v = Math.abs(v);
    let s = String(v).padStart(dp + 1, '0');
    let out = dp ? s.slice(0, -dp) + '.' + s.slice(-dp) : s;
    if (dp) out = out.replace(/0+$/, '').replace(/\.$/, '');
    return (neg ? '-' : '') + out;
  }
  function decAdd(a, b, sub) {
    const A = toScaled(a), B = toScaled(b), D = Math.max(A.dp, B.dp);
    const va = A.v * Math.pow(10, D - A.dp), vb = B.v * Math.pow(10, D - B.dp);
    return fromScaled(sub ? va - vb : va + vb, D);
  }
  function mulPow(s, k) { const { v, dp } = toScaled(s); let nd = dp - k, nv = v; while (nd < 0) { nv *= 10; nd++; } return fromScaled(nv, nd); }
  function divPow(s, k) { const { v, dp } = toScaled(s); return fromScaled(v, dp + k); }
  function randDec(dp, loInt, hiInt) {
    const whole = loInt + Math.floor(Math.random() * (hiInt - loInt + 1));
    const frac = Math.floor(Math.random() * Math.pow(10, dp));
    return dp ? fromScaled(whole * Math.pow(10, dp) + frac, dp) : String(whole);
  }
  // decimal distractor strings near a correct decimal
  function decDistractors(correctStr, count) {
    const { v, dp } = toScaled(correctStr); const out = []; let guard = 0;
    while (out.length < count && guard++ < 200) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.5 ? 1 : Math.pow(10, dp));
      const cand = fromScaled(v + delta, dp);
      if (cand !== correctStr && Number(cand) >= 0 && !out.includes(cand)) out.push(cand);
    }
    return out;
  }
  function decPool(correctStr, count) { return W._shuffle(uniqSort0([correctStr, ...decDistractors(correctStr, count)])); }
  function uniqSort0(arr) { return [...new Set(arr)].sort((a, b) => Number(a) - Number(b)); }

  // ============================================================ DECIMALS ×/÷ by powers of ten
  function decPowerProblem(dec, mult, op) {   // op: 'x' or '/', mult: 10/100/1000
    const k = Math.round(Math.log10(mult));
    const bigger = op === 'x';
    const answer = bigger ? mulPow(dec, k) : divPow(dec, k);
    const dirWord = bigger ? 'bigger' : 'smaller';
    const arrow = bigger ? 'right' : 'left';
    return {
      subject: 'decimals',
      given: `${dec} ${op === 'x' ? '×' : '÷'} ${mult}`,
      answer,
      steps: [
        pickStep({
          key: 'dec-dir',
          prompt: `${op === 'x' ? 'Multiplying' : 'Dividing'} ${dec} by ${mult} — does the number get bigger or smaller?`,
          hint: `${op === 'x' ? 'Multiplying makes numbers bigger.' : 'Dividing makes numbers smaller.'}`,
          why: `× by 10, 100, 1000 makes a number bigger; ÷ by them makes it smaller. The digits stay the same — only the decimal point moves.`,
          resultText: `Gets ${dirWord}`,
          expected: [bigger ? 'Bigger' : 'Smaller'],
          pool: ['Bigger', 'Smaller'],
          diagnose: () => ({ correct: false, id: 'dec-dir', ctx: { op, dirWord } }),
        }),
        pickStep({
          key: 'dec-places',
          prompt: `${mult} has how many zeros? That's how many places the decimal point moves ${arrow}.`,
          hint: `10 → 1 place, 100 → 2 places, 1000 → 3 places.`,
          why: `Each zero in 10/100/1000 moves the decimal point one place (${arrow} when you ${op === 'x' ? 'multiply' : 'divide'}).`,
          resultText: `Move ${k} place${k > 1 ? 's' : ''} ${arrow}`,
          expected: [k],
          pool: ['1', '2', '3'],
          diagnose: () => ({ correct: false, id: 'dec-places', ctx: { mult, k, arrow } }),
        }),
        pickStep({
          key: 'dec-answer',
          prompt: `Move the point ${k} place${k > 1 ? 's' : ''} ${arrow}: ${dec} ${op === 'x' ? '×' : '÷'} ${mult} = ?`,
          hint: `Slide the decimal point ${k} place${k > 1 ? 's' : ''} to the ${arrow}. Answer: ${answer}.`,
          why: `Moving the point ${arrow} by ${k} is exactly what ${op === 'x' ? 'multiplying' : 'dividing'} by ${mult} does.`,
          longWay: `${dec} ${op === 'x' ? '×' : '÷'} ${mult}: point moves ${k} ${arrow} → ${answer}`,
          resultText: `= ${answer}`,
          expected: [answer],
          pool: decPool(answer, 4),
          isAnswer: true,
          diagnose: (v) => ({ correct: false, id: 'dec-answer', ctx: { dec, mult, op, answer, v } }),
        }),
      ],
    };
  }

  // ============================================================ DECIMALS add / subtract
  function decAddSubProblem(a, b, sub) {
    const answer = decAdd(a, b, sub);
    const opw = sub ? '−' : '+';
    return {
      subject: 'decimals',
      given: `${a} ${opw} ${b}`,
      answer,
      steps: [
        pickStep({
          key: 'dec-linedup',
          prompt: `${a} ${opw} ${b} = ?  (Line up the decimal points, then ${sub ? 'subtract' : 'add'}.)`,
          hint: `Write them with the points under each other and fill gaps with zeros, then ${sub ? 'subtract' : 'add'} each column.\n  ${a}\n${opw} ${b}`,
          why: `Keep the decimal points lined up so tenths sit under tenths and units under units. The point in the answer goes straight below.`,
          longWay: `Line up:\n  ${a}\n${opw} ${b}\n= ${answer}`,
          resultText: `= ${answer}`,
          expected: [answer],
          pool: decPool(answer, 4),
          isAnswer: true,
          diagnose: (v) => ({ correct: false, id: 'dec-addsub', ctx: { a, b, sub, answer, v } }),
        }),
      ],
    };
  }

  // ============================================================ PERCENTAGES (10%/1% build-up)
  function percentOfProblem(p, A, unit) {
    const u = unit || '';
    const per10 = A / 10, per1 = A / 100, per5 = A / 20;
    const t = Math.floor(p / 10), rem = p % 10;
    const steps = [];
    // Step 1: 10% of A
    steps.push(pickStep({
      key: 'pc-ten',
      prompt: `To find ${p}% of ${u}${A}, start with 10%. What is 10% of ${u}${A}? (÷ 10)`,
      hint: `10% means one tenth — divide by 10: ${A} ÷ 10 = ${per10}.`,
      why: `10% is a tenth, so ÷10. From 10% you can build any percentage: double it for 20%, treble it for 30%, halve it for 5%, and so on.`,
      resultText: `10% of ${u}${A} = ${u}${per10}`,
      expected: [per10],
      pool: numberPool([per10], 4, 1, per10 + Math.max(6, per10)),
      diagnose: () => ({ correct: false, id: 'pc-ten', ctx: { A, per10 } }),
    }));
    const tensVal = t * per10;
    if (t > 0 && (rem !== 0 || t !== 1)) {
      steps.push(pickStep({
        key: 'pc-tens',
        prompt: `${t * 10}% is ${t} lots of 10%. ${t} × ${per10} = ?`,
        hint: `Multiply 10% (${per10}) by ${t}.`,
        why: `${t * 10}% = ${t} × 10%, so multiply the 10% value by ${t}.`,
        resultText: `${t * 10}% = ${t} × ${per10} = ${u}${tensVal}`,
        expected: [tensVal],
        pool: numberPool([tensVal], 4, 1, tensVal + Math.max(6, per10)),
        isAnswer: rem === 0,
        diagnose: () => ({ correct: false, id: 'pc-mult', ctx: { t, per10, ans: tensVal } }),
      }));
    }
    if (rem === 5) {
      steps.push(pickStep({
        key: 'pc-five',
        prompt: `5% is half of 10%. Half of ${per10} = ?`,
        hint: `5% is half of 10%: ${per10} ÷ 2 = ${per5}.`,
        why: `5% is half of 10%, so halve the 10% value.`,
        resultText: `5% of ${u}${A} = ${u}${per5}`,
        expected: [per5],
        pool: numberPool([per5], 4, 1, per5 + Math.max(6, per5)),
        diagnose: () => ({ correct: false, id: 'pc-half', ctx: { per10, per5 } }),
      }));
      const total = tensVal + per5;
      steps.push(pickStep({
        key: 'pc-add',
        prompt: `Add the parts: ${p}% = ${t * 10}% + 5% = ${tensVal} + ${per5} = ?`,
        hint: `Add your two parts together: ${tensVal} + ${per5} = ${total}.`,
        why: `${p}% = ${t * 10}% + 5%, so add those two amounts to get the final answer.`,
        resultText: `${p}% of ${u}${A} = ${u}${total}`,
        expected: [total],
        pool: numberPool([total], 4, 1, total + Math.max(6, per10)),
        isAnswer: true,
        diagnose: () => ({ correct: false, id: 'pc-add', ctx: { a: tensVal, b: per5, ans: total } }),
      }));
    } else if (t === 1 && rem === 0) {
      steps[steps.length - 1].isAnswer = true;   // 10% itself is the answer
    }
    return { subject: 'percent', given: `Find ${p}% of ${u}${A}`, answer: `${u}${t * per10 + (rem === 5 ? per5 : 0)}`, steps };
  }

  // ============================================================ PROBLEM SOLVING (super step-by-step)
  // Each entry builds a worded problem broken into tiny one-operation steps.
  function numStep(o) {
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [o.answer], isAnswer: !!o.isAnswer,
      pool: numberPool([o.answer], 4, Math.max(0, o.answer - 9), o.answer + 9),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: o.answer, expr: o.expr } }),
    });
  }

  const SOLVE_BANK = [
    () => { const slices = 8, friends = 3, each = 2, eaten = friends * each, left = slices - eaten;
      return { subject: 'solve', given: `A pizza has ${slices} slices. ${friends} friends eat ${each} slices each. How many slices are left?`, answer: String(left), steps: [
        numStep({ key: 's1', prompt: `First, how many slices are eaten? ${friends} friends × ${each} slices each = ?`, hint: `${friends} × ${each}.`, why: `"Each" means multiply: ${friends} lots of ${each}.`, resultText: `Eaten: ${eaten}`, answer: eaten, expr: `${friends} × ${each}` }),
        numStep({ key: 's2', prompt: `Now, how many are left? ${slices} − ${eaten} = ?`, hint: `Start with ${slices}, take away ${eaten}.`, why: `"Left" means take the eaten ones away from the total.`, resultText: `Left: ${left}`, answer: left, expr: `${slices} − ${eaten}`, isAnswer: true }),
      ] }; },
    () => { const pen = 45, n = 3, paid = 200, cost = n * pen, change = paid - cost;
      return { subject: 'solve', given: `A pen costs 45p. You buy 3 pens and pay with £2 (200p). How much change (in pence)?`, answer: String(change), steps: [
        numStep({ key: 's1', prompt: `Cost of ${n} pens? ${n} × 45 = ?`, hint: `${n} × 45.`, why: `Total cost = price × how many.`, resultText: `Cost: ${cost}p`, answer: cost, expr: `${n} × 45` }),
        numStep({ key: 's2', prompt: `Change from 200p? 200 − ${cost} = ?`, hint: `Take the cost away from what you paid.`, why: `Change = money given − money spent.`, resultText: `Change: ${change}p`, answer: change, expr: `200 − ${cost}`, isAnswer: true }),
      ] }; },
    () => { const played = 12, w = 7, d = 3, notLost = w + d, lost = played - notLost;
      return { subject: 'solve', given: `A team plays ${played} matches, winning ${w} and drawing ${d}. How many did they lose?`, answer: String(lost), steps: [
        numStep({ key: 's1', prompt: `Wins and draws together? ${w} + ${d} = ?`, hint: `Add wins and draws.`, why: `Games that are not losses = wins + draws.`, resultText: `Not lost: ${notLost}`, answer: notLost, expr: `${w} + ${d}` }),
        numStep({ key: 's2', prompt: `So how many losses? ${played} − ${notLost} = ?`, hint: `Take wins+draws away from all matches.`, why: `Losses = all games − (wins + draws).`, resultText: `Losses: ${lost}`, answer: lost, expr: `${played} − ${notLost}`, isAnswer: true }),
      ] }; },
    () => { const adult = 12, child = 7, na = 2, nc = 3, av = na * adult, cv = nc * child, total = av + cv;
      return { subject: 'solve', given: `Cinema tickets: adult £${adult}, child £${child}. ${na} adults and ${nc} children go. Total cost (£)?`, answer: String(total), steps: [
        numStep({ key: 's1', prompt: `Cost of the adults? ${na} × ${adult} = ?`, hint: `${na} × ${adult}.`, why: `Adult total = number of adults × adult price.`, resultText: `Adults: £${av}`, answer: av, expr: `${na} × ${adult}` }),
        numStep({ key: 's2', prompt: `Cost of the children? ${nc} × ${child} = ?`, hint: `${nc} × ${child}.`, why: `Child total = number of children × child price.`, resultText: `Children: £${cv}`, answer: cv, expr: `${nc} × ${child}` }),
        numStep({ key: 's3', prompt: `Total cost? ${av} + ${cv} = ?`, hint: `Add the two totals.`, why: `Overall total = adults' cost + children's cost.`, resultText: `Total: £${total}`, answer: total, expr: `${av} + ${cv}`, isAnswer: true }),
      ] }; },
    () => { const pages = 240, per = 30, days = 5, read = per * days, left = pages - read;
      return { subject: 'solve', given: `A book has ${pages} pages. Sam reads ${per} pages a day for ${days} days. How many pages are left?`, answer: String(left), steps: [
        numStep({ key: 's1', prompt: `How many pages read? ${per} × ${days} = ?`, hint: `${per} × ${days}.`, why: `Pages read = pages per day × number of days.`, resultText: `Read: ${read}`, answer: read, expr: `${per} × ${days}` }),
        numStep({ key: 's2', prompt: `Pages left? ${pages} − ${read} = ?`, hint: `Take the pages read from the total.`, why: `Left = total pages − pages read.`, resultText: `Left: ${left}`, answer: left, expr: `${pages} − ${read}`, isAnswer: true }),
      ] }; },
    () => { const week = 15, weeks = 6, spend = 40, saved = week * weeks, left = saved - spend;
      return { subject: 'solve', given: `You save £${week} a week for ${weeks} weeks, then spend £${spend}. How much is left?`, answer: String(left), steps: [
        numStep({ key: 's1', prompt: `How much saved? ${week} × ${weeks} = ?`, hint: `${week} × ${weeks}.`, why: `Saved = amount each week × number of weeks.`, resultText: `Saved: £${saved}`, answer: saved, expr: `${week} × ${weeks}` }),
        numStep({ key: 's2', prompt: `How much left after spending £${spend}? ${saved} − ${spend} = ?`, hint: `Take the spending away from your savings.`, why: `Left = saved − spent.`, resultText: `Left: £${left}`, answer: left, expr: `${saved} − ${spend}`, isAnswer: true }),
      ] }; },
    () => { const seats = 40, cars = 6, taken = 210, total = seats * cars, empty = total - taken;
      return { subject: 'solve', given: `A train has ${cars} carriages with ${seats} seats each. ${taken} seats are taken. How many are empty?`, answer: String(empty), steps: [
        numStep({ key: 's1', prompt: `Total seats? ${cars} × ${seats} = ?`, hint: `${cars} × ${seats}.`, why: `Total seats = carriages × seats per carriage.`, resultText: `Seats: ${total}`, answer: total, expr: `${cars} × ${seats}` }),
        numStep({ key: 's2', prompt: `Empty seats? ${total} − ${taken} = ?`, hint: `Take taken seats from the total.`, why: `Empty = total − taken.`, resultText: `Empty: ${empty}`, answer: empty, expr: `${total} − ${taken}`, isAnswer: true }),
      ] }; },
    () => { const goals = 4, players = 5, extra = 3, base = goals * players, total = base + extra;
      return { subject: 'solve', given: `${players} strikers each score ${goals} goals, then the team scores ${extra} more from penalties. How many goals in total?`, answer: String(total), steps: [
        numStep({ key: 's1', prompt: `Goals from the strikers? ${players} × ${goals} = ?`, hint: `${players} × ${goals}.`, why: `Each striker scores ${goals}, so multiply.`, resultText: `Strikers: ${base}`, answer: base, expr: `${players} × ${goals}` }),
        numStep({ key: 's2', prompt: `Add the penalties: ${base} + ${extra} = ?`, hint: `Add the ${extra} penalty goals.`, why: `Total = strikers' goals + penalties.`, resultText: `Total: ${total}`, answer: total, expr: `${base} + ${extra}`, isAnswer: true }),
      ] }; },
  ];
  function problemSolvingProblem() { return SOLVE_BANK[Math.floor(Math.random() * SOLVE_BANK.length)](); }

  const api = {
    decPowerProblem, decAddSubProblem, percentOfProblem, problemSolvingProblem,
    // helpers used by problems.js generators
    _mulPow: mulPow, _divPow: divPow, _decAdd: decAdd, _randDec: randDec,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
