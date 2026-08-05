/* explanations.js — the kid-friendly mistake explanations.
   The WORDING and the maths reasoning follow the build spec exactly; only the
   specific numbers are filled in for the current problem (so the maths stays correct). */
(function (root) {
  const F = root.WAC || require('./format.js');
  const { M, fmtN, signed } = F;

  // Each builder receives a context object with the numbers for the current step.
  const EXPLAIN = {
    // Mistake 1 — Forgot to flip the sign when moving a number.
    'flip-number': (ctx) => {
      // ctx: { b (moved term, signed), lhsX (coef of x), rhs (constant on far side) }
      const from = signed(ctx.b);
      const to = signed(-ctx.b);
      const rhsLine = `${fmtN(ctx.rhs)} ${(-ctx.b) < 0 ? M : '+'} ${Math.abs(ctx.b)}`;
      const verb = ctx.b >= 0 ? 'subtracting' : 'adding';
      const prep = ctx.b >= 0 ? 'from' : 'to';
      return `Almost! When a term crosses the = sign, its sign flips. The ${from} becomes ${to}, ` +
        `so it's ${ctx.lhsX}x = ${rhsLine}. Quick reason: you're really ${verb} ${Math.abs(ctx.b)} ` +
        `${prep} both sides, and ${from} ${ctx.b >= 0 ? M : '+'} ${Math.abs(ctx.b)} = 0 makes it vanish on the left.`;
    },

    // Mistake 2 — Combined like terms wrong (adding instead of subtracting, or a slip).
    'combine-wrong': (ctx) => {
      // ctx: { a (left x-coef), c (right x-coef being moved over), combined (a-c) }
      const takeAway = ctx.c >= 0
        ? `take away ${ctx.c}x`
        : `add ${Math.abs(ctx.c)}x`;
      return `Careful with this one. ${ctx.a}x ${ctx.c >= 0 ? M : '+'} ${Math.abs(ctx.c)}x means ` +
        `${ctx.a} of something ${ctx.c >= 0 ? 'take away' : 'plus'} ${Math.abs(ctx.c)} of the same thing = ` +
        `${ctx.combined} of them. ${ctx.a} ${ctx.c >= 0 ? M : '+'} ${Math.abs(ctx.c)} = ${ctx.combined}, ` +
        `so it's ${ctx.combined}x. (Watch this step — a small slip here changes the whole answer.)`;
    },

    // Mistake 3 — Forgot that multiply flips to divide.
    'forgot-divide': (ctx) => {
      // ctx: { coef (number in front of x), rhs (constant), answer (Fraction string) }
      return `The ${ctx.coef} is multiplying x (${ctx.coef} lots of x). To undo multiply, you divide. ` +
        `So x = ${fmtN(ctx.rhs)} ÷ ${ctx.coef} = ${ctx.answer}. Opposite of × is ÷.`;
    },

    // Mistake 4 — Fraction upside down.
    'upside-down': (ctx) => {
      // ctx: { coef (number in front of x), top (answer numerator side value) }
      return `So close — it's the right numbers, just flipped. x equals (the answer side) over ` +
        `(the number in front of x): that's ${fmtN(ctx.top)} over ${ctx.coef}, not ${ctx.coef} over ${fmtN(ctx.top)}. ` +
        `The thing you divided BY goes on the bottom.`;
    },

    // Mistake 5 — Sign slip with negatives when moving a number.
    'sign-slip': (ctx) => {
      // ctx: { b (moved term, signed), rhs (constant already on that side), result (rhs - b ... i.e. after flip) }
      const from = signed(ctx.b);
      const to = signed(-ctx.b);
      let msg = `Watch the signs. The ${from} crosses over and becomes ${to}, so the right side is ` +
        `${fmtN(ctx.rhs)} ${(-ctx.b) < 0 ? M : '+'} ${Math.abs(ctx.b)} = ${fmtN(ctx.result)}.`;
      if (ctx.rhs < 0 && ctx.b > 0) msg += ' Two negatives being added make a bigger negative.';
      return msg;
    },

    // Mistake 6 — Left a copy of the term on both sides.
    'left-copy': (ctx) => {
      // ctx: { b (moved term, signed), lhsX (x-coef), rhs (constant on far side) }
      const from = signed(ctx.b);
      const rhsLine = `${fmtN(ctx.rhs)} ${(-ctx.b) < 0 ? M : '+'} ${Math.abs(ctx.b)}`;
      return `When ${from} moves across, it leaves the left side completely — it can't be in two places. ` +
        `The left should become just ${ctx.lhsX}x. So: ${ctx.lhsX}x = ${rhsLine}.`;
    },

    // Mistake 7 — Didn't simplify (correct, just not finished).
    'not-simplified': (ctx) => {
      // ctx: { num, den, g (gcd), simplified (string) }
      return `That's correct! ✅ But we can make the fraction simpler. Both ${Math.abs(ctx.num)} and ${ctx.den} ` +
        `divide by ${ctx.g} → ${ctx.simplified}. Try simplifying.`;
    },

    // Forgot to flip an x-term's sign when moving it across (Type B).
    'flip-x': (ctx) => {
      // ctx: { c (x-term moved, signed), combined (a-c) }
      const from = (ctx.c < 0 ? M + Math.abs(ctx.c) : '+' + ctx.c) + 'x';
      const to = (-ctx.c < 0 ? M + Math.abs(ctx.c) : '+' + ctx.c) + 'x';
      return `Almost! An x-term flips its sign when it crosses the = too. The ${from} becomes ${to}, ` +
        `so the x's combine to ${ctx.combined}x on the left.`;
    },

    // ---- gentle "one touch at a time" coaching (not mistakes) ----
    // Child worked out the numbers too early — ask for the moved-but-not-computed line.
    'take-one-touch': (ctx) => {
      return `Good thinking — but let's take it one touch at a time ⚽ First just move the term ` +
        `across and flip its sign; don't work out the numbers yet. Type it like:  ${ctx.next}`;
    },
    // Child combined the x-terms too early.
    'keep-uncombined': (ctx) => {
      return `One touch at a time ⚽ First just slide the x-term across (and flip its sign), leaving ` +
        `BOTH x-terms showing. We'll add them together on the next line. Type:  ${ctx.next}`;
    },
    // Correct so far — now actually do the arithmetic.
    'now-evaluate': (ctx) => {
      return `Nice — now work out the numbers: ${ctx.expr} = ${ctx.value}. Write the whole line with that filled in.`;
    },
    // Correct so far — now combine the x-terms.
    'now-combine': (ctx) => {
      return `Now add the two x-terms into one: ${ctx.a} ${ctx.c >= 0 ? M : '+'} ${Math.abs(ctx.c)} = ${ctx.combined}, ` +
        `so it's ${ctx.combined}x.`;
    },
    // Arithmetic slip when working out a side.
    'eval-slip': (ctx) => {
      return `Careful with the arithmetic. ${ctx.expr} = ${fmtN(ctx.R)}, not ${ctx.got}. Try that line again.`;
    },

    // ---------- HCF / factors ----------
    'factor-not': (c) => `Careful — ${c.bad} is not a factor of ${c.n}; it doesn't divide ${c.n} exactly. Untap it, and check each number goes into ${c.n} with nothing left over.`,
    'factor-forgot-ends': (c) => `Nearly! 1 and ${c.n} itself are ALWAYS factors — every number divides itself, and 1 divides everything. Add the ones you missed.`,
    'factor-missed': (c) => `Good start, but a few are missing. Use factor pairs: 1×${c.n}, 2×…, 3×… keep going until the pairs meet in the middle.`,
    'cf-not-common': (c) => `${c.bad} isn't a factor of BOTH ${c.a} and ${c.b}. A common factor has to be in both lists — untap it.`,
    'cf-missed': (c) => `Some common ones are missing. Look down both factor lists and tap every number that appears in both.`,
    'hcf-not-highest': (c) => `That is a common factor, but not the biggest one. The HCF is the highest — that's ${c.h}.`,
    'hcf-wrong': (c) => `Not quite. Pick the largest number from the common factors (${c.cf}). The HCF is ${c.h}.`,

    // ---------- LCM / multiples ----------
    'mult-not': (c) => `${c.bad} isn't a multiple of ${c.n} — it's not in ${c.n}'s times-table. Untap it.`,
    'mult-missed': (c) => `A few multiples are missing — keep counting up in ${c.n}s: ${c.n}, ${2 * c.n}, ${3 * c.n}…`,
    'cm-not-common': (c) => `${c.bad} is only in one list. A common multiple must be in BOTH the ${c.a}-list and the ${c.b}-list.`,
    'cm-missed': (c) => `Look again — which number(s) appear in both lists? Tap the shared one(s).`,
    'lcm-not-lowest': (c) => `That's a common multiple, but not the smallest. The LCM is the lowest one — that's ${c.L}.`,
    'lcm-multiplied': (c) => `Careful — ${c.a} × ${c.b} = ${c.ab}. Multiplying only gives the LCM when the numbers share no factors. Here the LCM is smaller: ${c.L}. (That's Charlie's mistake from the book!)`,
    'lcm-wrong': (c) => `Not quite. Pick the smallest number that's in both lists (${c.cm}). The LCM is ${c.L}.`,

    // ---------- Primes ----------
    'prime-yesno': (c) => c.prime
      ? `Actually ${c.n} IS prime — nothing except 1 and ${c.n} divides it, so it has exactly two factors.`
      : `Actually ${c.n} is NOT prime — ${c.factor} divides it (${c.factor} × ${c.n / c.factor} = ${c.n}), so it has more than two factors.`,
    'prime-factor-trivial': (c) => `1 and ${c.n} always divide ${c.n} — they don't count. Find a DIFFERENT factor to show it isn't prime.`,
    'prime-factor-wrong': (c) => `${c.v} doesn't divide ${c.n} exactly. Try a small number like 2 or 3 that goes into ${c.n}.`,
    'primes-not': (c) => `${c.bad} isn't prime — ${c.factor} divides it. Untap it. (Remember: 1 is not prime, and 2 is the only even prime.)`,
    'primes-missed': () => `You missed a prime. Check each number — if nothing besides 1 and itself divides it, it's prime.`,
    'spf-not-divisor': (c) => `${c.v} doesn't divide ${c.cur} exactly. Find the smallest prime that fits — try 2, then 3, then 5…`,
    'spf-not-prime': (c) => `${c.v} isn't a prime number. Use a prime (2, 3, 5, 7…) that divides ${c.cur}.`,
    'spf-not-smallest': (c) => `${c.p} divides ${c.cur}, but there's a smaller prime that does too. The smallest prime factor of ${c.cur} is ${c.p}.`,
    'pf-not-all-prime': (c) => `Every number in the product must be PRIME. Break any non-prime one down further. ${c.n} = ${c.pf}.`,
    'pf-product': (c) => `That multiplies to ${c.prod}, not ${c.n}. The prime factorisation of ${c.n} is ${c.pf}.`,
    'prime-ends': (c) => `1 and ${c.n} always divide ${c.n} — the question says NOT those. Untap 1 and ${c.n}, keep the middle factors.`,
    'prime-notdiv': (c) => `${c.bad} doesn't divide ${c.n} exactly — untap it. Only tap numbers that go in with nothing left over.`,
    'prime-missed': (c) => `There are more! The factors of ${c.n} (not 1 or ${c.n}) are ${c.all}. Keep checking 2, 3, 4, …`,
    'two-form': (c) => `Write it as prime × prime, like ${c.a} × ${c.b}.`,
    'two-count': (c) => `Use exactly TWO prime numbers multiplied: ${c.a} × ${c.b}.`,
    'two-notprime': (c) => `Both numbers must be PRIME. It's ${c.a} × ${c.b} (both prime).`,
    'pf-index-form': (c) => `Write it as primes multiplied, using powers: ${c.idx}.`,
    'pf-index-wrong': (c) => `Not quite — the prime factorisation of ${c.n} is ${c.idx}.`,
    'use-index': (c) => `Right primes! ✅ Now write repeats as powers (index form): ${c.idx}.`,
    'square-odd': (c) => `A square has all EVEN powers. In ${c.idx}, the prime ${c.oddPrime} has an odd power — that's the one to fix.`,
    'hcf-primes': (c) => `The HCF from prime factors = shared primes at their LOWEST power = ${c.hcf}.`,
    'lcm-primes': (c) => `The LCM from prime factors = every prime at its HIGHEST power = ${c.lcm}.`,

    // ---------- Ratio ----------
    'ratio-div': (c) => `${c.x} ÷ ${c.h} = ${c.ans}. Divide carefully.`,
    'ratio-form': (c) => `Write it as two numbers with : between them, like ${c.sa} : ${c.sb}.`,
    'ratio-order': (c) => `Right numbers, wrong order — keep the same order as the question: ${c.sa} : ${c.sb}.`,
    'share-parts': (c) => `Add the two numbers in the ratio: ${c.a} + ${c.b} = ${c.totalParts}.`,
    'share-per': (c) => `Divide the amount by the number of parts: ${c.amount} ÷ ${c.totalParts} = ${c.per}.`,
    'share-mult': (c) => `Multiply one part by the number of parts: ${c.parts} × ${c.per} = ${c.ans}.`,

    // ---------- Decimals ----------
    'dec-dir': (c) => `${c.op === 'x' ? 'Multiplying' : 'Dividing'} makes the number ${c.dirWord}. The digits stay the same — only the decimal point moves.`,
    'dec-places': (c) => `${c.mult} has ${c.k} zero${c.k > 1 ? 's' : ''}, so the point moves ${c.k} place${c.k > 1 ? 's' : ''} to the ${c.arrow}.`,
    'dec-answer': (c) => `Slide the decimal point the right way: ${c.dec} ${c.op === 'x' ? '×' : '÷'} ${c.mult} = ${c.answer}.`,
    'dec-addsub': (c) => `Line up the decimal points and ${c.sub ? 'subtract' : 'add'} each column: ${c.a} ${c.sub ? M : '+'} ${c.b} = ${c.answer}.`,

    // ---------- Percentages ----------
    'pc-ten': (c) => `10% is one tenth — divide by 10: ${c.A} ÷ 10 = ${c.per10}.`,
    'pc-mult': (c) => `${c.t} lots of 10%: ${c.t} × ${c.per10} = ${c.ans}.`,
    'pc-half': (c) => `5% is half of 10%: half of ${c.per10} is ${c.per5}.`,
    'pc-add': (c) => `Add the parts together: ${c.a} + ${c.b} = ${c.ans}.`,

    // ---------- Problem solving ----------
    'num-wrong': (c) => `Work it out again: ${c.expr} = ${c.answer}.`,

    // ---------- Fractions ----------
    'frac-form': (c) => `Write it as top / bottom, like ${c.sn}/${c.sd}.`,
    'frac-flip': (c) => `Right numbers, upside down — the top goes first: ${c.sn}/${c.sd}.`,
    'lcd': (c) => `The common denominator is the LCM of ${c.d1} and ${c.d2} = ${c.L} (the smallest number both go into).`,
    'not-simplified-frac': (c) => `That's the right value ✅ but it can be simplified. Divide top and bottom by their HCF → ${c.res}.`,

    // ---------- Statistics ----------
    'stat-mode': (c) => `The mode is the value that appears MOST often — that's ${c.mode}. Count each one.`,
    'stat-wrong': (c) => `Look again for the ${c.what} value — it's ${c.v}.`,
    'stat-median-order': (c) => `Put them smallest → biggest first: ${c.sorted}. Then the median is the middle one.`,

    // ---------- Rounding ----------
    'round-digit': (c) => `To round ${c.n} to the nearest ${c.place}, look at the ${c.look} digit — it's ${c.digit}.`,
    'round-updown': (c) => `${c.digit} is ${c.up ? '5 or more, so round UP' : 'less than 5, so round DOWN'}.`,
    'round-wrong': (c) => `Careful — ${c.n} to the nearest ${c.place} is ${c.ans}.`,

    // ---------- Integers ----------
    'neg-rewrite': (c) => `Two minuses make a plus: ${c.a} − (${c.b}) becomes ${c.a} + ${-c.b}.`,
    'neg-line': (c) => `Use a number line: ${c.expr} = ${c.answer}. + moves right, − moves left (you can cross zero into negatives).`,
    'neg-sign': (c) => `Same signs → positive, different signs → negative. So this answer is ${c.neg ? 'negative' : 'positive'}.`,

    // ---------- BIDMAS / order of operations ----------
    'bid-brackets': (c) => `Brackets come first — always. Whatever else is in the line, ${c.part} gets done before it. ` +
      `The brackets are there to tell you "this bit first".`,
    'bid-indices': (c) => `Powers come next, straight after brackets. Do ${c.part} first — it means ` +
      `${Array(c.pow || 2).fill(c.base).join(' × ')} — and only then the + − × ÷.`,
    'bid-md': (c) => `× and ÷ are stronger than + and −, so they go first no matter where they sit in the line. ` +
      `Do ${c.part} before anything else here.`,
    'bid-lr': (c) => `This is the tricky one: ${c.kind} are the SAME strength, so neither wins. ` +
      `When that happens you just read left to right — so ${c.part} goes first because it's furthest left.`,
    'bid-as': (c) => `Only + and − are left, and they're the same strength, so work left to right: ${c.part} first.`,
    'bid-wrong-op': (c) => `Check the sign in the middle — ${c.part} says ${c.word}, which gives ${c.answer}, not ${c.picked}.`,
    'bid-power-times': (c) => `${c.base}${c.sup} doesn't mean ${c.base} × ${c.pow}. The little ${c.pow} counts how many ` +
      `${c.base}s to multiply together: ${Array(c.pow).fill(c.base).join(' × ')} = ${c.answer}.`,

    // ---------- FDP ----------
    'fdp-dec': (c) => `${c.num}/${c.den} means ${c.num} ÷ ${c.den} = ${c.dec}.`,
    'fdp-pct': (c) => `To make a decimal a percentage, × 100: ${c.dec} × 100 = ${c.pct}%.`,

    // ---------- Numeracy ----------
    'place-value': (c) => `The ${c.digit} sits in the ${c.place} column, so it's worth ${c.digit} × its place = ${c.value}.`,
    'order-numbers': (c) => `Compare from the left digit. In order it's: ${c.sorted}.`,

    // ---------- Angles ----------
    'angle-sum': (c) => `These angles add up to ${c.sum}°. Use that to find the missing one.`,

    // ---------- Volume / solids ----------
    'solid-count': (c) => `A ${c.name} has ${c.val} ${c.what}. (Faces = flat surfaces, edges = where faces meet, vertices = corners.)`,

    // ---------- Coordinates ----------
    'coord-form': (c) => `Write it as (across, up): (${c.x}, ${c.y}).`,
    'coord-swap': (c) => `Careful of the order — it's (across, up), so (${c.x}, ${c.y}), not the other way round.`,
    'coord-parens': (c) => `Right numbers — but coordinates need round brackets: write (${c.x}, ${c.y}), not just ${c.x}, ${c.y}. Use the ( and ) cards.`,
    'reflect-which': (c) => `Reflecting in the ${c.axis}-axis flips the ${c.axis === 'x' ? 'y' : 'x'} coordinate's sign; the other stays the same.`,
    'figure-x': (c) => `The 4th corner is in the same column as ${c.partner}, so it has the same x: ${c.mx}.`,
    'figure-y': (c) => `The 4th corner is on the same row as ${c.partner}, so it has the same y: ${c.my}.`,

    // ---------- Geometry facts ----------
    'geom-fact': (c) => `${c.why} The answer is ${c.a}.`,

    // ---------- Data & graphs ----------
    'bar-read': (c) => `Read the ${c.cat} bar across to the scale — it's ${c.v}.`,

    // ---------- generic choose/pick ----------
    'choose-wrong': () => `Not quite — check which ones really belong, then untap the wrong ones and add any missing.`,
    'pick-wrong': () => `Not that one — read the prompt again and pick the number it's asking for.`,
    'empty': () => `Tap an answer (or a card) first, then press Check.`,

    // Fallback: not a recognised mistake, just not the right move yet.
    'generic': (ctx) => {
      return `Not quite the right step yet. The move here is: ${ctx.prompt || 'follow the prompt above.'} Want a hint or the "why"?`;
    },

    // Couldn't read the line at all.
    'unparseable': () => {
      return `Hmm, I couldn't read that line. Write it like an equation, e.g. 5x = 7 ${M} 3 (use an = sign).`;
    },
  };

  function explain(id, ctx) {
    const fn = EXPLAIN[id] || EXPLAIN.generic;
    return fn(ctx || {});
  }

  const api = { explain, EXPLAIN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
