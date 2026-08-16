/* app.js — World Maths Cup: menu, game loop, card/chip input, stats, celebrations. */
(function () {
  const WAC = window.WAC;
  const { SUBJECTS, subjectById, levelOf, buildMatchFor, explain } = WAC;
  const $ = (id) => document.getElementById(id);
  const MATCH_LEN = 10;

  const SUBJ_SHORT = { algebra1: 'Algebra basics', measures: 'Units & measures', algebra: 'Equations', hcf: 'HCF', lcm: 'LCM', primes: 'Primes', ratio: 'Ratio', decimals: 'Decimals', percent: 'Percentages', solve: 'Problem solving', fractions: 'Fractions', integers: 'Integers', bidmas: 'BIDMAS', rounding: 'Rounding', stats: 'Statistics', fdp: 'Fractions↔%', numeracy: 'Numeracy', angles: 'Angles', area: 'Perimeter & area', volume: 'Volume', coords: 'Coordinates', geometry: 'Shape facts', graphs: 'Data & graphs' };
  // School (Toddle) topic numbers. Some app tiles share a topic (Number Properties = T3),
  // and Ratio / Problem solving aren't a single Toddle Year-6 topic, so they're left blank.
  const TOPIC_NO = {
    numeracy: 1, integers: 2, bidmas: 2, hcf: 3, lcm: 3, primes: 3, fractions: 4, algebra1: 5,
    coords: 6, rounding: 7, decimals: 8, algebra: 9, angles: 10, fdp: 11, area: 12, measures: 12,
    stats: 13, graphs: 14, percent: 15, geometry: 16, volume: 17,
  };
  const TASK_WORD = { algebra1: 'ALGEBRA', measures: 'CONVERT', algebra: 'SOLVE', hcf: 'FIND THE HCF', lcm: 'FIND THE LCM', primes: 'PRIMES', ratio: 'RATIO', decimals: 'WORK OUT', percent: 'WORK OUT', solve: 'PROBLEM', fractions: 'FRACTIONS', integers: 'WORK OUT', bidmas: 'WORK IT OUT IN ORDER', rounding: 'ROUND', stats: 'STATISTICS', fdp: 'CONVERT', numeracy: 'WORK OUT', angles: 'FIND THE ANGLE', area: 'WORK OUT', volume: 'VOLUME', coords: 'COORDINATES', geometry: 'SHAPE FACTS', graphs: 'READ THE CHART' };

  // ---------------- persistent save ----------------
  const KEY = 'wac-save-v1';
  const defaults = {
    streak: 0, lastPlayedDate: null, goalsScored: 0, muted: false, longWay: false,
    team: { name: '', c1: '#f4c430', c2: '#1f9d55' },
    mistakeTotals: {}, subject: 'algebra', level: 'group', progress: {},
    // One record per finished match (see history.js), plus where the weekly summary
    // gets emailed. The address is typed in on the device and never leaves it —
    // it must not be committed, because this repo is public.
    history: [], parentEmail: '',
  };
  let save = load();
  function load() {
    let s;
    try { s = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { s = Object.assign({}, defaults); }
    if (!s.progress) s.progress = {};
    if (!Array.isArray(s.history)) s.history = [];
    // migrate the old algebra-only save (had .round / .consecutiveWins)
    if (s.round && !s.progress.algebra) { s.subject = 'algebra'; s.level = s.round; s.progress.algebra = { levelId: s.round, consec: s.consecutiveWins || 0 }; }
    return s;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
  function prog() {
    if (!save.progress[save.subject]) save.progress[save.subject] = { levelId: save.level, consec: 0 };
    return save.progress[save.subject];
  }

  function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function isYesterday(prev) {
    if (!prev) return false;
    const d = new Date(); d.setDate(d.getDate() - 1);
    return prev === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  let game = null;
  let pendingSubject = null, pendingLevel = null;

  // ---------------- theme ----------------
  function applyTeam() {
    document.documentElement.style.setProperty('--team1', save.team.c1);
    document.documentElement.style.setProperty('--team2', save.team.c2);
    $('teamName').value = save.team.name; $('teamC1').value = save.team.c1; $('teamC2').value = save.team.c2;
  }

  // ---------------- sounds ----------------
  let actx = null;
  function tone(freq, start, dur, type = 'sine', vol = 0.18) {
    if (save.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
      const t = actx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  const sfx = {
    cheer() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.18, 'triangle')); },
    whistle() { tone(1650, 0, 0.14, 'square', 0.12); tone(1500, 0.14, 0.12, 'square', 0.12); },
    goal() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 'sawtooth', 0.16)); },
    fulltime() { tone(1600, 0, 0.5, 'square', 0.14); },
  };

  // ---------------- mascot ----------------
  let mascotTimer = null;
  function mascot(face, say, cheer) {
    const m = $('mascot'); m.firstChild.textContent = face; $('mascotSay').textContent = say;
    if (cheer) { m.classList.remove('cheer'); void m.offsetWidth; m.classList.add('cheer'); }
    clearTimeout(mascotTimer);
    mascotTimer = setTimeout(() => { m.firstChild.textContent = '⚽'; $('mascotSay').textContent = 'Keep going!'; }, 4000);
  }

  // ---------------- menu tree ----------------
  function renderMenu() {
    pendingSubject = pendingSubject || save.subject;
    pendingLevel = pendingLevel || save.level;
    const grid = $('subjectGrid'); grid.innerHTML = '';
    SUBJECTS.forEach((s, i) => {
      const card = document.createElement('button');
      card.className = 'subject-card' + (s.id === pendingSubject ? ' sel' : '');
      const tnum = TOPIC_NO[s.id] ? `<span class="subj-num">T${TOPIC_NO[s.id]}</span>` : '';
      card.innerHTML = `${tnum}<div class="subj-icon">${s.icon}</div><div class="subj-name">${SUBJ_SHORT[s.id]}</div><div class="subj-blurb">${s.blurb}</div>`;
      card.onclick = () => { pendingSubject = s.id; pendingLevel = (save.progress[s.id] && save.progress[s.id].levelId) || s.levels[0].id; renderMenu(); };
      grid.appendChild(card);
    });
    renderLevels();
  }
  function renderLevels() {
    const subj = subjectById(pendingSubject);
    const row = $('levelRow'); row.innerHTML = '';
    if (!subj.levels.some((l) => l.id === pendingLevel)) pendingLevel = subj.levels[0].id;
    subj.levels.forEach((l) => {
      const card = document.createElement('button');
      card.className = 'level-card' + (l.id === pendingLevel ? ' sel' : '');
      // ⭐ marks a level that goes BEYOND the school's Year 6 course — kept as stretch,
      // but flagged so nobody mistakes it for something they were taught.
      card.innerHTML = `<span class="lvl-badge">${l.badge}</span> ${l.name}`
        + (l.stretch ? `<span class="lvl-stretch">stretch</span>` : '');
      if (l.stretch) card.classList.add('stretch');
      card.onclick = () => { pendingLevel = l.id; renderLevels(); };
      row.appendChild(card);
    });
    $('kickoffBtn').disabled = false;
  }

  function refreshHeader() {
    const subj = subjectById(save.subject), lvl = levelOf(save.subject, save.level);
    $('roundBadge').textContent = subj.icon;
    $('roundName').textContent = `${SUBJ_SHORT[subj.id]} · ${lvl.name}`;
    $('streakNum').textContent = save.streak;
    $('goalsNum').textContent = save.goalsScored;
    $('muteBtn').textContent = save.muted ? '🔇' : '🔊';
  }

  // ---------------- start a match ----------------
  function startMatch() {
    save.team.name = $('teamName').value.trim(); save.team.c1 = $('teamC1').value; save.team.c2 = $('teamC2').value;
    save.subject = pendingSubject || save.subject; save.level = pendingLevel || save.level;
    prog().levelId = save.level;
    persist(); applyTeam(); refreshHeader();

    game = { subject: save.subject, level: save.level, match: buildMatchFor(save.subject, save.level, MATCH_LEN),
      matchIndex: 0, matchStats: { firstTry: 0, mistakes: {}, totalMistakes: 0 }, earnedPromotion: false,
      timeMs: 0, tick: Date.now() };
    $('startScreen').classList.add('hidden');
    $('gameScreen').classList.remove('hidden');
    renderDots(); loadProblem();
  }

  function renderDots() {
    const wrap = $('matchDots'); wrap.innerHTML = '';
    for (let i = 0; i < MATCH_LEN; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i < game.matchIndex ? ' done' : i === game.matchIndex ? ' current' : '');
      d.textContent = i < game.matchIndex ? '⚽' : (i + 1);
      wrap.appendChild(d);
    }
  }

  // ---------------- how long they actually worked ----------------
  // Wall-clock from kick-off to full-time would count the iPad being put down
  // mid-match, which makes "time practising" meaningless. Instead we add up the
  // gaps between one action and the next, and ignore any gap longer than IDLE_CAP —
  // that's a break, not maths. Same reason we stop the clock while the tab is hidden.
  const IDLE_CAP = 120000;                       // 2 minutes on a single step
  function clockTick() {
    if (!game) return;
    const now = Date.now();
    game.timeMs += Math.min(now - game.tick, IDLE_CAP);
    game.tick = now;
  }
  function clockResume() { if (game) game.tick = Date.now(); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clockTick(); else clockResume();
  });

  // ---------------- load a problem ----------------
  function loadProblem() {
    const prob = game.match[game.matchIndex];
    game.problem = prob; game.stepIndex = 0; game.solvedLines = [prob.given];
    game.firstTry = true; game.stepAttempts = 0;
    renderProblemHeader(prob);
    resetBall(); $('nextBtn').classList.add('hidden');
    renderDots(); renderSteps(); renderActive();
    mascot('⚽', save.team.name ? `Come on ${save.team.name}!` : "Let's go!", true);
  }

  function renderProblemHeader(prob) {
    const solveLike = prob.subject === 'solve' || prob.given.length > 46;
    const storyText = prob.story || (solveLike ? prob.given : '');
    if (storyText) { $('problemStory').textContent = storyText; $('problemStory').classList.remove('hidden'); }
    else $('problemStory').classList.add('hidden');
    const headline = prob.story ? prob.given : (solveLike ? 'Work it out step by step 🧩' : prob.given);
    $('problemGiven').innerHTML = headline;
    const dia = $('problemDiagram');
    if (prob.diagram) { dia.innerHTML = prob.diagram; dia.classList.remove('hidden'); } else { dia.innerHTML = ''; dia.classList.add('hidden'); }
    const lab = document.querySelector('.solve-label'); if (lab) lab.textContent = TASK_WORD[prob.subject] || 'SOLVE';
  }

  // ---------------- vertical steps timeline ----------------
  function renderSteps() {
    const stack = $('stepsStack'); stack.innerHTML = '';
    const prob = game.problem;
    stack.appendChild(stepRow('Kick-off', prob.given, '⚽', 'given'));
    prob.steps.forEach((step, i) => {
      let cls, eq, tick;
      if (i < game.stepIndex) { cls = 'done'; eq = game.solvedLines[i + 1] || step.resultText; tick = '✓'; }
      else if (i === game.stepIndex) { cls = 'active'; eq = '…'; tick = '⏱'; }
      else { cls = 'locked'; eq = '🔒'; tick = ''; }
      const label = step.isAnswer ? 'Final whistle' : `Minute ${(i + 1) * 15}`;
      stack.appendChild(stepRow(label, eq, tick, cls));
    });
  }
  function stepRow(minute, eq, tick, cls) {
    const row = document.createElement('div'); row.className = 'step-row ' + cls;
    let inner; const i = typeof eq === 'string' ? eq.indexOf('=') : -1;
    if (i !== -1) {
      inner = `<span class="lhs">${eq.slice(0, i).trim()}</span><span class="eqs">=</span><span class="rhs">${eq.slice(i + 1).trim()}</span>`;
    } else { inner = `<span class="mid">${eq}</span>`; }
    row.innerHTML = `<div class="minute">${minute}</div><div class="line-eq">${inner}</div><div class="tick">${tick}</div>`;
    return row;
  }

  // ---------------- active panel + input modes ----------------
  function stepMode(step) { return step.mode || 'build'; }

  function renderActive() {
    const step = game.problem.steps[game.stepIndex];
    $('stepPrompt').textContent = step.prompt;
    $('feedback').classList.add('hidden');
    $('btnLong').classList.toggle('hidden', !step.longWay);
    const tray = $('cardTray'); tray.innerHTML = '';
    const mode = stepMode(step);

    if (mode === 'choose' || mode === 'pick') {
      $('buildRow').classList.add('hidden');
      step.pool.forEach((val) => {
        const c = document.createElement('button');
        c.className = 'chip'; c.textContent = val; c.dataset.val = val;
        c.onclick = () => {
          if (mode === 'pick') { tray.querySelectorAll('.chip').forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); }
          else c.classList.toggle('sel');
        };
        tray.appendChild(c);
      });
    } else {
      $('buildRow').classList.remove('hidden');
      const { pool } = buildPool(step);
      pool.forEach((tok) => {
        const c = document.createElement('button');
        c.className = 'piece'; c.textContent = tok;
        c.onclick = () => { appendToken(tok); };
        tray.appendChild(c);
      });
      const inp = $('lineInput'); inp.value = ''; inp.disabled = false;
    }
  }

  function appendToken(tok) { const inp = $('lineInput'); inp.value = (inp.value + ' ' + tok).replace(/\s+/g, ' ').trim(); }
  function backspaceToken() { const inp = $('lineInput'); const t = inp.value.trim().split(/\s+/); t.pop(); inp.value = t.join(' '); }

  // Build-mode piece pool: correct tokens + wrong distractors, shuffled.
  function buildPool(step) {
    const tokens = step.pieces || step.resultText.split(/\s+/);
    const distract = step.distractors || genDistract(tokens);
    return { tokens, pool: shuffleArr([...tokens, ...distract]) };
  }
  function genDistract(tokens) {
    const d = new Set(); const has = (t) => tokens.includes(t);
    if (has('−') && !has('+')) d.add('+');
    if (has('+') && !has('−')) d.add('−');
    tokens.forEach((t) => {
      const fr = t.match(/^(−?\d+)\/(\d+)$/);
      if (fr) { d.add(fr[2] + '/' + fr[1].replace('−', '')); return; }     // upside-down fraction trap
      if (/^−?\d+$/.test(t)) { const v = Math.abs(parseInt(t.replace('−', '-'), 10)); const alt = String(v + (v < 10 ? 2 : 5)); if (!has(alt)) d.add(alt); return; }
      const xm = t.match(/^(−?)(\d*)x$/);
      if (xm) { const coef = xm[2] === '' ? 1 : parseInt(xm[2], 10); const alt = (xm[1] || '') + (coef + 1) + 'x'; if (!has(alt)) d.add(alt); }
    });
    return [...d].slice(0, 4);
  }
  function shuffleArr(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

  function currentInput(step) {
    const mode = stepMode(step);
    if (mode === 'choose' || mode === 'pick') return [...$('cardTray').querySelectorAll('.chip.sel')].map((c) => c.dataset.val);
    return $('lineInput').value.trim();
  }

  // ---------------- checking ----------------
  function checkStep() {
    const step = game.problem.steps[game.stepIndex];
    const mode = stepMode(step);
    const input = currentInput(step);
    if ((mode === 'build' && !input) || ((mode === 'choose' || mode === 'pick') && input.length === 0)) {
      showFeedback('info', mode === 'build' ? 'Build your line first' : 'Tap your answer first', 'Then press Check ✓.');
      return;
    }
    const res = step.check(input);
    clockTick();                                  // every Check closes off a work segment

    if (res.correct) {
      const steps = game.problem.steps, skip = res.skip || 0;
      game.solvedLines[game.stepIndex + 1] = step.resultText;
      for (let s = 1; s <= skip; s++) { const sk = steps[game.stepIndex + s]; if (sk) game.solvedLines[game.stepIndex + 1 + s] = sk.resultText; }
      flashActiveRow('flash-green'); sfx.cheer();
      const newIndex = game.stepIndex + 1 + skip, last = newIndex >= steps.length;
      const head = last ? 'GOAL! ⚽🥅' : (skip ? 'Two in one — quick! ⚡✓' : 'Nice — one good step ✓');
      showFeedback('good', head, last ? '' : (skip ? 'You did two steps at once and nailed it.' : 'On to the next step.'));
      game.stepIndex = newIndex; advanceBall();
      if (last) finishProblem();
      else { renderSteps(); renderActive(); mascot(skip ? '⚡' : '😃', skip ? 'Speedy!' : 'Keep it moving!', false); }
    } else if (res.soft) {
      flashActiveRow('flash-amber');
      showFeedback('info', 'One step at a time ⚽', explain(res.id, res.ctx));
      mascot('🙂', 'Short passes!', false);
    } else {
      flashActiveRow('flash-amber'); sfx.whistle();
      game.firstTry = false; game.stepAttempts++;
      recordMistake(res.id);
      showFeedback('bad', "Referee's whistle — try again 🟡", explain(res.id, res.ctx));
      mascot('🙂', 'Nearly! Read the tip.', false);
      if (mode === 'build') { $('lineInput').focus(); $('lineInput').select(); }
    }
  }

  function showFeedback(kind, head, body) {
    const fb = $('feedback'); fb.className = 'feedback ' + kind;
    fb.innerHTML = `<span class="fb-head">${head}</span>${body || ''}`;
    fb.classList.remove('hidden');
  }
  function flashActiveRow(cls) {
    const rows = $('stepsStack').querySelectorAll('.step-row'); const row = rows[game.stepIndex + 1];
    if (row) { row.classList.remove('flash-green', 'flash-amber'); void row.offsetWidth; row.classList.add(cls); }
  }

  // ---------------- ball ----------------
  function resetBall() { const b = $('ball'); b.classList.remove('goal'); b.style.left = '0px'; }
  function advanceBall() {
    const total = game.problem.steps.length, done = game.stepIndex, b = $('ball');
    if (done >= total) { b.classList.add('goal'); return; }
    b.style.left = (done / total * 82) + '%';
  }

  // ---------------- finished a problem ----------------
  function finishProblem() {
    save.goalsScored++;
    const p = prog();
    if (game.firstTry) { game.matchStats.firstTry++; p.consec = (p.consec || 0) + 1; } else { p.consec = 0; }
    const levels = subjectById(save.subject).levels;
    const idx = levels.findIndex((l) => l.id === save.level);
    const newlyEarned = p.consec >= 3 && idx < levels.length - 1 && !game.earnedPromotion;
    if (newlyEarned) game.earnedPromotion = true;
    persist(); refreshHeader(); renderSteps(); confetti(); sfx.goal();
    mascot(newlyEarned ? '🏅' : '🥳', newlyEarned ? 'Promotion secured!' : 'GOAAAL!', true);
    if (stepMode(game.problem.steps[game.problem.steps.length - 1]) === 'build') $('lineInput').disabled = true;
    const btn = $('nextBtn');
    btn.textContent = game.matchIndex >= MATCH_LEN - 1 ? 'Full-time whistle 🏁' : 'Next problem ▶';
    btn.classList.remove('hidden');
  }
  function nextProblem() { if (game.matchIndex >= MATCH_LEN - 1) { fullTime(); return; } game.matchIndex++; loadProblem(); }

  function recordMistake(id) {
    if (id === 'generic' || id === 'unparseable' || id === 'empty') return;
    game.matchStats.mistakes[id] = (game.matchStats.mistakes[id] || 0) + 1;
    game.matchStats.totalMistakes++;
    save.mistakeTotals[id] = (save.mistakeTotals[id] || 0) + 1;
    persist();
  }

  // ---------------- full-time summary (with stats) ----------------
  const LABELS = {
    'flip-number': 'flipping a sign when moving a number', 'combine-wrong': 'combining the x-terms',
    'forgot-divide': 'turning × into ÷', 'upside-down': 'the fraction the right way up', 'sign-slip': 'sign slips with negatives',
    'left-copy': 'leaving a term on both sides', 'not-simplified': 'simplifying the fraction', 'flip-x': 'flipping an x-term',
    'factor-not': 'checking a number really is a factor', 'factor-forgot-ends': 'remembering 1 and the number itself',
    'factor-missed': 'listing every factor', 'cf-not-common': 'common factors (in BOTH lists)', 'cf-missed': 'spotting all common factors',
    'hcf-not-highest': 'picking the HIGHEST common factor', 'hcf-wrong': 'the HCF',
    'mult-not': 'checking a number is a multiple', 'mult-missed': 'listing all the multiples',
    'cm-not-common': 'common multiples (in BOTH lists)', 'lcm-not-lowest': 'picking the LOWEST common multiple', 'lcm-multiplied': 'not just multiplying for the LCM',
    'prime-yesno': 'deciding if a number is prime', 'primes-not': 'telling primes from non-primes', 'primes-missed': 'spotting every prime',
    'spf-not-prime': 'using a prime factor', 'spf-not-smallest': 'the smallest prime factor', 'pf-product': 'the prime factorisation',
    'ratio-div': 'dividing both sides of the ratio', 'ratio-order': 'keeping the ratio order', 'share-parts': 'counting the parts',
    'share-per': 'the value of one part', 'share-mult': 'building each share',
    'dec-dir': 'which way the point moves', 'dec-places': 'how many places to move', 'dec-answer': 'moving the decimal point', 'dec-addsub': 'lining up the decimal points',
    'pc-ten': 'finding 10%', 'pc-mult': 'scaling up the percentage', 'pc-half': 'finding 5%', 'pc-add': 'adding the parts', 'num-wrong': 'a calculation',
  };
  const TIPS = {
    'flip-number': 'When a number crosses the =, flip it: +3 becomes −3.',
    'combine-wrong': '33x − 2x is 33 − 2 = 31 of the same thing.',
    'forgot-divide': 'The number stuck to x is multiplying — undo it by dividing.',
    'upside-down': 'The number you divide BY goes on the bottom.',
    'hcf-not-highest': 'The HCF is the BIGGEST number in the common list.',
    'lcm-multiplied': 'Multiplying only gives the LCM when the numbers share no factors.',
    'factor-forgot-ends': '1 and the number itself are always factors.',
    'prime-yesno': 'A prime has exactly two factors: 1 and itself.',
    'dec-places': 'Count the zeros: that many places the point moves.',
    'pc-ten': '10% is a tenth — just divide by 10, then build up.',
    'share-per': 'Find one part first (amount ÷ total parts), then scale.',
  };

  function fullTime() {
    const today = todayStr();
    if (save.lastPlayedDate !== today) { save.streak = isYesterday(save.lastPlayedDate) ? save.streak + 1 : 1; save.lastPlayedDate = today; }

    // Log the match BEFORE promotion changes save.level, so the record says which
    // level was actually played rather than the one they were promoted into.
    const stats = game.matchStats;
    clockTick();
    const secs = Math.round(game.timeMs / 1000);
    save.history = WAC.addMatch(save.history, {
      d: today, t: Date.now(), s: save.subject, l: save.level,
      p: Math.round((stats.firstTry / MATCH_LEN) * 100),
      m: stats.totalMistakes, c: stats.totalMistakes === 0 ? 1 : 0, sec: secs,
    });

    let promoted = null;
    if (game.earnedPromotion) {
      const levels = subjectById(save.subject).levels, idx = levels.findIndex((l) => l.id === save.level);
      if (idx < levels.length - 1) { save.level = levels[idx + 1].id; prog().levelId = save.level; prog().consec = 0; promoted = levels[idx + 1]; }
    }
    persist(); refreshHeader(); sfx.fulltime(); confetti(); confetti();

    const st = game.matchStats;
    const scorePct = Math.round((st.firstTry / MATCH_LEN) * 100);
    let topId = null, topN = 0;
    for (const k in st.mistakes) if (st.mistakes[k] > topN) { topN = st.mistakes[k]; topId = k; }
    const subjName = SUBJ_SHORT[save.subject];

    let html = `<div class="score-big">${scorePct}%</div><p class="score-sub">${st.firstTry} of ${MATCH_LEN} solved first try in <strong>${subjName}</strong>.</p>`;
    html += `<ul class="stat-list">`;
    html += `<li>⚽ Goals this match: <strong>${MATCH_LEN}</strong> &nbsp;·&nbsp; career total ${save.goalsScored}</li>`;
    html += `<li>🟡 Mistakes fixed before scoring: <strong>${st.totalMistakes}</strong></li>`;
    html += `<li>⏱️ Time on the pitch: <strong>${WAC.fmtDur(secs)}</strong></li>`;
    html += `<li>🏆 Unbeaten run: <strong>${save.streak} day${save.streak === 1 ? '' : 's'}</strong></li>`;
    html += `</ul>`;
    if (promoted) html += `<div class="promo">🎉 PROMOTED! You're through to <strong>${promoted.name}</strong> ${promoted.badge}</div>`;
    else { const levels = subjectById(save.subject).levels, idx = levels.findIndex((l) => l.id === save.level); if (idx < levels.length - 1) html += `<p>Clean wins toward the next level: <strong>${prog().consec}/3</strong>.</p>`; }
    if (topId) {
      html += `<p>The trickiest thing today was <strong>${LABELS[topId] || 'one of the steps'}</strong>.</p>`;
      if (TIPS[topId]) html += `<p>💡 Tip: ${TIPS[topId]}</p>`;
    } else html += `<p>💡 Amazing — no mistakes at all today. Try a harder level next!</p>`;
    $('summaryBody').innerHTML = html;
    $('summaryModal').classList.remove('hidden');
  }

  // ---------------- scores & history ----------------
  function levelNameOf(subjectId, levelId) {
    const l = subjectById(subjectId).levels.find((x) => x.id === levelId);
    return l ? l.name.replace(/\s*🏆\s*$/, '') : levelId;
  }
  function levelRankOf(subjectId, levelId) {
    return subjectById(subjectId).levels.findIndex((x) => x.id === levelId);
  }
  function showHistory() {
    $('historyBody').innerHTML = WAC.panelHTML(save.history, todayStr(), {
      names: SUBJ_SHORT, levelName: levelNameOf, levelRank: levelRankOf,
    });
    $('startScreen').classList.add('hidden');
    $('historyScreen').classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  function hideHistory() {
    $('historyScreen').classList.add('hidden');
    $('startScreen').classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  function emailWeek() {
    if (!save.parentEmail) {
      const a = prompt('Which email address should the weekly summary go to?\n(Saved on this iPad only.)', '');
      if (!a || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.trim())) return;
      save.parentEmail = a.trim(); persist();
    }
    const body = WAC.weeklySummary(save.history, todayStr(), SUBJ_SHORT);
    const subject = `World Maths Cup — week to ${todayStr()}`;
    // mailto opens Mail with everything filled in; nothing is sent without a tap.
    location.href = `mailto:${encodeURIComponent(save.parentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function copyBackup() {
    const blob = JSON.stringify({ v: 1, history: save.history, progress: save.progress, goalsScored: save.goalsScored, streak: save.streak });
    const done = () => alert(`Copied ${save.history.length} matches to the clipboard.\nPaste it somewhere safe (Notes, a message to yourself).`);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(blob).then(done, () => prompt('Copy this:', blob));
    else prompt('Copy this:', blob);
  }
  function restoreBackup() {
    const raw = prompt('Paste a backup here to restore it.\nThis REPLACES the scores on this iPad.');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (e) { alert("That doesn't look like a backup — nothing was changed."); return; }
    if (!data || !Array.isArray(data.history)) { alert("That doesn't look like a backup — nothing was changed."); return; }
    if (!confirm(`Restore ${data.history.length} matches? The scores currently on this iPad will be replaced.`)) return;
    save.history = data.history;
    if (data.progress) save.progress = data.progress;
    if (typeof data.goalsScored === 'number') save.goalsScored = data.goalsScored;
    if (typeof data.streak === 'number') save.streak = data.streak;
    persist(); refreshHeader(); showHistory();
  }

  function playAgain() { $('summaryModal').classList.add('hidden'); pendingSubject = save.subject; pendingLevel = save.level; startMatch(); }
  function endMatch() { $('gameScreen').classList.add('hidden'); $('startScreen').classList.remove('hidden'); pendingSubject = save.subject; pendingLevel = save.level; renderMenu(); refreshHeader(); }

  // ---------------- confetti ----------------
  const cv = $('confettiCanvas'); const ctx2 = cv.getContext('2d');
  let parts = [], rafOn = false;
  function sizeCanvas() { cv.width = innerWidth; cv.height = innerHeight; }
  function confetti() {
    sizeCanvas();
    const colors = [save.team.c1, save.team.c2, '#ffffff', '#ff5252', '#4da3ff'];
    for (let i = 0; i < 90; i++) parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight / 3, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 12 - 3, s: Math.random() * 7 + 4, c: colors[i % colors.length], r: Math.random() * 6, a: 1 });
    if (!rafOn) { rafOn = true; requestAnimationFrame(drawConfetti); }
  }
  function drawConfetti() {
    ctx2.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => { p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.r += 0.1; p.a -= 0.008; ctx2.globalAlpha = Math.max(0, p.a); ctx2.fillStyle = p.c; ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.r); ctx2.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx2.restore(); });
    parts = parts.filter((p) => p.a > 0 && p.y < cv.height + 20);
    if (parts.length) requestAnimationFrame(drawConfetti); else { ctx2.clearRect(0, 0, cv.width, cv.height); rafOn = false; }
  }
  window.addEventListener('resize', sizeCanvas);

  // ---------------- wire up ----------------
  function init() {
    applyTeam(); renderMenu(); refreshHeader();
    $('kickoffBtn').onclick = startMatch;
    $('historyBtn').onclick = showHistory;
    $('historyBackBtn').onclick = hideHistory;
    $('emailWeekBtn').onclick = emailWeek;
    $('copyBackupBtn').onclick = copyBackup;
    $('restoreBtn').onclick = restoreBackup;
    $('btnCheck').onclick = checkStep;
    $('btnBack').onclick = backspaceToken;
    $('btnClear').onclick = () => { $('lineInput').value = ''; };
    $('lineInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkStep(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && game && !$('gameScreen').classList.contains('hidden') && document.activeElement !== $('lineInput')) { const step = game.problem.steps[game.stepIndex]; if (stepMode(step) !== 'build') checkStep(); } });
    $('btnHint').onclick = () => { const step = game.problem.steps[game.stepIndex]; showFeedback('info', 'Hint 💡', step.hint); };
    $('btnWhy').onclick = () => { const step = game.problem.steps[game.stepIndex]; let body = step.why; if (save.longWay && step.longWay) body += `<pre>${step.longWay}</pre>`; showFeedback('info', 'Why does this work? 🤔', body); };
    $('btnLong').onclick = () => { const step = game.problem.steps[game.stepIndex]; save.longWay = true; persist(); showFeedback('info', 'The long way 🧮', `<pre>${step.longWay || step.hint}</pre>`); };
    $('nextBtn').onclick = nextProblem;
    $('quitBtn').onclick = endMatch;
    $('playAgainBtn').onclick = playAgain;
    $('muteBtn').onclick = () => { save.muted = !save.muted; persist(); refreshHeader(); };
    $('teamC1').oninput = (e) => document.documentElement.style.setProperty('--team1', e.target.value);
    $('teamC2').oninput = (e) => document.documentElement.style.setProperty('--team2', e.target.value);
  }
  init();
})();
