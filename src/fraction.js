/* fraction.js — exact fraction arithmetic (no decimals, ever). */
(function (root) {
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  class Fraction {
    constructor(n, d = 1) {
      if (d === 0) throw new Error('divide by zero');
      n = Math.trunc(n); d = Math.trunc(d);
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d);
      this.n = n / g;
      this.d = d / g;
    }
    static from(v) {
      if (v instanceof Fraction) return v;
      return new Fraction(v, 1);
    }
    add(o) { o = Fraction.from(o); return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Fraction.from(o); return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Fraction.from(o); return new Fraction(this.n * o.n, this.d * o.d); }
    div(o) { o = Fraction.from(o); return new Fraction(this.n * o.d, this.d * o.n); }
    neg() { return new Fraction(-this.n, this.d); }
    equals(o) { o = Fraction.from(o); return this.n === o.n && this.d === o.d; }
    isZero() { return this.n === 0; }
    isWhole() { return this.d === 1; }
    get value() { return this.n / this.d; }
    // Display with a real minus sign, e.g. "22/9" or "−15/38" or "4".
    toString() {
      const minus = this.n < 0 ? '−' : '';
      const an = Math.abs(this.n);
      return this.d === 1 ? minus + an : `${minus}${an}/${this.d}`;
    }
  }

  const api = { Fraction, gcd };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
