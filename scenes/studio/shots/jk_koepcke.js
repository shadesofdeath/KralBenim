// jk_koepcke: shots for the Juliane Koepcke survival Short (Stickstory 2026-10-26), parchment ink style
// (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every line boils at 8 Hz via _ink.js, everything a pure
// function of (seed, lt). Parametric: usable for any "fell from the sky / lost in the jungle / followed the river" story.
//
// SHOTS.jk_fall — open sky: a torn-out row of three airline seats tumbles down through clouds rushing upwards, a girl
//   strapped into the middle seat (front view, hair blown up, arms flailing); speed lines; rainforest canopy below.
//   P: {seat: {x: 0.6, y: 0.34, s: 1, spin: 9 (deg sway), belt: cue (seat belt flashes red + punch)},
//       canopy: {y: 0.6 (top of the crowns, 0..1 H), rise: 60 (px it rises during the shot)} | false,
//       clouds: 5, labels: [{text, x, y, at, size, color, font: "hand"|"serif", box, underline, rot}],
//       kasif: {x, y (ground, 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//       cam: {zoom: 1.06}}   cues: hit (punch), belt, label/seq names
// SHOTS.jk_storm — a four-engine turboprop airliner (side view, flying right) inside a storm: dark clouds, rain;
//   cue "bolt": a lightning bolt strikes the wing, fire + smoke; cue "split": the fuselage breaks in two behind the
//   wing, both halves tumble and drop, debris flies.
//   P: {plane: {x: 0.5, y: 0.4, s: 1}, bolt: cue, split: cue, labels: [...], kasif: K | false, cam}
// SHOTS.jk_jungle — rainforest floor: giant trunks, hanging vines, ferns, a crashed seat row on the ground, the girl
//   (side view, long hair, one sandal, bandaged shoulder) sitting on a root; optional arrows to labels.
//   P: {seat: {x: 0.3, s: 0.55, rot: -14} | false, girl: {x: 0.55, scale: 0.8, pose: "sit", face: "left", emotion,
//       seq}, ground: 0.6, labels: [...], arrows: [{from: [x, y], to: [x, y], at, color}], kasif: K | false, cam}
// SHOTS.jk_river — side view along a jungle stream that widens (trickle -> river); the world scrolls while the girl
//   and the narrator walk downstream; a day counter ticks with tally marks; optional hut on stilts, canoe and
//   loggers for the rescue (scroll: false).
//   P: {scroll: true, widen: [0.25, 1] (river width at start/end, 0..1), girl: {x: 0.55, scale: 0.72, pose: "walk",
//       face: "right", seq}, days: {from: 1, to: 11, at, dur, x: 0.5, y: 0.2} | false, hut: {x: 0.8} | false,
//       canoe: {x: 0.62} | false, loggers: [{x, scale, pose, face, beard, seq}], labels: [...], kasif: K | false}
//   cues: hit, days.at, label/seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft };
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 16) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const tf = (pts, x, y, s = 1, rotDeg = 0) => {
    const a = rotDeg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    return pts.map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]);
  };
  const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // ------------------------------------------------------------------ pop-in label
  function label(parent, L, W, H, sd) {
    if (!L) return null;
    const g = el(parent, 'g'), box = inkEl(g, COL[L.color] || INK.red), boxR = inkEl(g);
    const hand = (L.font || 'hand') === 'hand', size = L.size || 90;
    const txt = el(g, 'text', { 'font-family': hand ? INK_FONT : FR, 'font-weight': hand ? 400 : 900, 'font-size': size, 'text-anchor': 'middle',
      fill: L.box ? INK.paperLight : (COL[L.color] || INK.ink) });
    txt.textContent = L.text;
    const und = inkEl(g, COL[L.color] || INK.ink);
    let w = 0; try { w = txt.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = L.text.length * size * 0.55;
    return {
      update(lt, t, cues) {
        const a = atOr(cues, L.at, 0.1), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5);
        const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.2) * H, b = boil(sd + 5, t, 1.2);
        g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1((L.rot ?? -3) + (1 - p) * -8)}) scale(${(lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
        txt.setAttribute('y', f1(size * 0.34));
        if (L.box) {
          const bw = w + 70, bh = size * 1.3, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
          box.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, smooth: false }));
          boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        }
        const u = L.underline === false || L.box ? 0 : (lt >= a ? prog(lt, a + 0.2, 0.35) : 0);
        und.setAttribute('d', u > 0.01 ? inkPath([[-w / 2, size * 0.52], [-w / 2 + w * u, size * 0.46]], { w: 6, seed: sd + 3, t }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ hand-drawn arrow that draws itself
  function arrow(parent, A, W, H, sd) {
    const p = inkEl(parent, COL[A.color] || INK.ink), hd = inkEl(parent, COL[A.color] || INK.ink);
    return {
      update(lt, t, cues) {
        const a = atOr(cues, A.at, 0.3), u = lt >= a ? prog(lt, a, 0.45) : 0;
        if (u <= 0.01) { p.setAttribute('d', ''); hd.setAttribute('d', ''); return; }
        const x0 = A.from[0] * W, y0 = A.from[1] * H, x1 = A.to[0] * W, y1 = A.to[1] * H;
        const mx = (x0 + x1) / 2 + (y1 - y0) * 0.18, my = (y0 + y1) / 2 - (x1 - x0) * 0.18;
        const pts = [];
        for (let k = 0; k <= 10; k++) { const s = k / 10 * u, q = 1 - s; pts.push([q * q * x0 + 2 * q * s * mx + s * s * x1, q * q * y0 + 2 * q * s * my + s * s * y1]); }
        p.setAttribute('d', inkPath(pts, { w: 7, seed: sd + 1, t, amp: 1.2 }));
        if (u > 0.9) {
          const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 3], ang = Math.atan2(ey - py, ex - px);
          const L = 34, h1 = [ex - Math.cos(ang - 0.5) * L, ey - Math.sin(ang - 0.5) * L], h2 = [ex - Math.cos(ang + 0.5) * L, ey - Math.sin(ang + 0.5) * L];
          hd.setAttribute('d', inkPath([h1, [ex, ey], h2], { w: 7, seed: sd + 2, t, amp: 1, smooth: false }));
        } else hd.setAttribute('d', '');
      },
    };
  }

  // ------------------------------------------------------------------ narrator / cast member (Kaşif rig)
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    return {
      update(lt, t, cues, W, H, extra = {}) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let x = (K.x ?? 0.8) * W;
        const y = (K.y ?? 0.6) * H + (extra.dy || 0), face = faceOf(s.face ?? K.face, -1);
        let pose = s.pose || 'idle', ph = extra.ph;
        if (K.walk_in && i === 0) {                    // walks in from off-frame to x
          const T = K.walk_in, u = clamp01(lt / T), x0 = x - face * W * 0.35;
          x = lerp(x0, x, 1 - (1 - u) * (1 - u)); pose = u < 1 ? 'walk' : (K.pose || 'idle');
          ph = Math.abs(x - x0) / (K.scale ?? 1) / KASIF.gait('walk');
        }
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, ph };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        rig.update(t, pose, o);
        return { x, y, face, pose, ph };
      },
    };
  }

  // ------------------------------------------------------------------ the girl, side view (rig without hat + long hair,
  // one sandal, a bandage on the collarbone)
  const GW = { half: 54, lift: 30, f: 0.5 };
  function gaitFoot(p, half, lift, f) {
    p = ((p % 1) + 1) % 1;
    if (p < f) return [half * (1 - 2 * p / f), 0];
    const s = (p - f) / (1 - f);
    return [-half + 2 * half * smooth(s), -lift * Math.sin(Math.PI * s) * (1 - 0.3 * s)];
  }
  function girl(parent, K, sd) {
    const g = el(parent, 'g');
    const hairB = inkEl(g, INK.inkSoft), hairBR = inkEl(g);
    const rg = el(g, 'g'), rig = KASIF.create(rg, { scale: K.scale ?? 0.8, hat: false, seed: sd });
    const hairF = inkEl(g, INK.inkSoft), hairFR = inkEl(g);
    const sole = inkEl(g, INK.hatBand), strap = inkEl(g);
    const band = inkEl(g, INK.paperLight), bandR = inkEl(g), flyB = inkEl(g), flyW = inkEl(g, INK.paperLight), flyWR = inkEl(g, INK.inkSoft);
    return {
      update(lt, t, cues, W, H, extra = {}) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const sc = K.scale ?? 0.8, face = faceOf(s.face ?? K.face, 1);
        const X = (K.x ?? 0.5) * W, Y = (K.y ?? 0.6) * H + (extra.dy || 0), pose = s.pose || 'idle';
        const ph = extra.ph ?? lt / 0.9;
        const o = { x: X, y: Y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || K.emotion || null, mouth: 0, ph };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o);
        const Wp = p => [X + face * sc * p[0], Y + sc * p[1]];
        const hc = Wp(r.head), R = 72 * sc;
        const HP = pts => pts.map(([u, v]) => [hc[0] + face * u * R, hc[1] + v * R]);
        const sway = Math.sin(t * 2.3) * 0.08, wind = pose === 'walk' ? -0.12 : 0;
        const back = HP([[0.8, -0.62], [0.3, -1.04], [-0.35, -1.06], [-0.9, -0.72], [-1.12, -0.05], [-1.12 + wind, 0.7], [-1.0 + sway + wind, 1.45],
          [-0.62 + sway + wind, 1.62], [-0.42, 1.1], [-0.5, 0.4], [-0.2, 0.1]]);
        hairB.setAttribute('d', inkLoop(back, { seed: sd * 3 + 1, t, amp: 1 }));
        hairBR.setAttribute('d', inkPath(back, { w: 4.5, seed: sd * 3 + 2, t, closed: true, amp: 1 }));
        const fr = HP([[0.88, -0.42], [0.62, -0.86], [0.1, -1.07], [-0.5, -0.97], [-0.92, -0.6], [-0.98, -0.12], [-0.6, -0.5], [0.0, -0.62], [0.5, -0.5]]);
        hairF.setAttribute('d', inkLoop(fr, { seed: sd * 3 + 3, t, amp: 0.9 }));
        hairFR.setAttribute('d', inkPath(fr, { w: 4, seed: sd * 3 + 4, t, closed: true, amp: 0.9 }));
        // one sandal (right foot); the other foot stays bare
        let fR = [26, 0], lean = 2, hip = r.hip;
        if (pose === 'walk') { fR = gaitFoot(ph + 0.5, GW.half, GW.lift, GW.f); lean = 6; }
        else if (pose === 'sit') { fR = [92, 0]; lean = 2; }
        else if (pose === 'run') { fR = [0, 0]; }
        if (K.sandal !== false && pose !== 'run' && pose !== 'shock') {
          const fx = fR[0] + 9, fy = fR[1];
          const sp = [[fx - 26, fy + 2], [fx + 26, fy + 1], [fx + 28, fy + 9], [fx - 27, fy + 10]].map(Wp);
          sole.setAttribute('d', inkLoop(sp, { seed: sd * 3 + 5, t, amp: 0.6, smooth: false }));
          strap.setAttribute('d', inkPath([Wp([fx - 6, fy - 14]), Wp([fx + 2, fy + 2])], { w: 4.5, seed: sd * 3 + 6, t, amp: 0.5 }) + ' ' +
            inkPath([Wp([fx + 10, fy - 12]), Wp([fx + 16, fy + 2])], { w: 4.5, seed: sd * 3 + 7, t, amp: 0.5 }));
        } else { sole.setAttribute('d', ''); strap.setAttribute('d', ''); }
        // bandage over the broken collarbone (front shoulder)
        if (K.bandage !== false) {
          const a = lean * Math.PI / 180, sho = [hip[0] + Math.sin(a) * 108, hip[1] - Math.cos(a) * 108];
          const bp = [[sho[0] - 6, sho[1] - 12], [sho[0] + 30, sho[1] + 2], [sho[0] + 24, sho[1] + 22], [sho[0] - 12, sho[1] + 8]].map(Wp);
          band.setAttribute('d', inkLoop(bp, { seed: sd * 3 + 8, t, amp: 0.6, smooth: false }));
          bandR.setAttribute('d', inkPath(bp, { w: 3.5, seed: sd * 3 + 9, t, closed: true, amp: 0.6, smooth: false }) + ' ' +
            inkPath([Wp([sho[0] + 4, sho[1] - 3]), Wp([sho[0] + 0, sho[1] + 12])], { w: 3, seed: sd * 3 + 10, t, amp: 0.5 }) + ' ' +
            inkPath([Wp([sho[0] + 16, sho[1] + 3]), Wp([sho[0] + 12, sho[1] + 17])], { w: 3, seed: sd * 3 + 11, t, amp: 0.5 }));
        }
        if (K.flies) {
          const a = lean * Math.PI / 180, sho = Wp([hip[0] + Math.sin(a) * 108 + 10, hip[1] - Math.cos(a) * 108 + 20]);
          let b = '', w = '', wr = '';
          for (let k = 0; k < 5; k++) {
            const ang = t * (3.2 + k * 0.4) + k * 1.3, rx = 70 + k * 12, fx = sho[0] + Math.cos(ang) * rx, fy = sho[1] + Math.sin(ang * 1.3) * 46 - 10;
            b += inkDot(fx, fy, 7, 5, sd * 5 + k, t) + ' ';
            const flap = Math.abs(Math.sin(t * 40 + k)) * 6 + 4;
            const w1 = ell(fx - 5, fy - flap, 7, 4, 8), w2 = ell(fx + 5, fy - flap, 7, 4, 8);
            w += inkLoop(w1, { seed: sd * 5 + 10 + k, t, amp: 0.3 }) + ' ' + inkLoop(w2, { seed: sd * 5 + 20 + k, t, amp: 0.3 }) + ' ';
            wr += inkPath(w1, { w: 2, seed: sd * 5 + 30 + k, t, closed: true, amp: 0.3 }) + ' ' + inkPath(w2, { w: 2, seed: sd * 5 + 40 + k, t, closed: true, amp: 0.3 }) + ' ';
          }
          flyB.setAttribute('d', b); flyW.setAttribute('d', w); flyWR.setAttribute('d', wr);
        }
        return { x: X, y: Y, head: hc };
      },
    };
  }

  // ------------------------------------------------------------------ row of three airline seats (front view), optional
  // strapped girl in the middle seat (hair blown upwards, arms flailing). Local units: seat row ~520 wide.
  function seatRow(parent, sd, withGirl) {
    const g = el(parent, 'g');
    const legs = inkEl(g);
    const backs = [0, 1, 2].map(() => ({ f: inkEl(g, INK.blue, { 'fill-opacity': 0.55 }), r: inkEl(g), cap: inkEl(g, INK.paperLight), capR: inkEl(g) }));
    const hairF = withGirl ? inkEl(g, INK.inkSoft) : null, hairR = withGirl ? inkEl(g) : null;
    const body = withGirl ? inkEl(g) : null, head = withGirl ? inkEl(g, INK.paperLight) : null, headR = withGirl ? inkEl(g) : null;
    const face = withGirl ? inkEl(g) : null, fringe = withGirl ? inkEl(g, INK.inkSoft) : null;
    const cush = inkEl(g, INK.blue, { 'fill-opacity': 0.75 }), cushR = inkEl(g), arms = inkEl(g, INK.paperDark), armsR = inkEl(g);
    const shins = withGirl ? inkEl(g) : null, feet = withGirl ? inkEl(g) : null, sandal = withGirl ? inkEl(g, INK.hatBand) : null;
    const belt = inkEl(g, INK.hatBand), beltR = inkEl(g), buckle = inkEl(g, INK.gold), buckleR = inkEl(g);
    return {
      node: g,
      update(t, o = {}) {
        const S = k => sd * 60 + k;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${(o.s ?? 1).toFixed(4)})`);
        const xs = [-170, 0, 170];
        backs.forEach((b, i) => {
          const x = xs[i], p = [[x - 72, -30], [x - 76, -220], [x - 60, -250], [x + 60, -250], [x + 76, -220], [x + 72, -30]];
          b.f.setAttribute('d', inkLoop(p, { seed: S(i), t, amp: 1 }));
          b.r.setAttribute('d', inkPath(p, { w: 6, seed: S(10 + i), t, closed: true, amp: 1 }));
          const c = [[x - 60, -246], [x + 60, -246], [x + 64, -196], [x - 64, -196]];
          b.cap.setAttribute('d', inkLoop(c, { seed: S(20 + i), t, amp: 0.8, smooth: false }));
          b.capR.setAttribute('d', inkPath(c, { w: 4, seed: S(30 + i), t, closed: true, amp: 0.8, smooth: false }));
        });
        // legs + broken floor rail (jagged ends: the row was torn out of the cabin)
        legs.setAttribute('d', o.legs === false ? '' : [
          inkPath([[-190, 40], [-200, 130], [-170, 130]], { w: 8, seed: S(40), t, smooth: false }),
          inkPath([[190, 40], [200, 130], [170, 130]], { w: 8, seed: S(41), t, smooth: false }),
          inkPath([[-280, 132], [-250, 124], [-262, 140], [-230, 130], [230, 130], [262, 140], [250, 124], [282, 134]], { w: 7, seed: S(42), t, smooth: false }),
        ].join(' '));
        const cp = [[-252, -36], [252, -36], [262, 30], [-262, 30]];
        cush.setAttribute('d', inkLoop(cp, { seed: S(43), t, amp: 1, smooth: false }));
        cushR.setAttribute('d', inkPath(cp, { w: 6, seed: S(44), t, closed: true, amp: 1, smooth: false }) + ' ' +
          inkPath([[-85, -34], [-85, 28]], { w: 4, seed: S(45), t }) + ' ' + inkPath([[85, -34], [85, 28]], { w: 4, seed: S(46), t }));
        let ar = '', arr = '';
        for (const [k, x] of [[0, -255], [1, -85], [2, 85], [3, 255]]) {
          const a = [[x - 12, -110], [x + 12, -110], [x + 12, -20], [x - 12, -20]];
          ar += inkLoop(a, { seed: S(50 + k), t, amp: 0.8, smooth: false }) + ' ';
          arr += inkPath(a, { w: 4.5, seed: S(55 + k), t, closed: true, amp: 0.8, smooth: false }) + ' ';
        }
        arms.setAttribute('d', ar); armsR.setAttribute('d', arr);
        if (withGirl) {
          const fl = o.flail ?? 1, w1 = Math.sin(t * 7.3), w2 = Math.sin(t * 6.1 + 1.3), up = o.hairUp ?? 1;
          // hair blown upwards by the wind of the fall
          const hp = [[-58, -200], [-74 - 8 * w1, -250 - 40 * up], [-60 + 6 * w2, -258 - 62 * up], [-30, -262 - 50 * up], [-16 + 6 * w1, -266 - 78 * up],
            [8, -262 - 56 * up], [26 + 6 * w2, -266 - 70 * up], [44, -262 - 44 * up], [66 + 8 * w2, -252 - 52 * up], [74 + 8 * w1, -240 - 28 * up], [58, -200], [0, -170]];
          hairF.setAttribute('d', inkLoop(hp, { seed: S(60), t, amp: 1.2 }));
          hairR.setAttribute('d', inkPath(hp, { w: 4.5, seed: S(61), t, closed: true, amp: 1.2 }));
          // torso + flailing arms
          const sh = [[-36, -138], [36, -138]];
          const eL = [-112 - 10 * w1 * fl, -178 - 20 * w2 * fl], hL = [-150 - 14 * w2 * fl, -268 - 26 * w1 * fl];
          const eR = [112 + 10 * w2 * fl, -176 - 20 * w1 * fl], hR = [150 + 14 * w1 * fl, -262 - 26 * w2 * fl];
          body.setAttribute('d', [
            inkPath([[0, -150], [0, -10]], { w: 7, seed: S(62), t }),
            inkPath([[0, -140], ...[sh[0]], eL, hL], { w: 7, seed: S(63), t }),
            inkPath([[0, -140], ...[sh[1]], eR, hR], { w: 7, seed: S(64), t }),
            inkDot(hL[0], hL[1], 11, 10, S(65), t), inkDot(hR[0], hR[1], 11, 10, S(66), t),
          ].join(' '));
          const hd = ell(0, -205, 58, 56, 14);
          head.setAttribute('d', inkLoop(hd, { seed: S(67), t, amp: 1.2 }));
          headR.setAttribute('d', inkPath(hd, { w: 6, seed: S(68), t, closed: true, amp: 1.2 }));
          const fp = [[-56, -214], [-44, -246], [-10, -262], [30, -258], [56, -228], [52, -214], [20, -236], [-20, -232]];
          fringe.setAttribute('d', inkLoop(fp, { seed: S(69), t, amp: 0.8 }));
          // scared face: wide eyes, raised worried brows, small "o" mouth
          face.setAttribute('d', [
            inkDot(-20, -200, 7.5, 9, S(70), t), inkDot(20, -200, 7.5, 9, S(71), t),
            inkPath([[-34, -222], [-22, -228], [-10, -224]], { w: 4, seed: S(72), t, amp: 0.6 }),
            inkPath([[10, -224], [22, -228], [34, -222]], { w: 4, seed: S(73), t, amp: 0.6 }),
            inkCircle(0, -172, 8, S(74), t, { w: 4, n: 8 }),
          ].join(' '));
          // shins dangle from the seat edge, one bare foot, one sandal
          const kL = [-32, 30], kR = [32, 30], fLp = [-44 - 16 * w2, 140 + 6 * w1], fRp = [46 + 16 * w1, 138 + 6 * w2];
          shins.setAttribute('d', inkPath([kL, fLp], { w: 7, seed: S(75), t }) + ' ' + inkPath([kR, fRp], { w: 7, seed: S(76), t }));
          feet.setAttribute('d', inkDot(fLp[0], fLp[1] + 8, 13, 10, S(77), t) + ' ' + inkDot(fRp[0], fRp[1] + 8, 13, 10, S(78), t));
          sandal.setAttribute('d', inkLoop([[fRp[0] - 18, fRp[1] + 16], [fRp[0] + 18, fRp[1] + 16], [fRp[0] + 19, fRp[1] + 24], [fRp[0] - 19, fRp[1] + 24]], { seed: S(79), t, amp: 0.5, smooth: false }));
        }
        // seat belt across the lap (flashes red on cue)
        const bc = o.beltGlow ? mix(INK.hatBand, INK.red, clamp01(o.beltGlow)) : INK.hatBand;
        belt.setAttribute('fill', bc);
        const bp = [[-80, -20], [80, -20], [80, 4], [-80, 4]];
        belt.setAttribute('d', withGirl ? inkLoop(bp, { seed: S(80), t, amp: 0.8, smooth: false }) : '');
        beltR.setAttribute('d', withGirl ? inkPath(bp, { w: 4, seed: S(81), t, closed: true, amp: 0.8, smooth: false }) : '');
        const bk = [[-18, -26], [18, -26], [18, 10], [-18, 10]];
        buckle.setAttribute('d', withGirl ? inkLoop(bk, { seed: S(82), t, amp: 0.6, smooth: false }) : '');
        buckleR.setAttribute('d', withGirl ? inkPath(bk, { w: 4, seed: S(83), t, closed: true, amp: 0.6, smooth: false }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ puffy cloud
  function cloudPts(cx, cy, rx, ry, k) {
    const n = 18, out = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, bump = 1 + 0.14 * Math.abs(Math.sin(a * 3 + k));
      const y = Math.sin(a) * ry * bump;
      out.push([cx + Math.cos(a) * rx * bump, cy + (y > 0 ? y * 0.55 : y)]);
    }
    return out;
  }
  function clouds(parent, sd, n, W, H, dark) {
    const g = el(parent, 'g'), f = inkEl(g, dark ? INK.paperDark : INK.paperLight), r = inkEl(g, INK.inkSoft), hatch = inkEl(g, INK.inkSoft);
    const R = rng(sd * 13 + 5), list = [];
    for (let i = 0; i < n; i++) list.push({ x: R(), y: R(), rx: lerp(120, 230, R()), ry: lerp(55, 95, R()), k: R() * 6, v: lerp(0.7, 1.3, R()) });
    return {
      // dir: "up" (falling: clouds rush upwards) | "left" (flying right); speed in px/s
      update(t, dir, speed, y0 = 0, y1 = 1) {
        let fd = '', rd = '', hd = '';
        list.forEach((c, i) => {
          let x, y;
          if (dir === 'up') { const span = H * 1.4; x = c.x * W; y = ((c.y * span - t * speed * c.v) % span + span) % span - H * 0.2; }
          else { const span = W + 600; x = ((c.x * span - t * speed * c.v) % span + span) % span - 300; y = lerp(y0, y1, c.y) * H; }
          if (dir === 'up' && y < H * 0.17 && x - c.rx < W * 0.5) return;   // keep the kicker corner clean
          const p = cloudPts(x, y, c.rx, c.ry, c.k);
          fd += inkLoop(p, { seed: sd + i, t, amp: 1.2 }) + ' ';
          rd += inkPath(p, { w: 4.5, seed: sd + 40 + i, t, closed: true, amp: 1.2 }) + ' ';
          if (dir === 'up') for (let k = 0; k < 3; k++) hd += inkPath([[x - c.rx * 0.5 + k * c.rx * 0.5, y + c.ry * 0.6], [x - c.rx * 0.5 + k * c.rx * 0.5, y + c.ry * 0.6 + 90 + k * 30]], { w: 3, seed: sd + 120 + i * 3 + k, t, amp: 0.6, taper: 0.5 }) + ' ';
          if (dark) for (let k = 0; k < 3; k++) hd += inkPath([[x - c.rx * 0.5 + k * 40, y + c.ry * 0.25], [x - c.rx * 0.5 + k * 40 + 50, y + c.ry * 0.05]], { w: 3, seed: sd + 80 + i * 3 + k, t, amp: 0.8 }) + ' ';
        });
        f.setAttribute('d', fd); r.setAttribute('d', rd); hatch.setAttribute('d', hd);
      },
    };
  }

  // ------------------------------------------------------------------ rainforest canopy seen from above/side
  function canopy(parent, sd, W) {
    const g = el(parent, 'g'), base = inkEl(g, INK.green, { 'fill-opacity': 0.55 }), f = inkEl(g, INK.green, { 'fill-opacity': 0.42 }), r = inkEl(g), leaf = inkEl(g, INK.inkSoft);
    const R = rng(sd * 7 + 1), crowns = [];
    for (let x = -60; x < W + 120; x += 120) crowns.push({ x: x + R() * 40, dy: R() * 40, rx: lerp(80, 110, R()), ry: lerp(52, 70, R()), k: R() * 6 });
    return {
      update(t, y, H) {
        base.setAttribute('d', inkLoop([[-40, y + 40], [W + 40, y + 40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 1, t, smooth: false }));
        let fd = '', rd = '', ld = '';
        crowns.forEach((c, i) => {
          const sw = Math.sin(t * 1.6 + c.k) * 3, p = cloudPts(c.x + sw, y + c.dy, c.rx, c.ry, c.k);
          fd += inkLoop(p, { seed: sd + 10 + i, t, amp: 1.2 }) + ' ';
          rd += inkPath(p, { w: 5, seed: sd + 40 + i, t, closed: true, amp: 1.2 }) + ' ';
          ld += inkPath([[c.x - 30 + sw, y + c.dy + 4], [c.x + sw, y + c.dy - 14], [c.x + 30 + sw, y + c.dy + 2]], { w: 3.5, seed: sd + 70 + i, t, amp: 1 }) + ' ';
        });
        f.setAttribute('d', fd); r.setAttribute('d', rd); leaf.setAttribute('d', ld);
      },
    };
  }

  function camOf(cam, W, H, lt, dur, zoom, hit, fx = 0.5, fy = 0.42, shake = 0) {
    const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
    cam.setAttribute('transform', `translate(${f1(W * fx + shake)} ${f1(H * fy)}) scale(${z.toFixed(4)}) translate(${f1(-W * fx)} ${f1(-H * fy)})`);
  }

  // ================================================================== jk_fall
  SH.jk_fall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 611;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cl = clouds(cam, sd + 1, P.clouds ?? 5, W, H, false);
      const speed = inkEl(cam, INK.inkSoft), speed2 = inkEl(cam, INK.ink);
      const CN = P.canopy === false ? null : Object.assign({ y: 0.6, rise: 60 }, P.canopy || {});
      const can = CN ? canopy(cam, sd + 2, W) : null;
      const SE = Object.assign({ x: 0.6, y: 0.34, s: 1, spin: 6, rot: 18 }, P.seat || {});
      const seat = seatRow(el(cam, 'g'), sd + 3, true);
      const labels = (P.labels || []).map((L, i) => label(cam, L, W, H, sd + 30 + i));
      const kas = P.kasif ? figure(el(root, 'g'), Object.assign({ x: 0.18, y: 0.585, scale: 0.8, pose: 'look', face: 'right' }, P.kasif), sd + 6) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      const R = rng(sd + 9), lines = Array.from({ length: 24 }, () => ({ x: R(), y: R(), L: lerp(90, 230, R()), v: lerp(0.8, 1.4, R()), k: R() }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, W, H, lt, dur, zoom, hit);
          cl.update(t, 'up', 900);
          // speed lines rushing upwards
          const sp = [], sp2 = [];
          lines.forEach((q, i) => {
            const span = H * 0.9, y = ((q.y * span - t * 1500 * q.v) % span + span) % span + H * 0.04, x = q.x * W;
            (q.k < 0.35 ? sp2 : sp).push(inkPath([[x, y], [x + 2, y + q.L]], { w: q.k < 0.35 ? 5 : 3.5, seed: sd + 100 + i, t, amp: 0.8, taper: 0.5 }));
          });
          // streaks right around the seat: the air rushing past it
          for (let k = 0; k < 6; k++) {
            const span = H * 0.5, x = SE.x * W + (k - 2.5) * 110 * SE.s, y = ((k * 137 - t * 1700) % span + span) % span + SE.y * H - H * 0.25;
            sp2.push(inkPath([[x, y], [x + 1, y + 170]], { w: 4.5, seed: sd + 150 + k, t, amp: 0.8, taper: 0.5 }));
          }
          speed.setAttribute('d', sp.join(' ')); speed2.setAttribute('d', sp2.join(' '));
          const cy = CN ? CN.y * H - CN.rise * clamp01(lt / Math.max(1, dur)) : 0;
          if (can) can.update(t, cy, H);
          const ba = atOr(cues, SE.belt, null), bg = ba == null ? 0 : (lt >= ba ? clamp01(1 - (lt - ba - 0.8) / 0.6) * (0.6 + 0.4 * Math.sin(lt * 16)) : 0);
          const bp = punch(lt, ba, 0.6);
          seat.update(t, { x: SE.x * W + Math.sin(t * 1.3) * 14, y: SE.y * H + Math.sin(t * 2.2) * 10, s: SE.s * (1 + 0.04 * hit + 0.05 * bp),
            rot: SE.spin * Math.sin(t * 1.7) + (SE.rot || 0) + 4 * Math.sin(t * 0.6), beltGlow: bg, legs: false });
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H, { dy: CN ? -CN.rise * clamp01(lt / Math.max(1, dur)) : 0 });
        },
      };
    },
  };

  // ================================================================== jk_storm
  function plane(parent, sd) {
    const g = el(parent, 'g');
    const whole = el(g, 'g'), rear = el(g, 'g'), front = el(g, 'g');
    const mk = (grp) => ({
      fin: inkEl(grp, INK.paperLight), finR: inkEl(grp), stab: inkEl(grp, INK.paperLight), stabR: inkEl(grp),
      body: inkEl(grp, INK.paperLight), stripe: inkEl(grp, INK.blue, { 'fill-opacity': 0.75 }), bodyR: inkEl(grp), win: inkEl(grp),
    });
    const W0 = mk(whole), RR = mk(rear), FF = mk(front);
    const wingG = el(g, 'g'), wing = inkEl(wingG, INK.paperDark), wingR = inkEl(wingG), nac = inkEl(wingG, INK.paperDark), nacR = inkEl(wingG), props = inkEl(wingG, INK.inkSoft);
    const fire = inkEl(g, INK.red), fire2 = inkEl(g, INK.gold), smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.55 });
    const debris = inkEl(g, INK.paperLight), debrisR = inkEl(g);
    const FULL = [[-380, -40], [250, -44], [330, -36], [380, -10], [385, 8], [360, 30], [300, 44], [-330, 44], [-392, 18]];
    const CUT = [[-40, 44], [-30, 25], [-52, 10], [-28, -8], [-50, -26], [-40, -43]];
    const FRONT = [[-40, -43], [250, -44], [330, -36], [380, -10], [385, 8], [360, 30], [300, 44], ...CUT.slice(0, 5)];
    const REAR = [[-380, -40], [-40, -43], ...CUT.slice().reverse().slice(1), [-330, 44], [-392, 18]];
    const FIN = [[-300, -40], [-388, -196], [-340, -200], [-232, -40]], STAB = [[-320, -2], [-440, -16], [-446, 4], [-320, 16]];
    const draw = (D, body, fin, k, t, xr) => {
      const S = n => sd * 50 + k * 20 + n;
      D.body.setAttribute('d', inkLoop(body, { seed: S(1), t, amp: 1, smooth: false }));
      D.bodyR.setAttribute('d', inkPath(body, { w: 6, seed: S(2), t, closed: true, amp: 1, smooth: false }));
      const x0 = Math.max(-372, xr[0]), x1 = Math.min(340, xr[1]);
      D.stripe.setAttribute('d', x1 > x0 ? inkLoop([[x0, 8], [x1, 8], [x1, 20], [x0, 20]], { seed: S(3), t, amp: 0.6, smooth: false }) : '');
      let wd = '';
      for (let x = -290; x <= 250; x += 38) if (x > xr[0] + 14 && x < xr[1] - 14) wd += inkDot(x, -12, 8, 9, S(4) + x, t) + ' ';
      if (xr[1] > 300) wd += inkLoop([[300, -30], [340, -26], [350, -14], [304, -14]], { seed: S(5), t, amp: 0.5, smooth: false });
      D.win.setAttribute('d', wd);
      if (fin) {
        D.fin.setAttribute('d', inkLoop(FIN, { seed: S(6), t, smooth: false })); D.finR.setAttribute('d', inkPath(FIN, { w: 6, seed: S(7), t, closed: true, smooth: false }));
        D.stab.setAttribute('d', inkLoop(STAB, { seed: S(8), t, smooth: false })); D.stabR.setAttribute('d', inkPath(STAB, { w: 5, seed: S(9), t, closed: true, smooth: false }));
      } else { D.fin.setAttribute('d', ''); D.finR.setAttribute('d', ''); D.stab.setAttribute('d', ''); D.stabR.setAttribute('d', ''); }
    };
    return {
      // o: {x, y, s, rot, split: 0..1, fire: 0..1}; returns world point of the struck wing engine
      update(t, o) {
        const s = o.s ?? 1, sp = clamp01(o.split ?? 0);
        g.setAttribute('transform', `translate(${f1(o.x)} ${f1(o.y)}) rotate(${f1(o.rot ?? 0)}) scale(${s.toFixed(4)})`);
        const broken = sp > 0.001;
        whole.style.display = broken ? 'none' : ''; rear.style.display = front.style.display = broken ? '' : 'none';
        if (!broken) draw(W0, FULL, true, 0, t, [-400, 400]);
        else {
          draw(RR, REAR, true, 1, t, [-400, -40]); draw(FF, FRONT, false, 2, t, [-40, 400]);
          const e = smooth(sp);
          rear.setAttribute('transform', `translate(${f1(-90 * e)} ${f1(60 * e)}) rotate(${f1(-22 * e)} -40 0)`);
          front.setAttribute('transform', `translate(${f1(70 * e)} ${f1(110 * e)}) rotate(${f1(28 * e)} -40 0)`);
          wingG.setAttribute('transform', `translate(${f1(70 * e)} ${f1(110 * e)}) rotate(${f1(28 * e)} -40 0)`);
        }
        if (!broken) wingG.setAttribute('transform', '');
        const S = n => sd * 50 + 200 + n;
        const WG = [[90, 30], [-10, 30], [-200, 176], [-140, 182]];
        wing.setAttribute('d', inkLoop(WG, { seed: S(1), t, smooth: false })); wingR.setAttribute('d', inkPath(WG, { w: 6, seed: S(2), t, closed: true, smooth: false }));
        let nd = '', nr = '', pd = '';
        for (const [k, [nx, ny]] of [[0, [20, 70]], [1, [-100, 140]]]) {
          const p = ell(nx, ny, 58, 19, 12);
          nd += inkLoop(p, { seed: S(10 + k), t, amp: 0.8 }) + ' '; nr += inkPath(p, { w: 5, seed: S(12 + k), t, closed: true, amp: 0.8 }) + ' ';
          const a = t * 31 + k, px = nx + 62;
          pd += inkPath([[px + Math.cos(a) * 4, ny - Math.cos(a) * 44], [px - Math.cos(a) * 4, ny + Math.cos(a) * 44]], { w: 5, seed: S(14 + k), t, amp: 0.5 }) + ' ';
          pd += inkPath(ell(px, ny, 6, 44, 10), { w: 2.2, seed: S(16 + k), t, closed: true, amp: 0.5 }) + ' ';
        }
        nac.setAttribute('d', nd); nacR.setAttribute('d', nr); props.setAttribute('d', pd);
        // fire + smoke on the struck wing (outer engine)
        const fi = clamp01(o.fire ?? 0);
        const e2 = smooth(sp), fxo = 70 * e2, fyo = 110 * e2;
        if (fi > 0.01) {
          let fd = '', f2 = '', sm = '';
          for (let k = 0; k < 4; k++) {
            const bx = -150 + k * 26 + fxo, by = 150 + fyo - k * 10, h = (60 + 22 * Math.sin(t * 19 + k * 2)) * fi;
            fd += inkLoop([[bx - 18, by], [bx - 8, by - h * 0.6], [bx - 2 - 10 * Math.sin(t * 13 + k), by - h], [bx + 12, by - h * 0.5], [bx + 18, by]], { seed: S(20 + k), t, amp: 1 }) + ' ';
            f2 += inkLoop([[bx - 8, by], [bx - 2, by - h * 0.45], [bx + 8, by]], { seed: S(30 + k), t, amp: 0.6 }) + ' ';
          }
          for (let k = 0; k < 6; k++) {
            const age = (t * 0.9 + k / 6) % 1, sx = -170 + fxo - age * 420, sy = 120 + fyo - age * 60 + Math.sin(k * 2.1 + t) * 10, r = 20 + age * 46;
            sm += inkLoop(ell(sx, sy, r, r * 0.8, 10), { seed: S(40 + k), t, amp: 1.5 }) + ' ';
          }
          fire.setAttribute('d', fd); fire2.setAttribute('d', f2); smoke.setAttribute('d', sm);
        } else { fire.setAttribute('d', ''); fire2.setAttribute('d', ''); smoke.setAttribute('d', ''); }
        // debris after the break
        if (broken) {
          let dd = '', dr = '';
          for (let k = 0; k < 7; k++) {
            const a = -1.9 + k * 0.55, v = 160 + (k % 3) * 90, u = smooth(sp), x = -40 + Math.cos(a) * v * u, y = 0 + Math.sin(a) * v * u + 180 * u * u;
            const q = tf([[-14, -8], [14, -10], [10, 10], [-12, 8]], x, y, 1 + (k % 2) * 0.6, k * 40 + t * 200);
            dd += inkLoop(q, { seed: S(60 + k), t, amp: 0.6, smooth: false }) + ' '; dr += inkPath(q, { w: 3.5, seed: S(70 + k), t, closed: true, amp: 0.6, smooth: false }) + ' ';
          }
          debris.setAttribute('d', dd); debrisR.setAttribute('d', dr);
        } else { debris.setAttribute('d', ''); debrisR.setAttribute('d', ''); }
        const a = (o.rot ?? 0) * Math.PI / 180, lx = -130, ly = 120;
        return [o.x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, o.y + (lx * Math.sin(a) + ly * Math.cos(a)) * s];
      },
    };
  }
  SH.jk_storm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 733;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const back = clouds(cam, sd + 1, 4, W, H, true);
      const rain = inkEl(cam, INK.inkSoft);
      const PL = Object.assign({ x: 0.5, y: 0.42, s: 1 }, P.plane || {});
      const pl = plane(el(cam, 'g'), sd + 2);
      const front = clouds(cam, sd + 3, 3, W, H, true);
      const boltF = inkEl(cam, INK.gold), boltR = inkEl(cam), burst = inkEl(cam, INK.gold), burstR = inkEl(cam);
      const labels = (P.labels || []).map((L, i) => label(cam, L, W, H, sd + 30 + i));
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 6) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.05;
      const R = rng(sd + 4), drops = Array.from({ length: 34 }, () => ({ x: R(), y: R(), v: lerp(0.8, 1.3, R()) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const ba = atOr(cues, P.bolt, dur * 0.3), sa = atOr(cues, P.split, dur * 0.65);
          const shake = lt >= ba && lt < ba + 0.4 ? Math.sin(lt * 80) * 10 * (1 - (lt - ba) / 0.4) : (lt >= sa && lt < sa + 0.5 ? Math.sin(lt * 70) * 12 * (1 - (lt - sa) / 0.5) : 0);
          camOf(cam, W, H, lt, dur, zoom, hit, 0.5, 0.42, shake);
          back.update(t, 'left', 260, 0.12, 0.3);
          let rd = '';
          drops.forEach((d, i) => {
            const y = ((d.y * H * 0.9 + t * 1100 * d.v) % (H * 0.75)) + H * 0.1, x = ((d.x * W * 1.2 - (y - H * 0.1) * 0.35) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * 0.1;
            rd += inkPath([[x, y], [x - 14, y + 44]], { w: 3, seed: sd + 50 + i, t, amp: 0.5, taper: 0.4 }) + ' ';
          });
          rain.setAttribute('d', rd);
          const sp = lt >= sa ? clamp01((lt - sa) / 1.6) : 0, fall = lt >= sa ? (lt - sa) : 0;
          const fireA = lt >= ba ? clamp01((lt - ba) / 0.25) : 0;
          const px = PL.x * W + Math.sin(t * 0.9) * 10, py = PL.y * H + Math.sin(t * 1.4) * 12 + fall * fall * 40;
          const strike = pl.update(t, { x: px, y: py, s: PL.s * (1 + 0.03 * hit), rot: -3 + Math.sin(t * 1.1) * 2 + (lt >= ba ? Math.sin(lt * 9) * 2 * Math.exp(-(lt - ba)) : 0), split: sp, fire: fireA });
          front.update(t, 'left', 420, 0.62, 0.72);
          // lightning bolt from the clouds to the wing (visible ~0.5 s, then flickers out)
          const bv = lt >= ba && lt < ba + 0.55 ? (lt - ba < 0.3 || Math.floor(lt * 20) % 2 === 0 ? 1 : 0) : 0;
          if (bv) {
            const x0 = strike[0] + 160, y0 = H * 0.12, x1 = strike[0], y1 = strike[1];
            const n = 6, pts = [];
            for (let k = 0; k <= n; k++) { const u = k / n; pts.push([lerp(x0, x1, u) + (k % 2 ? 46 : -30) * (k > 0 && k < n ? 1 : 0), lerp(y0, y1, u)]); }
            const left = pts.map(([x, y]) => [x - 14, y]), right = pts.map(([x, y]) => [x + 14, y]).reverse();
            const shape = [...left, [x1, y1 + 20], ...right];
            boltF.setAttribute('d', inkLoop(shape, { seed: sd + 70, t, smooth: false, amp: 1 }));
            boltR.setAttribute('d', inkPath(shape, { w: 5, seed: sd + 71, t, closed: true, smooth: false, amp: 1 }));
            const st = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2, r = i % 2 ? 40 : 110; return [x1 + Math.cos(a) * r, y1 + Math.sin(a) * r]; });
            burst.setAttribute('d', inkLoop(st, { seed: sd + 72, t, smooth: false })); burstR.setAttribute('d', inkPath(st, { w: 4, seed: sd + 73, t, closed: true, smooth: false }));
          } else { boltF.setAttribute('d', ''); boltR.setAttribute('d', ''); burst.setAttribute('d', ''); burstR.setAttribute('d', ''); }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== jungle pieces
  function jungleBack(parent, sd, W, H, gy, top = 0.15) {
    const g = el(parent, 'g');
    const far = inkEl(g, INK.inkSoft), farLeaf = inkEl(g, INK.green, { 'fill-opacity': 0.3 });
    const midF = inkEl(g, INK.paperDark), midR = inkEl(g), leaves = inkEl(g, INK.green, { 'fill-opacity': 0.5 }), leavesR = inkEl(g);
    const vines = inkEl(g, INK.green), ground = inkEl(g, INK.paperDark), groundR = inkEl(g), litter = inkEl(g, INK.green, { 'fill-opacity': 0.45 }), roots = inkEl(g, INK.inkSoft), ferns = inkEl(g, INK.green);
    const R = rng(sd * 3 + 7);
    const farT = Array.from({ length: 9 }, (_, i) => ({ x: (i + R() * 0.6) / 9, w: lerp(10, 20, R()) }));
    const midT = [{ x: 0.08, w: 70 }, { x: 0.36, w: 46 }, { x: 0.7, w: 58 }, { x: 0.95, w: 80 }];
    const vin = Array.from({ length: 6 }, () => ({ x: R(), L: lerp(0.18, 0.36, R()), k: R() * 6 }));
    const fern = Array.from({ length: 9 }, () => ({ x: R(), s: lerp(0.7, 1.2, R()), k: R() * 6 }));
    return {
      // off: horizontal scroll in px (parallax applied per layer)
      update(t, off = 0) {
        const wrap = (x, k) => ((x * W - off * k) % (W + 200) + (W + 200)) % (W + 200) - 100;
        let fd = '', fl = '';
        farT.forEach((q, i) => {
          const x = wrap(q.x, 0.3);
          fd += inkPath([[x, gy], [x + 4, H * (top + 0.02)]], { w: q.w * 0.5, seed: sd + i, t, amp: 0.8 }) + ' ';
          fl += inkLoop(cloudPts(x, H * (top + 0.04) + (i % 3) * 30, 110, 60, i), { seed: sd + 20 + i, t, amp: 1 }) + ' ';
        });
        far.setAttribute('d', fd); farLeaf.setAttribute('d', fl);
        let md = '', mr = '', ld = '', lr = '';
        midT.forEach((q, i) => {
          const x = wrap(q.x, 0.7), w = q.w;
          const p = [[x - w / 2, gy + 10], [x - w / 2 - 14, gy - 10], [x - w * 0.42, H * (top - 0.02)], [x + w * 0.42, H * (top - 0.02)], [x + w / 2 + 14, gy - 10], [x + w / 2, gy + 10]];
          md += inkLoop(p, { seed: sd + 40 + i, t, amp: 1, smooth: false }) + ' ';
          mr += inkPath(p, { w: 5.5, seed: sd + 50 + i, t, closed: true, amp: 1, smooth: false }) + ' ';
          mr += inkPath([[x - w * 0.1, gy - 60], [x - w * 0.05, gy - 260]], { w: 3, seed: sd + 60 + i, t }) + ' ';
          for (let k = 0; k < 2; k++) {
            const lp = cloudPts(x + (k ? 90 : -80), H * (top + 0.02 + k * 0.05), 140, 72, i + k);
            ld += inkLoop(lp, { seed: sd + 70 + i * 2 + k, t, amp: 1.2 }) + ' ';
            lr += inkPath(lp, { w: 4.5, seed: sd + 90 + i * 2 + k, t, closed: true, amp: 1.2 }) + ' ';
          }
        });
        midF.setAttribute('d', md); midR.setAttribute('d', mr); leaves.setAttribute('d', ld); leavesR.setAttribute('d', lr);
        let vd = '';
        vin.forEach((v, i) => {
          const x = wrap(v.x, 0.85), L = v.L * H, sw = Math.sin(t * 1.4 + v.k) * 16, pts = [];
          for (let k = 0; k <= 6; k++) pts.push([x + Math.sin(k * 0.9 + v.k) * 10 + sw * (k / 6), H * (top + 0.04) + L * k / 6]);
          vd += inkPath(pts, { w: 5, seed: sd + 120 + i, t, amp: 1 }) + ' ';
          for (let k = 2; k <= 6; k += 2) vd += inkLoop(ell(pts[k][0] + 12, pts[k][1], 14, 7, 8), { seed: sd + 130 + i * 3 + k, t, amp: 0.6 }) + ' ';
        });
        vines.setAttribute('d', vd);
        const gp = [[-40, gy], [W * 0.3, gy - 8], [W * 0.7, gy + 6], [W + 40, gy - 4], [W + 40, H + 40], [-40, H + 40]];
        ground.setAttribute('d', inkLoop(gp, { seed: sd + 140, t, smooth: false }));
        groundR.setAttribute('d', inkPath(gp.slice(0, 4), { w: 6, seed: sd + 141, t }));
        let lt_ = '', rt_ = '';
        for (let k = 0; k < 14; k++) {
          const x = wrap((k * 0.137 + 0.05) % 1, 1), y = gy + 40 + (k % 4) * 70;
          lt_ += inkLoop(ell(x, y, 34, 14, 8).map(([a, b]) => [a, b + (a - x) * 0.3]), { seed: sd + 170 + k, t, amp: 0.8 }) + ' ';
          if (k % 2 === 0) rt_ += inkPath([[x - 90, y - 26], [x - 30, y - 10 + Math.sin(k) * 10], [x + 40, y + 6], [x + 110, y + 30]], { w: 6, seed: sd + 190 + k, t, amp: 1, taper: 0.3 }) + ' ';
        }
        litter.setAttribute('d', lt_); roots.setAttribute('d', rt_);
        let fn = '';
        fern.forEach((f, i) => {
          const x = wrap(f.x, 1), s = f.s, sw = Math.sin(t * 2 + f.k) * 4;
          for (let k = -2; k <= 2; k++) fn += inkPath([[x, gy + 8], [x + k * 22 * s + sw, gy - 40 * s], [x + k * 40 * s + sw, gy - 50 * s + Math.abs(k) * 14]], { w: 5, seed: sd + 150 + i * 5 + k, t, amp: 0.8, taper: 0.5 }) + ' ';
        });
        ferns.setAttribute('d', fn);
      },
    };
  }

  SH.jk_jungle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const jb = jungleBack(cam, sd + 1, W, H, gy, P.top ?? 0.16);
      const SE = P.seat === false ? null : Object.assign({ x: 0.3, s: 0.55, rot: -14 }, P.seat || {});
      const seat = SE ? seatRow(el(cam, 'g'), sd + 2, false) : null;
      const GI = Object.assign({ x: 0.56, y: P.ground ?? 0.6, scale: 0.8, pose: 'sit', face: 'left', emotion: 'worried' }, P.girl || {});
      const gl = P.girl === false ? null : girl(el(cam, 'g'), GI, sd + 3);
      const cast = (P.cast || []).map((C, i) => figure(el(cam, 'g'), Object.assign({ hat: false, scale: 0.85, y: P.ground ?? 0.6, face: 'right' }, C), sd + 50 + i * 7));
      const ST = P.stream ? Object.assign({ y: 0.035, h: 0.11 }, P.stream) : null;
      const sW = ST ? inkEl(cam, INK.blue, { 'fill-opacity': 0.35 }) : null, sR = ST ? inkEl(cam) : null, sRip = ST ? inkEl(cam, INK.blue) : null;
      const arrows = (P.arrows || []).map((A, i) => arrow(cam, A, W, H, sd + 20 + i));
      const labels = (P.labels || []).map((L, i) => label(cam, L, W, H, sd + 30 + i));
      const kas = P.kasif ? figure(el(root, 'g'), Object.assign({ x: 0.84, y: P.ground ?? 0.6, scale: 0.9, pose: 'point', face: 'left' }, P.kasif), sd + 6) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.07;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, W, H, lt, dur, zoom, hit, 0.45, 0.5);
          jb.update(t, 0);
          if (seat) seat.update(t, { x: SE.x * W, y: gy - 60 * SE.s, s: SE.s, rot: SE.rot + Math.sin(t * 0.8) * 0.6 });
          if (gl) gl.update(lt, t, cues, W, H);
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (ST) {
            const top = gy + ST.y * H, bot = top + ST.h * H, pts = [];
            for (let k = 0; k <= 8; k++) pts.push([-40 + (W + 80) * k / 8, top + Math.sin(k * 1.3 + t * 1.5) * 5]);
            for (let k = 8; k >= 0; k--) pts.push([-40 + (W + 80) * k / 8, bot + Math.sin(k * 1.1 + 1) * 8]);
            sW.setAttribute('d', inkLoop(pts, { seed: sd + 60, t, amp: 1, smooth: false }));
            sR.setAttribute('d', inkPath(pts.slice(0, 9), { w: 5, seed: sd + 61, t }) + ' ' + inkPath(pts.slice(9), { w: 5, seed: sd + 62, t }));
            let rd = '';
            for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 140) % (W + 200)) - 100, y = top + 22 + (i % 3) * (ST.h * H - 40) / 3; rd += inkPath([[x, y], [x + 30, y - 6], [x + 60, y]], { w: 4, seed: sd + 70 + i, t, amp: 0.6 }) + ' '; }
            sRip.setAttribute('d', rd);
          }
          arrows.forEach(a => a.update(lt, t, cues));
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== jk_river
  function hut(parent, sd) {
    const g = el(parent, 'g'), stilts = inkEl(g), wall = inkEl(g, INK.paperDark), wallR = inkEl(g), roof = inkEl(g, INK.stain, { 'fill-opacity': 0.8 }), roofR = inkEl(g);
    return {
      update(t, x, y, s) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
        const S = k => sd * 30 + k;
        stilts.setAttribute('d', [-120, -40, 40, 120].map((sx, k) => inkPath([[sx, 0], [sx + 2, -110]], { w: 8, seed: S(k), t })).join(' ') + ' ' +
          inkPath([[-150, -110], [150, -110]], { w: 8, seed: S(5), t }));
        const wp = [[-140, -110], [140, -110], [140, -280], [-140, -280]];
        wall.setAttribute('d', inkLoop(wp, { seed: S(6), t, smooth: false }));
        let wr = inkPath(wp, { w: 6, seed: S(7), t, closed: true, smooth: false });
        for (let k = 1; k < 7; k++) wr += ' ' + inkPath([[-140 + k * 40, -112], [-140 + k * 40, -278]], { w: 3, seed: S(10 + k), t });
        wr += ' ' + inkLoop([[-30, -112], [30, -112], [30, -220], [-30, -220]], { seed: S(20), t, smooth: false });
        wallR.setAttribute('d', wr);
        const rp = [[-200, -270], [0, -400], [200, -270]];
        roof.setAttribute('d', inkLoop(rp, { seed: S(21), t, smooth: false }));
        let rr = inkPath(rp, { w: 6, seed: S(22), t, closed: true, smooth: false });
        for (let k = 0; k < 6; k++) rr += ' ' + inkPath([[-150 + k * 60, -290], [-140 + k * 60 + 10, -270]], { w: 3, seed: S(30 + k), t });
        roofR.setAttribute('d', rr);
      },
    };
  }
  function canoe(parent, sd) {
    const f = inkEl(parent, INK.hat), r = inkEl(parent), pad = inkEl(parent);
    return {
      update(t, x, y, s) {
        const p = tf([[-170, -10], [170, -10], [140, 22], [-140, 22]], x, y + Math.sin(t * 2) * 4, s, Math.sin(t * 1.6) * 2);
        f.setAttribute('d', inkLoop(p, { seed: sd + 1, t })); r.setAttribute('d', inkPath(p, { w: 5.5, seed: sd + 2, t, closed: true }));
        pad.setAttribute('d', inkPath(tf([[60, -70], [120, 30]], x, y, s, 0), { w: 6, seed: sd + 3, t }) + ' ' + inkLoop(tf([[110, 16], [134, 30], [124, 52], [104, 36]], x, y, s, 0), { seed: sd + 4, t }));
      },
    };
  }
  SH.jk_river = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 911;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground ?? 0.58) * H;
      const jb = jungleBack(cam, sd + 1, W, H, gy, P.top ?? 0.16);
      const HU = P.hut ? Object.assign({ x: 0.8, s: 0.8 }, P.hut) : null, hu = HU ? hut(el(cam, 'g'), sd + 2) : null;
      const people = el(cam, 'g');
      const loggers = (P.loggers || []).map((L, i) => figure(el(people, 'g'), Object.assign({ hat: false, scale: 0.68, y: P.ground ?? 0.58, face: 'left', beard: 'black' }, L), sd + 40 + i * 7));
      const kas = P.kasif ? figure(el(people, 'g'), Object.assign({ x: 0.26, y: P.ground ?? 0.58, scale: 0.72, pose: 'walk', face: 'right' }, P.kasif), sd + 6) : null;
      const GI = Object.assign({ x: 0.56, y: P.ground ?? 0.58, scale: 0.72, pose: 'walk', face: 'right', emotion: 'worried' }, P.girl || {});
      const gl = girl(el(people, 'g'), GI, sd + 3);
      const water = inkEl(cam, INK.blue, { 'fill-opacity': 0.3 }), waterR = inkEl(cam), ripples = inkEl(cam, INK.blue);
      const bank = inkEl(cam, INK.paperDark), bankR = inkEl(cam), grass = inkEl(cam, INK.green);
      const CA = P.canoe ? Object.assign({ x: 0.62, s: 0.8 }, P.canoe) : null, ca = CA ? canoe(cam, sd + 5) : null;
      const DY = P.days ? Object.assign({ from: 1, to: 11, x: 0.5, y: 0.205, dur: null }, P.days) : null;
      const dayG = DY ? el(cam, 'g') : null;
      const card = DY ? inkEl(dayG, INK.paperLight) : null, cardR = DY ? inkEl(dayG) : null;
      const dayT = DY ? el(dayG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.ink }) : null;
      const dayN = DY ? el(dayT, 'tspan', { fill: INK.red }) : null;
      const tally = DY ? inkEl(dayG) : null;
      if (DY) { dayT.insertBefore(document.createTextNode('DAY '), dayN); }
      const labels = (P.labels || []).map((L, i) => label(cam, L, W, H, sd + 30 + i));
      const zoom = (P.cam && P.cam.zoom) || 1.05;
      const widen = P.widen || [0.25, 1];
      const R = rng(sd + 8), rip = Array.from({ length: 12 }, () => ({ x: R(), y: R(), L: lerp(40, 90, R()) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, W, H, lt, dur, zoom, hit, 0.5, 0.45);
          const speed = P.scroll === false ? 0 : 150, off = lt * speed;
          jb.update(t, off);
          if (hu) hu.update(t, HU.x * W, gy + 6, HU.s);
          // walkers: feet planted relative to the scrolling ground
          const gph = off / (GI.scale) / KASIF.gait('walk');
          gl.update(lt, t, cues, W, H, P.scroll === false ? {} : { ph: gph });
          if (kas) kas.update(lt, t, cues, W, H, P.scroll === false ? {} : { ph: off / (P.kasif.scale ?? 0.72) / KASIF.gait('walk') + 0.3 });
          loggers.forEach(l => l.update(lt, t, cues, W, H));
          // stream in front of the bank, widening downstream over the shot
          const u = clamp01(lt / Math.max(1, dur)), wd = lerp(widen[0], widen[1], u) * 230 + 20;
          const top = gy + 18, bot = top + wd, pts = [];
          for (let k = 0; k <= 8; k++) pts.push([-40 + (W + 80) * k / 8, top + Math.sin(k * 1.3 + t * 1.5) * 4]);
          for (let k = 8; k >= 0; k--) pts.push([-40 + (W + 80) * k / 8, bot + Math.sin(k * 1.1 + 1) * 8]);
          water.setAttribute('d', inkLoop(pts, { seed: sd + 60, t, amp: 1, smooth: false }));
          waterR.setAttribute('d', inkPath(pts.slice(0, 9), { w: 5, seed: sd + 61, t, amp: 1 }) + ' ' + inkPath(pts.slice(9), { w: 4, seed: sd + 62, t, amp: 1 }));
          let rd = '';
          rip.forEach((q, i) => {
            const x = ((q.x * (W + 200) + t * (110 - speed * 0.2)) % (W + 200)) - 100, y = top + 14 + q.y * (wd - 24);
            if (wd > 30) rd += inkPath([[x, y], [x + q.L * 0.5, y - 5], [x + q.L, y]], { w: 3.5, seed: sd + 70 + i, t, amp: 0.6 }) + ' ';
          });
          ripples.setAttribute('d', rd);
          const bp = [[-40, bot + 6], [W * 0.35, bot - 4], [W * 0.7, bot + 8], [W + 40, bot], [W + 40, H + 40], [-40, H + 40]];
          bank.setAttribute('d', inkLoop(bp, { seed: sd + 63, t, smooth: false }));
          bankR.setAttribute('d', inkPath(bp.slice(0, 4), { w: 5, seed: sd + 64, t }));
          let gd = '';
          for (let k = 0; k < 12; k++) {
            const x = ((k * 97 - off) % (W + 120) + W + 120) % (W + 120) - 60, y = bot + 14 + (k % 3) * 60;
            for (let j = -1; j <= 1; j++) gd += inkPath([[x, y + 20], [x + j * 16 + Math.sin(t * 2 + k) * 3, y - 20]], { w: 4, seed: sd + 200 + k * 3 + j, t, amp: 0.6, taper: 0.5 }) + ' ';
          }
          grass.setAttribute('d', gd);
          if (ca) ca.update(t, CA.x * W, top + 26, CA.s);
          if (DY) {
            const a = atOr(cues, DY.at, 0.2), D = DY.dur ?? Math.max(0.8, dur - a - 0.5), p = lt >= a ? clamp01((lt - a) / D) : 0;
            const n = Math.floor(lerp(DY.from, DY.to + 0.999, p));
            dayN.textContent = String(n);
            const pk = Math.exp(-((lt - a) % (D / Math.max(1, DY.to - DY.from))) * 9);
            dayG.setAttribute('transform', `translate(${f1(DY.x * W)} ${f1(DY.y * H)}) scale(${(1 + 0.05 * pk).toFixed(3)})`);
            let td = '';
            for (let k = 0; k < n; k++) {
              const grp = Math.floor(k / 5), j = k % 5, x0 = -250 + grp * 190 + j * 30;
              td += j === 4 ? inkPath([[x0 - 132, 92], [x0 + 6, 52]], { w: 6, seed: sd + 90 + k, t }) + ' ' : inkPath([[x0, 40], [x0 + 2, 104]], { w: 6, seed: sd + 90 + k, t }) + ' ';
            }
            tally.setAttribute('d', td);
            const cw = 300, cp = [[-cw, -120], [cw, -126], [cw + 6, 128], [-cw - 4, 124]];
            card.setAttribute('d', inkLoop(cp, { seed: sd + 95, t, smooth: false, amp: 1 }));
            cardR.setAttribute('d', inkPath(cp, { w: 5, seed: sd + 96, t, closed: true, smooth: false, amp: 1 }));
          }
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
  SH.jk_rescue = { kind: '2d', build: ctx => SH.jk_river.build(Object.assign({}, ctx, { P: Object.assign({ scroll: false, widen: [1, 1] }, ctx.P) })) };
})();

// SHOTS.jk_tally — "1 of N": a grid of N tiny ink people pops in; on cue "only" all but one fade to paper, the
//   survivor grows, turns red and gets a red ink ring. Two captions swap: before {text: "92 ON BOARD"}, after
//   {text: "1 SURVIVED", box}. P: {n: 92, cols: 11, survivor: 60, at: cue, before: {text, size}, after: {text, size},
//   kasif: K}   cues: hit, at
// SHOTS.jk_end — closing card: big Fraunces lines spring in word by word on cues, one highlight word in a red box,
//   a trail of footprints draws itself across the page, the narrator walks in along it and points up.
//   P: {lines: [{words: ["THE", "FALL:", "LUCK."], at: [cue, ...], y: 0.24}], highlight: "LESSON.", steps: {y: 0.5},
//   kasif: K (walk_in supported)}
(() => {
  const SH = window.SHOTS;
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 12) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  function fig(parent, K, sd) {         // same narrator rig helper as above (kept local to this IIFE)
    const g = el(parent, 'g'), rig = KASIF.create(g, { scale: K.scale ?? 0.9, seed: sd });
    return {
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const face = (K.face === 'right' || K.face === 1) ? 1 : -1;
        let x = (K.x ?? 0.85) * W, pose = s.pose || 'idle', ph;
        if (K.walk_in) {
          const x0 = x - face * W * 0.45, u = clamp01(lt / K.walk_in);
          ph = Math.abs(x0 + (x - x0) * (1 - (1 - u) * (1 - u)) - x0) / (K.scale ?? 0.9) / KASIF.gait('walk');
          x = lerp(x0, x, 1 - (1 - u) * (1 - u)); if (u < 1) pose = 'walk';
        }
        const o = { x, y: (K.y ?? 0.6) * H, face, since, dir: typeof (s.dir ?? K.dir) === 'number' ? (s.dir ?? K.dir) : 40, emotion: s.emotion || K.emotion || null, ph };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: o.dir }; o.mix = since / 0.32; }
        rig.update(t, pose, o);
      },
    };
  }
  function caption(parent, C, sd) {
    const g = el(parent, 'g'), box = inkEl(g, INK.red), boxR = inkEl(g), size = C.size || 130;
    const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: C.box ? INK.paperLight : (C.color === 'red' ? INK.red : INK.ink) });
    tx.textContent = C.text; tx.setAttribute('y', f1(size * 0.34));
    let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { } if (!w) w = C.text.length * size * 0.6;
    return {
      update(t, x, y, p, alpha) {
        g.setAttribute('opacity', alpha.toFixed(3));
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(-3 + (1 - p) * -8)}) scale(${lerp(0.5, 1, p).toFixed(3)})`);
        if (C.box) {
          const bw = w + 60, bh = size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
          box.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, smooth: false })); boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        }
      },
    };
  }

  SH.jk_tally = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 977;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const n = P.n ?? 92, cols = P.cols ?? 11, cell = P.cell ?? 66, surv = P.survivor ?? 60;
      const rows = Math.ceil(n / cols), x0 = (P.gx ?? 0.43) * W - (cols - 1) * cell / 2, y0 = (P.gy ?? 0.27) * H;
      const live = inkEl(cam, INK.ink), dim = inkEl(cam, INK.paperDark), heads = inkEl(cam, INK.paperLight), one = inkEl(cam, INK.red), oneHead = inkEl(cam, INK.paperLight), ring = inkEl(cam, INK.red);
      const before = caption(cam, Object.assign({ text: '92 ON BOARD', size: 110 }, P.before || {}), sd + 10);
      const after = caption(cam, Object.assign({ text: '1 SURVIVED', size: 120, box: true }, P.after || {}), sd + 20);
      const kas = P.kasif ? fig(el(root, 'g'), Object.assign({ x: 0.87, y: 0.6, scale: 0.85, pose: 'talk', face: 'left' }, P.kasif), sd + 6) : null;
      const person = (x, y, s, k, t) => {
        const hd = ell(x, y - 26 * s, 11 * s, 11 * s, 8);
        return { head: inkLoop(hd, { seed: k, t, amp: 0.5 }), line: inkPath(hd, { w: 3.5 * s, seed: k + 1, t, closed: true, amp: 0.5 }) + ' ' +
          inkPath([[x, y - 15 * s], [x, y + 10 * s]], { w: 4 * s, seed: k + 2, t, amp: 0.5 }) + ' ' +
          inkPath([[x - 12 * s, y - 2 * s], [x, y - 10 * s], [x + 12 * s, y - 2 * s]], { w: 3.5 * s, seed: k + 3, t, amp: 0.5 }) + ' ' +
          inkPath([[x - 9 * s, y + 24 * s], [x, y + 10 * s], [x + 9 * s, y + 24 * s]], { w: 3.5 * s, seed: k + 4, t, amp: 0.5 }) };
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, a = atOr(cues, P.at || 'only', dur * 0.5), hit = punch(lt, atOr(cues, 'hit', a), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          cam.setAttribute('transform', `translate(${f1(W / 2)} ${f1(H * 0.4)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.4)})`);
          const fade = lt >= a ? clamp01((lt - a) / 0.5) : 0, grow = lt >= a ? spring(lt, a, 0.7) : 0;
          let L = [], D = [], Hd = [];
          let sx = 0, sy = 0;
          for (let i = 0; i < n; i++) {
            const c = i % cols, r = Math.floor(i / cols), x = x0 + c * cell, y = y0 + r * cell;
            const pop = lt >= i * 0.012 ? spring(lt, i * 0.012, 0.4) : 0;
            if (pop <= 0.01) continue;
            if (i === surv) { sx = x; sy = y; continue; }
            const pp = person(x, y + Math.sin(t * 2 + i) * 1.5, pop * 0.9, sd + i * 7, t);
            (fade > 0.5 ? D : L).push(pp.line); Hd.push(pp.head);
          }
          live.setAttribute('d', L.join(' ')); dim.setAttribute('d', D.join(' ')); heads.setAttribute('d', Hd.join(' '));
          if (sx) {
            const s = 0.9 + grow * 1.1, pp = person(sx, sy - grow * 6, s, sd + 900, t);
            one.setAttribute('fill', fade > 0.3 ? INK.red : INK.ink);
            one.setAttribute('d', pp.line); oneHead.setAttribute('d', pp.head);
            const rp = lt >= a ? clamp01((lt - a - 0.15) / 0.5) : 0, pts = [];
            for (let k = 0; k <= 18 * rp; k++) { const an = -1.2 + k / 18 * Math.PI * 2.1; pts.push([sx + Math.cos(an) * 64, sy - 10 + Math.sin(an) * 60]); }
            ring.setAttribute('d', pts.length > 2 ? inkPath(pts, { w: 7, seed: sd + 950, t, amp: 1.2 }) : '');
          }
          const cy = (P.cy ?? 0.205) * H;
          before.update(t, W * 0.5, cy, lt >= 0.05 ? spring(lt, 0.05, 0.5) : 0, 1 - fade);
          after.update(t, W * 0.5, cy, grow, fade);
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  SH.jk_end = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 991;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const hl = (P.highlight || '').toUpperCase();
      const lines = (P.lines || []).map((L, li) => {
        const size = L.size || 150, g = el(cam, 'g');
        const words = L.words.map((w, wi) => {
          const wg = el(g, 'g'), isH = w.toUpperCase() === hl;
          const box = isH ? inkEl(wg, INK.red) : null, boxR = isH ? inkEl(wg) : null;
          const tx = el(wg, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: isH ? INK.paperLight : INK.ink });
          tx.textContent = w;
          let ww = 0; try { ww = tx.getComputedTextLength(); } catch (e) { } if (!ww) ww = w.length * size * 0.6;
          return { wg, box, boxR, tx, ww: ww + (isH ? 40 : 0), at: (L.at || [])[wi] };
        });
        const gap = size * 0.28, total = words.reduce((s, w) => s + w.ww, 0) + gap * (words.length - 1), k = Math.min(1, (W - 220) / total);
        let x = W / 2 - total * k / 2;
        words.forEach(w => { w.cx = x + w.ww * k / 2; x += (w.ww + gap) * k; });
        return { g, words, k, size, y: (L.y ?? 0.25 + li * 0.11) * H, li };
      });
      const steps = el(cam, 'g'), stepF = inkEl(steps, INK.ink);
      const ST = Object.assign({ y: 0.47 }, P.steps || {});
      const kas = P.kasif ? fig(el(root, 'g'), Object.assign({ x: 0.72, y: 0.6, scale: 0.95, pose: 'point', face: 'right' }, P.kasif), sd + 6) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          cam.setAttribute('transform', `translate(${f1(W / 2)} ${f1(H * 0.38)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.38)})`);
          lines.forEach(L => {
            L.words.forEach((w, wi) => {
              const a = atOr(cues, w.at, 0.1 + L.li * 0.6 + wi * 0.15), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5);
              const b = boil(sd + L.li * 10 + wi, t, 1.2), bob = Math.sin(t * 1.6 + wi + L.li) * 3;
              w.wg.setAttribute('opacity', clamp01(p * 3).toFixed(3));
              w.wg.setAttribute('transform', `translate(${f1(w.cx + b[0])} ${f1(L.y + b[1] + bob)}) rotate(${f1((L.li ? -2 : 1) + (1 - p) * -10)}) scale(${(L.k * lerp(0.4, 1, p) * (1 + 0.1 * pk)).toFixed(3)})`);
              w.tx.setAttribute('y', f1(L.size * 0.34));
              if (w.box) {
                const bw = w.ww + 20, bh = L.size * 1.2, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 5], [bw / 2 + 4, bh / 2], [-bw / 2 - 3, bh / 2 + 4]];
                w.box.setAttribute('d', inkLoop(pts, { seed: sd + 50, t, smooth: false })); w.boxR.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 51, t, closed: true, smooth: false }));
              }
            });
          });
          // footprints: a walking trail that draws itself left -> right, alternating feet
          const n = 12, u = clamp01(lt / Math.max(1, dur * 0.8));
          let fd = '';
          for (let i = 0; i < Math.floor(n * u); i++) {
            const x = W * 0.06 + i * W * 0.075, y = ST.y * H + (i % 2 ? 26 : -26) + Math.sin(i * 0.8) * 30;
            fd += inkLoop(ell(x, y, 34, 17, 10), { seed: sd + 100 + i, t, amp: 0.8 }) + ' ' + inkLoop(ell(x + 40, y, 12, 12, 8), { seed: sd + 130 + i, t, amp: 0.6 }) + ' ';
          }
          stepF.setAttribute('d', fd);
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();

