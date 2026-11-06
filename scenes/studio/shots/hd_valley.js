// hd_valley: shots for the Stickstory Short "Hessdalen lights" (2026-11-06): since the early 1980s glowing balls of light
// hover over the Hessdalen valley in central Norway (15–20 sightings a week at the 1981–84 peak, sometimes for over an
// hour); Project Hessdalen came with cameras and radar in 1984; one idea says the valley works like a giant battery
// (Monari 2014: the two valley sides are electrodes, the river the electrolyte); since 1998 an automatic station (the
// "Blue Box") keeps watching with live cameras. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only
// (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any "strange light over a snowy valley" story. Uses lh__lib.js (LH.kasif, LH.label, LH.clock).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   orb = [x, y, r] (0..1, 0..1, px) the glowing ball; gy: ground line 0..1 H; front: top of the foreground snow 0..1 H
//
// SHOTS.hd_valley — the snowy valley. P: {mode, night (default true except "sign"), gy, front, orb, labels, kasif}
//   "hook":  night; a big glowing ball hovers over the valley between the two dark slopes; red farmhouses with lit
//            windows below, its glow on the snow; flares on cue "hit"
//   "sign":  daylight snow; a wooden signpost "HESSDALEN" by a red farmhouse, pines, falling snow (cue "hit")
//   "hover": night; the ball hangs low over a farm roof; a wall clock (P.clock [x, y, r]) races through an hour
//   "end":   night; Kaşif waves / points (K.seq), the ball drifts over the ridge
// SHOTS.hd_window — inside a farmhouse at night, a big window onto the valley with the ball outside.
//   P: {mode: "tally" | "look", win: [cx, cy, w, h] (0..1), labels, tally: [x, y] (0..1)}
//   "tally": a sheet "THIS WEEK" pinned on the wall fills with tally marks up to P.count (20) by cue "full"
//   "look":  a villager (hatless, sweater) at the window; on cue "hit" the ball flares and he leans back in surprise
// SHOTS.hd_camp — P: {mode: "radar" | "box", labels, orb}
//   "radar": a 1984 snow camp: wooden hut, a radar dish on a mast (turns, pings from cue "radar"), a camera on a
//            tripod aimed at the ball (from cue "cam"), two scientists in knit caps
//   "box":   night; the blue container station on the slope, a mast camera tracking the ball, red REC light (cue "hit")
// SHOTS.hd_battery — full-frame cross-section of the valley: "+" rock on the left, "−" rock on the right, the river at
//   the bottom of the V; current runs through the rock (from cue "flow"), sparks rise and a ball forms (cue "hit").
//   P: {labels, kasif}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SNOW = n => n ? mix(INK.blue, INK.paperLight, 0.5) : mix(INK.paperLight, INK.blue, 0.06);
  const SNOW_S = n => n ? mix(INK.blue, INK.ink, 0.12) : mix(INK.paperLight, INK.blue, 0.3);
  const HILL_F = n => n ? mix(INK.blue, INK.ink, 0.35) : mix(INK.blue, INK.paperLight, 0.55);
  const HILL_M = n => n ? mix(INK.blue, INK.ink, 0.55) : mix(INK.blue, INK.paperLight, 0.35);
  const PINE = n => n ? mix(INK.green, INK.ink, 0.72) : mix(INK.green, INK.ink, 0.45);
  const HOUSE = n => n ? mix(INK.red, INK.ink, 0.35) : mix(INK.red, INK.ink, 0.1);
  const LIT = () => mix(INK.gold, INK.paperLight, 0.4);
  const GLOW = () => mix(INK.gold, INK.paperLight, 0.3);
  const NIGHT_SKY = () => mix(INK.blue, INK.ink, 0.5);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const prof = (W, y, amp, f, ph, step = 40) => { const P = []; for (let x = -60; x <= W + 60; x += step) P.push([x, y - amp * (0.6 * Math.sin(x * f + ph) + 0.4 * Math.sin(x * f * 2.3 + ph * 1.7))]); return P; };

  // ------------------------------------------------------------------ the glowing ball
  function orb(parent, sd) {
    const pool = inkEl(parent, GLOW(), { 'fill-opacity': 0.28 });
    const h3 = inkEl(parent, INK.gold, { 'fill-opacity': 0.12 }), h2 = inkEl(parent, INK.gold, { 'fill-opacity': 0.2 }), h1 = inkEl(parent, GLOW(), { 'fill-opacity': 0.5 });
    const core = inkEl(parent, GLOW()), hot = inkEl(parent, INK.paperLight), rays = inkEl(parent, mix(INK.gold, INK.paperLight, 0.5));
    return {
      update(t, x, y, r, o = {}) {
        const k = o.k ?? 1;
        if (k <= 0.01) { blank(pool, h3, h2, h1, core, hot, rays); return; }
        const fl = 1 + 0.05 * Math.sin(t * 7.3 + sd) + 0.03 * Math.sin(t * 13.1) + 0.35 * (o.flare || 0), R = r * k * fl;
        h3.setAttribute('d', inkCircle(x, y, R * 3.1, sd, t, { fill: true }));
        h2.setAttribute('d', inkCircle(x, y, R * 2.1, sd + 1, t, { fill: true }));
        h1.setAttribute('d', inkCircle(x, y, R * 1.45, sd + 2, t, { fill: true }));
        core.setAttribute('d', inkCircle(x, y, R, sd + 3, t, { fill: true }));
        hot.setAttribute('d', inkCircle(x - R * 0.12, y - R * 0.12, R * 0.55, sd + 4, t, { fill: true }));
        const RY = [];
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * Math.PI * 2 + t * 0.4, r0 = R * 1.25, r1 = R * (1.75 + 0.25 * Math.sin(t * 5 + i * 1.7) + 0.6 * (o.flare || 0));
          RY.push(inkPath([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 5 * Math.max(0.6, r / 90), seed: sd + 10 + i, t, taper: 0.8 }));
        }
        rays.setAttribute('d', RY.join(' '));
        pool.setAttribute('d', o.ground != null ? inkLoop(inkEllipsePts(x, o.ground, R * 3.2, R * 0.55, sd + 30, 14, 0, 0.08), { seed: sd + 30, t, amp: 0.8 }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ valley slopes (far + mid) and pine dots
  function valley(parent, sd) {
    const far = inkEl(parent), farR = inkEl(parent), mid = inkEl(parent), midR = inkEl(parent), caps = inkEl(parent), pines = inkEl(parent);
    return {
      update(t, W, H, gy, n, o = {}) {
        const u = W / 1080, V = (x, depth, top) => { const d = Math.abs(x / W - (o.cx ?? 0.5)) * 2; return gy - top * u * Math.pow(d, 1.3) - depth * u + 14 * u * Math.sin(x * 0.01 + sd); };
        far.setAttribute('fill', HILL_F(n)); mid.setAttribute('fill', HILL_M(n));
        caps.setAttribute('fill', SNOW(n)); pines.setAttribute('fill', PINE(n));
        const FP = [], MP = [];
        for (let x = -60; x <= W + 60; x += 40) { FP.push([x, V(x, 150, 520)]); MP.push([x, V(x, 40, 300) + 30 * u * Math.sin(x * 0.006 + 2)]); }
        far.setAttribute('d', inkLoop(FP.concat([[W + 60, gy + 80], [-60, gy + 80]]), { seed: sd, t, amp: 0.7 }));
        farR.setAttribute('d', inkPath(FP, { w: 4, seed: sd + 1, t }));
        mid.setAttribute('d', inkLoop(MP.concat([[W + 60, gy + 120], [-60, gy + 120]]), { seed: sd + 2, t, amp: 0.7 }));
        midR.setAttribute('d', inkPath(MP, { w: 5, seed: sd + 3, t }));
        // snow streaks on the far slopes
        const C = [];
        for (let i = 0; i < 9; i++) { const x = (0.05 + i * 0.11) * W, y = V(x, 150, 520) + 26 * u; C.push(inkPath([[x - 50 * u, y + 30 * u], [x, y], [x + 60 * u, y + 40 * u]], { w: 7, seed: sd + 10 + i, t, taper: 0.7 })); }
        caps.setAttribute('d', C.join(' '));
        // little spruces on the mid slope
        const PN = [];
        for (let i = 0; i < 22; i++) { const x = hn(sd + 4, i) * W, y = V(x, 40, 300) + 30 * u * Math.sin(x * 0.006 + 2) + (10 + 30 * hn(sd + 5, i)) * u, h = (40 + 34 * hn(sd + 6, i)) * u;
          if (Math.abs(x / W - (o.cx ?? 0.5)) < 0.08) continue;
          PN.push(inkLoop([[x, y - h], [x + h * 0.32, y], [x - h * 0.32, y]], { seed: sd + 40 + i, t, amp: 0.5, smooth: false })); }
        pines.setAttribute('d', PN.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ red wooden farmhouse with a snowy roof
  function farm(parent, sd) {
    const wall = inkEl(parent), side = inkEl(parent), roof = inkEl(parent), snow = inkEl(parent), win = inkEl(parent, LIT()), lines = inkEl(parent), smoke = inkEl(parent, mix(INK.paperDark, INK.blue, 0.3), { 'fill-opacity': 0.7 });
    return {
      update(t, x, gy, s, n, o = {}) {
        wall.setAttribute('fill', HOUSE(n)); side.setAttribute('fill', mix(HOUSE(n), INK.ink, 0.3)); roof.setAttribute('fill', mix(INK.ink, INK.blue, 0.2)); snow.setAttribute('fill', SNOW(n));
        const w = 300 * s, h = 170 * s, d = 90 * s, rh = 120 * s, x0 = x - w / 2, x1 = x + w / 2, y0 = gy - h;
        const F = rect(x0, y0, x1, gy), SD = [[x1, y0], [x1 + d, y0 - d * 0.35], [x1 + d, gy - d * 0.35], [x1, gy]];
        wall.setAttribute('d', inkLoop(F, { seed: sd, t, smooth: false, amp: 0.8 }));
        side.setAttribute('d', inkLoop(SD, { seed: sd + 1, t, smooth: false, amp: 0.8 }));
        const R = [[x0 - 24 * s, y0 + 6 * s], [x + d * 0.1, y0 - rh], [x1 + d + 10 * s, y0 - rh - d * 0.2], [x1 + d + 24 * s, y0 - d * 0.35 + 4 * s], [x1 + 20 * s, y0 + 6 * s]];
        roof.setAttribute('d', inkLoop(R, { seed: sd + 2, t, smooth: false, amp: 0.8 }));
        snow.setAttribute('d', inkLoop([[x0 - 20 * s, y0 - 2 * s], [x + d * 0.1, y0 - rh - 14 * s], [x1 + d + 10 * s, y0 - rh - d * 0.2 - 14 * s], [x1 + d + 20 * s, y0 - d * 0.35 - 8 * s], [x1 + d - 20 * s, y0 - d * 0.35 + 6 * s], [x1 + 4 * s, y0 - 18 * s], [x + d * 0.1, y0 - rh + 20 * s], [x0 + 10 * s, y0 + 8 * s]], { seed: sd + 3, t, amp: 0.8 }));
        const lit = o.lit ?? 1, Wn = [];
        [[-0.25, 0.42], [0.22, 0.42]].forEach(([fx, fy], i) => { const cx = x + fx * w, cy = y0 + fy * h, ww = 34 * s, hh = 40 * s; Wn.push(rect(cx - ww, cy - hh, cx + ww, cy + hh)); });
        win.setAttribute('fill-opacity', f1(lit));
        win.setAttribute('d', Wn.map((q, i) => inkLoop(q, { seed: sd + 4 + i, t, smooth: false, amp: 0.5 })).join(' '));
        const LL = [inkPath(F, { w: 4.5, seed: sd + 6, t, closed: true, smooth: false }), inkPath(SD, { w: 4.5, seed: sd + 7, t, closed: true, smooth: false }), inkPath(R, { w: 4.5, seed: sd + 8, t, closed: true, smooth: false })];
        Wn.forEach((q, i) => { LL.push(inkPath(q, { w: 4, seed: sd + 9 + i, t, closed: true, smooth: false })); const cx = (q[0][0] + q[1][0]) / 2, cy = (q[0][1] + q[2][1]) / 2; LL.push(inkPath([[cx, q[0][1]], [cx, q[2][1]]], { w: 3, seed: sd + 12 + i, t }), inkPath([[q[0][0], cy], [q[1][0], cy]], { w: 3, seed: sd + 14 + i, t })); });
        for (let i = 1; i < 6; i++) { const yy = y0 + i * h / 6; LL.push(inkPath([[x0 + 4 * s, yy], [x0 + w * 0.08, yy]], { w: 2.5, seed: sd + 20 + i, t }), inkPath([[x1 - w * 0.08, yy], [x1 - 4 * s, yy]], { w: 2.5, seed: sd + 26 + i, t })); }
        const dx = x - 40 * s, dh = 100 * s; LL.push(inkPath([[dx - 26 * s, gy], [dx - 26 * s, gy - dh], [dx + 26 * s, gy - dh], [dx + 26 * s, gy]], { w: 4, seed: sd + 32, t, smooth: false }));
        const chx = x1 - 30 * s, chy = y0 - rh * 0.55; LL.push(inkLoop(rect(chx - 16 * s, chy - 60 * s, chx + 16 * s, chy + 20 * s), { seed: sd + 33, t, smooth: false, amp: 0.5 }));
        lines.setAttribute('d', LL.join(' '));
        if (o.smoke !== false) {
          const SM = [];
          for (let i = 0; i < 5; i++) { const ph = (t * 0.25 + i / 5) % 1, sx = chx + ph * 120 * s + Math.sin(t * 1.2 + i) * 10 * s, sy = chy - 70 * s - ph * 240 * s, r = (14 + 30 * ph) * s; SM.push(inkCircle(sx, sy, r, sd + 40 + i, t, { fill: true })); }
          smoke.setAttribute('d', SM.join(' ')); smoke.setAttribute('fill-opacity', '0.55');
        } else smoke.setAttribute('d', '');
        return { roof: [x + d * 0.1, y0 - rh], door: [dx, gy] };
      },
    };
  }

  // ------------------------------------------------------------------ spruce trees (each a stack of snowy tiers)
  function spruces(parent, sd) {
    const body = inkEl(parent), snow = inkEl(parent), trunk = inkEl(parent, mix(INK.stain, INK.ink, 0.4)), rim = inkEl(parent);
    return {
      update(t, list, n, u) {
        body.setAttribute('fill', PINE(n)); snow.setAttribute('fill', SNOW(n));
        const B = [], S = [], T = [], R = [];
        list.forEach(([x, gy, h], i) => {
          const sw = Math.sin(t * 0.9 + i) * 4 * u;
          T.push(inkLoop(rect(x - h * 0.03, gy - h * 0.12, x + h * 0.03, gy), { seed: sd + i * 9, t, smooth: false, amp: 0.4 }));
          for (let j = 0; j < 4; j++) {
            const ty = gy - h * (0.1 + j * 0.2), tw = h * (0.34 - j * 0.07), th = h * 0.36, tx = x + sw * (j / 3);
            const P = [[tx, ty - th], [tx + tw, ty], [tx - tw, ty]];
            B.push(inkLoop(P, { seed: sd + i * 9 + j + 1, t, amp: 0.6, smooth: false }));
            R.push(inkPath(P, { w: 3.5, seed: sd + i * 9 + j + 5, t, closed: true, smooth: false }));
            S.push(inkLoop([[tx - tw * 0.85, ty - 4 * u], [tx, ty - th * 0.35], [tx + tw * 0.85, ty - 4 * u], [tx, ty - th * 0.22]], { seed: sd + i * 9 + j + 50, t, amp: 0.4 }));
          }
        });
        body.setAttribute('d', B.join(' ')); snow.setAttribute('d', S.join(' ')); trunk.setAttribute('d', T.join(' ')); rim.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ foreground snow bank down to the frame bottom
  function snowFront(parent, sd) {
    const back = inkEl(parent), fill = inkEl(parent), shade = inkEl(parent), edge = inkEl(parent), posts = inkEl(parent, mix(INK.stain, INK.ink, 0.45)), postsR = inkEl(parent), tracks = inkEl(parent);
    const tr = spruces(el(parent, 'g'), sd + 200);
    return {
      update(t, W, H, top, n, o = {}) {
        const u = W / 1080, ph = o.ph ?? sd * 0.37;
        back.setAttribute('fill', mix(SNOW(n), SNOW_S(n), 0.45)); fill.setAttribute('fill', SNOW(n)); shade.setAttribute('fill', SNOW_S(n)); tracks.setAttribute('fill', SNOW_S(n));
        const P0 = prof(W, top - 30 * u, 22 * u, 0.004, ph + 2);
        back.setAttribute('d', inkLoop(P0.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.8 }));
        const P1 = prof(W, top + 80 * u, 36 * u, 0.0035, ph);
        fill.setAttribute('d', inkLoop(P1.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 2, t, amp: 0.8 }));
        const SH2 = [];
        for (let i = 0; i < 7; i++) { const y = top + 200 * u + i * (H - top - 200 * u) / 7, x = hn(sd + 3, i) * W; SH2.push(inkLoop(inkEllipsePts(x, y, (160 + 120 * hn(sd + 4, i)) * u, 22 * u, sd + 10 + i, 12, 0, 0.1), { seed: sd + 10 + i, t, amp: 0.6 })); }
        shade.setAttribute('d', SH2.join(' '));
        edge.setAttribute('d', inkPath(P1, { w: 6, seed: sd + 5, t }) + ' ' + inkPath(P0, { w: 3.5, seed: sd + 6, t }));
        // fence posts with a sagging rail, half buried
        const PS = [], PR = [];
        if (o.fence !== false) {
          const xs = o.fenceX ?? [0.06, 0.2, 0.34];
          xs.forEach((q, i) => { const x = q * W, y = top + 120 * u + i * 18 * u, h = (150 - i * 14) * u; const R = rect(x - 12 * u, y - h, x + 12 * u, y + 30 * u); PS.push(inkLoop(R, { seed: sd + 20 + i, t, smooth: false, amp: 0.5 })); PR.push(inkPath(R, { w: 4, seed: sd + 30 + i, t, closed: true, smooth: false })); });
          for (let i = 0; i < xs.length - 1; i++) { const a = [xs[i] * W, top + 60 * u + i * 18 * u], b = [xs[i + 1] * W, top + 78 * u + i * 18 * u]; PR.push(inkPath([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 14 * u], b], { w: 5, seed: sd + 40 + i, t })); }
        }
        posts.setAttribute('d', PS.join(' ')); postsR.setAttribute('d', PR.join(' '));
        // footprints in the snow
        const TK = [];
        for (let i = 0; i < 8; i++) { const y = top + 260 * u + i * 70 * u, x = (o.trackX ?? 0.62) * W + (i % 2 ? 26 : -26) * u + i * 14 * u; TK.push(inkDot(x, y, (20 + i * 2) * u, (9 + i) * u, sd + 50 + i, t)); }
        tracks.setAttribute('d', o.tracks === false ? '' : TK.join(' '));
        tr.update(t, o.trees ?? [[0.94 * W, top + 300 * u, 520 * u], [1.04 * W, top + 380 * u, 640 * u]], n, u);
      },
    };
  }

  // ------------------------------------------------------------------ falling snow
  function snowfall(parent, sd) {
    const e = inkEl(parent, INK.paperLight);
    return {
      update(t, W, H, n = 40, u = 1, wind = 0.3, sz = 1) {
        const D = [];
        for (let i = 0; i < n; i++) {
          const sp = (60 + 70 * hn(sd, i)) * sz, y = ((hn(sd + 1, i) * H + t * sp * u) % (H + 40)) - 20, x = (hn(sd + 2, i) * W + Math.sin(t * 0.8 + i) * 24 * u + t * wind * 30 * u) % W, r = (3 + 4 * hn(sd + 3, i)) * u * sz;
          D.push(inkDot(x, y, r, r, sd + 10 + i, t, 0.3));
        }
        e.setAttribute('d', D.join(' '));
      },
    };
  }

  // a knit-cap scientist / villager (hatless cast, Kaşif rig)
  function person(parent, sd, sc, o = {}) {
    const g = el(parent, 'g');
    const coat = inkEl(g, o.coat || mix(INK.blue, INK.ink, 0.25)), coatR = inkEl(g);
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: o.accessory === undefined ? 'beret' : o.accessory, beard: o.beard ?? null, seed: sd });
    return {
      update(t, pose, op) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, Wp = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.7), lerp(hip[1], hd[1], 0.7)];
        const C = [[sh[0] - 44 * sc, sh[1] - 6 * sc], [sh[0] + 44 * sc, sh[1] - 6 * sc], [hip[0] + 52 * sc, hip[1] + 30 * sc], [hip[0] - 52 * sc, hip[1] + 30 * sc]];
        coat.setAttribute('d', inkLoop(C, { seed: sd + 1, t, amp: 0.8 }));
        coatR.setAttribute('d', inkPath(C, { w: 4.5, seed: sd + 2, t, closed: true }) + ' ' + inkPath([[lerp(sh[0], hip[0], 0) , sh[1]], [hip[0], hip[1] + 26 * sc]], { w: 3, seed: sd + 3, t }));
        r.W = Wp; r.headW = hd;
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.hd_valley
  SH.hd_valley = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 211, u = W / 1080, mode = P.mode || 'hook';
      const night = P.night ?? (mode !== 'sign');
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.7) * H;
      const root = el(svg, 'g');
      const vl = valley(el(root, 'g'), sd + 10);
      const far = orb(el(root, 'g'), sd + 600);
      const farms = [farm(el(root, 'g'), sd + 30), farm(el(root, 'g'), sd + 90)];
      const trees = spruces(el(root, 'g'), sd + 150);
      const sign = mode === 'sign' ? { post: inkEl(root, mix(INK.stain, INK.ink, 0.35)), board: inkEl(root, INK.paperLight), r: inkEl(root),
        tx: el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 60 * u, 'text-anchor': 'middle', fill: INK.ink }) } : null;
      if (sign) sign.tx.textContent = (P.sign || 'HESSDALEN').toLocaleUpperCase('en-US');
      const clk = mode === 'hover' && P.clock !== false ? L.clock(el(root, 'g'), sd + 700) : null;
      const ball = mode === 'sign' ? null : orb(el(root, 'g'), sd + 500);
      const K = Object.assign({ x: 0.3, y: P.gy ?? 0.6, scale: 1.05, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const front = snowFront(el(root, 'g'), sd + 900);
      const fall = snowfall(el(root, 'g'), sd + 950);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45), fl = punch(lt, hit, 0.9);
          vl.update(t, W, H, gy, night, { cx: P.vx ?? 0.5 });
          const O = P.orb || (mode === 'hook' ? [0.5, 0.4, 95] : mode === 'hover' ? [0.36, 0.44, 70] : [0.66, 0.36, 55]);
          // a faint second ball far up the valley
          if (mode === 'sign' || P.far === false) far.update(t, 0, 0, 0, { k: 0 });
          else far.update(t, (mode === 'hook' ? 0.9 - lt * 0.1 : 0.78 + 0.03 * Math.sin(t * 0.4)) * W, (0.3 + 0.015 * Math.sin(t * 0.9)) * H, (mode === 'hook' ? 22 : 16) * u, { k: mode === 'hook' ? 1 : progIO(lt, 0.4, 1.2) });
          const FA = P.farms || (mode === 'hover' ? [[0.36, 0.02, 1.25], [0.86, -0.06, 0.55]] : mode === 'sign' ? [[0.76, 0.0, 0.92], [0.12, -0.07, 0.45]] : [[0.24, 0.0, 0.75], [0.74, -0.03, 0.6]]);
          let roof = null;
          farms.forEach((f, i) => { const q = FA[i]; if (!q) return; const r = f.update(t, q[0] * W, gy + q[1] * H, q[2] * u, night, { lit: night ? 0.9 + 0.1 * Math.sin(t * 3 + i) : 0.5 }); if (i === 0) roof = r.roof; });
          trees.update(t, (P.trees || [[0.06, 0.6, 360], [0.48, 0.585, 200], [0.56, 0.59, 260], [0.97, 0.6, 330]]).map(q => [q[0] * W, q[1] * H, q[2] * u]), night, u);
          if (ball) {
            const dm = mode === 'hook' ? 2.4 : 1, bx = O[0] * W + (Math.sin(t * 0.7) * 30 * u + Math.sin(t * 1.3) * 10 * u) * dm, by = O[1] * H + (Math.sin(t * 0.9) * 20 * u - (mode === 'hook' ? lt * 26 * u : 0));
            ball.update(t, bx, by, O[2] * u * (mode === 'hook' ? 1 + 0.16 * Math.sin(t * 3.1) : spring(lt, 0.1, 0.8)), { flare: fl });
          }
          if (sign) {
            const sx = (P.signX ?? 0.34) * W, top = gy - 330 * u, sw = Math.sin(t * 1.4) * 1.5, k = spring(lt, atOr(cues, 'hit', 0.2), 0.6);
            sign.post.setAttribute('d', inkLoop(rect(sx - 16 * u, top, sx + 16 * u, gy + 60 * u), { seed: sd + 70, t, smooth: false, amp: 0.6 }));
            const bw = 250 * u * k, bh = 62 * u, a = sw * Math.PI / 180;
            const R2 = q => [sx + q[0] * Math.cos(a) - q[1] * Math.sin(a), top + 70 * u + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
            const B = [[-bw, -bh], [bw, -bh], [bw + 50 * u * k, 0], [bw, bh], [-bw, bh]].map(R2);
            sign.board.setAttribute('d', inkLoop(B, { seed: sd + 71, t, smooth: false, amp: 0.6 }));
            sign.r.setAttribute('d', inkPath(B, { w: 5, seed: sd + 72, t, closed: true, smooth: false }) + ' ' + inkLoop([[sx - 60 * u, top - 4 * u], [sx + 60 * u, top - 16 * u], [sx + 50 * u, top + 4 * u]], { seed: sd + 73, t, amp: 0.4 }));
            const c = R2([10 * u, 21 * u]);
            sign.tx.setAttribute('x', f1(c[0])); sign.tx.setAttribute('y', f1(c[1])); sign.tx.setAttribute('font-size', f1(60 * u * k));
            sign.tx.setAttribute('transform', `rotate(${f1(sw)} ${f1(c[0])} ${f1(c[1])})`);
          }
          if (clk) { const C = P.clock || [0.78, 0.25, 92]; clk.update(t, C[0] * W, C[1] * H, C[2] * u * spring(lt, atOr(cues, 'hour', 0.3), 0.6), lt * 0.45); }
          if (kas) kas.update(lt, t, cues);
          front.update(t, W, H, fy, night, { fence: mode !== 'hook' || P.fence === true, trees: P.frontTrees, tracks: mode === 'sign' });
          fall.update(t, W, H, night ? (mode === 'hook' ? 110 : 30) : 44, u, mode === 'hook' ? 2.2 : 0.3, mode === 'hook' ? 1.7 : 1);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.hd_window
  SH.hd_window = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 431, u = W / 1080, mode = P.mode || 'tally';
      const WN = P.win || (mode === 'look' ? [0.62, 0.36, 0.62, 0.38] : [0.66, 0.37, 0.5, 0.36]);
      const wx = WN[0] * W, wy = WN[1] * H, ww = WN[2] * W, wh = WN[3] * H, x0 = wx - ww / 2, x1 = wx + ww / 2, y0 = wy - wh / 2, y1 = wy + wh / 2;
      const root = el(svg, 'g');
      const sky = inkEl(root, NIGHT_SKY()), stars = inkEl(root, INK.paperLight);
      const hills = inkEl(root, mix(INK.blue, INK.ink, 0.7)), hillsS = inkEl(root, mix(INK.blue, INK.paperLight, 0.35));
      const ball = orb(el(root, 'g'), sd + 50);
      const wall = inkEl(root, mix(INK.paperLight, INK.stain, 0.32), { 'fill-rule': 'evenodd' }), planks = inkEl(root, mix(INK.stain, INK.ink, 0.25));
      const frame = inkEl(root, mix(INK.stain, INK.ink, 0.4)), frameR = inkEl(root);
      const curt = inkEl(root, mix(INK.red, INK.ink, 0.15)), curtR = inkEl(root);
      const spill = inkEl(root, GLOW(), { 'fill-opacity': 0.22 });
      const sheet = mode === 'tally' ? { p: inkEl(root, INK.paperLight), r: inkEl(root), marks: inkEl(root, INK.ink), pin: inkEl(root, INK.red),
        tx: el(root, 'text', { 'font-family': INK_FONT, 'font-size': 58 * u, 'text-anchor': 'middle', fill: INK.ink }) } : null;
      if (sheet) sheet.tx.textContent = (P.sheet || 'THIS WEEK').toLocaleUpperCase('en-US');
      const man = mode === 'look' ? person(el(root, 'g'), sd + 300, (P.manScale ?? 1.25) * u, { coat: mix(INK.green, INK.ink, 0.3), accessory: null, beard: 'short' }) : null;
      const table = inkEl(root, mix(INK.stain, INK.ink, 0.3)), tableT = inkEl(root, mix(INK.stain, INK.paperLight, 0.2)), tableR = inkEl(root);
      const mug = inkEl(root, INK.blue), mugR = inkEl(root), flame = inkEl(root, INK.gold), candle = inkEl(root, INK.paperLight), steam = inkEl(root, mix(INK.paperLight, INK.stain, 0.2));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), fl = punch(lt, hit, 1.0), TY = H * (P.tableY ?? 0.78);
          const WR = rect(x0, y0, x1, y1);
          sky.setAttribute('d', inkLoop(WR, { seed: sd, t, smooth: false, amp: 0.4 }));
          const ST = []; for (let i = 0; i < 18; i++) { const x = x0 + hn(sd + 1, i) * ww, y = y0 + hn(sd + 2, i) * wh * 0.55, r = (2 + 3 * hn(sd + 3, i)) * u * (0.7 + 0.3 * Math.sin(t * 2 + i)); ST.push(inkDot(x, y, r, r, sd + 10 + i, t, 0.3)); }
          stars.setAttribute('d', ST.join(' '));
          const HP = []; for (let x = x0; x <= x1 + 1; x += 20 * u) { const d = Math.abs((x - wx) / ww) * 2; HP.push([x, y0 + wh * (0.62 + 0.2 * (1 - Math.pow(d, 1.4))) - 20 * u * Math.sin(x * 0.02)]); }
          hills.setAttribute('d', inkLoop(HP.concat([[x1, y1], [x0, y1]]), { seed: sd + 4, t, amp: 0.5 }));
          hillsS.setAttribute('d', [0.1, 0.3, 0.75, 0.9].map((q, i) => { const x = x0 + q * ww, y = HP[Math.round(q * (HP.length - 1))][1] + 18 * u; return inkPath([[x - 30 * u, y + 12 * u], [x, y], [x + 34 * u, y + 16 * u]], { w: 5, seed: sd + 5 + i, t }); }).join(' '));
          const bx = x0 + ww * (P.orbX ?? 0.55) + Math.sin(t * 0.6) * 22 * u, by = y0 + wh * 0.38 + Math.sin(t * 0.9) * 14 * u;
          ball.update(t, bx, by, (P.orbR ?? 46) * u, { flare: fl });
          // wall with the window hole (evenodd), vertical planks
          wall.setAttribute('d', inkLoop(rect(-40, -40, W + 40, TY), { seed: sd + 6, t, smooth: false, amp: 0.8 }) + ' ' + inkLoop(WR, { seed: sd + 7, t, smooth: false, amp: 0.4 }));
          const PL = []; for (let i = 1; i < 12; i++) { const x = i * W / 11; if (x > x0 - 10 && x < x1 + 10) { PL.push(inkPath([[x, -20], [x + 2, y0 - 50 * u]], { w: 3, seed: sd + 20 + i, t }), inkPath([[x, y1 + 50 * u], [x + 2, TY]], { w: 3, seed: sd + 40 + i, t })); } else PL.push(inkPath([[x, -20], [x + 3, TY]], { w: 3, seed: sd + 20 + i, t })); }
          for (let i = 0; i < 16; i++) { const x = hn(sd + 60, i) * W, y = hn(sd + 61, i) * H * 0.7; if (x > x0 - 20 && x < x1 + 20 && y > y0 - 20 && y < y1 + 20) continue; PL.push(inkDot(x, y, 6 * u, 3 * u, sd + 70 + i, t, 0.3)); }
          planks.setAttribute('d', PL.join(' '));
          const fw = 30 * u, FR = [rect(x0 - fw, y0 - fw, x1 + fw, y0), rect(x0 - fw, y1, x1 + fw, y1 + fw * 1.6), rect(x0 - fw, y0, x0, y1), rect(x1, y0, x1 + fw, y1), rect(wx - 9 * u, y0, wx + 9 * u, y1), rect(x0, wy - 9 * u, x1, wy + 9 * u)];
          frame.setAttribute('d', FR.map((q, i) => inkLoop(q, { seed: sd + 80 + i, t, smooth: false, amp: 0.4 })).join(' '));
          frameR.setAttribute('d', FR.map((q, i) => inkPath(q, { w: 4, seed: sd + 90 + i, t, closed: true, smooth: false })).join(' '));
          // curtains, gently swaying
          const CU = [], CR = [];
          [-1, 1].forEach((s, i) => { const ex = s < 0 ? x0 - fw : x1 + fw, sw = Math.sin(t * 0.9 + i) * 10 * u, cw = 90 * u;
            const C = [[ex - s * cw * 0.2, y0 - fw - 30 * u], [ex + s * cw, y0 - fw - 30 * u], [ex + s * cw * 0.9 + sw, wy], [ex + s * cw * 1.1 + sw * 1.4, y1 + fw * 2], [ex - s * cw * 0.4 + sw, y1 + fw * 2], [ex - s * cw * 0.1 + sw * 0.4, wy]];
            CU.push(inkLoop(C, { seed: sd + 100 + i, t, amp: 0.8 })); CR.push(inkPath(C, { w: 4, seed: sd + 102 + i, t, closed: true }));
            for (let j = 1; j < 3; j++) CR.push(inkPath([[ex + s * cw * j / 3, y0 - fw - 20 * u], [ex + s * cw * j / 3 + sw * 1.2, y1 + fw * 1.8]], { w: 3, seed: sd + 104 + i * 3 + j, t })); });
          curt.setAttribute('d', CU.join(' ')); curtR.setAttribute('d', CR.join(' '));
          spill.setAttribute('d', inkLoop([[x0, y1 + fw * 1.6], [x1, y1 + fw * 1.6], [x1 + 120 * u, TY], [x0 - 180 * u, TY]], { seed: sd + 110, t, amp: 0.6 }));
          spill.setAttribute('fill-opacity', f1(0.18 + 0.25 * fl));
          if (sheet) {
            const TA = P.tally || [0.2, 0.38], sx = TA[0] * W, sy = TA[1] * H, sw2 = 150 * u, sh2 = 230 * u, a = Math.sin(t * 1.1) * 1.2;
            const S = rect(sx - sw2, sy - sh2, sx + sw2, sy + sh2);
            sheet.p.setAttribute('d', inkLoop(S, { seed: sd + 120, t, smooth: false, amp: 0.6 }));
            sheet.r.setAttribute('d', inkPath(S, { w: 4, seed: sd + 121, t, closed: true, smooth: false }) + ' ' + inkPath([[sx - sw2 * 0.8, sy - sh2 + 110 * u], [sx + sw2 * 0.8, sy - sh2 + 106 * u]], { w: 3, seed: sd + 122, t }));
            sheet.pin.setAttribute('d', inkDot(sx, sy - sh2 + 14 * u, 13 * u, 13 * u, sd + 123, t));
            sheet.tx.setAttribute('x', f1(sx)); sheet.tx.setAttribute('y', f1(sy - sh2 + 84 * u)); sheet.tx.setAttribute('transform', `rotate(${f1(a)} ${f1(sx)} ${f1(sy)})`);
            const full = atOr(cues, 'full', dur * 0.7), N = Math.min(P.count ?? 20, Math.floor((P.count ?? 20) * clamp01((lt - 0.15) / Math.max(0.5, full - 0.15)) + 1e-6)), M = [];
            for (let i = 0; i < N; i++) { const g5 = Math.floor(i / 5), j = i % 5, gx = sx - sw2 * 0.62 + (g5 % 2) * sw2 * 0.78, gyy = sy - sh2 + 160 * u + Math.floor(g5 / 2) * 130 * u, x = gx + j * 22 * u;
              M.push(j < 4 ? inkPath([[x, gyy], [x + 3 * u, gyy + 90 * u]], { w: 6, seed: sd + 130 + i, t, smooth: false }) : inkPath([[gx - 14 * u, gyy + 70 * u], [gx + 84 * u, gyy + 16 * u]], { w: 6, seed: sd + 130 + i, t, smooth: false })); }
            sheet.marks.setAttribute('d', M.join(' '));
          }
          if (man) {
            const pose = lt < hit ? 'point' : 'shock';
            man.update(t, pose, { x: (P.manX ?? 0.42) * W, y: H * (P.manY ?? 0.8), face: 1, since: lt < hit ? 1 : lt - hit, dir: lt < hit ? 22 : 'up', emotion: lt < hit ? 'worried' : 'surprised' });
          }
          // table front with a mug and a candle (foreground, fills the bottom of the frame)
          const ty = TY, TT = [[-40, ty - 20 * u], [W + 40, ty - 30 * u], [W + 40, ty + 50 * u], [-40, ty + 60 * u]];
          tableT.setAttribute('d', inkLoop(TT, { seed: sd + 140, t, smooth: false, amp: 0.6 }));
          table.setAttribute('d', inkLoop([[-40, ty + 50 * u], [W + 40, ty + 40 * u], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 141, t, smooth: false, amp: 0.6 }));
          const TL = [inkPath(TT, { w: 5, seed: sd + 142, t, closed: true, smooth: false })];
          for (let i = 0; i < 6; i++) TL.push(inkPath([[-20, ty + (110 + i * 90) * u], [W * 0.5, ty + (116 + i * 90) * u], [W + 20, ty + (106 + i * 90) * u]], { w: 3, seed: sd + 143 + i, t, taper: 0.5 }));
          const mx = (mode === 'look' ? 0.82 : 0.12) * W, my = ty - 10 * u, M2 = [[mx - 50 * u, my - 120 * u], [mx + 50 * u, my - 120 * u], [mx + 44 * u, my], [mx - 44 * u, my]];
          mug.setAttribute('d', inkLoop(M2, { seed: sd + 150, t, smooth: false, amp: 0.5 }));
          mugR.setAttribute('d', inkPath(M2, { w: 4.5, seed: sd + 151, t, closed: true, smooth: false }) + ' ' + inkPath([[mx + 48 * u, my - 96 * u], [mx + 86 * u, my - 80 * u], [mx + 80 * u, my - 36 * u], [mx + 46 * u, my - 30 * u]], { w: 7, seed: sd + 152, t }));
          const ST2 = []; for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1, pts = []; for (let j = 0; j < 5; j++) pts.push([mx - 20 * u + i * 20 * u + Math.sin(j + t * 3 + i) * 10 * u, my - 140 * u - ph * 80 * u - j * 22 * u]); if (ph < 0.8) ST2.push(inkPath(pts, { w: 4 * (1 - ph), seed: sd + 160 + i, t, taper: 0.8 })); }
          steam.setAttribute('d', ST2.join(' '));
          const cx = (mode === 'look' ? 0.94 : 0.34) * W;
          candle.setAttribute('d', inkLoop(rect(cx - 20 * u, ty - 150 * u, cx + 20 * u, ty - 10 * u), { seed: sd + 170, t, smooth: false, amp: 0.4 }));
          TL.push(inkPath(rect(cx - 20 * u, ty - 150 * u, cx + 20 * u, ty - 10 * u), { w: 4, seed: sd + 171, t, closed: true, smooth: false }));
          const fh = (34 + 6 * Math.sin(t * 9) + 4 * Math.sin(t * 13)) * u;
          flame.setAttribute('d', inkLoop([[cx, ty - 150 * u - fh], [cx + 14 * u, ty - 160 * u], [cx, ty - 148 * u], [cx - 14 * u, ty - 160 * u]], { seed: sd + 172, t, amp: 0.4 }));
          tableR.setAttribute('d', TL.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.hd_camp
  SH.hd_camp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 661, u = W / 1080, mode = P.mode || 'radar', night = P.night ?? (mode !== 'radar'), isCamp = mode !== 'box', doubt = mode === 'doubt';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.72) * H;
      const root = el(svg, 'g');
      const vl = valley(el(root, 'g'), sd + 10);
      const ball = orb(el(root, 'g'), sd + 50);
      const pings = inkEl(root, INK.red), beam = inkEl(root, INK.gold);
      const trees = spruces(el(root, 'g'), sd + 80);
      const hut = isCamp ? farm(el(root, 'g'), sd + 100) : null;
      const mast = inkEl(root, INK.ink), dish = inkEl(root, INK.paperLight), dishR = inkEl(root);
      const box = mode === 'box' ? { c: inkEl(root, INK.blue), s: inkEl(root, mix(INK.blue, INK.ink, 0.35)), snow: inkEl(root, SNOW(true)), r: inkEl(root), rec: inkEl(root, INK.red) } : null;
      const cam = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), camR = inkEl(root), lens = inkEl(root, INK.blue);
      const sci = isCamp ? [person(el(root, 'g'), sd + 200, 0.62 * u, { coat: mix(INK.red, INK.ink, 0.25) }), person(el(root, 'g'), sd + 260, 0.56 * u, { coat: mix(INK.green, INK.ink, 0.3), beard: 'black' })] : [];
      const front = snowFront(el(root, 'g'), sd + 900);
      const fall = snowfall(el(root, 'g'), sd + 950);
      const ST = P.stamp ? { g: el(root, 'g'), } : null;
      if (ST) { ST.box = inkEl(ST.g, INK.red); ST.tx = el(ST.g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': (P.stamp.size || 120) * u, 'text-anchor': 'middle', fill: INK.red }); ST.tx.textContent = (P.stamp.text || 'NOT PROVED').toLocaleUpperCase('en-US'); }
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), camAt = atOr(cues, 'cam', dur * 0.25), radAt = atOr(cues, 'radar', dur * 0.55);
          vl.update(t, W, H, gy, night, { cx: 0.5 });
          const O = P.orb || (mode === 'box' ? [0.3, 0.3, 50] : [0.7, 0.24, 52]);
          const bx = O[0] * W + Math.sin(t * 0.45) * 40 * u, by = O[1] * H + Math.sin(t * 0.8) * 18 * u;
          ball.update(t, bx, by, O[2] * u, { flare: punch(lt, hit, 0.9) });
          trees.update(t, [[0.04 * W, gy + 20 * u, 380 * u], [0.92 * W, gy - 10 * u, 300 * u], [0.99 * W, gy + 30 * u, 420 * u]], night, u);
          if (isCamp) {
            hut.update(t, 0.24 * W, gy + 10 * u, 0.85 * u, night, { lit: 0.6 });
            // radar mast + turning dish
            const mx = 0.52 * W, mt = gy - (P.mast ?? 470) * u, k = doubt ? 1 : spring(lt, radAt - 0.4, 0.6);
            mast.setAttribute('d', inkPath([[mx, gy + 20 * u], [mx, mt]], { w: 9, seed: sd + 110, t }) + ' ' + inkPath([[mx - 80 * u, gy + 20 * u], [mx, gy - 160 * u], [mx + 80 * u, gy + 20 * u]], { w: 6, seed: sd + 111, t }));
            const ang = t * 1.4, rx = (110 * Math.abs(Math.cos(ang)) + 22) * u * k, ry = 120 * u * k, DP = inkEllipsePts(mx, mt - 30 * u, rx, ry, sd + 112, 16, -0.4, 0.02);
            dish.setAttribute('d', inkLoop(DP, { seed: sd + 113, t, amp: 0.5 }));
            dishR.setAttribute('d', inkPath(DP, { w: 6, seed: sd + 114, t, closed: true }) + ' ' + inkPath([[mx, mt - 30 * u], [mx + Math.sin(ang) * 70 * u * k, mt - 60 * u]], { w: 5, seed: sd + 115, t }));
            // pings from the dish toward the ball after "radar"
            const PG = [];
            if (lt > radAt && !doubt) for (let i = 0; i < 3; i++) { const ph = ((lt - radAt) * 0.8 + i / 3) % 1, px = lerp(mx, bx, ph), py = lerp(mt - 30 * u, by, ph), r = (24 + 50 * ph) * u; PG.push(inkPath(inkEllipsePts(px, py, r, r * 0.6, sd + 120 + i, 10, Math.atan2(by - mt, bx - mx) + Math.PI / 2, 0.02).slice(0, 6), { w: 6 * (1 - ph) + 1, seed: sd + 120 + i, t })); }
            pings.setAttribute('d', PG.join(' '));
            // camera on a tripod aimed at the ball
            const cx = 0.72 * W, cy = gy - 200 * u, ck = doubt ? 1 : spring(lt, camAt, 0.6), a = Math.atan2(by - cy, bx - cx);
            const R2 = q => [cx + (q[0] * Math.cos(a) - q[1] * Math.sin(a)) * ck, cy + (q[0] * Math.sin(a) + q[1] * Math.cos(a)) * ck];
            const BD = [[-70, -50], [40, -50], [40, 50], [-70, 50]].map(q => R2([q[0] * u, q[1] * u])), LN = [[40, -30], [150, -36], [150, 36], [40, 30]].map(q => R2([q[0] * u, q[1] * u]));
            cam.setAttribute('d', ck > 0.01 ? inkLoop(BD, { seed: sd + 130, t, smooth: false, amp: 0.5 }) + ' ' + inkLoop(LN, { seed: sd + 131, t, smooth: false, amp: 0.5 }) : '');
            camR.setAttribute('d', ck > 0.01 ? [inkPath(BD, { w: 4, seed: sd + 132, t, closed: true, smooth: false }), inkPath(LN, { w: 4, seed: sd + 133, t, closed: true, smooth: false }),
              inkPath([[cx, cy + 40 * u], [cx - 90 * u, gy + 40 * u]], { w: 6, seed: sd + 134, t }), inkPath([[cx, cy + 40 * u], [cx + 10 * u, gy + 50 * u]], { w: 6, seed: sd + 135, t }), inkPath([[cx, cy + 40 * u], [cx + 100 * u, gy + 36 * u]], { w: 6, seed: sd + 136, t })].join(' ') : '');
            const lc = R2([150 * u, 0]); lens.setAttribute('d', ck > 0.01 ? inkDot(lc[0], lc[1], 16 * u * ck, 30 * u * ck, sd + 137, t) : '');
            beam.setAttribute('d', '');
            if (box) blank(box.c, box.s, box.snow, box.r, box.rec);
            if (doubt) {
              const sa = atOr(cues, P.stamp?.at ?? 'hit', dur * 0.5);
              sci[0].update(t, lt < sa ? 'think' : 'shrug', { x: 0.86 * W, y: gy + 60 * u, face: -1, since: Math.max(0, lt - sa), emotion: lt < sa ? 'neutral' : 'worried' });
              sci[1].update(t, lt < sa + 0.2 ? 'point' : 'shrug', { x: 0.44 * W, y: gy + 70 * u, face: 1, since: lt < sa + 0.2 ? 1 : lt - sa - 0.2, dir: 50, emotion: lt < sa ? 'neutral' : 'worried' });
            } else {
            sci[0].update(t, 'point', { x: 0.86 * W, y: gy + 60 * u, face: -1, since: 1, dir: 55, emotion: lt > hit ? 'surprised' : 'worried' });
            sci[1].update(t, lt < radAt ? 'think' : 'shock', { x: 0.44 * W, y: gy + 70 * u, face: 1, since: Math.max(0, lt - radAt), dir: 'up', emotion: lt < radAt ? 'neutral' : 'surprised' });
            }
          } else {
            // the blue container station on the slope with a mast camera
            const cx = 0.62 * W, w = 420 * u, h = 200 * u, d = 90 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = gy + 20 * u - h;
            const F = rect(x0, y0, x1, gy + 20 * u), SD = [[x1, y0], [x1 + d, y0 - d * 0.4], [x1 + d, gy + 20 * u - d * 0.4], [x1, gy + 20 * u]];
            box.c.setAttribute('d', inkLoop(F, { seed: sd + 140, t, smooth: false, amp: 0.6 }));
            box.s.setAttribute('d', inkLoop(SD, { seed: sd + 141, t, smooth: false, amp: 0.6 }));
            box.snow.setAttribute('d', inkLoop([[x0 - 10 * u, y0 + 4 * u], [x0 + 6 * u, y0 - 16 * u], [x1 + d, y0 - d * 0.4 - 16 * u], [x1 + d + 8 * u, y0 - d * 0.4 + 4 * u], [x1, y0 + 8 * u]], { seed: sd + 142, t, amp: 0.6 }));
            const RL = [inkPath(F, { w: 5, seed: sd + 143, t, closed: true, smooth: false }), inkPath(SD, { w: 5, seed: sd + 144, t, closed: true, smooth: false })];
            for (let i = 1; i < 14; i++) { const x = x0 + i * w / 14; RL.push(inkPath([[x, y0 + 10 * u], [x, gy + 12 * u]], { w: 2.5, seed: sd + 150 + i, t })); }
            RL.push(inkPath([[x1 - 70 * u, y0 + 20 * u], [x1 - 70 * u, gy + 10 * u]], { w: 5, seed: sd + 170, t }));
            const mt = y0 - 300 * u, mx = x0 + 70 * u;
            mast.setAttribute('d', inkPath([[mx, y0], [mx, mt]], { w: 9, seed: sd + 171, t }) + ' ' + inkPath([[mx, mt + 80 * u], [mx + 80 * u, mt + 60 * u]], { w: 5, seed: sd + 172, t }));
            const a = Math.atan2(by - mt, bx - mx), R2 = q => [mx + q[0] * Math.cos(a) - q[1] * Math.sin(a), mt + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
            const BD = [[-50, -34], [70, -34], [70, 34], [-50, 34]].map(q => R2([q[0] * u, q[1] * u])), HD = [[60, -46], [100, -46], [100, -34], [60, -34]].map(q => R2([q[0] * u, q[1] * u]));
            cam.setAttribute('d', inkLoop(BD, { seed: sd + 173, t, smooth: false, amp: 0.5 }) + ' ' + inkLoop(HD, { seed: sd + 174, t, smooth: false, amp: 0.4 }));
            camR.setAttribute('d', inkPath(BD, { w: 4, seed: sd + 175, t, closed: true, smooth: false }));
            const lc = R2([74 * u, 0]); lens.setAttribute('d', inkDot(lc[0], lc[1], 14 * u, 26 * u, sd + 176, t));
            // a faint view cone from the lens to the ball
            const L1 = R2([74 * u, -20 * u]), L2 = R2([74 * u, 20 * u]), bk = 0.5 + 0.5 * Math.sin(t * 2);
            beam.setAttribute('fill-opacity', f1(0.12 + 0.08 * bk + 0.2 * punch(lt, hit, 1)));
            beam.setAttribute('d', inkLoop([L1, [bx - 60 * u, by - 60 * u], [bx + 60 * u, by + 60 * u], L2], { seed: sd + 177, t, amp: 0.5 }));
            const rp = R2([-30 * u, -20 * u]), on = Math.floor(lt * 1.5) % 2 === 0 || (lt > hit && lt < hit + 0.8);
            box.rec.setAttribute('d', on ? inkDot(rp[0], rp[1], 11 * u, 11 * u, sd + 178, t) : '');
            box.r.setAttribute('d', RL.join(' ') + ' ' + inkPath([[mx, y0 + 40 * u], [mx - 140 * u, gy + 40 * u], [mx - 260 * u, gy + 80 * u]], { w: 4, seed: sd + 179, t }));
            blank(dish, dishR, pings);
          }
          front.update(t, W, H, fy, night, { fence: isCamp, fenceX: [0.04, 0.16, 0.28], tracks: isCamp, trackX: 0.5, trees: mode === 'box' ? [[-0.02 * W, fy + 360 * u, 620 * u], [1.03 * W, fy + 330 * u, 560 * u]] : undefined });
          fall.update(t, W, H, night ? 22 : 40, u);
          if (ST) {
            const S = P.stamp, sa = atOr(cues, S.at ?? 'hit', dur * 0.5);
            if (lt < sa) ST.g.setAttribute('transform', 'scale(0)');
            else {
              const k = lerp(1.7, 1, prog(lt, sa, 0.25)) * (1 + 0.08 * punch(lt, sa + 0.25, 0.5)), x = (S.x ?? 0.5) * W, y = (S.y ?? 0.3) * H, sz = (S.size || 120) * u, bw = (ST.tx.textContent.length * sz * 0.36) + 40 * u, bh = sz * 0.75;
              ST.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(S.rot ?? -8)}) scale(${f1(k * 100) / 100})`);
              ST.box.setAttribute('d', inkPath(rect(-bw, -bh, bw, bh), { w: 12, seed: sd + 300, t, closed: true, smooth: false }) + ' ' + inkPath(rect(-bw + 16 * u, -bh + 16 * u, bw - 16 * u, bh - 16 * u), { w: 5, seed: sd + 301, t, closed: true, smooth: false }));
              ST.tx.setAttribute('x', 0); ST.tx.setAttribute('y', f1(sz * 0.36));
            }
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.hd_battery
  SH.hd_battery = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 881, u = W / 1080;
      const root = el(svg, 'g');
      const sky = inkEl(root, NIGHT_SKY()), stars = inkEl(root, INK.paperLight);
      const rockL = inkEl(root, mix(INK.red, INK.stain, 0.55)), rockR = inkEl(root, mix(INK.blue, INK.paperDark, 0.45)), strata = inkEl(root, mix(INK.ink, INK.stain, 0.35));
      const snow = inkEl(root, SNOW(false)), river = inkEl(root, INK.blue), riverW = inkEl(root, INK.paperLight), edges = inkEl(root);
      const trees = spruces(el(root, 'g'), sd + 40);
      const flow = inkEl(root, INK.gold), sparks = inkEl(root, mix(INK.gold, INK.paperLight, 0.3));
      const signs = ['+', '+', '−', '−'].map(s => { const tx = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 240 * u, 'text-anchor': 'middle', fill: INK.paperLight, stroke: INK.ink, 'stroke-width': 6 * u }); tx.textContent = s; return tx; });
      const ball = orb(el(root, 'g'), sd + 60);
      const K = Object.assign({ x: 0.84, y: 0.5, scale: 0.9, pose: 'point', face: 'left', dir: 40, emotion: 'surprised' }, P.kasif || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const LB = labels(root, P.labels, W, H);
      const sy = (P.surface ?? 0.48) * H, ry = (P.riverY ?? 0.64) * H, cx = W / 2;
      const surf = x => { const d = Math.abs(x - cx) / (W / 2); return lerp(ry, sy, Math.pow(Math.min(1, d), 0.8)) + 10 * u * Math.sin(x * 0.02); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, fa = P.flow_at ?? atOr(cues, 'flow', dur * 0.2), hit = atOr(cues, 'hit', dur * 0.55);
          const SP = []; for (let x = -40; x <= W + 40; x += 30 * u) SP.push([x, surf(x)]);
          sky.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40]].concat(SP.slice().reverse()),{ seed: sd, t, amp: 0.4, smooth: false }));
          const ST = []; for (let i = 0; i < 26; i++) { const x = hn(sd + 1, i) * W, y = (0.05 + hn(sd + 2, i) * 0.38) * H; if (y > surf(x) - 30) continue; const r = (2 + 3 * hn(sd + 3, i)) * u * (0.7 + 0.3 * Math.sin(t * 2 + i)); ST.push(inkDot(x, y, r, r, sd + 10 + i, t, 0.3)); }
          stars.setAttribute('d', ST.join(' '));
          const left = SP.filter(p => p[0] <= cx + 1), right = SP.filter(p => p[0] >= cx - 1);
          rockL.setAttribute('d', inkLoop(left.concat([[cx, H + 40], [-40, H + 40]]), { seed: sd + 4, t, amp: 0.6, smooth: false }));
          rockR.setAttribute('d', inkLoop(right.concat([[W + 40, H + 40], [cx, H + 40]]), { seed: sd + 5, t, amp: 0.6, smooth: false }));
          const S = [];
          for (let i = 0; i < 9; i++) { const y0 = i * 110 * u; const pts = []; for (let x = -20; x <= W + 20; x += 60 * u) pts.push([x, surf(x) + 80 * u + y0 + 16 * u * Math.sin(x * 0.01 + i)]); S.push(inkPath(pts.filter(p => p[1] < H + 30), { w: 3, seed: sd + 20 + i, t, taper: 0.4 })); }
          S.push(inkPath([[cx, ry + 40 * u], [cx + 10 * u, H + 40]], { w: 6, seed: sd + 30, t }));
          for (let i = 0; i < 18; i++) { const x = hn(sd + 31, i) * W, y = surf(x) + (120 + hn(sd + 32, i) * 600) * u; S.push(inkLoop(inkEllipsePts(x, y, (16 + 20 * hn(sd + 33, i)) * u, (10 + 10 * hn(sd + 34, i)) * u, sd + 35 + i, 8, 0, 0.2), { seed: sd + 35 + i, t, amp: 0.5 })); }
          strata.setAttribute('d', S.join(' '));
          snow.setAttribute('d', inkLoop(SP.concat(SP.slice().reverse().map(p => [p[0], p[1] + 30 * u])), { seed: sd + 50, t, amp: 0.4 }));
          const RV = inkEllipsePts(cx, ry + 6 * u, 120 * u, 34 * u, sd + 51, 14, 0, 0.05);
          river.setAttribute('d', inkLoop(RV, { seed: sd + 52, t, amp: 0.5 }));
          riverW.setAttribute('d', [0, 1, 2].map(i => { const ph = (t * 0.6 + i / 3) % 1, x = cx - 80 * u + ph * 160 * u; return inkPath([[x - 20 * u, ry + (i - 1) * 12 * u], [x + 20 * u, ry + (i - 1) * 12 * u - 3 * u]], { w: 3.5, seed: sd + 53 + i, t }); }).join(' '));
          edges.setAttribute('d', inkPath(SP, { w: 6, seed: sd + 56, t }) + ' ' + inkPath(RV, { w: 4, seed: sd + 57, t, closed: true }));
          trees.update(t, [0.08, 0.17, 0.27, 0.73, 0.92].map((q, i) => [q * W, surf(q * W) + 4 * u, (130 + 30 * (i % 2)) * u]), false, u);
          // + and − rock: big signs pulse with the current
          const pl = punch(lt, fa, 0.8);
          (P.signs || [[0.18, 0.74], [0.3, 0.88], [0.82, 0.74], [0.7, 0.88]]).forEach((q, i) => { const k = spring(lt, fa - 0.3 + (i % 2) * 0.15, 0.5); signs[i].setAttribute('x', f1(q[0] * W)); signs[i].setAttribute('y', f1(q[1] * H)); signs[i].setAttribute('font-size', f1(240 * u * k * (1 + 0.15 * pl))); });
          // current: dashes running from the left rock, under the river, into the right rock
          const FL = [];
          if (lt > fa) for (let j = 0; j < 3; j++) {
            const yb = ry + (150 + j * 120) * u, path = [[0.06 * W, surf(0.06 * W) + 150 * u + j * 90 * u], [cx, yb + 80 * u], [0.94 * W, surf(0.94 * W) + 150 * u + j * 90 * u]];
            for (let i = 0; i < 7; i++) { const ph = ((lt - fa) * 0.35 + i / 7 + j * 0.05) % 1, a = Math.max(0, ph - 0.04);
              const P2 = q => { const s = q < 0.5 ? q * 2 : (q - 0.5) * 2, A = q < 0.5 ? path[0] : path[1], B = q < 0.5 ? path[1] : path[2]; return [lerp(A[0], B[0], s), lerp(A[1], B[1], s) + (q < 0.5 ? Math.sin(s * Math.PI) * 40 * u : Math.sin(s * Math.PI) * 40 * u)]; };
              FL.push(inkPath([P2(a), P2(ph)], { w: 9, seed: sd + 70 + j * 10 + i, t, taper: 0.5 })); }
          }
          flow.setAttribute('d', FL.join(' '));
          // sparks rising out of the river toward the ball
          const SK = [], by = (P.orbY ?? 0.3) * H;
          if (lt > fa + 0.3) for (let i = 0; i < 10; i++) { const ph = ((lt - fa) * 0.6 + hn(sd + 90, i)) % 1, x = cx + (hn(sd + 91, i) - 0.5) * 160 * u * (1 - ph) + Math.sin(t * 3 + i) * 10 * u, y = lerp(ry - 20 * u, by + 60 * u, ph), r = (5 + 5 * (1 - ph)) * u; SK.push(inkDot(x, y, r, r, sd + 100 + i, t, 0.3)); }
          sparks.setAttribute('d', SK.join(' '));
          ball.update(t, cx + Math.sin(t * 0.6) * 18 * u, by + Math.sin(t * 0.9) * 12 * u, (P.orbR ?? 70) * u * spring(lt, hit - 0.2, 0.9), { flare: punch(lt, hit, 0.9) });
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
