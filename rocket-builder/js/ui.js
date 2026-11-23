/* Rocket Builder — pop-up panels: math problems (crates and alien battles), item cards, pause menu and map. */
'use strict';
(function (RB) {
  const U = RB.U, D = RB.D, F = RB.F, I = RB.I, A = RB.A, SPR = RB.SPR, M = RB.M;
  const UI = RB.UI = {};
  const INK = '#1d1b33', PANEL = '#2a2550', PANEL2 = '#3b3570';

  // ---------------- buttons ----------------
  // A menu is a list of buttons; arrow keys move the yellow focus, Enter/Space or a tap presses.
  UI.menu = function (items, opts) {
    const m = { items, focus: (opts && opts.focus) || 0, cols: (opts && opts.cols) || items.length };
    m.update = function () {
      const n = m.items.length; if (!n) return null;
      if (I.hit('left')) { m.focus = (m.focus + n - 1) % n; A.play('click'); }
      if (I.hit('right')) { m.focus = (m.focus + 1) % n; A.play('click'); }
      if (I.hit('up') && m.cols < n) { m.focus = (m.focus + n - m.cols) % n; A.play('click'); }
      if (I.hit('down') && m.cols < n) { m.focus = (m.focus + m.cols) % n; A.play('click'); }
      for (const e of I.taps()) for (let i = 0; i < n; i++) if (U.inRect(e.x, e.y, m.items[i].r)) { m.focus = i; return press(i); }
      if (I.hit('ok')) return press(m.focus);
      return null;
    };
    function press(i) { const it = m.items[i]; if (it.disabled) return null; A.play('click'); it.act && it.act(); return it; }
    return m;
  };
  UI.button = function (g, it, focused, opts) {
    opts = opts || {};
    const r = it.r, fill = it.disabled ? '#4a4766' : opts.fill || '#4fd6ff', top = it.disabled ? '#5a5780' : opts.top || '#9ff3ff';
    const press = focused ? 1 : 0;
    g.fillStyle = '#000'; g.fillRect(r.x + 1, r.y + 3, r.w - 2, r.h - 2);
    RB.box(g, r.x, r.y + press, r.w, r.h - 1, fill, focused ? '#ffd23f' : INK);
    g.fillStyle = top; g.fillRect(r.x + 2, r.y + 1 + press, r.w - 4, 2);
    if (focused) { g.fillStyle = '#ffd23f'; g.fillRect(r.x - 1, r.y + press - 1, r.w + 2, 1); g.fillRect(r.x - 1, r.y + r.h + press - 1, r.w + 2, 1); g.fillRect(r.x - 1, r.y + press, 1, r.h - 1); g.fillRect(r.x + r.w, r.y + press, 1, r.h - 1); }
    const s = opts.s || 1, cx = r.x + r.w / 2, cy = r.y + press + Math.round((r.h - 7 * s) / 2);
    if (it.icon) {
      const ic = it.icon, tw = it.label ? F.width(it.label, s) + 3 : 0, x = Math.round(cx - (ic.width + tw) / 2);
      g.drawImage(ic, x, Math.round(r.y + press + (r.h - ic.height) / 2));
      if (it.label) F.draw(g, it.label, x + ic.width + 3, cy, { s, c: opts.text || INK });
    } else F.draw(g, it.label, cx, cy, { s, c: opts.text || INK, a: 'center' });
  };
  function panel(g, w, h, color) {
    g.fillStyle = 'rgba(11,11,26,0.6)'; g.fillRect(0, 0, D.W, D.H);
    const availH = D.bottom(); // keep answer buttons clear of the phone's own buttons
    w = Math.min(w, D.W - 8); h = Math.min(h, availH - 8);
    const x = Math.round((D.W - w) / 2), y = Math.round((availH - h) / 2);
    g.fillStyle = '#000'; g.fillRect(x + 3, y + 3, w, h);
    RB.box(g, x, y, w, h, color || PANEL, INK);
    g.fillStyle = PANEL2; g.fillRect(x + 2, y + 2, w - 4, 2);
    return { x, y, w, h };
  }
  UI.panel = panel;
  const set = () => RB.settings;
  function talk(text) { if (set().talk) RB.speak(text); }
  UI.talk = talk;

  // ---------------- the math panel (crates and alien battles) ----------------
  function mathPanel(cfg) {
    const S = { cfg, t: 0, prob: null, wrong: new Set(), hint: false, busy: 0, fx: null, finished: false };
    const op = RB.Play.w.def.op, level = RB.G.level;
    const next = () => {
      S.prob = M.make(op, level, cfg.alien && cfg.alien.boss);
      S.wrong = new Set(); S.hint = level === 0; S.focus = 0; S.answered = null;
      S.guard = 0.5; // ignore keys and taps for a moment so a zap or a walk-in can't answer by accident
      talk(S.prob.say);
    };
    next();
    function choose(i) {
      if (S.busy > 0 || S.wrong.has(i) || S.finished) return;
      const v = S.prob.choices[i];
      if (v === S.prob.ans) {
        S.answered = i; A.play('correct'); RB.G.stats.solved++; RB.G.stats.gems++;
        if (cfg.mode === 'crate') {
          cfg.crate.locks++; S.fx = { kind: 'lock', t: 0 };
          setTimeout(() => A.play('lock'), 200);
          if (cfg.crate.locks >= 3) { S.finished = true; S.busy = 1.1; S.after = () => { A.play('open'); cfg.done(true); }; }
          else { S.busy = 0.8; S.after = next; }
        } else {
          const a = cfg.alien, dmg = RB.G.ab.laser;
          S.fx = { kind: 'beam', t: 0 };
          setTimeout(() => { a.hp = Math.max(0, a.hp - dmg); a.flash = 0.3; A.play(dmg === 1 ? 'laser' : dmg === 2 ? 'laser2' : 'laser3'); setTimeout(() => A.play('zapHit'), 120); }, 150);
          if (a.hp - dmg <= 0) { S.finished = true; S.busy = 1.2; S.after = () => cfg.done(true); }
          else { S.busy = 1; S.after = next; }
        }
      } else {
        S.wrong.add(i); S.hint = true; A.play('wrong'); RB.G.stats.wrong++;
        if (cfg.mode === 'battle') {
          S.fx = { kind: 'zap', t: 0 };
          setTimeout(() => { const pl = RB.Play.pl; pl.hearts = Math.max(0, pl.hearts - 1); A.play('hurt'); }, 250);
          if (RB.Play.pl.hearts - 1 <= 0) { S.finished = true; S.busy = 1.1; S.after = () => cfg.done(false); }
          else S.busy = 0.6;
        } else S.busy = 0.3;
        talk('Try again!');
      }
    }
    S.update = function (dt) {
      S.t += dt; if (S.fx) S.fx.t += dt;
      if (cfg.alien) cfg.alien.flash = Math.max(0, cfg.alien.flash - dt);
      if (S.busy > 0) { S.busy -= dt; if (S.busy <= 0 && S.after) { const f = S.after; S.after = null; f(); } return; }
      if (S.guard > 0) { S.guard -= dt; return; }
      const n = 4;
      if (I.hit('n1')) choose(0); if (I.hit('n2')) choose(1); if (I.hit('n3')) choose(2); if (I.hit('n4')) choose(3);
      if (I.hit('left')) { S.focus = (S.focus + n - 1) % n; A.play('click'); }
      if (I.hit('right')) { S.focus = (S.focus + 1) % n; A.play('click'); }
      // Enter picks the yellow-outlined answer. Space does NOT, because Space is the zap button.
      if (I.hit('enter')) choose(S.focus);
      if (I.hit('back') && cfg.mode === 'crate') { cfg.done(null); return; }
      for (const e of I.taps()) {
        (S.btn || []).forEach((r, i) => { if (U.inRect(e.x, e.y, r)) { S.focus = i; choose(i); } });
        if (U.inRect(e.x, e.y, S.hintBtn)) { S.hint = !S.hint; A.play('click'); }
        if (U.inRect(e.x, e.y, S.speakBtn)) RB.speak(S.prob.say);
        if (cfg.mode === 'crate' && U.inRect(e.x, e.y, S.closeBtn)) { cfg.done(null); return; }
      }
      if (I.hit('map')) { S.hint = !S.hint; }
    };
    S.draw = function (g) {
      const pr = S.prob, wi = RB.Play.w.i;
      const p = panel(g, 380, 214, PANEL);
      const narrow = p.w < 300;
      // ---- header ----
      const hy = p.y + 6;
      if (cfg.mode === 'crate') {
        g.drawImage(SPR.crate[wi], p.x + 8, hy + 2, 32, 32);
        for (let i = 0; i < 3; i++) {
          const lit = i < cfg.crate.locks, X = p.x + 50 + i * 20, pop = S.fx && S.fx.kind === 'lock' && i === cfg.crate.locks - 1 && S.fx.t < 0.4 ? 2 : 0;
          RB.circle(g, X + 7, hy + 18, 7 + pop, INK); RB.circle(g, X + 7, hy + 18, 6 + pop, lit ? '#5dff9e' : '#4a4766');
          if (lit) { g.fillStyle = '#ffffff'; g.fillRect(X + 4, hy + 15, 2, 2); }
        }
        F.draw(g, narrow ? 'UNLOCK!' : 'UNLOCK THE BOX!', p.x + p.w - 30, hy + 4, { c: '#ffd23f', a: 'right', o: INK });
        S.closeBtn = { x: p.x + p.w - 22, y: p.y + 4, w: 18, h: 16 };
        RB.box(g, S.closeBtn.x, S.closeBtn.y, 18, 16, '#4a4766', INK); F.draw(g, 'X', S.closeBtn.x + 9, S.closeBtn.y + 5, { c: '#fff', a: 'center' });
        if (S.finished && S.busy < 0.8) { g.globalAlpha = Math.min(1, (0.8 - S.busy) * 3); g.drawImage(SPR.crateOpen, p.x + 8, hy + 2, 32, 32); g.globalAlpha = 1; }
      } else {
        const a = cfg.alien, set1 = SPR.alien[wi], shake = a.flash > 0 ? Math.round(Math.sin(S.t * 60) * 2) : 0;
        const ax = p.x + p.w - 58 + shake, ay = hy - 2 + Math.round(Math.abs(Math.sin(S.t * 4)) * 2);
        g.drawImage(a.flash > 0 ? set1.white : set1.open, ax, ay, 32, 32);
        if (a.boss) g.drawImage(SPR.crown, ax + 9, ay - 6, 14, 10);
        // alien health
        const bw = 46, bx = ax - 12, by = hy + 34;
        g.fillStyle = INK; g.fillRect(bx - 1, by - 1, bw + 2, 6); g.fillStyle = '#4a4766'; g.fillRect(bx, by, bw, 4);
        g.fillStyle = '#ff4d5e'; g.fillRect(bx, by, Math.round((bw * a.hp) / a.max), 4);
        // you
        g.drawImage(SPR.player.right[0], p.x + 10, hy + 2, 32, 32);
        const pl = RB.Play.pl;
        for (let i = 0; i < RB.G.ab.maxHearts; i++) g.drawImage(i < pl.hearts ? SPR.heart : SPR.heartEmpty, p.x + 46 + i * 10, hy + 22);
        F.draw(g, 'ZAP IT!', p.x + p.w / 2 + (narrow ? 6 : 0), hy + 4, { c: '#ffd23f', a: 'center', o: INK });
        // beam / zap effects
        if (S.fx && S.fx.kind === 'beam' && S.fx.t < 0.5) {
          const lv = RB.G.ab.laser, cols = lv === 1 ? ['#ffd23f', '#fff'] : lv === 2 ? ['#3fa9f5', '#c6f2ff'] : ['#c86bff', '#ff8ae2'];
          const k = Math.min(1, S.fx.t / 0.15), x0 = p.x + 40, x1 = U.lerp(x0, ax + 8, k), th = lv + 1;
          g.fillStyle = cols[0]; g.fillRect(x0, hy + 17 - th, x1 - x0, th * 2); g.fillStyle = cols[1]; g.fillRect(x0, hy + 17 - 1, x1 - x0, 2);
          if (lv === 2) { g.fillStyle = cols[0]; g.fillRect(x0, hy + 10, x1 - x0, 2); }
          if (k >= 1) F.draw(g, '-' + lv, ax + 16, hy - 4 - Math.round(S.fx.t * 20), { c: '#ffd23f', a: 'center', o: INK, s: 2 });
        }
        if (S.fx && S.fx.kind === 'zap' && S.fx.t < 0.5) {
          const k = Math.min(1, S.fx.t / 0.25), x0 = ax + 4, x1 = U.lerp(x0, p.x + 30, k);
          g.fillStyle = RB.GEM_COL[wi][0];
          for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 4) g.fillRect(x, hy + 16 + ((x >> 2) % 2 ? -2 : 2), 4, 2);
        }
      }
      // ---- the problem ----
      const ts = p.w < 260 ? 2 : 3, py2 = p.y + 50;
      const txt = pr.text, solved = S.answered != null;
      const shown = solved ? (pr.missing ? `${pr.a} ${pr.op} ${pr.b} = ${pr.c}` : `${pr.a} ${pr.op} ${pr.b} = ${pr.c}`) : txt;
      F.draw(g, shown, p.x + p.w / 2, py2, { s: ts, c: solved ? '#5dff9e' : '#ffffff', a: 'center', o: INK, sh: '#000' });
      if (!solved && Math.floor(S.t * 2) % 2) { // blink the box under "?"
        const qi = [...txt].indexOf('?'), tw = F.width(txt, ts), qx = p.x + p.w / 2 - Math.floor(tw / 2) + qi * 6 * ts;
        g.fillStyle = '#ffd23f'; g.fillRect(qx - 1, py2 + 7 * ts + 2, 5 * ts + 2, 2);
      }
      S.speakBtn = null;
      if (RB.canSpeak) {
        S.speakBtn = { x: p.x + p.w - 24, y: py2 - 2, w: 20, h: 18 };
        RB.box(g, S.speakBtn.x, S.speakBtn.y, 20, 18, '#4a4766', INK); speakerIcon(g, S.speakBtn.x + 4, S.speakBtn.y + 4);
      }
      // ---- hint area ----
      const hy2 = py2 + 7 * ts + 8, btnH = Math.min(36, Math.max(24, Math.floor(p.h * 0.17))), hh = p.y + p.h - btnH - 12 - hy2;
      S.hintBtn = { x: p.x + 6, y: hy2, w: 22, h: Math.min(22, hh) };
      RB.box(g, S.hintBtn.x, S.hintBtn.y, 22, S.hintBtn.h, S.hint ? '#ffd23f' : '#4a4766', INK); bulbIcon(g, S.hintBtn.x + 6, S.hintBtn.y + 3, S.hint);
      if (S.hint && hh > 10) {
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(p.x + 32, hy2, p.w - 64, hh);
        M.drawHint(g, pr, p.x + 36, hy2 + 3, p.w - 72, hh - 6);
      }
      // ---- answer buttons ----
      const gap = 6, bw = Math.floor((p.w - 16 - gap * 3) / 4), by = p.y + p.h - btnH - 6;
      S.btn = [];
      pr.choices.forEach((v, i) => {
        const r = { x: p.x + 8 + i * (bw + gap), y: by, w: bw, h: btnH }; S.btn.push(r);
        const wrong = S.wrong.has(i), right = S.answered === i;
        const it = { r, label: String(v), disabled: wrong };
        const s = bw > 54 && btnH > 30 ? 3 : 2;
        UI.button(g, it, i === S.focus && !wrong && S.answered == null && !I.touch, { s, fill: right ? '#5dff9e' : '#ffffff', top: right ? '#c2ffd9' : '#ffffff', text: INK });
        if (wrong) { g.fillStyle = '#ff4d5e'; for (let k = 0; k < 9; k++) { g.fillRect(r.x + r.w - 13 + k, r.y + 3 + k, 2, 1); g.fillRect(r.x + r.w - 5 - k, r.y + 3 + k, 2, 1); } }
        if (!I.touch) F.draw(g, i + 1, r.x + 3, r.y + 3, { c: '#8d8ab3' });
      });
    };
    return S;
  }
  function speakerIcon(g, x, y) {
    g.fillStyle = '#ffffff'; g.fillRect(x, y + 3, 3, 4); g.fillRect(x + 3, y + 2, 1, 6); g.fillRect(x + 4, y + 1, 1, 8); g.fillRect(x + 5, y, 1, 10);
    g.fillRect(x + 8, y + 2, 1, 6); g.fillRect(x + 10, y, 1, 10);
  }
  function bulbIcon(g, x, y, on) {
    g.fillStyle = on ? '#1d1b33' : '#ffd23f';
    g.fillRect(x + 2, y, 6, 1); g.fillRect(x + 1, y + 1, 8, 6); g.fillRect(x + 2, y + 7, 6, 2);
    g.fillStyle = on ? '#ffffff' : '#fff6c2'; g.fillRect(x + 3, y + 2, 2, 2);
    g.fillStyle = '#a9b0c9'; g.fillRect(x + 3, y + 10, 4, 2); g.fillRect(x + 4, y + 12, 2, 1);
  }
  UI.speakerIcon = speakerIcon;

  UI.openCrate = function (crate) {
    const P = RB.Play;
    P.modal = mathPanel({
      mode: 'crate', crate,
      done(ok) {
        P.modal = null;
        if (ok) {
          crate.opened = true; RB.G.ws.opened.push(crate.n);
          P.burst(crate.x, crate.y - 10, ['#ffffff', '#ffd23f', RB.GEM_COL[P.w.i][0]], 36, 100, { s: 2 });
          A.play('part'); RB.saveGame(); UI.openPart(crate.n);
        }
      },
    });
  };
  UI.openBattle = function (alien, youFirst, done) {
    const P = RB.Play;
    if (alien.boss && !alien.met) { alien.met = true; }
    P.modal = mathPanel({ mode: 'battle', alien, done(won) { P.modal = null; done(won); if (won === false) UI.openOops(); } });
  };

  // ---------------- simple card pop-ups ----------------
  function card(drawBody, buttons, opts) {
    opts = opts || {};
    const S = { t: 0, menu: UI.menu(buttons, { cols: buttons.length }) };
    S.update = (dt) => { S.t += dt; if (S.t < 0.35) return; S.menu.update(); if (opts.anyKeyCloses && (I.hit('back'))) buttons[buttons.length - 1].act(); };
    S.draw = (g) => {
      const p = panel(g, opts.w || 260, opts.h || 170, opts.color);
      drawBody(g, p, S.t);
      const bw = Math.min(110, Math.floor((p.w - 20 - (buttons.length - 1) * 8) / buttons.length)), tot = bw * buttons.length + (buttons.length - 1) * 8;
      buttons.forEach((b, i) => { b.r = { x: Math.round(p.x + (p.w - tot) / 2 + i * (bw + 8)), y: p.y + p.h - 34, w: bw, h: 26 }; UI.button(g, b, i === S.menu.focus, { s: 2, fill: i === 0 ? '#5dff9e' : '#ffffff', top: i === 0 ? '#c2ffd9' : '#fff' }); });
    };
    return S;
  }
  const close = () => { RB.Play.modal = null; };
  UI.openItem = function (id) {
    const pw = RB.POWERS[id];
    talk(pw.say);
    RB.Play.modal = card((g, p, t) => {
      F.draw(g, 'YOU FOUND', p.x + p.w / 2, p.y + 10, { c: '#9ff3ff', a: 'center' });
      const s = 3, cx = p.x + p.w / 2, cy = p.y + 50 + Math.round(Math.sin(t * 3) * 2);
      RB.circle(g, cx, cy, 25, 'rgba(159,243,255,0.2)'); RB.ring(g, cx, cy, 25, '#ffffff');
      for (let k = 0; k < 8; k++) { const a = t * 1.5 + (k * Math.PI) / 4; g.fillStyle = '#ffd23f'; g.fillRect(Math.round(cx + Math.cos(a) * 31), Math.round(cy + Math.sin(a) * 31), 2, 2); }
      g.drawImage(SPR.icon[id], cx - 6 * s, cy - 6 * s, 12 * s, 12 * s);
      F.draw(g, pw.name + '!', cx, p.y + 86, { s: 2, c: '#ffd23f', a: 'center', o: INK });
      itemHow(g, id, cx, p.y + 120, t);
    }, [{ label: 'OK!', act: close }], { h: 190 });
  };
  // tiny picture of what the item does (so there is almost nothing to read)
  function itemHow(g, id, cx, y, t) {
    const sm = SPR.player.right[Math.floor(t * 8) % 3];
    if (id === 'speed') { g.drawImage(sm, cx - 8 + Math.round(Math.sin(t * 4) * 20), y); g.fillStyle = '#fff'; for (let k = 0; k < 3; k++) g.fillRect(cx - 30 + Math.round(Math.sin(t * 4) * 20), y + 4 + k * 4, 8, 1); }
    else if (id === 'spring' || id === 'rocket') {
      const n = id === 'rocket' ? 2 : 1, w = 16 * n;
      g.fillStyle = '#3a8fd6'; g.fillRect(cx - w / 2, y + 12, w, 6);
      const k = (t % 1.6) / 1.6, x = U.lerp(cx - w / 2 - 14, cx + w / 2 + 2, k), z = Math.sin(Math.PI * k) * 12;
      g.drawImage(SPR.player.right[1], Math.round(x), Math.round(y - z));
    } else if (id === 'laser2' || id === 'laser3') {
      g.drawImage(RB.themeArt[1].crack[0], cx + 14, y);
      g.drawImage(SPR.player.right[0], cx - 30, y + 2);
      const k = (t % 1) * 40; g.fillStyle = id === 'laser2' ? '#3fa9f5' : '#c86bff'; g.fillRect(cx - 14 + k, y + 9, 6, 2);
    } else if (id === 'heart') { g.drawImage(SPR.heart, cx - 15, y + 4); g.drawImage(SPR.heart, cx - 4, y + 4); g.drawImage(SPR.heart, cx + 7, y + 4); F.draw(g, '+', cx + 20, y + 5, { c: '#5dff9e' }); }
    else if (id === 'magnet') { g.drawImage(SPR.icon.magnet, cx - 6, y + 2); for (let k = 0; k < 3; k++) { const a = t * 2 + k * 2.1, r = 20 - ((t * 20 + k * 7) % 16); g.drawImage(SPR.gem[3], Math.round(cx - 4 + Math.cos(a) * r), Math.round(y + 4 + Math.sin(a) * r * 0.5)); } }
  }
  UI.openPart = function (n) {
    const P = RB.Play, wi = P.w.i, id = RB.PARTS[wi][n - 1], found = P.partsFound();
    talk(found >= 4 ? 'You found all the parts! Go back to your rocket!' : `You found part ${found} of 4!`);
    P.modal = card((g, p, t) => {
      F.draw(g, found >= 4 ? 'ALL 4 PARTS!' : 'ROCKET PART!', p.x + p.w / 2, p.y + 10, { s: 2, c: '#ffd23f', a: 'center', o: INK });
      RB.drawShip(g, p.x + p.w / 2, p.y + 130, RB.allParts(), t, { highlight: id }, 2);
      for (let i = 0; i < 4; i++) {
        const X = p.x + p.w / 2 - 32 + i * 16, done = RB.G.ws.opened.includes(i + 1);
        g.fillStyle = done ? RB.GEM_COL[wi][0] : '#3b3866'; g.fillRect(X, p.y + 134, 12, 10);
        if (done) F.draw(g, '★', X + 6, p.y + 136, { c: '#fff', a: 'center' });
      }
    }, [{ label: 'OK!', act: close }], { h: 190 });
  };
  UI.openOops = function () {
    const P = RB.Play;
    talk('Oops! Back to your rocket to rest.');
    P.modal = card((g, p, t) => {
      F.draw(g, 'OOPS!', p.x + p.w / 2, p.y + 12, { s: 3, c: '#ff8a9a', a: 'center', o: INK });
      for (let i = 0; i < 3; i++) g.drawImage(SPR.heartEmpty, p.x + p.w / 2 - 22 + i * 15, p.y + 44, 13, 12);
      g.drawImage(SPR.player.down[0], p.x + p.w / 2 - 50, p.y + 64, 32, 32);
      F.draw(g, '>', p.x + p.w / 2 - 6, p.y + 76, { s: 2, c: '#fff' });
      RB.drawShip(g, p.x + p.w / 2 + 34, p.y + 112, RB.allParts(), t, {}, 1);
    }, [{ label: 'OK', act: () => { P.modal = null; P.resetPlayer(false); P.pl.hearts = RB.G.ab.maxHearts; A.play('heal'); } }]);
  };
  UI.openLaunch = function () {
    const P = RB.Play;
    talk('Ready to blast off?');
    P.modal = card((g, p, t) => {
      F.draw(g, 'BLAST OFF?', p.x + p.w / 2, p.y + 10, { s: 2, c: '#ffd23f', a: 'center', o: INK });
      RB.drawShip(g, p.x + p.w / 2, p.y + 132, RB.allParts(), t, { flame: Math.floor(t * 3) % 2 === 0 }, 2);
    }, [{ label: 'GO!', act: () => { P.modal = null; RB.go('launch'); } }, { label: 'NOT YET', act: close }], { h: 190 });
  };
  UI.openMap = function () {
    const P = RB.Play; A.play('click');
    P.modal = { t: 0, update(dt) { this.t += dt; if (this.t > 0.2 && (I.hit('map') || I.hit('back') || I.hit('ok') || I.taps().length)) { P.modal = null; A.play('click'); } }, draw(g) { P.drawMap(g); } };
  };

  // ---------------- pause menu ----------------
  UI.openPause = function () {
    const P = RB.Play, st = RB.settings;
    const lab = (name, on) => name + (on ? ': ON' : ': OFF');
    const items = [
      { label: 'PLAY', act: () => { P.modal = null; } },
      { label: 'MAP', act: () => UI.openMap() },
      { label: lab('MUSIC', st.music), act: () => { st.music = !st.music; A.musicOn = st.music; items[2].label = lab('MUSIC', st.music); RB.saveSettings(); } },
      { label: lab('SOUND', st.sfx), act: () => { st.sfx = !st.sfx; A.sfxOn = st.sfx; items[3].label = lab('SOUND', st.sfx); RB.saveSettings(); } },
      { label: lab('TALK', st.talk), act: () => { st.talk = !st.talk; items[4].label = lab('TALK', st.talk); RB.saveSettings(); if (st.talk) RB.speak('I will read to you.'); } },
      { label: 'QUIT', act: () => { P.modal = null; RB.saveGame(); RB.go('title'); } },
    ];
    const S = { t: 0, isPause: true, menu: UI.menu(items, { cols: 2 }) };
    S.update = (dt) => { S.t += dt; if (S.t > 0.2 && I.hit('back')) { P.modal = null; return; } S.menu.update(); };
    S.draw = (g) => {
      const p = panel(g, 260, 170);
      F.draw(g, 'PAUSED', p.x + p.w / 2, p.y + 10, { s: 2, c: '#ffd23f', a: 'center', o: INK });
      const bw = Math.floor((p.w - 30) / 2);
      items.forEach((it, i) => { it.r = { x: p.x + 10 + (i % 2) * (bw + 10), y: p.y + 34 + Math.floor(i / 2) * 32, w: bw, h: 26 }; UI.button(g, it, i === S.menu.focus, { fill: i === 0 ? '#5dff9e' : '#ffffff', top: '#fff' }); });
      F.draw(g, 'PLANET ' + (RB.G.world + 1) + ' - ' + M.LEVELS[RB.G.level].name + (RB.G.practice ? ' - PRACTICE' : ''), p.x + p.w / 2, p.y + p.h - 12, { c: '#8d8ab3', a: 'center' });
    };
    P.modal = S;
  };
})(window.RB);
