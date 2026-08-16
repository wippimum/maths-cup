/* curriculum2.js — Toddle objectives the app had no question for (shape & data).
     T10 · Classify angles (acute, obtuse, reflex, right) and estimate their size
     T10 · Vertically opposite angles
     T16 · Name polygons; regular vs irregular
     T16 · Circle vocabulary: centre, radius, chord, diameter, circumference, tangent, arc, sector, segment
     T17 · Identify 3D shapes; construct nets of common solids
     T14 · Pictograms, bar charts, PIE CHARTS, LINE GRAPHS, frequency tables, VENN DIAGRAMS
     T13 · Compare two data sets using their mean and range */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, numberPool = W._numberPool, shuffle = W._shuffle, list = W._list;
  const { uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const INK = '#12324a', FILL = '#e8f5ec', RED = '#c0392b', GREEN = '#0a7d34';

  function nStep(o) {
    const a = o.answer;
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [a], isAnswer: !!o.isAnswer,
      pool: o.pool || numberPool([a], 4, o.lo != null ? o.lo : a - 12, o.hi != null ? o.hi : a + 12),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: a, expr: o.expr } }),
    });
  }
  function sStep(o) {
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [o.answer], pool: o.pool, isAnswer: !!o.isAnswer,
      diagnose: () => ({ correct: false, id: 'shape-name', ctx: { answer: o.answer, why: o.why } }),
    });
  }

  // ============================================================ T10 · classify an angle
  function svgAngle(deg) {
    const cx = 110, cy = 108, r = 74;
    const a = (-deg * Math.PI) / 180;
    const x2 = cx + r * Math.cos(a), y2 = cy + r * Math.sin(a);
    const big = deg > 180 ? 1 : 0;
    const ar = 26;
    const arc = `M ${cx + ar} ${cy} A ${ar} ${ar} 0 ${big} 0 ${cx + ar * Math.cos(a)} ${cy + ar * Math.sin(a)}`;
    return `<svg viewBox="0 0 235 150" width="235" height="150" role="img">` +
      `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="3"/>` +
      `<path d="${arc}" fill="none" stroke="${RED}" stroke-width="2.5"/>` +
      `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}"/></svg>`;
  }
  const CLASSES = [
    { name: 'acute', lo: 10, hi: 88, why: 'An acute angle is SMALLER than a right angle — less than 90°. Think "a cute little angle".' },
    { name: 'right', lo: 90, hi: 90, why: 'A right angle is exactly 90° — the corner of a square or a piece of paper.' },
    { name: 'obtuse', lo: 95, hi: 175, why: 'An obtuse angle is bigger than a right angle but less than a straight line: between 90° and 180°.' },
    { name: 'reflex', lo: 190, hi: 340, why: 'A reflex angle is bigger than a straight line — more than 180°. It is the one that goes "the long way round".' },
  ];
  function classifyAngle() {
    const c = pick(CLASSES);
    const deg = c.lo === c.hi ? c.lo : rand(c.lo, c.hi);
    return {
      subject: 'angles', sig: `cls:${deg}`, given: `What TYPE of angle is this?`, diagram: svgAngle(deg), answer: c.name,
      steps: [
        sStep({ key: 'type', prompt: `Is this angle acute, right, obtuse or reflex?`,
          hint: `It measures about ${deg}°, so it is ${c.name}.`,
          why: `${c.why} Compare it with a right angle (a square corner) and with a straight line (180°) — that is enough to name any angle without measuring.`,
          resultText: `${c.name} (about ${deg}°)`, answer: c.name, pool: shuffle(CLASSES.map((x) => x.name)) }),
        nStep({ key: 'est', prompt: `Now estimate its size. Which of these is closest?`,
          hint: `It is about ${deg}°.`,
          why: `Estimating angles is a real skill: a right angle is 90°, half a right angle is 45°, a straight line is 180°, and a full turn is 360°. Judge against those.`,
          resultText: `about ${deg}°`, answer: deg,
          pool: uniqSort([deg, Math.max(5, deg - rand(35, 60)), Math.min(355, deg + rand(35, 60)), 360 - deg].filter((v) => v > 0 && v < 360)),
          expr: `the size of the angle`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ T10 · vertically opposite angles
  function svgCross(a) {
    return `<svg viewBox="0 0 240 155" width="240" height="155" role="img">` +
      `<line x1="20" y1="130" x2="220" y2="30" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="30" y1="35" x2="215" y2="130" stroke="${INK}" stroke-width="3"/>` +
      `<text x="112" y="42" font-size="14" fill="${GREEN}" font-weight="700">${a}°</text>` +
      `<text x="112" y="134" font-size="14" fill="${RED}" font-weight="700">x°</text></svg>`;
  }
  function verticallyOpposite() {
    const a = rand(35, 145);
    return {
      subject: 'angles', sig: `vo:${a}`, given: `Two straight lines cross. Find x`, diagram: svgCross(a), answer: `${a}°`,
      steps: [
        sStep({ key: 'rel', prompt: `x and ${a}° are on opposite sides of where the lines cross. What is that pair called?`,
          hint: `They are vertically opposite angles.`,
          why: `When two straight lines cross they make two pairs of angles facing each other across the crossing point. These are called VERTICALLY OPPOSITE angles, and they are always equal.`,
          resultText: `vertically opposite angles`, answer: 'vertically opposite',
          pool: shuffle(['vertically opposite', 'angles on a line', 'alternate', 'corresponding']) }),
        nStep({ key: 'x', prompt: `Vertically opposite angles are equal. So x = ?`, hint: `x = ${a}°.`,
          why: `You can prove it: ${a}° and the angle next to it make a straight line (180°), and x and that same angle also make a straight line — so x must equal ${a}°.`,
          longWay: `${a}° and x are vertically opposite\nVertically opposite angles are equal\nx = ${a}°`,
          resultText: `x = ${a}°`, answer: a, pool: uniqSort([a, 180 - a, 90, 360 - a].filter((v) => v > 0)),
          expr: `the same as ${a}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ T16 · circle vocabulary
  function svgCircle(part) {
    const cx = 105, cy = 78, r = 62;
    let extra = '';
    if (part === 'radius') extra = `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${RED}" stroke-width="4"/>`;
    if (part === 'diameter') extra = `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${RED}" stroke-width="4"/>`;
    if (part === 'chord') extra = `<line x1="${cx - 44}" y1="${cy + 44}" x2="${cx + 55}" y2="${cy - 29}" stroke="${RED}" stroke-width="4"/>`;
    if (part === 'circumference') extra = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${RED}" stroke-width="5"/>`;
    if (part === 'centre') extra = `<circle cx="${cx}" cy="${cy}" r="6" fill="${RED}"/>`;
    if (part === 'tangent') extra = `<line x1="${cx - 70}" y1="${cy - r}" x2="${cx + 70}" y2="${cy - r}" stroke="${RED}" stroke-width="4"/>`;
    if (part === 'arc') extra = `<path d="M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy - r}" fill="none" stroke="${RED}" stroke-width="5"/>`;
    if (part === 'sector') extra = `<path d="M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy - r} Z" fill="#f6c9c2" stroke="${RED}" stroke-width="3"/>`;
    if (part === 'segment') extra = `<path d="M ${cx - 44} ${cy - 44} A ${r} ${r} 0 0 1 ${cx + 44} ${cy - 44} Z" fill="#f6c9c2" stroke="${RED}" stroke-width="3"/>`;
    return `<svg viewBox="0 0 215 160" width="215" height="160" role="img">` +
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>${extra}</svg>`;
  }
  const CIRCLE_PARTS = [
    { name: 'radius', why: 'The radius runs from the centre to the edge. It is always half the diameter.' },
    { name: 'diameter', why: 'The diameter goes all the way across, THROUGH the centre. It is twice the radius.' },
    { name: 'chord', why: 'A chord joins two points on the edge but does NOT pass through the centre. A diameter is just the longest possible chord.' },
    { name: 'circumference', why: 'The circumference is the whole distance around the outside of the circle — its perimeter.' },
    { name: 'centre', why: 'The centre is the exact middle, the same distance from every point on the edge.' },
    { name: 'tangent', why: 'A tangent is a straight line that just touches the circle at one single point without crossing into it.' },
    { name: 'arc', why: 'An arc is a PART of the circumference — a piece of the curved edge.' },
    { name: 'sector', why: 'A sector is a slice of pizza: two radii and the arc between them.' },
    { name: 'segment', why: 'A segment is the piece cut off by a chord — the part between a straight cut and the edge.' },
  ];
  function circlePart() {
    const p = pick(CIRCLE_PARTS);
    const others = shuffle(CIRCLE_PARTS.filter((x) => x.name !== p.name)).slice(0, 3).map((x) => x.name);
    return {
      subject: 'geometry', sig: `cp:${p.name}`, given: `What is the RED part of this circle called?`,
      diagram: svgCircle(p.name), answer: p.name,
      steps: [sStep({ key: 'part', prompt: `Name the part shown in red.`, hint: p.why, why: p.why,
        resultText: p.name, answer: p.name, pool: shuffle([p.name, ...others]), isAnswer: true })],
    };
  }

  // ============================================================ T16 · polygons, regular vs irregular
  const POLY_N = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon' };
  function namePolygon() {
    const n = Number(pick(Object.keys(POLY_N)));
    const regular = Math.random() < 0.5;
    const pts = W.fig.regularPts(n).map(([x, y]) => (regular ? [x, y] : [x + rand(-9, 9), y + rand(-9, 9)]));
    const S = 140, pad = 12, sc = (v) => pad + (v / 100) * S;
    const poly = pts.map(([x, y]) => `${sc(x)},${sc(y)}`).join(' ');
    const diagram = `<svg viewBox="0 0 ${S + pad * 2} ${S + pad * 2}" width="${S + pad * 2}" height="${S + pad * 2}" role="img">` +
      `<polygon points="${poly}" fill="${FILL}" stroke="${INK}" stroke-width="3"/></svg>`;
    const askRegular = Math.random() < 0.4;
    if (askRegular) {
      return {
        subject: 'geometry', sig: `pg:${n}:${regular ? 'r' : 'i'}:reg`, given: `Is this polygon regular or irregular?`, diagram,
        answer: regular ? 'regular' : 'irregular',
        steps: [sStep({ key: 'reg', prompt: `Regular or irregular?`,
          hint: regular ? `All its sides and angles look equal, so it is regular.` : `Its sides and angles are not all equal, so it is irregular.`,
          why: `A REGULAR polygon has all sides the same length AND all angles the same size. If either one varies, it is irregular. A rectangle, for instance, is irregular — equal angles, but not equal sides.`,
          resultText: regular ? 'regular' : 'irregular', answer: regular ? 'regular' : 'irregular',
          pool: shuffle(['regular', 'irregular']), isAnswer: true })],
      };
    }
    const names = shuffle([...new Set([POLY_N[n], POLY_N[Math.max(3, n - 1)], POLY_N[Math.min(10, n + 1)], POLY_N[n === 8 ? 5 : 8]])]).slice(0, 4);
    return {
      subject: 'geometry', sig: `pg:${n}:${regular ? 'r' : 'i'}:name`, given: `What is this shape called?`, diagram,
      answer: POLY_N[n],
      steps: [
        nStep({ key: 'sides', prompt: `Count the sides first. How many are there?`, hint: `${n} sides.`,
          why: `A polygon is named by its number of sides, so counting carefully comes first. Go round the outline once and count each straight edge.`,
          resultText: `${n} sides`, answer: n, pool: uniqSort([n, n + 1, n - 1, n + 2]), expr: `the number of sides` }),
        sStep({ key: 'name', prompt: `And a polygon with ${n} sides is called a…?`, hint: `A ${POLY_N[n]}.`,
          why: `${n} sides = ${POLY_N[n]}. The prefixes come from Greek: penta 5, hexa 6, hepta 7, octa 8 (like an octopus), nona 9, deca 10.`,
          resultText: POLY_N[n], answer: POLY_N[n], pool: names, isAnswer: true }),
      ],
    };
  }

  // ============================================================ T17 · name the solid, and nets
  const SOLID_FACTS = {
    cube: 'All six faces are identical squares.',
    cuboid: 'A box shape: six rectangular faces, opposite ones matching.',
    'triangular prism': 'Two triangular ends with rectangles joining them — the same shape all the way through.',
    'square-based pyramid': 'A square base with four triangles meeting at a point on top.',
    cylinder: 'Two circular ends joined by one curved surface — like a tin.',
    cone: 'One circular base rising to a single point.',
    sphere: 'Perfectly round, like a football — every point the same distance from the centre.',
  };
  function nameSolid() {
    const names = Object.keys(SOLID_FACTS);
    const n = pick(names);
    const others = shuffle(names.filter((x) => x !== n)).slice(0, 3);
    return {
      subject: 'volume', sig: `ns:${n}`, given: `What is this 3D shape called?`, diagram: W.fig.solid(n), answer: n,
      steps: [sStep({ key: 'name', prompt: `Name this solid.`, hint: SOLID_FACTS[n], why: SOLID_FACTS[n],
        resultText: n, answer: n, pool: shuffle([n, ...others]), isAnswer: true })],
    };
  }
  // Nets. Each is drawn on a small square grid, then folded up in your head.
  function svgNet(kind) {
    const u = 30, ox = 14, oy = 12;
    const sq = (cx, cy) => `<rect x="${ox + cx * u}" y="${oy + cy * u}" width="${u}" height="${u}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`;
    const tri = (cx, cy, up) => {
      const x = ox + cx * u, y = oy + cy * u;
      return up ? `<polygon points="${x},${y + u} ${x + u},${y + u} ${x + u / 2},${y}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`
        : `<polygon points="${x},${y} ${x + u},${y} ${x + u / 2},${y + u}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`;
    };
    const circ = (cx, cy) => `<circle cx="${ox + cx * u + u / 2}" cy="${oy + cy * u + u / 2}" r="${u / 2}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`;
    let body = '', w = 5, h = 4;
    if (kind === 'cube') { body = sq(1, 0) + sq(0, 1) + sq(1, 1) + sq(2, 1) + sq(3, 1) + sq(1, 2); w = 5; h = 3; }
    if (kind === 'cuboid') { body = sq(1, 0) + sq(0, 1) + sq(1, 1) + sq(2, 1) + sq(3, 1) + sq(1, 2); w = 5; h = 3; }
    if (kind === 'square-based pyramid') { body = sq(1, 1) + tri(1, 0, true) + tri(1, 2, false) + `<polygon points="${ox + u},${oy + u} ${ox + u},${oy + 2 * u} ${ox},${oy + 1.5 * u}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>` + `<polygon points="${ox + 2 * u},${oy + u} ${ox + 2 * u},${oy + 2 * u} ${ox + 3 * u},${oy + 1.5 * u}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`; w = 4; h = 3; }
    if (kind === 'triangular prism') { body = sq(0, 1) + sq(1, 1) + sq(2, 1) + tri(1, 0, true) + tri(1, 2, false); w = 4; h = 3; }
    if (kind === 'cylinder') { body = circ(1, 0) + `<rect x="${ox + u}" y="${oy + u}" width="${2.2 * u}" height="${u}" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>` + circ(1, 2); w = 4; h = 3; }
    return `<svg viewBox="0 0 ${ox * 2 + w * u} ${oy * 2 + h * u}" width="${ox * 2 + w * u}" height="${oy * 2 + h * u}" role="img">${body}</svg>`;
  }
  const NET_HINTS = {
    cube: 'Six identical squares — fold the four in a row into a ring, then the top and bottom close it.',
    'square-based pyramid': 'One square with a triangle on each of its four sides: the triangles fold up to meet at a point.',
    'triangular prism': 'Three rectangles in a row with a triangle at each end — the triangles become the two ends.',
    cylinder: 'Two circles and one rectangle: the rectangle rolls into a tube and the circles cap it.',
  };
  function netOfSolid() {
    const kind = pick(['cube', 'square-based pyramid', 'triangular prism', 'cylinder']);
    const others = shuffle(Object.keys(NET_HINTS).filter((k) => k !== kind)).slice(0, 3);
    return {
      subject: 'volume', sig: `net:${kind}`, given: `This NET is folded up. Which solid does it make?`,
      diagram: svgNet(kind), answer: kind,
      steps: [sStep({ key: 'net', prompt: `Fold it up in your head — which 3D shape do you get?`,
        hint: NET_HINTS[kind], why: `A net is the solid opened out flat. Count the faces and look at their shapes: ${NET_HINTS[kind].charAt(0).toLowerCase() + NET_HINTS[kind].slice(1)}`,
        resultText: kind, answer: kind, pool: shuffle([kind, ...others]), isAnswer: true })],
    };
  }

  // ============================================================ T14 · pie charts
  const PIE_COLOURS = ['#1f9d55', '#f4c430', '#c0392b', '#2b6cb0'];
  function svgPie(labels, parts, total) {
    const cx = 92, cy = 92, r = 78;
    let ang = -90, body = '';
    parts.forEach((p, i) => {
      const sweep = (p / total) * 360;
      const a0 = (ang * Math.PI) / 180, a1 = ((ang + sweep) * Math.PI) / 180;
      const big = sweep > 180 ? 1 : 0;
      body += `<path d="M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="${PIE_COLOURS[i % 4]}" stroke="#fff" stroke-width="2"/>`;
      ang += sweep;
    });
    const key = labels.map((l, i) => `<span style="white-space:nowrap"><span style="display:inline-block;width:11px;height:11px;background:${PIE_COLOURS[i % 4]};border-radius:2px"></span> ${l}</span>`).join(' &nbsp; ');
    return `<svg viewBox="0 0 184 184" width="184" height="184" role="img">${body}</svg>` +
      `<div style="font-size:.8rem;margin-top:4px">${key}</div>`;
  }
  function pieChart() {
    // fractions of a circle a child can read off: halves, quarters, eighths, thirds by eye
    const shape = pick([[1, 1, 2], [1, 3], [1, 1, 1, 1], [2, 1, 1], [3, 1], [1, 2, 1]]);
    const totalParts = shape.reduce((a, b) => a + b, 0);
    const per = pick([4, 6, 8, 10, 12]);
    const total = totalParts * per;
    const counts = shape.map((s) => s * per);
    const labels = shuffle(['Football', 'Tennis', 'Swimming', 'Cricket']).slice(0, shape.length);
    const i = rand(0, shape.length - 1);
    const frac = shape[i] === totalParts ? '1' : `${shape[i]}/${totalParts}`;
    return {
      subject: 'graphs', sig: `pie:${shape.join('')}:${per}:${i}`,
      given: `${total} pupils chose a favourite sport. How many chose ${labels[i]}?`,
      diagram: svgPie(labels, shape, totalParts), answer: String(counts[i]),
      steps: [
        sStep({ key: 'frac', prompt: `What FRACTION of the pie is the ${labels[i]} slice?`,
          hint: `It is ${frac} of the circle.`,
          why: `A pie chart shows proportions, not amounts. Compare the slice with the whole circle: half, a quarter, a third and so on. Here the ${labels[i]} slice is ${frac} of it.`,
          resultText: `${frac} of the pupils`, answer: frac,
          pool: shuffle([...new Set([frac, `${shape[i]}/${totalParts + 1}`, `1/${totalParts}`, `${totalParts}/${shape[i]}`])]) }),
        nStep({ key: 'num', prompt: `So how many of the ${total} pupils is that? ${frac} of ${total} = ?`,
          hint: `${total} ÷ ${totalParts} = ${per}${shape[i] > 1 ? `, then × ${shape[i]} = ${counts[i]}` : ''}.`,
          why: `Turn the fraction into a number of people: divide the total by the bottom, then multiply by the top.`,
          longWay: `${labels[i]} is ${frac} of the circle\n${total} ÷ ${totalParts} = ${per}\n${per} × ${shape[i]} = ${counts[i]}`,
          resultText: `${counts[i]} pupils`, answer: counts[i], lo: 0, hi: total + 4, expr: `${frac} of ${total}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ T14/T13 · line graphs
  function svgLineGraph(labels, vals, unit) {
    const M = 38, W2 = 44, H = 130;
    const maxV = Math.ceil(Math.max(...vals) / 5) * 5 + 5;
    const scale = (H - 14) / maxV;
    const width = M + labels.length * W2 + 14;
    let s = `<svg viewBox="0 0 ${width} ${H + 32}" width="${width}" height="${H + 32}" role="img">`;
    for (let g = 5; g <= maxV; g += 5) {
      const y = H - g * scale;
      s += `<line x1="${M}" y1="${y}" x2="${M + labels.length * W2}" y2="${y}" stroke="#e3ecf5" stroke-width="1"/>`;
      s += `<text x="${M - 6}" y="${y + 3}" font-size="9" fill="${INK}" text-anchor="end">${g}</text>`;
    }
    s += `<line x1="${M}" y1="${H}" x2="${M + labels.length * W2}" y2="${H}" stroke="${INK}" stroke-width="2"/>`;
    s += `<line x1="${M}" y1="6" x2="${M}" y2="${H}" stroke="${INK}" stroke-width="2"/>`;
    const pts = vals.map((v, i) => [M + 18 + i * W2, H - v * scale]);
    s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${RED}" stroke-width="2.5"/>`;
    pts.forEach((p) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${RED}"/>`; });
    labels.forEach((l, i) => { s += `<text x="${M + 18 + i * W2}" y="${H + 15}" font-size="10" fill="${INK}" text-anchor="middle" font-weight="700">${l}</text>`; });
    s += `<text x="${M - 6}" y="${H + 15}" font-size="9" fill="${INK}" text-anchor="end">0</text>`;
    return s + `</svg>` + (unit ? `<div style="font-size:.78rem;margin-top:2px">${unit}</div>` : '');
  }
  function lineGraph() {
    const labels = pick([['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Jan', 'Feb', 'Mar', 'Apr', 'May'], ['W1', 'W2', 'W3', 'W4', 'W5']]);
    const vals = labels.map(() => rand(5, 35));
    const ask = pick(['read', 'rise', 'diff']);
    if (ask === 'read') {
      const i = rand(0, labels.length - 1);
      return {
        subject: 'graphs', sig: `lg:r:${vals.join(',')}:${i}`, given: `Line graph — what was the value on ${labels[i]}?`,
        diagram: svgLineGraph(labels, vals, 'temperature (°C)'), answer: String(vals[i]),
        steps: [nStep({ key: 'read', prompt: `Find ${labels[i]} along the bottom, go up to the line, then read across. What is it?`,
          hint: `${vals[i]}.`,
          why: `A line graph joins the points so you can see the trend, but you read a single value exactly like a bar chart: up from the label, then straight across to the scale.`,
          resultText: `${labels[i]} = ${vals[i]}`, answer: vals[i], pool: uniqSort([...vals, vals[i] + 5]),
          expr: `the value at ${labels[i]}`, isAnswer: true })],
      };
    }
    // biggest rise between two neighbouring points
    let bi = 0, bd = -Infinity;
    for (let i = 1; i < vals.length; i++) { const d = vals[i] - vals[i - 1]; if (d > bd) { bd = d; bi = i; } }
    if (bd <= 0) return lineGraph();
    return {
      subject: 'graphs', sig: `lg:u:${vals.join(',')}`, given: `Line graph — between which two points did it rise the MOST?`,
      diagram: svgLineGraph(labels, vals, 'temperature (°C)'), answer: `${labels[bi - 1]} to ${labels[bi]}`,
      steps: [
        sStep({ key: 'where', prompt: `Look for the steepest section going UPWARDS. Where is it?`,
          hint: `From ${labels[bi - 1]} to ${labels[bi]}.`,
          why: `On a line graph, how STEEP the line is shows how fast something changed. The steepest upward section is the biggest rise — you can spot it by eye before doing any arithmetic.`,
          resultText: `${labels[bi - 1]} to ${labels[bi]}`, answer: `${labels[bi - 1]} to ${labels[bi]}`,
          pool: shuffle(labels.slice(1).map((l, i) => `${labels[i]} to ${l}`)) }),
        nStep({ key: 'by', prompt: `By how much did it rise? ${vals[bi]} − ${vals[bi - 1]} = ?`,
          hint: `${vals[bi]} − ${vals[bi - 1]} = ${bd}.`,
          why: `Read both points off the scale and subtract.`,
          longWay: `${labels[bi - 1]} = ${vals[bi - 1]}\n${labels[bi]} = ${vals[bi]}\nRise = ${vals[bi]} − ${vals[bi - 1]} = ${bd}`,
          resultText: `a rise of ${bd}`, answer: bd, lo: 0, hi: bd + 12, expr: `${vals[bi]} − ${vals[bi - 1]}`, isAnswer: true }),
      ],
    };
  }

  // ============================================================ T14 · frequency tables
  function frequencyTable() {
    const cats = pick([['0', '1', '2', '3', '4'], ['1', '2', '3', '4', '5']]);
    const freq = cats.map(() => rand(1, 9));
    const total = freq.reduce((a, b) => a + b, 0);
    let mi = 0; freq.forEach((f, i) => { if (f > freq[mi]) mi = i; });
    if (freq.filter((f) => f === freq[mi]).length > 1) return frequencyTable();
    const rows = cats.map((c, i) => `<tr><td>${c}</td><td>${freq[i]}</td></tr>`).join('');
    const tbl = `<table class="wtable"><thead><tr><th>Goals scored</th><th>Frequency</th></tr></thead><tbody>${rows}</tbody></table>`;
    const askTotal = Math.random() < 0.5;
    if (askTotal) {
      return {
        subject: 'graphs', sig: `ft:t:${freq.join(',')}`, given: `Frequency table — how many matches ALTOGETHER?`,
        diagram: tbl, answer: String(total),
        steps: [nStep({ key: 'tot', prompt: `Add up the frequency column: ${freq.join(' + ')} = ?`,
          hint: `${freq.join(' + ')} = ${total}.`,
          why: `The frequency column counts how many times each result happened, so adding it up gives the total number of matches. The left column is the SCORE, not a count — adding that instead is the usual mistake.`,
          resultText: `${total} matches`, answer: total, lo: 0, hi: total + 12, expr: freq.join(' + '), isAnswer: true })],
      };
    }
    return {
      subject: 'graphs', sig: `ft:m:${freq.join(',')}`, given: `Frequency table — what was the MOST common number of goals?`,
      diagram: tbl, answer: cats[mi],
      steps: [
        nStep({ key: 'big', prompt: `Which is the biggest number in the Frequency column?`, hint: `${freq[mi]}.`,
          why: `"Most common" means the one that happened most often — the biggest FREQUENCY.`,
          resultText: `the highest frequency is ${freq[mi]}`, answer: freq[mi], pool: uniqSort(freq), expr: `the largest frequency` }),
        sStep({ key: 'which', prompt: `And which number of goals does that row belong to?`, hint: `${cats[mi]} goals.`,
          why: `Read back across to the left column. The answer is the score (${cats[mi]}), not how many times it happened (${freq[mi]}) — swapping those two is the classic slip.`,
          longWay: `Highest frequency = ${freq[mi]}\nThat row is "${cats[mi]} goals"\nSo the most common score is ${cats[mi]}`,
          resultText: `${cats[mi]} goals`, answer: cats[mi], pool: shuffle(cats.slice()), isAnswer: true }),
      ],
    };
  }

  // ============================================================ T14 · Venn diagrams
  function vennDiagram() {
    const [A, B] = pick([['Football', 'Tennis'], ['Cats', 'Dogs'], ['Maths club', 'Art club']]);
    const onlyA = rand(3, 12), both = rand(2, 8), onlyB = rand(3, 12), neither = rand(1, 6);
    const total = onlyA + both + onlyB + neither;
    const diagram = `<svg viewBox="0 0 250 165" width="250" height="165" role="img">` +
      `<rect x="4" y="4" width="242" height="140" fill="none" stroke="${INK}" stroke-width="2"/>` +
      `<circle cx="98" cy="74" r="60" fill="rgba(31,157,85,.20)" stroke="${INK}" stroke-width="2.5"/>` +
      `<circle cx="152" cy="74" r="60" fill="rgba(244,196,48,.28)" stroke="${INK}" stroke-width="2.5"/>` +
      `<text x="60" y="80" font-size="16" fill="${INK}" font-weight="700" text-anchor="middle">${onlyA}</text>` +
      `<text x="125" y="80" font-size="16" fill="${INK}" font-weight="700" text-anchor="middle">${both}</text>` +
      `<text x="190" y="80" font-size="16" fill="${INK}" font-weight="700" text-anchor="middle">${onlyB}</text>` +
      `<text x="228" y="136" font-size="14" fill="${INK}" font-weight="700" text-anchor="middle">${neither}</text>` +
      `<text x="62" y="24" font-size="11" fill="${INK}" font-weight="700" text-anchor="middle">${A}</text>` +
      `<text x="190" y="24" font-size="11" fill="${INK}" font-weight="700" text-anchor="middle">${B}</text></svg>`;
    const ask = pick(['both', 'onlyA', 'total', 'anyA']);
    const spec = {
      both: { q: `How many like BOTH ${A} and ${B}?`, a: both,
        why: `The overlap in the middle is the people who are in BOTH groups. Only that middle number counts here.`,
        hint: `The middle section: ${both}.` },
      onlyA: { q: `How many like ${A} but NOT ${B}?`, a: onlyA,
        why: `"But not" means the part of the ${A} circle OUTSIDE the overlap — the ${both} in the middle also like ${B}, so they don't count.`,
        hint: `The left-hand part only: ${onlyA}.` },
      anyA: { q: `How many like ${A} (including those who like both)?`, a: onlyA + both,
        why: `The WHOLE ${A} circle is ${onlyA} + ${both}. Forgetting to include the overlap is the commonest Venn mistake.`,
        hint: `${onlyA} + ${both} = ${onlyA + both}.` },
      total: { q: `How many people were asked altogether?`, a: total,
        why: `Everything inside the box counts, including the ${neither} in the corner who like neither. Those are easy to miss.`,
        hint: `${onlyA} + ${both} + ${onlyB} + ${neither} = ${total}.` },
    }[ask];
    return {
      subject: 'graphs', sig: `vn:${ask}:${onlyA},${both},${onlyB},${neither}`,
      given: `Venn diagram — ${spec.q}`, diagram, answer: String(spec.a),
      steps: [nStep({ key: 'v', prompt: spec.q, hint: spec.hint, why: spec.why,
        resultText: `${spec.a}`, answer: spec.a, lo: 0, hi: total + 5, expr: spec.q, isAnswer: true })],
    };
  }

  // ============================================================ T13 · compare two data sets
  function compareSets() {
    const names = pick([['Ali', 'Ben'], ['Team A', 'Team B'], ['Class 6M', 'Class 6N']]);
    const mA = rand(5, 20), mB = rand(5, 20);
    const rA = rand(2, 15), rB = rand(2, 15);
    if (mA === mB || rA === rB) return compareSets();
    const better = mA > mB ? 0 : 1;          // higher mean = better on average
    const consistent = rA < rB ? 0 : 1;      // smaller range = more consistent
    const tbl = `<table class="wtable"><thead><tr><th></th><th>Mean</th><th>Range</th></tr></thead><tbody>` +
      `<tr><th>${names[0]}</th><td>${mA}</td><td>${rA}</td></tr>` +
      `<tr><th>${names[1]}</th><td>${mB}</td><td>${rB}</td></tr></tbody></table>`;
    return {
      subject: 'stats', sig: `cmp:${mA},${rA},${mB},${rB}`,
      given: `${names[0]} and ${names[1]} both scored in 10 matches. Compare them.`, diagram: tbl,
      answer: `${names[better]} scores more on average; ${names[consistent]} is more consistent`,
      steps: [
        sStep({ key: 'avg', prompt: `Who scored MORE ON AVERAGE?`,
          hint: `${names[better]} — a mean of ${better === 0 ? mA : mB} beats ${better === 0 ? mB : mA}.`,
          why: `The MEAN tells you the typical score. A bigger mean means better on average — that is the only thing the mean tells you.`,
          resultText: `${names[better]} (mean ${better === 0 ? mA : mB})`, answer: names[better], pool: shuffle(names.slice()) }),
        sStep({ key: 'con', prompt: `And who was MORE CONSISTENT?`,
          hint: `${names[consistent]} — a range of ${consistent === 0 ? rA : rB} is smaller than ${consistent === 0 ? rB : rA}.`,
          why: `The RANGE tells you how spread out the scores are. A SMALLER range means the scores are closer together, so that player is more consistent — more reliable, even if they are not the higher scorer.`,
          longWay: `${names[0]}: mean ${mA}, range ${rA}\n${names[1]}: mean ${mB}, range ${rB}\nHigher mean → ${names[better]} scores more on average\nSmaller range → ${names[consistent]} is more consistent`,
          resultText: `${names[consistent]} (range ${consistent === 0 ? rA : rB})`, answer: names[consistent],
          pool: shuffle(names.slice()), isAnswer: true }),
      ],
    };
  }

  const api = {
    classifyAngle, verticallyOpposite, circlePart, namePolygon,
    nameSolid, netOfSolid, pieChart, lineGraph, frequencyTable, vennDiagram, compareSets,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
