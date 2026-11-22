/* Rocket Builder — full screens: title, choose a level, planet intro, blast-off + space flight, and the ending. */
'use strict';
(function (RB) {
  const U = RB.U, D = RB.D, F = RB.F, I = RB.I, A = RB.A, SPR = RB.SPR, M = RB.M, UI = RB.UI;
  const INK = '#1d1b33';
  const S = RB.Scenes = {};

  // ---------------- stars ----------------
  const stars = [];
  for (let i = 0; i < 140; i++) stars.push({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, tw: Math.random() * 6 });
  function drawStars(g, t, speed) {
    g.fillStyle = '#0b0b1a'; g.fillRect(0, 0, D.W, D.H);
    const grd = g.createLinearGradient(0, 0, 0, D.H); grd.addColorStop(0, 'rgba(60,30,120,0.35)'); grd.addColorStop(1, 'rgba(20,60,120,0.25)');
    g.fillStyle = grd; g.fillRect(0, 0, D.W, D.H);
    for (const s of stars) {
      const x = ((s.x * D.W - t * speed * s.z * 60) % D.W + D.W) % D.W, y = s.y * D.H;
      const b = 0.5 + 0.5 * Math.sin(t * 2 + s.tw);
      g.fillStyle = s.z > 0.8 ? '#ffffff' : b > 0.5 ? '#c9cfff' : '#6d72a8';
      const len = speed > 3 ? Math.round(speed * s.z) : 1;
      g.fillRect(Math.round(x), Math.round(y), len, s.z > 0.92 ? 2 : 1);
    }
  }
  RB.drawStars = drawStars;
  function bigButton(g, it, focused, s) { UI.button(g, it, focused, { s: s || 2, fill: it.fill || '#ffd23f', top: '#fff6c2' }); }

  // ---------------- title ----------------
  S.title = {
    enter() {
      this.t = 0; this.mode = 'main'; A.playMusic('title');
      const save = RB.loadGame();
      this.save = save;
      const main = [];
      if (save) main.push({ label: 'KEEP GOING', act: () => { RB.G = save; RB.go('intro'); } });
      main.push({ label: save ? 'NEW GAME' : 'PLAY', fill: save ? '#ffffff' : '#ffd23f', act: () => { this.mode = 'level'; this.lv.focus = 0; } });
      this.main = UI.menu(main, { cols: main.length });
      this.lv = UI.menu(M.LEVELS.map((L, i) => ({ label: L.name, act: () => { RB.newGame(i); RB.go('intro'); } })), { cols: 3 });
      this.back = { r: null };
      this.arcade = { r: null };
    },
    update(dt) {
      this.t += dt;
      for (const e of I.taps()) {
        if (U.inRect(e.x, e.y, this.arcade.r)) { A.play('click'); window.location.href = '../index.html'; return; }
        if (this.mode === 'level' && U.inRect(e.x, e.y, this.back.r)) { A.play('click'); this.mode = 'main'; return; }
      }
      if (this.mode === 'main') this.main.update();
      else { if (I.hit('back')) { this.mode = 'main'; return; } this.lv.update(); }
    },
    draw(g) {
      const t = this.t;
      drawStars(g, t, 0.4);
      const pl = RB.planet(this.save ? Math.min(3, this.save.world) : 0, 64);
      g.drawImage(pl, Math.round(D.W - 110), Math.round(D.H - 90));
      RB.drawShip(g, Math.round(D.W * 0.18), Math.round(D.H * 0.62 + Math.sin(t * 2) * 4), new Set(RB.PARTS.flat()), t, { flame: true }, 1);
      // arcade link
      this.arcade.r = { x: 4, y: 4, w: 62, h: 16 };
      RB.box(g, 4, 4, 62, 16, 'rgba(29,27,51,0.85)', '#000'); F.draw(g, '< ARCADE', 35, 9, { c: '#ffffff', a: 'center' });
      const s1 = D.W > 330 ? 5 : 4, s2 = s1 - 1;
      const ty = Math.round(D.H * 0.12);
      F.draw(g, 'ROCKET', D.W / 2, ty + Math.round(Math.sin(t * 2) * 2), { s: s1, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      F.draw(g, 'BUILDER', D.W / 2, ty + 7 * s1 + 6, { s: s2, c: '#ffffff', a: 'center', o: INK, sh: '#3fa9f5' });
      F.draw(g, 'A SPACE MATH ADVENTURE', D.W / 2, ty + 7 * s1 + 7 * s2 + 14, { c: '#9ff3ff', a: 'center', o: INK });
      // the four planets
      const oy = ty + 7 * s1 + 7 * s2 + 42;
      ['+', '-', '×', '÷'].forEach((op, i) => {
        const x = Math.round(D.W / 2 - 54 + i * 36);
        g.drawImage(RB.planet(i, 12), x - 13, oy - 13 + Math.round(Math.sin(t * 2 + i) * 2));
        F.draw(g, op, x, oy - 3 + Math.round(Math.sin(t * 2 + i) * 2), { s: 1, c: '#ffffff', a: 'center', o: INK });
      });
      if (this.mode === 'main') {
        const items = this.main.items, bw = Math.max(110, ...items.map((it) => F.width(it.label, 2) + 16)), tot = items.length * bw + (items.length - 1) * 10;
        items.forEach((it, i) => { it.r = { x: Math.round(D.W / 2 - tot / 2 + i * (bw + 10)), y: Math.round(D.H * 0.72), w: bw, h: 28 }; bigButton(g, it, i === this.main.focus); });
        const hint = I.touch ? 'TAP TO PICK' : 'ARROWS + ENTER';
        F.draw(g, hint, D.W / 2, D.H - 12, { c: '#6d72a8', a: 'center' });
      } else {
        const p = UI.panel(g, 330, 150);
        F.draw(g, 'PICK YOUR LEVEL', p.x + p.w / 2, p.y + 10, { s: 2, c: '#ffd23f', a: 'center', o: INK });
        const bw = Math.floor((p.w - 32) / 3);
        this.lv.items.forEach((it, i) => {
          const r = it.r = { x: p.x + 8 + i * (bw + 8), y: p.y + 32, w: bw, h: 82 };
          const f = i === this.lv.focus;
          RB.box(g, r.x, r.y, r.w, r.h, f ? '#ffd23f' : '#ffffff', f ? '#ffffff' : INK, '#000');
          for (let k = 0; k < M.LEVELS[i].stars; k++) F.draw(g, '★', r.x + r.w / 2 - (M.LEVELS[i].stars - 1) * 6 + k * 12, r.y + 8, { s: 2, c: '#ff4d5e', a: 'center', o: INK });
          g.drawImage(SPR.player.down[0], r.x + r.w / 2 - 8, r.y + 26);
          F.draw(g, it.label, r.x + r.w / 2, r.y + 48, { c: INK, a: 'center' });
          F.draw(g, M.LEVELS[i].ages, r.x + r.w / 2, r.y + 62, { c: '#5a5780', a: 'center' });
        });
        this.back.r = { x: p.x + p.w / 2 - 30, y: p.y + p.h - 28, w: 60, h: 20 };
        UI.button(g, { r: this.back.r, label: 'BACK' }, false, { fill: '#4a4766', top: '#5a5780', text: '#ffffff' });
      }
    },
  };

  // ---------------- planet intro card ----------------
  S.intro = {
    enter() {
      const wi = RB.G.world, def = RB.WORLD_DEFS[wi];
      this.t = 0; A.playMusic('w' + wi);
      this.menu = UI.menu([{ label: 'GO!', act: () => RB.go('play') }]);
      UI.talk(`Planet ${def.name.toLowerCase()}. ${def.sub.toLowerCase()} Find 4 rocket parts!`);
    },
    update(dt) { this.t += dt; if (this.t > 0.4) this.menu.update(); },
    draw(g) {
      const t = this.t, wi = RB.G.world, def = RB.WORLD_DEFS[wi], T = RB.THEMES[wi];
      drawStars(g, t, 0.3);
      const narrow = D.W < 330, pr = narrow ? 34 : 48;
      const px = narrow ? D.W / 2 : D.W * 0.28, py = narrow ? 70 : D.H * 0.46;
      g.drawImage(RB.planet(wi, pr), Math.round(px - pr), Math.round(py - pr));
      // big math sign on the planet
      RB.circle(g, px, py, 16, INK); RB.circle(g, px, py, 14, '#ffffff');
      F.draw(g, def.op, px + 1, py - 10, { s: 3, c: T.hazard[1], a: 'center' });
      const cx = narrow ? D.W / 2 : D.W * 0.66, top = narrow ? 120 : D.H * 0.16;
      F.draw(g, 'PLANET ' + (wi + 1), cx, top, { s: 1, c: '#9ff3ff', a: 'center' });
      F.draw(g, def.name, cx, top + 12, { s: narrow ? 3 : 4, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      F.draw(g, def.sub, cx, top + (narrow ? 38 : 46), { s: 2, c: '#ffffff', a: 'center', o: INK });
      // find 4 parts
      const sy = top + (narrow ? 58 : 70);
      F.draw(g, 'FIND', cx - 44, sy + 4, { c: '#ffffff', a: 'center' });
      for (let i = 0; i < 4; i++) { g.drawImage(SPR.crate[wi], Math.round(cx - 28 + i * 18), sy); }
      // controls reminder
      const ky = sy + 26;
      if (I.touch) {
        RB.circle(g, cx - 40, ky + 8, 8, '#4a4766'); RB.circle(g, cx - 40, ky + 8, 3, '#ffffff'); F.draw(g, 'MOVE', cx - 28, ky + 5, { c: '#ffffff' });
        RB.circle(g, cx + 20, ky + 8, 8, '#ff4d5e'); g.drawImage(SPR.icon['laser' + RB.G.ab.laser], cx + 14, ky + 2); F.draw(g, 'ZAP', cx + 32, ky + 5, { c: '#ffffff' });
      } else {
        keyCap(g, cx - 66, ky, '<'); keyCap(g, cx - 54, ky, '>'); F.draw(g, 'MOVE', cx - 39, ky + 4, { c: '#ffffff' });
        RB.box(g, cx + 2, ky, 34, 15, '#ffffff', INK); F.draw(g, 'SPACE', cx + 19, ky + 4, { c: INK, a: 'center' }); F.draw(g, 'ZAP', cx + 41, ky + 4, { c: '#ffffff' });
      }
      const it = this.menu.items[0]; it.r = { x: Math.round(cx - 45), y: Math.min(D.H - 36, ky + 24), w: 90, h: 28 };
      bigButton(g, it, true, 3);
    },
  };
  function keyCap(g, x, y, ch) { RB.box(g, x, y, 11, 15, '#ffffff', INK); F.draw(g, ch, x + 6, y + 4, { c: INK, a: 'center' }); }

  // ---------------- play ----------------
  S.play = {
    enter() { RB.Play.load(RB.G.world); A.playMusic('w' + RB.G.world); RB.saveGame(); },
    update(dt) { RB.Play.update(dt); },
    draw(g) { RB.Play.draw(g); },
  };

  // ---------------- blast off + space flight ----------------
  S.launch = {
    enter() {
      this.t = 0; this.from = RB.G.world; this.to = this.from + 1; this.counted = 0;
      this.ry = D.H / 2; this.vy = 0; this.objs = []; this.spawn = 0; this.got = 0; this.wob = 0; this.done = false;
      this.parts = RB.allParts();
      A.playMusic('space'); RB.saveGame();
      UI.talk('3, 2, 1, blast off!');
    },
    update(dt) {
      const t = (this.t += dt);
      const marks = [0.2, 1.0, 1.8];
      while (this.counted < 3 && t > marks[this.counted]) { this.counted++; A.play('count'); }
      if (this.counted === 3 && t > 2.6 && !this.lifted) { this.lifted = true; A.play('go'); A.play('launch'); }
      if (t > 3.8 && t < 17) {
        // steer the rocket up and down, grab stars, bump space rocks
        let dy = 0;
        if (I.down('up')) dy -= 1; if (I.down('down')) dy += 1;
        for (const p of I.pointers.values()) { dy = U.clamp((p.y - this.ry) / 20, -1, 1); }
        this.ry = U.clamp(this.ry + dy * 110 * dt, 24, D.H - 20);
        this.spawn -= dt;
        if (this.spawn <= 0 && t < 15.5) {
          this.spawn = U.rnd(0.35, 0.7);
          const rock = Math.random() < 0.3;
          this.objs.push({ x: D.W + 10, y: U.rnd(24, D.H - 20), rock, vx: rock ? U.rnd(70, 100) : U.rnd(90, 120), a: Math.random() * 6 });
        }
      }
      this.wob = Math.max(0, this.wob - dt);
      for (const o of this.objs) {
        o.x -= o.vx * dt; o.a += dt * 3;
        if (!o.hit && Math.abs(o.x - 60) < 14 && Math.abs(o.y - this.ry) < 13) {
          o.hit = true;
          if (o.rock) { this.wob = 0.5; A.play('land'); } else { this.got++; RB.G.stats.gems++; A.play('gem'); }
        }
      }
      this.objs = this.objs.filter((o) => o.x > -20 && !(o.hit && !o.rock));
      if (t > 20.5 && !this.done) { this.done = true; RB.finishWorld(); }
    },
    draw(g) {
      const t = this.t, T = RB.THEMES[this.from];
      if (t < 3.8) {
        // on the launch pad
        const rise = t > 2.6 ? Math.pow(t - 2.6, 2) * 90 : 0, shake = t > 2.3 ? Math.round(Math.sin(t * 70) * 1.5) : 0;
        const sky = g.createLinearGradient(0, 0, 0, D.H); sky.addColorStop(0, '#0b0b1a'); sky.addColorStop(1, T.bg);
        g.fillStyle = sky; g.fillRect(0, 0, D.W, D.H);
        drawStarsOnly(g, t);
        const gy = Math.round(D.H * 0.78 + rise * 0.3);
        g.fillStyle = T.ground[1]; g.fillRect(0, gy, D.W, D.H - gy); g.fillStyle = T.ground[0]; g.fillRect(0, gy, D.W, 4);
        RB.drawShip(g, D.W / 2 + shake, gy + 2 - rise, this.parts, t, { flame: t > 2.3 }, 2);
        if (t > 2.3) for (let k = 0; k < 14; k++) { const a = U.hash(k, Math.floor(t * 10), 3); g.fillStyle = 'rgba(220,220,230,0.6)'; g.fillRect(Math.round(D.W / 2 - 40 + a * 80), gy - 6 + Math.round(U.hash(k, 1, Math.floor(t * 10)) * 8), 6, 4); }
        if (this.counted && t < 2.6) F.draw(g, String(4 - this.counted), D.W / 2, D.H * 0.2, { s: 6, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
        if (t >= 2.6) F.draw(g, 'BLAST OFF!', D.W / 2, D.H * 0.2, { s: 4, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
        return;
      }
      drawStars(g, t, 5);
      const last = this.to >= 4, k = U.clamp((t - 16) / 4.5, 0, 1);
      if (k > 0) { const r = Math.round(8 + k * 70); g.drawImage(RB.planet(last ? 0 : this.to, r), Math.round(D.W + 20 - k * (D.W * 0.45) - r), Math.round(D.H / 2 - r)); }
      for (const o of this.objs) {
        if (o.rock) { RB.circle(g, o.x, o.y, 7, '#6d5148'); RB.circle(g, o.x - 2, o.y - 2, 3, '#8a6a5e'); g.fillStyle = '#33241f'; g.fillRect(Math.round(o.x + 2), Math.round(o.y + 1), 2, 2); }
        else { F.draw(g, '★', Math.round(o.x), Math.round(o.y - 7), { s: 2, c: Math.floor(o.a) % 2 ? '#ffd23f' : '#fff6a8', a: 'center', o: INK }); }
      }
      // sideways rocket
      g.save(); g.translate(60, Math.round(this.ry + (this.wob > 0 ? Math.sin(t * 50) * 3 : 0))); g.rotate(Math.PI / 2);
      RB.drawShip(g, 0, 20, this.parts, t, { flame: true }, 1); g.restore();
      // trip bar
      const bw = Math.min(200, D.W - 80), bx = Math.round(D.W / 2 - bw / 2), prog = U.clamp((t - 3.8) / 16, 0, 1);
      RB.box(g, bx - 2, 6, bw + 4, 10, INK, '#000'); g.fillStyle = '#5dff9e'; g.fillRect(bx, 8, Math.round(bw * prog), 6);
      g.drawImage(RB.planet(this.from, 6), bx - 18, 5); g.drawImage(RB.planet(last ? 0 : this.to, 6), bx + bw + 4, 5);
      F.draw(g, '★ ' + this.got, D.W - 8, D.H - 14, { c: '#ffd23f', a: 'right', o: INK });
      if (t < 6.5) F.draw(g, I.touch ? 'TOUCH TO STEER  ·  GRAB STARS' : 'UP / DOWN  ·  GRAB STARS', D.W / 2, D.H - 16, { c: '#ffffff', a: 'center', o: INK });
      if (t > 17.5) F.draw(g, last ? 'HOME!' : 'PLANET ' + (this.to + 1) + '!', D.W / 2, D.H * 0.22, { s: 3, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
    },
  };
  function drawStarsOnly(g, t) {
    for (const s of stars) { if (s.y > 0.7) continue; g.fillStyle = s.z > 0.7 ? '#ffffff' : '#8d93c9'; g.fillRect(Math.round(s.x * D.W), Math.round(s.y * D.H * 0.8), 1, 1); }
  }

  // ---------------- the end ----------------
  S.win = {
    enter() {
      this.t = 0; this.fw = []; A.playMusic('win'); A.play('win');
      this.menu = UI.menu([{ label: 'PLAY AGAIN', act: () => RB.go('title') }, { label: 'ARCADE', act: () => { window.location.href = '../index.html'; } }], { cols: 2 });
      UI.talk('You did it! You built the super rocket and flew home. Great math, space explorer!');
    },
    update(dt) {
      this.t += dt;
      if (Math.random() < dt * 3) {
        const x = U.rnd(30, D.W - 30), y = U.rnd(20, D.H * 0.5), c = U.pick(['#ff4d5e', '#ffd23f', '#5dff9e', '#4fd6ff', '#c86bff']);
        for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; this.fw.push({ x, y, vx: Math.cos(a) * U.rnd(30, 60), vy: Math.sin(a) * U.rnd(30, 60), life: 1.2, c }); }
        A.play('tink');
      }
      for (const p of this.fw) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; p.life -= dt; }
      this.fw = this.fw.filter((p) => p.life > 0);
      if (this.t > 1) this.menu.update();
    },
    draw(g) {
      const t = this.t, st = RB.G.stats;
      drawStars(g, t, 0.3);
      for (const p of this.fw) { g.globalAlpha = Math.min(1, p.life * 2); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
      g.globalAlpha = 1;
      g.drawImage(RB.planet(0, 30), D.W - 70, D.H - 70);
      F.draw(g, 'YOU DID IT!', D.W / 2, 12, { s: D.W > 330 ? 4 : 3, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      RB.drawShip(g, Math.round(D.W * 0.25), Math.round(D.H * 0.62 + Math.sin(t * 2) * 3), RB.allParts(), t, { flame: true }, 2);
      const x = Math.round(D.W * 0.5), y = 50;
      const row = (i, icon, n) => { g.drawImage(icon, x, y + i * 22); F.draw(g, String(n), x + 18, y + i * 22 + 2, { s: 2, c: '#ffffff', o: INK }); };
      row(0, SPR.gem[1], st.gems);
      g.fillStyle = '#5dff9e'; g.fillRect(x + 1, y + 27, 3, 3); g.fillRect(x + 4, y + 25, 2, 3); g.fillRect(x + 6, y + 22, 2, 4);
      F.draw(g, String(st.solved), x + 18, y + 24, { s: 2, c: '#ffffff', o: INK }); F.draw(g, 'MATH', x + 18 + F.width(String(st.solved), 2) + 6, y + 28, { c: '#9ff3ff' });
      g.drawImage(SPR.alien[0].open, x - 2, y + 42);
      F.draw(g, String(st.zapped), x + 18, y + 46, { s: 2, c: '#ffffff', o: INK }); F.draw(g, 'ZAPPED', x + 18 + F.width(String(st.zapped), 2) + 6, y + 50, { c: '#9ff3ff' });
      F.draw(g, M.LEVELS[RB.G.level].name + ' ' + '★'.repeat(M.LEVELS[RB.G.level].stars), x, y + 72, { c: '#ffd23f' });
      const bw = 96;
      this.menu.items.forEach((it, i) => { it.r = { x: Math.round(D.W / 2 - bw - 5 + i * (bw + 10)), y: D.H - 34, w: bw, h: 26 }; UI.button(g, it, i === this.menu.focus, { fill: i ? '#ffffff' : '#ffd23f', top: '#fff' }); });
    },
  };
})(window.RB);
