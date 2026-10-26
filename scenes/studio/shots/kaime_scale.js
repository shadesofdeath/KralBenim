// kaime_scale: a money-changer's balance weighing gold against paper money, parchment ink style (brand/kit/BRAND.md §3,
// §5; boils at 8 Hz, pure function of (seed, lt)). A brass-and-wood balance stands on the counter/ground (gy).
//   mode "count": one gold coin sits on the left pan; banknotes drop onto the right pan one by one (from `count`, the
//     last one lands on `hit`), a big hand-inked counter ticks up, the beam slowly comes level; the final number turns red.
//   mode "trust": a single banknote lies on the left pan, the gold coin on the right pulls its side down; on `trust`
//     an iron weight stamped with a word ("GÜVEN") drops onto the paper's pan and the beam swings level.
// The beam wobbles (spring) at every landing. Leaves sky/room to the scene's "set".
// P.span: beam half-length px (trust 270 / count 320). P.counter: true (count: the balance stands on a money-changer's counter with coin stacks; the tally is a slate on the
//   post), P.fore: true (counter front / dark hill below the ground line). P.settled: true (trust: the weight already lies on the pan, the beam is level from the start).
// P: {mode: "count"|"trust", n: 13, x: 0.5, gy: 0.6, tilt: 14 (deg, start), word: "GÜVEN", unit: "kaime",
//     coin_label: "1 altın", label: {text, x, y, at, size, color}, kasif: K | false}
// cues: count, hit, trust, label.at, kasif seq names. Needs kaime__lib.js (KMA).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.kaime_scale = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 721, M = window.KMA, trust = P.mode === 'trust';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, cx = (P.x ?? 0.5) * W, N = P.n ?? 13;
      const L = P.span ?? (trust ? 270 : 320), pivotY = gy - 0.3 * H, hang = 0.14 * H;
      const counter = !trust && P.counter !== false;
      const foreL = P.fore === false ? null : M.fore(root, counter ? 'panel' : 'hill', sd + 3);
      const ctop = counter ? { f: inkEl(root, INK.stain), r: inkEl(root), stacks: inkEl(root, INK.gold), stR: inkEl(root) } : null;
      const ground = inkEl(root);
      const post = { f: inkEl(root, INK.stain), r: inkEl(root) }, base = { f: inkEl(root, INK.stain), r: inkEl(root) }, orn = inkEl(root, INK.gold), ornR = inkEl(root);
      const beamG = el(root, 'g'), beam = { f: inkEl(beamG, INK.gold), r: inkEl(beamG) }, needle = inkEl(beamG);
      const pin = inkEl(root, INK.ink);
      const sides = [0, 1].map(i => ({ strings: inkEl(root), pan: inkEl(root, INK.paperDark), panR: inkEl(root), load: el(root, 'g') }));
      // coin
      const coinG = el(root, 'g'), coin = { f: inkEl(coinG, INK.gold), r: inkEl(coinG), r2: inkEl(coinG), tug: inkEl(coinG), sh: inkEl(coinG, INK.paperLight) };
      // notes on the pan (count) / the single note (trust)
      const stack = Array.from({ length: trust ? 1 : N }, (_, i) => M.note(el(sides[1 - (trust ? 1 : 0)].load, 'g'), sd + 10 + i));
      // the weight (trust)
      const wG = el(root, 'g'), wt = trust ? { f: inkEl(wG, INK.ink), ring: inkEl(wG), tx: el(wG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 44, 'text-anchor': 'middle', fill: INK.paperLight }) } : null;
      if (wt) wt.tx.textContent = (P.word || 'GÜVEN').toLocaleUpperCase(LOCALE);
      // counter (count)
      const slate = trust ? null : { str: inkEl(root), f: inkEl(root, INK.ink), r: inkEl(root, INK.stain) };
      const cnt = trust ? null : el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 140, 'text-anchor': 'middle', fill: INK.ink });
      const unit = trust ? null : el(root, 'text', { 'font-family': INK_FONT, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink });
      if (unit) unit.textContent = P.unit || 'kaime';
      const cl = P.coin_label ? el(root, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }) : null;
      if (cl) cl.textContent = P.coin_label;
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.86, y: P.gy ?? 0.6, scale: 0.72, pose: 'point', face: -1 }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      const f1 = M.f1;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = M.atOr(cues, 'hit', dur * 0.75), c0 = M.atOr(cues, 'count', 0.2);
          const tilt0 = P.tilt ?? 14;
          // landings -> target tilt + wobble
          let target, lastLand = -9, landed = 0;
          const iv = (hitAt - c0) / Math.max(1, N);
          const fallD = Math.min(0.45, iv * 0.9);
          if (!trust) {
            for (let i = 0; i < N; i++) { const la = c0 + (i + 1) * iv; if (lt >= la) { landed = i + 1; lastLand = la; } }
            target = -tilt0 * (1 - landed / N);
          } else {
            const ta = P.settled ? -1 : M.atOr(cues, 'trust', dur * 0.45) + 0.45;
            if (lt >= ta) { lastLand = ta; target = 0; } else target = tilt0;
          }
          const wob = lastLand > 0 ? Math.exp(-(lt - lastLand) * 3.2) * Math.sin((lt - lastLand) * 11) * 5 : 0;
          const th = (target + wob + Math.sin(t * 1.3) * 0.4) * Math.PI / 180;
          if (foreL) foreL.update(t, W, H, gy);
          if (ctop) {
            const cp2 = [[-20, gy - 0.045 * H], [W + 20, gy - 0.045 * H], [W + 20, gy], [-20, gy]];
            ctop.f.setAttribute('d', inkLoop(cp2, { seed: sd + 70, t, smooth: false }));
            ctop.r.setAttribute('d', inkPath(cp2, { w: 5, seed: sd + 71, t, closed: true, smooth: false }));
            const st = [];
            [[0.8, 3], [0.94, 4]].forEach(([u, n], j) => { for (let q = 0; q < n; q++) st.push(inkLoop(inkEllipsePts(u * W, gy - 0.02 * H - q * 16, 40, 13, sd + 80 + j * 9 + q, 10), { seed: sd + 80 + j * 9 + q, t })); });
            ctop.stacks.setAttribute('d', st.join(' '));
            ctop.stR.setAttribute('d', st.length ? [[0.8, 3], [0.94, 4]].map(([u, n], j) => inkPath(inkEllipsePts(u * W, gy - 0.02 * H - (n - 1) * 16, 40, 13, sd + 90 + j, 10), { w: 3.5, seed: sd + 90 + j, t, closed: true })).join(' ') : '');
          }
          ground.setAttribute('d', inkPath([[-20, gy], [W + 20, gy + 2]], { w: 5, seed: sd + 1, t, amp: 1.5 }));
          // stand
          const bp = [[cx - 150, gy], [cx + 150, gy], [cx + 110, gy - 50], [cx - 110, gy - 50]];
          base.f.setAttribute('d', inkLoop(bp, { seed: sd + 2, t, smooth: false })); base.r.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 3, t, closed: true, smooth: false }));
          const pp = [[cx - 22, gy - 50], [cx + 22, gy - 50], [cx + 16, pivotY], [cx - 16, pivotY]];
          post.f.setAttribute('d', inkLoop(pp, { seed: sd + 4, t, smooth: false })); post.r.setAttribute('d', inkPath(pp, { w: 5, seed: sd + 5, t, closed: true, smooth: false }));
          orn.setAttribute('d', inkCircle(cx, gy - 0.12 * H, 30, sd + 6, t, { fill: true }));
          ornR.setAttribute('d', inkCircle(cx, gy - 0.12 * H, 30, sd + 7, t, { w: 4 }));
          // beam
          beamG.setAttribute('transform', `translate(${f1(cx)} ${f1(pivotY)}) rotate(${f1(th * 180 / Math.PI)})`);
          const bm = [[-L - 14, -6], [-40, -16], [0, -22], [40, -16], [L + 14, -6], [L + 14, 8], [0, 14], [-L - 14, 8]];
          beam.f.setAttribute('d', inkLoop(bm, { seed: sd + 8, t }));
          beam.r.setAttribute('d', inkPath(bm, { w: 5, seed: sd + 9, t, closed: true }));
          needle.setAttribute('d', inkPath([[0, 0], [0, -120]], { w: 7, seed: sd + 10, t, taper: 0.7 }));
          pin.setAttribute('d', inkDot(cx, pivotY, 14, 14, sd + 11, t));
          // pans
          const ends = [-1, 1].map(sg => [cx + Math.cos(th) * L * sg, pivotY + Math.sin(th) * L * sg]);
          const panTop = ends.map(e => [e[0], e[1] + hang]);
          sides.forEach((s, i) => {
            const e = ends[i], p = panTop[i], pw = 130;
            s.strings.setAttribute('d', [[-pw, 0], [0, 10], [pw, 0]].map((o, j) => inkPath([e, [p[0] + o[0], p[1] + o[1] * 0]], { w: 2.6, seed: sd + 20 + i * 5 + j, t, amp: 0.8 })).join(' '));
            const pan = [[p[0] - pw - 10, p[1]], [p[0] + pw + 10, p[1]], [p[0] + pw * 0.7, p[1] + 50], [p[0], p[1] + 62], [p[0] - pw * 0.7, p[1] + 50]];
            s.pan.setAttribute('d', inkLoop(pan, { seed: sd + 30 + i, t }));
            s.panR.setAttribute('d', inkPath(pan, { w: 5, seed: sd + 32 + i, t, closed: true }));
          });
          // the gold coin: left pan (count) / right pan (trust)
          const cp = panTop[trust ? 1 : 0], cR = 74;
          coinG.setAttribute('transform', `translate(${f1(cp[0])} ${f1(cp[1] - cR + 4)})`);
          coin.f.setAttribute('d', inkCircle(0, 0, cR, sd + 40, t, { fill: true }));
          coin.r.setAttribute('d', inkCircle(0, 0, cR, sd + 41, t, { w: 6 }));
          coin.r2.setAttribute('d', inkCircle(0, 0, cR * 0.78, sd + 42, t, { w: 2.6 }));
          coin.tug.setAttribute('d', inkPath([[-30, 14], [-20, -20], [-8, 10], [2, -30], [12, 10], [24, -22], [32, 14], [0, 24], [-30, 14]], { w: 4, seed: sd + 43, t, amp: 0.8 }));
          const gl = 0.5 + 0.5 * Math.sin(t * 2.4);
          coin.sh.setAttribute('d', inkPath([[-50, -30], [-36, -52], [-14, -62]], { w: 8 + 3 * gl, seed: sd + 44, t }));
          if (cl) { cl.setAttribute('x', f1(cp[0])); cl.setAttribute('y', f1(cp[1] + (trust ? 140 : 190))); }
          // notes
          const np = panTop[trust ? 0 : 1];
          stack.forEach((nt, i) => {
            const la = trust ? -1 : c0 + (i + 1) * iv;
            if (!trust && lt < la - fallD) { nt.g.setAttribute('transform', 'scale(0)'); return; }
            const u = trust ? 1 : clamp01((lt - (la - fallD)) / fallD);
            const restY = np[1] - 8 - i * 9, startY = pivotY - 0.12 * H;
            const y = lerp(startY, restY, u * u), sw = (1 - u) * Math.sin(lt * 9 + i) * 30;
            const sy = lerp(0.42, 0.12, u), rot = (1 - u) * (i % 2 ? 18 : -18) + (i % 3 - 1) * 3;
            nt.g.setAttribute('transform', `translate(${f1(np[0] + sw + (i % 2 ? 6 : -6))} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(lerp(0.5, trust ? 0.66 : 0.56, u) * 100) / 100} ${f1((trust ? sy * 1.6 : sy) * 100) / 100})`);
            nt.update(t, { seal: 1, value: '100' });
          });
          // counter
          if (cnt) {
            const pk = punch(lt, lastLand, 0.35), fin = landed >= N;
            cnt.textContent = landed ? String(landed) : '';
            cnt.setAttribute('fill', fin ? INK.red : INK.ink);
            const s = 1 + 0.18 * pk + (fin ? 0.15 * punch(lt, hitAt, 0.8) : 0);
            // a little chalk slate hung on the post between the pans: the tally
            const sy0 = pivotY + 0.1 * H, sw2 = 118, sh2 = 250, sw3 = Math.sin(t * 1.4) * 2;
            const sl = [[cx - sw2 + sw3, sy0], [cx + sw2 + sw3, sy0], [cx + sw2 - sw3, sy0 + sh2], [cx - sw2 - sw3, sy0 + sh2]];
            slate.f.setAttribute('d', inkLoop(sl, { seed: sd + 95, t, smooth: false }));
            slate.r.setAttribute('d', inkPath(sl, { w: 12, seed: sd + 96, t, closed: true, smooth: false }));
            slate.str.setAttribute('d', inkPath([[cx - sw2 * 0.7, sy0], [cx, sy0 - 60], [cx + sw2 * 0.7, sy0]], { w: 3, seed: sd + 97, t }));
            cnt.setAttribute('fill', fin ? INK.gold : INK.paperLight);
            cnt.setAttribute('transform', `translate(${f1(cx)} ${f1(sy0 + 165)}) scale(${f1(s * 100) / 100})`);
            unit.setAttribute('fill', INK.paperLight);
            unit.setAttribute('x', f1(cx)); unit.setAttribute('y', f1(sy0 + 228)); unit.setAttribute('opacity', landed ? 1 : 0);
          }
          // the weight (trust)
          if (wt) {
            const ta = P.settled ? -9 : M.atOr(cues, 'trust', dur * 0.45), u = clamp01((lt - ta) / 0.45);
            if (lt < ta) wG.setAttribute('transform', 'scale(0)');
            else {
              const y = lerp(pivotY - 0.2 * H, np[1] - 14, u * u);
              wG.setAttribute('transform', `translate(${f1(np[0])} ${f1(y)})`);
              const wp = [[-112, 0], [112, 0], [90, -100], [-90, -100]];
              wt.f.setAttribute('d', inkLoop(wp, { seed: sd + 60, t, smooth: false }));
              wt.ring.setAttribute('d', inkCircle(0, -124, 24, sd + 61, t, { w: 10 }));
              wt.tx.setAttribute('x', 0); wt.tx.setAttribute('y', -36);
            }
          }
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
