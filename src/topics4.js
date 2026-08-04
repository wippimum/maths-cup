/* topics4.js — FDP conversions, Numeracy, Angles, Perimeter & Area.
   Angles and shapes come with a small illustrative SVG diagram. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, numberPool = W._numberPool, list = W._list, S = W._S;
  const { Fraction, gcd, factors, common, parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ===================== FRACTIONS ↔ DECIMALS ↔ % =====================
  function decStr(num, den) { // den divides 100
    const hundredths = Math.round((num / den) * 100);       // e.g. 3/4 -> 75
    if (hundredths % 100 === 0) return String(hundredths / 100);
    if (hundredths % 10 === 0) return '0.' + (hundredths / 10);
    return '0.' + String(hundredths).padStart(2, '0');
  }
  function fdpFromFraction(num, den) {
    const dec = decStr(num, den), pct = Math.round((num / den) * 100);
    return {
      subject: 'fdp', given: `Convert ${num}/${den} to a decimal, then a %`, answer: `${dec} = ${pct}%`,
      steps: [
        pickStep({ key: 'dec', prompt: `Write ${num}/${den} as a decimal (top ÷ bottom: ${num} ÷ ${den}).`,
          hint: `${num} ÷ ${den} = ${dec}.`, why: `A fraction is a division: the top divided by the bottom. ${num} ÷ ${den} = ${dec}.`,
          resultText: `${num}/${den} = ${dec}`, expected: [dec], pool: uniqSort0([dec, decStr(den, num) === dec ? '9.9' : decStr(Math.min(num + 1, den), den), decStr(Math.max(num - 1, 1), den), (Number(dec) * 10).toString()]),
          diagnose: () => ({ correct: false, id: 'fdp-dec', ctx: { num, den, dec } }) }),
        pickStep({ key: 'pct', prompt: `Now write ${dec} as a percentage (× 100).`, hint: `${dec} × 100 = ${pct}%.`, why: `To turn a decimal into a percentage, multiply by 100 (move the point two places right).`,
          resultText: `= ${pct}%`, expected: [pct + '%', String(pct)], pool: [pct + '%', (pct + 10) + '%', (pct - 10 > 0 ? pct - 10 : pct + 5) + '%', Math.round(pct / 10) + '%'], isAnswer: true,
          diagnose: () => ({ correct: false, id: 'fdp-pct', ctx: { dec, pct } }) }),
      ],
    };
  }
  function uniqSort0(arr) { return [...new Set(arr.map(String))].sort((a, b) => Number(a) - Number(b)); }
  function fdpPercentToFraction(p) {
    const g = gcd(p, 100), sn = p / g, sd = 100 / g, cf = common(factors(p), factors(100));
    return {
      subject: 'fdp', given: `Write ${p}% as a fraction in its simplest form`, answer: `${sn}/${sd}`,
      steps: [
        pickStep({ key: 'hcf', prompt: `${p}% means ${p} out of 100, so ${p}/100. What is the HCF of ${p} and 100?`,
          hint: `Common factors of ${p} and 100: ${list(cf)} — pick the biggest.`, why: `Percent means "out of 100". To simplify ${p}/100, divide top and bottom by their HCF.`,
          longWay: `${p}% = ${p}/100. HCF of ${p} and 100 = ${g}.`, resultText: `HCF = ${g}`, expected: [g], pool: cf,
          diagnose: (v) => S(cf).includes(v) ? { correct: false, id: 'hcf-not-highest', ctx: { h: g } } : { correct: false, id: 'hcf-wrong', ctx: { h: g, cf: list(cf) } } }),
        pickStep({ key: 'top', prompt: `${p} ÷ ${g} = ? (new top)`, hint: `${p} ÷ ${g}.`, why: `Divide the numerator by the HCF.`, resultText: `top = ${sn}`, expected: [sn], pool: numberPool([sn], 4, 1, p), diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: p, h: g, ans: sn } }) }),
        pickStep({ key: 'bot', prompt: `100 ÷ ${g} = ? (new bottom)`, hint: `100 ÷ ${g}.`, why: `Divide the denominator (100) by the same HCF.`, resultText: `bottom = ${sd}`, expected: [sd], pool: numberPool([sd], 4, 1, 100), diagnose: () => ({ correct: false, id: 'ratio-div', ctx: { x: 100, h: g, ans: sd } }) }),
        buildStep({ key: 'write', prompt: `Write the simplified fraction (number and / cards).`, hint: `${sn}/${sd}.`, why: `The simplified fraction is the new top over the new bottom.`,
          longWay: `${p}% = ${p}/100 = ${sn}/${sd}`, resultText: `${p}% = ${sn}/${sd}`, pieces: [String(sn), '/', String(sd)], distractors: [String(p), '100', String(sd + 1)], isAnswer: true,
          check: (raw) => { const q = parseNumberList(String(raw).replace(/[/]/g, ' ')); if (q.length < 2) return { correct: false, id: 'frac-form', ctx: { sn, sd } }; if (q[0] === sn && q[1] === sd) return { correct: true }; if (q[0] === sd && q[1] === sn) return { correct: false, id: 'frac-flip', ctx: { sn, sd } }; return { correct: false, id: 'frac-form', ctx: { sn, sd } }; } }),
      ],
    };
  }

  // ===================== NUMERACY (place value, ordering) =====================
  const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  function placeValue(n) {
    const ds = String(n).split('');
    const idxs = ds.map((d, i) => i).filter((i) => ds[i] !== '0');
    const posFromLeft = pick(idxs.length ? idxs : [ds.length - 1]);
    const digit = Number(ds[posFromLeft]);
    const power = ds.length - 1 - posFromLeft, value = digit * Math.pow(10, power);
    return {
      subject: 'numeracy', given: `In ${Number(n).toLocaleString('en-US')}, what is the VALUE of the ${digit} (the ${PLACE[power]} digit)?`, answer: String(value),
      steps: [pickStep({ key: 'pv', prompt: `In ${Number(n).toLocaleString('en-US')}, the ${digit} is in the ${PLACE[power]} column. What is it worth?`,
        hint: `${digit} ${PLACE[power]} = ${digit} × ${Math.pow(10, power)} = ${value}.`, why: `A digit's value = the digit × its place. The ${PLACE[power]} column is worth ${Math.pow(10, power)}.`,
        resultText: `value = ${value}`, expected: [value], pool: uniqSort([value, digit, digit * Math.pow(10, Math.max(0, power - 1)), digit * Math.pow(10, power + 1)]), isAnswer: true,
        diagnose: () => ({ correct: false, id: 'place-value', ctx: { digit, place: PLACE[power], value } }) })],
    };
  }
  function ordering(nums, desc) {
    const sorted = nums.slice().sort((a, b) => desc ? b - a : a - b);
    return {
      subject: 'numeracy', given: `Put these in order, ${desc ? 'biggest to smallest' : 'smallest to biggest'}: ${list(nums)}`, answer: sorted.join(', '),
      steps: [buildStep({ key: 'order', prompt: `Tap the numbers in order, ${desc ? 'biggest first' : 'smallest first'}.`,
        hint: `In order: ${sorted.join(', ')}.`, why: `Compare place value from the left: the number with the bigger left-most digit is bigger (when they have the same number of digits).`,
        longWay: `Ordered: ${sorted.join(', ')}`, resultText: sorted.join(', '), pieces: nums.map(String), distractors: [], isAnswer: true,
        check: (raw) => { const p = parseNumberList(raw); return (p.length === sorted.length && p.every((v, i) => v === sorted[i])) ? { correct: true } : { correct: false, id: 'order-numbers', ctx: { sorted: sorted.join(', '), desc } }; } })],
    };
  }

  // ===================== ANGLES (with SVG) =====================
  function svgLine(a, x) {
    return `<svg viewBox="0 0 240 96" width="240" height="96" role="img"><line x1="12" y1="70" x2="228" y2="70" stroke="#12324a" stroke-width="3"/><line x1="120" y1="70" x2="182" y2="18" stroke="#12324a" stroke-width="3"/><circle cx="120" cy="70" r="4" fill="#12324a"/><text x="70" y="63" font-size="16" fill="#0a7d34" font-weight="700">${a}°</text><text x="150" y="60" font-size="16" fill="#c0392b" font-weight="700">${x == null ? 'x°' : x + '°'}</text></svg>`;
  }
  function svgPoint(a, b) {
    return `<svg viewBox="0 0 200 150" width="200" height="150" role="img"><circle cx="100" cy="80" r="4" fill="#12324a"/><line x1="100" y1="80" x2="180" y2="80" stroke="#12324a" stroke-width="3"/><line x1="100" y1="80" x2="40" y2="30" stroke="#12324a" stroke-width="3"/><line x1="100" y1="80" x2="60" y2="140" stroke="#12324a" stroke-width="3"/><text x="120" y="66" font-size="15" fill="#0a7d34" font-weight="700">${a}°</text><text x="55" y="55" font-size="15" fill="#0a7d34" font-weight="700">${b}°</text><text x="95" y="120" font-size="15" fill="#c0392b" font-weight="700">x°</text></svg>`;
  }
  function svgTriangle(a, b) {
    return `<svg viewBox="0 0 210 140" width="210" height="140" role="img"><polygon points="25,115 185,115 80,25" fill="#e8f5ec" stroke="#12324a" stroke-width="3"/><text x="40" y="108" font-size="15" fill="#0a7d34" font-weight="700">${a}°</text><text x="150" y="108" font-size="15" fill="#0a7d34" font-weight="700">${b}°</text><text x="72" y="45" font-size="15" fill="#c0392b" font-weight="700">x°</text></svg>`;
  }
  const missingStep = (sum, known, x, why) => ([
    pickStep({ key: 'sum', prompt: `These angles add up to how many degrees?`, hint: `${why}`, why: why,
      resultText: `they add to ${sum}°`, expected: [sum], pool: ['90', '180', '360', '270'], diagnose: () => ({ correct: false, id: 'angle-sum', ctx: { sum } }) }),
    pickStep({ key: 'x', prompt: `So the missing angle x = ${sum} − ${known} = ?`, hint: `${sum} − ${known} = ${x}.`, why: `Take the known angle${String(known).includes('−') ? 's' : ''} away from ${sum} to find x.`,
      resultText: `x = ${x}°`, expected: [x, x + '°'], pool: numberPool([x], 4, Math.max(1, x - 20), x + 20).map(String), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: x, expr: `${sum} − ${known}` } }) }),
  ]);
  function angleOnLine() {
    const a = rand(25, 155), x = 180 - a;
    return { subject: 'angles', given: `Angles on a straight line — find x`, sig: `line:${a}`, diagram: svgLine(a, null), answer: `${x}°`,
      steps: missingStep(180, a, x, `Angles on a straight line always add up to 180°.`) };
  }
  function angleAroundPoint() {
    const a = rand(60, 140), b = rand(60, 140), x = 360 - a - b;
    return { subject: 'angles', given: `Angles around a point — find x`, sig: `point:${a},${b}`, diagram: svgPoint(a, b), answer: `${x}°`,
      steps: missingStep(360, `${a} − ${b}`, x, `Angles around a full point always add up to 360°.`) };
  }
  function angleTriangle() {
    const a = rand(35, 90), b = rand(30, 180 - a - 20), x = 180 - a - b;
    return { subject: 'angles', given: `Angles in a triangle — find x`, sig: `tri:${a},${b}`, diagram: svgTriangle(a, b), answer: `${x}°`,
      steps: missingStep(180, `${a} − ${b}`, x, `The three angles inside any triangle always add up to 180°.`) };
  }

  // ===================== PERIMETER & AREA (with SVG) =====================
  function svgRect(L, Wd) {
    return `<svg viewBox="0 0 240 140" width="240" height="140" role="img"><rect x="35" y="30" width="170" height="80" fill="#e8f5ec" stroke="#12324a" stroke-width="3"/><text x="120" y="24" font-size="15" fill="#12324a" font-weight="700" text-anchor="middle">${L} cm</text><text x="216" y="74" font-size="15" fill="#12324a" font-weight="700">${Wd} cm</text></svg>`;
  }
  function svgTri(b, h) {
    return `<svg viewBox="0 0 240 150" width="240" height="150" role="img"><polygon points="30,120 210,120 90,25" fill="#e8f5ec" stroke="#12324a" stroke-width="3"/><line x1="90" y1="25" x2="90" y2="120" stroke="#c0392b" stroke-width="2" stroke-dasharray="5 4"/><text x="120" y="138" font-size="15" fill="#12324a" font-weight="700" text-anchor="middle">base ${b} cm</text><text x="96" y="80" font-size="14" fill="#c0392b" font-weight="700">h ${h} cm</text></svg>`;
  }
  function rectArea(L, Wd) {
    const area = L * Wd;
    return { subject: 'area', given: `Find the AREA of this rectangle`, sig: `ra:${L}x${Wd}`, diagram: svgRect(L, Wd), answer: `${area} cm²`,
      steps: [pickStep({ key: 'area', prompt: `Area of a rectangle = length × width = ${L} × ${Wd} = ?`, hint: `${L} × ${Wd}.`, why: `Area = length × width. It counts the squares that fit inside, measured in cm².`,
        resultText: `Area = ${area} cm²`, expected: [area, `${area}`], pool: numberPool([area], 4, 1, area + L + Wd), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: area, expr: `${L} × ${Wd}` } }) })] };
  }
  function rectPerimeter(L, Wd) {
    const half = L + Wd, per = 2 * half;
    return { subject: 'area', given: `Find the PERIMETER of this rectangle`, sig: `rp:${L}x${Wd}`, diagram: svgRect(L, Wd), answer: `${per} cm`,
      steps: [
        pickStep({ key: 'add', prompt: `Perimeter is the distance all the way round. First add one length and one width: ${L} + ${Wd} = ?`, hint: `${L} + ${Wd}.`, why: `A rectangle has two lengths and two widths. One of each adds to ${half}, then we double it.`,
          resultText: `${L} + ${Wd} = ${half}`, expected: [half], pool: numberPool([half], 4, 1, half + 8), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: half, expr: `${L} + ${Wd}` } }) }),
        pickStep({ key: 'double', prompt: `Now double it (there are two of each): ${half} × 2 = ?`, hint: `${half} × 2.`, why: `There are two lengths and two widths, so multiply by 2.`,
          resultText: `Perimeter = ${per} cm`, expected: [per, `${per}`], pool: numberPool([per], 4, half, per + 8), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: per, expr: `${half} × 2` } }) }),
      ] };
  }
  function triArea(b, h) {
    const prod = b * h, area = prod / 2;
    return { subject: 'area', given: `Find the AREA of this triangle`, sig: `ta:${b}x${h}`, diagram: svgTri(b, h), answer: `${area} cm²`,
      steps: [
        pickStep({ key: 'bh', prompt: `Triangle area = ½ × base × height. First: base × height = ${b} × ${h} = ?`, hint: `${b} × ${h}.`, why: `A triangle is half of a rectangle around it. So we do base × height, then halve.`,
          resultText: `${b} × ${h} = ${prod}`, expected: [prod], pool: numberPool([prod], 4, 1, prod + b + h), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: prod, expr: `${b} × ${h}` } }) }),
        pickStep({ key: 'half', prompt: `Now halve it: ${prod} ÷ 2 = ?`, hint: `${prod} ÷ 2.`, why: `The triangle is half the rectangle, so divide by 2.`,
          resultText: `Area = ${area} cm²`, expected: [area, `${area}`], pool: numberPool([area], 4, 1, area + b), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: area, expr: `${prod} ÷ 2` } }) }),
      ] };
  }

  const api = {
    fdpFromFraction, fdpPercentToFraction, placeValue, ordering,
    angleOnLine, angleAroundPoint, angleTriangle, rectArea, rectPerimeter, triArea,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
