/* parser.js — turn a typed line into { left:{x,c}, right:{x,c} } of exact Fractions.
   Small custom parser: reliable for linear equations, no heavy library needed. */
(function (root) {
  const { Fraction } = root.WAC || require('./fraction.js');

  // Normalise the many symbols a kid might type into plain ASCII.
  function clean(str) {
    return String(str)
      .replace(/[−–—]/g, '-')   // unicode minuses
      .replace(/[×✕✖]/g, '*')   // times
      .replace(/[÷]/g, '/')      // divide
      .replace(/\s+/g, '')       // spaces
      .replace(/\*x/g, 'x');     // "5*x" -> "5x"
  }

  // Evaluate a numeric chunk like "4", "-3", "4/5", "4*5", "2*3/4" into a Fraction.
  function evalNum(t) {
    if (t === '' || t === '+') return null;
    let neg = false;
    if (t[0] === '+') t = t.slice(1);
    while (t[0] === '-') { neg = !neg; t = t.slice(1); }
    if (t === '') return null;
    let result = new Fraction(1, 1);
    for (const factor of t.split('*')) {
      if (factor === '') return null;
      const parts = factor.split('/');
      if (parts.length > 2) return null;
      const num = parts[0];
      const den = parts.length === 2 ? parts[1] : '1';
      if (!/^\d+$/.test(num) || !/^\d+$/.test(den)) return null;
      result = result.mul(new Fraction(parseInt(num, 10), parseInt(den, 10)));
    }
    return neg ? result.neg() : result;
  }

  // Split a side into signed terms: "5x-3" -> ["5x","-3"], "7-3" -> ["7","-3"].
  function splitTerms(s) {
    const terms = [];
    let cur = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const prev = cur[cur.length - 1];
      if ((ch === '+' || ch === '-') && cur !== '' && prev !== '*' && prev !== '/') {
        terms.push(cur);
        cur = ch;
      } else {
        cur += ch;
      }
    }
    if (cur !== '') terms.push(cur);
    return terms;
  }

  // Parse one side into { x: Fraction, c: Fraction } or null if unreadable.
  function parseSide(str) {
    const s = clean(str);
    if (s === '') return null;
    let x = new Fraction(0, 1);
    let c = new Fraction(0, 1);
    for (let term of splitTerms(s)) {
      if (term.includes('x')) {
        // coefficient part is everything except the (single) x
        if ((term.match(/x/g) || []).length !== 1) return null;
        let coefPart = term.replace('x', '');
        let coef;
        if (coefPart === '' || coefPart === '+') coef = new Fraction(1, 1);
        else if (coefPart === '-') coef = new Fraction(-1, 1);
        else { coef = evalNum(coefPart); if (coef === null) return null; }
        x = x.add(coef);
      } else {
        const val = evalNum(term);
        if (val === null) return null;
        c = c.add(val);
      }
    }
    return { x, c };
  }

  // Parse a whole "left = right" line.
  function parseEquation(str) {
    const parts = String(str).split('=');
    if (parts.length !== 2) return null;
    const left = parseSide(parts[0]);
    const right = parseSide(parts[1]);
    if (!left || !right) return null;
    return { left, right };
  }

  const api = { parseSide, parseEquation, evalNum, clean, splitTerms };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
