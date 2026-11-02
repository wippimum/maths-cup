/* computing7.js — Year 7 COMPUTING (not maths): the Term 1 test.

   Built from the school's own revision poster ("Year 7 Computing Term 1 Assessment"),
   seven sections plus its Key Revision Checklist. Every fact here is the poster's fact,
   in the poster's words where it has words:

     1 Hardware and Software      hardware = physical parts you can touch; software =
                                  programs and instructions; system software manages
                                  hardware and supports other programs (Windows, macOS);
                                  application software does specific tasks (Excel, Canva,
                                  WhatsApp)
     2 Computer Storage           saving files and data so they can be used later; HDD,
                                  SSD, USB flash drive, memory card
     3 Storage Units              Byte < KB < MB < GB < TB, each 1,000 of the one before
                                  (the poster uses 1,000, so this does too — never 1,024)
     4 Data and Information       raw facts without context vs data given meaning
     5 Spreadsheets               organise, store, analyse; cells, columns (letters), rows
                                  (numbers); advantages over paper
     6 Spreadsheet Formulas       start with =; SUM, AVERAGE, MAX, MIN
     7 Good Data Collection       same test and conditions; fair, large enough sample;
                                  clear headings, a row each; check for errors

   Each section has three levels that climb: LEARN (the idea in small steps), PRACTISE
   (sort, order, pick, spot the odd one out) and REAL LIFE (a scenario: a striker's
   spreadsheet, goal clips on a memory card, a goalkeeper reaction test). A last mixed
   level is the test itself.

   Every step carries a `concept` (one of CS_CONCEPTS) and a `kind` (the question type).
   The app uses those for the mastery meter and for bringing a missed idea back later in
   the same match. This file also holds the glossary and the mastery bookkeeping, both
   kept PURE (no DOM, no storage) so test/test-computing.js can check them in Node. */
