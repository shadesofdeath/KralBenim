// bt_varna: the Battle of Varna, 10 November 1444, and the empty tomb of King Władysław III, belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; only slow natural motion (fog drifting, dust in a light
// beam, grass, water, a slow gallop, a lid sliding, lights going out). Every type is composed on a 1080x1920 vertical
// canvas (the Short); a wide frame shows it as a centred column. No violence is shown: the king vanishes into fog.
//   bt_va_tomb    P: {mode: "hook"|"empty"|"end"}  cues: hit
//                 a stone sarcophagus in a pool of light in a dark crypt, a thin gold crown carved on its front.
//                 hook: the heavy lid lies slid aside, the opening is black; it creeps a little further, dust in the light.
//                 empty: close and seen from above, the lid slides further on "hit" and a pale light falls inside: the
//                 floor of the coffin, nothing on it. end: the light pool slowly narrows, low fog drifts over the floor
//   bt_va_place   P: {mode: "shore"|"city"|"mound", text, sub, label}  cues: hit
//                 shore: a misty Black Sea bay at dawn, rows of small tents on the hill, smoke threads; the year (text)
//                 in big thin type above, sub in italics. city: Constantinople at dusk over the sea (sea walls, towers,
//                 the great dome), window lights; from "hit" the lights go out one by one and the sky glow fades.
//                 mound: today: a round grassy mound with a small stone memorial and a dark doorway, trees, slow
//                 clouds; on "hit" a thin gold line draws round the doorway. label: italic line above
//   bt_va_battle  P: {mode: "charge"|"vanish"}  cues: hit
//                 charge: one armoured rider with a small gold crown on his helmet and a couched lance gallops slowly
//                 to the right in a light pool, cloak and pennant flowing; faint riders behind him in the dust; on
//                 "hit" a far horse-tail standard (the sultan's) shows on the horizon. vanish: a row of tall
//                 faceless Janissary silhouettes (folded felt caps) in the foreground; in the gap between them the small
//                 rider; from "hit" fog thickens and he fades away
//   bt_va_armor   P: {}  cues: hit   an empty field in fog at dusk; the ghostly dotted outline of a knight's armour
//                 (crowned helmet, breastplate) draws itself in the light pool, then from "hit" dissolves: empty ground
//   bt_va_map     P: {}  cues: hit   the west coast of the Black Sea, the Danube; Varna pulses; from "hit" thin gold
//                 lines and small dots scatter from Varna to the north and west and fade (the crusaders scatter)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  let UID = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const LD = (p, d, stroke, w = 3, a = 1) => { const e = L0(p, d, stroke, w, a, { pathLength: 1 }); draw(e, 0); return e; };
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0, 'text-anchor': 'middle' }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const poly = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const push = (g, lt, dur, cx, cy, amt = 0.035) => {
    const z = 1 + amt * BTL.ease(lt, 0, Math.max(3, dur));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };
  const bg = g => P0(g, 'M-300-200L1380-200L1380 2100L-300 2100Z', C.paper, 1);
  const STONE = mix(C.paperLight, C.ink, 0.1), STONE_TOP = mix(C.paperLight, C.ink, 0.2), STONE_SIDE = mix(C.paper, C.paperDark, 0.4);

  // slow motes drifting inside a box (up: rising)
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: (o.size || 2.4) * (0.7 + r() * 0.9), v: 0.015 + r() * 0.025, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = o.up ? box[3] - u * h : box[1] + u * h, x = box[0] + q.x * w + 16 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // fog: wide flat soft puffs drifting sideways across a band, wrapping round
  function fog(g, seed, n, y0, y1, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r() * 1700 - 300, y: y0 + r() * (y1 - y0), rx: (o.size || 260) * (0.7 + r() * 0.7), v: (o.speed || 14) * (0.6 + r() * 0.8) * (i % 2 ? 1 : 0.7) });
    return { update(lt, on = 1) { for (const q of list) {
      const x = ((q.x + q.v * lt + 300) % 1800) - 300;
      q.e.setAttribute('d', BTL.E(x, q.y, q.rx, q.rx * 0.16));
      const edge = Math.min(1, (x + 300) / 300, (1500 - x) / 300);
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.07) * clamp01(edge)).toFixed(3));
    } } };
  }
  // grass: short blades along a band, swaying slowly
  function grass(g, seed, n, y0, y1, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) { const y = y0 + r() * (y1 - y0); list.push({ x: -40 + r() * 1160, y, h: (o.h || 26) * (0.6 + r() * 0.8) * (0.6 + (y - y0) / Math.max(1, y1 - y0)), ph: r() * TAU }); }
    const e = L0(g, '', o.color || C.inkSoft, o.w || 2, o.alpha ?? 0.35);
    return { update(lt) {
      let d = '';
      for (const b of list) { const s = 4 * Math.sin(lt * 0.7 + b.ph + b.x * 0.004) + 0.35 * b.h; d += `M${f1(b.x)} ${f1(b.y)}q${f1(s * 0.2)} ${f1(-b.h * 0.6)} ${f1(s)} ${f1(-b.h)}M${f1(b.x + 5)} ${f1(b.y)}q${f1(-s * 0.1)} ${f1(-b.h * 0.4)} ${f1(-s * 0.5)} ${f1(-b.h * 0.7)}`; }
      e.setAttribute('d', d);
    } };
  }
  function crown(g, x, y, s, color, w = 3) {
    const d = `M${f1(x - 60 * s)} ${f1(y)}L${f1(x - 64 * s)} ${f1(y - 40 * s)}L${f1(x - 32 * s)} ${f1(y - 18 * s)}L${f1(x)} ${f1(y - 52 * s)}` +
      `L${f1(x + 32 * s)} ${f1(y - 18 * s)}L${f1(x + 64 * s)} ${f1(y - 40 * s)}L${f1(x + 60 * s)} ${f1(y)}Z`;
    const e = L0(g, d, color, w, 1);
    const dots = L0(g, BTL.E(x - 64 * s, y - 46 * s, 5 * s, 5 * s) + BTL.E(x, y - 58 * s, 6 * s, 6 * s) + BTL.E(x + 64 * s, y - 46 * s, 5 * s, 5 * s), color, w * 0.8, 1);
    return [e, dots];
  }

  // ------------------------------------------------------------------ bt_va_tomb
  // oblique sarcophagus: front face x0..x1, top front edge yT, base yB; top face goes back along dv
  function sarcophagus(g, svg, defs, o) {
    const { x0, x1, yT, yB, dv, h } = o, w = x1 - x0;
    const T = (u, v) => [x0 + u * w + v * dv[0], yT + v * dv[1]];
    // plinth
    const pl = poly([[x0 - 30, yB], [x1 + 30, yB], [x1 + 30, yB + 40], [x0 - 30, yB + 40]]);
    P0(g, BTL.E((x0 + x1) / 2 + dv[0] * 0.3, yB + 46, w * 0.62, 34), C.paperDark, 0.9);
    P0(g, pl, STONE_SIDE, 1); L0(g, pl, C.inkSoft, 2.5, 0.9);
    // body: front face, right side face
    const front = poly([[x0, yT], [x1, yT], [x1, yB], [x0, yB]]);
    const side = poly([[x1, yT], [x1 + dv[0], yT + dv[1]], [x1 + dv[0], yB + dv[1]], [x1, yB]]);
    P0(g, side, STONE_SIDE, 1); P0(g, front, STONE, 1);
    // carved panel + crown on the front
    const pm = 40, py0 = yT + 36, py1 = yB - 30;
    L0(g, poly([[x0 + pm, py0], [x1 - pm, py0], [x1 - pm, py1], [x0 + pm, py1]]), C.inkSoft, 2, 0.6);
    const cx = (x0 + x1) / 2, cy = (py0 + py1) / 2 + 34;
    const cr = crown(g, cx, cy, Math.min(1.2, (py1 - py0) / 170), C.gold, 3.5);
    L0(g, `M${x0 + pm + 30} ${f1(cy + 26)}L${f1(cx - 90)} ${f1(cy + 26)}M${f1(cx + 90)} ${f1(cy + 26)}L${x1 - pm - 30} ${f1(cy + 26)}`, C.inkSoft, 2, 0.5);
    L0(g, side, C.ink, 3, 0.8); L0(g, front, C.ink, 3.5, 1);
    // top rim and the black opening
    const top = poly([T(0, 0), T(1, 0), T(1, 1), T(0, 1)]);
    P0(g, top, STONE_TOP, 1);
    const ua = 26 / w, ub = 1 - 26 / w, va = 0.16, vb = 0.84;
    const rim = poly([T(ua, va), T(ub, va), T(ub, vb), T(ua, vb)]);
    const cid = 'vat' + (++UID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: rim });
    const inner = el(g, 'g', { 'clip-path': `url(#${cid})` });
    P0(inner, rim, C.paperDark, 1);
    const dn = p => [p[0], p[1] + h];
    const back = poly([T(ua, vb), T(ub, vb), dn(T(ub, vb)), dn(T(ua, vb))]);
    P0(inner, back, mix(C.paperDark, C.paperLight, 0.45), 1);
    const left = poly([T(ua, va), T(ua, vb), dn(T(ua, vb)), dn(T(ua, va))]);
    const floor = poly([dn(T(ua, va)), dn(T(ub, va)), dn(T(ub, vb)), dn(T(ua, vb))]);
    P0(inner, floor, mix(C.paperDark, C.paperLight, 0.3), 1);
    let joints = '';
    for (const u of [0.3, 0.55, 0.8]) { const a = dn(T(u, va)), b = dn(T(u, vb)); joints += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`; }
    const jb = dn(T(ua, 0.5)), je = dn(T(ub, 0.5)); joints += `M${f1(jb[0])} ${f1(jb[1])}L${f1(je[0])} ${f1(je[1])}`;
    L0(inner, joints, C.inkSoft, 1.6, 0.3);
    P0(inner, left, mix(C.paperDark, C.paperLight, 0.6), 1);
    const beam = BTL.glow(svg, defs, T(0.36, 0)[0], (T(0, va)[1] + dn(T(0, vb))[1]) / 2 + 10, w * 0.42, C.stain, 0, inner);
    const E1 = dn(T(ua, va)), E2 = dn(T(ua, vb)), E3 = dn(T(ub, vb)), E4 = T(ua, vb);
    L0(inner, `M${f1(E1[0])} ${f1(E1[1])}L${f1(E2[0])} ${f1(E2[1])}L${f1(E3[0])} ${f1(E3[1])}M${f1(E4[0])} ${f1(E4[1])}L${f1(E2[0])} ${f1(E2[1])}`, C.ink, 2.5, 0.75);
    const dust = motes(inner, 77, 18, [T(ua, 0)[0], T(0, vb)[1] - 20, T(0.8, 0)[0], T(0, va)[1]], { alpha: 0.55, size: 2.6 });
    L0(g, rim, C.inkSoft, 2.5, 0.9); L0(g, top, C.ink, 3, 1);
    // the lid (slides along +x of the top plane)
    const th = o.th || 34, lid = el(g, 'g');
    P0(lid, poly([T(0, 0), T(1, 0), T(1, 1), T(0, 1)]).replace(/Z$/, '') + 'Z', C.paperDark, 0.55, { transform: `translate(18 ${f1(th * 0.6)})` });  // its shadow
    const lt0 = p => [p[0], p[1] - th], rg = p => [p[0], p[1] - th - (o.ridge ?? 46)];
    const a0 = T(-0.01, -0.03), a1 = T(1.01, -0.03), m0 = T(-0.01, 0.5), m1 = T(1.01, 0.5), b0 = T(-0.01, 1.03), b1 = T(1.01, 1.03);
    const lfront = poly([lt0(a0), lt0(a1), a1, a0]);
    const slopeF = poly([lt0(a0), lt0(a1), rg(m1), rg(m0)]);
    const slopeB = poly([rg(m0), rg(m1), lt0(b1), lt0(b0)]);
    const lside = poly([a1, lt0(a1), rg(m1), lt0(b1), b1]);
    P0(lid, lside, STONE_SIDE, 1); P0(lid, lfront, STONE, 1); P0(lid, slopeB, mix(STONE_TOP, C.paperDark, 0.35), 1); P0(lid, slopeF, STONE_TOP, 1);
    const lc = T(0.5, 0.5);
    // carved cross band on the near slope + acroteria at the corners
    const q0 = T(0.1, 0.25), q1 = T(0.9, 0.25), dz = -th - (o.ridge ?? 46) * 0.5;
    L0(lid, `M${f1(q0[0])} ${f1(q0[1] + dz)}L${f1(q1[0])} ${f1(q1[1] + dz)}`, C.inkSoft, 2, 0.6);
    L0(lid, lside, C.ink, 3, 0.8); L0(lid, lfront, C.ink, 3.5, 1); L0(lid, slopeB, C.ink, 3, 0.9); L0(lid, slopeF, C.ink, 3.5, 1);
    return {
      cr, beam, dust,
      setLid(dx, rot = 0, dy = 0) { lid.setAttribute('transform', `translate(${f1(dx)} ${f1(dy)}) rotate(${f1(rot)} ${f1(lc[0])} ${f1(lc[1])})`); },
    };
  }
  function crypt(g, FY) {
    P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 0.75);
    L0(g, `M-300 ${FY}L1380 ${FY}`, C.inkSoft, 2, 0.35);
    L0(g, `M-300 ${FY + 140}L1380 ${FY + 140}M-300 ${FY + 420}L1380 ${FY + 420}`, C.inkSoft, 1.6, 0.1);
  }
  SH.bt_va_tomb = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const close = mode === 'empty';
      const FY = close ? 1160 : 1120;
      crypt(g, FY);
      // a soft shaft of light from above
      const shaft = P0(g, close ? 'M380-200L700-200L960 1100L180 1100Z' : 'M420-200L660-200L900 1100L200 1100Z', C.stain, 0.05);
      const pool = BTL.glow(svg, defs, 540, close ? 820 : 800, close ? 720 : 600, C.stain, 0.34, g);
      const S = close
        ? sarcophagus(g, svg, defs, { x0: 70, x1: 610, yT: 1010, yB: 1150, dv: [60, -320], h: 110, th: 34, ridge: 44 })
        : sarcophagus(g, svg, defs, { x0: 80, x1: 560, yT: 900, yB: 1090, dv: [50, -230], h: 100, th: 32, ridge: 40 });
      const fg = mode === 'end' ? fog(g, 19, 9, FY - 60, FY + 120, { alpha: 0.09, size: 300, speed: 16 }) : fog(g, 23, 5, FY - 40, FY + 80, { alpha: 0.05 });
      const ds = motes(g, 13, 26, [180, 260, 900, FY - 40], { alpha: 0.35, size: 2.4 });
      return {
        update(lt, dur, cues) {
          if (close) {
            const hit = cue(cues, 'hit', dur * 0.3);
            push(g, lt, dur, 540, 860, 0.04);
            const q = BTL.ease(lt, hit - 0.3, 1.8);
            S.setLid(290 + 60 * q, 9 + 3 * q, 16 + 16 * q);
            S.beam.set(0.12 + 0.6 * q + 0.03 * Math.sin(lt * 0.8));
            S.dust.update(lt, 0.3 + 0.7 * q);
            pool.set(0.3 + 0.04 * Math.sin(lt * 0.6));
          } else if (mode === 'end') {
            push(g, lt, dur, 540, 900, 0.03);
            S.setLid(330, 11, 30);
            S.beam.set(0.25 * (1 - BTL.ease(lt, 0.2, Math.max(2, dur)))); S.dust.update(lt, 0.4);
            const k = BTL.ease(lt, 0.2, Math.max(2, dur));
            pool.e.setAttribute('r', f1(600 - 260 * k));
            pool.set(0.34 - 0.12 * k);
            shaft.setAttribute('fill-opacity', (0.05 * (1 - 0.7 * k)).toFixed(3));
          } else {
            push(g, lt, dur, 540, 860, 0.04);
            const s0 = BTL.ease(lt, 0, Math.max(3, dur));
            S.setLid(300 + 30 * s0, 9 + 2 * s0, 18 + 12 * s0);
            S.beam.set(0.42 + 0.05 * Math.sin(lt * 0.8)); S.dust.update(lt, 1);
            pool.set(0.34 + 0.05 * Math.sin(lt * 0.7));
          }
          const gl = 0.75 + 0.25 * Math.sin(lt * 0.9);
          for (const e of S.cr) e.setAttribute('stroke-opacity', gl.toFixed(3));
          fg.update(lt); ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_va_place
  function tent(g, x, y, s) {
    const d = `M${f1(x - 26 * s)} ${f1(y)}L${f1(x)} ${f1(y - 34 * s)}L${f1(x + 26 * s)} ${f1(y)}Z`;
    P0(g, d, C.paperDark, 1); L0(g, d, C.inkSoft, 1.6, 0.8);
    L0(g, `M${f1(x)} ${f1(y - 34 * s)}l0 ${f1(-8 * s)}`, C.inkSoft, 1.6, 0.8);
  }
  function smoke(g, seed, xs, y, hgt) {
    const list = xs.map((x, i) => ({ x, e: L0(g, '', C.inkSoft, 2, 0.4), ph: i * 1.7 + seed }));
    return { update(lt) { for (const q of list) {
      const s1 = 10 * Math.sin(lt * 0.5 + q.ph), s2 = 16 * Math.sin(lt * 0.4 + q.ph + 1);
      q.e.setAttribute('d', `M${q.x} ${y}C${f1(q.x + s1)} ${f1(y - hgt * 0.35)} ${f1(q.x - s2)} ${f1(y - hgt * 0.7)} ${f1(q.x + s2 + 20)} ${f1(y - hgt)}`);
    } } };
  }
  SH.bt_va_place = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'shore', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'city') {
        const HZ = 930;
        const sky = BTL.glow(svg, defs, 560, HZ - 40, 760, C.gold, 0.32, g);
        const st = BTL.stars(g, 70, 31, [-60, 120, 1140, 620]);
        fade(st.g, 0);
        // the city on its hill
        const hill = `M-300 ${HZ}L-300 860C-100 830 100 800 300 790C500 780 700 790 900 820C1050 840 1200 860 1380 870L1380 ${HZ}Z`;
        P0(g, hill, C.paperDark, 1);
        const city = el(g, 'g');
        const r = rng(44); let bl = '';
        const lights = [];
        for (let x = -60; x < 1120; x += 46 + r() * 30) {
          const top = 800 + 40 * Math.abs(x - 520) / 600 - r() * 70, wd = 40 + r() * 40;
          bl += `M${f1(x)} ${HZ}L${f1(x)} ${f1(top)}L${f1(x + wd)} ${f1(top)}L${f1(x + wd)} ${HZ}Z`;
          if (r() < 0.6) lights.push({ x: x + wd * (0.3 + r() * 0.4), y: top + 20 + r() * (HZ - top - 50), t: r() });
        }
        P0(city, bl, C.paperDark, 1); L0(city, bl, C.inkSoft, 1.5, 0.35);
        // the great dome with its half domes and buttresses (no minarets in 1444)
        const DX = 560, DY = 700;
        const dome = `M${DX - 230} ${HZ - 40}L${DX - 230} ${DY + 70}C${DX - 200} ${DY + 30} ${DX - 150} ${DY + 20} ${DX - 120} ${DY + 30}L${DX - 120} ${DY}` +
          `C${DX - 110} ${DY - 120} ${DX + 110} ${DY - 120} ${DX + 120} ${DY}L${DX + 120} ${DY + 30}C${DX + 150} ${DY + 20} ${DX + 200} ${DY + 30} ${DX + 230} ${DY + 70}L${DX + 230} ${HZ - 40}Z`;
        P0(city, dome, C.paperDark, 1); L0(city, dome, C.ink, 2.5, 0.8);
        L0(city, `M${DX - 120} ${DY}L${DX + 120} ${DY}M${DX - 150} ${DY + 6}L${DX - 150} ${DY + 30}M${DX + 150} ${DY + 6}L${DX + 150} ${DY + 30}`, C.inkSoft, 2, 0.7);
        let win = ''; for (let i = -4; i <= 4; i++) win += `M${DX + i * 24} ${DY - 4}l0 -16`;
        L0(city, win, C.inkSoft, 2, 0.6);
        L0(city, `M${DX} ${DY - 90}l0 -26M${DX - 12} ${DY - 104}l24 0`, C.ink, 2.5, 0.8);
        // sea walls with towers along the shore
        let wall = `M-300 ${HZ}L-300 ${HZ - 50}`;
        for (let x = -300; x < 1380; x += 150) wall += `L${x + 100} ${HZ - 50}L${x + 100} ${HZ - 86}L${x + 150} ${HZ - 86}L${x + 150} ${HZ - 50}`;
        wall += `L1380 ${HZ - 50}L1380 ${HZ}Z`;
        P0(g, wall, mix(C.paperDark, C.paperLight, 0.4), 1); L0(g, wall, C.ink, 2.5, 0.85);
        let cren = ''; for (let x = -290; x < 1380; x += 24) cren += `M${x} ${HZ - 50}l0 -8`;
        L0(g, cren, C.inkSoft, 2, 0.5);
        const lg = el(g, 'g');
        const LE = lights.map(q => ({ q, e: P0(lg, `M${f1(q.x - 6)} ${f1(q.y)}l12 0l0 16l-12 0Z`, C.gold, 0.95) }));
        // the sea
        P0(g, `M-300 ${HZ}L1380 ${HZ}L1380 2100L-300 2100Z`, mix(C.paper, C.paperDark, 0.5), 1);
        L0(g, `M-300 ${HZ}L1380 ${HZ}`, C.inkSoft, 2, 0.7);
        const refl = el(g, 'g');
        const waves = [];
        for (let i = 0; i < 9; i++) waves.push({ e: L0(g, '', C.inkSoft, 1.6, 0.25), y: HZ + 40 + i * i * 11, ph: i * 0.9 });
        const RE = LE.slice(0, 14).map(o => ({ o, e: L0(refl, '', C.gold, 3, 0.5) }));
        const lab = P.label ? txt(g, P.label, 560, 500, 46, { font: LO, italic: true, weight: 400 }) : null;
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.55);
            push(g, lt, dur, 560, 800, 0.035);
            const k = BTL.ease(lt, hit - 0.2, Math.max(1.2, dur - hit));
            sky.set(0.32 * (1 - 0.85 * k) + 0.02 * Math.sin(lt * 0.6));
            fade(st.g, 0.15 + 0.85 * k); st.update(lt);
            for (const o of LE) fade(o.e, 1 - clamp01((lt - (hit + o.q.t * Math.max(0.8, dur - hit - 0.6))) / 0.4));
            for (const w of waves) {
              const s = 6 * Math.sin(lt * 0.6 + w.ph);
              w.e.setAttribute('d', `M-300 ${f1(w.y)}C100 ${f1(w.y + s)} 600 ${f1(w.y - s)} 1380 ${f1(w.y + s * 0.5)}`);
            }
            for (const r2 of RE) {
              const a = r2.o.e.getAttribute('opacity'); const y = HZ + 30 + (r2.o.q.y - 760) * 0.4, s = 6 * Math.sin(lt * 0.9 + r2.o.q.x);
              r2.e.setAttribute('d', `M${f1(r2.o.q.x - 12 + s)} ${f1(y)}l24 0`);
              r2.e.setAttribute('stroke-opacity', (0.45 * (a == null ? 1 : +a)).toFixed(3));
            }
            if (lab) fade(lab, BTL.ease(lt, 0.3, 1.2));
          },
        };
      }
      if (mode === 'mound') {
        const GY = 1000;
        const sky = BTL.glow(svg, defs, 540, 700, 700, C.stain, 0.22, g);
        // slow clouds
        const clouds = fog(g, 61, 6, 430, 620, { alpha: 0.045, size: 280, speed: 10, color: C.ink });
        // trees at the sides
        const trees = el(g, 'g');
        for (const [x, s] of [[90, 1.1], [190, 0.8], [930, 1.0], [1030, 0.85]]) {
          const d = `M${x} ${GY - 40}L${x} ${f1(GY - 160 * s)}`;
          const crownD = `M${f1(x - 90 * s)} ${f1(GY - 150 * s)}C${f1(x - 110 * s)} ${f1(GY - 300 * s)} ${f1(x - 30 * s)} ${f1(GY - 400 * s)} ${x} ${f1(GY - 400 * s)}C${f1(x + 30 * s)} ${f1(GY - 400 * s)} ${f1(x + 110 * s)} ${f1(GY - 300 * s)} ${f1(x + 90 * s)} ${f1(GY - 150 * s)}C${f1(x + 50 * s)} ${f1(GY - 120 * s)} ${f1(x - 50 * s)} ${f1(GY - 120 * s)} ${f1(x - 90 * s)} ${f1(GY - 150 * s)}Z`;
          L0(trees, d, C.inkSoft, 8 * s, 1); P0(trees, crownD, C.paperDark, 1); L0(trees, crownD, C.inkSoft, 2, 0.6);
        }
        // the mound
        const mound = `M-300 ${GY + 60}C0 ${GY + 40} 140 760 540 740C940 760 1080 ${GY + 40} 1380 ${GY + 60}L1380 2100L-300 2100Z`;
        P0(g, mound, mix(C.paperLight, C.paperDark, 0.35), 1);
        L0(g, `M-300 ${GY + 60}C0 ${GY + 40} 140 760 540 740C940 760 1080 ${GY + 40} 1380 ${GY + 60}`, C.inkSoft, 2.5, 0.8);
        // steps
        let stp = ''; for (let i = 0; i < 7; i++) { const y = 1000 - i * 34, hw = 70 - i * 4; stp += `M${540 - hw} ${y}L${540 + hw} ${y}`; }
        L0(g, stp, C.inkSoft, 2, 0.55);
        // the memorial
        const MB = 760, mw = 150, mh = 190;
        const front = `M${540 - mw} ${MB}L${540 - mw} ${MB - mh}L${540 + mw} ${MB - mh}L${540 + mw} ${MB}Z`;
        const roof = `M${540 - mw - 24} ${MB - mh}L${540 + mw + 24} ${MB - mh}L${540 + mw + 10} ${MB - mh - 26}L${540 - mw - 10} ${MB - mh - 26}Z`;
        P0(g, front, STONE, 1); P0(g, roof, STONE_TOP, 1);
        const door = `M${540 - 44} ${MB}L${540 - 44} ${MB - 100}C${540 - 44} ${MB - 150} ${540 + 44} ${MB - 150} ${540 + 44} ${MB - 100}L${540 + 44} ${MB}Z`;
        P0(g, door, C.paperDark, 1);
        L0(g, front, C.ink, 3, 1); L0(g, roof, C.ink, 3, 1); L0(g, door, C.inkSoft, 2.5, 0.9);
        let cols = ''; for (const x of [540 - mw + 30, 540 - 90, 540 + 90, 540 + mw - 30]) cols += `M${x} ${MB}L${x} ${MB - mh + 10}`;
        L0(g, cols, C.inkSoft, 2, 0.5);
        const ring = LD(g, door.replace(/Z$/, ''), C.gold, 4, 1);
        const dg = BTL.glow(svg, defs, 540, MB - 70, 120, C.gold, 0, g);
        const gr = grass(g, 9, 110, 820, 1500, { h: 20 });
        const lab = P.label ? txt(g, P.label, 540, 330, 62, { font: LO, italic: true, weight: 400 }) : null;
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.5);
            push(g, lt, dur, 540, 700, 0.04);
            sky.set(0.22 + 0.03 * Math.sin(lt * 0.5));
            clouds.update(lt); gr.update(lt);
            draw(ring, BTL.ease(lt, hit - 0.2, 1.4));
            dg.set(0.25 * BTL.ease(lt, hit, 1.2));
            if (lab) fade(lab, BTL.ease(lt, 0.2, 1.2));
          },
        };
      }
      // shore: Varna bay at dawn
      const HZ = 860;
      const dawn = BTL.glow(svg, defs, 300, HZ - 20, 640, C.stain, 0.22, g);
      const yr = txt(g, P.text || '1444', 540, 500, 210, { weight: 300, spacing: '0.04em' });
      const rule = LD(g, 'M420 552L660 552', C.gold, 2.5, 1);
      const sub = P.sub ? txt(g, P.sub, 540, 630, 60, { font: LO, italic: true, weight: 400, color: C.inkSoft }) : null;
      // sea
      P0(g, `M-300 ${HZ}L1380 ${HZ}L1380 1100L-300 1100Z`, mix(C.paper, C.stain, 0.06), 1);
      L0(g, `M-300 ${HZ}L1380 ${HZ}`, C.inkSoft, 2, 0.6);
      const waves = [];
      for (let i = 0; i < 6; i++) waves.push({ e: L0(g, '', C.inkSoft, 1.6, 0.3), y: HZ + 22 + i * i * 7, ph: i * 1.1 });
      // the hill with the camp (right) and the beach
      const hill = `M260 1100C420 1040 560 940 700 900C820 866 960 850 1380 846L1380 2100L-300 2100L-300 1100Z`;
      P0(g, hill, mix(C.paperDark, C.paperLight, 0.35), 1);
      L0(g, 'M260 1100C420 1040 560 940 700 900C820 866 960 850 1380 846', C.inkSoft, 2.5, 0.8);
      const foam = L0(g, '', C.ink, 2, 0.45);
      const camp = el(g, 'g'), r = rng(52);
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
        const x = 640 + i * 52 + row * 22 + r() * 10, base = 900 - (x - 700) * 0.12 + row * 30;
        if (x > 1100) continue;
        tent(camp, x, base, 0.8 + row * 0.18);
      }
      const sm = smoke(g, 3, [720, 860, 990], 880, 220);
      const fg = fog(g, 7, 10, HZ - 40, 1060, { alpha: 0.08, size: 300, speed: 12 });
      const gr = grass(g, 4, 100, 1130, 1600, { h: 22 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', 0.8);
          push(g, lt, dur, 640, 900, 0.035);
          dawn.set(0.22 + 0.06 * BTL.ease(lt, 0, Math.max(2, dur)));
          fade(yr, BTL.ease(lt, Math.min(hit, 1) - 0.3, 1.1)); draw(rule, BTL.ease(lt, 0.6, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 0.1, 1.0));
          for (const w of waves) { const s = 5 * Math.sin(lt * 0.6 + w.ph); w.e.setAttribute('d', `M-300 ${f1(w.y)}C100 ${f1(w.y + s)} 500 ${f1(w.y - s)} 1380 ${f1(w.y + s * 0.5)}`); }
          const fs = 8 * Math.sin(lt * 0.5);
          foam.setAttribute('d', `M-300 ${f1(1112 + fs * 0.5)}C0 ${f1(1108 - fs)} 150 ${f1(1104 + fs)} 300 ${f1(1088 + fs * 0.4)}`);
          sm.update(lt); fg.update(lt); gr.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ horse + rider (feet at 0, facing right)
  const HORSE = 'M-240-360C-200-400-100-395-20-382C60-372 120-384 160-424C190-470 222-540 252-580C270-604 300-612 322-598' +
    'L334-628L344-596C382-568 410-532 424-506C430-490 420-478 402-480C372-486 342-500 316-510C292-490 272-442 254-402' +
    'C242-362 226-322 206-292C160-262 60-256-40-262C-150-268-230-282-262-312C-280-332-270-352-240-360Z';
  function horseRider(parent, o = {}) {
    const g = el(parent, 'g'), col = o.col || C.paperDark, rim = o.rim || C.inkSoft, rw = o.rw || 3;
    const tail = L0(g, '', col, 26, 1), tailR = L0(g, '', rim, 2, 0.7);
    const cloak = P0(g, '', col, 1), cloakR = L0(g, '', rim, rw * 0.7, 0.8);
    const mkLeg = (shade, ra) => {
      const rU = L0(g, '', rim, 34, ra), rL = L0(g, '', rim, 21, ra, { 'stroke-linecap': 'butt' }), u = L0(g, '', shade, 30, 1), l = L0(g, '', shade, 17, 1, { 'stroke-linecap': 'butt' });
      const knee = P0(g, '', shade, 1), hoof = P0(g, '', shade, 1), hoofR = L0(g, '', rim, 2, ra);
      return { set(h, k, f) {
        const du = `M${f1(h[0])} ${f1(h[1])}L${f1(k[0])} ${f1(k[1])}`, dl = `M${f1(k[0])} ${f1(k[1])}L${f1(f[0])} ${f1(f[1] - 26)}`;
        rU.setAttribute('d', du); u.setAttribute('d', du); rL.setAttribute('d', dl); l.setAttribute('d', dl);
        knee.setAttribute('d', BTL.E(k[0], k[1], 13, 13));
        const hd = `M${f1(f[0] - 14)} ${f1(f[1] - 22)}L${f1(f[0] + 14)} ${f1(f[1] - 22)}L${f1(f[0] + 20)} ${f1(f[1])}L${f1(f[0] - 16)} ${f1(f[1])}Z`;
        hoof.setAttribute('d', hd); hoofR.setAttribute('d', hd);
      } };
    };
    const farShade = mix(col, C.paper, 0.35);
    const legsBack = [mkLeg(farShade, 0.35), mkLeg(farShade, 0.35)];
    P0(g, HORSE, col, 1); L0(g, HORSE, rim, rw, 0.9);
    L0(g, 'M190-470C200-500 220-540 245-572M205-450C214-480 232-520 256-556M330-560C356-548 372-530 382-512', rim, 2, 0.5);   // mane, bridle
    const legsFront = [mkLeg(col, 0.6), mkLeg(col, 0.6)];
    // rider
    const rider = 'M10-392C0-430-4-500 16-552C26-574 70-578 82-552C96-520 92-470 70-430L120-340L96-262L80-268L92-336L40-392Z';
    P0(g, rider, col, 1); L0(g, rider, rim, rw, 0.9);
    P0(g, BTL.E(56, -604, 34, 38), col, 1); L0(g, BTL.E(56, -604, 34, 38), rim, rw, 0.9);
    L0(g, 'M24-610L90-610', rim, 2, 0.7);  // visor slit
    const cr = crown(g, 56, -634, 0.42, C.gold, 3.5);
    // arm + lance
    L0(g, 'M56-540L118-486L150-470', col, 22, 1); L0(g, 'M56-540L118-486L150-470', rim, 2, 0.6);
    const lance = L0(g, 'M-170-528L640-404', C.ink, 6, 1);
    const pennant = P0(g, '', C.gold, 0.85);
    return {
      g, cr, lance, pennant,
      update(lt, sp = 1) {
        const ph = lt * 2.6 * sp;
        // legs: each from a hip/shoulder, swinging; two shades for near and far side
        // a leg: upper bone from hip/shoulder, joint, lower bone, hoof; fore knees fold back, hind hocks fold forward
        const leg = (L, x, y, a, b) => {
          const k = [x + Math.sin(a) * 140, y + Math.cos(a) * 140], f = [k[0] + Math.sin(a + b) * 158, Math.min(0, k[1] + Math.cos(a + b) * 158)];
          L.set([x, y], k, f);
        };
        const s = Math.sin(ph), c = Math.cos(ph), s2 = Math.sin(ph + 0.7), c2 = Math.cos(ph + 0.7);
        leg(legsFront[0], 180, -300, 0.35 * s + 0.1, -0.15 - 0.6 * Math.max(0, c));
        leg(legsFront[1], -210, -300, -0.35 * s, 0.2 + 0.45 * Math.max(0, -c));
        leg(legsBack[0], 150, -300, 0.35 * s2 + 0.1, -0.15 - 0.6 * Math.max(0, c2));
        leg(legsBack[1], -180, -300, -0.35 * s2, 0.2 + 0.45 * Math.max(0, -c2));
        const tw = 16 * Math.sin(lt * 1.1);
        const td = `M-248-352C-300-350 ${f1(-340)} ${f1(-320 + tw)} ${f1(-390)} ${f1(-300 + tw * 1.6)}`;
        tail.setAttribute('d', td); tailR.setAttribute('d', td);
        const w1 = 14 * Math.sin(lt * 0.9), w2 = 20 * Math.sin(lt * 0.9 + 1);
        const cd = `M30-560C-40-560-110 ${f1(-540 + w1)} -190 ${f1(-500 + w2)}C-170 ${f1(-470 + w1)} -120 -440 -60 -420C-20 -410 10 -420 20 -440Z`;
        cloak.setAttribute('d', cd); cloakR.setAttribute('d', cd);
        const pw = 10 * Math.sin(lt * 1.4);
        pennant.setAttribute('d', `M600-412L560-420C530 ${f1(-400 + pw)} 500 ${f1(-392 + pw)} 470 ${f1(-382 + pw * 1.4)}C500 ${f1(-374 + pw)} 540 -380 590 -398Z`);
      },
    };
  }
  // a tall faceless Janissary silhouette seen from behind (feet at 0): long kaftan, folded felt cap (börk)
  function janissary(parent, x, y, h, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${(h / 1000).toFixed(4)})${o.flip ? ' scale(-1 1)' : ''}` });
    const col = C.paperDark, rim = C.inkSoft;
    const body = 'M-150 0L-120-560C-110-640-60-690 0-690C60-690 110-640 120-560L150 0Z';
    const head = BTL.E(0, -760, 70, 80);
    const cap = 'M-62-800L-50-1000C-46-1030 46-1030 50-1000L62-800Z';
    const flap = 'M40-1000C120-990 160-900 150-780C144-700 150-640 170-600L120-600C100-660 96-720 100-790C104-880 80-950 40-980Z';
    const band = 'M-74-790L74-790L68-830L-68-830Z';
    for (const d of [flap, body, head, cap, band]) { P0(g, d, col, 1); L0(g, d, rim, 4, 0.8); }
    if (o.spear) L0(g, 'M190 0L230-1250M222-1250L230-1310L238-1250Z', rim, 8, 0.9);
    return g;
  }
  SH.bt_va_battle = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'charge', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'vanish') {
        const GY = 1080;
        P0(g, `M-300 ${GY}L1380 ${GY}L1380 2100L-300 2100Z`, mix(C.paperDark, C.paperLight, 0.25), 1);
        L0(g, `M-300 ${GY}L1380 ${GY}`, C.inkSoft, 2, 0.45);
        const pool = BTL.glow(svg, defs, 540, 820, 520, C.stain, 0.36, g);
        const rg = el(g, 'g');
        const R = horseRider(rg, {});
        const thick = fog(g, 17, 12, 760, 1090, { alpha: 0.18, size: 260, speed: 18, color: C.ink });
        // what falls: the crown and the lance (drawn in world space from the moment of "hit")
        const wl = L0(g, '', C.ink, 5, 0);
        const wc = el(g, 'g', { opacity: 0 }), wcr = crown(wc, 0, 0, 0.34, C.gold, 3.5);
        const glint = BTL.glow(svg, defs, 0, 0, 70, C.gold, 0, g);
        // four Janissaries (tall felt cap, the long flap falling down the back), closing in slowly
        const J = [[130, 200, 1135, 560, 0], [300, 365, 1110, 500, 0], [960, 890, 1135, 560, 1], [800, 745, 1110, 500, 1]].map(([x0, x1, y, h, fl]) => {
          const jg = el(g, 'g'); janissary(jg, 0, 0, h, { flip: fl }); return { jg, x0, x1, y };
        });
        const low = fog(g, 29, 14, 1100, 1800, { alpha: 0.05, size: 320, speed: 10 });
        return {
          update(lt, dur, cues) {
            const hit = Math.min(cue(cues, 'hit', dur * 0.5), dur - 1.2);
            push(g, lt, dur, 540, 900, 0.045);
            const e = BTL.ease(lt, 0, Math.max(2, dur)), ox = 440 + 30 * e;
            for (const j of J) j.jg.setAttribute('transform', `translate(${f1(lerp(j.x0, j.x1, e))} ${j.y})`);
            const k = BTL.ease(lt, hit + 0.25, Math.max(1, dur - hit - 0.4));
            R.update(lt, 0.6 * (1 - 0.8 * BTL.ease(lt, hit - 0.2, 0.6)));
            fade(rg, 1 - 0.97 * k);
            rg.setAttribute('transform', `translate(${f1(ox)} ${f1(GY + 30 * k)}) scale(0.8)`);
            const fallen = lt >= hit;
            for (const x of [...R.cr, R.lance, R.pennant]) x.setAttribute('opacity', fallen ? 0 : 1);
            const u = clamp01((lt - hit) / 0.8), uf = u * u, ul = clamp01((lt - hit) / 1.0);
            fade(wc, fallen ? 1 : 0);
            wc.setAttribute('transform', `translate(${f1(lerp(ox + 45, ox + 95, u))} ${f1(lerp(573, 1074, uf))}) rotate(${f1(28 * u)})`);
            for (const x of wcr) x.setAttribute('stroke-opacity', '1');
            glint.e.setAttribute('cx', f1(ox + 95)); glint.e.setAttribute('cy', '1060');
            glint.set(fallen ? 0.35 * BTL.ease(lt, hit + 0.7, 0.5) * (0.85 + 0.15 * Math.sin(lt * 1.5)) : 0);
            const lf = ul * ul;
            const ax = lerp(ox - 136, ox - 170, lf), ay = lerp(658, 1078, lf), bx = lerp(ox + 512, ox + 420, lf), by = lerp(757, 1068, lf);
            wl.setAttribute('d', `M${f1(ax)} ${f1(ay)}L${f1(bx)} ${f1(by)}`);
            wl.setAttribute('stroke-opacity', fallen ? 1 : 0);
            thick.update(lt, 0.4 + 0.8 * k);
            low.update(lt);
            pool.set(0.36 - 0.16 * k);
          },
        };
      }
      // charge
      const GY = 1060;
      P0(g, `M-300 ${GY}L1380 ${GY}L1380 2100L-300 2100Z`, mix(C.paperDark, C.paperLight, 0.3), 1);
      L0(g, `M-300 ${GY}L1380 ${GY}`, C.inkSoft, 2, 0.5);
      const HZ = 780;
      L0(g, `M-300 ${HZ}C200 ${HZ - 10} 700 ${HZ + 6} 1380 ${HZ - 4}`, C.inkSoft, 2, 0.35);
      // far: the sultan's standard (tuğ) on the horizon, right
      const tug = el(g, 'g', { opacity: 0 });
      L0(tug, `M840 ${HZ}L840 ${HZ - 170}`, C.inkSoft, 4, 0.9);
      P0(tug, `M840 ${HZ - 170}C824 ${HZ - 150} 820 ${HZ - 110} 828 ${HZ - 80}L852 ${HZ - 80}C860 ${HZ - 110} 856 ${HZ - 150} 840 ${HZ - 170}Z`, C.inkSoft, 0.9);
      P0(tug, BTL.E(840, HZ - 178, 9, 9), C.gold, 1);
      for (let i = 0; i < 6; i++) tent(tug, 740 + i * 40, HZ + 2, 0.7);
      const pool = BTL.glow(svg, defs, 520, 760, 560, C.stain, 0.3, g);
      // faint riders behind
      const back = [];
      for (const [x, y, s, a] of [[80, 990, 0.34, 0.45], [260, 1000, 0.3, 0.35], [-60, 1010, 0.32, 0.35], [380, 975, 0.26, 0.3]]) {
        const bg2 = el(g, 'g', { opacity: a });
        back.push({ g: bg2, R: horseRider(bg2, { col: mix(C.paperDark, C.paper, 0.4), rw: 6 }), x, y, s });
      }
      const dust = fog(g, 41, 9, 950, 1080, { alpha: 0.08, size: 220, speed: -22 });
      const rg = el(g, 'g');
      const R = horseRider(rg, {});
      const dust2 = fog(g, 43, 6, 1040, 1120, { alpha: 0.07, size: 260, speed: -30 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.65);
          push(g, lt, dur, 540, 800, 0.035);
          const mv = BTL.ease(lt, 0, Math.max(3, dur));
          rg.setAttribute('transform', `translate(${f1(370 + 60 * mv)} ${GY}) scale(0.92)`);
          R.update(lt, 0.7);
          for (const b of back) { b.g.setAttribute('transform', `translate(${f1(b.x + 60 * mv)} ${b.y}) scale(${b.s})`); b.R.update(lt + b.x, 0.7); }
          for (const e of R.cr) e.setAttribute('stroke-opacity', (0.8 + 0.2 * Math.sin(lt * 1.2)).toFixed(3));
          fade(tug, BTL.ease(lt, hit - 0.2, 1.2));
          pool.set(0.3 + 0.04 * Math.sin(lt * 0.7));
          dust.update(lt); dust2.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_va_armor
  SH.bt_va_armor = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const GY = 1000;
      const dusk = BTL.glow(svg, defs, 540, GY - 60, 760, C.stain, 0.16, g);
      P0(g, `M-300 ${GY}L1380 ${GY}L1380 2100L-300 2100Z`, mix(C.paperDark, C.paperLight, 0.3), 1);
      L0(g, `M-300 ${GY}C200 ${GY - 8} 800 ${GY + 8} 1380 ${GY - 4}`, C.inkSoft, 2, 0.6);
      const pool = BTL.glow(svg, defs, 540, 1020, 380, C.stain, 0.3, g);
      P0(g, BTL.E(540, 1030, 300, 40), C.stain, 0.06);
      const fgB = fog(g, 5, 9, 880, 1060, { alpha: 0.08, size: 300, speed: 12 });
      // the ghost of the armour
      const ag = el(g, 'g');
      const helm = 'M464 510C464 440 500 410 540 410C580 410 616 440 616 510L616 580C616 600 596 610 540 612C484 610 464 600 464 580Z';
      const plate = 'M420 640C470 620 610 620 660 640L700 690L680 900C640 940 440 940 400 900L380 690Z';
      const pauld = 'M430 636C372 626 326 650 312 708C340 722 384 720 410 704ZM650 636C708 626 754 650 768 708C740 722 696 720 670 704Z' +
        'M326 686C352 672 386 668 414 674M338 664C362 652 392 648 420 654M754 686C728 672 694 668 666 674M742 664C718 652 688 648 660 654';
      const lines = [];
      for (const d of [helm, plate, pauld, 'M480 520L600 520M480 534L600 534M500 566l0 0M520 572l0 0M560 572l0 0M580 566l0 0M470 700C510 690 570 690 610 700M398 846C470 862 610 862 682 846M396 872C470 888 610 888 684 872M420 900L420 940M480 908L480 950M600 908L600 950M660 900L660 940']) {
        const e = L0(ag, d, C.ink, 4, 0.85, Object.assign({ pathLength: 1 }, {}));
        lines.push(e);
      }
      const cr = crown(ag, 540, 424, 0.62, C.gold, 4);
      const gr = grass(g, 12, 110, 1010, 1600, { h: 22 });
      const ds = motes(g, 3, 18, [200, 380, 880, 980], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6);
          push(g, lt, dur, 540, 760, 0.035);
          lines.forEach((e, i) => draw(e, BTL.ease(lt, 0.05 + i * 0.15, 1.1)));
          const gone = BTL.ease(lt, hit - 0.1, Math.max(1, Math.min(1.8, dur - hit - 0.2)));
          fade(ag, 1 - gone);
          for (const e of cr) e.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0.4, 0.8)).toFixed(3));
          pool.set(0.3 - 0.12 * gone + 0.03 * Math.sin(lt * 0.7));
          dusk.set(0.16 + 0.02 * Math.sin(lt * 0.5));
          fgB.update(lt, 1 + 1.5 * gone); gr.update(lt); ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_va_map
  const COAST = [[30.7, 46.9], [30.7, 46.6], [30.2, 45.8], [29.7, 45.2], [29.0, 44.8], [28.65, 44.17], [28.58, 43.8], [28.47, 43.36], [28.1, 43.3],
    [27.95, 43.2], [27.9, 42.9], [27.9, 42.7], [27.5, 42.45], [27.7, 42.1], [28.0, 41.7], [28.6, 41.3], [29.05, 41.2], [29.6, 41.15], [30.5, 41.2],
    [31.4, 41.3], [33, 42]];
  const DANUBE = [[29.6, 45.15], [28.9, 45.3], [28.2, 45.45], [27.9, 45.0], [27.95, 44.5], [27.3, 44.12], [26.5, 44.0], [25.95, 43.85], [25.0, 43.7],
    [24.3, 43.75], [23.5, 43.8], [22.9, 44.0], [22.0, 44.4]];
  SH.bt_va_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      // Varna sits in the middle of the picture; the engine's ground, light and vignette show through (no backdrop)
      const k = 0.7224 * 166;
      const X = lon => 540 + (lon - 27.92) * k, Y = lat => 600 + (43.21 - lat) * 166;
      const pts = COAST.map(p => [X(p[0]), Y(p[1])]);
      let seaD = `M${f1(pts[0][0])} -300`;
      for (const p of pts) seaD += `L${f1(p[0])} ${f1(p[1])}`;
      seaD += `L1400 ${f1(Y(42.2))}L1400 -300Z`;
      // graticule
      let gr = '';
      for (let lon = 20; lon <= 32; lon += 2) gr += `M${f1(X(lon))} -200L${f1(X(lon))} 2100`;
      for (let lat = 40; lat <= 48; lat += 1) gr += `M-300 ${f1(Y(lat))}L1400 ${f1(Y(lat))}`;
      L0(g, gr, C.inkSoft, 1.5, 0.14);
      P0(g, seaD, C.paperDark, 0.5);
      const pool = BTL.glow(svg, defs, X(27.92), Y(43.21), 420, C.stain, 0.3, g);
      const coast = L0(g, 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L'), C.inkSoft, 3, 1, { pathLength: 1 });
      const dn = DANUBE.map(p => [X(p[0]), Y(p[1])]);
      const river = L0(g, 'M' + dn.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L'), C.inkSoft, 3.5, 0.9, { pathLength: 1 });
      const sea = txt(g, 'Karadeniz', X(30.0), Y(42.55), 56, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const tuna = txt(g, 'Tuna', X(25.0), Y(44.3), 52, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const VX = X(27.92), VY = Y(43.21);
      const ring = el(g, 'circle', { cx: VX, cy: VY, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
      el(g, 'circle', { cx: VX, cy: VY, r: 10, fill: C.gold });
      const vl = txt(g, 'Varna', VX - 30, VY + 80, 60, { weight: 400 });
      vl.setAttribute('text-anchor', 'end');
      for (const t of [vl, sea, tuna]) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round'); }
      // the scatter: thin lines from Varna to the north and west, dots running along them and fading
      const dests = [[28.3, 44.9], [27.3, 44.3], [26.2, 44.05], [25.2, 43.5], [26.6, 42.9], [28.9, 45.4]];
      const r = rng(8);
      const rays = dests.map(([lo, la], i) => {
        const ex = X(lo), ey = Y(la), mx = (VX + ex) / 2 + (r() - 0.5) * 80, my = (VY + ey) / 2 + (r() - 0.5) * 80;
        const d = `M${f1(VX)} ${f1(VY)}Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`;
        const e = L0(g, d, C.gold, 4, 0.9, { pathLength: 1, 'stroke-dasharray': '0.03 0.025' });
        const dots = [0, 1, 2, 3].map(j => ({ e: P0(g, '', C.ink, 0), off: j * 0.22 + r() * 0.1 }));
        return { e, VX, VY, mx, my, ex, ey, dots, at: i * 0.12 };
      });
      const qb = (o, t) => [(1 - t) * (1 - t) * o.VX + 2 * (1 - t) * t * o.mx + t * t * o.ex, (1 - t) * (1 - t) * o.VY + 2 * (1 - t) * t * o.my + t * t * o.ey];
      return {
        update(lt, dur, cues) {
          const hit = Math.min(cue(cues, 'hit', dur * 0.4), 0.5);
          push(g, lt, dur, VX, VY, 0.04);
          coast.style.strokeDasharray = '1 1'; coast.style.strokeDashoffset = 1 - BTL.ease(lt, 0, 1.2);
          river.style.strokeDasharray = '1 1'; river.style.strokeDashoffset = 1 - BTL.ease(lt, 0.3, 1.2);
          fade(sea, 0.75 + 0.25 * BTL.ease(lt, 0, 0.6)); fade(tuna, BTL.ease(lt, 0.3, 0.8)); fade(vl, 0.6 + 0.4 * BTL.ease(lt, 0, 0.5));
          pool.set(0.3 + 0.04 * Math.sin(lt * 0.8));
          const ph = ((lt % 2.4) + 2.4) % 2.4 / 2.4;
          ring.setAttribute('r', f1(14 + 30 * ph)); ring.setAttribute('stroke-opacity', ((1 - ph) * 0.85).toFixed(3));
          for (const o of rays) {
            const p = BTL.ease(lt, hit - 0.2 + o.at, 1.0);
            o.e.setAttribute('opacity', (p * (1 - 0.5 * BTL.ease(lt, hit + 1.6, 1.5))).toFixed(3));
            o.e.style.strokeDashoffset = f1(-lt * 0.02);
            for (const d of o.dots) {
              const u = clamp01((lt - hit - o.at - d.off) / 1.8);
              const [x, y] = qb(o, u);
              d.e.setAttribute('d', BTL.E(x, y, 9, 9));
              d.e.setAttribute('fill-opacity', (u > 0 ? 0.85 * (1 - u) : 0).toFixed(3));
            }
          }
        },
      };
    },
  };
})();
