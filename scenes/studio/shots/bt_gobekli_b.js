// Göbeklitepe places (belgesel style): the hill over the Harran plain in its different moments. Uses window.GTL
// from bt_gobekli.js. Slow, natural motion only (a sinking sun, glinting flint, walking figures, rising smoke).
//   bt_gt_tepe  P: {mode, label}  cues: show
//     buried  the hill in section: pillars standing inside the earth, a light on the central one
//     ridge   a hunter on the ridge at dawn, the plain below
//     survey  slab tops and flint on the slope, two surveyors (label: e.g. "mezarlık?" appears on cue show)
//     plough  a farmer with a plough on the hill; a pile of stones at the field edge
//     heap    a heap of cleared stones; on cue show a T-shaped head in it lights up
//     lake    a still reservoir; faint walls and a T-pillar under the water
//     walk    a man and a boy climb the slope at sunset
//     gather  small figures come over the plain towards the hill from all sides
//     village round houses around the rings on the hill, smoke rising
//     hills   many ridges; gold points light up one after another (Taş Tepeler); labels for two of them
//     quarry  the limestone plateau: an unfinished T-pillar still lying in the bedrock
//     wall    a trench wall: mixed layers of the fill, a kneeling figure brushing it
//     ratio   a big unexcavated hill with one small dug window: one ring in it, filled flat, two pillar heads
//     mound   a smooth hill at dusk; ghost outlines of pillars inside it fade away
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT;

  SH.bt_gt_tepe = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, txt, lab, halo, fade, tSil, pillar } = window.GTL;
      const mode = P.mode || 'ridge';
      const FX = { walk: 1100, heap: 1000, plough: 900, quarry: 960, wall: 960, buried: 960 };
      const { g } = BTL.stage(svg, W, H, { fx: FX[mode] || 960, ty: 600 });
      const upd = [];
      const sunAt = (x, y, r, a0, sink) => {
        const gl = BTL.glow(svg, defs, x, y, r * 6, C.stain, 0.3, g);
        const s = P0(g, BTL.E(x, y, r, r), C.gold, 0.55);
        upd.push((lt, dur) => { const dy = sink ? sink * lt / Math.max(dur, 6) : 0; s.setAttribute('transform', `translate(0 ${dy.toFixed(1)})`); gl.e.setAttribute('transform', `translate(0 ${dy.toFixed(1)})`); gl.set(a0 + 0.04 * Math.sin(lt * 0.5)); });
      };
      const plain = (y = 660) => {
        P0(g, `M0 ${y}L1920 ${y}L1920 1800L0 1800Z`, C.paperDark, 0.35);
        L0(g, `M0 ${y}L1920 ${y}`, C.inkSoft, 2, 0.7);
        let d = ''; for (let i = 0; i < 9; i++) { const yy = y + 18 + i * i * 6; d += `M0 ${yy}L1920 ${yy + 2}`; }
        for (let i = -12; i <= 12; i++) d += `M${960 + i * 60} ${y + 4}L${960 + i * 260} ${y + 520}`;
        L0(g, d, C.inkSoft, 1.4, 0.25);
        L0(g, `M0 ${y - 4}C200 ${y - 30} 380 ${y - 24} 520 ${y - 6}M1300 ${y - 4}C1480 ${y - 40} 1700 ${y - 34} 1920 ${y - 10}`, C.inkSoft, 2, 0.5);
      };
      const HILL = 'M0 760C300 740 520 620 700 560C820 500 900 470 980 468C1060 470 1140 500 1260 560C1440 640 1640 740 1920 760';
      const hill = (a = 0.75) => { P0(g, HILL + 'L1920 1800L0 1800Z', C.paperDark, a); L0(g, HILL, C.inkSoft, 3); };
      const hillY = x => {   // approximate crest height along HILL
        const t = (x - 980) / 960; return 470 + 300 * Math.min(1, Math.pow(Math.abs(t), 1.3) * 1.05);
      };

      if (mode === 'buried') {
        // section through the hill: surface on top, earth below, pillars in a ring inside
        const top = 'M0 420C400 400 700 330 960 324C1220 330 1520 400 1920 420';
        P0(g, top + 'L1920 1800L0 1800Z', C.paperDark, 0.8); L0(g, top, C.inkSoft, 3);
        let grass = ''; for (let x = 20; x < 1920; x += 40) { const y = 420 - 96 * Math.exp(-Math.pow((x - 960) / 560, 2)); grass += `M${x} ${y.toFixed(0)}l-5 -16M${x + 8} ${y.toFixed(0)}l4 -12`; }
        L0(g, grass, C.inkSoft, 2, 0.6);
        for (const [yy, a] of [[540, 0.35], [660, 0.3], [930, 0.3], [1060, 0.25]]) L0(g, `M0 ${yy}C420 ${yy - 16} 980 ${yy + 18} 1400 ${yy - 6}C1650 ${yy - 16} 1820 ${yy + 6} 1920 ${yy}`, C.inkSoft, 2, a);
        const r = rng(23); let st = '';
        for (let i = 0; i < 40; i++) { const sx = r() * 1920, sy = 440 + r() * 700; if (sx > 500 && sx < 1420 && sy < 900) continue; st += BTL.E(sx, sy, 8 + r() * 14, 5 + r() * 8); }
        P0(g, st, C.paper, 0.9, { stroke: C.inkSoft, 'stroke-width': 2 });
        const gl = BTL.glow(svg, defs, 960, 650, 360, C.gold, 0, g);
        const ps = [];
        [[480, 820, 230, 1], [660, 790, 210, 1], [1260, 790, 210, -1], [1440, 820, 230, -1]].forEach(([x, y, h, fc]) => { const e = tSil(g, x, y, h, fc, { a: 0.9, w: 2.5, stroke: C.inkSoft }); ps.push(e); });
        const c1 = pillar(g, 830, 860, 400, { face: 1 }), c2 = pillar(g, 1090, 860, 400, { face: -1 });
        upd.push((lt) => {
          ps.forEach((e, i) => fade(e, BTL.ease(lt, 0.3 + i * 0.25, 1.4)));
          c1.D.reveal(BTL.ease(lt, 0.2, 2.6)); c2.D.reveal(BTL.ease(lt, 0.5, 2.6));
          gl.set(0.3 * BTL.ease(lt, 1.6, 2.4) + 0.05 * Math.sin(lt * 0.6));
        });
      } else if (mode === 'ratio' || mode === 'mound') {
        sunAt(1560, mode === 'mound' ? 420 : 280, 50, 0.26, mode === 'mound' ? 60 : 0);
        plain(700);
        const BIG = 'M0 820C200 800 360 560 620 440C780 370 880 350 960 348C1040 350 1140 370 1300 440C1560 560 1720 800 1920 820';
        P0(g, BIG + 'L1920 1800L0 1800Z', C.paperDark, 0.85); L0(g, BIG, C.inkSoft, 3);
        if (mode === 'ratio') {
          const r = rng(6); let hatch = '';
          for (let i = 0; i < 70; i++) { const x = 300 + r() * 1320, y = 470 + r() * 330; if (y < 360 + Math.pow(Math.abs(x - 960) / 660, 1.6) * 420) continue; hatch += `M${x.toFixed(0)} ${y.toFixed(0)}l14 -8`; }
          L0(g, hatch, C.inkSoft, 1.8, 0.4);
          const win = 'M860 352L1060 354L1056 470L864 468Z';
          const D = BTL.drawing(g);
          D.f(win, C.paper, 1); D.s(win, { w: 4, color: C.gold });
          const gl = BTL.glow(svg, defs, 960, 420, 200, C.gold, 0, g);
          P0(g, BTL.E(960, 432, 82, 28), C.paperDark, 1, { stroke: C.ink, 'stroke-width': 3 });
          let fl = ''; for (const dy of [-14, -4, 6, 16]) { const w = 82 * Math.sqrt(Math.max(0, 1 - Math.pow(dy / 28, 2))) - 6; fl += `M${(960 - w).toFixed(0)} ${432 + dy}L${(960 + w).toFixed(0)} ${432 + dy}`; }
          L0(g, fl, C.inkSoft, 2, 0.9);
          tSil(g, 935, 420, 46, 1, { w: 2 }); tSil(g, 988, 420, 46, -1, { w: 2 });
          upd.push(lt => { D.reveal(BTL.ease(lt, 0.3, 2.2)); gl.set(0.3 * BTL.ease(lt, 1.2, 2) + 0.04 * Math.sin(lt * 0.7)); });
        } else {
          const gh = el(g, 'g', { opacity: 0 });
          [[700, 640, 150, 1], [830, 600, 190, 1], [1090, 600, 190, -1], [1220, 640, 150, -1]].forEach(([x, y, h, fc]) => tSil(gh, x, y, h, fc, { fill: 'none', stroke: C.inkSoft, w: 3 }));
          upd.push((lt, dur) => fade(gh, 0.8 * BTL.ease(lt, 0.2, 1.2) * (1 - BTL.ease(lt, dur * 0.45, dur * 0.45))));
        }
      } else if (mode === 'quarry') {
        P0(g, 'M0 520C600 500 1300 510 1920 520L1920 1800L0 1800Z', C.paperLight, 1);
        L0(g, 'M0 520C600 500 1300 510 1920 520', C.inkSoft, 2.5);
        L0(g, 'M0 518C200 470 340 470 460 506M1500 512C1640 480 1800 478 1920 500', C.inkSoft, 2, 0.5);
        const r = rng(4); let cr = '';
        for (let i = 0; i < 40; i++) { const x = r() * 1920, y = 560 + r() * 500; cr += `M${x.toFixed(0)} ${y.toFixed(0)}l${(20 + r() * 50).toFixed(0)} ${(r() * 12 - 6).toFixed(0)}`; }
        L0(g, cr, C.inkSoft, 1.8, 0.35);
        // the unfinished pillar lying in the rock (seen from above at an angle): a T outline with a channel around it
        const T = 'M420 760L1260 720L1270 660L1500 650L1510 900L1280 890L1270 830L430 860Z';
        P0(g, 'M380 790L1240 750L1240 640L1540 626L1550 930L1250 920L1240 870L390 900Z', C.paperDark, 0.6);
        const D = BTL.drawing(g);
        D.f(T, C.paperLight, 1); D.s(T, { w: 4 });
        D.s('M380 790L1240 750L1240 640L1540 626L1550 930L1250 920L1240 870L390 900Z', { w: 2.5, color: C.gold });
        let ch = ''; for (let x = 420; x < 1520; x += 34) ch += `M${x} ${(x < 1240 ? 776 - (x - 380) * 0.046 : 640).toFixed(0)}l6 -14`;
        D.s(ch, { w: 2, color: C.inkSoft });
        upd.push(lt => D.reveal(BTL.ease(lt, 0.3, 3)));
      } else if (mode === 'wall') {
        // a trench wall seen face-on: tilted layers, fragments, one kneeling figure with a brush
        P0(g, 'M0 0L1920 0L1920 1800L0 1800Z', C.paperDark, 0.45);
        const lay = [];
        const cols = [C.paper, C.paperDark, C.paperLight, C.paperDark, C.paper, C.paperLight, C.paperDark];
        for (let i = 0; i < 7; i++) {
          const y0 = 120 + i * 120, tilt = 90;
          const d = `M0 ${y0}C600 ${y0 + tilt * 0.3} 1300 ${y0 + tilt * 0.7} 1920 ${y0 + tilt}L1920 ${y0 + tilt + 120}C1300 ${y0 + tilt * 0.7 + 120} 600 ${y0 + tilt * 0.3 + 120} 0 ${y0 + 120}Z`;
          lay.push(P0(g, d, cols[i], 0.85, { stroke: C.inkSoft, 'stroke-width': 1.8 }));
        }
        const r = rng(12); let fa = '', fb = '';
        for (let i = 0; i < 70; i++) { const x = 60 + r() * 1800, y = 140 + r() * 780 + x * 0.04, l = 14 + r() * 26, s = `M${x.toFixed(0)} ${y.toFixed(0)}l${l.toFixed(0)} ${(r() * 10 - 5).toFixed(0)}`; if (i % 6 === 0) fb += s; else fa += s; }
        L0(g, fa, C.ink, 3.5, 0.7);
        const gold = L0(g, fb, C.gold, 5, 0);
        BTL.person(g, 'bend', 1640, 840, 260, { face: -1, color: C.ink, rim: C.ink });
        const brush = L0(g, '', C.ink, 5), bristle = P0(g, '', C.gold, 1);
        upd.push(lt => { fade(gold, BTL.ease(lt, 1.5, 2)); const a = Math.sin(lt * 1.1) * 18; const bx = 1530 + a * 0.6, by = 762 + a * 0.3; brush.setAttribute('d', `M${bx + 12} ${by + 4}L${bx - 40} ${by - 10}`); bristle.setAttribute('d', `M${bx - 40} ${by - 22}L${bx - 66} ${by - 26}L${bx - 66} ${by + 6}L${bx - 40} ${by + 2}Z`); lay.forEach((e, i) => e.setAttribute('fill-opacity', (0.6 + 0.25 * BTL.ease(lt, i * 0.2, 1)).toFixed(3))); });
      } else if (mode === 'lake') {
        sunAt(1400, 300, 50, 0.22, 0);
        L0(g, 'M0 520C300 470 500 460 700 500C900 450 1200 440 1500 490C1700 470 1820 480 1920 500', C.inkSoft, 2.5, 0.7);
        P0(g, 'M0 540L1920 540L1920 1800L0 1800Z', C.blue, 0.16);
        L0(g, 'M0 540L1920 540', C.inkSoft, 2.5);
        // under water: the drowned village and a pillar, faint
        const ug = el(g, 'g', { opacity: 0.0 });
        for (const [x, w] of [[560, 180], [800, 150], [1260, 170]]) L0(ug, `M${x - w / 2} 860L${x - w / 2} 790L${x + w / 2} 790L${x + w / 2} 860`, C.inkSoft, 3);
        tSil(ug, 1020, 880, 230, 1, { fill: 'none', stroke: C.inkSoft, w: 3 });
        L0(ug, 'M300 880C700 870 1300 890 1700 878', C.inkSoft, 2.5);
        const ripples = []; for (let i = 0; i < 16; i++) ripples.push({ e: L0(g, '', C.inkSoft, 2, 0.45), x: (i * 331) % 1800, y: 580 + (i % 8) * 34, l: 50 + (i % 4) * 30 });
        const refl = []; for (let i = 0; i < 7; i++) refl.push({ e: L0(g, '', C.gold, 4, 0.45), y: 570 + i * 22, w: 70 - i * 7 });
        upd.push(lt => {
          fade(ug, 0.55 * BTL.ease(lt, 1.2, 2.5));
          ripples.forEach(rp => { const x = (rp.x + lt * 7) % 1920; rp.e.setAttribute('d', `M${x.toFixed(1)} ${rp.y}l${rp.l} 0`); });
          refl.forEach((rf, i) => { const w = rf.w * (0.8 + 0.2 * Math.sin(lt * 0.6 + i)); rf.e.setAttribute('d', `M${(1400 - w).toFixed(1)} ${rf.y}L${(1400 + w).toFixed(1)} ${rf.y}`); });
        });
      } else if (mode === 'hills') {
        const ridges = [
          ['M0 470C200 430 360 440 520 470C700 420 860 420 1000 460C1200 410 1400 420 1560 460C1700 430 1820 436 1920 450', 0.25, 0.55],
          ['M0 600C220 540 420 550 600 590C760 540 960 530 1140 586C1320 540 1520 530 1700 580C1800 560 1880 560 1920 570', 0.4, 0.75],
          ['M0 760C260 690 520 690 760 740C960 690 1200 680 1420 730C1640 690 1800 700 1920 720', 0.6, 1],
        ];
        for (const [d, a, la] of ridges) { P0(g, d + 'L1920 1800L0 1800Z', C.paperDark, a); L0(g, d, C.inkSoft, 2.5, la); }
        const pts = [[1000, 460], [1560, 460], [520, 470], [1140, 586], [600, 590], [1700, 580], [240, 585], [760, 740], [1420, 730], [300, 705], [1840, 712], [1250, 422]];
        const dots = pts.map(([x, y], i) => { const e = el(g, 'g'); el(e, 'circle', { cx: x, cy: y - 6, r: 22, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 }); el(e, 'circle', { cx: x, cy: y - 6, r: 10, fill: C.gold }); e.setAttribute('opacity', 0); return e; });
        const l1 = halo(txt(g, 'Göbeklitepe', 760, 680, 50, { anchor: 'middle' })), l2 = halo(txt(g, 'Karahantepe', 1420, 670, 50, { anchor: 'middle' }));
        upd.push((lt, dur, cues) => {
          const t0 = cue(cues, 'show', 0.6);
          dots.forEach((e, i) => fade(e, BTL.ease(lt, t0 + i * 0.3, 0.8)));
          fade(l1, BTL.ease(lt, 1.0, 1)); fade(l2, BTL.ease(lt, Math.min(t0 + 0.8, 2.2), 1));
        });
      } else {
        // the hill above the plain, with a moment on it
        const sunPos = { ridge: [400, 380, 46, 0.24, -40], walk: [1580, 360, 54, 0.3, 50], gather: [1600, 330, 50, 0.28, 40], village: [1620, 300, 44, 0.22, 0], survey: [1600, 250, 42, 0.18, 0], plough: [300, 240, 40, 0.18, 0], heap: [1640, 330, 50, 0.28, 30] }[mode] || [1500, 300, 46, 0.2, 0];
        if (!['survey', 'village'].includes(mode)) sunAt(...sunPos);
        plain(mode === 'heap' ? 700 : 660);
        hill(0.7);
        if (mode === 'ridge') {
          const p = BTL.person(g, 'stand', 1000, 470, 210, { face: -1, color: C.ink, rim: C.ink });
          L0(g, 'M948 470L1000 250', C.ink, 4);
          P0(g, 'M1000 250L992 280L1008 282Z', C.ink, 1);
          const gz = [];
          for (let i = 0; i < 5; i++) { const e = el(g, 'g'); gz.push({ e, x: 300 + i * 70, y: 720 + (i % 2) * 14 }); }
          gz.forEach(z => { P0(z.e, 'M-22 0C-20 -16 16 -16 22 -4L30 -20L34 -18L26 0L24 14L20 14L18 2L-12 2L-14 14L-18 14Z', C.ink, 0.7); });
          upd.push(lt => gz.forEach((z, i) => z.e.setAttribute('transform', `translate(${(z.x + lt * 6).toFixed(1)} ${z.y})`)));
        } else if (mode === 'survey') {
          const r = rng(8); let sl = '', fl = [];
          for (let i = 0; i < 9; i++) { const x = 760 + i * 52 + r() * 20, y = hillY(x) + 6 + r() * 14, w = 18 + r() * 10, hh = 30 + r() * 22, a = -10 + r() * 20; sl += `M${x} ${y}l${(Math.sin(a / 57) * hh).toFixed(1)} ${-hh}l${w} 0l${(-Math.sin(a / 57) * hh * 0.5).toFixed(1)} ${hh}Z`; }
          P0(g, sl, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5 });
          for (let i = 0; i < 26; i++) { const x = 560 + r() * 840, y = hillY(x) + 20 + r() * 120; fl.push({ e: L0(g, `M${x.toFixed(0)} ${y.toFixed(0)}l8 -5`, C.gold, 3.5, 0), ph: r() * 6.28 }); }
          BTL.person(g, 'stand', 680, hillY(680) + 4, 170, { face: 1, color: C.ink, rim: C.ink });
          BTL.person(g, 'bend', 430, hillY(430) + 6, 160, { face: 1, color: C.ink, rim: C.ink });
          P0(g, `M690 ${hillY(680) - 104}l26 -6l4 26l-26 6Z`, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2 });
          const L = P.label ? halo(lab(g, P.label, 1000, 380, 64, { anchor: 'middle', color: C.ink })) : null;
          upd.push((lt, dur, cues) => {
            fl.forEach(f => f.e.setAttribute('stroke-opacity', (0.25 + 0.6 * Math.max(0, Math.sin(lt * 0.9 + f.ph))).toFixed(3)));
            if (L) fade(L, BTL.ease(lt, cue(cues, 'show', dur * 0.45), 1.2));
          });
        } else if (mode === 'plough') {
          const r = rng(31); let fur = '';
          for (let i = 0; i < 12; i++) { const x0 = 600 + i * 22; fur += `M${x0} ${hillY(x0) + 30 + i * 12}C${x0 + 200} ${hillY(x0 + 200) + 30 + i * 12} ${x0 + 400} ${hillY(x0 + 400) + 40 + i * 12} ${x0 + 600} ${hillY(x0 + 600) + 50 + i * 12}`; }
          L0(g, fur, C.inkSoft, 2, 0.45);
          const heap = []; for (let i = 0; i < 16; i++) { const x = 1340 + (i % 6) * 34 + (Math.floor(i / 6) * 17), y = hillY(1400) + 50 - Math.floor(i / 6) * 22; heap.push(P0(g, BTL.E(x, y, 22, 14), C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5, opacity: 0 })); }
          const fg = el(g, 'g');
          BTL.person(fg, 'bend', 0, 0, 190, { face: 1, color: C.ink, rim: C.ink });
          L0(fg, 'M70 -60L170 -10L220 6M170 -10L180 20', C.ink, 6);
          upd.push((lt, dur) => {
            const p = clamp01(lt / Math.max(dur, 6)), x = lerp(700, 1000, p);
            fg.setAttribute('transform', `translate(${x.toFixed(1)} ${(hillY(x) + 110).toFixed(1)})`);
            heap.forEach((e, i) => fade(e, BTL.ease(lt, 0.4 + i * 0.22, 0.8)));
          });
        } else if (mode === 'heap') {
          const cx = 1000, by = 860;
          const r = rng(14), stones = [];
          for (let row = 0; row < 5; row++) for (let i = 0; i < 9 - row; i++) {
            const x = cx - (8 - row) * 52 + i * 104 + row * 0 + (r() - 0.5) * 20, y = by - row * 62 + (r() - 0.5) * 10;
            if (row >= 2 && Math.abs(x - cx) < 120) continue;
            stones.push(P0(g, BTL.E(x, y, 50 + r() * 10, 30 + r() * 6), C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5 }));
          }
          const gl = BTL.glow(svg, defs, cx + 30, by - 260, 300, C.gold, 0, g);
          // the T-head in the heap: only the top of a pillar shows, tilted
          const D = BTL.drawing(el(g, 'g', { transform: `rotate(-8 ${cx} ${by - 200})` }));
          const T = window.GTL.U(window.GTL.PIL, cx, by + 240, 640, 1);
          const cp = el(g, 'clipPath', { id: 'gtheapclip' }); el(cp, 'path', { d: `M0 0L1920 0L1920 ${by - 110}L0 ${by - 110}Z` });
          D.g.setAttribute('clip-path', 'url(#gtheapclip)');
          D.f(T, C.paperLight, 1); D.s(T, { w: 4 });
          const goldT = L0(D.g, T, C.gold, 6, 0);
          for (let i = 0; i < 5; i++) { const x = cx - 220 + i * 110; P0(g, BTL.E(x, by - 70 - (i % 2) * 16, 56, 34), C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5 }); }
          upd.push((lt, dur, cues) => {
            const t0 = cue(cues, 'show', dur * 0.5);
            D.reveal(BTL.ease(lt, 0.2, 2));
            gl.set(0.45 * BTL.ease(lt, t0, 1.6) + 0.04 * Math.sin(lt * 0.7));
            goldT.setAttribute('stroke-opacity', (0.95 * BTL.ease(lt, t0, 1.6)).toFixed(3));
          });
        } else if (mode === 'walk') {
          const man = el(g, 'g'), boy = el(g, 'g');
          BTL.person(man, 'stand', 0, 0, 200, { face: 1, color: C.ink, rim: C.ink });
          BTL.person(boy, 'stand', 0, 0, 130, { face: 1, color: C.ink, rim: C.ink });
          const r = rng(5), fl = [];
          for (let i = 0; i < 18; i++) { const x = 900 + r() * 500, y = hillY(x) + 30 + r() * 140; fl.push({ e: L0(g, `M${x.toFixed(0)} ${y.toFixed(0)}l8 -5`, C.gold, 3.5, 0), ph: r() * 6.28 }); }
          upd.push((lt, dur) => {
            const p = clamp01(lt / Math.max(dur, 6));
            const xb = lerp(1520, 1300, p), xm = xb + 130;
            boy.setAttribute('transform', `translate(${xb.toFixed(1)} ${(hillY(xb) + 6).toFixed(1)}) scale(-1 1)`);
            man.setAttribute('transform', `translate(${xm.toFixed(1)} ${(hillY(xm) + 6).toFixed(1)}) scale(-1 1)`);
            fl.forEach(f => f.e.setAttribute('stroke-opacity', (0.2 + 0.6 * Math.max(0, Math.sin(lt * 0.8 + f.ph))).toFixed(3)));
          });
        } else if (mode === 'gather') {
          const gl = BTL.glow(svg, defs, 980, 470, 260, C.gold, 0.2, g);
          const crowd = [];
          for (let i = 0; i < 14; i++) {
            const side = i % 2 ? 1 : -1, x0 = 960 + side * (760 + (i % 5) * 70), y0 = 800 + (i % 4) * 40, e = el(g, 'g');
            BTL.person(e, 'stand', 0, 0, 70 + (i % 4) * 14, { face: -side, color: C.ink, rim: C.ink });
            crowd.push({ e, x0, y0, side, sp: 0.6 + (i % 3) * 0.15 });
          }
          upd.push((lt, dur) => {
            gl.set(0.2 + 0.05 * Math.sin(lt * 0.6));
            crowd.forEach(c => { const p = clamp01(lt / Math.max(dur, 6)) * c.sp, x = c.x0 - c.side * 420 * p, y = lerp(c.y0, hillY(x) + 40 + (c.y0 - 800) * 0.4, p * 0.6); c.e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); });
          });
        } else if (mode === 'village') {
          const houses = [[640, 0.9], [760, 1], [1240, 1], [1360, 0.9], [520, 0.8], [1460, 0.8]];
          const sm = [];
          for (const [x, k] of houses) {
            const y = hillY(x) + 22, w = 70 * k, h = 50 * k;
            P0(g, `M${x - w} ${y}L${x - w} ${y - h}Q${x} ${y - h - 60 * k} ${x + w} ${y - h}L${x + w} ${y}Z`, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5 });
            sm.push({ e: L0(g, '', C.inkSoft, 3, 0.5), x, y: y - h - 50 * k });
          }
          L0(g, 'M860 476C900 452 1060 452 1100 476C1060 500 900 500 860 476Z', C.ink, 3);
          for (const x of [890, 930, 980, 1030, 1070]) window.GTL.tSil(g, x, 486 - Math.abs(x - 980) * 0.1, 50, x < 980 ? 1 : -1, { w: 2 });
          upd.push(lt => sm.forEach((s, i) => { const ph = (lt * 0.25 + i * 0.3) % 1, yy = s.y - ph * 90, sw = 12 * Math.sin(lt * 0.8 + i); s.e.setAttribute('d', `M${s.x} ${yy + 40}C${s.x + sw} ${yy + 20} ${s.x - sw} ${yy} ${s.x + sw * 0.5} ${yy - 30}`); s.e.setAttribute('stroke-opacity', (Math.sin(ph * Math.PI) * 0.6).toFixed(3)); }));
        }
      }
      return { update(lt, dur, cues) { for (const f of upd) f(lt, dur, cues); } };
    },
  };
})();
