# World Maths Cup ⚽🏆

A friendly football-themed maths trainer that works **one small step at a time**, with
hints, a "why does this work?" explanation, and the "long way" whenever you're stuck.
Made by **the Al Falasi brothers** (Year 6 → Year 7).

## Topics (pick from the menu) — the full Year 6 course

Choose a topic on the first screen, then a level, then kick off a match of 10. Built from
the boys' own Year 6 worksheets (Topics 1–17), matching the school's methods:

- **⚽ Equations** — linear equations, "move it across and flip it" (build each line by tapping cards)
- **🔵 HCF** · **🟢 LCM** — list factors / multiples, find the common ones (listing method)
- **🔢 Primes** — spot primes, prime hunt, and prime factorisation
- **⚖️ Ratio** — simplify (using the HCF) and share amounts
- **🔟 Decimals** — × ÷ by 10/100/1000, add & subtract
- **％ Percentages** — % of an amount (10% / 1% build-up)
- **½ Fractions** — simplify, fraction of an amount, add & subtract
- **± Integers** — add/subtract/multiply/divide negatives, order of operations
- **≈ Rounding** — nearest 10/100/1000 and decimal places
- **📊 Statistics** — mean, median, mode, range
- **🔗 Fractions↔Decimals↔%** — convert between all three
- **#️⃣ Place value & ordering**
- **📐 Angles** — on a line, around a point, in a triangle (with diagrams)
- **🟩 Perimeter & Area** — rectangles and triangles (with diagrams)
- **🧊 3D Shapes & Volume** — cuboid volume; faces, edges, vertices
- **📍 Coordinates** — read coordinates and reflect points (with a grid)
- **🔷 Shape facts** — sides, angles, symmetry
- **📈 Data & Graphs** — read bar charts
- **🧩 Problem solving** — worded problems in tiny one-step calculations

For the number/geometry topics you **tap the chips** that belong (some wrong ones are mixed
in). Every wrong answer gets a kind, specific explanation — never just "wrong".

At **full-time** you get statistics: your score **%**, goals, how many mistakes you fixed
before scoring, your unbeaten run, and the trickiest thing that came up, with a tip.

## Put it on the iPads (works offline — e.g. on holiday) 📱

The app is a small website, so "installing" means hosting it once, then adding it to each
iPad's Home Screen. After one visit on Wi-Fi it caches itself and runs with **no internet**.

**Step 1 — Put it online (once, ~3 minutes, free).**
Easiest: [app.netlify.com/drop](https://app.netlify.com/drop). Sign up for a free account
(so the link stays permanent), then **drag the whole `world-maths-cup` folder** onto the page.
Netlify gives you a link like `https://your-name.netlify.app`. (GitHub Pages or Cloudflare
Pages work too — any static host with HTTPS.)

**Step 2 — Add to each iPad's Home Screen (~1 minute each).**
1. On the iPad, open the link in **Safari** (must be Safari for this to work like an app).
2. Wait ~5 seconds on the start screen so it finishes downloading for offline.
3. Tap the **Share** button → scroll down → **Add to Home Screen** → **Add**.
4. A ⚽ **Maths Cup** icon appears. Tapping it opens full-screen, just like an app.

**Step 3 — Offline / travelling.**
- Once added, it works with **no internet at all**.
- Before a trip, just open it once on each iPad while on Wi-Fi so everything is cached.
- Each iPad keeps its **own** streak and progress.
- Tip: iOS can clear a web app's cache if it's untouched for many weeks — daily use keeps it,
  and opening it once right before you travel guarantees it's ready.

## How to open it (on the Mac)

**The easy way:** double-click **`index.html`**. It opens in your web browser and just works —
no internet, no login, no install. Works on a laptop or a phone.

(If your browser is fussy about opening local files, you can instead run a tiny server from
this folder: `python3 -m http.server 8000`, then visit `http://localhost:8000` — but
double-clicking `index.html` is normally all you need.)

Your streak and progress are saved **in the browser on that device** (localStorage), so it
remembers you each morning.

## How to play

1. **Pick your team** (name + two colours) and **choose your round**, then press **KICK OFF**.
2. You get an equation. Solve it **line by line, going down the page**.
3. Before each line, the app tells you which move to make. Type the line and press **Check** (or Enter).
   - ✅ Right → the ball moves toward goal and the next line unlocks.
   - 🟡 Not yet → a gentle whistle, and it tells you **exactly** which slip you made and the rule, then lets you try that line again.
   - 🔵 **One touch at a time** → if you do two things in one line (e.g. move *and* work out the numbers), it nudges you to do just the one move first. This isn't a mistake and doesn't break your streak.
4. **Tap a term** (like `+3`) before typing and it tells you where it goes and how it flips.
5. **Hint 💡** gives a bigger clue. **Why? 🤔** explains the rule. **Show the long way** reveals the "do it to both sides" version.
6. Finish the **10-equation match** for a full-time whistle, a trophy, and a summary.
7. Win **3 clean matches in a row** to get **promoted** to the next round.

### One operation per line
The app breaks every solve into the smallest steps, so you're only ever asked to do **one thing** per line:
- **`ax + b = c`** → move the number (`ax = c − b`) → work out the numbers (`ax = 4`) → divide (`x = 4/5`).
- **`ax + b = cx + d`** → move the x-term → combine the x's → move the number → work out the numbers → divide.

Working out the numbers is its own line, so an arithmetic slip (like `33 − 2 = 34`) gets caught right where it happens.

### The rounds (World Cup style)
- 🤝 **Friendly (Warm-up)** — `x + b = c`
- ⚽ **Group Stage** — `ax + b = c`
- 🥅 **Round of 16** — `ax − b = c`, answers can be negative
- 🏟️ **Quarter-final** — `ax + b = cx + d` (x on both sides)
- 🏆 **Semi-final / Final** — everything mixed, negatives anywhere

## The method (the one Mum is teaching)

When a term crosses the `=` sign, its operation **flips to the opposite**:
- `+3` becomes `−3`
- the number multiplying `x` (like the `5` in `5x`) becomes **÷** when it crosses.

Plain numbers go to the side **without** x; x-terms go to the side **with** x. The goal is
to get `x` by itself. "Flipping" is just a fast way of doing the **same thing to both sides** —
tap **Show the long way** to see both side by side.

## What's in the folder (easy to edit later)

```
index.html            the page
src/styles.css        the football / pitch look
src/fraction.js       exact fractions (no decimals — answers stay like 22/9)
src/parser.js         reads each typed line into { x, constant }
src/format.js         pretty maths display (real minus signs)
src/explanations.js   the kid-friendly mistake explanations  ← edit the wording here
src/steps.js          the solve steps + which mistake each wrong line is
src/problems.js       the rounds, random problems, worksheet samples & football stories
src/app.js            the game: flow, streak, sounds, celebrations
```

To add or change the explanations, edit `src/explanations.js`. To add problems or stories,
edit `src/problems.js`.

Made by the Al Falasi brothers ⚽
