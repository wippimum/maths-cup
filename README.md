# World Maths Cup ⚽🏆

A friendly football-themed maths trainer that works **one small step at a time**, with
hints, a "why does this work?" explanation, and the "long way" whenever you're stuck.
Made by **the Al Falasi brothers** (Year 6 → Year 7).

## Choosing a year

**The crest is the home button.** Tapping ⚽ **WORLD MATHS CUP** at the top left goes
back to the menu **for the year you are already in** — never to the year chooser. From
inside a match it asks first, because the crest is easy to catch by accident; saying yes
ends the match the same way the "End match" button does, so how far he got is still
recorded in his history.

The app opens on a **year chooser**: Year 6 or Year 7. The choice is remembered, so it
is only asked once — after that it goes straight to the menu, and **🎓 change year** on
the menu brings the chooser back.

Only the chosen year's tiles are shown. **Scores, streaks and history are deliberately
NOT split by year** — it is the same child, and moving up a year should not wipe his
record.

### Year 7 (KS3) — Adding & Subtracting Mixed Numbers

Built from two sources, deliberately: the homework itself — a Dr Frost exercise,
*"Adding and Subtracting Mixed Numbers with the Same Denominator"* — plus photos of the
online questions set alongside it, and **Section 5 of the CGP Foundation book** for the
parts of the KS3 unit the homework does not reach.

Where each level came from:

| Source | Levels |
| --- | --- |
| Dr Frost sheet, Q2–Q4 | mixed numbers, same denominator · adding with carrying · subtracting with borrowing |
| Photos of the online questions | different denominators |
| His own written work (`42/16 = 2 5/8`) | improper → mixed, simplest form |
| CGP Section 5 | mixed ↔ improper · spot the odd one out · multiply · reciprocals & dividing |

**One departure from the sheet, on purpose.** Dr Frost interleaves carrying with
non-carrying (Q2 has both) and borrowing with non-borrowing (Q4 has both). Here they are
separate levels. Interleaving is better for testing; separating is better for
diagnosing — a low score on "adding with carrying" while "mixed numbers, same
denominator" stays clean says exactly where the problem is.

Not built yet: the sheet's **Q5 pyramid puzzles** ("the number in each box is the sum of
the two below it"), and the **three-term** questions from the phone photos
(`3 1/3 + 38/30 − 17/15`).

| Level | What it drills |
| --- | --- |
| Mixed ↔ improper | the conversion both ways |
| Improper → mixed, simplest form | `42/16 = 2 5/8` — simplify, then split off the wholes |
| Mixed numbers, same denominator | `1 2/9 + 2 3/9`, `4 7/9 − 2 4/9` |
| Adding with carrying | `8 5/12 + 4 11/12` — the fractions make another whole |
| Different denominators | `3 2/15 + 6/5`, `3 15/22 − 5/2` |
| A whole take a fraction | `1 − 7/10`, `7 − 8/15` — the rename *is* the lesson |
| Subtracting with borrowing | `9 7/13 − 3 8/13`, `8 6/12 − 4 9/12`, simplifying when needed |
| Borrow or not? You decide | half need one, half don't — noticing is the skill |
| **No steps — just the answer** 🔥 | the same questions with the scaffolding removed |
| Multiply · Reciprocals & dividing | the rest of the KS3 fractions unit |

**The unguided level.** Every other level walks through the method — find the common
denominator, rewrite, carry, simplify. That is how the method is learnt, but it is not
how he is asked in class, where a question arrives on its own and the first move has to
come out of his own head. A child can look fluent all the way down a guided ladder and
still stall on a bare question, because choosing where to start was never his job.
**No steps — just the answer** gives the question and asks only for the finished answer,
built from cards rather than picked from a list, so there is nothing to recognise
between. The full worked solution stays behind the **Hint** and **Why?** buttons: help
on request, not help by default.

**Every level ends on "in its simplest form", and offers the unsimplified answer as a
choice.** That is deliberate: asked for `3 2/15 + 6/5`, he picked `4 5/15` from a list
that also held `4 1/3`. The value was right and it was still marked wrong. Choosing the
unsimplified form gets its own explanation — *"the value is right, but it is not
finished"* — rather than a generic "wrong".

The **borrowing** and **carrying** levels follow the class's method (keep the whole
numbers, borrow or carry one), **not** the CGP book's method of converting everything to
improper fractions. Where the two disagreed, the class's method won, so the app and the
exercise book do not teach two different routines.

