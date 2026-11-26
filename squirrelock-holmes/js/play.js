/* Squirrelock Holmes — playing a case: drawing the room and its clue hotspots, the people
   to question, examining clues, locks that open, connecting clues into deductions,
   Watson's hints, and judging an accusation. The rules themselves live in rules.js. */
'use strict';
(function (SQH) {
  const { $, h } = SQH, R = SQH.Rules;
  const G = SQH.G = { c: null, story: null, idx: new Map(), have: new Set(), room: null, open: new Set(), wrong: 0, hints: 0, ruled: new Set(), practice: false, active: false, paused: false, answers: [] };
  const Play = SQH.Play = {};
  const NOPE = [
    'Those two don\'t connect, Watson. Not yet, anyway.',
    'Interesting, but no. One tells us nothing about the other.',
    'No link there. Try a different pair.',
    'A tempting pair, but together they prove nothing.',
  ];
  let tickTimer = 0;

  /* ---------------- starting and leaving a case ---------------- */
  Play.start = function (c, opts) {
    opts = opts || {};
    G.c = c; G.story = SQH.stories[c.story]; G.idx = R.index(c);
    G.have = new Set(); G.wrong = 0; G.hints = 0; G.ruled = new Set();
    G.practice = !!opts.practice; G.active = false; G.paused = false; G.solved = false;
    G.answers = SQH.shuffle(c.answers);
    G.room = R.startRoom(c);
    G.open = openRooms();
    SQH.Timer.reset(); showTime();
    const T = SQH.TIERS[G.story.tier];
    $('#hud-case').textContent = G.story.title;
    $('#hud-tier').textContent = T.label + ' case' + (G.practice ? ' · practice run' : '');
    SQH.Notebook.reset();
    SQH.showScreen('case');
    // The briefing happens at 221B Oak Street; the clock starts when it closes.
    $('#room-tabs').innerHTML = ''; $('#hotspots').innerHTML = ''; $('#witnesses').innerHTML = ''; $('#witnesses').classList.remove('has-room');
    drawScene('oak-street', {}, []);
    SQH.Screens.briefing(G.story).then(() => {
      G.active = true;
      renderTabs(); goRoom(G.room, true);
      SQH.Timer.start(); SQH.Sound.rain(true);
      clearInterval(tickTimer); tickTimer = setInterval(showTime, 250);
      const first = $('#hotspots .hs'); if (first) first.focus({ preventScroll: true });
    });
  };
  Play.leave = function () {
    G.active = false; SQH.Timer.pause(); SQH.Sound.rain(false); SQH.Speech.stop();
    clearInterval(tickTimer);
    SQH.Notebook.close();
  };

  /* ---------------- timer ---------------- */
  function showTime() {
    const el = $('#timer-digits'), t = SQH.fmt(SQH.Timer.total);
    if (el.dataset.t === t) return;
    el.dataset.t = t; el.innerHTML = '';
    for (const ch of t) el.append(h('span', { class: ch === ':' ? '' : 'd', text: ch }));
    $('#timer').classList.toggle('is-paused', !SQH.Timer.running);
  }
  Play.showTime = showTime;
  Play.pause = function () {
    if (!G.active || G.paused) return;
    G.paused = true; SQH.Timer.pause(); showTime(); SQH.Sound.rain(false);
    SQH.Screens.pause().then(() => {
      G.paused = false;
      if (G.active) { SQH.Timer.start(); SQH.Sound.rain(true); showTime(); }
    });
  };

  /* ---------------- rooms ---------------- */
  function openRooms() { return new Set(G.story.rooms.map((r) => r.id).filter((id) => R.roomOpen(G.c, id, G.have))); }
  function roomName(id) { const r = G.story.rooms.find((x) => x.id === id); return r ? r.name : id; }
  Play.roomName = roomName;
  function renderTabs() {
    const nav = $('#room-tabs'); nav.innerHTML = '';
    if (G.story.rooms.length < 2) { nav.hidden = true; return; }
    nav.hidden = false;
    G.story.rooms.forEach((r, i) => {
      const open = G.open.has(r.id), p = R.progress(G.c, r.id, G.have);
      const b = h('button', {
        class: 'room-tab' + (open ? '' : ' is-locked'), type: 'button', 'data-room': r.id,
        'aria-current': r.id === G.room ? 'true' : 'false',
        'aria-label': `${r.name}${open ? `, ${p.found} of ${p.total} clues examined` : ', locked'}. Key ${i + 1}.`,
        onclick: () => tabClick(r.id),
      });
      if (!open) b.insertAdjacentHTML('beforeend', SQH.ICON.lock);
      b.append(h('span', { text: r.name }));
      b.append(h('span', { class: 'room-tab__count', text: open ? `${p.found}/${p.total}` : 'Locked' }));
      nav.append(b);
    });
  }
  function tabClick(id) {
    if (!G.active) return;
    if (!G.open.has(id)) {
      SQH.Sound.locked();
      const g = R.gate(G.c, id);
      SQH.Talk.play([{ who: 'watson', face: 'neutral', tag: 'Locked', text: (g && g.lock) || 'We can\'t get in there yet.' }], G.story);
      return;
    }
    if (id !== G.room) { SQH.Sound.tap(); goRoom(id); }
  }
  Play.goRoomByNumber = (n) => { const r = G.story && G.story.rooms[n - 1]; if (r && G.active) tabClick(r.id); };
  function goRoom(id) {
    G.room = id;
    const room = G.story.rooms.find((r) => r.id === id);
    const st = (G.c.roomState && G.c.roomState[id]) || {};
    drawScene(room.art, st, G.c.clues.filter((k) => k.room === id));
    $('#scene').setAttribute('aria-label', `Illustration of the ${room.name}.`);
    renderHotspots(); renderWitnesses(); renderTabs();
  }

  /* ---------------- drawing the scene ---------------- */
  // Props that rest on a table or the floor get a soft shadow underneath.
  const RESTING = new Set(['note', 'paper', 'receipt', 'letter', 'envelope', 'order', 'seal', 'box', 'book', 'pocketbook', 'knife', 'clay', 'crumpled', 'crumbs', 'acorns', 'feather', 'telegram', 'ticket', 'newspaper', 'blanket', 'form', 'sack', 'hatbox', 'twine', 'scarf', 'drips']);
  function propSvg(k, art) {
    if (k.cat === 'testimony' || k.draw === false || !SQH.Art.props[k.prop]) return '';
    const sp = art.spots[k.spot] || { x: 800, y: 450 };
    const [x, y] = k.at || [sp.x, sp.y];
    const s = (SQH.Art.propScale[k.prop] || 0.9) * (k.scale || 1);
    const shadow = RESTING.has(k.prop) ? `<ellipse cx="4" cy="36" rx="44" ry="10" fill="url(#k-ao)"/>` : '';
    return `<g class="prop" transform="translate(${x} ${y}) scale(${s})">${shadow}${SQH.Art.props[k.prop]}</g>`;
  }
  function drawScene(artId, state, clues) {
    const art = SQH.Art.rooms[artId];
    const scene = $('#scene');
    const finishAt = '<rect width="1600" height="900" fill="url(#k-shade-';
    let svg = SQH.Art.scene(artId, state);
    const props = clues.map((k) => propSvg(k, art)).join('');
    // props go under the room's final light and shadow layers
    const cut = svg.lastIndexOf(finishAt);
    svg = cut >= 0 ? svg.slice(0, cut) + props + svg.slice(cut) : svg + props;
    scene.innerHTML = svg;
    scene.classList.remove('fade-in'); void scene.getBoundingClientRect(); scene.classList.add('fade-in');
    const amb = $('#amb'); amb.innerHTML = '';
    (art.lights || []).forEach((L) => {
      const g = h('div', { class: 'amb__glow' + (L.fire ? ' amb__glow--fire' : '') + (L.cool ? ' amb__glow--cool' : '') });
      g.style.left = (L.x / 16) + '%'; g.style.top = (L.y / 9) + '%';
      g.style.width = (L.r * 2 / 16) + '%'; g.style.height = (L.r * 2 / 9) + '%';
      amb.append(g);
    });
    amb.append(h('div', { class: 'amb__haze' }));
  }

  /* ---------------- hotspots and people ---------------- */
  const hotspotRect = (k, art) => SQH.Art.hotspotRect(k, art);
  function renderHotspots(flashIds) {
    const wrap = $('#hotspots'); wrap.innerHTML = '';
    const room = G.story.rooms.find((r) => r.id === G.room), art = SQH.Art.rooms[room.art];
    const list = G.c.clues.filter((k) => k.room === G.room && k.cat !== 'testimony').map((k) => ({ k, r: hotspotRect(k, art) }));
    list.sort((a, b) => (a.r.x - b.r.x) || (a.r.y - b.r.y));
    list.forEach(({ k, r }, i) => {
      const found = G.have.has(k.id), locked = !found && R.clueLocked(G.c, k, G.have);
      const b = h('button', {
        class: `hs d${i % 5 + 1}` + (found ? ' is-found' : '') + (locked ? ' is-locked' : '') + (flashIds && flashIds.includes(k.id) ? ' is-new' : ''),
        type: 'button', 'data-id': k.id,
        'aria-label': k.name + (found ? ', examined' : locked ? ', locked' : ''),
        onclick: () => Play.inspect(k.id),
      }, h('span', { class: 'hs__glint' }), h('span', { class: 'hs__label', text: k.name + (locked ? ' (locked)' : '') }));
      if (found) b.append(h('span', { class: 'hs__badge', title: 'Examined', svg: SQH.ICON.check }));
      if (locked) b.append(h('span', { class: 'hs__badge', title: 'Locked', svg: SQH.ICON.lock }));
      b.style.left = (r.x / 16) + '%'; b.style.top = (r.y / 9) + '%';
      b.style.width = (r.w / 16) + '%'; b.style.height = (r.h / 9) + '%';
      b.style.zIndex = String(10 + Math.round(400000 / (r.w * r.h)));
      wrap.append(b);
    });
  }
  function renderWitnesses(flashIds) {
    const wrap = $('#witnesses'); wrap.innerHTML = ''; wrap.classList.add('has-room');
    const list = G.c.clues.filter((k) => k.room === G.room && k.cat === 'testimony');
    if (!list.length) return;
    wrap.append(h('span', { class: 'witnesses__label', text: 'Question:' }));
    list.forEach((k) => {
      const p = SQH.person(k.who, G.story), found = G.have.has(k.id), locked = !found && R.clueLocked(G.c, k, G.have);
      const topic = (k.name.split(': ')[1] || 'a question');
      const state = found ? SQH.ICON.check + '<span>Heard</span>' : locked ? SQH.ICON.lock + '<span>Later</span>' : SQH.ICON.star + '<span>New</span>';
      const b = h('button', {
        class: 'wit' + (found ? ' is-found' : locked ? ' is-locked' : ' is-new') + (flashIds && flashIds.includes(k.id) ? ' is-new-flash' : ''),
        type: 'button', 'data-id': k.id,
        'aria-label': `Question ${p.name} about ${topic}` + (found ? ', heard' : locked ? ', locked' : ''),
        onclick: () => Play.inspect(k.id),
      }, h('span', { svg: SQH.Art.portraitSvg(k.who, found ? k.face : 'neutral') }),
      h('span', { class: 'wit__txt' }, h('span', { class: 'wit__name', text: p.name }), h('span', { class: 'wit__topic', text: topic })),
      h('span', { class: 'wit__state', svg: state }));
      wrap.append(b);
    });
  }
  function refocus(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.focus({ preventScroll: true });
  }

  /* ---------------- examining things ---------------- */
  Play.inspect = function (id) {
    if (!G.active || G.paused) return;
    const k = G.idx.get(id);
    if (!R.clueReady(G.c, k, G.have)) {
      SQH.Sound.locked();
      SQH.Talk.play([{ who: 'watson', face: 'neutral', tag: 'Locked', text: k.lock || 'It\'s locked. Something else we find must open it.' }], G.story).then(() => refocus(id));
      return;
    }
    const isNew = !G.have.has(id);
    if (isNew) {
      const el = document.querySelector(`[data-id="${id}"]`), st = $('#stage').getBoundingClientRect();
      if (el && k.cat !== 'testimony') {
        const r = el.getBoundingClientRect();
        SQH.Fx.sparks((r.left + r.width / 2 - st.left) / st.width, (r.top + r.height / 2 - st.top) / st.height, !!k.big);
      }
      if (k.big) { SQH.Sound.big(); SQH.Fx.shake(true); } else SQH.Sound.hit();
    } else SQH.Sound.click();
    const caseNow = G.c;
    show(k, isNew).then(() => {
      if (G.c !== caseNow) return; // a different case started meanwhile
      if (isNew) addItem(id);
      refocus(id);
    });
  };
  function show(k, isNew) {
    if (k.cat === 'testimony') {
      return SQH.Talk.play([
        { who: k.who, face: k.face, text: k.see, tag: 'Testimony' },
        { who: 'holmes', face: 'suspicious', text: k.think, tag: 'Holmes infers', done: isNew ? 'Add to notebook' : 'Done' },
      ], G.story);
    }
    return SQH.Screens.closeup(k, isNew);
  }
  Play.reread = function (id) {
    const it = G.idx.get(id);
    if (!it) return;
    if (it.type === 'deduction') {
      SQH.Talk.play([{ who: 'holmes', face: 'smug', text: it.text, tag: 'Deduction: ' + ((SQH.KINDS[it.kind] || {}).label || '') }], G.story);
    } else show(it, false);
  };
  function addItem(id) {
    if (!G.idx.has(id) || G.have.has(id)) return;
    G.have.add(id);
    SQH.Notebook.add(id);
    const before = G.open;
    G.open = openRooms();
    const newRooms = [...G.open].filter((r) => !before.has(r));
    // locks that this just opened (in rooms we can get into)
    const opened = G.c.clues.filter((k) => !G.have.has(k.id) && (k.needs || []).includes(id) && R.clueReady(G.c, k, G.have)).map((k) => k.id);
    renderHotspots(opened); renderWitnesses(opened); renderTabs();
    if (newRooms.length) {
      SQH.Sound.unlock();
      newRooms.forEach((r) => { const t = document.querySelector(`.room-tab[data-room="${r}"]`); if (t) t.classList.add('is-new'); });
      SQH.Fx.toast('New room unlocked: ' + newRooms.map(roomName).join(', '));
    } else if (opened.length) {
      SQH.Sound.unlock();
      SQH.Fx.toast('Unlocked: ' + opened.map((x) => G.idx.get(x).name).join(', '));
    }
  }

  /* ---------------- connecting two clues ---------------- */
  Play.connect = function (a, b) {
    if (!G.active) return;
    const d = R.findDeduction(G.c, a, b);
    if (!d) {
      SQH.Sound.nope();
      SQH.Talk.play([{ who: 'holmes', face: 'neutral', text: NOPE[Math.floor(Math.random() * NOPE.length)] }], G.story);
      return;
    }
    if (G.have.has(d.id)) { SQH.Fx.toast('Already worked out: ' + d.name); return; }
    SQH.Sound.deduce();
    const kind = (SQH.KINDS[d.kind] || {}).label || 'Deduction', caseNow = G.c;
    SQH.Fx.banner('DEDUCTION!', kind.toUpperCase()).then(() =>
      SQH.Talk.play([{ who: 'holmes', face: 'smug', text: d.text, tag: 'New deduction: ' + kind }], G.story)
    ).then(() => { if (G.c === caseNow) addItem(d.id); });
  };

  /* ---------------- Watson's hint (+30 seconds) ---------------- */
  Play.hint = function () {
    if (!G.active || G.paused) return;
    const r = R.hint(G.c, G.have, G.room);
    let text;
    if (r.kind === 'done') {
      SQH.Talk.play([{ who: 'watson', face: 'smug', text: 'I believe we have everything we need, Holmes. Time to name the culprit!' }], G.story);
      return;
    }
    const k = G.idx.get(r.id);
    if (r.kind === 'look') {
      const room = G.story.rooms.find((x) => x.id === G.room), sp = SQH.Art.rooms[room.art].spots[k.spot];
      text = `Have a closer look at the ${(sp ? sp.label : 'room').toLowerCase()}, Holmes.`;
    } else if (r.kind === 'talk') text = `${SQH.person(k.who, G.story).name} might have something to tell us.`;
    else if (r.kind === 'connect') text = `What if we connect "${G.idx.get(r.part).name}" with something else in the notebook?`;
    else text = `I'd have a look around the ${roomName(r.room)}.`;
    G.hints++; SQH.Timer.add(SQH.PENALTY_HINT); SQH.Fx.penalty('+0:30'); showTime();
    SQH.Sound.hint();
    if (r.kind === 'look' || r.kind === 'talk') { const el = document.querySelector(`[data-id="${r.id}"]`); if (el) el.classList.add('is-new'); }
    SQH.Talk.play([{ who: 'watson', face: 'neutral', tag: 'Hint (+0:30)', text }], G.story);
  };

  /* ---------------- accusing ---------------- */
  Play.accuse = function (answerId) {
    if (!G.active) return Promise.resolve();
    const r = R.accuse(G.c, answerId, G.have);
    if (r.kind === 'solved') {
      G.active = false; G.solved = true; SQH.Timer.pause(); showTime(); clearInterval(tickTimer);
      SQH.Sound.rain(false); SQH.Notebook.close();
      return SQH.Screens.closed();
    }
    if (r.kind === 'unproven') {
      SQH.Sound.hint();
      const ready = r.missing.some((id) => { const it = G.idx.get(id); return it.type === 'deduction' && R.dedReady(it, G.have); });
      const anyClue = r.missing.some((id) => G.idx.get(id).type === 'clue') || r.missing.some((id) => { const it = G.idx.get(id); return it.type === 'deduction' && !R.dedReady(it, G.have); });
      const tip = ready && !anyClue ? 'Try connecting the clues in your notebook to prove it.' : 'There\'s still evidence out there that we haven\'t found.';
      return SQH.Talk.play([
        { who: 'watson', face: 'suspicious', tag: 'Not proven yet (no penalty)', text: 'That fits everything so far, Holmes... but a jury would want proof, and we can\'t prove it yet.' },
        { who: 'holmes', face: 'neutral', text: tip },
      ], G.story);
    }
    G.wrong++; G.ruled.add(answerId);
    SQH.Timer.add(SQH.PENALTY_WRONG); SQH.Fx.penalty('+1:00'); showTime();
    SQH.Sound.wrong(); SQH.Fx.shake(true);
    let text = r.line, tag = 'Wrong (+1:00)';
    if (r.refuter) tag += ' · Ruled out by: ' + G.idx.get(r.refuter).name;
    else text = 'Something rules that out, Holmes, but it isn\'t in our notebook yet.' + (r.room && G.open.has(r.room) ? ` I'd have another look around the ${roomName(r.room)}.` : ' Keep investigating.');
    return SQH.Fx.banner('NOT QUITE!', '+1:00 PENALTY', true).then(() => SQH.Talk.play([{ who: 'watson', face: 'shocked', tag, text }], G.story));
  };
})(window.SQH);
