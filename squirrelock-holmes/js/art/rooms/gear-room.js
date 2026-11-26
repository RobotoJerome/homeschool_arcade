/* Room art: the Gear Room at the top of the Bushy Ben clock tower (Hard story, room 1).
   The great clock face shows the time it stopped (roomState.clock); a small regulator clock still ticks. */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  const f = (v) => v.toFixed(1);
  function gear(cx, cy, r, teeth, fill, hub) {
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) {
      const a = i * Math.PI / teeth, a2 = (i + 1) * Math.PI / teeth, rr = i % 2 ? r : r + 18;
      pts.push(`${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`, `${f(cx + Math.cos(a2 - 0.06) * rr)} ${f(cy + Math.sin(a2 - 0.06) * rr)}`);
    }
    let s = `<path class="o" d="M${pts.join(' L')} Z" fill="${fill}"/>
      <circle cx="${cx}" cy="${cy}" r="${f(r * 0.86)}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="${f(r * 0.06)}"/>
      <path d="M${f(cx - r * 0.75)} ${f(cy - r * 0.45)} A${r * 0.88} ${r * 0.88} 0 0 1 ${f(cx + r * 0.2)} ${f(cy - r * 0.86)}" stroke="#fff6d0" stroke-opacity=".45" stroke-width="${f(Math.max(3, r * 0.05))}" fill="none"/>
      <circle cx="${cx}" cy="${cy}" r="${f(r * 0.72)}" fill="#000" opacity=".22"/>`;
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; s += `<circle class="o3" cx="${f(cx + Math.cos(a) * r * 0.48)}" cy="${f(cy + Math.sin(a) * r * 0.48)}" r="${f(r * 0.14)}" fill="#2a2330"/>`; }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<circle cx="${f(cx + Math.cos(a) * r * 0.27)}" cy="${f(cy + Math.sin(a) * r * 0.27)}" r="${f(Math.max(2, r * 0.025))}" fill="#d9a441"/>`; }
    return s + `<circle class="o" cx="${cx}" cy="${cy}" r="${f(r * 0.2)}" fill="${hub || 'url(#k-brass)'}"/><circle cx="${f(cx - r * 0.06)}" cy="${f(cy - r * 0.06)}" r="${f(r * 0.06)}" fill="#fff6d0" opacity=".7"/>`;
  }
  // a faint gear shape painted into the shadows on the back wall
  function ghostGear(cx, cy, r, teeth) {
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) { const a = i * Math.PI / teeth, rr = i % 2 ? r : r + 12; pts.push(`${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`); }
    return `<path d="M${pts.join(' L')} Z" fill="#000" opacity=".22"/><circle cx="${cx}" cy="${cy}" r="${f(r * 0.5)}" fill="#2c2534" opacity=".6"/>`;
  }
  const rivets = (x, y1, y2) => { let s = ''; for (let y = y1; y < y2; y += 34) s += `<circle cx="${x}" cy="${y}" r="3.5" fill="#8f98aa"/><circle cx="${x - 1}" cy="${y - 1}" r="1.2" fill="#fff" opacity=".7"/>`; return s; };
  SQH.Art.rooms['gear-room'] = {
    name: 'Gear Room',
    spots: {
      window: { x: 235, y: 245, w: 160, h: 210, label: 'High window' },
      door: { x: 145, y: 590, w: 170, h: 260, label: 'Tower door' },
      landing: { x: 270, y: 800, w: 160, h: 60, label: 'Floor by the door' },
      stairs: { x: 480, y: 808, w: 220, h: 80, label: 'Stairs' },
      gears: { x: 700, y: 420, w: 380, h: 380, label: 'Great gears' },
      dial: { x: 1240, y: 360, w: 380, h: 380, label: 'Clock face' },
      ladder: { x: 960, y: 525, w: 100, h: 360, label: 'Ladder' },
      bench: { x: 1180, y: 712, w: 280, h: 60, label: 'Workbench' },
      toolrack: { x: 1500, y: 612, w: 130, h: 170, label: 'Tool rack' },
      peg: { x: 1500, y: 452, w: 110, h: 120, label: 'Wall peg' },
      floor: { x: 760, y: 830, w: 300, h: 60, label: 'Floor' },
    },
    lights: [{ x: 420, y: 240, r: 300 }, { x: 1240, y: 360, r: 340, cool: true }, { x: 1520, y: 250, r: 260 }],
    draw(st) {
      const pid = K.uid('stone');
      let s = `<defs><pattern id="${pid}" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#2c2534"/>
        <path d="M0 0 H120 M0 30 H120 M60 0 V30 M0 30 V60 M120 30 V60" stroke="#1d1824" stroke-width="4"/>
        <rect x="6" y="6" width="48" height="20" fill="#342c3e"/><rect x="66" y="36" width="48" height="20" fill="#342c3e"/><rect x="66" y="6" width="22" height="20" fill="#30293a"/>
        <path d="M8 8 H52 M68 38 H112" stroke="#fff" stroke-opacity=".06" stroke-width="3"/><path d="M20 20 l8 -6 l6 4" stroke="#1d1824" stroke-width="1.5" fill="none"/></pattern></defs>
        <rect width="1600" height="720" fill="url(#${pid})"/><rect width="1600" height="720" fill="url(#k-wallfade)"/>
        <path d="M60 300 q10 20 -4 40 q14 12 2 30" stroke="#1d1824" stroke-width="3" fill="none"/><path d="M1350 520 q-12 16 2 34" stroke="#1d1824" stroke-width="3" fill="none"/>
        <path d="M0 700 q60 -14 120 0 q80 -10 140 2 V720 H0 Z M1380 706 q70 -12 140 0 q40 -6 80 0 V720 H1380 Z" fill="#3e5a3a" opacity=".55"/>`;
      s += ghostGear(330, 120, 90, 14) + ghostGear(1470, 120, 70, 12) + ghostGear(40, 470, 60, 10);
      // iron girders and roof beam
      s += `<path d="M0 26 H1600" stroke="#4a2c18" stroke-width="52"/><path d="M0 52 H1600" class="o3"/><path d="M0 6 H1600" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>
        <rect x="0" y="52" width="1600" height="24" fill="url(#k-under)"/>
        <rect class="o3" x="-4" y="52" width="26" height="660" fill="#3a3a44"/><rect class="o3" x="1578" y="52" width="26" height="660" fill="#3a3a44"/>${rivets(9, 80, 700)}${rivets(1591, 80, 700)}`;
      // cobweb in the corner
      s += `<path d="M22 76 L120 76 M22 76 L22 170 M22 76 L96 150 M22 76 L60 166 M22 76 L114 112" stroke="#d8d4e8" stroke-opacity=".35" stroke-width="1.5"/>
        <path d="M44 76 Q40 92 22 96 M70 76 Q64 108 22 120 M96 76 Q88 128 22 146" stroke="#d8d4e8" stroke-opacity=".3" stroke-width="1.5" fill="none"/>`;
      // floor
      s += `<rect y="720" width="1600" height="180" fill="#3e2616"/>`;
      for (let i = -10; i <= 10; i++) s += `<path d="M${800 + i * 70} 720 L${800 + i * 200} 900" stroke="#2a180c" stroke-width="4"/>`;
      [748, 790, 846].forEach((y) => { s += `<path d="M0 ${y} H1600" stroke="#2a180c" stroke-width="2" opacity=".6"/>`; });
      for (let i = -9; i <= 9; i += 2) s += `<circle cx="${800 + i * 98}" cy="760" r="2.5" fill="#8f98aa" opacity=".6"/><circle cx="${800 + i * 140}" cy="820" r="3" fill="#8f98aa" opacity=".6"/>`;
      s += `<ellipse cx="1180" cy="790" rx="420" ry="70" fill="url(#k-pool)"/><rect y="720" width="1600" height="180" fill="url(#k-floor)"/><rect y="704" width="1600" height="18" fill="#4a2c18" class="o3"/><path d="M0 707 H1600" stroke="#fff" stroke-opacity=".15" stroke-width="3"/>`;
      s += K.lightPool(420, 250, 200, 170) + K.lightPool(1520, 250, 160, 150);
      // the high window
      s += K.window(160, 140, 150, 210, { state: st.window || 'closed', frame: '#3a2a20', seed: 91, curtain: '#5a4a3a', curtain2: '#3e3226' });
      s += K.lamp(420, 200) + K.lamp(1520, 200);
      s += K.portrait(310, 410, 100, 130, { fur: '#8a5a3a', coat: '#5a1a2a', bg: '#2a2236', hat: true });
      // the tower door: planks, iron bands with studs, a ring handle and a brass lock plate
      s += `${K.shadow(145, 722, 100, 10)}<path class="o" d="M60 720 V520 Q145 430 230 520 V720 Z" fill="#5a3320"/>
        <path d="M95 720 V500 M130 720 V478 M165 720 V478 M200 720 V500" stroke="#3a2010" stroke-width="5"/><path d="M74 712 V522" stroke="#fff" stroke-opacity=".12" stroke-width="4"/>
        <path d="M62 560 H228 M62 660 H228" stroke="#2a2a30" stroke-width="14"/>${[80, 112, 146, 180, 212].map((x) => `<circle cx="${x}" cy="560" r="4" fill="#8f98aa"/><circle cx="${x}" cy="660" r="4" fill="#8f98aa"/>`).join('')}
        <rect class="o3" x="190" y="580" width="30" height="44" rx="4" fill="url(#k-brass)"/><circle cx="205" cy="596" r="4" fill="${INK}"/><path d="M203 598 h4 l1 10 h-6 Z" fill="${INK}"/>
        <circle cx="180" cy="610" r="12" fill="none" stroke="#2a2a30" stroke-width="5"/>`;
      // the stairs going down, with a railing
      s += `<path class="o" d="M372 790 H588 L604 852 H356 Z" fill="#140c08"/><path d="M380 806 H580 M376 822 H588 M368 838 H596" stroke="#4a2c18" stroke-width="7"/><path d="M380 803 H580" stroke="#fff" stroke-opacity=".1" stroke-width="2"/>
        <path d="M356 852 V770 M604 852 V770 M356 772 H604" stroke="#3a2010" stroke-width="8"/><path d="M356 852 V770 M604 852 V770 M356 772 H604" class="o3" fill="none"/>
        ${[406, 456, 506, 556].map((x) => `<path d="M${x} 772 V790" stroke="#3a2010" stroke-width="5"/>`).join('')}`;
      // a hanging chain and counterweight
      s += `<path d="M366 76 V306" stroke="#6f7684" stroke-width="6" stroke-dasharray="10 4"/><rect class="o" x="348" y="306" width="36" height="70" rx="6" fill="url(#k-steel)"/><path d="M354 312 V370" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`;
      // the great gears (still: the clock is jammed) and the drive shaft to the clock face
      s += `<path d="M880 300 L1050 352" stroke="#2a2a30" stroke-width="16"/><path d="M880 300 L1050 352" stroke="url(#k-steel)" stroke-width="9"/>`;
      s += K.shadow(640, 640, 200, 20, 0.7);
      s += gear(620, 430, 180, 22, '#8a6a3a') + gear(820, 290, 84, 12, '#a07a3c') + gear(830, 560, 66, 10, '#7a5a30');
      s += `<path d="M905 76 V620" stroke="#a5733f" stroke-width="7"/><path d="M905 76 V620" class="o3"/><path class="o3" d="M897 620 h16 l6 30 h-28 Z" fill="#a5733f"/><path d="M901 650 V668 M909 650 V670 M905 650 V672" stroke="#a5733f" stroke-width="3"/>`;
      // the back of the great clock face, lit from outside, in a riveted iron ring
      s += `<circle cx="1240" cy="360" r="250" fill="url(#k-glow)" opacity=".35"/>
        <circle class="o" cx="1240" cy="360" r="228" fill="#2a2330"/>${Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return `<circle cx="${f(1240 + Math.cos(a) * 218)}" cy="${f(360 + Math.sin(a) * 218)}" r="4" fill="#8f98aa"/>`; }).join('')}
        <circle cx="1240" cy="360" r="210" fill="#f6e2b0"/>
        <circle cx="1240" cy="360" r="210" fill="url(#k-glow)" opacity=".7"/>${K.face(1240, 360, 196, { face: '#f3e3bc', time: st.clock || '9:40', stopped: true })}
        <path d="M1030 360 H1450 M1240 150 V570" stroke="#2a2330" stroke-width="10" opacity=".45"/>`;
      // a small regulator clock that still ticks
      s += `${K.shadow(1050, 222, 52, 8, 0.5)}<rect class="o" x="1000" y="96" width="92" height="124" rx="8" fill="#4a2616"/><path d="M1006 214 V102 H1086" stroke="#fff" stroke-opacity=".15" stroke-width="3" fill="none"/>` + K.face(1046, 140, 30, { time: '11:52' }) + `<rect class="o3" x="1030" y="178" width="32" height="36" rx="4" fill="#1b0f0a"/><g><path d="M1046 180 V204" stroke="url(#k-brass)" stroke-width="2"/><circle cx="1046" cy="206" r="5" fill="url(#k-brass)"/>${K.rock(1046, 180, 10, 1.2)}</g>`;
      // the ladder
      s += `${K.shadow(952, 722, 50, 7)}<path d="M920 720 L968 330 M984 720 L1026 330" stroke="#9a6a3a" stroke-width="10"/><path d="M920 720 L968 330 M984 720 L1026 330" class="o3"/><path d="M924 712 L970 340" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
        ${[680, 620, 560, 500, 440, 380].map((y) => { const t = (720 - y) / 390; return `<path d="M${(920 + 48 * t).toFixed(0)} ${y} H${(984 + 42 * t).toFixed(0)}" stroke="#7a4a22" stroke-width="8"/>`; }).join('')}`;
      // workbench with a vise, an oil can, a rag and spare gears
      s += `${K.shadow(1180, 806, 150, 10)}<path class="o" d="M1040 700 H1320 L1326 718 H1034 Z" fill="#6e3f22"/><path d="M1044 703 H1316" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
        <path d="M1052 718 V800 M1308 718 V800" stroke="#3a2010" stroke-width="12"/><path d="M1052 718 V800 M1308 718 V800" class="o3"/><path d="M1052 770 H1308" stroke="#3a2010" stroke-width="7"/>
        <path class="o3" d="M1260 698 h34 v-20 h-34 Z" fill="#7a7f8a"/><path d="M1268 678 V660 h18" stroke="#7a7f8a" stroke-width="6" fill="none"/><path d="M1294 690 h18" stroke="#3a3a44" stroke-width="5"/>
        <path class="o3" d="M1060 700 v-24 h22 v24 Z M1071 676 L1092 656" fill="#c0302a"/><path class="o3" d="M1088 700 q10 -16 30 -6 q8 6 20 0 l-4 6 Z" fill="#cfc6b2"/>
        <circle class="o3" cx="1236" cy="694" r="8" fill="url(#k-brass)"/><circle class="o3" cx="1222" cy="697" r="5" fill="url(#k-brass)"/>`;
      // tool rack with tools, and a peg above
      s += `${K.shadow(1500, 708, 70, 8)}${K.box(1438, 520, 124, 184, '#5a3320', '#3a2012')}
        <path class="o3" d="M1454 540 v52 h8 v-52 Z" fill="url(#k-steel)"/><path class="o3" d="M1448 534 h20 v10 h-20 Z" fill="url(#k-steel)"/>
        <path class="o3" d="M1484 540 l6 54 h6 l-2 -54 Z" fill="url(#k-steel)"/><rect class="o3" x="1480" y="532" width="22" height="12" rx="3" fill="#7a2430"/>
        <path class="o3" d="M1516 538 h10 v70 h-10 Z" fill="#8a5a2c"/><path class="o3" d="M1510 534 h22 v10 h-22 Z" fill="url(#k-steel)"/>
        <path d="M1446 640 H1554" stroke="#3a2012" stroke-width="5"/><path d="M1460 620 v18 M1500 620 v18 M1540 620 v18" stroke="url(#k-brass)" stroke-width="3"/>
        <path class="o3" d="M1488 420 h24 v18 h-24 Z" fill="#6e3f22"/><circle class="o3" cx="1500" cy="414" r="6" fill="url(#k-brass)"/>`;
      s += K.dust(200, 150, 520, 560, 14, 21);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
