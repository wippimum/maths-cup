# World Maths Cup ⚽🏆

A friendly football-themed maths trainer that works **one small step at a time**, with
hints, a "why does this work?" explanation, and the "long way" whenever you're stuck.
Made by **the Al Falasi brothers** (Year 6 → Year 7).

## Topics (pick from the menu) — the full Year 6 course

Choose a topic on the first screen, then a level, then kick off a match of 10. Built from
the boys' own Year 6 worksheets (Topics 1–17), matching the school's methods.

**Every topic has at least three levels that get properly harder** — the last one on each
ladder (🏆) is a Year 7-and-beyond stretch, not just bigger numbers. Three clean wins
promotes you to the next level, or you can jump straight to any level from the menu.

| Topic | Level 1 → | Level 2 → | Challenge 🏆 |
| --- | --- | --- | --- |
| **⚽ Equations** | x + b = c | ax + b = c, then both sides | negatives both sides, then **brackets** a(x + b) = c |
| **🔵 HCF** | small pairs | bigger pairs | **three numbers at once** |
| **🟢 LCM** | small pairs | bigger pairs | **three numbers at once** |
| **🔢 Primes** | is it prime? | prime hunt, two prime factors | factor trees, index form, make-a-square ⭐ |
| **⚖️ Ratio** | simplify | share an amount | **3-part ratios, and working back from a difference or one share** |
| **🔟 Decimals** | × ÷ 10/100/1000 | add & subtract | **multiplying and dividing by a decimal** |
| **％ Percentages** | % of an amount | any whole % (10% + 1%) | **increase, decrease, % change and reverse percentages** |
| **½ Fractions** | simplify, of an amount | add & subtract | **multiply & divide (keep–flip–change)** |
| **± Integers** | add & subtract | multiply & divide | **two operations at once, signs everywhere** |
| **🧮 BIDMAS** | which part first? | × ÷ before + −, brackets | left-to-right, powers, full mix |
| **≈ Rounding** | nearest 10/100/1000 | decimal places | **significant figures & estimating** |
| **📊 Statistics** | mode & range | mean, median | **find a missing value from the mean, even-length medians, negatives** |
| **🔗 F↔D↔%** | fraction → decimal → % | % → fraction | **order a mixed set of all three** |
| **#️⃣ Place value** | place value | ordering | **decimal place value and ordering negatives** |
| **📐 Angles** | line / point | triangles | **quadrilaterals, isosceles, parallel lines, polygon angle sums** |
| **🟩 Perimeter & Area** | rectangles | triangles | **compound L-shapes, parallelograms, trapezia, area → missing side** |
| **🧊 3D & Volume** | cuboid volume | faces, edges, vertices | **surface area, missing dimensions, triangular prisms** |
| **📍 Coordinates** | read | negatives, reflect, complete | **midpoint of a line** |
| **🔷 Shape facts** | sides & angles | properties of quadrilaterals | **lines of symmetry vs rotational order** |
| **📈 Data & Graphs** | bar charts | **charts whose scale goes up in 2s/5s/10s** | **two-way tables, pictograms, mean from a chart** |
| **🧩 Problem solving** | warm-up tiers | full easy→hard lesson | **tiers 4–10, four-step problems** |

For the number/geometry topics you **tap the chips** that belong (some wrong ones are mixed
in). Every wrong answer gets a kind, specific explanation — never just "wrong".

At **full-time** you get statistics: your score **%**, goals, how many mistakes you fixed
before scoring, your unbeaten run, and the trickiest thing that came up, with a tip.

## Put it on the iPads (works offline — e.g. on holiday) 📱

The app is a small website, so "installing" means opening the link once and adding it to each
iPad's Home Screen. After one visit on Wi-Fi it caches itself and runs with **no internet**.

**It's already online:** **https://wippimum.github.io/maths-cup/**

That's GitHub Pages serving this folder's `main` branch, so `git push` publishes an update
(live in about 30 seconds). Two rules when you change anything:
- bump `CACHE = 'wac-vN'` in `sw.js`, every `?v=N` in `index.html`, and the `build N` in the
  footer — all to the same number, or a device may keep showing the old version;
- the footer's build number tells you what a device is actually running, which is the quickest
  way to tell a real bug from a stale copy.

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
- 🥈 **Semi-final** — everything mixed, negatives anywhere
- 🏆 **The Final** — **brackets**: `a(x + b) = c`, expand before you move anything

## Scores & history 📈

Every finished match is recorded — date, topic, level, score %, mistakes fixed, and how
long it took. Tap **📈 My scores & history** on the menu to see:

- **totals** — matches played, average score, day streak, and total time practising;
- **a streak calendar** — the last five weeks, with the days they played shaded (darker
  green for more than one match that day);
- **a personal best for every topic**, showing which level the best score was set on;
- **the last 30 matches**, newest first, with a 🏆 on any perfect one.

**Time is practice time, not wall-clock.** The clock adds up the gaps between one action
and the next and throws away any gap longer than two minutes, and it stops entirely while
the app is in the background — so putting the iPad down mid-match doesn't inflate the total.

**✉️ Email this week home** opens Mail with a plain-text summary already written: matches,
average, time, a per-topic breakdown, and a line flagging the weakest topic of the week.
The address is asked for once and stored **on that iPad only** — it is deliberately not in
this repo, which is public.

**Where it's stored, and the one risk.** Everything lives in that device's `localStorage`,
so it works completely offline and each iPad keeps its own record. The one way to lose it is
clearing website data or moving to a new iPad, so there's **📋 Copy backup** (puts the whole
history on the clipboard to paste somewhere safe) and **↩️ Restore from backup**.

## Tests

Three Node scripts, no dependencies — run them from this folder after any change:

```
node test/test-levels.js    # every level of every subject: steps answerable, exactly one
                            # right option, every wrong option explained, ≥3 levels per topic
node test/test-truth.js     # re-derives every challenge answer independently — catches a
                            # tidy-looking step that teaches the WRONG number
node test/test-bidmas.js    # the BIDMAS ladder, checked against an independent eval
node test/test-history.js   # the match log: totals, bests, streaks, durations and the
                            # weekly email — a parent reads these numbers, so they must
                            # be right (and topic names must be escaped, not injected)
```

`REPS=200 node test/test-levels.js` runs a deeper sweep (the default is 60 problems per level).

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
src/topics*.js        the step builders for each topic (HCF, fractions, angles, …)
src/bidmas.js         BIDMAS: a tiny expression engine that reduces one step at a time
src/problems.js       the topic/level menu, random problems & football stories
src/app.js            the game: flow, streak, sounds, celebrations
```

To add or change the explanations, edit `src/explanations.js`. To add problems or stories,
edit `src/problems.js`.

Made by the Al Falasi brothers ⚽
