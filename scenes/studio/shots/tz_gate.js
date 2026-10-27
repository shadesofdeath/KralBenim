// tz_gate: the doors of a great domed church (Hagia Sophia, 969), parchment ink style (brand/kit/BRAND.md §3, §5; boils
// at 8 Hz, pure function of (seed, lt)). Behind: a huge dome with buttresses and half-domes; in front: closed bronze
// doors under an arch, steps down to a paved court that runs to the frame bottom. The bearded patriarch (white stole
// with crosses, cross-staff) stands on the top step barring the way; a crown rests on a cushion on a stand beside him;
// the would-be emperor (blue robe, no crown) stands below. On `deny` the patriarch raises his hand; on `stamp` the
// label (a red stamp) slams in. Use with "set": "city". Needs tz__lib.js and mcB__lib.js.
// P: {gy: 0.55 (top step), deny: cue|s (default 0.4), labels: [MCB labels], suitor: {x: 0.2, scale: 0.85}}
// cues: deny, hit (punch), label cues. Close-up targets (portrait): crown ≈ [900, 700], patriarch's face ≈ [610, 620].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_gate = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, M = window.MCB, sd = seed * 1000 + 857;
      const root = el(svg, 'g');
      const sh = T.Shapes();
      const gy = (P.gy ?? 0.55) * H;
      const STONE = mix(INK.paperDark, INK.paper, 0.3), STONE2 = mix(INK.paperDark, INK.inkSoft, 0.25);
      // dome + half domes + buttresses (behind the facade)
      const dc = W * 0.55, dbase = gy - 400;
      sh.add(root, T.arc(dc, dbase, 330, 230, Math.PI, Math.PI * 2, 18).concat([[dc + 330, dbase + 10], [dc - 330, dbase + 10]]), { fill: STONE2, stroke: INK.ink, w: 6, smooth: true });
      for (let i = 0; i < 12; i++) { const a = Math.PI + (i + 0.5) / 12 * Math.PI; sh.add(root, [[dc + Math.cos(a) * 320, dbase + Math.sin(a) * 222 + 30], [dc + Math.cos(a) * 320, dbase + Math.sin(a) * 222 + 52]], { stroke: INK.ink, w: 5, closed: false }); }
      for (let i = 0; i < 9; i++) { const wx2 = dc - 240 + i * 60; sh.add(root, [[wx2 - 14, dbase + 2], [wx2 - 14, dbase - 34], [wx2, dbase - 48], [wx2 + 14, dbase - 34], [wx2 + 14, dbase + 2]], { fill: INK.ink, fop: 0.75, smooth: true, seed: sd + 500 + i }); }
      for (const s2 of [-1, 1]) sh.add(root, [[dc + s2 * 300, dbase + 12], [dc + s2 * 300, dbase - 110], [dc + s2 * 350, dbase - 90], [dc + s2 * 370, dbase + 12]], { fill: STONE2, stroke: INK.ink, w: 5, seed: sd + 520 + s2 });
      sh.add(root, [[dc, dbase - 230], [dc, dbase - 300]], { stroke: INK.ink, w: 6, closed: false });
      sh.add(root, [[dc - 26, dbase - 274], [dc + 26, dbase - 274]], { stroke: INK.ink, w: 6, closed: false });
      for (const s of [-1, 1]) sh.add(root, T.arc(dc + s * 400, dbase + 120, 170, 120, Math.PI, Math.PI * 2, 12).concat([[dc + s * 400 + 170, dbase + 130], [dc + s * 400 - 170, dbase + 130]]), { fill: STONE2, stroke: INK.ink, w: 5, smooth: true });
      // facade + great arch + doors
      sh.add(root, T.rect(-30, dbase + 10, W + 30, gy), { fill: STONE, stroke: INK.ink, w: 6 });
      for (let y = dbase + 70; y < gy; y += 70) sh.add(root, [[-20, y], [W + 20, y]], { stroke: INK.red, w: 2.5, closed: false, sop: 0.5 });
      const ax0 = W * 0.18, ax1 = W * 0.7, am = (ax0 + ax1) / 2, at = dbase + 70;
      sh.add(root, [[ax0 - 30, gy], [ax0 - 30, at + 160], [am, at - 30], [ax1 + 30, at + 160], [ax1 + 30, gy]], { fill: STONE2, stroke: INK.ink, w: 7, smooth: true });
      sh.add(root, [[ax0, gy], [ax0, at + 180], [am, at + 10], [ax1, at + 180], [ax1, gy]], { fill: mix(INK.gold, INK.ink, 0.4), stroke: INK.ink, w: 6, smooth: true });
      sh.add(root, [[am, at + 20], [am, gy]], { stroke: INK.ink, w: 7, closed: false });
      for (let j = 0; j < 3; j++) for (const s of [-1, 1]) { const y0 = at + 210 + j * 120; sh.add(root, T.rect(am + s * 30, y0, am + s * (am - ax0 - 30), y0 + 90), { stroke: INK.ink, w: 4 }); }
      for (const s of [-1, 1]) sh.add(root, inkEllipsePts(am + s * 40, gy - 220, 14, 14, sd + 3 + s, 8), { fill: INK.gold, stroke: INK.ink, w: 3 });
      // steps + paved court to the bottom
      for (let k = 0; k < 4; k++) { const y0 = gy + k * 60; sh.add(root, T.rect(-30 - k * 30, y0, W + 30 + k * 30, y0 + 60), { fill: k % 2 ? STONE : mix(INK.paper, INK.paperDark, 0.5), stroke: INK.ink, w: 5 }); }
      const court = gy + 240;
      sh.add(root, T.rect(-30, court, W + 30, H + 30), { fill: mix(INK.paperDark, INK.stain, 0.3), stroke: INK.ink, w: 5 });
      for (let i = -9; i <= 9; i++) sh.add(root, [[W / 2 + i * 80, court], [W / 2 + i * 260, H + 30]], { stroke: INK.inkSoft, w: 2.5, closed: false });
      for (let y = court + 60, j = 0; y < H; j++, y += 60 + j * 26) sh.add(root, [[-20, y], [W + 20, y]], { stroke: INK.inkSoft, w: 2.5, closed: false });
      // crown on a cushion on a stand (right)
      const kx = W * 0.83, ky = gy - 300;
      sh.add(root, [[kx, ky + 60], [kx, gy]], { stroke: INK.ink, w: 12, closed: false });
      sh.add(root, [[kx - 70, gy], [kx, gy - 50], [kx + 70, gy]], { stroke: INK.ink, w: 8, closed: false });
      sh.add(root, inkEllipsePts(kx, ky + 50, 110, 34, sd + 10, 12), { fill: INK.red, fop: 0.85, stroke: INK.ink, w: 5, smooth: true });
      const crownE = sh.add(root, lt => { const b = Math.sin(lt * 2) * 3; return [[kx - 70, ky + 30 + b], [kx - 76, ky - 40 + b], [kx - 36, ky - 6 + b], [kx, ky - 64 + b], [kx + 36, ky - 6 + b], [kx + 76, ky - 40 + b], [kx + 70, ky + 30 + b]]; }, { fill: INK.gold, stroke: INK.ink, w: 5 });
      const jewels = inkEl(root, INK.red), glint = inkEl(root, INK.paperLight), glintR = inkEl(root, INK.gold);
      // patriarch: robe light + stole, grey beard, cross-staff in his left side
      const px = W * 0.58;
      const pat = T.person(el(root, 'g'), sd + 20, { scale: 1.0, beard: 'grey', robe: 'light', stole: true });
      const staff = inkEl(root), staffC = inkEl(root);
      const S2 = Object.assign({ x: 0.2, scale: 0.85 }, P.suitor || {});
      const suitor = T.person(el(root, 'g'), sd + 30, { scale: S2.scale, robe: 'blue' });
      // foreground: a low stone balustrade across the court and the backs of the waiting crowd (below the captions)
      const fg = el(root, 'g'), fsh = T.Shapes();
      const by0 = court + 230;
      fsh.add(fg, T.rect(-30, by0, W + 30, by0 + 34), { fill: STONE, stroke: INK.ink, w: 5 });
      for (let x = 20; x < W; x += 70) fsh.add(fg, [[x, by0 + 34], [x - 8, by0 + 70], [x + 4, by0 + 110], [x - 8, by0 + 150], [x + 30, by0 + 150], [x + 18, by0 + 110], [x + 30, by0 + 70], [x + 22, by0 + 34]], { fill: mix(INK.paper, INK.paperDark, 0.5), stroke: INK.ink, w: 3, smooth: true, seed: sd + 600 + x });
      fsh.add(fg, T.rect(-30, by0 + 150, W + 30, by0 + 180), { fill: STONE, stroke: INK.ink, w: 5 });
      const heads = [[0.08, 0.89], [0.27, 0.9], [0.47, 0.88], [0.66, 0.91], [0.86, 0.885]];
      heads.forEach(([u, v], i) => {
        const x = u * W, y = v * H, r = 74 + (i % 2) * 8;
        fsh.add(fg, lt => [[x - r * 2.1, H + 40], [x - r * 1.8, y + r * 1.4 + Math.sin(lt + i) * 3], [x - r * 0.8, y + r * 1.0], [x + r * 0.8, y + r * 1.0], [x + r * 1.8, y + r * 1.4 + Math.sin(lt + i) * 3], [x + r * 2.1, H + 40]], { fill: i % 2 ? INK.inkSoft : mix(INK.blue, INK.ink, 0.3), stroke: INK.ink, w: 5, smooth: true, seed: sd + 700 + i * 3 });
        fsh.add(fg, lt => inkEllipsePts(x, y + Math.sin(lt * 1.3 + i) * 4, r, r, sd + 710 + i, 12), { fill: INK.paperDark, stroke: INK.ink, w: 5, smooth: true, seed: sd + 720 + i * 3 });
        if (i % 2 === 0) fsh.add(fg, lt => [[x - r * 1.05, y - r * 0.1], [x - r * 0.6, y - r * 1.15], [x + r * 0.6, y - r * 1.15], [x + r * 1.05, y - r * 0.1], [x + r * 1.1, y + r * 0.6], [x - r * 1.1, y + r * 0.6]].map(([a, b]) => [a, b + Math.sin(lt * 1.3 + i) * 4]), { fill: i === 2 ? INK.red : INK.paperLight, stroke: INK.ink, w: 4, smooth: true, seed: sd + 730 + i * 3 });
      });
      const labs = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const deny = T.atOr(cues, P.deny ?? 'deny', 0.4), pk = punch(lt, T.atOr(cues, 'hit', deny), 0.6);
          sh.update(t, lt); fsh.update(t, lt);
          const b = Math.sin(lt * 2) * 3;
          jewels.setAttribute('d', [-40, 0, 40].map((dx, i) => inkDot(kx + dx, ky + 10 + b, 10, 10, sd + 40 + i, t)).join(' '));
          const gl = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.4)), gx = kx + 60, gyy = ky - 70, a = 50 * gl, c = 8 * gl;
          const st = [[gx, gyy - a], [gx + c, gyy - c], [gx + a, gyy], [gx + c, gyy + c], [gx, gyy + a], [gx - c, gyy + c], [gx - a, gyy], [gx - c, gyy - c]];
          glint.setAttribute('d', inkLoop(st, { seed: sd + 45, t, amp: 0.5, smooth: false })); glintR.setAttribute('d', inkPath(st, { w: 3, seed: sd + 46, t, closed: true, smooth: false, amp: 0.5 }));
          // patriarch raises the hand on deny (point up-left = "stop"), stays facing the suitor
          const raised = lt >= deny;
          pat.update(t, raised ? 'point' : 'idle', { x: px, y: gy, face: -1, since: raised ? lt - deny : lt, dir: 35, emotion: raised ? 'angry' : null });
          const sx = px + 70, s = 1.0 * (1 + 0.03 * pk);
          staff.setAttribute('d', inkPath([[sx, gy - 10], [sx, gy - 620 * s]], { w: 9, seed: sd + 50, t, amp: 0.8 }));
          staffC.setAttribute('d', inkPath([[sx - 40, gy - 560 * s], [sx + 40, gy - 560 * s]], { w: 9, seed: sd + 51, t, amp: 0.8 }) + ' ' + inkPath([[sx - 26, gy - 500 * s], [sx + 26, gy - 500 * s]], { w: 7, seed: sd + 52, t, amp: 0.8 }));
          staffC.setAttribute('fill', INK.gold);
          // suitor below the steps: walks up a little, stops when denied, bows his head
          const walkU = progIO(lt, 0, Math.max(0.3, deny));
          const sxx = lerp(S2.x - 0.06, S2.x, walkU) * W;
          suitor.update(t, lt < deny ? 'walk' : 'idle', { x: sxx, y: gy, face: 1, ph: lt * 0.8, since: lt - deny, emotion: lt >= deny ? 'worried' : null });
          suitor.g.setAttribute('transform', `rotate(${(9 * progIO(lt, deny + 0.1, 0.6)).toFixed(2)} ${T.f1(sxx)} ${T.f1(gy)})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
