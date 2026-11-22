/* Rocket Builder — art: every picture is made here from code (pixel sprites, planet tiles, the rocket). */
'use strict';
(function (RB) {
  const U = RB.U;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  RB.mk = mk;

  // A little pixel grid we can paint into, then turn into a canvas.
  class Pix {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
    set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
    get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.d[y * this.w + x] : null; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
    // shaded lumpy oval, lit from the top-left. cols = [mid, dark, light]
    blob(cx, cy, rx, ry, cols, r, rough) {
      rough = rough == null ? 0.18 : rough;
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
        if (d < 1 + (r() - 0.5) * rough) {
          const l = -(dx * 0.55 + dy * 0.85) * 0.5 + (r() - 0.5) * 0.28;
          this.set(x, y, l > 0.22 ? cols[2] : l < -0.24 ? cols[1] : cols[0]);
        }
      }
    }
    outline(c) {
      const src = this.d.slice();
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
        if (src[y * this.w + x]) continue;
        const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < this.w && yy < this.h && src[yy * this.w + xx];
        if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) this.set(x, y, c);
      }
    }
    canvas() {
      const c = mk(this.w, this.h), g = c.getContext('2d');
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const v = this.d[y * this.w + x]; if (v) { g.fillStyle = v; g.fillRect(x, y, 1, 1); } }
      return c;
    }
  }
  RB.Pix = Pix;

  function sprite(rows, pal) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length)), p = new Pix(w, h);
    rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const col = pal[row[x]]; if (col) p.set(x, y, col); } });
    return p.canvas();
  }
  function flip(c) { const o = mk(c.width, c.height), g = o.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return o; }
  RB.sprite = sprite; RB.flip = flip;

  // ---------------- the little space explorer ----------------
  const PP = { o: '#1d1b33', w: '#f2f4fa', g: '#a9b0c9', v: '#2d8fe0', V: '#bfe8ff', r: '#ff4d5e', y: '#ffd23f', b: '#565d80' };
  const TOP = ['......oooo......', '....oowwwwoo....', '...owwwwwwwwo...'];
  const BODY = {
    down: TOP.concat(['..owwvvvvvvwwo..', '..owvVVvvvvvwo..', '..owvVvvvvvvwo..', '..owwvvvvvvwwo..', '...owwwwwwwwo...',
      '..oooowwwwoooo..', '.owgowwrrwwogwo.', '.owgowwwwwwogwo.', '.oooooyyyyooooo.', '....owwwwwwo....']),
    up: TOP.concat(['..owwwwwwwwwwo..', '..owwwwwwwwwwo..', '..owwwwwwwwwwo..', '..owwwwwwwwwwo..', '...owwwwwwwwo...',
      '..ooooggggoooo..', '.owgoggrrggogwo.', '.owgoggggggogwo.', '.oooooyyyyooooo.', '....owwwwwwo....']),
    side: TOP.concat(['..owwwwwvvvvo...', '..owwwwvVVvvo...', '..owwwwvVvvvo...', '..owwwwwvvvvo...', '...owwwwwwwwo...',
      '...ooggowwwoo...', '..oggggowwrwo...', '..oggggowwwwo...', '..ooooooyyyoo...', '....owwwwwo.....']),
  };
  const LEGS = {
    front: [['....owwoowwo....', '....obboobbo....', '....oooooooo....'], ['....owwoowwo....', '....ooooobbo....', '........oooo....'],
      ['....owwoowwo....', '....obbooooo....', '....oooo........']],
    side: [['.....owwwo......', '.....obbbo......', '.....ooooo......'], ['....owo.owo.....', '...obbo.obbo....', '...oooo.oooo....'],
      ['.....owwwo......', '.....obbbo......', '.....ooooo......']],
  };
  const SPR = RB.SPR = { player: {} };
  for (const dir of ['down', 'up', 'side']) {
    SPR.player[dir] = [0, 1, 2].map((f) => sprite(BODY[dir].concat(LEGS[dir === 'side' ? 'side' : 'front'][f]), PP));
  }
  SPR.player.right = SPR.player.side;
  SPR.player.left = SPR.player.side.map(flip);

  // ---------------- aliens (one kind per planet) ----------------
  const ALIEN_ROWS = [
    ['................', '................', '................', '......oooo......', '....ooallaoo....', '...oaaallaaao...',
      '..oaaaeeeeaaao..', '..oaaeeppeeaao..', '.oaaaeeppeeaaao.', '.oaaaaeeeeaaaao.', '.oaaaaaaaaaaaao.', '.oaaaammmmaaaao.',
      '.oaaaaaaaaaaaao.', '.oddaaaaaaaaddo.', '..oddddddddddo..', '...oooooooooo...'],
    ['................', '...l........l...', '...ol......lo...', '....ol.oo.lo....', '....oaoaaoao....', '...oaaaaaaaao...',
      '..oaaeeaaeeaao..', '.oaaaepaaepaaao.', '.oaaaeeaaeeaaao.', '.oaaaaaaaaaaaao.', '.oaaaaammaaaaao.', '.oaaaaaaaaaaaao.',
      '..oaaaaaaaaaao..', '..odaadaadaado..', '...oddoddoddo...', '....oo.oo.oo....'],
    ['................', '....o......o....', '....eo....oe....', '....po....op....', '.....oooooo.....', '...ooaallaaoo...',
      '..oaaaallaaaao..', '.oaaaaaaaaaaaao.', '.oadaadaadaadao.', '.oaaaaaaaaaaaao.', '..oaaammmmaaao..', '..oddddddddddo..',
      '.o.oooooooooo.o.', 'o..o..o..o..o..o', '...o..o..o..o...', '................'],
    ['................', '.....oooooo.....', '...ooaallaaoo...', '..oaaalllaaaao..', '.oaaaaaaaaaaaao.', '.oaaeeaaaaeeaao.',
      '.oaaepaaaaepaao.', '.oaaaaammaaaaao.', '.odaadaadaadado.', '..oooooooooooo..', '...oa.oa.ao.ao..', '...oa.oa.ao.ao..',
      '..oa..oa.ao..ao.', '..o...o...o...o.', '................', '................'],
  ];
  const ALIEN_PAL = [
    { o: '#1d2b1a', a: '#7bd34a', l: '#c4f58a', d: '#4f9a2e', e: '#ffffff', p: '#1d1b33', m: '#2d4a1f' },
    { o: '#2a3550', a: '#e9f4ff', l: '#8fd8ff', d: '#b2c8e2', e: '#1d1b33', p: '#ffffff', m: '#ff7fa6' },
    { o: '#2b120c', a: '#ff7a2f', l: '#ffd23f', d: '#c23d1a', e: '#ffffff', p: '#1d1b33', m: '#5a1a0c' },
    { o: '#2a1240', a: '#c86bff', l: '#f0c2ff', d: '#8a3fc2', e: '#ffffff', p: '#1d1b33', m: '#4a1a6a' },
  ];
  SPR.alien = ALIEN_ROWS.map((rows, i) => {
    const pal = ALIEN_PAL[i];
    const blink = rows.map((r) => (i === 2 ? r : r.replace(/[ep]/g, 'a')));
    return { open: sprite(rows, pal), blink: sprite(blink, pal), white: sprite(rows, Object.fromEntries(Object.keys(pal).map((k) => [k, '#ffffff']))) };
  });
  SPR.crown = sprite(['o.o.o.o', 'oyoyoyo', 'oyyyyyo', 'oyryyro', 'ooooooo'], { o: '#5a3a00', y: '#ffd23f', r: '#ff4d5e' });

  // ---------------- icons ----------------
  const IP = { o: '#1d1b33', w: '#f2f4fa', r: '#ff4d5e', y: '#ffd23f', b: '#3fa9f5', c: '#9ff3ff', g: '#a9b0c9', p: '#c86bff', k: '#ff8ae2' };
  const BOOT_TOP = ['...oooo.....', '...obbo.....', '...obbo.....', '...obbo.....', '...obbooo...', '...obbbbbo..', '...obbbbbbo.', '...oooooooo.'];
  const GUN = ['............', '............', '..oooooooo..', '.obbbbbbbboo', '.obwwbbbbbcc', '.obbbbbbbboo', '.oooobbooo..', '....obbo....', '....obbo....', '....oooo....', '............', '............'];
  SPR.icon = {
    speed: sprite(['............', '............', '.....oooo...', '....owwwwo..', '....owrrwo..', 'oo..owwwwoo.', '...owwwwwwwo', 'oooowrrrrwwo', '...owwwwwwwo', '..oyyyyyyyyo', '..oooooooooo', '............'], IP),
    spring: sprite(BOOT_TOP.concat(['....oyyyyo..', '.....oyyo...', '....oyyyyo..', '....oooooo..']), IP),
    rocket: sprite(BOOT_TOP.concat(['....oyyyyo..', '....oyrryo..', '.....orro...', '......oo....']), Object.assign({}, IP, { b: '#ff4d5e' })),
    laser1: sprite(GUN, Object.assign({}, IP, { b: '#ffd23f', w: '#fff6c2', c: '#ffffff' })),
    laser2: sprite(GUN, IP),
    laser3: sprite(GUN, Object.assign({}, IP, { b: '#c86bff', w: '#f0c2ff', c: '#ff8ae2' })),
    heart: sprite(['............', '.ooo....ooo.', 'orrro..orrro', 'orwrroorrrro', 'orwrrrrrrrro', 'orrrrrrrrrro', '.orrrrrrrro.', '..orrrrrro..', '...orrrro...', '....orro....', '.....oo.....', '............'], IP),
    magnet: sprite(['............', '..oooooooo..', '.orrrrrrrro.', 'orrroooorrro', 'orro....orro', 'orro....orro', 'orro....orro', 'owwo....owwo', 'owwo....owwo', 'oooo....oooo', '............', '............'], IP),
  };
  const HEART = ['.oo...oo.', 'orro.orro', 'orwrorrro', 'orrrrrrro', '.orrrrro.', '..orrro..', '...oro...', '....o....'];
  SPR.heart = sprite(HEART, IP);
  SPR.heartEmpty = sprite(HEART, { o: '#1d1b33', r: '#4a4766', w: '#4a4766' });
  const GEM = ['..oooo..', '.ollaao.', 'olaaaado', 'oaaaaddo', '.oaaddo.', '..oado..', '...oo...'];
  const GEM_COL = [['#ff5fa2', '#c2306f', '#ffc2dc'], ['#4fd6ff', '#1f8fc2', '#d2f6ff'], ['#ffd23f', '#d98a00', '#fff3b0'], ['#5dff9e', '#1fb860', '#d2ffe4']];
  SPR.gem = GEM_COL.map((c) => sprite(GEM, { o: '#1d1b33', a: c[0], d: c[1], l: c[2] }));
  SPR.gemHud = SPR.gem[1];

  // ---------------- planet looks ----------------
  const THEMES = RB.THEMES = [
    { id: 'sprout', bg: '#2f5f22', ground: ['#5fae3c', '#4f9a32', '#74c64c'], path: ['#c9a46a', '#b38955', '#dcb982'],
      hazard: ['#3a8fd6', '#2a6aa8', '#9ad6fa'], cliff: ['#8a7a62', '#5f5242', '#ab9a7c'], tint: null, ambient: 'pollen' },
    { id: 'frost', bg: '#9cb7d0', ground: ['#e4eef7', '#cddcea', '#ffffff'], path: ['#b5d6ec', '#98c1df', '#d4ecfa'],
      hazard: ['#4aa3d8', '#2f73a8', '#d0f0ff'], cliff: ['#8fb0cd', '#62849f', '#bcd6ea'], tint: null, ambient: 'snow' },
    { id: 'ember', bg: '#5a2a1a', ground: ['#b8613a', '#9c4f2e', '#cf7a4c'], path: ['#6a4a40', '#4f362f', '#80594d'],
      hazard: ['#ff6a1a', '#d23a12', '#ffd23f'], cliff: ['#4f3a33', '#33241f', '#6d5148'], tint: 'rgba(255,90,20,0.06)', ambient: 'embers' },
    { id: 'fungi', bg: '#241a38', ground: ['#4b3b6b', '#3d2f59', '#5d4b84'], path: ['#6e5a9a', '#5a4884', '#8b77ba'],
      hazard: ['#3ee0b0', '#1f9f80', '#c4fff0'], cliff: ['#30254a', '#211833', '#46385f'], tint: 'rgba(40,0,80,0.10)', ambient: 'spores' },
  ];

  // Obstacles and decorations for each planet, made with a fixed seed so they look the same every time.
  function makeThemeArt(ti) {
    const T = THEMES[ti], r = U.rng(500 + ti * 77), out = { tree: [], bush: [], rock: [], crack: [], crystal: [], decor: [], tall: [] };
    const C = ti === 3 ? ['#7a68a8', '#4e3f78', '#a08ed2'] : T.cliff;
    for (let v = 0; v < 3; v++) {
      // ----- trees -----
      let p = new Pix(22, 32);
      if (ti === 0) { // round leafy tree
        p.rect(9, 20, 4, 11, '#7a4f2e'); p.rect(11, 20, 2, 11, '#5a3820'); p.rect(8, 29, 6, 2, '#5a3820');
        const L = ['#3f9a35', '#2c7426', '#62c04c'];
        p.blob(11, 12, 9.5, 8.5, L, r); p.blob(6, 15, 5, 4.5, L, r); p.blob(16, 15, 5, 4.5, L, r);
        for (let k = 0; k < 4 + v; k++) { const x = 4 + Math.floor(r() * 14), y = 6 + Math.floor(r() * 12); if (p.get(x, y)) p.set(x, y, v === 1 ? '#ff4d5e' : '#8fe070'); }
        p.outline('#1d2b1a');
      } else if (ti === 1) { // snowy pine
        p.rect(10, 26, 3, 5, '#6a4a32');
        for (let tier = 0; tier < 3; tier++) {
          const top = 2 + tier * 7, hgt = 11;
          for (let j = 0; j < hgt; j++) {
            const hw = Math.floor(((j + 1) / hgt) * (5 + tier * 2.2));
            for (let i = -hw; i <= hw; i++) {
              const snow = j < 2 || (j < 4 && i < -hw + 2) || r() < 0.06;
              p.set(11 + i, top + j, snow ? (i < 0 ? '#ffffff' : '#dbe9f5') : i < -hw / 3 ? '#3f8a5f' : i > hw / 3 ? '#245c3e' : '#2f7350');
            }
          }
        }
        p.outline('#1b2e3a');
      } else if (ti === 2) { // desert cactus
        const Cc = ['#3f9a6a', '#2c7350', '#66c48e'];
        p.rect(8, 7, 6, 24, Cc[0]); p.rect(12, 7, 2, 24, Cc[1]); p.rect(8, 7, 2, 24, Cc[2]); p.rect(9, 5, 4, 2, Cc[0]);
        p.rect(3, 15, 5, 3, Cc[0]); p.rect(3, 9, 3, 7, Cc[0]); p.rect(3, 9, 1, 7, Cc[2]);
        if (v !== 1) { p.rect(14, 18, 4, 3, Cc[0]); p.rect(16, 12, 3, 7, Cc[0]); p.rect(18, 12, 1, 7, Cc[1]); }
        for (let y = 9; y < 30; y += 3) p.set(10 + (y % 2), y, '#1f5a3e');
        p.rect(10, 3, 2, 2, '#ff8ae2'); p.set(9, 4, '#ffd23f');
        p.outline('#2b120c');
      } else { // giant glowing mushroom
        const caps = [['#ff6fb5', '#c23d85', '#ffb3da'], ['#3ee0d0', '#1f9f9a', '#b5fff6'], ['#ffb347', '#d97a1a', '#ffe0a8']][v];
        p.rect(9, 16, 5, 15, '#efe4cf'); p.rect(12, 16, 2, 15, '#c9b99c'); p.rect(8, 29, 7, 2, '#c9b99c');
        p.blob(11, 11, 10.5, 7, caps, r, 0.08);
        for (let k = 0; k < 5; k++) { const x = 4 + Math.floor(r() * 14), y = 6 + Math.floor(r() * 8); if (p.get(x, y)) { p.set(x, y, '#ffffff'); p.set(x + 1, y, '#ffffff'); } }
        p.rect(4, 16, 15, 1, caps[1]);
        p.outline('#1a0f2a');
      }
      out.tree.push(p.canvas());
      // ----- bushes -----
      p = new Pix(16, 14);
      if (ti === 0) { p.blob(8, 8, 7, 5.5, ['#3f9a35', '#2c7426', '#62c04c'], r); for (let k = 0; k < 4; k++) p.set(3 + Math.floor(r() * 10), 4 + Math.floor(r() * 7), v === 2 ? '#ffffff' : '#ff4d5e'); p.outline('#1d2b1a'); }
      else if (ti === 1) { p.blob(8, 9, 7, 4.5, ['#eef6fc', '#c3d6e8', '#ffffff'], r); p.rect(6, 2, 2, 6, '#8fd8ff'); p.rect(9, 4, 2, 4, '#bfeaff'); p.outline('#2a3550'); }
      else if (ti === 2) { p.blob(8, 8, 7, 5.5, ['#8a5a3a', '#5f3a24', '#a8744e'], r); for (let k = 0; k < 3; k++) p.set(4 + Math.floor(r() * 8), 6 + Math.floor(r() * 5), '#ffb347'); p.outline('#2b120c'); }
      else { for (const [x, h, c] of [[4, 6, '#3ee0d0'], [8, 9, '#ff6fb5'], [12, 5, '#ffb347']]) { p.rect(x, 13 - h, 1, h, '#efe4cf'); p.blob(x + 0.5, 13 - h, 3, 2.2, [c, c, '#ffffff'], r, 0); } p.outline('#1a0f2a'); }
      out.bush.push(p.canvas());
      // ----- rocks -----
      p = new Pix(16, 13); p.blob(8, 7.5, 7, 5, [C[0], C[1], C[2]], r); p.outline('#1d1b33'); out.rock.push(p.canvas());
      // ----- cracked boulder (a strong laser can break it) -----
      p = new Pix(16, 18); p.blob(8, 9.5, 7.5, 8, [C[2], C[0], '#e8e2d8'], r, 0.1);
      let x = 8, y = 3; while (y < 16) { p.set(x, y, '#1d1b33'); y++; x += Math.floor(r() * 3) - 1; x = U.clamp(x, 4, 12); if (r() < 0.25) p.set(x + 1, y, '#1d1b33'); }
      p.set(4, 8, '#1d1b33'); p.set(5, 9, '#1d1b33'); p.set(11, 11, '#1d1b33'); p.set(12, 12, '#1d1b33');
      p.outline('#1d1b33'); out.crack.push(p.canvas());
      // ----- crystals -----
      p = new Pix(14, 20); const gc = GEM_COL[ti];
      for (const [cx, hgt, w] of [[7, 17, 3], [3, 9, 2], [11, 11, 2]]) {
        for (let j = 0; j < hgt; j++) { const hw = j < w ? j : w; for (let i = -hw; i <= hw; i++) p.set(cx + i, 19 - hgt + j, i < 0 ? gc[2] : i > 0 ? gc[1] : gc[0]); }
      }
      p.outline('#1d1b33'); out.crystal.push(p.canvas());
    }
    // ----- small ground decorations (no collision) -----
    const D = [];
    const dec = (rows, pal) => D.push(sprite(rows, pal));
    if (ti === 0) {
      dec(['.r.', 'ryr', '.r.', '.g.'], { r: '#ff4d5e', y: '#ffd23f', g: '#2c7426' });
      dec(['.w.', 'wyw', '.w.', '.g.'], { w: '#ffffff', y: '#ffd23f', g: '#2c7426' });
      dec(['.b.', 'byb', '.b.', '.g.'], { b: '#7fb2ff', y: '#ffffff', g: '#2c7426' });
      dec(['g.g', 'g.g', '.g.'], { g: '#3f8a2a' });
      dec(['.gg', 'gg.'], { g: '#89a080' });
    } else if (ti === 1) {
      dec(['.w.', 'wbw', '.w.'], { w: '#ffffff', b: '#8fd8ff' });
      dec(['b.b', '.b.'], { b: '#a9c8e2' });
      dec(['.gg.', 'gggg'], { g: '#b9cfe2' });
      dec(['g.g', 'g.g', '.g.'], { g: '#7a9a6a' });
    } else if (ti === 2) {
      dec(['.o.', 'ooo'], { o: '#5a3a2a' });
      dec(['.y.', 'yry', '.y.'], { y: '#ffb347', r: '#ff4d1a' });
      dec(['oo.', '.oo'], { o: '#7a4a30' });
      dec(['w.w', '.w.'], { w: '#e8d8c0' });
    } else {
      dec(['.c.', 'cwc', '.c.'], { c: '#3ee0d0', w: '#ffffff' });
      dec(['.p.', 'pwp', '.p.'], { p: '#ff6fb5', w: '#ffffff' });
      dec(['g.g', 'g.g', '.g.'], { g: '#7a5fb0' });
      dec(['.y.', 'y.y'], { y: '#c4ff6a' });
    }
    out.decor = D;
    // tall grass / ground cover tufts drawn on "," tiles
    const tallPal = [['#3f8a2a', '#62c04c'], ['#ffffff', '#c3d6e8'], ['#8a5a3a', '#ffb347'], ['#7a5fb0', '#3ee0d0']][ti];
    for (let v = 0; v < 3; v++) {
      const p = new Pix(16, 16);
      for (let k = 0; k < 7; k++) {
        const bx = 1 + Math.floor(r() * 14), by = 6 + Math.floor(r() * 9), hh = 2 + Math.floor(r() * 3);
        for (let j = 0; j < hh; j++) p.set(bx + (j === hh - 1 && r() < 0.5 ? 1 : 0), by - j, j === hh - 1 ? tallPal[1] : tallPal[0]);
      }
      out.tall.push(p.canvas());
    }
    return out;
  }
  RB.themeArt = THEMES.map((t, i) => makeThemeArt(i));

  // ---------------- crate that holds a rocket part ----------------
  function makeCrate(open, col) {
    const p = new Pix(16, 16);
    p.rect(1, 4, 14, 11, '#6d7391'); p.rect(2, 5, 12, 9, '#8d93b3'); p.rect(2, 5, 12, 1, '#b3b9d6');
    p.rect(1, 9, 14, 1, '#4a4f6a');
    if (open) { p.rect(2, 4, 12, 4, '#2a2d40'); p.rect(0, 0, 16, 3, '#8d93b3'); p.rect(0, 3, 16, 1, '#4a4f6a'); }
    else { p.rect(1, 2, 14, 3, '#a3a9c9'); p.rect(1, 2, 14, 1, '#c9cee6'); p.rect(6, 7, 4, 5, col); p.rect(7, 8, 2, 1, '#ffffff'); }
    for (const [x, y] of [[2, 13], [13, 13], [2, 6], [13, 6]]) p.set(x, y, '#4a4f6a');
    p.outline('#1d1b33');
    return p.canvas();
  }
  SPR.crate = THEMES.map((t, i) => makeCrate(false, GEM_COL[i][0]));
  SPR.crateOpen = makeCrate(true, '#000');

  // ---------------- planets (title + travel) ----------------
  const planetCache = {};
  RB.planet = function (ti, rad) {
    const key = ti + '|' + rad; if (planetCache[key]) return planetCache[key];
    const T = THEMES[ti], sz = rad * 2 + 2, c = mk(sz, sz), g = c.getContext('2d');
    const cols = [T.ground[1], T.ground[0], T.ground[2], T.hazard[0], T.hazard[1]];
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
      const dx = (x - rad) / rad, dy = (y - rad) / rad, d = dx * dx + dy * dy; if (d > 1) continue;
      const n = U.noise(x * 1.3, y * 1.3, rad / 3, 900 + ti), light = -(dx * 0.6 + dy * 0.6) * 0.5 + (1 - d) * 0.3;
      let col = n < 0.38 ? (light > 0.1 ? cols[3] : cols[4]) : light > 0.25 ? cols[2] : light < -0.15 ? cols[0] : cols[1];
      if (d > 0.86 && light < 0) col = '#1d1b33';
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    return (planetCache[key] = c);
  };

  // ---------------- the rocket ship ----------------
  RB.PARTS = [['nose', 'window', 'fins', 'engine'], ['antenna', 'boostL', 'boostR', 'stripe'], ['wingL', 'wingR', 'turbo', 'dish'], ['lights', 'ring', 'solar', 'star']];
  const shipC = mk(56, 72), sg = shipC.getContext('2d');
  // Draws the rocket into a small canvas; anchor (bottom middle) is at (28, 68).
  RB.shipCanvas = function (parts, t, opts) {
    opts = opts || {};
    const has = (id) => parts.has(id) || (opts.ghost && opts.ghost === id);
    sg.clearRect(0, 0, 56, 72);
    const X = 28, Y = 68;
    let cur = null;
    const blinkOn = opts.highlight && Math.floor(t * 6) % 2 === 0;
    const R = (x, y, w, h, c) => { sg.fillStyle = cur && cur === opts.highlight && blinkOn ? '#ffffff' : c; sg.fillRect(X + x, Y + y, w, h); };
    const part = (id, fn) => { if (has(id)) { cur = id; fn(); cur = null; } };
    const O = '#1d1b33', WH = '#f2f4fa', SH = '#c6cbe0', RD = '#ff4d5e', RDD = '#c2304a';
    // behind the body
    part('solar', () => { R(-21, -36, 8, 6, O); R(-20, -35, 6, 4, '#3f6fd6'); R(-17, -35, 1, 4, '#9fd0ff'); R(-13, -33, 7, 1, '#6d7391');
      R(13, -36, 8, 6, O); R(14, -35, 6, 4, '#3f6fd6'); R(17, -35, 1, 4, '#9fd0ff'); R(6, -33, 7, 1, '#6d7391'); });
    part('wingL', () => { for (let i = 0; i < 12; i++) R(-7 - Math.floor(i * 0.8) - 1, -22 + i, Math.floor(i * 0.8) + 1, 1, i === 11 ? '#d98a00' : '#ffd23f'); R(-17, -11, 10, 1, O); });
    part('wingR', () => { for (let i = 0; i < 12; i++) R(7, -22 + i, Math.floor(i * 0.8) + 1, 1, i === 11 ? '#d98a00' : '#ffd23f'); R(7, -11, 10, 1, O); });
    part('boostL', () => { R(-13, -27, 6, 20, O); R(-12, -26, 4, 18, WH); R(-10, -26, 2, 18, SH); R(-12, -29, 4, 3, RD); R(-11, -30, 2, 1, RD); R(-12, -8, 4, 2, '#6d7391'); });
    part('boostR', () => { R(7, -27, 6, 20, O); R(8, -26, 4, 18, WH); R(10, -26, 2, 18, SH); R(8, -29, 4, 3, RD); R(9, -30, 2, 1, RD); R(8, -8, 4, 2, '#6d7391'); });
    part('fins', () => { for (let i = 0; i < 10; i++) { const w = 1 + Math.floor(i / 2.5); R(-7 - w, -14 + i, w, 1, i > 7 ? RDD : RD); R(6, -14 + i, w, 1, i > 7 ? RDD : RD); } });
    // body
    R(-7, -34, 14, 29, O); R(-6, -34, 12, 28, WH); R(2, -34, 4, 28, SH); R(-6, -34, 1, 28, '#ffffff');
    if (!has('nose')) { for (let i = -6; i < 6; i++) if ((i + 7) % 3 !== 0) R(i, -35, 1, 1, O); R(-6, -34, 12, 1, '#8d93b3'); }
    part('nose', () => { for (let i = 0; i < 10; i++) { const hw = Math.max(1, 6 - Math.floor(i * 0.65)); R(-hw - 1, -35 - i, hw * 2 + 2, 1, O); R(-hw, -35 - i, hw * 2, 1, RD); R(Math.max(0, hw - 3), -35 - i, Math.min(3, hw), 1, RDD); } R(-1, -45, 2, 1, O); });
    part('stripe', () => { R(-6, -16, 12, 2, '#3fa9f5'); R(2, -16, 4, 2, '#2d7fc4'); });
    part('star', () => { R(-1, -13, 2, 5, '#ffd23f'); R(-3, -11, 6, 1, '#ffd23f'); R(-2, -10, 4, 1, '#ffd23f'); });
    if (has('window')) { R(-4, -28, 8, 8, O); R(-3, -27, 6, 6, '#2d8fe0'); R(-2, -27, 2, 2, '#bfe8ff'); R(1, -23, 2, 2, '#1f5fa0'); }
    else { R(-3, -27, 6, 6, '#8d93b3'); R(-1, -26, 1, 3, O); R(0, -24, 1, 2, O); }
    part('window', () => { if (opts.highlight === 'window' && blinkOn) R(-4, -28, 8, 8, '#fff'); });
    part('dish', () => { R(6, -31, 2, 1, '#6d7391'); R(8, -35, 1, 6, O); R(9, -36, 2, 8, '#d9dce8'); R(11, -33, 1, 2, RD); });
    part('lights', () => { const cs = ['#ff4d5e', '#ffd23f', '#5dff9e', '#3fa9f5']; for (let i = 0; i < 3; i++) R(-4 + i * 3, -19, 2, 2, cs[(i + Math.floor(t * 4)) % 4]); });
    part('ring', () => { const a = 0.5 + 0.5 * Math.sin(t * 5); R(-10, -21, 20, 2, '#c86bff'); R(-10, -21, 20, 1, a > 0.5 ? '#f0c2ff' : '#c86bff'); R(-11, -20, 1, 1, O); R(10, -20, 1, 1, O); });
    part('antenna', () => { const top = has('nose') ? -46 : -36; R(0, top - 6, 1, 6, '#6d7391'); R(-1, top - 8, 3, 2, Math.floor(t * 3) % 2 ? '#ff4d5e' : '#ffd23f'); });
    // engine
    part('engine', () => { R(-5, -6, 10, 4, O); R(-4, -6, 8, 3, '#6d7391'); R(-4, -6, 8, 1, '#8d93b3'); });
    part('turbo', () => { R(-6, -3, 12, 2, O); R(-5, -3, 10, 1, '#ff7a2f'); });
    if (!has('engine')) { R(-3, -6, 2, 1, O); R(1, -6, 3, 1, O); }
    if (opts.flame) {
      const big = has('turbo') ? 1.6 : 1, fl = 6 + Math.sin(t * 40) * 2;
      for (let i = 0; i < fl * big; i++) { const hw = Math.max(1, Math.round((4 - i / (2 * big)) * (has('turbo') ? 1.2 : 1))); R(-hw, -2 + i, hw * 2, 1, i < 3 ? '#ffffff' : i < 6 ? '#ffd23f' : '#ff7a2f'); }
    }
    return shipC;
  };
  RB.drawShip = function (g, x, y, parts, t, opts, scale) {
    const c = RB.shipCanvas(parts, t, opts); scale = scale || 1;
    g.drawImage(c, 0, 0, 56, 72, Math.round(x - 28 * scale), Math.round(y - 68 * scale), 56 * scale, 72 * scale);
  };

  // ---------------- simple shapes ----------------
  RB.box = function (g, x, y, w, h, fill, edge, shadow) { // chunky pixel panel with cut corners
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (shadow) { g.fillStyle = shadow; g.fillRect(x + 2, y + 2, w, h); }
    g.fillStyle = edge || '#1d1b33'; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
    g.fillStyle = fill; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  };
  RB.circle = function (g, cx, cy, rad, col) { // pixel circle (filled)
    g.fillStyle = col;
    for (let y = -rad; y <= rad; y++) { const w = Math.floor(Math.sqrt(rad * rad - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); }
  };
  RB.ring = function (g, cx, cy, rad, col) {
    g.fillStyle = col;
    for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; g.fillRect(Math.round(cx + Math.cos(t) * rad), Math.round(cy + Math.sin(t) * rad), 1, 1); }
  };
  RB.GEM_COL = GEM_COL;
})(window.RB);
