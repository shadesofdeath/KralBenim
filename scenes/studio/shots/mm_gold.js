// mm_gold / mm_atlas / mm_market: Mansa Musa's gold (Mali, 1324 hajj) in the parchment ink style (brand/kit/BRAND.md §5;
// every line boils at 8 Hz via _ink.js). Ink camels with gold sacks, a crowned king throwing coins, a caravan crossing
// scrolling dunes, a Catalan-Atlas-style vellum panel, and a Cairo market whose balance scale tips as gold floods in.
//
// SHOTS.mm_gold P: {
//   mode: "rain"|"caravan"|"camels"|"empty",
//     rain    — the crowned king stands on a gold heap and keeps throwing coins in arcs; they rain down and pile up
//     caravan — a long line of camels and walkers crosses scrolling dunes (left -> right), tiny far caravan on the ridge
//     camels  — close-up of 2 loaded camels walking; on cue "hit" the gold sacks glint and a few coins spill
//     empty   — the king shakes an empty sack upside down; one coin drops (cue "drop"), a moth flutters out (cue "moth")
//   backdrop: "cairo"|"desert" (default: rain/market cairo, others desert),
//   king: {x: 0.34, scale: 0.72, face: "right"},           // rain/empty: the crowned king (no hat: dönem figürü)
//   rate: 14,                                                // rain: coins per second
//   camels: [{x: 0.42, scale: 1, d: 1}],                     // camels/empty: override camel placement (d: 0 far .. 1 near)
//   label: {text, x: 0.5, y: 0.22, at, size},
//   cast: [{who: "kasif"|name, accessory, x, y, scale, pose, at, then, to, face, dir, emotion, text}],
//   cam: {zoom: 1.05, focus: [0.5, 0.55]}
// }
// cues: hit (punch / glint / Kaşif reaction), drop, moth, cast/label "at" names.
//
// SHOTS.mm_atlas P: {label: {text: "Mansa Musa", ...}, caption: "Katalan Atlası · 1375", cast: [...], cam}
//   a vellum card: the crowned king on a throne holding up a gold orb + sceptre, a veiled rider on a camel riding to
//   him (as drawn in the 1375 Catalan Atlas). cues: hit (orb shines), label/cast "at" names.
// SHOTS.mm_market P: {flood: cue name (default "flood"), label: {...}, arrow: {at: "hit", text: "Altının değeri"}, cast}
//   Cairo market stall with a balance scale: gold left pan, silver dirhams right; coins start raining on cue "flood"
//   and pile up; on cue "hit" the gold pan rises (worth less) and a red arrow points down.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };

  function ik(a, b, l1, l2, hint) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    const mx = l1 + l2 - 0.5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    d = Math.max(d, Math.abs(l1 - l2) + 1, 1);
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const j1 = [a[0] + Math.cos(base + al) * l1, a[1] + Math.sin(base + al) * l1];
    const j2 = [a[0] + Math.cos(base - al) * l1, a[1] + Math.sin(base - al) * l1];
    const dd = j => (j[0] - hint[0]) ** 2 + (j[1] - hint[1]) ** 2;
    return dd(j1) <= dd(j2) ? j1 : j2;
  }
  function gaitFoot(p, half, lift, f) {
    p = ((p % 1) + 1) % 1;
    if (p < f) return [half * (1 - 2 * p / f), 0];
    const s = (p - f) / (1 - f);
    return [-half + 2 * half * sm(s), -Math.sin(Math.PI * s) * lift];
  }

  // ---------------------------------------------------------------- coin (gold disc, spinning) -> [fill d, ink d]
  function coinD(x, y, r, spin, seed, t) {
    const k = Math.max(0.18, Math.abs(Math.cos(spin)));
    const pts = inkEllipsePts(x, y, r * k, r, seed, 10);
    return [inkLoop(pts, { seed, t, amp: 0.7 }), inkPath(pts, { seed, t, w: Math.max(2.5, r * 0.16), closed: true, amp: 0.7 })];
  }
  // 4-point sparkle
  function sparkD(x, y, R, seed, t) {
    const p = [];
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? R * 0.22 : R; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return [inkLoop(p, { seed, t, amp: 0.6, smooth: false }), inkPath(p, { seed, t, w: 3, closed: true, amp: 0.6, smooth: false })];
  }

  // ---------------------------------------------------------------- camel (local units, facing +x, ground y = 0)
  // body ~ 300 wide, hump top ≈ -412, head ≈ -430 at x ≈ 280.
  const CAMEL = [[-150, -262], [-152, -300], [-118, -342], [-62, -398], [-14, -412], [34, -392], [78, -346], [118, -318], [146, -296],
    [150, -262], [120, -238], [60, -228], [-20, -226], [-90, -230], [-134, -240]];
  const BLANKET = [[-84, -380], [-40, -404], [-10, -412], [30, -396], [56, -366], [62, -322], [-96, -326]];
  function makeCamel(parent, seed) {
    const g = el(parent, 'g');
    return { g, seed, far: mk(g, INK.inkSoft), neckU: mk(g), fill: mk(g, INK.paperDark), blanket: mk(g, INK.red), sackF: mk(g, INK.gold),
      emptyF: mk(g, INK.paper), ink: mk(g), spark: mk(g, INK.gold), sparkR: mk(g) };
  }
  // st: {t, ph, walk, sacks: "gold"|"empty"|false, glow 0..1, w}
  function drawCamel(E, st) {
    const t = st.t, sd = E.seed * 100, w = st.w || 1;
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
    const ph = st.ph || 0, walk = !!st.walk;
    const bob = walk ? -Math.abs(Math.sin(2 * Math.PI * ph)) * 7 : Math.sin(t * 1.4 + E.seed) * 2;
    const B = q => [q[0], q[1] + bob];
    const legs = [];
    [[-96, -246], [92, -246]].forEach((hp, side) => [0, 1].forEach(j => {
      const hip = B(hp), off = side * 0.25 + j * 0.5;
      const fq = walk ? gaitFoot(ph + off, 44, 34, 0.62) : [j ? -14 : 12, 0];
      const foot = [hip[0] + fq[0], fq[1]];
      const knee = ik(hip, foot, 122, 128, [hip[0] + (side ? 40 : -40), (hip[1] + foot[1]) / 2]);
      legs.push({ hip, knee, foot, near: j === 0 });
    }));
    const legD = (L, k) => inkPath([L.hip, L.knee, L.foot], O(k, { w: 14 * w, taper: 0.1 })) + ' ' +
      inkLoop(inkEllipsePts(L.foot[0] + 6, L.foot[1] - 6, 20, 9, sd + k + 3, 8), O(k + 3, { amp: 0.8 }));
    E.far.setAttribute('d', legs.filter(L => !L.near).map((L, i) => legD(L, 10 + i * 7)).join(' '));
    const hb = walk ? Math.sin(2 * Math.PI * ph * 2) * 8 : Math.sin(t * 1.1 + E.seed) * 5;
    const neck = [B([116, -300]), B([176, -284]), B([222, -320]), [246 + hb * 0.3, -386 + bob + hb], [258 + hb * 0.4, -420 + bob + hb]];
    const hc = [284 + hb * 0.4, -430 + bob + hb];
    const head = inkEllipsePts(0, 0, 46, 22, sd + 40, 10).map(q => { const r = rotP(q, -0.12); return [hc[0] + r[0], hc[1] + r[1]]; });
    E.neckU.setAttribute('d', inkPath(neck, O(20, { w: 40, taper: 0.05, amp: 1.2 })));
    const body = CAMEL.map(B);
    E.fill.setAttribute('d', inkLoop(body, O(30)) + ' ' + inkPath(neck, O(20, { w: 28, taper: 0.05, amp: 1.2 })) + ' ' + inkLoop(head, O(40, { amp: 1 })));
    E.blanket.setAttribute('d', inkLoop(BLANKET.map(B), O(50, { amp: 1.2 })));
    let sk = '', se = '', si = '';
    const sacks = st.sacks ?? 'gold';
    const sackC = [[-74, -292], [34, -292]];
    if (sacks) sackC.forEach((c0, i) => {
      const sw = Math.sin(t * 2.2 + i + E.seed) * 3 + (walk ? Math.sin(2 * Math.PI * ph) * 4 : 0);
      const c = B([c0[0] + sw, c0[1]]);
      if (sacks === 'gold') {
        const pts = inkEllipsePts(c[0], c[1] + 6, 46, 50, sd + 60 + i, 12);
        sk += inkLoop(pts, O(60 + i)) + ' ';
        si += inkPath(pts, O(60 + i, { w: 5.5 * w, closed: true })) + ' ' +
          inkPath([[c[0] - 22, c[1] - 40], [c[0], c[1] - 50], [c[0] + 22, c[1] - 40]], O(64 + i, { w: 5 * w })) + ' ' +
          inkPath([[c[0] - 18, c[1] - 6], [c[0] + 4, c[1] + 18], [c[0] + 20, c[1] - 2]], O(66 + i, { w: 3, amp: 1 }));
      } else {
        const pts = [[c[0] - 30, c[1] - 44], [c[0] + 30, c[1] - 44], [c[0] + 22, c[1] + 6], [c[0] - 4, c[1] + 14], [c[0] - 24, c[1] + 4]];
        se += inkLoop(pts, O(70 + i)) + ' ';
        si += inkPath(pts, O(70 + i, { w: 5 * w, closed: true })) + ' ' + inkPath([[c[0] - 16, c[1] - 30], [c[0] - 6, c[1] - 6]], O(74 + i, { w: 3, amp: 1 }));
      }
    });
    E.sackF.setAttribute('d', sk); E.emptyF.setAttribute('d', se);
    const eye = [hc[0] + 2, hc[1] - 8];
    E.ink.setAttribute('d', inkPath(body, O(30, { w: 6 * w, closed: true })) + ' ' + inkPath(BLANKET.map(B), O(50, { w: 4.5 * w, closed: true, amp: 1.2 })) + ' ' +
      inkPath([B([-80, -360]), B([40, -358])], O(52, { w: 3, amp: 1 })) + ' ' +
      inkPath(head, O(40, { w: 5 * w, closed: true, amp: 1 })) + ' ' + inkDot(eye[0], eye[1], 5, 5, sd + 41, t) + ' ' +
      inkPath([[hc[0] - 22, hc[1] - 18], [hc[0] - 28, hc[1] - 36]], O(42, { w: 5 })) + ' ' +
      inkPath([[hc[0] + 30, hc[1] + 6], [hc[0] + 42, hc[1] + 10]], O(43, { w: 3.5, amp: 0.8 })) + ' ' +
      inkPath([B([-150, -282]), B([-170, -240]), B([-164, -204])], O(44, { w: 5 })) + ' ' +
      inkPath([B([-40, -380]), B([-20, -356])], O(45, { w: 3, amp: 1 })) + ' ' + si + ' ' +
      legs.filter(L => L.near).map((L, i) => legD(L, 80 + i * 7)).join(' '));
    // glint on the gold sacks
    const gl = st.glow || 0;
    if (gl > 0.02 && sacks === 'gold') {
      let a = '', b = '';
      sackC.forEach((c0, i) => {
        const c = B(c0), R = (26 + 18 * Math.sin(t * 9 + i * 2)) * gl;
        const [s1, s2] = sparkD(c[0] + 30 - i * 10, c[1] - 30, R, sd + 90 + i, t);
        a += s1 + ' '; b += s2 + ' ';
      });
      E.spark.setAttribute('d', a); E.sparkR.setAttribute('d', b);
    } else { E.spark.setAttribute('d', ''); E.sparkR.setAttribute('d', ''); }
  }

  // ---------------------------------------------------------------- shared scenery
  function scenery(world, W, H, seed, kind, HY, portrait) {
    const r = rng(seed * 23 + 3), K = portrait ? 1 : 0.8;
    const sunF = mk(world, INK.paperLight), sunR = mk(world, INK.inkSoft);
    const farF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), farR = mk(world, INK.inkSoft);
    const dunes = [0, 1, 2].map(i => ({ f: mk(world, INK.paperDark, { 'fill-opacity': [0.3, 0.42, 0.55][i] }), r: mk(world, INK.inkSoft),
      y: HY + [10, 120, 250][i] * K, A: [40, 60, 70][i] * K, k: [0.006, 0.0045, 0.0035][i], o: r() * 9, v: [0.15, 0.4, 0.75][i] }));
    // cairo: pyramids + domes and minarets on the horizon (built once)
    const sky = [];
    if (kind === 'cairo') {
      let x = -40;
      while (x < W + 40) {
        const q = r();
        if (q < 0.22) { const R = (34 + r() * 20) * K; sky.push({ t: 'dome', x: x + R, R, h: 30 * K }); x += 2 * R + 10; }
        else if (q < 0.42) { const w2 = 22 * K, h2 = (150 + r() * 60) * K; sky.push({ t: 'min', x: x + w2 / 2, w: w2, h: h2 }); x += w2 + 14; }
        else { const w2 = (60 + r() * 50) * K, h2 = (40 + r() * 40) * K; sky.push({ t: 'box', x, w: w2, h: h2 }); x += w2 + 6; }
      }
    }
    return {
      update(t, lt, scroll, O) {
        const sx = W * 0.82, sy = portrait ? 470 : 150, sR = 64 * K;
        sunF.setAttribute('d', inkCircle(sx, sy, sR, seed + 1, t, { fill: true }));
        let sr = inkCircle(sx, sy, sR, seed + 1, t, { w: 4 });
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.15, r0 = sR + 16, r1 = sR + 36 + (i % 2) * 14; sr += ' ' + inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], O(2 + i, { w: 4, amp: 1 })); }
        sunR.setAttribute('d', sr);
        // far: cairo skyline or a low ridge
        if (kind === 'cairo') {
          let ff = '', fr = '';
          const py = HY;
          [[0.14, 170], [0.3, 120]].forEach(([px, ph], i) => {
            const x = W * px, h = ph * K, tri = [[x - h * 1.1, py], [x, py - h], [x + h * 1.1, py]];
            ff += inkLoop(tri, O(300 + i, { smooth: false, amp: 1 })) + ' ';
            fr += inkPath(tri, O(300 + i, { w: 3.5, smooth: false, amp: 1, closed: true })) + ' ';
            for (let k = 1; k < 4; k++) fr += inkPath([[x - h * 1.1 * k / 4, py - h * (1 - k / 4)], [x + h * 1.1 * k / 4, py - h * (1 - k / 4)]], O(310 + i * 5 + k, { w: 2, amp: 0.8 })) + ' ';
          });
          const cy = HY + 40 * K;
          sky.forEach((s, i) => {
            if (s.x < W * 0.38) return;                       // keep the pyramids clear
            let pts;
            if (s.t === 'dome') pts = [[s.x - s.R, cy], [s.x - s.R, cy - s.h], [s.x - s.R * 0.9, cy - s.h - s.R * 0.6], [s.x, cy - s.h - s.R], [s.x + s.R * 0.9, cy - s.h - s.R * 0.6], [s.x + s.R, cy - s.h], [s.x + s.R, cy]];
            else if (s.t === 'min') pts = [[s.x - s.w / 2, cy], [s.x - s.w / 2, cy - s.h], [s.x, cy - s.h - 36 * K], [s.x + s.w / 2, cy - s.h], [s.x + s.w / 2, cy]];
            else pts = [[s.x, cy], [s.x, cy - s.h], [s.x + s.w, cy - s.h], [s.x + s.w, cy]];
            ff += inkLoop(pts, O(400 + i, { smooth: s.t === 'dome', amp: 1 })) + ' ';
            fr += inkPath(pts, O(400 + i, { w: 3, smooth: s.t === 'dome', amp: 1 })) + ' ';
            if (s.t === 'min') fr += inkPath([[s.x - s.w * 0.8, cy - s.h * 0.7], [s.x + s.w * 0.8, cy - s.h * 0.7]], O(500 + i, { w: 3, amp: 0.8 })) + ' ';
          });
          farF.setAttribute('d', ff); farR.setAttribute('d', fr);
        }
        dunes.forEach((d, i) => {
          if (kind === 'cairo' && i === 0) { d.f.setAttribute('d', ''); d.r.setAttribute('d', ''); return; }
          const off = scroll * d.v, pts = [];
          for (let x = -100; x <= W + 100; x += 60) pts.push([x, d.y - d.A * (0.5 + 0.5 * Math.sin((x + off) * d.k + d.o))]);
          d.f.setAttribute('d', inkLoop([...pts, [W + 100, H + 40], [-100, H + 40]], O(600 + i, { amp: 1, smooth: false })));
          d.r.setAttribute('d', inkPath(pts, O(610 + i, { w: 4, amp: 1.2 })));
        });
      },
    };
  }

  // ---------------------------------------------------------------- cast (Kaşif + period figures), label
  function makeCast(P, parent, seed, portrait) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const sc = m.scale ?? (portrait ? 0.66 : 0.56);
      return { m, isK, sc, rig: KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) };
    });
  }
  function updateCast(cast, t, lt, dur, cues, W, H, G) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      let x = (m.x ?? 0.8) * W;
      if (moving && !after) x = lerp(x, m.to * W, clamp01(lt / Math.max(0.3, at ?? dur)));
      else if (m.to != null) x = m.to * W;
      const y = m.y != null ? m.y * H : G + 30;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const o = { x, y, face: m.face === 'left' ? -1 : 1, since, dir, text: m.text, item: m.item, emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
    });
  }
  function makeLabel(P, uiG, portrait) {
    if (!P.label || !P.label.text) return null;
    const t = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || (portrait ? 92 : 66), 'text-anchor': 'middle', fill: P.label.color === 'red' ? INK.red : INK.ink,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = P.label.text;
    return { L: P.label, t, u: mk(uiG, P.label.color === 'red' ? INK.red : INK.ink) };
  }
  function updateLabel(label, lt, t, cues, W, H, portrait, O, sd) {
    if (!label) return;
    const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.22 : 0.16)) * H, b = boil(sd + 8000, t, 1);
    label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
    label.t.setAttribute('fill-opacity', lt >= at ? clamp01(sp * 2) : 0);
    const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
    label.u.setAttribute('d', pu > 0.01 && lt >= at ? inkPath([[x - tw / 2, y + 24], [x - tw / 2 + tw * pu, y + 18]], O(8001, { w: 6 })) : '');
  }
  function camTf(P, lt, dur, W, H, pk) {
    const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? 1.05, u);
    const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.55) * H;
    return `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5 + pk * 6)}) translate(${f1(fx)} ${f1(fy)}) scale(${(z * (1 + pk * 0.03)).toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`;
  }

  // ================================================================ mm_gold
  SH.mm_gold = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.8;
      const mode = P.mode || 'rain';
      const G = portrait ? 1120 : 900, HY = portrait ? 760 : 520;
      const sd = seed * 1000;
      const root = el(svg, 'g'), world = el(root, 'g');
      const scen = scenery(world, W, H, sd, P.backdrop || (mode === 'rain' ? 'cairo' : 'desert'), HY, portrait);
      const groundR = mk(world, INK.inkSoft);
      const r = rng(seed * 31 + 9);
      // far tiny caravan on the ridge (caravan mode): simple humps + ticks
      const farCar = mode === 'caravan' ? mk(world, INK.inkSoft) : null;
      const camelG = el(world, 'g');
      const heapF = mk(world, INK.gold), heapR = mk(world);
      const coinF = mk(world, INK.gold), coinR = mk(world);
      const tagR = mk(world), tagF = mk(world, INK.paperLight), tagR2 = mk(world);
      const tagT = el(world, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 84 : 66, 'text-anchor': 'middle', fill: INK.red, 'fill-opacity': 0 });
      tagT.textContent = (P.tag && P.tag.text) || '';
      const actorG = el(world, 'g');
      const fxF = mk(world, INK.gold), fxR = mk(world);
      const sackF = mk(world, INK.paperLight), sackR = mk(world), mothF = mk(world, INK.paperDark), mothR = mk(world);
      const uiG = el(root, 'g');

      // camels
      let camelDefs = P.camels;
      if (!camelDefs) {
        if (mode === 'caravan') camelDefs = [0, 1, 2, 3].map(i => ({ x: 0.06 + i * 0.3, scale: 0.5, d: 0.5 }));
        else if (mode === 'camels') camelDefs = [{ x: 0.9, scale: 0.72, d: 0.4 }, { x: 0.46, scale: 1.0, d: 1 }];
        else if (mode === 'empty') camelDefs = [{ x: 0.16, scale: 0.55, d: 0.3, walk: false, sacks: 'empty' }];
        else camelDefs = [];
      }
      const camels = camelDefs.map((c, i) => Object.assign(makeCamel(camelG, seed * 40 + i + 1), { c, gph: r() }));
      // walkers between the camels (caravan)
      const walkers = mode === 'caravan' ? [0, 1, 2].map(i => ({ x: 0.2 + i * 0.3, rig: KASIF.create(el(camelG, 'g'), { scale: 0.42 * K, hat: false, accessory: i === 1 ? null : 'turban', seed: seed + 60 + i }) })) : [];
      // the king
      let king = null;
      if (mode === 'rain' || mode === 'empty') {
        const Kc = P.king || {};
        king = { Kc, x: (Kc.x ?? (mode === 'rain' ? 0.34 : 0.5)) * W, s: (Kc.scale ?? (mode === 'rain' ? 0.72 : 0.7)) * K, face: Kc.face === 'left' ? -1 : 1,
          rig: KASIF.create(el(actorG, 'g'), { scale: 1, hat: false, accessory: 'crown', seed: seed + 3 }) };
      }
      const cast = makeCast(P, actorG, seed, portrait);
      const label = makeLabel(P, uiG, portrait);
      // rain coins: launch params
      const NC = 90, rate = P.rate ?? 14;
      const coins = Array.from({ length: NC }, (_, i) => ({ t0: 0.05 + i / rate - 0.6, vx: (P.spread ? P.spread[0] + r() * (P.spread[1] - P.spread[0]) : -320 + r() * 640) * K, vy: (-520 - r() * 200) * K, ly: G + 10 + r() * 60, r: (20 + r() * 10) * K, sp: 4 + r() * 8, ph: r() * 6 }));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          world.setAttribute('transform', camTf(P, lt, dur, W, H, pk));
          const vt = mode === 'caravan' ? 300 * K : mode === 'camels' ? 140 * K : 0;
          scen.update(t, lt, lt * vt, O);
          groundR.setAttribute('d', mode === 'rain' ? inkPath([[-80, G + 40], [W * 0.5, G + 34], [W + 80, G + 42]], O(71, { w: 5 })) : '');
          // far caravan silhouettes
          if (farCar) {
            let d = '';
            const y0 = HY + 100 * K;
            for (let i = 0; i < 14; i++) {
              const x = ((i * 120 - lt * 40) % (W + 240) + W + 240) % (W + 240) - 120, y = y0 - 50 * K * (0.5 + 0.5 * Math.sin((x + lt * vt * 0.4) * 0.0045 + 1)) + 6;
              const s = 0.8 * K;
              d += inkPath([[x - 24 * s, y - 20 * s], [x - 12 * s, y - 38 * s], [x + 2 * s, y - 34 * s], [x + 14 * s, y - 24 * s], [x + 26 * s, y - 44 * s]], O(700 + i, { w: 4, amp: 0.8 })) + ' ' +
                inkPath([[x - 18 * s, y - 20 * s], [x - 18 * s, y]], O(730 + i, { w: 3, amp: 0.6 })) + ' ' + inkPath([[x + 12 * s, y - 22 * s], [x + 12 * s, y]], O(760 + i, { w: 3, amp: 0.6 })) + ' ';
              if (i % 2) d += inkPath([[x + 46 * s, y], [x + 46 * s, y - 34 * s]], O(790 + i, { w: 3, amp: 0.6 })) + ' ' + inkDot(x + 46 * s, y - 42 * s, 7 * s, 7 * s, sd + 820 + i, t) + ' ';
            }
            farCar.setAttribute('d', d);
          }
          // camels
          const glow = hitAt != null && lt >= hitAt ? sm((lt - hitAt) / 0.3) : (mode === 'camels' ? 0.25 : 0);
          camels.forEach((C, i) => {
            const c = C.c, s = (c.scale ?? 1) * K * (1 + (i === camels.length - 1 ? pk * 0.04 : 0));
            const x = (c.x ?? 0.5) * W, y = c.y != null ? c.y * H : lerp(HY + 120 * K, G + 20, c.d ?? 1);
            const walk = c.walk ?? (mode === 'caravan' || mode === 'camels');
            C.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${(-(c.face === 'left' ? -1 : 1) * -s).toFixed(4)} ${s.toFixed(4)})`);
            drawCamel(C, { t, ph: lt * (mode === 'caravan' ? 1.1 : 0.8) + C.gph, walk, sacks: c.sacks ?? 'gold', glow, w: Math.min(1.5, 1 / Math.sqrt(s)) });
          });
          walkers.forEach((wk, i) => {
            const x = wk.x * W, y = lerp(HY + 120 * K, G + 20, 0.5) + 10;
            wk.rig.update(t, 'walk', { x, y, face: 1, ph: lt / 0.8 + i * 0.3 });
          });
          // the king
          let handW = null;
          if (king) {
            const ky = G + (mode === 'rain' ? -36 : 30);
            const pose = mode === 'rain' ? 'wave' : (hitAt != null && lt >= hitAt ? 'shrug' : 'hold');
            const res = king.rig.update(t, pose === 'hold' ? 'shrug' : pose, { x: king.x, y: ky, face: king.face, scale: king.s, since: lt, emotion: mode === 'rain' ? 'happy' : 'worried' });
            const hr = res.hands[1];
            handW = [king.x + king.face * king.s * hr[0], ky + king.s * hr[1]];
          }
          // rain: coin arcs + heap
          let cf = '', cr = '';
          if (mode === 'rain') {
            const ox = king ? king.x + king.face * 110 * king.s : W * 0.4, oy = king ? G - 36 - 470 * king.s : G - 400;
            const grav = 2600 * K;
            let landed = 0;
            coins.forEach((c, i) => {
              const a = lt - c.t0;
              if (a < 0) return;
              let x = ox + c.vx * a, y = oy + c.vy * a + 0.5 * grav * a * a, spin = c.ph + a * c.sp;
              if (y > c.ly && c.vy + grav * a > 0) { // landed: stays flat on the ground
                const ta = (-c.vy + Math.sqrt(c.vy * c.vy + 2 * grav * (c.ly - oy))) / grav;
                x = ox + c.vx * ta; y = c.ly; spin = Math.PI / 2 - 0.2; landed++;
                const pts = inkEllipsePts(x, y, c.r, c.r * 0.38, sd + 2000 + i, 9);
                cf += inkLoop(pts, O(2000 + i, { amp: 0.6 })) + ' '; cr += inkPath(pts, O(2000 + i, { w: 3, closed: true, amp: 0.6 })) + ' ';
                return;
              }
              if (x < -60 || x > W + 60) return;
              const [a1, a2] = coinD(x, y, c.r, spin, sd + 2000 + i, t);
              cf += a1 + ' '; cr += a2 + ' ';
            });
            // gold heap under the king, grows with the landed coins
            const hx = king ? king.x : W * 0.34, hh = (60 + Math.min(80, landed * 1.4)) * K, hw = 260 * K;
            const hp = [[hx - hw, G + 44], [hx - hw * 0.6, G + 30 - hh * 0.5], [hx - hw * 0.2, G + 20 - hh], [hx + hw * 0.25, G + 22 - hh * 0.95], [hx + hw * 0.65, G + 30 - hh * 0.45], [hx + hw, G + 44]];
            heapF.setAttribute('d', inkLoop(hp, O(1900, { amp: 1.2 })));
            let hr2 = inkPath(hp.slice(0, -1).concat([hp[hp.length - 1]]), O(1901, { w: 5 }));
            for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, x = lerp(hx - hw * 0.8, hx + hw * 0.8, u), y = G + 40 - hh * Math.sin(Math.PI * u) * 0.9 + (k % 3) * 12; hr2 += ' ' + inkCircle(x, y, 18 * K, sd + 1910 + k, t, { w: 3, ry: 9 * K }); }
            heapR.setAttribute('d', hr2);
            if (P.tag) {
              const ta = atOr(cues, P.tag.at, 0), sp = lt >= ta ? spring(lt, ta, 0.6) : 0, sw = Math.sin(t * 2.4) * 3;
              const tx = hx + (P.tag.dx ?? 170) * K, ty = G + 30 - hh * 0.5;
              tagR.setAttribute('d', sp > 0 ? inkPath([[tx, ty + 6], [tx + 4, ty - 110 * K]], O(1950, { w: 6 })) : '');
              const card = [[-104, -60], [104, -62], [106, 50], [-100, 52]].map(q => { const rr = rotP([q[0] * K * sp, q[1] * K * sp], (sw - 6) * Math.PI / 180); return [tx + 4 + rr[0], ty - 160 * K + rr[1]]; });
              tagF.setAttribute('d', sp > 0 ? inkLoop(card, O(1951, { smooth: false, amp: 1 })) : '');
              tagR2.setAttribute('d', sp > 0 ? inkPath(card, O(1951, { w: 5, closed: true, smooth: false, amp: 1 })) : '');
              tagT.setAttribute('fill-opacity', sp > 0.05 ? 1 : 0);
              tagT.setAttribute('transform', `translate(${f1(tx + 4)} ${f1(ty - 134 * K)}) rotate(${f1(sw - 6)}) scale(${(Math.max(0.05, sp)).toFixed(3)})`);
            }
          } else { heapF.setAttribute('d', ''); heapR.setAttribute('d', ''); }
          // camels: spilled coins after the hit
          if (mode === 'camels' && hitAt != null && lt >= hitAt) {
            const C = camels[camels.length - 1], c = C.c, s = (c.scale ?? 1) * K, x0 = (c.x ?? 0.5) * W, y0 = lerp(HY + 120 * K, G + 20, c.d ?? 1);
            for (let k = 0; k < 8; k++) {
              const a = lt - hitAt - k * 0.12; if (a < 0) continue;
              const sx = x0 + (-74 + (k % 2) * 108) * s, sy = y0 - 250 * s, vx = (k % 2 ? 60 : -60) * (1 + k * 0.1), yy = Math.min(G + 30 + (k % 3) * 14, sy + 0.5 * 2400 * a * a);
              const [a1, a2] = coinD(sx + vx * a, yy, 18 * K, yy >= G + 30 ? Math.PI / 2 - 0.2 : a * 9 + k, sd + 2400 + k, t);
              cf += a1 + ' '; cr += a2 + ' ';
            }
          }
          coinF.setAttribute('d', cf); coinR.setAttribute('d', cr);
          // sparkles around the rain / the gold
          let xf = '', xr = '';
          if (mode === 'rain' || (mode === 'camels' && glow > 0.5)) {
            for (let k = 0; k < 5; k++) {
              const ph = (t * 0.9 + k / 5) % 1, x = (mode === 'rain' ? (king ? king.x : W * 0.34) : W * 0.46) + Math.sin(k * 2.3) * 220 * K, y = G - 60 - k * 70 * K - ph * 40;
              const [s1, s2] = sparkD(x, y, 22 * Math.sin(Math.PI * ph) * K, sd + 2600 + k, t);
              xf += s1 + ' '; xr += s2 + ' ';
            }
          }
          fxF.setAttribute('d', xf); fxR.setAttribute('d', xr);
          // empty: the sack shaken upside down, one coin, a moth
          if (mode === 'empty' && handW) {
            const sw = Math.sin(t * 10) * 0.18, hx = handW[0], hy = handW[1];
            const sk = [[-26, 0], [26, 0], [44, 120], [0, 150], [-44, 120]].map(q => { const rr = rotP(q, sw); return [hx + rr[0] * K, hy + 10 + rr[1] * K]; });
            sackF.setAttribute('d', inkLoop(sk, O(3000)));
            sackR.setAttribute('d', inkPath(sk, O(3000, { w: 7, closed: true })) + ' ' + inkPath([sk[2], sk[3], sk[4]].map(q => [q[0], q[1] - 30 * K]), O(3002, { w: 3, amp: 1 })) + ' ' + inkPath([[hx - 30 * K, hy + 6], [hx + 30 * K, hy + 2]], O(3001, { w: 6 })));
            const dAt = atOr(cues, 'drop', null);
            let mf = '', mr = '';
            if (dAt != null && lt >= dAt) {
              const a = lt - dAt, y = Math.min(G + 36, hy + 160 * K + 0.5 * 2400 * a * a), bounce = y >= G + 36 ? Math.abs(Math.sin((a - 0.4) * 12)) * 30 * Math.exp(-(a - 0.4) * 4) : 0;
              const [a1, a2] = coinD(hx + 20 * K, y - bounce, 22 * K, y >= G + 36 ? Math.PI / 2 - 0.25 : a * 10, sd + 3010, t);
              coinF.setAttribute('d', cf + a1); coinR.setAttribute('d', cr + a2);
            }
            const mAt = atOr(cues, 'moth', null);
            if (mAt != null && lt >= mAt) {
              const a = lt - mAt, mx = hx + 60 * K + a * 120 * K + Math.sin(a * 5) * 30, my = hy + 60 * K - a * 150 * K + Math.cos(a * 7) * 16, fl = Math.abs(Math.sin(t * 16));
              const k2 = 1.5 * K, fw = 0.35 + 0.65 * fl;   // a moth: two wing pairs that flap, a fat body, antennae
              const wing = (sx, a, b) => [[mx, my - 4 * k2], [mx + sx * a * fw * k2, my - b * k2], [mx + sx * (a + 8) * fw * k2, my - (b - 22) * k2], [mx + sx * 10 * k2, my + 4 * k2]];
              const ws = [wing(-1, 46, 34), wing(1, 46, 34), wing(-1, 34, -2).map(q => [q[0], q[1] + 18 * k2]), wing(1, 34, -2).map(q => [q[0], q[1] + 18 * k2])];
              ws.forEach((w2, j) => { mf += inkLoop(w2, O(3020 + j, { amp: 0.6 })) + ' '; mr += inkPath(w2, O(3020 + j, { w: 3.5, closed: true, amp: 0.6 })) + ' '; });
              mr += inkLoop(inkEllipsePts(mx, my + 6 * k2, 7 * k2, 20 * k2, sd + 3030, 8), O(3030, { amp: 0.5 })) + ' ' +
                inkPath([[mx - 3, my - 12 * k2], [mx - 14 * k2, my - 30 * k2]], O(3031, { w: 3 })) + ' ' + inkPath([[mx + 3, my - 12 * k2], [mx + 14 * k2, my - 30 * k2]], O(3032, { w: 3 }));
              let dots = ''; for (let j = 0; j < 3; j++) dots += inkDot(mx - 24 * k2 - j * 30 * k2, my + 30 * k2 + j * 26 * k2, 3, 3, sd + 3040 + j, t) + ' ';
              mr += dots;
            }
            mothF.setAttribute('d', mf); mothR.setAttribute('d', mr);
          }
          updateCast(cast, t, lt, dur, cues, W, H, G);
          updateLabel(label, lt, t, cues, W, H, portrait, O, sd);
        },
      };
    },
  };

  // ================================================================ mm_atlas
  SH.mm_atlas = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.8;
      const sd = seed * 1000, G = portrait ? 1120 : 900;
      const root = el(svg, 'g'), world = el(root, 'g');
      const A = portrait ? { x: 90, y: 430, w: 900, h: 630 } : { x: 360, y: 150, w: 1200, h: 700 };
      const card = el(world, 'g');
      const shF = mk(card, INK.paperDark, { 'fill-opacity': 0.5 }), cardF = mk(card, INK.paperLight), cardR = mk(card), cardR2 = mk(card, INK.red);
      const sandF = mk(card, INK.paperDark, { 'fill-opacity': 0.5 }), sandR = mk(card, INK.inkSoft);
      const throneF = mk(card, INK.red), throneR = mk(card);
      const camel = makeCamel(card, seed * 40 + 7);
      const riderG = el(card, 'g');
      const rider = KASIF.create(riderG, { scale: 1, hat: false, accessory: 'turban', seed: seed + 21 });
      const kingG = el(card, 'g');
      const king = KASIF.create(kingG, { scale: 1, hat: false, accessory: 'crown', seed: seed + 3 });
      const orbF = mk(card, INK.gold), orbR = mk(card), scepR = mk(card), spF = mk(card, INK.gold), spR = mk(card);
      const capT = el(world, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 52 : 46, 'text-anchor': 'middle', fill: INK.inkSoft });
      capT.textContent = P.caption || '';
      const actorG = el(root, 'g');
      const cast = makeCast(P, actorG, seed, portrait);
      const uiG = el(root, 'g');
      const label = makeLabel(P, uiG, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const sp = spring(lt, 0, 0.7);
          world.setAttribute('transform', camTf(Object.assign({ cam: { zoom: 1.06, focus: [0.58, 0.45] } }, P), lt, dur, W, H, pk) + ` translate(0 ${f1((1 - sp) * 80)}) rotate(-1.2 ${W / 2} ${H * 0.4})`);
          const R = [[A.x, A.y], [A.x + A.w, A.y + 4], [A.x + A.w - 4, A.y + A.h], [A.x + 4, A.y + A.h - 4]];
          shF.setAttribute('d', inkLoop(R.map(q => [q[0] + 12, q[1] + 14]), O(1, { smooth: false, amp: 1 })));
          cardF.setAttribute('d', inkLoop(R, O(2, { smooth: false, amp: 1 })));
          cardR.setAttribute('d', inkPath(R, O(2, { w: 5, closed: true, smooth: false, amp: 1 })));
          const R2 = [[A.x + 22, A.y + 22], [A.x + A.w - 22, A.y + 24], [A.x + A.w - 24, A.y + A.h - 22], [A.x + 24, A.y + A.h - 24]];
          cardR2.setAttribute('d', inkPath(R2, O(3, { w: 3.5, closed: true, smooth: false, amp: 1 })));
          // sand ground band inside the card
          const gy = A.y + A.h - 110;
          const sand = [[A.x + 30, gy], [A.x + A.w * 0.3, gy - 14], [A.x + A.w * 0.6, gy + 4], [A.x + A.w - 30, gy - 8], [A.x + A.w - 30, A.y + A.h - 30], [A.x + 30, A.y + A.h - 30]];
          sandF.setAttribute('d', inkLoop(sand, O(4, { amp: 1 })));
          let sr = inkPath(sand.slice(0, 4), O(5, { w: 3.5, amp: 1 }));
          for (let k = 0; k < 7; k++) { const x = A.x + 80 + k * 120, y = gy + 30 + (k % 2) * 24; sr += ' ' + inkPath([[x, y], [x + 30, y - 3]], O(6 + k, { w: 3, amp: 0.8 })); }
          sandR.setAttribute('d', sr);
          // throne (behind the king)
          const kx = A.x + A.w * 0.7, ks = 0.9 * K;
          const th = [[kx - 120 * ks, gy + 4], [kx - 120 * ks, gy - 470 * ks], [kx - 70 * ks, gy - 520 * ks], [kx - 20 * ks, gy - 470 * ks], [kx - 20 * ks, gy - 110 * ks], [kx + 120 * ks, gy - 110 * ks], [kx + 120 * ks, gy + 4]];
          throneF.setAttribute('d', inkLoop(th, O(20, { smooth: false, amp: 1 })));
          throneR.setAttribute('d', inkPath(th, O(20, { w: 5, closed: true, smooth: false, amp: 1 })));
          // the king (seated, facing left towards the rider)
          const kr = king.update(t, 'sit', { x: kx, y: gy, face: -1, scale: ks, since: lt, emotion: 'happy' });
          const hR = kr.hands[1], hL = kr.hands[0];
          const orb = [kx - ks * hR[0] - 4, gy + ks * hR[1] - 46 * ks - 20 - 10 * prog(lt, hitAt ?? 0.4, 0.5)];
          const oR = (34 + 6 * pk) * K;
          orbF.setAttribute('d', inkCircle(orb[0], orb[1], oR, sd + 30, t, { fill: true }));
          orbR.setAttribute('d', inkCircle(orb[0], orb[1], oR, sd + 30, t, { w: 5 }) + ' ' + inkPath([[orb[0] - oR * 0.4, orb[1] - oR * 0.3], [orb[0] - oR * 0.1, orb[1] - oR * 0.5]], O(31, { w: 4, amp: 0.6 })));
          const scx = kx - ks * hL[0], scy = gy + ks * hL[1];
          scepR.setAttribute('d', inkPath([[scx, scy + 60 * ks], [scx + 6, scy - 300 * ks]], O(32, { w: 7 })) + ' ' + inkCircle(scx + 6, scy - 320 * ks, 18 * ks, sd + 33, t, { w: 5 }) + ' ' +
            inkPath([[scx - 24 * ks, scy - 300 * ks], [scx + 36 * ks, scy - 300 * ks]], O(34, { w: 5 })));
          // glint on the orb (continuous, stronger after the hit)
          const gl = 0.45 + 0.55 * (hitAt != null && lt >= hitAt ? sm((lt - hitAt) / 0.3) : 0);
          const gr2 = (24 + 14 * Math.sin(t * 8)) * gl * K;
          const [s1, s2] = sparkD(orb[0] + oR * 0.9, orb[1] - oR * 0.9, gr2, sd + 35, t);
          const [s3, s4] = sparkD(orb[0] - oR * 1.2, orb[1] - oR * 0.2, gr2 * 0.6, sd + 36, t);
          spF.setAttribute('d', s1 + ' ' + s3); spR.setAttribute('d', s2 + ' ' + s4);
          // rider on a camel approaching from the left
          const cs = 0.6 * K, cx = A.x + A.w * 0.08 + 40 * K + Math.min(lt, 3) * 22 * K;
          camel.g.setAttribute('transform', `translate(${f1(cx)} ${f1(gy + 4)}) scale(${cs} ${cs})`);
          drawCamel(camel, { t, ph: lt * 0.7, walk: true, sacks: false, w: 1.4 });
          rider.update(t, 'sit', { x: cx - 10 * cs, y: gy + 4 - 380 * cs, face: 1, scale: 0.85 * cs, since: lt });
          // caption under the card
          capT.setAttribute('transform', `translate(${f1(W / 2)} ${f1(A.y + A.h + 70)})`);
          capT.setAttribute('fill-opacity', clamp01((lt - 0.4) / 0.4));
          updateCast(cast, t, lt, dur, cues, W, H, G);
          updateLabel(label, lt, t, cues, W, H, portrait, O, sd);
        },
      };
    },
  };

  // ================================================================ mm_map / mm_board
  // the parchment2d map / board, plus an overlaid Kaşif and an optional red handwritten note (parchment2d stays untouched)
  // extra P: kasif: {x, y (ground, 0..1 H), scale, pose, at, then, dir, face: "left"|"right", emotion},
  //          wrap: {scale: 0.85, ox: 0.5, oy: 312 (px)} (shrinks the inner shot around that point),
  //          redNote: {text, x, y, at, size, rot}
  const wrapShot = (base) => ({
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const Wr = P.wrap || null;
      const inner = el(svg, 'g');
      const shot = SH[base].build(Object.assign({}, ctx, { svg: inner }));
      if (Wr) { const ox = (Wr.ox ?? 0.5) * W, oy = Wr.oy ?? 312, k = Wr.scale ?? 0.85; inner.setAttribute('transform', `translate(${ox} ${oy}) scale(${k}) translate(${-ox} ${-oy})`); }
      const top = el(svg, 'g');
      const nf = mk(top, INK.red);
      let note = null;
      if (P.redNote && P.redNote.text) {
        note = el(top, 'text', { 'font-family': INK_FONT, 'font-size': P.redNote.size || 72, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        note.textContent = P.redNote.text;
      }
      const castP = P.kasif ? { cast: [Object.assign({ who: 'kasif' }, P.kasif)] } : { cast: [] };
      const cast = makeCast(castP, top, seed + 5, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          shot.update(lt, dur, cues, env);
          const t = env.t ?? lt;
          updateCast(cast, t, lt, dur, cues, W, H, portrait ? 1120 : 900);
          if (note) {
            const Nn = P.redNote, at = atOr(cues, Nn.at, 0.3), sp = spring(lt, at, 0.6), b = boil(sd + 9100, t, 1.2);
            note.setAttribute('fill-opacity', lt >= at ? 1 : 0);
            note.setAttribute('transform', `translate(${f1(Nn.x * W + b[0])} ${f1(Nn.y * H + b[1])}) rotate(${Nn.rot ?? -4}) scale(${lerp(0.5, 1, sp).toFixed(3)})`);
          }
          nf.setAttribute('d', '');
        },
      };
    },
  });
  SH.mm_map = { kind: '2d', build: ctx => wrapShot('map').build(ctx) };
  SH.mm_board = { kind: '2d', build: ctx => wrapShot('board').build(ctx) };

  // ================================================================ mm_market
  SH.mm_market = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.8;
      const sd = seed * 1000, G = portrait ? 1120 : 900, HY = portrait ? 760 : 520;
      const root = el(svg, 'g'), world = el(root, 'g');
      const scen = scenery(world, W, H, sd, 'cairo', HY, portrait);
      const awnF = mk(world, INK.paperLight), awnS = mk(world, INK.red), awnR = mk(world);
      const counterF = mk(world, INK.paperDark), counterR = mk(world);
      const scaleR = mk(world), panF = mk(world, INK.paperLight), goldF = mk(world, INK.gold), silF = mk(world, INK.paperLight), coinsR = mk(world, INK.ink);
      const arrowF = mk(world, INK.red), arrowR = mk(world);
      const arrowT = el(world, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 64 : 54, 'text-anchor': 'middle', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
      arrowT.textContent = (P.arrow && P.arrow.text) || '';
      const pileF = mk(world, INK.paperDark), pileG = mk(world, INK.gold), pileR = mk(world), rainF = mk(world, INK.gold), rainR = mk(world);
      const actorG = el(world, 'g');
      const cast = makeCast(P, actorG, seed, portrait);
      const streetR = mk(world);
      world.appendChild(arrowF); world.appendChild(arrowR); world.appendChild(arrowT);
      const uiG = el(root, 'g');
      const label = makeLabel(P, uiG, portrait);
      const r = rng(seed * 41 + 2);
      const drops = Array.from({ length: 70 }, (_, i) => ({ x: 40 + r() * (W - 80), t0: i * 0.045 + r() * 0.04, v: (1300 + r() * 500) * K, r: (18 + r() * 9) * K, sp: 5 + r() * 7 }));
      const pileCoins = Array.from({ length: 54 }, (_, k) => ({ u: (k % 18 + r() * 0.8) / 18, row: Math.floor(k / 18), r: (22 + r() * 8) * K }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const floodAt = atOr(cues, P.flood || 'flood', dur * 0.3), hitAt = atOr(cues, (P.arrow && P.arrow.at) || 'hit', dur * 0.6), pk = punch(lt, hitAt, 0.6);
          world.setAttribute('transform', camTf(P, lt, dur, W, H, pk));
          scen.update(t, lt, 0, O);
          // awning: scalloped red/paper stripes
          const ay = portrait ? 330 : 120, ah = 120 * K, x0 = 60, x1 = W - 60, n = 8, sw = (x1 - x0) / n;
          awnF.setAttribute('d', inkLoop([[x0, ay], [x1, ay], [x1, ay + ah], [x0, ay + ah]], O(10, { smooth: false, amp: 1 })));
          let st = '', ar = inkPath([[x0, ay], [x1, ay], [x1, ay + ah], [x0, ay + ah]], O(10, { w: 5, closed: true, smooth: false, amp: 1 }));
          for (let i = 0; i < n; i++) {
            const a = x0 + i * sw, sc = [[a, ay + ah], [a + sw * 0.5, ay + ah + 36 * K], [a + sw, ay + ah]];
            if (i % 2 === 0) st += inkLoop([[a, ay], [a + sw, ay], [a + sw, ay + ah], ...sc.slice(1).reverse(), [a, ay + ah]], O(20 + i, { smooth: false, amp: 1 })) + ' ';
            ar += ' ' + inkPath(sc, O(40 + i, { w: 4, amp: 1 }));
          }
          awnS.setAttribute('d', st);
          const cy = portrait ? 930 : 700;
          ar += ' ' + inkPath([[x0 + 20, ay + ah], [x0 + 24, cy]], O(60, { w: 9 })) + ' ' + inkPath([[x1 - 20, ay + ah], [x1 - 24, cy]], O(61, { w: 9 }));
          awnR.setAttribute('d', ar);
          const cnt = [[x0 - 10, cy], [x1 + 10, cy], [x1 + 10, cy + 120 * K], [x0 - 10, cy + 120 * K]];
          counterF.setAttribute('d', inkLoop(cnt, O(70, { smooth: false, amp: 1 })));
          counterR.setAttribute('d', inkPath(cnt, O(70, { w: 6, closed: true, smooth: false, amp: 1 })) + ' ' + inkPath([[x0, cy + 40 * K], [x1, cy + 42 * K]], O(71, { w: 3, amp: 1 })));
          // balance scale on the counter: tilt (deg) — gold side (left) down before the hit, rises after it
          const sx = W * (P.scale_x ?? 0.4), top = portrait ? 560 : 330, bw = 220 * K;
          const tilt = lerp(-10, 22, sm((lt - hitAt) / 0.7)) + Math.sin(t * 2.2) * 1.2;   // + = left (gold) pan up
          const ta = tilt * Math.PI / 180;
          const L = [sx - Math.cos(ta) * bw, top - Math.sin(ta) * bw], Rr = [sx + Math.cos(ta) * bw, top + Math.sin(ta) * bw];
          let sR = inkPath([[sx, cy], [sx, top]], O(80, { w: 9 })) + ' ' + inkPath([[sx - 70 * K, cy], [sx + 70 * K, cy]], O(81, { w: 8 })) + ' ' + inkPath([L, Rr], O(82, { w: 8 })) +
            ' ' + inkCircle(sx, top, 14, sd + 83, t, { w: 5 });
          const panY = 200 * K, pans = [L, Rr].map(p => [p[0], p[1] + panY]);
          let pf = '', gf = '', sf = '', cr = '';
          pans.forEach((p, i) => {
            sR += ' ' + inkPath([[p[0] - 4, p[1] - panY], [p[0] - 80 * K, p[1]]], O(84 + i, { w: 3.5 })) + ' ' + inkPath([[p[0] + 4, p[1] - panY], [p[0] + 80 * K, p[1]]], O(86 + i, { w: 3.5 }));
            const bowl = [[p[0] - 96 * K, p[1]], [p[0] - 60 * K, p[1] + 36 * K], [p[0] + 60 * K, p[1] + 36 * K], [p[0] + 96 * K, p[1]]];
            pf += inkLoop(bowl, O(90 + i, { amp: 1 })) + ' ';
            sR += ' ' + inkPath(bowl.concat([bowl[0]]), O(90 + i, { w: 5, amp: 1 }));
            if (i === 0) {   // gold coins heap (grows with the flood)
              const nG = 3 + Math.floor(clamp01((lt - floodAt) / 1.5) * 5);
              for (let k = 0; k < nG; k++) { const cx = p[0] + ((k % 3) - 1) * 46 * K, cyy = p[1] - 6 - Math.floor(k / 3) * 22 * K; const pts = inkEllipsePts(cx, cyy, 30 * K, 13 * K, sd + 100 + k, 9); gf += inkLoop(pts, O(100 + k, { amp: 0.6 })) + ' '; cr += inkPath(pts, O(100 + k, { w: 3, closed: true, amp: 0.6 })) + ' '; }
            } else {          // silver dirhams: a small stack
              for (let k = 0; k < 5; k++) { const pts = inkEllipsePts(p[0], p[1] - 6 - k * 14 * K, 34 * K, 12 * K, sd + 120 + k, 9); sf += inkLoop(pts, O(120 + k, { amp: 0.6 })) + ' '; cr += inkPath(pts, O(120 + k, { w: 3, closed: true, amp: 0.6 })) + ' '; }
            }
          });
          scaleR.setAttribute('d', sR); panF.setAttribute('d', pf); goldF.setAttribute('d', gf); silF.setAttribute('d', sf); coinsR.setAttribute('d', cr);
          // red arrow down next to the gold pan after the hit
          if (lt >= hitAt) {
            const p = spring(lt, hitAt, 0.6), ax = 104 * K, ay0 = (portrait ? 640 : 300), len = 230 * K * Math.min(1, p);
            const sh = [[ax - 18 * K, ay0], [ax + 18 * K, ay0], [ax + 18 * K, ay0 + len - 46 * K], [ax + 42 * K, ay0 + len - 46 * K], [ax, ay0 + len + 10 * K], [ax - 42 * K, ay0 + len - 46 * K], [ax - 18 * K, ay0 + len - 46 * K]];
            const shs = sh;
            arrowF.setAttribute('d', inkLoop(shs, O(140, { smooth: false, amp: 1.2 })));
            arrowR.setAttribute('d', inkPath(shs, O(140, { w: 5, closed: true, smooth: false, amp: 1.2 })));
            arrowT.setAttribute('transform', `translate(${f1(W * 0.42)} ${f1(portrait ? 1010 : 760)}) rotate(-2) scale(${lerp(0.6, 1, p).toFixed(3)})`);
            arrowT.setAttribute('fill-opacity', 1);
          } else { arrowF.setAttribute('d', ''); arrowR.setAttribute('d', ''); arrowT.setAttribute('fill-opacity', 0); }
          // coin flood: rain from the top, a rising pile at the bottom
          const fl = lt - floodAt;
          const GB = P.pile_base ?? (portrait ? 1100 : 860);   // street line: the pile sits on it, nothing below it
          const pileTop = lerp(GB + 4, P.pile_top ?? (portrait ? 1030 : 800), fl > 0 ? sm(fl / Math.max(1.2, dur - floodAt)) : 0);
          streetR.setAttribute('d', inkPath([[-60, GB + 2], [W * 0.5, GB - 2], [W + 60, GB + 3]], O(299, { w: 5 })));
          let rf = '', rr = '';
          if (fl > 0) drops.forEach((d, i) => {
            const a = ((fl - d.t0) % 1.1 + 1.1) % 1.1; if (fl < d.t0) return;
            const y = -40 + d.v * a; if (y > pileTop + 10 || (y < 300 && d.x < 560)) return;
            const [a1, a2] = coinD(d.x, y, d.r, a * d.sp + i, sd + 200 + i, t);
            rf += a1 + ' '; rr += a2 + ' ';
          });
          rainF.setAttribute('d', rf); rainR.setAttribute('d', rr);
          if (fl > 0) {
            const hgt = GB - pileTop, pts = []; for (let x = -60; x <= W + 60; x += 90) pts.push([x, Math.min(GB, pileTop + Math.sin(x * 0.02 + 1) * Math.min(16, hgt * 0.3))]);
            pileF.setAttribute('d', hgt > 6 ? inkLoop([...pts, [W + 60, GB + 2], [-60, GB + 2]], O(300, { amp: 1, smooth: false })) : '');
            let pr = inkPath(pts, O(301, { w: 5 })), pg = '';
            pileCoins.forEach((c, k) => {
              const x = c.u * W, y = pileTop + Math.sin(x * 0.02 + 1) * Math.min(16, hgt * 0.3) + 4 + c.row * 30 * K + (k % 2) * 8;
              if (y > GB - 6) return;
              const pts2 = inkEllipsePts(x, y, c.r, c.r * 0.42, sd + 310 + k, 9);
              pg += inkLoop(pts2, O(310 + k, { amp: 0.6 })) + ' '; pr += ' ' + inkPath(pts2, O(310 + k, { w: 3.5, closed: true, amp: 0.6 }));
            });
            pileG.setAttribute('d', pg); pileR.setAttribute('d', pr);
          } else { pileF.setAttribute('d', ''); pileG.setAttribute('d', ''); pileR.setAttribute('d', ''); }
          updateCast(cast, t, lt, dur, cues, W, H, G);
          updateLabel(label, lt, t, cues, W, H, portrait, O, sd);
        },
      };
    },
  };
})();
