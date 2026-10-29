// gal_a_bridge: "then and now" split (02-galileo-teleskop): on the left a dark night panel with a big cratered Moon
// (GAL.moon), a lunar horizon at the bottom and a modern lunar orbiter (gold body, blue solar panels, a red flag with a
// crescent and star) gliding along a dashed orbit; a torn paper edge; on the right a plain room strip with a plank floor
// where the narrator holds a 1609 spyglass and two round lenses float up and glint. Use with "set": false.
// P: {moon: {x, y (0..1), r (px), term, rough}, craft: {at, rx, ry, flag: true, label: "2027"}, tube: {at}, lenses: {at},
//     split: 0.6 (x of the torn edge, 0..1), kasif: GAL.person}
// cues: craft.at, tube.at, lenses.at, person cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  function crescentStar(cx, cy, r) {   // a crescent + five-point star (flag emblem) as two closed point lists
    const cr = [];
    for (let i = 0; i <= 12; i++) { const a = -2.2 + i / 12 * 4.4; cr.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    for (let i = 12; i >= 0; i--) { const a = -1.9 + i / 12 * 3.8; cr.push([cx + r * 0.32 + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8]); }
    const st = [], sx = cx + r * 1.15, sy = cy;
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI * 2, rr = i % 2 ? r * 0.18 : r * 0.42; st.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); }
    return [cr, st];
  }
  SH.gal_a_bridge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 31, split = (P.split ?? 0.6) * W;
      const root = el(svg, 'g');
      const roomF = inkEl(root, mix(INK.paper, INK.paperDark, 0.5)), roomT = inkEl(root, INK.inkSoft), floorF = inkEl(root, mix(INK.stain, INK.paperDark, 0.4)), floorL = inkEl(root, INK.inkSoft);
      const space = inkEl(root, mix(INK.ink, INK.blue, 0.3)), edge = inkEl(root, INK.paperLight), edgeL = inkEl(root);
      const stars = G.stars(root, sd + 1, 40);
      const orbB = inkEl(root, INK.paperLight, { 'fill-opacity': 0.5 });
      const moon = G.moon(root, sd + 2);
      const horF = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), horL = inkEl(root, INK.ink);
      const orbF = inkEl(root, INK.paperLight, { 'fill-opacity': 0.8 });
      const cg = el(root, 'g');
      const panel = inkEl(cg, mix(INK.blue, INK.ink, 0.15)), panelL = inkEl(cg, INK.paperLight), body = inkEl(cg, INK.gold), flag = inkEl(cg, INK.red), emb = inkEl(cg, INK.paperLight), cl = inkEl(cg);
      const tag = P.craft && P.craft.label ? G.label(root, { text: P.craft.label, x: 0.5, y: 0.17, at: P.craft.at, size: 88, font: 'serif', color: 'gold', underline: false }, W, H, sd + 3) : null;
      const frF = inkEl(root, mix(INK.stain, INK.ink, 0.3)), frP = inkEl(root, INK.paperLight), frL = inkEl(root);
      const frMoon = G.moon(root, sd + 9);
      const lensF = inkEl(root, mix(INK.blue, INK.paperLight, 0.55)), lensG = inkEl(root, INK.paperLight), lensL = inkEl(root);
      const kas = P.kasif ? G.person(root, Object.assign({ who: 'kasif', y: 0.86 }, P.kasif), sd + 10) : null;
      const q = rng(inkHash(sd, 5)), CR = Array.from({ length: 9 }, () => [q(), q()]);
      return {
        update(lt, dur, cues, env) {
          const t = env.t, gy = 0.86 * H;
          // right: room wall + floor
          roomF.setAttribute('d', inkLoop([[split - 60, -40], [W + 40, -40], [W + 40, gy], [split - 60, gy]], { seed: sd + 20, t, amp: 0.4, smooth: false }));
          let rt = ''; for (let x = split + 60; x < W; x += 130) rt += G.line([[x, -40], [x + 3, gy]], sd + 21 + x, t, 1.8) + ' ';
          roomT.setAttribute('d', rt);
          floorF.setAttribute('d', inkLoop([[split - 60, gy], [W + 40, gy], [W + 40, H + 40], [split - 60, H + 40]], { seed: sd + 22, t, amp: 0.4, smooth: false }));
          let fl = G.line([[split - 60, gy], [W + 40, gy]], sd + 23, t, 6) + ' ';
          for (let k = -4; k <= 6; k++) fl += G.line([[split + 300 + k * 110, gy], [split + 300 + k * 230, H + 40]], sd + 24 + k, t, 2.2) + ' ';
          floorL.setAttribute('d', fl);
          // right wall: a framed old Moon engraving
          const fx = split + 0.13 * W, fy = 0.36 * H, fw = 0.1 * W, fh = 0.24 * H;
          const fo = [[fx - fw - 26, fy - fh - 26], [fx + fw + 26, fy - fh - 26], [fx + fw + 26, fy + fh + 26], [fx - fw - 26, fy + fh + 26]], fi = [[fx - fw, fy - fh], [fx + fw, fy - fh], [fx + fw, fy + fh], [fx - fw, fy + fh]];
          frF.setAttribute('d', inkLoop(fo, { seed: sd + 90, t, amp: 0.4, smooth: false }));
          frP.setAttribute('d', inkLoop(fi, { seed: sd + 91, t, amp: 0.4, smooth: false }));
          frL.setAttribute('d', G.ring(fo, sd + 92, t, 4, 0.4) + ' ' + G.ring(fi, sd + 93, t, 3, 0.4) + ' ' + G.line([[fx - fw * 0.7, fy + fh * 0.85], [fx + fw * 0.7, fy + fh * 0.85]], sd + 94, t, 2.4));
          frMoon.update(t, { x: fx, y: fy - 10, r: fw * 0.78, term: 0.2, rough: 1, halo: false, shade: 0.6 });
          // left: space panel with a torn edge
          const tear = []; for (let i = 0; i <= 18; i++) { const y = -40 + i * (H + 80) / 18; tear.push([split + (i % 2 ? 18 : -14) + Math.sin(i * 1.7) * 10, y]); }
          const sp = [[-40, -40]].concat(tear, [[-40, H + 40]]);
          space.setAttribute('d', inkLoop(sp, { seed: sd + 25, t, amp: 0.8, smooth: false }));
          edge.setAttribute('d', G.line(tear, sd + 26, t, 14, 1.4, 0));
          edgeL.setAttribute('d', G.line(tear.map(p => [p[0] + 8, p[1]]), sd + 27, t, 3, 1.2, 0));
          stars.update(t, 0, 0, split - 40, H * 0.75, 1);
          const M = P.moon || {}, mx = (M.x ?? 0.33) * W, my = (M.y ?? 0.4) * H, mr = M.r ?? 260;
          moon.update(t, { x: mx, y: my, r: mr, term: M.term ?? 0.15, rough: M.rough ?? 1, spin: 0.6 });
          // lunar horizon (foreground of the left panel)
          const hz = []; for (let i = 0; i <= 12; i++) { const x = -40 + i * (split + 40) / 12; hz.push([x, H * 0.84 + Math.sin(i * 1.3) * 14 - Math.sin(i * 0.5) * 20]); }
          horF.setAttribute('d', inkLoop(hz.concat([[split + 10, H + 40], [-40, H + 40]]), { seed: sd + 28, t, amp: 0.6, smooth: false }));
          let hl = G.line(hz, sd + 29, t, 5) + ' ';
          CR.forEach((c, i) => { const x = c[0] * (split - 80) + 20, y = H * 0.9 + c[1] * 70, r = 20 + c[1] * 26; hl += inkPath(inkEllipsePts(x, y, r, r * 0.35, sd + 30 + i, 10), { w: 3, seed: sd + 30 + i, t, closed: true }) + ' '; });
          horL.setAttribute('d', hl);
          // orbit + craft
          const C = P.craft || {}, ca = G.atOr(cues, C.at, 0), ck = spring(lt, ca, 0.9), rx = C.rx ?? 360, ry = C.ry ?? 110;
          const ptsB = [], ptsF = [];
          for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, p = [mx + Math.cos(a) * rx, my + Math.sin(a) * ry]; (Math.sin(a) < 0 ? ptsB : ptsF).push([p, a]); }
          const dash = list => list.filter((_, i) => i % 2 === 0).map(([p, a], i) => inkDot(p[0], p[1], 5, 3, sd + 40 + i, t)).join(' ');
          const show = lt >= ca - 0.3;
          orbB.setAttribute('d', show ? dash(ptsB) : ''); orbF.setAttribute('d', show ? dash(ptsF) : '');
          const a = 0.6 + (lt - ca) * 0.35, px = mx + Math.cos(a) * rx, py = my + Math.sin(a) * ry, s = 1.15 * Math.max(0.01, ck) * (0.85 + 0.15 * Math.sin(a));
          cg.setAttribute('transform', `translate(${G.f1(px)} ${G.f1(py)}) scale(${G.f1(s * 100) / 100}) rotate(${G.f1(Math.sin(t * 0.6) * 6)})`);
          cg.style.display = lt < ca ? 'none' : '';
          const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
          const pl = R4(-150, -18, -50, 18), pr = R4(50, -18, 150, 18), bd = R4(-46, -38, 46, 38), fl2 = R4(-30, -98, 26, -66);
          panel.setAttribute('d', inkLoop(pl, { seed: sd + 60, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(pr, { seed: sd + 61, t, amp: 0.4, smooth: false }));
          panelL.setAttribute('d', [-125, -100, -75, 75, 100, 125].map((x, i) => G.line([[x, -16], [x, 16]], sd + 62 + i, t, 2)).join(' '));
          body.setAttribute('d', inkLoop(bd, { seed: sd + 70, t, amp: 0.4, smooth: false }));
          flag.setAttribute('d', C.flag === false ? '' : inkLoop(fl2, { seed: sd + 71, t, amp: 0.3, smooth: false }));
          const [cr, st] = crescentStar(-8, -82, 9);
          emb.setAttribute('d', C.flag === false ? '' : inkLoop(cr, { seed: sd + 72, t, amp: 0.2, smooth: false }) + ' ' + inkLoop(st, { seed: sd + 73, t, amp: 0.2, smooth: false }));
          cl.setAttribute('d', [pl, pr, bd].map((p, i) => G.ring(p, sd + 80 + i, t, 3.5, 0.4)).join(' ') + ' ' + G.line([[-50, 0], [-46, 0]], sd + 84, t, 4) + ' ' + G.line([[46, 0], [50, 0]], sd + 85, t, 4) +
            ' ' + G.line([[-30, -38], [-30, -98]], sd + 86, t, 3) + ' ' + inkPath(inkEllipsePts(20, 52, 26, 12, sd + 87, 10), { w: 3, seed: sd + 87, t, closed: true }) + ' ' + G.line([[20, 38], [20, 52]], sd + 88, t, 3));
          if (tag) tag.update(lt, t, cues);
          // narrator + the two lenses
          const res = kas ? kas.update(lt, t, cues, W, H) : null;
          const la = G.atOr(cues, (P.lenses || {}).at, null);
          if (la != null && lt >= la && res) {
            const hx = res.hands.length ? res.hands.slice().sort((p, q2) => q2[1] - p[1])[1][0] : res.x, base = res.head[1] - 120;
            let lf = '', lg = '', ll = '';
            [-1, 1].forEach((k, i) => {
              const sp2 = spring(lt, la + i * 0.25, 0.8), x = res.x + k * 120, y = base - 30 * sp2 + Math.sin(t * 2 + i) * 6, r = 58 * sp2;
              if (r < 1) return;
              lf += inkLoop(inkEllipsePts(x, y, r * 0.42, r, sd + 90 + i, 14), { seed: sd + 90 + i, t, amp: 0.4 }) + ' ';
              lg += inkDot(x - r * 0.12, y - r * 0.4, r * 0.08, r * 0.22, sd + 92 + i, t) + ' ';
              ll += inkPath(inkEllipsePts(x, y, r * 0.42, r, sd + 94 + i, 14), { w: 4, seed: sd + 94 + i, t, closed: true }) + ' ';
            });
            lensF.setAttribute('d', lf); lensG.setAttribute('d', lg); lensL.setAttribute('d', ll);
            void hx;
          } else { lensF.setAttribute('d', ''); lensG.setAttribute('d', ''); lensL.setAttribute('d', ''); }
        },
      };
    },
  };
})();