**Fractions are drawn, not typed.** `src/mathfmt.js` turns "3 15/22" into a real stacked
fraction — numerator over denominator on a rule — everywhere it appears: the question,
every step prompt, every answer option, the solved-steps timeline, the hints and "the
long way". The vertical offset was measured in a browser rather than guessed, so the
rule lands level with the digits beside it and every rule on a line agrees, the way it
does in the exercise book.

Generators keep writing plain `3 15/22`; nothing else changed. The renderer escapes
first and only then converts digit/digit runs, so the `/` card in build steps and words
like "above/below" are untouched, and no generated string can inject markup.
`test/test-mathfmt.js` strips the markup back off ~40,000 strings from every level and
fails if any of them reads differently than before.

Still no Year 7 **Toddle unit plan** in the repo, so `test/test-curriculum.js` prints
Year 7 under **NOT CHECKED** rather than pretending to verify it, and `test-vocab.js` has
no Year 7 terms to enforce yet. The homework-plus-CGP basis above is a deliberate choice,
not a placeholder — when the plan arrives it should be checked against, and the wording
reconciled, rather than the levels being thrown away.

## Topics — the actual Year 6 course

The menu follows the school's **Toddle unit plans**, topic by topic. Every
"Specific understanding" the school lists has at least one level, and `T5`, `T12` and so
on are the school's own topic numbers, shown on each tile.

| | Topic | Levels |
| --- | --- | --- |
| T1 | **Numeracy** | place value · ordering · decimals and negatives |
| T2 | **Integers** · **BIDMAS** | add/subtract · multiply/divide · two-step negatives · the six-rung BIDMAS ladder |
| T3 | **HCF** · **LCM** · **Primes** | listing method, small → big pairs · spot primes, prime hunt, two prime factors, factor trees · **squares, cubes and roots** |
| T4 | **Fractions** | simplify · of an amount · add & subtract · **mixed ↔ improper** · **what fraction of…?** · multiply & divide |
| T5 | **Algebra Basics** | **notation & writing expressions · substituting numbers · substituting negatives · collecting like terms · expressions for perimeter** |
| T6 | **Coordinates** · symmetry | read · negatives · reflect · complete a shape (symmetry lives under Shape facts) |
| T7 | **Rounding** | nearest 10/100/1000 · decimal places |
| T8 | **Decimals** | × ÷ by powers of ten · add & subtract · × and ÷ decimals |
| T9 | **Equations** | one-step → two-step → x on both sides → negatives everywhere |
| T10 | **Angles** | **name & estimate, vertically opposite** · on a line/around a point · triangles · quadrilaterals & isosceles |
| T11 | **Fractions↔Decimals↔%** | fraction → decimal → % · % → fraction · order a mixed set |
| T12 | **Perimeter & Area** · **Units & Measures** | rectangles · triangles · compound shapes & backwards · **metric conversion: length, mass, then area and volume** |
| T13 | **Statistics** | mode & range · mean · median · **compare two sets by mean and range** |
| T14 | **Data & Graphs** | bar charts · awkward scales · pictograms & means · **pie charts, line graphs & frequency tables** · **Venn diagrams** |
| T15 | **Percentages** | % of an amount · any whole % (10% + 1%) · **what percentage of…?** · increase & decrease |
| T16 | **Shape facts** | sides and angles · properties of quadrilaterals · **polygons and circle parts** |
| T17 | **Volume** | **name the solid & its net** · volume of a cuboid · faces, edges & vertices · prisms & missing sides |
| — | **Problem solving** | 10 worded problems, easy → hard, in one-step pieces |

**Bold** entries are the ones built from the unit plans after an audit found the app had
drifted from the course.

### 🔥 "No steps — just the answer"

Every topic has one, at the end of its ladder. It draws a question from that topic's own
levels and removes the scaffolding: the question is shown whole, and only the answer is
asked for. The full worked solution stays behind **Hint** and **Why?** — help on request,
not help by default.

The point is that being walked through a question never makes you practise the one thing
class asks for: deciding what to do first. A child can look fluent all the way down a
guided ladder and still stall on a bare question.

Three rules keep these honest, enforced by `test/test-unaided.js`:

- **one step**, never a disguised walk-through;
- **answerable standing alone** — a step with neither options nor cards is a typed
  *line*, transforming the line above it, and with those lines gone there is nothing to
  transform, so the equation questions that work that way stay guided;
