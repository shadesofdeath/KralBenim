// gal_b_probe: two spacecraft at the worlds Galileo first saw (02-galileo-teleskop, B5). "set": false: ink night sky,
// stars, frame filled edge to edge. Parchment ink, palette tokens only, pure function of (seed, lt).
//   "jupiter" — a banded giant Jupiter fills the right of the frame (drifting cloud bands, the Great Red Spot); its four
//               big moons at different depths (one huge and cropped in the lower-left foreground); the NASA probe
//               (dish antenna, booms, a `probe.label` tag) glides in from the left and reaches its place among the
//               moons on `probe.arrive`; a `badge` (year) pops on `badge.at`.
//   "moon"    — a close lunar horizon: a curved, cratered surface across the frame, a mountain range on it, Earth in the
//               black sky; a small spacecraft with a red crescent-and-star flag drifts in on `craft.at`; on `beam.at`
//               its camera throws a cone of light onto the mountains and a flash fires (again every 1.6 s); on
//               `inset.at` a small framed picture of the old 1609 spyglass pops up on the ground (lower left).
// P: {mode, probe: {at: 0, arrive: cue, label: "GALILEO"}, badge: {text, at}, craft: {at, flag: true},
//     beam: {at} (camera light cone + flash), glow: {at} (the peaks light up gold one by one under the craft), inset: {at}, labels}
// cues: the params above + hit (punch)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const star5 = (cx, cy, r, rot = 0) => { const p = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
  let clipN = 0;
  SH.gal_b_probe = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 661, mode = P.mode || 'jupiter', JUP = mode === 'jupiter';
      const SKY = mix(INK.blue, INK.ink, 0.55);
      const root = el(svg, 'g');
      const sky = inkEl(root, SKY), wash = inkEl(root, INK.paperLight, { 'fill-opacity': 0.05 });
      const stars = G.stars(el(root, 'g'), sd + 1, 80);
      const q = rng(inkHash(sd, 11));
      // ---------------------------------------------------------------- Jupiter mode
      const JX = 0.69 * W, JY = 0.64 * H, JR = 560;
      let J = null;
      if (JUP) {
        const id = 'galbprobe' + seed + '_' + (clipN++);
        const cp = el(defs || svg, 'clipPath', { id });
        el(cp, 'circle', { cx: JX, cy: JY, r: JR });
        const disc = inkEl(root, mix(INK.paperLight, INK.gold, 0.22));
        const bandG = el(root, 'g', { 'clip-path': `url(#${id})` });
        const BANDS = [[-0.86, -0.7, mix(INK.stain, INK.paperDark, 0.4)], [-0.55, -0.36, mix(INK.stain, INK.red, 0.3)], [-0.2, -0.08, mix(INK.gold, INK.stain, 0.5)], [0.04, 0.24, mix(INK.stain, INK.red, 0.35)], [0.4, 0.52, mix(INK.stain, INK.paperDark, 0.3)], [0.66, 0.8, mix(INK.stain, INK.red, 0.25)]];
        J = { disc, bands: BANDS.map(b => ({ v0: b[0], v1: b[1], e: inkEl(bandG, b[2]) })), swirl: inkEl(bandG, INK.inkSoft), spot: inkEl(bandG, mix(INK.red, INK.stain, 0.25)), spotL: inkEl(bandG, INK.ink), shade: inkEl(bandG, mix(INK.ink, INK.stain, 0.35), { 'fill-opacity': 0.55 }), rim: inkEl(root, INK.ink) };
        J.moonsF = [inkEl(root, mix(INK.gold, INK.paperLight, 0.4)), inkEl(root, INK.paperLight), inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25))];
        J.moonsD = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.2)); J.moonsL = inkEl(root, INK.ink);
        J.probe = el(root, 'g');
        J.pr = { dish: inkEl(J.probe, INK.paperLight), dishL: inkEl(J.probe, INK.ink), bus: inkEl(J.probe, INK.gold), boom: inkEl(J.probe, INK.ink), rtg: inkEl(J.probe, mix(INK.inkSoft, INK.paperDark, 0.3)), l: inkEl(J.probe, INK.ink), tag: inkEl(J.probe, INK.paperLight) };
        J.prT = el(J.probe, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 50, 'text-anchor': 'middle', fill: INK.ink });
        J.prT.textContent = (P.probe && P.probe.label) || 'GALILEO';
        J.callisto = { f: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.35)), cr: inkEl(root, mix(INK.ink, INK.inkSoft, 0.4)), l: inkEl(root, INK.ink) };
        J.CR = Array.from({ length: 22 }, () => [q() * 1.6 - 0.8, q() * 1.6 - 0.8, 0.03 + q() * 0.08]);
      }
      // ---------------------------------------------------------------- Moon mode
      let M = null;
      if (!JUP) {
        const cx = 0.5 * W, cy = 2600 + 0.44 * H, R = 2600;
        const ys = x => cy - Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
        const mount = (mx, h, wl, wr, s0) => { const r2 = rng(inkHash(sd, s0)), pts = [], top = ys(mx) - h; for (let k = 0; k <= 5; k++) { const u = k / 5; pts.push([lerp(mx - wl, mx, u), lerp(ys(mx - wl) + 6, top, u) + (k && k < 5 ? (r2() - 0.5) * h * 0.14 : 0)]); } for (let k = 1; k <= 5; k++) { const u = k / 5; pts.push([lerp(mx, mx + wr, u), lerp(top, ys(mx + wr) + 6, u) + (k < 5 ? (r2() - 0.5) * h * 0.14 : 0)]); } return pts; };
        const MT = [[0.22, 64], [0.34, 100], [0.46, 78], [0.56, 135], [0.64, 106], [0.76, 86], [0.9, 112]].map((m, i) => mount(m[0] * W, m[1], m[1] * 1.3, m[1] * 1.1, 30 + i));
        M = { ys, MT, earth: inkEl(root, INK.blue), land: inkEl(root, INK.green), earthL: inkEl(root, INK.ink), earthD: inkEl(root, SKY, { 'fill-opacity': 0.7 }),
          mtF: inkEl(root, mix(INK.paperLight, INK.paperDark, 0.35)), mtG: inkEl(root, INK.gold), mtD: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.25)), mtL: inkEl(root, INK.ink),
          ground: inkEl(root, INK.paperLight), crF: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.45)), crL: inkEl(root, INK.inkSoft), gl: inkEl(root, INK.ink),
          beam: inkEl(root, INK.gold, { 'fill-opacity': 0.42 }), beamL: inkEl(root, INK.gold), flash: inkEl(root, INK.paperLight), flashG: inkEl(root, INK.gold),
          craft: el(root, 'g'), inset: el(root, 'g'), fgF: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.15)), fgL: inkEl(root, INK.ink),
          CR: Array.from({ length: 14 }, () => [q() * W, q(), q()]) };
        M.c = { panel: inkEl(M.craft, mix(INK.blue, INK.ink, 0.35)), grid: inkEl(M.craft, INK.paperLight), body: inkEl(M.craft, INK.gold), flag: inkEl(M.craft, INK.red), cres: inkEl(M.craft, INK.paperLight), cresC: inkEl(M.craft, INK.red), star: inkEl(M.craft, INK.paperLight), lens: inkEl(M.craft, INK.ink), l: inkEl(M.craft, INK.ink) };
        M.ins = { frame: inkEl(M.inset, mix(INK.stain, INK.ink, 0.35)), paper: inkEl(M.inset, INK.paperLight), l: inkEl(M.inset, INK.ink) };
        M.insScope = G.scope(M.inset, sd + 5);
        M.insL2 = inkEl(M.inset, INK.ink);
      }
      const badge = P.badge ? G.label(root, Object.assign({ x: 0.4, y: 0.14, size: 92, font: 'serif', box: true }, P.badge), W, H, sd + 6) : null;
      const labels = (P.labels || []).map((L, i) => G.label(root, Object.assign({ color: 'paper' }, L), W, H, sd + 40 + i));

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          sky.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 3, t, amp: 0.4, smooth: false }));
          let wd = ''; for (let k = 0; k < 10; k++) { const y = 50 + k * 105; wd += G.line([[-40, y], [W * 0.35, y + 8], [W * 0.7, y - 5], [W + 40, y + 4]], sd + 4 + k, t, 2.4) + ' '; }
          wash.setAttribute('d', wd);
          stars.update(t, 0, 0, W, JUP ? H : 0.36 * H, 1);
          if (JUP) {
            J.disc.setAttribute('d', inkCircle(JX, JY, JR, sd + 10, t, { fill: true, n: 30 }));
            J.bands.forEach((b, i) => {
              const top = [], bot = [];
              for (let k = 0; k <= 24; k++) {
                const x = JX - JR + 2 * JR * k / 24;
                top.push([x, JY + b.v0 * JR + Math.sin(x * 0.012 + t * 0.35 + i) * 9]);
                bot.push([x, JY + b.v1 * JR + Math.sin(x * 0.01 - t * 0.3 + i * 2) * 11]);
              }
              b.e.setAttribute('d', inkLoop(top.concat(bot.reverse()), { seed: sd + 20 + i, t, amp: 0.6 }));
            });
            let sw = '';
            for (let k = 0; k < 12; k++) { const v = -0.8 + k * 0.14, x0 = JX - JR + ((k * 173 + lt * (18 + k * 3)) % (2 * JR)); sw += G.line([[x0, JY + v * JR], [x0 + 70, JY + v * JR + 6], [x0 + 130, JY + v * JR - 4]], sd + 30 + k, t, 2.4) + ' '; }
            J.swirl.setAttribute('d', sw);
            const spx = JX + JR * 0.18 + Math.sin(t * 0.2) * 10, spy = JY + JR * 0.31;
            J.spot.setAttribute('d', inkLoop(inkEllipsePts(spx, spy, 120, 56, sd + 40, 14), { seed: sd + 40, t, amp: 0.6 }));
            J.spotL.setAttribute('d', G.ring(inkEllipsePts(spx, spy, 120, 56, sd + 41, 14), sd + 42, t, 3.5, 0.6) + ' ' + G.line([[spx - 60, spy], [spx, spy - 18], [spx + 60, spy + 4]], sd + 43, t, 2.4));
            // night side crescent on the left limb
            const sh = [];
            for (let k = 0; k <= 16; k++) { const a = Math.PI / 2 + k / 16 * Math.PI; sh.push([JX + Math.cos(a) * (JR + 4), JY + Math.sin(a) * (JR + 4)]); }
            for (let k = 16; k >= 0; k--) { const a = Math.PI / 2 + k / 16 * Math.PI; sh.push([JX + Math.cos(a) * JR * 0.82 + JR * 0.06, JY + Math.sin(a) * JR]); }
            J.shade.setAttribute('d', inkLoop(sh, { seed: sd + 44, t, amp: 0.5 }));
            J.rim.setAttribute('d', inkCircle(JX, JY, JR * (1 + 0.006 * hp), sd + 45, t, { w: 6, n: 30 }));
            // three moons in the middle distance (Io, Europa, Ganymede), slow orbital drift
            const MN = [[0.33, 0.33, 34], [0.53, 0.25, 28], [0.2, 0.56, 50]];
            let md = '', ml = '';
            MN.forEach((m, i) => {
              const x = m[0] * W + Math.sin(t * 0.18 + i * 2) * 22, y = m[1] * H + Math.cos(t * 0.15 + i) * 8, r = m[2];
              J.moonsF[i].setAttribute('d', inkCircle(x, y, r, sd + 50 + i, t, { fill: true }));
              md += inkLoop([[x - r * 0.95, y - r * 0.3], [x - r * 0.4, y - r * 0.92], [x - r * 0.15, y], [x - r * 0.4, y + r * 0.92], [x - r * 0.95, y + r * 0.3]], { seed: sd + 55 + i, t, amp: 0.4 }) + ' ';
              ml += inkCircle(x, y, r, sd + 58 + i, t, { w: 4 }) + ' ';
              if (i === 0) for (let k = 0; k < 3; k++) md += inkDot(x + (k - 1) * r * 0.4, y + (k % 2 ? 0.3 : -0.25) * r, r * 0.13, r * 0.1, sd + 61 + k, t) + ' ';
            });
            J.moonsD.setAttribute('d', md); J.moonsL.setAttribute('d', ml);
            // the probe gliding in
            const PR = Object.assign({ at: 0, label: 'GALILEO' }, P.probe || {}), pa = G.atOr(cues, PR.at, 0), ar = Math.max(pa + 1, G.atOr(cues, PR.arrive, pa + dur * 0.7));
            const u = progIO(lt, pa, ar - pa), px = lerp(-0.12 * W, 0.42 * W, u) + Math.sin(t * 0.5) * 6, py = lerp(0.62 * H, 0.47 * H, u) + Math.cos(t * 0.6) * 5;
            const rot = -12 + Math.sin(t * 0.4) * 3 + (1 - u) * 10, s = 1.05 * (1 + 0.06 * punch(lt, ar, 0.7));
            J.probe.setAttribute('transform', `translate(${G.f1(px)} ${G.f1(py)}) rotate(${G.f1(rot)}) scale(${G.f1(s * 100) / 100})`);
            const dishP = []; for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + k / 12 * Math.PI; dishP.push([-Math.cos(a) * 46 - 40, Math.sin(a) * 120 - 70]); }
            dishP.push([-40, 50], [-40, -190]);
            J.pr.dish.setAttribute('d', inkLoop(dishP, { seed: sd + 70, t, amp: 0.5 }));
            let dl = G.ring(dishP, sd + 71, t, 4.5, 0.5); for (let k = -2; k <= 2; k++) dl += ' ' + G.line([[-40, -70 + k * 48], [-70, -70 + k * 40]], sd + 72 + k, t, 2.2);
            dl += ' ' + G.line([[-40, -70], [-140, -70]], sd + 78, t, 3) + ' ' + inkDot(-142, -70, 8, 8, sd + 79, t);
            J.pr.dishL.setAttribute('d', dl);
            const bus = [[-30, -40], [40, -50], [60, 0], [40, 50], [-30, 40], [-44, 0]];
            J.pr.bus.setAttribute('d', inkLoop(bus, { seed: sd + 80, t, amp: 0.5, smooth: false }));
            J.pr.boom.setAttribute('d', G.line([[40, -20], [190, -110]], sd + 81, t, 5) + ' ' + G.line([[40, 20], [190, 110]], sd + 82, t, 5) + ' ' + G.line([[60, 0], [320, 30]], sd + 83, t, 3));
            J.pr.rtg.setAttribute('d', inkLoop([[160, -130], [220, -96], [208, -76], [148, -110]], { seed: sd + 84, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[160, 130], [220, 96], [208, 76], [148, 110]], { seed: sd + 85, t, amp: 0.4, smooth: false }));
            J.pr.l.setAttribute('d', G.ring(bus, sd + 86, t, 4, 0.5) + ' ' + G.ring([[160, -130], [220, -96], [208, -76], [148, -110]], sd + 87, t, 3, 0.4) + ' ' + G.ring([[160, 130], [220, 96], [208, 76], [148, 110]], sd + 88, t, 3, 0.4) + ' ' + inkDot(322, 30, 10, 10, sd + 89, t));
            const tag = [[-90, 82], [130, 82], [130, 146], [-90, 146]];
            J.pr.tag.setAttribute('d', inkLoop(tag, { seed: sd + 90, t, amp: 0.4, smooth: false }));
            J.pr.l.setAttribute('d', J.pr.l.getAttribute('d') + ' ' + G.ring(tag, sd + 91, t, 3.5, 0.4) + ' ' + G.line([[10, 50], [20, 82]], sd + 92, t, 3));
            J.prT.setAttribute('x', 20); J.prT.setAttribute('y', 132);
            // Callisto: huge, cropped, in the lower-left foreground
            const cx = 0.06 * W, cy = 1.02 * H, cr = 250;
            J.callisto.f.setAttribute('d', inkCircle(cx, cy, cr, sd + 100, t, { fill: true, n: 24 }));
            let cc = '', clL = inkCircle(cx, cy, cr, sd + 101, t, { w: 6, n: 24 });
            J.CR.forEach((c, i) => { const x = cx + c[0] * cr, y = cy + c[1] * cr, r = c[2] * cr; if (Math.hypot(c[0], c[1]) > 0.9) return; cc += inkDot(x, y, r, r * 0.85, sd + 102 + i, t) + ' '; clL += ' ' + inkCircle(x, y, r * 1.15, sd + 130 + i, t, { w: 2 }); });
            J.callisto.cr.setAttribute('d', cc); J.callisto.l.setAttribute('d', clL);
          } else {
            const { ys } = M;
            // Earth in the black sky
            const ex = 0.76 * W, ey = 0.15 * H, er = 64;
            M.earth.setAttribute('d', inkCircle(ex, ey, er, sd + 200, t, { fill: true }));
            M.land.setAttribute('d', inkLoop(inkEllipsePts(ex - 14 + Math.sin(t * 0.2) * 6, ey - 10, 30, 22, sd + 201, 9, 0.4, 0.25), { seed: sd + 201, t, amp: 0.5 }) + ' ' + inkLoop(inkEllipsePts(ex + 24, ey + 24, 18, 12, sd + 202, 9, -0.3, 0.25), { seed: sd + 202, t, amp: 0.5 }));
            const ed = []; for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + k / 12 * Math.PI; ed.push([ex - Math.cos(a) * er, ey + Math.sin(a) * er]); } for (let k = 12; k >= 0; k--) { const a = -Math.PI / 2 + k / 12 * Math.PI; ed.push([ex - Math.cos(a) * er * 0.3, ey + Math.sin(a) * er]); }
            M.earthD.setAttribute('d', inkLoop(ed, { seed: sd + 203, t, amp: 0.4 }));
            M.earthL.setAttribute('d', inkCircle(ex, ey, er, sd + 204, t, { w: 4 }));
            // mountains on the horizon, then the cratered ground to the frame bottom
            let mf = '', mdk = '', ml = '';
            M.MT.forEach((m, i) => { const n = m.length, pk = Math.floor(n / 2); mf += inkLoop(m, { seed: sd + 210 + i, t, amp: 0.5, smooth: false }) + ' '; mdk += inkLoop(m.slice(0, pk + 1).concat([[m[pk][0] + 14, m[0][1]]]), { seed: sd + 220 + i, t, amp: 0.5, smooth: false }) + ' '; ml += G.line(m, sd + 230 + i, t, 4.5, 0.6, 0.15) + ' '; });
            M.mtF.setAttribute('d', mf); M.mtD.setAttribute('d', mdk); M.mtL.setAttribute('d', ml);
            // glow: the peaks catch gold light one by one under the passing craft (right -> left)
            const ga = P.glow ? G.atOr(cues, P.glow.at, null) : null;
            let gd = '';
            if (ga != null) M.MT.forEach((m, i) => {
              const j = M.MT.length - 1 - i, k = clamp01((lt - ga - j * 0.1) / 0.35); if (k <= 0) return;
              const top = Math.min(...m.map(p => p[1])), base = m[0][1], cut = top + (base - top) * 0.75 * k;
              const cap = []; for (let a = 0; a < m.length - 1; a++) { const p0 = m[a], p1 = m[a + 1]; if (p0[1] < cut) cap.push(p0); if ((p0[1] - cut) * (p1[1] - cut) < 0) { const u = (cut - p0[1]) / (p1[1] - p0[1]); cap.push([lerp(p0[0], p1[0], u), cut]); } }
              if (cap.length > 2) gd += inkLoop(cap, { seed: sd + 260 + i, t, amp: 0.4, smooth: false }) + ' ';
            });
            M.mtG.setAttribute('d', gd);
            const surf = []; for (let x = -40; x <= W + 40; x += 48) surf.push([x, ys(x) + Math.sin(x * 0.05) * 4]);
            M.ground.setAttribute('d', inkLoop(surf.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 240, t, amp: 0.5, smooth: false }));
            M.gl.setAttribute('d', G.line(surf, sd + 241, t, 6, 0.8, 0));
            let cf = '', cl = '';
            M.CR.forEach((c, i) => { const x = c[0], y = lerp(ys(x) + 40, H + 40, Math.pow(c[1], 1.3)), rx = lerp(30, 220, c[1]) * (0.7 + c[2] * 0.6), ry = rx * lerp(0.15, 0.32, c[1]); cl += G.ring(inkEllipsePts(x, y, rx, ry, sd + 250 + i, 14), sd + 270 + i, t, lerp(2, 5, c[1]), 0.5) + ' '; cf += inkLoop([[x - rx * 0.95, y - ry * 0.2], [x - rx * 0.3, y - ry * 0.85], [x - rx * 0.55, y], [x - rx * 0.3, y + ry * 0.7]], { seed: sd + 290 + i, t, amp: 0.4 }) + ' '; });
            M.crF.setAttribute('d', cf); M.crL.setAttribute('d', cl);
            // the spacecraft
            const CR = Object.assign({ at: 0, flag: true }, P.craft || {}), ca = G.atOr(cues, CR.at, 0), cu = progIO(lt, ca, 2.4);
            const kx = lerp(0.74 * W, 0.47 * W, cu) - Math.min(110, Math.max(0, lt - ca - 2.4) * 22) + Math.sin(t * 0.5) * 8, ky = 0.3 * H + Math.sin(t * 0.8) * 6, crot = Math.sin(t * 0.4) * 3;
            M.craft.setAttribute('transform', `translate(${G.f1(kx)} ${G.f1(ky)}) rotate(${G.f1(crot)}) scale(${G.f1((0.72 + 0.08 * spring(lt, ca, 0.8)) * 100) / 100})`);
            const pnl = s => [[s * 60, -26], [s * 230, -34], [s * 230, 34], [s * 60, 26]];
            M.c.panel.setAttribute('d', inkLoop(pnl(-1), { seed: sd + 300, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(pnl(1), { seed: sd + 301, t, amp: 0.4, smooth: false }));
            let gr = ''; for (const s of [-1, 1]) { for (let k = 1; k < 4; k++) gr += G.line([[s * (60 + k * 42.5), -28 - k * 2], [s * (60 + k * 42.5), 28 + k * 2]], sd + 302 + k + s * 5, t, 2) + ' '; gr += G.line([[s * 60, 0], [s * 230, 0]], sd + 310 + s, t, 2) + ' '; }
            M.c.grid.setAttribute('d', gr);
            const body = [[-60, -56], [60, -56], [60, 56], [-60, 56]];
            M.c.body.setAttribute('d', inkLoop(body, { seed: sd + 312, t, amp: 0.4, smooth: false }));
            const fl = [[-44, -40], [44, -40], [44, 20], [-44, 20]];
            if (CR.flag !== false) {
              M.c.flag.setAttribute('d', inkLoop(fl, { seed: sd + 313, t, amp: 0.3, smooth: false }));
              M.c.cres.setAttribute('d', inkCircle(-8, -10, 20, sd + 314, t, { fill: true, n: 12 }));
              M.c.cresC.setAttribute('d', inkCircle(-2, -10, 16, sd + 315, t, { fill: true, n: 12 }));
              M.c.star.setAttribute('d', inkLoop(star5(20, -10, 10, -0.3), { seed: sd + 316, t, amp: 0.2, smooth: false }));
            }
            M.c.lens.setAttribute('d', inkLoop([[-20, 56], [20, 56], [16, 80], [-16, 80]], { seed: sd + 317, t, amp: 0.3, smooth: false }));
            M.c.l.setAttribute('d', G.ring(body, sd + 318, t, 4.5, 0.4) + ' ' + G.ring(pnl(-1), sd + 319, t, 3.5, 0.4) + ' ' + G.ring(pnl(1), sd + 320, t, 3.5, 0.4) + ' ' + G.ring(fl, sd + 321, t, 2.5, 0.3) + ' ' + G.line([[0, -56], [0, -110]], sd + 322, t, 4) + ' ' + inkCircle(0, -116, 12, sd + 323, t, { w: 3.5 }));
            // camera beam + flash on the mountains
            const ba = P.beam ? G.atOr(cues, P.beam.at, null) : null;
            if (ba != null && lt >= ba) {
              const bk = spring(lt, ba, 0.6), cam = [kx, ky + 64], tg = [0.6 * W, ys(0.6 * W) - 20], hw = 150 * bk;
              const tgk = [lerp(cam[0], tg[0], Math.min(1, bk)), lerp(cam[1], tg[1], Math.min(1, bk))];
              M.beam.setAttribute('d', inkLoop([[cam[0] - 10, cam[1]], [cam[0] + 10, cam[1]], [tgk[0] + hw, tgk[1] + 30], [tgk[0] - hw, tgk[1] + 30]], { seed: sd + 330, t, amp: 0.6, smooth: false }));
              M.beamL.setAttribute('d', G.line([[cam[0] - 10, cam[1]], [tgk[0] - hw, tgk[1] + 30]], sd + 331, t, 3, 0.5, 0.4) + ' ' + G.line([[cam[0] + 10, cam[1]], [tgk[0] + hw, tgk[1] + 30]], sd + 332, t, 3, 0.5, 0.4));
              const fp = ((lt - ba - 0.5) % 1.6 + 1.6) % 1.6, fk = lt >= ba + 0.5 && fp < 0.45 ? Math.sin(fp / 0.45 * Math.PI) : 0;
              if (fk > 0.01) {
                                const rr2 = 18 + fk * 26;
                M.flash.setAttribute('d', inkCircle(tg[0], tg[1], rr2 * 0.6, sd + 333, t, { fill: true }));
                M.flashG.setAttribute('d', inkCircle(tg[0], tg[1], 30 + (1 - fk) * 60 + hp * 10, sd + 334, t, { w: 5 * fk + 1 }));
              } else { M.flash.setAttribute('d', ''); M.flashG.setAttribute('d', ''); }
            } else for (const e of [M.beam, M.beamL, M.flash, M.flashG]) e.setAttribute('d', '');
            // inset: the old 1609 spyglass in a small frame on the ground
            const ia = P.inset ? G.atOr(cues, P.inset.at, null) : null;
            if (ia != null && lt >= ia) {
              const ik = spring(lt, ia, 0.7), ix = 0.64 * W, iy = 0.5 * H, iw = 120 * ik, ih = 78 * ik;
              const fr = [[ix - iw - 18, iy - ih - 18], [ix + iw + 18, iy - ih - 18], [ix + iw + 18, iy + ih + 18], [ix - iw - 18, iy + ih + 18]], pp = [[ix - iw, iy - ih], [ix + iw, iy - ih], [ix + iw, iy + ih], [ix - iw, iy + ih]];
              M.ins.frame.setAttribute('d', inkLoop(fr, { seed: sd + 340, t, amp: 0.4, smooth: false }));
              M.ins.paper.setAttribute('d', inkLoop(pp, { seed: sd + 341, t, amp: 0.4, smooth: false }));
              M.ins.l.setAttribute('d', G.ring(fr, sd + 342, t, 4, 0.4) + ' ' + G.ring(pp, sd + 343, t, 3, 0.4));
              M.insScope.update(t, { x: ix - iw * 0.62, y: iy + ih * 0.35, ang: -24, len: iw * 1.3, r: 12 * ik, tripod: { gy: iy + ih * 0.92 } });
              M.insL2.setAttribute('d', G.line([[ix - iw * 0.9, iy + ih * 0.92], [ix + iw * 0.9, iy + ih * 0.92]], sd + 344, t, 3) + ' ' + inkCircle(ix + iw * 0.62, iy - ih * 0.5, 22 * ik, sd + 345, t, { w: 3 }));
              M.inset.style.display = '';
            } else M.inset.style.display = 'none';
            // foreground: a big crater rim and boulders cropped at the bottom edge
            const rim = [[-40, H + 40], [-40, H * 0.93], [W * 0.1, H * 0.9], [W * 0.2, H * 0.93], [W * 0.28, H + 40]];
            const bl1 = [[W * 0.8, H + 40], [W * 0.82, H * 0.92], [W * 0.88, H * 0.89], [W * 0.95, H * 0.92], [W * 0.98, H + 40]];
            M.fgF.setAttribute('d', inkLoop(rim, { seed: sd + 350, t, amp: 0.6 }) + ' ' + inkLoop(bl1, { seed: sd + 351, t, amp: 0.6, smooth: false }));
            M.fgL.setAttribute('d', G.ring(rim, sd + 352, t, 5, 0.6) + ' ' + G.ring(bl1, sd + 353, t, 5, 0.6));
          }
          if (badge) badge.update(lt, t, cues);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
