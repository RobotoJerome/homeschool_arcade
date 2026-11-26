/* Room art: the bank's Counting Room (Medium story, room 2). */
'use strict';
(function (SQH) {
  const K = SQH.Art.K, INK = K.INK;
  const coins = (x, y, nCoins) => { let s = ''; for (let i = 0; i < nCoins; i++) s += `<ellipse class="o3" cx="${x}" cy="${y - i * 5}" rx="11" ry="4" fill="url(#k-brass)"/>`; return s; };
  const sack = (x, y) => `${K.shadow(x, y + 2, 26, 6)}<path class="o" d="M${x - 22} ${y} C${x - 30} ${y - 26} ${x - 16} ${y - 40} ${x - 8} ${y - 42} L${x - 12} ${y - 52} H${x + 12} L${x + 8} ${y - 42} C${x + 16} ${y - 40} ${x + 30} ${y - 26} ${x + 22} ${y} Z" fill="#b89a6a"/><path d="M${x - 10} ${y - 44} H${x + 10}" stroke="#7a5a2c" stroke-width="4"/><text x="${x}" y="${y - 12}" text-anchor="middle" class="svg-plaque">500</text>`;
  SQH.Art.rooms['counting-room'] = {
    name: 'Counting Room',
    spots: {
      window: { x: 200, y: 335, w: 180, h: 290, label: 'Window' },
      clock: { x: 540, y: 190, w: 120, h: 120, label: 'Wall clock' },
      vault: { x: 1060, y: 380, w: 260, h: 260, label: 'Vault door' },
      archive: { x: 1400, y: 445, w: 260, h: 440, label: 'Archive shelves' },
      counter: { x: 820, y: 668, w: 700, h: 100, label: 'Counter' },
      ledger: { x: 620, y: 596, w: 150, h: 50, label: 'Ledger' },
      tray: { x: 850, y: 596, w: 140, h: 50, label: 'Letter tray' },
      inkstand: { x: 1060, y: 592, w: 110, h: 56, label: 'Clerk\'s desk' },
      stool: { x: 380, y: 765, w: 100, h: 110, label: 'Stool' },
      floor: { x: 820, y: 828, w: 400, h: 60, label: 'Floor under the counter' },
    },
    lights: [{ x: 400, y: 290, r: 320 }, { x: 1238, y: 236, r: 280 }, { x: 640, y: 560, r: 180 }],
    draw(st) {
      let s = K.shell({ paper: '#3a2a1c', paper2: '#47331f', wood: '#4e2c1a', wood2: '#3c2012', rail: '#6e3f22', floor: '#34302c', floor2: '#24211e', crown: '#22180f', wainY: 540, floorY: 700 });
      s += K.tiles(700, '#2e2b28', '#57514a');
      s += K.lightPool(400, 280, 220, 180) + K.lightPool(1238, 250, 200, 170);
      s += `<text x="800" y="128" text-anchor="middle" class="svg-sign">COUNTING ROOM</text>`;
      s += K.window(110, 190, 180, 290, { state: st.window || 'closed', curtain: '#5a3a1c', curtain2: '#3e2812' });
      s += K.lamp(400, 250) + K.lamp(1238, 196);
      s += K.wallClock(540, 190, 44, { time: '4:20' });
      s += K.portrait(640, 150, 120, 150, { fur: '#8c5c3a', coat: '#2d2a3a', bg: '#263026' });
      s += K.frame(800, 168, 92, 84, 'notice');
      // the vault door: hinges, bolts, a dial and a spoked wheel
      s += `<circle cx="1060" cy="380" r="156" fill="#000" opacity=".35"/>
        <rect class="o3" x="1192" y="300" width="26" height="40" rx="4" fill="#4a505c"/><rect class="o3" x="1192" y="420" width="26" height="40" rx="4" fill="#4a505c"/>
        <circle class="o" cx="1060" cy="380" r="140" fill="#545b68"/><circle class="o3" cx="1060" cy="380" r="118" fill="#6f7684"/><circle cx="1060" cy="380" r="104" fill="none" stroke="#5a606c" stroke-width="6"/>
        <path d="M940 330 A130 130 0 0 1 1030 252" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none"/>
        ${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<circle cx="${(1060 + Math.cos(a) * 129).toFixed(1)}" cy="${(380 + Math.sin(a) * 129).toFixed(1)}" r="5" fill="url(#k-steel)" class="o3"/>`; }).join('')}
        <circle class="o3" cx="1060" cy="300" r="20" fill="#2a2e38"/><circle cx="1060" cy="300" r="14" fill="url(#k-steel)"/>${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return `<path d="M${(1060 + Math.cos(a) * 15).toFixed(1)} ${(300 + Math.sin(a) * 15).toFixed(1)} L${(1060 + Math.cos(a) * 19).toFixed(1)} ${(300 + Math.sin(a) * 19).toFixed(1)}" stroke="#fff" stroke-width="1.5"/>`; }).join('')}
        <path d="M1060 330 V430 M1010 380 H1110 M1025 345 L1095 415 M1095 345 L1025 415" stroke="url(#k-brass)" stroke-width="10" stroke-linecap="round"/><path d="M1060 330 V430 M1010 380 H1110 M1025 345 L1095 415 M1095 345 L1025 415" class="o3" fill="none"/>
        ${[[1060, 330], [1060, 430], [1010, 380], [1110, 380], [1025, 345], [1095, 415], [1095, 345], [1025, 415]].map(([x, y]) => `<circle class="o3" cx="${x}" cy="${y}" r="7" fill="url(#k-brass)"/>`).join('')}
        <circle class="o" cx="1060" cy="380" r="26" fill="url(#k-brass)"/><circle cx="1054" cy="374" r="7" fill="#fff6d0" opacity=".7"/>`;
      // archive pigeonholes, with year labels
      s += K.shadow(1400, 696, 140, 12) + K.box(1272, 226, 256, 466, '#4a2616', '#2e170c', 6);
      const years = ['1852', '1855', '1859', '1861', '1864', '1866', '1870', '1872'];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
        const x = 1288 + c * 58, y = 244 + r * 86, k = r * 4 + c;
        s += `<rect class="o3" x="${x}" y="${y}" width="50" height="76" fill="#24120a"/><path d="M${x} ${y + 76} H${x + 50}" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
        if (k % 3 === 0) s += `<rect class="o3" x="${x + 6}" y="${y + 30}" width="38" height="40" fill="#b0824a"/><rect x="${x + 10}" y="${y + 40}" width="30" height="14" fill="#f4ecd8"/><text x="${x + 25}" y="${y + 51}" text-anchor="middle" class="svg-plaque">${years[k % years.length]}</text>`;
        else s += `<path class="o3" d="M${x + 6} ${y + 70} v-30 a6 6 0 0 1 12 0 v30 Z M${x + 20} ${y + 70} v-38 a6 6 0 0 1 12 0 v38 Z M${x + 34} ${y + 70} v-26 a5 5 0 0 1 10 0 v26 Z" fill="#f4ecd8"/><path d="M${x + 6} ${y + 52} h12 M${x + 20} ${y + 48} h12" stroke="#b3202a" stroke-width="2"/>`;
      }
      // teller window: brass bars and a sign, on the left part of the counter
      s += `<path d="M470 598 V420 M760 598 V420" stroke="url(#k-brass)" stroke-width="14"/><path d="M470 598 V420 M760 598 V420" class="o3"/>
        <path class="o" d="M462 420 H768 V448 H462 Z" fill="#5a3320"/><text x="615" y="441" text-anchor="middle" class="svg-sign svg-sign--sm">TELLER</text>
        ${[500, 530, 560, 590, 640, 670, 700, 730].map((x) => `<path d="M${x} 448 V560" stroke="url(#k-brass)" stroke-width="4"/>`).join('')}
        <path d="M590 560 Q615 520 640 560" stroke="url(#k-brass)" stroke-width="5" fill="none"/><path d="M470 560 H760" stroke="url(#k-brass)" stroke-width="6"/>
        <path d="M1170 598 V430" stroke="url(#k-brass)" stroke-width="14"/><path d="M1170 598 V430" class="o3"/><circle class="o3" cx="1170" cy="424" r="10" fill="url(#k-brass)"/><circle class="o3" cx="470" cy="414" r="10" fill="url(#k-brass)"/><circle class="o3" cx="760" cy="414" r="10" fill="url(#k-brass)"/>`;
      // the counter, with a brass rail and kick plate, and things on top
      s += `${K.shadow(820, 732, 380, 16)}
        <path class="o" d="M446 594 H1194 L1202 620 H438 Z" fill="#7a4a28"/><path d="M452 598 H1188" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
        ${[0, 1, 2, 3].map((i) => K.box(452 + i * 184, 620, 176, 110, '#5a3220', '#3a2012', 2) + `<rect class="o3" x="${468 + i * 184}" y="636" width="144" height="70" fill="#4a2816"/><path d="M${480 + i * 184} 660 q60 -18 120 0 q-60 18 -120 0 Z" fill="#5a3220"/>`).join('')}
        <rect class="o3" x="446" y="718" width="748" height="12" fill="url(#k-brass)"/>
        <path class="o3" d="M778 590 h144 l-10 -14 h-124 Z" fill="#c9ccd6"/><path d="M790 590 V578 M810 590 V578 M830 590 V578 M850 590 V578 M870 590 V578 M890 590 V578 M910 590 V578" stroke="#8a8f9c" stroke-width="2"/>
        <path class="o3" d="M690 590 h60 M720 590 V548 M692 556 H748" fill="none"/><path class="o3" d="M686 556 l-10 18 h28 Z M754 556 l-10 18 h28 Z" fill="url(#k-brass)"/><circle class="o3" cx="720" cy="546" r="5" fill="url(#k-brass)"/>
        ${coins(520, 590, 5)}${coins(544, 590, 3)}${sack(990, 594)}
        <path class="o3" d="M1030 574 h40 v18 h-40 Z" fill="#1a1520"/><path d="M1050 574 L1066 544" stroke="#f4eee4" stroke-width="3"/><path d="M1040 574 L1030 548" stroke="#f4eee4" stroke-width="3"/>
        <path class="o3" d="M1122 592 a10 10 0 0 1 20 0 Z" fill="url(#k-brass)"/><circle class="o3" cx="1132" cy="579" r="3" fill="url(#k-brass)"/>`;
      // a small lectern at the end of the counter (where the night log is kept)
      s += `${K.shadow(1166, 742, 46, 8)}<path class="o" d="M1124 640 H1208 L1200 662 H1132 Z" fill="#6e3f22"/><path d="M1166 662 V736 M1140 740 L1166 728 L1192 740" stroke="#3a2010" stroke-width="9" fill="none"/><path d="M1166 662 V736" class="o3"/>`;
      // a tall stool
      s += `${K.shadow(380, 814, 50, 9)}<ellipse class="o" cx="380" cy="726" rx="46" ry="12" fill="#6e3f22"/><path d="M350 732 L340 812 M410 732 L420 812 M380 736 V816" stroke="#3a2010" stroke-width="8"/><path d="M350 732 L340 812 M410 732 L420 812" class="o3" fill="none"/><path d="M346 780 H414" stroke="#3a2010" stroke-width="5"/><path d="M344 722 Q380 714 416 722" stroke="#fff" stroke-opacity=".2" stroke-width="3" fill="none"/>`;
      s += K.moonPatch(130, 270, 700, 140);
      s += K.dust(130, 200, 560, 480, 14, 9);
      s += K.finish('r');
      return s;
    },
  };
})(window.SQH);
