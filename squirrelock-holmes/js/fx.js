/* Squirrelock Holmes — "juice": impact sparks, screen shake, the DEDUCTION! banner,
   the penalty flash on the timer, and the little toast message. Everything here is
   toned down (no shake, no sparks) when the player prefers reduced motion. */
'use strict';
(function (SQH) {
  const Fx = SQH.Fx = {};
  let canvas = null, ctx = null, parts = [], raf = 0, last = 0;

  function fit() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
  Fx.init = function () {
    canvas = document.getElementById('fx');
    ctx = canvas ? canvas.getContext('2d') : null;
    window.addEventListener('resize', fit);
  };
  function loop(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter((p) => (p.life -= dt) > 0);
    parts.forEach((p) => {
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      const a = Math.max(0, p.life / p.max);
      if (p.ring) {
        const rr = p.r + (1 - a) * p.grow;
        ctx.strokeStyle = `rgba(255,236,170,${a * 0.8})`; ctx.lineWidth = 6 * a + 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.strokeStyle = p.c.replace('A', a.toFixed(2)); ctx.lineWidth = p.w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke();
      }
    });
    if (parts.length) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
  }
  // Sparks burst out from a point on the stage. x, y are 0..1 across the stage.
  Fx.sparks = function (x, y, big) {
    if (!ctx || SQH.reduced()) return;
    fit();
    const W = canvas.width, H = canvas.height, px = x * W, py = y * H, k = W / 1200;
    const cols = ['rgba(255,214,120,A)', 'rgba(255,255,255,A)', 'rgba(184,148,255,A)', 'rgba(255,150,70,A)'];
    const n = big ? 34 : 16;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (big ? 520 : 340) * (0.4 + Math.random()) * k;
      const life = 0.35 + Math.random() * 0.35;
      parts.push({ x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80 * k, g: 900 * k, life, max: life, w: (big ? 4 : 3) * k + 1, c: cols[i % cols.length] });
    }
    parts.push({ ring: true, x: px, y: py, vx: 0, vy: 0, g: 0, r: 10 * k, grow: (big ? 120 : 70) * k, life: 0.3, max: 0.3 });
    if (!raf) raf = requestAnimationFrame(loop);
  };
  Fx.shake = function (big) {
    if (SQH.reduced()) return;
    const st = document.getElementById('stage');
    if (!st) return;
    st.classList.remove('shake', 'shake-big'); void st.offsetWidth;
    st.classList.add(big ? 'shake-big' : 'shake');
    setTimeout(() => st.classList.remove('shake', 'shake-big'), 320);
  };
  // The big slanted banner. Resolves when it has gone.
  Fx.banner = function (text, sub, bad) {
    const b = document.getElementById('banner');
    document.getElementById('banner-text').textContent = text;
    document.getElementById('banner-sub').textContent = sub || '';
    b.classList.remove('show', 'banner--bad'); void b.offsetWidth;
    if (bad) b.classList.add('banner--bad');
    b.classList.add('show');
    return SQH.wait(SQH.reduced() ? 1100 : 1500).then(() => b.classList.remove('show'));
  };
  Fx.penalty = function (text) {
    const p = document.getElementById('timer-pen');
    p.textContent = text;
    p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
    clearTimeout(Fx._pt); Fx._pt = setTimeout(() => p.classList.remove('show'), 1700);
  };
  Fx.toast = function (text, ms) {
    const t = document.getElementById('toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(Fx._tt); Fx._tt = setTimeout(() => t.classList.remove('show'), ms || 2600);
  };
})(window.SQH);
