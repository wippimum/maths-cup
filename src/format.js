/* format.js — pretty maths display with real minus signs. */
(function (root) {
  const M = '−'; // real minus

  // A plain number: 3, −3
  function fmtN(n) { return n < 0 ? M + Math.abs(n) : '' + n; }

  // A signed term as it appears in an equation, e.g. "+3" or "−3"
  function signed(n) { return n < 0 ? M + Math.abs(n) : '+' + n; }

  // A signed x-term, e.g. "+2x", "−2x", "+x", "−x" (1 is left off)
  function signedX(n) {
    const a = Math.abs(n);
    return (n < 0 ? M : '+') + (a === 1 ? '' : a) + 'x';
  }

  // "5x", "x", "−x", "−2x"
  function xTerm(coef) {
    if (coef === 1) return 'x';
    if (coef === -1) return M + 'x';
    return fmtN(coef) + 'x';
  }

  // Build one side "5x − 3" from an x-coefficient and a constant value (number or Fraction).
  function side(xCoef, cVal) {
    const cIsFrac = cVal && typeof cVal === 'object' && 'n' in cVal;
    const cZero = cIsFrac ? cVal.isZero() : cVal === 0;
    const cStr = cIsFrac ? cVal.toString() : fmtN(cVal);
    if (xCoef === 0) return cStr;
    let out = xTerm(xCoef);
    if (!cZero) {
      const cNeg = cIsFrac ? cVal.n < 0 : cVal < 0;
      const cAbs = cIsFrac ? cVal.neg().toString().replace(M, '') : Math.abs(cVal);
      out += ` ${cNeg ? M : '+'} ${cAbs}`;
    }
    return out;
  }

  function equation(lx, lc, rx, rc) {
    return `${side(lx, lc)} = ${side(rx, rc)}`;
  }

  const api = { M, fmtN, signed, signedX, xTerm, side, equation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
