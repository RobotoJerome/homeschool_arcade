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
    RB.G = { v: 1, level, world: 0, ab: RB.newAbilities(), stats: { solved: 0, wrong: 0, zapped: 0, gems: 0 }, ws: freshWorld() };
    RB.saveGame();
  };
  RB.saveGame = function () { if (RB.G) RB.store.set('save', RB.G); };
  RB.loadGame = function () {
    const s = RB.store.get('save');
    if (!s || s.v !== 1 || typeof s.world !== 'number' || s.world < 0 || s.world > 3 || !s.ab || !s.ws || !s.stats) return null;
    s.ws = Object.assign(freshWorld(), s.ws);
    s.ab = Object.assign(RB.newAbilities(), s.ab);
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
      const G = RB.G; G.world = wq - 1;
      const ab = G.ab; if (wq >= 2) { ab.speed = true; ab.spring = true; } if (wq >= 3) { ab.laser = 2; ab.maxHearts = 4; } if (wq >= 4) { ab.rocket = true; ab.maxHearts = 5; }
      RB.go('play');
    } else RB.go('title');
  } else RB.go('title');
  requestAnimationFrame(frame);
})(window.RB);
