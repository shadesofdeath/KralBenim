// sky_rocket: a hand-drawn Saturn V moon rocket on its pad (parchment ink, brand/kit/BRAND.md §3, §5), made for the
// Stickstory long video "Skylab fell on Esperance" (2026-10-26): the third stage that became Skylab can light up red
// and slide out of the stack to become a horizontal "home" with windows; or the rocket lifts off on a flame and smoke
// column and something tears loose near the top. Parametric for any Saturn V / big-rocket moment. Uses sky__lib.js
// (SKY.mkPen / shape / line) and td__lib.js (TD.label / figure / stars). Boil 8 Hz, palette tokens only, pure (seed, lt).
// SHOTS.sky_rocket P: {
//   x: 0.42, ground: 0.9, s: 1 (rocket ~ 860 px tall at 1), tower: true,
//   highlight: {at: cue} | false     third stage gets a red outline + pulse,
//   extract: {at: cue, to: [0.74, 0.42] (0..1), s: 1.5, windows: true} | false   third stage slides out, turns level,
//            grows and gets glowing windows (becomes the station),
//   lift: {at: cue|sec, rise: 620, dur: 4} | false    engines light, smoke billows, rocket climbs,
//   fail: {at: cue} | false     red burst + a gold shield flap tearing off near the top, camera shake,
//   labels: [...TD.label], kasif: K | false, cam: {zoom: 1.06}
// }   cues: hit, highlight.at, extract.at, lift.at, fail.at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sky_rocket = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SKY = window.SKY, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 611;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const smG = el(cam, 'g'), sm = SKY.mkPen(smG);
      const twG = el(cam, 'g'), tw = SKY.mkPen(twG);
      const rkG = el(cam, 'g'), rk = SKY.mkPen(rkG);
      const s3G = el(cam, 'g'), s3 = SKY.mkPen(s3G);
      const fxG = el(cam, 'g'), fx = SKY.mkPen(fxG);
      const gnG = el(cam, 'g'), gn = SKY.mkPen(gnG);
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.14, y: 0.94, scale: 0.7, pose: 'point', face: 'right', dir: 40 }, P.kasif), sd + 7) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      const smoke = Array.from({ length: 16 }, (_, i) => { const r = rng(sd + 50 + i); return { side: i % 2 ? 1 : -1, k: r(), d: r() }; });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const fa = P.fail ? atOr(cues, P.fail.at, null) : null;
          const shake = fa != null && lt >= fa && lt < fa + 0.6 ? Math.sin(lt * 80) * 12 * (1 - (lt - fa) / 0.6) : 0;
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W / 2 + shake)} ${f1(H * 0.55)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.55)})`);
          const s = P.s ?? 1, X = (P.x ?? 0.42) * W, G = (P.ground ?? 0.9) * H;
          const la = P.lift ? atOr(cues, P.lift.at, 0.3) : null, lp = la != null && lt >= la ? (lt - la) / (P.lift.dur ?? 4) : 0;
          const rise = la != null ? (P.lift.rise ?? 620) * Math.pow(clamp01(lp), 1.6) : 0;
          const B = G - 40 * s - rise;         // bottom of the first stage (above the engine bells)
          // ---- smoke + flame
          sm.begin();
          if (la != null && lt >= la) {
            const ign = clamp01((lt - la) / 0.4);
            const fl = [[X - 60 * s, B + 40 * s], [X - 30 * s, B + (180 + Math.sin(t * 25) * 20) * s * ign], [X, B + (260 + Math.sin(t * 31) * 30) * s * ign], [X + 30 * s, B + (180 + Math.cos(t * 27) * 20) * s * ign], [X + 60 * s, B + 40 * s]];
            sm.fill(inkLoop(fl, { seed: sd + 1, t, amp: 3 }), INK.gold, 0.95);
            sm.fill(inkLoop(fl.map(([x, y]) => [X + (x - X) * 0.5, B + 40 * s + (y - B - 40 * s) * 0.6]), { seed: sd + 2, t, amp: 2 }), INK.red, 0.8);
            smoke.forEach((q, i) => {
              const ph = ((lt - la) * 0.45 + q.d) % 1, r = (50 + 90 * ph) * s * (0.7 + q.k * 0.6);
              const cx = X + q.side * (90 + ph * 420 * (0.6 + q.k)) * s, cy = G - 30 * s - ph * 60 * s;
              if (lt - la > q.d * 1.2) {
                sm.fill(inkLoop(SKY.ell(cx, cy, r, r * 0.75, 12), { seed: sd + 60 + i, t, amp: 2.5, smooth: true }), INK.paperLight);
                sm.fill(inkPath(SKY.ell(cx, cy, r, r * 0.75, 12), { w: 4, seed: sd + 80 + i, t, closed: true, amp: 2.5 }), INK.inkSoft);
              }
            });
          }
          sm.end();
          // ---- launch tower
          tw.begin();
          if (P.tower !== false) {
            const tx = X - 190 * s, top = G - 900 * s;
            SKY.line(tw, [[tx - 40 * s, G], [tx - 40 * s, top]], sd + 100, t, 6); SKY.line(tw, [[tx + 40 * s, G], [tx + 40 * s, top]], sd + 101, t, 6);
            for (let k = 0; k < 11; k++) { const y = G - k * 80 * s; SKY.line(tw, [[tx - 40 * s, y], [tx + 40 * s, y - 80 * s]], sd + 110 + k, t, 3, INK.inkSoft); SKY.line(tw, [[tx - 40 * s, y], [tx + 40 * s, y]], sd + 130 + k, t, 3, INK.inkSoft); }
            if (la == null || lt < la + 0.3) for (const y of [-300, -600]) SKY.line(tw, [[tx + 40 * s, G + y * s], [X - 75 * s, G + y * s]], sd + 150 + y, t, 5);
          }
          tw.end();
          // ---- rocket (stage 1 + 2 + instrument ring + shroud); stage 3 drawn separately
          rk.begin();
          const R = (pts) => pts.map(([x, y]) => [X + x * s, B + y * s]);
          for (let k = 0; k < 5; k++) { const ex = (k - 2) * 28; SKY.shape(rk, R([[ex - 14, 0], [ex + 14, 0], [ex + 22, 40], [ex - 22, 40]]), INK.inkSoft, sd + 200 + k, t, { w: 3.5 }); }
          SKY.shape(rk, R([[-75, 0], [75, 0], [75, -270], [-75, -270]]), INK.paperLight, sd + 210, t, { w: 6 });
          for (const [k, y0] of [[0, -40], [1, -160]]) SKY.shape(rk, R([[-75, y0], [0, y0], [0, y0 - 40], [-75, y0 - 40]]), INK.ink, sd + 212 + k * 2, t, { w: 3 });
          for (const sg of [-1, 1]) SKY.shape(rk, R([[sg * 75, -10], [sg * 115, 30], [sg * 115, 40], [sg * 75, -60]]), INK.ink, sd + 220 + sg, t, { w: 3 });
          SKY.shape(rk, R([[-75, -280], [75, -280], [75, -520], [-75, -520]]), INK.paperLight, sd + 230, t, { w: 6 });
          SKY.shape(rk, R([[-75, -280], [75, -280], [75, -300], [-75, -300]]), INK.ink, sd + 232, t, { w: 3 });
          // nose shroud above stage 3 (stays on the rocket)
          const hl = P.highlight ? atOr(cues, P.highlight.at, null) : null;
          const ex = P.extract ? atOr(cues, P.extract.at, null) : null;
          SKY.shape(rk, R([[-55, -680], [55, -680], [55, -700], [-55, -700]]), INK.inkSoft, sd + 240, t, { w: 3 });
          SKY.shape(rk, R([[-55, -700], [55, -700], [30, -800], [0, -840], [-30, -800]]), INK.paperLight, sd + 242, t, { w: 5 });
          rk.end();
          // ---- third stage (the future Skylab)
          s3.begin();
          const e = ex != null && lt >= ex ? progIO(lt, ex, 1.8) : 0;
          const TO = P.extract ? Object.assign({ to: [0.74, 0.42], s: 1.5 }, P.extract) : null;
          const c0 = [X, B - 600 * s], c1 = TO ? [TO.to[0] * W, TO.to[1] * H] : c0;
          const cx = lerp(c0[0], c1[0], e), cy = lerp(c0[1], c1[1], e) - Math.sin(e * Math.PI) * 120, ang = lerp(0, 90, e), sc = s * lerp(1, TO ? TO.s : 1, e);
          s3G.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(ang)}) scale(${sc.toFixed(4)})`);
          const hp = hl != null && lt >= hl ? 1 : 0;
          SKY.shape(s3, [[-75, 80], [75, 80], [55, 60], [-55, 60]], INK.paperLight, sd + 250, t, { w: 5 });
          SKY.shape(s3, [[-55, 60], [55, 60], [55, -80], [-55, -80]], INK.paperLight, sd + 252, t, { w: 6, ink: hp && e < 0.05 ? INK.red : INK.ink });
          SKY.line(s3, [[-53, 0], [53, 0]], sd + 254, t, 3, INK.inkSoft);
          if (hp && e < 0.05) {
            const pk = punch(lt, hl, 0.8), r2 = 1 + 0.1 * pk;
            s3.fill(inkPath([[-75 * r2, 100 * r2], [75 * r2, 100 * r2], [75 * r2, -100 * r2], [-75 * r2, -100 * r2]], { w: 9, seed: sd + 256, t, closed: true, smooth: false }), INK.red);
          }
          if (TO && TO.windows !== false && e > 0.6) {
            const wv = clamp01((e - 0.6) / 0.4);
            for (let k = 0; k < 3; k++) s3.fill(inkDot(0, -50 + k * 45, 10 * wv, 10 * wv, sd + 260 + k, t), INK.gold);
          }
          s3.end();
          // ---- failure burst near the top
          fx.begin();
          if (fa != null && lt >= fa) {
            const q = clamp01((lt - fa) / 1.6), bx = X + 60 * s, by = B - 600 * s;
            if (q < 0.5) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, r1 = 30 + 160 * q, r2 = r1 + 50; SKY.line(fx, [[bx + Math.cos(a) * r1, by + Math.sin(a) * r1], [bx + Math.cos(a) * r2, by + Math.sin(a) * r2]], sd + 300 + k, t, 7, INK.red); }
            const fxp = bx + 420 * q, fyp = by - 200 * q + 260 * q * q, a2 = 300 * q;
            const flap = [[-50, -18], [50, -24], [56, 16], [-46, 22]].map(p => { const r = SKY.rotP(p, a2); return [r[0] + fxp, r[1] + fyp]; });
            SKY.shape(fx, flap, INK.gold, sd + 320, t, { op: 0.75 });
          }
          fx.end();
          gn.begin();
          SKY.shape(gn, [[X - 260 * s, G], [X + 200 * s, G], [X + 200 * s, G + 26], [X - 260 * s, G + 26]], INK.paperDark, sd + 400, t);
          SKY.line(gn, [[0, G + 26], [W, G + 30]], sd + 402, t, 6);
          gn.end();
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
