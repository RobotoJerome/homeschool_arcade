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
      this.top10 = { r: null };
    },
    update(dt) {
      this.t += dt;
      if (this.mode === 'main' && I.pressed.KeyT) { A.play('click'); RB.go('boards'); return; }
      for (const e of I.taps()) {
        if (U.inRect(e.x, e.y, this.arcade.r)) { A.play('click'); window.location.href = '../index.html'; return; }
        if (this.mode === 'main' && U.inRect(e.x, e.y, this.top10.r)) { A.play('click'); RB.go('boards'); return; }
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
      // high scores
      this.top10.r = { x: D.W - 66, y: 4, w: 62, h: 16 };
      RB.box(g, D.W - 66, 4, 62, 16, 'rgba(29,27,51,0.85)', '#000'); F.draw(g, '★ TOP 10', D.W - 35, 9, { c: '#ffd23f', a: 'center' });
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
      UI.talk(def.say);
    },
    update(dt) { this.t += dt; if (this.t > 0.4) this.menu.update(); },
    draw(g) {
      const t = this.t, wi = RB.G.world, def = RB.WORLD_DEFS[wi], T = RB.THEMES[wi], ex = def.ex;
      drawStars(g, t, 0.3);
      const narrow = D.W < 330, fit = (txt, s, w) => (F.width(txt, s) <= w ? s : s - 1);
      // ---- title: planet number, name, and the big idea for this planet ----
      F.draw(g, 'PLANET ' + (wi + 1) + ' OF 4', D.W / 2, 8, { c: '#9ff3ff', a: 'center' });
      F.draw(g, def.name, D.W / 2, 19, { s: narrow ? 3 : 4, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      const hs = fit(def.sub, 2, D.W - 12), hy = narrow ? 44 : 52;
      F.draw(g, def.sub, D.W / 2, hy, { s: hs, c: '#ffffff', a: 'center', o: INK });
      // ---- planet (left) and a picture of an example problem (right) ----
      const top = hy + 7 * hs + 10;
      const lx = narrow ? D.W / 2 : Math.round(D.W * 0.27), rx = narrow ? D.W / 2 : Math.round(D.W * 0.68);
      const pr = narrow ? 28 : Math.max(22, Math.min(36, Math.floor((D.bottom() - top - 76) / 2)));
      const py = top + pr;
      g.drawImage(RB.planet(wi, pr), Math.round(lx - pr), Math.round(py - pr));
      RB.circle(g, lx, py, 13, INK); RB.circle(g, lx, py, 11, '#ffffff');
      F.draw(g, def.op, lx + 1, py - 7, { s: 2, c: T.hazard[1], a: 'center' });
      const ey = narrow ? py + pr + 8 : top, bw = narrow ? D.W - 24 : Math.round(D.W * 0.44);
      RB.box(g, rx - bw / 2, ey, bw, 84, 'rgba(29,27,51,0.85)', '#4a4766');
      M.drawHint(g, { op: def.op, a: ex.a, b: ex.b, c: ex.c, missing: null }, rx - bw / 2 + 6, ey + 5, bw - 12, 42, 15);
      F.draw(g, `${ex.a} ${def.op} ${ex.b} = ${ex.c}`, rx, ey + 52, { s: 2, c: '#5dff9e', a: 'center', o: INK });
      F.draw(g, ex.cap, rx, ey + 71, { c: '#c9cfff', a: 'center' });
      // ---- find 4 parts + controls ----
      const sy = narrow ? ey + 94 : Math.max(py + pr + 10, ey + 94);
      const fx = narrow ? D.W / 2 : lx;
      F.draw(g, 'FIND', fx - 44, sy + 5, { c: '#ffffff', a: 'center' });
      for (let i = 0; i < 4; i++) g.drawImage(SPR.crate[wi], Math.round(fx - 30 + i * 18), sy);
      const kx = narrow ? D.W / 2 : rx, ky = narrow ? sy + 24 : sy;
      if (I.touch) {
        RB.circle(g, kx - 40, ky + 8, 8, '#4a4766'); RB.circle(g, kx - 40, ky + 8, 3, '#ffffff'); F.draw(g, 'MOVE', kx - 28, ky + 5, { c: '#ffffff' });
        RB.circle(g, kx + 20, ky + 8, 8, '#ff4d5e'); g.drawImage(SPR.icon['laser' + RB.G.ab.laser], kx + 14, ky + 2); F.draw(g, 'ZAP', kx + 32, ky + 5, { c: '#ffffff' });
      } else {
        keyCap(g, kx - 66, ky, '<'); keyCap(g, kx - 54, ky, '>'); F.draw(g, 'MOVE', kx - 39, ky + 4, { c: '#ffffff' });
        RB.box(g, kx + 2, ky, 34, 15, '#ffffff', INK); F.draw(g, 'SPACE', kx + 19, ky + 4, { c: INK, a: 'center' }); F.draw(g, 'ZAP', kx + 41, ky + 4, { c: '#ffffff' });
      }
      const it = this.menu.items[0]; it.r = { x: Math.round(D.W / 2 - 45), y: Math.min(ky + 30, D.bottom() - 32), w: 90, h: 28 };
      bigButton(g, it, true, 3);
    },
  };
  function keyCap(g, x, y, ch) { RB.box(g, x, y, 11, 15, '#ffffff', INK); F.draw(g, ch, x + 6, y + 4, { c: INK, a: 'center' }); }

  // ---------------- play ----------------
  S.play = {
    enter() { RB.Play.load(RB.G.world); A.playMusic('w' + RB.G.world); RB.saveGame(); },
    update(dt) {
      // play time for the leaderboard (the clock stops while the pause menu is open)
      if (!(RB.Play.modal && RB.Play.modal.isPause)) RB.G.stats.timeMs = (RB.G.stats.timeMs || 0) + dt * 1000;
      RB.Play.update(dt);
    },
    draw(g) { RB.Play.draw(g); },
  };

  // ---------------- blast off + space flight ----------------
  S.launch = {
    enter() {
      this.t = 0; this.from = RB.G.world; this.to = this.from + 1; this.counted = 0;
      this.ry = D.H / 2; this.vy = 0; this.objs = []; this.spawn = 0; this.got = 0; this.wob = 0; this.done = false; this.announced = false;
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
      if (t < 7) {
        F.draw(g, 'GRAB THE STARS!', D.W / 2, D.bottom() - 30, { s: 2, c: '#ffd23f', a: 'center', o: INK });
        F.draw(g, I.touch ? 'HOLD YOUR FINGER UP OR DOWN TO STEER' : 'STEER WITH THE UP AND DOWN KEYS', D.W / 2, D.bottom() - 12, { c: '#ffffff', a: 'center', o: INK });
      }
      if (t > 17.5) {
        if (!this.announced) { this.announced = true; UI.talk(last ? 'Home sweet home!' : 'Next stop, Planet ' + RB.WORLD_DEFS[this.to].name.toLowerCase() + '!'); }
        F.draw(g, last ? 'HOME SWEET HOME!' : 'NEXT STOP:', D.W / 2, D.H * 0.18, { s: last ? 3 : 2, c: last ? '#ffd23f' : '#ffffff', a: 'center', o: INK, sh: last ? '#ff4d5e' : null });
        if (!last) F.draw(g, 'PLANET ' + RB.WORLD_DEFS[this.to].name + '!', D.W / 2, D.H * 0.18 + 20, { s: 3, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      }
    },
  };
  function drawStarsOnly(g, t) {
    for (const s of stars) { if (s.y > 0.7) continue; g.fillStyle = s.z > 0.7 ? '#ffffff' : '#8d93c9'; g.fillRect(Math.round(s.x * D.W), Math.round(s.y * D.H * 0.8), 1, 1); }
  }

  // ---------------- the end ----------------
  // Celebrate, then (if the score makes the Top 10) type initials, then show the leaderboard.
  S.win = {
    enter() {
      this.t = 0; this.fw = []; this.phase = 'party'; this.newId = null; this.msg = '';
      A.playMusic('win'); A.play('win');
      const G = RB.G;
      this.score = G.stats.gems; this.time = Math.round(G.stats.timeMs || 0); this.level = G.level;
      this.st = RB.Scores.load(this.level);
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
      if (this.phase === 'party') {
        const skip = this.t > 1 && (I.hit('ok') || I.taps().length);
        if ((this.t > 4 || skip) && this.st.state === 'ready') {
          const LB = window.ArcadeBoards;
          if (LB && LB.qualifies(this.st.list, this.score, this.time)) {
            this.phase = 'initials'; A.play('power');
            UI.talk('New high score! Type your initials.');
            this.ini = RB.Scores.initials((ini) => this.saveScore(ini), () => { this.phase = 'board'; });
          } else this.phase = 'board';
        }
      } else if (this.phase === 'initials') this.ini.update(dt);
      else if (this.phase === 'board') this.menu.update();
    },
    saveScore(ini) {
      const LB = window.ArcadeBoards;
      LB.add(RB.Scores.board(this.level), { i: ini, s: this.score, n: 0, t: this.time }).then((r) => {
        if (r.error) { this.ini.busy = false; this.ini.err = 'COULD NOT SAVE - TRY AGAIN'; this.msg = r.error; return; }
        this.st = { state: 'ready', list: r.list, offline: r.offline }; this.newId = r.id; this.phase = 'board'; A.play('part');
      });
    },
    draw(g) {
      const t = this.t, st = RB.G.stats;
      drawStars(g, t, 0.3);
      for (const p of this.fw) { g.globalAlpha = Math.min(1, p.life * 2); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
      g.globalAlpha = 1;
      g.drawImage(RB.planet(0, 30), D.W - 70, D.H - 70);
      F.draw(g, 'YOU DID IT!', D.W / 2, 12, { s: D.W > 330 ? 4 : 3, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      RB.drawShip(g, Math.round(D.W * 0.25), Math.round(D.H * 0.62 + Math.sin(t * 2) * 3), RB.allParts(), t, { flame: true }, 2);
      if (this.phase === 'party') {
        const x = Math.round(D.W * 0.5), y = 50;
        const row = (i, icon, n) => { g.drawImage(icon, x, y + i * 22); F.draw(g, String(n), x + 18, y + i * 22 + 2, { s: 2, c: '#ffffff', o: INK }); };
        row(0, SPR.gem[1], st.gems); F.draw(g, 'STARS', x + 18 + F.width(String(st.gems), 2) + 6, y + 6, { c: '#9ff3ff' });
        g.fillStyle = '#5dff9e'; g.fillRect(x + 1, y + 27, 3, 3); g.fillRect(x + 4, y + 25, 2, 3); g.fillRect(x + 6, y + 22, 2, 4);
        F.draw(g, String(st.solved), x + 18, y + 24, { s: 2, c: '#ffffff', o: INK }); F.draw(g, 'MATH', x + 18 + F.width(String(st.solved), 2) + 6, y + 28, { c: '#9ff3ff' });
        g.drawImage(SPR.alien[0].open, x - 2, y + 42);
        F.draw(g, String(st.zapped), x + 18, y + 46, { s: 2, c: '#ffffff', o: INK }); F.draw(g, 'ZAPPED', x + 18 + F.width(String(st.zapped), 2) + 6, y + 50, { c: '#9ff3ff' });
        F.draw(g, 'TIME ' + RB.Scores.fmt(this.time), x, y + 70, { c: '#c9cfff' });
        F.draw(g, M.LEVELS[this.level].name + ' ' + '★'.repeat(M.LEVELS[this.level].stars), x, y + 84, { c: '#ffd23f' });
        return;
      }
      if (this.phase === 'initials') {
        const p = UI.panel(g, 260, 196);
        F.draw(g, 'NEW HIGH SCORE!', p.x + p.w / 2, p.y + 8, { s: 2, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
        F.draw(g, '★ ' + this.score + ' STARS  -  ' + RB.Scores.fmt(this.time), p.x + p.w / 2, p.y + 28, { c: '#ffffff', a: 'center' });
        F.draw(g, 'YOUR INITIALS', p.x + p.w / 2, p.y + 42, { c: '#9ff3ff', a: 'center' });
        this.ini.draw(g, p.x + p.w / 2, p.y + 54);
        return;
      }
      // the Top 10 for this level
      const p = UI.panel(g, 300, 226);
      F.draw(g, 'TOP 10 - ' + M.LEVELS[this.level].name, p.x + p.w / 2, p.y + 7, { s: 2, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      RB.Scores.drawTable(g, this.st, p.x + 8, p.y + 26, p.w - 16, this.newId);
      if (!this.newId) F.draw(g, 'YOU GOT ★' + this.score + ' IN ' + RB.Scores.fmt(this.time), p.x + p.w / 2, p.y + p.h - 44, { c: '#ffffff', a: 'center' });
      const bw = 96;
      this.menu.items.forEach((it, i) => { it.r = { x: Math.round(p.x + p.w / 2 - bw - 5 + i * (bw + 10)), y: p.y + p.h - 30, w: bw, h: 24 }; UI.button(g, it, i === this.menu.focus, { fill: i ? '#ffffff' : '#ffd23f', top: '#fff' }); });
    },
  };
})(window.RB);
