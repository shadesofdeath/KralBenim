// sky_props: paper props for the Stickstory long video "Skylab fell on Esperance" (2026-10-26), parametric for any
// "newspaper prize", "bullseye craze" or "fine / ticket" moment. Parchment ink (brand/kit/BRAND.md §3, §5): every
// line boils at 8 Hz, palette tokens only, pure function of (seed, lt). Uses sky__lib.js (SKY) and td__lib.js (TD).
//
// SHOTS.sky_paper P: {masthead: "EXAMINER", headline: "$10,000", sub: "first piece wins" (<= 3 words),
//   x: 0.42, y: 0.5, s: 1, at: cue|sec (paper flies in, spins, lands), clock: {x: 0.8, y: 0.42, text: "72 h", at} | false,
//   chunk: {x, y, at} | false (a charred fragment drops onto the page), labels, kasif, cam}
//   cues: hit, at, clock.at, chunk.at, label / seq names
// SHOTS.sky_target P: {mode: "shirt" | "ground",
//   shirt: clothesline with T-shirts printed with bullseyes (shirts: 2) that swing in the wind; hit: cue -> a red
//          dashed arrow from the sky lands on the middle of a bullseye,
//   ground: a field with a huge painted target in perspective, little houses around, painters (cast) with rollers;
//           falling: cue -> a tiny ink station with a dashed trail drops toward the centre and stops above it,
//   labels, kasif, cast, cam}   cues: hit, falling, label / seq names
// SHOTS.sky_fine P: {mode: "write" | "years" | "paid",
//   ticket: {x: 0.5, y: 0.45, s: 0.85, rot: -4, title: "LITTERING", amount: "$400", to: "NASA", amount_color: "ink"|"red"},
//   chunk: {x: 0.78, y: 0.7, s: 1.4, rot: 10, at} | false (a smoking space-debris fragment beside the ticket),
//   write: cue (a pen scribbles the signature and amount underline), stamp: {text, color: "red"|"green", at, y: 210 (ticket units)},
//   years: {from: 1979, to: 2009, at, dur: 3, x: 0.8, y: 0.3} (big counter + cobweb in the ticket corner),
//   radio: {x: 0.17, y: 0.55} (paid mode: microphone with sound arcs), coins: {at, n: 8, x: 0.5, y: 0.72} (coins drop into
//   a jar under the ticket), labels, kasif, cam}   cues: hit, write, stamp.at, years.at, coins.at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const txt = (g, size, opts = {}) => el(g, 'text', Object.assign({ 'font-family': opts.hand ? INK_FONT : FR, 'font-weight': opts.hand ? 400 : 900, 'font-size': size, 'text-anchor': 'middle', fill: opts.fill || INK.ink }, opts.attrs || {}));
  function camT(cam, lt, dur, W, H, zoom, hit, shake = 0) {
    const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    cam.setAttribute('transform', `translate(${(W / 2 + shake).toFixed(1)} ${(H * 0.5).toFixed(1)}) scale(${z.toFixed(4)}) translate(${(-W / 2).toFixed(1)} ${(-H * 0.5).toFixed(1)})`);
  }
  function bullseye(pen, cx, cy, r, ry, sd, t) {
    for (let k = 0; k < 4; k++) {
      const rr = r * (1 - k * 0.24), col = k % 2 ? INK.paperLight : INK.red;
      SKY.shape(pen, SKY.ell(cx, cy, rr, rr * ry, 16), col, sd + k * 2, t, { w: 4, smooth: true });
    }
  }

  // ------------------------------------------------------------------ newspaper
  SH.sky_paper = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, sd = seed * 1000 + 501;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const pg = el(cam, 'g'), pen = SKY.mkPen(pg);
      const mast = txt(pg, 74), head = txt(pg, 190, { fill: INK.red }), sub = txt(pg, 64, { hand: true });
      mast.textContent = P.masthead || 'EXAMINER'; head.textContent = P.headline || '$10,000'; sub.textContent = P.sub || '';
      const ckG = el(cam, 'g'), ck = SKY.mkPen(ckG), ckT = txt(ckG, 70, { fill: INK.red });
      const CK = P.clock ? Object.assign({ x: 0.8, y: 0.42, text: '72 h' }, P.clock) : null; if (CK) ckT.textContent = CK.text;
      const chG = el(cam, 'g'), chunk = P.chunk ? SKY.chunk(chG, sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.12, y: 0.94, scale: 0.7, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 7) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, TD.atOr(cues, 'hit', null), 0.6);
          camT(cam, lt, dur, W, H, (P.cam && P.cam.zoom) || 1.06, hit);
          const a = TD.atOr(cues, P.at, 0), p = lt >= a ? spring(lt, a, 0.9) : 0;
          const s = (P.s ?? 1) * lerp(0.3, 1, p), x = (P.x ?? 0.42) * W, y = (P.y ?? 0.5) * H, rot = lerp(-200, -3, p) + Math.sin(lt * 0.8) * 1;
          pg.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`);
          pg.setAttribute('opacity', clamp01(p * 4).toFixed(3));
          pen.begin();
          const w = 760, h = 640;
          SKY.shape(pen, [[-w / 2, -h / 2], [w / 2, -h / 2 - 6], [w / 2 + 4, h / 2], [-w / 2 - 3, h / 2 + 4]], INK.paperLight, sd + 1, t, { w: 6 });
          SKY.line(pen, [[-w / 2 + 30, -h / 2 + 120], [w / 2 - 30, -h / 2 + 116]], sd + 3, t, 5);
          SKY.line(pen, [[-w / 2 + 30, -h / 2 + 132], [w / 2 - 30, -h / 2 + 128]], sd + 4, t, 2.5);
          for (let k = 0; k < 6; k++) { const yy = 150 + k * 26; SKY.line(pen, [[-w / 2 + 40, yy], [-30 - (k % 2) * 40, yy]], sd + 10 + k, t, 3, INK.inkSoft); SKY.line(pen, [[30, yy], [w / 2 - 40 - (k % 3) * 30, yy]], sd + 20 + k, t, 3, INK.inkSoft); }
          pen.end();
          mast.setAttribute('y', -h / 2 + 95); head.setAttribute('y', 40); sub.setAttribute('y', 120);
          const hp = punch(lt, a + 0.6, 0.6); head.setAttribute('transform', `scale(${(1 + 0.08 * hp).toFixed(3)})`);
          ck.begin();
          if (CK) {
            const ca = TD.atOr(cues, CK.at, 0.5), cp = lt >= ca ? spring(lt, ca, 0.6) : 0, cx = CK.x * W, cy = CK.y * H, r = 120 * cp;
            if (cp > 0.01) {
              SKY.shape(ck, SKY.ell(cx, cy, r, r, 16), INK.paperLight, sd + 40, t, { w: 7, smooth: true });
              SKY.shape(ck, [[cx - 22 * cp, cy - r - 10], [cx + 22 * cp, cy - r - 10], [cx + 22 * cp, cy - r - 36 * cp], [cx - 22 * cp, cy - r - 36 * cp]], INK.inkSoft, sd + 42, t);
              const ang = -Math.PI / 2 + (lt - ca) * 2.2;
              SKY.line(ck, [[cx, cy], [cx + Math.cos(ang) * r * 0.75, cy + Math.sin(ang) * r * 0.75]], sd + 44, t, 7, INK.red);
              ck.fill(inkDot(cx, cy, 10, 10, sd + 46, t), INK.ink);
            }
            ckT.setAttribute('x', f1(cx)); ckT.setAttribute('y', f1(cy + r + 80)); ckT.setAttribute('opacity', cp.toFixed(3));
          }
          ck.end();
          if (chunk) { const ca = TD.atOr(cues, P.chunk.at, 1), q = lt >= ca ? prog(lt, ca, 0.5) : 0; chunk.update(t, P.chunk.x * W, lerp(-200, P.chunk.y * H, q), q > 0 ? 0.9 : 0.01, 15, 1); }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bullseye craze
  SH.sky_target = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, sd = seed * 1000 + 551;
      const root = el(svg, 'g'), cam = el(root, 'g'), g = el(cam, 'g'), pen = SKY.mkPen(g);
      const fg = el(cam, 'g'), fpen = SKY.mkPen(fg);
      const stG = el(cam, 'g'), sta = P.mode === 'ground' ? SKY.station(stG, sd + 5) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const cast = (P.cast || []).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ hat: false, scale: 0.55, pose: 'hold', face: 'right' }, K), sd + 50 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.86, y: 0.94, scale: 0.75, pose: 'point', face: 'left', dir: 20 }, P.kasif), sd + 7) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, TD.atOr(cues, 'hit', null), 0.6);
          camT(cam, lt, dur, W, H, (P.cam && P.cam.zoom) || 1.06, hit);
          pen.begin(); fpen.begin();
          if (P.mode === 'ground') {
            const gy = 0.42 * H;
            SKY.line(pen, [[0, gy], [W, gy + 4]], sd + 1, t, 5);
            for (let k = 0; k < 6; k++) {         // little houses on the horizon
              const x = 80 + k * 330, hw = 110, hh = 70;
              SKY.shape(pen, [[x, gy], [x, gy - hh], [x + hw / 2, gy - hh - 45], [x + hw, gy - hh], [x + hw, gy]], INK.paperLight, sd + 10 + k * 2, t);
            }
            for (let k = 0; k < 10; k++) { const x = (k * 211) % W; SKY.line(pen, [[x, gy + 60 + (k % 4) * 110], [x + 50, gy + 58 + (k % 4) * 110]], sd + 40 + k, t, 3, INK.inkSoft); }
            const tp = TD.atOr(cues, P.paint, 0), pp = lt >= tp ? prog(lt, tp, 1.2) : 1;
            bullseye(pen, W * 0.5, 0.7 * H, 520 * lerp(0.3, 1, pp), 0.32, sd + 60, t);
            const fa = TD.atOr(cues, P.falling, null);
            if (sta) {
              const q = fa != null && lt >= fa ? progIO(lt, fa, 2.2) : 0;
              const sx = lerp(W * 0.8, W * 0.52, q), sy = lerp(H * 0.08, H * 0.36, q);
              sta.update(t, { x: sx, y: sy, s: 0.16, rot: -20 + lt * 6, lights: 0.4 });
              if (q > 0.02) for (let k = 0; k < 6; k++) { const u = k / 6; if (u < q) SKY.line(fpen, [[lerp(W * 0.95, sx, u), lerp(-H * 0.05, sy, u)], [lerp(W * 0.95, sx, u + 0.07), lerp(-H * 0.05, sy, u + 0.07)]], sd + 80 + k, t, 6, INK.red); }
            }
          } else {
            const ly = 0.2 * H, sway = Math.sin(lt * 1.6) * 6;
            SKY.line(pen, [[0, ly], [W * 0.5, ly + 40], [W, ly]], sd + 1, t, 5, INK.ink, { smooth: true });
            const n = P.shirts ?? 2;
            for (let k = 0; k < n; k++) {
              const cx = W * (n === 1 ? 0.45 : 0.27 + k * 0.36), top = ly + 30 + (k === 0 ? 8 : 4), s = 1.05, sw = sway * (k ? -1 : 1);
              const sh = [[-160, 0], [-60, -10], [-40, 20], [40, 20], [60, -10], [160, 0], [230, 120], [150, 160], [130, 110], [130, 470], [-130, 470], [-130, 110], [-150, 160], [-230, 120]].map(([x, y]) => [cx + x * s + sw * y / 400, top + y * s]);
              SKY.shape(pen, sh, INK.paperLight, sd + 10 + k * 3, t, { w: 6 });
              for (const dx of [-90, 90]) SKY.shape(pen, [[cx + dx - 10, top - 20], [cx + dx + 10, top - 20], [cx + dx + 8, top + 30], [cx + dx - 8, top + 30]], INK.hatBand, sd + 20 + k * 3 + dx, t, { w: 3 });
              bullseye(pen, cx + sway * 0.6 * (k ? -1 : 1), top + 270 * s, 120, 1, sd + 40 + k * 10, t);
            }
            const ha = TD.atOr(cues, P.arrow, null);
            if (ha != null && lt >= ha) {
              const q = progIO(lt, ha, 0.8), cx = W * (n === 1 ? 0.45 : 0.27) + sway * 0.6, cy = ly + 34 + 270 * 1.05;
              for (let k = 0; k < 6; k++) { const u = k / 6; if (u < q) SKY.line(fpen, [[lerp(W * 0.62, cx, u), lerp(-40, cy, u)], [lerp(W * 0.62, cx, u + 0.08), lerp(-40, cy, u + 0.08)]], sd + 80 + k, t, 8, INK.ink); }
            }
          }
          pen.end(); fpen.end();
          labels.forEach(l => l && l.update(lt, t, cues));
          cast.forEach(c => c && c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------------ littering fine
  SH.sky_fine = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, sd = seed * 1000 + 571;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bk = el(cam, 'g'), bpen = SKY.mkPen(bk);
      const T = Object.assign({ x: 0.5, y: 0.45, s: 0.85, rot: -4, title: 'LITTERING', amount: '$400', to: 'NASA', amount_color: 'ink' }, P.ticket || {});
      const CH = P.chunk ? Object.assign({ x: 0.78, y: 0.7, s: 1.4, rot: 10 }, P.chunk) : null, chG = CH ? el(cam, 'g') : null, chunk = CH ? SKY.chunk(chG, sd + 9) : null;
      const tg = el(cam, 'g'), tpen = SKY.mkPen(tg);
      const tTitle = txt(tg, 84), tAmt = txt(tg, 170, { fill: T.amount_color === 'red' ? INK.red : INK.ink }), tTo = txt(tg, 70, { hand: true });
      tTitle.textContent = T.title; tAmt.textContent = T.amount; tTo.textContent = 'to: ' + T.to;
      const top = el(tg, 'g'), topPen = SKY.mkPen(top);
      const stT = P.stamp ? txt(tg, 120, { fill: P.stamp.color === 'green' ? INK.green : INK.red }) : null; if (stT) stT.textContent = P.stamp.text || 'PAID';
      const yrT = P.years ? txt(cam, 150) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.13, y: 0.94, scale: 0.75, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 7) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, TD.atOr(cues, 'hit', null), 0.6);
          const sa = P.stamp ? TD.atOr(cues, P.stamp.at, null) : null;
          const shake = sa != null && lt >= sa && lt < sa + 0.35 ? Math.sin(lt * 90) * 8 * (1 - (lt - sa) / 0.35) : 0;
          camT(cam, lt, dur, W, H, (P.cam && P.cam.zoom) || 1.06, hit, shake);
          // background props (radio + jar) behind the ticket
          bpen.begin();
          if (P.mode === 'paid') {
            const RD = Object.assign({ x: 0.17, y: 0.55 }, P.radio || {}), rx = RD.x * W, ry = RD.y * H;
            SKY.shape(bpen, [[rx - 60, ry - 140], [rx + 60, ry - 140], [rx + 60, ry + 20], [rx - 60, ry + 20]], INK.paperDark, sd + 1, t, { w: 6, smooth: true });
            for (let k = 0; k < 4; k++) SKY.line(bpen, [[rx - 40, ry - 110 + k * 32], [rx + 40, ry - 110 + k * 32]], sd + 3 + k, t, 3, INK.inkSoft);
            SKY.line(bpen, [[rx, ry + 20], [rx, ry + 170]], sd + 10, t, 8); SKY.line(bpen, [[rx - 70, ry + 170], [rx + 70, ry + 170]], sd + 11, t, 8);
            for (let k = 0; k < 3; k++) {
              const ph = (lt * 0.9 + k / 3) % 1, r = 110 + ph * 160, pts = [];
              for (let j = 0; j <= 8; j++) { const a = -0.7 + 1.4 * j / 8; pts.push([rx + Math.cos(a) * r, ry - 60 + Math.sin(a) * r]); }
              SKY.line(bpen, pts, sd + 20 + k, t, 6 * (1 - ph) + 1, INK.blue, { smooth: true });
            }
            const CO = Object.assign({ n: 8, x: 0.5, y: 0.72 }, P.coins || {}), ca = TD.atOr(cues, CO.at, 0.5), jx = CO.x * W, jy = CO.y * H;
            SKY.shape(bpen, [[jx - 110, jy - 150], [jx + 110, jy - 150], [jx + 100, jy + 30], [jx - 100, jy + 30]], INK.paperLight, sd + 30, t, { w: 6, smooth: true });
            for (let k = 0; k < CO.n; k++) {
              const a = ca + k * 0.28; if (lt < a) continue;
              const q = prog(lt, a, 0.45), cx = jx + ((k * 37) % 120) - 60, cy = lerp(-60, jy - 10 - Math.floor(k / 3) * 22, q);
              bpen.fill(inkDot(cx, cy, 30, 12, sd + 40 + k, t), INK.gold); bpen.fill(inkPath(SKY.ell(cx, cy, 30, 12, 10), { w: 3.5, seed: sd + 60 + k, t, closed: true }), INK.ink);
            }
          }
          bpen.end();
          // ticket
          const ta = TD.atOr(cues, P.at, 0), tp = lt >= ta ? spring(lt, ta, 0.8) : 0;
          const tx = T.x * W, ty = T.y * H, s = T.s * lerp(0.4, 1, tp);
          tg.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) rotate(${f1(T.rot + (1 - tp) * 20 + Math.sin(lt * 0.7) * 0.8)}) scale(${s.toFixed(3)})`);
          tg.setAttribute('opacity', clamp01(tp * 4).toFixed(3));
          tpen.begin();
          const w = 600, h = 760;
          const tk = [[-w / 2, -h / 2]]; for (let k = 0; k <= 12; k++) tk.push([-w / 2 + k * w / 12, -h / 2 + (k % 2 ? -14 : 0)]);
          tk.push([w / 2, h / 2]); tk.push([-w / 2, h / 2]);
          SKY.shape(tpen, tk, INK.paperLight, sd + 100, t, { w: 6 });
          SKY.shape(tpen, [[-w / 2 + 20, -h / 2 + 30], [w / 2 - 20, -h / 2 + 30], [w / 2 - 20, -h / 2 + 150], [-w / 2 + 20, -h / 2 + 150]], INK.blue, sd + 102, t, { op: 0.25, w: 4 });
          SKY.line(tpen, [[-w / 2 + 50, 40], [w / 2 - 50, 36]], sd + 104, t, 3, INK.inkSoft);
          const wa = TD.atOr(cues, P.write, null), wp = wa == null ? 1 : (lt >= wa ? prog(lt, wa, 1.2) : 0);
          if (wp > 0.01) {
            const pts = []; for (let k = 0; k <= 24 * wp; k++) { const u = k / 24; pts.push([-200 + u * 400, 310 + Math.sin(u * 30) * 16 - u * 16]); }
            if (pts.length > 1) SKY.line(tpen, pts, sd + 110, t, 5, INK.ink, { smooth: true });
            if (wa != null && wp < 1) {   // pen
              const pe = pts[pts.length - 1];
              SKY.shape(tpen, [[pe[0], pe[1]], [pe[0] + 20, pe[1] - 30], [pe[0] + 120, pe[1] - 170], [pe[0] + 100, pe[1] - 186], [pe[0] - 6, pe[1] - 40]], INK.hatBand, sd + 112, t, { w: 4 });
            }
          }
          tpen.end();
          tTitle.setAttribute('y', -h / 2 + 120); tAmt.setAttribute('y', -20); tTo.setAttribute('y', 120);
          tTitle.setAttribute('fill', INK.ink);
          // years cobweb (unpaid)
          topPen.begin();
          if (P.mode === 'years' && P.years) {
            const ya = TD.atOr(cues, P.years.at, 0.5), yp = lt >= ya ? clamp01((lt - ya) / (P.years.dur ?? 3)) : 0;
            if (yp > 0.05) for (let k = 0; k < 5; k++) { const a = Math.PI * (0.5 + k * 0.12); SKY.line(topPen, [[w / 2, -h / 2], [w / 2 + Math.cos(a) * 200 * yp, -h / 2 + Math.sin(a) * 200 * yp]], sd + 200 + k, t, 2.4, INK.inkSoft); }
            if (yp > 0.3) for (let r = 1; r <= 3; r++) { const pts = []; for (let k = 0; k < 5; k++) { const a = Math.PI * (0.5 + k * 0.12); pts.push([w / 2 + Math.cos(a) * 60 * r * yp, -h / 2 + Math.sin(a) * 60 * r * yp]); } SKY.line(topPen, pts, sd + 220 + r, t, 2.2, INK.inkSoft); }
            const yr = Math.round(lerp(P.years.from ?? 1979, P.years.to ?? 2009, yp));
            yrT.textContent = String(yr);
            const b = boil(sd + 230, t, 1.2), pk = yp >= 1 ? punch(lt, ya + (P.years.dur ?? 3), 0.6) : 0;
            yrT.setAttribute('x', f1((P.years.x ?? 0.82) * W + b[0])); yrT.setAttribute('y', f1((P.years.y ?? 0.32) * H + b[1]));
            yrT.setAttribute('fill', yp >= 1 ? INK.red : INK.ink);
            yrT.setAttribute('opacity', clamp01((lt - ya + 0.3) * 3).toFixed(3));
            yrT.setAttribute('transform', `rotate(-4 ${f1((P.years.x ?? 0.82) * W)} ${f1((P.years.y ?? 0.32) * H)})`);
            yrT.style.fontSize = (150 * (1 + 0.12 * pk)).toFixed(0) + 'px';
          }
          if (sa != null && stT) {
            const sp = lt >= sa ? clamp01((lt - sa) / 0.18) : 0, col = P.stamp.color === 'green' ? INK.green : INK.red;
            if (sp > 0) {
              const bw = 440, bh = 150, sc = lerp(1.8, 1, sp);
              const sy = P.stamp.y ?? 210, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, bh / 2], [-bw / 2, bh / 2]].map(([x, y]) => SKY.rotP([x * sc, y * sc + sy], -14));
              topPen.fill(inkPath(pts, { w: 10, seed: sd + 300, t, closed: true, smooth: false }), col);
            }
            stT.setAttribute('opacity', sp.toFixed(3));
            stT.setAttribute('transform', `rotate(-14) translate(0 ${f1((P.stamp.y ?? 210) + 42)}) scale(${lerp(1.8, 1, sp).toFixed(3)})`);
          }
          topPen.end();
          if (chunk) { const ca = TD.atOr(cues, CH.at, 0), q = lt >= ca ? spring(lt, ca, 0.6) : 0; chunk.update(t, CH.x * W, CH.y * H, q > 0.01 ? CH.s * q : 0.01, CH.rot + Math.sin(lt) * 3, 1); }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
