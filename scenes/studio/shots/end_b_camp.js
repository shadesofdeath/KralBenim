// end_b_camp: life on the drifting Weddell Sea ice, 1915-1916, in parchment ink (theme "parchment", BRAND.md §5).
// Two shot types; every line boils at 8 Hz through _ink.js, everything is a pure function of lt (no Math.random):
//
//   end_b_ice — side view of a flat ice floe: far pressure ridges on the horizon, hatched floe, optional low sun.
//     mode "drag":  a lifeboat on a sledge is hauled by a rope team (bereted sailors) over hummocks, the world
//                   barely moves; Kaşif pushes at the stern; far "land" hills on the right.
//     mode "night": polar night camp: hatched sky, a moon that runs through its phases (months pass), bell tents,
//                   two sailors shivering in sleeping bags, a blubber stove with smoke, Kaşif sitting and
//                   shivering by it; a seal (cue "seal") and a penguin (cue "penguin") turn up.
//     mode "crack": the floe edge with open water; a jagged crack runs through the ice (cue "crack"), the piece
//                   with the three boats drifts off; on cue "launch" the boats slide into the sea and row away.
//   P: {mode, horizon: 0.5, sun: true, from: 0.33, to: 0.36 (drag: boat x), land: true (drag: far hills + label),
//       kasif: {x, y, pose, at: cue|s, then, dir, face: 1|-1, emotion, scale: 0.5},
//       labels: [{text, x, y, at, size: 64, color: "ink"|"red"|"blue", font: "hand"|"serif", arrow: [x, y]}],
//       zoom: 1.05, focus: [0.5, 0.6]}
//   cues: crack, launch, seal, penguin, jolt (drag: boat bumps), shiver (night: shivering gets stronger),
//         labels[].at, kasif.at
//
//   end_b_plates — Frank Hurley and his glass-plate negatives on the ice: box camera on a tripod, a crate of
//     glass plates, Hurley (beret, short beard) holding one plate up to the light; on cue "keep" most plates in the
//     crate fade and get a red cross, three get a blue check; on cue "prints" the three kept plates fly up and
//     become pinned sepia prints (ship in the ice, the camp, the boat hauling); Kaşif points up at them.
//   P: {kasif: {...}, labels: [...], hurley: {x: 0.42, scale: 0.56}}   cues: keep, prints, labels[].at, kasif.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const COL = { ink: I.ink, red: I.red, blue: I.blue, gold: I.gold, green: I.green, soft: I.inkSoft };
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const tcue = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);

  // ordered pool of filled paths (painter's order kept per frame)
  function painter(parent) {
    const els = []; let n = 0, T = 0;
    const get = () => { const e = els[n] || (els[n] = el(parent, 'path', { stroke: 'none' })); n++; e.style.display = ''; return e; };
    const P = {
      begin(t) { n = 0; T = t; },
      end() { for (let i = n; i < els.length; i++) els[i].style.display = 'none'; },
      fill(pts, col, k, o = {}) {
        const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkLoop(pts, { seed: k, t: T, amp: o.amp ?? 1.2, smooth: o.smooth !== false }));
      },
      line(pts, w, k, o = {}) {
        const e = get(); e.setAttribute('fill', o.col || I.ink); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false, taper: o.taper }));
      },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? o.op })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
    };
    return P;
  }
  const ell = (cx, cy, rx, ry, k, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, k, n, rot, 0.04);
  const tf = (pts, x, y, s = 1, a = 0) => { const c = Math.cos(a), si = Math.sin(a); return pts.map(q => [x + (q[0] * c - q[1] * si) * s, y + (q[0] * si + q[1] * c) * s]); };

  // hand-written / serif labels with underline + optional arrow
  function labels(parent, list, W, H, seed) {
    return (list || []).map((L, i) => {
      const g = el(parent, 'g');
      const serif = L.font === 'serif';
      const t = el(g, 'text', { 'font-family': serif ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-size': L.size || 64,
        'font-weight': serif ? 900 : 400, 'text-anchor': 'middle', fill: COL[L.color] || I.ink,
        style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
      t.textContent = L.text;
      const u = el(g, 'path', { fill: COL[L.color] || I.ink, stroke: 'none' });
      const ar = L.arrow ? el(g, 'path', { fill: COL[L.color] || I.ink, stroke: 'none' }) : null;
      const strike = L.strike ? el(g, 'path', { fill: I.red, stroke: 'none' }) : null;
      return { L, g, t, u, ar, strike, k: seed * 13 + i * 7 };
    });
  }
  function drawLabels(ls, lt, t, cues, W, H) {
    for (const o of ls) {
      const L = o.L, at = tcue(L.at, cues, 0.2), sp = spring(lt, at, 0.6);
      const x = L.x * W, y = L.y * H, b = boil(o.k, t, 1);
      o.g.style.display = lt < at ? 'none' : '';
      if (lt < at) continue;
      o.t.setAttribute('transform', `translate(${inkF1(x + b[0])} ${inkF1(y + b[1])}) rotate(${(L.rot ?? -2) + b[0] * 0.3}) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
      const tw = o.t.getComputedTextLength ? o.t.getComputedTextLength() : 200, pu = prog(lt, at + 0.2, 0.45);
      o.u.setAttribute('d', pu > 0.02 ? inkPath([[x - tw / 2, y + 20], [x - tw / 2 + tw * pu * 0.5, y + 25], [x - tw / 2 + tw * pu, y + 18]], { w: 6, seed: o.k + 1, t }) : '');
      if (o.ar) {
        const tx = L.arrow[0] * W, ty = L.arrow[1] * H, sx = tx < x - tw / 2 ? x - tw / 2 - 14 : tx > x + tw / 2 ? x + tw / 2 + 14 : x, sy = (tx >= x - tw / 2 && tx <= x + tw / 2) ? y + 40 : y - 20;
        const pa = prog(lt, at + 0.3, 0.45), mx = (sx + tx) / 2 + (tx > sx ? 30 : -30), my = Math.min(sy, ty) - 20;
        const q = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * pa; q.push([(1 - v) * (1 - v) * sx + 2 * v * (1 - v) * mx + v * v * tx, (1 - v) * (1 - v) * sy + 2 * v * (1 - v) * my + v * v * ty]); }
        let d = pa > 0.02 ? inkPath(q, { w: 6, seed: o.k + 2, t }) : '';
        if (pa > 0.95) { const e = q[10], f = q[8], an = Math.atan2(e[1] - f[1], e[0] - f[0]); d += ' ' + inkPath([[e[0] - 28 * Math.cos(an - 0.5), e[1] - 28 * Math.sin(an - 0.5)], e, [e[0] - 28 * Math.cos(an + 0.5), e[1] - 28 * Math.sin(an + 0.5)]], { w: 6, seed: o.k + 3, t, smooth: false }); }
        o.ar.setAttribute('d', d);
      }
      if (o.strike) {
        const sa = tcue(L.strike, cues, 1e9), ps = prog(lt, sa, 0.35);
        o.strike.setAttribute('d', ps > 0.02 ? inkPath([[x - tw / 2 - 10, y - 14], [x - tw / 2 - 10 + (tw + 20) * ps, y - 26]], { w: 8, seed: o.k + 4, t }) : '');
      }
    }
  }
  // Kaşif helper: {x, y, pose, at, then, dir, face, emotion, scale}
  function kasifOf(parent, K, seed, H, extra = {}) {
    if (!K) return null;
    const rig = KASIF.create(el(parent, 'g'), Object.assign({ scale: K.scale || 0.5, hat: true, seed: seed + 5 }, extra));
    return { K, rig };
  }
  // pose states: base pose, then K.then at K.at, then K.seq [{at, pose, dir, face, emotion}]
  function states(K, cues) {
    const st = [{ at: -1e9, pose: K.pose || 'idle', dir: K.dir ?? 20, face: K.face ?? 1, emotion: K.emotion0 || 'neutral', text: K.text0, item: K.item0 }];
    if (K.at != null) st.push({ at: tcue(K.at, cues, 1e9), pose: K.then || 'point', dir: K.dir_then ?? K.dir ?? 20, face: K.face_then ?? K.face ?? 1, emotion: K.emotion || 'surprised', text: K.text, item: K.item });
    for (const s of K.seq || []) st.push({ at: tcue(s.at, cues, 1e9), pose: s.pose, dir: s.dir ?? K.dir ?? 20, face: s.face ?? K.face ?? 1, emotion: s.emotion || 'neutral', text: s.text, item: s.item });
    return st.sort((a, b) => a.at - b.at);
  }
  function kasifUpdate(k, lt, t, cues, W, H, over = {}) {
    if (!k) return null;
    const K = k.K, st = states(K, cues);
    let i = 0; while (i + 1 < st.length && lt >= st[i + 1].at) i++;
    const c = st[i], pv = st[i - 1], since = i ? lt - c.at : lt;
    const o = Object.assign({ x: K.x * W, y: (K.y ?? 0.8) * H, face: c.face, since, dir: c.dir, emotion: c.emotion, ph: lt / 0.9, text: c.text, item: c.item }, over);
    if (pv && since < 0.3) { o.prev = { pose: pv.pose, since: i > 1 ? c.at - pv.at : c.at, dir: pv.dir, emotion: pv.emotion, ph: c.at / 0.9 }; o.mix = since / 0.3; }
    return k.rig.update(t, c.pose, o);
  }

  // ---------------------------------------------------------------- shared floe background
  function floeBG(P, W, H, seed, night) {
    const r = rng(seed * 7 + 3), hy = (P.horizon ?? 0.5) * H;
    const ridge = []; for (let x = -60; x <= W + 60; x += 48) ridge.push([x, hy - 8 - r() * 26 - (r() < 0.25 ? 26 : 0)]);
    const bergs = night ? [] : [[0.72 + r() * 0.05, 70, 230], [0.2 + r() * 0.06, 46, 150]].map(([u, h, w]) => ({ x: u * W, h, w }));
    const dashes = []; for (let i = 0; i < 46; i++) { const y = hy + 30 + Math.pow(r(), 0.8) * (H * 0.9 - hy - 30); const x = r() * W, L = 30 + r() * 60 * (y / H); dashes.push([x, y, L]); }
    const hatch = []; for (let i = 0; i < 46; i++) { const x = W * 0.28 + r() * W * 0.8, y = 20 + r() * (hy - 60); hatch.push([x, y, 60 + r() * 90]); }
    const stars = []; for (let i = 0; i < 16; i++) stars.push([W * (0.3 + r() * 0.68), 40 + r() * (hy - 140), r() * 6]);
    const clouds = []; for (let i = 0; i < 3; i++) clouds.push([W * (0.25 + i * 0.3 + r() * 0.08), hy * (0.25 + r() * 0.3), 0.7 + r() * 0.6]);
    return { hy, ridge, bergs, dashes, hatch, stars, clouds };
  }
  function drawBG(pt, B, lt, W, H, seed, o) {
    const { hy } = B;
    if (o.night) {
      B.hatch.forEach(([x, y, L], i) => pt.line([[x, y], [x - L * 0.55, y + L * 0.5]], 2.6, seed * 3 + i, { col: I.inkSoft, op: 0.55, amp: 0.8 }));
      B.stars.forEach(([x, y, ph], i) => { const s = 9 + 4 * Math.sin(lt * 2.4 + ph); pt.line([[x - s, y], [x + s, y]], 3, seed * 5 + i * 2, { amp: 0.5 }); pt.line([[x, y - s], [x, y + s]], 3, seed * 5 + i * 2 + 1, { amp: 0.5 }); });
    } else {
      if (o.sun !== false) {
        const sx = W * (o.sunX ?? 0.84), sy = hy - 130;
        pt.shape(ell(sx, sy, 46, 46, seed + 1), I.paperLight, 5, seed + 1, { lc: I.gold });
        for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + lt * 0.15, r0 = 62, r1 = 84 + 6 * Math.sin(lt * 3 + k); pt.line([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], 4, seed * 7 + k, { col: I.gold, amp: 0.6 }); }
      }
      B.clouds.forEach(([x0, y, s], i) => { const x = x0 + lt * 9 * s; pt.line([[x - 130 * s, y], [x - 60 * s, y - 8], [x + 20 * s, y + 2], [x + 120 * s, y - 6]], 3, seed * 9 + i, { col: I.inkSoft, op: 0.7 }); pt.line([[x - 80 * s, y + 18], [x + 60 * s, y + 16]], 2.5, seed * 9 + i + 50, { col: I.inkSoft, op: 0.5 }); });
    }
    // far ridges + bergs
    pt.shape([...B.ridge, [W + 60, hy + 12], [-60, hy + 12]], I.paperLight, 3, seed * 11, { lc: I.inkSoft, smooth: false, amp: 1 });
    B.bergs.forEach((b, i) => pt.shape([[b.x - b.w / 2, hy + 4], [b.x - b.w / 2 + 12, hy - b.h], [b.x + b.w / 2 - 8, hy - b.h - 4], [b.x + b.w / 2, hy + 4]], I.paperLight, 4, seed * 13 + i, { lc: I.inkSoft, smooth: false }));
  }
  function drawFloeHatch(pt, B, lt, W, H, seed, scroll = 0, x1 = W + 100) {
    B.dashes.forEach(([x0, y, L], i) => {
      let x = x0 - scroll * (0.4 + y / H); x = ((x % (W + 200)) + W + 200) % (W + 200) - 100;
      if (x > x1) return;
      pt.line([[x, y], [x + L * 0.5, y - 2], [x + L, y]], 3, seed * 17 + i, { col: I.inkSoft, op: 0.75, amp: 0.8 });
    });
  }
  // small lifeboat (side view, ~260 units long, origin waterline centre) with heads and oars
  function smallBoat(pt, x, y, s, a, lt, k, crew = 3, row = 0) {
    const hull = [[-130, -40], [0, -36], [130, -50], [136, -26], [110, 4], [0, 14], [-110, 6], [-134, -14]];
    for (let i = 0; i < crew; i++) {          // heads (bereted)
      const hx = -70 + i * 60, hy0 = -64 + Math.sin(lt * 3 + i) * 2;
      const P0 = tf([[hx, hy0]], x, y, s, a)[0];
      pt.shape(ell(P0[0], P0[1], 17 * s, 17 * s, k + i), I.paperLight, 4, k + i);
      pt.fill(tf([[hx - 18, hy0 - 6], [hx - 8, hy0 - 22], [hx + 14, hy0 - 22], [hx + 20, hy0 - 8]], x, y, s, a), I.blue, k + 10 + i);
      pt.line(tf([[hx, hy0 + 16], [hx, hy0 + 40]], x, y, s, a), 5, k + 20 + i);
    }
    if (row) for (let i = 0; i < 2; i++) {    // oars sweep
      const ph = Math.sin(lt * 4.2 + i * 0.4) * 0.5, ox = -30 + i * 70;
      pt.line(tf([[ox, -40], [ox - 60 + ph * 60, 30], [ox - 90 + ph * 80, 46]], x, y, s, a), 5, k + 30 + i);
    }
    pt.shape(tf(hull, x, y, s, a), I.paperDark, 5, k + 40);
    pt.line(tf([[-120, -24], [0, -20], [120, -32]], x, y, s, a), 3, k + 41, { col: I.inkSoft });
  }

  // ---------------------------------------------------------------- end_b_ice
  SH.end_b_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'drag', night = mode === 'night';
      const B = floeBG(P, W, H, seed, night);
      const root = el(svg, 'g');
      const back = painter(el(root, 'g'));
      let moon = null;
      if (night) {      // moon phases: a dark disc slides across, clipped to the moon
        const cid = 'endbmoon' + seed;
        const cp = el(ctx.defs || svg, 'clipPath', { id: cid });
        el(cp, 'circle', { cx: 0.82 * W, cy: 0.2 * H, r: 54 });
        moon = painter(el(root, 'g', { 'clip-path': `url(#${cid})` }));
      }
      const mid = painter(el(root, 'g'));
      const castG = el(root, 'g'), front = painter(el(root, 'g'));
      const lg = el(svg, 'g');
      const LS = labels(lg, P.labels, W, H, seed);
      const r = rng(seed * 31 + 7);
      let kas = null; const team = [];
      if (mode === 'drag') {
        for (let i = 0; i < 4; i++) team.push(KASIF.create(el(castG, 'g'), { scale: 0.44, hat: false, accessory: 'beret', beard: i % 2 ? 'short' : null, seed: seed + 20 + i }));
        kas = kasifOf(castG, P.kasif || { x: 0.11, y: 0.8, pose: 'walk', at: 'stop', then: 'shrug', emotion: 'worried' }, seed, H);
      } else if (mode === 'night') {
        kas = kasifOf(castG, P.kasif || { x: 0.62, y: 0.8, pose: 'sit', at: 'shiver', then: 'sit', emotion: 'worried', emotion0: 'worried' }, seed, H);
      } else if (mode === 'camp') {
        kas = kasifOf(castG, P.kasif, seed, H);
      } else {
        kas = kasifOf(castG, P.kasif || { x: 0.3, y: 0.82, pose: 'idle', at: 'crack', then: 'shock', face: 1 }, seed, H);
      }
      // static scatter
      const others = (P.cast || []).map((m, i) => kasifOf(castG, m, seed + 40 + i * 9, H, { hat: false, accessory: m.accessory || 'beret', beard: m.beard || null, scale: m.scale || 0.5 }));
      const hummocks = []; for (let i = 0; i < 7; i++) hummocks.push([r() * (W + 400), H * (0.66 + r() * 0.22), 40 + r() * 60]);
      const flakes = []; for (let i = 0; i < 34; i++) flakes.push([r() * W, r() * H, 0.5 + r()]);
      const chunks = []; for (let i = 0; i < 6; i++) chunks.push([0.68 + r() * 0.3, 0.62 + r() * 0.24, 30 + r() * 40]);
      const crackPts = []; { let x = 0.5 * W, y = 0.97 * H; crackPts.push([x, y]); while (y > B.hy + 30) { y -= 40 + r() * 30; x += (r() - 0.55) * 60; crackPts.push([x, Math.max(B.hy + 8, y)]); } }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))), fx = (P.focus ? P.focus[0] : 0.5) * W, fy = (P.focus ? P.focus[1] : 0.6) * H;
          root.setAttribute('transform', `translate(${inkF1(Math.sin(lt * 0.35) * 6)} ${inkF1(Math.cos(lt * 0.27) * 4)}) translate(${fx} ${fy}) scale(${z.toFixed(4)}) translate(${-fx} ${-fy})`);
          for (const p of [back, mid, front]) p.begin(t);
          drawBG(back, B, lt, W, H, seed, { night, sun: P.sun !== false && !night, sunX: P.sunX });
          if (mode === 'drag') {
            const hy = B.hy, gy = 0.8 * H, scroll = lt * 26;
            if (P.land !== false) {   // far land on the right horizon
              const lx = 0.86 * W;
              back.shape([[lx - 160, hy + 2], [lx - 90, hy - 50], [lx - 40, hy - 34], [lx + 10, hy - 76], [lx + 80, hy - 40], [lx + 200, hy - 20], [lx + 260, hy + 2]], I.paperDark, 3, seed + 61, { lc: I.inkSoft, op: 0.8 });
            }
            drawFloeHatch(back, B, lt, W, H, seed, scroll);
            // hummocks scroll by (the team plods, the ice slides back slowly)
            hummocks.forEach(([x0, y, s], i) => {
              const x = ((x0 - scroll * (0.6 + y / H)) % (W + 400) + W + 400) % (W + 400) - 200;
              back.shape([[x - s, y], [x - s * 0.5, y - s * 0.55], [x + s * 0.2, y - s * 0.7], [x + s, y]], I.paperLight, 4, seed * 19 + i, { lc: I.inkSoft });
            });
            const u = progIO(lt, 0, Math.max(1, dur)), bx = lerp(P.from ?? 0.31, P.to ?? 0.34, u) * W;
            const jolt = punch(lt, cue(cues, 'jolt', null), 0.8);
            const ang = (Math.sin(lt * 1.9) * 2.6 + Math.sin(lt * 0.7) * 1.4 - jolt * 6) * Math.PI / 180, by = gy - 34 - Math.abs(Math.sin(lt * 1.9)) * 10;
            // runner tracks
            mid.line([[-40, gy - 4], [bx - 260, gy - 6]], 4, seed + 70, { col: I.inkSoft });
            mid.line([[-40, gy + 10], [bx - 250, gy + 8]], 4, seed + 71, { col: I.inkSoft });
            // sledge + hull (local units, boat ~560 px)
            const S = 1.0;
            mid.line(tf([[-250, 30], [240, 30], [290, 4]], bx, by, S, ang), 8, seed + 72);
            [-170, -40, 90, 210].forEach((xx, i) => mid.line(tf([[xx, 30], [xx, 6]], bx, by, S, ang), 6, seed + 73 + i));
            const hull = [[-280, -96], [0, -88], [270, -120], [286, -78], [250, -20], [140, 6], [-160, 6], [-260, -20], [-290, -60]];
            mid.shape(tf(hull, bx, by, S, ang), I.paperDark, 6, seed + 80);
            [26, 52].forEach((off, i) => mid.line(tf([[-262 + off * 0.5, -92 + off], [0, -86 + off], [256 - off, -114 + off * 1.2]], bx, by, S, ang), 3.5, seed + 81 + i, { col: I.inkSoft }));
            const bow = tf([[276, -100]], bx, by, S, ang)[0];
            // rope team
            let lead = null;
            team.forEach((rig, i) => {
              const hx = bx + 380 + i * 128, ph = lt / 1.5 + i * 0.27;
              const res = rig.update(t, 'walk', { x: hx, y: gy, face: 1, ph, since: lt, emotion: i % 2 ? 'worried' : 'neutral' });
              const s = 0.44, hand = res.hands[1];
              const w = [hx + s * hand[0], gy + s * hand[1]];
              mid.line([lead || bow, w], 4, seed + 90 + i, { col: I.inkSoft });
              lead = w;
            });
            if (kas) {
              const K = kas.K, at = tcue(K.at, cues, 1e9), walking = lt < at;
              kasifUpdate(kas, lt, t, cues, W, H, { x: K.x * W + (walking ? Math.sin(lt * 2) * 6 : 0), ph: lt / 1.5 });
            }
            // foreground snow drift
            front.shape([[-40, H * 0.9], [W * 0.3, H * 0.875], [W * 0.62, H * 0.895], [W + 40, H * 0.88], [W + 40, H + 30], [-40, H + 30]], I.paperLight, 4, seed + 99, { lc: I.inkSoft, op: 1 });
          } else if (mode === 'night') {
            const hy = B.hy;
            // moon runs through its phases: months pass
            const mx = 0.82 * W, my = 0.2 * H, R = 52, ph = lt * (P.moon_speed ?? 0.9);
            moon.begin(t);
            moon.fill(ell(mx, my, R, R, seed + 1, 16), I.paperLight, seed + 1, { amp: 0.6 });
            moon.fill(ell(mx + Math.cos(ph) * R * 2.1, my, R * 1.02, R * 1.06, seed + 2, 16), I.paperDark, seed + 2, { amp: 0.6 });
            moon.line(ell(mx, my, R, R, seed + 1, 16), 4, seed + 1, { closed: true, amp: 0.6 });
            moon.end();
            drawFloeHatch(back, B, lt, W, H, seed, 0);
            const shiverK = 1 + 1.5 * prog(lt, cue(cues, 'shiver', 1e9), 0.4);
            // tents
            const tents = P.tents || [0.12, 0.3, 0.46];
            tents.forEach((u, i) => {
              const x = u * W, y = H * (0.7 + (i % 2) * 0.03), w = 250 - i * 14, h = 200 - i * 12;
              mid.line([[x - w * 0.62, y + 4], [x, y - h + 4]], 3, seed + 110 + i, { col: I.inkSoft });
              mid.line([[x + w * 0.62, y + 4], [x, y - h + 4]], 3, seed + 120 + i, { col: I.inkSoft });
              mid.shape([[x - w / 2, y], [x - w * 0.3, y - h * 0.62], [x, y - h], [x + w * 0.3, y - h * 0.62], [x + w / 2, y]], I.paperLight, 5, seed + 130 + i);
              mid.shape([[x - 30, y], [x, y - h * 0.55], [x + 30, y]], I.paperDark, 4, seed + 140 + i, { smooth: false });
              mid.line([[x, y - h], [x + 2, y - h - 34]], 6, seed + 150 + i);
            });
            // sailors shivering in sleeping bags
            [[0.21, 0.83], [0.37, 0.86]].forEach(([u, v], i) => {
              const j = Math.sin(t * 38 + i * 2) * 2.2 * shiverK, x = u * W + j, y = v * H;
              mid.shape([[x - 130, y], [x - 120, y - 46], [x + 60, y - 52], [x + 110, y - 36], [x + 112, y + 4], [x - 120, y + 10]], I.paperDark, 5, seed + 160 + i);
              [-60, -10, 40].forEach((xx, q) => mid.line([[x + xx, y - 46], [x + xx + 6, y + 6]], 3, seed + 170 + i * 4 + q, { col: I.inkSoft }));
              const hx = x - 142, hy2 = y - 34;
              mid.shape(ell(hx, hy2, 34, 32, seed + 180 + i), I.paperLight, 5, seed + 180 + i);
              mid.fill([[hx - 34, hy2 - 10], [hx - 26, hy2 - 40], [hx + 10, hy2 - 46], [hx + 36, hy2 - 22], [hx + 30, hy2 - 12]], I.blue, seed + 185 + i);
              mid.dot(hx - 10, hy2 + 2, 4, I.ink, seed + 190 + i); mid.dot(hx + 10, hy2 + 2, 4, I.ink, seed + 192 + i);
              mid.line([[hx - 14, hy2 - 12], [hx - 4, hy2 - 16]], 3, seed + 194 + i); mid.line([[hx + 6, hy2 - 16], [hx + 16, hy2 - 12]], 3, seed + 196 + i);
              for (let b = 0; b < 3; b++) { const uu = ((lt * 0.6 + b / 3 + i * 0.4) % 1), rr = 8 + uu * 18; mid.line(ell(hx - 50 - uu * 40, hy2 - 10 - uu * 70, rr, rr * 0.8, seed + 200 + b, 10), 2.5, seed + 200 + b + i * 5, { closed: true, col: I.inkSoft, op: 1 - uu }); }
            });
            // blubber stove + smoke + flame
            const sx = 0.72 * W, sy = 0.8 * H;
            mid.shape([[sx - 40, sy], [sx - 40, sy - 80], [sx + 40, sy - 80], [sx + 40, sy]], I.inkSoft, 5, seed + 210, { smooth: false });
            mid.line([[sx + 10, sy - 80], [sx + 12, sy - 150]], 12, seed + 211);
            const fl = 0.7 + 0.3 * Math.sin(t * 13);
            mid.shape([[sx - 16, sy - 20], [sx - 6, sy - 20 - 40 * fl], [sx + 2, sy - 34], [sx + 12, sy - 22 - 30 * fl], [sx + 18, sy - 20]], I.gold, 3, seed + 212, { lc: I.red });
            for (let b = 0; b < 4; b++) { const uu = ((lt * 0.35 + b / 4) % 1), rr = 14 + uu * 40; mid.line(ell(sx + 12 + Math.sin(uu * 6 + b) * 20 + uu * 50, sy - 160 - uu * 200, rr, rr * 0.8, seed + 220 + b, 12), 3, seed + 220 + b, { closed: true, col: I.inkSoft, op: 1 - uu * 0.8 }); }
            if (kas) {
              const sv = Math.sin(t * 33) * 3 * shiverK;
              kasifUpdate(kas, lt, t, cues, W, H, { x: kas.K.x * W + sv, face: 1 });
            }
            // seal + penguin
            const aS = cue(cues, 'seal', 1e9), pS = spring(lt, aS, 0.7);
            if (lt >= aS) {
              const x = 0.83 * W, y = 0.84 * H, s = lerp(0.3, 1, pS), wob = Math.sin(t * 2) * 2;
              const seal = [[-110, 0], [-60, -40], [20, -52], [70, -44], [100, -24], [110, -2], [40, 6], [-40, 6]];
              front.shape(tf(seal, x, y, s, wob * 0.01), I.inkSoft, 5, seed + 230);
              front.shape(tf([[-110, 0], [-150, -24], [-142, 14]], x, y, s), I.inkSoft, 4, seed + 231, { smooth: false });
              front.dot(x + 78 * s, y - 34 * s, 4, I.paperLight, seed + 232);
              front.line(tf([[104, -18], [134, -24]], x, y, s), 2.5, seed + 233); front.line(tf([[104, -12], [136, -10]], x, y, s), 2.5, seed + 234);
              front.shape(tf([[0, -6], [-20, 22], [16, 16]], x, y, s), I.inkSoft, 4, seed + 235, { smooth: false });
            }
            const aP = cue(cues, 'penguin', 1e9), pP = spring(lt, aP, 0.7);
            if (lt >= aP) {
              const x = 0.93 * W, y = 0.8 * H, s = lerp(0.3, 1, pP), a = Math.sin(t * 5) * 0.06;
              front.shape(tf([[-34, 0], [-40, -70], [-26, -120], [0, -136], [24, -120], [38, -70], [32, 0]], x, y, s, a), I.inkSoft, 5, seed + 240);
              front.shape(tf([[-20, -6], [-26, -66], [-12, -104], [14, -104], [24, -66], [18, -6]], x, y, s, a), I.paperLight, 3, seed + 241);
              front.dot(...tf([[-6, -118]], x, y, s, a)[0], 4, I.ink, seed + 242);
              front.shape(tf([[-28, -116], [-50, -110], [-28, -104]], x, y, s, a), I.gold, 3, seed + 243, { smooth: false });
              front.shape(tf([[-20, 0], [-34, 8], [-6, 8]], x, y, s, a), I.gold, 3, seed + 244, { smooth: false });
              front.shape(tf([[6, 0], [-2, 8], [26, 8]], x, y, s, a), I.gold, 3, seed + 245, { smooth: false });
            }
            // falling snow
            flakes.forEach(([x0, y0, s], i) => { const y = (y0 + lt * 60 * s) % (H * 0.9), x = x0 + Math.sin(lt + i) * 20, q = 6 * s; front.line([[x - q, y - q], [x + q, y + q]], 2.5, seed * 3 + i, { col: I.inkSoft, amp: 0.4 }); front.line([[x - q, y + q], [x + q, y - q]], 2.5, seed * 5 + i, { col: I.inkSoft, amp: 0.4 }); });
          } else if (mode === 'camp') {
            drawFloeHatch(back, B, lt, W, H, seed, 0);
            (P.tents || []).forEach(([u, v, sc], i) => {
              const x = u * W, y = v * H, w = 240 * sc, h = 190 * sc;
              mid.shape([[x - w / 2, y], [x - w * 0.3, y - h * 0.62], [x, y - h], [x + w * 0.3, y - h * 0.62], [x + w / 2, y]], I.paperLight, 5 * Math.max(0.6, sc), seed + 360 + i);
              mid.shape([[x - 24 * sc, y], [x, y - h * 0.5], [x + 24 * sc, y]], I.paperDark, 4 * Math.max(0.6, sc), seed + 365 + i, { smooth: false });
              mid.line([[x, y - h], [x + 2, y - h - 30 * sc]], 5 * Math.max(0.6, sc), seed + 370 + i);
            });
            if (P.radio) {     // a radio mast that is crossed out: no radio
              const Rd = P.radio, x = Rd.x * W, y = Rd.y * H, at = tcue(Rd.at, cues, 0.3), sp = spring(lt, at, 0.6);
              if (lt >= at) {
                const s2 = lerp(0.5, 1, sp);
                mid.line([[x, y], [x, y - 230 * s2]], 7, seed + 380);
                mid.line([[x - 60 * s2, y], [x, y - 120 * s2], [x + 60 * s2, y]], 5, seed + 381);
                for (let k = 0; k < 3; k++) { const rr = (40 + k * 34) * s2, pts = []; for (let j = 0; j <= 8; j++) { const a = -0.7 + j / 8 * 1.4; pts.push([x + Math.sin(a) * rr, y - 230 * s2 - Math.cos(a) * rr + rr]); } mid.line(pts.map(q => [q[0], q[1] - rr * 0.9]), 4, seed + 382 + k, { col: I.inkSoft }); }
                const xa = tcue(Rd.cross, cues, at + 0.6), c1 = prog(lt, xa, 0.3), c2 = prog(lt, xa + 0.25, 0.3), Y0 = y - 300 * s2, Y1 = y - 20;
                if (c1 > 0) front.line([[x - 90, Y0], [lerp(x - 90, x + 90, c1), lerp(Y0, Y1, c1)]], 12, seed + 390, { col: I.red });
                if (c2 > 0) front.line([[x + 90, Y0], [lerp(x + 90, x - 90, c2), lerp(Y0, Y1, c2)]], 12, seed + 391, { col: I.red });
              }
            }
            (P.coins || []).forEach((cn, i) => {
              const at = tcue(cn.at, cues, 1 + i * 0.3); if (lt < at) return;
              const fall = clamp01((lt - at) / 0.45), x = cn.x * W, gy0 = (cn.y ?? 0.8) * H, y = lerp(gy0 - 160, gy0, fall * fall) - (fall >= 1 ? Math.abs(Math.sin((lt - at - 0.45) * 9)) * 14 * Math.exp(-(lt - at - 0.45) * 4) : 0);
              const k = Math.abs(Math.cos(lt * 1.6 + i)) * 0.8 + 0.2, r0 = 34 * (cn.scale || 1);
              front.shape(ell(x, y - r0, r0 * k, r0, seed + 400 + i, 14), I.gold, 5, seed + 400 + i);
              front.line(ell(x, y - r0, r0 * k * 0.7, r0 * 0.7, seed + 410 + i, 12), 3, seed + 410 + i, { closed: true });
            });
            others.forEach(o => kasifUpdate(o, lt, t, cues, W, H));
            if (kas) kasifUpdate(kas, lt, t, cues, W, H);
          } else {   // crack
            const hy = B.hy, ex = (P.edge ?? 0.64) * W;
            const aC = cue(cues, 'crack', 1e9), pc = prog(lt, aC, 0.9), gap = progIO(lt, aC + 0.7, 2.2) * 70;
            const aL = cue(cues, 'launch', 1e9);
            // open water (behind everything) with waves
            back.shape([[ex - 200, hy + 2], [W + 60, hy + 2], [W + 60, H + 30], [ex - 200, H + 30]], I.paperDark, 4, seed + 300, { smooth: false, lc: I.inkSoft });
            for (let k = 0; k < 18; k++) { const y = hy + 24 + (k % 6) * 60, x = ex + 30 + ((k * 137 + lt * 30) % (W - ex)); back.line([[x, y], [x + 16, y - 6], [x + 32, y], [x + 48, y - 6]], 3, seed + 310 + k, { col: I.inkSoft, op: 0.85 }); }
            chunks.forEach(([u, v, s], i) => { const x = u * W + Math.sin(lt * 0.6 + i) * 8, y = v * H + Math.sin(lt * 1.3 + i) * 4; back.shape([[x - s, y], [x - s * 0.7, y - s * 0.5], [x + s * 0.6, y - s * 0.55], [x + s, y]], I.paperLight, 4, seed + 320 + i, { lc: I.inkSoft, smooth: false }); });
            // left floe (up to the crack) and the right piece (crack .. edge), drifting apart
            const cpts = crackPts.slice().reverse();          // horizon -> bottom
            const leftFloe = [[-60, hy + 2], ...cpts.map(q => [q[0], q[1]]), [-60, H + 30]];
            const rightPiece = [...crackPts, [ex - 30, hy + 2], [ex + 10, H * 0.55], [ex - 20, H * 0.75], [ex + 20, H + 30]];
            const rp = rightPiece.map(q => [q[0] + gap, q[1] + Math.sin(lt * 1.1) * 3 * (gap / 70)]);
            mid.shape(rp, I.paperLight, 5, seed + 330, { smooth: false, lc: I.inkSoft });
            mid.shape(leftFloe, I.paperLight, 5, seed + 331, { smooth: false, lc: I.inkSoft });
            drawFloeHatch(mid, B, lt, W, H, seed, 0, crackPts[0][0] - 60);
            // crack drawing (progressive), dark gap water
            if (pc > 0) {
              const n = Math.max(2, Math.ceil(crackPts.length * pc)), cp = crackPts.slice(0, n);
              mid.line(cp, 8, seed + 340);
              for (let b = 1; b < n - 1; b += 2) mid.line([cp[b], [cp[b][0] + (b % 4 ? 30 : -34), cp[b][1] - 22]], 4, seed + 350 + b);
            }
            // tents on the left floe
            [[0.08, 0.66, 0.8], [0.18, 0.69, 0.66]].forEach(([u, v, s], i) => {
              const x = u * W, y = v * H, w = 240 * s, h = 190 * s;
              mid.shape([[x - w / 2, y], [x - w * 0.3, y - h * 0.62], [x, y - h], [x + w * 0.3, y - h * 0.62], [x + w / 2, y]], I.paperLight, 5, seed + 360 + i);
              mid.shape([[x - 24 * s, y], [x, y - h * 0.5], [x + 24 * s, y]], I.paperDark, 4, seed + 365 + i, { smooth: false });
            });
            // three boats: resting on the right piece, slide into the water on "launch", then row away
            const homes = [[0.555, 0.68], [0.6, 0.76], [0.565, 0.86]], dest = [[0.78, 0.6], [0.86, 0.68], [0.8, 0.79]];
            homes.forEach(([u, v], i) => {
              const pl = progIO(lt, aL + i * 0.35, 3.2), x = lerp(u * W + gap, dest[i][0] * W, pl) + (pl > 0.99 ? (lt - aL - 3.5) * 22 : 0), y = lerp(v * H, dest[i][1] * H, pl);
              const s = lerp(0.62 + i * 0.06, 0.5 + i * 0.05, pl), bob = pl > 0.2 ? Math.sin(lt * 2.2 + i) * 4 : 0;
              smallBoat(front, x, y + bob, s, (pl > 0.05 && pl < 0.3 ? 0.12 : Math.sin(lt * 1.6 + i) * 0.03 * pl), lt, seed * 50 + i * 60, 3, pl > 0.3 ? 1 : 0);
            });
            if (kas) kasifUpdate(kas, lt, t, cues, W, H);
          }
          for (const p of [back, mid, front]) p.end();
          drawLabels(LS, lt, t, cues, W, H);
        },
      };
    },
  };

  // ---------------------------------------------------------------- end_b_plates
  SH.end_b_plates = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = floeBG(Object.assign({ horizon: 0.56 }, P), W, H, seed, false);
      const root = el(svg, 'g');
      const back = painter(el(root, 'g')), mid = painter(el(root, 'g'));
      const castG = el(root, 'g'), front = painter(el(root, 'g'));
      const lg = el(svg, 'g');
      const LS = labels(lg, P.labels, W, H, seed);
      const HU = P.hurley || {};
      const hurley = KASIF.create(el(castG, 'g'), { scale: HU.scale || 0.56, hat: false, accessory: 'beret', beard: 'short', seed: seed + 31 });
      const kas = kasifOf(castG, P.kasif || { x: 0.66, y: 0.82, pose: 'idle', at: 'prints', then: 'point', dir: 62, face: 1, emotion: 'happy', scale: 0.52 }, seed, H);
      const gy = 0.82 * H;
      const NP = 9, kept = [1, 4, 7];
      const prints = [{ x: 0.6, y: 0.27, rot: -4 }, { x: 0.75, y: 0.24, rot: 3 }, { x: 0.9, y: 0.28, rot: -2 }];
      const pw = 250, ph = 180;
      function sketch(pt, i, cx, cy, s, a, k) {    // tiny sepia picture inside a print
        const T = pts => tf(pts, cx, cy, s, a);
        if (i === 0) {        // ship locked in ice
          pt.line(T([[-100, 40], [100, 40]]), 3, k, { col: I.inkSoft });
          pt.shape(T([[-70, 30], [70, 26], [56, 46], [-56, 48]]), I.paperDark, 3, k + 1);
          [-40, 0, 40].forEach((x, q) => pt.line(T([[x, 28], [x + 4, -60]]), 3, k + 2 + q));
          pt.line(T([[-60, -30], [60, -34]]), 2.5, k + 6, { col: I.inkSoft });
          pt.line(T([[-100, 52], [-70, 44], [-40, 54], [0, 46], [50, 56], [100, 46]]), 2.5, k + 7, { col: I.inkSoft });
        } else if (i === 1) { // the camp
          [[-50, 0.9], [20, 0.7], [70, 0.55]].forEach(([x, s2], q) => pt.shape(T([[x - 40 * s2, 40], [x, 40 - 70 * s2], [x + 40 * s2, 40]]), I.paperLight, 3, k + q, { smooth: false }));
          pt.line(T([[-100, 44], [100, 40]]), 3, k + 5, { col: I.inkSoft });
          pt.line(T([[90, 40], [90, -40]]), 3, k + 6); pt.fill(T([[90, -40], [118, -32], [90, -24]]), I.red, k + 7);
        } else {              // boat hauling
          pt.shape(T([[-90, 20], [10, 22], [20, 0], [-80, -2]]), I.paperDark, 3, k);
          [30, 60, 90].forEach((x, q) => { pt.line(T([[x, 40], [x + 6, 0]]), 3, k + 2 + q); pt.dot(...T([[x + 8, -8]])[0], 7 * s, I.ink, k + 6 + q); });
          pt.line(T([[20, 8], [96, 4]]), 2, k + 9, { col: I.inkSoft });
          pt.line(T([[-100, 44], [100, 40]]), 3, k + 10, { col: I.inkSoft });
        }
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur)));
          root.setAttribute('transform', `translate(${inkF1(Math.sin(lt * 0.35) * 6)} ${inkF1(Math.cos(lt * 0.27) * 4)}) translate(${W * 0.45} ${H * 0.6}) scale(${z.toFixed(4)}) translate(${-W * 0.45} ${-H * 0.6})`);
          for (const p of [back, mid, front]) p.begin(t);
          drawBG(back, Object.assign({}, B, { bergs: [] }), lt, W, H, seed, { sun: true, sunX: 0.42 });
          drawFloeHatch(back, B, lt, W, H, seed, 0);
          const aK = cue(cues, 'keep', 1e9), pk = prog(lt, aK, 0.6);
          const aP = cue(cues, 'prints', 1e9);
          // tripod camera
          const cx = 0.1 * W, cy = 0.5 * H;
          [[-70, 0], [0, 4], [70, 0]].forEach(([dx], i) => mid.line([[cx, cy + 40], [cx + dx, gy]], 6, seed + 400 + i));
          mid.shape([[cx - 70, cy - 50], [cx + 50, cy - 54], [cx + 54, cy + 40], [cx - 66, cy + 44]], I.paperDark, 6, seed + 410, { smooth: false });
          mid.shape([[cx + 50, cy - 30], [cx + 96, cy - 40], [cx + 96, cy + 26], [cx + 50, cy + 20]], I.inkSoft, 5, seed + 411, { smooth: false });
          mid.shape(ell(cx + 110, cy - 6, 22, 30, seed + 412), I.paperLight, 5, seed + 412);
          mid.dot(cx + 112, cy - 6, 9, I.ink, seed + 413);
          mid.line([[cx - 40, cy - 54], [cx - 20, cy - 74], [cx + 10, cy - 74]], 5, seed + 414);
          // crate of glass plates
          const bx = 0.27 * W, bw = 240, bh = 120;
          const plates = [];
          for (let i = 0; i < NP; i++) {
            const isK = kept.includes(i), x = bx - bw / 2 + 22 + i * 24, lean = (i - NP / 2) * 0.05;
            const lift = isK ? lerp(0, 34, spring(lt, aK, 0.6)) : 0;
            const fly = isK ? progIO(lt, aP + kept.indexOf(i) * 0.18, 0.9) : 0;
            if (fly >= 0.999) continue;
            const pr = prints[Math.max(0, kept.indexOf(i))];
            const px = lerp(x, pr.x * W, fly), py = lerp(gy - bh - 50 - lift, pr.y * H, fly), s = lerp(1, 2.2, fly);
            const pts = tf([[-14, -64], [14, -64], [14, 64], [-14, 64]], px, py, s, lean * (1 - fly));
            const fade = !isK && pk > 0 ? lerp(1, 0.4, pk) : 1;
            const pp = fly > 0 ? front : back;
            plates.push(() => {
              pp.shape(pts, I.paperLight, 3, seed + 420 + i, { lc: isK && pk > 0 ? I.blue : I.inkSoft, op: fade });
              pp.line([pts[0], [pts[0][0] + 10, pts[0][1] + 30]], 2.5, seed + 440 + i, { col: I.blue, op: fade * 0.8 });
            });
          }
          plates.forEach(f => f());
          mid.shape([[bx - bw / 2, gy], [bx - bw / 2, gy - bh], [bx + bw / 2, gy - bh - 4], [bx + bw / 2, gy]], I.paperDark, 6, seed + 450, { smooth: false });
          [0.33, 0.66].forEach((v, i) => mid.line([[bx - bw / 2 + 6, gy - bh * v], [bx + bw / 2 - 6, gy - bh * v - 2]], 4, seed + 451 + i, { col: I.inkSoft }));
          if (pk > 0) {   // red cross over the crate (left behind)
            const c = prog(lt, aK + 0.25, 0.3), c2 = prog(lt, aK + 0.5, 0.3);
            if (c > 0) front.line([[bx - 90, gy - 120], [lerp(bx - 90, bx + 90, c), lerp(gy - 120, gy - 10, c)]], 10, seed + 460, { col: I.red });
            if (c2 > 0) front.line([[bx + 90, gy - 120], [lerp(bx + 90, bx - 90, c2), lerp(gy - 120, gy - 10, c2)]], 10, seed + 461, { col: I.red });
          }
          // pinned prints
          prints.forEach((pr, i) => {
            const at = aP + i * 0.18 + 0.85, p = spring(lt, at, 0.7);
            if (lt < at) return;
            const x = pr.x * W, y = pr.y * H, a = (pr.rot + (1 - p) * 8) * Math.PI / 180, s = lerp(0.8, 1, p) * (1 + 0.06 * punch(lt, at, 0.5));
            front.fill(tf([[-pw / 2 + 8, -ph / 2 + 10], [pw / 2 + 8, -ph / 2 + 10], [pw / 2 + 8, ph / 2 + 10], [-pw / 2 + 8, ph / 2 + 10]], x, y, s, a), I.ink, seed + 470 + i, { op: 0.16 });
            front.shape(tf([[-pw / 2, -ph / 2], [pw / 2, -ph / 2], [pw / 2, ph / 2], [-pw / 2, ph / 2]], x, y, s, a), I.paperLight, 4, seed + 475 + i, { smooth: false });
            front.line(tf([[-pw / 2 + 16, -ph / 2 + 16], [pw / 2 - 16, -ph / 2 + 16], [pw / 2 - 16, ph / 2 - 16], [-pw / 2 + 16, ph / 2 - 16]], x, y, s, a), 2.5, seed + 480 + i, { closed: true, smooth: false, col: I.inkSoft });
            sketch(front, i, x, y, s, a, seed * 7 + 500 + i * 20);
            front.dot(...tf([[0, -ph / 2 + 6]], x, y, s, a)[0], 11, I.red, seed + 490 + i);
          });
          // Hurley holds a plate up to the light
          const hx = (HU.x ?? 0.42) * W, hs = HU.scale || 0.56;
          const res = hurley.update(t, 'point', { x: hx, y: gy, face: -1, since: lt, dir: 48 + Math.sin(lt * 1.2) * 6, emotion: lt > aK ? 'happy' : 'neutral' });
          const hand = res.hands[1], wx = hx - hs * hand[0], wy = gy + hs * hand[1];
          front.shape(tf([[-26, -40], [26, -40], [26, 40], [-26, 40]], wx - 10, wy - 34, 1, -0.2), I.paperLight, 4, seed + 495, { lc: I.blue });
          front.line(tf([[-14, -30], [4, 6]], wx - 10, wy - 34, 1, -0.2), 3, seed + 496, { col: I.blue });
          if (kas) kasifUpdate(kas, lt, t, cues, W, H);
          for (const p of [back, mid, front]) p.end();
          drawLabels(LS, lt, t, cues, W, H);
        },
      };
    },
  };
})();
