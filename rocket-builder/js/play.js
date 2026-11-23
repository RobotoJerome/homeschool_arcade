/* Rocket Builder — exploring a planet: walking, hopping, lasers, aliens, crates, power-ups, the HUD and the map. */
'use strict';
(function (RB) {
  const U = RB.U, D = RB.D, F = RB.F, I = RB.I, A = RB.A, SPR = RB.SPR, TS = 16;
  const P = RB.Play = { t: 0 };
  const ALIEN_SPEED = [22, 24, 27, 28];

  // ---------------- loading a planet ----------------
  P.load = function (wi) {
    const G = RB.G, ws = G.ws;
    const w = P.w = RB.buildWorld(wi);
    (ws.broken || []).forEach(([x, y]) => { if (w.grid[y][x] === 'X') w.grid[y][x] = '.'; });
    P.ground = RB.renderGround(w);
    P.theme = RB.THEMES[wi]; P.art = RB.themeArt[wi];
    P.shipPx = { x: (w.ship.x + 0.5) * TS, y: (w.ship.y + 1) * TS };
    P.crates = w.parts.map((p) => ({ n: p.n, x: (p.x + 0.5) * TS, y: (p.y + 0.5) * TS + 6, opened: ws.opened.includes(p.n), locks: 0, armed: true }));
    P.powers = w.powers.map((p) => ({ id: p.id, x: (p.x + 0.5) * TS, y: (p.y + 0.5) * TS + 6, taken: ws.powers.includes(p.id) }));
    P.gems = w.gems.map((p, i) => ({ i, x: (p.x + 0.5) * TS, y: (p.y + 0.5) * TS + 4, taken: ws.gems.includes(i) }));
    P.aliens = [];
    w.aliens.forEach((a, i) => { if (!ws.aliens.includes(i)) P.aliens.push(makeAlien(i, a.x, a.y, false)); });
    if (w.boss && !ws.boss) P.aliens.push(makeAlien('boss', w.boss.x, w.boss.y, true));
    P.lasers = []; P.parts = []; P.floaters = []; P.drops = []; P.amb = [];
    P.explored = new Uint8Array(w.W * w.H);
    P.modal = null; P.shipArmed = false;
    P.resetPlayer(true);
    P.minimap = makeMinimap(w);
    if (RB.DEBUG) { const v = RB.verifyWorld(w, G.ab); console.log('[check] planet', wi + 1, v.ok ? 'all parts reachable' : 'NOT reachable: ' + v.lost.join(', ')); }
  };
  function makeAlien(id, tx, ty, boss) {
    const def = P.w.def, hp = boss ? def.bossHp : def.alienHp;
    return { id, boss, x: (tx + 0.5) * TS, y: (ty + 0.5) * TS + 6, hx: (tx + 0.5) * TS, hy: (ty + 0.5) * TS + 6, hp, max: hp, vx: 0, vy: 0, wt: 0, cool: 1, flash: 0, ph: Math.random() * 6 };
  }
  P.resetPlayer = function (full) {
    const s = P.w.start;
    P.pl = { x: (s.x + 0.5) * TS, y: (s.y + 0.5) * TS + 6, dir: 'down', anim: 0, moving: false, hearts: RB.G.ab.maxHearts, inv: full ? 0 : 2, fireCD: 0, hop: null, push: 0, pushDir: null, bubble: null, bubbleCD: 0, flash: 0 };
    P.cam = { x: P.pl.x - D.W / 2, y: P.pl.y - D.H / 2 };
    P.crates && P.crates.forEach((c) => { c.armed = true; });
  };

  // ---------------- map helpers ----------------
  const tileAt = (px, py) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); return tx < 0 || ty < 0 || tx >= P.w.W || ty >= P.w.H ? '#' : P.w.grid[ty][tx]; };
  const solidPx = (px, py) => RB.SOLID.has(tileAt(px, py));
  const boxFree = (x, y) => !solidPx(x - 5, y - 6) && !solidPx(x + 5, y - 6) && !solidPx(x - 5, y - 1) && !solidPx(x + 5, y - 1) && !solidPx(x, y - 1) && !solidPx(x, y - 6);
  P.boxFree = boxFree;
  function moveBody(b, dx, dy) {
    let bx = false, by = false;
    if (dx) { if (boxFree(b.x + dx, b.y)) b.x += dx; else bx = true; }
    if (dy) { if (boxFree(b.x, b.y + dy)) b.y += dy; else by = true; }
    // help slide around corners so 1-tile gaps are easy to walk into
    if (bx && !dy) for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) { if (boxFree(b.x + dx, b.y + o)) { b.y += Math.sign(o) * Math.min(1, Math.abs(o)); break; } }
    if (by && !dx) for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) { if (boxFree(b.x + o, b.y + dy)) { b.x += Math.sign(o) * Math.min(1, Math.abs(o)); break; } }
    return { bx, by };
  }

  // ---------------- effects ----------------
  P.burst = function (x, y, cols, n, speed, opts) {
    opts = opts || {};
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = U.rnd(0.3, 1) * speed;
      P.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.up || 0), life: U.rnd(0.3, 0.8) * (opts.life || 1), max: 1, c: U.pick(cols), s: opts.s || 1, g: opts.g == null ? 60 : opts.g });
    }
  };
  P.float = (x, y, text, c) => P.floaters.push({ x, y, text, c: c || '#fff', t: 0 });
  P.say = (icon) => { if (P.pl.bubbleCD > 0) return; P.pl.bubble = { icon, t: 2 }; P.pl.bubbleCD = 3; A.play('bubble'); };

  // ---------------- update ----------------
  P.update = function (dt) {
    P.t += dt;
    if (P.modal) { P.modal.update(dt); updateFx(dt); return; }
    const pl = P.pl, ab = RB.G.ab;
    pl.inv = Math.max(0, pl.inv - dt); pl.fireCD -= dt; pl.bubbleCD -= dt; pl.flash = Math.max(0, pl.flash - dt);
    if (pl.bubble && (pl.bubble.t -= dt) <= 0) pl.bubble = null;
    if (I.hit('back')) { RB.UI.openPause(); return; }
    if (I.hit('map')) { RB.UI.openMap(); return; }
    // touch: HUD buttons, joystick and fire button
    for (const e of I.events) {
      if (e.type !== 'down') continue;
      if (U.inRect(e.x, e.y, P.hud.pause)) { RB.UI.openPause(); return; }
      if (U.inRect(e.x, e.y, P.hud.map)) { RB.UI.openMap(); return; }
      if (e.ptr && e.touch) e.ptr.role = e.x < D.W * 0.55 ? 'stick' : 'fire';
    }
    let mx = 0, my = 0, fire = I.hit('fire');
    if (I.down('left')) mx -= 1; if (I.down('right')) mx += 1; if (I.down('up')) my -= 1; if (I.down('down')) my += 1;
    P.stick = null;
    for (const ptr of I.pointers.values()) {
      if (ptr.role === 'stick') {
        const dx = ptr.x - ptr.sx, dy = ptr.y - ptr.sy, len = Math.hypot(dx, dy);
        P.stick = { sx: ptr.sx, sy: ptr.sy, x: ptr.x, y: ptr.y };
        if (len > 4) { const k = Math.min(1, len / 22); mx = (dx / len) * k; my = (dy / len) * k; }
      } else if (ptr.role === 'fire' && !ptr.fired) { fire = true; ptr.fired = true; }
    }
    if (pl.hop) updateHop(dt);
    else {
      const len = Math.hypot(mx, my);
      pl.moving = len > 0.1;
      if (pl.moving) {
        if (len > 1) { mx /= len; my /= len; }
        pl.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : my > 0 ? 'down' : 'up';
        const sp = (ab.speed ? 92 : 62) * dt;
        const res = moveBody(pl, mx * sp, my * sp);
        pl.anim += dt * (ab.speed ? 11 : 8);
        // walking into water/lava/goo: hop over it if your boots can
        const ax = Math.abs(mx) > Math.abs(my) ? Math.sign(mx) : 0, ay = ax ? 0 : Math.sign(my);
        if ((ax && res.bx) || (ay && res.by)) tryHop(ax, ay, dt); else pl.push = 0;
      } else { pl.anim = 0; pl.push = 0; }
    }
    if (fire && pl.fireCD <= 0 && !pl.hop) shoot();
    // explore (for the map)
    const ptx = Math.floor(pl.x / TS), pty = Math.floor(pl.y / TS);
    if (ptx !== P.lastTx || pty !== P.lastTy) { P.lastTx = ptx; P.lastTy = pty; reveal(ptx, pty, 8); }
    updateLasers(dt); updateAliens(dt); updatePickups(dt); updateFx(dt);
    // camera
    const tx = U.clamp(pl.x - D.W / 2, 0, Math.max(0, P.w.W * TS - D.W)), ty = U.clamp(pl.y - 8 - D.H / 2, 0, Math.max(0, P.w.H * TS - D.H));
    P.cam.x = U.lerp(P.cam.x, P.w.W * TS < D.W ? (P.w.W * TS - D.W) / 2 : tx, Math.min(1, dt * 8));
    P.cam.y = U.lerp(P.cam.y, P.w.H * TS < D.H ? (P.w.H * TS - D.H) / 2 : ty, Math.min(1, dt * 8));
    P.saveT = (P.saveT || 0) + dt; if (P.saveT > 10) { P.saveT = 0; RB.saveGame(); }
  };

  function reveal(cx, cy, r) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++)
      if (x >= 0 && y >= 0 && x < P.w.W && y < P.w.H && (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) P.explored[y * P.w.W + x] = 1;
  }

  function tryHop(ax, ay, dt) {
    const pl = P.pl, ab = RB.G.ab;
    const ctx = Math.floor(pl.x / TS), cty = Math.floor((pl.y - 3) / TS);
    const g = P.w.grid, at = (x, y) => (g[y] && g[y][x]) || '#';
    if (at(ctx + ax, cty + ay) !== '~') { pl.push = 0; return; }
    pl.push += dt;
    if (pl.push < 0.14) return;
    let n = 0; while (n < 4 && at(ctx + ax * (n + 1), cty + ay * (n + 1)) === '~') n++;
    const lx = ctx + ax * (n + 1), ly = cty + ay * (n + 1);
    const range = ab.rocket ? 2 : ab.spring ? 1 : 0;
    if (n <= range && RB.WALK.has(at(lx, ly))) {
      pl.hop = { t: 0, dur: 0.38 + n * 0.12, x0: pl.x, y0: pl.y, x1: (lx + 0.5) * TS, y1: (ly + 0.5) * TS + 4, h: 10 + n * 6 };
      pl.push = 0; A.play('hop');
    } else if (n === 1 && !ab.spring) P.say('spring');
    else if (n === 2 && !ab.rocket) P.say('rocket');
  }
  function updateHop(dt) {
    const pl = P.pl, h = pl.hop;
    h.t += dt; const k = Math.min(1, h.t / h.dur);
    pl.x = U.lerp(h.x0, h.x1, k); pl.y = U.lerp(h.y0, h.y1, k); pl.z = Math.sin(Math.PI * k) * h.h;
    pl.anim = 1;
    if (k >= 1) { pl.hop = null; pl.z = 0; A.play('land'); P.burst(pl.x, pl.y - 1, ['#ffffff', P.theme.ground[2]], 8, 30, { g: 0 }); }
  }

  // ---------------- lasers ----------------
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function shoot() {
    const pl = P.pl, lv = RB.G.ab.laser, [dx, dy] = DIRV[pl.dir];
    pl.fireCD = lv === 3 ? 0.3 : 0.34;
    const sx = pl.x + dx * 7, sy = pl.y - 7 + dy * 3, sp = lv === 3 ? 300 : 250;
    const make = (ox, oy) => P.lasers.push({ x: sx + ox, y: sy + oy, vx: dx * sp, vy: dy * sp, life: 0.55, lv });
    if (lv === 2) { make(dy * 3, dx * 3); make(-dy * 3, -dx * 3); } else make(0, 0);
    A.play(lv === 1 ? 'laser' : lv === 2 ? 'laser2' : 'laser3');
  }
  function updateLasers(dt) {
    for (const L of P.lasers) {
      L.x += L.vx * dt; L.y += L.vy * dt; L.life -= dt;
      const ch = tileAt(L.x, L.y);
      if (ch === 'X') {
        if (L.lv >= 2) breakRock(Math.floor(L.x / TS), Math.floor(L.y / TS)); else { A.play('tink'); P.say('laser2'); P.burst(L.x, L.y, ['#ffffff', '#ffd23f'], 5, 40, { g: 0 }); }
        L.life = 0;
      } else if (RB.SOLID.has(ch) && ch !== '~' && ch !== 'b') { P.burst(L.x, L.y, ['#ffffff', '#ffd23f'], 4, 30, { g: 0 }); L.life = 0; }
      for (const a of P.aliens) {
        if (L.life > 0 && Math.hypot(a.x - L.x, a.y - 7 * (a.boss ? 2 : 1) - L.y) < (a.boss ? 16 : 9)) {
          L.life = 0; a.flash = 0.2; A.play('zapHit'); P.burst(L.x, L.y, ['#ffffff', '#ffd23f'], 8, 50, { g: 0 });
          startBattle(a, true);
        }
      }
    }
    P.lasers = P.lasers.filter((L) => L.life > 0);
  }
  function breakRock(tx, ty) {
    P.w.grid[ty][tx] = '.';
    RB.G.ws.broken.push([tx, ty]);
    const g = P.ground.getContext('2d');
    g.fillStyle = P.theme.ground[1]; g.fillRect(tx * TS, ty * TS, TS, TS);
    g.fillStyle = P.theme.ground[0]; g.fillRect(tx * TS + 1, ty * TS + 1, TS - 2, TS - 2);
    for (let k = 0; k < 6; k++) { g.fillStyle = P.theme.cliff[k % 2]; g.fillRect(tx * TS + U.ri(1, 13), ty * TS + U.ri(1, 13), 2, 1); }
    P.minimap = makeMinimap(P.w);
    A.play('crumble');
    P.burst((tx + 0.5) * TS, (ty + 0.5) * TS, P.theme.cliff.concat(['#e8e2d8']), 26, 80, { s: 2 });
    RB.saveGame();
  }

  // ---------------- aliens ----------------
  function updateAliens(dt) {
    const pl = P.pl, wi = P.w.i;
    for (const a of P.aliens) {
      a.ph += dt; a.cool = Math.max(0, a.cool - dt); a.flash = Math.max(0, a.flash - dt);
      const d = Math.hypot(pl.x - a.x, pl.y - a.y);
      const sp = ALIEN_SPEED[wi] * (a.boss ? 0.8 : 1);
      if (a.cool <= 0 && d < (a.boss ? 90 : 76) && !pl.hop) {
        a.vx = ((pl.x - a.x) / d) * sp; a.vy = ((pl.y - a.y) / d) * sp;
      } else {
        a.wt -= dt;
        if (a.wt <= 0) {
          a.wt = U.rnd(1.2, 3);
          const home = Math.hypot(a.hx - a.x, a.hy - a.y);
          if (home > (a.boss ? 30 : 56)) { a.vx = ((a.hx - a.x) / home) * sp * 0.6; a.vy = ((a.hy - a.y) / home) * sp * 0.6; }
          else if (Math.random() < 0.35) { a.vx = 0; a.vy = 0; }
          else { const ang = Math.random() * Math.PI * 2; a.vx = Math.cos(ang) * sp * 0.5; a.vy = Math.sin(ang) * sp * 0.5; }
        }
      }
      const r = moveBody(a, a.vx * dt, a.vy * dt);
      if (r.bx) a.vx = -a.vx; if (r.by) a.vy = -a.vy;
      if (d < (a.boss ? 18 : 11) && pl.inv <= 0 && a.cool <= 0 && !pl.hop) {
        // the alien bumped you first: lose a heart, then battle
        P.hurt(1);
        if (pl.hearts > 0) startBattle(a, false);
      }
    }
  }
  P.hurt = function (n) {
    const pl = P.pl;
    pl.hearts = Math.max(0, pl.hearts - n); pl.flash = 0.4; A.play('hurt');
    P.burst(pl.x, pl.y - 8, ['#ff4d5e', '#ffffff'], 10, 50);
    if (pl.hearts <= 0 && !P.modal) RB.UI.openOops();
  };
  function startBattle(a, youFirst) {
    if (P.modal) return;
    RB.UI.openBattle(a, youFirst, (won) => {
      if (won) {
        P.aliens = P.aliens.filter((x) => x !== a);
        if (a.boss) RB.G.ws.boss = true; else RB.G.ws.aliens.push(a.id);
        RB.G.stats.zapped++;
        A.play('defeat');
        P.burst(a.x, a.y - 8, ['#ffffff', '#ffd23f', RB.GEM_COL[P.w.i][0]], a.boss ? 50 : 24, a.boss ? 120 : 80, { s: 2 });
        const drops = a.boss ? 5 : 2;
        for (let k = 0; k < drops; k++) P.drops.push({ kind: 'gem', x: a.x + U.rnd(-10, 10), y: a.y + U.rnd(-6, 6), vz: U.rnd(40, 70), z: 4, t: 0 });
        if (P.pl.hearts < RB.G.ab.maxHearts && (a.boss || Math.random() < 0.5)) P.drops.push({ kind: 'heart', x: a.x, y: a.y, vz: 60, z: 4, t: 0 });
        RB.saveGame();
      } else { a.hp = a.max; }
      a.cool = 2.5; P.pl.inv = 1.5;
      const d = Math.hypot(P.pl.x - a.x, P.pl.y - a.y) || 1;
      for (let k = 0; k < 10; k++) moveBody(a, ((a.x - P.pl.x) / d) * 2, ((a.y - P.pl.y) / d) * 2);
    });
  }

  // ---------------- pickups ----------------
  function updatePickups(dt) {
    const pl = P.pl, G = RB.G, ws = G.ws;
    for (const c of P.crates) {
      const d = Math.hypot(pl.x - c.x, pl.y - c.y);
      if (d > 22) c.armed = true;
      if (!c.opened && c.armed && d < 13 && !pl.hop) { c.armed = false; RB.UI.openCrate(c); return; }
    }
    for (const p of P.powers) {
      if (!p.taken && Math.hypot(pl.x - p.x, pl.y - p.y) < 13 && !pl.hop) {
        p.taken = true; ws.powers.push(p.id);
        RB.POWERS[p.id].apply(G.ab);
        if (p.id === 'heart') pl.hearts = G.ab.maxHearts;
        A.play('power'); P.burst(p.x, p.y - 10, ['#ffffff', '#ffd23f', '#9ff3ff'], 30, 90);
        RB.saveGame();
        RB.UI.openItem(p.id);
        return;
      }
    }
    const magnet = G.ab.magnet ? 64 : 0;
    for (const gm of P.gems) {
      if (gm.taken) continue;
      const d = Math.hypot(pl.x - gm.x, pl.y - 4 - gm.y);
      if (d < magnet) { gm.x += ((pl.x - gm.x) / d) * 160 * dt; gm.y += ((pl.y - 4 - gm.y) / d) * 160 * dt; }
      if (d < 11) { gm.taken = true; ws.gems.push(gm.i); gainGem(gm.x, gm.y); }
    }
    for (const dr of P.drops) {
      dr.t += dt; dr.vz -= 220 * dt; dr.z = Math.max(0, dr.z + dr.vz * dt); if (dr.z === 0) dr.vz = Math.abs(dr.vz) > 30 ? -dr.vz * 0.4 : 0;
      const d = Math.hypot(pl.x - dr.x, pl.y - 4 - dr.y);
      if (d < magnet && dr.t > 0.4) { dr.x += ((pl.x - dr.x) / d) * 160 * dt; dr.y += ((pl.y - 4 - dr.y) / d) * 160 * dt; }
      if (dr.t > 0.4 && d < 11) {
        dr.done = true;
        if (dr.kind === 'gem') gainGem(dr.x, dr.y);
        else { pl.hearts = Math.min(G.ab.maxHearts, pl.hearts + 1); A.play('heal'); P.float(dr.x, dr.y - 10, '+♥', '#ff8a9a'); }
      }
    }
    P.drops = P.drops.filter((d) => !d.done);
    // the rocket: heals you, and takes off when all 4 parts are found
    const sd = Math.hypot(pl.x - P.shipPx.x, pl.y - (P.shipPx.y + 8));
    if (sd > 34) P.shipArmed = true;
    if (sd < 26 && P.shipArmed && !pl.hop) {
      P.shipArmed = false;
      if (pl.hearts < G.ab.maxHearts) { pl.hearts = G.ab.maxHearts; A.play('heal'); P.float(pl.x, pl.y - 20, '♥♥♥', '#ff8a9a'); }
      if (P.partsFound() >= 4) RB.UI.openLaunch();
    }
  }
  function gainGem(x, y) { RB.G.stats.gems++; A.play('gem'); P.float(x, y - 8, '+1', RB.GEM_COL[P.w.i][2]); P.burst(x, y, RB.GEM_COL[P.w.i], 6, 40, { g: 0 }); }
  P.partsFound = () => RB.G.ws.opened.length;

  function updateFx(dt) {
    for (const p of P.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= 0.96; p.life -= dt; }
    P.parts = P.parts.filter((p) => p.life > 0);
    for (const f of P.floaters) { f.t += dt; f.y -= 18 * dt; }
    P.floaters = P.floaters.filter((f) => f.t < 1);
    // drifting pollen / snow / embers / spores (screen space)
    const kind = P.theme.ambient;
    while (P.amb.length < 36) P.amb.push({ x: Math.random() * D.W, y: Math.random() * D.H, s: Math.random(), t: Math.random() * 10 });
    for (const a of P.amb) {
      a.t += dt;
      if (kind === 'snow') { a.y += (14 + a.s * 16) * dt; a.x += Math.sin(a.t * 1.5 + a.s * 5) * 8 * dt; }
      else if (kind === 'embers') { a.y -= (10 + a.s * 18) * dt; a.x += Math.sin(a.t * 2 + a.s * 5) * 6 * dt; }
      else { a.y += Math.sin(a.t * 0.9 + a.s * 7) * 5 * dt - 2 * dt; a.x += (5 + a.s * 4) * dt; }
      if (a.y > D.H + 4) a.y = -4; if (a.y < -4) a.y = D.H + 4; if (a.x > D.W + 4) a.x = -4; if (a.x < -4) a.x = D.W + 4;
    }
  }

  // ---------------- drawing ----------------
  P.draw = function (g) {
    const w = P.w, T = P.theme, art = P.art, t = P.t;
    const cx = Math.round(P.cam.x), cy = Math.round(P.cam.y);
    g.fillStyle = T.bg; g.fillRect(0, 0, D.W, D.H);
    g.drawImage(P.ground, cx, cy, D.W, D.H, 0, 0, D.W, D.H);
    const x0 = Math.max(0, Math.floor(cx / TS) - 1), y0 = Math.max(0, Math.floor(cy / TS) - 1);
    const x1 = Math.min(w.W - 1, Math.floor((cx + D.W) / TS) + 1), y1 = Math.min(w.H - 1, Math.floor((cy + D.H) / TS) + 2);
    const HZ = T.hazard, at = (x, y) => (x < 0 || y < 0 || x >= w.W || y >= w.H ? '#' : w.grid[y][x]);
    // animated water / lava / goo
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (w.grid[ty][tx] !== '~') continue;
      const X = tx * TS - cx, Y = ty * TS - cy;
      g.fillStyle = HZ[0]; g.fillRect(X, Y, TS, TS);
      const land = (q) => q !== '~' && q !== '=';
      if (land(at(tx, ty - 1))) { g.fillStyle = HZ[1]; g.fillRect(X, Y, TS, 3); }
      for (let k = 0; k < 3; k++) {
        const hh = U.hash(tx, ty, k), sp = w.i === 2 ? 3 : 6;
        if (w.i === 2 || w.i === 3) { // bubbles
          const ph = (t * 0.8 + hh * 5) % 2;
          if (ph < 0.6) { g.fillStyle = HZ[2]; const r = ph < 0.3 ? 1 : 2; g.fillRect(X + 2 + Math.floor(hh * 11), Y + 4 + Math.floor(U.hash(tx, ty, k + 7) * 9), r, r); }
        } else {
          const ox = Math.floor((hh * 16 + t * sp) % 16);
          g.fillStyle = HZ[2]; g.fillRect(X + ox, Y + 4 + Math.floor(U.hash(tx, ty, k + 5) * 10), 3, 1);
        }
      }
      const foam = Math.floor(t * 2 + tx + ty) % 2 ? HZ[2] : 'rgba(255,255,255,0.55)';
      g.fillStyle = foam;
      if (land(at(tx - 1, ty))) g.fillRect(X, Y, 1, TS);
      if (land(at(tx + 1, ty))) g.fillRect(X + TS - 1, Y, 1, TS);
      if (land(at(tx, ty + 1))) g.fillRect(X, Y + TS - 1, TS, 1);
      if (land(at(tx, ty - 1))) g.fillRect(X, Y + 3, TS, 1);
    }
    // sort everything that stands up by its feet
    const list = [];
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = w.grid[ty][tx]; let spr = null;
      const v = Math.floor(U.hash(tx, ty, 77) * 3);
      if (ch === 'T') spr = art.tree[v]; else if (ch === 'b') spr = art.bush[v]; else if (ch === 'r') spr = art.rock[v];
      else if (ch === 'X') spr = art.crack[v]; else if (ch === 'K') spr = art.crystal[v];
      if (spr) { const X = tx * TS + 8 - (spr.width >> 1) - cx, Y = ty * TS + 16 - spr.height - cy + (ch === 'T' ? 1 : 0); list.push({ y: ty * TS + 15, f: () => g.drawImage(spr, X, Y) }); }
    }
    const parts = RB.allParts();
    list.push({ y: P.shipPx.y, f: () => {
      const sx = P.shipPx.x - cx, sy = P.shipPx.y - cy;
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Math.round(sx - 18), Math.round(sy - 3), 36, 4); g.fillRect(Math.round(sx - 14), Math.round(sy - 5), 28, 8);
      g.fillStyle = '#6d7391'; g.fillRect(Math.round(sx - 16), Math.round(sy - 2), 32, 3); g.fillStyle = '#ffd23f'; for (let k = 0; k < 4; k++) g.fillRect(Math.round(sx - 14 + k * 8), Math.round(sy - 2), 4, 1);
      RB.drawShip(g, sx, sy + 3, parts, t, {});
      if (P.partsFound() < 4 && Math.floor(t * 2) % 2) smoke(g, sx, sy - 36);
    } });
    for (const c of P.crates) list.push({ y: c.y, f: () => drawCrate(g, c, cx, cy) });
    for (const p of P.powers) if (!p.taken) list.push({ y: p.y, f: () => drawPower(g, p, cx, cy) });
    for (const gm of P.gems) if (!gm.taken) list.push({ y: gm.y, f: () => { const b = Math.round(Math.sin(t * 3 + gm.i) * 1.5); shadow(g, gm.x - cx, gm.y - cy, 3); g.drawImage(SPR.gem[w.i], Math.round(gm.x - 4 - cx), Math.round(gm.y - 9 - cy + b)); if (Math.floor(t * 3 + gm.i) % 5 === 0) { g.fillStyle = '#fff'; g.fillRect(Math.round(gm.x - cx + 1), Math.round(gm.y - 8 - cy + b), 1, 1); } } });
    for (const dr of P.drops) list.push({ y: dr.y, f: () => { const s = dr.kind === 'gem' ? SPR.gem[w.i] : SPR.heart; shadow(g, dr.x - cx, dr.y - cy, 3); g.drawImage(s, Math.round(dr.x - s.width / 2 - cx), Math.round(dr.y - s.height - dr.z - cy)); } });
    for (const a of P.aliens) list.push({ y: a.y, f: () => drawAlien(g, a, cx, cy) });
    list.push({ y: P.pl.y, f: () => drawPlayer(g, cx, cy) });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.f();
    // lasers
    for (const L of P.lasers) {
      const horiz = L.vx !== 0, len = L.lv === 3 ? 9 : 7, th = L.lv === 3 ? 3 : 2;
      const cols = L.lv === 1 ? ['#ffd23f', '#fff6c2'] : L.lv === 2 ? ['#3fa9f5', '#c6f2ff'] : [['#ff4d5e', '#ffd23f', '#5dff9e', '#3fa9f5', '#c86bff'][Math.floor(t * 20) % 5], '#ffffff'];
      const X = Math.round(L.x - cx), Y = Math.round(L.y - cy);
      g.fillStyle = cols[0]; horiz ? g.fillRect(X - len / 2, Y - th / 2 - 1, len, th + 2) : g.fillRect(X - th / 2 - 1, Y - len / 2, th + 2, len);
      g.fillStyle = cols[1]; horiz ? g.fillRect(X - len / 2 + 1, Y - th / 2, len - 2, th) : g.fillRect(X - th / 2, Y - len / 2 + 1, th, len - 2);
    }
    for (const p of P.parts) { g.globalAlpha = Math.min(1, p.life * 3); g.fillStyle = p.c; g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.s, p.s); }
    g.globalAlpha = 1;
    for (const f of P.floaters) F.draw(g, f.text, Math.round(f.x - cx), Math.round(f.y - cy), { c: f.c, a: 'center', o: '#1d1b33' });
    // ambient tint + particles
    if (T.tint) { g.fillStyle = T.tint; g.fillRect(0, 0, D.W, D.H); }
    drawAmbient(g);
    if (RB.G.level === 0) drawGuide(g, cx, cy);
    drawHUD(g);
    if (P.modal) P.modal.draw(g);
  };

  function shadow(g, x, y, r) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Math.round(x - r), Math.round(y - 1), r * 2, 2); g.fillRect(Math.round(x - r + 2), Math.round(y - 2), r * 2 - 4, 4); }
  function smoke(g, x, y) { g.fillStyle = 'rgba(80,80,90,0.5)'; const k = (P.t * 10) % 8; g.fillRect(Math.round(x - 2), Math.round(y - k), 4, 3); g.fillRect(Math.round(x + 1), Math.round(y - k - 5), 3, 3); }
  function drawPlayer(g, cx, cy) {
    const pl = P.pl;
    if (pl.inv > 0 && Math.floor(P.t * 12) % 2 && !P.modal) return;
    const dir = pl.dir, frames = SPR.player[dir];
    const f = pl.moving || pl.hop ? [1, 0, 2, 0][Math.floor(pl.anim) % 4] : 0;
    const z = pl.hop ? pl.z || 0 : 0;
    shadow(g, pl.x - cx, pl.y - cy, pl.hop ? 4 : 5);
    const X = Math.round(pl.x - 8 - cx), Y = Math.round(pl.y - 16 - cy - z - (f ? 0 : 0));
    g.drawImage(frames[f], X, Y);
    if (pl.flash > 0) { g.globalAlpha = 0.6; g.fillStyle = '#ff4d5e'; g.fillRect(X + 3, Y + 2, 10, 13); g.globalAlpha = 1; }
    if (pl.bubble) {
      const bx = Math.round(pl.x - cx), by = Math.round(pl.y - cy - 34 - z);
      RB.box(g, bx - 9, by - 9, 18, 17, '#ffffff', '#1d1b33');
      g.fillStyle = '#ffffff'; g.fillRect(bx - 2, by + 7, 3, 2); g.fillRect(bx - 1, by + 9, 1, 1);
      g.drawImage(SPR.icon[pl.bubble.icon], bx - 6, by - 7);
    }
  }
  function drawAlien(g, a, cx, cy) {
    const set = SPR.alien[P.w.i], blink = Math.floor(a.ph * 0.7) % 5 === 0 && (a.ph % 1.43) < 0.15;
    const spr = a.flash > 0 ? set.white : blink ? set.blink : set.open;
    const bob = Math.round(Math.abs(Math.sin(a.ph * (P.w.i === 3 ? 2 : 5))) * (P.w.i === 3 ? 3 : 2));
    const s = a.boss ? 2 : 1;
    shadow(g, a.x - cx, a.y - cy, 6 * s);
    const X = Math.round(a.x - 8 * s - cx), Y = Math.round(a.y - 16 * s - cy - bob - (P.w.i === 3 ? 3 : 0));
    g.drawImage(spr, X, Y, 16 * s, 16 * s);
    if (a.boss) g.drawImage(SPR.crown, X + 9, Y - 4, 14, 10);
  }
  function drawCrate(g, c, cx, cy) {
    const X = Math.round(c.x - 8 - cx), Y = Math.round(c.y - 15 - cy);
    shadow(g, c.x - cx, c.y - cy, 7);
    g.drawImage(c.opened ? SPR.crateOpen : SPR.crate[P.w.i], X, Y);
    if (!c.opened) {
      const glow = 0.5 + 0.5 * Math.sin(P.t * 4);
      g.globalAlpha = 0.35 * glow; g.fillStyle = RB.GEM_COL[P.w.i][2]; g.fillRect(X - 1, Y + 1, 18, 14); g.globalAlpha = 1;
      F.draw(g, '?', X + 8, Y - 9 + Math.round(Math.sin(P.t * 3) * 2), { c: '#ffd23f', a: 'center', o: '#1d1b33' });
    }
  }
  function drawPower(g, p, cx, cy) {
    const X = Math.round(p.x - cx), Y = Math.round(p.y - cy), bob = Math.round(Math.sin(P.t * 2.5) * 2);
    g.fillStyle = '#1d1b33'; g.fillRect(X - 7, Y - 5, 14, 5); g.fillStyle = '#8d93b3'; g.fillRect(X - 6, Y - 5, 12, 3); g.fillStyle = '#b3b9d6'; g.fillRect(X - 6, Y - 5, 12, 1);
    const oy = Y - 17 + bob;
    RB.circle(g, X, oy, 9, 'rgba(159,243,255,0.25)'); RB.ring(g, X, oy, 9, '#ffffff');
    g.drawImage(SPR.icon[p.id], X - 6, oy - 6);
    if (Math.floor(P.t * 4) % 3 === 0) { g.fillStyle = '#fff'; g.fillRect(X - 5, oy - 6, 2, 2); }
  }
  function drawAmbient(g) {
    const k = P.theme.ambient;
    for (const a of P.amb) {
      const tw = 0.5 + 0.5 * Math.sin(a.t * 3 + a.s * 9);
      g.globalAlpha = k === 'snow' ? 0.9 : 0.35 + tw * 0.5;
      g.fillStyle = k === 'snow' ? '#ffffff' : k === 'embers' ? (a.s > 0.5 ? '#ffd23f' : '#ff7a2f') : k === 'spores' ? (a.s > 0.5 ? '#3ee0d0' : '#ff8ae2') : '#fff6a8';
      const sz = k === 'snow' && a.s > 0.6 ? 2 : 1;
      g.fillRect(Math.round(a.x), Math.round(a.y), sz, sz);
    }
    g.globalAlpha = 1;
  }
  // Cadet helper: an arrow that points at the closest part crate
  function drawGuide(g, cx, cy) {
    let best = null, bd = 1e9;
    for (const c of P.crates) if (!c.opened) { const d = Math.hypot(c.x - P.pl.x, c.y - P.pl.y); if (d < bd) { bd = d; best = c; } }
    if (!best && P.partsFound() >= 4) best = { x: P.shipPx.x, y: P.shipPx.y };
    if (!best) return;
    const sx = best.x - cx, sy = best.y - 12 - cy, pulse = Math.floor(P.t * 3) % 2;
    if (sx > 10 && sy > 30 && sx < D.W - 10 && sy < D.H - 10) {
      if (best.n == null) { F.draw(g, 'GO!', Math.round(sx), Math.round(sy - 52 - (pulse ? 1 : 0)), { c: '#ffd23f', a: 'center', o: '#1d1b33' }); }
      return;
    }
    const ang = Math.atan2(sy - D.H / 2, sx - D.W / 2), mx = D.W / 2 - 18, my = D.H / 2 - 24;
    const k = Math.min(mx / Math.abs(Math.cos(ang) || 0.001), my / Math.abs(Math.sin(ang) || 0.001));
    const ax = D.W / 2 + Math.cos(ang) * k, ay = D.H / 2 + 6 + Math.sin(ang) * k;
    for (let i = 0; i < 7; i++) for (let j = -i; j <= i; j++) {
      const px = ax + Math.cos(ang) * (3 - i) * 1.4 - Math.sin(ang) * j * 0.9, py = ay + Math.sin(ang) * (3 - i) * 1.4 + Math.cos(ang) * j * 0.9;
      g.fillStyle = pulse ? '#ffd23f' : '#fff6c2'; g.fillRect(Math.round(px), Math.round(py), 2, 2);
    }
  }

  // ---------------- HUD ----------------
  P.hud = {};
  // Height of the touch joystick and zap button: lifted off the bottom edge (more on tall phones).
  P.controlY = () => D.bottom() - Math.max(18, Math.round(D.H * 0.12)) - 22;
  function drawHUD(g) {
    const ab = RB.G.ab, pl = P.pl;
    RB.box(g, 3, 3, Math.max(ab.maxHearts * 10 + 6, 50), 31, 'rgba(29,27,51,0.72)', 'rgba(0,0,0,0.5)');
    for (let i = 0; i < ab.maxHearts; i++) g.drawImage(i < pl.hearts ? SPR.heart : SPR.heartEmpty, 6 + i * 10, 6);
    g.drawImage(SPR.gem[P.w.i], 6, 19); F.draw(g, RB.G.stats.gems, 17, 20, { c: '#ffffff' });
    // power icons
    let ix = 6;
    const icons = [];
    if (ab.speed) icons.push('speed'); if (ab.rocket) icons.push('rocket'); else if (ab.spring) icons.push('spring');
    icons.push('laser' + ab.laser); if (ab.magnet) icons.push('magnet');
    for (const k of icons) { RB.box(g, ix - 1, 36, 14, 14, 'rgba(29,27,51,0.72)', 'rgba(0,0,0,0.5)'); g.drawImage(SPR.icon[k], ix, 37); ix += 15; }
    // part slots
    const n = P.partsFound(), sw = 4 * 15 + 30, sx = Math.round(D.W / 2 - sw / 2);
    RB.box(g, sx, 3, sw, 18, 'rgba(29,27,51,0.72)', 'rgba(0,0,0,0.5)');
    drawMiniRocket(g, sx + 6, 6);
    for (let i = 0; i < 4; i++) {
      const X = sx + 24 + i * 15, done = RB.G.ws.opened.includes(i + 1);
      g.fillStyle = done ? RB.GEM_COL[P.w.i][0] : '#3b3866'; g.fillRect(X, 6, 12, 12);
      g.fillStyle = done ? RB.GEM_COL[P.w.i][2] : '#4a4766'; g.fillRect(X, 6, 12, 2);
      if (done) F.draw(g, '★', X + 6, 8, { c: '#ffffff', a: 'center' }); else F.draw(g, '?', X + 6, 8, { c: '#8d8ab3', a: 'center' });
    }
    if (n >= 4 && Math.floor(P.t * 2) % 2) F.draw(g, 'GO TO YOUR ROCKET!', D.W / 2, 25, { c: '#ffd23f', a: 'center', o: '#1d1b33' });
    // buttons (top right)
    P.hud.pause = { x: D.W - 23, y: 3, w: 20, h: 20 }; P.hud.map = { x: D.W - 46, y: 3, w: 20, h: 20 };
    RB.box(g, P.hud.pause.x, 3, 20, 20, 'rgba(29,27,51,0.8)', '#000');
    g.fillStyle = '#fff'; g.fillRect(P.hud.pause.x + 6, 8, 3, 10); g.fillRect(P.hud.pause.x + 11, 8, 3, 10);
    RB.box(g, P.hud.map.x, 3, 20, 20, 'rgba(29,27,51,0.8)', '#000');
    g.fillStyle = '#c9a46a'; g.fillRect(P.hud.map.x + 4, 7, 12, 12); g.fillStyle = '#5fae3c'; g.fillRect(P.hud.map.x + 5, 8, 5, 5); g.fillStyle = '#3a8fd6'; g.fillRect(P.hud.map.x + 10, 13, 5, 5);
    g.fillStyle = '#ff4d5e'; g.fillRect(P.hud.map.x + 11, 9, 2, 2);
    if (!I.touch) F.draw(g, 'M', P.hud.map.x + 10, 25, { c: '#ffffff', a: 'center', o: '#1d1b33' });
    // touch controls
    if (I.touch) {
      // Raised well above the bottom edge so Android's back/home buttons and swipe bar never cover them.
      const lineY = P.controlY();
      const st = P.stick, bx = st ? st.sx : 46, by = st ? st.sy : lineY;
      g.globalAlpha = st ? 0.55 : 0.35; RB.circle(g, bx, by, 22, '#1d1b33'); RB.ring(g, bx, by, 22, '#ffffff');
      const kx = st ? bx + U.clamp(st.x - st.sx, -20, 20) : bx, ky = st ? by + U.clamp(st.y - st.sy, -20, 20) : by;
      RB.circle(g, kx, ky, 9, '#ffffff');
      const fx = D.W - 46, fy = lineY;
      g.globalAlpha = 0.65; RB.circle(g, fx, fy, 22, '#ff4d5e'); RB.ring(g, fx, fy, 22, '#ffffff'); g.globalAlpha = 1;
      g.drawImage(SPR.icon['laser' + RB.G.ab.laser], fx - 6, fy - 6);
      F.draw(g, 'ZAP', fx, fy + 10, { c: '#ffffff', a: 'center', o: '#1d1b33' });
    }
  }
  function drawMiniRocket(g, x, y) {
    g.fillStyle = '#ff4d5e'; g.fillRect(x + 4, y, 4, 2); g.fillRect(x + 1, y + 8, 2, 4); g.fillRect(x + 9, y + 8, 2, 4);
    g.fillStyle = '#f2f4fa'; g.fillRect(x + 3, y + 2, 6, 10); g.fillStyle = '#2d8fe0'; g.fillRect(x + 5, y + 4, 2, 2);
  }

  // ---------------- planet map (press M) ----------------
  function makeMinimap(w) {
    const c = RB.mk(w.W, w.H), g = c.getContext('2d'), T = RB.THEMES[w.i];
    const col = { '.': T.ground[0], ',': T.ground[1], ':': T.path[0], '=': '#8a5a32', '~': T.hazard[0], '#': T.cliff[1], T: '#1d3a2a', b: '#2c5a2a', r: T.cliff[0], K: RB.GEM_COL[w.i][0], X: T.cliff[2], S: '#ffffff' };
    if (w.i === 1) col.T = '#2f6a4a'; if (w.i === 2) col.T = '#2c7350'; if (w.i === 3) col.T = '#8a3fc2';
    for (let y = 0; y < w.H; y++) for (let x = 0; x < w.W; x++) { g.fillStyle = col[w.grid[y][x]] || T.ground[0]; g.fillRect(x, y, 1, 1); }
    return c;
  }
  P.drawMap = function (g) {
    const w = P.w;
    g.fillStyle = 'rgba(11,11,26,0.92)'; g.fillRect(0, 0, D.W, D.H);
    const s = Math.max(1, Math.floor(Math.min((D.W - 16) / w.W, (D.H - 34) / w.H)));
    const mw = w.W * s, mh = w.H * s, mx = Math.round((D.W - mw) / 2), my = Math.round((D.H - mh) / 2) + 8;
    F.draw(g, 'PLANET ' + w.def.name, D.W / 2, my - 14, { c: '#ffd23f', a: 'center', o: '#1d1b33' });
    RB.box(g, mx - 3, my - 3, mw + 6, mh + 6, '#000', '#ffffff');
    g.drawImage(P.minimap, 0, 0, w.W, w.H, mx, my, mw, mh);
    g.fillStyle = '#0b0b1a';
    for (let y = 0; y < w.H; y++) for (let x = 0; x < w.W; x++) if (!P.explored[y * w.W + x]) g.fillRect(mx + x * s, my + y * s, s, s);
    const seen = (px, py) => P.explored[Math.floor(py / TS) * w.W + Math.floor(px / TS)];
    const icon = (px, py, f) => f(Math.round(mx + (px / TS) * s), Math.round(my + (py / TS) * s));
    icon(P.shipPx.x, P.shipPx.y - 8, (x, y) => { g.fillStyle = '#1d1b33'; g.fillRect(x - 3, y - 5, 7, 10); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 4, 5, 8); g.fillStyle = '#ff4d5e'; g.fillRect(x - 1, y - 4, 3, 2); });
    for (const c of P.crates) if (seen(c.x, c.y)) icon(c.x, c.y - 4, (x, y) => F.draw(g, c.opened ? '★' : '?', x, y - 3, { c: c.opened ? '#5dff9e' : '#ffd23f', a: 'center', o: '#1d1b33' }));
    for (const p of P.powers) if (!p.taken && seen(p.x, p.y)) icon(p.x, p.y - 4, (x, y) => { RB.circle(g, x, y, 4, '#9ff3ff'); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 2, 2); });
    for (const a of P.aliens) if (a.boss && seen(a.x, a.y)) icon(a.x, a.y - 4, (x, y) => g.drawImage(SPR.crown, x - 3, y - 2));
    if (Math.floor(P.t * 4) % 2) icon(P.pl.x, P.pl.y - 4, (x, y) => { g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#ff4d5e'; g.fillRect(x - 1, y - 1, 2, 2); });
  };
})(window.RB);
