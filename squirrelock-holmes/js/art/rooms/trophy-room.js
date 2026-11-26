/* Room art: the Trophy Room of the Royal Acorn Society (Easy story).
   `spots` are the named places a case can put a clue (center x, y and size, in scene units).
   `lights` are the gas-lamp glows laid over the scene. Swap draw() for illustrated art any time;
   just keep the spot names. */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  const cup = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${K.shadow(0, 30, 22, 5)}<path class="o" d="M-22 -30 H22 C22 -4 12 6 0 8 C-12 6 -22 -4 -22 -30 Z" fill="url(#k-brass)"/>
    <path d="M-14 -26 C-14 -10 -8 -2 -2 2" stroke="#fff6d0" stroke-width="3" fill="none" opacity=".8"/>
    <path class="o3" d="M-22 -24 C-36 -24 -36 -6 -16 -4 M22 -24 C36 -24 36 -6 16 -4" fill="none"/><rect class="o3" x="-5" y="8" width="10" height="14" fill="url(#k-brass)"/><rect class="o3" x="-16" y="22" width="32" height="8" fill="#3a2014"/></g>`;
  const shield = (x, y) => `<g transform="translate(${x} ${y})"><path class="o" d="M-30 -34 H30 V0 C30 22 12 34 0 40 C-12 34 -30 22 -30 0 Z" fill="#4a1f3a"/>
    <path d="M-20 -24 H20 V0 C20 14 8 22 0 26 C-8 22 -20 14 -20 0 Z" fill="none" stroke="#d9a441" stroke-width="3"/>
    <path class="o3" d="M-9 -2 C-9 12 9 12 9 -2 Z" fill="#d9a441"/><path class="o3" d="M-11 -2 C-11 -12 11 -12 11 -2 Z" fill="#8a5a1c"/><path d="M-26 -30 L-4 -30" stroke="#fff" stroke-opacity=".2" stroke-width="3"/></g>`;

  SQH.Art.rooms['trophy-room'] = {
    name: 'Trophy Room',
    spots: {
      window: { x: 285, y: 345, w: 230, h: 300, label: 'Window' },
      sill: { x: 285, y: 512, w: 280, h: 50, label: 'Window sill' },
      coatstand: { x: 520, y: 612, w: 140, h: 150, label: 'Coat stand' },
      wall: { x: 655, y: 400, w: 90, h: 90, label: 'Wall panel' },
      case: { x: 800, y: 432, w: 150, h: 130, label: 'Display case' },
      casebase: { x: 820, y: 628, w: 190, h: 90, label: 'Back of the case' },
      fireplace: { x: 1090, y: 628, w: 180, h: 120, label: 'Fireplace' },
      portrait: { x: 1090, y: 255, w: 170, h: 210, label: 'Portrait' },
      cabinet: { x: 1297, y: 625, w: 100, h: 130, label: 'Small cabinet' },
      clock: { x: 1425, y: 455, w: 140, h: 470, label: 'Grandfather clock' },
      table: { x: 300, y: 700, w: 230, h: 70, label: 'Side table' },
      rug: { x: 820, y: 795, w: 380, h: 90, label: 'Rug' },
    },
    lights: [{ x: 610, y: 240, r: 330 }, { x: 1290, y: 240, r: 300 }, { x: 1090, y: 640, r: 240, fire: true }],
    draw(st) {
      let s = K.shell({ paper: '#3d1f3f', paper2: '#4c2a4e', wood: '#5a321e', wood2: '#482715', rail: '#6e3f22', floor: '#3e2214', floor2: '#2a160c', crown: '#2a1420', wainY: 520, floorY: 690 });
      // lamplight washing the wallpaper
      s += K.lightPool(610, 260, 240, 200) + K.lightPool(1290, 260, 220, 190) + K.lightPool(1090, 700, 260, 70);
      // the society's crest and name
      s += `<text x="820" y="128" text-anchor="middle" class="svg-sign">ROYAL ACORN SOCIETY</text><path d="M560 140 H1080" stroke="#d9a441" stroke-width="3" opacity=".6"/>
        <path d="M600 146 H1040" stroke="#d9a441" stroke-width="1.5" opacity=".4"/>`;
      s += shield(440, 300) + shield(1530, 150);
      s += K.frame(470, 150, 86, 104, 'land') + K.frame(1505, 250, 70, 86, 'cert');
      s += K.window(170, 180, 230, 330, { state: st.window || 'open', curtain: '#6a1f3a', curtain2: '#4a1229' });
      s += K.lamp(610, 200) + K.lamp(1290, 200);
      s += K.portrait(1015, 160, 150, 190, { fur: '#b0703a', coat: '#3a2a4a', bg: '#26331f', hat: true });
      // fireplace: marble surround, tiles, logs and a low fire
      s += `${K.shadow(1090, 700, 170, 14)}
        <rect class="o" x="944" y="448" width="292" height="28" rx="4" fill="#6e3f22"/><path d="M948 452 H1232" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
        <path class="o3" d="M960 476 h28 l-6 22 h-16 Z M1192 476 h28 l-6 22 h-16 Z" fill="#5a321e"/>
        <rect class="o" x="972" y="476" width="236" height="216" fill="#d8cfc0"/><rect x="1162" y="480" width="42" height="208" fill="#b3a893"/>
        <path d="M980 484 V688 M980 484 H1200" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>
        <path d="M1004 508 H1176 V692 H1004 Z" fill="#2f5a3e"/>`;
      for (let ty = 512; ty < 690; ty += 22) for (const tx of [1008, 1154]) s += `<rect x="${tx}" y="${ty}" width="18" height="18" fill="${(ty / 22) % 2 ? '#3f7a55' : '#28503a'}"/><path d="M${tx + 4} ${ty + 9} h10 M${tx + 9} ${ty + 4} v10" stroke="#d9a441" stroke-width="1.5" opacity=".6"/>`;
      s += `<path class="o" d="M1030 692 V566 Q1090 528 1150 566 V692 Z" fill="#140a08"/>
        <path d="M1046 680 l40 -16 l44 14 Z" fill="#5a3018" class="o3"/><path d="M1050 668 l70 6" stroke="#3a1e0e" stroke-width="10" stroke-linecap="round"/>
        <g class="ember"><path d="M1048 688 C1052 650 1066 640 1068 612 C1080 640 1092 622 1094 598 C1104 630 1122 640 1118 688 Z" fill="#ff7a2f"/><path d="M1064 688 C1068 664 1080 656 1082 638 C1092 660 1102 660 1098 688 Z" fill="#ffd27a"/></g>
        <path d="M1036 690 H1144 M1042 672 V692 M1138 672 V692" stroke="#2a2a30" stroke-width="7"/><circle class="o3" cx="1042" cy="668" r="6" fill="url(#k-brass)"/><circle class="o3" cx="1138" cy="668" r="6" fill="url(#k-brass)"/>
        <path d="M1220 690 L1236 600 M1228 690 L1250 606" stroke="#3a3a44" stroke-width="5"/><circle class="o3" cx="1236" cy="598" r="5" fill="url(#k-brass)"/>`;
      s += cup(1000, 420, 0.9) + cup(1180, 420, 0.9) + cup(1090, 412, 1.1);
      s += K.tallClock(1360, 220, 130, 470, { time: '9:20', wood: '#4a2616', wood2: '#2e170c' });
      // porter's cabinet
      s += K.shadow(1297, 694, 60, 8) + K.box(1250, 560, 95, 132, '#6b3a22', '#3e2010') + `<rect class="o3" x="1262" y="574" width="70" height="104" fill="#552c18"/><circle class="o3" cx="1297" cy="610" r="12" fill="url(#k-brass)"/><path d="M1297 598 V604" stroke="${INK}" stroke-width="3"/>
        <rect class="o3" x="1268" y="646" width="58" height="16" fill="url(#k-brass)"/><text x="1297" y="659" text-anchor="middle" class="svg-plaque">PORTER</text>`;
      // bentwood coat stand with a cloak, top hat and scarf (the low ring holds parcels and hatboxes)
      s += `${K.shadow(520, 694, 70, 10)}
        <path d="M520 320 V684 M466 694 Q492 676 520 664 Q548 676 574 694" stroke="#3a2010" stroke-width="12" fill="none"/><path d="M520 320 V684 M466 694 Q492 676 520 664 Q548 676 574 694" class="o3" fill="none"/>
        <path d="M486 344 Q506 326 520 330 Q534 326 554 344" stroke="#3a2010" stroke-width="7" fill="none"/><circle class="o3" cx="520" cy="316" r="9" fill="url(#k-brass)"/>
        <path class="o" d="M540 340 C578 372 590 460 578 550 C566 556 552 556 540 548 C548 470 540 404 528 356 Z" fill="#4a2a5a"/>
        <path d="M552 380 C566 430 568 490 560 544 M542 400 C550 450 550 500 546 546" stroke="#2e1838" stroke-width="5" fill="none"/>
        <path d="M534 360 C560 380 574 420 576 470" stroke="#fff" stroke-opacity=".14" stroke-width="4" fill="none"/>
        <path class="o3" d="M500 352 C492 400 494 440 504 470 L514 466 C508 436 506 400 512 356 Z" fill="#7a2430"/><path d="M498 470 l4 14 M506 468 l4 14" stroke="#7a2430" stroke-width="3"/>
        <ellipse class="o" cx="486" cy="342" rx="32" ry="8" fill="#1a1520"/><path class="o" d="M466 342 L470 296 H502 L506 342 Z" fill="#221a28"/><rect x="468" y="330" width="36" height="7" fill="#5c2a6e"/><path d="M474 300 V330" stroke="#3a3244" stroke-width="4"/>
        <ellipse class="o3" cx="520" cy="652" rx="56" ry="10" fill="#4a2815"/><path d="M470 650 Q520 640 570 650" stroke="#fff" stroke-opacity=".15" stroke-width="2" fill="none"/>`;
      s += K.moonPatch(220, 380, 690, 160);
      s += K.rug(820, 795, 560, 130, '#6a1f3a', '#c9a24a');
      // a spotlight from above on the display case
      s += `<path d="M770 60 L870 60 L940 560 L700 560 Z" fill="url(#k-beam)" opacity=".9"/>`;
      // the display case on its carved pedestal (empty cushion)
      s += `${K.shadow(820, 702, 120, 14)}
        ${K.box(732, 560, 176, 140, '#4a2616', '#2e170c', 2)}<rect class="o3" x="752" y="580" width="136" height="98" fill="#3a1d10"/>
        <path d="M762 590 H878 V668 H762 Z" fill="none" stroke="#5a3220" stroke-width="3"/><path d="M790 610 q30 -14 60 0 q-30 14 -60 0 Z" fill="#5a3220"/>
        <rect class="o3" x="754" y="674" width="132" height="20" fill="url(#k-brass)"/><text x="820" y="689" text-anchor="middle" class="svg-plaque">THE GILDED ACORN</text>
        <path class="o3" d="M736 700 h18 v8 h-18 Z M886 700 h18 v8 h-18 Z" fill="#2e170c"/>
        <rect class="o" x="716" y="548" width="208" height="16" fill="url(#k-brass)"/><path d="M720 551 H920" stroke="#fff6d0" stroke-width="2" opacity=".7"/>
        <rect x="724" y="372" width="192" height="178" fill="#cfe2ff" opacity=".18"/>
        <rect class="o3" x="780" y="522" width="80" height="26" rx="4" fill="#5a1229"/>
        <ellipse class="o3" cx="820" cy="522" rx="54" ry="12" fill="#7a1f3a"/><ellipse cx="820" cy="519" rx="22" ry="5" fill="#4a0e22"/><path d="M780 516 Q800 510 818 514" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none"/>
        <path d="M724 372 H916 V548 M724 372 V548" stroke="url(#k-brass)" stroke-width="8" fill="none"/><path d="M724 372 H916 V548 H724 Z" class="o3" fill="none"/>
        <circle class="o3" cx="724" cy="372" r="6" fill="url(#k-brass)"/><circle class="o3" cx="916" cy="372" r="6" fill="url(#k-brass)"/>
        <path d="M744 392 L790 452 M760 386 L812 450 M880 470 L900 500" stroke="#fff" stroke-width="4" opacity=".35"/>
        <rect class="o3" x="852" y="550" width="16" height="12" fill="#2a1a10"/><circle cx="860" cy="555" r="2.5" fill="#d9a441"/>`;
      // a side table with a lace cloth and tea things
      s += `${K.shadow(300, 800, 64, 10)}
        <path class="o" d="M300 712 V792 M262 800 Q282 788 300 782 Q318 788 338 800" stroke="#3a2010" stroke-width="10" fill="none"/><path d="M300 712 V792 M262 800 Q282 788 300 782 Q318 788 338 800" class="o3" fill="none"/>
        <ellipse class="o" cx="300" cy="702" rx="118" ry="22" fill="#6e3f22"/>
        <path class="o3" d="M188 700 Q300 676 412 700 L406 722 Q396 716 386 724 Q376 716 366 724 Q356 716 346 724 Q336 716 326 724 Q316 716 306 724 Q296 716 286 724 Q276 716 266 724 Q256 716 246 724 Q236 716 226 724 Q216 716 206 724 Q196 716 194 720 Z" fill="#f4eee4"/>
        <path d="M200 702 Q300 684 400 702" stroke="#d8cfc0" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
        ${K.shadow(392, 694, 26, 5)}<path class="o3" d="M372 692 C372 664 412 664 412 692 Z" fill="#f4eee4"/><path class="o3" d="M412 676 C424 672 424 686 412 686" fill="none"/><path class="o3" d="M372 680 L356 670" fill="none"/><circle class="o3" cx="392" cy="664" r="4" fill="#d9a441"/><path d="M380 676 h22" stroke="#7b2fd0" stroke-width="3"/>
        <path class="o3" d="M206 690 h22 l-3 10 h-16 Z" fill="#f4eee4"/><ellipse class="o3" cx="217" cy="700" rx="16" ry="4" fill="#f4eee4"/>`;
      s += K.plant(1560, 760, 1.1);
      s += K.dust(230, 190, 620, 520, 16, 3);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
