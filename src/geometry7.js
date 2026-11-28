/* geometry7.js — Year 7 (KS3) geometry, two topics, step by step.

   Built from the KS3 programme of study (angle facts and notation, parallel lines with
   alternate, corresponding and co-interior angles, the angle sum of a triangle and the
   exterior angle, properties of triangles and quadrilaterals, symmetry, interior and
   exterior angles of polygons), with the school's Topic 5 homework sheets (Corbettmaths
   "Quadrilaterals" and "Angles: Parallel Lines") as the direction of travel, not the
   whole of it.

   The Maths Cup way: one small move per step. A question about an angle in parallel
   lines is never "find x"; it is "what shape do they make?", "so are they equal or do
   they add to 180?", "which reason does the examiner want?", "so x = ?". Every wrong
   option carries its own sentence (diagnosis id 'g7-say'), written here, where we know
   which rule, which angle and which number went wrong.

   Every diagram that is drawn from numbers is drawn TO SCALE, so the angle labelled 64°
   really is 64° on the screen; test/test-geometry7.js measures them. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, chooseStep = W._chooseStep, shuffle = W._shuffle;
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const DEG = Math.PI / 180;

  /* ================================================================ vectors */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const len = (a) => Math.hypot(a[0], a[1]);
  const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const r1 = (n) => Math.round(n * 10) / 10;
  const norm360 = (a) => ((a % 360) + 360) % 360;
  const mang = (V, P) => Math.atan2(V[1] - P[1], P[0] - V[0]) / DEG;   // screen coords, maths angle
  function measure(V, A, B) {
    const a = sub(A, V), b = sub(B, V);
    return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (len(a) * len(b))))) / DEG;
  }
  function intersect(p, r, q, s) { const t = cross(sub(q, p), s) / cross(r, s); return add(p, mul(r, t)); }

  /* ================================================================ drawing kit
     White card (the app puts diagrams on white), so everything is drawn with inline
     colours. Same colour language as the class sheets: green = given, red = find it,
     purple = a stepping-stone angle you work out on the way. */
  const INK = '#12324a', PT = '#1f4e9c', FILL = '#e8f5ec';
  const COL = { given: '#0a7d34', unknown: '#c0392b', step: '#7d3cb5', p: '#1f6fd1', q: '#d35400', letter: '#4a5a6a', plain: '#8a99a8' };
  function Kit(w, h) { this.w = w; this.h = h; this.o = []; this.t = []; this.geo = []; }
  Kit.prototype.line = function (p, q, o) {
    o = o || {};
    this.o.push(`<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="${o.col || INK}" stroke-width="${o.w || 2.6}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`);
    return this;
  };
  Kit.prototype.poly = function (pts, o) {
    o = o || {};
    this.o.push(`<polygon points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="${o.fill || FILL}" stroke="${o.col || INK}" stroke-width="${o.w || 2.6}" stroke-linejoin="round"/>`);
    return this;
  };
  Kit.prototype.text = function (p, s, col, size) {
    this.t.push(`<text x="${r1(p[0])}" y="${r1(p[1])}" font-size="${size || 15}" font-weight="700" fill="${col || PT}" text-anchor="middle" dominant-baseline="central" stroke="#fff" stroke-width="4" paint-order="stroke">${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`);
    return this;
  };
  Kit.prototype.arc = function (V, start, size, o) {
    o = o || {};
    const col = COL[o.kind || 'given'];
    const r = o.r || (size < 38 ? 30 : size > 125 ? 17 : 21);
    const a1 = start * DEG, a2 = (start + size) * DEG;
    const p1 = [V[0] + r * Math.cos(a1), V[1] - r * Math.sin(a1)], p2 = [V[0] + r * Math.cos(a2), V[1] - r * Math.sin(a2)];
    const large = size > 180 ? 1 : 0;
    if (o.wedge) this.o.push(`<path d="M${r1(V[0])} ${r1(V[1])} L${r1(p1[0])} ${r1(p1[1])} A${r} ${r} 0 ${large} 0 ${r1(p2[0])} ${r1(p2[1])} Z" fill="${col}" fill-opacity="0.22"/>`);
    this.o.push(`<path d="M${r1(p1[0])} ${r1(p1[1])} A${r} ${r} 0 ${large} 0 ${r1(p2[0])} ${r1(p2[1])}" fill="none" stroke="${col}" stroke-width="2.6"/>`);
    const lab = o.label;
    if (lab != null && lab !== '') {
      const m = (start + size / 2) * DEG;
      const d = r + 13 + (size < 38 ? 5 : 0) + (String(lab).length > 4 ? (String(lab).length - 4) * 3.4 : 0);
      this.text([V[0] + d * Math.cos(m), V[1] - d * Math.sin(m)], lab, col);
    }
    this.geo.push({ V, start, size, label: lab });
    return this;
  };
  Kit.prototype.angle = function (V, A, B, o) {
    let a1 = mang(V, A), a2 = mang(V, B), d = norm360(a2 - a1);
    if (d > 180) { const t = a1; a1 = a2; a2 = t; d = 360 - d; }
    this.arc(V, a1, d, o);
    this.geo[this.geo.length - 1].pts = [V, A, B];
    return this;
  };
  Kit.prototype.right = function (V, A, B) {
    const s = 11, a = mul(unit(sub(A, V)), s), b = mul(unit(sub(B, V)), s);
    const p1 = add(V, a), p2 = add(add(V, a), b), p3 = add(V, b);
    this.o.push(`<path d="M${r1(p1[0])} ${r1(p1[1])} L${r1(p2[0])} ${r1(p2[1])} L${r1(p3[0])} ${r1(p3[1])}" fill="none" stroke="${INK}" stroke-width="1.8"/>`);
    return this;
  };
  Kit.prototype.chevron = function (M, d, n) {
    d = unit(d); const p = [-d[1], d[0]];
    for (let k = 0; k < n; k++) {
      const tip = add(M, mul(d, (k - (n - 1) / 2) * 8 + 4));
      const a = add(add(tip, mul(d, -8)), mul(p, 6)), b = add(add(tip, mul(d, -8)), mul(p, -6));
      this.o.push(`<path d="M${r1(a[0])} ${r1(a[1])} L${r1(tip[0])} ${r1(tip[1])} L${r1(b[0])} ${r1(b[1])}" fill="none" stroke="${PT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    return this;
  };
  Kit.prototype.ticks = function (M, d, n) {
    d = unit(d); const p = [-d[1], d[0]];
    for (let k = 0; k < n; k++) { const c = add(M, mul(d, (k - (n - 1) / 2) * 5)); this.line(add(c, mul(p, 6)), add(c, mul(p, -6)), { col: '#c0392b', w: 2.4 }); }
    return this;
  };
  Kit.prototype.svg = function (note) {
    if (note) this.t.push(`<text x="${this.w - 6}" y="12" font-size="11" fill="#6b7c8c" text-anchor="end">${note}</text>`);
    return `<svg viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img">${this.o.join('')}${this.t.join('')}</svg>`;
  };

  /* fit raw points (screen style, y down) into a box */
  function fitter(pts, Wd, H, pad) {
    pad = pad == null ? 26 : pad;
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((Wd - 2 * pad) / ((x1 - x0) || 1), (H - 2 * pad) / ((y1 - y0) || 1));
    const ox = (Wd - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
    return (p) => [ox + (p[0] - x0) * s, oy + (p[1] - y0) * s];
  }
  /* a diagram from named points: { pts, lines, arrows, ticks, angles, rights, labels, hide, note } */
  function free(d) {
    const Wd = d.w || 340, H = d.h || 230;
    const names = Object.keys(d.pts), f = fitter(names.map((k) => d.pts[k]), Wd, H, d.pad);
    const P = {}; names.forEach((k) => { P[k] = f(d.pts[k]); });
    const K = new Kit(Wd, H);
    (d.lines || []).forEach((l) => K.line(P[l[0]], P[l[1]]));
    (d.arrows || []).forEach((a) => { const at = a[3] == null ? 0.55 : a[3]; K.chevron(add(P[a[0]], mul(sub(P[a[1]], P[a[0]]), at)), sub(P[a[1]], P[a[0]]), a[2] || 1); });
    (d.ticks || []).forEach((a) => K.ticks(mid(P[a[0]], P[a[1]]), sub(P[a[1]], P[a[0]]), a[2] || 1));
    (d.rights || []).forEach((a) => K.right(P[a[0]], P[a[1]], P[a[2]]));
    (d.angles || []).forEach((a) => K.angle(P[a.at], P[a.from], P[a.to], { label: a.t, kind: a.kind || 'given', wedge: a.wedge }));
    let cen = [0, 0]; names.forEach((k) => { cen = add(cen, P[k]); }); cen = mul(cen, 1 / names.length);
    names.forEach((k) => {
      if ((d.hide || []).includes(k)) return;
      const dir = d.labels && d.labels[k] ? d.labels[k] : unit(sub(P[k], cen));
      K.text(add(P[k], mul(dir, 14)), k, PT);
    });
    return { svg: K.svg(d.note), geo: K.geo, P };
  }

  /* ================================================================ the parallel-line model
     Line 0 and line 1 are parallel; the transversal crosses both. At each crossing the
     four angles are TL, TR, BL, BR: T/B = towards the +t end of the transversal (which
     points from line 1 towards line 0), L/R = towards the -u / +u end of the parallel
     line. TR = BL = theta and TL = BR = 180 - theta. At line 0 the B angles lie BETWEEN
     the parallels; at line 1 the T angles do. */
  const KEYS = ['0TL', '0TR', '0BL', '0BR', '1TL', '1TR', '1BL', '1BR'];
  const OPP = { TL: 'BR', BR: 'TL', TR: 'BL', BL: 'TR' };
  const angleAt = (theta, pos) => (pos === 'TR' || pos === 'BL' ? theta : 180 - theta);
  const valueOf = (theta, key) => angleAt(theta, key.slice(1));
  function relation(a, b) {
    const ai = +a[0], bi = +b[0], ap = a.slice(1), bp = b.slice(1);
    if (ai === bi) return ap === bp ? 'same' : OPP[ap] === bp ? 'vertical' : 'straight';
    const top = ai === 0 ? ap : bp, bot = ai === 0 ? bp : ap;
    if (top === bot) return 'corresponding';
    if ((top === 'BL' && bot === 'TR') || (top === 'BR' && bot === 'TL')) return 'alternate';
    if ((top === 'BL' && bot === 'TL') || (top === 'BR' && bot === 'TR')) return 'cointerior';
    return 'twostep';
  }
  const isInside = (key) => (key[0] === '0' ? key[1] === 'B' : key[1] === 'T');
  const posStart = (phi, th, pos) => phi + ({ TR: 0, TL: th, BL: 180, BR: 180 + th })[pos];
  function pairOf(rel) {
    for (let g = 0; g < 500; g++) { const a = pick(KEYS), b = pick(KEYS); if (relation(a, b) === rel) return [a, b]; }
    throw new Error('no pair for ' + rel);
  }
  /* sp: { phi, gap, names:[l0-,l0+,l1-,l1+], theta, labels:{key:{t,kind,wedge}}, ends, pts } */
  function parallel(sp) {
    const Wd = 340, H = 230, cx = Wd / 2, cy = H / 2;
    const phi = sp.phi || 0, gap = sp.gap || 92, L = 160, th = sp.theta;
    const u = [Math.cos(phi * DEG), Math.sin(phi * DEG)], n = [-u[1], u[0]];
    const S = (p) => [cx + p[0], cy - p[1]], sd = (v) => [v[0], -v[1]];
    const K = new Kit(Wd, H);
    const c = [mul(n, gap / 2), mul(n, -gap / 2)], names = sp.names || [];
    for (let i = 0; i < 2; i++) {
      const a = add(c[i], mul(u, -L)), b = add(c[i], mul(u, L));
      K.line(S(a), S(b));
      K.chevron(S(add(c[i], mul(u, L * 0.6))), sd(u), 1);
      if (names[2 * i]) K.text(S(add(a, mul(u, -12))), names[2 * i]);
      if (names[2 * i + 1]) K.text(S(add(b, mul(u, 12))), names[2 * i + 1]);
    }
    const t = [Math.cos((phi + th) * DEG), Math.sin((phi + th) * DEG)], k = (gap / 2) / Math.sin(th * DEG);
    const P = [mul(t, k), mul(t, -k)], ext = 56;
    K.line(S(add(P[0], mul(t, ext))), S(add(P[1], mul(t, -ext))));
    const used = {};
    Object.keys(sp.labels || {}).forEach((key) => {
      const lab = typeof sp.labels[key] === 'string' ? { t: sp.labels[key] } : sp.labels[key];
      const i = +key[0], pos = key.slice(1); used[key] = 1;
      K.arc(S(P[i]), posStart(phi, th, pos), angleAt(th, pos), { label: lab.t, kind: lab.kind || 'given', wedge: lab.wedge });
      K.geo[K.geo.length - 1].value = angleAt(th, pos);
    });
    [0, 1].forEach((i) => {
      if (!sp.pts || !sp.pts[i]) return;
      const free_ = ['BR', 'TL', 'BL', 'TR'].filter((p) => !used[i + p])[0] || 'BR';
      const m = (posStart(phi, th, free_) + angleAt(th, free_) / 2) * DEG;
      K.text(S(add(P[i], [15 * Math.cos(m), 15 * Math.sin(m)])), sp.pts[i]);
    });
    if (sp.ends) { if (sp.ends[0]) K.text(S(add(P[0], mul(t, ext + 12))), sp.ends[0]); if (sp.ends[1]) K.text(S(add(P[1], mul(t, -ext - 12))), sp.ends[1]); }
    return { svg: K.svg(sp.note), geo: K.geo };
  }
  function niceTheta() { let t; do { t = rand(38, 142); } while (Math.abs(t - 90) < 10); return t; }
  const PHIS = [0, 0, 0, 0, -18, 16, 70, -62];

  /* ================================================================ words */
  const RS = {
    corr: 'Corresponding angles are equal',
    alt: 'Alternate angles are equal',
    coint: 'Co-interior angles add up to 180°',
    vert: 'Vertically opposite angles are equal',
    line: 'Angles on a straight line add up to 180°',
    point: 'Angles around a point add up to 360°',
    tri: 'Angles in a triangle add up to 180°',
    quad: 'Angles in a quadrilateral add up to 360°',
    iso: 'Base angles of an isosceles triangle are equal',
  };
  const WHERE = {
    corr: 'in the SAME POSITION at each crossing (they make an F)',
    alt: 'BETWEEN the parallel lines, on OPPOSITE sides of the slanted line (they make a Z)',
    coint: 'BETWEEN the parallel lines, on the SAME side of the slanted line (they make a C)',
    vert: 'opposite each other where two lines cross (an X)',
    line: 'side by side on one straight line',
    point: 'all the way round one point',
    tri: 'the three angles inside one triangle',
    quad: 'the four angles inside a four-sided shape',
    iso: 'the two angles at the bottom of a triangle with two equal sides',
  };
  const EQUAL = { corr: 1, alt: 1, vert: 1, iso: 1 };
  const REL2 = { corresponding: 'corr', alternate: 'alt', cointerior: 'coint', vertical: 'vert', straight: 'line' };
  const SHAPE = { corr: 'an F (corresponding)', alt: 'a Z (alternate)', coint: 'a C (co-interior)', vert: 'an X (vertically opposite)', line: 'a straight line (next to each other)' };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ================================================================ step helpers */
  const say = (msg) => ({ correct: false, id: 'g7-say', ctx: { msg } });
  /* a choice step. options: the cards; answer: the right one; wrong: { card: sentence } */
  function oStep(o) {
    const pool = [...new Set(o.options.map(String))];
    if (!pool.includes(String(o.answer))) pool.push(String(o.answer));
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [String(o.answer)], pool, isAnswer: !!o.isAnswer,
      diagnose: (v) => say((o.wrong && o.wrong[v]) || o.miss || `Not “${v}”. ${o.hint}`),
    });
  }
  /* a number step: the answer, the likely slips (each with its sentence), then a couple of
     near misses so the cards don't give the answer away */
  function nStep(o) {
    const a = o.answer, traps = o.traps || {};
    const pool = [a];
    Object.keys(traps).map(Number).forEach((v) => { if (v > 0 && !pool.includes(v) && pool.length < 4) pool.push(v); });
    [10, -10, 20, -20, 5, 1, -1].forEach((d) => { const v = a + d; if (pool.length < 4 && v > 0 && !pool.includes(v)) pool.push(v); });
    return pickStep({
      key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.resultText, expected: [String(a)], pool: pool.map(String), isAnswer: !!o.isAnswer,
      diagnose: (v) => say(traps[v] || `Not ${v}. ${o.expr ? `${o.expr} = ${a}.` : o.hint}`),
    });
  }
  /* the slips that go with each rule */
  function trapsFor(rule, given, answer) {
    const t = {};
    if (EQUAL[rule]) {
      t[180 - given] = `You did 180 − ${given}. But ${RS[rule].toLowerCase()}: nothing to take away, just copy the ${given}°.`;
      t[360 - given] = `These two are equal, they do not add to 360°. Copy the ${given}°.`;
    } else if (rule === 'coint' || rule === 'line') {
      t[given] = `You copied the ${given}°, but these two are NOT equal. ${RS[rule]}, so it is 180 − ${given}.`;
      t[360 - given] = `Use 180, not 360: ${RS[rule].toLowerCase()}.`;
    }
    delete t[answer];
    return t;
  }
  function shapeStep(key, rule, prompt, given) {
    const opts = ['corr', 'alt', 'coint', 'vert', 'line'];
    const wrong = {};
    opts.forEach((k) => { if (k !== rule) wrong[SHAPE[k]] = `${cap(SHAPE[k])} is for angles ${WHERE[k]}. These two are ${WHERE[rule]}.`; });
    return oStep({ key, prompt, options: opts.map((k) => SHAPE[k]), answer: SHAPE[rule], wrong,
      hint: `Put your finger on the ${given} and trace along the lines to the other angle. They are ${WHERE[rule]}.`,
      why: `Corresponding angles make an F, alternate angles make a Z, co-interior angles make a C. The letter can be back to front, upside down or stretched: it is still that letter.`,
      resultText: `${cap(SHAPE[rule])}` });
  }
  function reasonStep(key, rule, prompt, pool) {
    const keys = pool || ['corr', 'alt', 'coint', 'vert', 'line'];
    const opts = keys.includes(rule) ? keys : keys.concat([rule]);
    const wrong = {};
    opts.forEach((k) => { if (k !== rule) wrong[RS[k]] = `“${RS[k]}” is the rule for angles ${WHERE[k]}. Here the angles are ${WHERE[rule]}, so the reason is: ${RS[rule]}.`; });
    return oStep({ key, prompt: prompt || 'Which reason would you write in the exam?', options: opts.map((k) => RS[k]), answer: RS[rule], wrong,
      hint: `The angles are ${WHERE[rule]}.`,
      why: `In an exam “give a reason” is a mark of its own. Write the whole rule with its proper name. “Z angles” or “F angles” get no mark.`,
      resultText: RS[rule] });
  }

  /* ======================================================================== ANGLES */

  /* ---- 1. Naming angles: ∠ABC (KS3 notation) ---- */
  function angNotation() {
    const quad = Math.random() < 0.5;
    const raw = quad ? [[40, 190], [300, 210], [270, 40], [90, 60]] : [[40, 200], [300, 190], [150, 30]];
    const names = quad ? shuffle(['A', 'B', 'C', 'D']) : shuffle(['P', 'Q', 'R']);
    if (quad) names.sort(); // A,B,C,D round the shape, the way books letter them
    const marks = quad ? ['p', 'q', 'r', 's'] : ['p', 'q', 'r'];
    const n = raw.length, v = rand(0, n - 1), aN = names[(v + n - 1) % n], bN = names[v], cN = names[(v + 1) % n];
    const pts = {}; raw.forEach((p, i) => { pts[names[i]] = p; });
    const angles = raw.map((_, i) => ({ at: names[i], from: names[(i + n - 1) % n], to: names[(i + 1) % n], t: marks[i], kind: 'letter' }));
    const d = free({ pts, lines: raw.map((_, i) => [names[i], names[(i + 1) % n]]), angles });
    const asked = Math.random() < 0.5 ? `∠${aN}${bN}${cN}` : `∠${cN}${bN}${aN}`;
    const arms = `${bN}${aN} and ${bN}${cN}`;
    const armWrong = [`${aN}${cN} and ${bN}${aN}`, `${aN}${bN} and ${aN}${cN}`, `${cN}${aN} and ${cN}${bN}`];
    const markAt = marks[v];
    const markWrong = {};
    marks.forEach((m, i) => { if (m !== markAt) markWrong[m] = `${m} is at corner ${names[i]}. ${asked} is at corner ${bN}, the middle letter.`; });
    return {
      subject: 'y7ang', sig: `not:${asked}:${quad}`, given: `Which angle is ${asked}?`, diagram: d.svg, answer: markAt,
      steps: [
        oStep({ key: 'vertex', prompt: `${asked}: which letter is the CORNER where the angle is?`, options: names, answer: bN,
          wrong: Object.fromEntries(names.filter((x) => x !== bN).map((x) => [x, `The corner is always the MIDDLE letter. In ${asked} the middle letter is ${bN}.`])),
          hint: `Three letters: start, CORNER, end. The middle one is the corner.`,
          why: `KS3 names an angle with three letters. The middle letter is the corner (the vertex). The other two letters tell you which two lines make the angle.`,
          resultText: `the corner is ${bN}` }),
        oStep({ key: 'arms', prompt: `The angle is made by two lines that meet at ${bN}. Which two?`, options: shuffle([arms, ...armWrong]), answer: arms,
          wrong: Object.fromEntries(armWrong.map((x) => [x, `Both lines must start at the corner ${bN}: one goes to ${aN}, the other to ${cN}.`])),
          hint: `Both lines start at ${bN}: ${bN}${aN} and ${bN}${cN}.`,
          why: `${asked} is the gap between the line from ${bN} to ${aN} and the line from ${bN} to ${cN}.`,
          resultText: `between ${arms}` }),
        oStep({ key: 'mark', prompt: `So which marked angle is ${asked}?`, options: marks, answer: markAt, wrong: markWrong,
          hint: `Find corner ${bN} on the diagram. The angle there is ${markAt}.`,
          why: `${asked} is the angle at ${bN}, between ${bN}${aN} and ${bN}${cN}.`,
          longWay: `${asked}\nmiddle letter = ${bN} (the corner)\nlines ${arms}\nso it is the angle marked ${markAt}`,
          resultText: `${asked} is ${markAt}`, isAnswer: true }),
      ],
    };
  }

  /* ---- 2. Line, point, vertically opposite ---- */
  function rayAt(O, deg, L) { return [O[0] + L * Math.cos(deg * DEG), O[1] - L * Math.sin(deg * DEG)]; }
  function angFacts() {
    const kind = pick(['line', 'line', 'point', 'vert']);
    if (kind === 'vert') {
      const a = rand(30, 150);
      if (Math.abs(a - 90) < 6) return angFacts();
      const K = new Kit(300, 200), O = [150, 100];
      const d1 = rand(10, 30), d2 = d1 + a;
      K.line(rayAt(O, d1, 110), rayAt(O, d1 + 180, 110)); K.line(rayAt(O, d2, 110), rayAt(O, d2 + 180, 110));
      K.arc(O, d1, a, { label: `${a}°` }); K.arc(O, d1 + 180, a, { label: 'x', kind: 'unknown' });
      return {
        subject: 'y7ang', sig: `fv:${a}`, given: 'Two straight lines cross. Find x.', diagram: K.svg(), answer: `${a}°`, geo: K.geo,
        steps: [
          reasonStep('fact', 'vert', 'Which angle fact links x and the ' + a + '°?', ['line', 'point', 'vert', 'tri']),
          nStep({ key: 'x', prompt: `Vertically opposite angles are equal. So x = ?`, answer: a, traps: trapsFor('vert', a, a),
            hint: `x is straight across the X from ${a}°, so x = ${a}°.`, why: `Where two straight lines cross, the angles facing each other across the crossing are always equal.`,
            longWay: `x and ${a}° are vertically opposite\nVertically opposite angles are equal\nx = ${a}°`, resultText: `x = ${a}°`, expr: `the same as ${a}`, isAnswer: true }),
        ],
      };
    }
    const total = kind === 'line' ? 180 : 360;
    const parts = kind === 'line' ? (Math.random() < 0.5 ? 2 : 3) : 3;
    let angs;
    for (;;) {
      angs = [];
      let left = total;
      for (let i = 0; i < parts - 1; i++) { const v = rand(25, Math.min(140, left - 25 * (parts - 1 - i))); angs.push(v); left -= v; }
      angs.push(left);
      if (angs.every((v) => v >= 22 && v <= (kind === 'line' ? 150 : 175))) break;
    }
    const xi = rand(0, parts - 1);
    const K = new Kit(300, kind === 'line' ? 170 : 220), O = kind === 'line' ? [150, 130] : [150, 110];
    let start = kind === 'line' ? 0 : rand(0, 40);
    if (kind === 'line') K.line([20, 130], [280, 130]);
    const dirs = [start]; angs.forEach((v) => dirs.push(dirs[dirs.length - 1] + v));
    (kind === 'line' ? dirs.slice(1, -1) : dirs.slice(0, -1)).forEach((dd) => K.line(O, rayAt(O, dd, kind === 'line' ? 110 : 95)));
    angs.forEach((v, i) => K.arc(O, dirs[i], v, { label: i === xi ? 'x' : `${v}°`, kind: i === xi ? 'unknown' : 'given' }));
    const known = angs.filter((_, i) => i !== xi), sumK = known.reduce((a, b) => a + b, 0), x = angs[xi];
    const rule = kind === 'line' ? 'line' : 'point';
    const steps = [
      reasonStep('fact', rule, 'Which angle fact do you need?', ['line', 'point', 'vert', 'tri']),
      nStep({ key: 'total', prompt: `So all the angles together make how many degrees?`, answer: total, traps: { [total === 180 ? 360 : 180]: total === 180 ? '360° is a full turn round a point. These angles only fill a straight line: half a turn, 180°.' : '180° is only half a turn. These go all the way round the point: 360°.', 90: '90° is a right angle, only a quarter turn.' },
        hint: kind === 'line' ? 'A straight line is half a full turn.' : 'All the way round is a full turn.', why: kind === 'line' ? 'A straight line is half a turn: 180°.' : 'A full turn is 360°.', resultText: `they make ${total}°`, expr: kind === 'line' ? 'a straight line' : 'a full turn' }),
    ];
    if (known.length > 1) steps.push(nStep({ key: 'known', prompt: `Add up the angles you know: ${known.join(' + ')} = ?`, answer: sumK, hint: `${known.join(' + ')} = ${sumK}.`,
      why: 'Total what you know first, then see what is left for x.', resultText: `known = ${sumK}°`, expr: known.join(' + ') }));
    steps.push(nStep({ key: 'x', prompt: `x is what is left: ${total} − ${sumK} = ?`, answer: x,
      traps: { [sumK]: `That is the angles you already know. x is what is LEFT: ${total} − ${sumK}.`, [Math.abs(360 - total - sumK) || 1]: `Use ${total}.` },
      hint: `${total} − ${sumK} = ${x}.`, why: `Everything must make ${total}°, so x is the part still missing.`,
      longWay: `${RS[rule]}\n${known.length > 1 ? known.join(' + ') + ' = ' + sumK + '\n' : ''}x = ${total} − ${sumK} = ${x}°`, resultText: `x = ${x}°`, expr: `${total} − ${sumK}`, isAnswer: true }));
    return { subject: 'y7ang', sig: `f${kind}:${angs.join(',')}:${xi}`, given: kind === 'line' ? 'Angles on a straight line. Find x.' : 'Angles around a point. Find x.', diagram: K.svg(), answer: `${x}°`, geo: K.geo, steps };
  }

  /* ---- 3. Triangles: angle sum, the exterior angle, isosceles ---- */
  function triPts(a, b) { // base angles a (left) and b (right), base on y = 190
    const A = [50, 190], B = [290, 190];
    const C = intersect(A, [Math.cos(a * DEG), -Math.sin(a * DEG)], B, [-Math.cos(b * DEG), -Math.sin(b * DEG)]);
    return { A, B, C };
  }
  function angTriangle() {
    const kind = pick(['sum', 'ext', 'ext', 'iso']);
    if (kind === 'iso') {
      const apex = 2 * rand(10, 50), base = (180 - apex) / 2;
      const { A, B, C } = triPts(base, base);
      const d = free({ pts: { A, B, C }, hide: ['A', 'B', 'C'], lines: [['A', 'B'], ['B', 'C'], ['C', 'A']], ticks: [['A', 'C', 1], ['B', 'C', 1]],
        angles: [{ at: 'C', from: 'A', to: 'B', t: `${apex}°` }, { at: 'A', from: 'B', to: 'C', t: 'x', kind: 'unknown' }] });
      return {
        subject: 'y7ang', sig: `ti:${apex}`, given: 'An isosceles triangle (the marked sides are equal). Find x.', diagram: d.svg, answer: `${base}°`, geo: d.geo,
        steps: [
          oStep({ key: 'which', prompt: 'Two sides are marked equal. Which two angles are equal?', options: ['The two angles at the bottom', 'The top angle and x', 'All three angles'], answer: 'The two angles at the bottom',
            wrong: { 'The top angle and x': 'The equal angles are the ones at the ENDS of the unmarked side: the two at the bottom.', 'All three angles': 'Only an equilateral triangle has three equal angles. Here just two sides are equal.' },
            hint: 'The equal angles sit at the two ends of the side that is NOT marked.', why: RS.iso + '. They are the angles at the ends of the third side.', resultText: 'the two base angles are equal' }),
          nStep({ key: 'left', prompt: `All three add to 180°. Take away the top: 180 − ${apex} = ?`, answer: 180 - apex, hint: `180 − ${apex} = ${180 - apex}.`, why: 'That is what the two bottom angles share.', resultText: `${180 - apex}° for the two base angles`, expr: `180 − ${apex}` }),
          nStep({ key: 'x', prompt: `They share it equally: ${180 - apex} ÷ 2 = ?`, answer: base, traps: { [180 - apex]: 'That is both base angles together. They are equal, so halve it.', [apex]: 'x is a base angle, not the top one.' },
            hint: `${180 - apex} ÷ 2 = ${base}.`, why: 'The two base angles are equal, so each gets half.', longWay: `180 − ${apex} = ${180 - apex}\n${180 - apex} ÷ 2 = ${base}°`, resultText: `x = ${base}°`, expr: `${180 - apex} ÷ 2`, isAnswer: true }),
        ],
      };
    }
    const a = rand(35, 80), b = rand(35, 80), c = 180 - a - b;
    const { A, B, C } = triPts(a, b);
    if (kind === 'sum') {
      const d = free({ pts: { A, B, C }, hide: ['A', 'B', 'C'], lines: [['A', 'B'], ['B', 'C'], ['C', 'A']],
        angles: [{ at: 'A', from: 'B', to: 'C', t: `${a}°` }, { at: 'B', from: 'A', to: 'C', t: `${b}°` }, { at: 'C', from: 'A', to: 'B', t: 'x', kind: 'unknown' }] });
      return {
        subject: 'y7ang', sig: `ts:${a},${b}`, given: 'Find the missing angle x in the triangle.', diagram: d.svg, answer: `${c}°`, geo: d.geo,
        steps: [
          reasonStep('fact', 'tri', 'Which fact do you need?', ['tri', 'quad', 'line', 'point']),
          nStep({ key: 'known', prompt: `Add the two angles you know: ${a} + ${b} = ?`, answer: a + b, hint: `${a} + ${b} = ${a + b}.`, why: 'Total what you know first.', resultText: `${a + b}°`, expr: `${a} + ${b}` }),
          nStep({ key: 'x', prompt: `x = 180 − ${a + b} = ?`, answer: c, traps: { [360 - a - b]: 'Triangles add to 180°, not 360°.', [a + b]: 'That is the two you know. x is what is left.' },
            hint: `180 − ${a + b} = ${c}.`, why: RS.tri + '.', longWay: `${a} + ${b} = ${a + b}\nx = 180 − ${a + b} = ${c}°`, resultText: `x = ${c}°`, expr: `180 − ${a + b}`, isAnswer: true }),
        ],
      };
    }
    // exterior angle: extend the base past B
    const E = add(B, [70, 0]), ext = 180 - b;
    const d = free({ pts: { A, B, C, E }, hide: ['A', 'B', 'C', 'E'], lines: [['A', 'E'], ['B', 'C'], ['C', 'A']],
      angles: [{ at: 'A', from: 'B', to: 'C', t: `${a}°` }, { at: 'C', from: 'A', to: 'B', t: `${c}°` }, { at: 'B', from: 'E', to: 'C', t: 'x', kind: 'unknown' }, { at: 'B', from: 'A', to: 'C', t: 'y', kind: 'step' }] });
    return {
      subject: 'y7ang', sig: `te:${a},${c}`, given: 'The bottom side has been extended. Find the outside angle x.', diagram: d.svg, answer: `${ext}°`, geo: d.geo,
      steps: [
        oStep({ key: 'plan', prompt: 'x is outside the triangle. What do we find first?', options: ['y, the third angle inside the triangle', 'x straight away, by adding 180', 'The angle around the point'], answer: 'y, the third angle inside the triangle',
          wrong: { 'x straight away, by adding 180': 'There is no rule that links x to the two angles directly YET. Find y first: it sits next to x.', 'The angle around the point': 'x and y are on a straight line, not round a point.' },
          hint: 'y is inside the triangle and right next to x. Find y, then x.', why: 'A stepping-stone angle: y links to the triangle rule AND to x.', resultText: 'find y first' }),
        nStep({ key: 'y', prompt: `y = 180 − ${a} − ${c} = ?  (angles in a triangle)`, answer: b, traps: { [a + c]: `That is ${a} + ${c}. Take it away from 180.` },
          hint: `180 − ${a} − ${c} = ${b}.`, why: RS.tri + '.', resultText: `y = ${b}°`, expr: `180 − ${a} − ${c}` }),
        reasonStep('link', 'line', 'Now, how are x and y linked?', ['line', 'vert', 'tri', 'alt']),
        nStep({ key: 'x', prompt: `x = 180 − ${b} = ?`, answer: ext, traps: trapsFor('line', b, ext),
          hint: `180 − ${b} = ${ext}.`, why: `x and y sit on a straight line. Notice: x = ${a} + ${c}. The outside angle of a triangle always equals the two opposite inside angles added together.`,
          longWay: `y = 180 − ${a} − ${c} = ${b}° (triangle)\nx = 180 − ${b} = ${ext}° (straight line)\nShortcut: x = ${a} + ${c} = ${ext}°`, resultText: `x = ${ext}°`, expr: `180 − ${b}`, isAnswer: true }),
      ],
    };
  }

  /* ---- 4. Spot the pair: inside? same side? which letter? ---- */
  function parSpot() {
    const rel = pick(['corresponding', 'corresponding', 'alternate', 'cointerior']);
    const th = niceTheta(), phi = pick([0, 0, 0, -16, 18]);
    const [a, b] = pairOf(rel);
    const labels = { [a]: { t: 'p', kind: 'p', wedge: true }, [b]: { t: 'q', kind: 'q', wedge: true } };
    const d = parallel({ phi, theta: th, labels });
    const inside = rel === 'corresponding' ? 'One between them, one outside' : 'Both between the parallel lines';
    const rk = REL2[rel];
    const steps = [
      oStep({ key: 'where', prompt: 'Look at the gap between the two arrowed lines. Where are p and q?', options: ['Both between the parallel lines', 'One between them, one outside', 'Both outside the parallel lines'], answer: inside,
        wrong: { 'Both between the parallel lines': 'Look again: one of them is outside the gap (above the top line or below the bottom one).', 'One between them, one outside': 'Look again: both are in the gap between the two arrowed lines.', 'Both outside the parallel lines': rel === 'corresponding' ? 'One of them is inside the gap.' : 'Both are inside the gap between the arrowed lines.' },
        hint: '“Between” means in the gap between the two lines with arrows.', why: 'Alternate and co-interior angles are always BETWEEN the parallel lines. Corresponding angles are one in, one out.', resultText: inside.toLowerCase() }),
    ];
    if (rel === 'corresponding') {
      steps.push(oStep({ key: 'pos', prompt: 'Slide p along the slanted line to the other crossing. Does it land exactly on q?', options: ['Yes, same position', 'No, a different position'], answer: 'Yes, same position',
        wrong: { 'No, a different position': 'Check: both are on the same side of their parallel line and the same side of the slanted line. Same position.' },
        hint: 'Is q above-right (or below-left…) at its crossing, just like p at its crossing?', why: 'Angles in the same position at each crossing are corresponding.', resultText: 'same position at each crossing' }));
    } else {
      const same = rel === 'cointerior' ? 'Same side' : 'Opposite sides';
      steps.push(oStep({ key: 'side', prompt: 'Now look at the slanted line. Are p and q on the same side of it, or on opposite sides?', options: ['Same side', 'Opposite sides'], answer: same,
        wrong: { 'Same side': 'One is left of the slanted line and one is right: opposite sides.', 'Opposite sides': 'Both are on the same side of the slanted line.' },
        hint: 'Imagine standing on the slanted line. Are both angles on your left (or both on your right)?', why: 'Between the lines + same side = co-interior (C). Between the lines + opposite sides = alternate (Z).', resultText: same.toLowerCase() }));
    }
    steps.push(shapeStep('shape', rk, 'So which shape do p and q make?', 'p'));
    const finals = { corr: 'Corresponding, so they are equal', alt: 'Alternate, so they are equal', coint: 'Co-interior, so they add up to 180°' };
    const fopts = [finals.corr, finals.alt, finals.coint, 'Vertically opposite, so they are equal'];
    steps.push(oStep({ key: 'name', prompt: 'So p and q are…', options: fopts, answer: finals[rk],
      wrong: Object.fromEntries(fopts.filter((f) => f !== finals[rk]).map((f) => [f, `Not quite. p and q are ${WHERE[rk]}: ${RS[rk].toLowerCase()}.`])),
      hint: `${cap(SHAPE[rk])}.`, why: RS[rk] + '.', longWay: `p and q are ${WHERE[rk]}\n${RS[rk]}`, resultText: finals[rk], isAnswer: true }));
    return { subject: 'y7ang', sig: `sp:${a}${b}:${th}`, given: 'The arrowed lines are parallel. What kind of pair are p and q?', diagram: d.svg, answer: finals[rk], steps };
  }

  /* ---- 5–8. One rule: find x (corresponding / alternate / co-interior / mixed) ---- */
  function parOne(only) {
    const rel = only || pick(['corresponding', 'alternate', 'cointerior', 'vertical', 'straight', 'corresponding', 'alternate', 'cointerior']);
    const th = niceTheta(), phi = pick(PHIS);
    const [g, x] = pairOf(rel);
    const gv = valueOf(th, g), xv = valueOf(th, x), rk = REL2[rel];
    const d = parallel({ phi, theta: th, labels: { [g]: `${gv}°`, [x]: { t: 'x', kind: 'unknown' } } });
    const steps = [
      shapeStep('shape', rk, `Trace from the ${gv}° to x along the lines. What shape do they make?`, `${gv}°`),
      reasonStep('reason', rk, 'Which reason goes with that shape?'),
    ];
    if (EQUAL[rk]) {
      steps.push(nStep({ key: 'x', prompt: `They are equal. So x = ?`, answer: xv, traps: trapsFor(rk, gv, xv),
        hint: `x is the same as ${gv}°.`, why: RS[rk] + '.', longWay: `x and ${gv}° make ${SHAPE[rk]}\n${RS[rk]}\nx = ${xv}°`, resultText: `x = ${xv}°`, expr: `the same as ${gv}`, isAnswer: true }));
    } else {
      steps.push(nStep({ key: 'sum', prompt: `So x + ${gv} = ?`, answer: 180, traps: { 360: 'Not 360. They add up to 180°.', [gv]: 'They are not equal: they ADD UP to something.', 90: '90 is a right angle. These add to 180°.' },
        hint: 'They add up to 180°.', why: RS[rk] + '.', resultText: `x + ${gv} = 180`, expr: 'they add to 180' }));
      steps.push(nStep({ key: 'x', prompt: `x = 180 − ${gv} = ?`, answer: xv, traps: trapsFor(rk, gv, xv),
        hint: `180 − ${gv} = ${xv}.`, why: RS[rk] + '.', longWay: `x and ${gv}° make ${SHAPE[rk]}\n${RS[rk]}\nx = 180 − ${gv} = ${xv}°`, resultText: `x = ${xv}°`, expr: `180 − ${gv}`, isAnswer: true }));
    }
    return { subject: 'y7ang', sig: `p1:${g}${x}:${th}:${phi}`, given: 'The arrowed lines are parallel. Find x.', diagram: d.svg, answer: `${xv}°`, geo: d.geo, theta: th, steps };
  }

  /* ---- 9. Two steps: a stepping-stone angle y ---- */
  function parChain() {
    const th = niceTheta(), phi = pick([0, 0, 0, -15, 15]);
    const [g, x] = pairOf('twostep');
    const viaFirst = Math.random() < 0.5;
    const m = viaFirst ? g[0] + x.slice(1) : x[0] + g.slice(1);
    const gv = valueOf(th, g), mv = valueOf(th, m), xv = valueOf(th, x);
    const r1k = REL2[relation(g, m)], r2k = REL2[relation(m, x)];
    const d = parallel({ phi, theta: th, labels: { [g]: `${gv}°`, [m]: { t: 'y', kind: 'step' }, [x]: { t: 'x', kind: 'unknown' } } });
    return {
      subject: 'y7ang', sig: `ch:${g}${x}${m}:${th}`, given: 'The arrowed lines are parallel. Find x, using y as a stepping stone.', diagram: d.svg, answer: `${xv}°`, geo: d.geo, theta: th,
      steps: [
        oStep({ key: 'plan', prompt: `x and ${gv}° are not a simple pair (no F, Z, C or X joins them). What do we do?`, options: ['Find y first: it links to both', 'Copy the ' + gv + '° straight across', 'Do 180 − ' + gv + ' straight away'], answer: 'Find y first: it links to both',
          wrong: { ['Copy the ' + gv + '° straight across']: 'No rule joins x to that angle directly. Use the stepping stone y.', ['Do 180 − ' + gv + ' straight away']: 'That might be right by luck, but with no rule behind it you get no marks. Find y first.' },
          hint: 'y (purple) sits next to one of them and in a simple pair with the other.', why: 'When two angles are not a pair, find an angle that links to BOTH. One rule, one step at a time.', resultText: 'find y first' }),
        reasonStep('r1', r1k, `How is y linked to the ${gv}°?`),
        nStep({ key: 'y', prompt: `So y = ?`, answer: mv, traps: trapsFor(r1k, gv, mv), hint: EQUAL[r1k] ? `y = ${gv}°.` : `180 − ${gv} = ${mv}.`, why: RS[r1k] + '.', resultText: `y = ${mv}°`, expr: EQUAL[r1k] ? `the same as ${gv}` : `180 − ${gv}` }),
        reasonStep('r2', r2k, 'Now how is x linked to y?'),
        nStep({ key: 'x', prompt: `So x = ?`, answer: xv, traps: trapsFor(r2k, mv, xv), hint: EQUAL[r2k] ? `x = y = ${mv}°.` : `180 − ${mv} = ${xv}.`, why: RS[r2k] + '.',
          longWay: `y = ${mv}° (${RS[r1k].toLowerCase()})\nx = ${xv}° (${RS[r2k].toLowerCase()})`, resultText: `x = ${xv}°`, expr: EQUAL[r2k] ? `the same as ${mv}` : `180 − ${mv}`, isAnswer: true }),
      ],
    };
  }

  /* ---- 10. Triangles and parallel lines (sheet Q10–Q13, drawn to scale) ---- */
  const lineAt = (P, deg, L) => add(P, [L * Math.cos(deg * DEG), -L * Math.sin(deg * DEG)]);
  function stage(key, rule, valueQ, value, given, hint, pool) {
    return [
      reasonStep('r-' + key, rule, `Which fact finds ${valueQ}?`, pool || ['corr', 'alt', 'coint', 'vert', 'line', 'tri', 'iso']),
      nStep({ key: 'v-' + key, prompt: `So ${valueQ} = ?`, answer: value, traps: given != null ? trapsFor(rule, given, value) : {}, hint, why: RS[rule] + '.', resultText: `${valueQ} = ${value}°`, expr: hint.replace(/\.$/, '') }),
    ];
  }
  function parTriangle() {
    const kind = pick(['between', 'cut', 'iso', 'bow']);
    if (kind === 'between') {
      const al = rand(52, 80), be = rand(46, 76), h = 130, yB = 190, gx = 110;
      const D = [gx + h / Math.tan(al * DEG), yB - h], G_ = [gx, yB], H_ = [D[0] + h / Math.tan(be * DEG), yB];
      const right = H_[0] + 70;
      const d = free({ pts: { C: [20, yB - h], E: [right, yB - h], F: [20, yB], I: [right, yB], D, G: G_, H: H_ }, lines: [['C', 'E'], ['F', 'I'], ['D', 'G'], ['D', 'H']], arrows: [['C', 'E', 1, 0.88], ['F', 'I', 1, 0.88]],
        angles: [{ at: 'D', from: 'E', to: 'H', t: `${be}°` }, { at: 'G', from: 'F', to: 'D', t: `${180 - al}°` }, { at: 'D', from: 'G', to: 'H', t: 'x', kind: 'unknown' }],
        labels: { C: [-1, 0], E: [1, 0], F: [-1, 0], I: [1, 0], D: [0, -1], G: [0, 1], H: [0, 1] } });
      const x = 180 - al - be;
      return { subject: 'y7ang', sig: `tb:${al},${be}`, given: 'CE and FI are parallel. Find x, the angle GDH, one fact at a time.', diagram: d.svg, answer: `${x}°`, geo: d.geo,
        steps: [...stage('dgh', 'line', '∠DGH', al, 180 - al, `180 − ${180 - al} = ${al}.`), ...stage('dhg', 'alt', '∠DHG', be, be, `∠DHG and ∠EDH make a Z, so ${be}°.`),
          reasonStep('r-x', 'tri', 'Now triangle DGH: which fact finds x?', ['tri', 'quad', 'line', 'alt']),
          nStep({ key: 'x', prompt: `x = 180 − ${al} − ${be} = ?`, answer: x, traps: { [180 - al]: `Take BOTH angles away: 180 − ${al} − ${be}.`, [180 - be]: `Take BOTH angles away: 180 − ${al} − ${be}.` },
            hint: `180 − ${al} − ${be} = ${x}.`, why: RS.tri + '.', longWay: `∠DGH = ${al}° (straight line)\n∠DHG = ${be}° (alternate)\nx = 180 − ${al} − ${be} = ${x}° (triangle)`, resultText: `x = ${x}°`, expr: `180 − ${al} − ${be}`, isAnswer: true })] };
    }
    if (kind === 'cut') {
      const ga = rand(52, 74), de = rand(52, 74), a = 180 - ga - de, V = [190, 30], yB = 210, yM = 116;
      const C = [V[0] - (yB - V[1]) / Math.tan(ga * DEG), yB], D = [V[0] + (yB - V[1]) / Math.tan(de * DEG), yB];
      const X = [V[0] - (yM - V[1]) / Math.tan(ga * DEG), yM], B = [V[0] + (yM - V[1]) / Math.tan(de * DEG), yM], A = [X[0] - 90, yM];
      const d = free({ pts: { V, C, D, X, B, A }, hide: ['V', 'X'], lines: [['V', 'C'], ['V', 'D'], ['C', 'D'], ['A', 'B']], arrows: [['A', 'B', 1, 0.62], ['C', 'D', 1, 0.5]],
        angles: [{ at: 'V', from: 'C', to: 'D', t: `${a}°` }, { at: 'X', from: 'A', to: 'V', t: `${180 - ga}°` }, { at: 'X', from: 'B', to: 'V', t: 'y', kind: 'step' }, { at: 'B', from: 'X', to: 'V', t: 'z', kind: 'step' }, { at: 'D', from: 'C', to: 'V', t: 'x', kind: 'unknown' }],
        labels: { A: [-1, 0], B: [1, 0], C: [-1, 0.4], D: [1, 0.4] } });
      return { subject: 'y7ang', sig: `tc:${ga},${de}`, given: 'AB is parallel to CD. Find x, one fact at a time.', diagram: d.svg, answer: `${de}°`, geo: d.geo,
        steps: [...stage('y', 'line', 'y', ga, 180 - ga, `180 − ${180 - ga} = ${ga}.`), ...stage('z', 'tri', 'z', de, null, `180 − ${a} − ${ga} = ${de}.`),
          reasonStep('r-x', 'corr', 'z and x: which fact links them?'),
          nStep({ key: 'x', prompt: `So x = ?`, answer: de, traps: trapsFor('corr', de, de), hint: `x = z = ${de}°.`, why: RS.corr + '.',
            longWay: `y = 180 − ${180 - ga} = ${ga}° (straight line)\nz = 180 − ${a} − ${ga} = ${de}° (triangle)\nx = z = ${de}° (corresponding)`, resultText: `x = ${de}°`, expr: `the same as z`, isAnswer: true })] };
    }
    if (kind === 'iso') {
      const e = 2 * rand(12, 40), base = (180 - e) / 2, b = rand(80, 100), E = [210, 215];
      const C = lineAt(E, b + e / 2, 150), D = lineAt(E, b - e / 2, 150), F = add(E, mul(unit(sub(D, C)), -190));
      const d = free({ pts: { C, D, E, F }, lines: [['C', 'D'], ['D', 'E'], ['E', 'C'], ['F', 'E']], arrows: [['C', 'D', 1, 0.55], ['F', 'E', 1, 0.45]], ticks: [['C', 'E', 1], ['D', 'E', 1]],
        angles: [{ at: 'E', from: 'C', to: 'D', t: `${e}°` }, { at: 'E', from: 'F', to: 'C', t: 'x', kind: 'unknown' }] });
      return { subject: 'y7ang', sig: `tiso:${e}:${b}`, given: 'Triangle CDE is isosceles (CE = DE) and CD is parallel to FE. Find x.', diagram: d.svg, answer: `${base}°`, geo: d.geo,
        steps: [
          oStep({ key: 'eq', prompt: 'CE = DE. Which two angles of the triangle are equal?', options: ['∠ECD and ∠EDC', '∠CED and ∠ECD', '∠CED and ∠EDC'], answer: '∠ECD and ∠EDC',
            wrong: { '∠CED and ∠ECD': '∠CED is the top angle (between the two equal sides). The equal ones are at C and D.', '∠CED and ∠EDC': '∠CED is the top angle. The equal ones are at C and D.' },
            hint: 'The equal angles are at the ends of the third side, CD.', why: RS.iso + '.', resultText: '∠ECD = ∠EDC' }),
          nStep({ key: 'both', prompt: `The two base angles share 180 − ${e} = ?`, answer: 180 - e, hint: `180 − ${e} = ${180 - e}.`, why: RS.tri + '.', resultText: `${180 - e}° between them`, expr: `180 − ${e}` }),
          nStep({ key: 'base', prompt: `So ∠ECD = ${180 - e} ÷ 2 = ?`, answer: base, traps: { [180 - e]: 'That is both together. Halve it.', [e]: 'That is the top angle.' }, hint: `${180 - e} ÷ 2 = ${base}.`, why: RS.iso + '.', resultText: `∠ECD = ${base}°`, expr: `${180 - e} ÷ 2` }),
          reasonStep('r-x', 'alt', 'x and ∠ECD: which fact links them?'),
          nStep({ key: 'x', prompt: 'So x = ?', answer: base, traps: trapsFor('alt', base, base), hint: `x = ∠ECD = ${base}°.`, why: RS.alt + '.',
            longWay: `∠ECD = (180 − ${e}) ÷ 2 = ${base}° (isosceles)\nx = ∠ECD = ${base}° (alternate)`, resultText: `x = ${base}°`, expr: 'the same as ∠ECD', isAnswer: true }),
        ] };
    }
    // bow-tie
    let t = rand(70, 118), q = rand(32, 66), x = 180 - t - q;
    if (x < 20) { t -= 20; x += 20; }
    const T = [180, 120], a0 = rand(150, 172), dP = [Math.cos(a0 * DEG), -Math.sin(a0 * DEG)], dQ = [Math.cos((a0 + t) * DEG), -Math.sin((a0 + t) * DEG)];
    const TP = 130, TQ = TP * Math.sin(x * DEG) / Math.sin(q * DEG), P = add(T, mul(dP, TP)), Q = add(T, mul(dQ, TQ));
    const S = add(T, mul(dP, -TP * 0.78)), R = add(T, mul(dQ, -TQ * 0.78));
    const d = free({ pts: { P, Q, R, S, T }, hide: ['T'], lines: [['P', 'S'], ['R', 'Q'], ['P', 'Q'], ['R', 'S']], arrows: [['P', 'Q', 1, 0.5], ['R', 'S', 1, 0.5]],
      angles: [{ at: 'T', from: 'P', to: 'Q', t: `${t}°` }, { at: 'Q', from: 'P', to: 'T', t: `${q}°` }, { at: 'S', from: 'R', to: 'T', t: 'x', kind: 'unknown' }] });
    return { subject: 'y7ang', sig: `bow:${t},${q}`, given: 'PQ and RS are parallel; PS and QR are straight lines. Find x.', diagram: d.svg, answer: `${x}°`, geo: d.geo,
      steps: [...stage('r', 'alt', '∠SRQ', q, q, `∠SRQ and ∠RQP make a Z, so ${q}°.`), ...stage('t', 'vert', 'the angle at the crossing inside triangle RST', t, t, `It is across the X from ${t}°, so ${t}°.`),
        reasonStep('r-x', 'tri', 'Now triangle RST: which fact finds x?', ['tri', 'quad', 'line', 'alt']),
        nStep({ key: 'x', prompt: `x = 180 − ${q} − ${t} = ?`, answer: x, traps: { [180 - t]: `Take BOTH away: 180 − ${q} − ${t}.`, [180 - q]: `Take BOTH away: 180 − ${q} − ${t}.` },
          hint: `180 − ${q} − ${t} = ${x}.`, why: RS.tri + '.', longWay: `∠SRQ = ${q}° (alternate)\ncrossing angle = ${t}° (vertically opposite)\nx = 180 − ${q} − ${t} = ${x}° (triangle)`, resultText: `x = ${x}°`, expr: `180 − ${q} − ${t}`, isAnswer: true })] };
  }

  /* ---- 11. Are the lines parallel? (the rules backwards, sheet Q9) ---- */
  function parConverse() {
    const p = rand(62, 118), yes = Math.random() < 0.5;
    const q = yes ? 180 - p : 180 - p + pick([-4, -3, -2, 2, 3, 4]), s = p + q;
    const D = [110, 200], E = [270, 200];
    const d = free({ pts: { C: lineAt(D, p, 140), D, E, F: lineAt(E, 180 - q, 140) }, lines: [['D', 'C'], ['D', 'E'], ['E', 'F']],
      angles: [{ at: 'D', from: 'C', to: 'E', t: `${p}°` }, { at: 'E', from: 'D', to: 'F', t: `${q}°` }], labels: { D: [-0.6, 0.8], E: [0.6, 0.8] }, note: 'Not drawn accurately' });
    const yesT = `Yes: co-interior angles that add up to 180° mean the lines are parallel`, noT = `No: they add up to ${s}°, not 180°`;
    const opts = [yesT, noT, 'Yes: they look parallel', 'No: the two angles are different sizes'];
    return {
      subject: 'y7ang', sig: `cv:${p},${q}`, given: 'Are CD and EF parallel? Work it out from the angles.', diagram: d.svg, answer: yes ? 'parallel' : 'not parallel',
      steps: [
        shapeStep('shape', 'coint', 'If CD and EF were parallel, what pair would the two angles be?', `${p}°`),
        oStep({ key: 'rule', prompt: 'So, if the lines ARE parallel, the two angles must…', options: ['add up to exactly 180°', 'be equal', 'add up to 360°'], answer: 'add up to exactly 180°',
          wrong: { 'be equal': 'Co-interior angles are not equal; they add up to 180°.', 'add up to 360°': '360° is round a point. Co-interior angles add to 180°.' },
          hint: RS.coint + '.', why: 'The rule works backwards too: if co-interior angles add to exactly 180°, the lines ARE parallel. If not, they are not.', resultText: 'they must add up to 180°' }),
        nStep({ key: 'sum', prompt: `Add them: ${p} + ${q} = ?`, answer: s, hint: `${p} + ${q} = ${s}.`, why: 'Now compare with 180.', resultText: `${p} + ${q} = ${s}`, expr: `${p} + ${q}` }),
        oStep({ key: 'verdict', prompt: 'So are CD and EF parallel?', options: opts, answer: yes ? yesT : noT,
          wrong: { [yes ? noT : yesT]: `${p} + ${q} = ${s}. ${yes ? 'That IS 180, so they are parallel.' : 'That is NOT 180, so they are not parallel.'}`, 'Yes: they look parallel': 'Never trust the picture: diagrams are not drawn accurately. Use the angles.', 'No: the two angles are different sizes': 'Co-interior angles are SUPPOSED to be different (one small, one big). What matters is whether they add to 180°.' },
          hint: `${s} ${yes ? '=' : '≠'} 180.`, why: 'Use the angle fact, never the look of the diagram.', longWay: `${p} + ${q} = ${s}\n${yes ? 'Co-interior angles add up to 180°, so the lines are parallel' : 'Not 180°, so the lines are not parallel'}`, resultText: yes ? 'parallel' : 'not parallel', isAnswer: true }),
      ],
    };
  }

  /* ---- 12. Algebra: write the equation, solve it (sheet Q16) ---- */
  const ex = (a, b) => `${a === 1 ? '' : a}x${b > 0 ? ' + ' + b : b < 0 ? ' − ' + (-b) : ''}`;
  function parAlgebra() {
    const th = niceTheta(), phi = pick([0, 0, -62, 18]), supp = Math.random() < 0.4;
    const rels = supp ? ['cointerior', 'straight'] : ['corresponding', 'alternate', 'vertical'];
    const [g, x] = pairOf(pick(rels));
    const v1 = valueOf(th, g), v2 = valueOf(th, x);
    let a, c, x0, b, dd, n = 0;
    do { a = rand(3, 9); c = rand(1, a - 1); x0 = rand(5, 30); b = v1 - a * x0; dd = v2 - c * x0; n++; }
    while ((Math.abs(b) > 90 || Math.abs(dd) > 90 || b === 0 || dd === 0 || (!supp && dd - b <= 0)) && n < 500);
    if (n >= 500) return parAlgebra();
    const e1 = ex(a, b), e2 = ex(c, dd), rk = REL2[relation(g, x)];
    const d = parallel({ phi, theta: th, labels: { [g]: `${e1}°`, [x]: `${e2}°` } });
    const linkOpts = ['They are equal (F, Z or X)', 'They add up to 180° (C or straight line)', 'They add up to 360°'];
    const eqs = [`${e1} = ${e2}`, `${e1} + ${e2} = 180`, `${e1} + ${e2} = 360`];
    const steps = [
      oStep({ key: 'link', prompt: 'How are the two angles linked?', options: linkOpts, answer: linkOpts[supp ? 1 : 0],
        wrong: { [linkOpts[supp ? 0 : 1]]: `Look again: they are ${WHERE[rk]}. ${RS[rk]}.`, [linkOpts[2]]: '360 is for angles round a point. Pairs on parallel lines are equal or add to 180°.' },
        hint: `They are ${WHERE[rk]}.`, why: RS[rk] + '.', resultText: supp ? 'they add up to 180°' : 'they are equal' }),
      oStep({ key: 'eq', prompt: 'So which equation is true?', options: eqs, answer: eqs[supp ? 1 : 0],
        wrong: { [eqs[supp ? 0 : 1]]: supp ? 'They are not equal, they add to 180°.' : 'They are equal: put one expression = the other.', [eqs[2]]: 'Not 360.' },
        hint: supp ? 'Add them and set equal to 180.' : 'Equal angles: left expression = right expression.', why: 'Turn the angle fact into an equation, then solve it the way you solve any equation.', resultText: eqs[supp ? 1 : 0] }),
    ];
    if (!supp) {
      steps.push(nStep({ key: 'x-terms', prompt: `Take ${c}x from both sides. How many x are left on the left?  (?x ${b > 0 ? '+ ' + b : '− ' + (-b)} = ${dd})`, answer: a - c, traps: { [a + c]: `Taking ${c}x AWAY: ${a} − ${c}.`, [a]: `You still need to take the ${c}x away.` },
        hint: `${a}x − ${c}x = ${a - c}x.`, why: 'Get all the x terms on one side.', resultText: `${a - c}x ${b > 0 ? '+ ' + b : '− ' + (-b)} = ${dd}`, expr: `${a} − ${c}` }));
      steps.push(nStep({ key: 'num', prompt: `Now ${b > 0 ? 'take ' + b + ' from' : 'add ' + (-b) + ' to'} both sides: ${a - c}x = ?`, answer: dd - b, traps: { [dd + b]: `Do the opposite of ${b > 0 ? '+' + b : '−' + (-b)}.` },
        hint: `${dd} ${b > 0 ? '− ' + b : '+ ' + (-b)} = ${dd - b}.`, why: 'Get the numbers on the other side, doing the opposite operation.', resultText: `${a - c}x = ${dd - b}`, expr: `${dd} ${b > 0 ? '− ' + b : '+ ' + (-b)}` }));
      steps.push(nStep({ key: 'x', prompt: `x = ${dd - b} ÷ ${a - c} = ?`, answer: x0, hint: `${dd - b} ÷ ${a - c} = ${x0}.`, why: 'Divide by the number in front of x.',
        longWay: `${e1} = ${e2}\n${a - c}x ${b > 0 ? '+ ' + b : '− ' + (-b)} = ${dd}\n${a - c}x = ${dd - b}\nx = ${x0}\nCheck: both angles are ${v1}°`, resultText: `x = ${x0}`, expr: `${dd - b} ÷ ${a - c}`, isAnswer: true }));
    } else {
      steps.push(nStep({ key: 'x-terms', prompt: `Collect the x terms: ${a}x + ${c}x = ?x`, answer: a + c, traps: { [a - c]: 'ADD them: both are on the same side.', [a * c]: 'Add, don’t multiply.' }, hint: `${a} + ${c} = ${a + c}.`, why: 'Like terms add together.', resultText: `${a + c}x`, expr: `${a} + ${c}` }));
      const nb = b + dd;
      steps.push(nStep({ key: 'num', prompt: `${a + c}x ${nb >= 0 ? '+ ' + nb : '− ' + (-nb)} = 180. So ${a + c}x = ?`, answer: 180 - nb, traps: { [180 + nb]: `Do the opposite of ${nb >= 0 ? '+' + nb : '−' + (-nb)}.` },
        hint: `180 ${nb >= 0 ? '− ' + nb : '+ ' + (-nb)} = ${180 - nb}.`, why: 'Numbers to the other side, opposite operation.', resultText: `${a + c}x = ${180 - nb}`, expr: `180 ${nb >= 0 ? '− ' + nb : '+ ' + (-nb)}` }));
      steps.push(nStep({ key: 'x', prompt: `x = ${180 - nb} ÷ ${a + c} = ?`, answer: x0, hint: `${180 - nb} ÷ ${a + c} = ${x0}.`, why: 'Divide by the number in front of x.',
        longWay: `${e1} + ${e2} = 180\n${a + c}x ${nb >= 0 ? '+ ' + nb : '− ' + (-nb)} = 180\n${a + c}x = ${180 - nb}\nx = ${x0}\nCheck: ${v1}° + ${v2}° = 180°`, resultText: `x = ${x0}`, expr: `${180 - nb} ÷ ${a + c}`, isAnswer: true }));
    }
    return { subject: 'y7ang', sig: `al:${e1}|${e2}`, given: 'The arrowed lines are parallel. Work out x.', diagram: d.svg, answer: `x = ${x0}`, algebra: { g, x, a, b, c, d: dd, x0, theta: th }, steps };
  }

  /* ======================================================================== SHAPES */
  function makeShape(type) {
    let s, w, h, a, t, b, o, hw;
    switch (type) {
      case 'square': return [[0, 0], [4, 0], [4, 4], [0, 4]];
      case 'rectangle': w = rand(6, 7); h = rand(3, 4); return [[0, 0], [w, 0], [w, h], [0, h]];
      case 'rhombus': s = 4; a = pick([55, 60, 65, 70]) * DEG; return [[0, 0], [s, 0], [s + s * Math.cos(a), s * Math.sin(a)], [s * Math.cos(a), s * Math.sin(a)]];
      case 'parallelogram': w = 6; s = rand(3, 4); a = pick([55, 60, 65, 70]) * DEG; return [[0, 0], [w, 0], [w + s * Math.cos(a), s * Math.sin(a)], [s * Math.cos(a), s * Math.sin(a)]];
      // the side corners are right angles when hw² = t × b; keep well clear so "a kite has no right angles" holds for the one drawn
      case 'kite': do { hw = rand(25, 32) / 10; t = rand(13, 20) / 10; b = rand(42, 52) / 10; } while (Math.abs(hw * hw - t * b) < 0.6 || Math.abs(t + b - 2 * hw) < 0.6); return [[0, t], [-hw, 0], [0, -b], [hw, 0]];
      case 'arrowhead': hw = rand(25, 30) / 10; return [[0, 4.4], [-hw, -1.6], [0, rand(2, 8) / 10], [hw, -1.6]];
      case 'trapezium': b = 7; t = rand(3, 4); h = 3; o = pick([0.6, 1, 2.6]);  // never 0 or 7 − t (right angles), never (7 − t) ÷ 2 (isosceles)
      return [[0, 0], [b, 0], [o + t, h], [o, h]];
      case 'isotrap': b = 7; t = rand(3, 4); h = 3; return [[0, 0], [b, 0], [(b + t) / 2, h], [(b - t) / 2, h]];
      case 'righttrap': b = rand(6, 7); t = rand(3, 4); h = 3.4; return [[0, 0], [b, 0], [t, h], [0, h]];
    }
    throw new Error('shape ' + type);
  }
  const NAME = { isotrap: 'trapezium', righttrap: 'trapezium' };
  const nameOf = (type) => NAME[type] || type;
  function rotate(pts, deg) { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return pts.map((p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]); }
  function toScreen(pts, Wd, H, pad) { const fl = pts.map((p) => [p[0], -p[1]]); return fl.map(fitter(fl, Wd, H, pad == null ? 34 : pad)); }
  function onScreen(type, rot, Wd, H) { let p = makeShape(type); if (rot) p = rotate(p, rot); return toScreen(p, Wd || 320, H || 210); }

  /* facts measured off the drawing itself, so what we ask always matches what is drawn */
  const REF = [[0, 3, 2, 1], [2, 1, 0, 3], [1, 0, 3, 2], [3, 2, 1, 0]], ROT = [[1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
  function facts(P) {
    const d2 = (a, b) => dot(sub(a, b), sub(a, b));
    let big = 0; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) big = Math.max(big, d2(P[i], P[j]));
    const eps = big * 1e-4, eq = (a, b) => Math.abs(a - b) <= eps;
    const keeps = (pm) => { for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (!eq(d2(P[i], P[j]), d2(P[pm[i]], P[pm[j]]))) return false; return true; };
    const S = [0, 1, 2, 3].map((i) => sub(P[(i + 1) % 4], P[i])), L = S.map((s) => dot(s, s));
    const par = (a, b) => Math.abs(cross(a, b)) <= 0.01 * len(a) * len(b), perp = (a, b) => Math.abs(dot(a, b)) <= 0.01 * len(a) * len(b);
    const parallelPairs = (par(S[0], S[2]) ? 1 : 0) + (par(S[1], S[3]) ? 1 : 0);
    const rights = [0, 1, 2, 3].filter((i) => perp(S[i], S[(i + 3) % 4])).length;
    const allEq = eq(L[0], L[1]) && eq(L[1], L[2]) && eq(L[2], L[3]);
    const oppEq = eq(L[0], L[2]) && eq(L[1], L[3]), adjEq = (eq(L[0], L[1]) && eq(L[2], L[3])) || (eq(L[1], L[2]) && eq(L[3], L[0]));
    const cr = S.map((s, i) => cross(s, S[(i + 1) % 4]));
    const convex = cr.every((c) => c > 0) || cr.every((c) => c < 0);
    const d1 = sub(P[2], P[0]), d2v = sub(P[3], P[1]);
    const X = intersect(P[0], d1, P[1], d2v);
    const bisect = eq(d2(P[0], X), d2(P[2], X)) && eq(d2(P[1], X), d2(P[3], X));
    const axes = [[P[0], P[2]], [P[1], P[3]], [mid(P[0], P[1]), mid(P[2], P[3])], [mid(P[1], P[2]), mid(P[3], P[0])]];
    const lines = REF.map(keeps);
    return { parallelPairs, rights, allEq, oppEq, adjEq, convex, diagEq: eq(dot(d1, d1), dot(d2v, d2v)), diagPerp: perp(d1, d2v), bisect,
      lines: lines.filter(Boolean).length, axes: axes.map((a, k) => ({ a: a[0], b: a[1], ok: lines[k] })), rot: 1 + ROT.filter(keeps).length };
  }
  function classify(P) {
    const f = facts(P);
    if (!f.convex) return f.adjEq ? 'arrowhead' : 'concave';
    if (f.parallelPairs === 2) return f.allEq ? (f.rights ? 'square' : 'rhombus') : (f.rights ? 'rectangle' : 'parallelogram');
    if (f.parallelPairs === 1) return 'trapezium';
    return f.adjEq ? 'kite' : 'irregular';
  }
  /* screen polygon with marks */
  function quadSVG(P, o) {
    o = o || {};
    const K = new Kit(o.w || 320, o.h || 210), n = P.length;
    const S = [], L = [];
    for (let i = 0; i < n; i++) { S.push(sub(P[(i + 1) % n], P[i])); L.push(len(S[i])); }
    if (o.diagonals) { K.line(P[0], P[2], { col: '#6b7c8c', w: 1.8, dash: '5 5' }); K.line(P[1], P[3], { col: '#6b7c8c', w: 1.8, dash: '5 5' }); }
    K.poly(P);
    (o.mirrors || []).forEach((m) => { const d = unit(sub(m.b, m.a)); K.line(add(m.a, mul(d, -400)), add(m.a, mul(d, 400)), { col: m.col || '#d35400', w: 2.4, dash: '8 6' }); if (m.label) K.text(add(m.a, mul(d, m.at || -0)), m.label, m.col || '#d35400'); });
    if (o.marks !== false) {
      const tol = Math.max(...L) * 0.012, grp = []; let g = 0;
      for (let i = 0; i < n; i++) {
        if (grp[i] != null) continue;
        const mem = [i]; for (let j = i + 1; j < n; j++) if (grp[j] == null && Math.abs(L[i] - L[j]) <= tol) mem.push(j);
        if (mem.length > 1) { g++; mem.forEach((m) => { grp[m] = g; }); } else grp[i] = 0;
      }
      for (let i = 0; i < n; i++) if (grp[i]) K.ticks(add(P[i], mul(S[i], 0.36)), S[i], grp[i]);
      if (n === 4) {
        let pc = 0;
        [[0, 2], [1, 3]].forEach((pr) => {
          const a = S[pr[0]], b = S[pr[1]];
          if (Math.abs(cross(a, b)) <= 0.012 * len(a) * len(b)) { pc++; const e = dot(a, b) < 0 ? mul(b, -1) : b; K.chevron(add(P[pr[0]], mul(a, 0.62)), a, pc); K.chevron(add(P[pr[1]], mul(S[pr[1]], 0.62)), e, pc); }
        });
      }
      for (let i = 0; i < n; i++) { const a = S[(i + n - 1) % n], b = S[i]; if (Math.abs(dot(a, b)) <= 0.012 * len(a) * len(b)) K.right(P[i], P[(i + n - 1) % n], P[(i + 1) % n]); }
    }
    (o.angles || []).forEach((a) => K.angle(P[a.i], P[(a.i + n - 1) % n], P[(a.i + 1) % n], { label: a.t, kind: a.kind || 'given' }));
    return { svg: K.svg(o.note), geo: K.geo };
  }
  const SHAPES7 = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'arrowhead'];
  const PROPS = {
    square: '4 equal sides, 4 right angles, 2 pairs of parallel sides',
    rectangle: '4 right angles, opposite sides equal, 2 pairs of parallel sides',
    rhombus: '4 equal sides, opposite angles equal, 2 pairs of parallel sides, no right angles',
    parallelogram: 'opposite sides equal and parallel (2 pairs), opposite angles equal, no right angles',
    kite: '2 pairs of equal sides next to each other, no parallel sides',
    trapezium: 'exactly 1 pair of parallel sides',
    arrowhead: '2 pairs of equal sides next to each other, and one angle bigger than 180° (it is “pushed in”)',
  };
  function nameStep(correct, extra) {
    const wrong = {};
    SHAPES7.forEach((s) => { if (s !== correct) wrong[s] = `A ${s} has ${PROPS[s]}. This shape has ${PROPS[correct]}: it is a ${correct}.`; });
    return oStep(Object.assign({ key: 'name', options: SHAPES7, answer: correct, wrong, hint: `${cap(PROPS[correct])}: ${correct}.`, why: `A ${correct}: ${PROPS[correct]}.`, resultText: `it is a ${correct}`, isAnswer: true }, extra));
  }

  /* ---- S1. Name it, step by step (the decision tree) ---- */
  function shapeTree() {
    const type = pick(['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'isotrap', 'righttrap', 'arrowhead', 'kite', 'parallelogram']);
    const P = onScreen(type, pick([0, 0, 0, 90]));
    const f = facts(P), nm = nameOf(type);
    const steps = [oStep({ key: 'par', prompt: 'Count the pairs of parallel sides (sides with matching arrows).', options: ['0', '1', '2'], answer: String(f.parallelPairs),
      wrong: { 0: 'Look for the little arrow marks: matching arrows mean a parallel pair.', 1: f.parallelPairs === 2 ? 'There are two sets of arrows (single and double): 2 pairs.' : 'Count the sets of matching arrows.', 2: 'Count the sets of matching arrows carefully.' },
      hint: 'One set of matching arrows = one pair of parallel sides.', why: 'Parallel sides point the same way and never meet. Arrows show which sides are parallel.', resultText: `${f.parallelPairs} pair${f.parallelPairs === 1 ? '' : 's'} of parallel sides` })];
    if (f.parallelPairs === 2) {
      steps.push(oStep({ key: 'sides', prompt: 'Look at the ticks. Are all four sides equal?', options: ['Yes, all four are equal', 'No, only opposite sides are equal'], answer: f.allEq ? 'Yes, all four are equal' : 'No, only opposite sides are equal',
        wrong: { 'Yes, all four are equal': 'Look at the ticks: there are single ticks AND double ticks, so only opposite sides match.', 'No, only opposite sides are equal': 'All four sides carry the same tick mark: all equal.' },
        hint: 'Same tick mark = same length.', why: 'Equal ticks mean equal lengths.', resultText: f.allEq ? 'all four sides equal' : 'opposite sides equal' }));
      steps.push(oStep({ key: 'right', prompt: 'Are the corners right angles (little squares)?', options: ['Yes, all 90°', 'No right angles'], answer: f.rights ? 'Yes, all 90°' : 'No right angles',
        wrong: { 'Yes, all 90°': 'There are no little squares in the corners: the shape is slanted.', 'No right angles': 'Look for the little squares in the corners: they are right angles.' },
        hint: 'A little square in a corner means 90°.', why: 'Right angles turn a parallelogram into a rectangle, and a rhombus into a square.', resultText: f.rights ? 'right angles' : 'no right angles' }));
    } else if (f.parallelPairs === 1) {
      steps.push(oStep({ key: 'one', prompt: 'Exactly one pair of parallel sides. Does it matter if it has right angles or equal slanted sides for its NAME?', options: ['No: one pair of parallel sides is always a trapezium', 'Yes: with right angles it is a rectangle'], answer: 'No: one pair of parallel sides is always a trapezium',
        wrong: { 'Yes: with right angles it is a rectangle': 'A rectangle has TWO pairs of parallel sides. One pair is a trapezium (a right-angled one here).' },
        hint: 'One pair of parallel sides = trapezium (it may be right-angled or isosceles).', why: 'Trapeziums come in kinds (isosceles, right-angled), but they are all trapeziums.', resultText: 'one pair: trapezium' }));
    } else {
      steps.push(oStep({ key: 'eq', prompt: 'Which sides are equal?', options: ['Two pairs, next to each other', 'Two pairs, opposite each other', 'All four', 'None'], answer: 'Two pairs, next to each other',
        wrong: { 'Two pairs, opposite each other': 'Opposite equal sides would make it a parallelogram. Here the equal sides meet at a corner.', 'All four': 'Look at the ticks: two different marks.', None: 'Look at the ticks: there are matching marks.' },
        hint: 'Single ticks meet at one corner, double ticks meet at the opposite corner.', why: 'Equal sides that are next to each other (adjacent) is the kite family.', resultText: 'two pairs of adjacent equal sides' }));
      steps.push(oStep({ key: 'dent', prompt: 'Does any corner point INWARDS (an angle bigger than 180°)?', options: ['Yes, it has a dent', 'No, every corner points out'], answer: f.convex ? 'No, every corner points out' : 'Yes, it has a dent',
        wrong: { 'Yes, it has a dent': 'Every corner points outwards here: no dent.', 'No, every corner points out': 'Look at the bottom (or top) corner: it is pushed in.' },
        hint: 'A dent makes an arrowhead; no dent is a kite.', why: 'A kite pushed in becomes an arrowhead (also called a delta).', resultText: f.convex ? 'no dent' : 'a dent' }));
    }
    steps.push(nameStep(nm, { prompt: 'So what is its name?', longWay: steps.map((s) => s.resultText).join('\n') + `\nso it is a ${nm}` }));
    return { subject: 'y7shape', sig: `tree:${type}:${P[0].map(Math.round)}`, given: 'Name this quadrilateral. Use the marks, one question at a time.', diagram: quadSVG(P).svg, answer: nm, steps };
  }

  /* ---- S2. Triangles: by sides, then by angles ---- */
  function triTypes() {
    const T = pick([
      { k: 'eq', a: 60, b: 60, s: 'equilateral', ang: 'all acute' }, { k: 'iso', a: 70, b: 70, s: 'isosceles', ang: 'all acute' },
      { k: 'isoR', a: 45, b: 45, s: 'isosceles', ang: 'right-angled' }, { k: 'isoO', a: 30, b: 30, s: 'isosceles', ang: 'obtuse' },
      { k: 'sc', a: 50, b: 70, s: 'scalene', ang: 'all acute' }, { k: 'scR', a: 90, b: 35, s: 'scalene', ang: 'right-angled' }, { k: 'scO', a: 25, b: 40, s: 'scalene', ang: 'obtuse' },
    ]);
    const { A, B, C } = triPts(T.a, T.b);
    const sides = [len(sub(B, A)), len(sub(C, B)), len(sub(A, C))];
    const eqPairs = [[0, 1], [1, 2], [0, 2]].filter(([i, j]) => Math.abs(sides[i] - sides[j]) < 0.5);
    const nEq = T.s === 'equilateral' ? 3 : T.s === 'isosceles' ? 2 : 0;
    const ticks = T.s === 'equilateral' ? [['A', 'B', 1], ['B', 'C', 1], ['C', 'A', 1]] : T.s === 'isosceles' ? (eqPairs.length ? eqPairs[0].map((i) => [['A', 'B'], ['B', 'C'], ['C', 'A']][i].concat([1])) : []) : [];
    const angs = [T.a, T.b, 180 - T.a - T.b];
    const rightAt = angs.indexOf(90);
    const d = free({ pts: { A, B, C }, hide: ['A', 'B', 'C'], lines: [['A', 'B'], ['B', 'C'], ['C', 'A']], ticks, rights: rightAt === 0 ? [['A', 'B', 'C']] : rightAt === 1 ? [['B', 'A', 'C']] : rightAt === 2 ? [['C', 'A', 'B']] : [] });
    const full = `${T.ang === 'right-angled' ? 'right-angled ' : T.ang === 'obtuse' ? 'obtuse ' : ''}${T.s} triangle`.replace('right-angled equilateral', 'equilateral');
    const fulls = ['equilateral triangle', 'isosceles triangle', 'scalene triangle', 'right-angled isosceles triangle', 'right-angled scalene triangle', 'obtuse isosceles triangle', 'obtuse scalene triangle'];
    return {
      subject: 'y7shape', sig: `tt:${T.k}`, given: 'Name this triangle: first by its sides, then by its angles.', diagram: d.svg, answer: full,
      steps: [
        oStep({ key: 'n', prompt: 'How many sides are marked equal?', options: ['3', '2', 'none'], answer: nEq ? String(nEq) : 'none',
          wrong: { 3: 'Count the sides with tick marks.', 2: 'Count the sides with tick marks.', none: 'Some sides carry matching ticks.' }, hint: 'Count the sides that carry the same tick mark.', why: 'Ticks show equal sides.', resultText: `${nEq || 'no'} equal sides` }),
        oStep({ key: 'bysides', prompt: 'So, by its sides, it is…', options: ['equilateral', 'isosceles', 'scalene'], answer: T.s,
          wrong: { equilateral: 'Equilateral means ALL THREE sides equal.', isosceles: 'Isosceles means exactly TWO sides equal.', scalene: 'Scalene means NO sides equal.' }, hint: '3 equal: equilateral. 2 equal: isosceles. None: scalene.', why: 'Equilateral = 3 equal sides (and 3 angles of 60°). Isosceles = 2 equal sides (and 2 equal angles). Scalene = all different.', resultText: T.s }),
        oStep({ key: 'byang', prompt: 'Now the angles. What is its biggest angle like?', options: ['all acute', 'right-angled', 'obtuse'], answer: T.ang,
          wrong: { 'all acute': 'Look for a right-angle square or a wide, blunt corner.', 'right-angled': 'There is no little square: no right angle.', obtuse: 'No corner is wider than a right angle.' }, hint: 'A little square = right angle. A corner wider than a square corner = obtuse.', why: 'Acute < 90°, right = 90°, obtuse between 90° and 180°. A triangle can have at most one right or obtuse angle.', resultText: T.ang }),
        oStep({ key: 'full', prompt: 'Put it together. Its full name is…', options: fulls, answer: full,
          wrong: Object.fromEntries(fulls.filter((x) => x !== full).map((x) => [x, `Sides: ${T.s}. Angles: ${T.ang}. So: ${full}.`])), hint: `${T.s} + ${T.ang}.`, why: 'Name the angle type first (if it is right or obtuse), then the side type.', longWay: `${nEq || 'no'} equal sides: ${T.s}\nbiggest angle: ${T.ang}\nso: ${full}`, resultText: full, isAnswer: true }),
      ],
    };
  }

  /* ---- S3. Diagonals: equal? cross at 90°? cut in half? ---- */
  function shapeDiag() {
    const type = pick(['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'isotrap']);
    const P = onScreen(type, 0), f = facts(P);
    const label = type === 'isotrap' ? 'isosceles trapezium' : type;
    const yn = (b) => (b ? 'Yes' : 'No');
    const opts = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'isosceles trapezium'];
    const DG = { square: 'equal, cross at 90°, cut each other in half', rectangle: 'equal, cut each other in half, but do not cross at 90°', rhombus: 'cross at 90° and cut each other in half, but are not equal',
      parallelogram: 'cut each other in half, but are not equal and do not cross at 90°', kite: 'cross at 90°, but only one is cut in half', 'isosceles trapezium': 'are equal, but do not cross at 90° or cut each other in half' };
    return {
      subject: 'y7shape', sig: `dg:${type}`, given: 'The dashed lines are the diagonals (corner to opposite corner). Investigate them.', diagram: quadSVG(P, { diagonals: true, marks: false }).svg, answer: label,
      steps: [
        oStep({ key: 'eq', prompt: 'Are the two diagonals the same length?', options: ['Yes', 'No'], answer: yn(f.diagEq), wrong: { [yn(!f.diagEq)]: f.diagEq ? 'Measure them: they are the same length.' : 'One is clearly longer than the other.' }, hint: f.diagEq ? 'They are the same length.' : 'One is longer.', why: 'Shapes with equal diagonals: square, rectangle, isosceles trapezium.', resultText: `diagonals ${f.diagEq ? 'equal' : 'not equal'}` }),
        oStep({ key: 'perp', prompt: 'Do they cross at a right angle (90°)?', options: ['Yes', 'No'], answer: yn(f.diagPerp), wrong: { [yn(!f.diagPerp)]: f.diagPerp ? 'They make four right angles where they cross.' : 'Where they cross the angles are not 90°: two are wider, two narrower.' }, hint: f.diagPerp ? 'Yes: four right angles where they cross.' : 'No.', why: 'Diagonals crossing at 90°: square, rhombus, kite.', resultText: `${f.diagPerp ? '' : 'not '}at 90°` }),
        oStep({ key: 'half', prompt: 'Do they cut EACH OTHER exactly in half?', options: ['Yes', 'No'], answer: yn(f.bisect), wrong: { [yn(!f.bisect)]: f.bisect ? 'The crossing point is the middle of both diagonals.' : 'The crossing point is not the middle of both of them.' }, hint: f.bisect ? 'Yes, the crossing is the middle of both.' : 'No, at least one is cut unevenly.', why: 'All the parallelogram family (parallelogram, rectangle, rhombus, square) have diagonals that cut each other in half.', resultText: `${f.bisect ? '' : 'not '}cut in half` }),
        oStep({ key: 'name', prompt: 'Which shape has diagonals like this?', options: opts, answer: label,
          wrong: Object.fromEntries(opts.filter((o) => o !== label).map((o) => [o, `A ${o}'s diagonals ${DG[o]}. These ${DG[label]}.`])), hint: `Equal: ${yn(f.diagEq)}. 90°: ${yn(f.diagPerp)}. Halved: ${yn(f.bisect)}.`,
          why: `A ${label}'s diagonals ${DG[label]}.`, longWay: `equal: ${yn(f.diagEq)}\nat 90°: ${yn(f.diagPerp)}\ncut in half: ${yn(f.bisect)}\nso: ${label}`, resultText: label, isAnswer: true }),
      ],
    };
  }

  /* ---- S4. Symmetry: test each line, then turn it ---- */
  function shapeSym() {
    const type = pick(['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'isotrap', 'trapezium', 'arrowhead', 'righttrap']);
    const P = onScreen(type, 0, 300, 200), f = facts(P);
    const labs = ['a', 'b', 'c', 'd'], cols = ['#1f6fd1', '#d35400', '#7d3cb5', '#0a7d34'];
    const mirrors = f.axes.map((ax, i) => ({ a: ax.a, b: ax.b, col: cols[i] }));
    const K = quadSVG(P, { w: 300, h: 200, marks: false, mirrors });
    let svg = K.svg;
    // label each candidate line near its end inside the box
    const lblSvg = f.axes.map((ax, i) => { const d = unit(sub(ax.b, ax.a)); let p = ax.a; for (let k = 0; k < 300 && p[0] > 12 && p[0] < 288 && p[1] > 12 && p[1] < 188; k++) p = add(p, mul(d, -1)); p = add(p, mul(d, 10)); return `<text x="${r1(p[0])}" y="${r1(p[1])}" font-size="15" font-weight="700" fill="${cols[i]}" text-anchor="middle" dominant-baseline="central" stroke="#fff" stroke-width="4" paint-order="stroke">${labs[i]}</text>`; }).join('');
    svg = svg.replace('</svg>', lblSvg + '</svg>');
    const nm = type === 'isotrap' ? 'isosceles trapezium' : type === 'righttrap' ? 'right-angled trapezium' : type;
    const steps = f.axes.map((ax, i) => oStep({ key: 'l' + i, prompt: `Fold along line ${labs[i]}. Would the two halves land exactly on top of each other?`, options: ['Yes, it is a mirror line', 'No'], answer: ax.ok ? 'Yes, it is a mirror line' : 'No',
      wrong: { 'Yes, it is a mirror line': `Picture folding along ${labs[i]}: the corners do not land on each other.`, No: `Picture folding along ${labs[i]}: every corner lands on a matching corner. It IS a mirror line.` },
      hint: ax.ok ? 'Yes: each side of the line is a mirror image of the other.' : 'No: the halves are not mirror images.', why: 'A line of symmetry folds a shape into two halves that match exactly.', resultText: `line ${labs[i]}: ${ax.ok ? 'mirror line' : 'not a mirror line'}` }));
    steps.push(nStep({ key: 'count', prompt: 'So how many lines of symmetry does it have?', answer: f.lines, traps: { 4: 'Count only the lines you said yes to.', 2: 'Count only the lines you said yes to.', 1: 'Count only the lines you said yes to.' },
      hint: `You said yes to ${f.lines}.`, why: 'Count the mirror lines.', resultText: `${f.lines} line${f.lines === 1 ? '' : 's'} of symmetry`, expr: 'the yes answers' }));
    const ro = ['1', '2', '3', '4'];
    steps.push(oStep({ key: 'rot', prompt: 'Now turn it round its centre. How many times does it fit its outline in one full turn (its order of rotational symmetry)?', options: ro, answer: String(f.rot),
      wrong: Object.fromEntries(ro.filter((r) => r !== String(f.rot)).map((r) => [r, r === '3' ? 'No quadrilateral has order 3.' : `Count the fits during one full turn, the start included: ${f.rot}.`])),
      hint: f.rot === 1 ? 'It only fits back at the start: order 1.' : f.rot === 2 ? 'It fits after a half turn, and at the start: order 2.' : 'It fits after every quarter turn: order 4.',
      why: 'Every shape fits at least once (when it gets back to the start), so the lowest order is 1.', longWay: `${f.lines} line${f.lines === 1 ? '' : 's'} of symmetry\nrotational symmetry of order ${f.rot}`, resultText: `order ${f.rot}`, isAnswer: true }));
    return { subject: 'y7shape', sig: `sym:${type}`, given: `This is a${/^[aeiou]/.test(nm) ? 'n' : ''} ${nm}. Test each dashed line, then turn it.`, diagram: svg, answer: `order ${f.rot}`, steps };
  }

  /* ---- S5. Which shape am I? Each clue crosses some out ---- */
  const DATA = {
    square: { par: 2, eq: true, right: true, lines: 4, rot: 4, diagEq: true, diagPerp: true },
    rectangle: { par: 2, eq: false, right: true, lines: 2, rot: 2, diagEq: true, diagPerp: false },
    rhombus: { par: 2, eq: true, right: false, lines: 2, rot: 2, diagEq: false, diagPerp: true },
    parallelogram: { par: 2, eq: false, right: false, lines: 0, rot: 2, diagEq: false, diagPerp: false },
    kite: { par: 0, eq: false, right: false, lines: 1, rot: 1, diagEq: false, diagPerp: true },
    trapezium: { par: 1, eq: false, right: false, lines: 0, rot: 1, diagEq: false, diagPerp: false },
  };
  const CLUES = [
    ['It has two pairs of parallel sides.', (d) => d.par === 2], ['It has exactly one pair of parallel sides.', (d) => d.par === 1], ['It has no parallel sides.', (d) => d.par === 0],
    ['All four sides are equal.', (d) => d.eq], ['Its sides are NOT all equal.', (d) => !d.eq], ['It has four right angles.', (d) => d.right], ['It has no right angles.', (d) => !d.right],
    ['Its diagonals are equal.', (d) => d.diagEq], ['Its diagonals are not equal.', (d) => !d.diagEq], ['Its diagonals cross at right angles.', (d) => d.diagPerp],
    ['It has rotational symmetry of order 2.', (d) => d.rot === 2], ['It has no lines of symmetry.', (d) => d.lines === 0], ['It has exactly two lines of symmetry.', (d) => d.lines === 2], ['It has at least one line of symmetry.', (d) => d.lines >= 1],
  ];
  function shapeClues() {
    const names = Object.keys(DATA);
    for (let tries = 0; tries < 300; tries++) {
      const target = pick(names);
      let cand = names.slice(); const used = [];
      for (let k = 0; k < 4 && cand.length > 1; k++) {
        const ok = CLUES.filter((c) => c[1](DATA[target]) && !used.includes(c) && cand.filter((n) => c[1](DATA[n])).length < cand.length);
        if (!ok.length) break;
        const c = pick(ok); used.push(c); cand = cand.filter((n) => c[1](DATA[n]));
        used[used.length - 1] = { c, cand: cand.slice() };
      }
      if (cand.length !== 1 || used.length < 2 || used[0].cand.length < 2) continue;
      const steps = [];
      let prev = names.slice();
      used.forEach((u, i) => {
        if (i === used.length - 1) return;
        const out = prev.filter((n) => !u.cand.includes(n));
        steps.push(chooseStep({ key: 'c' + i, prompt: `Clue ${i + 1}: “${u.c[0]}” Which shapes could it STILL be? Tap all of them.`, expected: u.cand, pool: prev,
          hint: `Keep: ${u.cand.join(', ')}. Cross out: ${out.join(', ')}.`, why: 'Test every shape against the clue. Any shape that fails even one clue is out for good.', resultText: `still possible: ${u.cand.join(', ')}`,
          diagnose: (sel) => { const bad = sel.filter((s) => !u.cand.includes(s)); const miss = u.cand.filter((s) => !sel.includes(s)); return say(bad.length ? `A ${bad[0]} does not fit “${u.c[0]}”. Untap it.` : `A ${miss[0]} also fits “${u.c[0]}”. Tap it too.`); } }));
        prev = u.cand;
      });
      const lastClue = used[used.length - 1];
      steps.push(oStep({ key: 'name', prompt: `Last clue: “${lastClue.c[0]}” So which shape is it?`, options: prev, answer: target,
        wrong: Object.fromEntries(prev.filter((n) => n !== target).map((n) => [n, `A ${n} does not fit “${lastClue.c[0]}”.`])), hint: `Only a ${target} fits every clue.`, why: 'The one shape left standing after every clue is the answer.',
        longWay: used.map((u, i) => `Clue ${i + 1}: ${u.c[0]} → ${u.cand.join(', ')}`).join('\n'), resultText: `it is a ${target}`, isAnswer: true }));
      return { subject: 'y7shape', sig: `cl:${target}:${used.map((u) => u.c[0]).join('|')}`, given: 'Which quadrilateral am I? Read one clue at a time and cross out the shapes that fail.', answer: target, steps };
    }
    return shapeClues();
  }

  /* ---- S6. Always, sometimes or never ---- */
  const ASN = [
    ['A square is a rectangle.', 'Always', 'Every square has four right angles and opposite sides equal: it passes every rectangle test.', null],
    ['A rectangle is a square.', 'Sometimes', 'A rectangle with all four sides equal is a square…', '…but a long thin rectangle is not.'],
    ['A rhombus is a square.', 'Sometimes', 'A rhombus with right angles is a square…', '…but a slanted rhombus is not.'],
    ['A parallelogram has a line of symmetry.', 'Sometimes', 'A rectangle or rhombus (special parallelograms) has lines of symmetry…', '…but an ordinary slanted parallelogram has none.'],
    ['A trapezium has a line of symmetry.', 'Sometimes', 'An isosceles trapezium has one…', '…but most trapeziums have none.'],
    ['A kite has two pairs of parallel sides.', 'Never', null, 'A kite’s equal sides meet at corners; none of its sides are parallel.'],
    ['A trapezium has rotational symmetry of order 2.', 'Never', null, 'A half turn would need two pairs of parallel sides; a trapezium has only one.'],
    ['A rhombus has four equal sides.', 'Always', 'That is what makes it a rhombus.', null],
    ['A quadrilateral’s angles add up to 360°.', 'Always', 'Any quadrilateral splits into two triangles: 2 × 180 = 360.', null],
    ['A triangle has two obtuse angles.', 'Never', null, 'Two angles over 90° already make more than 180°.'],
    ['An isosceles triangle has a right angle.', 'Sometimes', 'A right-angled isosceles triangle (45°, 45°, 90°) does…', '…but a 70°, 70°, 40° one does not.'],
    ['A parallelogram has opposite angles equal.', 'Always', 'Its opposite angles always match.', null],
    ['A rectangle’s diagonals cross at right angles.', 'Sometimes', 'When the rectangle is a square they do…', '…but in a long thin rectangle they cross at a slant.'],
    ['A kite has a line of symmetry.', 'Always', 'Every kite has one: through its top and bottom corners.', null],
  ];
  function shapeASN() {
    const [s, ans, yesEx, noEx] = pick(ASN);
    const subj = s.replace(/\.$/, '');
    const yes = ans !== 'Never', no = ans !== 'Always';
    return {
      subject: 'y7shape', sig: `asn:${s}`, given: `Always, sometimes or never? “${s}”`, answer: ans,
      steps: [
        oStep({ key: 'yes', prompt: `Can you find even ONE example where “${subj}” is true?`, options: ['Yes', 'No'], answer: yes ? 'Yes' : 'No', wrong: { Yes: `No such example exists. ${noEx}`, No: `There is one: ${yesEx}` }, hint: yes ? yesEx : noEx, why: 'Test examples: try a special case and an ordinary case.', resultText: yes ? 'yes, it can be true' : 'it is never true' }),
        oStep({ key: 'no', prompt: `Can you find even ONE example where it is FALSE?`, options: ['Yes', 'No'], answer: no ? 'Yes' : 'No', wrong: { Yes: `It is never false. ${yesEx}`, No: `There is one: ${noEx}` }, hint: no ? noEx : yesEx, why: 'One counter-example is enough to stop a statement being “always”.', resultText: no ? 'yes, it can be false' : 'it is never false' }),
        oStep({ key: 'asn', prompt: 'So the statement is…', options: ['Always', 'Sometimes', 'Never'], answer: ans,
          wrong: { Always: 'It can be false, so not “always”.', Sometimes: yes ? 'It can never be false, so it is “always”.' : 'It can never be true, so it is “never”.', Never: 'It can be true, so not “never”.' },
          hint: 'True and false examples → sometimes. Only true → always. Only false → never.', why: 'Always = no counter-example. Never = no example. Sometimes = both.', longWay: [yesEx, noEx].filter(Boolean).join(' ') + `\nso: ${ans}`, resultText: ans, isAnswer: true }),
      ],
    };
  }

  /* ---- S7. Angles in a quadrilateral (360°), drawn to scale ---- */
  function quadFromAngles(A, B, C, s0, s1) {
    const P0 = [0, 0], P1 = [s0, 0], d1 = (180 - B) * DEG, P2 = add(P1, [s1 * Math.cos(d1), s1 * Math.sin(d1)]);
    const d2 = (360 - B - C) * DEG, dir2 = [Math.cos(d2), Math.sin(d2)], dA = [Math.cos(A * DEG), Math.sin(A * DEG)];
    const den = cross(dir2, dA); if (Math.abs(den) < 1e-9) return null;
    const s = cross(sub(P0, P2), dA) / den, t = cross(sub(P0, P2), dir2) / den;
    if (s <= 0.5 || t <= 0.5) return null;
    return [P0, P1, P2, add(P2, mul(dir2, s))];
  }
  function quadAngles() {
    let A, B, C, D, pts;
    do { A = rand(62, 125); B = rand(62, 125); C = rand(62, 125); D = 360 - A - B - C; pts = (D >= 58 && D <= 140) ? quadFromAngles(A, B, C, rand(5, 7), rand(3, 5)) : null; } while (!pts);
    const ang = [A, B, C, D], xi = rand(0, 3), known = ang.filter((_, i) => i !== xi), sum = known.reduce((a, b) => a + b, 0);
    const P = toScreen(pts, 320, 210);
    const q = quadSVG(P, { marks: false, angles: ang.map((v, i) => ({ i, t: i === xi ? 'x' : `${v}°`, kind: i === xi ? 'unknown' : 'given' })) });
    return {
      subject: 'y7shape', sig: `qa:${ang.join(',')}:${xi}`, given: 'Find the missing angle x in the quadrilateral.', diagram: q.svg, answer: `${ang[xi]}°`, geo: q.geo,
      steps: [
        reasonStep('fact', 'quad', 'Which fact do you need?', ['quad', 'tri', 'line', 'point']),
        oStep({ key: 'why', prompt: 'Why 360°?', options: ['A diagonal splits it into 2 triangles: 2 × 180', 'Because it has 4 right angles', 'Because it has 4 sides: 4 × 90'], answer: 'A diagonal splits it into 2 triangles: 2 × 180',
          wrong: { 'Because it has 4 right angles': 'Most quadrilaterals have no right angles, but they still make 360°.', 'Because it has 4 sides: 4 × 90': 'Right total, wrong reason: it works for ANY quadrilateral because of the two triangles.' }, hint: 'Draw one diagonal.', why: 'Corner to corner, any quadrilateral becomes two triangles. 2 × 180° = 360°.', resultText: '2 triangles × 180° = 360°' }),
        nStep({ key: 'known', prompt: `Add the three you know: ${known.join(' + ')} = ?`, answer: sum, hint: `${known.join(' + ')} = ${sum}.`, why: 'Total what you know first.', resultText: `${sum}°`, expr: known.join(' + ') }),
        nStep({ key: 'x', prompt: `x = 360 − ${sum} = ?`, answer: ang[xi], traps: { [Math.abs(180 - sum) || 1]: 'Use 360 for a quadrilateral, not 180.', [sum]: 'That is the three you know. x is what is left.' }, hint: `360 − ${sum} = ${ang[xi]}.`, why: RS.quad + '.',
          longWay: `${known.join(' + ')} = ${sum}\nx = 360 − ${sum} = ${ang[xi]}°`, resultText: `x = ${ang[xi]}°`, expr: `360 − ${sum}`, isAnswer: true }),
      ],
    };
  }

  /* ---- S8. Angles in SPECIAL quadrilaterals: use the properties ---- */
  function quadSpecial() {
    const kind = pick(['parallelogram', 'kite', 'isotrap']);
    if (kind === 'parallelogram') {
      const a = pick([rand(55, 80), rand(100, 125)]), at = pick([1, 2]);
      const pts = quadFromAngles(a, 180 - a, a, 6, 4), P = toScreen(pts, 320, 210);
      const x = at === 2 ? a : 180 - a;
      const q = quadSVG(P, { angles: [{ i: 0, t: `${a}°` }, { i: at, t: 'x', kind: 'unknown' }] });
      const pos = at === 2 ? 'Opposite corner' : 'Next to it (same side)';
      return { subject: 'y7shape', sig: `ps:${a}:${at}`, given: 'This is a parallelogram. Find x.', diagram: q.svg, answer: `${x}°`, geo: q.geo,
        steps: [
          oStep({ key: 'pos', prompt: `Where is x compared with the ${a}°?`, options: ['Opposite corner', 'Next to it (same side)'], answer: pos, wrong: { 'Opposite corner': 'They share a side: x is next to it.', 'Next to it (same side)': 'They are diagonally across from each other: opposite corners.' }, hint: pos + '.', why: 'In a parallelogram, the rule depends on where the angles are.', resultText: pos.toLowerCase() }),
          oStep({ key: 'rule', prompt: at === 2 ? 'In a parallelogram, opposite angles are…' : 'Angles next to each other along a side of a parallelogram…', options: ['equal', 'add up to 180° (co-interior)', 'add up to 360°'], answer: at === 2 ? 'equal' : 'add up to 180° (co-interior)',
            wrong: at === 2 ? { 'add up to 180° (co-interior)': 'That is for neighbouring angles. Opposite angles are equal.', 'add up to 360°': 'All FOUR add to 360. Opposite angles are equal.' } : { equal: 'Opposite angles are equal; NEIGHBOURS add to 180° (they are co-interior between two parallel sides).', 'add up to 360°': 'All four add to 360. Two neighbours add to 180°.' },
            hint: at === 2 ? 'Opposite angles of a parallelogram are equal.' : 'Neighbours sit between two parallel sides: co-interior, 180°.', why: 'Two pairs of parallel sides means each pair of neighbouring angles is co-interior.', resultText: at === 2 ? 'opposite angles are equal' : 'neighbours add to 180°' }),
          nStep({ key: 'x', prompt: 'So x = ?', answer: x, traps: at === 2 ? { [180 - a]: 'Opposite angles are EQUAL.' } : { [a]: 'Neighbours are not equal: they add to 180°.' }, hint: at === 2 ? `x = ${a}°.` : `180 − ${a} = ${x}.`, why: at === 2 ? 'Opposite angles of a parallelogram are equal.' : RS.coint + '.',
            longWay: at === 2 ? `opposite angles are equal\nx = ${a}°` : `co-interior angles add up to 180°\nx = 180 − ${a} = ${x}°`, resultText: `x = ${x}°`, expr: at === 2 ? `the same as ${a}` : `180 − ${a}`, isAnswer: true }),
        ] };
    }
    if (kind === 'kite') {
      let top, bot; do { top = 2 * rand(30, 50); bot = 2 * rand(18, 32); } while ((360 - top - bot) % 2);
      const w = 2.6, P = toScreen([[0, -w / Math.tan(bot / 2 * DEG)], [w, 0], [0, w / Math.tan(top / 2 * DEG)], [-w, 0]], 320, 210), side = (360 - top - bot) / 2;
      const q = quadSVG(P, { angles: [{ i: 0, t: `${bot}°` }, { i: 2, t: `${top}°` }, { i: 1, t: 'x', kind: 'unknown' }] });
      return { subject: 'y7shape', sig: `ks:${top},${bot}`, given: 'This is a kite. Find x.', diagram: q.svg, answer: `${side}°`, geo: q.geo,
        steps: [
          oStep({ key: 'eq', prompt: 'Which angle of the kite is equal to x?', options: ['The other side angle', `The ${top}° angle`, `The ${bot}° angle`], answer: 'The other side angle', wrong: { [`The ${top}° angle`]: 'The equal pair is the two angles either side of the line of symmetry.', [`The ${bot}° angle`]: 'The equal pair is the two angles either side of the line of symmetry.' }, hint: 'The kite’s line of symmetry goes through the top and bottom: the two side angles mirror each other.', why: 'A kite has one pair of equal opposite angles: the ones between unequal sides.', resultText: 'the two side angles are equal' }),
          nStep({ key: 'left', prompt: `All four make 360°. What is left for the two side angles? 360 − ${top} − ${bot} = ?`, answer: 2 * side, hint: `360 − ${top} − ${bot} = ${2 * side}.`, why: RS.quad + '.', resultText: `${2 * side}° for the two`, expr: `360 − ${top} − ${bot}` }),
          nStep({ key: 'x', prompt: `They share it equally: ${2 * side} ÷ 2 = ?`, answer: side, traps: { [2 * side]: 'That is both side angles. Halve it.' }, hint: `${2 * side} ÷ 2 = ${side}.`, why: 'The two side angles are equal.', longWay: `360 − ${top} − ${bot} = ${2 * side}\nx = ${2 * side} ÷ 2 = ${side}°`, resultText: `x = ${side}°`, expr: `${2 * side} ÷ 2`, isAnswer: true }),
        ] };
    }
    const al = rand(55, 80), at = pick([1, 3]), pts = quadFromAngles(al, al, 180 - al, 7, 3), P = toScreen(pts, 320, 210);
    const x = at === 1 ? al : 180 - al;
    const q = quadSVG(P, { angles: [{ i: 0, t: `${al}°` }, { i: at, t: 'x', kind: 'unknown' }] });
    return { subject: 'y7shape', sig: `it:${al}:${at}`, given: 'This is an isosceles trapezium. Find x.', diagram: q.svg, answer: `${x}°`, geo: q.geo,
      steps: [
        oStep({ key: 'where', prompt: `Where is x compared with the ${al}°?`, options: ['The other bottom corner', 'Above it, on the same slanted side'], answer: at === 1 ? 'The other bottom corner' : 'Above it, on the same slanted side', wrong: { 'The other bottom corner': 'x is at the top, above the ' + al + '°.', 'Above it, on the same slanted side': 'x is the other bottom corner.' }, hint: at === 1 ? 'Both at the bottom.' : 'Same slanted side.', why: 'Where the angle is decides the rule.', resultText: at === 1 ? 'the other base angle' : 'same slanted side' }),
        oStep({ key: 'rule', prompt: at === 1 ? 'An isosceles trapezium is symmetrical, so the two bottom angles are…' : 'Two angles on the same slanted side sit between the parallel sides, so they…', options: ['are equal', 'add up to 180°', 'add up to 360°'], answer: at === 1 ? 'are equal' : 'add up to 180°',
          wrong: at === 1 ? { 'add up to 180°': 'Bottom angles of an isosceles trapezium mirror each other: equal.', 'add up to 360°': 'All four make 360.' } : { 'are equal': 'They are co-interior (between the parallel top and bottom): they add to 180°.', 'add up to 360°': 'All four make 360.' },
          hint: at === 1 ? 'The mirror line makes them equal.' : 'Co-interior: 180°.', why: at === 1 ? 'Its line of symmetry maps one base angle onto the other.' : RS.coint + '.', resultText: at === 1 ? 'equal' : 'add to 180°' }),
        nStep({ key: 'x', prompt: 'So x = ?', answer: x, traps: at === 1 ? { [180 - al]: 'The base angles are EQUAL.' } : { [al]: 'They add to 180°.' }, hint: at === 1 ? `x = ${al}°.` : `180 − ${al} = ${x}.`, why: at === 1 ? 'The base angles match.' : RS.coint + '.',
          longWay: at === 1 ? `base angles are equal\nx = ${al}°` : `co-interior: 180 − ${al} = ${x}°`, resultText: `x = ${x}°`, expr: at === 1 ? `the same as ${al}` : `180 − ${al}`, isAnswer: true }),
      ] };
  }

  /* ---- S9–S11. Polygons ---- */
  const POLY = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
  function polySVG(n, irregular, labels, fanFrom) {
    const K = new Kit(300, 220), c = [150, 112], R = 88, rot = 90 - 180 / n;
    const P = [];
    for (let i = 0; i < n; i++) { const r = irregular ? R * (0.8 + 0.2 * ((i * 7) % 5) / 4) : R; const a = (rot + i * 360 / n) * DEG; P.push([c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]); }
    K.poly(P);
    if (fanFrom != null) for (let i = 2; i < n - 1; i++) K.line(P[fanFrom], P[(fanFrom + i) % n], { col: '#7d3cb5', w: 1.8, dash: '5 4' });
    (labels || []).forEach((l) => { if (l) K.angle(P[l.i], P[(l.i + n - 1) % n], P[(l.i + 1) % n], { label: l.t, kind: l.kind || 'given' }); });
    return K.svg(irregular ? 'Not drawn accurately' : '');
  }
  function polySum() {
    const n = pick([5, 6, 7, 8, 9, 10]), tri = n - 2, sum = tri * 180;
    return {
      subject: 'y7shape', sig: `ps:${n}`, given: `What do the inside angles of a ${POLY[n]} add up to?`, diagram: polySVG(n, Math.random() < 0.5, [], 0), answer: `${sum}°`,
      steps: [
        nStep({ key: 'n', prompt: `How many sides does a ${POLY[n]} have?`, answer: n, traps: { [n - 1]: 'Count the sides again.', [n + 1]: 'Count the sides again.' }, hint: `A ${POLY[n]} has ${n} sides.`, why: 'Penta = 5, hexa = 6, hepta = 7, octa = 8, nona = 9, deca = 10.', resultText: `${n} sides`, expr: `the sides of a ${POLY[n]}` }),
        nStep({ key: 'tri', prompt: `The dashed lines from one corner split it into triangles. How many? (always sides − 2)`, answer: tri, traps: { [n]: 'From one corner you cannot draw to itself or to its two neighbours: sides − 2.', [n - 1]: 'Count the triangles: sides − 2.' }, hint: `${n} − 2 = ${tri}.`, why: 'From one corner you can draw to every corner except itself and its two neighbours, so you always get (sides − 2) triangles.', resultText: `${tri} triangles`, expr: `${n} − 2` }),
        nStep({ key: 'sum', prompt: `Each triangle is 180°. So ${tri} × 180 = ?`, answer: sum, traps: { [n * 180]: `${n} × 180 counts too many triangles. Use ${tri}.`, [sum + 180]: 'One triangle too many.', [sum - 180]: 'One triangle too few.' }, hint: `${tri} × 180 = ${sum}.`, why: 'Interior angle sum = (n − 2) × 180°.', longWay: `${n} sides → ${tri} triangles\n${tri} × 180 = ${sum}°`, resultText: `${sum}°`, expr: `${tri} × 180`, isAnswer: true }),
      ],
    };
  }
  function polyRegular() {
    const n = pick([3, 4, 5, 6, 8, 9, 10, 12]), ext = 360 / n, int = 180 - ext;
    if (Math.random() < 0.6) {
      return {
        subject: 'y7shape', sig: `pr:${n}`, given: `Find the size of each inside angle of a regular ${POLY[n]}.`, diagram: polySVG(n, false, [{ i: 0, t: 'x', kind: 'unknown' }]), answer: `${int}°`,
        steps: [
          oStep({ key: 'reg', prompt: '“Regular” means…', options: ['all sides equal AND all angles equal', 'all sides equal only', 'it has right angles'], answer: 'all sides equal AND all angles equal', wrong: { 'all sides equal only': 'Both: equal sides and equal angles (a rhombus has equal sides but is not regular).', 'it has right angles': 'Only the square, among regular polygons, has right angles.' }, hint: 'Equal sides and equal angles.', why: 'A regular polygon has every side the same and every angle the same.', resultText: 'all angles equal' }),
          nStep({ key: 'extsum', prompt: 'Walk round the outside: the outside (exterior) angles of ANY polygon add up to?', answer: 360, traps: { 180: 'You turn all the way round once: a full turn, 360°.' }, hint: 'One full turn.', why: 'Walking round a polygon you turn through one full turn in total.', resultText: 'exterior angles add up to 360°', expr: 'a full turn' }),
          nStep({ key: 'ext', prompt: `So each exterior angle = 360 ÷ ${n} = ?`, answer: ext, hint: `360 ÷ ${n} = ${ext}.`, why: 'They are all equal, so share 360 between them.', resultText: `exterior = ${ext}°`, expr: `360 ÷ ${n}` }),
          nStep({ key: 'int', prompt: `Inside + outside angle make a straight line. So x = 180 − ${ext} = ?`, answer: int, traps: { [ext]: 'That is the OUTSIDE angle. x is inside: 180 − it.' }, hint: `180 − ${ext} = ${int}.`, why: RS.line + '.', longWay: `exterior = 360 ÷ ${n} = ${ext}°\ninterior = 180 − ${ext} = ${int}°`, resultText: `x = ${int}°`, expr: `180 − ${ext}`, isAnswer: true }),
        ],
      };
    }
    return {
      subject: 'y7shape', sig: `prb:${n}`, given: `Each inside angle of a regular polygon is ${int}°. How many sides does it have?`, answer: `${n}`,
      steps: [
        nStep({ key: 'ext', prompt: `First the outside angle: 180 − ${int} = ?`, answer: ext, hint: `180 − ${int} = ${ext}.`, why: 'Inside and outside angles make a straight line.', resultText: `exterior = ${ext}°`, expr: `180 − ${int}` }),
        nStep({ key: 'n', prompt: `The outside angles make 360° and they are all ${ext}°. How many? 360 ÷ ${ext} = ?`, answer: n, traps: { [Math.round(360 / int) || 2]: `Divide by the OUTSIDE angle (${ext}), not the inside one.` }, hint: `360 ÷ ${ext} = ${n}.`, why: 'Number of sides = 360 ÷ exterior angle.', longWay: `exterior = 180 − ${int} = ${ext}°\nsides = 360 ÷ ${ext} = ${n}`, resultText: `${n} sides (${POLY[n]})`, expr: `360 ÷ ${ext}`, isAnswer: true }),
      ],
    };
  }
  function polyMissing() {
    const n = pick([5, 6]), sum = (n - 2) * 180;
    let ang;
    for (;;) { ang = []; let left = sum; for (let i = 0; i < n - 1; i++) { const v = rand(85, 155); ang.push(v); left -= v; } ang.push(left); if (left >= 80 && left <= 170) break; }
    const xi = rand(0, n - 1), known = ang.filter((_, i) => i !== xi), ks = known.reduce((a, b) => a + b, 0);
    return {
      subject: 'y7shape', sig: `pm:${ang.join(',')}:${xi}`, given: `Find the missing angle x in this ${POLY[n]}.`, diagram: polySVG(n, true, ang.map((v, i) => ({ i, t: i === xi ? 'x' : `${v}°`, kind: i === xi ? 'unknown' : 'given' }))), answer: `${ang[xi]}°`,
      steps: [
        nStep({ key: 'tri', prompt: `A ${POLY[n]} has ${n} sides. How many triangles from one corner?`, answer: n - 2, traps: { [n]: 'Sides − 2.' }, hint: `${n} − 2 = ${n - 2}.`, why: 'Always sides − 2.', resultText: `${n - 2} triangles`, expr: `${n} − 2` }),
        nStep({ key: 'sum', prompt: `So the angles add up to ${n - 2} × 180 = ?`, answer: sum, traps: { [n * 180]: `Use ${n - 2} triangles, not ${n}.` }, hint: `${n - 2} × 180 = ${sum}.`, why: 'Interior angle sum = (n − 2) × 180°.', resultText: `${sum}°`, expr: `${n - 2} × 180` }),
        nStep({ key: 'known', prompt: `Add the ${n - 1} you know: ${known.join(' + ')} = ?`, answer: ks, hint: `= ${ks}.`, why: 'Total what you know.', resultText: `${ks}°`, expr: known.join(' + ') }),
        nStep({ key: 'x', prompt: `x = ${sum} − ${ks} = ?`, answer: ang[xi], traps: { [ks]: 'That is the total you know. x is what is left.' }, hint: `${sum} − ${ks} = ${ang[xi]}.`, why: 'Whatever is left of the total is x.', longWay: `(${n} − 2) × 180 = ${sum}\n${known.join(' + ')} = ${ks}\nx = ${sum} − ${ks} = ${ang[xi]}°`, resultText: `x = ${ang[xi]}°`, expr: `${sum} − ${ks}`, isAnswer: true }),
      ],
    };
  }

  /* ---- no steps: the same questions with the scaffolding removed ---- */
  function soloFrom(gens) {
    const U = () => ((root.WAC && root.WAC.unaidedFrom) ? root.WAC : require('./unaided.js'));
    return function solo() {
      const out = U().unaidedFrom(pick(gens)());
      return U().unaidedIsSelfContained(out.steps[0]) ? out : solo();
    };
  }
  const angSolo = soloFrom([() => parOne(), parChain, parTriangle, angTriangle, parAlgebra]);
  const shapeSolo = soloFrom([shapeTree, quadAngles, quadSpecial, polySum, polyRegular, polyMissing]);

  const api = {
    angNotation, angFacts, angTriangle, parSpot, parOne, parChain, parTriangle, parConverse, parAlgebra, angSolo,
    shapeTree, triTypes, shapeDiag, shapeSym, shapeClues, shapeASN, quadAngles, quadSpecial, polySum, polyRegular, polyMissing, shapeSolo,
    _g7: { relation, valueOf, isInside, measure, facts, classify, makeShape, onScreen, KEYS, DATA, CLUES, ASN, parallel },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
