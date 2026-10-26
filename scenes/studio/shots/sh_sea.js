// sh_sea: side view of a shallow sea in parchment ink (brand/kit/BRAND.md §3, §5): wavy surface with a small warship,
// sonar pings that ring down from its hull (and break up into scribbles when they hit the noise), a seabed covered
// with a colony of tiny pistol shrimp that keep snapping (gold sparks; faster and bigger after "crackle"), an
// optional submarine that glides in and hides low among them, labels and the narrator. Uses sh__lib.js + td__lib.js.
// P: {surface: 0.24, bed: 0.62 (0..1 H), sand: 60 (px of sand fill below the bed line), ship: {x: 0.66, s: 0.7} | false,
//     pings: {at: cue|sec, every: 0.9, scatter: cue|sec (rings break up in the noise) | false} | false,
//     colony: {n: 12, x0: 0.04, x1: 0.96, s: 0.13, rate: 1, crackle: cue|sec (2.4x rate, bigger sparks), face: 1|-1 (all the same way),
//              rows: 1|2 (front row staggered by row_dy: 60 px), dy0: 0 (px below the bed line for the front row), back: {n: 10, s: 0.12, dy: 70} (far row of tiny shrimp)} | false,
//     sub: {from: [x, y], to: [x, y] (0..1, hull centre), at: cue|sec, dur: 1.6, s: 0.4, face: 1} | false,
//     labels: [TD.label specs], kasif: K | false, cam: {zoom: 1.05, focus: [0.5, 0.45]}}
// cues: hit (punch), pings.at / pings.scatter / colony.crackle / sub.at / labels / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sh_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SHR = window.SHR, f1 = SHR.f1, atOr = TD.atOr, sd = seed * 1000 + 811;
      const surfY = (P.surface ?? 0.24), bedY = (P.bed ?? 0.62);
      const root = el(svg, 'g'), cam = el(root, 'g');
      const water = SHR.water(cam, sd + 1, W, H, { surface: surfY, bed: bedY, depth: P.sand ?? 60 });
      const SP = P.ship === false ? null : Object.assign({ x: 0.66, s: 0.7 }, P.ship || {});
      const ship = SP ? SHR.ship(el(cam, 'g'), sd + 2) : null;
      const PG = P.pings === false || !SP ? null : Object.assign({ at: 0.2, every: 0.9, scatter: false }, P.pings || {});
      const pingE = inkEl(cam, INK.blue), pingS = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 });
      const SB = P.sub ? Object.assign({ from: [-0.3, 0.5], to: [0.45, 0.52], at: 0.3, dur: 1.6, s: 0.4, face: 1 }, P.sub) : null;
      const sub = SB ? SHR.sub(el(cam, 'g'), sd + 3) : null;
      const CO = P.colony === false ? null : Object.assign({ n: 12, x0: 0.04, x1: 0.96, s: 0.13, rate: 1 }, P.colony || {});
      const r0 = rng(sd + 77), crew = [];
      if (CO && CO.back) for (let i = 0; i < (CO.back.n || 10); i++) {       // far row: many tiny shrimp, drawn first
        crew.push({ x: lerp(CO.x0, CO.x1, (i + 0.3 + r0() * 0.4) / (CO.back.n || 10)), dy: -(CO.back.dy ?? 70), face: r0() < 0.5 ? 1 : -1, per: lerp(0.6, 1.3, r0()), ph: r0(), s: (CO.back.s || 0.12) * lerp(0.85, 1.15, r0()), node: SHR.shrimp(el(cam, 'g'), sd + 300 + i) });
      }
      if (CO) for (let i = 0; i < CO.n; i++) {
        crew.push({ x: lerp(CO.x0, CO.x1, (i + 0.2 + r0() * 0.6) / CO.n), dy: (CO.dy0 ?? 0) + (CO.rows === 2 && i % 2 ? -(CO.row_dy ?? 60) : 0) + r0() * 10, face: CO.face ?? (r0() < 0.5 ? 1 : -1), per: lerp(0.7, 1.4, r0()), ph: r0(), s: CO.s * lerp(0.9, 1.1, r0()), node: SHR.shrimp(el(cam, 'g'), sd + 100 + i) });
      }
      if (CO && CO.rows === 2) crew.sort((a, b) => a.dy - b.dy);
      const sparkF = inkEl(cam, INK.gold), sparkR = inkEl(cam), sparkL = inkEl(cam);
      const labels = (P.labels || []).map((L, i) => TD.label(cam, L, W, H, sd + 20 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.14, y: bedY, scale: 0.7, pose: 'look', face: 'right' }, P.kasif), sd + 8) : null;
      const C = Object.assign({ zoom: 1.05, focus: [0.5, 0.45] }, P.cam || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const cx = C.focus[0] * W, cy = C.focus[1] * H;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          water.update(t);
          if (ship) ship.update(t, { x: SP.x * W + Math.sin(lt * 0.6) * 12, y: surfY * H + 8, s: SP.s });
          // sonar pings
          let pd = '', ps = '';
          if (PG) {
            const a = atOr(cues, PG.at, 0.2), sc = PG.scatter === false ? null : atOr(cues, PG.scatter, null);
            const ox = SP.x * W, oy = surfY * H + 30, Rmax = (bedY - surfY) * H * 0.95, noise = (bedY - surfY) * H * 0.62;
            for (let k = 0; k < 4; k++) {
              const age = lt - a - k * PG.every;
              if (age < 0) continue;
              const u = (age % (PG.every * 4)) / 1.8;
              if (u > 1) continue;
              const R = 30 + u * Rmax, pts = [];
              for (let q = 0; q <= 12; q++) { const an = lerp(0.25, Math.PI - 0.25, q / 12); pts.push([ox + Math.cos(an) * R * 1.25, oy + Math.sin(an) * R]); }
              const broken = sc != null && lt >= sc && R > noise;
              if (!broken) pd += inkPath(pts, { w: lerp(8, 3, u), seed: sd + 200 + k, t, amp: 1.2, taper: 0.5 }) + ' ';
              else for (let q = 0; q < 12; q += 2) {
                const b = boil(sd + 300 + k * 20 + q, t, 26);
                ps += inkPath([[pts[q][0] + b[0], pts[q][1] + b[1]], [pts[q + 1][0] - b[1], pts[q + 1][1] + b[0]]], { w: 5, seed: sd + 260 + q, t, amp: 3 }) + ' ';
              }
            }
          }
          pingE.setAttribute('d', pd); pingS.setAttribute('d', ps);
          if (sub) {
            const a = atOr(cues, SB.at, 0.3), p = lt >= a ? progIO(lt, a, SB.dur) : 0;
            sub.update(t, { x: lerp(SB.from[0], SB.to[0], p) * W, y: lerp(SB.from[1], SB.to[1], p) * H + Math.sin(lt * 1.4) * 5, s: SB.s, face: SB.face, rot: Math.sin(lt * 1.1) * 1.2 });
          }
          // the colony: every shrimp snaps on its own clock; sparks at the claw tips
          let sf = '', sr = '', sl = '';
          if (CO) {
            const ca = CO.crackle == null ? null : atOr(cues, CO.crackle, null);
            const boost = ca == null ? 0 : (lt >= ca ? prog(lt, ca, 0.3) : 0);
            crew.forEach((c, i) => {
              const rate = CO.rate * lerp(1, 2.4, boost) / c.per;
              const u = (lt * rate + c.ph) % 1;
              const close = u < 0.06 ? u / 0.06 : u < 0.5 ? 1 : 1 - (u - 0.5) / 0.4;
              const r = c.node.update(t, { x: c.x * W, y: bedY * H + c.dy, s: c.s, face: c.face, close: clamp01(close), tiny: c.s < 0.3 });
              if (u >= 0.04 && u < 0.3) {
                const age = (u - 0.04) / 0.26, R = (26 + 20 * boost) * (1.2 - age * 0.6) * Math.max(0.6, Math.min(1.8, c.s / 0.2)), x = r.tip[0] + c.face * 22, y = r.tip[1] - 6, pts = [];
                for (let k = 0; k < 10; k++) { const an = k / 10 * Math.PI * 2 + i, rr = (k % 2 ? 0.42 : 1) * R; pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
                sf += inkLoop(pts, { seed: sd + 400 + i, t, smooth: false }) + ' ';
                sr += inkPath(pts, { w: 3.6, seed: sd + 450 + i, t, closed: true, smooth: false }) + ' ';
                for (let k = 0; k < 3; k++) {
                  const an = -Math.PI / 2 + (k - 1) * 0.6, r1 = R * 1.3 + age * 30;
                  sl += inkPath([[x + Math.cos(an) * r1, y + Math.sin(an) * r1], [x + Math.cos(an) * (r1 + 22), y + Math.sin(an) * (r1 + 22)]], { w: 5, seed: sd + 500 + i * 3 + k, t, amp: 0.8 }) + ' ';
                }
              }
            });
          }
          sparkF.setAttribute('d', sf); sparkR.setAttribute('d', sr); sparkL.setAttribute('d', sl);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
