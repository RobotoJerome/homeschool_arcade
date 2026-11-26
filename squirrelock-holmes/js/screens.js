/* Squirrelock Holmes — screens and pop-ups: title, choosing a case, the briefing, a clue
   close-up, the Solve panel, CASE CLOSED (Holmes explains, red herrings, time and Top 10),
   pause, the Logic Handbook and How to Play. */
'use strict';
(function (SQH) {
  const { $, h } = SQH;
  const Screens = SQH.Screens = {};
  const G = SQH.G;
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  // The Logic Handbook. Definitions are in our own words, checked on November 25, 2026 against the linked sources.
  const HANDBOOK = [
    { term: 'Observation and inference', text: 'An observation is noticing a fact directly: what you see, hear or read. An inference is a conclusion you form from facts or evidence. Inferences can be wrong, so a good detective tests them.',
      ex: 'Observation: there are muddy tail prints on the rug. Inference: someone came in from the wet garden. (Or the prints are old. Test it!)',
      src: [['Merriam-Webster: observation', 'https://www.merriam-webster.com/dictionary/observation'], ['Merriam-Webster: inference', 'https://www.merriam-webster.com/dictionary/inference']] },
    { term: 'Deductive reasoning', text: 'Reasoning from statements you accept as true (premises) to a conclusion that follows from them necessarily. If the premises are true, the conclusion is guaranteed to be true.',
      ex: 'Only two keys open the pantry. One key was in the safe all night. The pantry was opened with a key. So the other key opened it.',
      src: [['Britannica: deduction', 'https://www.britannica.com/topic/deduction-reason'], ['Internet Encyclopedia of Philosophy: Deductive and Inductive Arguments', 'https://iep.utm.edu/deductive-inductive-arguments/']] },
    { term: 'Inductive reasoning', text: 'Reasoning from evidence to a conclusion that is likely, but not guaranteed. The evidence gives good grounds for the conclusion, not proof.',
      ex: 'Every day this week, the acorn jar emptied right after the same visitor came by. It emptied again today, so that visitor probably came by. (Probably, not certainly.)',
      src: [['Internet Encyclopedia of Philosophy: Deductive and Inductive Arguments', 'https://iep.utm.edu/deductive-inductive-arguments/'], ['Britannica: induction', 'https://www.britannica.com/topic/induction-reason']] },
    { term: 'Ruling out (elimination)', text: 'Crossing off every possibility that clashes with the evidence. Each wrong answer in a case is ruled out by at least one clue or deduction.',
      ex: 'Fresh snow under the window with no tracks in it rules out anyone climbing in that way.',
      quote: 'The original Sherlock Holmes put it this way: when you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      src: [['Arthur Conan Doyle, The Sign of Four (1890), chapter 6, on Wikisource', 'https://en.wikisource.org/wiki/The_Sign_of_Four/Chapter_6']] },
    { term: 'Red herring', text: 'Something that distracts attention from the real question. In a mystery, it\'s a clue that looks important but points the wrong way.',
      ex: 'A dropped glove by the door looks like a big clue, until you learn it has been lying there since last week.',
      src: [['Merriam-Webster: red herring', 'https://www.merriam-webster.com/dictionary/red%20herring']] },
    { term: 'Alibi and timeline', text: 'An alibi is a claim that a suspect was somewhere else when the crime happened. To check one, line up the times and distances and see whether the story is even possible.',
      ex: 'The cake vanished at 3:00. A suspect was singing on stage in front of a crowd from 2:45 to 3:15, so that alibi holds, unless the stage is just a minute away.',
      src: [['Merriam-Webster: alibi', 'https://www.merriam-webster.com/dictionary/alibi']] },
  ];

  // A "Read aloud" button (only on devices that have a voice). getText is called when pressed.
  const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 9h4l5-4v14l-5-4H3V9Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8.8v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6Z"/></svg>';
  function readBtn(getText, cls) {
    if (!SQH.Speech.can) return null;
    return h('button', { class: 'btn btn--line btn--sm' + (cls ? ' ' + cls : ''), type: 'button', svg: SPEAKER + '<span>Read aloud</span>', onclick: () => SQH.Speech.speak(getText()) });
  }
  Screens.readBtn = readBtn;
  function sheet(dlg, title, id) {
    dlg.innerHTML = '';
    const close = h('button', { class: 'icon-btn icon-btn--small', type: 'button', 'aria-label': 'Close', svg: SQH.ICON.cross, onclick: () => dlg.close() });
    const body = h('div', { class: 'sheet__body' });
    dlg.append(h('div', { class: 'sheet__head' }, h('h2', { id, text: title }), close), body);
    return body;
  }
  // Resolves as soon as the dialog closes (a button can call dlg.finish() to skip waiting for the close event).
  function closed(dlg) {
    return new Promise((res) => {
      let done = false;
      const fin = () => { if (done) return; done = true; dlg.finish = null; res(dlg.returnValue); };
      dlg.finish = fin;
      dlg.addEventListener('close', fin, { once: true });
    });
  }

  /* ---------------- title and case picker ---------------- */
  Screens.init = function () {
    $('#title-art').innerHTML = SQH.Art.scene('oak-street', {});
    $('#pick-art').innerHTML = SQH.Art.scene('oak-street', {});
    $('#title-cast').innerHTML = SQH.Art.portraitSvg('holmes', 'smug') + SQH.Art.portraitSvg('watson', 'neutral');
    $('#btn-take').addEventListener('click', () => { SQH.Sound.click(); Screens.pick(); });
    $('#btn-top').addEventListener('click', () => { SQH.Sound.click(); Screens.boards(); });
    $('#btn-handbook').addEventListener('click', () => { SQH.Sound.click(); Screens.handbook(); });
    $('#btn-howto').addEventListener('click', () => { SQH.Sound.click(); Screens.howto(); });
    SQH.$$('[data-nav="title"]').forEach((b) => b.addEventListener('click', () => { SQH.Sound.click(); Screens.title(); }));
    $('#btn-solve').addEventListener('click', () => Screens.solve());
    $('#btn-hint').addEventListener('click', () => SQH.Play.hint());
    $('#btn-pause').addEventListener('click', () => SQH.Play.pause());
  };
  Screens.title = function () { SQH.showScreen('title'); $('#btn-take').focus(); };
  Screens.pick = function () {
    const wrap = $('#casefiles'); wrap.innerHTML = '';
    SQH.TIER_ORDER.forEach((tier, i) => {
      const story = SQH.storyFor(tier), T = SQH.TIERS[tier];
      if (!story) return;
      const versions = SQH.casesFor(tier).length;
      const card = h('article', { class: 'casefile', 'data-tab': `${T.label.toUpperCase()}  ${stars(T.stars)}` },
        h('span', { class: 'casefile__stamp', text: 'CASE ' + (i + 1) }),
        h('h3', { text: story.title }),
        h('p', { text: story.blurb }),
        h('ul', {},
          h('li', { text: `${story.rooms.length} room${story.rooms.length > 1 ? 's' : ''} · ${story.suspects.length} suspects` }),
          h('li', { text: `About ${T.target}` }),
          h('li', { text: `${versions} versions of this case` })),
        h('button', { class: 'btn btn--violet', type: 'button', onclick: () => { SQH.Sound.click(); const c = SQH.pickCase(tier); if (c) SQH.Play.start(c); } }, 'Open the case'));
      wrap.append(card);
    });
    SQH.showScreen('pick');
    const first = $('#casefiles .btn'); if (first) first.focus();
  };

  /* ---------------- the briefing ---------------- */
  Screens.briefing = function (story) {
    const dlg = $('#dlg-brief'), T = SQH.TIERS[story.tier];
    return new Promise((resolve) => {
      let step = 1;
      function fileCard() {
        dlg.innerHTML = '';
        const go = h('button', { class: 'btn btn--violet', type: 'button', onclick: hear }, 'Hear the briefing ▸');
        dlg.append(h('div', { class: 'sheet__body' },
          h('p', { class: 'brief__file stampin', text: `CASE FILE · ${T.label.toUpperCase()} ${stars(T.stars)}` }),
          h('h2', { id: 'brief-title', text: story.title }),
          h('p', { class: 'brief__blurb', text: story.blurb }),
          h('p', { class: 'brief__meta' }, h('span', { text: story.rooms.map((r) => r.name).join(' · ') }), h('span', { text: 'Suspects: ' + story.suspects.map((s) => s.name).join(', ') })),
          h('div', { class: 'brief__actions' }, readBtn(() => `${story.title}. ${story.blurb} Suspects: ${story.suspects.map((s) => s.name).join(', ')}.`), go)));
        if (!dlg.open) dlg.showModal();
        SQH.Speech.say(`${story.title}. ${story.blurb}`);
        go.focus();
      }
      function hear() {
        step = 2; dlg.close();
        SQH.Talk.play(story.briefing, story).then(questionCard);
      }
      function questionCard() {
        step = 3; dlg.innerHTML = '';
        const go = h('button', { class: 'btn btn--violet btn--xl', type: 'button', onclick: start }, 'Start the clock ▸');
        dlg.append(h('div', { class: 'sheet__body' },
          h('div', { class: 'brief__q stampin' }, h('small', { text: 'YOUR QUESTION' }), story.question),
          h('ul', { class: 'brief__tips' },
            h('li', { text: 'Click things in the room to examine them. Some are locked until you find something else.' }),
            h('li', { text: 'Question the people along the bottom.' }),
            h('li', { text: 'Open the Notebook, pin two clues and press Connect to make a deduction.' }),
            h('li', { text: 'Press Solve! when you can prove it. A wrong answer adds 1:00; a hint adds 0:30.' })),
          h('div', { class: 'brief__actions' }, readBtn(() => 'Your question: ' + story.question), go)));
        dlg.showModal(); go.focus();
        SQH.Speech.say('Your question: ' + story.question);
      }
      function start() { step = 4; dlg.close(); SQH.Speech.stop(); SQH.Sound.click(); resolve(); }
      dlg.oncancel = (e) => { e.preventDefault(); if (step === 1) hear(); else if (step === 3) start(); };
      fileCard();
    });
  };

  /* ---------------- clue close-up ---------------- */
  Screens.closeup = function (k, isNew) {
    const dlg = $('#dlg-closeup');
    dlg.innerHTML = '';
    const back = h('button', { class: 'btn btn--violet', type: 'button', onclick: () => { dlg.close(); if (dlg.finish) dlg.finish(); } }, isNew ? 'Add to notebook' : 'Back to the scene');
    dlg.append(
      h('div', { class: 'cu-art' + (isNew ? ' pop' : ''), svg: `<svg viewBox="-56 -56 112 112" aria-hidden="true" focusable="false">${SQH.Art.props[k.prop] || ''}</svg>` }),
      h('div', { class: 'cu-body' },
        h('p', { class: 'cu-cat', svg: SQH.catIcon(k.cat) + `<span>${SQH.CATS[k.cat].one}</span>` }),
        h('h2', { id: 'cu-name', text: k.name }),
        h('div', { class: 'obs' }, h('b', { text: 'Observation: what we see' }), h('p', { text: k.see })),
        h('div', { class: 'inf' }, h('b', { text: 'Inference: what Holmes thinks it means' }), h('p', { text: k.think })),
        isNew ? h('p', { class: 'cu-added', svg: SQH.ICON.check + '<span>Goes in your notebook</span>' }) : null,
        h('div', { class: 'cu-actions' }, readBtn(() => `${k.name}. What we see: ${k.see} What Holmes thinks it means: ${k.think}`), back)));
    SQH.Speech.say(`${k.name}. ${k.see} ${k.think}`);
    dlg.showModal(); back.focus();
    return closed(dlg).then((v) => { SQH.Speech.stop(); return v; });
  };

  /* ---------------- the Solve panel ---------------- */
  Screens.solve = function () {
    if (!G.active || G.paused || SQH.Talk.open) return;
    const dlg = $('#dlg-solve');
    const body = sheet(dlg, 'Name the culprit', 'solve-title');
    let pick = null;
    const accuse = h('button', { class: 'btn btn--red', type: 'button', disabled: true, onclick: () => { const id = pick; dlg.close(); SQH.Play.accuse(id); } }, 'Accuse!');
    const list = h('ul', { class: 'answers', role: 'radiogroup', 'aria-label': 'Possible explanations' });
    G.answers.forEach((a, i) => {
      const out = G.ruled.has(a.id);
      const b = h('button', { class: 'answer' + (out ? ' is-out' : ''), type: 'button', role: 'radio', 'aria-checked': 'false', disabled: out },
        h('span', { class: 'answer__mark', text: 'ABCDE'[i] }),
        h('span', {}, h('span', { class: 'answer__text', text: a.text }), out ? h('span', { class: 'answer__out', text: 'Ruled out' }) : null));
      b.addEventListener('click', () => {
        pick = a.id; SQH.Sound.tap();
        SQH.$$('.answer', list).forEach((x) => x.setAttribute('aria-checked', x === b ? 'true' : 'false'));
        accuse.disabled = false;
      });
      list.append(h('li', {}, b));
    });
    body.append(h('p', { class: 'brief__q', text: G.story.question }),
      h('p', { class: 'solve__note', text: 'Exactly one explanation fits ALL of the evidence. A wrong accusation adds 1:00 to your time.' }), list);
    dlg.append(h('div', { class: 'sheet__actions' }, h('button', { class: 'btn btn--paper', type: 'button', onclick: () => dlg.close() }, 'Keep investigating'), accuse));
    SQH.Sound.page();
    dlg.showModal();
    const first = list.querySelector('.answer:not(:disabled)'); if (first) first.focus();
  };

  /* ---------------- CASE CLOSED ---------------- */
  function chip(id) {
    const it = G.idx.get(id); if (!it) return null;
    const got = G.have.has(id);
    return h('span', { class: 'chip' + (it.type === 'deduction' ? ' chip--ded' : '') + (got ? '' : ' chip--missed'), svg: (got ? SQH.ICON.check : SQH.catIcon(it.cat)) + `<span></span>` }, null);
  }
  function chipEl(id) {
    const el = chip(id); if (!el) return null;
    const it = G.idx.get(id);
    el.querySelector('span').textContent = it.name + (G.have.has(id) ? '' : ' (missed)');
    return el;
  }
  Screens.closed = function () {
    const dlg = $('#dlg-closed'), c = G.c, story = G.story, tier = story.tier, T = SQH.TIERS[tier];
    const playMs = SQH.Timer.play, total = SQH.Timer.total;
    dlg.innerHTML = '';
    const inner = h('div', { class: 'closed__inner' });
    inner.append(h('h2', { class: 'stamp slam', id: 'closed-title', text: 'Case Closed' }), h('p', { class: 'closed__sub', text: `${story.title} · ${T.label} case` }));

    // 1. Holmes explains, one step at a time
    const steps = c.walkthrough || [];
    let n = 0;
    const stepNo = h('p', { class: 'explain__step' }), stepText = h('p', { class: 'explain__text' }), chips = h('div', { class: 'chips' });
    const next = h('button', { class: 'btn btn--violet', type: 'button' }, 'Next step ▸');
    const skip = h('button', { class: 'btn btn--paper', type: 'button' }, 'Skip to my time');
    const explain = h('section', { class: 'closed__sec' }, h('h3', { text: 'Holmes explains' }),
      h('div', { class: 'explain' }, h('span', { svg: SQH.Art.portraitSvg('holmes', 'smug') }), h('div', {}, stepNo, stepText, chips, h('div', { class: 'explain__nav' }, readBtn(() => stepText.textContent), skip, next))));
    function showStep() {
      const s = steps[n];
      stepNo.textContent = `STEP ${n + 1} OF ${steps.length}`;
      stepText.textContent = s.text; stepText.classList.remove('stepin'); void stepText.offsetWidth; stepText.classList.add('stepin');
      chips.innerHTML = ''; (s.uses || []).forEach((id) => { const e = chipEl(id); if (e) chips.append(e); });
      next.textContent = n === steps.length - 1 ? 'See my time ▸' : 'Next step ▸';
      SQH.Speech.say(s.text);
    }
    next.addEventListener('click', () => { SQH.Sound.page(); if (n < steps.length - 1) { n++; showStep(); } else reveal(); });
    skip.addEventListener('click', reveal);

    // 2. the red herrings, and the false theory on Hard
    const traps = h('section', { class: 'closed__sec', hidden: true }, h('h3', { text: 'Red herrings you had to see through' }));
    const tl = h('ul', { class: 'traps' });
    (c.traps || []).forEach((t) => { const it = G.idx.get(t.id); tl.append(h('li', {}, h('b', { text: it ? it.name : t.id }), h('span', { text: t.why }))); });
    if (c.falseTheory) {
      const a = c.answers.find((x) => x.id === c.falseTheory);
      const why = a && Object.values(a.ruledOutBy || {})[0];
      if (a) tl.append(h('li', {}, h('b', { text: 'The convincing false theory' }), h('span', { text: `"${a.text}" ${why ? 'But: ' + why : ''}` })));
    }
    traps.append(tl);

    // 3. time, initials and the Top 10
    const res = h('section', { class: 'closed__sec results', hidden: true }, h('h3', { text: 'Your time' }));
    const parts = [`Investigating ${SQH.fmt(playMs)}`];
    if (G.wrong) parts.push(`${G.wrong} wrong accusation${G.wrong > 1 ? 's' : ''} (+${SQH.fmt(G.wrong * SQH.PENALTY_WRONG)})`);
    if (G.hints) parts.push(`${G.hints} hint${G.hints > 1 ? 's' : ''} (+${SQH.fmt(G.hints * SQH.PENALTY_HINT)})`);
    res.append(h('div', { class: 'results__time', text: SQH.fmt(total) }), h('p', { class: 'results__sum', text: parts.join(' + ') }));
    const scoreArea = h('div', {});
    res.append(scoreArea);
    const actions = h('div', { class: 'closed__actions', hidden: true },
      h('button', { class: 'btn btn--violet', type: 'button', onclick: () => { dlg.close(); const nc = SQH.pickCase(tier); if (nc) SQH.Play.start(nc); } }, 'Another ' + T.label + ' case'),
      h('button', { class: 'btn btn--paper', type: 'button', onclick: () => { dlg.close(); Screens.pick(); } }, 'Choose a case'),
      h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => { dlg.close(); Screens.title(); } }, 'Main menu'));

    inner.append(explain, traps, res, actions);
    dlg.append(inner);
    dlg.oncancel = (e) => e.preventDefault();
    let revealed = false;
    function reveal() {
      if (revealed) return; revealed = true;
      explain.querySelector('.explain__nav').hidden = true;
      traps.hidden = false; res.hidden = false; actions.hidden = false;
      SQH.Scores.endFlow(scoreArea, tier, total, G.practice).then(() => {});
      res.scrollIntoView({ behavior: SQH.reduced() ? 'auto' : 'smooth', block: 'start' });
      const f = scoreArea.querySelector('input') || actions.querySelector('button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
    }
    if (steps.length) showStep(); else reveal();
    dlg.showModal();
    SQH.Sound.stamp();
    setTimeout(() => SQH.Sound.fanfare(), 420);
    next.focus();
    return Promise.resolve();
  };

  /* ---------------- pause ---------------- */
  Screens.pause = function () {
    const dlg = $('#dlg-pause');
    const body = sheet(dlg, 'Paused', 'pause-title');
    const tog = (label, get, flip) => {
      const b = h('button', { class: 'toggle', type: 'button', 'aria-pressed': get() ? 'true' : 'false' }, get() ? 'On' : 'Off');
      b.addEventListener('click', () => { flip(); b.setAttribute('aria-pressed', get() ? 'true' : 'false'); b.textContent = get() ? 'On' : 'Off'; SQH.syncMute(); });
      return h('div', { class: 'toggle-row' }, h('span', { text: label }), b);
    };
    body.append(h('p', { text: 'The clock is stopped. Take your time.' }),
      tog('Sound', () => SQH.Sound.on, () => SQH.Sound.toggle()));
    if (SQH.Speech.can) body.append(tog('Read everything aloud', () => SQH.Speech.on, () => { SQH.Speech.toggle(); SQH.syncSpeech(); if (SQH.Speech.on) SQH.Speech.speak('Reading aloud is on.'); }));
    const confirm = h('div', { class: 'sheet__actions', hidden: true },
      h('span', { text: 'Quit this case? Your time won\'t be saved.' }),
      h('button', { class: 'btn btn--red btn--sm', type: 'button', onclick: () => { dlg.close('quit'); if (dlg.finish) dlg.finish(); } }, 'Yes, quit'),
      h('button', { class: 'btn btn--paper btn--sm', type: 'button', onclick: () => { confirm.hidden = true; actions.hidden = false; } }, 'No'));
    const resume = h('button', { class: 'btn btn--violet', type: 'button', onclick: () => { dlg.close('resume'); if (dlg.finish) dlg.finish(); } }, 'Resume');
    const actions = h('div', { class: 'sheet__actions' },
      h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => Screens.howto() }, 'How to play'),
      h('button', { class: 'btn btn--paper', type: 'button', onclick: () => { actions.hidden = true; confirm.hidden = false; } }, 'Quit case'),
      resume);
    dlg.append(actions, confirm);
    dlg.returnValue = '';
    dlg.showModal(); resume.focus();
    return closed(dlg).then((v) => { if (v === 'quit') { SQH.Play.leave(); Screens.title(); } });
  };

  /* ---------------- Top 10, Logic Handbook, How to Play ---------------- */
  Screens.boards = function (tier) {
    const dlg = $('#dlg-info');
    const body = sheet(dlg, 'Top 10 detectives', 'info-title');
    let cur = tier || SQH.store.get('lastTier', 'easy');
    const tabs = h('div', { class: 'tabs', role: 'tablist' });
    const area = h('div', {});
    function load() {
      SQH.$$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', t.dataset.tier === cur ? 'true' : 'false'));
      area.innerHTML = ''; area.append(h('p', { class: 'board__empty', text: 'Loading...' }));
      SQH.Scores.load(cur).then((r) => { area.innerHTML = ''; area.append(SQH.Scores.table(r.list), SQH.Scores.note(r.offline)); });
    }
    SQH.TIER_ORDER.forEach((t) => tabs.append(h('button', { class: 'tab', type: 'button', role: 'tab', 'data-tier': t, onclick: () => { cur = t; load(); } }, `${SQH.TIERS[t].label} ${stars(SQH.TIERS[t].stars)}`)));
    body.append(h('p', { text: 'Fastest solves, with penalties included. One board for each level.' }), tabs, area);
    dlg.showModal(); load();
  };
  Screens.handbook = function () {
    const dlg = $('#dlg-info');
    const body = sheet(dlg, 'The Logic Handbook', 'info-title');
    body.append(h('p', { text: 'The thinking tools a detective (or a scientist, or a lawyer) uses. Every case in this game needs them.' }));
    HANDBOOK.forEach((t) => {
      const src = h('p', { class: 'term__src' }, 'Source: ');
      t.src.forEach(([label, url], i) => { if (i) src.append(', '); src.append(h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: label })); });
      body.append(h('div', { class: 'term' }, h('h3', { text: t.term }), h('p', { text: t.text }),
        t.quote ? h('p', { text: t.quote }) : null,
        h('p', { class: 'term__ex', text: 'In the game: ' + t.ex }), src));
    });
    dlg.showModal();
  };
  Screens.howto = function () {
    const dlg = $('#dlg-info');
    const wasOpen = dlg.open;
    const body = sheet(dlg, 'How to play', 'info-title');
    body.append(
      h('ol', {},
        h('li', { text: 'Pick a case: Easy, Medium or Hard. Each has several versions, so the culprit can change.' }),
        h('li', { text: 'Hear the briefing and read the question. The clock starts when you close it.' }),
        h('li', { text: 'Examine things in the room. A faint sparkle marks something worth a look. Close-ups show what you see (observation) and what it might mean (inference).' }),
        h('li', { text: 'A padlock means something is locked. Find the clue that opens it. Locked rooms open the same way.' }),
        h('li', { text: 'Question the people along the bottom of the screen.' }),
        h('li', { text: 'In the Notebook, pin two entries and press Connect. If they really link up, Holmes makes a Deduction. Wrong pairs cost nothing.' }),
        h('li', { text: 'Press Solve! and pick the one explanation that fits all the evidence. You need proof: if you can\'t prove it yet, Watson will say so with no penalty. A wrong answer adds 1:00, and Watson tells you which clue rules it out.' }),
        h('li', { text: 'Stuck? Ask Watson for a hint (+0:30).' })),
      h('h3', { text: 'Keyboard' }),
      h('p', { svg: '<kbd>Tab</kbd> moves between things to examine · <kbd>Enter</kbd> examines · <kbd>N</kbd> notebook · <kbd>S</kbd> solve · <kbd>1</kbd>–<kbd>3</kbd> rooms · <kbd>P</kbd> or <kbd>Esc</kbd> pause' }),
      h('h3', { text: 'Scores' }),
      h('p', { text: 'Your time is the investigation time plus penalties. The fastest ten on each level make the Top 10, saved with 3-letter initials only.' }));
    if (!wasOpen) dlg.showModal();
  };
})(window.SQH);
