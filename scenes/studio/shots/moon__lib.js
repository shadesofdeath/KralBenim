// moon__lib: shared drawings for the moon_* shots (Stickstory "Great Moon Hoax", 1835). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens only (INK),
// everything a pure function of (seed, t), no Math.random. Parametric: the 1835 "lunar engravings" (man-bat, bison,
// unicorn goat, biped beaver, huts with smoke, sapphire temple, crystal pyramids, lake, beach, trees, a walled city),
// a big engraved Moon disc, a modern rocket, labels and cast members are reusable for any moon / astronomy story.
//
// window.MOON = {
//   at(cues, v, fb)            cue name | seconds -> local seconds
//   K(parent, K, seed)         cast member -> {update(lt, t, cues, W, H)}; K = {x, y (ground, 0..1), scale, pose, face:
//                              "left"|"right", dir, emotion, text, item, hat: true (narrator) | false (period figure),
//                              accessory, beard, walk: {to, at, dur}, seq: [{at, pose, dir, face, emotion, text}]}
//   world(parent, P, W, H, seed) -> {update(lt, t, cues)}   the lunar valley, elements below (x, y in 0..1 of W, H;
//       s = size, at = cue/seconds it appears; everything rises in with a spring):
//       ground: 0.86 (y of the ground line; false = none), orb: {x, y, r, at, rise} (Moon disc), rocket: {from: [x, y],
//       to: [x, y], at, dur}, trees: [{x, s, y}], lake: {x, w, y, at}, beach: {x0, x1, at}, pyramids: {x, n, s, at},
//       bison: {n, x, to, s, at, dur}, goats: [{x, s, at, face, graze}], beavers: [{x, to, s, at, dur, face, baby}],
//       huts: [{x, s, at, smoke}], manbats: [{x, y, s, at, fly, to: [x, y], dur, face, wave, sil (ink silhouette), shock (o-mouth)}], temple: {x, s, at, y},
//       city: {x, y, w, s, at}, flock: {n: 7, from: [x, y], to: [x, y], at, dur, s, gap, sil}, labels: [{text, x, y, at, size, color, arrow: [x, y]}], cast: [K], kasif: K
//   label(parent, L, W, H, seed) -> {update(lt, t, cues)}; L = {text, x, y, at, size, color, anchor, font: "serif",
//                              arrow: [x, y], underline: false, measure: [x, y0, y1] (vertical height bar)}
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const at = (cues, v, fb) => typeof v === 'number' ? v : (v != null && cues && cues[v] != null) ? cues[v] : fb;
  const pop = (lt, a, d = 0.7) => a == null ? 1 : spring(lt, a, d);
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const ell = (cx, cy, rx, ry, n = 14, a0 = 0) => {
    const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o;
  };
  // local -> world: p * (s*face, s) + (x, y)
  const tf = (x, y, s, face = 1) => p => [x + p[0] * s * face, y + p[1] * s];
  const brown = () => mix(mix(INK.red, INK.ink, 0.42), INK.paperDark, 0.28);
  const lead = () => mix(INK.blue, INK.paperLight, 0.5);
  const sapph = () => mix(INK.blue, INK.paperLight, 0.25);

  // stroke + fill pair helpers
  function shape(parent, fill) { return { f: fill ? inkEl(parent, fill) : null, r: inkEl(parent) }; }
  function setShape(sh, pts, seed, t, w = 5, amp = 1.2, fillOp) {
    if (sh.f) { sh.f.setAttribute('d', inkLoop(pts, { seed, t, amp })); if (fillOp != null) sh.f.setAttribute('fill-opacity', fillOp); }
    sh.r.setAttribute('d', inkPath(pts, { w, seed: seed + 1, t, amp, closed: true }));
  }
  const line = (pts, seed, t, w = 5, amp = 1.2, taper = 0.3) => inkPath(pts, { w, seed, t, amp, taper });

  // ------------------------------------------------------------------ cast member
  function K(parent, Kp, seed) {
    if (!Kp) return null;
    const g = el(parent, 'g');
    const isK = Kp.hat !== false;
    const rig = KASIF.create(g, { scale: Kp.scale ?? 0.8, hat: isK, accessory: isK ? null : (Kp.accessory || null), beard: isK ? null : (Kp.beard || null), seed });
    return {
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: Kp.pose || 'idle', dir: Kp.dir, face: Kp.face, emotion: Kp.emotion, text: Kp.text, item: Kp.item }];
        (Kp.seq || []).forEach(s => { const a = at(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let x = (Kp.x ?? 0.5) * W, pose = s.pose || 'idle', ph = 0;
        const wk = Kp.walk;
        if (wk) {
          const a = at(cues, wk.at, 0), d = wk.dur ?? 1.6, x1 = wk.to * W, x0 = x, p = clamp01((lt - a) / d);
          x = lerp(x0, x1, p);
          if (lt >= a && lt < a + d) { pose = 'walk'; ph = Math.abs(x - x0) / (KASIF.gait('walk') * (Kp.scale ?? 0.8)); }
        }
        const face = faceOf(s.face ?? Kp.face, wk ? (wk.to >= (Kp.x ?? 0.5) ? 1 : -1) : -1);
        const o = { x, y: (Kp.y ?? 0.86) * H, face, since, ph, dir: dirOf(s.dir ?? Kp.dir), mouth: 0,
          emotion: s.emotion || (pose === 'shock' ? 'surprised' : Kp.emotion || null), text: s.text ?? Kp.text, item: s.item ?? Kp.item };
        if (pv && since < 0.32 && pose !== 'walk') { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? Kp.dir) }; o.mix = since / 0.32; }
        return rig.update(t, pose, o);
      },
    };
  }

  // ------------------------------------------------------------------ label (hand-written note + arrow)
  function label(parent, L, W, H, seed) {
    const g = el(parent, 'g');
    const col = { red: INK.red, blue: INK.blue, gold: INK.gold, ink: INK.ink }[L.color] || INK.ink;
    const size = L.size || 56, x = L.x * W, y = L.y * H;
    const serif = L.font === 'serif';
    const tx = el(g, 'text', { x, y, 'font-family': serif ? "Fraunces, Georgia, serif" : INK_FONT, 'font-weight': serif ? 900 : 400, 'font-size': size, 'text-anchor': L.anchor || 'middle', fill: col });
    tx.textContent = L.text;
    const ul = inkEl(g, col), ar = inkEl(g, col), ms = L.measure ? inkEl(parent, col) : null;
    let tw = 0;
    return {
      update(lt, t, cues) {
        const a = at(cues, L.at, 0.3), p = pop(lt, a, 0.6);
        if (!tw) { try { tw = tx.getComputedTextLength(); } catch (e) { tw = size * L.text.length * 0.45; } }
        const b = boil(seed, t, 1.2);
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) scale(${f1(Math.max(0.001, p) * 100) / 100}) translate(${f1(-x)} ${f1(-y)})`);
        g.style.visibility = lt < a ? 'hidden' : 'visible';
        const x0 = L.anchor === 'start' ? x : x - tw / 2, x1 = x0 + tw;
        const u = clamp01((lt - a - 0.25) / 0.4);
        ul.setAttribute('d', u > 0 && L.underline !== false ? line([[x0, y + 14], [lerp(x0, x1, u), y + 10]], seed + 3, t, 4.5) : '');
        if (ms) {   // measure: [x, y0, y1] (0..1): a vertical double-headed height bar, drawn upward
          const mx = L.measure[0] * W, y0 = L.measure[1] * H, y1 = L.measure[2] * H, q = clamp01((lt - a) / 0.7), ye = lerp(y0, y1, q);
          ms.setAttribute('d', lt < a ? '' : line([[mx, y0], [mx, ye]], seed + 8, t, 6) + ' ' + line([[mx - 24, y0], [mx + 24, y0]], seed + 9, t, 6) +
            (q > 0.95 ? ' ' + line([[mx - 24, y1], [mx + 24, y1]], seed + 10, t, 6) + ' ' + line([[mx - 18, y1 + 24], [mx, y1], [mx + 18, y1 + 24]], seed + 11, t, 6) : ''));
        }
        if (L.arrow) {
          const ax = L.arrow[0] * W, ay = L.arrow[1] * H, sx = x + (ax > x1 ? tw / 2 + 10 : ax < x0 ? -tw / 2 - 10 : 0), sy = ay > y ? y + 26 : y - size * 0.9;
          const q = clamp01((lt - a - 0.2) / 0.5), ex = lerp(sx, ax, q), ey = lerp(sy, ay, q);
          const mx = (sx + ex) / 2 + (ey - sy) * 0.18, my = (sy + ey) / 2 - (ex - sx) * 0.18;
          const ang = Math.atan2(ey - my, ex - mx), hd = 26;
          ar.setAttribute('d', q > 0 ? line([[sx, sy], [mx, my], [ex, ey]], seed + 5, t, 5) + ' ' +
            line([[ex - Math.cos(ang - 0.5) * hd, ey - Math.sin(ang - 0.5) * hd], [ex, ey], [ex - Math.cos(ang + 0.5) * hd, ey - Math.sin(ang + 0.5) * hd]], seed + 6, t, 5) : '');
        }
      },
    };
  }

  // ------------------------------------------------------------------ creatures and things (local units, ground y = 0)
  // man-bat: ~300 units tall standing; wings span ~520
  function manbat(parent, seed) {
    const g = el(parent, 'g');
    const wingL = shape(g, INK.inkSoft), wingR = shape(g, INK.inkSoft), bones = inkEl(g);
    const body = inkEl(g), hair = shape(g, INK.gold), head = shape(g, INK.paperLight), face = inkEl(g);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, o.face ?? 1), fly = o.fly ? 1 : 0;
        const fl = o.flap ?? (fly ? Math.sin(t * TAU * 2.2 + seed) : 0.25 * Math.sin(t * TAU * 0.6 + seed));
        const lift = fly ? -40 - fl * 10 : 0;
        const sh = [0, -188 + lift], hip = [0, -112 + lift];
        const wing = side => {
          const k = side, e = [k * 120, -262 + lift - fl * 70], tip = [k * 255, -218 + lift - fl * 120];
          const f1p = [k * 205, -120 + lift - fl * 60], f2p = [k * 140, -100 + lift - fl * 30];
          const mem = [sh, e, tip, [k * 240, -175 + lift - fl * 95], f1p, [k * 170, -125 + lift - fl * 45], f2p, [k * 70, -118 + lift - fl * 12], [k * 12, -130 + lift]];
          return { mem, bones: [[sh, e, tip], [e, f1p], [e, f2p]] };
        };
        const L = wing(-1), R = wing(1);
        const sil = !!o.sil;
        [wingL, wingR].forEach(w => w.f.setAttribute('fill', sil ? INK.ink : INK.inkSoft));
        setShape(wingL, L.mem.map(T), seed * 7 + 1, t, 4, 1, sil ? 0.92 : 0.42);
        setShape(wingR, R.mem.map(T), seed * 7 + 3, t, 4, 1, sil ? 0.92 : 0.42);
        head.f.setAttribute('fill', sil ? INK.ink : INK.paperLight);
        let bd = '';
        [...L.bones, ...R.bones].forEach((b, i) => { bd += line(b.map(T), seed * 7 + 10 + i, t, 4.5) + ' '; });
        bones.setAttribute('d', bd);
        // body: torso, legs, arms
        const sw = fly ? 18 * Math.sin(t * TAU * 1.1) : 0;
        const legs = fly ? [[hip, [-14 + sw, -50 + lift], [-20 + sw, -10 + lift]], [hip, [16 - sw, -52 + lift], [22 - sw, -12 + lift]]]
          : [[hip, [-16, -58], [-24, 0]], [hip, [16, -58], [24, 0]]];
        const wave = o.wave ? Math.sin(t * TAU * 1.5) : 0;
        const arms = [[[0, -176 + lift], [-40, -146 + lift], [-56, -112 + lift]], [[0, -176 + lift], [42, -150 + lift - wave * 30], [58 + wave * 10, -116 + lift - wave * 70]]];
        body.setAttribute('d', [line([[0, -200 + lift], hip].map(T), seed * 7 + 30, t, 7), ...legs.map((l, i) => line(l.map(T), seed * 7 + 31 + i, t, 6)),
          ...arms.map((a, i) => line(a.map(T), seed * 7 + 34 + i, t, 6))].join(' '));
        // head + copper hair + face
        const hc = [0, -232 + lift];
        setShape(head, ell(hc[0], hc[1], 30, 32, 12).map(T), seed * 7 + 40, t, 5, 0.8);
        setShape(hair, [[-30, -238], [-26, -262], [-8, -270], [12, -268], [28, -256], [32, -236], [18, -250], [0, -254], [-16, -248]].map(p => T([p[0], p[1] + lift])), seed * 7 + 42, t, 3.5, 0.8);
        const fx = 8;
        if (sil) { face.setAttribute('d', ''); return; }
        if (o.shock) { face.setAttribute('d', inkDot(...T([fx - 11, -236 + lift]), 5, 6, seed * 7 + 44, t) + ' ' + inkDot(...T([fx + 11, -236 + lift]), 5, 6, seed * 7 + 45, t) + ' ' +
          inkCircle(...T([fx, -213 + lift]), 7 * (o.s ?? 1), seed * 7 + 46, t, { w: 3.5 })); return; }
        face.setAttribute('d', inkDot(...T([fx - 10, -232 + lift]), 4, 4.5, seed * 7 + 44, t) + ' ' + inkDot(...T([fx + 10, -232 + lift]), 4, 4.5, seed * 7 + 45, t) + ' ' +
          line([[fx - 9, -216], [fx, -212], [fx + 9, -216]].map(p => T([p[0], p[1] + lift])), seed * 7 + 46, t, 3.5));
      },
    };
  }

  function bison(parent, seed) {
    const g = el(parent, 'g');
    const legs = inkEl(g), bod = shape(g, brown()), head = shape(g, mix(INK.inkSoft, INK.ink, 0.3)), det = inkEl(g);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, o.face ?? 1), w = o.walk ? t * TAU * 1.4 : 0, a = o.walk ? 1 : 0;
        const bob = a * 3 * Math.sin(w * 2);
        const leg = (x, ph) => { const sw = a * 16 * Math.sin(w + ph); return [[x, -50 + bob], [x + sw * 0.4, -26], [x + sw, 0]]; };
        legs.setAttribute('d', [leg(-80, 0), leg(-55, Math.PI), leg(70, Math.PI), leg(95, 0)].map((l, i) => line(l.map(T), seed * 9 + i, t, 9, 1, 0.1)).join(' '));
        const B = [[-118, -60], [-112, -108], [-70, -140], [-10, -160], [40, -150], [92, -128], [120, -96], [118, -58], [80, -46], [-80, -46]].map(p => T([p[0], p[1] + bob]));
        setShape(bod, B, seed * 9 + 10, t, 5.5, 1.2);
        const gz = o.graze ? 18 * (0.5 + 0.5 * Math.sin(t * TAU * 0.5 + seed)) : 0;
        const H = [[108, -110], [150, -100 + gz], [164, -66 + gz], [150, -42 + gz], [120, -50], [104, -76]].map(p => T([p[0], p[1] + bob]));
        setShape(head, H, seed * 9 + 12, t, 5, 1);
        det.setAttribute('d', line([[134, -104 + gz], [128, -126 + gz], [142, -132 + gz]].map(p => T([p[0], p[1] + bob])), seed * 9 + 14, t, 4.5) + ' ' +
          inkDot(...T([146, -82 + gz + bob]), 4, 4, seed * 9 + 15, t) + ' ' +
          line([[-118, -80], [-138, -60], [-132, -40]].map(p => T([p[0], p[1] + bob])), seed * 9 + 16, t, 4) + ' ' +
          [0, 1, 2, 3].map(i => line([[-60 + i * 30, -138 + i * 4], [-50 + i * 30, -110 + i * 4]].map(p => T([p[0], p[1] + bob])), seed * 9 + 20 + i, t, 3)).join(' '));
      },
    };
  }

  // the single-horned goat "the bluish colour of lead"
  function goat(parent, seed) {
    const g = el(parent, 'g');
    const legs = inkEl(g), bod = shape(g, lead()), head = shape(g, lead()), det = inkEl(g), horn = shape(g, INK.paperLight);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, o.face ?? 1);
        const gz = o.graze ? 0.5 + 0.5 * Math.sin(t * TAU * 0.45 + seed) : 0, hop = o.hop ? Math.max(0, Math.sin(t * TAU * 0.9 + seed)) * 26 : 0;
        legs.setAttribute('d', [[-50, 6], [-30, -4], [40, 4], [58, -6]].map(([x, sw], i) =>
          line([[x, -60 - hop], [x + sw * 0.5, -30 - hop * 0.6], [x + sw, -hop * 0.2]].map(T), seed * 11 + i, t, 6, 1, 0.1)).join(' '));
        setShape(bod, [[-74, -70], [-64, -104], [-10, -114], [50, -110], [80, -88], [74, -60], [30, -54], [-50, -56]].map(p => T([p[0], p[1] - hop])), seed * 11 + 8, t, 5);
        const hy = lerp(-150, -80, gz), hx = lerp(96, 110, gz);
        setShape(head, [[64, -100], [hx - 6, hy - 14], [hx + 28, hy + 6], [hx + 20, hy + 26], [hx - 8, hy + 18], [72, -76]].map(p => T([p[0], p[1] - hop])), seed * 11 + 10, t, 5);
        const hb = [hx + 4, hy - 8], ht = [hx + 42, hy - 92];
        setShape(horn, [[hb[0] - 8, hb[1]], ht, [hb[0] + 8, hb[1] + 4]].map(p => T([p[0], p[1] - hop])), seed * 11 + 12, t, 4, 0.8);
        let d = inkDot(...T([hx + 10, hy - hop]), 3.5, 3.5, seed * 11 + 14, t) + ' ' +
          line([[hx + 14, hy + 24], [hx + 10, hy + 46], [hx + 4, hy + 30]].map(p => T([p[0], p[1] - hop])), seed * 11 + 15, t, 3.5) + ' ' +
          line([[-74, -86], [-96, -100], [-92, -84]].map(p => T([p[0], p[1] - hop])), seed * 11 + 16, t, 4);
        for (let i = 1; i < 5; i++) { const q = i / 5; d += line([[lerp(hb[0], ht[0], q) - 7, lerp(hb[1], ht[1], q) + 2], [lerp(hb[0], ht[0], q) + 7, lerp(hb[1], ht[1], q) - 4]].map(p => T([p[0], p[1] - hop])), seed * 11 + 20 + i, t, 2.5); }
        det.setAttribute('d', d);
      },
    };
  }

  // the biped beaver, carrying its young "in its arms like a human being"
  function beaver(parent, seed) {
    const g = el(parent, 'g');
    const tail = shape(g, mix(INK.inkSoft, INK.ink, 0.25)), tailH = inkEl(g, INK.paperDark), feet = inkEl(g);
    const bod = shape(g, brown()), head = shape(g, brown()), baby = shape(g, brown()), det = inkEl(g), teeth = shape(g, INK.paperLight);
    return {
      update(t, o) {
        const s = o.s ?? 1, T = tf(o.x, o.y, s, o.face ?? 1), wk = o.walk ? t * TAU * 1.6 : 0, a = o.walk ? 1 : 0;
        const bob = a * 4 * Math.abs(Math.sin(wk));
        const B = p => T([p[0], p[1] - bob]);
        setShape(tail, [[-40, -20], [-120, -6], [-150, 6], [-120, 18], [-40, 8]].map(T), seed * 13, t, 4.5);
        let hd = ''; for (let i = 0; i < 5; i++) hd += line([[-125 + i * 18, -4], [-115 + i * 18, 12]].map(T), seed * 13 + 40 + i, t, 2.5) + ' ';
        tailH.setAttribute('d', hd);
        feet.setAttribute('d', [-1, 1].map((k, i) => { const sw = a * 14 * Math.sin(wk + i * Math.PI); return line([[k * 22, -50 - bob], [k * 24 + sw * 0.5, -22], [k * 26 + sw, 0], [k * 26 + sw + 22, 0]].map(T), seed * 13 + 2 + i, t, 7, 1, 0.1); }).join(' '));
        setShape(bod, [[-46, -40], [-56, -110], [-34, -168], [0, -182], [34, -168], [54, -110], [46, -40], [0, -30]].map(B), seed * 13 + 4, t, 5.5);
        const hc = [6, -212];
        setShape(head, ell(hc[0], hc[1], 40, 36, 12).map(B), seed * 13 + 6, t, 5);
        setShape(teeth, [[hc[0] + 14, hc[1] + 26], [hc[0] + 28, hc[1] + 26], [hc[0] + 27, hc[1] + 46], [hc[0] + 15, hc[1] + 46]].map(B), seed * 13 + 8, t, 3, 0.6);
        let d = inkDot(...B([hc[0] + 12, hc[1] - 8]), 4, 4.5, seed * 13 + 10, t) + ' ' + inkDot(...B([hc[0] + 34, hc[1] + 6]), 7, 5, seed * 13 + 11, t) + ' ' +
          line(ell(hc[0] - 26, hc[1] - 30, 9, 9, 8).concat([ell(hc[0] - 26, hc[1] - 30, 9, 9, 8)[0]]).map(B), seed * 13 + 12, t, 3.5) + ' ' +
          line([[-30, -150], [-6, -112], [24, -118]].map(B), seed * 13 + 13, t, 6) + ' ' + line([[30, -150], [44, -122], [30, -110]].map(B), seed * 13 + 14, t, 6);
        if (o.baby !== false) {
          const bc = [8, -126 + Math.sin(t * TAU * 0.8) * 2];
          setShape(baby, ell(bc[0], bc[1], 24, 21, 10).map(B), seed * 13 + 16, t, 4);
          d += ' ' + inkDot(...B([bc[0] + 8, bc[1] - 4]), 3, 3.5, seed * 13 + 17, t) + ' ' + line(ell(bc[0] - 16, bc[1] - 18, 6, 6, 6).map(B), seed * 13 + 18, t, 2.5);
        } else { baby.f.setAttribute('d', ''); baby.r.setAttribute('d', ''); }
        det.setAttribute('d', d);
      },
    };
  }

  // a domed hut with smoke curling from its roof
  function hut(parent, seed) {
    const g = el(parent, 'g');
    const smoke = inkEl(g, INK.inkSoft), dome = shape(g, INK.paperDark), det = inkEl(g), door = inkEl(g, INK.ink);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, 1);
        const D = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; D.push([Math.cos(a) * 110, Math.sin(a) * 100]); }
        setShape(dome, D.map(T), seed * 17, t, 6);
        let d = '';
        for (let r = 1; r < 4; r++) { const y = -r * 25; const hw = Math.sqrt(Math.max(0, 1 - (y / 100) ** 2)) * 110; d += line([[-hw + 6, y], [hw - 6, y]].map(T), seed * 17 + r, t, 3) + ' '; }
        det.setAttribute('d', d);
        door.setAttribute('d', inkLoop([[-24, 0], [-24, -40], [0, -56], [24, -40], [24, 0]].map(T), { seed: seed * 17 + 9, t, amp: 0.8 }));
        // smoke: 3 rising curls, each loops every 2.4 s
        let sm = '';
        if (o.smoke !== 0) {
          const k = o.smoke ?? 1;
          for (let i = 0; i < 3; i++) {
            const ph = ((t * 0.42 + i / 3) % 1), pts = [];
            for (let j = 0; j <= 8; j++) { const q = j / 8; pts.push([10 + Math.sin(q * 5 + t * 1.6 + i * 2) * (14 + 24 * q) + q * 40, -100 - (ph * 240 + q * 70) * k]); }
            sm += inkPath(pts.map(T), { w: lerp(9, 3, ph), seed: seed * 17 + 20 + i, t, amp: 1.2, taper: 0.6 }) + ' ';
          }
        }
        smoke.setAttribute('d', sm);
      },
    };
  }

  // the "temple of polished sapphire"
  function temple(parent, seed) {
    const g = el(parent, 'g');
    const base = shape(g, INK.paperDark), cols = shape(g, sapph()), roof = shape(g, sapph()), det = inkEl(g), glint = inkEl(g, INK.paperLight);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, 1);
        setShape(base, [[-260, 0], [-260, -30], [-230, -30], [-230, -56], [230, -56], [230, -30], [260, -30], [260, 0]].map(T), seed * 19, t, 5, 1, null);
        // six columns as one fill (separate loops)
        let cf = '', cr = '';
        for (let i = 0; i < 6; i++) {
          const cx = -190 + i * 76, P = [[cx - 20, -56], [cx - 18, -280], [cx + 18, -280], [cx + 20, -56]].map(T);
          cf += inkLoop(P, { seed: seed * 19 + 3 + i, t, amp: 0.8 }) + ' ';
          cr += inkPath(P, { w: 4.5, seed: seed * 19 + 10 + i, t, amp: 0.8, closed: true }) + ' ';
        }
        cols.f.setAttribute('d', cf); cols.r.setAttribute('d', cr); cols.f.setAttribute('fill-opacity', 0.85);
        setShape(roof, [[-250, -280], [-240, -310], [0, -420], [240, -310], [250, -280]].map(T), seed * 19 + 20, t, 6, 1, 0.9);
        let d = line([[-150, -308], [0, -380], [150, -308]].map(T), seed * 19 + 22, t, 3.5) + ' ';
        for (let i = 0; i < 6; i++) { const cx = -190 + i * 76; d += line([[cx - 6, -70], [cx - 4, -266]].map(T), seed * 19 + 30 + i, t, 2.5) + ' '; }
        det.setAttribute('d', d);
        // glints: four-point stars blinking on the facets
        let gl = '';
        for (let i = 0; i < 4; i++) {
          const ph = (t * 0.7 + i * 0.27) % 1, k = Math.max(0, Math.sin(ph * Math.PI)) ** 2;
          if (k < 0.05) continue;
          const [cx, cy] = T([[-150, -200], [60, -330], [170, -140], [-40, -120]][i]), r = 26 * k * (o.s ?? 1);
          gl += inkLoop([[cx, cy - r], [cx + r * 0.22, cy - r * 0.22], [cx + r, cy], [cx + r * 0.22, cy + r * 0.22], [cx, cy + r], [cx - r * 0.22, cy + r * 0.22], [cx - r, cy], [cx - r * 0.22, cy - r * 0.22]], { seed: seed * 19 + 40 + i, t, amp: 0.4, smooth: false }) + ' ';
        }
        glint.setAttribute('d', gl);
      },
    };
  }

  function tree(parent, seed) {
    const g = el(parent, 'g');
    const trunk = inkEl(g), crown = shape(g, mix(INK.green, INK.paperLight, 0.45)), det = inkEl(g);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, 1), sw = Math.sin(t * TAU * 0.35 + seed) * 6;
        trunk.setAttribute('d', line([[0, 0], [2, -90], [sw * 0.5, -170]].map(T), seed * 23, t, 10, 1, 0.2) + ' ' + line([[1, -110], [-30 + sw * 0.4, -150]].map(T), seed * 23 + 1, t, 5));
        const C = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = 80 + (i % 2) * 14; C.push([Math.cos(a) * r + sw, -220 + Math.sin(a) * r * 0.8]); }
        setShape(crown, C.map(T), seed * 23 + 2, t, 5);
        det.setAttribute('d', [0, 1, 2].map(i => line([[-40 + i * 30 + sw, -200 + (i % 2) * 30], [-20 + i * 30 + sw, -214 + (i % 2) * 30]].map(T), seed * 23 + 5 + i, t, 3)).join(' '));
      },
    };
  }

  function pyramid(parent, seed) {
    const g = el(parent, 'g');
    const body = shape(g, mix(INK.red, INK.paperLight, 0.55)), det = inkEl(g);
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, 1);
        setShape(body, [[-46, 0], [0, -260], [46, 0]].map(T), seed * 29, t, 5, 0.8);
        det.setAttribute('d', line([[0, -260], [8, 0]].map(T), seed * 29 + 2, t, 3) + ' ' + line([[-24, -130], [24, -128]].map(T), seed * 29 + 3, t, 2.5));
      },
    };
  }

  // engraved Moon disc: maria, craters, terminator hatching
  function orb(parent, seed) {
    const g = el(parent, 'g');
    const halo = inkEl(g, INK.inkSoft), disc = shape(g, INK.paperLight), mare = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.3)), crat = inkEl(g), hatch = inkEl(g, INK.inkSoft);
    const r0 = rng(seed * 31 + 5);
    const MARE = [[-0.35, -0.3, 0.32, 0.22], [0.15, -0.2, 0.26, 0.2], [0.05, 0.25, 0.3, 0.18], [-0.3, 0.2, 0.18, 0.14]];
    const CR = Array.from({ length: 9 }, () => [r0() * 1.4 - 0.7, r0() * 1.4 - 0.7, 0.04 + r0() * 0.07]).filter(c => Math.hypot(c[0], c[1]) < 0.8);
    return {
      update(t, o) {
        const R = o.r, cx = o.x, cy = o.y, rot = (o.spin ?? 1) * t * 1.5 * Math.PI / 180;
        const P = (u, v) => { const c = Math.cos(rot), s = Math.sin(rot); return [cx + (u * c - v * s) * R, cy + (u * s + v * c) * R]; };
        let hd = ''; for (let k = 0; k < 3; k++) { const q = ((t * 0.25 + k / 3) % 1); hd += inkCircle(cx, cy, R * (1.08 + q * 0.35), seed * 31 + k, t, { w: lerp(3.5, 0.8, q) }) + ' '; }
        halo.setAttribute('d', hd);
        setShape(disc, inkEllipsePts(cx, cy, R, R, seed * 31, 22), seed * 31 + 1, t, 8, 1.2);
        mare.setAttribute('d', MARE.map((m, i) => inkLoop(inkEllipsePts(...P(m[0], m[1]), m[2] * R, m[3] * R, seed * 31 + 10 + i, 10, rot + i), { seed: seed * 31 + 10 + i, t, amp: 1 })).join(' '));
        mare.setAttribute('fill-opacity', 0.75);
        crat.setAttribute('d', CR.map((c, i) => inkCircle(...P(c[0], c[1]), c[2] * R, seed * 31 + 20 + i, t, { w: 3.5 })).join(' '));
        let h = ''; for (let i = 0; i < 9; i++) { const y = -0.85 + i * 0.21, xw = Math.sqrt(Math.max(0, 1 - y * y)); h += line([[cx + xw * R * 0.55, cy + y * R], [cx + xw * R * 0.94, cy + y * R + 6]], seed * 31 + 40 + i, t, 2.5) + ' '; }
        hatch.setAttribute('d', h);
      },
    };
  }

  // a modern rocket flying an arc, exhaust and dashed trail
  function rocket(parent, seed) {
    const g = el(parent, 'g');
    const trail = inkEl(g, INK.inkSoft), flame = inkEl(g, INK.gold), flameR = inkEl(g, INK.red), bod = shape(g, INK.paperLight), det = inkEl(g);
    return {
      update(t, o) {
        const p = o.p, A = o.from, B = o.to, C = [lerp(A[0], B[0], 0.25), Math.min(A[1], B[1]) - 120];
        const Q = q => [(1 - q) ** 2 * A[0] + 2 * (1 - q) * q * C[0] + q * q * B[0], (1 - q) ** 2 * A[1] + 2 * (1 - q) * q * C[1] + q * q * B[1]];
        const pos = Q(p), nx = Q(Math.min(1, p + 0.01)), ang = Math.atan2(nx[1] - pos[1], nx[0] - pos[0]) + Math.PI / 2;
        let tr = '';
        for (let i = 0; i < 26; i++) { const q0 = i / 26 * p, q1 = q0 + p / 60; if (i % 2 === 0) tr += line([Q(q0), Q(q1)], seed + i, t, 4) + ' '; }
        trail.setAttribute('d', p > 0.01 ? tr : '');
        const s = o.s ?? 1, c = Math.cos(ang), sn = Math.sin(ang);
        const T = q => [pos[0] + (q[0] * c - q[1] * sn) * s, pos[1] + (q[0] * sn + q[1] * c) * s];
        setShape(bod, [[0, -90], [16, -60], [18, 30], [34, 54], [18, 50], [0, 56], [-18, 50], [-34, 54], [-18, 30], [-16, -60]].map(T), seed + 50, t, 4.5, 0.8);
        det.setAttribute('d', inkCircle(...T([0, -20]), 8 * s, seed + 52, t, { w: 3 }) + ' ' + line([[-16, -50], [16, -50]].map(T), seed + 53, t, 3));
        const fl = 1 + 0.3 * Math.sin(t * 40);
        flame.setAttribute('d', p < 1 ? inkLoop([[-14, 58], [0, 58 + 70 * fl], [14, 58]].map(T), { seed: seed + 55, t, amp: 2 }) : '');
        flameR.setAttribute('d', p < 1 ? inkLoop([[-7, 58], [0, 58 + 36 * fl], [7, 58]].map(T), { seed: seed + 56, t, amp: 1.5 }) : '');
      },
    };
  }

  // Gruithuisen's 1824 "city": parallel ridges in a herringbone, as he drew it
  // Gruithuisen's 1824 lunar "city", drawn readable: an oval walled town in 3/4 view (wall band, towers, gate) whose
  // rows of houses appear one after another (o.reveal 0..9), with his herringbone ridges as the fields around it.
  function city(parent, seed) {
    const g = el(parent, 'g');
    const fields = inkEl(g, INK.inkSoft), wallF = inkEl(g, INK.paperDark), wallR = inkEl(g), houseF = inkEl(g, INK.paperLight), houseR = inkEl(g), roofF = inkEl(g, mix(INK.red, INK.paperDark, 0.45)), tow = inkEl(g);
    const RX = 300, RY = 110, CY = -130, WH = 46;
    return {
      update(t, o) {
        const T = tf(o.x, o.y, o.s ?? 1, 1), q = clamp01((o.reveal ?? 9) / 9);
        let fd = '';
        for (let i = 0; i < 5; i++) { const y = 10 + i * 16; fd += line([[-420 + i * 20, y], [-330, y - 14], [-250 - i * 10, y]].map(T), seed * 37 + 60 + i, t, 3) + ' ' + line([[250 + i * 10, y], [330, y - 14], [420 - i * 20, y]].map(T), seed * 37 + 70 + i, t, 3) + ' '; }
        fields.setAttribute('d', fd);
        const back = [], front = [];
        for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; back.push([Math.cos(a) * RX, CY + Math.sin(a) * RY]); }
        for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; front.push([Math.cos(a) * RX, CY + Math.sin(a) * RY]); }
        const band = front.map(p => [p[0], p[1]]).concat(front.slice().reverse().map(p => [p[0], p[1] - WH]));
        const wq = clamp01(q * 3);
        wallF.setAttribute('d', wq > 0 ? inkLoop(band.map(T), { seed: seed * 37, t, amp: 0.8 }) : '');
        wallR.setAttribute('d', wq > 0 ? line(back.map(p => [p[0], p[1] - WH]).map(T), seed * 37 + 1, t, 5) + ' ' + inkPath(band.map(T), { w: 5, seed: seed * 37 + 2, t, closed: true, amp: 0.8 }) + ' ' +
          inkPath([[-34, CY + RY], [-34, CY + RY - WH + 4], [0, CY + RY - WH - 18], [34, CY + RY - WH + 4], [34, CY + RY]].map(T), { w: 5, seed: seed * 37 + 3, t, amp: 0.8 }) : '');
        // houses: rows from back to front inside the oval
        let hf = '', hr = '', rf = '';
        const rows = [[-0.55, 4], [-0.15, 6], [0.25, 6], [0.6, 4]];
        let k = 0, total = 20;
        rows.forEach(([v, n], ri) => {
          const yy = CY + v * RY - 18, span = RX * Math.sqrt(Math.max(0, 1 - v * v)) * 0.78;
          for (let j = 0; j < n; j++, k++) {
            if (k / total > (q - 0.3) / 0.7) continue;
            const xx = -span + (j + 0.5) * (2 * span / n), w2 = 20 + ri * 3, h2 = 26 + ri * 4;
            const box = [[xx - w2, yy], [xx - w2, yy - h2], [xx + w2, yy - h2], [xx + w2, yy]].map(T);
            const roof = [[xx - w2 - 6, yy - h2], [xx, yy - h2 - 22 - ri * 2], [xx + w2 + 6, yy - h2]].map(T);
            hf += inkLoop(box, { seed: seed * 37 + 100 + k, t, amp: 0.6, smooth: false }) + ' ';
            rf += inkLoop(roof, { seed: seed * 37 + 200 + k, t, amp: 0.6, smooth: false }) + ' ';
            hr += inkPath(box, { w: 3.5, seed: seed * 37 + 300 + k, t, closed: true, amp: 0.6, smooth: false }) + ' ' + inkPath(roof, { w: 3.5, seed: seed * 37 + 400 + k, t, closed: true, amp: 0.6, smooth: false }) + ' ';
          }
        });
        houseF.setAttribute('d', hf); roofF.setAttribute('d', rf); houseR.setAttribute('d', hr);
        // towers on the wall
        let td = '';
        if (wq >= 1) for (const a of [0.15, 0.5, 0.85, 1.15, 1.85]) {
          const ang = a * Math.PI, tx = Math.cos(ang) * RX, ty = CY + Math.sin(ang) * RY;
          td += inkPath([[tx - 16, ty], [tx - 16, ty - WH - 40], [tx - 22, ty - WH - 40], [tx, ty - WH - 70], [tx + 22, ty - WH - 40], [tx + 16, ty - WH - 40], [tx + 16, ty]].map(T), { w: 4.5, seed: seed * 37 + 500 + Math.round(a * 10), t, amp: 0.8, smooth: false }) + ' ';
        }
        tow.setAttribute('d', td);
      },
    };
  }


  // ------------------------------------------------------------------ the lunar valley
  function world(parent, P, W, H, seed) {
    const g = el(parent, 'g');
    const gy = P.ground === false ? null : (P.ground ?? 0.86) * H;
    const back = el(g, 'g'), mid = el(g, 'g'), front = el(g, 'g');
    const parts = [];
    const add = (layer, maker, o, upd) => { const node = el(layer, 'g'); const obj = maker(node, seed * 3 + parts.length * 11 + 1); parts.push({ node, obj, o, upd }); };
    const pt = (o, k = 'x') => o[k] * (k === 'x' ? W : H);

    if (P.orb) add(back, orb, P.orb, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 1.0), rise = o.rise ? (1 - progIO(lt, a ?? 0, 2.4)) * o.rise * H : 0;
      return { draw: { x: o.x * W, y: o.y * H + rise, r: (o.r ?? 0.22) * H * (0.6 + 0.4 * p) }, show: p };
    });
    // lake + beach (flat, behind the creatures)
    const lakeG = P.lake ? el(back, 'g') : null, lakeF = lakeG && inkEl(lakeG, mix(INK.blue, INK.paperLight, 0.62)), lakeR = lakeG && inkEl(lakeG, INK.inkSoft);
    const beachG = P.beach ? el(back, 'g') : null, beachF = beachG && inkEl(beachG, INK.paperLight), beachR = beachG && inkEl(beachG, INK.inkSoft);
    const groundR = gy != null ? inkEl(mid) : null, tufts = gy != null ? inkEl(mid, INK.inkSoft) : null;
    (P.pyramids ? Array.from({ length: P.pyramids.n ?? 5 }, (_, i) => i) : []).forEach(i => add(back, pyramid, P.pyramids, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a == null ? null : a + i * 0.15, 0.7);
      return { draw: { x: (o.x + (i - ((o.n ?? 5) - 1) / 2) * (o.gap ?? 0.06)) * W, y: (o.y ?? P.ground ?? 0.86) * H - (i % 2) * 14, s: (o.s ?? 0.9) * (0.75 + 0.25 * ((i * 7) % 3)) * p }, show: p };
    }));
    (P.trees || []).forEach(tr => add(back, tree, tr, (lt, t, cues, o) => ({ draw: { x: o.x * W, y: (o.y ?? P.ground ?? 0.86) * H, s: o.s ?? 0.9 }, show: 1 })));
    if (P.city) add(mid, city, P.city, (lt, t, cues, o) => {
      const a = at(cues, o.at, 0.2), r = clamp01((lt - a) / 1.6) * 9;
      return { draw: { x: o.x * W, y: o.y * H, s: o.s ?? 1, reveal: r }, show: lt >= a ? 1 : 0 };
    });
    if (P.temple) add(mid, temple, P.temple, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 1.0);
      return { draw: { x: o.x * W, y: (o.y ?? P.ground ?? 0.86) * H, s: (o.s ?? 1) * p }, show: p };
    });
    (P.huts || []).forEach(h => add(mid, hut, h, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 0.7), sa = at(cues, o.smoke, null);
      return { draw: { x: o.x * W, y: (o.y ?? P.ground ?? 0.86) * H, s: (o.s ?? 0.8) * p, smoke: sa == null ? 1 : clamp01((lt - sa) / 1.2) }, show: p };
    }));
    if (P.bison) for (let i = 0; i < (P.bison.n ?? 3); i++) add(front, bison, P.bison, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 0.8), d = o.dur ?? 6, q = clamp01((lt - (a ?? 0)) / d);
      const x = lerp(o.x, o.to ?? o.x, q) + i * (o.gap ?? 0.13) * (o.face === 'left' ? 1 : -1);
      return { draw: { x: x * W, y: (o.y ?? P.ground ?? 0.86) * H + (i % 2) * 18, s: (o.s ?? 0.8) * (1 - (i % 2) * 0.12) * p, face: faceOf(o.face, 1), walk: o.to != null && q < 1, graze: i % 2 === 1 || o.to == null }, show: p };
    });
    (P.goats || []).forEach(gt => add(front, goat, gt, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 0.7);
      return { draw: { x: o.x * W, y: (o.y ?? P.ground ?? 0.86) * H, s: (o.s ?? 0.9) * p, face: faceOf(o.face, 1), graze: o.graze !== false, hop: o.hop }, show: p };
    }));
    (P.beavers || []).forEach(bv => add(front, beaver, bv, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 0.7), d = o.dur ?? 5, q = clamp01((lt - (a ?? 0)) / d);
      return { draw: { x: lerp(o.x, o.to ?? o.x, q) * W, y: (o.y ?? P.ground ?? 0.86) * H, s: (o.s ?? 0.9) * p, face: faceOf(o.face, 1), walk: o.to != null && q < 1, baby: o.baby }, show: p };
    }));
    (P.manbats || []).forEach(mb => add(front, manbat, mb, (lt, t, cues, o) => {
      const a = at(cues, o.at, null), p = pop(lt, a, 0.8), d = o.dur ?? 4, q = progIO(lt, a ?? 0, d);
      const x = o.to ? lerp(o.x, o.to[0], q) : o.x, y = o.to ? lerp(o.y ?? P.ground ?? 0.86, o.to[1], q) : (o.y ?? P.ground ?? 0.86);
      const land = o.land && q >= 1;
      return { draw: { x: x * W + (o.fly && !land ? Math.sin(t * 1.3 + o.x * 9) * 12 : 0), y: y * H + (o.fly && !land ? Math.sin(t * 2.1 + o.x * 5) * 10 : 0), s: (o.s ?? 1) * p, face: faceOf(o.face, 1), fly: o.fly && !land, wave: o.wave, sil: o.sil, shock: o.shock }, show: p };
    }));
    // flock: n man-bats in a loose V crossing from "from" to "to" (0..1), each its own wing beat
    if (P.flock) for (let i = 0; i < (P.flock.n ?? 7); i++) add(front, manbat, P.flock, (lt, t, cues, o) => {
      const a = at(cues, o.at, 0), q = clamp01((lt - a) / (o.dur ?? 6)), row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      const dx = -row * (o.gap ?? 0.06), dy = side * row * (o.gap ?? 0.06) * 0.6;
      const x = lerp(o.from[0], o.to[0], q) + dx * Math.sign(o.to[0] - o.from[0]), y = lerp(o.from[1], o.to[1], q) + dy;
      const s = (o.s ?? 0.35) * (1 - row * 0.06);
      return { draw: { x: x * W + Math.sin(t * 1.7 + i) * 8, y: y * H + Math.sin(t * 2.3 + i * 1.3) * 8, s, face: o.to[0] >= o.from[0] ? 1 : -1, fly: true, sil: o.sil, flap: Math.sin(t * TAU * 2 + i * 0.9) }, show: lt >= a ? 1 : 0 };
    });
    if (P.rocket) add(front, rocket, P.rocket, (lt, t, cues, o) => {
      const a = at(cues, o.at, 0.2), q = progIO(lt, a, o.dur ?? 3.5);
      return { draw: { from: [o.from[0] * W, o.from[1] * H], to: [o.to[0] * W, o.to[1] * H], p: q, s: o.s ?? 1 }, show: lt >= a ? 1 : 0 };
    });
    const cast = (P.cast || []).concat(P.kasif ? [P.kasif] : []).map((c, i) => K(el(front, 'g'), c, seed * 5 + i * 13 + 2));
    const labels = (P.labels || []).map((L, i) => label(el(front, 'g'), L, W, H, seed * 41 + i * 7));
    return {
      gy,
      update(lt, t, cues) {
        for (const pr of parts) {
          const r = pr.upd(lt, t, cues, pr.o);
          pr.node.style.visibility = r.show > 0.001 ? 'visible' : 'hidden';
          if (r.show > 0.001) pr.obj.update(t, r.draw);
        }
        if (groundR) {
          const pts = []; for (let i = 0; i <= 12; i++) pts.push([-40 + i * (W + 80) / 12, gy + Math.sin(i * 1.7 + seed) * 6]);
          groundR.setAttribute('d', line(pts, seed * 43, t, 6, 1.4, 0.05));
          let td = ''; const r = rng(seed * 43 + 1);
          for (let i = 0; i < 26; i++) { const x = r() * W, y = gy + 18 + r() * (H - gy - 20); td += line([[x, y], [x + 18 + r() * 30, y - 2]], seed * 43 + 10 + i, t, 3) + ' '; }
          tufts.setAttribute('d', td);
        }
        if (lakeG) {
          const o = P.lake, a = at(cues, o.at, null), p = pop(lt, a, 0.8), cx = o.x * W, cy = (o.y ?? (P.ground ?? 0.86) - 0.04) * H, rx = (o.w ?? 0.25) * W / 2 * p, ry = rx * 0.12;
          lakeG.style.visibility = p > 0.01 ? 'visible' : 'hidden';
          if (p > 0.01) {
            lakeF.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, rx, ry, seed * 47, 16), { seed: seed * 47, t, amp: 1 }));
            let rd = ''; for (let i = 0; i < 5; i++) { const q = ((t * 0.3 + i / 5) % 1), yy = cy - ry * 0.6 + i * ry * 0.3, xx = cx - rx * 0.7 + q * rx * 0.4 + (i % 2) * rx * 0.5; rd += line([[xx, yy], [xx + rx * 0.3, yy]], seed * 47 + 3 + i, t, 3) + ' '; }
            lakeR.setAttribute('d', inkPath(inkEllipsePts(cx, cy, rx, ry, seed * 47, 16), { w: 4, seed: seed * 47 + 1, t, closed: true, amp: 1 }) + ' ' + rd);
          }
        }
        if (beachG) {
          const o = P.beach, a = at(cues, o.at, null), p = pop(lt, a, 0.8), x0 = o.x0 * W, x1 = lerp(x0, o.x1 * W, p), y = gy - 6;
          const top = [[x0, y], [lerp(x0, x1, 0.3), y - 26], [lerp(x0, x1, 0.7), y - 30], [x1, y - 8]];
          beachF.setAttribute('d', p > 0.01 ? inkLoop(top.concat([[x1, y + 24], [x0, y + 24]]), { seed: seed * 53, t, amp: 1 }) : '');
          let bd = p > 0.01 ? line(top, seed * 53 + 1, t, 4) + ' ' : '';
          const r = rng(seed * 53 + 2);
          for (let i = 0; i < 30 && p > 0.3; i++) { const xx = lerp(x0, x1, r()), yy = y - 18 + r() * 34; bd += inkDot(xx, yy, 2.2, 2.2, seed * 53 + 10 + i, t) + ' '; }
          for (let i = 0; i < 3 && p > 0.3; i++) { const q = ((t * 0.25 + i / 3) % 1), xx = lerp(x0, x1, 0.15 + q * 0.7); bd += line([[xx, y + 34 + i * 8], [xx + 60, y + 32 + i * 8]], seed * 53 + 50 + i, t, 3) + ' '; }
          beachR.setAttribute('d', bd);
        }
        cast.forEach(c => c && c.update(lt, t, cues, W, H));
        labels.forEach(l => l.update(lt, t, cues));
      },
    };
  }

  window.MOON = { at, K, label, world, manbat, bison, goat, beaver, hut, temple, tree, pyramid, orb, rocket, city, ell, tf, line, shape, setShape, faceOf };
})();
