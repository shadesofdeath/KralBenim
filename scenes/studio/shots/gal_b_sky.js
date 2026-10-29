// gal_b_sky: big ink sky diagrams drawn into a night sky over an observatory terrace (02-galileo-teleskop, B3/B4).
// "set": false: an ink night sky fills the frame down to a stone parapet and a tiled terrace floor (foreground) with a
// brass armillary sphere cropped in the lower-left corner; the diagram is drawn in light ink across the sky.
//   "jupiter" — left: a small blue Earth inside the old nested circles (Moon, Sun, a planet riding them); right: a big
//               banded Jupiter with four moons running on ellipse orbits; on `break` the outer Earth circle turns red
//               and snaps open (its planet drifts away). Kaşif between the two systems.
//   "venus"   — a row of Venus phases (big thin crescent -> small full disc) springs in on `phases.at`; on `orbit.at`
//               the Sun appears, the row slides into place on the Venus orbit around it (each phase where it is seen
//               from Earth), Earth pops up, then one Venus runs round the orbit with a dashed sight line from Earth
//               and its phase changing as it goes.
//   "helio"   — an orrery that starts Earth-centred (Moon, Mercury, Venus, Sun, Mars on ellipses around Earth); on
//               `move` Earth slides out onto its own orbit and the Sun takes the centre; `label` writes "Kopernik";
//               on `dome.at` a dark church-dome silhouette rises behind the terrace and the diagram dims in its shade.
// P: {mode, earth: {x: 0.2, y: 0.45}, jupiter: {x: 0.72, y: 0.45, r: 90, orbits: 4}, break: cue,
//     phases: {at, n: 5}, orbit: {at}, sun: {x: 0.6, y: 0.43}, label: {text, at, x: 0.5, y: 0.13},
//     move: cue, dome: {at}, ground: 0.82, armillary: true, kasif: GAL.person, labels: [GAL.label]}
// cues: break / phases.at / orbit.at / move / dome.at / label.at + person cues; hit punches the diagram
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  // a phase disc: dark disc + the lit part (fraction k 0 new .. 1 full) facing direction rot (rad)
  function phasePts(cx, cy, r, k, rot) {
    const c = Math.cos(rot), s = Math.sin(rot), pts = [], N = 14;
    const T = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
    for (let i = 0; i <= N; i++) { const v = -1 + 2 * i / N, w = Math.sqrt(Math.max(0, 1 - v * v)); pts.push(T(w * r, v * r)); }
    for (let i = N; i >= 0; i--) { const v = -1 + 2 * i / N, w = Math.sqrt(Math.max(0, 1 - v * v)); pts.push(T((1 - 2 * k) * w * r, v * r)); }
    return pts;
  }
  const ellP = (cx, cy, rx, ry, a) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];

  SH.gal_b_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 561, mode = P.mode || 'jupiter';
      const gy = (P.ground ?? 0.82) * H;
      const SKY = mix(INK.blue, INK.ink, 0.45);
      const root = el(svg, 'g');
      const sky = inkEl(root, SKY), wash = inkEl(root, INK.paperLight, { 'fill-opacity': 0.06 });
      const stars = G.stars(el(root, 'g'), sd + 1, 60);
      const dome = mode === 'helio' ? { f: inkEl(root, mix(INK.ink, SKY, 0.25)), l: inkEl(root, mix(INK.inkSoft, SKY, 0.4)), w: inkEl(root, mix(INK.gold, INK.ink, 0.35)) } : null;
      const dg = el(root, 'g');
      // diagram layers (colours set per frame so the helio dome can dim them)
      const D = { orb: inkEl(dg, INK.paperLight), orbR: inkEl(dg, INK.red), dash: inkEl(dg, INK.gold), sunGlow: inkEl(dg, INK.gold, { 'fill-opacity': 0.3 }), sun: inkEl(dg, INK.gold), sunR: inkEl(dg, INK.gold),
        earth: inkEl(dg, INK.blue), land: inkEl(dg, INK.green), dark: inkEl(dg, mix(INK.ink, INK.inkSoft, 0.4)), lit: inkEl(dg, mix(INK.paperLight, INK.gold, 0.12)),
        body: inkEl(dg, INK.paperLight), red: inkEl(dg, INK.red), rim: inkEl(dg, INK.paperLight) };
      const jupG = el(dg, 'g'), jup = mode === 'jupiter' ? G.jupiter(jupG, sd + 2) : null;
      const front = el(dg, 'g'), moonsF = inkEl(front, INK.paperLight), moonsL = inkEl(front, INK.ink);
      // terrace: parapet + floor + armillary
      const parF = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.3)), parL = inkEl(root, INK.ink);
      const flF = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.42)), flL = inkEl(root, INK.inkSoft), flE = inkEl(root, INK.ink);
      const actG = el(root, 'g');
      const kas = P.kasif ? G.person(actG, Object.assign({ who: 'kasif', y: 0.86 }, P.kasif), sd + 30) : null;
      const arm = P.armillary === false ? null : { stand: inkEl(root, mix(INK.stain, INK.ink, 0.35)), rings: inkEl(root, INK.gold), l: inkEl(root, INK.ink), ball: inkEl(root, INK.blue) };
      const labG = el(root, 'g');
      const labels = (P.labels || []).map((L, i) => G.label(labG, Object.assign({ color: 'paper' }, L), W, H, sd + 40 + i));
      const LB = P.label ? G.label(labG, Object.assign({ x: 0.5, y: 0.13, size: 76, font: 'serif', color: 'gold', underline: true }, P.label), W, H, sd + 50) : null;
      const sunAt = (cx, cy, r, t, k = 1) => {
        D.sunGlow.setAttribute('d', inkCircle(cx, cy, r * 1.5 * k, sd + 60, t, { fill: true }));
        D.sun.setAttribute('d', inkCircle(cx, cy, r * k, sd + 61, t, { fill: true }));
        let rr = ''; for (let i = 0; i < 12; i++) { const a = i / 12 * G.TAU + t * 0.2, l = 1.7 + 0.15 * Math.sin(t * 3 + i); rr += G.line([[cx + Math.cos(a) * r * 1.15 * k, cy + Math.sin(a) * r * 1.15 * k], [cx + Math.cos(a) * r * l * k, cy + Math.sin(a) * r * l * k]], sd + 62 + i, t, 4.5) + ' '; }
        D.sunR.setAttribute('d', rr);
      };
      const earthAt = (x, y, r, t) => {
        const e = inkEllipsePts(x, y, r, r, sd + 80, 12);
        D.earth.setAttribute('d', inkLoop(e, { seed: sd + 80, t, amp: 0.5 }));
        D.land.setAttribute('d', inkLoop(inkEllipsePts(x - r * 0.25, y - r * 0.2, r * 0.42, r * 0.3, sd + 81, 9, 0.5, 0.2), { seed: sd + 81, t, amp: 0.5 }) + ' ' + inkLoop(inkEllipsePts(x + r * 0.35, y + r * 0.3, r * 0.3, r * 0.22, sd + 82, 9, -0.4, 0.2), { seed: sd + 82, t, amp: 0.5 }));
        return G.ring(e, sd + 83, t, 4, 0.5);
      };
      // venus geometry (baked)
      const SUN = Object.assign({ x: 0.6, y: 0.43 }, P.sun || {}), Sx = SUN.x * W, Sy = SUN.y * H, VR = 250;
      const EA = Object.assign({ x: 0.17, y: 0.5 }, P.earth || {});
      const Ex = mode === 'venus' ? EA.x * W : 0, Ey = mode === 'venus' ? EA.y * H : 0;
      const thE = Math.atan2(Ey - Sy, Ex - Sx);
      const venusAt = a => {
        const vx = Sx + Math.cos(a) * VR, vy = Sy + Math.sin(a) * VR * 0.92;
        const s1 = Math.atan2(Sy - vy, Sx - vx), e1 = Math.atan2(Ey - vy, Ex - vx);
        const al = Math.abs(((s1 - e1 + 3 * Math.PI) % G.TAU) - Math.PI);
        return { x: vx, y: vy, k: (1 + Math.cos(al)) / 2, rot: s1, d: Math.hypot(Ex - vx, Ey - vy) };
      };
      const NPH = (P.phases && P.phases.n) || 5;
      const PH = Array.from({ length: NPH }, (_, i) => { const dl = lerp(28, 168, i / (NPH - 1)) * Math.PI / 180; return Object.assign(venusAt(thE - dl), { a: thE - dl }); });
      PH.forEach((p, i) => { p.rr = lerp(112, 34, i / (NPH - 1)); p.rx = lerp(0.2, 0.86, i / (NPH - 1)) * W; p.ry = 0.42 * H; });

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          sky.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, gy], [-40, gy]], { seed: sd + 3, t, amp: 0.4, smooth: false }));
          let wd = ''; for (let k = 0; k < 8; k++) { const y = 50 + k * 105; wd += G.line([[-40, y], [W * 0.35, y + 8], [W * 0.7, y - 5], [W + 40, y + 4]], sd + 4 + k, t, 2.4) + ' '; }
          wash.setAttribute('d', wd);
          stars.update(t, 0, 0, W, gy - 140, 1);
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          for (const e of Object.values(D)) e.setAttribute('d', '');
          moonsF.setAttribute('d', ''); moonsL.setAttribute('d', '');
          let dim = 0;
          if (mode === 'jupiter') {
            const EP = Object.assign({ x: 0.2, y: 0.45 }, P.earth || {}), ex = EP.x * W, ey = EP.y * H;
            const ba = G.atOr(cues, P.break ?? 'hit', null), bk = ba == null ? 0 : progIO(lt, ba, 0.7);
            // old nested circles around Earth, each with a body riding it
            const RS = [[120, 0.5, 13, 'body'], [190, 0.3, 26, 'sun'], [265, 0.18, 15, 'red']];
            let orb = '', orbR = '', body = '', red = '', rim = '';
            RS.forEach((c, i) => {
              const dk = clamp01((lt - 0.1 - i * 0.25) / 0.9), last = i === RS.length - 1;
              const pts = [], gap = last ? bk * 0.55 : 0, a0 = -0.6;
              for (let j = 0; j <= 48; j++) {
                const a = a0 + gap + (G.TAU - 2 * gap) * j / 48 * dk;
                const bend = last && bk > 0 ? Math.pow(Math.max(0, 1 - Math.min(j, 48 - j) / 10), 2) * bk * 40 : 0;
                pts.push(ellP(ex, ey, c[0] + bend, (c[0] + bend) * 0.92, a));
              }
              const d = G.line(pts, sd + 100 + i, t, last ? 3.5 + bk * 3 : 3, 0.6, 0.1);
              if (last && bk > 0) orbR += d + ' '; else orb += d + ' ';
              const a = c[1] * lt * G.TAU * 0.5 + i * 2;
              let p = ellP(ex, ey, c[0], c[0] * 0.92, a);
              if (last && ba != null && lt >= ba) { const a2 = c[1] * ba * G.TAU * 0.5 + i * 2, p0 = ellP(ex, ey, c[0], c[0] * 0.92, a2), dl = lt - ba; p = [p0[0] - Math.sin(a2) * dl * 120, p0[1] + Math.cos(a2) * dl * 110]; }
              if (dk > 0.5) {
                if (c[3] === 'sun') { const r = c[2]; D.sunGlow.setAttribute('d', inkCircle(p[0], p[1], r * 1.6, sd + 110, t, { fill: true })); D.sun.setAttribute('d', inkCircle(p[0], p[1], r, sd + 111, t, { fill: true })); }
                else if (c[3] === 'red') red += inkDot(p[0], p[1], c[2], c[2], sd + 112, t) + ' ';
                else body += inkDot(p[0], p[1], c[2], c[2], sd + 113, t) + ' ';
              }
            });
            rim += earthAt(ex, ey, 46 * (1 + 0.05 * hp), t);
            D.orb.setAttribute('d', orb); D.orbR.setAttribute('d', orbR); D.body.setAttribute('d', body); D.red.setAttribute('d', red); D.rim.setAttribute('d', rim);
            // Jupiter + four moons on bright ellipse orbits (moons behind the disc are hidden)
            const JP = Object.assign({ x: 0.72, y: 0.45, r: 90, orbits: 4 }, P.jupiter || {}), jx = JP.x * W, jy = JP.y * H, jr = JP.r;
            const OR = [[jr + 50, 0.32], [jr + 105, 0.2], [jr + 170, 0.13], [jr + 245, 0.08]].slice(0, JP.orbits);
            let jo = '', mf = '', ml = '';
            const behind = [];
            OR.forEach((o, i) => {
              const dk = clamp01((lt - 0.4 - i * 0.2) / 0.9); if (dk <= 0) return;
              const pts = []; for (let j = 0; j <= Math.ceil(48 * dk); j++) pts.push(ellP(jx, jy, o[0], o[0] * 0.36, j / 48 * G.TAU));
              jo += G.line(pts, sd + 120 + i, t, 2.6, 0.5, 0.1) + ' ';
              const a = (i * 0.27 + o[1] * lt) * G.TAU, p = ellP(jx, jy, o[0], o[0] * 0.36, a), r = 13 + i * 1.5;
              if (dk < 0.6) return;
              if (Math.sin(a) < 0) behind.push([p, r, i]); else { mf += inkDot(p[0], p[1], r, r, sd + 130 + i, t) + ' '; ml += inkCircle(p[0], p[1], r, sd + 135 + i, t, { w: 3 }) + ' '; }
            });
            D.dash.setAttribute('d', jo);
            jup.update(t, { x: jx, y: jy, r: jr * (1 + 0.04 * hp), moons: behind.filter(b => Math.abs(b[0][0] - jx) > jr).map(b => ({ dx: b[0][0] - jx, dy: b[0][1] - jy, r: b[1] })) });
            moonsF.setAttribute('d', mf); moonsL.setAttribute('d', ml);
            D.dash.setAttribute('fill', mix(INK.paperLight, INK.gold, 0.5));
          } else if (mode === 'venus') {
            const pa = G.atOr(cues, (P.phases || {}).at, 0.3), oa = G.atOr(cues, (P.orbit || {}).at, null);
            const ok = oa == null ? 0 : progIO(lt, oa, 0.8);
            let dark = '', lit = '', rim = '', orb = '';
            // the Sun, the orbit, Earth
            if (oa != null && lt >= oa) {
              sunAt(Sx, Sy, 64, t, spring(lt, oa, 0.8) * (1 + 0.04 * hp));
              const pts = []; for (let j = 0; j <= Math.ceil(56 * ok); j++) pts.push(ellP(Sx, Sy, VR, VR * 0.92, thE + Math.PI + j / 56 * G.TAU));
              orb += G.line(pts, sd + 140, t, 3, 0.5, 0.1) + ' ';
              if (lt >= oa + 0.3) rim += earthAt(Ex, Ey, 40 * spring(lt, oa + 0.3, 0.7), t) + ' ';
            }
            const arrive = oa == null ? 1e9 : oa + 0.2 + NPH * 0.12 + 1.2;
            PH.forEach((p, i) => {
              const k0 = spring(lt, pa + i * 0.22, 0.6); if (lt < pa + i * 0.22) return;
              const u = oa == null ? 0 : progIO(lt, oa + 0.2 + i * 0.12, 1.2);
              const x = lerp(p.rx, p.x, u), y = lerp(p.ry, p.y, u), r = lerp(p.rr, 22, u) * k0, rot = lerp(0, p.rot, u);
              const e = inkEllipsePts(x, y, r, r, sd + 150 + i, 12);
              dark += inkLoop(e, { seed: sd + 150 + i, t, amp: 0.4 }) + ' ';
              lit += inkLoop(phasePts(x, y, r, p.k, rot), { seed: sd + 160 + i, t, amp: 0.4 }) + ' ';
              rim += G.ring(e, sd + 170 + i, t, 2.5, 0.4) + ' ';
            });
            // after the row has landed: one Venus running round, sight line from Earth
            if (lt >= arrive) {
              const a = PH[0].a - (lt - arrive) * 0.55, v = venusAt(a), r = 40;
              const e = inkEllipsePts(v.x, v.y, r, r, sd + 180, 12);
              dark += inkLoop(e, { seed: sd + 180, t, amp: 0.4 }) + ' ';
              lit += inkLoop(phasePts(v.x, v.y, r, v.k, v.rot), { seed: sd + 181, t, amp: 0.4 }) + ' ';
              rim += G.ring(e, sd + 182, t, 3.5, 0.4) + ' ';
              let ds = ''; const n = 14;
              for (let j = 0; j < n; j++) { const u0 = j / n, u1 = u0 + 0.5 / n; ds += G.line([[lerp(Ex, v.x, u0), lerp(Ey, v.y, u0)], [lerp(Ex, v.x, u1), lerp(Ey, v.y, u1)]], sd + 190 + j, t, 3.5, 0.4, 0) + ' '; }
              D.dash.setAttribute('d', ds);
            }
            D.dark.setAttribute('d', dark); D.lit.setAttribute('d', lit); D.rim.setAttribute('d', rim); D.orb.setAttribute('d', orb);
          } else {
            // helio: geocentric -> heliocentric
            const C = [0.5 * W, 0.44 * H], ma = G.atOr(cues, P.move ?? 'move', null), u = ma == null ? 0 : progIO(lt, ma, 1.8);
            const a = 0.6 + lt * 0.22, RE = 300, FY = 0.5;
            const E = [C[0] + u * RE * Math.cos(a + Math.PI), C[1] + u * RE * FY * Math.sin(a + Math.PI)];
            const Sn = [C[0] + (1 - u) * RE * Math.cos(a), C[1] + (1 - u) * RE * FY * Math.sin(a)];
            const O = [lerp(E[0], Sn[0], u), lerp(E[1], Sn[1], u)];
            const da = P.dome ? G.atOr(cues, P.dome.at, null) : null;
            dim = da == null ? 0 : progIO(lt, da, 1.4);
            let orb = '', body = '', red = '';
            const PL = [[110, 1.3, 9, 'body'], [190, 0.9, 13, 'lit'], [420, 0.4, 14, 'red']];
            PL.forEach((pl, i) => {
              const dk = clamp01((lt - 0.1 - i * 0.2) / 0.9); if (dk <= 0) return;
              const pts = []; for (let j = 0; j <= Math.ceil(56 * dk); j++) pts.push(ellP(O[0], O[1], pl[0], pl[0] * FY, j / 56 * G.TAU));
              orb += G.line(pts, sd + 200 + i, t, 2.8, 0.5, 0.1) + ' ';
              const p = ellP(O[0], O[1], pl[0], pl[0] * FY, i * 1.7 + lt * pl[1] * 0.5);
              if (pl[3] === 'red') red += inkDot(p[0], p[1], pl[2], pl[2], sd + 210 + i, t) + ' ';
              else body += inkDot(p[0], p[1], pl[2], pl[2], sd + 210 + i, t) + ' ';
            });
            // the 300 circle: around Earth it carries the Sun; around the Sun it carries Earth
            const dk = clamp01((lt - 0.2) / 0.9), pts = [];
            for (let j = 0; j <= Math.ceil(56 * dk); j++) pts.push(ellP(O[0], O[1], RE, RE * FY, j / 56 * G.TAU));
            orb += G.line(pts, sd + 220, t, 4, 0.5, 0.1);
            sunAt(Sn[0], Sn[1], 56 * (1 + 0.05 * hp), t);
            let rim = earthAt(E[0], E[1], 34, t);
            const mp = ellP(E[0], E[1], 64, 64 * 0.7, lt * 1.1);
            body += inkDot(mp[0], mp[1], 9, 9, sd + 230, t);
            D.orb.setAttribute('d', orb); D.body.setAttribute('d', body); D.red.setAttribute('d', red); D.rim.setAttribute('d', rim);
            // dim the diagram in the dome's shade
            D.orb.setAttribute('fill', mix(INK.paperLight, INK.inkSoft, dim * 0.65));
            D.body.setAttribute('fill', mix(INK.paperLight, INK.inkSoft, dim * 0.5));
            D.sun.setAttribute('fill', mix(INK.gold, INK.inkSoft, dim * 0.45));
            D.sunR.setAttribute('fill', mix(INK.gold, INK.inkSoft, dim * 0.45));
            // church dome silhouette rising behind the terrace
            if (da != null && lt >= da - 0.05) {
              const rise = (1 - dim) * 760, cx = W * 0.5, base = gy + rise, dr = 470;
              const drum = [[cx - dr * 0.95, base + 40], [cx - dr * 0.95, base - 170], [cx + dr * 0.95, base - 170], [cx + dr * 0.95, base + 40]];
              const dp = [[cx - dr, base - 170]];
              for (let k = 0; k <= 16; k++) { const an = Math.PI + k / 16 * Math.PI; dp.push([cx + Math.cos(an) * dr, base - 170 + Math.sin(an) * dr * 0.98]); }
              const lan = [[cx - 46, base - 170 - dr * 0.98 + 8], [cx - 46, base - 170 - dr * 0.98 - 110], [cx + 46, base - 170 - dr * 0.98 - 110], [cx + 46, base - 170 - dr * 0.98 + 8]];
              const top = base - 170 - dr * 0.98 - 110;
              const cross = G.line([[cx, top], [cx, top - 90]], sd + 240, t, 10) + ' ' + G.line([[cx - 30, top - 60], [cx + 30, top - 60]], sd + 241, t, 9);
              dome.f.setAttribute('d', inkLoop(drum, { seed: sd + 242, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(dp, { seed: sd + 243, t, amp: 0.6 }) + ' ' + inkLoop(lan, { seed: sd + 244, t, amp: 0.5, smooth: false }) + ' ' + cross);
              let rb = ''; for (let k = -3; k <= 3; k++) { const x = cx + k * dr * 0.27; rb += G.line([[x, base - 170 - Math.sqrt(Math.max(0, 1 - (k * 0.27) ** 2)) * dr * 0.96], [cx + k * dr * 0.34, base - 172]], sd + 250 + k, t, 3) + ' '; }
              for (let k = 0; k < 8; k++) { const x = cx - dr * 0.8 + k * dr * 0.229; rb += G.line([[x, base - 150], [x, base - 20]], sd + 260 + k, t, 3) + ' '; }
              dome.l.setAttribute('d', rb);
              let wn = ''; for (let k = 0; k < 7; k++) { const x = cx - dr * 0.7 + k * dr * 0.233; wn += inkLoop([[x, base - 130], [x + 34, base - 130], [x + 34, base - 60], [x, base - 60]], { seed: sd + 270 + k, t, amp: 0.4, smooth: false }) + ' '; }
              dome.w.setAttribute('d', wn);
            } else for (const e of Object.values(dome)) e.setAttribute('d', '');
          }
          // terrace parapet + floor (foreground)
          const py0 = gy - 110, py1 = gy;
          let pf = inkLoop([[-40, py0], [W + 40, py0 - 2], [W + 40, py0 + 24], [-40, py0 + 26]], { seed: sd + 300, t, amp: 0.5, smooth: false }) + ' ' + inkLoop([[-40, py1 - 22], [W + 40, py1 - 24], [W + 40, py1 + 4], [-40, py1 + 6]], { seed: sd + 301, t, amp: 0.5, smooth: false });
          let pl = G.line([[-40, py0], [W + 40, py0 - 2]], sd + 302, t, 5) + ' ' + G.line([[-40, py0 + 26], [W + 40, py0 + 24]], sd + 303, t, 4) + ' ' + G.line([[-40, py1 - 22], [W + 40, py1 - 24]], sd + 304, t, 4);
          for (let x = 30, k = 0; x < W; x += 80, k++) {
            const b = [[x - 12, py0 + 26], [x + 12, py0 + 26], [x + 17, py0 + 46], [x + 9, py0 + 58], [x + 15, py1 - 22], [x - 15, py1 - 22], [x - 9, py0 + 58], [x - 17, py0 + 46]];
            pf += ' ' + inkLoop(b, { seed: sd + 310 + k, t, amp: 0.4 }); pl += ' ' + G.ring(b, sd + 340 + k, t, 3, 0.4);
          }
          parF.setAttribute('d', pf); parL.setAttribute('d', pl);
          flF.setAttribute('d', inkLoop([[-40, gy - 2], [W + 40, gy - 4], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 370, t, amp: 0.5, smooth: false }));
          let fl = '';
          for (let k = 1; k < 4; k++) { const y = gy + (H - gy) * (k / 4) ** 1.2; fl += G.line([[-40, y], [W + 40, y + 2]], sd + 371 + k, t, 2.2) + ' '; }
          for (let k = -9; k <= 9; k++) fl += G.line([[W / 2 + k * 120, gy], [W / 2 + k * 290, H + 40]], sd + 380 + k, t, 2.2) + ' ';
          flL.setAttribute('d', fl); flE.setAttribute('d', G.line([[-40, gy - 2], [W + 40, gy - 4]], sd + 400, t, 6));
          if (kas) kas.update(lt, t, cues, W, H);
          // brass armillary sphere, cropped in the lower-left corner, its rings turning
          if (arm) {
            const ax = 130, ay = H * 0.83, ar = 150;
            arm.stand.setAttribute('d', inkLoop([[ax - 40, ay + ar * 0.9], [ax + 40, ay + ar * 0.9], [ax + 90, H + 40], [ax - 90, H + 40]], { seed: sd + 410, t, amp: 0.5, smooth: false }));
            let rg = '', ln = '';
            for (let k = 0; k < 3; k++) {
              const a = lt * (0.35 + k * 0.12) + k * 1.2, rx = ar * Math.abs(Math.cos(a)) + 10, rot = k * 0.9 - 0.4;
              const e = inkEllipsePts(ax, ay, rx, ar, sd + 420 + k, 18, rot);
              rg += G.ring(e, sd + 430 + k, t, 9, 0.5) + ' '; ln += G.ring(e, sd + 440 + k, t, 2.5, 0.5) + ' ';
            }
            const eq = inkEllipsePts(ax, ay, ar * 1.08, ar * 0.32, sd + 450, 18, -0.25);
            rg += G.ring(eq, sd + 451, t, 12, 0.5); ln += G.ring(eq, sd + 452, t, 3, 0.5);
            arm.rings.setAttribute('d', rg); arm.l.setAttribute('d', ln);
            arm.ball.setAttribute('d', inkCircle(ax, ay, 26, sd + 453, t, { fill: true }));
          }
          labels.forEach(l => l.update(lt, t, cues));
          if (LB) LB.update(lt, t, cues);
        },
      };
    },
  };
})();
