/* Checks the app against the school's actual course.

   The harder levels were once built from general Year 6/7 knowledge rather than from
   Hamdan's Toddle unit plans, and the two had drifted: the app taught surface area and
   reverse percentages (not on the course) while having nothing at all for Topic 5
   Algebra, nets, pie charts or Venn diagrams (all on it). This test pins the mapping
   down so that can't happen quietly again.

   Every Toddle objective below is transcribed from ~/Toddle_Hamdan_6M-MAT2/Topic_NN_*.docx
   ("Specific understandings"). Each one must be claimed by a level, and every level that
   is NOT on the course must be flagged `stretch: true`.

   Run: node test/test-curriculum.js */
const path = '../src/';
const W = {};
for (const f of ['numbers', 'format', 'fraction', 'parser', 'explanations', 'figures', 'steps', 'topics',
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'algebra1', 'curriculum1', 'curriculum2',
  'harder', 'harder2', 'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}

let checks = 0, fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const ok = () => { checks++; };

// topic → the level ids that cover its objectives
const COVERAGE = {
  'T1 Numeracy': ['num-pv', 'num-order', 'num-hard'],
  'T2 Integers & order of operations': ['int-addsub', 'int-muldiv', 'int-hard', 'bid-spot', 'bid-md', 'bid-brackets', 'bid-lr', 'bid-indices', 'bid-mix'],
  'T3 Number properties': ['hcf-warm', 'hcf-main', 'hcf-big', 'lcm-warm', 'lcm-main', 'lcm-big', 'prime-spot', 'prime-hunt', 'prime-two', 'prime-index', 'prime-powers'],
  'T4 Fractions': ['frac-simplify', 'frac-of', 'frac-add', 'frac-mixed', 'frac-ofwhat', 'frac-muldiv'],
  'T5 Introduction to algebra': ['alg1-notation', 'alg1-sub', 'alg1-subneg', 'alg1-collect', 'alg1-perim'],
  'T6 Symmetry & coordinates': ['co-read', 'co-read-neg', 'co-reflect', 'co-complete', 'geo-sym'],
  'T7 Degrees of accuracy': ['round-nearest', 'round-dp'],
  'T8 Calculating with decimals': ['dec-power', 'dec-addsub', 'dec-muldiv'],
  'T9 Linear equations': ['warmup', 'group', 'r16', 'qf', 'sf'],
  'T10 Angles': ['ang-classify', 'ang-missing', 'ang-tri', 'ang-quad'],
  'T11 Fractions, decimals & percentages': ['fdp-fd', 'fdp-pf', 'fdp-order'],
  'T12 Mensuration of 2D shapes': ['area-rect', 'area-tri', 'area-comp', 'meas-length', 'meas-mixed', 'meas-areavol'],
  'T13 Statistical measures': ['stat-modrange', 'stat-mean', 'stat-median', 'stat-compare'],
  'T14 Graphical representation of data': ['gr-bar', 'gr-scale', 'gr-pict', 'gr-charts', 'gr-venn'],
  'T15 Percentages': ['pc-of', 'pc-any', 'pc-ofwhat', 'pc-change'],
  'T16 Geometric properties': ['geo-facts', 'geo-props', 'geo-poly'],
  'T17 3D shape and volume': ['vol-name', 'vol-cuboid', 'vol-fev', 'vol-prism'],
};

// levels that go BEYOND the Year 6 course — allowed, but they must say so
const EXPECTED_STRETCH = new Set([
  'prime-square', 'prime-hcflcm',      // beyond Y7 index-form work
  'hcf-pro', 'lcm-pro',                // HCF/LCM of three numbers
  'round-sf',                          // significant figures (T7 stops at decimal places)
  'final',                             // brackets (T9 is one- and two-step equations)
  'ang-hard',                          // parallel lines, polygon angle sums
  'area-trap',                         // trapezium (T12 has rectangles, parallelograms, triangles)
  'stat-hard',                         // reverse mean
  'gr-hard',                           // two-way tables
  'pc-hard',                           // reverse percentages
  'vol-hard',                          // surface area (T17 has volume and nets, not surface area)
  'co-mid',                            // midpoint
  'ratio-simplify', 'ratio-share', 'ratio-hard',   // ratio is not a Y6 Toddle topic at all
]);

const allLevels = new Map();
for (const s of W.SUBJECTS) for (const l of s.levels) allLevels.set(l.id, { subject: s.id, level: l });

console.log('Checking the app against the Toddle Year 6 course…\n');

// 1. every objective's level exists and actually builds a match
for (const [topic, ids] of Object.entries(COVERAGE)) {
  const missing = ids.filter((id) => !allLevels.has(id));
  if (missing.length) { bad(`${topic}: no level for ${missing.join(', ')}`); continue; }
  let broke = null;
  for (const id of ids) {
    const { subject } = allLevels.get(id);
    try {
      const m = W.buildMatchFor(subject, id, 3);
      if (m.length !== 3) broke = `${id} built ${m.length} problems`;
    } catch (e) { broke = `${id} threw: ${e.message}`; }
  }
  if (broke) bad(`${topic}: ${broke}`); else ok();
  console.log(`  ✓ ${topic.padEnd(40)} ${ids.length} level${ids.length === 1 ? '' : 's'}`);
}

// 2. a level is either on the course or flagged as stretch — never neither
const onCourse = new Set(Object.values(COVERAGE).flat());
for (const [id, { subject, level }] of allLevels) {
  if (subject === 'solve') continue;              // application, taught across every unit
  const core = onCourse.has(id), stretch = !!level.stretch;
  if (core && stretch) bad(`${subject}/${id} is on the course but flagged as stretch`);
  else if (!core && !stretch) bad(`${subject}/${id} is NOT on the Toddle course and is not flagged stretch — either map it to an objective or mark it`);
  else ok();
}

// 3. everything we expect to be stretch really is (catches a flag being dropped)
for (const id of EXPECTED_STRETCH) {
  if (!allLevels.has(id)) { bad(`expected-stretch level ${id} no longer exists — update this test`); continue; }
  if (!allLevels.get(id).level.stretch) bad(`${id} should be flagged stretch`); else ok();
}

// 4. and nothing on the course is quietly missing a diagram where it needs one
const NEEDS_FIGURE = ['vol-name', 'vol-fev', 'geo-poly', 'geo-sym', 'ang-classify', 'gr-charts', 'gr-venn'];
for (const id of NEEDS_FIGURE) {
  const { subject } = allLevels.get(id) || {};
  if (!subject) { bad(`${id} missing`); continue; }
  const probs = W.buildMatchFor(subject, id, 8);
  const without = probs.filter((p) => !p.diagram).length;
  if (without) bad(`${id}: ${without}/8 problems have no diagram, but this objective needs one`); else ok();
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
