/* Squirrelock Holmes — start-up: load the case files, set up the screens, keyboard keys,
   the mute buttons, and pausing when the tab is hidden.
   For grown-ups testing: add ?debug to the address to run the case checker in the console,
   and ?debug&case=bushy-ben-b to open one exact case as a practice run (never saved to the leaderboard). */
'use strict';
(function (SQH) {
  const { $ } = SQH;
  SQH.screen = 'title';
  SQH.showScreen = function (name) {
    SQH.$$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === 'scr-' + name));
    SQH.screen = name;
    if (name !== 'case' && SQH.G.active) SQH.Play.leave();
  };
  SQH.syncMute = function () {
    const on = SQH.Sound.on;
    SQH.$$('.js-mute').forEach((b) => { b.classList.toggle('is-off', !on); b.setAttribute('aria-label', on ? 'Mute sound' : 'Turn sound on'); b.removeAttribute('aria-pressed'); });
  };

  SQH.syncSpeech = function () {
    const on = SQH.Speech.on;
    SQH.$$('.js-speech').forEach((b) => { b.hidden = !SQH.Speech.can; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    SQH.$$('.js-speech-state').forEach((s) => { s.textContent = on ? 'On' : 'Off'; });
  };

  function boot() {
    SQH.Art.installDefs();
    SQH.Fx.init(); SQH.Talk.init(); SQH.Notebook.init();
    SQH.$$('.js-mute').forEach((b) => b.addEventListener('click', () => { SQH.Sound.toggle(); SQH.syncMute(); }));
    SQH.$$('.js-speech').forEach((b) => b.addEventListener('click', () => { SQH.Speech.toggle(); SQH.syncSpeech(); if (SQH.Speech.on) SQH.Speech.speak('Reading aloud is on. Squirrelock Holmes will read every line to you.'); }));
    SQH.syncMute(); SQH.syncSpeech();
    SQH.loadScripts(SQH.CASE_FILES || [], (failed) => {
      if (failed.length) console.error('Squirrelock Holmes could not load these case files:', failed);
      SQH.Screens.init();
      if (SQH.debug) SQH.Validate.log(SQH.Validate.run());
      const want = SQH.debug && SQH.params.get('case');
      const c = want && SQH.cases.find((x) => x.id === want);
      if (c) SQH.Play.start(c, { practice: true });
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (SQH.screen !== 'case' || !SQH.G.active || SQH.G.paused) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'n') { e.preventDefault(); SQH.Notebook.toggle(); }
      else if (k === 's') { e.preventDefault(); SQH.Screens.solve(); }
      else if (k === 'escape') { e.preventDefault(); if (SQH.Notebook.isOpen) SQH.Notebook.close(); else SQH.Play.pause(); }
      else if (k === 'p') { e.preventDefault(); SQH.Play.pause(); }
      else if (/^[1-9]$/.test(k)) SQH.Play.goRoomByNumber(+k);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && SQH.G.active && !SQH.G.paused && SQH.Timer.running) SQH.Play.pause();
    });
  }
  boot();
})(window.SQH);
