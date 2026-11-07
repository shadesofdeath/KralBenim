// sem_vienna: shots for the Stickstory long video "Semmelweis and childbed fever" (2026-11-07): Vienna General Hospital,
// 1846-1847, the First (doctors) and Second (midwives) maternity clinics, the priest's bell, Kolletschka's scalpel, the
// chlorine bowl, the death-rate ledger and the microscope that later showed germs. Respectful: deaths are shown as an
// empty bed with a candle, the cut as a tiny red mark. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens
// only (INK), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any 19th-century hospital / medicine story. Labels use window.MCB.labels (mcB__lib.js):
// {text, x, y, at, size, color, font: "hand"|"serif", rot, arrow, stamp, strike}.
//
// Figure F = {role: "kasif"|"doctor"|"student"|"midwife"|"woman"|"pregnant"|"priest", x, y (ground 0..1 H), scale: 0.7,
//   pose, face: "left"|"right", dir, emotion, text, item, beard, to, walk_at, walk_dur: 1.6, at + then,
//   seq: [{at, pose, face, dir, emotion, text}], kneel: true (lowered, skirt pools on the floor), bell: true (priest
//   rings a small gold bell), dirty: cue|true (red-brown specks on the hands; wash: cue fades them), wash: cue}
//
// SHOTS.sem_gate — the hospital front (set "city" | "snow" | "night"): long two-storey facade with rows of windows,
//   a big arched gate in the middle, a gas lamp, snow falling. P: {gy: 0.8, gate: 0.5, sign: "text" | null,
//   glow: 0..1 | cue (windows light up gold), snow: true, lamp: 0.16 | false, cast: [F], labels}
// SHOTS.sem_ward — a maternity ward (set "interior"): iron beds in a row with mothers resting (head on the pillow,
//   blanket), curtains that sway, a door placard. P: {gy: 0.8, beds: 5, x0: 0.08, x1: 0.92, empty: [{i, at}]
//   (bed empties, a candle is lit beside it), split: {x: 0.5, left: "FIRST CLINIC", right: "SECOND CLINIC"} (a wall
//   divides two wards), placard: {text, x} | null, cast: [F], labels}
// SHOTS.sem_corridor — a long hospital corridor: the autopsy-room door on the left, the maternity-ward door on the
//   right; a doctor walks across trailing faint red specks. P: {gy: 0.8, left: "AUTOPSY", right: "MOTHERS",
//   trail: {from: cue, x0: 0.18, x1: 0.8} (dotted footprints + drifting specks), bowl: {x: 0.72, at: cue} (a wash
//   stand by the ward door), cast: [F], labels}
// SHOTS.sem_hands — close-up: two hands in black coat cuffs over a basin. P: {mode: "wash"|"cut", y: 0.5,
//   dirty: true, wash: cue (hands scrub, liquid ripples, specks fade), basin: true, cut: cue (mode cut: a scalpel slides
//   past one finger and leaves a tiny red mark), labels}
// SHOTS.sem_chart — a full-frame ledger page with a hand-drawn line chart (two series drawn left to right).
//   P: {title, xs: ["1841", ...], a: [7.8, ...], b: [3.5, ...] (null = gap), max: 20, names: ["First", "Second"],
//   draw: [start s, dur s], mark: {i, text, at} (vertical red line at x index i), unit: "%", labels}
// SHOTS.sem_scope — a brass microscope beside a big round field of view in which rod-shaped germs wriggle.
//   P: {germs: 14, at: cue (field opens), q: true (question marks instead of germs until `reveal`), reveal: cue,
//   cast: [F], labels}
// SHOTS.sem_desk — a writing desk at night: candle, a thick book, a quill that writes, letters that fly up stamped.
//   P: {book: "1861", letters: [{at, text}], cast: [F], labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const ell = (cx, cy, rx, ry, n = 14) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const FR = 'Fraunces, Georgia, serif';
  const labelsOf = (g, L, W, H, sd) => (window.MCB && L && L.length) ? window.MCB.labels(g, L, W, H, sd) : { update() {} };

  // ------------------------------------------------------------------ figure (KASIF rig + period overlays)
  function fig(parent, F, W, H, sd) {
    const role = F.role || 'kasif', isK = role === 'kasif';
    const g = el(parent, 'g');
    const back = el(g, 'g'), rigG = el(g, 'g'), front = el(g, 'g');
    let clipR = null;
    if (F.kneel) {   // kneeling: the body is lowered and the legs are clipped at the floor line (skirt pools on it)
      const cid = 'semclip' + sd;
      const cp = el(g, 'clipPath', { id: cid }); clipR = el(cp, 'rect', { x: -4000, y: -4000, width: 9000, height: 4000 });
      rigG.setAttribute('clip-path', `url(#${cid})`);
    }
    const sc = F.scale ?? 0.7;
    const rig = KASIF.create(rigG, { scale: sc, hat: isK, accessory: null, beard: isK ? null : (F.beard || null), seed: sd });
    const coatC = role === 'doctor' ? INK.inkSoft : role === 'student' ? INK.paperDark : role === 'priest' ? INK.ink : null;
    const coatF = coatC ? inkEl(back, coatC, { 'fill-opacity': role === 'priest' ? 0.85 : 1 }) : null, coatR = coatC ? inkEl(back) : null;
    const isW = role === 'woman' || role === 'pregnant' || role === 'midwife';
    const skF = isW ? inkEl(front, role === 'midwife' ? INK.blue : INK.paperLight) : null, skR = isW ? inkEl(front) : null;
    const apF = role === 'midwife' ? inkEl(front, INK.paperLight) : null, apR = role === 'midwife' ? inkEl(front) : null;
    const bellyF = null, bellyR = null;
    const shawlF = isW ? inkEl(back, role === 'midwife' ? INK.paperLight : INK.blue) : null, shawlR = isW ? inkEl(back) : null;
    const scarfF = isW ? inkEl(front, role === 'midwife' ? INK.paperLight : INK.blue) : null, scarfR = isW ? inkEl(front) : null;
    const collar = role === 'priest' ? inkEl(front, INK.paperLight) : null;
    const bellF = F.bell ? inkEl(front, INK.gold) : null, bellR = F.bell ? inkEl(front) : null, ding = F.bell ? inkEl(front, INK.inkSoft) : null;
    const dirt = F.dirty != null ? inkEl(front, INK.red) : null;
    const babyF = F.baby ? inkEl(front, INK.paperLight) : null, babyR = F.baby ? inkEl(front) : null, babyH = F.baby ? inkEl(front, INK.paperLight) : null;
    const gait = KASIF.gait('walk');
    return {
      update(lt, t, cues) {
        const face0 = faceOf(F.face, 1);
        const segs = [{ at: -1, pose: F.pose || 'idle', dir: F.dir, face: F.face, emotion: F.emotion, text: F.text, item: F.item }];
        const a = atOr(cues, F.at, null);
        if (F.then && a != null) segs.push({ at: a, pose: F.then, dir: F.dir, face: F.face, emotion: F.emotion, text: F.text, item: F.item });
        (F.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({ text: F.text, item: F.item }, s, { at: sa })); });
        segs.sort((p, q) => p.at - q.at);
        let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
        let s = segs[si], pv = si > 0 ? segs[si - 1] : null, since = lt - Math.max(0, s.at);
        let x = (F.x ?? 0.5) * W, face = faceOf(s.face, face0), pose = s.pose || 'idle', ph = 0;
        if (F.to != null) {
          const wd = F.walk_dur ?? 1.6;
          const arrive = F.walk_at != null ? atOr(cues, F.walk_at, 0) + wd : (a != null ? a : wd);
          const start = Math.max(0, arrive - wd), u = progIO(lt, start, Math.max(0.1, arrive - start));
          const dist = (F.to - F.x) * W;
          x = (F.x + (F.to - F.x) * u) * W;
          if (lt < arrive && lt >= start) { pose = 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
          else if (lt < start) pose = F.pose && F.pose !== 'walk' ? F.pose : 'idle';
          else if (si === 0 && F.pose === 'walk') { pose = F.then || 'idle'; since = lt - arrive; }
        }
        const kneel = F.kneel ? 86 * sc : 0;
        const y = H * (F.y ?? 0.8) + kneel;
        const o = { x, y, face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item, emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o);
        const P = q => [x + face * sc * q[0], y + sc * q[1]];
        const hip = P(r.hip), head = P(r.head), hr = 70 * sc;
        const up = [head[0] - hip[0], head[1] - hip[1]], L = Math.hypot(up[0], up[1]) || 1, nx = -up[1] / L, ny = up[0] / L;
        const along = (k, side) => [hip[0] + up[0] * k + nx * side, hip[1] + up[1] * k + ny * side];
        const gy = y - kneel;
        if (coatF) {
          let pts;
          if (role === 'priest') pts = [along(0.74, -38 * sc), along(0.74, 38 * sc), [hip[0] + 70 * sc, gy - 6], [hip[0] - 70 * sc, gy - 6]];
          else pts = [along(0.74, -38 * sc), along(0.74, 38 * sc), along(-0.42, 50 * sc), along(-0.3, 0), along(-0.42, -50 * sc)];
          coatF.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 0.8 }));
          coatR.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 2, t, closed: true, amp: 0.8 }));
        }
        if (clipR) clipR.setAttribute('height', f1(gy + 4000 + 2));
        if (skF) {
          const fs = face, wb = (F.kneel ? 125 : 92) * sc, preg = role === 'pregnant' ? 1 : 0;
          const sk = [along(0.64, -fs * 26 * sc), along(0.64, fs * 26 * sc), along(0.46, fs * (32 + preg * 34) * sc), along(0.3, fs * (34 + preg * 52) * sc),
            along(0.12, fs * (40 + preg * 30) * sc), [hip[0] + fs * wb, gy - 4], [hip[0] + fs * wb * 0.4, gy + 6], [hip[0] - fs * wb * 0.4, gy + 6],
            [hip[0] - fs * wb, gy - 4], along(0.2, -fs * 38 * sc), along(0.45, -fs * 30 * sc)];
          skF.setAttribute('d', inkLoop(sk, { seed: sd + 3, t, amp: 1 }));
          skR.setAttribute('d', inkPath(sk, { w: 5, seed: sd + 4, t, closed: true, amp: 1 }));
          if (apF) {
            const ap = [along(0.62, -22 * sc), along(0.62, 22 * sc), [hip[0] + face * 10 * sc + 40 * sc, gy - 40 * sc], [hip[0] + face * 10 * sc - 40 * sc, gy - 40 * sc]];
            apF.setAttribute('d', inkLoop(ap, { seed: sd + 5, t, amp: 0.7 }));
            apR.setAttribute('d', inkPath(ap, { w: 3.5, seed: sd + 6, t, closed: true, amp: 0.7 }));
          }
          // shawl: a hood behind the head with a tail down the back (back layer) + a crescent over the crown (front layer)
          const hood = [];
          for (let k = 0; k <= 10; k++) { const ang = Math.PI * (0.85 + k / 10 * 1.3); hood.push([head[0] + Math.cos(ang) * hr * 1.28 * face, head[1] + Math.sin(ang) * hr * 1.22]); }
          const sw = Math.sin(t * 1.3) * 4;
          if (role !== 'midwife') hood.push(along(0.72, fs * 30 * sc), along(0.5, fs * 10 * sc), [along(0.3, -fs * 60 * sc)[0] + sw, along(0.3, -fs * 60 * sc)[1]], along(0.62, -fs * 62 * sc));
          else hood.push(along(0.86, fs * 40 * sc), along(0.86, -fs * 40 * sc));
          shawlF.setAttribute('d', inkLoop(hood, { seed: sd + 9, t, amp: 0.8 }));
          shawlR.setAttribute('d', inkPath(hood, { w: 4, seed: sd + 10, t, closed: true, amp: 0.8 }));
          const cr = [];
          for (let k = 0; k <= 8; k++) { const ang = Math.PI * (1.02 + k / 8 * 0.96); cr.push([head[0] + Math.cos(ang) * hr * 1.08 * face, head[1] + Math.sin(ang) * hr * 1.06]); }
          for (let k = 8; k >= 0; k--) { const ang = Math.PI * (1.08 + k / 8 * 0.84); cr.push([head[0] + Math.cos(ang) * hr * 0.92 * face - face * hr * 0.1, head[1] - hr * 0.22 + Math.sin(ang) * hr * 0.62]); }
          scarfF.setAttribute('d', inkLoop(cr, { seed: sd + 11, t, amp: 0.6 }));
          scarfR.setAttribute('d', inkPath(cr, { w: 4, seed: sd + 12, t, closed: true, amp: 0.6 }));
        }
        if (collar) collar.setAttribute('d', inkLoop(rect(along(0.82, -12 * sc)[0] - 0, along(0.82, 0)[1] - 6 * sc, 24 * sc, 12 * sc), { seed: sd + 11, t, amp: 0.4, smooth: false }));
        const hw = P(r.hands[1]), hl = P(r.hands[0]);
        if (bellF) {
          const sw = Math.sin(lt * 9) * 0.5, bx = hw[0], by = hw[1] + 8 * sc, b = 1.15 * sc;
          const rot = q => { const dx = q[0] - bx, dy = q[1] - by, c = Math.cos(sw), sn = Math.sin(sw); return [bx + dx * c - dy * sn, by + dx * sn + dy * c]; };
          const bp = [[bx - 6 * b, by], [bx - 14 * b, by + 18 * b], [bx - 30 * b, by + 52 * b], [bx + 30 * b, by + 52 * b], [bx + 14 * b, by + 18 * b], [bx + 6 * b, by]].map(rot);
          bellF.setAttribute('d', inkLoop(bp, { seed: sd + 12, t, amp: 0.6 }));
          bellR.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 13, t, closed: true, amp: 0.6 }) + ' ' + inkDot(rot([bx, by + 58 * b])[0], rot([bx, by + 58 * b])[1], 7 * b, 7 * b, sd + 14, t));
          let dd = '';
          const k = (lt * 2.2) % 1;
          for (let q = 0; q < 2; q++) { const rr = (30 + (k + q * 0.5) % 1 * 60) * b; dd += inkPath([[bx + rr * 0.7, by + 20 * b - rr * 0.6], [bx + rr, by + 30 * b], [bx + rr * 0.7, by + 40 * b + rr * 0.6]], { w: 4, seed: sd + 15 + q, t, amp: 0.8 }) + ' '; }
          ding.setAttribute('d', dd);
        }
        if (babyF) {
          const cx = (hw[0] + hl[0]) / 2, cy = (hw[1] + hl[1]) / 2 - 18 * sc, rk = Math.sin(lt * 2.2) * 0.12;
          const bp = ell(cx, cy, 62 * sc, 30 * sc, 12).map(q => [cx + (q[0] - cx) * Math.cos(rk) - (q[1] - cy) * Math.sin(rk), cy + (q[0] - cx) * Math.sin(rk) + (q[1] - cy) * Math.cos(rk)]);
          const hx = cx + face * 54 * sc, hy = cy - 16 * sc + rk * 20;
          babyF.setAttribute('d', inkLoop(bp, { seed: sd + 40, t, amp: 0.6 }));
          babyH.setAttribute('d', inkLoop(ell(hx, hy, 24 * sc, 22 * sc, 10), { seed: sd + 41, t, amp: 0.5 }));
          babyR.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 42, t, closed: true, amp: 0.6 }) + ' ' + inkPath(ell(hx, hy, 24 * sc, 22 * sc, 10), { w: 4, seed: sd + 43, t, closed: true, amp: 0.5 }) + ' ' + inkPath([[cx - 30 * sc, cy - 6 * sc], [cx + 20 * sc, cy + 10 * sc]], { w: 3, seed: sd + 44, t }));
        }
        if (dirt) {
          const wa = atOr(cues, F.wash, null), fade = wa == null ? 0 : prog(lt, wa, 1.2);
          let d = '';
          if (fade < 0.98) [hw, hl].forEach((h, j) => { for (let q = 0; q < 4; q++) { const ang = q * 1.7 + j; d += inkDot(h[0] + Math.cos(ang) * 14 * sc, h[1] + Math.sin(ang) * 12 * sc, 4.5 * sc * (1 - fade), 4.5 * sc * (1 - fade), sd + 30 + j * 5 + q, t, 0.4) + ' '; } });
          dirt.setAttribute('d', d);
        }
        return { x, head, hands: [hl, hw] };
      },
    };
  }
  const castOf = (g, list, W, H, sd) => (list || []).map((F, i) => fig(g, F, W, H, sd + 100 + i * 17));

  // ------------------------------------------------------------------ snow flakes (drifting, deterministic)
  function snowLayer(g, W, H, n, sd) {
    const r = rng(sd + 5), F = Array.from({ length: n }, () => [r(), r(), r()]);
    const e = inkEl(g, INK.paperLight), o = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.5 });
    return {
      update(t) {
        let d = '', d2 = '';
        F.forEach((f, i) => {
          const sp = 40 + f[2] * 60, y = ((f[1] * H + t * sp) % (H + 40)) - 20, x = (f[0] * W + Math.sin(t * 0.8 + i) * 30) % W;
          const rr = 4 + f[2] * 5;
          d += inkDot(x, y, rr, rr, sd + i, t, 0.3) + ' ';
          if (i % 3 === 0) d2 += inkDot(x + 1, y + 1, rr + 1.5, rr + 1.5, sd + 900 + i, t, 0.3) + ' ';
        });
        o.setAttribute('d', d2); e.setAttribute('d', d);
      },
    };
  }

  // ================================================================== sem_gate
  SH.sem_gate = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 311;
      const GY = (P.gy ?? 0.8) * H, gx = (P.gate ?? 0.5) * W;
      const root = el(svg, 'g');
      const bF = inkEl(root, INK.paperLight), bR = inkEl(root), roofF = inkEl(root, INK.inkSoft), roofR = inkEl(root);
      const winF = inkEl(root, INK.paperDark), winG = inkEl(root, INK.gold), winR = inkEl(root);
      const gateF = inkEl(root, INK.ink, { 'fill-opacity': 0.82 }), gateR = inkEl(root), gateBars = inkEl(root, INK.inkSoft);
      const signG = el(root, 'g'), signF = inkEl(signG, INK.paperLight), signR = inkEl(signG);
      const signT = el(signG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 50, 'text-anchor': 'middle', fill: INK.ink });
      signT.textContent = (P.sign || '').toLocaleUpperCase('en-US');
      const lampR = inkEl(root), lampG = inkEl(root, INK.gold), steps = inkEl(root);
      const castG = el(root, 'g'), top = el(root, 'g');
      const cast = castOf(castG, P.cast, W, H, sd);
      const snow = P.snow ? snowLayer(top, W, H, 70, sd + 50) : null;
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      const asy = P.building === 'asylum';
      const bx0 = asy ? W * 0.12 : -30, bx1 = asy ? W * 0.88 : W + 30, btop = GY - (asy ? 400 : 560);
      if (asy) { bF.setAttribute('fill', INK.paperDark); winF.setAttribute('fill', INK.inkSoft); }
      const fence = asy ? inkEl(top, INK.ink) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const bp = rect(bx0, btop, bx1 - bx0, GY - btop);
          bF.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, smooth: false, amp: 1 }));
          bR.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 2, t, closed: true, smooth: false }) + (asy ? '' : ' ' + inkPath([[bx0, btop + 260], [bx1, btop + 262]], { w: 4, seed: sd + 3, t })));
          const rp = [[bx0, btop], [bx1, btop], [bx1 - 40, btop - 70], [bx0 + 40, btop - 70]];
          roofF.setAttribute('d', inkLoop(rp, { seed: sd + 4, t, smooth: false }));
          roofR.setAttribute('d', inkPath(rp, { w: 5, seed: sd + 5, t, closed: true, smooth: false }));
          const gl = typeof P.glow === 'number' ? P.glow : P.glow != null ? prog(lt, atOr(cues, P.glow, 0), 1.2) : 0;
          let wd = '', wg = '', wr = '';
          let k = 0;
          for (let row = 0; row < (asy ? 1 : 2); row++) for (let x = asy ? bx0 + 60 : 60; x < (asy ? bx1 - 100 : W); x += 170) {
            if (Math.abs(x + 45 - gx) < 230) continue;
            const y = btop + 60 + row * 260, p = rect(x, y, 90, 150);
            const lit = asy ? k === (P.lit ?? 5) : gl > 0 && ((k * 7) % 5) / 5 < gl;
            (lit ? (wg += inkLoop(p, { seed: sd + 20 + k, t, smooth: false, amp: 0.8 }) + ' ') : (wd += inkLoop(p, { seed: sd + 20 + k, t, smooth: false, amp: 0.8 }) + ' '));
            wr += inkPath(p, { w: 4, seed: sd + 60 + k, t, closed: true, smooth: false, amp: 0.8 }) + ' ' + inkPath([[x + 45, y], [x + 45, y + 150]], { w: 3, seed: sd + 100 + k, t }) + ' ' + inkPath([[x, y + 75], [x + 90, y + 75]], { w: 3, seed: sd + 140 + k, t }) + ' ';
            k++;
          }
          winF.setAttribute('d', wd); winG.setAttribute('d', wg); winR.setAttribute('d', wr);
          const gw = asy ? 260 : 330, gh = asy ? 320 : 400, ap = [[gx - gw / 2, GY], [gx - gw / 2, GY - gh + gw / 2]];
          for (let q = 0; q <= 12; q++) { const a = Math.PI + q / 12 * Math.PI; ap.push([gx + Math.cos(a) * gw / 2, GY - gh + gw / 2 + Math.sin(a) * gw / 2]); }
          ap.push([gx + gw / 2, GY]);
          gateF.setAttribute('d', inkLoop(ap, { seed: sd + 200, t, amp: 0.8 }));
          gateR.setAttribute('d', inkPath(ap, { w: 8, seed: sd + 201, t, amp: 1 }) + ' ' + inkPath(ap.map(q => [gx + (q[0] - gx) * 1.18, GY - (GY - q[1]) * 1.08]), { w: 5, seed: sd + 202, t, amp: 1 }));
          let bars = '';
          for (let q = -3; q <= 3; q++) bars += inkPath([[gx + q * 42, GY], [gx + q * 42, GY - gh + gw / 2 - Math.sqrt(Math.max(0, (gw / 2) ** 2 - (q * 42) ** 2)) + 20]], { w: 4, seed: sd + 210 + q, t }) + ' ';
          gateBars.setAttribute('d', bars);
          steps.setAttribute('d', inkPath([[gx - gw * 0.7, GY + 18], [gx + gw * 0.7, GY + 18]], { w: 5, seed: sd + 220, t }) + ' ' + inkPath([[gx - gw * 0.85, GY + 40], [gx + gw * 0.85, GY + 40]], { w: 5, seed: sd + 221, t }));
          if (P.sign) {
            const sw = Math.max(380, signT.textContent.length * 33 + 60), sy = GY - gh - 80;
            const sp = rect(gx - sw / 2, sy - 40, sw, 76);
            signF.setAttribute('d', inkLoop(sp, { seed: sd + 230, t, smooth: false }));
            signR.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 231, t, closed: true, smooth: false }));
            signT.setAttribute('x', gx); signT.setAttribute('y', sy + 16);
          }
          if (P.lamp !== false) {
            const lx = (P.lamp ?? 0.16) * W, fl = 1 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13) * 0.05;
            lampR.setAttribute('d', inkPath([[lx, GY + 10], [lx, GY - 420]], { w: 9, seed: sd + 240, t }) + ' ' + inkPath(rect(lx - 34, GY - 500, 68, 80), { w: 6, seed: sd + 241, t, closed: true, smooth: false }) + ' ' + inkPath([[lx - 44, GY - 500], [lx, GY - 540], [lx + 44, GY - 500]], { w: 6, seed: sd + 242, t, smooth: false }));
            lampG.setAttribute('d', inkDot(lx, GY - 460, 22 * fl, 30 * fl, sd + 243, t));
          }
          if (fence) {   // iron railings with spear tips across the front
            let fd = inkPath([[-20, GY - 150], [W + 20, GY - 146]], { w: 6, seed: sd + 300, t }) + ' ' + inkPath([[-20, GY - 30], [W + 20, GY - 28]], { w: 6, seed: sd + 301, t });
            for (let x = 10, q = 0; x < W; x += 46, q++) { const gap = Math.abs(x - gx) < 170; if (gap) continue; fd += ' ' + inkPath([[x, GY + 4], [x, GY - 190]], { w: 5, seed: sd + 310 + q, t }) + ' ' + inkLoop([[x - 9, GY - 186], [x, GY - 214], [x + 9, GY - 186]], { seed: sd + 400 + q, t, smooth: false, amp: 0.5 }); }
            fence.setAttribute('d', fd);
          }
          cast.forEach(c => c.update(lt, t, cues));
          if (snow) snow.update(t);
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_ward
  SH.sem_ward = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 523;
      const GY = (P.gy ?? 0.8) * H;
      const root = el(svg, 'g');
      const wallG = el(root, 'g'), bedG = el(root, 'g'), castG = el(root, 'g'), top = el(root, 'g');
      const n = P.beds ?? 5, x0 = (P.x0 ?? 0.08) * W, x1 = (P.x1 ?? 0.92) * W;
      const SPL = P.split ? Object.assign({ x: 0.5 }, P.split) : null;
      const beam = P.light ? inkEl(wallG, INK.gold, { 'fill-opacity': 0.22 }) : null;
      const curtF = inkEl(wallG, INK.blue, { 'fill-opacity': 0.55 }), curtR = inkEl(wallG);
      const doorF = P.door ? inkEl(wallG, INK.paperLight) : null, doorR = P.door ? inkEl(wallG) : null;
      const wsR = P.bowl ? inkEl(wallG) : null, wsF = P.bowl ? inkEl(wallG, INK.paperLight) : null, wsL = P.bowl ? inkEl(wallG, INK.green, { 'fill-opacity': 0.7 }) : null;
      const splitF = SPL ? inkEl(wallG, INK.paperDark) : null, splitR = SPL ? inkEl(wallG) : null;
      const mkSign = (txt, col) => { const g = el(wallG, 'g'); const f = inkEl(g, col), r = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 48, 'text-anchor': 'middle', fill: INK.paperLight }); tx.textContent = String(txt).toLocaleUpperCase('en-US'); return { g, f, r, tx }; };
      const signs = SPL ? [mkSign(SPL.left || 'FIRST CLINIC', INK.red), mkSign(SPL.right || 'SECOND CLINIC', INK.blue)] : [];
      const plac = P.placard ? mkSign(P.placard.text, INK.red) : null;
      const beds = Array.from({ length: n }, (_, i) => {
        const g = el(bedG, 'g');
        return { g, frame: inkEl(g), mat: inkEl(g, INK.paperLight), matR: inkEl(g), pil: inkEl(g, INK.paperLight), pilR: inkEl(g),
          head: inkEl(g, INK.paperLight), headR: inkEl(g), hair: inkEl(g, INK.inkSoft), blank: inkEl(g, i % 2 ? INK.blue : INK.paperDark), blankR: inkEl(g),
          cand: inkEl(g), flame: inkEl(g, INK.gold) };
      });
      const EMP = {}; (P.empty || []).forEach(e => { EMP[e.i] = e.at; });
      const cast = castOf(castG, P.cast, W, H, sd);
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // curtains hanging at the top edge, swaying
          let cf = '', cr = '';
          for (let q = 0; q < 2; q++) {
            const cx = q ? W - 90 : 90, sw = Math.sin(t * 0.9 + q) * 14;
            const cp = [[cx - 90, -10], [cx + 90, -10], [cx + 70 + sw, GY - 380], [cx + 20 + sw * 1.3, GY - 300], [cx - 40 + sw, GY - 360], [cx - 90 + sw * 0.5, GY - 330]];
            cf += inkLoop(cp, { seed: sd + 1 + q, t, amp: 1 }) + ' '; cr += inkPath(cp, { w: 4, seed: sd + 3 + q, t, closed: true, amp: 1 }) + ' ';
            for (let k = 1; k < 4; k++) cr += inkPath([[cx - 90 + k * 45, 0], [cx - 90 + k * 45 + sw * 0.8, GY - 350]], { w: 3, seed: sd + 10 + q * 5 + k, t }) + ' ';
          }
          curtF.setAttribute('d', cf); curtR.setAttribute('d', cr);
          if (beam) { const k = Math.sin(t * 0.7) * 20; beam.setAttribute('d', inkLoop([[W * 0.55, -10], [W * 0.78, -10], [W * 0.62 + k, GY + 60], [W * 0.18 + k, GY + 60]], { seed: sd + 50, t, amp: 0.5 })); }
          if (doorF) { const dx = P.door.x * W, dp = rect(dx - 110, GY - 430, 220, 430);
            doorF.setAttribute('d', inkLoop(dp, { seed: sd + 51, t, smooth: false }));
            doorR.setAttribute('d', inkPath(dp, { w: 7, seed: sd + 52, t, closed: true, smooth: false }) + ' ' + inkDot(dx - 70, GY - 200, 9, 9, sd + 53, t) + ' ' + inkPath(rect(dx - 80, GY - 400, 160, 150), { w: 3, seed: sd + 54, t, closed: true, smooth: false })); }
          if (wsR) { const bx = P.bowl.x * W, a = atOr(cues, P.bowl.at, 0), sp = spring(lt, a, 0.6), q = v => [bx + (v[0] - bx) * sp, GY - (GY - v[1]) * sp];
            const bp = [[bx - 90, GY - 250], [bx + 90, GY - 250], [bx + 56, GY - 200], [bx - 56, GY - 200]].map(q);
            wsF.setAttribute('d', inkLoop(bp, { seed: sd + 55, t }));
            wsL.setAttribute('d', inkLoop(ell(bx, GY - 250, 86, 12 + Math.sin(t * 3) * 2, 12).map(q), { seed: sd + 56, t }));
            wsR.setAttribute('d', inkPath([[bx - 44, GY], [bx, GY - 220], [bx + 44, GY]].map(q), { w: 7, seed: sd + 57, t, smooth: false }) + ' ' + inkPath(bp, { w: 5, seed: sd + 58, t, closed: true })); }
          if (SPL) {
            const sx = SPL.x * W, wp = rect(sx - 26, -20, 52, GY + 20);
            splitF.setAttribute('d', inkLoop(wp, { seed: sd + 20, t, smooth: false }));
            splitR.setAttribute('d', inkPath(wp, { w: 6, seed: sd + 21, t, closed: true, smooth: false }));
            signs.forEach((s, j) => {
              const cx = j ? (SPL.x * W + x1) / 2 : (x0 + SPL.x * W) / 2 + 90, cy = 240, a = atOr(cues, j ? SPL.at_right : SPL.at_left, 0.2 + j * 0.4), p = spring(lt, a, 0.6);
              const tw = s.tx.getComputedTextLength() + 70, sp = rect(cx - tw / 2, cy - 44, tw, 84);
              s.f.setAttribute('d', inkLoop(sp, { seed: sd + 30 + j, t, smooth: false }));
              s.r.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 32 + j, t, closed: true, smooth: false }));
              s.tx.setAttribute('x', cx); s.tx.setAttribute('y', cy + 16);
              s.g.setAttribute('opacity', clamp01(p * 2)); s.g.setAttribute('transform', `translate(0 ${f1((1 - p) * -40)})`);
            });
          }
          if (plac) {
            const cx = (P.placard.x ?? 0.5) * W, cy = 150, tw = plac.tx.getComputedTextLength() + 70, sp = rect(cx - tw / 2, cy - 44, tw, 84);
            plac.f.setAttribute('d', inkLoop(sp, { seed: sd + 40, t, smooth: false }));
            plac.r.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 41, t, closed: true, smooth: false }));
            plac.tx.setAttribute('x', cx); plac.tx.setAttribute('y', cy + 16);
          }
          // beds
          const step = (x1 - x0) / n, bw = Math.min(330, step * 0.86);
          beds.forEach((b, i) => {
            const cx = x0 + step * (i + 0.5), bt = GY - 150, bs = sd + 100 + i * 23;
            const ea = EMP[i] != null ? atOr(cues, EMP[i], null) : null, ep = ea == null ? 0 : prog(lt, ea, 1.0);
            b.frame.setAttribute('d', inkPath([[cx - bw / 2, GY + 6], [cx - bw / 2, bt - 120]], { w: 7, seed: bs, t }) + ' ' + inkPath([[cx - bw / 2, bt - 110], [cx - bw / 2 + 40, bt - 130], [cx - bw / 2 + 80, bt - 110]], { w: 5, seed: bs + 1, t }) + ' ' +
              inkPath([[cx + bw / 2, GY + 6], [cx + bw / 2, bt - 50]], { w: 7, seed: bs + 2, t }) + ' ' + inkPath([[cx - bw / 2, bt + 40], [cx + bw / 2, bt + 40]], { w: 6, seed: bs + 3, t }));
            const mp = rect(cx - bw / 2 + 4, bt - 14, bw - 8, 54);
            b.mat.setAttribute('d', inkLoop(mp, { seed: bs + 4, t, smooth: false }));
            b.matR.setAttribute('d', inkPath(mp, { w: 4, seed: bs + 5, t, closed: true, smooth: false }));
            const pp = ell(cx - bw / 2 + 62, bt - 30, 50, 22, 12);
            b.pil.setAttribute('d', inkLoop(pp, { seed: bs + 6, t })); b.pilR.setAttribute('d', inkPath(pp, { w: 4, seed: bs + 7, t, closed: true }));
            const breath = Math.sin(t * 1.6 + i * 1.3) * 3 * (1 - ep);
            const hx = cx - bw / 2 + 66, hy = bt - 56;
            const show = 1 - ep;
            b.head.setAttribute('d', show > 0.05 ? inkLoop(ell(hx, hy, 34 * show, 32 * show, 12), { seed: bs + 8, t }) : '');
            b.headR.setAttribute('d', show > 0.05 ? inkPath(ell(hx, hy, 34 * show, 32 * show, 12), { w: 5, seed: bs + 9, t, closed: true }) + ' ' + inkPath([[hx + 6, hy - 2], [hx + 18, hy - 1]], { w: 3.5, seed: bs + 10, t }) : '');
            b.hair.setAttribute('d', show > 0.05 ? inkLoop([[hx - 36 * show, hy], [hx - 30 * show, hy - 24 * show], [hx, hy - 34 * show], [hx + 30 * show, hy - 26 * show], [hx + 10 * show, hy - 16 * show], [hx - 18 * show, hy + 14 * show]], { seed: bs + 11, t }) : '');
            const hump = lerp(46, 6, ep) + breath;
            const bl = [[cx - bw / 2 + 96, bt - 20], [cx - bw / 2 + 140, bt - 20 - hump], [cx + 10, bt - 26 - hump * 0.8], [cx + bw / 2 - 40, bt - 18 - hump * 0.4], [cx + bw / 2 + 6, bt - 6], [cx + bw / 2 + 6, bt + 60], [cx - bw / 2 + 96, bt + 60]];
            b.blank.setAttribute('d', inkLoop(bl, { seed: bs + 12, t, amp: 1 }));
            b.blankR.setAttribute('d', inkPath(bl, { w: 5, seed: bs + 13, t, closed: true, amp: 1 }));
            if (ep > 0.05) {
              const kx = cx + bw / 2 + 30;
              b.cand.setAttribute('d', inkPath(rect(kx - 10, bt - 30, 20, 70), { w: 4, seed: bs + 14, t, closed: true, smooth: false }) + ' ' + inkPath([[kx - 26, bt + 42], [kx + 26, bt + 42]], { w: 5, seed: bs + 15, t }));
              const fl = ep * (1 + Math.sin(t * 9 + i) * 0.12);
              b.flame.setAttribute('d', inkLoop([[kx, bt - 76 * fl], [kx + 10 * fl, bt - 44], [kx, bt - 34], [kx - 10 * fl, bt - 44]], { seed: bs + 16, t, amp: 0.6 }));
            } else { b.cand.setAttribute('d', ''); b.flame.setAttribute('d', ''); }
          });
          cast.forEach(c => c.update(lt, t, cues));
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_corridor
  SH.sem_corridor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 727;
      const GY = (P.gy ?? 0.8) * H;
      const root = el(svg, 'g');
      const floor = inkEl(root, INK.inkSoft), arches = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.9 });
      const doors = [P.left ?? 'AUTOPSY', P.right ?? 'MOTHERS'].map((txt, j) => {
        const g = el(root, 'g');
        return { f: inkEl(g, j ? INK.paperLight : INK.ink, { 'fill-opacity': j ? 1 : 0.8 }), r: inkEl(g), pf: inkEl(g, j ? INK.blue : INK.red), pr: inkEl(g),
          tx: (() => { const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', fill: INK.paperLight }); tx.textContent = String(txt).toLocaleUpperCase('en-US'); return tx; })() };
      });
      const BW = P.bowl ? Object.assign({ x: 0.72 }, P.bowl) : null;
      const stand = BW ? inkEl(root) : null, bowlF = BW ? inkEl(root, INK.paperLight) : null, bowlL = BW ? inkEl(root, INK.green, { 'fill-opacity': 0.7 }) : null;
      const steps = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.7 }), specks = inkEl(root, INK.red, { 'fill-opacity': 0.85 });
      const castG = el(root, 'g'), top = el(root, 'g');
      const cast = castOf(castG, P.cast, W, H, sd);
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      const TR = P.trail ? Object.assign({ x0: 0.18, x1: 0.8 }, P.trail) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // floor tiles in perspective + vaulted arches along the back wall
          let fd = '';
          for (let k = -8; k <= 8; k++) fd += inkPath([[W / 2 + k * 70, GY + 4], [W / 2 + k * 300, H + 40]], { w: 2.5, seed: sd + 1 + k, t, amp: 1 }) + ' ';
          for (let q = 0; q < 3; q++) { const y = GY + 30 + q * q * 40 + q * 30; fd += inkPath([[-20, y], [W + 20, y]], { w: 2.5, seed: sd + 30 + q, t }) + ' '; }
          floor.setAttribute('d', fd);
          let ad = '';
          for (let x = 160; x < W; x += 400) { const ap = []; for (let q = 0; q <= 10; q++) { const a = Math.PI + q / 10 * Math.PI; ap.push([x + Math.cos(a) * 130, 300 + Math.sin(a) * 110]); } ad += inkPath([[x - 130, GY], ...ap, [x + 130, GY]], { w: 5, seed: sd + 50 + x, t }) + ' '; }
          arches.setAttribute('d', ad);
          doors.forEach((d, j) => {
            const DX = P.doors || [0.13, 0.87]; if (DX[j] == null) { d.f.setAttribute('d', ''); d.r.setAttribute('d', ''); d.pf.setAttribute('d', ''); d.pr.setAttribute('d', ''); d.tx.textContent = ''; return; }
            const cx = DX[j] * W, dw = 230, dh = 470, dp = rect(cx - dw / 2, GY - dh, dw, dh);
            d.f.setAttribute('d', inkLoop(dp, { seed: sd + 70 + j, t, smooth: false }));
            d.r.setAttribute('d', inkPath(dp, { w: 7, seed: sd + 72 + j, t, closed: true, smooth: false }) + ' ' + inkDot(cx + (j ? -dw : dw) * 0.36, GY - dh * 0.45, 9, 9, sd + 74 + j, t));
            const tw = d.tx.getComputedTextLength() + 50, py = GY - dh - 70, pp = rect(cx - tw / 2, py - 40, tw, 76);
            d.pf.setAttribute('d', inkLoop(pp, { seed: sd + 76 + j, t, smooth: false })); d.pr.setAttribute('d', inkPath(pp, { w: 5, seed: sd + 78 + j, t, closed: true, smooth: false }));
            d.tx.setAttribute('x', cx); d.tx.setAttribute('y', py + 15);
          });
          if (BW) {
            const a = atOr(cues, BW.at, 0), p = spring(lt, a, 0.6), bx = BW.x * W, s = Math.max(0.01, p);
            const T = q => [bx + (q[0] - bx) * s, GY - (GY - q[1]) * s];
            stand.setAttribute('d', inkPath([[bx - 50, GY], [bx, GY - 260], [bx + 50, GY]].map(T), { w: 7, seed: sd + 90, t, smooth: false }) + ' ' + inkPath([[bx, GY], [bx, GY - 260]].map(T), { w: 7, seed: sd + 91, t }));
            const bp = [[bx - 110, GY - 290], [bx + 110, GY - 290], [bx + 70, GY - 230], [bx - 70, GY - 230]].map(T);
            bowlF.setAttribute('d', inkLoop(bp, { seed: sd + 92, t }));
            bowlL.setAttribute('d', inkLoop(ell(bx, GY - 290, 104, 14 + Math.sin(t * 3) * 2, 12).map(T), { seed: sd + 93, t }));
            stand.setAttribute('d', stand.getAttribute('d') + ' ' + inkPath(bp, { w: 5, seed: sd + 94, t, closed: true }));
          }
          cast.forEach(c => c.update(lt, t, cues));
          if (TR) {
            const a = atOr(cues, TR.from, 0.3), x0 = TR.x0 * W, x1 = TR.x1 * W;
            const walkP = clamp01((lt - a) / Math.max(0.5, TR.dur ?? 3));
            let sdd = '', fdd = '';
            for (let k = 0; k < 14; k++) {
              const u = k / 13; if (u > walkP) break;
              const fx = lerp(x0, x1, u), fy = GY + 26 + (k % 2) * 14;
              fdd += inkLoop(ell(fx, fy, 16, 7, 8), { seed: sd + 200 + k, t, amp: 0.5 }) + ' ';
            }
            for (let k = 0; k < 18; k++) {
              const u = (k / 18 + lt * 0.08) % 1; if (u > walkP) continue;
              const fx = lerp(x0, x1, u) + Math.sin(k * 3.1 + t) * 20, fy = GY - 300 + Math.sin(k * 1.7 + t * 1.3) * 40 - (walkP - u) * 60;
              sdd += inkDot(fx, fy, 6, 6, sd + 300 + k, t, 0.5) + ' ';
            }
            steps.setAttribute('d', fdd); specks.setAttribute('d', sdd);
          }
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_hands
  function hand(g, sd) {
    const cuff = inkEl(g, INK.ink), cuffW = inkEl(g, INK.paperLight), fInk = inkEl(g, INK.ink), palmF = inkEl(g, INK.paperLight), palmR = inkEl(g), fFill = inkEl(g, INK.paperLight), crease = inkEl(g, INK.inkSoft);
    return {
      update(t, cx, cy, s, flip, curl = 0) {
        const F = q => [cx + q[0] * s * flip, cy + q[1] * s];
        // back of the hand seen from the side: palm block, four separate fingers (outlined capsules) and a thumb
        const palm = [[-110, -46], [10, -62], [100, -58], [118, -30], [116, 20], [90, 50], [-20, 58], [-110, 44]].map(F);
        const fingers = [0, 1, 2, 3].map(k => { const y0 = -44 + k * 26, len = 128 - k * 12 - curl * 30, bend = curl * 26 + k * 3;
          return [F([96, y0]), F([96 + len * 0.55, y0 - 2 + bend * 0.3]), F([96 + len, y0 + 4 + bend])]; });
        const thumb = [F([30, -50]), F([84, -88]), F([138, -96])];
        let fi = '', ff = '';
        fingers.concat([thumb]).forEach((f, k) => { fi += inkPath(f, { w: 32 * s, seed: sd + 10 + k, t, amp: 0.6, taper: 0.05 }) + ' '; ff += inkPath(f, { w: 20 * s, seed: sd + 20 + k, t, amp: 0.6, taper: 0.05 }) + ' '; });
        fInk.setAttribute('d', fi); fFill.setAttribute('d', ff);
        palmF.setAttribute('d', inkLoop(palm, { seed: sd + 1, t, amp: 0.8 }));
        palmR.setAttribute('d', inkPath(palm, { w: 5.5, seed: sd + 2, t, closed: true, amp: 0.8 }));
        let cd = '';
        fingers.forEach((f, k) => { const m = f[1]; cd += inkPath([[m[0] - 4 * s * flip, m[1] - 8 * s], [m[0] + 2 * s * flip, m[1] + 8 * s]], { w: 3, seed: sd + 40 + k, t, amp: 0.4 }) + ' '; });
        crease.setAttribute('d', cd);
        const cp = [[-270, -72], [-110, -64], [-110, 64], [-270, 72]].map(F);
        cuff.setAttribute('d', inkLoop(cp, { seed: sd + 3, t, smooth: false }));
        cuffW.setAttribute('d', inkLoop([[-132, -62], [-104, -60], [-104, 60], [-132, 62]].map(F), { seed: sd + 4, t, smooth: false }));
        return { tip: F([230, -40]), mid: F([20, -6]) };
      },
    };
  }
  SH.sem_hands = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 919;
      const mode = P.mode || 'wash', cy = (P.y ?? 0.48) * H;
      const root = el(svg, 'g');
      const basinB = inkEl(root, INK.paperLight), liquid = inkEl(root, INK.green, { 'fill-opacity': 0.55 }), basinR = inkEl(root), ripples = inkEl(root, INK.inkSoft);
      const hg = el(root, 'g');
      const hL = hand(el(hg, 'g'), sd + 10), hR = hand(el(hg, 'g'), sd + 40);
      const dirt = inkEl(root, INK.red, { 'fill-opacity': 0.95 }), bubbles = inkEl(root, INK.paperLight), bubR = inkEl(root, INK.inkSoft);
      const blade = inkEl(root, INK.paperLight), bladeR = inkEl(root), handle = inkEl(root, INK.inkSoft), nick = inkEl(root, INK.red);
      const top = el(root, 'g');
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      const r = rng(sd + 3), D = Array.from({ length: P.stains ?? 16 }, () => [r() * 2 - 1, r() * 2 - 1, 0.6 + r()]), SS = P.stain_size ?? 7;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const wa = atOr(cues, P.wash, null), wp = wa == null ? 0 : clamp01((lt - wa) / 2.4);
          const sc = P.hand_s ?? (mode === 'cut' ? 1.6 : 1.25);
          const by = cy + 260;
          if (P.basin !== false && mode !== 'cut') {
            const bp = [[W * 0.22, by - 40], [W * 0.78, by - 40], [W * 0.7, H + 40], [W * 0.3, H + 40]];
            basinB.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, smooth: false }));
            liquid.setAttribute('d', inkLoop(ell(W / 2, by - 40, W * 0.28, 46 + Math.sin(t * 2) * 3, 16), { seed: sd + 2, t }));
            basinR.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(ell(W / 2, by - 40, W * 0.28, 46, 16), { w: 6, seed: sd + 4, t, closed: true }));
            let rd = '';
            for (let q = 0; q < 3; q++) { const k = (lt * 0.6 + q / 3) % 1, rr = 60 + k * 300; rd += inkPath(ell(W / 2, by - 40, rr, rr * 0.12, 16), { w: 3 * (1 - k) + 0.5, seed: sd + 5 + q, t, closed: true }) + ' '; }
            ripples.setAttribute('d', rd);
          }
          let L, R;
          if (mode === 'cut') {
            L = hL.update(t, W * 0.36, cy + Math.sin(t * 1.1) * 6, sc, 1, 0.1);
            hR.update(t, -9999, -9999, 0.01, 1);
            const ca = atOr(cues, P.cut, dur * 0.4), cp = prog(lt, ca - 0.6, 0.8);
            const tip = L.tip, sx = lerp(W * 0.92, tip[0] + 20, cp), sy = lerp(cy - 280, tip[1] - 10, cp);
            const bl = [[sx, sy], [sx + 140, sy - 40], [sx + 150, sy - 20], [sx + 20, sy + 12]];
            blade.setAttribute('d', inkLoop(bl, { seed: sd + 60, t, smooth: false }));
            bladeR.setAttribute('d', inkPath(bl, { w: 4, seed: sd + 61, t, closed: true, smooth: false }));
            handle.setAttribute('d', inkLoop([[sx + 140, sy - 40], [sx + 330, sy - 90], [sx + 340, sy - 64], [sx + 150, sy - 20]], { seed: sd + 62, t, smooth: false }));
            const np = prog(lt, ca, 0.5);
            nick.setAttribute('d', np > 0.02 ? inkPath([[tip[0] - 40, tip[1] + 2], [tip[0] - 40 + 50 * np, tip[1] - 6]], { w: 7, seed: sd + 63, t }) + ' ' + (np > 0.8 ? inkDot(tip[0] - 14, tip[1] + 14 + (lt - ca) * 6, 7, 9, sd + 64, t) : '') : '');
          } else {
            const rub = wp > 0 && wp < 1 ? Math.sin((lt - wa) * 9) : 0, dip = wa == null ? 0 : progIO(lt, wa - 0.2, 0.6) * 90;
            L = hL.update(t, W / 2 - (P.one ? 120 : 330) + rub * 30, cy + dip + Math.sin(t * 1.2) * 5, sc, 1, 0.15);
            R = P.one ? hR.update(t, -9999, -9999, 0.01, -1) : hR.update(t, W / 2 + 330 - rub * 30, cy + 30 + dip + Math.sin(t * 1.3 + 1) * 5, sc, -1, 0.15);
            if (P.one) R = L;
            let dd = '';
            if (P.dirty !== false && wp < 1) D.forEach((d, i) => { const h = i % 2 ? R : L, rr = SS * d[2] * (1 - wp); if (rr > 0.5) dd += inkDot(h.mid[0] + d[0] * 110 * sc, h.mid[1] + d[1] * 40 * sc, rr * 1.2, rr, sd + 80 + i, t, 0.5) + ' '; });
            dirt.setAttribute('d', dd);
            let bd = '', br = '';
            if (wa != null && lt > wa) for (let k = 0; k < 10; k++) { const u = ((lt - wa) * 0.7 + k / 10) % 1, bx = W / 2 + Math.sin(k * 2.3) * 240, byy = by - 50 - u * 300, rr = 10 + (k % 3) * 6; bd += inkDot(bx, byy, rr, rr, sd + 100 + k, t, 0.4) + ' '; br += inkPath(ell(bx, byy, rr, rr, 8), { w: 3, seed: sd + 120 + k, t, closed: true }) + ' '; }
            bubbles.setAttribute('d', bd); bubR.setAttribute('d', br);
          }
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_chart
  SH.sem_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 131;
      const root = el(svg, 'g');
      const page = inkEl(root, INK.paperLight), pageR = inkEl(root), rules = inkEl(root, INK.blue, { 'fill-opacity': 0.35 });
      const axes = inkEl(root), lineA = inkEl(root, INK.red), lineB = inkEl(root, INK.blue), dots = inkEl(root, INK.ink), mark = inkEl(root, INK.red);
      const tg = el(root, 'g');
      const xs = P.xs || [], A = P.a || [], B = P.b || [], max = P.max ?? 20;
      const X0 = 300, X1 = W - 230, Y0 = 820, Y1 = 250;
      const tt = el(tg, 'text', { x: W - 150, y: 190, 'font-family': FR, 'font-weight': 900, 'font-size': 66, 'text-anchor': 'end', fill: INK.ink }); tt.textContent = P.title || '';
      const xl = xs.map((s, i) => { const e = el(tg, 'text', { x: X0 + (X1 - X0) * (xs.length > 1 ? i / (xs.length - 1) : 0.5), y: Y0 + 66, 'font-family': INK_FONT, 'font-size': 48, 'text-anchor': 'middle', fill: INK.inkSoft }); e.textContent = s; return e; });
      const yl = [0, 0.5, 1].map(k => { const e = el(tg, 'text', { x: X0 - 30, y: Y0 - (Y0 - Y1) * k + 16, 'font-family': INK_FONT, 'font-size': 48, 'text-anchor': 'end', fill: INK.inkSoft }); e.textContent = Math.round(max * k) + (P.unit ?? '%'); return e; });
      const names = (P.names || []).map((s, j) => { const e = el(tg, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 52, 'text-anchor': 'end', fill: j ? INK.blue : INK.red }); e.textContent = s; return e; });
      const mk = P.mark ? (() => { const e = el(tg, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 54, 'text-anchor': 'middle', fill: INK.red }); e.textContent = P.mark.text || ''; return e; })() : null;
      const vals = [A, B].map((V, j) => V.map(v => { if (v == null) return null; const e = el(tg, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 48, 'text-anchor': 'middle', fill: j ? INK.blue : INK.red }); e.textContent = (Math.round(v * 10) / 10).toFixed(1) + (P.unit ?? '%'); return e; }));
      const labels = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      const px = i => X0 + (X1 - X0) * (xs.length > 1 ? i / (xs.length - 1) : 0.5), py = v => Y0 - (Y0 - Y1) * Math.min(1, v / max);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const pg = [[90, 70], [W - 90, 62], [W - 80, H - 60], [96, H - 50]];
          page.setAttribute('d', inkLoop(pg, { seed: sd + 1, t, smooth: false }));
          pageR.setAttribute('d', inkPath(pg, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
          let rd = ''; for (let y = 250; y < H - 80; y += 70) rd += inkPath([[120, y], [W - 120, y]], { w: 2, seed: sd + 10 + y, t, amp: 0.8 }) + ' ';
          rules.setAttribute('d', rd);
          axes.setAttribute('d', inkPath([[X0, Y1 - 30], [X0, Y0], [X1 + 40, Y0]], { w: 6, seed: sd + 3, t, smooth: false }));
          const [d0, dd] = P.draw || [0.3, Math.max(1.5, dur * 0.6)];
          const p = clamp01((lt - atOr(cues, d0, 0.3)) / dd), upto = p * (xs.length - 1);
          const series = (V, seedOff) => {
            const pts = []; let out = '', dot = '';
            for (let i = 0; i < V.length; i++) {
              if (V[i] == null) { if (pts.length > 1) out += inkPath(pts.slice(), { w: 9, seed: sd + seedOff + i, t, smooth: false }) + ' '; pts.length = 0; continue; }
              if (i > upto + 1e-6) { if (i - 1 >= 0 && V[i - 1] != null && pts.length) { const f = upto - (i - 1); pts.push([lerp(px(i - 1), px(i), f), lerp(py(V[i - 1]), py(V[i]), f)]); } break; }
              pts.push([px(i), py(V[i])]); dot += inkDot(px(i), py(V[i]), 11, 11, sd + seedOff + 50 + i, t) + ' ';
            }
            if (pts.length > 1) out += inkPath(pts, { w: 9, seed: sd + seedOff + 99, t, smooth: false });
            return [out, dot];
          };
          const [la, da] = series(A, 100), [lb, db] = series(B, 200);
          lineA.setAttribute('d', la); lineB.setAttribute('d', lb); dots.setAttribute('d', da + db);
          vals.forEach((row, j) => row.forEach((e, i) => { if (!e) return; const V = j ? B : A, on = i <= upto + 1e-6; e.setAttribute('opacity', on ? 1 : 0); e.setAttribute('x', px(i) + (i === 0 ? 70 : 0)); e.setAttribute('y', py(V[i]) - 28 - (i === 0 ? -20 : 0)); }));
          names.forEach((e, j) => { const V = j ? B : A; let li = -1; for (let i = 0; i < V.length && i <= upto; i++) if (V[i] != null) li = i; e.setAttribute('opacity', li >= 0 ? 1 : 0); if (li >= 0) { e.setAttribute('x', px(li) - 10); e.setAttribute('y', py(V[li]) + (j ? 64 : -34)); } });
          if (P.mark) {
            const ma = atOr(cues, P.mark.at, dur * 0.6), mp = prog(lt, ma, 0.6), mx = px(P.mark.i ?? 0);
            mark.setAttribute('d', mp > 0.01 ? inkPath([[mx, Y0], [mx, lerp(Y0, Y1 - 10, mp)]], { w: 7, seed: sd + 300, t }) : '');
            mk.setAttribute('x', mx + 24); mk.setAttribute('y', Y1 + 60); mk.setAttribute('text-anchor', 'start'); mk.setAttribute('opacity', clamp01(mp * 2));
          }
          tg.setAttribute('transform', `translate(${f1(Math.sin(t * 0.5) * 3)} ${f1(Math.cos(t * 0.4) * 2)})`);
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_scope
  SH.sem_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 241;
      const root = el(svg, 'g');
      const brass = inkEl(root, INK.paperLight), brassR = inkEl(root), rings = inkEl(root, INK.gold), lensBeam = inkEl(root, INK.gold, { 'fill-opacity': 0.25 });
      const fieldF = inkEl(root, INK.paperLight), fieldR = inkEl(root), germs = inkEl(root, INK.red, { 'fill-opacity': 0.85 }), germR = inkEl(root);
      const qg = el(root, 'g');
      const castG = el(root, 'g'), top = el(root, 'g');
      const cast = castOf(castG, P.cast, W, H, sd);
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      const n = P.germs ?? 14, r = rng(sd + 9), G = Array.from({ length: n }, () => [r() * 2 - 1, r() * 2 - 1, r() * 6.28, 0.7 + r() * 0.6]);
      const QS = [0, 1, 2].map(i => { const e = el(qg, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.inkSoft }); e.textContent = '?'; return e; });
      const sx = (P.scope_x ?? 0.24) * W, GY = 0.8 * H, fx = (P.field_x ?? 0.62) * W, fy = 0.44 * H, fr = 300;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // microscope (side view): horseshoe foot, pillar, curved arm, stage with a slide, mirror below, body tube with
          // an eyepiece on top and an objective over the stage, focus knob. Paper fill, ink outline, brass rings in gold.
          const foot = [[sx - 150, GY], [sx + 130, GY], [sx + 110, GY - 40], [sx - 130, GY - 40]];
          const pillar = [[sx + 10, GY - 40], [sx + 60, GY - 40], [sx + 60, GY - 170], [sx + 10, GY - 170]];
          const arm = [[sx + 30, GY - 170], [sx + 90, GY - 230], [sx + 110, GY - 360], [sx + 70, GY - 470], [sx + 30, GY - 460], [sx + 64, GY - 360], [sx + 50, GY - 240], [sx + 10, GY - 190]];
          const stage = [[sx - 130, GY - 236], [sx + 70, GY - 236], [sx + 70, GY - 212], [sx - 130, GY - 212]];
          const tube = [[sx - 70, GY - 300], [sx - 10, GY - 300], [sx + 30, GY - 560], [sx - 30, GY - 560]];
          const eye = [[sx - 30, GY - 560], [sx + 30, GY - 560], [sx + 26, GY - 630], [sx - 24, GY - 630]];
          const obj = [[sx - 62, GY - 300], [sx - 18, GY - 300], [sx - 26, GY - 262], [sx - 54, GY - 262]];
          const parts = [foot, pillar, arm, stage, tube, eye, obj];
          brass.setAttribute('fill', INK.paperLight);
          brass.setAttribute('d', parts.map((q, k) => inkLoop(q, { seed: sd + 1 + k, t, smooth: k === 2, amp: 0.8 })).join(' '));
          const mirror = ell(sx - 30, GY - 130, 40, 16, 12);
          brassR.setAttribute('d', parts.map((q, k) => inkPath(q, { w: 6, seed: sd + 20 + k, t, closed: true, smooth: k === 2, amp: 0.8 })).join(' ') + ' ' +
            inkPath(mirror, { w: 5, seed: sd + 30, t, closed: true }) + ' ' + inkPath([[sx - 30, GY - 146], [sx + 10, GY - 150]], { w: 5, seed: sd + 31, t }) + ' ' +
            inkPath(ell(sx + 92, GY - 300, 26, 26, 10), { w: 5, seed: sd + 32, t, closed: true }) + ' ' + inkPath([[sx - 100, GY - 244], [sx + 30, GY - 244]], { w: 4, seed: sd + 33, t }));
          lensBeam.setAttribute('d', '');
          rings.setAttribute('d', [[GY - 300, 0], [GY - 420, 0.5], [GY - 560, 0.9]].map(([y, k], j) => inkPath([[lerp(sx - 70, sx - 30, k) - 6, y], [lerp(sx - 10, sx + 30, k) + 6, y]], { w: 9, seed: sd + 40 + j, t })).join(' '));
          const a = atOr(cues, P.at, 0.2), op = spring(lt, a, 0.7), R = fr * Math.max(0.01, op);
          lensBeam.setAttribute('d', op > 0.05 ? inkLoop([[sx + 20, GY - 640], [fx - R * 0.75, fy - R * 0.6], [fx - R * 0.75, fy + R * 0.6], [sx + 30, GY - 610]], { seed: sd + 8, t }) : '');
          fieldF.setAttribute('d', inkLoop(ell(fx, fy, R, R, 24), { seed: sd + 9, t }));
          fieldR.setAttribute('d', inkPath(ell(fx, fy, R, R, 24), { w: 10, seed: sd + 10, t, closed: true }) + ' ' + inkPath(ell(fx, fy, R + 22, R + 22, 24), { w: 5, seed: sd + 11, t, closed: true }));
          const rv = P.q ? atOr(cues, P.reveal, 1e9) : -1, gp = prog(lt, rv, 0.8);
          let gd = '', gr = '';
          if (op > 0.5 && gp > 0) G.forEach((g, i) => {
            const cx = fx + (g[0] * 0.7 + Math.sin(t * 0.6 + i) * 0.05) * R, cy = fy + (g[1] * 0.7 + Math.cos(t * 0.5 + i) * 0.05) * R, ang = g[2] + Math.sin(t * 2 + i) * 0.4, L = 40 * g[3] * gp;
            const pts = []; for (let k = 0; k <= 4; k++) { const u = k / 4 - 0.5; pts.push([cx + Math.cos(ang) * L * u * 2 + Math.sin(t * 6 + i + k) * 4, cy + Math.sin(ang) * L * u * 2 + Math.cos(t * 6 + i + k) * 4]); }
            gd += inkPath(pts, { w: 16 * gp, seed: sd + 50 + i, t, amp: 0.6, taper: 0 }) + ' ';
          });
          germs.setAttribute('d', gd); germR.setAttribute('d', gr);
          QS.forEach((e, i) => { const qa = P.q ? clamp01(op * 2) * (1 - gp) : 0; e.setAttribute('opacity', qa); e.setAttribute('x', fx + (i - 1) * 160); e.setAttribute('y', fy + 40 + Math.sin(t * 2 + i * 2) * 14); });
          cast.forEach(c => c.update(lt, t, cues));
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== sem_desk
  SH.sem_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 653;
      const GY = 0.62 * H;
      const root = el(svg, 'g');
      const desk = inkEl(root, INK.inkSoft), deskR = inkEl(root), book = inkEl(root, INK.red), bookP = inkEl(root, INK.paperLight), bookR = inkEl(root);
      const bookT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.paperLight }); bookT.textContent = P.book || '';
      const cand = inkEl(root, INK.paperLight), candR = inkEl(root), flame = inkEl(root, INK.gold), quill = inkEl(root, INK.paperLight), quillR = inkEl(root), scrib = inkEl(root);
      const castG = el(root, 'g'), letG = el(root, 'g'), top = el(root, 'g');
      const cast = castOf(castG, P.cast, W, H, sd);
      const lets = (P.letters || []).map((L, i) => { const g = el(letG, 'g'); const f = inkEl(g, INK.paperLight), r = inkEl(g), s = inkEl(g, INK.red); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', fill: INK.red }); tx.textContent = (L.text || '').toLocaleUpperCase('en-US'); return { L, g, f, r, s, tx, i }; });
      const labels = labelsOf(top, P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const dp = [[-30, GY], [W + 30, GY], [W + 30, GY + 46], [-30, GY + 46]];
          desk.setAttribute('d', inkLoop(dp, { seed: sd + 1, t, smooth: false }));
          deskR.setAttribute('d', inkPath(dp, { w: 6, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[260, GY + 46], [250, H + 30]], { w: 14, seed: sd + 3, t }) + ' ' + inkPath([[W - 260, GY + 46], [W - 250, H + 30]], { w: 14, seed: sd + 4, t }));
          const bx = W * 0.4, bkp = [[bx - 220, GY], [bx + 220, GY], [bx + 230, GY - 120], [bx - 210, GY - 120]];
          book.setAttribute('d', inkLoop(bkp, { seed: sd + 5, t, smooth: false }));
          bookP.setAttribute('d', inkLoop([[bx - 210, GY - 8], [bx + 220, GY - 8], [bx + 222, GY - 30], [bx - 208, GY - 30]], { seed: sd + 6, t, smooth: false }));
          bookR.setAttribute('d', inkPath(bkp, { w: 6, seed: sd + 7, t, closed: true, smooth: false }));
          bookT.setAttribute('x', bx); bookT.setAttribute('y', GY - 46);
          const kx = W * 0.1, fl = 1 + Math.sin(t * 8) * 0.1 + Math.sin(t * 13) * 0.06;
          const cp = rect(kx - 22, GY - 170, 44, 170);
          cand.setAttribute('d', inkLoop(cp, { seed: sd + 8, t, smooth: false })); candR.setAttribute('d', inkPath(cp, { w: 5, seed: sd + 9, t, closed: true, smooth: false }));
          flame.setAttribute('d', inkLoop([[kx + Math.sin(t * 5) * 4, GY - 250 * 1 - 20 * fl], [kx + 16 * fl, GY - 200], [kx, GY - 178], [kx - 16 * fl, GY - 200]], { seed: sd + 10, t, amp: 0.6 }));
          // quill writing on a sheet to the right of the book
          const qx = W * 0.66 + Math.sin(lt * 6) * 40, qy = GY - 10 + Math.cos(lt * 11) * 6;
          const qp = [[qx, qy], [qx + 60, qy - 150], [qx + 120, qy - 260], [qx + 70, qy - 150]];
          quill.setAttribute('d', inkLoop(qp, { seed: sd + 11, t })); quillR.setAttribute('d', inkPath(qp, { w: 4, seed: sd + 12, t, closed: true }) + ' ' + inkPath([[qx, qy], [qx + 120, qy - 260]], { w: 3, seed: sd + 13, t }));
          let sdd = inkPath([[W * 0.54, GY - 4], [W * 0.82, GY - 8]], { w: 4, seed: sd + 14, t });
          scrib.setAttribute('d', sdd);
          lets.forEach(({ L, g, f, r, s, tx, i }) => {
            const a = atOr(cues, L.at, 0.5 + i * 0.6);
            if (lt < a) { g.style.display = 'none'; return; }
            g.style.display = '';
            const u = prog(lt, a, 1.2), x = lerp(W * 0.68, W * (0.42 + i * 0.22), u), y = lerp(GY - 20, H * 0.27 + (i % 2) * 70, u) + Math.sin(t * 2 + i) * 8, rot = lerp(0, (i % 2 ? 6 : -6), u);
            g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`);
            const lp = rect(-170, -90, 340, 180);
            f.setAttribute('d', inkLoop(lp, { seed: sd + 30 + i, t, smooth: false })); r.setAttribute('d', inkPath(lp, { w: 4, seed: sd + 31 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[-130, 50], [120, 50]], { w: 3, seed: sd + 32 + i, t }));
            s.setAttribute('d', inkPath(rect(-150, -40, 300, 70), { w: 6, seed: sd + 33 + i, t, closed: true, smooth: false }));
            tx.setAttribute('x', 0); tx.setAttribute('y', 12);
          });
          cast.forEach(c => c.update(lt, t, cues));
          labels.update(lt, t, cues);
        },
      };
    },
  };
  // ================================================================== sem_notes
  // SHOTS.sem_notes — a big case-notes sheet pinned to the ward wall (fills the frame), a desk edge with an inkwell and a
  //   candle in front. P: {title, cols: [{title, items: [{text, mark: "check"|"x"|null, at}], bars: [{label, text, value 0..1,
  //   color: "red"|"blue", at}]}] (1-2 columns), pill: {text, color, at}}
  SH.sem_notes = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 877;
      const COL = { red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, ink: INK.ink };
      const LO = 'Lora, Georgia, serif';
      const root = el(svg, 'g');
      const sheet = inkEl(root, INK.paperLight), sheetR = inkEl(root), pins = inkEl(root, INK.red), lines = inkEl(root, INK.blue, { 'fill-opacity': 0.3 });
      const tg = el(root, 'g'), desk = inkEl(root, INK.inkSoft), deskR = inkEl(root), well = inkEl(root, INK.ink), cand = inkEl(root, INK.paperLight), candR = inkEl(root), flame = inkEl(root, INK.gold);
      const X0 = 330, X1 = W - 120, Y0 = 70, Y1 = 850;
      const tt = el(tg, 'text', { x: X1 - 60, y: 175, 'font-family': FR, 'font-weight': 900, 'font-size': 84, 'text-anchor': 'end', fill: INK.ink }); tt.textContent = P.title || '';
      const cols = (P.cols || []).slice(0, 2), n = Math.max(1, cols.length), cw = (X1 - X0 - 80 - (n - 1) * 60) / n;
      const rows = [];
      cols.forEach((c, j) => {
        const x = X0 + 40 + j * (cw + 60);
        if (c.title) { const e = el(tg, 'text', { x, y: 320, 'font-family': FR, 'font-weight': 800, 'font-size': 72, 'text-anchor': 'start', fill: INK.blue }); e.textContent = c.title; }
        let y = c.title ? 440 : 360;
        (c.items || []).forEach((it, k) => {
          const g = el(tg, 'g'), box = inkEl(g, INK.paper), boxR = inkEl(g, INK.inkSoft), mk = inkEl(g, it.mark === 'x' ? INK.red : INK.blue);
          const e = el(g, 'text', { x: x + 100, y: y + 20, 'font-family': LO, 'font-weight': 700, 'font-size': 70, 'text-anchor': 'start', fill: it.mark === 'x' ? INK.inkSoft : INK.ink }); e.textContent = it.text;
          rows.push({ it, g, box, boxR, mk, x, y, k: rows.length }); y += 116;
        });
        (c.bars || []).forEach((b, k) => {
          const g = el(tg, 'g'), track = inkEl(g, INK.paperDark), trackR = inkEl(g), fill = inkEl(g, COL[b.color] || INK.blue);
          const e = el(g, 'text', { x, y: y, 'font-family': LO, 'font-weight': 700, 'font-size': 60, 'text-anchor': 'start', fill: INK.ink }); e.textContent = b.label || '';
          const v = el(g, 'text', { x: x + cw, y: y, 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'end', fill: COL[b.color] || INK.blue }); v.textContent = b.text || '';
          rows.push({ bar: b, g, track, trackR, fill, x, y: y + 50, w: cw, k: rows.length }); y += 230;
        });
      });
      const pill = P.pill ? (() => { const g = el(tg, 'g'), f = inkEl(g, COL[P.pill.color] || INK.red), r = inkEl(g); const e = el(g, 'text', { x: (X0 + X1) / 2, y: 803, 'font-family': FR, 'font-weight': 800, 'font-size': 64, 'text-anchor': 'middle', fill: INK.paperLight }); e.textContent = P.pill.text; return { g, f, r, e }; })() : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const sp = [[X0, Y0], [X1, Y0 + 8], [X1 - 6, Y1], [X0 + 8, Y1 - 6]];
          sheet.setAttribute('d', inkLoop(sp, { seed: sd + 1, t, smooth: false }));
          sheetR.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
          pins.setAttribute('d', inkDot(X0 + 140, Y0 + 30, 14, 14, sd + 3, t) + ' ' + inkDot(X1 - 40, Y0 + 36, 14, 14, sd + 4, t));
          let ld = ''; for (let y = 380; y < Y1 - 20; y += 116) ld += inkPath([[X0 + 30, y + 44], [X1 - 30, y + 46]], { w: 2, seed: sd + 10 + y, t, amp: 0.6 }) + ' ';
          lines.setAttribute('d', ld);
          const dp = [[-30, 900], [W + 30, 890], [W + 30, H + 30], [-30, H + 30]];
          desk.setAttribute('d', inkLoop(dp, { seed: sd + 5, t, smooth: false }));
          deskR.setAttribute('d', inkPath([[-30, 900], [W + 30, 890]], { w: 7, seed: sd + 6, t }));
          well.setAttribute('d', inkLoop([[W - 330, 900], [W - 250, 900], [W - 262, 840], [W - 318, 840]], { seed: sd + 7, t, smooth: false }) + ' ' + inkPath([[W - 290, 840], [W - 230, 700]], { w: 5, seed: sd + 8, t }));
          const cx = 180, fl = 1 + Math.sin(t * 8) * 0.1;
          cand.setAttribute('d', inkLoop(rect(cx - 20, 760, 40, 140), { seed: sd + 9, t, smooth: false })); candR.setAttribute('d', inkPath(rect(cx - 20, 760, 40, 140), { w: 5, seed: sd + 10, t, closed: true, smooth: false }));
          flame.setAttribute('d', inkLoop([[cx + Math.sin(t * 5) * 4, 760 - 64 * fl], [cx + 14 * fl, 734], [cx, 756], [cx - 14 * fl, 734]], { seed: sd + 11, t, amp: 0.5 }));
          const span = Math.max(0.6, dur - 1.6) / Math.max(1, rows.length);
          rows.forEach(r => {
            const a = atOr(cues, (r.it || r.bar).at, 0.25 + r.k * span), p = spring(lt, a, 0.55);
            r.g.setAttribute('opacity', clamp01(lin(lt, a, 0.15))); r.g.setAttribute('transform', `translate(${f1((1 - p) * -40)} 0)`);
            if (r.it) {
              const b = rect(r.x, r.y - 30, 60, 60);
              r.box.setAttribute('d', inkLoop(b, { seed: sd + 50 + r.k, t, smooth: false })); r.boxR.setAttribute('d', inkPath(b, { w: 4, seed: sd + 60 + r.k, t, closed: true, smooth: false }));
              const mp = prog(lt, a + 0.15, 0.3);
              if (r.it.mark === 'check') r.mk.setAttribute('d', mp > 0.02 ? inkPath([[r.x + 6, r.y], [r.x + 26, r.y + 24], [r.x + 6 + 70 * mp, r.y - 40 * mp]], { w: 11, seed: sd + 70 + r.k, t, smooth: false }) : '');
              else if (r.it.mark === 'x') r.mk.setAttribute('d', mp > 0.02 ? inkPath([[r.x + 2, r.y - 28], [r.x + 2 + 58 * mp, r.y - 28 + 58 * mp]], { w: 11, seed: sd + 70 + r.k, t }) + ' ' + (mp > 0.5 ? inkPath([[r.x + 60, r.y - 28], [r.x + 2, r.y + 30]], { w: 11, seed: sd + 80 + r.k, t }) : '') : '');
              else r.mk.setAttribute('d', inkDot(r.x + 30, r.y, 10, 10, sd + 70 + r.k, t));
            } else {
              const tp = rect(r.x, r.y, r.w, 110);
              r.track.setAttribute('d', inkLoop(tp, { seed: sd + 90 + r.k, t, smooth: false })); r.trackR.setAttribute('d', inkPath(tp, { w: 4, seed: sd + 95 + r.k, t, closed: true, smooth: false }));
              const fw = Math.max(1, (r.w - 10) * clamp01(r.bar.value ?? 0.5) * prog(lt, a + 0.1, 0.9));
              r.fill.setAttribute('d', inkLoop(rect(r.x + 6, r.y + 8, fw, 94), { seed: sd + 100 + r.k, t, smooth: false, amp: 0.6 }));
            }
          });
          if (pill) {
            const a = atOr(cues, P.pill.at, dur * 0.7), p = spring(lt, a, 0.6), tw = pill.e.getComputedTextLength() + 100, pp = rect((X0 + X1) / 2 - tw / 2, 742, tw, 80);
            pill.f.setAttribute('d', inkLoop(pp, { seed: sd + 120, t })); pill.r.setAttribute('d', inkPath(pp, { w: 5, seed: sd + 121, t, closed: true }));
            pill.g.setAttribute('opacity', clamp01(p * 2.5)); pill.g.setAttribute('transform', `translate(${(X0 + X1) / 2} 782) scale(${f1(lerp(0.6, 1, p) * 100) / 100}) translate(${-(X0 + X1) / 2} -782)`);
          }
          tg.setAttribute('transform', `translate(${f1(Math.sin(t * 0.5) * 3)} ${f1(Math.cos(t * 0.4) * 2)})`);
        },
      };
    },
  };
})();
