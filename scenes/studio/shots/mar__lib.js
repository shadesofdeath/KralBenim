// mar__lib: shared drawings for the mar_* shots (Stickstory "the 1904 St. Louis Olympic marathon", 2026-11-05).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every line boils
// at 8 Hz via _ink.js, everything a pure function of (seed, t). Parametric: any early-1900s road race / fair story.
// window.MAR = {
//   atOr, f1, ell,
//   person(parent, K, seed) -> {update(lt, t, cues, W, H, env) -> {x, y, head, hand, hand2, face}}
//       stick figure on the KASIF rig (narrator when K.hat true) with period overlays. K = {x, y (ground, 0..1 H), scale: 1,
//       face: "right"|"left", pose: "run"|"walk"|"stagger"|"idle"|"point"|"wave"|"think"|"shock"|"shrug"|"talk"|"hold"|"lie"|"sit",
//       dir, emotion, text (hold sign), bib: "7" (paper race number on the chest), bowler: true (black bowler hat),
//       dress: true (long skirt + wide hat with a flower: Alice Roosevelt), street: true (shirt + trousers cut at the knee),
//       wreath: cue (a green laurel wreath drops onto the head), dizzy: cue (gold stars circle the head),
//       cough: cue (doubles over, hand at the mouth), zzz: cue (sleep "z"s), pace: 1.7 (run/walk cycles per s when the
//       road does not scroll), to, at, dur (moves x to "to"), seq: [{at, pose, emotion, dir, face, text}],
//       ride: {car: 0, from: cue|null, until: cue|null, seat: "front"|"back", pose: "sit"|"wave"} (seated in a car),
//       exit_speed: 380 (px/s after leaving the car)}
//   car(back, front, seed) -> {update(t, o) -> {seat(front|back) -> [x, y], hood: [x, y]}}   1904 open touring car, side
//       view: two tall spoked wheels, red hood + tonneau, black seats, steering wheel, brass lamp. o: {x, y (ground),
//       s: 1 (~520 px long), face: 1|-1, roll (wheel turn, rad), steam: 0..1 (broken down: puffs from the hood), shake}
//   dust(parent, seed) -> {update(t, o)}  rolling dust cloud: o: {x, y, dir: -1 (trails left), len: 520, h: 220, p: 0..1}
//   dustField(parent, seed) -> {update(t, W, H, p, y0)}  dust filling the frame (choking)
//   roadside(parent, seed) -> {update(t, W, G, off, o)} scrolling dirt road + fence posts + telegraph poles (off = px)
//   sun(parent, seed) -> {update(t, x, y, r)}, heat(parent, seed) -> {update(t, W, y, p)} shimmer lines
//   well(parent, seed) -> {update(t, x, G, s, bucket 0..1)}, tower(parent, seed) -> {update(t, x, G, s)} water tower
//   tree(parent, seed) -> {update(t, x, G, s, rotten 0..1)}  apple tree; rotten turns the apples brown, flies circle
//   dog(parent, seed) -> {update(t, o)}  o: {x, y, s, face, ph}
//   stands(parent, seed) -> {update(t, o)}  wooden grandstand full of spectators: o: {x0, x1, top, base, cheer 0..1}
//   tape(parent, seed) -> {update(t, x, G, h, br 0..1)} finish posts + red tape that breaks
//   puff(parent, seed) -> {update(t, x, y, p)} pistol smoke
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const ell = (cx, cy, rx, ry, n = 14) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  // ------------------------------------------------------------------ person (KASIF rig + overlays)
  function person(parent, K, sd) {
    if (!K) return null;
    const wrap = el(parent, 'g');
    const isK = K.hat === true;
    const shirtF = inkEl(wrap, INK.paperLight), shirtR = inkEl(wrap);   // shirt behind the rig: arms stay in front
    const rigG = el(wrap, 'g');
    const rig = KASIF.create(rigG, { scale: K.scale ?? 1, hat: isK, accessory: null, seed: sd });
    const shortsF = inkEl(wrap, INK.blue), shortsR = inkEl(wrap);
    const skirtF = inkEl(wrap, INK.paperLight), skirtR = inkEl(wrap), sash = inkEl(wrap, INK.blue);
    const bibF = inkEl(wrap, INK.paperLight), bibR = inkEl(wrap);
    const bibT = el(wrap, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink });
    bibT.textContent = K.bib || '';
    const hatF = inkEl(wrap, INK.ink), hatR = inkEl(wrap), hatB = inkEl(wrap, INK.red), flower = inkEl(wrap, INK.red);
    const btF = inkEl(wrap, INK.blue), btR = inkEl(wrap), btL = inkEl(wrap, INK.paperLight), btS = inkEl(wrap);
    const wrF = inkEl(wrap, INK.green), wrR = inkEl(wrap), stars = inkEl(wrap, INK.gold), zz = el(wrap, 'g');
    const zT = [0, 1, 2].map(i => { const tx = el(zz, 'text', { 'font-family': INK_FONT, 'font-size': 64 - i * 8, fill: INK.inkSoft, 'text-anchor': 'middle' }); tx.textContent = 'z'; return tx; });
    const sc = K.scale ?? 1;
    return {
      K,
      update(lt, t, cues, W, H, env = {}) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion, text: K.text }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let face = faceOf(s.face ?? K.face, 1);
        let x = (K.x ?? 0.5) * W, y = (K.y ?? 0.82) * H, pose = s.pose || 'idle', rotA = 0;
        if (K.to != null) {
          const a = atOr(cues, K.at, 0), d = K.dur ?? 2, u = clamp01((lt - a) / d); x = lerp((K.x ?? 0.5) * W, K.to * W, K.linear ? u : EASE_IO(u));
          if (lt >= a && u < 1 && (pose === 'idle' || pose === 'point' || pose === 'talk')) pose = K.move_pose || 'walk';
        }
        const cough = K.cough != null ? atOr(cues, K.cough, null) : null, cu = K.cough_until != null ? atOr(cues, K.cough_until, 1e9) : 1e9;
        const coughing = cough != null && lt >= cough && lt < cu;
        // riding a car
        let riding = false, rideP = 0;
        if (K.ride && env.cars) {
          const R = K.ride, car = env.cars[R.car || 0];
          if (car) {
            const a = R.from == null ? -1 : atOr(cues, R.from, -1), b = R.until == null ? 1e9 : atOr(cues, R.until, 1e9);
            const seat = car.seat(R.seat || 'back');
            if (lt >= a && lt < b) {
              riding = true; rideP = a < 0 ? 1 : prog(lt, a, 0.45);
              const rp = R.pose || 'sit';
              const hipOff = rp === 'sit' ? 100 : 184;
              const sx = seat[0], sy = seat[1] + hipOff * sc;
              x = lerp(x, sx, rideP); y = lerp(y, sy, rideP) - Math.sin(rideP * Math.PI) * 60;
              pose = rideP > 0.5 ? (lt > (atOr(cues, R.wave, 1e9)) ? 'wave' : rp) : 'walk';
              face = car.face;
              if (rp === 'sit' && pose === 'wave') y = seat[1] + 184 * sc;
            } else if (lt >= b) {
              const k = lt - b, ex = K.exit_speed ?? 380;
              x = seat[0] + car.face * Math.min(k, 0.3) * 300 + car.face * Math.max(0, k - 0.3) * ex;
              y = lerp(seat[1] + 100 * sc, (K.y ?? 0.82) * H, prog(k, 0, 0.35)) - Math.sin(clamp01(k / 0.35) * Math.PI) * 70;
              pose = k < 0.3 ? 'shock' : 'run'; face = car.face;
            }
          }
        }
        // gait phase: legs run with the road (env.off px) or with their own pace
        let ph;
        if (pose === 'run' || pose === 'walk' || pose === 'stagger') {
          const g = KASIF.gait(pose === 'run' ? 'run' : 'walk');
          const own = (K.pace ?? (pose === 'run' ? 1.7 : pose === 'stagger' ? 0.55 : 0.9)) * lt;
          ph = env.off != null && env.speed > 0 ? (env.off * (K.gait_k ?? 1)) / (sc * g) + (K.ph0 ?? 0) : own + (K.ph0 ?? 0);
          if (pose === 'stagger') { ph *= 0.5; rotA = Math.sin(lt * 2.3 + (K.ph0 ?? 0)) * 7 + 5; }
        }
        let rigPose = pose === 'stagger' ? 'walk' : pose === 'lie' ? 'idle' : pose;
        if (coughing) { rigPose = 'think'; rotA = 14 + Math.sin(lt * 9) * 3 * Math.exp(-((lt - cough) % 1.3) * 2); }
        if (pose === 'lie') rotA = -84;
        const o = { x, y, face, since, ph, dir: dirOf(s.dir ?? K.dir), emotion: coughing ? 'worried' : (s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null)), mouth: 0, text: s.text };
        if (pv && since < 0.32 && !riding) { o.prev = { pose: pv.pose === 'stagger' ? 'walk' : pv.pose === 'lie' ? 'idle' : pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir), ph }; o.mix = since / 0.32; }
        const r = rig.update(t, rigPose, o);
        // rotation of the whole figure (stagger, cough, lie) around the feet
        const rot = pose === 'lie' ? rotA * -face : rotA * face;
        wrap.setAttribute('transform', rot ? `rotate(${f1(rot)} ${f1(x)} ${f1(y)})` : '');
        const P = q => [x + face * sc * q[0], y + sc * q[1]];
        const hip = P(r.hip), head = P(r.head);
        const up = [head[0] - hip[0], head[1] - hip[1]], L = Math.hypot(up[0], up[1]) || 1, ux = up[0] / L, uy = up[1] / L, nx = -uy, ny = ux;
        const along = (k, side) => [hip[0] + up[0] * k + nx * side, hip[1] + up[1] * k + ny * side];
        // street clothes: loose shirt + trousers cut at the knee
        if (K.street) {
          const w1 = 34 * sc, w2 = 30 * sc;
          const sh = [along(0.72, -w1), along(0.72, w1), along(0.02, w2), along(0.02, -w2)];
          shirtF.setAttribute('d', inkLoop(sh, { seed: sd + 1, t, amp: 0.8 }));
          shirtR.setAttribute('d', inkPath(sh, { w: 4, seed: sd + 2, t, closed: true, amp: 0.8 }));
          const st = [along(0.06, -40 * sc), along(0.06, 40 * sc), [hip[0] + 34 * sc, hip[1] + 58 * sc], [hip[0] - 34 * sc, hip[1] + 58 * sc]];
          shortsF.setAttribute('d', inkLoop(st, { seed: sd + 3, t, amp: 0.8 }));
          shortsR.setAttribute('d', inkPath(st, { w: 4, seed: sd + 4, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[hip[0] - 36 * sc, hip[1] + 56 * sc], [hip[0] - 20 * sc, hip[1] + 68 * sc], [hip[0] - 4 * sc, hip[1] + 56 * sc], [hip[0] + 14 * sc, hip[1] + 68 * sc], [hip[0] + 34 * sc, hip[1] + 56 * sc]], { w: 3, seed: sd + 5, t, smooth: false }));
        }
        // long skirt (1904 dress)
        if (K.dress) {
          const top = along(0.3, 0), w0 = 34 * sc;
          const sk = [[top[0] - w0, top[1]], [top[0] + w0, top[1]], [x + 96 * sc, y - 4 * sc], [x + 40 * sc, y + 6 * sc], [x - 40 * sc, y + 6 * sc], [x - 96 * sc, y - 4 * sc]];
          skirtF.setAttribute('d', inkLoop(sk, { seed: sd + 6, t, amp: 1 }));
          skirtR.setAttribute('d', inkPath(sk, { w: 5, seed: sd + 7, t, closed: true, amp: 1 }) + ' ' + inkPath([[top[0], top[1] + 20 * sc], [x + 6 * sc, y - 20 * sc]], { w: 3, seed: sd + 8, t }));
          const bl = along(0.66, -38 * sc), br = along(0.66, 38 * sc), bt = along(0.3, 30 * sc), bb = along(0.3, -30 * sc);
          sash.setAttribute('d', inkLoop([bl, br, bt, bb], { seed: sd + 9, t, amp: 0.6 }));
        }
        // race number
        if (K.bib) {
          const bs = K.bib_s ?? 1, c = along(K.bib_k ?? 0.42, 0), w = 34 * sc * bs, h = 28 * sc * bs;
          const bp = [[c[0] - w, c[1] - h], [c[0] + w, c[1] - h], [c[0] + w, c[1] + h], [c[0] - w, c[1] + h]];
          bibF.setAttribute('d', inkLoop(bp, { seed: sd + 10, t, smooth: false, amp: 0.6 }));
          bibR.setAttribute('d', inkPath(bp, { w: 3.5, seed: sd + 11, t, closed: true, smooth: false, amp: 0.6 }));
          bibT.setAttribute('x', f1(c[0])); bibT.setAttribute('y', f1(c[1] + 15 * sc * bs)); bibT.setAttribute('font-size', f1(Math.min(42 * bs, 120 / Math.max(1, (K.bib || '').trim().length) * bs) * sc));
        }
        // hats
        const hd = head, hr = 66 * sc;
        if (K.bowler) {
          const brim = ell(hd[0] + face * 4 * sc, hd[1] - hr * 0.62, hr * 1.12, hr * 0.16, 12);
          const dome = [[hd[0] - hr * 0.78, hd[1] - hr * 0.62], [hd[0] - hr * 0.74, hd[1] - hr * 1.05], [hd[0] - hr * 0.4, hd[1] - hr * 1.32], [hd[0] + hr * 0.4, hd[1] - hr * 1.32], [hd[0] + hr * 0.74, hd[1] - hr * 1.05], [hd[0] + hr * 0.78, hd[1] - hr * 0.62]];
          hatF.setAttribute('d', inkLoop(brim, { seed: sd + 12, t, amp: 0.8 }) + ' ' + inkLoop(dome, { seed: sd + 13, t, amp: 0.8 }));
          hatR.setAttribute('d', ''); hatB.setAttribute('d', ''); flower.setAttribute('d', '');
        } else if (K.dress) {
          const brim = ell(hd[0], hd[1] - hr * 0.6, hr * 1.7, hr * 0.26, 14);
          const crown = ell(hd[0], hd[1] - hr * 0.86, hr * 0.8, hr * 0.42, 12);
          hatF.setAttribute('d', '');
          hatR.setAttribute('d', inkPath(brim, { w: 5, seed: sd + 14, t, closed: true }) + ' ' + inkPath(crown, { w: 5, seed: sd + 15, t, closed: true }));
          hatB.setAttribute('d', inkLoop(brim, { seed: sd + 16, t }) + ' ' + inkLoop(crown, { seed: sd + 17, t }));
          hatB.setAttribute('fill', INK.paperLight);
          flower.setAttribute('d', inkDot(hd[0] + face * hr * 0.6, hd[1] - hr * 0.95, 16 * sc, 14 * sc, sd + 18, t) + ' ' + inkDot(hd[0] + face * hr * 0.3, hd[1] - hr * 1.02, 12 * sc, 11 * sc, sd + 19, t));
        } else { hatF.setAttribute('d', ''); hatR.setAttribute('d', ''); hatB.setAttribute('d', ''); flower.setAttribute('d', ''); }
        // laurel wreath
        const wa = K.wreath != null ? atOr(cues, K.wreath, null) : null;
        if (wa != null && lt >= wa - 0.9) {
          const u = prog(lt, wa - 0.9, 0.9), wy = hd[1] - hr * 1.12 - (1 - u) * 160;
          let d = '', dr = '';
          for (let k = 0; k < 14; k++) {
            const a = Math.PI + k / 13 * Math.PI, side = k % 2 ? 1 : -1;
            const cx = hd[0] + Math.cos(a) * hr * 0.98, cy = wy + Math.sin(a) * hr * 0.32 + hr * 0.3;
            const lp = ell(cx, cy, 18 * sc, 9 * sc, 8).map(q => { const dx = q[0] - cx, dy = q[1] - cy, b = a + side * 0.7; return [cx + dx * Math.cos(b) - dy * Math.sin(b), cy + dx * Math.sin(b) + dy * Math.cos(b)]; });
            d += inkLoop(lp, { seed: sd + 30 + k, t, amp: 0.5 }) + ' ';
          }
          dr = inkPath(ell(hd[0], wy + hr * 0.3, hr * 0.98, hr * 0.32, 14), { w: 3.5, seed: sd + 50, t, closed: true });
          wrF.setAttribute('d', d); wrR.setAttribute('d', dr);
        } else { wrF.setAttribute('d', ''); wrR.setAttribute('d', ''); }
        // dizzy stars
        const da = K.dizzy != null ? atOr(cues, K.dizzy, null) : null;
        if (da != null && lt >= da) {
          const p = prog(lt, da, 0.5); let d = '';
          for (let k = 0; k < 4; k++) {
            const a = lt * 2.4 + k * Math.PI / 2, cx = hd[0] + Math.cos(a) * hr * 1.5, cy = hd[1] - hr * 1.3 + Math.sin(a) * hr * 0.35;
            const pts = []; for (let q = 0; q < 10; q++) { const b = q / 10 * Math.PI * 2 - Math.PI / 2, rr = (q % 2 ? 8 : 20) * sc * p; pts.push([cx + Math.cos(b) * rr, cy + Math.sin(b) * rr]); }
            d += inkLoop(pts, { seed: sd + 60 + k, t, smooth: false, amp: 0.5 }) + ' ';
          }
          stars.setAttribute('d', d);
        } else stars.setAttribute('d', '');
        // zzz
        const za = K.zzz != null ? atOr(cues, K.zzz, null) : null;
        zT.forEach((tx, k) => {
          if (za == null || lt < za + k * 0.4) { tx.setAttribute('opacity', 0); return; }
          const u = ((lt - za - k * 0.4) % 1.8) / 1.8;
          tx.setAttribute('opacity', (Math.sin(u * Math.PI)).toFixed(2));
          tx.setAttribute('x', f1(hd[0] + 40 * sc + k * 40 * sc + u * 30)); tx.setAttribute('y', f1(hd[1] - 60 * sc - k * 50 * sc - u * 60));
        });
        const hw = r.hands[1], hl = r.hands[0];
        // small skull bottle held up in the hand
        if (K.bottle) {
          const hp = P(hw), b = 1.2 * sc, x0 = hp[0], y0 = hp[1] + 10 * b;
          const bp = [[x0 - 30 * b, y0], [x0 - 32 * b, y0 - 80 * b], [x0 - 14 * b, y0 - 100 * b], [x0 - 12 * b, y0 - 128 * b], [x0 + 12 * b, y0 - 128 * b], [x0 + 14 * b, y0 - 100 * b], [x0 + 32 * b, y0 - 80 * b], [x0 + 30 * b, y0]];
          btF.setAttribute('d', inkLoop(bp, { seed: sd + 95, t, smooth: false }));
          btR.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 96, t, closed: true, smooth: false }));
          btL.setAttribute('d', inkDot(x0, y0 - 46 * b, 20 * b, 20 * b, sd + 97, t));
          btS.setAttribute('d', inkDot(x0 - 7 * b, y0 - 50 * b, 4 * b, 5 * b, sd + 98, t) + ' ' + inkDot(x0 + 7 * b, y0 - 50 * b, 4 * b, 5 * b, sd + 99, t) + ' ' + inkPath([[x0 - 14 * b, y0 - 30 * b], [x0 + 14 * b, y0 - 20 * b]], { w: 3, seed: sd + 100, t }) + ' ' + inkPath([[x0 + 14 * b, y0 - 30 * b], [x0 - 14 * b, y0 - 20 * b]], { w: 3, seed: sd + 101, t }));
        }
        // wreath carried in the hand (until it is placed)
        if (K.hold_wreath) {
          const hp = P(hw), hr2 = 60 * sc;
          let d = '';
          for (let k = 0; k < 16; k++) {
            const a = k / 16 * Math.PI * 2, cx = hp[0] + Math.cos(a) * hr2, cy = hp[1] - hr2 * 0.9 + Math.sin(a) * hr2 * 0.9;
            d += inkLoop(ell(cx, cy, 16 * sc, 9 * sc, 8).map(q => { const dx = q[0] - cx, dy = q[1] - cy, b = a + 1.2; return [cx + dx * Math.cos(b) - dy * Math.sin(b), cy + dx * Math.sin(b) + dy * Math.cos(b)]; }), { seed: sd + 70 + k, t, amp: 0.5 }) + ' ';
          }
          wrF.setAttribute('d', d); wrR.setAttribute('d', inkPath(ell(hp[0], hp[1] - hr2 * 0.9, hr2, hr2 * 0.9, 14), { w: 3.5, seed: sd + 90, t, closed: true }));
        }
        return { x, y, face, head, hip, hand: P(hw), hand2: P(hl) };
      },
    };
  }

  // ------------------------------------------------------------------ 1904 touring car
  function car(back, front, sd) {
    const gB = el(back, 'g'), gF = el(front, 'g');
    const seatF = inkEl(gB, INK.ink), seatR = inkEl(gB);
    const bodyF = inkEl(gF, INK.red), bodyR = inkEl(gF), trim = inkEl(gF, INK.gold), chassis = inkEl(gF);
    const fender = inkEl(gF), tyre = inkEl(gF), spokes = inkEl(gF, INK.inkSoft), hub = inkEl(gF, INK.gold);
    const steer = inkEl(gF), lamp = inkEl(gF, INK.gold), lampR = inkEl(gF), steam = inkEl(gF, INK.paperLight), steamR = inkEl(gF, INK.inkSoft);
    let last = { x: 0, y: 0, s: 1, face: 1 };
    const W = (q) => [last.x + last.face * last.s * q[0], last.y + last.s * q[1]];
    return {
      get face() { return last.face; },
      seat(which) { return W(which === 'front' ? [-10, -150] : [-150, -150]); },
      get hood() { return W([150, -150]); },
      update(t, o = {}) {
        const s = o.s ?? 1, face = o.face ?? 1, shake = o.shake ?? 0;
        last = { x: o.x ?? 0, y: (o.y ?? 0) + Math.sin(t * 31) * 2.5 * shake, s, face };
        const S = k => sd * 40 + k, P = pts => pts.map(W);
        // seat backs (behind riders)
        const sb1 = P([[-232, -150], [-226, -270], [-196, -282], [-170, -260], [-166, -150]]);
        const sb2 = P([[-80, -150], [-76, -238], [-50, -250], [-26, -232], [-24, -150]]);
        seatF.setAttribute('d', inkLoop(sb1, { seed: S(1), t }) + ' ' + inkLoop(sb2, { seed: S(2), t }));
        seatR.setAttribute('d', inkPath(sb1, { w: 4, seed: S(3), t, closed: true }) + ' ' + inkPath(sb2, { w: 4, seed: S(4), t, closed: true }));
        // body: rear tonneau + low waist + hood
        const body = P([[-250, -96], [-252, -150], [-236, -196], [-150, -204], [-100, -170], [-40, -168], [40, -150], [60, -192], [230, -192], [252, -176], [252, -96]]);
        bodyF.setAttribute('d', inkLoop(body, { seed: S(5), t, smooth: false, amp: 1 }));
        bodyR.setAttribute('d', inkPath(body, { w: 6, seed: S(6), t, closed: true, smooth: false, amp: 1 })
          + ' ' + inkPath(P([[60, -192], [60, -100]]), { w: 4, seed: S(7), t })
          + ' ' + inkPath(P([[252, -186], [252, -100]]), { w: 9, seed: S(8), t }));
        let tr = '';
        for (let k = 0; k < 5; k++) tr += inkPath(P([[96 + k * 28, -178], [96 + k * 28, -120]]), { w: 3, seed: S(10 + k), t }) + ' ';
        tr += inkPath(P([[-246, -130], [-60, -130]]), { w: 3, seed: S(16), t });
        trim.setAttribute('d', tr);
        chassis.setAttribute('d', inkPath(P([[-270, -96], [280, -96]]), { w: 7, seed: S(17), t, smooth: false }) + ' ' + inkPath(P([[-60, -100], [-20, -84], [60, -84]]), { w: 5, seed: S(18), t }));
        // wheels
        const roll = o.roll ?? 0, R = 66;
        let ty = '', sp = '', hb = '', fd = '';
        for (const [cx, k] of [[-160, 0], [170, 1]]) {
          const c = W([cx, -R]);
          ty += inkCircle(c[0], c[1], R * s, S(20 + k), t, { w: 11 }) + ' ' + inkCircle(c[0], c[1], (R - 12) * s, S(22 + k), t, { w: 3 }) + ' ';
          for (let q = 0; q < 10; q++) {
            const a = roll * face + q / 10 * Math.PI * 2;
            sp += inkPath([[c[0] + Math.cos(a) * 12 * s, c[1] + Math.sin(a) * 12 * s], [c[0] + Math.cos(a) * (R - 12) * s, c[1] + Math.sin(a) * (R - 12) * s]], { w: 3.5, seed: S(30 + q + k * 10), t, amp: 0.4 }) + ' ';
          }
          hb += inkDot(c[0], c[1], 13 * s, 13 * s, S(50 + k), t) + ' ';
          const fa = []; for (let q = 0; q <= 8; q++) { const a = Math.PI + q / 8 * Math.PI; fa.push([cx + Math.cos(a) * (R + 16), -R + Math.sin(a) * (R + 16)]); }
          fd += inkPath(P(fa), { w: 6, seed: S(52 + k), t }) + ' ';
        }
        tyre.setAttribute('d', ty); spokes.setAttribute('d', sp); hub.setAttribute('d', hb); fender.setAttribute('d', fd);
        // steering column + wheel
        const sw = W([40, -262]);
        steer.setAttribute('d', inkPath(P([[20, -150], [40, -262]]), { w: 6, seed: S(56), t }) + ' ' + inkPath(ell(sw[0], sw[1], 30 * s, 9 * s, 10), { w: 5, seed: S(57), t, closed: true }));
        const lp = W([262, -214]);
        lamp.setAttribute('d', inkDot(lp[0], lp[1], 20 * s, 18 * s, S(58), t));
        lampR.setAttribute('d', inkCircle(lp[0], lp[1], 20 * s, S(59), t, { w: 4 }) + ' ' + inkPath(P([[252, -192], [262, -200]]), { w: 4, seed: S(60), t }));
        // steam / smoke when broken down
        const st = clamp01(o.steam ?? 0);
        if (st > 0.01) {
          let d = '', dr = '';
          for (let k = 0; k < 5; k++) {
            const u = ((t * 0.55 + k / 5) % 1), c = W([150 + k * 6 + u * 60, -200 - u * 230]), r = (26 + u * 60) * s * st;
            const pts = ell(c[0], c[1], r, r * 0.8, 10);
            d += inkLoop(pts, { seed: S(70 + k), t, amp: 1.2 }) + ' ';
            dr += inkPath(pts, { w: 3, seed: S(80 + k), t, closed: true, amp: 1.2 }) + ' ';
          }
          steam.setAttribute('d', d); steamR.setAttribute('d', dr);
        } else { steam.setAttribute('d', ''); steamR.setAttribute('d', ''); }
        return { seat: this.seat };
      },
    };
  }

  // ------------------------------------------------------------------ dust
  function dust(parent, sd) {
    const f = inkEl(parent, INK.paperDark, { 'fill-opacity': 0.9 }), r = inkEl(parent, INK.inkSoft);
    return {
      update(t, o = {}) {
        const p = clamp01(o.p ?? 1), n = o.n ?? 9, dir = o.dir ?? -1, len = o.len ?? 520, h = o.h ?? 220;
        if (p < 0.01) { f.setAttribute('d', ''); r.setAttribute('d', ''); return; }
        let d = '', dr = '';
        const R = rng(sd + 3);
        for (let k = 0; k < n; k++) {
          const ph = R(), u = ((t * (o.speed ?? 0.45) + ph) % 1);
          const dist = (k / n * 0.6 + u * 0.4) * len * p;
          const cx = (o.x ?? 0) + dir * dist, cy = (o.y ?? 0) - 30 - u * h * 0.6 - R() * 30;
          const rr = (40 + dist / len * h * 0.6) * (0.7 + 0.3 * Math.sin(u * Math.PI));
          const pts = ell(cx, cy, rr, rr * 0.78, 11);
          d += inkLoop(pts, { seed: sd + 10 + k, t, amp: 2 }) + ' ';
          dr += inkPath(pts.slice(6, 10), { w: 2.5, seed: sd + 40 + k, t, amp: 2 }) + ' ';
        }
        f.setAttribute('d', d); r.setAttribute('d', dr);
      },
    };
  }
  function dustField(parent, sd) {
    const f = inkEl(parent, INK.paperDark, { 'fill-opacity': 0.88 }), r = inkEl(parent, INK.inkSoft);
    return {
      update(t, W, H, p, y0 = 0.2) {
        if (p < 0.01) { f.setAttribute('d', ''); r.setAttribute('d', ''); return; }
        let d = '', dr = ''; const R = rng(sd + 5), n = 22;
        for (let k = 0; k < n; k++) {
          const bx = R() * 1.3 - 0.15, by = lerp(y0, 0.95, R()), sp = 40 + R() * 70, rr0 = 110 + R() * 140;
          const x = (((bx * W - t * sp) % (W * 1.3)) + W * 1.3) % (W * 1.3) - W * 0.15, y = by * H + Math.sin(t * 0.7 + k) * 20;
          const rr = rr0 * p;
          const pts = ell(x, y, rr, rr * 0.7, 11);
          d += inkLoop(pts, { seed: sd + 10 + k, t, amp: 2.5 }) + ' ';
          if (k % 4 === 0) dr += inkPath(pts.slice(7, 10), { w: 2.5, seed: sd + 60 + k, t, amp: 2.5 }) + ' ';
        }
        f.setAttribute('d', d); r.setAttribute('d', dr);
      },
    };
  }

  // ------------------------------------------------------------------ road + roadside
  function roadside(parent, sd) {
    const road = inkEl(parent, INK.paperDark), roadR = inkEl(parent), ruts = inkEl(parent, INK.inkSoft), peb = inkEl(parent, INK.inkSoft);
    const posts = inkEl(parent), wires = inkEl(parent, INK.inkSoft);
    return {
      update(t, W, G, off, o = {}) {
        const top = G - (o.depth ?? 34), bot = G + (o.below ?? 70);
        const rp = [[-20, top], [W * 0.5, top - 4], [W + 20, top], [W + 20, bot], [-20, bot]];
        road.setAttribute('d', o.road === false ? '' : inkLoop(rp, { seed: sd + 1, t, smooth: false, amp: 1 }));
        roadR.setAttribute('d', o.road === false ? '' : inkPath([[-20, top], [W * 0.5, top - 4], [W + 20, top]], { w: 5, seed: sd + 2, t }));
        let rd = '', pd = '';
        if (o.road !== false) {
          const sp = 170;
          for (let row = 0; row < 2; row++) {
            const yy = G + 14 + row * 30, sh = (off * (1 + row * 0.15)) % sp;
            for (let k = -1; k < W / sp + 2; k++) { const x0 = k * sp - sh + row * 60; rd += inkPath([[x0, yy], [x0 + 90, yy + 2]], { w: 4, seed: sd + 10 + k * 3 + row, t, amp: 0.8 }) + ' '; }
          }
          const R = rng(sd + 7), pp = 1400;
          for (let k = 0; k < 26; k++) { const bx = R() * pp, by = G - 10 + R() * 70; const x = (((bx - off) % pp) + pp) % pp - 60; for (let rep = 0; rep < 2; rep++) { const xx = x + rep * pp; if (xx < W + 30) pd += inkDot(xx, by, 6 + R() * 5, 4 + R() * 3, sd + 30 + k, t) + ' '; } }
        }
        ruts.setAttribute('d', rd); peb.setAttribute('d', pd);
        // fence posts + rails behind the road, telegraph poles every 900 px
        let ps = '', wd = '';
        if (o.fence !== false) {
          const sp = 230, sh = ((off * 0.9) % sp + sp) % sp, fy = top - 2;
          const xs = [];
          for (let k = -1; k < W / sp + 2; k++) { const x = k * sp - sh; xs.push(x); ps += inkPath([[x, fy], [x + 2, fy - 120]], { w: 7, seed: sd + 50 + k, t }) + ' '; }
          ps += inkPath([[-20, fy - 96], [W + 20, fy - 94]], { w: 4, seed: sd + 70, t }) + ' ' + inkPath([[-20, fy - 52], [W + 20, fy - 50]], { w: 4, seed: sd + 71, t });
        }
        if (o.poles !== false) {
          const sp = 900, sh = ((off * 0.8) % sp + sp) % sp, py = top - 2, ht = o.pole_h ?? 520;
          const tops = [];
          for (let k = -1; k < W / sp + 2; k++) { const x = k * sp - sh + 300; tops.push(x); ps += inkPath([[x, py], [x + 4, py - ht]], { w: 9, seed: sd + 80 + k, t }) + ' ' + inkPath([[x - 70, py - ht + 40], [x + 74, py - ht + 40]], { w: 6, seed: sd + 90 + k, t }) + ' '; }
          for (let k = 0; k < tops.length - 1; k++) for (const dx of [-60, 60]) {
            const a = [tops[k] + dx, py - ht + 40], b = [tops[k + 1] + dx, py - ht + 40], m = [(a[0] + b[0]) / 2, a[1] + 50];
            wd += inkPath([a, m, b], { w: 2.5, seed: sd + 100 + k * 2 + (dx > 0), t, amp: 0.6 }) + ' ';
          }
        }
        posts.setAttribute('d', ps); wires.setAttribute('d', wd);
      },
    };
  }

  // ------------------------------------------------------------------ sun + heat
  function sun(parent, sd) {
    const f = inkEl(parent, INK.gold), r = inkEl(parent), rays = inkEl(parent, INK.gold);
    return {
      update(t, x, y, R) {
        f.setAttribute('d', inkDot(x, y, R, R, sd + 1, t, 1));
        r.setAttribute('d', inkCircle(x, y, R, sd + 2, t, { w: 5 }));
        let d = '';
        for (let k = 0; k < 14; k++) {
          const a = k / 14 * Math.PI * 2 + t * 0.15, l = R * (1.35 + 0.12 * Math.sin(t * 3 + k));
          d += inkPath([[x + Math.cos(a) * R * 1.15, y + Math.sin(a) * R * 1.15], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 8, seed: sd + 3 + k, t, taper: 0.5 }) + ' ';
        }
        rays.setAttribute('d', d);
      },
    };
  }
  function heat(parent, sd) {
    const e = inkEl(parent, INK.inkSoft);
    return {
      update(t, W, y, p) {
        if (p < 0.01) { e.setAttribute('d', ''); return; }
        let d = '';
        for (let k = 0; k < 7; k++) {
          const x0 = (k + 0.5) / 7 * W + Math.sin(k * 3.1) * 60, u = ((t * 0.5 + k * 0.37) % 1), yy = y - 60 - u * 200;
          const pts = []; for (let q = 0; q <= 8; q++) pts.push([x0 + q * 14, yy - q * 4 + Math.sin(q * 1.4 + t * 6 + k) * 9]);
          d += inkPath(pts, { w: 3.5 * p * Math.sin(u * Math.PI), seed: sd + k, t, amp: 0.6 }) + ' ';
        }
        e.setAttribute('d', d);
      },
    };
  }

  // ------------------------------------------------------------------ well + water tower
  function well(parent, sd) {
    const ring = inkEl(parent, INK.paperDark), ringR = inkEl(parent), stones = inkEl(parent, INK.inkSoft), roof = inkEl(parent, INK.red), frame = inkEl(parent), bucket = inkEl(parent, INK.paperLight), bucketR = inkEl(parent), water = inkEl(parent, INK.blue);
    return {
      update(t, x, G, s, b = 0) {
        const P = q => [x + q[0] * s, G + q[1] * s];
        const rp = [[-110, 0], [-110, -120], [110, -120], [110, 0]].map(P);
        ring.setAttribute('d', inkLoop(rp, { seed: sd + 1, t, smooth: false }));
        ringR.setAttribute('d', inkPath(rp, { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
        let st = '';
        for (let row = 0; row < 3; row++) for (let k = 0; k < 4; k++) { const xx = -110 + k * 55 + (row % 2) * 27, yy = -row * 40; st += inkPath([P([xx, yy - 40]), P([xx, yy])], { w: 3, seed: sd + 10 + row * 5 + k, t }) + ' '; }
        st += inkPath([P([-110, -40]), P([110, -40])], { w: 3, seed: sd + 30, t }) + ' ' + inkPath([P([-110, -80]), P([110, -80])], { w: 3, seed: sd + 31, t });
        stones.setAttribute('d', st);
        roof.setAttribute('d', inkLoop([P([-150, -300]), P([0, -390]), P([150, -300])], { seed: sd + 3, t, smooth: false }));
        frame.setAttribute('d', inkPath([P([-96, -120]), P([-96, -300])], { w: 9, seed: sd + 4, t }) + ' ' + inkPath([P([96, -120]), P([96, -300])], { w: 9, seed: sd + 5, t })
          + ' ' + inkPath([P([-150, -300]), P([0, -390]), P([150, -300])], { w: 6, seed: sd + 6, t, closed: true, smooth: false })
          + ' ' + inkPath([P([-110, -250]), P([110, -250])], { w: 7, seed: sd + 7, t }) + ' ' + inkPath([P([110, -250]), P([140, -230]), P([150, -200])], { w: 6, seed: sd + 8, t })
          + ' ' + inkPath([P([0, -250]), P([0, lerp(-130, -200, b)])], { w: 3, seed: sd + 9, t }));
        const by = lerp(-130, -200, b), bp = [[-28, by], [28, by], [22, by + 50], [-22, by + 50]].map(P);
        bucket.setAttribute('d', inkLoop(bp, { seed: sd + 40, t, smooth: false }));
        bucketR.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 41, t, closed: true, smooth: false }));
        water.setAttribute('d', b > 0.5 ? inkLoop([P([-24, by + 6]), P([24, by + 6]), P([20, by + 16]), P([-20, by + 16])], { seed: sd + 42, t }) : '');
      },
    };
  }
  function tower(parent, sd) {
    const tank = inkEl(parent, INK.paperDark), tankR = inkEl(parent), legs = inkEl(parent), hoops = inkEl(parent, INK.inkSoft), drip = inkEl(parent, INK.blue);
    return {
      update(t, x, G, s) {
        const P = q => [x + q[0] * s, G + q[1] * s];
        const tp = [[-110, -360], [-100, -560], [0, -600], [100, -560], [110, -360]].map(P);
        tank.setAttribute('d', inkLoop(tp, { seed: sd + 1, t }));
        tankR.setAttribute('d', inkPath(tp, { w: 6, seed: sd + 2, t, closed: true }));
        legs.setAttribute('d', [[-90, 0, -80, -360], [90, 0, 80, -360], [-90, 0, 80, -240], [90, 0, -80, -240], [-86, -120, 86, -120]].map((q, k) => inkPath([P([q[0], q[1]]), P([q[2], q[3]])], { w: k < 2 ? 9 : 4, seed: sd + 3 + k, t })).join(' '));
        hoops.setAttribute('d', [-420, -490].map((yy, k) => inkPath([P([-106, yy]), P([106, yy])], { w: 4, seed: sd + 10 + k, t })).join(' '));
        const u = (t * 1.2) % 1;
        drip.setAttribute('d', inkDot(P([60, -350 + u * 300])[0], P([60, -350 + u * 300])[1], 7 * s, 10 * s, sd + 20, t));
      },
    };
  }

  // ------------------------------------------------------------------ apple tree
  function tree(parent, sd) {
    const trunk = inkEl(parent, INK.inkSoft), trunkR = inkEl(parent), crown = inkEl(parent, INK.green, { 'fill-opacity': 0.85 }), crownR = inkEl(parent), apples = inkEl(parent, INK.red), appR = inkEl(parent), flies = inkEl(parent);
    return {
      update(t, x, G, s, rot = 0) {
        const P = q => [x + q[0] * s, G + q[1] * s];
        const tp = [[-26, 0], [-20, -200], [-70, -290], [-44, -296], [0, -236], [44, -300], [70, -290], [20, -200], [26, 0]].map(P);
        trunk.setAttribute('d', inkLoop(tp, { seed: sd + 1, t, smooth: false }));
        trunkR.setAttribute('d', inkPath(tp, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        let cd = '', cr = '';
        [[0, -380, 150], [-120, -320, 110], [120, -320, 110], [-70, -450, 100], [80, -440, 105]].forEach(([cx, cy, r], k) => {
          const sw = Math.sin(t * 1.1 + k) * 4, pts = ell(P([cx + sw, cy])[0], P([cx, cy])[1], r * s, r * 0.8 * s, 12);
          cd += inkLoop(pts, { seed: sd + 10 + k, t, amp: 1.5 }) + ' '; cr += inkPath(pts, { w: 5, seed: sd + 20 + k, t, closed: true, amp: 1.5 }) + ' ';
        });
        crown.setAttribute('d', cd); crownR.setAttribute('d', cr);
        apples.setAttribute('fill', rot > 0.01 ? mix(INK.red, INK.inkSoft, clamp01(rot) * 0.85) : INK.red);
        let ad = '', ar = '';
        [[-90, -300], [40, -340], [110, -290], [-30, -420], [70, -430], [-140, -350], [10, -270]].forEach(([ax, ay], k) => {
          const c = P([ax, ay]), r = 17 * s;
          ad += inkDot(c[0], c[1], r, r * 0.95, sd + 30 + k, t) + ' ';
          ar += inkCircle(c[0], c[1], r, sd + 40 + k, t, { w: 3 }) + ' ';
        });
        apples.setAttribute('d', ad); appR.setAttribute('d', ar);
        let fd = '';
        if (rot > 0.3) for (let k = 0; k < 6; k++) { const a = t * (3 + k * 0.4) + k, c = P([-40 + Math.cos(a) * 120, -340 + Math.sin(a * 1.3) * 80]); fd += inkPath([[c[0] - 8, c[1] - 5], [c[0], c[1]], [c[0] + 8, c[1] - 5]], { w: 3, seed: sd + 50 + k, t, amp: 0.4 }) + ' ' + inkDot(c[0], c[1] + 2, 4, 4, sd + 60 + k, t) + ' '; }
        flies.setAttribute('d', fd);
      },
    };
  }

  // ------------------------------------------------------------------ dog
  function dog(parent, sd) {
    const body = inkEl(parent, INK.inkSoft), bodyR = inkEl(parent), legs = inkEl(parent), eye = inkEl(parent, INK.paperLight), teeth = inkEl(parent, INK.paperLight);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, f = o.face ?? 1, x = o.x ?? 0, y = o.y ?? 0, ph = (o.ph ?? t * 3) * Math.PI * 2;
        const b = Math.sin(ph * 2) * 6;
        const P = q => [x + f * q[0] * s, y + q[1] * s];
        const bp = [[-110, -120 + b], [-60, -140 + b], [40, -136 + b], [90, -150 + b], [110, -190 + b], [150, -194 + b], [178, -172 + b], [170, -150 + b], [130, -140 + b], [96, -100 + b], [40, -96 + b], [-80, -92 + b], [-118, -104 + b]].map(P);
        body.setAttribute('d', inkLoop(bp, { seed: sd + 1, t }));
        let rd = inkPath(bp, { w: 5, seed: sd + 2, t, closed: true })
          + ' ' + inkPath([P([-112, -118 + b]), P([-160, -150 + b + Math.sin(ph * 2) * 14]), P([-186, -176 + b])], { w: 7, seed: sd + 3, t })
          + ' ' + inkLoop([P([118, -190 + b]), P([108, -234 + b]), P([136, -200 + b])], { seed: sd + 4, t, smooth: false });
        bodyR.setAttribute('d', rd);
        let ld = '';
        [[-80, 0], [-60, Math.PI], [50, Math.PI * 0.5], [76, Math.PI * 1.5]].forEach(([hx, off], k) => {
          const a = Math.sin(ph + off) * 0.7, hip = [hx, -100 + b], knee = [hx + Math.sin(a) * 50, -50 + b * 0.5], foot = [hx + Math.sin(a + 0.4 * (k < 2 ? -1 : 1)) * 80, -Math.max(0, Math.cos(ph + off)) * 18];
          ld += inkPath([P(hip), P(knee), P(foot)], { w: 7, seed: sd + 10 + k, t }) + ' ';
        });
        legs.setAttribute('d', ld);
        const e = P([150, -178 + b]); eye.setAttribute('d', inkDot(e[0], e[1], 6 * s, 6 * s, sd + 20, t));
        teeth.setAttribute('d', inkLoop([P([150, -152 + b]), P([174, -156 + b]), P([162, -146 + b])], { seed: sd + 21, t, smooth: false, amp: 0.4 }));
      },
    };
  }

  // ------------------------------------------------------------------ grandstand with spectators
  function stands(parent, sd) {
    const fr = inkEl(parent, INK.paperDark), frR = inkEl(parent), tiers = inkEl(parent, INK.inkSoft), roof = inkEl(parent, INK.ink), roofR = inkEl(parent);
    const flags = [inkEl(parent, INK.red), inkEl(parent, INK.blue), inkEl(parent, INK.gold)];
    const heads = inkEl(parent, INK.paperLight), headR = inkEl(parent, INK.inkSoft), bodies = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.45)), arms = inkEl(parent), hats = inkEl(parent, INK.ink);
    return {
      update(t, o) {
        const { x0, x1, top, base } = o, cheer = clamp01(o.cheer ?? 0);
        const fp = [[x0, base], [x0, top], [x1, top], [x1, base]];
        fr.setAttribute('d', inkLoop(fp, { seed: sd + 1, t, smooth: false }));
        frR.setAttribute('d', inkPath(fp, { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
        const rows = o.rows ?? 4, rh = (base - top) / (rows + 0.6);
        let td = '';
        for (let k = 1; k <= rows; k++) td += inkPath([[x0, top + k * rh + 10], [x1, top + k * rh + 10]], { w: 4, seed: sd + 10 + k, t }) + ' ';
        tiers.setAttribute('d', td);
        const rt = top - 120;
        const rp = [[x0 - 40, rt + 40], [x0 + 30, rt], [x1 - 30, rt], [x1 + 40, rt + 40]];
        roof.setAttribute('d', inkLoop(rp.concat([[x1 + 40, rt + 56], [x0 - 40, rt + 56]]), { seed: sd + 3, t, smooth: false }));
        let rr = '';
        for (let k = 0; k <= 6; k++) { const px = lerp(x0 + 20, x1 - 20, k / 6); rr += inkPath([[px, rt + 56], [px, top]], { w: 6, seed: sd + 20 + k, t }) + ' '; }
        roofR.setAttribute('d', rr);
        // bunting
        const fd = ['', '', ''];
        const nF = Math.floor((x1 - x0) / 70);
        for (let k = 0; k < nF; k++) { const fx = x0 + 20 + k * 70, sw = Math.sin(t * 3 + k) * 6; fd[k % 3] += inkLoop([[fx, rt + 58], [fx + 50, rt + 58], [fx + 25 + sw, rt + 110]], { seed: sd + 40 + k, t, smooth: false, amp: 0.6 }) + ' '; }
        flags.forEach((e, k) => e.setAttribute('d', fd[k]));
        // crowd
        let hd = '', hr = '', bd = '', ad = '', hh = '';
        const R = rng(sd + 9), per = o.per ?? Math.floor((x1 - x0) / 62);
        for (let row = 0; row < rows; row++) for (let k = 0; k < per; k++) {
          const ph = R() * 6.28, jit = R(), hat = R() < 0.45;
          const cx = x0 + 34 + k * ((x1 - x0 - 68) / (per - 1)) + (row % 2) * 18, by = top + (row + 1) * rh + 6;
          const jump = cheer * Math.max(0, Math.sin(t * 7 + ph)) * 16, cy = by - 56 - jump;
          bd += inkLoop([[cx - 24, by + 4], [cx - 20, cy + 20], [cx + 20, cy + 20], [cx + 24, by + 4]], { seed: sd + 100 + row * 50 + k, t, smooth: false, amp: 0.8 }) + ' ';
          hd += inkDot(cx, cy, 19, 20, sd + 400 + row * 50 + k, t) + ' ';
          hr += inkCircle(cx, cy, 19, sd + 700 + row * 50 + k, t, { w: 3 }) + ' ';
          if (hat) hh += inkLoop([[cx - 26, cy - 12], [cx + 26, cy - 12], [cx + 16, cy - 20], [cx + 14, cy - 36], [cx - 14, cy - 36], [cx - 16, cy - 20]], { seed: sd + 1000 + row * 50 + k, t, amp: 0.6 }) + ' ';
          if (cheer > 0.05 && jit < 0.75) {
            const wv = Math.sin(t * 9 + ph) * 10;
            ad += inkPath([[cx - 18, cy + 26], [cx - 34 + wv, cy - 30 * cheer]], { w: 4, seed: sd + 1300 + row * 50 + k, t, amp: 0.6 }) + ' ' + inkPath([[cx + 18, cy + 26], [cx + 34 - wv, cy - 30 * cheer]], { w: 4, seed: sd + 1600 + row * 50 + k, t, amp: 0.6 }) + ' ';
          }
        }
        bodies.setAttribute('d', bd); heads.setAttribute('d', hd); headR.setAttribute('d', hr); arms.setAttribute('d', ad); hats.setAttribute('d', hh);
      },
    };
  }

  // ------------------------------------------------------------------ finish tape
  function tape(parent, sd) {
    const posts = inkEl(parent), tp = inkEl(parent, INK.red), banner = inkEl(parent, INK.paperLight), bR = inkEl(parent);
    const txt = el(parent, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 56, 'text-anchor': 'middle', fill: INK.red });
    txt.textContent = 'FINISH';
    return {
      update(t, x, G, h, br, w = 240) {
        const a = [x - w / 2, G], b = [x + w / 2, G - 20];
        posts.setAttribute('d', inkPath([a, [a[0], G - h - 120]], { w: 9, seed: sd + 1, t }) + ' ' + inkPath([b, [b[0], G - h - 140]], { w: 9, seed: sd + 2, t }));
        const ty = G - h;
        if (br < 0.01) tp.setAttribute('d', inkPath([[a[0], ty], [x, ty + 8 + Math.sin(t * 3) * 3], [b[0], ty - 20]], { w: 9, seed: sd + 3, t }));
        else tp.setAttribute('d', inkPath([[a[0], ty], [a[0] + 30, ty + 60 * br], [a[0] + 50, ty + 140 * br]], { w: 9, seed: sd + 3, t }) + ' ' + inkPath([[b[0], ty - 20], [b[0] - 30, ty + 40 * br], [b[0] - 40, ty + 130 * br]], { w: 9, seed: sd + 4, t }));
        const bp = [[a[0] - 30, G - h - 230], [b[0] + 30, G - h - 250], [b[0] + 30, G - h - 160], [a[0] - 30, G - h - 140]];
        banner.setAttribute('d', inkLoop(bp, { seed: sd + 5, t, smooth: false }));
        bR.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 6, t, closed: true, smooth: false }));
        txt.setAttribute('x', f1(x)); txt.setAttribute('y', f1(G - h - 172));
        txt.setAttribute('transform', `rotate(-3 ${f1(x)} ${f1(G - h - 190)})`);
      },
    };
  }

  function puff(parent, sd) {
    const f = inkEl(parent, INK.paperLight), r = inkEl(parent, INK.inkSoft), fl = inkEl(parent, INK.gold);
    return {
      update(t, x, y, p) {
        if (p <= 0 || p >= 1) { f.setAttribute('d', ''); r.setAttribute('d', ''); fl.setAttribute('d', ''); return; }
        let d = '', dr = '';
        for (let k = 0; k < 5; k++) { const a = -1.2 + k * 0.5, c = [x + Math.cos(a) * 60 * p, y - 40 * p + Math.sin(a) * 50 * p], rr = 30 + 50 * p; const pts = ell(c[0], c[1], rr, rr * 0.8, 10); d += inkLoop(pts, { seed: sd + k, t, amp: 1.2 }) + ' '; dr += inkPath(pts, { w: 3, seed: sd + 10 + k, t, closed: true }) + ' '; }
        f.setAttribute('d', d); r.setAttribute('d', dr);
        if (p < 0.25) { const pts = []; for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2, rr = (q % 2 ? 20 : 54) * (1 - p * 2); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } fl.setAttribute('d', inkLoop(pts, { seed: sd + 30, t, smooth: false })); } else fl.setAttribute('d', '');
      },
    };
  }

  // ------------------------------------------------------------------ scenery landmarks (behind the road)
  //   scenery(parent, seed) -> {update(t, S, x, G, s)}  S.type: "farmhouse" | "barn" | "bridge" | "milepost" | "lane" (a row
  //   of leafy trees) | "deadtree" | "cracks" (sun-baked ground) | "gate"; S.text for the mile post
  function scenery(parent, sd, S) {
    const fA = inkEl(parent, INK.paperLight), fB = inkEl(parent, INK.red), fC = inkEl(parent, INK.inkSoft), fG = inkEl(parent, INK.green, { 'fill-opacity': 0.85 }), fW = inkEl(parent, INK.blue, { 'fill-opacity': 0.8 }), ln = inkEl(parent), ln2 = inkEl(parent, INK.inkSoft);
    const tx = el(parent, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink });
    tx.textContent = S.text || '';
    return {
      update(t, x, G, s) {
        const P = q => [x + q[0] * s, G + q[1] * s], L = pts => pts.map(P);
        let a = '', b = '', c = '', g = '', w = '', l = '', l2 = '';
        const box = (pts, k) => inkLoop(L(pts), { seed: sd + k, t, smooth: false }) + ' ';
        const out = (pts, k, wd = 5, closed = true) => inkPath(L(pts), { w: wd, seed: sd + k, t, closed, smooth: false }) + ' ';
        if (S.type === 'farmhouse') {
          const body = [[-160, 0], [-160, -200], [160, -200], [160, 0]], roof = [[-190, -200], [0, -330], [190, -200]];
          a += box(body, 1); c += box(roof, 2); l += out(body, 3) + out(roof, 4);
          for (const wx of [-100, 60]) { const wp = [[wx - 30, -150], [wx + 30, -150], [wx + 30, -90], [wx - 30, -90]]; w += box(wp, 5 + wx); l += out(wp, 7 + wx, 4) + out([[wx, -150], [wx, -90]], 9 + wx, 3, false); }
          const dp = [[-30, 0], [-30, -110], [20, -110], [20, 0]]; b += box(dp, 11); l += out(dp, 12, 4);
          l += out([[100, -270], [100, -330], [130, -330], [130, -250]], 13, 5);
          const sm = (t * 0.4) % 1; l2 += inkPath([[115, -340], [125 + Math.sin(t * 2) * 10, -380 - sm * 60], [110, -440 - sm * 60]], { w: 4, seed: sd + 14, t });
        } else if (S.type === 'barn') {
          const body = [[-150, 0], [-150, -180], [-90, -260], [90, -260], [150, -180], [150, 0]];
          b += box(body, 21); l += out(body, 22);
          const dp = [[-60, 0], [-60, -130], [60, -130], [60, 0]]; a += box(dp, 23); l += out(dp, 24, 4) + out([[-60, 0], [60, -130]], 25, 4, false) + out([[60, 0], [-60, -130]], 26, 4, false);
          const hp = [[-30, -200], [30, -200], [30, -160], [-30, -160]]; a += box(hp, 27); l += out(hp, 28, 3);
        } else if (S.type === 'bridge') {
          const wp = [[-420, 4], [420, 4], [380, 90], [-380, 90]]; w += box(wp, 31);
          let ww = ''; for (let k = 0; k < 4; k++) { const yy = 30 + k * 16, sh = ((t * 40 + k * 50) % 120); ww += inkPath(L([[-300 + sh, yy], [-240 + sh, yy - 3], [-180 + sh, yy]]), { w: 3, seed: sd + 32 + k, t }) + ' ' + inkPath(L([[60 + sh, yy], [120 + sh, yy - 3], [180 + sh, yy]]), { w: 3, seed: sd + 36 + k, t }) + ' '; }
          l2 += ww;
          const deck = [[-440, -6], [440, -6], [440, 14], [-440, 14]]; c += box(deck, 40); l += out(deck, 41, 5);
          for (let k = -4; k <= 4; k++) l += out([[k * 100, -6], [k * 100, -90]], 42 + k, 6, false);
          l += out([[-440, -90], [440, -90]], 52, 6, false) + out([[-440, -50], [440, -50]], 53, 4, false);
          for (const px of [-300, 0, 300]) l += out([[px, 14], [px, 90]], 54 + px, 8, false);
        } else if (S.type === 'milepost') {
          l += out([[0, 0], [0, -260]], 61, 9, false);
          const sp = [[-90, -300], [90, -300], [90, -200], [-90, -200]]; a += box(sp, 62); l += out(sp, 63, 5);
          tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(G - 232 * s)); tx.setAttribute('font-size', f1(54 * s));
        } else if (S.type === 'lane') {
          for (let k = 0; k < 4; k++) { const cx = -300 + k * 200, r = 100 + (k % 2) * 30; l += out([[cx, 0], [cx, -180]], 70 + k, 12, false); const cp = ell(P([cx, -260])[0], P([cx, -260])[1], r * s, r * 0.85 * s, 12); g += inkLoop(cp, { seed: sd + 75 + k, t, amp: 1.5 }) + ' '; l += inkPath(cp, { w: 5, seed: sd + 80 + k, t, closed: true, amp: 1.5 }) + ' '; }
        } else if (S.type === 'deadtree') {
          l += out([[0, 0], [-6, -160], [-60, -260], [-90, -280]], 90, 11, false) + out([[-6, -160], [40, -240], [80, -250]], 91, 8, false) + out([[-20, -200], [-30, -300]], 92, 6, false);
        } else if (S.type === 'cracks') {
          for (let k = 0; k < 7; k++) { const cx = -500 + k * 160; l2 += inkPath(L([[cx, 30], [cx + 30, 45], [cx + 20, 60], [cx + 60, 70]]), { w: 3, seed: sd + 100 + k, t, smooth: false }) + ' '; }
        } else if (S.type === 'gate') {
          for (const px of [-120, 120]) l += out([[px, 0], [px, -170]], 110 + px, 10, false);
          const sw = Math.sin(t * 1.5) * 0.15 + 0.7, ex = -120 + 240 * Math.cos(sw);
          l += out([[-120, -150], [ex, -150], [ex, -20], [-120, -20]], 115, 5, false) + out([[-120, -20], [ex, -150]], 116, 4, false);
        }
        fA.setAttribute('d', a); fB.setAttribute('d', b); fC.setAttribute('d', c); fG.setAttribute('d', g); fW.setAttribute('d', w); ln.setAttribute('d', l); ln2.setAttribute('d', l2);
      },
    };
  }

  window.MAR = { atOr, f1, ell, person, car, dust, dustField, roadside, sun, heat, well, tower, tree, dog, stands, tape, puff, scenery };
})();
