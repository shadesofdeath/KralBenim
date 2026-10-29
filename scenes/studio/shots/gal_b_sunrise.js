// gal_b_sunrise: dawn in a mountain valley (02-galileo-teleskop, B3: "on Earth the morning sun hits the peaks first").
// Use over "set": {"name": "hills", "ground": 880}. Three (or more) big sharp peaks fill the middle of the frame; the
// Sun rises on the left; the peaks' tips glow gold first and the light line slides down the slopes (from `light.at`)
// while the valley stays in shadow; mist drifts in the valley, birds cross; a small half Moon pops in the top-right on
// `moon.at`; Kaşif (GAL.person) stands on the valley floor. Foreground: dark valley floor with grass, rocks and bushes
// running to the frame bottom. Parchment ink, palette tokens only, pure function of (seed, lt).
// P: {peaks: [{x (0..1 W), h (0..1 H above the ground)}], ground: 0.815 (0..1 H; feet line = the set ground),
//     sun: {x: 0.08, y: 0.6, at: 0}, light: {at: cue, dur: 3.5, from: 0.06, to: 0.62 (lit share of each slope)},
//     moon: {x: 0.88, y: 0.16, r: 70, at: cue}, kasif: GAL.person (seq for pose / direction changes), cast, labels}
// cues: light.at, moon.at, hit (punch on the Moon), plus the person cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_b_sunrise = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 541;
      const gy = (P.ground ?? 0.815) * H;
      const PEAKS = (P.peaks || [{ x: 0.3, h: 0.5 }, { x: 0.55, h: 0.62 }, { x: 0.8, h: 0.45 }]).map((p, i) => ({ x: p.x * W, h: p.h * H, i }));
      // the tallest stands furthest back: draw by height, tallest first
      const order = PEAKS.slice().sort((a, b) => b.h - a.h);
      const root = el(svg, 'g');
      const glowG = el(root, 'g'), sunGlow = inkEl(glowG, INK.gold, { 'fill-opacity': 0.28 }), sunF = inkEl(glowG, INK.gold), sunR = inkEl(glowG, INK.gold), dawn = inkEl(glowG, INK.gold, { 'fill-opacity': 0.35 });
      const moonG = el(root, 'g'), moon = G.moon(moonG, sd + 1);
      const birds = inkEl(root, INK.ink);
      // each peak: body (shadow), lit cap (sun face + far face), hatching, outline, snow streaks
      const q = rng(inkHash(sd, 5));
      const MT = order.map(pk => {
        const g = el(root, 'g'), bw = pk.h * 0.78, pts = [];
        const x0 = pk.x - bw, x1 = pk.x + bw * 0.92, top = gy - pk.h;
        for (let k = 0; k <= 7; k++) { const u = k / 7; pts.push([lerp(x0, pk.x, u) + (k && k < 7 ? (q() - 0.5) * 30 : 0), lerp(gy + 6, top, Math.pow(u, 0.9)) + (k && k < 7 ? (q() - 0.3) * 26 : 0)]); }
        for (let k = 1; k <= 7; k++) { const u = k / 7; pts.push([lerp(pk.x, x1, u) + (k < 7 ? (q() - 0.5) * 30 : 0), lerp(top, gy + 6, Math.pow(u, 1.1)) + (k < 7 ? (q() - 0.3) * 26 : 0)]); }
        // keep each side monotonic so a horizontal cut gives one cap
        for (let k = 1; k <= 7; k++) pts[k][1] = Math.min(pts[k][1], pts[k - 1][1] - 4);
        for (let k = 8; k < pts.length; k++) pts[k][1] = Math.max(pts[k][1], pts[k - 1][1] + 4);
        return { pk, pts, top, x0, x1,
          body: inkEl(g, mix(INK.inkSoft, INK.ink, 0.38 - pk.i * 0.04)), hatch: inkEl(g, INK.ink, { 'fill-opacity': 0.55 }),
          capL: inkEl(g, mix(INK.gold, INK.paperLight, 0.3)), capR: inkEl(g, mix(INK.gold, INK.stain, 0.45)), crease: inkEl(g, mix(INK.stain, INK.ink, 0.3)), line: inkEl(g, INK.ink) };
      });
      const mist = inkEl(root, INK.paperLight, { 'fill-opacity': 0.55 });
      const floorF = inkEl(root, mix(INK.green, INK.paperDark, 0.45)), floorH = inkEl(root, mix(INK.green, INK.ink, 0.45)), floorL = inkEl(root, INK.ink);
      const actG = el(root, 'g');
      const people = [P.kasif ? Object.assign({ who: 'kasif', y: (P.ground ?? 0.815) + 0.045 }, P.kasif) : null].concat(P.cast || []).filter(Boolean).map((m, i) => G.person(actG, Object.assign({ y: (P.ground ?? 0.815) + 0.045 }, m), sd + 20 + i * 7));
      const fgF = inkEl(root, mix(INK.green, INK.ink, 0.55)), rockF = inkEl(root, mix(INK.inkSoft, INK.ink, 0.25)), rockLit = inkEl(root, mix(INK.gold, INK.paperDark, 0.5)), fgL = inkEl(root, INK.ink);
      const labels = (P.labels || []).map((L, i) => G.label(root, L, W, H, sd + 40 + i));
      const GR = Array.from({ length: 40 }, () => [q(), q(), q()]);
      const BUSH = [[-0.02, 1.0, 230], [0.09, 1.04, 170], [0.93, 1.02, 210], [1.03, 0.97, 190]];

      // the part of a mountain outline above the line y = cut (sides are monotonic)
      function cap(pts, cut) {
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          if (a[1] < cut) out.push(a);
          if ((a[1] - cut) * (b[1] - cut) < 0) { const u = (cut - a[1]) / (b[1] - a[1]); out.push([lerp(a[0], b[0], u), cut]); }
        }
        return out;
      }

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // the Sun climbing over the left horizon, with dawn streaks
          const SU = Object.assign({ x: 0.08, y: 0.6, at: 0 }, P.sun || {}), sa = G.atOr(cues, SU.at, 0);
          const sx = SU.x * W, sy = SU.y * H - progIO(lt, sa, Math.max(3, dur)) * 46, sr = 74;
          sunGlow.setAttribute('d', inkCircle(sx, sy, sr * 1.6, sd + 2, t, { fill: true }));
          sunF.setAttribute('d', inkCircle(sx, sy, sr, sd + 3, t, { fill: true }));
          let rr = '';
          for (let i = 0; i < 12; i++) { const a = i / 12 * G.TAU + t * 0.15, l = 1.9 + 0.2 * Math.sin(t * 3 + i); rr += G.line([[sx + Math.cos(a) * sr * 1.2, sy + Math.sin(a) * sr * 1.2], [sx + Math.cos(a) * sr * l, sy + Math.sin(a) * sr * l]], sd + 4 + i, t, 5) + ' '; }
          sunR.setAttribute('d', rr);
          let dw = '';
          for (let k = 0; k < 4; k++) { const y = sy + 30 - k * 46, x1 = sx + 520 - k * 90 + Math.sin(t * 0.5 + k) * 20; dw += G.line([[sx + sr * 1.3, y], [x1, y - 6]], sd + 20 + k, t, 7 - k, 0.6, 0.6) + ' '; }
          dawn.setAttribute('d', dw);
          // the little half Moon in the top-right (the "so these were mountains" moment)
          const MO = Object.assign({ x: 0.88, y: 0.16, r: 70 }, P.moon || {}), ma = G.atOr(cues, MO.at, null);
          if (ma != null && lt >= ma) { const mk = spring(lt, ma, 0.8), hp = punch(lt, ma, 0.7); moon.update(t, { x: MO.x * W, y: MO.y * H, r: Math.max(1, MO.r * mk * (1 + 0.15 * hp)), term: 0, rough: 1, halo: true, shade: 0.75 }); moonG.style.display = ''; }
          else moonG.style.display = 'none';
          // birds crossing the valley
          let bd = '';
          for (let i = 0; i < 4; i++) {
            const u = ((lt * 0.05 + i * 0.23) % 1.2) - 0.1, x = lerp(W * 0.25, W * 0.95, u), y = H * (0.3 + 0.05 * i) + Math.sin(t * 1.3 + i) * 10, f = Math.sin(t * 8 + i * 1.7) * 9, s = 22 - i * 3;
            bd += G.line([[x - s, y - f], [x, y], [x + s, y - f]], sd + 30 + i, t, 3.5) + ' ';
          }
          birds.setAttribute('d', bd);
          // peaks: the light line slides down every slope (each peak a beat after the tallest)
          const L = Object.assign({ at: 'peak', dur: 3.5, from: 0.06, to: 0.62 }, P.light || {}), la = G.atOr(cues, L.at, 0.6);
          MT.forEach((m, j) => {
            const k = lerp(L.from, L.to, progIO(lt, la + j * 0.25, L.dur)), cut = m.top + k * m.pk.h;
            m.body.setAttribute('d', inkLoop(m.pts, { seed: sd + 50 + j, t, amp: 0.6, smooth: false }));
            const cp = cap(m.pts, cut);
            m.capL.setAttribute('d', cp.length > 2 ? inkLoop(cp, { seed: sd + 60 + j, t, amp: 0.5, smooth: false }) : '');
            // far face (away from the Sun): the part of the cap right of the peak's crest, a little darker
            const far = cp.filter(p => p[0] >= m.pk.x - 2);
            m.capR.setAttribute('d', far.length > 1 ? inkLoop([[m.pk.x, m.top]].concat(far, [[m.pk.x + (cut - m.top) * 0.18, cut]]), { seed: sd + 70 + j, t, amp: 0.5, smooth: false }) : '');
            let hd = '';
            for (let s = 0; s < 9; s++) { const y = lerp(cut + 30, gy - 10, s / 9), half = (y - m.top) * 0.8; hd += G.line([[m.pk.x + half * 0.15, y], [m.pk.x + half * 0.75, y + 34]], sd + 80 + j * 10 + s, t, 2.2) + ' '; }
            m.hatch.setAttribute('d', hd);
            m.crease.setAttribute('d', G.line([[m.pk.x, m.top + 4], [m.pk.x + m.pk.h * 0.08, m.top + m.pk.h * 0.45], [m.pk.x + m.pk.h * 0.02, gy - 20]], sd + 90 + j, t, 5));
            m.line.setAttribute('d', G.line(m.pts, sd + 100 + j, t, 5.5, 0.8, 0.1) + (cp.length > 2 ? ' ' + G.line([cp[cp.length - 1], [lerp(cp[0][0], cp[cp.length - 1][0], 0.5), cut + 10], cp[0]], sd + 110 + j, t, 2.4) : ''));
          });
          // valley mist drifting
          let ms = '';
          for (let k = 0; k < 5; k++) { const y = gy - 70 + k * 22, x0 = ((lt * (18 + k * 6) + k * 400) % (W + 900)) - 700, w = 500 + k * 80; ms += inkLoop([[x0, y], [x0 + w * 0.3, y - 16], [x0 + w, y - 8], [x0 + w * 0.7, y + 12], [x0 + w * 0.1, y + 10]], { seed: sd + 120 + k, t, amp: 1 }) + ' '; }
          mist.setAttribute('d', ms);
          // valley floor to the frame bottom
          const fl = [[-40, gy - 8], [W * 0.3, gy - 2], [W * 0.6, gy + 4], [W + 40, gy - 6], [W + 40, H + 40], [-40, H + 40]];
          floorF.setAttribute('d', inkLoop(fl, { seed: sd + 130, t, amp: 0.5, smooth: false }));
          let gr = '';
          GR.forEach((g, i) => { const x = g[0] * W, y = lerp(gy + 20, H + 10, g[1]), s = lerp(10, 34, g[1]), sw = Math.sin(t * 1.4 + i) * s * 0.25; gr += G.line([[x - s * 0.5, y], [x - s * 0.3 + sw, y - s * 1.6]], sd + 140 + i, t, 3) + ' ' + G.line([[x + s * 0.3, y], [x + s * 0.5 + sw, y - s * 1.3]], sd + 190 + i, t, 3) + ' '; });
          floorH.setAttribute('d', gr);
          floorL.setAttribute('d', G.line(fl.slice(0, 4), sd + 135, t, 5));
          people.forEach(p => p && p.update(lt, t, cues, W, H));
          // foreground: dark bushes and a big rock with a gold-lit edge
          let bf = '';
          BUSH.forEach((b, i) => { for (let k = 0; k < 4; k++) { const cx = b[0] * W + (k - 1.5) * b[2] * 0.42, cy = b[1] * H - Math.abs(k - 1.5) * -18 - 30, r = b[2] * (0.42 + (k % 2) * 0.12), sw = Math.sin(t * 0.9 + i + k) * 4; bf += inkLoop(inkEllipsePts(cx + sw, cy, r, r * 0.8, sd + 200 + i * 5 + k, 10), { seed: sd + 200 + i * 5 + k, t, amp: 1.2 }) + ' '; } });
          fgF.setAttribute('d', bf);
          const rk = [[W * 0.74, H + 40], [W * 0.76, H * 0.93], [W * 0.8, H * 0.89], [W * 0.86, H * 0.9], [W * 0.9, H * 0.95], [W * 0.91, H + 40]];
          rockF.setAttribute('d', inkLoop(rk, { seed: sd + 230, t, amp: 0.6, smooth: false }));
          rockLit.setAttribute('d', inkLoop([rk[1], rk[2], rk[3], [W * 0.82, H * 0.93], [W * 0.77, H * 0.95]], { seed: sd + 231, t, amp: 0.6, smooth: false }));
          fgL.setAttribute('d', G.ring(rk, sd + 232, t, 5, 0.6) + ' ' + BUSH.map((b, i) => G.line([[b[0] * W - b[2] * 0.6, b[1] * H - b[2] * 0.3], [b[0] * W + b[2] * 0.6, b[1] * H - b[2] * 0.36]], sd + 240 + i, t, 2.4)).join(' '));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
