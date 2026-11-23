/* Rocket Builder — math problems: makes problems for each planet and level, and draws picture hints. */
'use strict';
(function (RB) {
  const U = RB.U, ri = U.ri;
  const M = RB.M = { recent: [] };
  M.OPS = ['+', '-', '×', '÷'];
  M.OP_WORD = { '+': 'plus', '-': 'minus', '×': 'times', '÷': 'divided by' };
  // Levels: 0 = Cadet (ages 5-6), 1 = Pilot (ages 7-8), 2 = Captain (ages 9-10)
  M.LEVELS = [
    { name: 'CADET', stars: 1, ages: 'AGES 5-6' },
    { name: 'PILOT', stars: 2, ages: 'AGES 7-8' },
    { name: 'CAPTAIN', stars: 3, ages: 'AGES 9-10' },
  ];

  function gen(op, L, hard) {
    let a, b, c, missing = null;
    const miss = (p) => Math.random() < p;
    if (op === '+') {
      if (L === 0) { a = ri(1, 8); b = ri(1, 10 - a); if (hard && a + b < 6) { a = ri(3, 6); b = ri(2, 10 - a); } }
      else if (L === 1) { a = ri(2, 15); b = ri(1, 20 - a); if (hard && a + b < 11) b = ri(11 - a, 20 - a); if (miss(0.25)) missing = 'b'; }
      else { a = ri(10, 79); b = ri(5, 99 - a); if (miss(0.2)) missing = 'b'; }
      c = a + b;
    } else if (op === '-') {
      if (L === 0) { a = ri(2, 10); b = ri(1, a); if (hard && a < 6) { a = ri(6, 10); b = ri(1, a); } }
      else if (L === 1) { a = ri(6, 20); b = ri(1, a - 1); if (miss(0.25)) missing = 'b'; }
      else { a = ri(20, 99); b = ri(3, a - 5); if (miss(0.2)) missing = 'b'; }
      c = a - b;
    } else if (op === '×') {
      if (L === 0) { a = ri(1, 5); b = ri(1, 5); if (hard && a * b < 6) { a = ri(2, 5); b = ri(3, 5); } }
      else if (L === 1) { a = ri(2, 10); b = ri(1, 5); if (Math.random() < 0.5) [a, b] = [b, a]; }
      else { a = ri(2, 10); b = ri(2, 10); if (miss(0.2)) missing = 'b'; }
      c = a * b;
    } else {
      let d, q;
      if (L === 0) { d = ri(1, 5); q = ri(1, 5); if (hard) { d = ri(2, 5); q = ri(2, 5); } }
      else if (L === 1) { d = ri(2, 5); q = ri(1, 10); }
      else { d = ri(2, 10); q = ri(2, 10); if (miss(0.15)) missing = 'b'; }
      a = d * q; b = d; c = q;
    }
    return { op, a, b, c, missing, ans: missing === 'b' ? b : c };
  }

  function choices(p, L) {
    const ans = p.ans, set = new Set();
    const near = [1, -1, 2, -2, 3, -3];
    if (ans >= 10 && L > 0) near.push(10, -10);
    if (p.op === '×' && !p.missing) near.push(p.a, -p.a, p.b, -p.b);
    if (p.op === '÷') near.push(1, -1, 2);
    U.shuffle(near);
    near.sort((x, y) => Math.abs(x) - Math.abs(y) + (Math.random() - 0.5) * 3);
    for (const n of near) { const v = ans + n; if (v >= 0 && v !== ans) set.add(v); if (set.size >= 3) break; }
    let k = 4; while (set.size < 3) { if (ans + k !== ans) set.add(ans + k); k++; }
    return U.shuffle([ans, ...set]);
  }

  // Make a new problem for planet op at level L. "hard" is used for the big boss aliens.
  M.make = function (op, L, hard) {
    let p, tries = 0;
    do { p = gen(op, L, hard); tries++; } while (tries < 12 && M.recent.includes(p.op + p.a + '|' + p.b + p.missing));
    M.recent.push(p.op + p.a + '|' + p.b + p.missing); if (M.recent.length > 8) M.recent.shift();
    p.parts = p.missing === 'b' ? [p.a, p.op, '?', '=', p.c] : [p.a, p.op, p.b, '=', '?'];
    p.text = p.parts.join(' ');
    p.choices = choices(p, L);
    const w = M.OP_WORD[p.op];
    p.say = p.missing === 'b' ? `${p.a} ${w} what equals ${p.c}?` : `${p.a} ${w} ${p.b}?`;
    p.full = p.missing === 'b' ? `${p.a} ${p.op} ${p.b} = ${p.c}` : `${p.a} ${p.op} ${p.b} = ${p.c}`;
    return p;
  };

  // ---------------- picture hints ----------------
  // Builds groups of dots, then lays them out side by side and centers them in the box.
  const COL = { a: '#ffd23f', b: '#4fd6ff', hollow: '#ffffff', x: '#ff4d5e', ten: '#5dff9e' };
  function dots(n, perRow, color, pitch, style) {
    const items = [];
    for (let i = 0; i < n; i++) items.push({ x: (i % perRow) * pitch, y: Math.floor(i / perRow) * pitch, c: typeof color === 'function' ? color(i) : color, st: typeof style === 'function' ? style(i) : style });
    return { w: Math.min(n, perRow) * pitch - 1, h: Math.ceil(n / perRow) * pitch - 1, items };
  }
  function baseTen(n, color, pitch) { // tens as tall bars, ones as dots
    const tens = Math.floor(n / 10), ones = n % 10, items = [];
    for (let t = 0; t < tens; t++) items.push({ x: t * (pitch + 1), y: 0, c: COL.ten, st: 'bar', h: pitch * 5 - 1 });
    const ox = tens * (pitch + 1) + (tens ? 2 : 0);
    for (let i = 0; i < ones; i++) items.push({ x: ox + Math.floor(i / 5) * pitch, y: (i % 5) * pitch, c: color, st: 'dot' });
    return { w: ox + Math.ceil(ones / 5) * pitch - (ones ? 1 : 0), h: pitch * 5 - 1, items };
  }
  function sym(ch) { return { w: 10, h: 7, sym: ch, items: [] }; }
  function groupsOf(groups, each, pitch, color) { // division: circles of dots
    const per = Math.min(each, each > 4 ? Math.ceil(Math.sqrt(each)) : each), items = [];
    const gw = per * pitch + 3, gh = Math.ceil(each / per) * pitch + 3;
    for (let g = 0; g < groups; g++) {
      const gx = g * (gw + 3);
      items.push({ x: gx, y: 0, st: 'ringbox', w: gw, h: gh });
      for (let i = 0; i < each; i++) items.push({ x: gx + 2 + (i % per) * pitch, y: 2 + Math.floor(i / per) * pitch, c: color, st: 'dot' });
    }
    return { w: groups * (gw + 3) - 3, h: gh, items };
  }

  M.hintLayout = function (p, pitch) {
    const g = [];
    const big = p.op === '+' ? p.c > 20 : p.op === '-' ? p.a > 20 : false;
    if (p.op === '+') {
      if (big) { g.push(baseTen(p.a, COL.a, pitch), sym('+'), baseTen(p.missing ? p.c - p.a : p.b, COL.b, pitch)); if (p.missing) g[2].unknown = true; }
      else if (p.missing) g.push(dots(p.c, 5, (i) => (i < p.a ? COL.a : COL.hollow), pitch, (i) => (i < p.a ? 'dot' : 'hollow')));
      else g.push(dots(p.a, 5, COL.a, pitch, 'dot'), sym('+'), dots(p.b, 5, COL.b, pitch, 'dot'));
    } else if (p.op === '-') {
      if (big) g.push(baseTen(p.a, COL.a, pitch), sym('-'), baseTen(p.missing ? p.a - p.c : p.b, COL.x, pitch));
      else { const take = p.missing ? p.a - p.c : p.b; g.push(dots(p.a, 5, (i) => (i >= p.a - take ? COL.x : COL.a), pitch, (i) => (i >= p.a - take ? 'cross' : 'dot'))); }
    } else if (p.op === '×') {
      const rows = p.a, cols = p.missing ? p.c / p.a : p.b;
      const d = dots(rows * cols, cols, (i) => (Math.floor(i / cols) % 2 ? COL.b : COL.a), pitch, 'dot');
      g.push(d);
    } else {
      const groups = p.b, each = p.c;
      g.push(groupsOf(groups, each, pitch, COL.a));
    }
    let w = 0, h = 0; g.forEach((x, i) => { w += x.w + (i ? 6 : 0); h = Math.max(h, x.h); });
    return { groups: g, w, h };
  };

  M.drawHint = function (gx, p, x, y, w, h, maxPitch) {
    let pitch = maxPitch || 10, L = M.hintLayout(p, pitch);
    while ((L.w > w || L.h > h) && pitch > 2) { pitch--; L = M.hintLayout(p, pitch); }
    const ds = Math.max(1, pitch - 1);
    let cx = Math.round(x + (w - L.w) / 2);
    const cy = Math.round(y + (h - L.h) / 2);
    for (const grp of L.groups) {
      const oy = cy + Math.round((L.h - grp.h) / 2);
      if (grp.sym) { const ss = pitch >= 7 ? 2 : 1; RB.F.draw(gx, grp.sym, cx + 4 - ss * 2, cy + Math.round(L.h / 2) - Math.round(3.5 * ss), { c: '#ffffff', s: ss }); cx += grp.w + 6; continue; }
      for (const it of grp.items) {
        const px = cx + it.x, py = oy + it.y;
        if (it.st === 'bar') { gx.fillStyle = it.c; gx.fillRect(px, py, ds, it.h); gx.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 1; k < 10; k++) gx.fillRect(px, py + Math.round((k * it.h) / 10), ds, 1); }
        else if (it.st === 'ringbox') { gx.fillStyle = 'rgba(255,255,255,0.12)'; gx.fillRect(px, py, it.w, it.h); gx.fillStyle = '#ffffff'; gx.fillRect(px, py, it.w, 1); gx.fillRect(px, py + it.h - 1, it.w, 1); gx.fillRect(px, py, 1, it.h); gx.fillRect(px + it.w - 1, py, 1, it.h); }
        else if (it.st === 'hollow') { gx.fillStyle = '#ffffff'; gx.fillRect(px, py, ds, ds); if (ds > 2) { gx.fillStyle = '#2a2550'; gx.fillRect(px + 1, py + 1, ds - 2, ds - 2); } }
        else if (it.st === 'cross') { gx.fillStyle = 'rgba(255,77,94,0.35)'; gx.fillRect(px, py, ds, ds); gx.fillStyle = COL.x; for (let k = 0; k < ds; k++) { gx.fillRect(px + k, py + k, 1, 1); gx.fillRect(px + ds - 1 - k, py + k, 1, 1); } }
        else { gx.fillStyle = it.c; gx.fillRect(px, py, ds, ds); }
      }
      if (grp.unknown) RB.F.draw(gx, '?', cx + grp.w + 2, oy, { c: '#ffffff' });
      cx += grp.w + 6;
    }
  };
})(window.RB);
