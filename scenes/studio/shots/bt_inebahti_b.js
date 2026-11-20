// bt_inebahti_b: more shots for the Lepanto (İnebahtı 1571) video, belgesel style (docs/BELGESEL.md). Uses window.IBK
// from bt_inebahti.js (looked up when a shot is built). The only motion is slow and natural.
//   bt_ib_bell    cues: hit       a bell tower against the sky at dusk; the bell swings slowly, faint sound rings on hit
//   bt_ib_island  P: {mode: "land"|"final", label}  cues: hit   Cyprus: land: Lefkoşa and Magosa light up, a landing
//                 arrow from the south coast; final: the island outlined in gold + label
//   bt_ib_fort    P: {mode: "magosa"|"siege", label}  cues: hit   the sea walls of Famagusta, round towers, the cathedral
//                 behind; siege: camp fires and smoke on the land side, on hit the smoke thins and a pale flag rises
//   bt_ib_seals   P: {mode: "join"|"break"}  cues: hit   a treaty sheet with three wax seals (Papacy, Spain, Venice); join: a
//                 gold cord links them on hit; break: the cord fades, the Venice seal slides away
//   bt_ib_papers  P: {mode: "pay"|"letter", label, sub}  cues: hit   pay: a muster/pay list writes itself (one line turns
//                 gold on hit); letter: a folded letter with a seal
//   bt_ib_council cues: hit       night council in a tent: a hanging lamp, seated figures in a ring, one stands on hit
//   bt_ib_room    P: {labels: [a, b]}  cues: hit   a palace room: a seated figure on a divan, a standing envoy, an arched window
//   bt_ib_flag    P: {label}  cues: hit   a captured banner with a cross, waving slowly in a light pool
//   bt_ib_chain   P: {label}  cues: hit   a rower's chain across an oar loom; on hit the middle link opens, halves drift apart
//   bt_ib_quill   P: {mode: "pen"|"book", label, sub}  cues: hit   pen: quill + inkwell + sheet; book: an open book, title
//   bt_ib_yard    P: {mode: "build"|"launch", label}  cues: hit   the arsenal's vaulted sheds at night; build: a hull's ribs
//                 rise one by one; launch: a finished hull slides slowly into the water
//   bt_ib_anchor  P: {label}  cues: hit   a large anchor with a coiled rope; on hit it turns to silver-gold
//   bt_ib_tally   P: {total, hit, label, note}  cues: hit   a fleet as rows of small boat marks; 'hit' of them fade and sink
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const K = () => window.IBK;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 46, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft, weight: 400 }, o));
  const bgFill = (g, col = C.paper) => P0(g, 'M-600-600L2520-600L2520 2400L-600 2400Z', col, 1);
  const flame = (g, x, y, s = 1) => {
    const o = P0(g, '', C.gold, 0.9), i = P0(g, '', C.ink, 0.85);
    return { update(lt) { const a = 4 * Math.sin(lt * 3.1) * s, b = 3 * Math.sin(lt * 2.3 + 1) * s;
      o.setAttribute('d', `M${f1(x)} ${f1(y)}C${f1(x - 22 * s)} ${f1(y - 4 * s)} ${f1(x - 18 * s + a)} ${f1(y - 40 * s)} ${f1(x + a)} ${f1(y - 62 * s)}C${f1(x + 18 * s + b)} ${f1(y - 40 * s)} ${f1(x + 22 * s)} ${f1(y - 4 * s)} ${f1(x)} ${f1(y)}Z`);
      i.setAttribute('d', `M${f1(x)} ${f1(y - 4 * s)}C${f1(x - 8 * s)} ${f1(y - 8 * s)} ${f1(x - 6 * s + a * 0.5)} ${f1(y - 24 * s)} ${f1(x + a * 0.5)} ${f1(y - 34 * s)}C${f1(x + 6 * s + b * 0.5)} ${f1(y - 24 * s)} ${f1(x + 8 * s)} ${f1(y - 8 * s)} ${f1(x)} ${f1(y - 4 * s)}Z`); } };
  };

  // ------------------------------------------------------------------ bt_ib_bell
  SH.bt_ib_bell = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 960, 380, 620, C.stain, 0.18, g);
      const st = BTL.stars(g, 70, 9, [0, 0, 1920, 560]);
      // low roofs and the campanile
      P0(g, 'M-100 1200L-100 800L180 800L260 740L420 740L480 790L700 790L760 720L820 790L1120 790L1180 760L1380 760L1440 800L2020 800L2020 1200Z', C.paperDark, 1);
      const T = 'M860 800L860 330L1060 330L1060 800Z', top = 'M840 330L1080 330L1080 300L840 300ZM860 300L960 170L1060 300Z';
      P0(g, T, C.paperLight, 1); L0(g, T, C.ink, 3.5); P0(g, top, C.paperLight, 1); L0(g, top, C.ink, 3.5);
      P0(g, 'M890 330L890 480C890 520 1030 520 1030 480L1030 330Z', C.paperDark, 1); L0(g, 'M890 500L890 340M1030 340L1030 500M890 480C890 520 1030 520 1030 480', C.ink, 3);
      L0(g, 'M880 560L1040 560M880 680L1040 680M930 610h60v60h-60Z', C.inkSoft, 2);
      L0(g, 'M960 170L960 120M940 140L980 140', C.ink, 3);
      const bell = el(g, 'g');
      const B = 'M-44 70C-40 30-34 10-26 0C-14-10 14-10 26 0C34 10 40 30 44 70C50 76 50 82 0 82C-50 82-50 76-44 70Z';
      P0(bell, B, C.gold, 0.85); L0(bell, B, C.ink, 3); L0(bell, 'M0-10L0-24', C.ink, 4);
      const rings = [0, 1, 2].map(() => L0(g, '', C.inkSoft, 2.5, 0));
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const a = 16 * Math.sin(lt * 1.3);
          bell.setAttribute('transform', `translate(960 360) rotate(${f1(a)})`);
          const hit = cue(cues, 'hit', dur * 0.3);
          rings.forEach((e, i) => { const p = ((lt - hit) * 0.35 + i / 3) % 1; const on = lt > hit;
            const r = 120 + p * 520; e.setAttribute('d', `M${f1(960 - r)} ${f1(420 - r * 0.15)}A${f1(r)} ${f1(r * 0.9)} 0 0 1 ${f1(960 + r)} ${f1(420 - r * 0.15)}`); e.setAttribute('stroke-opacity', f1(on ? 0.5 * (1 - p) : 0)); });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_island: Cyprus
  const CY = [[32.27, 35.1], [32.33, 34.95], [32.4, 34.76], [32.55, 34.68], [32.8, 34.66], [33.03, 34.57], [33.12, 34.66], [33.25, 34.7], [33.5, 34.82], [33.63, 34.9], [33.85, 34.95], [34.08, 34.97], [33.98, 35.05], [33.95, 35.12], [33.93, 35.25], [34.05, 35.38], [34.35, 35.52], [34.59, 35.69], [34.45, 35.63], [34.1, 35.48], [33.85, 35.4], [33.6, 35.37], [33.32, 35.34], [33.05, 35.36], [32.92, 35.41], [32.88, 35.25], [32.85, 35.18], [32.7, 35.18], [32.55, 35.17], [32.42, 35.05], [32.32, 35.08]];
  SH.bt_ib_island = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'land', g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 960, 500, 760, C.stain, 0.14, g);
      const l0 = 32.1, l1 = 34.75, b0 = 34.4, b1 = 35.85, k = Math.cos(35 * Math.PI / 180);
      const s = Math.min(1640 / ((l1 - l0) * k), 760 / (b1 - b0)), ox = 960 - (l1 - l0) * k * s / 2, oy = 470 - (b1 - b0) * s / 2;
      const X = l => ox + (l - l0) * k * s, Y = b => oy + (b1 - b) * s;
      const smooth = pts => { let d = `M${f1(X(pts[0][0]))} ${f1(Y(pts[0][1]))}`; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2; d += `Q${f1(X(a[0]))} ${f1(Y(a[1]))} ${f1(mx)} ${f1(my)}`; } return d + 'Z'; };
      const isl = smooth(CY);
      // faint Anatolian coast along the top
      P0(g, `M-100-100L2020-100L2020 40C1700 70 1400 30 1100 60C800 90 500 50 200 70C60 80-40 70-100 70Z`, C.paperLight, 0.6);
      if (mode === 'land') ital(g, 'Anadolu', 960, 56, 40).setAttribute('opacity', 0.8);
      P0(g, isl, C.paperLight, 0.95);
      const coast = L0(g, isl, C.inkSoft, 3, 1, { pathLength: 1 });
      const gold = L0(g, isl, C.gold, 4.5, 0, { pathLength: 1 });
      // the Troodos mountains: a few soft ridge strokes
      L0(g, `M${X(32.7)} ${Y(34.95)}c40-30 80-30 120 0M${X(32.85)} ${Y(34.88)}c40-26 70-26 110 0`, C.inkSoft, 2, 0.6);
      const pin = (lon, lat, t, sub, anchor = 'start') => {
        const x = X(lon), y = Y(lat), pg = el(g, 'g', { opacity: 0 });
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const ax = anchor === 'end' ? x - 34 : x + 34;
        const a = svgText(pg, t, ax, y + 16, 54, { fill: C.ink, 'font-family': FR, 'font-weight': 400, 'text-anchor': anchor, stroke: C.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' });
        if (sub) svgText(pg, sub, ax, y + 66, 40, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic', 'text-anchor': anchor, stroke: C.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' });
        return { pg, ring };
      };
      const pins = mode === 'land' ? [pin(33.36, 35.17, 'Lefkoşa', '1570', 'end'), pin(33.94, 35.12, 'Magosa', '1571', 'start')] : [];
      const arrow = mode === 'land' ? L0(g, `M${X(33.62)} ${Y(34.5)}C${X(33.62)} ${Y(34.7)} ${X(33.55)} ${Y(34.8)} ${X(33.6)} ${Y(34.88)}`, C.gold, 4, 1, { pathLength: 1 }) : null;
      const lab = mode === 'final' && P.label ? label(g, P.label, 960, 880, 76, { color: C.gold, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          draw(coast, BTL.ease(lt, 0, 2));
          const hit = cue(cues, 'hit', dur * 0.45);
          if (arrow) draw(arrow, BTL.ease(lt, 0.8, 1.6));
          pins.forEach((q, i) => { const at = i === 0 ? hit : hit + 1.4; fade(q.pg, BTL.ease(lt, at - 0.2, 1)); const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6; q.ring.setAttribute('r', f1(14 + 26 * ph)); q.ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.8 * (lt > at ? 1 : 0))); });
          if (mode === 'final') { draw(gold, BTL.ease(lt, hit - 0.4, 2.4)); gold.setAttribute('stroke-opacity', 1); fade(lab, BTL.ease(lt, hit, 1.2)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_fort: Famagusta's sea walls
  SH.bt_ib_fort = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'magosa', g = el(svg, 'g'); bgFill(g);
      const st = BTL.stars(g, 60, 21, [0, 0, 1920, 420]);
      BTL.glow(svg, defs, 960, 520, 680, C.stain, 0.16, g);
      const HY = 800;
      // the cathedral (Gothic, two truncated towers) behind the walls
      const cath = 'M820 600L820 420L860 420L860 360L920 360L920 420L1000 420L1000 360L1060 360L1060 420L1100 420L1100 600Z';
      P0(g, cath, C.paperLight, 0.8); L0(g, cath, C.inkSoft, 2.5);
      L0(g, 'M960 600L960 470M930 470C930 430 990 430 990 470M880 560L880 480M1040 560L1040 480', C.inkSoft, 2);
      // walls with round towers; a bastion on the right
      let wall = 'M200 800L200 600L1720 600L1720 800Z';
      P0(g, wall, C.paperLight, 1);
      L0(g, 'M200 800L200 600L1720 600L1720 800', C.ink, 3.5);
      let cren = ''; for (let x = 210; x < 1720; x += 40) cren += `M${x} 600v-18h20v18`;
      L0(g, cren, C.ink, 2.5);
      for (const x of [200, 560, 960, 1360, 1720]) { const d = `M${x - 70} 800L${x - 70} 560C${x - 70} 520 ${x + 70} 520 ${x + 70} 560L${x + 70} 800Z`; P0(g, d, C.paper, 1); L0(g, d, C.ink, 3.5); L0(g, `M${x - 12} 640h24v36h-24Z`, C.inkSoft, 2); }
      L0(g, 'M220 700L1700 700M220 760L1700 760', C.inkSoft, 1.6, 0.5);
      const s = K().sea(g, HY, 61, { n: 8, depth: 260 });
      // flag on the middle tower
      const pole = L0(g, 'M960 530L960 380', C.ink, 4);
      const flag = P0(g, '', C.paperLight, 0.95), frim = L0(g, '', C.inkSoft, 2.5);
      const lab = P.label ? ital(g, P.label, 960, 880, 50, { color: C.ink }) : null;
      // siege: fires and smoke beyond the walls (to the left, on land)
      const sm = mode === 'siege' ? [K().smoke(g, 360, 590, 71, { h: 480, r: 70, a: 0.24, lean: 140 }), K().smoke(g, 1520, 590, 73, { h: 520, r: 80, a: 0.24, lean: 120 }), K().smoke(g, 760, 590, 77, { h: 400, r: 60, a: 0.2, lean: 100 })] : [];
      const fires = mode === 'siege' ? [flame(g, 360, 600, 0.8), flame(g, 1520, 600, 0.9), flame(g, 760, 600, 0.7)] : [];
      return {
        update(lt, dur, cues) {
          st.update(lt); s.update(lt);
          const hit = cue(cues, 'hit', dur * 0.5), end = mode === 'siege' ? BTL.ease(lt, hit, 2.5) : 0;
          sm.forEach(q => q.update(lt, 1 - 0.75 * end)); fires.forEach(f => f.update(lt));
          // the flag waves; in the siege it rises only on hit (a pale flag of surrender)
          const show = mode === 'siege' ? end : 1, top = 380 + (1 - show) * 110;
          const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, w = 10 * u * Math.sin(lt * 1.3 - u * 4); pts.push([960 + u * 170, top + w, top + 100 + w]); }
          const d = 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'L' + pts.slice().reverse().map(p => f1(p[0]) + ' ' + f1(p[2])).join('L') + 'Z';
          flag.setAttribute('d', d); frim.setAttribute('d', d); fade(flag, show); fade(frim, show);
          if (lab) fade(lab, BTL.ease(lt, mode === 'siege' ? 0.6 : hit - 0.2, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_seals: the treaty with three seals
  const sealEmblem = (g, x, y, kind) => {
    if (kind === 0) L0(g, `M${x - 26} ${y + 26}L${x + 26} ${y - 26}M${x + 26} ${y + 26}L${x - 26} ${y - 26}M${x + 18} ${y - 34}a8 8 0 1 0 0.1 0M${x - 18} ${y - 34}a8 8 0 1 0 0.1 0`, C.paperDark, 5);
    else if (kind === 1) L0(g, `M${x - 26} ${y + 28}L${x - 26} ${y - 14}L${x - 12} ${y - 14}L${x - 12} ${y - 28}L${x + 12} ${y - 28}L${x + 12} ${y - 14}L${x + 26} ${y - 14}L${x + 26} ${y + 28}ZM${x - 6} ${y + 28}L${x - 6} ${y + 8}L${x + 6} ${y + 8}L${x + 6} ${y + 28}`, C.paperDark, 4);
    else L0(g, `M${x - 30} ${y + 20}C${x - 20} ${y - 10} ${x} ${y - 20} ${x + 10} ${y - 34}M${x + 10} ${y - 34}C${x + 30} ${y - 30} ${x + 30} ${y - 10} ${x + 16} ${y}M${x - 30} ${y + 20}L${x + 28} ${y + 20}M${x - 10} ${y - 6}C${x - 30} ${y - 30} ${x - 40} ${y - 30} ${x - 46} ${y - 40}`, C.paperDark, 4);
  };
  SH.bt_ib_seals = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'join', g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 960, 470, 700, C.stain, 0.2, g);
      const sheet = 'M520 140L1400 130L1410 820L510 830Z';
      P0(g, sheet, C.paperLight, 1); L0(g, sheet, C.ink, 3);
      const lines = []; for (let i = 0; i < 7; i++) lines.push(L0(g, `M600 ${220 + i * 46}L${1320 - (i % 3) * 60} ${218 + i * 46}`, C.inkSoft, 3, 0.8, { pathLength: 1 }));
      const xs = [700, 960, 1220], names = ['Papalık', 'İspanya', 'Venedik'];
      const cord = L0(g, 'M700 640C780 700 880 700 960 640C1040 700 1140 700 1220 640', C.gold, 5, 1, { pathLength: 1 });
      const cordL = L0(g, 'M700 640C780 700 880 700 960 640', C.gold, 5, 1, { pathLength: 1 }), endA = L0(g, '', C.gold, 5, 1);
      if (mode === 'join') { fade(cordL, 0); fade(endA, 0); }
      const seals = xs.map((x, i) => {
        const sg = el(g, 'g');
        P0(sg, BTL.E(x, 640, 70, 70), C.red, 0.85); L0(sg, BTL.E(x, 640, 70, 70), C.ink, 3); L0(sg, BTL.E(x, 640, 54, 54), C.paperDark, 2, 0.6);
        sealEmblem(sg, x, 640, i);
        const t = ital(sg, names[i], x, 770, 44, { color: C.ink }); t.setAttribute('opacity', 1);
        if (i === 2) sg.__end = L0(sg, 'M1220 640C1190 690 1160 700 1130 712', C.gold, 5, mode === 'join' ? 0 : 1);
        return sg;
      });
      const endB = seals[2].__end;
      return {
        update(lt, dur, cues) {
          lines.forEach((e, i) => draw(e, BTL.ease(lt, 0.1 + i * 0.15, 0.8)));
          const hit = cue(cues, 'hit', dur * 0.45);
          seals.forEach((sg, i) => fade(sg, BTL.ease(lt, 0.6 + i * 0.4, 0.8)));
          if (mode === 'join') { draw(cord, BTL.ease(lt, hit - 0.2, 1.6)); }
          else {
            fade(cord, 0); draw(cordL, 1);
            const p = BTL.ease(lt, hit - 0.3, 1.6), q = BTL.ease(lt, hit - 0.3, 0.8);
            for (const e of [endA, endB]) e.setAttribute('stroke-opacity', f1(0.6 + 0.4 * q));
            endA.setAttribute('d', `M960 640C1000 ${f1(670 + 30 * q)} 1030 ${f1(690 + 50 * q)} 1060 ${f1(700 + 70 * q)}`);
            seals[2].setAttribute('transform', `translate(${f1(560 * p)} ${f1(140 * p)}) rotate(${f1(16 * p)} 1220 640)`);
            fade(seals[2], 1 - 0.35 * p);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_papers
  SH.bt_ib_papers = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'pay', g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 900, 470, 680, C.stain, 0.2, g);
      const R = [];
      if (mode === 'pay') {
        // two overlapping pages; the front one is a pay list: names, dots, sums
        const back = 'M560 170L1180 150L1200 840L580 860Z', front = 'M700 130L1340 140L1330 850L690 840Z';
        P0(g, back, C.paperLight, 0.7); L0(g, back, C.inkSoft, 2.5);
        P0(g, front, C.paperLight, 1); L0(g, front, C.ink, 3);
        const head = label(g, '1571', 1020, 230, 66, { weight: 400 });
        const rows = [], r = rng(5);
        for (let i = 0; i < 11; i++) {
          const y = 300 + i * 46, w = 220 + r() * 160;
          const a = L0(g, `M760 ${y}c${f1(w * 0.3)} -6 ${f1(w * 0.6)} 4 ${f1(w)} -2`, i === 5 ? C.gold : C.inkSoft, i === 5 ? 4 : 3, 1, { pathLength: 1 });
          const b = L0(g, `M${f1(780 + w + 30)} ${y}L1170 ${y}`, C.inkSoft, 1.6, 0.5, { pathLength: 1, 'stroke-dasharray': '0.01 0.03' });
          const c = L0(g, `M1190 ${y}c20 -6 50 4 80 -2`, C.ink, 3, 1, { pathLength: 1 });
          rows.push({ a, b, c, i });
        }
        const lab = P.label ? ital(g, P.label, 400, 470, 50, { color: C.ink }) : null, sub = P.sub ? ital(g, P.sub, 400, 530, 42) : null;
        R.push((lt, dur, cues) => {
          fade(head, BTL.ease(lt, 0.2, 1));
          rows.forEach(q => { const t0 = 0.4 + q.i * 0.28; draw(q.a, BTL.ease(lt, t0, 0.6)); draw(q.c, BTL.ease(lt, t0 + 0.3, 0.4)); fade(q.b, BTL.ease(lt, t0 + 0.2, 0.4)); });
          const hit = cue(cues, 'hit', dur * 0.5);
          rows[5].a.setAttribute('stroke-opacity', f1(0.5 + 0.5 * BTL.ease(lt, hit, 1)));
          if (lab) fade(lab, BTL.ease(lt, hit - 0.3, 1)); if (sub) fade(sub, BTL.ease(lt, hit + 0.2, 1));
        });
      } else {
        // a folded letter, the seal in the middle
        const L = 'M620 250L1300 230L1320 760L640 780Z';
        P0(g, L, C.paperLight, 1); L0(g, L, C.ink, 3);
        L0(g, 'M630 510L1310 495M970 240L980 770', C.inkSoft, 2, 0.6);
        const lines = []; for (let i = 0; i < 4; i++) lines.push(L0(g, `M700 ${310 + i * 44}L${1220 - i * 50} ${302 + i * 44}`, C.inkSoft, 3, 0.8, { pathLength: 1 }));
        const seal = el(g, 'g'); P0(seal, BTL.E(975, 505, 62, 62), C.red, 0.85); L0(seal, BTL.E(975, 505, 62, 62), C.ink, 3); L0(seal, 'M950 520l25-40 25 40Z', C.paperDark, 3);
        const lab = P.label ? ital(g, P.label, 975, 860, 50, { color: C.ink }) : null, sub = P.sub ? label(g, P.sub, 975, 180, 52, { weight: 400 }) : null;
        R.push((lt, dur, cues) => {
          lines.forEach((e, i) => draw(e, BTL.ease(lt, 0.2 + i * 0.3, 0.9)));
          const hit = cue(cues, 'hit', dur * 0.5);
          fade(seal, BTL.ease(lt, 0.6, 1));
          seal.setAttribute('transform', `translate(0 ${f1(-3 * BTL.ease(lt, hit, 1))})`);
          if (lab) fade(lab, BTL.ease(lt, 0.8, 1)); if (sub) fade(sub, BTL.ease(lt, hit - 0.2, 1));
        });
      }
      return { update(lt, dur, cues) { R.forEach(f => f(lt, dur, cues)); } };
    },
  };

  // ------------------------------------------------------------------ bt_ib_council: night council in a tent
  SH.bt_ib_council = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g, C.paperDark);
      const gl = BTL.glow(svg, defs, 960, 420, 620, C.gold, 0.16, g);
      // tent: a high central pole, sloping walls
      const tent = 'M260 860L560 260L960 120L1360 260L1660 860Z';
      P0(g, tent, C.paper, 1); L0(g, 'M260 860L560 260L960 120L1360 260L1660 860', C.inkSoft, 3);
      L0(g, 'M960 120L960 860M560 260L620 860M1360 260L1300 860', C.inkSoft, 2, 0.6);
      P0(g, 'M200 860L1720 860L1720 1200L200 1200Z', C.paperDark, 1); L0(g, 'M200 860L1720 860', C.inkSoft, 2);
      // the hanging lamp
      L0(g, 'M960 120L960 330', C.inkSoft, 2);
      const lamp = 'M930 330L990 330L980 380L940 380Z';
      P0(g, lamp, C.paperLight, 1); L0(g, lamp, C.ink, 2.5);
      const fl = flame(g, 960, 372, 0.6);
      // seated figures in a ring, one stands on hit
      const seat = [[560, 860, 1], [720, 860, 1], [1200, 860, -1], [1360, 860, -1]];
      seat.forEach(([x, y, fc]) => BTL.person(g, 'sit', x, y, 230, { face: fc }));
      const sitting = BTL.person(g, 'sit', 900, 860, 240, { face: 1 });
      const standing = BTL.person(g, 'stand', 900, 860, 300, { face: 1 });
      return {
        update(lt, dur, cues) {
          fl.update(lt); gl.set(0.14 + 0.03 * Math.sin(lt * 1.7));
          const hit = cue(cues, 'hit', dur * 0.5), p = BTL.ease(lt, hit, 1.6);
          fade(sitting, 1 - p); fade(standing, p);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_room: the grand vizier receives the envoy
  SH.bt_ib_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      // an arched window with a lattice, light falling in
      const win = 'M820 560L820 240C820 130 1100 130 1100 240L1100 560Z';
      P0(g, win, C.paperLight, 0.9); L0(g, win, C.ink, 3);
      let lat = ''; for (let x = 860; x < 1100; x += 40) lat += `M${x} 170L${x} 560`; for (let y = 260; y < 560; y += 50) lat += `M820 ${y}L1100 ${y}`;
      L0(g, lat, C.inkSoft, 1.6, 0.6);
      const gl = BTL.glow(svg, defs, 960, 520, 560, C.stain, 0.22, g);
      P0(g, 'M-100 760L2020 760L2020 1200L-100 1200Z', C.paperDark, 1); L0(g, 'M-100 760L2020 760', C.inkSoft, 2);
      // the divan
      const div = 'M300 760L300 650L780 650L780 760Z';
      P0(g, div, C.paperLight, 1); L0(g, div, C.ink, 3); L0(g, 'M300 685L780 685', C.inkSoft, 2);
      const a = BTL.person(g, 'sit', 500, 680, 320, { face: 1 });
      const b = BTL.person(g, 'stand', 1380, 760, 400, { face: -1 });
      L0(g, 'M1660 120L1660 520', C.inkSoft, 2); const lamp = flame(g, 1660, 586, 0.6); L0(g, 'M1630 520L1690 520L1680 590L1640 590Z', C.ink, 2.5);
      const L = P.labels || [];
      const la = L[0] ? ital(g, L[0], 540, 850, 50, { color: C.ink }) : null, lb = L[1] ? ital(g, L[1], 1360, 850, 50, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          lamp.update(lt); gl.set(0.2 + 0.03 * Math.sin(lt * 0.9));
          const hit = cue(cues, 'hit', dur * 0.5);
          fade(a, BTL.ease(lt, 0, 1.2)); fade(b, BTL.ease(lt, 0.4, 1.2));
          b.setAttribute('transform', `translate(${f1(1420 - 40 * BTL.ease(lt, 0.4, 3))} 760)`);
          if (la) fade(la, BTL.ease(lt, 0.8, 1)); if (lb) fade(lb, BTL.ease(lt, hit, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_flag: the captured banner
  SH.bt_ib_flag = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 1000, 440, 620, C.stain, 0.22, g);
      L0(g, 'M560 140L560 900', C.ink, 6); P0(g, BTL.E(560, 128, 14, 14), C.gold, 1);
      const flag = P0(g, '', C.red, 0.75), rim = L0(g, '', C.ink, 3), cross = P0(g, '', C.paperLight, 0.95), crim = L0(g, '', C.ink, 2);
      const lab = P.label ? ital(g, P.label, 1000, 920, 50, { color: C.ink }) : null;
      const fw = 820, fh = 540, x0 = 560, y0 = 160;
      const pt = (u, v, lt) => { const w = 26 * u * Math.sin(lt * 1.1 - u * 4.5); return [x0 + u * fw, y0 + v * fh + w + u * 30 * v]; };
      return {
        update(lt, dur, cues) {
          const ring = []; for (let i = 0; i <= 12; i++) ring.push(pt(i / 12, 0, lt)); for (let i = 12; i >= 0; i--) ring.push(pt(i / 12, 1, lt));
          const d = 'M' + ring.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
          flag.setAttribute('d', d); rim.setAttribute('d', d);
          // a cross (white) across the banner
          const cx = 0.42, cyv = 0.5, hw = 0.06, hh = 0.09;
          const Q = (u, v) => pt(u, v, lt).map(f1).join(' ');
          let cd = 'M' + [Q(cx - hw, 0.08), Q(cx + hw, 0.08), Q(cx + hw, cyv - hh), Q(0.92, cyv - hh), Q(0.92, cyv + hh), Q(cx + hw, cyv + hh), Q(cx + hw, 0.92), Q(cx - hw, 0.92), Q(cx - hw, cyv + hh), Q(0.08, cyv + hh), Q(0.08, cyv - hh), Q(cx - hw, cyv - hh)].join('L') + 'Z';
          cross.setAttribute('d', cd); crim.setAttribute('d', cd);
          const a = BTL.ease(lt, 0, 1.4); for (const e of [flag, rim, cross, crim]) fade(e, a);
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.4) - 0.2, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_chain
  SH.bt_ib_chain = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      const gl = BTL.glow(svg, defs, 960, 470, 600, C.stain, 0.2, g);
      // the oar loom (a thick wooden bar) at the bottom
      const loom = 'M200 690L1720 650L1724 720L204 760Z';
      P0(g, loom, C.paperLight, 1); L0(g, loom, C.ink, 3); L0(g, 'M260 712L1660 676', C.inkSoft, 2, 0.6);
      // links: alternating side-on (ellipse) and edge-on (bar); the middle one opens
      const links = [], n = 11;
      for (let i = 0; i < n; i++) {
        const x = 420 + i * 108, y = 470 + 30 * Math.sin(i * 0.5), lg = el(g, 'g');
        if (i % 2 === 0) { L0(lg, BTL.E(0, 0, 70, 38), C.ink, 12, 1); L0(lg, BTL.E(0, 0, 70, 38), C.paperLight, 5, 1); }
        else { L0(lg, 'M-60 0L60 0', C.ink, 16, 1); L0(lg, 'M-60 0L60 0', C.paperLight, 7, 1); }
        links.push({ lg, x, y, i });
      }
      const lab = P.label ? label(g, P.label, 960, 250, 96, { color: C.gold, weight: 300 }) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.4), p = BTL.ease(lt, hit, 3);
          gl.set(0.18 + 0.08 * p);
          links.forEach(q => {
            const side = q.i < 5 ? -1 : q.i > 5 ? 1 : 0, dx = side * 70 * p, dy = Math.abs(side) * 30 * p;
            const rot = q.i === 5 ? 40 * p : side * 6 * p;
            q.lg.setAttribute('transform', `translate(${f1(q.x + dx)} ${f1(q.y + dy + 3 * Math.sin(lt * 0.8 + q.i))}) rotate(${f1(rot)})`);
            fade(q.lg, BTL.ease(lt, 0.1 + q.i * 0.06, 0.8) * (q.i === 5 ? 1 - 0.7 * p : 1));
          });
          if (lab) fade(lab, BTL.ease(lt, hit, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_quill
  SH.bt_ib_quill = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'pen', g = el(svg, 'g'); bgFill(g);
      const gl = BTL.glow(svg, defs, 960, 480, 640, C.gold, 0.12, g);
      P0(g, 'M-100 760L2020 760L2020 1200L-100 1200Z', C.paperDark, 1); L0(g, 'M-100 760L2020 760', C.inkSoft, 2);
      const R = [];
      const candle = flame(g, 1560, 470, 1);
      L0(g, 'M1530 480L1530 760L1590 760L1590 480Z', C.ink, 3); P0(g, 'M1530 480L1590 480L1590 760L1530 760Z', C.paperLight, 0.9);
      if (mode === 'pen') {
        const sheet = 'M520 700L1180 680L1220 760L480 780Z';
        P0(g, sheet, C.paperLight, 1); L0(g, sheet, C.ink, 3);
        const ink = 'M1240 760L1250 640L1350 640L1360 760Z'; P0(g, ink, C.paperDark, 1); L0(g, ink, C.ink, 3); L0(g, 'M1260 640L1260 620L1340 620L1340 640', C.ink, 3);
        const D = BTL.drawing(el(g, 'g'));
        // one feather: a bare quill near the nib, then a single vane along the shaft
        const shaft = 'M1298 624C1220 500 1110 350 960 210';
        const vane = 'M1215 495C1170 410 1110 330 1030 260C990 226 960 210 960 210C1000 250 1040 300 1080 350C1020 300 960 270 905 255C960 320 1050 400 1150 470C1175 488 1200 494 1215 495Z';
        D.f(vane, C.paperLight, 1); D.s(vane, { w: 3 }); D.s(shaft, { w: 3.5 });
        let barbs = ''; for (let k = 0; k < 7; k++) { const t = k / 7, x = lerp(1190, 990, t), y = lerp(470, 240, t); barbs += `M${f1(x)} ${f1(y)}l${f1(-50 - 30 * Math.sin(Math.PI * t))} ${f1(-14 - 6 * t)}`; }
        D.s(barbs, { w: 1.8, color: C.inkSoft });
        // the name written on the sheet itself
        const lab = P.label ? ital(g, P.label, 850, 752, 44, { color: C.ink }) : null;
        if (lab) lab.setAttribute('transform', 'rotate(-1.5 850 752)');
        R.push((lt, dur, cues) => { D.reveal(BTL.ease(lt, 0, 2.4)); if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.5) - 0.4, 0.8)); });
      } else {
        const L = 'M960 740C840 700 640 700 480 730L480 360C640 330 840 330 960 370Z', Rr = 'M960 740C1080 700 1280 700 1440 730L1440 360C1280 330 1080 330 960 370Z';
        P0(g, L, C.paperLight, 1); P0(g, Rr, C.paperLight, 1); L0(g, L, C.ink, 3); L0(g, Rr, C.ink, 3);
        const lines = [];
        for (let i = 0; i < 7; i++) { lines.push(L0(g, `M540 ${410 + i * 42}C680 ${396 + i * 42} 800 ${396 + i * 42} 920 ${412 + i * 42}`, C.inkSoft, 2.5, 0.8, { pathLength: 1 })); lines.push(L0(g, `M1000 ${412 + i * 42}C1120 ${396 + i * 42} 1240 ${396 + i * 42} 1380 ${410 + i * 42}`, C.inkSoft, 2.5, 0.8, { pathLength: 1 })); }
        const t = P.label ? label(g, P.label, 960, 250, 96, { weight: 300 }) : null, s = P.sub ? ital(g, P.sub, 960, 860, 48) : null;
        R.push((lt, dur, cues) => { lines.forEach((e, i) => draw(e, BTL.ease(lt, 0.2 + i * 0.12, 0.8))); const hit = cue(cues, 'hit', dur * 0.3); if (t) fade(t, BTL.ease(lt, hit - 0.2, 1.2)); if (s) fade(s, BTL.ease(lt, hit + 0.4, 1)); });
      }
      return { update(lt, dur, cues) { candle.update(lt); gl.set(0.11 + 0.02 * Math.sin(lt * 1.9)); R.forEach(f => f(lt, dur, cues)); } };
    },
  };

  // ------------------------------------------------------------------ bt_ib_yard: the arsenal at night
  SH.bt_ib_yard = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'build', g = el(svg, 'g'); bgFill(g);
      const st = BTL.stars(g, 50, 33, [0, 0, 1920, 300]);
      BTL.glow(svg, defs, 960, 520, 720, C.stain, 0.16, g);
      // a row of vaulted sheds (the galley houses), open towards the water
      for (let i = 0; i < 6; i++) {
        const x = 40 + i * 310, d = `M${x} 760L${x} 420C${x} 300 ${x + 290} 300 ${x + 290} 420L${x + 290} 760Z`;
        P0(g, d, C.paperLight, 0.9); L0(g, d, C.inkSoft, 3);
        P0(g, `M${x + 30} 760L${x + 30} 440C${x + 30} 350 ${x + 260} 350 ${x + 260} 440L${x + 260} 760Z`, C.paperDark, 1);
      }
      const HY = 820;
      P0(g, `M-100 760L2020 760L2020 ${HY}L-100 ${HY}Z`, C.paper, 1); L0(g, `M-100 760L2020 760`, C.inkSoft, 2);
      const s = K().sea(g, HY, 81, { n: 7, depth: 220 });
      const lamps = [[350, 470], [970, 470], [1590, 470]].map(([x, y]) => { L0(g, `M${x - 14} ${y}L${x + 14} ${y}L${x + 10} ${y + 30}L${x - 10} ${y + 30}Z`, C.ink, 2); return flame(g, x, y + 26, 0.45); });
      const R = [];
      const lab = P.label ? ital(g, P.label, 960, 140, 48, { color: C.ink }) : null;
      if (mode === 'build') {
        // keel and ribs in the middle shed (x 660..950) and in the shed beside it, rising one by one
        const ribs = [];
        for (const [cx, k] of [[805, 1], [1425, 0.8]]) {
          L0(g, `M${cx - 130 * k} 742L${cx + 130 * k} 742`, C.ink, 5);
          ribs.push(L0(g, `M${f1(cx - 130 * k)} 742C${f1(cx - 150 * k)} ${f1(700)} ${f1(cx - 150 * k)} ${f1(660)} ${f1(cx - 140 * k)} ${f1(630)}`, C.ink, 3.5, 1, { pathLength: 1 }));
          for (let i = 0; i < 11; i++) { const u = i / 10, x = cx - 115 * k + u * 230 * k, h = (70 + 60 * Math.sin(Math.PI * (0.15 + 0.7 * u))) * k;
            ribs.push(L0(g, `M${f1(x)} 742C${f1(x - 6)} ${f1(742 - h * 0.5)} ${f1(x - 4)} ${f1(742 - h * 0.9)} ${f1(x + 2)} ${f1(742 - h)}`, C.ink, 3, 1, { pathLength: 1 })); }
          ribs.push(L0(g, `M${f1(cx + 130 * k)} 742C${f1(cx + 160 * k)} ${f1(700)} ${f1(cx + 170 * k)} ${f1(640)} ${f1(cx + 175 * k)} ${f1(610)}`, C.ink, 3.5, 1, { pathLength: 1 }));
        }
        const figs = [BTL.person(g, 'bend', 620, 760, 110), BTL.person(g, 'stand', 1000, 760, 116, { face: -1 }), BTL.person(g, 'bend', 1250, 760, 104, { face: -1 })];
        R.push((lt, dur, cues) => { const hit = cue(cues, 'hit', dur * 0.3); ribs.forEach((e, i) => draw(e, BTL.ease(lt, hit - 1 + i * 0.12, 0.9))); figs.forEach((f, i) => f.setAttribute('transform', `translate(${f1([620, 1000, 1250][i] + 10 * Math.sin(lt * 0.4 + i))} 760)`)); });
      } else {
        // finished hulls in the sheds; one slides out onto the water
        for (const x of [185, 495, 1425, 1735]) { const hg = el(g, 'g', { transform: `translate(${x} 750) scale(0.2)` }); const D = BTL.drawing(hg); K().galley(D, { lantern: false, rig: false }); D.reveal(1); }
        const mg = el(g, 'g'); const D = BTL.drawing(mg); K().galley(D, { lantern: false, rig: false }); D.reveal(1);
        R.push((lt, dur, cues) => {
          const p = BTL.ease(lt, cue(cues, 'hit', dur * 0.3) - 0.5, Math.max(3, dur * 0.6));
          mg.setAttribute('transform', `translate(${f1(805 + 120 * p)} ${f1(750 + 120 * p)}) scale(${(0.2 + 0.4 * p).toFixed(3)})`);
        });
      }
      return { update(lt, dur, cues) { st.update(lt); s.update(lt); lamps.forEach(l => l.update(lt)); R.forEach(f => f(lt, dur, cues)); if (lab) fade(lab, BTL.ease(lt, 0.8, 1)); } };
    },
  };

  // ------------------------------------------------------------------ bt_ib_anchor
  SH.bt_ib_anchor = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      const gl = BTL.glow(svg, defs, 960, 480, 560, C.stain, 0.18, g);
      const D = BTL.drawing(el(g, 'g', { transform: 'translate(960 480)' }));
      const shank = 'M-16-300L16-300L18 250L-18 250Z', stock = 'M-200-250L200-250L200-226L-200-226Z';
      const arms = 'M-18 230C-120 230-230 170-280 60L-320 90L-300-10L-220 20L-250 40C-200 130-110 180-18 186ZM18 230C120 230 230 170 280 60L320 90L300-10L220 20L250 40C200 130 110 180 18 186Z';
      D.f(shank + stock + arms, C.paperLight, 1);
      D.s(shank, { w: 3.5 }); D.s(stock, { w: 3.5 }); D.s(arms, { w: 3.5 });
      D.s(BTL.E(0, -340, 40, 40), { w: 8 });
      // rope coil beside it
      D.s('M0-380C80-420 200-380 230-300C250-240 200-200 150-210', { w: 5, color: C.inkSoft });
      const silver = L0(g, '', C.gold, 5, 0);
      silver.setAttribute('d', 'M942 180L974 180L976 730L940 730ZM760 230L1160 230L1160 254L760 254Z');
      const lab = P.label ? ital(g, P.label, 960, 870, 50, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.4));
          const hit = cue(cues, 'hit', dur * 0.5), p = BTL.ease(lt, hit, 1.6);
          silver.setAttribute('stroke-opacity', f1(p * (0.8 + 0.2 * Math.sin(lt * 1.3))));
          gl.set(0.16 + 0.1 * p);
          if (lab) fade(lab, BTL.ease(lt, hit + 0.3, 1));
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_ib_tally: a fleet as marks; most of it is lost on hit
  // P: {total: 230, hit: 190, label: "gemi", note: "≈ 230 gemiden"}  cues: hit
  SH.bt_ib_tally = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'); bgFill(g);
      BTL.glow(svg, defs, 680, 480, 720, C.stain, 0.12, g);
      const total = P.total || 230, hit = P.hit || 190, cols = 23, rows = Math.ceil(total / cols), r = rng(19), lost = new Set();
      while (lost.size < hit) lost.add(Math.floor(r() * total));
      const boat = (x, y) => `M${x - 16} ${y - 5}L${x + 10} ${y - 5}L${x + 20} ${y}L${x + 10} ${y + 5}L${x - 16} ${y + 5}Z`;
      let dK = '', dL = '';
      for (let i = 0; i < total; i++) { const x = 150 + (i % cols) * 46, y = 210 + Math.floor(i / cols) * 58 + (Math.floor(i / cols) % 2) * 8; if (lost.has(i)) dL += boat(x, y); else dK += boat(x, y); }
      const keep = P0(g, dK, C.gold, 0.95), gone = P0(g, dL, C.gold, 0.95), ghost = L0(g, dL, C.inkSoft, 1.5, 0);
      const num = label(g, '0', 1560, 520, 220, { color: C.gold, weight: 300 });
      const lab = ital(g, P.label || '', 1560, 600, 56, { color: C.ink });
      const note = P.note ? ital(g, P.note, 1560, 670, 44) : null;
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4), p = BTL.ease(lt, at, 2.4);
          fade(keep, BTL.ease(lt, 0, 1.2)); fade(gone, BTL.ease(lt, 0, 1.2) * (1 - 0.92 * p));
          gone.setAttribute('transform', `translate(0 ${f1(10 * p)})`); ghost.setAttribute('transform', `translate(0 ${f1(10 * p)})`);
          ghost.setAttribute('stroke-opacity', f1(0.6 * p));
          num.textContent = String(Math.round(hit * BTL.ease(lt, at, 2)));
          fade(num, BTL.ease(lt, at - 0.3, 0.6)); fade(lab, BTL.ease(lt, at + 0.3, 1)); if (note) fade(note, BTL.ease(lt, 0.4, 1));
        },
      };
    },
  };
})();
