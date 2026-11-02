// bt_vakai_b: second half of the Vaka-i Hayriye (1826) shots, belgesel style (docs/BELGESEL.md). Uses window.VHL.
//   bt_vh_konak  P: {}  cues: hit        a wooden two-storey mansion at night, ringed by small torches; on "hit" a
//                deep light flares from the cellar, the house sinks into the dark, smoke rises slowly
//   bt_vh_top    P: {mode: "still"|"fire"|"dusk"}  cues: hit   one bronze cannon on a wheeled carriage, side view.
//                still: light slides along the barrel on "hit". fire: on "hit" a muzzle flash, slow smoke rolls out.
//                dusk: the cannon cold in fading light
//   bt_vh_ferman P: {mode: "read"|"seal"}  cues: hit   one long decree on a dark table; the lines write themselves;
//                on "hit" the gold sultan's monogram (tuğra) draws at the top (read) or the page darkens except the
//                monogram and a gold rule under the last line (seal)
//   bt_vh_sancak P: {mode: "chest"|"minber"}  cues: hit   chest: an old chest opens, a folded banner glows inside.
//                minber: the stepped pulpit of a mosque in a beam of light; on "hit" a banner on a pole rises at its top
//   bt_vh_crowd  P: {}  cues: hit       dawn; the six-minaret mosque silhouette; rows of heads gather in the square
//   bt_vh_kisla  P: {mode: "closed"|"fire"}  cues: hit   the long two-storey barracks at Et Meydanı.
//                closed: the gate swings shut, windows go dark one by one. fire: flames on the roof, smoke columns
//   bt_vh_tekke  P: {}  cues: hit       a small domed lodge at dusk, warm light in the open door; on "hit" the door
//                closes and the light goes out; a thin gold bar seals the door
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const { flame, smoke, P0, L0, label, fade, f1 } = window.VHL;

  // ------------------------------------------------------------------ bt_vh_konak
  SH.bt_vh_konak = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 790, cx = 960;
      const st = BTL.stars(g, 100, 61, [0, -200, 1920, 360]);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      const flash = BTL.glow(svg, defs, cx, GR - 60, 700, C.gold, 0, g);
      const house = el(g, 'g'), D = BTL.drawing(house);
      const low = `M${cx - 300} ${GR}L${cx - 300} ${GR - 220}L${cx + 300} ${GR - 220}L${cx + 300} ${GR}Z`;
      const up = `M${cx - 360} ${GR - 220}L${cx - 360} ${GR - 420}L${cx + 360} ${GR - 420}L${cx + 360} ${GR - 220}Z`;
      const roof = `M${cx - 420} ${GR - 420}L${cx} ${GR - 560}L${cx + 420} ${GR - 420}Z`;
      D.f(low, C.paperLight, 1); D.f(up, C.paperLight, 1); D.f(roof, C.paperDark, 1);
      D.s(low, { w: 3.5 }); D.s(up, { w: 3.5 }); D.s(roof, { w: 3.5 });
      let wins = ''; for (let i = -2; i <= 2; i++) wins += `M${cx + i * 130 - 34} ${GR - 380}L${cx + i * 130 + 34} ${GR - 380}L${cx + i * 130 + 34} ${GR - 260}L${cx + i * 130 - 34} ${GR - 260}Z`;
      D.s(wins, { w: 2.5, color: C.inkSoft });
      let boards = ''; for (let y = GR - 200; y < GR; y += 36) boards += `M${cx - 300} ${y}L${cx + 300} ${y}`;
      D.s(boards, { w: 1.5, color: C.inkSoft, alpha: 0.4 });
      D.s(`M${cx - 60} ${GR}L${cx - 60} ${GR - 140}L${cx + 60} ${GR - 140}L${cx + 60} ${GR}`, { w: 3 });
      // the cellar line: where the light comes from
      const cellar = L0(g, `M${cx - 300} ${GR - 6}L${cx + 300} ${GR - 6}`, C.gold, 6, 0);
      const torches = [];
      for (const [x, s] of [[300, 0.22], [480, 0.26], [1440, 0.26], [1620, 0.22], [660, 0.18], [1260, 0.18]]) {
        L0(g, `M${x} ${GR + 40}L${x} ${GR - 10}`, C.inkSoft, 4, 0.8);
        torches.push(flame(g, x, GR - 10, s, x * 0.01));
      }
      const sm = smoke(g, cx, GR - 300, { n: 14, h: 640, r0: 70, r1: 260, a: 0.24, sp: 0.05, drift: 120, defs });
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.6));
          const h = cue(cues, 'hit', dur * 0.5), fl = BTL.ease(lt, h, 0.5) * (1 - 0.7 * BTL.ease(lt, h + 0.5, 2.5));
          for (const t of torches) t.update(lt, 1 - 0.6 * BTL.ease(lt, h, 1.5));
          flash.set(0.45 * fl); cellar.setAttribute('stroke-opacity', (0.9 * fl).toFixed(3));
          fade(house, 1 - 0.65 * BTL.ease(lt, h + 0.4, 2.5));
          sm.update(lt, BTL.ease(lt, h + 0.3, 1.5));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_top
  SH.bt_vh_top = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'still', { g } = BTL.stage(svg, W, H, { fx: 920, fy: 560 });
      const GR = 800, cx = 860;
      const pool = BTL.glow(svg, defs, cx, GR - 160, 600, C.stain, 0.26, g);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.8);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      el(g, 'path', { d: BTL.E(cx, GR + 20, 460, 40), fill: C.paperDark, 'fill-opacity': 0.6 });
      const D = BTL.drawing(g);
      // barrel: breech knob on the left, muzzle on the right, slightly raised
      const bar = el(g, 'g', { transform: `translate(${cx} ${GR - 250}) rotate(-8)` }), Db = BTL.drawing(bar);
      const barrel = 'M-330-58C-360-58-370 58-330 58L380 34C392 34 396-34 380-34Z';
      Db.f(barrel, C.paperLight, 1); Db.s(barrel, { w: 4 });
      Db.s(BTL.E(-382, 0, 22, 22) + 'M-360 0L-345 0', { w: 4 });
      Db.s('M-230-56L-230 56M-80-50L-80 50M200-40L200 40M370-36L370 36', { w: 3, color: C.inkSoft });
      Db.s('M380-22L404-22L404 22L380 22', { w: 4 });
      const shine = el(bar, 'path', { d: 'M-300-36L360-22', stroke: C.gold, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', pathLength: 1 });
      // carriage + wheel
      const car = `M${cx - 360} ${GR - 40}L${cx - 300} ${GR - 70}L${cx + 140} ${GR - 230}L${cx + 180} ${GR - 200}L${cx - 250} ${GR - 30}Z`;
      D.f(car, C.paperLight, 0.9); D.s(car, { w: 3.5 });
      D.f(BTL.E(cx - 40, GR - 130, 130, 130), C.paperDark, 1);
      D.s(BTL.E(cx - 40, GR - 130, 130, 130), { w: 4 }); D.s(BTL.E(cx - 40, GR - 130, 24, 24), { w: 3 });
      let sp = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; sp += `M${f1(cx - 40 + 24 * Math.cos(a))} ${f1(GR - 130 + 24 * Math.sin(a))}L${f1(cx - 40 + 124 * Math.cos(a))} ${f1(GR - 130 + 124 * Math.sin(a))}`; }
      D.s(sp, { w: 2.5, color: C.inkSoft });
      const mx = cx + 404 * Math.cos(-8 * Math.PI / 180), my = GR - 250 + 404 * Math.sin(-8 * Math.PI / 180);
      const flash = BTL.glow(svg, defs, mx + 60, my, 300, C.gold, 0, g);
      const sm = smoke(g, mx + 80, my + 20, { n: 12, h: 160, r0: 40, r1: 200, a: 0.26, sp: 0.09, drift: 700, defs });
      const fuse = el(g, 'circle', { cx: cx - 330 * Math.cos(-8 * Math.PI / 180) + 30, cy: GR - 250 - 70, r: 6, fill: C.gold, 'fill-opacity': 0 });
      return {
        update(lt, dur, cues) {
          const h = cue(cues, 'hit', dur * 0.45);
          const rv = mode === 'fire' ? 0.6 : 1.6; D.reveal(BTL.ease(lt, 0, rv)); Db.reveal(BTL.ease(lt, 0, rv));
          const dim = mode === 'dusk' ? BTL.ease(lt, 0.5, dur * 0.8) : 0;
          pool.set((0.24 + 0.02 * Math.sin(lt * 0.8)) * (1 - 0.6 * dim));
          if (mode === 'fire') {
            fuse.setAttribute('fill-opacity', ((1 - BTL.ease(lt, h, 0.2)) * BTL.ease(lt, 0.6, 0.6) * (0.7 + 0.3 * Math.sin(lt * 5))).toFixed(3));
            const f = lt >= h ? Math.exp(-(lt - h) * 2.2) : 0;
            flash.set(0.6 * f);
            sm.update(Math.max(0, lt - h) + 0.001, BTL.ease(lt, h, 0.4));
            draw(shine, 0);
          } else {
            draw(shine, BTL.ease(lt, mode === 'dusk' ? 0.4 : h, 2)); shine.setAttribute('stroke-opacity', (0.7 * (1 - dim)).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_ferman
  SH.bt_vh_ferman = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'read', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, top = portrait ? 200 : 70, bot = portrait ? 1120 : 900, pw = portrait ? 680 : 620;
      const lamp = BTL.glow(svg, defs, cx, (top + bot) / 2, 700, C.stain, 0.2, g);
      const page = `M${cx - pw / 2} ${top}L${cx + pw / 2} ${top}L${cx + pw / 2} ${bot}L${cx - pw / 2} ${bot}Z`;
      P0(g, page, C.paperLight, 1);
      L0(g, page, C.inkSoft, 2.5, 0.8);
      // the monogram: three tall stems, a big loop to the left, a sweeping base
      const ty = top + 210, tg = el(g, 'g', { transform: `translate(${cx + 20} ${ty}) scale(${portrait ? 1.05 : 0.95})` });
      const TU = [
        'M40 40L40-150M75 40L75-160M110 40L110-170',
        'M40 40C-60 30-200 0-200-50C-200-100-120-110-60-80C0-50 20 10 0 40C-40 90-180 90-230 40',
        'M-120 40C-20 80 120 80 200 40',
        'M40-150C60-130 70-120 80-118M110-170C130-150 140-140 150-138',
      ];
      const tug = TU.map(d => el(tg, 'path', { d, fill: 'none', stroke: C.gold, 'stroke-width': 4.5, 'stroke-linecap': 'round', pathLength: 1 }));
      const lines = [], n = portrait ? 11 : 9, y0 = ty + 110, gap = (bot - 60 - y0) / (n - 1);
      for (let i = 0; i < n; i++) {
        const y = y0 + i * gap, w = (pw - 120) * (i === n - 1 ? 0.5 : 0.92 + 0.08 * Math.sin(i * 2.1));
        let d = `M${f1(cx - (pw - 120) / 2)} ${f1(y)}`;
        for (let x = 0; x < w; x += 46) d += `c12 -10 22 8 34 -2l12 2`;
        lines.push(el(g, 'path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-opacity': 0.8 }));
      }
      const rule = el(g, 'path', { d: `M${cx - 120} ${bot - 30}L${cx + 120} ${bot - 30}`, stroke: C.gold, 'stroke-width': 4, pathLength: 1, fill: 'none' });
      return {
        update(lt, dur, cues) {
          const h = cue(cues, 'hit', dur * 0.5);
          lamp.set(0.18 + 0.02 * Math.sin(lt * 1.3));
          const tAt = mode === 'read' ? h : 0.2;
          tug.forEach((e, i) => draw(e, BTL.ease(lt, tAt + i * 0.25, 1.2)));
          const span = Math.max(1.5, (mode === 'read' ? dur - 0.6 : h) - 0.6);
          lines.forEach((e, i) => { draw(e, clamp01((lt - 0.6 - i * span / n) / (span / n * 1.2))); });
          if (mode === 'seal') {
            draw(rule, BTL.ease(lt, h, 1));
            lines.forEach(e => e.setAttribute('stroke-opacity', (0.8 * (1 - 0.6 * BTL.ease(lt, h + 0.5, 1.5))).toFixed(3)));
          } else draw(rule, 0);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_sancak
  SH.bt_vh_sancak = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'minber', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 540 });
      const GR = 800, cx = 960;
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.4);
      const D = BTL.drawing(g);
      if (mode === 'chest') {
        const pool = BTL.glow(svg, defs, cx, GR - 200, 520, C.gold, 0, g);
        const box = `M${cx - 330} ${GR}L${cx - 330} ${GR - 240}L${cx + 330} ${GR - 240}L${cx + 330} ${GR}Z`;
        D.f(box, C.paperLight, 1); D.s(box, { w: 4 });
        D.s(`M${cx - 330} ${GR - 170}L${cx + 330} ${GR - 170}M${cx - 330} ${GR - 70}L${cx + 330} ${GR - 70}`, { w: 2, color: C.inkSoft });
        D.s(`M${cx - 40} ${GR - 240}L${cx - 40} ${GR - 190}L${cx + 40} ${GR - 190}L${cx + 40} ${GR - 240}`, { w: 3, color: C.gold });
        // folded cloth inside
        const cloth = P0(g, `M${cx - 270} ${GR - 240}C${cx - 200} ${GR - 300} ${cx + 200} ${GR - 300} ${cx + 270} ${GR - 240}Z`, C.gold, 0);
        // the lid, hinged at the back edge, opening
        const lid = el(g, 'g');
        const lidD = `M${cx - 340} ${GR - 240}L${cx - 340} ${GR - 300}C${cx - 340} ${GR - 360} ${cx + 340} ${GR - 360} ${cx + 340} ${GR - 300}L${cx + 340} ${GR - 240}Z`;
        P0(lid, lidD, C.paperLight, 1); L0(lid, lidD, C.ink, 4);
        const rays = L0(g, `M${cx - 200} ${GR - 300}L${cx - 360} ${GR - 760}M${cx} ${GR - 320}L${cx} ${GR - 820}M${cx + 200} ${GR - 300}L${cx + 360} ${GR - 760}`, C.gold, 2, 0);
        return {
          update(lt, dur, cues) {
            const h = cue(cues, 'hit', dur * 0.4), o = BTL.ease(lt, h, 2.2);
            D.reveal(BTL.ease(lt, 0, 1.4));
            lid.setAttribute('transform', `translate(0 ${f1(-o * 120)}) rotate(${f1(-o * 14)} ${cx + 340} ${GR - 240})`);
            cloth.setAttribute('fill-opacity', (0.7 * o).toFixed(3)); pool.set(0.3 * o * (1 + 0.06 * Math.sin(lt * 1.2)));
            rays.setAttribute('stroke-opacity', (0.25 * BTL.ease(lt, h + 0.8, 2)).toFixed(3));
          },
        };
      }
      // the minber: a stair rising to the right to a small cone-roofed kiosk, in a beam of light (scaled to fit)
      const mg = el(g, 'g', { transform: `translate(${cx} ${GR}) scale(0.78) translate(${-cx} ${-GR})` });
      const D2 = BTL.drawing(mg);
      const beam = P0(mg, `M${cx + 40} -100L${cx + 260} -100L${cx + 520} ${GR}L${cx - 220} ${GR}Z`, C.stain, 0.07);
      const pool = BTL.glow(svg, defs, cx + 160, GR - 280, 520, C.stain, 0.24, mg);
      const side = `M${cx - 380} ${GR}L${cx + 160} ${GR - 420}L${cx + 300} ${GR - 420}L${cx + 300} ${GR}Z`;
      D2.f(side, C.paperLight, 1); D2.s(side, { w: 4 });
      D2.s(`M${cx - 260} ${GR}L${cx - 260} ${GR - 160}C${cx - 260} ${GR - 260} ${cx - 120} ${GR - 260} ${cx - 120} ${GR - 160}L${cx - 120} ${GR}`, { w: 3 });
      let rail = ''; for (let i = 0; i < 9; i++) { const x = cx - 340 + i * 60, y = GR - 30 - i * 47; rail += `M${x} ${y}L${x} ${y - 60}`; }
      D2.s(rail + `M${cx - 340} ${GR - 90}L${cx + 160} ${GR - 480}`, { w: 2.5, color: C.inkSoft });
      const kiosk = `M${cx + 160} ${GR - 420}L${cx + 160} ${GR - 600}L${cx + 300} ${GR - 600}L${cx + 300} ${GR - 420}M${cx + 150} ${GR - 600}L${cx + 230} ${GR - 760}L${cx + 310} ${GR - 600}Z`;
      D2.f(`M${cx + 150} ${GR - 600}L${cx + 230} ${GR - 760}L${cx + 310} ${GR - 600}Z`, C.paperDark, 1); D2.s(kiosk, { w: 3.5 });
      D2.s(`M${cx + 230} ${GR - 760}L${cx + 230} ${GR - 800}`, { w: 3, color: C.gold });
      // the banner: pole and cloth, rising on "hit"
      const ban = el(mg, 'g');
      L0(ban, `M${cx + 120} ${GR - 430}L${cx + 120} ${GR - 900}`, C.ink, 5);
      el(ban, 'circle', { cx: cx + 120, cy: GR - 912, r: 12, fill: C.gold });
      const cloth = P0(ban, '', C.gold, 0.85);
      const clothL = L0(ban, '', C.ink, 2.5, 0.8);
      return {
        update(lt, dur, cues) {
          D2.reveal(BTL.ease(lt, 0, 1.6));
          const h = cue(cues, 'hit', dur * 0.45), p = BTL.ease(lt, h, 2);
          beam.setAttribute('fill-opacity', (0.05 + 0.03 * p).toFixed(3)); pool.set(0.22 + 0.06 * p);
          ban.setAttribute('transform', `translate(0 ${f1((1 - p) * 140)})`); fade(ban, p);
          const x0 = cx + 120, y0 = GR - 890, w = 200, hh = 150, s = 6 * Math.sin(lt * 0.7);
          const d = `M${x0} ${y0}C${x0 + w * 0.4} ${y0 + s} ${x0 + w * 0.7} ${y0 - s} ${x0 + w} ${y0 + 4}L${x0 + w + 4} ${y0 + hh}C${x0 + w * 0.7} ${y0 + hh - s} ${x0 + w * 0.4} ${y0 + hh + s} ${x0} ${y0 + hh}Z`;
          cloth.setAttribute('d', d); clothL.setAttribute('d', d);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_crowd
  SH.bt_vh_crowd = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 660, cx = 960;
      const dawn = BTL.glow(svg, defs, cx, GR, 900, C.stain, 0, g);
      const D = BTL.drawing(g);
      // the mosque: central dome, half domes, a cascade of small domes, six minarets
      let m = `M${cx - 520} ${GR}L${cx - 520} ${GR - 120}L${cx - 360} ${GR - 120}C${cx - 360} ${GR - 190} ${cx - 240} ${GR - 210} ${cx - 210} ${GR - 200}`;
      m += `C${cx - 200} ${GR - 300} ${cx - 140} ${GR - 330} ${cx - 120} ${GR - 330}C${cx - 110} ${GR - 450} ${cx + 110} ${GR - 450} ${cx + 120} ${GR - 330}`;
      m += `C${cx + 140} ${GR - 330} ${cx + 200} ${GR - 300} ${cx + 210} ${GR - 200}C${cx + 240} ${GR - 210} ${cx + 360} ${GR - 190} ${cx + 360} ${GR - 120}L${cx + 520} ${GR - 120}L${cx + 520} ${GR}Z`;
      let mins = '';
      for (const [x, ht] of [[-620, 420], [-460, 470], [-300, 500], [300, 500], [460, 470], [620, 420]]) {
        const X = cx + x;
        mins += `M${X - 9} ${GR}L${X - 9} ${GR - ht}L${X} ${GR - ht - 60}L${X + 9} ${GR - ht}L${X + 9} ${GR}Z`;
        mins += `M${X - 15} ${GR - ht * 0.6}L${X + 15} ${GR - ht * 0.6}L${X + 15} ${GR - ht * 0.6 + 7}L${X - 15} ${GR - ht * 0.6 + 7}Z`;
      }
      D.f(m + mins, C.paperDark, 1);
      D.s(m.replace(/Z$/, ''), { w: 3, color: C.ink }); D.s(mins, { w: 2, color: C.inkSoft });
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperLight, 0.5);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.5);
      // rows of heads gathering (y 760..900)
      const r = rng(1826), heads = [];
      for (let row = 0; row < 4; row++) for (let i = 0; i < 26; i++) {
        const x = 120 + i * 66 + (row % 2) * 33 + r() * 12, y = 690 + row * 40, s = 14 + row * 3;
        heads.push({ e: el(g, 'path', { d: `M${f1(x - s)} ${f1(y + s * 1.6)}C${f1(x - s)} ${f1(y + s * 0.4)} ${f1(x - s * 0.8)} ${f1(y)} ${f1(x)} ${f1(y)}C${f1(x + s * 0.8)} ${f1(y)} ${f1(x + s)} ${f1(y + s * 0.4)} ${f1(x + s)} ${f1(y + s * 1.6)}Z`, fill: C.paperDark, stroke: C.inkSoft, 'stroke-width': 1.5, opacity: 0 }), at: Math.abs(i - 12.5) / 13 + r() * 0.3 + row * 0.15 });
      }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          dawn.set(0.08 + 0.18 * BTL.ease(lt, 0.3, dur * 0.8));
          const h = cue(cues, 'hit', dur * 0.3), span = Math.max(1.5, dur - h - 0.8);
          for (const hd of heads) fade(hd.e, BTL.ease(lt, h + hd.at * span * 0.6, 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_kisla
  SH.bt_vh_kisla = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'closed', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 780, x0 = 260, x1 = 1660, cx = 960;
      const st = BTL.stars(g, 90, 71, [0, -200, 1920, 320]);
      const red = BTL.glow(svg, defs, cx, GR - 300, 900, C.red, 0, g);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      const D = BTL.drawing(g);
      const body = `M${x0} ${GR}L${x0} ${GR - 300}L${x1} ${GR - 300}L${x1} ${GR}Z`, roof = `M${x0 - 40} ${GR - 300}L${x0 + 80} ${GR - 380}L${x1 - 80} ${GR - 380}L${x1 + 40} ${GR - 300}Z`;
      D.f(body, C.paperLight, 1); D.f(roof, C.paperDark, 1); D.s(body, { w: 3.5 }); D.s(roof, { w: 3.5 });
      D.s(`M${x0} ${GR - 150}L${x1} ${GR - 150}`, { w: 2, color: C.inkSoft });
      const gateD = `M${cx - 80} ${GR}L${cx - 80} ${GR - 110}C${cx - 80} ${GR - 180} ${cx + 80} ${GR - 180} ${cx + 80} ${GR - 110}L${cx + 80} ${GR}`;
      D.s(gateD, { w: 4 });
      const wins = [];
      for (const y of [GR - 260, GR - 110]) for (let x = x0 + 60; x < x1 - 40; x += 100) {
        if (Math.abs(x + 18 - cx) < 130 && y > GR - 200) continue;
        wins.push({ e: el(g, 'rect', { x, y, width: 36, height: 60, fill: C.gold, 'fill-opacity': 0, stroke: C.inkSoft, 'stroke-width': 1.5 }), k: wins.length });
      }
      const gate = P0(g, `M${cx - 80} ${GR}L${cx - 80} ${GR - 110}C${cx - 80} ${GR - 180} ${cx + 80} ${GR - 180} ${cx + 80} ${GR - 110}L${cx + 80} ${GR}Z`, C.gold, 0);
      const doors = el(g, 'g');
      const dl = P0(doors, '', C.paperDark, 1), dr = P0(doors, '', C.paperDark, 1);
      const fires = [], smokes = [];
      if (mode === 'fire') for (const [x, s] of [[480, 0.9], [820, 1.2], [1180, 1.0], [1470, 0.8]]) {
        fires.push(flame(g, x, GR - 360, s, x * 0.003));
        smokes.push(smoke(g, x, GR - 460, { n: 12, h: 600, r0: 50, r1: 200, a: 0.2, sp: 0.05 + s * 0.01, drift: 180, defs }));
      }
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.6));
          const h = cue(cues, 'hit', dur * 0.5);
          if (mode === 'closed') {
            const shut = BTL.ease(lt, h, 1.6), w = 80 * shut;
            dl.setAttribute('d', `M${cx - 80} ${GR}L${cx - 80} ${GR - 150}L${f1(cx - 80 + w)} ${GR - 150}L${f1(cx - 80 + w)} ${GR}Z`);
            dr.setAttribute('d', `M${cx + 80} ${GR}L${cx + 80} ${GR - 150}L${f1(cx + 80 - w)} ${GR - 150}L${f1(cx + 80 - w)} ${GR}Z`);
            gate.setAttribute('fill-opacity', (0.5 * BTL.ease(lt, 0.4, 1) * (1 - shut)).toFixed(3));
            for (const wi of wins) wi.e.setAttribute('fill-opacity', (0.5 * BTL.ease(lt, 0.5, 1) * (1 - BTL.ease(lt, h + 0.6 + (wi.k % 13) * 0.18, 0.8))).toFixed(3));
          } else {
            dl.setAttribute('d', `M${cx - 80} ${GR}L${cx - 80} ${GR - 150}L${cx} ${GR - 150}L${cx} ${GR}Z`);
            dr.setAttribute('d', `M${cx + 80} ${GR}L${cx + 80} ${GR - 150}L${cx} ${GR - 150}L${cx} ${GR}Z`);
            const a = BTL.ease(lt, 0.3, 2);
            red.set((0.22 + 0.04 * Math.sin(lt * 1.3)) * a);
            fires.forEach((f, i) => f.update(lt, BTL.ease(lt, 0.3 + i * 0.4, 1.5)));
            smokes.forEach((s, i) => s.update(lt, BTL.ease(lt, 0.6 + i * 0.4, 1.5)));
            for (const wi of wins) wi.e.setAttribute('fill-opacity', (0.55 * a * (0.7 + 0.3 * Math.sin(lt * 1.7 + wi.k))).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_tekke
  SH.bt_vh_tekke = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 800, cx = 960;
      const st = BTL.stars(g, 80, 91, [0, -200, 1920, 340]);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      // a cypress on each side
      for (const x of [520, 1400]) P0(g, `M${x} ${GR}C${x - 50} ${GR - 200} ${x - 30} ${GR - 420} ${x} ${GR - 520}C${x + 30} ${GR - 420} ${x + 50} ${GR - 200} ${x} ${GR}Z`, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      const D = BTL.drawing(g);
      const body = `M${cx - 260} ${GR}L${cx - 260} ${GR - 300}L${cx + 260} ${GR - 300}L${cx + 260} ${GR}Z`;
      const dome = `M${cx - 220} ${GR - 300}C${cx - 220} ${GR - 560} ${cx + 220} ${GR - 560} ${cx + 220} ${GR - 300}Z`;
      D.f(body, C.paperLight, 1); D.f(dome, C.paperLight, 1);
      D.s(body, { w: 3.5 }); D.s(dome, { w: 3.5 });
      D.s(`M${cx} ${GR - 495}L${cx} ${GR - 560}`, { w: 3, color: C.inkSoft });
      const doorD = `M${cx - 70} ${GR}L${cx - 70} ${GR - 160}C${cx - 70} ${GR - 220} ${cx + 70} ${GR - 220} ${cx + 70} ${GR - 160}L${cx + 70} ${GR}Z`;
      const light = P0(g, doorD, C.gold, 0);
      const spill = el(g, 'path', { d: `M${cx - 70} ${GR}L${cx + 70} ${GR}L${cx + 200} ${GR + 160}L${cx - 200} ${GR + 160}Z`, fill: C.gold, 'fill-opacity': 0 });
      const cp = el(defs, 'clipPath', { id: 'vhtekkedoor' }); el(cp, 'path', { d: doorD });
      const door = P0(g, '', C.paperDark, 1, { 'clip-path': 'url(#vhtekkedoor)' });
      const bar = el(g, 'path', { d: `M${cx - 90} ${GR - 90}L${cx + 90} ${GR - 90}`, stroke: C.gold, 'stroke-width': 6, 'stroke-linecap': 'round', pathLength: 1, fill: 'none' });
      L0(g, doorD.replace(/Z$/, ''), C.ink, 3.5);
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.5));
          const h = cue(cues, 'hit', dur * 0.45), c = BTL.ease(lt, h, 1.6), a = BTL.ease(lt, 0.5, 1) * (1 - c);
          light.setAttribute('fill-opacity', (0.55 * a * (1 + 0.06 * Math.sin(lt * 2.1))).toFixed(3));
          spill.setAttribute('fill-opacity', (0.12 * a).toFixed(3));
          const w = 140 * c;
          door.setAttribute('d', `M${cx - 70} ${GR}L${cx - 70} ${GR - 210}L${f1(cx - 70 + w)} ${GR - 210}L${f1(cx - 70 + w)} ${GR}Z`);
          draw(bar, BTL.ease(lt, h + 1.4, 1));
        },
      };
    },
  };
})();
