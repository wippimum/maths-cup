/* coords.js — Coordinates, upgraded:
   - answers MUST use ( ) brackets   - four-quadrant grids with negatives
   - reflect points (negative results)   - "complete the figure" (missing corner). */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, buildStep = W._buildStep, numberPool = W._numberPool;
  const { parseNumberList } = (root.WAC || require('./numbers.js'));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const nz = (a, b) => { let v = 0; while (v === 0) v = rand(a, b); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const sgn = (n) => (n < 0 ? '−' + (-n) : '' + n);   // display token with a real minus

  // ---- grid drawing (min..max on both axes; axes drawn through 0) ----
  function svgGrid(min, max, pts, rect) {
    const C = 24, M = 24, span = max - min, size = M * 2 + span * C;
    const sx = (x) => M + (x - min) * C, sy = (y) => M + (max - y) * C;
    let s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`;
    for (let i = min; i <= max; i++) {
      s += `<line x1="${sx(i)}" y1="${sy(max)}" x2="${sx(i)}" y2="${sy(min)}" stroke="#dbe7e0" stroke-width="1"/>`;
      s += `<line x1="${sx(min)}" y1="${sy(i)}" x2="${sx(max)}" y2="${sy(i)}" stroke="#dbe7e0" stroke-width="1"/>`;
    }
    // bold axes (through 0 if visible, else along the edge)
    const ax = (min <= 0 && 0 <= max) ? 0 : min, ay = (min <= 0 && 0 <= max) ? 0 : min;
    s += `<line x1="${sx(min)}" y1="${sy(ay)}" x2="${sx(max)}" y2="${sy(ay)}" stroke="#12324a" stroke-width="2.5"/>`;
    s += `<line x1="${sx(ax)}" y1="${sy(max)}" x2="${sx(ax)}" y2="${sy(min)}" stroke="#12324a" stroke-width="2.5"/>`;
    for (let i = min; i <= max; i++) {
      if (i === 0) continue;
      s += `<text x="${sx(i)}" y="${sy(ay) + 13}" font-size="9" fill="#12324a" text-anchor="middle">${i}</text>`;
      s += `<text x="${sx(ax) - 8}" y="${sy(i) + 3}" font-size="9" fill="#12324a" text-anchor="middle">${i}</text>`;
    }
    s += `<text x="${sx(ax) - 8}" y="${sy(ay) + 13}" font-size="9" fill="#12324a" text-anchor="middle">0</text>`;
    if (rect) { const [x1, y1, x2, y2] = rect; s += `<polygon points="${sx(x1)},${sy(y1)} ${sx(x2)},${sy(y1)} ${sx(x2)},${sy(y2)} ${sx(x1)},${sy(y2)}" fill="rgba(31,157,85,.10)" stroke="#1f9d55" stroke-width="2" stroke-dasharray="5 4"/>`; }
    (pts || []).forEach((p) => { s += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5" fill="${p.color || '#c0392b'}"/>`; if (p.label) s += `<text x="${sx(p.x) + 8}" y="${sy(p.y) - 6}" font-size="11" fill="${p.color || '#c0392b'}" font-weight="700">${p.label}</text>`; });
    return s + `</svg>`;
  }

  // ---- shared: coordinate build step that MANDATES brackets ----
  function coordBuild(key, prompt, hint, why, x, y) {
    return buildStep({
      key, prompt, hint, why, longWay: `Along ${x}, up ${y} → (${x}, ${y})`, resultText: `(${x}, ${y})`,
      pieces: ['(', sgn(x), ',', sgn(y), ')'],
      distractors: [sgn(y), sgn(x >= 0 ? x + 1 : x - 1), sgn(-y || y + 1)],
      isAnswer: true,
      check: (raw) => {
        const s = String(raw).replace(/[−–—]/g, '-').replace(/\s+/g, '');
        const m = s.match(/^\((-?\d+),(-?\d+)\)$/);
        if (!m) {
          const hasBrackets = s.includes('(') && s.includes(')');
          const nums = parseNumberList(raw);
          if (!hasBrackets && nums.length >= 2) return { correct: false, id: 'coord-parens', ctx: { x, y } };
          return { correct: false, id: 'coord-form', ctx: { x, y } };
        }
        const gx = parseInt(m[1], 10), gy = parseInt(m[2], 10);
        if (gx === x && gy === y) return { correct: true };
        if (gx === y && gy === x) return { correct: false, id: 'coord-swap', ctx: { x, y } };
        return { correct: false, id: 'coord-form', ctx: { x, y } };
      },
    });
  }

  // ---- read coordinates ----
  function readCoordinate(x, y, min, max) {
    const neg = min < 0;
    return { subject: 'coords', given: `Write the coordinates of the point${neg ? ' (watch the negatives!)' : ''}`, sig: `rc:${x},${y},${min}`, diagram: svgGrid(min, max, [{ x, y }]), answer: `(${x}, ${y})`,
      steps: [coordBuild('coord', `Read the point and build its coordinates: ( x , y ). Along first, then up. Don't forget the brackets!`,
        `Go along to ${x}, then up to ${y}: (${x}, ${y}).`,
        `Coordinates are (across, up) — read x (across) first, then y (up). Negative x is to the LEFT of 0, negative y is BELOW 0.`
        + (neg ? `\n\nThe two axes cut the grid into four QUADRANTS. This point is in the one where x is ${x < 0 ? 'negative' : 'positive'} and y is ${y < 0 ? 'negative' : 'positive'}.` : ''), x, y)] };
  }

  // ---- reflect a point (four-quadrant, negative answers) ----
  function reflectPoint(x, y, axis) {
    const rx = axis === 'y' ? -x : x, ry = axis === 'x' ? -y : y;
    return { subject: 'coords', given: `Reflect the point (${x}, ${y}) in the ${axis}-axis`, sig: `rp:${x},${y},${axis}`,
      diagram: svgGrid(-5, 5, [{ x, y, color: '#0a7d34', label: `(${x},${y})` }]), answer: `(${rx}, ${ry})`,
      steps: [
        pickStep({ key: 'which', prompt: `Reflecting in the ${axis}-axis: which coordinate changes sign?`, hint: `In the ${axis}-axis, the ${axis === 'x' ? 'y (up/down)' : 'x (across)'} flips its sign.`,
          why: `Reflecting in the x-axis flips the y-coordinate's sign; reflecting in the y-axis flips the x-coordinate's sign. The other stays the same.`,
          resultText: `the ${axis === 'x' ? 'y' : 'x'} flips`, expected: [axis === 'x' ? 'the y' : 'the x'], pool: ['the x', 'the y'],
          diagnose: () => ({ correct: false, id: 'reflect-which', ctx: { axis } }) }),
        coordBuild('coord', `Now write the reflected coordinates ( x , y ) — remember the brackets.`, `(${rx}, ${ry}).`, `Keep the other coordinate the same and flip the sign of the one on the ${axis}-axis.`, rx, ry),
      ] };
  }

  // ---- complete the figure (missing corner of a square / rectangle) ----
  function completeFigure(x1, y1, x2, y2, missingIdx, square) {
    const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];   // going round
    const miss = corners[missingIdx], mx = miss[0], my = miss[1];
    const given = corners.filter((_, i) => i !== missingIdx);
    // partner sharing the missing x (same column), and sharing the missing y (same row)
    const colPartner = given.find((c) => c[0] === mx), rowPartner = given.find((c) => c[1] === my);
    const shape = square ? 'square' : 'rectangle';
    return {
      subject: 'coords', given: `Three corners of a ${shape} are shown. Where is the 4th corner?`, sig: `cf:${x1},${y1},${x2},${y2},${missingIdx}`,
      diagram: svgGrid(0, 7, given.map((c) => ({ x: c[0], y: c[1], color: '#0a7d34', label: `(${c[0]},${c[1]})` })), [x1, y1, x2, y2]),
      answer: `(${mx}, ${my})`,
      steps: [
        pickStep({ key: 'x', prompt: `The 4th corner lines up straight above/below the corner (${colPartner[0]}, ${colPartner[1]}). So what is its x-coordinate?`,
          hint: `It's in the same column as (${colPartner[0]}, ${colPartner[1]}), so the same x: ${mx}.`, why: `Opposite sides of a ${shape} are parallel, so the missing corner shares an x with the corner directly above or below it.`,
          resultText: `x = ${mx}`, expected: [mx], pool: numberPool([mx], 4, 0, 7), diagnose: () => ({ correct: false, id: 'figure-x', ctx: { mx, partner: `(${colPartner[0]}, ${colPartner[1]})` } }) }),
        pickStep({ key: 'y', prompt: `It lines up level with the corner (${rowPartner[0]}, ${rowPartner[1]}). So what is its y-coordinate?`,
          hint: `It's in the same row as (${rowPartner[0]}, ${rowPartner[1]}), so the same y: ${my}.`, why: `The missing corner shares a y with the corner on the same row (level with it).`,
          resultText: `y = ${my}`, expected: [my], pool: numberPool([my], 4, 0, 7), diagnose: () => ({ correct: false, id: 'figure-y', ctx: { my, partner: `(${rowPartner[0]}, ${rowPartner[1]})` } }) }),
        coordBuild('coord', `Now write the 4th corner's coordinates ( x , y ) — with brackets.`, `(${mx}, ${my}).`, `Put your two answers together as a coordinate pair to complete the ${shape}.`, mx, my),
      ],
    };
  }

  const api = { readCoordinate, reflectPoint, completeFigure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
