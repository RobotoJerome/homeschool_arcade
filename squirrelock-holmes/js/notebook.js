/* Squirrelock Holmes — the detective's notebook: every clue found, sorted into
   Deductions, Physical Evidence, Testimony and Documents. Pin two entries and press
   Connect; if they really belong together, Holmes writes a new Deduction. */
'use strict';
(function (SQH) {
  const { h } = SQH;
  const ORDER = ['deduction', 'physical', 'testimony', 'document'];
  let panel, body, btn, countEl, connectBtn, slotA, slotB;
  let found = [], pins = [], fresh = new Set(), opener = null;

  function init() {
    panel = document.getElementById('notebook');
    body = document.getElementById('nb-body');
    btn = document.getElementById('btn-notebook');
    countEl = document.getElementById('nb-count');
    connectBtn = document.getElementById('btn-connect');
    slotA = document.getElementById('pin-a');
    slotB = document.getElementById('pin-b');
    btn.addEventListener('click', toggle);
    document.getElementById('nb-close').addEventListener('click', close);
    connectBtn.addEventListener('click', () => {
      if (pins.length !== 2) return;
      const [a, b] = pins; pins = []; refresh();
      SQH.Play.connect(a, b);
    });
  }
  const item = (id) => SQH.G.idx.get(id);
  function thumb(it) {
    if (it.type === 'deduction') return h('span', { class: 'nb-thumb nb-thumb--ded', svg: SQH.ICON.bulb.replace('<svg', '<svg fill="#ffd23f"') });
    if (it.cat === 'testimony') return h('span', { class: 'nb-thumb', svg: SQH.Art.portraitSvg(it.who, it.face) });
    return h('span', { class: 'nb-thumb', svg: `<svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">${SQH.Art.props[it.prop] || ''}</svg>` });
  }
  function entry(id) {
    const it = item(id), pinned = pins.includes(id);
    const short = it.type === 'deduction' ? it.text : it.think;
    const read = h('button', { class: 'nb-read', type: 'button', onclick: () => SQH.Play.reread(id) },
      h('strong', { text: it.name }), h('span', { text: short }),
      it.type === 'deduction' ? h('span', { class: 'nb-kind', text: (SQH.KINDS[it.kind] || {}).label || 'Deduction' }) : null);
    const pin = h('button', { class: 'pin', type: 'button', 'aria-pressed': pinned ? 'true' : 'false', 'aria-label': (pinned ? 'Unpin ' : 'Pin ') + it.name, onclick: () => togglePin(id) }, pinned ? 'Pinned' : 'Pin');
    const li = h('li', { class: 'nb-item' + (pinned ? ' is-pinned' : '') + (fresh.has(id) ? ' is-new' : ''), 'data-id': id }, thumb(it), read, pin);
    return li;
  }
  function render() {
    if (!body) return;
    body.innerHTML = '';
    ORDER.forEach((cat) => {
      const ids = found.filter((id) => (item(id).cat || 'physical') === cat);
      const sec = h('section', { class: 'nb-sec' }, h('h3', { svg: SQH.catIcon(cat) + `<span>${SQH.CATS[cat].label}</span>` }));
      if (!ids.length) sec.append(h('p', { class: 'nb-empty', text: cat === 'deduction' ? 'None yet. Pin two clues and press Connect.' : 'Nothing yet.' }));
      else sec.append(h('ul', { class: 'nb-list' }, ids.map(entry)));
      body.append(sec);
    });
    fresh.clear();
  }
  function refresh() {
    const name = (id) => (id ? item(id).name : 'Pin a clue');
    slotA.textContent = name(pins[0]); slotB.textContent = name(pins[1]);
    slotA.classList.toggle('is-full', !!pins[0]); slotB.classList.toggle('is-full', !!pins[1]);
    connectBtn.disabled = pins.length !== 2;
    SQH.$$('.nb-item', body).forEach((li) => {
      const on = pins.includes(li.dataset.id);
      li.classList.toggle('is-pinned', on);
      const p = li.querySelector('.pin');
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
      p.textContent = on ? 'Pinned' : 'Pin';
      p.setAttribute('aria-label', (on ? 'Unpin ' : 'Pin ') + item(li.dataset.id).name);
    });
  }
  function togglePin(id) {
    SQH.Sound.pin();
    if (pins.includes(id)) pins = pins.filter((x) => x !== id);
    else { pins.push(id); if (pins.length > 2) pins.shift(); }
    refresh();
    if (pins.length === 2) connectBtn.focus();
  }
  function open() {
    if (!panel.hidden) return;
    opener = document.activeElement;
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
    SQH.Sound.page();
    document.getElementById('nb-close').focus();
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true; btn.setAttribute('aria-expanded', 'false');
    SQH.Sound.page();
    if (opener && document.contains(opener)) opener.focus(); else btn.focus();
  }
  function toggle() { if (panel.hidden) open(); else close(); }

  SQH.Notebook = {
    init, open, close, toggle,
    get isOpen() { return panel && !panel.hidden; },
    reset() { found = []; pins = []; fresh.clear(); if (panel) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); } render(); refresh(); countEl.textContent = '0'; },
    add(id) {
      if (found.includes(id) || !item(id)) return;
      found.push(id); fresh.add(id);
      render(); refresh();
      countEl.textContent = String(found.length);
      countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump');
    },
    get pins() { return pins.slice(); },
  };
})(window.SQH);