(function (root) {
  const W = (root.WAC && root.WAC._pickStep) ? root.WAC : require('./topics.js');
  let EXPLAIN = root.WAC && root.WAC.EXPLAIN;
  if (!EXPLAIN) { try { EXPLAIN = require('./explanations.js').EXPLAIN; } catch (e) { EXPLAIN = {}; } }

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = W._shuffle;
  const sample = (a, n) => shuffle(a).slice(0, n);
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const SUBJ = 'y7comp';
  // Made-up names only. This repo is public.
  const NAMES = ['Sam', 'Mia', 'Omar', 'Zara', 'Leo', 'Noor', 'Ravi', 'Ella', 'Yusuf', 'Lina', 'Kai', 'Maya', 'Adam', 'Sara', 'Ali', 'Hana'];
  const TEAMS = ['Lions', 'Eagles', 'Sharks', 'Tigers', 'Falcons', 'Wolves', 'Bears', 'Hawks'];

  // ======================================================== sections, concepts, checklist
  const CS_SECTIONS = [
    { n: 1, name: 'Hardware and Software', icon: '🖥️', concepts: ['hw-sw', 'sys-app'] },
    { n: 2, name: 'Computer Storage', icon: '💾', concepts: ['storage-why', 'storage-dev'] },
    { n: 3, name: 'Storage Units', icon: '📏', concepts: ['units-order', 'units-convert'] },
    { n: 4, name: 'Data and Information', icon: 'ℹ️', concepts: ['data-info', 'info-use'] },
    { n: 5, name: 'Spreadsheets', icon: '📊', concepts: ['sheet-why', 'sheet-cells'] },
    { n: 6, name: 'Spreadsheet Formulas', icon: '🧮', concepts: ['formula-what', 'formula-calc'] },
    { n: 7, name: 'Good Data Collection', icon: '📋', concepts: ['collect-fair', 'collect-table'] },
  ];
  const CS_CONCEPTS = {
    'hw-sw': 'Hardware vs software',
    'sys-app': 'System vs application software',
    'storage-why': 'What storage is for',
    'storage-dev': 'HDD, SSD, USB flash drive and memory card',
    'units-order': 'Storage units in order',
    'units-convert': 'Converting between storage units',
    'data-info': 'Data vs information',
    'info-use': 'Why information is more useful',
    'sheet-why': 'What a spreadsheet is for, and why it beats paper',
    'sheet-cells': 'Cells, rows, columns and cell references',
    'formula-what': 'What =SUM, =AVERAGE, =MAX and =MIN do',
    'formula-calc': "Working out a formula's answer",
    'collect-fair': 'Same test, fair and large enough sample',
    'collect-table': 'Clear headings, a row each, check for errors',
  };
  // The poster's Key Revision Checklist, word for word, and the concepts behind each line.
  const CS_CHECKLIST = [
    { text: 'Know the difference between hardware and software.', concepts: ['hw-sw'] },
    { text: 'Identify system and application software.', concepts: ['sys-app'] },
    { text: 'Understand the purpose of computer storage.', concepts: ['storage-why'] },
    { text: 'Compare HDDs and SSDs and know examples of storage devices.', concepts: ['storage-dev'] },
    { text: 'Recall storage units in the correct order (Byte, KB, MB, GB, TB).', concepts: ['units-order'] },
    { text: 'Explain the difference between data and information.', concepts: ['data-info', 'info-use'] },
    { text: 'Know the purpose and key features of a spreadsheet.', concepts: ['sheet-why', 'sheet-cells'] },
    { text: 'Use and recognise =SUM, =AVERAGE, =MAX and =MIN.', concepts: ['formula-what', 'formula-calc'] },
  ];
  const sectionOf = (c) => (CS_SECTIONS.find((s) => s.concepts.includes(c)) || {}).n;

  // A wrong answer's explanation travels in ctx.msg; the id names the concept so the
  // full-time summary can say WHICH idea was trickiest.
  Object.keys(CS_CONCEPTS).forEach((c) => {
    EXPLAIN['cs-' + c] = (ctx) => (ctx && ctx.msg) || `Have another look at this one: ${CS_CONCEPTS[c].toLowerCase()}. Tap Hint 💡 for help.`;
  });
  const CS_MISTAKE_LABELS = {};
  Object.keys(CS_CONCEPTS).forEach((c) => { CS_MISTAKE_LABELS['cs-' + c] = CS_CONCEPTS[c].toLowerCase(); });

  // ======================================================== step builders
  const tag = (st, o) => { st.concept = o.concept; st.kind = o.kind; if (o.noGloss) st.noGloss = true; return st; };

  // One right answer, a handful of wrong ones — every wrong one carries its own reason.
  function pk(o) {
    const used = new Set([String(o.answer)]), uniq = [];
    for (const w of o.wrong) { const v = String(w[0]); if (!used.has(v)) { used.add(v); uniq.push([v, w[1]]); } }
    const shown = o.keepAll ? uniq : shuffle(uniq).slice(0, o.n || 3);
    const msg = new Map(shown);
    const st = W._pickStep({ key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.result || String(o.answer), expected: [String(o.answer)], isAnswer: !!o.isAnswer,
      pool: [String(o.answer)].concat(shown.map((w) => w[0])),
      diagnose: (v) => ({ correct: false, id: 'cs-' + o.concept, ctx: { msg: msg.get(v) || `Not that one. The answer is: ${o.answer}.` } }) });
    return tag(st, o);
  }
  // A number answer: every wrong number explained by the same honest rule (o.whyWrong).
  function pkNum(o) {
    const wrong = [...new Set(o.wrongNums)].filter((x) => x !== o.answer && x >= 0)
      .map((x) => [fmt(x), o.whyWrong(x)]);
    return pk(Object.assign({}, o, { answer: fmt(o.answer), wrong, n: o.n || 3 }));
  }
  // "Tap every …" — items are [label, belongs, what it really is].
  function ch(o) {
    const expected = o.items.filter((i) => i[1]).map((i) => i[0]);
    const info = new Map(o.items.map((i) => [i[0], i[2]]));
    const st = W._chooseStep({ key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.result || expected.join(', '), isAnswer: !!o.isAnswer, expected, pool: o.items.map((i) => i[0]),
      diagnose: (cur, exp) => {
        const extra = cur.filter((x) => !exp.includes(x)), missed = exp.filter((x) => !cur.includes(x));
        const parts = extra.map((x) => `${x} does not belong: ${info.get(x)}`)
          .concat(missed.map((x) => `You missed ${x}: ${info.get(x)}`));
        const text = parts.slice(0, 2).join(' ') + (parts.length > 2 ? ' Check the others too.' : '');
        return { correct: false, id: 'cs-' + o.concept, ctx: { msg: text || 'Tap the cards that belong, then press Check.' } };
      } });
    return tag(st, o);
  }
  function bd(o) {
    const st = W._buildStep({ key: o.key, prompt: o.prompt, hint: o.hint, why: o.why, longWay: o.longWay,
      resultText: o.result, isAnswer: !!o.isAnswer, pieces: o.pieces, distractors: o.distractors || [],
      solution: o.solution, check: o.check });
    return tag(st, o);
  }
  const prob = (section, sig, given, steps, extra) => Object.assign({ subject: SUBJ, section, sig, given, steps,
    answer: steps[steps.length - 1].resultText }, extra || {});

  // A spreadsheet grid the way it looks on screen: letters across, numbers down.
  // `rows` includes the heading row, which sits in row 1 exactly as in a real sheet.
  function sheetHTML(rows, opts) {
    opts = opts || {};
    const cols = Math.max(...rows.map((r) => r.length));
    const letters = 'ABCDEFG'.slice(0, cols).split('');
    let h = `<table class="wtable sheet"${opts.caption ? ` aria-label="${esc(opts.caption)}"` : ''}><thead><tr><th class="corner"></th>`;
    h += letters.map((l) => `<th>${l}</th>`).join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      h += `<tr><th>${i + 1}</th>`;
      for (let j = 0; j < cols; j++) {
        const v = r[j] == null ? '' : r[j];
        const star = opts.star && opts.star[0] === j && opts.star[1] === i;
        h += `<td${star ? ' class="mark"' : ''}>${star ? '★' : esc(v)}</td>`;
      }
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  const L = (j) => 'ABCDEFG'[j];

  // ======================================================== 1 · HARDWARE AND SOFTWARE
  const HW = [
    { name: 'Monitor', a: 'a monitor', does: 'shows your work on a screen' },
    { name: 'Keyboard', a: 'a keyboard', does: 'is used to type letters and numbers' },
    { name: 'Mouse', a: 'a mouse', does: 'is used to point and click' },
    { name: 'Printer', a: 'a printer', does: 'puts your work on paper' },
    { name: 'Speakers', a: 'speakers', does: 'play sound out loud' },
    { name: 'Webcam', a: 'a webcam', does: 'films you for a video call' },
    { name: 'Microphone', a: 'a microphone', does: 'records your voice' },
    { name: 'Scanner', a: 'a scanner', does: 'copies paper pages into the computer' },
  ];
  const SYS = [
    { name: 'Windows', does: 'manages the hardware and supports other programs on many PCs and laptops' },
    { name: 'macOS', does: 'manages the hardware and supports other programs on Apple computers' },
  ];
  const APP = [
    { name: 'Word', does: 'writing documents', job: "write a letter to the players' parents" },
    { name: 'Excel', does: 'spreadsheets: organising data and working out totals', job: 'keep a table of goals and work out the total' },
    { name: 'Canva', does: 'designing posters and graphics', job: 'design a poster for the next match' },
    { name: 'Scratch', does: 'making games and animations with code blocks', job: 'program a simple penalty-shootout game' },
    { name: 'WhatsApp', does: 'sending messages', job: 'message the players about training' },
    { name: 'PowerPoint', does: 'making slide presentations', job: 'make slides for the team talk' },
  ];
  const HW_DEF = 'Hardware means the physical parts of a computer that you can touch.';
  const SW_DEF = 'Software means programs and instructions that tell a computer what to do.';
  const SYS_DEF = 'System software manages the hardware and supports other programs (e.g. Windows, macOS).';
  const APP_DEF = 'Application software is used to carry out specific tasks (e.g. Excel, Canva, WhatsApp).';

  function hwLearn() {
    if (Math.random() < 0.4) {
      const h = pick(HW);
      return prob(1, `hl:${h.name}`, `Hardware or software? ${h.name}`, [
        pk({ key: 'touch', concept: 'hw-sw', kind: 'learn',
          prompt: `Think about ${h.a}. Could you pick it up and touch it?`,
          answer: 'Yes, it is a physical object',
          wrong: [['No, it is a set of instructions', `${h.name} is a real object on the desk — you can hold it. Instructions and programs are the things you cannot touch.`],
            ['No, it only exists inside the internet', `${h.name} is a real object you can hold, not something on the internet.`]], keepAll: true,
          hint: `${h.name}: it ${h.does}. You can hold it in your hands.`,
          why: `The quickest test for hardware is: can I touch it? ${HW_DEF}`,
          result: `${h.name}: you can touch it` }),
        pk({ key: 'class', concept: 'hw-sw', kind: 'learn', isAnswer: true,
          prompt: `So is ${h.a} hardware or software?`, answer: 'Hardware',
          wrong: [['Software', `${SW_DEF} You cannot touch a program, but you CAN touch ${h.a}.`],
            ['Application software', `Application software is a program for a task, like Canva. ${h.name} is a physical object, so it is hardware.`]], keepAll: true,
          hint: 'Physical part you can touch = hardware.',
          why: `${HW_DEF} The poster's examples are a monitor, keyboard, mouse and printer — ${h.a} belongs with them.`,
          longWay: `Can I touch it?  Yes\nSo ${h.name} = hardware`,
          result: `${h.name} = hardware` }),
      ]);
    }
    const isSys = Math.random() < 0.35;
    const s = isSys ? pick(SYS) : pick(APP);
    const type = isSys ? 'System software' : 'Application software';
    return prob(1, `hl:${s.name}`, `Hardware or software? ${s.name}`, [
      pk({ key: 'touch', concept: 'hw-sw', kind: 'learn',
        prompt: `Think about ${s.name}. Could you pick ${s.name} itself up and touch it (not the screen it shows on)?`,
        answer: 'No, it is a program',
        wrong: [['Yes, it is a physical part', `You can touch the monitor that SHOWS ${s.name}, but ${s.name} itself is a program — instructions running inside the computer.`],
          ['Yes, it is a storage device', `A storage device like an SSD is something you can touch. ${s.name} is a program, not a device.`]], keepAll: true,
        hint: `${s.name} runs on the computer — you see it on the screen but cannot hold it.`,
        why: `The screen is hardware, but what it shows you is software. ${SW_DEF}`,
        result: `${s.name}: you cannot touch it` }),
      pk({ key: 'class', concept: 'hw-sw', kind: 'learn',
        prompt: `So is ${s.name} hardware or software?`, answer: 'Software',
        wrong: [['Hardware', `${HW_DEF} ${s.name} is a program, so it is software.`],
          ['Neither, it is data', `Data is raw facts and figures, like 45, 67, 89. ${s.name} is a program that tells the computer what to do, so it is software.`]], keepAll: true,
        hint: 'Programs and instructions = software.',
        why: SW_DEF, result: `${s.name} = software` }),
      pk({ key: 'type', concept: 'sys-app', kind: 'learn', isAnswer: true,
        prompt: `Software comes in two types. Which type is ${s.name}?`, answer: type,
        wrong: isSys
          ? [['Application software', `Application software does one specific task, like Canva for posters. ${s.name} ${s.does}, so it is system software.`],
            ['Hardware', `${s.name} cannot be touched — it is software. And it ${s.does}, so it is system software.`]]
          : [['System software', `System software manages the hardware and supports other programs, like Windows. ${s.name} is for one specific task — ${s.does} — so it is application software.`],
            ['Hardware', `${s.name} cannot be touched, so it is not hardware. It is used for ${s.does}: application software.`]], keepAll: true,
        hint: isSys ? `${s.name} ${s.does}.` : `${s.name} is used for one task: ${s.does}.`,
        why: `${SYS_DEF} ${APP_DEF}`,
        longWay: `Can I touch it?  No → software\nDoes it run the computer, or do one task?\n${s.name}: ${isSys ? 'runs the computer' : s.does}\nSo ${s.name} = ${type.toLowerCase()}`,
        result: `${s.name} = ${type.toLowerCase()}` }),
    ]);
  }

  function hwSort() {
    if (Math.random() < 0.55) {
      const hw = sample(HW, rand(2, 3)), sys = pick(SYS), apps = sample(APP, 5 - hw.length);
      const items = shuffle([
        ...hw.map((h) => [h.name, true, `${h.name} is a physical part you can touch — hardware.`]),
        [sys.name, false, `${sys.name} is software (system software) — you cannot touch it.`],
        ...apps.map((a) => [a.name, false, `${a.name} is software — a program for ${a.does}.`]),
      ]);
      const soft = [sys, ...apps].map((x) => x.name);
      return prob(1, `hs:${items.map((i) => i[0]).join('|')}`, 'Sort the kit bag: hardware or software?', [
        ch({ key: 'hw', concept: 'hw-sw', kind: 'sort', items,
          prompt: 'Tap EVERY piece of hardware. Leave the software alone.',
          hint: `The hardware here: ${hw.map((h) => h.name).join(', ')}.`,
          why: `${HW_DEF} ${SW_DEF}`, result: `Hardware: ${hw.map((h) => h.name).join(', ')}` }),
        pk({ key: 'sys', concept: 'sys-app', kind: 'pick', isAnswer: true, keepAll: true, noGloss: true,
          prompt: `Now the software that is left: ${shuffle(soft).join(', ')}. Which one is SYSTEM software?`,
          answer: sys.name,
          wrong: apps.map((a) => [a.name, `${a.name} is application software — it carries out one specific task: ${a.does}.`]),
          hint: `${sys.name} ${sys.does}.`,
          why: `${SYS_DEF} Every other one here is for one specific job, so they are application software.`,
          result: `${sys.name} = system software` }),
      ]);
    }
    // odd one out, then say WHY — the reason is the real test
    if (Math.random() < 0.5) {
      const hw = sample(HW, 3), odd = Math.random() < 0.5 ? pick(APP) : pick(SYS);
      const shown = shuffle([...hw.map((h) => h.name), odd.name]);
      return prob(1, `ho:${shown.join('|')}`, `Odd one out: ${shown.join(', ')}`, [
        pk({ key: 'odd', concept: 'hw-sw', kind: 'odd', keepAll: true,
          prompt: `Which one is the odd one out? ${shown.join(', ')}`, answer: odd.name,
          wrong: hw.map((h) => [h.name, `${h.name} is hardware — a physical part you can touch — just like most of the others.`]),
          hint: 'Three of them you can touch. One you cannot.',
          why: `${hw.map((h) => h.name).join(', ')} are all hardware. ${odd.name} is a program, so it is software.`,
          result: `${odd.name} is the odd one out` }),
        pk({ key: 'reason', concept: 'hw-sw', kind: 'odd', isAnswer: true, keepAll: true, noGloss: true,
          prompt: `Why is ${odd.name} the odd one out?`, answer: 'It is software; the others are hardware',
          wrong: [['It is hardware; the others are software', `It is the other way round: ${hw.map((h) => h.name).join(', ')} can be touched, so they are hardware.`],
            ['It is a storage device', `${odd.name} does not store files like an HDD or SSD — it is a program, so it is software.`],
            ['It is more expensive', 'Price is not how we sort them. The question is: can you touch it (hardware) or is it a program (software)?']],
          hint: `Can you touch ${odd.name}?`, why: `${HW_DEF} ${SW_DEF}`,
          result: `${odd.name} is software; the rest are hardware` }),
      ]);
    }
    const apps = sample(APP, 3), sys = pick(SYS);
    const shown = shuffle([...apps.map((a) => a.name), sys.name]);
    return prob(1, `ho:${shown.join('|')}`, `Odd one out: ${shown.join(', ')}`, [
      pk({ key: 'odd', concept: 'sys-app', kind: 'odd', keepAll: true,
        prompt: `All four are software. Which one is the odd one out? ${shown.join(', ')}`, answer: sys.name,
        wrong: apps.map((a) => [a.name, `${a.name} does one specific task (${a.does}), just like two of the others — application software.`]),
        hint: 'Three do one specific job each. One runs the whole computer.',
        why: `${SYS_DEF} ${APP_DEF}`, result: `${sys.name} is the odd one out` }),
      pk({ key: 'reason', concept: 'sys-app', kind: 'odd', isAnswer: true, keepAll: true, noGloss: true,
        prompt: `Why is ${sys.name} the odd one out?`, answer: 'It is system software; the others are application software',
        wrong: [['It is application software; the others are system software', `The other way round: ${apps.map((a) => a.name).join(', ')} each do one specific task, so they are application software.`],
          ['It is hardware; the others are software', `${sys.name} cannot be touched — it is software. Its job is to manage the hardware.`],
          ['It is the only one that is free', 'Price is not the difference. Look at the JOB: managing the hardware, or one specific task?']],
        hint: `${sys.name} ${sys.does}.`, why: `${SYS_DEF} ${APP_DEF}`,
        result: `${sys.name} = system software` }),
    ]);
  }

  const HW_JOBS = [
    { job: 'print the match posters', hw: 'Printer' }, { job: "type in the players' names", hw: 'Keyboard' },
    { job: 'see her work on a screen', hw: 'Monitor' }, { job: 'point and click on icons', hw: 'Mouse' },
    { job: 'play the goal videos out loud', hw: 'Speakers' }, { job: 'join a video call with the coach', hw: 'Webcam' },
  ];
  function hwReal() {
    const j = pick(HW_JOBS), sys = pick(SYS), app = pick(APP);
    const otherHw = sample(HW.filter((h) => h.name !== j.hw), 2);
    const otherApps = sample(APP.filter((a) => a.name !== app.name), 2);
    return prob(1, `hr:${j.hw}:${sys.name}:${app.name}`,
      `Club office: the secretary has a new laptop. She needs to ${j.job} and ${app.job}.`, [
        pk({ key: 'hw', concept: 'hw-sw', kind: 'scenario', keepAll: true,
          prompt: `Which HARDWARE does she need to ${j.job}?`, answer: j.hw,
          wrong: [...otherHw.map((h) => [h.name, `${h.name} is hardware too, but it ${h.does} — it cannot ${j.job}.`]),
            [app.name, `${app.name} is software — a program, not something you can touch.`]],
          hint: `To ${j.job} you need the ${j.hw.toLowerCase()}.`, why: HW_DEF, result: `${j.hw} (hardware)` }),
        pk({ key: 'sys', concept: 'sys-app', kind: 'scenario', keepAll: true, noGloss: true,
          prompt: 'The laptop needs software that manages its hardware and supports her other programs. Which one?',
          answer: sys.name,
          wrong: [...otherApps.map((a) => [a.name, `${a.name} is application software — it is for ${a.does}, not for running the laptop.`]),
            [otherHw[0].name, `${otherHw[0].name} is hardware. The question asks for software that manages the hardware.`]],
          hint: `${sys.name} ${sys.does}.`, why: SYS_DEF, result: `${sys.name} runs the laptop` }),
        pk({ key: 'app', concept: 'sys-app', kind: 'scenario', keepAll: true,
          prompt: `Which program should she use to ${app.job}?`, answer: app.name,
          wrong: [...otherApps.map((a) => [a.name, `${a.name} is for ${a.does}. To ${app.job} she needs ${app.name}.`]),
            [sys.name, `${sys.name} runs the laptop, but it is not the program for this task. That needs application software: ${app.name}.`]],
          hint: `${app.name} is for ${app.does}.`, why: APP_DEF, result: `${app.name}` }),
        pk({ key: 'type', concept: 'sys-app', kind: 'scenario', isAnswer: true, keepAll: true, noGloss: true,
          prompt: `What TYPE of software is ${app.name}?`, answer: 'Application software',
          wrong: [['System software', `System software manages the hardware, like ${sys.name}. ${app.name} does one specific task, so it is application software.`],
            ['Hardware', `${app.name} cannot be touched — it is software.`]],
          hint: 'It carries out one specific task.', why: APP_DEF,
          longWay: `${j.hw} → hardware (can touch it)\n${sys.name} → system software (runs the laptop)\n${app.name} → application software (one task: ${app.does})`,
          result: `${app.name} = application software` }),
      ]);
  }

  // ======================================================== 2 · COMPUTER STORAGE
  const DEV = {
    HDD: { name: 'HDD (Hard Disk Drive)', short: 'HDD', desc: 'Large capacity, cheaper, but slower (uses moving parts)' },
    SSD: { name: 'SSD (Solid State Drive)', short: 'SSD', desc: 'Faster and more reliable, but usually more expensive' },
    USB: { name: 'USB flash drive', short: 'USB flash drive', desc: 'Portable and easy to use for transferring files' },
    CARD: { name: 'Memory card', short: 'Memory card', desc: 'Small, portable storage used in devices like cameras' },
  };
  const STORAGE_DEF = 'Storage means saving files and data so they can be used later.';
  const COMPARE = [
    { q: 'Which is generally FASTER?', a: 'SSD', why: 'Key point from the poster: SSDs are generally faster than HDDs.', wrongHdd: 'HDDs are slower — they use moving parts.' },
    { q: 'Which one uses MOVING PARTS?', a: 'HDD', why: 'An HDD (Hard Disk Drive) uses moving parts, which is why it is slower.', wrongSsd: 'An SSD has no moving parts — that is part of why it is faster.' },
    { q: 'Which is usually CHEAPER for lots of space?', a: 'HDD', why: 'An HDD gives large capacity and is cheaper. An SSD is usually more expensive.', wrongSsd: 'SSDs are usually MORE expensive.' },
    { q: 'Which is MORE RELIABLE?', a: 'SSD', why: 'The poster says an SSD is faster and more reliable.', wrongHdd: 'An HDD has moving parts, and the poster calls the SSD the more reliable one.' },
  ];
  function compareStep(key, isAnswer, kind) {
    const c = pick(COMPARE);
    return pk({ key, concept: 'storage-dev', kind, isAnswer, keepAll: true, noGloss: kind !== 'learn',
      prompt: `HDD or SSD? ${c.q}`, answer: c.a,
      wrong: [[c.a === 'SSD' ? 'HDD' : 'SSD', c.wrongHdd || c.wrongSsd],
        ['They are exactly the same', `They are not the same. ${c.why}`]],
      hint: c.why, why: `HDD: ${DEV.HDD.desc}. SSD: ${DEV.SSD.desc}.`, result: c.a });
  }
  function storageWhy(key, kind) {
    return pk({ key, concept: 'storage-why', kind, noGloss: true,
      prompt: kind === 'learn' ? 'What is computer storage for?' : 'Why does a computer need storage at all?',
      answer: 'Saving files and data so they can be used later',
      wrong: [['Showing pictures on the screen', "That is the monitor's job. Storage keeps files saved for later."],
        ['Telling the computer what to do', 'That describes software — programs and instructions.'],
        ['Typing words in', 'That is what a keyboard does. Storage is where the words are SAVED.'],
        ['Connecting to the internet', 'Storage does not connect you to anything — it keeps files saved so you can use them later.']],
      hint: STORAGE_DEF, why: `${STORAGE_DEF} Storage devices save files like videos, photos, documents and games.`,
      result: 'Storage saves files to use later' });
  }
  function stLearn() {
    const k = pick(Object.keys(DEV)), d = DEV[k];
    return prob(2, `sl:${k}`, `Computer storage: the ${d.short}`, [
      storageWhy('why', 'learn'),
      pk({ key: 'what', concept: 'storage-why', kind: 'learn', keepAll: true,
        prompt: 'Which of these do storage devices save?', answer: 'Videos, photos, documents and games',
        wrong: [['Keyboards and mice', 'Keyboards and mice are hardware you plug in. Storage devices save FILES.'],
          ['Nothing: files vanish when you switch off', 'That is exactly what storage stops! A saved file is still there tomorrow.']],
        hint: 'Think of every kind of file you save.', why: 'Key point from the poster: storage devices save files (e.g. videos, photos, documents and games).',
        result: 'Videos, photos, documents, games' }),
      pk({ key: 'desc', concept: 'storage-dev', kind: 'learn', keepAll: true,
        prompt: `Which description matches the ${d.name}?`, answer: d.desc,
        wrong: Object.keys(DEV).filter((x) => x !== k).map((x) => [DEV[x].desc, `That describes the ${DEV[x].name}.`]),
        hint: `${d.short}: ${d.desc.toLowerCase()}.`,
        why: Object.keys(DEV).map((x) => `${DEV[x].short}: ${DEV[x].desc.toLowerCase()}.`).join(' '),
        result: `${d.short}: ${d.desc.toLowerCase()}` }),
      compareStep('cmp', true, 'learn'),
    ]);
  }
  function stCompare() {
    if (Math.random() < 0.5) {
      const tgt = pick(['HDD', 'SSD']), other = tgt === 'HDD' ? 'SSD' : 'HDD';
      const F = { HDD: ['Large capacity', 'Cheaper', 'Slower', 'Uses moving parts'], SSD: ['Faster', 'More reliable', 'Usually more expensive'] };
      // "Large capacity" is the poster's HDD point; it says nothing either way about
      // SSDs, so it is never offered as a WRONG answer for an SSD.
      const mine = sample(F[tgt], rand(2, 3)), theirs = sample(F[other].filter((f) => f !== 'Large capacity'), 2);
      const items = shuffle([...mine.map((f) => [f, true, `that is true for an ${tgt}.`]),
        ...theirs.map((f) => [f, false, `that is true for an ${other}, not an ${tgt}.`])]);
      return prob(2, `sc:${tgt}:${items.map((i) => i[0]).join('|')}`, `HDD vs SSD: the ${tgt}`, [
        ch({ key: 'facts', concept: 'storage-dev', kind: 'sort', items, noGloss: true,
          prompt: `Tap EVERY fact that is true for an ${tgt}.`,
          hint: `${DEV[tgt].short}: ${DEV[tgt].desc.toLowerCase()}.`,
          why: `HDD: ${DEV.HDD.desc}. SSD: ${DEV.SSD.desc}.`, result: `${tgt}: ${mine.join(', ').toLowerCase()}` }),
        tgt === 'SSD'
          ? pk({ key: 'use', concept: 'storage-dev', kind: 'sort', isAnswer: true, keepAll: true, noGloss: true,
            prompt: 'A footballer wants her laptop to load match videos as fast as possible. Which drive?', answer: 'SSD',
            wrong: [['HDD', 'An HDD is slower because it uses moving parts.'], ['Memory card', 'A memory card is small storage for devices like cameras, not the fastest laptop drive.']],
            hint: 'SSDs are generally faster than HDDs.', why: DEV.SSD.desc + '.', result: 'SSD — faster' })
          : pk({ key: 'use', concept: 'storage-dev', kind: 'sort', isAnswer: true, keepAll: true, noGloss: true,
            prompt: 'A club wants LOTS of space for old match videos at the lowest price. Which drive?', answer: 'HDD',
            wrong: [['SSD', 'An SSD is faster, but usually more expensive. For lots of space cheaply, an HDD wins.'], ['Memory card', 'A memory card is small storage for cameras — not lots of space cheaply.']],
            hint: 'Large capacity, cheaper.', why: DEV.HDD.desc + '.', result: 'HDD — large capacity, cheaper' }),
      ]);
    }
    const k = pick(Object.keys(DEV)), d = DEV[k];
    return prob(2, `sd:${k}`, `Which storage device is this? "${d.desc}"`, [
      pk({ key: 'which', concept: 'storage-dev', kind: 'pick', keepAll: true, noGloss: true,
        prompt: `"${d.desc}." Which storage device is that?`, answer: d.short,
        wrong: Object.keys(DEV).filter((x) => x !== k).map((x) => [DEV[x].short, `The ${DEV[x].name}: ${DEV[x].desc.toLowerCase()}.`]),
        hint: `That is the ${d.name}.`, why: Object.keys(DEV).map((x) => `${DEV[x].short}: ${DEV[x].desc.toLowerCase()}.`).join(' '),
        result: d.short }),
      compareStep('cmp', true, 'pick'),
    ]);
  }
  const JOBS = [
    { text: 'The coach films every goal on an action camera at the pitch and needs storage that goes INSIDE the camera.', dev: 'CARD',
      reason: 'Small and portable — made for devices like cameras',
      w: { USB: 'A USB flash drive is portable, but it is for moving files between computers — cameras use memory cards.', HDD: 'An HDD is far too big to go inside a camera.', SSD: 'An SSD is a fast drive for a computer, not storage that slots into a camera.' } },
    { text: 'A student needs to carry homework files from the school computer to the home computer.', dev: 'USB',
      reason: 'Portable and easy to use for transferring files',
      w: { CARD: 'A memory card is small and portable, but it is made for devices like cameras. A USB flash drive plugs into any computer to transfer files.', HDD: 'An HDD stays inside a computer — it is not the easy way to carry files.', SSD: 'An SSD is the fast drive inside a computer, not the easy way to carry files.' } },
    { text: 'The club wants to keep ten years of match videos on the office computer: lots of space, lowest price.', dev: 'HDD',
      reason: 'Large capacity and cheaper',
      w: { SSD: 'An SSD is faster, but usually more expensive. For lots of space cheaply, choose an HDD.', USB: 'A USB flash drive is for carrying files, not for keeping ten years of videos cheaply.', CARD: 'A memory card is small storage for cameras, not for ten years of videos.' } },
    { text: 'A gamer wants a laptop that starts up and loads games as fast as possible, even if it costs more.', dev: 'SSD',
      reason: 'Faster and more reliable',
      w: { HDD: 'An HDD is cheaper, but slower because it uses moving parts.', USB: 'A USB flash drive is for transferring files, not for making the laptop fast.', CARD: 'A memory card is for devices like cameras, not for a fast laptop.' } },
    { text: "The club's video analyst wants the most reliable, fastest drive in her laptop, and the budget is fine.", dev: 'SSD',
      reason: 'Faster and more reliable',
      w: { HDD: 'An HDD is cheaper but slower, and the poster calls the SSD more reliable.', USB: 'A USB flash drive is for carrying files between computers.', CARD: 'A memory card is for devices like cameras.' } },
    { text: 'A family wants a cheap way to store thousands of holiday photos on their desktop computer.', dev: 'HDD',
      reason: 'Large capacity and cheaper',
      w: { SSD: 'An SSD would work, but it is usually more expensive. Cheap and lots of space = HDD.', USB: 'A USB flash drive is for moving files around, not the cheapest place for thousands of photos.', CARD: 'A memory card is for cameras, not the main store on a desktop.' } },
    { text: "A teacher wants to hand a presentation file to another teacher to use on a different computer.", dev: 'USB',
      reason: 'Portable and easy to use for transferring files',
      w: { CARD: 'A memory card is portable, but it is made for devices like cameras.', HDD: 'An HDD is inside a computer — not the easy way to pass a file on.', SSD: 'An SSD is inside a computer — not the easy way to pass a file on.' } },
  ];
  function stReal() {
    const j = pick(JOBS), d = DEV[j.dev];
    const reasons = { CARD: 'Small and portable — made for devices like cameras', USB: 'Portable and easy to use for transferring files', HDD: 'Large capacity and cheaper', SSD: 'Faster and more reliable' };
    return prob(2, `sr:${JOBS.indexOf(j)}`, j.text, [
      storageWhy('why', 'scenario'),
      pk({ key: 'dev', concept: 'storage-dev', kind: 'scenario', keepAll: true, noGloss: true,
        prompt: 'Which storage device is best for this job?', answer: d.short,
        wrong: Object.keys(j.w).map((x) => [DEV[x].short, j.w[x]]),
        hint: `${d.short}: ${d.desc.toLowerCase()}.`, why: `${d.name}: ${d.desc.toLowerCase()}.`, result: d.short }),
      pk({ key: 'reason', concept: 'storage-dev', kind: 'justify', isAnswer: true, keepAll: true, noGloss: true,
        prompt: `Justify it. Which reason explains choosing the ${d.short}?`, answer: j.reason,
        wrong: Object.keys(reasons).filter((x) => x !== j.dev).map((x) => [reasons[x], `That is the reason for a ${DEV[x].short}, not a ${d.short}.`]),
        hint: `${d.short}: ${d.desc.toLowerCase()}.`,
        why: 'In the test, "justify" means give the feature that matches the job. ' + Object.keys(DEV).map((x) => `${DEV[x].short}: ${DEV[x].desc.toLowerCase()}.`).join(' '),
        longWay: `Job: ${j.text}\nBest device: ${d.short}\nBecause: ${j.reason.toLowerCase()}`,
        result: `${d.short} — ${j.reason.toLowerCase()}` }),
    ]);
  }

  // ======================================================== 3 · STORAGE UNITS
  const U = ['Byte', 'KB', 'MB', 'GB', 'TB'];
  const UNAME = ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte'];
  const unitPlural = (i) => (i === 0 ? 'bytes' : U[i]);
  const LADDER = 'Byte → KB → MB → GB → TB\n1 KB = 1,000 bytes\n1 MB = 1,000 KB\n1 GB = 1,000 MB\n1 TB = 1,000 GB';
  function orderCheck(asc) {
    const want = asc ? U.join(' ') : U.slice().reverse().join(' ');
    return (raw) => {
      const got = String(raw).trim().split(/\s+/).map((t) => t.toUpperCase() === 'BYTE' ? 'Byte' : t.toUpperCase()).join(' ');
      return got === want ? { correct: true }
        : { correct: false, id: 'cs-units-order', ctx: { msg: `${asc ? 'Smallest to largest' : 'Largest to smallest'} is ${want.split(' ').join(', ')}. Each unit is 1,000 of the one ${asc ? 'before' : 'after'} it.` } };
    };
  }
  function orderStep(key, asc, isAnswer, kind) {
    const want = asc ? U.slice() : U.slice().reverse();
    let pieces = shuffle(U);
    if (pieces.join(' ') === want.join(' ')) pieces = pieces.slice().reverse();
    return bd({ key, concept: 'units-order', kind, isAnswer,
      prompt: `Build the ladder: put the units in order from ${asc ? 'SMALLEST to largest' : 'LARGEST to smallest'}.`,
      pieces, solution: want.join(' '), check: orderCheck(asc),
      hint: `Byte is the smallest, TB the largest. ${asc ? 'Start with Byte.' : 'Start with TB.'}`,
      why: 'Units measure the amount of data that can be stored. Byte (smallest), then Kilobyte, Megabyte, Gigabyte, Terabyte (largest) — each one is 1,000 of the one before.',
      longWay: LADDER, result: want.join(' → ') });
  }
  function jumpStep(key, i, kind) {
    const lo = i - 1;
    return pk({ key, concept: 'units-convert', kind, keepAll: true,
      prompt: `1 ${U[i]} = how many ${unitPlural(lo)}?`, answer: '1,000',
      wrong: [['100', 'Storage units go up in thousands, not hundreds.'], ['10', 'Storage units go up in thousands, not tens.'],
        ['1,000,000', `1,000,000 would be TWO jumps up the ladder. ${U[i]} to ${unitPlural(lo)} is one jump, so it is 1,000.`]],
      hint: `1 ${U[i]} = 1,000 ${unitPlural(lo)}.`, why: 'On the poster every unit is 1,000 of the one below it.', longWay: LADDER,
      result: `1 ${U[i]} = 1,000 ${unitPlural(lo)}` });
  }
  function unLearn() {
    const i = rand(1, 4);
    return prob(3, `ul:${i}`, 'Storage units: Byte to TB', [
      pk({ key: 'what', concept: 'units-order', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'Storage units like MB and GB measure…', answer: 'The amount of data that can be stored',
        wrong: [['How fast a computer is', 'Speed is not measured in MB or GB. These units measure how much data can be stored.'],
          ['How heavy a device is', 'Weight is in grams, not GB. These units measure how much data can be stored.'],
          ['How big the screen is', 'Screens are measured in inches. These units measure how much data can be stored.']],
        hint: 'Think: how much can it hold?', why: 'From the poster: units measure the amount of data that can be stored.', result: 'Units measure how much data is stored' }),
      pk({ key: 'small', concept: 'units-order', kind: 'learn', keepAll: true,
        prompt: 'Which is the SMALLEST unit?', answer: 'Byte',
        wrong: [['KB', 'A kilobyte is 1,000 bytes, so it is bigger than a byte.'], ['TB', 'TB is the LARGEST unit, not the smallest.'], ['MB', 'A megabyte is 1,000 KB — much bigger than a byte.']],
        hint: 'The poster starts its ladder with it.', why: 'Byte (B) is the smallest unit on the poster.', longWay: LADDER, result: 'Byte is the smallest' }),
      jumpStep('jump', i, 'learn'),
      orderStep('order', true, true, 'order'),
    ]);
  }
  function unOrder() {
    if (Math.random() < 0.45) {
      const asc = Math.random() < 0.6, i = rand(0, 3);
      return prob(3, `uo:${asc}:${i}`, `Order the units, ${asc ? 'smallest' : 'largest'} first`, [
        pk({ key: 'next', concept: 'units-order', kind: 'order', keepAll: true,
          prompt: `Going UP the ladder, which unit comes straight after ${U[i]}?`, answer: U[i + 1],
          wrong: U.filter((u, k) => k !== i + 1 && k !== i).map((u) => [u, U.indexOf(u) < i ? `${u} is smaller than ${U[i]} — that is going down, not up.` : `${u} is further up — you skipped ${U[i + 1]}.`]),
          hint: `${U[i]} → ${U[i + 1]}.`, why: 'Byte → KB → MB → GB → TB, each 1,000 times the one before.', longWay: LADDER, result: `${U[i]} → ${U[i + 1]}` }),
        orderStep('order', asc, true, 'order'),
      ]);
    }
    const i = rand(1, 4), a = rand(2, 9), b = a * 1000 + pick([-500, -250, 250, 500]);
    const bigger = a * 1000 > b ? `${a} ${U[i]}` : `${fmt(b)} ${U[i - 1]}`;
    const smaller = a * 1000 > b ? `${fmt(b)} ${U[i - 1]}` : `${a} ${U[i]}`;
    return prob(3, `uc:${a}${U[i]}:${b}`, `Which is MORE: ${a} ${U[i]} or ${fmt(b)} ${U[i - 1]}?`, [
      pkNum({ key: 'conv', concept: 'units-convert', kind: 'compare',
        prompt: `First make the units match. ${a} ${U[i]} = how many ${U[i - 1]}?`, answer: a * 1000,
        wrongNums: [a * 100, a * 10, a * 1000000], whyWrong: () => `1 ${U[i]} = 1,000 ${U[i - 1]}, so ${a} ${U[i]} = ${a} × 1,000 = ${fmt(a * 1000)} ${U[i - 1]}.`,
        hint: `${a} × 1,000 = ${fmt(a * 1000)}.`, why: 'You can only compare amounts in the same unit. Going down one unit means × 1,000.', result: `${a} ${U[i]} = ${fmt(a * 1000)} ${U[i - 1]}` }),
      pk({ key: 'cmp', concept: 'units-order', kind: 'compare', isAnswer: true, keepAll: true,
        prompt: `So which is MORE storage: ${a} ${U[i]} or ${fmt(b)} ${U[i - 1]}?`, answer: bigger,
        wrong: [[smaller, `Compare in the same unit: ${fmt(a * 1000)} ${U[i - 1]} and ${fmt(b)} ${U[i - 1]}. ${bigger} is more.`],
          ['They are the same', `${fmt(a * 1000)} ${U[i - 1]} and ${fmt(b)} ${U[i - 1]} are not the same.`]],
        hint: `${fmt(a * 1000)} vs ${fmt(b)} — both in ${U[i - 1]}.`, why: 'A bigger NUMBER does not mean more storage if the units are different. Convert first, then compare.',
        longWay: `${a} ${U[i]} = ${fmt(a * 1000)} ${U[i - 1]}\n${fmt(a * 1000)} ${a * 1000 > b ? '>' : '<'} ${fmt(b)}\nSo ${bigger} is more`, result: `${bigger} is more` }),
    ], { data: { kind: 'compare', a, unit: U[i], b, small: U[i - 1], bigger } });
  }
  function unReal() {
    const r = Math.random();
    if (r < 0.35) {
      const n = rand(2, 9), i = pick([3, 4]);
      const m1 = n * 1000, m2 = n * 1000000;
      return prob(3, `ur:${n}${U[i]}`, `Convert ${n} ${U[i]} into ${U[i - 2]}`, [
        pkNum({ key: 'one', concept: 'units-convert', kind: 'convert',
          prompt: `Step 1, one jump down: ${n} ${U[i]} = how many ${U[i - 1]}?`, answer: m1,
          wrongNums: [n * 100, n * 10, m2], whyWrong: () => `One jump down is × 1,000: ${n} × 1,000 = ${fmt(m1)}.`,
          hint: `${n} × 1,000 = ${fmt(m1)}.`, why: `1 ${U[i]} = 1,000 ${U[i - 1]}.`, result: `${n} ${U[i]} = ${fmt(m1)} ${U[i - 1]}` }),
        pkNum({ key: 'two', concept: 'units-convert', kind: 'convert', isAnswer: true,
          prompt: `Step 2, one more jump: ${fmt(m1)} ${U[i - 1]} = how many ${U[i - 2]}?`, answer: m2,
          wrongNums: [m1, m1 * 100, n * 10000], whyWrong: () => `Another jump down is × 1,000 again: ${fmt(m1)} × 1,000 = ${fmt(m2)}.`,
          hint: `${fmt(m1)} × 1,000 = ${fmt(m2)}.`, why: `1 ${U[i - 1]} = 1,000 ${U[i - 2]}. Two jumps down the ladder means × 1,000 twice.`,
          longWay: `${n} ${U[i]}\n= ${n} × 1,000 = ${fmt(m1)} ${U[i - 1]}\n= ${fmt(m1)} × 1,000 = ${fmt(m2)} ${U[i - 2]}`, result: `${n} ${U[i]} = ${fmt(m2)} ${U[i - 2]}` }),
      ], { data: { kind: 'convert', n, from: U[i], to: U[i - 2], answer: m2 } });
    }
    if (r < 0.7) {
      const c = pick([1, 2, 4, 8, 16]), v = pick([100, 200, 250, 500]);
      const mb = c * 1000, k = mb / v;
      return prob(3, `uf:${c}:${v}`, `Goal clips: each clip is ${v} MB. How many fit on a ${c} GB memory card?`, [
        pkNum({ key: 'mb', concept: 'units-convert', kind: 'convert',
          prompt: `Make the units match. ${c} GB = how many MB?`, answer: mb,
          wrongNums: [c * 100, c * 10, c * 1000000], whyWrong: () => `1 GB = 1,000 MB, so ${c} GB = ${c} × 1,000 = ${fmt(mb)} MB.`,
          hint: `${c} × 1,000 = ${fmt(mb)}.`, why: 'The clips are in MB and the card is in GB. Change the card to MB first, so both are in the same unit.', result: `${c} GB = ${fmt(mb)} MB` }),
        pkNum({ key: 'fit', concept: 'units-convert', kind: 'convert', isAnswer: true,
          prompt: `How many ${v} MB clips fit in ${fmt(mb)} MB? ${fmt(mb)} ÷ ${v} = ?`, answer: k,
          wrongNums: [k * 10, k + 1, k - 1, k * 2, c * v], whyWrong: (x) => `${fmt(x)} clips × ${v} MB = ${fmt(x * v)} MB, but the card holds ${fmt(mb)} MB.`,
          hint: `${fmt(mb)} ÷ ${v} = ${fmt(k)}.`, why: `Each clip takes ${v} MB, so divide the space by the size of one clip. Check: ${fmt(k)} × ${v} = ${fmt(mb)}.`,
          longWay: `${c} GB = ${fmt(mb)} MB\n${fmt(mb)} ÷ ${v} = ${fmt(k)} clips\ncheck: ${fmt(k)} × ${v} = ${fmt(mb)} MB`, result: `${fmt(k)} clips` }),
      ], { data: { kind: 'fit', gb: c, clip: v, answer: k } });
    }
    let a, sa, b, sb, total, G;
    do {
      a = rand(2, 4); sa = pick([200, 300, 400, 500]); b = rand(1, 3); sb = pick([100, 250, 600, 700]);
      total = a * sa + b * sb; G = pick([1, 2, 3]);
    } while (total === G * 1000 || Math.abs(total - G * 1000) > 1500);
    const fits = total < G * 1000;
    return prob(3, `uw:${a}x${sa}+${b}x${sb}/${G}`,
      `A player saves ${a} goal clips of ${sa} MB and ${b} interview clips of ${sb} MB. The USB flash drive has ${G} GB free. Will they all fit?`, [
        pkNum({ key: 'a', concept: 'units-convert', kind: 'convert', prompt: `Goal clips: ${a} × ${sa} MB = ?`, answer: a * sa,
          wrongNums: [a * sa + sa, a * sa - sa, a + sa], whyWrong: () => `${a} lots of ${sa}: ${a} × ${sa} = ${fmt(a * sa)} MB.`,
          hint: `${a} × ${sa} = ${fmt(a * sa)}.`, why: 'Work out each kind of clip, then add.', result: `${fmt(a * sa)} MB` }),
        pkNum({ key: 'b', concept: 'units-convert', kind: 'convert', prompt: `Interview clips: ${b} × ${sb} MB = ?`, answer: b * sb,
          wrongNums: [b * sb + sb, b * sb + 100, b + sb], whyWrong: () => `${b} lots of ${sb}: ${b} × ${sb} = ${fmt(b * sb)} MB.`,
          hint: `${b} × ${sb} = ${fmt(b * sb)}.`, why: 'Same again for the second kind of clip.', result: `${fmt(b * sb)} MB` }),
        pkNum({ key: 'tot', concept: 'units-convert', kind: 'convert', prompt: `Total: ${fmt(a * sa)} + ${fmt(b * sb)} = ? MB`, answer: total,
          wrongNums: [total + 100, total - 100, total + 1000], whyWrong: () => `${fmt(a * sa)} + ${fmt(b * sb)} = ${fmt(total)} MB.`,
          hint: `${fmt(a * sa)} + ${fmt(b * sb)} = ${fmt(total)}.`, why: 'Add the two amounts to get everything that needs saving.', result: `${fmt(total)} MB in total` }),
        pkNum({ key: 'free', concept: 'units-convert', kind: 'convert', prompt: `Space on the USB: ${G} GB = how many MB?`, answer: G * 1000,
          wrongNums: [G * 100, G * 10, G * 1000000], whyWrong: () => `1 GB = 1,000 MB, so ${G} GB = ${fmt(G * 1000)} MB.`,
          hint: `${G} × 1,000 = ${fmt(G * 1000)}.`, why: 'The clips are in MB, so change the free space into MB to compare.', result: `${G} GB = ${fmt(G * 1000)} MB` }),
        pk({ key: 'fits', concept: 'units-order', kind: 'compare', isAnswer: true, keepAll: true,
          prompt: `${fmt(total)} MB to save, ${fmt(G * 1000)} MB free. Do they all fit?`, answer: fits ? 'Yes, they fit' : 'No, they do not fit',
          wrong: [[fits ? 'No, they do not fit' : 'Yes, they fit', `${fmt(total)} MB is ${fits ? 'LESS' : 'MORE'} than ${fmt(G * 1000)} MB.`],
            ['You cannot tell, the units are different', `You can — that is why we changed ${G} GB into ${fmt(G * 1000)} MB.`]],
          hint: `${fmt(total)} ${fits ? '<' : '>'} ${fmt(G * 1000)}.`, why: 'Once both amounts are in MB you can compare them directly.',
          longWay: `${a} × ${sa} = ${fmt(a * sa)} MB\n${b} × ${sb} = ${fmt(b * sb)} MB\ntotal = ${fmt(total)} MB\n${G} GB = ${fmt(G * 1000)} MB\n${fmt(total)} ${fits ? '<' : '>'} ${fmt(G * 1000)} → ${fits ? 'they fit' : 'they do not fit'}`,
          result: fits ? 'Yes, they fit' : 'No, they do not fit' }),
      ], { data: { kind: 'willfit', a, sa, b, sb, gb: G, fits } });
  }

  // ======================================================== 4 · DATA AND INFORMATION
  const DATA_EX = ['45, 67, 89, 92', 'Red, Blue, Green, Yellow', '3, 1, 0, 2, 4', '12, 15, 9, 20', 'Monday, Wednesday, Friday', '1.75, 1.62, 1.80', 'Yes, No, Yes, Yes', '25, 30, 28'];
  const INFO_EX = ['Ahmed scored 92% in Computing.', 'The highest score was 92%.', 'Our team scored 3 goals in the second half.',
    'Most of the class chose Blue as their favourite colour.', 'Training is on Monday, Wednesday and Friday this week.',
    'The tallest player in the squad is 1.80 m.', 'Three in every four students voted yes to a new pitch.', 'The temperature at kick-off was 28 °C.'];
  const DATA_DEF = 'Data is raw facts and figures without context.';
  const INFO_DEF = 'Information is data that has been processed or given meaning.';
  const KEY_INFO = 'Information is more useful because it provides meaning and can support decisions.';
  function diLearn() {
    const d = pick(DATA_EX);
    return prob(4, `dl:${d}`, 'Data and information', [
      pk({ key: 'def', concept: 'data-info', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'What is DATA?', answer: 'Raw facts and figures without context',
        wrong: [['Data that has been processed or given meaning', 'That is INFORMATION.'], ['The physical parts of a computer', 'That is hardware.'], ['Programs that tell a computer what to do', 'That is software.']],
        hint: DATA_DEF, why: `${DATA_DEF} ${INFO_DEF}`, result: 'Data = raw facts without context' }),
      pk({ key: 'spot', concept: 'data-info', kind: 'learn', keepAll: true,
        prompt: `Look at this: ${d}. Is it data or information?`, answer: 'Data',
        wrong: [['Information', `There is no context — we do not know what "${d}" is about. Raw facts without context are data.`], ['Software', 'Software is a program. This is a list of raw facts: data.']],
        hint: 'Does it say what the facts are about?', why: `${DATA_DEF} The poster's examples are "45, 67, 89, 92" and "Red, Blue, Green, Yellow".`, result: `${d} = data` }),
      pk({ key: 'turn', concept: 'info-use', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'What turns data into information?', answer: 'Processing it or giving it meaning',
        wrong: [['Saving it on an SSD', 'Saving keeps data safe, but it is still raw data until it has meaning.'], ['Typing it in a bigger font', 'A bigger font does not add meaning.'], ['Adding more numbers to the list', 'More raw numbers are still just data.']],
        hint: INFO_DEF, why: `${INFO_DEF} "Ahmed scored 92% in Computing" gives the number 92 a meaning.`, result: 'Process it / give it meaning' }),
      pk({ key: 'why', concept: 'info-use', kind: 'learn', isAnswer: true, keepAll: true,
        prompt: 'Why is information more useful than data?', answer: 'It provides meaning and can support decisions',
        wrong: [['It always has more numbers in it', '"The highest score was 92%" has fewer numbers than "45, 67, 89, 92" — but it means more.'],
          ['It takes up less storage', 'Storage size is not the point. Information is useful because it has meaning.'], ['It can only be written on paper', 'Information can be on paper or on a computer.']],
        hint: KEY_INFO, why: `Key point from the poster: ${KEY_INFO}`,
        longWay: `Data: ${d}  (no context)\nInformation: data given meaning, e.g. "The highest score was 92%."\nInformation is more useful: it supports decisions.`, result: 'Meaning + supports decisions' }),
    ]);
  }
  function diSort() {
    if (Math.random() < 0.5) {
      const nI = rand(2, 3), info = sample(INFO_EX, nI), data = sample(DATA_EX, 5 - nI);
      const items = shuffle([...info.map((x) => [x, true, 'it has meaning, so it is information.']),
        ...data.map((x) => [x, false, 'it is raw facts with no context, so it is data.'])]);
      const extra = pick(DATA_EX.filter((x) => !data.includes(x)));
      return prob(4, `ds:${items.map((i) => i[0]).join('|')}`, 'Data or information?', [
        ch({ key: 'info', concept: 'data-info', kind: 'sort', items, noGloss: true,
          prompt: 'Tap EVERY example of INFORMATION.', hint: 'Information tells you what the facts MEAN.',
          why: `${DATA_DEF} ${INFO_DEF}`, result: `Information: ${info.join(' / ')}` }),
        pk({ key: 'data', concept: 'data-info', kind: 'pick', isAnswer: true, noGloss: true,
          prompt: 'Which of these is DATA?', answer: extra,
          wrong: sample(INFO_EX.filter((x) => !info.includes(x)), 3).map((x) => [x, 'That sentence gives the facts meaning, so it is information.']),
          hint: 'Look for raw facts with no context.', why: DATA_DEF, result: `${extra} = data` }),
      ]);
    }
    const vals = sample([45, 52, 58, 61, 67, 73, 78, 84, 89, 92, 95], 4);
    const mx = Math.max(...vals), second = vals.slice().sort((x, y) => y - x)[1];
    const list = vals.join(', ');
    return prob(4, `dt:${list}`, `A teacher writes down: ${list}`, [
      pk({ key: 'is', concept: 'data-info', kind: 'pick', keepAll: true, noGloss: true,
        prompt: `On its own, is "${list}" data or information?`, answer: 'Data',
        wrong: [['Information', 'There is no context: we are not told what the numbers are. Raw figures = data.'], ['Hardware', 'Hardware is something you can touch. These are raw figures: data.']],
        hint: 'Do we know what the numbers are?', why: DATA_DEF, result: 'Data (no context yet)' }),
      pk({ key: 'turn', concept: 'info-use', kind: 'pick', isAnswer: true, keepAll: true, noGloss: true,
        prompt: 'They are test scores out of 100. Which sentence turns them into CORRECT information?', answer: `The highest test score was ${mx}.`,
        wrong: [[`The highest test score was ${second}.`, `That is information, but it is wrong: ${mx} is bigger than ${second}. Processing must be done carefully.`],
          [vals.slice().sort((x, y) => x - y).join(', '), 'Sorting the numbers does not give them meaning on its own — it is still a list of raw figures.'],
          ['Scores, numbers, test', 'Words with no facts attached do not tell us anything — that is not information.']],
        hint: `The biggest number in the list is ${mx}.`, why: `${INFO_DEF} Like the poster's "The highest score was 92%".`,
        longWay: `Data: ${list}\nProcess it: the biggest is ${mx}\nInformation: "The highest test score was ${mx}."`, result: `"The highest test score was ${mx}."` }),
    ], { data: { kind: 'max', values: vals, answer: mx } });
  }
  function diReal() {
    const n = 5;
    let g;
    do { g = Array.from({ length: n }, () => rand(0, 5)); } while (g.filter((x) => x === Math.max(...g)).length > 1);
    const mx = Math.max(...g), total = g.reduce((s, x) => s + x, 0);
    const useTotal = Math.random() < 0.5;
    const ans = useTotal ? total : mx;
    const list = g.join(', ');
    return prob(4, `dr:${list}:${useTotal}`, `The coach's notebook says: ${list}. They are our goals in the last 5 matches.`, [
      pk({ key: 'raw', concept: 'data-info', kind: 'scenario', keepAll: true, noGloss: true,
        prompt: `The list "${list}" written on its own, with no heading. Data or information?`, answer: 'Data',
        wrong: [['Information', 'On its own there is no context — nobody reading it knows they are goals. That makes it data.'],
          ['Software', 'Software is a program. This is a list of raw facts: data.']],
        hint: 'Without the heading, what do the numbers mean?', why: DATA_DEF, result: `${list} = data` }),
      pkNum({ key: 'proc', concept: 'data-info', kind: 'scenario',
        prompt: useTotal ? `Process it. How many goals in total? ${g.join(' + ')} = ?` : 'Process it. What is the MOST goals scored in one match?',
        answer: ans, wrongNums: useTotal ? [total + 1, total - 1, mx, total + 2] : [mx - 1, total, Math.min(...g), mx + 1],
        whyWrong: () => (useTotal ? `Add them all: ${g.join(' + ')} = ${total}.` : `Look for the biggest number in ${list}: it is ${mx}.`),
        hint: useTotal ? `${g.join(' + ')} = ${total}.` : `The biggest number is ${mx}.`, why: 'Processing means doing something with the data — adding it up, finding the biggest — so it starts to mean something.',
        result: useTotal ? `${total} goals in total` : `${mx} goals in one match` }),
      pk({ key: 'info', concept: 'data-info', kind: 'scenario', keepAll: true, noGloss: true,
        prompt: 'Which sentence is INFORMATION made from this data?',
        answer: useTotal ? `We scored ${total} goals in our last 5 matches.` : `Our most goals in one match was ${mx}.`,
        wrong: [[list, 'That is the same raw list — still data.'],
          [useTotal ? `We scored ${total + 2} goals in our last 5 matches.` : `Our most goals in one match was ${mx - 1}.`, 'That is information, but the number is wrong — check your working.'],
          ['Goals', 'One word on its own is not information.']],
        hint: 'Information = the data with meaning, and the right number.', why: INFO_DEF,
        result: useTotal ? `"We scored ${total} goals in our last 5 matches."` : `"Our most goals in one match was ${mx}."` }),
      pk({ key: 'use', concept: 'info-use', kind: 'scenario', isAnswer: true, keepAll: true, noGloss: true,
        prompt: 'Why is that sentence more useful to the coach than the list?', answer: 'It has meaning, so it helps her make decisions',
        wrong: [['It has more numbers in it', 'It has FEWER numbers. It is more useful because it has meaning.'],
          ['It is shorter to type', 'Being short is not the reason. Information is useful because it supports decisions.'],
          ['Lists can never be stored on a computer', 'Lists can be stored on a computer. The point is meaning.']],
        hint: KEY_INFO, why: `${KEY_INFO} E.g. she can decide whether the attack needs more practice.`,
        longWay: `Data: ${list}\nProcessed: ${useTotal ? `total = ${total}` : `most = ${mx}`}\nInformation: ${useTotal ? `"We scored ${total} goals in our last 5 matches."` : `"Our most goals in one match was ${mx}."`}\nUseful because it supports decisions.`,
        result: 'Information supports decisions' }),
    ], { data: { kind: useTotal ? 'sum' : 'max', values: g, answer: ans } });
  }

  // ======================================================== 5 · SPREADSHEETS
  const SHEET_DEF = 'A spreadsheet is used to organise, store and analyse data.';
  const CELL_DEF = 'A cell is the box where a row and a column meet (e.g. B2). Columns are identified by letters (A, B, C); rows by numbers (1, 2, 3).';
  const ADV = ['Easy to edit and update data', 'Sort and analyse results', 'Automatically calculates totals and averages'];
  const NOT_ADV = [['It never needs a computer', 'A spreadsheet is software — it needs a computer!'],
    ['You never need to check the data', 'You should always check data for errors, even in a spreadsheet.'],
    ['It types the data in for you', 'Someone still has to type the data in.'],
    ['It cannot be changed once typed', 'The opposite — a spreadsheet is EASY to edit and update.']];
  function statsGrid() {
    const names = sample(NAMES, 4);
    const goals = sample([0, 1, 2, 3, 4, 5, 6, 7], 4), assists = sample([8, 9, 10, 11, 12, 13, 14, 15], 4);
    const rows = [['Player', 'Goals', 'Assists'], ...names.map((nm, i) => [nm, String(goals[i]), String(assists[i])])];
    return { rows, names, goals, assists };
  }
  const refOf = (j, i) => `${L(j)}${i + 1}`;
  function cellWrongs(rows, j, i) {
    const out = [[`${i + 1}${L(j)}`, `Column letter first, then row number — like B2, not 2B.`]];
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dj, di]) => {
      const jj = j + dj, ii = i + di;
      if (rows[ii] && rows[ii][jj] != null && jj >= 0) out.push([refOf(jj, ii), `${refOf(jj, ii)} holds "${rows[ii][jj]}".`]);
    });
    return out;
  }
  function shLearn() {
    const col = rand(0, 3), row = rand(0, 4);
    const rows = Array.from({ length: 5 }, () => ['', '', '', '']);
    const rowsQ = Math.random() < 0.5;
    return prob(5, `pl:${col}:${row}:${rowsQ}`, 'Spreadsheets: cells, rows and columns', [
      pk({ key: 'what', concept: 'sheet-why', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'A spreadsheet is used to…', answer: 'Organise, store and analyse data',
        wrong: [['Manage the hardware and support other programs', 'That is system software, like Windows.'], ['Design posters', 'That is a job for an application like Canva.'], ['Make the computer faster', 'That is not what a spreadsheet does — an SSD helps with speed.']],
        hint: SHEET_DEF, why: SHEET_DEF, result: 'Organise, store, analyse data' }),
      pk({ key: 'cell', concept: 'sheet-cells', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'What is a CELL?', answer: 'The box where a row and a column meet',
        wrong: [['A whole column of boxes', 'That is a column. A cell is ONE box.'], ['A whole row of boxes', 'That is a row. A cell is ONE box.'], ['A formula that adds numbers', 'A formula can sit IN a cell, but the cell is the box itself.']],
        hint: 'One box.', why: CELL_DEF, result: 'Cell = where a row and column meet' }),
      rowsQ
        ? pk({ key: 'lab', concept: 'sheet-cells', kind: 'learn', keepAll: true, prompt: 'ROWS are identified by…', answer: 'Numbers (1, 2, 3)',
          wrong: [['Letters (A, B, C)', 'Letters are for COLUMNS.'], ['Colours', 'Rows are labelled with numbers down the side.']],
          hint: 'Look down the left-hand side of a spreadsheet.', why: CELL_DEF, result: 'Rows = numbers' })
        : pk({ key: 'lab', concept: 'sheet-cells', kind: 'learn', keepAll: true, prompt: 'COLUMNS are identified by…', answer: 'Letters (A, B, C)',
          wrong: [['Numbers (1, 2, 3)', 'Numbers are for ROWS.'], ['Colours', 'Columns are labelled with letters across the top.']],
          hint: 'Look across the top of a spreadsheet.', why: CELL_DEF, result: 'Columns = letters' }),
      pk({ key: 'ref', concept: 'sheet-cells', kind: 'grid', isAnswer: true,
        prompt: 'What is the cell reference of the ★?', answer: refOf(col, row),
        wrong: [[`${row + 1}${L(col)}`, 'Letter first, then number — column, then row.'],
          ...[[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dj, di]) => col + dj >= 0 && col + dj <= 3 && row + di >= 0 && row + di <= 4)
            .map(([dj, di]) => [refOf(col + dj, row + di), `${refOf(col + dj, row + di)} is the cell ${dj ? (dj > 0 ? 'to the right' : 'to the left') : (di > 0 ? 'below' : 'above')}. Go up to find the letter, across to find the number.`])],
        hint: `Column ${L(col)}, row ${row + 1}.`, why: `${CELL_DEF} So the ★ is ${refOf(col, row)}.`,
        longWay: `Look UP from the ★: column ${L(col)}\nLook LEFT from the ★: row ${row + 1}\nCell reference: ${refOf(col, row)}`, result: `★ = ${refOf(col, row)}` }),
    ], { diagram: sheetHTML(rows, { star: [col, row] }) });
  }
  function shCells() {
    if (Math.random() < 0.3) {
      const nT = rand(2, 3), tr = sample(ADV, nT), fa = sample(NOT_ADV, 2);
      const items = shuffle([...tr.map((x) => [x, true, 'that is an advantage over paper on the poster.']), ...fa.map((x) => [x[0], false, x[1]])]);
      return prob(5, `pa:${items.map((i) => i[0]).join('|')}`, 'Spreadsheet or paper?', [
        ch({ key: 'adv', concept: 'sheet-why', kind: 'sort', items, prompt: 'Tap EVERY advantage a spreadsheet has over paper.',
          hint: `The poster lists: ${ADV.join('; ').toLowerCase()}.`, why: `Advantages over paper: ${ADV.join('; ').toLowerCase()}.`, result: tr.join('; ') }),
        pk({ key: 'which', concept: 'sheet-why', kind: 'sort', isAnswer: true, keepAll: true,
          prompt: 'A score was typed in wrong. Which advantage helps most?', answer: 'Easy to edit and update data',
          wrong: [['Automatically calculates totals and averages', 'Handy, but the problem here is a WRONG number — you need to change it.'],
            ['Sort and analyse results', 'Sorting will not fix a wrong number — editing will.']],
          hint: 'You need to change one number.', why: 'On paper you would cross it out. In a spreadsheet you just click the cell and type the right number.', result: 'Easy to edit and update data' }),
      ]);
    }
    const g = statsGrid();
    const ti = rand(1, 4), tj = rand(0, 2), target = g.rows[ti][tj];
    let qi, qj; do { qi = rand(1, 4); qj = rand(0, 2); } while (qi === ti && qj === tj);
    const asked = g.rows[qi][qj];
    const vals = [];
    g.rows.forEach((r, i) => r.forEach((v, j) => { if (!(i === qi && j === qj) && v !== asked) vals.push([v, `"${v}" is in ${refOf(j, i)}.`]); }));
    const colQ = Math.random() < 0.5;
    const heads = ['Player', 'Goals', 'Assists'], hj = rand(0, 2), nm = rand(1, 4);
    return prob(5, `pc:${g.rows.flat().join('|')}:${ti}${tj}:${qi}${qj}`, 'The team stats sheet', [
      pk({ key: 'find', concept: 'sheet-cells', kind: 'grid',
        prompt: `Which cell holds "${target}"?`, answer: refOf(tj, ti), wrong: cellWrongs(g.rows, tj, ti),
        hint: `Go up to the letter, across to the number: ${refOf(tj, ti)}.`, why: CELL_DEF, result: `"${target}" is in ${refOf(tj, ti)}` }),
      pk({ key: 'read', concept: 'sheet-cells', kind: 'grid',
        prompt: `What is in cell ${refOf(qj, qi)}?`, answer: asked, wrong: vals,
        hint: `Column ${L(qj)}, row ${qi + 1}.`, why: `Find column ${L(qj)} across the top, row ${qi + 1} down the side, and look where they meet.`, result: `${refOf(qj, qi)} = ${asked}` }),
      colQ
        ? pk({ key: 'col', concept: 'sheet-cells', kind: 'grid', isAnswer: true, keepAll: true,
          prompt: `Which COLUMN holds the ${heads[hj].toLowerCase()}?`, answer: L(hj),
          wrong: [0, 1, 2].filter((x) => x !== hj).map((x) => [L(x), `Column ${L(x)} holds the ${heads[x].toLowerCase()}.`]).concat([['1', '1 is a row number — row 1 holds the headings. Columns are letters.']]),
          hint: `The heading "${heads[hj]}" is at the top of column ${L(hj)}.`, why: 'Columns are identified by letters and go DOWN the sheet.', result: `Column ${L(hj)} = ${heads[hj]}` })
        : pk({ key: 'row', concept: 'sheet-cells', kind: 'grid', isAnswer: true, keepAll: true,
          prompt: `Which ROW holds ${g.names[nm - 1]}'s results?`, answer: String(nm + 1),
          wrong: [1, 2, 3, 4, 5].filter((x) => x !== nm + 1).map((x) => [String(x), x === 1 ? 'Row 1 holds the headings.' : `Row ${x} holds ${g.names[x - 2]}'s results.`]),
          hint: `${g.names[nm - 1]} is in row ${nm + 1}.`, why: 'Rows are identified by numbers and go ACROSS the sheet — one row for each player.', result: `Row ${nm + 1} = ${g.names[nm - 1]}` }),
    ], { diagram: sheetHTML(g.rows) });
  }
  function shReal() {
    const n = rand(4, 5), opp = sample(TEAMS, n), goals = Array.from({ length: n }, () => rand(0, 4));
    const rows = [['Opponent', 'Goals'], ...opp.map((o, i) => [o, String(goals[i])])];
    const mi = rand(1, n), last = n + 1;
    let fixed; do { fixed = rand(0, 5); } while (fixed === goals[mi - 1]);
    return prob(5, `ps:${rows.flat().join('|')}`, "A striker's season sheet: goals against each team.", [
      pk({ key: 'cell', concept: 'sheet-cells', kind: 'scenario',
        prompt: `The coach wants the goals against the ${opp[mi - 1]}. Which cell?`, answer: `B${mi + 1}`,
        wrong: [[`A${mi + 1}`, `A${mi + 1} holds the team name "${opp[mi - 1]}". The goals are in column B.`], [`${mi + 1}B`, 'Letter first, then number: B then the row.'],
          [`B${mi === 1 ? mi + 2 : mi}`, `That is the goals against the ${opp[mi === 1 ? mi : mi - 2]}.`]],
        hint: `${opp[mi - 1]} is in row ${mi + 1}; goals are in column B.`, why: CELL_DEF, result: `B${mi + 1}` }),
      pk({ key: 'edit', concept: 'sheet-why', kind: 'scenario', keepAll: true,
        prompt: `Oops — the goals against the ${opp[mi - 1]} should be ${fixed}, not ${goals[mi - 1]}. Which advantage of a spreadsheet helps?`,
        answer: 'Easy to edit and update data',
        wrong: [['Sort and analyse results', 'Sorting will not fix a wrong number. You need to edit it.'], ['It never needs checking', 'Data always needs checking — that is how this mistake was found!']],
        hint: `Click B${mi + 1} and type ${fixed}.`, why: 'Advantage over paper: easily edit and update data.', result: `Edit B${mi + 1} to ${fixed}` }),
      pk({ key: 'range', concept: 'sheet-cells', kind: 'scenario',
        prompt: 'Which range holds ALL the goals (and nothing else)?', answer: `B2:B${last}`,
        wrong: [[`A2:A${last}`, 'Column A holds the team names, not the goals.'], [`B1:B${last}`, 'B1 is the heading "Goals", not a number of goals.'],
          [`B2:B${last - 1}`, `That stops one row early and misses B${last}.`], [`B2+B${last}`, `A range uses a colon: B2:B${last} means B2 down to B${last}.`]],
        hint: `First goal cell : last goal cell = B2:B${last}.`, why: 'A range is written first cell, colon, last cell — A1:A4 means A1, A2, A3 and A4.', result: `B2:B${last}` }),
      pk({ key: 'auto', concept: 'sheet-why', kind: 'scenario', isAnswer: true, keepAll: true,
        prompt: 'The total goals cell updated BY ITSELF when the coach fixed the number. Which advantage is that?',
        answer: 'Automatically calculates totals and averages',
        wrong: [['Easy to edit and update data', 'Editing is what the coach did. The total changing on its own is automatic calculation.'],
          ['Sort and analyse results', 'Sorting puts things in order. Here the total recalculated by itself.']],
        hint: 'Nobody re-added the goals.', why: 'Advantage over paper: a spreadsheet automatically calculates totals, averages, etc.',
        longWay: `Find a cell: B${mi + 1}\nFix it: easy to edit and update\nAll the goals: B2:B${last}\nTotal updates itself: automatic calculation`, result: 'Automatic calculation' }),
    ], { diagram: sheetHTML(rows) });
  }

  // ======================================================== 6 · SPREADSHEET FORMULAS
  const FN = { SUM: 'Adds all the values together', AVERAGE: 'Finds the average (mean)', MAX: 'Finds the largest value', MIN: 'Finds the smallest value' };
  const FORMULA_DEF = 'Formulas start with an = and are used to calculate results.';
  const calc = (fn, v) => (fn === 'SUM' ? v.reduce((s, x) => s + x, 0) : fn === 'AVERAGE' ? v.reduce((s, x) => s + x, 0) / v.length : fn === 'MAX' ? Math.max(...v) : Math.min(...v));
  function evenValues(n, lo, hi, step) {
    for (;;) {
      const v = Array.from({ length: n }, () => lo + step * rand(0, (hi - lo) / step));
      if (v.reduce((s, x) => s + x, 0) % n === 0 && new Set(v).size >= 3) return v;
    }
  }
  function fnWrongs(fn, range) {
    return Object.keys(FN).filter((f) => f !== fn).map((f) => [`=${f}(${range})`, `=${f} ${FN[f].toLowerCase()}.`])
      .concat([[`${fn}(${range})`, 'Formulas must start with = — without it the spreadsheet just shows the words.']]);
  }
  function fmLearn() {
    const v = evenValues(4, 10, 90, 10), S = calc('SUM', v), A = S / 4, mm = Math.random() < 0.5 ? 'MAX' : 'MIN';
    const mv = calc(mm, v);
    const rows = v.map((x) => [String(x)]);
    return prob(6, `fl:${v.join(',')}:${mm}`, `Cells A1 to A4 contain ${v.join(', ')}.`, [
      pk({ key: 'eq', concept: 'formula-what', kind: 'learn', noGloss: true, keepAll: true,
        prompt: 'Every formula starts with…', answer: '=',
        wrong: [['+', 'Close, but spreadsheet formulas start with =.'], ['#', 'A # is not how formulas start — use =.'], ['SUM', 'SUM is a function name. It comes AFTER the =.']],
        hint: FORMULA_DEF, why: FORMULA_DEF, result: 'Formulas start with =' }),
      pk({ key: 'sum', concept: 'formula-what', kind: 'learn', keepAll: true,
        prompt: 'What does =SUM(A1:A4) do?', answer: FN.SUM,
        wrong: [['Finds the average (mean)', 'That is =AVERAGE.'], ['Finds the largest value', 'That is =MAX.'], ['Finds the smallest value', 'That is =MIN.']],
        hint: 'SUM = total.', why: '=SUM(range) adds all the values together. A1:A4 means A1, A2, A3 and A4.', result: '=SUM adds them all' }),
      pkNum({ key: 'sumv', concept: 'formula-calc', kind: 'learn',
        prompt: `So =SUM(A1:A4) = ? (${v.join(' + ')})`, answer: S,
        wrongNums: [S + 10, S - 10, Math.max(...v), A], whyWrong: (x) => (x === Math.max(...v) ? 'That is the largest value — =MAX would give that.' : x === A ? 'That is the average. =SUM is the total.' : `Add all four: ${v.join(' + ')} = ${S}.`),
        hint: `${v.join(' + ')} = ${S}.`, why: '=SUM adds every cell in the range.', result: `=SUM(A1:A4) = ${S}` }),
      pkNum({ key: 'avg', concept: 'formula-calc', kind: 'learn',
        prompt: `=AVERAGE(A1:A4): the total is ${S}, and there are 4 values. ${S} ÷ 4 = ?`, answer: A,
        wrongNums: [S, A + 5, A - 5, S / 2], whyWrong: (x) => (x === S ? 'That is the total. The average divides it by how many values there are (4).' : `${S} ÷ 4 = ${A}.`),
        hint: `${S} ÷ 4 = ${A}.`, why: 'The average (mean) = total ÷ how many values.', result: `=AVERAGE(A1:A4) = ${A}` }),
      pkNum({ key: 'mm', concept: 'formula-calc', kind: 'learn', isAnswer: true,
        prompt: `And =${mm}(A1:A4) = ?`, answer: mv,
        wrongNums: [calc(mm === 'MAX' ? 'MIN' : 'MAX', v), S, A], whyWrong: (x) => (x === S ? 'That is the SUM.' : x === A ? 'That is the AVERAGE.' : `That is the ${mm === 'MAX' ? 'smallest' : 'largest'} — =${mm === 'MAX' ? 'MIN' : 'MAX'} would give that.`),
        hint: `=${mm} ${FN[mm].toLowerCase()}: ${mv}.`, why: `=${mm}(range) ${FN[mm].toLowerCase()}.`,
        longWay: `A1:A4 = ${v.join(', ')}\n=SUM = ${S}\n=AVERAGE = ${S} ÷ 4 = ${A}\n=MAX = ${Math.max(...v)}\n=MIN = ${Math.min(...v)}`, result: `=${mm}(A1:A4) = ${mv}` }),
    ], { diagram: sheetHTML(rows), data: { kind: 'formulas', values: v, fns: ['SUM', 'AVERAGE', mm] } });
  }
  const JOBTEXT = { SUM: 'the TOTAL goals', AVERAGE: 'the AVERAGE (mean) goals per match', MAX: 'the MOST goals in one match', MIN: 'the FEWEST goals in one match' };
  function fmPick() {
    const last = rand(5, 9), range = `B2:B${last}`;
    if (Math.random() < 0.5) {
      const fn = pick(Object.keys(FN)), fn2 = pick(Object.keys(FN).filter((f) => f !== fn));
      return prob(6, `fp:${fn}:${fn2}:${last}`, `Goals per match are in cells B2 to B${last}.`, [
        pk({ key: 'pick', concept: 'formula-what', kind: 'pick', noGloss: true,
          prompt: `Which formula finds ${JOBTEXT[fn]}?`, answer: `=${fn}(${range})`,
          wrong: fnWrongs(fn, range).concat([[`=${fn}(B2+B${last})`, `B2+B${last} only uses two cells. A range uses a colon: ${range}.`]]),
          hint: `=${fn} ${FN[fn].toLowerCase()}.`, why: `${FORMULA_DEF} =SUM adds all, =AVERAGE finds the mean, =MAX the largest, =MIN the smallest.`, result: `=${fn}(${range})` }),
        pk({ key: 'does', concept: 'formula-what', kind: 'pick', isAnswer: true, keepAll: true, noGloss: true,
          prompt: `What does =${fn2}(${range}) do?`, answer: FN[fn2],
          wrong: Object.keys(FN).filter((f) => f !== fn2).map((f) => [FN[f], `That is what =${f} does.`]),
          hint: `${fn2}: ${FN[fn2].toLowerCase()}.`, why: Object.keys(FN).map((f) => `=${f}: ${FN[f].toLowerCase()}.`).join(' '), result: `=${fn2}: ${FN[fn2].toLowerCase()}` }),
      ]);
    }
    const M = [
      { typed: `SUM(${range})`, job: 'the total goals', fault: 'It does not start with =', fix: `=SUM(${range})` },
      { typed: `=AVERAGE(${range})`, job: 'the total goals', fault: 'AVERAGE finds the mean, but the total needs SUM', fix: `=SUM(${range})` },
      { typed: `=MIN(${range})`, job: 'the most goals in one match', fault: 'MIN finds the smallest, but the most needs MAX', fix: `=MAX(${range})` },
      { typed: `=MAX(${range})`, job: 'the average goals per match', fault: 'MAX finds the largest, but the average needs AVERAGE', fix: `=AVERAGE(${range})` },
      { typed: `=SUM(B2:B${last - 2})`, job: `the total goals in B2 to B${last}`, fault: `The range stops too early and leaves cells out`, fix: `=SUM(${range})` },
    ];
    const m = pick(M);
    const others = ['It does not start with =', 'The range stops too early and leaves cells out', 'Nothing is wrong with it', 'It uses the wrong function']
      .filter((f) => f !== m.fault && !(m.fault.includes('needs') && f === 'It uses the wrong function'));
    const faultWhy = {
      'It does not start with =': m.typed.startsWith('=') ? 'It does start with =. Look at the function or the range.' : '',
      'The range stops too early and leaves cells out': m.typed.includes(`B${last})`) ? `The range does reach B${last}.` : '',
      'Nothing is wrong with it': `Something is wrong — it will not give ${m.job}.`,
      'It uses the wrong function': m.fault.startsWith('The range') ? 'SUM is the right function for a total; look at the range.' : 'SUM is the right function for a total; look at how it starts.',
    };
    return prob(6, `fm:${m.typed}`, `To find ${m.job}, someone typed: ${m.typed}`, [
      pk({ key: 'spot', concept: 'formula-what', kind: 'spot', keepAll: true, noGloss: true,
        prompt: 'Spot the mistake. What is wrong?', answer: m.fault,
        wrong: others.map((f) => [f, faultWhy[f] || 'Look again at the formula.']),
        hint: m.fault + '.', why: `${FORMULA_DEF} =SUM adds all, =AVERAGE finds the mean, =MAX the largest, =MIN the smallest, and the range must cover every cell.`, result: m.fault }),
      pk({ key: 'fix', concept: 'formula-what', kind: 'spot', isAnswer: true, noGloss: true,
        prompt: 'Which formula is correct?', answer: m.fix,
        wrong: [[m.typed, 'That is the one with the mistake.']].concat(fnWrongs(m.fix.slice(1, m.fix.indexOf('(')), range)),
        hint: m.fix, why: `To find ${m.job}: ${m.fix}.`, longWay: `Typed: ${m.typed}\nProblem: ${m.fault}\nFixed: ${m.fix}`, result: m.fix }),
    ]);
  }
  const STATS = [{ head: 'Goals', lo: 0, hi: 6, step: 1, unit: 'goals' }, { head: 'Shots', lo: 1, hi: 9, step: 1, unit: 'shots' },
    { head: 'Passes', lo: 20, hi: 60, step: 5, unit: 'passes' }];
  function formulaCheck(fn, last, colName) {
    const right = [`=${fn}(B2:B${last})`, `=${fn}(B${last}:B2)`];
    return (raw) => {
      const s = String(raw).replace(/\s+/g, '').toUpperCase();
      if (right.includes(s)) return { correct: true };
      let msg = `The formula is =${fn}(B2:B${last}): an = first, then the function, then the range in brackets.`;
      if (!s.startsWith('=')) msg = 'Every formula must start with =.';
      else if (Object.keys(FN).some((f) => f !== fn && s.includes(f))) { const f = Object.keys(FN).find((x) => x !== fn && s.includes(x)); msg = `=${f} ${FN[f].toLowerCase()}. You need =${fn}: ${FN[fn].toLowerCase()}.`; }
      else if (/A\d/.test(s)) msg = `Column A holds the ${colName}. The numbers are in column B.`;
      else if (s.includes('B1:') || s.includes(':B1)')) msg = 'B1 is the heading. The numbers start in B2.';
      else if (s.includes('+')) msg = `Use a colon for a range: B2:B${last}. A + only joins two cells.`;
      return { correct: false, id: 'cs-formula-what', ctx: { msg } };
    };
  }
  function fmReal() {
    const st = pick(STATS), n = rand(4, 5), fn = pick(Object.keys(FN)), last = n + 1;
    const v = fn === 'AVERAGE' ? evenValues(n, st.lo, st.hi, st.step)
      : Array.from({ length: n }, () => st.lo + st.step * rand(0, (st.hi - st.lo) / st.step));
    const opp = sample(TEAMS, n);
    const rows = [['Opponent', st.head], ...opp.map((o, i) => [o, String(v[i])])];
    const S = calc('SUM', v), ans = calc(fn, v);
    const job = { SUM: `the TOTAL ${st.unit}`, AVERAGE: `the AVERAGE (mean) ${st.unit} per match`, MAX: `the MOST ${st.unit} in one match`, MIN: `the FEWEST ${st.unit} in one match` }[fn];
    const steps = [
      bd({ key: 'build', concept: 'formula-what', kind: 'build',
        prompt: `Build the formula that finds ${job}. The numbers are in B2 to B${last}.`,
        pieces: ['=', fn, '(', 'B2', ':', `B${last}`, ')'],
        distractors: [pick(Object.keys(FN).filter((f) => f !== fn)), 'A2', 'B1', '+'],
        solution: `= ${fn} ( B2 : B${last} )`, check: formulaCheck(fn, last, 'team names'),
        hint: `=${fn}(B2:B${last})`, why: `${FORMULA_DEF} =${fn}(range) ${FN[fn].toLowerCase()}. The range B2:B${last} covers every number and not the heading in B1.`,
        result: `=${fn}(B2:B${last})` }),
    ];
    const lw = `=${fn}(B2:B${last})\nvalues: ${v.join(', ')}`;
    if (fn === 'SUM') {
      steps.push(pkNum({ key: 'calc', concept: 'formula-calc', kind: 'grid', isAnswer: true,
        prompt: `Work it out: ${v.join(' + ')} = ?`, answer: S, wrongNums: [S + 1, S - 1, Math.max(...v), S + st.step * 2],
        whyWrong: (x) => (x === Math.max(...v) ? 'That is the largest single value (=MAX). =SUM adds them all.' : `Add every value: ${v.join(' + ')} = ${S}.`),
        hint: `${v.join(' + ')} = ${S}.`, why: '=SUM adds all the values together.', longWay: `${lw}\ntotal = ${S}`, result: `=SUM(B2:B${last}) = ${S}` }));
    } else if (fn === 'AVERAGE') {
      steps.push(pkNum({ key: 'tot', concept: 'formula-calc', kind: 'grid',
        prompt: `First the total: ${v.join(' + ')} = ?`, answer: S, wrongNums: [S + 1, S - 1, S + st.step * 2, S - st.step * 2],
        whyWrong: () => `Add every value: ${v.join(' + ')} = ${S}.`, hint: `${v.join(' + ')} = ${S}.`, why: 'The average (mean) starts with the total.', result: `total = ${S}` }));
      steps.push(pkNum({ key: 'div', concept: 'formula-calc', kind: 'grid', isAnswer: true,
        prompt: `There are ${n} values. ${S} ÷ ${n} = ?`, answer: ans, wrongNums: [S, ans + 1, ans - 1, ans + st.step],
        whyWrong: (x) => (x === S ? `That is the total. The average divides it by ${n}.` : `${S} ÷ ${n} = ${ans}. Check: ${ans} × ${n} = ${S}.`),
        hint: `${S} ÷ ${n} = ${ans}.`, why: 'Average (mean) = total ÷ how many values.', longWay: `${lw}\ntotal = ${S}\n${S} ÷ ${n} = ${ans}`, result: `=AVERAGE(B2:B${last}) = ${ans}` }));
    } else {
      const other = calc(fn === 'MAX' ? 'MIN' : 'MAX', v);
      steps.push(pkNum({ key: 'calc', concept: 'formula-calc', kind: 'grid', isAnswer: true,
        prompt: `What will =${fn}(B2:B${last}) show? (${v.join(', ')})`, answer: ans, wrongNums: [other, S, ans + st.step, ans - st.step],
        whyWrong: (x) => (x === other ? `That is the ${fn === 'MAX' ? 'smallest' : 'largest'} value — that would be =${fn === 'MAX' ? 'MIN' : 'MAX'}.` : x === S ? 'That is the total (=SUM).' : `Look along ${v.join(', ')}: the ${fn === 'MAX' ? 'largest' : 'smallest'} is ${ans}.`),
        hint: `The ${fn === 'MAX' ? 'largest' : 'smallest'} is ${ans}.`, why: `=${fn} ${FN[fn].toLowerCase()}.`, longWay: `${lw}\n${fn === 'MAX' ? 'largest' : 'smallest'} = ${ans}`, result: `=${fn}(B2:B${last}) = ${ans}` }));
    }
    return prob(6, `fr:${fn}:${v.join(',')}`, `Season sheet: ${st.unit} against each team.`, steps,
      { diagram: sheetHTML(rows), data: { kind: 'formula', fn, values: v, answer: ans } });
  }

  // ======================================================== 7 · GOOD DATA COLLECTION
  const RULE = {
    same: 'Use the same test and conditions for everyone',
    sample: 'Collect a fair and large enough sample',
    table: 'Use clear headings and separate rows for each student',
    errors: 'Check for any errors in the data',
  };
  const FAULT = {
    same: 'Not everyone did the same test in the same conditions',
    sample: 'The sample is not fair or large enough',
    table: 'No clear headings or separate rows for each student',
    errors: 'Nobody checked the data for errors',
  };
  const TESTS = ['reaction-time test', 'goalkeeper catching test', '20-metre sprint test'];
  function dcLearn() {
    const t = pick(TESTS);
    return prob(7, `cl:${t}`, `Collecting data well: a class ${t}`, [
      pk({ key: 'same', concept: 'collect-fair', kind: 'learn', keepAll: true,
        prompt: `The class is doing a ${t}. To make it fair, everyone should…`, answer: 'Do the same test in the same conditions',
        wrong: [['Choose whichever test they like', 'Different tests give results you cannot compare.'], ['Do it wherever they happen to be', 'Different places (quiet room, noisy playground) change the results. Keep the conditions the same.']],
        hint: 'Same test, same conditions.', why: `Poster rule: ${RULE.same.toLowerCase()} (e.g. the same reaction-time test).`, result: 'Same test, same conditions' }),
      pk({ key: 'sample', concept: 'collect-fair', kind: 'learn', keepAll: true,
        prompt: 'Which sample is best for finding out about the whole class?', answer: '20 students from the class',
        wrong: [['2 best friends', 'Two people is far too small a sample.'], ['Just yourself', 'One person tells you nothing about the class.'], ['Only the fastest runners', 'That is not a fair sample — it leaves out everyone else.']],
        hint: 'Fair and large enough.', why: `Poster rule: ${RULE.sample.toLowerCase()} (e.g. 20 students).`, result: '20 students' }),
      pk({ key: 'table', concept: 'collect-table', kind: 'learn', keepAll: true,
        prompt: 'How should the results table be set out?', answer: 'Clear headings, and a separate row for each student',
        wrong: [['All the results in one long sentence', 'One long sentence is hard to read and impossible to sort. Give each student a row.'], ['Numbers only, no headings', 'Without headings nobody knows what the numbers mean.']],
        hint: 'Headings on top, one row each.', why: `Poster rule: ${RULE.table.toLowerCase()}.`, result: 'Headings + a row each' }),
      pk({ key: 'check', concept: 'collect-table', kind: 'learn', isAnswer: true, keepAll: true,
        prompt: 'The results are in. What should you do before using them?', answer: 'Check the data for errors',
        wrong: [['Nothing, the data is always right', 'People make typing mistakes. Always check.'], ['Delete the highest result', 'You should not delete data just because it is high — check it first.']],
        hint: 'Mistakes happen.', why: `Poster rule: ${RULE.errors.toLowerCase()}.`,
        longWay: `1 ${RULE.same}\n2 ${RULE.sample}\n3 ${RULE.table}\n4 ${RULE.errors}`, result: 'Check for errors' }),
    ]);
  }
  const SCEN = [
    { t: 'Sam timed reaction speed with the ruler-drop test, but Mia used an online clicking game.', rule: 'same', fix: 'Everyone does the same test, in the same conditions' },
    { t: 'Half the class did the reaction test in a quiet classroom and half on a noisy playground.', rule: 'same', fix: 'Everyone does the same test, in the same conditions' },
    { t: 'Some players ran the sprint test in football boots on wet grass, others in trainers on the track.', rule: 'same', fix: 'Everyone does the same test, in the same conditions' },
    { t: 'Omar asked only his 2 best friends which sport the whole school likes most.', rule: 'sample', fix: 'Ask a fair, large enough sample, e.g. 20 students' },
    { t: 'Zara asked only the football team whether the school should build a new football pitch.', rule: 'sample', fix: 'Ask a fair mix of students from across the school, not only the team' },
    { t: "Leo wrote everyone's reaction times in one long line, with no names and no headings.", rule: 'table', fix: 'Use clear headings and give each student their own row' },
    { t: "Noor squeezed three students' results into the same row of the table.", rule: 'table', fix: 'Use clear headings and give each student their own row' },
    { t: "One student's reaction time was typed as 50 seconds, when everyone else took under 1 second — and nobody noticed.", rule: 'errors', fix: 'Check the data and re-test anyone whose result looks impossible' },
    { t: 'Kai typed the results in quickly and handed them in without looking at them again.', rule: 'errors', fix: 'Check the data and re-test anyone whose result looks impossible' },
  ];
  const BAD_FIX = [['Ask fewer people so it is quicker', 'Fewer people makes the sample smaller, not fairer.'],
    ['Let each person choose their own test', 'Then nobody did the same test — results cannot be compared.'],
    ['Delete any result that looks odd without checking', 'Check it first, then correct it or re-test. Never just delete.'],
    ['Write the results without headings', 'Without headings nobody knows what the numbers mean.']];
  function dcFair() {
    const s = pick(SCEN), conc = (s.rule === 'same' || s.rule === 'sample') ? 'collect-fair' : 'collect-table';
    return prob(7, `cf:${SCEN.indexOf(s)}`, s.t, [
      pk({ key: 'fault', concept: conc, kind: 'spot', keepAll: true, noGloss: true,
        prompt: 'What went wrong?', answer: FAULT[s.rule],
        wrong: Object.keys(FAULT).filter((k) => k !== s.rule).map((k) => [FAULT[k], `That is a real rule, but it is not what went wrong here. Read it again: ${s.t}`]),
        hint: `The rule broken: ${RULE[s.rule].toLowerCase()}.`, why: `Poster rule: ${RULE[s.rule]}.`, result: FAULT[s.rule] }),
      pk({ key: 'fix', concept: conc, kind: 'spot', isAnswer: true, noGloss: true,
        prompt: 'What is the best way to fix it?', answer: s.fix, wrong: BAD_FIX,
        hint: s.fix + '.', why: `Poster rule: ${RULE[s.rule]}.`, longWay: `Problem: ${FAULT[s.rule]}\nRule: ${RULE[s.rule]}\nFix: ${s.fix}`, result: s.fix }),
    ]);
  }
  function dcReal() {
    if (Math.random() < 0.55) {
      const names = sample(NAMES, 5), vals = names.map(() => rand(2, 9));
      const kind = pick(['high', 'neg', 'missing', 'twice']), bad = rand(0, 4);
      const shownNames = names.slice(), shownVals = vals.map(String);
      if (kind === 'high') shownVals[bad] = String(rand(13, 19));
      if (kind === 'neg') shownVals[bad] = String(-rand(1, 4));
      if (kind === 'missing') shownVals[bad] = '';
      if (kind === 'twice') { const src = (bad + 2) % 5; shownNames[bad] = shownNames[src]; }
      const culprit = shownNames[bad];
      const FAULTS = { high: 'Nobody can catch more than 10 out of 10', neg: 'A score cannot be below zero', missing: 'The result is missing', twice: 'The same student is entered twice' };
      const rows = [['Student', 'Catches (out of 10)'], ...shownNames.map((nm, i) => [nm, shownVals[i]])];
      const otherNames = [...new Set(shownNames)].filter((x) => x !== culprit);
      return prob(7, `ce:${rows.flat().join('|')}`, 'Goalkeeper test: catches out of 10. Check the table for errors.', [
        pk({ key: 'who', concept: 'collect-table', kind: 'scenario',
          prompt: kind === 'twice' ? 'Whose name has a problem?' : "Which student's result has an error?", answer: culprit,
          wrong: otherNames.map((x) => [x, `${x} appears once with a possible score (0 to 10).`]),
          hint: kind === 'twice' ? `${culprit} appears twice.` : `Look at ${culprit}'s row.`, why: 'Check every row: is each result possible, present, and for a different student?', result: culprit }),
        pk({ key: 'what', concept: 'collect-table', kind: 'scenario', keepAll: true,
          prompt: 'What is wrong?', answer: FAULTS[kind],
          wrong: Object.keys(FAULTS).filter((k) => k !== kind).map((k) => [FAULTS[k], `Look again at ${culprit}'s row — that is not the problem there.`]),
          hint: FAULTS[kind] + '.', why: 'Catches are out of 10, so every result must be a whole number from 0 to 10, and each student needs exactly one row.', result: FAULTS[kind] }),
        pk({ key: 'do', concept: 'collect-table', kind: 'scenario', isAnswer: true, keepAll: true,
          prompt: 'What should you do about it?', answer: 'Check it, then correct it or re-test', noGloss: true,
          wrong: [['Leave it, one mistake does not matter', 'One wrong value can spoil the average and the highest score.'],
            ['Delete the whole table', 'Throwing away all the good data is not the fix — correct the one mistake.'],
            ['Change it to the class average', 'That would be making data up. Check it or re-test.']],
          hint: 'Find out the real value.', why: `Poster rule: ${RULE.errors}.`, longWay: `Error: ${culprit} — ${FAULTS[kind].toLowerCase()}\nFix: check it, then correct or re-test`, result: 'Check it, then correct or re-test' }),
      ], { diagram: sheetHTML(rows) });
    }
    // which table is set out properly?
    const names = sample(NAMES, 4), t = names.map(() => `0.${rand(21, 39)}`);
    const goodRows = [['Student', 'Reaction time (s)'], ...names.map((n, i) => [n, t[i]])];
    const tables = shuffle([
      { id: 'good', html: sheetHTML(goodRows) },
      { id: 'nohead', html: sheetHTML(names.map((n, i) => [n, t[i]])) },
      { id: 'oneline', html: sheetHTML([[names.map((n, i) => `${n} ${t[i]}`).join(', ')]]) },
    ]);
    const lab = ['Table 1', 'Table 2', 'Table 3'];
    const labOf = (id) => lab[tables.findIndex((x) => x.id === id)];
    const diagram = '<div class="sheet-set">' + tables.map((x, i) => `<div class="sheet-opt"><div class="sheet-cap">${lab[i]}</div>${x.html}</div>`).join('') + '</div>';
    const why = { nohead: 'It has no headings, so nobody knows what the numbers mean.', oneline: 'Everything is crammed into one cell — there is no separate row for each student.' };
    const askBad = pick(['nohead', 'oneline']);
    return prob(7, `ct:${tables.map((x) => x.id).join(',')}:${t.join(',')}`, 'Three ways to record a reaction-time test. Which is best?', [
      pk({ key: 'best', concept: 'collect-table', kind: 'scenario', keepAll: true, noGloss: true,
        prompt: 'Which table is set out properly?', answer: labOf('good'),
        wrong: [[labOf('nohead'), why.nohead], [labOf('oneline'), why.oneline]],
        hint: 'Clear headings AND a separate row for each student.', why: `Poster rule: ${RULE.table}.`, result: `${labOf('good')} is best` }),
      pk({ key: 'bad', concept: 'collect-table', kind: 'scenario', keepAll: true, noGloss: true,
        prompt: `What is wrong with ${labOf(askBad)}?`, answer: askBad === 'nohead' ? 'It has no headings' : 'There is no separate row for each student',
        wrong: [[askBad === 'nohead' ? 'There is no separate row for each student' : 'It has no headings', askBad === 'nohead' ? 'Each student does have a row — but there are no headings.' : 'Headings are not the main problem — everyone is in one cell.'],
          ['Nothing, it is fine', why[askBad]]],
        hint: why[askBad], why: `Poster rule: ${RULE.table}.`, result: askBad === 'nohead' ? 'No headings' : 'No separate rows' }),
      pk({ key: 'n', concept: 'collect-fair', kind: 'scenario', isAnswer: true, keepAll: true, noGloss: true,
        prompt: 'They want to know about the whole year group. How many students should they test?', answer: '20 students, chosen fairly',
        wrong: [['4 students, the ones in the table', 'Four is too small a sample for a whole year group.'], ['Only the fastest students', 'That is not fair — it leaves out everyone else.'], ['Just the teacher', 'One adult tells you nothing about the students.']],
        hint: 'Fair and large enough.', why: `Poster rule: ${RULE.sample} (e.g. 20 students).`,
        longWay: `Best layout: ${labOf('good')} (headings, a row each)\n${labOf(askBad)}: ${why[askBad]}\nSample: fair and large enough, e.g. 20 students`, result: '20 students, chosen fairly' }),
    ], { diagram });
  }

  // ======================================================== the test, and reviews
  const SECTION_GENS = {
    1: { learn: hwLearn, practise: hwSort, real: hwReal },
    2: { learn: stLearn, practise: stCompare, real: stReal },
    3: { learn: unLearn, practise: unOrder, real: unReal },
    4: { learn: diLearn, practise: diSort, real: diReal },
    5: { learn: shLearn, practise: shCells, real: shReal },
    6: { learn: fmLearn, practise: fmPick, real: fmReal },
    7: { learn: dcLearn, practise: dcFair, real: dcReal },
  };
  // The test cycles through the seven sections so ten questions always cover the poster.
  let testTurn = rand(0, 6);
  function csTest() {
    const n = (testTurn++ % 7) + 1, g = SECTION_GENS[n];
    const p = (Math.random() < 0.5 ? g.practise : g.real)();
    p.gloss = false;                     // test conditions: no definitions on tap
    p.note = `Test question · Section ${n}: ${CS_SECTIONS[n - 1].name}`;
    return p;
  }
  // A fresh question on the concept that was just missed — from the section's practise
  // or real-life generators first, the learn level only if neither covers it this time.
  function csReview(concept) {
    const n = sectionOf(concept);
    const g = SECTION_GENS[n];
    if (!g) return null;
    const order = [g.practise, g.real, g.practise, g.real, g.learn];
    for (let t = 0; t < 40; t++) {
      const p = order[t % order.length]();
      if (p.steps.some((s) => s.concept === concept)) {
        p.review = concept;
        p.note = `🔁 Replay: ${CS_CONCEPTS[concept].toLowerCase()} — you missed this idea earlier, so here it is again.`;
        p.sig = 'rv:' + p.sig;
        return p;
      }
    }
    return null;
  }

  // ======================================================== glossary
  // Definitions are the poster's, in the poster's words where it has words.
  const GLOSSARY = [
    { id: 'hardware', terms: ['hardware'], def: 'Hardware: the physical parts of a computer that you can touch — e.g. monitor, keyboard, mouse, printer.' },
    { id: 'system-software', terms: ['system software'], def: 'System software: manages the hardware and supports other programs — e.g. Windows, macOS.' },
    { id: 'application-software', terms: ['application software', 'application', 'applications'], def: 'Application software: used to carry out specific tasks — e.g. Excel, Canva, WhatsApp.' },
    { id: 'software', terms: ['software'], def: 'Software: programs and instructions that tell a computer what to do — e.g. Word, Excel, Canva, Scratch.' },
    { id: 'storage', terms: ['storage', 'storage device', 'storage devices'], def: 'Storage: saving files and data so they can be used later. Storage devices save videos, photos, documents and games.' },
    { id: 'hdd', terms: ['HDD', 'HDDs', 'hard disk drive'], def: 'HDD (Hard Disk Drive): large capacity, cheaper, but slower — it uses moving parts.' },
    { id: 'ssd', terms: ['SSD', 'SSDs', 'solid state drive'], def: 'SSD (Solid State Drive): faster and more reliable, but usually more expensive. SSDs are generally faster than HDDs.' },
    { id: 'usb', terms: ['USB flash drive', 'USB flash drives', 'USB'], def: 'USB flash drive: portable and easy to use for transferring files.' },
    { id: 'memory-card', terms: ['memory card', 'memory cards'], def: 'Memory card: small, portable storage used in devices like cameras.' },
    { id: 'capacity', terms: ['capacity'], def: 'Capacity: how much data a storage device can hold.' },
    { id: 'byte', terms: ['byte', 'bytes'], def: 'Byte (B): the smallest unit of storage.' },
    { id: 'kb', terms: ['KB', 'kilobyte', 'kilobytes'], def: 'Kilobyte (KB) = 1,000 bytes.' },
    { id: 'mb', terms: ['MB', 'megabyte', 'megabytes'], def: 'Megabyte (MB) = 1,000 KB.' },
    { id: 'gb', terms: ['GB', 'gigabyte', 'gigabytes'], def: 'Gigabyte (GB) = 1,000 MB.' },
    { id: 'tb', terms: ['TB', 'terabyte', 'terabytes'], def: 'Terabyte (TB) = 1,000 GB. A TB is the largest unit.' },
    { id: 'data', terms: ['data'], def: 'Data: raw facts and figures without context — e.g. 45, 67, 89, 92 or Red, Blue, Green, Yellow.' },
    { id: 'information', terms: ['information'], def: 'Information: data that has been processed or given meaning — e.g. "The highest score was 92%". It is more useful because it supports decisions.' },
    { id: 'context', terms: ['context'], def: 'Context: what the facts are about. "92" has no context; "Ahmed scored 92% in Computing" does.' },
    { id: 'spreadsheet', terms: ['spreadsheet', 'spreadsheets'], def: 'Spreadsheet: used to organise, store and analyse data, in a grid of rows and columns.' },
    { id: 'cell-reference', terms: ['cell reference', 'cell references'], def: 'Cell reference: the column letter then the row number, e.g. B2 = column B, row 2.' },
    { id: 'cell', terms: ['cell', 'cells'], def: 'Cell: the box where a row and a column meet, e.g. B2.' },
    { id: 'row', terms: ['row', 'rows'], def: 'Row: goes across. Rows are identified by numbers (1, 2, 3).' },
    { id: 'column', terms: ['column', 'columns'], def: 'Column: goes down. Columns are identified by letters (A, B, C).' },
    { id: 'formula', terms: ['formula', 'formulas'], def: 'Formula: calculates a result in a spreadsheet. Formulas start with an =.' },
    { id: 'range', terms: ['range'], def: 'Range: a block of cells, written first cell:last cell. A1:A4 means A1, A2, A3 and A4.' },
    { id: 'sum', terms: ['SUM'], def: '=SUM(range) adds all the values together. If A1:A4 hold 10, 20, 30, 40, =SUM(A1:A4) = 100.' },
    { id: 'average', terms: ['average', 'mean'], def: '=AVERAGE(range) finds the average (mean): add all the values, then divide by how many there are. 10, 20, 30, 40 → 25.' },
    { id: 'max', terms: ['MAX'], def: '=MAX(range) finds the largest value. 10, 20, 30, 40 → 40.' },
    { id: 'min', terms: ['MIN'], def: '=MIN(range) finds the smallest value. 10, 20, 30, 40 → 10.' },
    { id: 'sample', terms: ['sample'], def: 'Sample: the people you collect data from. It should be fair and large enough — e.g. 20 students.' },
    { id: 'fair-test', terms: ['fair test', 'fair'], def: 'Fair: everyone does the same test in the same conditions — e.g. the same reaction-time test.' },
    { id: 'conditions', terms: ['conditions'], def: 'Conditions: everything around a test — the place, the time, the equipment. Keep them the same for everyone.' },
    { id: 'heading', terms: ['heading', 'headings'], def: 'Heading: the label at the top that says what the data is, e.g. "Reaction time (s)". Use clear headings.' },
    { id: 'error', terms: ['error', 'errors'], def: 'Error: a mistake in the data, like an impossible or missing result. Always check for errors.' },
  ];
  // An all-capitals term (SUM, MIN, KB, USB …) only matches in capitals, so "min" or
  // "sum" in an ordinary sentence is never taken for the function or the unit.
  function caseOk(e, word) {
    const t = e.terms.find((x) => x.toLowerCase() === word.toLowerCase());
    return !!t && (t !== t.toUpperCase() || t === word);
  }
  const GLOSS_BY_ID = {};
  const LOOKUP = new Map();
  GLOSSARY.forEach((e) => { GLOSS_BY_ID[e.id] = e; e.terms.forEach((t) => LOOKUP.set(t.toLowerCase(), e)); });
  const ALL_TERMS = GLOSSARY.flatMap((e) => e.terms).sort((a, b) => b.length - a.length);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // No look-behind: older iPads' Safari does not support it. The leading group eats one
  // non-letter character instead and is put back unchanged.
  const GLOSS_RE = new RegExp(`(^|[^A-Za-z0-9])(${ALL_TERMS.map(reEsc).join('|')})(?![A-Za-z0-9])`, 'gi');

  // Wraps the first use of each term in an HTML string with a tappable span. Works on
  // text BETWEEN tags only, so markup (fractions, earlier spans) is never broken.
  function glossify(html) {
    const used = new Set();
    return String(html == null ? '' : html).split(/(<[^>]*>)/).map((part) => {
      if (part.charAt(0) === '<') return part;
      return part.replace(GLOSS_RE, (m, pre, word) => {
        const e = LOOKUP.get(word.toLowerCase());
        if (!e || !caseOk(e, word) || used.has(e.id)) return m;
        used.add(e.id);
        return `${pre}<span class="gl" data-gl="${e.id}" role="button" tabindex="0">${word}</span>`;
      });
    }).join('');
  }
  // The glossary entry a whole card's text IS ("Hardware", "System software"), if any —
  // such a card gets a small ⓘ instead, so tapping the word itself still picks the card.
  function glossTermOf(text) {
    const t = String(text).trim(), e = LOOKUP.get(t.toLowerCase());
    if (!e || !caseOk(e, t)) return null;
    return e.id;
  }
  function glossTermsIn(html) {
    return [...String(html).matchAll(/data-gl="([a-z-]+)"/g)].map((m) => m[1]);
  }

  // ======================================================== mastery (pure)
  // A concept is MASTERED after MASTER_STREAK first-try answers in a row that between
  // them span at least MASTER_KINDS different kinds of question — three taps on the same
  // kind of card proves recognition, not understanding. A miss resets the run. Once
  // mastered it stays mastered (a slip is counted, not punished).
  const MASTER_STREAK = 3, MASTER_KINDS = 2;
  const nn = (x) => (Number.isFinite(Number(x)) && Number(x) >= 0 ? Math.floor(Number(x)) : 0);
  function masteryMigrate(m) {
    const out = (m && typeof m === 'object' && !Array.isArray(m)) ? m : {};
    if (!out.c || typeof out.c !== 'object' || Array.isArray(out.c)) out.c = {};
    out.v = 1;
    Object.keys(out.c).forEach((k) => {
      const r = out.c[k] && typeof out.c[k] === 'object' ? out.c[k] : {};
      out.c[k] = { streak: nn(r.streak), kinds: Array.isArray(r.kinds) ? r.kinds.filter((x) => typeof x === 'string').slice(-MASTER_STREAK) : [],
        right: nn(r.right), seen: nn(r.seen), slips: nn(r.slips), mastered: !!r.mastered };
    });
    return out;
  }
  function masteryRecord(m, concept, kind, firstTry) {
    m = masteryMigrate(m);
    const r = m.c[concept] || (m.c[concept] = { streak: 0, kinds: [], right: 0, seen: 0, slips: 0, mastered: false });
    r.seen++;
    let just = false;
    if (firstTry) {
      r.right++; r.streak++; r.kinds = r.kinds.concat([String(kind || 'any')]).slice(-MASTER_STREAK);
      if (!r.mastered && r.streak >= MASTER_STREAK && new Set(r.kinds).size >= MASTER_KINDS) { r.mastered = true; just = true; }
    } else {
      r.streak = 0; r.kinds = [];
      if (r.mastered) r.slips++;
    }
    return just;
  }
  function masterySummary(m) {
    m = masteryMigrate(m);
    const isM = (c) => !!(m.c[c] && m.c[c].mastered);
    return {
      sections: CS_SECTIONS.map((s) => ({ n: s.n, name: s.name, icon: s.icon, total: s.concepts.length,
        mastered: s.concepts.filter(isM).length,
        concepts: s.concepts.map((c) => ({ id: c, label: CS_CONCEPTS[c], mastered: isM(c), streak: (m.c[c] && m.c[c].streak) || 0 })) })),
      checklist: CS_CHECKLIST.map((it) => ({ text: it.text, done: it.concepts.every(isM) })),
      mastered: Object.keys(CS_CONCEPTS).filter(isM).length, total: Object.keys(CS_CONCEPTS).length,
    };
  }

  const api = {
    csHwLearn: hwLearn, csHwSort: hwSort, csHwReal: hwReal,
    csStLearn: stLearn, csStCompare: stCompare, csStReal: stReal,
    csUnLearn: unLearn, csUnOrder: unOrder, csUnReal: unReal,
    csDiLearn: diLearn, csDiSort: diSort, csDiReal: diReal,
    csShLearn: shLearn, csShCells: shCells, csShReal: shReal,
    csFmLearn: fmLearn, csFmPick: fmPick, csFmReal: fmReal,
    csDcLearn: dcLearn, csDcFair: dcFair, csDcReal: dcReal,
    csTest, csReview, CS_SECTIONS, CS_CONCEPTS, CS_CHECKLIST, CS_MISTAKE_LABELS, CS_SECTION_GENS: SECTION_GENS,
    GLOSSARY, GLOSS_BY_ID, glossify, glossTermOf, glossTermsIn,
    MASTER_STREAK, MASTER_KINDS, masteryMigrate, masteryRecord, masterySummary,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
