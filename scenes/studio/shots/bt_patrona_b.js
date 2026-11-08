// bt_patrona_b: second half of the Patrona Halil (1730) shots, belgesel style (docs/BELGESEL.md). Uses window.PTL.
//   bt_pt_hamam   P: {}  cues: hit   inside a bath: a great dome with small star-shaped skylights, slanting beams of
//                 light, the octagonal warm stone in the middle, steam rising slowly; one faceless figure stands beside
//                 it (on "hit" a thin gold rim lights his outline)
//   bt_pt_kandil  P: {mode: "lit"|"out"}  cues: hit   one hanging glass oil lamp on three chains in a dark niche.
//                 out: from "hit" the flame sinks and goes out, the light pool fades, a thin thread of smoke rises
//   bt_pt_muhur   P: {mode: "lit"|"take", label}  cues: hit   the grand vizier's seal: a round seal with a knob
//                 handle on a low cushion, its gold impression on a sheet beside it. lit: on "hit" the impression
//                 glows and `label` appears. take: on "hit" the seal slides slowly out of the light into the dark,
//                 the light pool narrows over the empty cushion
//   bt_pt_oda     P: {mode: "enter"|"close"}  cues: hit   a palace corridor at night: a tall arched double door with
//                 light inside. enter: a faceless figure walks slowly from the left into the light. close: on "hit"
//                 the two leaves swing shut, the light narrows to a line and goes out
//   bt_pt_gazete  P: {text, year}  cues: hit   an old newspaper page on a dark desk under lamp light: columns write
//                 themselves, a big headline `text`; on "hit" `year` appears in gold beside it
//   bt_pt_alay    P: {}  cues: hit   dawn on a road: far right a hill with a mosque (one dome, two minarets); two
//                 faceless figures walk slowly to the right, the first in a tall turban, the second bareheaded;
//                 on "hit" the second figure's outline turns gold
//   bt_pt_tug     P: {label}  cues: hit   dusk over the battlements of a city wall, a distant dome; a horse-tail
//                 standard (pole, gold finial, hanging tails moving slowly) stands on the wall; on "hit" it tilts
//                 slowly and sinks behind the wall, `label` fades in below
//   bt_pt_ordu    P: {}  cues: hit   night on the Asian shore: across the water the old city's small skyline; on the
//                 near hill rows of round peaked tents and a large pavilion tent with a lit door, small fires between;
//                 the moon crosses the sky slowly; from "hit" the fires sink low one by one (the waiting army)
//   bt_pt_kahve   P: {}  cues: hit   a coffeehouse at dusk: a low bench along the back wall with three seated faceless
//                 men, small cups beside them, a hanging lamp; in front a brazier with a coffee pot (cezve) and steam;
//                 on "hit" the two men at the sides lean in towards the middle one (talking low)
//   bt_pt_sebep   P: {labels: [a, b, c, d]}  cues: a, b, c, d, hit   four small signs in a row (a standard, a sealed
//                 letter, a stack of coins, a tent) appear on their cues with italic labels; on "hit" thin lines run
//                 from each to one small gold spark below them
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const K = () => window.PTL;
  let ODA = 0;

  // ------------------------------------------------------------------ bt_pt_hamam
  SH.bt_pt_hamam = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, floor } = K();
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820, cx = 960;
      P0(g, `M-200 -200L2120 -200L2120 ${GR}L-200 ${GR}Z`, C.paperDark, 0.6);
      const D = BTL.drawing(g);
      const dome = `M300 ${GR - 300}C300 ${GR - 860} 1620 ${GR - 860} 1620 ${GR - 300}`;
      D.s(dome, { w: 4 });
      D.s(`M300 ${GR - 300}L300 ${GR}M1620 ${GR - 300}L1620 ${GR}M240 ${GR - 300}L1680 ${GR - 300}`, { w: 3, color: C.inkSoft });
      let niches = ''; for (const x of [380, 560, 1240, 1420]) niches += `M${x} ${GR - 40}L${x} ${GR - 200}C${x} ${GR - 260} ${x + 120} ${GR - 260} ${x + 120} ${GR - 200}L${x + 120} ${GR - 40}`;
      D.s(niches, { w: 2, color: C.inkSoft, alpha: 0.7 });
      // star skylights in the dome
      const sky = [];
      const star = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr); } return d + 'Z'; };
      [[960, 160, 26], [800, 190, 20], [1120, 190, 20], [660, 250, 16], [1260, 250, 16], [880, 260, 14], [1040, 260, 14]].forEach(([x, y, r], i) => {
        sky.push({ e: P0(g, star(x, y, r), C.ink, 0), i });
      });
      const beams = [[960, 160, 860], [800, 190, 640], [1120, 190, 1240]].map(([x, y, x2], i) =>
        P0(g, `M${x - 16} ${y}L${x + 16} ${y}L${x2 + 90} ${GR}L${x2 - 90} ${GR}Z`, C.stain, 0));
      floor(g, GR, 0.7);
      const stone = `M${cx - 300} ${GR + 40}L${cx - 220} ${GR - 30}L${cx + 220} ${GR - 30}L${cx + 300} ${GR + 40}L${cx + 300} ${GR + 90}L${cx - 300} ${GR + 90}Z`;
      D.f(stone, C.paperLight, 1); D.s(stone, { w: 3.5 }); D.s(`M${cx - 300} ${GR + 40}L${cx + 300} ${GR + 40}`, { w: 2, color: C.inkSoft });
      const gl = BTL.glow(svg, defs, cx, GR - 200, 620, C.stain, 0.2, g);
      // steam
      const r = rng(1730), puffs = [], sid = 'pthm' + (++ODA), rg = el(defs, 'radialGradient', { id: sid });
      el(rg, 'stop', { offset: '0', 'stop-color': C.inkSoft, 'stop-opacity': 1 }); el(rg, 'stop', { offset: '0.6', 'stop-color': C.inkSoft, 'stop-opacity': 0.4 }); el(rg, 'stop', { offset: '1', 'stop-color': C.inkSoft, 'stop-opacity': 0 });
      for (let i = 0; i < 12; i++) puffs.push({ e: el(g, 'circle', { r: 30, fill: `url(#${sid})`, 'fill-opacity': 0 }), x: cx - 260 + r() * 520, ph: r(), sp: 0.04 + r() * 0.03 });
      const fig = BTL.person(g, 'stand', cx + 420, GR + 60, 330, { color: C.paperDark, rim: C.inkSoft, face: -1 });
      const rim = BTL.person(g, 'stand', cx + 420, GR + 60, 330, { color: C.paperDark, rim: C.gold, face: -1 });
      fade(rim, 0);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2));
          const a = BTL.ease(lt, 0.6, 1.6);
          for (const s of sky) s.e.setAttribute('fill-opacity', (a * (0.7 + 0.15 * Math.sin(lt * 0.5 + s.i))).toFixed(3));
          beams.forEach((b, i) => b.setAttribute('fill-opacity', (a * (0.07 + 0.015 * Math.sin(lt * 0.4 + i * 2))).toFixed(3)));
          gl.set(0.18 + 0.02 * Math.sin(lt * 0.6));
          for (const p of puffs) {
            const ph = (p.ph + lt * p.sp) % 1;
            p.e.setAttribute('cx', f1(p.x + 40 * Math.sin(lt * 0.25 + p.ph * 6))); p.e.setAttribute('cy', f1(GR - 40 - ph * 520));
            p.e.setAttribute('r', f1(30 + ph * 90)); p.e.setAttribute('fill-opacity', (0.16 * Math.sin(ph * Math.PI)).toFixed(3));
          }
          fade(fig, BTL.ease(lt, 0.8, 1.4));
          fade(rim, 0.9 * BTL.ease(lt, cue(cues, 'hit', dur * 0.6), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_kandil
  SH.bt_pt_kandil = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, flame } = K();
      const mode = P.mode || 'lit', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, ly = portrait ? 760 : 520;
      // a faint pointed niche behind
      L0(g, `M${cx - 330} ${ly + 420}L${cx - 330} ${ly - 200}C${cx - 330} ${ly - 380} ${cx - 120} ${ly - 470} ${cx} ${ly - 520}C${cx + 120} ${ly - 470} ${cx + 330} ${ly - 380} ${cx + 330} ${ly - 200}L${cx + 330} ${ly + 420}`, C.inkSoft, 2, 0.3);
      const gl = BTL.glow(svg, defs, cx, ly - 40, 480, C.gold, 0.3, g);
      const D = BTL.drawing(g);
      D.s(`M${cx} -40L${cx} ${ly - 330}M${cx} ${ly - 330}L${cx - 120} ${ly - 120}M${cx} ${ly - 330}L${cx} ${ly - 130}M${cx} ${ly - 330}L${cx + 120} ${ly - 120}`, { w: 2, color: C.inkSoft });
      D.s(BTL.E(cx, ly - 336, 14, 14), { w: 3, color: C.gold });
      const glass = `M${cx - 130} ${ly - 120}L${cx + 130} ${ly - 120}C${cx + 140} ${ly - 30} ${cx + 90} ${ly + 50} ${cx + 30} ${ly + 80}L${cx + 22} ${ly + 120}L${cx - 22} ${ly + 120}L${cx - 30} ${ly + 80}C${cx - 90} ${ly + 50} ${cx - 140} ${ly - 30} ${cx - 130} ${ly - 120}Z`;
      D.f(glass, C.paperLight, 0.55); D.s(glass, { w: 3.5 });
      D.s(`M${cx - 136} ${ly - 120}L${cx + 136} ${ly - 120}`, { w: 4 });
      D.s(`M${cx - 110} ${ly - 60}C${cx - 40} ${ly - 40} ${cx + 40} ${ly - 40} ${cx + 110} ${ly - 60}`, { w: 2, color: C.gold, alpha: 0.8 });
      D.f(`M${cx - 70} ${ly + 30}C${cx - 30} ${ly + 50} ${cx + 30} ${ly + 50} ${cx + 70} ${ly + 30}C${cx + 50} ${ly + 70} ${cx - 50} ${ly + 70} ${cx - 70} ${ly + 30}Z`, C.gold, 0.5);
      const fl = flame(g, cx, ly + 20, 0.42, 0);
      const smoke = L0(g, '', C.inkSoft, 2.5, 0);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const hit = mode === 'out' ? cue(cues, 'hit', dur * 0.4) : 1e9, off = BTL.ease(lt, hit, 1.6);
          const on = BTL.ease(lt, 0.4, 1) * (1 - off);
          fl.update(lt, on);
          gl.set((0.3 + 0.03 * Math.sin(lt * 1.7)) * (0.06 + 0.94 * on));
          if (mode === 'out') {
            const s = lt - hit - 0.8, a = clamp01(s / 1.2) * (1 - clamp01((s - 3) / 3));
            const y0 = ly + 10, hh = 40 + Math.max(0, s) * 50;
            let d = `M${cx} ${y0}`;
            for (let k = 1; k <= 8; k++) { const yy = y0 - hh * k / 8; d += `L${f1(cx + 16 * Math.sin(k * 0.9 + lt * 0.6) * k / 8)} ${f1(yy)}`; }
            smoke.setAttribute('d', d); smoke.setAttribute('stroke-opacity', (0.6 * a).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_muhur
  SH.bt_pt_muhur = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, label } = K();
      const mode = P.mode || 'lit', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const GR = 820, cx = 960;
      const gl = BTL.glow(svg, defs, cx, 560, 560, C.stain, 0.3, g);
      P0(g, `M-200 ${GR - 120}L2120 ${GR - 120}L2120 1800L-200 1800Z`, C.paperDark, 0.75);
      L0(g, `M0 ${GR - 120}L1920 ${GR - 120}`, C.inkSoft, 2, 0.35);
      const D = BTL.drawing(g);
      // low cushion
      const cush = `M${cx - 330} ${GR - 90}C${cx - 350} ${GR - 150} ${cx - 330} ${GR - 200} ${cx - 300} ${GR - 210}C${cx - 120} ${GR - 228} ${cx + 120} ${GR - 228} ${cx + 300} ${GR - 210}C${cx + 330} ${GR - 200} ${cx + 350} ${GR - 150} ${cx + 330} ${GR - 90}C${cx + 120} ${GR - 70} ${cx - 120} ${GR - 70} ${cx - 330} ${GR - 90}Z`;
      D.f(cush, C.red, 0.42); D.s(cush, { w: 3.5 });
      D.s(`M${cx - 300} ${GR - 150}C${cx - 100} ${GR - 166} ${cx + 100} ${GR - 166} ${cx + 300} ${GR - 150}`, { w: 2, color: C.gold, alpha: 0.7 });
      D.s(`M${cx - 330} ${GR - 90}l-26 40M${cx - 330} ${GR - 90}l-8 46M${cx + 330} ${GR - 90}l26 40M${cx + 330} ${GR - 90}l8 46`, { w: 3, color: C.gold });
      // the seal (moves in "take")
      const sg = el(g, 'g'), Ds = BTL.drawing(sg), sy = GR - 214;
      const baseS = `M${cx - 110} ${sy}L${cx - 110} ${sy - 40}L${cx + 110} ${sy - 40}L${cx + 110} ${sy}Z`;
      const neck = `M${cx - 50} ${sy - 40}C${cx - 40} ${sy - 90} ${cx - 30} ${sy - 120} ${cx - 34} ${sy - 150}L${cx + 34} ${sy - 150}C${cx + 30} ${sy - 120} ${cx + 40} ${sy - 90} ${cx + 50} ${sy - 40}Z`;
      const knob = BTL.E(cx, sy - 180, 46, 40);
      Ds.f(baseS + neck, C.paperLight, 1); Ds.f(knob, C.paperLight, 1);
      Ds.s(baseS, { w: 3.5 }); Ds.s(neck, { w: 3.5 }); Ds.s(knob, { w: 3.5 }); Ds.s(`M${cx - 110} ${sy - 12}L${cx + 110} ${sy - 12}`, { w: 2, color: C.gold });
      // impression: a gold ring with script-like strokes, on a sheet to the right
      const ig = el(g, 'g', { opacity: 0 }), ix = cx + 610, iy = 450;
      P0(ig, `M${ix - 150} ${iy - 170}L${ix + 150} ${iy - 170}L${ix + 150} ${iy + 170}L${ix - 150} ${iy + 170}Z`, C.paperLight, 1);
      L0(ig, `M${ix - 150} ${iy - 170}L${ix + 150} ${iy - 170}L${ix + 150} ${iy + 170}L${ix - 150} ${iy + 170}Z`, C.inkSoft, 2, 0.8);
      L0(ig, BTL.E(ix, iy, 100, 100) + BTL.E(ix, iy, 84, 84), C.gold, 3, 1);
      L0(ig, `M${ix - 60} ${iy + 20}C${ix - 30} ${iy - 30} ${ix} ${iy + 40} ${ix + 30} ${iy - 10}C${ix + 50} ${iy - 40} ${ix + 60} ${iy} ${ix + 50} ${iy + 30}M${ix - 40} ${iy - 40}L${ix - 30} ${iy + 40}M${ix + 10} ${iy - 60}L${ix + 14} ${iy + 10}`, C.gold, 3, 1);
      const ilab = P.label ? label(g, P.label, mode === 'take' ? cx : ix, mode === 'take' ? 300 : iy + 250, 52, { italic: true, font: LO, color: C.gold }) : null;
      if (mode === 'take' || P.sheet === false) { fade(ig, 0); ig.setAttribute('display', 'none'); }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6)); Ds.reveal(BTL.ease(lt, 0.3, 1.6));
          const hit = cue(cues, 'hit', dur * 0.5);
          if (mode === 'lit') {
            fade(ig, BTL.ease(lt, hit, 1)); if (ilab) fade(ilab, BTL.ease(lt, hit + 0.5, 1));
            gl.set(0.28 + 0.02 * Math.sin(lt * 0.8));
          } else {
            const p = BTL.ease(lt, hit, 3);
            sg.setAttribute('transform', `translate(${f1(760 * p)} ${f1(-10 * p)})`); fade(sg, 1 - 0.85 * BTL.ease(lt, hit + 1, 2));
            gl.set((0.3 + 0.02 * Math.sin(lt * 0.8)) * (1 - 0.55 * p));
            if (ilab) fade(ilab, BTL.ease(lt, 0.8, 1) * (1 - BTL.ease(lt, hit, 1.2)));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_oda
  SH.bt_pt_oda = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, floor } = K();
      const mode = P.mode || 'enter', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820, cx = 1060, dw = 150, top = GR - 470;
      P0(g, `M-200 -200L2120 -200L2120 ${GR}L-200 ${GR}Z`, C.paperDark, 0.45);
      // tile border band along the wall
      let tiles = ''; for (let x = 0; x < 1920; x += 60) tiles += `M${x} ${GR - 600}L${x + 30} ${GR - 630}L${x + 60} ${GR - 600}L${x + 30} ${GR - 570}Z`;
      L0(g, tiles, C.inkSoft, 1.5, 0.3);
      L0(g, `M0 ${GR - 640}L1920 ${GR - 640}M0 ${GR - 560}L1920 ${GR - 560}`, C.inkSoft, 2, 0.35);
      floor(g, GR, 0.85);
      let fl = ''; for (let i = -7; i <= 7; i++) fl += `M${cx + i * 110} ${GR}L${cx + i * 420} 1500`;
      L0(g, fl, C.inkSoft, 1.2, 0.1);
      const inside = P0(g, `M${cx - dw} ${GR}L${cx - dw} ${top + 80}C${cx - dw} ${top - 20} ${cx + dw} ${top - 20} ${cx + dw} ${top + 80}L${cx + dw} ${GR}Z`, C.gold, 0);
      const spill = P0(g, '', C.gold, 0);
      const gl = BTL.glow(svg, defs, cx, GR - 200, 460, C.gold, 0, g);
      // door leaves (closing): clipped by the arch
      const id = 'ptoda' + (++ODA), cp = el(defs, 'clipPath', { id });
      el(cp, 'path', { d: `M${cx - dw} ${GR}L${cx - dw} ${top + 80}C${cx - dw} ${top - 20} ${cx + dw} ${top - 20} ${cx + dw} ${top + 80}L${cx + dw} ${GR}Z` });
      const lv = el(g, 'g', { 'clip-path': `url(#${id})` });
      const left = P0(lv, '', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 }), right = P0(lv, '', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      const panels = L0(lv, '', C.inkSoft, 2, 0.8);
      const D = BTL.drawing(g);
      const frame = `M${cx - dw - 40} ${GR}L${cx - dw - 40} ${top + 80}C${cx - dw - 40} ${top - 70} ${cx + dw + 40} ${top - 70} ${cx + dw + 40} ${top + 80}L${cx + dw + 40} ${GR}`;
      D.s(frame, { w: 4 }); D.s(`M${cx - dw} ${GR}L${cx - dw} ${top + 80}C${cx - dw} ${top - 20} ${cx + dw} ${top - 20} ${cx + dw} ${top + 80}L${cx + dw} ${GR}`, { w: 2.5, color: C.inkSoft });
      const fig = mode === 'enter' ? BTL.person(g, 'stand', 0, 0, 300, { color: C.paperDark, rim: C.inkSoft }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.4));
          const hit = cue(cues, 'hit', dur * 0.4);
          const shut = mode === 'close' ? BTL.ease(lt, hit, 2.4) : 0;
          const gap = (2 * dw) * (1 - shut) * (mode === 'close' ? 1 : 0.55);
          const lw = (2 * dw - gap) / 2;
          left.setAttribute('d', `M${cx - dw} ${GR}L${cx - dw} ${top - 40}L${f1(cx - dw + lw)} ${top - 40}L${f1(cx - dw + lw)} ${GR}Z`);
          right.setAttribute('d', `M${f1(cx + dw - lw)} ${GR}L${f1(cx + dw - lw)} ${top - 40}L${cx + dw} ${top - 40}L${cx + dw} ${GR}Z`);
          let pd = '';
          if (lw > 30) for (const [x0, x1] of [[cx - dw + 18, cx - dw + lw - 18], [cx + dw - lw + 18, cx + dw - 18]]) pd += `M${f1(x0)} ${GR - 60}L${f1(x1)} ${GR - 60}L${f1(x1)} ${GR - 240}L${f1(x0)} ${GR - 240}ZM${f1(x0)} ${GR - 290}L${f1(x1)} ${GR - 290}L${f1(x1)} ${top + 60}L${f1(x0)} ${top + 60}Z`;
          panels.setAttribute('d', pd);
          const a = BTL.ease(lt, 0.3, 1) * (1 - (mode === 'close' ? BTL.ease(lt, hit + 1.6, 1.4) : 0));
          inside.setAttribute('fill-opacity', (0.5 * a).toFixed(3));
          const sw = gap / 2;
          spill.setAttribute('d', `M${f1(cx - sw)} ${GR}L${f1(cx + sw)} ${GR}L${f1(cx + sw * 3.2)} ${GR + 260}L${f1(cx - sw * 3.2)} ${GR + 260}Z`);
          spill.setAttribute('fill-opacity', (0.12 * a).toFixed(3));
          gl.set(0.22 * a * (gap / (2 * dw) + 0.15) * (1 + 0.05 * Math.sin(lt * 1.3)));
          if (fig) {
            const p = clamp01((lt - 0.4) / Math.max(2, dur - 0.8)), x = 380 + (cx - 380) * BTL.ease(p * 10, 0, 10), s = 1 - 0.12 * p;
            fig.setAttribute('transform', `translate(${f1(x)} ${f1(GR + 10 - 10 * p)}) scale(${f1(s)})`);
            fade(fig, BTL.ease(lt, 0.3, 1) * (1 - BTL.ease(p * 10, 8.6, 1.4)));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_gazete
  SH.bt_pt_gazete = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, label } = K();
      const portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 760 : 470, pw = portrait ? 380 : 320, ph = portrait ? 520 : 380;
      const gl = BTL.glow(svg, defs, cx, cy, 700, C.stain, 0.26, g);
      const D = BTL.drawing(g);
      const page = `M${cx - pw} ${cy - ph}L${cx + pw} ${cy - ph}L${cx + pw} ${cy + ph}L${cx - pw} ${cy + ph}Z`;
      D.f(page, C.paperLight, 1); D.s(page, { w: 3 });
      D.s(`M${cx - pw + 30} ${cy - ph + 110}L${cx + pw - 30} ${cy - ph + 110}M${cx - pw + 30} ${cy - ph + 120}L${cx + pw - 30} ${cy - ph + 120}`, { w: 2.5 });
      D.s(`M${cx - pw + 30} ${cy - ph + 60}L${cx + pw - 30} ${cy - ph + 60}`, { w: 10, color: C.inkSoft, alpha: 0.6 });
      const head = label(g, P.text || 'Lâle Devri', cx, cy - ph + 230, portrait ? 110 : 100, { weight: 600 });
      BTL.fit(head, 2 * pw - 80);
      const cols = 3, cw = (2 * pw - 60 - (cols - 1) * 24) / cols;
      for (let c = 0; c < cols; c++) {
        const x0 = cx - pw + 30 + c * (cw + 24);
        let d = ''; for (let y = cy - ph + 300; y < cy + ph - 30; y += 26) d += `M${f1(x0)} ${y}L${f1(x0 + cw - ((y * 7 + c * 13) % 5) * 8)} ${y}`;
        D.s(d, { w: 2, color: C.inkSoft, alpha: 0.75 });
        if (c) D.s(`M${f1(x0 - 12)} ${cy - ph + 290}L${f1(x0 - 12)} ${cy + ph - 30}`, { w: 1.5, color: C.inkSoft, alpha: 0.5 });
      }
      const yr = label(g, P.year || '1913', portrait ? cx : cx + pw + 190, portrait ? cy + ph + 120 : cy + 40, portrait ? 120 : 130, { italic: true, font: LO, color: C.gold });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.4)); fade(head, BTL.ease(lt, 0.8, 1.2));
          gl.set(0.24 + 0.02 * Math.sin(lt * 0.7));
          fade(yr, BTL.ease(lt, cue(cues, 'hit', dur * 0.55), 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_alay
  SH.bt_pt_alay = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, floor } = K();
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 780;
      const dawn = BTL.glow(svg, defs, 1500, GR - 40, 900, C.stain, 0.2, g);
      // hill with a mosque at the right
      P0(g, `M1080 ${GR}C1240 ${GR - 150} 1600 ${GR - 190} 2000 ${GR - 120}L2000 ${GR}Z`, C.paperDark, 1);
      L0(g, `M1080 ${GR}C1240 ${GR - 150} 1600 ${GR - 190} 2000 ${GR - 120}`, C.inkSoft, 2, 0.5);
      const mx = 1560, my = GR - 176;
      const mosque = `M${mx - 120} ${my}L${mx - 120} ${my - 70}L${mx - 80} ${my - 70}C${mx - 80} ${my - 170} ${mx + 80} ${my - 170} ${mx + 80} ${my - 70}L${mx + 120} ${my - 70}L${mx + 120} ${my}Z` +
        `M${mx - 160} ${my}L${mx - 160} ${my - 210}L${mx - 152} ${my - 250}L${mx - 144} ${my - 210}L${mx - 144} ${my}Z M${mx + 144} ${my}L${mx + 144} ${my - 210}L${mx + 152} ${my - 250}L${mx + 160} ${my - 210}L${mx + 160} ${my}Z`;
      const D = BTL.drawing(g);
      D.f(mosque, C.paperDark, 1); D.s(mosque, { w: 2.5, color: C.inkSoft });
      floor(g, GR, 0.8);
      L0(g, `M0 ${GR + 120}C600 ${GR + 100} 1200 ${GR + 60} 1920 ${GR + 30}`, C.inkSoft, 2, 0.3);
      // two walkers
      const mk = (h, turban) => {
        const wg = el(g, 'g'), body = BTL.person(wg, 'stand', 0, 0, h, { color: C.paperDark, rim: C.inkSoft });
        const rim = BTL.person(wg, 'stand', 0, 0, h, { color: C.paperDark, rim: C.gold });
        fade(rim, 0);
        const hy = -0.9 * h;
        if (turban) { el(wg, 'path', { d: `M${f1(-0.1 * h)} ${f1(hy - 0.04 * h)}C${f1(-0.13 * h)} ${f1(hy - 0.2 * h)} ${f1(-0.08 * h)} ${f1(hy - 0.3 * h)} 0 ${f1(hy - 0.31 * h)}C${f1(0.08 * h)} ${f1(hy - 0.3 * h)} ${f1(0.13 * h)} ${f1(hy - 0.2 * h)} ${f1(0.1 * h)} ${f1(hy - 0.04 * h)}Z`, fill: C.paperLight, stroke: C.ink, 'stroke-width': 2.5 }); el(wg, 'path', { d: `M${f1(-0.09 * h)} ${f1(hy - 0.1 * h)}C${f1(-0.03 * h)} ${f1(hy - 0.14 * h)} ${f1(0.03 * h)} ${f1(hy - 0.14 * h)} ${f1(0.09 * h)} ${f1(hy - 0.1 * h)}`, stroke: C.gold, 'stroke-width': 3, fill: 'none' }); }
        return { wg, rim };
      };
      const a = mk(330, true), b = mk(300, false);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6)); dawn.set(0.18 + 0.05 * BTL.ease(lt, 0, dur));
          const x = 520 + lt * 22;
          for (const [w, dx, bob] of [[a, 0, 0], [b, -230, 1.5]]) {
            w.wg.setAttribute('transform', `translate(${f1(x + dx)} ${f1(GR + 110 - 1.5 * Math.abs(Math.sin(lt * 1.6 + bob)))})`);
            fade(w.wg, BTL.ease(lt, 0.3, 1.2));
          }
          fade(b.rim, 0.9 * BTL.ease(lt, cue(cues, 'hit', dur * 0.55), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_tug
  SH.bt_pt_tug = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, label } = K();
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const WT = 640, cx = 960;
      const dusk = BTL.glow(svg, defs, 1300, WT - 40, 900, C.red, 0.12, g);
      const st = BTL.stars(g, 60, 12, [0, 0, 1920, 300]);
      // a distant dome and minaret behind the wall
      P0(g, `M1300 ${WT - 60}C1300 ${WT - 230} 1580 ${WT - 230} 1580 ${WT - 60}ZM1640 ${WT - 60}L1640 ${WT - 330}L1650 ${WT - 370}L1660 ${WT - 330}L1660 ${WT - 60}Z`, C.paperDark, 1);
      L0(g, `M1300 ${WT - 60}C1300 ${WT - 230} 1580 ${WT - 230} 1580 ${WT - 60}`, C.inkSoft, 2, 0.45);
      // the standard (behind the wall's front face so it can sink behind it)
      const sg = el(g, 'g'), Ds = BTL.drawing(sg), px = cx, py = WT;
      Ds.s(`M${px} ${py + 60}L${px} ${py - 440}`, { w: 6 });
      Ds.f(BTL.E(px, py - 456, 18, 18), C.gold, 1); Ds.s(BTL.E(px, py - 456, 18, 18), { w: 3, color: C.gold });
      Ds.s(`M${px - 22} ${py - 490}C${px - 30} ${py - 520} ${px + 10} ${py - 536} ${px + 22} ${py - 520}C${px + 4} ${py - 522} ${px - 10} ${py - 512} ${px - 22} ${py - 490}Z`, { w: 3, color: C.gold });
      {
        Ds.f(`M${px - 30} ${py - 420}L${px + 30} ${py - 420}L${px + 24} ${py - 400}L${px - 24} ${py - 400}Z`, C.paperLight, 1);
        Ds.s(`M${px - 30} ${py - 420}L${px + 30} ${py - 420}L${px + 24} ${py - 400}L${px - 24} ${py - 400}Z`, { w: 3 });
      }
      const tails = [];
      for (let i = 0; i < 3; i++) tails.push({ e: P0(sg, '', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 2.5 }), i });
      // the wall front with battlements
      let wall = `M-200 1800L-200 ${WT}`;
      for (let x = -200; x < 2120; x += 120) wall += `L${x} ${WT - 70}L${x + 70} ${WT - 70}L${x + 70} ${WT}L${x + 120} ${WT}`;
      wall += `L2120 1800Z`;
      const D = BTL.drawing(g);
      D.f(wall, C.paperLight, 0.9);
      D.s(wall.replace(/L2120 1800Z$/, ''), { w: 3 });
      let stones = ''; for (let y = WT + 50; y < 1100; y += 60) for (let x = ((y / 60) % 2) * 60 - 200; x < 2120; x += 120) stones += `M${x} ${y}L${x + 110} ${y}M${x + 110} ${y}L${x + 110} ${y + 60}`;
      L0(g, stones, C.inkSoft, 1.4, 0.3);
      const lab = P.label ? label(g, P.label, cx, WT + 220, 70, { italic: true, font: LO, color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.4)); Ds.reveal(BTL.ease(lt, 0.3, 1.6));
          dusk.set(0.12 + 0.02 * Math.sin(lt * 0.5));
          for (const t of tails) {
            const x0 = px - 30 + t.i * 30, sw = 18 * Math.sin(lt * 0.7 + t.i * 0.9), sw2 = 26 * Math.sin(lt * 0.7 + t.i * 0.9 - 0.8);
            t.e.setAttribute('d', `M${x0 - 16} ${py - 400}C${f1(x0 - 22 + sw)} ${py - 330} ${f1(x0 - 20 + sw2)} ${py - 260} ${f1(x0 + sw2)} ${py - 200}C${f1(x0 + 14 + sw2)} ${py - 260} ${f1(x0 + 22 + sw)} ${py - 330} ${x0 + 16} ${py - 400}Z`);
            fade(t.e, BTL.ease(lt, 1, 1));
          }
          const hit = cue(cues, 'hit', dur * 0.5), p = BTL.ease(lt, hit, 3);
          sg.setAttribute('transform', `translate(${f1(60 * p)} ${f1(420 * p)}) rotate(${f1(22 * p)} ${px} ${py})`);
          if (lab) fade(lab, BTL.ease(lt, hit + 1, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_ordu
  SH.bt_pt_ordu = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, flame } = K();
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const WL = 520, cx = 960;
      const st = BTL.stars(g, 110, 1730, [0, 0, 1920, 440]);
      const moonG = BTL.glow(svg, defs, 0, 0, 150, C.stain, 0.2, g);
      const moon = el(g, 'circle', { r: 30, fill: C.ink, 'fill-opacity': 0.75 });
      // the far city across the water (small)
      if (window.VHL) {
        const S = window.VHL.skyline(), city = el(g, 'g', { transform: `translate(60 ${WL}) scale(0.42 0.42)` });
        P0(city, S.body + S.mins, C.paperDark, 1); L0(city, S.body.replace(/Z$/, ''), C.inkSoft, 4, 0.6);
      }
      P0(g, `M-200 ${WL}L2120 ${WL}L2120 1800L-200 1800Z`, C.paper, 1);
      L0(g, `M0 ${WL}L1920 ${WL}`, C.inkSoft, 2, 0.4);
      const rip = [];
      for (let i = 0; i < 6; i++) rip.push({ e: L0(g, '', C.inkSoft, 2, 0.3), y: WL + 16 + i * 14, x: 200 + i * 150, ph: i * 1.3 });
      // the near hill
      const HILL = `M-200 1800L-200 640C200 600 700 580 1100 590C1500 600 1800 620 2120 640L2120 1800Z`;
      P0(g, HILL, C.paperDark, 1);
      L0(g, `M-200 640C200 600 700 580 1100 590C1500 600 1800 620 2120 640`, C.inkSoft, 2, 0.5);
      const D = BTL.drawing(g), fires = [];
      const tent = (x, y, w, h) => {
        const d = `M${x - w} ${y}L${x - w} ${y - h * 0.45}C${x - w * 0.6} ${y - h * 0.6} ${x - w * 0.2} ${y - h * 0.8} ${x} ${y - h}C${x + w * 0.2} ${y - h * 0.8} ${x + w * 0.6} ${y - h * 0.6} ${x + w} ${y - h * 0.45}L${x + w} ${y}Z`;
        D.f(d, C.paperLight, 1); D.s(d, { w: 2.5 }); D.s(`M${x} ${y - h}L${x} ${y - h - h * 0.18}`, { w: 2, color: C.gold });
        D.s(`M${x - w} ${y - h * 0.45}C${x - w * 0.4} ${y - h * 0.38} ${x + w * 0.4} ${y - h * 0.38} ${x + w} ${y - h * 0.45}`, { w: 1.6, color: C.inkSoft });
      };
      const rows = [[650, 34, 54, 11], [730, 48, 74, 9], [840, 66, 100, 7]];
      rows.forEach(([y, w, h, n], ri) => {
        for (let j = 0; j < n; j++) {
          const x = 960 + (j - (n - 1) / 2) * (1700 / n) + (ri % 2) * 40;
          if (ri === 2 && Math.abs(x - cx) < 260) continue;
          tent(x, y, w, h);
          if (j < n - 1) fires.push({ f: flame(g, x + 1700 / n / 2, y - 4, 0.12 + ri * 0.05, j + ri), gl: BTL.glow(svg, defs, x + 1700 / n / 2, y - 20, 50 + ri * 20, C.gold, 0, g), k: (j * 7 + ri * 3) % 11 });
        }
      });
      // the pavilion tent in the middle, lit door
      const oy = 860, ow = 230, oh = 300;
      const otag = `M${cx - ow} ${oy}L${cx - ow} ${oy - oh * 0.5}C${cx - ow * 0.5} ${oy - oh * 0.62} ${cx - ow * 0.2} ${oy - oh * 0.85} ${cx} ${oy - oh}C${cx + ow * 0.2} ${oy - oh * 0.85} ${cx + ow * 0.5} ${oy - oh * 0.62} ${cx + ow} ${oy - oh * 0.5}L${cx + ow} ${oy}Z`;
      D.f(otag, C.paperLight, 1); D.s(otag, { w: 3.5 });
      let val = ''; for (let i = 0; i < 10; i++) { const x = cx - ow + i * (2 * ow / 10); val += `M${f1(x)} ${oy - oh * 0.5}Q${f1(x + ow / 10)} ${oy - oh * 0.5 + 26} ${f1(x + 2 * ow / 10)} ${oy - oh * 0.5}`; }
      D.s(val, { w: 2, color: C.gold });
      D.s(`M${cx} ${oy - oh}L${cx} ${oy - oh - 50}`, { w: 3, color: C.gold }); D.s(BTL.E(cx, oy - oh - 60, 10, 10), { w: 3, color: C.gold });
      const door = P0(g, `M${cx - 50} ${oy}L${cx - 50} ${oy - 100}C${cx - 50} ${oy - 140} ${cx + 50} ${oy - 140} ${cx + 50} ${oy - 100}L${cx + 50} ${oy}Z`, C.gold, 0);
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.8));
          const mp = lt / Math.max(dur, 1), mx = 1500 - 900 * mp, my = 180 - 80 * Math.sin(mp * Math.PI);
          moon.setAttribute('cx', f1(mx)); moon.setAttribute('cy', f1(my)); moonG.e.setAttribute('cx', f1(mx)); moonG.e.setAttribute('cy', f1(my));
          for (const p of rip) { const dx = 20 * Math.sin(lt * 0.4 + p.ph); p.e.setAttribute('d', `M${f1(p.x + dx)} ${p.y}L${f1(p.x + 90 + dx)} ${p.y}`); }
          const hit = cue(cues, 'hit', dur * 0.5);
          for (const f of fires) {
            const a = BTL.ease(lt, 0.5, 1) * (1 - 0.8 * BTL.ease(lt, hit + f.k * 0.35, 1.2));
            f.f.update(lt, a); f.gl.set(0.35 * a);
          }
          door.setAttribute('fill-opacity', (0.5 * BTL.ease(lt, 0.8, 1) * (1 + 0.05 * Math.sin(lt * 1.3))).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_kahve
  SH.bt_pt_kahve = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, flame, floor } = K();
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820, cx = 960;
      P0(g, `M-200 -200L2120 -200L2120 ${GR}L-200 ${GR}Z`, C.paperDark, 0.4);
      // back wall: two arched windows, a shelf with cups
      L0(g, `M420 ${GR - 300}L420 ${GR - 470}C420 ${GR - 540} 560 ${GR - 540} 560 ${GR - 470}L560 ${GR - 300}ZM1360 ${GR - 300}L1360 ${GR - 470}C1360 ${GR - 540} 1500 ${GR - 540} 1500 ${GR - 470}L1500 ${GR - 300}Z`, C.inkSoft, 2, 0.45);
      floor(g, GR, 0.85);
      const D = BTL.drawing(g);
      const bench = `M440 ${GR - 80}L1480 ${GR - 80}L1480 ${GR - 40}L440 ${GR - 40}Z`;
      const cushion = `M440 ${GR - 80}L1480 ${GR - 80}L1480 ${GR - 260}L440 ${GR - 260}Z`;
      D.f(cushion, C.paperLight, 0.6); D.f(bench, C.paperLight, 1);
      D.s(cushion, { w: 2.5, color: C.inkSoft }); D.s(bench, { w: 3.5 });
      D.s(`M460 ${GR - 40}L460 ${GR}M1460 ${GR - 40}L1460 ${GR}`, { w: 4 });
      // cups beside the men
      let cups = '';
      for (const x of [820, 1120, 1400]) cups += `M${x - 16} ${GR - 106}L${x + 16} ${GR - 106}L${x + 12} ${GR - 82}L${x - 12} ${GR - 82}Z`;
      D.s(cups, { w: 2.5, color: C.gold });
      // the men (sitting on the bench)
      const men = [[640, 1], [960, -1], [1280, -1]].map(([x, f], i) => {
        const wg = el(g, 'g'); BTL.person(wg, 'sit', 0, 0, 300, { color: C.paperDark, rim: C.inkSoft, face: f });
        el(wg, 'path', { d: BTL.E(f * 0.04 * 300, -0.72 * 300 - 26, 26, 16), fill: C.paperLight, stroke: C.ink, 'stroke-width': 2 });
        return { wg, x, i, f };
      });
      // brazier + coffee pot + steam
      const bx = 260, by = GR + 50;
      D.f(`M${bx - 120} ${by}L${bx + 120} ${by}L${bx + 90} ${by - 70}L${bx - 90} ${by - 70}Z`, C.paperLight, 1);
      D.s(`M${bx - 120} ${by}L${bx + 120} ${by}L${bx + 90} ${by - 70}L${bx - 90} ${by - 70}Z`, { w: 3.5 });
      const ember = el(g, 'path', { d: `M${bx - 80} ${by - 70}C${bx - 40} ${by - 92} ${bx + 40} ${by - 92} ${bx + 80} ${by - 70}Z`, fill: C.red, 'fill-opacity': 0.6 });
      const pot = `M${bx - 40} ${by - 92}L${bx - 34} ${by - 160}L${bx + 34} ${by - 160}L${bx + 40} ${by - 92}Z`;
      D.f(pot, C.paperLight, 1); D.s(pot, { w: 3 }); D.s(`M${bx + 34} ${by - 150}L${bx + 150} ${by - 190}`, { w: 4, color: C.gold });
      D.s(`M${bx - 34} ${by - 160}L${bx - 56} ${by - 172}`, { w: 3 });
      const steam = [0, 1, 2].map(i => L0(g, '', C.inkSoft, 3, 0));
      const lampG = BTL.glow(svg, defs, cx, GR - 420, 420, C.gold, 0, g);
      L0(g, `M${cx} 0L${cx} ${GR - 470}`, C.inkSoft, 2, 0.7);
      const lamp = P0(g, `M${cx - 22} ${GR - 470}L${cx + 22} ${GR - 470}L${cx + 14} ${GR - 430}C${cx + 8} ${GR - 418} ${cx - 8} ${GR - 418} ${cx - 14} ${GR - 430}Z`, C.gold, 0);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const a = BTL.ease(lt, 0.5, 1.2);
          lampG.set(0.24 * a * (1 + 0.05 * Math.sin(lt * 1.4))); lamp.setAttribute('fill-opacity', (0.85 * a).toFixed(3));
          ember.setAttribute('fill-opacity', (0.45 + 0.12 * Math.sin(lt * 1.1)).toFixed(3));
          steam.forEach((e, i) => {
            const ph = ((lt * 0.22 + i / 3) % 1), x = bx - 10 + i * 10, y = by - 170 - ph * 160, sw = 12 * Math.sin(lt * 0.8 + i * 2);
            e.setAttribute('d', `M${f1(x)} ${f1(y)}C${f1(x + sw)} ${f1(y - 30)} ${f1(x - sw)} ${f1(y - 60)} ${f1(x + sw * 0.5)} ${f1(y - 90)}`);
            e.setAttribute('stroke-opacity', (Math.sin(ph * Math.PI) * 0.5).toFixed(3));
          });
          const lean = BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1.6);
          for (const m of men) {
            const r = (m.i === 0 ? 6 : m.i === 2 ? -6 : 0) * lean;
            m.wg.setAttribute('transform', `translate(${m.x} ${GR - 8}) rotate(${f1(r)} 0 -72)`);
            fade(m.wg, BTL.ease(lt, 0.4 + m.i * 0.3, 1));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_sebep
  SH.bt_pt_sebep = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { P0, L0, f1, fade, label } = K();
      const portrait = H > W, g = el(svg, 'g');
      const labels = P.labels || ['savaş', 'sır', 'vergi', 'ordu'];
      const gl = BTL.glow(svg, defs, W / 2, portrait ? 760 : 470, 700, C.stain, 0.2, g);
      const gap = portrait ? 240 : 400, y = portrait ? 620 : 400, sc = portrait ? 0.8 : 1.25;
      const items = [];
      const draws = [
        (D) => { D.s('M0 110L0-110', { w: 5 }); D.s(BTL.E(0, -122, 12, 12), { w: 3, color: C.gold }); D.s('M-16-92C-20-40-14 0 0 40M0-92C0-40 4 0 14 40M16-92C20-40 18 0 24 30', { w: 3, color: C.inkSoft }); },
        (D) => { const r = 'M-110-70L110-70L110 70L-110 70Z'; D.f(r, C.paperLight, 1); D.s(r, { w: 3.5 }); D.s('M-110-70L0 10L110-70', { w: 2.5, color: C.inkSoft }); D.f(BTL.E(0, 10, 26, 26), C.red, 0.8); D.s(BTL.E(0, 10, 26, 26), { w: 2.5, color: C.gold }); },
        (D) => { for (let i = 0; i < 5; i++) { const e = BTL.E((i % 2) * 6 - 3, 70 - i * 30, 70, 14); D.f(e, C.paperLight, 1); D.s(e, { w: 3, color: C.gold }); } },
        (D) => { const t = 'M-120 90L0-100L120 90Z'; D.f(t, C.paperLight, 1); D.s(t, { w: 3.5 }); D.s('M0-100L0-130M-30 90L0 20L30 90', { w: 2.5, color: C.inkSoft }); D.f('M-30 90L0 20L30 90Z', C.paperDark, 1); },
      ];
      for (let i = 0; i < 4; i++) {
        const x = W / 2 + (i - 1.5) * gap;
        const k = el(g, 'g', { transform: `translate(${f1(x)} ${y}) scale(${sc})` }), D = BTL.drawing(k);
        draws[i](D);
        const lab = label(g, labels[i], x, y + 200 * sc, portrait ? 52 : 56, { italic: true, font: LO });
        items.push({ k, D, lab, x, i });
      }
      const sx = W / 2, sy = y + (portrait ? 420 : 430);
      const lines = items.map(it => { const e = el(g, 'path', { d: `M${f1(it.x)} ${y + 230 * sc}L${sx} ${sy - 30}`, stroke: C.gold, 'stroke-width': 2, fill: 'none', 'stroke-opacity': 0.7, pathLength: 1 }); draw(e, 0); return e; });
      let spark = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = 10, r1 = i % 2 ? 26 : 44; spark += `M${f1(sx + Math.cos(a) * r0)} ${f1(sy + Math.sin(a) * r0)}L${f1(sx + Math.cos(a) * r1)} ${f1(sy + Math.sin(a) * r1)}`; }
      const sp = L0(g, spark, C.gold, 4, 0), spg = BTL.glow(svg, defs, sx, sy, 140, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          gl.set(0.18 + 0.02 * Math.sin(lt * 0.7));
          for (const it of items) {
            const at = cue(cues, 'abcd'[it.i], 0.3 + it.i * dur * 0.15);
            it.D.reveal(BTL.ease(lt, at, 1.2)); fade(it.k, BTL.ease(lt, at, 0.4)); fade(it.lab, BTL.ease(lt, at + 0.3, 0.8));
          }
          const hit = cue(cues, 'hit', dur * 0.75);
          lines.forEach((e, i) => draw(e, BTL.ease(lt, hit - 0.6 + i * 0.1, 0.9)));
          const s = BTL.ease(lt, hit + 0.3, 0.8);
          sp.setAttribute('stroke-opacity', (s * (0.8 + 0.2 * Math.sin(lt * 2))).toFixed(3)); spg.set(0.45 * s * (1 + 0.1 * Math.sin(lt * 2)));
        },
      };
    },
  };
})();
