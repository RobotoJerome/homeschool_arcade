/* Squirrelock Holmes — visual-novel dialogue box: a character portrait with an expression,
   a name plate, and typed-out text. SQH.Talk.play(lines, story) returns a Promise that
   resolves when the last line is dismissed (Continue, Enter, Space, or Esc to skip). */
'use strict';
(function (SQH) {
  const RIGHT = new Set(['holmes', 'watson']);
  let dlg, portrait, nameEl, tagEl, textEl, srEl, nextBtn, sayBtn;
  let lines = [], i = 0, timer = 0, full = '', resolveFn = null, story = null, shown = 0;

  function init() {
    dlg = document.getElementById('dlg-talk');
    portrait = document.getElementById('talk-portrait');
    nameEl = document.getElementById('talk-name');
    tagEl = document.getElementById('talk-tag');
    textEl = document.getElementById('talk-text');
    nextBtn = document.getElementById('talk-next');
    sayBtn = document.getElementById('talk-say');
    textEl.setAttribute('aria-hidden', 'true');
    srEl = SQH.h('p', { class: 'sr-only', 'aria-live': 'polite' });
    textEl.after(srEl);
    nextBtn.addEventListener('click', advance);
    textEl.addEventListener('click', advance);
    sayBtn.hidden = !SQH.Speech.can;
    sayBtn.addEventListener('click', () => { stopTyping(); SQH.Speech.speak(nameEl.textContent + '. ' + full); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); finish(); });
  }
  function stopTyping() { clearInterval(timer); timer = 0; textEl.textContent = full; }
  function show(k) {
    const L = lines[k], p = SQH.person(L.who, story);
    dlg.classList.toggle('is-right', RIGHT.has(L.who));
    portrait.innerHTML = SQH.Art.portraitSvg(L.who, L.face);
    nameEl.textContent = p.name;
    tagEl.hidden = !L.tag; tagEl.textContent = L.tag || '';
    full = String(L.text || '');
    srEl.textContent = p.name + ': ' + full;
    nextBtn.innerHTML = '';
    nextBtn.append(k === lines.length - 1 ? (L.done || 'Done') : 'Continue ▸');
    SQH.Speech.say(full);
    clearInterval(timer);
    if (SQH.reduced()) { textEl.textContent = full; return; }
    shown = 0; textEl.textContent = '';
    timer = setInterval(() => {
      shown = Math.min(full.length, shown + 2);
      textEl.textContent = full.slice(0, shown);
      if (shown % 6 === 0) SQH.Sound.type();
      if (shown >= full.length) { clearInterval(timer); timer = 0; }
    }, 18);
  }
  function advance() {
    if (timer) { stopTyping(); return; }
    if (i < lines.length - 1) { i++; show(i); } else finish();
  }
  function finish() {
    stopTyping();
    SQH.Speech.stop();
    if (dlg.open) dlg.close();
    const r = resolveFn; resolveFn = null;
    if (r) r();
  }
  SQH.Talk = {
    init,
    get open() { return !!(dlg && dlg.open); },
    play(ls, st) {
      if (!dlg) init();
      if (resolveFn) finish();
      return new Promise((res) => {
        lines = ls.filter(Boolean); i = 0; story = st || (SQH.G && SQH.G.story) || null; resolveFn = res;
        if (!lines.length) { finish(); return; }
        if (!dlg.open) dlg.showModal();
        show(0);
        nextBtn.focus();
      });
    },
  };
})(window.SQH);
