/* Squirrelock Holmes — character portraits. One squirrel-portrait maker with a different
   look for each character (fur, species marks, hat, clothes, extras) and four expressions:
   neutral, suspicious, shocked, smug. Drawn in a 200 x 200 box with heavy ink outlines,
   a hard cel shadow on the left and a warm rim light on the right. */
'use strict';
(function (SQH) {
  const INK = '#170d22';
  let pid = 0;
  // Mirrors an all-absolute path left-to-right across the middle (x -> 200 - x).
  const mir = (d) => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${200 - +x} ${y}`);
  const both = (d) => d + ' ' + mir(d);
  const n2 = (v) => Math.round(v * 10) / 10;

  // fur, light (muzzle/belly), shade (cel shadow), coat, coat2, accent, hat, neck, extras, flags
  const LOOKS = {
    holmes: { fur: '#c65a2e', light: '#f6d2a6', shade: '#8a3519', coat: '#5d4a33', coat2: '#3f3122', accent: '#7a2430', hat: 'deerstalker', neck: 'cravat', tufts: true, rim: '#ffb547' },
    watson: { fur: '#8e898d', light: '#ece5da', shade: '#5c575c', coat: '#4b5a3a', coat2: '#323d27', accent: '#b0302f', hat: 'bowler', neck: 'bowtie', extras: ['mustache'], rim: '#ffb547' },
    nutson: { fur: '#b37a4a', light: '#f5e0c6', shade: '#7b4f2f', coat: '#6b4b8a', coat2: '#4b3366', accent: '#8b5cf6', hat: 'bonnet', neck: 'shawl', extras: ['spectacles'], rim: '#ffb547' },
    gnawriarty: { fur: '#2c2633', light: '#7a7383', shade: '#141017', coat: '#1c1624', coat2: '#0e0b13', accent: '#8b5cf6', hat: 'top', neck: 'cravat', extras: ['monocle'], tufts: true, rim: '#a678ff', brow: '#0b0810' },
    bushwick: { fur: '#9c99a8', light: '#f1ebf2', shade: '#6a6778', coat: '#5c2a6e', coat2: '#3e1a4b', accent: '#2fb0a0', hat: 'plumed', neck: 'lace', extras: ['earrings'], lips: '#d23a6a', rim: '#ffb547' },
    pip: { fur: '#d4733b', light: '#f7d8b2', shade: '#96481f', coat: '#a32a2a', coat2: '#6e1a1a', accent: '#e8c25a', hat: 'porter', neck: 'buttons', tufts: true, rim: '#ffb547' },
    thistlewick: { fur: '#a8682f', light: '#f0d3aa', shade: '#70421b', coat: '#8a7a4a', coat2: '#625632', accent: '#c0302a', hat: 'pith', neck: 'medals', extras: ['monocle', 'walrus'], rim: '#ffb547' },
    cashew: { fur: '#8c5c3a', light: '#efd6b6', shade: '#5c3a22', coat: '#2d2a3a', coat2: '#1b1924', accent: '#8a2a3a', neck: 'waistcoat', extras: ['pince', 'chops'], rim: '#ffb547', bald: true },
    sorrel: { fur: '#b4532f', light: '#f6d4b6', shade: '#7a3318', coat: '#e8e2d2', coat2: '#bdb5a2', accent: '#2f6b4e', hat: 'eyeshade', neck: 'collar', extras: ['bun', 'pencil'], tufts: true, rim: '#ffb547' },
    burrows: { fur: '#b07a48', light: '#f2dcbc', shade: '#75502c', coat: '#23305a', coat2: '#151d3a', accent: '#e8c25a', hat: 'helmet', neck: 'buttons', stripes: true, rim: '#ffb547' },
    pinecroft: { fur: '#717786', light: '#e6e6ea', shade: '#4b505c', coat: '#5a4030', coat2: '#3a281c', accent: '#d9a441', neck: 'apron', extras: ['loupe'], rim: '#ffb547' },
    tock: { fur: '#a8754a', light: '#f0d8b8', shade: '#6e4a2c', coat: '#5a3d26', coat2: '#3c2818', accent: '#d9a441', hat: 'flatcap', neck: 'apron', extras: ['eyepiece'], stripes: true, brow: '#f4f1ea', bigBrows: true, rim: '#ffb547' },
    wren: { fur: '#b9b6be', light: '#f4f1f6', shade: '#86838e', coat: '#3a5a6a', coat2: '#264050', accent: '#e0457a', neck: 'scarf', extras: ['goggles'], bigEyes: true, flatTail: true, rim: '#a678ff' },
    rootley: { fur: '#8f8a84', light: '#ece6dc', shade: '#5e5a55', coat: '#8a1e2a', coat2: '#5e121b', accent: '#e8c25a', hat: 'tricorn', neck: 'chain', extras: ['chops'], rim: '#ffb547' },
    plume: { fur: '#c4834a', light: '#f7dcc0', shade: '#87552a', coat: '#24204a', coat2: '#151230', accent: '#ffd23f', hat: 'turban', neck: 'stars', extras: ['earrings'], lips: '#8a1d4a', rim: '#a678ff' },
  };
  // eye color, eyelashes and a little blush for each character
  const IRIS = { holmes: '#2f7a4a', watson: '#6b4220', nutson: '#3b6bd0', gnawriarty: '#7b2fd0', bushwick: '#1f8a80', pip: '#7a4a22', thistlewick: '#3b4a8a', cashew: '#5a3a1c', sorrel: '#2f6b4e', burrows: '#6b4a22', pinecroft: '#4a5a7a', tock: '#6b5a44', wren: '#3b6bd0', rootley: '#5a4a3a', plume: '#7b2fd0' };
  ['bushwick', 'sorrel', 'plume', 'nutson', 'wren'].forEach((k) => { LOOKS[k].lashes = true; });
  ['bushwick', 'sorrel', 'plume', 'nutson', 'wren', 'pip'].forEach((k) => { LOOKS[k].blush = true; });
  Object.keys(IRIS).forEach((k) => { LOOKS[k].iris = IRIS[k]; });
  SQH.Art.LOOKS = LOOKS;

  const HEAD = 'M100 44 C138 44 156 70 156 100 C156 134 132 154 100 154 C68 154 44 134 44 100 C44 70 62 44 100 44 Z';
  const EAR = 'M60 70 C48 46 52 26 64 20 C78 30 84 50 80 64 Z';
  const EAR_IN = 'M64 62 C57 48 58 36 65 30 C72 38 75 50 73 60 Z';
  const TUFT = 'M64 22 L57 4 L67 14 L70 0 L75 18 Z';
  const CHEEK = 'M50 108 L33 117 L46 122 L37 133 L57 128 Z';

  function hat(L) {
    const c = L.coat, a = L.accent;
    switch (L.hat) {
      case 'deerstalker': return `<path class="o" d="M50 66 C40 64 28 74 32 82 C46 78 60 76 72 72 Z M150 66 C160 64 172 74 168 82 C154 78 140 76 128 72 Z" fill="#7d6a42"/>
        <path class="o" d="M52 72 C48 24 152 24 148 72 C120 64 80 64 52 72 Z" fill="#8f7a4c"/>
        <path d="M66 40 L80 68 M86 32 L96 66 M110 32 L106 66 M130 38 L122 68 M58 56 L144 52 M62 44 L140 40" stroke="#5e4e2c" stroke-width="3" opacity=".8"/>
        <path class="o3" d="M90 30 Q100 18 110 30 Q100 36 90 30 Z" fill="#6e5c36"/>`;
      case 'bowler': return `<ellipse class="o" cx="100" cy="64" rx="54" ry="10" fill="#241c18"/><path class="o" d="M62 64 C60 24 140 24 138 64 Z" fill="#2e2420"/><path d="M63 56 H137" stroke="#4a3c34" stroke-width="7"/><path d="M80 34 C88 30 96 30 104 32" stroke="#5a4a40" stroke-width="4" fill="none"/>`;
      case 'top': return `<ellipse class="o" cx="100" cy="62" rx="56" ry="10" fill="#120e16"/><path class="o" d="M70 62 L72 0 H128 L130 62 Z" fill="#1a1520"/><rect x="71" y="44" width="58" height="10" fill="${a}"/><path d="M80 6 V44" stroke="#3a3244" stroke-width="5"/>`;
      case 'bonnet': return `<path class="o" d="M40 112 C24 30 176 30 160 112 C154 88 132 72 100 72 C68 72 46 88 40 112 Z" fill="#f4eee4"/>
        <path d="M52 70 C70 46 130 46 148 70" stroke="#d8cfc0" stroke-width="5" fill="none"/><path d="M44 112 q6 -8 12 0 M144 112 q6 -8 12 0" stroke="#d8cfc0" stroke-width="4" fill="none"/>
        <path class="o3" d="M58 140 L78 150 L60 160 Z M142 140 L122 150 L140 160 Z" fill="${a}"/>`;
      case 'plumed': return `<path class="o" d="M120 46 C146 2 192 6 188 30 C172 20 152 26 132 50 Z" fill="${a}"/><path d="M130 44 C150 20 170 16 184 24" stroke="#1f7a70" stroke-width="3" fill="none"/>
        <ellipse class="o" cx="100" cy="58" rx="70" ry="14" fill="#3e1a4b" transform="rotate(-8 100 58)"/><path class="o" d="M70 58 C68 28 132 24 132 52 Z" fill="#5c2a6e"/><path d="M70 50 C90 44 112 42 132 46" stroke="${a}" stroke-width="6" fill="none"/>`;
      case 'porter': return `<path class="o" d="M68 60 L72 30 H128 L132 60 Z" fill="${c}"/><rect class="o3" x="70" y="44" width="60" height="9" fill="${a}"/><path class="o" d="M68 60 Q100 70 132 60 L136 66 Q100 78 64 66 Z" fill="#1b0f0a"/>`;
      case 'pith': return `<ellipse class="o" cx="100" cy="70" rx="66" ry="12" fill="#c9b27a"/><path class="o" d="M46 70 C44 16 156 16 154 70 Z" fill="#dcc690"/><path d="M48 60 H152" stroke="#a89060" stroke-width="6"/><circle class="o3" cx="100" cy="22" r="6" fill="#a89060"/>`;
      case 'eyeshade': return `<path d="M52 76 C70 66 130 66 148 76" stroke="${INK}" stroke-width="10" fill="none"/><path d="M52 76 C70 66 130 66 148 76" stroke="#2a4a3a" stroke-width="5" fill="none"/>
        <path class="o3" d="M56 74 Q100 56 144 74 L156 88 Q100 70 44 88 Z" fill="#3fbf7f" opacity=".75"/>`;
      case 'helmet': return `<path class="o" d="M60 72 C54 10 146 10 140 72 Z" fill="#1d2850"/><circle class="o3" cx="100" cy="10" r="7" fill="url(#k-brass)"/><path class="o3" d="M100 32 L106 44 L120 44 L109 52 L113 64 L100 57 L87 64 L91 52 L80 44 L94 44 Z" fill="url(#k-brass)"/><rect class="o3" x="58" y="68" width="84" height="8" rx="4" fill="#111a36"/>`;
      case 'flatcap': return `<path class="o" d="M52 74 C48 38 150 34 152 66 C164 66 170 74 156 80 C124 72 84 72 52 74 Z" fill="#6b5a44"/><path d="M60 60 C90 52 130 52 148 60" stroke="#544634" stroke-width="4" fill="none"/>`;
      case 'turban': return `<path class="o" d="M120 30 C126 -2 150 -6 156 6 C142 6 134 16 128 34 Z" fill="${a}"/><path class="o" d="M48 80 C36 22 164 22 152 80 C130 66 70 66 48 80 Z" fill="#3b2a7a"/>
        <path d="M54 60 C80 40 130 44 150 62 M52 72 C84 56 124 56 150 72" stroke="#5a48a8" stroke-width="5" fill="none"/><circle class="o3" cx="100" cy="46" r="9" fill="#e0457a"/><circle cx="97" cy="43" r="3" fill="#fff"/>`;
      case 'tricorn': return `<path class="o" d="M36 70 Q100 44 164 70 Q140 26 100 20 Q60 26 36 70 Z" fill="#1d1820"/><path d="M40 68 Q100 44 160 68" stroke="${L.accent}" stroke-width="4" fill="none"/><circle class="o3" cx="100" cy="42" r="7" fill="${L.accent}"/>`;
    }
    return '';
  }
  function neck(L) {
    const a = L.accent, c2 = L.coat2;
    switch (L.neck) {
      case 'cravat': return `<path class="o3" d="M86 152 L100 170 L114 152 Z" fill="${a}"/><path class="o3" d="M94 168 L100 190 L106 168 Z" fill="${a}"/><path class="o3" d="M74 150 L92 160 L86 176 Z M126 150 L108 160 L114 176 Z" fill="#f4eee4"/>`;
      case 'bowtie': return `<path class="o3" d="M80 154 L100 164 L80 174 Z M120 154 L100 164 L120 174 Z" fill="${a}"/><circle class="o3" cx="100" cy="164" r="5" fill="${a}"/>`;
      case 'lace': return `<path class="o3" d="M60 156 L68 168 L76 158 L84 172 L92 160 L100 174 L108 160 L116 172 L124 158 L132 168 L140 156 C120 150 80 150 60 156 Z" fill="#f4eef6"/><circle class="o3" cx="100" cy="176" r="5" fill="${a}"/>`;
      case 'buttons': return `<path d="M100 156 V200" stroke="${c2}" stroke-width="4"/>${[166, 182, 198].map((y) => `<circle class="o3" cx="88" cy="${y}" r="4" fill="${a}"/><circle class="o3" cx="112" cy="${y}" r="4" fill="${a}"/>`).join('')}`;
      case 'medals': return `<path d="M100 154 V200" stroke="${c2}" stroke-width="4"/><path d="M60 170 l6 -10 l6 10 Z M76 172 l6 -10 l6 10 Z" fill="${a}" class="o3"/><circle class="o3" cx="66" cy="178" r="6" fill="url(#k-brass)"/><circle class="o3" cx="82" cy="180" r="6" fill="#c9ccd6"/>`;
      case 'waistcoat': return `<path class="o3" d="M78 154 L100 196 L122 154 L132 200 H68 Z" fill="${a}"/><path class="o3" d="M84 150 L100 168 L116 150 Z" fill="#f4eee4"/><path d="M84 184 Q100 192 116 182" stroke="url(#k-brass)" stroke-width="3" fill="none"/><circle cx="100" cy="186" r="3" fill="url(#k-brass)"/>`;
      case 'collar': return `<path class="o3" d="M74 148 C80 168 120 168 126 148 L122 162 C112 172 88 172 78 162 Z" fill="#fff"/><circle class="o3" cx="100" cy="166" r="6" fill="${a}"/>`;
      case 'apron': return `<path class="o3" d="M70 160 H130 L134 200 H66 Z" fill="#7a4e2a"/><path d="M70 160 L60 150 M130 160 L140 150" stroke="#5a3a1c" stroke-width="5"/><circle cx="76" cy="166" r="3" fill="url(#k-brass)"/><circle cx="124" cy="166" r="3" fill="url(#k-brass)"/>`;
      case 'scarf': return `<path class="o3" d="M64 150 C80 164 120 164 136 150 L140 162 C120 178 80 178 60 162 Z" fill="${a}"/><path class="o3" d="M120 164 C140 176 160 186 176 184 C170 194 140 196 114 176 Z" fill="${a}"/>`;
      case 'chain': return `<path d="M64 158 Q100 196 136 158" stroke="url(#k-brass)" stroke-width="7" fill="none"/>${[[70, 166], [84, 178], [100, 184], [116, 178], [130, 166]].map(([x, y]) => `<circle class="o3" cx="${x}" cy="${y}" r="5" fill="url(#k-brass)"/>`).join('')}<circle class="o3" cx="100" cy="194" r="9" fill="url(#k-brass)"/><path d="M40 170 Q60 156 66 160 M160 170 Q140 156 134 160" stroke="#f4eee4" stroke-width="9" fill="none"/>`;
      case 'shawl': return `<path class="o3" d="M36 186 C50 160 80 156 100 170 C120 156 150 160 164 186 L164 200 H36 Z" fill="${a}"/><path d="M60 176 L66 196 M86 170 L88 196 M114 170 L112 196 M140 176 L134 196" stroke="${c2}" stroke-width="3"/>`;
      case 'stars': return `<path class="o3" d="M60 154 C80 170 120 170 140 154 L144 166 C120 182 80 182 56 166 Z" fill="#3b2a7a"/>${[[58, 186], [80, 194], [140, 184], [120, 196], [100, 188]].map(([x, y]) => `<path d="M${x} ${y - 5} L${x + 2} ${y - 1} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 1} Z" fill="${a}"/>`).join('')}`;
    }
    return '';
  }
  function extra(L, x) {
    switch (x) {
      case 'mustache': return `<path class="o3" d="M100 120 C88 114 74 118 68 130 C80 126 90 126 100 124 C110 126 120 126 132 130 C126 118 112 114 100 120 Z" fill="#4e4248"/>`;
      case 'walrus': return `<path class="o3" d="M100 118 C84 112 64 118 58 142 C72 132 88 130 100 126 C112 130 128 132 142 142 C136 118 116 112 100 118 Z" fill="#f4f1ea"/>`;
      case 'chops': return `<path class="o3" d="${both('M46 92 C38 118 46 140 64 148 C60 132 58 116 60 98 Z')}" fill="#e9e3d8"/>`;
      case 'monocle': return `<circle cx="120" cy="96" r="16" fill="#cfe2ff" fill-opacity=".18" stroke="url(#k-brass)" stroke-width="4"/><circle cx="120" cy="96" r="18" fill="none" class="o3"/><path d="M134 106 C140 130 136 150 128 168" stroke="url(#k-brass)" stroke-width="2" fill="none"/>`;
      case 'spectacles': return `<circle cx="80" cy="96" r="15" fill="#cfe2ff" fill-opacity=".15" stroke="${INK}" stroke-width="3"/><circle cx="120" cy="96" r="15" fill="#cfe2ff" fill-opacity=".15" stroke="${INK}" stroke-width="3"/><path d="M95 94 Q100 90 105 94" stroke="${INK}" stroke-width="3" fill="none"/>`;
      case 'pince': return `<ellipse cx="80" cy="100" rx="13" ry="10" fill="#cfe2ff" fill-opacity=".15" stroke="url(#k-brass)" stroke-width="3"/><ellipse cx="120" cy="100" rx="13" ry="10" fill="#cfe2ff" fill-opacity=".15" stroke="url(#k-brass)" stroke-width="3"/><path d="M93 100 H107 M133 102 C150 116 150 140 140 156" stroke="url(#k-brass)" stroke-width="2" fill="none"/>`;
      case 'goggles': return `<path d="M50 66 C70 58 130 58 150 66" stroke="#5a3320" stroke-width="8" fill="none"/><circle class="o3" cx="80" cy="64" r="15" fill="url(#k-brass)"/><circle class="o3" cx="120" cy="64" r="15" fill="url(#k-brass)"/><circle cx="80" cy="64" r="9" fill="#7ad0e8"/><circle cx="120" cy="64" r="9" fill="#7ad0e8"/><path d="M76 60 l4 -4 M116 60 l4 -4" stroke="#fff" stroke-width="3"/>`;
      case 'loupe': return `<path d="M60 66 C76 60 124 60 140 66" stroke="#3a281c" stroke-width="6" fill="none"/><rect class="o3" x="108" y="50" width="22" height="22" rx="6" fill="url(#k-brass)"/><circle cx="119" cy="61" r="7" fill="#7ad0e8"/>`;
      case 'eyepiece': return `<circle cx="120" cy="96" r="17" fill="#7ad0e8" fill-opacity=".25" stroke="url(#k-brass)" stroke-width="6"/><circle cx="120" cy="96" r="20" fill="none" class="o3"/><path d="M138 90 C150 80 156 72 158 60" stroke="#3a281c" stroke-width="4" fill="none"/>`;
      case 'earrings': return `<circle class="o3" cx="62" cy="72" r="5" fill="#fff8f0"/><circle class="o3" cx="138" cy="72" r="5" fill="#fff8f0"/>`;
      case 'bun': return `<circle class="o" cx="100" cy="42" r="16" fill="${L.fur}"/><path d="M90 36 Q100 30 110 38" stroke="${L.shade}" stroke-width="3" fill="none"/>`;
      case 'pencil': return `<path d="M132 58 L160 30" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M132 58 L160 30" stroke="#f2c14a" stroke-width="5"/><path d="M128 62 L134 56" stroke="#3a2a20" stroke-width="5"/>`;
    }
    return '';
  }
  function eyes(L, e) {
    const big = !!L.bigEyes, rx = big ? 14 : 11, ry = big ? 16 : 13, fur = L.fur;
    let s = '';
    [[80, -1], [120, 1]].forEach(([cx, side]) => {
      const cy = 96;
      const iris = L.iris || '#5a3a1c';
      const lash = L.lashes ? `<path d="M${cx + side * (rx - 1)} ${cy - ry + 5} l${side * 6} -6 M${cx + side * (rx + 1)} ${cy - ry + 10} l${side * 7} -3" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` : '';
      if (e === 'shocked') {
        s += `<ellipse class="o3" cx="${cx}" cy="${cy}" rx="${rx + 2}" ry="${ry + 3}" fill="#fff"/><circle cx="${cx}" cy="${cy + 1}" r="4.6" fill="${iris}"/><circle cx="${cx}" cy="${cy + 1}" r="2.4" fill="${INK}"/><circle cx="${cx - 1.5}" cy="${cy - 1}" r="1.2" fill="#fff"/>${lash}`;
        return;
      }
      const px = e === 'suspicious' ? cx + 5 : cx + 1, py = e === 'smug' ? cy + 4 : cy + 1, pr = big ? 8 : 6.5;
      s += `<ellipse class="o3" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/><path d="M${cx - rx + 2} ${cy + 3} Q${cx} ${cy + ry + 2} ${cx + rx - 2} ${cy + 3}" stroke="#d8d0e8" stroke-width="2" fill="none"/>
        <circle cx="${px}" cy="${py}" r="${pr}" fill="${iris}"/><circle cx="${px}" cy="${py + 1}" r="${n2(pr * 0.55)}" fill="${INK}"/>
        <circle cx="${px - 2.2}" cy="${py - 3}" r="2.3" fill="#fff"/><circle cx="${px + 2.4}" cy="${py + 2.6}" r="1" fill="#fff" opacity=".85"/>${lash}`;
      if (e === 'smug') {
        s += `<path d="M${cx - rx - 3} ${cy + 1} Q${cx} ${cy - ry - 8} ${cx + rx + 3} ${cy + 1} L${cx + rx + 3} ${cy - ry - 6} L${cx - rx - 3} ${cy - ry - 6} Z" fill="${fur}"/><path d="M${cx - rx - 2} ${cy + 1} Q${cx} ${cy - 6} ${cx + rx + 2} ${cy + 1}" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
      } else if (e === 'suspicious') {
        const hiIn = side < 0 ? cy - 2 : cy - 9, hiOut = side < 0 ? cy - 9 : cy - 2;
        const xIn = side < 0 ? cx + rx + 3 : cx - rx - 3, xOut = side < 0 ? cx - rx - 3 : cx + rx + 3;
        s += `<path d="M${xOut} ${hiOut} L${xIn} ${hiIn} L${xIn} ${cy - ry - 6} L${xOut} ${cy - ry - 6} Z" fill="${fur}"/><path d="M${xOut} ${hiOut} L${xIn} ${hiIn}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
      }
    });
    return s;
  }
  const BROWS = {
    neutral: 'M66 77 Q80 71 94 76',
    suspicious: ['M66 73 L94 84', 'M106 77 Q120 64 136 71'],
    shocked: 'M66 68 Q80 56 94 66',
    smug: ['M66 80 Q80 76 94 80', 'M106 78 Q120 70 134 74'],
  };
  function brows(L, e) {
    const b = BROWS[e] || BROWS.neutral, col = L.brow || L.shade, w = L.bigBrows ? 10 : 6;
    const d = Array.isArray(b) ? b.join(' ') : both(b);
    return `<path d="${d}" stroke="${INK}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  }
  function mouth(L, e) {
    const lc = L.lips || INK, lw = L.lips ? 4.5 : 3.5;
    const teeth = (y, h) => `<rect class="o3" x="93" y="${y}" width="14" height="${h}" rx="2" fill="#fff8ea"/><path d="M100 ${y} V${y + h}" stroke="${INK}" stroke-width="2"/>`;
    switch (e) {
      case 'shocked': return `<ellipse class="o3" cx="100" cy="134" rx="11" ry="13" fill="#3a1424"/>${teeth(122, 9)}`;
      case 'suspicious': return `${teeth(125, 8)}<path d="M100 118 V124 M86 128 Q96 124 112 126" stroke="${lc}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
      case 'smug': return `${teeth(125, 10)}<path d="M100 118 V124 M84 122 Q94 132 100 124 Q110 134 120 118" stroke="${lc}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
      default: return `${teeth(125, 10)}<path d="M100 118 V124 M86 125 Q93 131 100 124 Q107 131 114 125" stroke="${lc}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
    }
  }

  // Inner SVG for one portrait (viewBox 0 0 200 200).
  SQH.Art.portrait = function (who, face) {
    const L = LOOKS[who] || LOOKS.watson;
    const e = ['neutral', 'suspicious', 'shocked', 'smug'].includes(face) ? face : 'neutral';
    const id = 'pc' + (++pid);
    const fullHat = ['bonnet', 'helmet', 'pith', 'turban', 'top', 'tricorn', 'plumed'].includes(L.hat);
    const tail = L.flatTail
      ? 'M136 196 C190 190 204 130 186 90 C178 72 160 70 156 84 C152 100 172 110 170 128 C168 150 150 176 124 184 Z'
      : 'M138 198 C196 188 208 116 182 72 C168 48 136 44 134 70 C132 90 160 92 166 112 C174 140 150 172 126 182 Z';
    let s = `<defs><clipPath id="${id}"><path d="${HEAD}"/></clipPath><clipPath id="${id}b"><path d="M22 200 C24 164 58 148 100 148 C142 148 176 164 178 200 Z"/></clipPath></defs>
      <g class="ptail"><path class="o" d="${tail}" fill="${L.fur}"/><path d="M168 92 C180 112 178 140 160 166" stroke="${L.light}" stroke-width="5" fill="none" opacity=".55"/>
        <path d="M150 70 l8 -6 M176 84 l8 -2 M186 112 l8 2 M180 146 l7 5 M162 172 l5 7" stroke="${L.shade}" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>
      <path class="o" d="M22 200 C24 164 58 148 100 148 C142 148 176 164 178 200 Z" fill="${L.coat}"/>
      <path clip-path="url(#${id}b)" d="M0 140 H84 C74 160 70 180 74 200 H0 Z" fill="${L.coat2}"/>
      <path d="M48 200 C50 186 56 174 66 166 M62 200 C62 190 66 182 72 176" stroke="${L.coat2}" stroke-width="3" fill="none" opacity=".8"/>
      <path d="M134 158 C152 164 164 176 170 196" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${neck(L)}`;
    if (!fullHat) s += `<path class="o" d="${both(EAR)}" fill="${L.fur}"/><path d="${both(EAR_IN)}" fill="#e8a39c"/>${L.tufts ? `<path class="o3" d="${both(TUFT)}" fill="${L.fur}"/>` : ''}`;
    s += `<path class="o" d="${both(CHEEK)}" fill="${L.fur}"/>
      <path class="o" d="${HEAD}" fill="${L.fur}"/>
      <ellipse cx="80" cy="96" rx="${L.bigEyes ? 19 : 16}" ry="${L.bigEyes ? 20 : 17}" fill="${L.light}" opacity=".75"/><ellipse cx="120" cy="96" rx="${L.bigEyes ? 19 : 16}" ry="${L.bigEyes ? 20 : 17}" fill="${L.light}" opacity=".75"/>
      <ellipse cx="100" cy="126" rx="32" ry="24" fill="${L.light}"/>`;
    if (L.stripes) s += `<path d="M100 46 L94 82 L106 82 Z" fill="${L.shade}"/><path d="${both('M56 86 Q76 78 94 86')}" stroke="${L.shade}" stroke-width="5" fill="none"/><path d="${both('M58 112 Q74 116 88 110')}" stroke="${L.shade}" stroke-width="4" fill="none"/>`;
    if (L.bald) s += `<ellipse cx="100" cy="58" rx="26" ry="12" fill="${L.light}" opacity=".5"/>`;
    s += `<path clip-path="url(#${id})" d="M30 36 H84 C64 74 60 118 92 160 H30 Z" fill="${L.shade}" opacity=".72"/>
      <ellipse cx="114" cy="62" rx="16" ry="7" fill="#fff" opacity=".13" transform="rotate(12 114 62)"/>
      <path d="${both('M47 108 l-7 4 M49 117 l-8 3 M52 126 l-7 4')}" stroke="${L.shade}" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>
      <path d="M84 52 l3 -6 M100 48 l0 -6 M116 52 l-3 -6" stroke="${L.shade}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
      ${L.blush ? `<ellipse cx="64" cy="120" rx="9" ry="5" fill="#ff6f91" opacity=".32"/><ellipse cx="136" cy="120" rx="9" ry="5" fill="#ff6f91" opacity=".32"/>` : ''}
      <path d="M136 56 C154 72 160 100 150 130" stroke="${L.rim}" stroke-width="4" fill="none" opacity=".9" stroke-linecap="round"/>
      ${eyes(L, e)}${brows(L, e)}
      <path class="o3" d="M90 110 Q100 103 110 110 Q106 119 100 119 Q94 119 90 110 Z" fill="#3a1f2a"/><ellipse cx="97" cy="109" rx="3" ry="2" fill="#fff" opacity=".7"/>
      <path d="${both('M70 122 L40 115 M70 128 L42 133')}" stroke="${INK}" stroke-width="2" opacity=".55"/>
      ${mouth(L, e)}`;
    (L.extras || []).forEach((x) => { if (x !== 'bun' && x !== 'pencil') s += extra(L, x); });
    if ((L.extras || []).includes('bun')) s = s.replace(`<path class="o" d="${HEAD}"`, extra(L, 'bun') + `<path class="o" d="${HEAD}"`);
    s += hat(L);
    if ((L.extras || []).includes('pencil')) s += extra(L, 'pencil');
    if (e === 'shocked') s += `<path class="o3" d="M156 58 C162 68 166 74 160 80 C154 84 148 78 152 70 Z" fill="#9fdcff"/>`;
    if (e === 'smug') s += `<path d="M168 42 L171 50 L179 53 L171 56 L168 64 L165 56 L157 53 L165 50 Z" fill="#fff6c2"/>`;
    return s;
  };
  SQH.Art.portraitSvg = (who, face, cls) => `<svg class="${cls || 'portrait'}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${SQH.Art.portrait(who, face)}</svg>`;
})(window.SQH);
