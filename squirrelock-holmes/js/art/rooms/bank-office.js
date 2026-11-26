/* Room art: the Manager's Office at Chestnut & Co. Savings Hollow (Medium story, room 1). */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  const coins = (x, y, nCoins) => { let s = ''; for (let i = 0; i < nCoins; i++) s += `<ellipse class="o3" cx="${x}" cy="${y - i * 5}" rx="11" ry="4" fill="url(#k-brass)"/>`; return s; };
  SQH.Art.rooms['bank-office'] = {
    name: 'Manager\'s Office',
    spots: {
      window: { x: 250, y: 340, w: 220, h: 300, label: 'Window' },
      sill: { x: 250, y: 503, w: 260, h: 46, label: 'Window sill' },
      coatrack: { x: 470, y: 565, w: 120, h: 280, label: 'Coat rack' },
      clock: { x: 720, y: 200, w: 120, h: 120, label: 'Wall clock' },
      desk: { x: 820, y: 650, w: 420, h: 100, label: 'Desk' },
      blotter: { x: 780, y: 588, w: 180, h: 44, label: 'Blotter' },
      drawer: { x: 940, y: 660, w: 120, h: 56, label: 'Desk drawer' },
      wastebin: { x: 1100, y: 752, w: 100, h: 100, label: 'Wastepaper basket' },
      portrait: { x: 1080, y: 265, w: 170, h: 210, label: 'Portrait' },
      bookshelf: { x: 1390, y: 450, w: 250, h: 440, label: 'Bookshelf' },
      rug: { x: 820, y: 810, w: 380, h: 80, label: 'Rug' },
    },
    lights: [{ x: 600, y: 300, r: 320 }, { x: 1215, y: 300, r: 300 }, { x: 900, y: 540, r: 200 }],
    draw(st) {
      let s = K.shell({ paper: '#1e3a33', paper2: '#26473f', wood: '#5a3220', wood2: '#472616', rail: '#6e3f22', floor: '#3a2016', floor2: '#26140c', crown: '#132722', wainY: 520, floorY: 690 });
      s += K.tiles(690, '#2a2630', '#a89f8c');
      s += K.lightPool(600, 290, 230, 190) + K.lightPool(1215, 290, 220, 180);
      s += `<text x="820" y="128" text-anchor="middle" class="svg-sign">CHESTNUT &amp; CO. SAVINGS HOLLOW</text><path d="M500 140 H1140" stroke="#d9a441" stroke-width="2" opacity=".5"/>`;
      s += K.frame(830, 165, 96, 74, 'cert') + K.frame(470, 168, 70, 84, 'map');
      s += K.window(140, 180, 220, 320, { state: st.window || 'closed', curtain: '#3b2a5a', curtain2: '#2a1d42' });
      // the night watchman's lantern hook beside the window
      s += `<path d="M392 300 h26 v20" stroke="${INK}" stroke-width="5" fill="none"/><path class="o3" d="M406 322 h24 l-4 34 h-16 Z" fill="#3a3030"/><rect x="410" y="326" width="16" height="24" fill="#ffd27a" opacity=".5"/><path class="o3" d="M404 322 l14 -8 l14 8" fill="#2a2228"/>`;
      s += K.lamp(600, 260) + K.lamp(1215, 260);
      s += K.wallClock(720, 200, 44, { time: '4:05' });
      s += K.portrait(1005, 170, 150, 190, { fur: '#7a5a3a', coat: '#1d1a26', bg: '#2a2a1e' });
      // bookshelf with a bust on top
      s += K.shadow(1390, 694, 140, 12) + K.box(1265, 228, 250, 462, '#4a2616', '#2e170c', 6) + `<rect x="1280" y="244" width="220" height="430" fill="#24120a"/>`;
      s += K.books(1282, 236, 216, 88, 5, 41, ['#24523e', '#7a2430', '#3b2a5a', '#8a5a2c', '#1d2a4a', '#d9a441']);
      s += `<path class="o" d="M1372 228 c-6 -22 4 -40 18 -40 c14 0 24 18 18 40 Z" fill="#cfc6b2"/><rect class="o3" x="1366" y="216" width="48" height="14" fill="#b3a893"/><circle cx="1382" cy="202" r="2.5" fill="${INK}"/><circle cx="1396" cy="202" r="2.5" fill="${INK}"/><path class="o3" d="M1376 196 l-4 -14 l10 8 Z M1404 196 l4 -14 l-10 8 Z" fill="#cfc6b2"/>`;
      // a globe on a stand
      s += `${K.shadow(1212, 692, 44, 8)}<path d="M1212 686 V640 M1186 690 L1212 676 L1238 690" stroke="#3a2010" stroke-width="7" fill="none"/><path d="M1212 686 V640" class="o3"/>
        <path d="M1178 600 A36 36 0 0 0 1246 600" stroke="url(#k-brass)" stroke-width="6" fill="none"/>
        <circle class="o" cx="1212" cy="596" r="32" fill="#3b6b8a"/><path d="M1196 576 q10 6 6 16 q-8 6 -2 14 M1220 580 q8 10 18 6 M1214 612 q8 -4 14 2" stroke="#d9c38a" stroke-width="5" fill="none"/><path d="M1190 584 A30 30 0 0 1 1204 568" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>`;
      // coat rack with an overcoat, a bowler hat and an umbrella stand
      s += `${K.shadow(470, 694, 64, 10)}<path class="o" d="M470 330 V688" stroke="#3a2010" stroke-width="12"/><path class="o3" d="M470 330 V688" fill="none"/><path d="M440 350 L470 336 L500 350" stroke="#3a2010" stroke-width="8" fill="none"/><circle class="o3" cx="470" cy="326" r="8" fill="url(#k-brass)"/>
        <path class="o" d="M476 356 Q498 340 520 356 L532 548 Q504 560 470 548 Z" fill="#2d2a3a"/><path class="o3" d="M484 352 L498 384 L512 352" fill="#1b1924"/>
        <path d="M498 384 V540 M484 420 C482 470 484 510 488 546 M514 420 C518 470 520 510 518 546" stroke="#1b1924" stroke-width="4" fill="none"/>
        <circle cx="503" cy="410" r="3" fill="url(#k-brass)"/><circle cx="503" cy="440" r="3" fill="url(#k-brass)"/><circle cx="503" cy="470" r="3" fill="url(#k-brass)"/>
        <path d="M478 364 C474 430 474 500 478 546" stroke="#fff" stroke-opacity=".14" stroke-width="4" fill="none"/>
        <ellipse class="o" cx="446" cy="340" rx="28" ry="7" fill="#241c18"/><path class="o" d="M428 340 C426 312 466 312 464 340 Z" fill="#2e2420"/><path d="M429 334 H463" stroke="#4a3c34" stroke-width="5"/>
        <path class="o" d="M430 646 h80 l-6 46 h-68 Z" fill="#3a2a20"/><path d="M432 654 h76" stroke="#d9a441" stroke-width="3"/>
        <path d="M450 646 L440 588 M470 646 L478 600 M490 646 L500 592" stroke="${INK}" stroke-width="5"/><path d="M432 594 Q440 580 448 594" stroke="${INK}" stroke-width="4" fill="none"/><path class="o3" d="M486 592 l14 -10 l14 10 Z" fill="#7a2430"/>`;
      s += K.plant(70, 780, 1.05);
      s += K.moonPatch(170, 340, 690, 150);
      s += K.rug(820, 810, 600, 120, '#3b2a5a', '#c9a24a');
      // the tufted wingback chair behind the desk
      s += `<path class="o" d="M716 600 V468 C716 420 924 420 924 468 V600 Z" fill="#6a1f2a"/><path class="o3" d="M700 600 V500 C700 470 722 462 730 480 V600 Z M940 600 V500 C940 470 918 462 910 480 V600 Z" fill="#561722"/>
        ${[[760, 470], [820, 458], [880, 470], [790, 512], [850, 512], [760, 552], [820, 552], [880, 552]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${INK}" opacity=".55"/><path d="M${x - 14} ${y + 14} l14 -14 l14 14" stroke="${INK}" stroke-opacity=".25" stroke-width="2" fill="none"/>`).join('')}
        <path d="M728 470 C740 444 800 438 840 440" stroke="#fff" stroke-opacity=".18" stroke-width="4" fill="none"/>`;
      // the desk: green leather top, carved front, two pedestals
      s += `${K.shadow(820, 702, 250, 14)}
        <path class="o" d="M590 586 H1050 L1060 616 H580 Z" fill="#7a4a28"/><path d="M600 590 H1040" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
        ${K.box(600, 616, 170, 84, '#5a3220', '#3a2012')}${K.box(870, 616, 170, 84, '#5a3220', '#3a2012')}<rect class="o3" x="770" y="616" width="100" height="44" fill="#3a2012"/>
        <rect class="o3" x="614" y="628" width="142" height="26" rx="3" fill="#4a2816"/><rect class="o3" x="614" y="662" width="142" height="26" rx="3" fill="#4a2816"/><rect class="o3" x="676" y="636" width="18" height="8" rx="3" fill="url(#k-brass)"/><rect class="o3" x="676" y="670" width="18" height="8" rx="3" fill="url(#k-brass)"/>
        <rect class="o3" x="884" y="634" width="112" height="46" fill="#4a2816"/><circle class="o3" cx="940" cy="657" r="9" fill="url(#k-brass)"/><path d="M940 648 V653" stroke="${INK}" stroke-width="2"/>
        <rect class="o3" x="690" y="572" width="180" height="22" fill="#2f6b4e"/><path d="M690 572 V594 M870 572 V594" stroke="#5a3320" stroke-width="8"/><path d="M700 576 H860" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>`;
      // things on the desk: banker's lamp, inkwell and quill, ledgers, coins and a bell
      s += `<path class="o3" d="M898 586 h28 l-4 -8 h-20 Z" fill="url(#k-brass)"/><path d="M912 578 V548" stroke="url(#k-brass)" stroke-width="5"/>
        <path class="o" d="M880 552 Q912 526 944 552 Z" fill="#2f8a5a"/><path d="M890 548 Q912 532 934 548" stroke="#8fe0b0" stroke-width="3" fill="none"/><ellipse cx="912" cy="556" rx="30" ry="5" fill="#ffe7b0" opacity=".8"/>
        <path class="o3" d="M1000 562 h24 v18 h-24 Z" fill="#1a1520"/><path d="M1012 562 L1034 526" stroke="#f4eee4" stroke-width="3"/><path d="M1030 530 q8 -6 10 -16 q-10 4 -14 12" fill="#f4eee4" class="o3"/>
        <rect class="o3" x="608" y="566" width="62" height="12" fill="#24523e"/><rect class="o3" x="612" y="554" width="58" height="12" fill="#7a2430"/><rect class="o3" x="606" y="542" width="60" height="12" fill="#3b2a5a"/>
        ${coins(966, 584, 4)}${coins(986, 584, 2)}
        <path class="o3" d="M1042 584 a10 10 0 0 1 20 0 Z" fill="url(#k-brass)"/><circle class="o3" cx="1052" cy="571" r="3" fill="url(#k-brass)"/>`;
      // wicker wastepaper basket
      s += `${K.shadow(1100, 798, 44, 8)}<path class="o" d="M1064 712 h72 l-8 84 h-56 Z" fill="#a5733f"/><path d="M1072 728 h56 M1074 748 h52 M1076 768 h48 M1084 712 V796 M1100 712 V796 M1116 712 V796" stroke="#7a4f24" stroke-width="3"/><rect class="o3" x="1060" y="706" width="80" height="10" rx="4" fill="#b8854a"/>`;
      s += K.dust(160, 190, 600, 520, 14, 5);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
