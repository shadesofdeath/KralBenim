// Belgesel style places (docs/BELGESEL.md): sparse, full-frame worlds; silhouettes, light pools, still lines.
// The only motion is slow and natural (a flame, a drifting diver, rising steam, a slow sunrise): nothing jitters.
//   bt_grave   P: {stage: "surface"|"cut"}            a mound under the stars / the grave in cross-section (spoon glows)
//   bt_shore   P: {}                                  night coast, cave, shells at the waterline, a figure bending
//   bt_dive    P: {}                                  under water: a diver sinks towards shells on the sea floor
//   bt_figure  P: {pose: "kneel"}                     a figure drinking from cupped hands at a stream
//   bt_fire    P: {mode: "camp"|"hand"}  cues: back    a fire with a pot; "hand": a hand nears the boiling pot
//   bt_stones  cues: drop                             a heated stone drops into a hide-lined pit of water
//   bt_dip     cues: dip                              a wooden scoop dips into a boiling pot
//   bt_field   P: {}                                  wheat at sunrise
//   bt_village P: {}                                  Çatalhöyük at night: packed mud-brick houses, roof ladders
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT;
  const place = (parent, x, y, s, rot = 0) => el(parent, 'g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const steamD = (x, y, lt, i, h = 160) => {
    const ph = ((lt * 0.22 + i * 0.33) % 1), yy = y - ph * h, sw = 16 * Math.sin(lt * 0.9 + i * 2);
    return { d: `M${x} ${yy + 60}C${x + sw} ${yy + 30} ${x - sw} ${yy} ${x + sw * 0.5} ${yy - 40}`, a: Math.sin(ph * Math.PI) * 0.55 };
  };
  // a fire: three nested flames whose heights breathe smoothly (no jitter)
  function fire(parent, svg, defs, x, y, s = 1) {
    const gl = BTL.glow(svg, defs, x, y - 60 * s, 620 * s, C.stain, 0.32, parent);
    const g = el(parent, 'g');
    L0(g, `M${x - 110 * s} ${y + 6}L${x + 110 * s} ${y + 6}`, C.inkSoft, 3);
    for (let i = -2; i <= 2; i++) P0(g, BTL.E(x + i * 48 * s, y + 4, 26 * s, 14 * s), C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
    const fl = [[C.red, 1, 0], [C.gold, 0.72, 1.3], [C.paperLight, 0.42, 2.1]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
    return {
      update(lt) {
        gl.set(0.3 + 0.03 * Math.sin(lt * 1.3) + 0.02 * Math.sin(lt * 2.9));
        for (const f of fl) {
          const h = (170 + 18 * Math.sin(lt * 2.1 + f.ph) + 10 * Math.sin(lt * 3.7 + f.ph * 2)) * f.k * s, w = 70 * f.k * s, lean = 10 * Math.sin(lt * 1.1 + f.ph) * s;
          f.e.setAttribute('d', `M${x - w} ${y}C${x - w} ${y - h * 0.45} ${x - w * 0.2 + lean} ${y - h * 0.7} ${x + lean} ${y - h}C${x + w * 0.2 + lean} ${y - h * 0.7} ${x + w} ${y - h * 0.45} ${x + w} ${y}Z`);
        }
      },
    };
  }

  SH.bt_grave = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g');
      if (P.stage !== 'cut') {
        const st = BTL.stars(g, 260, 41, [0, 0, W, 620]);
        P0(g, `M0 720C380 712 600 560 960 548C1320 560 1540 712 1920 720L1920 1080L0 1080Z`, C.paperLight, 0.85);
        L0(g, `M0 720C380 712 600 560 960 548C1320 560 1540 712 1920 720`, C.inkSoft, 2.5);
        P0(g, `M0 860C500 840 1400 840 1920 860L1920 1080L0 1080Z`, C.paperDark, 0.8);
        const gl = BTL.glow(svg, defs, 960, 690, 140, C.gold, 0, g);
        el(g, 'circle', { cx: 960, cy: 690, r: 5, fill: C.gold, 'fill-opacity': 0.9 });
        return { update(lt) { st.update(lt); gl.set(0.35 + 0.2 * Math.sin(lt * 0.8)); } };
      }
      // cross-section: surface, soil layers, a flexed burial, the spoon by the hands
      P0(g, `M0 250L1920 250L1920 1080L0 1080Z`, C.paperLight, 0.55);
      L0(g, 'M0 250L1920 250', C.inkSoft, 3);
      let grass = ''; for (let x = 30; x < 1920; x += 46) grass += `M${x} 250l-6 -18M${x + 9} 250l5 -14`;
      L0(g, grass, C.inkSoft, 2, 0.7);
      for (const [y, a] of [[380, 0.35], [520, 0.3], [880, 0.3], [990, 0.25]]) L0(g, `M0 ${y}C400 ${y - 14} 900 ${y + 16} 1300 ${y - 6}C1600 ${y - 18} 1800 ${y + 8} 1920 ${y}`, C.inkSoft, 2, a);
      const pit = `M560 470C700 420 1240 420 1360 480C1430 540 1420 700 1320 760C1180 820 740 820 610 760C520 700 500 540 560 470Z`;
      P0(g, pit, C.paper, 0.85); L0(g, pit, C.inkSoft, 2.5);
      const D = BTL.drawing(g);
      const bone = { w: 4.5, color: C.inkSoft };
      D.s(BTL.E(760, 560, 46, 42), bone);                              // skull
      D.s('M748 600C760 618 784 622 800 610', { w: 3, color: C.inkSoft });  // jaw
      D.s('M812 596C880 600 960 612 1040 640', bone);                    // spine
      D.s('M850 600C858 640 880 650 900 646M890 606C898 646 920 656 940 652M930 612C938 652 960 662 980 656', { w: 4, color: C.inkSoft });
      D.s(BTL.E(1070, 656, 38, 26), bone);                             // pelvis
      D.s('M1074 676L930 708L1080 744', bone);                           // folded leg
      D.s('M1060 682L950 726L1090 760', bone);
      D.s('M830 604L900 668L800 668', bone);                             // folded arm, hands at the face
      const SP = BTL.drawing(place(g, 680, 690, 0.32, -12)); BTL.OBJ.bonespoon(SP, { gold: true });
      const gl = BTL.glow(svg, defs, 680, 690, 160, C.gold, 0, g);
      g.appendChild(SP.g.parentNode);
      return {
        update(lt) {
          D.reveal(BTL.ease(lt, 0.2, 3));
          SP.reveal(BTL.ease(lt, 1.6, 2));
          gl.set(0.4 * BTL.ease(lt, 2.4, 2));
        },
      };
    },
  };

  SH.bt_shore = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      const st = BTL.stars(g, 160, 77, [0, 0, W, 520]);
      BTL.glow(svg, defs, 1420, 230, 260, C.stain, 0.22, g);
      P0(g, BTL.E(1420, 230, 62, 62), C.ink, 0.92);
      P0(g, `M0 560L1920 560L1920 1080L0 1080Z`, C.paper, 1);
      L0(g, 'M0 560L1920 560', C.inkSoft, 2);
      const waves = el(g, 'g'); const wl = [];
      for (let i = 0; i < 26; i++) { const y = 580 + (i % 13) * 16 + Math.floor(i / 13) * 8, x = (i * 397) % 1800; wl.push({ e: L0(waves, '', C.inkSoft, 2, 0.45), x, y, len: 60 + (i % 5) * 26 }); }
      const refl = []; for (let i = 0; i < 9; i++) refl.push({ e: L0(g, '', C.stain, 4, 0.5), y: 590 + i * 22, w: 90 - i * 6 });
      const sand = `M0 820C500 790 1100 780 1920 800L1920 1080L0 1080Z`;
      P0(g, sand, C.paperLight, 1);
      const foam = L0(g, '', C.ink, 2.5, 0.5);
      P0(g, `M0 260C150 250 300 320 360 470C400 580 380 700 460 840L0 840Z`, C.paperDark, 1);
      P0(g, `M70 560C120 500 220 520 250 620C270 700 230 780 200 840L60 840Z`, C.paper, 1);
      L0(g, `M0 260C150 250 300 320 360 470C400 580 380 700 460 840`, C.inkSoft, 2.5);
      BTL.person(g, 'bend', 1120, 880, 230, { face: -1 });
      const shells = [[1010, 905, 0.09], [1280, 930, 0.08], [880, 950, 0.07]].map(([x, y, s]) => { const D = BTL.drawing(place(g, x, y, s)); BTL.OBJ.shell(D); return D; });
      return {
        update(lt) {
          st.update(lt);
          wl.forEach(w => { const x = (w.x + lt * 9) % 1920; w.e.setAttribute('d', `M${x.toFixed(1)} ${w.y}l${w.len} 0`); });
          refl.forEach((r, i) => { const ww = r.w * (0.8 + 0.2 * Math.sin(lt * 0.7 + i)); r.e.setAttribute('d', `M${(1420 - ww).toFixed(1)} ${r.y}L${(1420 + ww).toFixed(1)} ${r.y}`); });
          const f = 6 * Math.sin(lt * 0.6);
          foam.setAttribute('d', `M0 ${812 + f}C500 ${782 + f} 1100 ${772 + f} 1920 ${792 + f}`);
          shells.forEach(D => D.reveal(BTL.ease(lt, 0.8, 1.6)));
        },
      };
    },
  };

  SH.bt_dive = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      P0(g, `M0 0L1920 0L1920 140L0 140Z`, C.paperLight, 0.5);
      const surf = L0(g, '', C.inkSoft, 2.5);
      const rays = [380, 760, 1180, 1560].map((x, i) => P0(g, `M${x - 40} 140L${x + 40} 140L${x + 220 + i * 20} 1080L${x + 20 + i * 20} 1080Z`, C.stain, 0.06));
      P0(g, `M0 930C400 900 900 940 1300 912C1600 896 1800 920 1920 916L1920 1080L0 1080Z`, C.paperLight, 0.9);
      L0(g, `M0 930C400 900 900 940 1300 912C1600 896 1800 920 1920 916`, C.inkSoft, 2.5);
      L0(g, `M120 980C220 970 320 990 420 978M700 1000C820 988 920 1004 1040 992M1320 970C1440 960 1540 976 1660 966`, C.inkSoft, 2, 0.5);
      [[1180, 930, 0.1], [1320, 950, 0.08], [980, 960, 0.09], [1500, 935, 0.07]].forEach(([x, y, s]) => { const D = BTL.drawing(place(g, x, y, s)); BTL.OBJ.shell(D); D.reveal(1); });
      const diver = el(g, 'g');
      BTL.person(diver, 'dive', 0, 0, 260, {});
      const bub = [0, 1, 2, 3, 4].map(() => el(g, 'circle', { r: 6, fill: 'none', stroke: C.ink, 'stroke-width': 2 }));
      return {
        update(lt, dur) {
          const p = clamp01(lt / Math.max(dur, 6));
          surf.setAttribute('d', `M0 ${140 + 4 * Math.sin(lt * 0.8)}C500 ${136 + 4 * Math.sin(lt * 0.8 + 1)} 1400 ${144 + 4 * Math.sin(lt * 0.8 + 2)} 1920 ${140 + 4 * Math.sin(lt * 0.8 + 3)}`);
          rays.forEach((r, i) => r.setAttribute('fill-opacity', (0.05 + 0.025 * Math.sin(lt * 0.5 + i)).toFixed(3)));
          const x = lerp(640, 1000, p), y = lerp(330, 560, p);
          diver.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${150})`);
          const hx = x + Math.sin(150 * Math.PI / 180) * 0, hy = y;
          bub.forEach((b, i) => {
            const ph = ((lt * 0.35 + i * 0.2) % 1);
            b.setAttribute('cx', (x + 60 + 10 * Math.sin(lt + i)).toFixed(1));
            b.setAttribute('cy', (hy + 160 - ph * 380).toFixed(1));
            b.setAttribute('r', (4 + i * 1.5).toFixed(1));
            b.setAttribute('stroke-opacity', (0.6 * (1 - ph)).toFixed(3));
          });
          void hx;
        },
      };
    },
  };

  SH.bt_figure = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      BTL.glow(svg, defs, 1300, 560, 700, C.stain, 0.14, g);
      L0(g, `M0 560C400 548 800 570 1200 552C1500 540 1720 556 1920 552`, C.inkSoft, 2, 0.6);
      P0(g, `M0 600C600 590 1300 600 1920 590L1920 1080L0 1080Z`, C.paperLight, 0.7);
      const stream = `M1180 600C1160 680 1020 760 1060 860C1100 960 1300 1020 1400 1080L1920 1080L1920 1000C1700 960 1360 900 1330 820C1300 740 1400 660 1340 600Z`;
      P0(g, stream, C.blue, 0.28);
      L0(g, `M1180 600C1160 680 1020 760 1060 860C1100 960 1300 1020 1400 1080M1340 600C1400 660 1300 740 1330 820C1360 900 1700 960 1920 1000`, C.inkSoft, 2.5);
      const ripples = [0, 1, 2].map(i => L0(g, '', C.ink, 2, 0.4));
      BTL.person(g, 'kneel', 880, 880, 330, {});
      return {
        update(lt) {
          ripples.forEach((r, i) => { const ph = ((lt * 0.3 + i / 3) % 1), w = 30 + ph * 80; r.setAttribute('d', `M${1150 - w} ${880 + i * 4}C${1150 - w / 2} ${872 + i * 4} ${1150 + w / 2} ${872 + i * 4} ${1150 + w} ${880 + i * 4}`); r.setAttribute('stroke-opacity', (0.5 * (1 - ph)).toFixed(3)); });
        },
      };
    },
  };

  SH.bt_fire = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g');
      if (P.mode === 'hand') {
        const fi = fire(g, svg, defs, 840, 900, 1.2);
        const pot = BTL.drawing(place(g, 840, 640, 1.15)); BTL.OBJ.pot(pot, { liquid: true });
        const st = [0, 1, 2, 3].map(() => L0(g, '', C.ink, 3));
        // an open hand reaching left (forearm, palm, four fingers, thumb), silhouette with a rim line
        const hand = el(g, 'g');
        const limb = (d, w) => { L0(hand, d, C.inkSoft, w + 4, 0.9); L0(hand, d, C.paperDark, w); };
        limb('M420 40L90 34', 78);
        el(hand, 'path', { d: BTL.E(40, 34, 70, 48), fill: C.inkSoft, 'fill-opacity': 0.9 });
        el(hand, 'path', { d: BTL.E(40, 34, 67, 45), fill: C.paperDark });
        for (const [y, len] of [[2, 112], [24, 124], [46, 116], [66, 98]]) limb(`M20 ${y}L${20 - len} ${y + 4}`, 21);
        limb('M40 -4L-12 -46', 24);
        return {
          update(lt, dur, cues) {
            fi.update(lt); pot.reveal(1);
            st.forEach((e, i) => { const s = steamD(740 + i * 66, 440, lt, i, 240); e.setAttribute('d', s.d); e.setAttribute('stroke-opacity', s.a.toFixed(3)); });
            const tb = cue(cues, 'back', dur * 0.6), inn = BTL.ease(lt, 0, Math.max(1.5, tb - 0.2)), out = BTL.ease(lt, tb, 1.2);
            const x = 2000 - 760 * inn + 160 * out;
            hand.setAttribute('transform', `translate(${x.toFixed(1)} ${(400 + 16 * out).toFixed(1)})`);
          },
        };
      }
      const st = BTL.stars(g, 120, 17, [0, 0, W, 460]);
      P0(g, `M0 820C600 800 1300 806 1920 818L1920 1080L0 1080Z`, C.paperLight, 0.6);
      const fi = fire(g, svg, defs, 1060, 830, 1);
      L0(g, 'M900 840L1000 560M1220 840L1120 560M1000 560L1120 560', C.inkSoft, 4);
      const pot = BTL.drawing(place(g, 1060, 650, 0.62)); BTL.OBJ.pot(pot, { liquid: true });
      const steam = [0, 1, 2].map(() => L0(g, '', C.ink, 3));
      BTL.person(g, 'sit', 640, 860, 300, {});
      return {
        update(lt) {
          st.update(lt); fi.update(lt); pot.reveal(BTL.ease(lt, 0, 2));
          steam.forEach((e, i) => { const s = steamD(1010 + i * 50, 520, lt, i); e.setAttribute('d', s.d); e.setAttribute('stroke-opacity', (s.a * BTL.ease(lt, 1, 1.5)).toFixed(3)); });
        },
      };
    },
  };

  SH.bt_stones = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      P0(g, `M0 520L1920 520L1920 1080L0 1080Z`, C.paperLight, 0.5);
      L0(g, 'M0 520L1920 520', C.inkSoft, 3);
      const fi = fire(g, svg, defs, 420, 520, 0.8);
      const hot = [[360, 500], [470, 506]].map(([x, y]) => P0(g, BTL.E(x, y, 26, 18), C.red, 0.9));
      const pit = 'M760 520C780 700 900 820 1150 830C1400 820 1520 700 1540 520';
      P0(g, pit + 'Z', C.paperDark, 1);
      P0(g, 'M772 590C800 720 920 812 1150 818C1380 812 1500 720 1528 590Z', C.blue, 0.35);
      L0(g, pit, C.ink, 9);
      L0(g, 'M772 590L1528 590', C.blue, 3);
      const stone = P0(g, '', C.red, 1, { stroke: C.gold, 'stroke-width': 3 });
      const sgl = BTL.glow(svg, defs, 0, 0, 120, C.gold, 0, g);
      const bub = [0, 1, 2, 3, 4, 5].map(() => el(g, 'circle', { r: 7, fill: 'none', stroke: C.ink, 'stroke-width': 2 }));
      const steam = [0, 1, 2, 3].map(() => L0(g, '', C.ink, 3));
      return {
        update(lt, dur, cues) {
          fi.update(lt);
          hot.forEach((e, i) => e.setAttribute('fill-opacity', (0.75 + 0.15 * Math.sin(lt * 1.5 + i)).toFixed(3)));
          const td = cue(cues, 'drop', dur * 0.4), p = clamp01((lt - (td - 1.2)) / 1.2), fall = p * p;
          const x = lerp(470, 1120, Math.min(1, p * 1.2)), y = lt < td - 1.2 ? 506 : lerp(300, 740, fall);
          stone.setAttribute('d', BTL.E(x, y, 30, 22));
          sgl.e.setAttribute('cx', x); sgl.e.setAttribute('cy', y); sgl.set(0.5);
          const boil = BTL.ease(lt, td, 1.5);
          bub.forEach((b, i) => { const ph = ((lt * 0.5 + i / 6) % 1); b.setAttribute('cx', (1020 + i * 40).toFixed(1)); b.setAttribute('cy', (790 - ph * 190).toFixed(1)); b.setAttribute('stroke-opacity', (boil * 0.7 * (1 - ph)).toFixed(3)); });
          steam.forEach((e, i) => { const s = steamD(1000 + i * 60, 520, lt, i, 220); e.setAttribute('d', s.d); e.setAttribute('stroke-opacity', (s.a * boil).toFixed(3)); });
        },
      };
    },
  };

  SH.bt_dip = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      const fi = fire(g, svg, defs, 900, 1100, 1.4);
      const pot = BTL.drawing(place(g, 900, 690, 1.6)); BTL.OBJ.pot(pot, { liquid: true });
      const st = [0, 1, 2].map(() => L0(g, '', C.ink, 3));
      const sc = el(g, 'g'), S = BTL.drawing(place(sc, 0, 0, 0.8)); BTL.OBJ.woodspoon(S);
      return {
        update(lt, dur, cues) {
          fi.update(lt); pot.reveal(1); S.reveal(BTL.ease(lt, 0, 1.4));
          st.forEach((e, i) => { const s = steamD(820 + i * 80, 400, lt, i, 220); e.setAttribute('d', s.d); e.setAttribute('stroke-opacity', s.a.toFixed(3)); });
          const td = cue(cues, 'dip', dur * 0.45), down = BTL.ease(lt, td - 1.6, 1.6), up = BTL.ease(lt, td + 0.6, 1.8);
          const k = down - up * 0.7;
          sc.setAttribute('transform', `translate(${(1230 - 200 * k).toFixed(1)} ${(250 + 230 * k).toFixed(1)}) rotate(${(-55 + 15 * k).toFixed(1)})`);
        },
      };
    },
  };

  SH.bt_field = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      const sun = el(g, 'g'); const sg = BTL.glow(svg, defs, 0, 0, 480, C.stain, 0.3, sun); const disc = P0(sun, BTL.E(0, 0, 80, 80), C.gold, 0.9);
      sg.e.setAttribute('cx', 0); sg.e.setAttribute('cy', 0);
      P0(g, `M0 600C300 560 600 590 900 570C1200 552 1500 590 1920 570L1920 1080L0 1080Z`, C.paper, 1);
      L0(g, `M0 600C300 560 600 590 900 570C1200 552 1500 590 1920 570`, C.inkSoft, 2.5);
      P0(g, `M0 660L1920 660L1920 1080L0 1080Z`, C.paperLight, 0.35);
      const r = rng(311); let back = '', front = '';
      for (let row = 0; row < 3; row++) {
        const y = 700 + row * 70, h = 40 + row * 34, n = 26 - row * 6;
        for (let i = 0; i < n; i++) {
          const x = (i + 0.5 + (r() - 0.5) * 0.5) * (1920 / n), lean = (r() - 0.5) * 12;
          const s = `M${x.toFixed(0)} ${y}Q${(x + lean / 2).toFixed(0)} ${y - h / 2} ${(x + lean).toFixed(0)} ${y - h}`;
          let head = '';
          for (let k = 0; k < 4; k++) { const hy = y - h - k * h * 0.09, hx = x + lean; head += `M${hx.toFixed(0)} ${hy.toFixed(0)}l${(-h * 0.07).toFixed(1)} ${(-h * 0.08).toFixed(1)}M${hx.toFixed(0)} ${hy.toFixed(0)}l${(h * 0.07).toFixed(1)} ${(-h * 0.08).toFixed(1)}`; }
          if (row < 2) back += s + head; else front += s + head;
        }
      }
      L0(g, back, C.inkSoft, 2, 0.7);
      L0(g, front, C.gold, 3.5, 0.9);
      return {
        update(lt, dur) {
          const p = clamp01(lt / Math.max(dur, 6));
          sun.setAttribute('transform', `translate(1250 ${(600 - 70 * p).toFixed(1)})`);
        },
      };
    },
  };

  SH.bt_village = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(svg, 'g');
      const st = BTL.stars(g, 200, 23, [0, 0, W, 420]);
      P0(g, BTL.E(380, 170, 46, 46), C.ink, 0.85);
      L0(g, `M0 520C500 500 1400 506 1920 516`, C.inkSoft, 2, 0.6);
      const r = rng(97), lights = [];
      // rows back to front; each house: roof (top), front wall, side wall, hatch + ladder
      for (let row = 0; row < 4; row++) {
        const y = 520 + row * 120, s = 0.7 + row * 0.22, n = 9 - row;
        let x = -60 + r() * 80;
        for (let i = 0; i < n + 1; i++) {
          const w = (170 + r() * 90) * s, h = (90 + r() * 50) * s, d = 34 * s, top = y - h;
          P0(g, `M${x} ${top}L${x + w} ${top}L${x + w + d} ${top - d * 0.6}L${x + d} ${top - d * 0.6}Z`, C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
          P0(g, `M${x} ${top}L${x + w} ${top}L${x + w} ${y}L${x} ${y}Z`, C.paper, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
          P0(g, `M${x + w} ${top}L${x + w + d} ${top - d * 0.6}L${x + w + d} ${y - d * 0.6}L${x + w} ${y}Z`, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
          if (r() < 0.6) {
            const hx = x + w * (0.3 + r() * 0.4), hy = top - d * 0.3;
            const hatch = P0(g, `M${hx - 18 * s} ${hy}L${hx + 18 * s} ${hy}L${hx + 26 * s} ${hy - 10 * s}L${hx - 10 * s} ${hy - 10 * s}Z`, C.gold, 0.7);
            lights.push({ e: hatch, ph: r() * 6 });
            L0(g, `M${hx - 10 * s} ${hy - 4}L${hx - 2 * s} ${hy - 90 * s}M${hx + 10 * s} ${hy - 4}L${hx + 18 * s} ${hy - 90 * s}` +
              [1, 2, 3, 4].map(k => `M${hx - 10 * s + k * 1.6 * s} ${hy - k * 20 * s}L${hx + 10 * s + k * 1.6 * s} ${hy - k * 20 * s}`).join(''), C.ink, 2.5 * s);
          }
          x += w + d * 0.2;
          if (x > 1980) break;
        }
      }
      return { update(lt) { st.update(lt); lights.forEach(l => l.e.setAttribute('fill-opacity', (0.55 + 0.2 * Math.sin(lt * 0.7 + l.ph)).toFixed(3))); } };
    },
  };
})();
