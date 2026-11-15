// bt_nyos: the Lake Nyos disaster (Cameroon, 21 August 1986), belgesel style (docs/BELGESEL.md). Clean still line art
// in the theme's tokens; only slow natural motion (a rising veil of gas, water, bubbles, a creeping cloud, dawn light,
// a fountain). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred
// column. No bodies are ever shown: the loss is told by lights going out and a hearth that has gone cold.
//   bt_ny_lake    P: {mode: "hook"|"red"|"calm"}  cues: hit
//                 hook: night, a flat black crater lake between dark ridges under a low moon; a pale, heavy veil rises
//                 slowly from the water; on "hit" it swells and a tongue spills over the right-hand saddle
//                 red: the same lake at dawn; on "hit" muddy red spreads out from the middle of the blue water
//                 calm: night again, the lake still, the moon's path on the water, a thin far fountain at its centre
//   bt_ny_map     P: {label: "Kamerun", sub: "21 Ağustos 1986"}  cues: hit
//                 Africa alone, a gold point pulsing in Cameroon (Lake Nyos); the label beside it, the date on "hit"
//   bt_ny_section P: {mode: "still"|"burst"}  cues: hit
//                 the lake cut through: crater walls, dark water, a pale CO2-rich layer at the bottom full of tiny
//                 bubbles, a seep rising from the deep. still: the layer slowly thickens; "CO₂" appears on "hit".
//                 burst: a bubble column tears up from the layer, on "hit" the surface bulges into a dome and a pale
//                 cloud boils up above it
//   bt_ny_valley  cues: hit   the valleys below the lake seen from above as a contour map; a pale tongue of gas flows
//                 down the valley floor; the warm lights of three small villages go out as it passes
//   bt_ny_hut     cues: hit   dawn, one round thatched hut, dark doorway, a cooking pot on three stones; a last thread of
//                 smoke from the hearth fades out on "hit"; a low mist lies on the ground
//   bt_ny_pipe    cues: hit   today: a small raft in the middle of the lake, a pipe running down into the deep layer; a
//                 thin fountain of water and gas rises from the raft and falls back; on "hit" it stands taller
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const NIGHTWATER = () => mix(C.paper, C.blue, 0.16);
  const DEEP = () => mix(C.paper, C.blue, 0.24);
  const GAS = () => mix(C.inkSoft, C.ink, 0.45);
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  // open smooth path through points (quadratic through edge midpoints)
  function smoothOpen(pts) {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + q[0]) / 2)} ${f1((p[1] + q[1]) / 2)}`;
    }
    const z = pts[pts.length - 1];
    return d + `L${f1(z[0])} ${f1(z[1])}`;
  }
  // a soft heavy veil standing on a base line: its top edge breathes slowly; grow 0..1 sets its height
  function veil(g, o) {
    const e = P0(g, '', o.color || GAS(), o.alpha ?? 0.2), ph = (o.seed || 1) * 1.7, n = 22;
    return {
      e,
      update(lt, grow = 1, on = 1) {
        const pts = [[o.x0, o.y]];
        for (let i = 0; i <= n; i++) {
          const u = i / n, x = o.x0 + (o.x1 - o.x0) * u;
          const env = o.pow ? Math.pow(Math.sin(Math.PI * u), o.pow) : o.taper === 1 ? Math.sin(Math.PI * u) : Math.pow(Math.min(1, Math.sin(Math.PI * u) * 2.2), 0.8);
          const s = 0.8 + 0.12 * Math.sin(x * 0.011 + lt * 0.45 + ph) + 0.08 * Math.sin(x * 0.03 - lt * 0.8 + ph * 2);
          pts.push([x + (o.lean || 0) * env * grow, o.y - o.h * grow * env * s]);
        }
        pts.push([o.x1, o.y]);
        e.setAttribute('d', smoothOpen(pts) + 'Z');
        e.setAttribute('fill-opacity', ((o.alpha ?? 0.2) * on).toFixed(3));
      },
    };
  }
  // a heavy dome of gas: rounded scalloped top, soft drooping base (no hard line)
  function domeLayer(g, o) {
    const e = P0(g, '', C.ink, o.alpha), ph = o.seed * 1.3, n = 40;
    return { update(lt, grow) {
      const top = [], bot = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = o.x0 + (o.x1 - o.x0) * u, env = Math.pow(Math.sin(Math.PI * u), 0.7);
        const b = 0.07 * Math.abs(Math.sin(u * Math.PI * 4.5 + lt * 0.35 + ph)) + 0.03 * Math.sin(lt * 0.5 + ph + u * 3);
        top.push([x, o.y - o.h * grow * env * (0.9 + b)]);
        bot.unshift([x, o.y + o.droop * Math.sin(Math.PI * u) * (0.8 + 0.2 * Math.sin(lt * 0.4 + u * 5 + ph))]);
      }
      e.setAttribute('d', smoothOpen(top.concat(bot)) + 'Z');
    } };
  }
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: (o.size || 2.4) * (0.7 + r() * 0.9), v: 0.015 + r() * 0.025, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = o.up ? box[3] - u * h : box[1] + u * h, x = box[0] + q.x * w + 10 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  function wisps(g, pts, o = {}) {
    const list = pts.map(([x, y], i) => ({ x, y, e: L0(g, '', o.color || C.inkSoft, o.w || 3, o.alpha ?? 0.35), ph: i * 1.9 }));
    return { update(lt, on = 1) { for (const q of list) {
      const h = o.h || 380, s1 = (o.amp || 26) * Math.sin(lt * 0.9 + q.ph), s2 = (o.amp || 26) * 1.4 * Math.sin(lt * 0.7 + q.ph + 1.3);
      q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}C${f1(q.x + s1)} ${f1(q.y - h * 0.3)} ${f1(q.x - s2)} ${f1(q.y - h * 0.65)} ${f1(q.x + s2 * 0.8)} ${f1(q.y - h)}`);
      q.e.setAttribute('stroke-opacity', ((o.alpha ?? 0.35) * on).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the crater lake, seen from its rim
  // high angle: the far shore sits at HZ, the water fills the middle of the frame down to the near shore NEAR, a dark
  // rim slope with reeds fills the lower third
  const HZ = 900, NEAR = 1480, LX = 540;
  const RIDGE_TOP = 'M-300 800C-160 770-40 720 90 736C210 750 300 790 420 784C560 776 640 700 780 712C900 722 980 770 1100 764C1220 758 1300 780 1380 790';
  const RIDGE = `M-300 ${HZ + 60}L` + RIDGE_TOP.slice(1) + `L1380 ${HZ + 60}Z`;
  const FARSHORE = `M-60 ${HZ + 20}C200 ${HZ - 6} 880 ${HZ - 6} 1140 ${HZ + 20}`;
  const LAKE = FARSHORE + `L1140 ${NEAR}C820 ${NEAR + 36} 260 ${NEAR + 36} -60 ${NEAR}Z`;
  const FRONT_TOP = 'M-300 1530C60 1484 300 1500 540 1494C800 1488 1000 1470 1380 1516';
  function lakeWorld(g, svg, defs, o = {}) {
    const Wd = {};
    if (o.dawn) {
      const gid = 'nyS' + (++uid), lg = el(defs, 'linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
      el(lg, 'stop', { offset: '0', 'stop-color': C.paper });
      el(lg, 'stop', { offset: '0.6', 'stop-color': mix(C.paper, C.blue, 0.25) });
      el(lg, 'stop', { offset: '1', 'stop-color': mix(C.paper, C.stain, 0.6) });
      el(g, 'rect', { x: -300, y: -100, width: 1680, height: HZ + 60, fill: `url(#${gid})` });
      Wd.dawn = BTL.glow(svg, defs, 760, HZ - 120, 700, C.stain, 0.25, g);
    }
    if (o.stars) Wd.stars = BTL.stars(g, 120, 31, [0, 40, 1080, 760]);
    if (o.moon) {
      Wd.moonGlow = BTL.glow(svg, defs, o.moon[0], o.moon[1], 320, C.stain, 0.3, g);
      Wd.moon = P0(g, BTL.E(o.moon[0], o.moon[1], 44, 44), C.ink, 0.95);
    }
    P0(g, RIDGE, o.dawn ? mix(C.paperDark, C.paper, 0.6) : mix(C.paperDark, C.paper, 0.35), 1);
    L0(g, RIDGE_TOP, C.inkSoft, 2, 0.5);
    Wd.lakeId = 'nyL' + (++uid);
    el(el(defs, 'clipPath', { id: Wd.lakeId }), 'path', { d: LAKE });
    Wd.lake = P0(g, LAKE, o.water || mix(C.paper, C.blue, 0.2), 1);
    Wd.inLake = el(g, 'g', { 'clip-path': `url(#${Wd.lakeId})` });
    // the moon's light falls across the water as soft bands, darker towards the near shore
    const wg = 'nyW' + (++uid), wl = el(defs, 'linearGradient', { id: wg, gradientUnits: 'userSpaceOnUse', x1: 0, y1: HZ, x2: 0, y2: NEAR + 40 });
    el(wl, 'stop', { offset: '0', 'stop-color': C.paper, 'stop-opacity': 0 });
    el(wl, 'stop', { offset: '1', 'stop-color': C.paper, 'stop-opacity': o.dawn ? 0.2 : 0.45 });
    el(Wd.inLake, 'rect', { x: -100, y: HZ, width: 1300, height: NEAR - HZ + 80, fill: `url(#${wg})` });
    L0(g, FARSHORE, C.inkSoft, 2.5, 0.6);
    return Wd;
  }
  // the glint of the moon on the water: a column of short strokes, wider towards the viewer
  function glint(g, mx, o = {}) {
    const r = rng(17), list = [];
    for (let i = 0; i < 18; i++) { const y = HZ + 30 + i * 30; list.push({ e: L0(g, '', C.ink, 3 + i * 0.12, 0.4), y, w: (16 + i * 7) * (0.6 + r() * 0.6), ph: r() * TAU }); }
    return { update(lt, a = 1) { for (const q of list) {
      const w = q.w * (0.7 + 0.3 * Math.sin(lt * 0.9 + q.ph)), x = mx + 10 * Math.sin(lt * 0.5 + q.ph);
      q.e.setAttribute('d', `M${f1(x - w)} ${q.y}L${f1(x + w)} ${q.y}`);
      q.e.setAttribute('stroke-opacity', (a * (0.32 + 0.22 * Math.sin(lt * 1.2 + q.ph * 2))).toFixed(3));
    } } };
  }
  function lakeFront(g) {
    const fg = el(g, 'g');
    P0(fg, FRONT_TOP + 'L1380 2100L-300 2100Z', C.paperDark, 1);
    L0(fg, FRONT_TOP, C.inkSoft, 2.5, 0.5);
    let gr = ''; const r = rng(9);
    for (let i = 0; i < 46; i++) { const x = r() * 1080, y = 1560 + r() * 360, h = 20 + r() * 40, s = (r() - 0.5) * 22;
      gr += `M${f1(x)} ${f1(y)}Q${f1(x + s * 0.3)} ${f1(y - h * 0.6)} ${f1(x + s)} ${f1(y - h)}`; }
    L0(fg, gr, C.inkSoft, 2, 0.25);
    // reed silhouettes in the two lower corners, standing into the water; they sway very slowly
    const reeds = [];
    for (const [x0, x1, seed] of [[-20, 250, 3], [840, 1100, 4]]) {
      const rr = rng(seed), rg = el(fg, 'g');
      let d = '', lf = '';
      for (let i = 0; i < 16; i++) { const x = x0 + rr() * (x1 - x0), b = 1600 + rr() * 120, h = 180 + rr() * 220, s = (rr() - 0.5) * 50;
        d += `M${f1(x)} ${f1(b)}Q${f1(x + s * 0.2)} ${f1(b - h * 0.5)} ${f1(x + s)} ${f1(b - h)}`;
        if (i % 3 === 0) lf += `M${f1(x + s * 0.4)} ${f1(b - h * 0.6)}l${f1(-12 - s * 0.2)} -30l4 -26l12 50Z`; }
      L0(rg, d, mix(C.paperDark, C.inkSoft, 0.35), 5, 1);
      P0(rg, lf, mix(C.paperDark, C.inkSoft, 0.35), 1);
      reeds.push({ rg, cx: (x0 + x1) / 2 });
    }
    return { update(lt) { reeds.forEach((q, i) => q.rg.setAttribute('transform', `translate(${f1(q.cx)} 1700) skewX(${f1(1.6 * Math.sin(lt * 0.7 + i * 2))}) translate(${f1(-q.cx)} -1700)`)); } };
  }

  SH.bt_ny_lake = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'hook';
      if (mode === 'red') {
        const Wd = lakeWorld(g, svg, defs, { dawn: true, water: mix(C.paperLight, C.blue, 0.5) });
        // muddy red-brown swirls rising from the middle, spreading until they cover the whole lake
        const r = rng(61), blobs = [];
        const tones = [mix(C.red, C.paperDark, 0.42), mix(mix(C.red, C.gold, 0.3), C.paperDark, 0.45), mix(C.red, C.paperDark, 0.55)];
        for (let i = 0; i < 9; i++) {
          const pts = []; for (let k = 0; k < 11; k++) pts.push(0.65 + r() * 0.55);
          blobs.push({ e: P0(Wd.inLake, '', tones[i % 3], 0.95), sw: L0(Wd.inLake, '', mix(C.red, C.ink, 0.3), 3, 0.35),
            cx: 540 + (r() - 0.5) * 360 * (i ? 1 : 0), cy: 1180 + (r() - 0.5) * 180 * (i ? 1 : 0), R: 120 + r() * 120, pts, ph: r() * TAU, d0: i * 0.06 });
        }
        const ripples = []; for (let i = 0; i < 7; i++) ripples.push({ e: L0(Wd.inLake, '', C.ink, 2, 0.22), y: HZ + 60 + i * 70, x: 140 + (i * 173) % 800 });
        const front = lakeFront(g);
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.45);
            for (const b of blobs) {
              const n = BTL.ease(lt, at - 0.4 + b.d0, Math.max(1.4, dur - at + 0.1)), s = n * (b.R > 0 ? 4.2 : 1), rot = b.ph + lt * 0.12;
              if (n < 0.002) { b.e.setAttribute('d', ''); b.sw.setAttribute('d', ''); continue; }
              const P = b.pts.map((k, j) => { const a = rot + j / b.pts.length * TAU; return [b.cx + Math.cos(a) * b.R * k * s, b.cy + Math.sin(a) * b.R * k * s * 0.5]; });
              b.e.setAttribute('d', closedSmooth(P));
              let sp = ''; for (let j = 0; j <= 24; j++) { const a = rot * 1.5 + j * 0.32, rr = b.R * s * 0.75 * j / 24; sp += (j ? 'L' : 'M') + f1(b.cx + Math.cos(a) * rr) + ' ' + f1(b.cy + Math.sin(a) * rr * 0.5); }
              b.sw.setAttribute('d', sp);
            }
            for (const q of ripples) { const x = q.x + 30 * Math.sin(lt * 0.5 + q.y); q.e.setAttribute('d', `M${f1(x - 70)} ${q.y}L${f1(x + 70)} ${q.y}`); }
            Wd.dawn.set(0.2 + 0.12 * BTL.ease(lt, 0, dur));
            front.update(lt);
          },
        };
      }
      if (mode === 'calm') {
        const Wd = lakeWorld(g, svg, defs, { stars: true, moon: [760, 620] });
        const gl = glint(Wd.inLake, 760);
        // the degassing fountain, small at the middle of the lake
        const FX = 470, FY = 1060;
        P0(g, `M${FX - 40} ${FY}L${FX + 40} ${FY}L${FX + 34} ${FY + 10}L${FX - 34} ${FY + 10}Z`, C.paperLight, 1);
        L0(g, `M${FX - 40} ${FY}L${FX + 40} ${FY}L${FX + 34} ${FY + 10}L${FX - 34} ${FY + 10}Z`, C.ink, 2, 0.8);
        const jet = L0(g, '', C.ink, 3.5, 0.75);
        const spray = veil(g, { x0: FX - 50, x1: FX + 50, y: FY, h: 40, alpha: 0.2, seed: 7, color: C.ink, taper: 1 });
        const rings = []; for (let i = 0; i < 3; i++) rings.push({ e: L0(Wd.inLake, '', C.inkSoft, 2, 0.4), ph: i / 3 });
        const front = lakeFront(g);
        return {
          update(lt) {
            Wd.stars.update(lt * 3); gl.update(lt);
            const h = 150 + 8 * Math.sin(lt * 1.3);
            jet.setAttribute('d', `M${FX} ${FY}L${f1(FX + 2 * Math.sin(lt * 0.9))} ${f1(FY - h)}`);
            spray.update(lt * 1.5);
            for (const q of rings) { const u = (q.ph + lt * 0.2) % 1, rx = 60 + 260 * u;
              q.e.setAttribute('d', BTL.E(FX, FY + 14, rx, rx * 0.18)); q.e.setAttribute('stroke-opacity', (0.4 * (1 - u)).toFixed(3)); }
            Wd.moonGlow.set(0.28 + 0.03 * Math.sin(lt * 0.7));
            front.update(lt);
          },
        };
      }
      // hook: night; soft uneven billows of gas stand on the black water, drifting right; on "nefes" the right side
      // swells and a tongue spills over the right-hand rim and down the slope. Nothing is drawn below the gas base.
      // The hook doubles as the cover and plays at ~1/3 speed under it (lt runs ~2.0 -> 2.8): inner clocks run fast.
      const Wd = lakeWorld(g, svg, defs, { stars: true, moon: [270, 680] });
      const gl = glint(Wd.inLake, 250);
      const BASE = 1170;
      // the right-hand rim: the ridge shoulder coming down to the near shore
      const RIM = 'M880 1178C940 1150 1010 1146 1070 1176C1130 1210 1170 1330 1200 1500L1200 1700L1010 1700L1010 1510C980 1400 930 1260 880 1178Z';
      // gas: one lobed mass (union of billows) on the waterline, drawn as soft nested layers in one vertical gradient
      // (bright at the base, gone at the top); nothing below the waterline
      const gid = 'nyG' + (++uid), lg = el(defs, 'linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: BASE - 780, x2: 0, y2: BASE + 160 });
      el(lg, 'stop', { offset: '0', 'stop-color': C.ink, 'stop-opacity': 0 });
      el(lg, 'stop', { offset: '0.45', 'stop-color': C.ink, 'stop-opacity': 0.1 });
      el(lg, 'stop', { offset: '0.8', 'stop-color': C.ink, 'stop-opacity': 0.34 });
      el(lg, 'stop', { offset: '1', 'stop-color': C.ink, 'stop-opacity': 0 });
      const BIL = [[400, 100, 220], [520, 160, 420], [670, 210, 620], [830, 180, 500], [950, 130, 320]];
      const NL = 7, layers = [];
      for (let m = 0; m < NL; m++) layers.push(el(g, 'path', { d: '', fill: `url(#${gid})`, 'fill-opacity': 0.42 }));
      const mass = (lt, sw) => {
        const B = BIL.map(([cx, rx, ry], i) => { const k = (1 + 0.05 * Math.sin(lt * 2.4 + i * 1.7)) * (cx > 650 ? 1 + 0.32 * sw : 1);
          return [cx + 16 * lt + (cx > 650 ? 50 * sw : 0), rx * k, ry * k]; });
        const xs = [], hs = [];
        for (let x = 120; x <= 1160; x += 16) {
          let h = 0; for (const [cx, rx, ry] of B) { const u = (x - cx) / rx; if (Math.abs(u) < 1) h = Math.max(h, ry * Math.sqrt(1 - u * u)); }
          xs.push(x); hs.push(h);
        }
        return { xs, hs };
      };
      P0(g, RIM, mix(C.paperDark, C.paper, 0.55), 1);
      // the tongue over the rim and down its face (soft nested layers, same light)
      const tid = 'nyT' + (++uid), tg = el(defs, 'linearGradient', { id: tid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 1000, x2: 0, y2: 1660 });
      el(tg, 'stop', { offset: '0', 'stop-color': C.ink, 'stop-opacity': 0.3 });
      el(tg, 'stop', { offset: '1', 'stop-color': C.ink, 'stop-opacity': 0.03 });
      const tongue = [0, 1, 2, 3].map(() => el(g, 'path', { d: '', fill: `url(#${tid})`, 'fill-opacity': 0.5 }));
      const front = lakeFront(g);
      const ds = motes(g, 23, 30, [380, 700, 1000, BASE], { alpha: 0.35, size: 2.4, up: true, color: C.ink });
      return {
        update(lt, dur, cues) {
          const sw = BTL.ease(lt, 2.1, 0.7), M = mass(lt, sw), n = M.xs.length;
          let lo = 0, hi = n - 1; while (lo < n && M.hs[lo] < 1) lo++; while (hi > 0 && M.hs[hi] < 1) hi--;
          const mid = (M.xs[lo] + M.xs[hi]) / 2;
          // soft ends: the mass thins out to nothing at both sides (no vertical edges)
          for (let i = lo; i <= hi; i++) { const u = clamp01(Math.min(M.xs[i] - M.xs[lo], M.xs[hi] - M.xs[i]) / 180); M.hs[i] *= u * u * (3 - 2 * u); }
          layers.forEach((e, m) => {
            const kv = 1 - m * 0.12, kh = 1 - m * 0.05, pts = [];
            for (let i = lo; i <= hi; i++) pts.push([mid + (M.xs[i] - mid) * kh, BASE - M.hs[i] * kv]);
            if (pts.length < 3) { e.setAttribute('d', ''); return; }
            // below the waterline the mass closes in a shallow rounded foot that fades out in the gradient (no cut)
            const xa = pts[0][0], xb = pts[pts.length - 1][0], xm = (xa + xb) / 2, dep = 120 * kv;
            e.setAttribute('d', `M${f1(xa)} ${BASE}` + smoothOpen(pts).replace(/^M/, 'L') + `L${f1(xb)} ${BASE}` +
              `C${f1(xb)} ${f1(BASE + dep * 0.6)} ${f1(xm + (xb - xm) * 0.6)} ${f1(BASE + dep)} ${f1(xm)} ${f1(BASE + dep)}` +
              `C${f1(xm - (xm - xa) * 0.6)} ${f1(BASE + dep)} ${f1(xa)} ${f1(BASE + dep * 0.6)} ${f1(xa)} ${BASE}Z`);
          });
          // tongue: from the gas by the rim, over its crest, down its face towards the near shore
          const p = 0.12 + 0.88 * sw, y2 = 1200 + 380 * p, wv = 10 * Math.sin(lt * 2);
          tongue.forEach((e, m) => { const k = 1 - m * 0.18;
            e.setAttribute('d', `M${f1(930 - 40 * k)} ${BASE}C${f1(950 - 20 * k)} ${f1(1140 - 20 * k)} ${f1(1000)} ${f1(1120 - 30 * k)} ${f1(1060 + 20 * k)} ${f1(1146 - 20 * k)}` +
              `C${f1(1110 + 40 * k)} ${f1(1200 + 80 * p)} ${f1(1130 + wv)} ${f1(y2 - 60)} ${f1(1080 + 60 * k * p)} ${f1(y2 * (0.9 + 0.1 * k))}` +
              `C${f1(1040 + wv)} ${f1(y2 * (0.9 + 0.1 * k) + 10)} ${f1(1000)} ${f1(y2 - 120)} ${f1(980)} ${f1(Math.max(BASE, y2 - 260 * k))}C970 ${BASE + 10} 950 ${BASE} ${f1(930 - 40 * k)} ${BASE}Z`); });
          Wd.stars.update(lt * 8); gl.update(lt * 3);
          Wd.moonGlow.set(0.3 + 0.03 * Math.sin(lt * 2));
          ds.update(lt * 16);
          front.update(lt * 3);
        },
      };
    },
  };
  // ------------------------------------------------------------------ Africa, Cameroon
  const AFR = [[-5.8, 35.8], [-2, 35.1], [1, 36.5], [5, 36.8], [10, 37.2], [11, 35.2], [10.4, 34], [11.5, 33.1], [15.2, 32.3], [18.5, 30.3],
    [20, 31], [20.2, 32.4], [23, 32.6], [25.2, 31.6], [29, 30.9], [32.3, 31.3], [34.2, 31.3], [34.9, 29.5], [32.6, 29.9], [33.6, 27.6],
    [35.4, 24.2], [37.2, 21], [38.6, 17.8], [39.6, 15.4], [41.6, 13.4], [43.3, 12.5], [44.6, 10.4], [47.6, 11.2], [51.2, 11.8], [51.1, 10.4],
    [49.6, 7.4], [48, 4.6], [46, 2], [43.2, -0.8], [41.2, -2], [39.6, -4.6], [39.3, -6.8], [39.6, -9.6], [40.5, -11], [40.6, -15],
    [37.4, -18], [35.2, -21.6], [35.5, -24], [32.8, -25.9], [32.6, -28.6], [30.6, -30.8], [28, -32.8], [25.6, -34], [22.5, -33.9], [20, -34.8],
    [18.4, -34.1], [18.2, -32], [16.5, -28.6], [15.2, -27], [14.5, -22.9], [13.4, -20.8], [11.8, -17.3], [12.2, -14.5], [13.6, -12.2], [13.2, -9.2],
    [12.2, -6], [11.8, -3.8], [9.4, -0.8], [9.4, 1.6], [9.8, 3.3], [9.2, 4], [8.5, 4.6], [7, 4.4], [5.8, 4.4], [4.4, 6.4], [2.6, 6.3], [1, 6],
    [-1.8, 4.8], [-4, 5.2], [-7.6, 4.4], [-9.4, 5.4], [-11.4, 6.9], [-13.2, 8.6], [-15, 10.8], [-16.8, 12.6], [-17.2, 14.7], [-16.4, 16.8],
    [-16.2, 19.8], [-17, 21.2], [-15.8, 23.8], [-14.4, 26.2], [-13, 27.8], [-11, 28.6], [-9.8, 30], [-9.6, 32.6], [-8.4, 33.4], [-6.8, 34.2]];
  const MAD = [[49.3, -12], [50.4, -15.4], [49.7, -17.2], [48.6, -20.6], [47.1, -24.9], [45.2, -25.5], [43.7, -23.5], [44.3, -20], [44.1, -17], [46.3, -15.7], [48, -13.6]];
  function closedSmooth(pts) {
    const n = pts.length, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], s0 = m(pts[n - 1], pts[0]);
    let d = `M${f1(s0[0])} ${f1(s0[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], e = m(p, pts[(i + 1) % n]); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(e[0])} ${f1(e[1])}`; }
    return d + 'Z';
  }
  SH.bt_ny_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), SC = 12.2, LON = 17, LAT = 1;
      const X = lon => 540 + (lon - LON) * SC, Y = lat => 660 - (lat - LAT) * SC;
      BTL.glow(svg, defs, 540, 660, 620, C.stain, 0.12, g);
      let grat = '';
      for (let lon = -20; lon <= 55; lon += 10) grat += `M${f1(X(lon))} 120L${f1(X(lon))} 1150`;
      for (let lat = -40; lat <= 40; lat += 10) grat += `M40 ${f1(Y(lat))}L1040 ${f1(Y(lat))}`;
      L0(g, grat, C.inkSoft, 1.5, 0.16);
      const land = closedSmooth(AFR.map(([a, b]) => [X(a), Y(b)])) + closedSmooth(MAD.map(([a, b]) => [X(a), Y(b)]));
      P0(g, land, C.paperLight, 1);
      const coast = L0(g, land, C.inkSoft, 2.6, 0.9, { pathLength: 1 }); draw(coast, 0);
      const nx = X(10.3), ny = Y(6.44);
      const pg = el(g, 'g', { opacity: 0 });
      const ring = el(pg, 'circle', { cx: nx, cy: ny, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
      const glow = BTL.glow(svg, defs, nx, ny, 90, C.gold, 0.35, pg);
      el(pg, 'circle', { cx: nx, cy: ny, r: 10, fill: C.gold });
      const halo = { stroke: C.paper, 'stroke-width': 12, 'stroke-linejoin': 'round', 'paint-order': 'stroke' };
      const lab = svgText(g, P.label || 'Kamerun', nx + 40, ny + 18, 62, Object.assign({ fill: C.ink, 'font-family': BTL.FR, 'font-weight': 500, opacity: 0 }, halo));
      const sub = svgText(g, P.sub || '', nx + 40, ny + 78, 48, Object.assign({ fill: C.gold, 'font-family': BTL.LO, 'font-style': 'italic', opacity: 0 }, halo));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          draw(coast, BTL.ease(lt, 0, 1.4));
          fade(pg, BTL.ease(lt, 0.2, 0.6)); fade(lab, BTL.ease(lt, 0.3, 0.8)); fade(sub, BTL.ease(lt, at - 0.3, 0.8));
          const ph = ((lt % 1.8) + 1.8) % 1.8 / 1.8;
          ring.setAttribute('r', f1(16 + 34 * ph)); ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.9));
          glow.set(0.3 + 0.12 * Math.sin(lt * 2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the lake in cross-section
  const SY = 560;
  const BOWL = `M40 ${SY}C110 760 220 960 380 1050C470 1094 610 1094 700 1050C860 960 970 760 1040 ${SY}Z`;
  function section(g, svg, defs) {
    const S = {};
    S.stars = BTL.stars(g, 60, 5, [0, 60, 1080, 420]);
    P0(g, `M-300 ${SY}L-300 450C-140 430 -40 470 40 ${SY}L1040 ${SY}C1120 470 1220 440 1380 455L1380 ${SY}Z`, mix(C.paperDark, C.paper, 0.35), 1);
    // ground around the bowl, with faint strata and the warm deep below
    P0(g, `M-300 2100L-300 450C-140 430-40 470 40 ${SY}C110 760 220 960 380 1050C470 1094 610 1094 700 1050C860 960 970 760 1040 ${SY}C1120 470 1220 440 1380 455L1380 2100Z`, C.paperLight, 1);
    S.magma = BTL.glow(svg, defs, 540, 1720, 560, C.red, 0.22, g);
    let st = ''; for (let i = 0; i < 7; i++) { const y = 640 + i * 150;
      st += `M-300 ${y}C0 ${y + 30} 200 ${y - 20} 540 ${y + 10}C860 ${y + 40} 1100 ${y - 10} 1380 ${y + 14}`; }
    L0(g, st, C.inkSoft, 1.5, 0.18);
    L0(g, 'M540 1094C530 1200 556 1320 536 1460C526 1540 548 1600 540 1680', C.red, 3, 0.45);
    const bid = 'nyB' + (++uid);
    el(el(defs, 'clipPath', { id: bid }), 'path', { d: BOWL });
    P0(g, BOWL, NIGHTWATER(), 1);
    S.inBowl = el(g, 'g', { 'clip-path': `url(#${bid})` });
    P0(S.inBowl, `M0 760L1080 760L1080 1100L0 1100Z`, DEEP(), 1);
    S.layer = P0(S.inBowl, '', mix(C.paper, C.stain, 0.4), 1);
    S.layerTop = L0(S.inBowl, '', C.stain, 2.5, 0.8, { 'stroke-dasharray': '10 12' });
    const r = rng(77); S.bub = [];
    for (let i = 0; i < 90; i++) S.bub.push({ e: P0(S.inBowl, '', C.ink, 0.3), x: 120 + r() * 840, y: r(), s: 2 + r() * 3, ph: r() * TAU });
    S.seep = []; for (let i = 0; i < 8; i++) S.seep.push({ e: P0(S.inBowl, '', C.ink, 0.5), ph: i / 8 });
    L0(g, BOWL.slice(0, -1), C.ink, 3, 0.8);
    L0(g, `M-300 450C-140 430-40 470 40 ${SY}M1040 ${SY}C1120 470 1220 440 1380 455`, C.inkSoft, 2.5, 0.7);
    S.surf = L0(g, `M40 ${SY}L1040 ${SY}`, C.ink, 3, 0.9);
    S.update = (lt, top, on = 1) => {
      S.layer.setAttribute('d', `M0 ${f1(top + 6 * Math.sin(lt * 0.5))}C300 ${f1(top - 10)} 700 ${f1(top + 12)} 1080 ${f1(top)}L1080 1100L0 1100Z`);
      S.layerTop.setAttribute('d', `M0 ${f1(top + 6 * Math.sin(lt * 0.5))}C300 ${f1(top - 10)} 700 ${f1(top + 12)} 1080 ${f1(top)}`);
      S.layer.setAttribute('fill-opacity', on.toFixed(3)); S.layerTop.setAttribute('stroke-opacity', (0.8 * on).toFixed(3));
      for (const q of S.bub) { const y = top + 20 + q.y * (1090 - top - 20) - 6 * Math.sin(lt * 0.4 + q.ph);
        q.e.setAttribute('d', BTL.E(q.x + 4 * Math.sin(lt * 0.3 + q.ph), y, q.s, q.s)); q.e.setAttribute('fill-opacity', (0.32 * on).toFixed(3)); }
      for (const q of S.seep) { const u = (q.ph + lt * 0.18) % 1, y = 1094 - u * 140;
        q.e.setAttribute('d', BTL.E(540 + 6 * Math.sin(u * 9), y, 3 + 2 * u, 3 + 2 * u)); q.e.setAttribute('fill-opacity', (0.6 * Math.sin(Math.PI * u) * on).toFixed(3)); }
      S.stars.update(lt * 3);
      S.magma.set(0.2 + 0.04 * Math.sin(lt * 0.8));
    };
    return S;
  }
  SH.bt_ny_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'still';
      const S = section(g, svg, defs);
      if (mode === 'burst') {
        const r = rng(91), col = [];
        const plume = el(S.inBowl, 'g');
        for (let i = 0; i < 140; i++) col.push({ e: P0(plume, '', C.ink, 0), u: r(), v: 0.35 + r() * 0.35, side: r() * 2 - 1, s: 3 + r() * 6 });
        const dome = P0(g, '', NIGHTWATER(), 1), domeL = L0(g, '', C.ink, 3, 0.9);
        const cloud = [
          veil(g, { x0: 140, x1: 940, y: SY + 4, h: 430, alpha: 0.12, seed: 5, lean: 40 }),
          veil(g, { x0: 220, x1: 860, y: SY + 4, h: 300, alpha: 0.18, seed: 6, lean: 20 }),
        ];
        const spray = []; for (let i = 0; i < 26; i++) spray.push({ e: P0(g, '', C.ink, 0), a: (i / 25 - 0.5) * 2.2, v: 0.7 + r() * 0.5 });
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.55), rise = BTL.ease(lt, 0.1, Math.max(0.8, at - 0.1)), d = BTL.ease(lt, at - 0.35, 1.0);
            S.update(lt, 900 + 60 * rise, 1 - 0.35 * rise);
            const front = 1040 - rise * 500;
            for (const q of col) { const u = (q.u + lt * q.v) % 1, y = 1040 - u * 480;
              const wdt = 30 + (1040 - y) * 0.32, x = 540 + q.side * wdt;
              const vis = y >= front - 10 ? 1 : 0;
              q.e.setAttribute('d', BTL.E(x, y, q.s, q.s)); q.e.setAttribute('fill-opacity', (vis * 0.55 * (0.4 + 0.6 * rise)).toFixed(3)); }
            const hgt = 150 * d * (1 - 0.25 * BTL.ease(lt, at + 0.9, 1.6));
            const dd = `M300 ${SY}C380 ${f1(SY - hgt * 0.2)} 440 ${f1(SY - hgt)} 540 ${f1(SY - hgt)}C640 ${f1(SY - hgt)} 700 ${f1(SY - hgt * 0.2)} 780 ${SY}Z`;
            dome.setAttribute('d', hgt > 1 ? dd : ''); domeL.setAttribute('d', hgt > 1 ? dd.slice(0, -1) : '');
            cloud.forEach((v, i) => v.update(lt * (1.4 + 0.4 * i), 0.15 + 0.85 * BTL.ease(lt, at - 0.1, 2.0)));
            for (const q of spray) { const p = clamp01((lt - at + 0.1) * q.v * 0.7), x = 540 + q.a * 220 * p, y = SY - 150 * d - 260 * q.v * p + 300 * p * p;
              q.e.setAttribute('d', BTL.E(x, y, 4, 4)); q.e.setAttribute('fill-opacity', (0.6 * Math.sin(Math.PI * p)).toFixed(3)); }
          },
        };
      }
      const label = svgText(g, 'CO₂', 540, 1012, 84, { fill: C.ink, 'font-family': BTL.FR, 'font-weight': 400, 'font-style': 'italic', 'text-anchor': 'middle', opacity: 0 });
      const glow = BTL.glow(svg, defs, 540, 980, 420, C.stain, 0, g);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), n = BTL.ease(lt, at - 0.2, 1.2);
          S.update(lt, 980 - 110 * BTL.ease(lt, 0, dur));
          fade(label, n); glow.set(0.22 * n + 0.03 * Math.sin(lt));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the valleys below: a contour map
  const VCP = [[540, 200], [600, 360], [490, 540], [560, 740], [470, 950], [540, 1130], [480, 1450], [520, 1950]];
  function spline(cp, steps = 18) {
    const out = [];
    for (let i = 0; i < cp.length - 1; i++) {
      const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
      for (let s = 0; s < steps; s++) { const t = s / steps, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); }
    }
    out.push(cp[cp.length - 1]);
    return out;
  }
  // a small conical hut seen from the side (map icon) with a warm light at its door
  function hutIcon(g, svg, defs, x, y) {
    const d = `M${x - 15} ${y}L${x - 15} ${y - 16}L${x + 15} ${y - 16}L${x + 15} ${y}Z`, roof = `M${x - 22} ${y - 14}L${x} ${y - 44}L${x + 22} ${y - 14}Z`;
    P0(g, d, C.paperLight, 1); P0(g, roof, mix(C.paperLight, C.stain, 0.2), 1);
    L0(g, d + roof, C.ink, 2, 0.9);
    const gl = BTL.glow(svg, defs, x, y - 6, 44, C.gold, 0.85, g);
    const dot = P0(g, `M${x - 4} ${y}L${x - 4} ${y - 9}L${x + 4} ${y - 9}L${x + 4} ${y}Z`, C.gold, 1);
    return { gl, dot };
  }
  SH.bt_ny_valley = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g');
      const line = spline(VCP), N = line.length;
      const nrm = line.map((p, i) => { const a = line[Math.max(0, i - 1)], b = line[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
      const idxY = y => { let b = 0; for (let i = 0; i < N; i++) if (Math.abs(line[i][1] - y) < Math.abs(line[b][1] - y)) b = i; return b; };
      // contour lines: each crosses the valley in a V that points uphill (towards the lake); the V opens downhill
      let cont = '';
      for (let k = 0; k < 13; k++) {
        const y0 = 400 + k * 122, cx = line[idxY(y0)][0], w = 150 + k * 30, A = 60 + k * 10, pts = [];
        for (let x = -80; x <= 1160; x += 24) { const dx = Math.abs(x - cx), v = dx < w ? A * Math.pow(1 - dx / w, 1.15) : 0;
          pts.push([x, y0 - v + 10 * Math.sin(x * 0.007 + k * 1.3)]); }
        cont += smoothOpen(pts);
      }
      L0(g, cont, C.inkSoft, 2, 0.42);
      // the lake at the head of the valley, rings of steep ground round it
      L0(g, BTL.E(540, 196, 300, 190) + BTL.E(540, 196, 240, 150), C.inkSoft, 2, 0.35);
      P0(g, BTL.E(540, 196, 170, 104), mix(C.paper, C.blue, 0.2), 1); L0(g, BTL.E(540, 196, 170, 104), C.ink, 3, 0.85);
      L0(g, smoothOpen(line.slice(5)), C.blue, 2, 0.5, { 'stroke-dasharray': '8 10' });
      // the gas tongue (three soft layers), widening downhill
      const tongue = [[1.6, 0.11], [1.2, 0.17], [0.8, 0.26]].map(([w, a]) => ({ w, e: P0(g, '', GAS(), a) }));
      // three villages of small huts close to the valley floor
      const r = rng(13), huts = [];
      for (const [vy, n] of [[480, 3], [790, 4], [1060, 4]]) {
        for (let h = 0; h < n; h++) {
          const sd = h % 2 ? 1 : -1, i = idxY(vy + (r() - 0.5) * 50), off = sd * (34 + r() * 26) * (1 + (line[i][1] - 400) / 1400);
          const x = line[i][0] + nrm[i][0] * off, y = line[i][1] + nrm[i][1] * off + 22;
          huts.push(Object.assign({ i: idxY(y - 20) }, hutIcon(g, svg, defs, x, y)));
        }
      }
      const lastI = Math.max(...huts.map(q => q.i));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          // the front reaches the last hut as "aşağı" is spoken, then keeps creeping on
          const fi = 6 + (lastI + 3 - 6) * BTL.ease(lt, 0, Math.max(1, at + 0.1)) + (N - lastI - 6) * 0.35 * BTL.ease(lt, at + 0.1, Math.max(0.5, dur - at));
          const end = Math.max(8, Math.floor(fi));
          for (const L of tongue) {
            const left = [], right = [];
            for (let i = 6; i <= end; i++) {
              const u = i / (N - 1), tip = clamp01((fi - i) / 6), w = L.w * (30 + 170 * u + 12 * Math.sin(i * 0.17 - lt * 0.8)) * (0.35 + 0.65 * Math.sqrt(tip));
              left.push([line[i][0] + nrm[i][0] * w, line[i][1] + nrm[i][1] * w]); right.push([line[i][0] - nrm[i][0] * w, line[i][1] - nrm[i][1] * w]);
            }
            L.e.setAttribute('d', smoothOpen(left.concat(right.reverse())) + 'Z');
          }
          huts.forEach((q, j) => { const k = 1 - clamp01((fi - q.i) / 3);
            q.gl.set(k * (0.75 + 0.1 * Math.sin(lt * 2.4 + j))); q.dot.setAttribute('fill', mix(C.paperDark, C.gold, k)); });
        },
      };
    },
  };
  // ------------------------------------------------------------------ dawn, one hut, a cold hearth
  SH.bt_ny_hut = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1080;
      const dawn = BTL.glow(svg, defs, 860, FY - 20, 760, C.stain, 0.18, g);
      L0(g, `M-300 ${FY - 6}L1380 ${FY - 6}`, C.stain, 3, 0.5);
      const hills = `M-300 ${FY}L-300 960C-150 940-40 900 90 910C200 918 260 950 360 948C480 946 560 904 700 908C840 912 920 950 1060 944C1180 940 1280 920 1380 930L1380 ${FY}Z`;
      P0(g, hills, mix(C.paperDark, C.paper, 0.4), 1);
      P0(g, `M-300 2100L-300 ${FY}L1380 ${FY}L1380 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${FY}L1380 ${FY}`, C.inkSoft, 2.5, 0.55);
      // the hut: mud wall (a short cylinder), dark doorway, conical thatch roof
      const wall = `M330 ${FY - 250}L330 ${FY - 10}C420 ${FY + 14} 660 ${FY + 14} 750 ${FY - 10}L750 ${FY - 250}Z`;
      P0(g, wall, C.paperLight, 1);
      let mud = ''; for (let i = 0; i < 4; i++) { const y = FY - 200 + i * 50; mud += `M336 ${y}C430 ${y + 18} 650 ${y + 18} 744 ${y}`; }
      L0(g, mud, C.inkSoft, 1.5, 0.35);
      const door = `M488 ${FY + 2}L488 ${FY - 150}C488 ${FY - 200} 592 ${FY - 200} 592 ${FY - 150}L592 ${FY + 2}Z`;
      P0(g, door, C.paperDark, 1); L0(g, door.slice(0, -1), C.ink, 2.5, 0.8);
      L0(g, wall.slice(0, -1), C.ink, 3, 0.9);
      const roof = `M250 ${FY - 236}C360 ${FY - 220} 720 ${FY - 220} 830 ${FY - 236}L548 ${FY - 560}Z`;
      P0(g, roof, mix(C.paperLight, C.stain, 0.14), 1);
      let th = ''; for (let i = 0; i <= 14; i++) { const u = i / 14, x = 250 + 580 * u, y = FY - 236 + 16 * Math.sin(Math.PI * u);
        th += `M${f1(548 + (x - 548) * 0.12)} ${f1(FY - 560 + (y - FY + 560) * 0.12)}L${f1(x)} ${f1(y)}`; }
      L0(g, th, C.inkSoft, 1.5, 0.45);
      L0(g, `M260 ${FY - 258}C360 ${FY - 244} 720 ${FY - 244} 820 ${FY - 258}M300 ${FY - 300}C390 ${FY - 288} 700 ${FY - 288} 790 ${FY - 300}`, C.inkSoft, 2, 0.5);
      L0(g, roof.slice(0, -1) + 'Z', C.ink, 3, 0.9);
      L0(g, `M548 ${FY - 560}L548 ${FY - 600}`, C.ink, 4, 0.9);
      // the foreground: a trodden path from the door down towards the viewer, tufts of grass, a few stones
      const path = `M486 ${FY + 4}L594 ${FY + 4}C640 1300 760 1620 900 2100L180 2100C320 1620 440 1300 486 ${FY + 4}Z`;
      P0(g, path, C.paperLight, 0.55);
      L0(g, `M486 ${FY + 4}C440 1300 320 1620 180 2100M594 ${FY + 4}C640 1300 760 1620 900 2100`, C.inkSoft, 2, 0.45);
      { const r = rng(21); let tf = '', st = '';
        for (let i = 0; i < 70; i++) { const y = 1110 + r() * 800, side = r() < 0.5, x = side ? r() * (260 - (y - 1100) * 0.08) : 1080 - r() * (260 - (y - 1100) * 0.08), h = 14 + (y - 1080) * 0.05;
          tf += `M${f1(x - 8)} ${f1(y)}L${f1(x - 3)} ${f1(y - h)}M${f1(x)} ${f1(y)}L${f1(x + 1)} ${f1(y - h * 1.3)}M${f1(x + 8)} ${f1(y)}L${f1(x + 5)} ${f1(y - h)}`; }
        for (let i = 0; i < 7; i++) { const y = 1250 + i * 95, x = 360 + (y - 1100) * -0.05 + r() * 300, w = 16 + (y - 1100) * 0.03;
          st += BTL.E(x, y, w, w * 0.45); }
        L0(g, tf, C.inkSoft, 2, 0.4); P0(g, st, C.paperDark, 0.9); L0(g, st, C.inkSoft, 1.5, 0.5); }
      // the hearth: three stones and a pot, cold
      const hx = 880, hy = FY + 40;
      P0(g, BTL.E(hx - 52, hy, 26, 18) + BTL.E(hx + 52, hy, 26, 18) + BTL.E(hx, hy + 14, 26, 16), C.paperLight, 1);
      L0(g, BTL.E(hx - 52, hy, 26, 18) + BTL.E(hx + 52, hy, 26, 18) + BTL.E(hx, hy + 14, 26, 16), C.ink, 2.5, 0.8);
      const pot = `M${hx - 70} ${hy - 96}C${hx - 80} ${hy - 30} ${hx - 50} ${hy - 4} ${hx} ${hy - 4}C${hx + 50} ${hy - 4} ${hx + 80} ${hy - 30} ${hx + 70} ${hy - 96}Z`;
      P0(g, pot, mix(C.paperLight, C.paperDark, 0.3), 1); L0(g, pot, C.ink, 3, 0.9);
      L0(g, BTL.E(hx, hy - 96, 70, 12), C.ink, 3, 0.9);
      const ember = BTL.glow(svg, defs, hx, hy + 4, 70, C.gold, 0.35, g);
      const smoke = wisps(g, [[hx - 18, hy - 110], [hx + 14, hy - 112]], { h: 420, amp: 30, alpha: 0.35, w: 4, color: C.inkSoft });
      const mist = [
        veil(g, { x0: -100, x1: 1180, y: FY + 120, h: 120, alpha: 0.1, seed: 8, taper: 0.3 }),
        veil(g, { x0: -60, x1: 1140, y: FY + 160, h: 80, alpha: 0.14, seed: 9, taper: 0.3 }),
      ];
      return {
        update(lt, dur, cues) {
          // the last smoke and the ember are fully out by the time "uyanmadı" is spoken
          const at = cue(cues, 'hit', dur * 0.6), out = BTL.ease(lt, Math.max(0.3, at - 1.4), 1.2);
          smoke.update(lt * 1.2, 1 - out);
          ember.set(0.3 * (1 - out) + 0.05 * (1 - out) * Math.sin(lt * 3));
          dawn.set(0.16 + 0.14 * BTL.ease(lt, 0, dur));
          mist.forEach((v, i) => v.update(lt * (0.8 + 0.3 * i)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ today: the degassing raft
  SH.bt_ny_pipe = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), SYp = 860, X0 = 540;
      const stars = BTL.stars(g, 70, 44, [0, 60, 1080, 700]);
      P0(g, `M-300 ${SYp}L-300 760C-120 740 40 700 220 716C380 730 460 770 600 764C760 756 860 712 1000 720C1140 728 1260 750 1380 756L1380 ${SYp}Z`, mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, `M-300 760C-120 740 40 700 220 716C380 730 460 770 600 764C760 756 860 712 1000 720C1140 728 1260 750 1380 756`, C.inkSoft, 2, 0.45);
      // water below the surface, darker with depth, the gas layer far down
      P0(g, `M-300 ${SYp}L1380 ${SYp}L1380 2100L-300 2100Z`, NIGHTWATER(), 1);
      P0(g, `M-300 1300L1380 1300L1380 2100L-300 2100Z`, DEEP(), 1);
      P0(g, `M-300 1560C200 1540 800 1580 1380 1556L1380 2100L-300 2100Z`, mix(C.paper, C.stain, 0.32), 1);
      L0(g, `M-300 1560C200 1540 800 1580 1380 1556`, C.stain, 2.5, 0.7, { 'stroke-dasharray': '10 12' });
      // the pipe, from the raft down into the layer, bubbles running up inside it
      L0(g, `M${X0 - 10} ${SYp + 10}L${X0 - 10} 1700M${X0 + 10} ${SYp + 10}L${X0 + 10} 1700`, C.ink, 3, 0.8);
      const bub = []; for (let i = 0; i < 18; i++) bub.push({ e: L0(g, '', C.ink, 4, 0.6), ph: i / 18 });
      const glowTop = BTL.glow(svg, defs, X0, 420, 260, C.stain, 0.18, g);
      const rings = []; for (let i = 0; i < 3; i++) rings.push({ e: L0(g, '', C.inkSoft, 2, 0.5), ph: i / 3 });
      // the raft on its floats
      P0(g, `M${X0 - 170} ${SYp - 26}L${X0 + 170} ${SYp - 26}L${X0 + 170} ${SYp - 4}L${X0 - 170} ${SYp - 4}Z`, C.paperLight, 1);
      L0(g, `M${X0 - 170} ${SYp - 26}L${X0 + 170} ${SYp - 26}L${X0 + 170} ${SYp - 4}L${X0 - 170} ${SYp - 4}Z`, C.ink, 3, 0.9);
      for (const x of [X0 - 120, X0 + 120]) { P0(g, BTL.E(x, SYp + 4, 50, 14), C.paperLight, 1); L0(g, BTL.E(x, SYp + 4, 50, 14), C.ink, 2.5, 0.8); }
      L0(g, `M${X0 - 160} ${SYp - 26}L${X0 - 160} ${SYp - 76}L${X0 + 160} ${SYp - 76}L${X0 + 160} ${SYp - 26}M${X0 - 60} ${SYp - 26}L${X0 - 60} ${SYp - 76}M${X0 + 60} ${SYp - 26}L${X0 + 60} ${SYp - 76}`, C.inkSoft, 2.5, 0.8);
      P0(g, `M${X0 - 14} ${SYp - 26}L${X0 - 14} ${SYp - 100}L${X0 + 14} ${SYp - 100}L${X0 + 14} ${SYp - 26}Z`, C.paperLight, 1);
      L0(g, `M${X0 - 14} ${SYp - 26}L${X0 - 14} ${SYp - 100}L${X0 + 14} ${SYp - 100}L${X0 + 14} ${SYp - 26}`, C.ink, 3, 0.9);
      // the fountain: a central column, two thinner side threads, falling drops
      const jet = [L0(g, '', C.ink, 7, 0.8), L0(g, '', C.ink, 3, 0.5), L0(g, '', C.ink, 3, 0.5)];
      const r = rng(55), drops = [];
      for (let i = 0; i < 46; i++) drops.push({ e: L0(g, '', C.ink, 3, 0), ph: r(), v: 0.4 + r() * 0.4, dir: r() < 0.5 ? -1 : 1, sp: 60 + r() * 140 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), up = BTL.ease(lt, at - 0.3, 1.4);
          const top = SYp - 100 - (380 + 110 * up + 10 * Math.sin(lt * 1.7));
          const x0 = X0, wob = 6 * Math.sin(lt * 1.1);
          jet[0].setAttribute('d', `M${x0} ${SYp - 100}C${x0} ${f1(SYp - 260)} ${f1(x0 + wob)} ${f1(top + 120)} ${f1(x0 + wob)} ${f1(top)}`);
          jet[1].setAttribute('d', `M${x0 - 6} ${SYp - 100}C${x0 - 14} ${f1(SYp - 240)} ${f1(x0 - 26 + wob)} ${f1(top + 160)} ${f1(x0 - 34 + wob)} ${f1(top + 60)}`);
          jet[2].setAttribute('d', `M${x0 + 6} ${SYp - 100}C${x0 + 14} ${f1(SYp - 240)} ${f1(x0 + 26 + wob)} ${f1(top + 160)} ${f1(x0 + 34 + wob)} ${f1(top + 60)}`);
          jet[0].setAttribute('stroke-opacity', (0.7 + 0.2 * up).toFixed(3));
          for (const q of drops) { const p = (q.ph + lt * q.v) % 1, x = x0 + q.dir * q.sp * p, y = top + 20 + (SYp - 30 - top) * p * p;
            q.e.setAttribute('d', `M${f1(x)} ${f1(y)}l${f1(q.dir * 2)} 9`); q.e.setAttribute('stroke-opacity', (0.6 * Math.sin(Math.PI * Math.min(1, p * 1.2))).toFixed(3)); }
          for (const q of bub) { const u = (q.ph + lt * 0.35) % 1, y = 1690 - u * (1690 - SYp - 20);
            q.e.setAttribute('d', `M${X0} ${f1(y)}l0 -12`); q.e.setAttribute('stroke-opacity', (0.6 * Math.sin(Math.PI * u)).toFixed(3)); }
          for (const q of rings) { const u = (q.ph + lt * 0.25) % 1, rx = 200 + 360 * u;
            q.e.setAttribute('d', `M${f1(X0 - rx)} ${SYp + 6}C${f1(X0 - rx * 0.5)} ${SYp + 14 + 20 * u} ${f1(X0 + rx * 0.5)} ${SYp + 14 + 20 * u} ${f1(X0 + rx)} ${SYp + 6}`);
            q.e.setAttribute('stroke-opacity', (0.5 * (1 - u)).toFixed(3)); }
          glowTop.e.setAttribute('cy', f1(top + 40)); glowTop.set(0.16 + 0.1 * up);
          stars.update(lt * 3);
        },
      };
    },
  };
})();
