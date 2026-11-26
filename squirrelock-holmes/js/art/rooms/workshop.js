/* Room art: Master Tock's clockmaker's workshop at the foot of the tower (Hard story, room 2). */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  const cuckoo = (cx, cy, c, t, beat) => `${K.shadow(cx + 6, cy + 70, 46, 8, 0.4)}
    <path class="o" d="M${cx - 52} ${cy - 18} L${cx} ${cy - 68} L${cx + 52} ${cy - 18} Z" fill="#3a2010"/><path d="M${cx - 40} ${cy - 24} L${cx} ${cy - 60}" stroke="#fff" stroke-opacity=".15" stroke-width="3"/>
    <path d="M${cx - 30} ${cy - 30} q30 -20 60 0" stroke="#6b3a22" stroke-width="4" fill="none"/>
    <rect class="o" x="${cx - 40}" y="${cy - 22}" width="80" height="86" fill="${c}"/><rect x="${cx + 22}" y="${cy - 20}" width="16" height="82" fill="#000" opacity=".2"/>
    <rect class="o3" x="${cx - 9}" y="${cy - 50}" width="18" height="20" fill="#140a06"/><path class="o3" d="M${cx - 3} ${cy - 44} l6 3 l-6 3 Z" fill="#e8c25a"/>
    <path class="o3" d="M${cx - 44} ${cy + 64} h88 v8 h-88 Z" fill="#3a2010"/><path d="M${cx - 30} ${cy + 50} q12 -10 24 0 q-12 10 -24 0 Z M${cx + 6} ${cy + 50} q12 -10 24 0 q-12 10 -24 0 Z" fill="#2f6b4e"/>
    ${K.face(cx, cy + 16, 24, { time: t })}
    <g><path d="M${cx} ${cy + 72} V${cy + 134}" stroke="url(#k-brass)" stroke-width="3"/><path class="o3" d="M${cx} ${cy + 124} l8 10 l-8 10 l-8 -10 Z" fill="url(#k-brass)"/>${K.rock(cx, cy + 72, 12, beat)}</g>
    <path d="M${cx - 16} ${cy + 72} v28 M${cx + 16} ${cy + 72} v40" stroke="#3a2010" stroke-width="2"/><path class="o3" d="M${cx - 22} ${cy + 100} h12 l-2 18 h-8 Z M${cx + 10} ${cy + 112} h12 l-2 18 h-8 Z" fill="#6b3a22"/>`;
  SQH.Art.rooms['workshop'] = {
    name: 'Clockmaker\'s Workshop',
    spots: {
      coatpeg: { x: 170, y: 540, w: 130, h: 240, label: 'Coat pegs' },
      window: { x: 410, y: 310, w: 220, h: 280, label: 'Window' },
      calendar: { x: 600, y: 330, w: 100, h: 130, label: 'Wall calendar' },
      clocks: { x: 820, y: 250, w: 300, h: 200, label: 'Cuckoo clocks' },
      pinboard: { x: 1150, y: 300, w: 220, h: 170, label: 'Pinboard' },
      shelf: { x: 1420, y: 405, w: 240, h: 130, label: 'Shelf' },
      bench: { x: 780, y: 615, w: 440, h: 70, label: 'Workbench' },
      stove: { x: 1430, y: 680, w: 170, h: 200, label: 'Stove' },
      sack: { x: 1180, y: 735, w: 130, h: 120, label: 'Corner' },
      floor: { x: 600, y: 830, w: 300, h: 60, label: 'Floor' },
    },
    lights: [{ x: 636, y: 190, r: 300 }, { x: 1520, y: 200, r: 260 }, { x: 1430, y: 690, r: 220, fire: true }, { x: 840, y: 560, r: 160 }],
    draw(st) {
      let s = K.shell({ paper: '#3a2e1c', paper2: '#463720', wood: '#5a3a22', wood2: '#462c18', rail: '#6e4526', floor: '#3b2618', floor2: '#28180e', crown: '#241a10', wainY: 530, floorY: 700 });
      s += K.lightPool(636, 200, 220, 170) + K.lightPool(1520, 210, 170, 160) + K.lightPool(1430, 760, 200, 60);
      s += `<text x="820" y="96" text-anchor="middle" class="svg-sign">T. TOCK · CLOCKMAKER</text>`;
      s += K.window(300, 170, 220, 280, { state: st.window || 'closed', curtain: '#2f5a3e', curtain2: '#20402c', seed: 33 });
      s += K.lamp(636, 150) + K.lamp(1520, 160);
      s += K.portrait(1290, 110, 110, 130, { fur: '#a8754a', coat: '#3c2818', bg: '#2a3326' });
      // two small ticking wall clocks
      s += K.wallClock(1080, 176, 20, { time: '2:50' }) + K.wallClock(1196, 168, 18, { time: '7:25', wood: '#2e170c' });
      // coat rail: Tock's work coat, his cap and Wren's scarf
      s += `<rect class="o3" x="96" y="404" width="156" height="16" fill="#6e4526"/><path d="M100 407 H248" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
        <path d="M126 420 v16 M174 420 v16 M222 420 v16" stroke="#3a2010" stroke-width="8"/><circle class="o3" cx="126" cy="438" r="5" fill="url(#k-brass)"/><circle class="o3" cx="174" cy="438" r="5" fill="url(#k-brass)"/><circle class="o3" cx="222" cy="438" r="5" fill="url(#k-brass)"/>
        <path class="o" d="M102 444 Q126 430 150 444 L160 640 Q126 652 92 640 Z" fill="#5a3d26"/><path d="M126 448 V636 M108 500 C106 560 106 600 110 636" stroke="#3c2818" stroke-width="4" fill="none"/><rect class="o3" x="104" y="560" width="22" height="26" fill="#4a3220"/>
        <path class="o3" d="M154 440 C150 420 196 420 194 440 C204 442 206 450 194 452 C178 448 166 448 154 452 Z" fill="#6b5a44"/>
        <path class="o" d="M214 440 C230 480 226 560 236 620 L216 624 C206 570 210 490 200 446 Z" fill="#e0457a"/><path d="M216 624 l-2 14 M224 622 l0 14 M232 620 l2 14" stroke="#e0457a" stroke-width="3"/><path d="M212 470 C218 520 218 570 222 616" stroke="#fff" stroke-opacity=".2" stroke-width="3" fill="none"/>`;
      // cuckoo clocks, each pendulum on its own beat
      s += cuckoo(700, 230, '#6b3a22', '9:12', 1.6) + cuckoo(820, 210, '#7a4a28', '3:45', 1.3) + cuckoo(940, 230, '#5a3220', '6:30', 1.8);
      // pinboard of newspaper clippings
      s += `${K.shadow(1156, 392, 120, 10, 0.5)}<rect class="o" x="1040" y="215" width="220" height="170" rx="4" fill="#8a5a2c"/><rect class="o3" x="1050" y="225" width="200" height="150" fill="#c89a5e"/>
        ${Array.from({ length: 40 }, (_, i) => `<circle cx="${1056 + (i * 37) % 190}" cy="${231 + (i * 53) % 140}" r="1.5" fill="#8a6234"/>`).join('')}
        <g transform="rotate(-4 1092 262)"><rect x="1060" y="236" width="64" height="52" fill="#e8e2d2"/><rect x="1064" y="240" width="56" height="8" fill="#2a2430"/><path d="M1066 256 h46 M1066 264 h40 M1066 272 h44 M1066 280 h30" stroke="#6b6578" stroke-width="2"/></g>
        <g transform="rotate(3 1185 263)"><rect x="1140" y="232" width="90" height="62" fill="#e8e2d2"/><rect x="1146" y="238" width="40" height="30" fill="#9aa0a8"/><path d="M1192 242 h32 M1192 250 h30 M1192 258 h32 M1148 276 h76 M1148 284 h60" stroke="#6b6578" stroke-width="2"/></g>
        <g transform="rotate(2 1109 332)"><rect x="1072" y="304" width="74" height="56" fill="#e8e2d2"/><path d="M1078 316 h60 M1078 326 h54 M1078 336 h60 M1078 346 h40" stroke="#6b6578" stroke-width="2"/></g>
        <g transform="rotate(-3 1201 337)"><rect x="1166" y="312" width="70" height="50" fill="#f3dc8a"/><path d="M1172 324 h56 M1172 334 h50 M1172 344 h40" stroke="#6b6578" stroke-width="2"/></g>
        <circle cx="1092" cy="238" r="4.5" fill="#c0302a" class="o3"/><circle cx="1186" cy="236" r="4.5" fill="#2f6bd0" class="o3"/><circle cx="1108" cy="306" r="4.5" fill="#c0302a" class="o3"/><circle cx="1200" cy="314" r="4.5" fill="#2f6bd0" class="o3"/>`;
      // shelf: jars of screws, a carriage clock and an oil can
      s += `<rect class="o" x="1300" y="452" width="240" height="14" fill="#6e4526"/><path d="M1304 455 H1536" stroke="#fff" stroke-opacity=".2" stroke-width="2"/><path d="M1320 466 l14 20 M1520 466 l-14 20" stroke="#3a2010" stroke-width="7"/>
        <rect class="o3" x="1310" y="404" width="34" height="48" rx="6" fill="#cfe2ff" opacity=".6"/><rect x="1314" y="430" width="26" height="18" fill="#8f98aa"/><rect class="o3" x="1308" y="398" width="38" height="8" fill="#8a5a2c"/>
        <rect class="o3" x="1352" y="414" width="30" height="38" rx="6" fill="#cfe2ff" opacity=".6"/><rect x="1356" y="432" width="22" height="16" fill="#d9a441"/><rect class="o3" x="1350" y="408" width="34" height="8" fill="#8a5a2c"/>
        <path class="o3" d="M1398 452 v-34 q16 -14 32 0 v34 Z" fill="url(#k-brass)"/><circle class="o3" cx="1414" cy="430" r="9" fill="#f4ead2"/><path d="M1414 430 V424 M1414 430 h4" stroke="${INK}" stroke-width="1.5"/>
        <path class="o3" d="M1490 452 v-30 h26 v30 Z M1503 422 L1530 400" fill="#c0302a"/>`;
      // workbench: drawers, a vise, a small lathe, a magnifier lamp, springs and gears
      s += `${K.shadow(780, 712, 250, 14)}
        <path class="o" d="M552 596 H1008 L1016 624 H544 Z" fill="#7a4a28"/><path d="M556 600 H1004" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
        ${K.box(562, 624, 436, 84, '#5a3220', '#3a2012', 2)}
        ${[0, 1, 2].map((i) => `<rect class="o3" x="${584 + i * 140}" y="638" width="120" height="28" rx="3" fill="#4a2816"/><rect class="o3" x="${634 + i * 140}" y="646" width="20" height="8" rx="3" fill="url(#k-brass)"/><rect class="o3" x="${584 + i * 140}" y="672" width="120" height="28" rx="3" fill="#4a2816"/><rect class="o3" x="${634 + i * 140}" y="680" width="20" height="8" rx="3" fill="url(#k-brass)"/>`).join('')}
        <path class="o3" d="M594 596 v-30 h40 v30 M586 566 h56" fill="#7a7f8a"/><path d="M614 566 V544 M600 544 h28" stroke="#7a7f8a" stroke-width="6"/>
        <rect class="o3" x="650" y="570" width="70" height="22" rx="4" fill="#4f5668"/><circle class="o3" cx="664" cy="581" r="9" fill="url(#k-steel)"/><path d="M673 581 H708" stroke="url(#k-steel)" stroke-width="5"/><rect class="o3" x="704" y="574" width="12" height="14" fill="url(#k-brass)"/>
        <path d="M842 596 V540 L872 512" stroke="#3a3a44" stroke-width="6" fill="none"/><circle class="o" cx="880" cy="506" r="20" fill="#cfe2ff" fill-opacity=".35" stroke="url(#k-brass)" stroke-width="5"/><path d="M870 498 a12 12 0 0 1 12 -6" stroke="#fff" stroke-width="3" fill="none"/>
        <circle class="o3" cx="760" cy="590" r="10" fill="url(#k-brass)"/><circle class="o3" cx="782" cy="593" r="6" fill="url(#k-brass)"/><path d="M800 592 c4 -8 8 8 12 0 c4 -8 8 8 12 0 c4 -8 8 8 12 0" stroke="#c9ccd6" stroke-width="3" fill="none"/>
        <path class="o3" d="M960 596 l36 -8 l4 8 l-36 8 Z" fill="#c9ccd6"/>`;
      // a stool in front of the bench, wood shavings on the floor
      s += `${K.shadow(1000, 812, 40, 8)}<ellipse class="o" cx="1000" cy="752" rx="34" ry="10" fill="#7a4a28"/><path d="M978 758 L970 812 M1022 758 L1030 812 M1000 762 V814" stroke="#3a2010" stroke-width="7"/>
        <path d="M640 780 c6 -6 14 -2 12 6 M700 800 c8 -4 12 4 4 8 M560 816 c6 -8 16 -4 10 6" stroke="#e0b878" stroke-width="3" fill="none"/>`;
      // pot-bellied stove with a kettle, and a coal scuttle
      s += `${K.shadow(1430, 780, 90, 12)}<path d="M1430 560 V40" stroke="#1d1a20" stroke-width="22"/><path d="M1430 560 V40" class="o3"/><path d="M1424 560 V60" stroke="#fff" stroke-opacity=".1" stroke-width="3"/>
        <ellipse class="o" cx="1430" cy="680" rx="70" ry="90" fill="#2a2730"/><path d="M1380 640 C1376 680 1380 720 1392 750" stroke="#fff" stroke-opacity=".14" stroke-width="5" fill="none"/>
        <rect class="o" x="1376" y="560" width="108" height="26" rx="6" fill="#1d1a20"/>
        <path class="o3" d="M1450 560 q0 -26 22 -26 q22 0 22 26 Z" fill="#8f98aa"/><path d="M1494 548 l14 -8" stroke="#8f98aa" stroke-width="5"/><path d="M1460 532 q12 -14 24 0" stroke="#3a3a44" stroke-width="3" fill="none"/>
        <rect class="o3" x="1396" y="670" width="68" height="34" rx="6" fill="#140a08"/><g class="ember"><rect x="1402" y="676" width="56" height="22" rx="5" fill="#ff7a2f"/><rect x="1414" y="682" width="32" height="10" rx="4" fill="#ffd27a"/></g>
        <path d="M1380 770 l-16 30 M1480 770 l16 30" stroke="#1d1a20" stroke-width="10"/>
        <path class="o3" d="M1510 800 l10 -40 h44 l6 40 Z" fill="#2a2730"/><path d="M1516 768 q24 -14 48 0" fill="#141018"/><circle cx="1530" cy="764" r="5" fill="#141018"/><circle cx="1546" cy="762" r="6" fill="#141018"/>`;
      s += K.crate(1252, 712, 90, 80);
      s += K.moonPatch(300, 500, 700, 150);
      s += K.dust(320, 180, 560, 500, 14, 41);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
