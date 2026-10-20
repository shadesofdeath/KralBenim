// uyku_b_brain: "beynin gece temizliği" in the parchment ink style (brand/kit/BRAND.md §3, §5; every line boils at
// 8 Hz via _ink.js). Two 2D shots (written for 04-uykusuz-kalsak, chapter 3-4):
//
// SHOTS.uyku_b_brain — hand-drawn brain.
//   mode "side":  a brain in profile (gyri squiggles); its regions glow gold (awake) and, one patch at a time, go dark
//                 with a little "z" (local sleep: the brain naps piece by piece). After the `hit` cue more patches nap.
//   mode "day":   a magnifier over brain tissue: packed ink cells with narrow gaps; sepia waste blots appear in the gaps
//                 one by one (gün boyu atık birikir).
//   mode "sleep": the same tissue; on `open` the cells shrink, the gaps widen and blue ink fluid seeps into them.
//   mode "wash":  gaps open, a strong blue current streams through them and carries the waste blots out of the lens
//                 (from `hit` on); the lens ends nearly clean.
//   P: {mode, lens: {x: 0.38, y: 0.45, r: 0.41} (x, y of W/H, r of H), cells: 0.92 (day radius vs spacing),
//       open: 0.72 (shrunk radius factor), waste: 16 (blots), note: {text: "+%60", x, y, at, color, size},
//       label: {text, x, y, at, color, size, arrow: [x, y] (0..1 of W/H)},
//       cast: [{who: "kasif"|name, accessory, coat: true, tag, x, y, scale, pose, at, then, to, face, dir, emotion}]}
//   cues: open, hit, note/label/cast "at" names
//
// SHOTS.uyku_b_lab — a 2013 sleep lab: back wall with a big "2013" calendar page, a table with a wire cage of mice
//   (one awake and sniffing, one curled up asleep with rising z's), a researcher in a lab coat (cast[].coat) and Kaşif.
//   P: {year: "2013", cage_x: 0.56, cast: [...], label: {...}, cam: {zoom: 1.05, focus: [0.5, 0.55]}}   cues: year, hit
// Everything is a pure function of (seed, lt): no Math.random, scrubbing back gives the same frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft };
  const WASTE = mix(INK.stain, INK.ink, 0.25), FLUID = mix(INK.blue, INK.paperLight, 0.25);

  // ---------------------------------------------------------------- cast (Kaşif + period figures, optional lab coat)
  function makeCast(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = m.scale ?? defScale;
      const g = el(parent, 'g');
      const coatG = el(g, 'g');
      const coat = m.coat ? { f: mk(coatG, INK.paperLight), r: mk(coatG), b: mk(coatG, INK.inkSoft) } : null;
      const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), seed: seed + 7 + i * 13 });
      const over = el(g, 'g');
      let tag = null, tagU = null;
      if (m.tag) {
        tag = el(over, 'text', { 'font-family': INK_FONT, 'font-size': m.tag_size || 56, 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
        tag.textContent = m.tag; tagU = mk(over, INK.red);
      }
      return { m, isK, sc, rig, coat, tag, tagU };
    });
  }
  function updateCast(cast, lt, t, dur, cues, W, H, G, sd) {
    cast.forEach((c, ci) => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      let x = (m.x ?? 0.8) * W;
      if (moving && !after) x = lerp(x, m.to * W, sm(clamp01(lt / Math.max(0.3, at ?? dur)) * 1.08));
      else if (m.to != null) x = m.to * W;
      const y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : 1;
      const o = { x, y, face, since, dir, text: m.text, item: m.item,
        emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
      const r = c.rig.update(t, pose, o) || {};
      const s = c.sc, Wp = q => [x + face * s * q[0], y + s * q[1]];
      const hc = r.head || [0, -440], hip = r.hip || [0, -190];
      const O = (k, xx) => Object.assign({ seed: sd + ci * 300 + k, t, amp: 1.2 }, xx);
      if (c.coat) {      // lab coat: a long open coat from the neck to below the knees, collar flaps
        const nk = [hc[0], hc[1] + 78], hp = hip;
        const pts = [[nk[0] - 30, nk[1]], [nk[0] + 30, nk[1]], [hp[0] + 58, hp[1] + 30], [hp[0] + 66, hp[1] + 120], [hp[0] - 60, hp[1] + 122], [hp[0] - 54, hp[1] + 30]].map(Wp);
        c.coat.f.setAttribute('d', inkLoop(pts, O(1, { smooth: false })));
        c.coat.r.setAttribute('d', inkPath(pts, O(1, { w: 5, closed: true, smooth: false })) + ' ' +
          inkPath([[nk[0] - 28, nk[1]], [nk[0] - 6, nk[1] + 60], [nk[0] + 2, nk[1] + 4]].map(Wp), O(2, { w: 4, smooth: false })) + ' ' +
          inkPath([[nk[0] + 28, nk[1]], [nk[0] + 10, nk[1] + 60], [nk[0] + 2, nk[1] + 4]].map(Wp), O(3, { w: 4, smooth: false })));
        c.coat.b.setAttribute('d', inkDot(...Wp([hp[0] + 34, hp[1] - 10]), 6 * s / 0.6, 6 * s / 0.6, sd + ci * 300 + 4, t) + ' ' +
          inkDot(...Wp([hp[0] + 34, hp[1] + 40]), 6 * s / 0.6, 6 * s / 0.6, sd + ci * 300 + 5, t) + ' ' +
          inkPath([[hp[0] + 20, hp[1] - 60], [hp[0] + 52, hp[1] - 62]].map(Wp), O(6, { w: 4 })));
      }
      if (c.tag) {
        const ta = atOr(cues, m.tag_at, 0.15), sp = spring(lt, ta, 0.6), b = boil(sd + ci * 300 + 20, t, 1);
        const hw = Wp(hc), hx = hw[0], hy = hw[1] - 150 * s;
        c.tag.setAttribute('opacity', clamp01(sp * 2));
        c.tag.setAttribute('transform', `translate(${f1(hx + b[0])} ${f1(hy + b[1])}) rotate(-3) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
        const tw = c.tag.getComputedTextLength ? c.tag.getComputedTextLength() : 200, pu = prog(lt, ta + 0.2, 0.4);
        c.tagU.setAttribute('d', pu > 0.01 ? inkPath([[hx - tw / 2, hy + 18], [hx - tw / 2 + tw * pu, hy + 13]], O(21, { w: 5 })) : '');
      }
    });
  }
  // handwritten note / label with an underline and an optional arrow (positions 0..1 of W/H)
  function makeNote(N, parent, defSize, fraunces) {
    if (!N || !N.text) return null;
    const t = el(parent, 'text', { 'font-family': fraunces ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-weight': fraunces ? 900 : 400,
      'font-size': N.size || defSize, 'text-anchor': 'middle', fill: COL[N.color] || INK.ink,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = N.text;
    return { N, t, u: mk(parent, COL[N.color] || INK.ink), ar: mk(parent, COL[N.color] || INK.ink) };
  }
  function updateNote(n, lt, t, cues, W, H, sd, fb) {
    if (!n) return;
    const N = n.N, at = atOr(cues, N.at, fb), sp = lt >= at ? spring(lt, at, 0.6) : 0, x = (N.x ?? 0.5) * W, y = (N.y ?? 0.15) * H, b = boil(sd, t, 1.2);
    n.t.setAttribute('opacity', clamp01(sp * 2));
    n.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${N.rot ?? -3}) scale(${lerp(0.5, 1, sp).toFixed(3)})`);
    const tw = Math.min(W * 0.6, n.t.getComputedTextLength ? n.t.getComputedTextLength() : 300), pu = lt >= at ? prog(lt, at + 0.25, 0.45) : 0;
    const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
    n.u.setAttribute('d', pu > 0.01 && N.underline !== false ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 15]], O(1, { w: 6 })) : '');
    if (N.arrow && lt >= at) {
      const pa = prog(lt, at + 0.35, 0.5);
      const sx = x + (N.arrow[0] * W > x ? tw * 0.35 : -tw * 0.35), sy = y + 36, ex = N.arrow[0] * W, ey = N.arrow[1] * H;
      const mx = (sx + ex) / 2 + (ex > sx ? 60 : -60), my = (sy + ey) / 2 - 40, pts = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
      let d = pa > 0.01 ? inkPath(pts, O(2, { w: 6 })) : '';
      if (pa > 0.95) {
        const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]);
        d += ' ' + inkPath([[ex - 34 * Math.cos(a - 0.5), ey - 34 * Math.sin(a - 0.5)], [ex, ey], [ex - 34 * Math.cos(a + 0.5), ey - 34 * Math.sin(a + 0.5)]], O(3, { w: 6, smooth: false }));
      }
      n.ar.setAttribute('d', d);
    } else n.ar.setAttribute('d', '');
  }
  // floating "z" letters (handwritten)
  function makeZs(parent, n, size) {
    return Array.from({ length: n }, () => { const z = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: INK.blue, opacity: 0 }); z.textContent = 'z'; return z; });
  }

  // ================================================================ uyku_b_brain
  SH.uyku_b_brain = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'day', sd = seed * 1000 + 61;
      const root = el(svg, 'g'), world = el(root, 'g');
      const G = P.ground ?? (H > W ? 1150 : 940);
      const castG = el(root, 'g'), uiG = el(root, 'g');
      const cast = makeCast(P, castG, seed, H > W ? 0.7 : 0.72);
      const note = makeNote(P.note, uiG, 150, true), label = makeNote(P.label, uiG, 66, false);
      const r = rng((P.seed ?? 5) * 7919 + 3);

      if (mode === 'side') {
        // ---------------- brain in profile, regions napping one at a time
        const L = Object.assign({ x: 0.4, y: 0.46, r: 0.34 }, P.lens || {});
        const cx = L.x * W, cy = L.y * H, R = L.r * H;
        const B = (u, v) => [cx + u * R * 1.25, cy + v * R];
        const outline = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.05, -1.0], [0.5, -0.88], [0.85, -0.6], [1.0, -0.2],
          [0.98, 0.18], [0.84, 0.42], [0.62, 0.5], [0.42, 0.52], [0.22, 0.62], [-0.05, 0.7], [-0.32, 0.66], [-0.55, 0.52], [-0.78, 0.38]].map(q => B(q[0], q[1]));
        const cereb = [[0.42, 0.52], [0.66, 0.5], [0.86, 0.48], [0.9, 0.64], [0.72, 0.8], [0.48, 0.78], [0.34, 0.66]].map(q => B(q[0], q[1]));
        const stem = [[0.2, 0.62], [0.3, 0.95], [0.18, 1.08], [0.06, 0.98], [0.04, 0.7]].map(q => B(q[0], q[1]));
        const fillF = mk(world, INK.paperLight), stemF = mk(world, INK.paperDark), cerF = mk(world, INK.paperDark);
        const patches = [[-0.6, -0.35], [-0.2, -0.6], [0.3, -0.6], [0.65, -0.2], [-0.55, 0.15], [-0.1, -0.1], [0.35, 0.15], [0.05, 0.4]]
          .map((q, i) => ({ q, rr: 0.26 + (i % 3) * 0.03, f: mk(world, INK.gold, { 'fill-opacity': 0.45 }), ph: r() * 5, per: 3.4 + r() * 2.2 }));
        const gyri = Array.from({ length: 14 }, (_, i) => {
          const a = r() * Math.PI * 2, d = r() * 0.62, u0 = Math.cos(a) * d * 0.9 - 0.05, v0 = Math.sin(a) * d * 0.75 - 0.2, pts = [];
          let ang = r() * Math.PI * 2;
          for (let k = 0; k < 5; k++) { pts.push(B(u0 + k * 0.07 * Math.cos(ang), v0 + k * 0.07 * Math.sin(ang) + (k % 2 ? 0.05 : -0.05))); ang += (r() - 0.5) * 1.4; }
          return pts;
        });
        const lineR = mk(world), gyrR = mk(world, INK.inkSoft);
        const zs = makeZs(world, patches.length, 64);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
            const hitAt = atOr(cues, 'hit', dur * 0.5), pk = punch(lt, hitAt, 0.6);
            const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * pk);
            world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.4) * 8)} ${f1(Math.cos(lt * 0.3) * 5)}) translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
            fillF.setAttribute('d', inkLoop(outline, O(1)));
            stemF.setAttribute('d', inkLoop(stem, O(2))); cerF.setAttribute('d', inkLoop(cereb, O(3)));
            const intro = prog(lt, 0.1, 0.8);
            patches.forEach((p, i) => {
              // nap windows: a patch dozes for ~1.3 s every `per` seconds; after the hit nearly every other patch dozes
              const ph = (lt + p.ph) % p.per, base = ph < 1.3 ? sm(Math.min(ph, 1.3 - ph) / 0.3) : 0;
              const more = lt >= hitAt && i % 2 === 0 ? sm((lt - hitAt - i * 0.12) / 0.4) : 0;
              const nap = Math.max(base, more);
              const c = B(p.q[0], p.q[1]);
              p.f.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], p.rr * R * 1.1, p.rr * R * 0.8, sd + 20 + i, 12, i, 0.12), O(20 + i, { amp: 1.2 })));
              p.f.setAttribute('fill', nap > 0.5 ? INK.blue : INK.gold);
              p.f.setAttribute('fill-opacity', f1((nap > 0.5 ? 0.18 + 0.25 * nap : 0.45 * (1 - nap) + 0.1) * intro * 10) / 10);
              const zz = zs[i], zp = nap > 0.3 ? ((lt * 0.8 + i * 0.3) % 1) : 0;
              zz.setAttribute('opacity', f1(nap * (1 - zp) * 10) / 10);
              zz.setAttribute('transform', `translate(${f1(c[0] + zp * 40)} ${f1(c[1] - 10 - zp * 80)}) rotate(-12) scale(${(0.7 + zp * 0.5).toFixed(2)})`);
            });
            lineR.setAttribute('d', inkPath(outline, O(1, { w: 7, closed: true })) + ' ' + inkPath(cereb, O(3, { w: 5, closed: true })) + ' ' + inkPath(stem, O(2, { w: 5, closed: true })) +
              ' ' + inkPath([B(-0.1, -0.98), B(0.0, -0.5), B(0.1, -0.2), B(0.3, 0.1)], O(4, { w: 5 })) + ' ' + inkPath([B(-0.75, 0.1), B(-0.35, 0.02), B(0.1, 0.2), B(0.4, 0.42)], O(5, { w: 5 })));
            gyrR.setAttribute('d', gyri.map((g, i) => inkPath(g, O(40 + i, { w: 3.5, amp: 1.2 }))).join(' '));
            updateCast(cast, lt, t, dur, cues, W, H, G, sd + 9000);
            updateNote(note, lt, t, cues, W, H, sd + 7000, 0.4);
            updateNote(label, lt, t, cues, W, H, sd + 7100, 0.6);
          },
        };
      }

      // ---------------- tissue under a magnifier (day / sleep / wash)
      const L = Object.assign({ x: 0.4, y: 0.48, r: 0.38 }, P.lens || {});
      const cx = L.x * W, cy = L.y * H, R = L.r * H;
      const S = R * 0.33, hh = S * 0.866, rad0 = S * 0.5 * (P.cells ?? 0.92), openK = P.open_k ?? 0.72;
      const cid = 'uybLens' + seed;
      const defs = el(svg, 'defs'), clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'circle', { cx: f1(cx), cy: f1(cy), r: f1(R * 0.97) });
      const lensBg = mk(world, mix(INK.paperDark, INK.paper, 0.4));
      const inside = el(world, 'g', { 'clip-path': `url(#${cid})` });
      const fluidF = el(inside, 'rect', { x: f1(cx - R), y: f1(cy - R), width: f1(2 * R), height: f1(2 * R), fill: FLUID, 'fill-opacity': 0 });
      const streakR = mk(inside, INK.blue), wasteF = mk(inside, WASTE), wasteR = mk(inside, INK.ink, { 'fill-opacity': 0.55 });
      const cellF = mk(inside, INK.paperLight), cellR = mk(inside), nucF = mk(inside, INK.inkSoft), dendR = mk(inside, INK.inkSoft);
      const rimF = mk(world, INK.inkSoft), rimR = mk(world), glint = mk(world, '#ffffff', { 'fill-opacity': 0.6 });
      const cells = [];
      for (let k = -5; k <= 5; k++) for (let i = -6; i <= 6; i++) {
        const x = cx + i * S + (k & 1 ? S / 2 : 0), y = cy + k * hh;
        if (Math.hypot(x - cx, y - cy) > R + S) continue;
        cells.push({ x, y, k: cells.length, rot: r() * 6, wob: 0.85 + r() * 0.22, ph: r() * 6, d: r() < 0.55 ? r() * 6 : null });
      }
      // gap points: centroids of neighbouring cell triangles
      const gaps = [];
      for (let k = -5; k <= 4; k++) for (let i = -6; i <= 5; i++) {
        const x = cx + i * S + (k & 1 ? S / 2 : 0) + S / 2, y = cy + k * hh + hh * (2 / 3);
        if (Math.hypot(x - cx, y - cy) < R * 0.8) gaps.push([x, y]);
      }
      const NW = Math.min(gaps.length, P.waste ?? 16), wastes = [];
      const pool = gaps.slice();
      for (let n = 0; n < NW; n++) { const j = Math.floor(r() * pool.length); const g = pool.splice(j, 1)[0]; wastes.push({ x: g[0], y: g[1], s: 0.8 + r() * 0.5, ph: r() * 6, k: n, ord: r() }); }
      const streaks = Array.from({ length: 34 }, (_, i) => ({ lane: Math.floor(r() * 11) - 5, x: r(), sp: 0.7 + r() * 0.6, len: 0.5 + r() * 0.6, k: i }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * pk);
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.4) * 7)} ${f1(Math.cos(lt * 0.3) * 5)}) translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          // how open the gaps are, how much fluid flows
          const openAt = atOr(cues, 'open', mode === 'sleep' ? dur * 0.25 : 0);
          const open = mode === 'day' ? 0 : mode === 'wash' ? 1 : (lt >= openAt ? sm((lt - openAt) / 1.6) : 0);
          const fluid = mode === 'day' ? 0 : mode === 'wash' ? 1 : open;
          const flow = mode === 'wash' ? 1 : 0.35 * open;
          lensBg.setAttribute('d', inkCircle(cx, cy, R, sd + 1, t, { fill: true, n: 36 }));
          fluidF.setAttribute('fill-opacity', f1(fluid * 0.55 * 100) / 100);
          // blue current: short wavy strokes moving to the right along the lanes between rows
          let st = '';
          if (fluid > 0.02) streaks.forEach(s => {
            const y0 = cy + s.lane * hh + hh * (s.lane & 1 ? 0.33 : 0.66);
            const xx = cx - R + ((s.x * 2 * R + lt * s.sp * (60 + 220 * flow)) % (2 * R + 200)) - 100, ln = S * s.len * (0.6 + flow * 0.8);
            const pts = [0, 0.33, 0.66, 1].map(u => [xx + u * ln, y0 + Math.sin((xx + u * ln) * 0.03 + t * 2) * 6]);
            st += inkPath(pts, O(300 + s.k, { w: 4 + 3 * flow, amp: 1, taper: 0.8 })) + ' ';
          });
          streakR.setAttribute('d', st);
          streakR.setAttribute('fill-opacity', f1(Math.min(1, fluid * 1.2) * 0.8 * 10) / 10);
          // waste blots: appear one by one (day), sit (sleep), are carried out by the current (wash, from `hit`)
          let wf = '', wr = '';
          const washAt = hitAt ?? dur * 0.35;
          wastes.forEach(w => {
            let a = 1, x = w.x, y = w.y, sc = w.s;
            if (mode === 'day') { const ap = 0.4 + w.ord * Math.max(1, dur * 0.7); a = lt >= ap ? spring(lt, ap, 0.5) : 0; sc *= a; }
            if (mode === 'wash') {
              const go = Math.max(0, lt - washAt - w.ord * 1.2);
              x += go * go * 90 + go * 120; y += Math.sin(go * 3 + w.ph) * 14;
              const out = Math.hypot(x - cx, y - cy) / R;
              a = 1 - sm((out - 0.8) / 0.25); sc *= lerp(1, 0.6, clamp01(go / 2.5));
            }
            if (mode === 'sleep') x += open * Math.sin(t * 1.2 + w.ph) * 6;
            if (a < 0.02) return;
            const rr = rad0 * 0.42 * sc;
            const pts = inkEllipsePts(x, y, rr * 1.15, rr * 0.9, sd + 500 + w.k, 9, w.ph, 0.18);
            wf += inkLoop(pts, O(500 + w.k, { amp: 1 })) + ' ';
            wr += inkDot(x + rr * 0.9, y - rr * 0.7, rr * 0.28, rr * 0.25, sd + 600 + w.k, t, 0.6) + ' ' + inkDot(x - rr * 1.1, y + rr * 0.5, rr * 0.22, rr * 0.2, sd + 650 + w.k, t, 0.6) + ' ';
          });
          wasteF.setAttribute('d', wf); wasteR.setAttribute('d', wr);
          // cells: shrink as the gaps open, pulse gently (alive)
          const rk = lerp(1, openK, open);
          let cf = '', cr = '', nf = '', dr = '';
          cells.forEach(c => {
            const k = rk * (1 + 0.03 * Math.sin(t * 1.4 + c.ph)), rr = rad0 * k * c.wob;
            const pts = inkEllipsePts(c.x, c.y, rr, rr * 0.92, sd + 100 + c.k, 12, c.rot, 0.07);
            cf += inkLoop(pts, O(100 + c.k, { amp: 1 })) + ' ';
            cr += inkPath(pts, O(100 + c.k, { w: 4.5, closed: true, amp: 1 })) + ' ';
            nf += inkDot(c.x + rr * 0.12, c.y - rr * 0.08, rr * 0.24, rr * 0.2, sd + 200 + c.k, t, 0.5) + ' ';
            if (c.d != null) { const a = c.d; dr += inkPath([[c.x + Math.cos(a) * rr * 0.55, c.y + Math.sin(a) * rr * 0.55], [c.x + Math.cos(a + 0.3) * rr * 0.85, c.y + Math.sin(a + 0.3) * rr * 0.85]], O(250 + c.k, { w: 3, amp: 0.8 })) + ' '; }
          });
          cellF.setAttribute('d', cf); cellR.setAttribute('d', cr); nucF.setAttribute('d', nf); dendR.setAttribute('d', dr);
          // magnifier: thick rim + handle, a soft glint
          const ha = Math.PI * 0.78, h0 = [cx + Math.cos(ha) * R * 1.02, cy + Math.sin(ha) * R * 1.02], h1 = [cx + Math.cos(ha) * R * 1.42, cy + Math.sin(ha) * R * 1.42];
          rimF.setAttribute('d', inkPath([h0, h1], O(10, { w: 34, amp: 1, taper: 0.1 })));
          rimR.setAttribute('d', inkPath(inkEllipsePts(cx, cy, R, R, sd + 1, 36, 0, 0.004), O(1, { w: 12, closed: true, amp: 1 })) + ' ' +
            inkPath(inkEllipsePts(cx, cy, R * 1.04, R * 1.04, sd + 2, 36, 0, 0.004), O(2, { w: 4, closed: true, amp: 1 })));
          const ga = -2.3 + Math.sin(lt * 0.5) * 0.25, arc = [];
          for (let i = 0; i <= 8; i++) { const a = ga + i / 8 * 0.6; arc.push([cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9]); }
          glint.setAttribute('d', inkPath(arc, O(20, { w: 12, amp: 0.8, taper: 0.9 })));
          updateCast(cast, lt, t, dur, cues, W, H, G, sd + 9000);
          updateNote(note, lt, t, cues, W, H, sd + 7000, mode === 'sleep' ? (hitAt ?? openAt + 1) : 0.5);
          updateNote(label, lt, t, cues, W, H, sd + 7100, 0.5);
        },
      };
    },
  };

  // ================================================================ uyku_b_lab: 2013, mice in a cage
  SH.uyku_b_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 83, G = H > W ? 1140 : 930;
      const TY = G - 250, CX = (P.cage_x ?? 0.56) * W, CW = 420, CH = 230;
      const root = el(svg, 'g'), world = el(root, 'g');
      const wallR = mk(world, INK.inkSoft);
      const calF = mk(world, INK.paperLight), calR = mk(world), calH = mk(world, INK.red);
      const year = el(world, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle', fill: INK.ink });
      year.textContent = P.year || '2013';
      const tableF = mk(world, INK.paperDark), tableR = mk(world);
      const cageF = mk(world, INK.paperLight, { 'fill-opacity': 0.55 }), beddingF = mk(world, INK.gold, { 'fill-opacity': 0.45 });
      const miceF = mk(world, mix(INK.paperLight, INK.paperDark, 0.4)), miceR = mk(world), miceP = mk(world, INK.red, { 'fill-opacity': 0.7 });
      const barsR = mk(world);
      const zs = makeZs(world, 3, 60);
      const floorR = mk(world, INK.inkSoft);
      const castG = el(world, 'g'), uiG = el(root, 'g');
      const cast = makeCast(P, castG, seed, H > W ? 0.78 : 0.74);
      const label = makeNote(P.label, uiG, 66, false);
      const mouse = (x, y, s, face, curl, t, k, O) => {      // simple side-view mouse; curl = 1 -> curled up asleep
        const bw = 70 * s * lerp(1, 0.78, curl), bh = 36 * s * lerp(1, 1.15, curl);
        const body = inkEllipsePts(x, y - bh, bw, bh, sd + 700 + k, 12, 0, 0.05);
        const hx = x + face * bw * lerp(0.95, 0.55, curl), hy = y - bh * lerp(1.1, 0.7, curl);
        const head = [[hx - face * 10 * s, hy - 22 * s], [hx + face * 34 * s, hy + 4 * s], [hx - face * 6 * s, hy + 20 * s], [hx - face * 24 * s, hy]];
        const tail = curl > 0.5 ? [[x - face * bw * 0.9, y - 8], [x - face * bw * 0.2, y + 4], [x + face * bw * 0.5, y - 2]] :
          [[x - face * bw * 0.95, y - bh * 0.6], [x - face * bw * 1.4, y - bh * 0.1 + Math.sin(t * 3 + k) * 8], [x - face * bw * 1.9, y - bh * 0.5]];
        const f = inkLoop(body, O(700 + k)) + ' ' + inkLoop(head, O(710 + k));
        const rr = inkPath(body, O(700 + k, { w: 4, closed: true })) + ' ' + inkPath(head, O(710 + k, { w: 4, closed: true })) + ' ' + inkPath(tail, O(720 + k, { w: 3.5 })) + ' ' +
          inkCircle(hx - face * 8 * s, hy - 24 * s, 11 * s, sd + 730 + k, t, { w: 3.5 }) + ' ' +
          (curl > 0.5 ? inkPath([[hx + face * 4 * s, hy - 2 * s], [hx + face * 14 * s, hy]], O(740 + k, { w: 3 })) : inkDot(hx + face * 8 * s, hy - 4 * s, 4, 4, sd + 740 + k, t));
        return { f, r: rr, p: inkDot(hx + face * 33 * s, hy + 4 * s, 5, 5, sd + 750 + k, t), head: [hx, hy] };
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * pk);
          const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.55) * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // wall rail + tiles
          let wd = inkPath([[-40, TY - 140], [W + 40, TY - 144]], O(1, { w: 4 }));
          for (let x = 40; x < W; x += 140) wd += ' ' + inkPath([[x, TY - 130], [x + 2, TY - 6]], O(2 + x, { w: 2.5, amp: 1 }));
          wallR.setAttribute('d', wd);
          // calendar page with the year (pops on the `year` cue)
          const ya = atOr(cues, 'year', 0.3), yp = lt >= ya ? spring(lt, ya, 0.7) : 0;
          const kx = CX, ky = 250, kw = 330, kh = 250, sw = Math.sin(t * 1.1) * 1.5;
          const page = [[kx - kw / 2, ky - kh / 2], [kx + kw / 2, ky - kh / 2 + 4], [kx + kw / 2 + 4, ky + kh / 2], [kx - kw / 2 + 2, ky + kh / 2 + 3]];
          calF.setAttribute('d', inkLoop(page, O(30, { smooth: false })));
          calH.setAttribute('d', inkLoop([[kx - kw / 2, ky - kh / 2], [kx + kw / 2, ky - kh / 2 + 4], [kx + kw / 2 + 1, ky - kh / 2 + 50], [kx - kw / 2, ky - kh / 2 + 48]], O(31, { smooth: false })));
          calR.setAttribute('d', inkPath(page, O(30, { w: 5, closed: true, smooth: false })) + ' ' + inkDot(kx - 90, ky - kh / 2 + 24, 9, 9, sd + 32, t) + ' ' + inkDot(kx + 90, ky - kh / 2 + 26, 9, 9, sd + 33, t));
          const b = boil(sd + 34, t, 1.2);
          year.setAttribute('opacity', clamp01(yp * 2));
          year.setAttribute('transform', `translate(${f1(kx + b[0])} ${f1(ky + 92 + b[1])}) rotate(${f1(-2 + sw)}) scale(${lerp(0.4, 1, yp).toFixed(3)})`);
          // table
          const top = [[CX - 360, TY], [CX + 360, TY - 3], [CX + 360, TY + 34], [CX - 360, TY + 36]];
          tableF.setAttribute('d', inkLoop(top, O(40, { smooth: false })));
          tableR.setAttribute('d', inkPath(top, O(40, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[CX - 320, TY + 36], [CX - 318, G]], O(41, { w: 9 })) + ' ' + inkPath([[CX + 320, TY + 36], [CX + 322, G]], O(42, { w: 9 })));
          // cage: box, bedding, bars, lid
          const x0 = CX - CW / 2, x1 = CX + CW / 2, y1 = TY - 4, y0 = y1 - CH;
          cageF.setAttribute('d', inkLoop([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], O(50, { smooth: false, amp: 1 })));
          beddingF.setAttribute('d', inkLoop([[x0 + 6, y1 - 4], [x0 + 6, y1 - 34], [CX - 60, y1 - 44], [CX + 80, y1 - 36], [x1 - 6, y1 - 42], [x1 - 6, y1 - 4]], O(51, { amp: 1.4 })));
          const m1 = mouse(CX - 90, y1 - 30, 0.85, 1, 0, t, 1, O), m2 = mouse(CX + 110, y1 - 30, 0.85, -1, 1, t, 2, O);
          // the awake mouse sniffs: tiny nose bob via the boil seed only (deterministic)
          miceF.setAttribute('d', m1.f + ' ' + m2.f); miceR.setAttribute('d', m1.r + ' ' + m2.r); miceP.setAttribute('d', m1.p + ' ' + m2.p);
          let bd = inkPath([[x0, y0], [x1, y0 + 2], [x1 + 2, y1], [x0 - 1, y1 + 1]], O(52, { w: 6, closed: true, smooth: false, amp: 1 }));
          for (let i = 1; i < 12; i++) bd += ' ' + inkPath([[x0 + i * CW / 12, y0 + 2], [x0 + i * CW / 12 + 1, y1 - 2]], O(53 + i, { w: 2.5, amp: 0.8 }));
          bd += ' ' + inkPath([[x0 - 14, y0 - 4], [x1 + 14, y0 - 6]], O(70, { w: 9 })) + ' ' + inkPath([[CX - 40, y0 - 6], [CX - 30, y0 - 40], [CX + 30, y0 - 40], [CX + 40, y0 - 6]], O(71, { w: 5 }));
          barsR.setAttribute('d', bd);
          zs.forEach((zz, i) => {
            const zp = ((lt * 0.55 + i / 3) % 1);
            zz.setAttribute('opacity', f1((1 - zp) * prog(lt, 0.4, 0.6) * 10) / 10);
            zz.setAttribute('transform', `translate(${f1(m2.head[0] + 10 + zp * 50)} ${f1(m2.head[1] - 40 - zp * 120)}) rotate(-12) scale(${(0.6 + zp * 0.6).toFixed(2)})`);
          });
          floorR.setAttribute('d', inkPath([[-40, G + 6], [W + 40, G + 2]], O(80, { w: 5 })));
          updateCast(cast, lt, t, dur, cues, W, H, G, sd + 9000);
          updateNote(label, lt, t, cues, W, H, sd + 7100, 0.5);
        },
      };
    },
  };
})();
