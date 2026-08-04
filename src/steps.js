/* steps.js — build the vertical solve steps for each problem.
   IMPORTANT design rule: each line asks the child for exactly ONE operation.
   So we break the work into the smallest sensible touches:
     Type A:  move-number → evaluate → divide
     Type B:  move-x → combine → move-number → evaluate → divide
   Some steps share the same parsed value (e.g. "5x = 7 − 3" and "5x = 4"), so we
   also look at the RAW text to tell "just moved it" from "worked it out". */
(function (root) {
  const W = root.WAC || require('./fraction.js');
  const { Fraction, gcd, parseEquation, parseSide, clean, splitTerms,
          M, fmtN, signed, signedX, xTerm, side } = W;

  const E = (x, c) => ({ x: Fraction.from(x), c: Fraction.from(c) });

  function sideEq(parsedSide, exp) { return parsedSide.x.equals(exp.x) && parsedSide.c.equals(exp.c); }
  function matches(parsed, exp) {
    const direct = sideEq(parsed.left, exp.left) && sideEq(parsed.right, exp.right);
    const swap = sideEq(parsed.left, exp.right) && sideEq(parsed.right, exp.left);
    return direct || swap;
  }

  // ---- raw-form inspection (counts of terms actually written) ----
  function rawTerms(sideRaw) {
    return splitTerms(clean(sideRaw || '')).filter(t => t !== '' && t !== '+' && t !== '-');
  }
  function xCount(sideRaw) { return rawTerms(sideRaw).filter(t => t.includes('x')).length; }
  function numCount(sideRaw) { return rawTerms(sideRaw).filter(t => !t.includes('x')).length; }
  function rawSides(raw) { const p = String(raw).split('='); return p.length === 2 ? p : null; }
  function xSideRaw(raw) { const [l, r] = rawSides(raw); const pl = parseSide(l); return (pl && !pl.x.isZero()) ? l : r; }
  function constSideRaw(raw) { const [l, r] = rawSides(raw); const pl = parseSide(l); return (pl && pl.x.isZero()) ? l : r; }

  // correct value typed but not in lowest terms?
  function simplifyNote(raw) {
    const m = String(raw).replace(/[−–—]/g, '-').match(/(-?\d+)\s*\/\s*(\d+)/);
    if (!m) return null;
    const num = parseInt(m[1], 10), den = parseInt(m[2], 10);
    if (den === 0) return null;
    const g = gcd(num, den);
    if (g > 1) return { num, den, g, simplified: new Fraction(num, den).toString() };
    return null;
  }

  const WHY = {
    number: `Moving a number across is a shortcut for doing the same thing to both sides. ` +
      `To move a +3 you subtract 3 from both sides: on the left +3 − 3 = 0 (it vanishes), ` +
      `on the right the number goes down by 3. That's why the sign flips when it crosses.`,
    multiply: `The number in front of x is multiplying x. To undo a multiply you divide — ` +
      `so you divide BOTH sides by it. On the left it cancels and leaves x alone; on the right ` +
      `it divides the number. That's why a 5 in 5x turns into ÷5 when it crosses.`,
    moveX: `An x-term follows the same rule as a number: to move it you add or subtract it from ` +
      `both sides, so its sign flips as it crosses the =. Then all the x's are on one side to combine.`,
    combine: `Combining like terms: 5x − 2x is 5 lots of x take away 2 lots of x = 3 lots of x. ` +
      `You only work out the numbers in front; the x stays.`,
    tidy: `Just tidy the numbers on one side — the x side doesn't change. Doing one small ` +
      `calculation at a time makes slips much easier to spot.`,
  };

  function makeStep(opts) {
    const s = Object.assign({}, opts);
    s.check = function (raw) {
      const parsed = parseEquation(raw);
      if (!parsed) return { correct: false, id: 'unparseable', ctx: {} };
      if (matches(parsed, s.expected)) {
        if (s.rawReq) { const rr = s.rawReq(raw); if (rr) return { soft: true, id: rr.id, ctx: rr.ctx }; }
        if (s.isAnswer) { const note = simplifyNote(raw); if (note) return { soft: true, id: 'not-simplified', ctx: note }; }
        // If the child did the next tidy step too (worked out the numbers, or
        // combined the x's) in the same line, that's accurate — accept it and
        // skip that follow-up step. Never treat a faster-but-correct line as wrong.
        const skip = s.skipIf ? s.skipIf(raw) : 0;
        return { correct: true, skip };
      }
      for (const w of (s.wrongs || [])) if (matches(parsed, w.expected)) return { correct: false, id: w.id, ctx: w.ctx };
      if (s.special) { const sp = s.special(parsed); if (sp) return sp; }
      return { correct: false, id: 'generic', ctx: { prompt: s.prompt } };
    };
    return s;
  }

  // arithmetic slip at an "evaluate" step: x side is right, but the number is wrong
  function evalSlipSpecial(coefX, R, expr) {
    return function (parsed) {
      const cs = parsed.left.x.isZero() ? parsed.left : parsed.right;
      const xs = parsed.left.x.isZero() ? parsed.right : parsed.left;
      if (xs.x.value === coefX && !cs.c.equals(Fraction.from(R))) {
        return { correct: false, id: 'eval-slip', ctx: { expr, R, got: cs.c.toString() } };
      }
      return null;
    };
  }
  // wrong combine of x-terms
  function combineSlipSpecial(a, c, k, b, d) {
    return function (parsed) {
      const xs = parsed.left.x.isZero() ? parsed.right : parsed.left;
      const cs = parsed.left.x.isZero() ? parsed.left : parsed.right;
      if (xs.c.equals(Fraction.from(b)) && cs.c.equals(Fraction.from(d)) &&
          !xs.x.isZero() && !xs.x.equals(Fraction.from(k))) {
        return { correct: false, id: 'combine-wrong', ctx: { a, c, combined: k } };
      }
      return null;
    };
  }

  function divideWrongs(coef, R, ans) {
    const wrongs = [
      { expected: { left: E(1, 0), right: E(0, R - coef) }, id: 'forgot-divide', ctx: { coef, rhs: R, answer: ans.toString() } },
      { expected: { left: E(1, 0), right: E(0, R * coef) }, id: 'forgot-divide', ctx: { coef, rhs: R, answer: ans.toString() } },
    ];
    if (R !== 0) wrongs.push({ expected: { left: E(1, 0), right: E(0, new Fraction(coef, R)) }, id: 'upside-down', ctx: { coef, top: R } });
    return wrongs;
  }

  // ===== Type A: ax + b = c =====
  function typeASteps(a, b, c) {
    const R = c - b, ans = new Fraction(R, a);
    const unevalRHS = `${fmtN(c)} ${signed(-b)}`;               // "7 − 3"
    const move = makeStep({
      key: 'move-number',
      prompt: `Move the ${signed(b)} to the other side of the = sign and flip it to ${signed(-b)}.`,
      hint: `Put ${signed(-b)} on the right, next to the ${fmtN(c)}: ${a}x = ${unevalRHS}.`,
      why: WHY.number,
      longWay: `Long way: subtract ${Math.abs(b)} from both sides.\n${a}x ${signed(b)} ${signed(-b)} = ${fmtN(c)} ${signed(-b)}\n${a}x = ${unevalRHS}`,
      fromText: side(a, b) + ' = ' + fmtN(c),
      resultText: `${a}x = ${unevalRHS}`,
      expected: { left: E(a, 0), right: E(0, R) },
      skipIf: raw => numCount(constSideRaw(raw)) === 1 ? 1 : 0,
      wrongs: [
        { expected: { left: E(a, 0), right: E(0, c + b) }, id: 'flip-number', ctx: { b, lhsX: a, rhs: c } },
        { expected: { left: E(a, b), right: E(0, R) }, id: 'left-copy', ctx: { b, lhsX: a, rhs: c } },
      ],
      tapHelp: givenTapHelpA(a, b, c),
    });
    const evalStep = makeStep({
      key: 'evaluate',
      prompt: `Now work out the right side: what is ${unevalRHS}?`,
      hint: `${unevalRHS} = ${fmtN(R)}. So the line is ${a}x = ${fmtN(R)}.`,
      why: WHY.tidy,
      fromText: `${a}x = ${unevalRHS}`,
      resultText: `${a}x = ${fmtN(R)}`,
      expected: { left: E(a, 0), right: E(0, R) },
      rawReq: raw => numCount(constSideRaw(raw)) === 1 ? null : { id: 'now-evaluate', ctx: { expr: unevalRHS, value: fmtN(R) } },
      special: evalSlipSpecial(a, R, unevalRHS),
    });
    const divide = makeStep({
      key: 'divide', isAnswer: true,
      prompt: `Last touch — divide both sides by ${a}. Write x as a fraction.`,
      hint: `x = ${fmtN(R)} ÷ ${a}, which you write as the fraction ${fmtN(R)}/${a}.`,
      why: WHY.multiply,
      longWay: `Long way: divide both sides by ${a}.\n${a}x ÷ ${a} = ${fmtN(R)} ÷ ${a}\nx = ${ans.toString()}`,
      fromText: `${a}x = ${fmtN(R)}`,
      resultText: `x = ${ans}`,
      expected: { left: E(1, 0), right: E(0, ans) },
      wrongs: divideWrongs(a, R, ans),
      tapHelp: divideTapHelp(a, R),
    });
    return [move, evalStep, divide];
  }

  // ===== Warm-up: x + b = c =====
  function warmupSteps(b, c) {
    const R = c - b, ans = new Fraction(R, 1);
    const unevalRHS = `${fmtN(c)} ${signed(-b)}`;
    const move = makeStep({
      key: 'move-number',
      prompt: `Move the ${signed(b)} to the other side of the = sign and flip it to ${signed(-b)} to get x by itself.`,
      hint: `x = ${unevalRHS}.`,
      why: WHY.number,
      longWay: `Long way: subtract ${Math.abs(b)} from both sides.\nx ${signed(b)} ${signed(-b)} = ${fmtN(c)} ${signed(-b)}\nx = ${unevalRHS}`,
      fromText: side(1, b) + ' = ' + fmtN(c),
      resultText: `x = ${unevalRHS}`,
      expected: { left: E(1, 0), right: E(0, R) },
      skipIf: raw => numCount(constSideRaw(raw)) === 1 ? 1 : 0,
      wrongs: [
        { expected: { left: E(1, 0), right: E(0, c + b) }, id: 'flip-number', ctx: { b, lhsX: 1, rhs: c } },
        { expected: { left: E(1, b), right: E(0, R) }, id: 'left-copy', ctx: { b, lhsX: 1, rhs: c } },
      ],
      tapHelp: givenTapHelpA(1, b, c),
    });
    const evalStep = makeStep({
      key: 'evaluate', isAnswer: true,
      prompt: `Now work out the numbers: what is ${unevalRHS}?`,
      hint: `${unevalRHS} = ${fmtN(R)}. So x = ${fmtN(R)}.`,
      why: WHY.tidy,
      fromText: `x = ${unevalRHS}`,
      resultText: `x = ${fmtN(R)}`,
      expected: { left: E(1, 0), right: E(0, R) },
      rawReq: raw => numCount(constSideRaw(raw)) === 1 ? null : { id: 'now-evaluate', ctx: { expr: unevalRHS, value: fmtN(R) } },
      special: evalSlipSpecial(1, R, unevalRHS),
    });
    return [move, evalStep];
  }

  // ===== Type B: ax + b = cx + d =====
  function typeBSteps(a, b, c, d) {
    const k = a - c, R = d - b, ans = new Fraction(R, k);
    const moveXLeft = `${side(a, b)} ${signedX(-c)}`;          // "60x + 12 − 22x"
    const unevalRHS = `${fmtN(d)} ${signed(-b)}`;              // "−3 − 12"

    const moveX = makeStep({
      key: 'move-x',
      prompt: `Move the ${signedX(c)} to the other side of the = sign (the left) and flip it to ${signedX(-c)}.`,
      hint: `Bring it over as ${signedX(-c)} next to the ${a}x, and keep the ${signed(b)}: ${moveXLeft} = ${fmtN(d)}.`,
      why: WHY.moveX,
      fromText: side(a, b) + ' = ' + side(c, d),
      resultText: `${moveXLeft} = ${fmtN(d)}`,
      expected: { left: E(k, b), right: E(0, d) },
      skipIf: raw => xCount(xSideRaw(raw)) === 1 ? 1 : 0,
      wrongs: [{ expected: { left: E(a + c, b), right: E(0, d) }, id: 'flip-x', ctx: { c, combined: k } }],
      special: combineSlipSpecial(a, c, k, b, d),
      tapHelp: givenTapHelpB(a, b, c, d, 'x'),
    });
    const combine = makeStep({
      key: 'combine',
      prompt: `Now combine the two x-terms into one: ${a}x ${c >= 0 ? M : '+'} ${Math.abs(c)}x = ?`,
      hint: `${a} ${c >= 0 ? M : '+'} ${Math.abs(c)} = ${fmtN(k)}, so the left becomes ${side(k, b)}.`,
      why: WHY.combine,
      fromText: `${moveXLeft} = ${fmtN(d)}`,
      resultText: `${side(k, b)} = ${fmtN(d)}`,
      expected: { left: E(k, b), right: E(0, d) },
      rawReq: raw => xCount(xSideRaw(raw)) === 1 ? null : { id: 'now-combine', ctx: { a, c, combined: k } },
      special: combineSlipSpecial(a, c, k, b, d),
    });
    const moveNum = makeStep({
      key: 'move-number',
      prompt: `Now move the ${signed(b)} to the other side of the = sign and flip it to ${signed(-b)}.`,
      hint: `The right becomes ${unevalRHS}: ${xTerm(k)} = ${unevalRHS}.`,
      why: WHY.number,
      fromText: `${side(k, b)} = ${fmtN(d)}`,
      resultText: `${xTerm(k)} = ${unevalRHS}`,
      expected: { left: E(k, 0), right: E(0, R) },
      skipIf: raw => numCount(constSideRaw(raw)) === 1 ? 1 : 0,
      wrongs: [{ expected: { left: E(k, 0), right: E(0, d + b) }, id: 'sign-slip', ctx: { b, rhs: d, result: R } }],
    });
    const evalStep = makeStep({
      key: 'evaluate',
      prompt: `Now work out the right side: what is ${unevalRHS}?`,
      hint: `${unevalRHS} = ${fmtN(R)}. Write ${xTerm(k)} = ${fmtN(R)}.`,
      why: WHY.tidy,
      fromText: `${xTerm(k)} = ${unevalRHS}`,
      resultText: `${xTerm(k)} = ${fmtN(R)}`,
      expected: { left: E(k, 0), right: E(0, R) },
      rawReq: raw => numCount(constSideRaw(raw)) === 1 ? null : { id: 'now-evaluate', ctx: { expr: unevalRHS, value: fmtN(R) } },
      special: evalSlipSpecial(k, R, unevalRHS),
    });
    const divide = makeStep({
      key: 'divide', isAnswer: true,
      prompt: `Last touch — divide both sides by ${fmtN(k)}. Write x as a fraction.`,
      hint: `x = ${fmtN(R)} ÷ ${fmtN(k)}, written as the fraction ${fmtN(R)}/${fmtN(k)}.`,
      why: WHY.multiply,
      fromText: `${xTerm(k)} = ${fmtN(R)}`,
      resultText: `x = ${ans}`,
      expected: { left: E(1, 0), right: E(0, ans) },
      wrongs: divideWrongs(k, R, ans),
      tapHelp: divideTapHelp(k, R),
    });
    return [moveX, combine, moveNum, evalStep, divide];
  }

  // ---- tap-to-choose-a-term help ----
  function givenTapHelpA(a, b, c) {
    return [
      { text: xTerm(a), msg: `That one has an x — it stays on the x side. Move a plain number across instead.` },
      { text: signed(b), msg: `Good choice — that's a plain number, so it goes to the side without x, and it flips to ${signed(-b)}.` },
      { text: fmtN(c), msg: `That number is already alone on its side — it's the ${signed(b)} that needs to cross over.` },
    ];
  }
  function divideTapHelp(coef, R) {
    return [
      { text: `${fmtN(coef)}x`, msg: `Last move: the ${fmtN(coef)} is multiplying x, so divide both sides by ${fmtN(coef)}.` },
      { text: fmtN(R), msg: `That's the answer side — keep it, and divide it by ${fmtN(coef)}. The number you divide BY goes on the bottom.` },
    ];
  }
  function givenTapHelpB(a, b, c, d, want) {
    if (want === 'x') {
      return [
        { text: xTerm(a), msg: `That x-term is already on the left — bring the OTHER x-term (${signedX(c)}) over to join it.` },
        { text: signed(b), msg: `That's a plain number — we move it later. First slide the x-term across.` },
        { text: signedX(c), msg: `Good choice — that's an x-term. Slide it to the x side; it flips to ${signedX(-c)}.` },
        { text: signed(d), msg: `That number stays on the right for now — move the x-term first.` },
      ];
    }
    return [];
  }

  const api = { typeASteps, typeBSteps, warmupSteps, simplifyNote, WHY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
