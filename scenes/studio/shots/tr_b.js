// tr_b: two data shots in the parchment ink style (brand/kit/BRAND.md §3, §5; 8 Hz boil via _ink.js), written for
// 01-turkiye-50-yil-sonra (chapters "beşikler boşalıyor" and "tepe noktası"). Both are parametric.
//
// SHOTS.tr_b_curve — a hand-drawn line chart: axes, an ink curve that draws itself, a dashed part for projections
//   (with a small handwritten "tahmin"), marks (dot + Fraunces number + handwritten sub), an optional horizontal
//   threshold line, a shaded "below the line" area, an optional second (alternative) dashed curve and an ink car that
//   drives along the curve and slows down. Consecutive scenes keep the same frame (camera drift uses global time), so
//   "start where the last scene stopped" continues seamlessly with "transition": "cut".
//   P: {data: [[year, value], ...], x0: 1970, x1: 2080, y0: 30, y1: 100, proj: 2024 (dashed after),
//       show: [[time|cue, year], ...] (reveal keyframes, eased; first key = start), ticks: [1976, 2030],
//       proj_label: "tahmin" | false, unit: "milyon",
//       marks: [{year, text, sub, at, color: "red", dx, dy, fade: time|cue, alt: true (on the alt curve)}],
//       hline: {value, text, sub, at, color}, below: {from: year, at} (shade between curve and hline),
//       alt: {data, at, dur, color: "blue", text},
//       car: {keys: [[time|cue, year], ...], lead: 2.5 (curve reveal runs ahead of the car)},
//       kasif: {x: 0.885, y: 0.82, scale: 0.72, face: -1, pose, at, then, dir, emotion, seq: [{at, pose, dir, emotion}]},
//       box: [x, y, w, h] (0..1)}
//
// SHOTS.tr_b_people — population pictograms: rows of little ink people (adult, woman, child = small, old = cane).
//   P: {mode: "family"|"share"|"median"|"quarter", big: {text, from, at, color, x, y, size}, note: {text, at, x, y, color},
//       kasif: {...as above}, + per mode:
//       family:  {half_at: cue (the half child), child_at}
//       share:   {rows: 5, cols: 20, kids: 24, kids_at: cue}
//       median:  {n: 11, line_at: cue, label: "ortanca yaş", bracket: {text, at}}
//       quarter: {n: 4, old: 1, old_at: cue}}
// Everything is a pure function of (seed, lt, t): no Math.random.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, ink: INK.ink, soft: INK.inkSoft };
  const colOf = c => COL[c] || c || INK.ink;
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const txt = (parent, s, size, font, color, anchor = 'middle', weight) => {
    const n = el(parent, 'text', { 'font-family': font, 'font-size': size, 'text-anchor': anchor, fill: color,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: ${Math.round(size * 0.16)}px; stroke-linejoin: round` });
    if (weight) n.setAttribute('font-weight', weight);
    n.textContent = s;
    return n;
  };
  const words = (ctx, env) => env.words || ctx.words || (typeof WORDS !== 'undefined' ? WORDS : null);

  // ---------------------------------------------------------------- Kaşif with a little pose sequence
  function kasifOf(K, parent, seed, W, H) {
    if (!K || typeof KASIF === 'undefined') return null;
    K = typeof K === 'object' ? K : { pose: K };
    const rig = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.72, seed: seed + 5 });
    const dirA = d => typeof d === 'number' ? d : DIRS[d] ?? 25;
    return {
      update(lt, t, dur, cues, wd) {
        const segs = [{ t0: -1, pose: K.pose || 'idle', dir: K.dir0 ?? K.dir, emotion: K.emotion0 || null, face: K.face ?? -1 }];
        if (K.at != null) segs.push({ t0: atOr(cues, K.at, dur * 0.4), pose: K.then || 'point', dir: K.dir, emotion: K.emotion || null, face: K.face ?? -1 });
        (K.seq || []).forEach(s => segs.push({ t0: atOr(cues, s.at, dur * 0.5), pose: s.pose || 'idle', dir: s.dir ?? K.dir, emotion: s.emotion || null, face: s.face ?? K.face ?? -1 }));
        segs.sort((a, b) => a.t0 - b.t0);
        let k = 0; while (k + 1 < segs.length && lt >= segs[k + 1].t0) k++;
        const s = segs[k], pv = segs[k - 1], since = lt - Math.max(0, s.t0);
        const o = { x: (K.x ?? 0.885) * W, y: (K.y ?? 0.82) * H, face: s.face, since, dir: dirA(s.dir),
          emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: K.talk === false ? 0 : inkTalk(t, wd) };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: Math.max(0, s.t0 - Math.max(0, pv.t0)), dir: dirA(pv.dir), emotion: pv.emotion }; o.mix = since / 0.32; }
        rig.update(t, s.pose, o);
      },
    };
  }

  // keyframes [[time|cue, value], ...] -> eased value at lt
  function keyed(keys, lt, cues, ease = sm) {
    const K = keys.map(k => [atOr(cues, k[0], 0), k[1]]);
    if (lt <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) {
      if (lt < K[i][0]) { const a = K[i - 1], b = K[i], d = Math.max(0.3, Math.min(b[0] - a[0], 2.2)); return lerp(a[1], b[1], ease((lt - a[0]) / d)); }
      // the move between keys takes at most 2.2 s and starts at the earlier key
    }
    return K[K.length - 1][1];
  }

  // split a dense polyline into dash pieces
  function dashes(pts, on = 26, off = 17) {
    const out = []; let cur = [pts[0]], acc = 0, draw = true;
    for (let i = 1; i < pts.length; i++) {
      let a = pts[i - 1]; const b = pts[i];
      let seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (seg > 0) {
        const lim = (draw ? on : off) - acc;
        if (seg < lim) { acc += seg; if (draw) cur.push(b); seg = 0; }
        else {
          const u = lim / seg, m = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
          if (draw) { cur.push(m); if (cur.length > 1) out.push(cur); }
          cur = [m]; acc = 0; draw = !draw; seg -= lim; a = m;
        }
      }
    }
    if (draw && cur.length > 1) out.push(cur);
    return out;
  }
  // dense smooth screen polyline through data, and y at a given x
  function dense(data, X, Y) { return inkSpline(data.map(d => [X(d[0]), Y(d[1])]), false, 5); }
  function yAt(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i], u = (x - a[0]) / Math.max(1e-6, b[0] - a[0]); return lerp(a[1], b[1], u); }
    return pts[pts.length - 1][1];
  }
  const clipX = (pts, xa, xb) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p[0] >= xa && p[0] <= xb) out.push(p);
      const q = pts[i + 1];
      if (q && p[0] < xb && q[0] > xb) out.push([xb, lerp(p[1], q[1], (xb - p[0]) / (q[0] - p[0]))]);
      if (q && p[0] < xa && q[0] > xa) out.push([xa, lerp(p[1], q[1], (xa - p[0]) / (q[0] - p[0]))]);
    }
    return out.sort((a, b) => a[0] - b[0]);
  };

  // ================================================================ tr_b_curve
  SH.tr_b_curve = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = 7100 + (P.seed ?? 3) * 10;          // fixed per chart (not per scene) so consecutive scenes boil alike
      const B = P.box || [0.1, 0.22, 0.66, 0.52];
      const bx = B[0] * W, by = B[1] * H, bw = B[2] * W, bh = B[3] * H;
      const x0 = P.x0 ?? 1970, x1 = P.x1 ?? 2080, y0 = P.y0 ?? 30, y1 = P.y1 ?? 100;
      const X = yr => bx + (yr - x0) / (x1 - x0) * bw, Y = v => by + bh - (v - y0) / (y1 - y0) * bh;
      const data = P.data || [[1975, 40], [2024, 86]];
      const proj = P.proj ?? 9999;
      const root = el(svg, 'g'), world = el(root, 'g');
      const areaF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), belowF = mk(world, INK.red, { 'fill-opacity': 0.22 });
      const axisR = mk(world, INK.ink), tickR = mk(world, INK.inkSoft);
      const hlR = mk(world, P.hline ? colOf(P.hline.color || 'blue') : INK.ink);
      const altR = mk(world, P.alt ? colOf(P.alt.color || 'blue') : INK.blue);
      const solidR = mk(world, INK.ink), dashR = mk(world, INK.ink);
      const markF = mk(world, INK.red), markR = mk(world, INK.ink), tipF = mk(world, INK.red);
      const carG = el(world, 'g'), puffF = mk(world, INK.paperLight, { 'fill-opacity': 0.9 }), puffR = mk(world, INK.inkSoft);
      const carBody = mk(carG, INK.red), carWin = mk(carG, INK.paperLight), carR = mk(carG, INK.ink), wheelF = mk(carG, INK.ink), wheelS = mk(carG, INK.paperLight);
      const uiG = el(world, 'g'), castG = el(root, 'g');
      const ticks = (P.ticks || []).map(yr => ({ yr, n: txt(uiG, String(yr), 44, INK_FONT, INK.inkSoft) }));
      const unit = P.unit ? txt(uiG, P.unit, 46, INK_FONT, INK.inkSoft, 'start') : null;
      const pl = P.proj_label === false ? null : txt(uiG, P.proj_label || 'tahmin', 48, INK_FONT, INK.inkSoft);
      const marks = (P.marks || []).map(m => ({ m, big: m.text ? txt(uiG, m.text, m.size || 76, FR, colOf(m.color || 'red'), 'middle', 900) : null,
        sub: m.sub ? txt(uiG, m.sub, 46, INK_FONT, INK.inkSoft) : null, lead: mk(uiG, INK.inkSoft) }));
      const hl = P.hline ? { big: P.hline.text ? txt(uiG, P.hline.text, 72, FR, colOf(P.hline.color || 'blue'), 'start', 900) : null,
        sub: P.hline.sub ? txt(uiG, P.hline.sub, 46, INK_FONT, colOf(P.hline.color || 'blue'), 'start') : null } : null;
      const altT = P.alt && P.alt.text ? txt(uiG, P.alt.text, 56, INK_FONT, colOf(P.alt.color || 'blue')) : null;
      const note = P.note ? txt(uiG, P.note.text, P.note.size || 60, INK_FONT, colOf(P.note.color || 'red')) : null;
      const noteU = mk(uiG, P.note ? colOf(P.note.color || 'red') : INK.red);
      const kas = kasifOf(P.kasif, castG, seed, W, H);
      const baseD = dense(data, X, Y), altD = P.alt ? dense(P.alt.data, X, Y) : null;
      const showKeys = P.show || [[0, data[0][0]], [2.2, data[data.length - 1][0]]];
      const pop = (n, s, x, y, rot = 0) => { n.setAttribute('opacity', clamp01(s * 2)); n.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${lerp(0.5, 1, clamp01(s)).toFixed(3)})`); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
          world.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)})`);
          // axes
          axisR.setAttribute('d', inkPath([[bx, by - 20], [bx, by + bh], [bx + bw + 30, by + bh]], O(1, { w: 6, smooth: false })) + ' ' +
            inkPath([[bx + bw + 8, by + bh - 12], [bx + bw + 32, by + bh], [bx + bw + 8, by + bh + 12]], O(2, { w: 5, smooth: false })));
          let td = '';
          ticks.forEach((k, i) => { const x = X(k.yr); td += inkPath([[x, by + bh - 10], [x, by + bh + 14]], O(10 + i, { w: 4, smooth: false })) + ' '; k.n.setAttribute('x', f1(x)); k.n.setAttribute('y', f1(by + bh + 58)); });
          tickR.setAttribute('d', td);
          if (unit) { unit.setAttribute('x', f1(bx + 22)); unit.setAttribute('y', f1(by + 30)); }
          // the car decides the reveal when it leads; otherwise the show keyframes
          let carYr = null;
          if (P.car) carYr = keyed(P.car.keys, lt, cues, u => 1 - Math.pow(1 - clamp01(u), 2.3));
          let rev = keyed(showKeys, lt, cues);
          if (carYr != null) rev = Math.max(rev, Math.min(data[data.length - 1][0], carYr + (P.car.lead ?? 2.5)));
          const jit = data.map((d, i) => { const b = boil(sd + 40 + i, t, 1.6); return [X(d[0]) + b[0], Y(d[1]) + b[1]]; });
          const D = inkSpline(jit, false, 5);
          const xr = X(rev), xp = X(proj), xs = D[0][0];
          const solid = clipX(D, xs, Math.min(xr, xp)), dsh = xr > xp ? clipX(D, xp, xr) : [];
          solidR.setAttribute('d', solid.length > 1 ? inkPath(solid, O(50, { w: 9, amp: 0, smooth: false, taper: 0.1 })) : '');
          dashR.setAttribute('d', dsh.length > 1 ? dashes(dsh).map((q, i) => inkPath(q, O(60 + i, { w: 8, amp: 0, smooth: false, taper: 0.15 }))).join(' ') : '');
          const shown = clipX(D, xs, xr);
          areaF.setAttribute('d', shown.length > 1 ? inkLoop([...shown, [shown[shown.length - 1][0], by + bh], [shown[0][0], by + bh]], O(55, { amp: 0, smooth: false })) : '');
          // projection label
          if (pl) {
            const on = xr > xp + 30 ? sm((xr - xp - 30) / 80) : 0, lx = xp + Math.min(150, (xr - xp) / 2), ly = yAt(D, lx);
            pl.setAttribute('opacity', on); pl.setAttribute('transform', `translate(${f1(lx)} ${f1(ly + 66)}) rotate(-4)`);
          }
          // tip dot
          const tipY = yAt(D, xr), drawing = Math.abs(keyed(showKeys, lt + 0.05, cues) - rev) > 1e-4 || carYr != null;
          tipF.setAttribute('d', rev > data[0][0] + 0.5 && drawing ? inkDot(xr, tipY, 13 + Math.sin(t * 8) * 2, null, sd + 70, t) : '');
          // threshold line
          if (P.hline) {
            const ha = atOr(cues, P.hline.at, 0.4), hp = sm(prog(lt, ha, 1.0)), hy = Y(P.hline.value);
            const xe = lerp(bx, bx + bw, hp);
            hlR.setAttribute('d', hp > 0.01 ? dashes([[bx, hy], [xe, hy]], 30, 16).map((q, i) => inkPath(q, O(80 + i, { w: 7, amp: 1, smooth: false }))).join(' ') : '');
            const s = lt >= ha ? spring(lt, ha + 0.3, 0.6) : 0;
            const hx = bx + (P.hline.x ?? 0.04) * bw;
            if (hl.big) pop(hl.big, s, hx, hy - 26);
            if (hl.sub) pop(hl.sub, s, hx + 120, hy - 26);
            if (P.below) {
              const ba = atOr(cues, P.below.at, dur * 0.6), bp = lt >= ba ? sm(prog(lt, ba, 0.8)) : 0;
              const xa = X(P.below.from), xb = lerp(xa, xr, bp), seg = clipX(D, xa, xb).filter(p => p[1] >= hy - 1);
              belowF.setAttribute('d', bp > 0.01 && seg.length > 1 ? inkLoop([[seg[0][0], hy], ...seg, [seg[seg.length - 1][0], hy]], O(90, { amp: 0, smooth: false })) : '');
            }
          }
          // alternative curve (e.g. UN)
          if (P.alt) {
            const aa = atOr(cues, P.alt.at, 0.5), ap = sm(prog(lt, aa, P.alt.dur ?? 2.2));
            const ja = P.alt.data.map((d, i) => { const b = boil(sd + 140 + i, t, 1.6); return [X(d[0]) + b[0], Y(d[1]) + b[1]]; });
            const A = inkSpline(ja, false, 5), axs = A[0][0], axe = lerp(axs, A[A.length - 1][0], ap);
            const seg = clipX(A, axs, axe);
            altR.setAttribute('d', ap > 0.01 && seg.length > 1 ? dashes(seg, 18, 14).map((q, i) => inkPath(q, O(150 + i, { w: 7, amp: 0, smooth: false }))).join(' ') : '');
            if (altT) { const lx = A[A.length - 1][0] - 40, ly = yAt(A, lx) + 64; pop(altT, ap > 0.85 ? spring(lt, aa + (P.alt.dur ?? 2.2) * 0.85, 0.5) : 0, lx, ly, -4); }
          }
          // marks
          let md = '', mr = '';
          marks.forEach((M, i) => {
            const m = M.m, at = atOr(cues, m.at, 0.3), x = X(m.year), y = yAt(m.alt && altD ? altD : D, x);
            const s = lt >= at ? spring(lt, at, 0.55) : 0, fadeAt = m.fade != null ? atOr(cues, m.fade, 0) : null;
            const fo = fadeAt != null ? 1 - sm(prog(lt, fadeAt, 0.5)) : 1;
            const r = 15 * clamp01(s) * (1 + 0.25 * punch(lt, at, 0.5));
            if (r > 1) { md += inkDot(x, y, r, null, sd + 200 + i, t) + ' '; mr += inkCircle(x, y, r + 10, sd + 210 + i, t, { w: 4 }) + ' '; }
            const lx = x + (m.dx ?? 0), ly = y + (m.dy ?? -70);
            if (M.big) { pop(M.big, s * fo, lx, ly); M.big.setAttribute('opacity', clamp01(s * 2) * fo); }
            if (M.sub) { const ss = lt >= at ? spring(lt, at + 0.35, 0.5) : 0; pop(M.sub, ss, lx, ly + (m.sub_dy ?? 52), -3); M.sub.setAttribute('opacity', clamp01(ss * 2) * fo); }
            M.lead.setAttribute('d', s > 0.6 && fo > 0.5 && Math.abs(m.dy ?? -70) > 110 ? inkPath([[x, y - 26], [lx, ly + 22]], O(230 + i, { w: 3 })) : '');
          });
          markF.setAttribute('d', md); markR.setAttribute('d', mr);
          // the car (drives on the curve, tilts with the slope, wheels turn, exhaust puffs)
          if (P.car && carYr != null) {
            const cx = X(carYr), cy = yAt(D, cx), ang = Math.atan2(yAt(D, cx + 20) - yAt(D, cx - 20), 40) * 180 / Math.PI;
            const bb = boil(sd + 300, t, 1.2);
            carG.setAttribute('transform', `translate(${f1(cx + bb[0])} ${f1(cy - 6 + bb[1])}) rotate(${f1(ang)})`);
            const Ob = k => O(310 + k, { amp: 1 });
            const body = [[-80, -30], [80, -30], [84, -62], [40, -66], [18, -104], [-48, -104], [-66, -66], [-84, -60]];
            carBody.setAttribute('d', inkLoop(body, Object.assign(Ob(1), { smooth: false })));
            carWin.setAttribute('d', inkLoop([[-40, -70], [-28, -96], [-6, -96], [-6, -70]], Object.assign(Ob(2), { smooth: false })) + ' ' + inkLoop([[4, -70], [4, -96], [14, -96], [32, -70]], Object.assign(Ob(3), { smooth: false })));
            carR.setAttribute('d', inkPath(body, Object.assign(Ob(4), { w: 5, closed: true, smooth: false })));
            const rot = (carYr - (P.car.keys[0][1])) * 1.4;
            wheelF.setAttribute('d', inkDot(-46, -24, 24, 24, sd + 320, t) + ' ' + inkDot(48, -24, 24, 24, sd + 321, t));
            wheelS.setAttribute('d', [-46, 48].map((wx, k) => inkPath([[wx + Math.cos(rot) * 14, -24 + Math.sin(rot) * 14], [wx - Math.cos(rot) * 14, -24 - Math.sin(rot) * 14]], O(330 + k, { w: 5, amp: 0.5 }))).join(' '));
            // puffs while the car still has speed
            const speed = Math.abs(carYr - keyed(P.car.keys, lt - 0.15, cues, u => 1 - Math.pow(1 - clamp01(u), 2.3))) / 0.15;
            let pf = '', pr = '';
            for (let k = 0; k < 4; k++) {
              const age = ((lt * 1.6 + k / 4) % 1), r = (10 + age * 26) * clamp01(speed / 2);
              if (r < 2) continue;
              const a = ang * Math.PI / 180, px = cx - Math.cos(a) * (96 + age * 70) - age * 10, py = cy - 40 - Math.sin(a) * (96 + age * 70) - age * 40;
              pf += inkCircle(px, py, r, sd + 340 + k, t, { fill: true }) + ' '; pr += inkCircle(px, py, r, sd + 340 + k, t, { w: 3 }) + ' ';
            }
            puffF.setAttribute('d', pf); puffR.setAttribute('d', pr);
          }
          // handwritten note with underline
          if (note) {
            const na = atOr(cues, P.note.at, dur * 0.5), s = lt >= na ? spring(lt, na, 0.6) : 0, nx = (P.note.x ?? 0.5) * W, ny = (P.note.y ?? 0.2) * H;
            pop(note, s, nx, ny, -3);
            const tw = note.getComputedTextLength ? note.getComputedTextLength() : 300, pu = lt >= na ? prog(lt, na + 0.4, 0.4) : 0;
            noteU.setAttribute('d', pu > 0.01 ? inkPath([[nx - tw / 2, ny + 22], [nx - tw / 2 + tw * pu, ny + 15]], O(400, { w: 6 })) : '');
          }
          if (kas) kas.update(lt, t, dur, cues, words(ctx, env));
        },
      };
    },
  };

  // ---------------------------------------------------------------- pictogram person
  // kind: adult | woman | child | old; (x, g) = ground point; h = height in px; returns {ring, dot, dress}
  function person(kind, x, g, h, seed, t, sway = 0) {
    const O = (k, w) => ({ seed: seed + k, t, amp: Math.max(0.6, h * 0.008), w, smooth: true, taper: 0.2 });
    const w = Math.max(4, h * 0.05);
    const child = kind === 'child', old = kind === 'old';
    const hr = h * (child ? 0.15 : 0.11);
    const bend = old ? h * 0.08 : 0;
    const hip = [x + sway * 0.3, g - h * 0.44], sh = [x + bend + sway, g - h + hr * 2.3 + (old ? h * 0.05 : 0)];
    const head = [sh[0] + bend * 0.6, sh[1] - hr * 1.25];
    let ring = inkPath([sh, hip], O(1, w));
    ring += ' ' + inkPath([[hip[0] - h * 0.1, g], hip, [hip[0] + h * 0.1, g]], Object.assign(O(2, w), { smooth: false }));
    const armY = sh[1] + h * 0.05;
    let dress = '';
    if (kind === 'woman') dress = inkLoop([[sh[0] - h * 0.04, sh[1] + h * 0.02], [sh[0] + h * 0.04, sh[1] + h * 0.02], [hip[0] + h * 0.17, g - h * 0.26], [hip[0] - h * 0.17, g - h * 0.26]], { seed: seed + 9, t, amp: 1, smooth: false });
    if (old) {
      const hand = [sh[0] + h * 0.2, g - h * 0.42];
      ring += ' ' + inkPath([[sh[0] - h * 0.12, armY + h * 0.22], [sh[0], armY], hand], Object.assign(O(3, w), { smooth: false }));
      ring += ' ' + inkPath([[hand[0], hand[1] - h * 0.04], [hand[0] + h * 0.03, g]], O(4, w * 0.9));          // cane
      ring += ' ' + inkPath([[hand[0] - h * 0.05, hand[1] - h * 0.02], [hand[0], hand[1] - h * 0.06], [hand[0] + h * 0.02, hand[1]]], O(5, w * 0.8));
    } else {
      const sp = child ? 0.16 : 0.2;
      ring += ' ' + inkPath([[sh[0] - h * sp, armY + h * 0.24], [sh[0], armY], [sh[0] + h * sp, armY + h * 0.24]], Object.assign(O(3, w), { smooth: false }));
    }
    const dot = inkDot(head[0], head[1], hr, hr, seed + 7, t);
    return { ring, dot, dress };
  }

  // ================================================================ tr_b_people
  SH.tr_b_people = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 77, mode = P.mode || 'share';
      const root = el(svg, 'g'), world = el(root, 'g');
      const groundR = mk(world, INK.inkSoft);
      const lineR = mk(world, INK.red), bracketR = mk(world, INK.blue);
      const L = {};                                    // colour layers: {ring, dot, dress}
      const layer = c => L[c] || (L[c] = { dress: mk(world, colOf(c), { 'fill-opacity': 0.35 }), ring: mk(world, colOf(c)), dot: mk(world, colOf(c)) });
      ['soft', 'ink', 'red', 'blue'].forEach(layer);
      const faintG = mk(world, INK.inkSoft, { 'fill-opacity': 0.3 }), clipId = `trbclip${seed}`;
      const defs = el(svg, 'defs'), clip = el(defs, 'clipPath', { id: clipId }), clipRect = el(clip, 'rect', { x: 0, y: 0, width: 0, height: H });
      const halfL = { ring: mk(world, INK.ink, { 'clip-path': `url(#${clipId})` }), dot: mk(world, INK.ink, { 'clip-path': `url(#${clipId})` }) };
      const uiG = el(world, 'g'), castG = el(root, 'g');
      const BIG = P.big ? Object.assign({ color: 'red', size: 210 }, P.big) : null;
      const big = BIG ? txt(uiG, BIG.text, BIG.size, FR, colOf(BIG.color), 'middle', 900) : null;
      const note = P.note ? txt(uiG, P.note.text, P.note.size || 62, INK_FONT, colOf(P.note.color || 'ink')) : null;
      const noteU = mk(uiG, P.note ? colOf(P.note.color || 'ink') : INK.ink);
      const lab = P.label ? txt(uiG, P.label, 72, INK_FONT, INK.red) : null;
      const brT = P.bracket ? txt(uiG, P.bracket.text, 68, INK_FONT, INK.blue) : null;
      const kas = kasifOf(P.kasif, castG, seed, W, H);
      // figures for the mode: {kind, x, g, h, color, at, to: {kind, color, at}, faint}
      const figs = [];
      let G = 0.8 * H;
      if (mode === 'family') {
        G = (P.ground ?? 0.78) * H;
        figs.push({ kind: 'woman', x: 0.44 * W, g: G, h: 400, color: 'ink', at: 0.2 });
        figs.push({ kind: 'child', x: 0.56 * W, g: G, h: 230, color: 'ink', at: P.child_at || 0.6 });
        figs.push({ kind: 'child', x: 0.66 * W, g: G, h: 230, color: 'ink', at: P.half_at || 1.4, half: true });
      } else if (mode === 'share') {
        const rows = P.rows || 5, cols = P.cols || 20, x0 = (P.x0 ?? 0.08) * W, x1 = (P.x1 ?? 0.72) * W, ytop = (P.ytop ?? 0.36) * H, rowH = P.row_h || 98;
        G = ytop + rows * rowH;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const i = r * cols + c, kid = i < (P.kids ?? 24);
          figs.push({ kind: kid ? 'child' : 'adult', x: lerp(x0, x1, c / (cols - 1)), g: ytop + (r + 1) * rowH - 8, h: kid ? 62 : 84, color: 'soft', at: 0.1 + r * 0.12 + c * 0.012,
            to: kid ? { color: 'red', at: P.kids_at || 1.2, delay: i * 0.03 } : null });
        }
      } else if (mode === 'median') {
        const n = P.n || 11, x0 = (P.x0 ?? 0.09) * W, x1 = (P.x1 ?? 0.73) * W; G = (P.ground ?? 0.78) * H;
        for (let i = 0; i < n; i++) {
          const kind = i < 3 ? 'child' : i >= n - 3 ? 'old' : (i % 2 ? 'woman' : 'adult');
          const h = kind === 'child' ? 150 + i * 20 : kind === 'old' ? 250 : 270;
          figs.push({ kind, x: lerp(x0, x1, i / (n - 1)), g: G, h, color: i < n / 2 - 0.5 ? 'ink' : 'soft', at: 0.15 + i * 0.1,
            to: i < n / 2 - 0.5 && P.bracket ? { color: 'blue', at: P.bracket.at, delay: i * 0.05 } : null });
        }
      } else if (mode === 'quarter') {
        const n = P.n || 4, x0 = (P.x0 ?? 0.14) * W, x1 = (P.x1 ?? 0.66) * W; G = (P.ground ?? 0.8) * H;
        for (let i = 0; i < n; i++) {
          const isOld = i >= n - (P.old ?? 1);
          figs.push({ kind: 'adult', x: lerp(x0, x1, i / (n - 1)), g: G, h: 330, color: 'ink', at: 0.15 + i * 0.18,
            to: isOld ? { kind: 'old', color: 'red', at: P.old_at || 1.6 } : null });
        }
      }
      const midX = figs.length ? (figs[0].x + figs[figs.length - 1].x) / 2 : W / 2;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          world.setAttribute('transform', `translate(${f1(Math.sin(t * 0.33) * 6)} ${f1(Math.cos(t * 0.27) * 5)})`);
          const acc = {}; ['soft', 'ink', 'red', 'blue'].forEach(c => { acc[c] = { ring: '', dot: '', dress: '' }; });
          let faint = '', hr = '', hd = '';
          figs.forEach((f, i) => {
            const at = atOr(cues, f.at, 0.2), s = lt >= at ? spring(lt, at, 0.5) : 0;
            if (s <= 0.02) return;
            let kind = f.kind, color = f.color, pk = 0;
            if (f.to) {
              const ta = atOr(cues, f.to.at, dur * 0.5) + (f.to.delay || 0);
              if (lt >= ta) { kind = f.to.kind || kind; color = f.to.color || color; pk = punch(lt, ta, 0.5); }
            }
            const sway = Math.sin(t * 1.8 + i * 0.9) * f.h * 0.012;
            const bob = Math.abs(Math.sin(t * 2.2 + i * 1.3)) * f.h * 0.012;
            const h = f.h * clamp01(s) * (1 + 0.14 * pk);
            const p = person(kind, f.x, f.g - bob, h, sd + i * 23, t, sway);
            if (f.half) {
              // the "half" child: a faint whole outline, and the left half drawn solid
              const hp = sm(prog(lt, at, 0.9));
              faint += p.ring + ' ' + p.dot + ' ';
              hr += p.ring + ' '; hd += p.dot + ' ';
              clipRect.setAttribute('x', f1(f.x - f.h * 0.4)); clipRect.setAttribute('width', f1(f.h * 0.4 * hp + 2));
              return;
            }
            const a = acc[color] || acc.ink;
            a.ring += p.ring + ' '; a.dot += p.dot + ' '; a.dress += p.dress + ' ';
          });
          Object.keys(acc).forEach(c => { const l = layer(c); l.ring.setAttribute('d', acc[c].ring); l.dot.setAttribute('d', acc[c].dot); l.dress.setAttribute('d', acc[c].dress); });
          faintG.setAttribute('d', faint); halfL.ring.setAttribute('d', hr); halfL.dot.setAttribute('d', hd);
          // ground line under the people (not for the grid)
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          groundR.setAttribute('d', mode !== 'share' && figs.length ? inkPath([[figs[0].x - 160, G + 4], [figs[figs.length - 1].x + 160, G - 2]], O(500, { w: 5 })) : '');
          // median: red dashed line in the middle + label; bracket under the younger half
          if (mode === 'median') {
            const la = atOr(cues, P.line_at, dur * 0.35), lp = sm(prog(lt, la, 0.7)), top = G - 420;
            lineR.setAttribute('d', lp > 0.01 ? dashes([[midX, top], [midX, lerp(top, G + 30, lp)]], 26, 14).map((q, k) => inkPath(q, O(510 + k, { w: 8, amp: 0.8, smooth: false }))).join(' ') : '');
            if (lab) { const s = lt >= la ? spring(lt, la + 0.2, 0.6) : 0; lab.setAttribute('opacity', clamp01(s * 2)); lab.setAttribute('transform', `translate(${f1(midX)} ${f1(top - 30)}) rotate(-3) scale(${lerp(0.5, 1, clamp01(s)).toFixed(3)})`); }
            if (P.bracket) {
              const ba = atOr(cues, P.bracket.at, dur * 0.6), bp = sm(prog(lt, ba, 0.6)), xa = figs[0].x - 60, xb = lerp(xa, midX - 30, bp), yb = G + 40;
              bracketR.setAttribute('d', bp > 0.01 ? inkPath([[xa, yb - 18], [xa, yb], [xb, yb], [xb, yb - 18]], O(530, { w: 6, smooth: false })) : '');
              const s = lt >= ba ? spring(lt, ba + 0.3, 0.6) : 0; brT.setAttribute('opacity', clamp01(s * 2));
              brT.setAttribute('transform', `translate(${f1((xa + midX) / 2)} ${f1(yb + 62)}) rotate(-2) scale(${lerp(0.5, 1, clamp01(s)).toFixed(3)})`);
            }
          }
          // big number (optionally counting from `from`)
          if (big) {
            const ba = atOr(cues, BIG.at, 0.3), s = lt >= ba ? spring(lt, ba, 0.6) : 0, b = boil(sd + 600, t, 1.4);
            if (BIG.from != null) {
              const to = parseFloat(String(BIG.text).replace(',', '.')), dec = (String(BIG.text).split(',')[1] || '').length;
              const v = lerp(BIG.from, to, sm(prog(lt, ba, BIG.dur ?? 1.6)));
              big.textContent = (BIG.prefix || '') + v.toFixed(dec).replace('.', ',') + (BIG.suffix || '');
            }
            const pk = punch(lt, atOr(cues, BIG.hit, -9), 0.5);
            big.setAttribute('opacity', clamp01(s * 2));
            big.setAttribute('transform', `translate(${f1((BIG.x ?? 0.2) * W + b[0])} ${f1((BIG.y ?? 0.42) * H + b[1])}) rotate(${BIG.rot ?? -3}) scale(${(lerp(0.4, 1, clamp01(s)) * (1 + 0.1 * pk)).toFixed(3)})`);
          }
          if (note) {
            const na = atOr(cues, P.note.at, dur * 0.5), s = lt >= na ? spring(lt, na, 0.6) : 0, nx = (P.note.x ?? 0.2) * W, ny = (P.note.y ?? 0.55) * H, b = boil(sd + 610, t, 1.2);
            note.setAttribute('opacity', clamp01(s * 2));
            note.setAttribute('transform', `translate(${f1(nx + b[0])} ${f1(ny + b[1])}) rotate(-3) scale(${lerp(0.5, 1, clamp01(s)).toFixed(3)})`);
            const tw = note.getComputedTextLength ? note.getComputedTextLength() : 300, pu = lt >= na ? prog(lt, na + 0.4, 0.4) : 0;
            noteU.setAttribute('d', pu > 0.01 ? inkPath([[nx - tw / 2, ny + 22], [nx - tw / 2 + tw * pu, ny + 15]], O(620, { w: 6 })) : '');
          }
          if (kas) kas.update(lt, t, dur, cues, words(ctx, env));
        },
      };
    },
  };
})();
