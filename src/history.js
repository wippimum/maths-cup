/* history.js — the match log: every finished match is recorded, and this file
   turns that log into the History screen (bests, streak calendar, recent matches)
   and into the plain-text weekly summary that gets emailed home.

   Everything here is pure: it takes the saved log and returns data or HTML strings.
   Nothing touches localStorage or the DOM — app.js does that. That keeps it testable
   in Node, which matters because a wrong score in a summary is quietly misleading.

   One record per match, with short keys because it all lives in localStorage:
     { d: '2026-08-16', t: 1755300000000, s: 'percent', l: 'pc-hard',
       p: 80, m: 3, c: 1 }
      d date · t timestamp · s subject · l level · p score % · m mistakes
      c = a PERFECT match: all ten solved first try, no mistakes at all
      sec = seconds actually spent working (see app.js — long idle gaps are
            not counted, so this is practice time, not "how long the tab was open") */
(function (root) {
  const CAP = 400;                       // ~28 KB of localStorage; years of daily play

  // ---------- dates ----------
  const pad = (n) => String(n).padStart(2, '0');
  function dayKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function parseDay(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(s, n) { const d = parseDay(s); d.setDate(d.getDate() + n); return dayKey(d); }
  function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }
  // Monday = 0 … Sunday = 6, the way a UK school week reads
  function weekdayIndex(s) { return (parseDay(s).getDay() + 6) % 7; }

  // ---------- the log ----------
  // An unfinished match carries `n` (how many of the ten were solved); a completed one
  // never does. One predicate, so "is this a real match?" is answered the same way
  // everywhere — totals, bests and the screen must not disagree about it.
  function isPartial(e) { return e && e.n != null; }

  function addMatch(list, entry) {
    const out = (list || []).concat([entry]);
    return out.length > CAP ? out.slice(out.length - CAP) : out;
  }
  function inRange(list, fromDay, toDay) {
    return (list || []).filter((e) => e.d >= fromDay && e.d <= toDay);
  }

  // Best score per subject — ties go to the harder level reached, then the newer match.
  function bests(list, levelRank) {
    const out = {};
    (list || []).filter((e) => !isPartial(e)).forEach((e) => {
      const cur = out[e.s];
      if (!cur) { out[e.s] = e; return; }
      if (e.p > cur.p) { out[e.s] = e; return; }
      if (e.p === cur.p) {
        const rank = levelRank || (() => 0);
        if (rank(e.s, e.l) > rank(cur.s, cur.l)) out[e.s] = e;
        else if (rank(e.s, e.l) === rank(cur.s, cur.l) && (e.t || 0) > (cur.t || 0)) out[e.s] = e;
      }
    });
    return out;
  }

  function totals(list) {
    const l = list || [];
    if (!l.length) return { matches: 0, partials: 0, partialSolved: 0, avg: 0, clean: 0, mistakes: 0, topics: 0, days: 0, secs: 0, avgSecs: 0 };
    // A match he walked away from is logged too (see recordPartial in app.js), marked
    // by `n` = how many of the ten he finished. It counts as effort — time, mistakes
    // fixed, topics touched, days played — but NOT as a match, and it stays out of the
    // average and the personal bests: 100% off two problems is not a 100% match.
    const done = l.filter((e) => !isPartial(e));
    const part = l.filter(isPartial);
    const sum = done.reduce((a, e) => a + e.p, 0);
    // Matches recorded before time tracking existed have no `sec`; average over the
    // ones that DO, so an old log doesn't drag the average down to nothing.
    const timed = l.filter((e) => e.sec > 0);
    const secs = timed.reduce((a, e) => a + e.sec, 0);
    const timedDone = done.filter((e) => e.sec > 0);
    return {
      matches: done.length,
      partials: part.length,
      partialSolved: part.reduce((a, e) => a + (e.n || 0), 0),
      avg: done.length ? Math.round(sum / done.length) : 0,
      clean: done.filter((e) => e.c).length,
      mistakes: l.reduce((a, e) => a + (e.m || 0), 0),
      topics: new Set(l.map((e) => e.s)).size,
      days: new Set(l.map((e) => e.d)).size,
      secs,
      // per COMPLETED match, so the figure stays comparable as partials accumulate
      avgSecs: timedDone.length ? Math.round(timedDone.reduce((a, e) => a + e.sec, 0) / timedDone.length) : 0,
    };
  }

  // "45s" · "6m 20s" · "1h 05m" — short enough for a tile, clear enough for an email.
  function fmtDur(sec) {
    const s = Math.max(0, Math.round(sec || 0));
    if (s < 60) return `${s}s`;
    const mins = Math.floor(s / 60), rem = s % 60;
    if (mins < 60) return rem ? `${mins}m ${rem}s` : `${mins}m`;
    const hrs = Math.floor(mins / 60), rm = mins % 60;
    return `${hrs}h ${String(rm).padStart(2, '0')}m`;
  }

  // A 5-week grid ending on the week that contains `today`, aligned Monday → Sunday.
  function calendar(list, today, weeks) {
    const n = weeks || 5;
    const perDay = {};
    (list || []).forEach((e) => { perDay[e.d] = (perDay[e.d] || 0) + 1; });
    const monday = addDays(today, -weekdayIndex(today));
    const start = addDays(monday, -7 * (n - 1));
    const grid = [];
    for (let w = 0; w < n; w++) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(start, w * 7 + i);
        row.push({ day, n: perDay[day] || 0, future: day > today, today: day === today });
      }
      grid.push(row);
    }
    return grid;
  }

  // How many days in a row, ending today (or yesterday), have at least one match?
  function playStreak(list, today) {
    const days = new Set((list || []).map((e) => e.d));
    let cursor = days.has(today) ? today : addDays(today, -1);
    if (!days.has(cursor)) return 0;
    let n = 0;
    while (days.has(cursor)) { n++; cursor = addDays(cursor, -1); }
    return n;
  }

  // ---------- the weekly email ----------
  // Plain text on purpose: it has to read well in Mail on a phone.
  function weeklySummary(list, today, names) {
    const from = addDays(today, -6);
    const week = inRange(list, from, today);
    const t = totals(week);
    const nameOf = (id) => (names && names[id]) || id;
    const lines = [];
    lines.push(`World Maths Cup — week to ${today}`);
    lines.push('');
    if (!t.matches && !t.partials) {
      lines.push('No matches played this week.');
      return lines.join('\n');
    }
    if (!t.matches) {
      // Practice happened, just none of it finished. Saying "no matches" would read as
      // "he did nothing", which is the opposite of what the log shows.
      lines.push(`No matches finished this week, but ${t.partials} were started`
        + ` on ${t.days} day${t.days === 1 ? '' : 's'} — ${t.partialSolved} problem${t.partialSolved === 1 ? '' : 's'} solved.`);
      if (t.secs) lines.push(`Time practising: ${fmtDur(t.secs)}`);
      return lines.join('\n');
    }
    lines.push(`${t.matches} match${t.matches === 1 ? '' : 'es'} on ${t.days} day${t.days === 1 ? '' : 's'}, across ${t.topics} topic${t.topics === 1 ? '' : 's'}.`);
    lines.push(`Average score: ${t.avg}%   ·   perfect matches: ${t.clean}   ·   mistakes fixed: ${t.mistakes}`);
    if (t.partials) lines.push(`Started but not finished: ${t.partials}   ·   ${t.partialSolved} problem${t.partialSolved === 1 ? '' : 's'} solved in them (not counted in the average).`);
    if (t.secs) lines.push(`Time practising: ${fmtDur(t.secs)} in total   ·   ${fmtDur(t.avgSecs)} per finished match`);
    lines.push('');
    lines.push('By topic:');
    const bySubject = {};
    week.forEach((e) => { (bySubject[e.s] = bySubject[e.s] || []).push(e); });
    Object.keys(bySubject).sort().forEach((s) => {
      const es = bySubject[s], st = totals(es);
      const finished = es.filter((e) => !isPartial(e));
      if (!finished.length) {
        lines.push(`  ${nameOf(s)} — started but not finished (${st.partialSolved} problem${st.partialSolved === 1 ? '' : 's'} solved)`
          + (st.secs ? `, ${fmtDur(st.secs)}` : ''));
        return;
      }
      const best = finished.reduce((a, e) => (e.p > a.p ? e : a), finished[0]);
      lines.push(`  ${nameOf(s)} — ${st.matches} match${st.matches === 1 ? '' : 'es'}, average ${st.avg}%, best ${best.p}%`
        + (st.partials ? ` (+${st.partials} unfinished)` : '')
        + (st.secs ? `, ${fmtDur(st.secs)}` : ''));
    });
    // Where the week actually went wrong is the useful bit for a parent. Judge that on
    // finished matches only — an abandoned run says nothing reliable about the topic.
    const weakest = Object.keys(bySubject)
      .map((s) => ({ s, t: totals(bySubject[s]) }))
      .filter((x) => x.t.matches > 0)
      .map((x) => ({ s: x.s, avg: x.t.avg }))
      .sort((a, b) => a.avg - b.avg)[0];
    if (weakest && weakest.avg < 80) {
      lines.push('');
      lines.push(`Worth a look: ${nameOf(weakest.s)} is the lowest this week at ${weakest.avg}%.`);
    }
    return lines.join('\n');
  }

  // ---------- the History screen ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function niceDay(s, today) {
    if (s === today) return 'Today';
    if (s === addDays(today, -1)) return 'Yesterday';
    const d = parseDay(s);
    return `${d.getDate()} ${MONTH[d.getMonth()]}`;
  }
  function tile(value, label) {
    return `<div class="h-tile"><div class="h-tile-v">${esc(value)}</div><div class="h-tile-l">${esc(label)}</div></div>`;
  }

  function panelHTML(list, today, opts) {
    const o = opts || {};
    const names = o.names || {}, levelName = o.levelName || ((s, l) => l);
    const nameOf = (id) => names[id] || id;
    const all = list || [];

    if (!all.length) {
      return `<p class="h-empty">No matches yet. Play a match and it will show up here —
        every score is kept on this iPad so you can see how you're getting on.</p>`;
    }

    const t = totals(all);
    const week = totals(inRange(all, addDays(today, -6), today));
    let html = '';

    // --- the numbers ---
    html += `<div class="h-tiles">`
      + tile(t.matches, 'matches played')
      + tile(t.avg + '%', 'average score')
      + tile(playStreak(all, today), 'day streak')
      + tile(t.secs ? fmtDur(t.secs) : '—', 'time practising')
      + tile(week.matches, 'matches this week')
      + tile(week.secs ? fmtDur(week.secs) : '—', 'time this week')
      + `</div>`;
    // Say it plainly rather than folding it into "matches played", which would make the
    // count mean two different things.
    if (t.partials) {
      html += `<p class="h-part-note">Also ${t.partials} match${t.partials === 1 ? '' : 'es'} started but not finished`
        + ` — ${t.partialSolved} problem${t.partialSolved === 1 ? '' : 's'} solved in them. That work still counts`
        + ` towards time practising and the day streak.</p>`;
    }

    // --- streak calendar ---
    const grid = calendar(all, today, 5);
    html += `<h4 class="h-head">Days you played</h4><div class="h-cal">`;
    html += `<div class="h-cal-row h-cal-days">` + ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      .map((d) => `<span class="h-cal-lbl">${d}</span>`).join('') + `</div>`;
    grid.forEach((row) => {
      html += `<div class="h-cal-row">` + row.map((c) => {
        const cls = c.future ? 'fut' : c.n >= 3 ? 'hot' : c.n === 2 ? 'mid' : c.n === 1 ? 'on' : 'off';
        const d = parseDay(c.day);
        return `<span class="h-cell ${cls}${c.today ? ' now' : ''}" title="${c.day}: ${c.n} match${c.n === 1 ? '' : 'es'}">${d.getDate()}</span>`;
      }).join('') + `</div>`;
    });
    html += `</div>`;

    // --- personal bests ---
    const b = bests(all, o.levelRank);
    const ids = Object.keys(b).sort((x, y) => b[y].p - b[x].p);
    html += `<h4 class="h-head">Personal best in each topic</h4><div class="h-bests">`;
    ids.forEach((id) => {
      const e = b[id];
      html += `<div class="h-best"><span class="h-best-t">${esc(nameOf(id))}</span>`
        + `<span class="h-best-l">${esc(levelName(e.s, e.l))}</span>`
        + `<span class="h-best-p${e.p === 100 ? ' full' : ''}">${e.p}%</span></div>`;
    });
    html += `</div>`;

    // --- recent matches ---
    const recent = all.slice().reverse().slice(0, 30);
    html += `<h4 class="h-head">Recent matches</h4><table class="h-log"><tbody>`;
    recent.forEach((e) => {
      const part = isPartial(e);
      html += `<tr${part ? ' class="h-part"' : ''}><td class="h-when">${esc(niceDay(e.d, today))}`
        + (e.sec ? `<span class="h-dur">${esc(fmtDur(e.sec))}</span>` : '') + `</td>`
        + `<td class="h-what">${esc(nameOf(e.s))}<span class="h-lvl">${esc(levelName(e.s, e.l))}`
        + (part ? ` · stopped after ${e.n} of 10` : '') + `</span></td>`
        + `<td class="h-pct${part ? '' : e.p >= 80 ? ' good' : e.p < 50 ? ' low' : ''}">${e.p}%</td>`
        + `<td class="h-clean">${part ? '⏸️' : e.c ? '🏆' : ''}</td></tr>`;
    });
    html += `</tbody></table>`;
    if (all.length > 30) html += `<p class="h-more">Showing the last 30 of ${all.length} matches.</p>`;
    return html;
  }

  const api = {
    HISTORY_CAP: CAP,
    dayKey, addDays, daysBetween, weekdayIndex,
    addMatch, isPartial, inRange, bests, totals, calendar, playStreak, fmtDur,
    weeklySummary, panelHTML,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
