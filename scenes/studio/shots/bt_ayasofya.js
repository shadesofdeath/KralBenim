// bt_ayasofya: the fall of Hagia Sophia's first dome (7 May 558), belgesel style (docs/BELGESEL.md).
// Still line art in the theme's tokens; only slow natural motion (dust, falling stone, light, a compass drawing).
// Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
// The dome is drawn as a section seen from inside the nave: shell with ribs, the ring of 40 windows at its foot
// (only the front half is visible, foreshortened), the cornice, two great piers and the arch between them, the altar
// canopy (ciborium) on the floor.
//   bt_ay_dome   P: {mode: "hook"|"crack"|"fall"|"inside"}  cues: a, b (crack) · hit (fall)
//                hook: no nave, the flat first dome alone in a light pool; its eastern part broken into scattered
//                stones that hang in the air and sink very slowly, broken edges lit gold, dust; the window ring stays.
//                crack: the intact first dome, two cracks draw themselves up the shell on "a" and "b". fall: the
//                intact dome; on "hit" its eastern part comes down stone by stone onto the altar, dust rises.
//                inside: the higher second dome today, light falling in beams through the window ring
//   bt_ay_hang   close-up after the fall: the remaining dome (west part + an eastern stub) in a light pool over the
//                gap, broken edges lit, dust sinking slowly through the gap
//   bt_ay_church P: {mode: "558"|"today", label}  the church from outside: central dome on its window ring, half domes,
//                buttresses, low aisles. 558: no minarets (6th century), flat dome, low sun, italic label.
//                today: higher dome and the four Ottoman minarets at dusk, one warm light in the window ring
//   bt_ay_compass P: {label}  cues: hit   an architect's sheet: a compass slowly draws the new dome's arc over a base
//                line; the italic label appears on "hit"
//   bt_ay_profile P: {a, b}  cues: hit   two dome profiles on one base: the flat first one (dashed, label a) stays; the
//                higher second one draws itself on "hit" (label b), a gold arrow shows the difference
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
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0, 'text-anchor': 'middle' }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const stroke = (e, p) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); e.setAttribute('stroke-dashoffset', f1(1 - clamp01(p))); };

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const push = (g, lt, dur, cx, cy, amt = 0.035, base = 1) => {
    const z = base * (1 + amt * BTL.ease(lt, 0, Math.max(3, dur)));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };
  const bg = g => P0(g, 'M-300-200L1380-200L1380 2100L-300 2100Z', C.paper, 1);

  // slow drifting motes inside a box (dir: horizontal drift; fall: downward drift)
  function dust(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: r(), s: 1.6 + r() * 2.4, v: 0.01 + r() * 0.018, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      let x, y, a;
      if (o.fall) { const u = (q.y + q.v * lt + 10) % 1; x = box[0] + q.x * w + 12 * Math.sin(lt * 0.4 + q.ph); y = box[1] + u * h; a = Math.sin(Math.PI * u); }
      else { const u = (q.x + q.v * lt * (o.dir ?? 1) + 10) % 1; x = box[0] + u * w; y = box[1] + q.y * h + 10 * Math.sin(lt * 0.35 + q.ph); a = Math.sin(Math.PI * u); }
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.45) * a).toFixed(3));
    } } };
  }
  // soft puffs rising (dust cloud)
  function puffs(g, defs, seed, n, o) {
    const r = rng(seed), list = [], id = 'aypf' + (++UID);
    const rg = el(defs, 'radialGradient', { id });
    el(rg, 'stop', { offset: '0', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '0.5', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 0.45 });
    el(rg, 'stop', { offset: '1', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 0 });
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'ellipse', { fill: `url(#${id})`, 'fill-opacity': 0 }), ph: i / n, rx: o.size * (0.7 + r() * 0.6), x0: o.x0 + (r() - 0.5) * o.spread, dx: (r() - 0.5) * o.dx });
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.08)) % 1, x = q.x0 + q.dx * u, y = o.y0 + o.dy * u, s = 0.6 + 1.4 * u;
      q.e.setAttribute('cx', f1(x)); q.e.setAttribute('cy', f1(y)); q.e.setAttribute('rx', f1(q.rx * s)); q.e.setAttribute('ry', f1(q.rx * s * 0.75));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.18) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ dome geometry
  // section seen from inside: dome centre cx, springing line BY (the foot of the window ring), radius R, rise h.
  // th in [0, PI]: 0 = left foot, PI/2 = crown, PI = right (east) foot
  const CX = 540;
  const G = (BY, R, h, T = 30) => ({ BY, R, h, T,
    o: th => [CX - R * Math.cos(th), BY - h * Math.sin(th)],
    i: th => [CX - (R - T) * Math.cos(th), BY - (h - T * 0.8) * Math.sin(th)] });
  const arcPts = (fn, a, b, n = 24) => { const p = []; for (let k = 0; k <= n; k++) p.push(fn(a + (b - a) * k / n)); return p; };
  const pl = pts => pts.map((p, k) => (k ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('');
  // closed band of the shell between th a..b
  const shellBand = (g, a, b, n = 12) => pl(arcPts(g.o, a, b, n).concat(arcPts(g.i, b, a, n))) + 'Z';
  // a jagged break across the shell at th (outer -> inner), deterministic
  const jag = (g, th, seed) => { const r = rng(seed), o = g.o(th), i = g.i(th), pts = []; for (let k = 0; k <= 5; k++) { const u = k / 5, dd = k % 2 ? 9 + r() * 8 : -(4 + r() * 6); pts.push([o[0] + (i[0] - o[0]) * u + dd, o[1] + (i[1] - o[1]) * u + dd * 0.4]); } return pts; };

  // the window ring + ribs; returns {g, wins: [{x, w}]}
  function windowRing(par, g, WB, o = {}) {
    const R = g.R, BY = g.BY, rg = el(par, 'g'), wins = [];
    const xr = o.half === 'left' ? CX + 6 : CX + R;
    P0(rg, `M${CX - R} ${BY}L${xr} ${BY}L${xr} ${BY + WB}L${CX - R} ${BY + WB}Z`, mix(C.paper, C.ink, 0.12), 1);
    let wd = '', pd = '';
    for (let k = 0; k < 40; k++) {
      const ph = (k + 0.5) / 40 * TAU, s = Math.sin(ph);
      if (s <= 0.08) continue;
      const x = CX + R * Math.cos(ph), w = 15 * s;
      if (o.half === 'left' && x > CX + 4) continue;
      wd += `M${f1(x - w)} ${BY + WB - 8}L${f1(x - w)} ${BY + 18}Q${f1(x)} ${BY + 2} ${f1(x + w)} ${BY + 18}L${f1(x + w)} ${BY + WB - 8}Z`;
      wins.push({ x, w, s });
      pd += `M${f1(CX + R * Math.cos(ph + TAU / 80))} ${BY}L${f1(CX + R * Math.cos(ph + TAU / 80))} ${BY + WB}`;
    }
    P0(rg, wd, C.paperLight, 1); L0(rg, wd, C.ink, 2, 0.9);
    L0(rg, pd, C.inkSoft, 1.4, 0.45);
    const right = o.half === 'left' ? CX + 6 : CX + R;
    L0(rg, `M${CX - R} ${BY}L${right} ${BY}M${CX - R - 24} ${BY + WB}L${o.half === 'left' ? right : CX + R + 24} ${BY + WB}M${CX - R - 24} ${BY + WB + 12}L${o.half === 'left' ? right : CX + R + 24} ${BY + WB + 12}`, C.ink, 3, 1);
    return { g: rg, wins };
  }
  // the eastern part of the dome that falls: th in [BA, BB]; the left part and a stub on the right stay
  const BA = Math.PI * 0.54, BB = Math.PI * 0.84;
  // one closed segment of the shell a..b, ends jagged where ja/jb (points outer -> inner)
  function segPath(g, a, b, ja, jb) {
    let pts = arcPts(g.o, a, b, 30);
    if (jb) pts = pts.concat(jb.slice(1, -1));
    pts = pts.concat(arcPts(g.i, b, a, 30));
    if (ja) pts = pts.concat(ja.slice(1, -1).reverse());
    return pl(pts) + 'Z';
  }
  // the shell of a dome (whole, or broken: the eastern part missing), with ribs
  function shell(par, g, o = {}) {
    const sg = el(par, 'g'), fillC = mix(C.paperLight, C.paper, 0.4);
    if (o.broken) {
      const J1 = jag(g, BA, 71), J2 = jag(g, BB, 83);
      for (const d of [segPath(g, 0, BA, null, J1), segPath(g, BB, Math.PI, J2, null)]) { P0(sg, d, fillC, 1); L0(sg, d, C.ink, 3.5, 1); }
      o.edge = pl(J1) + pl(J2);
    } else {
      const d = shellBand(g, 0, Math.PI, 40);
      P0(sg, d, fillC, 1); L0(sg, d, C.ink, 3.5, 1);
    }
    // ribs on the inner surface: meridians of the visible half
    let rb = '';
    for (let k = 0; k < 20; k++) {
      const ph = (k + 0.5) / 20 * Math.PI, cph = Math.cos(ph);
      if (o.broken && cph > -0.02) continue;
      const pts = []; for (let t = 0; t <= 12; t++) { const u = t / 12 * Math.PI / 2; pts.push([CX + (g.R - g.T) * cph * Math.cos(u), g.BY - (g.h - g.T * 0.8) * Math.sin(u)]); }
      rb += pl(pts);
    }
    L0(sg, rb, C.inkSoft, 1.5, 0.5);
    return sg;
  }
  // the fallen part as scattered stones: chunks of the shell between BA and BB, some split in two layers
  function stonesOf(par, g, seed) {
    const r = rng(seed), list = [], n = 6;
    const mid = th => { const o = g.o(th), i = g.i(th); return [(o[0] + i[0]) / 2, (o[1] + i[1]) / 2]; };
    for (let k = 0; k < n; k++) {
      const a = BA + (BB - BA) * k / n + 0.006, b = BA + (BB - BA) * (k + 1) / n - 0.006;
      const layers = k === 2 ? [[g.o, mid], [mid, g.i]] : [[g.o, g.i]];
      for (const [fo, fi] of layers) {
        const pts = arcPts(fo, a, b, 4).concat(arcPts(fi, b, a, 4)).map(p => [p[0] + (r() - 0.5) * 10, p[1] + (r() - 0.5) * 10]);
        const c = pts.reduce((m, p) => [m[0] + p[0] / pts.length, m[1] + p[1] / pts.length], [0, 0]);
        const e = el(par, 'g'), d = pl(pts) + 'Z';
        P0(e, d, mix(C.paperLight, C.paper, 0.4), 1); L0(e, d, C.ink, 3, 1);
        list.push({ g: e, c, k: r(), rot: (r() - 0.5) * 160, dx: (r() - 0.35) * 140, dl: r() * 0.7 });
      }
    }
    return list;
  }
  // piers, arch, pendentives, floor, ciborium. FY = floor
  function nave(par, top, FY, o = {}) {
    const ng = el(par, 'g');
    const AR = 280, AY = top + AR;   // the arch: inner piers at 260/820, crown tangent to the cornice
    P0(ng, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 1);
    // beyond the arch (the deeper space): slightly darker, a faint half dome
    P0(ng, `M260 ${FY}L260 ${AY}A${AR} ${AR} 0 0 1 820 ${AY}L820 ${FY}Z`, mix(C.paper, C.ink, 0.07), 1);
    L0(ng, `M330 ${AY + 60}A210 150 0 0 1 750 ${AY + 60}`, C.inkSoft, 2, 0.4);
    // pendentive walls + piers
    const wall = `M120 ${top + 12}L960 ${top + 12}L960 ${FY}L820 ${FY}L820 ${AY}A${AR} ${AR} 0 0 0 260 ${AY}L260 ${FY}L120 ${FY}Z`;
    P0(ng, wall, mix(C.paper, C.ink, 0.1), 1);
    L0(ng, `M260 ${FY}L260 ${AY}A${AR} ${AR} 0 0 1 820 ${AY}L820 ${FY}M120 ${top + 12}L120 ${FY}M960 ${top + 12}L960 ${FY}`, C.ink, 3, 1);
    L0(ng, `M120 ${top + 40}C200 ${top + 60} 250 ${AY - 120} 262 ${AY}M960 ${top + 40}C880 ${top + 60} 830 ${AY - 120} 818 ${AY}`, C.inkSoft, 2, 0.6);
    L0(ng, `M120 ${AY + 40}L260 ${AY + 40}M820 ${AY + 40}L960 ${AY + 40}`, C.inkSoft, 2, 0.6);
    // floor lines in perspective
    let fl = '';
    for (const u of [0.1, 0.3, 0.62]) { const y = FY + (2100 - FY) * u * u * 1.2; fl += `M-300 ${f1(y)}L1380 ${f1(y)}`; }
    for (let k = -3; k <= 3; k++) fl += `M${540 + k * 120} ${FY}L${f1(540 + k * 330)} ${FY + 420}`;
    L0(ng, fl, C.inkSoft, 1.5, 0.3);
    L0(ng, `M-300 ${FY}L1380 ${FY}`, C.ink, 2.5, 0.8);
    // the ciborium over the altar
    const cb = el(ng, 'g');
    if (!o.noAltar) {
      const x0 = 485, x1 = 595, ct = FY - 120;
      P0(cb, `M${x0 + 18} ${FY - 46}L${x1 - 18} ${FY - 46}L${x1 - 18} ${FY}L${x0 + 18} ${FY}Z`, C.paperLight, 1);
      L0(cb, `M${x0 + 18} ${FY - 46}L${x1 - 18} ${FY - 46}L${x1 - 18} ${FY}M${x0 + 18} ${FY}L${x0 + 18} ${FY - 46}`, C.ink, 2.5, 1);
      L0(cb, `M${x0} ${FY}L${x0} ${ct}M${x1} ${FY}L${x1} ${ct}`, C.ink, 3.5, 1);
      const cap = `M${x0 - 10} ${ct}L${x1 + 10} ${ct}L${x1 + 10} ${ct - 12}Q540 ${ct - 70} ${x0 - 10} ${ct - 12}Z`;
      P0(cb, cap, mix(C.paper, C.ink, 0.16), 1); L0(cb, cap, C.ink, 2.5, 1);
      L0(cb, `M540 ${ct - 52}L540 ${ct - 72}M532 ${ct - 64}L548 ${ct - 64}`, C.ink, 2.5, 1);
    }
    return { g: ng, cb };
  }

  // ------------------------------------------------------------------ bt_ay_dome / bt_ay_hang
  function domeShot(fixedMode) {
    return {
      build({ P, W, H, svg, defs }) {
        const mode = fixedMode || P.mode || 'hook', g0 = canvas(svg, W, H), gp = el(g0, 'g');
        bg(gp);
        const inside = mode === 'inside', hang = mode === 'hang', hook = mode === 'hook';
        const BY = inside ? 600 : 590, WB = 62, FY = 1080;
        const geo = G(BY, 330, inside ? 290 : 205, 30);
        const pool = BTL.glow(svg, defs, CX, inside ? 520 : 530, inside ? 520 : 470, C.stain, 0.3, gp);
        const nv = hook ? null : nave(gp, BY + WB, FY, { noAltar: mode === 'crack' || hang });
        const ring = windowRing(gp, geo, WB, {});
        // hook / hang / fall: the eastern part is missing (hang) or separate stones (hook, fall)
        const split = hook || mode === 'fall' || hang;
        const so = { broken: split };
        const shellG = shell(gp, geo, so);
        const stones = hook || mode === 'fall' ? stonesOf(gp, geo, hook ? 13 : 17) : [];
        stones.forEach((st, i) => {
          if (hook) { st.land = 760; return; }
          const tx = 420 + (i % 4) * 70 + st.k * 24, ty = FY - 70 - Math.floor(i / 4) * 42;
          st.dx = tx - st.c[0]; st.land = ty - st.c[1]; st.rot = (st.rot > 0 ? 1 : -1) * (60 + Math.abs(st.rot) * 0.5);
        });
        const mound = mode === 'fall' ? el(gp, 'g', { opacity: 0 }) : null;
        if (mound) { const md = `M310 ${FY}C380 ${FY - 70} 460 ${FY - 122} 545 ${FY - 126}C630 ${FY - 122} 710 ${FY - 70} 780 ${FY}Z`; P0(mound, md, mix(C.paper, C.ink, 0.22), 1); L0(mound, md, C.ink, 3, 1); L0(mound, `M390 ${FY - 40}l34-10M470 ${FY - 86}l36 6M600 ${FY - 70}l30-10M680 ${FY - 30}l28-6M520 ${FY - 30}l40 4`, C.inkSoft, 2.5, 0.8); if (stones[0]) gp.insertBefore(mound, stones[0].g); }
        // the broken edge (gold, lit) and the cracks
        const edge = so.edge ? L0(gp, so.edge, C.gold, 6, 0) : null;
        const cracks = [];
        if (mode === 'crack') {
          const r = rng(29);
          for (const [th0, th1, sgn] of [[0.78, 0.53, 1], [0.24, 0.45, -1]]) {
            const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10, th = (th0 + (th1 - th0) * u) * Math.PI, o = geo.o(th), i = geo.i(th); const f = 0.15 + 0.7 * u; pts.push([o[0] + (i[0] - o[0]) * f + (k % 2 ? 1 : -1) * (6 + r() * 8) * sgn, o[1] + (i[1] - o[1]) * f + (k % 2 ? 4 : -2)]); }
            const st = geo.o(th0 * Math.PI);
            const d = `M${f1(st[0])} ${f1(BY + WB)}L${f1(st[0] + 6 * sgn)} ${f1(BY + 30)}L${f1(st[0] - 4 * sgn)} ${f1(BY)}` + pl(pts).replace(/^M/, 'L');
            cracks.push(L0(gp, d, C.ink, 5, 1)); cracks.push(L0(gp, d, C.red, 2.5, 0.8));
          }
        }
        // light beams through the windows (inside)
        const beams = [];
        if (inside) {
          for (const w of ring.wins) {
            if (w.s < 0.3) continue;
            const x = w.x, ex = x + (x - CX) * 0.25 + 60;
            const d = `M${f1(x - w.w)} ${BY + 30}L${f1(x + w.w)} ${BY + 30}L${f1(ex + 46 * w.s)} ${FY}L${f1(ex - 46 * w.s)} ${FY}Z`;
            beams.push({ e: P0(gp, d, C.paperLight, 0), ph: x * 0.013 });
          }
        }
        const settle = puffs(gp, defs, 7, 12, { x0: 640, spread: 460, y0: FY - 30, dx: 220, dy: -520, size: 110, rate: 0.06, alpha: 0.22 });
        const hp = hang ? BTL.glow(svg, defs, 380, 470, 430, C.stain, 0.45, gp) : null;
        if (hp) gp.insertBefore(hp.e, gp.children[1]);
        const ds = hang ? dust(gp, 5, 40, [560, BY - 260, 840, FY], { fall: true, alpha: 0.6 })
          : hook ? dust(gp, 5, 44, [420, BY - 200, 1000, 1500], { fall: true, alpha: 0.55 })
          : dust(gp, 9, 30, inside ? [260, BY + 40, 900, FY - 40] : [200, BY - 160, 900, FY], { alpha: inside ? 0.55 : 0.3, color: inside ? C.inkSoft : C.inkSoft });
        const scale = mode === 'crack' ? 1.3 : hang ? 1.3 : hook ? 1.12 : 1.06;
        return {
          update(lt, dur, cues) {
            if (hang) push(gp, lt, dur, 500, 250, 0.03, scale); else push(gp, lt, dur, CX, mode === 'crack' ? 250 : hook ? 560 : 640, 0.035, scale);
            pool.set(0.3 + 0.03 * Math.sin(lt * 0.6));
            ds.update(lt);
            if (hook || mode === 'fall') {
              const hit = mode === 'fall' ? cue(cues, 'hit', dur * 0.3) : 0;
              let landed = 0;
              for (const st of stones) {
                // hook: scattered mid-fall, sinking very slowly; fall: from rest to the floor
                const u = hook ? 0.1 + 0.62 * st.k + 0.025 * lt : BTL.ease(lt, hit - 0.2 + st.dl, 1.4);
                const yy = st.land * u * u, xx = st.dx * u, rr = st.rot * u;
                st.g.setAttribute('transform', `translate(${f1(xx)} ${f1(yy)}) rotate(${f1(rr)} ${f1(st.c[0])} ${f1(st.c[1])})`);
                if (mode === 'fall') landed = Math.max(landed, BTL.ease(lt, hit + 0.9 + st.dl, 0.5));
              }
              if (mound) fade(mound, BTL.ease(lt, hit + 1.0, 0.9));
              if (mode === 'fall') {
                settle.update(Math.max(0, lt - hit - 1), landed);
                fade(nv.cb, 1 - BTL.ease(lt, hit + 1.0, 0.8));
                if (edge) edge.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, hit + 0.4, 1)).toFixed(3));
              } else {
                settle.update(0, 0);
                if (edge) edge.setAttribute('stroke-opacity', '0.9');
              }
            } else if (hang) {
              settle.update(0, 0);
              hp.set(0.45 + 0.05 * Math.sin(lt * 0.6));
              if (edge) edge.setAttribute('stroke-opacity', (0.75 + 0.15 * Math.sin(lt * 0.8)).toFixed(3));
            } else if (mode === 'crack') {
              const a = cue(cues, 'a', dur * 0.25), b = cue(cues, 'b', dur * 0.6);
              stroke(cracks[0], BTL.ease(lt, a - 0.1, 1.2)); stroke(cracks[1], BTL.ease(lt, a - 0.1, 1.2));
              stroke(cracks[2], BTL.ease(lt, b - 0.1, 1.2)); stroke(cracks[3], BTL.ease(lt, b - 0.1, 1.2));
              settle.update(0, 0);
            } else {
              for (const q of beams) q.e.setAttribute('fill-opacity', (0.5 + 0.12 * Math.sin(lt * 0.5 + q.ph)).toFixed(3));
              settle.update(0, 0);
            }
          },
        };
      },
    };
  }
  const DOME = domeShot(null), HANG = domeShot('hang');
  SH.bt_ay_dome = { kind: '2d', build: ctx => DOME.build(ctx) };
  SH.bt_ay_hang = { kind: '2d', build: ctx => HANG.build(ctx) };

  // ------------------------------------------------------------------ bt_ay_church
  SH.bt_ay_church = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || '558', today = mode === 'today', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const GY = 1150, sunX = today ? 760 : 300;
      const sun = BTL.glow(svg, defs, sunX, 860, 620, C.stain, 0.34, g);
      const disc = P0(g, '', C.gold, today ? 0.4 : 0.32);
      // far city line + sea
      P0(g, `M-300 ${GY - 40}L1380 ${GY - 40}L1380 2100L-300 2100Z`, mix(C.paper, C.ink, 0.05), 1);
      const D = BTL.drawing(el(g, 'g'));
      const mass = mix(C.paper, C.ink, 0.2), mass2 = mix(C.paper, C.ink, 0.28);
      // aisles + galleries
      D.f(`M90 ${GY}L90 960L330 930L750 930L990 960L990 ${GY}Z`, mass, 1);
      D.s(`M90 ${GY}L90 960L330 930L750 930L990 960L990 ${GY}`, { w: 3 });
      // half domes west (left) and east (right) with small exedrae
      D.f('M330 935L330 790C240 790 170 850 150 935Z', mass2, 1); D.s('M330 790C240 790 170 850 150 935', { w: 3 });
      D.f('M750 935L750 790C840 790 910 850 930 935Z', mass2, 1); D.s('M750 790C840 790 910 850 930 935', { w: 3 });
      D.s('M300 800C250 812 210 840 190 880M780 800C830 812 870 840 890 880', { w: 2, color: C.inkSoft, alpha: 0.7 });
      // central block (tympanum walls) + buttresses
      D.f('M330 935L330 760L750 760L750 935Z', mass, 1); D.s('M330 935L330 760L750 760L750 935', { w: 3 });
      let wr = '';
      for (let k = 0; k < 7; k++) { const x = 368 + k * 52; wr += `M${x} 880L${x} 846Q${x + 12} 832 ${x + 24} 846L${x + 24} 880Z`; }
      D.f(wr, C.paperLight, 0.8); D.s(wr, { w: 2, color: C.ink });
      for (const x of [300, 720]) { const b = `M${x} ${GY}L${x} 742L${x + 60} 742L${x + 60} ${GY}Z`; D.f(b, mass2, 1); D.s(b, { w: 3 }); }
      if (today) for (const x of [240, 780]) { const b = `M${x} ${GY}L${x} 900L${x + 60} 880L${x + 60} ${GY}Z`; D.f(b, mass2, 1); D.s(b, { w: 3 }); }
      // the dome on its window ring
      const R = 210, BY = 742, h = today ? 150 : 108;
      D.f(`M${CX - R - 8} ${BY + 20}L${CX + R + 8} ${BY + 20}L${CX + R + 8} ${BY - 8}L${CX - R - 8} ${BY - 8}Z`, mass, 1);
      let wn = '';
      for (let k = 0; k < 40; k++) { const ph = (k + 0.5) / 40 * TAU, s = Math.sin(ph); if (s < 0.15) continue; const x = CX + (R + 8) * Math.cos(ph), w = 6 * s; wn += `M${f1(x - w)} ${BY + 14}L${f1(x - w)} ${BY - 2}L${f1(x + w)} ${BY - 2}L${f1(x + w)} ${BY + 14}Z`; }
      D.f(wn, C.paperLight, 0.9);
      const dome = `M${CX - R} ${BY - 8}A${R} ${h} 0 0 1 ${CX + R} ${BY - 8}Z`;
      D.f(dome, mix(C.paper, C.ink, 0.24), 1); D.s(dome, { w: 3.5 });
      D.s(`M${CX - R - 8} ${BY + 20}L${CX + R + 8} ${BY + 20}L${CX + R + 8} ${BY - 8}L${CX - R - 8} ${BY - 8}Z`, { w: 3 });
      let rb = ''; for (let k = 1; k < 8; k++) { const c = Math.cos(k / 8 * Math.PI); const pts = []; for (let t = 0; t <= 8; t++) { const u = t / 8 * Math.PI / 2; pts.push([CX + R * c * Math.cos(u), BY - 8 - h * Math.sin(u)]); } rb += pl(pts); }
      D.s(rb, { w: 1.5, color: C.inkSoft, alpha: 0.6 });
      if (today) D.s(`M${CX} ${BY - 8 - h}L${CX} ${BY - 8 - h - 40}M${CX - 10} ${BY - h - 30}L${CX + 10} ${BY - h - 30}`, { w: 3 });
      // minarets (Ottoman, only today)
      if (today) for (const [x, top, w] of [[140, 540, 32], [225, 610, 28], [855, 610, 28], [940, 540, 32]]) {
        const m = `M${x - w / 2} ${GY}L${x - w / 2} ${top + 60}L${x} ${top}L${x + w / 2} ${top + 60}L${x + w / 2} ${GY}Z`;
        D.f(m, mass2, 1); D.s(m, { w: 3 });
        D.s(`M${x - w / 2 - 8} ${top + 160}L${x + w / 2 + 8} ${top + 160}M${x - w / 2 - 8} ${top + 300}L${x + w / 2 + 8} ${top + 300}`, { w: 3 });
      }
      // cypress trees for scale
      for (const [x, hh] of [[60, 160], [1010, 140], [420, 110]]) { const c = `M${x} ${GY}C${x - 26} ${GY - hh * 0.4} ${x - 14} ${GY - hh * 0.8} ${x} ${GY - hh}C${x + 14} ${GY - hh * 0.8} ${x + 26} ${GY - hh * 0.4} ${x} ${GY}Z`; D.f(c, mix(C.paper, C.ink, 0.45), 1); D.s(c, { w: 2.5 }); }
      // ground in front
      P0(g, `M-300 ${GY}L1380 ${GY}L1380 2100L-300 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${GY}L1380 ${GY}`, C.ink, 2.5, 0.8);
      let gr = ''; const r = rng(today ? 3 : 8);
      for (let k = 0; k < 30; k++) { const x = -250 + r() * 1580, y = GY + 40 + Math.pow(r(), 1.3) * 700; gr += `M${f1(x)} ${f1(y)}l${f1(30 + r() * 50)} 0`; }
      L0(g, gr, C.inkSoft, 2, 0.3);
      let lw = ''; for (let k = 0; k < 40; k++) { const ph = (k + 0.5) / 40 * TAU, s = Math.sin(ph); if (s < 0.5 || k % 3) continue; const x = CX + (R + 8) * Math.cos(ph), w = 6 * s; lw += `M${f1(x - w)} ${BY + 14}L${f1(x - w)} ${BY - 2}L${f1(x + w)} ${BY - 2}L${f1(x + w)} ${BY + 14}Z`; }
      const lamp = today ? P0(g, lw, C.gold, 0) : null;
      const lab = P.label ? txt(g, P.label, 540, 400, 96, { font: LO, italic: true, weight: 400 }) : null;
      const rule = P.label ? L0(g, 'M430 450L650 450', C.gold, 2.5, 1) : null;
      const ds = dust(g, 21, 22, [-100, 700, 1180, 1140], { alpha: 0.25 });
      return {
        update(lt, dur) {
          push(g, lt, dur, 540, 1040, 0.035, today ? 1.0 : 1.2);
          D.reveal(today ? 1 : 0.55 + 0.45 * BTL.ease(lt, 0, 1.6));
          disc.setAttribute('d', BTL.E(sunX, 860 + 10 * lt, 64, 64));
          sun.set(0.34 + 0.03 * Math.sin(lt * 0.5));
          if (lamp) lamp.setAttribute('fill-opacity', (0.95 * BTL.ease(lt, 0.6, 2.4)).toFixed(3));
          if (lab) { fade(lab, BTL.ease(lt, 0.4, 1.2)); stroke(rule, BTL.ease(lt, 0.8, 1.2)); }
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ay_compass
  SH.bt_ay_compass = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const pool = BTL.glow(svg, defs, 540, 760, 560, C.stain, 0.28, g);
      // the sheet
      const S = el(g, 'g', { transform: 'rotate(-2 540 760)' });
      P0(S, 'M110 330L970 330L970 1150L110 1150Z', C.paperLight, 1);
      L0(S, 'M110 330L970 330L970 1150L110 1150Z', C.inkSoft, 2, 0.8);
      P0(S, 'M120 1150L980 1150L980 1162L120 1162Z', C.inkSoft, 0.25);
      // construction: base line, centre line, the old flat profile faint, the window ring
      const PX = 540, PY = 900, RR = 330;
      L0(S, `M160 ${PY}L920 ${PY}M${PX} ${PY + 90}L${PX} ${PY - RR - 70}`, C.inkSoft, 1.6, 0.6, { 'stroke-dasharray': '10 10' });
      L0(S, `M${PX - RR} ${PY}A${RR} 205 0 0 1 ${PX + RR} ${PY}`, C.inkSoft, 2, 0.45, { 'stroke-dasharray': '6 10' });
      let wn = '';
      for (let k = 0; k < 40; k++) { const ph = (k + 0.5) / 40 * TAU, s = Math.sin(ph); if (s < 0.12) continue; const x = PX + RR * Math.cos(ph), w = 9 * s; wn += `M${f1(x - w)} ${PY + 50}L${f1(x - w)} ${PY + 14}L${f1(x + w)} ${PY + 14}L${f1(x + w)} ${PY + 50}`; }
      L0(S, `M${PX - RR} ${PY}L${PX - RR} ${PY + 60}L${PX + RR} ${PY + 60}L${PX + RR} ${PY}` + wn, C.ink, 2, 0.8);
      const arc = L0(S, `M${PX - RR} ${PY}A${RR} ${RR * 0.88} 0 0 1 ${PX + RR} ${PY}`, C.ink, 4, 1);
      // the compass (seen from slightly in front: its head projects upward)
      const cg = el(S, 'g');
      const legA = L0(cg, '', C.ink, 6, 1), legB = L0(cg, '', C.ink, 6, 1);
      const head = P0(cg, '', mix(C.paper, C.ink, 0.5), 1), headL = L0(cg, '', C.ink, 2.5, 1), knob = L0(cg, '', C.ink, 5, 1);
      const nib = P0(cg, '', C.gold, 1);
      const lab = txt(g, P.label || 'Genç İsidoros', 540, 255, 96, { font: LO, italic: true, weight: 600 });
      const rule = L0(g, 'M400 290L680 290', C.gold, 3, 1);
      const ds = dust(g, 33, 20, [150, 360, 930, 1120], { alpha: 0.25 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.45);
          push(g, lt, dur, 540, 760, 0.035);
          pool.set(0.28 + 0.03 * Math.sin(lt * 0.6));
          const p = BTL.ease(lt, 0.1, Math.max(2.4, dur - 0.6));
          stroke(arc, p);
          const a = Math.PI * (1 - p), pen = [PX + RR * Math.cos(a), PY - RR * 0.88 * Math.sin(a)];
          let nx = Math.sin(a), ny = Math.cos(a) - 1.4; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
          const mx = (PX + pen[0]) / 2 + nx * RR * 0.42, my = (PY + pen[1]) / 2 + ny * RR * 0.42;
          legA.setAttribute('d', `M${PX} ${PY}L${f1(mx)} ${f1(my)}`);
          legB.setAttribute('d', `M${f1(pen[0])} ${f1(pen[1])}L${f1(mx)} ${f1(my)}`);
          const hd = BTL.E(mx, my, 22, 22);
          head.setAttribute('d', hd); headL.setAttribute('d', hd);
          knob.setAttribute('d', `M${f1(mx)} ${f1(my - 22)}L${f1(mx)} ${f1(my - 60)}`);
          nib.setAttribute('d', BTL.E(pen[0], pen[1], 7, 7));
          fade(lab, BTL.ease(lt, hit - 0.2, 1)); stroke(rule, BTL.ease(lt, hit, 1));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ay_profile
  SH.bt_ay_profile = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const BY = 900, R = 380, h1 = 290, h2 = 330;
      const pool = BTL.glow(svg, defs, 540, 720, 560, C.stain, 0.26, g);
      // the base: window ring + cornice
      let wn = '';
      for (let k = 0; k < 40; k++) { const ph = (k + 0.5) / 40 * TAU, s = Math.sin(ph); if (s < 0.12) continue; const x = CX + R * Math.cos(ph), w = 10 * s; wn += `M${f1(x - w)} ${BY + 60}L${f1(x - w)} ${BY + 18}Q${f1(x)} ${BY + 6} ${f1(x + w)} ${BY + 18}L${f1(x + w)} ${BY + 60}Z`; }
      P0(g, `M${CX - R} ${BY}L${CX + R} ${BY}L${CX + R} ${BY + 72}L${CX - R} ${BY + 72}Z`, mix(C.paper, C.ink, 0.12), 1);
      P0(g, wn, C.paperLight, 1); L0(g, wn, C.ink, 2, 0.8);
      L0(g, `M${CX - R - 30} ${BY}L${CX + R + 30} ${BY}M${CX - R - 30} ${BY + 72}L${CX + R + 30} ${BY + 72}`, C.ink, 3, 1);
      P0(g, `M-300 ${BY + 72}L1380 ${BY + 72}L1380 2100L-300 2100Z`, mix(C.paper, C.ink, 0.07), 1);
      L0(g, `M${CX} ${BY + 40}L${CX} ${BY - h2 - 60}`, C.inkSoft, 1.5, 0.5, { 'stroke-dasharray': '8 10' });
      const secF = P0(g, `M${CX - R} ${BY}A${R} ${h2} 0 0 1 ${CX + R} ${BY}Z`, C.paperLight, 0);
      const cres = P0(g, `M${CX - R} ${BY}A${R} ${h2} 0 0 1 ${CX + R} ${BY}A${R} ${h1} 0 0 0 ${CX - R} ${BY}Z`, C.gold, 0);
      const first = L0(g, `M${CX - R} ${BY}A${R} ${h1} 0 0 1 ${CX + R} ${BY}`, C.inkSoft, 3.5, 0.9, { 'stroke-dasharray': '16 12' });
      const second = L0(g, `M${CX - R} ${BY}A${R} ${h2} 0 0 1 ${CX + R} ${BY}`, C.ink, 5, 1);
      // gold arrow from crown 1 to crown 2
      const y1 = BY - h1, y2 = BY - h2;
      const arrow = L0(g, `M${CX + 40} ${y1}L${CX + 40} ${y2 + 4}M${CX + 26} ${y2 + 22}L${CX + 40} ${y2 + 4}L${CX + 54} ${y2 + 22}M${CX + 24} ${y1}L${CX + 56} ${y1}`, C.gold, 4, 1);
      const la = txt(g, P.a || '537', CX - 200, BY - 100, 56, { font: LO, italic: true, weight: 400, color: C.inkSoft });
      const lb = txt(g, P.b || '562', CX + 250, BY - h2 - 10, 64, { font: LO, italic: true, weight: 500 });
      const ds = dust(g, 51, 22, [140, 420, 940, 900], { alpha: 0.25 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.35);
          push(g, lt, dur, 540, 760, 0.035);
          pool.set(0.26 + 0.03 * Math.sin(lt * 0.6));
          fade(first, 1); fade(la, BTL.ease(lt, 0, 0.8));
          const s = BTL.ease(lt, Math.max(0.1, hit - 0.7), 1.1);
          stroke(second, s); secF.setAttribute('fill-opacity', (0.55 * BTL.ease(lt, hit, 0.8)).toFixed(3)); cres.setAttribute('fill-opacity', (0.35 * BTL.ease(lt, hit + 0.1, 0.8)).toFixed(3));
          stroke(arrow, BTL.ease(lt, hit + 0.2, 0.7)); fade(lb, BTL.ease(lt, hit + 0.1, 0.7));
          ds.update(lt);
        },
      };
    },
  };
})();
