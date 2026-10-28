// cay_port: tea crates sent back on a harbour pier (Europe returns Turkish tea, 1986), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). A cargo ship lies at the quay (left, rocking
// gently); its derrick swings a sling-load of tea crates back off the ship and sets it down on the pier (lands on
// `land`); a stack of crates already waits on the pier, the front one stencilled with P.text; on `stamp` a red
// rubber stamp with P.stamp slams onto it. Pier planks in perspective run to the frame bottom with a bollard and a
// coil of rope in front. Leaves sky and sea to the scene's "set" (coast); ground (pier edge) ≈ 0.5 H.
// P: {gy: 0.5, text: "TÜRK ÇAYI", stamp: "İADE", label: {text, x, y, at, size, color}}
// cues: land (the sling-load touches down), stamp (stamp slams), label.at. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cay_port = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 811, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.5) * H;
      const Q = (g, fill, extra) => inkEl(g, fill, extra);
      const shipG = el(root, 'g');
      const hull = Q(shipG, mix(INK.ink, INK.inkSoft, 0.4)), hullStripe = Q(shipG, INK.red), deck = Q(shipG, INK.paperDark), house = Q(shipG, INK.paperLight), shipR = Q(shipG), portholes = Q(shipG, INK.gold, { 'fill-opacity': 0.8 });
      const water = Q(root, mix(INK.blue, INK.paperLight, 0.55)), waterL = Q(root, INK.blue);
      const derrick = Q(root, INK.ink), rope = el(root, 'path', { fill: 'none', stroke: INK.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
      const pier = Q(root, INK.stain), pierL = Q(root, INK.inkSoft), pierEdge = Q(root);
      const crateG = el(root, 'g');
      const crates = Array.from({ length: 10 }, () => ({ f: Q(crateG, mix(INK.stain, INK.paperLight, 0.35)), r: Q(crateG), s: Q(crateG, INK.inkSoft) }));
      const txt = el(crateG, 'text', { 'font-family': INK_FONT, 'font-size': 58, 'text-anchor': 'middle', fill: INK.ink });
      txt.textContent = P.text || 'TÜRK ÇAYI';
      const stampG = el(root, 'g');
      const stampBox = Q(stampG, 'none'), stampTx = el(stampG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 84, 'text-anchor': 'middle', fill: INK.red, 'fill-opacity': 0.9 });
      stampTx.textContent = P.stamp || 'İADE';
      const tool = Q(root, INK.stain), toolR = Q(root), toolH = Q(root, INK.red);
      const fore = Q(root, INK.ink), foreF = Q(root, INK.inkSoft), coil = Q(root, INK.stain), coilR = Q(root);
      const lab = P.label ? C.label(root, P.label, W, H) : null;
      const crateAt = (cx, by, w, h, i, t, k, rot = 0) => {
        const c = Math.cos(rot), s = Math.sin(rot), Rp = p => [cx + (p[0] * c - p[1] * s), by + (p[0] * s + p[1] * c)];
        const b = [[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]].map(Rp);
        crates[i].f.setAttribute('d', inkLoop(b, { seed: k + i * 3, t, smooth: false, amp: 0.8 }));
        crates[i].r.setAttribute('d', inkPath(b, { w: 4.5, seed: k + i * 3 + 1, t, closed: true, smooth: false }));
        crates[i].s.setAttribute('d', [inkPath([Rp([-w / 2, -h * 0.5]), Rp([w / 2, -h * 0.5])], { w: 3, seed: k + i * 3 + 2, t }), inkPath([Rp([-w / 2 + 10, -h + 10]), Rp([w / 2 - 10, -10])], { w: 3, seed: k + i * 3 + 40, t })].join(' '));
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const landAt = C.atOr(cues, 'land', dur * 0.55), stampAt = C.atOr(cues, 'stamp', dur * 0.3);
          // sea band behind the pier
          const sy = gy - 170 * u;
          water.setAttribute('d', `M-20 ${C.f1(sy)} H${W + 20} V${C.f1(gy + 20)} H-20 Z`);
          const WL = [];
          for (let i = 0; i < 9; i++) { const x = (i / 8) * W + Math.sin(t + i) * 10, y = sy + 30 + (i % 3) * 40; WL.push(inkPath([[x - 40, y], [x - 14, y - 10], [x + 12, y], [x + 38, y - 10]], { w: 3, seed: k + 10 + i, t })); }
          waterL.setAttribute('d', WL.join(' '));
          // ship (left, rocking)
          const rock = Math.sin(t * 1.1) * 0.012, sx0 = -60, sx1 = 0.5 * W, sTop = sy - 150 * u, sBot = sy + 70 * u;
          const S = p => { const cx = (sx0 + sx1) / 2, cy = sBot; const dx = p[0] - cx, dy = p[1] - cy; return [cx + dx * Math.cos(rock) - dy * Math.sin(rock), cy + dx * Math.sin(rock) + dy * Math.cos(rock) + Math.sin(t * 1.3) * 3]; };
          const hp = [[sx0, sTop], [sx1, sTop], [sx1 - 40 * u, sBot], [sx0, sBot]].map(S);
          hull.setAttribute('d', inkLoop(hp, { seed: k + 20, t, smooth: false }));
          hullStripe.setAttribute('d', inkLoop([[sx0, sBot - 40 * u], [sx1 - 30 * u, sBot - 40 * u], [sx1 - 40 * u, sBot - 14 * u], [sx0, sBot - 14 * u]].map(S), { seed: k + 21, t, smooth: false }));
          const dp = [[sx0, sTop - 16 * u], [sx1 + 10, sTop - 16 * u], [sx1, sTop], [sx0, sTop]].map(S);
          deck.setAttribute('d', inkLoop(dp, { seed: k + 22, t, smooth: false }));
          const hs = [[0.03 * W, sTop - 16 * u], [0.03 * W, sTop - 150 * u], [0.2 * W, sTop - 150 * u], [0.2 * W, sTop - 16 * u]].map(S);
          house.setAttribute('d', inkLoop(hs, { seed: k + 23, t, smooth: false }));
          shipR.setAttribute('d', [inkPath(hp, { w: 5, seed: k + 24, t, closed: true, smooth: false }), inkPath(hs, { w: 4.5, seed: k + 25, t, closed: true, smooth: false }), inkPath(dp, { w: 3, seed: k + 26, t, closed: true, smooth: false })].join(' '));
          portholes.setAttribute('d', [0.06, 0.12, 0.17].map((x, i) => { const p = S([x * W, sTop - 90 * u]); return inkCircle(p[0], p[1], 14 * u, k + 27 + i, t, { fill: true }); }).join(' '));
          // derrick: mast on the ship, boom swings out over the pier
          const mast = S([0.36 * W, sTop - 16 * u]), mastTop = S([0.36 * W, 0.2 * H]);
          const sw = progIO(lt, 0, Math.max(0.6, landAt - 0.4));
          const boomEnd = [lerp(0.42 * W, 0.7 * W, sw), lerp(0.24 * H, 0.26 * H, sw)];
          derrick.setAttribute('d', inkPath([mast, mastTop], { w: 14, seed: k + 30, t }) + ' ' + inkPath([[mast[0], mast[1] - 60 * u], boomEnd], { w: 9, seed: k + 31, t }) + ' ' + inkPath([mastTop, boomEnd], { w: 3, seed: k + 32, t }));
          // load: hangs from the boom, lowered onto the pier at landAt
          const low = progIO(lt, landAt - 0.9, 0.9);
          const ly = lerp(0.4 * H, gy + 40 * u, low), lx = boomEnd[0] + Math.sin(t * 2.2) * 10 * (1 - low) * u, lrot = Math.sin(t * 2.2) * 0.05 * (1 - low);
          rope.setAttribute('d', `M${C.f1(boomEnd[0])} ${C.f1(boomEnd[1])} L${C.f1(lx)} ${C.f1(ly - 260 * u)} M${C.f1(lx)} ${C.f1(ly - 260 * u)} L${C.f1(lx - 110 * u)} ${C.f1(ly - 130 * u)} M${C.f1(lx)} ${C.f1(ly - 260 * u)} L${C.f1(lx + 110 * u)} ${C.f1(ly - 130 * u)}`);
          // pier
          pier.setAttribute('d', `M-20 ${C.f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
          const PL = [];
          for (let i = -10; i <= 10; i++) PL.push(inkPath([[W / 2 + i * W * 0.07, gy], [W / 2 + i * W * 0.36, H + 20]], { w: 2.6, seed: k + 40 + i, t }));
          for (let y = gy + 60, j = 0; y < H; j++, y += 60 + (y - gy) * 0.3) PL.push(inkPath([[-10, y], [W + 10, y + 3]], { w: 1.6, seed: k + 70 + j, t }));
          pierL.setAttribute('d', PL.join(' '));
          pierEdge.setAttribute('d', inkPath([[-20, gy], [W + 20, gy + 3]], { w: 7, seed: k + 80, t }));
          // crates: a stack on the pier (right) + the sling-load (two crates)
          const cw = 210 * u, chh = 150 * u, bx = 0.74 * W, by = gy + 60 * u;
          crateAt(lx - cw * 0.5, ly, cw, chh, 0, t, k + 100, lrot);
          crateAt(lx + cw * 0.5, ly, cw, chh, 1, t, k + 100, lrot);
          crateAt(bx + cw * 0.55, by - chh * 0.9, cw * 0.95, chh * 0.95, 2, t, k + 100);
          crateAt(bx - 0.4 * cw, by + 40 * u, cw, chh, 3, t, k + 100);
          crateAt(bx + 0.62 * cw, by + 40 * u, cw, chh, 4, t, k + 100);
          crateAt(bx + 0.1 * cw, by + 40 * u - chh, cw, chh, 5, t, k + 100);
          // the front crate (with the stencil)
          const fx = 0.4 * W, fy = gy + 170 * u, fw = 380 * u, fh = 250 * u;
          crateAt(fx, fy, fw, fh, 6, t, k + 100);
          // foreground: big crates cropped by the frame bottom (they are drawn later, in front)
          txt.setAttribute('x', C.f1(fx)); txt.setAttribute('y', C.f1(fy - fh * 0.62)); txt.setAttribute('font-size', C.f1(78 * u));
          // stamp
          const sp = spring(lt, stampAt, 0.45), dn = lt < stampAt ? 0 : 1;
          const sX = fx, sY = fy - fh * 0.2;
          if (dn) {
            const sc = lerp(1.6, 1, Math.min(1, sp));
            stampG.setAttribute('transform', `translate(${C.f1(sX)} ${C.f1(sY)}) rotate(-9) scale(${C.f1(sc * 100) / 100})`);
            stampBox.setAttribute('d', inkPath([[-150, -70], [150, -70], [150, 26], [-150, 26]], { w: 9, seed: k + 120, t, closed: true, smooth: false }));
            stampBox.setAttribute('fill', INK.red);
            stampTx.setAttribute('x', 0); stampTx.setAttribute('y', 6);
          } else stampG.setAttribute('transform', 'scale(0)');
          // the rubber stamp tool comes down and lifts
          const toolY = lt < stampAt - 0.35 ? -400 : lt < stampAt ? lerp(-400, 0, progIO(lt, stampAt - 0.35, 0.35)) : lerp(0, -500, progIO(lt, stampAt + 0.15, 0.5));
          if (toolY > -480) {
            const tb = [[sX - 120, sY - 110 + toolY], [sX + 120, sY - 110 + toolY], [sX + 120, sY - 70 + toolY], [sX - 120, sY - 70 + toolY]];
            const hd = [[sX - 30, sY - 240 + toolY], [sX + 30, sY - 240 + toolY], [sX + 22, sY - 110 + toolY], [sX - 22, sY - 110 + toolY]];
            tool.setAttribute('d', inkLoop(hd, { seed: k + 130, t, smooth: false }) + ' ' + inkCircle(sX, sY - 270 + toolY, 46, k + 131, t, { fill: true }));
            toolH.setAttribute('d', inkLoop(tb, { seed: k + 132, t, smooth: false }));
            toolR.setAttribute('d', inkPath(hd, { w: 4, seed: k + 133, t, closed: true, smooth: false }) + ' ' + inkCircle(sX, sY - 270 + toolY, 46, k + 134, t, { w: 4 }) + ' ' + inkPath(tb, { w: 4, seed: k + 135, t, closed: true, smooth: false }));
          } else { tool.setAttribute('d', ''); toolH.setAttribute('d', ''); toolR.setAttribute('d', ''); }
          // foreground: big crates + a bollard (bottom edge)
          crateAt(0.2 * W, H + 60 * u, 470 * u, 330 * u, 7, t, k + 100, -0.03);
          crateAt(0.6 * W, H + 90 * u, 420 * u, 300 * u, 8, t, k + 100, 0.02);
          crateAt(0.36 * W, H - 210 * u, 360 * u, 220 * u, 9, t, k + 100, 0.01);
          const bl = [0.9 * W, H - 60 * u];
          fore.setAttribute('d', inkLoop([[bl[0] - 70 * u, H + 30], [bl[0] - 60 * u, bl[1] - 120 * u], [bl[0] - 90 * u, bl[1] - 150 * u], [bl[0] + 90 * u, bl[1] - 150 * u], [bl[0] + 60 * u, bl[1] - 120 * u], [bl[0] + 70 * u, H + 30]], { seed: k + 140, t, smooth: false }));
          foreF.setAttribute('d', inkPath([[bl[0] - 80 * u, bl[1] - 132 * u], [bl[0] + 80 * u, bl[1] - 132 * u]], { w: 5, seed: k + 141, t }));
          const cc = [0.12 * W, H - 90 * u];
          coil.setAttribute('d', ''); coilR.setAttribute('d', '');
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
