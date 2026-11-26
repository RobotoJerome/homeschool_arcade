/* Squirrelock Holmes — Top 10 boards on the shared Homeschool Arcade leaderboard
   (../shared/leaderboard.js): one board per level, ranked by fastest time with penalties.
   Every solve counts as 1 point, so the leaderboard's "points, then time" order becomes
   simply "fastest first". If the online board can't be reached, scores stay on this device. */
'use strict';
(function (SQH) {
  const { h } = SQH;
  const LB = () => window.ArcadeBoards || null;
  const Sc = SQH.Scores = {};
  Sc.board = (tier) => 'squirrelock-holmes:' + tier;
  Sc.clean = (v) => String(v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

  Sc.load = function (tier) {
    const lb = LB();
    if (!lb) return Promise.resolve({ list: [], offline: true });
    return lb.list(Sc.board(tier)).catch(() => ({ list: [], offline: true }));
  };
  Sc.qualifies = (list, ms) => { const lb = LB(); return lb ? lb.qualifies(list, 1, ms) : false; };
  Sc.note = (offline) => h('p', { class: 'board__note', text: (offline || !LB() || !LB().online) ? 'Scores saved on this device.' : 'Shared Homeschool Arcade leaderboard.' });
  Sc.table = function (list, mine) {
    if (!list || !list.length) return h('p', { class: 'board__empty', text: 'No times yet. Be the first detective on the board!' });
    const t = h('table', { class: 'board' }, h('thead', {}, h('tr', {}, h('th', { text: '#' }), h('th', { text: 'Name' }), h('th', { text: 'Time' }), h('th', { text: 'Date' }))));
    const tb = h('tbody', {});
    list.slice(0, 10).forEach((e, i) => tb.append(h('tr', { class: mine && e.id === mine ? 'is-mine' : '' },
      h('td', { text: String(i + 1) }), h('td', { text: Sc.clean(e.i) || '???' }), h('td', { text: SQH.fmt(e.t) }), h('td', { text: e.d || '' }))));
    t.append(tb);
    return t;
  };

  // After a solve: practice runs never post; otherwise offer initials if the time makes the Top 10.
  Sc.endFlow = function (area, tier, ms, practice) {
    SQH.store.set('lastTier', tier);
    area.innerHTML = '';
    if (practice) {
      area.append(h('p', { class: 'results__rank', text: 'Practice run: not saved to the leaderboard.' }));
      return Promise.resolve();
    }
    area.append(h('p', { class: 'board__empty', text: 'Checking the Top 10...' }));
    return Sc.load(tier).then((r) => {
      area.innerHTML = '';
      const list = r.list || [];
      if (!LB() || !Sc.qualifies(list, ms)) {
        area.append(h('p', { class: 'results__rank', text: list.length >= 10 ? 'Not quite Top 10 this time. Try another version!' : 'Nice work, detective!' }), Sc.table(list), Sc.note(r.offline));
        return;
      }
      area.append(h('p', { class: 'results__rank', text: 'A Top 10 time!' }));
      const input = h('input', { class: 'initials__input', id: 'ini', type: 'text', maxlength: '3', autocomplete: 'off', autocapitalize: 'characters', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done', 'aria-label': 'Your initials, up to 3 letters', 'aria-describedby': 'ini-msg' });
      input.value = Sc.clean(SQH.store.get('initials', ''));
      const msg = h('p', { class: 'initials__msg', id: 'ini-msg', 'aria-live': 'assertive' });
      const save = h('button', { class: 'btn btn--violet', type: 'button' }, 'Save my time');
      const skip = h('button', { class: 'btn btn--paper btn--sm', type: 'button' }, 'Skip');
      const box = h('div', { class: 'initials' }, h('p', { class: 'initials__head', text: 'Enter your initials' }), input, msg, h('div', { class: 'closed__actions' }, save, skip));
      const tableWrap = h('div', {}, Sc.table(list), Sc.note(r.offline));
      area.append(box, tableWrap);
      input.addEventListener('input', () => { const v = Sc.clean(input.value); if (v !== input.value) input.value = v; msg.textContent = ''; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      skip.addEventListener('click', () => { box.remove(); });
      let busy = false;
      function submit() {
        if (busy) return;
        const ini = Sc.clean(input.value);
        if (!ini) { msg.textContent = 'Type 1 to 3 letters.'; SQH.Sound.nope(); return; }
        if (LB().blocked(ini)) { msg.textContent = 'Please pick different initials.'; SQH.Sound.nope(); return; }
        busy = true; save.disabled = true; msg.textContent = 'Saving...';
        SQH.store.set('initials', ini);
        LB().add(Sc.board(tier), { i: ini, s: 1, n: 0, t: Math.round(ms) }).then((res) => {
          busy = false; save.disabled = false;
          if (res.error) { msg.textContent = res.error; return; }
          SQH.Sound.fanfare();
          box.remove();
          tableWrap.innerHTML = ''; tableWrap.append(Sc.table(res.list, res.id), Sc.note(res.offline));
        }).catch(() => { busy = false; save.disabled = false; msg.textContent = 'Could not save. Try again.'; });
      }
      save.addEventListener('click', submit);
    });
  };
})(window.SQH);
