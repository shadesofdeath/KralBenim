// hd_dam: shots for the "Hoover Dam had to be refrigerated" Short (Stickstory 2026-11-02): curing concrete gets hot;
// poured as one block the dam would have taken ~125 years to cool and cracked, so it was poured in columns with
// ~582 miles of 1-inch steel pipe inside: river water first, then ice-cold water from a refrigeration plant on the
// lower cofferdam (1,000 tons of ice in 24 hours). Sources: USBR concrete essay + Hoover Dam FAQ.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any dam / concrete / cooling story.
// Uses td__lib.js (TD.label, TD.figure) lazily at build time.
//
// Common
//   K (figure) = TD.figure spec {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq, hat: true (= narrator),
//     accessory (period figures, hat: false)} + sweat: true | cue (sweat drops fly off the head)
//   L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
//   steam: {n: 10, at: cue|sec, rise: 420, w: 9, k: 1} (pale wisps rising off hot concrete)
//
// SHOTS.hd_canyon — Black Canyon seen from downstream: rock walls left and right, the dam between them (front view,
//   converging column joints, four intake towers peeking over the crest), the powerhouse at the base, the river
//   running to the frame bottom, foreground boulders.
//   mode "dam"    finished dam; heat: 0..1 (red tint), steam
//   mode "build"  the dam as separate concrete columns rising to staggered heights (grow: {at, dur}), a cableway
//                 bucket travelling over them, tiny hard-hat workers on top; pump: {x: 0.3, at: cue} = pump house on the
//                 river bank pushing river water up a pipe into the columns (blue flow dashes)
//   mode "mono"   one single giant block: heat tint, heavy steam, cracks: cue (red-ink cracks race across it)
//   mode "fridge" finished cool dam; door: cue (a giant refrigerator door in the dam face swings open: frosty blue
//                 inside with cooling coils, cold vapour spilling out)
//   heat > 0.55 adds an orange glow + red heat shimmer on the face; thermo: {x, y0, y1 (0..1), level: 0.9, s: 1.6, burst: cue}
//   (thermometer, red spikes burst out of its top on cue); pump.s scales the pump house, pump.dy its height above the river
//   P: {mode, crest: 0.33, base: 0.64, rim: 0.12, heat, steam, grow, level: 1, cracks, door, pump, kasif: K,
//       cast: [K], labels, workers: true, bucket: true}
// SHOTS.hd_pour   — close-up of a pour: a giant concrete bucket on a cable tips grey concrete into a timber form
//   that sits on older five-foot lifts; the level rises, steam and heat shimmer rise off it, a big thermometer's red
//   column climbs from cue "hot". P: {pour: cue, hot: cue, thermo: {x: 0.84}, labels}
// SHOTS.hd_plan   — an engineer's office: a big blueprint of the dam pinned to the wall; on cue "grid" the dam
//   splits into columns (vertical joints draw in), then staggered blocks shade in; an engineer points at it; a
//   drafting table in the foreground (rolled plans, T-square, lamp). P: {grid: cue, blocks: cue, cast: [K], labels}
// SHOTS.hd_cut    — cut-away of three concrete columns built in lifts: serpentine cooling pipes draw in lift by
//   lift (pipes: cue, dur), risers and a header pipe in the bedrock below; flow: cue starts water moving through the
//   pipes (water: "river" | "ice": frost forms, the hot red tint drains and the steam stops).
//   tops: [y, y, y] column tops (px); grout: cue = grey grout creeps through every coil and riser (the pipes stay inside, filled).
//   P: {pipes: cue|sec, pdur: 2.2, flow: cue, grout, water: "river"|"ice", heat: [from, to], steam, labels}
// SHOTS.hd_plant  — the refrigeration plant on the lower cofferdam: a plank shed with ammonia tanks and a vapour
//   vent on an earth embankment, frosted pipes running off to the dam (far left), the river behind; ice blocks pile
//   up in the foreground from cue "plant", a counter label counts up to `count` on cue "hit".
//   ghost: true = the ice pile is only dashed outlines, an 'equivalent' (capacity, not real ice).
//   P: {plant: cue, hit: cue, ghost, count: {to: 1000, suffix: " TONS", x, y, size}, labels}
// cues: hit (punch) + the names above + label "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const ring = (pts, sd, t, w = 5, amp = 1, smooth = false) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const line = (pts, sd, t, w = 5, amp = 1, taper, smooth) => inkPath(pts, { w, seed: sd, t, amp, taper, smooth });
  const loop = (pts, sd, t, amp = 1, smooth = false) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const TD = () => window.TD;
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => TD().label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  // colours (resolved at build time)
  const CONC = () => mix(INK.paperLight, INK.paperDark, 0.5);
  const CONC_D = () => mix(INK.paperDark, INK.inkSoft, 0.28);
  const ROCK = () => mix(INK.stain, INK.red, 0.18);
  const ROCK_D = () => mix(ROCK(), INK.ink, 0.35);
  const WATER = () => mix(INK.blue, INK.paperLight, 0.42);
  const ICE = () => mix(INK.blue, INK.paperLight, 0.7);
  const ICE_D = () => mix(INK.blue, INK.paperLight, 0.35);
  const STEAM = () => mix(INK.paperLight, INK.inkSoft, 0.38);
  const WOOD = () => mix(INK.gold, INK.inkSoft, 0.45);
  const WOOD_D = () => mix(WOOD(), INK.ink, 0.3);
  const PRINT = () => mix(INK.blue, INK.ink, 0.25);
  const heatCol = (k) => mix(CONC(), INK.red, clamp01(k) * 0.6);

  // polyline helpers
  const plen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  function cut(pts, f) {       // first fraction f of a polyline
    if (f >= 1) return pts; if (f <= 0) return [];
    const L = plen(pts) * f, out = [pts[0]]; let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + d >= L) { const u = (L - acc) / (d || 1); out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); return out; }
      acc += d; out.push(pts[i]);
    }
    return out;
  }
  function at(pts, d) {        // point at distance d
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + s >= d) { const u = (d - acc) / (s || 1); return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; }
      acc += s;
    }
    return pts[pts.length - 1];
  }
  function dashes(pts, phase, gap, len, upto = 1) {   // moving dashes along a polyline -> list of 2-pt segments
    const L = plen(pts) * upto, out = [];
    for (let d = ((phase % gap) + gap) % gap; d < L - 2; d += gap) out.push([at(pts, d), at(pts, Math.min(L, d + len))]);
    return out;
  }

  // ------------------------------------------------------------------ steam wisps
  function steam(parent, sd) {
    const e = inkEl(parent, STEAM()), e2 = inkEl(parent, mix(STEAM(), INK.paperLight, 0.45));
    return {
      update(lt, t, a, S, from) {
        if (!S || a == null || lt < a || !from || !from.length) { e.setAttribute('d', ''); e2.setAttribute('d', ''); return; }
        const n = S.n ?? 10, rise = S.rise ?? 420, w0 = (S.w ?? 9) * (S.k ?? 1), D = [], D2 = [], grow = clamp01((lt - a) / 0.6) * (S.k ?? 1);
        for (let i = 0; i < n; i++) {
          const s0 = from[i % from.length], ph = hn(sd + i, 3), sp = 0.22 + hn(sd + i, 4) * 0.14;
          const u = ((lt - a) * sp + ph) % 1, bx = s0[0] + (hn(sd + i, 5) - 0.5) * (S.spread ?? 120);
          const pts = [];
          for (let j = 0; j <= 6; j++) { const v = j / 6, y = s0[1] - u * rise - v * rise * 0.38, k = (s0[1] - y) / rise; pts.push([bx + Math.sin(v * 5 + lt * 2 + i * 1.9) * 20 * (0.4 + k), y]); }
          const fade = Math.sin(Math.PI * u) * grow; if (fade < 0.06) continue;
          (i % 2 ? D2 : D).push(inkPath(pts, { w: w0 * (0.4 + 0.8 * fade), seed: sd + 10 + i, t, amp: 0.8, taper: 0.9 }));
        }
        e.setAttribute('d', D.join(' ')); e2.setAttribute('d', D2.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ figures (TD.figure + sweat drops)
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g'), f = TD().figure(el(g, 'g'), K, sd), sw = inkEl(g, ICE_D()), swR = inkEl(g);
    return {
      update(lt, t, cues, W, H) {
        const r = f.update(lt, t, cues, W, H);
        const sa = K.sweat === true ? 0 : atOr(cues, K.sweat, null), D = [], R = [];
        if (K.sweat && sa != null && lt >= sa && r && r.head) {
          const sc = K.scale ?? 1;
          for (let i = 0; i < 5; i++) {
            const u = ((lt - sa) * 0.9 + i / 5) % 1, side = i % 2 ? 1 : -1;
            const x = r.head[0] + side * (70 + u * 90) * sc, y = r.head[1] - 40 * sc + (u * u * 160 - u * 50) * sc, s = 13 * sc * (1 - u * 0.4);
            const pts = [[x, y - s * 1.6], [x + s * 0.8, y], [x, y + s * 0.8], [x - s * 0.8, y]];
            D.push(loop(pts, sd + 60 + i, t, 0.5, true)); R.push(ring(pts, sd + 70 + i, t, 3, 0.5, true));
          }
        }
        sw.setAttribute('d', D.join(' ')); swR.setAttribute('d', R.join(' '));
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ tiny hard-hat worker (far away)
  function worker(parent, sd) {
    const body = inkEl(parent), hat = inkEl(parent, INK.paperLight), hatR = inkEl(parent);
    return {
      update(t, x, y, s, ph) {
        const sw = Math.sin(ph * Math.PI * 2) * 0.5, hy = y - 46 * s;
        const P = [
          line([[x, y - 22 * s], [x, hy + 8 * s]], sd + 1, t, 4 * s, 0.4),
          line([[x, y - 22 * s], [x - 9 * s * (1 + sw), y]], sd + 2, t, 4 * s, 0.4),
          line([[x, y - 22 * s], [x + 9 * s * (1 - sw), y]], sd + 3, t, 4 * s, 0.4),
          line([[x, hy + 14 * s], [x + 14 * s, hy + 22 * s + sw * 8 * s], [x + 22 * s, hy + 34 * s]], sd + 4, t, 3.5 * s, 0.4),
          line([[x, hy + 14 * s], [x - 13 * s, hy + 28 * s]], sd + 5, t, 3.5 * s, 0.4),
          inkLoop(ell(x, hy, 7 * s, 7 * s, 10), { seed: sd + 6, t, amp: 0.3 }),
        ];
        body.setAttribute('d', P.join(' '));
        const hp = [[x - 11 * s, hy - 3 * s], [x - 7 * s, hy - 11 * s], [x, hy - 13 * s], [x + 7 * s, hy - 11 * s], [x + 11 * s, hy - 3 * s]];
        hat.setAttribute('d', loop(hp, sd + 7, t, 0.3, true)); hatR.setAttribute('d', line(hp.concat([[x - 11 * s, hy - 3 * s]]), sd + 8, t, 2.5 * s, 0.3));
      },
    };
  }

  // ------------------------------------------------------------------ concrete bucket on a cable
  function bucket(parent, sd) {
    const cab = inkEl(parent), f = inkEl(parent, CONC_D()), r = inkEl(parent), band = inkEl(parent), mud = inkEl(parent, CONC());
    return {
      update(t, x, y, s, tilt = 0, top = -2000) {
        const w = 120 * s, h = 150 * s, a = tilt * Math.PI / 180, R = (px, py) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
        const body = [R(-w / 2, 0), R(w / 2, 0), R(w * 0.36, h), R(-w * 0.36, h)];
        cab.setAttribute('d', line([[x, top], [x, y - 40 * s]], sd + 1, t, 4, 0.6) + ' ' + line([R(-w / 2, 0), [x, y - 40 * s], R(w / 2, 0)], sd + 2, t, 4 * s, 0.6));
        f.setAttribute('d', loop(body, sd + 3, t, 0.8));
        r.setAttribute('d', ring(body, sd + 4, t, 5 * s, 0.8));
        band.setAttribute('d', line([R(-w * 0.45, h * 0.3), R(w * 0.45, h * 0.3)], sd + 5, t, 4 * s, 0.6) + ' ' + line([R(-w * 0.4, h * 0.7), R(w * 0.4, h * 0.7)], sd + 6, t, 4 * s, 0.6));
        mud.setAttribute('d', loop([R(-w * 0.44, 4 * s), R(w * 0.44, 4 * s), R(w * 0.3, -14 * s), R(-w * 0.2, -16 * s)], sd + 7, t, 0.8, true));
        return { lip: R(tilt > 0 ? w / 2 : -w / 2, 0) };
      },
    };
  }

  // ------------------------------------------------------------------ thermometer
  function thermo(parent, sd) {
    const glass = inkEl(parent, INK.paperLight), red = inkEl(parent, INK.red), r = inkEl(parent), ticks = inkEl(parent);
    return {
      update(t, x, y0, y1, level, s = 1) {
        const w = 34 * s, br = 44 * s, top = y0, bot = y1;
        const tube = [[x - w / 2, bot - br * 0.6], [x - w / 2, top + w / 2], [x - w * 0.3, top], [x + w * 0.3, top], [x + w / 2, top + w / 2], [x + w / 2, bot - br * 0.6]];
        const bulb = ell(x, bot, br, br, 16);
        glass.setAttribute('d', loop(tube, sd + 1, t, 0.7, true) + ' ' + loop(bulb, sd + 2, t, 0.7, true));
        const ly = lerp(bot - br * 0.5, top + w * 0.6, clamp01(level));
        red.setAttribute('d', loop(ell(x, bot, br * 0.72, br * 0.72, 14), sd + 3, t, 0.6, true) + ' ' + loop(rect(x - w * 0.24, ly, x + w * 0.24, bot - 4), sd + 4, t, 0.6));
        r.setAttribute('d', line(tube, sd + 5, t, 5 * s, 0.7) + ' ' + ring(bulb, sd + 6, t, 5 * s, 0.7, true));
        const T = [];
        for (let i = 1; i <= 7; i++) { const yy = lerp(bot - br, top + w, i / 8); T.push(line([[x + w / 2 + 6, yy], [x + w / 2 + (i % 2 ? 26 : 16) * s, yy]], sd + 10 + i, t, 3.5, 0.5)); }
        ticks.setAttribute('d', T.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ river water band (y0 -> frame bottom)
  function river(parent, sd, W, H) {
    const f = inkEl(parent, WATER()), lite = inkEl(parent, mix(INK.paperLight, INK.blue, 0.2)), rip = inkEl(parent, mix(INK.blue, INK.ink, 0.25));
    return {
      update(lt, t, y0) {
        const top = []; for (let i = 0; i <= 14; i++) top.push([-40 + i * (W + 80) / 14, y0 + Math.sin(i * 1.3 + lt * 1.6) * 5]);
        f.setAttribute('d', loop(top.concat([[W + 40, H + 40], [-40, H + 40]]), sd + 1, t, 0.6));
        const L = [], R = [line(top, sd + 2, t, 5, 0.6)];
        for (let j = 0; j < 22; j++) {
          const yy = y0 + 30 + hn(sd + j, 1) * (H - y0 - 40), k = (yy - y0) / (H - y0 + 1), len = 40 + 90 * k;
          const xx = ((hn(sd + j, 2) * (W + 200) + lt * (50 + 70 * k)) % (W + 200)) - 100;
          (j % 3 ? L : R).push(line([[xx, yy], [xx + len * 0.5, yy - 4], [xx + len, yy]], sd + 10 + j, t, j % 3 ? 4 + 4 * k : 3, 0.5));
        }
        lite.setAttribute('d', L.join(' ')); rip.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ cracks (precomputed zig-zags)
  function crackSet(cx, cy, w, h, sd, n = 6) {
    const out = [];
    for (let i = 0; i < n; i++) {
      let x = cx + (hn(sd + i, 1) - 0.5) * w * 0.7, y = cy + (hn(sd + i, 2) - 0.5) * h * 0.6;
      const ang = hn(sd + i, 3) * Math.PI * 2, pts = [[x, y]];
      for (let k = 0; k < 9; k++) { const a = ang + (hn(sd + i, 10 + k) - 0.5) * 1.6; x += Math.cos(a) * w * 0.06; y += Math.sin(a) * h * 0.07; pts.push([x, y]); }
      out.push(pts);
    }
    return out;
  }

  // ================================================================== hd_canyon
  SH.hd_canyon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 9101, top = el(svg, 'g'), root = el(top, 'g');
      const mode = P.mode || 'dam';
      const crestY = (P.crest ?? 0.33) * H, baseY = (P.base ?? 0.64) * H, rimY = (P.rim ?? 0.12) * H;
      const xLt = W * (P.wl ?? [0.06, 0.33])[0], xLb = W * (P.wl ?? [0.06, 0.33])[1], xRt = W * (1 - (P.wr ?? [0.06, 0.33])[0]), xRb = W * (1 - (P.wr ?? [0.06, 0.33])[1]);
      const kY = y => (y - crestY) / (baseY - crestY);
      const Lx = y => y <= baseY ? lerp(xLt, xLb, kY(y)) : xLb - (y - baseY) * 0.35;
      const Rx = y => y <= baseY ? lerp(xRt, xRb, kY(y)) : xRb + (y - baseY) * 0.35;
      const riverY = baseY + 110;
      // layers
      const towers = el(root, 'g'), towF = inkEl(towers, CONC()), towR = inkEl(towers), towW = inkEl(towers);
      const damG = el(root, 'g'), damF = inkEl(damG, CONC()), damSh = inkEl(damG, CONC_D(), { 'fill-opacity': 0.55 }), damH = inkEl(damG, INK.inkSoft), damR = inkEl(damG);
      const colG = el(root, 'g');
      const N = P.columns ?? 9, FR_ = P.heights || [0.58, 0.74, 0.64, 0.86, 0.7, 0.9, 0.62, 0.78, 0.52];
      const cols = Array.from({ length: N }, () => ({ f: inkEl(colG, CONC()), lifts: inkEl(colG, INK.inkSoft), r: inkEl(colG) }));
      const glowE = inkEl(root, mix(INK.red, INK.gold, 0.45), { 'fill-opacity': 0 }), shimE = inkEl(root, INK.red, { 'fill-opacity': 0.6 });
      const crackG = el(root, 'g'), crackE = inkEl(crackG, INK.red), crackE2 = inkEl(crackG, INK.ink);
      const doorG = el(root, 'g'), inF = inkEl(doorG, ICE()), inCoil = inkEl(doorG, ICE_D()), inFrost = inkEl(doorG, INK.paperLight), doorF = inkEl(doorG, mix(INK.paperLight, CONC(), 0.4)), doorR = inkEl(doorG), handle = inkEl(doorG, INK.inkSoft), vapour = inkEl(doorG, mix(ICE(), INK.paperLight, 0.5));
      const phG = el(root, 'g'), phF = inkEl(phG, CONC_D()), phR = inkEl(phG), phW = inkEl(phG, INK.inkSoft);
      const rv = river(el(root, 'g'), sd + 30, W, H);
      const pumpG = el(root, 'g'), pumpF = inkEl(pumpG, WOOD()), pumpR = inkEl(pumpG), pipeO = inkEl(pumpG), pipeI = inkEl(pumpG, INK.paperDark), flowE = inkEl(pumpG, INK.blue);
      const wallG = el(root, 'g'), wLF = inkEl(wallG, ROCK()), wRF = inkEl(wallG, ROCK()), wHatch = inkEl(wallG, ROCK_D()), wEdge = inkEl(wallG);
      const cable = inkEl(root);
      const bk = P.bucket !== false && mode === 'build' ? bucket(el(root, 'g'), sd + 50) : null;
      const wks = mode === 'build' && P.workers !== false ? [0, 1, 2, 3].map(i => worker(el(root, 'g'), sd + 60 + i * 9)) : [];
      const stE = steam(el(root, 'g'), sd + 80);
      const thG = el(root, 'g'), th = P.thermo ? thermo(thG, sd + 90) : null, burst = inkEl(thG, INK.red);
      const fg = el(root, 'g'), fgF = inkEl(fg, ROCK_D()), fgR = inkEl(fg), fgH = inkEl(fg, INK.ink);
      const figs = [].concat(P.cast || []).map((K, i) => figure(el(root, 'g'), K, sd + 100 + i * 13));
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 140) : null;
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      // static geometry
      const edgeL = [], edgeR = [];
      for (let y = rimY; y <= H + 60; y += 40) { const j = (hn(sd + y, 1) - 0.5) * 34; edgeL.push([Lx(y) + j + (y < crestY ? -(crestY - y) * 0.3 : 0), y]); edgeR.push([Rx(y) - j + (y < crestY ? (crestY - y) * 0.3 : 0), y]); }
      const wallL = [[-60, rimY - 30]].concat(edgeL, [[-60, H + 60]]);
      const wallR = [[W + 60, rimY - 30]].concat(edgeR, [[W + 60, H + 60]]);
      const hatch = [];
      for (let i = 0; i < 26; i++) {
        const y = rimY + 30 + i * (H - rimY) / 26, left = i % 2 === 0;
        const xe = left ? Lx(y) - 30 : Rx(y) + 30, len = 60 + hn(sd + i, 7) * 120;
        hatch.push(left ? [[xe - len - 20, y], [xe - 20, y + 10]] : [[xe + 20, y + 10], [xe + len + 20, y]]);
      }
      const damPoly = (yTop = crestY) => { const pts = []; for (let k = 0; k <= 8; k++) { const y = lerp(yTop, baseY, k / 8); pts.push([Lx(y), y]); } for (let k = 8; k >= 0; k--) { const y = lerp(yTop, baseY, k / 8); pts.push([Rx(y), y]); } return pts; };
      const colX = (u, y) => lerp(Lx(y), Rx(y), u);
      const cracks = crackSet(W / 2, (crestY + baseY) / 2, xRt - xLt, baseY - crestY, sd + 300, 7);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const sc = 1 + 0.015 * hit;
          root.setAttribute('transform', `translate(${f1(W / 2)} ${f1(H * 0.5)}) scale(${sc.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.5)})`);
          // intake towers behind the crest (finished dam only)
          const showT = mode === 'dam' || mode === 'fridge';
          if (showT) {
            const TF = [], TR = [], TW = [];
            [0.2, 0.37, 0.63, 0.8].forEach((u, i) => {
              const x = colX(u, crestY), w = 46, h = 110 + (i % 2) * 18, pts = [[x - w / 2, crestY + 4], [x - w / 2, crestY - h], [x - w * 0.3, crestY - h - 22], [x + w * 0.3, crestY - h - 22], [x + w / 2, crestY - h], [x + w / 2, crestY + 4]];
              TF.push(loop(pts, sd + 400 + i, t, 0.7)); TR.push(line(pts, sd + 410 + i, t, 4.5, 0.7));
              TW.push(line([[x, crestY - h + 20], [x, crestY - 16]], sd + 420 + i, t, 3, 0.5));
            });
            towF.setAttribute('d', TF.join(' ')); towR.setAttribute('d', TR.join(' ')); towW.setAttribute('d', TW.join(' '));
          } else { towF.setAttribute('d', ''); towR.setAttribute('d', ''); towW.setAttribute('d', ''); }
          // heat
          let heat = P.heat ?? (mode === 'mono' ? 0.75 : 0);
          // dam face
          if (mode === 'build') {
            damF.setAttribute('d', ''); damSh.setAttribute('d', ''); damH.setAttribute('d', ''); damR.setAttribute('d', '');
            const G = P.grow || {}, ga = atOr(cues, G.at, 0), gp = G.at == null && G.dur == null ? 1 : (lt >= ga ? prog(lt, ga, G.dur ?? 2.5) : 0);
            cols.forEach((c, i) => {
              const u0 = i / N, u1 = (i + 1) / N, fr = FR_[i % FR_.length] * (P.level ?? 1) * lerp(0.8, 1, gp) + (0.03 * Math.sin(lt * 0.5 + i));
              const yT = baseY - (baseY - crestY) * Math.min(0.98, fr);
              const pts = [[colX(u0, yT) + 3, yT], [colX(u1, yT) - 3, yT], [colX(u1, baseY) - 3, baseY + 6], [colX(u0, baseY) + 3, baseY + 6]];
              c.f.setAttribute('fill', heatCol(heat * (0.6 + 0.4 * hn(i, 3))));
              c.f.setAttribute('d', loop(pts, sd + 500 + i, t, 0.7));
              c.r.setAttribute('d', ring(pts, sd + 520 + i, t, 4.5, 0.7));
              const LL = [];
              for (let y = baseY - 34; y > yT + 10; y -= 34) LL.push(line([[colX(u0, y) + 8, y], [colX(u1, y) - 8, y]], sd + 540 + i * 30 + Math.round(y), t, 2.2, 0.4));
              c.lifts.setAttribute('d', LL.join(' '));
              c.top = [(colX(u0, yT) + colX(u1, yT)) / 2, yT];
            });
          } else {
            cols.forEach(c => { c.f.setAttribute('d', ''); c.r.setAttribute('d', ''); c.lifts.setAttribute('d', ''); });
            const dp = damPoly();
            damF.setAttribute('fill', heatCol(heat));
            damF.setAttribute('d', loop(dp, sd + 600, t, 0.8));
            const shp = []; for (let k = 0; k <= 8; k++) { const y = lerp(crestY, baseY, k / 8); shp.push([Lx(y), y]); } for (let k = 8; k >= 0; k--) { const y = lerp(crestY, baseY, k / 8); shp.push([colX(0.22, y), y]); }
            damSh.setAttribute('d', loop(shp, sd + 601, t, 0.6));
            const HH = [];
            if (mode !== 'mono') {
              for (let i = 1; i < 12; i++) { const u = i / 12, pts = []; for (let k = 0; k <= 6; k++) { const y = lerp(crestY + 14, baseY - 4, k / 6); pts.push([colX(u, y), y]); } HH.push(line(pts, sd + 610 + i, t, 2.6, 0.5)); }
            }
            HH.push(line([[colX(0, crestY + 22), crestY + 22], [colX(1, crestY + 22), crestY + 22]], sd + 640, t, 4, 0.5));
            damH.setAttribute('d', HH.join(' '));
            damR.setAttribute('d', line([[Lx(crestY) - 10, crestY], [Rx(crestY) + 10, crestY]], sd + 650, t, 7, 0.8));
          }
          // hot glow + heat shimmer over the face (heat > 0.6)
          const gk = clamp01((heat - 0.55) / 0.45);
          if (mode !== 'build' && gk > 0) {
            const gy0 = lerp(crestY, baseY, 0.18), gy1 = lerp(crestY, baseY, 0.95), gp = [];
            for (let k = 0; k <= 6; k++) { const y = lerp(gy0, gy1, k / 6); gp.push([colX(0.3 - 0.06 * Math.sin(k), y), y]); }
            for (let k = 6; k >= 0; k--) { const y = lerp(gy0, gy1, k / 6); gp.push([colX(0.72 + 0.05 * Math.sin(k), y), y]); }
            glowE.setAttribute('fill-opacity', (0.45 * gk * (0.85 + 0.15 * Math.sin(lt * 3))).toFixed(3));
            glowE.setAttribute('d', loop(gp, sd + 660, t, 1, true));
            const SM = [];
            for (let i = 0; i < 7; i++) { const u = 0.12 + i * 0.125, y0 = baseY - 60 - ((lt * 90 + i * 70) % (baseY - crestY - 80)), pts = []; for (let k = 0; k <= 5; k++) { const y = y0 - k * 34; pts.push([colX(u, y) + Math.sin(k * 1.5 + lt * 5 + i) * 12, y]); } SM.push(inkPath(pts, { w: 7 * gk, seed: sd + 670 + i, t, amp: 0.5, taper: 0.9 })); }
            shimE.setAttribute('d', SM.join(' '));
          } else { glowE.setAttribute('d', ''); shimE.setAttribute('d', ''); }
          // cracks (mono)
          if (mode === 'mono' && P.cracks != null) {
            const ca = atOr(cues, P.cracks, dur * 0.6), cp = lt >= ca ? prog(lt, ca, 0.9) : 0, A = [], B = [];
            if (cp > 0) cracks.forEach((c, i) => { const q = cut(c, clamp01(cp * 1.4 - i * 0.06)); if (q.length > 1) { A.push(line(q, sd + 700 + i, t, 11, 1, 0.8)); B.push(line(q, sd + 720 + i, t, 4, 1, 0.8)); } });
            crackE.setAttribute('d', A.join(' ')); crackE2.setAttribute('d', B.join(' '));
          } else { crackE.setAttribute('d', ''); crackE2.setAttribute('d', ''); }
          // fridge door
          if (mode === 'fridge') {
            const da = atOr(cues, P.door, dur * 0.2), dp = lt >= da ? prog(lt, da, 1.1) : 0;
            const cx = W / 2, cy = lerp(crestY, baseY, 0.52), dw = (Rx(cy) - Lx(cy)) * 0.36, dh = (baseY - crestY) * 0.62;
            const x0 = cx - dw / 2, x1 = cx + dw / 2, y0 = cy - dh / 2, y1 = cy + dh / 2;
            inF.setAttribute('d', dp > 0 ? loop(rect(x0, y0, x1, y1), sd + 800, t, 0.6) : '');
            const C = [], Fr = [];
            if (dp > 0) {
              for (let r = 0; r < 4; r++) {
                const yy = y0 + dh * (0.16 + r * 0.22), pts = [];
                for (let k = 0; k < 5; k++) { pts.push([x0 + 24 + (k % 2 ? dw - 48 : 0), yy + k * 0]); }
                const sp = [[x0 + 26, yy], [x1 - 26, yy], [x1 - 26, yy + dh * 0.1], [x0 + 26, yy + dh * 0.1]];
                C.push(line(sp, sd + 810 + r, t, 10, 0.6));
                for (let k = 0; k < 6; k++) { const px = lerp(x0 + 30, x1 - 30, (k + 0.5) / 6), py = yy + (k % 2 ? dh * 0.1 : 0); Fr.push(line([[px - 8, py - 10], [px + 8, py + 10]], sd + 830 + r * 6 + k, t, 3, 0.4), line([[px + 8, py - 10], [px - 8, py + 10]], sd + 860 + r * 6 + k, t, 3, 0.4)); }
              }
            }
            inCoil.setAttribute('d', C.join(' ')); inFrost.setAttribute('d', Fr.join(' '));
            // the door swings on its right hinge, opening towards the viewer (its free edge moves out and left)
            const ex = lerp(x0, x1 + dw * 0.42, dp), sk = Math.sin(dp * Math.PI * 0.5) * dh * 0.12;
            const door = [[ex, y0 - sk], [x1, y0], [x1, y1], [ex, y1 + sk]];
            doorF.setAttribute('d', loop(door, sd + 900, t, 0.6));
            doorR.setAttribute('d', ring(door, sd + 901, t, 6, 0.6) + (dp < 0.05 ? ' ' + ring(rect(x0 - 6, y0 - 6, x1 + 6, y1 + 6), sd + 902, t, 4, 0.6) : ''));
            const hx = lerp(ex, x1, 0.12);
            handle.setAttribute('d', loop(rect(hx - 9, cy - dh * 0.18, hx + 9, cy + dh * 0.18), sd + 903, t, 0.5));
            const V = [];
            if (dp > 0.3) for (let i = 0; i < 7; i++) { const u = ((lt - da) * 0.35 + i / 7) % 1, sx = lerp(x0 + 20, x1 - 20, hn(sd + i, 9)), pts = []; for (let k = 0; k <= 5; k++) { const v = k / 5; pts.push([sx + Math.sin(v * 4 + lt * 1.8 + i) * 22 - v * 40 * (i % 2 ? 1 : -1), y1 - 10 + (u * 260 + v * 120)]); } V.push(inkPath(pts, { w: 16 * Math.sin(Math.PI * u), seed: sd + 920 + i, t, amp: 0.6, taper: 0.9 })); }
            vapour.setAttribute('d', V.join(' '));
          } else [inF, inCoil, inFrost, doorF, doorR, handle, vapour].forEach(e => e.setAttribute('d', ''));
          // powerhouse at the base
          const pTop = baseY - 24, pBot = baseY + 116, pts = [[Lx(baseY) - 70, pBot], [Lx(baseY) - 50, pTop], [Rx(baseY) + 50, pTop], [Rx(baseY) + 70, pBot]];
          phF.setAttribute('d', mode === 'build' ? '' : loop(pts, sd + 1000, t, 0.6));
          phR.setAttribute('d', mode === 'build' ? '' : ring(pts, sd + 1001, t, 5, 0.6));
          const PW = [];
          if (mode !== 'build') for (let i = 0; i < 9; i++) { const x = lerp(Lx(baseY) - 20, Rx(baseY) + 20, (i + 0.5) / 9); PW.push(loop(rect(x - 12, pTop + 30, x + 12, pTop + 78), sd + 1010 + i, t, 0.5)); }
          phW.setAttribute('d', PW.join(' '));
          rv.update(lt, t, mode === 'build' ? baseY + 20 : riverY);
          // pump: river water up a pipe into the columns
          if (mode === 'build' && P.pump) {
            const px = P.pump.x * W, py = baseY + (P.pump.dy ?? 120), pa = atOr(cues, P.pump.at, 0);
            const ps = P.pump.s ?? 1, hut = [[px - 70 * ps, py + 40 * ps], [px - 70 * ps, py - 50 * ps], [px, py - 90 * ps], [px + 70 * ps, py - 50 * ps], [px + 70 * ps, py + 40 * ps]];
            pumpF.setAttribute('d', loop(hut, sd + 1100, t, 0.6)); pumpR.setAttribute('d', ring(hut, sd + 1101, t, 5, 0.6) + ' ' + ring(rect(px - 22 * ps, py - 10 * ps, px + 22 * ps, py + 40 * ps), sd + 1104, t, 4, 0.5) + ' ' + ring(ell(px + 40 * ps, py - 10 * ps, 18 * ps, 18 * ps, 10), sd + 1105, t, 4, 0.5, true) + ' ' + line([[px + 40 * ps + Math.cos(lt * 6) * 16 * ps, py - 10 * ps + Math.sin(lt * 6) * 16 * ps], [px + 40 * ps - Math.cos(lt * 6) * 16 * ps, py - 10 * ps - Math.sin(lt * 6) * 16 * ps]], sd + 1106, t, 4, 0.4));
            const pipe = [[px - 20 * ps, py + 90], [px - 20 * ps, py - 30 * ps], [W * 0.5, py - 30 * ps], [W * 0.5, baseY - 200]];
            pipeO.setAttribute('d', line(pipe, sd + 1102, t, 30, 0.5, 0, false)); pipeI.setAttribute('d', line(pipe, sd + 1103, t, 14, 0.5, 0, false));
            const fp = lt >= pa ? prog(lt, pa, 0.8) : 0;
            flowE.setAttribute('d', fp > 0 ? dashes(pipe, (lt - pa) * 260, 60, 30, fp).map((s, i) => line(s, sd + 1110 + i, t, 13, 0.4, 0, false)).join(' ') : '');
          } else [pumpF, pumpR, pipeO, pipeI, flowE].forEach(e => e.setAttribute('d', ''));
          // canyon walls
          wLF.setAttribute('d', loop(wallL, sd + 1200, t, 1, true)); wRF.setAttribute('d', loop(wallR, sd + 1201, t, 1, true));
          wHatch.setAttribute('d', hatch.map((h, i) => line(h, sd + 1210 + i, t, 4, 0.8)).join(' '));
          wEdge.setAttribute('d', line(edgeL, sd + 1250, t, 6, 1) + ' ' + line(edgeR, sd + 1251, t, 6, 1));
          // cableway + bucket + workers
          if (bk) {
            const cy0 = rimY + 50, cx0 = Lx(rimY) - 20, cx1 = Rx(rimY) + 20, sag = 30;
            cable.setAttribute('d', line([[cx0, cy0], [W / 2, cy0 + sag], [cx1, cy0]], sd + 1300, t, 4, 0.5));
            const u = 0.5 + 0.28 * Math.sin(lt * 0.55 + 0.6), bx = lerp(cx0, cx1, u), by = cy0 + sag * (1 - Math.pow(2 * u - 1, 2)) + 170 + 40 * Math.sin(lt * 0.8);
            bk.update(t, bx, by, 0.75, Math.sin(lt * 1.3) * 4, cy0 + sag * (1 - Math.pow(2 * u - 1, 2)));
            [1, 3, 5, 7].forEach((ci, i) => { const c = cols[ci]; if (c && c.top && wks[i]) wks[i].update(t, c.top[0] + (i % 2 ? 20 : -20) + Math.sin(lt * 0.7 + i) * 14, c.top[1] + 2, 1.15, lt * 0.8 + i * 0.3); });
          } else cable.setAttribute('d', '');
          // steam
          if (P.steam) {
            const from = mode === 'build' ? cols.map(c => c.top).filter(Boolean) : [0.15, 0.32, 0.5, 0.68, 0.85].map((u, i) => [colX(u, crestY + (baseY - crestY) * (0.15 + 0.2 * (i % 3))), crestY + (baseY - crestY) * (0.15 + 0.2 * (i % 3))]);
            stE.update(lt, t, atOr(cues, P.steam.at, 0), P.steam, from);
          } else stE.update(lt, t, null);
          if (th) {
            const T = P.thermo, tx = T.x * W, ty0 = T.y0 * H, ty1 = T.y1 * H, ba = atOr(cues, T.burst, null), bp = ba != null && lt >= ba ? prog(lt, ba, 0.5) : 0;
            th.update(t, tx, ty0, ty1, Math.min(1.02, (T.level ?? 0.9) + 0.06 * Math.sin(lt * 4) + bp), T.s ?? 1.6);
            const B = [];
            if (bp > 0) for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.32, r0 = 30, r1 = 30 + 110 * bp + (i % 2) * 30; B.push(inkPath([[tx + Math.cos(a) * r0, ty0 + Math.sin(a) * r0], [tx + Math.cos(a) * r1, ty0 + Math.sin(a) * r1]], { w: 10, seed: sd + 95 + i, t, amp: 0.5, taper: 0.8 })); }
            burst.setAttribute('d', B.join(' '));
          }
          // foreground boulders (fill the lower frame edges)
          const FB = [[[-40, H + 40], [-40, H * 0.86], [W * 0.12, H * 0.83], [W * 0.26, H * 0.87], [W * 0.34, H * 0.93], [W * 0.38, H + 40]],
            [[W + 40, H + 40], [W + 40, H * 0.84], [W * 0.86, H * 0.82], [W * 0.72, H * 0.86], [W * 0.62, H * 0.92], [W * 0.58, H + 40]]];
          fgF.setAttribute('d', FB.map((p, i) => loop(p, sd + 1400 + i, t, 1, true)).join(' '));
          fgR.setAttribute('d', FB.map((p, i) => line(p.slice(1, -1), sd + 1410 + i, t, 6, 1)).join(' '));
          fgH.setAttribute('d', [0, 1, 2, 3, 4, 5].map(i => { const lx = i < 3, x = lx ? W * (0.04 + i * 0.09) : W * (0.66 + (i - 3) * 0.1), y = H * (0.9 + (i % 3) * 0.025); return line([[x, y], [x + 50, y + 8]], sd + 1420 + i, t, 3, 0.6); }).join(' '));
          figs.forEach(f => f && f.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hd_pour
  SH.hd_pour = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 9301, top = el(svg, 'g'), root = el(top, 'g');
      const fx0 = 70, fx1 = W * 0.72, fTop = 820, fBot = 1210;
      const liftsG = el(root, 'g'), liftF = inkEl(liftsG, CONC_D()), liftL = inkEl(liftsG, INK.inkSoft), liftR = inkEl(liftsG);
      const rebarE = inkEl(liftsG, mix(INK.red, INK.ink, 0.45)), fgPlF = inkEl(liftsG, WOOD()), fgPlR = inkEl(liftsG), hatsF = inkEl(liftsG, INK.paperLight), hatsR = inkEl(liftsG);
      const backF = inkEl(root, WOOD()), backL = inkEl(root, WOOD_D());
      const concF = inkEl(root, CONC()), concR = inkEl(root), stream = inkEl(root, CONC_D()), streamL = inkEl(root, CONC());
      const sideF = inkEl(root, WOOD()), sideR = inkEl(root), sideL = inkEl(root, WOOD_D());
      const heatE = inkEl(root, INK.red, { 'fill-opacity': 0.55 });
      const st = steam(el(root, 'g'), sd + 40);
      const bk = bucket(el(root, 'g'), sd + 60);
      const th = thermo(el(root, 'g'), sd + 80);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pa = atOr(cues, P.pour, 0.2), ha = atOr(cues, P.hot, dur * 0.4), hit = punch(lt, cue(cues, 'hit', ha));
          // older lifts below the form, down to the frame bottom
          const LF = [], LL = [];
          LF.push(loop(rect(-30, fBot, W + 30, H + 40), sd + 1, t, 0.6));
          for (let y = fBot + 150; y < H; y += 150) LL.push(line([[-20, y], [W + 20, y + 4]], sd + 2 + y, t, 4, 0.6));
          for (let i = 0; i < 6; i++) { const x = 120 + i * 170, y = fBot + 80 + (i % 2) * 150; LL.push(line([[x, y], [x + 50, y + 3]], sd + 30 + i, t, 2.5, 0.4)); }
          liftF.setAttribute('d', LF.join(' ')); liftL.setAttribute('d', LL.join(' '));
          liftR.setAttribute('d', line([[-20, fBot], [W + 20, fBot]], sd + 3, t, 6, 0.6));
          // foreground: rebar ends + old form planks on the lifts, a plank walkway with hard hats and a shovel
          const RB = [], PL = [], PLR = [], HT = [], HTR = [];
          for (let i = 0; i < 9; i++) { const x = 60 + i * 120 + (i % 2) * 20, y = fBot + 150; RB.push(line([[x, y + 10], [x + (i % 3 - 1) * 8, y - 70 - (i % 2) * 30]], sd + 40 + i, t, 7, 0.6, 0.2)); }
          for (let i = 0; i < 4; i++) { const x = 40 + i * 290; PL.push(loop(rect(x, fBot + 170, x + 46, fBot + 300), sd + 50 + i, t, 0.6)); PLR.push(ring(rect(x, fBot + 170, x + 46, fBot + 300), sd + 55 + i, t, 4, 0.6)); }
          const wy = 1560, walk = [[-40, wy], [W + 40, wy - 16], [W + 40, wy + 60], [-40, wy + 76]];
          PL.push(loop(walk, sd + 60, t, 0.6)); PLR.push(ring(walk, sd + 61, t, 5, 0.6));
          [[160, 1720], [520, 1700], [900, 1720]].forEach(([x, y], i) => { PL.push(loop(rect(x - 18, wy + 60, x + 18, H + 40), sd + 62 + i, t, 0.6)); PLR.push(ring(rect(x - 18, wy + 60, x + 18, H + 40), sd + 65 + i, t, 4, 0.6)); });
          for (let k = 1; k < 4; k++) PLR.push(line([[-20, wy + k * 19 - k * 4], [W + 20, wy - 16 + k * 19 - k * 4]], sd + 70 + k, t, 2, 0.4));
          [[300, wy - 4], [380, wy - 6]].forEach(([x, y], i) => { const hp = [[x - 54, y], [x - 46, y - 40], [x - 20, y - 62], [x + 20, y - 62], [x + 46, y - 40], [x + 54, y]]; HT.push(loop(hp, sd + 80 + i, t, 0.6, true)); HTR.push(line(hp.concat([[x - 54, y]]), sd + 82 + i, t, 5, 0.6) + ' ' + line([[x - 66, y], [x + 66, y]], sd + 84 + i, t, 7, 0.5)); });
          const sh = [[700, wy - 10], [960, wy - 150]], blade = [[940, wy - 190], [1010, wy - 160], [990, wy - 110], [930, wy - 130]];
          HTR.push(line(sh, sd + 90, t, 8, 0.6)); PL.push(loop(blade, sd + 91, t, 0.6, true)); PLR.push(ring(blade, sd + 92, t, 4, 0.6, true));
          rebarE.setAttribute('d', RB.join(' ')); fgPlF.setAttribute('d', PL.join(' ')); fgPlR.setAttribute('d', PLR.join(' ')); hatsF.setAttribute('d', HT.join(' ')); hatsR.setAttribute('d', HTR.join(' '));
          // timber form: back boards
          backF.setAttribute('d', loop(rect(fx0, fTop, fx1, fBot), sd + 4, t, 0.6));
          const BL = []; for (let y = fTop + 56; y < fBot; y += 56) BL.push(line([[fx0 + 10, y], [fx1 - 10, y]], sd + 5 + y, t, 3, 0.5));
          backL.setAttribute('d', BL.join(' '));
          // concrete level rises
          const lvl = lt >= pa ? prog(lt, pa, dur * 0.85) : 0, cy = lerp(fBot - 40, fTop + 90, lvl);
          const surf = []; for (let k = 0; k <= 10; k++) { const x = lerp(fx0, fx1, k / 10); surf.push([x, cy + Math.sin(k * 1.7 + lt * 1.2) * 6 - (Math.abs(k - 5) < 2 ? 20 * lvl : 0)]); }
          concF.setAttribute('d', loop(surf.concat([[fx1, fBot], [fx0, fBot]]), sd + 6, t, 0.6, true));
          concR.setAttribute('d', line(surf, sd + 7, t, 5, 0.6));
          // bucket tipping over the form
          const tilt = lt >= pa ? 38 * prog(lt, pa, 0.6) : 4 * Math.sin(lt * 1.5);
          const bx = W * 0.44 + Math.sin(lt * 0.7) * 10, by = 300;
          const r = bk.update(t, bx, by, 1.5, tilt, -50);
          if (lt >= pa + 0.3) {
            const lip = r.lip, sx = lip[0] + 10, pts = [[sx, lip[1]], [sx + 30, lip[1] + 80], [sx + 36, (lip[1] + cy) / 2], [sx + 30, cy - 10]];
            const wob = Math.sin(lt * 9) * 6;
            stream.setAttribute('d', inkPath(pts.map(([x, y]) => [x + wob * (y - lip[1]) / 400, y]), { w: 46, seed: sd + 8, t, amp: 0.8, taper: 0.1 }));
            streamL.setAttribute('d', inkPath(pts.slice(1).map(([x, y]) => [x - 8, y]), { w: 10, seed: sd + 9, t, amp: 0.8, taper: 0.5 }));
          } else { stream.setAttribute('d', ''); streamL.setAttribute('d', ''); }
          // side posts + braces in front
          const S = [];
          [fx0 - 10, fx1 - 30].forEach((x, i) => S.push(loop(rect(x, fTop - 40, x + 40, fBot + 10), sd + 10 + i, t, 0.6)));
          sideF.setAttribute('d', S.join(' '));
          sideR.setAttribute('d', [fx0 - 10, fx1 - 30].map((x, i) => ring(rect(x, fTop - 40, x + 40, fBot + 10), sd + 12 + i, t, 4.5, 0.6)).join(' ') + ' ' + ring(rect(fx0, fTop, fx1, fBot), sd + 14, t, 5, 0.6));
          sideL.setAttribute('d', [fx0 - 10, fx1 - 30].map((x, i) => line([[x + 20, fTop - 20], [x + 20, fBot - 10]], sd + 16 + i, t, 2.5, 0.4)).join(' '));
          // heat shimmer (red wavy strokes) + steam from the hot concrete
          const hp = lt >= ha ? prog(lt, ha, 0.8) : 0, HS = [];
          if (hp > 0) for (let i = 0; i < 5; i++) { const x = lerp(fx0 + 60, fx1 - 60, i / 4), pts = []; for (let k = 0; k <= 6; k++) pts.push([x + Math.sin(k * 1.4 + lt * 4 + i) * 16, cy - 40 - k * 50 - ((lt * 60) % 50)]); HS.push(inkPath(pts, { w: 6 * hp, seed: sd + 20 + i, t, amp: 0.5, taper: 0.9 })); }
          heatE.setAttribute('d', HS.join(' '));
          st.update(lt, t, pa + 0.5, { n: 10, rise: 360, w: 10, k: 0.6 + 0.4 * hp, spread: 160 }, [[fx0 + 120, cy], [(fx0 + fx1) / 2, cy], [fx1 - 120, cy]]);
          // thermometer
          const tx = (P.thermo && P.thermo.x != null ? P.thermo.x : 0.86) * W;
          th.update(t, tx, 470, 1060, lerp(0.18, 0.95, hp) + 0.02 * Math.sin(lt * 3) + 0.04 * hit, 1.5);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hd_plan
  SH.hd_plan = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 9501, top = el(svg, 'g'), root = el(top, 'g');
      const bx0 = 250, bx1 = W - 40, by0 = 300, by1 = 1080;
      const pin = inkEl(root, INK.red), sheet = inkEl(root, PRINT()), sheetR = inkEl(root);
      const bpL = inkEl(root, INK.paperLight), blk = inkEl(root, mix(PRINT(), INK.paperLight, 0.35)), grid = inkEl(root, INK.paperLight);
      const figs = [].concat(P.cast || []).map((K, i) => figure(el(root, 'g'), K, sd + 100 + i * 13));
      const tbl = el(root, 'g'), tblF = inkEl(tbl, WOOD()), tblR = inkEl(tbl), tblL = inkEl(tbl, WOOD_D());
      const roll = inkEl(root, INK.paperLight), rollR = inkEl(root), tsq = inkEl(root, mix(WOOD(), INK.paperLight, 0.4)), tsqR = inkEl(root), lamp = inkEl(root, INK.green), lampR = inkEl(root), lampGlow = inkEl(root, INK.gold, { 'fill-opacity': 0.35 });
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      // blueprint dam geometry (in sheet coords)
      const cx = (bx0 + bx1) / 2, dTop = by0 + 170, dBot = by1 - 120, wT = (bx1 - bx0) * 0.78, wB = (bx1 - bx0) * 0.3;
      const LxB = y => lerp(cx - wT / 2, cx - wB / 2, (y - dTop) / (dBot - dTop)), RxB = y => lerp(cx + wT / 2, cx + wB / 2, (y - dTop) / (dBot - dTop));
      const N = 8, liftsN = 7;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, ga = atOr(cues, P.grid, dur * 0.4), ba = atOr(cues, P.blocks, ga + 0.6), hit = punch(lt, cue(cues, 'hit', ga));
          const sk = 1 + 0.02 * hit;
          sheet.setAttribute('d', loop(rect(bx0, by0, bx1, by1), sd + 1, t, 0.8));
          sheetR.setAttribute('d', ring(rect(bx0, by0, bx1, by1), sd + 2, t, 5, 0.8));
          pin.setAttribute('d', [[bx0 + 30, by0 + 30], [bx1 - 30, by0 + 30], [bx0 + 30, by1 - 30], [bx1 - 30, by1 - 30]].map((p, i) => inkLoop(ell(p[0], p[1], 12, 12, 10), { seed: sd + 3 + i, t, amp: 0.4 })).join(' '));
          // dam outline + canyon lines
          const out = [[LxB(dTop), dTop], [RxB(dTop), dTop], [RxB(dBot), dBot], [LxB(dBot), dBot]];
          const BP = [ring(out, sd + 10, t, 5, 0.7),
            line([[bx0 + 40, dTop - 90], [LxB(dTop) - 20, dTop - 10], [LxB(dBot) - 30, dBot + 40], [bx0 + 60, by1 - 40]], sd + 11, t, 3, 0.7),
            line([[bx1 - 40, dTop - 90], [RxB(dTop) + 20, dTop - 10], [RxB(dBot) + 30, dBot + 40], [bx1 - 60, by1 - 40]], sd + 12, t, 3, 0.7)];
          bpL.setAttribute('d', BP.join(' '));
          // blocks shading in a checkerboard (staggered)
          const bp = lt >= ba ? prog(lt, ba, 1.2) : 0, B = [];
          if (bp > 0) for (let i = 0; i < N; i++) for (let j = 0; j < liftsN; j++) {
            if ((i + j) % 2) continue; const k = (i * liftsN + j) / (N * liftsN); if (k > bp) continue;
            const y0 = lerp(dTop, dBot, j / liftsN), y1 = lerp(dTop, dBot, (j + 1) / liftsN);
            const q = [[lerp(LxB(y0), RxB(y0), i / N) + 4, y0 + 4], [lerp(LxB(y0), RxB(y0), (i + 1) / N) - 4, y0 + 4], [lerp(LxB(y1), RxB(y1), (i + 1) / N) - 4, y1 - 4], [lerp(LxB(y1), RxB(y1), i / N) + 4, y1 - 4]];
            B.push(loop(q, sd + 20 + i * 10 + j, t, 0.5));
          }
          blk.setAttribute('d', B.join(' '));
          // grid lines draw in
          const gp = lt >= ga ? prog(lt, ga, 0.9) : 0, G = [];
          if (gp > 0) {
            for (let i = 1; i < N; i++) { const u = i / N, f = clamp01(gp * 1.6 - i * 0.08); if (f <= 0) continue; const a = [lerp(LxB(dTop), RxB(dTop), u), dTop], b = [lerp(LxB(dBot), RxB(dBot), u), dBot]; G.push(line([a, [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]], sd + 100 + i, t, 4, 0.6)); }
            for (let j = 1; j < liftsN; j++) { const y = lerp(dTop, dBot, j / liftsN), f = clamp01((gp - 0.4) * 2 - j * 0.05); if (f <= 0) continue; G.push(line([[LxB(y), y], [lerp(LxB(y), RxB(y), f), y]], sd + 120 + j, t, 2.4, 0.5)); }
          }
          grid.setAttribute('d', G.join(' '));
          root.setAttribute('transform', `translate(${f1(cx)} ${f1((by0 + by1) / 2)}) scale(${sk.toFixed(4)}) translate(${f1(-cx)} ${f1(-(by0 + by1) / 2)})`);
          figs.forEach(f => f && f.update(lt, t, cues, W, H));
          // drafting table in the foreground (fills the lower frame)
          const tt = 1340;
          tblF.setAttribute('d', loop([[-40, tt], [W + 40, tt - 20], [W + 40, H + 40], [-40, H + 40]], sd + 200, t, 0.6));
          tblR.setAttribute('d', line([[-40, tt], [W + 40, tt - 20]], sd + 201, t, 6, 0.6));
          const TL = []; for (let k = 1; k < 7; k++) { const y = tt + k * 90; TL.push(line([[-20, y], [W * 0.3, y + 6], [W * 0.7, y - 4], [W + 20, y + 2]], sd + 210 + k, t, 2.4, 0.6)); }
          tblL.setAttribute('d', TL.join(' '));
          // rolled plans, T-square, desk lamp (on the table, below the caption band)
          const rl = [[110, 1420], [560, 1395], [570, 1450], [120, 1475]];
          roll.setAttribute('d', loop(rl, sd + 220, t, 0.7, true) + ' ' + loop(ell(115, 1447, 22, 28, 10), sd + 221, t, 0.5, true));
          rollR.setAttribute('d', ring(rl, sd + 222, t, 4.5, 0.7) + ' ' + ring(ell(115, 1447, 22, 28, 10), sd + 223, t, 4, 0.5, true) + ' ' + line([[300, 1405], [305, 1462]], sd + 224, t, 6, 0.5));
          const ts = [[600, 1530], [1040, 1505], [1042, 1530], [602, 1556]], tsh = [[600, 1480], [630, 1480], [632, 1640], [602, 1640]];
          tsq.setAttribute('d', loop(ts, sd + 230, t, 0.5) + ' ' + loop(tsh, sd + 231, t, 0.5));
          tsqR.setAttribute('d', ring(ts, sd + 232, t, 4, 0.5) + ' ' + ring(tsh, sd + 233, t, 4, 0.5));
          const lx = 900, ly = 1400, sh = [[lx - 70, ly - 30], [lx + 70, ly - 30], [lx + 40, ly - 110], [lx - 40, ly - 110]];
          lamp.setAttribute('d', loop(sh, sd + 240, t, 0.6, true));
          lampR.setAttribute('d', ring(sh, sd + 241, t, 4.5, 0.6, true) + ' ' + line([[lx, ly - 30], [lx + 20, ly + 40], [lx - 10, ly + 90]], sd + 242, t, 6, 0.6) + ' ' + ring(ell(lx - 10, ly + 96, 60, 14, 12), sd + 243, t, 4, 0.5, true));
          lampGlow.setAttribute('d', loop([[lx - 70, ly - 30], [lx + 70, ly - 30], [lx + 160, ly + 60 + 6 * Math.sin(lt * 2)], [lx - 160, ly + 60 + 6 * Math.sin(lt * 2)]], sd + 244, t, 0.5, true));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hd_cut
  SH.hd_cut = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 9701, top = el(svg, 'g'), root = el(top, 'g');
      const ice = P.water === 'ice';
      const bed = 1420, TOPS = P.tops || [330, 250, 300], COLS = [[30, 370, TOPS[0]], [370, 710, TOPS[1]], [710, 1050, TOPS[2]]], LIFT = 118;
      const bedF = inkEl(root, ROCK()), bedH = inkEl(root, ROCK_D()), bedR = inkEl(root);
      const cols = COLS.map(() => ({ f: inkEl(root, CONC()), lifts: inkEl(root, INK.inkSoft), r: inkEl(root) }));
      const pipeO = inkEl(root, INK.ink), pipeI = inkEl(root, INK.paperDark), flowE = inkEl(root, ice ? ICE() : WATER()), frost = inkEl(root, INK.paperLight), frostR = inkEl(root, ICE_D());
      const hdrO = inkEl(root, INK.ink), hdrI = inkEl(root, INK.paperDark), hdrFlow = inkEl(root, ice ? ICE() : WATER()), valve = inkEl(root, INK.red), valveR = inkEl(root);
      const groutE = inkEl(root, mix(INK.inkSoft, INK.ink, 0.25));
      const st = steam(el(root, 'g'), sd + 40);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      // static pipes: one serpentine coil per lift + a riser per column
      const coils = [];
      COLS.forEach(([x0, x1, yT], ci) => {
        for (let y = bed - 40, k = 0; y > yT + 50; y -= LIFT, k++) {
          const a = x0 + 40, b = x1 - 40, y1 = y, y2 = y - 44;
          const pts = ci % 2 ? [[b, y1], [a, y1], [a, y2], [b, y2]] : [[a, y1], [b, y1], [b, y2], [a, y2]];
          coils.push({ pts, ci, k });
        }
      });
      coils.sort((p, q) => p.k - q.k || p.ci - q.ci);
      const risers = COLS.map(([x0, x1, yT], ci) => { const x = ci % 2 ? x1 - 24 : x0 + 24; return [[x, bed + 110], [x, yT + 60]]; });
      const header = [[-40, bed + 110], [W + 40, bed + 110]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pa = atOr(cues, P.pipes, 0), fa = atOr(cues, P.flow, null), hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const fp = fa != null && lt >= fa ? prog(lt, fa, 1.6) : 0;
          const H0 = (P.heat || [0.7, 0.7])[0], H1 = (P.heat || [0.7, 0.7])[1], heat = lerp(H0, H1, fp);
          const ga = atOr(cues, P.grout, null), grp = ga != null && lt >= ga ? prog(lt, ga, 0.9) : 0;
                    // bedrock
          bedF.setAttribute('d', loop([[-40, bed], [W + 40, bed], [W + 40, H + 40], [-40, H + 40]], sd + 1, t, 0.6));
          bedR.setAttribute('d', line([[-40, bed], [W + 40, bed]], sd + 2, t, 6, 0.6));
          const BH = []; for (let i = 0; i < 16; i++) { const x = hn(sd + i, 1) * W, y = bed + 200 + hn(sd + i, 2) * (H - bed - 220); BH.push(line([[x, y], [x + 50 + hn(i, 3) * 60, y + 10]], sd + 10 + i, t, 4, 0.6)); }
          bedH.setAttribute('d', BH.join(' '));
          // columns with lifts, hot tint
          COLS.forEach(([x0, x1, yT], i) => {
            const c = cols[i], q = rect(x0 + 4, yT, x1 - 4, bed + 4);
            c.f.setAttribute('fill', heatCol(heat * (0.85 + 0.15 * Math.sin(lt * 2 + i))));
            c.f.setAttribute('d', loop(q, sd + 20 + i, t, 0.7));
            c.r.setAttribute('d', ring(q, sd + 30 + i, t, 6, 0.7));
            const LL = []; for (let y = bed - LIFT + 30; y > yT + 20; y -= LIFT) LL.push(line([[x0 + 10, y], [x1 - 10, y]], sd + 300 + i * 20 + Math.round(y / 10), t, 2.6, 0.5));
            c.lifts.setAttribute('d', LL.join(' '));
          });
          // pipes draw in
          const pp = lt >= pa ? lin(lt, pa, P.pdur ?? 2.2) : 0, O = [], I = [];
          const nC = coils.length;
          coils.forEach((c, i) => { const f = clamp01(pp * nC - i); if (f <= 0) return; const q = cut(c.pts, f); if (q.length > 1) { O.push(line(q, sd + 400 + i, t, 18, 0.5, 0)); I.push(line(q, sd + 500 + i, t, 7, 0.5, 0)); } });
          const rp = clamp01(pp * 3);
          risers.forEach((r, i) => { if (rp > 0) { const q = cut(r, rp); O.push(line(q, sd + 600 + i, t, 22, 0.5, 0)); I.push(line(q, sd + 610 + i, t, 9, 0.5, 0)); } });
          pipeO.setAttribute('d', O.join(' ')); pipeI.setAttribute('d', I.join(' '));
          if (ga != null) {   // grout fills the pipes coil by coil (grey creeping along each coil)
            const GR = [];
            coils.forEach((c, i) => { const f = clamp01(grp * 1.6 - (i / nC) * 0.6); if (f <= 0) return; const q = cut(c.pts, f); if (q.length > 1) GR.push(line(q, sd + 1200 + i, t, 12, 0.5, 0)); });
            risers.forEach((r, i) => { const q = cut(r, clamp01(grp * 2)); if (q.length > 1) GR.push(line(q, sd + 1300 + i, t, 11, 0.5, 0)); });
            groutE.setAttribute('d', GR.join(' '));
          }
          hdrO.setAttribute('d', line(header, sd + 620, t, 34, 0.5, 0)); hdrI.setAttribute('d', line(header, sd + 621, t, 16, 0.5, 0));
          valve.setAttribute('d', loop(ell(W * 0.5, bed + 110, 38, 38, 14), sd + 622, t, 0.6, true));
          const va = lt * 0.6;
          valveR.setAttribute('d', ring(ell(W * 0.5, bed + 110, 38, 38, 14), sd + 623, t, 5, 0.6, true) + ' ' + [0, 1].map(k => line([[W * 0.5 + Math.cos(va + k * 1.57) * 36, bed + 110 + Math.sin(va + k * 1.57) * 36], [W * 0.5 - Math.cos(va + k * 1.57) * 36, bed + 110 - Math.sin(va + k * 1.57) * 36]], sd + 624 + k, t, 4, 0.4)).join(' '));
          // water flow
          const F = [], HF = [];
          if (fp > 0) {
            coils.forEach((c, i) => dashes(c.pts, (lt - fa) * 160 + i * 13, 46, 20, clamp01(fp * 1.5 - c.k * 0.05)).forEach((s, j) => F.push(line(s, sd + 700 + i * 7 + j, t, 6, 0.3, 0))));
            HF.push(...dashes(header, (lt - fa) * 220, 70, 30).map((s, j) => line(s, sd + 900 + j, t, 12, 0.3, 0)));
          }
          flowE.setAttribute('d', F.join(' ')); hdrFlow.setAttribute('d', HF.join(' '));
          // frost on the pipes (ice water)
          const FR = [], FRR = [];
          if (ice && fp > 0.15) coils.forEach((c, i) => { const n = Math.floor(clamp01((fp - 0.15) * 1.4) * 6); for (let k = 0; k < n; k++) { const p = at(c.pts, plen(c.pts) * (k + 0.5) / 6), s = 9; const star = [[p[0] - s, p[1] - 14], [p[0] + s, p[1] - 14 + 4]]; FR.push(line(star, sd + 1000 + i * 6 + k, t, 4, 0.3)); FRR.push(line([[p[0], p[1] - 22], [p[0], p[1] - 6]], sd + 1100 + i * 6 + k, t, 3, 0.3)); } });
          frost.setAttribute('d', FR.join(' ')); frostR.setAttribute('d', FRR.join(' '));
          // steam fades as the concrete cools
          const sk = clamp01((heat - 0.2) / 0.5);
          if (P.steam !== false && sk > 0.05) st.update(lt, t, 0, { n: 9, rise: 260, w: 9, k: sk, spread: 200 }, COLS.map(([x0, x1, yT]) => [(x0 + x1) / 2, yT]));
          else st.update(lt, t, null);
          root.setAttribute('transform', `translate(${f1(W / 2)} ${f1(H / 2)}) scale(${(1 + 0.012 * hit).toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H / 2)})`);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hd_plant
  SH.hd_plant = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 9901, top = el(svg, 'g'), root = el(top, 'g');
      const dikeTop = 1010, dikeBot = 1340;
      const damF = inkEl(root, mix(CONC(), INK.paperLight, 0.3)), damR = inkEl(root, INK.inkSoft), wallF = inkEl(root, mix(ROCK(), INK.paperLight, 0.35));
      const rv = river(el(root, 'g'), sd + 10, W, H);
      const dikeF = inkEl(root, mix(INK.stain, INK.gold, 0.3)), dikeR = inkEl(root), dikeH = inkEl(root, INK.inkSoft);
      const pipeO = inkEl(root, INK.ink), pipeI = inkEl(root, ICE()), pipeFr = inkEl(root, INK.paperLight);
      const shedF = inkEl(root, WOOD()), roofF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), shedR = inkEl(root), shedL = inkEl(root, WOOD_D()), winF = inkEl(root, INK.gold, { 'fill-opacity': 0.6 });
      const tankF = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.25)), tankR = inkEl(root);
      const vap = steam(el(root, 'g'), sd + 40);
      const ice = el(root, 'g'), iceF = inkEl(ice, ICE()), iceS = inkEl(ice, ICE_D()), iceR = inkEl(ice), iceHi = inkEl(ice, INK.paperLight);
      const cnt = el(top, 'g');
      const cntBox = inkEl(cnt, INK.red), cntBoxR = inkEl(cnt);
      const cntT = el(cnt, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': (P.count && P.count.size) || 104, 'text-anchor': 'middle', fill: INK.paperLight });
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      // ice blocks in the foreground: a pyramid pile
      const blocks = [];
      const rows = [[6, 1700], [5, 1590], [4, 1480], [3, 1370]];
      rows.forEach(([n, y], r) => { for (let i = 0; i < n; i++) blocks.push({ x: W / 2 + (i - (n - 1) / 2) * 168 + (r % 2 ? 0 : 0), y, k: blocks.length }); });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pa = atOr(cues, P.plant, 0.1), ca = atOr(cues, P.hit, dur * 0.6), hit = punch(lt, ca);
          // far: dam between canyon walls on the left
          wallF.setAttribute('d', loop([[-40, 300], [140, 360], [200, 600], [260, 1010], [-40, 1010]], sd + 1, t, 0.8, true) + ' ' + loop([[W + 40, 280], [W - 120, 340], [W - 200, 640], [W - 240, 1010], [W + 40, 1010]], sd + 2, t, 0.8, true));
          const dm = [[120, 440], [440, 440], [400, 1010], [180, 1010]];
          damF.setAttribute('d', loop(dm, sd + 3, t, 0.7)); damR.setAttribute('d', ring(dm, sd + 4, t, 3.5, 0.7) + ' ' + [1, 2, 3, 4].map(i => line([[lerp(120, 440, i / 5), 444], [lerp(180, 400, i / 5), 1006]], sd + 5 + i, t, 2, 0.5)).join(' '));
          rv.update(lt, t, dikeTop - 30);
          // cofferdam embankment
          const dk = [[-40, dikeBot], [-40, dikeTop + 20], [200, dikeTop], [W - 120, dikeTop - 10], [W + 40, dikeTop + 30], [W + 40, dikeBot]];
          dikeF.setAttribute('d', loop(dk, sd + 20, t, 0.8, true)); dikeR.setAttribute('d', line(dk.slice(1, -1), sd + 21, t, 6, 0.8));
          dikeH.setAttribute('d', [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const x = 40 + i * 130, y = dikeTop + 90 + (i % 3) * 70; return line([[x, y], [x + 60, y + 6]], sd + 22 + i, t, 3, 0.6); }).join(' '));
          // frosted pipes from the plant to the dam
          const pipes = [[[560, 900], [400, 900], [330, 860], [300, 760]], [[560, 950], [380, 950], [290, 900], [250, 800]]];
          pipeO.setAttribute('d', pipes.map((p, i) => line(p, sd + 30 + i, t, 30, 0.5, 0)).join(' '));
          pipeI.setAttribute('d', pipes.map((p, i) => line(p, sd + 32 + i, t, 16, 0.5, 0)).join(' '));
          const FR = []; pipes.forEach((p, i) => { for (let k = 0; k < 6; k++) { const q = at(p, plen(p) * (k + 0.5) / 6); FR.push(line([[q[0] - 8, q[1] - 22], [q[0] + 8, q[1] - 14]], sd + 40 + i * 6 + k, t, 4, 0.3)); } });
          pipeFr.setAttribute('d', FR.join(' '));
          // the plant: plank shed with a pitched roof + tanks
          const sx0 = 520, sx1 = 1000, sy0 = 760, sy1 = dikeTop + 6;
          const shed = rect(sx0, sy0, sx1, sy1), roof = [[sx0 - 30, sy0 + 6], [(sx0 + sx1) / 2, sy0 - 150], [sx1 + 30, sy0 + 6]];
          shedF.setAttribute('d', loop(shed, sd + 50, t, 0.7)); roofF.setAttribute('d', loop(roof, sd + 51, t, 0.7));
          shedR.setAttribute('d', ring(shed, sd + 52, t, 5, 0.7) + ' ' + line(roof, sd + 53, t, 6, 0.7) + ' ' + ring(rect(sx0 + 40, sy0 + 70, sx0 + 150, sy0 + 170), sd + 54, t, 4, 0.5) + ' ' + ring(rect(sx1 - 150, sy0 + 70, sx1 - 40, sy0 + 170), sd + 55, t, 4, 0.5) + ' ' + ring(rect(sx0 + 200, sy0 + 90, sx0 + 290, sy1), sd + 56, t, 4, 0.5));
          winF.setAttribute('d', loop(rect(sx0 + 44, sy0 + 74, sx0 + 146, sy0 + 166), sd + 57, t, 0.4) + ' ' + loop(rect(sx1 - 146, sy0 + 74, sx1 - 44, sy0 + 166), sd + 58, t, 0.4));
          const SL = []; for (let x = sx0 + 30; x < sx1; x += 40) SL.push(line([[x, sy0 + 10], [x, sy1 - 6]], sd + 60 + x, t, 1.8, 0.4)); shedL.setAttribute('d', SL.join(' '));
          const tks = [[sx1 - 60, sy0 - 90, 34, 120], [sx1 - 130, sy0 - 70, 30, 100]];
          tankF.setAttribute('d', tks.map(([x, y, r, h], i) => loop([[x - r, y], [x + r, y], [x + r, y + h], [x - r, y + h]], sd + 70 + i, t, 0.6)).join(' '));
          tankR.setAttribute('d', tks.map(([x, y, r, h], i) => ring([[x - r, y], [x + r, y], [x + r, y + h], [x - r, y + h]], sd + 72 + i, t, 4, 0.6)).join(' '));
          vap.update(lt, t, 0, { n: 8, rise: 380, w: 12, k: 1, spread: 60 }, [[sx1 - 60, sy0 - 92], [sx1 - 130, sy0 - 72]]);
          // ice blocks pile up from cue "plant"
          const nB = blocks.length, F = [], S = [], R = [], HI = [];
          blocks.forEach((b, i) => {
            const a = pa + i * ((dur - pa - 0.6) / nB) * 0.85; if (lt < a) return;
            const p = spring(lt, a, 0.5), drop = (1 - p) * -160, w = 158, h = 104, x = b.x, y = b.y + drop;
            const fr = rect(x - w / 2, y - h, x + w / 2, y), sd2 = [[x + w / 2, y - h], [x + w / 2 + 14, y - h - 12], [x + w / 2 + 14, y - 12], [x + w / 2, y]];
            if (P.ghost) { dashes(fr.concat([fr[0]]), 0, 30, 16).forEach((q, j) => R.push(line(q, sd + 180 + i * 40 + j, t, 4, 0.4, 0, false))); }
            else { F.push(loop(fr, sd + 100 + i, t, 0.6)); S.push(loop(sd2, sd + 140 + i, t, 0.6)); R.push(ring(fr, sd + 180 + i, t, 4.5, 0.6)); }
            HI.push(line([[x - w / 2 + 18, y - h + 20], [x - w / 2 + 60, y - h + 20]], sd + 220 + i, t, 5, 0.4), line([[x - 14, y - 40], [x + 24, y - 60]], sd + 260 + i, t, 3, 0.4));
          });
          iceF.setAttribute('d', F.join(' ')); iceS.setAttribute('d', P.ghost ? '' : S.join(' ')); iceR.setAttribute('d', R.join(' ')); iceHi.setAttribute('d', P.ghost ? '' : HI.join(' '));
          if (P.ghost) iceR.setAttribute('fill', mix(INK.blue, INK.ink, 0.3));
          // counter
          if (P.count) {
            const C = P.count, cp = lt >= ca ? prog(lt, ca, 1.0) : 0, v = Math.round((C.to ?? 1000) * cp);
            const txt = (C.prefix || '') + v.toLocaleString('en-US') + (C.suffix ?? ' TONS');
            cntT.textContent = txt;
            const x = (C.x ?? 0.62) * W, y = (C.y ?? 0.19) * H, size = C.size || 104, w = txt.length * size * 0.62 + 50, h = size * 1.3;
            const b = boil(sd + 300, t, 1.2), s = (cp > 0 ? lerp(0.6, 1, spring(lt, ca, 0.5)) : 0) * (1 + 0.08 * hit);
            cnt.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-3) scale(${s.toFixed(3)})`);
            const bx = [[-w / 2, -h / 2], [w / 2, -h / 2 - 4], [w / 2 + 3, h / 2], [-w / 2 - 2, h / 2 + 3]];
            cntBox.setAttribute('d', inkLoop(bx, { seed: sd + 301, t, smooth: false })); cntBoxR.setAttribute('d', inkPath(bx, { w: 5, seed: sd + 302, t, closed: true, smooth: false }));
            cntT.setAttribute('y', f1(size * 0.34));
          }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