- **never a coin toss** — at least three options, with exactly one accepted.

Stretch levels are left out (this asks whether the *course* stuck), and **Shape facts**
has no such level at all: every one of its levels is already a single recall question,
so there is nothing to strip.

### ⭐ Stretch levels

A handful of levels go **beyond** the Year 6 course. They are kept — they are good
practice and the boys wanted harder work — but every one is marked `STRETCH` in the menu
so nobody mistakes it for something the school has taught:

significant figures · reverse percentages · surface area · trapezium area · parallel-line
angle rules and polygon angle sums · HCF/LCM of three numbers · two-way tables · reverse
mean · midpoints · brackets in equations · and the whole **Ratio** topic, which is not a
Year 6 Toddle topic at all.

`test/test-curriculum.js` enforces this: every objective must have a level, and every
level must either map to an objective or be flagged as stretch.

### Non-calculator

Topics 7, 8, 11 and 15 are explicitly non-calculator, so the generators are constrained to
match. Percentage change goes via a simplified fraction (38/190 → 1/5 → 20%), not
`38 ÷ 190 × 100`; reverse percentages step down to the HCF (75% = £30 → 25% = £10 → £40)
rather than dividing by 1%; and decimal multiplication is capped so stripping the points
never leaves something like 41 × 55.

For the number/geometry topics you **tap the chips** that belong (some wrong ones are mixed
in). Every wrong answer gets a kind, specific explanation — never just "wrong".

At **full-time** you get statistics: your score **%**, goals, how many mistakes you fixed
before scoring, your unbeaten run, and the trickiest thing that came up, with a tip.

## Put it on the iPads (works offline — e.g. on holiday) 📱

The app is a small website, so "installing" means opening the link once and adding it to each
iPad's Home Screen. After one visit on Wi-Fi it caches itself and runs with **no internet**.

**It's already online:** **https://wippimum.github.io/maths-cup/**

That's GitHub Pages serving this folder's `main` branch, so `git push` publishes an update
(live in about 30 seconds). When you change anything, bump `CACHE = 'wac-vN'` in `sw.js`,
every `?v=N` in `index.html`, the `build N` in the footer, **and `version.json`** — all to
the same number. `node test/test-build.js` fails if they disagree.

### Am I running the latest? 🔄

**Tap the `build N` stamp in the footer.** The app asks the server directly (it fetches
`version.json` with caching switched off) and tells you one of two things:

- *"Up to date — this is build N, the newest there is. ✓"*
- *"A newer version is ready (build N — you have M)."* with an **Update now** button.

It also checks quietly every time the app opens, and only says anything when there really
is something newer. Offline it stays silent, because being offline is normal here.

**Update now** clears the service worker and its caches and reloads. It does **not** touch
`localStorage`, so streaks, progress and match history all survive — that is the whole
reason for the button rather than telling you to clear site data, which would wipe them.

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
- **a month calendar** — one month at a time, laid out Monday to Sunday like a wall
  calendar, with the days they played shaded (darker green for more than one match).
  The **‹ ›** arrows step through the months; they stop at the month of the very first
  match and at the current month, so you can never wander into an empty year. Under it
  sits a line for that month: days played and matches;
- **a personal best for every topic**, showing which level the best score was set on;
- **the last 30 matches**, newest first, with a 🏆 on any perfect one.

**Unfinished matches are recorded too.** If they stop part-way — End match, closing the
tab, reloading — the match is logged with how far they got and marked ⏸️ `stopped after
N of 10`. The work counts towards **time practising** and the **day streak**, so an
afternoon of real practice never reads as "did nothing". It deliberately does *not*
count as a match played, does not move the average, and can never take a personal best:
100% off two problems is not a 100% match. Stopping before finishing a single problem
records nothing, so a mis-tap leaves no row.

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
node test/test-curriculum.js # every Toddle objective has a level, and every level either
                            # maps to an objective or is flagged as stretch
node test/test-build.js     # the app is correctly assembled: every src file has a script
                            # tag AND an sw.js entry, version stamps agree, load order is
                            # sound, and no names or addresses leaked into a public repo
node test/test-vocab.js     # the app says what the class says: every term from the unit
                            # plans appears in text a player actually reads, and no
                            # correct-but-different synonym is used instead
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
