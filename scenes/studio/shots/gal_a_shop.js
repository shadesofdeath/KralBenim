// gal_a_shop + gal_a_fair (02-galileo-teleskop, Holland 1608): the spectacle-maker's shop and the fairground stall.
// Parchment ink style, palette tokens only, pure function of (seed, lt). Uses gal__lib.js (GAL.room, GAL.table, GAL.person).
//
// SHOTS.gal_a_shop — "set": false (paints its own room). A wood-panelled shop: leaded window, shelves of lenses and
//   spectacles, a counter whose front runs to the frame bottom; the cast stands behind it.
//   mode "shop": the spectacle-maker behind the counter, a petition sheet ("PATENT?") pops up on the counter.
//   mode "bench": (frame it with a close camera on [~980, ~640]) a short tube lies on the counter, two lenses float down
//     and click into its ends on `assemble`; the petition lies beside it and a red stamp slams on it on `paper.stamp`;
//     on `copies.at` the same tube multiplies along the counter (n).
//   P: {mode, paper: {text: "PATENT?", at, stamp: cue, stamp_text: "RED"}, assemble: cue, copies: {at, n: 5},
//       cast: [GAL.person], kasif, labels}
//
// SHOTS.gal_a_fair — over "set": "city" (ground ≈ 870). A fair stall with a striped awning on poles, spyglasses
//   hanging from its edge on strings and swinging, a hanging sign, bunting across the top, a row of crowd heads in
//   the near foreground (down to the frame bottom). P: {sign: {text, at}, cast: [GAL.person], kasif, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const TUBE = () => mix(INK.red, INK.ink, 0.45);
  function tubePts(x, y, len, r0, r1, ang = 0) {
    const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [x + u * c - v * s, y + u * s + v * c];
    return [P(-len / 2, -r0), P(len / 2, -r1), P(len / 2, r1), P(-len / 2, r0)];
  }

  SH.gal_a_shop = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 41, mode = P.mode || 'shop', bench = mode === 'bench';
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const specs = inkEl(root, INK.ink);
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((m, i) => G.person(castG, Object.assign({ y: 0.86 }, m), sd + 10 + i * 7));
      const kas = P.kasif ? G.person(castG, Object.assign({ who: 'kasif', y: 0.86 }, P.kasif), sd + 30) : null;
      const table = G.table(el(root, 'g'), sd + 2);
      const propG = el(root, 'g');
      const tubeF = inkEl(propG, TUBE()), tubeB = inkEl(propG, INK.gold), tubeL = inkEl(propG);
      const paperF = inkEl(propG, INK.paperLight), paperL = inkEl(propG);
      const ptx = el(propG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': bench ? 64 : 50, 'text-anchor': 'middle', fill: INK.ink });
      ptx.textContent = (P.paper && P.paper.text) || 'PATENT?';
      const glassF = inkEl(propG, mix(INK.blue, INK.paperLight, 0.5)), glassL = inkEl(propG), glint = inkEl(propG, INK.paperLight);
      const stampG = el(propG, 'g'), stampF = inkEl(stampG, INK.red);
      const stx = el(stampG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 96, 'text-anchor': 'middle', fill: INK.paperLight });
      stx.textContent = (P.paper && P.paper.stamp_text) || 'RED';
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      const tableY = bench ? 0.76 * H : 0.8 * H;
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          room.update(t, W, H, { gy: 0.78 * H, kind: 'wood', window: { x: 0.06, y: 0.14, w: 0.16, h: 0.42, view: 'roofs' },
            shelves: [{ x: 0.3, y: 0.24, w: 0.26 }, { x: 0.62, y: 0.24, w: 0.3 }, { x: 0.62, y: 0.42, w: 0.3 }] });
          // spectacles hanging under the shelves
          let sp = '';
          for (let i = 0; i < 6; i++) { const x = 0.33 * W + i * 92 + (i > 2 ? 520 : 0), y = 0.3 * H + Math.sin(t * 1.5 + i) * 3; sp += inkCircle(x - 18, y, 16, sd + 60 + i, t, { w: 3 }) + ' ' + inkCircle(x + 18, y, 16, sd + 70 + i, t, { w: 3 }) + ' ' + G.line([[x - 2, y], [x + 2, y]], sd + 80 + i, t, 3) + ' '; }
          specs.setAttribute('d', sp);
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          table.update(t, { x0: 0.18 * W, x1: 0.98 * W, y: tableY, depth: bench ? 110 : 80, H });
          const topY = tableY - (bench ? 55 : 40);
          // petition sheet
          const pa = P.paper ? G.atOr(cues, P.paper.at, 0) : null;
          if (pa != null && lt >= pa) {
            const k = spring(lt, pa, 0.7), px = bench ? 0.66 * W : 0.66 * W, py = topY - 6, w = (bench ? 300 : 230) * k, h = (bench ? 120 : 90) * k;
            const pts = [[px - w / 2, py - h / 2 - 8], [px + w / 2, py - h / 2], [px + w / 2 + 14, py + h / 2], [px - w / 2 + 10, py + h / 2 + 4]];
            paperF.setAttribute('d', inkLoop(pts, { seed: sd + 90, t, amp: 0.5, smooth: false }));
            paperL.setAttribute('d', G.ring(pts, sd + 91, t, 3.5, 0.5));
            ptx.setAttribute('x', G.f1(px + 6)); ptx.setAttribute('y', G.f1(py + (bench ? 22 : 18)));
            ptx.setAttribute('transform', `rotate(-3 ${G.f1(px)} ${G.f1(py)})`);
            ptx.style.display = k > 0.6 ? '' : 'none';
            const sa = G.atOr(cues, P.paper.stamp, null);
            if (sa != null && lt >= sa) {
              const sk = 1 + 1.4 * Math.exp(-(lt - sa) * 9), sw = 250, sh = 120;
              stampG.style.display = '';
              stampG.setAttribute('transform', `translate(${G.f1(px)} ${G.f1(py - 6)}) rotate(-12) scale(${G.f1(sk * 100) / 100})`);
              stampF.setAttribute('d', G.ring([[-sw / 2, -sh / 2], [sw / 2, -sh / 2], [sw / 2, sh / 2], [-sw / 2, sh / 2]], sd + 92, t, 12, 1) + ' ' + inkLoop([[-sw / 2 + 16, -sh / 2 + 16], [sw / 2 - 16, -sh / 2 + 16], [sw / 2 - 16, sh / 2 - 16], [-sw / 2 + 16, sh / 2 - 16]], { seed: sd + 93, t, amp: 1, smooth: false }));
              stx.setAttribute('x', 0); stx.setAttribute('y', 34);
            } else stampG.style.display = 'none';
          } else { paperF.setAttribute('d', ''); paperL.setAttribute('d', ''); ptx.style.display = 'none'; stampG.style.display = 'none'; }
          // tubes (bench): one tube, lenses click in, then copies
          let tf = '', tb = '', tl = '', gf = '', gl = '', gg = '';
          if (bench) {
            const ty = topY - 34, tx = 0.42 * W, len = 360, r0 = 26, r1 = 34;
            const ca = P.copies ? G.atOr(cues, P.copies.at, null) : null, n = (P.copies && P.copies.n) || 5;
            const list = [[tx, ty, 0]];
            if (ca != null) for (let i = 1; i < n; i++) { const k = spring(lt, ca + i * 0.18, 0.6); if (lt >= ca + i * 0.18) list.push([tx + (i % 2 ? 1 : -1) * (40 + i * 18) * k + i * 8, ty - 52 * Math.ceil(i / 2) * k, (i % 2 ? 0.05 : -0.05) * k]); }
            list.forEach(([x, y, a], i) => {
              const p = tubePts(x, y, len, r0, r1, a);
              tf += inkLoop(p, { seed: sd + 100 + i, t, amp: 0.5, smooth: false }) + ' ';
              tl += G.ring(p, sd + 120 + i, t, 4, 0.5) + ' ';
              for (const u of [-0.25, 0.1, 0.38]) { const b = tubePts(x + u * len * Math.cos(a), y + u * len * Math.sin(a), 14, r0 + 3, r1 + 3, a); tb += inkLoop(b, { seed: sd + 140 + i * 3 + u * 10, t, amp: 0.3, smooth: false }) + ' '; }
            });
            // lenses float down into the two ends
            const la = G.atOr(cues, P.assemble, 0.3);
            [[-len / 2, r0], [len / 2, r1]].forEach(([dx, r], i) => {
              const k = progIO(lt, la + i * 0.3, 0.9), x = tx + dx + (i ? 6 : -6), y = lerp(ty - 260, ty, k), rr = r * 1.15;
              const e = inkEllipsePts(x, y, rr * 0.36, rr, sd + 160 + i, 12);
              gf += inkLoop(e, { seed: sd + 160 + i, t, amp: 0.3 }) + ' ';
              gl += G.ring(e, sd + 162 + i, t, 3.5, 0.3) + ' ';
              if (k < 1) gg += inkDot(x - 3, y - rr * 0.4, 4, 9, sd + 164 + i, t) + ' ';
              else { const p = punch(lt, la + i * 0.3 + 0.9, 0.5); if (p > 0.05) gg += inkCircle(x, y, rr * (1.3 + (1 - p) * 0.8), sd + 166 + i, t, { w: 3 }) + ' '; }
            });
          }
          tubeF.setAttribute('d', tf); tubeB.setAttribute('d', tb); tubeL.setAttribute('d', tl);
          glassF.setAttribute('d', gf); glassL.setAttribute('d', gl); glint.setAttribute('d', gg);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  SH.gal_a_fair = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 61, gy = 0.8 * H;
      const root = el(svg, 'g');
      const bunt = inkEl(root, INK.red), buntB = inkEl(root, INK.blue), buntL = inkEl(root);
      const backF = inkEl(root, mix(INK.stain, INK.paperDark, 0.35)), stallF = inkEl(root, mix(INK.stain, INK.ink, 0.3));
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((m, i) => G.person(castG, Object.assign({ y: gy / H }, m), sd + 10 + i * 7));
      const kas = P.kasif ? G.person(castG, Object.assign({ who: 'kasif', y: gy / H }, P.kasif), sd + 30) : null;
      const counterF = inkEl(root, mix(INK.stain, INK.ink, 0.38)), counterL = inkEl(root);
      const awnR = inkEl(root, INK.red), awnW = inkEl(root, INK.paperLight), awnL = inkEl(root), poles = inkEl(root, mix(INK.stain, INK.ink, 0.5));
      const strings = inkEl(root, INK.ink), tubes = inkEl(root, mix(INK.red, INK.ink, 0.45)), tubesL = inkEl(root);
      const signF = inkEl(root, INK.paperLight), signL = inkEl(root);
      const stx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink });
      stx.textContent = (P.sign && P.sign.text) || '';
      const crowdF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.2)), crowdL = inkEl(root);
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      const x0 = 0.26 * W, x1 = 0.74 * W, ay = 0.3 * H;
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // bunting across the top
          let bf = '', bb = '', bl = '';
          for (let row = 0; row < 2; row++) {
            const y0 = 70 + row * 60, sag = 40;
            const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([-40 + u * (W + 80), y0 + Math.sin(u * Math.PI) * sag + Math.sin(t + u * 6) * 3]); }
            bl += G.line(pts, sd + 1 + row, t, 3) + ' ';
            for (let i = 1; i < 20; i += 1) { const a = pts[i], b = pts[i + 1] || pts[i], tip = [(a[0] + b[0]) / 2 + Math.sin(t * 2 + i) * 4, a[1] + 54]; const f = inkLoop([a, b, tip], { seed: sd + 10 + row * 30 + i, t, amp: 0.5, smooth: false }) + ' '; if ((i + row) % 2) bf += f; else bb += f; }
          }
          bunt.setAttribute('d', bf); buntB.setAttribute('d', bb); buntL.setAttribute('d', bl);
          // stall back cloth and frame
          backF.setAttribute('d', inkLoop([[x0, ay], [x1, ay], [x1, gy - 60], [x0, gy - 60]], { seed: sd + 70, t, amp: 0.5, smooth: false }));
          stallF.setAttribute('d', '');
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          // counter in front of the seller (between the poles)
          const cy = 0.68 * H, cp = [[x0 + 30, cy], [x1 - 30, cy], [x1 - 30, gy + 4], [x0 + 30, gy + 4]];
          counterF.setAttribute('d', inkLoop(cp, { seed: sd + 71, t, amp: 0.5, smooth: false }));
          let cl = G.ring(cp, sd + 72, t, 5, 0.5); for (let x = x0 + 120; x < x1 - 60; x += 110) cl += ' ' + G.line([[x, cy + 10], [x + 2, gy]], sd + 73 + x, t, 2.4);
          counterL.setAttribute('d', cl);
          // poles + striped awning (scalloped edge, flutters)
          poles.setAttribute('d', G.line([[x0 + 10, ay - 40], [x0 + 14, gy + 6]], sd + 80, t, 16) + ' ' + G.line([[x1 - 10, ay - 40], [x1 - 14, gy + 6]], sd + 81, t, 16));
          let ar = '', aw = '', al = '';
          const n = 10, top = ay - 110, bot = ay;
          for (let i = 0; i < n; i++) {
            const u0 = i / n, u1 = (i + 1) / n, fl = Math.sin(t * 2.4 + i) * 5;
            const p = [[lerp(x0 - 40, x1 + 40, u0), top + 10], [lerp(x0 - 40, x1 + 40, u1), top + 10], [lerp(x0 - 70, x1 + 70, u1), bot + fl], [lerp(x0 - 70, x1 + 70, (u0 + u1) / 2), bot + 36 + fl], [lerp(x0 - 70, x1 + 70, u0), bot + fl]];
            const f = inkLoop(p, { seed: sd + 90 + i, t, amp: 0.5, smooth: false }) + ' ';
            if (i % 2) aw += f; else ar += f;
            al += G.ring(p, sd + 110 + i, t, 3.5, 0.5) + ' ';
          }
          awnR.setAttribute('d', ar); awnW.setAttribute('d', aw); awnL.setAttribute('d', al);
          // spyglasses hanging from the awning on strings, swinging
          let st = '', tb = '', tl = '';
          for (let i = 0; i < 5; i++) {
            const hx = lerp(x0 + 60, x1 - 60, (i + 0.5) / 5), hy = bot + 30, sw = Math.sin(t * 1.6 + i * 1.3) * 0.12, L = 90 + (i % 2) * 40;
            const ex = hx + Math.sin(sw) * L, ey = hy + Math.cos(sw) * L;
            st += G.line([[hx, hy], [ex, ey]], sd + 130 + i, t, 2.4) + ' ';
            const p = tubePts(ex, ey + 14, 150, 11, 16, 0.25 + sw);
            tb += inkLoop(p, { seed: sd + 140 + i, t, amp: 0.4, smooth: false }) + ' '; tl += G.ring(p, sd + 150 + i, t, 3, 0.4) + ' ';
          }
          strings.setAttribute('d', st); tubes.setAttribute('d', tb); tubesL.setAttribute('d', tl);
          // hanging sign on the awning
          const sa = P.sign ? G.atOr(cues, P.sign.at, 0) : null;
          if (sa != null && lt >= sa) {
            const k = spring(lt, sa, 0.8), sx = 0.5 * W, sy = top - 30, w = 420 * k, h = 100 * k, rot = Math.sin(t * 1.2) * 2;
            const p = [[sx - w / 2, sy - h / 2], [sx + w / 2, sy - h / 2 - 4], [sx + w / 2 + 4, sy + h / 2], [sx - w / 2, sy + h / 2 + 2]];
            signF.setAttribute('d', inkLoop(p, { seed: sd + 160, t, amp: 0.5, smooth: false }));
            signL.setAttribute('d', G.ring(p, sd + 161, t, 4, 0.5));
            stx.setAttribute('x', sx); stx.setAttribute('y', sy + 20); stx.setAttribute('transform', `rotate(${G.f1(rot)} ${sx} ${sy})`);
            stx.style.display = k > 0.6 ? '' : 'none';
          } else { signF.setAttribute('d', ''); signL.setAttribute('d', ''); stx.style.display = 'none'; }
          // crowd heads in the near foreground
          let cf = '', cl2 = '';
          for (let i = 0; i < 11; i++) {
            const x = -60 + i * 200 + (i % 2) * 40, bob = Math.sin(t * 2 + i * 1.7) * 6, r = 70 + (i % 3) * 14, y = H - 70 + bob + (i % 2) * 30;
            const body = [[x - r * 1.5, H + 40], [x - r * 1.3, y + r * 0.9], [x + r * 1.3, y + r * 0.9], [x + r * 1.5, H + 40]];
            cf += inkLoop(body, { seed: sd + 170 + i, t, amp: 0.6 }) + ' ' + inkLoop(inkEllipsePts(x, y, r, r * 1.05, sd + 190 + i, 12), { seed: sd + 190 + i, t, amp: 0.6 }) + ' ';
            cl2 += G.ring(inkEllipsePts(x, y, r, r * 1.05, sd + 190 + i, 12), sd + 200 + i, t, 4, 0.6) + ' ';
            if (i % 3 === 0) cl2 += inkLoop([[x - r * 1.1, y - r * 0.55], [x + r * 1.1, y - r * 0.55], [x + r * 0.6, y - r * 1.2], [x - r * 0.6, y - r * 1.2]], { seed: sd + 210 + i, t, amp: 0.5 }) + ' ';
          }
          crowdF.setAttribute('d', cf); crowdL.setAttribute('d', cl2);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
