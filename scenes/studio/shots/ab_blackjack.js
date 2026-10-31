// ab_blackjack: shots for the Ada Blackjack Short (Stickstory 2026-10-31): five people landed on Wrangel Island in
// 1921, the food ran out, three men crossed the sea ice for help and vanished, Ada nursed the last one until he died,
// then, alone and afraid of polar bears, she learned to shoot and built a lookout until a ship came in 1923.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any polar / Arctic survival story.
// Uses td__lib.js (TD.label, TD.figure) at build time (lazily: this file loads first).
//
// K (figure) = TD.figure spec {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq, accessory}
//   + for the heroine (P.ada): hood: true (fur-trimmed red parka hood around the head), rifle: false|"carry"|"aim"|
//     {mode: "carry"|"aim", ang (aim, deg), side: "front" (carry on the facing side instead of behind)}
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight (giant Fraunces words, highlight in a red box)
// Bear       = {x, y (ground 0..1 H), s: 1 (1 = 600 px long), face: 1|-1, to (x at the end), at, dur, look: cue (lifts head)}
//
// SHOTS.ab_ice — the island camp on the snow: canvas tent, an optional lookout platform on driftwood posts (builds up
//   plank by plank from cue "build"), the heroine (on the ground or on the deck, rifle), polar bears walking on the ice,
//   a muzzle puff + birds flushing on cue "shot", the cat, snowfall, foreground snow drifts and ice blocks to the frame
//   bottom.  P: {camp: {x: 0.3, s: 1} | false, platform: {x, w: 300, h: 300, build: cue|null} | false, ada: K,
//   bears: [Bear], shot: cue, cat: {x, y, s, face} | false, kasif: K, labels, lines, highlight, snow: 40, gy: 1150}
// SHOTS.ab_hut — inside the canvas tent: sloping canvas walls, ridge pole, a hanging oil lamp (cue "out": the flame
//   dies), crates; mode "food": the heroine pries open a crate (cue "open"), it is empty, tins roll out; mode "nurse":
//   a cot with a sick man under a blanket (breathing stops on cue "out"), the heroine sits beside him.
//   P: {mode, ada: K, cat, labels, kasif, gy: 1150}
// SHOTS.ab_trek — the frozen sea: pack ice and pressure ridges; three men with a sledge walk away towards the horizon
//   (shrinking with distance), footprints behind; storm: true (blowing snow, the men fade out on cue "gone" and the
//   footprints fill in). P: {men: 3, from: [x, y, s], to: [x, y, s], at, dur, gone: cue, storm, watch: [K...], labels}
// SHOTS.ab_shore — the island shore in summer: open water with floes, a two-masted schooner sails in (ship.at) and
//   drops anchor; the heroine waves from the shingle with the cat. P: {ship: {from, to, y, s, at, dur}, ada, cat,
//   labels, lines, highlight, kasif}
// SHOTS.ab_map — an old Arctic chart: Siberia, Alaska, Bering Strait, Wrangel Island; a dashed red route from Nome to
//   the island is drawn (route.at), a small ship rides it; labels pop in. P: {route: {at, dur}, island: cue, labels}
// cues: hit (punch) + the names above + labels / seq / words "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const person = (parent, K, sd, narrator) => window.TD.figure(el(parent, 'g'), Object.assign({}, K, narrator ? {} : { hat: false }), sd);
  const SNOW = () => INK.paperLight;
  const SHADE = () => mix(INK.blue, INK.paperLight, 0.72);
  const ICE = () => mix(INK.blue, INK.paperLight, 0.55);
  const WOOD = () => mix(INK.stain, INK.inkSoft, 0.35);
  const CANVAS = () => mix(INK.paperDark, INK.paperLight, 0.35);
  const HOOD = () => INK.red;

  // ------------------------------------------------------------------ giant words (Fraunces, highlight in a red box)
  function words(parent, P, W, H, sd) {
    const out = [];
    (P.lines || []).forEach((Ln, li) => {
      const size = Ln.size || 130, y = (Ln.y ?? 0.17 + li * 0.09) * H;
      const ts = Ln.words.map(w => { const g = el(parent, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
      const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), sc = Math.min(1, (W - 120) / tot);
      let x = W / 2 - tot * sc / 2;
      ts.forEach((o, i) => { o.x = x + ws[i] * sc / 2; o.y = y; o.ww = ws[i]; o.size = size; o.sc = sc; o.at = (Ln.at || [])[i]; o.k = li * 10 + i; x += (ws[i] + gap) * sc; out.push(o); });
    });
    return {
      update(lt, t, cues) {
        out.forEach(o => {
          const a = atOr(cues, o.at, 0.1 + o.k * 0.2), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5), b = boil(sd + 50 + o.k, t, 1.2);
          o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          o.g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1((o.hl ? -3 : 0) + (1 - p) * -6)}) scale(${(o.sc * lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
          o.tx.setAttribute('y', f1(o.size * 0.35));
          if (o.hl) {
            o.tx.setAttribute('fill', INK.paperLight); o.tx.setAttribute('style', '');
            const bw = o.ww + 50, bh = o.size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
            o.box.setAttribute('d', inkLoop(pts, { seed: sd + 60 + o.k, t, smooth: false })); o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 70 + o.k, t, closed: true, smooth: false }));
          }
        });
      },
    };
  }

  // ------------------------------------------------------------------ snowfall (light flakes, wind to the left)
  function snowfall(parent, sd, W, H, n, wind = 1, big = 1) {
    const f = inkEl(parent, INK.paperLight), r = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.35));
    const FL = Array.from({ length: n }, (_, i) => ({ x: hn(sd + i, 1), y: hn(sd + i, 2), s: 0.5 + hn(sd + i, 3), v: 0.6 + hn(sd + i, 4) * 0.8 }));
    return {
      update(lt, t) {
        const F = [], R = [];
        FL.forEach((q, i) => {
          const u = (q.y + lt * 0.11 * q.v * (1 + wind * 0.8)) % 1, y = -40 + u * (H + 80);
          let x = ((q.x - lt * 0.05 * wind * q.v) % 1 + 1) % 1 * (W + 80) - 40 + Math.sin(lt * 1.4 + i) * 14;
          const rr = (5 + q.s * 5) * big;
          if (wind > 1.5) { R.push(lineS([[x, y], [x + 36 * wind, y - 8]], sd + 300 + i, t, 3, 0.3)); }
          F.push(loopS(ell(x, y, rr, rr, 6), sd + i, t, 0.4)); R.push(ringS(ell(x, y, rr, rr, 6), sd + 100 + i, t, 2, 0.4));
        });
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ foreground snow drifts + ice blocks to the bottom
  function snowFront(parent, sd, W, H, gy, o = {}) {
    const fillE = inkEl(parent, SNOW()), shade = inkEl(parent, SHADE()), blkF = inkEl(parent, ICE()), blkL = inkEl(parent, SNOW()), lines = inkEl(parent), soft = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.2));
    const R = rng(sd * 7 + 3), blocks = [];
    const bx = o.blocks ?? [[0.06, 0.86, 1.1], [0.9, 0.82, 1.25], [0.62, 0.95, 0.9], [0.28, 0.98, 1.3]];
    bx.forEach(([u, v, s], i) => {
      const cx = u * W, cy = v * H, w = 150 * s, h = 120 * s, sk = (R() - 0.5) * 0.5;
      blocks.push({ pts: [[cx - w, cy + h * 0.4], [cx - w * 0.8 + sk * 40, cy - h * 0.7], [cx + w * 0.1, cy - h * (0.9 + R() * 0.3)], [cx + w * 0.9, cy - h * 0.5], [cx + w, cy + h * 0.4]], cx, cy, w, h });
    });
    const drift = []; for (let i = 0; i <= 20; i++) { const x = -30 + i * (W + 60) / 20; drift.push([x, gy + 30 + Math.sin(i * 1.3 + sd) * 18 + Math.sin(i * 0.47 + sd * 2) * 26]); }
    return {
      update(t) {
        const k = sd * 5;
        fillE.setAttribute('d', loopS(drift.concat([[W + 30, H + 40], [-30, H + 40]]), k + 1, t, 0.8, false));
        const S = [], L = [lineS(drift, k + 2, t, 5, 0.8)], SO = [];
        for (let j = 0; j < 9; j++) { const y = gy + 120 + j * ((H - gy - 120) / 9), x0 = hn(sd + j, 5) * W * 0.6; S.push(loopS([[x0, y], [x0 + 260 + j * 20, y - 12], [x0 + 300 + j * 22, y + 16], [x0 + 20, y + 22]], k + 10 + j, t, 0.8)); SO.push(lineS([[x0 + 30, y + 6], [x0 + 240, y - 6]], k + 30 + j, t, 3, 0.6)); }
        const BF = [], BL = [];
        blocks.forEach((b, i) => {
          BF.push(loopS(b.pts, k + 50 + i, t, 0.8, false)); L.push(ringS(b.pts, k + 60 + i, t, 6, 0.8, false));
          BL.push(loopS([b.pts[1], b.pts[2], [b.cx + b.w * 0.05, b.cy - b.h * 0.35], [b.cx - b.w * 0.6, b.cy - b.h * 0.3]], k + 70 + i, t, 0.6, false));
          SO.push(lineS([[b.cx - b.w * 0.2, b.cy - b.h * 0.2], [b.cx + b.w * 0.5, b.cy + b.h * 0.1]], k + 80 + i, t, 3, 0.5));
        });
        shade.setAttribute('d', S.join(' ')); blkF.setAttribute('d', BF.join(' ')); blkL.setAttribute('d', BL.join(' '));
        lines.setAttribute('d', L.join(' ')); soft.setAttribute('d', SO.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ polar bear, side view (facing right at face 1)
  const BEAR = [[-0.5, -0.2], [-0.46, -0.36], [-0.36, -0.44], [-0.15, -0.46], [0.08, -0.5], [0.2, -0.47], [0.32, -0.4], [0.42, -0.37], [0.47, -0.4], [0.5, -0.36],
    [0.58, -0.31], [0.62, -0.27], [0.57, -0.23], [0.44, -0.23], [0.34, -0.19], [0.22, -0.17], [0, -0.15], [-0.28, -0.16], [-0.45, -0.14]];
  const BLEGS = [[0.23, 0.0], [0.15, 0.5], [-0.33, 0.5], [-0.4, 0.0]];
  function bear(parent, sd) {
    const g = el(parent, 'g'), farL = inkEl(g, SHADE()), body = inkEl(g, SNOW()), nearL = inkEl(g, SNOW()), shadeE = inkEl(g, SHADE(), { 'fill-opacity': 0.8 }), ring = inkEl(g), fur = inkEl(g, mix(INK.inkSoft, INK.paperLight, 0.3)), dots = inkEl(g);
    return {
      update(t, o) {
        const L = 600 * (o.s ?? 1), fc = o.face ?? 1, x = o.x, y = o.y, ph = o.ph || 0, k = sd * 3, look = clamp01(o.look || 0);
        const bob = Math.abs(Math.sin(ph * Math.PI * 2)) * L * 0.006;
        const P = (u, v) => [x + fc * u * L, y + v * L - bob];
        const pts = BEAR.map(([u, v], i) => (i >= 6 && i <= 13) ? P(u, v - look * 0.08 * (u - 0.2) / 0.4) : P(u, v));
        const FL = [], NL = [], R = [];
        BLEGS.forEach(([u, off], i) => {
          const sw = Math.sin(2 * Math.PI * (ph + off)) * 0.06, lift = Math.max(0, Math.sin(2 * Math.PI * (ph + off))) * 0.03;
          const top = P(u, -0.22), knee = P(u + sw * 0.5, -0.1), foot = P(u + sw, -lift), toe = P(u + sw + 0.05, -lift);
          const leg = [top, knee, foot, toe], w = L * 0.085;
          (i % 2 ? FL : NL).push(lineS(leg, k + 10 + i, t, w, 0.6)); R.push(lineS(leg, k + 20 + i, t, w + 9, 0.6));
        });
        // outline rings drawn as fat ink strokes under the fills: draw order far legs (shade), ring, body, near legs
        farL.setAttribute('d', FL.join(' '));
        ring.setAttribute('d', ringS(pts, k + 1, t, 7, 0.8));
        body.setAttribute('d', loopS(pts, k + 2, t, 0.8));
        nearL.setAttribute('d', NL.join(' '));
        shadeE.setAttribute('d', loopS([P(-0.42, -0.2), P(-0.1, -0.18), P(0.25, -0.2), P(0.2, -0.24), P(-0.2, -0.24)], k + 3, t, 0.6));
        const F = []; for (let i = 0; i < 7; i++) { const u = -0.38 + i * 0.1; F.push(lineS([P(u, -0.36), P(u - 0.03, -0.3)], k + 30 + i, t, 3, 0.5)); }
        F.push(...NL.map((_, i) => ''));
        fur.setAttribute('d', F.join(' '));
        const eye = P(0.5, -0.335 - look * 0.025), nose = P(0.615, -0.275 - look * 0.035), ear = P(0.43, -0.4 - look * 0.02);
        dots.setAttribute('d', [loopS(ell(eye[0], eye[1], L * 0.011, L * 0.011, 7), k + 40, t, 0.3), loopS(ell(nose[0], nose[1], L * 0.017, L * 0.013, 7), k + 41, t, 0.3),
          ringS(ell(ear[0], ear[1], L * 0.02, L * 0.02, 7), k + 42, t, 4, 0.3), lineS([P(0.6, -0.245), P(0.55, -0.24)], k + 43, t, 3, 0.3)].join(' ') + ' ' +
          NL.map((_, i) => '').join(''));
        // the near legs' outline: ring strokes are under the body; redraw a thin ink outline for the near legs on top
        dots.setAttribute('d', dots.getAttribute('d') + ' ' + BLEGS.filter((_, i) => !(i % 2)).map(([u, off], j) => {
          const i = j * 2, sw = Math.sin(2 * Math.PI * (ph + off)) * 0.06, lift = Math.max(0, Math.sin(2 * Math.PI * (ph + off))) * 0.03;
          const knee = P(u + sw * 0.5, -0.1), foot = P(u + sw, -lift), toe = P(u + sw + 0.05, -lift);
          return lineS([P(u + 0.045, -0.16), [knee[0] + fc * L * 0.04, knee[1]], [toe[0] + fc * L * 0.03, toe[1]]], k + 50 + i, t, 4, 0.5) + ' ' + lineS([P(u - 0.045, -0.16), [knee[0] - fc * L * 0.04, knee[1]], [foot[0] - fc * L * 0.04, foot[1]]], k + 60 + i, t, 4, 0.5);
        }).join(' '));
        return { head: P(0.5, -0.33), mid: P(0, -0.32) };
      },
    };
  }
  function bearState(B, W, H, lt, cues) {
    const x1 = (B.to ?? B.x) * W, x0 = (B.x ?? 0.7) * W, a = atOr(cues, B.at, 0), d = B.dur ?? 3, p = lt >= a ? clamp01((lt - a) / d) : 0;
    const x = lerp(x0, x1, p), L = 600 * (B.s ?? 1), moving = B.to != null && p > 0 && p < 1;
    const la = B.look == null ? null : atOr(cues, B.look, null);
    return { x, y: (B.y ?? 0.6) * H, s: B.s ?? 1, face: B.face ?? (x1 < x0 ? -1 : 1), ph: moving || B.walk ? (Math.abs(x - x0) / (0.42 * L) + (B.walk ? lt * 0.6 : 0)) : 0, look: la == null ? 0 : prog(lt, la, 0.5) };
  }

  // ------------------------------------------------------------------ canvas tent (A-frame), local x = centre, y = ground
  function tent(parent, sd) {
    const f = inkEl(parent, CANVAS()), sh = inkEl(parent, mix(CANVAS(), INK.inkSoft, 0.3)), door = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.3)), r = inkEl(parent), snowCap = inkEl(parent, SNOW());
    return {
      update(t, x, y, s) {
        const k = sd * 3, w = 230 * s, h = 250 * s, d = 70 * s;
        const front = [[x - w, y], [x, y - h], [x + w, y]], side = [[x, y - h], [x + d * 2.2, y - h - d * 0.5], [x + w + d * 2.2, y - d * 0.5], [x + w, y]];
        f.setAttribute('d', loopS(front, k + 1, t, 0.8, false)); sh.setAttribute('d', loopS(side, k + 2, t, 0.8, false));
        door.setAttribute('d', loopS([[x - w * 0.3, y], [x, y - h * 0.62], [x + w * 0.22, y], [x + w * 0.05, y - h * 0.1]], k + 3, t, 0.6, false));
        snowCap.setAttribute('d', loopS([[x - w * 0.15, y - h * 0.85], [x, y - h - 6], [x + d * 2.2, y - h - d * 0.5 - 6], [x + d * 2.3, y - h - d * 0.5 + 18], [x + 10, y - h + 26]], k + 4, t, 0.6));
        r.setAttribute('d', [ringS(front, k + 5, t, 6, 0.8, false), ringS(side, k + 6, t, 5, 0.8, false), lineS([[x - w * 0.5, y - h * 0.5], [x - w * 1.5, y]], k + 7, t, 2.5, 0.5),
          lineS([[x, y - h], [x, y - h - 40 * s]], k + 8, t, 7, 0.5), lineS([[x + w + d * 2.2, y - d * 0.5], [x + w + d * 3.3, y + 10]], k + 9, t, 2.5, 0.5)].join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ lookout platform on driftwood posts
  //   update(t, x (centre), y (ground), w, h, p (0..1 build)) -> deck y
  function platform(parent, sd) {
    const wood = inkEl(parent, WOOD()), r = inkEl(parent), snowE = inkEl(parent, SNOW());
    return {
      update(t, x, y, w, h, p = 1) {
        const k = sd * 3, F = [], R = [], dy = y - h;
        const posts = [x - w / 2, x + w / 2, x - w / 2 + 34, x + w / 2 - 34];
        posts.forEach((px, i) => { const q = clamp01(p * 3 - i * 0.25); if (q <= 0) return; const top = lerp(y, dy - 40, q), lean = (i % 2 ? 1 : -1) * 6; const pts = [[px - 9, y], [px - 8 + lean, top], [px + 8 + lean, top], [px + 9, y]]; F.push(loopS(pts, k + i, t, 0.6, false)); R.push(ringS(pts, k + 10 + i, t, 4, 0.6, false)); });
        const pd = clamp01(p * 3 - 1.1);
        for (let j = 0; j < 6; j++) { const q = clamp01(pd * 6 - j); if (q <= 0) continue; const x0 = x - w / 2 - 20 + j * (w + 40) / 6, x1 = x0 + (w + 40) / 6 - 4, yy = dy - (1 - q) * 60; const pts = [[x0, yy - 14], [x1, yy - 15], [x1, yy + 6], [x0, yy + 5]]; F.push(loopS(pts, k + 20 + j, t, 0.6, false)); R.push(ringS(pts, k + 30 + j, t, 4, 0.6, false)); }
        const pl = clamp01(p * 3 - 2);
        if (pl > 0) {   // ladder + cross braces + rail
          const lx = x + w / 2 + 70, n = 6;
          R.push(lineS([[lx, y], [lerp(lx, x + w / 2 + 6, pl), lerp(y, dy, pl)]], k + 40, t, 6, 0.6), lineS([[lx + 50, y], [lerp(lx + 50, x + w / 2 + 50, pl), lerp(y, dy + 4, pl)]], k + 41, t, 6, 0.6));
          for (let j = 1; j < n * pl; j++) { const u = j / n; R.push(lineS([[lerp(lx, x + w / 2 + 6, u), lerp(y, dy, u)], [lerp(lx + 50, x + w / 2 + 50, u), lerp(y, dy + 4, u)]], k + 42 + j, t, 4, 0.4)); }
          R.push(lineS([[x - w / 2, y - 20], [x + w / 2, dy + 30]], k + 50, t, 4, 0.6), lineS([[x + w / 2, y - 20], [x - w / 2, dy + 30]], k + 51, t, 4, 0.6));
          R.push(lineS([[x - w / 2 - 14, dy - 14], [x - w / 2 - 12, dy - 14 - 80 * pl]], k + 52, t, 5, 0.6), lineS([[x - w / 2 - 12, dy - 14 - 80 * pl], [x - w / 2 + 70, dy - 14 - 80 * pl]], k + 53, t, 5, 0.6));
        }
        wood.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
        snowE.setAttribute('d', pd >= 1 ? loopS([[x - w / 2 - 20, dy - 14], [x - w / 2 + 40, dy - 26], [x + w / 2 - 30, dy - 24], [x + w / 2 + 20, dy - 14]], k + 60, t, 0.5) : '');
        return dy - 14;
      },
    };
  }

  // ------------------------------------------------------------------ the heroine: hatless figure + red parka hood + rifle
  function heroine(parent, K, sd) {
    if (!K) return null;
    const fig = person(parent, Object.assign({ pose: 'idle' }, K), sd, false);
    const gunW = inkEl(parent, mix(INK.stain, INK.red, 0.25)), gun = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.1));
    const hoodF = inkEl(parent, HOOD(), { 'fill-rule': 'evenodd' }), hoodR = inkEl(parent), fur = inkEl(parent, INK.paperLight), furR = inkEl(parent, INK.inkSoft);
    return {
      update(lt, t, cues, W, H) {
        const r = fig.update(lt, t, cues, W, H), sc = K.scale ?? 1, hd = r.head, k = sd * 3, R0 = 72 * sc;
        if (K.hood !== false) {
          const cx = hd[0] + r.face * R0 * 0.04, cy = hd[1] - R0 * 0.02;
          const outer = ell(cx - r.face * R0 * 0.12, cy - R0 * 0.1, R0 * 1.36, R0 * 1.34, 16), inner = ell(cx, cy, R0 * 1.12, R0 * 1.1, 16);
          hoodF.setAttribute('d', loopS(outer, k + 1, t, 0.8) + ' ' + loopS(inner.slice().reverse(), k + 2, t, 0.6));
          hoodR.setAttribute('d', ringS(outer, k + 3, t, 5, 0.8));
          // fur ruff: scalloped ring just outside the face
          const fo = [], fi = [];
          for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, rr = R0 * (i % 2 ? 1.2 : 1.3); fo.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
          for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; fi.push([cx + Math.cos(a) * R0 * 1.02, cy + Math.sin(a) * R0 * 1.0]); }
          fur.setAttribute('d', loopS(fo, k + 10, t, 0.6, false) + ' ' + loopS(fi.slice().reverse(), k + 11, t, 0.5));
          fur.setAttribute('fill-rule', 'evenodd');
          const TK = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.2; TK.push(lineS([[cx + Math.cos(a) * R0 * 1.08, cy + Math.sin(a) * R0 * 1.06], [cx + Math.cos(a) * R0 * 1.2, cy + Math.sin(a) * R0 * 1.18]], k + 30 + i, t, 2.5, 0.4)); }
          furR.setAttribute('d', TK.join(' ') + ' ' + ringS(fo, k + 12, t, 2.5, 0.6, false));
        }
        const rf = typeof K.rifle === 'object' ? K.rifle : { mode: K.rifle };
        if (rf.mode) {
          const h = r.hand, f = r.face;
          let A, B;
          if (rf.mode === 'aim') { const ang = (rf.ang ?? 8) * Math.PI / 180; A = [h[0] - f * Math.cos(ang) * 170 * sc, h[1] + Math.sin(ang) * 170 * sc]; B = [h[0] + f * Math.cos(ang) * 250 * sc, h[1] - Math.sin(ang) * 250 * sc]; }
          else { const g = rf.side === 'front' ? -f : f; A = [hd[0] - g * 30 * sc, hd[1] + 360 * sc]; B = [hd[0] - g * 175 * sc, hd[1] - 30 * sc]; }
          // rifle in its own frame: u along the gun (butt -> muzzle), v across (+v = trigger side, towards the ground)
          const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L;
          let nx = -dy, ny = dx; if (ny < 0) { nx = -nx; ny = -ny; }
          const Q = (u, v) => [A[0] + dx * u * L + nx * v * sc, A[1] + dy * u * L + ny * v * sc];
          const wood = [Q(0, -22), Q(0.08, -15), Q(0.27, -9), Q(0.64, -8), Q(0.66, 6), Q(0.37, 10), Q(0.31, 15), Q(0.25, 11), Q(0.07, 30), Q(0, 28)];
          const recv = [Q(0.25, -15), Q(0.4, -15), Q(0.4, 4), Q(0.25, 4)];
          gunW.setAttribute('d', loopS(wood, k + 50, t, 0.5, false));
          gun.setAttribute('d', [lineS([Q(0.24, -11), Q(1, -11)], k + 51, t, 9 * sc, 0.4), loopS(recv, k + 52, t, 0.4, false), ringS(wood, k + 53, t, 4, 0.5, false),
            lineS([Q(0.97, -13), Q(0.97, -24)], k + 54, t, 5 * sc, 0.3), lineS([Q(0.36, -15), Q(0.38, -27)], k + 55, t, 6 * sc, 0.3),
            ringS([Q(0.28, 6), Q(0.34, 6), Q(0.33, 20), Q(0.29, 20)], k + 56, t, 3.5, 0.3), lineS([Q(0.03, 0), Q(0.03, 18)], k + 57, t, 2.5, 0.3)].join(' '));
          r.muzzle = B;
        }
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ the cat (sitting, tail swishes)
  function cat(parent, sd) {
    const f = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.25)), eye = inkEl(parent, INK.gold);
    return {
      update(t, x, y, s = 1, face = 1) {
        const k = sd * 3, P = (u, v) => [x + face * u * s, y + v * s];
        const body = [P(-40, 0), P(-48, -50), P(-30, -95), P(0, -110), P(22, -100), P(30, -60), P(40, 0)];
        const head = ell(x + face * 6 * s, y - 128 * s, 34 * s, 30 * s, 10);
        const ears = [[P(-20, -148), P(-26, -180), P(-4, -156)], [P(16, -154), P(28, -182), P(32, -146)]];
        const sw = Math.sin(t * 2.2 + sd) * 0.5;
        const tail = [P(36, -6), P(80, -12), P(104 + sw * 20, -50), P(96 + sw * 40, -92)];
        const blink = (t * 0.35 + sd * 0.1) % 1 < 0.04;
        f.setAttribute('d', [loopS(body, k + 1, t, 0.6), loopS(head, k + 2, t, 0.6), ...ears.map((e, i) => loopS(e, k + 3 + i, t, 0.4, false)), lineS(tail, k + 6, t, 16 * s, 0.6)].join(' '));
        eye.setAttribute('d', blink ? '' : [loopS(ell(x + face * -6 * s, y - 130 * s, 7 * s, 5 * s, 6), k + 7, t, 0.3), loopS(ell(x + face * 18 * s, y - 130 * s, 7 * s, 5 * s, 6), k + 8, t, 0.3)].join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ two-masted schooner (side view, bow at face)
  function schooner(parent, sd) {
    const sail = inkEl(parent, INK.paperLight), sailS = inkEl(parent, mix(INK.paperDark, INK.paperLight, 0.4)), hull = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.15)), stripe = inkEl(parent, INK.red), r = inkEl(parent), smoke = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.5 });
    return {
      update(t, x, y, s = 1, face = -1, furl = 0) {
        const k = sd * 3, rock = Math.sin(t * 1.3) * 2.2, P = (u, v) => { const a = rock * Math.PI / 180, uu = u * face; return [x + (uu * Math.cos(a) - v * Math.sin(a)) * s, y + (uu * Math.sin(a) + v * Math.cos(a)) * s + Math.sin(t * 1.7) * 4]; };
        const H_ = [P(-300, -70), P(330, -78), P(270, 10), P(-250, 14), P(-300, -40)];
        hull.setAttribute('d', loopS(H_, k + 1, t, 0.8, false));
        stripe.setAttribute('d', loopS([P(-296, -60), P(326, -68), P(318, -54), P(-292, -48)], k + 2, t, 0.5, false));
        const m1 = [P(-60, -70), P(-50, -470)], m2 = [P(140, -76), P(150, -420)];
        const fu = 1 - clamp01(furl);
        const s1 = [P(-46, -450), P(-46, -100), P(-46 - 230 * fu, -96), P(-46 - 170 * fu, -420)], s2 = [P(154, -400), P(154, -104), P(154 - 180 * fu, -100), P(154 - 120 * fu, -380)], jib = [P(160, -400), P(330, -84), P(190, -100)];
        sail.setAttribute('d', [s1, s2].map((q, i) => loopS(q, k + 3 + i, t, 0.8, false)).join(' ')); sailS.setAttribute('d', loopS(jib, k + 5, t, 0.8, false));
        r.setAttribute('d', [ringS(H_, k + 6, t, 6, 0.8, false), lineS(m1, k + 7, t, 8, 0.5), lineS(m2, k + 8, t, 8, 0.5), ringS(s1, k + 9, t, 4, 0.8, false), ringS(s2, k + 10, t, 4, 0.8, false), ringS(jib, k + 11, t, 4, 0.8, false),
          lineS([P(-50, -470), P(-300, -74)], k + 12, t, 2.5, 0.4), lineS([P(150, -420), P(380, -60)], k + 13, t, 2.5, 0.4), lineS([P(330, -78), P(420, -110)], k + 14, t, 6, 0.4)].join(' '));
        const SM = []; for (let i = 0; i < 4; i++) { const u = (t * 0.3 + i / 4) % 1, c = P(40 - 120 * u, -150 - 220 * u); SM.push(loopS(ell(c[0], c[1], (18 + u * 40) * s, (14 + u * 30) * s, 8), k + 20 + i, t, 0.8)); }
        smoke.setAttribute('d', '');
        void SM;
      },
    };
  }

  // ------------------------------------------------------------------ bird (flying, wings flap)
  function birds(parent, sd, n) {
    const r = inkEl(parent);
    return {
      update(lt, t, a, x0, y0) {
        if (a == null || lt < a) { r.setAttribute('d', ''); return; }
        const u = lt - a, B = [];
        for (let i = 0; i < n; i++) {
          const x = x0 + (60 + i * 50 + u * (180 + i * 40)) * (i % 2 ? 1 : 0.8), y = y0 - 60 - i * 40 - u * (150 + i * 30), fl = Math.sin(lt * 14 + i * 2) * 18, s = 1 + i * 0.1;
          B.push(lineS([[x - 36 * s, y - fl], [x - 12 * s, y - 6], [x, y + 4], [x + 12 * s, y - 6], [x + 36 * s, y - fl]], sd + i, t, 5, 0.4));
        }
        r.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ muzzle puff
  function puff(parent, sd) {
    const f = inkEl(parent, INK.paperLight), fl = inkEl(parent, INK.gold), r = inkEl(parent, INK.inkSoft);
    return {
      update(lt, t, a, M) {
        if (a == null || !M || lt < a || lt > a + 2.4) { f.setAttribute('d', ''); fl.setAttribute('d', ''); r.setAttribute('d', ''); return; }
        const u = lt - a, F = [], R = [];
        for (let i = 0; i < 5; i++) { const q = prog(lt, a + i * 0.04, 0.9), c = [M[0] + (20 + i * 38) * q, M[1] - (i % 2 ? 20 : -6) * q - u * 30], rr = (16 + i * 7) * q * (1 - clamp01((u - 1.4) / 1)); if (rr < 1) continue; const e = ell(c[0], c[1], rr, rr * 0.85, 9); F.push(loopS(e, sd + i, t, 0.8)); R.push(ringS(e, sd + 10 + i, t, 3, 0.8)); }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
        fl.setAttribute('d', u < 0.15 ? loopS([[M[0], M[1] - 16], [M[0] + 70, M[1]], [M[0], M[1] + 16]], sd + 30, t, 0.5, false) : '');
      },
    };
  }

  // ================================================================== ab_ice
  SH.ab_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 5101, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150;
      const far = inkEl(root, mix(INK.blue, INK.paperLight, 0.78)), farR = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.25));
      const bearsBack = el(root, 'g');
      const tracks = inkEl(root, SHADE());
      const tn = P.camp === false ? null : tent(el(root, 'g'), sd + 1);
      const pf = P.platform ? platform(el(root, 'g'), sd + 2) : null;
      const crates = inkEl(root, WOOD()), cratesR = inkEl(root);
      const bs = (P.bears || []).map((B, i) => ({ B, d: bear(el(bearsBack, 'g'), sd + 10 + i) }));
      const ct = P.cat ? cat(el(root, 'g'), sd + 3) : null;
      const ada = heroine(el(root, 'g'), P.ada, sd + 4);
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const pu = puff(el(root, 'g'), sd + 20), bd = birds(el(root, 'g'), sd + 30, 3);
      const fr = P.front === false ? null : snowFront(el(root, 'g'), sd + 5, W, H, gy, P.front || {});
      const sn = snowfall(el(top, 'g'), sd + 6, W, H, P.snow ?? 40, P.wind ?? 1);
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const CP = Object.assign({ x: 0.3, s: 1 }, P.camp || {}), PF = Object.assign({ x: 0.66, w: 300, h: 300 }, P.platform || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // far hills of the island (pale) on the horizon
          const hz = P.far_y ?? gy - 150, FP = [[-20, hz + 60]];
          for (let i = 0; i <= 12; i++) FP.push([i * W / 12, hz - 60 - 70 * Math.max(0, Math.sin(i * 0.9 + 1.3)) - 30 * Math.sin(i * 2.1)]);
          FP.push([W + 20, hz + 60]);
          if (P.hills !== false) { far.setAttribute('d', loopS(FP, k + 1, t, 0.8)); farR.setAttribute('d', lineS(FP.slice(1, -1), k + 2, t, 3, 0.8)); }
          // footprints over the snow
          if (P.tracks) { const T = []; P.tracks.forEach((tr, j) => { const n = 9; for (let i = 0; i < n; i++) { const u = i / (n - 1), x = lerp(tr[0] * W, tr[2] * W, u) + (i % 2 ? 12 : -12), y = lerp(tr[1] * H, tr[3] * H, u); T.push(loopS(ell(x, y, 14 * (0.6 + u * 0.4), 7 * (0.6 + u * 0.4), 7), k + 40 + j * 20 + i, t, 0.4)); } }); tracks.setAttribute('d', T.join(' ')); }
          if (tn) tn.update(t, CP.x * W, gy, CP.s);
          // two supply crates by the tent
          if (tn && P.crates !== false) { const C = [], R = []; [[CP.x * W - 300 * CP.s, 80, 70], [CP.x * W - 220 * CP.s, 60, 56]].forEach(([x, w, h], i) => { const q = [[x - w / 2, gy + 4], [x - w / 2, gy - h], [x + w / 2, gy - h - 2], [x + w / 2, gy + 4]]; C.push(loopS(q, k + 50 + i, t, 0.5, false)); R.push(ringS(q, k + 52 + i, t, 4, 0.5, false), lineS([q[1], q[3]], k + 54 + i, t, 3, 0.4)); }); crates.setAttribute('d', C.join(' ')); cratesR.setAttribute('d', R.join(' ')); }
          let deck = null;
          if (pf) { const ba = P.platform.build == null ? null : atOr(cues, P.platform.build, null); const p = ba == null ? 1 : (lt >= ba ? prog(lt, ba, P.platform.dur ?? 1.6) : 0); deck = pf.update(t, PF.x * W, gy, PF.w, PF.h, p); }
          bs.forEach(({ B, d }) => d.update(t, bearState(Object.assign({}, B, { s: (B.s ?? 1) * (1 + 0.03 * hit) }), W, H, lt, cues)));
          if (ct) ct.update(t, P.cat.x * W, P.cat.y * H, P.cat.s ?? 1, P.cat.face ?? 1);
          const ar = ada ? ada.update(lt, t, cues, W, H) : null;
          if (kas) kas.update(lt, t, cues, W, H);
          const sa = P.shot == null ? null : atOr(cues, P.shot, null);
          pu.update(lt, t, sa, ar && ar.muzzle);
          bd.update(lt, t, sa, ar && ar.muzzle ? ar.muzzle[0] : W * 0.6, ar && ar.muzzle ? ar.muzzle[1] - 120 : H * 0.3);
          if (fr) fr.update(t);
          sn.update(lt, t);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
          void deck;
        },
      };
    },
  };

  // ================================================================== ab_hut
  SH.ab_hut = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 5201, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150, mode = P.mode || 'food';
      const wallF = inkEl(root, CANVAS()), wallS = inkEl(root, mix(CANVAS(), INK.inkSoft, 0.25)), wallR = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2));
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.18 });
      const floorF = inkEl(root, mix(INK.stain, INK.paperDark, 0.45)), floorR = inkEl(root, mix(INK.inkSoft, INK.stain, 0.3));
      const crF = inkEl(root, WOOD()), crR = inkEl(root), lid = inkEl(root, mix(WOOD(), INK.paperLight, 0.2)), lidR = inkEl(root), inside = inkEl(root, mix(INK.ink, INK.stain, 0.3));
      const tinF = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.45)), tinR = inkEl(root);
      const cotF = inkEl(root, WOOD()), blanket = inkEl(root, mix(INK.red, INK.stain, 0.45)), pillow = inkEl(root, INK.paperLight), headF = inkEl(root, INK.paperLight), cotR = inkEl(root);
      const lampR = inkEl(root), lampG = inkEl(root, mix(INK.gold, INK.paperLight, 0.3)), flame = inkEl(root, INK.gold), flameC = inkEl(root, INK.red), smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.4 });
      const ct = P.cat ? cat(el(root, 'g'), sd + 3) : null;
      const ada = heroine(el(root, 'g'), P.ada, sd + 4);
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const front = inkEl(root, mix(INK.stain, INK.ink, 0.25)), frontR = inkEl(root);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const LP = Object.assign({ x: 0.52, y: 0.27 }, P.lamp || {}), CR = Object.assign({ x: 0.66, s: 1 }, P.crate || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const outA = P.out == null ? null : atOr(cues, P.out, null), out = outA == null ? 0 : prog(lt, outA, 0.45);
          // sloping canvas walls (left and right) + ridge pole at the top
          const L = [[-30, -30], [W * 0.3, -30], [-30, gy + 40]], R = [[W + 30, -30], [W * 0.7, -30], [W + 30, gy + 40]];
          wallF.setAttribute('d', loopS(L, k + 1, t, 0.8, false) + ' ' + loopS(R, k + 2, t, 0.8, false));
          const SE = []; for (let i = 1; i < 4; i++) { SE.push(lineS([[W * 0.3 * (1 - i / 4) - 30 * (i / 4), -30], [-30, lerp(-30, gy + 40, i / 4) + 0]], k + 10 + i, t, 3, 0.6), lineS([[W - W * 0.3 * (1 - i / 4) + 30 * (i / 4), -30], [W + 30, lerp(-30, gy + 40, i / 4)]], k + 14 + i, t, 3, 0.6)); }
          wallS.setAttribute('d', loopS([[W * 0.3, -30], [W * 0.7, -30], [W * 0.7, 40], [W * 0.3, 40]], k + 3, t, 0.6, false));
          wallR.setAttribute('d', [lineS([[W * 0.3, -30], [-30, gy + 40]], k + 4, t, 6, 0.8), lineS([[W * 0.7, -30], [W + 30, gy + 40]], k + 5, t, 6, 0.8), lineS([[-30, 40], [W + 30, 40]], k + 6, t, 14, 0.6), ...SE].join(' '));
          // lamp glow pool + floor
          const lx = LP.x * W, ly = LP.y * H, fl = (1 - out) * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3));
          glow.setAttribute('d', fl > 0.02 ? loopS(ell(lx, ly + 300, 520 * (0.9 + 0.1 * fl), 560 * (0.9 + 0.1 * fl), 16), k + 7, t, 1.2) : '');
          glow.setAttribute('fill-opacity', (0.2 * fl).toFixed(3));
          floorF.setAttribute('d', loopS([[-30, gy], [W + 30, gy - 6], [W + 30, H + 30], [-30, H + 30]], k + 8, t, 0.6, false));
          const FLR = [lineS([[-30, gy], [W + 30, gy - 6]], k + 9, t, 5, 0.6)]; for (let i = 0; i < 6; i++) { const y = gy + 60 + i * 110; FLR.push(lineS([[-30, y], [W + 30, y + 6]], k + 20 + i, t, 3, 0.6)); }
          floorR.setAttribute('d', FLR.join(' '));
          // lamp hanging from the ridge
          lampR.setAttribute('d', [lineS([[lx, 40], [lx, ly - 70]], k + 30, t, 3, 0.4), ringS([[lx - 34, ly - 70], [lx + 34, ly - 70], [lx + 44, ly + 40], [lx - 44, ly + 40]], k + 31, t, 5, 0.5, false), ringS(ell(lx, ly + 54, 50, 18, 10), k + 32, t, 5, 0.5)].join(' '));
          lampG.setAttribute('d', loopS([[lx - 34, ly - 70], [lx + 34, ly - 70], [lx + 44, ly + 40], [lx - 44, ly + 40]], k + 33, t, 0.5, false));
          lampG.setAttribute('fill', mix(mix(INK.gold, INK.paperLight, 0.3), INK.paperDark, out));
          const fh = 56 * fl;
          flame.setAttribute('d', fh > 3 ? loopS([[lx - 16, ly + 24], [lx - 10, ly - fh * 0.4], [lx + Math.sin(t * 7) * 6, ly + 24 - fh], [lx + 12, ly - fh * 0.4], [lx + 16, ly + 24]], k + 34, t, 0.6) : '');
          flameC.setAttribute('d', fh > 3 ? loopS([[lx - 7, ly + 22], [lx, ly + 22 - fh * 0.55], [lx + 7, ly + 22]], k + 35, t, 0.4) : '');
          if (outA != null && lt > outA) { const S = []; for (let i = 0; i < 4; i++) { const u = ((lt - outA) * 0.5 + i / 4) % 1; S.push(loopS(ell(lx + Math.sin(u * 7 + i) * 20, ly - 90 - u * 260, 16 + u * 30, 12 + u * 22, 8), k + 36 + i, t, 0.6)); } smoke.setAttribute('d', S.join(' ')); } else smoke.setAttribute('d', '');
          // crates
          const CF = [], CRr = [];
          const box = (x, y, w, h, i) => { const q = [[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h - 3], [x + w / 2, y]]; CF.push(loopS(q, k + 40 + i, t, 0.5, false)); CRr.push(ringS(q, k + 50 + i, t, 5, 0.5, false), lineS([[x - w / 2, y - h * 0.5], [x + w / 2, y - h * 0.5 - 2]], k + 60 + i, t, 3, 0.4)); };
          if (mode === 'food') {
            const cx = CR.x * W, cw = 300 * CR.s, ch = 210 * CR.s, oa = atOr(cues, P.open ?? 'open', dur * 0.3), op = lt >= oa ? spring(lt, oa, 0.6) : 0;
            box(W * 0.1, gy, 200, 160, 1); box(W * 0.12, gy - 160, 150, 120, 2); box(W * 0.92, gy, 190, 230, 3);
            box(cx, gy, cw, ch, 0);
            inside.setAttribute('d', op > 0.05 ? loopS([[cx - cw / 2 + 12, gy - ch - 2], [cx + cw / 2 - 12, gy - ch - 4], [cx + cw / 2 - 30, gy - ch + 30], [cx - cw / 2 + 30, gy - ch + 30]], k + 70, t, 0.4, false) : '');
            // lid tips up and slides off to the right
            const piv = [cx + cw / 2, gy - ch - 3], ang = -op * 1.9, rot = (u, v) => [piv[0] + u * Math.cos(ang) - v * Math.sin(ang) + op * 60, piv[1] + u * Math.sin(ang) + v * Math.cos(ang)];
            const lq = [rot(-cw - 10, 0), rot(10, 0), rot(10, -26), rot(-cw - 10, -26)];
            lid.setAttribute('d', loopS(lq, k + 71, t, 0.5, false)); lidR.setAttribute('d', ringS(lq, k + 72, t, 5, 0.5, false));
            // empty tins roll out across the floor
            const ta = atOr(cues, P.tins ?? 'tins', oa + 0.4), TF = [], TR = [];
            for (let i = 0; i < 3; i++) { const q = lt >= ta + i * 0.15 ? prog(lt, ta + i * 0.15, 1.6) : 0; if (q <= 0) continue; const x = cx - cw * 0.2 + i * 40 - q * (260 + i * 90), y = gy + 70 + i * 60, a = -q * 6 - i; const c = ell(x, y, 34, 40, 10).map(([px, py]) => [x + (px - x) * Math.cos(a) - (py - y) * Math.sin(a), y + (px - x) * Math.sin(a) + (py - y) * Math.cos(a)]); TF.push(loopS(c, k + 80 + i, t, 0.5)); TR.push(ringS(c, k + 85 + i, t, 5, 0.5), ringS(ell(x, y, 16, 20, 8), k + 90 + i, t, 3, 0.4)); }
            tinF.setAttribute('d', TF.join(' ')); tinR.setAttribute('d', TR.join(' '));
          } else {
            box(W * 0.1, gy, 200, 160, 1); box(W * 0.93, gy, 170, 300, 3);
            // cot with the sick man (head on a pillow at the right end, breathing until "out")
            const x0 = W * (P.cot_x0 ?? 0.38), x1 = W * (P.cot_x1 ?? 0.96), cy = gy - 150, br = (1 - out) * Math.sin(t * 1.6) * 7;
            cotF.setAttribute('d', loopS([[x0, cy], [x1, cy], [x1, cy + 26], [x0, cy + 26]], k + 100, t, 0.5, false));
            const bl = [[x0 - 10, cy + 30], [x0 + 20, cy - 70], [lerp(x0, x1, 0.4), cy - 96 - br], [lerp(x0, x1, 0.72), cy - 80 - br], [x1 - 150, cy - 40], [x1 - 140, cy + 30]];
            blanket.setAttribute('d', loopS(bl, k + 101, t, 0.6));
            const pl = [[x1 - 170, cy - 2], [x1 - 160, cy - 70], [x1 - 10, cy - 76], [x1, cy - 4]];
            pillow.setAttribute('d', loopS(pl, k + 102, t, 0.6));
            const hc = [x1 - 92, cy - 108 - br * 0.3];
            headF.setAttribute('d', loopS(ell(hc[0], hc[1], 54, 52, 12), k + 103, t, 0.6));
            cotR.setAttribute('d', [ringS([[x0, cy], [x1, cy], [x1, cy + 26], [x0, cy + 26]], k + 104, t, 5, 0.5, false), lineS([[x0 + 20, cy + 26], [x0 + 10, gy]], k + 105, t, 7, 0.5), lineS([[x1 - 20, cy + 26], [x1 - 10, gy]], k + 106, t, 7, 0.5),
              ringS(bl, k + 107, t, 5, 0.6), ringS(pl, k + 108, t, 4, 0.6), ringS(ell(hc[0], hc[1], 54, 52, 12), k + 109, t, 5, 0.6), lineS([[hc[0] - 30, hc[1] - 4], [hc[0] - 12, hc[1] - 2]], k + 110, t, 4, 0.3), lineS([[hc[0] + 6, hc[1] - 4], [hc[0] + 24, hc[1] - 6]], k + 111, t, 4, 0.3),
              lineS([[lerp(x0, x1, 0.25), cy - 60], [lerp(x0, x1, 0.45), cy - 70 - br]], k + 112, t, 3, 0.5), lineS([[lerp(x0, x1, 0.5), cy - 72 - br], [lerp(x0, x1, 0.62), cy - 66 - br]], k + 113, t, 3, 0.5)].join(' '));
          }
          crF.setAttribute('d', CF.join(' ')); crR.setAttribute('d', CRr.join(' '));
          if (ct) ct.update(t, P.cat.x * W, P.cat.y * H, P.cat.s ?? 1, P.cat.face ?? 1);
          if (ada) ada.update(lt, t, cues, W, H);
          if (kas) kas.update(lt, t, cues, W, H);
          // foreground: a rolled hide + a bucket at the bottom edge
          const FQ = [[-40, H - 220], [W * 0.34, H - 260], [W * 0.4, H - 170], [W * 0.36, H + 40], [-40, H + 40]], FQ2 = [[W * 0.72, H - 200], [W + 40, H - 250], [W + 40, H + 40], [W * 0.7, H + 40]];
          front.setAttribute('d', loopS(FQ, k + 120, t, 0.8) + ' ' + loopS(FQ2, k + 121, t, 0.8));
          frontR.setAttribute('d', [lineS(FQ.slice(0, 4), k + 122, t, 6, 0.8), lineS(FQ2.slice(0, 2), k + 123, t, 6, 0.8), lineS([[W * 0.05, H - 150], [W * 0.3, H - 180]], k + 124, t, 3, 0.6), lineS([[W * 0.08, H - 80], [W * 0.32, H - 110]], k + 125, t, 3, 0.6)].join(' '));
          void hit;
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ab_trek
  SH.ab_trek = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 5301, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150, hz = P.horizon ?? 760;
      const ridges = inkEl(root, ICE()), ridgeL = inkEl(root, SNOW()), ridgeR = inkEl(root);
      const prints = inkEl(root, SHADE()), sledF = inkEl(root, WOOD()), sledR = inkEl(root);
      const n = P.men ?? 3;
      const menG = [], men = Array.from({ length: n }, (_, i) => { const g = el(root, 'g'); menG.push(g); return window.TD.figure(el(g, 'g'), { hat: false, accessory: P.accessory || 'beret', scale: 1, pose: 'walk', x: 0, y: 0 }, sd + 10 + i); });
      const watch = (P.watch || []).map((K, i) => K.hood ? heroine(el(root, 'g'), K, sd + 40 + i) : person(root, K, sd + 40 + i, !!K.kasif));
      const fr = snowFront(el(root, 'g'), sd + 5, W, H, gy, P.front || { blocks: [[0.08, 0.84, 1.2], [0.94, 0.8, 1.35], [0.7, 0.97, 0.95], [0.3, 0.99, 1.3]] });
      const sn = snowfall(el(top, 'g'), sd + 6, W, H, P.snow ?? (P.storm ? 90 : 30), P.storm ? 2.6 : 0.8, P.storm ? 1.1 : 1);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const FR0 = P.from || [0.42, 0.74, 0.7], TO = P.to || [0.6, 0.47, 0.18];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // pressure ridges: rows of tilted ice blocks between the horizon and the ground
          const RF = [], RL = [], RR = [];
          [[hz + 40, 0.35, 0], [hz + 170, 0.6, 1], [gy - 40, 0.9, 2]].forEach(([y, s, row]) => {
            for (let i = 0; i < 7; i++) {
              if ((i + row) % 3 === 1 && row < 2) continue;
              const x = (i + 0.3 * row + hn(sd + i, row) * 0.4) * W / 6.2, w = 120 * s * (0.7 + hn(sd + i, row + 5) * 0.6), h = 90 * s * (0.6 + hn(sd + i, row + 9) * 0.8);
              if (row === 2 && x > W * 0.3 && x < W * 0.62) continue;   // the gap the men walk through
              const q = [[x - w, y], [x - w * 0.6, y - h * 0.8], [x + w * 0.1, y - h], [x + w * 0.7, y - h * 0.4], [x + w, y]];
              RF.push(loopS(q, k + row * 20 + i, t, 0.6, false)); RL.push(loopS([q[1], q[2], [x, y - h * 0.5]], k + 100 + row * 20 + i, t, 0.5, false)); RR.push(ringS(q, k + 200 + row * 20 + i, t, 4 + row, 0.6, false));
            }
          });
          ridges.setAttribute('d', RF.join(' ')); ridgeL.setAttribute('d', RL.join(' ')); ridgeR.setAttribute('d', RR.join(' '));
          // the men: walk from FR0 to TO (perspective: y up, scale down), fade on "gone"
          const a = atOr(cues, P.at, 0), d = P.dur ?? dur, p = lt >= a ? clamp01((lt - a) / d) : 0, e = 1 - Math.pow(1 - p, 1.3);
          const ga = P.gone == null ? null : atOr(cues, P.gone, null), gone = ga == null ? 0 : prog(lt, ga, 1.4);
          const pos = u => [lerp(FR0[0], TO[0], u) * W, lerp(FR0[1], TO[1], u) * H, lerp(FR0[2], TO[2], u)];
          const PR = [];
          for (let i = 0; i < 26; i++) { const u = i / 26 * e; if (u > e - 0.02) break; const c = pos(u), fill_ = ga == null ? 1 : 1 - clamp01((lt - ga) / 2.2 - (1 - u) * 0.3); if (fill_ <= 0.05) continue; for (let j = -1; j <= 1; j++) PR.push(loopS(ell(c[0] + j * 70 * c[2] + (i % 2 ? 10 : -10) * c[2], c[1] + 6, 16 * c[2] * fill_, 7 * c[2] * fill_, 7), k + 300 + i * 3 + j, t, 0.3)); }
          prints.setAttribute('d', PR.join(' '));
          const SF = [], SR = [];
          men.forEach((m, i) => {
            const u = Math.max(0, e - i * 0.035), c = pos(u), off = (i - (n - 1) / 2) * 170 * c[2];
            const K = m.K; K.x = 0; K.y = 0; K.face = TO[0] >= FR0[0] ? 1 : -1;
            menG[i].firstChild.setAttribute('transform', `translate(${f1(c[0] + off)} ${f1(c[1] - (i % 2) * 10 * c[2])}) scale(${c[2].toFixed(4)})`);
            K.pose = p > 0 && p < 1 ? 'walk' : 'idle';
            m.update(lt, t, cues, W, H);
          });
          // fade the men out on "gone" through each figure group's fill-opacity of its paths
          menG.forEach(grp => { grp.setAttribute('opacity', (1 - gone).toFixed(3)); grp.style.display = gone > 0.98 ? 'none' : ''; });
          // sledge behind the last man
          { const u = Math.max(0, e - n * 0.035 - 0.02), c = pos(u), s = c[2], x = c[0] - 40 * s, y = c[1];
            const q = [[x - 150 * s, y - 70 * s], [x + 150 * s, y - 70 * s], [x + 140 * s, y - 10 * s], [x - 150 * s, y - 10 * s]];
            SF.push(loopS(q, k + 400, t, 0.5, false)); SR.push(ringS(q, k + 401, t, Math.max(2, 5 * s), 0.5, false), lineS([[x - 170 * s, y], [x + 160 * s, y], [x + 200 * s, y - 30 * s]], k + 402, t, Math.max(2, 6 * s), 0.5), lineS([[x + 150 * s, y - 50 * s], [x + 300 * s, y - 170 * s]], k + 403, t, Math.max(1.5, 3 * s), 0.4));
            sledF.setAttribute('d', SF.join(' ')); sledR.setAttribute('d', SR.join(' ')); sledF.setAttribute('fill-opacity', (1 - gone).toFixed(3)); sledR.setAttribute('fill-opacity', (1 - gone).toFixed(3)); }
          watch.forEach(w => w && w.update(lt, t, cues, W, H));
          fr.update(t);
          sn.update(lt, t);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ab_shore
  SH.ab_shore = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 5401, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150, sea = P.sea ?? 860;
      const water = inkEl(root, mix(INK.blue, INK.paperLight, 0.62)), waves = inkEl(root, mix(INK.blue, INK.ink, 0.25));
      const floes = inkEl(root, SNOW()), floeR = inkEl(root);
      const shipG = el(root, 'g'), sh = schooner(shipG, sd + 1);
      const shore = inkEl(root, mix(INK.paperDark, INK.stain, 0.35)), shoreR = inkEl(root), pebbles = inkEl(root, INK.inkSoft);
      const drift = inkEl(root, WOOD()), driftR = inkEl(root);
      const ct = P.cat ? cat(el(root, 'g'), sd + 3) : null;
      const ada = heroine(el(root, 'g'), P.ada, sd + 4);
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const fr = snowFront(el(root, 'g'), sd + 5, W, H, gy + 120, P.front || { blocks: [[0.05, 0.9, 1.0], [0.95, 0.88, 1.2], [0.5, 1.0, 0.9]] });
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const SP = Object.assign({ from: 1.4, to: 0.6, y: 0.48, s: 0.8, at: 0, dur: 3 }, P.ship || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          water.setAttribute('d', loopS([[-30, sea], [W + 30, sea - 4], [W + 30, gy + 40], [-30, gy + 40]], k + 1, t, 0.6, false));
          const WV = []; for (let j = 0; j < 7; j++) { const y = sea + 30 + j * (gy - sea) / 7; for (let i = 0; i < 4; i++) { const x = ((i * 0.27 + j * 0.13 + lt * 0.02 * (1 + j * 0.2)) % 1) * (W + 200) - 100; WV.push(lineS([[x, y], [x + 30 + j * 8, y - 8], [x + 60 + j * 16, y]], k + 10 + j * 4 + i, t, 3 + j * 0.4, 0.5)); } }
          waves.setAttribute('d', WV.join(' '));
          const FL = [], FR_ = [];
          [[0.15, sea + 60, 0.5], [0.85, sea + 120, 0.7], [0.32, sea + 200, 0.9]].forEach(([u, y, s], i) => { const x = ((u + lt * 0.006 * (i + 1)) % 1.1) * W, q = [[x - 110 * s, y], [x - 80 * s, y - 24 * s], [x + 70 * s, y - 28 * s], [x + 120 * s, y]]; FL.push(loopS(q, k + 50 + i, t, 0.5, false)); FR_.push(ringS(q, k + 55 + i, t, 4, 0.5, false)); });
          floes.setAttribute('d', FL.join(' ')); floeR.setAttribute('d', FR_.join(' '));
          const sa = atOr(cues, SP.at, 0), sp = lt >= sa ? progIO(lt, sa, SP.dur) : 0, sx = lerp(SP.from, SP.to, sp) * W;
          sh.update(t, sx, SP.y * H, SP.s, -1, 0);
          const sl = [[-30, gy - 30], [W * 0.4, gy - 50], [W * 0.75, gy - 20], [W + 30, gy - 40], [W + 30, H + 30], [-30, H + 30]];
          shore.setAttribute('d', loopS(sl, k + 60, t, 0.6, false)); shoreR.setAttribute('d', lineS(sl.slice(0, 4), k + 61, t, 5, 0.6));
          const PB = []; for (let i = 0; i < 26; i++) { const x = hn(sd + i, 1) * W, y = gy + hn(sd + i, 2) * 160; PB.push(loopS(ell(x, y, 8 + hn(sd + i, 3) * 10, 5 + hn(sd + i, 4) * 6, 7), k + 70 + i, t, 0.3)); }
          pebbles.setAttribute('d', PB.join(' '));
          const dq = [[W * 0.62, gy + 10], [W * 0.95, gy - 20], [W * 0.96, gy + 6], [W * 0.63, gy + 34]];
          drift.setAttribute('d', loopS(dq, k + 100, t, 0.5, false)); driftR.setAttribute('d', ringS(dq, k + 101, t, 4, 0.5, false));
          if (ct) ct.update(t, P.cat.x * W, P.cat.y * H, P.cat.s ?? 1, P.cat.face ?? 1);
          if (ada) ada.update(lt, t, cues, W, H);
          if (kas) kas.update(lt, t, cues, W, H);
          fr.update(t);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ab_map
  // geography in stage px of a 1080×1920 frame (lon -186..-156 → x, lat 73..63 → y), scaled to W×H
  const SIB = [[-30, 640], [0, 670], [120, 720], [238, 780], [300, 850], [367, 914], [432, 951], [530, 1040], [587, 1122], [560, 1180], [520, 1240], [461, 1329], [400, 1310], [324, 1293], [240, 1330], [150, 1340], [60, 1400], [-30, 1420]];
  const AK = [[1110, 420], [1051, 487], [960, 580], [890, 640], [828, 683], [760, 730], [713, 780], [691, 853], [730, 900], [800, 960], [828, 1024], [780, 1060], [720, 1110], [644, 1188], [672, 1250], [742, 1317], [800, 1350], [864, 1378], [960, 1420], [1110, 1440]];
  const WRANGEL = [[150, 500], [190, 470], [250, 462], [320, 470], [360, 492], [340, 522], [280, 536], [210, 532], [160, 520]];
  const STL = [[530, 1480], [580, 1470], [640, 1478], [620, 1500], [560, 1504]];
  SH.ab_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 5501, top = el(svg, 'g'), root = el(top, 'g'), kx = W / 1080, ky = H / 1920;
      const S = pts => pts.map(([x, y]) => [x * kx, y * ky]);
      const seaH = inkEl(root, mix(INK.blue, INK.paperLight, 0.55));
      const land = inkEl(root, mix(INK.paperDark, INK.paperLight, 0.3)), landH = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.35)), coast = inkEl(root, INK.inkSoft);
      const isl = inkEl(root, INK.paperLight), islR = inkEl(root, INK.red);
      const route = inkEl(root, INK.red), shipE = inkEl(root, INK.ink), shipS = inkEl(root, INK.paperLight);
      const rose = inkEl(root, INK.inkSoft), roseF = inkEl(root, INK.red);
      const names = el(root, 'g');
      const nm = (txt, x, y, size, col, rot = 0, sp = 6) => { const tx = el(names, 'text', { x: x * kx, y: y * ky, 'font-family': FR, 'font-weight': 800, 'font-size': size, 'text-anchor': 'middle', fill: col, 'letter-spacing': sp, transform: `rotate(${rot} ${x * kx} ${y * ky})`, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` }); tx.textContent = txt; return tx; };
      (P.names || [['SIBERIA', 250, 1080, 64, INK.inkSoft, -12], ['ALASKA', 900, 820, 64, INK.inkSoft, 10], ['ARCTIC OCEAN', 640, 380, 56, mix(INK.blue, INK.ink, 0.3), 0], ['BERING SEA', 330, 1640, 52, mix(INK.blue, INK.ink, 0.3), 0]]).forEach(a => nm(...a));
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const RT = S([[742, 1317], [690, 1270], [640, 1230], [612, 1160], [620, 1060], [580, 900], [500, 760], [420, 640], [320, 560], [270, 520]]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // sea hatching (fills the whole frame, incl. the bottom)
          const SH_ = []; for (let j = 0; j < 30; j++) { const y = (300 + j * 56) * ky, x0 = ((j * 0.37) % 1) * W * 0.5; for (let i = 0; i < 3; i++) { const x = x0 + i * W * 0.36 + ((lt * 6) % 40); SH_.push(lineS([[x, y], [x + 40, y - 6], [x + 80, y]], k + j * 3 + i, t, 2.5, 0.5)); } }
          seaH.setAttribute('d', SH_.join(' '));
          const sib = S(SIB).concat([[-30, H + 30]]), ak = S(AK).concat([[W + 30, H + 30]]);
          sib.push([-30, H + 30]); ak.push([W + 30, H + 30]);
          land.setAttribute('d', loopS(sib.concat([[-30, H + 30]]), k + 200, t, 0.8) + ' ' + loopS(S(AK).concat([[W + 30, H + 30], [W + 60, 420]]), k + 201, t, 0.8));
          const LH = []; for (let i = 0; i < 12; i++) { LH.push(lineS([[20 + i * 30, (1400 + i * 30) * ky], [100 + i * 30, (1380 + i * 30) * ky]], k + 210 + i, t, 2.5, 0.5)); LH.push(lineS([[(900 + (i % 4) * 40) * kx, (1000 + i * 30) * ky], [(960 + (i % 4) * 40) * kx, (990 + i * 30) * ky]], k + 230 + i, t, 2.5, 0.5)); }
          landH.setAttribute('d', LH.join(' '));
          coast.setAttribute('d', lineS(S(SIB), k + 240, t, 5, 1) + ' ' + lineS(S(AK), k + 241, t, 5, 1) + ' ' + ringS(S(STL), k + 242, t, 4, 0.6));
          // the island: pops on cue "island", pulses
          const ia = atOr(cues, P.island ?? 'island', 0.3), ip = lt >= ia ? spring(lt, ia, 0.6) : 0, ic = [255 * kx, 500 * ky];
          const WI = S(WRANGEL).map(([x, y]) => [ic[0] + (x - ic[0]) * (0.6 + 0.4 * ip) * (1 + 0.08 * hit), ic[1] + (y - ic[1]) * (0.6 + 0.4 * ip) * (1 + 0.08 * hit)]);
          isl.setAttribute('d', loopS(WI, k + 250, t, 0.8));
          islR.setAttribute('d', ringS(WI, k + 251, t, 7, 0.8) + (ip > 0.1 ? ' ' + ringS(ell(ic[0], ic[1], 150 * ip + Math.sin(t * 3) * 6, 80 * ip + Math.sin(t * 3) * 4, 16), k + 252, t, 5, 1.2) : ''));
          // dashed route Nome -> Wrangel + ship riding it
          const ra = atOr(cues, (P.route || {}).at ?? 'route', 0.4), rp = lt >= ra ? progIO(lt, ra, (P.route || {}).dur ?? 2.4) : 0;
          const dense = inkSpline(RT, false, 6), L = []; let acc = 0; for (let i = 1; i < dense.length; i++) { acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]); L.push(acc); }
          const tot = L[L.length - 1] || 1, R = []; let ship = dense[0], dir = [0, -1];
          for (let i = 1; i < dense.length; i++) { const u = L[i - 1] / tot; if (u > rp) break; ship = dense[i]; dir = [dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]]; if (Math.floor(L[i - 1] / 26) % 2 === 0) R.push(lineS([dense[i - 1], dense[i]], k + 300 + i, t, 7, 0.4)); }
          route.setAttribute('d', R.join(' '));
          const sx = ship[0], sy = ship[1], bob = Math.sin(t * 3) * 4;
          shipE.setAttribute('d', rp > 0 ? loopS([[sx - 44, sy - 10 + bob], [sx + 44, sy - 10 + bob], [sx + 30, sy + 14 + bob], [sx - 32, sy + 14 + bob]], k + 400, t, 0.5, false) + ' ' + lineS([[sx, sy - 10 + bob], [sx, sy - 80 + bob]], k + 401, t, 4, 0.4) : '');
          shipS.setAttribute('d', rp > 0 ? loopS([[sx + 4, sy - 76 + bob], [sx + 40, sy - 20 + bob], [sx + 4, sy - 18 + bob]], k + 402, t, 0.5, false) : '');
          void dir;
          // compass rose bottom right (in the frame's lower third, nothing to read)
          const cx = 880 * kx, cy = 1680 * ky, rr = 110, ra2 = t * 0.05;
          const pts = []; for (let i = 0; i < 8; i++) { const a = ra2 + i * Math.PI / 4, r = i % 2 ? rr * 0.45 : rr; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
          rose.setAttribute('d', ringS(pts, k + 500, t, 4, 0.6, false) + ' ' + ringS(ell(cx, cy, rr * 0.25, rr * 0.25, 10), k + 501, t, 4, 0.5));
          roseF.setAttribute('d', loopS([[cx + Math.cos(ra2 - Math.PI / 2) * rr, cy + Math.sin(ra2 - Math.PI / 2) * rr], [cx + Math.cos(ra2) * rr * 0.2, cy + Math.sin(ra2) * rr * 0.2], [cx - Math.cos(ra2) * rr * 0.2, cy - Math.sin(ra2) * rr * 0.2]], k + 502, t, 0.4, false));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
