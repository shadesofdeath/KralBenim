// dr_wall: a wall being broken (or a tuff cliff being carved) and the dark tunnel behind it, parchment ink (BRAND.md §3, §5).
// mode "basement": a stone-block cellar wall with a shelf of jars and a hanging oil lamp; cracks spread on the swings,
// on `break` stone chunks fall and bounce, dust puffs, and a hole opens on a tunnel whose arches drop away into the
// dark (going down); after the break dust motes drift out of the hole ("draft").
// mode "cliff": outdoors, sky + fairy-chimney rocks behind, a pale tuff cliff on the right; the hole is carved bit by bit
// (carve: {at, dur}) while chips fly; good for "soft rock, easy to carve".
// P: {mode: "basement"|"cliff", hole: {x: 0.56, y: 0.5, rx: 170, ry: 215}, break: cue (basement), carve: {at, dur: 3} (cliff),
//   open: true (hole already open at start), cracks: cue (cracks start; default 0.3 s), draft: true,
//   cast: [DRL cast entries, x/y 0..1 of W/H (y = feet)], labels: [MCB labels], stamp: {text, at, x, y},
//   cam: {zoom: 1.06, focus: [0.55, 0.5]}, shake: cue (default = break)}
//   openings: [{x, y (bottom, 0..1), w: 70, h: 110, at, kind: "door"|"window"|"church"}] (cliff: carved openings pop in)
// cues: break, cracks, carve.at, shake, hit, label/cast at names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.dr_wall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const D = window.DRL, sd = seed * 1000 + 377, atOr = D.atOr, f1 = D.f1;
      const cliff = P.mode === 'cliff';
      const Hh = Object.assign({ x: cliff ? 0.66 : 0.56, y: cliff ? 0.56 : 0.5, rx: cliff ? 120 : 170, ry: cliff ? 190 : 215 }, P.hole || {});
      const hx = Hh.x * W, hy = Hh.y * H, floorY = H * 0.84;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bg = el(cam, 'g');
      // background
      const wallF = inkEl(bg, cliff ? INK.paperLight : INK.paperDark, { 'fill-opacity': cliff ? 1 : 0.6 });
      const wallR = inkEl(bg, INK.ink);
      const blocks = [], far = [];
      if (!cliff) {
        const r = rng(sd + 1);
        for (let row = 0; row < 6; row++) {
          let x = -W * 0.6 - (row % 2) * 90;
          const y = 215 + row * 112;
          while (x < W + 40) { const w = 170 + r() * 90; blocks.push({ x, y, w, h: 100, e: inkEl(bg, INK.inkSoft) }); x += w + 8; }
        }
      } else {
        for (let i = 0; i < 4; i++) far.push({ x: 0.06 + i * 0.12, s: 0.7 + (i % 2) * 0.35, f: inkEl(bg, INK.paperLight), r: inkEl(bg, INK.inkSoft) });
      }
      const shelf = cliff ? null : { b: inkEl(bg, INK.hat), j: inkEl(bg, INK.paperLight), jr: inkEl(bg, INK.ink) };
      const lampG = el(bg, 'g'), lamp = cliff ? null : D.lantern(lampG, sd + 5);
      const floor = inkEl(bg, INK.ink), floorF = inkEl(bg, INK.paperDark, { 'fill-opacity': 0.5 });
      // hole
      const holeG = el(cam, 'g');
      const hole = inkEl(holeG, INK.ink), rings = Array.from({ length: 5 }, (_, i) => inkEl(holeG, i % 2 ? INK.inkSoft : INK.paperDark, { 'fill-opacity': 0.9 }));
      const steps = inkEl(holeG, INK.paperDark), holeRim = inkEl(holeG, INK.ink);
      const cracks = inkEl(cam, INK.ink);
      const chunks = Array.from({ length: 9 }, () => ({ f: inkEl(cam, INK.paperDark), r: inkEl(cam, INK.ink) }));
      const dust = Array.from({ length: 7 }, () => inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }));
      const motes = Array.from({ length: 12 }, () => inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }));
      const chips = Array.from({ length: 6 }, () => inkEl(cam, INK.paperDark));
      const opens = (P.openings || []).map(() => ({ f: inkEl(cam, INK.ink), r: inkEl(cam, INK.ink), x: inkEl(cam, INK.paperLight) }));
      const castG = el(cam, 'g');
      const cast = D.cast(castG, P.cast, sd + 400, (x, y) => [x * W, (y ?? 0.88) * H]);
      const lab = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 900);
      const stamp = P.stamp ? MCB.labels(el(root, 'g'), [Object.assign({ stamp: true, x: 0.8, y: 0.18, color: 'red', size: 96 }, P.stamp)], W, H, sd + 950) : null;
      const r0 = rng(sd + 77);
      const CH = chunks.map(() => ({ dx: (r0() * 2 - 1) * 0.8, dy: (r0() * 2 - 1) * 0.8, vx: (r0() * 2 - 1) * 260, s: 26 + r0() * 34, rot: r0() * 6, vr: (r0() * 2 - 1) * 6, n: 5 + Math.floor(r0() * 3) }));
      const CR = Array.from({ length: 7 }, (_, i) => { const a = i / 7 * 6.283 + r0() * 0.5; return { a, len: 0.9 + r0() * 0.9 }; });
      const holeShape = (s) => inkEllipsePts(hx, hy, Hh.rx * s, Hh.ry * s, sd + 31, 14, 0, 0.12);

      return {
        update(lt, dur, cues) {
          const t = lt;
          const brk = cliff ? null : (P.open ? -5 : atOr(cues, P.break, null));
          const carve = cliff ? Object.assign({ at: 0.3, dur: 3 }, P.carve || {}) : null;
          const ca = carve ? atOr(cues, carve.at, 0.3) : 0;
          const shakeA = atOr(cues, P.shake, brk);
          const sh = shakeA != null && lt >= shakeA && lt < shakeA + 0.6 ? Math.exp(-(lt - shakeA) * 6) : 0;
          MCB.camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [Hh.x, Hh.y] }, punch(lt, cue(cues, 'hit', null)), sh);
          // background
          if (!cliff) {
            wallF.setAttribute('d', inkLoop([[-W, -60], [W + 60, -60], [W + 60, floorY], [-W, floorY]], { seed: sd + 2, t, amp: 0.5, smooth: false }));
            wallR.setAttribute('d', '');
            blocks.forEach((b, i) => b.e.setAttribute('d', b.y + b.h < floorY + 10 ? inkPath(D.rr(b.x, b.y, b.w, b.h, 18), { w: 3.5, seed: sd + 10 + i, t, closed: true, amp: 1 }) : ''));
            shelf.b.setAttribute('d', inkPath([[W * 0.06, H * 0.42], [W * 0.27, H * 0.42]], { w: 14, seed: sd + 60, t, taper: 0 }));
            const jars = [], jr = [];
            for (let j = 0; j < 3; j++) { const pts = inkEllipsePts(W * (0.1 + j * 0.065), H * 0.42 - 44, 26, 40, sd + 61 + j, 10); jars.push(inkLoop(pts, { seed: sd + 64 + j, t })); jr.push(inkPath(pts, { w: 4, seed: sd + 67 + j, t, closed: true })); }
            shelf.j.setAttribute('d', jars.join(' ')); shelf.jr.setAttribute('d', jr.join(' '));
            lamp.update(W * 0.36, H * 0.16, t, 1.3);
            floorF.setAttribute('d', inkLoop([[-W, floorY], [W + 60, floorY], [W + 60, H + 60], [-W, H + 60]], { seed: sd + 70, t, smooth: false }));
          } else {
            far.forEach((f, i) => {
              const x = f.x * W, s = f.s, by = floorY - 40;
              const pts = [[x - 70 * s, by], [x - 34 * s, by - 260 * s], [x, by - 330 * s], [x + 34 * s, by - 260 * s], [x + 70 * s, by]];
              f.f.setAttribute('d', inkLoop(pts, { seed: sd + 80 + i, t }));
              f.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 84 + i, t }) + ' ' + inkPath([[x - 40 * s, by - 335 * s], [x + 40 * s, by - 335 * s]], { w: 10, seed: sd + 88 + i, t }));
            });
            const cl = [[W * 0.46, floorY], [W * 0.44, H * 0.3], [W * 0.5, H * 0.12], [W * 0.66, H * 0.05], [W * 0.85, H * 0.08], [W * 1.05, H * 0.04], [W * 1.05, floorY]];
            wallF.setAttribute('d', inkLoop(cl, { seed: sd + 2, t }));
            wallR.setAttribute('d', inkPath(cl.slice(0, 6), { w: 6, seed: sd + 3, t }) + ' ' + [0, 1, 2, 3].map(i => inkPath([[W * (0.5 + i * 0.05), H * (0.25 + i * 0.12)], [W * (0.62 + i * 0.07), H * (0.27 + i * 0.12)]], { w: 3, seed: sd + 4 + i, t })).join(' '));
            floorF.setAttribute('d', inkLoop([[-60, floorY], [W + 60, floorY], [W + 60, H + 60], [-60, H + 60]], { seed: sd + 70, t, smooth: false }));
          }
          floor.setAttribute('d', inkPath([[-W, floorY], [W * 0.5, floorY + 4], [W + 60, floorY]], { w: 6, seed: sd + 71, t }));
          // cracks (basement, before the break)
          const crA = atOr(cues, P.cracks, 0.3);
          if (!cliff && brk != null && lt < brk + 0.05 && lt >= crA) {
            const cp = clamp01((lt - crA) / Math.max(0.3, brk - crA));
            cracks.setAttribute('d', CR.map((c, i) => {
              const L = Math.max(Hh.rx, Hh.ry) * c.len * cp, pts = [[hx, hy]];
              for (let j = 1; j <= 4; j++) pts.push([hx + Math.cos(c.a + Math.sin(j * 3 + i) * 0.25) * L * j / 4, hy + Math.sin(c.a + Math.sin(j * 3 + i) * 0.25) * L * j / 4]);
              return inkPath(pts, { w: 4, seed: sd + 100 + i, t, amp: 0.8, smooth: false });
            }).join(' '));
          } else cracks.setAttribute('d', '');
          // hole size
          let hs = 0;
          if (cliff) hs = Math.max(0.05, prog(lt, ca, carve.dur)) * (lt >= ca ? 1 : 0);
          else if (brk != null && lt >= brk) hs = spring(lt, brk, 0.5);
          if (hs > 0.02) {
            const pts = holeShape(Math.max(0.05, hs));
            hole.setAttribute('d', inkLoop(pts, { seed: sd + 32, t, amp: 1.5 }));
            holeRim.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 33, t, closed: true, amp: 1.5 }));
            // tunnel arches: shrinking towards a vanishing point below-right (the passage goes down)
            const vx = hx + Hh.rx * 0.25 * hs, vy = hy + Hh.ry * 0.35 * hs;
            rings.forEach((rg, i) => {
              const k = 0.82 - i * 0.16, cx = lerp(vx, hx, k), cy = lerp(vy, hy, k);
              const shift = Math.sin(lt * 0.8 + i) * 2;
              const ap = [[cx - Hh.rx * k * hs, cy + Hh.ry * k * hs * 0.9], [cx - Hh.rx * k * hs, cy - Hh.ry * k * hs * 0.2], [cx, cy - Hh.ry * k * hs * 0.85 + shift], [cx + Hh.rx * k * hs, cy - Hh.ry * k * hs * 0.2], [cx + Hh.rx * k * hs, cy + Hh.ry * k * hs * 0.9]];
              rg.setAttribute('d', inkPath(ap, { w: 9 * k + 2, seed: sd + 40 + i, t, amp: 1 }));
            });
            const st = [];
            for (let j = 0; j < 4; j++) { const k = 0.8 - j * 0.17, y = lerp(vy, hy + Hh.ry * 0.85 * hs, k), w = Hh.rx * k * hs * 0.8; st.push(inkPath([[lerp(vx, hx, k) - w, y], [lerp(vx, hx, k) + w, y]], { w: 6 * k + 2, seed: sd + 50 + j, t })); }
            steps.setAttribute('d', st.join(' '));
          } else { hole.setAttribute('d', ''); holeRim.setAttribute('d', ''); rings.forEach(r => r.setAttribute('d', '')); steps.setAttribute('d', ''); }
          // falling chunks + dust
          chunks.forEach((c, i) => {
            const C = CH[i];
            if (cliff || brk == null || lt < brk || brk < 0) { c.f.setAttribute('d', ''); c.r.setAttribute('d', ''); return; }
            const tt = lt - brk, x0 = hx + C.dx * Hh.rx, y0 = hy + C.dy * Hh.ry;
            const fall = Math.min(floorY - C.s * 0.6, y0 + 140 * tt + 0.5 * 2600 * tt * tt);
            const x = x0 + C.vx * Math.min(tt, 0.7), rot = C.rot + C.vr * Math.min(tt, 0.7);
            const pts = Array.from({ length: C.n }, (_, j) => { const a = j / C.n * 6.283 + rot; return [x + Math.cos(a) * C.s * (0.8 + 0.3 * Math.sin(j * 5)), fall + Math.sin(a) * C.s * 0.7]; });
            c.f.setAttribute('d', inkLoop(pts, { seed: sd + 120 + i, t, smooth: false }));
            c.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 130 + i, t, closed: true, smooth: false }));
          });
          dust.forEach((d, i) => {
            if (cliff || brk == null || lt < brk || brk < 0) { d.setAttribute('d', ''); return; }
            const tt = lt - brk, p = clamp01(tt / 2.2), a = i / dust.length * 3.14 + 3.3;
            const x = hx + Math.cos(a) * (Hh.rx * 0.6 + 260 * p), y = lerp(hy + Hh.ry * 0.6, floorY - 40, 0.5) + Math.sin(a) * 80 * p - 60 * p;
            d.setAttribute('fill-opacity', (0.55 * (1 - p)).toFixed(3));
            d.setAttribute('d', p < 1 ? inkDot(x, y, 50 + 90 * p, 40 + 60 * p, sd + 140 + i, t) : '');
          });
          // draft: motes drifting out of the hole
          motes.forEach((m, i) => {
            if (P.draft === false || hs < 0.6) { m.setAttribute('d', ''); return; }
            const ph = (lt * 0.25 + i / motes.length) % 1, a = i * 2.4;
            const x = hx + Math.cos(a) * Hh.rx * 0.3 * (1 - ph) - (cliff ? 0 : 1) * ph * 420 * Math.sign(Math.cos(a) || 1), y = hy + Math.sin(a) * Hh.ry * 0.3 + Math.sin(ph * 9 + i) * 30;
            m.setAttribute('d', inkDot(x, y, 5, 5, sd + 160 + i, t));
          });
          // chips (cliff carving)
          chips.forEach((c, i) => {
            if (!cliff || lt < ca || lt > ca + carve.dur + 0.4) { c.setAttribute('d', ''); return; }
            const ph = ((lt - ca) * 2.2 + i / chips.length) % 1, a = 3.4 + i * 0.35;
            const x = hx - Hh.rx * 0.6 + Math.cos(a) * 220 * ph, y = hy + Math.sin(a) * 160 * ph + 300 * ph * ph;
            c.setAttribute('d', inkDot(x, y, 12, 9, sd + 180 + i, t));
          });
          // carved openings (cliff): doors, windows, a church facade with a cross, popping in on cues
          (P.openings || []).forEach((o, i) => {
            const e = opens[i], a = atOr(cues, o.at, 0.2), p = spring(lt, a, 0.5);
            if (lt < a) { e.f.setAttribute('d', ''); e.r.setAttribute('d', ''); e.x.setAttribute('d', ''); return; }
            const cx = o.x * W, by = o.y * H, w = (o.w || 70) * p, h = (o.h || 110) * p;
            const arch = [[cx - w / 2, by], [cx - w / 2, by - h * 0.62], [cx - w * 0.3, by - h * 0.92], [cx, by - h], [cx + w * 0.3, by - h * 0.92], [cx + w / 2, by - h * 0.62], [cx + w / 2, by]];
            e.f.setAttribute('d', inkLoop(arch, { seed: sd + 300 + i, t }));
            if (o.kind === 'church') {
              const big = arch.map(q => [cx + (q[0] - cx) * 1.7, by + (q[1] - by) * 1.35]);
              e.r.setAttribute('d', inkPath(big, { w: 7, seed: sd + 320 + i, t }) + ' ' + inkPath([[cx - w * 1.1, by - h * 1.45], [cx + w * 1.1, by - h * 1.45]], { w: 7, seed: sd + 321 + i, t }));
              e.x.setAttribute('d', inkPath([[cx, by - h * 0.8], [cx, by - h * 0.25]], { w: 9, seed: sd + 330 + i, t }) + ' ' + inkPath([[cx - w * 0.2, by - h * 0.62], [cx + w * 0.2, by - h * 0.62]], { w: 9, seed: sd + 331 + i, t }));
            } else { e.r.setAttribute('d', inkPath(arch, { w: 5, seed: sd + 320 + i, t })); e.x.setAttribute('d', ''); }
          });
          cast.update(lt, t, cues);
          lab.update(lt, t, cues);
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
