// tz_door: a Byzantine palace corridor at night, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure
// function of (seed, lt)). A gold mosaic band, marble pilasters, a wall lamp; a tall double door barred by a wooden
// bolt. A crowned empress in a red robe draws the bolt (`open`) and the right leaf swings open onto darkness; the
// marble floor runs in perspective to the frame bottom. Use with "set": "interior". Needs tz__lib.js and mcB__lib.js.
// P: {gy: 0.6 (floor line), open: cue|s (bolt slides, door opens; default dur*0.5), who: {x: 0.24, scale: 0.95,
//   accessory: "crown", robe: "red"}, labels: [MCB labels]}
// cues: open, hit (punch). Close-up targets (portrait): bolt ≈ [560, 830], the empress's face ≈ [270, 640].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_door = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, M = window.MCB, sd = seed * 1000 + 613;
      const root = el(svg, 'g');
      const sh = T.Shapes();
      const gy = (P.gy ?? 0.6) * H;
      const back = el(root, 'g');
      // wall: mosaic band (gold + blue tesserae), pilasters
      const mt = 330, mb = 420;
      sh.add(back, T.rect(-30, mt, W + 30, mb), { fill: INK.gold, fop: 0.8, stroke: INK.ink, w: 5 });
      for (let x = 0, i = 0; x < W; x += 46, i++) sh.add(back, inkEllipsePts(x + 23, (mt + mb) / 2 + (i % 2 ? 14 : -14), 12, 12, sd + i, 6), { fill: i % 3 ? INK.blue : INK.red, fop: 0.85 });
      [0.06, 0.94].forEach((u, i) => {
        sh.add(back, T.rect(u * W - 50, mb, u * W + 50, gy), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
        for (let k = 0; k < 4; k++) sh.add(back, [[u * W - 30, mb + 80 + k * 170], [u * W + 10, mb + 160 + k * 170], [u * W + 30, mb + 200 + k * 170]], { stroke: INK.inkSoft, w: 2.5, closed: false, smooth: true });
      });
      // door frame + leaves
      const dx0 = W * 0.42, dx1 = W * 0.86, dt = 500, dm = (dx0 + dx1) / 2;
      sh.add(back, [[dx0 - 30, gy], [dx0 - 30, dt + 60], [dm, dt - 70], [dx1 + 30, dt + 60], [dx1 + 30, gy]], { fill: mix(INK.paperDark, INK.inkSoft, 0.3), stroke: INK.ink, w: 7, smooth: true });
      sh.add(back, [[dx0, gy], [dx0, dt + 70], [dm, dt - 40], [dx1, dt + 70], [dx1, gy]], { fill: INK.ink, fop: 0.92, smooth: true });
      const leafL = el(root, 'g'), leafR = el(root, 'g');
      const leaf = (g, x0, x1, k) => {
        sh.add(g, [[x0, gy], [x0, dt + 70], [x1, dt - 40 + (x1 === dm ? 0 : 110)], [x1, gy]], { fill: INK.stain, stroke: INK.ink, w: 6, smooth: false, seed: sd + k });
        for (let j = 0; j < 3; j++) { const y0 = dt + 120 + j * 190; sh.add(g, T.rect(Math.min(x0, x1) + 24, y0, Math.max(x0, x1) - 24, y0 + 150), { stroke: INK.ink, w: 4, seed: sd + k + 10 + j }); }
        for (let j = 0; j < 8; j++) sh.add(g, inkEllipsePts(lerp(x0, x1, 0.15 + (j % 4) * 0.23), dt + 200 + Math.floor(j / 4) * 330, 9, 9, sd + k + 20 + j, 7), { fill: INK.gold, stroke: INK.ink, w: 2.5 });
      };
      leaf(leafL, dx0, dm, 100); leaf(leafR, dm, dx1, 200);
      // bolt: brackets + bar
      const by = gy - 0.17 * H;
      const boltG = el(root, 'g');
      sh.add(boltG, T.rect(dm - 190, by - 22, dm + 120, by + 22), { fill: mix(INK.stain, INK.ink, 0.35), stroke: INK.ink, w: 5 });
      sh.add(boltG, inkEllipsePts(dm - 190, by, 26, 26, sd + 300, 9), { fill: INK.gold, stroke: INK.ink, w: 4 });
      const brackets = el(root, 'g');
      [dm - 130, dm + 70].forEach((x, i) => sh.add(brackets, T.rect(x - 22, by - 40, x + 22, by + 40), { fill: INK.inkSoft, stroke: INK.ink, w: 4, seed: sd + 310 + i }));
      // wall lamp (left)
      const lx = W * 0.2, ly = 560;
      sh.add(back, [[lx, mb], [lx, ly - 40]], { stroke: INK.ink, w: 4, closed: false });
      sh.add(back, [[lx - 50, ly - 40], [lx + 50, ly - 40], [lx + 26, ly + 20], [lx - 26, ly + 20]], { fill: INK.gold, stroke: INK.ink, w: 4 });
      sh.add(back, lt => { const f = Math.sin(lt * 9) * 6; return [[lx - 14, ly - 40], [lx + f, ly - 110], [lx + 14, ly - 40]]; }, { fill: INK.gold, stroke: INK.red, w: 3, smooth: true });
      // light spill through the opening
      const spill = inkEl(root, INK.gold, { 'fill-opacity': 0.22 });
      // marble floor in perspective to the frame bottom
      const fl = el(root, 'g');
      sh.add(fl, T.rect(-30, gy, W + 30, H + 30), { fill: mix(INK.paperLight, INK.paperDark, 0.45), stroke: INK.ink, w: 6 });
      for (let i = -8; i <= 8; i++) sh.add(fl, [[W / 2 + i * 70, gy], [W / 2 + i * 300, H + 30]], { stroke: INK.inkSoft, w: 2.5, closed: false });
      for (let y = gy + 50, j = 0; y < H; j++, y += 50 + j * 28) sh.add(fl, [[-20, y], [W + 20, y]], { stroke: INK.inkSoft, w: 2, closed: false });
      sh.add(fl, [[W * 0.2, gy + 40], [W * 0.8, gy + 40], [W * 1.05, H * 0.92], [W * -0.05, H * 0.92]], { fill: INK.red, fop: 0.4, stroke: INK.ink, w: 4 });
      const who = Object.assign({ x: 0.24, scale: 0.95, accessory: 'crown', robe: 'red' }, P.who || {});
      const emp = T.person(el(root, 'g'), sd + 400, { scale: who.scale, accessory: who.accessory, robe: who.robe });
      const shadowE = inkEl(root, INK.ink, { 'fill-opacity': 0.25 });
      const labs = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const oa = T.atOr(cues, P.open ?? 'open', dur * 0.5), pk = punch(lt, T.atOr(cues, 'hit', oa), 0.6);
          const slide = progIO(lt, oa - 0.5, 0.6), swing = progIO(lt, oa + 0.15, 1.0);
          boltG.setAttribute('transform', `translate(${T.f1(-slide * 230)} 0)`);
          // the right leaf swings inward: it narrows towards its hinge (right edge)
          const k = 1 - 0.82 * swing;
          leafR.setAttribute('transform', `translate(${T.f1(dx1)} 0) scale(${k.toFixed(3)} 1) translate(${T.f1(-dx1)} 0)`);
          const gapX = lerp(dm, dx1 - (dx1 - dm) * 0.82, swing);
          spill.setAttribute('d', swing > 0.05 ? inkLoop([[dm, gy], [gapX, gy], [gapX + 160 * swing, H * 0.9], [dm - 120 * swing, H * 0.9]], { seed: sd + 500, t, amp: 1 }) : '');
          sh.update(t, lt);
          // the empress: reaches for the bolt, then steps back and looks at the open door
          const x = who.x * W + slide * 30;
          const pose = lt < oa - 0.6 ? 'idle' : lt < oa + 0.4 ? 'point' : 'think';
          emp.update(t, pose, { x, y: gy, face: 1, since: Math.max(0, lt - (lt < oa + 0.4 ? oa - 0.6 : oa + 0.4)), dir: -10, emotion: lt > oa + 0.4 ? 'worried' : null });
          shadowE.setAttribute('d', inkLoop(inkEllipsePts(x, gy + 6, 110, 18, sd + 600, 10), { seed: sd + 600, t, amp: 1 }));
          labs.update(lt, t, cues);
          root.setAttribute('transform', pk ? `translate(${W / 2} ${gy}) scale(${(1 + 0.02 * pk).toFixed(3)}) translate(${-W / 2} ${-gy})` : '');
        },
      };
    },
  };
})();
