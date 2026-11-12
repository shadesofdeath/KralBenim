// mq_lab: the mosquito lab, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of
// (seed, time)). A lab bench fills the foreground down to the frame bottom; the wall and floor come from the scene's
// "set" (interior).
//   mode "hold": a hatless scientist in a lab coat stands behind the bench and holds up a worn nylon stocking that
//     swings gently; a mesh cage of mosquitoes buzzes on the bench; a shelf of jars on the wall.
//   mode "test": a two-choice olfactometer across the whole bench: a clear release box in the middle full of
//     buzzing mosquitoes, two clear tubes out to two clear chambers, each with a stocking hanging inside and a
//     hand-written tag; gold odour wisps drift from the chambers down the tubes. On `go` the gate opens and the
//     mosquitoes fly out: P.split of them into the left chamber, the rest into the right.
// P: {mode: "hold"|"test", bench: 0.64 (bench top, 0..1 H), tags: ["A", "B"], n: 14, split: 11,
//     labels: [{text, x, y, size, color, at, ...}] (LH.label)}
// cues: go (test: mosquitoes choose), plus whatever the labels use. Needs lh__lib.js (LH) and mq__lib.js (MQ).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mq_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, Q = window.MQ, sd = seed * 1000 + 977, u = W / 1080;
      const root = el(svg, 'g');
      const mode = P.mode || 'hold';
      const bt = (P.bench ?? 0.64) * H;
      const glass = INK.paperLight, glassR = mix(INK.inkSoft, INK.blue, 0.35);
      // wall shelf with jars (both modes, behind everything)
      const shelf = inkEl(root, mix(INK.stain, INK.ink, 0.3)), jars = inkEl(root, glass, { 'fill-opacity': 0.55 }), jarsR = inkEl(root, glassR), jarsC = inkEl(root, mix(INK.green, INK.paperDark, 0.3));
      let sci, stock, cage, cageR, cageM, cageSw, box, boxR, tubes, tubesR, gate, stocks, tags, wisps, flyers, shine;
      if (mode === 'hold') {
        sci = L.person(el(root, 'g'), sd + 10, { kind: 'lab', hair: 'dark', glasses: true });
        stock = Q.stocking(el(root, 'g'), sd + 20);
      } else {
        box = inkEl(root, glass, { 'fill-opacity': 0.35 }); tubes = inkEl(root, glass, { 'fill-opacity': 0.3 });
        stocks = [Q.stocking(el(root, 'g'), sd + 30), Q.stocking(el(root, 'g'), sd + 31)];
        wisps = Q.wisp(el(root, 'g'), sd + 40, mix(INK.gold, INK.paperLight, 0.1));
        flyers = Array.from({ length: P.n ?? 14 }, (_, i) => Q.mosquito(el(root, 'g'), sd + 100 + i, 'aedes'));
        boxR = inkEl(root, glassR); tubesR = inkEl(root, glassR); gate = inkEl(root, INK.red); shine = inkEl(root, INK.paperLight);
        tags = (P.tags || ['A', 'B']).map((tx, i) => L.label(root, { text: tx, x: i ? 0.83 : 0.17, y: 0.305, size: 80, color: 'ink', card: true, at: 0.1 + i * 0.15, font: 'serif', underline: false, rot: i ? 3 : -3 }, W, H));
      }
      const bench = Q.bench(el(root, 'g'), sd + 50);
      if (mode === 'hold') {
        cage = inkEl(root, glass, { 'fill-opacity': 0.25 }); cageSw = Q.swarm(el(root, 'g'), 5, sd + 60, 'aedes'); cageM = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2)); cageR = inkEl(root);
      }
      const labels = (P.labels || []).map(o => L.label(root, o, W, H));
      const R = rng(inkHash(sd, 7)), FQ = Array.from({ length: 40 }, () => R());
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // shelf + jars
          const sy = 0.2 * H, sx0 = 0.04 * W, sx1 = mode === 'hold' ? 0.4 * W : 0.96 * W;
          shelf.setAttribute('d', inkPath([[sx0, sy], [sx1, sy]], { w: 16 * u, seed: k + 1, t, taper: 0 }));
          const J = [], JR = [], JC = [];
          const nj = mode === 'hold' ? 3 : 6;
          for (let i = 0; i < nj; i++) {
            const x = lerp(sx0 + 60 * u, sx1 - 60 * u, nj === 1 ? 0.5 : i / (nj - 1)), h = (90 + FQ[i] * 60) * u, w = (34 + FQ[i + 5] * 16) * u;
            const pts = [[x - w, sy - 8 * u], [x + w, sy - 8 * u], [x + w, sy - h], [x - w * 0.6, sy - h - 16 * u], [x - w, sy - h]];
            J.push(inkLoop(pts, { seed: k + 10 + i, t, smooth: false })); JR.push(inkPath(pts, { w: 4, seed: k + 20 + i, t, closed: true, smooth: false }));
            JC.push(inkLoop([[x - w + 6 * u, sy - 12 * u], [x + w - 6 * u, sy - 12 * u], [x + w - 6 * u, sy - h * 0.45], [x - w + 6 * u, sy - h * 0.45]], { seed: k + 30 + i, t, smooth: false }));
          }
          jars.setAttribute('d', J.join(' ')); jarsR.setAttribute('d', JR.join(' ')); jarsC.setAttribute('d', JC.join(' '));
          if (mode === 'hold') {
            // scientist behind the bench lifts the stocking up to the light
            const x = 0.36 * W, s = 1.45 * u, gy = bt + 120 * u;
            const lift = spring(lt, 0.1, 0.8);
            const hand = [lerp(x + 120 * s, 0.63 * W, lift), lerp(gy - 300 * s, 0.33 * H, lift)];
            const r = sci.update(t, x, gy, s, { face: 1, lean: 2, armR: hand, armL: [x + 60 * s, gy - 330 * s], look: [6, -10 * lift], brow: 0.7 * lift });
            const sw = Math.sin(t * 1.7) * 7 + (1 - lift) * 20;
            stock.update(t, r.hR[0], r.hR[1] + 8 * u, 430 * u, 120 * u, sw, {});
            // mosquito cage on the bench (right)
            const cx = 0.8 * W, cw = 170 * u, ch = 260 * u, ct = bt - ch;
            const box4 = [[cx - cw, bt], [cx + cw, bt], [cx + cw, ct], [cx - cw, ct]];
            cage.setAttribute('d', inkLoop(box4, { seed: k + 60, t, smooth: false }));
            const M = [];
            for (let i = 1; i < 8; i++) M.push(inkPath([[cx - cw + i * cw / 4, ct], [cx - cw + i * cw / 4, bt]], { w: 2, seed: k + 61 + i, t, amp: 0.6 }));
            for (let i = 1; i < 5; i++) M.push(inkPath([[cx - cw, ct + i * ch / 5], [cx + cw, ct + i * ch / 5]], { w: 2, seed: k + 70 + i, t, amp: 0.6 }));
            cageM.setAttribute('d', M.join(' '));
            cageR.setAttribute('d', inkPath(box4, { w: 7, seed: k + 80, t, closed: true, smooth: false }) + ' ' + inkPath([[cx - cw - 14 * u, ct], [cx + cw + 14 * u, ct]], { w: 14 * u, seed: k + 81, t, taper: 0 }));
            cageSw.update(t, cx, ct + ch * 0.5, cw * 0.75, ch * 0.45, 0.42 * u);
          } else {
            // olfactometer
            const by0 = 0.34 * H, by1 = bt - 6 * u, cx = 0.5 * W, cw = 120 * u;
            const ty = lerp(by0, by1, 0.55), th = 64 * u;
            const chw = 150 * u, lx = 0.17 * W, rx = 0.83 * W;
            const rr = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            const mid = rr(cx - cw, by0 + 60 * u, cx + cw, by1), chL = rr(lx - chw, by0, lx + chw, by1), chR = rr(rx - chw, by0, rx + chw, by1);
            box.setAttribute('d', [mid, chL, chR].map((p, i) => inkLoop(p, { seed: k + 100 + i, t, smooth: false })).join(' '));
            const tL = rr(lx + chw, ty - th, cx - cw, ty + th), tR = rr(cx + cw, ty - th, rx - chw, ty + th);
            tubes.setAttribute('d', [tL, tR].map((p, i) => inkLoop(p, { seed: k + 110 + i, t, smooth: false })).join(' '));
            stocks[0].update(t, lx - 10 * u, by0 + 40 * u, 300 * u, 90 * u, Math.sin(t * 1.3) * 3, { flip: false });
            stocks[1].update(t, rx + 10 * u, by0 + 40 * u, 300 * u, 90 * u, Math.sin(t * 1.3 + 1) * 3, { flip: true });
            const W8 = [];
            for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; W8.push([lerp(lx + chw, cx - cw, ph), ty + (i - 1) * 30 * u, 0]); W8.push([lerp(rx - chw, cx + cw, ph), ty + (i - 1) * 30 * u, 0]); }
            // horizontal wisps: drawn as short wavy dashes moving inward
            wisps.update(t, [], 0);
            const go = L.atOr(cues, 'go', dur * 0.35);
            const WS = W8.map((q, i) => { const dir = q[0] < cx ? 1 : -1, P2 = []; for (let j = 0; j <= 6; j++) { const v = j / 6; P2.push([q[0] + dir * v * 90 * u, q[1] + Math.sin(v * 6 + t * 3 + i) * 8 * u]); } return inkPath(P2, { w: 4, seed: k + 120 + i, t, amp: 0.8, taper: 0.6 }); });
            shine.setAttribute('d', [mid, chL, chR].map((p, i) => inkPath([[p[0][0] + 24 * u, p[0][1] + 30 * u], [p[0][0] + 24 * u, p[0][1] + 150 * u]], { w: 6, seed: k + 140 + i, t })).join(' ') + ' ' + WS.join(' '));
            shine.setAttribute('fill', mix(INK.gold, INK.paperLight, 0.2));
            boxR.setAttribute('d', [mid, chL, chR].map((p, i) => inkPath(p, { w: 6, seed: k + 150 + i, t, closed: true, smooth: false })).join(' '));
            tubesR.setAttribute('d', [tL, tR].map((p, i) => inkPath([p[0], p[1]], { w: 5, seed: k + 160 + i, t }) + ' ' + inkPath([p[3], p[2]], { w: 5, seed: k + 162 + i, t })).join(' '));
            const open = clamp01((lt - go) / 0.3);
            gate.setAttribute('d', [-1, 1].map((d, i) => inkPath([[cx + d * cw, ty - th + open * 2 * th * 0.9], [cx + d * cw, ty + th]], { w: 10 * u, seed: k + 170 + i, t, taper: 0 })).join(' '));
            const n = flyers.length, split = P.split ?? Math.round(n * 0.78);
            flyers.forEach((m, i) => {
              const a = t * (1.1 + FQ[i] * 0.8) + FQ[i + 10] * 6.28;
              const home = [cx + Math.sin(a) * cw * 0.7, lerp(by0 + 120 * u, by1 - 60 * u, 0.5) + Math.sin(2 * a + i) * 110 * u];
              const left = i < split, dc = left ? lx : rx;
              const dest = [dc + Math.sin(a) * chw * 0.6, lerp(by0 + 200 * u, by1 - 50 * u, 0.5 + 0.4 * Math.sin(2 * a + i))];
              const st = go + 0.15 + FQ[i + 20] * 1.4, p = clamp01((lt - st) / 1.0), e = p * p * (3 - 2 * p);
              let x, y;
              if (p <= 0) { x = home[0]; y = home[1]; }
              else if (p >= 1) { x = dest[0]; y = dest[1]; }
              else { const via = [lerp(cx, dc, e), ty + Math.sin(e * 9 + i) * th * 0.5]; x = via[0]; y = via[1]; }
              const fc = p > 0 && p < 1 ? (left ? -1 : 1) : (Math.cos(a) >= 0 ? 1 : -1);
              m.update(t, x, y, 0.36 * u, { face: fc, ang: Math.sin(a * 2) * 10 });
            });
            tags[0].update(lt, t, cues); tags[1].update(lt, t, cues);
            // tags sit over the chambers
          }
          bench.update(t, W, H, bt);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
