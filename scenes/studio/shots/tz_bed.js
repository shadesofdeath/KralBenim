// tz_bed: an imperial bedchamber at night, told by shadow (no violence shown), parchment ink style (brand/kit/BRAND.md
// §3, §5; boils at 8 Hz, pure function of (seed, lt)). Back wall with an arched window (moon), a low bed with a
// sleeping figure under a red cover; a candle on a tall stand at the left throws a huge shadow of an intruder with a
// raised sword across the wall, growing as he comes closer; on `hit` the candle goes out, a curl of smoke rises and the
// shadow is gone. A patterned rug runs to the frame bottom. Use with "set": "interior". Needs tz__lib.js, mcB__lib.js.
// P: {gy: 0.6, hit: cue|s (candle out; default dur*0.7), labels: [MCB labels]}
// cues: hit. Close-up targets (portrait): candle ≈ [190, 640], the sleeper's head ≈ [560, 1000].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_bed = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, M = window.MCB, sd = seed * 1000 + 733;
      const root = el(svg, 'g');
      const sh = T.Shapes();
      const gy = (P.gy ?? 0.6) * H;
      const back = el(root, 'g');
      // own wall (use "set": false): plaster wall with panels, a gold frieze, an arched window with the moon
      sh.add(back, T.rect(-30, -30, W + 30, gy + 4), { fill: mix(INK.paperDark, INK.paper, 0.35) });
      for (let i = 0; i < 7; i++) sh.add(back, T.rect(W * (i / 6) - 70, 470, W * (i / 6) + 40, gy - 230), { stroke: INK.inkSoft, w: 3, seed: sd + 300 + i });
      sh.add(back, T.rect(-30, 380, W + 30, 420), { fill: INK.gold, fop: 0.7, stroke: INK.ink, w: 4 });
      const wx = W * 0.8, wb = 820, wt = 470, ww = 100;
      sh.add(back, [[wx - ww, wb], [wx - ww, wt + 80], [wx, wt], [wx + ww, wt + 80], [wx + ww, wb]], { fill: mix(INK.blue, INK.ink, 0.35), stroke: INK.ink, w: 7, smooth: true });
      sh.add(back, inkEllipsePts(wx + 30, wt + 110, 30, 30, sd + 1, 10), { fill: INK.paperLight });
      sh.add(back, [[wx, wt + 4], [wx, wb]], { stroke: INK.ink, w: 5, closed: false });
      sh.add(back, [[wx - ww, wt + 230], [wx + ww, wt + 230]], { stroke: INK.ink, w: 5, closed: false });
      sh.add(back, T.rect(wx - ww - 20, wb, wx + ww + 20, wb + 18), { fill: INK.stain, stroke: INK.ink, w: 4 });
      // the shadow on the wall (behind the bed): a man with a raised sword, grows as the candle-side intruder nears
      const shadowF = inkEl(root, INK.ink, { 'fill-opacity': 0.72 }), swordF = inkEl(root, INK.ink, { 'fill-opacity': 0.8 });
      // bed: frame, mattress, red cover over the sleeper, pillow + head
      const bx0 = W * 0.27, bx1 = W * 0.8, bt = gy - 190;
      sh.add(root, T.rect(bx0, bt + 60, bx1, gy - 30), { fill: INK.stain, stroke: INK.ink, w: 6 });
      sh.add(root, [[bx1 - 20, bt - 120], [bx1 - 20, gy - 30], [bx1 + 20, gy - 30], [bx1 + 20, bt - 140]], { fill: INK.stain, stroke: INK.ink, w: 5 });
      for (const x of [bx0 + 30, bx1 - 30]) sh.add(root, T.rect(x - 18, gy - 34, x + 18, gy), { fill: INK.stain, stroke: INK.ink, w: 4 });
      sh.add(root, T.rect(bx0 + 10, bt + 20, bx1 - 30, bt + 66), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      sh.add(root, inkEllipsePts(bx1 - 140, bt + 2, 80, 40, sd + 5, 12), { fill: INK.paperLight, stroke: INK.ink, w: 5, smooth: true });
      const head = { f: inkEl(root, INK.paperLight), r: inkEl(root), beard: inkEl(root, INK.inkSoft), eye: inkEl(root) };
      const cover = [[bx0 + 20, bt + 40], [bx0 + 80, bt - 30], [bx1 - 260, bt - 60], [bx1 - 190, bt - 30], [bx1 - 170, bt + 50], [bx1 - 190, bt + 110], [bx0 + 10, bt + 120]];
      const coverE = sh.add(root, lt => cover.map(([x, y], i) => [x, y - (i > 0 && i < 5 ? Math.sin(lt * 1.6) * 6 : 0)]), { fill: INK.red, fop: 0.85, stroke: INK.ink, w: 6, smooth: true });
      for (let k = 1; k < 5; k++) sh.add(root, lt => [[bx0 + k * 110, bt - 40 - Math.sin(lt * 1.6) * 5 + (k === 1 ? 20 : 0)], [bx0 + k * 110 + 20, bt + 110]], { stroke: INK.gold, w: 4, closed: false, smooth: true });
      // candle stand (left)
      const cx = W * 0.2, ctop = 720;
      sh.add(root, [[cx, ctop + 60], [cx, gy - 10]], { stroke: INK.ink, w: 12, closed: false });
      sh.add(root, [[cx - 80, gy], [cx, gy - 70], [cx + 80, gy]], { stroke: INK.ink, w: 9, closed: false, smooth: false });
      sh.add(root, [[cx - 50, ctop + 60], [cx + 50, ctop + 60], [cx + 30, ctop + 86], [cx - 30, ctop + 86]], { fill: INK.gold, stroke: INK.ink, w: 4 });
      sh.add(root, T.rect(cx - 18, ctop - 40, cx + 18, ctop + 60), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
      const flame = { f: inkEl(root, INK.gold), r: inkEl(root, INK.red), halo: inkEl(root, INK.gold, { 'fill-opacity': 0.22 }) };
      const smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.7 });
      // rug + floor to the frame bottom
      const fl = el(root, 'g');
      sh.add(fl, T.rect(-30, gy, W + 30, H + 30), { fill: mix(INK.stain, INK.paperDark, 0.5), stroke: INK.ink, w: 6 });
      const rug = [[W * 0.1, gy + 40], [W * 0.9, gy + 40], [W * 1.08, H * 0.95], [W * -0.08, H * 0.95]];
      sh.add(fl, rug, { fill: INK.red, fop: 0.55, stroke: INK.ink, w: 5 });
      sh.add(fl, [[W * 0.16, gy + 80], [W * 0.84, gy + 80], [W * 0.98, H * 0.9], [W * 0.02, H * 0.9]], { stroke: INK.gold, w: 7 });
      // foreground below the captions: a carved chest with gold bands, a low brass tray with a jug and cup
      const cy0 = gy + 160, cy1 = gy + 430, ch0 = W * 0.12, ch1 = W * 0.6;
      sh.add(fl, T.rect(ch0, cy0, ch1, cy1), { fill: INK.stain, stroke: INK.ink, w: 6 });
      sh.add(fl, [[ch0 - 14, cy0 + 10], [ch0 + 20, cy0 - 50], [ch1 - 20, cy0 - 50], [ch1 + 14, cy0 + 10]], { fill: mix(INK.stain, INK.ink, 0.25), stroke: INK.ink, w: 6 });
      for (const u of [0.18, 0.82]) sh.add(fl, T.rect(lerp(ch0, ch1, u) - 18, cy0 - 46, lerp(ch0, ch1, u) + 18, cy1), { fill: INK.gold, stroke: INK.ink, w: 4 });
      sh.add(fl, T.rect((ch0 + ch1) / 2 - 34, cy0 + 20, (ch0 + ch1) / 2 + 34, cy0 + 90), { fill: INK.gold, stroke: INK.ink, w: 4 });
      for (let k = 0; k < 3; k++) sh.add(fl, [[ch0 + 120, cy0 + 130 + k * 80], [ch1 - 120, cy0 + 136 + k * 80]], { stroke: INK.ink, w: 2.5, closed: false, smooth: true });
      const tx0 = W * 0.76, ty0 = gy + 250;
      sh.add(fl, inkEllipsePts(tx0, ty0, 170, 44, sd + 9, 16), { fill: INK.gold, stroke: INK.ink, w: 5, smooth: true });
      sh.add(fl, [[tx0 - 60, ty0], [tx0 - 80, ty0 - 90], [tx0 - 50, ty0 - 150], [tx0 - 40, ty0 - 190], [tx0 - 20, ty0 - 190], [tx0 - 30, ty0 - 150], [tx0 + 10, ty0 - 90], [tx0 - 10, ty0]], { fill: INK.gold, stroke: INK.ink, w: 5, smooth: true });
      sh.add(fl, [[tx0 + 40, ty0 - 10], [tx0 + 30, ty0 - 80], [tx0 + 100, ty0 - 80], [tx0 + 90, ty0 - 10]], { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      const labs = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = T.atOr(cues, P.hit ?? 'hit', dur * 0.7), pk = punch(lt, hit, 0.6);
          sh.update(t, lt);
          // sleeper's head on the pillow (breathing)
          const hx = bx1 - 150, hy = bt - 20 + Math.sin(t * 1.6) * 3;
          head.f.setAttribute('d', inkCircle(hx, hy, 56, sd + 20, t, { fill: true }));
          head.r.setAttribute('d', inkCircle(hx, hy, 56, sd + 21, t, { w: 5 }));
          head.beard.setAttribute('d', inkLoop([[hx - 40, hy + 6], [hx - 30, hy + 40], [hx - 6, hy + 52], [hx - 14, hy + 10]], { seed: sd + 22, t, amp: 0.8 }));
          head.eye.setAttribute('d', inkPath([[hx - 26, hy - 8], [hx - 12, hy - 4]], { w: 4, seed: sd + 23, t, amp: 0.5 }));
          // flame (out after hit)
          const on = lt < hit;
          if (on) {
            const f = Math.sin(t * 11) * 6, fh = 70 + Math.sin(t * 7) * 8;
            const fp = [[cx - 16, ctop - 40], [cx - 10, ctop - 40 - fh * 0.5], [cx + f, ctop - 40 - fh], [cx + 12, ctop - 40 - fh * 0.5], [cx + 16, ctop - 40]];
            flame.f.setAttribute('d', inkLoop(fp, { seed: sd + 30, t, amp: 1 }));
            flame.r.setAttribute('d', inkPath(fp, { w: 4, seed: sd + 31, t, closed: true, amp: 1 }));
            flame.halo.setAttribute('d', inkCircle(cx, ctop - 70, 110 + Math.sin(t * 9) * 8, sd + 32, t, { fill: true }));
            smoke.setAttribute('d', '');
          } else {
            flame.f.setAttribute('d', ''); flame.r.setAttribute('d', ''); flame.halo.setAttribute('d', '');
            const su = Math.min(1, (lt - hit) / 1.6), S = [];
            for (let i = 0; i < 10; i++) { const u = i / 9 * su; S.push([cx + Math.sin(u * 9 + t * 2) * 30 * u, ctop - 40 - u * 380]); }
            smoke.setAttribute('d', su > 0.02 ? inkPath(S, { w: 10 * (1 - su * 0.5), seed: sd + 33, t, amp: 1.5, taper: 0.8 }) : '');
          }
          // the shadow: grows and slides from the left across the wall while the candle burns
          if (on) {
            const u = progIO(lt, 0, Math.max(0.6, hit - 0.1)), s = lerp(0.46, 0.6, u) * (1 + 0.04 * pk), x = lerp(W * 0.3, W * 0.46, u), base = gy - 40;
            const sw = Math.sin(lt * 2) * 6 * s, hx = x + 120 * s, hy2 = base - 560 * s + sw;
            const sp = [[x - 90 * s, base], [x - 70 * s, base - 250 * s], [x - 80 * s, base - 430 * s], [x - 34 * s, base - 500 * s],
              [x - 46 * s, base - 560 * s], [x, base - 620 * s], [x + 46 * s, base - 570 * s], [x + 40 * s, base - 505 * s],
              [x + 70 * s, base - 490 * s], [hx - 22 * s, hy2 + 10 * s], [hx + 22 * s, hy2 - 6 * s], [x + 110 * s, base - 430 * s],
              [x + 70 * s, base - 260 * s], [x + 90 * s, base]];
            shadowF.setAttribute('d', inkLoop(sp, { seed: sd + 40, t, amp: 1.2, smooth: false }));
            // sword: crossguard at the fist, a long tapered blade raised up and back over the head
            const bx = hx - 170 * s, by = hy2 - 250 * s;
            const blade = [[hx - 24 * s, hy2 - 22 * s], [hx + 22 * s, hy2 + 14 * s], [bx + 14 * s, by + 10 * s], [bx - 12 * s, by - 14 * s]];
            const guard = [[hx - 52 * s, hy2 + 10 * s], [hx + 40 * s, hy2 - 52 * s], [hx + 50 * s, hy2 - 38 * s], [hx - 40 * s, hy2 + 26 * s]];
            const grip = [[hx, hy2], [hx + 22 * s, hy2 + 30 * s], [hx + 34 * s, hy2 + 24 * s], [hx + 12 * s, hy2 - 8 * s]];
            swordF.setAttribute('d', inkLoop(blade, { seed: sd + 41, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(guard, { seed: sd + 42, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(grip, { seed: sd + 43, t, amp: 0.6, smooth: false }));
          } else { shadowF.setAttribute('d', ''); swordF.setAttribute('d', ''); }
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