// SHOTS.jk_arm — close-up of an injured, bandaged arm (no gore) in the jungle: big leaves frame the shot, the arm
//   sways slowly, large ink flies circle the bandage (more join on cue "hit"), buzz lines trail them.
//   P: {flies: [2, 5] (before / after hit), kasif: K (narrator at the side) | false}   cues: hit
(() => {
  const SH = window.SHOTS;
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const ell = (cx, cy, rx, ry, n = 12, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry, c = Math.cos(rot), s = Math.sin(rot); return [cx + x * c - y * s, cy + x * s + y * c]; });
  const leafPts = (x, y, L, w, ang) => { const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [x + u * c - v * s, y + u * s + v * c]; return [P(0, 0), P(L * 0.3, -w), P(L * 0.75, -w * 0.7), P(L, 0), P(L * 0.75, w * 0.7), P(L * 0.3, w)]; };
  SH.jk_arm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 997;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const leavesB = inkEl(cam, INK.green, { 'fill-opacity': 0.4 }), leavesBR = inkEl(cam), veins = inkEl(cam, INK.inkSoft);
      const sleeve = inkEl(cam, INK.blue, { 'fill-opacity': 0.7 }), sleeveR = inkEl(cam);
      const arm = inkEl(cam, INK.paperLight), armR = inkEl(cam), hand = inkEl(cam, INK.paperLight), handR = inkEl(cam);
      const band = inkEl(cam, INK.paperLight), bandR = inkEl(cam), bandS = inkEl(cam, INK.inkSoft);
      const buzz = inkEl(cam, INK.inkSoft), wings = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.85 }), wingsR = inkEl(cam), body = inkEl(cam), legs = inkEl(cam);
      const leavesF = inkEl(cam, INK.green, { 'fill-opacity': 0.55 }), leavesFR = inkEl(cam);
      const K = P.kasif ? Object.assign({ x: 0.84, y: 0.6, scale: 0.8, pose: 'think', face: -1, emotion: 'worried' }, P.kasif) : null;
      const rig = K ? KASIF.create(el(root, 'g'), { scale: K.scale, seed: sd + 6 }) : null;
      const FL = P.flies || [2, 5];
      const R = rng(sd + 3), back = Array.from({ length: 7 }, () => ({ x: R(), y: lerp(0.12, 0.62, R()), L: lerp(180, 300, R()), a: R() * 6.28 }));
      const front = [[-30, 0.66, 340, -0.4], [W + 30, 0.7, 320, 3.6], [W * 0.45, 0.78, 300, -1.2], [-20, 0.2, 260, 0.5], [W + 20, 0.24, 280, 2.7]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, a = atOr(cues, 'hit', dur * 0.5), hit = punch(lt, a, 0.6);
          const z = lerp(1, 1.08, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W * 0.42)} ${f1(H * 0.32)}) scale(${z.toFixed(4)}) translate(${f1(-W * 0.42)} ${f1(-H * 0.32)})`);
          // background leaves
          let lb = '', lr = '', vn = '';
          back.forEach((q, i) => {
            const ang = q.a + Math.sin(t * 1.2 + i) * 0.05, p = leafPts(q.x * W, q.y * H, q.L, q.L * 0.28, ang);
            lb += inkLoop(p, { seed: sd + 10 + i, t, amp: 1 }) + ' '; lr += inkPath(p, { w: 4, seed: sd + 20 + i, t, closed: true, amp: 1 }) + ' ';
            vn += inkPath([p[0], p[3]], { w: 3, seed: sd + 30 + i, t, amp: 0.8 }) + ' ';
          });
          leavesB.setAttribute('d', lb); leavesBR.setAttribute('d', lr); veins.setAttribute('d', vn);
          // the arm: shoulder off-frame left, elbow, wrist, fist; slow sway (she is walking)
          const sw = Math.sin(t * 1.5) * 10, sh = [-40, H * 0.36 + sw], el_ = [W * 0.5, H * 0.41 + sw * 0.6], wr = [W * 0.8, H * 0.33 + sw * 0.2 + Math.sin(t * 1.5 + 1) * 8];
          const nrm = (A, B) => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy); return [-dy / L, dx / L]; };
          const n1 = nrm(sh, el_), n2 = nrm(el_, wr), w1 = 104, w2 = 84, w3 = 62;
          const top = [[sh[0] + n1[0] * w1, sh[1] + n1[1] * w1], [el_[0] + (n1[0] + n2[0]) / 2 * w2, el_[1] + (n1[1] + n2[1]) / 2 * w2], [wr[0] + n2[0] * w3, wr[1] + n2[1] * w3]];
          const bot = [[wr[0] - n2[0] * w3, wr[1] - n2[1] * w3], [el_[0] - (n1[0] + n2[0]) / 2 * w2, el_[1] - (n1[1] + n2[1]) / 2 * w2], [sh[0] - n1[0] * w1, sh[1] - n1[1] * w1]];
          const ap = [...top, ...bot];
          arm.setAttribute('d', inkLoop(ap, { seed: sd + 40, t, amp: 1 }));
          armR.setAttribute('d', inkPath(top, { w: 7, seed: sd + 41, t }) + ' ' + inkPath(bot, { w: 7, seed: sd + 42, t }));
          const hp = ell(wr[0] + 66, wr[1] - 12, 74, 64, 14, -0.3);
          hand.setAttribute('d', inkLoop(hp, { seed: sd + 43, t })); 
          handR.setAttribute('d', inkPath(hp, { w: 7, seed: sd + 44, t, closed: true }) + ' ' + [0, 1, 2].map(k => inkPath([[wr[0] + 72 + k * 4, wr[1] - 44 + k * 26], [wr[0] + 104, wr[1] - 36 + k * 26]], { w: 4, seed: sd + 45 + k, t })).join(' '));
          // sleeve (dress) at the shoulder
          const sp = [[-80, sh[1] - w1 - 14], [W * 0.13, sh[1] - w1 + 8 + (el_[1] - sh[1]) * 0.25], [W * 0.15, sh[1] + w1 + 14 + (el_[1] - sh[1]) * 0.25], [-80, sh[1] + w1 + 18]];
          sleeve.setAttribute('d', inkLoop(sp, { seed: sd + 50, t, smooth: false })); sleeveR.setAttribute('d', inkPath(sp, { w: 6, seed: sd + 51, t, closed: true, smooth: false }));
          // bandage wrapped around the upper arm, just above the elbow
          const bx0 = 0.4, bx1 = 0.75, Lp = (u, s) => [lerp(sh[0], el_[0], u) + n1[0] * s, lerp(sh[1], el_[1], u) + n1[1] * s];
          const bw = lerp(w1, w2, 0.7) + 10, bp = [Lp(bx0, bw), Lp(bx1, bw), Lp(bx1, -bw), Lp(bx0, -bw)];
          band.setAttribute('d', inkLoop(bp, { seed: sd + 52, t, smooth: false, amp: 1 }));
          let bs = inkPath([...bp, bp[0]], { w: 6, seed: sd + 53, t, smooth: false });
          for (let k = 1; k < 5; k++) { const u = lerp(bx0, bx1, k / 5); bs += ' ' + inkPath([Lp(u - 0.03, bw), Lp(u + 0.03, -bw)], { w: 3.5, seed: sd + 54 + k, t }); }
          bandR.setAttribute('d', bs);
          const knot = Lp(bx1 - 0.02, -bw - 6);
          bandS.setAttribute('d', inkLoop(ell(knot[0], knot[1] + 14, 18, 26, 10, 0.4), { seed: sd + 60, t }) + ' ' + inkLoop(ell(knot[0] + 26, knot[1] + 22, 14, 24, 10, -0.5), { seed: sd + 61, t }));
          // flies: big ink flies on looping paths around the bandage
          const c = Lp((bx0 + bx1) / 2, 0), nF = lt >= a ? FL[1] : FL[0];
          let bd = '', wd = '', wrr = '', lg = '', bz = '';
          for (let k = 0; k < nF; k++) {
            const born = k < FL[0] ? 0 : a + (k - FL[0]) * 0.12, age = lt - born;
            if (age < 0) continue;
            const sp_ = 2.2 + k * 0.35, ph = t * sp_ + k * 1.9, rx = 150 + k * 28, ry = 95 + (k % 3) * 30;
            const comeIn = clamp01(age / 0.5), fx = c[0] + Math.cos(ph) * rx * lerp(3, 1, comeIn), fy = c[1] - 40 + Math.sin(ph * 2) * ry * 0.6 + Math.sin(ph) * 20;
            const dirx = -Math.sin(ph), ang = Math.atan2(Math.cos(ph * 2) * ry * 1.2, -Math.sin(ph) * rx), s = 1 + (k % 2) * 0.2;
            const B = ell(fx, fy, 30 * s, 17 * s, 12, ang), Hd = ell(fx + Math.cos(ang) * 32 * s, fy + Math.sin(ang) * 32 * s, 13 * s, 13 * s, 8);
            bd += inkLoop(B, { seed: sd + 70 + k, t, amp: 0.6 }) + ' ' + inkLoop(Hd, { seed: sd + 80 + k, t, amp: 0.6 }) + ' ';
            const flap = Math.sin(t * 38 + k) * 0.5;
            for (const side of [-1, 1]) {
              const wa = ang + side * (1.9 + flap), wp = ell(fx + Math.cos(wa) * 26 * s, fy + Math.sin(wa) * 26 * s - 6, 32 * s, 15 * s, 10, wa);
              wd += inkLoop(wp, { seed: sd + 90 + k * 2 + (side > 0), t, amp: 0.5 }) + ' ';
              wrr += inkPath(wp, { w: 3, seed: sd + 110 + k * 2 + (side > 0), t, closed: true, amp: 0.5 }) + ' ';
            }
            for (let j = -1; j <= 1; j++) lg += inkPath([[fx + j * 12 * s, fy + 10 * s], [fx + j * 18 * s, fy + 28 * s]], { w: 3, seed: sd + 130 + k * 3 + j, t, amp: 0.4 }) + ' ';
            for (let j = 1; j <= 2; j++) bz += inkPath(Array.from({ length: 5 }, (_, i) => { const q = ph - (j * 0.25 + i * 0.05) * (dirx > 0 ? 1 : 1); return [c[0] + Math.cos(q) * rx, c[1] - 40 + Math.sin(q * 2) * ry * 0.6 + Math.sin(q) * 20]; }), { w: 3, seed: sd + 150 + k * 2 + j, t, amp: 0.6, taper: 0.6 }) + ' ';
          }
          body.setAttribute('d', bd); wings.setAttribute('d', wd); wingsR.setAttribute('d', wrr); legs.setAttribute('d', lg); buzz.setAttribute('d', bz);
          // foreground leaves framing the shot
          let fd = '', fr = '';
          front.forEach(([x, y, L, ang0], i) => {
            const p = leafPts(x, y * H, L, L * 0.3, ang0 + Math.sin(t * 1.1 + i * 2) * 0.06);
            fd += inkLoop(p, { seed: sd + 170 + i, t, amp: 1 }) + ' '; fr += inkPath(p, { w: 5, seed: sd + 180 + i, t, closed: true, amp: 1 }) + ' ' + inkPath([p[0], p[3]], { w: 3.5, seed: sd + 190 + i, t }) + ' ';
          });
          leavesF.setAttribute('d', fd); leavesFR.setAttribute('d', fr);
          if (rig) {
            const after = lt >= a, since = after ? lt - a : lt;
            const o = { x: K.x * W, y: K.y * H, face: K.face, since, emotion: after ? 'surprised' : K.emotion, dir: 30 };
            if (after && since < 0.32) { o.prev = { pose: K.pose, since: 1 }; o.mix = since / 0.32; }
            rig.update(t, after ? (K.then || 'shock') : K.pose, o);
          }
        },
      };
    },
  };
})();
