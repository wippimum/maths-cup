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
  'topics2', 'topics3', 'topics4', 'topics5', 'primes', 'coords', 'numeracy1', 'algebra1', 'curriculum1', 'curriculum2',
  'harder', 'harder2', 'bidmas', 'solving', 'problems']) {
  Object.assign(W, require(path + f + '.js'));
}

let checks = 0, fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const ok = () => { checks++; };

// Every line below is an objective transcribed verbatim from a Toddle unit plan's
// "Specific understandings", mapped to the level(s) that teach it.
const COVERAGE = {
  'T1 Numeracy': {
    'Recall times tables': ['num-tables'],
    'Add and subtract large integers': ['num-addsub'],
    'Multiply integers': ['num-multiply'],
    'Short division with no remainders': ['num-divide'],
    'Short division with decimal answers': ['num-divdec'],
  },
  'T2 Integers': {
    'Understand place value': ['num-pv'],
    'Use directed numbers in practical situations': ['int-context', 'int-addsub', 'int-muldiv', 'int-hard'],
    'Order integers': ['num-order', 'num-hard'],
    'Order of operations': ['bid-spot', 'bid-md', 'bid-brackets', 'bid-lr', 'bid-indices', 'bid-mix'],
  },
  'T3 Number Properties': {
    'Identify factors and prime factors': ['prime-spot', 'prime-hunt', 'prime-two', 'prime-index'],
    'Identify HCF using the listing method': ['hcf-warm', 'hcf-main', 'hcf-big'],
    'Identify LCM using the listing method': ['lcm-warm', 'lcm-main', 'lcm-big'],
    'Identify square and cube numbers; calculate squares, roots, cubes, cube roots': ['prime-powers'],
  },
  'T4 Fractions': {
    'Equivalent fractions / simplify by common factors': ['frac-simplify'],
    'Express a number as a fraction of another number': ['frac-ofwhat'],
    'Find fractions of an amount': ['frac-of'],
    'Convert between mixed numbers and improper fractions': ['frac-mixed'],
    'Add and subtract fractions, same and different denominators': ['frac-add'],
    'Multiply fractions / divide fractions': ['frac-muldiv'],
  },
  'T5 Introduction to Algebra': {
    'Algebraic notation to read and write expressions': ['alg1-notation'],
    'Writing expressions in context': ['alg1-notation'],
    'Substituting positive integers into expressions': ['alg1-sub'],
    'Substituting negative integers into expressions': ['alg1-subneg'],
    "Recognising 'like terms' and collecting them": ['alg1-collect', 'alg1-collect2'],
    'Expressions from real-life contexts such as area and perimeter': ['alg1-perim'],
  },
  'T6 Symmetry and Co-ordinates': {
    'Identify lines of symmetry of a 2D figure': ['geo-sym'],
    'Identify order of rotational symmetry': ['geo-sym'],
    'Read coordinates from graphs': ['co-read'],
    'Plot points in any of four quadrants': ['co-read-neg'],
    'Use symmetry in the axes to complete polygons': ['co-reflect', 'co-complete'],
  },
  'T7 Degrees of Accuracy': {
    'Round to the nearest 10, 100, 1000': ['round-nearest'],
    'Round to the nearest integer / decimals': ['round-dp'],
  },
  'T8 Calculating With Decimals': {
    'Compare, order and round decimals': ['num-hard', 'dec-power'],
    'Add and subtract decimals': ['dec-addsub'],
    'Multiply decimals / divide decimals by integers and by decimals': ['dec-muldiv'],
  },
  'T9 Linear Equations': {
    'Form and solve one-step equations': ['warmup'],
    'Form and solve one-step equations that include fractions': ['eq-frac'],
    'Form and solve two-step equations': ['group', 'r16', 'qf', 'sf'],
  },
  'T10 Angles': {
    'Classify angles and estimate their size': ['ang-classify'],
    'Missing angles on a straight line': ['ang-missing'],
    'Angles around a point and vertically opposite': ['ang-missing', 'ang-classify'],
    'Isosceles, equilateral and right-angled triangles': ['ang-tri', 'ang-quad'],
    'Angle sum of quadrilaterals': ['ang-quad'],
  },
  'T11 Fractions, Decimals and Percentages': {
    'Convert between decimals and fractions': ['fdp-fd'],
    'Convert between fractions and percentages': ['fdp-pf'],
    'Order fractions, decimals and percentages': ['fdp-order'],
  },
  'T12 Mensuration of 2D Shapes': {
    'Convert between metric units for length and mass': ['meas-length', 'meas-mixed'],
    'Convert between metric units for area and volume': ['meas-areavol'],
    'Perimeter of 2D shapes including composite': ['area-rect', 'area-comp'],
    'Area of rectangles and parallelograms': ['area-rect', 'area-comp'],
    'Area of triangles': ['area-tri'],
    'Break composite shapes into simpler shapes': ['area-comp'],
  },
  'T13 Statistical Measures': {
    'Interpret linear and non-linear graphs, incl. conversion graphs': ['stat-graphs'],
    'Mean, median, mode and range from a list': ['stat-modrange', 'stat-mean', 'stat-median'],
    'Compare two data sets using mean and range': ['stat-compare'],
  },
  'T14 Graphical Representation of Data': {
    'Interpret and draw a pictogram': ['gr-pict'],
    'Interpret and draw a bar chart': ['gr-bar', 'gr-scale'],
    'Interpret and draw a pie chart': ['gr-charts'],
    'Interpret and draw a line graph': ['gr-charts'],
    'Record data in frequency tables': ['gr-charts'],
    'Sort data in Venn diagrams': ['gr-venn'],
  },
  'T15 Percentages': {
    'Express a number as a percentage of another number': ['pc-ofwhat'],
    'Percentage of an amount by written methods (50%, 10%, 1%)': ['pc-of', 'pc-any'],
    'Percentage increase / decrease by non-calculator methods': ['pc-change'],
  },
  'T16 Geometric Properties': {
    'Name polygons; regular vs irregular': ['geo-poly'],
    'Circle terms: centre, radius, chord, diameter, circumference, tangent, arc, sector, segment': ['geo-circle'],
  },
  'T17 3D Shape and Volume': {
    'Identify cube, cuboid, pyramid, cylinder, sphere, cone': ['vol-name'],
    'Identify vertices, edges and faces of a solid': ['vol-fev'],
    'Construct nets of common solids': ['vol-nets'],
    'Find the volume of cubes and cuboids': ['vol-cuboid'],
    'Find the volume of prisms': ['vol-prism'],
  },
};

