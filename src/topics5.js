/* topics5.js — 3D Volume, Coordinates & symmetry, Geometry facts, Data & graphs.
   Diagrams (cuboid, coordinate grid, bar chart) drawn with small inline SVG. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, numberPool = W._numberPool, list = W._list;
  const { parseNumberList, uniqSort } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ===================== 3D VOLUME =====================
  function svgCuboid(l, w, h) {
    return `<svg viewBox="0 0 210 150" width="210" height="150" role="img"><rect x="35" y="55" width="95" height="70" fill="#e8f5ec" stroke="#12324a" stroke-width="3"/><polygon points="35,55 70,25 165,25 130,55" fill="#d0ead9" stroke="#12324a" stroke-width="3"/><polygon points="130,55 165,25 165,95 130,125" fill="#c0dccb" stroke="#12324a" stroke-width="3"/><text x="82" y="142" font-size="14" fill="#12324a" font-weight="700" text-anchor="middle">${l} cm</text><text x="18" y="95" font-size="14" fill="#12324a" font-weight="700">${h}</text><text x="150" y="70" font-size="14" fill="#12324a" font-weight="700">${w}</text></svg>`;
  }
  function cuboidVolume(l, w, h) {
    const base = l * w, vol = base * h;
    return { subject: 'volume', given: `Find the VOLUME of this cuboid`, sig: `cv:${l},${w},${h}`, diagram: svgCuboid(l, w, h), answer: `${vol} cm³`,
      steps: [
        pickStep({ key: 'base', prompt: `Volume of a cuboid = length × width × height. First do length × width: ${l} × ${w} = ?`, hint: `${l} × ${w}.`, why: `Volume fills the box with unit cubes. First find how many fit on the base (length × width), then stack ${h} layers.`,
          resultText: `${l} × ${w} = ${base}`, expected: [base], pool: numberPool([base], 4, 1, base + l + w), diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: base, expr: `${l} × ${w}` } }) }),
        pickStep({ key: 'vol', prompt: `Now × the height: ${base} × ${h} = ?`, hint: `${base} × ${h}.`, why: `There are ${h} layers of ${base} cubes, so multiply by the height.`,
          resultText: `Volume = ${vol} cm³`, expected: [vol, `${vol}`], pool: numberPool([vol], 4, base, vol + base), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: vol, expr: `${base} × ${h}` } }) }),
      ] };
  }
  const SOLIDS = [
    { name: 'cube', faces: 6, edges: 12, vertices: 8 },
    { name: 'cuboid', faces: 6, edges: 12, vertices: 8 },
    { name: 'triangular prism', faces: 5, edges: 9, vertices: 6 },
    { name: 'square-based pyramid', faces: 5, edges: 8, vertices: 5 },
  ];
  function solidCount(solid, what) {
    const val = solid[what];
    return { subject: 'volume', given: `How many ${what.toUpperCase()} does a ${solid.name} have?`, sig: `sc:${solid.name}:${what}`, answer: String(val),
      // You cannot count the faces of a shape you can't see — always draw the solid.
      diagram: (root.WAC.fig ? root.WAC.fig.solid(solid.name) : ''),
      steps: [pickStep({ key: 'count', prompt: `How many ${what} does a ${solid.name} have?`, hint: `A ${solid.name} has ${val} ${what}.`,
        why: `Faces are the flat surfaces, edges are where two faces meet, and vertices are the corners.`, resultText: `${val} ${what}`, expected: [val],
        pool: uniqSort([val, val + 2, val - 2, val + 4].filter((x) => x > 0)), isAnswer: true, diagnose: () => ({ correct: false, id: 'solid-count', ctx: { name: solid.name, what, val } }) })] };
  }

  // ===================== COORDINATES =====================
  function svgGrid(pts) { // pts: [{x,y,color,label}]
    const M = 26, C = 26, N = 6, size = M + N * C + 14;
    let s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`;
    for (let i = 0; i <= N; i++) {
      const p = M + i * C;
      s += `<line x1="${M}" y1="${p}" x2="${M + N * C}" y2="${p}" stroke="#cfe0d6" stroke-width="1"/>`;
      s += `<line x1="${p}" y1="${M}" x2="${p}" y2="${M + N * C}" stroke="#cfe0d6" stroke-width="1"/>`;
      s += `<text x="${p}" y="${M + N * C + 12}" font-size="10" fill="#12324a" text-anchor="middle">${i}</text>`;
      if (i > 0) s += `<text x="${M - 8}" y="${M + N * C - i * C + 4}" font-size="10" fill="#12324a" text-anchor="middle">${i}</text>`;
    }
    s += `<line x1="${M}" y1="${M}" x2="${M}" y2="${M + N * C}" stroke="#12324a" stroke-width="2.5"/>`;
    s += `<line x1="${M}" y1="${M + N * C}" x2="${M + N * C}" y2="${M + N * C}" stroke="#12324a" stroke-width="2.5"/>`;
    pts.forEach((p) => { const sx = M + p.x * C, sy = M + N * C - p.y * C; s += `<circle cx="${sx}" cy="${sy}" r="5" fill="${p.color || '#c0392b'}"/>`; if (p.label) s += `<text x="${sx + 8}" y="${sy - 6}" font-size="11" fill="${p.color || '#c0392b'}" font-weight="700">${p.label}</text>`; });
    return s + `</svg>`;
  }
  function readCoordinate(x, y) {
    return { subject: 'coords', given: `Write the coordinates of the point`, sig: `rc:${x},${y}`, diagram: svgGrid([{ x, y }]), answer: `(${x}, ${y})`,
      steps: [buildStep({ key: 'coord', prompt: `Read the point's coordinates and build them: ( x , y ). Across first, then up.`,
        hint: `Go along ${x}, then up ${y}: (${x}, ${y}).`, why: `Coordinates are (across, up) — always read the x (across) first, then the y (up).`,
        longWay: `Along ${x}, up ${y} → (${x}, ${y})`, resultText: `(${x}, ${y})`, pieces: ['(', String(x), ',', String(y), ')'], distractors: [String(y), String(x + 1), String(y + 1)], isAnswer: true,
        check: (raw) => { const p = parseNumberList(raw); if (p.length < 2) return { correct: false, id: 'coord-form', ctx: { x, y } }; if (p[0] === x && p[1] === y) return { correct: true }; if (p[0] === y && p[1] === x) return { correct: false, id: 'coord-swap', ctx: { x, y } }; return { correct: false, id: 'coord-form', ctx: { x, y } }; } })] };
  }
  function reflectPoint(x, y, axis) {
    const rx = axis === 'y' ? -x : x, ry = axis === 'x' ? -y : y;
    // keep points on a 0..6 grid by reflecting within visible quadrant is hard with negatives;
    // use a small grid but describe reflection in the given axis with signed answer.
    const nx = axis === 'y' ? x : x, ny = axis === 'x' ? y : y;
    return { subject: 'coords', given: `Reflect the point (${x}, ${y}) in the ${axis}-axis`, sig: `rp:${x},${y},${axis}`, diagram: svgGrid([{ x, y, color: '#0a7d34', label: `(${x},${y})` }]), answer: `(${rx}, ${ry})`,
      steps: [
        pickStep({ key: 'which', prompt: `Reflecting in the ${axis}-axis: which coordinate changes sign?`, hint: `In the ${axis}-axis, the ${axis === 'x' ? 'y (up/down)' : 'x (across)'} flips.`,
          why: `Reflecting in the x-axis flips the y-coordinate's sign; reflecting in the y-axis flips the x-coordinate's sign.`,
          resultText: `the ${axis === 'x' ? 'y' : 'x'} flips`, expected: [axis === 'x' ? 'the y' : 'the x'], pool: ['the x', 'the y'],
          diagnose: () => ({ correct: false, id: 'reflect-which', ctx: { axis } }) }),
        buildStep({ key: 'coord', prompt: `Write the reflected coordinates: ( x , y ).`, hint: `(${rx}, ${ry}).`, why: `Keep the other coordinate the same and flip the sign of the one on the ${axis}-axis.`,
          longWay: `(${x}, ${y}) reflected in the ${axis}-axis → (${rx}, ${ry})`, resultText: `(${rx}, ${ry})`,
          pieces: ['(', String(rx), ',', String(ry), ')'], distractors: [String(x), String(y), String(-rx)], isAnswer: true,
          check: (raw) => { const p = parseNumberList(raw.replace(/[−–—]/g, '-')); if (p.length < 2) return { correct: false, id: 'coord-form', ctx: { x: rx, y: ry } }; if (p[0] === rx && p[1] === ry) return { correct: true }; return { correct: false, id: 'coord-form', ctx: { x: rx, y: ry } }; } }),
      ] };
  }

  // ===================== GEOMETRY FACTS =====================
  const FACTS = [
    { q: 'How many sides does a hexagon have?', a: 6, opts: [5, 6, 7, 8], why: 'Hexa- means six.' },
    { q: 'How many sides does a pentagon have?', a: 5, opts: [4, 5, 6, 8], why: 'Penta- means five.' },
    { q: 'How many sides does an octagon have?', a: 8, opts: [6, 7, 8, 10], why: 'Octa- means eight (like octopus).' },
    { q: 'How many sides does a quadrilateral have?', a: 4, opts: [3, 4, 5, 6], why: 'Quad- means four.' },
    { q: 'How many right angles does a rectangle have?', a: 4, opts: [2, 3, 4, 6], shape: 'rectangle', why: 'Every corner of a rectangle is a right angle.' },
    { q: 'The angles in a triangle add up to?', a: 180, opts: [90, 180, 270, 360], shape: 'scalene triangle', why: 'The three angles in any triangle total 180°.' },
    { q: 'The angles in a quadrilateral add up to?', a: 360, opts: [180, 270, 360, 540], shape: 'trapezium', why: 'A quadrilateral splits into two triangles: 2 × 180 = 360°.' },
    { q: 'How many lines of symmetry does a square have?', a: 4, opts: [2, 3, 4, 8], shape: 'square', why: 'Two diagonals plus the two lines through the middle.' },
    { q: 'How many equal sides does an equilateral triangle have?', a: 3, opts: [1, 2, 3, 0], why: 'Equilateral means all three sides equal.' },
  ];
  function geometryFact(fact) {
    return { subject: 'geometry', given: fact.q, sig: 'gf:' + fact.q, answer: String(fact.a),
      // Only where the picture helps you REASON. "How many sides has a hexagon?"
      // is deliberately left undrawn — a hexagon on screen just is the answer.
      diagram: (fact.shape && root.WAC.fig ? root.WAC.fig.shape(fact.shape, { size: 120 }) : undefined),
      steps: [pickStep({ key: 'fact', prompt: fact.q, hint: fact.why, why: fact.why, resultText: `answer: ${fact.a}`, expected: [fact.a], pool: fact.opts, isAnswer: true,
        diagnose: () => ({ correct: false, id: 'geom-fact', ctx: { a: fact.a, why: fact.why } }) })] };
  }

  // ===================== DATA & GRAPHS =====================
  function svgBars(cats, vals) {
    const M = 30, BW = 34, GAP = 16, H = 130, maxV = Math.max(...vals, 5), scale = (H - 20) / maxV;
    let s = `<svg viewBox="0 0 ${M + cats.length * (BW + GAP) + 10} ${H + 30}" width="${M + cats.length * (BW + GAP) + 10}" height="${H + 30}" role="img">`;
    for (let g = 1; g <= maxV; g++) { const y = H - g * scale; s += `<line x1="${M}" y1="${y}" x2="${M + cats.length * (BW + GAP)}" y2="${y}" stroke="#eef" stroke-width="1"/><text x="${M - 6}" y="${y + 3}" font-size="9" fill="#12324a" text-anchor="end">${g}</text>`; }
    s += `<line x1="${M}" y1="${H}" x2="${M + cats.length * (BW + GAP)}" y2="${H}" stroke="#12324a" stroke-width="2"/><line x1="${M}" y1="10" x2="${M}" y2="${H}" stroke="#12324a" stroke-width="2"/>`;
    cats.forEach((c, i) => { const x = M + 8 + i * (BW + GAP), bh = vals[i] * scale; s += `<rect x="${x}" y="${H - bh}" width="${BW}" height="${bh}" fill="#1f9d55" stroke="#12324a" stroke-width="1.5"/><text x="${x + BW / 2}" y="${H + 14}" font-size="10" fill="#12324a" text-anchor="middle" font-weight="700">${c}</text>`; });
    return s + `</svg>`;
  }
  function barRead(cats, vals) {
    const i = rand(0, cats.length - 1);
    return { subject: 'graphs', given: `Read the bar chart: how many for ${cats[i]}?`, sig: `br:${cats.join('')}:${i}:${vals.join('')}`, diagram: svgBars(cats, vals), answer: String(vals[i]),
      steps: [pickStep({ key: 'read', prompt: `Look at the bar for ${cats[i]} — how tall is it?`, hint: `Read across from the top of the ${cats[i]} bar to the scale: ${vals[i]}.`,
        why: `To read a bar chart, find the bar, then read straight across to the number on the side scale.`, resultText: `${cats[i]} = ${vals[i]}`, expected: [vals[i]], pool: uniqSort([...vals, vals[i] + 1]), isAnswer: true,
        diagnose: () => ({ correct: false, id: 'bar-read', ctx: { cat: cats[i], v: vals[i] } }) })] };
  }
  function barDiff(cats, vals) {
    let i = 0, j = 1; for (let a = 0; a < vals.length; a++) for (let b = 0; b < vals.length; b++) if (vals[a] > vals[b] && (vals[a] - vals[b]) >= 2) { i = a; j = b; }
    const d = vals[i] - vals[j];
    return { subject: 'graphs', given: `Bar chart: how many MORE ${cats[i]} than ${cats[j]}?`, sig: `bd:${cats.join('')}:${i}${j}:${vals.join('')}`, diagram: svgBars(cats, vals), answer: String(d),
      steps: [
        pickStep({ key: 'a', prompt: `How many ${cats[i]}?`, hint: `Read the ${cats[i]} bar: ${vals[i]}.`, why: `First read the taller bar.`, resultText: `${cats[i]} = ${vals[i]}`, expected: [vals[i]], pool: uniqSort([...vals]), diagnose: () => ({ correct: false, id: 'bar-read', ctx: { cat: cats[i], v: vals[i] } }) }),
        pickStep({ key: 'b', prompt: `How many ${cats[j]}?`, hint: `Read the ${cats[j]} bar: ${vals[j]}.`, why: `Now read the shorter bar.`, resultText: `${cats[j]} = ${vals[j]}`, expected: [vals[j]], pool: uniqSort([...vals]), diagnose: () => ({ correct: false, id: 'bar-read', ctx: { cat: cats[j], v: vals[j] } }) }),
        pickStep({ key: 'diff', prompt: `So how many more? ${vals[i]} − ${vals[j]} = ?`, hint: `${vals[i]} − ${vals[j]}.`, why: `"How many more" means subtract the smaller from the bigger.`, resultText: `${d} more`, expected: [d], pool: numberPool([d], 4, 0, d + 6), isAnswer: true, diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: d, expr: `${vals[i]} − ${vals[j]}` } }) }),
      ] };
  }

  const api = {
    cuboidVolume, solidCount, SOLIDS,
    readCoordinate, reflectPoint,
    geometryFact, FACTS,
    barRead, barDiff,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
