/* Room art: the waiting room at Paddingtail Station (Hard story, room 3). */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  SQH.Art.rooms['station'] = {
    name: 'Paddingtail Station',
    spots: {
      cloak: { x: 130, y: 545, w: 160, h: 300, label: 'Lost & Found' },
      timetable: { x: 380, y: 300, w: 300, h: 220, label: 'Departures board' },
      notice: { x: 380, y: 468, w: 160, h: 90, label: 'Notice board' },
      window: { x: 820, y: 320, w: 340, h: 300, label: 'Arched window' },
      clock: { x: 1180, y: 150, w: 130, h: 130, label: 'Station clock' },
      booth: { x: 1260, y: 480, w: 240, h: 250, label: 'Ticket booth' },
      bench: { x: 790, y: 692, w: 420, h: 90, label: 'Bench' },
      bin: { x: 450, y: 735, w: 100, h: 100, label: 'Rubbish bin' },
      newsstand: { x: 1490, y: 600, w: 160, h: 240, label: 'Newsstand' },
      floor: { x: 1010, y: 830, w: 300, h: 60, label: 'Floor' },
    },
    lights: [{ x: 562, y: 220, r: 300 }, { x: 1090, y: 220, r: 280 }, { x: 1260, y: 470, r: 220 }],
    draw(st) {
      let s = K.shell({ paper: '#2c3a4a', paper2: '#33455a', wood: '#2e5a4e', wood2: '#27503f', rail: '#a8834a', floor: '#3a3632', floor2: '#2a2724', crown: '#1c2632', wainY: 520, floorY: 700, picRail: false });
      // glazed green tiles below the rail
      for (let x = 0; x < 1600; x += 40) s += `<path d="M${x} 532 V676" stroke="#1f4036" stroke-width="2" opacity=".5"/>`;
      for (let y = 552; y < 676; y += 30) s += `<path d="M0 ${y} H1600" stroke="#1f4036" stroke-width="2" opacity=".45"/>`;
      // stone floor
      s += K.tiles(700, '#34302c', '#45403a');
      s += K.lightPool(562, 230, 220, 180) + K.lightPool(1090, 230, 210, 180) + K.lightPool(1260, 640, 200, 60);
      s += `<text x="820" y="100" text-anchor="middle" class="svg-sign">PADDINGTAIL STATION</text>`;
      // arched window onto the rainy platform, with a steam engine waiting
      const wid = K.uid('plat');
      s += `<path class="o" d="M640 470 V220 A180 100 0 0 1 1000 220 V470 Z" fill="#3a2a20"/>`;
      s += K.window(656, 200, 328, 270, { state: st.window || 'closed', sill: false, frame: '#3a2a20', seed: 57, curtain: '#7a1f2a', curtain2: '#541520' });
      s += `<defs><clipPath id="${wid}"><rect x="672" y="216" width="296" height="238"/></clipPath></defs><g clip-path="url(#${wid})">
          <rect x="672" y="400" width="296" height="54" fill="#1a1d2c"/><path d="M672 408 H968" stroke="#3a3f55" stroke-width="3"/>
          <path d="M700 400 V330 Q700 312 720 312 H860 V400 Z" fill="#161a2e"/><rect x="860" y="290" width="60" height="110" fill="#161a2e"/><rect x="886" y="262" width="18" height="30" fill="#161a2e"/>
          <path d="M700 404 H968" stroke="#0e1020" stroke-width="10"/><circle cx="740" cy="404" r="16" fill="#0e1020"/><circle cx="800" cy="404" r="16" fill="#0e1020"/><circle cx="890" cy="400" r="22" fill="#0e1020"/>
          <rect x="716" y="334" width="22" height="18" fill="#ffc861" opacity=".75"/><rect x="752" y="334" width="22" height="18" fill="#ffc861" opacity=".6"/><rect x="788" y="334" width="22" height="18" fill="#ffc861" opacity=".75"/><rect x="872" y="304" width="18" height="16" fill="#ffc861" opacity=".7"/>
          <g opacity=".55"><circle cx="895" cy="250" r="16" fill="#c8c4dc"/><circle cx="910" cy="232" r="20" fill="#c8c4dc"/><circle cx="932" cy="218" r="24" fill="#c8c4dc"/>${K.slide(30, -20, 6)}</g>
          <rect x="672" y="216" width="296" height="238" fill="url(#k-glass)"/>
        </g>
        <path d="M820 216 V454 M672 340 H968" stroke="#3a2a20" stroke-width="10"/><path d="M820 216 V454 M672 340 H968" class="o3" fill="none"/>`;
      s += `<path class="o" d="M656 214 A164 86 0 0 1 984 214 Z" fill="url(#k-night)"/><path d="M820 214 V130 M820 214 L712 150 M820 214 L928 150" stroke="#3a2a20" stroke-width="8"/>
        <path class="o3" d="M610 470 H1030 V490 H610 Z" fill="#3a2a20"/><path d="M614 473 H1026" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`;
      s += K.lamp(562, 180) + K.lamp(1090, 180);
      // station clock on a bracket
      s += `<path d="M1180 40 V86" stroke="#1d1a20" stroke-width="10"/><path d="M1150 60 H1210" stroke="#1d1a20" stroke-width="8"/><circle class="o" cx="1180" cy="150" r="66" fill="#1d1a20"/><circle cx="1180" cy="150" r="60" fill="none" stroke="url(#k-brass)" stroke-width="4"/>` + K.face(1180, 150, 54, { time: '10:42', face: '#f7f1e0' });
      // departures board
      s += `${K.shadow(386, 420, 150, 10, 0.5)}<rect class="o" x="230" y="190" width="300" height="220" rx="6" fill="#1d2233"/><rect x="230" y="190" width="300" height="40" rx="6" fill="#3b1d73"/><text x="380" y="221" text-anchor="middle" class="svg-sign svg-sign--sm">DEPARTURES</text>
        ${[262, 302, 342].map((y, i) => `<path d="M252 ${y} H420" stroke="#ffd27a" stroke-width="7" opacity=".85"/><path d="M448 ${y} H508" stroke="#fff" stroke-width="7" opacity=".85"/><path d="M252 ${y + 12} H500" stroke="#3a3f55" stroke-width="1.5"/>`).join('')}
        <rect class="o3" x="252" y="370" width="256" height="26" fill="#f4ecd8"/><path d="M268 383 H492" stroke="#5d4b70" stroke-width="4"/><circle class="o3" cx="244" cy="200" r="4" fill="url(#k-brass)"/><circle class="o3" cx="516" cy="200" r="4" fill="url(#k-brass)"/>`;
      // lost & found cupboard
      s += `${K.shadow(130, 702, 96, 10)}${K.box(50, 390, 160, 310, '#5a3320', '#3a2012', 4)}<rect class="o3" x="64" y="430" width="132" height="256" fill="#4a2816"/><path d="M130 430 V686" stroke="#2e170c" stroke-width="4"/>
        <path d="M76 444 V672 M184 444 V672" stroke="#5a3320" stroke-width="3" opacity=".7"/>
        <rect class="o3" x="44" y="352" width="172" height="34" rx="4" fill="#f4ecd8"/><text x="130" y="377" text-anchor="middle" class="svg-sign svg-sign--ink svg-sign--sm">LOST &amp; FOUND</text>
        <circle class="o3" cx="120" cy="560" r="5" fill="url(#k-brass)"/><circle class="o3" cx="140" cy="560" r="5" fill="url(#k-brass)"/><rect class="o3" x="124" y="576" width="12" height="16" rx="2" fill="url(#k-brass)"/>`;
      // ticket and telegraph booth
      s += `${K.shadow(1260, 646, 150, 12)}<path class="o" d="M1120 330 H1400 L1384 300 H1136 Z" fill="#3b1d73"/><rect class="o" x="1130" y="330" width="260" height="310" fill="#5a3320"/>
        <rect x="1340" y="334" width="46" height="302" fill="#3a2012" opacity=".7"/><path d="M1136 636 V336" stroke="#fff" stroke-opacity=".14" stroke-width="4"/>
        <text x="1260" y="324" text-anchor="middle" class="svg-sign svg-sign--sm">TICKETS · TELEGRAPH</text>
        <rect class="o3" x="1160" y="360" width="200" height="170" fill="#2a3a55"/><rect x="1160" y="360" width="200" height="170" fill="url(#k-glow)" opacity=".5"/>
        <rect x="1180" y="380" width="70" height="60" fill="#1d2233" opacity=".8"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${1184 + i * 13}" y="388" width="9" height="44" fill="${['#f2a64a', '#e8e2d2', '#7ad0e8', '#f2a64a', '#e8e2d2'][i]}" opacity=".85"/>`).join('')}
        ${[1185, 1210, 1235, 1260, 1285, 1310, 1335].map((x) => `<path d="M${x} 360 V530" stroke="url(#k-brass)" stroke-width="3"/>`).join('')}
        <path d="M1240 530 Q1260 506 1280 530" stroke="url(#k-brass)" stroke-width="4" fill="none"/>
        <rect class="o" x="1140" y="530" width="240" height="20" fill="#7a4a28"/><path d="M1144 533 H1376" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>
        <path class="o3" d="M1350 530 a9 9 0 0 1 18 0 Z" fill="url(#k-brass)"/>
        <rect class="o3" x="1150" y="570" width="220" height="56" fill="#4a2816"/><path d="M1160 598 q100 -22 200 0" stroke="#5a3220" stroke-width="5" fill="none"/>`;
      // newsstand with papers and magazines
      s += `${K.shadow(1490, 734, 96, 10)}${K.box(1412, 520, 156, 210, '#2f5a3e', '#20402c', 4)}<rect class="o3" x="1404" y="490" width="172" height="34" rx="4" fill="#c0302a"/><text x="1490" y="516" text-anchor="middle" class="svg-sign svg-sign--sm">NEWS</text>
        ${[0, 1, 2].map((i) => `<rect class="o3" x="${1424 + i * 46}" y="548" width="40" height="54" fill="#e8e2d2" transform="rotate(${i * 4 - 4} ${1444 + i * 46} 575)"/><rect x="${1428 + i * 46}" y="554" width="32" height="8" fill="${INK}"/>`).join('')}
        <path d="M1420 630 H1560" stroke="#20402c" stroke-width="5"/>${[0, 1, 2, 3].map((i) => `<rect class="o3" x="${1424 + i * 34}" y="640" width="28" height="38" fill="${['#e0457a', '#3b8ab0', '#ffd23f', '#2f6b4e'][i]}"/><rect x="${1428 + i * 34}" y="646" width="20" height="6" fill="#fff" opacity=".8"/>`).join('')}`;
      s += K.portrait(1405, 160, 110, 140, { fur: '#9c99a8', coat: '#5c2a6e', bg: '#2a2236', hat: true });
      // a trunk and suitcases by the bench
      s += `<g transform="translate(26 0)">${K.shadow(1080, 740, 80, 10)}<rect class="o" x="1030" y="676" width="104" height="62" rx="6" fill="#7a2430"/><path d="M1030 696 H1134 M1056 676 V738 M1108 676 V738" stroke="#d9a441" stroke-width="4"/><rect class="o3" x="1074" y="690" width="16" height="12" fill="url(#k-brass)"/>
        <rect class="o" x="1048" y="636" width="74" height="42" rx="6" fill="#8a5a2c"/><path d="M1072 636 q12 -14 24 0" stroke="#3a2010" stroke-width="5" fill="none"/><path d="M1052 650 H1118" stroke="#fff" stroke-opacity=".2" stroke-width="2"/></g>`;
      // a long slatted bench with iron arms
      s += `${K.shadow(790, 796, 250, 12)}
        <rect class="o" x="560" y="602" width="460" height="20" rx="6" fill="#7a4a28"/><rect class="o" x="560" y="634" width="460" height="20" rx="6" fill="#7a4a28"/><path d="M566 606 H1014 M566 638 H1014" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>
        <rect class="o" x="548" y="684" width="484" height="24" rx="6" fill="#8a5a30"/><path d="M554 688 H1026" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
        <path d="M560 600 C540 640 546 690 572 700 V790 M1020 600 C1040 640 1034 690 1008 700 V790" stroke="#2a2a30" stroke-width="10" fill="none"/><path d="M560 600 C540 640 546 690 572 700 V790 M1020 600 C1040 640 1034 690 1008 700 V790" class="o3" fill="none"/>
        <path d="M790 708 V790" stroke="#2a2a30" stroke-width="10"/>`;
      // rubbish bin
      s += `${K.shadow(450, 806, 46, 8)}<path class="o" d="M412 712 h76 l-8 92 h-60 Z" fill="#5a6070"/><rect class="o3" x="404" y="700" width="92" height="16" rx="4" fill="#6f7684"/><path d="M432 730 V794 M450 730 V794 M468 730 V794" stroke="#454a56" stroke-width="4"/><path d="M418 720 L424 798" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>`;
      s += K.moonPatch(680, 960, 700, 160);
      s += K.dust(660, 210, 520, 500, 14, 61);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
