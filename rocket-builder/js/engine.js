/* Rocket Builder — engine: helpers, screen, pixel font, input, sound, music, speech, saving. */
'use strict';
window.RB = window.RB || {};
(function (RB) {
  // ---------------- helpers ----------------
  const U = RB.U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rnd: (a, b) => a + Math.random() * (b - a),
    ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)), // whole number a..b
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr;
    },
    rng(seed) { // repeatable random numbers
      let s = seed >>> 0;
      return function () {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    hash(x, y, s) {
      let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041);
      h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    },
    noise(x, y, scale, seed) { // smooth noise, 0..1
      const fx = x / scale, fy = y / scale, x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = U.hash(x0, y0, seed), b = U.hash(x0 + 1, y0, seed), c = U.hash(x0, y0 + 1, seed), d = U.hash(x0 + 1, y0 + 1, seed);
      return U.lerp(U.lerp(a, b, sx), U.lerp(c, d, sx), sy);
    },
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
    inRect: (x, y, r) => r && x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h,
  };

  // ---------------- screen ----------------
  // Everything is drawn on a small "pixel" canvas, then blown up with crisp square pixels.
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const view = document.createElement('canvas');
  const D = RB.D = { W: 384, H: 216, S: 1, safeB: 0, canvas, view, ctx: view.getContext('2d') };
  const safeProbe = document.getElementById('safe-probe');
  D.resize = function () {
    const dpr = window.devicePixelRatio || 1;
    // innerHeight is the part of the screen you can actually see (phone browser bars and system buttons left out)
    const cw = window.innerWidth, ch = window.innerHeight;
    const pw = Math.max(1, Math.round(cw * dpr)), ph = Math.max(1, Math.round(ch * dpr));
    canvas.width = pw; canvas.height = ph;
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    let s = ph > pw ? Math.floor(Math.min(pw / 256, ph / 400)) : Math.floor(Math.min(pw / 384, ph / 216));
    s = Math.max(1, s, Math.ceil(pw / 720), Math.ceil(ph / 480));
    D.S = s; D.W = Math.ceil(pw / s); D.H = Math.ceil(ph / s);
    view.width = D.W; view.height = D.H;
    D.ctx.imageSmoothingEnabled = false;
    // Space the phone needs at the bottom (gesture bar / buttons), in game pixels.
    const inset = safeProbe ? safeProbe.getBoundingClientRect().height : 0;
    D.safeB = Math.ceil((inset * dpr) / s);
  };
  // Bottom edge that on-screen buttons should stay above (keeps them clear of Android's buttons and swipe bar).
  D.bottom = () => D.H - D.safeB;
  D.present = function () {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(view, 0, 0, D.W, D.H, 0, 0, D.W * D.S, D.H * D.S);
  };
  D.toLogical = function (clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return { x: ((clientX - r.left) * (canvas.width / r.width)) / D.S, y: ((clientY - r.top) * (canvas.height / r.height)) / D.S };
  };
  window.addEventListener('resize', D.resize);
  window.addEventListener('orientationchange', () => setTimeout(D.resize, 250));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', D.resize);
  D.resize();

  // ---------------- pixel font (5x7) ----------------
  const GLYPHS = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
    C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
    E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
    I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
    K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 10001 11001 10101 10011 10001 10001',
    O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
    Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
    U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
    W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
    2: '01110 10001 00001 00010 00100 01000 11111', 3: '11111 00010 00100 00010 00001 10001 01110',
    4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
    6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
    8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
    '+': '00000 00100 00100 11111 00100 00100 00000', '-': '00000 00000 00000 11111 00000 00000 00000',
    '×': '00000 10001 01010 00100 01010 10001 00000', '÷': '00000 00100 00000 11111 00000 00100 00000',
    '=': '00000 00000 11111 00000 11111 00000 00000', '?': '01110 10001 00001 00010 00100 00000 00100',
    '!': '00100 00100 00100 00100 00100 00000 00100', '.': '00000 00000 00000 00000 00000 01100 01100',
    ',': '00000 00000 00000 00000 01100 00100 01000', ':': '00000 01100 01100 00000 01100 01100 00000',
    "'": '00100 00100 01000 00000 00000 00000 00000', '/': '00001 00010 00010 00100 01000 01000 10000',
    '(': '00010 00100 01000 01000 01000 00100 00010', ')': '01000 00100 00010 00010 00010 00100 01000',
    '<': '00010 00100 01000 10000 01000 00100 00010', '>': '01000 00100 00010 00001 00010 00100 01000',
    '♥': '00000 01010 11111 11111 01110 00100 00000', '★': '00100 00100 11111 01110 01110 01010 10001',
    '#': '01010 11111 01010 01010 01010 11111 01010', '%': '11001 11010 00010 00100 01000 01011 10011',
  };
  const G = {};
  for (const k in GLYPHS) G[k] = GLYPHS[k].split(' ').map((r) => r.split('').map(Number));
  const F = RB.F = { cache: new Map() };
  F.width = (text, s = 1) => { const n = [...String(text)].length; return n ? (n * 6 - 1) * s : 0; };
  F.height = (s = 1) => 7 * s;
  function renderText(text, s, color, outline, shadow) {
    const pad = outline ? 1 : 0, sh = shadow ? Math.max(1, Math.round(s / 2)) : 0;
    const w = F.width(text, s) + pad * 2 + sh, h = 7 * s + pad * 2 + sh;
    const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h);
    const g = c.getContext('2d');
    const paint = (ox, oy, col) => {
      g.fillStyle = col; let cx = ox;
      for (const ch of text) {
        const gl = G[ch] || G[ch.toUpperCase()];
        if (gl) for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (gl[y][x]) g.fillRect(cx + x * s, oy + y * s, s, s);
        cx += 6 * s;
      }
    };
    if (shadow) { paint(pad + sh, pad + sh, shadow); if (outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) paint(pad + sh + dx, pad + sh + dy, shadow); }
    if (outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) paint(pad + dx, pad + dy, outline);
    paint(pad, pad, color);
    return { c, pad };
  }
  // Draws text. opts: s (size), c (color), a ('left'|'center'|'right'), o (outline color), sh (shadow color)
  F.draw = function (g, text, x, y, opts) {
    opts = opts || {};
    text = String(text).toUpperCase();
    const s = opts.s || 1, col = opts.c || '#fff', o = opts.o || null, sh = opts.sh || null;
    const key = text + '|' + s + '|' + col + '|' + o + '|' + sh;
    let r = F.cache.get(key);
    if (!r) { if (F.cache.size > 400) F.cache.clear(); r = renderText(text, s, col, o, sh); F.cache.set(key, r); }
    const w = F.width(text, s);
    let dx = x;
    if (opts.a === 'center') dx = x - Math.floor(w / 2); else if (opts.a === 'right') dx = x - w;
    g.drawImage(r.c, Math.round(dx - r.pad), Math.round(y - r.pad));
    return w;
  };

  // ---------------- input ----------------
  const I = RB.I = { keys: {}, pressed: {}, events: [], touch: false, pointers: new Map() };
  const ACT = {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    fire: ['Space', 'KeyJ', 'KeyX', 'KeyZ'], ok: ['Enter', 'NumpadEnter', 'Space'], enter: ['Enter', 'NumpadEnter'], back: ['Escape', 'KeyP'], map: ['KeyM', 'Tab'],
    n1: ['Digit1', 'Numpad1'], n2: ['Digit2', 'Numpad2'], n3: ['Digit3', 'Numpad3'], n4: ['Digit4', 'Numpad4'],
  };
  I.down = (a) => ACT[a].some((k) => I.keys[k]);
  I.hit = (a) => ACT[a].some((k) => I.pressed[k]);
  const BLOCK = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);

  // ---- keep the page from zooming by accident ----
  // The game always resizes itself to fit the window, so zooming never helps and kids get stuck zoomed in.
  const ZOOM_KEYS = new Set(['Equal', 'Minus', 'NumpadAdd', 'NumpadSubtract']);
  const stop = (e) => { if (e.cancelable) e.preventDefault(); };
  // Ctrl + mouse wheel, and two-finger trackpad pinch (browsers report pinch as Ctrl + wheel)
  window.addEventListener('wheel', (e) => { if (e.ctrlKey || e.metaKey) stop(e); }, { passive: false });
  // Safari's trackpad and iPad pinch gestures
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((t) => document.addEventListener(t, stop, { passive: false }));
  // Touch screens: pinch, drag-to-scroll and double-tap zoom. (The game reads taps through pointer events, which still work.)
  document.addEventListener('touchmove', stop, { passive: false });
  canvas.addEventListener('touchstart', stop, { passive: false });
  canvas.addEventListener('touchend', stop, { passive: false });
  document.addEventListener('dblclick', stop);
  window.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + plus or minus would zoom the page. Ctrl/Cmd + 0 still works, to reset zoom if needed.
    if ((e.ctrlKey || e.metaKey) && ZOOM_KEYS.has(e.code)) { e.preventDefault(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!I.keys[e.code]) I.pressed[e.code] = true;
    I.keys[e.code] = true;
    if (BLOCK.has(e.code)) e.preventDefault();
    I.touch = false;
    RB.A.unlock();
  });
  window.addEventListener('keyup', (e) => { I.keys[e.code] = false; });
  window.addEventListener('blur', () => { I.keys = {}; I.pointers.clear(); });
  function pev(type, e) {
    const p = D.toLogical(e.clientX, e.clientY);
    const touch = e.pointerType !== 'mouse';
    if (type === 'down') { I.touch = touch; RB.A.unlock(); }
    if (type === 'down') I.pointers.set(e.pointerId, { x: p.x, y: p.y, sx: p.x, sy: p.y, role: null, touch });
    const ptr = I.pointers.get(e.pointerId);
    if (ptr && type === 'move') { ptr.x = p.x; ptr.y = p.y; }
    I.events.push({ type, id: e.pointerId, x: p.x, y: p.y, touch, ptr });
    if (type === 'up' || type === 'cancel') I.pointers.delete(e.pointerId);
  }
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } pev('down', e); });
  canvas.addEventListener('pointermove', (e) => pev('move', e));
  canvas.addEventListener('pointerup', (e) => { RB.A.unlock(); pev('up', e); }); // tablets only allow sound to start when a finger lifts
  canvas.addEventListener('pointercancel', (e) => pev('cancel', e));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  I.taps = () => I.events.filter((e) => e.type === 'down');
  I.endFrame = () => { I.pressed = {}; I.events.length = 0; };

  // ---------------- sound ----------------
  const A = RB.A = { ctx: null, sfxOn: true, musicOn: true, song: null, step: 0, nextT: 0 };
  A.unlock = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      A.ctx = new AC();
      A.master = A.ctx.createGain(); A.master.gain.value = 0.8; A.master.connect(A.ctx.destination);
      A.sfx = A.ctx.createGain(); A.sfx.gain.value = 0.55; A.sfx.connect(A.master);
      A.mus = A.ctx.createGain(); A.mus.gain.value = 0.32; A.mus.connect(A.master);
      A.nbuf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate);
      const d = A.nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      setInterval(schedule, 40);
    } catch (e) { A.ctx = null; }
  };
  function tone(f, d, type, v, f2, delay, dest, t0) {
    if (!A.ctx) return;
    const t = (t0 || A.ctx.currentTime) + (delay || 0);
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || A.sfx); o.start(t); o.stop(t + d + 0.02);
  }
  function noise(d, v, delay, freq, dest, t0) {
    if (!A.ctx) return;
    const t = (t0 || A.ctx.currentTime) + (delay || 0);
    const s = A.ctx.createBufferSource(); s.buffer = A.nbuf;
    const fl = A.ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = freq || 2000;
    const g = A.ctx.createGain(); g.gain.setValueAtTime(v || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(dest || A.sfx); s.start(t); s.stop(t + d + 0.02);
  }
  const arp = (notes, gap, d, type, v) => notes.forEach((f, i) => tone(f, d, type, v, null, i * gap));
  const SFX = {
    click: () => tone(660, 0.06, 'square', 0.12),
    laser: () => tone(1200, 0.14, 'square', 0.12, 300),
    laser2: () => { tone(900, 0.16, 'sawtooth', 0.1, 200); tone(1500, 0.12, 'square', 0.07, 500, 0.03); },
    laser3: () => { tone(500, 0.3, 'sawtooth', 0.12, 1800); tone(250, 0.3, 'square', 0.08, 900, 0.03); },
    zapHit: () => { noise(0.12, 0.22, 0, 1800); tone(220, 0.12, 'square', 0.12, 80); },
    correct: () => arp([523, 659, 784, 1047], 0.07, 0.13, 'square', 0.11),
    wrong: () => { tone(220, 0.18, 'sawtooth', 0.1, 150); tone(150, 0.25, 'square', 0.08, 110, 0.12); },
    gem: () => { tone(1319, 0.07, 'square', 0.09); tone(1760, 0.12, 'square', 0.09, null, 0.06); },
    power: () => arp([392, 523, 659, 784, 1047, 1319], 0.08, 0.16, 'square', 0.1),
    part: () => { arp([523, 659, 784, 1047, 784, 1047], 0.09, 0.18, 'square', 0.1); arp([262, 330, 392], 0.18, 0.3, 'triangle', 0.15); },
    hurt: () => { tone(300, 0.22, 'square', 0.14, 90); noise(0.15, 0.12, 0, 1200); },
    alienZap: () => tone(500, 0.2, 'sawtooth', 0.09, 1500),
    hop: () => tone(300, 0.18, 'square', 0.1, 700),
    land: () => noise(0.06, 0.1, 0, 600),
    lock: () => { tone(880, 0.08, 'square', 0.1); tone(1320, 0.1, 'square', 0.1, null, 0.07); },
    open: () => { noise(0.2, 0.15, 0, 900); arp([392, 523, 784], 0.06, 0.12, 'square', 0.1); },
    tink: () => tone(2200, 0.05, 'square', 0.07, 1500),
    crumble: () => { noise(0.4, 0.3, 0, 700); tone(120, 0.3, 'square', 0.1, 50); },
    heal: () => arp([659, 784, 988, 1319], 0.06, 0.12, 'triangle', 0.16),
    defeat: () => arp([880, 660, 440, 330, 660], 0.06, 0.1, 'square', 0.1),
    bubble: () => tone(500, 0.08, 'sine', 0.12, 800),
    launch: () => { noise(2.6, 0.22, 0, 500); tone(70, 2.6, 'sawtooth', 0.08, 300); },
    count: () => tone(784, 0.15, 'square', 0.1),
    go: () => tone(1175, 0.4, 'square', 0.12),
    win: () => { arp([523, 659, 784, 1047, 784, 1047, 1319], 0.12, 0.22, 'square', 0.1); arp([131, 165, 196, 262], 0.24, 0.4, 'triangle', 0.18); },
  };
  A.play = function (name) { if (!A.sfxOn || !A.ctx) return; try { SFX[name] && SFX[name](); } catch (e) { /* ignore */ } };

  // ---- music: tiny chiptune loops made from a seed (one per planet) ----
  const SONGS = {
    title: { bpm: 112, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, -3, 5, 7], seed: 7 },
    w0: { bpm: 118, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 5, 7, 0], seed: 11 },
    w1: { bpm: 100, root: 64, scale: [0, 3, 5, 7, 10], prog: [0, -4, 3, -2], seed: 19 },
    w2: { bpm: 128, root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 0, -2, 3], seed: 23 },
    w3: { bpm: 104, root: 59, scale: [0, 2, 4, 7, 9], prog: [0, 4, -3, 5], seed: 31 },
    space: { bpm: 88, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, -3, 7], seed: 41, soft: true },
    win: { bpm: 136, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 7, 0], seed: 3 },
  };
  function makeSong(def) {
    const r = U.rng(def.seed), phrase = () => {
      const out = []; let idx = 5 + Math.floor(r() * 3);
      for (let i = 0; i < 16; i++) {
        if (r() < (i % 2 ? 0.45 : 0.15)) { out.push(null); continue; }
        idx = U.clamp(idx + Math.floor(r() * 5) - 2, 2, 11); out.push(idx);
      }
      return out;
    };
    const a = phrase(), b = phrase(), a2 = a.slice(0, 12).concat(phrase().slice(12));
    const mel = a.concat(a2, b, a), sc = def.scale;
    const note = (i) => def.root + sc[i % sc.length] + 12 * Math.floor(i / sc.length) - 12;
    return { def, mel: mel.map((i) => (i == null ? null : note(i))) };
  }
  A.playMusic = function (id) {
    if (A.song && A.song.id === id) return;
    A.song = SONGS[id] ? Object.assign(makeSong(SONGS[id]), { id }) : null;
    A.step = 0; A.nextT = 0;
  };
  function schedule() {
    if (!A.ctx || !A.song || !A.musicOn) return;
    const def = A.song.def, sd = 60 / def.bpm / 2, now = A.ctx.currentTime;
    if (A.nextT < now) A.nextT = now + 0.05;
    while (A.nextT < now + 0.15) {
      const i = A.step % 64, chord = def.prog[Math.floor(i / 16)], t = A.nextT, f = (m) => 440 * Math.pow(2, (m - 69) / 12);
      const m = A.song.mel[i];
      if (m != null) tone(f(m + chord * 0), sd * 1.6, def.soft ? 'triangle' : 'square', def.soft ? 0.09 : 0.045, null, 0, A.mus, t);
      if (i % 8 === 0 || i % 8 === 3 || i % 8 === 4 || i % 8 === 6) {
        const bm = def.root - 24 + chord + (i % 8 === 4 ? 12 : i % 8 === 6 ? 7 : 0);
        tone(f(bm), sd * 1.4, 'triangle', 0.13, null, 0, A.mus, t);
      }
      if (!def.soft && i % 4 === 2) noise(0.03, 0.04, 0, 6000, A.mus, t);
      A.step++; A.nextT += sd;
    }
  }

  // ---------------- read aloud ----------------
  // Some browsers drop a sentence that starts right after another one is cut off,
  // so when something is still talking we stop it and wait a moment before speaking.
  let sayTimer = null;
  RB.speak = function (text) {
    try {
      const s = window.speechSynthesis; if (!s) return;
      clearTimeout(sayTimer);
      const say = () => { const u = new SpeechSynthesisUtterance(text); u.rate = 0.9; u.pitch = 1.1; s.speak(u); };
      if (s.speaking || s.pending) { s.cancel(); sayTimer = setTimeout(say, 150); } else say();
    } catch (e) { /* no speech on this device */ }
  };
  RB.canSpeak = 'speechSynthesis' in window;

  // ---------------- saving (this browser only) ----------------
  RB.store = {
    get(key) { try { const v = localStorage.getItem('rocketBuilder.' + key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem('rocketBuilder.' + key, JSON.stringify(val)); } catch (e) { /* storage blocked */ } },
    del(key) { try { localStorage.removeItem('rocketBuilder.' + key); } catch (e) { /* storage blocked */ } },
  };
})(window.RB);
