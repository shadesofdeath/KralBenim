// mq_skin: a big magnifying glass over a forearm, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz,
// pure function of (seed, time)). Across the frame bottom lies a bare forearm; the lens above shows its skin hugely
// magnified: wavy skin ridges, pores with hairs, glossy beads of skin oil (sebum) and little blue/green bacteria that
// wriggle among them. Small gold acid molecules (a ring with a little tail) bubble up out of the oil, float out of the
// lens and drift up to a big striped mosquito hovering at the top right, nose down; gold sniff arcs pulse at its head.
// Draws its own world (use "set": false): paper, arm, lens and mosquito.
// P: {lens: [0.45, 0.37, 0.34] (cx, cy, r as fractions of W/H/W), arm: 0.66 (arm top), table: 0.84 (table top), bug: 2.3
//     (mosquito scale), bugx: 0.86, bugy: 0.12, mol: 9, labels: [{text, x, y, size, color, at, ...}]}
// cues: oil (beads swell), acids (molecules start rising), plus whatever the labels use. Needs LH and MQ.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  let CLIPN = 0;
  SH.mq_skin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const L = window.LH, sd = seed * 1000 + 557, u = W / 1080;
      const root = el(svg, 'g');
      const ln = P.lens || [0.45, 0.37, 0.34];
      const cx = ln[0] * W, cy = ln[1] * H, r = ln[2] * W;
      const skin = mix(INK.paperDark, INK.stain, 0.22), skinL = mix(skin, INK.paperLight, 0.35), skinD = mix(skin, INK.ink, 0.25);
      // wooden table + forearm across the bottom
      const bench = window.MQ.bench(el(root, 'g'), sd + 700);
      const arm = inkEl(root, skin), armR = inkEl(root), armH = inkEl(root, skinD);
      // lens content (clipped)
      const id = 'mqclip' + (++CLIPN) + '_' + seed;
      const cp = el(defs || svg, 'clipPath', { id });
      el(cp, 'circle', { cx: L.f1(cx), cy: L.f1(cy), r: L.f1(r - 6 * u) });
      const lens = el(root, 'g', { 'clip-path': `url(#${id})` });
      const lensBg = inkEl(lens, skinL), ridges = inkEl(lens, skinD), pores = inkEl(lens, mix(skinD, INK.ink, 0.3)), hairs = inkEl(lens, INK.ink);
      const beads = inkEl(lens, mix(INK.gold, INK.paperLight, 0.25)), beadsR = inkEl(lens, mix(INK.gold, INK.ink, 0.45)), shine = inkEl(lens, INK.paperLight);
      const bacB = inkEl(lens, mix(INK.blue, INK.paperLight, 0.2)), bacG = inkEl(lens, mix(INK.green, INK.paperLight, 0.15)), bacR = inkEl(lens);
      // lens rim + handle
      const handle = inkEl(root, mix(INK.stain, INK.ink, 0.45)), handleR = inkEl(root), rim = inkEl(root, mix(INK.inkSoft, INK.ink, 0.3)), rimR = inkEl(root), glint = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 });
      // molecules (outside the clip so they can leave the lens) + mosquito head
      const mol = inkEl(root, INK.gold), molR = inkEl(root, mix(INK.gold, INK.ink, 0.5));
      const bug = window.MQ.mosquito(el(root, 'g'), sd + 600, 'aedes');
      const sniff = inkEl(root, INK.gold);
      const labels = (P.labels || []).map(o => L.label(root, o, W, H));
      const R = rng(inkHash(sd, 11)), FQ = Array.from({ length: 200 }, () => R());
      const NM = P.mol ?? 9;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const oil = L.atOr(cues, 'oil', dur * 0.45), acids = L.atOr(cues, 'acids', dur * 0.2);
          // table front + the forearm lying on it
          const tb = (P.table ?? 0.84) * H;
          bench.update(t, W, H, tb);
          const ay = (P.arm ?? 0.66) * H;
          const AT = [], AB = [];
          for (let i = 0; i <= 10; i++) { const x = lerp(-40, W + 40, i / 10); AT.push([x, ay + Math.sin(i * 0.8) * 10 * u - i * 6 * u]); AB.push([x, tb + 6 * u]); }
          arm.setAttribute('d', inkLoop(AT.concat(AB.reverse()), { seed: k + 1, t, smooth: true, amp: 1 }));
          armR.setAttribute('d', inkPath(AT, { w: 7, seed: k + 2, t }));
          const AH = []; for (let i = 0; i < 18; i++) { const x = FQ[i] * W, y = ay + 40 * u + FQ[i + 20] * (tb - ay - 80 * u); AH.push(inkPath([[x, y], [x + 20 * u, y - 12 * u]], { w: 2.5, seed: k + 3 + i, t, amp: 0.5 })); }
          armH.setAttribute('d', AH.join(' '));
          // magnified skin
          lensBg.setAttribute('d', `M${cx - r} ${cy - r} H${cx + r} V${cy + r} H${cx - r} Z`);
          const RG = [];
          for (let i = 0; i < 9; i++) {
            const y0 = cy - r * 0.75 + i * r * 0.2, pts = [];
            for (let j = 0; j <= 10; j++) pts.push([cx - r + j * r * 0.2, y0 + Math.sin(j * 1.1 + i * 0.7) * 18 * u + Math.sin(t * 0.6 + i) * 3 * u]);
            RG.push(inkPath(pts, { w: 4, seed: k + 20 + i, t, amp: 1 }));
          }
          ridges.setAttribute('d', RG.join(' '));
          const PO = [], HA = [], BE = [], BR = [], SH2 = [];
          const swell = 1 + 0.25 * clamp01((lt - oil) / 0.5) + 0.2 * punch(lt, oil, 0.8);
          const spots = 7;
          for (let i = 0; i < spots; i++) {
            const a = FQ[40 + i] * Math.PI * 2, d = Math.sqrt(FQ[50 + i]) * r * 0.78, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
            PO.push(inkLoop(inkEllipsePts(x, y, 26 * u, 15 * u, k + 60 + i, 9), { seed: k + 70 + i, t, amp: 0.8 }));
            if (i % 2 === 0) HA.push(inkPath([[x, y], [x + 30 * u, y - 110 * u], [x + 70 * u + Math.sin(t + i) * 6 * u, y - 210 * u]], { w: 7, seed: k + 80 + i, t, taper: 0.6 }));
            // oil beads next to pores
            const bx = x + (FQ[60 + i] - 0.5) * 120 * u, by = y + 40 * u + FQ[70 + i] * 40 * u, br = (30 + FQ[80 + i] * 26) * u * swell;
            const bp = inkEllipsePts(bx, by, br, br * 0.82, k + 90 + i, 10);
            BE.push(inkLoop(bp, { seed: k + 100 + i, t, amp: 0.8 })); BR.push(inkPath(bp, { w: 4, seed: k + 110 + i, t, closed: true, amp: 0.8 }));
            SH2.push(inkDot(bx - br * 0.35, by - br * 0.35, br * 0.22, br * 0.15, k + 120 + i, t));
          }
          pores.setAttribute('d', PO.join(' ')); hairs.setAttribute('d', HA.join(' '));
          beads.setAttribute('d', BE.join(' ')); beadsR.setAttribute('d', BR.join(' ')); shine.setAttribute('d', SH2.join(' '));
          // bacteria: rods (blue) and cocci clusters (green) wriggling along
          const BB = [], BG = [], BC = [];
          for (let i = 0; i < 12; i++) {
            const a = FQ[130 + i] * 6.28 + t * (0.08 + FQ[145 + i] * 0.1) * (i % 2 ? 1 : -1), d = (0.2 + FQ[160 + i] * 0.6) * r;
            const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.9, ang = a + Math.PI / 2 + Math.sin(t * 3 + i) * 0.3;
            if (i % 3) {
              const c = Math.cos(ang), s = Math.sin(ang), hl = 34 * u, hw = 13 * u, pts = [];
              for (let j = 0; j < 10; j++) { const q = j / 10 * Math.PI * 2; const px = Math.cos(q) * hl, py = Math.sin(q) * hw + Math.sin(q * 2 + t * 6 + i) * 2 * u; pts.push([x + px * c - py * s, y + px * s + py * c]); }
              BB.push(inkLoop(pts, { seed: k + 170 + i, t, amp: 0.7 })); BC.push(inkPath(pts, { w: 3.5, seed: k + 185 + i, t, closed: true, amp: 0.7 }));
            } else {
              for (let j = 0; j < 4; j++) { const q = [x + (j % 2) * 22 * u, y + Math.floor(j / 2) * 22 * u]; BG.push(inkCircle(q[0], q[1], 12 * u, k + 200 + i * 4 + j, t, { fill: true })); BC.push(inkCircle(q[0], q[1], 12 * u, k + 250 + i * 4 + j, t, { w: 3 })); }
            }
          }
          bacB.setAttribute('d', BB.join(' ')); bacG.setAttribute('d', BG.join(' ')); bacR.setAttribute('d', BC.join(' '));
          // lens rim + handle (handle down to the bottom right, over the arm)
          const ha = Math.PI * 0.3, h0 = [cx + Math.cos(ha) * r, cy + Math.sin(ha) * r], h1 = [cx + Math.cos(ha) * (r + 520 * u), cy + Math.sin(ha) * (r + 520 * u)];
          handle.setAttribute('d', inkPath([h0, h1], { w: 70 * u, seed: k + 300, t, taper: 0 }));
          handleR.setAttribute('d', [-1, 1].map((sg, i) => inkPath([[h0[0] - Math.sin(ha) * 35 * u * sg, h0[1] + Math.cos(ha) * 35 * u * sg], [h1[0] - Math.sin(ha) * 35 * u * sg, h1[1] + Math.cos(ha) * 35 * u * sg]], { w: 5, seed: k + 301 + i, t })).join(' ') +
            ' ' + [0.35, 0.55, 0.75].map((q, i) => { const p = [lerp(h0[0], h1[0], q), lerp(h0[1], h1[1], q)]; return inkPath([[p[0] - Math.sin(ha) * 35 * u, p[1] + Math.cos(ha) * 35 * u], [p[0] + Math.sin(ha) * 35 * u, p[1] - Math.cos(ha) * 35 * u]], { w: 4, seed: k + 304 + i, t }); }).join(' '));
          rim.setAttribute('d', inkCircle(cx, cy, r + 14 * u, k + 310, t, { w: 34 * u, n: 24 }));
          rimR.setAttribute('d', inkCircle(cx, cy, r - 4 * u, k + 311, t, { w: 5, n: 24 }) + ' ' + inkCircle(cx, cy, r + 32 * u, k + 312, t, { w: 5, n: 24 }));
          glint.setAttribute('d', inkPath(Array.from({ length: 6 }, (_, i) => { const a = Math.PI * (1.1 + i * 0.06); return [cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82]; }), { w: 18 * u, seed: k + 313, t }));
          // a big mosquito hovers at the top right, nose down towards the lens
          const bs = (P.bug ?? 2.3) * u, bp = [(P.bugx ?? 0.86) * W + Math.sin(t * 1.3) * 10 * u, (P.bugy ?? 0.12) * H + Math.sin(t * 1.9) * 8 * u];
          bug.update(t, bp[0], bp[1], bs, { face: -1, ang: 24 });
          const mh = [bp[0] - 70 * bs, bp[1] + 45 * bs];   // the tip of the antennae / proboscis region
          const SN = [];
          if (lt > acids + 0.8) for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; SN.push(inkPath(Array.from({ length: 5 }, (_, j) => { const q = -0.9 + j * 0.45; return [mh[0] + Math.cos(q + 2.2) * (30 + ph * 60) * u, mh[1] + Math.sin(q + 2.2) * (30 + ph * 60) * u]; }), { w: 4 * (1 - ph) + 1, seed: k + 500 + i, t })); }
          sniff.setAttribute('d', SN.join(' '));
          // rising acid molecules: from the oil beads up and out to the antennae
          const MO = [], MR = [];
          if (lt >= acids) {
            for (let i = 0; i < NM; i++) {
              const ph = ((lt - acids) * 0.32 + FQ[420 + i]) % 1;
              const born = lt - acids > FQ[420 + i] * 1.2; if (!born) continue;
              const a = FQ[40 + (i % 7)] * Math.PI * 2, d = Math.sqrt(FQ[50 + (i % 7)]) * r * 0.78;
              const sx = cx + Math.cos(a) * d, sy = cy + Math.sin(a) * d + 40 * u, tx = mh[0], ty = mh[1];
              const e = ph * ph * (3 - 2 * ph);
              const x = lerp(sx, tx, e) + Math.sin(ph * 9 + i) * 30 * u, y = lerp(sy, ty, e);
              const rr = 16 * u * (ph > 0.9 ? (1 - ph) * 10 : Math.min(1, ph * 8));
              const hex = Array.from({ length: 6 }, (_, j) => [x + Math.cos(j / 6 * 6.28 + t) * rr, y + Math.sin(j / 6 * 6.28 + t) * rr]);
              MO.push(inkLoop(hex, { seed: k + 430 + i, t, smooth: false, amp: 0.5 }));
              MR.push(inkPath(hex, { w: 3.5, seed: k + 450 + i, t, closed: true, smooth: false, amp: 0.5 }), inkPath([[x + rr, y], [x + rr * 2.2, y - rr * 0.6]], { w: 3.5, seed: k + 470 + i, t }));
              MO.push(inkDot(x + rr * 2.5, y - rr * 0.8, rr * 0.4, rr * 0.4, k + 490 + i, t));
            }
          }
          mol.setAttribute('d', MO.join(' ')); molR.setAttribute('d', MR.join(' '));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
