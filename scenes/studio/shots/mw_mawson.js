// mw_mawson: Douglas Mawson's Far Eastern Party (Antarctica, 1912-13) in the parchment ink style (brand/kit/BRAND.md
// §3, §5; every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random).
// Written for the Stickstory long video ag-03-mawson-antarctica (2026-11-13) but parametric. Tuned for 16:9.
// The scene's "set" (snow / sea / night) paints sky and ground; these shots draw everything on top of it.
// Uses mcB__lib.js (MCB.labels) for hand-written labels and kasif.js (KASIF.create) for the cast.
//
// Common P: labels: [MCB label entries {text, x, y (0..1), at, size, color, stamp, arrow}],
//   kasif: {x, y (0..1, feet), scale: 0.5, pose: "idle", at: cue, then, dir, face: 1|-1, emotion, text, seq: [...]} | false,
//   counter: {x, y (0..1), from, to, at, dur: 2, suffix: "", prefix: "", size: 96, color: "red"} (big Fraunces number)
//   ground: 0.8 (0..1 H: feet line; match the scene's set.ground)
//
// SHOTS.mw_crevasse — cut-away of a crevasse under a snow plain (the set's ground = the surface).
//   P.mode "hang":  a man hangs on a rope deep in the gap, swinging; the rope runs over the lip to a sledge on the
//                   surface that creeps toward the edge (sledge: {x: 0.78, to: 0.68}); snow crumbs fall.
//   P.mode "climb": the man climbs the knotted rope up to the lip (cue "up"); on cue "break" the lip breaks off and he
//                   slides back down to the end of the rope.
//   P.mode "out":   he climbs up (cue "up") and rolls out onto the snow (cue "out"), then lies there breathing.
//   P.mode "ledge": two men kneel at the lip and call down (sound arcs); far down on a ledge lies a broken sledge and
//                   one dog that lifts its head (cue "dog"). No man in the gap.
//   P.mode "hole":  the surface is low (ground ≈ 0.6): sledge tracks run in from the left and end in a broken black
//                   hole; two men stand far right and look back at it.
//   P.mode "ladder": a sledge on the surface with a rope ladder that unrolls over the lip into the gap (cue "ladder").
//   P: {mode, surface: 0.36 (0..1 H), gap: {x: 0.46, w: 0.2}, depth: 0.7 (man's hip, 0..1 H), sledge: {x, to}, dim: {text, at}}
//   cues: up, break, out, dog, call, ladder, slide (hang: the sledge lurches), hit
//
// SHOTS.mw_trek — side view across the plateau: sastrugi scroll by while the party travels.
//   P.mode "march": dog teams + men on skis (P.teams: [{x: 0.5, dogs: 5, man: {beard}}]); "look": the lead skier turns
//                   round on cue "look"; "dogs": one team, P.dog_tally: {n: 6, x, y, cross: [cues]} crosses dogs out;
//                   "pull": a man hauls the sledge himself, a second man lies wrapped on it; "solo": a lone man hauls a
//                   half sledge into the wind; "collapse": like solo, but on cue "gave" the snow opens under him and he
//                   drops out of sight while the sledge skids up to the hole.
//   P: {mode, speed: 60 (px/s scroll), dusk: false (low gold sun), wind: 0..1 (drift streaks)}   cues: look, gave, cross cues
//
// SHOTS.mw_camp — a pyramid tent on the snow.  P.mode "trio": three men stand by the tent and two sledges, a name over
//   each (P.names); "cook": a cooker steams in front of the tent; "sick": a man sits slumped by the tent, his friend
//   stands over him; "night": the set is night, the tent glows from a lantern that dims on cue "dim"; "dawn": one man
//   stands with his head bowed by the tent.   P: {mode, tent: {x: 0.5, s: 1}, names: [..3], men: [{x, beard}]}
//
// SHOTS.mw_hut — the Cape Denison hut (low walls, steep pyramid roof, anemometer cups).  P.mode "blizzard": snow streaks
//   race sideways, smoke tears off the chimney, the cups spin; "lean": two men (and Kaşif) lean into the wind;
//   "radio": two wireless masts with an aerial; radio rings pulse out to a ship on the horizon (sea set);
//   "winter": windows glow, P.men small figures stand in front.  P: {mode, hut: {x: 0.42, s: 1}, wind: 1, ship: {x, s}}
//
// SHOTS.mw_katabatic — diagram: the ice cap slopes down to the sea, cold air streams down it and speeds up, spray
//   explodes off the water; a tiny hut on the shore.  P: {labels}   cues: flow (streams start), hit
//
// SHOTS.mw_gear — close-ups on the snow.  P.mode "cut": a long sledge, a red saw line on cue "cut", the rear half slides
//   away; "feet": a bare foot (sole view), the skin of the sole lifts off on cue "peel"; "note": a handwritten note on a
//   food bag writes itself line by line (P.lines, P.at).
//
// SHOTS.mw_cairn — the search party's snow cairn with a black cloth flapping on a pole.  P.mode "far": a lone man hauls
//   a half sledge at left, the cairn is small on the right; "near": the cairn big, a food bag at its foot, footprints
//   lead off to three tiny figures on the horizon.
//
// SHOTS.mw_ship — Commonwealth Bay. P.mode "rise": a snow ridge in front, a man on it looking out with a spyglass, the
//   hut on the shore below and the ship small on the horizon; "close": the ship (barquentine with a funnel) sails
//   away and shrinks, smoke trailing.   P: {mode, ship: {x, y, s, to}, man: {x}}
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

  // ---------------------------------------------------------------- a posable stick man (same build as the KASIF rig)
  // o: {x, y (hip), s, torso: 180 (deg, 180 = up), arms: [[upper, fore], [upper, fore]], legs: [[thigh, shin], ...],
  //     head: 0 (tilt deg), cap: true, beard: false, face: 1}
  function man(pt, o, k) {
    const s = o.s ?? 0.5, x = o.x, y = o.y, w = 14 * s;
    const tv = V(o.torso ?? 180, 210 * s), neck = [x + tv[0], y + tv[1]];
    const hv = V(o.torso ?? 180, 74 * s), head = [neck[0] + hv[0], neck[1] + hv[1]];
    const sh = [lerp(x, neck[0], 0.9), lerp(y, neck[1], 0.9)];
    const limb = (p0, a1, a2, L1, L2) => { const v1 = V(a1, L1), p1 = [p0[0] + v1[0], p0[1] + v1[1]], v2 = V(a2, L2); return [p0, p1, [p1[0] + v2[0], p1[1] + v2[1]]]; };
    const legs = o.legs || [[-8, 0], [8, 0]], arms = o.arms || [[-12, -6], [12, 6]];
    if (o.halo) {
      legs.forEach((L, i) => pt.line(limb([x, y], L[0], L[1], 120 * s, 120 * s), w * 2.6, k + 60 + i, { smooth: false, col: I.paperLight, op: 0.9 }));
      pt.line([[x, y], neck], w * 2.6, k + 63, { col: I.paperLight, op: 0.9 });
      arms.forEach((A, i) => pt.line(limb(sh, A[0], A[1], 95 * s, 90 * s), w * 2.4, k + 64 + i, { smooth: false, col: I.paperLight, op: 0.9 }));
    }
    legs.forEach((L, i) => { const pp = limb([x, y], L[0], L[1], 120 * s, 120 * s); pt.line(pp, w, k + i, { smooth: false }); pt.dot(pp[2][0] + 8 * s * (o.face ?? 1), pp[2][1], 11 * s, I.ink, k + 10 + i); });
    pt.line([[x, y], neck], w * 1.05, k + 3);
    arms.forEach((A, i) => { const pp = limb(sh, A[0], A[1], 95 * s, 90 * s); pt.line(pp, w * 0.95, k + 4 + i, { smooth: false }); pt.dot(pp[2][0], pp[2][1], 12 * s, I.ink, k + 12 + i); });
    const r = 70 * s;
    if (o.beard) pt.fill(ell(head[0] + 6 * s * (o.face ?? 1), head[1] + r * 0.55, r * 0.62, r * 0.5, k + 20), I.inkSoft, k + 20, { op: 0.9 });
    pt.shape(ell(head[0], head[1], r, r, k + 21), I.paperLight, 9 * s, k + 21);
    const f = o.face ?? 1, tilt = (o.head ?? 0) * Math.PI / 180;
    const ex = (dx, dy) => [head[0] + (dx * Math.cos(tilt) - dy * Math.sin(tilt)) * s, head[1] + (dx * Math.sin(tilt) + dy * Math.cos(tilt)) * s];
    if (!o.back) {
      const e1 = ex(f * 10, 12), e2 = ex(f * 38, 12); pt.dot(e1[0], e1[1], 8 * s, I.ink, k + 22); pt.dot(e2[0], e2[1], 8 * s, I.ink, k + 23);
      if (o.worried) { const b1 = ex(f * 2, -2), b2 = ex(f * 18, -8), b3 = ex(f * 30, -8), b4 = ex(f * 46, -2); pt.line([b1, b2], 4 * s, k + 27, { smooth: false }); pt.line([b3, b4], 4 * s, k + 28, { smooth: false });
        const m = ex(f * 26, 40); pt.shape(ell(m[0], m[1], 8 * s, 11 * s, k + 29), I.ink, 3 * s, k + 29); }
      else { const m1 = ex(f * 14, 40), m2 = ex(f * 36, 40); pt.line([m1, m2], 4 * s, k + 27, { smooth: false }); }
    }
    if (o.cap !== false) {
      const c = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI + tilt; c.push([head[0] + Math.cos(a) * r * 1.04, head[1] + Math.sin(a) * r * 1.04 - 6 * s]); }
      c.push([head[0] + r * 1.05, head[1] - 4 * s]);
      pt.shape(c, I.blue, 7 * s, k + 24, { op: 0.9 });
      pt.dot(head[0] - Math.sin(tilt) * r * 1.1, head[1] - r * 1.12, 13 * s, I.blue, k + 26);
    }
    return { head, neck, hands: null };
  }

  // ---------------------------------------------------------------- sledge, dogs, tent, ship
  function sledge(pt, x, y, s, k, o = {}) {      // x = front tip, faces right; length 340*s
    const L = (o.half ? 190 : 340) * s, h = 34 * s;
    pt.line([[x - L, y], [x - 30 * s, y], [x - 6 * s, y - 14 * s], [x + 4 * s, y - 34 * s]], 8 * s, k, { smooth: true });
    for (let i = 0; i <= (o.half ? 2 : 4); i++) { const xx = x - 40 * s - i * (L - 60 * s) / (o.half ? 2 : 4); pt.line([[xx, y], [xx, y - h]], 6 * s, k + 1 + i); }
    pt.line([[x - L, y - h], [x - 26 * s, y - h]], 7 * s, k + 8);
    if (o.load !== false) {
      const bx = x - L + 20 * s, bw = L - 70 * s;
      pt.shape([[bx, y - h], [bx + bw, y - h], [bx + bw - 6 * s, y - h - 62 * s], [bx + 8 * s, y - h - 70 * s]], I.paperDark, 6 * s, k + 9);
      pt.line([[bx + bw * 0.35, y - h - 66 * s], [bx + bw * 0.38, y - h]], 4 * s, k + 11, { col: I.inkSoft });
      pt.line([[bx + bw * 0.7, y - h - 64 * s], [bx + bw * 0.68, y - h]], 4 * s, k + 12, { col: I.inkSoft });
    }
    return { front: [x + 4 * s, y - 30 * s], back: [x - L, y - h] };
  }
  function dog(pt, x, y, s, ph, k, o = {}) {      // faces right, y = paws
    const b = Math.sin(ph * 6.283) * 4 * s, f = o.face ?? 1;
    const by = y - 64 * s + b;
    for (let i = 0; i < 4; i++) {
      const hx = x + f * (i < 2 ? 34 : -34) * s, sw = Math.sin(ph * 6.283 + (i % 2 ? Math.PI : 0) + (i < 2 ? 0 : Math.PI / 2)) * (o.still ? 0 : 16) * s;
      pt.line([[hx + (i % 2 ? -6 : 6) * s, by + 6 * s], [hx + sw, y]], 6 * s, k + i);
    }
    pt.shape(ell(x, by, 52 * s, 20 * s, k + 5), I.paperLight, 6 * s, k + 5);
    const hx = x + f * 60 * s, hy = by - (o.down ? -8 : 26) * s;
    pt.line([[x + f * 40 * s, by - 6 * s], [hx, hy]], 9 * s, k + 7);
    pt.shape([[hx - f * 14 * s, hy - 14 * s], [hx + f * 30 * s, hy - 2 * s], [hx + f * 30 * s, hy + 8 * s], [hx - f * 12 * s, hy + 14 * s]], I.paperLight, 6 * s, k + 8, { smooth: false });
    pt.line([[hx - f * 8 * s, hy - 12 * s], [hx - f * 2 * s, hy - 30 * s], [hx + f * 6 * s, hy - 12 * s]], 5 * s, k + 9, { smooth: false });
    pt.dot(hx + f * 8 * s, hy - 3 * s, 4 * s, I.ink, k + 10);
    const tw = Math.sin(ph * 6.283 * 0.5) * 8 * s;
    pt.line([[x - f * 50 * s, by - 6 * s], [x - f * 72 * s, by - 30 * s + tw], [x - f * 58 * s, by - 44 * s + tw]], 6 * s, k + 11);
    return [hx + f * 20 * s, hy + 10 * s];
  }
  function tent(pt, x, y, s, k, o = {}) {
    const ax = x + 10 * s, ay = y - 250 * s;
    if (o.glow) pt.fill([[x - 175 * s, y], [ax, ay], [x + 175 * s, y]], I.gold, k + 1, { op: o.glow });
    pt.shape([[x - 175 * s, y], [ax, ay], [x + 60 * s, y]], o.glow ? I.gold : I.paperLight, 7 * s, k + 2, { op: o.glow ? Math.min(1, 0.35 + o.glow) : 1 });
    pt.shape([[x + 60 * s, y], [ax, ay], [x + 175 * s, y]], I.paperDark, 7 * s, k + 4);
    pt.shape([[x - 50 * s, y], [x - 20 * s, y - 120 * s], [x + 10 * s, y]], o.glow ? I.gold : I.paper, 5 * s, k + 6);
    const fl = Math.sin((o.t || 0) * 9) * 6 * s * (o.wind ?? 1);
    pt.line([[ax, ay], [ax + 14 * s, ay - 36 * s], [ax + 40 * s + fl, ay - 46 * s]], 5 * s, k + 8);
    pt.line([[x - 175 * s, y], [x - 250 * s, y + 4 * s]], 3 * s, k + 9, { col: I.inkSoft });
    pt.line([[x + 175 * s, y], [x + 250 * s, y + 4 * s]], 3 * s, k + 10, { col: I.inkSoft });
    pt.fill([[x - 200 * s, y + 2], [x - 100 * s, y - 16 * s], [x + 120 * s, y - 14 * s], [x + 210 * s, y + 2]], I.paperLight, k + 11);
  }
  function ship(pt, x, y, s, t, k) {             // barquentine with a funnel, faces right; y = waterline
    const L = 420 * s, roll = Math.sin(t * 1.3) * 0.03;
    const R = (px, py) => { const dx = px - x, dy = py - y; return [x + dx * Math.cos(roll) - dy * Math.sin(roll), y + dx * Math.sin(roll) + dy * Math.cos(roll)]; };
    pt.shape([R(x - L / 2, y - 50 * s), R(x + L / 2 + 30 * s, y - 62 * s), R(x + L / 2 - 20 * s, y + 6 * s), R(x - L / 2 + 20 * s, y + 6 * s)].map(p => p), I.ink, 6 * s, k, { smooth: false, op: 0.92 });
    pt.line([R(x - L / 2 + 10 * s, y - 34 * s), R(x + L / 2, y - 44 * s)], 4 * s, k + 1, { col: I.paperLight });
    [[-0.28, 300], [0.05, 330], [0.3, 290]].forEach(([u, h], i) => {
      const mx = x + u * L;
      pt.line([R(mx, y - 52 * s), R(mx, y - (52 + h) * s)], 6 * s, k + 2 + i);
      if (i > 0) for (let j = 0; j < 3; j++) { const yy = y - (110 + j * 70) * s; const wd = (88 - j * 18) * s; pt.line([R(mx - wd, yy), R(mx + wd, yy)], 5 * s, k + 6 + i * 3 + j); pt.fill([R(mx - wd * 0.9, yy + 4 * s), R(mx + wd * 0.9, yy + 4 * s), R(mx + wd * 0.8, yy + 46 * s), R(mx - wd * 0.8, yy + 46 * s)], I.paperLight, k + 30 + i * 3 + j, { op: 0.95 }); }
    });
    pt.line([R(x - 0.28 * L, y - 340 * s), R(x + L / 2 + 30 * s, y - 64 * s)], 3 * s, k + 20, { col: I.inkSoft });
    const fx = x - 0.1 * L;
    pt.shape([R(fx - 18 * s, y - 52 * s), R(fx + 18 * s, y - 52 * s), R(fx + 16 * s, y - 140 * s), R(fx - 16 * s, y - 140 * s)], I.red, 5 * s, k + 21, { smooth: false });
    for (let i = 0; i < 5; i++) { const u = ((t * 0.35 + i / 5) % 1); pt.fill(ell(fx - u * 260 * s, y - 150 * s - u * 90 * s, (16 + u * 40) * s, (12 + u * 26) * s, k + 40 + i), I.inkSoft, k + 40 + i, { op: 0.55 * (1 - u) }); }
  }
  function streaks(pt, W, H, t, n, k, o = {}) {   // wind-blown snow, left -> right
    const r = rng(k * 7 + 3), sp = o.speed ?? 900, y0 = o.y0 ?? 0, y1 = o.y1 ?? H;
    for (let i = 0; i < n; i++) {
      const yy = y0 + r() * (y1 - y0), L = 40 + r() * 120, v = sp * (0.6 + r() * 0.8), x = ((r() * (W + 400) + t * v) % (W + 400)) - 200;
      pt.line([[x, yy], [x + L * 0.5, yy + 3 + (o.slope ?? 0.08) * L], [x + L, yy + (o.slope ?? 0.08) * L * 2]], 2.4 + r() * 2.6, k + i, { col: r() < 0.5 ? I.inkSoft : I.paperLight, op: 0.55 + r() * 0.35, amp: 0.6 });
    }
  }
  // big Fraunces counter
  function counter(g, C) {
    if (!C) return null;
    const t = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size || 96, 'text-anchor': 'middle', fill: COL[C.color] || I.red,
      style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
    return { t, C };
  }
  function counterUpdate(o, lt, cues, W, H) {
    if (!o) return;
    const C = o.C, at = tc(cues, C.at, 0.3), p = progIO(lt, at, C.dur ?? 2), pk = punch(lt, at + (C.dur ?? 2), 0.6);
    o.t.style.display = lt < at ? 'none' : '';
    const v = Math.round(lerp(C.from ?? 0, C.to ?? 100, p));
    o.t.textContent = (C.prefix || '') + v.toLocaleString('en-US') + (C.suffix || '');
    o.t.setAttribute('transform', `translate(${F1(C.x * W)} ${F1(C.y * H)}) rotate(-3) scale(${(1 + 0.12 * pk).toFixed(3)})`);
  }
  // Kaşif / period-figure rig with a pose timeline
  function rigOf(parent, K, sd, extra) {
    if (!K) return null;
    const isK = (K.who || 'kasif') === 'kasif';
    const g = el(parent, 'g');
    const rig = KASIF.create(g, Object.assign({ scale: K.scale ?? 0.5, hat: isK, accessory: isK ? null : (K.accessory || 'beret'), beard: isK ? null : (K.beard || null), seed: sd }, extra || {}));
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
    const o = Object.assign({ x: K.x * W, y: (K.y ?? 0.8) * H, face: FC(c.face), since, dir: D(c.dir), emotion: c.emotion, ph: lt * (K.pace ?? 1.1), text: c.text, item: c.item, mouth: 0 }, over);
    if (pv && since < 0.3) { o.prev = { pose: pv.pose, since: since + 1, dir: D(pv.dir), ph: o.ph }; o.mix = since / 0.3; }
    R.rig.update(t, over.pose || c.pose, o);
    if (K.lean) R.g.setAttribute('transform', `rotate(${F1(K.lean + Math.sin(lt * 5) * 1.5)} ${F1(o.x)} ${F1(o.y)})`);
  }
  function base(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), rigs = el(root, 'g'), front = el(root, 'g'), top = el(root, 'g');
    const pb = painter(back), pm = painter(mid), pf = painter(front);
    const L = window.MCB.labels(top, P.labels || [], W, H, seed * 31 + 5);
    const cnt = counter(top, P.counter);
    const K = rigOf(rigs, P.kasif, seed * 17 + 3);
    return { P, W, H, seed, root, back, mid, rigs, front, top, pb, pm, pf, L, cnt, K,
      begin(t) { pb.begin(t); pm.begin(t); pf.begin(t); },
      end(lt, t, cues) { pb.end(); pm.end(); pf.end(); L.update(lt, t, cues); counterUpdate(cnt, lt, cues, W, H); rigUpdate(K, lt, t, cues, W, H); },
    };
  }
  // drifting sastrugi / snow texture lines on a ground band (scroll = px moved so far)
  function sastrugi(pt, W, H, gy, scroll, k, n = 26) {
    const r = rng(k * 5 + 1);
    for (let i = 0; i < n; i++) {
      const d = r(), y = gy + 14 + d * d * (H - gy - 10), L = 60 + d * 180, par = 0.3 + d * 0.9;
      const x = ((r() * (W + 600) - scroll * par) % (W + 600) + W + 600) % (W + 600) - 300;
      pt.line([[x, y], [x + L * 0.4, y - 6 - d * 10], [x + L, y]], 2.5 + d * 3.5, k + i, { col: I.inkSoft, op: 0.5 + d * 0.35, amp: 0.8 });
    }
  }

  // ================================================================ mw_crevasse
  SH.mw_crevasse = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'hang';
      const sy = (P.surface ?? (mode === 'hole' ? 0.62 : 0.36)) * H;
      const G = Object.assign({ x: 0.46, w: 0.2 }, P.gap || {}), gx = G.x * W, gw = G.w * W;
      const r = rng(seed * 11 + 7);
      // crevasse walls (static shape, boiled per frame)
      const lw = [], rw = [];
      for (let i = 0; i <= 9; i++) { const u = i / 9, y = sy + u * (H + 60 - sy); const nar = 1 - u * 0.72; lw.push([gx - gw / 2 * nar - (r() - 0.5) * 34 - (i === 0 ? 0 : 0), y]); rw.push([gx + gw / 2 * nar + (r() - 0.5) * 34, y]); }
      const strata = Array.from({ length: 5 }, (_, i) => sy + 70 + i * (H - sy) / 5 + r() * 30);
      const crumbs = Array.from({ length: 14 }, () => [r(), r(), r()]);
      const rope = mode === 'hang' || mode === 'climb' || mode === 'out';
      const S0 = Object.assign({ x: 0.78, to: 0.7 }, P.sledge || {});
      const dim = P.dim ? el(B.top, 'text', { 'font-family': INK_FONT, 'font-size': 64, fill: I.red, 'text-anchor': 'start',
        style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 10px` }) : null;
      if (dim) dim.textContent = P.dim.text;
      const men = (P.men || (mode === 'ledge' ? [{ x: 0.3 }, { x: 0.68, face: -1 }] : mode === 'hole' ? [] : [])).map((m, i) => rigOf(B.rigs, Object.assign({ who: 'm' + i, scale: 0.42, y: sy / H }, m), seed * 3 + i * 9));
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const hit = punch(lt, tc(cues, 'hit', -9), 0.6);
          // ice body + gap
          const body = [[-40, sy], [W + 40, sy], [W + 40, H + 60], [-40, H + 60]];
          let lip = 1;
          const brk = tc(cues, 'break', null);
          if (mode === 'climb' && brk != null && P.lip_break) lip = 1 - prog(lt, brk, 0.25);
          if (mode !== 'hole') {
          pb.fill(body, I.paperLight, seed + 1, { op: 0.92 });
          strata.forEach((y, i) => { pb.line([[-20, y], [W * 0.2, y + 18], [W * 0.5, y - 14], [W * 0.8, y + 16], [W + 20, y - 4]], 2.5, seed + 10 + i, { col: I.blue, op: 0.22 }); });
          const gapPts = lw.concat(rw.slice().reverse());
          pb.fill(gapPts, I.blue, seed + 30, { op: 0.55 });
          for (let j = 1; j <= 3; j++) {
            const yj = sy + (H - sy) * (0.25 + j * 0.2);
            const cut = gapPts.map(p => [p[0] + (gx - p[0]) * 0.08 * j, Math.max(p[1], yj)]);
            pb.fill(cut, I.ink, seed + 31 + j, { op: 0.22 });
          }
          pb.line(lw, 7, seed + 40); pb.line(rw, 7, seed + 41);
          // ice-wall hatching
          for (let i = 0; i < 14; i++) { const u = (i + 0.5) / 14, y = sy + u * (H - sy), xl = lerp(lw[0][0], lw[9][0], u), xr = lerp(rw[0][0], rw[9][0], u);
            pb.line([[xl - 40, y], [xl - 6, y + 30]], 3, seed + 50 + i, { col: I.inkSoft, op: 0.6 }); pb.line([[xr + 6, y], [xr + 40, y + 30]], 3, seed + 70 + i, { col: I.inkSoft, op: 0.6 }); }
          // surface line + snow lids overhanging the gap
          pb.line([[-40, sy], [lw[0][0] + 26, sy]], 7, seed + 90);
          const rl = rw[0][0] - 26 * lip;
          pb.line([[rl, sy], [W + 40, sy]], 7, seed + 91);
          pb.fill([[lw[0][0] - 40, sy - 10], [lw[0][0] + 30, sy - 4], [lw[0][0] + 20, sy + 26], [lw[0][0] - 30, sy + 30]], I.paperLight, seed + 92);
          if (lip > 0.02) pb.shape([[rw[0][0] + 40, sy - 10], [rw[0][0] - 30 * lip, sy - 4], [rw[0][0] - 20 * lip, sy + 24], [rw[0][0] + 30, sy + 30]], I.paperLight, 4, seed + 93);
          }
          if (brk != null && lt > brk && mode === 'climb' && P.lip_break) { const fp = lin(lt, brk, 1.4); pm.shape(ell(rw[0][0] - 10, sy + 20 + fp * fp * 700, 44, 28, seed + 94, 10, fp * 4), I.paperLight, 5, seed + 94); }
          // falling crumbs
          if (mode !== 'hole') crumbs.forEach((c, i) => { const u = (lt * (0.25 + c[2] * 0.3) + c[0]) % 1; const x = (c[1] < 0.5 ? lw[0][0] + 20 : rw[0][0] - 20) + Math.sin(u * 8 + i) * 12; pm.dot(x, sy + 20 + u * (H - sy), 4 + c[2] * 5, I.paperLight, seed + 100 + i, 1 - u); });
          // ---- modes
          if (rope) {
            const SX = lerp(S0.x, S0.to, sm(lt / Math.max(1, dur))) * W;
            const sl = tc(cues, 'slide', null), jolt = sl != null ? Math.exp(-Math.max(0, lt - sl) * 5) * (lt > sl ? 1 : 0) : 0;
            const sx = SX - jolt * 20;
            const sp = sledge(pm, sx + 340 * 0.6, sy, 0.6, seed + 200, { half: true });
            const lipP = [rw[0][0] - 6, sy - 6];
            // man position
            const top = sy + 210, deep = (P.depth ?? 0.72) * H;
            let hy = deep, onTop = 0, roll = 0;
            const up = tc(cues, 'up', null), out = tc(cues, 'out', null);
            if (mode === 'climb') { const pu = up != null ? progIO(lt, up, Math.max(0.6, (brk ?? dur * 0.7) - up)) : 0; hy = lerp(deep, top, pu); if (brk != null && lt > brk) hy = lerp(top, deep, sm(lin(lt, brk, 0.5))) + Math.sin(Math.max(0, lt - brk - 0.5) * 6) * 8 * Math.exp(-Math.max(0, lt - brk - 0.5)); }
            if (mode === 'out') { const pu = up != null ? progIO(lt, up, Math.max(0.6, (out ?? dur * 0.6) - up)) : 0; hy = lerp(deep, top - 40, pu); if (out != null && lt > out) { onTop = sm(lin(lt, out, 0.9)); roll = onTop; } }
            const sw = Math.sin(lt * 1.3) * (mode === 'hang' ? 26 : 10) * (1 - onTop);
            const mx = lerp(lipP[0] - 30 + sw, lipP[0] + 120, onTop), my = lerp(hy, sy - 30, onTop);
            const climb = mode !== 'hang' ? Math.sin(lt * 5) : 0;
            // rope: sledge -> lip -> hands
            const MS = P.man_s ?? 0.72, hands = [mx + (1 - onTop) * 6, my - 330 * MS];
            if (onTop < 0.6) {
              const rp = [sp.back, [lerp(sp.back[0], lipP[0], 0.5), sy - 4], lipP, [lipP[0] - 8, sy + 30], [hands[0], hands[1] - 30], [hands[0], hands[1]]];
              pm.line(rp, 6, seed + 220, { col: I.inkSoft });
              if (mode !== 'hang') for (let j = 0; j < 7; j++) { const yy = lerp(sy + 40, deep - 60, j / 6); if (yy > hands[1] + 20 || yy < sy + 30) continue; pm.dot(lerp(lipP[0] - 8, hands[0], (yy - sy) / Math.max(1, hands[1] - sy)), yy, 9, I.ink, seed + 230 + j); }
            } else pm.line([sp.back, [lerp(sp.back[0], mx, 0.5), sy - 6], [mx, sy - 20]], 6, seed + 221, { col: I.inkSoft });
            const pose = onTop > 0.5
              ? { torso: lerp(180, 270, roll), arms: [[230, 250], [200, 220]], legs: [[300, 280], [280, 270]], head: 70 }
              : { torso: 180 + sw * 0.15, arms: [[128 + climb * 14, 168 - climb * 8], [232 - climb * 14, 192 + climb * 8]], legs: [[-6 + sw * 0.4 + climb * 14, 4], [10 + sw * 0.4 - climb * 14, 0]], head: -14 };
            man(pf, Object.assign({ x: mx, y: my, s: MS, face: -1, beard: true, halo: true, worried: true }, pose), seed + 300);
            if (dim) { const da = tc(cues, P.dim.at, 0.6), dp = prog(lt, da, 0.6); dim.style.display = lt < da ? 'none' : '';
              const x0 = gx - gw / 2 - 150; pf.line([[x0 + 60, sy + 6], [x0 + 60, lerp(sy + 6, my - 80, dp)]], 6, seed + 400, { col: I.red });
              pf.line([[x0 + 40, sy + 6], [x0 + 80, sy + 6]], 6, seed + 401, { col: I.red });
              if (dp > 0.95) pf.line([[x0 + 40, my - 80], [x0 + 80, my - 80]], 6, seed + 402, { col: I.red });
              dim.setAttribute('x', x0 - 220); dim.setAttribute('y', (sy + my) / 2 - 40); }
          } else if (mode === 'ladder') {
            const sp = sledge(pm, W * 0.86, sy, 0.7, seed + 200, { half: true });
            const la = tc(cues, 'ladder', 0.6), u = progIO(lt, la, 2.2);
            const lipP = [rw[0][0] - 10, sy - 4], bottom = lerp(sy, H * 0.92, u);
            pm.line([sp.back, lipP], 6, seed + 210, { col: I.inkSoft });
            const sway = Math.sin(lt * 1.4) * 10;
            const r1 = [[lipP[0], lipP[1]], [lipP[0] - 20 + sway, bottom]], r2 = [[lipP[0] + 50, lipP[1]], [lipP[0] + 30 + sway, bottom]];
            pm.line([[sp.back[0], sp.back[1] + 10], [lipP[0] + 50, lipP[1]]], 6, seed + 211, { col: I.inkSoft });
            pm.line(r1, 6, seed + 212, { col: I.inkSoft }); pm.line(r2, 6, seed + 213, { col: I.inkSoft });
            for (let j = 1; j < 12; j++) { const yy = sy + j * 50; if (yy > bottom - 10) break; const f = (yy - sy) / Math.max(1, bottom - sy); pm.line([[lerp(r1[0][0], r1[1][0], f), yy], [lerp(r2[0][0], r2[1][0], f), yy]], 7, seed + 220 + j); }
            // coil on the sledge shrinks
            if (u < 1) pm.shape(ell(sp.back[0] + 80, sp.back[1] - 30, 44 * (1 - u * 0.7), 26 * (1 - u * 0.7), seed + 240), I.paperDark, 5, seed + 240);
          } else if (mode === 'ledge') {
            const ly = H * (P.ledge ?? 0.72), lx = lerp(lw[7][0], rw[7][0], 0.5);
            pm.shape([[lw[7][0] - 10, ly], [rw[7][0] + 10, ly - 10], [rw[7][0] + 6, ly + 36], [lw[7][0] - 6, ly + 40]], I.paperLight, 5, seed + 250);
            pm.line([[lx - 90, ly - 12], [lx + 10, ly - 30], [lx + 30, ly - 46]], 7, seed + 251);   // broken runner
            pm.shape([[lx - 70, ly - 14], [lx - 10, ly - 22], [lx - 14, ly - 54], [lx - 66, ly - 48]], I.paperDark, 5, seed + 252);
            const da = tc(cues, 'dog', 0.8);
            dog(pm, lx + 70, ly - 4, 0.42, 0, seed + 260, { still: true, down: lt < da || Math.sin((lt - da) * 1.2) < -0.3 });
            const ca = tc(cues, 'call', 0.3);
            for (let j = 0; j < 3; j++) { const u = ((lt - ca) * 0.6 + j / 3) % 1; if (lt < ca) break;
              const cx = gx, cy = sy + 20 + u * (ly - sy - 120), rr = 60 + u * 120;
              pf.line([[cx - rr, cy - rr * 0.15], [cx, cy + rr * 0.12], [cx + rr, cy - rr * 0.15]], 4, seed + 270 + j, { col: I.inkSoft, op: 0.85 * (1 - u) }); }
            men.forEach((R, i) => rigUpdate(R, lt, t, cues, W, H, { pose: Math.sin(lt * 2 + i) > 0.2 ? 'shock' : 'look', since: 0.5, emotion: 'worried' }));
          } else if (mode === 'hole') {
            // tracks from left that end in the hole
            const hx = gx, r2 = 1;
            [[-6, 0], [26, 0.5]].forEach(([dy, o], j) => pm.line([[-40, sy + 30 + dy], [hx - 140, sy + 22 + dy]], 5, seed + 280 + j, { col: I.inkSoft }));
            pm.fill([[hx - 150, sy + 6], [hx - 60, sy - 14], [hx + 70, sy - 10], [hx + 160, sy + 8], [hx + 90, sy + 34], [hx - 80, sy + 30]], I.ink, seed + 290, { op: 0.9, amp: 2 });
            pm.line([[hx - 150, sy + 6], [hx - 60, sy - 14], [hx + 70, sy - 10], [hx + 160, sy + 8]], 5, seed + 291);
            men.forEach((R, i) => rigUpdate(R, lt, t, cues, W, H));
          }
          if (mode === 'hole' || mode === 'ledge') streaks(pf, W, sy, t, 18, seed + 500, { speed: 500, y0: sy * 0.2, y1: sy });
          B.root.setAttribute('transform', hit ? `translate(${F1(Math.sin(lt * 50) * 10 * hit)} 0)` : '');
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_trek
  SH.mw_trek = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'march', gy = (P.ground ?? 0.8) * H;
      const teams = P.teams || (mode === 'march' || mode === 'look' ? [{ x: 0.36, dogs: 5 }, { x: 0.74, dogs: 5 }] : mode === 'dogs' ? [{ x: 0.62, dogs: 5 }] : []);
      const solo = mode === 'solo' || mode === 'collapse' || mode === 'pull';
      const hauler = solo ? rigOf(B.rigs, Object.assign({ who: 'mawson', beard: 'short', scale: 0.46, x: P.man_x ?? 0.62, y: P.ground ?? 0.8, pose: 'walk', face: 1, lean: 12 }, P.man || {}), seed * 5 + 1) : null;
      const skier = (mode === 'march' || mode === 'look') ? rigOf(B.rigs, Object.assign({ who: 'mertz', beard: 'black', scale: 0.42, x: 0.9, y: P.ground ?? 0.8, pose: 'walk', face: 1 }, P.skier || {}), seed * 5 + 2) : null;
      const drivers = teams.map((tm, i) => rigOf(B.rigs, { who: 'd' + i, beard: tm.beard || (i ? null : 'short'), scale: 0.4, x: tm.x - 0.2, y: (P.ground ?? 0.8), pose: 'walk', face: 1 }, seed * 5 + 10 + i));
      const tally = P.dog_tally;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const gave = mode === 'collapse' ? tc(cues, 'gave', dur * 0.5) : null;
          const stop = gave != null && lt > gave ? gave : null;
          const speed = P.speed ?? (solo ? 34 : 70);
          const scroll = (stop != null ? stop : lt) * speed;
          if (P.dusk) { const sx = W * 0.82, syy = gy - 160; pb.shape(ell(sx, syy, 60, 60, seed + 1), I.paperLight, 5, seed + 1, { lc: I.gold }); for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + lt * 0.1; pb.line([[sx + Math.cos(a) * 80, syy + Math.sin(a) * 80], [sx + Math.cos(a) * 104, syy + Math.sin(a) * 104]], 4, seed + 2 + k, { col: I.gold }); } }
          sastrugi(pb, W, H, gy, scroll, seed + 20);
          // teams
          teams.forEach((tm, i) => {
            const n = tm.dogs ?? 5, x0 = tm.x * W + Math.sin(lt * 0.7 + i) * 6;
            let alive = n;
            if (tally && tally.cross) alive = n - tally.cross.filter(c => lt >= tc(cues, c, 1e9) + 0.3).length;
            const sp = sledge(pm, x0, gy, 0.62, seed + 40 + i * 30, {});
            let px = sp.front[0] + 30;
            const lead = [];
            for (let d = 0; d < Math.max(0, alive); d++) { const dx = px + 60 + d * 112; lead.push(dog(pm, dx, gy - (d % 2) * 6, 0.68, lt * 2.1 + d * 0.31, seed + 60 + i * 30 + d)); }
            if (lead.length) pm.line([sp.front, [px + 20, gy - 40], lead[lead.length - 1]], 3, seed + 90 + i, { col: I.inkSoft });
            if (drivers[i]) { drivers[i].K.x = (x0 - 380) / W; }
          });
          drivers.forEach((R, i) => rigUpdate(R, lt, t, cues, W, H, { ph: lt * 1.25 + i * 0.4 }));
          if (skier) {
            const la = mode === 'look' ? tc(cues, 'look', dur * 0.5) : null;
            const looking = la != null && lt > la;
            rigUpdate(skier, lt, t, cues, W, H, looking ? { pose: 'look', face: -1, since: lt - la, emotion: 'worried', dir: 0 } : { ph: lt * 1.2 });
            const sx = skier.K.x * W; pf.line([[sx - 90, gy + 4], [sx + 110, gy + 2], [sx + 124, gy - 10]], 6, seed + 120); pf.line([[sx - 70, gy + 14], [sx + 130, gy + 12], [sx + 144, gy]], 6, seed + 121);
          }
          if (hauler) {
            const hx = hauler.K.x * W;
            let dy = 0, hide = false;
            if (stop != null) { const u = lin(lt, stop, 0.3); dy = u * u * 160; hide = u >= 0.7; }
            const sxF = hx - 120 + (stop != null ? sm(lin(lt, stop + 0.2, 1.2)) * 60 : 0);
            const sp = sledge(pm, sxF, gy, 0.6, seed + 140, { half: mode !== 'pull' });
            if (mode === 'pull') man(pm, { x: sxF - 160, y: gy - 70, s: 0.3, torso: 270, arms: [[300, 290], [280, 280]], legs: [[90, 90], [86, 88]], face: 1, head: 80, beard: true }, seed + 160);
            if (!hide) pm.line([sp.front, [hx - 40, gy - 140 + dy]], 4, seed + 150, { col: I.inkSoft });
            hauler.g.style.display = hide ? 'none' : '';
            rigUpdate(hauler, lt, t, cues, W, H, stop != null ? { y: gy + dy, pose: 'shock', since: lt - stop, emotion: 'surprised' } : { ph: lt * 0.9 });
            if (stop != null) {
              const u = sm(lin(lt, stop, 0.25));
              pf.fill([[hx - 120 * u, gy + 6], [hx - 40, gy - 6], [hx + 60, gy - 4], [hx + 130 * u, gy + 8], [hx + 50, gy + 40 * u + 10], [hx - 60, gy + 36 * u + 10]], I.ink, seed + 170, { op: 0.9 });
              for (let j = 0; j < 8; j++) { const v = lin(lt, stop, 1.2); pf.dot(hx + (j - 4) * 26, gy - 10 - Math.sin(v * Math.PI) * (40 + j * 7), 6, I.paperLight, seed + 180 + j, 1 - v); }
            }
          }
          if (mode === 'husky') {
            const hx = (P.dog_x ?? 0.56) * W, ds = P.dog_s ?? 2.0;
            sledge(pm, hx - 140, gy, 1.1, seed + 700, {});
            const breath = Math.sin(lt * 2.4) * 3 * ds, dk = seed + 720;
            dog(pm, hx + 120 * ds * 0.8, gy, ds, 0, dk, { still: true, down: true });
            const cx = hx + 96 * ds, cy = gy - 64 * ds;
            for (let j = 0; j < 4; j++) pm.line([[cx + j * 10 * ds, cy - 12 * ds + breath * 0.3], [cx - 3 * ds + j * 10 * ds, cy + 12 * ds]], 2.5 * ds * 0.6, dk + 40 + j, { col: I.inkSoft });
          }
          if (tally) {
            const n = tally.n ?? 6;
            for (let d = 0; d < n; d++) {
              const x = tally.x * W + d * 130, y = tally.y * H;
              dog(pf, x, y, 0.55, 0, seed + 300 + d * 13, { still: true });
              const ca = tally.cross && tally.cross[d] != null ? tc(cues, tally.cross[d], null) : null;
              if (ca != null && lt > ca) { const u = prog(lt, ca, 0.3); pf.line([[x - 50, y - 90], [x - 50 + 110 * u, y - 90 + 96 * u]], 8, seed + 400 + d, { col: I.red }); pf.line([[x + 60, y - 90], [x + 60 - 110 * u, y - 90 + 96 * u]], 8, seed + 420 + d, { col: I.red }); }
            }
          }
          if (P.wind || solo) streaks(pf, W, gy + 40, t, Math.round(20 + 30 * (P.wind ?? 0.6)), seed + 600, { speed: 700, y0: gy * 0.25, y1: gy + 30 });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_camp
  SH.mw_camp = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'cook', gy = (P.ground ?? 0.8) * H;
      const T = Object.assign({ x: 0.5, s: 1 }, P.tent || {});
      const names = P.names || [];
      const men = (P.men || (mode === 'trio' ? [{ x: 0.22, beard: null }, { x: 0.36, beard: 'black' }, { x: 0.8, beard: 'short' }] : mode === 'sick' ? [{ x: 0.72, beard: 'short', pose: 'idle', face: -1, emotion0: 'worried' }] : mode === 'dawn' ? [{ x: 0.74, beard: 'short', face: -1, emotion0: 'worried' }] : []))
        .map((m, i) => rigOf(B.rigs, Object.assign({ who: 'm' + i, scale: 0.46, y: P.ground ?? 0.8 }, m), seed * 7 + i * 11));
      const nameT = names.map((n, i) => { const tx = el(B.top, 'text', { 'font-family': INK_FONT, 'font-size': 60, 'text-anchor': 'middle', fill: i === names.length - 1 ? I.red : I.ink, style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 10px` }); tx.textContent = n; return tx; });
      const stars = mode === 'night' ? Array.from({ length: 18 }, (_, i) => { const r = rng(seed * 3 + i); return [r() * W, r() * gy * 0.6 + 60, r() * 6]; }) : [];
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          stars.forEach(([x, y, ph], i) => { const s = 8 + 4 * Math.sin(lt * 2.2 + ph); pb.line([[x - s, y], [x + s, y]], 3, seed + i * 2, { col: I.paperLight }); pb.line([[x, y - s], [x, y + s]], 3, seed + i * 2 + 1, { col: I.paperLight }); });
          let glow = 0;
          if (mode === 'night') { const da = tc(cues, 'dim', dur * 0.7); glow = 0.55 * (1 - prog(lt, da, 1.6)) * (0.9 + 0.1 * Math.sin(lt * 7)); }
          if (mode === 'trio') { sledge(pm, W * 0.16 + 340 * 0.6, gy, 0.6, seed + 30, {}); sledge(pm, W * 0.98, gy, 0.6, seed + 60, {}); }
          tent(pm, T.x * W, gy, T.s, seed + 100, { glow, t: lt });
          if (mode === 'cook') {
            const cx = T.x * W + 300, cy = gy - 10;
            pm.shape([[cx - 60, cy], [cx + 60, cy], [cx + 50, cy - 90], [cx - 50, cy - 90]], I.paperDark, 6, seed + 140, { smooth: false });
            pm.line([[cx - 70, cy - 90], [cx + 70, cy - 90]], 7, seed + 143);
            pm.dot(cx, cy + 6, 16, I.gold, seed + 144, 0.8 + 0.2 * Math.sin(lt * 9));
            for (let j = 0; j < 3; j++) { const u = (lt * 0.5 + j / 3) % 1; pm.line([[cx - 20 + j * 20, cy - 100 - u * 160], [cx - 4 + j * 20 + Math.sin(u * 6 + j) * 18, cy - 140 - u * 160], [cx - 16 + j * 20, cy - 180 - u * 160]], 5, seed + 150 + j, { col: I.inkSoft, op: 1 - u }); }
          }
          if (mode === 'sick') man(pm, { x: T.x * W + 250, y: gy - 50, s: 0.42, torso: 205 + Math.sin(lt * 0.8) * 4, arms: [[30, 70], [40, 80]], legs: [[95, 10], [100, 0]], head: 30, face: 1, beard: true, cap: true }, seed + 160);
          men.forEach((R, i) => { if (mode === 'trio') R.K.pose = 'idle'; rigUpdate(R, lt, t, cues, W, H, mode === 'dawn' ? { pose: 'idle', emotion: 'worried' } : {}); });
          nameT.forEach((tx, i) => { const R = men[i]; if (!R) return; const a = 0.4 + i * 0.5, p = spring(lt, a, 0.5); tx.style.display = lt < a ? 'none' : '';
            tx.setAttribute('transform', `translate(${F1(R.K.x * W)} ${F1(gy - 330)}) rotate(-3) scale(${p.toFixed(3)})`); });
          if (mode !== 'night') streaks(pf, W, gy, t, 16, seed + 600, { speed: 400, y0: gy * 0.3, y1: gy });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_hut
  SH.mw_hut = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'blizzard', gy = (P.ground ?? 0.8) * H;
      const HT = Object.assign({ x: 0.42, s: 1 }, P.hut || {});
      const wind = P.wind ?? (mode === 'radio' || mode === 'winter' ? 0.5 : 1);
      const men = (P.men || (mode === 'lean' ? [{ x: 0.66, lean: -16, face: -1, beard: 'short' }, { x: 0.8, lean: -18, face: -1 }] : []))
        .map((m, i) => rigOf(B.rigs, Object.assign({ who: 'm' + i, scale: 0.42, y: P.ground ?? 0.8, pose: m.lean ? 'walk' : 'idle' }, m), seed * 9 + i * 7));
      if (B.K && P.kasif && P.kasif.lean) B.K.K.lean = P.kasif.lean;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const s = HT.s, x = HT.x * W, w = 520 * s, h = 150 * s;
          // hut
          pm.shape([[x - w / 2, gy], [x + w / 2, gy], [x + w / 2, gy - h], [x - w / 2, gy - h]], I.paperDark, 7 * s, seed + 1, { smooth: false });
          for (let i = 1; i < 9; i++) pm.line([[x - w / 2 + 8, gy - i * h / 9], [x + w / 2 - 8, gy - i * h / 9]], 2.5, seed + 3 + i, { col: I.inkSoft, op: 0.7 });
          pm.shape([[x - w / 2 - 40 * s, gy - h], [x, gy - h - 250 * s], [x + w / 2 + 40 * s, gy - h]], I.paper, 7 * s, seed + 20, { smooth: false });
          pm.fill([[x - w / 2 - 40 * s, gy - h], [x - 40 * s, gy - h - 210 * s], [x - 10 * s, gy - h - 120 * s], [x - w / 4, gy - h + 4]], I.paperLight, seed + 22);   // snow on the roof
          const win = mode === 'winter' ? 0.55 + 0.25 * Math.sin(lt * 3) : 0;
          [[-0.3], [0.18]].forEach(([u], i) => pm.shape([[x + u * w - 34 * s, gy - h * 0.75], [x + u * w + 34 * s, gy - h * 0.75], [x + u * w + 34 * s, gy - h * 0.3], [x + u * w - 34 * s, gy - h * 0.3]], win ? I.gold : I.paperLight, 5 * s, seed + 30 + i * 2, { smooth: false, op: win ? win + 0.3 : 1 }));
          // chimney smoke torn by the wind
          const cx = x + 80 * s, cyy = gy - h - 150 * s;
          pm.shape([[cx - 16 * s, cyy + 60 * s], [cx + 16 * s, cyy + 60 * s], [cx + 16 * s, cyy - 20 * s], [cx - 16 * s, cyy - 20 * s]], I.paperDark, 5 * s, seed + 40, { smooth: false });
          for (let i = 0; i < 6; i++) { const u = (lt * (0.5 + wind * 0.8) + i / 6) % 1; pm.fill(ell(cx + u * 380 * (0.4 + wind), cyy - 40 * s - u * (120 - wind * 90), 20 + u * 40, 14 + u * 20, seed + 50 + i), I.inkSoft, seed + 50 + i, { op: 0.5 * (1 - u) }); }
          // drifts
          pm.fill([[x - w / 2 - 140, gy + 6], [x - w / 2 - 20, gy - 70 * s], [x - w / 2 + 30, gy + 6]], I.paperLight, seed + 60);
          // anemometer
          const ax = x + w / 2 + 120 * s, atop = gy - 400 * s;
          pm.line([[ax, gy], [ax, atop]], 7, seed + 70);
          const spin = lt * (2 + wind * 14);
          for (let i = 0; i < 3; i++) { const a = spin + i * 2.094, ex = ax + Math.cos(a) * 70 * s, ey = atop + Math.sin(a) * 18 * s; pm.line([[ax, atop], [ex, ey]], 5, seed + 72 + i); pm.shape(ell(ex, ey, 18 * s, 14 * s, seed + 76 + i), I.paperLight, 5, seed + 76 + i); }
          if (mode === 'radio') {
            const m1 = x - w / 2 - 260 * s, m2 = x + w / 2 + 420 * s, mt = gy - 640 * s;
            pm.line([[m1, gy], [m1, mt]], 8, seed + 80); pm.line([[m2, gy], [m2, mt + 30]], 8, seed + 81);
            pm.line([[m1, mt + 10], [(m1 + m2) / 2, mt + 50], [m2, mt + 40]], 3, seed + 82, { col: I.inkSoft });
            const ra = tc(cues, 'radio', 0.4);
            if (lt > ra) for (let j = 0; j < 4; j++) { const u = ((lt - ra) * 0.5 + j / 4) % 1, rr = 40 + u * 700; pf.line([[m2 + rr * 0.3, mt - rr * 0.5], [m2 + rr * 0.55, mt], [m2 + rr * 0.3, mt + rr * 0.5]], 6, seed + 90 + j, { col: I.red, op: 0.9 * (1 - u) }); }
            pb.fill([[-40, gy - 6], [W * 0.5, gy - 14], [W + 40, gy - 4], [W + 40, H + 40], [-40, H + 40]], I.paperLight, seed + 130, { op: 0.96 });
            pb.line([[-40, gy - 6], [W * 0.5, gy - 14], [W + 40, gy - 4]], 5, seed + 131);
            const S = Object.assign({ x: 0.9, y: 0.6, s: 0.22 }, P.ship || {});
            ship(pm, S.x * W, S.y * H, S.s, lt, seed + 120);
          }
          men.forEach((R, i) => rigUpdate(R, lt, t, cues, W, H, R.K.lean ? { ph: lt * 0.5 } : {}));
          if (wind > 0.3) streaks(pf, W, H, t, Math.round(30 + wind * 60), seed + 700, { speed: 500 + wind * 900, y0: 40, y1: gy + 40 });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_katabatic
  SH.mw_katabatic = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const sea = H * 0.72;
      const prof = []; for (let i = 0; i <= 24; i++) { const u = i / 24, x = -40 + u * (W * 0.7); prof.push([x, lerp(H * 0.34, sea, Math.pow(u, 2.2))]); }
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const shoreX = prof[prof.length - 1][0];
          // sea
          pb.fill([[shoreX - 20, sea], [W + 40, sea], [W + 40, H + 40], [shoreX - 20, H + 40]], I.blue, seed + 1, { op: 0.38 });
          for (let i = 0; i < 10; i++) { const y = sea + 30 + (i % 5) * 50, xx = shoreX + 60 + ((i * 197 + lt * 40) % (W - shoreX)); pb.line([[xx, y], [xx + 40, y - 8], [xx + 80, y]], 4, seed + 10 + i, { col: I.blue }); }
          pb.line([[shoreX, sea], [W + 40, sea]], 5, seed + 2, { col: I.blue });
          // ice cap
          pm.fill(prof.concat([[shoreX, H + 40], [-40, H + 40]]), I.paperLight, seed + 20);
          pm.line(prof, 8, seed + 21);
          for (let i = 0; i < 9; i++) { const u = 0.08 + i * 0.1, p = prof[Math.round(u * 24)]; pm.line([[p[0] - 30, p[1] + 50 + i * 14], [p[0] + 60, p[1] + 70 + i * 14]], 3, seed + 30 + i, { col: I.blue, op: 0.5 }); }
          // hut on the shore
          const hx = shoreX - 70, hy = prof[22][1] + 10;
          pm.shape([[hx - 30, hy], [hx + 30, hy], [hx + 30, hy - 26], [hx, hy - 54], [hx - 30, hy - 26]], I.paperDark, 4, seed + 40, { smooth: false });
          // cold air streams (accelerate downhill)
          const fa = tc(cues, 'flow', 0.3);
          for (let s = 0; s < 4; s++) {
            const off = 40 + s * 46;
            for (let j = 0; j < 6; j++) {
              const u0 = ((lt - fa) * (0.22 + s * 0.02) + j / 6 + s * 0.13) % 1;
              if (lt < fa || u0 < 0) continue;
              const u = Math.pow(u0, 0.7), i0 = Math.min(23, Math.floor(u * 24)), p0 = prof[i0], p1 = prof[i0 + 1];
              const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), nx = Math.sin(ang), ny = -Math.cos(ang);
              const px = lerp(p0[0], p1[0], u * 24 - i0) + nx * off, py = lerp(p0[1], p1[1], u * 24 - i0) + ny * off;
              const L = 40 + u * 120;
              const tail = [px - Math.cos(ang) * L, py - Math.sin(ang) * L];
              pf.line([tail, [px, py]], 6, seed + 100 + s * 10 + j, { col: I.blue, op: 0.9 });
              pf.line([[px - Math.cos(ang - 0.5) * 26, py - Math.sin(ang - 0.5) * 26], [px, py], [px - Math.cos(ang + 0.5) * 26, py - Math.sin(ang + 0.5) * 26]], 6, seed + 160 + s * 10 + j, { col: I.blue, smooth: false });
            }
          }
          // spray
          if (lt > fa + 1) for (let j = 0; j < 12; j++) { const u = ((lt - fa) * 0.8 + j / 12) % 1; pf.dot(shoreX + 40 + u * 460 + (j % 3) * 30, sea - 20 - Math.sin(u * Math.PI) * (60 + (j % 4) * 30), 7, I.paperLight, seed + 300 + j, 1 - u * 0.8); }
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_gear
  SH.mw_gear = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'cut', gy = (P.ground ?? 0.78) * H;
      const lines = (P.lines || []).map((s, i) => { const tx = el(B.top, 'text', { 'font-family': INK_FONT, 'font-size': 92, fill: i === 0 ? I.red : I.ink, 'text-anchor': 'start' }); tx.textContent = s; return tx; });
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          if (mode === 'cut') {
            const ca = tc(cues, 'cut', 0.8), u = sm(lin(lt, ca + 0.5, 1.4));
            const s = 1.9, front = W * 0.88, L = 340 * s, mid = front - L / 2 - 20;
            // rear half (slides left)
            pm.line([[front - L - u * 220, gy], [mid - u * 220, gy]], 8 * s, seed + 1);
            for (let i = 0; i < 2; i++) pm.line([[front - L + 40 + i * 140 - u * 220, gy], [front - L + 40 + i * 140 - u * 220, gy - 34 * s]], 6 * s, seed + 3 + i, { op: 1 - u * 0.6 });
            pm.line([[front - L - u * 220, gy - 34 * s], [mid - u * 220, gy - 34 * s]], 7 * s, seed + 6, { op: 1 - u * 0.6 });
            sledge(pm, front, gy, s, seed + 10, { half: true, load: true });
            if (lt > ca) { const p = prog(lt, ca, 0.5); pf.line([[mid + 10, gy - 34 * s - 60], [mid + 10, lerp(gy - 34 * s - 60, gy + 40, p)]], 10, seed + 40, { col: I.red }); }
            if (lt > ca && lt < ca + 1.4) { const sx = mid + 10 + Math.sin(lt * 20) * 30; pf.shape([[sx - 80, gy - 120], [sx + 80, gy - 120], [sx + 80, gy - 90], [sx - 80, gy - 96]], I.paperLight, 5, seed + 50, { smooth: false }); for (let j = 0; j < 8; j++) pf.line([[sx - 70 + j * 18, gy - 90], [sx - 62 + j * 18, gy - 78]], 3, seed + 60 + j); }
          } else if (mode === 'feet') {
            const cx = W * 0.58, cy = H * 0.5, s = 1.15;
            const foot = []; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; const rx = 150 * s * (a < Math.PI ? 1 : 0.86), ry = 360 * s; foot.push([cx + Math.cos(a) * rx * (1 - 0.18 * Math.sin(a)), cy + Math.sin(a) * ry * (a > Math.PI ? 1 : 0.92)]); }
            pm.shape(foot, I.paperLight, 8, seed + 1);
            for (let i = 0; i < 5; i++) { const a = Math.PI * (1.18 + i * 0.16); pm.shape(ell(cx + Math.cos(a) * 170 * s, cy - 330 * s + Math.abs(i - 1) * 16 - 46, (36 - i * 4) * s, (40 - i * 4) * s, seed + 10 + i), I.paperLight, 6, seed + 10 + i); }
            const pa = tc(cues, 'peel', 1), u = sm(lin(lt, pa, 1.6));
            const sole = foot.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8]);
            const piv = [cx, cy - 220 * s], ang = -u * 0.5;
            const rot = sole.map(([x, y]) => { const dx = x - piv[0], dy = y - piv[1]; return [piv[0] + dx * Math.cos(ang) - dy * Math.sin(ang) + u * 240, piv[1] + dx * Math.sin(ang) + dy * Math.cos(ang) + u * 30]; });
            if (u > 0.01) pm.fill(sole, I.red, seed + 30, { op: 0.28 });
            pf.shape(rot, I.paperDark, 5, seed + 31, { op: 0.85 });
            for (let i = 0; i < 6; i++) { const a = rot[Math.floor(i * 3)], b2 = rot[Math.floor(i * 3) + 1]; pf.line([a, [lerp(a[0], cx, 0.2), lerp(a[1], cy, 0.2)]], 2.5, seed + 40 + i, { col: I.inkSoft }); }
          } else if (mode === 'lost') {
            // the load of the lost sledge laid out on the snow: tent, food bags, dog food; a red X lands on each
            const items = P.items || ['a', 'b', 'c'];
            const xs = [0.22, 0.48, 0.72].map(u => u * W);
            tent(pm, xs[0], gy, 0.95, seed + 10, { t: lt });
            [[-70, 0], [50, 0], [-10, -110]].forEach(([dx, dy], j) => { const bx = xs[1] + dx, by = gy + dy; pm.shape([[bx - 60, by], [bx + 60, by], [bx + 50, by - 100], [bx + 20, by - 130], [bx - 20, by - 130], [bx - 50, by - 100]], I.paperDark, 6, seed + 30 + j * 3);
              pm.line([[bx - 22, by - 122], [bx + 22, by - 122]], 6, seed + 31 + j * 3); });
            [[-80, 0], [80, 0], [0, -130]].forEach(([dx, dy], j) => { const bx = xs[2] + dx, by = gy + dy; pm.shape([[bx - 70, by], [bx + 70, by], [bx + 70, by - 120], [bx - 70, by - 120]], I.paper, 6, seed + 50 + j * 3, { smooth: false });
              pm.line([[bx - 50, by - 60], [bx + 50, by - 60]], 4, seed + 51 + j * 3, { col: I.inkSoft }); });
            dog(pm, xs[2] + 230, gy, 0.6, lt * 0.6, seed + 70, { still: true, down: true });
            items.forEach((c, j) => { const at = tc(cues, c, 1e9); if (lt < at) return; const u = spring(lt, at, 0.5), x = xs[j], y = gy - 140, r = 150 * Math.min(1.2, u);
              pf.line([[x - r, y - r], [x + r, y + r]], 16, seed + 90 + j * 2, { col: I.red }); pf.line([[x + r, y - r], [x - r, y + r]], 16, seed + 91 + j * 2, { col: I.red }); });
            streaks(pf, W, gy + 30, t, 20, seed + 600, { speed: 500, y0: 60, y1: gy });
          } else if (mode === 'hand') {
            // a pot with a liver at left, Mertz's hand at right; skin flakes peel off and drift away
            const px = W * 0.26, py = gy;
            pm.dot(px, py + 4, 22, I.gold, seed + 1, 0.8 + 0.2 * Math.sin(lt * 9));
            pm.shape([[px - 140, py - 20], [px + 140, py - 20], [px + 120, py - 200], [px - 120, py - 200]], I.paperDark, 7, seed + 2, { smooth: false });
            pm.line([[px - 160, py - 200], [px + 160, py - 200]], 8, seed + 3);
            pm.shape([[px - 90, py - 205], [px - 40, py - 250], [px + 40, py - 252], [px + 95, py - 215], [px + 20, py - 196]], I.red, 5, seed + 4, { op: 0.85 });
            for (let j = 0; j < 3; j++) { const u = (lt * 0.5 + j / 3) % 1; pm.line([[px - 40 + j * 40, py - 270 - u * 150], [px - 24 + j * 40 + Math.sin(u * 6 + j) * 18, py - 310 - u * 150]], 5, seed + 10 + j, { col: I.inkSoft, op: 1 - u }); }
            // hand (palm up, fingers)
            const hx = W * 0.68, hy = H * 0.56, s2 = 1.2;
            const palm = [[hx - 120 * s2, hy + 140 * s2], [hx - 130 * s2, hy - 10 * s2], [hx - 90 * s2, hy - 60 * s2], [hx + 90 * s2, hy - 60 * s2], [hx + 120 * s2, hy - 10 * s2], [hx + 110 * s2, hy + 140 * s2]];
            pm.line([[hx - 110 * s2, hy + 140 * s2], [hx - 120 * s2, hy + 320 * s2]], 10, seed + 20); pm.line([[hx + 100 * s2, hy + 140 * s2], [hx + 110 * s2, hy + 320 * s2]], 10, seed + 21);
            [[-80, -230], [-25, -270], [30, -265], [85, -220]].forEach(([fx, fy], j) => pm.shape([[hx + (fx - 26) * s2, hy - 50 * s2], [hx + (fx - 22) * s2, hy + fy * s2], [hx + (fx + 22) * s2, hy + fy * s2], [hx + (fx + 26) * s2, hy - 50 * s2]], I.paperLight, 7, seed + 30 + j * 2));
            pm.shape([[hx - 120 * s2, hy + 20 * s2], [hx - 200 * s2, hy - 60 * s2], [hx - 225 * s2, hy - 30 * s2], [hx - 130 * s2, hy + 80 * s2]], I.paperLight, 7, seed + 40);
            pm.shape(palm, I.paperLight, 7, seed + 42);
            const pa = tc(cues, 'peel', 0.8);
            for (let j = 0; j < 9; j++) { const r0 = rng(seed * 3 + j), ax = hx + (r0() - 0.5) * 200 * s2, ay = hy + (r0() - 0.3) * 160 * s2;
              pm.fill(ell(ax, ay, 22, 12, seed + 60 + j, 8, r0() * 3), I.red, seed + 60 + j, { op: 0.22 });
              const u = lt < pa ? 0 : ((lt - pa) * 0.35 + j / 9) % 1, fx = ax + u * 380 + Math.sin(u * 8 + j) * 30, fy = ay - u * 260;
              pf.shape(ell(fx, fy, 20, 11, seed + 80 + j, 8, u * 4 + j), I.paperDark, 3, seed + 80 + j, { op: lt < pa ? 0 : 1 - u * 0.8 }); }
          } else if (mode === 'note') {
            // food bag + note pinned on a snow block
            pb.shape([[W * 0.12, gy], [W * 0.88, gy], [W * 0.84, H * 0.14], [W * 0.16, H * 0.12]], I.paperLight, 7, seed + 1, { smooth: false });
            pm.shape([[W * 0.24, H * 0.24], [W * 0.78, H * 0.22], [W * 0.8, H * 0.66], [W * 0.22, H * 0.68]], I.paper, 5, seed + 2, { smooth: false });
            pm.dot(W * 0.51, H * 0.27, 12, I.red, seed + 3);
            const a0 = tc(cues, P.at, 0.3);
            lines.forEach((tx, i) => { const a = a0 + i * 0.9, p = prog(lt, a, 0.8); tx.style.display = lt < a ? 'none' : ''; tx.setAttribute('x', W * 0.28); tx.setAttribute('y', H * (0.38 + i * 0.12));
              tx.setAttribute('clip-path', ''); tx.setAttribute('opacity', p.toFixed(3)); tx.setAttribute('transform', `rotate(-2 ${W * 0.5} ${H * 0.4}) translate(${F1((1 - p) * -20)} 0)`); });
            const flap = Math.sin(lt * 6) * 8;
            pm.line([[W * 0.22, H * 0.68], [W * 0.2 - flap, H * 0.72]], 5, seed + 4);
            streaks(pf, W, H, t, 14, seed + 600, { speed: 500, y0: 0, y1: gy });
          }
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_cairn
  SH.mw_cairn = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'far', gy = (P.ground ?? 0.8) * H;
      const far = mode === 'far';
      const hauler = far ? rigOf(B.rigs, { who: 'mawson', beard: 'short', scale: 0.42, x: 0.22, y: P.ground ?? 0.8, pose: 'walk', face: 1, lean: 10 }, seed * 5 + 1) : null;
      const tiny = !far ? [0, 1, 2].map(i => rigOf(B.rigs, { who: 't' + i, scale: 0.12, x: 0.84 + i * 0.03, y: (P.ground ?? 0.8) - 0.3, pose: 'walk', face: 1 }, seed * 5 + 20 + i)) : [];
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const cx = (P.cairn_x ?? (far ? 0.78 : 0.42)) * W, s = far ? 0.45 : 1.25, cb = far ? gy - 120 : gy;
          const bk = tc(cues, 'black', 0.5), pk = punch(lt, bk, 0.7);
          pm.shape([[cx - 160 * s, cb], [cx + 160 * s, cb], [cx + 60 * s, cb - 260 * s], [cx - 60 * s, cb - 260 * s]], I.paperLight, 7 * s, seed + 1);
          for (let i = 1; i < 4; i++) { const y = cb - i * 65 * s, hw = lerp(160, 60, i / 4) * s; pm.line([[cx - hw, y], [cx + hw, y]], 3 * s, seed + 3 + i, { col: I.inkSoft }); }
          const ptop = cb - 520 * s;
          pm.line([[cx, cb - 250 * s], [cx, ptop]], 8 * s, seed + 10);
          const fl = []; for (let i = 0; i <= 6; i++) { const u = i / 6; fl.push([cx + u * 190 * s * (1 + 0.1 * pk), ptop + 10 * s + Math.sin(lt * 7 - u * 4) * 22 * s * u]); }
          const fl2 = fl.slice().reverse().map(([x, y]) => [x, y + 100 * s]);
          pm.shape(fl.concat(fl2), I.ink, 4 * s, seed + 12, { op: 0.92 });
          if (!far) {
            pm.shape([[cx + 170, gy], [cx + 330, gy], [cx + 310, gy - 120], [cx + 250, gy - 150], [cx + 190, gy - 120]], I.paperDark, 6, seed + 30);
            pm.line([[cx + 230, gy - 140], [cx + 270, gy - 140]], 5, seed + 31);
            for (let j = 0; j < 16; j++) { const u = j / 16, x = lerp(cx + 360, W * 0.84, u), y = lerp(gy + 40, gy - 0.3 * H + 10, Math.pow(u, 0.6)), sz = lerp(18, 4, u);
              pm.fill(ell(x + (j % 2) * 24 * (1 - u), y, sz * 1.4, sz * 0.6, seed + 40 + j), I.inkSoft, seed + 40 + j, { op: 0.75 }); }
            tiny.forEach((R, i) => { R.K.x = 0.84 + i * 0.035 + lt * 0.004; rigUpdate(R, lt, t, cues, W, H, { ph: lt * 1.2 + i * 0.3 }); });
          }
          if (hauler) { const hx = hauler.K.x * W; const sp = sledge(pm, hx - 110, gy, 0.55, seed + 60, { half: true }); pm.line([sp.front, [hx - 40, gy - 130]], 4, seed + 61, { col: I.inkSoft }); hauler.K.x = 0.22 + lt * 0.006; rigUpdate(hauler, lt, t, cues, W, H, lt > bk ? { pose: 'shock', since: lt - bk, emotion: 'surprised' } : { ph: lt * 0.9 }); }
          streaks(pf, W, gy + 30, t, far ? 40 : 26, seed + 600, { speed: 600, y0: 60, y1: gy + 20 });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mw_ship
  SH.mw_ship = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'close';
      const S = Object.assign(mode === 'rise' ? { x: 0.8, y: 0.5, s: 0.16, to: 0.86 } : { x: 0.46, y: 0.68, s: 0.95, to: 0.62, s1: 0.6 }, P.ship || {});
      const watcher = mode === 'rise' ? rigOf(B.rigs, Object.assign({ who: 'mawson', beard: 'short', scale: 0.5, x: 0.24, y: 0.62, pose: 'look', face: 1, dir: 0 }, P.man || {}), seed * 5 + 1) : null;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const u = progIO(lt, 0, Math.max(1, dur));
          const sx = lerp(S.x, S.to, u) * W, ss = lerp(S.s, S.s1 ?? S.s * 0.85, u);
          ship(pm, sx, S.y * H, ss, lt, seed + 10);
          if (mode === 'close') for (let i = 0; i < 6; i++) { const xx = sx - 260 * ss - i * 120 - (lt * 30 % 120); pm.line([[xx, S.y * H + 10 + i * 4], [xx - 80, S.y * H + 14 + i * 5]], 4, seed + 100 + i, { col: I.paperLight, op: 1 - i / 6 }); }
          if (mode === 'rise') {
            // hut on the shore below, the ridge in front
            const hx = W * 0.44, hy = H * 0.705;
            pm.shape([[hx - 40, hy], [hx + 40, hy], [hx + 40, hy - 26], [hx, hy - 60], [hx - 40, hy - 26]], I.paperDark, 4, seed + 40, { smooth: false });
            pf.fill([[-40, H * 0.62], [W * 0.12, H * 0.6], [W * 0.38, H * 0.66], [W * 0.62, H * 0.82], [W + 40, H * 0.9], [W + 40, H + 40], [-40, H + 40]], I.paperLight, seed + 50);
            pf.line([[-40, H * 0.62], [W * 0.12, H * 0.6], [W * 0.38, H * 0.66], [W * 0.62, H * 0.82], [W + 40, H * 0.9]], 7, seed + 51);
            sastrugi(pf, W, H, H * 0.74, 0, seed + 60, 12);
            rigUpdate(watcher, lt, t, cues, W, H, {});
          }
          streaks(pf, W, H * 0.9, t, mode === 'rise' ? 24 : 12, seed + 600, { speed: 500, y0: 40, y1: H * 0.85 });
          B.end(lt, t, cues);
        },
      };
    },
  };
})();