// levels that go BEYOND the Year 6 course — allowed, but they must say so
const EXPECTED_STRETCH = new Set([
  'prime-square', 'prime-hcflcm',      // beyond-Y7 index-form work
  'hcf-pro', 'lcm-pro',                // HCF/LCM of three numbers
  'round-sf',                          // significant figures (T7 stops at decimal places)
  'final',                             // brackets (T9 is one- and two-step equations)
  'ang-hard',                          // parallel lines, polygon angle sums
  'area-trap',                         // trapezium (T12 lists rectangles, parallelograms, triangles)
  'stat-hard',                         // reverse mean
  'gr-hard',                           // two-way tables
  'pc-hard',                           // reverse percentages
  'vol-hard',                          // surface area (T17 has volume and nets, not surface area)
  'co-mid',                            // midpoint
  'geo-facts', 'geo-props',            // loose shape facts; T16 is only polygons and circles
  'ratio-simplify', 'ratio-share', 'ratio-hard',   // ratio is not a Y6 Toddle topic at all
]);

const allLevels = new Map();
for (const s of W.SUBJECTS) for (const l of s.levels) allLevels.set(l.id, { subject: s.id, level: l });

console.log('Checking the app against the Toddle Year 6 course…\n');

// 1. every OBJECTIVE has at least one level, and every one of those levels really builds
for (const [topic, objectives] of Object.entries(COVERAGE)) {
  let topicOk = true;
  for (const [objective, ids] of Object.entries(objectives)) {
    const missing = ids.filter((id) => !allLevels.has(id));
    if (missing.length) { bad(`${topic} — "${objective}": no level (${missing.join(', ')})`); topicOk = false; continue; }
    let broke = null;
    for (const id of ids) {
      const { subject } = allLevels.get(id);
      try {
        const m = W.buildMatchFor(subject, id, 3);
        if (m.length !== 3) broke = `${id} built ${m.length} problems`;
      } catch (e) { broke = `${id} threw: ${e.message}`; }
    }
    if (broke) { bad(`${topic} — "${objective}": ${broke}`); topicOk = false; } else ok();
  }
  const n = Object.keys(objectives).length;
  console.log(`  ${topicOk ? '✓' : '✗'} ${topic.padEnd(44)} ${n} objective${n === 1 ? '' : 's'}`);
}

// 2. a level is either on the course or flagged as stretch — never neither
const onCourse = new Set(Object.values(COVERAGE).flatMap((o) => Object.values(o).flat()));
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
const NEEDS_FIGURE = ['vol-name', 'vol-nets', 'vol-fev', 'geo-poly', 'geo-circle', 'geo-sym', 'ang-classify', 'gr-venn'];
for (const id of NEEDS_FIGURE) {
  const { subject } = allLevels.get(id) || {};
  if (!subject) { bad(`${id} missing`); continue; }
  const probs = W.buildMatchFor(subject, id, 8);
  const without = probs.filter((p) => !p.diagram).length;
  if (without) bad(`${id}: ${without}/8 problems have no diagram, but this objective needs one`); else ok();
}

// 5. the tiles are listed in school topic order, T1 → T17, extras last.
//    A child looking for "Topic 7" should find it seventh, not hunt the grid.
{
  const nums = W.SUBJECTS.map((s) => s.topic);
  const firstExtra = nums.indexOf(undefined);
  const topiced = firstExtra === -1 ? nums : nums.slice(0, firstExtra);
  if (firstExtra !== -1 && topiced.includes(undefined)) {
    bad('subjects with no topic number must all sit at the end of the list');
  } else ok();
  for (let i = 1; i < topiced.length; i++) {
    if (topiced[i] < topiced[i - 1]) {
      bad(`subject order goes backwards: T${topiced[i - 1]} (${W.SUBJECTS[i - 1].id}) before T${topiced[i]} (${W.SUBJECTS[i].id})`);
    } else ok();
  }
  // every Toddle topic 1–17 has at least one tile
  for (let t = 1; t <= 17; t++) {
    if (!nums.includes(t)) bad(`no subject tile is labelled Topic ${t}`); else ok();
  }
}

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
