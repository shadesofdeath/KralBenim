// mohac_crown: the Holy Crown of Hungary as one big object (14-mohac-1526): enamel band with gems, the crossing arches,
// the famously bent cross on top and swinging pendant chains, resting on a cushion on a table. Modes: "rest" (slow
// turn of light, gems glint on cue), "split" (a crack runs down the middle on cue and the halves drift apart: a
// divided kingdom), "tug" (two arms reach in from the sides and pull at it: two kings).
// The scene's "set" ("interior") gives the room; the table top is the ground line (y ≈ 860).
// P: {room: "hall" (MHC.room behind; use "set": false), mode: "rest"|"split"|"tug", x: 960, y: 560 (crown centre), r: 230, crack: cue, pull: cue, glint: cue,
//     left: {text, color}, right: {text, color} (hand-written names by the arms / halves, at the pull/crack cue),
//     empty: false (an open, empty money chest beside it), cast: [MCB cast]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_crown = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const CX = P.x ?? 960, CY = P.y ?? 560, R = P.r ?? 230, GY = P.ground ?? 860, mode = P.mode || 'rest';
      const root = el(svg, 'g');
      const roomG = el(root, 'g');
      const room = P.room ? M.room(roomG, P.room, W, H, seed * 5, { gy: GY }) : null;
      const tableG = el(root, 'g'), armsBack = el(root, 'g'), halves = [el(root, 'g'), el(root, 'g')], armsFront = el(root, 'g'), labG = el(root, 'g'), castG = el(root, 'g');
      const id = 'mhcrown' + seed;
      [0, 1].forEach(k => {
        const cp = el(defs, 'clipPath', { id: id + k });
        el(cp, 'rect', { x: k ? CX : -2000, y: -2000, width: 4000, height: 6000 });
        halves[k].setAttribute('clip-path', `url(#${id + k})`);
      });
      const tableF = inkEl(tableG, mix(INK.paperDark, INK.stain, 0.4)), tableL = inkEl(tableG, INK.ink), cushF = inkEl(tableG, INK.red), cushL = inkEl(tableG, INK.ink), tassel = inkEl(tableG, INK.gold);
      const chestF = inkEl(tableG, INK.stain), chestL = inkEl(tableG, INK.ink), chestD = inkEl(tableG, mix(INK.ink, INK.stain, 0.4));
      const parts = halves.map(g => ({ g, archF: inkEl(g, INK.gold), bandF: inkEl(g, INK.gold), plaque: inkEl(g, INK.paperLight), gemR: inkEl(g, INK.red), gemB: inkEl(g, INK.blue), gemG: inkEl(g, INK.green), ink: inkEl(g, INK.ink), cross: inkEl(g, INK.gold), chains: inkEl(g, INK.ink), shine: inkEl(g, INK.paperLight) }));
      const crack = inkEl(root, INK.ink);
      const arms = mode === 'tug' ? [0, 1].map(k => ({ sleeve: inkEl(armsFront, k ? INK.blue : INK.red), ink: inkEl(armsFront, INK.ink), hand: inkEl(armsFront, INK.paperLight) })) : [];
      const labs = ['left', 'right'].map((s, k) => {
        if (!P[s]) return null;
        const L = typeof P[s] === 'string' ? { text: P[s] } : P[s];
        const g = el(labG, 'g'), t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 64, 'text-anchor': 'middle', fill: L.color === 'blue' ? INK.blue : L.color === 'ink' ? INK.ink : INK.red, stroke: INK.paperLight, 'stroke-width': 12, 'paint-order': 'stroke' });
        t.textContent = L.text;
        return { g, t, k };
      });
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;

      function crownInto(pt, t, dx, rot, glint) {
        const cx = CX + dx, cy = CY, r = R;
        pt.g.setAttribute('transform', `rotate(${f1(rot)} ${f1(CX + (dx < 0 ? -r : dx > 0 ? r : 0))} ${f1(GY - 120)})`);
        // arches: two crossing bands forming the dome
        const dome = [[cx - r * 0.82, cy - r * 0.05], [cx - r * 0.78, cy - r * 0.6], [cx - r * 0.4, cy - r * 0.98], [cx, cy - r * 1.08], [cx + r * 0.4, cy - r * 0.98], [cx + r * 0.78, cy - r * 0.6], [cx + r * 0.82, cy - r * 0.05]];
        const archV = [[cx - r * 0.14, cy - r * 0.05], [cx - r * 0.13, cy - r * 1.06], [cx + r * 0.13, cy - r * 1.06], [cx + r * 0.14, cy - r * 0.05]];
        const archH = dome.map(p => [p[0], p[1] + r * 0.02]).concat(dome.slice().reverse().map(p => [cx + (p[0] - cx) * 0.86, p[1] + r * 0.2]));
        pt.archF.setAttribute('d', inkLoop(archH, { seed: seed + 1, t, amp: 1 }) + inkLoop(archV, { seed: seed + 2, t, amp: 1, smooth: false }));
        let d = inkPath(dome, { w: 7, seed: seed + 3, t }) + inkPath(dome.map(p => [cx + (p[0] - cx) * 0.86, p[1] + r * 0.2]), { w: 5, seed: seed + 4, t })
          + inkPath(archV.concat([archV[0]]), { w: 6, seed: seed + 5, t, smooth: false });
        // band (front of the crown), slightly curved
        const band = [[cx - r, cy - r * 0.04], [cx, cy + r * 0.06], [cx + r, cy - r * 0.04], [cx + r * 0.98, cy + r * 0.42], [cx, cy + r * 0.52], [cx - r * 0.98, cy + r * 0.42]];
        pt.bandF.setAttribute('d', inkLoop(band, { seed: seed + 6, t, amp: 1 }));
        d += inkPath(band, { w: 8, seed: seed + 7, t, closed: true });
        // enamel plaques + gems along the band; a taller front plaque
        let pl = '', gr = '', gb = '', gg = '', sh = '';
        for (let k = -2; k <= 2; k++) {
          const px = cx + k * r * 0.38, py = cy + r * 0.22 + Math.abs(k) * -r * 0.02, pw = r * 0.13, ph = k === 0 ? r * 0.3 : r * 0.2;
          const box = [[px - pw, py - ph], [px + pw, py - ph], [px + pw, py + ph * 0.7], [px - pw, py + ph * 0.7]];
          pl += inkLoop(box, { seed: seed + 10 + k, t, amp: 0.6, smooth: false }); d += inkPath(box.concat([box[0]]), { w: 4, seed: seed + 20 + k, t, smooth: false });
          const cg = inkEllipsePts(px, py - ph * 0.1, pw * 0.55, ph * 0.42, seed + 25 + k, 8);   // a cabochon in every plaque
          const gem = inkLoop(cg, { seed: seed + 25 + k, t, amp: 0.5 }); if ((k + 5) % 3 === 0) gb += gem; else if ((k + 5) % 3 === 1) gr += gem; else gg += gem;
          d += inkPath(cg, { w: 3, seed: seed + 30 + k, t, closed: true });
          const gx = px + r * 0.19, gy = py;
          if (k < 2) { const gem = inkLoop(inkEllipsePts(gx, gy, r * 0.05, r * 0.07, seed + 40 + k, 8), { seed: seed + 40 + k, t, amp: 0.6 }); if ((k + 3) % 3 === 0) gr += gem; else if ((k + 3) % 3 === 1) gb += gem; else gg += gem; d += inkPath(inkEllipsePts(gx, gy, r * 0.05, r * 0.07, seed + 40 + k, 8), { w: 3.5, seed: seed + 45 + k, t, closed: true }); }
        }
        for (let k = 0; k < 9; k++) { const px = cx - r * 0.86 + k * r * 0.215; d += inkDot(px, cy + r * 0.47 - Math.abs(k - 4) * r * 0.012, r * 0.022, r * 0.022, seed + 60 + k, t); }
        // top: the bent cross on a little orb
        const ox = cx, oy = cy - r * 1.12, tilt = -0.28;
        const C = (x, y) => [ox + x * Math.cos(tilt) - y * Math.sin(tilt), oy + x * Math.sin(tilt) + y * Math.cos(tilt)];
        const crossPts = [C(-r * 0.04, 0), C(-r * 0.04, -r * 0.22), C(-r * 0.14, -r * 0.22), C(-r * 0.14, -r * 0.3), C(-r * 0.04, -r * 0.3), C(-r * 0.04, -r * 0.42), C(r * 0.04, -r * 0.42), C(r * 0.04, -r * 0.3), C(r * 0.14, -r * 0.3), C(r * 0.14, -r * 0.22), C(r * 0.04, -r * 0.22), C(r * 0.04, 0)];
        pt.cross.setAttribute('d', inkLoop(crossPts, { seed: seed + 70, t, amp: 0.6, smooth: false }) + inkLoop(inkEllipsePts(ox, oy + r * 0.02, r * 0.07, r * 0.06, seed + 71, 10), { seed: seed + 71, t, amp: 0.6 }));
        d += inkPath(crossPts, { w: 5, seed: seed + 72, t, closed: true, smooth: false }) + inkPath(inkEllipsePts(ox, oy + r * 0.02, r * 0.07, r * 0.06, seed + 71, 10), { w: 4, seed: seed + 73, t, closed: true });
        pt.ink.setAttribute('d', d);
        pt.plaque.setAttribute('d', pl); pt.gemR.setAttribute('d', gr); pt.gemB.setAttribute('d', gb); pt.gemG.setAttribute('d', gg);
        // pendant chains on both sides, swinging
        let ch = '';
        for (const s of [-1, 1]) for (let j = 0; j < 2; j++) {
          const ax = cx + s * r * (0.82 + j * 0.13), ay = cy + r * 0.3, sw = Math.sin(t * 2.4 + j + s) * 0.18, L = r * (0.55 + j * 0.12);
          const tip = [ax + Math.sin(sw) * L, ay + Math.cos(sw) * L];
          for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6; ch += inkPath(inkEllipsePts(lerp(ax, tip[0], u), lerp(ay, tip[1], u), r * 0.022, r * 0.04, seed + 80 + k + j * 7, 6), { w: 3, seed: seed + 90 + k + j * 7, t, closed: true }); }
          ch += inkLoop([[tip[0] - r * 0.05, tip[1]], [tip[0], tip[1] + r * 0.1], [tip[0] + r * 0.05, tip[1]], [tip[0], tip[1] - r * 0.03]], { seed: seed + 100 + j, t, amp: 0.5 });
        }
        pt.chains.setAttribute('d', ch);
        // glint
        if (glint > 0) { const gx = cx - r * 0.5 + glint * r, gy = cy - r * 0.55; sh = inkLoop([[gx, gy - 30], [gx + 8, gy - 8], [gx + 30, gy], [gx + 8, gy + 8], [gx, gy + 30], [gx - 8, gy + 8], [gx - 30, gy], [gx - 8, gy - 8]], { seed: seed + 110, t, amp: 0.4, smooth: false }); }
        pt.shine.setAttribute('d', sh);
      }

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          if (room) room.update(t);
          // table + cushion
          const tb = [[CX - 900, GY], [CX + 900, GY], [CX + 960, GY + 300], [CX - 960, GY + 300]];
          tableF.setAttribute('d', inkLoop(tb, { seed: seed + 200, t, amp: 0.8, smooth: false }));
          let tl = inkPath([[CX - 960, GY], [CX + 960, GY]], { w: 6, seed: seed + 201, t });
          for (let k = 0; k < 8; k++) tl += inkPath([[CX - 900 + k * 260, GY + 40 + (k % 3) * 60], [CX - 760 + k * 260, GY + 46 + (k % 3) * 60]], { w: 3, seed: seed + 202 + k, t });
          tableL.setAttribute('d', tl);
          const cu = [[CX - R * 1.25, GY], [CX - R * 1.3, GY - R * 0.36], [CX - R * 0.4, GY - R * 0.5], [CX + R * 0.4, GY - R * 0.5], [CX + R * 1.3, GY - R * 0.36], [CX + R * 1.25, GY]];
          cushF.setAttribute('d', inkLoop(cu, { seed: seed + 210, t, amp: 0.8 }));
          cushL.setAttribute('d', inkPath(cu, { w: 6, seed: seed + 211, t, closed: true }));
          tassel.setAttribute('d', [-1, 1].map(s => inkLoop([[CX + s * R * 1.3, GY - R * 0.36], [CX + s * R * 1.42, GY - R * 0.1], [CX + s * R * 1.34, GY - R * 0.06]], { seed: seed + 212 + s, t, amp: 0.6 })).join(''));
          if (P.empty) {
            const bx = CX + R * 2.1, bw = R * 0.8, bh = R * 0.6, open = prog(lt, 0.2, 0.8);
            const box = [[bx - bw, GY], [bx - bw, GY - bh], [bx + bw, GY - bh], [bx + bw, GY]];
            chestF.setAttribute('d', inkLoop(box, { seed: seed + 220, t, amp: 0.6, smooth: false }));
            const lid = [[bx - bw, GY - bh], [bx - bw - 20, GY - bh - bh * 0.9 * open], [bx + bw - 20, GY - bh - bh * 0.9 * open], [bx + bw, GY - bh]];
            chestD.setAttribute('d', inkLoop([[bx - bw + 16, GY - bh + 4], [bx + bw - 16, GY - bh + 4], [bx + bw - 30, GY - bh + 40], [bx - bw + 30, GY - bh + 40]], { seed: seed + 221, t, amp: 0.5, smooth: false }));
            chestL.setAttribute('d', inkPath(box.concat([box[0]]), { w: 6, seed: seed + 222, t, smooth: false }) + inkPath(lid, { w: 6, seed: seed + 223, t, smooth: false }) + inkPath([[bx - bw, GY - bh * 0.5], [bx + bw, GY - bh * 0.5]], { w: 4, seed: seed + 224, t }));
          }
          const gl = atOr(cues, P.glint, null), glint = gl != null && lt >= gl && lt < gl + 0.9 ? (lt - gl) / 0.9 : 0;
          let dx0 = 0, dx1 = 0, r0 = 0, r1 = 0;
          if (mode === 'split') {
            const c = atOr(cues, P.crack, dur * 0.45), p = progIO(lt, c + 0.5, 1.2);
            dx0 = -130 * p; dx1 = 130 * p; r0 = -7 * p; r1 = 7 * p;
            const cp = prog(lt, c, 0.5);
            if (cp > 0) {
              const zz = []; for (let k = 0; k <= 12; k++) { const u = k / 12; zz.push([CX + (k % 2 ? 14 : -14) * (1 - p), lerp(CY - R * 1.6, GY - R * 0.4, u)]); }
              crack.setAttribute('d', p < 0.5 ? inkPath(zz.slice(0, Math.max(2, Math.round(13 * cp))), { w: 7, seed: seed + 230, t, smooth: false }) : '');
            } else crack.setAttribute('d', '');
          } else if (mode === 'tug') {
            const pa = atOr(cues, P.pull, dur * 0.35), p = progIO(lt, pa, 0.9), jerk = p * (0.5 + 0.5 * Math.sin(t * 9)) * 10;
            dx0 = -(p * 34 + jerk); dx1 = p * 34 + jerk; r0 = -3 * p; r1 = 3 * p;
            arms.forEach((A, k) => {
              const s = k ? 1 : -1, reach = spring(lt, Math.max(0, pa - 0.9), 0.9), hx = CX + s * (R * 1.05 + (1 - reach) * 700) + (k ? dx1 : dx0), hy = CY + R * 0.15;
              const sh = [CX + s * 1100, CY + R * 0.9], el1 = [lerp(sh[0], hx, 0.55), CY + R * 0.55 + Math.sin(t * 3 + k) * 6];
              const sl = [[sh[0], sh[1] - 70], [el1[0], el1[1] - 50], [hx + s * 70, hy - 34], [hx + s * 70, hy + 34], [el1[0], el1[1] + 50], [sh[0], sh[1] + 70]];
              A.sleeve.setAttribute('d', inkLoop(sl, { seed: seed + 240 + k, t, amp: 1 }));
              A.hand.setAttribute('d', inkLoop(inkEllipsePts(hx, hy, 46, 40, seed + 250 + k, 10), { seed: seed + 250 + k, t, amp: 0.8 }));
              A.ink.setAttribute('d', inkPath(sl, { w: 6, seed: seed + 260 + k, t, closed: true }) + inkPath(inkEllipsePts(hx, hy, 46, 40, seed + 250 + k, 10), { w: 6, seed: seed + 270 + k, t, closed: true })
                + inkPath([[hx - s * 30, hy - 26], [hx - s * 44, hy - 4]], { w: 5, seed: seed + 280 + k, t }) + inkPath([[hx - s * 26, hy + 10], [hx - s * 40, hy + 26]], { w: 5, seed: seed + 290 + k, t }));
            });
          }
          crownInto(parts[0], t, dx0, r0, glint); crownInto(parts[1], t, dx1, r1, glint);
          labs.forEach(L => {
            if (!L) return;
            const a = mode === 'tug' ? atOr(cues, P.pull, dur * 0.35) + 0.2 : atOr(cues, P.crack, dur * 0.45) + 0.8;
            if (lt < a) { L.g.style.display = 'none'; return; }
            L.g.style.display = '';
            const x = L.k ? CX + R * 1.55 : CX - R * 1.55, y = mode === 'tug' ? CY - R * 0.55 : CY - R * 1.1, sp = spring(lt, a, 0.5);
            L.t.setAttribute('x', f1(x)); L.t.setAttribute('y', f1(y));
            L.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${L.k ? 4 : -4}) scale(${f1(Math.max(0.01, sp) * 1000) / 1000}) translate(${f1(-x)} ${f1(-y)})`);
          });
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
