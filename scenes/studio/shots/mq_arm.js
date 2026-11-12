// mq_arm: close-up of a bare forearm resting across a wooden table, parchment ink style (brand/kit/BRAND.md §3,
// §5; boils at 8 Hz, pure function of (seed, time)). The arm runs from the left frame edge (elbow) up to a loose fist
// on the right, with a few hairs.
//   mode "stocking": a sheer nylon stocking slides on over the forearm (cross-hatched mesh, elastic hems), and gold
//     scent wisps slowly rise from it.
//   mode "soap": a bar of soap scrubs back and forth along the arm, foam bubbles pile up and pop, while P.bugs
//     mosquitoes keep circling above the arm.
// Leaves the wall to the scene's "set" (interior); the table front fills the frame down to the bottom.
// P: {mode: "stocking"|"soap", room: "lab"|"bath" (bath: blue tile wall with a mirror, a tiled counter and a
//     dripping tap instead of the wooden table), table: 0.66 (table top, 0..1 H), arm: [x0, y0, x1, y1] (elbow -> wrist, 0..1),
//     bugs: 4, labels: [{text, x, y, size, color, at, ...}] (LH.label)}
// cues: whatever the labels use. Needs lh__lib.js (LH) and mq__lib.js (MQ).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mq_arm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, Q = window.MQ, sd = seed * 1000 + 613, u = W / 1080;
      const root = el(svg, 'g');
      const mode = P.mode || 'stocking';
      const tt = (P.table ?? 0.66) * H;
      const A = P.arm || [-0.08, 0.6, 0.72, 0.47];
      const E = [A[0] * W, A[1] * H], Wr = [A[2] * W, A[3] * H];
      const skin = mix(INK.paperDark, INK.stain, 0.22), skinD = mix(skin, INK.ink, 0.25);
      const nyl = mix(INK.stain, INK.ink, 0.3);
      const bath = P.room === 'bath';
      const tileC = mix(INK.blue, INK.paperLight, 0.72), tileD = mix(INK.blue, INK.paperLight, 0.45);
      const wallT = bath ? inkEl(root, tileC) : null, grout = bath ? inkEl(root, mix(INK.blue, INK.inkSoft, 0.4)) : null;
      const mirror = bath ? inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 }) : null, mirrorR = bath ? inkEl(root) : null;
      const bench = bath ? null : Q.bench(el(root, 'g'), sd + 1);
      const ctr = bath ? inkEl(root, tileD) : null, ctrR = bath ? inkEl(root) : null, tap = bath ? inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.2)) : null, tapR = bath ? inkEl(root) : null, water = bath ? inkEl(root, mix(INK.blue, INK.paperLight, 0.3)) : null;
      const shadow = inkEl(root, mix(INK.stain, INK.ink, 0.5), { 'fill-opacity': 0.35 });
      const armF = inkEl(root, skin), handF = inkEl(root, skin), hairs = inkEl(root, skinD), armR = inkEl(root), handR = inkEl(root);
      const nylF = inkEl(root, nyl, { 'fill-opacity': 0.45 }), nylM = inkEl(root, mix(nyl, INK.ink, 0.35)), nylB = inkEl(root, mix(nyl, INK.ink, 0.3));
      const wisp = Q.wisp(el(root, 'g'), sd + 20);
      const soap = inkEl(root, mix(INK.blue, INK.paperLight, 0.55)), soapR = inkEl(root), foam = inkEl(root, INK.paperLight), foamR = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3));
      const bugs = mode === 'soap' ? Q.swarm(el(root, 'g'), P.bugs ?? 4, sd + 40, 'aedes') : null;
      const labels = (P.labels || []).map(o => L.label(root, o, W, H));
      const dx = Wr[0] - E[0], dy = Wr[1] - E[1], len = Math.hypot(dx, dy), tx = dx / len, ty = dy / len, nx = ty, ny = -tx;   // n points "up" (towards -y)
      const half = v => lerp(150, 96, v) * u * (1 + 0.06 * Math.sin(v * Math.PI));
      const C = v => [E[0] + dx * v, E[1] + dy * v];
      const top = (v, ex = 0) => { const c = C(v), h = half(v) + ex; return [c[0] + nx * h, c[1] + ny * h]; };
      const bot = (v, ex = 0) => { const c = C(v), h = half(v) + ex; return [c[0] - nx * h, c[1] - ny * h]; };
      const R = rng(inkHash(sd, 3)), FQ = Array.from({ length: 60 }, () => R());
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          if (bench) bench.update(t, W, H, tt);
          else {
            const ts = 120 * u, GR = [];
            wallT.setAttribute('d', `M-40 -40 H${W + 40} V${MQ.f1(tt)} H-40 Z`);
            for (let y = tt - ts; y > -40; y -= ts) GR.push(inkPath([[-40, y], [W + 40, y + 2]], { w: 3, seed: k + 500 + Math.round(y), t, amp: 0.6 }));
            for (let x = 40; x < W + 40; x += ts) GR.push(inkPath([[x, -40], [x + 2, tt]], { w: 3, seed: k + 700 + Math.round(x), t, amp: 0.6 }));
            grout.setAttribute('d', GR.join(' '));
            const mr = [[0.4 * W, 0.06 * H], [0.8 * W, 0.06 * H], [0.8 * W, 0.28 * H], [0.4 * W, 0.28 * H]];
            mirror.setAttribute('d', inkLoop(mr, { seed: k + 800, t, smooth: false }));
            mirrorR.setAttribute('d', inkPath(mr, { w: 8, seed: k + 801, t, closed: true, smooth: false }) + ' ' + inkPath([[0.46 * W, 0.12 * H], [0.54 * W, 0.08 * H]], { w: 5, seed: k + 802, t }) + ' ' + inkPath([[0.47 * W, 0.17 * H], [0.61 * W, 0.09 * H]], { w: 5, seed: k + 803, t }));
            const th = 46 * u, CF = [[-40, tt], [W + 40, tt], [W + 40, H + 40], [-40, H + 40]];
            ctr.setAttribute('d', inkLoop(CF, { seed: k + 810, t, smooth: false }));
            const CR = [inkPath([[-40, tt], [W + 40, tt]], { w: 7, seed: k + 811, t }), inkPath([[-40, tt + th], [W + 40, tt + th]], { w: 5, seed: k + 812, t })];
            for (let y = tt + th + ts; y < H + 40; y += ts) CR.push(inkPath([[-40, y], [W + 40, y + 2]], { w: 3, seed: k + 820 + Math.round(y), t, amp: 0.6 }));
            for (let x = 60; x < W + 40; x += ts) CR.push(inkPath([[x, tt + th], [x + 2, H + 40]], { w: 3, seed: k + 900 + Math.round(x), t, amp: 0.6 }));
            ctrR.setAttribute('d', CR.join(' '));
            // tap on the back right with a dripping stream
            const fx = 0.9 * W, fy = tt - 260 * u;
            const TP = [[fx + 20 * u, tt], [fx + 20 * u, fy], [fx - 110 * u, fy], [fx - 110 * u, fy + 40 * u], [fx - 20 * u, fy + 40 * u], [fx - 20 * u, tt]];
            tap.setAttribute('d', inkLoop(TP, { seed: k + 950, t, smooth: false }));
            tapR.setAttribute('d', inkPath(TP, { w: 6, seed: k + 951, t, closed: true, smooth: false }));
            const DR = []; for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1; DR.push(inkDot(fx - 96 * u, fy + 60 * u + ph * 150 * u, 9 * u, 13 * u, k + 960 + i, t)); }
            water.setAttribute('d', DR.join(' '));
          }
          // arm outline: top edge elbow -> wrist, bottom edge back
          const TP = [], BT = [];
          for (let i = 0; i <= 12; i++) { const v = i / 12; TP.push(top(v)); BT.push(bot(v)); }
          const breathe = Math.sin(t * 1.2) * 3 * u;
          const outline = TP.concat(BT.slice().reverse()).map(p => [p[0], p[1] + breathe]);
          shadow.setAttribute('d', inkLoop([[E[0], tt + 4 * u], [Wr[0] + 120 * u, tt + 4 * u], [Wr[0] + 100 * u, tt + 40 * u], [E[0], tt + 60 * u]], { seed: k + 1, t, amp: 0.6 }));
          armF.setAttribute('d', inkLoop(outline, { seed: k + 2, t, amp: 1 }));
          armR.setAttribute('d', inkPath(TP.map(p => [p[0], p[1] + breathe]), { w: 7, seed: k + 3, t }) + ' ' + inkPath(BT.map(p => [p[0], p[1] + breathe]), { w: 7, seed: k + 4, t }));
          // fist
          const hc = [Wr[0] + tx * 110 * u, Wr[1] + ty * 110 * u + breathe];
          const HP = inkEllipsePts(hc[0], hc[1], 125 * u, 108 * u, k + 5, 12, Math.atan2(ty, tx), 0.08);
          handF.setAttribute('d', inkLoop(HP, { seed: k + 6, t, amp: 1 }));
          const HR = [inkPath(HP, { w: 7, seed: k + 7, t, closed: true })];
          for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; HR.push(inkPath([[hc[0] + 40 * u, hc[1] + a * 100 * u - 6 * u], [hc[0] + 110 * u, hc[1] + a * 92 * u]], { w: 4, seed: k + 8 + i, t })); }
          HR.push(inkPath([[hc[0] - 70 * u, hc[1] - 70 * u], [hc[0] + 10 * u, hc[1] - 104 * u], [hc[0] + 70 * u, hc[1] - 86 * u]], { w: 5, seed: k + 12, t }));
          handR.setAttribute('d', HR.join(' '));
          const HA = [];
          for (let i = 0; i < 14; i++) { const v = 0.1 + FQ[i] * 0.8, p = top(v, -10 * u - FQ[i + 14] * 60 * u); HA.push(inkPath([[p[0], p[1] + breathe], [p[0] + 18 * u, p[1] - 10 * u + breathe]], { w: 2.4, seed: k + 20 + i, t, amp: 0.5 })); }
          hairs.setAttribute('d', HA.join(' '));
          if (mode === 'stocking') {
            const on = spring(lt, 0.05, 1.1), v0 = lerp(0.98, 0.04, Math.min(1, on)), v1 = 0.98;
            const ST = [], SB = [];
            for (let i = 0; i <= 10; i++) { const v = lerp(v0, v1, i / 10); ST.push(top(v, 8 * u)); SB.push(bot(v, 8 * u)); }
            const sh = ST.concat(SB.slice().reverse()).map(p => [p[0], p[1] + breathe]);
            nylF.setAttribute('d', inkLoop(sh, { seed: k + 40, t, amp: 0.8 }));
            const ME = [];
            for (let i = 0; i < 16; i++) {
              const v = lerp(v0, v1, i / 16);
              const a1 = top(v, 8 * u), b1 = bot(Math.min(v1, v + 0.07), 8 * u), a2 = top(Math.min(v1, v + 0.07), 8 * u), b2 = bot(v, 8 * u);
              ME.push(inkPath([[a1[0], a1[1] + breathe], [b1[0], b1[1] + breathe]], { w: 2, seed: k + 50 + i, t, amp: 0.5 }));
              ME.push(inkPath([[a2[0], a2[1] + breathe], [b2[0], b2[1] + breathe]], { w: 2, seed: k + 70 + i, t, amp: 0.5 }));
            }
            ME.push(inkPath(ST.map(p => [p[0], p[1] + breathe]), { w: 4, seed: k + 90, t }), inkPath(SB.map(p => [p[0], p[1] + breathe]), { w: 4, seed: k + 91, t }));
            nylM.setAttribute('d', ME.join(' '));
            const hem = v => { const a = top(v, 12 * u), b = bot(v, 12 * u), c = top(v + 0.03, 12 * u), d = bot(v + 0.03, 12 * u); return inkLoop([[a[0], a[1] + breathe], [c[0], c[1] + breathe], [d[0], d[1] + breathe], [b[0], b[1] + breathe]], { seed: k + 92 + v * 10, t, smooth: false, amp: 0.8 }); };
            nylB.setAttribute('d', hem(v0) + ' ' + hem(v1 - 0.03));
            const grow = clamp01((lt - 0.9) / Math.max(1, dur - 1));
            const WP = [];
            for (let i = 0; i < 6; i++) { const v = 0.12 + i * 0.15, p = top(v, 20 * u); WP.push([p[0], p[1] - 10 * u, (180 + FQ[i + 30] * 160) * u, 5]); }
            wisp.update(t, WP, lt < 0.9 ? 0 : 0.35 + 0.65 * grow);
            [soap, soapR, foam, foamR].forEach(e => e.setAttribute('d', ''));
          } else {
            [nylF, nylM, nylB].forEach(e => e.setAttribute('d', ''));
            wisp.update(t, [], 0);
            const v = 0.5 + Math.sin(t * 4.2) * 0.24, c = top(v, -30 * u), ang = Math.atan2(ty, tx);
            const sw = 120 * u, sh2 = 62 * u, cs = Math.cos(ang), sn = Math.sin(ang);
            const S4 = [[-sw, -sh2], [sw, -sh2], [sw, sh2], [-sw, sh2]].map(q => [c[0] + q[0] * cs - q[1] * sn, c[1] - 30 * u + q[0] * sn + q[1] * cs + breathe]);
            soap.setAttribute('d', inkLoop(S4, { seed: k + 100, t, amp: 1 }));
            soapR.setAttribute('d', inkPath(S4, { w: 6, seed: k + 101, t, closed: true }) + ' ' + inkPath([[c[0] - 50 * u, c[1] - 48 * u], [c[0] + 30 * u, c[1] - 56 * u]], { w: 4, seed: k + 102, t }));
            const n = Math.min(26, 8 + Math.floor(lt * 6)), F = [], FR = [];
            for (let i = 0; i < n; i++) {
              const vv = 0.2 + FQ[i] * 0.62, ph = (t * (0.4 + FQ[i + 26] * 0.5) + FQ[i + 13]) % 1;
              const p = top(vv, (-6 + FQ[i + 5] * 30) * u), r = (10 + FQ[i + 9] * 26) * u * (ph < 0.85 ? 1 : (1 - ph) / 0.15 + 0.05);
              const q = [p[0] + Math.sin(t * 2 + i) * 4 * u, p[1] - ph * 40 * u + breathe];
              F.push(inkCircle(q[0], q[1], r, k + 120 + i, t, { fill: true })); FR.push(inkCircle(q[0], q[1], r, k + 160 + i, t, { w: 3 }));
            }
            foam.setAttribute('d', F.join(' ')); foamR.setAttribute('d', FR.join(' '));
            bugs.update(t, 0.47 * W, 0.27 * H, 330 * u, 150 * u, 0.55 * u);
          }
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
