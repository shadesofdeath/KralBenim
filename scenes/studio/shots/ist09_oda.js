// ist09_oda: an Ottoman palace bedchamber at night, in parchment ink (brand/kit/BRAND.md §3, §5): heavy ceiling beams,
// a band of İznik tiles (blue tulip-and-rosette squares), a pointed-arch lattice window, a swinging oil lamp on a chain,
// a low carved bed under a draped canopy with a red quilt and round cushions, an arched doorway. The ground shakes, the
// main beam snaps and crashes onto the bed with the ceiling; or the aftermath (rubble heaped on the empty bed) with
// footprints leading to the door. Built for 11-istanbul-depremi-1509 (Bayezid II's room), parametric for any palace room.
// Needs ist09__lib.js (IST9) and mcB__lib.js (MCB). Every line boils at 8 Hz; pure function of (seed, lt).
//
// SHOTS.ist09_oda P: {
//   floor: 0.6 (0..1 H: floor line), bed: {x: 0.52, w: 0.62} (centre, width as share of W),
//   shake: cue|s, shake_dur: 3 (lamp swings hard, sand trickles, everything jitters),
//   hit: cue|s (the beam snaps in two and both halves swing down onto the bed, stones rain, dust),
//   ruin: false (start in the aftermath: broken beam ends on the bed, rubble heap, dust haze),
//   steps: {at: cue|s, dur: 1.4} (ink footprints walk from the bed to the door one by one),
//   empty: cue|s (aftermath: a red ring + "empty" marker appears round the bed's pillow — the bed was empty),
//   debris: true (after the collapse: stones, the fallen lamp, a toppled table on the rug), door: true, lamp: true, window: true, canopy: true (posts + drape over the bed), rug: true (patterned rug in front),
//   cast: [...MCB cast], labels: [...MCB labels]
// }
// Close-up targets (portrait 1080×1920, defaults): bed ≈ [560, 1020], lamp ≈ [780, 520], door ≈ [970, 900].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_oda = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, arc, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 11 + 4401, r = rng(sd);
      const FY = H * (P.floor ?? 0.6), CY = H * 0.17;         // floor line, ceiling beam line
      const root = el(svg, 'g'), shakeG = el(root, 'g');
      const sh = L.Shapes();
      const back = el(shakeG, 'g');

      // ---------------------------------------------------------- wall: tile band, window, door
      const tileTop = FY - 330 * S, tileBot = FY - 150 * S, ts = 90 * S;
      sh.add(back, rect(-20, tileTop, W + 20, tileBot), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      for (let x = -20 + ts * 0.1, k = 0; x < W; x += ts, k++) {
        sh.add(back, [[x, tileTop], [x, tileBot]], { stroke: INK.inkSoft, w: 2.5, closed: false });
        for (let row = 0; row < 2; row++) {
          const cx = x + ts / 2, cy = tileTop + (row + 0.5) * (tileBot - tileTop) / 2;
          sh.add(back, inkEllipsePts(cx, cy, 15 * S, 15 * S, sd + k * 9 + row, 10), { fill: INK.blue, fop: 0.85, stroke: INK.ink, w: 2.5 });
          for (let q = 0; q < 4; q++) {
            const a = q * Math.PI / 2 + Math.PI / 4, px = cx + Math.cos(a) * 28 * S, py = cy + Math.sin(a) * 28 * S;
            sh.add(back, inkEllipsePts(px, py, 11 * S, 6 * S, sd + k * 9 + row * 4 + q + 300, 8, a), { fill: INK.blue, fop: 0.55 });
          }
          sh.add(back, [[cx - 40 * S, cy], [cx - 26 * S, cy]], { stroke: INK.red, w: 3, closed: false, sop: 0.8 });
        }
      }
      sh.add(back, [[-20, (tileTop + tileBot) / 2], [W + 20, (tileTop + tileBot) / 2]], { stroke: INK.inkSoft, w: 2.5, closed: false });
      sh.add(back, rect(-20, tileTop - 22 * S, W + 20, tileTop), { fill: INK.red, fop: 0.55, stroke: INK.ink, w: 4 });
      if (P.window !== false) {   // pointed-arch lattice window with moonlight
        const wx = W * 0.2, ww = 150 * S, wb = tileTop - 40 * S, wt = wb - 260 * S;
        const archPts = [[wx - ww / 2, wb], [wx - ww / 2, wt + 70 * S], [wx - ww * 0.3, wt + 18 * S], [wx, wt], [wx + ww * 0.3, wt + 18 * S], [wx + ww / 2, wt + 70 * S], [wx + ww / 2, wb]];
        sh.add(back, archPts, { fill: INK.blue, fop: 0.45, stroke: INK.ink, w: 6, smooth: false });
        for (let k = 1; k < 4; k++) sh.add(back, [[wx - ww / 2 + k * ww / 4, wb], [wx - ww / 2 + k * ww / 4, wt + (k === 2 ? 4 : 30) * S]], { stroke: INK.ink, w: 3, closed: false });
        for (let y = wb - 50 * S; y > wt + 50 * S; y -= 50 * S) sh.add(back, [[wx - ww / 2, y], [wx + ww / 2, y]], { stroke: INK.ink, w: 3, closed: false });
        sh.add(back, inkEllipsePts(wx + 30 * S, wt + 80 * S, 22 * S, 22 * S, sd + 8, 10), { fill: INK.paperLight, fop: 0.95 });
        sh.add(back, rect(wx - ww / 2 - 18 * S, wb, wx + ww / 2 + 18 * S, wb + 16 * S), { fill: INK.stain, fop: 0.8, stroke: INK.ink, w: 4 });
      }
      if (P.door !== false) {
        const dx = W * 0.9, dw = 170 * S, dt = FY - 470 * S;
        sh.add(back, [[dx - dw / 2, FY], [dx - dw / 2, dt + 70 * S], [dx, dt], [dx + dw / 2, dt + 70 * S], [dx + dw / 2, FY]], { fill: INK.ink, fop: 0.78, stroke: INK.ink, w: 6, smooth: true });
        sh.add(back, [[dx - dw / 2 - 16 * S, FY], [dx - dw / 2 - 16 * S, dt + 60 * S], [dx, dt - 18 * S], [dx + dw / 2 + 16 * S, dt + 60 * S], [dx + dw / 2 + 16 * S, FY]], { stroke: INK.stain, w: 9, closed: false, smooth: true });
      }

      // rug on the floor in perspective (fills the frame below the bed)
      if (P.rug !== false) {
        const ry0 = FY + 20 * S, ry1 = FY + 420 * S, rug = [[W * 0.14, ry0], [W * 0.86, ry0], [W * 1.02, ry1], [W * -0.02, ry1]];
        sh.add(back, rug, { fill: INK.red, fop: 0.5, stroke: INK.ink, w: 5 });
        sh.add(back, [[W * 0.2, ry0 + 30 * S], [W * 0.8, ry0 + 30 * S], [W * 0.92, ry1 - 40 * S], [W * 0.08, ry1 - 40 * S]], { stroke: INK.gold, w: 6 });
        sh.add(back, inkEllipsePts(W * 0.5, (ry0 + ry1) / 2 + 10 * S, 200 * S, 80 * S, sd + 77, 16), { fill: INK.gold, fop: 0.45, stroke: INK.ink, w: 4, smooth: true });
        sh.add(back, inkEllipsePts(W * 0.5, (ry0 + ry1) / 2 + 10 * S, 90 * S, 36 * S, sd + 78, 12), { fill: INK.blue, fop: 0.55, stroke: INK.ink, w: 3, smooth: true });
        for (let k = 0; k < 14; k++) { const u = k / 13; sh.add(back, [[lerp(W * -0.02, W * 1.02, u), ry1], [lerp(W * -0.02, W * 1.02, u) + 4 * S, ry1 + 26 * S]], { stroke: INK.ink, w: 3, closed: false }); }
      }
      // ---------------------------------------------------------- ceiling beams
      const beamG = el(shakeG, 'g');
      sh.add(beamG, rect(-20, -20, W + 20, CY - 34 * S), { fill: INK.stain, fop: 0.45 });
      for (let x = 30 * S; x < W; x += 120 * S) sh.add(beamG, rect(x, CY - 34 * S, x + 44 * S, CY - 14 * S), { fill: INK.stain, fop: 0.9, stroke: INK.ink, w: 3.5 });
      const beamL = el(beamG, 'g'), beamR = el(beamG, 'g');
      const bh = 56 * S, mid = W * 0.55;
      const beamPts = (x0, x1, brokenEnd) => {
        const pts = [[x0, CY - 14 * S], [x1, CY - 14 * S]];
        if (brokenEnd === 'r') pts.push([x1 + 16 * S, CY + 6 * S], [x1 - 8 * S, CY + 18 * S], [x1 + 12 * S, CY + 30 * S]);
        if (brokenEnd === 'l') pts.unshift([x0 - 12 * S, CY + 30 * S], [x0 + 8 * S, CY + 18 * S], [x0 - 16 * S, CY + 6 * S]);
        pts.push(...(brokenEnd === 'r' ? [[x1, CY - 14 * S + bh]] : [[x1, CY - 14 * S + bh]]), [x0, CY - 14 * S + bh]);
        return pts;
      };
      sh.add(beamL, beamPts(-30, mid, 'r'), { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 6 });
      sh.add(beamR, beamPts(mid, W + 30, 'l'), { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 6 });
      for (const [g, x0, x1] of [[beamL, -30, mid], [beamR, mid, W + 30]])
        for (let k = 0; k < 3; k++) sh.add(g, [[x0 + 30 * S, CY + (2 + k * 14) * S], [x1 - 30 * S, CY + (6 + k * 14) * S]], { stroke: INK.ink, w: 2, closed: false, sop: 0.6 });

      // ---------------------------------------------------------- bed with canopy
      const bedG = el(shakeG, 'g');
      const bx = W * (P.bed?.x ?? 0.52), bw = W * (P.bed?.w ?? 0.62), btop = FY - 150 * S;
      const canopyTop = FY - 610 * S;
      const canG = el(bedG, 'g');
      if (P.canopy !== false) for (const sx of [-1, 1]) sh.add(canG, rect(bx + sx * bw / 2 - 9 * S, canopyTop, bx + sx * bw / 2 + 9 * S, FY - 10 * S), { fill: INK.stain, fop: 0.9, stroke: INK.ink, w: 4 });
      const drape = [];
      for (let k = 0; k <= 8; k++) drape.push([bx - bw / 2 + k * bw / 8, canopyTop + (k % 2 ? 46 : 22) * S]);
      if (P.canopy !== false) sh.add(canG, [[bx - bw / 2 - 20 * S, canopyTop - 30 * S], [bx + bw / 2 + 20 * S, canopyTop - 30 * S]].concat(drape.slice().reverse()), { fill: INK.gold, fop: 0.55, stroke: INK.ink, w: 5, smooth: false });
      if (P.canopy !== false) sh.add(canG, [[bx - bw / 2 - 20 * S, canopyTop - 30 * S], [bx - bw / 2 + 8 * S, canopyTop + 20 * S], [bx - bw / 2 + 24 * S, FY - 170 * S], [bx - bw / 2 - 30 * S, FY - 170 * S], [bx - bw / 2 - 30 * S, canopyTop - 30 * S]], { fill: INK.red, fop: 0.42, stroke: INK.ink, w: 4, smooth: true });
      if (P.canopy !== false) sh.add(canG, [[bx + bw / 2 + 20 * S, canopyTop - 30 * S], [bx + bw / 2 - 8 * S, canopyTop + 20 * S], [bx + bw / 2 - 24 * S, FY - 170 * S], [bx + bw / 2 + 30 * S, FY - 170 * S], [bx + bw / 2 + 30 * S, canopyTop - 30 * S]], { fill: INK.red, fop: 0.42, stroke: INK.ink, w: 4, smooth: true });
      sh.add(bedG, rect(bx - bw / 2, btop + 40 * S, bx + bw / 2, FY - 30 * S), { fill: INK.stain, fop: 0.9, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 6; k++) { const x = bx - bw / 2 + (k + 0.5) * bw / 6; sh.add(bedG, arc(x, FY - 30 * S, bw / 16, 28 * S, Math.PI, 2 * Math.PI, 8), { stroke: INK.ink, w: 3, closed: false }); }
      for (const sx of [-1, 1]) sh.add(bedG, rect(bx + sx * (bw / 2 - 30 * S) - 16 * S, FY - 30 * S, bx + sx * (bw / 2 - 30 * S) + 16 * S, FY), { fill: INK.stain, stroke: INK.ink, w: 4 });
      sh.add(bedG, rect(bx - bw / 2 + 10 * S, btop, bx + bw / 2 - 10 * S, btop + 44 * S), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      const quilt = [[bx - bw * 0.12, btop - 6 * S], [bx + bw / 2 - 6 * S, btop - 10 * S], [bx + bw / 2 + 6 * S, btop + 70 * S], [bx - bw * 0.14, btop + 74 * S]];
      sh.add(bedG, quilt, { fill: INK.red, fop: 0.62, stroke: INK.ink, w: 5 });
      for (let k = 1; k < 5; k++) sh.add(bedG, [[bx - bw * 0.12 + k * bw * 0.12, btop - 7 * S], [bx - bw * 0.13 + k * bw * 0.125, btop + 72 * S]], { stroke: INK.gold, w: 4, closed: false });
      const pillows = [[bx - bw * 0.36, btop - 22 * S], [bx - bw * 0.22, btop - 18 * S]];
      pillows.forEach(([x, y], i) => sh.add(bedG, inkEllipsePts(x, y, 58 * S, 34 * S, sd + 20 + i, 12), { fill: INK.paperLight, stroke: INK.ink, w: 5, smooth: true }));

      shakeG.appendChild(beamG);   // fallen beams lie on top of the bed
      // ---------------------------------------------------------- lamp on a chain
      const lampG = el(shakeG, 'g');
      const lx = W * 0.78, ly0 = CY + 40 * S, chain = 280 * S;
      if (P.lamp !== false) {
        sh.add(lampG, [[lx, ly0], [lx, ly0 + chain]], { stroke: INK.ink, w: 3, closed: false });
        for (let k = 0; k < 8; k++) sh.add(lampG, inkEllipsePts(lx, ly0 + k * chain / 8 + 12 * S, 5 * S, 12 * S, sd + 40 + k, 8), { stroke: INK.ink, w: 2.5 });
        sh.add(lampG, [[lx - 46 * S, ly0 + chain], [lx + 46 * S, ly0 + chain], [lx + 24 * S, ly0 + chain + 60 * S], [lx - 24 * S, ly0 + chain + 60 * S]], { fill: INK.gold, fop: 0.75, stroke: INK.ink, w: 4 });
        sh.add(lampG, inkEllipsePts(lx, ly0 + chain - 4 * S, 50 * S, 10 * S, sd + 50, 12), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
        sh.add(lampG, lt => { const f = Math.sin(lt * 9) * 4 * S; return [[lx - 10 * S, ly0 + chain - 10 * S], [lx + f, ly0 + chain - 52 * S], [lx + 10 * S, ly0 + chain - 10 * S]]; }, { fill: INK.gold, fop: 0.95, stroke: INK.red, w: 3, smooth: true });
      }

      // ---------------------------------------------------------- aftermath / collapse pieces
      const rubG = el(root, 'g');
      const rub = [];
      for (let i = 0; i < 16; i++) {
        const x = (P.empty != null ? bx - bw * 0.06 + r() * bw * 0.42 : bx - bw * 0.36 + r() * bw * 0.72), y = btop + 20 * S - r() * 90 * S * (1 - Math.abs(x - bx) / bw), s = (34 + r() * 40) * S, a = r() * 3;
        rub.push(sh.add(rubG, [0, 1, 2, 3, 4].map(k => [x + Math.cos(a + k * 1.256) * s * (0.7 + 0.3 * ((k * 7) % 3) / 2), y + Math.sin(a + k * 1.256) * s * 0.7]),
          { fill: k3(i), fop: 0.95, stroke: INK.ink, w: 4, vis: lt => ruinAt(lt) }));
      }
      // floor debris after the collapse: fallen lamp, scattered stones, a toppled low table
      if (P.debris !== false) {
        const fy0 = FY + 60 * S, vis = lt => ruinAt(lt);
        const dl = [[0.16, 0.13], [0.42, 0.2], [0.7, 0.1], [0.86, 0.24], [0.3, 0.3], [0.58, 0.33]];
        dl.forEach(([fx, fy], i) => { const x = fx * W, y = fy0 + fy * 600 * S, s2 = (30 + (i % 3) * 14) * S;
          sh.add(rubG, inkEllipsePts(x, y, s2, s2 * 0.6, sd + 120 + i, 7, i * 0.4, 0.2), { fill: i % 2 ? INK.paperLight : INK.paperDark, stroke: INK.ink, w: 4, vis }); });
        const lx2 = W * 0.74, ly2 = fy0 + 120 * S;   // the fallen lamp, on its side, oil spilt
        sh.add(rubG, [[lx2 - 60 * S, ly2 - 30 * S], [lx2 + 10 * S, ly2 - 50 * S], [lx2 + 40 * S, ly2 + 10 * S], [lx2 - 30 * S, ly2 + 30 * S]], { fill: INK.gold, fop: 0.85, stroke: INK.ink, w: 4, vis });
        sh.add(rubG, inkEllipsePts(lx2 + 70 * S, ly2 + 40 * S, 90 * S, 22 * S, sd + 130, 12), { fill: INK.ink, fop: 0.35, vis });
        sh.add(rubG, [[lx2 - 60 * S, ly2 - 30 * S], [lx2 - 160 * S, ly2 - 60 * S], [lx2 - 250 * S, ly2 - 40 * S]], { stroke: INK.ink, w: 3, closed: false, vis });
        const tx2 = W * 0.2, ty2 = fy0 + 210 * S;    // toppled low table
        sh.add(rubG, [[tx2 - 90 * S, ty2], [tx2 + 70 * S, ty2 - 40 * S], [tx2 + 80 * S, ty2 - 20 * S], [tx2 - 80 * S, ty2 + 20 * S]], { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 4, vis });
        for (const k of [-60, 0, 50]) sh.add(rubG, [[tx2 + k * S, ty2 - k * 0.25 * S], [tx2 + k * S + 30 * S, ty2 - k * 0.25 * S - 70 * S]], { stroke: INK.ink, w: 6, closed: false, vis });
      }
      function k3(i) { return i % 3 === 0 ? INK.paperDark : INK.paperLight; }
      const steps = el(root, 'g');
      const stepEls = Array.from({ length: 7 }, () => inkEl(steps, INK.ink, { 'fill-opacity': 0.8 }));
      const emptyRing = inkEl(root, INK.red);
      const dust = L.dust(el(root, 'g'), sd + 600);
      const dr = L.drops(el(root, 'g'), sd + 700);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);
      let hitAt = null;
      const ruinAt = lt => P.ruin || (hitAt != null && lt >= hitAt + 0.55);
      const done = new Set();
      const D = btop - CY - 70 * S;
      const beamT = (p, b, side) => side === 'l'
        ? `translate(0 ${L.f1(D * p)}) rotate(${(13 * p + b).toFixed(2)} ${L.f1(0)} ${L.f1(CY)})`
        : `translate(0 ${L.f1(D * 0.96 * p)}) rotate(${(-15 * p - b).toFixed(2)} ${L.f1(W)} ${L.f1(CY)})`;

      return {
        update(lt, dur, cues, info) {
          const t = (info && info.t != null) ? info.t : lt;
          const sa = atOr(cues, P.shake, null), env = L.quakeEnv(lt, sa, P.shake_dur ?? 3);
          shakeG.setAttribute('transform', env > 0 ? `translate(${L.f1(Math.sin(lt * 43) * 8 * env * S)} ${L.f1(Math.cos(lt * 37) * 5 * env * S)})` : '');
          const sw = (env * 22 + 2) * Math.sin(lt * 3.1);
          lampG.setAttribute('transform', `rotate(${sw.toFixed(2)} ${L.f1(lx)} ${L.f1(ly0)})`);
          hitAt = atOr(cues, P.hit, null);
          if (sa != null && !done.has('sand')) {
            done.add('sand');
            for (let i = 0; i < 14; i++) dr.add({ kind: 'drop', x: W * (0.1 + 0.8 * ((i * 37) % 14) / 14), y: CY + 40 * S, vx: 0, vy: 40 * S, g: 900 * S, size: 0.45 * S, at: sa + 0.15 * i, floor: FY });
          }
          // beam halves
          if (P.ruin) {
            beamL.setAttribute('transform', beamT(1, 0, 'l'));
            beamR.setAttribute('transform', beamT(1, 0, 'r'));
            canG.setAttribute('transform', `rotate(6 ${L.f1(bx)} ${L.f1(FY)})`);
          } else if (hitAt != null && lt >= hitAt) {
            const p = Math.min(1, Math.pow((lt - hitAt) / 0.55, 2)), bounce = lt - hitAt > 0.55 ? Math.exp(-(lt - hitAt - 0.55) * 8) * Math.sin((lt - hitAt - 0.55) * 30) * 2 : 0;
            beamL.setAttribute('transform', beamT(p, bounce, 'l'));
            beamR.setAttribute('transform', beamT(p, bounce, 'r'));
            canG.setAttribute('transform', `rotate(${(6 * p).toFixed(2)} ${L.f1(bx)} ${L.f1(FY)})`);
            if (!done.has('hit')) {
              done.add('hit');
              dust.puff(bx, btop - 30 * S, hitAt + 0.5, 1.8 * S); dust.puff(bx - bw * 0.3, btop, hitAt + 0.6, 1.3 * S); dust.puff(bx + bw * 0.3, btop - 10 * S, hitAt + 0.65, 1.3 * S);
              for (let i = 0; i < 12; i++) dr.add({ kind: 'stone', x: W * (0.2 + 0.6 * ((i * 5) % 12) / 12), y: CY + 30 * S, vx: ((i % 5) - 2) * 30 * S, vy: 60 * S, g: 2200 * S, size: (1.4 + (i % 3) * 0.5) * S, at: hitAt + 0.05 * (i % 6), floor: btop + 20 * S, spin: 3 + i % 4 });
            }
          } else { beamL.setAttribute('transform', ''); beamR.setAttribute('transform', ''); canG.setAttribute('transform', ''); }
          if (P.ruin && !done.has('haze')) { done.add('haze'); dust.puff(bx, btop - 20 * S, -0.6, 1.4 * S); }
          // footprints bed -> door
          const st = P.steps ? atOr(cues, P.steps.at, 0.5) : null;
          stepEls.forEach((e, i) => {
            if (st == null || lt < st + i * (P.steps.dur ?? 1.4) / 7) { e.setAttribute('d', ''); return; }
            const u = i / 6, x = lerp(bx + bw * 0.25, W * 0.88, u), y = FY + 40 * S + (i % 2 ? 22 : -4) * S;
            e.setAttribute('d', inkDot(x, y, 20 * S, 9 * S, sd + 800 + i, t, 0.6));
          });
          const ea = atOr(cues, P.empty, null);
          if (ea != null && lt >= ea) {
            const p = prog(lt, ea, 0.5), pts = inkEllipsePts(bx - bw * 0.29, btop - 20 * S, 150 * S, 70 * S, sd + 66, 16, -0.05, 0.05);
            emptyRing.setAttribute('d', inkPath(pts.slice(0, Math.max(2, Math.round(17 * p))).concat(p >= 1 ? [pts[0]] : []), { seed: sd + 67, t, w: 9, amp: 1.2 }));
          } else emptyRing.setAttribute('d', '');
          sh.update(t, lt);
          dust.update(lt, t);
          dr.update(lt, t);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
