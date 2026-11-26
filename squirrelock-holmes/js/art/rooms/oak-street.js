/* Room art: 221B Oak Street, the sitting room inside a hollow oak (title screen and briefings). */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  SQH.Art.rooms['oak-street'] = {
    name: '221B Oak Street',
    spots: {},
    lights: [{ x: 420, y: 250, r: 340 }, { x: 1180, y: 250, r: 320 }, { x: 800, y: 600, r: 300, fire: true }],
    draw() {
      // curved walls of a hollow tree: rings of wood grain
      let s = `<rect width="1600" height="900" fill="#3a2414"/>`;
      for (let i = 0; i < 9; i++) s += `<ellipse cx="800" cy="1000" rx="${1250 - i * 120}" ry="${1080 - i * 95}" fill="${i % 2 ? '#4a2e19' : '#432914'}" stroke="#2c190c" stroke-width="5"/>`;
      const r = K.rng(221);
      for (let i = 0; i < 40; i++) { const x = r() * 1600, y = 60 + r() * 560; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q${(10 + r() * 20).toFixed(0)} ${(-4 - r() * 6).toFixed(0)} ${(30 + r() * 30).toFixed(0)} 0" stroke="#2c190c" stroke-width="3" fill="none" opacity=".6"/>`; }
      s += `<path d="M0 0 H1600 V60 C1200 20 400 20 0 60 Z" fill="#24150a"/>
        <rect y="700" width="1600" height="200" fill="#2e1a0e"/>`;
      for (let i = -10; i <= 10; i++) s += `<path d="M${800 + i * 70} 700 L${800 + i * 200} 900" stroke="#21130a" stroke-width="4"/>`;
      s += `<rect y="700" width="1600" height="200" fill="url(#k-floor)"/><rect y="682" width="1600" height="20" fill="#5a3320" class="o3"/><path d="M0 685 H1600" stroke="#fff" stroke-opacity=".15" stroke-width="3"/>`;
      s += K.lightPool(430, 260, 260, 210) + K.lightPool(1150, 260, 250, 200) + K.lightPool(800, 740, 360, 90);
      // round window with rain
      s += `<circle class="o" cx="1360" cy="300" r="150" fill="#5a3320"/>` + K.window(1250, 190, 220, 220, { state: 'closed', curtains: false, sill: false, frame: '#5a3320' });
      s += `<circle cx="1360" cy="300" r="150" fill="none" stroke="#2c190c" stroke-width="22"/><circle cx="1360" cy="300" r="160" class="o" fill="none"/><path d="M1240 220 A150 150 0 0 1 1330 152" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none"/>`;
      // a map pinned to the wall and a deerstalker on a hook
      s += `<g transform="rotate(-4 560 210)"><rect class="o3" x="500" y="160" width="120" height="96" fill="#e9d8b0"/><path d="M510 220 Q540 180 570 210 T612 196" stroke="#3b6bd0" stroke-width="3" fill="none"/><path d="M520 180 l40 20 l30 -14 M530 236 l60 -10" stroke="#a89060" stroke-width="2" fill="none"/><circle cx="556" cy="206" r="5" fill="#c0302a"/><circle class="o3" cx="506" cy="166" r="4" fill="#c0302a"/><circle class="o3" cx="614" cy="166" r="4" fill="#c0302a"/></g>
        <path d="M1500 420 h16" stroke="#3a2010" stroke-width="8"/><path class="o" d="M1478 450 C1476 420 1540 418 1540 450 Z" fill="#8f7a4c"/><path d="M1470 448 C1462 448 1460 458 1468 460 L1550 458 C1558 456 1556 448 1548 448" stroke="${INK}" stroke-width="3" fill="#7d6a42"/><path d="M1490 426 L1496 448 M1510 422 V448 M1528 428 L1522 448" stroke="#5e4e2c" stroke-width="2"/>`;
      // bookshelf on the left
      s += K.shadow(195, 690, 140, 12) + K.box(70, 200, 250, 480, '#4a2616', '#2e170c', 6) + `<rect x="84" y="214" width="222" height="452" fill="#24120a"/>`;
      s += K.books(86, 212, 218, 90, 5, 77);
      s += `<path class="o3" d="M250 282 h22 v-30 h-22 Z" fill="#cfe2ff" opacity=".6"/><path d="M256 268 h10" stroke="#2f8a5a" stroke-width="6"/>`;
      // fireplace in the middle
      s += `${K.shadow(800, 700, 220, 16)}<rect class="o" x="596" y="428" width="408" height="32" rx="4" fill="#6e3f22"/><path d="M600 432 H1000" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
        <rect class="o" x="624" y="460" width="352" height="232" fill="#cfc4b0"/><rect x="928" y="464" width="44" height="224" fill="#a99e88"/><path d="M632 468 V688 M632 468 H968" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>
        <path class="o" d="M690 692 V540 Q800 490 910 540 V692 Z" fill="#140a08"/>
        <path d="M708 682 l60 -22 l60 18 Z" fill="#5a3018" class="o3"/><path d="M720 668 l100 8" stroke="#3a1e0e" stroke-width="12" stroke-linecap="round"/>
        <g class="ember"><path d="M716 690 C722 640 748 630 752 590 C770 630 790 600 794 570 C810 610 840 630 832 690 Z" fill="#ff7a2f"/><path d="M748 690 C752 656 772 650 776 624 C790 650 808 650 802 690 Z" fill="#ffd27a"/></g>
        <path d="M700 690 H900" stroke="#2a2a30" stroke-width="9"/><circle class="o3" cx="708" cy="668" r="7" fill="url(#k-brass)"/><circle class="o3" cx="892" cy="668" r="7" fill="url(#k-brass)"/>`;
      // mantel things: a ticking mantel clock, a violin, a jar of acorns
      s += `${K.shadow(800, 430, 50, 6)}<path class="o" d="M760 432 V376 Q800 340 840 376 V432 Z" fill="#4a2616"/>` + K.face(800, 392, 26, { time: '10:10' });
      s += `<g transform="translate(680 400) rotate(-20)"><path class="o" d="M-14 -30 C-24 -30 -24 -14 -16 -10 C-26 -4 -26 16 -12 22 C0 26 6 20 6 10 C14 6 14 -8 6 -12 C8 -24 -2 -30 -14 -30 Z" fill="#a0521d"/><path d="M-8 -16 v28" stroke="#3a1e0e" stroke-width="3"/><path d="M-6 -30 L4 -64" stroke="${INK}" stroke-width="5"/><path d="M-12 -2 h8 M-10 6 h6" stroke="#3a1e0e" stroke-width="2"/></g>`;
      s += `<path class="o" d="M896 378 H944 V430 H896 Z" fill="#cfe2ff" opacity=".5"/><g transform="translate(920 412) scale(.6)">${SQH.Art.props.acorns}</g>`;
      s += K.portrait(725, 150, 150, 170, { fur: '#9a6a3a', coat: '#3a2a4a', bg: '#2a2236' });
      s += K.lamp(430, 210) + K.lamp(1150, 210);
      s += K.rug(800, 790, 640, 150, '#5c2a6e', '#c9a24a');
      // two armchairs
      const chair = (x, c, c2) => `${K.shadow(x, 704, 130, 14)}<path class="o" d="M${x - 90} 700 V560 C${x - 90} 470 ${x + 90} 470 ${x + 90} 560 V700 Z" fill="${c}"/>
        <path d="M${x - 70} 540 C${x - 60} 496 ${x + 20} 486 ${x + 50} 500" stroke="#fff" stroke-opacity=".16" stroke-width="5" fill="none"/>
        <path class="o" d="M${x - 110} 700 V610 C${x - 110} 580 ${x - 70} 580 ${x - 70} 610 V700 Z M${x + 110} 700 V610 C${x + 110} 580 ${x + 70} 580 ${x + 70} 610 V700 Z" fill="${c2}"/>
        <rect class="o" x="${x - 76}" y="630" width="152" height="60" rx="10" fill="${c2}"/><path d="M${x - 66} 638 H${x + 60}" stroke="#fff" stroke-opacity=".15" stroke-width="3"/>
        ${[[-50, 520], [0, 508], [50, 520], [-30, 570], [30, 570]].map(([dx, y]) => `<circle cx="${x + dx}" cy="${y}" r="4" fill="${INK}" opacity=".6"/>`).join('')}`;
      s += chair(470, '#8a1e2a', '#6a1520') + chair(1130, '#2f5a3e', '#22432e');
      // the tea table: teapot, a magnifying glass and papers
      s += `${K.shadow(800, 842, 250, 12)}<rect class="o" x="560" y="728" width="480" height="30" rx="8" fill="#5a3320"/><path d="M566 732 H1034" stroke="#fff" stroke-opacity=".2" stroke-width="3"/><path class="o3" d="M590 758 V840 M1010 758 V840" stroke-width="10"/>
        <path class="o3" d="M700 728 C700 700 744 700 744 728 Z" fill="#f4eee4"/><path class="o3" d="M744 712 C756 708 756 722 744 722" fill="none"/><circle class="o3" cx="722" cy="702" r="4" fill="#d9a441"/>
        <g transform="rotate(-8 900 720)"><rect class="o3" x="850" y="710" width="80" height="14" fill="#f4ecd8"/><rect class="o3" x="858" y="704" width="80" height="14" fill="#efe6d0"/></g>
        <circle cx="980" cy="716" r="16" fill="#cfe2ff" fill-opacity=".4" stroke="url(#k-brass)" stroke-width="5"/><path d="M992 728 L1012 744" stroke="#3a2010" stroke-width="7" stroke-linecap="round"/><path d="M972 708 a10 10 0 0 1 10 -4" stroke="#fff" stroke-width="3" fill="none"/>`;
      // a small chemistry table with a bubbling flask
      s += `${K.shadow(1280, 704, 70, 10)}<rect class="o" x="1220" y="600" width="120" height="16" rx="4" fill="#6e3f22"/><path d="M1232 616 V700 M1328 616 V700" stroke="#3a2010" stroke-width="8"/>
        <path class="o3" d="M1250 600 V560 h12 V600 Z" fill="#cfe2ff" opacity=".7"/><path class="o3" d="M1276 600 l-12 -22 v-26 h16 v26 l12 22 Z" fill="#cfe2ff" opacity=".7"/><path d="M1268 596 l-6 -12 h28 l-6 12 Z" fill="#7b2fd0" opacity=".8"/>
        ${SQH.reduced() ? '' : '<circle cx="1280" cy="540" r="4" fill="#b894ff" opacity=".7"><animate attributeName="cy" values="548;520" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.6s" repeatCount="indefinite"/></circle>'}
        <path class="o3" d="M1306 600 h22 l-4 -30 h-14 Z" fill="#2f8a5a"/>`;
      // a stack of newspapers on the floor
      s += `${K.shadow(1460, 742, 60, 8)}${[0, 1, 2].map((i) => `<rect class="o3" x="${1414 - i * 4}" y="${724 - i * 12}" width="92" height="14" fill="#e8e2d2" transform="rotate(${i * 3 - 2} 1460 ${730 - i * 12})"/>`).join('')}`;
      s += `${K.shadow(1500, 610, 70, 8, 0.5)}<rect class="o" x="1440" y="560" width="120" height="44" rx="6" fill="url(#k-brass)"/><text x="1500" y="592" text-anchor="middle" class="svg-sign svg-sign--ink">221B</text>`;
      s += K.dust(560, 120, 520, 560, 18, 11);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
