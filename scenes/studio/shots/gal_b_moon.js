// gal_b_moon: the Moon's terminator up close (02-galileo-teleskop, B3). "set": false, fills the frame edge to edge.
// Parchment ink, palette tokens only (INK.*), pure function of (seed, lt); no Math.random.
//   "dots"   — a frame-filling half Moon (GAL.moon) on an ink night sky, seen through the brass rim of the telescope
//              (the four corners are the eyepiece mask); on `dots.at` tiny gold points of light appear one by one in the
//              dark side just beside the terminator.
//   "grow"   — same Moon; from `grow.at` the points swell, slide to the terminator and merge with the lit side while the
//              terminator moves into the dark; an hourglass in the lower-left corner keeps flipping.
//   "shadow" — the Moon's limb as a curved horizon across the frame: a mountain on it, the low Sun in the top-right
//              corner; on `ray.at` a sunbeam grazes the peak and the mountain's long shadow runs across the ground,
//              then ray + shadow + height draw themselves as a right triangle with a "?"; on `measure.at` a red
//              measuring arrow grows along the height and the "?" goes.
// P: {mode: "dots"|"grow"|"shadow",
//     moon: {x, y (0..1 of W/H, centre), r (px), term (-1..1; shadow mode: terminator x = cx + term * r)},
//     dots: {at: cue, dur: 1.6}, grow: {at: cue, dur: 3}, hourglass: {x: 0.12, y: 0.78, at: cue, size: 1},
//     peak: {x: 0.66 (0..1 W), h: 250 (px), len: 0.3 (shadow length, 0..1 W)}, sun: {y: -0.06, r: 130} (on the grazing line) (shadow mode),
//     ray: {at: cue}, measure: {at: cue}, labels: [GAL.label] (colour defaults to "paper" on the night sky)}
// cues: dots, merge (punch), plus whatever the params reference
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_b_moon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 501, mode = P.mode || 'dots', SHD = mode === 'shadow';
      const M = Object.assign(SHD ? { x: 0.5, y: 2.53, r: 2400, term: -0.25 } : { x: 0.55, y: 0.5, r: 470, term: 0 }, P.moon || {});
      const SKY = mix(INK.blue, INK.ink, 0.45);
      const root = el(svg, 'g');
      const sky = inkEl(root, SKY), wash = inkEl(root, INK.paperLight, { 'fill-opacity': 0.06 });
      const stars = G.stars(el(root, 'g'), sd + 1, SHD ? 40 : 70);
      const moon = SHD ? null : G.moon(el(root, 'g'), sd + 2);
      const q = rng(inkHash(sd, 17));
      // ---------------------------------------------------------------- shadow mode: static geometry, baked once
      let S = null;
      if (SHD) {
        const cx = M.x * W, cy = M.y * H, R = M.r;
        const BUMP = Array.from({ length: 64 }, () => (q() - 0.5) * 12);
        const ys = x => cy - Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));
        const PK = Object.assign({ x: 0.66, h: 250 }, P.peak || {}), px = PK.x * W, py = ys(px) - PK.h;
        const SU = Object.assign({ y: -0.06, r: 130 }, P.sun || {});
        // the shadow's tip (shadow length PK.len of W), the Sun on the grazing line tip -> peak, near the top edge
        const tipX = px - (PK.len ?? 0.3) * W, tipY = ys(tipX);
        const kS = (SU.y * H - py) / (py - tipY), sx = SU.x != null ? SU.x * W : px + (px - tipX) * kS, sy = SU.x != null ? SU.y * H : py + (py - tipY) * kS;
        const termX = cx + (M.term ?? -0.25) * R;
        const CR = Array.from({ length: 16 }, (_, i) => { const v = (i + q()) / 16; return [q() * W, v, q()]; });
        // a mountain outline on the limb (left base -> peak -> right base), jag fixed per seed
        const mount = (mx, h, wl, wr, s0) => {
          const r2 = rng(inkHash(sd, s0)), pts = [], top = ys(mx) - h;
          for (let k = 0; k <= 6; k++) { const u = k / 6, x = lerp(mx - wl, mx, u); pts.push([x, lerp(ys(mx - wl) + 4, top, u) + (k > 0 && k < 6 ? (r2() - 0.5) * h * 0.12 : 0)]); }
          for (let k = 1; k <= 6; k++) { const u = k / 6, x = lerp(mx, mx + wr, u); pts.push([x, lerp(top, ys(mx + wr) + 4, u) + (k < 6 ? (r2() - 0.5) * h * 0.12 : 0)]); }
          return pts;
        };
        const HILLS = [[0.06, 70], [0.2, 110], [0.33, 60], [0.47, 95], [0.86, 120], [0.97, 80]].map((h, i) => mount(h[0] * W, h[1], h[1] * 1.6, h[1] * 1.4, 40 + i));
        const MAIN = mount(px, PK.h, PK.h * 1.05, PK.h * 0.85, 77);
        S = { cx, cy, R, ys, BUMP, px, py, sx, sy, sr: SU.r, tipX, tipY, termX, CR, HILLS, MAIN,
          glow: inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), sun: inkEl(root, INK.gold), sunR: inkEl(root, INK.gold),
          beams: inkEl(root, INK.gold, { 'fill-opacity': 0.5 }),
          lit: inkEl(root, INK.paperLight), night: inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)),
          crF: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.45)), crL: inkEl(root, INK.inkSoft),
          hillF: inkEl(root, mix(INK.paperLight, INK.paperDark, 0.55)), hillD: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3)),
          mtF: inkEl(root, mix(INK.paperLight, INK.gold, 0.12)), mtD: inkEl(root, mix(INK.inkSoft, INK.ink, 0.3)), mtH: inkEl(root, INK.ink),
          shadow: inkEl(root, INK.ink), surfL: inkEl(root, INK.ink), hillL: inkEl(root, INK.ink),
          ray: inkEl(root, INK.gold), triI: inkEl(root, INK.ink), triO: inkEl(root, INK.gold),
          measO: inkEl(root, INK.paperLight), meas: inkEl(root, INK.red) };
        S.qm = el(root, 'text', { x: px + 90, y: (py + tipY) / 2 + 40, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.paperLight, stroke: INK.ink, 'stroke-width': 4, 'paint-order': 'stroke' });
        S.qm.textContent = '?';
      }
      // ---------------------------------------------------------------- dots / grow: the eyepiece mask + hourglass
      const mask = SHD ? null : { f: inkEl(root, mix(INK.ink, INK.stain, 0.3), { 'fill-rule': 'evenodd' }), ring: inkEl(root, INK.gold), l: inkEl(root, INK.ink), riv: inkEl(root, INK.gold) };
      const HG = (mode === 'grow' && P.hourglass !== false) ? Object.assign({ x: 0.12, y: 0.78, size: 1 }, P.hourglass || {}) : null;
      const hg = HG ? { wood: inkEl(root, mix(INK.stain, INK.ink, 0.3)), glass: inkEl(root, INK.paperLight, { 'fill-opacity': 0.22 }), sand: inkEl(root, INK.gold), l: inkEl(root, INK.paperLight) } : null;
      const labels = (P.labels || []).map((L, i) => G.label(root, Object.assign({ color: 'paper' }, L), W, H, sd + 60 + i));

      function hourglass(lt, t, cues) {
        const a = G.atOr(cues, HG.at, 0.3), k = spring(lt, a, 0.7);
        if (lt < a) { for (const e of Object.values(hg)) e.setAttribute('d', ''); return; }
        const s = HG.size * k, cx = HG.x * W, cy = HG.y * H, w = 130 * s, h = 230 * s;
        const T = 2.2, ph = Math.max(0, lt - a) / T, n = Math.floor(ph), u = ph - n;
        const rot = Math.PI * (n + progIO(u, 0.78, 0.22)), c = Math.cos(rot), sn = Math.sin(rot);
        const R = p => [cx + p[0] * c - p[1] * sn, cy + p[0] * sn + p[1] * c];
        const top = 1 - clamp01(u / 0.78), bot = 1 - top;
        const gl = [[-w / 2, -h / 2], [w / 2, -h / 2], [w * 0.42, -h * 0.3], [w * 0.08, -h * 0.04], [w * 0.08, h * 0.04], [w * 0.42, h * 0.3], [w / 2, h / 2], [-w / 2, h / 2], [-w * 0.42, h * 0.3], [-w * 0.08, h * 0.04], [-w * 0.08, -h * 0.04], [-w * 0.42, -h * 0.3]].map(R);
        hg.glass.setAttribute('d', inkLoop(gl, { seed: sd + 300, t, amp: 0.4 }));
        hg.l.setAttribute('d', G.ring(gl, sd + 301, t, 4, 0.4) + (u < 0.78 ? ' ' + G.line([R([0, -h * 0.04]), R([0, h / 2 - 8 - bot * h * 0.26])], sd + 302, t, 3) : ''));
        let sdp = '';
        if (top > 0.02) { const yl = -h * 0.04 - top * h * 0.26, wl = w * lerp(0.08, 0.42, (-yl - h * 0.04) / (h * 0.26)); sdp += inkLoop([[-wl, yl], [wl, yl], [w * 0.08, -h * 0.04], [-w * 0.08, -h * 0.04]].map(R), { seed: sd + 303, t, amp: 0.3, smooth: false }) + ' '; }
        if (bot > 0.02) sdp += inkLoop([[-w * 0.45, h / 2 - 6], [w * 0.45, h / 2 - 6], [0, h / 2 - 6 - bot * h * 0.26]].map(R), { seed: sd + 304, t, amp: 0.3, smooth: false });
        hg.sand.setAttribute('d', sdp);
        const cap = y0 => [[-w * 0.64, y0 - 12], [w * 0.64, y0 - 12], [w * 0.64, y0 + 12], [-w * 0.64, y0 + 12]].map(R);
        hg.wood.setAttribute('d', inkLoop(cap(-h / 2 - 8), { seed: sd + 305, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(cap(h / 2 + 8), { seed: sd + 306, t, amp: 0.4, smooth: false }) +
          ' ' + G.line([R([-w * 0.56, -h / 2]), R([-w * 0.56, h / 2])], sd + 307, t, 7) + ' ' + G.line([R([w * 0.56, -h / 2]), R([w * 0.56, h / 2])], sd + 308, t, 7));
      }

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          sky.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 3, t, amp: 0.4, smooth: false }));
          let wd = ''; for (let k = 0; k < 10; k++) { const y = 50 + k * 105; wd += G.line([[-40, y], [W * 0.35, y + 8], [W * 0.7, y - 5], [W + 40, y + 4]], sd + 4 + k, t, 2.4) + ' '; }
          wash.setAttribute('d', wd);
          if (!SHD) {
            stars.update(t, 0, 0, W, H, 1);
            const cx = M.x * W + Math.sin(t * 0.35) * 8, cy = M.y * H + Math.cos(t * 0.3) * 5;
            let dots = 0, grow = 0, term = M.term ?? 0;
            if (mode === 'dots') { const D = P.dots || {}; const a = G.atOr(cues, D.at, 0.4); dots = clamp01((lt - a) / (D.dur ?? 1.6)); }
            else { const Gr = P.grow || {}; const a = G.atOr(cues, Gr.at, 0.3); dots = 1; grow = progIO(lt, a, Gr.dur ?? 3); term -= 0.12 * grow; }
            const pk = punch(lt, G.atOr(cues, mode === 'dots' ? 'dots' : 'merge', null), 0.6);
            moon.update(t, { x: cx, y: cy, r: M.r * (1 + 0.03 * pk), term, rough: 1, dots, grow, spin: 0.25, shade: 0.9 });
            // eyepiece mask: the corners are the dark brass tube, a gold rim with turning rivets
            const ex = W / 2, ey = H / 2, rx = W * 0.53, ry = H * 0.6;
            const ell = inkEllipsePts(ex, ey, rx, ry, sd + 20, 40, 0, 0.004);
            mask.f.setAttribute('d', `M-40 -40 L${W + 40} -40 L${W + 40} ${H + 40} L-40 ${H + 40} Z ` + inkLoop(ell, { seed: sd + 20, t, amp: 0.5 }));
            const ell2 = inkEllipsePts(ex, ey, rx * 1.035, ry * 1.04, sd + 21, 40, 0, 0.004);
            mask.ring.setAttribute('d', G.ring(ell, sd + 22, t, 18, 0.5));
            mask.l.setAttribute('d', G.ring(ell2, sd + 23, t, 5, 0.5) + ' ' + G.ring(inkEllipsePts(ex, ey, rx * 0.985, ry * 0.985, sd + 24, 40, 0, 0.004), sd + 25, t, 4, 0.5));
            let rv = '';
            for (let i = 0; i < 28; i++) { const a = i / 28 * G.TAU + t * 0.05; rv += inkDot(ex + Math.cos(a) * rx * 1.08, ey + Math.sin(a) * ry * 1.09, 9, 9, sd + 30 + i, t) + ' '; }
            mask.riv.setAttribute('d', rv);
            if (hg) hourglass(lt, t, cues);
          } else {
            const { cx, cy, R, ys, BUMP } = S;
            stars.update(t, 0, 0, W, ys(cx) - 30, 1);
            // the low Sun in the top-right corner: glow + turning rays
            let rr = '';
            for (let i = 0; i < 14; i++) { const a = i / 14 * G.TAU + t * 0.12; rr += G.line([[S.sx + Math.cos(a) * S.sr * 1.15, S.sy + Math.sin(a) * S.sr * 1.15], [S.sx + Math.cos(a) * S.sr * (1.5 + 0.1 * Math.sin(t * 3 + i)), S.sy + Math.sin(a) * S.sr * (1.5 + 0.1 * Math.sin(t * 3 + i))]], sd + 100 + i, t, 6) + ' '; }
            S.sunR.setAttribute('d', rr);
            S.glow.setAttribute('d', inkCircle(S.sx, S.sy, S.sr * 1.35, sd + 98, t, { fill: true }));
            S.sun.setAttribute('d', inkCircle(S.sx, S.sy, S.sr, sd + 99, t, { fill: true }));
            // lit ground and the night side beyond the terminator
            const surf = [];
            for (let i = 0, x = -40; x <= W + 40; x += 40, i++) surf.push([x, ys(x) + BUMP[i % 64]]);
            S.lit.setAttribute('d', inkLoop(surf.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 110, t, amp: 0.5, smooth: false }));
            S.surfL.setAttribute('d', G.line(surf, sd + 111, t, 6, 0.8, 0));
            const nt = surf.filter(p => p[0] < S.termX);
            if (nt.length) {
              const rag = []; for (let k = 0; k <= 8; k++) { const y = lerp(ys(S.termX), H + 40, k / 8); rag.push([S.termX + BUMP[(k * 7) % 64] * 3, y]); }
              S.night.setAttribute('d', inkLoop(nt.concat(rag, [[-40, H + 40]]), { seed: sd + 112, t, amp: 0.5, smooth: false }));
            }
            // craters in perspective: flatter near the horizon, bigger towards the viewer
            let cf = '', cl = '';
            S.CR.forEach((c, i) => {
              const x = c[0], y0 = ys(x) + 50, y = lerp(y0, H + 60, Math.pow(c[1], 1.2)), rx = lerp(26, 190, c[1]) * (0.7 + c[2] * 0.6), ry = rx * lerp(0.16, 0.34, c[1]);
              cl += G.ring(inkEllipsePts(x, y, rx, ry, sd + 120 + i, 14), sd + 140 + i, t, lerp(2, 5, c[1]), 0.5) + ' ';
              cf += inkLoop([[x + rx * 0.95, y - ry * 0.2], [x + rx * 0.3, y - ry * 0.85], [x + rx * 0.55, y], [x + rx * 0.3, y + ry * 0.7]], { seed: sd + 160 + i, t, amp: 0.4 }) + ' ';
            });
            S.crF.setAttribute('d', cf); S.crL.setAttribute('d', cl);
            // low hills along the limb and the main mountain: lit faces right (towards the Sun), shadow faces left
            const face = (pts, lit) => {
              const n = pts.length, pk = Math.floor(n / 2);
              return [inkLoop(pts, { seed: sd + 170 + n, t, amp: 0.5, smooth: false }), inkLoop(pts.slice(0, pk + 1).concat([[pts[pk][0] + (pts[n - 1][0] - pts[pk][0]) * 0.18, pts[0][1]]]), { seed: sd + 171 + n, t, amp: 0.5, smooth: false })];
            };
            let hf = '', hd = '', hl = '';
            S.HILLS.forEach((h, i) => { const [a, b] = face(h); hf += a + ' '; hd += b + ' '; hl += G.line(h, sd + 180 + i, t, 4, 0.6, 0.2) + ' '; });
            S.hillF.setAttribute('d', hf); S.hillD.setAttribute('d', hd);
            const [mf, md] = face(S.MAIN);
            S.mtF.setAttribute('d', mf); S.mtD.setAttribute('d', md);
            let mh = ''; for (let k = 1; k < 6; k++) { const a = S.MAIN[k], b = [a[0] + 30, ys(a[0]) - 6]; mh += G.line([a, [lerp(a[0], b[0], 0.7), lerp(a[1], b[1], 0.7)]], sd + 190 + k, t, 2.4) + ' '; }
            S.mtH.setAttribute('d', mh + ' ' + G.line(S.MAIN, sd + 196, t, 5, 0.7, 0.15));
            S.hillL.setAttribute('d', hl);
            // a few soft sunbeams sweeping over the ground (above the peak)
            const ang = Math.atan2(S.py - S.sy, S.px - S.sx);
            let bm = '';
            for (let k = 1; k <= 3; k++) {
              const off = -k * 70 + Math.sin(t * 0.8 + k) * 10, nx = -Math.sin(ang) * off, ny = Math.cos(ang) * off;
              const a = [S.sx + nx, S.sy + ny], b = [S.sx + nx + Math.cos(ang) * 2400, S.sy + ny + Math.sin(ang) * 2400];
              bm += G.line([a, b], sd + 200 + k, t, 3, 0.4, 0) + ' ';
            }
            S.beams.setAttribute('d', bm);
            // the grazing ray, the shadow, the triangle and the measure
            const ra = G.atOr(cues, (P.ray || {}).at, 0.4), rk = progIO(lt, ra, 1.1);
            const PKt = [S.px, S.py], TIP = [S.tipX, S.tipY];
            let rd = '', shd = '';
            if (lt >= ra) {
              const e0 = [S.sx + Math.cos(ang) * S.sr, S.sy + Math.sin(ang) * S.sr];
              const k1 = clamp01(rk / 0.5), k2 = clamp01((rk - 0.5) / 0.5);
              const mid = [lerp(e0[0], PKt[0], k1), lerp(e0[1], PKt[1], k1)];
              rd = G.line([e0, mid], sd + 210, t, 8, 0.6, 0.1);
              if (k2 > 0) rd += ' ' + G.line([PKt, [lerp(PKt[0], TIP[0], k2), lerp(PKt[1], TIP[1], k2)]], sd + 211, t, 8, 0.6, 0.1);
              if (k2 > 0) {   // shadow strip along the ground, from the mountain's foot to the tip
                const x0 = S.MAIN[0][0] + 20, x1 = lerp(x0, S.tipX, k2), top = [], bot = [];
                for (let k = 0; k <= 12; k++) { const x = lerp(x0, x1, k / 12), y = ys(x); top.push([x, y - 2]); bot.push([x, y + lerp(26, 5, k / 12)]); }
                shd = inkLoop(top.concat(bot.reverse()), { seed: sd + 212, t, amp: 0.4 });
              }
            }
            S.ray.setAttribute('d', rd); S.shadow.setAttribute('d', shd);
            const ta = ra + 1.3, tk = progIO(lt, ta, 0.9), B = [S.px, S.tipY];
            const triAt = (w, cw) => {
              let d = '';
              if (lt < ta) return d;
              const vk = clamp01(tk / 0.5), hk = clamp01((tk - 0.4) / 0.6);
              for (let k = 0; k < 8; k++) { const u0 = k / 8, u1 = u0 + 0.07; if (u0 > vk) break; d += G.line([[S.px, lerp(S.py, B[1], u0)], [S.px, lerp(S.py, B[1], Math.min(u1, vk))]], sd + 220 + k, t, w, 0.4, 0) + ' '; }
              if (hk > 0) d += G.line([B, [lerp(B[0], TIP[0], hk), B[1]]], sd + 230, t, w, 0.4, 0) + ' ';
              if (hk > 0.9) d += G.line([[B[0] - 46, B[1]], [B[0] - 46, B[1] - 46], [B[0], B[1] - 46]], sd + 231, t, cw, 0.4, 0);
              return d;
            };
            // ink halo + gold core: reads on the night sky and on the lit ground
            S.triI.setAttribute('d', triAt(17, 12));
            S.triO.setAttribute('d', triAt(9, 6));
            const ma = G.atOr(cues, (P.measure || {}).at, null), mk = ma == null ? 0 : spring(lt, ma, 0.7), mp = punch(lt, ma, 0.7);
            const qk = lt < ta + 0.6 ? 0 : (ma != null && lt >= ma ? 1 - clamp01((lt - ma) / 0.25) : spring(lt, ta + 0.6, 0.6));
            S.qm.setAttribute('transform', `translate(${G.f1(S.px + 130)} ${G.f1((S.py + S.tipY) / 2)}) scale(${G.f1(Math.max(0.001, qk) * (1 + 0.06 * Math.sin(t * 4)) * 100) / 100}) translate(${G.f1(-(S.px + 110))} ${G.f1(-((S.py + S.tipY) / 2))})`);
            S.qm.setAttribute('x', G.f1(S.px + 110)); S.qm.setAttribute('y', G.f1((S.py + S.tipY) / 2 + 42));
            S.qm.style.visibility = qk > 0.01 ? 'visible' : 'hidden';
            let ms = '';
            if (ma != null && lt >= ma) {
              const mx = S.px + 80 + mp * 6, y0 = S.tipY, y1 = lerp(S.tipY, S.py, Math.min(1, mk)), hd = 40;
              ms = G.line([[mx, y0], [mx, y1]], sd + 240, t, 17, 0.5, 0) + ' ' + G.line([[mx - hd, y1 + hd], [mx, y1], [mx + hd, y1 + hd]], sd + 241, t, 14, 0.5, 0) + ' ' + G.line([[mx - hd, y0 - hd], [mx, y0], [mx + hd, y0 - hd]], sd + 242, t, 14, 0.5, 0);
              for (let k = 1; k < 6; k++) { const y = lerp(y0, S.py, k / 6); if (y > y1) ms += ' ' + G.line([[mx - 26, y], [mx + 26, y]], sd + 243 + k, t, 8, 0.4, 0); }
              ms += ' ' + G.line([[mx - 22, y1], [mx + 22, y1]], sd + 250, t, 6, 0.4, 0);
            }
            S.meas.setAttribute('d', ms);
            S.measO.setAttribute('d', '');
            // a paper-light halo under the red measure keeps it readable on the night sky
            if (ms) S.measO.setAttribute('d', G.line([[S.px + 80, S.tipY], [S.px + 80, lerp(S.tipY, S.py, Math.min(1, mk))]], sd + 251, t, 32, 0.5, 0));
          }
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
