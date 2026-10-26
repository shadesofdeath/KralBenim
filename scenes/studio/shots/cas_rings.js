// cas_rings: a big cedar stump on a tidal flat, its cut face seen from a low angle (brand/kit/BRAND.md §3, §5).
// Growth rings draw themselves from the pith outwards (one ring per beat, years ticking), then on "last" the
// outermost ring flashes red and a tag on a pin points at it. Bark, cracks, a few barnacles and the tide lapping at
// the base. The flat/sky comes from the scene's "set" (coast / sea).
// Uses td__lib.js (TD: label, figure).
// P: {floor: 0.58, x: 0.5, y: 0.4 (centre of the cut face), rx: 400, ry: 220, rings: 22, grow: {at: 0, dur: 1.4},
//     last: cue|sec, tag: {text: "1699", x: 0.8, y: 0.22} | false, kasif: K | false, labels: [TD.label specs]}
// cues: hit (punch), last, plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_rings = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, atOr = TD.atOr, f1 = TD.f1, sd = seed * 1000 + 641;
      const FL = (P.floor ?? 0.58) * H, cx = (P.x ?? 0.5) * W, cy = (P.y ?? 0.4) * H, RX = P.rx ?? 400, RY = P.ry ?? 220, N = P.rings ?? 22;
      // ring radii: uneven widths (fixed per seed), narrower towards the bark
      const r = rng(sd), widths = [];
      for (let k = 0; k < N; k++) widths.push((0.6 + r() * 0.8) * lerp(1.3, 0.6, k / N));
      const tot = widths.reduce((a, b) => a + b, 0) * 1.08;
      const radii = []; let acc = 0.04 * tot; for (const w of widths) { acc += w; radii.push(acc / tot); }
      const wob = Array.from({ length: N }, () => r() * 6.28);
      const root = el(svg, 'g');
      const sideF = inkEl(root, INK.hatBand, { 'fill-opacity': 0.75 }), sideR = inkEl(root), bark = inkEl(root, INK.ink, { 'fill-opacity': 0.5 });
      const faceF = inkEl(root, INK.gold, { 'fill-opacity': 0.35 }), faceR = inkEl(root), ringsE = inkEl(root, INK.hatBand), cracks = inkEl(root, INK.inkSoft);
      const lastE = inkEl(root, INK.red), pin = inkEl(root, INK.red), tagF = inkEl(root, INK.paperLight), tagR = inkEl(root);
      const tag = P.tag ? el(root, 'text', { 'font-family': "'Zilla Slab', Fraunces, Georgia, serif", 'font-weight': 700, 'font-size': 120, 'text-anchor': 'middle', fill: INK.red }) : null;
      if (tag) tag.textContent = P.tag.text || '';
      const tide = inkEl(root, INK.blue, { 'fill-opacity': 0.42 }), tideR = inkEl(root), barn = inkEl(root, INK.paperLight), barnR = inkEl(root);
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.85, y: P.floor ?? 0.58, scale: 0.6, pose: 'point', face: 'left' }, P.kasif), sd + 60) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      const ringPts = (k, s = 1) => { const pts = []; for (let j = 0; j < 22; j++) { const a = j / 22 * Math.PI * 2, w = 1 + 0.03 * Math.sin(a * 3 + wob[k % N]) + 0.02 * Math.sin(a * 5 + k); pts.push([cx + 18 + Math.cos(a) * RX * radii[k] * w * s - 18 * radii[k], cy + Math.sin(a) * RY * radii[k] * w * s]); } return pts; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // stump body down to the ground
          const side = [[cx - RX, cy], [cx - RX * 1.04, FL - 10], [cx - RX * 1.2, FL + 20], [cx + RX * 1.2, FL + 20], [cx + RX * 1.04, FL - 10], [cx + RX, cy]];
          sideF.setAttribute('d', inkLoop(side, { seed: sd + 1, t }));
          sideR.setAttribute('d', inkPath(side, { w: 7, seed: sd + 2, t }));
          let bk = '';
          for (let k = 0; k < 14; k++) { const x = cx - RX + (k + 0.5) / 14 * RX * 2, y0 = cy + RY * Math.sqrt(Math.max(0, 1 - ((x - cx) / RX) ** 2)) + 10; bk += inkPath([[x, y0], [x + (k % 3 - 1) * 10, (y0 + FL) / 2], [x + (k % 2) * 8, FL]], { w: 5 + (k % 3) * 2, seed: sd + 3 + k, t, amp: 1.2 }) + ' '; }
          bark.setAttribute('d', bk);
          // cut face
          const face = ringPts(N - 1, 1.03);
          faceF.setAttribute('d', inkLoop(face, { seed: sd + 20, t }));
          faceR.setAttribute('d', inkPath(face, { w: 9, seed: sd + 21, t, closed: true }));
          const G = P.grow || {}, ga = atOr(cues, G.at, 0), gp = lin(lt, ga, G.dur ?? 1.4), shown = Math.floor(gp * (N - 1) + 0.0001);
          let rd = '';
          for (let k = 0; k < Math.min(N - 1, shown + 1); k++) rd += inkPath(ringPts(k), { w: k === shown ? 5 : 3.2, seed: sd + 30 + k, t, closed: true, amp: 0.8 }) + ' ';
          rd += inkDot(cx, cy, 10, 7, sd + 29, t);
          ringsE.setAttribute('d', rd);
          cracks.setAttribute('d', [0.6, 2.4, 4.1].map((a, k) => inkPath([[cx + Math.cos(a) * RX * 0.1, cy + Math.sin(a) * RY * 0.1], [cx + Math.cos(a + 0.1) * RX * 0.55, cy + Math.sin(a + 0.1) * RY * 0.55], [cx + Math.cos(a) * RX * 0.8, cy + Math.sin(a) * RY * 0.8]], { w: 3, seed: sd + 60 + k, t, amp: 1 })).join(' '));
          // the last ring
          const la = atOr(cues, P.last ?? 'last', null), lp = la == null ? 0 : (lt >= la ? 1 : 0), lk = punch(lt, la, 0.6);
          lastE.setAttribute('d', lp ? inkPath(ringPts(N - 1), { w: 12 + 8 * lk + 2 * Math.sin(t * 6), seed: sd + 70, t, closed: true }) : '');
          if (P.tag) {
            const T2 = P.tag, tp = la == null ? 0 : (lt >= la - 0.15 ? spring(lt, la - 0.15, 0.35) : 0);
            const tx = (T2.x ?? 0.78) * W, ty = (T2.y ?? 0.2) * H, ex = cx + RX * 0.72, ey = cy - RY * 0.7;
            if (tp > 0.01) {
              const bw = 300 * tp, bh = 150 * tp, box = [[tx - bw / 2, ty - bh / 2], [tx + bw / 2, ty - bh / 2 - 6], [tx + bw / 2 + 4, ty + bh / 2], [tx - bw / 2 - 3, ty + bh / 2 + 4]];
              tagF.setAttribute('d', inkLoop(box, { seed: sd + 80, t, smooth: false }));
              tagR.setAttribute('d', inkPath(box, { w: 7, seed: sd + 81, t, closed: true, smooth: false }));
              pin.setAttribute('d', inkPath([[tx - bw * 0.3, ty + bh / 2], [lerp(tx, ex, 0.6), lerp(ty, ey, 0.7) - 20], [lerp(tx - bw * 0.3, ex, tp), lerp(ty + bh / 2, ey, tp)]], { w: 7, seed: sd + 82, t }) + ' ' + inkDot(lerp(tx - bw * 0.3, ex, tp), lerp(ty + bh / 2, ey, tp), 16, 16, sd + 83, t));
              tag.setAttribute('opacity', clamp01(tp * 2).toFixed(2));
              tag.setAttribute('transform', `translate(${f1(tx)} ${f1(ty + 42 * tp)}) rotate(-4) scale(${(tp * (1 + 0.08 * lk)).toFixed(3)})`);
            } else { tagF.setAttribute('d', ''); tagR.setAttribute('d', ''); pin.setAttribute('d', ''); tag.setAttribute('opacity', '0'); }
          }
          // barnacles + tide at the base
          let bf = '', br = '';
          [[-0.9, 0.55], [-0.75, 0.72], [0.82, 0.62], [0.95, 0.8], [0.6, 0.85]].forEach(([u, v], k) => { const x = cx + u * RX, y = lerp(cy, FL, v); bf += inkDot(x, y, 16, 11, sd + 90 + k, t) + ' '; br += inkCircle(x, y, 16, sd + 96 + k, t, { w: 3, ry: 11 }) + ' '; });
          barn.setAttribute('d', bf); barnR.setAttribute('d', br);
          const wl = FL - 40 + Math.sin(t * 1.6) * 10, top = [];
          for (let k = 0; k <= 18; k++) { const x = lerp(-20, W + 20, k / 18); top.push([x, wl + Math.sin(x * 0.02 + t * 2.6) * 8]); }
          tide.setAttribute('d', inkLoop(top.concat([[W + 20, FL + 80], [-20, FL + 80]]), { seed: sd + 110, t, smooth: false }));
          tideR.setAttribute('d', inkPath(top, { w: 5, seed: sd + 111, t }));
          root.setAttribute('transform', hit ? `translate(${f1(cx)} ${f1(cy)}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})` : '');
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
