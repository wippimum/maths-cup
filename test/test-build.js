/* Checks the app is correctly ASSEMBLED, not that the maths is right.

   Adding src/algebra1.js once without adding its <script> tag left the app loading
   fine and then dying the moment you opened that topic — the kind of failure that
   looks like "tapping does nothing" on an iPad. Cheap to test, so test it.

   Run: node test/test-build.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let checks = 0, fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const ok = () => { checks++; };

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const files = fs.readdirSync(path.join(ROOT, 'src')).filter((f) => f.endsWith('.js')).sort();

// 1. every source file is loaded by the page AND cached by the service worker
files.forEach((f) => {
  if (!html.includes(`src/${f}?`)) bad(`src/${f} has no <script> tag in index.html — the app will break when that topic is opened`);
  else ok();
  if (!sw.includes(`./src/${f}?`)) bad(`src/${f} is not in the sw.js ASSETS list — it won't be there offline`);
  else ok();
});

// 2. one version stamp everywhere, matching the service worker cache name and the footer
const versions = new Set([...html.matchAll(/\?v=(\d+)/g)].map((m) => m[1]));
[...sw.matchAll(/\?v=(\d+)/g)].forEach((m) => versions.add(m[1]));
if (versions.size !== 1) bad(`mixed ?v= stamps across index.html and sw.js: ${[...versions].join(', ')} — an iPad can end up with a half-updated app`);
else ok();
const v = [...versions][0];

const cache = (sw.match(/CACHE\s*=\s*'wac-v(\d+)'/) || [])[1];
if (cache !== v) bad(`sw.js CACHE is wac-v${cache} but the assets are ?v=${v} — bump them together`);
else ok();

const build = (html.match(/class="build">build (\d+)</) || [])[1];
if (build !== v) bad(`the footer says build ${build} but the assets are ?v=${v} — the stamp is how we tell a stale iPad from a real bug`);
else ok();

// 3. the load ORDER has to respect what each file reads off window.WAC at define time
const order = [...html.matchAll(/src\/([a-z0-9]+)\.js\?/g)].map((m) => m[1]);
const AFTER = {                       // file : files that must already have loaded
  figures: ['numbers'],
  topics: ['numbers', 'format'],
  topics2: ['topics'], topics3: ['topics'], topics4: ['topics'], topics5: ['topics'],
  primes: ['numbers'], coords: ['topics'],
  algebra1: ['topics'], curriculum1: ['topics'], curriculum2: ['topics', 'figures'],
  harder: ['topics'], harder2: ['topics', 'figures'],
  problems: ['steps', 'topics', 'harder', 'harder2', 'algebra1', 'curriculum1', 'curriculum2', 'solving', 'bidmas'],
  app: ['problems', 'history', 'explanations'],
};
Object.entries(AFTER).forEach(([f, deps]) => {
  const i = order.indexOf(f);
  if (i < 0) { bad(`${f}.js is not loaded at all`); return; }
  deps.forEach((d) => {
    const j = order.indexOf(d);
    if (j < 0) bad(`${f}.js needs ${d}.js, which is not loaded`);
    else if (j > i) bad(`${f}.js loads before ${d}.js, but depends on it`);
    else ok();
  });
});

// 4. nothing personal committed — this repo is public.
// "the Al Falasi brothers" in the footer is deliberate; it is the boys' FIRST names and
// any email address that must never appear, so the URL can't be tied back to them.
const SECRETS = [/[\w.+-]+@[\w-]+\.[\w.]+/, /\bHamdan\b/i, /\bSultan\b/i,
  /\b(Hamdan|Sultan)[\s\w]*Al\s*Falasi\b/i];
fs.readdirSync(path.join(ROOT, 'src')).concat(['index.html', 'sw.js', 'manifest.json', 'README.md']).forEach((f) => {
  const p = f.endsWith('.js') && !f.includes('.') === false && fs.existsSync(path.join(ROOT, 'src', f))
    ? path.join(ROOT, 'src', f) : path.join(ROOT, f);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) return;
  const text = fs.readFileSync(p, 'utf8');
  SECRETS.forEach((re) => {
    const m = text.match(re);
    if (m) bad(`${path.relative(ROOT, p)} contains "${m[0]}" — this repo is public, keep names and addresses out of it`);
    else ok();
  });
});

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
