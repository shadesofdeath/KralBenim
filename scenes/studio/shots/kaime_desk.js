// kaime_desk: a close look at a desk where paper money is made by hand (the first Ottoman kaime, 1840), parchment
// ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). A wooden desk top in
// perspective, an inkwell, and a big banknote lying on it.
//   mode "write": a clerk's hand (sleeve from the lower right) writes the note line by line, right to left, with a
//     reed pen; on `seal` a wooden seal stamp comes down from above, presses, lifts, and leaves a red seal.
//   mode "forge": night; the desk stands under a window (the scene's "night" set shows through it), lit by a candle.
//     The finished original lies on the left; from `copy` a second hand copies it onto a blank sheet on the right;
//     on `hit` a magnifying glass slides from one note to the other (which one is the fake?).
// Leaves the room/sky to the scene's "set"; the desk's front edge is the ground line (gy).
// P: {mode: "write"|"forge", gy: 0.6, note: {x: 0.5, y (0..1 H), w: 600, h: 340, rot: -3, value: "100"},
//     write: [from, to] (s; default from 0.15 to just before `seal`), sleeve: "dark"|"blue"|"red",
//     label: {text, x, y, at, size, color}, kasif: K | false}
// P.seal: false (no stamp), P.write_from: 0..1 (the note is already partly written at the start).
// SHOTS.kaime_forge = kaime_desk with mode "forge".
// cues: seal (stamp), copy (forger starts), hit (punch / magnifier), label.at. Needs kaime__lib.js (KMA).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.kaime_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 917, M = window.KMA, forge = P.mode === 'forge';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, back = gy - 0.19 * H;
      // wall + window (forge): a solid wall with an opening, the night set shows through it
      const wallG = el(root, 'g');
      const wall = forge ? inkEl(wallG, INK.paperDark, { 'fill-rule': 'evenodd' }) : null, bricks = forge ? inkEl(wallG, INK.inkSoft) : null,
        win = forge ? inkEl(wallG) : null, mull = forge ? inkEl(wallG) : null, sill = forge ? inkEl(wallG, INK.paper) : null;
      const wx0 = W * 0.52, wx1 = W * 0.9, wy0 = H * 0.16, wy1 = back - 50;
      const glowG = el(root, 'g'), glows = forge ? [0, 1, 2].map(() => inkEl(glowG, INK.gold, { 'fill-opacity': 0.1 })) : [];
      // desk
      const top = inkEl(root, INK.stain), topR = inkEl(root), grain = inkEl(root, INK.hatBand ? INK.inkSoft : INK.inkSoft), front = inkEl(root, INK.inkSoft), frontR = inkEl(root);
      const deskFront = M.fore(root, 'panel', sd + 25);
      // inkwell / candle
      const potF = inkEl(root, INK.paperDark), potR = inkEl(root), potInk = inkEl(root, INK.ink);
      const candle = forge ? { body: inkEl(root, INK.paperLight), r: inkEl(root), wick: inkEl(root), drip: inkEl(root, INK.paperLight) } : null;
      const cfl = forge ? M.flame(root, sd + 60) : null;
      // notes
      const NP = Object.assign({ x: forge ? 0.31 : 0.5, y: null, w: forge ? 380 : 640, h: forge ? 240 : 360, rot: forge ? -4 : -3, value: '100' }, P.note || {});
      const nG = el(root, 'g'), note = M.note(nG, sd + 1);
      const cG = forge ? el(root, 'g') : null, copy = forge ? M.note(cG, sd + 2) : null;
      // seal stamp (write)
      const stampG = el(root, 'g'), st = { neck: inkEl(stampG, INK.stain), neckR: inkEl(stampG), knob: inkEl(stampG, INK.stain), knobR: inkEl(stampG), base: inkEl(stampG, INK.gold), baseR: inkEl(stampG), face: inkEl(stampG, INK.red) };
      const hand = M.hand(el(root, 'g'), sd + 3, { sleeve: P.sleeve || (forge ? 'dark' : 'blue'), from: [W * 1.18, gy + 0.2 * H] });
      // magnifier (forge)
      const lensG = el(root, 'g'), lens = forge ? { fill: inkEl(lensG, INK.paperLight, { 'fill-opacity': 0.25 }), ring: inkEl(lensG), handle: inkEl(lensG, INK.stain), handleR: inkEl(lensG), shine: inkEl(lensG, INK.paperLight) } : null;
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.15, y: P.gy ?? 0.6, scale: 0.7, pose: 'point', face: 1 }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      const toWorld = (c, rot, p) => { const q = M.R(p, rot * Math.PI / 180); return [c[0] + q[0], c[1] + q[1]]; };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, M.atOr(cues, 'hit', null), 0.6);
          if (forge) {
            const outer = `M-20 -20 H${W + 20} V${f1(back + 4)} H-20 Z`;
            const hole = inkLoop([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { seed: sd + 5, t, amp: 1, smooth: false });
            wall.setAttribute('d', outer + ' ' + hole);
            const bl = [];
            for (let y = back - 40, row = 0; y > -10; y -= 46, row++) {
              bl.push(`M-10 ${f1(y)} H${W + 10}`);
              for (let x = (row % 2) * 70 - 70; x < W; x += 140) if (!(x > wx0 - 10 && x < wx1 + 10 && y > wy0 && y < wy1 + 46)) bl.push(`M${f1(x)} ${f1(y)} V${f1(y + 46)}`);
            }
            bricks.setAttribute('d', ''); bricks.setAttribute('stroke', INK.inkSoft); bricks.setAttribute('stroke-width', 2); bricks.setAttribute('fill', 'none'); bricks.setAttribute('stroke-opacity', 0.45);
            bricks.setAttribute('d', bl.join(' '));
            win.setAttribute('d', inkPath([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { w: 12, seed: sd + 6, t, closed: true, smooth: false, amp: 1 }));
            mull.setAttribute('d', inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 9, seed: sd + 7, t }) + ' ' + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 9, seed: sd + 8, t }));
            sill.setAttribute('d', inkLoop([[wx0 - 30, wy1], [wx1 + 30, wy1], [wx1 + 40, wy1 + 26], [wx0 - 40, wy1 + 26]], { seed: sd + 9, t, smooth: false }));
          }
          // desk top (trapezoid) + grain + front face
          const tp = [[W * 0.04, back], [W * 0.96, back], [W + 30, gy], [-30, gy]];
          top.setAttribute('d', inkLoop(tp, { seed: sd + 10, t, amp: 1, smooth: false }));
          topR.setAttribute('d', inkPath(tp, { w: 5, seed: sd + 11, t, closed: true, smooth: false, amp: 1 }));
          const gl = [];
          for (let i = 1; i < 7; i++) { const u = i / 7, y = lerp(back, gy, u * u * 0.9 + u * 0.1); gl.push(inkPath([[lerp(W * 0.04, -30, (y - back) / (gy - back)) + 30, y], [W * 0.5 + Math.sin(i * 2.3) * 80, y + 3], [lerp(W * 0.96, W + 30, (y - back) / (gy - back)) - 30, y - 2]], { w: 2.2, seed: sd + 12 + i, t, amp: 1 })); }
          grain.setAttribute('d', gl.join(' '));
          front.setAttribute('d', ''); frontR.setAttribute('d', '');
          deskFront.update(t, W, H, gy);
          // inkwell (write: left back; forge: right back)
          const px = forge ? W * 0.86 : W * 0.13, py = back + 0.06 * H;
          const pot = [[px - 62, py - 46], [px + 62, py - 46], [px + 72, py + 30], [px - 72, py + 30]];
          potF.setAttribute('d', inkLoop(pot, { seed: sd + 22, t, amp: 1 }));
          potR.setAttribute('d', inkPath(pot, { w: 5, seed: sd + 23, t, closed: true, amp: 1 }));
          potInk.setAttribute('d', inkLoop(inkEllipsePts(px, py - 46, 46, 13, sd + 24, 10), { seed: sd + 24, t }));
          // candle (forge) + warm glow
          if (forge) {
            const cx = W * 0.1, cb = back + 0.09 * H, ch = 190;
            const body = [[cx - 30, cb], [cx - 28, cb - ch], [cx + 28, cb - ch], [cx + 30, cb]];
            candle.body.setAttribute('d', inkLoop(body, { seed: sd + 30, t, smooth: false }));
            candle.r.setAttribute('d', inkPath(body, { w: 5, seed: sd + 31, t, closed: true, smooth: false }));
            candle.drip.setAttribute('d', inkLoop([[cx - 28, cb - ch], [cx - 10, cb - ch], [cx - 16, cb - ch + 50], [cx - 26, cb - ch + 36]], { seed: sd + 32, t }));
            candle.wick.setAttribute('d', inkPath([[cx, cb - ch], [cx + 2, cb - ch - 16]], { w: 4, seed: sd + 33, t }));
            cfl.update(t, cx + 1, cb - ch - 10, 44, 110, 1);
            const fl = 1 + 0.06 * Math.sin(t * 9) + 0.04 * Math.sin(t * 13.7);
            glows.forEach((gx, i) => gx.setAttribute('d', inkCircle(cx, cb - ch - 50, (140 + i * 110) * fl, sd + 34 + i, t, { fill: true, n: 14 })));
          }
          // the note(s)
          const nc = [NP.x * W, NP.y != null ? NP.y * H : (forge ? back + 0.1 * H : back + 0.1 * H)];
          const sealAt = P.seal === false ? 1e9 : M.atOr(cues, 'seal', dur * 0.7);
          const wf = P.write_from ?? 0, wr = forge ? 1 : wf + (1 - wf) * clamp01((lt - (P.write ? P.write[0] : 0.1)) / (((P.write ? P.write[1] : sealAt - 0.35)) - (P.write ? P.write[0] : 0.1)));
          nG.setAttribute('transform', `translate(${f1(nc[0])} ${f1(nc[1])}) rotate(${NP.rot}) scale(${1 + 0.04 * hit})`);
          // stamp timeline (write)
          const pressAt = sealAt + 0.35, down = prog(lt, sealAt, 0.35), up = prog(lt, pressAt + 0.25, 0.45);
          const tipL = note.update(t, { w: NP.w, h: NP.h, write: forge ? 1 : wr, seal: forge ? 1 : clamp01((lt - pressAt) / 0.35), value: NP.value });
          let tipW = toWorld(nc, NP.rot, tipL);
          if (!forge) {
            const sealW = toWorld(nc, NP.rot, [0, 92 * NP.h / 270]);
            const sy = lerp(lerp(-0.1 * H, sealW[1], down), -0.15 * H, up), squash = lt > pressAt && lt < pressAt + 0.25 ? 0.92 : 1;
            const show = lt > sealAt - 0.05 && up < 1;
            stampG.setAttribute('transform', show ? `translate(${f1(sealW[0])} ${f1(sy)}) scale(1 ${squash})` : 'scale(0)');
            if (show) {
              st.base.setAttribute('d', inkLoop([[-62, -10], [62, -10], [58, -70], [-58, -70]], { seed: sd + 40, t, smooth: false }));
              st.baseR.setAttribute('d', inkPath([[-62, -10], [62, -10], [58, -70], [-58, -70]], { w: 5, seed: sd + 41, t, closed: true, smooth: false }));
              st.face.setAttribute('d', inkLoop([[-62, -12], [62, -12], [60, 2], [-60, 2]], { seed: sd + 42, t, smooth: false }));
              st.neck.setAttribute('d', inkLoop([[-24, -70], [24, -70], [18, -190], [-18, -190]], { seed: sd + 43, t, smooth: false }));
              st.neckR.setAttribute('d', inkPath([[-24, -70], [24, -70], [18, -190], [-18, -190]], { w: 5, seed: sd + 44, t, closed: true, smooth: false }));
              st.knob.setAttribute('d', inkCircle(0, -224, 46, sd + 45, t, { fill: true }));
              st.knobR.setAttribute('d', inkCircle(0, -224, 46, sd + 46, t, { w: 5 }));
            }
            // the writing hand: follows the pen tip while writing, then pulls back to the right
            const away = prog(lt, sealAt - 0.4, 0.5), wob = Math.sin(t * 23) * 3 * (wr > 0 && wr < 1 ? 1 : 0);
            const tip = [lerp(tipW[0], W * 1.05, away) + wob, lerp(tipW[1], gy + 0.02 * H, away) + Math.cos(t * 19) * 2];
            const s = 1.0, off = M.R([190 * s, -46 * s], 210 * Math.PI / 180);
            hand.update(t, [tip[0] - off[0], tip[1] - off[1]], 210, s, 'pen', { mirror: true });
          } else {
            stampG.setAttribute('transform', 'scale(0)');
            // the copy: blank -> copied line by line from `copy`
            const ca = M.atOr(cues, 'copy', 0.3), cw = clamp01((lt - ca) / Math.max(1, dur - ca - 0.4));
            const cc = [W * 0.72, nc[1] + 10];
            cG.setAttribute('transform', `translate(${f1(cc[0])} ${f1(cc[1])}) rotate(3) scale(${1 + 0.04 * hit})`);
            const ctip = copy.update(t, { w: NP.w, h: NP.h, write: cw, seal: cw > 0.92 ? (cw - 0.92) / 0.08 : 0, value: NP.value, ghost: 0.3 });
            const tw = toWorld(cc, 3, ctip), wob = Math.sin(t * 23) * 3;
            const s = 0.95, off = M.R([190 * s, -46 * s], 215 * Math.PI / 180);
            hand.update(t, [tw[0] + wob - off[0], tw[1] - off[1]], 215, s, 'pen', { mirror: true });
            // magnifier: on `hit` it glides over the original, then over the copy
            const ha = M.atOr(cues, 'hit', dur * 0.6), m1 = prog(lt, ha - 0.2, 0.6), m2 = prog(lt, ha + 0.8, 0.8);
            if (lt > ha - 0.2) {
              const lx = lerp(lerp(-0.1 * W, nc[0], m1), cc[0] - 40, m2), ly = nc[1] - 30 - Math.sin(m2 * Math.PI) * 60;
              lensG.setAttribute('transform', `translate(${f1(lx)} ${f1(ly)})`);
              lens.fill.setAttribute('d', inkCircle(0, 0, 110, sd + 50, t, { fill: true }));
              lens.ring.setAttribute('d', inkCircle(0, 0, 110, sd + 51, t, { w: 14 }));
              lens.handle.setAttribute('d', inkLoop([[70, 90], [96, 70], [210, 190], [186, 214]], { seed: sd + 52, t, smooth: false }));
              lens.handleR.setAttribute('d', inkPath([[70, 90], [96, 70], [210, 190], [186, 214]], { w: 5, seed: sd + 53, t, closed: true, smooth: false }));
              lens.shine.setAttribute('d', inkPath([[-70, -30], [-50, -66], [-14, -84]], { w: 10, seed: sd + 54, t }));
            } else lensG.setAttribute('transform', 'scale(0)');
          }
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
      function f1(v) { return Math.round(v * 10) / 10; }
    },
  };
  // kaime_forge: the same desk at night, the forger's version (mode "forge"; see above)
  SH.kaime_forge = { kind: '2d', build(ctx) { return SH.kaime_desk.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'forge' }) })); } };
})();
