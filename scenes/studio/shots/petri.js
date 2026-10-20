// petri: Fleming's penicillin plate (London, 1928) in the parchment ink style (brand/kit/BRAND.md §3, §5; every line
// boils at 8 Hz via _ink.js). Two 2D shots:
//
// SHOTS.petri — a giant glass culture dish seen from above: agar, golden Staphylococcus colonies, a blue-green
//   Penicillium mould that blooms on a cue, and the clear bacteria-free ring that opens around it (colonies inside it
//   shrink to pale ghosts from the mould outwards). Slow camera push-in + spin, a light glint sweeping the rim.
//   P: {
//     cx: 0.5, cy: 0.37, r: 0.4,            // dish centre (0..1 of W / H) and radius (fraction of W)
//     colonies: 64, seed: 3,                // number of bacteria colonies
//     mold: {x: -0.3, y: -0.28, r: 0.24, at: "mold"} | false,   // mould centre/radius in dish units (-1..1); at = cue
//                                           //   name or seconds (negative = fully grown from the first frame)
//     halo: {k: 2.1, at: "halo"} | false,   // clear ring radius = k * mould radius; at = cue / seconds (negative = open)
//     zoom: [1, 1.1], focus: [-0.2, -0.15], spin: 0.6 (deg/s), // camera push-in towards a dish point, slow rotation
//     label: {text, x: 0.5, y: 0.17, at, size: 84, color: "ink"|"red"|"blue"|"green", arrow: [u, v] (dish units)},
//     cast: [{who: "kasif"|name, x, y (ground, 0..1 H), scale, pose, at, then, to, face, dir, emotion, bowtie, tag}],
//     question: cue                          // a big red "?" pops above the first non-Kaşif cast member (or the dish)
//   }   cues: mold, halo, hit (punch), label/cast "at" names
//
// SHOTS.labbench — Fleming's laboratory bench at St Mary's: back wall with a shelf of bottles and a ticking wall
//   clock, a door on the left, a long bench with a stack of culture dishes, a microscope, a Bunsen burner with a
//   flickering flame and (optionally) a flask of yellow "mould juice" that fizzles and fails on a cue.
//   P: {
//     door: true, stack: 6 (dishes in the pile, 0 = none), stack_x: 0.62, microscope: true, burner: true,
//     flask: {x: 0.56, at: "fail"} | false,  // on the cue the liquid boils over, darkens and smoke rises
//     suitcase: true,                        // first cast member with carry: "suitcase" carries it (walk in)
//     cast: [{who, accessory, x, to, at, pose, then, face, dir, emotion, scale, bowtie: true, tag: "Fleming",
//             carry: "suitcase", item}],
//     label: {text, x, y, at, size, color}, question: cue, cam: {zoom: 1.06, focus: [0.5, 0.5]}
//   }   cues: fail, question, hit, cast/label "at" names
// Everything is a pure function of (seed, lt): no Math.random, scrubbing back gives the same frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold };
  const MOLD = mix(INK.green, INK.blue, 0.45), MOLD_D = mix(MOLD, INK.ink, 0.35), AGAR = mix(INK.paperLight, INK.gold, 0.16);
  const CLEAR = mix(INK.paperLight, '#ffffff', 0.25);

  // ---------------------------------------------------------------- shared: cast (Kaşif + period figures)
  function makeCast(P, parent, seed, portrait, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const sc = m.scale ?? defScale;
      const g = el(parent, 'g');
      const rig = typeof KASIF !== 'undefined' ? KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null),
        beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) : null;
      const over = el(g, 'g');
      const c = { m, isK, sc, rig, g,
        bowF: m.bowtie ? mk(over, INK.blue) : null, bowR: m.bowtie ? mk(over) : null,
        suitF: m.carry === 'suitcase' ? mk(over, INK.inkSoft) : null, suitR: m.carry === 'suitcase' ? mk(over) : null, suitB: m.carry === 'suitcase' ? mk(over, INK.paperDark) : null,
        tag: null, tagU: null };
      if (m.tag) {
        c.tag = el(over, 'text', { 'font-family': INK_FONT, 'font-size': m.tag_size || (portrait ? 64 : 54), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round`, 'fill-opacity': 0 });
        c.tag.textContent = m.tag;
        c.tagU = mk(over, INK.red);
      }
      return c;
    });
  }
  function updateCast(cast, lt, t, dur, cues, W, H, G, sd) {
    const heads = [];
    cast.forEach((c, ci) => {
      if (!c.rig) return;
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      let x = (m.x ?? 0.8) * W;
      if (moving && !after) x = lerp(x, m.to * W, sm(clamp01(lt / Math.max(0.3, at ?? dur)) * 1.08) );
      else if (m.to != null) x = m.to * W;
      const y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : 1;
      const o = { x, y, face, since, dir, text: m.text, item: m.item,
        emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
      const r = c.rig.update(t, pose, o) || {};
      const s = c.sc, W2 = (q) => [x + face * s * q[0], y + s * q[1]];
      const hc = r.head || [0, -440];
      const headW = W2(hc);
      heads[ci] = { x: headW[0], y: headW[1] - 110 * s, isK: c.isK };
      const O = (k, xx) => Object.assign({ seed: sd + ci * 300 + k, t, amp: 1 }, xx);
      if (c.bowF) {   // bow tie under the chin
        const nk = [hc[0] + 4, hc[1] + 96];
        const L = [[-34, -18], [-4, -4], [-4, 6], [-34, 20]].map(q => W2([nk[0] + q[0], nk[1] + q[1]]));
        const R = [[34, -18], [4, -4], [4, 6], [34, 20]].map(q => W2([nk[0] + q[0], nk[1] + q[1]]));
        const kn = W2(nk);
        c.bowF.setAttribute('d', inkLoop(L, O(1, { smooth: false })) + ' ' + inkLoop(R, O(2, { smooth: false })));
        c.bowR.setAttribute('d', inkPath(L, O(1, { w: 3.5, closed: true, smooth: false })) + ' ' + inkPath(R, O(2, { w: 3.5, closed: true, smooth: false })) + ' ' +
          inkDot(kn[0], kn[1], 7 * s / 0.8, 7 * s / 0.8, sd + ci * 300 + 3, t));
      }
      if (c.suitF) {  // suitcase hanging from the front hand while walking; set down beside him afterwards
        const hands = r.hands || [[30, -250], [40, -250]];
        const hf = hands[1];
        const carrying = pose === 'walk' || pose === 'run';
        const top = carrying ? W2([hf[0], hf[1] + 12]) : W2([110, -96]);
        const sw = 128 * s, sh = 92 * s;
        const box = [[top[0] - sw / 2, top[1] + 10 * s], [top[0] + sw / 2, top[1] + 8 * s], [top[0] + sw / 2 + 2, top[1] + sh], [top[0] - sw / 2 - 1, top[1] + sh + 2]];
        const handle = [[top[0] - 22 * s, top[1] + 10 * s], [top[0] - 18 * s, top[1] - 8 * s], [top[0] + 18 * s, top[1] - 8 * s], [top[0] + 22 * s, top[1] + 10 * s]];
        const band = [[top[0] - sw / 2, top[1] + sh * 0.45], [top[0] + sw / 2, top[1] + sh * 0.45 - 2], [top[0] + sw / 2, top[1] + sh * 0.6], [top[0] - sw / 2, top[1] + sh * 0.6 + 2]];
        c.suitF.setAttribute('d', inkLoop(box, O(10, { smooth: false, amp: 1.2 })));
        c.suitB.setAttribute('d', inkLoop(band, O(12, { smooth: false, amp: 1 })));
        c.suitR.setAttribute('d', inkPath(box, O(10, { w: 5, closed: true, smooth: false, amp: 1.2 })) + ' ' + inkPath(handle, O(11, { w: 5, amp: 1 })));
      }
      if (c.tag) {    // handwritten name above the head
        const ta = atOr(cues, m.tag_at, 0.15), sp = spring(lt, ta, 0.6), b = boil(sd + ci * 300 + 20, t, 1);
        const hx = headW[0], hy = headW[1] - 150 * s;
        c.tag.setAttribute('fill-opacity', 1); c.tag.setAttribute('opacity', clamp01(sp * 2));
        c.tag.setAttribute('transform', `translate(${f1(hx + b[0])} ${f1(hy + b[1])}) rotate(-3) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
        const tw = c.tag.getComputedTextLength ? c.tag.getComputedTextLength() : 200, pu = prog(lt, ta + 0.2, 0.4);
        c.tagU.setAttribute('d', pu > 0.01 ? inkPath([[hx - tw / 2, hy + 18], [hx - tw / 2 + tw * pu, hy + 13]], O(21, { w: 5 })) : '');
      }
    });
    return heads;
  }
  function makeLabel(P, parent, portrait) {
    if (!P.label || !P.label.text) return null;
    const L = P.label;
    const t = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 84 : 66), 'text-anchor': 'middle', fill: COL[L.color] || INK.ink,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = L.text;
    return { L, t, u: mk(parent, COL[L.color] || INK.ink), arrow: mk(parent, COL[L.color] || INK.ink) };
  }
  function updateLabel(label, lt, t, cues, W, H, sd, portrait, arrowTo) {
    if (!label) return;
    const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.17 : 0.15)) * H, b = boil(sd + 8000, t, 1);
    label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
    label.t.setAttribute('fill-opacity', 1); label.t.setAttribute('opacity', clamp01(sp * 2));
    const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
    const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
    label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], O(8001, { w: 6 })) : '');
    if (arrowTo) {
      const pa = prog(lt, at + 0.35, 0.5);
      if (pa < 0.01) { label.arrow.setAttribute('d', ''); return; }
      const sx = x + (arrowTo[0] > x ? tw * 0.3 : -tw * 0.3), sy = y + 40, ex = arrowTo[0], ey = arrowTo[1];
      const mx = (sx + ex) / 2 + (ex > sx ? 70 : -70), my = (sy + ey) / 2 - 30;
      const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
      let d = inkPath(pts, O(8010, { w: 6 }));
      if (pa > 0.95) {
        const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]);
        d += ' ' + inkPath([[ex - 36 * Math.cos(a - 0.5), ey - 36 * Math.sin(a - 0.5)], [ex, ey], [ex - 36 * Math.cos(a + 0.5), ey - 36 * Math.sin(a + 0.5)]], O(8011, { w: 6, smooth: false }));
      }
      label.arrow.setAttribute('d', d);
    }
  }
  function makeQ(parent, K) {
    const q = el(parent, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 190 * K, 'text-anchor': 'middle', fill: INK.red,
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round`, 'fill-opacity': 0 });
    q.textContent = '?';
    return q;
  }
  function updateQ(q, at, lt, t, pos, sd) {
    if (at == null || lt < at || !pos) { q.setAttribute('fill-opacity', 0); return; }
    const sp = spring(lt, at, 0.7), b = boil(sd + 7300, t, 2);
    q.setAttribute('fill-opacity', 1);
    q.setAttribute('transform', `translate(${f1(pos[0] + b[0])} ${f1(pos[1] + b[1])}) rotate(${f1(Math.sin(t * 3) * 8)}) scale(${lerp(0.2, 1, sp).toFixed(3)})`);
  }

  // ================================================================ petri: the dish from above
  SH.petri = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.8;
      const sd = seed * 1000 + 17;
      const CX = (P.cx ?? 0.5) * W, CY = (P.cy ?? (portrait ? 0.37 : 0.45)) * H, R = (P.r ?? (portrait ? 0.4 : 0.22)) * W;
      const U = (u, v) => [CX + u * R, CY + v * R];
      // round glass rings (the hand wobble comes from the 8 Hz boil, not from a lumpy outline)
      const circ = (rr, k) => inkEllipsePts(CX, CY, rr, rr, sd + k, 40, 0, 0.006);
      const root = el(svg, 'g'), world = el(root, 'g'), dishG = el(world, 'g');
      // under the dish: table hatching + soft shadow
      const tableR = mk(world, INK.inkSoft, { 'fill-opacity': 0.5 });
      world.insertBefore(tableR, dishG);
      const shadow = el(dishG, 'ellipse', { fill: INK.ink, opacity: 0.12 });
      const glassF = mk(dishG, INK.paperLight), agarF = mk(dishG, AGAR);
      const haloF = mk(dishG, CLEAR), haloR = mk(dishG, INK.inkSoft);
      const colGhost = mk(dishG, INK.paperDark, { 'fill-opacity': 0.55 }), colGhostR = mk(dishG, INK.inkSoft, { 'fill-opacity': 0.45 });
      const colF = mk(dishG, INK.gold), colR = mk(dishG), colHi = mk(dishG, INK.paperLight, { 'fill-opacity': 0.7 });
      const moldO = mk(dishG, INK.paperLight), moldM = mk(dishG, MOLD), moldC = mk(dishG, MOLD_D), moldH = mk(dishG, INK.inkSoft), moldR = mk(dishG), moldS = mk(dishG, INK.paperLight);
      const rimR = mk(dishG), glint = mk(dishG, '#ffffff', { 'fill-opacity': 0.75 }), glint2 = mk(dishG, '#ffffff', { 'fill-opacity': 0.5 });
      const actorG = el(root, 'g'), uiG = el(root, 'g');
      // colonies: rejection sampling inside the agar, outside the mould
      const Mo = P.mold === false ? null : Object.assign({ x: -0.3, y: -0.28, r: 0.24, at: 'mold' }, P.mold || {});
      const Ha = (P.halo === false || !Mo) ? null : Object.assign({ k: 2.1, at: 'halo' }, P.halo || {});
      const r = rng((P.seed ?? 3) * 7919 + 11);
      const N = P.colonies ?? 64, cols = [];
      for (let tries = 0; cols.length < N && tries < N * 40; tries++) {
        const u = r() * 2 - 1, v = r() * 2 - 1, d = Math.hypot(u, v);
        if (d > 0.84) continue;
        const rad = 0.022 + r() * r() * 0.04;
        if (Mo && Math.hypot(u - Mo.x, v - Mo.y) < Mo.r * 1.05 + rad) continue;
        if (cols.some(c => Math.hypot(c.u - u, c.v - v) < c.rad + rad + 0.012)) continue;
        cols.push({ u, v, rad, k: cols.length, ph: r() * 6, dm: Mo ? Math.hypot(u - Mo.x, v - Mo.y) : 9 });
      }
      // mould hyphae directions (fixed per seed)
      const hy = Array.from({ length: 34 }, (_, i) => ({ a: i / 34 * Math.PI * 2 + (r() - 0.5) * 0.15, l: 0.95 + r() * 0.35, c: (r() - 0.5) * 0.5 }));
      const spores = Array.from({ length: 22 }, () => ({ a: r() * Math.PI * 2, d: 0.25 + r() * 0.5, s: 0.5 + r() * 0.6 }));
      const label = makeLabel(P, uiG, portrait);
      const cast = makeCast(P, actorG, seed, portrait, portrait ? 0.62 : 0.5);
      const qT = makeQ(uiG, K);
      const G = portrait ? 1150 : 940;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          // camera: drift, slow push-in towards a dish point, slow spin of the dish
          const zz = P.zoom || [1, 1.08], u = progIO(lt, 0, Math.max(1, dur)), z = lerp(zz[0], zz[1], u) * (1 + 0.03 * pk);
          const fc = P.focus ? U(P.focus[0], P.focus[1]) : [CX, CY];
          const fx = lerp(CX, fc[0], u), fy = lerp(CY, fc[1], u);
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 6)}) translate(${f1(CX)} ${f1(CY)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          dishG.setAttribute('transform', `rotate(${f1((P.spin ?? 0.6) * lt)} ${f1(CX)} ${f1(CY)})`);
          // table hatching below the dish
          let th = '';
          for (let i = 0; i < 9; i++) { const y = CY + R * 1.12 + i * 14 * K; if (portrait && y > 1160) break; const x0 = CX - R * (1.05 - i * 0.05), x1 = CX + R * (1.08 - i * 0.04); th += inkPath([[x0, y], [x1, y + 3]], O(10 + i, { w: 3, amp: 1.2 })) + ' '; }
          for (let i = 0; i < 7; i++) { const a = -0.4 + i * 0.13; th += inkPath([U(-1.25 + i * 0.05, 0.6 + a), U(-1.1 + i * 0.05, 0.75 + a)], O(30 + i, { w: 3 })) + ' '; }
          tableR.setAttribute('d', th);
          shadow.setAttribute('cx', f1(CX + 16)); shadow.setAttribute('cy', f1(CY + 22)); shadow.setAttribute('rx', f1(R * 1.04)); shadow.setAttribute('ry', f1(R * 1.04));
          // glass + agar
          glassF.setAttribute('d', inkLoop(circ(R, 1), O(1, { amp: 1.2 })));
          agarF.setAttribute('d', inkLoop(circ(R * 0.9, 2), O(2, { amp: 1.2 })));
          // mould growth + clear ring
          const mAt = Mo ? atOr(cues, Mo.at, Math.max(0.3, dur * 0.3)) : null;
          const grow = Mo ? (lt >= mAt ? Math.min(1.04, spring(lt, mAt, 1.3)) : 0) * (1 + 0.025 * Math.sin(t * 1.7)) : 0;
          const hAt = Ha ? atOr(cues, Ha.at, Math.max(0.6, dur * 0.55)) : null;
          const hOpen = Ha && lt >= hAt ? spring(lt, hAt, 1.6) : 0;
          const HR = Mo && Ha ? Mo.r * Ha.k : 0;
          const hr = lerp(Mo ? Mo.r : 0, HR, Math.min(1, hOpen));
          if (Ha && hOpen > 0.001) {
            const c = U(Mo.x, Mo.y), rr = hr * R;
            haloF.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], rr, rr, sd + 5, 22, 0, 0.04), O(5, { amp: 1.2 })));
            // dashed ring: short ink dashes around the clear zone (crawl slowly)
            let dd = '';
            const nD = 26;
            for (let i = 0; i < nD; i++) {
              const a0 = i / nD * Math.PI * 2 + t * 0.12, a1 = a0 + Math.PI * 2 / nD * 0.55;
              const pts = [0, 0.5, 1].map(s => { const a = lerp(a0, a1, s); return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]; });
              dd += inkPath(pts, O(60 + i, { w: 4.5, amp: 1 })) + ' ';
            }
            haloR.setAttribute('d', dd);
          } else { haloF.setAttribute('d', ''); haloR.setAttribute('d', ''); }
          // colonies (alive: gold with a highlight; inside the clear ring: shrinking pale ghosts)
          let cf = '', cr = '', ch = '', gf = '', gr = '';
          cols.forEach(c => {
            let k = 1 + 0.06 * Math.sin(t * 1.3 + c.ph);
            let dead = 0;
            if (Ha && hOpen > 0 && c.dm < HR + c.rad) {
              const when = hAt + 0.15 + 1.1 * clamp01((c.dm - Mo.r) / Math.max(0.01, HR - Mo.r));
              dead = sm((lt - when) / 0.5);
            } else if (Ha && c.dm < HR * 1.25 && hOpen > 0) {
              k *= lerp(1, 0.8, Math.min(1, hOpen));      // just outside: stunted
            }
            const p = U(c.u, c.v), rad = c.rad * R * k * lerp(1, 0.55, dead);
            const pts = inkEllipsePts(p[0], p[1], rad, rad * 0.94, sd + 100 + c.k, 9, c.ph, 0.08);
            if (dead > 0.5) { gf += inkLoop(pts, O(100 + c.k, { amp: 0.8 })) + ' '; gr += inkPath(pts, O(100 + c.k, { w: 2.5, closed: true, amp: 0.8 })) + ' '; }
            else {
              cf += inkLoop(pts, O(100 + c.k, { amp: 0.8 })) + ' ';
              cr += inkPath(pts, O(100 + c.k, { w: rad > 22 ? 4 : 3, closed: true, amp: 0.8 })) + ' ';
              if (rad > 14) ch += inkDot(p[0] - rad * 0.3, p[1] - rad * 0.32, rad * 0.28, rad * 0.2, sd + 400 + c.k, t, 0.4) + ' ';
            }
          });
          colF.setAttribute('d', cf); colR.setAttribute('d', cr); colHi.setAttribute('d', ch);
          colGhost.setAttribute('d', gf); colGhostR.setAttribute('d', gr);
          // mould: white fuzzy rim, blue-green body, dark core, radiating hyphae, pale spore dots
          if (Mo && grow > 0.01) {
            const c = U(Mo.x, Mo.y), mr = Mo.r * R * grow;
            moldO.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], mr * 1.08, mr * 1.05, sd + 6, 20, 0.3, 0.1), O(6, { amp: 2 })));
            moldM.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], mr * 0.84, mr * 0.8, sd + 7, 18, 1.1, 0.12), O(7, { amp: 1.6 })));
            moldC.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], mr * 0.42, mr * 0.4, sd + 8, 12, 0.5, 0.15), O(8, { amp: 1.2 })));
            let hd = '';
            hy.forEach((h, i) => {
              const sw = Math.sin(t * 0.9 + i) * 0.04;
              const a = h.a + sw, l = mr * h.l * (1 + 0.04 * Math.sin(t * 1.4 + i * 0.7));
              const p0 = [c[0] + Math.cos(a) * mr * 0.5, c[1] + Math.sin(a) * mr * 0.5];
              const pm = [c[0] + Math.cos(a + h.c * 0.3) * l * 0.82, c[1] + Math.sin(a + h.c * 0.3) * l * 0.82];
              const p1 = [c[0] + Math.cos(a + h.c * 0.5) * l * 1.16, c[1] + Math.sin(a + h.c * 0.5) * l * 1.16];
              hd += inkPath([p0, pm, p1], O(200 + i, { w: Math.max(2.5, 3.5 * K), amp: 1, taper: 0.6 })) + ' ';
            });
            moldH.setAttribute('d', hd);
            moldR.setAttribute('d', inkPath(inkEllipsePts(c[0], c[1], mr * 0.84, mr * 0.8, sd + 7, 18, 1.1, 0.12), O(7, { w: 4.5, closed: true, amp: 1.6 })));
            let sp = '';
            spores.forEach((s, i) => { const a = s.a + t * 0.05, d = s.d * mr; sp += inkDot(c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d, 5 * s.s * K + 2, 5 * s.s * K + 2, sd + 300 + i, t, 0.5) + ' '; });
            moldS.setAttribute('d', sp);
          } else { [moldO, moldM, moldC, moldH, moldR, moldS].forEach(e => e.setAttribute('d', '')); }
          // glass rim: two rings + a sweeping glint (the light moves over the lid)
          rimR.setAttribute('d', inkPath(circ(R, 1), O(1, { w: 7, closed: true, amp: 1.2 })) + ' ' + inkPath(circ(R * 0.9, 2), O(2, { w: 4, closed: true, amp: 1.2 })) + ' ' +
            inkPath(circ(R * 0.955, 3), O(3, { w: 2.5, closed: true, amp: 1 })));
          const ga = -2.35 + Math.sin(lt * 0.45) * 0.35 - (P.spin ?? 0.6) * lt * Math.PI / 180;
          const arc = (a0, a1, rr) => { const p = []; for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8); p.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]); } return p; };
          glint.setAttribute('d', inkPath(arc(ga, ga + 0.55, R * 0.93), O(500, { w: 12 * K, amp: 0.8, taper: 0.9 })));
          glint2.setAttribute('d', inkPath(arc(ga + 0.75, ga + 0.95, R * 0.93), O(501, { w: 8 * K, amp: 0.8, taper: 0.9 })));
          // cast, label, "?"
          const heads = updateCast(cast, lt, t, dur, cues, W, H, G, sd + 9000);
          const arrowTo = label && label.L.arrow ? (() => {   // dish point -> screen (through spin + camera)
            const a = (P.spin ?? 0.6) * lt * Math.PI / 180, q = [label.L.arrow[0] * R, label.L.arrow[1] * R];
            const rq = [CX + q[0] * Math.cos(a) - q[1] * Math.sin(a), CY + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
            return [CX + (rq[0] - fx) * z + Math.sin(lt * 0.35) * 8, CY + (rq[1] - fy) * z + Math.cos(lt * 0.27) * 6];
          })() : null;
          updateLabel(label, lt, t, cues, W, H, sd, portrait, arrowTo);
          const fig = heads.find(h => h && !h.isK);
          updateQ(qT, P.question ? atOr(cues, P.question, null) : null, lt, t, fig ? [fig.x + 40, fig.y] : [CX, CY - R * 0.2], sd);
        },
      };
    },
  };

  // ================================================================ labbench: Fleming's laboratory
  SH.labbench = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.8;
      const sd = seed * 1000 + 29;
      const G = portrait ? 1140 : 930;                       // floor line (feet)
      const BY = G - (portrait ? 250 : 210) * K;             // bench top
      const BX0 = (P.bench_x0 ?? 0.36) * W, BX1 = W + 40;
      const root = el(svg, 'g'), world = el(root, 'g');
      // back wall: wainscot, shelf with bottles, clock, door
      const wallR = mk(world, INK.inkSoft);
      const doorF = mk(world, INK.paperDark), doorR = mk(world);
      const bottlesF = [INK.gold, INK.green, INK.blue, INK.red, INK.paperLight, INK.gold].map(c => mk(world, c, { 'fill-opacity': 0.8 }));
      const bottlesR = mk(world);
      const clockF = mk(world, INK.paperLight), clockR = mk(world);
      // bench
      const benchF = mk(world, INK.paperDark), benchR = mk(world);
      const stackEls = Array.from({ length: Math.min(12, P.stack ?? 6) }, () => ({ side: mk(world, INK.paperDark), sideR: mk(world), top: mk(world, INK.paperLight), agar: mk(world, AGAR), ring: mk(world) }));
      const stackM = mk(world, MOLD);
      const micF = mk(world, INK.inkSoft), micR = mk(world);
      const burnF = mk(world, INK.inkSoft), burnR = mk(world), flameF = mk(world, INK.blue, { 'fill-opacity': 0.85 }), flameI = mk(world, INK.paperLight);
      const flaskL = mk(world, INK.gold), flaskG = mk(world, INK.paperLight, { 'fill-opacity': 0.5 }), flaskR = mk(world), bub = mk(world, INK.paperLight);
      const smoke = Array.from({ length: 5 }, () => ({ f: mk(world, INK.paperLight, { 'fill-opacity': 0 }), r: mk(world, INK.inkSoft, { 'fill-opacity': 0 }) }));
      const actorG = el(world, 'g');
      const floorR = mk(world, INK.inkSoft);
      const uiG = el(root, 'g');
      const cast = makeCast(P, actorG, seed, portrait, portrait ? 0.78 : 0.6);
      const label = makeLabel(P, uiG, portrait);
      const qT = makeQ(uiG, K);
      const r = rng(seed * 31 + 7);
      const bottles = Array.from({ length: 6 }, (_, i) => ({ x: W * (0.42 + i * 0.09) + (r() - 0.5) * 20, h: (70 + r() * 60) * K, w: (34 + r() * 16) * K, neck: r() < 0.5, lv: 0.4 + r() * 0.4 }));
      const SHY = portrait ? 560 : 330;
      const stackN = P.stack ?? 6, stackX = (P.stack_x ?? 0.62) * W;
      const flask = P.flask ? Object.assign({ x: 0.56, at: 'fail' }, typeof P.flask === 'object' ? P.flask : {}) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? 1.06, u) * (1 + 0.02 * pk);
          const fx = (Cm.focus ? Cm.focus[0] : 0.55) * W, fy = (Cm.focus ? Cm.focus[1] : 0.5) * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // wall: wainscot rail, faint tiles below it, shelf
          let wd = inkPath([[-40, BY - 120 * K], [W + 40, BY - 124 * K]], O(1, { w: 4 })) + ' ';
          for (let x = 20; x < W; x += 120 * K) wd += inkPath([[x, BY - 110 * K], [x + 2, BY - 8]], O(2 + x, { w: 2.5, amp: 1 })) + ' ';
          wd += inkPath([[W * 0.38, SHY], [W + 40, SHY - 3]], O(3, { w: 8 })) + ' ' + inkPath([[W * 0.42, SHY], [W * 0.44, SHY + 40]], O(4, { w: 5 })) + ' ' + inkPath([[W * 0.92, SHY], [W * 0.9, SHY + 40]], O(5, { w: 5 }));
          wallR.setAttribute('d', wd);
          // bottles on the shelf
          let br = '';
          bottles.forEach((b, i) => {
            const y = SHY - 4, x = b.x, body = [[x - b.w / 2, y], [x - b.w / 2, y - b.h * 0.7], [x - b.w * 0.2, y - b.h * 0.82], [x - b.w * 0.2, y - b.h], [x + b.w * 0.2, y - b.h], [x + b.w * 0.2, y - b.h * 0.82], [x + b.w / 2, y - b.h * 0.7], [x + b.w / 2, y]];
            const liq = [[x - b.w / 2 + 4, y - 3], [x - b.w / 2 + 4, y - b.h * 0.7 * b.lv], [x + b.w / 2 - 4, y - b.h * 0.7 * b.lv - 2], [x + b.w / 2 - 4, y - 3]];
            bottlesF[i].setAttribute('d', inkLoop(liq, O(20 + i, { smooth: false, amp: 1 })));
            br += inkPath(body, O(30 + i, { w: 4.5, closed: true, smooth: false, amp: 1.2 })) + ' ';
          });
          bottlesR.setAttribute('d', br);
          // wall clock (ticking second hand)
          const ckx = W * 0.2, cky = portrait ? 470 : 250, ckr = 72 * K;
          clockF.setAttribute('d', inkCircle(ckx, cky, ckr, sd + 40, t, { fill: true }));
          let cr = inkCircle(ckx, cky, ckr, sd + 40, t, { w: 6 });
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cr += ' ' + inkPath([[ckx + Math.cos(a) * ckr * 0.78, cky + Math.sin(a) * ckr * 0.78], [ckx + Math.cos(a) * ckr * 0.9, cky + Math.sin(a) * ckr * 0.9]], O(41 + i, { w: 3, amp: 0.6 })); }
          const sa = Math.floor(lt * 2) / 2 * Math.PI / 15 - Math.PI / 2, ha = -2.0, ma = 0.4 + lt * 0.02;
          cr += ' ' + inkPath([[ckx, cky], [ckx + Math.cos(sa) * ckr * 0.82, cky + Math.sin(sa) * ckr * 0.82]], O(55, { w: 2.5, amp: 0.5 }));
          cr += ' ' + inkPath([[ckx, cky], [ckx + Math.cos(ma) * ckr * 0.7, cky + Math.sin(ma) * ckr * 0.7]], O(56, { w: 5, amp: 0.5 }));
          cr += ' ' + inkPath([[ckx, cky], [ckx + Math.cos(ha) * ckr * 0.45, cky + Math.sin(ha) * ckr * 0.45]], O(57, { w: 7, amp: 0.5 }));
          clockR.setAttribute('d', cr);
          // door (left)
          if (P.door !== false) {
            const dx0 = W * 0.03, dx1 = W * 0.27, dy0 = G - (portrait ? 520 : 400) * K;
            const dp = [[dx0, G], [dx0, dy0], [dx1, dy0 - 4], [dx1, G]];
            doorF.setAttribute('d', inkLoop(dp, O(60, { smooth: false })));
            doorR.setAttribute('d', inkPath(dp, O(60, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[dx0 + 24, dy0 + 30], [dx1 - 24, dy0 + 28], [dx1 - 24, dy0 + 190 * K], [dx0 + 24, dy0 + 192 * K]], O(61, { w: 3.5, closed: true, smooth: false })) +
              ' ' + inkDot(dx1 - 30, (dy0 + G) / 2 + 20, 9, 9, sd + 62, t));
          } else { doorF.setAttribute('d', ''); doorR.setAttribute('d', ''); }
          // bench: top slab + legs
          const top = [[BX0, BY], [BX1, BY - 3], [BX1, BY + 34 * K], [BX0, BY + 36 * K]];
          benchF.setAttribute('d', inkLoop(top, O(70, { smooth: false })));
          let bd = inkPath(top, O(70, { w: 6, closed: true, smooth: false }));
          for (const lx of [BX0 + 30, BX0 + (W - BX0) * 0.55]) bd += ' ' + inkPath([[lx, BY + 36 * K], [lx + 2, G]], O(71 + lx, { w: 9 }));
          bd += ' ' + inkPath([[BX0 + 30, G - 70 * K], [W + 40, G - 72 * K]], O(75, { w: 4 }));
          benchR.setAttribute('d', bd);
          // stack of culture dishes (the top one carries a tiny blue-green spot)
          if (stackN > 0) {
            // drawn bottom-up, one dish at a time, so each upper dish covers the rim of the one below
            const dw = 92 * K, dh = 20 * K;
            stackEls.forEach((e, i) => {
              if (i >= stackN) { e.side.setAttribute('d', ''); e.sideR.setAttribute('d', ''); e.top.setAttribute('d', ''); e.agar.setAttribute('d', ''); e.ring.setAttribute('d', ''); return; }
              const y = BY - 8 - i * dh * 1.25, x = stackX + Math.sin(i * 2.1) * 6;
              const side = [[x - dw, y], [x + dw, y], [x + dw, y + dh * 0.9], [x - dw, y + dh * 0.9]];
              e.side.setAttribute('d', inkLoop(side, O(100 + i, { smooth: false, amp: 0.6 })));
              e.sideR.setAttribute('d', inkPath([[x - dw, y], [x - dw, y + dh * 0.9]], O(104 + i * 3, { w: 4, amp: 0.5 })) + ' ' + inkPath([[x + dw, y], [x + dw, y + dh * 0.9]], O(105 + i * 3, { w: 4, amp: 0.5 })) + ' ' +
                inkPath(inkEllipsePts(x, y + dh * 0.9, dw, dh, sd + 120 + i, 24, 0, 0.004).filter(q => q[1] >= y + dh * 0.9 - 1).sort((a, b) => a[0] - b[0]), O(106 + i * 3, { w: 4, amp: 0.5 })));
              const ring = inkEllipsePts(x, y, dw, dh, sd + 80 + i, 24, 0, 0.004);
              e.top.setAttribute('d', inkLoop(ring, O(80 + i, { amp: 0.6 })));
              e.agar.setAttribute('d', inkLoop(inkEllipsePts(x, y, dw * 0.82, dh * 0.62, sd + 90 + i, 20, 0, 0.004), O(90 + i, { amp: 0.6 })));
              e.ring.setAttribute('d', inkPath(ring, O(80 + i, { w: 4, closed: true, amp: 0.6 })));
            });
            const ty = BY - 8 - (stackN - 1) * dh * 1.25;
            stackM.setAttribute('d', P.stack_mold === false ? '' : inkDot(stackX - 20 * K, ty - 1, 36 * K * (1 + 0.08 * Math.sin(t * 2)), 12 * K, sd + 110, t, 0.6));
          }
          // microscope (right)
          if (P.microscope !== false) {
            const mx = W * 0.86, my = BY - 4, s = K;
            const base = [[mx - 70 * s, my], [mx + 70 * s, my - 2], [mx + 60 * s, my - 26 * s], [mx - 60 * s, my - 24 * s]];
            const arm = [[mx + 30 * s, my - 26 * s], [mx + 38 * s, my - 120 * s], [mx + 10 * s, my - 190 * s]];
            const tube = [[mx - 30 * s, my - 230 * s], [mx + 4 * s, my - 238 * s], [mx + 20 * s, my - 150 * s], [mx - 12 * s, my - 142 * s]];
            micF.setAttribute('d', inkLoop(base, O(120, { smooth: false })) + ' ' + inkLoop(tube, O(121, { smooth: false })));
            micR.setAttribute('d', inkPath(base, O(120, { w: 5, closed: true, smooth: false })) + ' ' + inkPath(tube, O(121, { w: 5, closed: true, smooth: false })) + ' ' +
              inkPath(arm, O(122, { w: 12 })) + ' ' + inkPath([[mx - 50 * s, my - 90 * s], [mx + 34 * s, my - 92 * s]], O(123, { w: 7 })) + ' ' + inkPath([[mx + 2 * s, my - 142 * s], [mx + 4 * s, my - 106 * s]], O(124, { w: 6 })));
          }
          // Bunsen burner with a flickering flame
          if (P.burner !== false) {
            const bx = (P.burner_x ?? 0.47) * W, by = BY - 4, s = K;
            const bp = [[bx - 40 * s, by], [bx + 40 * s, by], [bx + 30 * s, by - 18 * s], [bx + 9 * s, by - 22 * s], [bx + 8 * s, by - 110 * s], [bx - 8 * s, by - 110 * s], [bx - 9 * s, by - 22 * s], [bx - 30 * s, by - 18 * s]];
            burnF.setAttribute('d', inkLoop(bp, O(130, { smooth: false })));
            burnR.setAttribute('d', inkPath(bp, O(130, { w: 4.5, closed: true, smooth: false })));
            const fl = 1 + 0.18 * Math.sin(t * 13) + 0.1 * Math.sin(t * 29 + 1), sway = Math.sin(t * 7) * 4;
            const fp = [[bx - 14 * s, by - 112 * s], [bx - 12 * s, by - 150 * s * fl], [bx + sway, by - 196 * s * fl], [bx + 12 * s, by - 150 * s * fl], [bx + 14 * s, by - 112 * s]];
            flameF.setAttribute('d', inkLoop(fp, O(131, { amp: 1.5 })));
            flameI.setAttribute('d', inkLoop([[bx - 6 * s, by - 114 * s], [bx + sway * 0.5, by - 150 * s * fl], [bx + 6 * s, by - 114 * s]], O(132, { amp: 1 })));
          }
          // flask of mould juice: bubbles; on the cue it boils over, darkens and smokes
          if (flask) {
            const fx2 = flask.x * W, fy2 = BY - 4, s = K * 1.15, fAt = atOr(cues, flask.at, dur * 0.6), fail = lt >= fAt ? sm((lt - fAt) / 0.8) : 0;
            const body = [[fx2 - 80 * s, fy2], [fx2 - 22 * s, fy2 - 120 * s], [fx2 - 22 * s, fy2 - 200 * s], [fx2 + 22 * s, fy2 - 200 * s], [fx2 + 22 * s, fy2 - 120 * s], [fx2 + 80 * s, fy2]];
            const lv = lerp(0.62, 0.3, fail), ly = fy2 - 120 * s * lv;
            const lw = 80 * s - (fy2 - ly) / (120 * s) * 58 * s;
            const liq = [[fx2 - 76 * s, fy2 - 4], [fx2 - lw, ly + Math.sin(t * 6) * 3], [fx2, ly - 3 + Math.sin(t * 5 + 1) * 3], [fx2 + lw, ly + Math.sin(t * 7) * 3], [fx2 + 76 * s, fy2 - 4]];
            flaskL.setAttribute('fill', mix(INK.gold, INK.inkSoft, fail));
            flaskL.setAttribute('d', inkLoop(liq, O(140, { amp: 1 })));
            flaskG.setAttribute('d', inkLoop(body, O(141, { smooth: false, amp: 1 })));
            flaskR.setAttribute('d', inkPath(body, O(141, { w: 5.5, closed: true, smooth: false, amp: 1.2 })) + ' ' + inkPath([[fx2 - 30 * s, fy2 - 200 * s], [fx2 + 30 * s, fy2 - 202 * s]], O(142, { w: 7 })));
            let bb = '';
            for (let i = 0; i < 7; i++) {
              const ph = (t * (0.7 + fail * 1.6) + i / 7) % 1, x = fx2 + Math.sin(i * 2.7) * 40 * s * (1 - ph * 0.6), y = fy2 - 10 - ph * (fy2 - ly - 10);
              bb += inkDot(x, y, (5 + (i % 3) * 2) * s, (5 + (i % 3) * 2) * s, sd + 150 + i, t, 0.5) + ' ';
            }
            bub.setAttribute('d', bb);
            smoke.forEach((sm2, k) => {
              const age = lt - fAt - k * 0.18;
              if (age < 0) { sm2.f.setAttribute('fill-opacity', 0); sm2.r.setAttribute('fill-opacity', 0); return; }
              const ph = (age / 1.8) % 1, R2 = (22 + ph * 42 + k * 4) * s, cx = fx2 + Math.sin(t * 1.5 + k) * 14 + ph * 26 * (k % 2 ? 1 : -1), cy = fy2 - 205 * s - ph * Math.min(180 * s, fy2 - 205 * s - SHY - 70);
              const pts = inkEllipsePts(cx, cy, R2, R2 * 0.85, sd + 160 + k, 11);
              const a = (1 - ph) * 0.9;
              sm2.f.setAttribute('d', inkLoop(pts, O(160 + k, { amp: 1.5 }))); sm2.f.setAttribute('fill-opacity', f1(a * 10) / 10);
              sm2.r.setAttribute('d', inkPath(pts, O(160 + k, { w: 3.5, closed: true, amp: 1.5 }))); sm2.r.setAttribute('fill-opacity', f1(a * 10) / 10);
            });
          }
          // floor boards (stay above the caption band)
          let fd = inkPath([[-40, G + 6], [W + 40, G + 2]], O(180, { w: 5 }));
          for (let i = 0; i < 6; i++) fd += ' ' + inkPath([[W * (0.05 + i * 0.17), G + 14], [W * (0.12 + i * 0.17), G + 14]], O(181 + i, { w: 3, amp: 1 }));
          floorR.setAttribute('d', fd);
          // cast, label, "?"
          const heads = updateCast(cast, lt, t, dur, cues, W, H, G, sd + 9000);
          updateLabel(label, lt, t, cues, W, H, sd, portrait, null);
          const fig = heads.find(h => h && !h.isK);
          const qa = P.question ? atOr(cues, P.question, null) : (flask ? atOr(cues, flask.at, null) : null);
          updateQ(qT, qa != null ? qa + 0.15 : null, lt, t, fig ? [fig.x + 70 * K, fig.y - 150 * K] : null, sd);
        },
      };
    },
  };
})();
