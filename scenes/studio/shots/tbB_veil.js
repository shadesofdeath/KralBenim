// tbB_veil: shots for Stickstory long video ag-04-tambora-1816, chapter 3 "The Invisible Veil" (parametric: any
// volcanic-winter / aerosol story). Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every
// line boils at 8 Hz, pure function of (seed, lt). Needs _ink.js, kasif.js, mcB__lib.js (window.MCB: cast, labels,
// camPush). Shared keys in every shot: cast: [MCB cast entries, Kaşif = who "kasif"], labels: [MCB label entries],
// cam: {zoom: 1.05, focus: [x, y]}, shiver: cue|s (cast group shivers from then on), hit: cue name for a camera punch.
//
// SHOTS.tbB_noon  — a village at noon under an ash-dark sky: cross-hatched sky, a dim sun, ash falling, a rice field
//   that the ash slowly buries, stilt huts, a well whose water turns grey.
//   P: {ground: 0.8, sun: {x: 0.5, y: 0.17, r: 62}, ash: 90 (flakes), bury: cue|s (ash layer rises over the field),
//       field: {x0: 0.05, x1: 0.5}, huts: [{x: 0.78, s: 1}], well: {x: 0.6, s: 1, poison: cue|s (water greys, red X)}}
// SHOTS.tbB_toll  — a memorial count with candles: two groups of small candles light up one by one, Fraunces numbers
//   above each group.   P: {groups: [{x: 0.3, cols: 4, rows: 3, at, dur: 1.2, num: "10,000", sub: "the blast",
//       color: "ink"|"red"}], shelf: 0.74}
// SHOTS.tbB_sky   — atmosphere cross-section: ground + volcano, a cloud deck with rain, a dashed upper boundary;
//   a gold plume of sulfur gas shoots up past the clouds and spreads into a thin layer high above.
//   P: {ground: 0.84, volcano: {x: 0.3, s: 1}, clouds: 0.55, top: 0.3, plume: {at: cue, dur: 1.6, layer: cue}}
// SHOTS.tbB_globe — an ink globe (orthographic, slowly turning, rough continents) with a gold haze cap that grows
//   from a marked point until it wraps the planet, wind arrows, an optional magnifier inset of droplets and an optional
//   thermometer that drops.   P: {globe: {x: 0.42, y: 0.47, r: 300, lon: 118, lat: 8, spin: 3 (deg/s)},
//       mark: {lon: 118, lat: -8.25, at}, haze: {at: cue|s, dur: 3.5, from: 0 (0..1 initial cover)}, winds: true,
//       inset: {x: 0.74, y: 0.27, r: 120, at} | false, thermo: {x: 0.76, y: 0.5, at (drop cue), from: 0.72, to: 0.42} | false,
//       frost: cue|s (blue snowflakes appear around the globe)}
// SHOTS.tbB_rays  — sky over a field: sun upper left, a faint high veil of gold specks; optional crossed-out cloud
//   outline ("not a cloud"), sunrays that either bounce off the veil back to space or reach the ground.
//   P: {ground: 0.8, sun: {x: 0.13, y: 0.2, r: 78}, veil: {y: 0.36, faint: 0.35, glint: cue}, cloud: {at, cross} | false,
//       rays: {at: cue|s, bounce: cue|s, warm: cue|s, n: 6} | false, farm: true}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft };

  // ------------------------------------------------------------ common scaffolding
  function common(ctx, P, sd) {
    const { svg, W, H } = ctx, M = window.MCB;
    const root = el(svg, 'g'), cam = el(root, 'g');
    const layers = { back: el(cam, 'g'), mid: el(cam, 'g'), castG: el(cam, 'g'), front: el(cam, 'g') };
    const cast = M.cast(layers.castG, P.cast || [], W, H, sd + 500);
    const labels = M.labels(layers.front, P.labels || [], W, H, sd + 600);
    return {
      cam, layers, M,
      tick(lt, dur, cues, t, hitName, shakeK = 0) {
        const hit = punch(lt, M.atOr(cues, hitName || 'hit', null), 0.6);
        M.camPush(cam, lt, dur, W, H, P.cam || {}, hit, shakeK);
        const sv = M.atOr(cues, P.shiver, null);
        if (sv != null && lt >= sv) {
          const k = clamp01((lt - sv) / 0.3);
          layers.castG.setAttribute('transform', `translate(${f1(Math.sin(lt * 61) * 5 * k)} ${f1(Math.cos(lt * 47) * 2 * k)})`);
        } else layers.castG.removeAttribute('transform');
        cast.update(lt, t, cues);
        labels.update(lt, t, cues);
      },
    };
  }
  // straight hatch strokes in a rect (angle deg), returned as one path string
  function hatch(x0, y0, x1, y1, gap, ang, sd, t, w = 3, amp = 1.2, skip = null) {
    const a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), Lw = x1 - x0, Lh = y1 - y0;
    const L = Math.hypot(Lw, Lh), nx = -dy, ny = dx, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let d = '';
    const n = Math.ceil(L / gap);
    for (let i = -n / 2; i <= n / 2; i++) {
      const ox = cx + nx * i * gap, oy = cy + ny * i * gap;
      // clip the infinite line to the rect (parametric)
      let t0 = -1e9, t1 = 1e9;
      const clipAx = (p, dp, lo, hi) => { if (Math.abs(dp) < 1e-9) return p >= lo && p <= hi; let a1 = (lo - p) / dp, a2 = (hi - p) / dp; if (a1 > a2) [a1, a2] = [a2, a1]; t0 = Math.max(t0, a1); t1 = Math.min(t1, a2); return t0 < t1; };
      if (!clipAx(ox, dx, x0, x1) || !clipAx(oy, dy, y0, y1)) continue;
      const R = rng(sd * 7 + i * 13 + 1000);
      const s0 = t0 + (t1 - t0) * R() * 0.08, s1 = t1 - (t1 - t0) * R() * 0.08;
      const p0 = [ox + dx * s0, oy + dy * s0], p1 = [ox + dx * s1, oy + dy * s1];
      if (skip && skip(p0, p1)) continue;
      d += inkPath([p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1], { w, seed: sd + i * 3 + 500, t, amp, taper: 0.5 }) + ' ';
    }
    return d;
  }
  function puff(cx, cy, w, h, sd) {        // cloud outline: bumpy top, flat-ish bottom
    const pts = [], n = 14;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + i / (n - 1) * Math.PI, bump = 1 + 0.16 * Math.abs(Math.sin(i * 1.7 + sd));
      pts.push([cx + Math.cos(a) * w / 2, cy + Math.sin(a) * h * bump]);
    }
    pts.push([cx + w * 0.42, cy + h * 0.22], [cx - w * 0.42, cy + h * 0.24]);
    return pts;
  }
  function sunDraw(fill, ring, rays, t, x, y, r, sd, dim = 0, spin = 0.25) {
    fill.setAttribute('d', inkCircle(x, y, r, sd, t, { fill: true }));
    ring.setAttribute('d', inkCircle(x, y, r, sd + 1, t, { w: 6 }));
    let d = '';
    if (dim < 0.95) for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 + t * spin, r0 = r * 1.25, r1 = r * (i % 2 ? 1.55 : 1.8) * (1 - dim * 0.5);
      d += inkPath([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 6, seed: sd + 10 + i, t, amp: 1 }) + ' ';
    }
    rays.setAttribute('d', d);
  }

  // bumpy cauliflower puff (ash / gas clouds)
  function blob(cx, cy, r, k0, t, n = 20) {
    const pts = [];
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, q = r * (0.86 + 0.2 * Math.abs(Math.sin(a * 3.5 + k0 * 1.3 + t * 0.4))); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.86]); }
    return pts;
  }
  // dark-ink stratovolcano with a blown-off flat top (same look as tbA_volcano by day: paperDark body, inkSoft shade)
  function mountain(parent, sd) {
    const g = el(parent, 'g');
    const fill = inkEl(g, INK.paperDark), shade = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.55 }), gully = inkEl(g, INK.inkSoft), line = inkEl(g);
    return {
      update(t, o) {
        const x = o.x + (o.shake ? Math.sin(t * 47) * o.shake : 0), base = o.base, hw = o.hw, h = o.h, cut = o.cut ?? 0.3, e = 1.35;
        const uc = 1 - Math.pow(1 - cut, 1 / e), prof = u => base - h * Math.pow(Math.max(0, 1 - Math.abs(u)), e), topY = prof(uc);
        const left = [], right = [];
        for (let i = 0; i <= 14; i++) { const u = -1 + i / 14 * (1 - uc); left.push([x + u * hw, prof(u)]); }
        for (let i = 0; i <= 14; i++) { const u = uc + i / 14 * (1 - uc); right.push([x + u * hw, prof(u)]); }
        const rim = [[x - uc * hw * 0.55, topY + 14], [x, topY + 24], [x + uc * hw * 0.55, topY + 12]];
        const outl = left.concat(rim, right);
        fill.setAttribute('d', inkLoop(outl, { seed: sd + 1, t, amp: 1.2, smooth: false }));
        const sh = [[x + uc * hw * 0.3, topY + 16]].concat(right, [[x + hw * 0.18, base]]);
        shade.setAttribute('d', inkLoop(sh, { seed: sd + 2, t, amp: 1.2, smooth: false }));
        line.setAttribute('d', inkPath(outl, { w: 6.5, seed: sd + 3, t, amp: 1.4, smooth: false }));
        let dg = '';
        [-0.55, -0.3, 0.1, 0.42, 0.62].forEach((u0, k) => {
          const u1 = u0 * 1.25, a = [x + u0 * uc * hw * 1.6, prof(u0 * uc * 1.6) + 30], b = [x + u1 * hw * 0.8, base - h * 0.12];
          dg += inkPath([a, [(a[0] + b[0]) / 2 + (k % 2 ? 14 : -14), (a[1] + b[1]) / 2], b], { w: 3.5, seed: sd + 10 + k, t, amp: 1, taper: 0.6 }) + ' ';
        });
        gully.setAttribute('d', dg);
        return { top: [x, topY + 10], uc };
      },
    };
  }

  // ================================================================== tbB_noon
  SH.tbB_noon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 811;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const gy = (P.ground ?? 0.8) * H;
      const SU = Object.assign({ x: 0.5, y: 0.17, r: 62 }, P.sun || {});
      const sunF = inkEl(L.back, INK.paperLight), sunR = inkEl(L.back, INK.inkSoft), sunRays = inkEl(L.back, INK.inkSoft);
      const cid = 'tbBsky' + seed, cp = el(ctx.defs, 'clipPath', { id: cid });
      el(cp, 'path', { d: `M-200 -200 H${W + 200} V${H + 200} H-200 Z M-10 -10 V200 H560 A50 50 0 0 0 610 150 V-10 Z`, 'clip-rule': 'evenodd' });
      const skyG = el(L.back, 'g', { 'clip-path': `url(#${cid})` });
      const sky1 = inkEl(skyG, INK.inkSoft, { 'fill-opacity': 0.55 }), sky2 = inkEl(skyG, INK.inkSoft, { 'fill-opacity': 0.4 });
      const hillF = inkEl(L.back, INK.paperDark, { 'fill-opacity': 0.75 }), hillR = inkEl(L.back, INK.inkSoft);
      const groundR = inkEl(L.mid);
      const FD = Object.assign({ x0: 0.05, x1: 0.5 }, P.field || {});
      const rows = [], R = rng(sd + 3);
      for (let r = 0; r < 4; r++) for (let x = FD.x0 * W + 20 + r * 14; x < FD.x1 * W; x += 64) rows.push([x + R() * 10, gy - 8 - r * 26, 0.7 + r * 0.1]);
      const sprouts = inkEl(L.mid, INK.green), dyke = inkEl(L.mid, INK.inkSoft);
      const ashF = inkEl(L.mid, INK.paperDark), ashR = inkEl(L.mid, INK.inkSoft), ashDots = inkEl(L.mid, INK.inkSoft);
      const huts = (P.huts || [{ x: 0.8, s: 1 }]).map(() => ({ f: inkEl(L.mid, INK.paperLight), roof: inkEl(L.mid, INK.paperDark), r: inkEl(L.mid) }));
      const WL = P.well === false ? null : Object.assign({ x: 0.6, s: 1 }, P.well || {});
      const well = WL ? { f: inkEl(L.mid, INK.paperLight), water: inkEl(L.mid, INK.blue), r: inkEl(L.mid), x: inkEl(L.front, INK.red) } : null;
      const ash = inkEl(L.front, INK.inkSoft), ashN = P.ash ?? 90, AR = rng(sd + 9), flakes = [];
      for (let i = 0; i < ashN; i++) flakes.push([AR(), AR(), 0.5 + AR() * 0.8, AR()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // sky: dense cross-hatching (the ash cloud), lighter where the sun glows through
          const sx = SU.x * W, sy = SU.y * H, sr = SU.r;
          sunDraw(sunF, sunR, sunRays, t, sx, sy + Math.sin(lt * 0.5) * 3, sr * (1 + 0.04 * Math.sin(t * 1.3)), sd + 20, 0.6, 0.12);
          const nearSun = (a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; return Math.hypot(mx - sx, my - sy) < sr * 1.1; };
          const drift = (lt * 14) % 40;
          sky1.setAttribute('d', hatch(-40 + drift, 0, W + 40, gy - 120, 26, -32, sd + 30, t, 3.4, 1.4, nearSun));
          sky2.setAttribute('d', hatch(-40, 0, W + 40, gy - 220, 34, 28, sd + 40, t, 3, 1.4));
          // far hills
          const hp = [];
          for (let x = -40; x <= W + 40; x += 80) hp.push([x, gy - 70 - 60 * Math.abs(Math.sin(x * 0.0024 + 0.6)) - 30 * Math.abs(Math.sin(x * 0.007))]);
          hillF.setAttribute('d', inkLoop(hp.concat([[W + 40, gy], [-40, gy]]), { seed: sd + 50, t, amp: 1 }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 51, t, amp: 1.2 }));
          groundR.setAttribute('d', inkPath([[-20, gy], [W * 0.5, gy + 4], [W + 20, gy - 2]], { w: 6, seed: sd + 52, t, amp: 1.4 }));
          // rice field: rows of sprouts that the ash buries
          const ba = atOr(cues, P.bury, null), bp = ba == null ? 0 : progIO(lt, ba - 0.2, 2.2);
          const ashTop = gy - 8 - bp * 110;
          let ds = '', dd = '';
          rows.forEach(([x, y, k], i) => {
            const h = 34 * k, sway = Math.sin(lt * 1.8 + i * 0.7) * 3;
            if (y - h > ashTop + 4) return;            // fully under the ash
            ds += inkPath([[x, y], [x - 10 + sway, y - h]], { w: 4, seed: sd + 100 + i, t, amp: 0.8 }) + ' ' +
              inkPath([[x, y], [x + 2 + sway, y - h * 1.15]], { w: 4, seed: sd + 300 + i, t, amp: 0.8 }) + ' ' +
              inkPath([[x, y], [x + 12 + sway, y - h * 0.9]], { w: 4, seed: sd + 500 + i, t, amp: 0.8 }) + ' ';
          });
          for (let r = 0; r < 4; r++) dd += inkPath([[FD.x0 * W, gy - r * 26 + 2], [FD.x1 * W, gy - r * 26 + 2]], { w: 3, seed: sd + 60 + r, t, amp: 1 }) + ' ';
          sprouts.setAttribute('d', ds); dyke.setAttribute('d', bp > 0.3 ? '' : dd);
          if (bp > 0.001) {
            const ap = [];
            for (let x = FD.x0 * W - 30; x <= FD.x1 * W + 60; x += 50) ap.push([x, ashTop + Math.sin(x * 0.03) * 8 * bp + (x > FD.x1 * W ? (x - FD.x1 * W) * 0.9 : 0) + (x < FD.x0 * W ? (FD.x0 * W - x) * 1.2 : 0)]);
            ashF.setAttribute('d', inkLoop(ap.concat([[FD.x1 * W + 60, gy + 2], [FD.x0 * W - 30, gy + 2]]), { seed: sd + 70, t, amp: 1 }));
            ashR.setAttribute('d', inkPath(ap, { w: 4.5, seed: sd + 71, t, amp: 1.2 }));
            let dt = '';
            for (let i = 0; i < 22; i++) { const xx = FD.x0 * W + (i + 0.5) / 22 * (FD.x1 - FD.x0) * W, yy = lerp(ashTop + 14, gy - 6, (i * 0.37) % 1); dt += inkDot(xx, yy, 3, 3, sd + 80 + i, t) + ' '; }
            ashDots.setAttribute('d', dt);
          } else { ashF.setAttribute('d', ''); ashR.setAttribute('d', ''); ashDots.setAttribute('d', ''); }
          // stilt huts (ash-grey roofs)
          (P.huts || [{ x: 0.8, s: 1 }]).forEach((hc, i) => {
            const x = hc.x * W, s = hc.s ?? 1, base = gy, fl = base - 70 * s, top = fl - 110 * s, w = 180 * s;
            const body = [[x - w / 2, fl], [x + w / 2, fl], [x + w / 2, top], [x - w / 2, top]];
            const roof = [[x - w * 0.68, top + 6], [x, top - 120 * s], [x + w * 0.68, top + 6]];
            const hu = huts[i];
            hu.f.setAttribute('d', inkLoop(body, { seed: sd + 200 + i, t, amp: 1, smooth: false }));
            hu.roof.setAttribute('d', inkLoop(roof, { seed: sd + 210 + i, t, amp: 1, smooth: false }));
            let d = inkPath(body, { w: 5, seed: sd + 220 + i, t, closed: true, amp: 1, smooth: false }) + ' ' +
              inkPath(roof, { w: 5.5, seed: sd + 230 + i, t, closed: true, amp: 1.2, smooth: false }) + ' ';
            [-0.4, 0, 0.4].forEach((u, k) => { d += inkPath([[x + u * w, fl], [x + u * w, base]], { w: 6, seed: sd + 240 + i * 5 + k, t, amp: 1 }) + ' '; });
            d += inkPath([[x - w * 0.12, fl], [x - w * 0.12, top + 34 * s], [x + w * 0.14, top + 34 * s], [x + w * 0.14, fl]], { w: 4, seed: sd + 260 + i, t, amp: 0.8, smooth: false }) + ' ';
            for (let k = 0; k < 4; k++) d += inkPath([[x - w * 0.55 + k * w * 0.32, top - 6], [x - w * 0.2 + k * w * 0.18, top - 60 * s]], { w: 3, seed: sd + 270 + i * 5 + k, t, amp: 0.8 }) + ' ';
            hu.r.setAttribute('d', d);
          });
          // well: stone ring, water that greys
          if (well) {
            const x = WL.x * W, s = WL.s, top = gy - 110 * s, w = 150 * s;
            const pa = atOr(cues, WL.poison, null), pp = pa == null ? 0 : prog(lt, pa, 0.8), pk = punch(lt, pa, 0.6);
            const body = [[x - w / 2, gy], [x - w / 2, top], [x + w / 2, top], [x + w / 2, gy]];
            well.f.setAttribute('d', inkLoop(body, { seed: sd + 280, t, amp: 1, smooth: false }));
            const wtr = inkEllipsePts(x, top, w / 2 - 6, 18 * s, sd + 281, 12);
            well.water.setAttribute('d', inkLoop(wtr, { seed: sd + 282, t, amp: 0.8 }));
            well.water.setAttribute('fill', mix(INK.blue, INK.inkSoft, pp));
            let d = inkPath(body, { w: 5, seed: sd + 283, t, amp: 1, smooth: false }) + ' ' + inkPath(wtr, { w: 5, seed: sd + 284, t, closed: true, amp: 1 }) + ' ';
            for (let k = 1; k < 3; k++) d += inkPath([[x - w / 2, top + k * 36 * s], [x + w / 2, top + k * 36 * s]], { w: 3, seed: sd + 285 + k, t, amp: 1 }) + ' ';
            d += inkPath([[x - w * 0.45, top], [x - w * 0.45, top - 130 * s], [x + w * 0.45, top - 130 * s], [x + w * 0.45, top]], { w: 6, seed: sd + 289, t, amp: 1, smooth: false }) + ' ';
            const sw = Math.sin(lt * 1.4) * 6;
            d += inkPath([[x + sw * 0.3, top - 130 * s], [x + sw, top - 70 * s]], { w: 3, seed: sd + 290, t, amp: 0.6 }) + ' ' +
              inkPath([[x - 18 + sw, top - 70 * s], [x + 18 + sw, top - 70 * s], [x + 13 + sw, top - 40 * s], [x - 13 + sw, top - 40 * s]], { w: 4.5, seed: sd + 291, t, closed: true, amp: 0.8, smooth: false }) + ' ';
            if (pp > 0.01) for (let k = 0; k < 5; k++) d += inkDot(x - w * 0.3 + k * w * 0.15, top + Math.sin(lt * 2 + k) * 4, 4, 3, sd + 292 + k, t) + ' ';
            well.r.setAttribute('d', d);
            if (pp > 0.01) {
              const xs = 1 + 0.15 * pk, c = [x + w * 0.66, top - 150 * s], q = 46 * xs * clamp01(pp * 1.5);
              well.x.setAttribute('d', inkPath([[c[0] - q, c[1] - q], [c[0] + q, c[1] + q]], { w: 13, seed: sd + 297, t, amp: 1.2 }) + ' ' +
                inkPath([[c[0] + q, c[1] - q], [c[0] - q, c[1] + q]], { w: 13, seed: sd + 298, t, amp: 1.2 }));
            } else well.x.setAttribute('d', '');
          }
          // falling ash, drifting slightly sideways
          let da = '';
          flakes.forEach(([u, v, sp, ph], i) => {
            const y = ((v * H + lt * 70 * sp) % (gy + 20)), x = ((u * (W + 100) + Math.sin(lt * 0.8 + ph * 6) * 26 + lt * 10) % (W + 100)) - 50;
            const r = 3 + sp * 3;
            da += inkLoop(inkEllipsePts(x, y, r, r * 0.7, sd + 900 + i, 6, ph * 3 + lt, 0.2), { seed: sd + 900 + i, t, amp: 0.6 }) + ' ';
          });
          ash.setAttribute('d', da);
          C.tick(lt, dur, cues, t);
        },
      };
    },
  };

  // ================================================================== tbB_toll
  SH.tbB_toll = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 833;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const shelfY = (P.shelf ?? 0.74) * H;
      const groups = (P.groups || []).map((G, gi) => {
        const g = el(L.mid, 'g');
        const shelf = inkEl(g, INK.paperDark), shelfR = inkEl(g);
        const bodies = inkEl(g, INK.paperLight), outl = inkEl(g), flames = inkEl(g, INK.gold), cores = inkEl(g, INK.red, { 'fill-opacity': 0.8 });
        const glow = inkEl(g, INK.gold, { 'fill-opacity': 0.14 });
        const tg = el(L.front, 'g');
        const num = el(tg, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': G.size || 130, 'text-anchor': 'middle', fill: COL[G.color] || INK.ink });
        num.textContent = G.num || '';
        const sub = el(tg, 'text', { x: 0, y: 70, 'font-family': INK_FONT, 'font-size': 60, 'text-anchor': 'middle', fill: COL[G.color] || INK.inkSoft });
        sub.textContent = G.sub || '';
        const under = inkEl(tg, COL[G.color] || INK.ink);
        let tw = 300; try { tw = num.getComputedTextLength(); } catch (e) { }
        return { G, gi, g, shelf, shelfR, bodies, outl, flames, cores, glow, tg, under, tw };
      });
      // optional island map card: P.map {x, y, w, h (px of a 1920x1080 stage, scaled with W), islands: [{name, pts (0..1
      //   of the card), lx, ly (label, 0..1), at (red highlight cue)}], volcano: [x, y] (0..1), at (card pops in)}
      const MP = P.map || null, map = MP ? (() => {
        const g = el(L.mid, 'g'), k = W / 1920, X = MP.x * k, Y = MP.y * k, w = MP.w * k, h = MP.h * k;
        const card = { sh: inkEl(g, INK.stain, { 'fill-opacity': 0.25 }), f: inkEl(g, INK.paperLight), r: inkEl(g), grid: inkEl(g, INK.inkSoft, { 'fill-opacity': 0.4 }), waves: inkEl(g, INK.inkSoft) };
        const isl = (MP.islands || []).map(I => ({ I, f: inkEl(g, INK.paperDark), hl: inkEl(g, INK.red, { 'fill-opacity': 0.3 }), r: inkEl(g, INK.inkSoft),
          tx: (() => { const tt = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 50, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` }); tt.textContent = I.name || ''; return tt; })() }));
        const vol = { f: inkEl(g, INK.paperDark), r: inkEl(g), p: inkEl(g, INK.paperDark), pr: inkEl(g, INK.inkSoft) };
        const P2 = q => [X + q[0] * w, Y + q[1] * h];
        return { g, X, Y, w, h, card, isl, vol, P2 };
      })() : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (map) {
            const { g, X, Y, w, h, card, isl, vol, P2 } = map;
            const ma = atOr(cues, MP.at, 0), mp = lt >= ma ? spring(lt, ma, 0.7) : 0;
            g.style.display = mp > 0.01 ? '' : 'none';
            g.setAttribute('transform', `translate(${f1(X + w / 2)} ${f1(Y + h / 2)}) rotate(${f1(-1.5 + (1 - mp) * -5)}) scale(${Math.max(0.01, lerp(0.85, 1, mp)).toFixed(3)}) translate(${f1(-X - w / 2)} ${f1(-Y - h / 2)})`);
            const box = [[X, Y], [X + w, Y], [X + w, Y + h], [X, Y + h]];
            card.sh.setAttribute('d', inkLoop(box.map(q => [q[0] + 10, q[1] + 12]), { seed: sd + 900, t, amp: 0.8, smooth: false }));
            card.f.setAttribute('d', inkLoop(box, { seed: sd + 901, t, amp: 0.8, smooth: false }));
            card.r.setAttribute('d', inkPath(box, { w: 4, seed: sd + 902, t, closed: true, amp: 1, smooth: false }));
            let dw = '';
            for (let i = 0; i < 6; i++) { const q = P2([0.08 + (i * 0.37) % 0.85, 0.1 + ((i * 0.53) % 1) * 0.12 + (i % 2) * 0.72]), dx = Math.sin(lt * 1.2 + i) * 8;
              dw += inkPath([[q[0] - 30 + dx, q[1]], [q[0] - 10 + dx, q[1] - 8], [q[0] + 10 + dx, q[1]], [q[0] + 30 + dx, q[1] - 8]], { w: 3, seed: sd + 910 + i, t, amp: 0.6 }) + ' '; }
            card.waves.setAttribute('d', dw);
            isl.forEach((o2, i) => {
              const pts = o2.I.pts.map(P2), ha = atOr(cues, o2.I.at, null), hp = ha != null && lt >= ha ? prog(lt, ha, 0.4) : 0, hk = punch(lt, ha, 0.6);
              o2.f.setAttribute('d', inkLoop(pts, { seed: sd + 920 + i, t, amp: 1 }));
              o2.hl.setAttribute('d', hp > 0.01 ? inkLoop(pts, { seed: sd + 930 + i, t, amp: 1 }) : '');
              o2.hl.setAttribute('fill-opacity', (0.38 * hp).toFixed(3));
              o2.r.setAttribute('d', inkPath(pts, { w: hp > 0.5 ? 6 : 4, seed: sd + 940 + i, t, closed: true, amp: 1 }));
              o2.r.setAttribute('fill', hp > 0.5 ? INK.red : INK.inkSoft);
              const lq = P2([o2.I.lx, o2.I.ly]);
              o2.tx.setAttribute('x', f1(lq[0])); o2.tx.setAttribute('y', f1(lq[1]));
              o2.tx.setAttribute('fill', hp > 0.5 ? INK.red : INK.ink);
              o2.tx.setAttribute('transform', `translate(${f1(lq[0])} ${f1(lq[1])}) scale(${(1 + 0.15 * hk).toFixed(3)}) translate(${f1(-lq[0])} ${f1(-lq[1])})`);
            });
            if (MP.volcano) {
              const [vx, vy] = P2(MP.volcano), s2 = 38;
              const tri = [[vx - s2 * 1.3, vy + s2 * 0.5], [vx - s2 * 0.3, vy - s2 * 0.6], [vx + s2 * 0.3, vy - s2 * 0.55], [vx + s2 * 1.3, vy + s2 * 0.5]];
              vol.f.setAttribute('d', inkLoop(tri, { seed: sd + 950, t, amp: 0.8, smooth: false }));
              vol.r.setAttribute('d', inkPath(tri, { w: 4.5, seed: sd + 951, t, amp: 0.8, smooth: false }));
              let pf = '', pr = '';
              for (let k2 = 0; k2 < 3; k2++) { const u = ((lt * 0.35 + k2 / 3) % 1), pts = blob(vx + u * 30, vy - s2 * 0.7 - u * 90, 12 + u * 22, k2 + 5, t, 14);
                pf += inkLoop(pts, { seed: sd + 960 + k2, t, amp: 0.8 }) + ' '; pr += inkPath(pts, { w: 3, seed: sd + 965 + k2, t, closed: true, amp: 0.8 }) + ' '; }
              vol.p.setAttribute('d', pf); vol.pr.setAttribute('d', pr);
            }
          }
          groups.forEach(o => {
            const G = o.G, cols = G.cols || 4, rows = G.rows || 3, n = cols * rows;
            const a = atOr(cues, G.at, 0.2 + o.gi * 1.2), d = G.dur ?? 1.2;
            const CS = G.scale || 1, gap = (G.gap || 46) * CS, x0 = G.x * W - (cols - 1) * gap / 2;
            const pin = lt >= a - 0.3 ? spring(lt, a - 0.3, 0.6) : 0;
            o.g.setAttribute('transform', `translate(0 ${f1((1 - pin) * 40)})`);
            o.g.style.display = pin > 0.01 ? '' : 'none';
            const sp = [[x0 - gap * 0.9, shelfY + 14], [x0 + (cols - 1) * gap + gap * 0.9, shelfY + 14], [x0 + (cols - 1) * gap + gap * 0.9 + 20, shelfY + 44], [x0 - gap * 0.9 - 20, shelfY + 44]];
            o.shelf.setAttribute('d', inkLoop(sp, { seed: sd + o.gi * 50, t, amp: 1, smooth: false }));
            o.shelfR.setAttribute('d', inkPath(sp, { w: 5, seed: sd + o.gi * 50 + 1, t, closed: true, amp: 1, smooth: false }));
            let db = '', dl = '', df = '', dc = '', dg = '';
            for (let k = n - 1; k >= 0; k--) {            // back rows first
              const r = Math.floor(k / cols), c = k % cols;
              const ord = (rows - 1 - r) * cols + c, on = lt >= a + ord / n * d;
              const sc = (1 - r * 0.12) * CS, cx = x0 + c * gap + (r % 2) * gap * 0.3, base = shelfY + 10 - r * 34 * CS;
              const cw = 13 * sc, ch = (50 + ((k * 7) % 5) * 5) * sc;
              const body = [[cx - cw, base], [cx - cw, base - ch], [cx + cw, base - ch], [cx + cw, base]];
              db += inkLoop(body, { seed: sd + k * 3 + o.gi * 300, t, amp: 0.6, smooth: false }) + ' ';
              dl += inkPath(body, { w: 3.5, seed: sd + k * 3 + 1 + o.gi * 300, t, closed: true, amp: 0.6, smooth: false }) + ' ' +
                inkPath([[cx, base - ch], [cx, base - ch - 10 * sc]], { w: 3, seed: sd + k * 3 + 2 + o.gi * 300, t, amp: 0.4 }) + ' ';
              if (on) {
                const fl = 1 + 0.18 * Math.sin(lt * 9 + k * 1.3) + 0.08 * Math.sin(lt * 23 + k);
                const lean = Math.sin(lt * 3 + k) * 3, fy = base - ch - 12 * sc, fh = 26 * sc * fl * clamp01((lt - a - ord / n * d) * 5);
                const fp = [[cx - 7 * sc, fy], [cx + lean, fy - fh], [cx + 7 * sc, fy], [cx, fy + 6 * sc]];
                df += inkLoop(fp, { seed: sd + k * 5 + o.gi * 300, t, amp: 0.5 }) + ' ';
                dc += inkLoop([[cx - 3 * sc, fy], [cx + lean * 0.5, fy - fh * 0.45], [cx + 3 * sc, fy], [cx, fy + 3 * sc]], { seed: sd + k * 5 + 1, t, amp: 0.3 }) + ' ';
                dg += inkCircle(cx, fy - fh * 0.4, 22 * sc * fl, sd + k, t, { fill: true }) + ' ';
              }
            }
            o.bodies.setAttribute('d', db); o.outl.setAttribute('d', dl); o.flames.setAttribute('d', df); o.cores.setAttribute('d', dc); o.glow.setAttribute('d', dg);
            // number + sub label above the group
            const la = G.label_at != null ? atOr(cues, G.label_at, a) : a + (G.label_delay ?? 0.15), lp = lt >= la ? spring(lt, la, 0.55) : 0, pk = punch(lt, la, 0.6);
            const ty = (G.y ?? 0.3) * H, b = boil(sd + o.gi * 9, t, 1.2);
            o.tg.style.display = lp > 0.01 ? '' : 'none';
            o.tg.setAttribute('transform', `translate(${f1((G.lx ?? G.x) * W + b[0])} ${f1(ty + b[1])}) scale(${(Math.max(0.01, lp) * (1 + 0.08 * pk)).toFixed(3)})`);
            const up = prog(lt, la + 0.3, 0.5);
            o.under.setAttribute('d', up > 0.01 ? inkPath([[-o.tw / 2, 18], [-o.tw / 2 + o.tw * up, 14]], { w: 8, seed: sd + o.gi * 9 + 3, t, amp: 1.2 }) : '');
          });
          C.tick(lt, dur, cues, t);
        },
      };
    },
  };

  // ================================================================== tbB_sky
  SH.tbB_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 857;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const gy = (P.ground ?? 0.84) * H, cy = (P.clouds ?? 0.55) * H, ty = (P.top ?? 0.3) * H;
      const V = Object.assign({ x: 0.3, s: 1 }, P.volcano || {});
      const PL = Object.assign({ at: 0.4, dur: 1.6 }, P.plume || {});
      const bound = inkEl(L.back, INK.inkSoft), layerF = inkEl(L.back, INK.gold, { 'fill-opacity': 0.22 }), layerD = inkEl(L.back, INK.gold);
      const plumeF = inkEl(L.back, INK.gold, { 'fill-opacity': 0.55 }), plumeR = inkEl(L.back, INK.gold);
      const rain = inkEl(L.mid, INK.blue, { 'fill-opacity': 0.8 });
      const cloudF = Array.from({ length: 5 }, () => inkEl(L.mid, INK.paperLight)), cloudR = inkEl(L.mid, INK.inkSoft);
      const mtn = mountain(L.mid, sd + 700);
      const groundR = inkEl(L.mid), grass = inkEl(L.mid, INK.inkSoft);
      const clouds = [[0.1, 0.0, 300], [0.32, 0.02, 260], [0.55, -0.01, 330], [0.78, 0.015, 280], [0.98, 0, 300]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const pa = atOr(cues, PL.at, 0.4), pp = lt >= pa ? progIO(lt, pa, PL.dur) : 0, pk = punch(lt, pa, 0.7);
          const la = atOr(cues, PL.layer, pa + PL.dur), lp = lt >= la - 0.3 ? progIO(lt, la - 0.3, 2.4) : 0;
          // dashed upper boundary
          let db = '';
          for (let x = 0; x < W; x += 70) db += inkPath([[x, ty], [x + 36, ty + 1]], { w: 3.5, seed: sd + x, t, amp: 0.8 }) + ' ';
          bound.setAttribute('d', db);
          // volcano (ink mountain, flat broken top)
          const vs = V.s, hw = 330 * vs, vx0 = V.x * W;
          const mt = mtn.update(t, { x: vx0, base: gy + 2, hw, h: 330 * vs, cut: 0.32, shake: pp > 0 && pp < 1 ? 3 : 0 });
          const vx = mt.top[0], vt = mt.top[1];
          groundR.setAttribute('d', inkPath([[-20, gy], [W / 2, gy + 3], [W + 20, gy - 2]], { w: 6, seed: sd + 7, t, amp: 1.3 }));
          let dg = '';
          for (let i = 0; i < 26; i++) { const x = (i + 0.5) / 26 * W; if (Math.abs(x - vx) < hw) continue; dg += inkPath([[x, gy + 2], [x + 6 + Math.sin(lt * 2 + i) * 3, gy - 22]], { w: 3, seed: sd + 20 + i, t, amp: 0.8 }) + ' '; }
          grass.setAttribute('d', dg);
          // the plume: billowing gold gas puffs churning up from the crater to the high layer
          let dpf = '', dpr = '';
          if (pp > 0) {
            const topY = lerp(vt, ty - 60, pp), n = 8;
            for (let i = 0; i < n; i++) {
              const u = i / (n - 1), y = lerp(vt - 30, topY, u);
              const wob = Math.sin(lt * 1.6 + i * 1.9) * 22 * u + Math.sin(i * 2.3) * 36 * u, r = (46 + u * 58) * (1 + 0.1 * pk + 0.05 * Math.sin(lt * 2 + i)) * vs;
              const pts = blob(vx + wob + u * 40, y, r, i + 3, t);
              dpf += inkLoop(pts, { seed: sd + 40 + i, t, amp: 1.4 }) + ' ';
              dpr += inkPath(pts, { w: 4.5, seed: sd + 60 + i, t, closed: true, amp: 1.4 }) + ' ';
            }
          }
          plumeF.setAttribute('d', dpf); plumeR.setAttribute('d', dpr);
          // the high layer spreading sideways from the plume top
          if (lp > 0.001) {
            const x0 = vx - (vx + 80) * lp, x1 = vx + (W + 80 - vx) * lp, yA = ty - 100, yB = ty - 20, pts = [];
            for (let x = x0; x <= x1; x += 60) pts.push([x, yA + Math.sin(x * 0.01 + lt) * 8]);
            const bot = []; for (let x = x1; x >= x0; x -= 60) bot.push([x, yB + Math.sin(x * 0.013 - lt) * 6]);
            layerF.setAttribute('d', inkLoop(pts.concat(bot), { seed: sd + 80, t, amp: 1 }));
            let dd = '';
            for (let i = 0; i < 70; i++) { const x = lerp(x0, x1, ((i * 0.618) % 1)), y = lerp(yA + 10, yB - 6, ((i * 0.37) % 1)) + Math.sin(lt * 1.5 + i) * 4; dd += inkDot(x + Math.sin(lt * 0.7 + i) * 6, y, 3.5, 3.5, sd + 100 + i, t) + ' '; }
            layerD.setAttribute('d', dd);
          } else { layerF.setAttribute('d', ''); layerD.setAttribute('d', ''); }
          // cloud deck + rain under it
          let dr = '';
          const ck = punch(lt, atOr(cues, 'clouds', null), 0.6);
          clouds.forEach(([u, dy, w], i) => {
            const xx = ((u * W + lt * 18 + 150) % (W + 300)) - 150;
            const pts = puff(xx, cy + dy * H, w * (1 + 0.05 * ck), 80, i + 1);
            cloudF[i].setAttribute('d', inkLoop(pts, { seed: sd + 120 + i, t, amp: 1.2 }));
            dr += inkPath(pts, { w: 5, seed: sd + 130 + i, t, closed: true, amp: 1.3 }) + ' ';
          });
          cloudR.setAttribute('d', dr);
          let dn = '';
          for (let i = 0; i < 46; i++) {
            const x = (i * 97.3) % W + Math.sin(i) * 20, sp = 260 + (i % 5) * 30;
            const y = cy + 30 + ((lt * sp + i * 53) % (gy - cy - 50));
            if (Math.abs(x - vx) < 120 && y < vt + 40) continue;
            dn += inkPath([[x, y], [x - 6, y + 26]], { w: 3.5, seed: sd + 200 + i, t, amp: 0.6 }) + ' ';
          }
          rain.setAttribute('d', dn);
          C.tick(lt, dur, cues, t, PL.at);
        },
      };
    },
  };

  // ================================================================== tbB_globe
  const LANDS = [
    [[114, -22], [122, -17], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [135, -34], [129, -32], [117, -35], [115, -30]],
    [[60, 25], [70, 22], [77, 8], [80, 15], [88, 22], [92, 21], [98, 16], [100, 8], [104, 1], [106, 10], [109, 13], [108, 21], [117, 23], [121, 30], [122, 40], [130, 43], [140, 50], [142, 60], [100, 72], [60, 70], [50, 45], [55, 30]],
    [[109, 1], [111, -3], [116, -4], [119, 1], [117, 7], [113, 3]],
    [[95, 5], [98, 4], [106, -6], [104, -5], [100, -1]],
    [[105, -6.3], [114, -7.2], [114.4, -8.6], [106, -7.6]],
    [[116.5, -8.3], [119.2, -8.2], [119.1, -8.9], [116.8, -9]],
    [[119, -5.5], [120, 1], [124.5, 1.2], [121, -1], [122, -5]],
    [[131, -1], [141, -2.5], [150, -10], [141, -9], [137, -5]],
    [[10, 35], [32, 31], [43, 12], [51, 11], [40, -15], [35, -25], [20, -35], [12, -17], [9, 4], [-17, 15], [-10, 30]],
    [[130, 31], [141, 35], [142, 43], [139, 40]],
    [[-168, 66], [-140, 70], [-95, 72], [-60, 55], [-80, 26], [-97, 18], [-105, 22], [-125, 48], [-155, 58]],
  ];
  SH.tbB_globe = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 877;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const G = Object.assign({ x: 0.42, y: 0.47, r: 300, lon: 118, lat: 8, spin: 3 }, P.globe || {});
      const MK = Object.assign({ lon: 118, lat: -8.25, at: 0.2 }, P.mark || {});
      const HZ = Object.assign({ at: 0.6, dur: 3.5, from: 0 }, P.haze || {});
      const rad = Math.PI / 180;
      const shellR = inkEl(L.back, INK.gold);
      const disc = inkEl(L.back, INK.paperLight), grat = inkEl(L.back, INK.inkSoft, { 'fill-opacity': 0.45 });
      const lands = LANDS.map(() => inkEl(L.back, INK.paperDark)), landR = inkEl(L.back, INK.inkSoft);
      const capF = inkEl(L.mid, INK.gold, { 'fill-opacity': 0.26 }), capD = inkEl(L.mid, INK.gold);
      const rim = inkEl(L.mid), winds = inkEl(L.mid, INK.inkSoft), mark = inkEl(L.mid, INK.red), markR = inkEl(L.mid, INK.paperLight);
      const frost = inkEl(L.front, INK.blue);
      const IN = P.inset ? Object.assign({ x: 0.74, y: 0.27, r: 120 }, P.inset) : null;
      const inset = IN ? { f: inkEl(L.front, INK.paperLight), dots: inkEl(L.front, INK.gold), r: inkEl(L.front), lead: inkEl(L.front, INK.inkSoft) } : null;
      const TH = P.thermo ? Object.assign({ x: 0.76, y: 0.5, from: 0.72, to: 0.42 }, P.thermo) : null;
      const th = TH ? { f: inkEl(L.front, INK.paperLight), merc: inkEl(L.front, INK.red), r: inkEl(L.front), ticks: inkEl(L.front), arrow: inkEl(L.front, INK.blue) } : null;
      const DR = rng(sd + 17), drops = [];
      for (let i = 0; i < 170; i++) drops.push([DR() * 360 - 180, Math.asin(DR() * 2 - 1) / rad]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const cx = G.x * W, cy = G.y * H, R = G.r * (1 + 0.004 * Math.sin(lt * 1.3));
          const lon0 = G.lon + lt * G.spin, lat0 = G.lat;
          const s0 = Math.sin(lat0 * rad), c0 = Math.cos(lat0 * rad);
          const proj = (lon, lat) => {
            const l = (lon - lon0) * rad, p = lat * rad, cp = Math.cos(p), sp = Math.sin(p);
            const x = cp * Math.sin(l), y = c0 * sp - s0 * cp * Math.cos(l), vis = s0 * sp + c0 * cp * Math.cos(l);
            if (vis >= 0) return [cx + R * x, cy - R * y, true];
            const n = Math.hypot(x, y) || 1;
            return [cx + R * x / n, cy - R * y / n, false];
          };
          disc.setAttribute('d', inkCircle(cx, cy, R, sd + 1, t, { fill: true }));
          // graticule: meridians + parallels (visible runs only)
          let dg = '';
          const runs = (pts, sdd) => { let cur = []; const out = []; pts.forEach(q => { if (q[2]) cur.push([q[0], q[1]]); else { if (cur.length > 1) out.push(cur); cur = []; } }); if (cur.length > 1) out.push(cur); out.forEach((r, k) => { dg += inkPath(r, { w: 2.6, seed: sdd + k, t, amp: 0.8 }) + ' '; }); };
          for (let m = -180; m < 180; m += 30) { const pts = []; for (let la = -84; la <= 84; la += 8) pts.push(proj(m, la)); runs(pts, sd + 300 + m); }
          for (let la = -60; la <= 60; la += 30) { const pts = []; for (let lo = -180; lo <= 180; lo += 8) pts.push(proj(lo, la)); runs(pts, sd + 700 + la); }
          grat.setAttribute('d', dg);
          // continents (behind-limb points clamp to the rim)
          let dl = '';
          LANDS.forEach((poly, i) => {
            const pr = poly.map(q => proj(q[0], q[1]));
            if (!pr.some(q => q[2])) { lands[i].setAttribute('d', ''); return; }
            const pts = pr.map(q => [q[0], q[1]]);
            lands[i].setAttribute('d', inkLoop(pts, { seed: sd + 20 + i, t, amp: 0.8 }));
            dl += inkPath(pts, { w: 3.2, seed: sd + 40 + i, t, closed: true, amp: 0.8 }) + ' ';
          });
          landR.setAttribute('d', dl);
          // haze cap around the mark, growing until it wraps the planet
          const ha = atOr(cues, HZ.at, 0.6), hp = Math.max(HZ.from, lt >= ha ? progIO(lt, ha, HZ.dur) : 0);
          const capA = hp * 180;
          const mlon = MK.lon * rad, mlat = MK.lat * rad;
          const angDist = (lon, lat) => { const a = lat * rad, b = (lon * rad - mlon); return Math.acos(Math.max(-1, Math.min(1, Math.sin(a) * Math.sin(mlat) + Math.cos(a) * Math.cos(mlat) * Math.cos(b)))) / rad; };
          if (capA > 0.5) {
            // boundary small circle
            const pts = [], d = capA * rad;
            for (let k = 0; k < 48; k++) {
              const az = k / 48 * Math.PI * 2;
              const la = Math.asin(Math.sin(mlat) * Math.cos(d) + Math.cos(mlat) * Math.sin(d) * Math.cos(az));
              const lo = mlon + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(mlat), Math.cos(d) - Math.sin(mlat) * Math.sin(la));
              const q = proj(lo / rad, la / rad); pts.push([q[0], q[1]]);
            }
            const full = capA > 150;
            capF.setAttribute('d', full ? inkCircle(cx, cy, R, sd + 3, t, { fill: true }) : inkLoop(pts, { seed: sd + 4, t, amp: 1 }));
            let dd = '';
            drops.forEach(([lo, la], i) => {
              if (angDist(lo, la) > capA) return;
              const q = proj(lo + Math.sin(lt * 0.6 + i) * 1.5, la); if (!q[2]) return;
              dd += inkDot(q[0], q[1], 4, 4, sd + 900 + i, t) + ' ';
            });
            capD.setAttribute('d', dd);
            // dashed gold shell above the rim, its length follows the cover
            const ms = proj(MK.lon, MK.lat), a0 = Math.atan2(ms[1] - cy, ms[0] - cx), span = Math.PI * Math.min(1, hp * 1.15);
            let ds = '';
            const rr = R * 1.09;
            for (let k = 0; k < 40; k++) {
              const a = a0 - span + k / 40 * span * 2 + lt * 0.05, b = a + span / 40 * 1.1;
              ds += inkPath([[cx + Math.cos(a) * rr, cy + Math.sin(a) * rr], [cx + Math.cos((a + b) / 2) * rr, cy + Math.sin((a + b) / 2) * rr], [cx + Math.cos(b) * rr, cy + Math.sin(b) * rr]], { w: 7, seed: sd + 1000 + k, t, amp: 0.8 }) + ' ';
            }
            shellR.setAttribute('d', ds);
          } else { capF.setAttribute('d', ''); capD.setAttribute('d', ''); shellR.setAttribute('d', ''); }
          rim.setAttribute('d', inkCircle(cx, cy, R, sd + 2, t, { w: 7 }));
          // wind arrows drifting east along the parallels
          let dw = '';
          if (P.winds !== false && hp > 0.05) {
            [[-20, 0], [10, 1.3], [35, 2.6], [-40, 3.9]].forEach(([la, ph], i) => {
              const u = ((lt * 0.22 + ph * 0.25) % 1), lo = lon0 - 70 + u * 140;
              const pts = []; for (let k = 0; k < 6; k++) pts.push(proj(lo + k * 6, la));
              if (!pts.every(q => q[2])) return;
              const pp = pts.map(q => [q[0], q[1]]);
              dw += inkPath(pp, { w: 5, seed: sd + 1100 + i, t, amp: 0.8 }) + ' ';
              const e = pp[5], f = pp[4], an = Math.atan2(e[1] - f[1], e[0] - f[0]);
              dw += inkPath([[e[0] - Math.cos(an - 0.6) * 20, e[1] - Math.sin(an - 0.6) * 20], e, [e[0] - Math.cos(an + 0.6) * 20, e[1] - Math.sin(an + 0.6) * 20]], { w: 5, seed: sd + 1120 + i, t, amp: 0.6, smooth: false }) + ' ';
            });
          }
          winds.setAttribute('d', dw);
          // the red mark (Tambora)
          const mka = atOr(cues, MK.at, 0.2), mp = lt >= mka ? spring(lt, mka, 0.5) : 0, mq = proj(MK.lon, MK.lat);
          if (mp > 0.01 && mq[2]) {
            const r0 = 13 * mp * (1 + 0.12 * Math.sin(lt * 5));
            mark.setAttribute('d', inkCircle(mq[0], mq[1], r0, sd + 5, t, { fill: true }) + ' ' + inkCircle(mq[0], mq[1], r0 * 2.1, sd + 6, t, { w: 4 }));
            markR.setAttribute('d', inkCircle(mq[0], mq[1], r0 * 0.4, sd + 7, t, { fill: true }));
          } else { mark.setAttribute('d', ''); markR.setAttribute('d', ''); }
          // magnifier inset: tiny droplets drifting
          if (inset) {
            const ia = atOr(cues, IN.at, 1), ip = lt >= ia ? spring(lt, ia, 0.6) : 0;
            if (ip > 0.01) {
              const x = IN.x * W, y = IN.y * H, r = IN.r * ip;
              inset.f.setAttribute('d', inkCircle(x, y, r, sd + 8, t, { fill: true }));
              inset.r.setAttribute('d', inkCircle(x, y, r, sd + 9, t, { w: 8 }) + ' ' + inkPath([[x + r * 0.72, y + r * 0.72], [x + r * 1.25, y + r * 1.25]], { w: 16, seed: sd + 10, t, amp: 1 }));
              let dd = '';
              for (let i = 0; i < 26; i++) {
                const u = ((i * 0.618 + lt * 0.05 * (1 + i % 3)) % 1) * 2 - 1, v = (((i * 0.37) + Math.sin(lt * 0.9 + i) * 0.05) % 1) * 2 - 1;
                if (u * u + v * v > 0.72) continue;
                const rr2 = (6 + (i % 4) * 2.5) * ip;
                dd += inkDot(x + u * r, y + v * r, rr2, rr2, sd + 1200 + i, t) + ' ';
              }
              inset.dots.setAttribute('d', dd);
              const tgt = proj(MK.lon + 40, MK.lat + 20);
              inset.lead.setAttribute('d', inkPath([[x - r * 0.9, y + r * 0.5], [lerp(x - r, tgt[0], 0.5), lerp(y + r * 0.6, tgt[1], 0.5) - 20], [tgt[0], tgt[1]]], { w: 4, seed: sd + 11, t, amp: 1 }));
            } else { inset.f.setAttribute('d', ''); inset.r.setAttribute('d', ''); inset.dots.setAttribute('d', ''); inset.lead.setAttribute('d', ''); }
          }
          // thermometer: red column drops on the cue, blue down-arrow beside it
          if (th) {
            const x = TH.x * W, y = TH.y * H, h = 420, w = 44;
            const da = atOr(cues, TH.at, dur * 0.4), dp = lt >= da ? progIO(lt, da, 1.1) : 0, pk = punch(lt, da + 1.0, 0.6);
            const lev = lerp(TH.from, TH.to, dp);
            const tube = [[x - w / 2, y + h / 2 - 20], [x - w / 2, y - h / 2 + 20], [x - w / 2 + 6, y - h / 2 + 4], [x, y - h / 2 - 4], [x + w / 2 - 6, y - h / 2 + 4], [x + w / 2, y - h / 2 + 20], [x + w / 2, y + h / 2 - 20]];
            th.f.setAttribute('d', inkLoop(tube, { seed: sd + 12, t, amp: 0.8 }) + ' ' + inkCircle(x, y + h / 2 + 30, 50, sd + 13, t, { fill: true }));
            const top = lerp(y + h / 2, y - h / 2 + 20, lev);
            th.merc.setAttribute('d', inkCircle(x, y + h / 2 + 30, 36 * (1 + 0.05 * pk), sd + 14, t, { fill: true }) + ' ' +
              inkLoop([[x - 12, y + h / 2 + 10], [x - 12, top], [x + 12, top], [x + 12, y + h / 2 + 10]], { seed: sd + 15, t, amp: 0.6, smooth: false }));
            th.r.setAttribute('d', inkPath(tube, { w: 6, seed: sd + 16, t, amp: 0.8 }) + ' ' + inkCircle(x, y + h / 2 + 30, 50, sd + 17, t, { w: 6 }));
            let dt = '';
            for (let k = 0; k < 7; k++) { const yy = y - h / 2 + 50 + k * 50; dt += inkPath([[x + w / 2 + 6, yy], [x + w / 2 + (k % 2 ? 22 : 36), yy]], { w: 4, seed: sd + 18 + k, t, amp: 0.6 }) + ' '; }
            th.ticks.setAttribute('d', dt);
            if (dp > 0.02) {
              const ax = x + w / 2 + 130, a0 = y - 190, a1 = lerp(a0, y + 190, dp), k = 1 + 0.12 * pk;
              th.arrow.setAttribute('d', inkPath([[ax, a0], [ax + 6, (a0 + a1) / 2], [ax, a1]], { w: 24 * k, seed: sd + 30, t, amp: 1 }) + ' ' +
                inkPath([[ax - 60 * k, a1 - 64 * k], [ax, a1 + 8], [ax + 60 * k, a1 - 64 * k]], { w: 24 * k, seed: sd + 31, t, amp: 1, smooth: false }));
            } else th.arrow.setAttribute('d', '');
          }
          // frost: blue six-armed snowflakes around the globe
          const fa = atOr(cues, P.frost, null);
          if (fa != null && lt >= fa) {
            let df = '';
            for (let i = 0; i < 9; i++) {
              const a = i / 9 * Math.PI * 2 + 0.4, rr2 = R * (1.2 + (i % 3) * 0.08), x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2;
              const p = spring(lt, fa + i * 0.12, 0.5); if (p < 0.01) continue;
              const s = (22 + (i % 2) * 8) * p, spin = lt * 0.4 + i;
              for (let k = 0; k < 3; k++) { const b = spin + k * Math.PI / 3; df += inkPath([[x - Math.cos(b) * s, y - Math.sin(b) * s], [x + Math.cos(b) * s, y + Math.sin(b) * s]], { w: 5, seed: sd + 1300 + i * 3 + k, t, amp: 0.6 }) + ' '; }
            }
            frost.setAttribute('d', df);
          } else frost.setAttribute('d', '');
          C.tick(lt, dur, cues, t, P.hit || 'hit');
        },
      };
    },
  };

  // ================================================================== tbB_rays
  SH.tbB_rays = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 899;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const gy = (P.ground ?? 0.8) * H;
      const SU = Object.assign({ x: 0.13, y: 0.2, r: 78 }, P.sun || {});
      const VL = Object.assign({ y: 0.36, faint: 0.35 }, P.veil || {});
      const RY = P.rays ? Object.assign({ at: 0.2, n: 6 }, P.rays) : null;
      const CL = P.cloud ? Object.assign({ x: 0.5, y: 0.22, w: 380, at: 0.3 }, P.cloud) : null;
      const sunF = inkEl(L.back, INK.gold), sunR = inkEl(L.back), sunRays = inkEl(L.back, INK.gold);
      const veil = inkEl(L.back, INK.gold), veilLine = inkEl(L.back, INK.gold, { 'fill-opacity': 0.5 });
      const cloudR = inkEl(L.back, INK.inkSoft), cloudX = inkEl(L.back, INK.red);
      const raysIn = inkEl(L.mid, INK.gold), raysOut = inkEl(L.mid, INK.red), heat = inkEl(L.mid, INK.gold), photons = inkEl(L.mid, INK.gold);
      const hillF = inkEl(L.mid, INK.paperDark, { 'fill-opacity': 0.7 }), hillR = inkEl(L.mid, INK.inkSoft), groundR = inkEl(L.mid), wheat = inkEl(L.mid, INK.gold);
      const farmF = inkEl(L.mid, INK.paperLight), farmR = inkEl(L.mid), farmRoof = inkEl(L.mid, INK.red);
      const VR = rng(sd + 21), specks = [];
      for (let i = 0; i < 120; i++) specks.push([VR(), VR(), VR()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const sx = SU.x * W, sy = SU.y * H;
          sunDraw(sunF, sunR, sunRays, t, sx, sy, SU.r * (1 + 0.03 * Math.sin(t * 2)), sd + 1, 0, 0.25);
          // the veil: a high band of tiny gold specks; faint unless glinting
          const vy = VL.y * H, ga = atOr(cues, VL.glint, null);
          let dv = '';
          const gk = ga != null && lt >= ga ? clamp01((lt - ga) / 0.4) : 0;
          specks.forEach(([u, v, k], i) => {
            const x = ((u * (W + 200) + lt * (8 + k * 10)) % (W + 200)) - 100, y = vy + (v - 0.5) * 70 + Math.sin(lt + i) * 4;
            const sweep = ga != null ? Math.exp(-Math.pow((x - lerp(-200, W + 200, clamp01((lt - ga) / 1.6))) / 160, 2)) : 0;
            const r = (2.5 + k * 2) * (1 + sweep * 1.4) * (VL.faint + (1 - VL.faint) * Math.max(gk * 0.6, sweep));
            if (r < 0.9) return;
            dv += inkDot(x, y, r, r, sd + 100 + i, t) + ' ';
          });
          veil.setAttribute('d', dv);
          veilLine.setAttribute('d', gk > 0 ? inkPath([[-20, vy + 46], [W * 0.5, vy + 50], [W + 20, vy + 44]], { w: 3, seed: sd + 98, t, amp: 1 }) + ' ' + inkPath([[-20, vy - 46], [W * 0.5, vy - 50], [W + 20, vy - 44]], { w: 3, seed: sd + 99, t, amp: 1 }) : '');
          // "not like a cloud": dashed cloud outline crossed out
          if (CL) {
            const ca = atOr(cues, CL.at, 0.3), cp = lt >= ca ? prog(lt, ca, 0.6) : 0;
            const pts = puff(CL.x * W + Math.sin(lt * 0.5) * 8, CL.y * H, CL.w, 90, 3);
            let dc = '';
            const n = Math.floor(pts.length * cp);
            for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % pts.length]; dc += inkPath([a, [(a[0] * 2 + b[0]) / 3, (a[1] * 2 + b[1]) / 3]], { w: 5, seed: sd + 200 + k, t, amp: 1 }) + ' '; }
            cloudR.setAttribute('d', dc);
            const xa = atOr(cues, CL.cross, null), xp = xa != null && lt >= xa ? prog(lt, xa, 0.35) : 0, xk = punch(lt, xa, 0.6);
            if (xp > 0.01) {
              const cx = CL.x * W, cy = CL.y * H - 20, q = (CL.w * 0.42) * (1 + 0.1 * xk);
              cloudX.setAttribute('d', inkPath([[cx - q, cy - q * 0.45], [lerp(cx - q, cx + q, xp), lerp(cy - q * 0.45, cy + q * 0.45, xp)]], { w: 14, seed: sd + 230, t, amp: 1.2 }) + ' ' +
                (xp > 0.5 ? inkPath([[cx + q, cy - q * 0.45], [lerp(cx + q, cx - q, (xp - 0.5) * 2), lerp(cy - q * 0.45, cy + q * 0.45, (xp - 0.5) * 2)]], { w: 14, seed: sd + 231, t, amp: 1.2 }) : ''));
            } else cloudX.setAttribute('d', '');
          }
          // hills, ground, wheat, farmhouse
          const hp = [];
          for (let x = -40; x <= W + 40; x += 80) hp.push([x, gy - 50 - 50 * Math.abs(Math.sin(x * 0.0021 + 1.2))]);
          hillF.setAttribute('d', inkLoop(hp.concat([[W + 40, gy], [-40, gy]]), { seed: sd + 30, t, amp: 1 }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 31, t, amp: 1.2 }));
          groundR.setAttribute('d', inkPath([[-20, gy], [W / 2, gy + 4], [W + 20, gy - 2]], { w: 6, seed: sd + 32, t, amp: 1.3 }));
          let dw = '';
          for (let i = 0; i < 30; i++) { const x = 30 + i * 30, sw = Math.sin(lt * 2 + i * 0.5) * 5; dw += inkPath([[x, gy], [x + sw, gy - 50 - (i % 3) * 8]], { w: 4, seed: sd + 40 + i, t, amp: 0.7 }) + ' ' + inkDot(x + sw, gy - 56 - (i % 3) * 8, 5, 9, sd + 80 + i, t) + ' '; }
          wheat.setAttribute('d', dw);
          if (P.farm !== false) {
            const fx = (P.farm_x ?? 0.42) * W, fw = 170, ft = gy - 120;
            const body = [[fx - fw / 2, gy], [fx - fw / 2, ft], [fx + fw / 2, ft], [fx + fw / 2, gy]], roof = [[fx - fw * 0.62, ft + 4], [fx, ft - 90], [fx + fw * 0.62, ft + 4]];
            farmF.setAttribute('d', inkLoop(body, { seed: sd + 50, t, amp: 0.8, smooth: false }));
            farmRoof.setAttribute('d', inkLoop(roof, { seed: sd + 51, t, amp: 0.8, smooth: false }));
            farmR.setAttribute('d', inkPath(body, { w: 5, seed: sd + 52, t, closed: true, amp: 1, smooth: false }) + ' ' + inkPath(roof, { w: 5, seed: sd + 53, t, closed: true, amp: 1, smooth: false }) + ' ' +
              inkPath([[fx - 22, gy], [fx - 22, gy - 64], [fx + 22, gy - 64], [fx + 22, gy]], { w: 4, seed: sd + 54, t, amp: 0.8, smooth: false }));
          }
          // sunrays: some bounce off the veil back to space (red), the rest reach the ground (gold, weak heat)
          if (RY) {
            const ra = atOr(cues, RY.at, 0.2), ba = atOr(cues, RY.bounce, ra + 0.6), wa = atOr(cues, RY.warm, null);
            let di = '', dout = '', dh = '', dp = '';
            for (let i = 0; i < RY.n; i++) {
              const bounce = i % 2 === 0;
              const ang = (32 + i * 6.5) * Math.PI / 180;                  // below horizontal, to the lower right
              const p0 = [sx + Math.cos(ang) * SU.r * 1.9, sy + Math.sin(ang) * SU.r * 1.9];
              const k = (vy - p0[1]) / Math.sin(ang), hitP = [p0[0] + Math.cos(ang) * k, vy];
              const kg = (gy - 60 - p0[1]) / Math.sin(ang), grd = [p0[0] + Math.cos(ang) * kg, gy - 60];
              const rp = lt >= ra + i * 0.08 ? prog(lt, ra + i * 0.08, 0.5) : 0;
              const segA = [p0, [lerp(p0[0], hitP[0], rp), lerp(p0[1], hitP[1], rp)]];
              if (rp > 0.01) di += inkPath(segA, { w: 6, seed: sd + 300 + i, t, amp: 1 }) + ' ';
              if (rp < 1) continue;
              if (bounce) {
                const bp = lt >= ba + i * 0.06 ? prog(lt, ba + i * 0.06, 0.7) : 0;
                const out = [hitP[0] + Math.cos(-ang) * 700, vy + Math.sin(-ang) * 700];
                const e = [lerp(hitP[0], out[0], bp), lerp(hitP[1], out[1], bp)];
                if (bp > 0.01) {
                  dout += inkPath([hitP, e], { w: 7, seed: sd + 400 + i, t, amp: 1 }) + ' ';
                  const an = -ang;
                  if (bp > 0.15 && bp < 0.999) dout += inkPath([[e[0] - Math.cos(an - 0.5) * 26, e[1] - Math.sin(an - 0.5) * 26], e, [e[0] - Math.cos(an + 0.5) * 26, e[1] - Math.sin(an + 0.5) * 26]], { w: 7, seed: sd + 420 + i, t, amp: 0.6, smooth: false }) + ' ';
                  dout += inkCircle(hitP[0], hitP[1], 12 + 4 * Math.sin(lt * 6 + i), sd + 440 + i, t, { w: 4 }) + ' ';
                  // a photon dot running out to space, looping
                  const u = ((lt - ba) * 0.7 + i * 0.3) % 1;
                  dp += inkDot(lerp(hitP[0], out[0], u * bp), lerp(hitP[1], out[1], u * bp), 7, 7, sd + 460 + i, t) + ' ';
                }
              } else {
                const gp = prog(lt, ra + 0.5 + i * 0.08, 0.6);
                const e = [lerp(hitP[0], grd[0], gp), lerp(hitP[1], grd[1], gp)];
                di += inkPath([hitP, e], { w: 6, seed: sd + 500 + i, t, amp: 1 }) + ' ';
                if (gp > 0.95) {
                  const an = ang;
                  di += inkPath([[e[0] - Math.cos(an - 0.5) * 24, e[1] - Math.sin(an - 0.5) * 24], e, [e[0] - Math.cos(an + 0.5) * 24, e[1] - Math.sin(an + 0.5) * 24]], { w: 6, seed: sd + 520 + i, t, amp: 0.6, smooth: false }) + ' ';
                  const wk = wa != null && lt >= wa ? 1 : 0.6;
                  for (let q = 0; q < 2; q++) { const hx = grd[0] - 14 + q * 28, hy = gy - 20 - ((lt * 30 + q * 20) % 40); dh += inkPath([[hx, hy], [hx + 6 * Math.sin(lt * 4 + q), hy - 14 * wk], [hx, hy - 28 * wk]], { w: 4, seed: sd + 540 + i * 2 + q, t, amp: 0.6 }) + ' '; }
                }
              }
              // incoming photon dots
              const u2 = ((lt - ra) * 0.8 + i * 0.21) % 1;
              dp += inkDot(lerp(p0[0], hitP[0], u2), lerp(p0[1], hitP[1], u2), 6, 6, sd + 560 + i, t) + ' ';
            }
            raysIn.setAttribute('d', di); raysOut.setAttribute('d', dout); heat.setAttribute('d', dh); photons.setAttribute('d', dp);
          }
          C.tick(lt, dur, cues, t, P.hit || 'hit');
        },
      };
    },
  };

  // ================================================================== tbB_caldera
  // The broken mountain after the blast (ink, like tbA_volcano by day): far hills, ground, smoke puffs churning up
  // from the flat caldera; from cue `rumble` it shakes and the smoke thickens.
  // P: {mountain: {x: 0.64, base: 0.86, hw: 0.36, h: 0.56, cut: 0.32}, rumble: cue|s, cast, labels, cam}
  SH.tbB_caldera = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 921;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const MT = Object.assign({ x: 0.64, base: 0.86, hw: 0.36, h: 0.56, cut: 0.32 }, P.mountain || {});
      const hillF = inkEl(L.back, INK.paperDark, { 'fill-opacity': 0.45 }), hillR = inkEl(L.back, INK.inkSoft);
      const smokeF = inkEl(L.back, INK.paperDark), smokeR = inkEl(L.back, INK.inkSoft);
      const mtn = mountain(L.mid, sd + 50);
      const groundF = inkEl(L.mid, INK.paperDark, { 'fill-opacity': 0.6 }), groundR = inkEl(L.mid), rocks = inkEl(L.mid, INK.paperDark), rocksR = inkEl(L.mid);
      const birds = inkEl(L.back);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, base = MT.base * H;
          const ra = atOr(cues, P.rumble, null), rum = ra != null && lt >= ra ? clamp01((lt - ra) / 0.3) : 0;
          const hp = [];
          for (let x = -40; x <= W + 40; x += 80) hp.push([x, base - 90 - 70 * Math.abs(Math.sin(x * 0.0019 + 0.4))]);
          hillF.setAttribute('d', inkLoop(hp.concat([[W + 40, base], [-40, base]]), { seed: sd + 1, t, amp: 1 }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 2, t, amp: 1.2 }));
          const mt = mtn.update(t, { x: MT.x * W, base, hw: MT.hw * W, h: MT.h * H, cut: MT.cut, shake: rum * 6 });
          // smoke: big ash puffs rising from the caldera, looping; thicker and faster after the rumble
          let pf = '', pr = '';
          const n = 6, sp = 0.16 + 0.1 * rum;
          for (let k = 0; k < n; k++) {
            const u = ((lt * sp + k / n) % 1), r = (40 + u * 95) * (1 + 0.25 * rum);
            const pts = blob(mt.top[0] + u * 120 + Math.sin(k * 2.1) * 30, mt.top[1] - 40 - u * (mt.top[1] - 230), r, k + 11, t);
            pf += inkLoop(pts, { seed: sd + 20 + k, t, amp: 1.2 }) + ' ';
            pr += inkPath(pts, { w: 4.5, seed: sd + 30 + k, t, closed: true, amp: 1.2 }) + ' ';
          }
          smokeF.setAttribute('d', pf); smokeR.setAttribute('d', pr);
          // rocks tumbling down the right slope after the rumble
          let rf = '', rr = '';
          if (rum > 0) for (let k = 0; k < 4; k++) {
            const v = ((lt - ra) * 0.45 + k * 0.23) % 1, x = mt.top[0] + (0.12 + v * 0.8) * MT.hw * W * (k % 2 ? 1 : -0.9);
            const y = mt.top[1] + v * (base - mt.top[1]) * 0.95 - 18 - Math.abs(Math.sin(v * 25)) * 14;
            const pts = inkEllipsePts(x, y, 16, 13, sd + 60 + k, 7, v * 14);
            rf += inkLoop(pts, { seed: sd + 70 + k, t, amp: 0.6 }) + ' '; rr += inkPath(pts, { w: 4, seed: sd + 80 + k, t, closed: true, amp: 0.6 }) + ' ';
          }
          rocks.setAttribute('d', rf); rocksR.setAttribute('d', rr);
          const gp = []; for (let x = -40; x <= W + 40; x += 60) gp.push([x, base + 4 + Math.sin(x * 0.01) * 5]);
          groundF.setAttribute('d', inkLoop(gp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 90, t, amp: 0.8, smooth: false }));
          groundR.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 91, t, amp: 1.2 }));
          let db = '';
          for (let k = 0; k < 3; k++) { const x = W * (0.12 + k * 0.08) + lt * 30 * (1 + rum * 3), y = H * (0.22 + k * 0.04) - rum * (lt - (ra || 0)) * 30, f = Math.sin(lt * 8 + k) * 10;
            db += inkPath([[x - 22, y - f], [x, y], [x + 22, y - f]], { w: 4, seed: sd + 95 + k, t, amp: 0.6 }) + ' '; }
          birds.setAttribute('d', db);
          C.tick(lt, dur, cues, t, P.rumble, rum * 0.25);
        },
      };
    },
  };

  // ================================================================== tbB_year
  // A hanging wall calendar whose page flips from one year to the next (Fraunces year, red header strip); optional
  // blue snow that starts falling on a cue.   P: {cal: {x: 0.56, y: 0.44, w: 460, h: 520}, from: "1815", to: "1816",
  //   flip: cue|s, header: ["APRIL", "JUNE"] (small header text before/after), snow: cue|s, cast, labels, cam}
  SH.tbB_year = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, sd = seed * 1000 + 947;
      const C = common(ctx, P, sd), L = C.layers, atOr = C.M.atOr;
      const CA = Object.assign({ x: 0.56, y: 0.44, w: 460, h: 520 }, P.cal || {});
      const g = el(L.mid, 'g');
      const nail = inkEl(g), string = inkEl(g), back = inkEl(g, INK.paperDark), backR = inkEl(g);
      const page = el(g, 'g'), pf = inkEl(page, INK.paperLight), head = inkEl(page, INK.red), pr = inkEl(page), grid = inkEl(page, INK.inkSoft, { 'fill-opacity': 0.6 });
      const yr = el(page, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 190, 'text-anchor': 'middle', fill: INK.ink });
      const hd = el(page, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 800, 'font-size': 60, 'text-anchor': 'middle', fill: INK.paperLight, 'letter-spacing': '0.08em' });
      const rings = inkEl(g);
      const snow = inkEl(L.front, INK.blue);
      const hdrs = P.header || [];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = W / 1920;
          const cx = CA.x * W, cy = CA.y * H, w = CA.w * k, h = CA.h * k, x0 = cx - w / 2, y0 = cy - h / 2;
          const sway = Math.sin(lt * 1.3) * 1.6;
          g.setAttribute('transform', `rotate(${f1(sway)} ${f1(cx)} ${f1(y0 - 90)})`);
          nail.setAttribute('d', inkCircle(cx, y0 - 90, 10, sd + 1, t, { fill: true }));
          string.setAttribute('d', inkPath([[x0 + w * 0.2, y0], [cx, y0 - 90], [x0 + w * 0.8, y0]], { w: 4, seed: sd + 2, t, amp: 0.8, smooth: false }));
          const box = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
          back.setAttribute('d', inkLoop(box.map(q => [q[0] + 12, q[1] + 14]), { seed: sd + 3, t, amp: 0.8, smooth: false }));
          backR.setAttribute('d', inkPath(box.map(q => [q[0] + 12, q[1] + 14]), { w: 4, seed: sd + 4, t, closed: true, amp: 0.8, smooth: false }));
          // flip: the old page folds up around the top edge (scaleY 1 -> 0), the new one drops down (0 -> 1)
          const fa = atOr(cues, P.flip, dur * 0.4), u = lt >= fa ? clamp01((lt - fa) / 0.6) : 0;
          const after = u >= 0.5, sy = after ? EASE((u - 0.5) * 2) : 1 - EASE_IO(u * 2), pk = punch(lt, fa + 0.6, 0.6);
          page.setAttribute('transform', `translate(0 ${f1(y0)}) scale(1 ${Math.max(0.02, sy).toFixed(3)}) translate(0 ${f1(-y0)})`);
          pf.setAttribute('d', inkLoop(box, { seed: sd + 5, t, amp: 0.8, smooth: false }));
          head.setAttribute('d', inkLoop([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h * 0.2], [x0, y0 + h * 0.2]], { seed: sd + 6, t, amp: 0.8, smooth: false }));
          pr.setAttribute('d', inkPath(box, { w: 5, seed: sd + 7, t, closed: true, amp: 1, smooth: false }));
          let dg = '';
          for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const xx = x0 + w * (0.12 + c * 0.127), yy = y0 + h * (0.7 + r * 0.09); dg += inkDot(xx, yy, 6, 6, sd + 20 + r * 7 + c, t) + ' '; }
          grid.setAttribute('d', dg);
          const txt = after ? (P.to || '1816') : (P.from || '1815');
          if (yr.textContent !== txt) yr.textContent = txt;
          yr.setAttribute('x', f1(cx)); yr.setAttribute('y', f1(y0 + h * 0.56));
          yr.setAttribute('fill', after ? INK.red : INK.ink);
          yr.setAttribute('transform', `translate(${f1(cx)} ${f1(y0 + h * 0.5)}) scale(${(1 + 0.1 * pk).toFixed(3)}) translate(${f1(-cx)} ${f1(-y0 - h * 0.5)})`);
          const ht = (after ? hdrs[1] : hdrs[0]) || '';
          if (hd.textContent !== ht) hd.textContent = ht;
          hd.setAttribute('x', f1(cx)); hd.setAttribute('y', f1(y0 + h * 0.135));
          let dr = '';
          for (let i = 0; i < 5; i++) { const rx = x0 + w * (0.14 + i * 0.18); dr += inkCircle(rx, y0, 14, sd + 40 + i, t, { w: 5 }) + ' '; }
          rings.setAttribute('d', dr);
          // snow
          const sa = atOr(cues, P.snow, null);
          let ds = '';
          if (sa != null && lt >= sa) {
            const k2 = clamp01((lt - sa) / 0.8);
            for (let i = 0; i < 34; i++) {
              if (i / 34 > k2) break;
              const x = ((i * 157.3) % W) + Math.sin(lt * 1.1 + i) * 24, y = ((lt - sa) * (110 + (i % 4) * 25) + (i * 83) % 600) % (H * 0.95) - 30;
              const s2 = 12 + (i % 3) * 5, b = lt * 0.6 + i;
              for (let q = 0; q < 3; q++) { const a = b + q * Math.PI / 3; ds += inkPath([[x - Math.cos(a) * s2, y - Math.sin(a) * s2], [x + Math.cos(a) * s2, y + Math.sin(a) * s2]], { w: 4, seed: sd + 100 + i * 3 + q, t, amp: 0.5 }) + ' '; }
            }
          }
          snow.setAttribute('d', ds);
          C.tick(lt, dur, cues, t, P.flip);
        },
      };
    },
  };
})();
