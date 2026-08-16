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
    () => { const b1 = rand(3, 4), p1 = rand(10, 12), b2 = rand(3, 4), p2 = rand(8, 10), sold = rand(10, 20), i1 = b1 * p1, i2 = b2 * p2, tot = i1 + i2, s = tot - sold; return P(10, `A shop has ${b1} boxes of ${p1} pens and ${b2} boxes of ${p2} pencils. It sells ${sold} items. How many items are left?`, [
      step('a', `First, the pens: ${b1} × ${p1} = ?`, `${b1} × ${p1}.`, `Pens = boxes × pens per box.`, `${i1} pens`, i1, `${b1} × ${p1}`),
      step('b', `Now the pencils: ${b2} × ${p2} = ?`, `${b2} × ${p2}.`, `Pencils = boxes × pencils per box.`, `${i2} pencils`, i2, `${b2} × ${p2}`),
      step('c', `How many items altogether? ${i1} + ${i2} = ?`, `${i1} + ${i2}.`, `Total = pens + pencils.`, `${tot} items`, tot, `${i1} + ${i2}`),
      step('d', `Now take away the ${sold} sold: ${tot} − ${sold} = ?`, `${tot} − ${sold}.`, `Left = total − sold.`, `${s} items`, s, `${tot} − ${sold}`, true)], s); },
    () => { const na = 2, pa = rand(14, 16), nc = rand(3, 4), pc = rand(7, 9), vch = pick([15, 20]), av = na * pa, cv = nc * pc, tot = av + cv, s = tot - vch; return P(10, `${na} adults (${dh(pa)} each) and ${nc} children (${dh(pc)} each) buy tickets, then use a ${dh(vch)} voucher. How much do they pay in the end?`, [
      step('a', `First, the adults: ${na} × ${pa} = ?`, `${na} × ${pa}.`, `Adults = number × price.`, `${av} dh`, av, `${na} × ${pa}`),
      step('b', `Now the children: ${nc} × ${pc} = ?`, `${nc} × ${pc}.`, `Children = number × price.`, `${cv} dh`, cv, `${nc} × ${pc}`),
      step('c', `Total before the voucher: ${av} + ${cv} = ?`, `${av} + ${cv}.`, `Total = adults + children.`, `${tot} dh`, tot, `${av} + ${cv}`),
      step('d', `Now take off the voucher: ${tot} − ${vch} = ?`, `${tot} − ${vch}.`, `The voucher reduces what they pay.`, `${s} dh`, s, `${tot} − ${vch}`, true)], s); },
  ];

  // ---------------- TIER 10 — the hardest, four+ steps ----------------
  const T10 = [
    () => { const boxes = rand(4, 6), per = rand(15, 20), cost = 2, sell = 3, bars = boxes * per, c = bars * cost, sales = bars * sell, s = sales - c; return P(9, `A shop buys ${boxes} boxes of ${per} chocolate bars. Each bar costs ${dh(cost)} to buy and sells for ${dh(sell)}. What is the total profit?`, [
      step('a', `First, how many bars altogether? ${boxes} × ${per} = ?`, `${boxes} × ${per}.`, `Bars = boxes × bars per box.`, `${bars} bars`, bars, `${boxes} × ${per}`),
      step('b', `What did they cost to buy? ${bars} × ${cost} = ?`, `${bars} × ${cost}.`, `Cost = bars × buy price.`, `${c} dh`, c, `${bars} × ${cost}`),
      step('c', `How much money from selling them? ${bars} × ${sell} = ?`, `${bars} × ${sell}.`, `Sales = bars × sell price.`, `${sales} dh`, sales, `${bars} × ${sell}`),
      step('d', `Profit = money in − money out: ${sales} − ${c} = ?`, `${sales} − ${c}.`, `Profit = what you get − what you paid.`, `${s} dh profit`, s, `${sales} − ${c}`, true)], s); },
    () => { const size = pick([6, 8]), boxes = rand(5, 7), free = rand(1, 2), price = rand(12, 16), total = size * boxes, left = boxes - free, s = left * price; return P(9, `${total} cupcakes are packed into boxes of ${size}. ${free} box${free > 1 ? 'es are' : ' is'} given away free, and the rest are sold for ${dh(price)} each. How much money is made?`, [
      step('a', `First, how many boxes are there? ${total} ÷ ${size} = ?`, `${total} ÷ ${size}.`, `Boxes = cupcakes ÷ box size.`, `${boxes} boxes`, boxes, `${total} ÷ ${size}`),
      step('b', `How many boxes are sold? ${boxes} − ${free} = ?`, `${boxes} − ${free}.`, `Sold = total boxes − free boxes.`, `${left} boxes`, left, `${boxes} − ${free}`),
      step('c', `Money made: ${left} × ${price} = ?`, `${left} × ${price}.`, `Money = boxes sold × price each.`, `${s} dh`, s, `${left} × ${price}`, true)], s); },
    () => { const seats = 15, buses = rand(4, 5), players = rand(40, 50), adults = rand(4, 8), total = seats * buses, people = players + adults, s = total - people; return P(9, `A coach books ${buses} minibuses with ${seats} seats each for ${players} players and ${adults} adults. How many seats are empty?`, [
      step('a', `First, how many seats in total? ${buses} × ${seats} = ?`, `${buses} × ${seats}.`, `Seats = buses × seats each.`, `${total} seats`, total, `${buses} × ${seats}`),
      step('b', `How many people are going? ${players} + ${adults} = ?`, `${players} + ${adults}.`, `People = players + adults.`, `${people} people`, people, `${players} + ${adults}`),
      step('c', `Empty seats: ${total} − ${people} = ?`, `${total} − ${people}.`, `Empty = seats − people.`, `${s} empty`, s, `${total} − ${people}`, true)], s); },
  ];

  // ============================================================================
  // TIERS 11-17 — the level the course is actually heading for.
  //
  // Tiers 1-10 stop at whole-number arithmetic: every number is small, every
  // operation is + − × ÷, and nothing has to be interpreted. The CGP Foundation
  // book the school issued asks a different kind of question at this stage, and
  // these tiers are modelled directly on the ones that sit inside the
  // Year 6 topics (T1 numeracy, T4 fractions, T8 decimals, T11 FDP, T12 units, T15 %):
  //
  //   "A box of chocolates costs £4.65 ... six boxes and 3 bunches ... altogether?"
  //   "It costs £35.55 to buy nine identical books. How much for seven?"
  //   "55 chocolates, 33 are milk, the rest dark. What percentage are dark?"
  //   "Lucy grows 4.6 kg of potatoes and sells 800 g. What mass is left, in g?"
  //   "Eggs are packed into boxes of 6. How many boxes are needed for 1350 eggs?"
  //   "The bill is £63, plus a 13% service charge. How much in total?"
  //   "0.37 are green, 12% are pink, the rest yellow. What percentage are yellow?"
  //
  // What makes these harder is not bigger numbers — it is that the child has to
  // decide WHICH operation, carry a decimal, or interpret what the answer means.
  // All money is held in fils (integers) and formatted on the way out, so nothing
  // here can drift the way binary floats do.
  const money = (fils) => {
    const neg = fils < 0, v = String(Math.abs(fils)).padStart(3, '0');
    return `${neg ? '-' : ''}${v.slice(0, -2)}.${v.slice(-2)}`;
  };
  const dhm = (fils) => `${money(fils)} dh`;
  // a step whose answer is not a plain integer — the options are given explicitly
  function sstep(key, prompt, hint, why, resultText, ans, pool, expr, last) {
    return pickStep({
      key, prompt, hint, why, resultText, expected: [ans], isAnswer: !!last,
      pool: [...new Set(pool.concat([ans]))].sort(),
      diagnose: () => ({ correct: false, id: 'num-wrong', ctx: { answer: ans, expr } }),
    });
  }

  // ---------------- TIER 11 — two decimal costs, then a total ----------------
  const T_MONEY = [
    () => {
      // prices land on a 5 or a 0, the way real ones do — 4.02 dh reads like a bug
      const p1 = rand(43, 139) * 5, n1 = rand(3, 6), p2 = rand(150, 299) * 5, n2 = rand(2, 4);
      const a = p1 * n1, b = p2 * n2, s = a + b;
      const it1 = pick(['a box of dates', 'a box of chocolates', 'a tub of ice cream']);
      const it2 = pick(['a bunch of flowers', 'a cake', 'a bag of pistachios']);
      return P(15, `${it1[0].toUpperCase()}${it1.slice(1)} costs ${dhm(p1)} and ${it2} costs ${dhm(p2)}. Mum buys ${n1} of the first and ${n2} of the second. How much does she spend altogether?`, [
        sstep('a', `First, the ${n1} at ${dhm(p1)} each: ${n1} × ${money(p1)} = ?`, `${n1} × ${money(p1)} = ${money(a)}.`,
          `Work out one kind at a time. Multiply the price by how many — the decimal point does not change that.`,
          `${dhm(a)}`, money(a), [money(a + 100), money(a - 100), money(p1 + n1)], `${n1} × ${money(p1)}`),
        sstep('b', `Now the ${n2} at ${dhm(p2)} each: ${n2} × ${money(p2)} = ?`, `${n2} × ${money(p2)} = ${money(b)}.`,
          `Same again for the second thing. Keep the two totals apart until the end.`,
          `${dhm(b)}`, money(b), [money(b + 100), money(b - 100), money(b + 10)], `${n2} × ${money(p2)}`),
        sstep('c', `Add the two totals: ${money(a)} + ${money(b)} = ?`, `${money(a)} + ${money(b)} = ${money(s)}.`,
          `"Altogether" means add. Line the decimal points up under each other before adding.`,
          `${dhm(s)}`, money(s), [money(s + 100), money(s - 10), money(a + b + 1000)], `${money(a)} + ${money(b)}`, true)], money(s));
    },
  ];

  // ---------------- TIER 12 — unit rate: divide to find one, multiply back ----------------
  const T_RATE = [
    () => {
      const unit = rand(31, 179) * 5, n = rand(6, 9), m = rand(3, 12), total = unit * n, s = unit * m;
      const thing = pick(['identical books', 'identical mugs', 'identical footballs', 'identical notebooks']);
      return P(13, `It costs ${dhm(total)} to buy ${n} ${thing}. How much would ${m} of them cost?`, [
        sstep('a', `First find the cost of ONE: ${money(total)} ÷ ${n} = ?`, `${money(total)} ÷ ${n} = ${money(unit)}.`,
          `You cannot get from ${n} to ${m} in one jump. Find what ONE costs first — that single value is the bridge between any two quantities.`,
          `one costs ${dhm(unit)}`, money(unit), [money(unit + 100), money(unit - 100), money(total - unit)], `${money(total)} ÷ ${n}`),
        sstep('b', `Now ${m} of them: ${m} × ${money(unit)} = ?`, `${m} × ${money(unit)} = ${money(s)}.`,
          `Multiply the cost of one by how many you want. Divide to find one, multiply to find many.`,
          `${dhm(s)}`, money(s), [money(s + 100), money(s - 100), money(total + unit)], `${m} × ${money(unit)}`, true)], money(s));
    },
  ];

  // ---------------- TIER 13 — "the rest are…" as a percentage ----------------
  const T_REST = [
    () => {
      const total = pick([20, 25, 40, 50, 80, 200]);
      const restPct = pick([20, 25, 40, 60, 75]);
      const rest = total * restPct / 100;
      if (!Number.isInteger(rest) || rest === total) return T_REST[0]();
      const part = total - rest, partPct = 100 - restPct;
      const c = pick([
        { s: `There are ${total} chocolates in a tin. ${part} of them are milk chocolate. The rest are dark.`, q: 'are dark' },
        { s: `A book club has ${total} members. ${part} of them have read the new book. The rest have not.`, q: 'have NOT read it' },
        { s: `A car park has ${total} spaces. ${part} of them are taken. The rest are free.`, q: 'are free' },
      ]);
      return P(11, `${c.s} What percentage ${c.q}?`, [
        step('a', `The question is about the REST. How many is that? ${total} − ${part} = ?`, `${total} − ${part} = ${rest}.`,
          `The number you want is not written down — you have to make it first. "The rest" always means the total take away the part you were given.`,
          `${rest}`, rest, `${total} − ${part}`),
        step('b', `Now as a percentage: what is ${rest} out of ${total}?`, `${rest}/${total} = ${restPct}%.`,
          `A percentage is a fraction out of 100. ${rest} out of ${total} simplifies, and scaling that up to 100 gives ${restPct}%. Watch the trap: ${partPct}% is the answer to the OTHER question.`,
          `${restPct}%`, restPct, `${rest} out of ${total} as a percentage`, true)], `${restPct}%`);
    },
  ];

  // ---------------- TIER 14 — convert the units, THEN calculate ----------------
  const T_UNITS = [
    () => {
      const kind = pick(['mass', 'volume', 'length']);
      const big = kind === 'mass' ? 'kg' : kind === 'volume' ? 'litres' : 'm';
      const small = kind === 'mass' ? 'g' : kind === 'volume' ? 'ml' : 'cm';
      const k = kind === 'length' ? 100 : 1000;
      const tenths = rand(15, 95), whole = tenths * (k / 10);          // e.g. 4.6 kg = 4600 g
      // a chunk worth subtracting: 200-900 g / ml, or 100-450 cm
      const used = kind === 'length' ? rand(2, 9) * 50 : rand(2, 9) * (k / 10);
      if (used >= whole) return T_UNITS[0]();
      const left = whole - used;
      const shown = `${Math.floor(tenths / 10)}.${tenths % 10}`;
      const c = kind === 'mass'
        ? { s: `Lulu grows ${shown} ${big} of potatoes and sells ${used} ${small}.`, q: 'is left' }
        : kind === 'volume'
          ? { s: `A jug holds ${shown} ${big} of juice. ${used} ${small} is poured out.`, q: 'is left in the jug' }
          : { s: `A roll of ribbon is ${shown} ${big} long. A piece ${used} ${small} long is cut off.`, q: 'is left' };
      return P(12, `${c.s} What amount ${c.q}? Give your answer in ${small}.`, [
        step('a', `The two amounts are in different units, so they cannot be subtracted yet. Change ${shown} ${big} into ${small}: ${shown} × ${k} = ?`,
          `1 ${big.replace(/s$/, '')} = ${k} ${small}, so ${shown} × ${k} = ${whole}.`,
          `You can only add or subtract measurements that are in the SAME unit — ${shown} − ${used} would be nonsense here. Convert to the smaller unit first, because that keeps everything a whole number.`,
          `${whole} ${small}`, whole, `${shown} × ${k}`),
        step('b', `Now subtract: ${whole} − ${used} = ?`, `${whole} − ${used} = ${left}.`,
          `Both amounts are in ${small} now, so they can be taken away from each other. The answer was asked for in ${small}, so this is the finish.`,
          `${left} ${small}`, left, `${whole} − ${used}`, true)], `${left} ${small}`);
    },
  ];

  // ---------------- TIER 15 — divide, then interpret the remainder ----------------
  const T_REMAIN = [
    () => {
      const per = pick([6, 8, 12, 15]), full = rand(9, 40), rem = rand(1, per - 1);
      const total = per * full + rem, need = full + 1;
      const c = pick([
        { s: `Eggs are packed into boxes that hold ${per} eggs each.`, thing: 'eggs', box: 'boxes' },
        { s: `Chairs are carried on trolleys that hold ${per} chairs each.`, thing: 'chairs', box: 'trolleys' },
        { s: `Children travel in minibuses that hold ${per} children each.`, thing: 'children', box: 'minibuses' },
      ]);
      return P(16, `${c.s} How many ${c.box} are NEEDED for ${total} ${c.thing}?`, [
        step('a', `First divide: how many FULL ${c.box} is that? ${total} ÷ ${per} = ? (just the whole part)`,
          `${per} × ${full} = ${per * full}, which is ${rem} short of ${total}. So ${full} full ${c.box}.`,
          `Divide to see how many complete ${c.box} you can fill.`,
          `${full} full ${c.box}`, full, `${total} ÷ ${per}, whole part`),
        step('b', `How many ${c.thing} are left over? ${total} − ${per * full} = ?`, `${total} − ${per * full} = ${rem}.`,
          `The remainder is what will not fit into a full ${c.box.replace(/e?s$/, '')}.`,
          `${rem} left over`, rem, `${total} − ${per * full}`),
        step('c', `So how many ${c.box} are NEEDED altogether?`, `${need} — the ${rem} left over still need one more.`,
          `This is the step the calculator cannot do for you. The division says ${full} remainder ${rem}, but the ${rem} ${c.thing} left over cannot be thrown away — they need a ${c.box.replace(/e?s$/, '')} of their own. So round UP to ${need}. If the question had asked how many ${c.box} could be FILLED, the answer would be ${full} instead.`,
          `${need} ${c.box}`, need, `${full} + 1 for the leftovers`, true)], need);
    },
  ];

  // ---------------- TIER 16 — percentage on top, by 10% and 1% ----------------
  const T_PCTUP = [
    () => {
      // 11-19%: a service charge anyone would recognise. 25% would be arithmetic
      // dressed up as a restaurant.
      const bill = rand(24, 96), pct = 10 + rand(1, 9);
      const tens = Math.floor(pct / 10), ones = pct % 10;
      const b = bill * 100, ten = b / 10, one = b / 100;
      const charge = ten * tens + one * ones, s = b + charge;
      const c = pick([
        { s: `A family eat at a restaurant. The bill is ${bill} dh, and the restaurant adds a ${pct}% service charge.`, q: 'How much do they pay in total?' },
        { s: `A bike costs ${bill} dh, and delivery adds ${pct}% to the price.`, q: 'How much is it with delivery?' },
      ]);
      return P(17, `${c.s} ${c.q}`, [
        sstep('a', `Start with the easy one: what is 10% of ${bill} dh?`, `10% of ${bill} = ${money(ten)}.`,
          `10% means one tenth, so divide by 10 — just move the digits one place. Building a percentage out of 10% and 1% is how this is done without a calculator.`,
          `10% = ${dhm(ten)}`, money(ten), [money(ten * 10), money(one), money(ten + 100)], `${bill} ÷ 10`),
        sstep('b', `And 1% of ${bill} dh?`, `1% of ${bill} = ${money(one)}.`,
          `1% is one hundredth — divide by 100, which moves the digits two places.`,
          `1% = ${dhm(one)}`, money(one), [money(ten), money(one * 10), money(one + 10)], `${bill} ÷ 100`),
        sstep('c', `Now build ${pct}%: that is ${tens} × 10% + ${ones} × 1% = ?`,
          `${tens} × ${money(ten)} + ${ones} × ${money(one)} = ${money(charge)}.`,
          `Any whole percentage can be built from tens and ones. ${pct}% = ${tens * 10}% + ${ones}%.`,
          `${pct}% = ${dhm(charge)}`, money(charge), [money(charge + 100), money(charge - 100), money(ten * pct)], `${tens} × 10% + ${ones} × 1%`),
        sstep('d', `Finally, add it to the bill: ${bill}.00 + ${money(charge)} = ?`, `${money(b)} + ${money(charge)} = ${money(s)}.`,
          `A service charge is added ON TOP — the answer must be more than the original ${bill} dh, not less. That check catches the commonest slip.`,
          `${dhm(s)}`, money(s), [money(charge), money(b - charge), money(s + 100)], `${money(b)} + ${money(charge)}`, true)], money(s));
    },
  ];

  // ---------------- TIER 17 — mixed forms: decimal, percentage, and the rest ----------------
  const T_FORMS = [
    () => {
      const dec = rand(15, 45), pctB = pick([10, 12, 15, 20, 24, 25]);
      const yellow = 100 - dec - pctB;
      if (yellow < 10) return T_FORMS[0]();
      const shown = `0.${String(dec).padStart(2, '0')}`;
      const c = pick([
        { a: 'green', b: 'pink', r: 'yellow', s: 'counters in a bag' },
        { a: 'blue', b: 'red', r: 'white', s: 'beads on a string' },
      ]);
      return P(14, `Of the ${c.s}, ${shown} are ${c.a}, ${pctB}% are ${c.b}, and the rest are ${c.r}. What percentage are ${c.r}?`, [
        step('a', `The two amounts are written in different forms. Change ${shown} into a percentage.`,
          `${shown} = ${dec}%.`,
          `A decimal and a percentage cannot be added as they stand. Multiply the decimal by 100 to make it a percentage — ${shown} of something is ${dec} out of every 100 of them.`,
          `${shown} = ${dec}%`, dec, `${shown} × 100`),
        step('b', `Now add the two you know: ${dec}% + ${pctB}% = ?`, `${dec} + ${pctB} = ${dec + pctB}.`,
          `Both are percentages now, so they can be added.`,
          `${dec + pctB}%`, dec + pctB, `${dec} + ${pctB}`),
        step('c', `The rest are ${c.r}. So what percentage is that? 100 − ${dec + pctB} = ?`, `100 − ${dec + pctB} = ${yellow}.`,
          `Everything in the bag adds up to 100%, so whatever is not ${c.a} or ${c.b} must be ${c.r}. Take the two known percentages away from the whole 100%.`,
          `${yellow}% are ${c.r}`, yellow, `100 − ${dec + pctB}`, true)], `${yellow}%`);
    },
  ];

  // Ordered by what the child has to DO, not by the topic it borrows from.
  // Step count rises with it: 2, 2, 2, 3, 3, 3, 4.
  //
  // Tier 11 has fewer STEPS than tier 10 and is still harder: it is where the ladder
  // stops being whole-number arithmetic and starts asking for decimals, percentages
  // and interpretation. Two steps carrying a percentage beat three steps of adding up.
  const TIERS = [T1, T2, T3, T4, T5, T6, T7, T8, T10, T9,   // T10 is the 3-step set, T9 the 4-step one
    T_REST,    // 11 · find "the rest", then say it as a percentage      2 steps
    T_UNITS,   // 12 · convert the units before you can subtract          2 steps
    T_RATE,    // 13 · divide to find one, multiply back — with decimals  2 steps
    T_FORMS,   // 14 · a decimal and a percentage in the same question    3 steps
    T_MONEY,   // 15 · two decimal prices, two quantities, one total      3 steps
    T_REMAIN,  // 16 · divide, then decide what the remainder MEANS       3 steps
    T_PCTUP];  // 17 · build a percentage from 10% and 1%, then add it on 4 steps
  // Each level is a RAMP, not a difficulty band: the first problem should be one he
  // can do standing up, the last one should make him think. Every ladder now finishes
  // above where the old one did.
  // Every plan must be NON-DECREASING — a lesson that gets easier half way through
  // tells the child they have gone backwards. test-truth enforces this.
  const PLANS = {
    'solve-easy': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'solve-lesson': [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    'solve-hard': [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    'solve-exam': [11, 12, 13, 13, 14, 15, 15, 16, 17, 17],
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
