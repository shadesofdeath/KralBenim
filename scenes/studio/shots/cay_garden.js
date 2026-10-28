// cay_garden: Rize's terraced tea slopes (Chernobyl tea story, May 1986), parchment ink style (brand/kit/BRAND.md §3,
// §5; boils at 8 Hz, pure function of (seed, lt)). The hillside of terraced tea rows fills the frame from P.top down to
// the bottom edge (near rows big, dark, leaf-marked). Modes:
//   rain: a heavy ink cloud hangs over the slope, rain pours; from `dust` on, some drops glint gold and gold specks
//         settle on the bushes; a small wooden Rize house on stilts stands on the upper slope (P.house).
//   pick: a tea picker (headscarf, apron, wicker basket on her back) stands between the rows; her hand plucks the top
//         leaves again and again and tosses them over her shoulder into the basket; drizzle with gold specks; the
//         front rows are drawn in front of her. Made for a close-up camera on her hands.
//   end:  a clear day over the slopes: Kaşif stands on a terrace (P.kasif) next to a steaming tea glass on the terrace
//         wall (P.glass), points at the slope and waves on his cue.
// Leaves the sky to the scene's "set" (storm / hills); ground ≈ P.top.
// P: {mode: "rain"|"pick"|"end", top: 0.42 (0..1 H, first row), rows: 8, tilt: 0.1, house: true, dust: "dust" (cue) |
//     seconds, wet: 1, picker: {x: 0.46, y: 0.66, s: 1.25}, glass: {x: 0.3, y: 0.66, s: 0.9} | false,
//     kasif: {x, y, scale, pose, face, dir, emotion, seq} | false, label: {text, x, y, at, size, color, arrow}}
// cues: dust (gold specks), pluck (first pluck, pick mode), kasif seq names, label.at. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cay_garden = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 709, mode = P.mode || 'rain', u = W / 1080;
      const root = el(svg, 'g');
      const top = (P.top ?? (mode === 'pick' ? 0.36 : 0.42)) * H;
      const Q = (g, fill, extra) => inkEl(g, fill, extra);
      const cloudG = el(root, 'g');
      const clouds = mode === 'end' ? [] : [0, 1, 2].map(i => C.cloud(cloudG, sd + 10 + i * 9));
      const houseG = el(root, 'g');
      const house = P.house !== false && mode === 'rain' ? { body: Q(houseG, INK.stain), roof: Q(houseG, INK.red), lines: Q(houseG), win: Q(houseG, INK.gold, { 'fill-opacity': 0.8 }) } : null;
      const back = C.terraces(el(root, 'g'), sd + 20);
      const pk = mode === 'pick' ? Object.assign({ x: 0.46, y: 0.66, s: 1.25 }, P.picker || {}) : null;
      const picker = pk ? C.person(el(root, 'g'), sd + 30, { kind: 'picker' }) : null;
      const flyG = el(root, 'g'), fly = pk ? [0, 1, 2].map(() => ({ f: Q(flyG, INK.green), r: Q(flyG) })) : [];
      const front = pk ? C.terraces(el(root, 'g'), sd + 40) : null;
      const gl = mode === 'end' && P.glass !== false ? Object.assign({ x: 0.3, y: 0.665, s: 0.95 }, P.glass || {}) : null;
      const glass = gl ? C.glass(el(root, 'g'), sd + 50) : null;
      const kas = P.kasif ? C.kasif(el(root, 'g'), Object.assign({ x: 0.66, y: 0.66, scale: 1.0, pose: 'point', face: -1 }, P.kasif), W, H, seed) : null;
      const rainL = mode === 'end' ? null : C.rain(el(root, 'g'), sd + 60, mode === 'pick' ? 40 : 80);
      const lab = P.label ? C.label(root, P.label, W, H) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const dustAt = C.atOr(cues, P.dust ?? 'dust', mode === 'pick' ? -1 : dur * 0.55);
          const dust = mode === 'end' ? 0 : prog(lt, dustAt, 0.9);
          // clouds
          clouds.forEach((c, i) => c.update(t, (0.18 + i * 0.36) * W + Math.sin(t * 0.3 + i) * 20 * u + lt * 12 * u, (0.17 + (i % 2) * 0.05) * H, 620 * u, 250 * u, 1, 0.6));
          // the house on stilts on the upper slope
          if (house) {
            const hx = 0.78 * W, hy = top - 6 * u, hw = 150 * u, hh = 110 * u;
            const b = [[hx - hw / 2, hy - hh], [hx + hw / 2, hy - hh], [hx + hw / 2, hy], [hx - hw / 2, hy]];
            house.body.setAttribute('d', inkLoop(b, { seed: k + 1, t, smooth: false, amp: 0.8 }));
            const rf = [[hx - hw * 0.68, hy - hh + 4], [hx, hy - hh - 80 * u], [hx + hw * 0.68, hy - hh + 4]];
            house.roof.setAttribute('d', inkLoop(rf, { seed: k + 2, t, smooth: false, amp: 0.8 }));
            const L = [inkPath(b, { w: 4, seed: k + 3, t, closed: true, smooth: false }), inkPath(rf, { w: 4.5, seed: k + 4, t, closed: true, smooth: false })];
            for (let i = 1; i < 4; i++) L.push(inkPath([[hx - hw / 2, hy - hh + i * hh / 4], [hx + hw / 2, hy - hh + i * hh / 4]], { w: 2, seed: k + 5 + i, t }));
            L.push(inkPath([[hx - hw * 0.4, hy], [hx - hw * 0.42, hy + 34 * u]], { w: 6, seed: k + 9, t }), inkPath([[hx + hw * 0.4, hy], [hx + hw * 0.42, hy + 30 * u]], { w: 6, seed: k + 10, t }));
            house.lines.setAttribute('d', L.join(' '));
            house.win.setAttribute('d', inkLoop([[hx - 22 * u, hy - 76 * u], [hx + 22 * u, hy - 76 * u], [hx + 22 * u, hy - 40 * u], [hx - 22 * u, hy - 40 * u]], { seed: k + 11, t, smooth: false }));
          }
          // hillside
          back.update(t, W, H, { top: top / H, rows: P.rows ?? 8, tilt: P.tilt ?? 0.1, wet: P.wet ?? (mode === 'end' ? 0 : 1), dust: Math.max(dust, mode === 'pick' ? 1 : 0), sway: mode === 'rain' ? 1.6 : 1, skip: pk ? [pk.x - 0.12, pk.x + 0.12] : null });
          // picker
          if (picker) {
            const x = pk.x * W, gy = pk.y * H, s = pk.s;
            const cyc = 1.25, st = C.atOr(cues, 'pluck', 0.15), ph = lt < st ? 0 : ((lt - st) / cyc) % 1;
            const bush = [x + 150 * s, gy - 300 * s + Math.sin(t * 2) * 4], over = [x - 40 * s, gy - 480 * s];
            let hand;
            if (ph < 0.45) hand = [lerp(bush[0] - 20 * s, bush[0] + 20 * s, ph / 0.45), bush[1] + Math.sin(ph / 0.45 * Math.PI) * 14 * s];
            else if (ph < 0.75) { const q = progIO(ph, 0.45, 0.3); hand = [lerp(bush[0] + 20 * s, over[0], q), lerp(bush[1], over[1], q) - Math.sin(q * Math.PI) * 60 * s]; }
            else { const q = progIO(ph, 0.75, 0.25); hand = [lerp(over[0], bush[0] - 20 * s, q), lerp(over[1], bush[1], q)]; }
            const res = picker.update(t, x, gy, s, { face: 1, lean: 8, armR: hand, armL: [bush[0] - 70 * s, bush[1] + 30 * s] });
            // leaves in flight from the hand to the basket
            fly.forEach((f, i) => {
              const q = ((ph - 0.5 - i * 0.04) / 0.45);
              if (lt < st || q < 0 || q > 1) { f.f.setAttribute('d', ''); f.r.setAttribute('d', ''); return; }
              const tgt = res.leaf ? res.leaf[2] : [x - 80 * s, gy - 420 * s];
              const p = [lerp(over[0], tgt[0], q) + i * 16 * s, lerp(over[1], tgt[1], q) - Math.sin(q * Math.PI) * 80 * s];
              const a = q * 4 + i, L = 26 * s;
              const pts = [[p[0] - Math.cos(a) * L, p[1] - Math.sin(a) * L], [p[0] - Math.sin(a) * L * 0.4, p[1] + Math.cos(a) * L * 0.4], [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L], [p[0] + Math.sin(a) * L * 0.4, p[1] - Math.cos(a) * L * 0.4]];
              f.f.setAttribute('d', inkLoop(pts, { seed: k + 70 + i, t, amp: 0.6 }));
              f.r.setAttribute('d', inkPath(pts, { w: 3, seed: k + 74 + i, t, closed: true, amp: 0.6 }));
            });
            front.update(t, W, H, { top: (gy - 160 * s) / H, rows: 3, tilt: P.tilt ?? 0.1, wet: 1, dust: 1, near0: 0.62, near1: 1 });
          }
          // end: tea glass on the terrace wall + Kaşif
          if (glass) glass.update(t, gl.x * W, gl.y * H, gl.s, { fill: 0.8, steam: 1 });
          if (kas) kas.update(lt, t, cues);
          if (rainL) rainL.update(t, W, mode === 'pick' ? 0.08 * H : 0.24 * H, H, mode === 'pick' ? 0.6 : 1, dust * 0.6);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
