/* harder2.js — Challenge-level generators for the SHAPE, MEASURE and DATA topics.
   Angles beyond "add to 180", compound areas, surface area, midpoints, shape
   properties, symmetry, scaled bar charts and two-way tables.
   Diagrams are small inline SVG (or a plain HTML table) in the `diagram` field. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, chooseStep = W._chooseStep;
  const numberPool = W._numberPool, list = W._list, shuffle = W._shuffle;
  const { parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function nStep(o) {
    const a = o.answer;
    const lo = o.lo != null ? o.lo : a - 12, hi = o.hi != null ? o.hi : a + 12;
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], pool: o.pool || numberPool([a], 4, lo, hi), isAnswer: !!o.isAnswer,
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }
  const INK = '#12324a', FILL = '#e8f5ec', RED = '#c0392b', GREEN = '#0a7d34';

  // ============================================================ ANGLES — challenge
  function svgQuad(a, b, c) {
    return `<svg viewBox="0 0 250 165" width="250" height="165" role="img">` +
      `<polygon points="30,135 220,135 195,35 60,25" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<text x="46" y="124" font-size="14" fill="${GREEN}" font-weight="700">${a}°</text>` +
      `<text x="186" y="124" font-size="14" fill="${GREEN}" font-weight="700">${b}°</text>` +
      `<text x="176" y="56" font-size="14" fill="${GREEN}" font-weight="700">${c}°</text>` +
      `<text x="66" y="48" font-size="14" fill="${RED}" font-weight="700">x°</text></svg>`;
  }
  function angleQuadrilateral() {
    const a = rand(60, 130), b = rand(60, 130), c = rand(60, 130), x = 360 - a - b - c;
    if (x < 25 || x > 170) return angleQuadrilateral();
    const known = a + b + c;
    return {
      subject: 'angles', given: `Angles in a quadrilateral — find x`, sig: `q:${a},${b},${c}`, diagram: svgQuad(a, b, c), answer: `${x}°`,
      steps: [
        nStep({ key: 'sum', prompt: `How many degrees do the angles inside a quadrilateral add up to?`,
          hint: `A quadrilateral splits into two triangles: 2 × 180 = 360°.`,
          why: `Draw one diagonal and any quadrilateral becomes two triangles. Each triangle is 180°, so the four angles total 360°.`,
          resultText: `they add to 360°`, answer: 360, pool: [180, 270, 360, 540], expr: `2 × 180` }),
        nStep({ key: 'known', prompt: `Add the three angles you know: ${a} + ${b} + ${c} = ?`, hint: `${a} + ${b} + ${c} = ${known}.`,
          why: `Total up what you have been given before subtracting.`,
          resultText: `known angles = ${known}°`, answer: known, lo: known - 20, hi: known + 20, expr: `${a} + ${b} + ${c}` }),
        nStep({ key: 'x', prompt: `So x = 360 − ${known} = ?`, hint: `360 − ${known} = ${x}.`,
          why: `The four angles must total 360°, so whatever is left over after the three known ones is x.`,
          longWay: `Quadrilateral = 360°\n${a} + ${b} + ${c} = ${known}\nx = 360 − ${known} = ${x}°`,
          resultText: `x = ${x}°`, answer: x, lo: Math.max(1, x - 20), hi: x + 20, expr: `360 − ${known}`, isAnswer: true }),
      ],
    };
  }
  function svgIso(apex, base, showApex) {
    return `<svg viewBox="0 0 230 155" width="230" height="155" role="img">` +
      `<polygon points="30,125 200,125 115,25" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="66" y1="80" x2="74" y2="76" stroke="${RED}" stroke-width="2.5"/><line x1="70" y1="86" x2="78" y2="82" stroke="${RED}" stroke-width="2.5"/>` +
      `<line x1="156" y1="76" x2="164" y2="80" stroke="${RED}" stroke-width="2.5"/><line x1="152" y1="82" x2="160" y2="86" stroke="${RED}" stroke-width="2.5"/>` +
      `<text x="100" y="52" font-size="14" fill="${showApex ? GREEN : RED}" font-weight="700">${showApex ? apex + '°' : 'x°'}</text>` +
      `<text x="44" y="118" font-size="14" fill="${showApex ? RED : GREEN}" font-weight="700">${showApex ? 'x°' : base + '°'}</text>` +
      `<text x="172" y="118" font-size="14" fill="${INK}" font-weight="700">${showApex ? 'x°' : base + '°'}</text></svg>`;
  }
  // Isosceles: either the apex is given (halve what's left) or a base angle is given.
  function angleIsosceles() {
    const apexGiven = Math.random() < 0.5;
    if (apexGiven) {
      const apex = rand(20, 140) * 2 % 2 === 0 ? rand(10, 70) * 2 : 40;   // even apex → whole base angles
      const left = 180 - apex, base = left / 2;
      return {
        subject: 'angles', given: `An isosceles triangle. The two marked sides are equal. Find x`, sig: `iso-a:${apex}`,
        diagram: svgIso(apex, base, true), answer: `${base}°`,
        steps: [
          nStep({ key: 'left', prompt: `The three angles add to 180°. Take away the top one: 180 − ${apex} = ?`,
            hint: `180 − ${apex} = ${left}.`,
            why: `First find out how much is left for the two bottom angles to share.`,
            resultText: `${left}° left for the two base angles`, answer: left, lo: Math.max(1, left - 20), hi: left + 20, expr: `180 − ${apex}` }),
          nStep({ key: 'half', prompt: `The two equal sides mean the two BASE angles are equal. So x = ${left} ÷ 2 = ?`,
            hint: `${left} ÷ 2 = ${base}.`,
            why: `In an isosceles triangle the angles opposite the two equal sides are equal to each other. Those ${left}° split evenly between them.`,
            longWay: `180 − ${apex} = ${left}\n${left} ÷ 2 = ${base}°`,
            resultText: `x = ${base}°`, answer: base, lo: Math.max(1, base - 15), hi: base + 15, expr: `${left} ÷ 2`, isAnswer: true }),
        ],
      };
    }
    const base = rand(25, 75), apex = 180 - 2 * base;
    return {
      subject: 'angles', given: `An isosceles triangle. The two marked sides are equal. Find x`, sig: `iso-b:${base}`,
      diagram: svgIso(apex, base, false), answer: `${apex}°`,
      steps: [
        nStep({ key: 'two', prompt: `Both base angles are ${base}° (equal sides give equal angles). What do the two of them make? ${base} × 2 = ?`,
          hint: `${base} × 2 = ${2 * base}.`,
          why: `You are only told one base angle, but the equal sides mean the other one matches it. That is the fact you have to spot.`,
          resultText: `the two base angles = ${2 * base}°`, answer: 2 * base, lo: base, hi: 2 * base + 20, expr: `${base} × 2` }),
        nStep({ key: 'x', prompt: `Now the top angle: x = 180 − ${2 * base} = ?`, hint: `180 − ${2 * base} = ${apex}.`,
          why: `All three angles total 180°, so subtract the two base angles.`,
          longWay: `Base angles: ${base}° and ${base}°\n${base} × 2 = ${2 * base}\nx = 180 − ${2 * base} = ${apex}°`,
          resultText: `x = ${apex}°`, answer: apex, lo: Math.max(1, apex - 20), hi: apex + 20, expr: `180 − ${2 * base}`, isAnswer: true }),
      ],
    };
  }
  // The two labels have to SIT in the positions that make them the named pair — the
  // given angle is interior-right at the top crossing, and x moves to match:
  //   alternate    → interior LEFT at the bottom crossing  (the Z)
  //   co-interior  → interior RIGHT at the bottom crossing (the C)
  //   corresponding→ exterior RIGHT at the bottom crossing (the F)
  // No Z/C/F letter is drawn: naming the pair is the first thing the child is asked.
  function svgParallel(a, kind) {
    const xPos = kind === 'alt' ? [56, 112] : kind === 'co' ? [112, 112] : [104, 143];
    return `<svg viewBox="0 0 260 168" width="260" height="168" role="img">` +
      `<line x1="18" y1="45" x2="242" y2="45" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="18" y1="120" x2="242" y2="120" stroke="${INK}" stroke-width="3"/>` +
      `<polyline points="34,40 42,45 34,50" fill="none" stroke="${INK}" stroke-width="2"/>` +
      `<polyline points="34,115 42,120 34,125" fill="none" stroke="${INK}" stroke-width="2"/>` +
      `<line x1="60" y1="158" x2="200" y2="8" stroke="${RED}" stroke-width="2.5"/>` +
      `<text x="176" y="66" font-size="14" fill="${GREEN}" font-weight="700">${a}°</text>` +
      `<text x="${xPos[0]}" y="${xPos[1]}" font-size="14" fill="${RED}" font-weight="700">x°</text></svg>`;
  }
  const PARA = {
    alt: { x: (a) => a, name: 'alternate angles', why: `Alternate angles sit on OPPOSITE sides of the crossing line, inside the parallel lines — they make a Z shape, and they are always EQUAL.`, rel: 'equal to' },
    co: { x: (a) => 180 - a, name: 'co-interior angles', why: `Co-interior (allied) angles sit on the SAME side of the crossing line, inside the parallel lines — they make a C shape, and they always add up to 180°.`, rel: 'add with' },
    corr: { x: (a) => a, name: 'corresponding angles', why: `Corresponding angles sit in matching positions at the two crossings — they make an F shape, and they are always EQUAL.`, rel: 'equal to' },
  };
  function angleParallel() {
    const kind = pick(['alt', 'co', 'corr']);
    const info = PARA[kind];
    const a = rand(35, 145), x = info.x(a);
    const steps = [
      pickStep({ key: 'name', prompt: `Two parallel lines crossed by a straight line. What kind of angle pair are ${a}° and x?`,
        hint: `Look at the shape they make: ${kind === 'alt' ? 'a Z' : kind === 'co' ? 'a C' : 'an F'} → ${info.name}.`,
        why: info.why, resultText: `${info.name}`, expected: [info.name],
        pool: shuffle(['alternate angles', 'co-interior angles', 'corresponding angles']),
        diagnose: () => ({ correct: false, id: 'angle-pair', ctx: { name: info.name, why: info.why } }) }),
      nStep({ key: 'x', prompt: kind === 'co' ? `Co-interior angles add to 180°. So x = 180 − ${a} = ?` : `${info.name.charAt(0).toUpperCase() + info.name.slice(1)} are equal. So x = ?`,
        hint: kind === 'co' ? `180 − ${a} = ${x}.` : `x is the same as ${a}°.`,
        why: info.why,
        longWay: `${a}° and x are ${info.name}\n${kind === 'co' ? `x = 180 − ${a} = ${x}°` : `x = ${a}°`}`,
        resultText: `x = ${x}°`, answer: x, lo: Math.max(1, x - 20), hi: x + 20,
        // at x = 90 the "equal", "180 − x" and "a" traps all collapse onto one card
        pool: numberPool(uniqSort([x, 180 - x, a, 90].filter((v) => v > 0)), 2, Math.max(5, x - 30), x + 30),
        expr: kind === 'co' ? `180 − ${a}` : `the same as ${a}`, isAnswer: true }),
    ];
    return { subject: 'angles', given: `Parallel lines — find x`, sig: `par:${kind}:${a}`, diagram: svgParallel(a, kind), answer: `${x}°`, steps };
  }
  const POLY = { 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon' };
  function anglePolygon() {
    const n = Number(pick(Object.keys(POLY)));
    const tri = n - 2, sum = tri * 180, each = sum / n;
    const whole = Number.isInteger(each);
    const steps = [
      nStep({ key: 'tri', prompt: `A ${POLY[n]} has ${n} sides. Split it into triangles from one corner — how many triangles do you get? (${n} − 2)`,
        hint: `${n} − 2 = ${tri}.`,
        why: `From a single corner you can draw diagonals to every corner except itself and its two neighbours, which cuts ANY polygon into (sides − 2) triangles.`,
        resultText: `${tri} triangles`, answer: tri, pool: uniqSort([tri, n, n - 1, tri + 2]), expr: `${n} − 2` }),
      nStep({ key: 'sum', prompt: `Each triangle is 180°, so the angles inside a ${POLY[n]} add up to ${tri} × 180 = ?`,
        hint: `${tri} × 180 = ${sum}.`,
        why: `Interior angle sum = (n − 2) × 180°. This one formula covers every polygon there is.`,
        resultText: `interior angles add to ${sum}°`, answer: sum, pool: uniqSort([sum, sum + 180, sum - 180, n * 180]),
        expr: `${tri} × 180`, isAnswer: !whole }),
    ];
    if (whole) {
      steps.push(nStep({ key: 'each', prompt: `In a REGULAR ${POLY[n]} all ${n} angles are the same size. So each one is ${sum} ÷ ${n} = ?`,
        hint: `${sum} ÷ ${n} = ${each}.`,
        why: `"Regular" means all sides and all angles equal, so share the total equally between the ${n} corners.`,
        longWay: `(${n} − 2) × 180 = ${sum}°\n${sum} ÷ ${n} = ${each}° each`,
        resultText: `each angle = ${each}°`, answer: each, lo: Math.max(1, each - 25), hi: each + 25, expr: `${sum} ÷ ${n}`, isAnswer: true }));
    }
    return {
      subject: 'angles', given: whole ? `Find the size of EACH interior angle of a regular ${POLY[n]}` : `Find the sum of the interior angles of a ${POLY[n]}`,
      sig: `poly:${n}:${whole ? 'each' : 'sum'}`, answer: whole ? `${each}°` : `${sum}°`,
      // Draw it with the diagonals from one corner: the triangles you're asked to
      // count are then something to look at, not something to picture.
      diagram: svgPolyFan(n), steps,
    };
  }
  function svgPolyFan(n) {
    const pts = W.fig.regularPts(n), S = 150, pad = 16;
    const X = (p) => pad + (p[0] / 100) * S, Y = (p) => pad + (p[1] / 100) * S;
    const poly = pts.map((p) => `${X(p)},${Y(p)}`).join(' ');
    let body = `<polygon points="${poly}" fill="${FILL}" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 2; i < n - 1; i++) {
      body += `<line x1="${X(pts[0])}" y1="${Y(pts[0])}" x2="${X(pts[i])}" y2="${Y(pts[i])}" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>`;
    }
    return `<svg viewBox="0 0 ${S + pad * 2} ${S + pad * 2}" width="${S + pad * 2}" height="${S + pad * 2}" role="img">${body}</svg>`;
  }

  // ============================================================ AREA — challenge
  // Every LABEL on this diagram is a real edge of the L-shape, the way an exam draws it.
  // The one edge deliberately left blank is the right-hand side (B − d): working that
  // out from the other measurements is the actual skill the question is testing.
  function svgLShape(A, B, c, d) {
    const u = Math.min(148 / A, 96 / B), ox = 54, oy = 26;
    const Y = (my) => oy + (B - my) * u, X = (mx) => ox + mx * u;
    const pts = [[0, 0], [A, 0], [A, B - d], [A - c, B - d], [A - c, B], [0, B]]
      .map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');
    const w = ox + A * u + 58, h = oy + B * u + 36;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
      `<polygon points="${pts}" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="${X(0)}" y1="${Y(B - d)}" x2="${X(A - c)}" y2="${Y(B - d)}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="5 4"/>` +
      `<text x="${X(A / 2)}" y="${Y(0) + 20}" font-size="13" fill="${INK}" font-weight="700" text-anchor="middle">${A} cm</text>` +
      `<text x="${ox - 48}" y="${Y(B / 2) + 4}" font-size="13" fill="${INK}" font-weight="700">${B} cm</text>` +
      `<text x="${X((A - c) / 2)}" y="${Y(B) - 8}" font-size="12" fill="${INK}" font-weight="700" text-anchor="middle">${A - c} cm</text>` +
      `<text x="${X(A - c) + 6}" y="${Y(B - d / 2) + 4}" font-size="12" fill="${INK}" font-weight="700">${d} cm</text>` +
      `<text x="${X(A) + 6}" y="${Y((B - d) / 2) + 4}" font-size="13" fill="${RED}" font-weight="700">?</text></svg>`;
  }
  // L-shape: find the unlabelled edge, then split into two rectangles and add.
  function compoundArea() {
    const A = rand(7, 14), B = rand(6, 11), c = rand(2, A - 4), d = rand(2, B - 3);
    const right = B - d, bottom = A * right, top = (A - c) * d, total = bottom + top;
    return {
      subject: 'area', given: `Find the AREA of this L-shape`, sig: `Ls:${A},${B},${c},${d}`, diagram: svgLShape(A, B, c, d), answer: `${total} cm²`,
      steps: [
        nStep({ key: 'side', prompt: `The right-hand edge (marked ?) isn't given. Work it out: ${B} − ${d} = ?`,
          hint: `${B} − ${d} = ${right}.`,
          why: `The whole left side is ${B} cm. The step down the right is ${d} cm of that, so the short right-hand edge is what's left: ${B} − ${d}. Finding a missing length from the ones you ARE given is what makes a composite shape harder than a plain rectangle.`,
          resultText: `the right-hand edge is ${right} cm`, answer: right, lo: 1, hi: B + 6, expr: `${B} − ${d}` }),
        nStep({ key: 'bot', prompt: `Now cut along the dashed line into two rectangles. The BOTTOM one is ${A} cm by ${right} cm: ${A} × ${right} = ?`,
          hint: `${A} × ${right}.`,
          why: `A composite shape has no formula of its own. Cut it into rectangles you DO know, work each one out, then add them up.`,
          resultText: `bottom rectangle = ${bottom} cm²`, answer: bottom, lo: Math.max(1, bottom - 20), hi: bottom + 20, expr: `${A} × ${right}` }),
        nStep({ key: 'top', prompt: `The TOP rectangle is ${A - c} cm by ${d} cm: ${A - c} × ${d} = ?`,
          hint: `${A - c} × ${d}.`,
          why: `Both of these are labelled straight on the diagram — just don't accidentally use the ${A} cm bottom edge for this one, because the top rectangle is narrower.`,
          resultText: `top rectangle = ${top} cm²`, answer: top, lo: Math.max(1, top - 20), hi: top + 20, expr: `${A - c} × ${d}` }),
        nStep({ key: 'tot', prompt: `Add the two pieces: ${bottom} + ${top} = ?`, hint: `${bottom} + ${top} = ${total}.`,
          why: `The two rectangles together make the whole L-shape, so their areas add.`,
          longWay: `Missing edge: ${B} − ${d} = ${right}\nBottom: ${A} × ${right} = ${bottom}\nTop: ${A - c} × ${d} = ${top}\nTotal: ${bottom} + ${top} = ${total} cm²`,
          resultText: `Area = ${total} cm²`, answer: total, lo: Math.max(1, total - 25), hi: total + 25, expr: `${bottom} + ${top}`, isAnswer: true }),
      ],
    };
  }
  function svgParallelogram(b, h) {
    return `<svg viewBox="0 0 250 150" width="250" height="150" role="img">` +
      `<polygon points="30,120 190,120 220,35 60,35" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="60" y1="35" x2="60" y2="120" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="110" y="140" font-size="14" fill="${INK}" font-weight="700" text-anchor="middle">base ${b} cm</text>` +
      `<text x="66" y="82" font-size="13" fill="${RED}" font-weight="700">h ${h}</text></svg>`;
  }
  function parallelogramArea(b, h) {
    const area = b * h;
    return {
      subject: 'area', given: `Find the AREA of this parallelogram`, sig: `pg:${b}x${h}`, diagram: svgParallelogram(b, h), answer: `${area} cm²`,
      steps: [
        nStep({ key: 'area', prompt: `Area of a parallelogram = base × PERPENDICULAR height = ${b} × ${h} = ?`,
          hint: `${b} × ${h}.`,
          why: `Slice the slanted triangle off one end and slide it to the other — the parallelogram becomes a rectangle ${b} by ${h}. That is why you use the straight-up height (the dashed line), never the slanted side.`,
          longWay: `Area = base × height = ${b} × ${h} = ${area} cm²`,
          resultText: `Area = ${area} cm²`, answer: area, lo: Math.max(1, area - 20), hi: area + 20, expr: `${b} × ${h}`, isAnswer: true }),
      ],
    };
  }
  function svgTrapezium(a, b, h) {
    return `<svg viewBox="0 0 250 155" width="250" height="155" role="img">` +
      `<polygon points="25,125 215,125 175,35 75,35" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="75" y1="35" x2="75" y2="125" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="125" y="28" font-size="13" fill="${INK}" font-weight="700" text-anchor="middle">a = ${a} cm</text>` +
      `<text x="120" y="145" font-size="13" fill="${INK}" font-weight="700" text-anchor="middle">b = ${b} cm</text>` +
      `<text x="81" y="86" font-size="13" fill="${RED}" font-weight="700">h ${h}</text></svg>`;
  }
  function trapeziumArea(a, b, h) {
    const sum = a + b, prod = sum * h, area = prod / 2;
    return {
      subject: 'area', given: `Find the AREA of this trapezium`, sig: `tz:${a},${b},${h}`, diagram: svgTrapezium(a, b, h), answer: `${area} cm²`,
      steps: [
        nStep({ key: 'sum', prompt: `Area of a trapezium = ½ × (a + b) × h. First add the two parallel sides: ${a} + ${b} = ?`,
          hint: `${a} + ${b} = ${sum}.`,
          why: `Adding the two parallel sides and halving gives their AVERAGE — so a trapezium behaves like a rectangle whose width is the average of its top and bottom.`,
          resultText: `a + b = ${sum}`, answer: sum, lo: Math.max(1, sum - 12), hi: sum + 12, expr: `${a} + ${b}` }),
        nStep({ key: 'mul', prompt: `Now multiply by the height: ${sum} × ${h} = ?`, hint: `${sum} × ${h}.`,
          why: `Use the perpendicular height (the dashed line), not a slanted side.`,
          resultText: `${sum} × ${h} = ${prod}`, answer: prod, lo: Math.max(1, prod - 20), hi: prod + 20, expr: `${sum} × ${h}` }),
        nStep({ key: 'half', prompt: `And halve it: ${prod} ÷ 2 = ?`, hint: `${prod} ÷ 2 = ${area}.`,
          why: `The ½ in the formula is what turns "sum of the parallel sides" into "average of them".`,
          longWay: `½ × (${a} + ${b}) × ${h}\n= ½ × ${sum} × ${h}\n= ${prod} ÷ 2\n= ${area} cm²`,
          resultText: `Area = ${area} cm²`, answer: area, lo: Math.max(1, area - 20), hi: area + 20, expr: `${prod} ÷ 2`, isAnswer: true }),
      ],
    };
  }
  // Reverse: the area is given, one side is missing.
  function missingSide(L, Wd) {
    const area = L * Wd, per = 2 * (L + Wd);
    return {
      subject: 'area', given: `This rectangle has an area of ${area} cm². Find its PERIMETER.`,
      sig: `ms:${L}x${Wd}`, answer: `${per} cm`,
      diagram: W.fig.rect(L, '?', { inside: `area = ${area} cm²`, missing: 'W' }),
      steps: [
        nStep({ key: 'w', prompt: `Area = length × width. The length is ${L} cm, so work backwards: width = ${area} ÷ ${L} = ?`,
          hint: `${area} ÷ ${L} = ${Wd}.`,
          why: `You are given the answer to a multiplication and one of the numbers, so divide to find the other. This is the reverse of the usual area question.`,
          resultText: `width = ${Wd} cm`, answer: Wd, lo: 1, hi: Wd + 12, expr: `${area} ÷ ${L}` }),
        nStep({ key: 'half', prompt: `Now the perimeter. One length + one width = ${L} + ${Wd} = ?`, hint: `${L} + ${Wd}.`,
          why: `A rectangle has two of each, so add one of each and double.`,
          resultText: `${L} + ${Wd} = ${L + Wd}`, answer: L + Wd, lo: 1, hi: L + Wd + 12, expr: `${L} + ${Wd}` }),
        nStep({ key: 'per', prompt: `Double it: ${L + Wd} × 2 = ?`, hint: `${L + Wd} × 2 = ${per}.`,
          why: `Perimeter is the whole way round: two lengths and two widths.`,
          longWay: `width = ${area} ÷ ${L} = ${Wd}\nperimeter = 2 × (${L} + ${Wd}) = ${per} cm`,
          resultText: `Perimeter = ${per} cm`, answer: per, lo: Math.max(1, per - 15), hi: per + 15, expr: `${L + Wd} × 2`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ VOLUME — challenge
  function svgCuboid2(l, w, h) {
    return `<svg viewBox="0 0 210 150" width="210" height="150" role="img"><rect x="35" y="55" width="95" height="70" fill="${FILL}" stroke="${INK}" stroke-width="3"/><polygon points="35,55 70,25 165,25 130,55" fill="#d0ead9" stroke="${INK}" stroke-width="3"/><polygon points="130,55 165,25 165,95 130,125" fill="#c0dccb" stroke="${INK}" stroke-width="3"/><text x="82" y="142" font-size="14" fill="${INK}" font-weight="700" text-anchor="middle">${l} cm</text><text x="16" y="95" font-size="14" fill="${INK}" font-weight="700">${h}</text><text x="150" y="70" font-size="14" fill="${INK}" font-weight="700">${w}</text></svg>`;
  }
  function surfaceArea(l, w, h) {
    const f1 = l * h, f2 = w * h, f3 = l * w, halfSum = f1 + f2 + f3, total = 2 * halfSum;
    return {
      subject: 'volume', given: `Find the SURFACE AREA of this cuboid`, sig: `sa:${l},${w},${h}`, diagram: svgCuboid2(l, w, h), answer: `${total} cm²`,
      steps: [
        nStep({ key: 'f1', prompt: `A cuboid has 6 faces in 3 matching pairs. Front face: ${l} × ${h} = ?`, hint: `${l} × ${h}.`,
          why: `Surface area is the total of all six flat faces — it is an AREA (cm²), not a volume (cm³). Do one of each pair, then double at the end.`,
          resultText: `front = ${f1} cm²`, answer: f1, lo: 1, hi: f1 + 18, expr: `${l} × ${h}` }),
        nStep({ key: 'f2', prompt: `Side face: ${w} × ${h} = ?`, hint: `${w} × ${h}.`,
          why: `The two side faces match each other.`, resultText: `side = ${f2} cm²`, answer: f2, lo: 1, hi: f2 + 18, expr: `${w} × ${h}` }),
        nStep({ key: 'f3', prompt: `Top face: ${l} × ${w} = ?`, hint: `${l} × ${w}.`,
          why: `Top and bottom match each other.`, resultText: `top = ${f3} cm²`, answer: f3, lo: 1, hi: f3 + 18, expr: `${l} × ${w}` }),
        nStep({ key: 'sum', prompt: `Add those three: ${f1} + ${f2} + ${f3} = ?`, hint: `${f1} + ${f2} + ${f3} = ${halfSum}.`,
          why: `That is one of each pair — exactly half the cuboid's surface.`,
          resultText: `${halfSum} cm² (half of them)`, answer: halfSum, lo: Math.max(1, halfSum - 20), hi: halfSum + 20, expr: `${f1} + ${f2} + ${f3}` }),
        nStep({ key: 'tot', prompt: `Each face has a matching partner, so double it: ${halfSum} × 2 = ?`, hint: `${halfSum} × 2 = ${total}.`,
          why: `Front matches back, left matches right, top matches bottom — so the total is twice what you just added.`,
          longWay: `2 × (${l}×${h} + ${w}×${h} + ${l}×${w})\n= 2 × (${f1} + ${f2} + ${f3})\n= 2 × ${halfSum}\n= ${total} cm²`,
          resultText: `Surface area = ${total} cm²`, answer: total, lo: Math.max(1, total - 30), hi: total + 30, expr: `${halfSum} × 2`, isAnswer: true }),
      ],
    };
  }
  function missingDimension(l, w, h) {
    const vol = l * w * h, base = l * w;
    return {
      subject: 'volume', given: `This cuboid has a volume of ${vol} cm³. Find its HEIGHT.`,
      sig: `md:${l},${w},${h}`, answer: `${h} cm`, diagram: W.fig.cuboid(l, w, h, 'h'),
      steps: [
        nStep({ key: 'base', prompt: `Volume = length × width × height. The length is ${l} cm and the width is ${w} cm, so first: ${l} × ${w} = ?`,
          hint: `${l} × ${w} = ${base}.`,
          why: `Deal with the two dimensions you know first — that turns the problem into a single missing-number multiplication.`,
          resultText: `base = ${base} cm²`, answer: base, lo: 1, hi: base + 18, expr: `${l} × ${w}` }),
        nStep({ key: 'h', prompt: `So ${base} × height = ${vol}. Work backwards: height = ${vol} ÷ ${base} = ?`,
          hint: `${vol} ÷ ${base} = ${h}.`,
          why: `To undo a multiplication you divide. The height is how many layers of ${base} cubes it takes to make ${vol}.`,
          longWay: `${l} × ${w} = ${base}\n${base} × h = ${vol}\nh = ${vol} ÷ ${base} = ${h} cm`,
          resultText: `Height = ${h} cm`, answer: h, lo: 1, hi: h + 12, expr: `${vol} ÷ ${base}`, isAnswer: true }),
      ],
    };
  }
  function svgPrism(b, ht, len) {
    return `<svg viewBox="0 0 230 155" width="230" height="155" role="img">` +
      `<polygon points="30,125 130,125 80,45" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="130,125 195,95 145,15 80,45" fill="#d0ead9" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="30" y1="125" x2="95" y2="95" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<line x1="95" y1="95" x2="195" y2="95" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<line x1="80" y1="45" x2="80" y2="125" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="76" y="145" font-size="13" fill="${INK}" font-weight="700" text-anchor="middle">base ${b}</text>` +
      `<text x="86" y="95" font-size="12" fill="${RED}" font-weight="700">h ${ht}</text>` +
      `<text x="166" y="128" font-size="13" fill="${INK}" font-weight="700">L ${len}</text></svg>`;
  }
  function prismVolume(b, ht, len) {
    const prod = b * ht, cross = prod / 2, vol = cross * len;
    return {
      subject: 'volume', given: `Find the VOLUME of this triangular prism`, sig: `pv:${b},${ht},${len}`, diagram: svgPrism(b, ht, len), answer: `${vol} cm³`,
      steps: [
        nStep({ key: 'bh', prompt: `A prism's volume = area of the cross-section × its length. The cross-section is a triangle. First: base × height = ${b} × ${ht} = ?`,
          hint: `${b} × ${ht}.`,
          why: `A prism is the same shape all the way through. Work out the area of that end face, then imagine stacking it along the length.`,
          resultText: `${b} × ${ht} = ${prod}`, answer: prod, lo: 1, hi: prod + 18, expr: `${b} × ${ht}` }),
        nStep({ key: 'cross', prompt: `Halve it for the triangle: ${prod} ÷ 2 = ?`, hint: `${prod} ÷ 2 = ${cross}.`,
          why: `Triangle area = ½ × base × height.`, resultText: `cross-section = ${cross} cm²`, answer: cross, lo: 1, hi: cross + 15, expr: `${prod} ÷ 2` }),
        nStep({ key: 'vol', prompt: `Now × the length: ${cross} × ${len} = ?`, hint: `${cross} × ${len}.`,
          why: `Volume = cross-section area × length. That rule works for ANY prism, whatever its end shape.`,
          longWay: `Triangle: ½ × ${b} × ${ht} = ${cross} cm²\nVolume: ${cross} × ${len} = ${vol} cm³`,
          resultText: `Volume = ${vol} cm³`, answer: vol, lo: Math.max(1, vol - 25), hi: vol + 25, expr: `${cross} × ${len}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ COORDINATES — midpoint
  function svgMid(x1, y1, x2, y2) {
    const M = 30, C = 22, N = 10, size = M + N * C + 18;
    let s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`;
    for (let i = 0; i <= N; i++) {
      const p = M + i * C;
      s += `<line x1="${M}" y1="${p}" x2="${M + N * C}" y2="${p}" stroke="#cfe0d6" stroke-width="1"/>`;
      s += `<line x1="${p}" y1="${M}" x2="${p}" y2="${M + N * C}" stroke="#cfe0d6" stroke-width="1"/>`;
      if (i % 2 === 0) s += `<text x="${p}" y="${M + N * C + 13}" font-size="9" fill="${INK}" text-anchor="middle">${i}</text>`;
      if (i % 2 === 0 && i > 0) s += `<text x="${M - 9}" y="${M + N * C - i * C + 4}" font-size="9" fill="${INK}" text-anchor="middle">${i}</text>`;
    }
    s += `<line x1="${M}" y1="${M}" x2="${M}" y2="${M + N * C}" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<line x1="${M}" y1="${M + N * C}" x2="${M + N * C}" y2="${M + N * C}" stroke="${INK}" stroke-width="2.5"/>`;
    const P = (x, y) => [M + x * C, M + N * C - y * C];
    const [ax, ay] = P(x1, y1), [bx, by] = P(x2, y2);
    s += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>`;
    s += `<circle cx="${ax}" cy="${ay}" r="5" fill="${GREEN}"/><text x="${ax + 8}" y="${ay - 6}" font-size="11" fill="${GREEN}" font-weight="700">A(${x1},${y1})</text>`;
    s += `<circle cx="${bx}" cy="${by}" r="5" fill="${GREEN}"/><text x="${bx + 8}" y="${by - 6}" font-size="11" fill="${GREEN}" font-weight="700">B(${x2},${y2})</text>`;
    return s + `</svg>`;
  }
  function midpoint(x1, y1, x2, y2) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return {
      subject: 'coords', given: `Find the MIDPOINT of the line joining A(${x1}, ${y1}) and B(${x2}, ${y2})`,
      sig: `mp:${x1},${y1},${x2},${y2}`, diagram: svgMid(x1, y1, x2, y2), answer: `(${mx}, ${my})`,
      steps: [
        nStep({ key: 'mx', prompt: `The midpoint is halfway along. For the x: (${x1} + ${x2}) ÷ 2 = ?`,
          hint: `${x1} + ${x2} = ${x1 + x2}, and ÷ 2 = ${mx}.`,
          why: `The midpoint's x-coordinate is the MEAN of the two x-coordinates — halfway between them. Do the same to the y separately.`,
          resultText: `x of midpoint = ${mx}`, answer: mx, lo: Math.max(0, mx - 6), hi: mx + 6, expr: `(${x1} + ${x2}) ÷ 2` }),
        nStep({ key: 'my', prompt: `Now the y: (${y1} + ${y2}) ÷ 2 = ?`, hint: `${y1} + ${y2} = ${y1 + y2}, and ÷ 2 = ${my}.`,
          why: `Average the y-coordinates the same way. Never mix an x with a y.`,
          resultText: `y of midpoint = ${my}`, answer: my, lo: Math.max(0, my - 6), hi: my + 6, expr: `(${y1} + ${y2}) ÷ 2` }),
        buildStep({ key: 'write', prompt: `Write the midpoint as a coordinate pair: ( x , y ).`,
          hint: `(${mx}, ${my}).`, why: `Coordinates always go (across, up) with brackets and a comma.`,
          longWay: `x: (${x1} + ${x2}) ÷ 2 = ${mx}\ny: (${y1} + ${y2}) ÷ 2 = ${my}\nMidpoint = (${mx}, ${my})`,
          resultText: `Midpoint = (${mx}, ${my})`,
          pieces: ['(', String(mx), ',', String(my), ')'], distractors: [String(x1), String(y2), String(mx + 1)], isAnswer: true,
          check: (raw) => {
            const p = parseNumberList(String(raw).replace(/[−–—]/g, '-'));
            if (p.length < 2) return { correct: false, id: 'coord-form', ctx: { x: mx, y: my } };
            if (p[0] === mx && p[1] === my) return { correct: true };
            if (p[0] === my && p[1] === mx) return { correct: false, id: 'coord-swap', ctx: { x: mx, y: my } };
            return { correct: false, id: 'coord-form', ctx: { x: mx, y: my } };
          } }),
      ],
    };
  }

  // ============================================================ GEOMETRY — properties & symmetry
  const PROPS = [
    { q: 'Which quadrilateral has four equal sides AND four right angles?', a: 'square', opts: ['square', 'rhombus', 'rectangle', 'kite'], why: 'A rhombus has four equal sides but its angles are not right angles; a rectangle has right angles but its sides are not all equal. Only a square has both.' },
    { q: 'Which quadrilateral has four equal sides but NO right angles?', a: 'rhombus', opts: ['rhombus', 'square', 'trapezium', 'rectangle'], why: 'A rhombus is a "pushed-over" square: all four sides equal, but the corners are not 90°.' },
    { q: 'Which quadrilateral has exactly ONE pair of parallel sides?', a: 'trapezium', opts: ['trapezium', 'parallelogram', 'rhombus', 'kite'], why: 'A parallelogram and a rhombus both have two pairs of parallel sides. A trapezium has just one.' },
    { q: 'Which quadrilateral has two pairs of equal ADJACENT sides and one line of symmetry?', a: 'kite', opts: ['kite', 'rhombus', 'parallelogram', 'rectangle'], why: 'In a kite the equal sides are next to each other, not opposite. Its one line of symmetry runs through the long diagonal.' },
    { q: 'In a parallelogram, opposite angles are…', a: 'equal', opts: ['equal', 'right angles', 'adding to 90°', 'all different'], why: 'Opposite angles in a parallelogram match, and angles next to each other add up to 180°.' },
    { q: 'A triangle with all three sides different lengths is called…', a: 'scalene', opts: ['scalene', 'isosceles', 'equilateral', 'right-angled'], why: 'Scalene = no equal sides and no equal angles. Isosceles has two equal, equilateral has three.' },
    { q: 'How many degrees is each angle in an equilateral triangle?', a: '60', opts: ['60', '45', '90', '120'], why: 'All three angles are equal and must total 180°, so 180 ÷ 3 = 60°.' },
    { q: 'The exterior angles of ANY polygon add up to…', a: '360', opts: ['360', '180', '540', 'depends on the sides'], why: 'Walk right round the outside of any polygon and you turn through one full circle — 360° — no matter how many sides it has.' },
    { q: 'Which of these is NOT always true of a rectangle?', a: 'all sides equal', opts: ['all sides equal', 'opposite sides equal', 'four right angles', 'diagonals equal'], why: 'A rectangle only needs its OPPOSITE sides equal. If all four are equal it is a square — a special case, not the rule.' },
    { q: 'The diagonals of a square cross at what angle?', a: '90', opts: ['90', '45', '60', '180'], why: 'A square\'s diagonals bisect each other at right angles — a property it shares with the rhombus.' },
  ];
  // Shapes the question offers as options get drawn side by side, so the child compares
  // pictures rather than trying to hold four quadrilaterals in their head.
  const DRAWABLE = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'kite',
    'equilateral triangle', 'isosceles triangle', 'scalene triangle'];
  function shapeProperty(entry) {
    const drawable = entry.opts.filter((o) => DRAWABLE.includes(o));
    return {
      subject: 'geometry', given: entry.q, sig: 'sp:' + entry.q, answer: String(entry.a),
      diagram: drawable.length >= 2 ? W.fig.gallery(drawable, 92) : undefined,
      steps: [pickStep({ key: 'prop', prompt: entry.q, hint: entry.why, why: entry.why,
        resultText: `answer: ${entry.a}`, expected: [entry.a], pool: shuffle(entry.opts.slice()), isAnswer: true,
        diagnose: () => ({ correct: false, id: 'geom-fact', ctx: { a: entry.a, why: entry.why } }) })],
    };
  }
  const SYMS = [
    { name: 'square', lines: 4, order: 4 },
    { name: 'rectangle', lines: 2, order: 2 },
    { name: 'equilateral triangle', lines: 3, order: 3 },
    { name: 'isosceles triangle', lines: 1, order: 1 },
    { name: 'regular pentagon', lines: 5, order: 5 },
    { name: 'regular hexagon', lines: 6, order: 6 },
    { name: 'rhombus', lines: 2, order: 2 },
    { name: 'parallelogram', lines: 0, order: 2 },
    { name: 'kite', lines: 1, order: 1 },
    { name: 'regular octagon', lines: 8, order: 8 },
  ];
  function symmetry(s, rotational) {
    const val = rotational ? s.order : s.lines;
    const other = rotational ? s.lines : s.order;
    return {
      subject: 'geometry', sig: `sym:${s.name}:${rotational ? 'r' : 'l'}`,
      given: rotational ? `What is the ORDER OF ROTATIONAL SYMMETRY of this ${s.name}?` : `How many LINES OF SYMMETRY does this ${s.name} have?`,
      answer: String(val),
      // The shape only — never its mirror lines, which would BE the answer.
      diagram: W.fig.shape(s.name, { size: 140 }),
      steps: [
        pickStep({ key: 'sym', prompt: rotational
          ? `Spin a ${s.name} through one full turn. How many times does it look exactly the same? (including back at the start)`
          : `How many mirror lines can you fold a ${s.name} along so both halves match exactly?`,
          hint: rotational ? `A ${s.name} has order ${val}.` : `A ${s.name} has ${val} line${val === 1 ? '' : 's'} of symmetry.`,
          why: rotational
            ? `Order of rotational symmetry counts the positions in a full 360° turn where the shape looks unchanged. Every shape has order at least 1 (all the way back round), so the answer is never 0. A ${s.name} has order ${s.order}${s.lines !== s.order ? `, even though it has ${s.lines} line${s.lines === 1 ? '' : 's'} of symmetry — the two counts do not have to match` : ''}.`
            : `A line of symmetry is a fold line where one half lands exactly on the other. A ${s.name} has ${s.lines}${s.lines !== s.order ? ` — careful, that is different from its rotational order of ${s.order}` : ''}.`,
          longWay: `${s.name}: ${s.lines} line${s.lines === 1 ? '' : 's'} of symmetry, rotational symmetry of order ${s.order}`,
          resultText: rotational ? `order ${val}` : `${val} line${val === 1 ? '' : 's'} of symmetry`,
          expected: [val], pool: uniqSort([val, other, val + 1, Math.max(0, val - 1), 0]).slice(0, 5), isAnswer: true,
          diagnose: () => ({ correct: false, id: 'symmetry', ctx: { name: s.name, val, rotational } }) }),
      ],
    };
  }

  // ============================================================ DATA & GRAPHS — challenge
  function svgBarsScaled(cats, vals, step) {
    const M = 34, BW = 32, GAP = 16, H = 140;
    const maxV = Math.ceil(Math.max(...vals) / step) * step + step;
    const scale = (H - 16) / maxV;
    const width = M + cats.length * (BW + GAP) + 12;
    let s = `<svg viewBox="0 0 ${width} ${H + 30}" width="${width}" height="${H + 30}" role="img">`;
    for (let g = step; g <= maxV; g += step) {
      const y = H - g * scale;
      s += `<line x1="${M}" y1="${y}" x2="${M + cats.length * (BW + GAP)}" y2="${y}" stroke="#e3ecf5" stroke-width="1"/>`;
      s += `<text x="${M - 6}" y="${y + 3}" font-size="9" fill="${INK}" text-anchor="end">${g}</text>`;
    }
    s += `<line x1="${M}" y1="${H}" x2="${M + cats.length * (BW + GAP)}" y2="${H}" stroke="${INK}" stroke-width="2"/>`;
    s += `<line x1="${M}" y1="8" x2="${M}" y2="${H}" stroke="${INK}" stroke-width="2"/>`;
    cats.forEach((c, i) => {
      const x = M + 8 + i * (BW + GAP), bh = vals[i] * scale;
      s += `<rect x="${x}" y="${H - bh}" width="${BW}" height="${bh}" fill="#1f9d55" stroke="${INK}" stroke-width="1.5"/>`;
      s += `<text x="${x + BW / 2}" y="${H + 14}" font-size="10" fill="${INK}" text-anchor="middle" font-weight="700">${c}</text>`;
    });
    return s + `</svg>`;
  }
  // Read a chart whose gridlines go up in 2s, 5s or 10s — the bar tops land BETWEEN lines.
  function barScaled(cats, vals, step) {
    const i = rand(0, cats.length - 1);
    const total = vals.reduce((a, b) => a + b, 0);
    const askTotal = Math.random() < 0.5;
    const steps = [
      nStep({ key: 'scale', prompt: `Careful — the scale does NOT go up in 1s. How much is each gridline worth here?`,
        hint: `The labels go ${step}, ${2 * step}, ${3 * step}… so each line is ${step}.`,
        why: `Always read the scale before reading a bar. Assuming every gridline is 1 is the single most common mistake with bar charts, and it makes every answer wrong.`,
        resultText: `each gridline = ${step}`, answer: step, pool: uniqSort([1, 2, 5, 10, step]), expr: `the gap between the labels` }),
      nStep({ key: 'read', prompt: `Now read the bar for ${cats[i]} — how many is it?`,
        hint: `The ${cats[i]} bar reaches ${vals[i]}.`,
        why: `Read across from the top of the bar to the scale. If it stops between two lines, count on in ${step}s from the line below.`,
        resultText: `${cats[i]} = ${vals[i]}`, answer: vals[i], pool: uniqSort([...vals, vals[i] + step, Math.max(0, vals[i] - step)]),
        expr: `the height of the ${cats[i]} bar`, isAnswer: !askTotal }),
    ];
    if (askTotal) {
      steps.push(nStep({ key: 'total', prompt: `Now add up every bar: ${vals.join(' + ')} = ?`, hint: `${vals.join(' + ')} = ${total}.`,
        why: `A "how many altogether" question needs every bar read off the scale correctly first — one misread bar spoils the total.`,
        longWay: `${cats.map((c, k) => `${c} = ${vals[k]}`).join('\n')}\nTotal = ${total}`,
        resultText: `Total = ${total}`, answer: total, lo: Math.max(0, total - 20), hi: total + 20, expr: vals.join(' + '), isAnswer: true }));
    }
    return {
      subject: 'graphs', given: askTotal ? `Bar chart (mind the scale) — how many ALTOGETHER?` : `Bar chart (mind the scale) — how many for ${cats[i]}?`,
      sig: `bs:${cats.join('')}:${vals.join(',')}:${askTotal ? 't' : i}`, diagram: svgBarsScaled(cats, vals, step),
      answer: String(askTotal ? total : vals[i]), steps,
    };
  }
  // Mean read off a bar chart — two skills at once.
  function barMean(cats, vals, step) {
    const total = vals.reduce((a, b) => a + b, 0), n = vals.length, mean = total / n;
    return {
      subject: 'graphs', given: `Find the MEAN of the values shown in this bar chart`, sig: `bm:${cats.join('')}:${vals.join(',')}`,
      diagram: svgBarsScaled(cats, vals, step), answer: String(mean),
      steps: [
        nStep({ key: 'total', prompt: `Read all ${n} bars and add them: ${vals.join(' + ')} = ?`, hint: `${vals.join(' + ')} = ${total}.`,
          why: `The mean needs the total first. Read each bar carefully against the scale — it goes up in ${step}s, not 1s.`,
          resultText: `total = ${total}`, answer: total, lo: Math.max(0, total - 20), hi: total + 20, expr: vals.join(' + ') }),
        nStep({ key: 'n', prompt: `How many bars are there?`, hint: `There are ${n}.`,
          why: `The mean divides by HOW MANY there are, not by the biggest value.`,
          resultText: `${n} bars`, answer: n, pool: uniqSort([n, n + 1, n - 1, n + 2].filter((v) => v > 0)), expr: `count the bars` }),
        nStep({ key: 'mean', prompt: `Mean = total ÷ how many = ${total} ÷ ${n} = ?`, hint: `${total} ÷ ${n} = ${mean}.`,
          why: `The mean is what each bar WOULD be if the total were shared out evenly between them.`,
          longWay: `Total = ${total}\nNumber of bars = ${n}\nMean = ${total} ÷ ${n} = ${mean}`,
          resultText: `Mean = ${mean}`, answer: mean, lo: Math.max(0, mean - 12), hi: mean + 12, expr: `${total} ÷ ${n}`, isAnswer: true }),
      ],
    };
  }
  // Two-way table with one missing cell.
  function twoWayTable() {
    const rows = pick([['Boys', 'Girls'], ['Year 6', 'Year 7'], ['Adults', 'Children']]);
    const cols = pick([['Football', 'Tennis'], ['Bus', 'Walk'], ['Cats', 'Dogs']]);
    const a = rand(8, 25), b = rand(8, 25), c = rand(8, 25), d = rand(8, 25);
    const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d, all = r1 + r2;
    const cell = (v) => (v == null ? '<b>?</b>' : v);
    const tbl =
      `<table class="wtable"><thead><tr><th></th><th>${cols[0]}</th><th>${cols[1]}</th><th>Total</th></tr></thead><tbody>` +
      `<tr><th>${rows[0]}</th><td>${a}</td><td>${cell(null)}</td><td>${r1}</td></tr>` +
      `<tr><th>${rows[1]}</th><td>${c}</td><td>${d}</td><td>${r2}</td></tr>` +
      `<tr><th>Total</th><td>${c1}</td><td>${c2}</td><td>${all}</td></tr></tbody></table>`;
    return {
      subject: 'graphs', given: `Two-way table — find the missing value (?)`, sig: `tw:${a},${b},${c},${d}`, diagram: tbl, answer: String(b),
      steps: [
        pickStep({ key: 'which', prompt: `Which row or column gives you the ? in one step?`,
          hint: `The "${rows[0]}" row: ${a} + ? = ${r1}. (The "${cols[1]}" column works too.)`,
          why: `In a two-way table every row and every column must add to its Total. Find a line with only ONE gap in it — that is the one you can solve.`,
          resultText: `use the ${rows[0]} row: ${a} + ? = ${r1}`,
          expected: [`the ${rows[0]} row`],
          pool: shuffle([`the ${rows[0]} row`, `the ${rows[1]} row`, `the ${cols[0]} column`, `the Total row`]),
          diagnose: () => ({ correct: false, id: 'table-line', ctx: { row: rows[0], a, r1 } }) }),
        nStep({ key: 'ans', prompt: `${rows[0]}: ${a} + ? = ${r1}. So ? = ${r1} − ${a} = ?`,
          hint: `${r1} − ${a} = ${b}.`,
          why: `Subtract the entry you know from the row total. Check it down the "${cols[1]}" column too: ${b} + ${d} = ${c2} ✓ — a good table answer works both ways.`,
          longWay: `${rows[0]} row: ${a} + ? = ${r1}\n? = ${r1} − ${a} = ${b}\nCheck ${cols[1]} column: ${b} + ${d} = ${c2} ✓`,
          resultText: `? = ${b}`, answer: b, lo: Math.max(0, b - 15), hi: b + 15, expr: `${r1} − ${a}`, isAnswer: true }),
      ],
    };
  }
  // Pictogram where one symbol stands for several things.
  function pictogram() {
    const per = pick([2, 4, 5, 10]);
    const cats = pick([['Mon', 'Tue', 'Wed'], ['Red', 'Blue', 'Green'], ['Ali', 'Ben', 'Cara']]);
    const syms = cats.map(() => rand(2, 5) + (Math.random() < 0.5 ? 0.5 : 0));
    const vals = syms.map((s) => s * per);
    const i = rand(0, cats.length - 1);
    const rowHtml = cats.map((c, k) => {
      const full = Math.floor(syms[k]), half = syms[k] % 1 !== 0;
      return `<tr><th>${c}</th><td style="letter-spacing:2px">${'⚽'.repeat(full)}${half ? '<span style="opacity:.45">⚽</span>' : ''}</td></tr>`;
    }).join('');
    const tbl = `<table class="wtable"><tbody>${rowHtml}</tbody></table><div style="font-size:.85em;margin-top:6px">Key: ⚽ = ${per} goals &nbsp;(a faded ball is a half symbol)</div>`;
    return {
      subject: 'graphs', given: `Pictogram — how many goals for ${cats[i]}?`, sig: `pg:${cats.join('')}:${syms.join(',')}:${per}`,
      diagram: tbl, answer: String(vals[i]),
      steps: [
        nStep({ key: 'per', prompt: `Read the key first. How many goals does ONE whole ⚽ stand for?`,
          hint: `The key says ⚽ = ${per}.`,
          why: `In a pictogram a symbol almost never means 1. Counting symbols instead of reading the key is the trap this question is built on.`,
          resultText: `one ⚽ = ${per}`, answer: per, pool: uniqSort([1, 2, 4, 5, 10, per]), expr: `the key` }),
        nStep({ key: 'sym', prompt: `${cats[i]} has ${syms[i] % 1 === 0 ? `${syms[i]} whole symbols` : `${Math.floor(syms[i])} whole symbols and a half one`}. Each whole one is ${per}, so ${Math.floor(syms[i])} × ${per} = ?`,
          hint: `${Math.floor(syms[i])} × ${per} = ${Math.floor(syms[i]) * per}.`,
          why: `Deal with the whole symbols first, then add the part symbol.`,
          resultText: `whole symbols = ${Math.floor(syms[i]) * per}`, answer: Math.floor(syms[i]) * per,
          lo: 0, hi: Math.floor(syms[i]) * per + 15, expr: `${Math.floor(syms[i])} × ${per}`, isAnswer: syms[i] % 1 === 0 }),
      ].concat(syms[i] % 1 === 0 ? [] : [
        nStep({ key: 'half', prompt: `The half symbol is worth half of ${per}: ${per} ÷ 2 = ?`, hint: `${per} ÷ 2 = ${per / 2}.`,
          why: `A half symbol means half the key's value.`, resultText: `half a ⚽ = ${per / 2}`, answer: per / 2, lo: 0, hi: per + 6, expr: `${per} ÷ 2` }),
        nStep({ key: 'tot', prompt: `Add them: ${Math.floor(syms[i]) * per} + ${per / 2} = ?`, hint: `${Math.floor(syms[i]) * per} + ${per / 2} = ${vals[i]}.`,
          why: `Whole symbols plus the part symbol gives the total for ${cats[i]}.`,
          longWay: `Key: ⚽ = ${per}\n${Math.floor(syms[i])} whole = ${Math.floor(syms[i]) * per}\nhalf = ${per / 2}\nTotal = ${vals[i]}`,
          resultText: `${cats[i]} = ${vals[i]}`, answer: vals[i], lo: Math.max(0, vals[i] - 12), hi: vals[i] + 12,
          expr: `${Math.floor(syms[i]) * per} + ${per / 2}`, isAnswer: true }),
      ]),
    };
  }

  const api = {
    angleQuadrilateral, angleIsosceles, angleParallel, anglePolygon,
    compoundArea, parallelogramArea, trapeziumArea, missingSide,
    surfaceArea, missingDimension, prismVolume,
    midpoint,
    shapeProperty, symmetry, PROPS, SYMS,
    barScaled, barMean, twoWayTable, pictogram,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
