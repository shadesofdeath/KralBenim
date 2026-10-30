// es_spin: "Earth's spin is slowing" shots (Stickstory long, 2026-10-30) in the parchment ink style (BRAND.md §3, §5).
// Every line boils at 8 Hz (_ink.js), palette tokens only (INK.*), everything a pure function of (seed, lt).
// Uses td__lib.js (window.TD: stars, earth, sun, label, figure). Made for 16:9 (long video), parametric.
// Shared params: labels: [TD.label specs {text, x, y, at, size, color, font, box, rot}], kasif: K | false
//   (K = {x, y (ground, 0..1), scale, pose, face, dir, emotion, seq, text, item}), cast: [K with hat: false, accessory, beard],
//   stars: n, zoom: 1.05 (slow push), shake: cue. cues: hit (punch) + every "at" name.
//
// SHOTS.es_eclipse — an ancient Chinese court under the Sun: hall with upswept eaves (left), gate tower (right), courtyard
//   ground; the Moon slides over the Sun (cover: {at, dur: 4, from: 0, to: 1}); on `total` the sky darkens (hatching),
//   the gold corona flares and stars appear. slips: {x: 0.72, y: 0.8, s: 1, at (brush writes columns), dur} = a bundle of
//   bamboo slips on a low table in the foreground. P: {sun: {x: 0.5, y: 0.3, r: 120}, ground: 0.78, court: true,
//   cover, total, slips, cast, kasif, labels, dark: 0..1 (start darkness)}
// SHOTS.es_globe — Earth in space (TD.earth) with optional: track {from: -1.2, to: 0, at, dur: 2.2, v: -0.1, w: 70, curve: 0.25,
//   color: "ink"|"red"} (an eclipse shadow band clipped to the globe that slides horizontally; to = 0 puts it through the pin),
//   pin {u, v (-1..1 of r), text, at}, wedge {at, deg: 85, text} (red slice of the globe), spin: 1 (continent drift speed),
//   fast {at, k: 4} (spin speeds up + speed streaks), ice {at} (polar caps shrink, blue arrows run to the equator),
//   arrow: true (curved spin arrow), earth {x: 0.5, y: 0.5, r: 330}.
// SHOTS.es_tide — Earth + Moon in space. P: {earth: {x: 0.3, y: 0.5, r: 190}, moon: {d: 700, r: 70, ang: -8 (deg)},
//   bulge {at, amp: 0.32, lag: 14}, brake {at} (red counter-arrows + friction marks), recede {at, dur: 4, to: 860, ruler:
//   {text: "3.8 cm a year"}}, orbit {speed: 0.04 (laps/s), fast: {at, to: 0.25}, trail: true}, laser {at, period: 2.4},
//   arrow: true}
//   mode "mirror": standing on the Moon: grey ground with craters, the Apollo 11 laser reflector (panel of corner cubes on
//   legs), boot prints, Earth in the black sky; laser {at} beam comes down, panel flashes and the beam goes back.
// SHOTS.es_tablet — clay tablets. mode "tablet": one big tablet on a table, cuneiform wedges press in row by row (write
//   {at, dur}), a reed stylus moving; sign {at} = a small eclipse disc scratched in. mode "shelf": shelves of tablets
//   that slide in, a clock-face stamp pops on `clock` (cue).
// SHOTS.es_coral — fossil horn coral. mode "desk": a lamp-lit desk, a big horn coral, a magnifier (lens {at, x, y}), a
//   scientist (cast). mode "lines": extreme close on the coral wall: thin daily ridges draw in (draw {at, dur}), every
//   `band`-th ridge is a thick yearly band; tags day/year {at}. Counter count {from, to, at, dur, x, y, label, color}
//   (works in both modes; the ridges under the lens light up as it counts). stamp {text, at}.
// SHOTS.es_clock — clocks. mode "atomic": lab bench with a caesium beam tube, a seconds counter ticking, and a small
//   globe that wobbles. mode "leap": a huge display: seq [{at, text, color}] (e.g. 23:59:58, 23:59:59, 23:59:60 red,
//   00:00:00). mode "servers": racks with screens; crash {at, n} red ✗ screens + sparks, one after another. mode "tally":
//   a wall board, 27 tally marks (n) draw in (draw {at, dur}), last tag {text, at}. mode "dial": a 24-hour dial, a fast
//   hand, hours {from: 24, to: 22, at, dur} (a red slice shows the missing hours, a counter shows the day length).
//   mode "drift": two clocks (ATOMS vs EARTH), gap {at, dur, text: "1 HOUR"} bar grows between them.
//   mode "pages": a tear-off calendar, pages fly off faster and faster; count {from, to, at, dur, label}.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const ZS = "'Zilla Slab', Fraunces, Georgia, serif";
  const TDL = () => window.TD;
  const f1 = v => Math.round(v * 10) / 10;
  const at = (cues, n, fb) => TDL().atOr(cues, n, fb);
  const COLS = () => ({ red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft, paper: INK.paperLight });
  const ellP = (cx, cy, rx, ry, n = 16, a0 = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // figure (like TD.figure) that also passes sign text, held item and beard
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const inCover = () => { const c = document.documentElement.classList; return c.contains('cover') && !c.contains('hook'); };
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g'), isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: K.beard || null, seed: sd });
    return {
      node: g,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion, text: K.text, item: K.item }];
        (K.seq || []).forEach(q => { const a = at(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const q = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, q.at);
        const o = { x: (K.x ?? 0.8) * W, y: (K.y ?? 0.86) * H, face: faceOf(q.face ?? K.face, -1), since, dir: dirOf(q.dir ?? K.dir),
          emotion: q.emotion || (q.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: q.text ?? K.text, item: q.item ?? (q.text ? null : K.item) };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        rig.update(t, q.pose || 'idle', o);
      },
    };
  }
  // common: labels, kasif + cast, punch / push transform, number counter
  function common(root, P, W, H, sd) {
    const TD = TDL();
    const cast = (P.cast || []).map((K, i) => figure(el(root, 'g'), Object.assign({ hat: false }, K), sd + 300 + i * 17));
    const kas = P.kasif ? figure(el(root, 'g'), Object.assign({ x: 0.85, y: 0.86, scale: 0.7, pose: 'point', face: 'left' }, P.kasif), sd + 260) : null;
    const layer = el(root, 'g');
    const labels = (P.labels || []).map((L, i) => TD.label(layer, L, W, H, sd + 400 + i * 7));
    return {
      update(lt, t, cues, g, dur) {
        const hide = P.cover_hide && inCover();
        layer.style.display = hide ? 'none' : '';
        if (hide) { cast.forEach(c => c && c.node && (c.node.style.display = 'none')); }
        cast.forEach(c => c && c.update(lt, t, cues, W, H));
        if (kas) { kas.node.style.display = hide ? 'none' : ''; kas.update(lt, t, cues, W, H); }
        cast.forEach(c => c && c.node && (c.node.style.display = hide ? 'none' : ''));
        labels.forEach(l => l && l.update(lt, t, cues));
        const hit = punch(lt, at(cues, 'hit', null), 0.6) + punch(lt, at(cues, P.shake, null), 0.5) * 0.6;
        const z = 1 + ((P.zoom ?? 1.05) - 1) * clamp01(lt / Math.max(1, dur || 6)) + 0.025 * hit;
        const fx = (P.fx ?? 0.5) * W, fy = (P.fy ?? 0.48) * H;
        const sh = P.shake ? punch(lt, at(cues, P.shake, null), 0.5) : 0, sx = Math.sin(lt * 60) * 10 * sh;
        g.setAttribute('transform', `translate(${f1(fx + sx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
      },
    };
  }
  function counter(root, C, W, H, sd) {
    if (!C) return null;
    const g = el(root, 'g'), size = C.size || 170;
    const txt = el(g, 'text', { 'font-family': ZS, 'font-weight': 800, 'font-size': size, 'text-anchor': 'middle', fill: COLS()[C.color] || INK.red });
    const lab = el(g, 'text', { 'font-family': INK_FONT, 'font-size': C.label_size || 64, 'text-anchor': 'middle', fill: INK.ink });
    lab.textContent = C.label || '';
    return {
      value: 0,
      update(lt, t, cues) {
        const a = at(cues, C.at, 0.2), p = lt < a ? 0 : (C.ease === false ? lin(lt, a, C.dur ?? 2.5) : prog(lt, a, C.dur ?? 2.5));
        const v = lerp(C.from ?? 0, C.to ?? 100, p);
        this.value = v;
        const s = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        txt.textContent = (C.prefix || '') + s + (C.suffix || '');
        const pk = punch(lt, a + (C.dur ?? 2.5), 0.6), b = boil(sd + 3, t, 1.2);
        const x = (C.x ?? 0.5) * W, y = (C.y ?? 0.2) * H;
        g.setAttribute('opacity', lt >= a - 0.05 ? 1 : 0);
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) scale(${(1 + 0.1 * pk).toFixed(3)})`);
        txt.setAttribute('y', 0); lab.setAttribute('y', f1(size * 0.55));
      },
    };
  }
  // ink hatching strokes over a rectangle (for dark sky / shadow), density 0..1
  function hatch(x0, y0, x1, y1, dens, sd, t, ang = -0.5, w = 3) {
    if (dens <= 0.01) return '';
    let d = ''; const n = Math.round(dens * 46), r = rng(sd);
    for (let k = 0; k < n; k++) {
      const x = lerp(x0, x1, (k + r() * 0.6) / n), y = lerp(y0, y1, r()), L = 60 + r() * 120;
      d += inkPath([[x, y], [x + Math.cos(ang) * L, y + Math.sin(ang) * L]], { w, seed: sd + k, t, amp: 1 }) + ' ';
    }
    return d;
  }

  // ===================================================================== es_eclipse
  SH.es_eclipse = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg } = ctx, sd = ctx.seed * 1000 + 9101, TD = TDL();
      const g = el(svg, 'g');
      const GY = (P.ground ?? 0.78) * H, S = Object.assign({ x: 0.5, y: 0.3, r: 120 }, P.sun || {});
      const skyH = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.55 });
      const starG = el(g, 'g'), stars = TD.stars(starG, sd + 1, W, H, P.stars ?? 22, 0.05, (P.ground ?? 0.78) - 0.25);
      const coronaF = inkEl(g, INK.gold, { 'fill-opacity': 0.85 }), coronaR = inkEl(g, INK.gold);
      const sun = TD.sun(el(g, 'g'), sd + 2);
      const moonF = inkEl(g, INK.ink), moonR = inkEl(g);
      const hallF = inkEl(g, INK.paperDark), hallR = inkEl(g), hallD = inkEl(g, INK.red, { 'fill-opacity': 0.75 }), hallH = inkEl(g, INK.inkSoft);
      const groundF = inkEl(g, INK.paperDark, { 'fill-opacity': 0.8 }), groundR = inkEl(g), tiles = inkEl(g, INK.inkSoft);
      const cm = common(g, P, W, H, sd);
      const arrowE = inkEl(g, INK.red);
      const sl = P.slips ? { tab: inkEl(g, INK.hatBand, { 'fill-opacity': 0.85 }), tabR: inkEl(g), f: inkEl(g, INK.gold, { 'fill-opacity': 0.55 }), r: inkEl(g), ch: inkEl(g), brush: inkEl(g, INK.hatBand), brushR: inkEl(g) } : null;
      const r0 = rng(sd + 77), glyphs = [];
      for (let i = 0; i < 60; i++) glyphs.push([r0(), r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const C = P.cover || {}, ca = at(cues, C.at, 0), cp = lerp(C.from ?? 0, C.to ?? 1, prog(lt, ca, C.dur ?? 4));
          const ta = at(cues, P.total, null), tot = ta == null ? (cp > 0.98 ? 1 : 0) : prog(lt, ta, 0.8);
          const dark = clamp01(Math.max(P.dark ?? 0, cp * 0.5, tot));
          const sx = S.x * W, sy = S.y * H, sr = S.r;
          skyH.setAttribute('d', (P.hatch === false || (P.cover_hide && inCover())) ? '' : hatch(0, -40, W + 200, GY - 60, dark * 0.95, sd + 10, t));
          const SA = P.spin_arrow;
          if (SA && (!SA.cover_only || inCover())) {
            const rr = S.r * (SA.r ?? 2.55), a0 = -2.7, a1 = -0.5, pts = [];
            for (let j = 0; j <= 12; j++) { const u = lerp(a0, a1, j / 12); pts.push([S.x * W + Math.cos(u) * rr, S.y * H + Math.sin(u) * rr]); }
            const e = pts[12], q = pts[11], an = Math.atan2(e[1] - q[1], e[0] - q[0]);
            const mid = pts[6], ma = Math.atan2(mid[1] - S.y * H, mid[0] - S.x * W);
            arrowE.setAttribute('d', inkPath(pts, { w: 11, seed: sd + 500, t }) + ' ' + inkPath([[e[0] - Math.cos(an - 0.5) * 50, e[1] - Math.sin(an - 0.5) * 50], e, [e[0] - Math.cos(an + 0.5) * 50, e[1] - Math.sin(an + 0.5) * 50]], { w: 11, seed: sd + 501, t, smooth: false }) +
              ' ' + inkPath([[mid[0] - Math.cos(ma) * 46, mid[1] - Math.sin(ma) * 46], [mid[0] + Math.cos(ma) * 46, mid[1] + Math.sin(ma) * 46]], { w: 16, seed: sd + 502, t }));
          } else arrowE.setAttribute('d', '');
          starG.style.display = dark > 0.6 ? '' : 'none';
          stars.update(t);
          // corona (only near totality)
          const co = tot;
          if (co > 0.02) {
            let cf = '', cr = '';
            for (let k = 0; k < 16; k++) {
              const a = k / 16 * Math.PI * 2 + Math.sin(t * 0.4 + k) * 0.06, L = sr * (1.5 + 0.7 * ((k * 37) % 5) / 5 + 0.1 * Math.sin(t * 2 + k)) * co;
              const pts = [[sx + Math.cos(a - 0.17) * sr * 0.98, sy + Math.sin(a - 0.17) * sr * 0.98], [sx + Math.cos(a) * (sr + L), sy + Math.sin(a) * (sr + L)], [sx + Math.cos(a + 0.17) * sr * 0.98, sy + Math.sin(a + 0.17) * sr * 0.98]];
              cf += inkLoop(pts, { seed: sd + 20 + k, t, amp: 1.2 }) + ' ';
              cr += inkPath(pts, { w: 3, seed: sd + 40 + k, t, amp: 1 }) + ' ';
            }
            coronaF.setAttribute('d', cf); coronaR.setAttribute('d', cr + inkCircle(sx, sy, sr * 1.12, sd + 60, t, { w: 5 }));
          } else { coronaF.setAttribute('d', ''); coronaR.setAttribute('d', ''); }
          sun.update(t, sx, sy, sr * (1 - 0.3 * tot));
          const mx = sx + (1 - cp) * sr * 2.3, my = sy - (1 - cp) * sr * 0.5;
          moonF.setAttribute('d', cp > 0.01 ? inkLoop(ellP(mx, my, sr * 1.02, sr * 1.02, 18), { seed: sd + 61, t }) : '');
          moonR.setAttribute('d', cp > 0.01 ? inkCircle(mx, my, sr * 1.02, sd + 62, t, { w: 6 }) : '');
          // court: hall with upswept eaves + gate tower
          const coverOnly = P.cover_hide && inCover();
          [hallF, hallR, hallD, hallH].forEach(e => e.style.display = coverOnly ? 'none' : '');
          if (P.court !== false) {
            const hx = (P.hall_x ?? 0.2) * W, hw = 560, roofY = GY - 330;
            const roof = [[hx - hw / 2 - 80, roofY - 30], [hx - hw / 2 + 10, roofY + 10], [hx - 150, roofY - 110], [hx + 150, roofY - 110], [hx + hw / 2 - 10, roofY + 10], [hx + hw / 2 + 80, roofY - 30], [hx + hw / 2 + 20, roofY + 40], [hx - hw / 2 - 20, roofY + 40]];
            const body = rectP(hx - hw / 2 + 40, roofY + 40, hw - 80, GY - roofY - 40);
            const tx = (P.gate_x ?? 0.9) * W, tw = 300, tY = GY - 260;
            const roof2 = [[tx - tw / 2 - 60, tY - 20], [tx - 90, tY - 90], [tx + 90, tY - 90], [tx + tw / 2 + 60, tY - 20], [tx + tw / 2, tY + 25], [tx - tw / 2, tY + 25]];
            const body2 = rectP(tx - tw / 2 + 30, tY + 25, tw - 60, GY - tY - 25);
            hallF.setAttribute('d', [roof, body, roof2, body2].map((p, i) => inkLoop(p, { seed: sd + 70 + i, t, smooth: false })).join(' '));
            hallR.setAttribute('d', [roof, body, roof2, body2].map((p, i) => inkPath(p, { w: 6, seed: sd + 80 + i, t, closed: true, smooth: false })).join(' '));
            let cols = '';
            for (let k = 0; k < 6; k++) { const x = hx - hw / 2 + 80 + k * (hw - 160) / 5; cols += inkLoop(rectP(x - 14, roofY + 50, 28, GY - roofY - 50), { seed: sd + 90 + k, t, smooth: false }) + ' '; }
            cols += inkLoop(rectP(tx - 40, GY - 150, 80, 150), { seed: sd + 99, t, smooth: false });
            hallD.setAttribute('d', cols);
            let hh = '';
            for (let k = 0; k < 9; k++) { const x = hx - 140 + k * 35; hh += inkPath([[x, roofY - 100], [x - 40, roofY + 30]], { w: 3, seed: sd + 110 + k, t, amp: 0.8 }) + ' '; }
            hallH.setAttribute('d', hh);
          }
          const gpts = [[-40, GY], [W * 0.5, GY - 6], [W + 40, GY], [W + 40, H + 40], [-40, H + 40]];
          groundF.setAttribute('d', inkLoop(gpts, { seed: sd + 120, t, smooth: false }));
          groundR.setAttribute('d', inkPath([[-40, GY], [W * 0.5, GY - 6], [W + 40, GY]], { w: 7, seed: sd + 121, t }));
          let td = '';
          for (let k = 0; k < 9; k++) { const x = (k - 4) * 260 + W / 2; td += inkPath([[x, GY + 10], [x * 1.0 + (x - W / 2) * 0.8, H + 20]], { w: 3, seed: sd + 130 + k, t, amp: 1 }) + ' '; }
          for (let k = 0; k < 3; k++) { const y = GY + 40 + k * k * 40 + k * 30; td += inkPath([[-20, y], [W + 20, y]], { w: 3, seed: sd + 140 + k, t, amp: 1 }) + ' '; }
          tiles.setAttribute('d', td);
          if (sl) {
            const L = P.slips, x0 = (L.x ?? 0.72) * W, y0 = (L.y ?? 0.8) * H, s = L.s ?? 1, n = L.n ?? 9, sw = 46 * s, sh = 560 * s;
            const tab = [[x0 - n * sw / 2 - 60 * s, y0], [x0 + n * sw / 2 + 60 * s, y0], [x0 + n * sw / 2 + 90 * s, y0 + 70 * s], [x0 - n * sw / 2 - 90 * s, y0 + 70 * s]];
            sl.tab.setAttribute('d', inkLoop(tab, { seed: sd + 150, t, smooth: false })); sl.tabR.setAttribute('d', inkPath(tab, { w: 6, seed: sd + 151, t, closed: true, smooth: false }));
            let sf = '', sr2 = '', ch = '';
            const wa = at(cues, L.at, 0.3), wp = lin(lt, wa, L.dur ?? 5);
            const tilt = -0.06;
            for (let k = 0; k < n; k++) {
              const x = x0 - n * sw / 2 + k * sw, top = y0 - sh + Math.sin(k) * 6;
              const pts = [[x + 3, top], [x + sw - 3, top], [x + sw - 3, y0 - 4], [x + 3, y0 - 4]].map(([px, py]) => [px + (py - y0) * tilt, py]);
              sf += inkLoop(pts, { seed: sd + 160 + k, t, smooth: false }) + ' ';
              sr2 += inkPath(pts, { w: 3.5, seed: sd + 180 + k, t, closed: true, smooth: false }) + ' ';
              // glyphs written from the rightmost slip down, then left
              const col = n - 1 - k;
              for (let j = 0; j < 6; j++) {
                const idx = col * 6 + j, need = idx / (n * 6);
                if (wp <= need) continue;
                const q = glyphs[idx % 60], gy = top + 50 * s + j * 82 * s, gx = x + sw / 2 + (gy - y0) * tilt;
                ch += inkPath([[gx - 14 * s, gy], [gx + 14 * s, gy + q[0] * 6]], { w: 5 * s, seed: sd + 200 + idx, t, amp: 0.6 }) + ' ';
                ch += inkPath([[gx + (q[1] - 0.5) * 16 * s, gy - 18 * s], [gx + (q[2] - 0.5) * 20 * s, gy + 24 * s]], { w: 4.5 * s, seed: sd + 260 + idx, t, amp: 0.6 }) + ' ';
                if (q[3] > 0.4) ch += inkPath([[gx - 12 * s, gy + 18 * s], [gx + 10 * s, gy + 14 * s]], { w: 4 * s, seed: sd + 330 + idx, t, amp: 0.6 }) + ' ';
              }
            }
            // tying cords
            for (const v of [0.22, 0.78]) { const y = y0 - sh * v; sr2 += inkPath([[x0 - n * sw / 2 - 10 + (y - y0) * tilt, y], [x0 + n * sw / 2 + 10 + (y - y0) * tilt, y + 4]], { w: 5, seed: sd + 400 + v * 10, t }) + ' '; }
            sl.f.setAttribute('d', sf); sl.r.setAttribute('d', sr2); sl.ch.setAttribute('d', ch);
            // brush moves to the glyph being written
            if (wp > 0 && wp < 1) {
              const idx = Math.floor(wp * n * 6), col = Math.floor(idx / 6), j = idx % 6, k = n - 1 - col;
              const bx = x0 - n * sw / 2 + k * sw + sw / 2 + Math.sin(t * 9) * 8, by = y0 - sh + 50 * s + j * 82 * s;
              const br = [[bx, by], [bx + 60 * s, by - 260 * s]];
              sl.brush.setAttribute('d', inkPath(br, { w: 14 * s, seed: sd + 420, t, taper: 0.1 }));
              sl.brushR.setAttribute('d', inkDot(bx, by + 4, 9 * s, 14 * s, sd + 421, t));
            } else { sl.brush.setAttribute('d', ''); sl.brushR.setAttribute('d', ''); }
          }
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };

  // ===================================================================== es_globe
  let clipN = 0;
  SH.es_globe = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs } = ctx, sd = ctx.seed * 1000 + 9301, TD = TDL();
      const g = el(svg, 'g');
      const E = Object.assign({ x: 0.5, y: 0.5, r: 330 }, P.earth || {});
      const stars = TD.stars(el(g, 'g'), sd + 1, W, H, P.stars ?? 26, 0.04, 0.96);
      const streaks = inkEl(g, INK.inkSoft);
      const earth = TD.earth(el(g, 'g'), defs, sd + 2);
      const id = 'esglobe' + (sd % 100000) + '_' + (clipN++);
      const cp = el(defs || svg, 'clipPath', { id }), cc = el(cp, 'circle');
      const clip = el(g, 'g', { 'clip-path': `url(#${id})` });
      const iceF = inkEl(clip, INK.paper), iceR = inkEl(clip, INK.ink);
      const wedgeF = inkEl(clip, INK.red, { 'fill-opacity': 0.5 }), wedgeR = inkEl(clip, INK.red);
      const bandF = inkEl(clip, INK.ink, { 'fill-opacity': 0.55 }), bandR = inkEl(clip, INK.ink), bandBlob = inkEl(clip, INK.ink);
      const arrow = inkEl(g, INK.red), iceA = inkEl(g, INK.blue);
      const pinF = inkEl(g, INK.red), pinR = inkEl(g);
      const pinT = el(g, 'text', { 'font-family': ZS, 'font-weight': 800, 'font-size': P.pin?.size || 76, 'text-anchor': 'middle', fill: INK.red });
      if (P.pin) pinT.textContent = P.pin.text || '';
      const wedgeT = el(g, 'text', { 'font-family': ZS, 'font-weight': 800, 'font-size': 96, 'text-anchor': 'middle', fill: INK.red });
      if (P.wedge) wedgeT.textContent = P.wedge.text || '';
      const cm = common(g, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, cx = E.x * W, cy = E.y * H, r = E.r;
          stars.update(t);
          const F = P.fast, fa = F ? at(cues, F.at, 0) : null, fk = F ? lerp(1, F.k ?? 4, prog(lt, fa, 1.5)) : 1;
          const tt = (P.spin ?? 1) * (lt < (fa ?? 1e9) ? lt : fa + (lt - fa) * fk);
          earth.update(t + tt * 3, cx, cy, r, true, true);
          cc.setAttribute('cx', f1(cx)); cc.setAttribute('cy', f1(cy)); cc.setAttribute('r', f1(r));
          // speed streaks
          let sk = '';
          if (F && lt >= fa) {
            const k = prog(lt, fa, 1.2);
            for (let i = 0; i < 7; i++) {
              const a = -Math.PI * 0.85 + i * 0.25, rr = r + 60 + (i % 3) * 30, ph = (t * 2.5 + i * 0.37) % 1;
              const a0 = a + ph * 0.6, a1 = a0 + 0.35 * k;
              const pts = []; for (let j = 0; j <= 5; j++) { const u = lerp(a0, a1, j / 5); pts.push([cx + Math.cos(u) * rr, cy + Math.sin(u) * rr * 0.98]); }
              sk += inkPath(pts, { w: 6, seed: sd + 10 + i, t, amp: 1 }) + ' ';
            }
          }
          streaks.setAttribute('d', sk);
          // ice caps
          const I = P.ice;
          if (I) {
            const ia = at(cues, I.at, 0.5), ip = prog(lt, ia, 3), cap = r * lerp(0.62, 0.26, ip), cw = r * lerp(1.05, 0.62, ip);
            iceF.setAttribute('d', inkLoop(ellP(cx, cy - r, cw, cap, 18), { seed: sd + 20, t }) + ' ' + inkLoop(ellP(cx, cy + r, cw, cap * 0.9, 18), { seed: sd + 21, t }));
            let ir = inkPath(ellP(cx, cy - r, cw, cap, 18), { w: 8, seed: sd + 22, t, closed: true }) + ' ' + inkPath(ellP(cx, cy + r, cw, cap * 0.9, 18), { w: 8, seed: sd + 23, t, closed: true });
            for (let k = 0; k < 6; k++) { const u = (k - 2.5) / 3 * cw * 0.7; ir += ' ' + inkPath([[cx + u - 20, cy - r + cap * 0.55], [cx + u + 20, cy - r + cap * 0.75]], { w: 4, seed: sd + 24 + k, t }) + ' ' + inkPath([[cx + u - 20, cy + r - cap * 0.75], [cx + u + 20, cy + r - cap * 0.55]], { w: 4, seed: sd + 34 + k, t }); }
            iceR.setAttribute('d', ir);
            let ad = '';
            if (lt >= ia) for (let i = 0; i < 6; i++) {
              const top = i < 3, u = (i % 3 - 1) * 0.45, ph = ((t - ia) * 0.5 + i * 0.17) % 1;
              const x = cx + u * r, y0 = top ? cy - r * 0.68 : cy + r * 0.68, y1 = top ? cy - r * 0.12 : cy + r * 0.12;
              const ya = lerp(y0, y1, ph * 0.7), yb = lerp(y0, y1, ph * 0.7 + 0.3), dirn = top ? 1 : -1;
              ad += inkPath([[x, ya], [x, yb]], { w: 9, seed: sd + 30 + i, t }) + ' ' + inkPath([[x - 22, yb - 24 * dirn], [x, yb + 4 * dirn], [x + 22, yb - 24 * dirn]], { w: 9, seed: sd + 40 + i, t, smooth: false }) + ' ';
            }
            iceA.setAttribute('d', ad);
          }
          // wedge
          const Wd = P.wedge;
          if (Wd) {
            const wa = at(cues, Wd.at, 0.5), wp = prog(lt, wa, 1.6), deg = (Wd.deg ?? 85) * wp * Math.PI / 180;
            if (wp > 0.01) {
              const pts = [[cx, cy - r * 1.1]]; const n = 10;
              for (let j = 0; j <= n; j++) { const v = -1 + 2 * j / n, rr = Math.sqrt(Math.max(0, 1 - v * v)); pts.push([cx + Math.sin(deg) * r * rr, cy + v * r * 1.02]); }
              pts.push([cx, cy + r * 1.1]);
              wedgeF.setAttribute('d', inkLoop(pts, { seed: sd + 50, t, smooth: false }));
              wedgeR.setAttribute('d', inkPath(pts.slice(1, -1), { w: 6, seed: sd + 51, t }));
              wedgeT.setAttribute('x', f1(cx + r + 260)); wedgeT.setAttribute('y', f1(cy - 40));
              wedgeT.setAttribute('opacity', clamp01((wp - 0.4) * 3).toFixed(2));
            } else { wedgeF.setAttribute('d', ''); wedgeR.setAttribute('d', ''); wedgeT.setAttribute('opacity', 0); }
          } else wedgeT.setAttribute('opacity', 0);
          // eclipse track
          const T = P.track;
          if (T) {
            const ta = at(cues, T.at, 0.3), tp = prog(lt, ta, T.dur ?? 2.2), off = lerp(T.from ?? -1.2, T.to ?? 0, tp) * r;
            const pu = P.pin ? P.pin.u : 0, pv = P.pin ? P.pin.v : (T.v ?? -0.1), w = T.w ?? 70, cv = T.curve ?? 0.25;
            const yAt = x => cy + (pv + (T.dv ?? 0)) * r + cv * r * (((x - cx - pu * r - off) / r) ** 2);
            const top = [], bot = [];
            for (let j = 0; j <= 16; j++) { const x = cx - r * 1.6 + off + pu * r + j / 16 * r * 3.2; top.push([x, yAt(x) - w / 2 - j * 2]); bot.push([x, yAt(x) + w / 2 - j * 2]); }
            const vis = lt >= ta - 0.05 ? 1 : 0;
            bandF.setAttribute('d', vis ? inkLoop(top.concat(bot.slice().reverse()), { seed: sd + 60, t }) : '');
            bandR.setAttribute('d', vis ? inkPath(top, { w: 4, seed: sd + 61, t }) + ' ' + inkPath(bot, { w: 4, seed: sd + 62, t }) : '');
            bandF.setAttribute('fill', T.color === 'red' ? INK.red : INK.ink);
            const bx = cx + pu * r + off;
            bandBlob.setAttribute('d', vis ? inkDot(bx, yAt(bx) - 16, w * 0.9, w * 0.6, sd + 63, t) : '');
          }
          const Pn = P.pin;
          if (Pn) {
            const pa = at(cues, Pn.at, 0.2), pp = lt >= pa ? spring(lt, pa, 0.5) : 0, x = cx + Pn.u * r, y = cy + Pn.v * r;
            const pk = punch(lt, at(cues, Pn.hit, null), 0.6);
            const hh = 90 * pp * (1 + 0.15 * pk);
            pinF.setAttribute('d', pp > 0.01 ? inkLoop([[x, y], [x - 26 * pp, y - hh * 0.7], [x, y - hh], [x + 26 * pp, y - hh * 0.7]], { seed: sd + 70, t }) : '');
            pinR.setAttribute('d', pp > 0.01 ? inkCircle(x, y - hh * 0.72, 11 * pp, sd + 71, t, { w: 4 }) : '');
            pinT.setAttribute('x', f1(x + (Pn.dx ?? 0))); pinT.setAttribute('y', f1(y - hh - 24 + (Pn.dy ?? 0))); pinT.setAttribute('opacity', pp.toFixed(2));
          }
          if (P.arrow !== false) {
            const a0 = -2.5, a1 = -0.65, rr = r + 46, pts = []; for (let j = 0; j <= 8; j++) { const u = lerp(a0, a1, j / 8); pts.push([cx + Math.cos(u) * rr, cy + Math.sin(u) * rr * 0.55 - r * 0.62]); }
            const e = pts[pts.length - 1], q = pts[pts.length - 2], ang = Math.atan2(e[1] - q[1], e[0] - q[0]);
            const head = [[e[0] - Math.cos(ang - 0.5) * 40, e[1] - Math.sin(ang - 0.5) * 40], e, [e[0] - Math.cos(ang + 0.5) * 40, e[1] - Math.sin(ang + 0.5) * 40]];
            arrow.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 80, t }) + ' ' + inkPath(head, { w: 9, seed: sd + 81, t, smooth: false }));
          }
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };

  // ===================================================================== es_tide
  SH.es_tide = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs } = ctx, sd = ctx.seed * 1000 + 9501, TD = TDL();
      const g = el(svg, 'g');
      const mode = P.mode || 'tide';
      const cm0 = {};
      if (mode === 'mirror') {
        const stars = TD.stars(el(g, 'g'), sd + 1, W, H, 20, 0.04, 0.45);
        const earth = TD.earth(el(g, 'g'), defs, sd + 2);
        const gF = inkEl(g, INK.paperDark), gR = inkEl(g), crat = inkEl(g, INK.inkSoft), prints = inkEl(g, INK.inkSoft);
        const legs = inkEl(g), panF = inkEl(g, INK.paperLight), panR = inkEl(g), cubes = inkEl(g, INK.inkSoft), flash = inkEl(g, INK.gold, { 'fill-opacity': 0.8 });
        const beam = inkEl(g, INK.red), beamB = inkEl(g, INK.gold);
        const cm = common(g, P, W, H, sd);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, GY = (P.ground ?? 0.6) * H;
            stars.update(t);
            const Ex = (P.earth?.x ?? 0.8) * W, Ey = (P.earth?.y ?? 0.2) * H, Er = P.earth?.r ?? 110;
            earth.update(t, Ex, Ey, Er, true, true);
            const gp = [[-40, GY + 20], [W * 0.3, GY - 10], [W * 0.7, GY + 6], [W + 40, GY - 14], [W + 40, H + 40], [-40, H + 40]];
            gF.setAttribute('d', inkLoop(gp, { seed: sd + 10, t, smooth: false }));
            gR.setAttribute('d', inkPath(gp.slice(0, 4), { w: 7, seed: sd + 11, t }));
            let cd = '';
            [[0.12, 0.72, 120, 26], [0.86, 0.8, 160, 34], [0.4, 0.93, 200, 30], [0.68, 0.66, 70, 14]].forEach(([u, v, rx, ry], k) => { cd += inkPath(ellP(u * W, v * H, rx, ry, 14), { w: 5, seed: sd + 20 + k, t, closed: true }) + ' '; });
            crat.setAttribute('d', cd);
            let pd = '';
            for (let k = 0; k < 7; k++) { const x = 0.2 * W + k * 70, y = GY + 120 + (k % 2) * 40 + k * 20; pd += inkLoop(ellP(x, y, 24, 11, 10, 0.3), { seed: sd + 30 + k, t }) + ' '; }
            prints.setAttribute('d', pd);
            const px = (P.panel?.x ?? 0.5) * W, py = GY + 40, pw = 420, ph = 300, tilt = 90;
            const panel = [[px - pw / 2, py - 260], [px + pw / 2, py - 260], [px + pw / 2 + 40, py - 260 + ph * 0.55], [px - pw / 2 + 40, py - 260 + ph * 0.55]];
            legs.setAttribute('d', inkPath([[px - pw / 2 + 40, py - 100], [px - pw / 2 + 60, py + 40]], { w: 8, seed: sd + 40, t }) + ' ' + inkPath([[px + pw / 2, py - 110], [px + pw / 2 - 20, py + 40]], { w: 8, seed: sd + 41, t }) + ' ' + inkPath([[px, py - 100], [px + 10, py + 50]], { w: 8, seed: sd + 42, t }));
            panF.setAttribute('d', inkLoop(panel, { seed: sd + 43, t, smooth: false }));
            panR.setAttribute('d', inkPath(panel, { w: 7, seed: sd + 44, t, closed: true, smooth: false }));
            let cu = '';
            for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) {
              const u = (i + 0.5) / 7, v = (j + 0.5) / 4;
              const x = lerp(lerp(panel[0][0], panel[1][0], u), lerp(panel[3][0], panel[2][0], u), v), y = lerp(panel[0][1], panel[3][1], v);
              cu += inkPath(ellP(x, y, 19, 13, 8), { w: 3, seed: sd + 50 + i * 4 + j, t, closed: true, amp: 0.6 }) + ' ';
            }
            cubes.setAttribute('d', cu);
            const L = P.laser, la = L ? at(cues, L.at, 0.5) : null;
            const cx = (panel[0][0] + panel[2][0]) / 2, cyy = (panel[0][1] + panel[2][1]) / 2;
            if (L && lt >= la) {
              const per = L.period ?? 2.4, ph2 = ((lt - la) % per) / per, src = [Ex - Er * 0.3, Ey + Er * 0.6];
              const down = clamp01(ph2 * 2), up = clamp01(ph2 * 2 - 1);
              const pa = [lerp(src[0], cx, down), lerp(src[1], cyy, down)];
              beam.setAttribute('d', inkPath([src, pa], { w: 7, seed: sd + 60, t, taper: 0.1 }));
              beamB.setAttribute('d', up > 0 ? inkPath([[cx + 20, cyy], [lerp(cx + 20, src[0] + 20, up), lerp(cyy, src[1], up)]], { w: 10, seed: sd + 61, t, taper: 0.1 }) : '');
              const fl = ph2 > 0.45 && ph2 < 0.75 ? 1 : 0;
              flash.setAttribute('d', fl ? inkLoop(ellP(cx, cyy, 130, 70, 12), { seed: sd + 62, t }) : '');
            } else { beam.setAttribute('d', ''); beamB.setAttribute('d', ''); flash.setAttribute('d', ''); }
            cm.update(lt, t, cues, g, dur);
          },
        };
      }
      const stars = TD.stars(el(g, 'g'), sd + 1, W, H, P.stars ?? 28, 0.04, 0.96);
      const orbitR = inkEl(g, INK.inkSoft), trail = inkEl(g, INK.inkSoft);
      const bulgeF = inkEl(g, INK.blue, { 'fill-opacity': 0.4 }), bulgeR = inkEl(g, INK.blue);
      const earth = TD.earth(el(g, 'g'), defs, sd + 2);
      const arrow = inkEl(g, INK.ink), brake = inkEl(g, INK.red), fric = inkEl(g, INK.red);
      const moonF = inkEl(g, INK.paperLight), moonR = inkEl(g), moonC = inkEl(g, INK.inkSoft);
      const laser = inkEl(g, INK.red), laserB = inkEl(g, INK.gold);
      const rulerR = inkEl(g, INK.red);
      const rulerT = el(g, 'text', { 'font-family': ZS, 'font-weight': 800, 'font-size': P.recede?.ruler?.size || 84, 'text-anchor': 'middle', fill: INK.red });
      if (P.recede?.ruler) rulerT.textContent = P.recede.ruler.text || '';
      const cm = common(g, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          stars.update(t);
          const E = Object.assign({ x: 0.3, y: 0.5, r: 190 }, P.earth || {}), M = Object.assign({ d: 700, r: 70, ang: -8 }, P.moon || {});
          const ex = E.x * W, ey = E.y * H, er = E.r;
          // moon position
          const R = P.recede, ra = R ? at(cues, R.at, 0.5) : null, rp = R ? prog(lt, ra, R.dur ?? 4) : 0;
          const d = lerp(M.d, R ? (R.to ?? M.d + 160) : M.d, rp);
          const O = P.orbit;
          let ang = M.ang * Math.PI / 180;
          if (O) {
            const sp = O.speed ?? 0.04, fa = O.fast ? at(cues, O.fast.at, 1e9) : 1e9, sp2 = O.fast ? O.fast.to ?? 0.25 : sp;
            const ph = lt < fa ? lt * sp : fa * sp + (lt - fa) * lerp(sp, sp2, clamp01((lt - fa) / 1.2)) - (lt - fa) * 0;
            ang += -ph * Math.PI * 2;
          }
          const ry = O ? 0.42 : 1;
          const mx = ex + Math.cos(ang) * d, my = ey + Math.sin(ang) * d * ry;
          if (O) {
            orbitR.setAttribute('d', inkPath(ellP(ex, ey, d, d * ry, 30), { w: 3.5, seed: sd + 5, t, closed: true, amp: 1 }));
            let td = '';
            if (O.trail !== false) for (let k = 1; k <= 6; k++) { const a = ang + k * 0.07; td += inkDot(ex + Math.cos(a) * d, ey + Math.sin(a) * d * ry, M.r * (0.5 - k * 0.06), M.r * (0.5 - k * 0.06), sd + 6 + k, t) + ' '; }
            trail.setAttribute('d', td);
          } else {
            const pts = []; for (let j = 0; j <= 10; j++) { const a = ang - 0.35 + j * 0.07; pts.push([ex + Math.cos(a) * d, ey + Math.sin(a) * d]); }
            orbitR.setAttribute('d', inkPath(pts, { w: 3, seed: sd + 5, t, amp: 1 }));
          }
          // tidal bulge (pointing at the moon, dragged ahead by lag)
          const B = P.bulge;
          if (B) {
            const ba = at(cues, B.at, 0.3), bp = prog(lt, ba, 1.4), amp = (B.amp ?? 0.32) * bp + 0.04;
            const lag = (B.lag ?? 14) * Math.PI / 180 * prog(lt, at(cues, P.brake?.at, ba + 1), 1.2);
            const dir = Math.atan2(my - ey, mx - ex) - lag;
            const pts = ellP(ex, ey, er * (1 + amp), er * 1.04, 22, 0).map(([x, y]) => { const dx = x - ex, dy = y - ey; return [ex + dx * Math.cos(dir) - dy * Math.sin(dir), ey + dx * Math.sin(dir) + dy * Math.cos(dir)]; });
            bulgeF.setAttribute('d', inkLoop(pts, { seed: sd + 10, t }));
            bulgeR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 11, t, closed: true }));
          }
          earth.update(t * (P.spin ?? 1.6), ex, ey, er, true, true);
          if (P.arrow !== false) {
            const a0 = -2.6, a1 = -0.55, rr = er + 70, pts = []; for (let j = 0; j <= 8; j++) { const u = lerp(a0, a1, j / 8); pts.push([ex + Math.cos(u) * rr, ey + Math.sin(u) * rr]); }
            const e = pts[8], q = pts[7], an = Math.atan2(e[1] - q[1], e[0] - q[0]);
            arrow.setAttribute('d', inkPath(pts, { w: 8, seed: sd + 20, t }) + ' ' + inkPath([[e[0] - Math.cos(an - 0.5) * 36, e[1] - Math.sin(an - 0.5) * 36], e, [e[0] - Math.cos(an + 0.5) * 36, e[1] - Math.sin(an + 0.5) * 36]], { w: 8, seed: sd + 21, t, smooth: false }));
          }
          const Bk = P.brake;
          if (Bk) {
            const ka = at(cues, Bk.at, 0.5), kp = prog(lt, ka, 0.8);
            let bd = '', fd = '';
            if (kp > 0.01) {
              for (const side of [1, -1]) {
                const a0 = side > 0 ? 0.55 : Math.PI + 0.55, rr = er + 40, pts = [];
                for (let j = 0; j <= 6; j++) { const u = a0 + 0.9 - j * 0.15 * kp; pts.push([ex + Math.cos(u) * rr, ey + Math.sin(u) * rr]); }
                const e = pts[6], q = pts[5], an = Math.atan2(e[1] - q[1], e[0] - q[0]);
                bd += inkPath(pts, { w: 11, seed: sd + 30 + side, t }) + ' ' + inkPath([[e[0] - Math.cos(an - 0.55) * 40, e[1] - Math.sin(an - 0.55) * 40], e, [e[0] - Math.cos(an + 0.55) * 40, e[1] - Math.sin(an + 0.55) * 40]], { w: 11, seed: sd + 32 + side, t, smooth: false }) + ' ';
              }
              for (let k = 0; k < 8; k++) { const u = k / 8 * Math.PI * 2 + t * 0.6, r1 = er * 0.96, r2 = er * 0.96 + 22 + 10 * Math.sin(t * 9 + k); fd += inkPath([[ex + Math.cos(u) * r1, ey + Math.sin(u) * r1], [ex + Math.cos(u + 0.05) * r2, ey + Math.sin(u + 0.05) * r2]], { w: 4, seed: sd + 40 + k, t }) + ' '; }
            }
            brake.setAttribute('d', bd); fric.setAttribute('d', fd);
          }
          // moon
          moonF.setAttribute('d', inkLoop(ellP(mx, my, M.r, M.r, 14), { seed: sd + 50, t }));
          moonR.setAttribute('d', inkCircle(mx, my, M.r, sd + 51, t, { w: 6 }));
          moonC.setAttribute('d', [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.18], [-0.1, 0.4, 0.13]].map(([u, v, k], i) => inkPath(ellP(mx + u * M.r, my + v * M.r, k * M.r, k * M.r * 0.8, 9), { w: 3, seed: sd + 52 + i, t, closed: true, amp: 0.6 })).join(' '));
          // ruler between the old and new moon positions
          if (R && R.ruler && rp > 0.05) {
            const ox = ex + Math.cos(ang) * M.d, oy = ey + Math.sin(ang) * M.d * ry - M.r - 50, nx = mx, ny = my - M.r - 50;
            rulerR.setAttribute('d', inkPath([[ox, oy], [nx, ny]], { w: 7, seed: sd + 60, t }) + ' ' + inkPath([[ox, oy - 26], [ox, oy + 26]], { w: 7, seed: sd + 61, t }) + ' ' + inkPath([[nx, ny - 26], [nx, ny + 26]], { w: 7, seed: sd + 62, t }));
            rulerT.setAttribute('x', f1((ox + nx) / 2 + (R.ruler.dx ?? 0))); rulerT.setAttribute('y', f1(Math.min(oy, ny) - 40 + (R.ruler.dy ?? 0))); rulerT.setAttribute('opacity', clamp01(rp * 3).toFixed(2));
          } else { rulerR.setAttribute('d', ''); rulerT.setAttribute('opacity', 0); }
          // laser
          const L = P.laser;
          if (L && lt >= at(cues, L.at, 0.5)) {
            const la = at(cues, L.at, 0.5), per = L.period ?? 2.4, ph = ((lt - la) % per) / per;
            const dir = Math.atan2(my - ey, mx - ex), sx = ex + Math.cos(dir) * er, sy = ey + Math.sin(dir) * er;
            const ex2 = mx - Math.cos(dir) * M.r, ey2 = my - Math.sin(dir) * M.r;
            const go = clamp01(ph * 2), back = clamp01(ph * 2 - 1);
            const L0 = 0.18;
            const seg = (u0, u1, A, Bp) => [[lerp(A[0], Bp[0], u0), lerp(A[1], Bp[1], u0)], [lerp(A[0], Bp[0], u1), lerp(A[1], Bp[1], u1)]];
            laser.setAttribute('d', ph < 0.5 ? inkPath(seg(Math.max(0, go - L0), go, [sx, sy], [ex2, ey2]), { w: 9, seed: sd + 70, t, taper: 0.2 }) : '');
            laserB.setAttribute('d', ph >= 0.5 ? inkPath(seg(Math.max(0, back - L0), back, [ex2, ey2 + 10], [sx, sy + 10]), { w: 9, seed: sd + 71, t, taper: 0.2 }) + (back < 0.15 ? ' ' + inkDot(ex2, ey2, 30, 30, sd + 72, t) : '') : '');
          } else { laser.setAttribute('d', ''); laserB.setAttribute('d', ''); }
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };

  // ===================================================================== es_tablet
  SH.es_tablet = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg } = ctx, sd = ctx.seed * 1000 + 9701;
      const g = el(svg, 'g'), mode = P.mode || 'tablet';
      const tableF = inkEl(g, INK.hatBand, { 'fill-opacity': 0.8 }), tableR = inkEl(g), grain = inkEl(g, INK.ink, { 'fill-opacity': 0.5 });
      const tabF = inkEl(g, INK.stain), tabR = inkEl(g), wedges = inkEl(g), sign = inkEl(g, INK.red), stylus = inkEl(g, INK.gold), stylusR = inkEl(g);
      const clockF = inkEl(g, INK.paperLight), clockR = inkEl(g, INK.red), clockH = inkEl(g, INK.red);
      const cm = common(g, P, W, H, sd);
      const r0 = rng(sd + 5), marks = []; for (let i = 0; i < 200; i++) marks.push([r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, TY = (P.table ?? 0.8) * H;
          const tb = [[-40, TY], [W + 40, TY - 10], [W + 40, H + 40], [-40, H + 40]];
          tableF.setAttribute('d', inkLoop(tb, { seed: sd + 1, t, smooth: false })); tableR.setAttribute('d', inkPath(tb.slice(0, 2), { w: 8, seed: sd + 2, t }));
          let gr = ''; for (let k = 0; k < 6; k++) { const y = TY + 30 + k * 34; gr += inkPath([[-20, y], [W * 0.4, y + 8], [W + 20, y - 6]], { w: 3, seed: sd + 3 + k, t, amp: 1 }) + ' '; }
          grain.setAttribute('d', gr);
          if (mode === 'tablet') {
            const cx = (P.x ?? 0.46) * W, w = P.w ?? 820, h = P.h ?? 560, top = TY - h - 10 + 40;
            const tab = [[cx - w / 2, top + 30], [cx - w / 2 + 40, top], [cx + w / 2 - 40, top + 8], [cx + w / 2, top + 40], [cx + w / 2 - 6, top + h - 30], [cx + w / 2 - 50, top + h], [cx - w / 2 + 40, top + h + 6], [cx - w / 2 + 4, top + h - 40]];
            tabF.setAttribute('d', inkLoop(tab, { seed: sd + 10, t })); tabR.setAttribute('d', inkPath(tab, { w: 8, seed: sd + 11, t, closed: true }));
            const Wr = P.write || {}, wa = at(cues, Wr.at, 0.2), wp = lin(lt, wa, Wr.dur ?? 5), rows = P.rows ?? 6, per = 11;
            let wd = '', last = null;
            for (let r = 0; r < rows; r++) {
              const y = top + 60 + r * (h - 110) / (rows - 1);
              wd += inkPath([[cx - w / 2 + 50, y + 30], [cx + w / 2 - 50, y + 34]], { w: 2.5, seed: sd + 20 + r, t, amp: 0.6 }) + ' ';
              for (let k = 0; k < per; k++) {
                const idx = r * per + k; if (wp <= idx / (rows * per)) continue;
                const m = marks[idx % 200], x = cx - w / 2 + 70 + k * (w - 140) / per + m[0] * 14, s = 0.8 + m[1] * 0.5;
                const tri = m[2] > 0.5 ? [[x, y - 14 * s], [x + 22 * s, y - 4], [x, y + 6 * s]] : [[x - 10 * s, y - 16 * s], [x + 10 * s, y - 16 * s], [x, y + 2]];
                wd += inkLoop(tri, { seed: sd + 40 + idx, t, smooth: false, amp: 0.6 }) + ' ' + inkPath([[tri[0][0] + 6, (tri[0][1] + tri[2][1]) / 2], [x + 34 * s, y + (m[2] > 0.5 ? -4 : 22 * s)]], { w: 4, seed: sd + 300 + idx, t, amp: 0.6 }) + ' ';
                last = [x + 30, y];
              }
            }
            wedges.setAttribute('d', wd);
            const Sg = P.sign;
            if (Sg && lt >= at(cues, Sg.at, 1)) {
              const sa = at(cues, Sg.at, 1), sp = prog(lt, sa, 0.6), x = cx + w / 2 - 130, y = top + 110;
              sign.setAttribute('d', inkCircle(x, y, 62 * sp + 1, sd + 60, t, { w: 9 }) + ' ' + inkDot(x + 14, y - 6, 48 * sp, 48 * sp, sd + 61, t));
            } else sign.setAttribute('d', '');
            if (wp > 0 && wp < 1 && last) {
              const st = [[last[0] + 10, last[1] - 6], [last[0] + 210, last[1] - 330]];
              stylus.setAttribute('d', inkPath(st, { w: 22, seed: sd + 70, t, taper: 0.05 })); stylusR.setAttribute('d', inkPath(st, { w: 4, seed: sd + 71, t }));
            } else { stylus.setAttribute('d', ''); stylusR.setAttribute('d', ''); }
          } else {
            // shelves of tablets
            let tf = '', trr = '', wd = '';
            const shelves = [0.4, 0.62, 0.84].map(v => v * H);
            shelves.forEach((y, si) => {
              trr += inkPath([[60, y], [W - 60, y + 4]], { w: 10, seed: sd + 80 + si, t }) + ' ';
              for (let k = 0; k < 9; k++) {
                const idx = si * 9 + k, inA = at(cues, P.slide?.at, 0) + idx * 0.06, ip = prog(lt, inA, 0.5);
                if (ip <= 0.01) continue;
                const x = 140 + k * 190 + (1 - ip) * 400, hh = 130 + (k % 3) * 16, ww = 140;
                const tab = [[x - ww / 2, y - 6], [x - ww / 2 + 6, y - hh], [x + ww / 2 - 4, y - hh + 6], [x + ww / 2, y - 6]];
                tf += inkLoop(tab, { seed: sd + 100 + idx, t }) + ' ';
                trr += inkPath(tab, { w: 5, seed: sd + 140 + idx, t, closed: true }) + ' ';
                for (let j = 0; j < 4; j++) wd += inkPath([[x - ww / 2 + 18, y - hh + 30 + j * 30], [x + ww / 2 - 22, y - hh + 32 + j * 30]], { w: 3, seed: sd + 200 + idx * 4 + j, t, amp: 0.8 }) + ' ';
              }
            });
            tabF.setAttribute('d', tf); tabR.setAttribute('d', trr); wedges.setAttribute('d', wd);
            const ca = at(cues, P.clock, null);
            if (ca != null && lt >= ca) {
              const cp = spring(lt, ca, 0.6), x = (P.clock_x ?? 0.5) * W, y = (P.clock_y ?? 0.42) * H, r = 190 * cp;
              clockF.setAttribute('d', inkLoop(ellP(x, y, r, r, 18), { seed: sd + 300, t }));
              clockR.setAttribute('d', inkCircle(x, y, r, sd + 301, t, { w: 12 }));
              const a1 = (lt - ca) * 2.2, a2 = (lt - ca) * 0.25;
              clockH.setAttribute('d', inkPath([[x, y], [x + Math.sin(a1) * r * 0.8, y - Math.cos(a1) * r * 0.8]], { w: 9, seed: sd + 302, t }) + ' ' + inkPath([[x, y], [x + Math.sin(a2) * r * 0.5, y - Math.cos(a2) * r * 0.5]], { w: 13, seed: sd + 303, t }) +
                ' ' + [0, 1, 2, 3].map(k => { const a = k * Math.PI / 2; return inkPath([[x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82], [x + Math.sin(a) * r * 0.95, y - Math.cos(a) * r * 0.95]], { w: 8, seed: sd + 304 + k, t }); }).join(' '));
            } else { clockF.setAttribute('d', ''); clockR.setAttribute('d', ''); clockH.setAttribute('d', ''); }
          }
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };

  // ===================================================================== es_coral
  SH.es_coral = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg } = ctx, sd = ctx.seed * 1000 + 9901;
      const g = el(svg, 'g'), mode = P.mode || 'desk';
      const deskF = inkEl(g, INK.hatBand, { 'fill-opacity': 0.8 }), deskR = inkEl(g), lampF = inkEl(g, INK.gold, { 'fill-opacity': 0.3 }), lampR = inkEl(g);
      const coralF = inkEl(g, INK.paperDark), coralS = inkEl(g, INK.stain, { 'fill-opacity': 0.5 }), coralR = inkEl(g), ridges = inkEl(g, INK.inkSoft), bands = inkEl(g), lit = inkEl(g, INK.red);
      const tags = inkEl(g, INK.red);
      const tagT = [0, 1].map(() => el(g, 'text', { 'font-family': INK_FONT, 'font-size': 84, 'font-weight': 700, 'text-anchor': 'middle', fill: INK.red }));
      const lensF = inkEl(g, INK.paperLight, { 'fill-opacity': 0.25 }), lensR = inkEl(g, INK.hatBand), lensH = inkEl(g, INK.hatBand);
      const cm = common(g, P, W, H, sd);
      const cnt = counter(g, P.count, W, H, sd + 50);
      const stampG = P.stamp ? TDL().label(g, Object.assign({ box: true, color: 'red', font: 'serif', size: 110, x: 0.5, y: 0.2, rot: -6 }, P.stamp), W, H, sd + 60) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const N = P.ridges ?? 60, band = P.band ?? 12;
          if (mode === 'lines') {
            // extreme close: the wall of the coral fills the frame, ridges run vertically
            const x0 = 80, x1 = W - 80, y0 = (P.top ?? 0.14) * H, y1 = (P.bottom ?? 0.78) * H;
            const body = [[x0 - 120, y0 + 40], [W * 0.5, y0 - 10], [x1 + 120, y0 + 30], [x1 + 120, y1 - 20], [W * 0.5, y1 + 20], [x0 - 120, y1]];
            coralF.setAttribute('d', inkLoop(body, { seed: sd + 1, t }));
            let pits = '';
            const pr = rng(sd + 909);
            for (let k = 0; k < 70; k++) { const px = lerp(x0, x1, pr()), py = lerp(y0 + 60, y1 - 30, pr()), rr = 4 + pr() * 9; pits += inkDot(px, py, rr, rr * 0.7, sd + 600 + k, t) + ' '; }
            coralS.setAttribute('d', pits);
            coralR.setAttribute('d', inkPath(body.slice(0, 3), { w: 8, seed: sd + 2, t }) + ' ' + inkPath(body.slice(3), { w: 8, seed: sd + 3, t }));
            const D = P.draw || {}, da = at(cues, D.at, 0), dp = lin(lt, da, D.dur ?? 3), shown = Math.floor(dp * N);
            let rd = '', bd = '', ld = '';
            const lc = cnt ? Math.floor((cnt.value - (P.count.from ?? 0)) / Math.max(1, (P.count.to - (P.count.from ?? 0))) * N) : -1;
            for (let k = 0; k < Math.min(N, shown + 1); k++) {
              const x = lerp(x0, x1, (k + 0.5 + 0.28 * Math.sin(k * 2.7)) / N), big = (k + 1) % band === 0, bow = 26 + 14 * Math.sin(k * 1.3);
              const pts = [[x - 10, y0 + 40], [x + bow * 0.6, lerp(y0, y1, 0.3)], [x + bow, (y0 + y1) / 2 + 8 * Math.sin(k)], [x + bow * 0.5, lerp(y0, y1, 0.75)], [x - 6, y1 - 10]];
              if (big) bd += inkPath(pts, { w: 14, seed: sd + 10 + k, t }) + ' ';
              else if (k < lc) ld += inkPath(pts, { w: 4, seed: sd + 10 + k, t }) + ' ';
              else rd += inkPath(pts, { w: 3.2, seed: sd + 10 + k, t, amp: 0.8 }) + ' ';
            }
            ridges.setAttribute('d', rd); bands.setAttribute('d', bd); lit.setAttribute('d', ld);
            const Tg = P.tags;
            if (Tg) {
              const ta = at(cues, Tg.day, 1), tb = at(cues, Tg.year, 2);
              const kx = lerp(x0, x1, (Math.floor(band * 1.5) + 0.5) / N), bx = lerp(x0, x1, (band * 2 - 0.5) / N);
              let td = '';
              if (lt >= ta) td += inkPath([[kx + 110, y0 + 150], [kx + 8, y0 + 200]], { w: 7, seed: sd + 200, t }) + ' ';
              if (lt >= tb) td += inkPath([[bx + 110, y1 - 110], [bx + 10, y1 - 150]], { w: 7, seed: sd + 201, t }) + ' ';
              tags.setAttribute('d', td);
              tagT[0].textContent = Tg.day_text || '1 day'; tagT[1].textContent = Tg.year_text || '1 year';
              tagT[0].setAttribute('x', f1(kx + 200)); tagT[0].setAttribute('y', f1(y0 + 160)); tagT[0].setAttribute('opacity', lt >= ta ? 1 : 0);
              tagT[1].setAttribute('x', f1(bx + 210)); tagT[1].setAttribute('y', f1(y1 - 90)); tagT[1].setAttribute('opacity', lt >= tb ? 1 : 0);
            } else tagT.forEach(x => x.setAttribute('opacity', 0));
          } else {
            const DY = (P.desk ?? 0.72) * H;
            const dk = [[-40, DY], [W + 40, DY - 8], [W + 40, H + 40], [-40, H + 40]];
            deskF.setAttribute('d', inkLoop(dk, { seed: sd + 1, t, smooth: false })); deskR.setAttribute('d', inkPath(dk.slice(0, 2), { w: 8, seed: sd + 2, t }));
            const lx = (P.lamp_x ?? 0.36) * W;
            lampF.setAttribute('d', inkLoop([[lx - 60, 230], [lx + 60, 230], [lx + 420, DY], [lx - 420, DY]], { seed: sd + 3, t, smooth: false }));
            lampR.setAttribute('d', inkPath([[lx, -10], [lx, 160]], { w: 6, seed: sd + 4, t }) + ' ' + inkPath([[lx - 70, 230], [lx, 160], [lx + 70, 230]], { w: 8, seed: sd + 5, t, smooth: false }));
            // horn coral: curved cone lying on the desk, wide end on the right
            const cx = (P.coral?.x ?? 0.5) * W, s = P.coral?.s ?? 1, len = 760 * s;
            const spine = t2 => [cx - len / 2 + t2 * len, DY - 40 * s - Math.sin(t2 * Math.PI) * 120 * s - t2 * 60 * s];
            const rad = t2 => lerp(18, 150, Math.pow(t2, 0.8)) * s;
            const up = [], dn = [];
            for (let j = 0; j <= 14; j++) { const u = j / 14, p = spine(u); up.push([p[0], p[1] - rad(u)]); dn.push([p[0], p[1] + rad(u)]); }
            const body = up.concat([[spine(1)[0] + 30 * s, spine(1)[1]]], dn.slice().reverse());
            coralF.setAttribute('d', inkLoop(body, { seed: sd + 10, t }));
            coralS.setAttribute('d', inkLoop(dn.slice(3).concat(up.slice(3).reverse().map(([x, y], i) => [x, y + rad(1 - i / 11) * 1.1])), { seed: sd + 11, t }));
            coralR.setAttribute('d', inkPath(body, { w: 7, seed: sd + 12, t, closed: true }) + ' ' + inkPath(ellP(spine(1)[0] + 10 * s, spine(1)[1], 34 * s, rad(1) * 0.95, 14), { w: 6, seed: sd + 13, t, closed: true }));
            let rd = '', bd = '', ld = '';
            const lc = cnt ? Math.floor((cnt.value - (P.count.from ?? 0)) / Math.max(1, (P.count.to - (P.count.from ?? 0))) * N) : -1;
            for (let k = 1; k < N; k++) {
              const u = k / N, p = spine(u), rr = rad(u), big = k % band === 0;
              const pts = [[p[0] - rr * 0.12, p[1] - rr * 0.98], [p[0] + rr * 0.1, p[1]], [p[0] - rr * 0.12, p[1] + rr * 0.98]];
              if (big) bd += inkPath(pts, { w: 7 * s, seed: sd + 20 + k, t, amp: 0.8 }) + ' ';
              else if (k < lc) ld += inkPath(pts, { w: 3.4 * s, seed: sd + 20 + k, t, amp: 0.6 }) + ' ';
              else rd += inkPath(pts, { w: 2.4 * s, seed: sd + 20 + k, t, amp: 0.6 }) + ' ';
            }
            ridges.setAttribute('d', rd); bands.setAttribute('d', bd); lit.setAttribute('d', ld);
            const Ln = P.lens;
            if (Ln) {
              const la = at(cues, Ln.at, 0.3), lp = prog(lt, la, 1.4);
              const tx = (Ln.x ?? 0.55) * W, ty = (Ln.y ?? 0.5) * H, x = lerp(tx + (Ln.flip ? -500 : 500), tx, lp) + Math.sin(t * 0.8) * 20 * lp, y = lerp(ty + 300, ty, lp);
              const R = Ln.r ?? 150;
              lensF.setAttribute('d', inkLoop(ellP(x, y, R, R, 18), { seed: sd + 40, t }));
              lensR.setAttribute('d', inkCircle(x, y, R, sd + 41, t, { w: 16 }));
              const fl = Ln.flip ? -1 : 1; lensH.setAttribute('d', inkPath([[x + fl * R * 0.7, y + R * 0.7], [x + fl * R * 1.6, y + R * 1.6]], { w: 30, seed: sd + 42, t, taper: 0.05 }));
            }
            tagT.forEach(x => x.setAttribute('opacity', 0));
          }
          if (cnt) cnt.update(lt, t, cues);
          if (stampG) stampG.update(lt, t, cues);
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };

  // ===================================================================== es_clock
  SH.es_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs } = ctx, sd = ctx.seed * 1000 + 9951, TD = TDL();
      const g = el(svg, 'g'), mode = P.mode || 'leap';
      const benchF = inkEl(g, INK.hatBand, { 'fill-opacity': 0.75 }), benchR = inkEl(g);
      const bodyF = inkEl(g, INK.paperLight), bodyS = inkEl(g, INK.paperDark), bodyR = inkEl(g), detail = inkEl(g, INK.inkSoft), redE = inkEl(g, INK.red), goldE = inkEl(g, INK.gold), blueE = inkEl(g, INK.blue, { 'fill-opacity': 0.5 });
      const big = el(g, 'text', { 'font-family': ZS, 'font-weight': 800, 'font-size': P.size || 300, 'text-anchor': 'middle', fill: INK.ink });
      const small = [0, 1, 2, 3].map(() => el(g, 'text', { 'font-family': ZS, 'font-weight': 700, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }));
      const globe = (mode === 'atomic' || mode === 'drift') ? TD.earth(el(g, 'g'), defs, sd + 5) : null;
      const cm = common(g, P, W, H, sd);
      const cnt = counter(g, P.count, W, H, sd + 50);
      const lastTag = P.last ? TD.label(g, Object.assign({ color: 'red', size: 80, x: 0.8, y: 0.25 }, P.last), W, H, sd + 70) : null;
      const setTxt = (e, s, x, y, col, op = 1) => { e.textContent = s; e.setAttribute('x', f1(x)); e.setAttribute('y', f1(y)); e.setAttribute('fill', col || INK.ink); e.setAttribute('opacity', op); };
      small.forEach(e => e.setAttribute('opacity', 0)); big.setAttribute('opacity', 0);
      const bench = (t, y) => { const b = [[-40, y], [W + 40, y - 6], [W + 40, H + 40], [-40, H + 40]]; benchF.setAttribute('d', inkLoop(b, { seed: sd + 1, t, smooth: false })); benchR.setAttribute('d', inkPath(b.slice(0, 2), { w: 8, seed: sd + 2, t })); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          let bf = '', bs = '', br = '', dd = '', rd = '', gd = '', bl = '';
          if (mode === 'leap') {
            bench(t, 0.86 * H);
            const x0 = (P.panel?.x0 ?? 0.12) * W, x1 = (P.panel?.x1 ?? 0.88) * W, y0 = (P.panel?.y0 ?? 0.2) * H, y1 = (P.panel?.y1 ?? 0.74) * H;
            const pnl = [[x0, y0], [x1, y0 + 6], [x1 + 4, y1], [x0 - 4, y1 + 4]];
            bf += inkLoop(pnl, { seed: sd + 10, t, smooth: false }); br += inkPath(pnl, { w: 12, seed: sd + 11, t, closed: true, smooth: false });
            br += ' ' + inkPath([[lerp(x0, x1, 0.3), y1], [lerp(x0, x1, 0.25), 0.86 * H]], { w: 10, seed: sd + 12, t }) + ' ' + inkPath([[lerp(x0, x1, 0.7), y1], [lerp(x0, x1, 0.75), 0.86 * H]], { w: 10, seed: sd + 13, t });
            const seq = P.seq || [{ at: 0, text: '23:59:59' }];
            let cur = seq[0], ca = 0;
            seq.forEach(s => { const a = at(cues, s.at, 0); if (lt >= a) { cur = s; ca = a; } });
            const pk = punch(lt, ca, 0.5);
            const mxp = (x0 + x1) / 2; setTxt(big, cur.text, mxp, (y0 + y1) / 2 + (P.size || 300) * 0.34, COLS()[cur.color] || INK.ink);
            big.setAttribute('transform', `translate(${f1(mxp)} ${f1((y0 + y1) / 2)}) scale(${(1 + 0.08 * pk).toFixed(3)}) translate(${f1(-mxp)} ${f1(-(y0 + y1) / 2)})`);
            if (cur.color === 'red' && P.ring !== false) rd += inkPath(ellP(mxp + (P.ring_dx ?? 330), (y0 + y1) / 2 + 10, 190, 150, 16), { w: 10, seed: sd + 14, t, closed: true });
            // blinking colon dots + LEDs
            for (let k = 0; k < 6; k++) gd += inkDot(x0 + 60 + k * 50, y1 - 40, 12, 12, sd + 20 + k, t) + ' ';
            if (Math.floor(t * 2) % 2) gd = '';
            if (P.tag) { setTxt(small[0], P.tag, mxp + (P.tag_dx ?? 0), P.tag_y != null ? P.tag_y * H : y0 - 30, INK.red, lt >= at(cues, P.tag_at, 0) ? 1 : 0); small[0].setAttribute('font-size', P.tag_size || 64); }
          } else if (mode === 'atomic') {
            bench(t, 0.74 * H);
            const x0 = 0.08 * W, y = 0.5 * H, L = 0.55 * W, R = 90;
            const tube = [[x0, y - R], [x0 + L, y - R], [x0 + L, y + R], [x0, y + R]];
            bf += inkLoop(tube, { seed: sd + 10, t, smooth: false }); br += inkPath(tube, { w: 8, seed: sd + 11, t, closed: true, smooth: false });
            for (let k = 0; k < 5; k++) { const x = x0 + 40 + k * (L - 80) / 4; bs += inkLoop(rectP(x - 18, y - R - 20, 36, 2 * R + 40), { seed: sd + 20 + k, t, smooth: false }) + ' '; br += inkPath(rectP(x - 18, y - R - 20, 36, 2 * R + 40), { w: 5, seed: sd + 30 + k, t, closed: true, smooth: false }) + ' '; }
            for (const lx of [x0 + 0.2 * L, x0 + 0.8 * L]) br += inkPath([[lx, y + R + 20], [lx - 30, 0.74 * H]], { w: 9, seed: sd + 40 + lx, t }) + ' ' + inkPath([[lx, y + R + 20], [lx + 30, 0.74 * H]], { w: 9, seed: sd + 41 + lx, t }) + ' ';
            // atoms flying along the tube
            for (let k = 0; k < 9; k++) { const u = ((t * 0.35 + k / 9) % 1), x = x0 + 20 + u * (L - 40), yy = y + Math.sin(k * 2.1 + t * 3) * 30; gd += inkDot(x, yy, 13, 13, sd + 50 + k, t) + ' '; }
            // readout box
            const bx = 0.3 * W, by = 0.12 * H;
            bf += ' ' + inkLoop(rectP(bx, by, 660, 170), { seed: sd + 60, t, smooth: false }); br += ' ' + inkPath(rectP(bx, by, 660, 170), { w: 7, seed: sd + 61, t, closed: true, smooth: false });
            const secs = Math.floor(lt * 1) % 60, frac = Math.floor((lt % 1) * 1000);
            setTxt(small[0], `00:00:${String(secs).padStart(2, '0')}.${String(frac).padStart(3, '0')}`, bx + 330, by + 112, INK.ink, 1);
            small[0].setAttribute('font-size', 88);
            if (globe) {
              const gx = 0.82 * W, gy = 0.44 * H, gr = 170, wob = Math.sin(t * 1.3) * 0.06;
              globe.update(t * 2, gx + Math.sin(t * 1.3) * 18, gy, gr, true, true);
              const tilt = [[gx - 230 * Math.cos(wob), gy + 230 * Math.sin(wob) - 0], [gx + 230 * Math.cos(wob), gy - 230 * Math.sin(wob)]];
              dd += inkPath([[gx + Math.sin(t * 1.3) * 18 - Math.sin(wob + 0.2) * 230, gy - 230], [gx + Math.sin(t * 1.3) * 18 + Math.sin(wob + 0.2) * 230, gy + 230]], { w: 4, seed: sd + 70, t });
              void tilt;
            }
          } else if (mode === 'servers') {
            bench(t, 0.84 * H);
            const ca = at(cues, P.crash?.at, 1e9), n = P.crash?.n ?? 8;
            for (let r = 0; r < 4; r++) {
              const x = 0.06 * W + r * 0.235 * W, w = 0.2 * W, top = 0.19 * H, bot = 0.84 * H;
              const rack = rectP(x, top, w, bot - top);
              bs += inkLoop(rack, { seed: sd + 10 + r, t, smooth: false }) + ' '; br += inkPath(rack, { w: 8, seed: sd + 20 + r, t, closed: true, smooth: false }) + ' ';
              for (let j = 0; j < 4; j++) {
                const sy = top + 30 + j * 134, scr = rectP(x + 30, sy, w - 60, 100), idx = r * 4 + j;
                bf += inkLoop(scr, { seed: sd + 30 + idx, t, smooth: false }) + ' '; br += inkPath(scr, { w: 5, seed: sd + 50 + idx, t, closed: true, smooth: false }) + ' ';
                const order = (idx * 7) % 16, dead = lt >= ca + order * 0.18 && order < n * 2;
                if (dead) {
                  const cx = x + w / 2, cy = sy + 50, k = spring(lt, ca + order * 0.18, 0.3) * 40;
                  rd += inkPath([[cx - k, cy - k], [cx + k, cy + k]], { w: 12, seed: sd + 70 + idx, t }) + ' ' + inkPath([[cx + k, cy - k], [cx - k, cy + k]], { w: 12, seed: sd + 90 + idx, t }) + ' ';
                } else {
                  for (let q = 0; q < 3; q++) { const ww = (w - 120) * (0.4 + 0.6 * ((Math.floor(t * 3) + q + idx) % 4) / 4); dd += inkPath([[x + 50, sy + 30 + q * 26], [x + 50 + ww, sy + 30 + q * 26]], { w: 5, seed: sd + 110 + idx * 3 + q, t, amp: 0.6 }) + ' '; }
                  gd += inkDot(x + w - 50, sy + 30, 9, 9, sd + 160 + idx, t) + ' ';
                }
              }
            }
            if (lt >= ca) for (let k = 0; k < 6; k++) { const a = k + t * 7, x = 0.2 * W + ((k * 331) % 1100), y = 0.2 * H + ((k * 171) % 500); gd += inkPath([[x, y], [x + Math.cos(a) * 40, y + Math.sin(a) * 40]], { w: 6, seed: sd + 200 + k, t }) + ' '; }
          } else if (mode === 'tally') {
            const x0 = 0.08 * W, y0 = 0.27 * H, x1 = 0.92 * W, y1 = 0.72 * H;
            const brd = [[x0, y0], [x1, y0 + 6], [x1 + 4, y1], [x0 - 4, y1 + 4]];
            bs += inkLoop(brd, { seed: sd + 10, t, smooth: false }); br += inkPath(brd, { w: 14, seed: sd + 11, t, closed: true, smooth: false });
            bench(t, 0.86 * H);
            const n = P.n ?? 27, D = P.draw || {}, da = at(cues, D.at, 0.2), dp = lin(lt, da, D.dur ?? 3.5), shown = Math.floor(dp * n + 0.001);
            for (let k = 0; k < Math.min(n, shown); k++) {
              const grp = Math.floor(k / 5), j = k % 5, gx = x0 + 120 + (grp % 6) * 250, gy = y0 + 60 + Math.floor(grp / 6) * 0;
              const xx = gx + j * 36;
              if (j < 4) dd += inkPath([[xx, gy], [xx + 6, gy + 200]], { w: 10, seed: sd + 20 + k, t }) + ' ';
              else dd += inkPath([[gx - 20, gy + 160], [gx + 150, gy + 40]], { w: 10, seed: sd + 20 + k, t }) + ' ';
              if (k === n - 1) rd += inkPath(ellP(gx + 40, gy + 100, 80, 130, 14), { w: 9, seed: sd + 80, t, closed: true });
            }
            if (lastTag) lastTag.update(lt, t, cues);
          } else if (mode === 'dial') {
            const cx = (P.x ?? 0.36) * W, cy = 0.46 * H, R = 330;
            bf += inkLoop(ellP(cx, cy, R, R, 24), { seed: sd + 10, t }); br += inkCircle(cx, cy, R, sd + 11, t, { w: 12 });
            const Hh = P.hours || {}, ha = at(cues, Hh.at, 0.5), hp = prog(lt, ha, Hh.dur ?? 2.5), hours = lerp(Hh.from ?? 24, Hh.to ?? 22, hp);
            const gap = (24 - hours) / 24 * Math.PI * 2;
            if (gap > 0.01) { const pts = [[cx, cy]]; for (let j = 0; j <= 8; j++) { const a = -gap + j / 8 * gap; pts.push([cx + Math.sin(a) * R * 0.92, cy - Math.cos(a) * R * 0.92]); } rd += inkLoop(pts, { seed: sd + 12, t }); }
            for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, r1 = R * (k % 6 ? 0.86 : 0.78); dd += inkPath([[cx + Math.sin(a) * r1, cy - Math.cos(a) * r1], [cx + Math.sin(a) * R * 0.94, cy - Math.cos(a) * R * 0.94]], { w: k % 6 ? 4 : 8, seed: sd + 20 + k, t }) + ' '; }
            const ha2 = t * 1.6;
            br += ' ' + inkPath([[cx, cy], [cx + Math.sin(ha2) * R * 0.75, cy - Math.cos(ha2) * R * 0.75]], { w: 10, seed: sd + 50, t }) + ' ' + inkDot(cx, cy, 18, 18, sd + 51, t);
            setTxt(small[0], (Math.abs(hours - Math.round(hours)) < 0.05 ? String(Math.round(hours)) : hours.toFixed(1)) + (P.unit || ' hours'), (P.tx ?? 0.74) * W, 0.44 * H, INK.red, 1);
            small[0].setAttribute('font-size', 150);
            setTxt(small[1], P.sub || 'in one day', (P.tx ?? 0.74) * W, 0.58 * H, INK.ink, 1);
            small[1].setAttribute('font-family', INK_FONT); small[1].setAttribute('font-size', 72);
          } else if (mode === 'drift') {
            bench(t, 0.8 * H);
            const lx = 0.22 * W, rx = 0.78 * W, cy = 0.44 * H;
            const box = rectP(lx - 230, cy - 130, 460, 260);
            bf += inkLoop(box, { seed: sd + 10, t, smooth: false }); br += inkPath(box, { w: 9, seed: sd + 11, t, closed: true, smooth: false });
            const s = Math.floor(lt) % 60;
            setTxt(small[0], `12:00:${String(s).padStart(2, '0')}`, lx, cy + 34, INK.ink, 1); small[0].setAttribute('font-size', 110);
            setTxt(small[1], P.left || 'ATOMS', lx, cy - 170, INK.blue, 1); small[1].setAttribute('font-size', 72);
            setTxt(small[2], P.right || 'EARTH', rx, cy - 240, INK.green, 1); small[2].setAttribute('font-size', 72);
            if (globe) globe.update(t * 1.5, rx, cy + 20, 190, true, true);
            const Gp = P.gap || {}, ga = at(cues, Gp.at, 0.5), gp = prog(lt, ga, Gp.dur ?? 3);
            const y = 0.68 * H, xa = lx + 240, xb = lerp(xa, rx - 210, gp);
            if (gp > 0.01) rd += inkPath([[xa, y], [xb, y]], { w: 16, seed: sd + 20, t }) + ' ' + inkPath([[xa, y - 34], [xa, y + 34]], { w: 9, seed: sd + 21, t }) + ' ' + inkPath([[xb, y - 34], [xb, y + 34]], { w: 9, seed: sd + 22, t });
            setTxt(small[3], Gp.text || 'UP TO 1 HOUR', (xa + rx - 210) / 2, y - 50, INK.red, clamp01(gp * 2)); small[3].setAttribute('font-size', 76);
          } else if (mode === 'pages') {
            bench(t, 0.82 * H);
            const cx = (P.x ?? 0.3) * W, top = 0.18 * H, w = 420, h = 0.64 * H - 40;
            const pad = [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2, top + h], [cx - w / 2, top + h]];
            bs += inkLoop(pad, { seed: sd + 10, t, smooth: false });
            bf += inkLoop(rectP(cx - w / 2 + 14, top + 40, w - 28, h - 54), { seed: sd + 11, t, smooth: false });
            br += inkPath(pad, { w: 8, seed: sd + 12, t, closed: true, smooth: false }) + ' ' + inkPath(rectP(cx - w / 2 + 14, top + 40, w - 28, h - 54), { w: 5, seed: sd + 13, t, closed: true, smooth: false });
            rd += inkLoop(rectP(cx - w / 2, top, w, 70), { seed: sd + 14, t, smooth: false });
            for (let k = 0; k < 3; k++) dd += inkCircle(cx - 120 + k * 120, top + 10, 16, sd + 15 + k, t, { w: 6 }) + ' ';
            // flying pages: rate grows
            const rate = lerp(1.5, 9, clamp01(lt / Math.max(1, dur)));
            for (let k = 0; k < 6; k++) {
              const ph = ((lt * rate * 0.25 + k / 6) % 1), x = cx + ph * 900 + k * 40, y = top + 80 - Math.sin(ph * Math.PI) * 260 + ph * 300, rot = ph * 2.5 + k;
              const pg = ellP(0, 0, 150, 190, 4, Math.PI / 4).map(([px, py]) => [x + px * Math.cos(rot) - py * Math.sin(rot) * 0.6, y + px * Math.sin(rot) + py * Math.cos(rot) * 0.6]);
              bf += ' ' + inkLoop(pg, { seed: sd + 30 + k, t, smooth: false }); br += ' ' + inkPath(pg, { w: 5, seed: sd + 40 + k, t, closed: true, smooth: false });
            }
            const day = Math.floor(lt * rate * 3) % 31 + 1;
            setTxt(small[0], String(day), cx, top + h * 0.62, INK.ink, 1); small[0].setAttribute('font-size', 230);
          }
          bodyF.setAttribute('d', bf); bodyS.setAttribute('d', bs); bodyR.setAttribute('d', br); detail.setAttribute('d', dd); redE.setAttribute('d', rd); goldE.setAttribute('d', gd); blueE.setAttribute('d', bl);
          if (cnt) cnt.update(lt, t, cues);
          cm.update(lt, t, cues, g, dur);
        },
      };
    },
  };
  // aliases (same drawings, different modes in the script; keeps the type rhythm readable)
  SH.es_orbit = { kind: '2d', build: c => SH.es_tide.build(c) };
  SH.es_moon = { kind: '2d', build: c => SH.es_tide.build(Object.assign({}, c, { P: Object.assign({ mode: 'mirror' }, c.P) })) };
  SH.es_planet = { kind: '2d', build: c => SH.es_globe.build(c) };
  SH.es_fossil = { kind: '2d', build: c => SH.es_coral.build(c) };
  SH.es_display = { kind: '2d', build: c => SH.es_clock.build(Object.assign({}, c, { P: Object.assign({ mode: 'leap' }, c.P) })) };
  SH.es_rack = { kind: '2d', build: c => SH.es_clock.build(Object.assign({}, c, { P: Object.assign({ mode: 'servers' }, c.P) })) };
})();
