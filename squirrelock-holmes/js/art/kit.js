/* Squirrelock Holmes — art kit: the shared pieces every room is built from.
   Rooms are SVG drawn by code in a 90s-arcade-meets-Victorian style: thick ink outlines
   (.o classes in style.css), flat colors with a hard shadow tone and a highlight edge
   (cel shading), soft contact shadows, and warm gaslight. Scenes are 1600 x 900.
   Small looping motions (rain, clock hands, pendulums, a twitching tail) use SVG <animate>;
   they are left out entirely when the player prefers reduced motion. */
'use strict';
(function (SQH) {
  const Art = SQH.Art = { rooms: {}, props: {}, K: {} };
  const K = Art.K;
  let uid = 0;
  K.uid = (p) => (p || 'k') + (++uid);
  K.INK = '#170d22';
  const INK = K.INK;
  const still = () => SQH.reduced();
  const n = (v) => Math.round(v * 10) / 10;

  // A tiny repeatable random generator, so rain, books and dust land in the same places every time.
  K.rng = function (seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  /* ---------- motion helpers (return '' when motion is reduced) ---------- */
  K.spin = (cx, cy, dur, steps) => {
    if (still()) return '';
    if (!steps) return `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
    const v = []; for (let i = 0; i <= steps; i++) v.push(`${n(i * 360 / steps)} ${cx} ${cy}`);
    return `<animateTransform attributeName="transform" type="rotate" values="${v.join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
  };
  K.rock = (cx, cy, deg, dur, begin) => still() ? '' :
    `<animateTransform attributeName="transform" type="rotate" values="${-deg} ${cx} ${cy};${deg} ${cx} ${cy};${-deg} ${cx} ${cy}" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="${dur}s" begin="${begin || 0}s" repeatCount="indefinite"/>`;
  // Mostly still, with a quick flick now and then (a twitching tail).
  K.twitch = (cx, cy, dur, begin) => still() ? '' :
    `<animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy};0 ${cx} ${cy};-9 ${cx} ${cy};6 ${cx} ${cy};-3 ${cx} ${cy};0 ${cx} ${cy};0 ${cx} ${cy}" keyTimes="0;.62;.66;.7;.74;.78;1" dur="${dur}s" begin="${begin || 0}s" repeatCount="indefinite"/>`;
  K.slide = (dx, dy, dur) => still() ? '' :
    `<animateTransform attributeName="transform" type="translate" from="0 0" to="${dx} ${dy}" dur="${dur}s" repeatCount="indefinite"/>`;

  /* ---------- shared gradients (installed once per page, ids start with "k-") ---------- */
  K.defs = () => `
    <radialGradient id="k-glow"><stop offset="0" stop-color="#ffe6b0" stop-opacity=".9"/><stop offset=".3" stop-color="#ffb547" stop-opacity=".35"/><stop offset="1" stop-color="#ffb547" stop-opacity="0"/></radialGradient>
    <radialGradient id="k-pool"><stop offset="0" stop-color="#ffd08a" stop-opacity=".34"/><stop offset=".5" stop-color="#ffb547" stop-opacity=".12"/><stop offset="1" stop-color="#ffb547" stop-opacity="0"/></radialGradient>
    <radialGradient id="k-moonpool"><stop offset="0" stop-color="#cfd8ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfd8ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="k-ao"><stop offset="0" stop-color="#05020a" stop-opacity=".62"/><stop offset=".6" stop-color="#05020a" stop-opacity=".28"/><stop offset="1" stop-color="#05020a" stop-opacity="0"/></radialGradient>
    <radialGradient id="k-vig" cx=".5" cy=".42" r=".78"><stop offset=".56" stop-color="#0b0416" stop-opacity="0"/><stop offset="1" stop-color="#0b0416" stop-opacity=".82"/></radialGradient>
    <radialGradient id="k-moon"><stop offset=".55" stop-color="#fff6d6"/><stop offset=".7" stop-color="#fff6d6" stop-opacity=".35"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
    <linearGradient id="k-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".7" stop-color="#26325e"/><stop offset="1" stop-color="#3a3f6e"/></linearGradient>
    <linearGradient id="k-shade-r" x1="0" x2="1"><stop offset=".45" stop-color="#22093f" stop-opacity="0"/><stop offset="1" stop-color="#22093f" stop-opacity=".62"/></linearGradient>
    <linearGradient id="k-shade-l" x1="1" x2="0"><stop offset=".45" stop-color="#22093f" stop-opacity="0"/><stop offset="1" stop-color="#22093f" stop-opacity=".62"/></linearGradient>
    <linearGradient id="k-wallfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0416" stop-opacity=".55"/><stop offset=".35" stop-color="#0b0416" stop-opacity="0"/></linearGradient>
    <linearGradient id="k-under" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="k-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".2"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></linearGradient>
    <linearGradient id="k-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".3" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="k-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8a5a1c"/></linearGradient>
    <linearGradient id="k-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe4ee"/><stop offset=".5" stop-color="#8f98aa"/><stop offset="1" stop-color="#4f5668"/></linearGradient>
    <linearGradient id="k-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

  /* ---------- light and shadow helpers ---------- */
  // A soft contact shadow under anything that stands on the floor or a table.
  K.shadow = (cx, cy, rx, ry, op) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#k-ao)" opacity="${op == null ? 1 : op}"/>`;
  // A warm pool of lamplight on a wall or floor (static; the flicker is an HTML layer).
  K.lightPool = (cx, cy, rx, ry, op) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#k-pool)" opacity="${op == null ? 1 : op}"/>`;
  // Moonlight falling from a window onto the floor.
  K.moonPatch = (x1, x2, fy, len) => `<path d="M${x1} ${fy} L${x2} ${fy} L${x2 + len * 0.9} ${fy + len} L${x1 + len * 0.5} ${fy + len} Z" fill="url(#k-moonpool)"/>`;
  // Lighting on top of everything: violet shadow on one side, then a dark vignette.
  K.finish = (side) => `<rect width="1600" height="900" fill="url(#k-shade-${side || 'r'})"/><rect width="1600" height="900" fill="url(#k-vig)"/>`;

  /* ---------- walls, wood paneling and floor ---------- */
  // o: { paper, paper2, wood, wood2, rail, floor, floor2, wainY, floorY, crown, gold }
  K.shell = function (o) {
    const wy = o.wainY, fy = o.floorY, pid = K.uid('wp'), gold = o.gold || '#d9a441';
    let s = `<defs><pattern id="${pid}" width="90" height="96" patternUnits="userSpaceOnUse">
      <rect width="90" height="96" fill="${o.paper}"/>
      <path d="M0 0 V96 M90 0 V96" stroke="${o.paper2}" stroke-width="3" opacity=".5"/>
      <path d="M45 6 C56 18 58 32 45 46 C32 32 34 18 45 6 Z" fill="${o.paper2}"/>
      <path d="M45 16 C50 22 50 30 45 36 C40 30 40 22 45 16 Z" fill="${o.paper}" opacity=".55"/>
      <path d="M28 40 C34 50 40 54 45 54 C50 54 56 50 62 40" stroke="${o.paper2}" stroke-width="3" fill="none"/>
      <path d="M45 54 C50 62 50 70 45 78 C40 70 40 62 45 54 Z" fill="${o.paper2}" opacity=".85"/>
      <circle cx="45" cy="88" r="3" fill="${gold}" opacity=".35"/><circle cx="22" cy="24" r="2" fill="${gold}" opacity=".3"/><circle cx="68" cy="24" r="2" fill="${gold}" opacity=".3"/>
      <circle cx="0" cy="48" r="6" fill="${o.paper2}"/><circle cx="90" cy="48" r="6" fill="${o.paper2}"/></pattern></defs>
      <rect width="1600" height="${fy}" fill="url(#${pid})"/>
      <rect width="1600" height="${wy}" fill="url(#k-wallfade)"/>`;
    // crown molding with dentils, and a picture rail
    s += `<rect y="0" width="1600" height="40" fill="${o.crown}"/><rect y="40" width="1600" height="12" fill="${o.wood2}"/>`;
    for (let x = 6; x < 1600; x += 26) s += `<rect x="${x}" y="42" width="14" height="8" fill="${o.wood}"/>`;
    s += `<rect y="52" width="1600" height="8" fill="${o.rail}"/><path d="M0 53 H1600" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><path d="M0 60 H1600" class="o3"/>
      <rect y="60" width="1600" height="26" fill="url(#k-under)"/>`;
    if (o.picRail !== false) s += `<path d="M0 ${wy - 150} H1600" stroke="${o.rail}" stroke-width="7"/><path d="M0 ${wy - 153} H1600" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
    // wainscot: raised, beveled panels
    s += `<rect y="${wy}" width="1600" height="${fy - wy}" fill="${o.wood}"/>`;
    for (let x = 22; x < 1600; x += 168) {
      const ph = fy - wy - 52;
      s += `<rect x="${x}" y="${wy + 26}" width="132" height="${ph}" rx="4" fill="${o.wood2}" class="o3"/>
        <rect x="${x + 12}" y="${wy + 38}" width="108" height="${ph - 24}" rx="3" fill="${o.wood}"/>
        <path d="M${x + 12} ${wy + ph + 14} V${wy + 38} H${x + 120}" stroke="#fff" stroke-opacity=".16" stroke-width="4" fill="none"/>
        <path d="M${x + 120} ${wy + 38} V${wy + ph + 14} H${x + 12}" stroke="#000" stroke-opacity=".32" stroke-width="4" fill="none"/>
        <path d="M${x + 30} ${wy + 50} q20 ${n(ph * 0.3)} 0 ${n(ph * 0.6)} M${x + 70} ${wy + 46} q-14 ${n(ph * 0.35)} 6 ${n(ph * 0.7)}" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
    }
    s += `<rect y="${wy - 14}" width="1600" height="20" fill="${o.rail}" class="o3"/><path d="M0 ${wy - 11} H1600" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
      <rect y="${wy + 6}" width="1600" height="14" fill="url(#k-under)"/>`;
    // floor: boards running toward you, with staggered ends, grain and a soft sheen
    s += `<rect y="${fy}" width="1600" height="${900 - fy}" fill="${o.floor}"/>`;
    const rows = []; for (let y = fy, hgt = 16; y < 900; y += hgt, hgt *= 1.32) rows.push(y);
    rows.push(900);
    for (let i = -12; i <= 12; i++) s += `<path d="M${800 + i * 70} ${fy} L${800 + i * 210} 900" stroke="${o.floor2}" stroke-width="4"/>`;
    rows.forEach((y, r) => {
      if (r > 0 && y < 900) s += `<path d="M0 ${n(y)} H1600" stroke="${o.floor2}" stroke-width="2" opacity=".55"/>`;
      if (r < rows.length - 1) {
        const y2 = rows[r + 1], t = (y - fy) / (900 - fy), t2 = (y2 - fy) / (900 - fy);
        for (let i = -12 + (r % 2); i <= 12; i += 2) {
          const xa = 800 + i * (70 + 140 * t), xb = 800 + (i + 1) * (70 + 140 * t), xm = (xa + xb) / 2 + (r % 3 - 1) * 6;
          s += `<path d="M${n(xm)} ${n(y)} L${n(xm + (xm - 800) * (t2 - t) * 0.6)} ${n(y2)}" stroke="${o.floor2}" stroke-width="2" opacity=".45"/>`;
        }
      }
    });
    const rr = K.rng(fy * 3 + 7);
    for (let i = 0; i < 26; i++) { const x = rr() * 1600, y = fy + 20 + rr() * (900 - fy - 30), l = 30 + rr() * 70; s += `<path d="M${n(x)} ${n(y)} q${n(l / 2)} -3 ${n(l)} 0" stroke="#fff" stroke-opacity=".07" stroke-width="2" fill="none"/>`; }
    s += `<ellipse cx="800" cy="${fy + 120}" rx="560" ry="80" fill="url(#k-pool)" opacity=".7"/>
      <rect y="${fy}" width="1600" height="${900 - fy}" fill="url(#k-floor)"/>
      <rect y="${fy - 24}" width="1600" height="26" fill="${o.rail}" class="o3"/><path d="M0 ${fy - 21} H1600" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`;
    return s;
  };

  // A checkered tile floor in perspective (drawn over the shell's wooden floor).
  K.tiles = function (fy, c1, c2) {
    const rows = []; for (let y = fy, hh = 20; y < 900; y += hh, hh *= 1.3) rows.push(y);
    rows.push(900);
    const X = (i, y) => n(800 + i * (60 + 160 * (y - fy) / (900 - fy)));
    let s = `<rect y="${fy}" width="1600" height="${900 - fy}" fill="${c1}"/>`;
    for (let r = 0; r < rows.length - 1; r++) {
      const y1 = rows[r], y2 = rows[r + 1];
      for (let i = -15; i < 15; i++) if (((i + r) % 2 + 2) % 2 === 0) s += `<path d="M${X(i, y1)} ${n(y1)} L${X(i + 1, y1)} ${n(y1)} L${X(i + 1, y2)} ${n(y2)} L${X(i, y2)} ${n(y2)} Z" fill="${c2}"/>`;
      s += `<path d="M0 ${n(y1)} H1600" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>`;
    }
    return s + `<ellipse cx="800" cy="${fy + 110}" rx="560" ry="80" fill="url(#k-pool)" opacity=".8"/><rect y="${fy}" width="1600" height="${900 - fy}" fill="url(#k-floor)"/>
      <rect y="${fy - 24}" width="1600" height="26" fill="#3a2414" class="o3"/><path d="M0 ${fy - 21} H1600" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`;
  };

  // A flat cel-shaded box: base color, a highlight edge on top/left, a hard shadow strip on the right.
  K.box = (x, y, w, h, fill, shade, rx) => `<rect class="o" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 4 : rx}" fill="${fill}"/>
    <rect x="${n(x + w * 0.74)}" y="${y + 3}" width="${n(w * 0.26 - 3)}" height="${h - 6}" fill="${shade}" opacity=".6"/>
    <path d="M${x + 5} ${y + h - 6} V${y + 5} H${n(x + w * 0.72)}" stroke="#fff" stroke-opacity=".16" stroke-width="3" fill="none"/>`;

  /* ---------- a rainy window with curtains ---------- */
  // state: 'closed' | 'open' (lower sash raised) | 'broken'
  K.window = function (x, y, w, h, o) {
    o = o || {};
    const st = o.state || 'closed', id = K.uid('win'), fr = 16;
    const gx = x + fr, gy = y + fr, gw = w - fr * 2, gh = h - fr * 2;
    const frame = o.frame || '#5a3320', r = K.rng(o.seed || (x * 7 + y));
    let rain = '', drops = '', stars = '';
    for (let i = 0; i < Math.round(gw * gh / 1800); i++) {
      const rx = gx + r() * (gw + 30), ry = gy + r() * gh, len = 18 + r() * 26;
      const line = (yy) => `<path d="M${n(rx)} ${n(yy)} l-7 ${n(len)}" stroke="#bcd0ff" stroke-opacity="${n(0.25 + r() * 0.35)}" stroke-width="2"/>`;
      rain += line(ry) + line(ry - gh);
    }
    for (let i = 0; i < Math.round(gw * gh / 2600); i++) { const dx = gx + 6 + r() * (gw - 12), dy = gy + 6 + r() * (gh - 12), dr = 1.6 + r() * 2.4; drops += `<circle cx="${n(dx)}" cy="${n(dy)}" r="${n(dr)}" fill="#cfe0ff" opacity=".45"/><circle cx="${n(dx - dr * 0.3)}" cy="${n(dy - dr * 0.3)}" r="${n(dr * 0.35)}" fill="#fff" opacity=".8"/>`; }
    for (let i = 0; i < 10; i++) stars += `<circle cx="${n(gx + r() * gw)}" cy="${n(gy + r() * gh * 0.45)}" r="${n(0.8 + r() * 1.2)}" fill="#fff" opacity="${n(0.4 + r() * 0.5)}"/>`;
    const mx = gx + gw * 0.7, my = gy + gh * 0.2, mr = Math.min(gw, gh) * 0.09;
    const roof = gy + gh * 0.8;
    let s = `<defs><clipPath id="${id}"><rect x="${gx}" y="${gy}" width="${gw}" height="${gh}"/></clipPath></defs>
      <rect class="o" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${frame}"/>
      <rect x="${gx - 6}" y="${gy - 6}" width="${gw + 12}" height="${gh + 12}" fill="#000" opacity=".3"/>
      <g clip-path="url(#${id})">
        <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#k-night)"/>${stars}
        <circle cx="${n(mx)}" cy="${n(my)}" r="${n(mr * 2.4)}" fill="url(#k-moon)" opacity=".5"/>
        <circle cx="${n(mx)}" cy="${n(my)}" r="${n(mr)}" fill="#f8ecc2"/><circle cx="${n(mx - mr * 0.3)}" cy="${n(my - mr * 0.2)}" r="${n(mr * 0.25)}" fill="#e6d6a4"/>
        <path d="M${gx} ${n(roof)} h${n(gw * 0.2)} v${n(-gh * 0.14)} h${n(gw * 0.05)} v${n(-gh * 0.06)} h${n(gw * 0.04)} v${n(gh * 0.06)} h${n(gw * 0.03)} v${n(gh * 0.06)} h${n(gw * 0.18)} v${n(-gh * 0.22)} l${n(gw * 0.07)} ${n(-gh * 0.07)} l${n(gw * 0.07)} ${n(gh * 0.07)} v${n(gh * 0.2)} h${n(gw * 0.08)} v${n(-gh * 0.08)} h${n(gw * 0.04)} v${n(gh * 0.08)} h${n(gw * 0.24)} V${gy + gh} H${gx} Z" fill="#121731"/>
        <rect x="${n(gx + gw * 0.25)}" y="${n(gy + gh * 0.72)}" width="6" height="9" fill="#ffc861" opacity=".8"/><rect x="${n(gx + gw * 0.62)}" y="${n(gy + gh * 0.66)}" width="6" height="9" fill="#ffc861" opacity=".7"/><rect x="${n(gx + gw * 0.12)}" y="${n(gy + gh * 0.86)}" width="5" height="8" fill="#ffc861" opacity=".6"/>
        <rect x="${gx - gw}" y="${n(gy + gh * 0.56)}" width="${gw * 3}" height="${n(gh * 0.3)}" fill="#9c93c8" opacity=".16">${K.slide(gw, 0, 26)}</rect>
        <g>${rain}${K.slide(-10, gh, 0.55)}</g>${drops}
        <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#k-glass)"/>
        <path d="M${n(gx + gw * 0.1)} ${gy + gh} L${n(gx + gw * 0.5)} ${gy} L${n(gx + gw * 0.62)} ${gy} L${n(gx + gw * 0.22)} ${gy + gh} Z" fill="#fff" opacity=".05"/>
      </g>`;
    if (st === 'broken') {
      const cx = gx + gw * 0.3, cy = gy + gh * 0.3;
      s += `<path d="M${n(cx - 34)} ${n(cy - 20)} L${n(cx - 6)} ${n(cy - 38)} L${n(cx + 18)} ${n(cy - 12)} L${n(cx + 38)} ${n(cy - 2)} L${n(cx + 12)} ${n(cy + 22)} L${n(cx - 4)} ${n(cy + 40)} L${n(cx - 28)} ${n(cy + 14)} Z" fill="#05060f" class="o3"/>
        <path d="M${n(cx + 38)} ${n(cy - 2)} L${n(cx + 80)} ${n(cy - 30)} M${n(cx + 12)} ${n(cy + 22)} L${n(cx + 56)} ${n(cy + 70)} M${n(cx - 28)} ${n(cy + 14)} L${n(cx - 50)} ${n(cy + 60)} M${n(cx - 6)} ${n(cy - 38)} L${n(cx - 12)} ${n(cy - 70)}" stroke="#e8f0ff" stroke-width="2.5" opacity=".8"/>`;
    }
    if (st === 'open') {
      s += `<rect class="o" x="${gx - 4}" y="${n(gy + gh * 0.08)}" width="${gw + 8}" height="${n(gh * 0.44)}" fill="none" stroke-width="12" stroke="${frame}"/>
        <rect x="${gx}" y="${n(gy + gh * 0.52)}" width="${gw}" height="${n(gh * 0.48)}" fill="#000" opacity=".18"/>`;
    }
    s += `<path d="M${x + w / 2} ${y + fr} V${y + h - fr} M${x + fr} ${n(y + h * 0.52)} H${x + w - fr}" stroke="${frame}" stroke-width="10"/>
      <path d="M${x + w / 2 - 3} ${y + fr} V${y + h - fr} M${x + fr} ${n(y + h * 0.52) - 3} H${x + w - fr}" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>
      <path d="M${x + w / 2} ${y + fr} V${y + h - fr} M${x + fr} ${n(y + h * 0.52)} H${x + w - fr}" class="o3" fill="none"/>`;
    if (o.sill !== false) s += `<rect class="o" x="${x - 18}" y="${y + h - 8}" width="${w + 36}" height="22" rx="4" fill="${frame}"/><path d="M${x - 14} ${y + h - 5} H${x + w + 14}" stroke="#fff" stroke-opacity=".2" stroke-width="3"/><rect x="${x - 14}" y="${y + h + 14}" width="${w + 28}" height="14" fill="url(#k-under)"/>`;
    if (o.curtains !== false) {
      const c = o.curtain || '#6a1f3a', c2 = o.curtain2 || '#4a1229';
      const side = (dir) => {
        const ox = dir < 0 ? x : x + w, m = dir;
        const X = (dx) => n(ox + dx * m);
        return `<g class="sway${dir > 0 ? ' sway--b' : ''}"><path class="o" d="M${X(-40)} ${y - 30} H${X(26)} C${X(40)} ${n(y + h * 0.4)} ${X(6)} ${n(y + h * 0.7)} ${X(22)} ${y + h + 40} H${X(-46)} C${X(-52)} ${n(y + h * 0.6)} ${X(-30)} ${n(y + h * 0.3)} ${X(-40)} ${y - 30} Z" fill="${c}"/>
          <path d="M${X(-14)} ${y - 20} C${X(-4)} ${n(y + h * 0.4)} ${X(-22)} ${n(y + h * 0.7)} ${X(-12)} ${y + h + 34}" stroke="${c2}" stroke-width="10" fill="none"/>
          <path d="M${X(-30)} ${y - 20} C${X(-36)} ${n(y + h * 0.35)} ${X(-18)} ${n(y + h * 0.6)} ${X(-34)} ${y + h + 36}" stroke="${c2}" stroke-width="5" fill="none" opacity=".7"/>
          <path d="M${X(6)} ${y - 20} C${X(18)} ${n(y + h * 0.4)} ${X(-2)} ${n(y + h * 0.65)} ${X(8)} ${y + h + 34}" stroke="#fff" stroke-opacity=".16" stroke-width="4" fill="none"/>
          <path d="M${X(-46)} ${n(y + h * 0.62)} Q${X(-10)} ${n(y + h * 0.7)} ${X(22)} ${n(y + h * 0.6)}" stroke="#d9a441" stroke-width="5" fill="none"/><path class="o3" d="M${X(-44)} ${n(y + h * 0.62)} l${n(-6 * m)} 26 l${n(12 * m)} 0 Z" fill="#d9a441"/></g>`;
      };
      s += side(-1) + side(1);
      // rod and a scalloped valance
      let val = `M${x - 56} ${y - 34}`;
      const segs = Math.max(3, Math.round((w + 112) / 46)), sw = (w + 112) / segs;
      for (let i = 0; i < segs; i++) val += ` q${n(sw / 2)} 26 ${n(sw)} 0`;
      s += `<rect class="o" x="${x - 66}" y="${y - 42}" width="${w + 132}" height="14" rx="7" fill="url(#k-brass)"/><circle class="o3" cx="${x - 70}" cy="${y - 35}" r="10" fill="url(#k-brass)"/><circle class="o3" cx="${x + w + 70}" cy="${y - 35}" r="10" fill="url(#k-brass)"/>
        <path class="o3" d="${val} V${y - 34} Z" fill="${c}"/><path d="M${x - 56} ${y - 30} H${x + w + 56}" stroke="#d9a441" stroke-width="3"/>`;
    }
    return s;
  };

  /* ---------- a brass gas lamp on the wall (its flicker is an HTML layer, see play.js) ---------- */
  K.lamp = (x, y) => `<g>
    <circle cx="${x}" cy="${y + 10}" r="70" fill="url(#k-glow)" opacity=".55"/>
    <ellipse class="o3" cx="${x}" cy="${y + 66}" rx="15" ry="24" fill="url(#k-brass)"/><circle cx="${x}" cy="${y + 56}" r="3" fill="${INK}"/><circle cx="${x}" cy="${y + 78}" r="3" fill="${INK}"/>
    <path d="M${x} ${y + 60} C${x - 26} ${y + 60} ${x - 30} ${y + 40} ${x - 14} ${y + 38} C${x - 4} ${y + 37} ${x - 2} ${y + 44} ${x} ${y + 40}" stroke="#8a5a1c" stroke-width="7" fill="none"/>
    <path d="M${x} ${y + 60} C${x - 26} ${y + 60} ${x - 30} ${y + 40} ${x - 14} ${y + 38} C${x - 4} ${y + 37} ${x - 2} ${y + 44} ${x} ${y + 40}" class="o3" fill="none" stroke-width="2"/>
    <path class="o" d="M${x - 24} ${y + 6} Q${x} ${y - 30} ${x + 24} ${y + 6} L${x + 16} ${y + 34} H${x - 16} Z" fill="#fff4d8" opacity=".92"/>
    <path d="M${x - 8} ${y - 14} L${x - 6} ${y + 32} M${x + 8} ${y - 14} L${x + 6} ${y + 32}" stroke="#e8c98a" stroke-width="2"/>
    <path class="flame" d="M${x} ${y - 8} C${x + 10} ${y + 6} ${x + 8} ${y + 20} ${x} ${y + 24} C${x - 8} ${y + 20} ${x - 10} ${y + 6} ${x} ${y - 8} Z" fill="#ffb547"/>
    <path class="flame flame--b" d="M${x} ${y + 2} C${x + 5} ${y + 10} ${x + 4} ${y + 18} ${x} ${y + 21} C${x - 4} ${y + 18} ${x - 5} ${y + 10} ${x} ${y + 2} Z" fill="#fff6d0"/>
    <path d="M${x - 16} ${y - 4} Q${x - 14} ${y - 18} ${x - 4} ${y - 22}" stroke="#fff" stroke-width="3" opacity=".8" fill="none"/>
    <rect class="o" x="${x - 27}" y="${y + 32}" width="54" height="11" rx="4" fill="url(#k-brass)"/><circle class="o3" cx="${x}" cy="${y - 26}" r="5" fill="url(#k-brass)"/></g>`;

  /* ---------- clocks ---------- */
  function hands(cx, cy, r, time, tick) {
    const m = /^(\d+):(\d+)$/.exec(time || '10:10') || [0, 10, 10];
    const hh = (+m[1] % 12) + +m[2] / 60, mm = +m[2];
    const ha = hh * 30, ma = mm * 6;
    const P = (a, len) => [n(cx + Math.sin(a * Math.PI / 180) * len), n(cy - Math.cos(a * Math.PI / 180) * len)];
    const hand = (a, len, w, col) => { const [ex, ey] = P(a, len), [dx, dy] = P(a, len * 0.72), [lx, ly] = P(a - 90, w * 0.9), [rx2, ry2] = P(a + 90, w * 0.9);
      return `<path d="M${cx} ${cy} L${ex} ${ey}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M${n(dx + (lx - cx) * 0.6)} ${n(dy + (ly - cy) * 0.6)} L${ex} ${ey} L${n(dx + (rx2 - cx) * 0.6)} ${n(dy + (ry2 - cy) * 0.6)} Z" fill="${col}"/>`; };
    let s = hand(ha, r * 0.52, Math.max(4, r * 0.08), INK) + hand(ma, r * 0.8, Math.max(3, r * 0.055), INK);
    if (tick) s += `<g><path d="M${cx} ${n(cy + r * 0.15)} V${n(cy - r * 0.84)}" stroke="#c0302a" stroke-width="${Math.max(2, r * 0.025)}"/>${K.spin(cx, cy, 60, 60)}</g>`;
    return s + `<circle cx="${cx}" cy="${cy}" r="${Math.max(4, r * 0.07)}" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="${Math.max(1.5, r * 0.025)}" fill="url(#k-brass)"/>`;
  }
  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  K.face = function (cx, cy, r, o) {
    o = o || {};
    let s = `<circle class="o" cx="${cx}" cy="${cy}" r="${r}" fill="${o.face || '#f4ead2'}"/><circle cx="${cx}" cy="${cy}" r="${n(r * 0.93)}" fill="none" stroke="${INK}" stroke-width="${Math.max(1, r * 0.012)}" opacity=".5"/>`;
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = r * (big ? 0.8 : 0.87);
      if (!big && r < 30) continue;
      s += `<path d="M${n(cx + Math.sin(a) * r1)} ${n(cy - Math.cos(a) * r1)} L${n(cx + Math.sin(a) * r * 0.92)} ${n(cy - Math.cos(a) * r * 0.92)}" stroke="${INK}" stroke-width="${big ? Math.max(2.5, r * 0.035) : Math.max(1, r * 0.012)}"/>`;
    }
    if (r >= 40) {
      ROMAN.forEach((t, i) => { const a = i * 30 * Math.PI / 180, rr = r * 0.66; s += `<text x="${n(cx + Math.sin(a) * rr)}" y="${n(cy - Math.cos(a) * rr + r * 0.06)}" text-anchor="middle" class="svg-numeral" font-size="${n(r * 0.15)}">${t}</text>`; });
    }
    return s + hands(cx, cy, r, o.time, o.tick !== false && !o.stopped) + `<path d="M${n(cx - r * 0.7)} ${n(cy - r * 0.5)} A${r} ${r} 0 0 1 ${n(cx + r * 0.1)} ${n(cy - r * 0.86)}" stroke="#fff" stroke-opacity=".35" stroke-width="${Math.max(2, r * 0.05)}" fill="none"/>`;
  };
  // A round wall clock with a ticking second hand.
  K.wallClock = (cx, cy, r, o) => `${K.shadow(cx + 6, cy + 8, r + 18, r + 18, 0.5)}<circle class="o" cx="${cx}" cy="${cy}" r="${r + 15}" fill="${(o && o.wood) || '#5a3320'}"/><path d="M${n(cx - r * 0.8)} ${n(cy - r * 0.8)} A${r + 10} ${r + 10} 0 0 1 ${n(cx + r * 0.6)} ${n(cy - r - 8)}" stroke="#fff" stroke-opacity=".2" stroke-width="4" fill="none"/><circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="url(#k-brass)" class="o3"/>${K.face(cx, cy, r, o)}`;
  // A grandfather clock with a swinging pendulum and brass weights.
  K.tallClock = function (x, y, w, h, o) {
    o = o || {};
    const wood = o.wood || '#4a2616', wood2 = o.wood2 || '#331a0f', cx = x + w / 2, fr = w * 0.36;
    return `${K.shadow(cx, y + h + 4, w * 0.75, 14)}
      <path class="o" d="M${x - 6} ${y + 40} Q${cx} ${y - 34} ${x + w + 6} ${y + 40} V${y + 52} H${x - 6} Z" fill="${wood2}"/>
      <circle class="o3" cx="${cx}" cy="${y - 12}" r="7" fill="url(#k-brass)"/><circle class="o3" cx="${x + 2}" cy="${y + 30}" r="5" fill="url(#k-brass)"/><circle class="o3" cx="${x + w - 2}" cy="${y + 30}" r="5" fill="url(#k-brass)"/>
      <path class="o" d="M${x} ${y + 50} H${x + w} V${y + h} H${x} Z" fill="${wood}"/>
      <rect x="${n(x + w * 0.76)}" y="${y + 52}" width="${n(w * 0.2)}" height="${h - 56}" fill="${wood2}" opacity=".85"/>
      <path d="M${x + 6} ${y + h - 6} V${y + 56}" stroke="#fff" stroke-opacity=".14" stroke-width="3"/>
      <rect class="o3" x="${n(x + w * 0.1)}" y="${y + 20}" width="${n(w * 0.8)}" height="${n(fr * 2 + 24)}" rx="${n(fr)}" fill="${wood2}"/>
      ${K.face(cx, y + 70, fr, { time: o.time, stopped: o.stopped })}
      <rect class="o" x="${n(x + w * 0.18)}" y="${y + 150}" width="${n(w * 0.64)}" height="${h - 210}" rx="8" fill="#1b0f0a"/>
      <path d="M${n(x + w * 0.2)} ${y + 152} H${n(x + w * 0.8)} V${y + h - 62} H${n(x + w * 0.2)} Z" fill="url(#k-glass)"/>
      <path d="M${n(x + w * 0.32)} ${y + 160} V${y + 250} M${n(x + w * 0.68)} ${y + 160} V${y + 230}" stroke="url(#k-brass)" stroke-width="2"/>
      <rect class="o3" x="${n(x + w * 0.27)}" y="${y + 250}" width="10" height="40" rx="3" fill="url(#k-brass)"/><rect class="o3" x="${n(x + w * 0.63)}" y="${y + 230}" width="10" height="40" rx="3" fill="url(#k-brass)"/>
      <g><path d="M${cx} ${y + 160} V${y + h - 110}" stroke="url(#k-brass)" stroke-width="5"/><circle class="o" cx="${cx}" cy="${y + h - 100}" r="${n(w * 0.17)}" fill="url(#k-brass)"/><circle cx="${n(cx - w * 0.05)}" cy="${y + h - 106}" r="${n(w * 0.05)}" fill="#fff" opacity=".6"/>${o.stopped ? '' : K.rock(cx, y + 160, 9, 2)}</g>
      <path d="M${n(x + w * 0.24)} ${y + 160} L${n(x + w * 0.4)} ${y + h - 70}" stroke="#fff" stroke-opacity=".12" stroke-width="6"/>
      <rect class="o" x="${x - 10}" y="${y + h - 22}" width="${w + 20}" height="24" rx="4" fill="${wood2}"/><path d="M${x - 6} ${y + h - 19} H${x + w + 6}" stroke="#fff" stroke-opacity=".15" stroke-width="3"/>`;
  };

  /* ---------- a framed squirrel portrait whose tail twitches ---------- */
  K.portrait = function (x, y, w, h, o) {
    o = o || {};
    const fur = o.fur || '#a0522d', bg = o.bg || '#2e3b2c', cx = x + w / 2, by = y + h;
    const tx = cx + w * 0.22, ty = by - h * 0.18, gid = K.uid('pbg');
    const rosette = (rx, ry) => `<circle class="o3" cx="${rx}" cy="${ry}" r="9" fill="url(#k-brass)"/><circle cx="${rx}" cy="${ry}" r="3.5" fill="#8a5a1c"/>`;
    return `<defs><radialGradient id="${gid}" cx=".45" cy=".38" r=".7"><stop offset="0" stop-color="${bg}" stop-opacity=".55"/><stop offset="1" stop-color="#05030a"/></radialGradient></defs>
      ${K.shadow(cx + 8, by + 18, w * 0.7, 16, 0.45)}
      <rect class="o" x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="6" fill="url(#k-brass)"/>
      <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" fill="none" stroke="#8a5a1c" stroke-width="4"/>
      <path d="M${x - 12} ${y + h + 12} V${y - 12} H${x + w + 12}" stroke="#fff6d0" stroke-opacity=".5" stroke-width="2" fill="none"/>
      ${rosette(x - 8, y - 8)}${rosette(x + w + 8, y - 8)}${rosette(x - 8, y + h + 8)}${rosette(x + w + 8, y + h + 8)}
      <rect class="o3" x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>
      <g><path class="o3" d="M${tx} ${ty} C${n(tx + w * 0.3)} ${n(ty - h * 0.1)} ${n(tx + w * 0.26)} ${n(ty - h * 0.6)} ${n(tx + w * 0.06)} ${n(ty - h * 0.56)} C${n(tx - w * 0.04)} ${n(ty - h * 0.52)} ${n(tx + w * 0.1)} ${n(ty - h * 0.36)} ${n(tx + w * 0.02)} ${n(ty - h * 0.14)} Z" fill="${fur}"/>${K.twitch(tx, ty, 6.5, (x % 5) * 0.7)}</g>
      <path class="o3" d="M${n(x + w * 0.16)} ${by} C${n(x + w * 0.18)} ${n(by - h * 0.26)} ${n(x + w * 0.82)} ${n(by - h * 0.26)} ${n(x + w * 0.84)} ${by} Z" fill="${o.coat || '#3b2a4a'}"/>
      <path d="M${cx} ${n(by - h * 0.2)} L${n(cx - w * 0.06)} ${by} M${cx} ${n(by - h * 0.2)} L${n(cx + w * 0.06)} ${by}" stroke="#f4eee4" stroke-width="3" opacity=".7"/>
      <ellipse class="o3" cx="${cx}" cy="${n(by - h * 0.42)}" rx="${n(w * 0.22)}" ry="${n(h * 0.2)}" fill="${fur}"/>
      <path class="o3" d="M${n(cx - w * 0.18)} ${n(by - h * 0.56)} l${n(w * 0.02)} ${n(-h * 0.16)} l${n(w * 0.08)} ${n(h * 0.1)} Z M${n(cx + w * 0.18)} ${n(by - h * 0.56)} l${n(-w * 0.02)} ${n(-h * 0.16)} l${n(-w * 0.08)} ${n(h * 0.1)} Z" fill="${fur}"/>
      <ellipse cx="${cx}" cy="${n(by - h * 0.36)}" rx="${n(w * 0.11)}" ry="${n(h * 0.08)}" fill="#f1d9b8"/>
      <circle cx="${n(cx - w * 0.08)}" cy="${n(by - h * 0.46)}" r="${n(w * 0.025)}" fill="${INK}"/><circle cx="${n(cx + w * 0.08)}" cy="${n(by - h * 0.46)}" r="${n(w * 0.025)}" fill="${INK}"/>
      <ellipse cx="${cx}" cy="${n(by - h * 0.4)}" rx="${n(w * 0.03)}" ry="${n(h * 0.018)}" fill="${INK}"/>
      ${o.hat ? `<path class="o3" d="M${n(cx - w * 0.2)} ${n(by - h * 0.6)} h${n(w * 0.4)} l${n(-w * 0.06)} ${n(-h * 0.2)} h${n(-w * 0.28)} Z" fill="#1a1420"/>` : ''}
      <path d="M${x + 4} ${y + h * 0.7} L${x + w * 0.7} ${y + 4} L${x + w * 0.85} ${y + 4} L${x + 4} ${y + h * 0.85} Z" fill="#fff" opacity=".06"/>`;
  };

  /* ---------- a fringed rug ---------- */
  K.rug = function (cx, cy, w, h, c, c2) {
    let s = K.shadow(cx, cy + 6, w / 2 + 10, h / 2 + 6, 0.5);
    for (let i = -Math.floor(h / 2) + 8; i < h / 2 - 6; i += 9) {
      const xr = (w / 2) * Math.sqrt(Math.max(0, 1 - (i / (h / 2)) ** 2));
      s += `<path d="M${n(cx - xr)} ${n(cy + i)} l-14 2 M${n(cx + xr)} ${n(cy + i)} l14 2" stroke="#e8d9b0" stroke-width="3"/>`;
    }
    s += `<ellipse class="o" cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${c}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${n(w / 2 - 14)}" ry="${n(h / 2 - 8)}" fill="none" stroke="${c2}" stroke-width="6"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${n(w / 2 - 30)}" ry="${n(h / 2 - 18)}" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="10 8"/>`;
    for (let k = -2; k <= 2; k++) s += `<path d="M${n(cx + k * w * 0.13)} ${n(cy - h * 0.16)} l${n(w * 0.03)} ${n(h * 0.16)} l${n(-w * 0.03)} ${n(h * 0.16)} l${n(-w * 0.03)} ${n(-h * 0.16)} Z" fill="${c2}" opacity="${k === 0 ? 0.95 : 0.55}"/>`;
    return s + `<ellipse cx="${n(cx - w * 0.12)}" cy="${n(cy - h * 0.18)}" rx="${n(w * 0.26)}" ry="${n(h * 0.12)}" fill="#fff" opacity=".05"/>`;
  };

  /* ---------- decor ---------- */
  // Rows of books on shelves inside a bookcase opening (x, y = inside top-left).
  K.books = function (x, y, w, rowH, rows, seed, colors) {
    const r = K.rng(seed || 3), cols = colors || ['#7a2430', '#2f6b4e', '#d9a441', '#3b4a8a', '#6a1f3a', '#8a5a2c', '#2a5a6a', '#5c2a6e'];
    let s = '';
    for (let row = 0; row < rows; row++) {
      const by = y + (row + 1) * rowH;
      s += `<rect x="${x}" y="${by - 4}" width="${w}" height="12" fill="#2e170c"/><path d="M${x} ${by - 4} H${x + w}" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
      let bx = x + 4;
      while (bx < x + w - 14) {
        const bw = 12 + Math.floor(r() * 12), bh = rowH * (0.55 + r() * 0.3), col = cols[Math.floor(r() * cols.length)];
        if (bx + bw > x + w - 4) break;
        if (r() < 0.1 && bx + bh < x + w - 8) {
          s += `<rect class="o3" x="${n(bx)}" y="${n(by - 4 - bw)}" width="${n(bh)}" height="${bw}" fill="${col}"/>`; bx += bh + 3; continue;
        }
        const lean = r() < 0.12 ? 6 : 0;
        s += `<g transform="rotate(${lean} ${n(bx + bw)} ${by - 4})"><rect class="o3" x="${n(bx)}" y="${n(by - 4 - bh)}" width="${bw}" height="${n(bh)}" rx="1.5" fill="${col}"/>
          <path d="M${n(bx + 2)} ${n(by - bh + 6)} h${bw - 4} M${n(bx + 2)} ${n(by - 14)} h${bw - 4}" stroke="#e8c25a" stroke-width="2" opacity=".75"/>
          <path d="M${n(bx + 3)} ${n(by - bh + 2)} V${by - 8}" stroke="#fff" stroke-opacity=".18" stroke-width="2"/></g>`;
        bx += bw + 2 + (r() < 0.15 ? 6 : 0);
      }
    }
    return s;
  };
  // A fern in a pot.
  K.plant = function (x, y, sc) {
    sc = sc || 1;
    let s = K.shadow(x, y + 4 * sc, 40 * sc, 9 * sc);
    const leaf = (a, l) => { const ex = x + Math.cos(a) * l * sc, ey = y - 60 * sc + Math.sin(a) * l * sc * 0.8; return `<path class="o3" d="M${x} ${n(y - 56 * sc)} Q${n((x + ex) / 2 + 10 * sc)} ${n((y - 60 * sc + ey) / 2 - 22 * sc)} ${n(ex)} ${n(ey)} Q${n((x + ex) / 2)} ${n((y - 60 * sc + ey) / 2)} ${x} ${n(y - 56 * sc)} Z" fill="#2f6b4e"/>`; };
    [-2.6, -2.1, -1.6, -1.2, -0.7, -0.3].forEach((a, i) => { s += leaf(a, 60 + (i % 2) * 18); });
    s += `<path class="o" d="M${n(x - 30 * sc)} ${n(y - 58 * sc)} H${n(x + 30 * sc)} L${n(x + 22 * sc)} ${y} H${n(x - 22 * sc)} Z" fill="#a0522d"/><rect class="o3" x="${n(x - 34 * sc)}" y="${n(y - 64 * sc)}" width="${n(68 * sc)}" height="${n(12 * sc)}" rx="3" fill="#b8683a"/>
      <path d="M${n(x - 24 * sc)} ${n(y - 50 * sc)} L${n(x - 18 * sc)} ${n(y - 6 * sc)}" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>`;
    return s;
  };
  // A small framed picture: 'cert' | 'map' | 'land' | 'notice'.
  K.frame = function (x, y, w, h, kind, fr) {
    let s = `${K.shadow(x + w / 2 + 5, y + h + 8, w * 0.6, 8, 0.4)}<rect class="o" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fr || '#5a3320'}"/><path d="M${x + 3} ${y + h - 3} V${y + 3} H${x + w - 3}" stroke="#fff" stroke-opacity=".2" stroke-width="2" fill="none"/>`;
    const ix = x + 8, iy = y + 8, iw = w - 16, ih = h - 16;
    if (kind === 'cert') s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#f4ecd8"/><path d="M${ix + 8} ${iy + 10} H${ix + iw - 8} M${ix + 12} ${iy + 20} H${ix + iw - 12} M${ix + 12} ${iy + 28} H${ix + iw - 18}" stroke="#5d4b70" stroke-width="2"/><circle cx="${ix + iw - 12}" cy="${iy + ih - 12}" r="7" fill="#b3202a"/>`;
    else if (kind === 'map') s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#e9d8b0"/><path d="M${ix + 6} ${iy + ih * 0.6} Q${ix + iw * 0.3} ${iy + ih * 0.2} ${ix + iw * 0.55} ${iy + ih * 0.5} T${ix + iw - 6} ${iy + ih * 0.3}" stroke="#3b6bd0" stroke-width="3" fill="none"/><path d="M${ix + iw * 0.2} ${iy + ih * 0.3} l6 6 m0 -6 l-6 6" stroke="#c0302a" stroke-width="2"/><path d="M${ix} ${iy + ih / 2} H${ix + iw} M${ix + iw / 2} ${iy} V${iy + ih}" stroke="#a89060" stroke-width="1" opacity=".6"/>`;
    else if (kind === 'notice') s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#f4ecd8"/><rect x="${ix}" y="${iy}" width="${iw}" height="${n(ih * 0.25)}" fill="#3b1d73"/><path d="M${ix + 6} ${iy + ih * 0.45} H${ix + iw - 6} M${ix + 6} ${iy + ih * 0.62} H${ix + iw - 10} M${ix + 6} ${iy + ih * 0.79} H${ix + iw - 16}" stroke="#5d4b70" stroke-width="2"/>`;
    else s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#26405a"/><path d="M${ix} ${iy + ih * 0.7} Q${ix + iw * 0.3} ${iy + ih * 0.45} ${ix + iw * 0.55} ${iy + ih * 0.62} T${ix + iw} ${iy + ih * 0.5} V${iy + ih} H${ix} Z" fill="#2f6b4e"/><circle cx="${ix + iw * 0.75}" cy="${iy + ih * 0.3}" r="${n(Math.min(iw, ih) * 0.1)}" fill="#f8ecc2"/>`;
    return s;
  };
  // A side chair, seen from the front.
  K.chair = function (x, y, c, c2) {
    return `${K.shadow(x, y + 4, 52, 10)}
      <path class="o" d="M${x - 34} ${y - 70} V${y - 150} Q${x} ${y - 178} ${x + 34} ${y - 150} V${y - 70} Z" fill="${c2}"/><path class="o3" d="M${x - 22} ${y - 80} V${y - 140} Q${x} ${y - 158} ${x + 22} ${y - 140} V${y - 80} Z" fill="${c}"/>
      <path d="M${x - 34} ${y - 70} L${x - 40} ${y} M${x + 34} ${y - 70} L${x + 40} ${y}" stroke="#2e170c" stroke-width="9"/><path d="M${x - 34} ${y - 70} L${x - 40} ${y} M${x + 34} ${y - 70} L${x + 40} ${y}" class="o3" fill="none"/>
      <rect class="o" x="${x - 44}" y="${y - 74}" width="88" height="20" rx="6" fill="${c}"/><path d="M${x - 38} ${y - 70} H${x + 30}" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>`;
  };
  // A wooden crate.
  K.crate = (x, y, w, h) => `${K.shadow(x + w / 2, y + h + 2, w * 0.62, 9)}${K.box(x, y, w, h, '#8a6234', '#5a3e1e', 2)}<path d="M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}" stroke="#5a3e1e" stroke-width="5"/><path d="M${x} ${y + h / 2} H${x + w}" stroke="#5a3e1e" stroke-width="4"/>`;

  /* ---------- drifting dust in a beam of light ---------- */
  K.dust = function (x, y, w, h, count, seed) {
    const r = K.rng(seed || 7);
    let s = `<path d="M${x} ${y} L${x + w * 0.35} ${y} L${x + w} ${y + h} L${x + w * 0.4} ${y + h} Z" fill="url(#k-beam)"/>`;
    for (let i = 0; i < (count || 14); i++) {
      const px = x + w * 0.2 + r() * w * 0.6, py = y + r() * h;
      s += `<circle class="mote m${1 + (i % 6)}" cx="${n(px)}" cy="${n(py)}" r="${n(1.6 + r() * 2.4)}" fill="#ffeccc" opacity="${n(0.35 + r() * 0.45)}"/>`;
    }
    return s;
  };

  // The clickable area for a clue: its spot, or a box around its own position ("at").
  // Used by the game (play.js) and by the case checker, which makes sure badges never collide.
  Art.hotspotRect = function (k, art) {
    const sp = (art && art.spots[k.spot]) || { x: 800, y: 450, w: 100, h: 100 };
    if (k.at) { const s = Math.max(90, ((Art.propScale && Art.propScale[k.prop]) || 0.9) * 100); return { x: k.at[0], y: k.at[1], w: s, h: s }; }
    return { x: sp.x, y: sp.y, w: sp.w || 100, h: sp.h || 100 };
  };

  // Whole scene: the room's own art, with the light and shadow on top.
  Art.scene = function (artId, state) {
    const room = Art.rooms[artId];
    if (!room) return `<rect width="1600" height="900" fill="#1a1028"/>`;
    return room.draw(state || {});
  };
  // The shared gradients live once on the page (in a tiny hidden SVG), so scenes,
  // props and portraits can all use them.
  Art.installDefs = function () {
    if (document.getElementById('k-defs')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'k-defs'); svg.setAttribute('class', 'defs-holder'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.innerHTML = `<defs>${K.defs()}</defs>`;
    document.body.prepend(svg);
  };
})(window.SQH);
