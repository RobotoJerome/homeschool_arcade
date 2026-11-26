/* Squirrelock Holmes — the case checker. Plays every case "perfectly" with the real rules
   (rules.js) and reports problems. Open validate.html to see the report, or add ?debug to
   the game's address to see it in the browser console.
   Checks: every clue, deduction and room can be reached (no dead locks); exactly one correct
   answer, backed by reachable proof that uses no red herrings; every wrong answer is ruled out
   by at least one reachable clue or deduction, and Watson's line never names the real culprit;
   and each level's counts (rooms, clues, red herrings, lock depth, deductions needed). */
'use strict';
(function (SQH) {
  const R = SQH.Rules;
  const V = SQH.Validate = {};
  const CATS = ['physical', 'testimony', 'document'];
  const TITLES = /^(mr|mrs|miss|ms|lady|sir|colonel|professor|master|alderman|madame|dr|the)\.?$/i;

  function nameTokens(p) {
    const out = new Set();
    String(p.name || '').split(/\s+/).forEach((w) => { const t = w.replace(/[^A-Za-z]/g, ''); if (t.length > 2 && !TITLES.test(t)) out.add(t.toLowerCase()); });
    if (p.short) out.add(String(p.short).toLowerCase());
    return [...out];
  }
  const mentions = (text, tokens) => tokens.find((t) => new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text));

  V.checkCase = function (c) {
    const errors = [], warnings = [];
    const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
    const story = SQH.stories[c.story];
    if (!story) { err(`Unknown story "${c.story}".`); return { id: c.id, errors, warnings }; }
    const T = SQH.TIERS[story.tier];
    if (!T) { err(`Unknown level "${story.tier}".`); return { id: c.id, errors, warnings }; }
    const roomIds = story.rooms.map((r) => r.id), suspects = new Map(story.suspects.map((s) => [s.id, s]));
    const clues = c.clues || [], deds = c.deductions || [];
    const ids = new Map();
    clues.concat(deds).forEach((it) => { if (!it.id) err('An entry has no id.'); else if (ids.has(it.id)) err(`Duplicate id "${it.id}".`); else ids.set(it.id, it); });
    const known = (id) => ids.has(id);

    // rooms and their art
    story.rooms.forEach((r) => { if (!SQH.Art.rooms[r.art]) err(`Room "${r.id}" uses art "${r.art}", which doesn't exist.`); });
    Object.keys(c.roomState || {}).forEach((r) => { if (!roomIds.includes(r)) err(`roomState names unknown room "${r}".`); });
    Object.keys(c.rooms || {}).forEach((r) => {
      if (!roomIds.includes(r)) err(`Room lock for unknown room "${r}".`);
      if (r === R.startRoom(c)) err(`The starting room "${r}" can't be locked.`);
      const g = c.rooms[r];
      (g.needs || []).forEach((n) => { if (!known(n)) err(`Room "${r}" needs unknown "${n}".`); });
      if (!g.lock) err(`Locked room "${r}" needs a "lock" message so the player knows why.`);
    });

    // clues
    clues.forEach((k) => {
      const where = `Clue "${k.id}"`;
      if (!roomIds.includes(k.room)) err(`${where} is in unknown room "${k.room}".`);
      if (!CATS.includes(k.cat)) err(`${where} has category "${k.cat}" (use physical, testimony or document).`);
      ['name', 'see', 'think'].forEach((f) => { if (!k[f]) err(`${where} is missing "${f}".`); });
      if (k.cat === 'testimony') {
        if (!suspects.has(k.who) && !SQH.CAST[k.who]) err(`${where}: "${k.who}" is not a suspect in this story.`);
        if (!SQH.Art.LOOKS[k.who]) err(`${where}: no portrait for "${k.who}".`);
      } else {
        const room = story.rooms.find((r) => r.id === k.room);
        const art = room && SQH.Art.rooms[room.art];
        if (art && !art.spots[k.spot]) err(`${where} uses spot "${k.spot}", which the ${room.name} art doesn't have.`);
        if (!SQH.Art.props[k.prop]) err(`${where} uses prop "${k.prop}", which doesn't exist.`);
      }
      (k.needs || []).forEach((n) => { if (!known(n)) err(`${where} needs unknown "${n}".`); });
      if ((k.needs || []).length && !k.lock) err(`${where} is locked but has no "lock" message, so the player can't see what's needed.`);
      if ((k.see || '').length > 280) warn(`${where}: the observation is long (${k.see.length} characters).`);
    });

    // clean layout: hotspots inside the picture, and no two corner badges on top of each other
    story.rooms.forEach((room) => {
      const art = SQH.Art.rooms[room.art]; if (!art) return;
      const list = clues.filter((k) => k.room === room.id && k.cat !== 'testimony' && art.spots[k.spot]).map((k) => ({ id: k.id, r: SQH.Art.hotspotRect(k, art) }));
      list.forEach(({ id, r }) => { if (r.x - r.w / 2 < 0 || r.x + r.w / 2 > 1600 || r.y - r.h / 2 < 20 || r.y + r.h / 2 > 900) err(`Clue "${id}" sticks out of the ${room.name} picture.`); });
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i].r, b = list[j].r;
        const d = Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y - a.h / 2) - (b.y - b.h / 2));
        if (d < 60) err(`In the ${room.name}, the badges for "${list[i].id}" and "${list[j].id}" would overlap (move one of them).`);
      }
    });

    // deductions
    const pairs = new Set();
    deds.forEach((d) => {
      const where = `Deduction "${d.id}"`;
      if (!Array.isArray(d.from) || d.from.length !== 2 || d.from[0] === d.from[1]) err(`${where} must be made from exactly two different entries.`);
      (d.from || []).forEach((f) => { if (!known(f)) err(`${where} uses unknown "${f}".`); });
      if (!SQH.KINDS[d.kind]) err(`${where} has kind "${d.kind}" (use ${Object.keys(SQH.KINDS).join(', ')}).`);
      if (!d.text || !d.name) err(`${where} needs a "name" and "text".`);
      const key = (d.from || []).slice().sort().join('+');
      if (pairs.has(key)) err(`${where}: two deductions use the same pair (${key}).`);
      pairs.add(key);
      if (clues.some((k) => k.id === d.id)) err(`${where} has the same id as a clue.`);
    });

    // reachability: play the case perfectly
    const reach = R.reach(c);
    clues.concat(deds).forEach((it) => { if (!reach.have.has(it.id)) err(`Dead lock: "${it.id}" can never be reached.`); });
    roomIds.forEach((r) => { if (!reach.rooms.includes(r)) err(`Dead lock: room "${r}" never opens.`); });
    const depth = R.depths(c);
    let maxDepth = 0;
    const stuck = [];
    clues.forEach((k) => { const d = depth.get(k.id); if (d === Infinity) stuck.push(k.id); else maxDepth = Math.max(maxDepth, d); });
    if (stuck.length) err(`These sit behind a lock that can never open (a loop, or a missing clue): ${stuck.join(', ')}.`);

    // level rules
    const usedRooms = new Set(clues.map((k) => k.room));
    if (story.rooms.length !== T.rooms) err(`${T.label} stories need ${T.rooms} room(s); this one has ${story.rooms.length}.`);
    roomIds.forEach((r) => { if (!usedRooms.has(r)) err(`Room "${r}" has no clues.`); });
    if (clues.length < T.clues[0] || clues.length > T.clues[1]) err(`${T.label} cases need ${T.clues[0]}-${T.clues[1]} clues; this one has ${clues.length}.`);
    const herrings = clues.filter((k) => k.herring);
    if (herrings.length < T.herrings[0] || herrings.length > T.herrings[1]) err(`${T.label} cases need ${T.herrings[0]}-${T.herrings[1]} red herrings; this one has ${herrings.length}.`);
    if (maxDepth !== T.depth) err(`${T.label} cases need clue chains ${T.depth} lock(s) deep; the deepest here is ${maxDepth}.`);
    if (T.rooms > 1 && !Object.keys(c.rooms || {}).length) err('This level needs at least one locked room.');

    // answers
    const answers = c.answers || [];
    if (answers.length !== 5) err(`There must be 5 answers; there are ${answers.length}.`);
    const correct = answers.filter((a) => a.correct);
    if (correct.length !== 1) err(`Exactly one answer must be correct; ${correct.length} are.`);
    const aids = new Set();
    answers.forEach((a) => { if (aids.has(a.id)) err(`Duplicate answer id "${a.id}".`); aids.add(a.id); if (!a.text) err(`Answer "${a.id}" has no text.`); if (a.who != null && !suspects.has(a.who)) err(`Answer "${a.id}" accuses unknown "${a.who}".`); });
    const right = correct[0];
    let culpritTokens = [];
    if (right) {
      if (!right.who) err('The correct answer must name a suspect ("who").');
      else culpritTokens = nameTokens(suspects.get(right.who) || {});
      if (right.ruledOutBy && Object.keys(right.ruledOutBy).length) err('The correct answer must not be ruled out by anything.');
      const proof = right.proof || [];
      if (!proof.length) err('The correct answer needs "proof": the clues and deductions that support it.');
      proof.forEach((id) => {
        if (!known(id)) err(`Proof uses unknown "${id}".`);
        else if (!reach.have.has(id)) err(`Proof item "${id}" can't be reached.`);
        const it = ids.get(id); if (it && it.herring) err(`Proof uses the red herring "${id}".`);
      });
      const need = R.deductionsNeeded(c, proof);
      if (need.size < T.deductions[0] || need.size > T.deductions[1]) err(`${T.label} cases need ${T.deductions[0]}${T.deductions[1] < 99 ? '-' + T.deductions[1] : '+'} deductions to prove the answer; this one needs ${need.size}.`);
      if (T.timeline && ![...need].some((id) => ['timeline', 'alibi'].includes(ids.get(id).kind))) err('Hard cases need a timeline or alibi check in the proof.');
    }
    answers.filter((a) => !a.correct).forEach((a) => {
      const keys = Object.keys(a.ruledOutBy || {});
      if (!keys.length) err(`Wrong answer "${a.id}" isn't ruled out by anything.`);
      keys.forEach((id) => {
        if (!known(id)) err(`Wrong answer "${a.id}" is ruled out by unknown "${id}".`);
        const line = a.ruledOutBy[id];
        if (!line) err(`Wrong answer "${a.id}" has no Watson line for "${id}".`);
        const hit = line && mentions(line, culpritTokens);
        if (hit) err(`Watson's line for answer "${a.id}" names the culprit ("${hit}"), which gives the answer away.`);
      });
      if (keys.length && !keys.some((id) => reach.have.has(id))) err(`Wrong answer "${a.id}" can't be ruled out by anything the player can reach.`);
    });
    if (T.falseTheory) {
      const ft = answers.find((a) => a.id === c.falseTheory);
      if (!ft) err('Hard cases need a "falseTheory": the id of the convincing wrong answer.');
      else if (ft.correct) err('The false theory can\'t be the correct answer.');
    }

    // the explanation at the end
    const walk = c.walkthrough || [];
    if (!walk.length) err('The case needs a walkthrough for the CASE CLOSED screen.');
    const used = new Set();
    walk.forEach((s, i) => { if (!s.text) err(`Walkthrough step ${i + 1} has no text.`); (s.uses || []).forEach((id) => { if (!known(id)) err(`Walkthrough step ${i + 1} uses unknown "${id}".`); used.add(id); }); });
    if (right) (right.proof || []).forEach((id) => { if (!used.has(id)) err(`Walkthrough never mentions proof item "${id}".`); });
    const trapIds = new Set((c.traps || []).map((t) => t.id));
    herrings.forEach((k) => { if (!trapIds.has(k.id)) err(`Red herring "${k.id}" has no "traps" entry explaining why it misleads.`); });
    (c.traps || []).forEach((t) => { if (!ids.has(t.id) || !ids.get(t.id).herring) err(`Trap "${t.id}" isn't a red herring clue.`); if (!t.why) err(`Trap "${t.id}" has no explanation.`); });
    deds.forEach((d) => {
      const useful = (right && R.deductionsNeeded(c, right.proof || []).has(d.id)) || answers.some((a) => a.ruledOutBy && a.ruledOutBy[d.id]) || deds.some((x) => x.from.includes(d.id)) || used.has(d.id);
      if (!useful) warn(`Deduction "${d.id}" isn't used for proof, ruling anything out, or the walkthrough.`);
    });
    return { id: c.id, story: story.title, tier: story.tier, clues: clues.length, herrings: herrings.length, depth: maxDepth, deductions: right ? R.deductionsNeeded(c, right.proof || []).size : 0, errors, warnings };
  };

  V.run = function () {
    const results = SQH.cases.map(V.checkCase);
    const storyChecks = [];
    Object.values(SQH.stories).forEach((s) => {
      const list = SQH.cases.filter((c) => c.story === s.id);
      const errors = [];
      if (list.length < 3) errors.push(`"${s.title}" needs at least 3 versions; it has ${list.length}.`);
      const culprits = list.map((c) => { const a = (c.answers || []).find((x) => x.correct); return a && a.who; });
      if (new Set(culprits).size !== culprits.length) errors.push(`Every version of "${s.title}" needs a different culprit (${culprits.join(', ')}).`);
      ['briefing', 'question', 'title', 'blurb'].forEach((f) => { if (!s[f] || !s[f].length) errors.push(`"${s.id}" is missing "${f}".`); });
      storyChecks.push({ id: s.id, title: s.title, tier: s.tier, versions: list.length, errors });
    });
    SQH.TIER_ORDER.forEach((t) => { if (!SQH.storyFor(t)) storyChecks.push({ id: t, title: t, tier: t, versions: 0, errors: [`No story for the ${t} level.`] }); });
    const failed = results.filter((r) => r.errors.length).length + storyChecks.filter((s) => s.errors.length).length;
    return { results, storyChecks, ok: failed === 0, failed };
  };

  V.log = function (rep) {
    const head = rep.ok ? `Case check: all ${rep.results.length} cases passed.` : `Case check: ${rep.failed} problem group(s) found.`;
    (rep.ok ? console.info : console.error)(head);
    rep.results.forEach((r) => {
      if (r.errors.length) console.error(`${r.id}:\n  - ` + r.errors.join('\n  - '));
      if (r.warnings.length) console.warn(`${r.id} (notes):\n  - ` + r.warnings.join('\n  - '));
    });
    rep.storyChecks.forEach((s) => { if (s.errors.length) console.error(`${s.id}:\n  - ` + s.errors.join('\n  - ')); });
  };
})(window.SQH);
