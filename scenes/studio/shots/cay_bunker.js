// cay_bunker: contaminated tea buried in concrete (Chernobyl tea story, 1986), parchment ink style (brand/kit/BRAND.md
// §3, §5; boils at 8 Hz, pure function of (seed, lt)). A cut-away view: above the ground line the surface, below it
// the earth in section down to the frame bottom (strata, stones) with a concrete pit in it. Modes:
//   pour:    a dump truck (left) tips a load of tea leaves into the pit (leaves stream, the heap rises); on `pour` a
//            concrete mixer (right) swings its chute over and grey concrete flows in, covering the tea; on `seal` the
//            pit is full and a slab closes it.
//   section: years later: the sealed concrete block lies under a deep layer of earth; inside it the tea is still there
//            (dark leaves in section); on the surface the tea bushes grow again and their roots reach down; a slow
//            camera push; an optional hand-written label with an arrow points at the block.
// Leaves the sky to the scene's "set" (field / hills); ground ≈ P.gy.
// P: {mode: "pour"|"section", gy: 0.42 (0..1 H), label: {text, x, y, at, size, color, arrow: [x, y]}}
// cues: pour, seal (pour mode), label.at. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cay_bunker = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 913, mode = P.mode || 'pour', u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? (mode === 'section' ? 0.4 : 0.42)) * H;
      const Q = (g, fill, extra) => inkEl(g, fill, extra);
      const earthG = el(root, 'g');
      const earth = Q(earthG, mix(INK.stain, INK.paperDark, 0.35)), strata = Q(earthG, INK.inkSoft, { 'fill-opacity': 0.7 }), stones = Q(earthG, INK.paperDark), stonesR = Q(earthG);
      const roots = Q(earthG, INK.inkSoft);
      const pitG = el(root, 'g');
      const hollow = Q(pitG, mix(INK.inkSoft, INK.paperDark, 0.45));
      const wall = Q(pitG, mix(INK.paperDark, INK.inkSoft, 0.3)), wallR = Q(pitG), teaF = Q(pitG, mix(INK.green, INK.ink, 0.45)), teaM = Q(pitG, mix(INK.green, INK.paper, 0.2)), concF = Q(pitG, mix(INK.inkSoft, INK.paperLight, 0.3)), concL = Q(pitG, INK.inkSoft), slab = Q(pitG, mix(INK.inkSoft, INK.paperDark, 0.25)), slabR = Q(pitG);
      const glowE = Q(pitG, INK.gold, { 'fill-opacity': 0.35 });
      const surfG = el(root, 'g');
      const grass = Q(surfG, INK.green), grassR = Q(surfG);
      const bushes = mode === 'section' ? C.terraces(el(root, 'g'), sd + 5) : null;
      const truckG = el(root, 'g');
      const truck = mode === 'pour' ? { body: Q(truckG, INK.blue), bed: Q(truckG, INK.red), win: Q(truckG, INK.paperLight), lines: Q(truckG), wheels: Q(truckG, INK.ink), hubs: Q(truckG, INK.paperDark), load: Q(truckG, mix(INK.green, INK.ink, 0.3)) } : null;
      const leaves = mode === 'pour' ? Q(root, mix(INK.green, INK.ink, 0.25)) : null;
      const mixer = mode === 'pour' ? { body: Q(root, INK.paperDark), drum: Q(root, INK.paperLight), stripes: Q(root, INK.red), lines: Q(root), wheels: Q(root, INK.ink), chute: Q(root, INK.inkSoft), flow: Q(root, mix(INK.paperDark, INK.inkSoft, 0.2)) } : null;
      const sec0 = mode === 'section';
      const lab = P.label ? C.label(root, P.label, W, H) : null;
      const r0 = rng(sd + 1), ST = Array.from({ length: 26 }, () => [r0(), r0(), r0()]), LV = Array.from({ length: 60 }, () => [r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // pit geometry
          const px0 = (sec0 ? 0.2 : 0.34) * W, px1 = (sec0 ? 0.8 : 0.76) * W, sec = sec0;
          const ptop = sec ? gy + 0.13 * H : gy, pbot = sec ? 0.7 * H : 0.7 * H, wt = 34 * u;
          // earth + strata + stones
          earth.setAttribute('d', `M-20 ${C.f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
          const SL = [];
          for (let i = 1; i < 9; i++) { const y = gy + i * (H - gy) / 9; const pts = []; for (let j = 0; j <= 10; j++) pts.push([j / 10 * (W + 40) - 20, y + Math.sin(j * 1.3 + i) * 12]); SL.push(inkPath(pts, { w: 2.2, seed: k + 10 + i, t, amp: 1 })); }
          strata.setAttribute('d', SL.join(' '));
          const SF = [], SR = [];
          ST.forEach((q, i) => {
            const x = q[0] * W, y = gy + 40 + q[1] * (H - gy - 40), r = (10 + q[2] * 22) * u;
            if (x > px0 - 30 && x < px1 + 30 && y > ptop - 30 && y < pbot + 30) return;
            SF.push(inkDot(x, y, r, r * 0.7, k + 30 + i, t)); SR.push(inkCircle(x, y, r, k + 60 + i, t, { ry: r * 0.7, w: 3 }));
          });
          stones.setAttribute('d', SF.join(' ')); stonesR.setAttribute('d', SR.join(' '));
          // the pit walls (U shape in section)
          const wp = [[px0 - wt, ptop], [px0, ptop], [px0, pbot], [px1, pbot], [px1, ptop], [px1 + wt, ptop], [px1 + wt, pbot + wt], [px0 - wt, pbot + wt]];
          hollow.setAttribute('d', sec ? '' : inkLoop([[px0, ptop], [px1, ptop], [px1, pbot], [px0, pbot]], { seed: k + 89, t, smooth: false, amp: 0.6 }));
          wall.setAttribute('d', inkLoop(wp, { seed: k + 90, t, smooth: false, amp: 0.8 }));
          wallR.setAttribute('d', inkPath(wp, { w: 5, seed: k + 91, t, closed: true, smooth: false }));
          // tea heap + concrete levels
          const pourAt = C.atOr(cues, 'pour', dur * 0.45), sealAt = C.atOr(cues, 'seal', dur * 0.75);
          const teaLv = sec ? 0.62 : lerp(0.35, 0.6, prog(lt, 0, Math.max(0.5, pourAt)));
          const concLv = sec ? 1 : lerp(teaLv, 1, progIO(lt, pourAt - 0.15, Math.max(0.4, sealAt - pourAt + 0.3)));
          const yAt = f => lerp(pbot, ptop, f);
          const heap = [[px0, pbot], [px1, pbot]];
          for (let j = 10; j >= 0; j--) { const x = lerp(px0, px1, j / 10); heap.push([x, yAt(teaLv) - Math.sin(j / 10 * Math.PI) * 50 * u * (sec ? 0.4 : 1) + Math.sin(j * 2.3) * 8]); }
          teaF.setAttribute('d', inkLoop(heap, { seed: k + 100, t, amp: 1.5 }));
          const LM = [];
          LV.forEach((q, i) => {
            const x = lerp(px0 + 20, px1 - 20, q[0]), y = lerp(pbot - 14, yAt(teaLv) + 10, q[1]), a = q[2] * 6, L = 18 * u;
            LM.push(inkLoop([[x - Math.cos(a) * L, y - Math.sin(a) * L], [x - Math.sin(a) * L * 0.4, y + Math.cos(a) * L * 0.4], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.sin(a) * L * 0.4, y - Math.cos(a) * L * 0.4]], { seed: k + 120 + i, t, amp: 0.5 }));
          });
          teaM.setAttribute('d', LM.join(' '));
          if (concLv > teaLv + 0.01) {
            const cp = [[px0, yAt(concLv)], [px1, yAt(concLv)]];
            for (let j = 10; j >= 0; j--) { const x = lerp(px0, px1, j / 10); cp.push([x, Math.min(yAt(concLv), yAt(teaLv) - Math.sin(j / 10 * Math.PI) * 50 * u * (sec ? 0.4 : 1) + Math.sin(j * 2.3) * 8)]); }
            concF.setAttribute('d', inkLoop(cp.slice(0, 2).concat(cp.slice(2)), { seed: k + 130, t, amp: 1, smooth: false }));
            const CL = [];
            for (let i = 0; i < 14; i++) { const x = lerp(px0 + 24, px1 - 24, i / 13), y = yAt(concLv) + 16 + (i % 4) * 22; if (y < yAt(teaLv) - 60 * u) CL.push(inkPath([[x - 14, y + 6], [x + 14, y - 6]], { w: 3, seed: k + 140 + i, t })); }
            CL.push(inkPath([[px0, yAt(concLv)], [px1, yAt(concLv)]], { w: 3, seed: k + 150, t }));
            concL.setAttribute('d', CL.join(' '));
          } else { concF.setAttribute('d', ''); concL.setAttribute('d', ''); }
          // slab
          const sl = sec ? 1 : spring(lt, sealAt, 0.5);
          if (sl > 0.01 && (sec || lt >= sealAt)) {
            const sy = ptop - lerp(80 * u, 0, Math.min(1, sl));
            const sp = [[px0 - wt - 10, sy - 48 * u], [px1 + wt + 10, sy - 48 * u], [px1 + wt + 10, sy], [px0 - wt - 10, sy]];
            slab.setAttribute('d', inkLoop(sp, { seed: k + 160, t, smooth: false }));
            slabR.setAttribute('d', inkPath(sp, { w: 5, seed: k + 161, t, closed: true, smooth: false }));
          } else { slab.setAttribute('d', ''); slabR.setAttribute('d', ''); }
          // a faint gold shimmer over the buried tea (section)
          const pulse = 1 + 0.07 * Math.sin(t * 2.2);
          glowE.setAttribute('d', sec ? inkLoop(inkEllipsePts((px0 + px1) / 2, yAt(teaLv * 0.5), (px1 - px0) * 0.45 * pulse, (yAt(0) - yAt(teaLv)) * 0.45 * pulse, k + 170, 14), { seed: k + 170, t, amp: 2 }) : '');
          glowE.setAttribute('fill-opacity', (0.24 + 0.12 * Math.sin(t * 2.2)).toFixed(3));
          // surface
          const GP = [[-20, gy + 16]]; for (let j = 0; j <= 24; j++) GP.push([j / 24 * (W + 40) - 20, gy - (j % 2 ? 10 : 2) + Math.sin(t * 1.4 + j) * 1.5]); GP.push([W + 20, gy + 16]);
          grass.setAttribute('d', inkLoop(GP, { seed: k + 180, t, smooth: false, amp: 1 }));
          grassR.setAttribute('d', inkPath(GP.slice(1, -1), { w: 4.5, seed: k + 181, t, smooth: false }));
          if (bushes) {
            bushes.update(t, W, gy + 14, { top: (gy - 180 * u) / (gy + 14), rows: 3, tilt: 0.02, near0: 0.35, near1: 0.75, wet: 0 });
            const RT = [];
            for (let i = 0; i < 7; i++) { const x = lerp(0.12, 0.88, i / 6) * W; const pts = [[x, gy + 10]]; for (let j = 1; j <= 5; j++) pts.push([x + Math.sin(j * 1.7 + i) * 26, gy + 10 + j * (ptop - gy - 40) / 5]); RT.push(inkPath(pts, { w: 4, seed: k + 190 + i, t, taper: 0.9 })); }
            roots.setAttribute('d', RT.join(' '));
          }
          // truck tipping tea (pour)
          if (truck) {
            const u = W / 1080 * 0.85, cx0 = 60 * W / 1080, rear = cx0 + 420 * u, wy = gy;
            const cab = [[cx0, wy - 70 * u], [cx0, wy - 300 * u], [cx0 + 150 * u, wy - 300 * u], [cx0 + 190 * u, wy - 190 * u], [cx0 + 190 * u, wy - 70 * u]];
            truck.body.setAttribute('d', inkLoop(cab, { seed: k + 200, t, smooth: false }));
            truck.win.setAttribute('d', inkLoop([[cx0 + 40 * u, wy - 270 * u], [cx0 + 140 * u, wy - 270 * u], [cx0 + 170 * u, wy - 200 * u], [cx0 + 40 * u, wy - 200 * u]], { seed: k + 201, t, smooth: false }));
            const tilt = -(lerp(26, 38, prog(lt, 0, dur * 0.6)) * Math.PI / 180 + Math.sin(t * 3) * 0.006);
            const hinge = [rear, wy - 90 * u];
            const B = p => { const dx = p[0] - hinge[0], dy = p[1] - hinge[1]; return [hinge[0] + dx * Math.cos(tilt) + dy * Math.sin(tilt), hinge[1] - dx * Math.sin(tilt) + dy * Math.cos(tilt)]; };
            const bed = [[cx0 + 205 * u, wy - 90 * u], [rear, wy - 90 * u], [rear + 10, wy - 190 * u], [cx0 + 205 * u, wy - 190 * u]].map(B);
            truck.bed.setAttribute('d', inkLoop(bed, { seed: k + 202, t, smooth: false }));
            const ld = [[cx0 + 210 * u, wy - 186 * u], [cx0 + 215 * u, wy - 250 * u], [lerp(cx0 + 215 * u, rear, 0.35), wy - 300 * u], [lerp(cx0 + 215 * u, rear, 0.75), wy - 280 * u], [rear + 30 * u, wy - 210 * u], [rear + 8, wy - 186 * u]].map(B);
            truck.load.setAttribute('d', inkLoop(ld, { seed: k + 203, t }));
            const wh = [[cx0 + 110 * u, wy - 30 * u], [rear - 70 * u, wy - 30 * u]];
            truck.wheels.setAttribute('d', wh.map((w, i) => inkCircle(w[0], w[1], 52 * u, k + 204 + i, t, { fill: true })).join(' '));
            truck.hubs.setAttribute('d', wh.map((w, i) => inkCircle(w[0], w[1], 20 * u, k + 206 + i, t, { fill: true })).join(' '));
            truck.lines.setAttribute('d', [inkPath(cab, { w: 5, seed: k + 208, t, closed: true, smooth: false }), inkPath(bed, { w: 5, seed: k + 209, t, closed: true, smooth: false }), inkPath([[cx0, wy - 70 * u], [rear + 10, wy - 70 * u]], { w: 8, seed: k + 210, t })].join(' '));
            // leaves streaming from the bed's rear lip into the pit
            const lip = B([rear + 10, wy - 190 * u]), Lf = [];
            const on = 1 - prog(lt, sealAt - 0.2, 0.3);
            const bot = yAt(teaLv) - 20 * u;
            if (on > 0.05) Lf.push(inkPath([[lip[0] + 20 * u, lip[1] + 10], [lip[0] + 90 * u, lerp(lip[1], bot, 0.4)], [lip[0] + 120 * u, bot]], { w: 46 * u, seed: k + 219, t, amp: 3, taper: 0.5 }));
            for (let i = 0; i < 60; i++) {
              const q = ((t * 1.2 + i / 60) % 1), sp = Math.sin(i * 3.1) * (20 + 40 * q) * u;
              const x = lip[0] + 30 * u + q * 100 * u + sp, y = lerp(lip[1], bot, q * q * 0.6 + q * 0.4);
              if (on > 0.05) Lf.push(inkDot(x, y, 12 * u, 6 * u, k + 220 + i, t));
            }
            leaves.setAttribute('d', Lf.join(' '));
          }
          // concrete mixer (right) + chute + flow
          if (mixer) {
            const u = W / 1080 * 0.72, mx = W - 60 * W / 1080 - 270 * u, my = gy;
            const cab = [[mx + 60 * u, my - 60 * u], [mx + 60 * u, my - 260 * u], [mx + 270 * u, my - 260 * u], [mx + 270 * u, my - 60 * u]];
            mixer.body.setAttribute('d', inkLoop(cab, { seed: k + 250, t, smooth: false }));
            const dc = [mx - 40 * u, my - 230 * u], drum = inkEllipsePts(dc[0], dc[1], 150 * u, 100 * u, k + 251, 16, -0.25);
            mixer.drum.setAttribute('d', inkLoop(drum, { seed: k + 251, t }));
            const STp = [];
            for (let i = 0; i < 4; i++) { const ph = ((t * 0.7 + i / 4) % 1) * 300 - 150; STp.push(inkPath([[dc[0] + ph * u * 0.9, dc[1] - 90 * u + ph * 0.2], [dc[0] + (ph + 60) * u * 0.9, dc[1] + 90 * u + ph * 0.2]], { w: 14 * u, seed: k + 252 + i, t })); }
            mixer.stripes.setAttribute('d', STp.join(' '));
            const swing = progIO(lt, pourAt - 0.6, 0.5);
            const c0 = [dc[0] - 140 * u, dc[1] + 40 * u], c1 = [lerp(c0[0] - 40 * u, 0.6 * W, swing), lerp(c0[1] + 100 * u, my - 70 * u, swing)];
            mixer.chute.setAttribute('d', inkPath([c0, c1], { w: 26 * u, seed: k + 256, t }));
            mixer.lines.setAttribute('d', [inkPath(drum, { w: 5, seed: k + 257, t, closed: true }), inkPath(cab, { w: 5, seed: k + 258, t, closed: true, smooth: false }), inkPath([c0, c1], { w: 4, seed: k + 259, t })].join(' '));
            mixer.wheels.setAttribute('d', [[mx - 60 * u, my - 30 * u], [mx + 140 * u, my - 30 * u]].map((w, i) => inkCircle(w[0], w[1], 50 * u, k + 260 + i, t, { fill: true })).join(' '));
            const flowOn = lt > pourAt - 0.15 && lt < sealAt + 0.1 ? 1 : 0;
            mixer.flow.setAttribute('d', flowOn ? inkPath([c1, [c1[0] - 20 * u, (c1[1] + yAt(concLv)) / 2], [c1[0] - 30 * u, yAt(concLv) + 10]], { w: 34 * u, seed: k + 262, t, amp: 3, taper: 0.2 }) : '');
          }
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
