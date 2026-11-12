// mq_wear: the fez host takes part in the stocking test himself, parchment ink style (brand/kit/BRAND.md §3, §5;
// boils at 8 Hz, pure function of (seed, time)). He stands behind a wooden lab table and holds one arm straight out
// over it; a sheer nylon stocking slides on over that forearm from the elbow down to a toe past his fingers and gold scent wisps rise from it. On the
// table an hourglass runs (sand falls, the bottom fills) under a card that counts the hours up "1 HOUR" ... "6 HOURS",
// reaching P.hours on `hit`. The table front fills the frame bottom; the wall comes from the "set" (interior).
// P: {table: 0.64 (table top, 0..1 H), kasif: {x: 0.38, y: 0.8, scale: 1.45, face, emotion, seq}, glass: [0.74, 0.64]
//     (hourglass foot, 0..1), hours: 6, card: [0.74, 0.4] (counter card centre, 0..1)}
// cues: hit (counter reaches P.hours; host's eyebrows up). Needs LH and MQ.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mq_wear = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, Q = window.MQ, sd = seed * 1000 + 389, u = W / 1080;
      const root = el(svg, 'g');
      const bt = (P.table ?? 0.64) * H;
      const K = Object.assign({ x: 0.38, y: 0.8, scale: 1.45, pose: 'point', dir: 4, face: 'right', emotion: 'happy' }, P.kasif || {});
      if (!K.seq) K.seq = [{ at: 'hit', pose: 'point', dir: 4, face: 'right', emotion: 'surprised' }];
      const kas = L.kasif(el(root, 'g'), K, W, H, sd + 1);
      const nyl = mix(INK.stain, INK.ink, 0.3);
      const slF = inkEl(root, nyl, { 'fill-opacity': 0.55 }), slM = inkEl(root, mix(nyl, INK.ink, 0.35)), slB = inkEl(root, mix(nyl, INK.ink, 0.3));
      const wisp = Q.wisp(el(root, 'g'), sd + 5);
      const bench = Q.bench(el(root, 'g'), sd + 10);
      const wood = mix(INK.stain, INK.ink, 0.3);
      const hgPlate = inkEl(root, wood), hgGlass = inkEl(root, INK.paperLight, { 'fill-opacity': 0.45 }), sand = inkEl(root, INK.gold), hgR = inkEl(root);
      const card = el(root, 'g'), cardF = inkEl(card, INK.paperLight), cardR = inkEl(card);
      const cardT = L.txt(card, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 68 * u, fill: INK.ink });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const hit = L.atOr(cues, 'hit', dur * 0.6);
          // host + sleeve on the outstretched forearm
          const r = kas.update(lt, t, cues) || {};
          const kf = L.faceOf(K.face, 1), ks = K.scale * u, ox = K.x * W, oy = K.y * H;
          const S = p => [ox + kf * ks * p[0], oy + ks * p[1]];
          const hs = (r.hands || [[60, -300], [120, -300]]).map(S);
          const hand = hs[0][0] * kf > hs[1][0] * kf ? hs[0] : hs[1];
          const sho = S([(r.head || [0, -420])[0] * 0.6, (r.head || [0, -420])[1] + 110]);
          const dx = hand[0] - sho[0], dy = hand[1] - sho[1], dl = Math.hypot(dx, dy) || 1, tx = dx / dl, ty = dy / dl, nx = -ty, ny = tx;
          // the stocking runs from the hand back over the forearm to the elbow, toe end past the fingers
          const on = spring(lt, 0.05, 0.9), a1 = 1.1, a0 = lerp(a1 - 0.05, 0.08, Math.min(1, on)), hw = 24 * ks;
          const P0 = q => [sho[0] + dx * q, sho[1] + dy * q];
          const TOP = [], BOT = [], N = 12;
          for (let i = 0; i <= N; i++) {
            const v = i / N, q = lerp(a0, a1, v), c = P0(q);
            const w = hw * (v > 0.82 ? Math.sqrt(Math.max(0.05, 1 - Math.pow((v - 0.82) / 0.18, 2))) * 1.08 : 1 + 0.06 * Math.sin(v * 7));
            TOP.push([c[0] + nx * w, c[1] + ny * w]); BOT.push([c[0] - nx * w, c[1] - ny * w]);
          }
          const tipC = P0(a1);
          slF.setAttribute('d', inkLoop(TOP.concat([tipC], BOT.slice().reverse()), { seed: k + 2, t, amp: 0.8 }));
          const ME = [inkPath(TOP.concat([tipC], BOT.slice().reverse()), { w: 4, seed: k + 3, t, closed: true, amp: 0.8 })];
          for (let i = 0; i < N - 1; i++) { ME.push(inkPath([TOP[i], BOT[i + 1]], { w: 1.8, seed: k + 10 + i, t, amp: 0.4 }), inkPath([TOP[i + 1], BOT[i]], { w: 1.8, seed: k + 30 + i, t, amp: 0.4 })); }
          const heel = P0(lerp(a0, a1, 0.78));
          ME.push(inkPath([[heel[0] + nx * hw, heel[1] + ny * hw], [heel[0] - nx * hw, heel[1] - ny * hw]], { w: 2.5, seed: k + 48, t }));
          slM.setAttribute('d', ME.join(' '));
          slB.setAttribute('d', inkPath([TOP[0], BOT[0]], { w: 13 * u, seed: k + 50, t, taper: 0 }));
          const WP = [];
          for (let i = 0; i < 4; i++) { const q = lerp(a0 + 0.05, a1 - 0.2, i / 3), c = P0(q); WP.push([c[0] + nx * hw, c[1] + ny * hw - 6 * u, (150 + i * 40) * u * (0.6 + 0.4 * clamp01((lt - 0.6) / Math.max(1, dur - 1))), 4.5]); }
          wisp.update(t, WP, lt < 0.6 ? 0 : 1);
          bench.update(t, W, H, bt);
          // hourglass
          const g = P.glass || [0.74, (P.table ?? 0.64)], gx = g[0] * W, gy = g[1] * H, gh = 300 * u, gw = 92 * u;
          const top = gy - gh, mid = gy - gh / 2, pl = 18 * u;
          hgPlate.setAttribute('d', inkLoop([[gx - gw - 24 * u, gy], [gx + gw + 24 * u, gy], [gx + gw + 24 * u, gy - pl], [gx - gw - 24 * u, gy - pl]], { seed: k + 60, t, smooth: false }) + ' ' +
            inkLoop([[gx - gw - 24 * u, top], [gx + gw + 24 * u, top], [gx + gw + 24 * u, top + pl], [gx - gw - 24 * u, top + pl]], { seed: k + 61, t, smooth: false }) + ' ' +
            [-1, 1].map((sg, i) => inkPath([[gx + sg * (gw + 12 * u), gy - pl], [gx + sg * (gw + 12 * u), top + pl]], { w: 12 * u, seed: k + 62 + i, t, taper: 0 })).join(' '));
          const bulb = (y0, y1, wide0) => { const pts = []; for (let i = 0; i <= 8; i++) { const v = i / 8, y = lerp(y0, y1, v), wv = wide0 ? 1 - v : v; pts.push([gx + gw * (0.12 + 0.88 * Math.sin(Math.PI / 2 * wv)), y]); } for (let i = 8; i >= 0; i--) { const v = i / 8, y = lerp(y0, y1, v), wv = wide0 ? 1 - v : v; pts.push([gx - gw * (0.12 + 0.88 * Math.sin(Math.PI / 2 * wv)), y]); } return pts; };
          const B1 = bulb(top + pl, mid, true), B2 = bulb(mid, gy - pl, false);
          hgGlass.setAttribute('d', inkLoop(B1, { seed: k + 70, t, amp: 0.6 }) + ' ' + inkLoop(B2, { seed: k + 71, t, amp: 0.6 }));
          hgR.setAttribute('d', inkPath(B1, { w: 4.5, seed: k + 72, t, closed: true, amp: 0.6 }) + ' ' + inkPath(B2, { w: 4.5, seed: k + 73, t, closed: true, amp: 0.6 }));
          const f = clamp01(lt / Math.max(0.5, hit + 0.6)), ytop = lerp(mid - gh * 0.3, mid - 8 * u, f), ybot = lerp(gy - pl - 10 * u, gy - pl - gh * 0.26, f);
          const sw1 = (y) => gw * 0.9 * clamp01((mid - y) / (gh * 0.5)) + 6 * u;
          const SD = [inkLoop([[gx - sw1(ytop), ytop], [gx + sw1(ytop), ytop], [gx + 8 * u, mid - 4 * u], [gx - 8 * u, mid - 4 * u]], { seed: k + 80, t, smooth: false, amp: 0.6 }),
            inkLoop([[gx - gw * 0.85, gy - pl - 4 * u], [gx + gw * 0.85, gy - pl - 4 * u], [gx, ybot - 14 * u]], { seed: k + 81, t, amp: 0.6 })];
          if (f < 1) SD.push(inkPath([[gx, mid], [gx + Math.sin(t * 20) * 1.5 * u, ybot]], { w: 5 * u, seed: k + 82, t, taper: 0 }));
          sand.setAttribute('d', SD.join(' '));
          // hour counter card
          const nH = P.hours ?? 6, n = lt >= hit ? nH : Math.max(1, Math.min(nH - 1, 1 + Math.floor((lt - 0.2) / Math.max(0.3, hit - 0.2) * (nH - 1))));
          const tick = 0.2 + (n - 1) * Math.max(0.3, hit - 0.2) / (nH - 1);
          const cc = P.card || [0.74, 0.4];
          const sc = spring(lt, 0.15, 0.4) * (1 + 0.12 * punch(lt, n === nH ? hit : tick, 0.5));
          card.setAttribute('transform', `translate(${L.f1(cc[0] * W)} ${L.f1(cc[1] * H)}) rotate(${(Math.sin(t * 2) * 1.5 - 2).toFixed(2)}) scale(${sc.toFixed(3)})`);
          const c4 = [[-170 * u, -62 * u], [172 * u, -66 * u], [176 * u, 46 * u], [-166 * u, 50 * u]];
          cardF.setAttribute('d', inkLoop(c4, { seed: k + 90, t, smooth: false }));
          cardR.setAttribute('d', inkPath(c4, { w: 6, seed: k + 91, t, closed: true, smooth: false }));
          cardT.textContent = n + (n === 1 ? ' HOUR' : ' HOURS');
          cardT.setAttribute('y', 22 * u);
          cardT.setAttribute('fill', n === nH ? INK.red : INK.ink);
        },
      };
    },
  };
})();
