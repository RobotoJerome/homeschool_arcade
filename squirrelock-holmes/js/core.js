/* Squirrelock Holmes — core: shared helpers, saving, sound, read-aloud, the case timer
   and the case registry. Every other file adds itself onto window.SQH. */
'use strict';
window.SQH = (function () {
  const SQH = {};
  const params = new URLSearchParams(location.search);
  SQH.params = params;
  SQH.debug = params.has('debug');
  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  SQH.reduced = () => !!(motionQuery && motionQuery.matches);

  /* ---------------- small helpers ---------------- */
  SQH.$ = (sel, root) => (root || document).querySelector(sel);
  SQH.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  SQH.shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  SQH.fmt = (ms) => { const s = Math.max(0, Math.floor((ms || 0) / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  SQH.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // Builds a DOM element. Text is always added as plain text. `svg` is only ever used
  // for the game's own drawings (never for case text or leaderboard names).
  SQH.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'svg') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) {
      const kids = [].concat(arguments[i]);
      kids.forEach((kid) => { if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); });
    }
    return el;
  };

  /* ---------------- saving (this browser only, safe if blocked) ---------------- */
  SQH.store = (function () {
    const KEY = 'squirrelockHolmes';
    let mem = {}, ok = false;
    try { localStorage.setItem('__sqh', '1'); localStorage.removeItem('__sqh'); ok = true; } catch (e) { ok = false; }
    const read = () => { if (!ok) return mem; try { const o = JSON.parse(localStorage.getItem(KEY)); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
    const write = (o) => { mem = o; if (!ok) return; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full or blocked */ } };
    return {
      get(k, d) { const o = read(); return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : d; },
      set(k, v) { const o = read(); o[k] = v; write(o); },
    };
  })();

  /* ---------------- sound (made by code, no audio files) ---------------- */
  SQH.Sound = (function () {
    let ctx = null, master = null, nbuf = null, rainNode = null, wantRain = false;
    let on = SQH.store.get('sound', true) !== false;
    function ac() {
      if (!on) return null;
      try {
        if (!ctx) {
          const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
          ctx = new C(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
          nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) { return null; }
      return ctx;
    }
    function tone(f, dur, o) {
      o = o || {}; const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur + 0.05);
    }
    function noise(dur, o) {
      o = o || {}; const c = ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0);
      const s = c.createBufferSource(); s.buffer = nbuf;
      const f = c.createBiquadFilter(); f.type = o.kind || 'bandpass'; f.frequency.value = o.freq || 1500; f.Q.value = o.q || 0.8;
      const g = c.createGain(); g.gain.setValueAtTime(o.vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    const arp = (notes, gap, dur, type, vol) => notes.forEach((f, i) => tone(f, dur, { type, vol, at: i * gap }));
    function startRain() {
      const c = ac(); if (!c || rainNode) return;
      const s = c.createBufferSource(); s.buffer = nbuf; s.loop = true;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
      const f2 = c.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 300;
      const g = c.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.035, c.currentTime + 1.5);
      s.connect(f); f.connect(f2); f2.connect(g); g.connect(master); s.start();
      rainNode = { s, g };
    }
    function stopRain() {
      if (!rainNode || !ctx) return;
      const n = rainNode; rainNode = null;
      try { n.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4); n.s.stop(ctx.currentTime + 0.5); } catch (e) { /* already stopped */ }
    }
    let lastType = 0;
    const S = {
      get on() { return on; },
      toggle() { on = !on; SQH.store.set('sound', on); if (on) { S.click(); if (wantRain) startRain(); } else stopRain(); return on; },
      rain(want) { wantRain = want; if (want && on) startRain(); else stopRain(); },
      click() { tone(1300, 0.04, { type: 'square', vol: 0.04 }); },
      tap() { noise(0.05, { vol: 0.25, freq: 2600 }); },
      hit() { noise(0.08, { vol: 0.45, freq: 900 }); tone(180, 0.12, { type: 'triangle', vol: 0.2, to: 90 }); arp([988, 1319], 0.05, 0.12, 'triangle', 0.08); },
      big() { noise(0.16, { vol: 0.6, freq: 500 }); tone(120, 0.25, { type: 'sawtooth', vol: 0.12, to: 50 }); arp([784, 988, 1319, 1568], 0.05, 0.16, 'square', 0.05); },
      locked() { tone(220, 0.09, { type: 'square', vol: 0.07 }); tone(160, 0.14, { type: 'square', vol: 0.07, at: 0.08 }); },
      unlock() { noise(0.05, { vol: 0.3, freq: 3200 }); tone(1046, 0.08, { type: 'square', vol: 0.06, at: 0.05 }); tone(1568, 0.14, { type: 'square', vol: 0.06, at: 0.12 }); },
      page() { noise(0.18, { vol: 0.18, freq: 3500, q: 0.5 }); },
      pin() { tone(1760, 0.05, { type: 'triangle', vol: 0.08 }); },
      deduce() { noise(0.35, { vol: 0.35, freq: 1200, q: 0.4 }); arp([392, 523, 659, 784, 1047], 0.06, 0.22, 'square', 0.07); tone(1568, 0.5, { type: 'triangle', vol: 0.1, at: 0.32 }); },
      nope() { tone(330, 0.12, { type: 'triangle', vol: 0.1 }); tone(262, 0.18, { type: 'triangle', vol: 0.1, at: 0.1 }); },
      wrong() { noise(0.18, { vol: 0.4, freq: 300 }); tone(196, 0.35, { type: 'sawtooth', vol: 0.09, to: 82 }); tone(147, 0.4, { type: 'square', vol: 0.06, at: 0.12, to: 70 }); },
      hint() { arp([659, 880], 0.08, 0.2, 'triangle', 0.09); },
      stamp() { noise(0.3, { vol: 0.8, freq: 220, kind: 'lowpass' }); tone(70, 0.4, { type: 'sine', vol: 0.4, to: 40 }); },
      fanfare() { arp([392, 523, 659, 784, 659, 784, 1047], 0.11, 0.24, 'square', 0.07); arp([131, 196, 262], 0.22, 0.5, 'triangle', 0.14); },
      type() { const n = performance.now(); if (n - lastType < 55) return; lastType = n; tone(1900 + Math.random() * 300, 0.02, { type: 'square', vol: 0.012 }); },
    };
    return S;
  })();

  /* ---------------- read-aloud (the device's own voice) ----------------
     speak(text) always reads (the "Read aloud" buttons). say(text) reads only when
     "Read everything aloud" is switched on (title screen or pause menu). */
  SQH.Speech = (function () {
    const synth = window.speechSynthesis;
    const can = !!synth && typeof window.SpeechSynthesisUtterance === 'function';
    let auto = can && SQH.store.get('speech', false) === true, timer = null, voice = null;
    // Prefer a voice built into the device (it works offline and doesn't cut off long lines).
    function pickVoice() {
      try {
        const en = (synth.getVoices() || []).filter((v) => /^en([-_]|$)/i.test(v.lang));
        voice = en.find((v) => v.localService && /GB/i.test(v.lang)) || en.find((v) => v.localService) || en.find((v) => /GB/i.test(v.lang)) || en[0] || null;
      } catch (e) { voice = null; }
    }
    if (can) { pickVoice(); try { synth.addEventListener('voiceschanged', pickVoice); } catch (e) { /* older browsers */ } }
    // Short pieces, one sentence or so each, so no voice stops partway through.
    function pieces(text) {
      const parts = String(text).replace(/["“”]/g, '').match(/[^.!?]+[.!?]*\s*/g) || [String(text)];
      const out = [];
      parts.forEach((p) => { const t = p.trim(); if (!t) return; if (out.length && (out[out.length - 1] + ' ' + t).length < 160) out[out.length - 1] += ' ' + t; else out.push(t); });
      return out;
    }
    function speak(text) {
      if (!can || !text) return;
      try {
        clearTimeout(timer);
        const go = () => {
          if (!voice) pickVoice();
          try { synth.resume(); } catch (e) { /* not paused */ }
          pieces(text).forEach((t) => { const u = new SpeechSynthesisUtterance(t); if (voice) { u.voice = voice; u.lang = voice.lang; } u.rate = 0.98; synth.speak(u); });
        };
        // Some browsers drop speech that starts right after a cancel, so wait a moment.
        if (synth.speaking || synth.pending) { synth.cancel(); timer = setTimeout(go, 180); } else go();
      } catch (e) { /* no voice on this device */ }
    }
    return {
      can,
      get on() { return auto; },
      toggle() { auto = can && !auto; SQH.store.set('speech', auto); if (!auto) this.stop(); return auto; },
      say(text) { if (auto) speak(text); },
      speak,
      stop() { clearTimeout(timer); try { if (synth) synth.cancel(); } catch (e) { /* ignore */ } },
    };
  })();

  /* ---------------- the case timer (penalties added on top) ---------------- */
  SQH.Timer = (function () {
    let base = 0, since = 0, running = false, pen = 0;
    return {
      reset() { base = 0; since = 0; running = false; pen = 0; },
      start() { if (!running) { since = performance.now(); running = true; } },
      pause() { if (running) { base += performance.now() - since; running = false; } },
      get running() { return running; },
      add(ms) { pen += ms; },
      get play() { return base + (running ? performance.now() - since : 0); },
      get penalty() { return pen; },
      get total() { return this.play + pen; },
    };
  })();
  SQH.PENALTY_WRONG = 60000;
  SQH.PENALTY_HINT = 30000;

  /* ---------------- the cast and the case registry ---------------- */
  SQH.CAST = {
    holmes: { name: 'Squirrelock Holmes', short: 'Holmes' },
    watson: { name: 'Dr. Walnut Watson', short: 'Watson' },
    nutson: { name: 'Mrs. Nutson', short: 'Mrs. Nutson' },
    gnawriarty: { name: 'Professor Gnawriarty', short: 'the Professor' },
  };
  SQH.TIERS = {
    easy: { label: 'Easy', stars: 1, rooms: 1, clues: [6, 8], herrings: [1, 1], depth: 1, deductions: [0, 1], target: '3 to 5 minutes' },
    medium: { label: 'Medium', stars: 2, rooms: 2, clues: [10, 14], herrings: [2, 3], depth: 2, deductions: [2, 99], target: '6 to 10 minutes' },
    hard: { label: 'Hard', stars: 3, rooms: 3, clues: [16, 22], herrings: [4, 5], depth: 3, deductions: [3, 99], target: '12 to 20 minutes', timeline: true, falseTheory: true },
  };
  SQH.TIER_ORDER = ['easy', 'medium', 'hard'];
  SQH.CATS = {
    physical: { label: 'Physical Evidence', one: 'Physical evidence' },
    testimony: { label: 'Testimony', one: 'Testimony' },
    document: { label: 'Documents', one: 'Document' },
    deduction: { label: 'Deductions', one: 'Deduction' },
  };
  SQH.KINDS = {
    deductive: { label: 'Deductive', note: 'Certain: if the clues are true, this has to be true.' },
    inductive: { label: 'Inductive', note: 'Likely: the best explanation for a pattern, but not certain.' },
    elimination: { label: 'Ruling out', note: 'Crosses a possibility off the list.' },
    timeline: { label: 'Timeline check', note: 'Lines up times and distances to see what was possible.' },
    alibi: { label: 'Alibi check', note: 'Tests where someone says they were.' },
  };

  // Small icons (shape + words always go together, never color alone).
  const ic = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  SQH.ICON = {
    check: ic('M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z'),
    lock: ic('M12 2a5 5 0 0 0-5 5v3H5v12h14V10h-2V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z'),
    talk: ic('M4 4h16v12H8l-4 4V4Z'),
    look: ic('M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z'),
    doc: ic('M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 12h10v2H8v-2Zm0 4h10v2H8v-2Z'),
    bulb: ic('M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Zm-3 17h6v1.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5V19Z'),
    star: ic('M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z'),
    cross: ic('M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z'),
    trap: ic('M12 2 1 21h22L12 2Zm1 15h-2v2h2v-2Zm0-8h-2v6h2V9Z'),
  };
  SQH.catIcon = (cat) => ({ physical: SQH.ICON.look, testimony: SQH.ICON.talk, document: SQH.ICON.doc, deduction: SQH.ICON.bulb })[cat] || SQH.ICON.look;

  SQH.stories = {};
  SQH.cases = [];
  SQH.addStory = (s) => { SQH.stories[s.id] = s; };
  SQH.addCase = (c) => { SQH.cases.push(c); };
  SQH.tierOf = (c) => (SQH.stories[c.story] ? SQH.stories[c.story].tier : null);
  SQH.casesFor = (tier) => SQH.cases.filter((c) => SQH.tierOf(c) === tier);
  SQH.storyFor = (tier) => Object.values(SQH.stories).find((s) => s.tier === tier) || null;
  // Picks a random version of the tier's story, never the one played last time.
  SQH.pickCase = function (tier) {
    const list = SQH.casesFor(tier);
    if (!list.length) return null;
    const last = SQH.store.get('last.' + tier, null);
    const pool = list.length > 1 ? list.filter((c) => c.id !== last) : list;
    const c = pool[Math.floor(Math.random() * pool.length)];
    SQH.store.set('last.' + tier, c.id);
    return c;
  };
  SQH.person = function (id, story) {
    const s = story && (story.suspects || []).find((p) => p.id === id);
    return s || SQH.CAST[id] || { id, name: id, short: id };
  };

  // Loads data files one after another (plain <script> tags, so it also works when the page is double-clicked).
  SQH.loadScripts = function (files, done) {
    let i = 0; const failed = [];
    (function next() {
      if (i >= files.length) { done(failed); return; }
      const src = files[i++];
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = next;
      s.onerror = () => { failed.push(src); next(); };
      document.head.appendChild(s);
    })();
  };

  return SQH;
})();
