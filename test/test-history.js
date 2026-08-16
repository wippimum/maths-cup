/* Checks the match log: totals, bests, the streak calendar and the weekly email.
   These numbers get read by a parent, so a quietly wrong average matters.
   Run: node test/test-history.js */
const H = require('../src/history.js');

let checks = 0, fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const eq = (got, want, what) => {
  if (JSON.stringify(got) === JSON.stringify(want)) checks++;
  else bad(`${what}: got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
};
const ok = (cond, what) => (cond ? checks++ : bad(what));

const m = (d, s, l, p, mis, sec) => ({ d, t: new Date(d + 'T09:00:00').getTime(), s, l, p, m: mis, c: mis === 0 ? 1 : 0, sec: sec == null ? 300 : sec });

// ---------- dates ----------
eq(H.addDays('2026-08-16', 1), '2026-08-17', 'addDays forward');
eq(H.addDays('2026-08-01', -1), '2026-07-31', 'addDays across a month');
eq(H.addDays('2026-01-01', -1), '2025-12-31', 'addDays across a year');
eq(H.addDays('2028-02-28', 1), '2028-02-29', 'addDays into a leap day');
eq(H.daysBetween('2026-08-01', '2026-08-16'), 15, 'daysBetween');
eq(H.weekdayIndex('2026-08-17'), 0, 'Monday is index 0');   // 17 Aug 2026 is a Monday
eq(H.weekdayIndex('2026-08-16'), 6, 'Sunday is index 6');

// ---------- the log ----------
eq(H.addMatch(null, m('2026-08-16', 'hcf', 'hcf-warm', 80, 2)).length, 1, 'addMatch from empty');
let big = [];
for (let i = 0; i < H.HISTORY_CAP + 25; i++) big = H.addMatch(big, m('2026-08-16', 'hcf', 'x', i % 101, 0));
eq(big.length, H.HISTORY_CAP, 'log is capped');
ok(big[big.length - 1].p === (H.HISTORY_CAP + 24) % 101, 'the cap drops the OLDEST, keeps the newest');

const log = [
  m('2026-08-10', 'percent', 'pc-of', 60, 4),
  m('2026-08-10', 'percent', 'pc-any', 80, 2),
  m('2026-08-11', 'hcf', 'hcf-warm', 100, 0),
  m('2026-08-13', 'percent', 'pc-hard', 40, 6),
  m('2026-08-16', 'hcf', 'hcf-pro', 100, 0),
  m('2026-08-16', 'angles', 'ang-hard', 90, 1),
];

// ---------- totals ----------
const t = H.totals(log);
eq(t.matches, 6, 'total matches');
eq(t.avg, Math.round((60 + 80 + 100 + 40 + 100 + 90) / 6), 'average score');
eq(t.clean, 2, 'perfect matches');
eq(t.mistakes, 13, 'mistakes fixed');
eq(t.topics, 3, 'distinct topics');
eq(t.days, 4, 'distinct days');
eq(H.totals([]).avg, 0, 'empty log averages 0, not NaN');

// ---------- time ----------
eq(t.secs, 6 * 300, 'total practice seconds');
eq(t.avgSecs, 300, 'average seconds per match');
eq(H.totals([]).secs, 0, 'empty log has no time');
// a log written before time tracking existed must not poison the average
const mixed = [m('2026-08-10', 'hcf', 'x', 80, 1, 240), { d: '2026-08-11', s: 'hcf', l: 'x', p: 90, m: 1 }];
eq(H.totals(mixed).secs, 240, 'untimed matches add nothing to the total');
eq(H.totals(mixed).avgSecs, 240, 'untimed matches are left out of the average, not counted as zero');
eq(H.fmtDur(0), '0s', 'zero duration');
eq(H.fmtDur(45), '45s', 'seconds only');
eq(H.fmtDur(60), '1m', 'exactly a minute has no stray 0s');
eq(H.fmtDur(380), '6m 20s', 'minutes and seconds');
eq(H.fmtDur(3600), '1h 00m', 'exactly an hour');
eq(H.fmtDur(3900), '1h 05m', 'hours pad the minutes');
eq(H.fmtDur(-5), '0s', 'negative durations clamp to zero');
eq(H.fmtDur(undefined), '0s', 'a missing duration is 0s, not NaN');

// ---------- bests ----------
const rank = (s, l) => ({ 'pc-of': 0, 'pc-any': 1, 'pc-hard': 2, 'hcf-warm': 0, 'hcf-pro': 3, 'ang-hard': 2 }[l] || 0);
const b = H.bests(log, rank);
eq(b.percent.p, 80, 'best percentage score');
eq(b.hcf.p, 100, 'best hcf score');
// a tie on score should prefer the HARDER level
const tie = [m('2026-08-10', 'hcf', 'hcf-warm', 100, 0), m('2026-08-11', 'hcf', 'hcf-pro', 100, 0)];
eq(H.bests(tie, rank).hcf.l, 'hcf-pro', 'ties go to the harder level');
eq(H.bests(tie.slice().reverse(), rank).hcf.l, 'hcf-pro', 'ties go to the harder level either way round');

// ---------- range ----------
eq(H.inRange(log, '2026-08-11', '2026-08-13').length, 2, 'inRange is inclusive at both ends');

// ---------- calendar ----------
const cal = H.calendar(log, '2026-08-16', 5);
eq(cal.length, 5, 'five weeks');
ok(cal.every((r) => r.length === 7), 'seven days per week');
const flat = cal.flat();
eq(flat[flat.length - 1].day, '2026-08-16', 'the grid ends on the Sunday of this week');
ok(flat.filter((c) => c.today).length === 1, 'exactly one cell is today');
eq(flat.find((c) => c.day === '2026-08-10').n, 2, 'a two-match day counts 2');
eq(flat.find((c) => c.day === '2026-08-12').n, 0, 'a day off counts 0');
ok(flat.every((c) => !c.future), 'nothing after today is in a grid ending today');
const calMid = H.calendar(log, '2026-08-13', 5).flat();
ok(calMid.some((c) => c.future), 'the rest of the current week is marked future');

// ---------- play streak ----------
eq(H.playStreak(log, '2026-08-16'), 1, 'streak of one');
const run = ['2026-08-14', '2026-08-15', '2026-08-16'].map((d) => m(d, 'hcf', 'x', 90, 1));
eq(H.playStreak(run, '2026-08-16'), 3, 'three days running');
eq(H.playStreak(run, '2026-08-17'), 3, 'a streak still counts the morning after');
eq(H.playStreak(run, '2026-08-18'), 0, 'two days off breaks it');
eq(H.playStreak([], '2026-08-16'), 0, 'no matches, no streak');

// ---------- weekly email ----------
const names = { percent: 'Percentages', hcf: 'HCF', angles: 'Angles' };
const wk = H.weeklySummary(log, '2026-08-16', names);
ok(/week to 2026-08-16/.test(wk), 'email names the week');
ok(/6 matches on 4 days/.test(wk), 'email counts the whole 7-day window');
// and a match that falls outside the window must be left out
const older = [m('2026-08-01', 'hcf', 'x', 10, 9)].concat(log);
ok(/6 matches on 4 days/.test(H.weeklySummary(older, '2026-08-16', names)), 'older matches are excluded');
ok(!/undefined|NaN/.test(wk), 'email has no undefined or NaN');
ok(/Percentages/.test(wk) && /HCF/.test(wk), 'email uses readable topic names');
ok(/Time practising: 30m in total/.test(wk), 'email reports total practice time');
ok(/5m per finished match/.test(wk), 'email reports time per finished match');
// an untimed log must simply omit the time line rather than print "0s"
const untimed = log.map((e) => { const c = Object.assign({}, e); delete c.sec; return c; });
ok(!/Time practising/.test(H.weeklySummary(untimed, '2026-08-16', names)), 'no time line when nothing is timed');
eq(H.weeklySummary([], '2026-08-16', names).includes('No matches played'), true, 'empty week reads sensibly');

// the 7-day window is [10th..16th] inclusive, so all six matches count
const wkAll = H.totals(H.inRange(log, H.addDays('2026-08-16', -6), '2026-08-16'));
eq(wkAll.matches, 6, 'the week window covers 7 days inclusive');

// ---------- panel HTML ----------
const html = H.panelHTML(log, '2026-08-16', { names, levelName: (s, l) => l, levelRank: rank });
ok(!/undefined|NaN|\[object/.test(html), 'panel HTML is clean');
ok(/Personal best/.test(html) && /Recent matches/.test(html) && /Days you played/.test(html), 'panel has all three sections');
ok(H.panelHTML([], '2026-08-16', {}).includes('No matches yet'), 'empty panel reads sensibly');
// a topic name containing HTML must not break out
const nasty = [m('2026-08-16', 'x', 'y', 50, 1)];
const nastyHtml = H.panelHTML(nasty, '2026-08-16', { names: { x: '<img src=q onerror=alert(1)>' }, levelName: () => 'lvl' });
ok(!/<img/.test(nastyHtml), 'topic names are escaped, not injected');

// ---------- unfinished matches ----------
// A match he walked away from is logged with `n` = how many of the ten he finished.
// It must count as effort without ever being counted as a result.
const part = (d, s, l, p, mis, n, sec) => ({ d, t: new Date(d + 'T09:00:00').getTime(), s, l, p, m: mis, c: 0, n, sec: sec == null ? 300 : sec });
ok(H.isPartial(part('2026-08-16', 'hcf', 'x', 100, 0, 3)), 'a record with n is partial');
ok(!H.isPartial(m('2026-08-16', 'hcf', 'x', 100, 0)), 'a completed record is not partial');

const mixedLog = log.concat([part('2026-08-16', 'fractions', 'frac-order', 100, 0, 3, 120)]);
const tm = H.totals(mixedLog);
eq(tm.matches, 6, 'partials are not counted as matches played');
eq(tm.partials, 1, 'partials are counted separately');
eq(tm.partialSolved, 3, 'problems solved inside partials are counted');
eq(tm.avg, H.totals(log).avg, 'a 100% partial does not move the average');
eq(tm.secs, H.totals(log).secs + 120, 'partial time still counts as practice');
eq(tm.avgSecs, H.totals(log).avgSecs, 'time per finished match ignores partials');
eq(tm.days, H.totals(log).days, 'a partial on a day already played adds no new day');
// the day streak and the calendar must treat a partial as "he played"
eq(H.playStreak([part('2026-08-16', 'hcf', 'x', 50, 1, 2)], '2026-08-16'), 1, 'a partial keeps the day streak alive');
// and it must never take a personal best
const bestPart = H.bests(log.concat([part('2026-08-11', 'hcf', 'hcf-pro', 100, 0, 1)]), rank);
eq(bestPart.hcf.l, 'hcf-pro', 'best is still the completed 100% match');
ok(!H.isPartial(bestPart.hcf), 'a partial is never a personal best');

const pHtml = H.panelHTML(mixedLog, '2026-08-16', { names, levelName: (s, l) => l, levelRank: rank });
ok(/stopped after 3 of 10/.test(pHtml), 'the panel says how far he got');
ok(/started but not finished/i.test(pHtml), 'the panel explains the partials separately');
ok(!/undefined|NaN|\[object/.test(pHtml), 'panel with partials is clean');

const pWk = H.weeklySummary(mixedLog, '2026-08-16', names);
ok(/Started but not finished: 1/.test(pWk), 'the email reports partials');
ok(!/undefined|NaN/.test(pWk), 'email with partials is clean');
// a week with ONLY partials must not read as "he did nothing"
const onlyPart = [part('2026-08-16', 'hcf', 'x', 50, 1, 4, 200)];
const opWk = H.weeklySummary(onlyPart, '2026-08-16', names);
ok(!/No matches played this week/.test(opWk), 'a partials-only week is not reported as nothing');
ok(/4 problems solved/.test(opWk), 'a partials-only week reports the work done');
ok(!/undefined|NaN/.test(opWk), 'partials-only email is clean');

console.log(`\n${checks} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
