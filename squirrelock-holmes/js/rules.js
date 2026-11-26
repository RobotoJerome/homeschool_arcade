/* Squirrelock Holmes — the rules of a case: what can be examined, what unlocks what,
   which pairs make a deduction, how an accusation is judged, and Watson's hints.
   Pure logic with no screen code, so the case checker (validate.js) uses it too. */
'use strict';
(function (SQH) {
  const R = SQH.Rules = {};

  // Every clue and deduction in a case, by id.
  R.index = function (c) {
    const m = new Map();
    (c.clues || []).forEach((k) => m.set(k.id, Object.assign({ type: 'clue' }, k)));
    (c.deductions || []).forEach((d) => m.set(d.id, Object.assign({ type: 'deduction', cat: 'deduction' }, d)));
    return m;
  };
  R.startRoom = (c) => c.start || SQH.stories[c.story].rooms[0].id;
  R.gate = (c, roomId) => (c.rooms && c.rooms[roomId]) || null;
  R.roomOpen = function (c, roomId, have) {
    if (roomId === R.startRoom(c)) return true;
    const g = R.gate(c, roomId);
    return !g || (g.needs || []).every((id) => have.has(id));
  };
  R.clueReady = (c, k, have) => R.roomOpen(c, k.room, have) && (k.needs || []).every((id) => have.has(id));
  R.dedReady = (d, have) => (d.from || []).every((id) => have.has(id));
  // Shown in the room but not openable yet (drawn with a padlock).
  R.clueLocked = (c, k, have) => R.roomOpen(c, k.room, have) && !(k.needs || []).every((id) => have.has(id));

  // Plays the case "perfectly": keep taking everything that is open until nothing new opens.
  R.reach = function (c) {
    const have = new Set(), order = [];
    let changed = true;
    while (changed) {
      changed = false;
      (c.clues || []).forEach((k) => { if (!have.has(k.id) && R.clueReady(c, k, have)) { have.add(k.id); order.push(k.id); changed = true; } });
      (c.deductions || []).forEach((d) => { if (!have.has(d.id) && R.dedReady(d, have)) { have.add(d.id); order.push(d.id); changed = true; } });
    }
    const rooms = SQH.stories[c.story].rooms.map((r) => r.id).filter((id) => R.roomOpen(c, id, have));
    return { have, order, rooms };
  };

  // How many locks deep each clue is (a locked room counts as a lock). Infinity = loop.
  R.depths = function (c) {
    const idx = R.index(c), memo = new Map();
    function dep(id, stack) {
      if (memo.has(id)) return memo.get(id);
      const it = idx.get(id);
      if (!it || stack.has(id)) return Infinity;
      stack.add(id);
      let d = 0;
      if (it.type === 'deduction') {
        it.from.forEach((f) => { d = Math.max(d, dep(f, stack)); });
      } else {
        (it.needs || []).forEach((n) => { d = Math.max(d, dep(n, stack) + 1); });
        const g = it.room !== R.startRoom(c) && R.gate(c, it.room);
        if (g) (g.needs || []).forEach((n) => { d = Math.max(d, dep(n, stack) + 1); });
      }
      stack.delete(id);
      memo.set(id, d);
      return d;
    }
    idx.forEach((v, id) => dep(id, new Set()));
    return memo;
  };

  // Every deduction needed for a list of ids, including the deductions they are built from.
  R.deductionsNeeded = function (c, ids) {
    const idx = R.index(c), out = new Set();
    (function walk(list) {
      list.forEach((id) => {
        const it = idx.get(id);
        if (it && it.type === 'deduction' && !out.has(id)) { out.add(id); walk(it.from); }
      });
    })(ids);
    return out;
  };

  // Pinning two entries: is there a deduction made from exactly these two?
  R.findDeduction = (c, a, b) => (c.deductions || []).find((d) => d.from.length === 2 && ((d.from[0] === a && d.from[1] === b) || (d.from[0] === b && d.from[1] === a))) || null;

  R.roomOf = function (c, id) {
    const it = R.index(c).get(id);
    if (!it) return null;
    if (it.type === 'deduction') return R.roomOf(c, it.from[0]);
    return it.room;
  };

  // -> { kind: 'solved' } | { kind: 'unproven', missing } | { kind: 'wrong', line, refuter, room }
  R.accuse = function (c, answerId, have) {
    const a = c.answers.find((x) => x.id === answerId);
    if (!a) return { kind: 'wrong', line: null };
    if (a.correct) {
      const missing = (a.proof || []).filter((id) => !have.has(id));
      return missing.length ? { kind: 'unproven', missing } : { kind: 'solved' };
    }
    const keys = Object.keys(a.ruledOutBy || {});
    const hit = keys.find((id) => have.has(id));
    return { kind: 'wrong', line: hit ? a.ruledOutBy[hit] : null, refuter: hit || null, room: keys.length ? R.roomOf(c, keys[0]) : null };
  };

  // Watson's nudge toward the next useful thing. -> { kind, id, room } or { kind: 'done' }
  R.hint = function (c, have, room) {
    const order = R.reach(c).order, idx = R.index(c);
    const open = order.filter((id) => !have.has(id)).map((id) => idx.get(id)).filter((it) => (it.type === 'clue' ? R.clueReady(c, it, have) : R.dedReady(it, have)));
    const clues = open.filter((it) => it.type === 'clue');
    const here = clues.find((k) => k.room === room && k.cat !== 'testimony') || clues.find((k) => k.room === room);
    if (here) return { kind: here.cat === 'testimony' ? 'talk' : 'look', id: here.id, room };
    const ded = open.find((it) => it.type === 'deduction');
    if (ded) return { kind: 'connect', id: ded.id, part: ded.from[0] };
    if (clues.length) return { kind: 'room', id: clues[0].id, room: clues[0].room };
    return { kind: 'done' };
  };

  // Clues in a room: how many examined out of how many there are.
  R.progress = function (c, roomId, have) {
    const list = (c.clues || []).filter((k) => k.room === roomId);
    return { found: list.filter((k) => have.has(k.id)).length, total: list.length };
  };
})(window.SQH);
