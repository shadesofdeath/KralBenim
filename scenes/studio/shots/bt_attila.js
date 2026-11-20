// bt_attila: the death of Attila (453), belgesel style (docs/BELGESEL.md). Still line art in the theme's tokens; the
// only motion is slow and natural: a lamp flame breathing and going out, a smoke thread, dust in a shaft of light, a
// door swinging open, a single drop falling, rings on water, pieces of a map drifting apart. Every type is composed
// on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
//   bt_attila_bed     P: {mode: "hook"|"dawn"}  cues: hit   a dark timber room: a low bed, a faceless figure under a
//                     fur, an oil lamp on a stand. hook: on "hit" the flame shrinks and goes out, a smoke thread rises
//                     (the cover frame). dawn: the lamp is dark, a pale wedge of morning light lies across the bed; on
//                     "hit" the light gathers softly over the figure
//   bt_attila_hall    P: {label: "453"}  cues: hit   night on the plain: a palisade and a long timber hall, one window
//                     lit, smoke from the roof, stars; the year appears above
//   bt_attila_cup     cues: hit   a wooden cup on a plank table in lamplight; a slow drop of wine runs down and falls
//   bt_attila_door    cues: hit   a heavy plank door with iron bands, light at its seams; on "hit" it swings open,
//                     morning light falls across the floor, two backlit figures stand in the doorway, dust drifts
//   bt_attila_codex   P: {label: "Jordanes", sub: "Getica, MS 551"}  cues: hit   an open old codex, faint lines of script;
//                     on "hit" one line turns gold
//   bt_attila_coffins cues: a, b, c   three coffins nested inside each other, seen from above: gold (a), silver (b),
//                     iron (c), each with a small label below
//   bt_attila_grave   P: {mode: "cut"|"end"}  cues: a, b   the plain at night in cross-section; deep down the nested
//                     coffins in a faint light. cut: a mound with three spades on the surface; on "a" the spades fade,
//                     on "b" the mound sinks flat and grass closes over it. end: flat plain, stars, the light dies slowly
//   bt_attila_map     P: {label: "Hunlar", river: "Tuna", sub: "Nedao Savaşı"}  cues: hit   a sparse map: the Danube, the
//                     Hun realm as one soft patch; on "hit" it cracks into pieces that drift apart and fade
//   bt_attila_drop    cues: hit   still dark water; a single small red drop falls slowly, touches the water on "hit",
//                     rings spread and the reflected outline of the realm breaks up
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
      'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    if (o.spacing) e.setAttribute('letter-spacing', o.spacing);
    return e;
  };
  const WOOD = () => mix(C.paperLight, C.stain, 0.18);
  const SIL = () => C.paperDark;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // a thin smoke thread rising from (x, y), swaying slowly; k = strength 0..1
  function thread(g, x, y, h = 520) {
    const lines = [0, 1, 2].map(() => L0(g, '', C.inkSoft, 3, 0));
    return { update(lt, k) {
      lines.forEach((e, i) => {
        const ph = lt * 0.35 + i * 1.7, sw = 26 + 10 * i;
        let d = `M${f1(x)} ${f1(y)}`;
        for (let s = 1; s <= 10; s++) { const u = s / 10; d += `L${f1(x + sw * u * Math.sin(ph + u * 3.2) + 40 * u * u)} ${f1(y - h * u * (0.8 + 0.1 * i))}`; }
        e.setAttribute('d', d);
        e.setAttribute('stroke-width', f1(4.5 - i * 1.0));
        e.setAttribute('stroke-opacity', (k * (0.8 - i * 0.2)).toFixed(3));
      });
    } };
  }
  // dust motes drifting slowly inside a box
  function motes(g, n, seed, box, alpha = 0.5) {
    const r = rng(seed), list = [], [x0, y0, x1, y1] = box;
    for (let i = 0; i < n; i++) list.push({ x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), s: 1.6 + r() * 2.4, ph: r() * TAU, sp: 0.1 + r() * 0.2 });
    const e = P0(g, '', C.ink, alpha);
    return { e, update(lt, k = 1) {
      let d = '';
      for (const q of list) {
        const x = q.x + 30 * Math.sin(lt * q.sp + q.ph), y = y0 + ((q.y - y0 + lt * 9) % (y1 - y0));
        d += `M${f1(x - q.s)} ${f1(y)}a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(2 * q.s)} 0a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(-2 * q.s)} 0`;
      }
      e.setAttribute('d', d); e.setAttribute('fill-opacity', (alpha * k).toFixed(3));
    } };
  }
  // a lamp flame: two nested shapes whose heights breathe smoothly; k = size 0..1 (0 = out)
  function flame(g, x, y, s = 1) {
    const fl = [[C.gold, 1, 0], [C.ink, 0.45, 1.4]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
    return { update(lt, k) {
      for (const f of fl) {
        const h = (78 + 8 * Math.sin(lt * 2.1 + f.ph) + 4 * Math.sin(lt * 3.3 + f.ph)) * f.k * s * k, w = 22 * f.k * s * Math.max(0.3, k), lean = 4 * Math.sin(lt * 1.2 + f.ph);
        f.e.setAttribute('d', k <= 0.01 ? '' : `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.45)} ${f1(x - w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + lean)} ${f1(y - h)}C${f1(x + w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.45)} ${f1(x + w)} ${f1(y)}Z`);
      }
    } };
  }
  // the coffin outline seen from above (head at the top), centre (cx, cy), scale k
  const coffin = (cx, cy, k, rot = 0) => {
    const p = [[-0.42, -0.5], [0.42, -0.5], [0.62, -0.26], [0.36, 0.5], [-0.36, 0.5], [-0.62, -0.26]];
    const c = Math.cos(rot), s = Math.sin(rot), Wd = 420 * k, Ht = 720 * k;
    return 'M' + p.map(([x, y]) => { const X = x * Wd, Y = y * Ht; return f1(cx + X * c - Y * s) + ' ' + f1(cy + X * s + Y * c); }).join('L') + 'Z';
  };
  // the Hun realm as one soft patch (centre 0,0), split into wedges from an off-centre point
  function realm(cx, cy, sx = 1, sy = 1) {
    const r = rng(19), N = 44, pts = [];
    for (let i = 0; i < N; i++) { const u = i / N * TAU, rr = 1 + 0.12 * Math.sin(u * 3 + 0.6) + 0.07 * Math.sin(u * 7 + 1.1) + (r() - 0.5) * 0.05; pts.push([cx + Math.cos(u) * 380 * rr * sx, cy + Math.sin(u) * 280 * rr * sy]); }
    const d = 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
    return { pts, d };
  }

  // ------------------------------------------------------------------ the room: bed, figure, lamp
  SH.bt_attila_bed = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', root = el(canvas(svg, W, H), 'g', { transform: 'translate(-266 -657) scale(1.55)' }), LX = 250, LY = 800, FY = 1010;
      // back wall: faint vertical planks
      let pl = ''; for (let x = 40; x < 1080; x += 92) pl += `M${x} 180L${x} ${FY - 10}`;
      L0(root, pl, C.inkSoft, 1.6, 0.18);
      L0(root, `M-60 ${FY}L1140 ${FY}`, C.inkSoft, 2.5, 0.55);
      // floor planks running towards the viewer, down to the bottom of the frame
      P0(root, `M-60 ${FY}L1140 ${FY}L1140 2000L-60 2000Z`, mix(C.paper, C.paperLight, 0.5), 1);
      let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${f1(540 + i * 90)} ${FY}L${f1(540 + i * 300)} 2000`;
      for (const y of [1120, 1290, 1520, 1820]) fl += `M-60 ${y}L1140 ${y}`;
      L0(root, fl, C.inkSoft, 1.6, 0.2);
      const lampGlow = BTL.glow(svg, defs, LX + 60, LY + 40, 640, C.stain, mode === 'hook' ? 0.42 : 0, root);
      const pool = BTL.glow(svg, defs, 590, 880, 460, C.stain, mode === 'hook' ? 0.12 : 0.18, root);
      // morning light (dawn): a pale wedge from the upper right across the bed and the floor
      const wedge = P0(root, 'M1080 140L1080 520L560 1460L180 1460Z', C.ink, 0);
      const D = BTL.drawing(root);
      // the bed: low frame, legs, a pillow, the figure under a fur
      const frame = 'M300 900L860 900L860 960L300 960Z';
      D.f(frame, WOOD(), 1);
      D.s(frame, { w: 3.5 });
      D.s('M320 960L320 1012M840 960L840 1012M300 900L300 840L340 840L340 900', { w: 4 });
      D.f(BTL.E(420, 878, 96, 30), C.paperLight, 1); D.s(BTL.E(420, 878, 96, 30), { w: 3, color: C.inkSoft });
      const fur = 'M470 900C470 850 500 812 560 800C620 788 680 778 740 792C800 806 834 822 852 858C858 872 858 892 854 902Z';
      D.f(fur, mix(C.paperLight, C.inkSoft, 0.25), 1);
      D.s(fur, { w: 3.5 });
      D.s('M520 900l-6 22M600 902l-4 26M680 902l-6 24M760 902l-2 26M830 902l-6 22', { w: 3, color: C.inkSoft });   // fur fringe
      D.s('M560 830C610 820 670 814 730 818M760 826C800 834 826 842 846 856', { w: 2, color: C.inkSoft, alpha: 0.7 });
      // head (faceless) on the pillow, a shoulder under the fur
      D.f(BTL.E(440, 836, 44, 40), SIL(), 1); D.s(BTL.E(440, 836, 44, 40), { w: 3, color: C.inkSoft });
      // the lamp: tall stand, dish, nozzle
      D.f(`M${LX - 8} ${FY}L${LX + 8} ${FY}L${LX + 5} ${LY + 40}L${LX - 5} ${LY + 40}Z`, SIL(), 1);
      D.s(`M${LX - 70} ${FY}L${LX} ${FY - 40}L${LX + 70} ${FY}M${LX} ${FY - 40}L${LX} ${LY + 40}`, { w: 4, color: C.inkSoft });
      const dish = `M${LX - 70} ${LY + 20}C${LX - 60} ${LY + 52} ${LX + 50} ${LY + 52} ${LX + 70} ${LY + 20}L${LX + 96} ${LY + 8}L${LX + 70} ${LY + 4}C${LX + 30} ${LY - 6} ${LX - 40} ${LY - 6} ${LX - 70} ${LY + 20}Z`;
      D.f(dish, WOOD(), 1); D.s(dish, { w: 3.5 });
      const fg = el(root, 'g'), fx = LX + 92, fy = LY + 9;   // the flame sits on the nozzle
      const fm = flame(fg, fx, fy, 1.2);
      const sm = thread(root, fx, fy - 6, 560);
      const ember = P0(root, BTL.E(fx, fy - 2, 6, 5), C.red, 0);
      const dust = motes(root, mode === 'hook' ? 110 : 46, 23, mode === 'hook' ? [40, 300, 1060, 1300] : [400, 300, 1060, 1400], 0.45);
      const gather = BTL.glow(svg, defs, 620, 850, 320, C.ink, 0, root);
      return {
        update(lt, dur, cues) {
          D.reveal(mode === 'hook' ? 1 : BTL.ease(lt, 0, 1.4));
          if (mode === 'hook') {
            const out = BTL.ease(lt, 3.0, 0.9), k = 1 - out;   // the hook plays this scene from cover.t (3.2) slowed (x0.35): the flame dies under the first sentence
            fm.update(lt * 6, k);
            lampGlow.set(0.42 * k + 0.05 * (1 - k) + 0.03 * Math.sin(lt * 2) * k);
            pool.set(0.1 + 0.06 * k);
            sm.update(lt * 8, Math.max(out, 0.0));
            ember.setAttribute('fill-opacity', (out * (0.55 + 0.35 * Math.sin(lt * 5))).toFixed(3));
            fade(wedge, 0); dust.update(lt * 8, 0.7);
            lampGlow.e.setAttribute('r', f1(640 + 40 * Math.sin(lt * 6)));
          } else {
            fm.update(lt, 0); lampGlow.set(0);
            const at = cue(cues, 'hit', dur * 0.5);
            wedge.setAttribute('fill-opacity', (0.07 * BTL.ease(lt, 0, 1.6)).toFixed(3));
            dust.update(lt, BTL.ease(lt, 0.3, 1.4));
            gather.set(0.1 * BTL.ease(lt, at - 0.3, 1.4));
            sm.update(lt, 0.4 * (1 - BTL.ease(lt, 0, dur)));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the timber hall at night
  SH.bt_attila_hall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 1000;
      const st = BTL.stars(root, 90, 41, [0, 60, 1080, 700]);
      const lab = txt(root, P.label || '453', 540, 360, 160, { weight: 300, color: C.gold });
      BTL.glow(svg, defs, 560, 900, 640, C.stain, 0.14, root);
      P0(root, `M-60 ${HZ}C300 ${HZ - 10} 700 ${HZ + 8} 1140 ${HZ - 4}L1140 2000L-60 2000Z`, mix(C.paper, C.paperLight, 0.45), 1);
      L0(root, `M-60 ${HZ}C300 ${HZ - 10} 700 ${HZ + 8} 1140 ${HZ - 4}`, C.inkSoft, 2, 0.5);
      const smk = thread(root, 720, 650, 360);
      const D = BTL.drawing(root);
      // the hall: a long timber house with a high gabled roof
      const hall = `M240 ${HZ}L240 790L540 640L860 790L860 ${HZ}Z`;
      D.f(hall, SIL(), 1);
      D.s(hall, { w: 3.5, color: C.inkSoft });
      let pk = ''; for (let x = 280; x < 860; x += 40) pk += `M${x} ${x < 540 ? f1(790 - (x - 240) * 0.5 + 6) : f1(640 + (x - 540) * 0.47 + 6)}L${x} ${HZ}`;
      D.s(pk, { w: 1.4, color: C.inkSoft, alpha: 0.35 });
      D.s('M220 800L540 630L880 800', { w: 4, color: C.inkSoft });
      // the palisade in front: pointed stakes
      let pal = ''; for (let x = -20; x < 1100; x += 34) { const h = 150 + 14 * Math.sin(x * 0.07); pal += `M${x} ${HZ + 40}L${x} ${f1(HZ + 40 - h)}L${x + 13} ${f1(HZ + 40 - h - 24)}L${x + 26} ${f1(HZ + 40 - h)}L${x + 26} ${HZ + 40}Z`; }
      D.f(pal, mix(SIL(), C.paperLight, 0.35), 1);
      D.s(pal, { w: 1.8, color: C.inkSoft, alpha: 0.7 });
      // the lit window above the palisade
      const win = P0(root, 'M500 742h70v64h-70Z', C.gold, 0);
      const wg = BTL.glow(svg, defs, 535, 774, 170, C.gold, 0, root);
      // plain grass strokes below
      let gr = ''; const r = rng(7);
      for (let i = 0; i < 60; i++) { const x = r() * 1080, y = HZ + 120 + r() * 700, h = 16 + r() * 22; gr += `M${f1(x)} ${f1(y)}l${f1(-4 + r() * 8)} ${f1(-h)}`; }
      L0(root, gr, C.inkSoft, 2, 0.35);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          st.update(lt);
          D.reveal(BTL.ease(lt, 0, 1.6));
          fade(lab, BTL.ease(lt, 0.2, 1.0));
          const w = BTL.ease(lt, Math.min(0.9, at - 0.6), 1.0);
          win.setAttribute('fill-opacity', (0.85 * w * (0.92 + 0.08 * Math.sin(lt * 2.3))).toFixed(3));
          wg.set(0.4 * w * (0.9 + 0.1 * Math.sin(lt * 1.7)));
          smk.update(lt, 0.7);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the wooden cup
  SH.bt_attila_cup = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), TY = 1000;
      BTL.glow(svg, defs, 300, 620, 760, C.stain, 0.3, root);
      // the table: top edge, front face down to the bottom
      P0(root, `M-60 ${TY}L1140 ${TY}L1140 2000L-60 2000Z`, mix(C.paperLight, C.stain, 0.08), 1);
      L0(root, `M-60 ${TY}L1140 ${TY}`, C.ink, 3, 0.6);
      L0(root, `M-60 ${TY + 70}L1140 ${TY + 70}`, C.inkSoft, 2.5, 0.6);
      let grain = ''; const r = rng(31);
      for (let i = 0; i < 10; i++) { const y = TY + 110 + i * 80 + r() * 30; grain += `M-60 ${f1(y)}C300 ${f1(y - 12 + r() * 24)} 700 ${f1(y - 12 + r() * 24)} 1140 ${f1(y)}`; }
      L0(root, grain, C.inkSoft, 1.4, 0.25);
      const D = BTL.drawing(root);
      // a wide wooden cup on a short foot
      const body = 'M380 620C384 760 420 860 500 900L500 950L430 970C440 990 640 990 650 970L580 950L580 900C660 860 696 760 700 620Z';
      D.f(body, WOOD(), 1);
      D.s(body, { w: 4 });
      D.f(BTL.E(540, 620, 160, 36), mix(C.paperDark, C.red, 0.35), 1);
      D.s(BTL.E(540, 620, 160, 36), { w: 4 });
      D.s('M420 680C430 760 460 830 510 870M470 650C476 740 500 820 540 870M650 680C640 760 610 830 570 870', { w: 2, color: C.inkSoft, alpha: 0.7 });
      D.f(BTL.E(430, 978, 120, 12), C.paperDark, 0.6);
      // the slow drop of wine on the right side
      const trickle = L0(root, '', C.red, 4, 0.85);
      const drop = P0(root, '', C.red, 0.9);
      const spot = P0(root, BTL.E(712, TY + 6, 26, 6), C.red, 0);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.2));
          const at = cue(cues, 'hit', 0.9), u = clamp01((lt - at + 0.4) / 2.2);
          // the trickle runs from the rim down the wall, a drop gathers at its end, then falls to the table
          const run = clamp01(u / 0.6), yEnd = 640 + 180 * run;
          trickle.setAttribute('d', `M694 640C700 ${f1(640 + 60 * run)} 708 ${f1(640 + 120 * run)} 712 ${f1(yEnd)}`);
          trickle.setAttribute('stroke-opacity', (0.85 * clamp01(u * 6)).toFixed(3));
          const fall = clamp01((u - 0.6) / 0.4), dy = yEnd + 8 + (TY - yEnd - 10) * fall * fall, s = 7 + 3 * clamp01(u / 0.6);
          drop.setAttribute('d', u <= 0 || fall >= 1 ? '' : `M712 ${f1(dy - s * 2.2)}C${f1(712 + s * 0.4)} ${f1(dy - s)} ${f1(712 + s)} ${f1(dy - s * 0.2)} ${f1(712 + s)} ${f1(dy + s * 0.3)}C${f1(712 + s)} ${f1(dy + s)} ${f1(712 - s)} ${f1(dy + s)} ${f1(712 - s)} ${f1(dy + s * 0.3)}C${f1(712 - s)} ${f1(dy - s * 0.2)} ${f1(712 - s * 0.4)} ${f1(dy - s)} 712 ${f1(dy - s * 2.2)}Z`);
          spot.setAttribute('fill-opacity', (0.8 * clamp01((u - 0.98) * 30)).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the door broken open in the morning
  SH.bt_attila_door = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), X0 = 300, X1 = 780, Y0 = 380, Y1 = 1160;
      // the wall around the door: dark planks
      let pl = ''; for (let x = 20; x < 1080; x += 96) if (x < X0 - 20 || x > X1 + 20) pl += `M${x} 120L${x} ${Y1}`;
      L0(root, pl, C.inkSoft, 1.6, 0.18);
      // the doorway: morning outside
      const outside = P0(root, `M${X0} ${Y0}L${X1} ${Y0}L${X1} ${Y1}L${X0} ${Y1}Z`, mix(C.paperLight, C.ink, 0.22), 0);
      const og = BTL.glow(svg, defs, 540, 760, 560, C.ink, 0, root);
      // two backlit figures in the doorway
      const men = el(root, 'g');
      BTL.person(men, 'stand', 470, Y1, 560, { color: SIL(), rim: C.inkSoft });
      BTL.person(men, 'stand', 640, Y1, 530, { color: SIL(), rim: C.inkSoft, face: -1 });
      // floor and the wedge of light thrown across it
      P0(root, `M-60 ${Y1}L1140 ${Y1}L1140 2000L-60 2000Z`, mix(C.paper, C.paperLight, 0.5), 1);
      let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${f1(540 + i * 90)} ${Y1}L${f1(540 + i * 300)} 2000`;
      L0(root, fl, C.inkSoft, 1.6, 0.18);
      const wedge = P0(root, `M${X0} ${Y1}L${X1} ${Y1}L1140 1920L-60 1920Z`, C.ink, 0);
      // the frame
      const D = BTL.drawing(root);
      D.s(`M${X0 - 26} ${Y1}L${X0 - 26} ${Y0 - 30}L${X1 + 26} ${Y0 - 30}L${X1 + 26} ${Y1}`, { w: 6, color: C.inkSoft });
      D.s(`M${X0} ${Y1}L${X0} ${Y0}L${X1} ${Y0}L${X1} ${Y1}`, { w: 3 });
      // the door leaf, hinged on the left; rebuilt each frame as it swings
      const leaf = el(root, 'g');
      const lf = P0(leaf, '', WOOD(), 1), lo = L0(leaf, '', C.ink, 3.5, 1), lp = L0(leaf, '', C.inkSoft, 1.6, 0.6), lb = L0(leaf, '', C.inkSoft, 9, 0.9);
      // what broke: splinters on the latch side of the frame, a broken hinge, a board fallen on the floor
      const broke = el(root, 'g', { opacity: 0 });
      L0(broke, `M${X1} 700l38-26M${X1} 730l46 6M${X1} 760l30 30M${X1 + 4} 690l-10 70`, C.ink, 3, 0.9);
      P0(broke, `M${X0 - 26} ${Y0 + 40}l-14-10l-6 22Z`, C.inkSoft, 1);
      P0(broke, 'M600 1470L860 1432L868 1462L610 1502Z', WOOD(), 1, { stroke: C.ink, 'stroke-width': 3 });
      L0(broke, 'M860 1432l18-12M868 1462l22 4M612 1486L860 1448', C.inkSoft, 2, 0.8);
      const seam = L0(root, `M${X1 - 3} ${Y0 + 10}L${X1 - 3} ${Y1 - 6}M${X0 + 10} ${Y1 - 3}L${X1 - 10} ${Y1 - 3}`, C.ink, 3, 0);
      const dust = motes(root, 60, 53, [X0 - 60, Y0, X1 + 200, 1500], 0.5);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.0));
          const at = cue(cues, 'hit', dur * 0.45), o = BTL.ease(lt, at - 0.25, 1.2);
          // the leaf: right edge moves towards the hinge and towards the viewer (taller)
          const th = o * 1.25, w = (X1 - X0) * Math.cos(th), grow = 120 * Math.sin(th);
          const sag = 70 * BTL.ease(lt, at + 0.1, 0.9);   // the top hinge gives way: the free edge drops
          const xr = X0 + w, yt = Y0 - grow * 0.5 + sag, yb = Y1 + grow * 0.5 + sag * 0.35;
          lf.setAttribute('d', `M${X0} ${Y0}L${f1(xr)} ${f1(yt)}L${f1(xr)} ${f1(yb)}L${X0} ${Y1}Z`);
          lo.setAttribute('d', `M${X0} ${Y0}L${f1(xr)} ${f1(yt)}L${f1(xr)} ${f1(yb)}L${X0} ${Y1}Z`);
          let pk = ''; for (let i = 1; i < 6; i++) { const u = i / 6; pk += `M${f1(X0 + w * u)} ${f1(Y0 - grow * 0.5 * u)}L${f1(X0 + w * u)} ${f1(Y1 + grow * 0.5 * u)}`; }
          lp.setAttribute('d', pk);
          let bd = ''; for (const v of [0.18, 0.82]) { const y0 = Y0 + (Y1 - Y0) * v; bd += `M${X0} ${f1(y0)}L${f1(xr)} ${f1(y0 + (v - 0.5) * grow)}`; }
          lb.setAttribute('d', bd);
          broke.setAttribute('opacity', BTL.ease(lt, at - 0.1, 0.5).toFixed(3));
          fade(outside, 1); outside.setAttribute('fill-opacity', (0.9 * o).toFixed(3));
          og.set(0.22 * o);
          fade(men, BTL.ease(lt, at + 0.2, 1.0));
          wedge.setAttribute('fill-opacity', (0.09 * o).toFixed(3));
          seam.setAttribute('stroke-opacity', ((0.5 + 0.2 * Math.sin(lt * 1.4)) * (1 - o) * BTL.ease(lt, 0.2, 0.8)).toFixed(3));
          dust.update(lt, o);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the codex (Jordanes, Getica)
  SH.bt_attila_codex = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g');
      const lab = txt(root, P.label || 'Jordanes', 540, 330, 104, { weight: 400 });
      const sub = txt(root, P.sub || 'Getica, MS 551', 540, 420, 54, { font: BTL.LO, italic: true, color: C.gold });
      const lamp = BTL.glow(svg, defs, 540, 820, 600, C.stain, 0.24, root);
      const D = BTL.drawing(root);
      // two pages, slightly curved, on a dark cover
      const cover = 'M80 600L1000 600L1030 1110L50 1110Z';
      D.f(cover, SIL(), 1); D.s(cover, { w: 2.5, color: C.inkSoft });
      const left = 'M110 580C260 560 420 570 540 610L540 1090C420 1050 260 1040 90 1070Z';
      const right = 'M970 580C820 560 660 570 540 610L540 1090C660 1050 820 1040 990 1070Z';
      D.f(left, C.paperLight, 1); D.f(right, C.paperLight, 1);
      D.s(left, { w: 3 }); D.s(right, { w: 3 });
      // lines of script: short strokes in rows
      const r = rng(61); let sc = ''; const rows = [];
      for (let side = 0; side < 2; side++) for (let i = 0; i < 9; i++) {
        const y = 650 + i * 44, x0 = side ? 580 : 150, x1 = side ? 930 : 500; let x = x0, row = '';
        while (x < x1 - 20) { const w = 14 + r() * 44; row += `M${f1(x)} ${f1(y + (side ? -1 : 1) * (x - 540) * 0.02)}l${f1(w)} 0`; x += w + 12; }
        if (side === 1 && i === 5) rows.push(row); else sc += row;
      }
      D.s(sc, { w: 4, color: C.inkSoft, alpha: 0.55 });
      const plainRow = L0(root, rows[0], C.inkSoft, 4, 0.55);
      const goldRow = L0(root, rows[0], C.gold, 5, 0, { pathLength: 1 });
      const gg = BTL.glow(svg, defs, 755, 870, 260, C.gold, 0, root);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          D.reveal(BTL.ease(lt, 0, 1.6));
          fade(plainRow, BTL.ease(lt, 0.9, 0.6));
          fade(lab, BTL.ease(lt, 0.2, 1)); fade(sub, BTL.ease(lt, 0.6, 1));
          const g = BTL.ease(lt, at - 0.2, 1.2);
          goldRow.setAttribute('stroke-opacity', g > 0 ? '1' : '0'); draw(goldRow, g);
          gg.set(0.25 * g * (0.9 + 0.1 * Math.sin(lt * 1.5)));
          lamp.set(0.22 + 0.03 * Math.sin(lt * 1.1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ three nested coffins
  SH.bt_attila_coffins = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), CX = 540, CY = 740;
      const pool = BTL.glow(svg, defs, CX, CY, 620, C.stain, 0.18, root);
      const silver = mix(C.ink, C.inkSoft, 0.25);
      const layers = [
        { k: 1.0, col: C.inkSoft, w: 9, fill: mix(SIL(), C.inkSoft, 0.15), key: 'c', label: P.c || 'demir' },
        { k: 0.8, col: silver, w: 5, fill: mix(C.paperLight, C.ink, 0.06), key: 'b', label: P.b || 'gümüş' },
        { k: 0.62, col: C.gold, w: 5, fill: mix(C.paperLight, C.gold, 0.12), key: 'a', label: P.a || 'altın' },
      ].map(L => { const g = el(root, 'g'); return { ...L, g, ghost: L0(root, coffin(CX, CY, L.k), C.inkSoft, 2, 0, { 'stroke-dasharray': '6 10' }), f: P0(g, coffin(CX, CY, L.k), L.fill, 0), s: L0(g, coffin(CX, CY, L.k), L.col, L.w, 0, { pathLength: 1 }) }; });
      // the lids' centre lines, faint
      const inner = L0(root, `M${CX} ${f1(CY - 360 * 0.62 + 30)}L${CX} ${f1(CY + 360 * 0.62 - 30)}`, C.gold, 2, 0);
      const gl = BTL.glow(svg, defs, CX, CY, 240, C.gold, 0, root);
      const labs = [['a', 290, C.gold], ['b', 540, C.ink], ['c', 790, mix(C.ink, C.inkSoft, 0.3)]].map(([k, x, col]) => ({ k, e: txt(root, layers.find(L => L.key === k).label, x, 1430, 64, { font: BTL.LO, italic: true, color: col, weight: 500 }) }));
      return {
        update(lt, dur, cues) {
          const ta = cue(cues, 'a', 1.0), tb = cue(cues, 'b', ta + 0.8), tc = cue(cues, 'c', tb + 0.8);
          const T = { a: ta, b: tb, c: tc };
          for (const L of layers) {
            const p = L.key === 'a' ? BTL.ease(lt, 0, 0.8) : BTL.ease(lt, T[L.key] - 0.3, 0.8);
            draw(L.s, 1); L.s.setAttribute('stroke-opacity', p.toFixed(3));
            L.f.setAttribute('fill-opacity', (0.9 * p).toFixed(3));
            L.g.setAttribute('transform', `translate(${CX} ${CY}) scale(${f1(1.06 - 0.06 * p)}) translate(${-CX} ${-CY})`);
            L.ghost.setAttribute('stroke-opacity', '0');
          }
          inner.setAttribute('stroke-opacity', (0.6 * BTL.ease(lt, 0.2, 1)).toFixed(3));
          gl.set(0.22 * BTL.ease(lt, 0, 1) * (0.9 + 0.1 * Math.sin(lt * 1.3)));
          for (const l of labs) fade(l.e, l.k === 'a' ? BTL.ease(lt, 0.2, 0.7) : BTL.ease(lt, T[l.k] - 0.2, 0.7));
          pool.set(0.16 + 0.02 * Math.sin(lt * 0.9));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the grave in cross-section
  SH.bt_attila_grave = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'cut', root = el(canvas(svg, W, H), 'g'), GY = 600, KX = 540, KY = 1010;
      const st = BTL.stars(root, 80, 71, [0, 60, 1080, GY - 40]);
      // the earth, layered, down to the bottom of the frame
      P0(root, `M-60 ${GY}L1140 ${GY}L1140 2000L-60 2000Z`, mix(C.paper, C.paperDark, 0.4), 1);
      const r = rng(83); let strata = '';
      for (const y of [700, 820, 1380, 1560, 1760]) { let d = `M-60 ${y}`; for (let x = 0; x <= 1140; x += 190) d += `C${f1(x - 120)} ${f1(y - 14 + r() * 28)} ${f1(x - 60)} ${f1(y - 14 + r() * 28)} ${x} ${f1(y - 6 + r() * 12)}`; strata += d; }
      L0(root, strata, C.inkSoft, 1.8, 0.28);
      let peb = ''; for (let i = 0; i < 70; i++) { const x = r() * 1080, y = GY + 40 + r() * 1300; if (Math.abs(y - 1245) < 70) continue; const s = 3 + r() * 6; peb += BTL.E(x, y, s * 1.4, s); }
      L0(root, peb, C.inkSoft, 1.4, 0.22);
      // the backfilled shaft above the coffins (cut mode)
      const shaft = L0(root, `M430 ${GY}L460 ${KY - 70}M650 ${GY}L620 ${KY - 70}`, C.inkSoft, 2, mode === 'cut' ? 0.45 : 0, { 'stroke-dasharray': '10 12' });
      // the coffins, deep, lying sideways
      const pool = BTL.glow(svg, defs, KX, KY, 300, C.stain, 0.3, root);
      const cg = el(root, 'g');
      const rot = Math.PI / 2;
      for (const [k, col, w] of [[0.42, C.inkSoft, 6], [0.34, mix(C.ink, C.inkSoft, 0.25), 3.5], [0.27, C.gold, 3.5]]) {
        P0(cg, coffin(KX, KY, k, rot), mix(SIL(), C.paperLight, 0.3), 0.6);
        L0(cg, coffin(KX, KY, k, rot), col, w, 1);
      }
      const gold = BTL.glow(svg, defs, KX, KY, 140, C.gold, 0.2, root);
      // the surface: a mound with spades (cut) that sinks flat; grass
      const surf = P0(root, '', mix(C.paper, C.paperDark, 0.4), 1), surfL = L0(root, '', C.inkSoft, 2.5, 0.7);
      const mound = h => `M-60 ${GY}L360 ${GY}C420 ${GY - h} 660 ${GY - h} 720 ${GY}L1140 ${GY}`;
      const spades = el(root, 'g');
      for (const [x, a] of [[450, -12], [540, 4], [630, 16]]) {
        const sg = el(spades, 'g', { transform: `translate(${x} ${GY - 50}) rotate(${a})` });
        L0(sg, 'M0 -230L0 0', C.inkSoft, 6, 1);
        L0(sg, 'M-18 -230L18 -230', C.inkSoft, 6, 1);
        P0(sg, 'M-26 0L26 0L22 60C10 78-10 78-22 60Z', mix(SIL(), C.inkSoft, 0.3), 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
      }
      let gr = ''; for (let i = 0; i < 70; i++) { const x = r() * 1100 - 10, h = 10 + r() * 22; gr += `M${f1(x)} ${GY}l${f1(-5 + r() * 10)} ${f1(-h)}`; }
      const grass = L0(root, gr, C.inkSoft, 2, 0);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          if (mode === 'cut') {
            const ta = cue(cues, 'a', dur * 0.35), tb = cue(cues, 'b', dur * 0.75);
            const k = BTL.ease(lt, tb - 0.3, 1.4), h = 90 * (1 - k);
            surf.setAttribute('d', mound(h) + `L1140 ${GY + 4}L-60 ${GY + 4}Z`); surfL.setAttribute('d', mound(h));
            fade(spades, 1 - BTL.ease(lt, ta - 0.1, 1.0));
            spades.setAttribute('transform', `translate(0 ${f1(-h + 90)})`);
            shaft.setAttribute('stroke-opacity', (0.45 * (1 - k)).toFixed(3));
            grass.setAttribute('stroke-opacity', (0.5 * k).toFixed(3));
            pool.set(0.28 + 0.03 * Math.sin(lt * 0.9)); gold.set(0.2 - 0.06 * k);
          } else {
            surf.setAttribute('d', ''); surfL.setAttribute('d', `M-60 ${GY}L1140 ${GY}`);
            fade(spades, 0); grass.setAttribute('stroke-opacity', '0.5');
            const k = BTL.ease(lt, 0.3, Math.max(2, dur));
            pool.set(0.3 - 0.2 * k); gold.set(0.2 - 0.16 * k);
            fade(cg, 1 - 0.55 * k);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the realm breaks apart
  SH.bt_attila_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), CX = 540, CY = 590;
      let grat = ''; for (let x = 60; x < 1080; x += 160) grat += `M${x} 140L${x} 1880`; for (let y = 200; y < 1900; y += 160) grat += `M20 ${y}L1060 ${y}`;
      L0(root, grat, C.inkSoft, 1.2, 0.12);
      const sub = txt(root, P.sub || '', 540, 1680, 64, { font: BTL.LO, italic: true, color: C.gold });
      const R = realm(CX, CY);
      // pieces: wedges from an off-centre point, each drifts outwards along its bisector
      const O = [CX - 30, CY + 20], N = R.pts.length, cuts = [0, 9, 17, 26, 35];
      const pieces = cuts.map((c0, i) => {
        const c1 = cuts[(i + 1) % cuts.length] || N, seg = [];
        for (let j = c0; j !== c1 + (c1 < c0 ? N : 0) + 1 && seg.length <= N; j++) seg.push(R.pts[j % N]);
        const d = `M${f1(O[0])} ${f1(O[1])}L` + seg.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
        const mid = seg[Math.floor(seg.length / 2)], ang = Math.atan2(mid[1] - O[1], mid[0] - O[0]);
        const g = el(root, 'g');
        const f = P0(g, d, C.inkSoft, 0.32), s = L0(g, d, C.inkSoft, 2.5, 0);
        return { g, f, s, ang, i };
      });
      const outline = L0(root, R.d, C.inkSoft, 2.5, 0.8);
      const danube = 'M-60 1060C120 1050 220 1000 330 985C420 975 470 1000 520 1040C560 1075 640 1095 760 1088C880 1080 960 1100 1140 1120';
      L0(root, danube, mix(C.blue, C.ink, 0.2), 6, 0.9);
      const rl = txt(root, P.river || 'Tuna', 160, 1130, 48, { font: BTL.LO, italic: true, color: C.inkSoft }); rl.setAttribute('opacity', 0.9);
      const lab = txt(root, P.label || 'Hunlar', CX, CY - 40, 72, { weight: 400 });
      for (const t of [lab, rl]) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('paint-order', 'stroke'); }
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5), k = BTL.ease(lt, at - 0.3, 1.4);
          fade(lab, BTL.ease(lt, 0.2, 0.8) * (1 - 0.8 * k));
          fade(outline, 1 - BTL.ease(lt, at - 0.3, 0.5));
          for (const p of pieces) {
            const d = 150 * k * (0.8 + 0.15 * (p.i % 3));
            p.g.setAttribute('transform', `translate(${f1(Math.cos(p.ang) * d)} ${f1(Math.sin(p.ang) * d)})`);
            p.s.setAttribute('stroke-opacity', (0.8 * clamp01(k * 4)).toFixed(3));
            p.f.setAttribute('fill-opacity', (0.32 * (1 - 0.7 * k)).toFixed(3));
            fade(p.g, 1 - 0.5 * k * (p.i % 2 ? 1 : 0.6));
          }
          fade(sub, BTL.ease(lt, at - 0.5, 0.7));
        },
      };
    },
  };

  // ------------------------------------------------------------------ one drop on still water
  SH.bt_attila_drop = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 680, IX = 540, IY = 950;
      BTL.glow(svg, defs, IX, 640, 620, C.stain, 0.12, root);
      P0(root, `M-60 ${HZ}L1140 ${HZ}L1140 2000L-60 2000Z`, mix(C.paper, C.paperLight, 0.4), 1);
      L0(root, `M-60 ${HZ}L1140 ${HZ}`, C.inkSoft, 2, 0.45);
      // faint glints on the water
      const gr = rng(97), glints = [];
      for (let i = 0; i < 16; i++) glints.push({ e: L0(root, '', C.inkSoft, 2, 0), x: gr() * 1000 + 40, y: HZ + 40 + gr() * 1000, w: 30 + gr() * 80, ph: gr() * TAU });
      // the realm reflected on the water, flattened
      const st = BTL.stars(root, 60, 113, [0, 60, 1080, HZ - 60]);
      const RS = 0.7, R0 = realm(0, 0), R = { d: 'M' + R0.pts.map(p => f1(IX + p[0] * RS) + ' ' + f1(IY + p[1] * RS)).join('L') + 'Z' };   // the map's outline, scaled
      const rg = BTL.glow(svg, defs, IX, IY, 520, C.stain, 0.16, root);
      // the reflection is cut into horizontal bands; after the drop each band slides sideways a little (water ripple)
      const bands = [], NB = 18, top = IY - 250, bh = 500 / NB;
      for (let i = 0; i < NB; i++) {
        const cid = 'atb' + i + '_' + Math.round(IY), cp = el(defs, 'clipPath', { id: cid });
        el(cp, 'rect', { x: -100, y: f1(top + i * bh), width: 1300, height: f1(bh + 0.5) });
        const g = el(root, 'g', { 'clip-path': `url(#${cid})` }), gi = el(g, 'g');
        P0(gi, R.d, C.stain, 0.14); L0(gi, R.d, C.ink, 3, 0.85);
        bands.push({ gi, ph: i * 1.3 });
      }
      const refl = el(root, 'g'), reflF = refl;
      const rings = [0, 1, 2, 3].map(() => L0(root, '', C.red, 3, 0));
      const drop = P0(root, '', C.red, 0.95);
      const dg = BTL.glow(svg, defs, IX, 300, 90, C.red, 0, root);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55), t0 = Math.max(0.2, at - 2.2);
          const u = clamp01((lt - t0) / (at - t0)), y = 240 + (IY - 240) * u * u, s = 26;
          drop.setAttribute('d', lt >= at ? '' : `M${IX} ${f1(y - s * 2.4)}C${f1(IX + s * 0.4)} ${f1(y - s)} ${f1(IX + s)} ${f1(y - s * 0.2)} ${f1(IX + s)} ${f1(y + s * 0.3)}C${f1(IX + s)} ${f1(y + s)} ${f1(IX - s)} ${f1(y + s)} ${f1(IX - s)} ${f1(y + s * 0.3)}C${f1(IX - s)} ${f1(y - s * 0.2)} ${f1(IX - s * 0.4)} ${f1(y - s)} ${IX} ${f1(y - s * 2.4)}Z`);
          dg.e.setAttribute('cy', f1(y)); dg.set(lt >= at ? 0 : 0.3 * clamp01(u * 4));
          rings.forEach((e, i) => {
            const v = (lt - at - i * 0.45) / 2.6;
            if (v <= 0 || v >= 1) { e.setAttribute('stroke-opacity', '0'); return; }
            const rx = 30 + 620 * v;
            e.setAttribute('d', BTL.E(IX, IY, rx, rx * 0.36));
            e.setAttribute('stroke-width', f1(4 - 2 * v));
            e.setAttribute('stroke-opacity', (0.9 * (1 - v)).toFixed(3));
            e.setAttribute('stroke', v > 0.25 ? C.inkSoft : C.red);
          });
          const k = BTL.ease(lt, at, 2.4);
          st.update(lt);
          const amp = 46 * k * (1 - 0.35 * BTL.ease(lt, at + 2.0, 2));
          bands.forEach(b => b.gi.setAttribute('transform', `translate(${f1(amp * Math.sin(b.ph + lt * 1.6))} 0)`));
          fade(refl, 1); refl.setAttribute('opacity', '1');
          bands.forEach(b => fade(b.gi, 1 - 0.65 * k));
          rg.set(0.16 * (1 - 0.6 * k));
          for (const q of glints) { q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}l${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', (0.1 + 0.25 * Math.sin(lt * 0.5 + q.ph) ** 2).toFixed(3)); }
        },
      };
    },
  };
})();
