/* Rocket Builder — the four planets: map layouts, what is hidden where, and a checker that proves every part can be reached. */
'use strict';
(function (RB) {
  const U = RB.U;
  // Map letters:  . ground   , tall grass   : path   = bridge   ~ water/lava/goo (hop over it with boots)
  //               # cliff    T tree   b bush   r rock   K crystal   X cracked boulder (a strong laser breaks it)   S ship
  RB.WALK = new Set(['.', ',', ':', '=']);
  RB.SOLID = new Set(['#', 'T', 'b', 'r', 'K', 'X', 'S', '~']);

  function Builder(def) {
    const W = def.w, H = def.h, g = [];
    for (let y = 0; y < H; y++) g.push(new Array(W).fill('.'));
    const B = { W, H, g, r: U.rng(def.seed), parts: [], powers: [], aliens: [], boss: null, gems: [], ship: null, start: null };
    B.in = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    B.get = (x, y) => (B.in(x, y) ? g[y][x] : '#');
    B.set = (x, y, c) => { if (B.in(x, y)) g[y][x] = c; };
    B.fill = (c) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y][x] = c; };
    B.rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) B.set(x + i, y + j, c); };
    const inEll = (x, y, cx, cy, rx, ry) => { if (rx <= 0 || ry <= 0) return false; const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy <= 1; };
    B.ell = (cx, cy, rx, ry, c) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (inEll(x, y, cx, cy, rx, ry)) B.set(x, y, c); };
    B.ring = (cx, cy, rx, ry, c, w) => {
      w = w || 1;
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (inEll(x, y, cx, cy, rx, ry) && !inEll(x, y, cx, cy, rx - w, ry - w)) B.set(x, y, c);
    };
    // 4-connected line so paths and rivers never leave diagonal gaps
    B.line = (x0, y0, x1, y1, c, w, fn) => {
      w = w || 1; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 || 1; let px = x0, py = y0;
      const plot = (x, y) => { const o = Math.floor((w - 1) / 2); for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) fn ? fn(x - o + i, y - o + j) : B.set(x - o + i, y - o + j, c); };
      for (let i = 0; i <= n; i++) {
        const x = Math.round(U.lerp(x0, x1, i / n)), y = Math.round(U.lerp(y0, y1, i / n));
        if (x !== px && y !== py) plot(x, py);
        plot(x, y); px = x; py = y;
      }
    };
    B.poly = (pts, c, w, fn) => { for (let i = 1; i < pts.length; i++) B.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, w, fn); };
    B.noise = (c, thr, x, y, w, h, scale, seed, on) => {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (U.noise(i, j, scale, seed) > thr && (!on || on.includes(B.get(i, j)))) B.set(i, j, c);
    };
    B.border = (c, t) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const d = Math.min(x, y, W - 1 - x, H - 1 - y);
        if (d < t || (d < t + 2 && U.hash(x, y, def.seed) < 0.45 - (d - t) * 0.2)) g[y][x] = c;
      }
    };
    B.scatter = (c, p, x, y, w, h, on) => { on = on || '.,'; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (on.includes(B.get(i, j)) && B.r() < p) B.set(i, j, c); };
    // walking path: clears anything in the way and builds bridges over water
    B.path = (pts, w) => B.poly(pts, null, w || 1, (x, y) => { if (!B.in(x, y)) return; const c = g[y][x]; g[y][x] = c === '~' || c === '=' ? '=' : c === '#' ? '#' : ':'; });
    // hidden trail: clears trees and bushes but leaves no visible path
    B.trail = (pts) => B.poly(pts, null, 1, (x, y) => { if (B.in(x, y) && 'Tbr,'.includes(g[y][x])) g[y][x] = '.'; });
    B.clear = (cx, cy, rad) => { for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) if (inEll(x, y, cx, cy, rad + 0.4, rad + 0.4) && 'TbrK,'.includes(B.get(x, y))) B.set(x, y, '.'); };
    const spot = (x, y) => { if (RB.SOLID.has(B.get(x, y)) && B.get(x, y) !== 'S') B.set(x, y, '.'); };
    B.ship = (x, y) => { B.clear(x, y - 1, 3); B.rect(x - 1, y - 1, 3, 2, 'S'); B.ship = { x, y }; };
    B.start = (x, y) => { spot(x, y); B.start = { x, y }; };
    B.part = (n, x, y) => { spot(x, y); B.clear(x, y, 1); B.parts.push({ n, x, y }); };
    B.power = (id, x, y) => { spot(x, y); B.clear(x, y, 1); B.powers.push({ id, x, y }); };
    B.alien = (x, y) => { spot(x, y); B.aliens.push({ x, y }); };
    B.aliensAt = (list) => list.forEach(([x, y]) => B.alien(x, y));
    B.bossAt = (x, y) => { B.clear(x, y, 1); B.boss = { x, y }; };
    B.gemsAt = (list) => list.forEach(([x, y]) => { spot(x, y); B.gems.push({ x, y }); });
    B.randomGems = (n) => {
      let tries = 0;
      while (n > 0 && tries++ < 4000) {
        const x = 3 + Math.floor(B.r() * (W - 6)), y = 3 + Math.floor(B.r() * (H - 6));
        if ('.,'.includes(g[y][x]) && Math.abs(x - B.ship.x) + Math.abs(y - B.ship.y) > 6 && !B.gems.some((q) => Math.abs(q.x - x) + Math.abs(q.y - y) < 4)) { B.gems.push({ x, y }); n--; }
      }
    };
    return B;
  }

  // ---------------- the planets ----------------
  RB.WORLD_DEFS = [
    { name: 'SPROUT', sub: 'PLUS MAKES MORE!', ex: { a: 2, b: 3, c: 5, cap: '2 AND 3 MORE MAKES 5' }, say: 'Welcome to Planet Sprout! Here we add. Plus makes more. 2 and 3 more makes 5. Find 4 rocket parts!', op: '+', seed: 101, w: 64, h: 44, alienHp: 2, bossHp: 5,
      build(B) {
        B.noise(',', 0.6, 0, 0, 64, 44, 5, 11);
        B.noise('T', 0.6, 0, 0, 64, 44, 6, 12, '.,');
        B.border('T', 2);
        B.noise('T', 0.4, 3, 13, 17, 22, 3, 13, '.,');               // thick west forest
        B.poly([[43, 0], [42, 9], [44, 18], [42, 28], [44, 36], [43, 44]], '~', 2); // river (use the bridges)
        B.ell(54, 23, 4, 2.5, '~');                                  // pond
        B.ell(28, 35, 6, 4.5, '.'); B.ring(28, 35, 3.5, 2.5, '~');   // little island: hop over with Spring Boots
        B.ell(53, 10, 8, 6, '.'); B.ring(53, 10, 8, 6, 'b');          // bush ring around the boss
        B.scatter('r', 0.02, 3, 3, 58, 38); B.scatter('b', 0.02, 3, 3, 58, 38);
        B.ell(28, 35, 2.4, 1.4, '.');
        B.path([[32, 23], [32, 28], [24, 31], [14, 35], [11, 37]]);
        B.path([[31, 18], [24, 15], [16, 11], [12, 10]]);
        B.path([[34, 21], [40, 22], [48, 26], [52, 31], [55, 33]]);
        B.path([[33, 17], [38, 13], [44, 10], [47, 10]]);
        B.rect(44, 9, 3, 3, '.');
        B.trail([[16, 12], [13, 17], [10, 22], [7, 26]]);
        B.clear(12, 10, 3); B.clear(7, 26, 2); B.clear(11, 37, 3); B.clear(55, 33, 3); B.clear(32, 21, 2);
        B.ship(32, 20); B.start(32, 22);
        B.part(1, 12, 9); B.part(2, 10, 38); B.part(3, 28, 35); B.part(4, 57, 10);
        B.power('speed', 7, 26); B.power('spring', 56, 34);
        B.aliensAt([[20, 14], [22, 30], [15, 33], [37, 30], [38, 12], [50, 22], [57, 39], [26, 7], [36, 26]]);
        B.bossAt(52, 10);
        B.gemsAt([[28, 34], [5, 22], [6, 30], [59, 5], [60, 40]]);
        B.randomGems(16);
      } },
    { name: 'FROST', sub: 'MINUS MAKES LESS!', ex: { a: 5, b: 2, c: 3, cap: '5 TAKE AWAY 2 LEAVES 3' }, say: 'Welcome to Planet Frost! Here we subtract. Minus makes less. 5 take away 2 leaves 3. Find 4 rocket parts!', op: '-', seed: 202, w: 64, h: 44, alienHp: 4, bossHp: 8,
      build(B) {
        B.noise(',', 0.62, 0, 0, 64, 44, 5, 21);
        B.noise('T', 0.6, 0, 0, 64, 44, 6, 22, '.,');
        B.border('T', 2);
        B.rect(24, 2, 18, 13, '#'); B.rect(29, 4, 8, 9, '.'); B.rect(32, 13, 2, 2, 'X');   // ice canyon (break the boulders)
        B.rect(46, 16, 9, 7, '#'); B.rect(47, 17, 7, 5, '.'); B.set(46, 19, 'X');          // secret room
        B.rect(4, 3, 14, 9, '#'); B.rect(6, 5, 10, 5, '.'); B.rect(10, 10, 2, 2, '.');     // ice cave
        B.ell(36, 28, 6, 3.5, '~');                                                         // frozen lake
        B.poly([[44, 43], [44, 31], [52, 31], [52, 29], [63, 29]], '~', 1);                 // icy stream (hop it)
        B.ell(54, 9, 7, 5, '.'); B.ring(54, 9, 7, 5, 'T'); B.rect(46, 8, 3, 3, '.');
        B.scatter('r', 0.02, 3, 3, 58, 38); B.scatter('K', 0.012, 3, 3, 58, 38); B.scatter('b', 0.015, 3, 3, 58, 38);
        B.path([[14, 28], [14, 22], [11, 16], [11, 11]]);
        B.path([[16, 31], [24, 35], [30, 36]]);
        B.path([[16, 29], [24, 22], [32, 18], [33, 16]]);
        B.path([[24, 22], [32, 23], [40, 22], [45, 19]]);
        B.path([[40, 22], [44, 15], [47, 10]]);
        B.path([[38, 34], [42, 37]]);
        B.clear(30, 36, 2); B.clear(54, 37, 3); B.clear(33, 16, 1); B.clear(45, 19, 1);
        B.ship(14, 30); B.start(14, 32);
        B.part(1, 30, 37); B.part(2, 54, 37); B.part(3, 33, 7); B.part(4, 57, 8);
        B.power('laser2', 10, 7); B.power('heart', 50, 19);
        B.aliensAt([[22, 14], [20, 38], [28, 30], [40, 33], [36, 21], [50, 36], [58, 34], [48, 26], [14, 18]]);
        B.bossAt(53, 9);
        B.gemsAt([[31, 5], [35, 11], [52, 18], [7, 6], [60, 41]]);
        B.randomGems(14);
      } },
    { name: 'EMBER', sub: 'TIMES MEANS GROUPS!', ex: { a: 3, b: 2, c: 6, cap: '3 GROUPS OF 2 MAKES 6' }, say: 'Welcome to Planet Ember! Here we multiply. Times means groups. 3 groups of 2 makes 6. Find 4 rocket parts!', op: '×', seed: 303, w: 64, h: 44, alienHp: 4, bossHp: 10,
      build(B) {
        B.noise(',', 0.62, 0, 0, 64, 44, 5, 31);
        B.noise('T', 0.7, 0, 0, 64, 44, 5, 32, '.,');
        B.scatter('T', 0.025, 3, 3, 58, 38);
        B.border('#', 2);
        B.poly([[0, 16], [20, 16], [20, 18], [44, 18], [44, 16], [64, 16]], '~', 2);       // lava river: Rocket Boots
        B.ell(32, 8, 6, 4, '#'); B.ell(32, 8, 3, 2, '~');                                  // volcano
        B.ell(52, 33, 7, 5.5, '.'); B.ring(52, 33, 4.5, 3.5, '~'); B.ell(52, 33, 3.4, 2.4, '.'); // lava moat island
        B.rect(4, 25, 10, 9, '#'); B.rect(5, 26, 8, 6, '.'); B.rect(8, 32, 2, 2, 'X');     // rock room (strong laser)
        B.ell(26, 27, 4, 2, '~'); B.ell(40, 37, 3, 1.5, '~');
        B.scatter('r', 0.03, 3, 3, 58, 38); B.scatter('b', 0.02, 3, 3, 58, 38);
        B.path([[32, 39], [28, 35], [21, 31], [20, 30]]);
        B.path([[34, 37], [40, 31], [46, 25], [47, 24]]);
        B.path([[33, 35], [32, 25], [32, 20]]);
        B.path([[36, 38], [44, 40], [52, 39]]);
        B.path([[20, 31], [12, 35], [9, 34]]);
        B.path([[32, 14], [22, 12], [14, 9]]);
        B.path([[34, 14], [44, 11], [49, 9]]);
        B.ell(52, 8, 7, 5, '.'); B.ring(52, 8, 7, 5, '#'); B.rect(44, 7, 3, 3, '.');
        B.clear(20, 30, 2); B.clear(47, 24, 2); B.clear(32, 20, 1); B.clear(32, 14, 2); B.clear(14, 9, 2);
        B.ship(32, 37); B.start(32, 39);
        B.part(1, 20, 29); B.part(2, 47, 23); B.part(3, 13, 8); B.part(4, 55, 7);
        B.power('rocket', 52, 33); B.power('heart', 8, 28);
        B.aliensAt([[14, 38], [24, 33], [40, 27], [54, 41], [28, 22], [12, 21], [22, 6], [42, 12], [58, 22], [38, 7]]);
        B.bossAt(51, 8);
        B.gemsAt([[52, 32], [6, 27], [11, 27], [32, 21], [60, 12]]);
        B.randomGems(14);
      } },
    { name: 'FUNGI', sub: 'SHARE IT FAIRLY!', ex: { a: 6, b: 2, c: 3, cap: '6 SHARED BY 2 IS 3 EACH' }, say: 'Welcome to Planet Fungi! Here we divide. Divide means share fairly. 6 shared by 2 is 3 each. Find 4 rocket parts!', op: '÷', seed: 404, w: 64, h: 44, alienHp: 6, bossHp: 15,
      build(B) {
        B.noise(',', 0.6, 0, 0, 64, 44, 5, 41);
        B.noise('T', 0.6, 0, 0, 64, 44, 6, 42, '.,');
        B.border('T', 2);
        B.rect(44, 3, 16, 11, '#'); B.rect(46, 5, 12, 7, '.'); B.rect(51, 12, 2, 2, 'X');  // crystal vault (strong laser)
        B.ell(14, 34, 8, 6, '.'); B.ring(14, 34, 7, 5, '~', 2); B.ell(14, 34, 4.4, 2.4, '.'); // wide goo moat: Rocket Boots
        B.ell(32, 8, 4.5, 3.5, '.'); B.ring(32, 8, 3.5, 2.5, '~'); B.ell(32, 8, 2.4, 1.4, '.'); // small goo ring
        B.ell(50, 33, 8, 6, '.'); B.ring(50, 33, 8, 6, 'K'); B.rect(49, 26, 3, 3, '.');   // crystal arena
        B.ell(26, 30, 3, 2, '~'); B.ell(40, 14, 3, 2, '~'); B.ell(6, 12, 2, 2, '~');
        B.scatter('r', 0.015, 3, 3, 58, 38); B.scatter('b', 0.025, 3, 3, 58, 38); B.scatter('K', 0.015, 3, 3, 58, 38);
        B.path([[31, 20], [24, 15], [15, 11]]);
        B.path([[34, 20], [44, 17], [51, 15]]);
        B.path([[32, 24], [30, 28], [24, 34], [23, 34]]);
        B.path([[34, 24], [44, 25], [50, 27]]);
        B.path([[32, 17], [32, 12]]);
        B.path([[31, 25], [32, 32], [32, 38]]);
        B.path([[30, 21], [16, 21], [7, 20]]);
        B.clear(15, 11, 2); B.clear(51, 15, 1); B.clear(32, 38, 2); B.clear(7, 20, 2); B.clear(32, 12, 1); B.clear(23, 34, 2);
        B.ship(32, 22); B.start(32, 24);
        B.part(1, 14, 10); B.part(2, 52, 7); B.part(3, 14, 34); B.part(4, 53, 34);
        B.power('laser3', 32, 8); B.power('magnet', 32, 38);
        B.aliensAt([[20, 14], [24, 26], [40, 20], [44, 30], [10, 26], [38, 38], [58, 22], [24, 6], [10, 40], [46, 9]]);
        B.bossAt(50, 34);
        B.gemsAt([[14, 33], [48, 6], [56, 10], [32, 7], [5, 5]]);
        B.randomGems(14);
      } },
  ];

  RB.buildWorld = function (i) {
    const def = RB.WORLD_DEFS[i], B = Builder(def);
    def.build(B);
    return { i, def, W: B.W, H: B.H, grid: B.g, parts: B.parts, powers: B.powers, aliens: B.aliens, boss: B.boss, gems: B.gems, ship: B.ship, start: B.start };
  };

  // What each power-up does to the explorer's abilities.
  RB.POWERS = {
    speed: { name: 'ZOOM SHOES', say: 'Zoom shoes! You run faster!', apply: (a) => { a.speed = true; } },
    spring: { name: 'SPRING BOOTS', say: 'Spring boots! Walk into water to hop over it!', apply: (a) => { a.spring = true; } },
    laser2: { name: 'POWER LASER', say: 'Power laser! It zaps twice as hard and breaks cracked rocks!', apply: (a) => { a.laser = Math.max(a.laser, 2); } },
    heart: { name: 'EXTRA HEART', say: 'An extra heart!', apply: (a) => { a.maxHearts = Math.min(6, a.maxHearts + 1); } },
    rocket: { name: 'ROCKET BOOTS', say: 'Rocket boots! Now you can jump twice as far!', apply: (a) => { a.spring = true; a.rocket = true; } },
    laser3: { name: 'MEGA LASER', say: 'Mega laser! The strongest zap of all!', apply: (a) => { a.laser = 3; } },
    magnet: { name: 'GEM MAGNET', say: 'Gem magnet! Gems fly to you!', apply: (a) => { a.magnet = true; } },
  };
  RB.newAbilities = () => ({ speed: false, spring: false, rocket: false, laser: 1, maxHearts: 3, magnet: false });

  // ---------------- checker: can every part be reached? ----------------
  RB.verifyWorld = function (w, startAb) {
    const ab = Object.assign({}, startAb), got = new Set();
    const walk = (x, y) => { const c = w.grid[y] && w.grid[y][x]; return RB.WALK.has(c) || (c === 'X' && ab.laser >= 2); };
    let reach;
    for (let pass = 0; pass < 6; pass++) {
      reach = new Uint8Array(w.W * w.H);
      const q = [[w.start.x, w.start.y]]; reach[w.start.y * w.W + w.start.x] = 1;
      while (q.length) {
        const [x, y] = q.pop();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          let n = 0; while (n < 3 && w.grid[y + dy * (n + 1)] && w.grid[y + dy * (n + 1)][x + dx * (n + 1)] === '~') n++;
          const range = ab.rocket ? 2 : ab.spring ? 1 : 0;
          const nx = x + dx * (n + 1), ny = y + dy * (n + 1);
          if ((n === 0 || n <= range) && nx >= 0 && ny >= 0 && nx < w.W && ny < w.H && walk(nx, ny) && !reach[ny * w.W + nx]) { reach[ny * w.W + nx] = 1; q.push([nx, ny]); }
        }
      }
      let changed = false;
      for (const p of w.powers) if (!got.has(p.id) && reach[p.y * w.W + p.x]) { got.add(p.id); RB.POWERS[p.id].apply(ab); changed = true; }
      if (!changed) break;
    }
    const lost = w.parts.filter((p) => !reach[p.y * w.W + p.x]).map((p) => 'part ' + p.n);
    w.powers.forEach((p) => { if (!got.has(p.id)) lost.push('power ' + p.id); });
    return { ok: !lost.length, lost, ab, reach };
  };

  // ---------------- draw the still parts of the ground once ----------------
  const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  RB.renderGround = function (w) {
    const T = RB.THEMES[w.i], art = RB.themeArt[w.i], TS = 16, seed = w.def.seed;
    const c = RB.mk(w.W * TS, w.H * TS), g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height), d = img.data;
    const G = T.ground.map(rgb), P = T.path.map(rgb), C = T.cliff.map(rgb), HZ = T.hazard.map(rgb), dark = [29, 27, 51];
    const at = (x, y) => (x >= 0 && y >= 0 && x < w.W && y < w.H ? w.grid[y][x] : '#');
    for (let ty = 0; ty < w.H; ty++) for (let tx = 0; tx < w.W; tx++) {
      const ch = at(tx, ty), up = at(tx, ty - 1);
      for (let py = 0; py < TS; py++) for (let px = 0; px < TS; px++) {
        const wx = tx * TS + px, wy = ty * TS + py, h = U.hash(wx, wy, seed);
        let col;
        if (ch === '#') {
          const front = at(tx, ty + 1) !== '#';
          if (front && py >= 8) col = py === 15 ? dark : py === 8 ? C[0] : (wx + (py >> 2)) % 6 === 0 ? dark : (h < 0.2 ? C[0] : C[1]);
          else {
            col = U.noise(wx, wy, 7, seed + 5) > 0.6 ? C[2] : C[0];
            if (h < 0.05) col = C[1];
            if ((up !== '#' && py === 0) || (at(tx - 1, ty) !== '#' && px === 0) || (at(tx + 1, ty) !== '#' && px === 15)) col = C[2];
          }
        } else if (ch === '~') col = HZ[1];
        else {
          const isPath = ch === ':' || ch === '=';
          const n = U.noise(wx, wy, 26, seed);
          col = n < 0.33 ? G[1] : G[0];
          if (h < 0.05) col = G[1]; else if (h > 0.965) col = G[2];
          if (isPath) {
            const edge = Math.min(px, py, 15 - px, 15 - py);
            const L = at(tx - 1, ty), R = at(tx + 1, ty), Up = at(tx, ty - 1), Dn = at(tx, ty + 1);
            const pathy = (q) => q === ':' || q === '=' || q === 'S';
            let open = true;
            if (edge < 3) {
              const wob = U.hash(wx >> 1, wy >> 1, seed + 9) < 0.5 ? 1 : 2;
              if ((px < wob && !pathy(L)) || (px > 15 - wob && !pathy(R)) || (py < wob && !pathy(Up)) || (py > 15 - wob && !pathy(Dn))) open = false;
            }
            if (open) col = h < 0.07 ? P[1] : h > 0.95 ? P[2] : P[0];
          }
          if (up === '#' && py < 3) col = col.map((v) => Math.round(v * 0.72));
        }
        const k = (wy * c.width + wx) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // decorations, tall grass and bridges
    for (let ty = 0; ty < w.H; ty++) for (let tx = 0; tx < w.W; tx++) {
      const ch = at(tx, ty), h = U.hash(tx, ty, seed + 3), X = tx * TS, Y = ty * TS;
      if (ch === ',') g.drawImage(art.tall[Math.floor(h * art.tall.length)], X, Y);
      else if (ch === '.' && h < 0.12) { const s = art.decor[Math.floor(U.hash(tx, ty, seed + 4) * art.decor.length)]; g.drawImage(s, X + 2 + Math.floor(h * 90) % 10, Y + 3 + Math.floor(h * 70) % 9); }
      else if (ch === '=') {
        const hz = (q) => q === '~' || q === '=';
        const vert = hz(at(tx - 1, ty)) && hz(at(tx + 1, ty)) && !(hz(at(tx, ty - 1)) && hz(at(tx, ty + 1)) && !(at(tx, ty - 1) === '=' || at(tx, ty + 1) === '='));
        g.fillStyle = '#8a5a32'; g.fillRect(X, Y, 16, 16);
        g.fillStyle = '#a8744a';
        for (let k = 0; k < 4; k++) vert ? g.fillRect(X + 1, Y + k * 4 + 1, 14, 2) : g.fillRect(X + k * 4 + 1, Y + 1, 2, 14);
        g.fillStyle = '#4a2f1a';
        if (vert) { g.fillRect(X, Y, 1, 16); g.fillRect(X + 15, Y, 1, 16); } else { g.fillRect(X, Y, 16, 1); g.fillRect(X, Y + 15, 16, 1); }
      }
    }
    return c;
  };
})(window.RB);
