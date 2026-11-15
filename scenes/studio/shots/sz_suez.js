// sz_suez: building the Suez Canal (1859-1869) and its afterlife, in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for the
// Stickstory long video ag-03-suez-canal (2026-11-15) but parametric. Tuned for 16:9 (1920×1080).
// Side views leave sky and ground to the scene's "set" (desert / night / ocean / sea / coast); aerial views, maps and
// desk close-ups paint their own full frame and want "set": false. Labels: MCB.labels (mcB__lib.js); Kaşif: KASIF.
//
// Common P: labels: [MCB label {text, x, y (0..1), at, size, color, stamp, arrow, font}], ground: 0.8 (0..1 H, = set.ground),
//   kasif: {x, y, scale, pose, at, then, dir, face, emotion, text, seq} | false,
//   counter: {x, y, from, to, at, dur, prefix, suffix, size, color}
//
// SHOTS.sz_harbor — Port Said roads.  mode "dark": night, moored ships with glowing lanterns; one warship with no lights
//   slides between them (P.ghost: {x: 0.1, to: 0.62}); "dawn": a dark gunboat sits first in line in front of the white
//   imperial yacht with flags (P.yacht_x, P.gun_x), a lighthouse on the breakwater.  Water is drawn from P.water (0..1 H).
// SHOTS.sz_canal — the canal through the desert, side view (water strip at P.ground).  mode "opening": masts and funnels
//   glide along the strip, crowds wave flags on the near bank; "flow": a dry trench, sea water rushes in from the left on
//   cue "flow"; "procession": a gunboat, the yacht and more ships in single file (P.names labels over them).
// SHOTS.sz_aerial — the canal from above.  mode "stuck": a giant container ship wedged diagonally bank to bank, tugs
//   pulling, an excavator digging at the bow; "queue": a long view, ships queueing at both ends (count grows to P.n).
// SHOTS.sz_dig — the corvée.  mode "march": a column of peasants with picks and baskets walks across the desert;
//   "trench": cut-away trench, diggers swing picks, basket carriers climb the bank and tip sand on the spoil heap;
//   "empty": the abandoned trench, baskets and picks lie in drifting sand, a smoke plume rises far away on cue "new";
//   "memory": a statue of Lesseps on a plinth at left, a row of anonymous diggers at right (cue "dg" lights them).
// SHOTS.sz_water — a camel caravan carries water jars along the dig; on cue "canal" a fresh-water canal draws in.
// SHOTS.sz_dredger — a steam dredger on the channel: a chain of iron buckets runs up its ladder and dumps mud down a
//   long chute onto the bank, funnel smoke.  P.close: true (bigger, closer, mud splashes).
// SHOTS.sz_levels — Napoleon's survey.  mode "survey": an engineer at a levelling instrument, a man holds the staff;
//   "high": cross-section of the isthmus, the Red Sea basin drawn ten meters higher, red "+10 m?" dimension, on cue
//   "flood" it spills toward the Nile; "fixed": on cue "wrong" the Red Sea drops to the same level, red stamp WRONG.
// SHOTS.sz_ancient — aerial: the Nile at left, the old canal to the Red Sea; a reed boat sails it; on cue "fill" sand
//   creeps over and fills the canal.
// SHOTS.sz_paper — desk close-ups (set false).  mode "concession": a scroll unrolls, lines write, red seal on cue "seal";
//   "shares": share certificates fan out one by one; "debt": a ledger, red numbers pile up, papers stack, stamp on cue.
// SHOTS.sz_beach — the beach of the future Port Said: Lesseps swings a pickaxe (cue "pick"), sand bursts, flags fly.
// SHOTS.sz_camp — night camp: tents glow from lanterns that go out one by one (cholera), P.n tents.
// SHOTS.sz_route — full-frame old chart of Europe, Africa and India (lon/lat, P.view: {lon0, lat0, k px/deg}); P.routes:
//   [{pts: [[lon, lat]...], at, dur, color: "red"|"soft", ship: true}], P.cities: [{name, lon, lat, at, dx, dy, color}],
//   P.measure: {from: [lon, lat], to: [lon, lat], at, text} (red dimension line), P.storm: [lon, lat].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const F1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { ink: I.ink, red: I.red, blue: I.blue, gold: I.gold, green: I.green, soft: I.inkSoft };
  const tc = (cues, v, fb) => v == null ? fb : typeof v === 'number' ? v : (cues && cues[v] != null ? cues[v] : fb);
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const ell = (cx, cy, rx, ry, k, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, k, n, rot, 0.04);
  const V = (deg, L) => [Math.sin(deg * Math.PI / 180) * L, Math.cos(deg * Math.PI / 180) * L];   // 0 = down, 90 = right, 180 = up
  const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1], ca = Math.cos(a), sa = Math.sin(a); return [c[0] + dx * ca - dy * sa, c[1] + dx * sa + dy * ca]; };

  // ---------------------------------------------------------------- pooled painter (painter's order per frame)
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
        e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false }));
      },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k + 1, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? 1 })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
    };
    return P;
  }
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ---------------------------------------------------------------- a posable stick man (same build as the KASIF rig)
  // o: {x, y (hip), s, torso: 180, arms: [[upper, fore], ...], legs: [[thigh, shin], ...], face: 1, cap: "wrap"|"top"|"bicorne"|null,
  //     beard, back (no face), dim (ink-soft lines)}  -> {head, hands: [[x, y], [x, y]], neck}
  function man(pt, o, k) {
    const s = o.s ?? 0.5, x = o.x, y = o.y, w = 14 * s, f = o.face ?? 1, lc = o.dim ? I.inkSoft : I.ink;
    const tv = V(o.torso ?? 180, 210 * s), neck = [x + tv[0], y + tv[1]];
    const hv = V(o.torso ?? 180, 74 * s), head = [neck[0] + hv[0], neck[1] + hv[1]];
    const sh = [lerp(x, neck[0], 0.9), lerp(y, neck[1], 0.9)];
    const limb = (p0, a1, a2, L1, L2) => { const v1 = V(a1, L1), p1 = [p0[0] + v1[0], p0[1] + v1[1]], v2 = V(a2, L2); return [p0, p1, [p1[0] + v2[0], p1[1] + v2[1]]]; };
    const legs = o.legs || [[-8, 0], [8, 0]], arms = o.arms || [[-12, -6], [12, 6]];
    legs.forEach((L, i) => { const pp = limb([x, y], L[0], L[1], 120 * s, 120 * s); pt.line(pp, w, k + i, { smooth: false, col: lc }); pt.dot(pp[2][0] + 8 * s * f, pp[2][1], 11 * s, lc, k + 10 + i); });
    if (o.robe) pt.shape([[neck[0] - 30 * s, neck[1] + 20 * s], [neck[0] + 30 * s, neck[1] + 20 * s], [x + 60 * s, y + 90 * s], [x - 60 * s, y + 90 * s]], o.robe, 5 * s, k + 30, { lc });
    pt.line([[x, y], neck], w * 1.05, k + 3, { col: lc });
    const hands = [];
    arms.forEach((A, i) => { const pp = limb(sh, A[0], A[1], 95 * s, 90 * s); pt.line(pp, w * 0.95, k + 4 + i, { smooth: false, col: lc }); pt.dot(pp[2][0], pp[2][1], 12 * s, lc, k + 12 + i); hands.push(pp[2]); });
    const r = 70 * s;
    if (o.beard) pt.fill(ell(head[0] + 6 * s * f, head[1] + r * 0.55, r * 0.62, r * 0.5, k + 20), I.inkSoft, k + 20, { op: 0.9 });
    pt.shape(ell(head[0], head[1], r, r, k + 21), I.paperLight, 9 * s, k + 21, { lc });
    if (!o.back) {
      pt.dot(head[0] + f * 10 * s, head[1] + 12 * s, 8 * s, lc, k + 22); pt.dot(head[0] + f * 38 * s, head[1] + 12 * s, 8 * s, lc, k + 23);
      if (o.mouth === 'o') pt.shape(ell(head[0] + f * 26 * s, head[1] + 40 * s, 8 * s, 11 * s, k + 29), lc, 3 * s, k + 29, { lc });
      else if (o.smile) pt.line([[head[0] + f * 10 * s, head[1] + 34 * s], [head[0] + f * 25 * s, head[1] + 46 * s], [head[0] + f * 40 * s, head[1] + 34 * s]], 4.5 * s, k + 27, { col: lc });
      else pt.line([[head[0] + f * 14 * s, head[1] + 40 * s], [head[0] + f * 36 * s, head[1] + (o.frown ? 44 : 40) * s]], 4 * s, k + 27, { smooth: false, col: lc });
      if (o.brows) { const d = o.brows === 'angry' ? 1 : -1; pt.line([[head[0] + f * 2 * s, head[1] - 8 * s - d * 6 * s], [head[0] + f * 20 * s, head[1] - 8 * s + d * 6 * s]], 4 * s, k + 31, { smooth: false, col: lc }); pt.line([[head[0] + f * 30 * s, head[1] - 8 * s + d * 6 * s], [head[0] + f * 48 * s, head[1] - 8 * s - d * 6 * s]], 4 * s, k + 32, { smooth: false, col: lc }); }
    }
    if (o.cap === 'wrap') {          // fellah's wrapped cap
      pt.shape([[head[0] - r * 1.02, head[1] - r * 0.2], [head[0] - r * 0.8, head[1] - r * 0.85], [head[0], head[1] - r * 1.12], [head[0] + r * 0.8, head[1] - r * 0.85], [head[0] + r * 1.02, head[1] - r * 0.2]], I.paperLight, 6 * s, k + 24, { lc });
      pt.line([[head[0] - r * 0.95, head[1] - r * 0.45], [head[0] + r * 0.95, head[1] - r * 0.45]], 4 * s, k + 26, { col: o.dim ? I.inkSoft : I.inkSoft });
    } else if (o.cap === 'top') {    // 1850s top hat
      pt.shape([[head[0] - r * 1.25, head[1] - r * 0.78], [head[0] + r * 1.25, head[1] - r * 0.78], [head[0] + r * 1.2, head[1] - r * 0.92], [head[0] - r * 1.2, head[1] - r * 0.92]], I.ink, 4 * s, k + 24, { smooth: false });
      pt.shape([[head[0] - r * 0.72, head[1] - r * 0.9], [head[0] + r * 0.72, head[1] - r * 0.9], [head[0] + r * 0.8, head[1] - r * 2.1], [head[0] - r * 0.8, head[1] - r * 2.1]], I.ink, 4 * s, k + 25, { smooth: false });
    } else if (o.cap === 'beret') {
      pt.shape(ell(head[0] + f * 8 * s, head[1] - r * 0.78, r * 1.05, r * 0.42, k + 24), I.blue, 5 * s, k + 24, { lc });
      pt.dot(head[0] + f * 8 * s, head[1] - r * 1.22, 9 * s, lc, k + 25);
    } else if (o.cap === 'bicorne') {
      pt.shape([[head[0] - r * 1.5, head[1] - r * 0.7], [head[0], head[1] - r * 1.9], [head[0] + r * 1.5, head[1] - r * 0.7], [head[0], head[1] - r * 0.95]], I.ink, 4 * s, k + 24);
    }
    return { head, hands, neck };
  }
  window.SZ_man = man; window.SZ_prog = prog; window.SZ_progIO = progIO;
  // picks, baskets, jars
  function pick(pt, hand, ang, s, k) {           // handle from the hands along ang (deg, V convention), iron head across the end
    const v = V(ang, 150 * s), e = [hand[0] + v[0], hand[1] + v[1]];
    pt.line([[hand[0] - v[0] * 0.15, hand[1] - v[1] * 0.15], e], 7 * s, k, { col: I.inkSoft });
    const n = V(ang + 90, 60 * s);
    pt.line([[e[0] - n[0], e[1] - n[1]], [e[0] + n[0] * 0.6, e[1] + n[1] * 0.6]], 10 * s, k + 1);
    return e;
  }
  function basket(pt, x, y, s, k, full = true) {
    pt.shape([[x - 50 * s, y - 36 * s], [x + 50 * s, y - 36 * s], [x + 36 * s, y + 30 * s], [x - 36 * s, y + 30 * s]], I.paperDark, 5 * s, k);
    for (let i = 0; i < 3; i++) pt.line([[x - 44 * s + i * 4 * s, y - 16 * s + i * 16 * s], [x + 44 * s - i * 4 * s, y - 16 * s + i * 16 * s]], 3 * s, k + 2 + i, { col: I.inkSoft });
    if (full) pt.fill([[x - 48 * s, y - 36 * s], [x - 20 * s, y - 62 * s], [x + 18 * s, y - 66 * s], [x + 48 * s, y - 36 * s]], I.gold, k + 6, { op: 0.75 });
  }
  // ---------------------------------------------------------------- ships (side views, facing right, y = waterline)
  // o: {hull: colour, lights: 0..1 (gold lanterns), flags: true, sails: true, funnel: true, masts: 3, dark: true}
  function steamer(pt, x, y, s, t, k, o = {}) {
    const L = 420 * s, roll = Math.sin(t * 1.1 + k) * 0.02;
    const R = (px, py) => rot([px, py], [x, y], roll);
    const hull = o.hull || I.ink;
    pt.shape([R(x - L / 2, y - 50 * s), R(x + L / 2 + 34 * s, y - 64 * s), R(x + L / 2 - 20 * s, y + 8 * s), R(x - L / 2 + 22 * s, y + 8 * s)], hull, 6 * s, k, { smooth: false, op: 0.96 });
    pt.line([R(x - L / 2 + 10 * s, y - 32 * s), R(x + L / 2, y - 42 * s)], 4 * s, k + 1, { col: hull === I.ink ? I.paperLight : I.gold });
    if (o.paddle) pt.shape(ell(x - 0.02 * L, y - 40 * s, 52 * s, 44 * s, k + 3), I.paperDark, 5 * s, k + 3);
    const masts = o.masts ?? 3;
    const ms = [[-0.3, 290], [0.06, 320], [0.32, 280]].slice(0, masts);
    ms.forEach(([u, h], i) => {
      const mx = x + u * L;
      pt.line([R(mx, y - 52 * s), R(mx, y - (52 + h) * s)], 6 * s, k + 4 + i, { col: o.dim ? I.inkSoft : I.ink });
      if (o.sails) for (let j = 0; j < 2; j++) { const yy = y - (120 + j * 80) * s, wd = (70 - j * 14) * s; pt.shape([R(mx - wd, yy), R(mx + wd, yy), R(mx + wd * 0.8, yy + 56 * s), R(mx - wd * 0.8, yy + 56 * s)], I.paperLight, 4 * s, k + 10 + i * 3 + j); }
      if (o.flags) { const fy = y - (52 + h) * s, wv = Math.sin(t * 6 + i) * 6 * s; const fc = [I.blue, I.paperLight, I.red][i % 3];
        pt.shape([R(mx, fy), R(mx + 70 * s, fy + 6 * s + wv), R(mx + 66 * s, fy + 44 * s + wv), R(mx, fy + 40 * s)], fc, 4 * s, k + 30 + i); }
    });
    if (o.lines !== false) pt.line([R(x - 0.3 * L, y - 342 * s), R(x + L / 2 + 34 * s, y - 66 * s)], 3 * s, k + 20, { col: I.inkSoft });
    if (o.funnel !== false) {
      const fx = x - 0.1 * L;
      pt.shape([R(fx - 18 * s, y - 52 * s), R(fx + 18 * s, y - 52 * s), R(fx + 16 * s, y - 150 * s), R(fx - 16 * s, y - 150 * s)], o.dark ? I.ink : I.red, 5 * s, k + 21, { smooth: false });
      for (let i = 0; i < 5; i++) { const u = ((t * 0.35 + i / 5 + k * 0.13) % 1); pt.fill(ell(fx - u * 260 * s, y - 160 * s - u * 90 * s, (16 + u * 40) * s, (12 + u * 26) * s, k + 40 + i), I.inkSoft, k + 40 + i, { op: 0.5 * (1 - u) }); }
    }
    if (o.lights) {
      [[-0.32, -60], [0.0, -64], [0.3, -68], [0.06, -300]].forEach(([u, dy], i) => {
        const fl = 0.75 + 0.25 * Math.sin(t * 5 + i * 1.7 + k);
        const p = R(x + u * L, y + dy * s);
        pt.dot(p[0], p[1], 34 * s * fl, I.gold, k + 50 + i, 0.35 * o.lights);
        pt.dot(p[0], p[1], 11 * s, I.gold, k + 55 + i, o.lights);
        pt.line([[p[0], y + 14 * s], [p[0] + 3, y + 70 * s * fl]], 5 * s, k + 60 + i, { col: I.gold, op: 0.55 * o.lights });
      });
    }
  }
  // ---------------------------------------------------------------- water
  function water(pt, W, y0, y1, t, k, o = {}) {
    pt.fill([[-40, y0], [W + 40, y0], [W + 40, y1], [-40, y1]], o.col || I.blue, k, { op: o.op ?? 0.42, amp: 0.6 });
    pt.line([[-40, y0], [W + 40, y0]], 4, k + 1, { col: I.inkSoft, op: 0.8 });
    const r = rng(k * 3 + 1), n = o.n ?? 14;
    for (let i = 0; i < n; i++) {
      const d = r(), yy = lerp(y0 + 14, y1 - 10, d), L = 50 + d * 110, x = ((r() * (W + 300) + t * (o.speed ?? 18) * (0.5 + d)) % (W + 300)) - 150;
      pt.line([[x, yy], [x + L * 0.5, yy - 5], [x + L, yy]], 2.5 + d * 2.5, k + 10 + i, { col: o.wave || I.paperLight, op: 0.75, amp: 0.6 });
    }
  }
  // ---------------------------------------------------------------- figure rigs (Kaşif / period figures via KASIF)
  function rigOf(parent, K, sd) {
    if (!K) return null;
    const isK = (K.who || 'kasif') === 'kasif';
    const g = el(parent, 'g');
    const rig = KASIF.create(g, { scale: K.scale ?? 0.5, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    return { K, rig, g };
  }
  function rigUpdate(R, lt, t, cues, W, H, over = {}) {
    if (!R) return;
    const K = R.K;
    const st = [{ at: -1e9, pose: K.pose || 'idle', dir: K.dir ?? 20, face: K.face ?? 1, emotion: K.emotion0 || 'neutral', text: K.text0 ?? K.text, item: K.item }];
    if (K.at != null) st.push({ at: tc(cues, K.at, 1e9), pose: K.then || 'point', dir: K.dir_then ?? K.dir ?? 20, face: K.face_then ?? K.face ?? 1, emotion: K.emotion || 'surprised', text: K.text, item: K.item });
    for (const s of K.seq || []) st.push({ at: tc(cues, s.at, 1e9), pose: s.pose, dir: s.dir ?? K.dir ?? 20, face: s.face ?? K.face ?? 1, emotion: s.emotion || 'neutral', text: s.text ?? K.text, item: s.item });
    st.sort((a, b) => a.at - b.at);
    let i = 0; while (i + 1 < st.length && lt >= st[i + 1].at) i++;
    const c = st[i], pv = st[i - 1], since = i ? lt - c.at : lt, D = window.MCB.dirOf, FC = v => v === 'left' ? -1 : v === 'right' ? 1 : v;
    const o = Object.assign({ x: K.x * W, y: (K.y ?? 0.8) * H, face: FC(c.face), since, dir: D(c.dir), emotion: c.emotion, ph: lt * 1.1, text: c.text, item: c.item, mouth: 0 }, over);
    if (pv && since < 0.3) { o.prev = { pose: pv.pose, since: since + 1, dir: D(pv.dir), ph: o.ph }; o.mix = since / 0.3; }
    R.rig.update(t, over.pose || c.pose, o);
  }
  function counter(g, C) {
    if (!C) return null;
    const t = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size || 110, 'text-anchor': 'middle', fill: COL[C.color] || I.red,
      style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
    return { t, C };
  }
  function counterUpdate(o, lt, cues, W, H) {
    if (!o) return;
    const C = o.C, at = tc(cues, C.at, 0.3), p = progIO(lt, at, C.dur ?? 2), pk = punch(lt, at + (C.dur ?? 2), 0.6);
    o.t.style.display = lt < at ? 'none' : '';
    o.t.textContent = (C.prefix || '') + Math.round(lerp(C.from ?? 0, C.to ?? 100, p)).toLocaleString('en-US') + (C.suffix || '');
    o.t.setAttribute('transform', `translate(${F1(C.x * W)} ${F1(C.y * H)}) rotate(-3) scale(${(1 + 0.12 * pk).toFixed(3)})`);
  }
  function base(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), rigs = el(root, 'g'), front = el(root, 'g'), top = el(root, 'g');
    const pb = painter(back), pm = painter(mid), pf = painter(front);
    const L = window.MCB.labels(top, P.labels || [], W, H, seed * 31 + 5);
    const cnt = counter(top, P.counter);
    const K = rigOf(rigs, P.kasif, seed * 17 + 3);
    return { P, W, H, seed, root, back, mid, rigs, front, top, pb, pm, pf, L, cnt, K, gy: (P.ground ?? 0.8) * H,
      begin(t) { pb.begin(t); pm.begin(t); pf.begin(t); },
      end(lt, t, cues) { pb.end(); pm.end(); pf.end(); L.update(lt, t, cues); counterUpdate(cnt, lt, cues, W, H); rigUpdate(K, lt, t, cues, W, H); },
    };
  }
  const mk = fn => function (ctx) { const B = base(ctx); const u = fn(B, ctx); return { update(lt, dur, cues, env) { const t = env ? env.t : lt; B.begin(t); u(lt, dur, cues, t); B.end(lt, t, cues); } }; };
  // a crowd of small figures along the near bank; flags wave
  function crowd(pt, W, y, s, t, k, o = {}) {
    const r = rng(k), n = o.n ?? 22;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.3 + r() * 0.4) / n * W, ss = s * (0.85 + r() * 0.3), up = Math.sin(t * 4 + i * 1.3) * 18;
      const hand = man(pt, { x, y: y - 230 * ss, s: ss, face: r() < 0.5 ? 1 : -1, back: true, arms: [[-10, -4], [150 + up, 170 + up]], cap: r() < 0.5 ? 'wrap' : (r() < 0.5 ? 'top' : null), dim: o.dim }, k + i * 40).hands[1];
      if (i % 3 === 0) { pt.line([hand, [hand[0] + 6, hand[1] - 90 * ss]], 4 * ss, k + i * 40 + 33); pt.shape([[hand[0] + 6, hand[1] - 90 * ss], [hand[0] + 60 * ss, hand[1] - 84 * ss + up * 0.4], [hand[0] + 56 * ss, hand[1] - 50 * ss + up * 0.4], [hand[0] + 6, hand[1] - 56 * ss]], i % 2 ? I.red : I.blue, 3 * ss, k + i * 40 + 34); }
    }
  }

  // ================================================================ sz_harbor
  SH.sz_harbor = { kind: '2d', build: mk((B) => {
    const tags = (B.P.tags || []).map(T => { const e = el(B.top, 'text', { 'font-family': T.font === 'hand' ? INK_FONT : FR, 'font-weight': T.font === 'hand' ? 400 : 900, 'font-size': T.size || 64, 'text-anchor': 'middle', fill: I.paperLight }); e.textContent = T.text; return { T, e }; });
    const { P, W, H, seed } = B, mode = P.mode || 'dark', wy = (P.water ?? (mode === 'dark' ? 0.62 : 0.6)) * H;
    const moored = P.moored || [[0.12, 0.5], [0.34, 0.42], [0.82, 0.48], [0.58, 0.38]];
    const G = Object.assign({ x: 0.05, to: 0.6 }, P.ghost || {});
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      tags.forEach(({ T, e }) => { const a = spring(lt, tc(cues, T.at, 0.3), 0.6); e.setAttribute('x', F1(T.x * W)); e.setAttribute('y', F1(T.y * H + (1 - a) * 20)); e.style.opacity = clamp01(a); });
      if (mode === 'dark') {
        water(pb, W, wy, H + 40, t, seed + 1, { col: I.ink, op: 0.55, wave: I.inkSoft, n: 18 });
        const ms = P.moored_s ?? 1.6, gs = P.ghost_s ?? 1.2;
        moored.forEach(([x, s], i) => steamer(pm, x * W, wy + 40 + s * 160 * ms / 1.6, s * ms, t, seed + 100 + i * 80, { lights: 1, dim: true, masts: 2 + (i % 2) }));
        const gx = lerp(G.x, G.to, progIO(lt, 0.2, Math.max(1, dur - 0.4))) * W;
        steamer(pf, gx, wy + 250 * gs / 1.2, gs, t, seed + 700, { dark: true, masts: 2, lines: false });
        for (let i = 0; i < 5; i++) pf.line([[gx - 280 - i * 80, wy + 260 + i * 3], [gx - 350 - i * 80, wy + 264 + i * 3]], 4, seed + 760 + i, { col: I.inkSoft, op: 1 - i / 5 });
      } else {
        water(pb, W, wy, H + 40, t, seed + 1, { n: 16 });
        // breakwater + lighthouse at left
        pb.shape([[-40, wy + 40], [W * 0.2, wy + 10], [W * 0.2, wy + 40], [-40, wy + 70]], I.paperDark, 5, seed + 20);
        const lx = W * 0.1, ly = wy + 24;
        pb.shape([[lx - 30, ly], [lx + 30, ly], [lx + 16, ly - 300], [lx - 16, ly - 300]], I.paperLight, 5, seed + 22, { smooth: false });
        for (let i = 1; i < 4; i++) pb.line([[lx - 30 + i * 4, ly - i * 75], [lx + 30 - i * 4, ly - i * 75]], 4, seed + 24 + i, { col: I.red });
        pb.shape(rect(lx - 24, ly - 340, 48, 40), I.gold, 4, seed + 30, { smooth: false });
        const yx = (P.yacht_x ?? 0.36) * W, gx = (P.gun_x ?? 0.72) * W;
        steamer(pm, yx, wy + 170, 0.9, t, seed + 300, { hull: I.paperLight, flags: true, paddle: true, masts: 2 });
        steamer(pf, gx, wy + 210, 0.82, t, seed + 500, { dark: true, masts: 2 });
        const hit = punch(lt, tc(cues, 'front', -9), 0.7);
        if (hit > 0) pf.dot(gx, wy + 60, 300 * (1 - hit) + 80, I.red, seed + 590, 0.15 * hit);
      }
    };
  }) };

  // ================================================================ sz_canal (side view through the desert)
  SH.sz_canal = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B, mode = P.mode || 'opening';
    const wy = gy - 70;   // water strip sits a little above the cast's ground (far bank behind, near bank in front)
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      if (mode === 'flow') {
        const fl = tc(cues, 'flow', dur * 0.3), p = progIO(lt, fl, Math.max(1.2, dur - fl - 0.5));
        pb.shape([[-40, wy - 6], [W + 40, wy - 6], [W + 40, wy + 120], [-40, wy + 120]], I.paperDark, 5, seed + 1);
        for (let i = 0; i < 9; i++) pb.line([[i * 230 + 40, wy + 40 + (i % 3) * 18], [i * 230 + 140, wy + 44 + (i % 3) * 18]], 3, seed + 3 + i, { col: I.inkSoft });
        const fx = lerp(-60, W + 80, p);
        if (fx > -40) {
          const front = []; for (let i = 0; i <= 8; i++) front.push([fx + Math.sin(lt * 6 + i) * 18 + (i % 2) * 30, wy + i * 15]);
          pm.fill([[-40, wy]].concat(front).concat([[-40, wy + 120]]), I.blue, seed + 20, { op: 0.6 });
          for (let i = 0; i < 6; i++) pm.dot(fx + 30 + Math.sin(lt * 9 + i) * 16, wy - 10 - ((lt * 3 + i * 0.3) % 1) * 50, 9 - i, I.paperLight, seed + 30 + i, 0.9);
          for (let i = 0; i < 10; i++) { const xx = ((i * 211 + lt * 120) % Math.max(60, fx + 40)) - 30; pm.line([[xx, wy + 30 + (i % 4) * 20], [xx + 60, wy + 26 + (i % 4) * 20]], 3, seed + 40 + i, { col: I.paperLight, op: 0.8 }); }
        }
        pf.line([[-40, wy + 120], [W + 40, wy + 124]], 6, seed + 60);
        crowd(pf, W, H + 40, 0.44, t, seed + 400, { n: 12 });
        return;
      }
      water(pb, W, wy, wy + 110, t, seed + 1, { n: 10 });
      pb.line([[-40, wy + 112], [W + 40, wy + 112]], 6, seed + 2);
      if (mode === 'opening') {
        const sp = P.speed ?? 50;
        for (let i = 0; i < 4; i++) { const x = ((i * 560 + lt * sp) % (W + 700)) - 300; steamer(pm, x, wy + 40, 0.62, t, seed + 100 + i * 70, { flags: i % 2 === 0, hull: i === 1 ? I.paperLight : I.ink, masts: 2 + (i % 2), paddle: i === 1 }); }
        if (P.dunes !== false) { const dn = []; for (let i = 0; i <= 24; i++) { const x = -40 + i * (W + 80) / 24; dn.push([x, wy + 26 + 22 * Math.sin(i * 1.3) + 14 * Math.sin(i * 0.5)]); } pf.shape(dn.concat([[W + 40, H + 40], [-40, H + 40]]), I.gold, 5, seed + 380, { op: 0.92 });
          for (let i = 0; i < 16; i++) { const y = wy + 80 + (i % 4) * 50, x = (i * 263) % W; pf.line([[x, y], [x + 120, y - 8], [x + 220, y]], 3, seed + 382 + i, { col: I.stain, op: 0.9 }); } }
        if (P.crowd !== false) { const ca = tc(cues, P.crowd_at, -1); if (lt >= ca) crowd(pf, W, H + 40 + (1 - spring(lt, ca, 0.8)) * 300, 0.42, t, seed + 400, { n: 16 }); }
      } else {   // procession
        const ships = P.ships || [{ x: 0.82, dark: true }, { x: 0.5, hull: 'paperLight', flags: true, paddle: true }, { x: 0.18 }];
        const dx = lt * (P.speed ?? 24);
        ships.forEach((S, i) => steamer(pm, S.x * W + dx, wy + 40, S.s ?? 0.7, t, seed + 100 + i * 70, { dark: !!S.dark, hull: S.hull ? I[S.hull] : I.ink, flags: !!S.flags, paddle: !!S.paddle, masts: 2 }));
        crowd(pf, W, H + 60, 0.4, t, seed + 400, { n: 14 });
      }
    };
  }) };

  // ================================================================ sz_aerial (the canal from above, full frame)
  SH.sz_aerial = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed } = B, mode = P.mode || 'stuck';
    const cy = (P.cy ?? 0.52) * H, cw = (P.cw ?? (mode === 'stuck' ? 0.3 : 0.1)) * H;
    const r0 = rng(seed + 9), grains = Array.from({ length: 140 }, () => [r0() * W, r0(), r0()]);
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      pb.fill(rect(-40, -40, W + 80, cy - cw / 2 + 40), I.paperDark, seed + 1, { amp: 0.6 });
      pb.fill(rect(-40, cy + cw / 2, W + 80, H - cy - cw / 2 + 40), I.paperDark, seed + 2, { amp: 0.6 });
      grains.forEach(([x, v, s], i) => { const y = v < 0.5 ? v * 2 * (cy - cw / 2 - 30) + 10 : cy + cw / 2 + 20 + (v - 0.5) * 2 * (H - cy - cw / 2 - 30); pb.line([[x, y], [x + 18 + s * 30, y + 2]], 2 + s * 2, seed + 10 + i, { col: I.stain, op: 0.8, amp: 0.5 }); });
      pb.fill(rect(-40, cy - cw / 2, W + 80, cw), I.blue, seed + 3, { op: 0.5, amp: 0.6 });
      pb.line([[-40, cy - cw / 2], [W + 40, cy - cw / 2]], 6, seed + 4); pb.line([[-40, cy + cw / 2], [W + 40, cy + cw / 2]], 6, seed + 5);
      for (let i = 0; i < 12; i++) { const x = ((i * 173 + t * 10) % (W + 100)) - 50, y = cy - cw * 0.38 + (i % 5) * cw * 0.19; pb.line([[x, y], [x + 40, y - 3], [x + 80, y]], 3, seed + 20 + i, { col: I.paperLight, op: 0.7, amp: 0.5 }); }
      if (mode === 'stuck') {
        const c = [W * 0.5, cy], ang = -Math.atan2(cw * 1.02, W * 0.62) - 0.02 * Math.sin(lt * 0.8), L = W * 0.66, wd = 96;
        const R = p => rot([c[0] + p[0], c[1] + p[1]], c, ang);
        pm.shape([R([-L / 2, -wd / 2]), R([L / 2 - 90, -wd / 2]), R([L / 2, 0]), R([L / 2 - 90, wd / 2]), R([-L / 2, wd / 2])], I.ink, 6, seed + 40, { smooth: false });
        const cols = [I.red, I.blue, I.gold, I.green, I.paperLight];
        for (let i = 0; i < 18; i++) for (let j = 0; j < 3; j++) {
          const x0 = -L / 2 + 150 + i * 56, y0 = -wd / 2 + 10 + j * 26;
          pm.fill([R([x0, y0]), R([x0 + 50, y0]), R([x0 + 50, y0 + 22]), R([x0, y0 + 22])], cols[(i * 3 + j * 2 + (i % 4)) % 5], seed + 50 + i * 3 + j, { smooth: false, op: 0.95 });
        }
        pm.shape([R([-L / 2 + 40, -wd / 2 - 8]), R([-L / 2 + 120, -wd / 2 - 8]), R([-L / 2 + 120, wd / 2 + 8]), R([-L / 2 + 40, wd / 2 + 8])], I.paperLight, 5, seed + 120, { smooth: false });
        // excavator at the bow (on the bank)
        const bow = R([L / 2, 0]), ex = [bow[0] + 40, cy - cw / 2 - 70];
        pf.shape(rect(ex[0] - 60, ex[1] - 40, 120, 80), I.gold, 5, seed + 130, { smooth: false });
        const sw = Math.sin(lt * 2.2) * 0.35, arm = [ex[0] + Math.cos(1.9 + sw) * 150, ex[1] + Math.sin(1.9 + sw) * 150];
        pf.line([ex, arm], 12, seed + 132);
        pf.shape(ell(arm[0], arm[1], 26, 20, seed + 134), I.ink, 4, seed + 134);
        // tugs pulling the stern
        const st = R([-L / 2, 0]);
        [[-170, 90], [-120, -120]].forEach(([dx, dy], i) => {
          const tx = st[0] + dx + Math.sin(lt * 1.5 + i) * 8, ty = Math.max(cy - cw / 2 + 30, Math.min(cy + cw / 2 - 30, st[1] + dy));
          pf.line([st, [tx, ty]], 3, seed + 140 + i, { col: I.inkSoft });
          pf.shape(ell(tx, ty, 46, 20, seed + 145 + i), I.red, 4, seed + 145 + i);
          for (let j = 0; j < 4; j++) pf.dot(tx - 60 - j * 30, ty + Math.sin(lt * 5 + j) * 6, 8 - j, I.paperLight, seed + 150 + i * 5 + j, 0.9);
        });
      } else {
        const n = P.n ?? 24, grow = progIO(lt, 0.2, Math.max(1, dur - 0.6));
        const shown = Math.round(n * (0.3 + 0.7 * grow));
        for (let i = 0; i < shown; i++) {
          const left = i % 2 === 0, j = Math.floor(i / 2), x = left ? W * 0.42 - j * 110 : W * 0.58 + j * 110, y = cy + (j % 2 ? -1 : 1) * cw * 0.2;
          if (x < -60 || x > W + 60) continue;
          const sp = spring(lt, 0.2 + i * 0.06, 0.5);
          pm.shape([[x - 40 * sp, y - 15], [x + 40 * sp, y - 15], [x + 52 * sp, y], [x + 40 * sp, y + 15], [x - 40 * sp, y + 15]], I.ink, 3, seed + 200 + i, { smooth: false });
        }
        // the blocked spot
        pm.shape([[W * 0.47, cy - cw / 2 - 6], [W * 0.53, cy + cw / 2 + 6], [W * 0.52, cy + cw / 2 + 12], [W * 0.46, cy - cw / 2]], I.red, 4, seed + 300, { smooth: false });
      }
    };
  }) };

  // ================================================================ sz_dig (the corvée)
  SH.sz_dig = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B, mode = P.mode || 'trench';
    const r0 = rng(seed + 3);
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      if (mode === 'march') {
        const n = P.n ?? 14, s = P.s ?? 0.38, sp = P.speed ?? 60;
        for (let i = 0; i < n; i++) {
          const depth = i % 3, ss = s * (0.62 + depth * 0.22), yy = gy - (2 - depth) * 60;
          const x = ((i * (W + 300) / n + lt * sp * (0.7 + depth * 0.15)) % (W + 300)) - 150, ph = (lt * 1.4 + i * 0.37) * 6.283;
          const sw = Math.sin(ph) * 22;
          const fig = man(i % 3 === 0 ? pb : i % 3 === 1 ? pm : pf, { x, y: yy - 240 * ss, s: ss, torso: 172, legs: [[sw, sw * 0.4], [-sw, -sw * 0.4]], arms: [[-20 - sw * 0.6, -10], [150, 120]], cap: 'wrap', dim: depth === 0 }, seed + 10 + i * 40);
          const L = i % 3 === 0 ? pb : i % 3 === 1 ? pm : pf;
          if (i % 2) basket(L, fig.neck[0] - 40 * ss, fig.neck[1] + 30 * ss, ss * 0.9, seed + 30 + i * 40, false);
          else pick(L, fig.hands[1], 200, ss, seed + 36 + i * 40);
        }
        return;
      }
      const tx0 = (P.trench?.x0 ?? 0.2) * W, tx1 = (P.trench?.x1 ?? 0.8) * W, td = (P.trench?.d ?? 0.26) * H, ty = gy, sl = P.trench?.slope ?? 260;
      // far wall of the cut (seen through the trench), then the near cut-away earth
      pb.fill([[tx0, ty], [tx1, ty], [tx1 - sl, ty + td], [tx0 + sl, ty + td]], I.paper, seed + 7);
      for (let i = 1; i < 5; i++) pb.line([[tx0 + sl * i / 5, ty + td * i / 5], [tx1 - sl * i / 5, ty + td * i / 5]], 3, seed + 8 + i, { col: I.stain, op: 0.7 });
      const cut = [[-40, ty], [tx0, ty], [tx0 + sl, ty + td], [tx1 - sl, ty + td], [tx1, ty], [W + 40, ty], [W + 40, H + 40], [-40, H + 40]];
      pb.shape(cut, I.paperDark, 6, seed + 1);
      for (let i = 0; i < 7; i++) { const y = ty + 40 + i * (H - ty) / 7; pb.line([[-40, y], [tx0 + 20 + i * 14, y + 8]], 3, seed + 3 + i, { col: I.stain, op: 0.8 }); pb.line([[tx1 - 20 - i * 14, y + 6], [W + 40, y]], 3, seed + 12 + i, { col: I.stain, op: 0.8 }); }
      // spoil heap
      pb.shape([[tx1 + 40, ty], [tx1 + 200, ty - 120], [tx1 + 300, ty - 150], [tx1 + 420, ty - 90], [W + 40, ty - 30], [W + 40, ty]], I.gold, 5, seed + 20, { op: 0.7 });
      if (mode === 'trench') {
        const s = P.s ?? 0.36, fy = ty + td;
        for (let i = 0; i < (P.diggers ?? 5); i++) {
          const x = lerp(tx0 + sl + 60, tx1 - sl - 60, i / Math.max(1, (P.diggers ?? 5) - 1)), ph = (lt * 1.2 + i * 0.29) % 1, sw = Math.sin(ph * 6.283);
          const up = 165 - (sw > 0 ? sw * 105 : sw * 20);
          const fig = man(pm, { x, y: fy - 240 * s, s, torso: 168 + sw * 10, face: i % 2 ? -1 : 1, arms: [[up, up - 10], [up - 8, up - 18]], legs: [[-14, -4], [14, 4]], cap: 'wrap' }, seed + 40 + i * 40);
          const e = pick(pm, fig.hands[0], (i % 2 ? -1 : 1) * (up - 20), s, seed + 70 + i * 40);
          if (sw < -0.85) pm.dot(e[0], fy - 10, 16, I.gold, seed + 80 + i, 0.8);
        }
        // carriers climbing the left bank and returning
        const nC = P.carriers ?? 5;
        for (let i = 0; i < nC; i++) {
          const u = (lt * 0.12 + i / nC) % 1, x = lerp(tx0 + sl, tx0 - 10, u), y = lerp(ty + td, ty, u), ss = s * 0.9;
          const ph = (lt * 1.6 + i * 0.4) * 6.283, sw = Math.sin(ph) * 20;
          const fig = man(pf, { x, y: y - 240 * ss, s: ss, torso: 156, face: -1, legs: [[-sw - 20, -sw], [sw - 20, sw]], arms: [[140, 200], [150, 210]], cap: 'wrap' }, seed + 300 + i * 40);
          basket(pf, fig.neck[0] + 50 * ss, fig.neck[1] + 20 * ss, ss, seed + 330 + i * 40);
        }
        // carriers tipping on the heap (right bank)
        for (let i = 0; i < 2; i++) {
          const x = tx1 + 140 + i * 170, ss = s * 0.85, tip = 0.5 + 0.5 * Math.sin(lt * 2 + i * 2);
          const fig = man(pm, { x, y: ty - 60 - i * 50 - 240 * ss, s: ss, face: 1, arms: [[160 - tip * 40, 150 - tip * 50], [170 - tip * 40, 160 - tip * 50]], cap: 'wrap' }, seed + 500 + i * 40);
          basket(pm, fig.hands[0][0] + 20, fig.hands[0][1] - 20, ss, seed + 530 + i * 40, tip < 0.5);
          if (tip > 0.5) for (let j = 0; j < 4; j++) pm.dot(fig.hands[0][0] + 60 + j * 8, fig.hands[0][1] + ((lt * 2 + j * 0.25) % 1) * 120, 8, I.gold, seed + 560 + i * 5 + j, 0.8);
        }
      } else if (mode === 'empty') {
        const fy = ty + td;
        [[0.3, 0], [0.4, 1], [0.5, 0], [0.58, 1]].forEach(([u, kind], i) => {
          const x = u * W;
          if (kind) basket(pm, x, fy - 34, 0.6, seed + 40 + i * 10, false);
          else { pm.line([[x - 90, fy - 8], [x + 90, fy - 30]], 6, seed + 40 + i * 10, { col: I.inkSoft }); pm.line([[x + 80, fy - 60], [x + 100, fy + 2]], 9, seed + 41 + i * 10); }
        });
        for (let i = 0; i < 30; i++) { const d = r0(), y = ty - 20 + d * td, x = ((r0() * (W + 400) + lt * 380 * (0.6 + d)) % (W + 400)) - 200; pf.line([[x, y], [x + 70, y + 6]], 2 + d * 2, seed + 100 + i, { col: I.stain, op: 0.7, amp: 0.5 }); }
        const nw = tc(cues, 'new', dur * 0.6), p = prog(lt, nw, 2);
        const sx = W * 0.82, sy = ty - 260;
        if (p > 0) for (let i = 0; i < 7; i++) { const u = ((lt * 0.3 + i / 7) % 1) * p; pm.fill(ell(sx - u * 140, sy - u * 260, 20 + u * 60, 16 + u * 40, seed + 200 + i), I.ink, seed + 200 + i, { op: 0.6 * (1 - u) }); }
        if (p > 0) pm.shape([[sx - 30, sy + 40], [sx + 30, sy + 40], [sx + 20, sy - 10 * p], [sx - 20, sy - 10 * p]], I.ink, 4, seed + 220, { smooth: false });
      }
    };
  }) };
  // memory: statue vs nameless diggers
  SH.sz_memory = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B;
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      const px = (P.statue_x ?? 0.24) * W, sp = spring(lt, 0.1, 0.9);
      pb.shape([[px - 170, gy], [px + 170, gy], [px + 130, gy - 260], [px - 130, gy - 260]], I.paperDark, 7, seed + 1, { smooth: false });
      pb.line([[px - 100, gy - 130], [px + 100, gy - 130]], 4, seed + 2, { col: I.inkSoft });
      man(pm, { x: px, y: gy - 260 - 240 * 0.62 * sp, s: 0.62 * sp, face: 1, arms: [[-10, -4], [130, 150]], beard: false, mouth: 'line' }, seed + 10);
      const dg = tc(cues, 'dg', dur * 0.45);
      for (let i = 0; i < (P.n ?? 6); i++) {
        const a = prog(lt, dg + i * 0.12, 0.6), x = W * (0.5 + i * 0.075), s = 0.34;
        if (a <= 0.01) continue;
        const fig = man(pf, { x, y: gy - 240 * s * a, s: s * a, face: -1, cap: 'wrap', back: false, dim: true, arms: [[-14, -4], [150, 200]] }, seed + 100 + i * 40);
        basket(pf, fig.neck[0] + 40 * s, fig.neck[1] + 20 * s, s * a, seed + 130 + i * 40, false);
      }
    };
  }) };

  // ================================================================ sz_water (camels, then the fresh-water canal)
  SH.sz_water = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B;
    function camel(pt, x, y, s, ph, k) {
      const b = Math.sin(ph * 6.283) * 5 * s;
      for (let i = 0; i < 4; i++) { const hx = x + (i < 2 ? 70 : -70) * s, sw = Math.sin(ph * 6.283 + (i % 2 ? Math.PI : 0)) * 20 * s; pt.line([[hx, y - 170 * s + b], [hx + sw * 0.4, y - 80 * s], [hx + sw, y]], 7 * s, k + i); }
      pt.shape([[x - 115 * s, y - 175 * s + b], [x - 95 * s, y - 215 * s + b], [x - 40 * s, y - 280 * s + b], [x + 10 * s, y - 225 * s + b], [x + 70 * s, y - 215 * s + b], [x + 110 * s, y - 185 * s + b], [x + 90 * s, y - 160 * s + b], [x - 100 * s, y - 158 * s + b]], I.paperLight, 6 * s, k + 5);
      pt.line([[x + 100 * s, y - 185 * s + b], [x + 150 * s, y - 210 * s + b], [x + 170 * s, y - 280 * s + b]], 16 * s, k + 6);
      pt.shape([[x + 150 * s, y - 300 * s + b], [x + 215 * s, y - 290 * s + b], [x + 212 * s, y - 268 * s + b], [x + 158 * s, y - 266 * s + b]], I.paperLight, 5 * s, k + 14);
      pt.dot(x + 178 * s, y - 289 * s + b, 5 * s, I.ink, k + 7);
      pt.line([[x - 112 * s, y - 172 * s + b], [x - 130 * s, y - 120 * s + b]], 4 * s, k + 16);
      pt.line([[x - 70 * s, y - 228 * s + b], [x - 10 * s, y - 218 * s + b]], 5 * s, k + 17, { col: I.inkSoft });
      [-62, -4].forEach((dx, j) => pt.shape(ell(x + dx * s, y - 182 * s + b, 24 * s, 32 * s, k + 8 + j), I.red, 5 * s, k + 8 + j));
    }
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      const cn = tc(cues, 'canal', dur * 0.55), p = progIO(lt, cn, 1.8);
      if (p > 0) {
        const x1 = lerp(-40, W + 40, p);
        const c0 = gy - 150, c1 = gy - 90;
        pb.fill([[-40, c0], [x1, c0], [x1, c1], [-40, c1]], I.blue, seed + 1, { op: 0.6 });
        pb.line([[-40, c0], [x1, c0]], 4, seed + 2); pb.line([[-40, c1], [x1, c1]], 4, seed + 3);
        for (let i = 0; i < 8; i++) { const xx = ((i * 260 + lt * 60) % Math.max(80, x1 + 40)) - 40; pb.line([[xx, (c0 + c1) / 2], [xx + 70, (c0 + c1) / 2 - 2]], 3, seed + 10 + i, { col: I.paperLight }); }
      }
      const n = P.n ?? 4, sp = P.speed ?? 70;
      for (let i = 0; i < n; i++) { const x = ((i * 520 + lt * sp) % (W + 600)) - 300; camel(pm, x, gy, 1.05, lt * 0.9 + i * 0.3, seed + 100 + i * 20); }
      const lead = ((lt * sp + 520 * (n - 1)) % (W + 600)) - 300 + 330;
      const ph = Math.sin(lt * 0.9 * 6.283) * 20;
      man(pf, { x: lead, y: gy - 240 * 0.55, s: 0.55, torso: 174, legs: [[ph, ph * 0.3], [-ph, -ph * 0.3]], arms: [[-40, -60], [20, 10]], cap: 'wrap' }, seed + 400);
    };
  }) };

  // ================================================================ sz_dredger
  SH.sz_dredger = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B;
    const close = !!P.close, s = P.s ?? (close ? 1.45 : 0.9), cx = (P.x ?? (close ? 0.42 : 0.4)) * W, wy = gy - (close ? 40 : 90);
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      water(pb, W, wy, H + 40, t, seed + 1, { n: 12, op: 0.48 });
      // bank at right with the growing mud heap
      const bx = cx + 520 * s;
      pb.shape([[bx, wy + 10], [bx + 120 * s, wy - 140 * s], [W + 40, wy - 170 * s], [W + 40, H + 40], [bx - 40, H + 40]], I.paperDark, 6, seed + 3);
      const heap = 0.6 + 0.4 * clamp01(lt / Math.max(1, dur));
      pb.shape([[bx + 120 * s, wy - 140 * s], [bx + 220 * s, wy - (140 + 120 * heap) * s], [bx + 380 * s, wy - (140 + 150 * heap) * s], [W + 40, wy - 170 * s]], I.gold, 5, seed + 5, { op: 0.75 });
      // pontoon + tower
      const bob = Math.sin(lt * 1.2) * 4 * s;
      pm.shape([[cx - 360 * s, wy - 40 * s + bob], [cx + 300 * s, wy - 40 * s + bob], [cx + 270 * s, wy + 30 * s + bob], [cx - 330 * s, wy + 30 * s + bob]], I.ink, 6 * s, seed + 10, { smooth: false });
      pm.shape([[cx - 260 * s, wy - 40 * s + bob], [cx - 60 * s, wy - 40 * s + bob], [cx - 60 * s, wy - 180 * s + bob], [cx - 260 * s, wy - 180 * s + bob]], I.paperLight, 5 * s, seed + 12, { smooth: false });
      for (let i = 0; i < 3; i++) pm.shape(rect(cx - 240 * s + i * 62 * s, wy - 150 * s + bob, 40 * s, 40 * s), I.gold, 3 * s, seed + 14 + i, { smooth: false, op: 0.8 });
      const fx = cx - 200 * s;
      pm.shape([[fx - 22 * s, wy - 180 * s + bob], [fx + 22 * s, wy - 180 * s + bob], [fx + 20 * s, wy - 360 * s + bob], [fx - 20 * s, wy - 360 * s + bob]], I.ink, 5 * s, seed + 20, { smooth: false });
      for (let i = 0; i < 7; i++) { const u = ((t * 0.3 + i / 7) % 1); pm.fill(ell(fx - u * 300 * s, wy - (380 + u * 200) * s + bob, (20 + u * 60) * s, (16 + u * 40) * s, seed + 30 + i), I.inkSoft, seed + 30 + i, { op: 0.55 * (1 - u) }); }
      const top = [cx + 120 * s, wy - 420 * s + bob], low = [cx - 60 * s, wy + 220 * s];
      pm.line([[cx - 20 * s, wy - 40 * s + bob], top, [cx + 240 * s, wy - 40 * s + bob]], 9 * s, seed + 40, { smooth: false });
      pm.line([[cx + 60 * s, wy - 40 * s + bob], top], 6 * s, seed + 41, { smooth: false });
      // ladder (from the top down into the water) with the bucket chain
      pm.line([top, low], 14 * s, seed + 42);
      const nb = 9, ld = Math.hypot(low[0] - top[0], low[1] - top[1]), ux = (top[0] - low[0]) / ld, uy = (top[1] - low[1]) / ld;
      for (let i = 0; i < nb; i++) {
        const u = ((i / nb + lt * 0.18) % 1), px = lerp(low[0], top[0], u) + uy * 22 * s, py = lerp(low[1], top[1], u) - ux * 22 * s;
        const full = u > 0.15;
        pf.shape([[px - 30 * s, py - 20 * s], [px + 30 * s, py - 20 * s], [px + 22 * s, py + 22 * s], [px - 22 * s, py + 22 * s]], I.ink, 4 * s, seed + 50 + i, { smooth: false });
        if (full && py < wy) pf.fill(ell(px, py - 22 * s, 26 * s, 12 * s, seed + 60 + i), I.gold, seed + 60 + i, { op: 0.9 });
      }
      // chute from the top to the heap, mud sliding
      const ch1 = [bx + 200 * s, wy - (190 + 110 * heap) * s];
      pf.line([[top[0] + 10 * s, top[1] + 20 * s], ch1], 18 * s, seed + 70, { col: I.inkSoft });
      for (let i = 0; i < 6; i++) { const u = (lt * 0.8 + i / 6) % 1; pf.dot(lerp(top[0] + 10 * s, ch1[0], u), lerp(top[1] + 10 * s, ch1[1] - 10 * s, u), (close ? 16 : 11) * s * 0.7, I.gold, seed + 80 + i, 0.95); }
      if (close) for (let i = 0; i < 6; i++) { const u = (lt * 1.3 + i / 6) % 1; pf.dot(low[0] + 40 * s + i * 14 * s, wy - u * 80 * s + u * u * 120 * s, 8 * s, I.paperLight, seed + 90 + i, 1 - u); }
    };
  }) };

  // ================================================================ sz_levels (Napoleon's survey)
  SH.sz_levels = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B, mode = P.mode || 'high';
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      if (mode === 'survey') {
        const x0 = (P.x ?? 0.34) * W, s = 0.6;
        // tripod + level
        const ty = gy - 300 * s;
        pm.line([[x0 + 150 * s, ty], [x0 + 80 * s, gy]], 6, seed + 1); pm.line([[x0 + 150 * s, ty], [x0 + 220 * s, gy]], 6, seed + 2); pm.line([[x0 + 150 * s, ty], [x0 + 160 * s, gy]], 6, seed + 3);
        pm.shape(rect(x0 + 90 * s, ty - 40 * s, 140 * s, 36 * s), I.gold, 5, seed + 4, { smooth: false });
        const sight = 0.5 + 0.5 * Math.sin(lt * 1.3);
        man(pm, { x: x0, y: gy - 240 * s, s, face: 1, torso: 168, arms: [[110, 120], [100, 80 + sight * 10]], cap: 'bicorne' }, seed + 10);
        // staff man far right
        const sx = (P.staff_x ?? 0.78) * W, ss = 0.42;
        const fig = man(pm, { x: sx, y: gy - 60 - 240 * ss, s: ss, face: -1, arms: [[-120, -150], [-14, -4]], cap: 'wrap' }, seed + 50);
        const sh = fig.hands[0];
        pm.shape(rect(sh[0] - 14, gy - 60 - 420, 28, 420), I.paperLight, 4, seed + 60, { smooth: false });
        for (let i = 0; i < 6; i++) pm.fill(rect(sh[0] - 12, gy - 60 - 410 + i * 70, 24, 30), I.red, seed + 62 + i, { smooth: false });
        const ly = ty - 22 * s, dash = (lt * 120) % 60;
        for (let x = x0 + 240 * s + dash; x < sh[0] - 20; x += 60) pf.line([[x, ly + (x - x0) * 0.0], [x + 30, ly]], 4, seed + 80 + Math.floor(x), { col: I.red, op: 0.8 });
        return;
      }
      // cross-section of the isthmus: Mediterranean basin left, Red Sea basin right, land in between
      const base = H * 0.86, mL = H * 0.56;
      const wr = tc(cues, 'wrong', 1e9), fl = tc(cues, 'flood', 1e9);
      const up = mode === 'fixed' ? 1 - progIO(lt, wr, 1.2) : spring(lt, 0.4, 1.2);
      const rL = mL - 150 * up;
      pb.fill([[-40, mL], [W * 0.3, mL], [W * 0.3, base], [-40, base]], I.blue, seed + 1, { op: 0.5 });
      pb.fill([[W * 0.7, rL], [W + 40, rL], [W + 40, base], [W * 0.74, base]], I.blue, seed + 2, { op: 0.5 });
      const rim = Math.min(mL - 40, rL - 24);
      pb.shape([[-40, base], [W * 0.2, base], [W * 0.3, mL + 10], [W * 0.38, mL - 40], [W * 0.58, mL - 40], [W * 0.66, rim], [W * 0.7, rim + 10], [W * 0.74, rL + 40], [W * 0.8, base], [W + 40, base], [W + 40, H + 40], [-40, H + 40]], I.paperDark, 6, seed + 3);
      pb.line([[-40, mL], [W * 0.3, mL]], 5, seed + 4, { col: I.blue }); pb.line([[W * 0.7, rL], [W + 40, rL]], 5, seed + 5, { col: I.blue });
      for (let i = 0; i < 6; i++) { const x = ((i * 120 + t * 20) % (W * 0.28)); pb.line([[x, mL + 30 + (i % 3) * 30], [x + 50, mL + 28 + (i % 3) * 30]], 3, seed + 10 + i, { col: I.paperLight }); }
      if (mode === 'high' && lt > fl) {
        const p = prog(lt, fl, 1.6), x = lerp(W * 0.7, W * 0.42, p);
        pm.fill([[W * 0.7, rL - 6], [W * 0.66, rL - 30], [x, mL - 54], [x - 40, mL - 40], [W * 0.62, mL - 40], [W * 0.68, rL + 4]], I.blue, seed + 20, { op: 0.6 });
        for (let i = 0; i < 4; i++) pm.dot(x - 10 - i * 30, mL - 60 - Math.abs(Math.sin(lt * 7 + i)) * 26, 8, I.paperLight, seed + 22 + i, 0.9);
      }
      // dimension line
      const dimA = mode === 'fixed' ? 1 - prog(lt, wr, 0.6) : prog(lt, 1.0, 0.6);
      if (dimA > 0.02) {
        const dx = W * 0.75;
        pf.line([[dx, mL], [dx, rL]], 5, seed + 30, { col: I.red, op: dimA });
        pf.line([[dx - 30, mL], [dx + 30, mL]], 5, seed + 31, { col: I.red, op: dimA }); pf.line([[dx - 30, rL], [dx + 30, rL]], 5, seed + 32, { col: I.red, op: dimA });
        pf.line([[W * 0.3, mL], [W * 0.72, mL]], 3, seed + 33, { col: I.red, op: 0.6 * dimA });
      }
      if (mode === 'fixed' && lt > wr) {
        const p = prog(lt, wr + 1.0, 0.6);
        for (let x = W * 0.02; x < W * 0.98; x += 60) pf.line([[x, mL - 2], [x + 30, mL - 2]], 4, seed + 40 + Math.floor(x / 60), { col: I.green, op: p });
      }
    };
  }) };

  // ================================================================ sz_ancient (aerial: Nile + the old canal)
  SH.sz_ancient = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed } = B;
    const nx = W * 0.2, cy = H * 0.5;
    const r0 = rng(seed + 5), grains = Array.from({ length: 120 }, () => [r0() * W, r0() * H, r0()]);
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      pb.fill(rect(-40, -40, W + 80, H + 80), I.paperDark, seed + 1, { amp: 0.5 });
      grains.forEach(([x, y, s], i) => pb.line([[x, y], [x + 16 + s * 24, y + 2]], 2 + s * 2, seed + 10 + i, { col: I.stain, op: 0.75, amp: 0.5 }));
      // Nile (vertical, wiggly) with green banks
      const nile = []; for (let i = 0; i <= 12; i++) { const y = -40 + i * (H + 80) / 12; nile.push([nx + Math.sin(i * 0.9) * 40, y]); }
      pb.line(nile, 150, seed + 200, { col: I.green, op: 0.55 });
      pb.line(nile, 70, seed + 201, { col: I.blue, op: 0.75 });
      // Red Sea at the right
      pb.fill([[W * 0.84, -40], [W + 40, -40], [W + 40, H + 40], [W * 0.9, H + 40], [W * 0.86, H * 0.6], [W * 0.82, H * 0.3]], I.blue, seed + 202, { op: 0.6 });
      pb.line([[W * 0.84, -40], [W * 0.82, H * 0.3], [W * 0.86, H * 0.6], [W * 0.9, H + 40]], 5, seed + 203);
      // the canal
      const cpts = [[nx + 20, cy], [W * 0.4, cy - 40], [W * 0.6, cy + 30], [W * 0.84, cy - 10]];
      const fill = tc(cues, 'fill', dur * 0.6), fp = prog(lt, fill, Math.max(1, dur - fill - 0.3));
      pm.line(cpts, 46, seed + 210, { col: I.blue, op: 0.8 * (1 - fp * 0.85) });
      pm.line(cpts.map(p => [p[0], p[1] - 30]), 4, seed + 211, { col: I.inkSoft });
      pm.line(cpts.map(p => [p[0], p[1] + 30]), 4, seed + 212, { col: I.inkSoft });
      if (fp > 0) for (let i = 0; i < 26; i++) { const u = i / 26; if (u > fp * 1.1) continue; const seg = Math.min(2, Math.floor(u * 3)), lu = u * 3 - seg, p = [lerp(cpts[seg][0], cpts[seg + 1][0], lu), lerp(cpts[seg][1], cpts[seg + 1][1], lu)]; pf.fill(ell(p[0], p[1] + Math.sin(i) * 10, 40, 26, seed + 300 + i), I.gold, seed + 300 + i, { op: 0.9 }); }
      // reed boat
      const bu = clamp01(lt / Math.max(1, fill)) * 0.8 + 0.05, seg = Math.min(2, Math.floor(bu * 3)), lu = bu * 3 - seg;
      const bp = [lerp(cpts[seg][0], cpts[seg + 1][0], lu), lerp(cpts[seg][1], cpts[seg + 1][1], lu)];
      if (fp < 0.3) {
        pm.shape([[bp[0] - 60, bp[1] - 8], [bp[0] + 60, bp[1] - 8], [bp[0] + 40, bp[1] + 12], [bp[0] - 40, bp[1] + 12]], I.gold, 4, seed + 400);
        pm.shape([[bp[0], bp[1] - 8], [bp[0] + 6, bp[1] - 110], [bp[0] + 60, bp[1] - 60]], I.paperLight, 4, seed + 402);
      }
    };
  }) };

  // ================================================================ sz_paper (desk close-ups, full frame)
  SH.sz_paper = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed } = B, mode = P.mode || 'concession';
    const lines = P.lines || [];
    const txts = lines.map((s, i) => { const tx = el(B.top, 'text', { 'font-family': i === 0 ? FR : INK_FONT, 'font-weight': i === 0 ? 900 : 400, 'font-size': i === 0 ? 86 : 60, 'text-anchor': 'middle', fill: I.ink }); tx.textContent = s; return tx; });
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      // desk
      pb.fill(rect(-40, -40, W + 80, H + 80), I.paperDark, seed + 1, { amp: 0.5 });
      for (let i = 0; i < 14; i++) { const y = i * 82 + 20; pb.line([[-40, y], [W * 0.3, y + 10], [W * 0.7, y - 8], [W + 40, y + 6]], 3, seed + 2 + i, { col: I.stain, op: 0.8, amp: 0.6 }); }
      if (mode === 'concession' || mode === 'debt') {
        const open = progIO(lt, 0.1, 1.0), pw = W * 0.5, px = W * 0.5 - pw / 2, ph = lerp(80, H * 0.7, open), py = H * 0.07;
        pm.shape(rect(px, py, pw, ph), I.paperLight, 6, seed + 30, { smooth: false });
        pm.shape(ell(W / 2, py + ph, pw / 2 + 24, 26, seed + 32), I.paper, 5, seed + 32);
        pm.shape(ell(W / 2, py, pw / 2 + 24, 26, seed + 34), I.paper, 5, seed + 34);
        const nl = mode === 'debt' ? 9 : 7;
        for (let i = 0; i < nl; i++) {
          const y = py + 230 + i * 62; if (y > py + ph - 40) continue;
          const p = prog(lt, 1.0 + i * 0.25, 0.5), len = pw * (0.6 + 0.2 * Math.sin(i * 2.1)) * p;
          if (p <= 0) continue;
          const pts = []; for (let x = 0; x <= len; x += 24) pts.push([px + 70 + x, y + Math.sin(x * 0.2 + i) * 5]);
          if (pts.length > 1) pm.line(pts, 4, seed + 40 + i, { col: mode === 'debt' && i > 3 ? I.red : I.inkSoft });
          if (mode === 'debt') pm.line([[px + pw - 160, y], [px + pw - 70, y]], 6, seed + 60 + i, { col: I.red, op: p });
        }
        txts.forEach((tx, i) => { tx.setAttribute('x', W / 2); tx.setAttribute('y', py + 130 + i * 64); tx.style.opacity = prog(lt, 0.8 + i * 0.4, 0.5); });
        if (mode === 'debt') {
          const n = Math.floor(clamp01(lt / Math.max(1, dur)) * 8);
          for (let i = 0; i < n + 3; i++) pf.shape(rect(W * 0.06 + (i % 2) * 14, H * 0.9 - i * 34, 300, 40), I.paperLight, 4, seed + 100 + i, { smooth: false });
          for (let i = 0; i < n + 2; i++) pf.shape(rect(W * 0.8 - (i % 2) * 14, H * 0.9 - i * 34, 300, 40), I.paperLight, 4, seed + 130 + i, { smooth: false });
        }
        const sl = tc(cues, 'seal', null);
        if (sl != null && lt > sl && mode === 'concession') {
          const sp = spring(lt, sl, 0.6), sx = px + pw - 120, sy = py + ph - 140;
          pf.shape(ell(sx, sy, 70 * sp, 70 * sp, seed + 200, 16), I.red, 5, seed + 200);
          pf.line([[sx - 30 * sp, sy], [sx + 30 * sp, sy]], 5, seed + 202, { col: I.paperLight });
          pf.line([[sx - 30, sy + 60 * sp], [sx - 50, sy + 130 * sp]], 10, seed + 203, { col: I.red });
          pf.line([[sx + 20, sy + 60 * sp], [sx + 40, sy + 130 * sp]], 10, seed + 204, { col: I.red });
        }
      } else {   // shares
        const n = P.n ?? 6;
        for (let i = 0; i < n; i++) {
          const a = spring(lt, 0.2 + i * 0.35, 0.7), ang = lerp(0, (i - (n - 1) / 2) * 0.16, a), c = [W * 0.5, H * 1.25];
          const cw = 600, ch = 390, cx = W * 0.5 - cw / 2, cy = H * 0.3 + (1 - a) * 300;
          const R = p => rot(p, c, ang);
          if (a <= 0.01) continue;
          pm.shape(rect(cx, cy, cw, ch).map(R), I.paperLight, 5, seed + 30 + i * 10, { smooth: false });
          pm.line(rect(cx + 24, cy + 24, cw - 48, ch - 48).concat([[cx + 24, cy + 24]]).map(R), 3, seed + 31 + i * 10, { col: I.blue, smooth: false });
          pm.line([R([cx + 80, cy + 110]), R([cx + cw - 80, cy + 110])], 10, seed + 32 + i * 10, { col: I.ink });
          pm.line([R([cx + 110, cy + 170]), R([cx + cw - 110, cy + 170])], 4, seed + 33 + i * 10, { col: I.inkSoft });
          pm.line([R([cx + 110, cy + 210]), R([cx + cw - 160, cy + 210])], 4, seed + 34 + i * 10, { col: I.inkSoft });
          const sc = R([cx + cw - 90, cy + ch - 80]); pm.shape(ell(sc[0], sc[1], 40, 40, seed + 35 + i * 10), I.gold, 4, seed + 35 + i * 10);
        }
      }
    };
  }) };

  // ================================================================ sz_beach (the first pickaxe at Port Said)
  SH.sz_beach = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B;
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      const pk = tc(cues, 'pick', dur * 0.5), x = (P.x ?? 0.46) * W, s = P.s ?? 0.62;
      // swing: raise before the cue, strike on the cue, then small idle
      const raise = prog(lt, Math.max(0, pk - 1.0), 0.8), strike = prog(lt, pk - 0.08, 0.16);
      const a = lerp(lerp(40, 170, raise), 70, strike);
      const fig = man(pm, { x, y: gy - 240 * s, s, face: 1, torso: 180 - strike * 14, arms: [[a, a - 10], [a - 6, a - 18]], legs: [[-16, -6], [16, 6]], beard: 'short', cap: 'top' }, seed + 10);
      const e = pick(pm, fig.hands[0], a - 20, s * 1.1, seed + 40);
      const hit = punch(lt, pk, 0.9);
      if (lt > pk) for (let i = 0; i < 12; i++) { const u = clamp01((lt - pk) / 1.0), ang = -Math.PI * (0.15 + 0.7 * i / 11); pf.dot(e[0] + Math.cos(ang) * 160 * u, gy - 6 + Math.sin(ang) * 120 * u + 200 * u * u, 10 * (1 - u) + 3, I.gold, seed + 60 + i, 1 - u); }
      if (hit > 0) pf.line([[e[0] - 80, gy + 4], [e[0] + 80, gy + 4]], 8, seed + 80, { col: I.red, op: hit });
      // flag poles + a few onlookers
      [0.26, 0.84, 0.94].forEach((u, i) => {
        const px = u * W, top = gy - 420;
        pb.line([[px, gy], [px, top]], 6, seed + 100 + i);
        const wv = Math.sin(t * 5 + i) * 14;
        pb.shape([[px, top], [px + 130, top + 14 + wv], [px + 124, top + 80 + wv], [px, top + 70]], [I.blue, I.red, I.gold][i], 4, seed + 110 + i);
      });
      for (let i = 0; i < 4; i++) man(pf, { x: W * (0.64 + i * 0.07), y: gy + 30 - 240 * 0.36, s: 0.36, face: -1, cap: i % 2 ? 'top' : 'wrap', arms: [[-14, -4], [14 + Math.sin(lt * 3 + i) * 10, 4]] }, seed + 200 + i * 40);
    };
  }) };

  // ================================================================ sz_camp (cholera night)
  SH.sz_camp = { kind: '2d', build: mk((B) => {
    const { P, W, H, seed, gy } = B;
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      const n = P.n ?? 6;
      for (let i = 0; i < n; i++) {
        const far = i % 2, s = far ? 0.55 : 0.85, x = W * (0.1 + i * 0.8 / (n - 1)), y = gy - (far ? 90 : 0);
        const out = prog(lt, (P.out_at ?? 1.2) + i * ((dur - 2) / n), 0.8), gl = (1 - out) * (0.75 + 0.25 * Math.sin(t * 6 + i));
        const L = far ? pb : pm;
        if (gl > 0.02) L.dot(x, y - 90 * s, 170 * s, I.gold, seed + 10 + i, 0.25 * gl);
        L.shape([[x - 170 * s, y], [x, y - 230 * s], [x + 170 * s, y]], gl > 0.05 ? I.gold : I.paperDark, 6 * s, seed + 20 + i * 4, { op: lerp(0.75, 1, out) });
        L.shape([[x - 40 * s, y], [x, y - 110 * s], [x + 40 * s, y]], I.ink, 4 * s, seed + 22 + i * 4, { op: 0.85 });
      }
      for (let i = 0; i < 5; i++) { const u = (lt * 0.05 + i / 5) % 1; pf.line([[u * W, gy - 300 - i * 30], [u * W + 160, gy - 310 - i * 30]], 3, seed + 200 + i, { col: I.inkSoft, op: 0.4 }); }
    };
  }) };

  // ================================================================ sz_route (full-frame chart)
  // Simplified real coastlines in [lon, lat]; Africa and Eurasia are one landmass (the isthmus is the point).
  const LAND = [
    [[-30, 75], [5, 62], [10, 57], [8.5, 55], [8, 53.5], [4.5, 53], [1.8, 51], [-1.5, 49.7], [-4.7, 48.4], [-1.2, 46.2], [-1.8, 43.4], [-9.3, 43.2], [-9, 37], [-5.6, 36], [-2, 36.8], [0, 39], [3, 41.8], [3.2, 43.2], [7.5, 43.8], [10.5, 43], [12.5, 41.5], [16, 38], [18.5, 40.2], [13.5, 45.5], [19.5, 41.8], [22.5, 36.4], [24, 38], [26, 40.8], [26.2, 40.1], [26.5, 39], [27.3, 37], [28.5, 36.7], [30.5, 36.5], [33, 36.1], [36, 36.6], [35.9, 34.5], [34.6, 32], [34.2, 31.3], [32.3, 31.25], [29.9, 31.2], [25, 31.7], [20, 30.9], [20, 32.5], [15.2, 32.3], [11, 33], [10, 37], [3, 36.8], [-2, 35.1], [-5.9, 35.8], [-9.7, 30.5], [-13, 27.5], [-17, 21], [-17, 14.7], [-12, 8], [-7.5, 4.5], [0, 5.5], [8.5, 4], [9.5, 1], [12, -6], [13, -12], [11.8, -17], [15, -27], [18.5, -34.4], [20, -34.8], [25.6, -34], [32.5, -28.5], [35.5, -24], [35, -20], [40.5, -15], [40, -10], [39.5, -5], [42, -1], [51, 10.5], [51.2, 12], [43.5, 12.5], [39, 16], [37.2, 21], [35.5, 24], [32.55, 29.95], [32.9, 29.5], [34.3, 27.7], [34.9, 29.5], [36, 26.5], [39, 21.5], [43.3, 12.7], [45, 13], [52, 15.5], [56, 18], [59.8, 22.5], [56.3, 26.3], [51.5, 24.5], [48, 29.5], [50.3, 30], [54, 26.8], [57, 25.8], [61.5, 25.2], [66.5, 25.4], [70, 22.5], [72.8, 19], [73.5, 16], [76.3, 9.5], [77.5, 8], [80.2, 13], [80.3, 15.5], [82.3, 17], [87, 21.5], [91, 22.5], [94.5, 16], [97.6, 16.5], [98.5, 10], [100.5, 13.5], [105, 8.6], [130, 0], [150, 75]],
    [[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0, 53.5], [-3, 56], [-2, 57.6], [-3, 58.6], [-5, 58.6], [-6.2, 56.5], [-4.8, 54.8], [-3, 53.4], [-4.6, 52.8], [-5.2, 51.7], [-3, 51.4]],
    [[49.3, -12], [50.5, -15.5], [47, -25], [44, -24.5], [43.5, -21.5], [44.5, -16], [46.5, -15.5]],
    [[79.8, 9.8], [81.8, 7.5], [81, 6], [80, 6.5]],
    [[-130, 20], [-80, 9], [-75, 11], [-62, 10.6], [-60, 8], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5.5], [-39, -13], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -41], [-68, -50], [-130, -60]],
    [[-130, 80], [-60, 80], [-55, 52], [-53, 47], [-66, 44], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 25], [-82, 27], [-84, 30], [-90, 29], [-97, 26], [-130, 20]],
    [[-44, 60], [-40, 65], [-22, 70], [-20, 78], [-58, 80], [-55, 70], [-50, 64]],
  ];
  const RIVERS = { nile: [[[30.9, 26.3], [31.2, 27.2], [30.8, 28.5], [31.25, 30.05], [31.8, 31.45]], [[31.25, 30.05], [30.4, 31.45]]] };
  const SEAS_W = [
    [[28, 41.2], [28, 43.5], [29.6, 45.2], [30.5, 46.5], [33, 46], [33.6, 44.5], [36.6, 45.4], [38, 47], [39.5, 47], [38, 45], [41.6, 41.6], [38, 40.9], [35, 42], [31.4, 41.3]],
    [[47, 44.5], [50.5, 46.5], [53, 45], [53.5, 40], [54, 37.3], [50, 37], [49, 38.5], [49.5, 40.5]],
  ];
  SH.sz_route = { kind: '2d', build: mk((B, ctx) => {
    const { P, W, H, seed } = B;
    const Vw = Object.assign({ lon0: -85, lat0: 69, k: 8.5 }, P.view || {});
    const X = q => [(q[0] - Vw.lon0) * Vw.k, (Vw.lat0 - q[1]) * Vw.k];
    const land = LAND.map(p => p.map(X)), seas = SEAS_W.map(p => p.map(X));
    const routes = (P.routes || []).map(R => {
      const pts = R.pts.map(X), cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      return { R, pts, cum, L: cum[cum.length - 1] };
    });
    const along = (r, d) => { let i = 1; while (i < r.cum.length - 1 && r.cum[i] < d) i++; const u = (d - r.cum[i - 1]) / Math.max(1e-6, r.cum[i] - r.cum[i - 1]); return [lerp(r.pts[i - 1][0], r.pts[i][0], clamp01(u)), lerp(r.pts[i - 1][1], r.pts[i][1], clamp01(u)), Math.atan2(r.pts[i][1] - r.pts[i - 1][1], r.pts[i][0] - r.pts[i - 1][0])]; };
    const cities = (P.cities || []).map(c => { const tx = el(B.top, 'text', { 'font-family': INK_FONT, 'font-size': c.size || 56, 'text-anchor': 'middle', fill: COL[c.color] || I.ink, style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 12px; stroke-linejoin: round` }); tx.textContent = c.name; return { c, tx, p: X([c.lon, c.lat]) }; });
    const meas = P.measure ? { a: X(P.measure.from), b: X(P.measure.to) } : null;
    const r0 = rng(seed + 7), wv = Array.from({ length: 26 }, () => [r0() * W, r0() * H]);
    return (lt, dur, cues, t) => {
      const { pb, pm, pf } = B;
      pb.fill(rect(-40, -40, W + 80, H + 80), I.paperLight, seed + 1, { amp: 0.4 });
      for (let i = 1; i < 8; i++) pb.line([[i * W / 8, -20], [i * W / 8, H + 20]], 2, seed + 2 + i, { col: I.inkSoft, op: 0.25 });
      for (let i = 1; i < 5; i++) pb.line([[-20, i * H / 5], [W + 20, i * H / 5]], 2, seed + 12 + i, { col: I.inkSoft, op: 0.25 });
      wv.forEach(([x, y], i) => pb.line([[x, y], [x + 18, y - 6], [x + 36, y], [x + 54, y - 6]], 3, seed + 20 + i, { col: I.blue, op: 0.45, amp: 0.6 }));
      land.forEach((p, i) => pb.shape(p, I.paperDark, 4, seed + 60 + i * 3, { lc: I.inkSoft, amp: 1.4 }));
      seas.forEach((p, i) => pb.shape(p, I.paperLight, 3, seed + 80 + i * 3, { lc: I.inkSoft }));
      (P.rivers || []).forEach((nm, j) => (RIVERS[nm] || []).forEach((rv, i) => pb.line(rv.map(X), P.river_w ?? 10, seed + 85 + j * 4 + i, { col: I.blue, op: 0.8 })));
      if (P.storm) { const s = X(P.storm); for (let j = 0; j < 3; j++) { const pts = []; for (let a = 0; a < 5.5; a += 0.35) { const rr = (14 + a * 12 + j * 22); pts.push([s[0] + Math.cos(a + lt * 2 + j) * rr, s[1] + Math.sin(a + lt * 2 + j) * rr * 0.7]); } pm.line(pts, 4, seed + 90 + j, { col: I.inkSoft, op: 0.8 }); } }
      routes.forEach((r, ri) => {
        const at = tc(cues, r.R.at, 0.4 + ri * 0.5), d = r.R.dur ?? 2.4, p = r.R.ghost ? 1 : progIO(lt, at, d);
        if (p <= 0) return;
        const col = r.R.color === 'soft' ? I.inkSoft : r.R.color === 'blue' ? I.blue : I.red;
        const Lp = r.L * p, seg = []; let acc = 0;
        for (let x = 0; x < Lp; x += 34) { const a0 = along(r, x), a1 = along(r, Math.min(Lp, x + 20)); seg.push([a0, a1]); acc++; }
        seg.forEach(([a0, a1], i) => pm.line([[a0[0], a0[1]], [a1[0], a1[1]]], r.R.width ?? 8, seed + 200 + ri * 300 + (i % 280), { col, smooth: false, amp: 0.8, op: r.R.ghost ? 0.6 : 1 }));
        if (r.R.ship !== false && !r.R.ghost) {
          const h = along(r, Lp), bob = Math.sin(lt * 4) * 3;
          pf.shape([[h[0] - 26, h[1] - 6 + bob], [h[0] + 26, h[1] - 6 + bob], [h[0] + 16, h[1] + 10 + bob], [h[0] - 16, h[1] + 10 + bob]], I.ink, 3, seed + 900 + ri, { smooth: false });
          pf.line([[h[0], h[1] - 6 + bob], [h[0], h[1] - 46 + bob]], 4, seed + 905 + ri);
          pf.shape([[h[0] + 2, h[1] - 44 + bob], [h[0] + 28, h[1] - 18 + bob], [h[0] + 2, h[1] - 14 + bob]], I.paperLight, 3, seed + 910 + ri);
        }
      });
      if (meas) {
        const p = prog(lt, tc(cues, P.measure.at, 1), 1.0);
        if (p > 0) {
          const b = [lerp(meas.a[0], meas.b[0], p), lerp(meas.a[1], meas.b[1], p)];
          pf.line([meas.a, b], 9, seed + 950, { col: I.red });
          pf.dot(meas.a[0], meas.a[1], 14, I.red, seed + 951); if (p > 0.95) pf.dot(meas.b[0], meas.b[1], 14, I.red, seed + 952);
        }
      }
      cities.forEach(({ c, tx, p }, i) => {
        const a = spring(lt, tc(cues, c.at, 0.3 + i * 0.3), 0.6);
        if (a > 0.01) { pf.shape(ell(p[0], p[1], 14 * a, 14 * a, seed + 960 + i), I.paperLight, 5, seed + 960 + i, { lc: COL[c.color] || I.ink }); pf.dot(p[0], p[1], 5 * a, COL[c.color] || I.ink, seed + 970 + i); }
        tx.setAttribute('x', F1(p[0] + (c.dx ?? 0))); tx.setAttribute('y', F1(p[1] + (c.dy ?? -30))); tx.style.opacity = clamp01(a);
      });
    };
  }) };
})();

// SHOTS.sz_survey — sz_levels in mode "survey" (the 1798 surveyors in the desert), a separate type for the storyboard.
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sz_survey = { kind: '2d', build(ctx) { return SH.sz_levels.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'survey' }) })); } };
})();

// SHOTS.sz_room — period interiors, each with its own identity (full frame, set false), cast via MCB.cast, foreground layer.
//   P.room: "study" (bookshelf, spinning globe, desk front) | "palace" (pointed arches, divan, rug, swinging lamp) |
//   "throne" (one big arch, gilded chair, palms, rug) | "parliament" (green benches in tiers with members, front bench) |
//   "admiralty" (wall chart, ship model, desk front) | "london" (fireplace with flickering fire, portrait, desk front).
//   P.cast: MCB cast list; P.shake: {at, a: {x, cap, beard}, b: {...}, s} two drawn men: a scolds (wagging finger,
//   angry brows), on cue `at` both smile and shake hands in the middle.  P.ground: 0.8.
// SHOTS.sz_corvee — a field by the Nile: an official reads a decree from a scroll; peasants drop their hoes and walk
//   into line (cue "line"); P.labels (e.g. stamp "1 MONTH").
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const tc = (cues, v, fb) => v == null ? fb : typeof v === 'number' ? v : (cues && cues[v] != null ? cues[v] : fb);
  // tiny painter (same as sz_suez's)
  function painter(parent) {
    const els = []; let n = 0, T = 0;
    const get = () => { const e = els[n] || (els[n] = el(parent, 'path', { stroke: 'none' })); n++; e.style.display = ''; return e; };
    const P = {
      begin(t) { n = 0; T = t; }, end() { for (let i = n; i < els.length; i++) els[i].style.display = 'none'; },
      fill(pts, col, k, o = {}) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', o.op ?? 1); e.setAttribute('d', inkLoop(pts, { seed: k, t: T, amp: o.amp ?? 1.2, smooth: o.smooth !== false })); },
      line(pts, w, k, o = {}) { const e = get(); e.setAttribute('fill', o.col || I.ink); e.setAttribute('fill-opacity', o.op ?? 1); e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false })); },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k + 1, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? 1 })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
    };
    return P;
  }
  const ell = (cx, cy, rx, ry, k, n = 14) => inkEllipsePts(cx, cy, rx, ry, k, n, 0, 0.04);
  const arch = (x, y0, w, h) => { const p = [[x - w / 2, y0]]; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; p.push([x + Math.cos(a) * w / 2, y0 - h * 0.6 + Math.sin(a) * h * 0.4 * (1 + 0.35 * Math.sin(i / 10 * Math.PI))]); } p.push([x + w / 2, y0]); return p; };
  const V = (deg, L) => [Math.sin(deg * Math.PI / 180) * L, Math.cos(deg * Math.PI / 180) * L];

  function drawRoom(pb, pf, room, W, H, gy, lt, t, seed) {
    const wall = { study: I.paperDark, palace: I.paperLight, throne: I.paperLight, parliament: I.paperDark, admiralty: I.paper, london: I.paperDark }[room] || I.paper;
    pb.fill(rect(-40, -40, W + 80, gy + 40), wall, seed + 1, { amp: 0.5 });
    pb.fill(rect(-40, gy, W + 80, H - gy + 40), room === 'parliament' ? I.green : I.stain, seed + 2, { op: room === 'parliament' ? 0.35 : 0.55, amp: 0.5 });
    pb.line([[-40, gy], [W + 40, gy]], 6, seed + 3);
    for (let i = 0; i < 9; i++) pb.line([[W / 2 + (i - 4) * 160, gy], [W / 2 + (i - 4) * 520, H + 40]], 2.5, seed + 4 + i, { col: I.inkSoft, op: 0.6 });
    if (room === 'palace' || room === 'throne') {
      const xs = room === 'palace' ? [0.18, 0.4, 0.62, 0.84] : [0.5];
      xs.forEach((u, i) => { const w = room === 'palace' ? 300 : 520, h = room === 'palace' ? 560 : 700; const ap = arch(u * W, gy - 40, w, h);
        pb.shape(ap, I.blue, 6, seed + 20 + i * 3, { op: 0.28 }); pb.line(ap.map(p => [p[0] + (p[0] - u * W) * 0.12, p[1] - 14]), 4, seed + 21 + i * 3, { col: I.gold }); });
      if (room === 'palace') {
        for (let i = 0; i < 4; i++) pb.shape(rect(0.29 * W + i * 0.22 * W - 18, gy - 620, 36, 580), I.paperDark, 4, seed + 40 + i, { smooth: false });
        pb.shape(rect(W * 0.66, gy - 150, W * 0.32, 110), I.red, 5, seed + 50, { op: 0.85 });
        pb.shape(rect(W * 0.64, gy - 60, W * 0.36, 60), I.gold, 5, seed + 52, { op: 0.9 });
        for (let i = 0; i < 4; i++) pb.shape(ell(W * (0.7 + i * 0.075), gy - 160, 50, 34, seed + 54 + i), [I.gold, I.blue, I.green, I.paperLight][i], 4, seed + 54 + i);
        const sw = Math.sin(lt * 1.1) * 0.12, lx = W * 0.8, top = [lx, -10], lp = [lx + Math.sin(sw) * 260, 250 * Math.cos(sw)];
        pb.line([top, lp], 3, seed + 60); pb.shape([[lp[0] - 40, lp[1]], [lp[0] + 40, lp[1]], [lp[0] + 22, lp[1] + 60], [lp[0] - 22, lp[1] + 60]], I.gold, 4, seed + 61);
        pb.dot(lp[0], lp[1] + 90, 70 + Math.sin(t * 7) * 6, I.gold, seed + 62, 0.25);
      } else {
        pb.shape([[W * 0.64, gy], [W * 0.645, gy - 380], [W * 0.69, gy - 430], [W * 0.735, gy - 380], [W * 0.74, gy]], I.gold, 6, seed + 70, { op: 0.85 });
        pb.shape(rect(W * 0.65, gy - 220, W * 0.08, 90), I.red, 5, seed + 72);
        [0.18, 0.82].forEach((u, i) => { pb.shape([[u * W - 60, gy], [u * W + 60, gy], [u * W + 44, gy - 110], [u * W - 44, gy - 110]], I.stain, 5, seed + 74 + i * 9, { smooth: false });
          for (let j = 0; j < 5; j++) { const a = -150 + j * 30 + Math.sin(lt * 1.3 + j + i) * 4; const v = V(a + 180, 190); pb.line([[u * W, gy - 110], [u * W + v[0] * 0.5, gy - 110 + v[1] * 0.5 - 60], [u * W + v[0], gy - 110 + v[1]]], 10, seed + 76 + i * 9 + j, { col: I.green }); } });
      }
      pf.shape(ell(W * 0.5, H - 40, W * 0.42, 120, seed + 80, 18), I.red, 6, seed + 80, { op: 0.75 });
      pf.line(ell(W * 0.5, H - 40, W * 0.36, 90, seed + 82, 18), 4, seed + 82, { col: I.gold, closed: true });
    } else if (room === 'study') {
      pb.shape(rect(140, 220, 480, gy - 220), I.stain, 6, seed + 20, { smooth: false, op: 0.9 });
      const cols = [I.red, I.blue, I.green, I.gold, I.paperLight];
      for (let r = 0; r < 5; r++) { pb.line([[140, 220 + (r + 1) * (gy - 220) / 5], [620, 220 + (r + 1) * (gy - 220) / 5]], 5, seed + 22 + r); for (let b = 0; b < 10; b++) { const x = 160 + b * 44, hh = 80 + ((b * 7 + r * 3) % 4) * 12, yb = 220 + (r + 1) * (gy - 220) / 5 - 4; pb.shape(rect(x, yb - hh, 36, hh), cols[(b + r * 2) % 5], 3, seed + 30 + r * 11 + b, { smooth: false, op: 0.9 }); } }
      const gx = W * 0.84, gyy = gy - 330; pb.line([[gx, gy], [gx, gyy + 120]], 8, seed + 90); pb.line([[gx - 80, gy], [gx + 80, gy]], 8, seed + 91);
      pb.shape(ell(gx, gyy, 120, 120, seed + 92), I.blue, 5, seed + 92, { op: 0.45 });
      for (let i = 0; i < 4; i++) { const ph = ((lt * 0.15 + i / 4) % 1), xx = gx + Math.cos(ph * Math.PI) * 100; pb.line([[xx, gyy - 90], [xx + (gx - xx) * 0.2, gyy], [xx, gyy + 90]], 3, seed + 94 + i, { col: I.inkSoft }); }
      pb.shape([[gx - 50, gyy - 30], [gx + 10, gyy - 60], [gx + 40, gyy + 10], [gx - 20, gyy + 40]].map(p => [p[0] + Math.sin(lt * 0.9) * 40, p[1]]), I.green, 3, seed + 99, { op: 0.8 });
    } else if (room === 'parliament') {
      for (let r = 2; r >= 0; r--) { const y = gy - 60 - r * 120, cv = x => 34 * (1 - Math.pow((x - W / 2) / (W / 2 + 40), 2));
        const top = [], frt = []; for (let i = 0; i <= 12; i++) { const x = -40 + i * (W + 80) / 12; top.push([x, y - 70 + cv(x)]); frt.push([x, y - 40 + cv(x)]); }
        pb.shape(top.concat(frt.slice().reverse()), I.paperLight, 4, seed + 20 + r, { op: 0.9 });
        pb.shape(frt.concat([[W + 40, y + 10], [-40, y + 10]].map(([x, yy]) => [x, yy + cv(x)])), I.green, 5, seed + 23 + r, { op: 0.85 });
        for (let i = 0; i < 16; i++) { const x = (i + 0.5 + (r % 2) * 0.5) * W / 16, bob = Math.sin(lt * 2 + i + r) * 4 + cv(x); pb.shape(ell(x, y - 104 + bob, 26, 26, seed + 30 + r * 16 + i), I.paperLight, 3, seed + 30 + r * 16 + i, { lc: I.inkSoft }); pb.line([[x, y - 78 + bob], [x, y - 70]], 6, seed + 80 + r * 16 + i, { col: I.inkSoft }); } }
      pb.shape(rect(W * 0.12, gy - 520, W * 0.08, 160), I.stain, 5, seed + 140, { smooth: false });
    } else if (room === 'admiralty') {
      pb.shape(rect(W * 0.1, 190, W * 0.46, gy - 330), I.paperLight, 6, seed + 20, { smooth: false });
      pb.line([[W * 0.12, 300], [W * 0.2, 260], [W * 0.26, 340], [W * 0.34, 300], [W * 0.38, 420], [W * 0.46, 380], [W * 0.54, 460]], 4, seed + 21, { col: I.inkSoft });
      pb.line([[W * 0.14, 520], [W * 0.3, 470], [W * 0.5, 560]], 5, seed + 22, { col: I.red, op: 0.8 });
      const cx = W * 0.48, cy = 290; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + lt * 0.2; pb.line([[cx, cy], [cx + Math.cos(a) * (i % 2 ? 30 : 60), cy + Math.sin(a) * (i % 2 ? 30 : 60)]], 4, seed + 24 + i, { col: I.blue }); }
      pb.shape(rect(W * 0.66, gy - 380, W * 0.28, 20), I.stain, 4, seed + 40, { smooth: false });
      const sx = W * 0.8, sy = gy - 380; pb.shape([[sx - 120, sy - 10], [sx + 120, sy - 10], [sx + 90, sy - 50], [sx - 100, sy - 50]], I.ink, 4, seed + 42, { smooth: false });
      [-60, 0, 60].forEach((d, i) => pb.line([[sx + d, sy - 50], [sx + d, sy - 170 + Math.abs(d)]], 4, seed + 44 + i));
    } else if (room === 'london') {
      const fx = W * 0.74, fw = 420;
      pb.shape(rect(fx - fw / 2 - 40, gy - 420, fw + 80, 40), I.paperLight, 5, seed + 20, { smooth: false });
      pb.shape(rect(fx - fw / 2, gy - 380, fw, 380), I.paper, 6, seed + 22, { smooth: false });
      pb.shape(rect(fx - fw / 2 + 70, gy - 260, fw - 140, 260), I.ink, 5, seed + 24, { smooth: false });
      for (let i = 0; i < 5; i++) { const fl = 0.6 + 0.4 * Math.sin(t * 9 + i * 1.7), x = fx - 100 + i * 50; pb.shape([[x - 30, gy - 20], [x + 30, gy - 20], [x + 6, gy - 20 - 120 * fl], [x - 6, gy - 20 - 90 * fl]], i % 2 ? I.gold : I.red, 3, seed + 26 + i); }
      pb.shape(rect(fx - 130, gy - 760, 260, 300), I.gold, 6, seed + 40, { smooth: false, op: 0.5 });
      pb.shape(ell(fx, gy - 610, 60, 80, seed + 42), I.paperLight, 4, seed + 42);
      for (let i = 0; i < 8; i++) pb.line([[40 + i * 70, 80], [40 + i * 70, gy - 10]], 3, seed + 50 + i, { col: I.stain, op: 0.8 });
    }
    // foreground layer: desk front / bench back
    if (room === 'study' || room === 'admiralty' || room === 'london') {
      pf.shape(rect(W * 0.04, H - 150, W * 0.36, 200), I.stain, 6, seed + 200, { smooth: false });
      pf.line([[W * 0.06, H - 120], [W * 0.38, H - 120]], 4, seed + 202, { col: I.ink });
      pf.shape([[W * 0.08, H - 150], [W * 0.18, H - 168], [W * 0.26, H - 152], [W * 0.16, H - 136]], I.paperLight, 4, seed + 204);
      if (room === 'london') pf.shape(ell(W * 0.32, H - 190, 60, 50, seed + 206), I.gold, 5, seed + 206);
    } else if (room === 'parliament') {
      pf.shape(rect(-40, H - 110, W + 80, 160), I.green, 6, seed + 210, { smooth: false, op: 0.9 });
      pf.line([[-40, H - 80], [W + 40, H - 80]], 3, seed + 212, { col: I.paperLight });
    }
  }

  SH.sz_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), gb = el(root, 'g'), gm = el(root, 'g'), gc = el(root, 'g'), gf = el(root, 'g'), gt = el(root, 'g');
      const pb = painter(gb), pm = painter(gm), pf = painter(gf);
      const gy = (P.ground ?? 0.8) * H;
      const cast = window.MCB.cast(gc, (P.cast || []).map(c => Object.assign({ y: P.ground ?? 0.8 }, c)), W, H, seed * 7 + 1);
      const L = window.MCB.labels(gt, P.labels || [], W, H, seed * 31 + 5);
      const SK = P.shake;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt;
          pb.begin(t); pm.begin(t); pf.begin(t);
          drawRoom(pb, pf, P.room || 'study', W, H, gy, lt, t, seed);
          if (SK) {
            const at = tc(cues, SK.at, dur * 0.6), p = window.SZ_prog(lt, at, 0.5), s = SK.s ?? 0.9, mid = W * (SK.mid ?? 0.5);
            const shake = p > 0.9 ? Math.sin((lt - at) * 14) * 7 : 0, wag = Math.sin(lt * 9) * 14;
            const ax = mid - 178 * s, bx = mid + 178 * s;
            const a0 = [[-12, -4], [150 + wag, 175 + wag]], a1 = [[-12, -4], [lerp(150, 78, p) + shake, lerp(175, 92, p) + shake]];
            window.SZ_man(pm, Object.assign({ x: ax, y: gy - 240 * s, s, face: 1, arms: p > 0 ? a1 : a0, brows: p < 0.5 ? 'angry' : 'up', smile: p >= 0.5, frown: p < 0.5 }, SK.a || {}), seed + 300);
            window.SZ_man(pm, Object.assign({ x: bx, y: gy - 240 * s, s, face: -1, arms: [[12, 4], [lerp(-14, -78, p) - shake, lerp(-4, -92, p) - shake]], brows: p < 0.5 ? 'up' : null, smile: p >= 0.5, mouth: p < 0.5 ? 'o' : null }, SK.b || {}), seed + 400);
          }
          pb.end(); pm.end(); pf.end();
          cast.update(lt, t, cues); L.update(lt, t, cues);
        },
      };
    },
  };

  SH.sz_corvee = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), gb = el(root, 'g'), gm = el(root, 'g'), gt = el(root, 'g');
      const pb = painter(gb), pm = painter(gm);
      const gy = (P.ground ?? 0.84) * H;
      const L = window.MCB.labels(gt, P.labels || [], W, H, seed * 31 + 5);
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt;
          pb.begin(t); pm.begin(t);
          // field rows at right, the Nile strip far behind
          pb.fill([[-40, gy - 150], [W + 40, gy - 150], [W + 40, gy - 110], [-40, gy - 110]], I.blue, seed + 1, { op: 0.5 });
          for (let r = 0; r < 6; r++) { const y = gy - 90 + r * 34; for (let i = 0; i < 14; i++) { const x = W * 0.42 + i * 82 + (r % 2) * 40, sw = Math.sin(lt * 2 + i * 0.7 + r) * 4; pb.line([[x, y + 18], [x + sw, y - 14]], 5, seed + 10 + r * 14 + i, { col: I.green }); } }
          // official with a decree
          const ox = W * 0.18, s = 0.62, un = window.SZ_prog(lt, 0.2, 1.0);
          const fig = window.SZ_man(pm, { x: ox, y: gy - 240 * s, s, face: 1, arms: [[100, 100], [80, 70]], cap: null, beard: true, robe: I.blue }, seed + 100);
          const hx = fig.hands[0][0] + 10, hy = fig.hands[0][1] - 20;
          pm.shape([[hx, hy], [hx + 40, hy], [hx + 40, hy + 40 + 220 * un], [hx, hy + 40 + 220 * un]], I.paperLight, 4, seed + 110, { smooth: false });
          for (let i = 0; i < 5; i++) if (40 + i * 40 < 40 + 220 * un) pm.line([[hx + 8, hy + 60 + i * 40], [hx + 32, hy + 60 + i * 40]], 3, seed + 112 + i, { col: I.inkSoft });
          // official's turban
          pm.shape(ell(fig.head[0], fig.head[1] - 46 * s, 62 * s, 34 * s, seed + 120), I.paperLight, 5 * s, seed + 120);
          // peasants walk from the field into a line
          const ln = tc(cues, 'line', dur * 0.4);
          for (let i = 0; i < 6; i++) {
            const p = window.SZ_progIO(lt, ln + i * 0.15, 1.6), x0 = W * (0.5 + i * 0.08), x1 = W * (0.36 + i * 0.09), x = lerp(x0, x1, p), ss = 0.46;
            const walking = p > 0 && p < 1, ph = Math.sin(lt * 9 + i) * (walking ? 18 : 0);
            const f2 = window.SZ_man(pm, { x, y: gy + 10 - 240 * ss, s: ss, face: -1, cap: 'wrap', legs: [[ph, ph * 0.3], [-ph, -ph * 0.3]], arms: p < 0.05 ? [[-120, -150], [-100, -140]] : [[-14, -4], [14, 4]], torso: p < 0.05 ? 200 : 180 }, seed + 200 + i * 40);
            if (p < 0.05) pm.line([f2.hands[0], [f2.hands[0][0] - 70, f2.hands[0][1] + 90]], 5, seed + 230 + i * 40, { col: I.inkSoft });
            else pm.line([[x0 - 30, gy + 6], [x0 + 60, gy + 2]], 5, seed + 230 + i * 40, { col: I.inkSoft });
          }
          pb.end(); pm.end();
          L.update(lt, t, cues);
        },
      };
    },
  };
})();
