// cay_glass: a Turkish tea glass on a table (Chernobyl tea, Rize 1986), parchment ink style (brand/kit/BRAND.md §3, §5;
// boils at 8 Hz, pure function of (seed, lt)). Two modes:
//   hook:  close-up: a slim-waisted tea glass on its saucer stands on a checked tablecloth; steam rises and, on `glow`,
//          gold rings pulse around it and a hand-drawn trefoil forms in the steam. Kaşif stands beside the table (right)
//          and reacts (P.kasif). Below the table edge: the cloth's front, the table legs and the floor boards.
//   press: a press conference: a man in a dark suit and red tie sits behind a long table with microphones; on `lift`
//          his hand takes the glass, on `drink` he drinks; behind him a window onto terraced tea slopes; in the
//          foreground journalists seen from behind raise film cameras whose flashes fire on the `flash*` cues.
// Leaves the sky / wall to the scene's "set" (interior); ground ≈ 0.6 H.
// P: {mode: "hook"|"press", x: 0.38 (glass, 0..1 W), s: 2.1 hook / 0.55 press (glass scale; the lifted glass keeps it),
//     steam_h, steam_w (hook steam height / thickness), table_end: 0.58 (hook), gy: 0.6 (table front top, 0..1 H),
//     glow: {at: "glow"} | false, tref: [dx, dy, scale], fill: 0.82, window: true (press), flashes: ["f1", ...] (cue
//     names or seconds), kasif: {x, y, scale, pose, face, dir, emotion, seq} | false, label: {text, x, y, at, size, color}}
// cues: glow (hook), lift + drink (press), the flash cue names, kasif seq names, label.at. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cay_glass = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 401, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, u = W / 1080;
      const Q = (g, fill, extra) => inkEl(g, fill, extra);

      // ---- back layer (press): window onto the tea slopes
      const backG = el(root, 'g');
      const win = mode === 'press' && P.window !== false ? {
        pane: Q(backG, INK.paperLight), hills: [0, 1, 2].map(i => Q(backG, C.LEAF(0.55 - i * 0.2))), scal: Q(backG), frame: Q(backG, INK.stain), frameR: Q(backG), bars: Q(backG),
      } : null;
      // ---- seated man (press)
      const manG = el(root, 'g');
      const man = mode === 'press' ? C.person(manG, sd + 20, { kind: 'suit' }) : null;
      // ---- table
      const tabG = el(root, 'g');
      const floor = Q(tabG, mix(INK.stain, INK.paperDark, 0.35)), floorL = Q(tabG, INK.inkSoft);
      const legs = Q(tabG, INK.stain), legsR = Q(tabG);
      const top = Q(tabG, INK.paperLight), checks = Q(tabG, INK.red, { 'fill-opacity': 0.42 }), topR = Q(tabG);
      const front = Q(tabG, INK.paperLight), checksF = Q(tabG, INK.red, { 'fill-opacity': 0.42 }), frontR = Q(tabG), shade = Q(tabG, INK.ink, { 'fill-opacity': 0.12 });
      const mics = mode === 'press' ? Q(tabG, INK.ink) : null, micHead = mode === 'press' ? Q(tabG, INK.inkSoft) : null;
      // ---- glass (+ a separate saucer when the glass is lifted)
      const sauc = C.glass(el(root, 'g'), sd + 30);
      const gls = C.glass(el(root, 'g'), sd + 31);
      // ---- arm in front of the glass when drinking (press: drawn by person; hook: none)
      const kas = P.kasif ? C.kasif(el(root, 'g'), Object.assign({ x: 0.82, y: 0.72, scale: 1.1, pose: 'idle', face: -1 }, P.kasif), W, H, seed) : null;
      const pressL = mode === 'press' && P.crowd !== false ? C.press(el(root, 'g'), sd + 60) : null;
      const lab = P.label ? C.label(root, P.label, W, H) : null;

      // tablecloth geometry
      const press = mode === 'press';
      const tx0 = -40, tx1 = press ? W + 40 : W * (P.table_end ?? 0.58);
      const ty0 = press ? gy - 0.1 * H : gy - 0.06 * H;           // top surface back edge
      const ty1 = gy;                                               // front edge
      const hem = press ? gy + 0.1 * H : gy + 0.19 * H;
      function checksIn(x0, x1, y0, y1, persp, t, k) {
        const L = [], n = 9;
        for (let i = 0; i <= n; i++) {
          const a = lerp(x0, x1, i / n), b = persp ? lerp(x0 - 40, x1 + 40, i / n) : a;
          if (i % 2 === 0) { const a2 = lerp(x0, x1, (i + 1) / n), b2 = persp ? lerp(x0 - 40, x1 + 40, (i + 1) / n) : a2; L.push(inkLoop([[a, y0], [a2, y0], [b2, y1], [b, y1]], { seed: k + i, t, amp: 0.8, smooth: false })); }
        }
        const m = persp ? 2 : 5;
        for (let j = 0; j < m; j++) { if (j % 2) continue; const ya = lerp(y0, y1, j / m), yb = lerp(y0, y1, (j + 1) / m); L.push(inkLoop([[x0 - 40, ya], [x1 + 40, ya], [x1 + 40, yb], [x0 - 40, yb]], { seed: k + 40 + j, t, amp: 0.8, smooth: false })); }
        return L.join(' ');
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // window (press)
          if (win) {
            const x0 = 0.56 * W, x1 = 0.94 * W, y0 = 0.2 * H, y1 = 0.42 * H, sway = Math.sin(t * 0.4) * 4;
            win.pane.setAttribute('d', inkLoop([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { seed: k + 1, t, smooth: false, amp: 0.8 }));
            const S = [];
            win.hills.forEach((h, i) => {
              const base = lerp(y0 + 60, y1 - 20, i / 2.4), pts = [[x0, y1]];
              for (let j = 0; j <= 12; j++) { const x = lerp(x0, x1, j / 12); pts.push([x, base - Math.sin(j * 0.7 + i * 2) * 30 - (j % 2) * 10 * (i + 1) + sway * (i + 1) * 0.3]); }
              pts.push([x1, y1]);
              h.setAttribute('d', inkLoop(pts, { seed: k + 2 + i, t, amp: 0.8 }));
              for (let r = 0; r < 3; r++) { const yy = base + 20 + r * 22; if (yy < y1 - 6) S.push(inkPath([[x0 + 10, yy + r * 3], [x1 - 10, yy - 14 + r * 3]], { w: 2.4, seed: k + 10 + i * 5 + r, t, amp: 0.8, dash: true })); }
            });
            win.scal.setAttribute('d', S.join(' '));
            const fo = [[x0 - 24, y0 - 24], [x1 + 24, y0 - 24], [x1 + 24, y1 + 24], [x0 - 24, y1 + 24]];
            win.frame.setAttribute('d', inkLoop(fo, { seed: k + 20, t, smooth: false }) + ' ' + inkLoop([[x0, y0], [x0, y1], [x1, y1], [x1, y0]], { seed: k + 21, t, smooth: false }));
            win.frame.setAttribute('fill-rule', 'evenodd');
            win.frameR.setAttribute('d', inkPath(fo, { w: 5, seed: k + 22, t, closed: true, smooth: false }) + ' ' + inkPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { w: 4, seed: k + 23, t, closed: true, smooth: false }));
            win.bars.setAttribute('d', inkPath([[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]], { w: 10, seed: k + 24, t }) + ' ' + inkPath([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]], { w: 8, seed: k + 25, t }));
          }
          // floor
          floor.setAttribute('d', `M-20 ${C.f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
          const FL = [];
          for (let i = -8; i <= 8; i++) FL.push(inkPath([[W / 2 + i * W * 0.08, gy], [W / 2 + i * W * 0.4, H + 20]], { w: 2.4, seed: k + 30 + i, t }));
          floorL.setAttribute('d', FL.join(' '));
          // legs
          const lg = press ? [] : [[tx0 + 120 * u, hem - 20], [tx1 - 70 * u, hem - 20]];
          legs.setAttribute('d', lg.map((p, i) => inkLoop([[p[0] - 22 * u, p[1]], [p[0] + 22 * u, p[1]], [p[0] + 18 * u, H + 30], [p[0] - 18 * u, H + 30]], { seed: k + 50 + i, t, smooth: false })).join(' '));
          legsR.setAttribute('d', lg.map((p, i) => inkPath([[p[0] - 22 * u, p[1]], [p[0] + 22 * u, p[1]], [p[0] + 18 * u, H + 30], [p[0] - 18 * u, H + 30]], { w: 4.5, seed: k + 55 + i, t, closed: true, smooth: false })).join(' '));
          // the man behind the table (press)
          const liftAt = C.atOr(cues, 'lift', dur * 0.35), drinkAt = C.atOr(cues, 'drink', dur * 0.62);
          const gx = (P.x ?? (press ? 0.6 : 0.38)) * W;
          const restY = press ? ty0 + (ty1 - ty0) * 0.55 : ty0 + (ty1 - ty0) * 0.62;
          const gs = press ? (P.s ?? 0.55) : (P.s ?? 2.1);
          let gPos = [gx, restY], tilt = 0, hand = null;
          if (man) {
            const mx = 0.42 * W, mgy = ty0 + 210 * 1.35;
            const pre = man.update(t, mx, mgy, 1.35, { face: 1, legs: false });
            const mouth = [pre.hc[0] + 56 * 1.35, pre.hc[1] + 24 * 1.35];
            const reach = progIO(lt, liftAt - 0.5, 0.5), up = progIO(lt, drinkAt - 0.7, 0.7);
            tilt = (-24 * up + Math.sin(t * 2) * 1.2 * up);
            const A = tilt * Math.PI / 180, L = 244 * gs, sA = Math.sin(A), cA = Math.cos(A);
            const raised = [mouth[0] + 6 - L * sA, mouth[1] + L * cA];
            gPos = [lerp(gx, raised[0], up), lerp(restY, raised[1], up)];
            const grip = [gPos[0] + 0.14 * L * sA + 46 * gs * cA, gPos[1] - 0.14 * L * cA + 46 * gs * sA];
            const idle = [mx + 120, mgy - 170];
            const hR2 = [lerp(idle[0], grip[0], reach), lerp(idle[1], grip[1], reach)];
            hand = man.update(t, mx, mgy, 1.35, { face: 1, legs: false, armR: hR2, armL: [mx - 40, ty0 + 30], lean: 3 * up, bendR: P.bend ?? 1 });
          }
          // tabletop (cloth) + front
          const topP = [[tx0 + (press ? 0 : 30), ty0], [tx1 - (press ? 0 : 40), ty0], [tx1, ty1], [tx0, ty1]];
          top.setAttribute('d', inkLoop(topP, { seed: k + 60, t, smooth: false, amp: 1 }));
          checks.setAttribute('d', press ? '' : checksIn(tx0 + 30, tx1 - 40, ty0, ty1, true, t, k + 100));
          topR.setAttribute('d', inkPath(topP, { w: 5, seed: k + 61, t, closed: true, smooth: false }));
          const fr = [[tx0, ty1]];
          const nS = press ? 1 : 8;
          fr.push([tx1, ty1]);
          for (let i = nS; i >= 0; i--) { const x = lerp(tx0, tx1, i / nS); fr.push([x, hem + (i % 2 ? 22 : 0) + Math.sin(t * 1.2 + i) * 3]); }
          front.setAttribute('d', inkLoop(fr, { seed: k + 62, t, amp: 1 }));
          front.setAttribute('fill', press ? mix(INK.green, INK.ink, 0.15) : INK.paperLight);
          checksF.setAttribute('d', press ? '' : checksIn(tx0, tx1, ty1, hem - 10, false, t, k + 150));
          frontR.setAttribute('d', inkPath(fr, { w: 5, seed: k + 63, t, closed: true }));
          shade.setAttribute('d', inkLoop([[tx0, ty1], [tx1, ty1], [tx1, ty1 + 26], [tx0, ty1 + 26]], { seed: k + 64, t, smooth: false }));
          // microphones (press)
          if (mics) {
            const M = [], MH = [];
            [[0.3, 0], [0.47, 1], [0.76, 2]].forEach(([mx, i]) => {
              const bx = mx * W, by = ty0 + (ty1 - ty0) * 0.7, tip = [bx - 30 + i * 30, ty0 - 120 + Math.sin(t * 0.7 + i) * 3];
              M.push(inkLoop([[bx - 40, by + 8], [bx + 40, by + 8], [bx + 30, by - 10], [bx - 30, by - 10]], { seed: k + 70 + i, t, smooth: false }));
              M.push(inkPath([[bx, by - 8], tip], { w: 8, seed: k + 74 + i, t }));
              MH.push(inkLoop(inkEllipsePts(tip[0], tip[1] - 26, 22, 36, k + 78 + i, 10, 0.15), { seed: k + 78 + i, t }));
              M.push(inkPath(inkEllipsePts(tip[0], tip[1] - 26, 22, 36, k + 78 + i, 10, 0.15), { w: 4, seed: k + 82 + i, t, closed: true }));
              M.push(inkPath([[tip[0] - 18, tip[1] - 34], [tip[0] + 18, tip[1] - 30]], { w: 2.5, seed: k + 86 + i, t }));
            });
            mics.setAttribute('d', M.join(' ')); micHead.setAttribute('d', MH.join(' '));
          }
          // glass
          const glowAt = P.glow === false ? null : C.atOr(cues, (P.glow && P.glow.at) || 'glow', press ? null : 0.2);
          const glow = glowAt == null ? 0 : prog(lt, glowAt, 0.6) * (0.85 + 0.15 * Math.sin(t * 6));
          if (press) {
            sauc.update(t, gx, restY, gs, { noGlass: true });
            gls.update(t, gPos[0], gPos[1], gs, { saucer: false, tilt, fill: P.fill ?? 0.82, steam: 1 - 0.5 * clamp01(tilt / -30), glow: 0 });
          } else {
            const bob = punch(lt, glowAt, 0.8) * 0.06;
            gls.update(t, gx, restY, gs * (1 + bob), { fill: P.fill ?? 0.82, steam: 1, glow, tref: P.tref, steamH: P.steam_h, steamW: P.steam_w });
            sauc.update(t, 0, 0, 0, { noGlass: true, saucer: false });
          }
          if (kas) kas.update(lt, t, cues);
          // journalists + flashes
          if (pressL) {
            const fl = (P.flashes || ['f1', 'f2', 'f3', 'f4']).map(n => C.atOr(cues, n, null)).filter(v => v != null);
            const auto = [0.25, 0.9, 1.6].filter(v => v < dur);
            pressL.update(t, lt, W, H, gy + 0.085 * H, fl.length ? fl : auto);
          }
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
