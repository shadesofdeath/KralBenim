// tz__lib: shared helpers for the tz_* shots (John I Tzimiskes, "Çemişgezekli İoannes", 969). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything is a pure function of (seed, t); no Math.random.
// window.TZ = {
//   atOr(cues, name|sec, fb), f1, rect, arc,
//   Shapes(): registry {add(parent, pts | (lt) => pts, {fill, fop, stroke, w, seed, amp, smooth, closed, vis}), update(t, lt)}
//   coin(parent, seed) -> {g, update(t, cx, cy, R, o)}: a Byzantine gold histamenon, obverse "Mary crowns the emperor":
//     o: {crown: 0..1 (0 = the crown in Mary's raised hand, 1 = on the emperor's head), glint: 0..1 (sparkle),
//     tilt: 1 (vertical squash, a coin turning), rot: deg, wet: 0..1 (drips hanging from the rim)}
//   person(parent, seed, o) -> {update(t, pose, opts)}: a period figure (KASIF rig, no hat) wearing a long Byzantine robe
//     o: {scale, accessory: 'crown'|'helmet_byz'|null, beard, robe: 'red'|'blue'|'light'|'dark'|'gold', veil: false,
//     stole: false (patriarch's white stole with crosses)}; opts as KASIF update (x, y = ground px, face, dir, emotion)
//   water(parent, seed) -> {update(t, W, H, y0, o)}: sea surface band from y0 to the frame bottom, rolling wave lines
//     o: {dark: false, rough: 1}
//   boat(parent, seed) -> {update(t, x, y, s, o) -> {deck: [x, y], rock}}: a small rowing boat, o: {oar: phase 0..1 | null}
//   drops(parent, seed) -> {add({x, y, vx, vy, at, g, size, floor}), update(lt, t)}: falling water drops
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const arc = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const orient = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a < 0 ? pts.slice().reverse() : pts; };

  function Shapes() {
    const list = [];
    let n = 0;
    return {
      list,
      add(parent, pts, o = {}) {
        const seed = o.seed ?? (n += 7) * 13 + 101;
        const e = { pts, o, seed,
          f: o.fill ? inkEl(parent, o.fill, o.fop != null ? { 'fill-opacity': o.fop } : {}) : null,
          l: o.stroke ? inkEl(parent, o.stroke, o.sop != null ? { 'fill-opacity': o.sop } : {}) : null };
        list.push(e);
        return e;
      },
      update(t, lt) {
        for (const e of list) {
          const o = e.o, vis = o.vis ? o.vis(lt) : true;
          const pts = vis ? (typeof e.pts === 'function' ? e.pts(lt) : e.pts) : null;
          if (!pts || pts.length < 2) { if (e.f) e.f.setAttribute('d', ''); if (e.l) e.l.setAttribute('d', ''); continue; }
          const amp = o.amp ?? 1.3, smooth = o.smooth ?? false, closed = o.closed ?? true;
          if (e.f) e.f.setAttribute('d', pts.length > 2 ? inkLoop(orient(pts), { seed: e.seed, t, amp, smooth }) : '');
          if (e.l) e.l.setAttribute('d', inkPath(pts, { seed: e.seed + 1, t, amp, w: o.w ?? 5, closed, smooth }));
        }
      },
    };
  }

  // ------------------------------------------------------------------ gold coin (histamenon of John I, 969-976)
  function coin(parent, seed) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const GOLD = INK.gold, GL = mix(INK.gold, INK.paperLight, 0.45), GD = mix(INK.gold, INK.ink, 0.35);
    const shadow = P(INK.ink, { 'fill-opacity': 0.22 }), disc = P(GOLD), field = P(GL), rim = P(), rim2 = P(GD), beads = P(GD);
    const letters = P(GD);
    const halo = P(mix(INK.gold, INK.paperLight, 0.7)), haloR = P(GD);
    const maryVeil = P(INK.blue, { 'fill-opacity': 0.9 }), maryVeilR = P(), maryFace = P(INK.paperLight), maryFaceR = P(), maryArm = P(INK.blue), maryArmR = P(), maryHand = P(INK.paperLight);
    const empRobe = P(GD), empRobeR = P(), empJew = P(INK.red), empFace = P(INK.paperLight), empFaceR = P(), empBeard = P(mix(INK.inkSoft, INK.stain, 0.4)), empEyes = P(INK.ink), maryEyes = P(INK.ink);
    const scep = P(), crownF = P(GOLD), crownR = P(), crownJ = P(INK.red), pend = P();
    const drips = P(INK.blue, { 'fill-opacity': 0.75 });
    const glint = P(INK.paperLight), glintR = P(GOLD);
    function update(t, cx, cy, R, o = {}) {
      const k = seed * 37, tilt = o.tilt ?? 1, rot = o.rot || 0;
      g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot)}) scale(1 ${tilt.toFixed(3)})`);
      const S = p => [p[0] * R, p[1] * R];
      const circ = (r, n, sd) => inkEllipsePts(0, 0, r * R, r * R, sd, n, 0, 0.012);
      shadow.setAttribute('d', inkLoop(inkEllipsePts(R * 0.05, R * 0.07, R * 1.01, R * 1.01, k + 1, 22), { seed: k + 1, t, amp: 0.8 }));
      disc.setAttribute('d', inkLoop(circ(1, 24, k + 2), { seed: k + 2, t, amp: 0.8 }));
      field.setAttribute('d', inkLoop(circ(0.8, 22, k + 3), { seed: k + 3, t, amp: 0.8 }));
      rim.setAttribute('d', inkPath(circ(1, 24, k + 2), { w: Math.max(4, R * 0.025), seed: k + 4, t, closed: true, amp: 0.9 }));
      rim2.setAttribute('d', inkPath(circ(0.8, 22, k + 3), { w: Math.max(2.5, R * 0.012), seed: k + 5, t, closed: true, amp: 0.8 }));
      // beaded border
      const B = [];
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; B.push(inkDot(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, R * 0.022, R * 0.022, k + 10 + i, t)); }
      beads.setAttribute('d', B.join(' '));
      // legend: little struck letter-like strokes between rim and field (no real text)
      const Lt = [];
      for (let i = 0; i < 18; i++) {
        const a = -Math.PI * 0.95 + i / 17 * Math.PI * 0.9, c = Math.cos(a), s = Math.sin(a), r0 = 0.82, r1 = 0.87;
        if (i % 6 === 5) continue;
        Lt.push(inkPath([[c * r0 * R, s * r0 * R], [c * r1 * R + s * R * 0.012 * (i % 2 ? 1 : -1), s * r1 * R]], { w: Math.max(2, R * 0.012), seed: k + 60 + i, t, amp: 0.5 }));
      }
      letters.setAttribute('d', Lt.join(' '));
      // Mary (left): halo, veiled head, veiled bust, raised right arm with the crown
      const mh = [-0.3, -0.3];
      halo.setAttribute('d', inkLoop(inkEllipsePts(mh[0] * R, mh[1] * R, 0.17 * R, 0.17 * R, k + 70, 14), { seed: k + 70, t, amp: 0.8 }));
      haloR.setAttribute('d', inkPath(inkEllipsePts(mh[0] * R, mh[1] * R, 0.17 * R, 0.17 * R, k + 70, 14), { w: Math.max(2, R * 0.012), seed: k + 71, t, closed: true, amp: 0.6 }));
      const veil = [[-0.42, -0.32], [-0.36, -0.44], [-0.24, -0.45], [-0.17, -0.33], [-0.14, -0.12], [-0.05, 0.1], [0.0, 0.5], [-0.62, 0.5], [-0.56, 0.12], [-0.46, -0.1]].map(S);
      maryVeil.setAttribute('d', inkLoop(veil, { seed: k + 72, t, amp: 0.8 }));
      maryVeilR.setAttribute('d', inkPath(veil, { w: Math.max(3, R * 0.016), seed: k + 73, t, closed: true, amp: 0.8 }));
      maryFace.setAttribute('d', inkLoop(inkEllipsePts(-0.29 * R, -0.29 * R, 0.075 * R, 0.095 * R, k + 74, 10), { seed: k + 74, t, amp: 0.6 }));
      maryFaceR.setAttribute('d', inkPath(inkEllipsePts(-0.29 * R, -0.29 * R, 0.075 * R, 0.095 * R, k + 74, 10), { w: Math.max(2, R * 0.01), seed: k + 75, t, closed: true, amp: 0.5 }));
      maryEyes.setAttribute('d', inkDot(-0.31 * R, -0.3 * R, R * 0.01, R * 0.012, k + 76, t) + ' ' + inkDot(-0.26 * R, -0.3 * R, R * 0.01, R * 0.012, k + 77, t));
      // crown path: from above Mary's hand to the emperor's head
      const cr = clamp01(o.crown ?? 1);
      const c0 = [-0.02, -0.56], c1 = [0.27, -0.47];
      const cc = [lerp(c0[0], c1[0], cr), lerp(c0[1], c1[1], cr) - Math.sin(cr * Math.PI) * 0.06];
      const hand = [cc[0] - 0.07, cc[1] + 0.03];
      const sh = [-0.2, -0.14], el1 = [lerp(-0.1, -0.02, cr), lerp(-0.3, -0.24, cr)];
      const arm = [S(sh), S(el1), S(hand)];
      maryArm.setAttribute('d', inkPath(arm, { w: R * 0.07, seed: k + 78, t, amp: 0.6, taper: 0.1 }));
      maryArmR.setAttribute('d', inkPath(arm, { w: Math.max(2, R * 0.01), seed: k + 79, t, amp: 0.6 }));
      maryHand.setAttribute('d', inkDot(hand[0] * R, hand[1] * R, R * 0.032, R * 0.032, k + 80, t));
      // emperor (right): loros robe with jewels, bearded face, cross-sceptre
      const robe = [[0.12, -0.18], [0.42, -0.18], [0.58, 0.5], [0.0, 0.5]].map(S);
      empRobe.setAttribute('d', inkLoop(robe, { seed: k + 81, t, amp: 0.8, smooth: false }));
      empRobeR.setAttribute('d', inkPath(robe, { w: Math.max(3, R * 0.016), seed: k + 82, t, closed: true, amp: 0.8, smooth: false }) + ' ' +
        inkPath([[0.2, -0.16], [0.27, 0.2], [0.36, -0.16]].map(S), { w: Math.max(2.5, R * 0.012), seed: k + 83, t, amp: 0.6 }) + ' ' +
        inkPath([[0.27, 0.2], [0.27, 0.48]].map(S), { w: Math.max(2.5, R * 0.012), seed: k + 84, t, amp: 0.6 }));
      const J = [];
      [[0.22, -0.08], [0.32, -0.08], [0.27, 0.06], [0.27, 0.3], [0.27, 0.42], [0.45, 0.2], [0.1, 0.2]].forEach((p, i) => J.push(inkDot(p[0] * R, p[1] * R, R * 0.022, R * 0.022, k + 85 + i, t)));
      empJew.setAttribute('d', J.join(' '));
      const eh = [0.27, -0.3];
      empFace.setAttribute('d', inkLoop(inkEllipsePts(eh[0] * R, eh[1] * R, 0.085 * R, 0.1 * R, k + 95, 10), { seed: k + 95, t, amp: 0.6 }));
      empFaceR.setAttribute('d', inkPath(inkEllipsePts(eh[0] * R, eh[1] * R, 0.085 * R, 0.1 * R, k + 95, 10), { w: Math.max(2, R * 0.011), seed: k + 96, t, closed: true, amp: 0.5 }));
      empBeard.setAttribute('d', inkLoop([[0.205, -0.255], [0.225, -0.24], [0.27, -0.235], [0.315, -0.24], [0.335, -0.255], [0.32, -0.21], [0.27, -0.185], [0.22, -0.21]].map(S), { seed: k + 97, t, amp: 0.5 }));
      empEyes.setAttribute('d', inkDot(0.245 * R, -0.32 * R, R * 0.01, R * 0.012, k + 98, t) + ' ' + inkDot(0.295 * R, -0.32 * R, R * 0.01, R * 0.012, k + 99, t));
      scep.setAttribute('d', inkPath([[0.5, 0.2], [0.5, -0.5]].map(S), { w: Math.max(3, R * 0.018), seed: k + 100, t, amp: 0.5 }) + ' ' +
        inkPath([[0.44, -0.42], [0.56, -0.42]].map(S), { w: Math.max(3, R * 0.018), seed: k + 101, t, amp: 0.5 }) + ' ' +
        inkDot(0.5 * R, 0.12 * R, R * 0.035, R * 0.03, k + 102, t));
      // crown: band + three points + pendilia
      const cw = 0.11, chh = 0.07, X = cc[0], Y = cc[1];
      const cp = [[X - cw, Y + chh * 0.5], [X - cw, Y - chh * 0.4], [X - cw * 0.5, Y - chh * 0.1], [X, Y - chh * 0.9], [X + cw * 0.5, Y - chh * 0.1], [X + cw, Y - chh * 0.4], [X + cw, Y + chh * 0.5]].map(S);
      crownF.setAttribute('d', inkLoop(cp, { seed: k + 103, t, amp: 0.6, smooth: false }));
      crownR.setAttribute('d', inkPath(cp, { w: Math.max(2.5, R * 0.014), seed: k + 104, t, closed: true, amp: 0.6, smooth: false }));
      crownJ.setAttribute('d', [[-0.55, 0.15], [0, 0.1], [0.55, 0.15]].map((p, i) => inkDot((X + p[0] * cw) * R, (Y + p[1] * chh) * R, R * 0.016, R * 0.016, k + 105 + i, t)).join(' '));
      pend.setAttribute('d', [-1, 1].map((sx, i) => inkPath([[X + sx * cw * 0.85, Y + chh * 0.5], [X + sx * cw * 0.95, Y + chh * 1.8]].map(S), { w: Math.max(2, R * 0.01), seed: k + 108 + i, t, amp: 0.5 })).join(' '));
      // drips hanging from the bottom rim (fresh from the sea)
      const wet = clamp01(o.wet || 0);
      drips.setAttribute('d', wet > 0.02 ? [-0.5, -0.15, 0.2, 0.55].map((u, i) => {
        const a = Math.PI / 2 - u, x = Math.cos(a) * R, y = Math.sin(a) * R, len = R * (0.06 + 0.05 * Math.abs(Math.sin(t * 2 + i))) * wet;
        return inkLoop([[x - R * 0.02, y - R * 0.01], [x + R * 0.02, y - R * 0.01], [x + R * 0.012, y + len], [x, y + len + R * 0.02], [x - R * 0.012, y + len]], { seed: k + 120 + i, t, amp: 0.4 });
      }).join(' ') : '');
      // sparkle (4-point star, upper right)
      const gl = clamp01(o.glint || 0);
      if (gl > 0.02) {
        const gx = 0.55 * R, gy = -0.62 * R, a = R * 0.32 * gl, b = R * 0.05 * gl;
        const st = [[gx, gy - a], [gx + b, gy - b], [gx + a, gy], [gx + b, gy + b], [gx, gy + a], [gx - b, gy + b], [gx - a, gy], [gx - b, gy - b]];
        glint.setAttribute('d', inkLoop(st, { seed: k + 130, t, amp: 0.5, smooth: false }));
        glintR.setAttribute('d', inkPath(st, { w: 3, seed: k + 131, t, closed: true, amp: 0.5, smooth: false }));
      } else { glint.setAttribute('d', ''); glintR.setAttribute('d', ''); }
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ period figure in a Byzantine robe
  function person(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const s = o.scale ?? 1;
    const rig = KASIF.create(el(g, 'g'), { scale: s, hat: false, accessory: o.accessory || null, beard: o.beard || null, seed: seed * 5 + 3 });
    const front = el(g, 'g');
    const col = { red: INK.red, blue: INK.blue, light: INK.paperLight, dark: INK.inkSoft, gold: INK.gold }[o.robe || 'blue'] || INK.blue;
    const robe = inkEl(front, col), robeR = inkEl(front), hem = inkEl(front, o.robe === 'light' ? INK.red : INK.gold), stole = o.stole ? inkEl(front, INK.paperLight) : null, stoleR = o.stole ? inkEl(front) : null, crosses = o.stole ? inkEl(front) : null;
    function update(t, pose, op = {}) {
      rig.update(t, pose, op);
      if (o.robe === false) return;
      const x = op.x, y = op.y, k = seed * 23, sw = Math.sin(t * 1.7 + seed) * 4 * s;
      const top = y - 205 * s;
      const pts = [[x - 48 * s, top], [x + 48 * s, top], [x + 92 * s + sw, y - 6 * s], [x - 92 * s + sw, y - 6 * s]];
      robe.setAttribute('d', inkLoop(pts, { seed: k + 1, t, amp: 1, smooth: false }));
      robeR.setAttribute('d', inkPath(pts, { w: 5, seed: k + 2, t, closed: true, amp: 1, smooth: false }));
      hem.setAttribute('d', inkLoop([[x - 90 * s + sw, y - 30 * s], [x + 90 * s + sw, y - 30 * s], [x + 92 * s + sw, y - 8 * s], [x - 92 * s + sw, y - 8 * s]], { seed: k + 3, t, amp: 0.8, smooth: false }));
      if (stole) {
        const sp = [[x - 16 * s, top], [x + 16 * s, top], [x + 18 * s, y - 34 * s], [x - 18 * s, y - 34 * s]];
        stole.setAttribute('d', inkLoop(sp, { seed: k + 4, t, amp: 0.8, smooth: false }));
        stoleR.setAttribute('d', inkPath(sp, { w: 3.5, seed: k + 5, t, closed: true, amp: 0.8, smooth: false }));
        crosses.setAttribute('d', [0.25, 0.6].map((u, i) => { const cy = lerp(top, y - 34 * s, u); return inkPath([[x, cy - 18 * s], [x, cy + 18 * s]], { w: 5, seed: k + 6 + i, t, amp: 0.5 }) + ' ' + inkPath([[x - 12 * s, cy - 5 * s], [x + 12 * s, cy - 5 * s]], { w: 5, seed: k + 8 + i, t, amp: 0.5 }); }).join(' '));
      }
    }
    return { g, update, rig };
  }

  // ------------------------------------------------------------------ sea band to the frame bottom
  function water(parent, seed) {
    const g = el(parent, 'g');
    const body = inkEl(g, INK.blue, { 'fill-opacity': 0.42 }), deep = inkEl(g, INK.blue, { 'fill-opacity': 0.35 }), lines = inkEl(g, INK.ink), foam = inkEl(g, INK.paperLight);
    function update(t, W, H, y0, o = {}) {
      const k = seed * 41, ro = o.rough ?? 1;
      const top = [];
      for (let i = 0; i <= 24; i++) { const x = -20 + i / 24 * (W + 40); top.push([x, y0 + Math.sin(x * 0.012 + t * 1.6 + seed) * 10 * ro + Math.sin(x * 0.031 - t * 2.1) * 5 * ro]); }
      body.setAttribute('d', inkLoop([...top, [W + 20, H + 20], [-20, H + 20]], { seed: k + 1, t, amp: 1, smooth: false }));
      if (o.dark) body.setAttribute('fill', mix(INK.blue, INK.ink, 0.35));
      const dy = y0 + (H - y0) * 0.45;
      deep.setAttribute('d', inkLoop([[-20, dy], [W * 0.5, dy + 20], [W + 20, dy - 10], [W + 20, H + 20], [-20, H + 20]], { seed: k + 2, t, amp: 1.5 }));
      const L = [], F = [];
      for (let j = 0; j < 9; j++) {
        const yy = y0 + 40 + j * (H - y0) / 9 * (0.6 + j * 0.05), amp = (8 + j * 3) * ro, ph = t * (1.4 + j * 0.1) + j * 1.7;
        const n = 6 + (j % 3);
        for (let i = 0; i < n; i++) {
          const cx = ((i + 0.5) / n * (W + 200) - 100 + (t * (20 + j * 6) + j * 90) % ((W + 200) / n)), w = 50 + j * 9;
          const p = [[cx - w, yy + Math.sin(ph + i) * amp * 0.3], [cx - w * 0.3, yy - amp * 0.6 + Math.sin(ph + i) * amp * 0.3], [cx + w * 0.4, yy + Math.sin(ph + i) * amp * 0.3], [cx + w, yy - amp * 0.3]];
          L.push(inkPath(p, { w: 2.5 + j * 0.4, seed: k + 10 + j * 13 + i, t, amp: 0.8 }));
          if ((i + j) % 4 === 0) F.push(inkPath(p.slice(0, 2), { w: 5 + j * 0.6, seed: k + 300 + j * 13 + i, t, amp: 0.8 }));
        }
      }
      lines.setAttribute('d', L.join(' ')); foam.setAttribute('d', F.join(' '));
      lines.setAttribute('fill', o.dark ? INK.ink : INK.inkSoft);
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ small rowing boat
  function boat(parent, seed) {
    const g = el(parent, 'g');
    const back = el(g, 'g'), front = el(g, 'g');
    const oarL = inkEl(back), hull = inkEl(front, INK.stain), hullR = inkEl(front), planks = inkEl(front, INK.ink), rimF = inkEl(front, mix(INK.stain, INK.ink, 0.3)), oarF = inkEl(front), blade = inkEl(front, INK.stain);
    function update(t, x, y, s, o = {}) {
      const k = seed * 53, rock = Math.sin(t * (o.rate ?? 1.8) + seed) * (o.rockAmp ?? 4);
      const a = rock * Math.PI / 180, R = p => { const dx = p[0] * s, dy = p[1] * s; return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)]; };
      const hp = [[-230, -40], [230, -60], [200, 10], [120, 50], [-150, 50], [-215, 5]].map(R);
      hull.setAttribute('d', inkLoop(hp, { seed: k + 1, t, amp: 1 }));
      hullR.setAttribute('d', inkPath(hp, { w: 6, seed: k + 2, t, closed: true, amp: 1 }));
      planks.setAttribute('d', inkPath([[-210, -10], [210, -24]].map(R), { w: 2.5, seed: k + 3, t }) + ' ' + inkPath([[-180, 22], [160, 14]].map(R), { w: 2.5, seed: k + 4, t }));
      rimF.setAttribute('d', inkLoop([[-232, -46], [232, -66], [230, -52], [-230, -32]].map(R), { seed: k + 5, t, amp: 0.8, smooth: false }));
      const ph = o.oar;
      if (ph != null) {
        const sw = Math.sin(ph * Math.PI * 2), lift = Math.cos(ph * Math.PI * 2);
        const pivot = R([20, -50]), tip = R([20 + sw * 150, 80 + lift * 30]);
        oarF.setAttribute('d', inkPath([R([20 - sw * 60, -110]), pivot, tip], { w: 7, seed: k + 6, t, amp: 0.6 }));
        blade.setAttribute('d', inkLoop(inkEllipsePts(tip[0], tip[1], 14 * s, 34 * s, k + 7, 8, Math.atan2(tip[1] - pivot[1], tip[0] - pivot[0]) - Math.PI / 2), { seed: k + 7, t, amp: 0.6 }));
      } else { oarF.setAttribute('d', ''); blade.setAttribute('d', ''); }
      oarL.setAttribute('d', '');
      return { deck: R([0, -40]), rock, R };
    }
    return { g, back, front, update };
  }

  // ------------------------------------------------------------------ water drops (fall, vanish at their floor)
  function drops(parent, seed) {
    const items = [];
    return {
      add(o) { items.push(Object.assign({ size: 1, g: 1400, vx: 0, vy: 0, floor: 1e9 }, o, { f: inkEl(parent, INK.blue, { 'fill-opacity': 0.8 }) })); },
      update(lt, t) {
        items.forEach((d, i) => {
          const u = lt - d.at;
          const x = d.x + d.vx * u, y = d.y + d.vy * u + 0.5 * d.g * u * u;
          if (d.at == null || u < 0 || y > d.floor) { d.f.setAttribute('d', ''); return; }
          d.f.setAttribute('d', inkDot(x, y, 7 * d.size, 10 * d.size, seed + i, t, 0.6));
        });
      },
    };
  }

  window.TZ = { atOr, f1, rect, arc, orient, Shapes, coin, person, water, boat, drops };
})();
