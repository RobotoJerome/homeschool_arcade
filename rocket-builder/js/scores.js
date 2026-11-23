/* Rocket Builder — high scores: the shared Homeschool Arcade leaderboard (one Top 10 per level),
   arcade-style initials, and the Top 10 screen. Uses ../shared/leaderboard.js. */
'use strict';
(function (RB) {
  const D = RB.D, F = RB.F, I = RB.I, A = RB.A, SPR = RB.SPR, M = RB.M, UI = RB.UI;
  const INK = '#1d1b33';
  const LB = window.ArcadeBoards || null;
  const Sc = RB.Scores = {};

  // Score = stars collected across all 4 planets. Ties go to the faster player.
  Sc.board = (level) => 'rocket-builder:' + ['cadet', 'pilot', 'captain'][level];
  Sc.fmt = (ms) => { const s = Math.floor((ms || 0) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  Sc.load = function (level) {
    const st = { state: 'loading', list: [], offline: false };
    if (!LB) { st.state = 'ready'; return st; }
    LB.list(Sc.board(level)).then((r) => { st.state = 'ready'; st.list = r.list || []; st.offline = r.offline; }).catch(() => { st.state = 'ready'; });
    return st;
  };

  // ---------------- Top 10 table ----------------
  Sc.drawTable = function (g, st, x, y, w, highlightId) {
    const rh = 12;
    F.draw(g, '#', x + 6, y, { c: '#9ff3ff' }); F.draw(g, 'NAME', x + 26, y, { c: '#9ff3ff' });
    F.draw(g, 'STARS', x + w - 52, y, { c: '#9ff3ff', a: 'right' }); F.draw(g, 'TIME', x + w - 6, y, { c: '#9ff3ff', a: 'right' });
    g.fillStyle = '#4a4766'; g.fillRect(x + 2, y + 9, w - 4, 1);
    const top = y + 13;
    if (st.state === 'loading') { F.draw(g, 'LOADING' + '...'.slice(0, 1 + (Math.floor(performance.now() / 300) % 3)), x + w / 2, top + 50, { c: '#ffffff', a: 'center' }); return; }
    if (!st.list.length) {
      F.draw(g, 'NO SCORES YET!', x + w / 2, top + 40, { s: 2, c: '#ffd23f', a: 'center', o: INK });
      F.draw(g, 'BE THE FIRST TO BUILD THE ROCKET', x + w / 2, top + 62, { c: '#ffffff', a: 'center' });
    }
    const medal = ['#ffd23f', '#d9dce8', '#ff9a4d'];
    st.list.slice(0, 10).forEach((e, i) => {
      const ry = top + i * rh, mine = highlightId && e.id === highlightId;
      if (mine) { g.fillStyle = Math.floor(performance.now() / 250) % 2 ? 'rgba(255,210,63,0.45)' : 'rgba(255,210,63,0.25)'; g.fillRect(x + 2, ry - 2, w - 4, rh - 1); }
      const c = i < 3 ? medal[i] : '#ffffff';
      F.draw(g, String(i + 1), x + 6, ry, { c });
      F.draw(g, e.i, x + 26, ry, { c });
      F.draw(g, '★' + e.s, x + w - 52, ry, { c, a: 'right' });
      F.draw(g, Sc.fmt(e.t), x + w - 6, ry, { c: '#c9cfff', a: 'right' });
    });
    if (st.offline || !LB || !LB.online) F.draw(g, 'SCORES SAVED ON THIS DEVICE', x + w / 2, top + 10 * rh + 2, { c: '#8d8ab3', a: 'center' });
  };

  // ---------------- arcade initials (3 letters) ----------------
  // Type letters, or use the up/down arrows (tap them on a tablet). Enter saves.
  Sc.initials = function (onSave, onSkip) {
    const last = String(RB.store.get('initials') || 'AAA').toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'A').slice(0, 3);
    const W = { letters: last.split(''), pos: 0, err: '', t: 0, busy: false, r: {} };
    const bump = (i, d) => { const c = W.letters[i].charCodeAt(0) - 65; W.letters[i] = String.fromCharCode(65 + ((c + d + 26) % 26)); A.play('click'); W.err = ''; };
    function save() {
      const ini = W.letters.join('');
      if (LB && LB.blocked(ini)) { W.err = 'PICK DIFFERENT LETTERS'; A.play('wrong'); return; }
      RB.store.set('initials', ini); W.busy = true; onSave(ini);
    }
    W.update = function (dt) {
      W.t += dt; if (W.busy || W.t < 0.4) return;
      for (const code in I.pressed) if (/^Key[A-Z]$/.test(code)) { W.letters[W.pos] = code.slice(3); W.pos = Math.min(2, W.pos + 1); A.play('click'); W.err = ''; }
      if (I.pressed.Backspace) { W.pos = Math.max(0, W.pos - 1); A.play('click'); }
      if (I.pressed.ArrowLeft) W.pos = (W.pos + 2) % 3;
      if (I.pressed.ArrowRight) W.pos = (W.pos + 1) % 3;
      if (I.pressed.ArrowUp) bump(W.pos, 1);
      if (I.pressed.ArrowDown) bump(W.pos, -1);
      if (I.pressed.Enter || I.pressed.NumpadEnter) { save(); return; }
      for (const e of I.taps()) {
        for (let i = 0; i < 3; i++) {
          if (RB.U.inRect(e.x, e.y, W.r['up' + i])) { W.pos = i; bump(i, 1); }
          if (RB.U.inRect(e.x, e.y, W.r['dn' + i])) { W.pos = i; bump(i, -1); }
          if (RB.U.inRect(e.x, e.y, W.r['slot' + i])) W.pos = i;
        }
        if (RB.U.inRect(e.x, e.y, W.r.save)) { A.play('click'); save(); return; }
        if (RB.U.inRect(e.x, e.y, W.r.skip)) { A.play('click'); onSkip(); return; }
      }
    };
    W.draw = function (g, cx, y) {
      for (let i = 0; i < 3; i++) {
        const x = Math.round(cx - 54 + i * 38), sel = i === W.pos;
        W.r['up' + i] = { x: x - 2, y: y - 2, w: 32, h: 16 }; W.r['slot' + i] = { x, y: y + 16, w: 28, h: 32 }; W.r['dn' + i] = { x: x - 2, y: y + 50, w: 32, h: 16 };
        arrow(g, x + 14, y + 4, -1, sel ? '#ffd23f' : '#8d8ab3'); arrow(g, x + 14, y + 58, 1, sel ? '#ffd23f' : '#8d8ab3');
        RB.box(g, x, y + 16, 28, 32, sel ? '#ffd23f' : '#ffffff', sel && Math.floor(W.t * 3) % 2 ? '#ffffff' : INK);
        F.draw(g, W.letters[i], x + 14, y + 22, { s: 3, c: INK, a: 'center' });
      }
      if (W.err) F.draw(g, W.err, cx, y + 72, { c: '#ff8a9a', a: 'center' });
      const by = y + 84;
      W.r.save = { x: Math.round(cx - 92), y: by, w: 88, h: 24 }; W.r.skip = { x: Math.round(cx + 4), y: by, w: 88, h: 24 };
      UI.button(g, { r: W.r.save, label: W.busy ? 'SAVING...' : 'SAVE' }, !W.busy, { fill: '#5dff9e', top: '#c2ffd9' });
      UI.button(g, { r: W.r.skip, label: 'SKIP' }, false, { fill: '#ffffff', top: '#ffffff' });
      if (!I.touch) F.draw(g, 'TYPE YOUR LETTERS, THEN ENTER', cx, by + 30, { c: '#8d8ab3', a: 'center' });
    };
    return W;
  };
  function arrow(g, cx, y, dir, col) {
    g.fillStyle = col;
    for (let k = 0; k < 6; k++) { const w = dir < 0 ? k * 2 + 1 : (5 - k) * 2 + 1; g.fillRect(Math.round(cx - w / 2), y + k, w, 1); }
  }

  // ---------------- Top 10 screen (from the title) ----------------
  RB.Scenes.boards = {
    enter() {
      this.t = 0; this.level = RB.store.get('lastLevel') || 0; this.st = Sc.load(this.level);
      this.tabs = M.LEVELS.map((L, i) => ({ label: L.name, act: () => { this.level = i; this.st = Sc.load(i); } }));
      this.menu = UI.menu(this.tabs, { cols: 3, focus: this.level });
      this.back = { r: null };
    },
    update(dt) {
      this.t += dt;
      if (I.hit('back')) { RB.go('title'); return; }
      for (const e of I.taps()) if (RB.U.inRect(e.x, e.y, this.back.r)) { A.play('click'); RB.go('title'); return; }
      const before = this.menu.focus; this.menu.update();
      if (this.menu.focus !== before && this.menu.focus !== this.level) this.tabs[this.menu.focus].act();
    },
    draw(g) {
      RB.drawStars(g, this.t, 0.3);
      const p = UI.panel(g, 300, 236);
      F.draw(g, 'TOP 10', p.x + p.w / 2, p.y + 7, { s: 2, c: '#ffd23f', a: 'center', o: INK, sh: '#ff4d5e' });
      const bw = Math.floor((p.w - 24) / 3);
      this.tabs.forEach((it, i) => { it.r = { x: p.x + 8 + i * (bw + 4), y: p.y + 26, w: bw, h: 18 }; UI.button(g, it, i === this.level, { fill: i === this.level ? '#ffd23f' : '#4a4766', top: i === this.level ? '#fff6c2' : '#5a5780', text: i === this.level ? INK : '#ffffff' }); });
      Sc.drawTable(g, this.st, p.x + 8, p.y + 52, p.w - 16);
      this.back.r = { x: p.x + p.w / 2 - 36, y: p.y + p.h - 26, w: 72, h: 20 };
      UI.button(g, { r: this.back.r, label: 'BACK' }, false, { fill: '#ffffff', top: '#fff' });
    },
  };
})(window.RB);
