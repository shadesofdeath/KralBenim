// sw_stomach: shots for the Stickstory Short "The man with a hole into his stomach" (2026-11-03): on 6 June 1822 a
// musket went off by accident in the American Fur Company store on Mackinac Island and hit the young voyageur Alexis
// St. Martin; army surgeon William Beaumont saved him, but the wound healed into a permanent opening (gastric
// fistula); Beaumont tied food to a silk string, lowered it into the stomach and pulled it out hours later, and showed
// that digestion is chemical (acid gastric juice), not grinding; book 1833. Tasteful: bandage + small round window.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any 19th-century frontier / medicine story.
// Labels use window.MCB.labels (mcB__lib.js): {text, x, y, at, size, color, font: "hand"|"serif", rot, arrow, stamp}.
//
// Common
//   K (figure) = {x, y (ground 0..1 H), scale: 1, pose, face: "left"|"right", dir, emotion, item, accessory, beard,
//     hat: true (fez narrator; false = period figure), seq: [{at, pose, dir, face, emotion}],
//     to, walk_at, walk_dur: 1.6 (walks from x to `to`), shock_at (cue: knocked back + falls to sitting),
//     patch: {open: cue|true, ring: cue} (bandage on the side with a small round window),
//     string: {hand: 0|1, len: 220, food: ["meat", "bread", "leaf"], at} (silk string with food from a hand)}
//   gy: ground line (0..1 H)
//
// SHOTS.sw_island — Mackinac Island shore (use with set "coast"): Fort Mackinac's white walls and blockhouse on a
//   bluff, the fur company store (log house, smoking chimney), a birch-bark canoe on the beach, sand + rocks in front.
//   P: {gy: 0.6, fort: {x: 0.74, y: 0.43, s: 1} | false, store: {x: 0.3, s: 1} | false,
//     shot: {at} (flash + smoke burst from the store door), canoe: {x: 0.7, y: 0.86, s: 1, to, at, dur} | false,
//     cast: [K], labels}
// SHOTS.sw_room — an 1820s room (use with set "interior"). P: {mode: "store" | "clinic", gy: 0.6,
//     musket: {x: 0.72, y: 0.5, at (muzzle flash + smoke)}, cast: [K], labels}
//   store: shelves of fur bundles and blanket stacks, a long counter with a musket; clinic: bottle shelf, a framed
//   certificate, a front table with a doctor's bag, a bowl and a candle.
// SHOTS.sw_belly — close-up of the healed side: shirt pulled back, bandage strips round a small round opening; a hand
//   in an army-coat cuff holds a silk string; food pops onto the string on cues.
//   P: {win: [0.46, 0.48], r: 70, food: [{kind: "meat", at}, ...], lower: 60 (px the hand sinks over the scene), labels}
// SHOTS.sw_cut — a cut-away of the body side: skin line on the left, ribs, a big J-shaped stomach with folds, the
//   fistula tunnel through the wall; a silk string runs in through it.
//   P: {mode: "drop" | "acid", drop: cue (food slides in), hours: cue (clock spins), pull: cue (food comes out
//     smaller), acid: cue (food dissolves in gold juice, bubbles), ground: cue (millstones crossed out),
//     clock: true, mill: true, food: ["meat", "bread", "leaf"], labels}
// SHOTS.sw_book — Beaumont's 1833 book open on a desk: title page "GASTRIC JUICE / 1833", a stomach sketch drawing
//   itself on the right page, a page turning at the start, quill + inkwell + candle; gold rings at `world`.
//   P: {title: ["GASTRIC", "JUICE"], year: "1833", world: cue, kasif: K | false, labels}
// cues: hit (punch) + the names above + labels / seq "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : name === true ? 0 : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const FR = 'Fraunces, Georgia, serif';
  const hn = (a, b) => { const r = rng(inkHash(a, b)); r(); return r(); };
  const line = (pts, sd, t, w = 6, amp = 1.2, taper) => inkPath(pts, { w, seed: sd, t, amp, taper });
  const loop = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const ring = (pts, sd, t, w = 6, amp = 1.2, smooth = true) => inkPath(pts, { w, seed: sd, t, amp, closed: true, smooth });
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const ell = (cx, cy, rx, ry, sd, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, sd, n, rot);
  const labelsOf = (g, L, W, H, sd) => window.MCB ? window.MCB.labels(g, L, W, H, sd) : { update() {} };

  // colour keys used by the pen sets (all palette tokens or mixes of them)
  const C = () => ({
    paper: INK.paperLight, dark: INK.paperDark, ink: INK.ink, soft: INK.inkSoft, red: INK.red, gold: INK.gold,
    blue: INK.blue, green: INK.green,
    wood: mix(INK.stain, INK.paperDark, 0.45), woodD: mix(INK.stain, INK.ink, 0.35),
    sand: mix(INK.gold, INK.paperLight, 0.6), grass: mix(INK.green, INK.ink, 0.3),
    meat: mix(INK.red, INK.paperLight, 0.22), fat: mix(INK.paperLight, INK.red, 0.15),
    bread: mix(INK.gold, INK.paperLight, 0.35), leaf: mix(INK.green, INK.paperLight, 0.2),
    flesh: mix(INK.red, INK.paperLight, 0.82), lining: mix(INK.red, INK.paperLight, 0.55),
    skin: mix(INK.stain, INK.paperLight, 0.55), cloth: mix(INK.blue, INK.paperLight, 0.45), coat: mix(INK.blue, INK.ink, 0.25),
  });
  // pens: one path element per colour key (creation order = z-order); add(key, d) collects, flush() writes
  function pens(parent, keys, op = {}) {
    const col = C(), P = {};
    keys.forEach(k => { const [name, c] = k.split(':'); P[name] = { e: inkEl(parent, col[c || name] || INK.ink, op[name] != null ? { 'fill-opacity': op[name] } : {}), d: [] }; });
    return {
      add(k, d) { if (d) P[k].d.push(d); },
      flush() { for (const k in P) { P[k].e.setAttribute('d', P[k].d.join(' ')); P[k].d.length = 0; } },
    };
  }

  // ------------------------------------------------------------------ food on a string (meat chunk, bread, leaf)
  function food(pn, kind, x, y, s, sd, t, a = 0) {
    if (s < 0.02) return;
    if (kind === 'bread') {
      const pts = [[-34, -24], [30, -28], [38, 20], [-30, 26]].map(([u, v]) => [x + (u * Math.cos(a) - v * Math.sin(a)) * s, y + (u * Math.sin(a) + v * Math.cos(a)) * s]);
      pn.add('bread', loop(pts, sd, t, 0.8)); pn.add('ink', ring(pts, sd + 1, t, 5 * Math.max(0.6, s), 0.8));
      for (let k = 0; k < 3; k++) pn.add('ink', inkDot(x + (k - 1) * 14 * s, y + (k % 2 ? -6 : 8) * s, 3.5 * s, 3 * s, sd + 3 + k, t));
    } else if (kind === 'leaf') {
      const pts = ell(x, y, 40 * s, 26 * s, sd, 12, a + 0.4);
      pn.add('leaf', loop(pts, sd, t, 0.8)); pn.add('ink', ring(pts, sd + 1, t, 5 * Math.max(0.6, s), 0.8));
      const c = Math.cos(a + 0.4), sn = Math.sin(a + 0.4);
      pn.add('ink', line([[x - c * 34 * s, y - sn * 34 * s], [x + c * 34 * s, y + sn * 34 * s]], sd + 2, t, 3.5 * s, 0.5));
      for (let k = -1; k <= 1; k++) pn.add('ink', line([[x + c * k * 16 * s, y + sn * k * 16 * s], [x + c * (k * 16 + 8) * s - sn * 18 * s, y + sn * (k * 16 + 8) * s + c * 18 * s]], sd + 4 + k, t, 2.5 * s, 0.4));
    } else {
      const pts = ell(x, y, 44 * s, 34 * s, sd, 11, a);
      pn.add('meat', loop(pts, sd, t, 0.8)); pn.add('ink', ring(pts, sd + 1, t, 5 * Math.max(0.6, s), 0.8));
      pn.add('fat', line([[x - 26 * s, y - 8 * s], [x - 4 * s, y + 4 * s], [x + 24 * s, y - 4 * s]], sd + 2, t, 7 * s, 0.5));
    }
  }
  // a hanging silk string from `top` with food tied along its lower end; returns the end point
  function hangString(pn, top, len, foods, sd, t, sway = 1, vis = 1, gap = 0.24) {
    const sw = Math.sin(t * 1.7) * len * 0.07 * sway, end = [top[0] + sw, top[1] + len];
    const mid = [top[0] + sw * 0.4 + Math.sin(t * 2.3) * 6 * sway, top[1] + len * 0.5];
    pn.add('soft', line([top, mid, end], sd, t, 3, 0.5, 0));
    (foods || []).forEach((f, i) => {
      const k = typeof f === 'string' ? { kind: f, s: 1 } : f;
      const u = 1 - i * gap, p = [lerp(top[0], end[0], u) + Math.sin(i * 2 + t) * 2, lerp(top[1], end[1], u) + 26];
      const s = (k.s ?? 1) * (Array.isArray(vis) ? vis[i] ?? 1 : vis);
      if (s > 0.02) { pn.add('ink', ring(ell(p[0], p[1] - 28 * s, 8 * s, 6 * s, sd + 40 + i, 8), sd + 41 + i, t, 3, 0.4)); food(pn, k.kind, p[0], p[1], s, sd + 50 + i * 7, t, Math.sin(t * 1.3 + i) * 0.15); }
    });
    return end;
  }

  // ------------------------------------------------------------------ figure (narrator or period figure)
  function figure(parent, over, K, sd, top) {
    top = top || over;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues, W, H, pos) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null;
        let since = lt - Math.max(0, s.at), pose = s.pose || 'idle', face = faceOf(s.face ?? K.face, 1), ph = 0;
        const sc = K.scale ?? 1;
        let x = (pos ? pos[0] : K.x ?? 0.5) * W, y = (pos ? pos[1] : K.y ?? 0.6) * H, prevOk = true;
        if (K.to != null) {
          const wd = K.walk_dur ?? 1.6, st = atOr(cues, K.walk_at, 0), u = progIO(lt, st, wd), dist = (K.to - K.x) * W;
          x = (K.x + (K.to - K.x) * u) * W;
          if (lt >= st && lt < st + wd) { pose = 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); prevOk = false; }
        }
        const o = { x, y, face, since, ph, scale: sc, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: K.text, item: pose === 'hold' ? (K.item || null) : null };
        if (prevOk && pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o);
        const W2 = q => [x + face * sc * q[0], y + sc * q[1]];
        const head = W2(r.head), hands = r.hands.map(W2);
        if (K.shirt) {   // open shirt: two flaps hanging from the shoulders, open over the chest and belly
          const hp = r.hip, hd = r.head, nk = [lerp(hp[0], hd[0], 0.62), lerp(hp[1], hd[1], 0.62)], sw = Math.sin(t * 1.4) * 3;
          const back = [[nk[0] - 6, nk[1] - 4], [nk[0] - 38, nk[1] + 12], [hp[0] - 52 + sw, hp[1] + 20], [hp[0] - 12, hp[1] + 26], [nk[0] - 10, nk[1] + 30]].map(W2);
          const frnt = [[nk[0] + 8, nk[1] - 2], [nk[0] + 34, nk[1] + 14], [hp[0] + 46 - sw, hp[1] + 18], [hp[0] + 30, hp[1] + 24], [nk[0] + 18, nk[1] + 40]].map(W2);
          [back, frnt].forEach((pts, i) => { over.add('cloth', loop(pts, sd + 800 + i, t, 0.5)); over.add('ink', ring(pts, sd + 802 + i, t, 4 * sc, 0.6)); });
          over.add('soft', line([W2([nk[0] - 24, nk[1] + 30]), W2([hp[0] - 30, hp[1] + 12])], sd + 804, t, 2.5 * sc, 0.4));
          // the torso line again on top of the flaps (open shirt shows the body)
          over.add('ink', line([W2(hp), W2(nk)], sd + 805, t, 7 * sc, 0.6));
        }
        // patch: bandage on the side with a small round window
        if (K.patch) {
          const pt = W2([lerp(r.hip[0], r.head[0], 0.3) + 8, lerp(r.hip[1], r.head[1], 0.3)]);
          const pr0 = K.patch.r ?? 34, pb = ell(pt[0], pt[1], pr0 * sc, pr0 * 0.94 * sc, sd + 900, 12);
          over.add('paper', loop(pb, sd + 900, t, 0.5));
          over.add('ink', ring(pb, sd + 901, t, 4 * sc, 0.5));
          for (let q = 0; q < 8; q++) { const a = q / 8 * 6.283; over.add('soft', line([[pt[0] + Math.cos(a) * pr0 * 0.7 * sc, pt[1] + Math.sin(a) * pr0 * 0.68 * sc], [pt[0] + Math.cos(a) * pr0 * 0.9 * sc, pt[1] + Math.sin(a) * pr0 * 0.85 * sc]], sd + 910 + q, t, 2.5 * sc, 0.3)); }
          const op = atOr(cues, K.patch.open, null);
          if (op != null && lt >= op) {
            const q = spring(lt, op, 0.5), rr = (K.patch.hole ?? 15) * sc * q;
            over.add('dark', loop(ell(pt[0], pt[1], rr, rr, sd + 903, 10), sd + 903, t, 0.4));
            over.add('ink', ring(ell(pt[0], pt[1], rr, rr, sd + 904, 10), sd + 904, t, 4 * sc, 0.4));
          }
          const ra = atOr(cues, K.patch.ring, null);
          if (ra != null && lt >= ra) {
            const pr = (lt - ra) % 1.2 / 1.2, rr = (pr0 * 1.3 + 40 * pr) * sc;
            over.add('red', ring(ell(pt[0], pt[1], rr, rr, sd + 905, 14), sd + 905, t, 7 * (1 - pr) * sc + 1, 0.8));
            over.add('red', ring(ell(pt[0], pt[1], pr0 * 1.35 * sc, pr0 * 1.35 * sc, sd + 906, 14), sd + 906, t, 6 * sc, 0.8));
          }
        }
        if (K.gasp) {   // shock face on any pose: paper over the lip line, an open "O" mouth, wide eye rings, shock ticks
          const ga = atOr(cues, K.gasp, 0);
          if (lt >= ga) {
            const hc = r.head, F = (u, v) => W2([hc[0] + u, hc[1] + v]), q = spring(lt, ga, 0.4), pul = 1 + 0.08 * Math.sin(lt * 7);
            const m0 = F(18, 34);
            over.add('paper', loop(ell(m0[0], m0[1], 24 * sc, 13 * sc, sd + 970, 10), sd + 970, t, 0.3));
            const m = F(18, 40);
            over.add('ink', ring(ell(m[0], m[1], 10 * sc * q * pul, 15 * sc * q * pul, sd + 971, 10), sd + 971, t, 5 * sc, 0.3));
            [-1, 1].forEach(e => { const c = F(17 + e * 22, 6); over.add('ink', ring(ell(c[0], c[1], 12 * sc, 13 * sc, sd + 972 + e, 10), sd + 974 + e, t, 3.5 * sc, 0.3)); });
            if (q > 0.3) [[-0.9, -1.25], [0, -1.55], [0.9, -1.25]].forEach(([u, v], i) => { const a2 = F(u * 70 + 15, v * 70 - 40), b2 = F(u * 100 + 15, v * 98 - 40); over.add('ink', line([a2, b2], sd + 980 + i, t, 6 * sc, 0.4)); });
          }
        }
        if (K.string) {
          const a = atOr(cues, K.string.at, 0);
          if (lt >= a) {
            const hp = hands[K.string.hand ?? 1];
            if (K.string.to) {
              const T = [K.string.to[0] * W + Math.sin(t * 1.7) * 6, K.string.to[1] * H + Math.sin(t * 2.1) * 4], a2 = spring(lt, a, 0.6);
              const tp = [T[0], T[1] - 70], mid = [(hp[0] + tp[0]) / 2, Math.max(hp[1], tp[1]) + 40];
              top.add('soft', line([hp, mid, tp, [T[0], T[1] - 30]], sd + 950, t, 3.5, 0.5, 0));
              top.add('ink', ring(ell(T[0], T[1] - 30, 9, 7, sd + 951, 8), sd + 952, t, 3, 0.4));
              (K.string.food || ['meat']).forEach((f, i) => food(top, f, T[0] + i * 10, T[1] + i * 70, (K.string.s ?? 1.3) * a2, sd + 960 + i * 7, t, Math.sin(t * 1.3 + i) * 0.15));
            } else hangString(over, [hp[0], hp[1] + 6], (K.string.len ?? 220) * sc * spring(lt, a, 0.6), K.string.food || ['meat'], sd + 950, t, 1, 1.0 * sc);
          }
        }
        return { x, y, face, sc, head, hands };
      },
    };
  }
  function castOf(parent, over, list, sd, top) { return (list || []).map((K, i) => figure(parent, over, K, sd + i * 37, top)); }

  // ------------------------------------------------------------------ smoke puffs (pure function of age)
  function smoke(pn, x, y, age, s, sd, t, n = 6, drift = [40, -70]) {
    if (age < 0) return;
    for (let k = 0; k < n; k++) {
      const a = age - k * 0.06; if (a < 0) continue;
      const u = clamp01(a / 3.2), ang = -1.9 + k * 0.55;
      const cx = x + Math.cos(ang) * 60 * s * Math.sqrt(u) * 2 + drift[0] * u * s, cy = y + Math.sin(ang) * 40 * s * Math.sqrt(u) + drift[1] * u * s;
      const r = (28 + 90 * Math.sqrt(u)) * s * (0.8 + 0.4 * hn(sd, k));
      if (u >= 1) continue;
      pn.add('smoke', loop(ell(cx, cy, r, r * 0.86, sd + k, 12), sd + k, t, 1.2));
      pn.add('smokeR', ring(ell(cx, cy, r, r * 0.86, sd + k, 12), sd + 20 + k, t, 3.5 * (1 - u) + 1, 1));
    }
  }
  function flash(pn, x, y, age, s, sd, t, dur = 0.5) {
    if (age < 0 || age > dur) return;
    const q = (age < 0.08 ? age / 0.08 : 1 - (age - 0.08) / (dur - 0.08)) * (1 + 0.12 * Math.sin(age * 40)), pts = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = (k % 2 ? 50 : 130) * s * q * (0.8 + 0.4 * hn(sd, k)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    pn.add('gold', loop(pts, sd, t, 1, false)); pn.add('red', ring(pts, sd + 1, t, 5, 1, false));
  }

  // ------------------------------------------------------------------ SHOTS.sw_island
  SH.sw_island = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 37;
      const gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const back = pens(el(root, 'g'), ['bluff:grass', 'paper', 'dark', 'wood', 'red', 'blue', 'soft', 'ink'], { bluff: 0.5 });
      const chim = pens(el(root, 'g'), ['smoke:paper', 'smokeR:soft']);
      const ground = pens(el(root, 'g'), ['sand', 'soft', 'grass', 'ink'], { sand: 0.8, grass: 0.8 });
      const riderG = el(root, 'g'), riderO = pens(el(root, 'g'), ['cloth', 'paper', 'dark', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink']);
      const rider = P.canoe && P.canoe.rider ? figure(riderG, riderO, Object.assign({ hat: false, pose: 'sit' }, P.canoe.rider), sd + 250) : null;
      const canoeP = pens(el(root, 'g'), ['paper', 'dark', 'ink', 'wood']);
      const castG = el(root, 'g');
      const over = pens(el(root, 'g'), ['cloth', 'paper', 'dark', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink']);
      const front = pens(el(root, 'g'), ['dark', 'wood', 'grass', 'ink'], { grass: 0.85 });
      const burst = pens(el(root, 'g'), ['smoke:paper', 'smokeR:soft', 'gold', 'red'], { smoke: 0.92 });
      const cast = castOf(castG, over, P.cast, sd + 300);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 700);
      const tufts = Array.from({ length: 22 }, (_, i) => [hn(sd + i, 1), hn(sd + i, 2)]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // fort on its bluff
          if (P.fort !== false) {
            const F = Object.assign({ x: 0.74, y: 0.43, s: 1 }, P.fort || {}), fx = F.x * W, fy = F.y * H, s = F.s;
            const bl = []; for (let i = 0; i <= 12; i++) { const u = i / 12; bl.push([fx + (u - 0.5) * 760 * s, fy + 40 * s - Math.sin(u * Math.PI) * 70 * s + Math.sin(i * 1.9) * 6 * s]); }
            back.add('bluff', loop(bl.concat([[fx + 380 * s, gy + 10], [fx - 380 * s, gy + 10]]), k + 1, t, 0.6, false));
            back.add('soft', line(bl, k + 2, t, 4, 0.8));
            for (let i = 0; i < 9; i++) { const u = 0.08 + i * 0.105, x0 = fx + (u - 0.5) * 700 * s; back.add('soft', line([[x0, fy + 90 * s + (i % 3) * 30 * s], [x0 - 26 * s, fy + 150 * s + (i % 3) * 30 * s]], k + 3 + i, t, 3, 0.6)); }
            const wl = fx - 270 * s, wr = fx + 230 * s, wt = fy - 64 * s, wb = fy + 6 * s;
            back.add('paper', loop(rect(wl, wt, wr, wb), k + 20, t, 0.5, false)); back.add('ink', ring(rect(wl, wt, wr, wb), k + 21, t, 5, 0.8, false));
            for (let i = 0; i < 6; i++) { const x0 = wl + 40 * s + i * 80 * s; back.add('ink', loop(rect(x0, wt + 22 * s, x0 + 18 * s, wt + 40 * s), k + 22 + i, t, 0.4, false)); }
            // blockhouse: lower block, wider upper storey, pyramid roof
            const bx = fx + 120 * s, b1 = rect(bx - 48 * s, wt - 70 * s, bx + 48 * s, wt), b2 = rect(bx - 62 * s, wt - 140 * s, bx + 62 * s, wt - 70 * s);
            [b1, b2].forEach((b, i) => { back.add('paper', loop(b, k + 30 + i, t, 0.5, false)); back.add('ink', ring(b, k + 32 + i, t, 5, 0.8, false)); });
            const roof = [[bx - 74 * s, wt - 140 * s], [bx, wt - 210 * s], [bx + 74 * s, wt - 140 * s]];
            back.add('dark', loop(roof, k + 34, t, 0.6, false)); back.add('ink', ring(roof, k + 35, t, 5, 0.8, false));
            for (let i = 0; i < 3; i++) back.add('ink', loop(rect(bx - 40 * s + i * 32 * s, wt - 112 * s, bx - 28 * s + i * 32 * s, wt - 96 * s), k + 36 + i, t, 0.3, false));
            // flag waving on a pole
            const px = fx - 150 * s, ptop = wt - 230 * s;
            back.add('ink', line([[px, wt], [px, ptop]], k + 40, t, 5, 0.6));
            const fw = 120 * s, fh = 76 * s, wv = (u, v) => [px + u * fw, ptop + v * fh + Math.sin(t * 4 - u * 5) * 10 * s * u];
            const flagPts = []; for (let i = 0; i <= 6; i++) flagPts.push(wv(i / 6, 0)); for (let i = 6; i >= 0; i--) flagPts.push(wv(i / 6, 1));
            back.add('paper', loop(flagPts, k + 41, t, 0.5));
            for (let j = 0; j < 3; j++) { const st = []; for (let i = 0; i <= 6; i++) st.push(wv(i / 6, 0.1 + j * 0.33)); for (let i = 6; i >= 0; i--) st.push(wv(i / 6, 0.24 + j * 0.33)); back.add('red', loop(st, k + 42 + j, t, 0.4)); }
            const cn = []; for (let i = 0; i <= 3; i++) cn.push(wv(i / 6 * 0.9, 0)); for (let i = 3; i >= 0; i--) cn.push(wv(i / 6 * 0.9, 0.5));
            back.add('blue', loop(cn, k + 46, t, 0.4)); back.add('ink', ring(flagPts, k + 47, t, 4, 0.6));
          }
          // fur company store
          let door = null;
          if (P.store !== false) {
            const S = Object.assign({ x: 0.3, s: 1 }, P.store || {}), sx = S.x * W, s = S.s;
            const L = sx - 210 * s, R = sx + 210 * s, T = gy - 230 * s, B = gy;
            back.add('wood', loop(rect(L, T, R, B), k + 60, t, 0.5, false)); back.add('ink', ring(rect(L, T, R, B), k + 61, t, 6, 0.9, false));
            for (let i = 1; i < 8; i++) back.add('soft', line([[L + 6, T + i * 28 * s], [R - 6, T + i * 28 * s + Math.sin(i) * 3]], k + 62 + i, t, 3, 0.6));
            const roof = [[L - 30 * s, T + 4], [sx, T - 130 * s], [R + 30 * s, T + 4]];
            back.add('dark', loop(roof, k + 70, t, 0.6, false)); back.add('ink', ring(roof, k + 71, t, 6, 0.9, false));
            for (let i = 0; i < 6; i++) back.add('soft', line([[sx - 150 * s + i * 50 * s, T - 10 * s - (i < 3 ? i : 5 - i) * 30 * s], [sx - 130 * s + i * 50 * s, T - 4 * s]], k + 72 + i, t, 3, 0.5));
            const ch = rect(sx + 90 * s, T - 120 * s, sx + 130 * s, T - 40 * s);
            back.add('dark', loop(ch, k + 80, t, 0.4, false)); back.add('ink', ring(ch, k + 81, t, 5, 0.6, false));
            for (let j = 0; j < 4; j++) {   // chimney wisps: rise and grow forever
              const u = ((t * 0.25 + j * 0.25) % 1), r = (14 + 40 * u) * s, cx = sx + 110 * s + u * 90 * s + Math.sin(t + j) * 8, cy = T - 130 * s - u * 260 * s;
              chim.add('smoke', loop(ell(cx, cy, r, r * 0.8, k + 90 + j, 10), k + 90 + j, t, 0.8));
              chim.add('smokeR', ring(ell(cx, cy, r, r * 0.8, k + 90 + j, 10), k + 95 + j, t, 3 * (1 - u) + 0.5, 0.8));
            }
            const dr = rect(sx - 110 * s, B - 160 * s, sx - 20 * s, B);
            back.add('ink', loop(dr, k + 100, t, 0.5, false));
            const wn = rect(sx + 50 * s, T + 70 * s, sx + 150 * s, T + 150 * s);
            back.add('paper', loop(wn, k + 101, t, 0.4, false)); back.add('ink', ring(wn, k + 102, t, 5, 0.6, false));
            back.add('ink', line([[sx + 100 * s, T + 70 * s], [sx + 100 * s, T + 150 * s]], k + 103, t, 4, 0.5));
            back.add('ink', line([[sx + 50 * s, T + 110 * s], [sx + 150 * s, T + 110 * s]], k + 104, t, 4, 0.5));
            door = [sx - 65 * s, B - 90 * s, s];
          }
          // beach in front
          const top = []; for (let i = 0; i <= 14; i++) top.push([-40 + i * (W + 80) / 14, gy + 4 + Math.sin(i * 1.7) * 6]);
          ground.add('sand', loop(top.concat([[W + 40, H + 40], [-40, H + 40]]), k + 120, t, 0.5, false));
          ground.add('ink', line(top, k + 121, t, 5, 0.6));
          for (let i = 0; i < 46; i++) { const x = hn(k + i, 3) * W, y = lerp(gy + 30, H - 20, hn(k + i, 4)), r = 3 + hn(k + i, 5) * 6 * (1 + (y - gy) / (H - gy)); ground.add('soft', inkDot(x, y, r, r * 0.7, k + 130 + i, t)); }
          tufts.forEach((q, i) => {
            const x = q[0] < 0.5 ? q[0] * 0.5 * W : (0.75 + q[0] * 0.25) * W, y = lerp(gy + 40, H - 60, q[1]), s = lerp(0.7, 1.7, (y - gy) / (H - gy)), sw = Math.sin(lt * 1.6 + i) * 6 * s;
            for (let j = -2; j <= 2; j++) ground.add('grass', line([[x + j * 9 * s, y], [x + j * 16 * s + sw, y - (34 + 14 * (2 - Math.abs(j))) * s]], k + 200 + i * 5 + j, t, 3.5 * s, 0.4));
          });
          // canoe
          if (P.canoe) {
            const Cn = Object.assign({ x: 0.7, y: 0.86, s: 1 }, P.canoe), a = atOr(cues, Cn.at, null);
            const u = Cn.to != null && a != null ? progIO(lt, a, Cn.dur ?? 2) : 0;
            const cx = lerp(Cn.x, Cn.to ?? Cn.x, u) * W, cy = Cn.y * H + Math.sin(t * 1.4) * 3, s = Cn.s, L = 230 * s;
            const hull = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * 2 - 1; hull.push([cx + v * L, cy - 26 * s - Math.pow(Math.abs(v), 6) * 46 * s]); }
            for (let i = 10; i >= 0; i--) { const v = i / 10 * 2 - 1; hull.push([cx + v * L * 0.96, cy + 34 * s * (1 - Math.pow(Math.abs(v), 3)) - Math.pow(Math.abs(v), 6) * 30 * s]); }
            canoeP.add('paper', loop(hull, k + 300, t, 0.6)); canoeP.add('ink', ring(hull, k + 301, t, 6, 0.8));
            for (let i = 0; i < 9; i++) { const x0 = cx - L * 0.8 + i * L * 0.2; canoeP.add('ink', line([[x0, cy + (i % 2 ? -4 : 8) * s], [x0 + 26 * s, cy + (i % 2 ? -4 : 8) * s]], k + 302 + i, t, 4, 0.5)); }
            canoeP.add('dark', line([[cx - L * 0.9, cy - 26 * s], [cx + L * 0.9, cy - 26 * s]], k + 312, t, 9 * s, 0.5));
            if (rider) {
              const R0 = rider.update(lt, t, cues, W, H, [cx / W - 0.03 * s, (cy + 40 * s) / H]);
              const hp = R0.hands[1], st = Math.sin(t * 3.2), pe = [hp[0] - 60 * s + st * 70 * s, cy + 60 * s];
              canoeP.add('wood', line([hp, pe], k + 315, t, 9 * s, 0.5));
              canoeP.add('wood', loop(ell(pe[0], pe[1], 14 * s, 34 * s, k + 316, 9, 0.3), k + 316, t, 0.5));
              canoeP.add('ink', ring(ell(pe[0], pe[1], 14 * s, 34 * s, k + 317, 9, 0.3), k + 317, t, 3, 0.5));
              if (u > 0 && u < 1) for (let j = 0; j < 3; j++) canoeP.add('ink', line([[cx + L * (1.05 + j * 0.12), cy + 20 * s + j * 10], [cx + L * (1.25 + j * 0.12), cy + 24 * s + j * 10]], k + 320 + j, t, 3, 0.5));
            } else {
            canoeP.add('ink', line([[cx + L * 0.2, cy - 140 * s], [cx + L * 0.5, cy + 10 * s]], k + 313, t, 6, 0.6));
            canoeP.add('dark', loop(ell(cx + L * 0.52, cy + 18 * s, 14 * s, 34 * s, k + 314, 9, -0.35), k + 314, t, 0.5));
            }
          }
          // front rocks + driftwood (fill the bottom of the frame)
          const lg = [[-30, H - 250], [360, H - 300], [372, H - 240], [-30, H - 186]];
          front.add('wood', loop(lg, k + 400, t, 0.6, false)); front.add('ink', ring(lg, k + 401, t, 6, 0.8, false));
          front.add('ink', ring(ell(360, H - 270, 14, 30, k + 402, 9, -0.1), k + 403, t, 4, 0.5));
          for (let i = 0; i < 3; i++) front.add('ink', line([[40 + i * 100, H - 254 - i * 10], [120 + i * 100, H - 262 - i * 10]], k + 404 + i, t, 3, 0.5));
          [[W - 150, H - 150, 190, 130], [W - 330, H - 90, 120, 80]].forEach(([x, y, rx, ry], i) => {
            const pts = ell(x, y, rx, ry, k + 410 + i, 10); front.add('dark', loop(pts, k + 410 + i, t, 0.6)); front.add('ink', ring(pts, k + 412 + i, t, 6, 0.8));
            front.add('ink', line([[x - rx * 0.5, y - ry * 0.2], [x - rx * 0.1, y - ry * 0.45]], k + 414 + i, t, 3, 0.5));
          });
          // gunshot from the door
          if (P.shot && door) {
            const a = atOr(cues, P.shot.at, 0.4);
            flash(burst, door[0], door[1], lt - a, (P.shot.size ?? 1.2) * door[2], k + 500, t, P.shot.dur ?? 0.5);
            smoke(burst, door[0], door[1], lt - a, 1.3 * door[2], k + 520, t, 7, [160, -180]);
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          back.flush(); chim.flush(); ground.flush(); riderO.flush(); canoeP.flush(); over.flush(); front.flush(); burst.flush();
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sw_room
  SH.sw_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 211;
      const gy = (P.gy ?? 0.6) * H, mode = P.mode || 'store';
      const root = el(svg, 'g');
      const back = pens(el(root, 'g'), ['wood', 'woodD', 'dark', 'paper', 'red', 'blue', 'green', 'gold', 'soft', 'ink']);
      const castG = el(root, 'g');
      const over = pens(el(root, 'g'), ['cloth', 'paper', 'dark', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink']);
      const front = pens(el(root, 'g'), ['wood', 'woodD', 'dark', 'paper', 'red', 'blue', 'gold', 'soft', 'ink']);
      const burst = pens(el(root, 'g'), ['smoke:paper', 'smokeR:soft', 'gold', 'red'], { smoke: 0.9 });
      const topP = pens(el(root, 'g'), ['meat', 'fat', 'bread', 'leaf', 'soft', 'ink']);
      const cast = castOf(castG, over, P.cast, sd + 300, topP);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 700);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const bare = mode === 'bare';
          if (!bare) {
          // hanging oil lamp (swings slowly)
          const lx = W * (P.lamp ?? (mode === 'store' ? 0.8 : 0.53)), ang = Math.sin(t * 1.3) * 0.08, lyy = H * 0.24;
          const lp = [lx + Math.sin(ang) * lyy * 0.8, lyy * 0.8 + 40];
          back.add('ink', line([[lx, -10], lp], k + 1, t, 4, 0.5));
          const glass = ell(lp[0], lp[1] + 60, 38, 50, k + 2, 10);
          back.add('gold', loop(glass, k + 2, t, 0.6)); back.add('ink', ring(glass, k + 3, t, 5, 0.6));
          back.add('dark', loop(rect(lp[0] - 44, lp[1] + 104, lp[0] + 44, lp[1] + 124), k + 4, t, 0.4, false));
          back.add('red', loop(ell(lp[0], lp[1] + 66 - Math.abs(Math.sin(t * 9)) * 4, 10, 18 + Math.sin(t * 11) * 3, k + 5, 8), k + 5, t, 0.5));
          if (mode === 'store') {
            // shelves with fur bundles and blanket stacks
            const x0 = W * 0.04, x1 = W * 0.6;
            [gy - 640, gy - 420].forEach((y, j) => {
              back.add('woodD', loop(rect(x0, y, x1, y + 22), k + 10 + j, t, 0.4, false)); back.add('ink', ring(rect(x0, y, x1, y + 22), k + 12 + j, t, 4, 0.5, false));
              for (let i = 0; i < 4; i++) {
                const bx = x0 + 70 + i * 135, by = y;
                if ((i + j) % 2 === 0) {
                  const pts = ell(bx, by - 52, 62, 52, k + 20 + i + j * 4, 12);
                  back.add('dark', loop(pts, k + 20 + i + j * 4, t, 0.8)); back.add('ink', ring(pts, k + 30 + i + j * 4, t, 5, 0.8));
                  for (let q = 0; q < 4; q++) back.add('soft', line([[bx - 40 + q * 22, by - 86], [bx - 30 + q * 22, by - 30]], k + 40 + i * 4 + q + j * 20, t, 3, 0.6));
                  back.add('ink', line([[bx - 60, by - 52], [bx + 60, by - 56]], k + 90 + i + j * 4, t, 4, 0.5));
                } else {
                  for (let q = 0; q < 3; q++) { const b = rect(bx - 58, by - 34 * (q + 1), bx + 58, by - 34 * q - 2); back.add(q % 2 ? 'blue' : 'red', loop(b, k + 100 + i * 3 + q + j * 20, t, 0.4, false)); back.add('ink', ring(b, k + 130 + i * 3 + q + j * 20, t, 4, 0.5, false)); back.add('paper', line([[bx - 58, by - 34 * q - 17], [bx + 58, by - 34 * q - 17]], k + 160 + i * 3 + q + j * 20, t, 5, 0.4)); }
                }
              }
            });
            // counter
            const cl = W * 0.5, ct = gy - 190;
            back.add('wood', loop(rect(cl, ct, W + 20, gy), k + 200, t, 0.5, false)); back.add('ink', ring(rect(cl, ct, W + 20, gy), k + 201, t, 6, 0.8, false));
            back.add('woodD', loop(rect(cl - 20, ct - 22, W + 20, ct), k + 202, t, 0.5, false)); back.add('ink', ring(rect(cl - 20, ct - 22, W + 20, ct), k + 203, t, 5, 0.6, false));
            for (let i = 1; i < 5; i++) back.add('soft', line([[cl + i * 110, ct + 10], [cl + i * 110, gy - 6]], k + 204 + i, t, 3, 0.5));
          } else if (!bare) {
            // clinic: bottle shelf + framed certificate
            const sy = gy - 560, x0 = W * 0.08, x1 = W * 0.48;
            back.add('woodD', loop(rect(x0, sy, x1, sy + 20), k + 300, t, 0.4, false)); back.add('ink', ring(rect(x0, sy, x1, sy + 20), k + 301, t, 4, 0.5, false));
            ['blue', 'green', 'gold', 'blue', 'red'].forEach((c, i) => {
              const bx = x0 + 44 + i * 78, h = 80 + (i % 3) * 22, b = [[bx - 22, sy], [bx - 22, sy - h * 0.6], [bx - 9, sy - h * 0.75], [bx - 9, sy - h], [bx + 9, sy - h], [bx + 9, sy - h * 0.75], [bx + 22, sy - h * 0.6], [bx + 22, sy]];
              back.add(c, loop(b, k + 310 + i, t, 0.4, false)); back.add('ink', ring(b, k + 320 + i, t, 4, 0.5, false));
            });
            const cf = rect(W * 0.56, gy - 700, W * 0.9, gy - 470);
            back.add('woodD', loop(cf, k + 330, t, 0.4, false));
            const ci = rect(W * 0.56 + 18, gy - 682, W * 0.9 - 18, gy - 488);
            back.add('paper', loop(ci, k + 331, t, 0.4, false)); back.add('ink', ring(cf, k + 332, t, 5, 0.6, false));
            for (let i = 0; i < 4; i++) back.add('soft', line([[W * 0.6 + 10, gy - 640 + i * 38], [W * 0.86 - (i % 2) * 40, gy - 640 + i * 38]], k + 333 + i, t, 4, 0.5));
            back.add('red', inkDot(W * 0.82, gy - 520, 18, 18, k + 338, t));
          }
          }
          // musket (+ flash and smoke)
          if (P.musket) {
            const M = Object.assign({ x: 0.72, y: 0.5 }, P.musket), mx = M.x * W, my = M.y * H, a = atOr(cues, M.at, null);
            const kick = a != null && lt >= a ? Math.exp(-(lt - a) * 6) * 30 : 0;
            const c = Math.cos(-0.08), s0 = Math.sin(-0.08), T = (u, v) => [mx + kick + u * c - v * s0, my + u * s0 + v * c];
            const stock = [T(160, -8), T(320, 10), T(330, 50), T(260, 34), T(150, 14)];
            back.add('wood', loop(stock, k + 400, t, 0.5, false)); back.add('ink', ring(stock, k + 401, t, 5, 0.6, false));
            back.add('ink', line([T(-260, -6), T(170, -2)], k + 402, t, 11, 0.5));
            back.add('wood', line([T(-120, 4), T(160, 6)], k + 403, t, 12, 0.4));
            back.add('ink', line([T(120, 10), T(130, 28), T(150, 26)], k + 404, t, 4, 0.4));
            if (a != null) { const mz = T(-270, -6); flash(burst, mz[0], mz[1], lt - a, 1.0, k + 410, t); smoke(burst, mz[0], mz[1], lt - a, M.smoke ?? 1.0, k + 420, t, 7, M.drift || [80, -220]); }
          }
          if (P.smoke) { const S = P.smoke, a = atOr(cues, S.at, 0); smoke(burst, S.x * W, S.y * H, lt - a + (S.age ?? 0), S.s ?? 1.4, k + 450, t, 7, S.drift || [-60, -160]); }
          // foreground
          if (bare) { /* figures only */ } else if (mode === 'store') {
            [[0.12, 0.9, 1.15], [0.86, 0.94, 1.3]].forEach(([u, v, s], i) => {   // kegs and a crate
              const x = u * W, y = v * H;
              if (i === 0) {
                const b = [[x - 120 * s, y - 230 * s], [x + 120 * s, y - 230 * s], [x + 136 * s, y - 115 * s], [x + 120 * s, y + 10], [x - 120 * s, y + 10], [x - 136 * s, y - 115 * s]];
                front.add('wood', loop(b, k + 500, t, 0.5)); front.add('ink', ring(b, k + 501, t, 6, 0.7));
                [-170, -60].forEach((dy, j) => front.add('ink', line([[x - 132 * s, y + dy * s], [x + 132 * s, y + dy * s]], k + 502 + j, t, 8, 0.5)));
              } else {
                const b = rect(x - 170 * s, y - 220 * s, x + 170 * s, y + 20);
                front.add('woodD', loop(b, k + 510, t, 0.5, false)); front.add('ink', ring(b, k + 511, t, 6, 0.7, false));
                front.add('ink', line([[x - 170 * s, y - 220 * s], [x + 170 * s, y + 10]], k + 512, t, 6, 0.6));
                front.add('paper', loop(rect(x - 90 * s, y - 150 * s, x + 30 * s, y - 100 * s), k + 513, t, 0.4, false));
              }
            });
          } else {
            const ty = H * 0.8, tb = rect(W * 0.38, ty, W + 30, ty + 40);
            front.add('woodD', loop(rect(W * 0.38, ty, W + 30, H + 30), k + 600, t, 0.4, false));
            front.add('wood', loop(tb, k + 601, t, 0.4, false)); front.add('ink', ring(tb, k + 602, t, 6, 0.7, false));
            for (let i = 0; i < 5; i++) front.add('soft', line([[W * 0.42 + i * 120, ty + 70], [W * 0.46 + i * 120, H]], k + 603 + i, t, 3, 0.5));
            // doctor's bag
            const bx = W * 0.6, bag = [[bx - 130, ty], [bx - 110, ty - 120], [bx + 110, ty - 120], [bx + 130, ty]];
            front.add('dark', loop(bag, k + 610, t, 0.5, false)); front.add('ink', ring(bag, k + 611, t, 6, 0.7, false));
            front.add('ink', line([[bx - 50, ty - 120], [bx - 40, ty - 170], [bx + 40, ty - 170], [bx + 50, ty - 120]], k + 612, t, 7, 0.5));
            front.add('gold', inkDot(bx, ty - 104, 10, 8, k + 613, t));
            // bowl and candle
            const bw = [[W * 0.82 - 80, ty - 50], [W * 0.82 + 80, ty - 50], [W * 0.82 + 50, ty], [W * 0.82 - 50, ty]];
            front.add('paper', loop(bw, k + 620, t, 0.5, false)); front.add('ink', ring(bw, k + 621, t, 5, 0.6, false));
            const cx = W * 0.94, cd = rect(cx - 18, ty - 130, cx + 18, ty);
            front.add('paper', loop(cd, k + 630, t, 0.4, false)); front.add('ink', ring(cd, k + 631, t, 4, 0.5, false));
            const fl = 1 + Math.sin(t * 13) * 0.12;
            front.add('gold', loop(ell(cx + Math.sin(t * 7) * 3, ty - 160, 13, 26 * fl, k + 632, 8), k + 632, t, 0.5));
            front.add('red', loop(ell(cx + Math.sin(t * 7) * 2, ty - 154, 6, 12 * fl, k + 633, 8), k + 633, t, 0.4));
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          back.flush(); over.flush(); topP.flush(); front.flush(); burst.flush();
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sw_belly
  SH.sw_belly = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 401;
      const root = el(svg, 'g');
      const bodyG = el(root, 'g'), body = pens(bodyG, ['skin', 'cloth', 'dark', 'paper', 'hole:soft', 'soft', 'ink', 'red'], { skin: 0.9 });
      const hand = pens(el(root, 'g'), ['meat', 'fat', 'bread', 'leaf', 'coat', 'gold', 'paper', 'soft', 'red', 'ink']);
      const castG = el(root, 'g'), over = pens(el(root, 'g'), ['cloth', 'paper', 'dark', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink']);
      const cast = P.kasif ? castOf(castG, over, [P.kasif], sd + 300) : [];
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 700);
      const [wx0, wy0] = (P.win || [0.46, 0.48]), R = P.r ?? 70;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, wx = wx0 * W, wy = wy0 * H;
          const br = Math.sin(t * 1.8) * 6;   // breathing
          const cy = wy + br;
          if (P.mode === 'profile') {
            // St. Martin in side profile (facing right): beret, worried face, one arm up behind the head, shirt
            // bunched up on the chest, ribs, a round gauze pad with the opening under the ribs, trousers + belt
            const x0 = (P.px ?? 0.3) * W, oy = 0, sP = P.ps ?? 1, an = P.anchor || [(x0 + 20) / W, 590 / H];
            bodyG.setAttribute('transform', `translate(${f1(an[0] * W - (x0 + 20) * sP)} ${f1(an[1] * H - 590 * sP)}) scale(${sP})`);
            const Y = v => v + oy + br * (v > 700 ? 1 : 0.5);
            body.add('ink', line([[x0 - 50, Y(730)], [x0 - 150, Y(590)], [x0 - 70, Y(490)]], k + 100, t, 9, 0.8));
            body.add('ink', inkDot(x0 - 66, Y(490), 14, 13, k + 101, t));
            const tor = [[x0 + 10, Y(690)], [x0 + 90, Y(715)], [x0 + 150, Y(790)], [x0 + 165, Y(960)], [x0 + 175, Y(1120)], [x0 + 150, Y(1280)], [x0 + 158, H + 40],
              [x0 - 130, H + 40], [x0 - 128, Y(1280)], [x0 - 112, Y(1080)], [x0 - 125, Y(880)], [x0 - 95, Y(735)], [x0 - 30, Y(695)]];
            body.add('skin', loop(tor, k + 102, t, 0.6)); body.add('ink', ring(tor, k + 103, t, 7, 0.8));
            const sh = [[x0 - 105, Y(728)], [x0 - 20, Y(705)], [x0 + 95, Y(728)], [x0 + 150, Y(790)], [x0 + 158, Y(850)], [x0 + 50, Y(845) + Math.sin(t * 1.5) * 5], [x0 - 60, Y(852)], [x0 - 132, Y(840)]];
            body.add('cloth', loop(sh, k + 104, t, 0.7)); body.add('ink', ring(sh, k + 105, t, 6, 0.8));
            for (let i = 0; i < 5; i++) body.add('soft', line([[x0 - 95 + i * 52, Y(735)], [x0 - 85 + i * 52, Y(835)]], k + 106 + i, t, 3, 0.6));
            for (let i = 0; i < 3; i++) body.add('soft', line([[x0 - 110, Y(935 + i * 38)], [x0 + 20, Y(950 + i * 40)], [x0 + 160, Y(990 + i * 46)]], k + 112 + i, t, 4, 0.6));
            const tr = [[x0 - 130, Y(1260)], [x0 + 152, Y(1260)], [x0 + 160, H + 40], [x0 - 134, H + 40]];
            body.add('dark', loop(tr, k + 116, t, 0.5, false)); body.add('ink', ring(tr, k + 117, t, 6, 0.7, false));
            body.add('ink', loop(rect(x0 - 130, Y(1255), x0 + 154, Y(1290)), k + 118, t, 0.5, false));
            for (let i = 0; i < 3; i++) body.add('soft', line([[x0 - 80 + i * 90, Y(1330)], [x0 - 72 + i * 90, H]], k + 119 + i, t, 3, 0.5));
            // head + beret
            const hx = x0 + 20, hy = Y(590);
            body.add('ink', line([[x0 + 5, Y(690)], [x0 + 12, Y(650)]], k + 130, t, 10, 0.5));
            body.add('paper', loop(ell(hx, hy, 92, 88, k + 131, 14), k + 131, t, 0.6)); body.add('ink', ring(ell(hx, hy, 92, 88, k + 132, 14), k + 132, t, 7, 0.8));
            const bt = [[hx - 92, hy - 40], [hx - 80, hy - 92], [hx - 20, hy - 118], [hx + 60, hy - 112], [hx + 112, hy - 80], [hx + 116, hy - 52], [hx + 60, hy - 50], [hx - 20, hy - 46]];
            body.add('cloth', loop(bt, k + 133, t, 0.6)); body.add('ink', ring(bt, k + 134, t, 6, 0.7)); body.add('ink', line([[hx + 6, hy - 118], [hx + 12, hy - 138]], k + 135, t, 6, 0.4));
            [[hx + 30, hy + 4], [hx + 72, hy]].forEach(([ex, ey], i) => body.add('ink', inkDot(ex, ey, 9, 10, k + 136 + i, t)));
            body.add('ink', line([[hx + 14, hy - 24], [hx + 44, hy - 32]], k + 138, t, 5, 0.4)); body.add('ink', line([[hx + 62, hy - 34], [hx + 88, hy - 26]], k + 139, t, 5, 0.4));
            body.add('ink', line([[hx + 40, hy + 46], [hx + 72, hy + 40]], k + 140, t, 5, 0.4));
            // round gauze pad with the opening
            const PR = R * 2.2;
            body.add('paper', loop(ell(wx, cy, PR, PR * 0.95, k + 150, 16), k + 150, t, 0.6)); body.add('ink', ring(ell(wx, cy, PR, PR * 0.95, k + 151, 16), k + 151, t, 5, 0.6));
            for (let q = 0; q < 14; q++) { const a = q / 14 * 6.283; body.add('soft', line([[wx + Math.cos(a) * PR * 0.72, cy + Math.sin(a) * PR * 0.68], [wx + Math.cos(a) * PR * 0.9, cy + Math.sin(a) * PR * 0.86]], k + 152 + q, t, 3, 0.3)); }
          } else {
          // skin panel (side of the torso) fills the frame from the shoulder down
          const sk = [[W * 0.06, H * 0.2], [W * 0.62, H * 0.17], [W + 40, H * 0.22], [W + 40, H + 40], [W * 0.02, H + 40]].map(([x, y]) => [x, y + (y < H ? br : 0)]);
          body.add('skin', loop(sk, k + 1, t, 0.6, false));
          body.add('ink', line([[W * 0.06, H * 0.2 + br], [W * 0.02, H * 0.6], [W * 0.05, H + 30]], k + 2, t, 7, 0.8));
          for (let i = 0; i < 4; i++) { const y = H * 0.24 + i * 70 + br; body.add('soft', line([[W * 0.16, y + 40], [W * 0.5, y], [W * 0.9, y + 30]], k + 3 + i, t, 4, 0.6)); }
          // shirt pulled back on the left, trousers + belt at the bottom
          const sh = [[-40, H * 0.12], [W * 0.2, H * 0.14], [W * 0.17, H * 0.5], [W * 0.22, H * 0.82], [-40, H * 0.86]].map(([x, y]) => [x + Math.sin(t * 1.2 + y * 0.01) * 4, y + br]);
          body.add('cloth', loop(sh, k + 10, t, 0.8)); body.add('ink', line(sh.slice(1, 4), k + 11, t, 6, 0.8));
          for (let i = 0; i < 4; i++) body.add('soft', line([[W * 0.02, H * 0.2 + i * 160 + br], [W * 0.14, H * 0.24 + i * 160 + br]], k + 12 + i, t, 3, 0.6));
          const ty = P.trousers ?? 0.84, tr = [[-40, H * ty + br], [W + 40, H * (ty - 0.04) + br], [W + 40, H + 40], [-40, H + 40]];
          if (P.hem) { const hm = [[-40, H * (ty - 0.07) + br], [W + 40, H * (ty - 0.11) + br], [W + 40, H * (ty - 0.02) + br], [-40, H * (ty + 0.02) + br]].map(([x, y], i) => [x, y + (i > 1 ? Math.sin(t * 1.4 + x * 0.01) * 6 : 0)]); body.add('cloth', loop(hm, k + 24, t, 0.6, false)); for (let i = 0; i < 6; i++) body.add('soft', line([[i * 190 + 30, H * (ty - 0.07) + br], [i * 190 + 60, H * (ty - 0.0) + br]], k + 25 + i, t, 3, 0.5)); }
          body.add('dark', loop(tr, k + 20, t, 0.5, false));
          body.add('ink', loop([[-40, H * (ty - 0.02) + br], [W + 40, H * (ty - 0.06) + br], [W + 40, H * (ty - 0.02) + br], [-40, H * (ty + 0.02) + br]], k + 21, t, 0.5, false));
          body.add('paper', loop(rect(W * 0.62, H * (ty - 0.055) + br, W * 0.72, H * (ty - 0.01) + br), k + 22, t, 0.4, false));
          body.add('ink', ring(rect(W * 0.62, H * (ty - 0.055) + br, W * 0.72, H * (ty - 0.01) + br), k + 23, t, 5, 0.5, false));
          if (P.flaps) { const cx0 = wx, top = wy - 330, bot = H * (P.trousers ?? 0.84) - 20;
            [[-1], [1]].forEach(([sg], i) => { const x1 = cx0 + sg * 175, x2 = cx0 + sg * 420, sw = Math.sin(t * 1.3 + i) * 5;
              const fl = [[x1, top], [x2, top - 20], [x2, bot], [x1 + sg * 20 + sw, bot], [x1 - sg * 12 + sw, (top + bot) / 2]];
              body.add('cloth', loop(fl, k + 200 + i, t, 0.6, false)); body.add('ink', line([fl[0], fl[4], fl[3]], k + 202 + i, t, 6, 0.7));
              for (let q = 0; q < 3; q++) body.add('soft', line([[x1 + sg * (60 + q * 60), top + 30], [x1 + sg * (70 + q * 60), bot - 20]], k + 204 + i * 3 + q, t, 3, 0.5)); });
            [0, 1, 2].forEach(q => body.add('ink', inkDot(cx0 + 205, wy - 240 + q * 160, 9, 9, k + 212 + q, t))); }
          // round gauze pad round the window
          { const cx = wx, cy = wy + br, PR = R * 2.1;
            body.add('paper', loop(ell(cx, cy, PR, PR * 0.95, k + 30, 16), k + 30, t, 0.6)); body.add('ink', ring(ell(cx, cy, PR, PR * 0.95, k + 31, 16), k + 31, t, 5, 0.6));
            for (let q = 0; q < 16; q++) { const a = q / 16 * 6.283; body.add('soft', line([[cx + Math.cos(a) * PR * 0.74, cy + Math.sin(a) * PR * 0.7], [cx + Math.cos(a) * PR * 0.9, cy + Math.sin(a) * PR * 0.86]], k + 40 + q, t, 3, 0.3)); } }
          }
          // the opening (both modes)
          body.add('dark', loop(ell(wx, cy, R * 1.25, R * 1.15, k + 55, 12), k + 55, t, 0.5));
          body.add('ink', ring(ell(wx, cy, R * 1.25, R * 1.15, k + 56, 12), k + 56, t, 4, 0.5));
          body.add('hole', loop(ell(wx, cy, R, R * 0.92, k + 52, 12), k + 52, t, 0.5));
          body.add('ink', ring(ell(wx, cy, R, R * 0.92, k + 53, 12), k + 53, t, 8, 0.5));
          body.add('ink', loop(ell(wx + 6, cy + 8, R * 0.62, R * 0.55, k + 54, 10), k + 54, t, 0.5));
          // hand + cuff from the top right holding the string
          if (P.hand !== false) {
          const low = (P.lower ?? 60) * progIO(lt, 0, Math.max(1, dur));
          const hx = wx + 40 + Math.sin(t * 1.1) * 8, hy = H * (P.hand_y ?? 0.2) + low + Math.sin(t * 1.5) * 6;
          const cuff = [[W + 60, hy - 170], [hx + 90, hy - 90], [hx + 40, hy - 10], [W + 60, hy + 80]];
          hand.add('coat', loop(cuff, k + 60, t, 0.6, false)); hand.add('ink', ring(cuff, k + 61, t, 6, 0.7, false));
          hand.add('paper', line([[hx + 92, hy - 92], [hx + 40, hy - 8]], k + 62, t, 18, 0.5));
          [0, 1].forEach(j => hand.add('gold', inkDot(hx + 140 + j * 60, hy - 60 + j * 20, 11, 11, k + 63 + j, t)));
          const hd = [[hx + 70, hy - 80], [hx - 10, hy - 70], [hx - 40, hy - 30], [hx - 20, hy + 6], [hx + 50, hy + 10]];
          hand.add('paper', loop(hd, k + 70, t, 0.6)); hand.add('ink', ring(hd, k + 71, t, 6, 0.7));
          hand.add('ink', line([[hx - 30, hy - 40], [hx - 54, hy - 64], [hx - 34, hy - 78]], k + 72, t, 6, 0.6));
          // string + foods popping on at their cues
          const F = P.food || [{ kind: 'meat', at: 0.2 }];
          const vis = F.map((f, i) => spring(lt, atOr(cues, f.at, 0.2 + i * 0.6), 0.5));
          const len = Math.max(120, cy - R - 40 - hy);
          hangString(hand, [hx - 40, hy - 50], len, F.map(f => ({ kind: f.kind, s: P.food_s ?? 1.7 })), k + 80, t, 0.6, vis, P.gap ?? 0.36);
          }
          if (P.ring) { const ra = atOr(cues, P.ring, 0), pr = Math.max(0, lt - ra) % 1.2 / 1.2;
            if (lt >= ra) { body.add('red', ring(ell(wx, cy, R * (1.5 + pr), R * (1.4 + pr), k + 90, 16), k + 90, t, 10 * (1 - pr) + 1, 1)); body.add('red', ring(ell(wx, cy, R * 1.55, R * 1.45, k + 91, 16), k + 91, t, 9, 1)); } }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          body.flush(); hand.flush(); over.flush();
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sw_cut
  SH.sw_cut = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 601;
      const mode = P.mode || 'drop';
      const root = el(svg, 'g');
      const body = pens(el(root, 'g'), ['flesh', 'lining', 'paper', 'skin', 'soft', 'ink'], { flesh: 0.85 });
      const mid = pens(el(root, 'g'), ['gold', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink'], { gold: 0.55 });
      const tools = pens(el(root, 'g'), ['paper', 'dark', 'soft', 'red', 'ink']);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 700);
      // stomach outline (J shape): gullet top right-centre, big bulge left, pylorus bottom right
      const S0 = [[600, 300], [610, 430], [700, 520], [780, 660], [800, 830], [760, 980], [860, 1060], [960, 1100], [1000, 1180],
        [900, 1200], [760, 1150], [600, 1140], [430, 1080], [330, 950], [300, 780], [340, 610], [430, 490], [520, 440], [520, 300]];
      const holeY = 760, skinX = 150;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, br = Math.sin(t * 1.6) * 5;
          const S = S0.map(([x, y], i) => [x + Math.sin(t * 1.3 + i) * 4, y + br * (y / H)]);
          // body interior beyond the skin line, ribs at the top
          const skin = []; for (let i = 0; i <= 10; i++) { const y = 180 + i * (H - 140) / 10; skin.push([skinX + Math.sin(i * 1.3) * 10 + (y > 600 && y < 920 ? -20 : 0), y]); }
          body.add('flesh', loop(skin.concat([[W + 40, H + 40], [W + 40, 180]]), k + 1, t, 0.5, false));
          body.add('ink', line(skin, k + 2, t, 8, 0.8));
          for (let i = 0; i < 4; i++) { const y = 230 + i * 70; body.add('paper', line([[skinX + 10, y + 70], [W * 0.5, y], [W + 20, y + 40]], k + 3 + i, t, 22, 0.6)); body.add('soft', line([[skinX + 10, y + 70], [W * 0.5, y], [W + 20, y + 40]], k + 8 + i, t, 4, 0.6)); }
          for (let i = 0; i < 14; i++) { const x = skinX + 60 + hn(k + i, 1) * (W - skinX - 80), y = 400 + hn(k + i, 2) * (H - 460); body.add('soft', line([[x, y], [x + 24, y + 10]], k + 20 + i, t, 3, 0.5)); }
          // tunnel from the skin to the stomach wall
          const tun = [[skinX - 40, holeY - 40], [345, holeY - 40], [345, holeY + 40], [skinX - 40, holeY + 40]];
          body.add('lining', loop(tun, k + 40, t, 0.5, false));
          body.add('ink', line([[skinX - 30, holeY - 42], [345, holeY - 44]], k + 41, t, 6, 0.6)); body.add('ink', line([[skinX - 30, holeY + 42], [345, holeY + 44]], k + 42, t, 6, 0.6));
          // stomach + duodenum + gullet
          body.add('lining', loop(S, k + 50, t, 0.6)); body.add('ink', ring(S, k + 51, t, 9, 0.8));
          const inner = S.map(([x, y]) => [lerp(x, 560, 0.1), lerp(y, 820, 0.08)]);
          body.add('paper', loop(inner.slice(2, 15).concat([[560, 900]]), k + 52, t, 0.5));
          for (let i = 0; i < 6; i++) { const y = 600 + i * 80, x0 = 360 + Math.abs(i - 3) * 20; body.add('soft', line([[x0, y], [x0 + 80, y + 20], [x0 + 160, y - 10], [x0 + 240, y + 15], [x0 + 300 - i * 10, y]], k + 60 + i, t, 4, 0.8)); }
          body.add('lining', line([[1000, 1180], [1040, 1400], [980, 1600], [1060, H + 40]], k + 70, t, 70, 0.6));
          body.add('ink', line([[970, 1200], [1005, 1400], [945, 1600], [1020, H + 40]], k + 71, t, 6, 0.6));
          body.add('ink', line([[1040, 1190], [1078, 1400], [1018, 1600], [1100, H + 40]], k + 72, t, 6, 0.6));
          // foods on the string through the tunnel
          const foods = P.food || ['meat', 'bread', 'leaf'];
          const out = [skinX - 140, holeY - 260], gate = [skinX + 20, holeY], inside = [520, 840];
          let tip, sc = 1, dissolve = 0;
          if (mode === 'drop') {
            const d = atOr(cues, P.drop, 0.3), pu = atOr(cues, P.pull, null);
            const u = progIO(lt, d, 1.4), v = pu != null ? progIO(lt, pu, 1.3) : 0;
            const din = u < 0.4 ? [lerp(out[0], gate[0], u / 0.4), lerp(out[1], gate[1], u / 0.4)] : [lerp(gate[0], inside[0], (u - 0.4) / 0.6), lerp(gate[1], inside[1], (u - 0.4) / 0.6)];
            tip = v > 0 ? (v < 0.6 ? [lerp(inside[0], gate[0], v / 0.6), lerp(inside[1], gate[1], v / 0.6)] : [lerp(gate[0], out[0], (v - 0.6) / 0.4), lerp(gate[1], out[1], (v - 0.6) / 0.4)]) : din;
            sc = pu != null && lt >= pu ? lerp(1, 0.5, prog(lt, pu - 0.1, 0.4)) : 1;
          } else {
            tip = inside.slice();
            const a = atOr(cues, P.acid, 0.6); dissolve = prog(lt, a, 1.8);
            sc = lerp(1, 0.3, dissolve);
          }
          // string: from the top-left hand-off outside, through the gate, to the tip
          const pts = [[-20, 360], [skinX - 60, holeY - 120]];
          if (tip[0] > gate[0]) pts.push([skinX - 20, holeY], gate);
          pts.push([tip[0] + Math.sin(t * 2) * 4, tip[1] - 60]);
          mid.add('soft', line(pts, k + 80, t, 3, 0.5, 0));
          foods.forEach((f, i) => { const p = [tip[0] + (i - 1) * 95 * sc, tip[1] + (i % 2 ? -26 : 14) * sc]; mid.add('ink', line([[tip[0], tip[1] - 60], [p[0], p[1] - 30 * sc]], k + 81 + i, t, 2.5, 0.4, 0)); food(mid, f, p[0], p[1], 1.7 * sc, k + 90 + i * 7, t, Math.sin(t * 1.3 + i) * 0.15); });
          if (mode === 'acid') {
            // gastric juice pool, drops from the wall, fizz round the food
            const a = atOr(cues, P.acid, 0.6), on = prog(lt, a - 0.4, 0.6);
            if (on > 0) {
              const pool = []; for (let i = 0; i <= 10; i++) { const x = 350 + i * 39; pool.push([x, 960 + Math.sin(t * 2 + i) * 8]); }
              mid.add('gold', loop(pool.concat([[730, 1010], [690, 1100], [600, 1115], [440, 1060], [345, 975]]), k + 120, t, 0.6));
              for (let i = 0; i < 9; i++) { const ph = (t * 0.7 + hn(k + i, 3)) % 1, x = 380 + hn(k + i, 4) * 380, y = lerp(560, 950, ph); mid.add('gold', loop(ell(x, y, 9, 13, k + 130 + i, 8), k + 130 + i, t, 0.4)); mid.add('ink', ring(ell(x, y, 9, 13, k + 140 + i, 8), k + 140 + i, t, 3, 0.4)); }
              for (let i = 0; i < 10; i++) { const ph = (t * 1.3 + hn(k + i, 5)) % 1, ang = hn(k + i, 6) * 6.28, r = 60 + ph * 110; const x = inside[0] + Math.cos(ang) * r, y = inside[1] + Math.sin(ang) * r * 0.7; mid.add('ink', ring(ell(x, y, 7 + ph * 6, 7 + ph * 6, k + 150 + i, 8), k + 150 + i, t, 3, 0.4)); }
            }
          }
          // clock: hands spin through hours on the cue
          if (P.clock !== false && mode === 'drop') {
            const cx = 870, cy = 420, r = 110, hc = atOr(cues, P.hours, null), sp = hc != null ? progIO(lt, hc, 1.6) : 0;
            tools.add('paper', loop(ell(cx, cy, r, r, k + 200, 16), k + 200, t, 0.6)); tools.add('ink', ring(ell(cx, cy, r, r, k + 201, 16), k + 201, t, 7, 0.6));
            for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; tools.add('ink', line([[cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78], [cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9]], k + 202 + i, t, 4, 0.3)); }
            const mA = -1.57 + lt * 0.5 + sp * 6.283 * 4, hA = -1.57 + 0.4 + sp * 6.283 * 4 / 12;
            tools.add('ink', line([[cx, cy], [cx + Math.cos(mA) * r * 0.75, cy + Math.sin(mA) * r * 0.75]], k + 220, t, 6, 0.4));
            tools.add('red', line([[cx, cy], [cx + Math.cos(hA) * r * 0.5, cy + Math.sin(hA) * r * 0.5]], k + 221, t, 9, 0.4));
          }
          // millstones (grinding) crossed out on the cue
          if (P.mill !== false && mode === 'acid') {
            const cx = (P.mill_x ?? 0.8) * W, cy = 440, g = atOr(cues, P.ground, null), rot = t * 1.5;
            [[0, 'dark'], [-46, 'paper']].forEach(([dy, c], i) => {
              const top = ell(cx, cy + dy, 120, 36, k + 230 + i, 16);
              tools.add(c, loop(top.concat([]), k + 230 + i, t, 0.5));
              tools.add('ink', ring(top, k + 232 + i, t, 5, 0.6));
            });
            tools.add('dark', loop(rect(cx - 120, cy, cx + 120, cy + 36), k + 234, t, 0.4, false));
            tools.add('ink', line([[cx - 120, cy], [cx - 120, cy + 36], [cx, cy + 50], [cx + 120, cy + 36], [cx + 120, cy]], k + 235, t, 5, 0.5));
            for (let i = 0; i < 6; i++) { const a = rot + i * 1.047; tools.add('soft', line([[cx + Math.cos(a) * 20, cy - 46 + Math.sin(a) * 6], [cx + Math.cos(a) * 110, cy - 46 + Math.sin(a) * 32]], k + 240 + i, t, 3, 0.4)); }
            tools.add('ink', ring(ell(cx, cy - 46, 20, 7, k + 250, 8), k + 250, t, 4, 0.3));
            if (g != null && lt >= g) {
              const p1 = prog(lt, g, 0.25), p2 = prog(lt, g + 0.2, 0.25);
              tools.add('red', line([[cx - 150, cy - 130], [lerp(cx - 150, cx + 150, p1), lerp(cy - 130, cy + 110, p1)]], k + 260, t, 18, 0.8));
              if (p2 > 0.02) tools.add('red', line([[cx + 150, cy - 130], [lerp(cx + 150, cx - 150, p2), lerp(cy - 130, cy + 110, p2)]], k + 261, t, 18, 0.8));
            }
          }
          body.flush(); mid.flush(); tools.flush();
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sw_book
  SH.sw_book = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 801;
      const root = el(svg, 'g');
      const desk = pens(el(root, 'g'), ['wood', 'woodD', 'soft', 'ink']);
      const book = pens(el(root, 'g'), ['dark', 'paper', 'lining', 'gold', 'soft', 'red', 'ink']);
      const txt = el(root, 'g');
      const t1 = el(txt, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 62, 'text-anchor': 'middle', fill: INK.ink });
      const t2 = el(txt, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 62, 'text-anchor': 'middle', fill: INK.ink });
      const t3 = el(txt, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 72, 'text-anchor': 'middle', fill: INK.red });
      const T = P.title || ['GASTRIC', 'JUICE']; t1.textContent = T[0] || ''; t2.textContent = T[1] || ''; t3.textContent = P.year || '1833';
      const flipP = pens(el(root, 'g'), ['paper', 'ink']);
      const items = pens(el(root, 'g'), ['paper', 'dark', 'gold', 'red', 'soft', 'ink']);
      const rings = pens(el(root, 'g'), ['gold']);
      const castG = el(root, 'g'), over = pens(el(root, 'g'), ['cloth', 'paper', 'dark', 'meat', 'fat', 'bread', 'leaf', 'soft', 'red', 'ink']);
      const cast = P.kasif ? castOf(castG, over, [P.kasif], sd + 300) : [];
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 700);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const dy = H * 0.3;
          desk.add('wood', loop(rect(-40, dy, W + 40, H + 40), k + 1, t, 0.4, false));
          desk.add('ink', line([[-40, dy], [W + 40, dy]], k + 2, t, 6, 0.5));
          for (let i = 0; i < 12; i++) { const y = dy + 60 + i * (H - dy) / 12; desk.add('soft', line([[-20, y], [W * 0.3, y + 10 * Math.sin(i)], [W * 0.7, y - 8], [W + 20, y + 6]], k + 10 + i, t, 2.5, 0.6)); }
          // book (open), centred
          const bx = W / 2, by = H * 0.47, bw = 470, bh = 600, rise = Math.sin(t * 0.8) * 3;
          const cover = rect(bx - bw - 24, by - bh / 2 - 20, bx + bw + 24, by + bh / 2 + 24);
          book.add('dark', loop(cover, k + 20, t, 0.5, false)); book.add('ink', ring(cover, k + 21, t, 6, 0.6, false));
          const pl = [[bx - bw, by - bh / 2], [bx - 6, by - bh / 2 + 16 + rise], [bx - 6, by + bh / 2 + 6], [bx - bw, by + bh / 2]];
          const pr = [[bx + 6, by - bh / 2 + 16 + rise], [bx + bw, by - bh / 2], [bx + bw, by + bh / 2], [bx + 6, by + bh / 2 + 6]];
          [pl, pr].forEach((p, i) => { book.add('paper', loop(p, k + 22 + i, t, 0.4, false)); book.add('ink', ring(p, k + 24 + i, t, 4, 0.5, false)); });
          book.add('soft', line([[bx, by - bh / 2 + 16], [bx, by + bh / 2 + 6]], k + 26, t, 5, 0.4));
          // left page: title, rule lines, year
          const L0 = bx - bw / 2 - 3;
          t1.setAttribute('x', f1(L0)); t1.setAttribute('y', f1(by - 150)); t2.setAttribute('x', f1(L0)); t2.setAttribute('y', f1(by - 80));
          t3.setAttribute('x', f1(L0)); t3.setAttribute('y', f1(by + 200));
          book.add('ink', line([[L0 - 140, by - 40], [L0 + 140, by - 40]], k + 30, t, 4, 0.4));
          for (let i = 0; i < 4; i++) book.add('soft', line([[L0 - 150 + (i % 2) * 30, by + 10 + i * 34], [L0 + 150 - (i % 2) * 30, by + 10 + i * 34]], k + 31 + i, t, 4, 0.4));
          // right page: stomach sketch draws itself (+ string with food)
          const R0 = bx + bw / 2 + 3, dp = prog(lt, 0.5, 1.6);
          const sk = [[30, -230], [36, -170], [90, -120], [130, -30], [120, 70], [170, 130], [140, 170], [40, 150], [-80, 120], [-140, 20], [-140, -80], [-90, -150], [-20, -180], [-24, -230]].map(([x, y]) => [R0 + x * 1.15 - 10, by - 20 + y * 1.05]);
          const n = Math.max(2, Math.round(sk.length * dp));
          if (dp > 0.02) book.add('lining', loop(sk, k + 40, t, 0.4));
          if (dp > 0.02) book.add('ink', line(sk.slice(0, n), k + 41, t, 6, 0.6));
          if (dp > 0.6) {
            book.add('ink', line([[R0 - 200, by - 200], [R0 - 170, by - 60], [R0 - 30, by - 10]], k + 42, t, 2.5, 0.3, 0));
            book.add('red', inkDot(R0 - 30, by + 6, 18, 14, k + 43, t));
            book.add('ink', ring(ell(R0 - 30, by + 6, 18, 14, k + 44, 8), k + 44, t, 3.5, 0.4));
          }
          // a page turning at the start (right -> left)
          const fp = prog(lt, 0, 0.9);
          if (fp < 1) {
            const xe = lerp(bx + bw, bx - bw, fp), lift = Math.sin(fp * Math.PI) * 90;
            const pg = [[bx, by - bh / 2 + 14], [xe, by - bh / 2 - lift], [xe, by + bh / 2 - lift * 0.6], [bx, by + bh / 2 + 6]];
            flipP.add('paper', loop(pg, k + 50, t, 0.4, false)); flipP.add('ink', ring(pg, k + 51, t, 4, 0.5, false));
          }
          // inkwell + quill (bottom left), candle (bottom right), spectacles
          const iy = H * 0.88, ix = W * 0.2;
          const well = [[ix - 80, iy], [ix - 70, iy - 100], [ix + 70, iy - 100], [ix + 80, iy]];
          items.add('dark', loop(well, k + 60, t, 0.4, false)); items.add('ink', ring(well, k + 61, t, 6, 0.6, false));
          const qa = Math.sin(t * 1.1) * 0.05;
          const q0 = [ix + 10, iy - 100], q1 = [ix + 10 + Math.sin(0.5 + qa) * 330, iy - 100 - Math.cos(0.5 + qa) * 330];
          const fe = []; for (let i = 0; i <= 6; i++) { const u = 0.35 + i * 0.1; fe.push([lerp(q0[0], q1[0], u) + 40 * Math.sin(u * 3), lerp(q0[1], q1[1], u)]); }
          for (let i = 6; i >= 0; i--) { const u = 0.35 + i * 0.1; fe.push([lerp(q0[0], q1[0], u) - 30 * Math.sin(u * 3) + 20, lerp(q0[1], q1[1], u) + 20]); }
          items.add('paper', loop(fe, k + 62, t, 0.6)); items.add('ink', ring(fe, k + 63, t, 4, 0.6));
          items.add('ink', line([q0, q1], k + 64, t, 5, 0.5));
          const cx = W * 0.82, cy = H * 0.9, cd = rect(cx - 30, cy - 220, cx + 30, cy);
          items.add('paper', loop(cd, k + 70, t, 0.4, false)); items.add('ink', ring(cd, k + 71, t, 5, 0.5, false));
          items.add('dark', loop(ell(cx, cy + 4, 90, 28, k + 72, 12), k + 72, t, 0.4)); items.add('ink', ring(ell(cx, cy + 4, 90, 28, k + 73, 12), k + 73, t, 5, 0.5));
          const fl = 1 + Math.sin(t * 13) * 0.12;
          items.add('gold', loop(ell(cx + Math.sin(t * 7) * 4, cy - 260, 20, 40 * fl, k + 74, 8), k + 74, t, 0.5));
          items.add('red', loop(ell(cx + Math.sin(t * 7) * 3, cy - 252, 9, 18 * fl, k + 75, 8), k + 75, t, 0.4));
          [[-1], [1]].forEach(([sg], i) => items.add('ink', ring(ell(W * 0.52 + sg * 60, H * 0.86, 46, 36, k + 76 + i, 10), k + 76 + i, t, 5, 0.5)));
          items.add('ink', line([[W * 0.52 - 14, H * 0.855], [W * 0.52 + 14, H * 0.855]], k + 78, t, 4, 0.3));
          // the book's reach: gold rings spreading from it
          const wa = atOr(cues, P.world, null);
          if (wa != null && lt >= wa) for (let j = 0; j < 3; j++) {
            const u = ((lt - wa) * 0.6 + j / 3) % 1, rx = (bw + 60) * (1 + u * 0.7), ry = (bh / 2 + 60) * (1 + u * 0.7);
            rings.add('gold', ring(ell(bx, by, rx, ry, k + 90 + j, 18), k + 90 + j, t, 12 * (1 - u) + 1, 1));
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          desk.flush(); book.flush(); flipP.flush(); items.flush(); rings.flush(); over.flush();
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
