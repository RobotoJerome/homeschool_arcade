/* Squirrelock Holmes — clue props. Each prop is drawn around 0,0 inside a 100 x 100 box.
   The same drawing is used in the room (moved and scaled to its spot) and as the
   notebook thumbnail. A case file names a prop by its key (for example prop: 'hatbox'). */
'use strict';
(function (SQH) {
  const P = SQH.Art.props;
  const INK = '#170d22';
  const paper = '#f4ecd8', paper2 = '#d9cdb0', line = '#5d4b70';
  const lines = (x1, x2, ys) => ys.map((y, i) => `<path d="M${x1} ${y} H${x2 - (i % 2) * 8}" stroke="${line}" stroke-width="4" stroke-linecap="round"/>`).join('');
  // a sheet of paper with a folded corner, a crease and a shine along one edge
  const sheet = (fill, rot) => `<g transform="rotate(${rot || -6})"><path class="o" d="M-28 -34 H20 L30 -24 V34 H-28 Z" fill="${fill || paper}"/>
    <path d="M-28 2 H30" stroke="${paper2}" stroke-width="2" opacity=".9"/><path d="M-24 -30 V30" stroke="#fff" stroke-width="3" opacity=".6"/>
    <path class="o3" d="M20 -34 V-24 H30" fill="${paper2}"/>`;

  // Scene size for each prop (1 = 100 units wide). Anything not listed uses 0.9.
  SQH.Art.propScale = { prints: 1.7, smear: 0.75, dent: 0.6, acorns: 1.1, twine: 0.8, screws: 0.9, drips: 0.8, crumbs: 0.8, fur: 0.55, feather: 0.85, ticket: 0.7, card: 0.75, key: 0.6, keys: 0.8, glass: 0.9, blanket: 1.5, coat: 1.2, sack: 1.1, sign: 1.1, poster: 1.1, satchel: 1.0, apron: 1.0 };

  P.note = sheet() + lines(-18, 18, [-18, -6, 6, 18]) + `<path d="M4 26 c4 -6 8 4 12 -2 s6 -2 8 0" stroke="${INK}" stroke-width="2.5" fill="none"/><circle cx="-16" cy="26" r="3" fill="${line}" opacity=".5"/></g>`;
  P.paper = sheet() + lines(-18, 18, [-20, -9, 2]) + `<path d="M-16 16 L16 22" stroke="#c0302a" stroke-width="6" stroke-linecap="round"/></g>`;
  P['burnt-note'] = `<g transform="rotate(8)"><path class="o" d="M-30 -32 H28 V10 L20 18 L12 8 L2 22 L-8 10 L-18 24 L-30 12 Z" fill="${paper}"/>
    <path d="M-30 12 L-18 24 L-8 10 L2 22 L12 8 L20 18 L28 10 L28 2 L18 10 L10 0 L0 12 L-10 2 L-20 14 L-30 4 Z" fill="#3a2418"/>
    <path d="M-20 14 L-10 2 L0 12 L10 0 L18 10" stroke="#ff8a3a" stroke-width="3" fill="none"/>${lines(-20, 18, [-20, -10, 0])}</g>`;
  P.receipt = `<g transform="rotate(-4)"><path class="o" d="M-20 -38 H20 V30 L14 36 L8 30 L2 36 L-4 30 L-10 36 L-16 30 L-20 34 Z" fill="${paper}"/>${lines(-12, 12, [-26, -16, -6, 4])}
    <path d="M-12 18 H12" stroke="${INK}" stroke-width="5"/></g>`;
  P.calendar = `<path d="M-26 34 H30 V-26" stroke="${paper2}" stroke-width="4" fill="none"/><rect class="o" x="-30" y="-30" width="60" height="62" rx="4" fill="${paper}"/><rect class="o3" x="-30" y="-30" width="60" height="16" rx="4" fill="#c0302a"/>
    <circle class="o3" cx="-14" cy="-32" r="4" fill="url(#k-brass)"/><circle class="o3" cx="14" cy="-32" r="4" fill="url(#k-brass)"/>
    <path d="M-22 -4 H22 M-22 8 H22 M-22 20 H22 M-8 -10 V28 M8 -10 V28" stroke="${paper2}" stroke-width="3"/><circle cx="-15" cy="2" r="6" fill="none" stroke="#c0302a" stroke-width="3"/>
    <path d="M-20 -22 H20" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  P.letter = `<g transform="rotate(-8)"><rect class="o" x="-34" y="-22" width="68" height="46" rx="3" fill="${paper}"/><path class="o3" d="M-34 -22 L0 6 L34 -22" fill="none"/>
    <circle class="o3" cx="0" cy="6" r="9" fill="#b3202a"/></g>`;
  P.envelope = `<g transform="rotate(6)"><rect class="o" x="-34" y="-16" width="68" height="44" rx="3" fill="${paper}"/><path class="o3" d="M-34 -16 L0 -44 L34 -16" fill="${paper2}"/><path class="o3" d="M-34 -16 L0 10 L34 -16" fill="none"/>
    <ellipse cx="0" cy="-22" rx="12" ry="5" fill="#7b4dff" opacity=".7"/></g>`;
  P.order = sheet() + lines(-18, 18, [-20, -9, 2]) + `<path d="M-16 16 c4 -6 8 6 12 0 s6 -4 8 0" stroke="${INK}" stroke-width="3" fill="none"/><circle class="o3" cx="14" cy="22" r="9" fill="#b3202a"/></g>`;
  P.seal = `<path class="o" d="M0 -34 C14 -36 30 -24 32 -8 C36 4 30 22 18 30 C8 36 -10 36 -20 28 L-24 20 L-30 22 L-30 12 L-36 8 C-36 -10 -22 -32 0 -34 Z" fill="#b3202a"/>
    <path d="M-24 20 l3 -5 l-6 -2 l4 -4 M-30 12 l5 -2" stroke="#7d1018" stroke-width="2" fill="none"/>
    <circle cx="0" cy="0" r="18" fill="#a01b24" stroke="#7d1018" stroke-width="4"/><path d="M8 -8 A10 10 0 1 0 8 8" stroke="#ffd27a" stroke-width="5" fill="none"/>
    <path d="M-12 -14 l4 4 M12 -14 l-4 4 M-12 14 l4 -4 M12 14 l-4 -4" stroke="#7d1018" stroke-width="2"/>
    <path d="M-20 -22 C-10 -30 8 -30 18 -22" stroke="#ff8a8a" stroke-width="4" fill="none" opacity=".7"/>
    <circle cx="-14" cy="-20" r="2" fill="#ffd27a"/><circle cx="16" cy="16" r="2" fill="#ffd27a"/><circle cx="20" cy="-12" r="2" fill="#ffd27a"/><circle cx="-4" cy="24" r="1.6" fill="#ffd27a"/>`;
  P.box = `<path class="o" d="M-36 -14 L-24 -30 H36 L24 -14 Z" fill="#c79a5e"/><rect class="o" x="-36" y="-14" width="60" height="44" fill="#b0824a"/><path class="o" d="M24 -14 L36 -30 V14 L24 30 Z" fill="#8a6234"/>
    <rect class="o3" x="-24" y="-2" width="36" height="16" fill="${paper}"/><path d="M-18 6 H6" stroke="${line}" stroke-width="3"/>`;
  P.book = `<g transform="rotate(-8)"><rect class="o" x="-30" y="-36" width="56" height="70" rx="4" fill="#24523e"/><rect x="18" y="-33" width="10" height="64" fill="${paper}" class="o3"/>
    <path d="M20 -28 V26 M23 -28 V26" stroke="${paper2}" stroke-width="1.5"/>
    <rect class="o3" x="-20" y="-22" width="30" height="12" fill="#e0c16a"/><path d="M-16 -16 H6" stroke="#5a3a1c" stroke-width="2"/><path d="M-30 -24 H26 M-30 22 H26" stroke="#e0c16a" stroke-width="3"/>
    <path class="o3" d="M-30 -36 h12 l-12 12 Z M-30 34 h12 l-12 -12 Z" fill="url(#k-brass)"/><path d="M-26 -30 V28" stroke="#fff" stroke-width="3" opacity=".25"/></g>`;
  P.pocketbook = `<g transform="rotate(10)"><rect class="o" x="-24" y="-32" width="48" height="62" rx="5" fill="#6b3a22"/><rect x="-24" y="-6" width="48" height="10" fill="#3e1f10"/><circle class="o3" cx="20" cy="-1" r="5" fill="url(#k-brass)"/></g>`;
  P.knife = `<g transform="rotate(-30)"><path class="o" d="M-6 -44 C4 -30 6 -12 6 0 H-6 Z" fill="#dfe6ee"/><path d="M-4 -30 L4 -24" stroke="#b3202a" stroke-width="4"/><rect class="o" x="-9" y="0" width="18" height="42" rx="7" fill="#6b3a22"/><circle cx="0" cy="8" r="3" fill="url(#k-brass)"/></g>`;
  P.blotter = `<rect class="o" x="-40" y="-26" width="80" height="52" rx="4" fill="#2f6b4e"/><path d="M-40 -26 V26 M40 -26 V26" stroke="#5a3320" stroke-width="10"/>
    <path d="M24 -12 c-6 6 -12 -6 -18 0 s-12 -6 -18 0 M20 2 c-6 6 -12 -6 -18 0 s-10 -6 -16 0 M18 14 h-30" stroke="#13261c" stroke-width="3" fill="none"/>`;
  P.key = `<circle class="o" cx="-18" cy="0" r="14" fill="url(#k-brass)"/><circle cx="-18" cy="0" r="5" fill="${INK}"/><rect class="o" x="-6" y="-5" width="44" height="10" fill="url(#k-brass)"/><path class="o3" d="M24 5 v10 h6 v-10 M32 5 v7" fill="url(#k-brass)"/>
    <path d="M-26 -8 a10 10 0 0 1 8 -4 M-2 -2 H34" stroke="#fff6d0" stroke-width="2.5" fill="none"/><path d="M40 -14 l3 6 l6 2 l-6 2 l-3 6 l-3 -6 l-6 -2 l6 -2 Z" fill="#fff6d0"/>`;
  P.keys = `<circle cx="0" cy="-26" r="14" fill="none" stroke="#b08a3a" stroke-width="5" class=""/><circle cx="0" cy="-26" r="14" fill="none" class="o3"/>
    <g transform="rotate(-20 0 -14)"><rect class="o3" x="-4" y="-16" width="8" height="40" fill="url(#k-brass)"/><path class="o3" d="M4 14 h8 v6 h-8" fill="url(#k-brass)"/></g>
    <g transform="rotate(25 0 -14)"><rect class="o3" x="-4" y="-16" width="8" height="36" fill="#c9ccd6"/><path class="o3" d="M4 10 h8 v6 h-8" fill="#c9ccd6"/></g>
    <rect class="o3" x="-30" y="-10" width="18" height="24" rx="3" fill="${paper}" transform="rotate(-12)"/>`;
  P.scarf = `<path class="o" d="M-36 -10 C-10 -20 14 -20 36 -10 L30 6 C10 0 -10 0 -30 6 Z" fill="#8a8a96"/><path class="o" d="M14 0 L24 40 L8 40 L2 2 Z" fill="#7a7a86"/>
    <path d="M-28 -6 L-26 4 M-14 -10 L-12 0 M0 -12 V-2 M14 -10 L12 0" stroke="#5e5e6a" stroke-width="3"/>
    <path class="o" d="M-30 -22 C-30 -44 30 -44 30 -22 Z" fill="#3a3340"/><rect class="o" x="-40" y="-26" width="80" height="8" rx="4" fill="#2a2430"/>`;
  P.clay = `<path class="o" d="M-34 20 C-40 0 -24 -22 0 -24 C24 -26 40 -8 36 14 C32 30 -26 34 -34 20 Z" fill="#9aa0a8"/><ellipse cx="2" cy="-2" rx="14" ry="10" fill="#6f757e" class="o3"/><path d="M-22 14 C-10 20 10 20 24 12" stroke="#c9ced6" stroke-width="3" fill="none"/>`;
  P.crumpled = `<path class="o" d="M-30 -10 L-18 -30 L4 -26 L22 -34 L32 -12 L26 8 L34 24 L10 32 L-8 26 L-28 30 L-32 10 Z" fill="${paper}"/>
    <path d="M-18 -30 L-6 -8 L4 -26 M-6 -8 L22 -10 M-6 -8 L-12 14 L10 32 M-12 14 L-32 10 M22 -10 L26 8" stroke="${paper2}" stroke-width="3" fill="none"/>`;
  P.drips = `<path class="o3" d="M-30 -6 c0 -10 12 -10 12 0 c0 8 -12 8 -12 0 Z M-6 -14 c0 -8 10 -8 10 0 v14 c0 6 -10 6 -10 0 Z M18 -4 c0 -10 14 -10 14 0 c0 10 -14 10 -14 0 Z M-18 14 c0 -6 8 -6 8 0 s-8 6 -8 0 Z" fill="#c0302a"/>
    <path d="M-26 -8 l3 -3 M-2 -14 l3 -3 M22 -6 l4 -3" stroke="#ffb0a0" stroke-width="2"/>`;
  P.crumbs = `<path class="o3" d="M-30 0 l10 -8 l8 6 l-6 10 Z M-4 -14 l14 -2 l4 12 l-10 6 l-8 -6 Z M18 6 l12 2 l-4 12 l-10 -2 Z M-16 18 l8 -2 l2 8 l-8 2 Z" fill="#9aa0a8"/>
    <path d="M-4 -14 C2 -6 10 -6 14 -4" stroke="#6f757e" stroke-width="3" fill="none"/>`;
  P.clockface = `<circle class="o" cx="0" cy="0" r="38" fill="#f4ead2"/><circle cx="0" cy="0" r="30" fill="none" stroke="${paper2}" stroke-width="3"/>
    <path d="M0 -30 V-22 M30 0 H22 M0 30 V22 M-30 0 H-22" stroke="${INK}" stroke-width="5"/><path d="M0 0 L-16 -10 M0 0 L0 -26" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="0" r="4" fill="${INK}"/>`;
  P.acorns = [[-22, 8, -20], [0, 0, 10], [20, 10, 30], [-8, 22, 0], [14, -14, -10]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path class="o3" d="M-10 -2 C-10 14 10 14 10 -2 Z" fill="#9a5a24"/><path class="o3" d="M-12 -2 C-12 -12 12 -12 12 -2 Z" fill="#5a3a1c"/><path d="M0 -10 v-6" stroke="${INK}" stroke-width="3"/></g>`).join('');
  P.glass = `<path class="o3" d="M-30 10 L-14 -26 L-6 4 Z M0 -20 L22 -30 L14 6 Z M10 12 L34 4 L24 30 Z M-20 20 L4 16 L-8 34 Z" fill="#cfe2ff" opacity=".9"/><path d="M-14 -18 L-12 -6 M16 -24 L14 -12" stroke="#fff" stroke-width="2"/>`;
  P.card = `<g transform="rotate(-10)"><rect class="o" x="-38" y="-22" width="76" height="44" rx="3" fill="#fbf7ee"/><rect x="-32" y="-16" width="64" height="32" fill="none" stroke="#6a35d9" stroke-width="2.5"/>
    <path d="M-29 -13 l4 4 M29 -13 l-4 4 M-29 13 l4 -4 M29 13 l-4 -4" stroke="#6a35d9" stroke-width="2"/>
    <path d="M-22 -6 H22 M-16 4 H16" stroke="#3b1d73" stroke-width="4" stroke-linecap="round"/><path d="M-10 11 q10 6 20 0" stroke="#6a35d9" stroke-width="2" fill="none"/><path d="M26 -22 L38 -22 L38 -10 Z" fill="#170d22" opacity=".25"/></g>`;
  P.feather = `<g transform="rotate(30)"><path class="o" d="M0 -44 C22 -26 18 14 0 34 C-18 14 -22 -26 0 -44 Z" fill="#8e5cf0"/><path d="M0 -40 V44" stroke="${INK}" stroke-width="3"/>
    <path d="M0 -24 L12 -30 M0 -10 L14 -14 M0 4 L12 2 M0 -24 L-12 -30 M0 -10 L-14 -14 M0 4 L-12 2" stroke="#5a2fb8" stroke-width="2.5"/>
    <circle cx="-6" cy="-16" r="2.5" fill="#fff3a8"/><circle cx="7" cy="-4" r="2.5" fill="#fff3a8"/><circle cx="-4" cy="10" r="2.5" fill="#fff3a8"/></g>`;
  P.pinboard = `<rect class="o" x="-40" y="-30" width="80" height="60" rx="3" fill="#b9874e"/><rect x="-30" y="-22" width="26" height="20" fill="${paper}" transform="rotate(-5)"/><rect x="4" y="-20" width="28" height="22" fill="${paper}" transform="rotate(4)"/>
    <path d="M-24 8 L-12 10 L-20 22 Z" fill="${paper}"/><circle cx="-17" cy="-20" r="3" fill="#c0302a"/><circle cx="18" cy="-18" r="3" fill="#2f6bd0"/><circle cx="-18" cy="12" r="3" fill="#c0302a"/>`;
  P.satchel = `<path class="o" d="M-20 -14 C-20 -40 20 -40 20 -14" fill="none" stroke="#5a3320" stroke-width="7"/><path class="o3" d="M-20 -14 C-20 -40 20 -40 20 -14" fill="none"/>
    <rect class="o" x="-34" y="-16" width="68" height="48" rx="8" fill="#8a5a2c"/><path class="o" d="M-34 -10 C-20 8 20 8 34 -10 V-16 H-34 Z" fill="#6b4220"/><rect class="o3" x="-6" y="0" width="12" height="10" fill="url(#k-brass)"/>`;
  P.telegram = `<g transform="rotate(5)"><rect class="o" x="-34" y="-26" width="68" height="52" fill="#f3dc8a"/><rect x="-34" y="-26" width="68" height="12" fill="#c99a2e"/><text x="0" y="-17" text-anchor="middle" font-size="9" font-family="Anton, Impact, sans-serif" fill="#3a2a10" letter-spacing="1.5">TELEGRAM</text>
    <rect x="-28" y="-8" width="56" height="28" fill="#fff6d0" opacity=".6"/>${lines(-24, 24, [-2, 6, 14])}</g>`;
  P.board = `<rect class="o" x="-40" y="-28" width="80" height="56" rx="4" fill="#1d2233"/><path d="M-30 -14 H10 M-30 -2 H14 M-30 10 H6" stroke="#ffd27a" stroke-width="4"/><path d="M18 -14 H30 M20 -2 H30 M18 10 H30" stroke="#fff" stroke-width="4"/>`;
  P.ticket = `<g transform="rotate(-12)"><path class="o" d="M-34 -16 H22 L26 -10 L22 -4 L28 2 L22 8 L26 14 L22 16 H-34 Z" fill="#f2a64a"/><path d="M-20 -16 V16" stroke="${INK}" stroke-width="2" stroke-dasharray="4 4"/>
    <rect x="-30" y="-12" width="7" height="24" fill="#c9782a"/><path d="M-10 -8 H14 M-10 0 H8 M-10 8 H12" stroke="${INK}" stroke-width="3.5"/></g>`;
  P.newspaper = `<g transform="rotate(-6)"><path class="o" d="M-36 -28 H30 V28 H-36 Z" fill="#e8e2d2"/><path class="o3" d="M30 -28 L38 -22 V34 H-28 L-36 28" fill="#cfc6b0"/>
    <rect x="-30" y="-22" width="54" height="10" fill="${INK}"/><text x="-3" y="-14" text-anchor="middle" font-size="7" font-family="Anton, Impact, sans-serif" fill="#e8e2d2" letter-spacing="1">LATE EDITION</text>
    <rect x="2" y="-6" width="22" height="16" fill="#9aa0a8"/><path d="M4 6 l6 -6 l5 4 l6 -6" stroke="#6b6578" stroke-width="2" fill="none"/>
    <path d="M-30 -4 H-4 M-30 4 H-4 M-30 12 H-4 M-30 20 H-4 M2 16 H24 M2 22 H20" stroke="#6b6578" stroke-width="3"/></g>`;
  P.blanket = `<path class="o" d="M-40 0 C-36 -22 -12 -26 0 -14 C12 -28 36 -22 40 -2 C44 18 20 26 0 18 C-20 28 -44 20 -40 0 Z" fill="#a8283a"/>
    <path d="M-30 -14 L-22 22 M-10 -20 L-6 24 M10 -22 L8 22 M28 -16 L24 20 M-40 -2 L40 -4 M-36 12 L38 10" stroke="#1f4a3a" stroke-width="5" opacity=".85"/><path d="M-34 6 L36 2" stroke="#ffd27a" stroke-width="2"/>`;
  P.lock = `<rect class="o" x="-22" y="-34" width="44" height="68" rx="6" fill="url(#k-brass)"/><circle cx="0" cy="-6" r="8" fill="${INK}"/><path d="M-4 -2 L-6 16 H6 L4 -2 Z" fill="${INK}"/>
    <path d="M-14 -26 l6 4 M10 -24 l6 -4 M-14 22 l8 -2 M8 24 l6 4" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  P.ladder = `<path class="o" d="M-18 -44 L-26 44 M18 -44 L26 44" stroke="#9a6a3a" stroke-width="8"/><path d="M-18 -44 L-26 44 M18 -44 L26 44" class="o3"/>
    <path d="M-19 -30 H19 M-20 -12 H21 M-22 6 H22 M-24 24 H24" stroke="#7a4a22" stroke-width="7"/>`;
  P.apron = `<path class="o" d="M-16 -36 H16 V-20 C30 -16 30 -6 26 0 L22 38 H-22 L-26 0 C-30 -6 -30 -16 -16 -20 Z" fill="#8a5a2c"/><path d="M-16 -36 C-30 -46 30 -46 16 -36" fill="none" class="o3"/>
    <rect class="o3" x="-14" y="4" width="28" height="18" fill="#6b4220"/><circle cx="-12" cy="-16" r="3" fill="url(#k-brass)"/><circle cx="12" cy="-16" r="3" fill="url(#k-brass)"/>`;
  P.fur = `<path class="o3" d="M-20 20 C-24 0 -10 -16 -4 -28 C0 -12 4 -20 10 -30 C12 -14 22 -6 18 18 C8 26 -10 26 -20 20 Z" fill="#c9c6cf"/><path d="M-8 16 C-8 2 -4 -8 -2 -16 M6 16 C8 4 8 -6 10 -18" stroke="#9e9aa6" stroke-width="2.5" fill="none"/>`;
  P.form = sheet() + lines(-18, 18, [-20, -10, 0]) + `<circle class="o3" cx="10" cy="18" r="10" fill="#e0b84a"/><path d="M4 26 L2 38 L8 34 L12 38 L12 26" class="o3" fill="#3b6bd0"/></g>`;
  P.sack = `<path class="o" d="M-28 34 C-40 10 -32 -14 -14 -22 L-18 -32 H18 L14 -22 C32 -14 40 10 28 34 Z" fill="#b89a6a"/><path d="M-16 -24 H16" stroke="#7a5a2c" stroke-width="5"/>
    <path d="M-20 0 L-16 30 M0 -6 V32 M20 0 L16 30" stroke="#9a7c4c" stroke-width="2.5"/><g transform="translate(0 -30) scale(.5)">${'<path class="o3" d="M-10 -2 C-10 14 10 14 10 -2 Z" fill="#d6b48a"/><path class="o3" d="M-12 -2 C-12 -12 12 -12 12 -2 Z" fill="#8a6a3a"/>'}</g>`;
  P.sign = `<rect class="o" x="-40" y="-30" width="80" height="54" rx="4" fill="${paper}"/><rect x="-40" y="-30" width="80" height="14" fill="#c0302a" class="o3"/>
    <path d="M-28 -2 H28 M-28 8 H22 M-28 18 H14" stroke="${line}" stroke-width="4"/><path d="M0 -26 V-20" stroke="#fff" stroke-width="4"/>`;
  P.goggles = `<path d="M-36 -2 C-44 -2 -44 8 -36 8 M36 -2 C44 -2 44 8 36 8" stroke="#5a3320" stroke-width="5" fill="none"/><path d="M-6 2 H6" stroke="#5a3320" stroke-width="6"/>
    <circle class="o" cx="-18" cy="2" r="16" fill="url(#k-brass)"/><circle class="o" cx="18" cy="2" r="16" fill="url(#k-brass)"/><circle cx="-18" cy="2" r="10" fill="#7ad0e8"/><circle cx="18" cy="2" r="10" fill="#7ad0e8"/><path d="M-22 -2 l4 -4 M14 -2 l4 -4" stroke="#fff" stroke-width="3"/>`;
  P.poster = `<rect class="o" x="-30" y="-40" width="60" height="80" rx="3" fill="#2a1f55"/><path d="M0 -26 L6 -12 L22 -12 L9 -2 L14 14 L0 4 L-14 14 L-9 -2 L-22 -12 L-6 -12 Z" fill="#ffd23f" class="o3"/>
    <path d="M-18 24 H18 M-12 32 H12" stroke="#f4ecd8" stroke-width="4"/>`;
  P.coat = `<path class="o" d="M-26 -18 L-38 36 H38 L26 -18 L10 -26 H-10 Z" fill="#2f3a4a"/><path d="M-10 -26 L0 0 L10 -26" class="o3" fill="#1d2633"/><path d="M0 0 V34" stroke="${INK}" stroke-width="3"/>
    <circle cx="-4" cy="10" r="2.5" fill="url(#k-brass)"/><circle cx="-4" cy="22" r="2.5" fill="url(#k-brass)"/><path class="o" d="M-20 -30 C-20 -48 20 -48 20 -30 Z" fill="#2a2430"/><rect class="o3" x="-26" y="-32" width="40" height="6" fill="#1a1520"/>`;
  P.case = `<rect class="o" x="-30" y="-36" width="60" height="50" fill="#cfe2ff" opacity=".55"/><rect class="o" x="-30" y="-36" width="60" height="50" fill="none"/><ellipse cx="0" cy="8" rx="18" ry="6" fill="#7a1f3a"/>
    <rect class="o" x="-36" y="14" width="72" height="24" fill="#5a3320"/><rect x="-4" y="-2" width="8" height="10" fill="url(#k-brass)" class="o3"/><path d="M-22 -30 L-10 -16" stroke="#fff" stroke-width="3"/>`;
  P.smear = `<path d="M-30 6 C-20 -10 -4 -6 6 -8 C16 -10 26 -16 32 -10 C24 0 10 4 -2 6 C-12 8 -22 14 -30 6 Z" fill="#e0457a" opacity=".85"/><path d="M-20 2 C-8 -4 8 -4 20 -10" stroke="#ff9cc0" stroke-width="3" fill="none"/>`;
  P.window = `<rect class="o" x="-32" y="-38" width="64" height="76" rx="4" fill="#5a3320"/><rect x="-24" y="-30" width="48" height="60" fill="url(#k-night)"/><path d="M0 -30 V30 M-24 0 H24" stroke="#5a3320" stroke-width="6"/>
    <path d="M-16 -24 l-4 10 M10 -20 l-4 10 M-10 6 l-4 10 M16 8 l-4 10" stroke="#bcd0ff" stroke-width="2"/><rect class="o3" x="-38" y="32" width="76" height="10" fill="#5a3320"/>`;
  P.dent = `<ellipse class="o3" cx="0" cy="0" rx="26" ry="22" fill="#2a1408"/><ellipse cx="4" cy="4" rx="16" ry="13" fill="#1a0c05"/><path d="M-18 -12 C-8 -22 10 -22 18 -12" stroke="#c9915a" stroke-width="3" fill="none"/>`;
  P.hatbox = `<ellipse class="o" cx="0" cy="22" rx="34" ry="12" fill="#c9a0d8"/><rect x="-34" y="-14" width="68" height="36" fill="#c9a0d8"/><path class="o" d="M-34 -14 V22 M34 -14 V22" fill="none"/>
    <ellipse class="o" cx="0" cy="-14" rx="34" ry="12" fill="#dcbce8"/><path d="M-6 -26 V34 M6 -26 V34" stroke="#7b2fd0" stroke-width="5"/><path class="o3" d="M0 -26 C-14 -40 -20 -26 0 -26 C20 -26 14 -40 0 -26 Z" fill="#7b2fd0"/>
    <path d="M-28 -8 V20" stroke="#fff" stroke-width="4" opacity=".4"/><path d="M-24 -18 Q-6 -24 14 -20" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/><path d="M-30 6 H-10 M14 6 H30" stroke="#a87ab8" stroke-width="2"/>`;
  P.twine = `<ellipse class="o" cx="-6" cy="8" rx="22" ry="18" fill="#a5733f"/><path d="M-24 4 C-12 -6 6 -4 14 6 M-26 14 C-12 4 8 6 16 16 M-14 -6 C-4 -10 6 -8 12 -2" stroke="#7a4f24" stroke-width="3" fill="none"/>
    <path d="M14 10 C26 4 30 -10 38 -22" stroke="#a5733f" stroke-width="4" fill="none"/>`;
  P.cabinet = `<rect class="o" x="-30" y="-36" width="60" height="72" rx="4" fill="#6b3a22"/><rect class="o3" x="-22" y="-28" width="44" height="56" fill="#552c18"/><circle class="o3" cx="10" cy="0" r="9" fill="url(#k-brass)"/><path d="M10 -9 V-4" stroke="${INK}" stroke-width="2"/>`;
  P.cane = `<path d="M-26 40 L18 -26" stroke="#3a2010" stroke-width="9" stroke-linecap="round"/><path d="M-26 40 L18 -26" class="o3"/><circle class="o" cx="22" cy="-30" r="11" fill="#d6dbe6"/><path d="M-14 22 l6 -10" stroke="#e8c66a" stroke-width="5"/>`;
  P.prints = [[-34, 14, -20], [-14, 2, -10], [8, 8, 8], [28, -6, 18]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="6" ry="9" fill="#4a3018" opacity=".85"/><circle cx="-6" cy="-11" r="2.6" fill="#4a3018" opacity=".85"/><circle cx="0" cy="-13" r="2.6" fill="#4a3018" opacity=".85"/><circle cx="6" cy="-11" r="2.6" fill="#4a3018" opacity=".85"/></g>`).join('') +
    `<path d="M-40 26 C-20 18 10 24 40 8" stroke="#4a3018" stroke-width="7" opacity=".5" stroke-linecap="round" fill="none"/>`;
  P.screws = `<rect class="o3" x="-38" y="-24" width="76" height="48" rx="3" fill="#6b3a22"/>` + [[-26, -12], [26, -12], [-26, 12], [26, 12]].map(([x, y]) => `<circle class="o3" cx="${x}" cy="${y}" r="7" fill="url(#k-brass)"/><path d="M${x - 5} ${y} H${x + 5}" stroke="${INK}" stroke-width="2.5"/><path d="M${x - 3} ${y - 5} l6 2" stroke="#fff" stroke-width="2"/>`).join('');
  P.drawer = `<rect class="o" x="-38" y="-20" width="76" height="40" rx="3" fill="#6b3a22"/><rect class="o3" x="-30" y="-12" width="60" height="24" fill="#552c18"/><circle class="o3" cx="0" cy="0" r="8" fill="url(#k-brass)"/><path d="M0 -8 V-3" stroke="${INK}" stroke-width="2"/>`;
})(window.SQH);
