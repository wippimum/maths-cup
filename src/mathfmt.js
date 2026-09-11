/* mathfmt.js — draw fractions the way they are written on paper.

   "3 15/22 − 5/2" is hard to read and easy to misparse: at a glance the 22 and the 5
   look like they belong together. A mixed number especially needs the whole number
   beside a stacked fraction, exactly as it appears in the exercise book, or a child
   reading 3 15/22 has to decode it before they can start thinking about it.

   So this turns plain text into markup with the numerator sitting above the
   denominator on a rule:

       toHTML('3 15/22 − 5/2')   ->   3 15   −   5
                                        ──        ─
                                        22        2

   It is deliberately conservative. Everything is HTML-escaped FIRST, and only then do
   digit/digit runs become fractions — so the '/' card used in build steps and the word
   "above/below" are both left exactly as they are, and no generated string can inject
   markup. Generators keep writing plain "3 15/22"; nothing else has to change. */
(function (root) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const frac = (n, d) =>
    `<span class="fr"><span class="fr-n">${n}</span><span class="fr-d">${d}</span></span>`;
  const mixed = (w, n, d) =>
    `<span class="mx"><span class="mx-w">${w}</span>${frac(n, d)}</span>`;

  // A mixed number is "<whole> <num>/<den>" — the space is what separates them, so it
  // must not be preceded by another digit (that would be two numbers in a list).
  // The separator is a real space, never \s: with \s a line ending in "18" followed by
  // a line starting "1/5" was glued into the mixed number "18 1/5", which is how the
  // "long way" working for one-step equations came out as a single wrong line.
  const MIXED = /(^|[^\d/])(\d+)[ \u00a0]+(\d+)\/(\d+)(?![\d/])/g;
  const SIMPLE = /(^|[^\d/>])(\d+)\/(\d+)(?![\d/])/g;

  function toHTML(text) {
    let s = esc(text);
    s = s.replace(MIXED, (m, pre, w, n, d) => pre + mixed(w, n, d));
    s = s.replace(SIMPLE, (m, pre, n, d) => pre + frac(n, d));
    return s;
  }

  // True when the string contains something worth stacking — lets a caller keep using
  // textContent for the many strings that have no fraction in them at all.
  function hasFraction(text) {
    return /\d+\/\d+/.test(String(text == null ? '' : text));
  }

  const api = { mathHTML: toHTML, mathHasFraction: hasFraction, mathEscape: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
