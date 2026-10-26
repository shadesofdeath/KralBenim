// sky_drag: why satellites fall, as one parchment diagram (Stickstory "Skylab fell on Esperance", 2026-10-26;
// parametric for any orbital-decay story). A big Earth limb at the bottom with a hatched blue air band above it;
// small ink air dots drift in the band; spacecraft (Skylab or a small telescope like Swift) ride a dashed orbit; the
// Sun can flare and the air band "puffs up" to the craft's height; a craft can sink and glow. Globe mode: a whole
// Earth with dashed ground tracks wrapping round it ("where will it land?"). Uses sky__lib.js (SKY) and td__lib.js
// (TD). Palette tokens only (INK), boil 8 Hz, pure function of (seed, lt).
// SHOTS.sky_drag P: {
//   earth: {y: 1.75, r: 1.15} (limb mode: centre y and radius in frame heights, centred in x) | false,
//   globe: {x: 0.5, y: 0.5, r: 0.3 (frame heights)} | false     (globe mode instead of the limb),
//   band: {h: 50, to: 240, at: cue|sec, dur: 2.2} (air band thickness in px above the limb; grows to `to` at `at`),
//   dots: 34 (air dots in the band),
//   sun: {x: 0.12, y: 0.18, r: 80, flare: cue (gold-red bolts strike the air band, sun pulses)} | false,
//   crafts: [{type: "skylab"|"swift", x: 0.6 (0..1 W), alt: 300 (px above the limb), s: 0.22, vx: 0.01 (W/s drift),
//            fall: {at: cue, to: 110, dur: 3}, glow: cue (flame trail), shake: true (shakes once the band reaches it),
//            state: {shield: 0, upper: 0, upper_gone: 1, parasol: 1, ...} (Skylab drawing state, SKY.station options),
//            label: {text, dy: -110, at, color, size}}],
//   orbit: true (dashed orbit line at the first craft's start altitude),
//   speed: {from: 1, to: 0.4, at: cue, dur: 2.5} | false (red speed arrow in front of the first craft, shrinking),
//   tracks: {at: cue|sec, n: 3} | false (globe mode: dashed tilted ground tracks drawing round the globe),
//   alt: {text: "~400 km", at} | false (bracket limb -> first craft),
//   labels: [...TD.label], kasif: K (TD.figure) | false, cam: {zoom: 1.06, fx: 0.5, fy: 0.5}
// }   cues: hit, band.at, sun.flare, crafts[].fall.at / glow, speed.at, tracks.at, alt.at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sky_drag = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, SKY = window.SKY, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const st = P.stars === 0 ? null : TD.stars(cam, sd + 1, W, H, P.stars ?? 22, 0.14, 0.55);
      const SU = P.sun ? Object.assign({ x: 0.12, y: 0.18, r: 80 }, P.sun) : null, sun = SU ? TD.sun(cam, sd + 2) : null;
      const bolts = SU ? [0, 1, 2].map(i => TD.bolt(cam, sd + 3 + i)) : [];
      const GL = P.globe ? Object.assign({ x: 0.5, y: 0.5, r: 0.3 }, P.globe) : null;
      const E = GL ? null : Object.assign({ y: 1.75, r: 1.15 }, P.earth || {});
      const bandG = el(cam, 'g'), bandPen = SKY.mkPen(bandG);
      const earth = TD.earth(cam, defs, sd + 6);
      const trkG = el(cam, 'g'), trkPen = SKY.mkPen(trkG);
      const B = Object.assign({ h: 50 }, P.band || {});
      const r0 = rng(sd + 9), dots = Array.from({ length: P.dots ?? 34 }, () => ({ a: r0(), h: r0(), k: r0() }));
      const crafts = (P.crafts || []).map((c, i) => {
        const C = Object.assign({ type: 'skylab', x: 0.6, alt: 300, s: 0.22, vx: 0.01 }, c);
        const g = el(cam, 'g'), LC = C.label ? Object.assign({ x: 0, y: 0 }, C.label) : null;
        return { C, d: C.type === 'swift' ? SKY.swift(g, sd + 20 + i) : SKY.station(g, sd + 20 + i), lab: LC ? TD.label(cam, LC, W, H, sd + 40 + i) : null, labCfg: LC };
      });
      const fxG = el(cam, 'g'), fx = SKY.mkPen(fxG);
      const altT = P.alt ? el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'start', fill: INK.ink }) : null;
      if (altT) altT.textContent = P.alt.text || '~400 km';
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 60 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.1, y: 0.92, scale: 0.65, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 8) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06, FX = (P.cam && P.cam.fx) ?? 0.5, FY = (P.cam && P.cam.fy) ?? 0.5;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W * FX)} ${f1(H * FY)}) scale(${z.toFixed(4)}) translate(${f1(-W * FX)} ${f1(-H * FY)})`);
          if (st) st.update(t);
          // sun + flare
          const fl = SU && SU.flare != null ? atOr(cues, SU.flare, null) : null;
          const fp = fl != null && lt >= fl ? 1 : 0, pulse = fl != null ? punch(lt, fl, 0.8) : 0;
          if (sun) sun.update(t, SU.x * W, SU.y * H, SU.r * (1 + 0.04 * Math.sin(t * 2) + 0.25 * pulse + 0.08 * fp));
          // earth
          let cx, cy, Rp;
          if (GL) { cx = GL.x * W; cy = GL.y * H; Rp = GL.r * H; } else { cx = W * 0.5; cy = E.y * H; Rp = E.r * H; }
          // air band
          const ba = B.at != null ? atOr(cues, B.at, null) : null;
          const bh = B.h + (ba != null && lt >= ba ? (B.to - B.h) * progIO(lt, ba, B.dur ?? 2.2) : 0) + Math.sin(t * 2.4) * 4;
          bandPen.begin();
          if (!GL) {
            const a0 = -Math.PI / 2 - 0.95, a1 = -Math.PI / 2 + 0.95, n = 40, out = [], inn = [];
            for (let i = 0; i <= n; i++) {
              const a = lerp(a0, a1, i / n), wv = Math.sin(a * 22 + t * 1.5) * 5;
              out.push([cx + Math.cos(a) * (Rp + bh + wv), cy + Math.sin(a) * (Rp + bh + wv)]);
              inn.push([cx + Math.cos(a) * Rp, cy + Math.sin(a) * Rp]);
            }
            bandPen.fill(inkLoop(out.concat(inn.reverse()), { seed: sd + 10, t, amp: 1.5 }), INK.blue, 0.22);
            for (let k = 0; k < 16; k++) {
              const u0 = k / 16, u1 = u0 + 0.035, seg = out.slice(Math.floor(u0 * n), Math.floor(u1 * n) + 2);
              if (seg.length > 1) bandPen.fill(inkPath(seg, { w: 4, seed: sd + 11 + k, t, amp: 0.8 }), INK.blue);
            }
            dots.forEach((q, i) => {
              const a = lerp(a0, a1, (q.a + t * 0.01 * (0.5 + q.k)) % 1), r = Rp + 10 + q.h * (bh - 16);
              bandPen.fill(inkDot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4 + q.k * 3, 4 + q.k * 3, sd + 100 + i, t), INK.inkSoft);
            });
          }
          bandPen.end();
          earth.update(t, cx, cy, Rp, true, true);
          if (fl != null) bolts.forEach((b, i) => {
            const d = fl + i * 0.15, p = lt >= d && lt < d + 1.4 ? prog(lt, d, 0.35) : 0;
            const tgt = GL ? [cx - Rp * 0.5, cy - Rp * 0.8] : [cx + (i - 1) * 300 - 200, cy - Rp - bh + 10];
            b.update(t, [SU.x * W + SU.r * 0.7, SU.y * H + SU.r * 0.5 + i * 20], tgt, p);
          });
          // ground tracks (globe mode)
          trkPen.begin();
          if (GL && P.tracks) {
            const ta = atOr(cues, P.tracks.at, 0.2), n = P.tracks.n ?? 3;
            for (let k = 0; k < n; k++) {
              const p = lt >= ta + k * 0.4 ? prog(lt, ta + k * 0.4, 1.6) : 0, tilt = (-28 + k * 26) * Math.PI / 180, ry = Rp * 0.32;
              const seg = 36;
              for (let j = 0; j < seg * p; j += 2) {
                const a = j / seg * Math.PI * 2 + t * 0.3, b2 = (j + 1) / seg * Math.PI * 2 + t * 0.3;
                const P2 = a2 => { const x = Math.cos(a2) * Rp * 1.08, y = Math.sin(a2) * ry; return [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]; };
                trkPen.fill(inkPath([P2(a), P2(b2)], { w: 6, seed: sd + 200 + k * 40 + j, t, amp: 0.8 }), INK.red);
              }
            }
          }
          trkPen.end();
          // crafts
          fx.begin();
          let first = null;
          crafts.forEach(({ C, d, lab, labCfg }, i) => {
            const fa = C.fall ? atOr(cues, C.fall.at, null) : null;
            let alt = C.alt;
            if (fa != null && lt >= fa) alt = lerp(C.alt, C.fall.to ?? 110, progIO(lt, fa, C.fall.dur ?? 3));
            const reach = !GL && bh >= alt - 30;
            const px = (C.x + C.vx * lt) * W;
            const R2 = Rp + alt, a = Math.asin(Math.max(-0.95, Math.min(0.95, (px - cx) / R2)));
            const sh = reach && C.shake !== false ? Math.sin(lt * 50) * 4 : 0;
            const X = cx + Math.sin(a) * R2 + sh, Y = cy - Math.cos(a) * R2;
            const ga = C.glow != null ? atOr(cues, C.glow, null) : null, glow = ga != null && lt >= ga ? clamp01((lt - ga) / 1) : 0;
            const rot = a * 180 / Math.PI + (C.type === 'swift' ? 0 : -4) + Math.sin(lt * 0.6 + i) * 2;
            if (C.type === 'swift') d.update(t, { x: X, y: Y, s: C.s, rot, glow });
            else d.update(t, Object.assign({}, C.state || {}, { x: X, y: Y, s: C.s, rot, glow, trail: 180 + rot }));
            if (lab) { labCfg.x = X / W; labCfg.y = (Y + (labCfg.dy ?? -120)) / H; lab.update(lt, t, cues); }
            if (i === 0) first = { X, Y, a, alt };
          });
          if (first && P.orbit !== false && !GL) {
            const R2 = Rp + crafts[0].C.alt;
            for (let k = 0; k < 22; k++) {
              const a0 = -Math.PI / 2 - 0.85 + k * 0.08, a1 = a0 + 0.04;
              fx.fill(inkPath([[cx + Math.cos(a0) * R2, cy + Math.sin(a0) * R2], [cx + Math.cos(a1) * R2, cy + Math.sin(a1) * R2]], { w: 4, seed: sd + 300 + k, t, amp: 0.6 }), INK.inkSoft);
            }
          }
          if (first && P.speed) {
            const S2 = Object.assign({ from: 1, to: 0.4 }, P.speed), sa = atOr(cues, S2.at, 0.3);
            const k = lerp(S2.from, S2.to, lt >= sa ? progIO(lt, sa, S2.dur ?? 2.5) : 0), L = 260 * k;
            const tx = Math.cos(first.a), ty = Math.sin(first.a), x0 = first.X + tx * 150, y0 = first.Y + ty * 150 - 60;
            const x1 = x0 + tx * L, y1 = y0 + ty * L;
            fx.fill(inkPath([[x0, y0], [x1, y1]], { w: 12, seed: sd + 400, t }), INK.red);
            fx.fill(inkLoop([[x1 - ty * 30, y1 + tx * 30], [x1 + tx * 40, y1 + ty * 40], [x1 + ty * 30, y1 - tx * 30]], { seed: sd + 401, t, smooth: false }), INK.red);
            for (let j = 0; j < 4; j++) {     // air dots hitting the front
              const ph = (t * 1.3 + j * 0.25) % 1, ex = x1 + tx * (220 - ph * 160) + (j - 1.5) * 18, ey = y1 + ty * (220 - ph * 160) - 40 + j * 26;
              fx.fill(inkDot(ex, ey, 7, 7, sd + 410 + j, t), INK.inkSoft);
            }
          }
          if (first && P.alt) {
            const aa = atOr(cues, P.alt.at, 0.3), p = lt >= aa ? prog(lt, aa, 0.6) : 0;
            const bx = first.X - 190, top = first.Y, bot = cy - Math.cos(first.a) * Rp;
            if (p > 0.01) {
              fx.fill(inkPath([[bx, bot], [bx, lerp(bot, top, p)]], { w: 6, seed: sd + 420, t }), INK.red);
              fx.fill(inkPath([[bx - 24, bot], [bx + 24, bot]], { w: 6, seed: sd + 421, t }), INK.red);
              if (p > 0.95) fx.fill(inkPath([[bx - 24, top], [bx + 24, top]], { w: 6, seed: sd + 422, t }), INK.red);
            }
            altT.setAttribute('opacity', p.toFixed(3));
            altT.setAttribute('x', f1(bx - 30)); altT.setAttribute('y', f1((top + bot) / 2 + 20)); altT.setAttribute('text-anchor', 'end');
          }
          fx.end();
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
