/*
 * Homeschool Arcade — shared leaderboard helper for every game
 * ------------------------------------------------------------
 * Load ../shared/arcade-config.js first, then this file. A game then uses:
 *
 *   ArcadeBoards.list('rocket-builder:cadet')            -> Promise { list, offline }
 *   ArcadeBoards.add('rocket-builder:cadet', entry)      -> Promise { list, id, offline } or { error }
 *        entry = { i: 'ABC', s: points, n: outOf (0 if no maximum), t: timeMs }
 *   ArcadeBoards.qualifies(list, points, timeMs)         -> true if it makes the Top 10
 *   ArcadeBoards.blocked('ABC')                          -> true if those initials aren't allowed
 *
 * Every board name must also be listed in GAMES in tools/leaderboard/Code.gs.
 * If the online board can't be reached, scores are kept on this device instead,
 * so a game always works.
 */
'use strict';
window.ArcadeBoards = (function () {
  const URL = String((window.ARCADE_CONFIG && window.ARCADE_CONFIG.leaderboardUrl) || '').trim();
  const ONLINE = /^https:\/\//.test(URL);
  const SIZE = 10;
  const BLOCKED = new Set(('ASS ARS AZZ FUK FUC FCK FUQ FKU FKN FUX SHT SHI DIK DIC DCK DIX COK CUM KUM CNT KNT ' +
    'KKK NIG NGR NGA NGG FAG FGT TIT TTS WTF STF SEX SXY XXX JIZ JIS HOE VAG PIS PSS CRP DMN SUK SUC SCK NAZ').split(' '));
  const cmp = (a, b) => (b.s - a.s) || (a.t - b.t) || ((a.at || 0) - (b.at || 0));
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  // Scores kept on this device (used when there's no internet or no leaderboard address).
  const KEY = 'homeschoolArcade.boards';
  const local = {
    all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    get(board) { return (this.all()[board] || []).slice().sort(cmp).slice(0, SIZE); },
    add(board, e) {
      const a = this.all(); a[board] = (a[board] || []).concat([e]).sort(cmp).slice(0, SIZE);
      try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (err) { /* storage blocked */ }
      return this.get(board);
    },
  };

  async function request(params, body) {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      // POSTing plain text (no custom headers) keeps this a "simple" request that Google Apps Script accepts.
      const res = body
        ? await fetch(URL, { method: 'POST', body: JSON.stringify(body), signal: ctl.signal, redirect: 'follow' })
        : await fetch(URL + (URL.includes('?') ? '&' : '?') + new URLSearchParams(params), { signal: ctl.signal, redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }
  async function fetchTop(board) {
    const j = await request({ action: 'top', board });
    if (!j.ok) throw new Error(j.error);
    return (j.entries || []).sort(cmp);
  }

  return {
    online: ONLINE,
    size: SIZE,
    cmp,
    blocked: (ini) => BLOCKED.has(String(ini).toUpperCase()),
    qualifies: (list, s, t) => s > 0 && (list.length < SIZE || cmp({ s, t, at: Date.now() }, list[list.length - 1]) < 0),
    // -> { list, offline }   (tries twice: Google sometimes hiccups while the script wakes up)
    async list(board) {
      if (!ONLINE) return { list: local.get(board), offline: false };
      for (let attempt = 0; attempt < 2; attempt++) {
        try { return { list: await fetchTop(board), offline: false }; } catch (e) { if (attempt === 0) await pause(1200); }
      }
      return { list: local.get(board), offline: true };
    },
    // -> { list, id, offline } or { error }
    async add(board, entry) {
      if (ONLINE) {
        const payload = { action: 'add', board, initials: entry.i, points: entry.s, outOf: entry.n || 0, timeMs: entry.t };
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const j = await request(null, payload);
            // An older leaderboard script that doesn't know this game yet: keep the score on this device instead.
            if (!j.ok && /unknown leaderboard/i.test(j.error || '')) break;
            if (!j.ok) return { error: j.error || 'Could not save that score.' };
            return { list: (j.entries || []).sort(cmp), id: j.id, offline: false };
          } catch (e) {
            // The save may have gone through even though the reply got lost: check before sending it again.
            try {
              const list = await fetchTop(board);
              const hit = list.find((x) => x.i === entry.i && +x.s === entry.s && +x.t === entry.t);
              if (hit) return { list, id: hit.id, offline: false };
            } catch (e2) { /* still unreachable */ }
            if (attempt === 0) await pause(1200);
          }
        }
      }
      const d = new Date();
      const e = Object.assign({}, entry, { d: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), at: d.getTime(), id: 'L' + d.getTime() });
      return { list: local.add(board, e), id: e.id, offline: ONLINE };
    },
  };
})();
