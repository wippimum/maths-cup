/* figures.js — shared shape drawings (inline SVG).
   Loaded EARLY so every topic file can draw the same way: topics4/topics5 use it for
   the core levels, harder2 for the challenge ones.

   Geometry questions without a picture are a different, harder question — you cannot
   count the faces of a square-based pyramid you can't see, or the lines of symmetry of
   a kite you have to imagine. Anything measurable is drawn. */
(function (root) {
  const INK = '#12324a', FILL = '#e8f5ec', FILL2 = '#d0ead9', FILL3 = '#c0dccb', RED = '#c0392b';
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
  const txt = (x, y, s, o) => {
    const p = o || {};
    return `<text x="${x}" y="${y}" font-size="${p.size || 14}" fill="${p.fill || INK}" font-weight="700"` +
      (p.anchor ? ` text-anchor="${p.anchor}"` : '') + `>${s}</text>`;
  };

  // ---------------- 3D solids ----------------
  // Drawn with a simple oblique projection: front face, then the top and side faces
  // offset up and right, so the shape reads as solid without any real 3D maths.
  const SOLID_SVG = {
    cube: () => svg(200, 150,
      `<rect x="40" y="55" width="80" height="80" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="40,55 75,22 155,22 120,55" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="120,55 155,22 155,102 120,135" fill="${FILL3}" stroke="${INK}" stroke-width="3"/>`),
    cuboid: () => svg(210, 150,
      `<rect x="35" y="55" width="105" height="70" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="35,55 70,25 175,25 140,55" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="140,55 175,25 175,95 140,125" fill="${FILL3}" stroke="${INK}" stroke-width="3"/>`),
    'triangular prism': () => svg(215, 150,
      `<polygon points="30,125 125,125 77,50" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="125,125 185,95 137,20 77,50" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="30,125 90,95 185,95 125,125" fill="${FILL3}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="30" y1="125" x2="90" y2="95" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<line x1="90" y1="95" x2="185" y2="95" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>`),
    'square-based pyramid': () => svg(200, 150,
      `<polygon points="30,120 130,120 90,35" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="130,120 175,98 90,35" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="30" y1="120" x2="75" y2="98" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<line x1="75" y1="98" x2="175" y2="98" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<line x1="75" y1="98" x2="90" y2="35" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>`),
    cylinder: () => svg(180, 155,
      `<path d="M40,45 L40,115 A35,14 0 0 0 110,115 L110,45 Z" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<ellipse cx="75" cy="45" rx="35" ry="14" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>`),
    cone: () => svg(180, 155,
      `<path d="M75,25 L112,118 A37,14 0 0 1 38,118 Z" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M38,118 A37,14 0 0 0 112,118" fill="none" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M38,118 A37,14 0 0 1 112,118" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>`),
    sphere: () => svg(180, 155,
      `<circle cx="80" cy="78" r="52" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<ellipse cx="80" cy="78" rx="52" ry="17" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>`),
  };
  function solid(name) { return (SOLID_SVG[name] || SOLID_SVG.cube)(); }
  const SOLID_NAMES = Object.keys(SOLID_SVG);

  // A labelled cuboid. Pass missing:'l'|'w'|'h' to show "?" on that edge instead of a number.
  function cuboid(l, w, h, missing) {
    const lab = (which, val) => (missing === which ? '?' : String(val));
    const red = (which) => (missing === which ? RED : INK);
    return svg(215, 155,
      `<rect x="35" y="55" width="105" height="70" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="35,55 70,25 175,25 140,55" fill="${FILL2}" stroke="${INK}" stroke-width="3"/>` +
      `<polygon points="140,55 175,25 175,95 140,125" fill="${FILL3}" stroke="${INK}" stroke-width="3"/>` +
      txt(87, 145, lab('l', l) + ' cm', { anchor: 'middle', fill: red('l'), size: 13 }) +
      txt(14, 96, lab('h', h), { fill: red('h'), size: 13 }) +
      txt(152, 72, lab('w', w), { fill: red('w'), size: 13 }));
  }

  // A rectangle with its sides labelled; `inside` writes text in the middle (e.g. the area).
  function rect(L, Wd, opts) {
    const o = opts || {};
    return svg(250, 150,
      `<rect x="40" y="30" width="165" height="80" fill="${FILL}" stroke="${INK}" stroke-width="3"/>` +
      (o.inside ? txt(122, 76, o.inside, { anchor: 'middle', size: 15 }) : '') +
      txt(122, 24, String(L) + (o.unit === false ? '' : ' cm'), { anchor: 'middle', fill: o.missing === 'L' ? RED : INK, size: 13 }) +
      txt(213, 74, String(Wd), { fill: o.missing === 'W' ? RED : INK, size: 13 }));
  }

  // ---------------- 2D shapes ----------------
  // Points are on a 0..100 box; each shape is scaled into the drawing area.
  const SHAPE_PTS = {
    square: [[15, 15], [85, 15], [85, 85], [15, 85]],
    rectangle: [[8, 25], [92, 25], [92, 75], [8, 75]],
    rhombus: [[30, 15], [92, 15], [70, 85], [8, 85]],
    parallelogram: [[28, 20], [95, 20], [72, 80], [5, 80]],
    trapezium: [[28, 18], [72, 18], [95, 82], [5, 82]],
    kite: [[50, 5], [88, 42], [50, 95], [12, 42]],
    'equilateral triangle': [[50, 10], [92, 85], [8, 85]],
    'isosceles triangle': [[50, 10], [82, 88], [18, 88]],
    'scalene triangle': [[35, 12], [95, 84], [6, 70]],
    'regular pentagon': null, 'regular hexagon': null, 'regular octagon': null,
  };
  const REGULAR = { 'regular pentagon': 5, 'regular hexagon': 6, 'regular octagon': 8, pentagon: 5, hexagon: 6, octagon: 8, heptagon: 7, nonagon: 9, decagon: 10 };
  function regularPts(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;     // start at the top
      pts.push([50 + 45 * Math.cos(a), 50 + 45 * Math.sin(a)]);
    }
    return pts;
  }
  function ptsOf(name) {
    if (SHAPE_PTS[name]) return SHAPE_PTS[name];
    if (REGULAR[name]) return regularPts(REGULAR[name]);
    return SHAPE_PTS.square;
  }
  // Where the mirror lines of each shape run, as pairs of 0..100 points.
  const SYM_LINES = {
    square: [[[50, 5], [50, 95]], [[5, 50], [95, 50]], [[12, 12], [88, 88]], [[88, 12], [12, 88]]],
    rectangle: [[[50, 18], [50, 82]], [[2, 50], [98, 50]]],
    rhombus: [[[22, 50], [78, 50]], [[50, 8], [50, 92]]],
    parallelogram: [],
    kite: [[[50, 0], [50, 100]]],
    'equilateral triangle': [[[50, 4], [50, 92]], [[12, 24], [78, 88]], [[88, 24], [22, 88]]],
    'isosceles triangle': [[[50, 4], [50, 95]]],
    trapezium: [[[50, 12], [50, 88]]],
  };
  function symLines(name) {
    if (SYM_LINES[name]) return SYM_LINES[name];
    const n = REGULAR[name];
    if (!n) return [];
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / n;
      out.push([[50 - 48 * Math.cos(a), 50 - 48 * Math.sin(a)], [50 + 48 * Math.cos(a), 50 + 48 * Math.sin(a)]]);
    }
    return out;
  }

  // Draw a 2D shape. showSym draws its mirror lines (used only when the question has
  // already been answered — never on the question itself, or it gives the count away).
  function shape(name, opts) {
    const o = opts || {}, size = o.size || 130, pad = 12;
    const sc = (v) => pad + (v / 100) * size;
    const pts = ptsOf(name).map(([x, y]) => `${sc(x)},${sc(y)}`).join(' ');
    let body = `<polygon points="${pts}" fill="${FILL}" stroke="${INK}" stroke-width="3"/>`;
    if (o.showSym) {
      symLines(name).forEach(([a, b]) => {
        body += `<line x1="${sc(a[0])}" y1="${sc(a[1])}" x2="${sc(b[0])}" y2="${sc(b[1])}" stroke="${RED}" stroke-width="2" stroke-dasharray="6 4"/>`;
      });
    }
    if (o.label) body += txt(pad + size / 2, pad + size + 16, o.label, { anchor: 'middle', size: 12 });
    return svg(size + pad * 2, size + pad * 2 + (o.label ? 20 : 0), body);
  }

  // Several shapes side by side, each with its name under it — for "which shape is…?"
  function gallery(names, size) {
    const s = size || 96;
    return `<div class="fig-row">` + names.map((n) => shape(n, { size: s, label: n })).join('') + `</div>`;
  }

  const api = { fig: { solid, SOLID_NAMES, cuboid, rect, shape, gallery, regularPts, symLines, INK, FILL, RED } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
