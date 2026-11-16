/* =========================================================
   SHRED THE GLOBE — game logic
   Plain JavaScript, no build step. Data comes from:
     data/geo-data.js   (window.GEO)    facts + populations
     data/skate-data.js (window.SKATE)  skate scene facts + skaters
     data/world-topo.js / data/us-topo.js  map shapes
   ========================================================= */
(() => {
  'use strict';

  const GEO = window.GEO;
  const SKATE = window.SKATE;
  const ROUNDS = 15;
  const BOARD_SIZE = 10;
  const STORE_KEY = 'shredTheGlobe.v1';

  const STYLES = { standard: 'Standard', skate: 'Skate Mode' };
  const GAMES = { spot: 'Spot Hunt', flag: 'Flag Flip' };
  const TURFS = { world: 'World', usa: 'USA' };

  // Initials that aren't allowed on the leaderboard.
  const BLOCKED = new Set(('ASS ARS AZZ FUK FUC FCK FUQ FKU FKN FUX SHT SHI DIK DIC DCK DIX COK CUM KUM CNT KNT ' +
    'KKK NIG NGR NGA NGG FAG FGT TIT TTS WTF STF SEX SXY XXX JIZ JIS HOE VAG PIS PSS CRP DMN SUK SUC SCK NAZ').split(' '));

  /* ---------------- tiny helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nf = new Intl.NumberFormat('en-US');
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function fmtTime(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function popShort(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + ' billion';
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e8 ? 0 : 1).replace(/\.0$/, '') + ' million';
    return nf.format(n);
  }
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- storage (safe if blocked) ---------------- */
  const store = (() => {
    let mem = {};
    let ok = false;
    try { localStorage.setItem('__stg', '1'); localStorage.removeItem('__stg'); ok = true; } catch (e) { ok = false; }
    const read = () => { if (!ok) return mem; try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } };
    const write = (o) => { mem = o; if (!ok) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } };
    return {
      get(k, d) { const o = read(); return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : d; },
      set(k, v) { const o = read(); o[k] = v; write(o); }
    };
  })();

  /* ---------------- sound (synthesized, no audio files) ---------------- */
  const Sound = (() => {
    let ctx = null;
    let on = store.get('sound', true);
    function ac() {
      if (!on) return null;
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(f, dur, { type = 'sine', vol = 0.18, at = 0, to = null } = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + at;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, { vol = 0.2, at = 0, freq = 1800 } = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + at;
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = vol;
      src.connect(f).connect(g).connect(c.destination); src.start(t);
    }
    return {
      get on() { return on; },
      toggle() { on = !on; store.set('sound', on); if (on) this.click(); return on; },
      click() { tone(1400, 0.04, { type: 'square', vol: 0.05 }); },
      pick() { noise(0.06, { vol: 0.35, freq: 2500 }); },
      good() { noise(0.07, { vol: 0.5, freq: 1200 }); tone(660, 0.12, { type: 'triangle', vol: 0.2, at: 0.02 }); tone(990, 0.22, { type: 'triangle', vol: 0.2, at: 0.1 }); },
      bad() { noise(0.12, { vol: 0.35, freq: 400 }); tone(180, 0.32, { type: 'sawtooth', vol: 0.09, to: 80 }); },
      streak() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, { type: 'square', vol: 0.06, at: i * 0.07 })); },
      kickflip() { noise(0.05, { vol: 0.55, freq: 3200 }); tone(240, 0.4, { type: 'triangle', vol: 0.05, at: 0.04, to: 760 }); noise(0.09, { vol: 0.65, freq: 900, at: 0.66 }); tone(110, 0.14, { vol: 0.14, at: 0.66 }); },
      fanfare() { [392, 523, 659, 784, 659, 1047].forEach((f, i) => tone(f, 0.2, { type: 'square', vol: 0.07, at: i * 0.11 })); }
    };
  })();

  /* ---------------- data indexes ---------------- */
  const countries = GEO.countries;
  const states = GEO.states;
  const byId = { world: new Map(countries.map((c) => [c.id, c])), usa: new Map(states.map((s) => [s.id, s])) };
  const skateOf = (turf, item) => (turf === 'world' ? SKATE.countries : SKATE.states)[item.iso] || null;
  function poolFor(s) {
    const list = s.turf === 'world' ? countries : states;
    return s.style === 'skate' ? list.filter((x) => skateOf(s.turf, x)) : list.slice();
  }
  const flagSrc = (turf, item) => 'flags/' + (turf === 'usa' ? 'us-' : '') + item.iso + '.svg';

  // Spot Hunt (World) starts each round zoomed into the right continent.
  // Boxes are [[west longitude, south latitude], [east longitude, north latitude]].
  // Asia is huge, so it's framed as a western or eastern half; Central America & the
  // Caribbean get their own closer view because those countries are small.
  const VIEWS = {
    europe: { label: 'Europe', box: [[-25, 34], [45, 71.5]] },
    africa: { label: 'Africa', box: [[-26, -36], [58, 38]] },
    asiaW: { label: 'Asia', box: [[25, -1], [98, 56]] },
    asiaE: { label: 'Asia', box: [[72, -11], [150, 54]] },
    northAm: { label: 'North America', box: [[-170, 14], [-52, 72]] },
    carib: { label: 'Central America & the Caribbean', box: [[-93, 7], [-59, 27.5]] },
    southAm: { label: 'South America', box: [[-82, -56], [-34, 13]] },
    oceania: { label: 'Oceania', box: [[110, -48], [189, 15]] } // 189 = just past the 180° line
  };
  const VIEW_OVERRIDES = {
    ru: { label: 'Europe & Asia', box: [[20, 38], [180, 78]] },
    tr: { label: 'Europe & Asia', box: VIEWS.asiaW.box }
  };
  function viewFor(item) {
    if (VIEW_OVERRIDES[item.iso]) return VIEW_OVERRIDES[item.iso];
    switch (item.cont) {
      case 'Europe': return VIEWS.europe;
      case 'Africa': return VIEWS.africa;
      case 'South America': return VIEWS.southAm;
      case 'Oceania': return VIEWS.oceania;
      case 'Asia': return item.sub === 'Eastern Asia' || item.sub === 'South-Eastern Asia' ? VIEWS.asiaE : VIEWS.asiaW;
      case 'North America': return item.sub === 'Caribbean' || item.sub === 'Central America' ? VIEWS.carib : VIEWS.northAm;
      default: return null;
    }
  }
  // Kiribati's biggest island is far from its capital; point the dot & zoom at Tarawa instead.
  const FOCUS = { '296': [173.0, 1.4] };
  const shortName = (name) => name.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Friendly names for map shapes that aren't quiz countries
  const NONQUIZ = {
    '304': 'Greenland (part of the Kingdom of Denmark)', '732': 'Western Sahara (disputed territory)', '158': 'Taiwan',
    '275': 'Palestine', 'x-Kosovo': 'Kosovo', '630': 'Puerto Rico (U.S. territory)', '336': 'Vatican City',
    '238': 'Falkland Islands (U.K. territory)', '540': 'New Caledonia (French territory)', '260': 'French Southern Lands',
    'x-Siachen Glacier': 'Siachen Glacier (disputed area)', '344': 'Hong Kong (China)', '446': 'Macao (China)',
    '248': 'Åland Islands (Finland)', '234': 'Faroe Islands (Denmark)', '533': 'Aruba (Netherlands)', '531': 'Curaçao (Netherlands)',
    '258': 'French Polynesia (France)', '316': 'Guam (U.S. territory)', '850': 'U.S. Virgin Islands', '016': 'American Samoa (U.S.)',
    '580': 'Northern Mariana Islands (U.S.)', '060': 'Bermuda (U.K. territory)', '136': 'Cayman Islands (U.K. territory)',
    '092': 'British Virgin Islands', '796': 'Turks and Caicos (U.K. territory)', '660': 'Anguilla (U.K. territory)',
    '500': 'Montserrat (U.K. territory)', '832': 'Jersey (British Crown Dependency)', '831': 'Guernsey (British Crown Dependency)',
    '833': 'Isle of Man (British Crown Dependency)', '574': 'Norfolk Island (Australia)', '184': 'Cook Islands', '570': 'Niue',
    '11': 'Washington, D.C. (not a state)'
  };
  function nameFor(turf, id, feature) {
    const it = byId[turf].get(id);
    if (it) return it.name;
    if (NONQUIZ[id]) return NONQUIZ[id];
    const n = feature && feature.properties && feature.properties.name;
    return n ? n + ' (territory)' : 'that spot';
  }

  /* ---------------- sources & redaction ---------------- */
  function srcInfo(code, item) {
    const i = code.indexOf(':'); const kind = code.slice(0, i); const v = code.slice(i + 1);
    if (kind === 'w') return { label: 'Wikipedia: ' + v.replace(/_/g, ' '), url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(v) };
    if (kind === 'b') {
      const parts = v.split('/');
      const base = item ? shortName(item.name) : parts[0].replace(/-/g, ' ');
      const sub = parts[1] ? ' › ' + parts[1].replace(/-/g, ' ') : '';
      return { label: 'Britannica: ' + base + sub, url: 'https://www.britannica.com/place/' + v };
    }
    return { label: code, url: '#' };
  }
  function srcHTML(codes, item) {
    return '<p class="src">Source: ' + codes.map((c) => {
      const s = srcInfo(c, item);
      return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`;
    }).join(' &middot; ') + '</p>';
  }
  function hideWords(item, turf) {
    const w = new Set([item.name, shortName(item.name)]);
    const inParen = (item.name.match(/\((.*?)\)/) || [])[1]; if (inParen) w.add(inParen);
    const sn = shortName(item.name); if (/^The /.test(sn)) w.add(sn.slice(4));
    (item.hide || []).forEach((x) => w.add(x));
    const sk = skateOf(turf, item); if (sk && sk.hide) sk.hide.forEach((x) => w.add(x));
    return Array.from(w).filter(Boolean).sort((a, b) => b.length - a.length);
  }
  function redact(text, words) {
    let out = esc(text);
    for (const word of words) {
      const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + escRe(esc(word)) + ')(?![\\p{L}\\p{N}])', 'gu');
      out = out.replace(re, (m, pre, hit) => pre + '<span class="redact" aria-label="hidden word">' + 'x'.repeat(Math.max(4, Math.min(hit.length, 12))) + '</span>');
    }
    return out;
  }

  /* ---------------- geometry ---------------- */
  let worldFeatures = null; let worldById = null; let usFeatures = null; let usById = null;
  function prepWorld() {
    if (worldFeatures) return;
    const t = window.WORLD_TOPO;
    worldFeatures = topojson.feature(t, t.objects.countries).features.filter((f) => f.id !== '010');
    for (const f of worldFeatures) {
      if (!f.id) {
        const n = f.properties.name;
        f.id = n === 'N. Cyprus' ? '196' : n === 'Somaliland' ? '706' : 'x-' + n;
      }
    }
    worldById = new Map();
    for (const f of worldFeatures) { const a = worldById.get(f.id) || []; a.push(f); worldById.set(f.id, a); }
  }
  function prepUS() {
    if (usFeatures) return;
    const t = window.US_TOPO;
    usFeatures = topojson.feature(t, t.objects.states).features;
    usById = new Map(usFeatures.map((f) => [f.id, f]));
  }
  function worldFeature(id) {
    prepWorld();
    const arr = worldById.get(id); if (!arr) return null;
    if (arr.length === 1) return arr[0];
    const coords = [];
    for (const f of arr) {
      const g = f.geometry; if (!g) continue;
      if (g.type === 'Polygon') coords.push(g.coordinates); else if (g.type === 'MultiPolygon') coords.push(...g.coordinates);
    }
    return { type: 'Feature', id, properties: arr[0].properties, geometry: { type: 'MultiPolygon', coordinates: coords } };
  }
  // Drop far-away overseas bits (e.g. French Guiana for France) so shapes & zooms focus on the main country.
  const mainCache = new Map();
  function mainGeometry(f) {
    if (!f || !f.geometry || f.geometry.type !== 'MultiPolygon') return f;
    if (mainCache.has(f.id)) return mainCache.get(f.id);
    const polys = f.geometry.coordinates.map((c) => {
      const p = { type: 'Polygon', coordinates: c };
      return { c, a: d3.geoArea(p), ctr: d3.geoCentroid(p) };
    }).sort((a, b) => b.a - a.a);
    const big = polys[0];
    // Distance (in degrees) from a point to the bounding box of the biggest landmass.
    const [[x0, y0], [x1, y1]] = d3.geoBounds({ type: 'Polygon', coordinates: big.c });
    const offMain = ([lon, lat]) => {
      const dlat = lat < y0 ? y0 - lat : lat > y1 ? lat - y1 : 0;
      let dlon = 0;
      if (x0 <= x1) { if (lon < x0) dlon = Math.min(x0 - lon, lon + 360 - x1); else if (lon > x1) dlon = Math.min(lon - x1, x0 + 360 - lon); }
      else if (lon < x0 && lon > x1) dlon = Math.min(x0 - lon, lon - x1); // box crosses the 180° line
      return Math.hypot(dlat, dlon * Math.cos((lat * Math.PI) / 180));
    };
    const keep = polys.filter((p) => p === big || p.a > big.a * 0.2 || offMain(p.ctr) < 6);
    const out = { type: 'Feature', id: f.id, properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: keep.map((p) => p.c) } };
    mainCache.set(f.id, out);
    return out;
  }
  const shapeCache = new Map();
  function shapeSVG(turf, id, w = 150, h = 96) {
    const key = turf + id;
    if (shapeCache.has(key)) return shapeCache.get(key);
    let d = null; let sparse = false;
    if (turf === 'world') {
      const f0 = worldFeature(id);
      if (f0) {
        const f = mainGeometry(f0);
        const c = d3.geoCentroid(f);
        const proj = d3.geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[8, 8], [w - 8, h - 8]], f);
        const gp = d3.geoPath(proj);
        d = gp(f);
        sparse = gp.area(f) < w * h * 0.04; // scattered tiny islands: draw them bold so they're visible
      }
    } else {
      prepUS();
      const f = usById.get(id);
      if (f) { const proj = d3.geoIdentity().fitExtent([[6, 6], [w - 6, h - 6]], f); d = d3.geoPath(proj)(f); }
    }
    const svg = d
      ? `<svg class="shape" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path${sparse ? ' class="sparse"' : ''} d="${d}"/></svg>`
      : `<svg class="shape" viewBox="0 0 ${w} ${h}" aria-hidden="true"><circle cx="${w / 2 - 22}" cy="${h / 2 + 6}" r="4"/><circle cx="${w / 2 - 6}" cy="${h / 2 - 8}" r="3"/><circle cx="${w / 2 + 10}" cy="${h / 2 + 2}" r="5"/><circle cx="${w / 2 + 26}" cy="${h / 2 - 12}" r="3"/></svg>`;
    shapeCache.set(key, svg);
    return svg;
  }

  /* ---------------- interactive map ---------------- */
  function createMap(turf, container) {
    let features, path, proj = null, W, H;
    if (turf === 'world') {
      prepWorld();
      features = worldFeatures;
      W = 1000;
      proj = d3.geoNaturalEarth1().rotate([-10, 0]);
      const fc = { type: 'FeatureCollection', features };
      proj.fitWidth(W, fc);
      path = d3.geoPath(proj);
      H = Math.ceil(path.bounds(fc)[1][1]);
    } else {
      prepUS();
      features = usFeatures; W = 975; H = 610; path = d3.geoPath();
    }
    const quiz = byId[turf];
    const svg = d3.select(container).append('svg')
      .attr('class', 'map').attr('data-turf', turf)
      .attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img').attr('aria-label', turf === 'world' ? 'World map' : 'Map of the United States');
    const g = svg.append('g');
    if (proj) g.append('path').attr('class', 'grat').attr('d', path(d3.geoGraticule10()));
    g.selectAll('path.geo').data(features).join('path')
      .attr('class', (d) => 'geo ' + (quiz.has(d.id) ? 'q' : 'nq'))
      .attr('data-id', (d) => d.id)
      .attr('d', path);

    // Dots make tiny places clickable.
    const dots = [];
    const items = turf === 'world' ? countries : states;
    for (const it of items) {
      let pt = null;
      if (turf === 'world') {
        const f0 = worldFeature(it.id);
        if (FOCUS[it.id]) pt = proj(FOCUS[it.id]);
        else if (!f0) { if (it.iso === 'tv') pt = proj([179.2, -8.52]); }
        else {
          const f = mainGeometry(f0); const b = path.bounds(f);
          if (Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) < 7) pt = proj(d3.geoCentroid(f));
        }
      } else if (it.id === '44' || it.id === '10') {
        pt = path.centroid(usById.get(it.id));
      }
      if (pt) dots.push({ id: it.id, x: pt[0], y: pt[1] });
    }
    const DOT_R = turf === 'world' ? 4.2 : 6;
    const dotSel = g.selectAll('circle.dot').data(dots).join('circle')
      .attr('class', 'dot').attr('data-id', (d) => d.id).attr('cx', (d) => d.x).attr('cy', (d) => d.y).attr('r', DOT_R);

    const zoom = d3.zoom().scaleExtent([1, 60]).translateExtent([[-40, -40], [W + 40, H + 40]]).clickDistance(6)
      .on('zoom', (ev) => { g.attr('transform', ev.transform); dotSel.attr('r', DOT_R / Math.pow(ev.transform.k, 0.72)); });
    svg.call(zoom).on('dblclick.zoom', null);

    let live = false;
    let onPick = null;
    svg.on('click', (ev) => {
      const t = ev.target.closest ? ev.target.closest('[data-id]') : null;
      if (!t || !live || !onPick) return;
      const id = t.getAttribute('data-id');
      const feat = d3.select(t).datum();
      onPick(id, feat);
    });

    function sel(id) { return g.selectAll(`[data-id="${CSS.escape(id)}"]`); }
    function boundsOf(id) {
      if (turf === 'world') {
        if (FOCUS[id]) { const p = proj(FOCUS[id]); return [[p[0] - 4, p[1] - 4], [p[0] + 4, p[1] + 4]]; }
        const f = worldFeature(id);
        if (f) return path.bounds(mainGeometry(f));
      } else if (usById.get(id)) return path.bounds(usById.get(id));
      const d = dots.find((x) => x.id === id);
      return d ? [[d.x - 4, d.y - 4], [d.x + 4, d.y + 4]] : null;
    }
    // How much of the map (in map units) actually fits on screen right now.
    function visibleSize() {
      const r = svg.node().getBoundingClientRect();
      if (!r.width || !r.height) return [W, H];
      const s = Math.min(r.width / W, r.height / H);
      return [r.width / s, r.height / s];
    }
    // Zoom so that projected bounds b fill the screen (pad < 1 leaves breathing room).
    function fit(b, maxK, pad) {
      const [vw, vh] = visibleSize();
      const dx = Math.max(b[1][0] - b[0][0], 1), dy = Math.max(b[1][1] - b[0][1], 1);
      const k = Math.max(1, Math.min(maxK, pad * Math.min(vw / dx, vh / dy)));
      const cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
      return d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-cx, -cy);
    }
    // Turn a longitude/latitude box into on-map bounds.
    function boxBounds([[lo0, la0], [lo1, la1]]) {
      const pts = [];
      for (let lo = lo0; lo <= lo1; lo += 2) pts.push([lo, la0], [lo, la1]);
      for (let la = la0; la <= la1; la += 2) pts.push([lo0, la], [lo1, la]);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [lo, la] of pts) {
        const p = proj([lo > 180 ? lo - 360 : lo, la]); if (!p) continue;
        x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
      }
      return [[x0, y0], [x1, y1]];
    }
    let home = d3.zoomIdentity; // where "re-center" goes: the current continent, or the whole map
    const go = (t, ms) => (ms && !reducedMotion ? svg.transition().duration(ms) : svg).call(zoom.transform, t);
    const api = {
      turf, el: svg.node(),
      setLive(v) { live = v; svg.classed('is-live', v); },
      onPick(fn) { onPick = fn; },
      clearMarks() { g.selectAll('.is-correct,.is-wrong,.is-target').classed('is-correct is-wrong is-target', false); },
      mark(id, cls) { sel(id).classed(cls, true).raise(); dotSel.raise(); },
      // Fly the camera to a continent box (or the whole map when box is null).
      frame(box, ms = 700) { home = box && proj ? fit(boxBounds(box), 8, 0.96) : d3.zoomIdentity; go(home, ms); },
      reset(animate = true) { go(home, animate ? 550 : 0); },
      zoomBy(f) { svg.transition().duration(250).call(zoom.scaleBy, f); },
      // After a miss: zoom in on the right answer if it's small, or slide over if it's off-screen.
      zoomTo(id) {
        const b = boundsOf(id); if (!b) return;
        const want = fit(b, turf === 'world' ? 10 : 4, 0.45);
        const cur = d3.zoomTransform(svg.node());
        if (want.k > cur.k * 1.25) { go(want, 850); return; }
        const [vw, vh] = visibleSize();
        const cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
        const c = cur.apply([cx, cy]);
        const onScreen = Math.abs(c[0] - W / 2) < vw / 2 - 30 && Math.abs(c[1] - H / 2) < vh / 2 - 30;
        if (!onScreen) go(d3.zoomIdentity.translate(W / 2, H / 2).scale(cur.k).translate(-cx, -cy), 850);
      }
    };
    return api;
  }

  /* ---------------- title globe ---------------- */
  const Globe = (() => {
    const canvas = $('#globe');
    const ctx = canvas.getContext('2d');
    let land = null, raf = 0, running = false, last = 0, lon = -20;
    const grat = d3.geoGraticule10();
    function size() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const px = Math.max(200, Math.round(r.width * dpr));
      if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
    }
    function draw() {
      if (!land) { const t = window.WORLD_TOPO; land = topojson.feature(t, t.objects.land); }
      const s = canvas.width;
      const proj = d3.geoOrthographic().translate([s / 2, s / 2]).scale(s / 2 - s * 0.02).rotate([lon, -18]).clipAngle(90);
      const path = d3.geoPath(proj, ctx);
      const skate = document.body.classList.contains('style-skate');
      ctx.clearRect(0, 0, s, s);
      const grd = ctx.createRadialGradient(s * 0.38, s * 0.32, s * 0.05, s / 2, s / 2, s / 2);
      grd.addColorStop(0, skate ? '#3a1d52' : '#2b4563'); grd.addColorStop(1, skate ? '#140a1d' : '#101a26');
      ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); path(grat); ctx.strokeStyle = skate ? 'rgba(255,63,164,.22)' : 'rgba(255,255,255,.10)'; ctx.lineWidth = Math.max(1, s / 600); ctx.stroke();
      ctx.beginPath(); path(land); ctx.fillStyle = skate ? '#c8ff1a' : '#f3eee3'; ctx.fill();
      ctx.strokeStyle = '#0c0c0d'; ctx.lineWidth = Math.max(1, s / 450); ctx.stroke();
      ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = '#0c0c0d'; ctx.lineWidth = s / 70; ctx.stroke();
    }
    function frame(t) {
      if (!running) return;
      if (t - last > 33) { lon += ((t - last) / 1000) * 7; last = t; draw(); }
      raf = requestAnimationFrame(frame);
    }
    return {
      play() { size(); if (reducedMotion) { draw(); return; } if (running) return; running = true; last = performance.now(); draw(); raf = requestAnimationFrame(frame); },
      pause() { running = false; cancelAnimationFrame(raf); },
      redraw() { size(); draw(); }
    };
  })();

  /* ---------------- title skateboard: tap for a kickflip ---------------- */
  const deckSvg = $('#logo-deck');
  function kickflip(withSound) {
    if (reducedMotion || deckSvg.classList.contains('is-flip')) return;
    deckSvg.classList.add('is-flip');
    if (withSound) Sound.kickflip();
  }
  deckSvg.addEventListener('animationend', (e) => { if (e.animationName === 'kickflip') deckSvg.classList.remove('is-flip'); });
  $('#deck-btn').addEventListener('click', () => kickflip(true));
  setTimeout(() => { if (screen === 'title') kickflip(false); }, 1400);
  setInterval(() => { if (screen === 'title' && !document.hidden) kickflip(false); }, 9000);

  /* ---------------- screens & UI basics ---------------- */
  let screen = 'title'; let prevScreen = 'title';
  function show(name) {
    if (name !== screen) prevScreen = screen;
    screen = name;
    $$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === 'screen-' + name));
    document.body.classList.toggle('in-game', name === 'game');
    if (name === 'title') Globe.play(); else Globe.pause();
    window.scrollTo(0, 0);
  }
  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-show'), 1500);
  }
  function openModal(id) { const m = $('#' + id); m.hidden = false; return m; }
  function closeModal(id) { $('#' + id).hidden = true; }
  function confirmBox(text) {
    return new Promise((resolve) => {
      $('#confirm-text').textContent = text; openModal('confirm');
      const done = (v) => { closeModal('confirm'); $('#confirm-yes').onclick = $('#confirm-no').onclick = null; resolve(v); };
      $('#confirm-yes').onclick = () => done(true); $('#confirm-no').onclick = () => done(false);
      $('#confirm-no').focus();
    });
  }

  /* ---------------- settings / setup screen ---------------- */
  const settings = Object.assign({ style: 'standard', game: 'spot', turf: 'world' }, store.get('settings', {}));
  function applyStyleClass() {
    document.body.classList.toggle('style-skate', settings.style === 'skate');
    document.body.classList.toggle('style-standard', settings.style !== 'skate');
    if (screen === 'title') Globe.redraw();
  }
  function renderSetup() {
    $$('.choice').forEach((b) => b.setAttribute('aria-checked', String(settings[b.dataset.key] === b.dataset.val)));
    const sk = settings.style === 'skate';
    $('[data-count="world"]').textContent = sk ? `${poolFor({ style: 'skate', turf: 'world' }).length} countries with legit skate scenes.` : `All ${countries.length} UN member countries.`;
    $('[data-count="usa"]').textContent = sk ? `${poolFor({ style: 'skate', turf: 'usa' }).length} states with skate history & legends.` : 'All 50 states.';
    const n = Math.min(ROUNDS, poolFor(settings).length);
    $('#setup-summary').innerHTML = `<strong>${esc(boardName(settings))}</strong><br>${n} rounds &middot; 1 point per right answer &middot; fastest time breaks ties.`;
    applyStyleClass();
  }
  $$('.choice').forEach((b) => b.addEventListener('click', () => {
    settings[b.dataset.key] = b.dataset.val; store.set('settings', settings); Sound.click(); renderSetup();
  }));

  /* ---------------- leaderboards ----------------
     When js/config.js has a leaderboardUrl (a Google Apps Script web app — see
     LEADERBOARD-SETUP.md), everyone who plays shares the same Top 10 boards.
     Without one, or if the internet drops, scores are kept in this browser instead,
     so the game always works. */
  const boardKey = (s) => `${s.style}:${s.game}:${s.turf}`;
  const boardName = (s) => `${GAMES[s.game]} · ${TURFS[s.turf]} · ${STYLES[s.style]}`;
  const cmpEntry = (a, b) => (b.s - a.s) || (a.t - b.t) || ((a.at || 0) - (b.at || 0));
  const LB_URL = String((window.STG_CONFIG && window.STG_CONFIG.leaderboardUrl) || '').trim();
  const ONLINE = /^https:\/\//.test(LB_URL);
  const OFFLINE_NOTE = '<p class="boards__note boards__note--warn">Couldn\'t reach the online leaderboard right now, so these are scores saved on this device.</p>';
  const localBoards = {
    all() { return store.get('boards', {}); },
    get(key) { return (this.all()[key] || []).slice().sort(cmpEntry).slice(0, BOARD_SIZE); },
    add(key, e) { const a = this.all(); a[key] = (a[key] || []).concat([e]).sort(cmpEntry).slice(0, BOARD_SIZE); store.set('boards', a); return this.get(key); },
    reset(key) { const a = this.all(); delete a[key]; store.set('boards', a); }
  };
  async function lbRequest(params, body) {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      // POSTing plain text (no custom headers) keeps this a "simple" request that Google Apps Script accepts.
      const res = body
        ? await fetch(LB_URL, { method: 'POST', body: JSON.stringify(body), signal: ctl.signal, redirect: 'follow' })
        : await fetch(LB_URL + (LB_URL.includes('?') ? '&' : '?') + new URLSearchParams(params), { signal: ctl.signal, redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  async function fetchTop(key) {
    const j = await lbRequest({ action: 'top', board: key });
    if (!j.ok) throw new Error(j.error);
    return (j.entries || []).sort(cmpEntry);
  }
  const Boards = {
    // -> { list, offline }   (tries twice: Google sometimes hiccups while the script wakes up)
    async list(key) {
      if (!ONLINE) return { list: localBoards.get(key), offline: false };
      for (let attempt = 0; attempt < 2; attempt++) {
        try { return { list: await fetchTop(key), offline: false }; } catch (e) { if (attempt === 0) await pause(1200); }
      }
      return { list: localBoards.get(key), offline: true };
    },
    // -> { list, id, offline } or { error }
    async add(key, entry) {
      if (ONLINE) {
        const payload = { action: 'add', board: key, initials: entry.i, points: entry.s, outOf: entry.n, timeMs: entry.t };
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const j = await lbRequest(null, payload);
            if (!j.ok) return { error: j.error || 'Could not save that score.' };
            return { list: (j.entries || []).sort(cmpEntry), id: j.id, offline: false };
          } catch (e) {
            // The save may have gone through even though the reply got lost: check before sending it again.
            try {
              const list = await fetchTop(key);
              const hit = list.find((x) => x.i === entry.i && +x.s === entry.s && +x.t === entry.t);
              if (hit) return { list, id: hit.id, offline: false };
            } catch (e2) { /* still unreachable */ }
            if (attempt === 0) await pause(1200);
          }
        }
        // no internet — save it on this device below
      }
      const d = new Date();
      const local = Object.assign({}, entry, { d: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), at: d.getTime(), id: 'L' + d.getTime() });
      return { list: localBoards.add(key, local), id: local.id, offline: ONLINE };
    },
    reset(key) { localBoards.reset(key); }
  };
  const qualifies = (list, s, t) => s > 0 && (list.length < BOARD_SIZE || cmpEntry({ s, t, at: Date.now() }, list[list.length - 1]) < 0);
  function boardTable(list, highlightId, caption) {
    if (!list.length) return (caption ? `<p class="board__cap">${esc(caption)}</p>` : '') + '<div class="board__empty">No scores yet — be the first to drop in!</div>';
    const rows = list.map((e, i) => `<tr class="rank-${i + 1}${highlightId && e.id === highlightId ? ' is-new' : ''}"><td>${i + 1}</td><td class="ini">${esc(e.i)}</td><td class="pts">${+e.s}/${+e.n}</td><td>${fmtTime(+e.t)}</td><td>${esc(e.d || '')}</td></tr>`).join('');
    return `<table class="board">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr><th>#</th><th>Skater</th><th>Points</th><th>Time</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  const loadingHTML = (caption) => (caption ? `<p class="board__cap">${esc(caption)}</p>` : '') + '<div class="board__empty">Loading scores…</div>';
  let boardsView = { style: 'standard', game: 'spot', turf: 'world' };
  let boardsToken = 0;
  async function renderBoards() {
    $('#tabs-style').innerHTML = Object.keys(STYLES).map((k) => `<button class="tab${k === 'skate' ? ' tab--skate' : ''}" role="tab" aria-selected="${boardsView.style === k}" data-style="${k}">${STYLES[k]}</button>`).join('');
    const combos = [['spot', 'world'], ['spot', 'usa'], ['flag', 'world'], ['flag', 'usa']];
    $('#tabs-game').innerHTML = combos.map(([g, t]) => `<button class="tab" role="tab" aria-selected="${boardsView.game === g && boardsView.turf === t}" data-game="${g}" data-turf="${t}">${GAMES[g]} · ${TURFS[t]}</button>`).join('');
    const key = boardKey(boardsView); const name = boardName(boardsView); const token = ++boardsToken;
    $('#boards-table').innerHTML = loadingHTML(name);
    const { list, offline } = await Boards.list(key);
    if (token !== boardsToken) return; // a different tab was picked while loading
    $('#boards-table').innerHTML = boardTable(list, null, name) + (offline ? OFFLINE_NOTE : '');
  }
  $('#tabs-style').addEventListener('click', (e) => { const b = e.target.closest('[data-style]'); if (!b) return; boardsView.style = b.dataset.style; Sound.click(); renderBoards(); });
  $('#tabs-game').addEventListener('click', (e) => { const b = e.target.closest('[data-game]'); if (!b) return; boardsView.game = b.dataset.game; boardsView.turf = b.dataset.turf; Sound.click(); renderBoards(); });
  // Resetting is only offered for on-device boards; shared boards are managed in the Google Sheet.
  $('#btn-reset-board').hidden = ONLINE;
  $('.boards__note').textContent = ONLINE ? 'Everyone who plays Shred the Globe shares these boards.' : 'Scores are saved in this web browser on this device.';
  $('#btn-reset-board').addEventListener('click', async () => {
    if (!localBoards.get(boardKey(boardsView)).length) { toast('Board is already empty'); return; }
    if (await confirmBox(`Erase every score on the "${boardName(boardsView)}" board? This can't be undone.`)) { Boards.reset(boardKey(boardsView)); renderBoards(); toast('Board reset'); }
  });
  function openBoards(view) { boardsView = Object.assign({}, view || settings); renderBoards(); show('boards'); }

  /* ---------------- maps (created on first use) ---------------- */
  const maps = {};
  function getMap(turf) {
    if (!maps[turf]) {
      maps[turf] = createMap(turf, $('#mapbox'));
      maps[turf].onPick(onMapPick);
    }
    Object.values(maps).forEach((m) => { m.el.style.display = m.turf === turf ? '' : 'none'; });
    return maps[turf];
  }
  $('#zoom-in').addEventListener('click', () => run && maps[run.s.turf] && maps[run.s.turf].zoomBy(1.7));
  $('#zoom-out').addEventListener('click', () => run && maps[run.s.turf] && maps[run.s.turf].zoomBy(1 / 1.7));
  $('#zoom-reset').addEventListener('click', () => run && maps[run.s.turf] && maps[run.s.turf].reset());

  /* ---------------- the run ---------------- */
  let run = null;
  const cur = () => run.items[run.i];

  function startRun() {
    const s = Object.assign({}, settings);
    const pool = shuffle(poolFor(s));
    const n = Math.min(ROUNDS, pool.length);
    run = { s, key: boardKey(s), items: pool.slice(0, n), i: 0, score: 0, streak: 0, best: 0, elapsed: 0, t0: 0, timing: false, answered: false, results: [] };
    $('#hud-mode').textContent = boardName(s);
    $('#play-spot').classList.toggle('is-active', s.game === 'spot');
    $('#play-flag').classList.toggle('is-active', s.game === 'flag');
    $('#clue-kind').textContent = s.turf === 'world' ? 'country' : 'state';
    $('#quit').classList.remove('is-confirming');
    $('.hud__stat--streak').classList.remove('is-hot');
    if (ONLINE) Boards.list(run.key); // wake up the online leaderboard early so the end screen is quick
    show('game');
    if (s.game === 'spot') getMap(s.turf);
    updateHUD();
    nextRound();
  }

  function updateHUD() {
    $('#hud-round').textContent = `${Math.min(run.i + 1, run.items.length)}/${run.items.length}`;
    $('#hud-score').textContent = run.score;
    $('#hud-streak').textContent = run.streak;
    $('#hud-time').textContent = fmtTime(curElapsed());
  }
  function curElapsed() { return run ? run.elapsed + (run.timing ? performance.now() - run.t0 : 0) : 0; }
  function startTimer() { if (!run || run.timing) return; run.t0 = performance.now(); run.timing = true; }
  function stopTimer() { if (!run || !run.timing) return; run.elapsed += performance.now() - run.t0; run.timing = false; }
  setInterval(() => { if (run && run.timing && screen === 'game') $('#hud-time').textContent = fmtTime(curElapsed()); }, 250);
  // Pause the clock if the tab is hidden, so it stays fair.
  let pausedByHide = false;
  document.addEventListener('visibilitychange', () => {
    if (!run) return;
    if (document.hidden && run.timing) { stopTimer(); pausedByHide = true; }
    else if (!document.hidden && pausedByHide) { pausedByHide = false; if (!run.answered && screen === 'game' && $('#reveal').hidden) startTimer(); }
  });

  function nextRound() {
    run.answered = false;
    updateHUD();
    const item = cur();
    // preload the next flag
    const nxt = run.items[run.i + 1]; if (nxt) { const im = new Image(); im.src = flagSrc(run.s.turf, nxt); }
    if (run.s.game === 'spot') spotRound(item); else flagRound(item);
  }

  /* ---- Spot Hunt ---- */
  function spotRound(item) {
    const map = getMap(run.s.turf);
    const view = run.s.turf === 'world' ? viewFor(item) : null;
    map.clearMarks(); map.setLive(true);
    map.frame(view ? view.box : null, run.i > 0 || view ? 750 : 0);
    $('#map-msg').className = 'map-msg';
    $('#spot-name').textContent = item.name;
    $('#spot-where').textContent = view ? 'in ' + view.label : '';
    $('#spot-where').hidden = !view;
    const p = $('#spot-prompt'); p.classList.remove('is-pop'); void p.offsetWidth; p.classList.add('is-pop');
    startTimer();
  }
  function onMapPick(id, feature) {
    if (!run || run.answered || screen !== 'game') return;
    const item = cur(); const map = maps[run.s.turf];
    stopTimer(); run.answered = true; map.setLive(false);
    const ok = id === item.id;
    const msg = $('#map-msg');
    if (ok) {
      map.mark(id, 'is-correct');
      msg.innerHTML = 'Landed it! +1';
      msg.className = 'map-msg good is-show';
      Sound.good();
    } else {
      map.mark(id, 'is-wrong'); map.mark(item.id, 'is-target');
      msg.innerHTML = `Bailed! That's ${esc(nameFor(run.s.turf, id, feature))}<small>${esc(shortName(item.name))} is flashing green</small>`;
      msg.className = 'map-msg bad is-show';
      Sound.bad();
      map.zoomTo(item.id);
    }
    record(ok, id, feature);
    setTimeout(() => openReveal(ok, id, feature), ok ? 900 : 2300);
  }

  /* ---- Flag Flip ---- */
  function pickDistractors(item, turf, n) {
    if (turf === 'usa') return shuffle(states.filter((x) => x.id !== item.id)).slice(0, n);
    const sameSub = shuffle(countries.filter((x) => x.id !== item.id && x.sub === item.sub));
    const sameCont = shuffle(countries.filter((x) => x.id !== item.id && x.cont === item.cont && x.sub !== item.sub));
    const rest = shuffle(countries.filter((x) => x.id !== item.id && x.cont !== item.cont));
    const out = [];
    for (const p of [...sameSub.slice(0, 2), ...sameCont, ...sameSub.slice(2), ...rest]) { if (out.length >= n) break; if (!out.includes(p)) out.push(p); }
    return out;
  }
  function flagRound(item) {
    const turf = run.s.turf;
    const words = hideWords(item, turf);
    const img = $('#clue-flag');
    img.onload = null;
    img.alt = 'Mystery flag';
    img.src = flagSrc(turf, item);
    $('#clue-pop').textContent = popShort(item.pop);
    $('#clue-fact').innerHTML = redact(item.fact, words);
    const sk = run.s.style === 'skate' ? skateOf(turf, item) : null;
    $('#clue-skate').innerHTML = sk && sk.facts.length ? `<h4>Skate scene clue</h4><p>${redact(sk.facts[0].t, words)}</p>` : '';
    const opts = shuffle([item, ...pickDistractors(item, turf, 4)]);
    $('#options').innerHTML = opts.map((o, i) => `<button class="opt" type="button" data-id="${esc(o.id)}"><span class="opt__key">${i + 1}</span>${shapeSVG(turf, o.id)}<span class="opt__name">${esc(o.name)}</span></button>`).join('');
    const card = $('#clue'); card.scrollTop = 0;
    startTimer();
  }
  $('#options').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b) pickOption(b); });
  function pickOption(btn) {
    if (!run || run.answered) return;
    const item = cur();
    stopTimer(); run.answered = true;
    const ok = btn.dataset.id === item.id;
    $$('.opt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === item.id) b.classList.add('is-correct');
      else if (b === btn) b.classList.add('is-wrong');
      else b.classList.add('is-dim');
    });
    if (ok) Sound.good(); else Sound.bad();
    record(ok, btn.dataset.id, null);
    setTimeout(() => openReveal(ok, btn.dataset.id, null), ok ? 650 : 1300);
  }

  /* ---- scoring ---- */
  const STREAK_MSG = { 3: 'Three in a row!', 5: 'Five! Shredding!', 8: 'Eight! On a tear!', 10: 'Ten! Unstoppable!', 15: 'Flawless!!' };
  function record(ok, pickedId, feature) {
    const item = cur();
    run.results.push({ item, ok, pickedId, pickedName: ok ? item.name : nameFor(run.s.turf, pickedId, feature) });
    if (ok) {
      run.score++; run.streak++; run.best = Math.max(run.best, run.streak);
      if (STREAK_MSG[run.streak]) { setTimeout(() => { toast(STREAK_MSG[run.streak] || ''); Sound.streak(); }, 250); const st = $('.hud__stat--streak'); st.classList.remove('is-hot'); void st.offsetWidth; st.classList.add('is-hot'); }
    } else {
      run.streak = 0; $('.hud__stat--streak').classList.remove('is-hot');
    }
    updateHUD();
  }

  /* ---- reveal card ---- */
  const DECK_ICON = '<svg viewBox="0 0 48 28" aria-hidden="true"><rect x="2" y="4" width="44" height="10" rx="5" fill="#c8ff1a" stroke="#000" stroke-width="2"/><circle cx="12" cy="21" r="4" fill="#f3eee3" stroke="#000" stroke-width="2"/><circle cx="36" cy="21" r="4" fill="#f3eee3" stroke="#000" stroke-width="2"/></svg>';
  function openReveal(ok, pickedId, feature) {
    if (!run) return;
    const s = run.s; const item = cur(); const turf = s.turf;
    const sk = s.style === 'skate' ? skateOf(turf, item) : null;
    const last = run.i >= run.items.length - 1;
    const pickedName = ok ? '' : nameFor(turf, pickedId, feature);
    const isWorld = turf === 'world';
    const popSrc = isWorld
      ? `<a href="https://data.worldbank.org/indicator/SP.POP.TOTL?locations=${item.iso.toUpperCase()}" target="_blank" rel="noopener noreferrer">World Bank, ${item.popYear} estimate</a>`
      : `<a href="${GEO.popUS.url}" target="_blank" rel="noopener noreferrer">U.S. Census Bureau, July 1, ${item.popYear} estimate</a>`;
    const streakNote = ok && run.streak >= 2 ? `Streak: ${run.streak} in a row` : ok ? 'Nice spot!' : '';

    let skateHTML = '';
    if (sk) {
      const facts = sk.facts.map((f) => `<li><p>${esc(f.t)}</p>${srcHTML(f.src)}</li>`).join('');
      const legends = sk.skaters.length
        ? `<ol>${sk.skaters.map((p) => `<li><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(p.w)}" target="_blank" rel="noopener noreferrer">${esc(p.n)}</a><span>${esc(p.d)}</span></li>`).join('')}</ol>`
        : `<p class="legends__none">We haven't verified a pro skater from here yet. Know one? Look it up and fact-check it!</p>`;
      skateHTML = `<section class="skate-box" aria-label="Skate scene"><h3>${DECK_ICON} Skate scene</h3><ul>${facts}</ul><div class="legends"><h4>Local legends</h4>${legends}</div></section>`;
    }

    $('#reveal-card').innerHTML = `
      <div class="reveal__band ${ok ? 'good' : 'bad'}">
        <p class="reveal__verdict">${ok ? 'Landed it! +1' : 'Bailed!'}</p>
        <p class="reveal__sub">${ok ? esc(streakNote) : 'You picked ' + esc(pickedName) + '<br>No point this round'}</p>
      </div>
      <div class="reveal__body">
        <div class="reveal__top">
          <div class="polaroid"><img src="${flagSrc(turf, item)}" alt="Flag of ${esc(item.name)}"></div>
          <div>
            <h2 class="reveal__name" id="reveal-name">${esc(item.name)}</h2>
            <dl class="reveal__meta">
              <div><dt>Capital</dt><dd>${esc(item.capital)}</dd></div>
              <div><dt>Population</dt><dd><span class="pop-big">${nf.format(item.pop)}</span><br><span class="src">${popSrc}</span></dd></div>
              ${isWorld ? `<div><dt>Region</dt><dd>${esc(item.sub)}</dd></div>` : ''}
            </dl>
          </div>
        </div>
        <div class="fact-box"><span class="fact-box__label">Fun fact</span><p>${esc(item.fact)}</p>${srcHTML(item.src, item)}</div>
        ${skateHTML}
      </div>
      <div class="reveal__foot">
        <span class="reveal__hint">Press Enter to keep rolling &middot; the clock is paused while you read</span>
        <button class="btn btn--red" id="btn-next" type="button">${last ? 'See results' : 'Next round'} &rarr;</button>
      </div>`;
    openModal('reveal');
    $('#reveal-card').scrollTop = 0;
    $('#btn-next').addEventListener('click', advance);
    setTimeout(() => { const b = $('#btn-next'); if (b) b.focus({ preventScroll: true }); }, 50);
  }
  function advance() {
    if ($('#reveal').hidden) return;
    Sound.click();
    closeModal('reveal');
    run.i++;
    if (run.i >= run.items.length) finish(); else nextRound();
  }

  /* ---- end of run ---- */
  function rankText(pct) {
    if (pct === 100) return 'Flawless run — legend status!';
    if (pct >= 80) return 'Pro shredder!';
    if (pct >= 60) return 'Solid ripper!';
    if (pct >= 40) return 'Getting gnarly!';
    if (pct >= 20) return 'Grom in training!';
    return 'Every pro started here — run it back!';
  }
  async function finish() {
    stopTimer();
    const r = run; const total = r.items.length; const pct = Math.round((r.score / total) * 100);
    $('#end-board-name').textContent = boardName(r.s);
    $('#end-score').textContent = r.score; $('#end-total').textContent = total;
    $('#end-rank').textContent = rankText(pct);
    $('#end-acc').textContent = pct + '%';
    $('#end-time').textContent = fmtTime(r.elapsed);
    $('#end-streak').textContent = r.best;
    const misses = r.results.filter((x) => !x.ok);
    $('#end-review').innerHTML = misses.length
      ? `<h3>Practice these next time</h3><div class="chips">${misses.map((m) => `<span class="chip">${esc(m.item.name)}</span>`).join('')}</div>`
      : '';
    $('#initials').hidden = true;
    $('#end-board').innerHTML = '<div class="board__empty">Checking the leaderboard…</div>';
    show('end');
    const { list, offline } = await Boards.list(r.key);
    if (run !== r || screen !== 'end') return; // player already moved on
    const q = qualifies(list, r.score, Math.round(r.elapsed));
    $('#initials').hidden = !q;
    $('#end-board').innerHTML = (q ? '' : boardTable(list, null, 'Top 10 · ' + boardName(r.s))) + (offline ? OFFLINE_NOTE : '');
    if (q) { Sound.fanfare(); initials.reset(); } else if (pct >= 60) Sound.streak();
  }

  /* ---- arcade initials ---- */
  // A real (invisible) text box sits behind the three letter slots, so typing works with
  // physical keyboards AND phone/tablet on-screen keyboards. The arrows cycle letters arcade-style.
  const initials = (() => {
    const ALPHA = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let chars = ['', '', '']; let pos = 0;
    const box = $('#initials-slots');
    const input = $('#initials-input');
    function render() {
      box.innerHTML = chars.map((c, i) => `<div class="slot${i === pos ? ' is-current' : ''}" data-i="${i}">
        <button class="slot__arrow" type="button" data-dir="1" tabindex="-1" aria-label="Next letter">&#9650;</button>
        <div class="slot__char${c ? ' has-char' : ''}" aria-hidden="true">${c || '_'}</div>
        <button class="slot__arrow" type="button" data-dir="-1" tabindex="-1" aria-label="Previous letter">&#9660;</button></div>`).join('');
    }
    function syncInput() { input.value = chars.join(''); }
    function cycle(i, dir) {
      for (let j = 0; j < i; j++) if (!chars[j]) chars[j] = 'A'; // no gaps before the slot being changed
      const idx = ALPHA.indexOf(chars[i] || ' ');
      chars[i] = ALPHA[(idx + dir + ALPHA.length) % ALPHA.length].trim();
      pos = i; Sound.click(); $('#initials-msg').textContent = ''; syncInput(); render();
    }
    box.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot'); if (!slot) return;
      const a = e.target.closest('.slot__arrow');
      if (a) { e.preventDefault(); cycle(+slot.dataset.i, +a.dataset.dir); }
    });
    input.addEventListener('input', () => {
      const v = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      if (v !== input.value) input.value = v;
      if (v.length > chars.join('').length) Sound.click();
      chars = [v[0] || '', v[1] || '', v[2] || ''];
      pos = Math.min(v.length, 2);
      $('#initials-msg').textContent = '';
      render();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cycle(pos, 1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); cycle(pos, -1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); pos = Math.max(0, pos - 1); render(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); pos = Math.min(2, pos + 1); render(); }
    });
    let saving = false;
    async function submit() {
      if (saving) return;
      const val = chars.join('');
      const msg = $('#initials-msg');
      if (!val) { msg.textContent = 'Type at least one letter!'; return; }
      if (!/^[A-Z]{1,3}$/.test(val)) { msg.textContent = 'Letters only, please.'; return; }
      if (BLOCKED.has(val)) { msg.textContent = 'Not on this board, dude — pick other initials.'; Sound.bad(); return; }
      const r = run;
      saving = true; $('#btn-initials').disabled = true; msg.textContent = 'Saving…';
      const res = await Boards.add(r.key, { i: val, s: r.score, n: r.items.length, t: Math.round(r.elapsed) });
      saving = false; $('#btn-initials').disabled = false;
      if (res.error) { msg.textContent = res.error; Sound.bad(); return; }
      msg.textContent = '';
      $('#initials').hidden = true;
      const made = res.list.some((e) => e.id === res.id);
      $('#end-board').innerHTML = boardTable(res.list, res.id, 'Top 10 · ' + boardName(r.s)) + (res.offline ? OFFLINE_NOTE : '');
      toast(made ? 'Saved! You\'re on the board' : 'Saved — but someone just beat it!');
      Sound.streak();
    }
    $('#btn-initials').addEventListener('click', submit);
    // If a key is pressed while the box isn't focused, send it there.
    function key(e) {
      if ($('#initials').hidden || screen !== 'end' || document.activeElement === input) return false;
      if (/^[a-z]$/i.test(e.key) || e.key === 'Backspace' || e.key.startsWith('Arrow') || e.key === 'Enter') { input.focus(); }
      return false;
    }
    return {
      reset() { chars = ['', '', '']; pos = 0; input.value = ''; $('#initials-msg').textContent = ''; render(); setTimeout(() => input.focus({ preventScroll: true }), 80); },
      key
    };
  })();

  /* ---------------- info modal content ---------------- */
  function openInfo(kind) {
    const skW = poolFor({ style: 'skate', turf: 'world' }).length; const skU = poolFor({ style: 'skate', turf: 'usa' }).length;
    const body = kind === 'help' ? `
      <h2 id="info-title">How to play</h2>
      <h3>Spot Hunt</h3>
      <p>We name a country (or state). Click it on the map. Get it right and you earn <strong>1 point</strong>. Get it wrong and that round's point is gone — we'll flash the right spot green so you learn where it is. Scroll or pinch to zoom and drag to move around. Tiny island countries have a dot you can click.</p>
      <h3>Flag Flip</h3>
      <p>You get a flag, the population, and a fun fact (with the name blacked out). Pick the right answer from 5 choices — each shows the place's name and shape. Keyboard: press <strong>1–5</strong>.</p>
      <h3>Skate Mode</h3>
      <p>Same games, plus skate history and the local legends for each place. Skate Mode only asks about places with real, documented skate history: ${skW} countries and ${skU} states.</p>
      <h3>Scoring &amp; leaderboards</h3>
      <ul>
        <li>Every run is ${ROUNDS} rounds. Most points wins; if it's a tie, the faster time wins.</li>
        <li>The clock <strong>pauses</strong> while you read the fact cards — so take your time and read them!</li>
        <li>There are 8 leaderboards (Standard or Skate × Spot Hunt or Flag Flip × World or USA). Make the top 10 and enter up to 3 initials, arcade style.</li>
        <li>${ONLINE ? 'Leaderboards are shared online — everyone who plays sees the same top scores.' : 'Leaderboards are saved in this web browser on this device.'}</li>
      </ul>` : `
      <h2 id="info-title">Facts, sources &amp; credits</h2>
      <p>Every fact in this game was checked against the source linked under it — mostly <a href="https://www.britannica.com" target="_blank" rel="noopener">Encyclopaedia Britannica</a> and <a href="https://en.wikipedia.org" target="_blank" rel="noopener">Wikipedia</a> — in November 2026. Facts that couldn't be confirmed were left out.</p>
      <h3>Population</h3>
      <ul>
        <li>Countries: <a href="${GEO.popWorld.url}" target="_blank" rel="noopener">World Bank, “Population, total”</a> (${countries[0].popYear} estimates).</li>
        <li>States: <a href="${GEO.popUS.url}" target="_blank" rel="noopener">U.S. Census Bureau Vintage ${states[0].popYear} estimates</a> (July 1, ${states[0].popYear}).</li>
      </ul>
      <h3>Maps &amp; flags</h3>
      <ul>
        <li>World map: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> 1:50m (public domain), via the world-atlas project. Borders follow Natural Earth; some areas are disputed.</li>
        <li>U.S. map: U.S. Census Bureau cartographic boundaries (public domain), via the us-atlas project.</li>
        <li>Flags: <a href="https://flagpedia.net" target="_blank" rel="noopener">Flagpedia / flagcdn.com</a> (public domain images).</li>
        <li>Quiz countries: the 193 member states of the United Nations. Country codes &amp; regions from <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener">mledoze/countries</a> (Open Database License).</li>
      </ul>
      <h3>Built with</h3>
      <ul>
        <li><a href="https://d3js.org" target="_blank" rel="noopener">D3.js</a> and <a href="https://github.com/topojson/topojson-client" target="_blank" rel="noopener">TopoJSON</a> (ISC licenses).</li>
        <li>Fonts: Anton &amp; Barlow (SIL Open Font License), Permanent Marker (Apache 2.0).</li>
      </ul>
      <p class="src">Shred the Globe is an independent homeschool project and isn't affiliated with any skate brand, magazine, or athlete. Data built ${esc(GEO.built)}.</p>`;
    $('#info-body').innerHTML = body;
    openModal('info');
    $('#info .modal__x').focus();
  }
  $('#info').addEventListener('click', (e) => { if (e.target.id === 'info' || e.target.closest('[data-close]')) closeModal('info'); });

  /* ---------------- wiring ---------------- */
  $('#btn-play').addEventListener('click', () => { Sound.click(); renderSetup(); show('setup'); });
  $('#btn-start').addEventListener('click', () => { Sound.pick(); startRun(); });
  $('#btn-boards').addEventListener('click', () => { Sound.click(); openBoards(); });
  $('#btn-boards-top').addEventListener('click', () => { Sound.click(); openBoards(); });
  $('#btn-help-top').addEventListener('click', () => { Sound.click(); openInfo('help'); });
  $('#btn-credits').addEventListener('click', () => { Sound.click(); openInfo('credits'); });
  $$('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    Sound.click();
    const to = b.dataset.nav === 'back' ? (prevScreen === 'boards' || prevScreen === 'game' ? 'title' : prevScreen) : b.dataset.nav;
    show(to);
  }));
  const soundBtn = $('#btn-sound');
  soundBtn.setAttribute('aria-pressed', String(Sound.on));
  soundBtn.addEventListener('click', () => { soundBtn.setAttribute('aria-pressed', String(Sound.toggle())); });

  $('#btn-quit').addEventListener('click', () => { $('#quit').classList.add('is-confirming'); });
  $('#btn-quit-no').addEventListener('click', () => { $('#quit').classList.remove('is-confirming'); });
  $('#btn-quit-yes').addEventListener('click', () => { stopTimer(); run = null; closeModal('reveal'); $('#quit').classList.remove('is-confirming'); show('title'); });
  $('#btn-again').addEventListener('click', () => { Sound.pick(); Object.assign(settings, run.s); startRun(); });
  $('#btn-menu').addEventListener('click', () => { Sound.click(); run = null; show('title'); });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!$('#confirm').hidden) { if (e.key === 'Escape') $('#confirm-no').click(); return; }
    if (!$('#info').hidden) { if (e.key === 'Escape') closeModal('info'); return; }
    if (!$('#reveal').hidden) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      return;
    }
    if (screen === 'end' && initials.key(e)) { e.preventDefault(); return; }
    if (screen === 'game' && run && run.s.game === 'flag' && !run.answered && /^[1-5]$/.test(e.key)) {
      const b = $$('.opt')[+e.key - 1]; if (b) { e.preventDefault(); pickOption(b); }
    }
    if (screen === 'game' && e.key === 'Escape') $('#quit').classList.toggle('is-confirming');
  });
  window.addEventListener('resize', () => { if (screen === 'title') Globe.redraw(); });

  // Go!
  applyStyleClass();
  renderSetup();
  show('title');
})();
