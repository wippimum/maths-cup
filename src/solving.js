/* solving.js — Problem Solving, the priority topic.
   A "lesson" = 10 worded problems that RAMP from 1 easy step up to a multi-step
   challenge. Every problem is broken into the smallest one-operation steps, each
   step clearly saying WHAT we are finding. Numbers are randomised (kept whole) so
   every lesson is different. */
(function (root) {
  const W = root.WAC || require('./topics.js');
  const pickStep = W._pickStep, numberPool = W._numberPool;
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // one small calculation step
  function step(key, prompt, hint, why, resultText, ans, expr, last) {
    return pickStep({
      key, prompt, hint, why, resultText, expected: [ans], isAnswer: !!last,
      pool: numberPool([ans], 4, Math.max(0, ans - Math.max(6, Math.round(ans * 0.3))), ans + Math.max(6, Math.round(ans * 0.3))),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: ans, expr } }),
    });
  }
  function P(tier, given, steps, answer) { return { subject: 'solve', tier, given, answer: String(answer), steps }; }
  const dh = (n) => `${n} dh`;

  // ---------------- TIER 1 — one step, add / subtract, small ----------------
  const T1 = [
    () => { const a = rand(4, 12), b = rand(3, 11), s = a + b; return P(1, `There are ${a} red balloons and ${b} blue balloons. How many balloons altogether?`, [step('s', `How many balloons altogether? ${a} + ${b} = ?`, `Add them: ${a} + ${b}.`, `"Altogether" means add the two groups.`, `${s} balloons`, s, `${a} + ${b}`, true)], s); },
    () => { const a = rand(12, 20), b = rand(3, 9), s = a - b; return P(1, `A shelf has ${a} books. ${b} are borrowed. How many books are left?`, [step('s', `How many left? ${a} − ${b} = ?`, `Take away the borrowed ones: ${a} − ${b}.`, `"Left" means take the borrowed books away from the total.`, `${s} books`, s, `${a} − ${b}`, true)], s); },
    () => { const a = rand(5, 12), b = rand(4, 10), s = a + b; return P(1, `Sara has ${a} marbles. Ali gives her ${b} more. How many does she have now?`, [step('s', `How many now? ${a} + ${b} = ?`, `Add the marbles Ali gave: ${a} + ${b}.`, `"More" means add on to what she started with.`, `${s} marbles`, s, `${a} + ${b}`, true)], s); },
  ];

  // ---------------- TIER 2 — one step, multiply / divide, small ----------------
  const T2 = [
    () => { const n = rand(3, 6), k = rand(3, 6), s = n * k; return P(2, `There are ${n} boxes with ${k} crayons in each box. How many crayons in total?`, [step('s', `How many crayons? ${n} × ${k} = ?`, `${n} lots of ${k}: ${n} × ${k}.`, `"In each" with equal groups means multiply.`, `${s} crayons`, s, `${n} × ${k}`, true)], s); },
    () => { const n = rand(3, 6), per = rand(2, 6), tot = n * per; return P(2, `${tot} dates are shared equally between ${n} children. How many does each child get?`, [step('s', `How many each? ${tot} ÷ ${n} = ?`, `Share equally: ${tot} ÷ ${n}.`, `"Shared equally" means divide the total by the number of children.`, `${per} each`, per, `${tot} ÷ ${n}`, true)], per); },
    () => { const cars = rand(3, 7), s = cars * 4; return P(2, `Each car has 4 wheels. How many wheels do ${cars} cars have?`, [step('s', `How many wheels? ${cars} × 4 = ?`, `${cars} cars × 4 wheels.`, `Equal groups of 4 — multiply.`, `${s} wheels`, s, `${cars} × 4`, true)], s); },
  ];

  // ---------------- TIER 3 — one step, bigger numbers / "how many more" ----------------
  const T3 = [
    () => { const a = rand(22, 40), b = rand(10, a - 5), s = a - b; return P(3, `The Falcons scored ${a} goals this season. The Lions scored ${b}. How many MORE did the Falcons score?`, [step('s', `How many more? ${a} − ${b} = ?`, `"How many more" means subtract: ${a} − ${b}.`, `To compare two amounts, take the smaller from the bigger.`, `${s} more`, s, `${a} − ${b}`, true)], s); },
    () => { const r = rand(6, 9), c = rand(6, 9), s = r * c; return P(3, `A hall has ${r} rows of ${c} chairs. How many chairs are there?`, [step('s', `How many chairs? ${r} × ${c} = ?`, `${r} rows × ${c} chairs.`, `An array of equal rows — multiply rows × columns.`, `${s} chairs`, s, `${r} × ${c}`, true)], s); },
    () => { const q = rand(3, 6), u = pick([50, 100, 250]), s = q * u; return P(3, `A jug holds ${u} ml. How much water is in ${q} full jugs?`, [step('s', `How much water? ${q} × ${u} = ?`, `${q} lots of ${u} ml.`, `Equal amounts — multiply.`, `${s} ml`, s, `${q} × ${u}`, true)], s); },
  ];

  // ---------------- TIER 4 — two steps (× then + / −) ----------------
  const T4 = [
    () => { const n = rand(3, 5), k = rand(3, 5), m = rand(2, 6), a = n * k, s = a + m; return P(4, `${n} friends each buy ${k} pens. Then they buy ${m} more pens together. How many pens in total?`, [
      step('a', `First, how many pens did the friends buy? ${n} × ${k} = ?`, `${n} × ${k}.`, `Each friend buys ${k}, so multiply.`, `${a} pens`, a, `${n} × ${k}`),
      step('b', `Now add the ${m} extra pens: ${a} + ${m} = ?`, `${a} + ${m}.`, `Add the extra pens to the total.`, `${s} pens`, s, `${a} + ${m}`, true)], s); },
    () => { const n = rand(4, 6), k = rand(5, 7), give = rand(4, 10), a = n * k, s = a - give; return P(4, `There are ${n} packs of ${k} stickers. You give away ${give} stickers. How many are left?`, [
      step('a', `First, how many stickers altogether? ${n} × ${k} = ?`, `${n} × ${k}.`, `${n} packs of ${k} — multiply.`, `${a} stickers`, a, `${n} × ${k}`),
      step('b', `Now take away the ${give} you gave: ${a} − ${give} = ?`, `${a} − ${give}.`, `"Give away" means subtract.`, `${s} stickers`, s, `${a} − ${give}`, true)], s); },
  ];

  // ---------------- TIER 5 — two steps (money & change) ----------------
  const T5 = [
    () => { const price = rand(3, 6), qty = rand(3, 5), cost = price * qty, paid = Math.ceil((cost + rand(3, 9)) / 10) * 10, s = paid - cost; return P(5, `A pen costs ${dh(price)}. You buy ${qty} pens and pay with ${dh(paid)}. How much change do you get?`, [
      step('a', `First, how much do the pens cost? ${qty} × ${price} = ?`, `${qty} × ${price}.`, `Total cost = price × how many.`, `${cost} dh`, cost, `${qty} × ${price}`),
      step('b', `Now the change: ${paid} − ${cost} = ?`, `${paid} − ${cost}.`, `Change = money you gave − money spent.`, `${s} dh change`, s, `${paid} − ${cost}`, true)], s); },
    () => { const wk = rand(5, 9), weeks = rand(4, 6), spend = rand(6, 15), saved = wk * weeks, s = saved - spend; return P(5, `You save ${dh(wk)} each week for ${weeks} weeks, then spend ${dh(spend)}. How much do you have left?`, [
      step('a', `First, how much did you save? ${wk} × ${weeks} = ?`, `${wk} × ${weeks}.`, `Saved = amount each week × number of weeks.`, `${saved} dh`, saved, `${wk} × ${weeks}`),
      step('b', `Now take away what you spent: ${saved} − ${spend} = ?`, `${saved} − ${spend}.`, `Left = saved − spent.`, `${s} dh`, s, `${saved} − ${spend}`, true)], s); },
  ];

  // ---------------- TIER 6 — two steps (÷ then − / ×) ----------------
  const T6 = [
    () => { const size = rand(4, 6), boxes = rand(6, 9), sold = rand(2, boxes - 2), tot = size * boxes, s = boxes - sold; return P(6, `A baker makes ${tot} cupcakes and packs them into boxes of ${size}. She sells ${sold} boxes. How many boxes are left?`, [
      step('a', `First, how many boxes did she make? ${tot} ÷ ${size} = ?`, `${tot} ÷ ${size}.`, `Packing into equal boxes means divide.`, `${boxes} boxes`, boxes, `${tot} ÷ ${size}`),
      step('b', `Now take away the ${sold} sold: ${boxes} − ${sold} = ?`, `${boxes} − ${sold}.`, `Left = made − sold.`, `${s} boxes`, s, `${boxes} − ${sold}`, true)], s); },
    () => { const group = 4, kids = rand(5, 8) * group, cars = kids / group, fuel = rand(10, 20), s = cars * fuel; return P(6, `${kids} children travel in cars that hold ${group} each. Each car costs ${dh(fuel)} in fuel. What is the total fuel cost?`, [
      step('a', `First, how many cars are needed? ${kids} ÷ ${group} = ?`, `${kids} ÷ ${group}.`, `${group} children per car — divide to find the number of cars.`, `${cars} cars`, cars, `${kids} ÷ ${group}`),
      step('b', `Now the fuel: ${cars} × ${fuel} = ?`, `${cars} × ${fuel}.`, `Each car costs ${fuel}, so multiply.`, `${s} dh`, s, `${cars} × ${fuel}`, true)], s); },
  ];

  // ---------------- TIER 7 — three steps ----------------
  const T7 = [
    () => { const na = rand(2, 3), pa = rand(10, 14), nc = rand(2, 4), pc = rand(6, 9), av = na * pa, cv = nc * pc, s = av + cv; return P(7, `Cinema tickets cost ${dh(pa)} for an adult and ${dh(pc)} for a child. ${na} adults and ${nc} children go. What is the total cost?`, [
      step('a', `First, the adults: ${na} × ${pa} = ?`, `${na} × ${pa}.`, `Adults' cost = number × adult price.`, `${av} dh`, av, `${na} × ${pa}`),
      step('b', `Now the children: ${nc} × ${pc} = ?`, `${nc} × ${pc}.`, `Children's cost = number × child price.`, `${cv} dh`, cv, `${nc} × ${pc}`),
      step('c', `Add them for the total: ${av} + ${cv} = ?`, `${av} + ${cv}.`, `Total = adults' cost + children's cost.`, `${s} dh`, s, `${av} + ${cv}`, true)], s); },
    () => { const total = rand(24, 36), boys = rand(10, total - 12), girls = total - boys, teams = pick([2, 3, 6]).valueOf(); const g2 = girls - (girls % teams); const realGirls = boys + g2 <= total ? g2 : girls; const tm = Math.floor(g2 / teams); return P(7, `A class has ${boys + g2} pupils. ${boys} are boys. The girls are put into equal teams of ${teams}. How many teams of girls are there?`, [
      step('a', `First, how many girls? ${boys + g2} − ${boys} = ?`, `${boys + g2} − ${boys}.`, `Girls = total − boys.`, `${g2} girls`, g2, `${boys + g2} − ${boys}`),
      step('b', `Now make teams of ${teams}: ${g2} ÷ ${teams} = ?`, `${g2} ÷ ${teams}.`, `Equal teams — divide.`, `${tm} teams`, tm, `${g2} ÷ ${teams}`, true)], tm); },
  ];

  // ---------------- TIER 8 — three steps with a twist ----------------
  const T8 = [
    () => { const cap = pick([30, 40]), buses = rand(3, 4), total = cap * buses, kids = total - rand(8, 25), s = total - kids; return P(8, `A bus holds ${cap} people. There are ${buses} buses. ${kids} children get on. How many seats are empty?`, [
      step('a', `First, how many seats in total? ${cap} × ${buses} = ?`, `${cap} × ${buses}.`, `Total seats = seats per bus × number of buses.`, `${total} seats`, total, `${cap} × ${buses}`),
      step('b', `Now the empty seats: ${total} − ${kids} = ?`, `${total} − ${kids}.`, `Empty = total seats − children on board.`, `${s} empty`, s, `${total} − ${kids}`, true)], s); },
    () => { const price = rand(10, 14), qty = rand(3, 4), pen = rand(3, 6), cost = price * qty, withPen = cost + pen, paid = Math.ceil((withPen + rand(3, 9)) / 10) * 10, s = paid - withPen; return P(8, `You have ${dh(paid)}. You buy ${qty} books at ${dh(price)} each and a pen for ${dh(pen)}. How much change do you get?`, [
      step('a', `First, the books: ${qty} × ${price} = ?`, `${qty} × ${price}.`, `Books cost = number × price.`, `${cost} dh`, cost, `${qty} × ${price}`),
      step('b', `Add the pen: ${cost} + ${pen} = ?`, `${cost} + ${pen}.`, `Total spent = books + pen.`, `${withPen} dh`, withPen, `${cost} + ${pen}`),
      step('c', `Now the change: ${paid} − ${withPen} = ?`, `${paid} − ${withPen}.`, `Change = money given − total spent.`, `${s} dh change`, s, `${paid} − ${withPen}`, true)], s); },
  ];

  // ---------------- TIER 9 — four steps ----------------
  const T9 = [
    () => { const b1 = rand(3, 4), p1 = rand(10, 12), b2 = rand(3, 4), p2 = rand(8, 10), sold = rand(10, 20), i1 = b1 * p1, i2 = b2 * p2, tot = i1 + i2, s = tot - sold; return P(9, `A shop has ${b1} boxes of ${p1} pens and ${b2} boxes of ${p2} pencils. It sells ${sold} items. How many items are left?`, [
      step('a', `First, the pens: ${b1} × ${p1} = ?`, `${b1} × ${p1}.`, `Pens = boxes × pens per box.`, `${i1} pens`, i1, `${b1} × ${p1}`),
      step('b', `Now the pencils: ${b2} × ${p2} = ?`, `${b2} × ${p2}.`, `Pencils = boxes × pencils per box.`, `${i2} pencils`, i2, `${b2} × ${p2}`),
      step('c', `How many items altogether? ${i1} + ${i2} = ?`, `${i1} + ${i2}.`, `Total = pens + pencils.`, `${tot} items`, tot, `${i1} + ${i2}`),
      step('d', `Now take away the ${sold} sold: ${tot} − ${sold} = ?`, `${tot} − ${sold}.`, `Left = total − sold.`, `${s} items`, s, `${tot} − ${sold}`, true)], s); },
    () => { const na = 2, pa = rand(14, 16), nc = rand(3, 4), pc = rand(7, 9), vch = pick([15, 20]), av = na * pa, cv = nc * pc, tot = av + cv, s = tot - vch; return P(9, `${na} adults (${dh(pa)} each) and ${nc} children (${dh(pc)} each) buy tickets, then use a ${dh(vch)} voucher. How much do they pay in the end?`, [
      step('a', `First, the adults: ${na} × ${pa} = ?`, `${na} × ${pa}.`, `Adults = number × price.`, `${av} dh`, av, `${na} × ${pa}`),
      step('b', `Now the children: ${nc} × ${pc} = ?`, `${nc} × ${pc}.`, `Children = number × price.`, `${cv} dh`, cv, `${nc} × ${pc}`),
      step('c', `Total before the voucher: ${av} + ${cv} = ?`, `${av} + ${cv}.`, `Total = adults + children.`, `${tot} dh`, tot, `${av} + ${cv}`),
      step('d', `Now take off the voucher: ${tot} − ${vch} = ?`, `${tot} − ${vch}.`, `The voucher reduces what they pay.`, `${s} dh`, s, `${tot} − ${vch}`, true)], s); },
  ];

  // ---------------- TIER 10 — the hardest, four+ steps ----------------
  const T10 = [
    () => { const boxes = rand(4, 6), per = rand(15, 20), cost = 2, sell = 3, bars = boxes * per, c = bars * cost, sales = bars * sell, s = sales - c; return P(10, `A shop buys ${boxes} boxes of ${per} chocolate bars. Each bar costs ${dh(cost)} to buy and sells for ${dh(sell)}. What is the total profit?`, [
      step('a', `First, how many bars altogether? ${boxes} × ${per} = ?`, `${boxes} × ${per}.`, `Bars = boxes × bars per box.`, `${bars} bars`, bars, `${boxes} × ${per}`),
      step('b', `What did they cost to buy? ${bars} × ${cost} = ?`, `${bars} × ${cost}.`, `Cost = bars × buy price.`, `${c} dh`, c, `${bars} × ${cost}`),
      step('c', `How much money from selling them? ${bars} × ${sell} = ?`, `${bars} × ${sell}.`, `Sales = bars × sell price.`, `${sales} dh`, sales, `${bars} × ${sell}`),
      step('d', `Profit = money in − money out: ${sales} − ${c} = ?`, `${sales} − ${c}.`, `Profit = what you get − what you paid.`, `${s} dh profit`, s, `${sales} − ${c}`, true)], s); },
    () => { const size = pick([6, 8]), boxes = rand(5, 7), free = rand(1, 2), price = rand(12, 16), total = size * boxes, left = boxes - free, s = left * price; return P(10, `${total} cupcakes are packed into boxes of ${size}. ${free} box${free > 1 ? 'es are' : ' is'} given away free, and the rest are sold for ${dh(price)} each. How much money is made?`, [
      step('a', `First, how many boxes are there? ${total} ÷ ${size} = ?`, `${total} ÷ ${size}.`, `Boxes = cupcakes ÷ box size.`, `${boxes} boxes`, boxes, `${total} ÷ ${size}`),
      step('b', `How many boxes are sold? ${boxes} − ${free} = ?`, `${boxes} − ${free}.`, `Sold = total boxes − free boxes.`, `${left} boxes`, left, `${boxes} − ${free}`),
      step('c', `Money made: ${left} × ${price} = ?`, `${left} × ${price}.`, `Money = boxes sold × price each.`, `${s} dh`, s, `${left} × ${price}`, true)], s); },
    () => { const seats = 15, buses = rand(4, 5), players = rand(40, 50), adults = rand(4, 8), total = seats * buses, people = players + adults, s = total - people; return P(10, `A coach books ${buses} minibuses with ${seats} seats each for ${players} players and ${adults} adults. How many seats are empty?`, [
      step('a', `First, how many seats in total? ${buses} × ${seats} = ?`, `${buses} × ${seats}.`, `Seats = buses × seats each.`, `${total} seats`, total, `${buses} × ${seats}`),
      step('b', `How many people are going? ${players} + ${adults} = ?`, `${players} + ${adults}.`, `People = players + adults.`, `${people} people`, people, `${players} + ${adults}`),
      step('c', `Empty seats: ${total} − ${people} = ?`, `${total} − ${people}.`, `Empty = seats − people.`, `${s} empty`, s, `${total} − ${people}`, true)], s); },
  ];

  const TIERS = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
  const PLANS = {
    'solve-lesson': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'solve-easy': [1, 1, 2, 2, 3, 3, 4, 4, 5, 6],
    'solve-hard': [4, 5, 5, 6, 7, 7, 8, 8, 9, 10],
  };

  // Build one ramped lesson: for each slot in the plan, pick a fresh template of that tier.
  function buildSolveLesson(levelId, n) {
    const plan = (PLANS[levelId] || PLANS['solve-lesson']).slice(0, n || 10);
    const out = [], seen = new Set();
    for (const tier of plan) {
      const templates = TIERS[tier - 1];
      let prob, tries = 0;
      do { prob = pick(templates)(); tries++; } while (seen.has(prob.given) && tries < 30);
      seen.add(prob.given); out.push(prob);
    }
    return out;
  }
  function solveRandom() { return pick(TIERS[rand(0, 9)])(); }

  const api = { buildSolveLesson, solveRandom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
