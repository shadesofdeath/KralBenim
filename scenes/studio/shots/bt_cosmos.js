// Belgesel style space / time / relativity shots (docs/BELGESEL.md): sparse night worlds and clean diagrams.
// Nothing jitters: the only motion is slow and natural (a travelling light pulse, an orbiting moon, a gliding train,
// breathing stars, a sky turning about its pole). Every place is drawn on the 1920x1080 stage (BTL.stage frames it
// for a vertical Short). Labels >= 40 px, nothing below y ~ 900 (subtitles) or in the top-left corner.
//   bt_street    P: {people: true}           cues: pass   night street, two strangers pass, Andromeda faint above
//   bt_galaxy    P: {label, sub, beam: true, scale}  cues: show   a starfield, Andromeda in the middle; a light pulse leaves it
//   bt_scope     P: {}                                     1676: a figure at a long telescope on a rooftop, Jupiter bright
//   bt_jupiter   P: {label, sub, late: false}  cues: hide, out   Jupiter, its shadow; Io slides into it (and out, late)
//   bt_orbit     P: {gold: "+22 dakika"}  cues: far, gap  top view: Sun, Earth's orbit, Jupiter; Earth swings away,
//                                                         the extra light path lights up in gold
//   bt_lighttime P: {from: "sun"|"star", to: 500, fmt: "mmss"|"dec", unit, label, sub}  cues: go
//                                                         a light pulse crosses from the source to Earth, a counter runs
//   bt_sky       P: {stars: [{x, y, label, at}], andromeda: [x, y]}   night sky over a hill; stars get labelled on cues
//   bt_clocks    P: {n: 5, mode: "sync"|"drift", label}  cues: drift  a row of pocket watches strung across space
//   bt_desk      P: {}                                     Bern 1905: a clerk at a desk under a lamp, a clock tower outside
//   bt_train     P: {mode: "platform"|"train"}  cues: strike   train, platform, two lightning strikes, light fronts
//   bt_slices    P: {gap: "günler", a: "Dünya", b: "Andromeda"}  cues: tilt   space-time diagram: two "now" lines
//   bt_plane     P: {ticket: false, name, sub}  cues: show   an airliner crossing a night sky over clouds (+ a ticket)
//   bt_globe     P: {east, west}  cues: east, west        a globe with an eastward and a westward route around it
//   bt_twoclocks P: {left: {label, value, unit}, right: {...}}  cues: run   two atomic clocks, counters drift apart
//   bt_gps       P: {mode: "orbit"|"drift", label, sub}  cues: tick | drift   GPS satellite around Earth / a position
//                                                         dot sliding away from the true spot on a street grid
//   bt_cosmic    P: {label, sub}  cues: show               galaxies on an expanding grid, each with the same clock
//   bt_alone     P: {}                                     the closing image: one figure on a hill under a turning sky
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: o.opacity ?? 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const lab = (g, s, x, y, size, o = {}) => txt(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const halo = e => { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); return e; };
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const circ = (cx, cy, r) => BTL.E(cx, cy, r, r);

  // ---------------------------------------------------------------- shared pieces
  // Andromeda: a tilted soft ellipse of light with a bright core and two dark dust lanes
  function andromeda(parent, svg, defs, x, y, s = 1, rot = -32) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
    const gl = BTL.glow(svg, defs, 0, 0, 300, C.stain, 0.3, g);
    for (let i = 0; i < 9; i++) { const k = 1 - i / 9; P0(g, BTL.E(0, 4 * k, 270 * k + 14, 70 * k + 5), C.ink, 0.07 + i * 0.012); }
    const r = rng(31);
    let dots = ''; for (let i = 0; i < 90; i++) { const u = r() * TAU, q = Math.sqrt(r()) * 0.95, px = Math.cos(u) * 260 * q, py = Math.sin(u) * 64 * q; dots += `M${px.toFixed(1)} ${py.toFixed(1)}m-1.4 0a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0`; }
    P0(g, dots, C.ink, 0.35);
    L0(g, 'M-230 30C-140 50 40 54 200 26', C.paperDark, 4, 0.28);       // a thin dust lane under the core
    L0(g, 'M-160 44C-60 60 60 60 150 40', C.paperDark, 3, 0.18);
    P0(g, BTL.E(0, 0, 30, 11), C.ink, 0.55); P0(g, BTL.E(0, 0, 14, 6), C.ink, 0.95);
    P0(g, circ(150, -74, 6), C.ink, 0.45); P0(g, circ(-70, 72, 4.5), C.ink, 0.35);   // satellite galaxies
    return { g, update(lt) { gl.set(0.27 + 0.05 * Math.sin(lt * 0.5)); } };
  }
  // Earth seen from space: disc, ocean tint, a few continents, night side
  function earth(parent, x, y, r, id, o = {}) {
    const g = el(parent, 'g');
    P0(g, circ(x, y, r), C.blue, 0.32);
    const cp = el(g, 'clipPath', { id }); el(cp, 'path', { d: circ(x, y, r) });
    const land = el(g, 'g', { 'clip-path': `url(#${id})` });
    const k = r / 100, la = o.land ?? 0.5;
    const T = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => `${(x + a * k).toFixed(1)} ${(y + b * k).toFixed(1)}`);
    P0(land, T('M-62 -58 C-48 -66 -30 -62 -24 -50 C-18 -40 -30 -34 -26 -24 C-22 -14 -34 -6 -40 6 C-46 -2 -56 -10 -60 -22 C-66 -34 -72 -50 -62 -58 Z'), C.paperLight, la);
    P0(land, T('M-34 12 C-24 8 -16 16 -18 28 C-20 44 -28 58 -34 70 C-40 56 -44 40 -42 26 C-40 18 -38 14 -34 12 Z'), C.paperLight, la);
    P0(land, T('M8 -66 C26 -74 52 -70 64 -58 C76 -48 72 -36 60 -30 C48 -24 44 -12 34 -16 C24 -20 26 -34 16 -38 C6 -42 -2 -58 8 -66 Z'), C.paperLight, la);
    P0(land, T('M14 -10 C28 -16 42 -6 44 10 C46 28 36 48 24 54 C14 40 12 22 8 10 C6 2 8 -6 14 -10 Z'), C.paperLight, la);
    P0(land, T('M52 40 C62 36 72 42 70 52 C66 60 56 60 52 52 C50 46 50 42 52 40 Z'), C.paperLight, la * 0.9);
    P0(land, T('M44 -110 C84 -50 84 50 44 110 L130 110 L130 -110 Z'), C.paperDark, 0.6);   // night side
    L0(g, circ(x, y, r), C.ink, Math.max(2.5, r / 60));
    return g;
  }
  function sun(parent, svg, defs, x, y, r) {
    const gl = BTL.glow(svg, defs, x, y, r * 4, C.gold, 0.32, parent);
    P0(parent, circ(x, y, r), C.gold, 0.95);
    P0(parent, circ(x, y, r * 0.7), C.ink, 0.25);
    return { update(lt) { gl.set(0.28 + 0.05 * Math.sin(lt * 0.7)); } };
  }
  // an analog watch face; set(h) in hours
  function watch(parent, x, y, r, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y})` });
    P0(g, circ(0, 0, r), C.paperLight, 1);
    L0(g, circ(0, 0, r), o.color || C.ink, Math.max(2.5, r / 18));
    if (o.crown !== false) L0(g, `M0 ${-r - 2}L0 ${-r - r * 0.22}M${-r * 0.12} ${-r - r * 0.24}L${r * 0.12} ${-r - r * 0.24}`, o.color || C.ink, Math.max(2.5, r / 18));
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r1 = r * (i % 3 ? 0.84 : 0.74); ticks += `M${(Math.sin(a) * r1).toFixed(1)} ${(-Math.cos(a) * r1).toFixed(1)}L${(Math.sin(a) * r * 0.92).toFixed(1)} ${(-Math.cos(a) * r * 0.92).toFixed(1)}`; }
    L0(g, ticks, C.inkSoft, Math.max(2, r / 30));
    const hh = L0(g, '', C.ink, Math.max(3, r / 14)), mm = L0(g, '', C.ink, Math.max(2.5, r / 20)), ss = L0(g, '', C.gold, Math.max(1.5, r / 40));
    P0(g, circ(0, 0, Math.max(3, r / 14)), C.gold, 1);
    const hand = (e, a, len) => e.setAttribute('d', `M0 0L${(Math.sin(a) * len).toFixed(1)} ${(-Math.cos(a) * len).toFixed(1)}`);
    return { g, set(h, sec) { hand(hh, h / 12 * TAU, r * 0.48); hand(mm, (h % 1) * TAU, r * 0.72); hand(ss, (sec ?? 0) / 60 * TAU, r * 0.8); } };
  }
  // a night sky that slowly turns about a pole (natural motion, ~0.25 deg/s)
  function turningSky(parent, n, seed, pole, rate = 0.25) {
    const g = el(parent, 'g'), st = BTL.stars(g, n, seed, [-700, -700, 2620, 1300]);
    return { g, update(lt) { st.update(lt); g.setAttribute('transform', `rotate(${(lt * rate).toFixed(3)} ${pole[0]} ${pole[1]})`); } };
  }
  // gentle light pulse: a short bright dash with a glow, placed with set(x, y, a)
  function pulse(parent, svg, defs, r = 18) {
    const gl = BTL.glow(svg, defs, 0, 0, r * 5, C.gold, 0, parent);
    const c = P0(parent, circ(0, 0, r * 0.45), C.ink, 0);
    return { set(x, y, a) { gl.e.setAttribute('cx', x); gl.e.setAttribute('cy', y); gl.set(0.55 * a); c.setAttribute('d', circ(x, y, r * 0.45)); c.setAttribute('fill-opacity', a.toFixed(3)); } };
  }
  let uid = 0;

  // ---------------------------------------------------------------- places
  SH.bt_street = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 220, 211, [0, 0, W, 560]);
      const an = andromeda(g, svg, defs, 1450, 210, 0.62);
      // far rooftops with a few lit windows
      const r = rng(83); let roofs = 'M0 640', win = [];
      for (let x = 0; x < 1960;) { const w = 110 + r() * 150, h = 90 + r() * 170; roofs += `L${x} ${640 - h}L${x + w} ${640 - h}`; if (r() < 0.55) win.push([x + w * (0.25 + r() * 0.5), 640 - h + 30 + r() * (h - 70)]); x += w; }
      roofs += 'L1960 640L1960 1800L0 1800Z';
      P0(g, roofs, C.paperDark, 1);
      L0(g, roofs.replace(/L1960 1800L0 1800Z$/, ''), C.inkSoft, 2, 0.5);
      const lights = win.map(([x, y], i) => ({ e: P0(g, `M${x - 9} ${y - 13}h18v26h-18Z`, C.gold, 0.5), ph: i * 1.7 }));
      // pavement + street
      P0(g, 'M0 640L1920 640L1920 1800L0 1800Z', C.paperLight, 0.9);
      L0(g, 'M0 640L1920 640', C.inkSoft, 2.5);
      L0(g, 'M0 820L1920 820', C.inkSoft, 2, 0.5);
      let joints = ''; for (let x = 60; x < 1920; x += 150) joints += `M${x} 652L${x - 30} 812`;
      L0(g, joints, C.inkSoft, 1.5, 0.35);
      // a street lamp
      const lamp = BTL.glow(svg, defs, 1700, 300, 330, C.stain, 0.3, g);
      L0(g, 'M1700 790L1700 300M1700 300C1700 270 1660 262 1640 280', C.ink, 6);
      P0(g, 'M1612 280L1668 280L1656 304L1624 304Z', C.gold, 0.9);
      P0(g, BTL.E(1660, 790, 200, 18), C.stain, 0.12);
      const A = el(g, 'g'), B = el(g, 'g');
      if (P.people !== false) { BTL.person(A, 'stand', 0, 0, 300, { face: 1 }); BTL.person(B, 'stand', 0, 0, 290, { face: -1 }); }
      return {
        update(lt, dur, cues) {
          st.update(lt); an.update(lt);
          lamp.set(0.28 + 0.03 * Math.sin(lt * 0.9));
          lights.forEach(l => l.e.setAttribute('fill-opacity', (0.42 + 0.12 * Math.sin(lt * 0.4 + l.ph)).toFixed(3)));
          const tp = cue(cues, 'pass', dur * 0.55), v = 42;     // the two meet at x 960 at the cue
          A.setAttribute('transform', `translate(${(930 + (lt - tp) * v).toFixed(1)} 800)`);
          B.setAttribute('transform', `translate(${(990 - (lt - tp) * v).toFixed(1)} 812)`);
        },
      };
    },
  };

  SH.bt_galaxy = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.3 });
      const st = BTL.stars(g, 340, 517, [0, 0, W, 1080]);
      const s = P.scale || 1.5, gx = P.x ?? 960, gy = P.y ?? 400;
      const an = andromeda(g, svg, defs, gx, gy, s);
      const path = `M${gx} ${gy}L${gx - 760} ${gy + 560}`;
      const trail = P.beam ? L0(g, path, C.gold, 2.5, 0.5, { pathLength: 1 }) : null;
      const pu = P.beam ? pulse(g, svg, defs, 16) : null;
      const la = P.label ? halo(txt(g, P.label, gx, 800, 64, { weight: 400 })) : null;
      const sb = P.sub ? halo(lab(g, P.sub, gx, 866, 44)) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt); an.update(lt);
          const t0 = cue(cues, 'show', 1);
          fade(la, BTL.ease(lt, t0, 1.2)); fade(sb, BTL.ease(lt, t0 + 0.6, 1.2));
          if (pu) {   // the light leaves the galaxy and travels slowly towards the lower left (towards us)
            const p = clamp01((lt - 0.6) / Math.max(4, dur - 0.8));
            draw(trail, p);
            pu.set(gx - 760 * p, gy + 560 * p, BTL.ease(lt, 0.4, 0.8));
          }
        },
      };
    },
  };

  SH.bt_scope = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1000 });
      const sky = turningSky(g, 230, 1676, [1500, 120], 0.12);
      // Jupiter: a bright point with its four moons in a line
      const jg = BTL.glow(svg, defs, 1490, 200, 120, C.stain, 0.4, g);
      P0(g, circ(1490, 200, 11), C.ink, 1);
      const moons = [[-46, 0], [-26, 0], [30, 0], [62, 0]].map(([dx]) => P0(g, circ(1490 + dx, 200, 3.5), C.ink, 0.85));
      // rooftop terrace with a balustrade
      P0(g, 'M0 760L1920 760L1920 1800L0 1800Z', C.paperDark, 1);
      P0(g, 'M0 700L1920 700L1920 760L0 760Z', C.paperLight, 0.9);
      L0(g, 'M0 700L1920 700M0 760L1920 760', C.inkSoft, 2.5);
      let bal = ''; for (let x = 30; x < 1920; x += 64) bal += `M${x} 760L${x} 860`;
      L0(g, bal, C.inkSoft, 2, 0.5);
      L0(g, 'M0 860L1920 860', C.inkSoft, 3, 0.7);
      // a long tube telescope on a tripod, aimed at Jupiter
      const D = BTL.drawing(g);
      const ex = 820, ey = 560, ang = Math.atan2(200 - ey, 1490 - ex), len = 560, ox = ex + Math.cos(ang) * len, oy = ey + Math.sin(ang) * len;
      const nx = -Math.sin(ang), ny = Math.cos(ang), tube = (w0, w1) => `M${(ex + nx * w0).toFixed(1)} ${(ey + ny * w0).toFixed(1)}L${(ox + nx * w1).toFixed(1)} ${(oy + ny * w1).toFixed(1)}L${(ox - nx * w1).toFixed(1)} ${(oy - ny * w1).toFixed(1)}L${(ex - nx * w0).toFixed(1)} ${(ey - ny * w0).toFixed(1)}Z`;
      D.f(tube(9, 18), C.paperLight, 1); D.s(tube(9, 18), { w: 3.5 });
      for (const k of [0.25, 0.5, 0.75]) { const x = ex + Math.cos(ang) * len * k, y = ey + Math.sin(ang) * len * k, w = 9 + 9 * k + 3; D.s(`M${(x + nx * w).toFixed(1)} ${(y + ny * w).toFixed(1)}L${(x - nx * w).toFixed(1)} ${(y - ny * w).toFixed(1)}`, { w: 3, color: C.inkSoft }); }
      const mx = ex + Math.cos(ang) * len * 0.42, my = ey + Math.sin(ang) * len * 0.42;
      D.s(`M${mx.toFixed(1)} ${my.toFixed(1)}L${mx - 90} 700M${mx.toFixed(1)} ${my.toFixed(1)}L${mx + 70} 700M${mx.toFixed(1)} ${my.toFixed(1)}L${mx - 10} 700`, { w: 4 });
      BTL.person(g, 'bend', 780, 700, 270, { face: 1 });
      // a lantern on the parapet
      const lg = BTL.glow(svg, defs, 520, 650, 150, C.stain, 0.3, g);
      P0(g, 'M500 690L540 690L536 640L504 640Z', C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      const fl = P0(g, '', C.gold, 0.95);
      return {
        update(lt) {
          sky.update(lt); D.reveal(BTL.ease(lt, 0, 2.4));
          jg.set(0.36 + 0.06 * Math.sin(lt * 0.6));
          moons.forEach((m, i) => m.setAttribute('fill-opacity', (0.7 + 0.2 * Math.sin(lt * 0.5 + i)).toFixed(3)));
          lg.set(0.27 + 0.03 * Math.sin(lt * 1.7));
          const h = 26 + 3 * Math.sin(lt * 2.1) + 2 * Math.sin(lt * 3.3);
          fl.setAttribute('d', `M512 686C512 ${686 - h * 0.5} 520 ${686 - h * 0.8} 520 ${686 - h}C520 ${686 - h * 0.8} 528 ${686 - h * 0.5} 528 686Z`);
        },
      };
    },
  };

  SH.bt_jupiter = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1000, fy: 470, k: 1.1, ty: 640 });
      const st = BTL.stars(g, 200, 905, [0, 0, W, 1080]);
      const jx = 700, jy = 440, R = 250, id = 'btjup' + (++uid);
      // Jupiter's shadow cone runs away from the Sun (light from the left)
      P0(g, `M${jx} ${jy - R}L1920 ${jy - R + 40}L1920 ${jy + R - 40}L${jx} ${jy + R}Z`, C.paperDark, 0.9);
      L0(g, `M${jx} ${jy - R}L1920 ${jy - R + 40}M${jx} ${jy + R}L1920 ${jy + R - 40}`, C.inkSoft, 1.5, 0.35);
      BTL.glow(svg, defs, jx - 60, jy, R * 1.6, C.stain, 0.2, g);
      P0(g, circ(jx, jy, R), C.paperLight, 1);
      const cp = el(g, 'clipPath', { id }); el(cp, 'path', { d: circ(jx, jy, R) });
      const bands = el(g, 'g', { 'clip-path': `url(#${id})` });
      for (const [y, h, a] of [[-150, 26, 0.5], [-80, 40, 0.75], [-12, 22, 0.45], [52, 44, 0.75], [128, 24, 0.45], [190, 20, 0.35]])
        P0(bands, `M${jx - R} ${jy + y}C${jx - 100} ${jy + y - 10} ${jx + 100} ${jy + y + 10} ${jx + R} ${jy + y}L${jx + R} ${jy + y + h}C${jx + 100} ${jy + y + h + 10} ${jx - 100} ${jy + y + h - 10} ${jx - R} ${jy + y + h}Z`, C.inkSoft, a * 0.6);
      P0(bands, BTL.E(jx + 80, jy + 78, 46, 22), C.red, 0.55);     // the great red spot
      P0(bands, `M${jx + 60} ${jy - R - 10}A${R} ${R} 0 0 1 ${jx + 60} ${jy + R + 10}L${jx + R + 20} ${jy + R + 10}L${jx + R + 20} ${jy - R - 10}Z`, C.paperDark, 0.6);  // night side
      L0(g, circ(jx, jy, R), C.ink, 3.5);
      // Io on a slow path from the sunlit right side into the shadow
      const io = el(g, 'g'), ioG = BTL.glow(svg, defs, 0, 0, 70, C.stain, 0.3, io); ioG.e.setAttribute('cx', 0); ioG.e.setAttribute('cy', 0);
      const ioD = P0(io, circ(0, 0, 20), C.ink, 1);
      const ioL = halo(lab(io, 'Io', 0, -46, 44));
      const L = P.label ? halo(txt(g, P.label, 1640, 820, 56)) : null, S = P.sub ? halo(lab(g, P.sub, 1640, 880, 42)) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt);
          // Io climbs across the shadow (x 1250): enters at the lower edge at 'hide', leaves at the top at 'out' (late)
          const th = cue(cues, 'hide', dur * 0.4), to = P.late ? cue(cues, 'out', dur * 0.82) : 1e9;
          const yIn = jy + R - 20, yOut = jy - R + 20, v0 = 150 / Math.max(1, th), v1 = P.late ? (yIn - yOut) / Math.max(1, to - th) : 45;
          const y = lt < th ? yIn + (th - lt) * v0 : lt < to ? yIn - (lt - th) * v1 : yOut - (lt - to) * 12, x = 1250 + (y - jy) * 0.12;
          io.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          const dark = clamp01((lt - th) / 0.9) * (1 - clamp01((lt - to) / 0.9));
          ioD.setAttribute('fill-opacity', (1 - 0.88 * dark).toFixed(3)); ioG.set(0.3 * (1 - dark));
          ioL.setAttribute('opacity', (BTL.ease(lt, 0.3, 1) * (1 - 0.6 * dark)).toFixed(3));
          fade(L, BTL.ease(lt, 0.8, 1.2)); fade(S, BTL.ease(lt, 1.3, 1.2));
        },
      };
    },
  };

  SH.bt_orbit = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1100, fy: 450, k: 0.85, ty: 640 });
      const st = BTL.stars(g, 160, 1644, [0, 0, W, 1080]);
      const sx = 620, sy = 450, R = 250, jx = 1640, jy = 450;
      const so = sun(g, svg, defs, sx, sy, 40);
      L0(g, circ(sx, sy, R), C.inkSoft, 2, 0.8, { 'stroke-dasharray': '2 12' });
      L0(g, `M${jx - 40} ${jy - 330}C${jx - 70} ${jy - 110} ${jx - 70} ${jy + 110} ${jx - 40} ${jy + 330}`, C.inkSoft, 2, 0.5, { 'stroke-dasharray': '2 12' });  // a bit of Jupiter's orbit
      BTL.glow(svg, defs, jx, jy, 90, C.stain, 0.35, g);
      P0(g, circ(jx, jy, 30), C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      L0(g, `M${jx - 30} ${jy - 8}L${jx + 30} ${jy - 8}M${jx - 28} ${jy + 10}L${jx + 28} ${jy + 10}`, C.inkSoft, 2.5);
      const tJ = halo(lab(g, 'Jüpiter', jx, jy + 90, 44)), tS = halo(lab(g, 'Güneş', sx, sy + 96, 44));
      const ray = L0(g, '', C.ink, 2, 0.55, { 'stroke-dasharray': '10 10' });
      const gap = L0(g, '', C.gold, 7, 0.95);
      const eg = el(g, 'g'); earth(eg, 0, 0, 22, 'btorb' + (++uid));
      const tE = halo(lab(g, 'Dünya', 0, 0, 44));
      const tG = P.gold ? halo(txt(g, P.gold, sx, sy - R - 50, 60, { color: C.gold })) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt); so.update(lt);
          const tf = cue(cues, 'far', 0.6), tg = cue(cues, 'gap', dur * 0.62);
          const a = Math.PI * BTL.ease(lt, tf, Math.max(2.5, tg - tf - 0.2)); // 0: near Jupiter, PI: far side
          const ex = sx + Math.cos(a) * R, ey = sy - Math.sin(a) * R;
          eg.setAttribute('transform', `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`);
          tE.setAttribute('x', ex.toFixed(1)); tE.setAttribute('y', (ey + (a < 1.6 ? 72 : -44)).toFixed(1));
          ray.setAttribute('d', `M${jx - 32} ${jy}L${(ex + 24).toFixed(1)} ${ey.toFixed(1)}`);
          // the extra stretch of the light path once Earth is on the far side
          const q = P.gold ? BTL.ease(lt, tg, 1.6) : 0;
          gap.setAttribute('d', `M${sx + R + 26} ${sy + 10}L${(sx + R + 26 - (2 * R + 26) * q).toFixed(1)} ${sy + 10}`);
          gap.setAttribute('stroke-opacity', (0.95 * Math.min(1, q * 4)).toFixed(3));
          fade(tJ, BTL.ease(lt, 0.2, 1)); fade(tS, BTL.ease(lt, 0.2, 1)); fade(tE, BTL.ease(lt, 0.4, 1));
          fade(tG, BTL.ease(lt, tg + 0.8, 1.2));
        },
      };
    },
  };

  SH.bt_lighttime = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      const st = BTL.stars(g, 180, 820, [0, 0, W, 1080]);
      const ax = 300, bx = 1620, y = 470;
      let src;
      if (P.from === 'star') {
        const sg = BTL.glow(svg, defs, ax, y, 160, C.stain, 0.45, g);
        P0(g, `M${ax} ${y - 46}L${ax + 9} ${y - 9}L${ax + 46} ${y}L${ax + 9} ${y + 9}L${ax} ${y + 46}L${ax - 9} ${y + 9}L${ax - 46} ${y}L${ax - 9} ${y - 9}Z`, C.ink, 0.95);
        src = { update(lt) { sg.set(0.4 + 0.06 * Math.sin(lt * 0.8)); } };
      } else src = sun(g, svg, defs, ax, y, 110);
      earth(g, bx, y, 46, 'btlt' + (++uid));
      L0(g, `M${ax + (P.from === 'star' ? 60 : 130)} ${y}L${bx - 60} ${y}`, C.inkSoft, 2, 0.45, { 'stroke-dasharray': '3 14' });
      const pu = pulse(g, svg, defs, 18);
      const trail = L0(g, '', C.gold, 3, 0.7);
      const num = txt(g, '', 960, 300, 120, { weight: 300, opacity: 0 });
      const la = P.label ? lab(g, P.label, 960, 650, 52, { color: C.ink }) : null;
      const sb = P.sub ? lab(g, P.sub, 960, 714, 42) : null;
      const to = P.to ?? 500, fmt = P.fmt || 'mmss';
      const show = v => fmt === 'mmss' ? `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(Math.floor(v % 60)).padStart(2, '0')}`
        : `${v.toFixed(1).replace('.', ',')}${P.unit ? ' ' + P.unit : ''}`;
      return {
        update(lt, dur, cues) {
          st.update(lt); src.update(lt);
          const t0 = cue(cues, 'go', 0.5), T = Math.max(2.5, Math.min(dur - t0 - 1.4, 8)), p = clamp01((lt - t0) / T);
          const x0 = ax + (P.from === 'star' ? 60 : 130), x = lerp(x0, bx - 56, p);
          pu.set(x, y, p < 1 ? BTL.ease(lt, t0 - 0.3, 0.6) : Math.max(0, 1 - (lt - t0 - T) / 0.8));
          trail.setAttribute('d', `M${x0} ${y}L${x.toFixed(1)} ${y}`);
          num.textContent = show(to * p); fade(num, BTL.ease(lt, t0 - 0.4, 0.8));
          num.setAttribute('fill', p >= 1 ? C.gold : C.ink);
          fade(la, BTL.ease(lt, 0.6, 1.2)); fade(sb, BTL.ease(lt, 1.2, 1.2));
        },
      };
    },
  };

  SH.bt_sky = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 300, 4242, [0, 0, W, 760]);
      const an = P.andromeda ? andromeda(g, svg, defs, P.andromeda[0], P.andromeda[1], 0.5) : null;
      P0(g, 'M0 780C300 740 520 700 820 716C1120 732 1380 690 1920 730L1920 1800L0 1800Z', C.paperDark, 1);
      L0(g, 'M0 780C300 740 520 700 820 716C1120 732 1380 690 1920 730', C.inkSoft, 2.5, 0.6);
      const S = (P.stars || []).map((s, i) => {
        const sg = el(g, 'g', { opacity: 0 });
        const ring = el(sg, 'circle', { cx: s.x, cy: s.y, r: 26, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        P0(g, circ(s.x, s.y, 6), C.ink, 1);
        const right = s.x < 1500, ox = s.dx ?? 44, t = halo(lab(sg, s.label, s.x + (right ? ox : -ox), s.y + 14, 44, { anchor: right ? 'start' : 'end', color: C.ink, opacity: 1 }));
        return { s, sg, ring, t, i };
      });
      return {
        update(lt, dur, cues) {
          st.update(lt); if (an) an.update(lt);
          S.forEach(q => {
            const at = cue(cues, q.s.at, 0.8 + q.i * Math.max(1, (dur - 2) / Math.max(1, S.length)));
            fade(q.sg, BTL.ease(lt, at - 0.2, 1));
            q.ring.setAttribute('r', (24 + 4 * Math.sin(lt * 0.8 + q.i)).toFixed(1));
          });
        },
      };
    },
  };

  SH.bt_clocks = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      const st = BTL.stars(g, 200, 1687, [0, 0, W, 1080]);
      const n = P.n || 5, y = 430, x0 = 260, x1 = 1660;
      const line = L0(g, `M${x0 - 120} ${y}L${x1 + 120} ${y}`, C.gold, 2, 0.6, { pathLength: 1 });
      const W_ = [];
      for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)), r = i === Math.floor(n / 2) ? 120 : 92; W_.push({ w: watch(g, x, y, r), x, k: (i - (n - 1) / 2) }); }
      const la = P.label ? lab(g, P.label, 960, 700, 56, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt);
          draw(line, BTL.ease(lt, 0.2, 2));
          const td = P.mode === 'drift' ? cue(cues, 'drift', dur * 0.4) : 1e9;
          const sp = BTL.ease(lt, td, 3);
          W_.forEach(q => {
            const off = sp * q.k * 0.55, sec = lt * 6 + off * 60 * 4;
            q.w.set(10.1 + lt / 120 + off, ((sec % 60) + 60) % 60);
            q.w.g.setAttribute('opacity', BTL.ease(lt, 0.1 + Math.abs(q.k) * 0.25, 1).toFixed(3));
          });
          fade(la, BTL.ease(lt, 1, 1.2));
        },
      };
    },
  };

  SH.bt_desk = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900 });
      // the room: back wall, an arched window with the old clock tower outside at dusk
      P0(g, 'M0 0L1920 0L1920 1800L0 1800Z', C.paperDark, 0.5);
      const wx = 1180, wy = 120, ww = 460, wh = 560;
      const win = `M${wx} ${wy + wh}L${wx} ${wy + 160}C${wx} ${wy - 40} ${wx + ww} ${wy - 40} ${wx + ww} ${wy + 160}L${wx + ww} ${wy + wh}Z`;
      P0(g, win, C.paper, 1);
      const id = 'btdesk' + (++uid), cp = el(g, 'clipPath', { id }); el(cp, 'path', { d: win });
      const out = el(g, 'g', { 'clip-path': `url(#${id})` });
      const st = BTL.stars(out, 50, 1905, [wx, wy, wx + ww, wy + 300]);
      P0(out, `M${wx} ${wy + 470}L${wx + 60} ${wy + 430}L${wx + 120} ${wy + 450}L${wx + 160} ${wy + 400}L${wx + 300} ${wy + 410}L${wx + 360} ${wy + 380}L${wx + ww} ${wy + 420}L${wx + ww} ${wy + wh}L${wx} ${wy + wh}Z`, C.paperDark, 1);
      // the tower: body, a clock face, a pointed roof
      const tx = wx + 230;
      P0(out, `M${tx - 70} ${wy + wh}L${tx - 70} ${wy + 200}L${tx + 70} ${wy + 200}L${tx + 70} ${wy + wh}Z`, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      P0(out, `M${tx - 84} ${wy + 200}L${tx} ${wy + 60}L${tx + 84} ${wy + 200}Z`, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      const tw = watch(out, tx, wy + 270, 44, { crown: false, color: C.gold });
      L0(g, win, C.inkSoft, 6);
      L0(g, `M${wx + ww / 2} ${wy + 40}L${wx + ww / 2} ${wy + wh}M${wx} ${wy + 330}L${wx + ww} ${wy + 330}`, C.inkSoft, 5);
      // desk, papers, a lamp
      const lamp = BTL.glow(svg, defs, 760, 560, 520, C.stain, 0.34, g);
      P0(g, 'M220 690L1500 690L1500 730L220 730Z', C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
      P0(g, 'M260 730L300 730L300 1800L260 1800ZM1420 730L1460 730L1460 1800L1420 1800Z', C.paperLight, 0.9);
      L0(g, 'M260 730L260 1080M300 730L300 1080M1420 730L1420 1080M1460 730L1460 1080', C.inkSoft, 2);
      const D = BTL.drawing(g);
      D.f('M760 690L940 690L960 676L780 676Z', C.paperLight, 1); D.s('M760 690L940 690L960 676L780 676Z', { w: 2.5 });
      D.f('M990 690L1150 690L1140 668L980 668Z', C.paperLight, 1); D.s('M990 690L1150 690L1140 668L980 668ZM996 680L1140 680', { w: 2.5 });
      D.s('M800 682L930 682M806 686L900 686', { w: 2, color: C.inkSoft });
      D.s('M560 690L640 690M600 690L600 560L660 500', { w: 5 });
      D.f('M630 470L720 470L700 520L650 520Z', C.paperLight, 1); D.s('M630 470L720 470L700 520L650 520Z', { w: 3 });
      D.f('M655 520L695 520L688 530L662 530Z', C.gold, 0.9);
      BTL.person(g, 'sit', 500, 860, 330, { face: 1 });
      P0(g, 'M420 860L620 860L620 740L600 740L600 840L440 840L440 600L420 600Z', C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      return {
        update(lt) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 2));
          lamp.set(0.32 + 0.03 * Math.sin(lt * 0.8));
          tw.set(7 + 55 / 60 + lt / 360, lt);
        },
      };
    },
  };

  SH.bt_train = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const stars = BTL.stars(g, 120, 1917, [0, 0, W, 300]);
      // a raised railway embankment across the frame, the observer stands on the ground in front of it
      const ry = 470;                                         // rail level
      P0(g, `M0 ${ry}L1920 ${ry}L1920 1800L0 1800Z`, C.paperDark, 1);
      P0(g, `M0 ${ry}L1920 ${ry}L1920 ${ry + 60}L0 ${ry + 60}Z`, C.paperLight, 0.55);
      L0(g, `M0 ${ry}L1920 ${ry}M0 ${ry + 60}L1920 ${ry + 60}`, C.inkSoft, 2.5);
      let sl = ''; for (let x = 20; x < 1920; x += 48) sl += `M${x} ${ry + 4}L${x - 6} ${ry + 56}`;
      L0(g, sl, C.inkSoft, 2, 0.35);
      P0(g, `M0 ${ry + 60}L1920 ${ry + 60}L1920 1800L0 1800Z`, C.paperLight, 0.6);
      P0(g, `M0 830L1920 830L1920 1800L0 1800Z`, C.paperLight, 0.5);
      L0(g, 'M0 830L1920 830', C.inkSoft, 2, 0.5);
      const L = 1300, v = 70, c = 300, xm = 960, half = L / 2, top = ry - 190;
      const tr = el(g, 'g');
      P0(tr, `M${-half} ${top}L${half - 50} ${top}C${half} ${top} ${half} ${top + 40} ${half} ${top + 60}L${half} ${ry - 16}L${-half} ${ry - 16}Z`, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      L0(tr, `M${-half} ${ry - 50}L${half} ${ry - 50}`, C.inkSoft, 2);
      let wins = ''; for (let x = -half + 36; x < half - 90; x += 104) wins += `M${x} ${top + 26}h70v86h-70Z`;
      P0(tr, wins, C.paper, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      for (let x = -half + 130; x < half; x += 320) for (const d of [-34, 34]) P0(tr, circ(x + d, ry - 10, 18), C.paperDark, 1, { stroke: C.ink, 'stroke-width': 2.5 });
      // passenger standing in the middle window
      const pas = el(tr, 'g'); BTL.person(pas, 'stand', 0, top + 114, 100, { face: 1, color: C.paperDark, rim: C.ink });
      const pasG = BTL.glow(svg, defs, 0, top + 70, 130, C.gold, 0, tr);
      // the observer on the ground, exactly below the midpoint between the two strikes
      const oy = 820, oh = 230;
      const obs = BTL.person(g, 'stand', xm, oy, oh, { face: 1 });
      const obsG = BTL.glow(svg, defs, xm, oy - oh * 0.85, 170, C.gold, 0, g);
      const boltD = x => `M${x + 40} -20L${x - 10} 90L${x + 30} 110L${x - 26} 200L${x + 8} 216L${x} ${top}`;
      const bolts = [-1, 1].map(sg => L0(g, boltD(xm + sg * half), C.gold, 6, 0));
      const bglow = [-1, 1].map(sg => BTL.glow(svg, defs, xm + sg * half, top, 260, C.gold, 0, g));
      const marks = [-1, 1].map(sg => P0(g, BTL.E(xm + sg * half, ry + 6, 22, 6), C.gold, 0));
      const fronts = [-1, 1].map(() => L0(g, '', C.gold, 3, 0));
      const focus = P.mode === 'train' ? 'train' : 'platform';
      if (focus === 'train') obs.setAttribute('opacity', 0.5);
      const sy = top + 60, dObs = Math.hypot(half, (oy - oh * 0.85) - sy);
      return {
        update(lt, dur, cues) {
          stars.update(lt);
          const ts = cue(cues, 'strike', Math.min(1.6, dur * 0.25)), dt = lt - ts;
          tr.setAttribute('transform', `translate(${(xm + v * dt).toFixed(1)} 0)`);
          const fl = dt < 0 ? 0 : Math.exp(-dt * 2.2);
          bolts.forEach(b => b.setAttribute('stroke-opacity', fl.toFixed(3)));
          bglow.forEach(b => b.set(0.55 * fl));
          marks.forEach(m => m.setAttribute('fill-opacity', dt < 0 ? 0 : 0.85));
          fronts.forEach((f, i) => {
            const sg = i ? 1 : -1, r = Math.max(0, dt * c), x0 = xm + sg * half;
            f.setAttribute('d', dt > 0 ? `M${(x0 - r).toFixed(1)} ${sy}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 -${(2 * r).toFixed(1)} 0` : '');
            f.setAttribute('stroke-opacity', dt > 0 ? (0.8 * Math.max(0, 1 - r / 1600)).toFixed(3) : 0);
          });
          // arrivals: the observer gets both fronts together; the passenger meets the front one first
          const hit = t0 => dt > t0 ? Math.exp(-(dt - t0) * 1.2) : 0;
          if (focus === 'platform') obsG.set(0.65 * hit(dObs / c));
          else pasG.set(0.65 * Math.max(hit(half / (c + v)), 0.5 * hit(half / (c - v))));
        },
      };
    },
  };

  SH.bt_slices = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      const ax = 420, bx = 1560, oy = 470;
      // world lines (vertical: time runs up)
      L0(g, `M${ax} 860L${ax} 90`, C.ink, 3);
      L0(g, `M${bx} 860L${bx} 90`, C.inkSoft, 3);
      L0(g, `M${ax - 16} 110L${ax} 86L${ax + 16} 110`, C.ink, 3);
      const ta = halo(lab(g, P.a || 'Dünya', ax, 912, 46, { color: C.ink })), tb = halo(lab(g, P.b || 'Andromeda', bx, 912, 46, { color: C.ink }));
      const tz = halo(lab(g, 'zaman', ax - 40, 140, 42, { anchor: 'end' }));
      P0(g, circ(ax, oy, 12), C.gold, 1);
      const nowA = L0(g, '', C.ink, 3, 0.9), nowB = L0(g, '', C.gold, 3.5, 0.95);
      const pA = P0(g, '', C.ink, 1), pB = P0(g, '', C.gold, 1);
      const br = L0(g, '', C.gold, 3, 0.9);
      const tg = halo(txt(g, P.gap || 'günler', bx + 50, oy - 70, 60, { color: C.gold, anchor: 'start' }));
      const tn = halo(lab(g, '“şimdi”', 960, oy - 22, 46, { color: C.ink }));
      return {
        update(lt, dur, cues) {
          fade(ta, BTL.ease(lt, 0.2, 1)); fade(tb, BTL.ease(lt, 0.4, 1)); fade(tz, BTL.ease(lt, 0.6, 1));
          const a0 = BTL.ease(lt, 0.3, 1.6);
          nowA.setAttribute('d', `M${ax} ${oy}L${(ax + (bx + 80 - ax) * a0).toFixed(1)} ${oy}`);
          pA.setAttribute('d', a0 > 0.95 ? circ(bx, oy, 10) : '');
          fade(tn, BTL.ease(lt, 1, 1.2));
          const tt = cue(cues, 'tilt', dur * 0.45), q = BTL.ease(lt, tt, 2.4), ang = -0.17 * q;    // tilted "now" of a moving observer
          const yB = oy + Math.tan(ang) * (bx - ax);
          nowB.setAttribute('d', q > 0.001 ? `M${ax} ${oy}L${(bx + 80).toFixed(1)} ${(oy + Math.tan(ang) * (bx + 80 - ax)).toFixed(1)}` : '');
          nowB.setAttribute('stroke-opacity', (0.95 * Math.min(1, q * 5)).toFixed(3));
          pB.setAttribute('d', q > 0.05 ? circ(bx, yB, 10) : '');
          br.setAttribute('d', q > 0.3 ? `M${bx + 26} ${oy}L${bx + 34} ${oy}L${bx + 34} ${yB.toFixed(1)}L${bx + 26} ${yB.toFixed(1)}` : '');
          fade(tg, BTL.ease(lt, tt + 1.8, 1.2));
          tg.setAttribute('y', ((oy + yB) / 2 + 20).toFixed(1));
        },
      };
    },
  };

  SH.bt_plane = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 200, 1971, [0, 0, W, 520]);
      const mo = BTL.glow(svg, defs, 1560, 170, 200, C.stain, 0.25, g); P0(g, circ(1560, 170, 40), C.ink, 0.9);
      // cloud bank below
      const cl = el(g, 'g');
      for (const [y, a, s] of [[700, 0.5, 0], [780, 0.75, 1], [860, 0.95, 2]]) {
        let d = `M-200 ${y + 60}`; for (let x = -200; x < 2300; x += 160) d += `C${x + 30} ${y - 30 - (s * 13 + x) % 40} ${x + 130} ${y - 30 - (s * 29 + x) % 50} ${x + 160} ${y + 10}`;
        d += 'L2300 1800L-200 1800Z';
        P0(cl, d, s === 2 ? C.paperLight : C.paper, a, { stroke: C.inkSoft, 'stroke-width': 1.5, 'stroke-opacity': 0.4 });
      }
      // the airliner, side view, gliding slowly left to right
      const pl = el(g, 'g');
      const body = 'M-330 0C-330-26-300-40-260-40L250-40C300-40 340-20 360 0C340 16 300 26 250 26L-260 26C-300 26-330 16-330 0Z';
      P0(pl, body, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      P0(pl, 'M-300-40L-350-130L-310-130L-230-40Z', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      P0(pl, 'M-40 10L-140 110L-90 110L60 10Z', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      P0(pl, 'M-20 -10L-120 -60L-80 -60L40 -10Z', C.paperDark, 0.8, { stroke: C.inkSoft, 'stroke-width': 2 });
      let w = ''; for (let x = -220; x < 230; x += 34) w += `M${x} -22h14v14h-14Z`;
      P0(pl, w, C.gold, 0.8);
      const navG = BTL.glow(svg, defs, -340, -120, 50, C.red, 0, pl); navG.e.setAttribute('cx', -330); navG.e.setAttribute('cy', -128);
      let tk = null, tN = null, tS = null;
      if (P.ticket) {   // a boarding pass in the foreground right
        tk = el(g, 'g', { opacity: 0 });
        const k0 = 'M1280 300L1800 300L1800 620L1280 620Z';
        P0(tk, k0, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
        L0(tk, 'M1660 300L1660 620', C.inkSoft, 2.5, 0.8, { 'stroke-dasharray': '6 10' });
        tN = txt(tk, P.name || 'MR. CLOCK', 1470, 450, 58, { weight: 600, opacity: 1 });
        tS = lab(tk, P.sub || 'Bay Saat', 1470, 520, 44, { opacity: 1 });
        const sw = watch(tk, 1730, 460, 44, {}); sw.set(10.2, 0);
        tk.setAttribute('transform', 'rotate(-6 1540 460)');
      }
      return {
        update(lt, dur, cues) {
          st.update(lt); mo.set(0.22 + 0.04 * Math.sin(lt * 0.6));
          const x = (P.ticket ? 480 : 560) + lt * 26;
          pl.setAttribute('transform', `translate(${x.toFixed(1)} ${(P.ticket ? 420 : 400) + 4 * Math.sin(lt * 0.5)}) scale(${P.ticket ? 0.9 : 1.35})`);
          navG.set(lt % 2.4 < 0.5 ? 0.6 : 0);
          cl.setAttribute('transform', `translate(${(-lt * 10).toFixed(1)} 0)`);
          if (tk) tk.setAttribute('opacity', BTL.ease(lt, cue(cues, 'show', 1.2), 1.2).toFixed(3));
        },
      };
    },
  };

  SH.bt_globe = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      const st = BTL.stars(g, 160, 1971, [0, 0, W, 1080]);
      const cx = 960, cy = 450, R = 300;
      BTL.glow(svg, defs, cx, cy, R * 1.6, C.stain, 0.18, g);
      earth(g, cx, cy, R, 'btglobe' + (++uid), { land: 0.28 });
      let grid = ''; for (const la of [-60, -30, 0, 30, 60]) { const y = cy - Math.sin(la * Math.PI / 180) * R, rx = Math.cos(la * Math.PI / 180) * R; grid += `M${cx - rx} ${y}A${rx} ${rx * 0.16} 0 0 0 ${cx + rx} ${y}`; }
      for (const lo of [-60, -30, 0, 30, 60]) { const rx = Math.sin(lo * Math.PI / 180) * R; grid += `M${cx} ${cy - R}A${Math.abs(rx)} ${R} 0 0 ${rx > 0 ? 1 : 0} ${cx} ${cy + R}`; }
      L0(g, grid, C.inkSoft, 1.5, 0.45);
      // routes: ellipses around the globe at ~35 deg N; east = front arc left->right, west = slightly lower, right->left
      const yE = cy - 150, rxE = R * 1.25, ryE = 70, yW = cy - 90, rxW = R * 1.32, ryW = 80;
      const backE = L0(g, `M${cx + rxE} ${yE}A${rxE} ${ryE} 0 0 0 ${cx - rxE} ${yE}`, C.gold, 2, 0, { 'stroke-dasharray': '6 10' });
      const frontE = L0(g, `M${cx - rxE} ${yE}A${rxE} ${ryE} 0 0 0 ${cx + rxE} ${yE}`, C.gold, 4, 1, { pathLength: 1 });
      const backW = L0(g, `M${cx - rxW} ${yW}A${rxW} ${ryW} 0 0 1 ${cx + rxW} ${yW}`, C.blue, 2, 0, { 'stroke-dasharray': '6 10' });
      const frontW = L0(g, `M${cx + rxW} ${yW}A${rxW} ${ryW} 0 0 1 ${cx - rxW} ${yW}`, C.blue, 4, 1, { pathLength: 1 });
      const tE = halo(txt(g, P.east || 'doğuya', cx + rxE + 30, yE + 10, 50, { anchor: 'start', color: C.gold }));
      const tW = halo(txt(g, P.west || 'batıya', cx - rxW - 30, yW + 30, 50, { anchor: 'end', color: C.blue }));
      const dot = P0(g, '', C.ink, 1);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const te = cue(cues, 'east', 0.6), tw = cue(cues, 'west', dur * 0.5);
          const pe = BTL.ease(lt, te, 2.4), pw = BTL.ease(lt, tw, 2.4);
          draw(frontE, pe); backE.setAttribute('stroke-opacity', (0.5 * pe).toFixed(3));
          draw(frontW, pw); backW.setAttribute('stroke-opacity', (0.5 * pw).toFixed(3));
          fade(tE, BTL.ease(lt, te + 1.2, 1)); fade(tW, BTL.ease(lt, tw + 1.2, 1));
          // a small plane dot travelling the current route
          const onW = lt > tw, p = onW ? pw : pe, a = Math.PI * (1 - p);
          const x = onW ? cx + Math.cos(Math.PI - a) * rxW : cx + Math.cos(a) * rxE, y = onW ? yW + Math.sin(Math.PI - a) * ryW : yE + Math.sin(a) * ryE;
          dot.setAttribute('d', p > 0.02 && p < 0.99 ? circ(x, y, 9) : '');
        },
      };
    },
  };

  SH.bt_twoclocks = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      BTL.glow(svg, defs, 960, 430, 700, C.stain, 0.1, g);
      const side = (s, o, x) => {
        // an atomic clock cabinet: box, a display, a few knobs
        const b = el(g, 'g');
        P0(b, `M${x - 280} 230L${x + 280} 230L${x + 280} 640L${x - 280} 640Z`, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
        P0(b, `M${x - 230} 290L${x + 230} 290L${x + 230} 450L${x - 230} 450Z`, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
        for (const k of [-160, -80, 0, 80, 160]) P0(b, circ(x + k, 560, 16), C.paper, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
        const n = txt(g, '0', x, 404, 96, { weight: 300, color: s ? C.gold : C.ink });
        const u = lab(g, o.unit || 'nanosaniye', x, 720, 48, { color: C.ink });
        const l = txt(g, o.label || '', x, 190, 56, { weight: 400 });
        return { n, u, l, v: o.value || 0 };
      };
      const A = side(0, P.left || {}, 560), B = side(1, P.right || {}, 1360);
      return {
        update(lt, dur, cues) {
          const t0 = cue(cues, 'run', 1.2);
          for (const [S, d] of [[A, 0], [B, 0.8]]) {
            const p = BTL.ease(lt, t0 + d, 2.6), v = Math.round(S.v * p);
            S.n.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
            fade(S.n, BTL.ease(lt, 0.4, 0.8)); fade(S.u, BTL.ease(lt, 0.8, 1)); fade(S.l, BTL.ease(lt, 0.2, 1));
          }
        },
      };
    },
  };

  SH.bt_gps = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      if (P.mode === 'drift') {
        // a street grid seen from above; the true spot stays, the computed dot slides away
        P0(g, 'M0 0L1920 0L1920 1800L0 1800Z', C.paperDark, 0.6);
        let st = ''; for (let x = -40; x < 2000; x += 160) st += `M${x} 0L${x + 60} 1080`; for (let y = 40; y < 1080; y += 140) st += `M0 ${y}L1920 ${y - 40}`;
        L0(g, st, C.inkSoft, 5, 0.22);
        L0(g, 'M0 820C500 700 900 760 1300 560C1600 420 1800 380 1920 360', C.blue, 18, 0.25);   // a river
        const tx = 620, ty = 470;
        const ring = L0(g, '', C.ink, 3, 0.9);
        P0(g, circ(tx, ty, 14), C.ink, 1);
        const pin = el(g, 'g'), pg = BTL.glow(svg, defs, 0, 0, 90, C.gold, 0.5, pin); pg.e.setAttribute('cx', 0); pg.e.setAttribute('cy', 0);
        P0(pin, 'M0 0C-30-40-40-60-40-80C-40-104-22-120 0-120C22-120 40-104 40-80C40-60 30-40 0 0Z', C.gold, 1, { stroke: C.ink, 'stroke-width': 3 });
        P0(pin, circ(0, -80, 14), C.paperDark, 1);
        const path = L0(g, '', C.gold, 3, 0.8, { 'stroke-dasharray': '4 12' });
        const la = P.label ? halo(txt(g, P.label, 1240, 260, 76, { color: C.gold })) : null;
        const sb = P.sub ? halo(lab(g, P.sub, 1240, 330, 46, { color: C.ink })) : null;
        return {
          update(lt, dur, cues) {
            const td = cue(cues, 'drift', 0.8), p = BTL.ease(lt, td, Math.max(3, dur - td - 0.6));
            const x = tx + 760 * p, y = ty - 120 * p;
            pin.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
            path.setAttribute('d', p > 0.01 ? `M${tx} ${ty}L${x.toFixed(1)} ${y.toFixed(1)}` : '');
            const ph = (lt % 2.6) / 2.6; ring.setAttribute('d', circ(tx, ty, 20 + 30 * ph)); ring.setAttribute('stroke-opacity', (0.8 * (1 - ph)).toFixed(3));
            fade(la, BTL.ease(lt, td + 1.2, 1.2)); fade(sb, BTL.ease(lt, td + 1.8, 1.2));
          },
        };
      }
      const st = BTL.stars(g, 220, 2020, [0, 0, W, 1080]);
      const ex = 640, ey = 460, R = 200, ox = 440, oy = 160;
      BTL.glow(svg, defs, ex, ey, R * 1.7, C.stain, 0.2, g);
      const back = L0(g, `M${ex + ox} ${ey}A${ox} ${oy} 0 0 0 ${ex - ox} ${ey}`, C.inkSoft, 2, 0.6, { 'stroke-dasharray': '3 12', transform: `rotate(-14 ${ex} ${ey})` });
      earth(g, ex, ey, R, 'btgps' + (++uid), { land: 0.32 });
      L0(g, `M${ex - ox} ${ey}A${ox} ${oy} 0 0 0 ${ex + ox} ${ey}`, C.inkSoft, 2.5, 0.8, { 'stroke-dasharray': '3 12', transform: `rotate(-14 ${ex} ${ey})` });
      const sat = el(g, 'g');
      P0(sat, 'M-22-18L22-18L22 18L-22 18Z', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      P0(sat, 'M-92-12L-30-12L-30 12L-92 12ZM30-12L92-12L92 12L30 12Z', C.blue, 0.6, { stroke: C.ink, 'stroke-width': 2.5 });
      L0(sat, 'M-30 0L-22 0M22 0L30 0M-72-12L-72 12M-51-12L-51 12M51-12L51 12M72-12L72 12', C.ink, 2);
      const sg = BTL.glow(svg, defs, 0, 0, 80, C.gold, 0.35, sat); sg.e.setAttribute('cx', 0); sg.e.setAttribute('cy', 0);
      const la = P.label ? txt(g, P.label, 1450, 440, 84, { color: C.gold, weight: 300 }) : null;
      const sb = P.sub ? lab(g, P.sub, 1450, 506, 46, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt); void back;
          const a = 2.2 + lt * 0.11, rot = -14 * Math.PI / 180;
          const px = Math.cos(a) * ox, py = Math.sin(a) * oy, x = ex + px * Math.cos(rot) - py * Math.sin(rot), y = ey + px * Math.sin(rot) + py * Math.cos(rot);
          sat.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-14)`);
          // behind the planet on the far half of the orbit
          const behind = Math.sin(a) < 0 && Math.abs(px) < R * 1.05;
          sat.setAttribute('opacity', behind ? '0' : '1');
          sg.set(0.3 + 0.08 * Math.sin(lt * 1.1));
          const t0 = cue(cues, 'tick', 1);
          fade(la, BTL.ease(lt, t0, 1.2)); fade(sb, BTL.ease(lt, t0 + 0.6, 1.2));
        },
      };
    },
  };

  SH.bt_cosmic = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 470, k: 0.85, ty: 640 });
      const st = BTL.stars(g, 140, 13800, [0, 0, W, 1080]);
      const cx = 960, cy = 400, field = el(g, 'g'), r = rng(138), items = [];
      for (let i = -3; i <= 3; i++) for (let j = -2; j <= 1; j++) {
        const x = i * 270 + (r() - 0.5) * 60, y = (j + 0.5) * 150 + (r() - 0.5) * 30;
        const q = el(field, 'g');
        BTL.glow(svg, defs, 0, 0, 46, C.stain, 0.25, q);
        P0(q, BTL.E(0, 0, 36, 11), C.ink, 0.3, { transform: `rotate(${(-40 + r() * 80).toFixed(0)})` });
        P0(q, circ(0, 0, 4.5), C.ink, 0.9);
        const w = watch(q, 58, 0, 20, { crown: false }); w.set(4, 0);
        items.push({ q, x, y });
      }
      const la = P.label ? halo(txt(g, P.label, cx, 800, 84, { color: C.gold, weight: 300 })) : null;
      const sb = P.sub ? halo(lab(g, P.sub, cx, 866, 44, { color: C.ink })) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const k = 0.9 + 0.12 * clamp01(lt / Math.max(dur, 6));   // the grid slowly spreads out
          items.forEach(it => it.q.setAttribute('transform', `translate(${(cx + it.x * k).toFixed(1)} ${(cy - 40 + it.y * k).toFixed(1)})`));
          field.setAttribute('opacity', BTL.ease(lt, 0, 1.6).toFixed(3));
          const t0 = cue(cues, 'show', 1.4);
          fade(la, BTL.ease(lt, t0, 1.2)); fade(sb, BTL.ease(lt, t0 + 0.6, 1.2));
        },
      };
    },
  };

  SH.bt_alone = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1000 });
      const sky = el(g, 'g');
      // the Milky Way: a broad soft band of light across the sky, dense with faint stars
      const band = el(sky, 'g', { transform: 'rotate(-24 960 380)' }), gid = 'btmw' + (++uid);
      const lg = el(defs, 'linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
      for (const [o, a] of [[0, 0], [0.3, 0.1], [0.5, 0.22], [0.7, 0.1], [1, 0]]) el(lg, 'stop', { offset: o, 'stop-color': C.stain, 'stop-opacity': a });
      P0(band, 'M-700 200L2700 200L2700 560L-700 560Z', `url(#${gid})`, 1);
      L0(band, 'M-700 392C300 384 1300 404 2700 386', C.paperDark, 10, 0.16);
      BTL.stars(band, 320, 77, [-700, 300, 2700, 460]);
      const rest = BTL.stars(sky, 260, 1905, [-600, -600, 2600, 1100]);
      const an = andromeda(sky, svg, defs, 1520, 190, 0.42);
      // the hill and one figure looking up
      P0(g, 'M0 820C300 800 600 720 900 700C1100 690 1300 740 1500 780C1700 810 1820 820 1920 830L1920 1800L0 1800Z', C.paperDark, 1);
      L0(g, 'M0 820C300 800 600 720 900 700C1100 690 1300 740 1500 780C1700 810 1820 820 1920 830', C.inkSoft, 2, 0.6);
      BTL.person(g, 'stand', 960, 702, 150, { face: 1 });
      return {
        update(lt) {
          rest.update(lt); an.update(lt);
          sky.setAttribute('transform', `rotate(${(lt * 0.22).toFixed(3)} 1500 -200)`);
        },
      };
    },
  };
})();
