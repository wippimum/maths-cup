/* numbers.js — pure number-theory helpers for HCF, LCM, primes and ratios.
   Everything here is exact integer maths, no decimals. */
(function (root) {
  const W = root.WAC || {};

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

  // All factors of n, ascending (1 and n included).
  function factors(n) {
    n = Math.abs(n);
    const out = [];
    for (let i = 1; i * i <= n; i++) {
      if (n % i === 0) { out.push(i); if (i !== n / i) out.push(n / i); }
    }
    return out.sort((a, b) => a - b);
  }

  // First k multiples of n: n, 2n, ... kn.
  function multiples(n, k) {
    const out = [];
    for (let i = 1; i <= k; i++) out.push(n * i);
    return out;
  }

  // Common members of two sorted arrays.
  function common(a, b) {
    const bs = new Set(b);
    return a.filter((x) => bs.has(x));
  }

  function hcfOf(nums) { return nums.reduce((a, b) => gcd(a, b)); }
  function lcmOf(nums) { return nums.reduce((a, b) => lcm(a, b)); }

  function isPrime(n) {
    n = Math.abs(n);
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  }

  // Primes up to (and including) n.
  function primesUpTo(n) {
    const out = [];
    for (let i = 2; i <= n; i++) if (isPrime(i)) out.push(i);
    return out;
  }

  function smallestPrimeFactor(n) {
    n = Math.abs(n);
    if (n < 2) return null;
    if (n % 2 === 0) return 2;
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return i;
    return n; // n is prime
  }

  // Prime factorisation as an ascending list, e.g. 24 -> [2,2,2,3].
  function primeFactorisation(n) {
    n = Math.abs(n);
    const out = [];
    let m = n;
    while (m > 1) { const p = smallestPrimeFactor(m); out.push(p); m = m / p; }
    return out;
  }

  // A non-trivial factor of n (not 1, not n), or null if prime/unit.
  function properFactor(n) {
    const f = factors(n).filter((x) => x !== 1 && x !== n);
    return f.length ? f[0] : null;
  }

  // ---- number-list input parsing & comparison ----
  // "1, 2, 3  4" -> [1,2,3,4]; ignores anything non-numeric.
  function parseNumberList(str) {
    const cleaned = String(str).replace(/[−–—]/g, '-');
    const found = cleaned.match(/-?\d+/g);
    return found ? found.map((x) => parseInt(x, 10)) : [];
  }
  function uniqSort(arr) { return [...new Set(arr)].sort((a, b) => a - b); }
  function sameSet(a, b) {
    const A = uniqSort(a), B = uniqSort(b);
    return A.length === B.length && A.every((x, i) => x === B[i]);
  }

  // pick a handful of distinct "wrong" numbers near a target set, for distractor chips
  function nearbyDistractors(correct, count, lo, hi) {
    const set = new Set(correct);
    const out = [];
    let guard = 0;
    while (out.length < count && guard++ < 500) {
      const v = lo + Math.floor(Math.random() * (hi - lo + 1));
      if (!set.has(v) && !out.includes(v)) out.push(v);
    }
    return out;
  }

  const api = {
    gcd, lcm, factors, multiples, common, hcfOf, lcmOf,
    isPrime, primesUpTo, smallestPrimeFactor, primeFactorisation, properFactor,
    parseNumberList, uniqSort, sameSet, nearbyDistractors,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(W, api);
})(typeof window !== 'undefined' ? window : globalThis);
