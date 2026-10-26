// cas_pacific: an old ink map of the North Pacific in portrait (brand/kit/BRAND.md §3, §5): Japan's islands on the
// left, the coast of North America (Vancouver Island, Washington, Oregon, northern California) on the right, the
// Cascadia fault as a red barbed line offshore, drifting wave hatching on the sea, a compass rose. On "quake" a gold
// burst and shaking at the fault; on "rings" tsunami wave fronts sweep west across the ocean and hit Japan's coast
// (gold flash at Sanriku); an optional clock whose hand turns to an hour. Optional host (Kaşif) on the map.
// No set (a map has its own frame).
// Uses cas__lib.js (CAS) + td__lib.js (TD: label, figure).
// P: {quake: cue|sec|false, rings: {at: cue|sec, dur: 2.4} | false, clock: {at, x: 0.5, y: 0.2, r: 90, hour: 9} | false,
//     rings.reverse: true (fronts run back from Japan to the fault: "run the wave backwards"), na_dx: -0.12 (shift of North America),
//     card: false (true = old framed card; then scale: 0.8 + top: 0.165), route: cue|sec|false (dashed arrow fault -> Japan),
//     kasif: K | false, labels: [TD.label specs (screen 0..1)]}
// cues: hit (punch), plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const JAPAN = [[-0.06, 0.6], [0.0, 0.56], [0.06, 0.52], [0.11, 0.47], [0.15, 0.43], [0.19, 0.38], [0.215, 0.33], [0.235, 0.28], [0.245, 0.245], [0.235, 0.215], [0.215, 0.215], [0.2, 0.245], [0.18, 0.29], [0.15, 0.335], [0.11, 0.375], [0.06, 0.415], [0.0, 0.45], [-0.06, 0.5]];
  const HOKKAIDO = [[0.22, 0.2], [0.235, 0.17], [0.27, 0.15], [0.3, 0.165], [0.29, 0.19], [0.255, 0.2]];
  const KYUSHU = [[-0.06, 0.66], [-0.02, 0.62], [0.02, 0.64], [0.0, 0.69], [-0.06, 0.7]];
  const AMERICA = [[1.2, -0.05], [0.96, -0.05], [0.95, 0.05], [0.94, 0.12], [0.89, 0.16], [0.875, 0.2], [0.885, 0.24], [0.87, 0.28], [0.865, 0.31], [0.868, 0.35], [0.872, 0.39], [0.874, 0.43], [0.878, 0.47], [0.865, 0.5], [0.875, 0.53], [0.895, 0.57], [0.92, 0.62], [0.95, 0.72], [0.97, 0.85], [0.99, 1.05], [1.2, 1.05]];
  const VANCOUVER = [[0.835, 0.205], [0.85, 0.2], [0.868, 0.225], [0.86, 0.25], [0.84, 0.235]];
  const FAULT = [[0.83, 0.19], [0.825, 0.25], [0.83, 0.31], [0.835, 0.37], [0.84, 0.43], [0.845, 0.5]];

  SH.cas_pacific = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CAS = window.CAS, TD = window.TD, atOr = CAS.atOr, f1 = CAS.f1, sd = seed * 1000 + 919;
      const px = pts => pts.map(p => [p[0] * W, p[1] * H]);
      const root = el(svg, 'g');
      // the map card: drawn in map units, scaled to fit between the kicker and the caption strip, clipped to its frame
      // full-bleed by default (ocean edge to edge); P.card: true = the old framed card between kicker and captions
      const CARD = !!P.card, MS = CARD ? (P.scale ?? 0.8) : 1, MY = CARD ? (P.top ?? 0.165) * H : 0.12 * H;
      const DX = P.na_dx ?? -0.12;   // North America pulled in, so its coast has room for the host and labels
      const cid = 'casclip' + sd, cp = el(ctx.defs || svg, 'clipPath', { id: cid });
      if (CARD) el(cp, 'rect', { x: 0.03 * W, y: 0.12 * H, width: 0.94 * W, height: 0.54 * H });
      else el(cp, 'rect', { x: -W, y: -H, width: 3 * W, height: 3 * H });
      const mapG = el(root, 'g', { transform: `translate(${W / 2} ${MY}) scale(${MS}) translate(${-W / 2} ${-0.12 * H})` });
      const mapC = el(mapG, 'g', { 'clip-path': `url(#${cid})` });
      const toScr = p => [W / 2 + (p[0] - W / 2) * MS, MY + (p[1] - 0.12 * H) * MS];
      const hatch = inkEl(mapC, INK.blue, { 'fill-opacity': 0.55 });
      const ringsE = inkEl(mapC, INK.blue), route = inkEl(mapC, INK.red);
      const landF = inkEl(mapC, INK.paperDark), landT = inkEl(mapC, INK.green, { 'fill-opacity': 0.3 }), landR = inkEl(mapC), landH = inkEl(mapC, INK.inkSoft);
      const fault = inkEl(mapC, INK.red), burstF = inkEl(mapC, INK.gold), burstR = inkEl(mapC, INK.red), hitE = inkEl(mapC, INK.gold), hitR = inkEl(mapC);
      const frameE = inkEl(mapG);
      const comp = inkEl(mapC, INK.inkSoft), compN = inkEl(mapC, INK.red);
      const clockF = inkEl(root, INK.paperLight), clockR = inkEl(root), clockH = inkEl(root, INK.red);
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.5, y: 0.6, scale: 0.6, pose: 'point', face: 'right' }, P.kasif), sd + 60) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      const EPI = [(0.835 + DX) * W, 0.36 * H], JP = [0.235 * W, 0.28 * H], DIST = Math.hypot(EPI[0] - JP[0], EPI[1] - JP[1]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const qa = P.quake == null || P.quake === false ? null : atOr(cues, P.quake, null), qp = qa == null ? 0 : (lt >= qa ? 1 : 0), qk = punch(lt, qa, 0.9);
          // frame (old map border)
          if (CARD) frameE.setAttribute('d', inkPath(px([[0.03, 0.12], [0.97, 0.12], [0.97, 0.66], [0.03, 0.66]]), { w: 6, seed: sd + 1, t, closed: true, smooth: false }) + ' ' +
            inkPath(px([[0.045, 0.128], [0.955, 0.128], [0.955, 0.652], [0.045, 0.652]]), { w: 2.6, seed: sd + 2, t, closed: true, smooth: false }));
          // sea hatching (little arcs drifting)
          let hd = '';
          const R0 = CARD ? 0.16 : 0.02, NR = CARD ? 11 : 22;
          for (let row = 0; row < NR; row++) {
            const y = (R0 + row * 0.045) * H;
            for (let c = -1; c < 8; c++) {
              const x = ((c + (row % 2) * 0.5) / 7 + ((t * 0.02) % (1 / 7))) * W + 20;
              if (CARD && (x < 0.3 * W || x > 0.8 * W)) continue;
              hd += inkPath([[x - 26, y + 4], [x - 10, y - 6], [x + 6, y - 6], [x + 22, y + 4]], { w: 3.2, seed: sd + 10 + row * 7 + c, t, amp: 0.8 }) + ' ';
            }
          }
          hatch.setAttribute('d', hd);
          // land
          const sh = qk * Math.sin(lt * 70) * 7;
          const lands = [JAPAN, HOKKAIDO, KYUSHU, VANCOUVER, AMERICA].map((L, i) => px(L).map(p => i >= 3 ? [p[0] + DX * W + sh, p[1]] : p));
          landF.setAttribute('d', lands.map((L, i) => inkLoop(L, { seed: sd + 30 + i, t })).join(' '));
          landT.setAttribute('d', lands.map((L, i) => inkLoop(L.map(p => [p[0] + (i >= 3 ? 14 : -14), p[1]]), { seed: sd + 35 + i, t })).join(' '));
          landR.setAttribute('d', lands.map((L, i) => inkPath(L, { w: 6, seed: sd + 40 + i, t, closed: true })).join(' '));
          let lh = '';
          for (let k = 0; k < 6; k++) { const y = (0.2 + k * 0.07) * H; lh += inkPath([[(0.93 + DX) * W + sh, y], [(1.0 + DX * 0.3) * W, y - 20]], { w: 3, seed: sd + 50 + k, t, amp: 1 }) + ' ' + inkPath([[-10, y + 0.12 * H], [0.06 * W - k * 6, y + 0.1 * H]], { w: 3, seed: sd + 60 + k, t, amp: 1 }) + ' '; }
          landH.setAttribute('d', lh);
          // the Cascadia fault: red barbed line
          const F = px(FAULT).map(p => [p[0] + DX * W + sh, p[1]]);
          let fd = inkPath(F, { w: 7, seed: sd + 70, t });
          for (let k = 0; k < F.length - 1; k++) for (let s = 0.25; s < 1; s += 0.5) {
            const x = lerp(F[k][0], F[k + 1][0], s), y = lerp(F[k][1], F[k + 1][1], s);
            fd += ' ' + inkLoop([[x, y - 13], [x + 22, y], [x, y + 13]], { seed: sd + 71 + k * 2 + s * 4, t, smooth: false });
          }
          fault.setAttribute('d', fd);
          // quake burst
          if (qp) {
            const age = lt - qa, R = 70 + 30 * Math.min(1, age * 3) + 10 * Math.sin(t * 9), pts = [];
            for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, rr = k % 2 ? R * 0.5 : R; pts.push([EPI[0] + sh + Math.cos(a) * rr, EPI[1] + Math.sin(a) * rr]); }
            burstF.setAttribute('d', inkLoop(pts, { seed: sd + 80, t, smooth: false, amp: 2 }));
            burstR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 81, t, closed: true, smooth: false }));
          } else { burstF.setAttribute('d', ''); burstR.setAttribute('d', ''); }
          // wave fronts sweeping west
          const RG = P.rings || null, ra = RG ? atOr(cues, RG.at, null) : null;
          let rd = '', hd2 = '', hr2 = '';
          if (ra != null && lt >= ra) {
            const rp = (lt - ra) / (RG.dur ?? 2.4), rev = !!RG.reverse;   // reverse: the fronts run back from Japan to their source
            for (let k = 0; k < 4; k++) {
              const rad = rev ? (1 - Math.min(1, rp) + k * 0.12) * DIST * (rp < 1 ? 1 : 0) : (rp - k * 0.12) * DIST;
              if (rad < 20 || rad > DIST * 1.02) continue;
              const pts = [];
              for (let j = 0; j <= 20; j++) { const a = Math.PI * 0.62 + j / 20 * Math.PI * 0.76; pts.push([EPI[0] + Math.cos(a) * rad, EPI[1] + Math.sin(a) * rad * 0.8]); }
              rd += inkPath(pts, { w: 9 - k * 1.6, seed: sd + 90 + k, t, amp: 1.5, taper: 0.6 }) + ' ';
            }
            if (rev ? rp < 0.45 : rp >= 1) {
              const age = rev ? lt - ra : lt - ra - (RG.dur ?? 2.4), R = 50 + 25 * Math.min(1, age * 4) + 6 * Math.sin(t * 10), pts = [];
              for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? R * 0.5 : R; pts.push([JP[0] + 20 + Math.cos(a) * rr, JP[1] + Math.sin(a) * rr]); }
              hd2 = inkLoop(pts, { seed: sd + 100, t, smooth: false, amp: 2 }); hr2 = inkPath(pts, { w: 4, seed: sd + 101, t, closed: true, smooth: false });
            }
          }
          ringsE.setAttribute('d', rd); hitE.setAttribute('d', hd2); hitR.setAttribute('d', hr2);
          // dashed route arrow
          const roa = P.route == null || P.route === false ? null : atOr(cues, P.route, null), rop = roa == null ? 0 : prog(lt, roa, 1.2);
          let rt = '';
          if (rop > 0.01) {
            const A = [EPI[0] - 60, EPI[1] + 40], B = [JP[0] + 70, JP[1] + 60], C = [(A[0] + B[0]) / 2, Math.max(A[1], B[1]) + 160];
            const q = s => [(1 - s) * (1 - s) * A[0] + 2 * (1 - s) * s * C[0] + s * s * B[0], (1 - s) * (1 - s) * A[1] + 2 * (1 - s) * s * C[1] + s * s * B[1]];
            for (let s = 0; s < rop - 0.02; s += 0.06) rt += inkPath([q(s), q(Math.min(rop, s + 0.035))], { w: 7, seed: sd + 110 + Math.round(s * 50), t, amp: 1 }) + ' ';
            if (rop > 0.95) { const e = q(1), d = q(0.94), a = Math.atan2(e[1] - d[1], e[0] - d[0]); rt += inkLoop([[e[0] + Math.cos(a) * 26, e[1] + Math.sin(a) * 26], [e[0] + Math.cos(a + 2.3) * 26, e[1] + Math.sin(a + 2.3) * 26], [e[0] + Math.cos(a - 2.3) * 26, e[1] + Math.sin(a - 2.3) * 26]], { seed: sd + 170, t, smooth: false }); }
          }
          route.setAttribute('d', rt);
          // compass rose
          const cx = 0.14 * W, cy = 0.58 * H, cr = 54, sp = t * 0.15;
          comp.setAttribute('d', inkCircle(cx, cy, cr, sd + 120, t, { w: 3 }) + ' ' + [0, 1, 2, 3].map(k => { const a = k * Math.PI / 2 + Math.sin(sp) * 0.05; return inkPath([[cx, cy], [cx + Math.cos(a) * cr * 1.3, cy + Math.sin(a) * cr * 1.3]], { w: 3, seed: sd + 121 + k, t, amp: 0.6 }); }).join(' '));
          compN.setAttribute('d', inkLoop([[cx - 12, cy], [cx, cy - cr * 1.25], [cx + 12, cy]], { seed: sd + 126, t, smooth: false }));
          // clock
          const CK = P.clock || null;
          if (CK) {
            const ca = atOr(cues, CK.at, 0), cp = lt >= ca ? spring(lt, ca, 0.5) : 0, hp = prog(lt, ca + 0.2, 1.2);
            const x = (CK.x ?? 0.5) * W, y = (CK.y ?? 0.2) * H, R = (CK.r ?? 90) * cp * (1 + 0.06 * hit);
            if (cp > 0.01) {
              clockF.setAttribute('d', inkCircle(x, y, R, sd + 130, t, { fill: true }));
              let cr2 = inkCircle(x, y, R, sd + 131, t, { w: 8 });
              for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; cr2 += ' ' + inkPath([[x + Math.cos(a) * R * 0.78, y + Math.sin(a) * R * 0.78], [x + Math.cos(a) * R * 0.9, y + Math.sin(a) * R * 0.9]], { w: 4, seed: sd + 132 + k, t, amp: 0.5 }); }
              const hour = CK.hour ?? 9, ah = -Math.PI / 2 + lerp(0, hour / 12 * Math.PI * 2 + Math.PI * 2, hp), am = -Math.PI / 2 + lerp(0, Math.PI * 2 * 13, hp);
              cr2 += ' ' + inkPath([[x, y], [x + Math.cos(am) * R * 0.72, y + Math.sin(am) * R * 0.72]], { w: 6, seed: sd + 150, t, amp: 0.6 });
              clockR.setAttribute('d', cr2);
              clockH.setAttribute('d', inkPath([[x, y], [x + Math.cos(ah) * R * 0.5, y + Math.sin(ah) * R * 0.5]], { w: 10, seed: sd + 151, t, amp: 0.6 }) + ' ' + inkDot(x, y, 10, 10, sd + 152, t));
            }
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
