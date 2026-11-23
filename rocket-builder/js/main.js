/* Rocket Builder — game progress, saving, switching screens, and the main loop. */
'use strict';
(function (RB) {
  const D = RB.D, I = RB.I, A = RB.A;
  RB.DEBUG = /[?&]debug\b/.test(window.location.search);

  // ---------------- settings (music, sound, read-aloud) ----------------
  RB.settings = Object.assign({ music: true, sfx: true, talk: true }, RB.store.get('settings') || {});
  A.musicOn = RB.settings.music; A.sfxOn = RB.settings.sfx;
  RB.saveSettings = () => RB.store.set('settings', RB.settings);

  // ---------------- progress ----------------
  const freshWorld = () => ({ opened: [], powers: [], gems: [], aliens: [], boss: false, broken: [] });
  RB.newGame = function (level) {
    RB.G = { v: 1, level, world: 0, ab: RB.newAbilities(), stats: { solved: 0, wrong: 0, zapped: 0, gems: 0, timeMs: 0 }, ws: freshWorld() };
    RB.store.set('lastLevel', level);
    RB.saveGame();
  };
  RB.saveGame = function () { if (RB.G) RB.store.set('save', RB.G); };
  // Reads the saved game. Anything damaged or hand-edited is ignored (start fresh) instead of crashing the game.
  RB.loadGame = function () {
    const s = RB.store.get('save');
    const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
    const whole = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
    if (!isObj(s) || s.v !== 1 || !whole(s.world, 0, 3) || !whole(s.level, 0, 2) || !isObj(s.ab) || !isObj(s.ws) || !isObj(s.stats)) return null;
    const ws = Object.assign(freshWorld(), s.ws);
    const nums = (a, lo, hi) => Array.isArray(a) && a.every((n) => whole(n, lo, hi));
    if (!nums(ws.opened, 1, 4) || !nums(ws.gems, 0, 99) || !Array.isArray(ws.aliens) || !Array.isArray(ws.powers) || !ws.powers.every((p) => Object.prototype.hasOwnProperty.call(RB.POWERS, p))) return null;
    if (!Array.isArray(ws.broken) || !ws.broken.every((b) => Array.isArray(b) && b.length === 2 && whole(b[0], 0, 99) && whole(b[1], 0, 99))) return null;
    ws.boss = ws.boss === true;
    s.ws = ws;
    const ab = Object.assign(RB.newAbilities(), s.ab);
    ab.laser = whole(ab.laser, 1, 3) ? ab.laser : 1; ab.maxHearts = whole(ab.maxHearts, 3, 6) ? ab.maxHearts : 3;
    ['speed', 'spring', 'rocket', 'magnet'].forEach((k) => { ab[k] = ab[k] === true; });
    s.ab = ab;
    for (const k of ['solved', 'wrong', 'zapped', 'gems']) if (!whole(s.stats[k], 0, 1e6)) s.stats[k] = 0;
    // Games saved before play time was tracked: assume about 10 minutes per finished planet.
    if (!(typeof s.stats.timeMs === 'number' && isFinite(s.stats.timeMs) && s.stats.timeMs >= 0)) s.stats.timeMs = s.world * 10 * 60000;
    s.practice = s.practice === true;
    return s;
  };
  // every rocket part found so far (all earlier planets + this one)
  RB.allParts = function () {
    const set = new Set(), G = RB.G; if (!G) return set;
    for (let w = 0; w < Math.min(G.world, 4); w++) RB.PARTS[w].forEach((p) => set.add(p));
    if (G.world < 4) G.ws.opened.forEach((n) => set.add(RB.PARTS[G.world][n - 1]));
    return set;
  };
  RB.finishWorld = function () {
    const G = RB.G;
    G.world++; G.ws = freshWorld();
    if (G.world >= 4) { G.world = 4; RB.store.del('save'); RB.go('win'); }
    else { RB.saveGame(); RB.go('intro'); }
  };

  // ---------------- screens ----------------
  RB.go = function (name) {
    RB.scene = RB.Scenes[name]; RB.sceneName = name;
    if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    RB.scene.enter && RB.scene.enter();
  };

  // ---------------- main loop ----------------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    try {
      RB.scene.update(dt);
      const g = D.ctx; g.imageSmoothingEnabled = false;
      RB.scene.draw(g);
      D.present();
    } catch (e) { console.error(e); }
    I.endFrame();
    requestAnimationFrame(frame);
  }

  // Grown-up shortcuts for testing: add ?debug to the address (example: index.html?debug&world=3&level=1).
  if (RB.DEBUG) {
    RB.WORLD_DEFS.forEach((d, i) => {
      const w = RB.buildWorld(i), ab = RB.newAbilities();
      if (i >= 1) { ab.speed = true; ab.spring = true; } if (i >= 2) { ab.laser = 2; ab.maxHearts = 4; } if (i >= 3) { ab.rocket = true; ab.maxHearts = 5; }
      const v = RB.verifyWorld(w, ab);
      console.log('[check] planet ' + (i + 1) + ' ' + d.name + ': ' + (v.ok ? 'OK, every part and power-up can be reached' : 'PROBLEM: ' + v.lost.join(', ')));
    });
    const q = new URLSearchParams(window.location.search), wq = parseInt(q.get('world'), 10), lq = parseInt(q.get('level'), 10);
    if (wq >= 1 && wq <= 4) {
      RB.newGame(lq >= 0 && lq <= 2 ? lq : 0);
      // A shortcut run skips planets, so it's practice only: it never goes on the shared leaderboard.
      const G = RB.G; G.world = wq - 1; G.practice = true;
      const ab = G.ab; if (wq >= 2) { ab.speed = true; ab.spring = true; } if (wq >= 3) { ab.laser = 2; ab.maxHearts = 4; } if (wq >= 4) { ab.rocket = true; ab.maxHearts = 5; }
      RB.go('play');
    } else RB.go('title');
  } else RB.go('title');
  requestAnimationFrame(frame);
})(window.RB);
