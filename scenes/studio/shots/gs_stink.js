// gs_stink: shots for "The Great Stink" Short (Stickstory 2026-11-01): in the hot summer of 1858 the Thames was an
// open sewer, Parliament sat on its bank, the curtains were soaked in chloride of lime, MPs talked of moving
// Parliament out of London, cholera had killed thousands while the sewer plans sat on a desk, and then the stink
// got the sewer law passed in 18 days (Bazalgette's intercepting sewers).
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any Victorian London / river / sewer story.
// Uses td__lib.js (TD.label) lazily at build time.
//
// Common
//   K (figure) = {x, y (ground 0..1 H), scale, pose, face: "left"|"right", dir, emotion, seq: [{at, pose, dir, face,
//     emotion}], hat: true (= the fez narrator; false = period figure), beard: "black"|"grey"|"short",
//     tophat: true (Victorian top hat, period figures only), kerchief: true | cue (white handkerchief over the nose
//     from that cue), stinky: true (green stink wisps round the head), walk: {to, at, dur} (walks from x to `to`),
//     bag: true (carries a carpet bag in the front hand)}
//   L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
//   lines + highlight = giant Fraunces words [{words, at: [cue...], y, size}], highlight word in a red box
//   stink: {n: 8, from: [[x, y]...] (0..1), at: cue|sec (wisps start), rise: 520, drift: 1 (to the right), w: 7}
//
// SHOTS.gs_river  — the Thames: Palace of Westminster on the far bank (clock tower, pinnacles, window rows), a brown
//   river from `water` (0..1 H) to the frame bottom with drifting filth and bubbles, stink wisps rising off the water
//   (and into the windows), optional rowing boat with the narrator (holding his nose), clean: true = clear water.
//   P: {water: 0.56, parl: {x: 0.5, y (base, 0..1 H; default = water), s: 1} | false, boat: {x, y, s, rock: 1} |
//   false, kasif: K, cast: [K], stink, clean, labels, lines, highlight, gy}
// SHOTS.gs_outfall — close on the river wall: a brick arch outfall gushing sewage into the brown river (stream from
//   cue "gush"), floating filth, a dead fish belly-up, heavy stink wisps. P: {wall: {x0: 0, x1: 0.62, top: 0.2},
//   arch: {x: 0.32, y: 0.5, r: 150}, gush: cue, water: 0.66, fish: true, stink, labels}
// SHOTS.gs_room    — inside Parliament: two tall Gothic lancet windows with heavy crimson curtains, a pail of chloride
//   of lime, an MP mopping the curtains with a long brush (cue "soak": the curtains darken from the hem up and
//   drip), cue "seep": stink wisps pour in through the windows, cast reacts; green leather benches in front.
//   P: {soak: cue, seep: cue, cast: [K], brush: 0 (cast index holding the brush) | -1, pail: {x: 0.5}, labels}
// SHOTS.gs_street  — a cobbled street: mode "road": Parliament small on the left under a stink cloud, a signpost on
//   the right whose arrow boards pop in (signs: [{text, at}]), MPs walking off with bags; mode "wall": a brick wall
//   with cholera posters (posters: [{text, at, head}]) and a cast-iron street pump (pump: {x}). P: {mode, signs,
//   posters, pump, cast, stink, labels, lines, highlight}
// SHOTS.gs_desk    — an office: wall calendar (pages: [{text, at}] flip on cues; days: {from, to, at, dur, n} rapid
//   flip), a pendulum clock, a desk with rolled plans tied with red ribbon; dust: cue (dust settles, a cobweb draws
//   itself); unroll: cue (a plan unrolls: the Thames with red intercepting sewers drawing in along both banks);
//   stamp: cue (a red "LAW" stamp slams on it, stamp text: stampText). P: {pages, days, dust, unroll, stamp,
//   stampText: "LAW", labels}
// SHOTS.gs_tunnel  — cut-away: the river on top (brown; clear: cue washes clean water in), the embankment wall,
//   earth and a giant finished egg-shaped brick sewer carrying the brown flow away; two cholera notices on the timber
//   shoring fade out on cue "fade". P: {river_top: 300, river_bottom: 520, cy: 820, r: 240, clear, fade,
//   posters: ["1849", "1854"], build: {at, dur} (optional), cast, labels}
//   gs_river extras: plume: {x, y, n: 4, w: 26, rise: 900, drift: -0.5} (thick stink plume), reflect: false;
//   figure extra: disgust: true | cue (eyes squeezed, puffed cheeks, fingers pinching the nose; use pose "think")
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
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  // colours (resolved at build time: the palette is set before the shots build)
  const SEWAGE = () => mix(mix(INK.gold, INK.green, 0.3), INK.ink, 0.5);
  const SEWAGE_L = () => mix(mix(INK.gold, INK.green, 0.3), INK.paperLight, 0.35);
  const CLEAN = () => mix(INK.blue, INK.paperLight, 0.55);
  const STINK = () => mix(INK.green, INK.inkSoft, 0.25);
  const BRICK = () => mix(INK.red, INK.stain, 0.55);
  const STONE = () => mix(INK.paperDark, INK.paperLight, 0.35);
  const WOOD = () => mix(INK.gold, INK.inkSoft, 0.5);
  const EARTH = () => mix(INK.gold, INK.paperDark, 0.62);
  const CRIMSON = () => mix(INK.red, INK.ink, 0.22);
  const LEATHER = () => mix(INK.green, INK.ink, 0.25);

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

  // ------------------------------------------------------------------ stink wisps (wavy green-grey strands rising)
  //   update(lt, t, a (start), S: {n, from: [[x, y] px], rise, drift, w})
  function stink(parent, sd) {
    const e = inkEl(parent, STINK()), e2 = inkEl(parent, mix(STINK(), INK.paperLight, 0.35));
    return {
      update(lt, t, a, S) {
        if (!S || a == null || lt < a) { e.setAttribute('d', ''); e2.setAttribute('d', ''); return; }
        const n = S.n ?? 8, src = S.from && S.from.length ? S.from : [[540, 1200]], rise = S.rise ?? 520, dr = S.drift ?? 1, w0 = S.w ?? 7;
        const D = [], D2 = [], grow = clamp01((lt - a) / 0.8);
        for (let i = 0; i < n; i++) {
          const s0 = src[i % src.length], ph = hn(sd + i, 3), sp = 0.16 + hn(sd + i, 4) * 0.12;
          const u = ((lt - a) * sp + ph) % 1, base = [s0[0] + (hn(sd + i, 5) - 0.5) * (S.spread ?? 140), s0[1]];
          const pts = [], segs = 7, len = rise * 0.42;
          for (let j = 0; j <= segs; j++) {
            const v = j / segs, y = base[1] - u * rise - v * len, k = (base[1] - y) / rise;
            pts.push([base[0] + Math.sin(v * 5 + lt * 2.4 + i * 1.7) * 26 * (0.4 + k) + dr * k * 120, y]);
          }
          const fade = Math.sin(Math.PI * u) * grow, w = w0 * (0.35 + 0.75 * fade);
          if (fade < 0.06) continue;
          (i % 3 === 2 ? D2 : D).push(inkPath(pts, { w, seed: sd + 10 + i, t, amp: 0.8, taper: 0.9 }));
        }
        e.setAttribute('d', D.join(' ')); e2.setAttribute('d', D2.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ river water with filth (y0 -> frame bottom)
  function river(parent, sd, W, H, clean) {
    const fill = inkEl(parent, clean ? CLEAN() : SEWAGE()), lite = inkEl(parent, clean ? mix(INK.blue, INK.paperLight, 0.8) : SEWAGE_L()), rip = inkEl(parent, clean ? mix(INK.blue, INK.ink, 0.3) : mix(SEWAGE(), INK.ink, 0.45)), shine = inkEl(parent, mix(INK.paperLight, clean ? INK.blue : SEWAGE_L(), 0.35)), junk = inkEl(parent, mix(INK.ink, INK.stain, 0.25)), bub = inkEl(parent);
    return {
      update(lt, t, y0) {
        const k = sd * 3, top = [];
        for (let i = 0; i <= 18; i++) { const x = -40 + i * (W + 80) / 18; top.push([x, y0 + Math.sin(i * 1.1 + lt * 1.4) * 6]); }
        fill.setAttribute('d', loopS(top.concat([[W + 40, H + 40], [-40, H + 40]]), k + 1, t, 0.6, false));
        const R = [lineS(top, k + 2, t, 5, 0.6)], L = [];
        const SH_ = [];
        for (let j = 0; j < 26; j++) {   // short light ripple strokes: reads as water, not mud
          const y = y0 + 24 + Math.pow(j / 25, 1.25) * (H - y0 - 30), sc = 0.5 + (y - y0) / (H - y0);
          const x = ((hn(sd + j, 21) * W + lt * (18 + (j % 5) * 8) * (j % 2 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100, w = 70 * sc + hn(sd + j, 22) * 60;
          SH_.push(lineS([[x, y], [x + w * 0.25, y - 5 * sc], [x + w * 0.5, y], [x + w * 0.75, y - 5 * sc], [x + w, y]], k + 400 + j, t, 3.5 + sc * 2, 0.4));
        }
        shine.setAttribute('d', SH_.join(' '));
        for (let j = 0; j < 12; j++) {
          const y = y0 + 40 + Math.pow(j / 11, 1.3) * (H - y0 - 40), sc = 0.6 + (y - y0) / (H - y0);
          const x = ((hn(sd + j, 1) * W + lt * (30 + j * 6)) % (W + 300)) - 150, w = 120 * sc + hn(sd + j, 2) * 80;
          R.push(lineS([[x, y], [x + w * 0.5, y - 6 * sc], [x + w, y]], k + 10 + j, t, 3 + sc * 2, 0.5));
          L.push(loopS([[x + w * 0.2, y + 10 * sc], [x + w * 0.8, y + 6 * sc], [x + w * 0.7, y + 18 * sc], [x + w * 0.25, y + 20 * sc]], k + 30 + j, t, 0.5));
        }
        rip.setAttribute('d', R.join(' ')); lite.setAttribute('d', L.join(' '));
        if (clean) { junk.setAttribute('d', ''); bub.setAttribute('d', ''); return; }
        const J = [], B = [];
        for (let j = 0; j < 9; j++) {
          const y = y0 + 70 + (j / 8) * (H - y0 - 160), sc = 0.7 + (y - y0) / (H - y0) * 0.9;
          const x = ((hn(sd + j, 6) * W + lt * (22 + j * 5)) % (W + 200)) - 100, bob = Math.sin(lt * 1.6 + j) * 5;
          J.push(loopS(ell(x, y + bob, (24 + hn(sd + j, 7) * 22) * sc, (9 + hn(sd + j, 8) * 6) * sc, 9), k + 50 + j, t, 0.8));
          // bubbles popping
          const u = ((lt * 0.7 + hn(sd + j, 9)) % 1), bx = (hn(sd + j, 10) * W), by = y0 + 50 + hn(sd + j, 11) * (H - y0 - 120), r = (6 + u * 14) * sc;
          if (u < 0.85) B.push(ringS(ell(bx, by, r, r * 0.6, 8), k + 70 + j, t, 3, 0.4));
        }
        junk.setAttribute('d', J.join(' ')); bub.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ Palace of Westminster from the river (1858)
  //   update(t, x (centre), y (base), s, lt) -> {x0, x1, top, h, tower: [x, y], tw}
  //   a long Gothic river front in bays (buttresses with pinnacles), a dark slate roof, two rows of tall pointed-arch
  //   windows, three pavilion towers with pyramid roofs, the central spire and the clock tower at the right end.
  function parliament(parent, sd) {
    const roofF = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.25)), body = inkEl(parent, STONE()), shade = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.35)),
      win = inkEl(parent, mix(INK.inkSoft, INK.blue, 0.35)), roof = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.15)), face = inkEl(parent, INK.paperLight), r = inkEl(parent), fine = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.2));
    return {
      update(t, x, y, s = 1, lt = 0) {
        const k = sd * 3, w = 860 * s, h = 250 * s, x0 = x - w / 2, x1 = x + w / 2, bays = 12, bw = w / bays;
        const B = [], S = [], RF = [], RD = [], R = [], WN = [], FN = [];
        const front = rect(x0, y - h, x1, y);
        B.push(loopS(front, k + 1, t, 0.5, false)); R.push(ringS(front, k + 2, t, 6, 0.5, false));
        // slate roof band above the front
        const rf = [[x0 + 6, y - h], [x0 + 20 * s, y - h - 46 * s], [x1 - 20 * s, y - h - 46 * s], [x1 - 6, y - h]];
        RD.push(loopS(rf, k + 3, t, 0.5, false)); R.push(ringS(rf, k + 4, t, 4, 0.5, false));
        // bays: buttresses with little pinnacles, two tall pointed windows per bay and storey
        for (let i = 0; i <= bays; i++) {
          const bx = x0 + i * bw;
          FN.push(lineS([[bx, y - 26 * s], [bx, y - h]], k + 10 + i, t, 3, 0.4));
          if (i % 3 === 0) {
          const pn = [[bx - 12 * s, y - h - 30 * s], [bx, y - h - 80 * s], [bx + 12 * s, y - h - 30 * s]];
          RF.push(loopS(pn, k + 30 + i, t, 0.3, false)); R.push(ringS(pn, k + 50 + i, t, 3, 0.3, false));
          }
          if (i === bays) continue;
          for (let row = 0; row < 2; row++) for (let j = 0; j < 2; j++) {
            const cx = bx + bw * (j ? 0.68 : 0.32), wy0 = y - h * (row ? 0.44 : 0.9), wy1 = wy0 + h * 0.34, ww = Math.min(13 * s, bw * 0.13);
            const pw = [[cx - ww, wy1], [cx - ww, wy0 + ww * 1.2], [cx, wy0 - ww * 0.4], [cx + ww, wy0 + ww * 1.2], [cx + ww, wy1]];
            WN.push(loopS(pw, k + 100 + i * 8 + row * 2 + j, t, 0.3, false));
          }
          FN.push(lineS([[bx + 4, y - h * 0.5], [bx + bw - 4, y - h * 0.5]], k + 200 + i, t, 2.5, 0.3));
        }
        // pavilion towers with pyramid roofs
        [x0 + 40 * s, x - 60 * s, x1 - 230 * s].forEach((px, i) => {
          const tw = 96 * s, th = h + (i === 1 ? 150 : 100) * s, q = rect(px - tw / 2, y - th, px + tw / 2, y);
          B.push(loopS(q, k + 300 + i, t, 0.5, false)); S.push(loopS(rect(px + tw * 0.12, y - th, px + tw / 2, y), k + 303 + i, t, 0.4, false));
          R.push(ringS(q, k + 306 + i, t, 5, 0.5, false));
          const py = [[px - tw / 2 - 8 * s, y - th], [px, y - th - 110 * s], [px + tw / 2 + 8 * s, y - th]];
          RF.push(loopS(py, k + 309 + i, t, 0.4, false)); R.push(ringS(py, k + 312 + i, t, 4, 0.4, false));
          for (let j = 0; j < 3; j++) WN.push(loopS(rect(px - 9 * s, y - th + 40 * s + j * 70 * s, px + 9 * s, y - th + 84 * s + j * 70 * s), k + 315 + i * 3 + j, t, 0.3, false));
        });
        // central spire (lantern)
        const cx = x - 200 * s, sp = [[cx - 30 * s, y - h - 46 * s], [cx, y - h - 300 * s], [cx + 30 * s, y - h - 46 * s]];
        RF.push(loopS(sp, k + 330, t, 0.4, false)); R.push(ringS(sp, k + 331, t, 4, 0.4, false));
        // the clock tower at the right end
        const tx = x1 - 40 * s, tw = 100 * s, ty = y - 660 * s;
        const shaft = rect(tx - tw / 2, ty, tx + tw / 2, y);
        B.push(loopS(shaft, k + 340, t, 0.5, false)); S.push(loopS(rect(tx + tw * 0.12, ty, tx + tw / 2, y), k + 341, t, 0.4, false)); R.push(ringS(shaft, k + 342, t, 6, 0.5, false));
        const belfry = rect(tx - tw / 2 - 12 * s, ty - 120 * s, tx + tw / 2 + 12 * s, ty);
        B.push(loopS(belfry, k + 343, t, 0.5, false)); R.push(ringS(belfry, k + 344, t, 6, 0.5, false));
        face.setAttribute('d', loopS(ell(tx, ty - 60 * s, 40 * s, 40 * s, 14), k + 345, t, 0.4));
        R.push(ringS(ell(tx, ty - 60 * s, 40 * s, 40 * s, 14), k + 346, t, 5, 0.4));
        const ma = lt * 0.4, ha = lt * 0.05;
        R.push(lineS([[tx, ty - 60 * s], [tx + Math.sin(ma) * 30 * s, ty - 60 * s - Math.cos(ma) * 30 * s]], k + 347, t, 3.5, 0.2), lineS([[tx, ty - 60 * s], [tx + Math.sin(ha + 2) * 20 * s, ty - 60 * s - Math.cos(ha + 2) * 20 * s]], k + 348, t, 5, 0.2));
        const spire = [[tx - tw / 2 - 16 * s, ty - 120 * s], [tx - tw * 0.3, ty - 200 * s], [tx, ty - 310 * s], [tx + tw * 0.3, ty - 200 * s], [tx + tw / 2 + 16 * s, ty - 120 * s]];
        RF.push(loopS(spire, k + 349, t, 0.4, false)); R.push(ringS(spire, k + 350, t, 5, 0.4, false), lineS([[tx, ty - 310 * s], [tx, ty - 350 * s]], k + 351, t, 3, 0.3));
        for (let i = 0; i < 6; i++) WN.push(loopS(rect(tx - 11 * s, ty + 60 * s + i * 86 * s, tx + 11 * s, ty + 112 * s + i * 86 * s), k + 360 + i, t, 0.3, false));
        // river wall at the foot
        B.push(loopS(rect(x0 - 60 * s, y - 26 * s, x1 + 60 * s, y), k + 370, t, 0.4, false));
        R.push(lineS([[x0 - 60 * s, y - 26 * s], [x1 + 60 * s, y - 26 * s]], k + 371, t, 4, 0.4), lineS([[x0 - 80 * s, y], [x1 + 80 * s, y]], k + 372, t, 6, 0.6));
        roofF.setAttribute('d', RD.join(' ')); body.setAttribute('d', B.join(' ')); shade.setAttribute('d', S.join(' ')); win.setAttribute('d', WN.join(' '));
        roof.setAttribute('d', RF.join(' ')); r.setAttribute('d', R.join(' ')); fine.setAttribute('d', FN.join(' '));
        return { x0, x1, top: y - h, h, tower: [tx, ty], tw, windows: [[x - 200 * s, y - h * 0.7], [x + 120 * s, y - h * 0.7], [tx, ty + 120 * s]] };
      },
    };
  }

  // ------------------------------------------------------------------ the palace's broken reflection in the water
  //   update(lt, t, b (parliament bounds), y (water line), clean)
  function reflection(parent, sd) {
    const f = inkEl(parent, mix(STONE(), SEWAGE(), 0.8)), f2 = inkEl(parent, mix(STONE(), SEWAGE(), 0.66));
    return {
      update(lt, t, b, y, clean = false) {
        if (!b) { f.setAttribute('d', ''); f2.setAttribute('d', ''); return; }
        if (clean) { f.setAttribute('fill', mix(STONE(), CLEAN(), 0.5)); f2.setAttribute('fill', mix(STONE(), CLEAN(), 0.3)); }
        const k = sd * 3, A = [], A2 = [], n = 5, depth = b.h * 0.9;
        for (let i = 0; i < n; i++) {
          const v0 = y + 12 + i * depth / n, v1 = v0 + depth / n * 0.4, off = Math.sin(lt * 1.5 + i * 1.3) * 14 * (0.4 + i / n);
          A.push(loopS([[b.x0 + off + 12 * i, v0], [b.x1 + off - 12 * i, v0 + 2], [b.x1 + off - 16 * i, v1], [b.x0 + off + 16 * i, v1]], k + i, t, 0.6, false));
        }
        for (let i = 0; i < 4; i++) {
          const v0 = y + 12 + i * 50, off = Math.sin(lt * 1.5 + i) * (10 + i * 2), q = 1 - i * 0.04;
          A2.push(loopS([[b.tower[0] - b.tw / 2 * q + off, v0], [b.tower[0] + b.tw / 2 * q + off, v0], [b.tower[0] + b.tw / 2 * q + off, v0 + 20], [b.tower[0] - b.tw / 2 * q + off, v0 + 20]], k + 20 + i, t, 0.5, false));
        }
        f.setAttribute('d', A.join(' ')); f2.setAttribute('d', A2.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ rowing boat (hull drawn in front of the rower)
  function boat(parent, sd) {
    const hull = inkEl(parent, WOOD()), band = inkEl(parent, INK.red), r = inkEl(parent);
    return {
      update(t, x, y, s = 1, lt = 0) {
        const k = sd * 3, rock = Math.sin(lt * 1.3) * 0.045, bob = Math.sin(lt * 1.7) * 10, P = (u, v) => [x + (u * Math.cos(rock) - v * Math.sin(rock)) * s, y + (u * Math.sin(rock) + v * Math.cos(rock)) * s + bob];
        const H_ = [P(-300, -80), P(300, -96), P(250, 10), P(-240, 18)];
        hull.setAttribute('d', loopS(H_, k + 1, t, 0.6));
        band.setAttribute('d', loopS([P(-296, -70), P(296, -86), P(290, -68), P(-290, -54)], k + 2, t, 0.4, false));
        r.setAttribute('d', [ringS(H_, k + 3, t, 6, 0.6), lineS([P(-120, -80), P(-130, 14)], k + 4, t, 3, 0.4), lineS([P(80, -88), P(70, 14)], k + 5, t, 3, 0.4),
          lineS([P(-180, -60), P(-420, 120)], k + 6, t, 8, 0.5), loopS([P(-410, 100), P(-470, 150), P(-430, 160), P(-380, 120)], k + 7, t, 0.4)].join(' '));
        return { bob, rock };
      },
    };
  }

  // ------------------------------------------------------------------ figure (narrator or period figure) + extras
  function figure(parent, K, sd, opt = {}) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    const bagF = inkEl(g, CRIMSON()), bagR = inkEl(g);
    const hatF = inkEl(g, mix(INK.ink, INK.inkSoft, 0.15)), hatR = inkEl(g, INK.ink), hatB = inkEl(g, INK.red);
    const kfF = inkEl(g, INK.paperLight), kfR = inkEl(g, INK.inkSoft);
    const dgCover = inkEl(g, INK.paperLight), dgCheek = inkEl(g, INK.red, { 'fill-opacity': 0.35 }), dgInk = inkEl(g, INK.ink), dgHand = inkEl(g, INK.ink);
    const wf = stink(g, sd + 500);
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const sc = K.scale ?? 1;
        let x = (K.x ?? 0.8) * W, pose = s.pose || 'idle', ph = 0;
        const y = (K.y ?? 0.6) * H + (this && this.dy || 0);
        if (K.walk) {
          const a = atOr(cues, K.walk.at, 0), d = K.walk.dur ?? 3, p = lt >= a ? clamp01((lt - a) / d) : 0;
          x = lerp(x, K.walk.to * W, p);
          if (p > 0 && p < 1) { pose = K.walk.pose || 'walk'; ph = Math.abs(x - (K.x ?? 0.8) * W) / (KASIF.gait(pose) * sc); }
        }
        const face = faceOf(s.face ?? K.face, -1);
        const o = { x, y, face, since, ph, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir), ph }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o);
        const hw = r.hands[1], hl = r.hands[0];
        const hand = [x + face * sc * hw[0], y + sc * hw[1]], hand2 = [x + face * sc * hl[0], y + sc * hl[1]], head = [x + face * sc * r.head[0], y + sc * r.head[1]];
        const R0 = 72 * sc, k = sd * 3;
        // carpet bag in the front hand
        if (K.bag) {
          const b = [[hand[0] - 50 * sc, hand[1] + 20 * sc], [hand[0] + 50 * sc, hand[1] + 20 * sc], [hand[0] + 58 * sc, hand[1] + 100 * sc], [hand[0] - 58 * sc, hand[1] + 100 * sc]];
          bagF.setAttribute('d', loopS(b, k + 1, t, 0.5, false));
          bagR.setAttribute('d', ringS(b, k + 2, t, 4, 0.5, false) + ' ' + lineS([[hand[0] - 26 * sc, hand[1] + 22 * sc], [hand[0], hand[1] - 4 * sc], [hand[0] + 26 * sc, hand[1] + 22 * sc]], k + 3, t, 4, 0.4));
        }
        // Victorian top hat
        if (K.tophat && !isK) {
          const hx = head[0], hy = head[1] - R0 * 0.78, cw = R0 * 0.78, ch = R0 * 1.15;
          const crown = [[hx - cw, hy], [hx - cw * 0.92, hy - ch], [hx + cw * 0.92, hy - ch - 2], [hx + cw, hy]];
          const brim = [[hx - cw * 1.45, hy + 4], [hx - cw * 1.2, hy - 14 * sc], [hx + cw * 1.2, hy - 16 * sc], [hx + cw * 1.45, hy + 2], [hx, hy + 14 * sc]];
          hatF.setAttribute('d', loopS(crown, k + 4, t, 0.5, false) + ' ' + loopS(brim, k + 5, t, 0.5));
          hatB.setAttribute('d', '');
          hatR.setAttribute('d', ringS(brim, k + 6, t, 3, 0.5));
        }
        // handkerchief over nose and mouth
        const ka = K.kerchief === true ? 0 : atOr(cues, K.kerchief, null);
        if (ka != null && lt >= ka) {
          const q = spring(lt, ka, 0.4), cx = head[0] + face * R0 * 0.42, cy = head[1] + R0 * 0.36, rr = R0 * 0.55 * q;
          const kf = [[cx - rr, cy - rr * 0.5], [cx + rr * 0.9, cy - rr * 0.65], [cx + rr * 1.05, cy + rr * 0.4], [cx + rr * 0.3, cy + rr * 1.3], [cx - rr * 0.8, cy + rr * 0.6]];
          kfF.setAttribute('d', loopS(kf, k + 7, t, 0.5));
          kfR.setAttribute('d', ringS(kf, k + 8, t, 3.5, 0.5) + ' ' + lineS([[cx - rr * 0.4, cy - rr * 0.1], [cx + rr * 0.5, cy + rr * 0.3]], k + 9, t, 2.5, 0.4));
        } else { kfF.setAttribute('d', ''); kfR.setAttribute('d', ''); }
        // disgust: eyes squeezed shut (> <), puffed red cheeks, wobbly mouth, thumb and finger pinching the nose
        const da = K.disgust === true ? 0 : atOr(cues, K.disgust, null);
        if (da != null && lt >= da) {
          const F = (u, v) => [head[0] + face * u * sc, head[1] + v * sc], fx = 12 + 5, C = [], I = [];
          [-1, 1].forEach(e => { const c = F(fx + e * 22, 2); C.push(loopS(ell(c[0], c[1], 15 * sc, 15 * sc, 9), sd + 900 + e, t, 0.3));
            const ex = fx + e * 22; I.push(lineS([F(ex - e * 10, -7), F(ex + e * 8, 2), F(ex - e * 10, 11)], sd + 910 + e, t, 5 * sc, 0.3)); });
          C.push(loopS(ell(...F(15, 36), 26 * sc, 13 * sc, 10), sd + 920, t, 0.3));
          I.push(lineS([F(-6, 40), F(4, 34), F(14, 40), F(24, 34), F(34, 40)], sd + 921, t, 4.5 * sc, 0.4));
          dgCover.setAttribute('d', C.join(' ')); dgInk.setAttribute('d', I.join(' '));
          const puff = 1 + 0.08 * Math.sin(lt * 3);
          dgCheek.setAttribute('d', [-1, 1].map(e => loopS(ell(...F(fx + e * 38, 24), 16 * sc * puff, 11 * sc * puff, 9), sd + 930 + e, t, 0.3)).join(' '));
          const nose = F(fx + 2, 20), hd = hand;
          dgHand.setAttribute('d', [lineS([hd, [nose[0] - face * 6 * sc, nose[1] + 10 * sc]], sd + 940, t, 7 * sc, 0.3), lineS([hd, [nose[0] + face * 14 * sc, nose[1] + 4 * sc], [nose[0] + face * 4 * sc, nose[1] - 4 * sc]], sd + 941, t, 7 * sc, 0.3),
            inkDot(nose[0], nose[1] + 4 * sc, 9 * sc, 9 * sc, sd + 942, t)].join(' '));
        } else { dgCover.setAttribute('d', ''); dgCheek.setAttribute('d', ''); dgInk.setAttribute('d', ''); dgHand.setAttribute('d', ''); }
        if (K.stinky) wf.update(lt, t, 0, { n: 5, from: [[head[0] - face * R0 * 0.2, head[1] + R0 * 0.2]], rise: R0 * 3, spread: R0 * 1.4, w: 5, drift: 0.3 });
        return { x, y, face, hand, hand2, head };
      },
    };
  }
  const figures = (parent, list, sd) => (list || []).map((K, i) => figure(el(parent, 'g'), K, sd + i * 37));

  // ------------------------------------------------------------------ the dead fish (belly-up)
  function fish(parent, sd) {
    const f = inkEl(parent, INK.paperLight), r = inkEl(parent);
    return {
      update(t, x, y, s = 1, lt = 0) {
        const k = sd * 3, b = Math.sin(lt * 1.5) * 6;
        const body = [[x - 90 * s, y + b], [x - 40 * s, y - 30 * s + b], [x + 50 * s, y - 26 * s + b], [x + 90 * s, y + b], [x + 50 * s, y + 18 * s + b], [x - 40 * s, y + 16 * s + b]];
        const tail = [[x - 86 * s, y + b], [x - 140 * s, y - 34 * s + b], [x - 130 * s, y + b], [x - 140 * s, y + 34 * s + b]];
        f.setAttribute('d', loopS(body, k + 1, t, 0.5) + ' ' + loopS(tail, k + 2, t, 0.5, false));
        r.setAttribute('d', [ringS(body, k + 3, t, 4, 0.5), ringS(tail, k + 4, t, 4, 0.5, false), lineS([[x + 46 * s, y - 20 * s + b], [x + 60 * s, y - 6 * s + b]], k + 5, t, 3, 0.3), lineS([[x + 56 * s, y - 20 * s + b], [x + 42 * s, y - 6 * s + b]], k + 6, t, 3, 0.3)].join(' '));
      },
    };
  }

  // ================================================================== gs_river
  SH.gs_river = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7101, top = el(svg, 'g'), root = el(top, 'g');
      const wy = (P.water ?? 0.56) * H;
      const PL = P.parl === false ? null : Object.assign({ x: 0.5, s: 1 }, P.parl || {});
      const pg = PL ? parliament(el(root, 'g'), sd + 1) : null;
      const rv = river(el(root, 'g'), sd + 2, W, H, !!P.clean);
      const rf = PL && P.reflect !== false ? reflection(el(root, 'g'), sd + 5) : null;
      const st = stink(el(root, 'g'), sd + 3);
      const plume = P.plume ? (() => { const g = el(root, 'g'), a1 = inkEl(g, STINK()), a2 = inkEl(g, mix(STINK(), INK.paperLight, 0.45)), a3 = inkEl(g, mix(STINK(), INK.ink, 0.35));
        return { update(lt, t, Q) {   // a thick curling stink plume: three twisted strands rising from the water, curling over at the top
          const x0 = Q.x * W, y0 = Q.y * H, rise = Q.rise ?? 900, dr = (Q.drift ?? -0.3) * W, ww = Q.w ?? 36, A = [], B = [], C = [];
          for (let s2 = 0; s2 < (Q.n ?? 3); s2++) {
            const pts = [], ph = s2 * 2.1;
            for (let i = 0; i <= 12; i++) { const v = i / 12, x = x0 + dr * v * v + Math.sin(v * 7 + lt * 2.2 + ph) * (24 + 50 * v), y = y0 - rise * v; pts.push([x, y]); }
            const e = pts[pts.length - 1], cr = 60 + s2 * 18;   // the curl at the top
            for (let i = 1; i <= 6; i++) { const a = -Math.PI / 2 - i / 6 * Math.PI * 1.4 + Math.sin(lt * 1.5 + ph) * 0.2; pts.push([e[0] + Math.sign(dr || -1) * (cr + Math.cos(a) * cr * (1 - i / 9)), e[1] - cr * 0.2 + Math.sin(a) * cr * (1 - i / 9)]); }
            A.push(inkPath(pts, { w: ww * (1 - s2 * 0.2), seed: sd + 700 + s2, t, amp: 0.8, taper: 0.85 }));
            B.push(inkPath(pts.slice(2), { w: ww * 0.32, seed: sd + 720 + s2, t, amp: 0.6, taper: 0.9 }));
            C.push(inkPath(pts.map(([x, y]) => [x + ww * 0.42, y]).slice(1, -2), { w: 3, seed: sd + 740 + s2, t, amp: 0.6, taper: 0.9 }));
          }
          a1.setAttribute('d', A.join(' ')); a2.setAttribute('d', B.join(' ')); a3.setAttribute('d', C.join(' '));
        } }; })() : null;
      const cast = figures(el(root, 'g'), P.cast, sd + 40);
      const BT = P.boat ? Object.assign({ x: 0.5, y: 0.7, s: 1 }, P.boat) : null;
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 8) : null;
      const bt = BT ? boat(el(root, 'g'), sd + 4) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          let win = null;
          let pb = null;
          if (pg) { pb = pg.update(t, PL.x * W, (PL.y ?? (P.water ?? 0.56)) * H, PL.s * (1 + 0.02 * hit), lt); win = pb.windows; }
          rv.update(lt, t, wy);
          if (rf) rf.update(lt, t, pb, wy, !!P.clean);
          if (P.stink && !P.clean) {
            const S = Object.assign({}, P.stink);
            S.from = (S.from || [[0.2, 0.62], [0.5, 0.66], [0.8, 0.62]]).map(q => [q[0] * W, q[1] * H]);
            st.update(lt, t, atOr(cues, S.at, 0), S);
          }
          if (plume) plume.update(lt, t, P.plume);
          cast.forEach(c => c && c.update(lt, t, cues, W, H));
          const bob = BT ? Math.sin(lt * 1.7) * 10 : 0;
          if (kas) { kas.dy = bob; kas.update(lt, t, cues, W, H); }
          if (bt) bt.update(t, BT.x * W, BT.y * H, BT.s, lt);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
          void win;
        },
      };
    },
  };

  // ================================================================== gs_outfall
  SH.gs_outfall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7201, top = el(svg, 'g'), root = el(top, 'g');
      const WL = Object.assign({ x0: -0.05, x1: 0.66, top: 0.22 }, P.wall || {}), AR = Object.assign({ x: 0.34, y: 0.5, r: 150 }, P.arch || {});
      const wy = (P.water ?? 0.64) * H;
      const wallF = inkEl(root, STONE()), bricks = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3)), mouth = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2)), wallR = inkEl(root), slime = inkEl(root, STINK());
      const rv = river(el(root, 'g'), sd + 2, W, H, false);
      const stream = inkEl(root, SEWAGE()), streamL = inkEl(root, SEWAGE_L()), splash = inkEl(root, SEWAGE()), splashR = inkEl(root);
      const fs = P.fish === false ? null : fish(el(root, 'g'), sd + 5);
      const st = stink(el(root, 'g'), sd + 3);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const x0 = WL.x0 * W, x1 = WL.x1 * W, y0 = WL.top * H;
          const wall = [[x0, y0], [x1, y0 + 30], [x1 + 20, wy + 40], [x0, wy + 40]];
          const ax = AR.x * W, ay = AR.y * H, r = AR.r * (1 + 0.03 * hit);
          const arch = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; arch.push([ax + Math.cos(a) * r, ay + Math.sin(a) * r]); }
          const hole = arch.concat([[ax + r, ay + r * 0.9], [ax - r, ay + r * 0.9]]);
          wallF.setAttribute('d', loopS(wall, k + 1, t, 0.6, false));
          const BR = [];
          for (let row = 0; row < 16; row++) {
            const y = y0 + 20 + row * 44; if (y > wy + 20) break;
            for (let c = 0; c < 9; c++) { const bx = x0 + (row % 2 ? 40 : 0) + c * 86; if (bx > x1 - 20) continue; if (Math.hypot(bx + 40 - ax, y - ay) < r + 40 && y > ay - r - 20) continue; BR.push(ringS(rect(bx + 4, y, bx + 80, y + 38), k + 100 + row * 10 + c, t, 2.5, 0.4, false)); }
          }
          bricks.setAttribute('d', BR.join(' '));
          mouth.setAttribute('d', loopS(hole, k + 2, t, 0.5));
          const VS = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; VS.push(lineS([[ax + Math.cos(a) * r, ay + Math.sin(a) * r], [ax + Math.cos(a) * (r + 46), ay + Math.sin(a) * (r + 46)]], k + 30 + i, t, 4, 0.4)); }
          wallR.setAttribute('d', [ringS(wall, k + 3, t, 6, 0.6, false), lineS(arch, k + 4, t, 7, 0.5), lineS(arch.map(([px, py]) => [ax + (px - ax) * 1.3, ay + (py - ay) * 1.3]), k + 5, t, 5, 0.5), ...VS].join(' '));
          // slime streaks down the wall under the mouth
          const SL = []; for (let i = 0; i < 5; i++) { const sx = ax - r * 0.8 + i * r * 0.4, L = 60 + hn(sd + i, 1) * 90 + Math.sin(lt + i) * 8; SL.push(lineS([[sx, ay + r * 0.9], [sx + 4, ay + r * 0.9 + L]], k + 40 + i, t, 12, 0.5)); }
          slime.setAttribute('d', SL.join(' '));
          rv.update(lt, t, wy);
          // the gushing stream: from the mouth, arcing down into the river
          const ga = atOr(cues, P.gush, 0), gp = lt >= ga ? prog(lt, ga, 0.6) : 0;
          if (gp > 0) {
            const lip = ay + r * 0.75, reach = 220 * gp, fall = (wy - lip) * gp, wob = Math.sin(lt * 9) * 6;
            const top_ = [], bot = [];
            for (let i = 0; i <= 8; i++) { const u = i / 8, x = ax - r * 0.7 + (r * 1.4) * 0 + u * reach + r * 0.9 * u, y = lip + fall * u * u; top_.push([ax - r * 0.75 + u * (reach + r * 0.6), lip - 6 + fall * u * u + Math.sin(u * 6 + lt * 8) * 4]); bot.push([ax + r * 0.75 + u * (reach - r * 0.2) + wob * u, lip + 40 + fall * u * u * 0.98]); void x; void y; }
            stream.setAttribute('d', loopS(top_.concat(bot.reverse()), k + 6, t, 0.8));
            const SL2 = []; for (let j = 0; j < 4; j++) { const u = ((lt * 1.6 + j / 4) % 1); SL2.push(loopS(ell(ax - r * 0.3 + u * (reach + r * 0.4), lip + 16 + fall * u * u, 22, 9, 8), k + 60 + j, t, 0.5)); }
            streamL.setAttribute('d', SL2.join(' '));
            const sx = ax + reach + r * 0.15, SP = [], SR = [];
            for (let j = 0; j < 7; j++) { const u = ((lt * 2.2 + j / 7) % 1), a = -Math.PI * (0.15 + 0.7 * hn(sd + j, 2)), d = 90 * u; const c = [sx + Math.cos(a) * d * 1.3, wy - 4 + Math.sin(a) * d * (1 - u) * 1.6]; const rr = 10 * (1 - u) + 3; SP.push(loopS(ell(c[0], c[1], rr, rr, 7), k + 70 + j, t, 0.4)); SR.push(ringS(ell(c[0], c[1], rr, rr, 7), k + 80 + j, t, 2.5, 0.4)); }
            splash.setAttribute('d', gp > 0.7 ? SP.join(' ') : ''); splashR.setAttribute('d', gp > 0.7 ? SR.join(' ') : '');
          }
          if (fs) fs.update(t, (P.fish && P.fish.x || 0.74) * W, (P.fish && P.fish.y || 0.78) * H, (P.fish && P.fish.s) || 1.1, lt);
          const S = Object.assign({ n: 12, rise: 700, w: 9, at: 0 }, P.stink || {});
          S.from = (S.from || [[0.5, 0.66], [0.75, 0.72], [0.3, 0.8], [0.9, 0.85]]).map(q => [q[0] * W, q[1] * H]);
          st.update(lt, t, atOr(cues, S.at, 0), S);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== gs_room
  SH.gs_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7301, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150;
      const WINS = (P.windows || [0.3, 0.72]).map(u => u * W);
      const glass = inkEl(root, mix(INK.blue, INK.paperLight, 0.68)), tracery = inkEl(root);
      const st = stink(el(root, 'g'), sd + 3);
      const curt = inkEl(root, CRIMSON()), wet = inkEl(root, mix(CRIMSON(), INK.ink, 0.4)), fold = inkEl(root, mix(CRIMSON(), INK.ink, 0.55)), curtR = inkEl(root), drips = inkEl(root, mix(INK.paperLight, INK.blue, 0.2));
      const pailF = inkEl(root, WOOD()), lime = inkEl(root, INK.paperLight), pailR = inkEl(root), fumes = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.2));
      const brush = inkEl(root, WOOD()), brushR = inkEl(root);
      const cast = figures(el(root, 'g'), P.cast, sd + 40);
      const bench = inkEl(root, LEATHER()), benchR = inkEl(root), benchD = inkEl(root, mix(LEATHER(), INK.ink, 0.4));
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const PA = Object.assign({ x: 0.52 }, P.pail || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const wt = 300, wb = 1000, hw = 105;
          const GL = [], TR = [], CU = [], WT = [], FO = [], CR = [], DR = [];
          const sa = atOr(cues, P.soak, null), soak = sa == null ? 0 : prog(lt, sa, 1.6);
          WINS.forEach((wx, i) => {
            const lancet = [[wx - hw, wb], [wx - hw, wt + 90], [wx - hw * 0.6, wt + 20], [wx, wt - 30], [wx + hw * 0.6, wt + 20], [wx + hw, wt + 90], [wx + hw, wb]];
            GL.push(loopS(lancet, k + 1 + i, t, 0.5));
            TR.push(ringS(lancet, k + 3 + i, t, 7, 0.5), lineS([[wx, wt - 20], [wx, wb]], k + 5 + i, t, 5, 0.4));
            for (let j = 1; j < 6; j++) TR.push(lineS([[wx - hw, wt + 90 + j * 150], [wx + hw, wt + 90 + j * 150]], k + 10 + i * 10 + j, t, 3, 0.4));
            TR.push(ringS(ell(wx, wt + 60, 34, 34, 10), k + 30 + i, t, 4, 0.4));
            // curtains either side: rail at y 230, fall to the floor
            [-1, 1].forEach((sgn, c) => {
              const ix = wx + sgn * (hw - 30), ox = wx + sgn * (hw + 120), sw = Math.sin(lt * 1.1 + i + c) * 10;
              const pts = [[ix, 240], [ix + sgn * 10 + sw * 0.4, 600], [ix + sgn * 40 + sw, gy - 10], [ox + sw * 0.6, gy], [ox, 240]];
              CU.push(loopS(pts, k + 40 + i * 2 + c, t, 0.6, false)); CR.push(ringS(pts, k + 50 + i * 2 + c, t, 5, 0.6, false));
              for (let f = 1; f < 4; f++) { const u = f / 4; FO.push(lineS([[lerp(ix, ox, u), 250], [lerp(ix + sgn * 40, ox, u) + sw * 0.8, gy - 20]], k + 60 + i * 10 + c * 4 + f, t, 4, 0.5)); }
              if (soak > 0) {
                const wl = lerp(gy, 330, soak);
                WT.push(loopS([[lerp(ix, ix + sgn * 40, (wl - 240) / (gy - 240)) + sw * 0.5, wl], [ix + sgn * 40 + sw, gy - 10], [ox + sw * 0.6, gy], [ox, wl + 10]], k + 70 + i * 2 + c, t, 0.6, false));
                for (let d = 0; d < 3; d++) { const u = ((lt * 1.3 + d / 3 + c * 0.2) % 1), dx = lerp(ix + sgn * 40, ox, 0.25 + d * 0.25), dy = gy + u * 60; DR.push(loopS(ell(dx, dy, 6, 10, 7), k + 80 + i * 6 + c * 3 + d, t, 0.3)); }
              }
            });
          });
          glass.setAttribute('d', GL.join(' ')); tracery.setAttribute('d', TR.join(' ')); curt.setAttribute('d', CU.join(' ')); wet.setAttribute('d', WT.join(' ')); fold.setAttribute('d', FO.join(' '));
          curtR.setAttribute('d', CR.join(' ') + ' ' + lineS([[WINS[0] - 260, 236], [WINS[WINS.length - 1] + 260, 236]], k + 90, t, 9, 0.5)); drips.setAttribute('d', DR.join(' '));
          // stink pouring in through the windows
          const se = atOr(cues, P.seep, null);
          st.update(lt, t, se, { n: 14, from: WINS.map(wx => [wx, 800]), rise: -1 * 0 + 500, spread: 160, w: 9, drift: 0.6 });
          // the pail of chloride of lime
          const px = PA.x * W, py = gy + 4, pw = 110;
          const pail = [[px - pw, py - 170], [px + pw, py - 170], [px + pw * 0.82, py], [px - pw * 0.82, py]];
          pailF.setAttribute('d', loopS(pail, k + 100, t, 0.5, false));
          lime.setAttribute('d', loopS(ell(px, py - 170, pw, 22, 12), k + 101, t, 0.4));
          pailR.setAttribute('d', [ringS(pail, k + 102, t, 5, 0.5, false), ringS(ell(px, py - 170, pw, 22, 12), k + 103, t, 4, 0.4), lineS([[px - pw * 0.95, py - 110], [px + pw * 0.92, py - 110]], k + 104, t, 4, 0.4), lineS([[px - pw * 0.88, py - 40], [px + pw * 0.86, py - 40]], k + 105, t, 4, 0.4),
            lineS([[px - pw, py - 166], [px - pw * 0.6, py - 290], [px + pw * 0.6, py - 290], [px + pw, py - 166]], k + 106, t, 4, 0.5)].join(' '));
          const FU = []; for (let j = 0; j < 4; j++) { const u = (lt * 0.5 + j / 4) % 1; FU.push(loopS(ell(px - 40 + j * 26, py - 190 - u * 160, 24 * (0.5 + u), 14 * (0.5 + u), 8), k + 110 + j, t, 0.5)); }
          fumes.setAttribute('d', FU.join(' '));
          // cast + the long brush in the brusher's hand
          const rs = cast.map(c => c && c.update(lt, t, cues, W, H));
          const bi = P.brush ?? 0, br = rs[bi];
          if (br && bi >= 0) {
            const sw = sa != null && lt >= sa ? Math.sin((lt - sa) * 5) : 0, tip = [WINS[0] + 170 + sw * 20, lerp(gy - 120, 640, 0.5 + 0.5 * sw)];
            const h = br.hand, dx = tip[0] - h[0], dy = tip[1] - h[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
            const head = [[tip[0] + nx * 40, tip[1] + ny * 40], [tip[0] + nx * 40 + dx / L * 30, tip[1] + ny * 40 + dy / L * 30], [tip[0] - nx * 40 + dx / L * 30, tip[1] - ny * 40 + dy / L * 30], [tip[0] - nx * 40, tip[1] - ny * 40]];
            brush.setAttribute('d', lineS([[h[0] - dx / L * 60, h[1] - dy / L * 60], tip], k + 120, t, 12, 0.4) + ' ' + loopS(head, k + 121, t, 0.4, false));
            brushR.setAttribute('d', ringS(head, k + 122, t, 3.5, 0.4, false));
          }
          // green leather benches in the foreground (two rows of backs and seats)
          const BF = [], BR = [], BD = [];
          [[1390, 1560], [1650, 1880]].forEach(([y0, y1], j) => {
            const back = [[-30, y0], [W + 30, y0 - 10], [W + 30, y1], [-30, y1]];
            BF.push(loopS(back, k + 130 + j, t, 0.6, false)); BR.push(ringS(back, k + 132 + j, t, 6, 0.6, false));
            for (let c = 0; c < 9; c++) for (let rr = 0; rr < 2; rr++) BD.push(loopS(ell(40 + c * 125 + rr * 62, y0 + 40 + rr * 50, 8, 8, 6), k + 140 + j * 40 + c * 2 + rr, t, 0.3));
          });
          bench.setAttribute('d', BF.join(' ')); benchR.setAttribute('d', BR.join(' ')); benchD.setAttribute('d', BD.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
          void hit;
        },
      };
    },
  };

  // ================================================================== gs_street
  SH.gs_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7401, top = el(svg, 'g'), root = el(top, 'g'), gy = P.gy ?? 1150, mode = P.mode || 'road';
      const pg = mode === 'road' && P.parl !== false ? parliament(el(root, 'g'), sd + 1) : null;
      const cloud = inkEl(root, mix(STINK(), INK.paperLight, 0.45)), cloudR = inkEl(root, STINK());
      const wallF = inkEl(root, BRICK()), wallM = inkEl(root, mix(BRICK(), INK.ink, 0.35)), wallR = inkEl(root);
      const posters = (P.posters || []).map(() => ({ f: inkEl(root, INK.paperLight), b: inkEl(root, INK.ink), r: inkEl(root), tx: null, hd: null }));
      posters.forEach((o, i) => {
        const Pq = P.posters[i];
        o.hd = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', fill: INK.paperLight }); o.hd.textContent = Pq.head || 'CHOLERA';
        o.tx = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: INK.ink }); o.tx.textContent = Pq.text;
      });
      const pumpF = inkEl(root, mix(INK.ink, INK.blue, 0.25)), pumpR = inkEl(root), drip = inkEl(root, mix(INK.blue, INK.paperLight, 0.4));
      const post = inkEl(root, WOOD()), postR = inkEl(root);
      const signs = (P.signs || []).map(S => { const g = el(root, 'g'); const f = inkEl(g, INK.paperLight), r = inkEl(g); const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = S.text; return { S, g, f, r, tx }; });
      const st = stink(el(root, 'g'), sd + 3);
      const cast = figures(el(root, 'g'), P.cast, sd + 40);
      const cob = inkEl(root, mix(INK.stain, INK.paperLight, 0.35)), cobR = inkEl(root, mix(INK.inkSoft, INK.stain, 0.3)), curb = inkEl(root);
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (pg) {
            const PL = Object.assign({ x: 0.3, y: 0.56, s: 0.6 }, P.parl || {});
            const r = pg.update(t, PL.x * W, PL.y * H, PL.s, lt), cx = PL.x * W, cy = PL.y * H - 330 * PL.s;
            const C = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = (130 + 30 * Math.sin(i * 2.3 + lt)) * PL.s * 2.2; C.push([cx + Math.cos(a) * rr * 1.6, cy + Math.sin(a) * rr * 0.55]); }
            cloud.setAttribute('d', loopS(C, k + 1, t, 1.2)); cloudR.setAttribute('d', ringS(C, k + 2, t, 4, 1.2));
            st.update(lt, t, 0, { n: 8, from: [[cx - 200, PL.y * H], [cx + 150, PL.y * H]], rise: 380, spread: 260, w: 6, drift: 0.4 });
            void r;
          }
          if (mode === 'wall') {
            const wt = P.wall_top ?? 260, wall = [[-30, wt], [W + 30, wt - 10], [W + 30, gy + 4], [-30, gy + 4]];
            wallF.setAttribute('d', loopS(wall, k + 3, t, 0.6, false));
            const M = []; for (let row = 0; row < 22; row++) { const y = wt + 20 + row * 40; if (y > gy - 10) break; M.push(lineS([[-20, y], [W + 20, y]], k + 200 + row, t, 2, 0.4)); for (let c = 0; c < 11; c++) { const x = (row % 2 ? 50 : 0) + c * 100; M.push(lineS([[x, y], [x, y + 40]], k + 300 + row * 12 + c, t, 2, 0.3)); } }
            wallM.setAttribute('d', M.join(' ')); wallR.setAttribute('d', ringS(wall, k + 4, t, 5, 0.6, false));
            posters.forEach((o, i) => {
              const Pq = P.posters[i], a = atOr(cues, Pq.at, 0.2 + i * 0.5), p = lt >= a ? spring(lt, a, 0.5) : 0;
              const cx = (Pq.x ?? 0.2 + i * 0.3) * W, cy = (Pq.y ?? 0.4) * H, w = 260 * p, h = 330 * p, rot = (Pq.rot ?? (i % 2 ? 3 : -3)) * Math.PI / 180;
              const R = (u, v) => [cx + u * Math.cos(rot) - v * Math.sin(rot), cy + u * Math.sin(rot) + v * Math.cos(rot)];
              if (p <= 0.01) { o.f.setAttribute('d', ''); o.b.setAttribute('d', ''); o.r.setAttribute('d', ''); o.tx.setAttribute('opacity', 0); o.hd.setAttribute('opacity', 0); return; }
              const sheet = [R(-w / 2, -h / 2), R(w / 2, -h / 2), R(w / 2, h / 2), R(-w / 2, h / 2)];
              o.f.setAttribute('d', loopS(sheet, k + 400 + i, t, 0.5, false));
              o.b.setAttribute('d', loopS([R(-w / 2 + 14, -h / 2 + 14), R(w / 2 - 14, -h / 2 + 14), R(w / 2 - 14, -h / 2 + 84 * p), R(-w / 2 + 14, -h / 2 + 84 * p)], k + 410 + i, t, 0.4, false));
              o.r.setAttribute('d', ringS(sheet, k + 420 + i, t, 4, 0.5, false) + ' ' + ringS([R(-w / 2 + 10, -h / 2 + 10), R(w / 2 - 10, -h / 2 + 10), R(w / 2 - 10, h / 2 - 10), R(-w / 2 + 10, h / 2 - 10)], k + 430 + i, t, 6, 0.4, false) + ' ' + inkDot(R(0, -h / 2 + 4)[0], R(0, -h / 2 + 4)[1], 8, 8, k + 440 + i, t));
              const deg = (Pq.rot ?? (i % 2 ? 3 : -3)), hp = R(0, -h / 2 + 64 * p), tp = R(0, 50 * p);
              o.hd.setAttribute('opacity', 1); o.tx.setAttribute('opacity', 1);
              o.hd.setAttribute('transform', `translate(${f1(hp[0])} ${f1(hp[1])}) rotate(${deg}) scale(${p.toFixed(3)})`);
              o.tx.setAttribute('transform', `translate(${f1(tp[0])} ${f1(tp[1])}) rotate(${deg}) scale(${(p * (1 + 0.1 * punch(lt, a, 0.5))).toFixed(3)})`);
            });
          }
          if (P.pump) {
            const px = (P.pump.x ?? 0.78) * W, s = P.pump.s ?? 1, y = gy + 10;
            const body = [[px - 34 * s, y], [px - 30 * s, y - 380 * s], [px - 44 * s, y - 400 * s], [px, y - 440 * s], [px + 44 * s, y - 400 * s], [px + 30 * s, y - 380 * s], [px + 34 * s, y]];
            const hd = Math.sin(lt * 1.2) * 0.25;
            pumpF.setAttribute('d', loopS(body, k + 500, t, 0.5, false) + ' ' + loopS(rect(px - 54 * s, y - 30 * s, px + 54 * s, y), k + 501, t, 0.4, false));
            pumpR.setAttribute('d', [ringS(body, k + 502, t, 4, 0.5, false), lineS([[px + 30 * s, y - 230 * s], [px + 110 * s, y - 220 * s], [px + 120 * s, y - 196 * s]], k + 503, t, 14 * s, 0.4),
              lineS([[px - 30 * s, y - 330 * s], [px - 30 * s - Math.cos(hd) * 150 * s, y - 330 * s - Math.sin(hd + 0.6) * 150 * s]], k + 504, t, 10 * s, 0.4)].join(' '));
            const u = (lt * 1.4) % 1; drip.setAttribute('d', loopS(ell(px + 120 * s, y - 180 * s + u * 170 * s, 8, 12, 7), k + 505, t, 0.3));
          }
          if (P.signs) {
            const sx = (P.post_x ?? 0.74) * W;
            const pst = rect(sx - 16, gy - 760, sx + 16, gy + 8);
            post.setAttribute('d', loopS(pst, k + 600, t, 0.5, false)); postR.setAttribute('d', ringS(pst, k + 601, t, 4, 0.5, false));
            signs.forEach((o, i) => {
              const a = atOr(cues, o.S.at, 0.2 + i * 0.5), p = lt >= a ? spring(lt, a, 0.5) : 0, pk = punch(lt, a, 0.5);
              const dir = o.S.dir ?? (i % 2 ? -1 : 1), y = gy - 700 + i * 150, rot = (o.S.rot ?? (i % 2 ? 4 : -3));
              let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = o.S.text.length * 34; w += 90;
              const B = dir > 0 ? [[-20, -52], [w - 40, -52], [w + 10, 0], [w - 40, 52], [-20, 52]] : [[20, -52], [-w + 40, -52], [-w - 10, 0], [-w + 40, 52], [20, 52]];
              o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
              o.g.setAttribute('transform', `translate(${f1(sx)} ${f1(y)}) rotate(${f1(rot + (1 - p) * dir * 30)}) scale(${(lerp(0.3, 1, p) * (1 + 0.06 * pk)).toFixed(3)})`);
              o.f.setAttribute('d', loopS(B, k + 610 + i, t, 0.5, false)); o.r.setAttribute('d', ringS(B, k + 620 + i, t, 5, 0.5, false));
              o.tx.setAttribute('x', f1(dir * (w / 2 - 20))); o.tx.setAttribute('y', 22);
            });
          }
          cast.forEach(c => c && c.update(lt, t, cues, W, H));
          // cobbled foreground + kerb (fills the frame bottom)
          const CB = [], CR = [];
          CB.push(loopS([[-30, gy + 150], [W + 30, gy + 140], [W + 30, H + 30], [-30, H + 30]], k + 700, t, 0.6, false));
          CR.push(lineS([[-30, gy + 150], [W + 30, gy + 140]], k + 701, t, 7, 0.6), lineS([[-30, gy + 190], [W + 30, gy + 180]], k + 702, t, 4, 0.6));
          for (let row = 0; row < 9; row++) { const y = gy + 240 + row * 66 + row * row * 4, s = 1 + row * 0.12; for (let c = 0; c < 9; c++) { const x = (row % 2 ? 60 : 0) * s + c * 128 * s - 30; if (x > W + 40) continue; CR.push(ringS(ell(x, y, 52 * s, 22 * s, 9), k + 710 + row * 10 + c, t, 3, 0.5)); } }
          cob.setAttribute('d', CB.join(' ')); cobR.setAttribute('d', CR.join(' '));
          curb.setAttribute('d', '');
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
          void hit;
        },
      };
    },
  };

  // ================================================================== gs_desk
  SH.gs_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7501, top = el(svg, 'g'), root = el(top, 'g');
      const dy = P.desk_y ?? 1010;
      // wall: calendar + clock
      const cal = el(root, 'g'), calF = inkEl(cal, INK.paperLight), calH = inkEl(cal, INK.red), calR = inkEl(cal), flip = inkEl(cal, mix(INK.paperLight, INK.paperDark, 0.3)), flipR = inkEl(cal);
      const calT = el(cal, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.ink });
      const calS = el(cal, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 56, 'text-anchor': 'middle', fill: INK.paperLight });
      const clkF = inkEl(root, WOOD()), clkFace = inkEl(root, INK.paperLight), clkR = inkEl(root), pend = inkEl(root, INK.gold), pendR = inkEl(root);
      // desk
      const deskF = inkEl(root, WOOD()), deskT = inkEl(root, mix(WOOD(), INK.paperLight, 0.25)), deskR = inkEl(root), grain = inkEl(root, mix(INK.inkSoft, INK.stain, 0.4));
      const rolls = inkEl(root, INK.paperLight), rollsE = inkEl(root, mix(INK.paperDark, INK.paperLight, 0.4)), ribbon = inkEl(root, INK.red), rollsR = inkEl(root);
      const dust = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), web = inkEl(root, INK.inkSoft);
      const plan = inkEl(root, INK.paperLight), planR = inkEl(root), planRiver = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), planInk = inkEl(root, INK.inkSoft), sewers = inkEl(root, INK.red);
      const well = inkEl(root, INK.ink), quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const stampG = el(root, 'g'), stampF = inkEl(stampG, INK.red, { 'fill-opacity': 0.9 }), stampR = inkEl(stampG, INK.red);
      const stampT = el(stampG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 130, 'text-anchor': 'middle', fill: INK.paperLight }); stampT.textContent = P.stampText || 'LAW';
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // ---- calendar (top right)
          const CX = (P.cal_x ?? 0.68) * W, CY = P.cal_y ?? 560, cw = 300, ch = 360;
          const pg = rect(CX - cw / 2, CY - ch / 2, CX + cw / 2, CY + ch / 2);
          calF.setAttribute('d', loopS(pg, k + 1, t, 0.5, false));
          calH.setAttribute('d', loopS(rect(CX - cw / 2, CY - ch / 2, CX + cw / 2, CY - ch / 2 + 90), k + 2, t, 0.4, false));
          calR.setAttribute('d', ringS(pg, k + 3, t, 5, 0.5, false) + ' ' + [-80, 0, 80].map((dx, i) => ringS(ell(CX + dx, CY - ch / 2, 12, 18, 8), k + 4 + i, t, 4, 0.3)).join(' ') + ' ' + lineS([[CX, CY - ch / 2 - 40], [CX, CY - ch / 2]], k + 9, t, 3, 0.3));
          let text = '', sub = '', fl = 0;
          (P.pages || []).forEach(pq => { const a = atOr(cues, pq.at, 0); if (lt >= a) { text = pq.text; sub = pq.sub || ''; fl = lt - a; } });
          if (P.days) {
            const D = P.days, a = atOr(cues, D.at, 0.3), d = D.dur ?? 1.6, n = D.n ?? 18, p = lt >= a ? clamp01((lt - a) / d) : 0;
            const i = Math.floor(EASE_IO(p) * n), list = D.list || [];
            text = list.length ? list[Math.min(list.length - 1, Math.round(EASE_IO(p) * (list.length - 1)))][0] : String(i);
            sub = list.length ? list[Math.min(list.length - 1, Math.round(EASE_IO(p) * (list.length - 1)))][1] : '';
            fl = p < 1 ? (lt * 8) % 1 : 1;
          }
          calT.textContent = text; calS.textContent = sub;
          calT.setAttribute('x', CX); calT.setAttribute('y', CY + 120); calS.setAttribute('x', CX); calS.setAttribute('y', CY - ch / 2 + 66);
          calT.setAttribute('font-size', text.length > 3 ? 110 : 150);
          if (fl < 0.35) {   // the old page flying off upwards
            const u = fl / 0.35, fp = [[CX - cw / 2 + 10, CY - ch / 2 + 90 - u * 140], [CX + cw / 2 - 10, CY - ch / 2 + 90 - u * 220], [CX + cw / 2 - 10 + u * 60, CY + ch / 2 - u * 420], [CX - cw / 2 + 10 + u * 20, CY + ch / 2 - u * 330]];
            flip.setAttribute('d', loopS(fp, k + 10, t, 0.5, false)); flipR.setAttribute('d', ringS(fp, k + 11, t, 4, 0.5, false));
          } else { flip.setAttribute('d', ''); flipR.setAttribute('d', ''); }
          // ---- pendulum clock (top left-centre, below the kicker)
          if (P.clock !== false) {
          const KX = (P.clock_x ?? 0.26) * W, KY = P.clock_y ?? 470;
          const cb = [[KX - 90, KY - 120], [KX + 90, KY - 120], [KX + 80, KY + 380], [KX - 80, KY + 380]];
          clkF.setAttribute('d', loopS(cb, k + 20, t, 0.5, false));
          clkFace.setAttribute('d', loopS(ell(KX, KY - 20, 70, 70, 14), k + 21, t, 0.4) + ' ' + loopS(rect(KX - 54, KY + 90, KX + 54, KY + 350), k + 22, t, 0.4, false));
          const ma = lt * 1.2, sw = Math.sin(lt * Math.PI * 1.0) * 0.32, pb = [KX + Math.sin(sw) * 220, KY + 60 + Math.cos(sw) * 220];
          const TK = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; TK.push(lineS([[KX + Math.cos(a) * 56, KY - 20 + Math.sin(a) * 56], [KX + Math.cos(a) * 64, KY - 20 + Math.sin(a) * 64]], k + 30 + i, t, 3, 0.2)); }
          clkR.setAttribute('d', [ringS(cb, k + 23, t, 5, 0.5, false), ringS(ell(KX, KY - 20, 70, 70, 14), k + 24, t, 5, 0.4), ...TK, lineS([[KX, KY - 20], [KX + Math.sin(ma) * 52, KY - 20 - Math.cos(ma) * 52]], k + 25, t, 4, 0.2), lineS([[KX, KY - 20], [KX + Math.sin(ma / 12 + 1) * 34, KY - 20 - Math.cos(ma / 12 + 1) * 34]], k + 26, t, 6, 0.2)].join(' '));
          pend.setAttribute('d', loopS(ell(pb[0], Math.min(pb[1], KY + 330), 30, 30, 10), k + 27, t, 0.4));
          pendR.setAttribute('d', lineS([[KX, KY + 70], [pb[0], Math.min(pb[1], KY + 330)]], k + 28, t, 4, 0.3) + ' ' + ringS(ell(pb[0], Math.min(pb[1], KY + 330), 30, 30, 10), k + 29, t, 4, 0.4));
          }
          // ---- desk (front edge at dy, top surface in perspective, front panel to the bottom)
          const topS = [[-40, dy], [W + 40, dy - 10], [W + 40, dy + 330], [-40, dy + 340]];
          deskT.setAttribute('d', loopS(topS, k + 40, t, 0.6, false));
          deskF.setAttribute('d', loopS([[-40, dy + 340], [W + 40, dy + 330], [W + 40, H + 40], [-40, H + 40]], k + 41, t, 0.6, false));
          const G = []; for (let i = 0; i < 7; i++) G.push(lineS([[-20, dy + 40 + i * 44], [W * 0.4, dy + 36 + i * 44 + 6], [W + 20, dy + 30 + i * 44]], k + 50 + i, t, 2.5, 0.6));
          for (let i = 0; i < 6; i++) G.push(lineS([[-20, dy + 420 + i * 80], [W + 20, dy + 414 + i * 80]], k + 60 + i, t, 2.5, 0.6));
          grain.setAttribute('d', G.join(' '));
          deskR.setAttribute('d', [ringS(topS, k + 42, t, 6, 0.6, false), lineS([[-40, dy + 340], [W + 40, dy + 330]], k + 43, t, 8, 0.6), ringS(rect(W * 0.3, dy + 420, W * 0.7, dy + 620), k + 44, t, 5, 0.5, false), loopS(ell(W * 0.5, dy + 520, 18, 14, 8), k + 45, t, 0.3)].join(' '));
          // ---- rolled plans (unless unrolled)
          const ua = atOr(cues, P.unroll, null), up = ua == null ? 0 : prog(lt, ua, 0.9);
          const RL = [], RE = [], RB = [], RR = [];
          const RS = P.rolls === false ? [] : [[0.3, dy + 120, 330], [0.36, dy + 210, 360], [0.7, dy + 160, 300]];
          RS.forEach(([u, y, len], i) => {
            if (up > 0 && i === 1) return;
            const x = u * W, r = 34, body = rect(x - len / 2, y - r, x + len / 2, y + r);
            RL.push(loopS(body, k + 70 + i, t, 0.5, false)); RE.push(loopS(ell(x + len / 2, y, 14, r, 10), k + 73 + i, t, 0.4));
            RB.push(loopS(rect(x - 18, y - r - 4, x + 18, y + r + 4), k + 76 + i, t, 0.3, false));
            RR.push(ringS(body, k + 79 + i, t, 4, 0.5, false), ringS(ell(x + len / 2, y, 14, r, 10), k + 82 + i, t, 3, 0.4), ringS(ell(x + len / 2, y, 5, 10, 6), k + 85 + i, t, 2, 0.3));
          });
          rolls.setAttribute('d', RL.join(' ')); rollsE.setAttribute('d', RE.join(' ')); ribbon.setAttribute('d', RB.join(' ')); rollsR.setAttribute('d', RR.join(' '));
          // ---- dust + cobweb
          const da = atOr(cues, P.dust, null), dp = da == null ? 0 : prog(lt, da, 2.2);
          if (dp > 0) {
            const DD = []; RS.forEach(([u, y, len], i) => { for (let j = 0; j < 14; j++) { const x = u * W - len / 2 + 10 + j * (len - 20) / 13; DD.push(loopS(ell(x, y - 36 - dp * 6, 14 * dp, 6 * dp, 6), k + 90 + i * 20 + j, t, 0.3)); } });
            const MOTE = []; for (let j = 0; j < 14; j++) { const u = (lt * 0.08 + hn(sd + j, 1)) % 1; MOTE.push(loopS(ell(hn(sd + j, 2) * W, 300 + u * (dy - 300), 4, 4, 5), k + 150 + j, t, 0.2)); }
            dust.setAttribute('d', DD.join(' ') + ' ' + MOTE.join(' '));
            const wx = 0.16 * W, wyy = dy - 10, R0 = 230 * dp, WB = [];
            for (let s = 0; s < 6; s++) { const a = -Math.PI / 2 + s * (Math.PI / 2) / 5; WB.push(lineS([[wx, wyy], [wx + Math.cos(a) * R0 * -1 * -1, wyy + Math.sin(a) * R0]], k + 170 + s, t, 2, 0.2)); }
            for (let c = 1; c < 4; c++) { const rr = R0 * c / 4, pts = []; for (let s = 0; s < 6; s++) { const a = -Math.PI / 2 + s * (Math.PI / 2) / 5; pts.push([wx + Math.cos(a) * rr, wyy + Math.sin(a) * rr + 6]); } WB.push(lineS(pts, k + 180 + c, t, 2, 0.2)); }
            web.setAttribute('d', WB.join(' '));
          }
          // ---- the unrolled plan: the Thames with the intercepting sewers (red) along both banks
          if (up > 0) {
            const x0 = W * 0.1, x1 = lerp(W * 0.12, W * 0.9, up), y0 = dy + 40, y1 = dy + 300;
            const sheet = rect(x0, y0, x1, y1);
            plan.setAttribute('d', loopS(sheet, k + 200, t, 0.5, false));
            planR.setAttribute('d', ringS(sheet, k + 201, t, 4, 0.5, false) + ' ' + ringS(ell(x1, (y0 + y1) / 2, 18, (y1 - y0) / 2, 10), k + 202, t, 4, 0.4));
            const rv = [], rv2 = []; for (let i = 0; i <= 10; i++) { const x = lerp(x0 + 20, x1 - 20, i / 10), y = (y0 + y1) / 2 + Math.sin(i * 0.9) * 40; rv.push([x, y - 22]); rv2.push([x, y + 22]); }
            planRiver.setAttribute('d', loopS(rv.concat(rv2.slice().reverse()), k + 203, t, 0.5, false));
            planInk.setAttribute('d', lineS(rv, k + 204, t, 3, 0.4) + ' ' + lineS(rv2, k + 205, t, 3, 0.4));
            const sa = atOr(cues, P.sewers, ua + 0.6), sp = prog(lt, sa, 1.0);
            const S1 = [], S2 = [], S3 = []; for (let i = 0; i <= 10 * sp; i++) { const x = lerp(x0 + 20, x1 - 20, i / 10), y = (y0 + y1) / 2 + Math.sin(i * 0.9) * 40; S1.push([x, y - 60]); S2.push([x, y - 95]); S3.push([x, y + 62]); }
            sewers.setAttribute('d', [S1, S2, S3].filter(s => s.length > 1).map((s, i) => lineS(s, k + 210 + i, t, 7, 0.4)).join(' '));
          } else { plan.setAttribute('d', ''); planR.setAttribute('d', ''); planRiver.setAttribute('d', ''); planInk.setAttribute('d', ''); sewers.setAttribute('d', ''); }
          // ---- inkwell + quill (right)
          const ix = 0.86 * W, iy = dy + 250;
          well.setAttribute('d', loopS([[ix - 50, iy], [ix - 44, iy - 70], [ix - 20, iy - 90], [ix + 20, iy - 90], [ix + 44, iy - 70], [ix + 50, iy]], k + 230, t, 0.4));
          const qa = Math.sin(lt * 1.5) * 0.08, Q = [[ix + 4, iy - 86], [ix + 60 + qa * 200, iy - 300], [ix + 120 + qa * 260, iy - 420], [ix + 50 + qa * 200, iy - 260]];
          quill.setAttribute('d', loopS(Q, k + 231, t, 0.5)); quillR.setAttribute('d', ringS(Q, k + 232, t, 3, 0.5) + ' ' + lineS([[ix + 4, iy - 86], [ix + 110 + qa * 260, iy - 400]], k + 233, t, 2.5, 0.4));
          // ---- the stamp
          const sa2 = atOr(cues, P.stamp, null);
          if (sa2 != null && lt >= sa2 - 0.25) {
            const p = clamp01((lt - sa2 + 0.25) / 0.25), sx = W * 0.5, sy = dy + 170, sc = lerp(2.2, 1, p * p) * (1 + 0.08 * punch(lt, sa2, 0.5));
            stampG.setAttribute('opacity', clamp01(p * 2).toFixed(3));
            stampG.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(-8) scale(${sc.toFixed(3)})`);
            const bw = 360, bh = 170, b = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
            stampF.setAttribute('d', loopS(b, k + 240, t, 0.6, false));
            stampR.setAttribute('d', ringS(b.map(([x, y]) => [x * 1.08, y * 1.16]), k + 241, t, 6, 0.6, false));
            stampT.setAttribute('y', 46);
          } else stampG.setAttribute('opacity', 0);
          labs.forEach(l => l.update(lt, t, cues));
          void hit;
        },
      };
    },
  };

  // ================================================================== gs_tunnel
  // Cut-away: the river on top (brown, turning clear on cue "clear"), the embankment wall, earth below and a giant
  // finished egg-shaped brick sewer carrying the brown flow away (flow streaks + chevrons); cholera notices pinned
  // to the timber shoring fade out on cue "fade". Bricks optionally close course by course (build: {at, dur}).
  SH.gs_tunnel = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7601, top = el(svg, 'g'), root = el(top, 'g');
      const ry0 = P.river_top ?? 300, ry1 = P.river_bottom ?? 520, gy = ry1 + 70;
      const water = inkEl(root, SEWAGE()), clearW = inkEl(root, CLEAN()), wrip = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), wline = inkEl(root);
      const wall = inkEl(root, STONE()), wallR = inkEl(root);
      const earth = inkEl(root, EARTH()), hatch = inkEl(root, mix(INK.inkSoft, EARTH(), 0.45)), earthR = inkEl(root);
      const inner = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), flow = inkEl(root, SEWAGE()), flowL = inkEl(root, SEWAGE_L()), brick = inkEl(root, BRICK()), brickR = inkEl(root);
      const shore = inkEl(root, WOOD()), shoreR = inkEl(root);
      const posters = [0, 1].map(() => ({ g: el(root, 'g') }));
      posters.forEach((o, i) => { o.f = inkEl(o.g, INK.paperLight); o.b = inkEl(o.g, INK.ink); o.r = inkEl(o.g); o.hd = el(o.g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 24, 'text-anchor': 'middle', fill: INK.paperLight }); o.hd.textContent = 'CHOLERA'; o.tx = el(o.g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink }); o.tx.textContent = (P.posters || ['1849', '1854'])[i]; });
      const lamp = inkEl(root, INK.gold), lampR = inkEl(root);
      const cast = figures(el(root, 'g'), P.cast, sd + 40);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // ---- river on top: brown, the clear water washes in from the left on cue
          const ca = atOr(cues, P.clear, null), cp = ca == null ? 0 : progIO(lt, ca, 1.4);
          const surf = []; for (let i = 0; i <= 14; i++) { const x = -40 + i * (W + 80) / 14; surf.push([x, ry0 + Math.sin(i * 1.2 + lt * 1.5) * 6]); }
          const box = surf.concat([[W + 40, ry1], [-40, ry1]]);
          water.setAttribute('d', loopS(box, k + 1, t, 0.5, false));
          if (cp > 0) { const xe = lerp(-60, W + 60, cp); clearW.setAttribute('d', loopS(surf.filter(q => q[0] <= xe).concat([[xe, ry0], [xe + 40, (ry0 + ry1) / 2], [xe, ry1], [-40, ry1]]), k + 2, t, 0.5, false)); } else clearW.setAttribute('d', '');
          const RP = []; for (let j = 0; j < 10; j++) { const y = ry0 + 30 + (j % 5) * (ry1 - ry0 - 50) / 5, x = ((hn(sd + j, 1) * W + lt * (40 + j * 7)) % (W + 200)) - 100; RP.push(lineS([[x, y], [x + 40, y - 6], [x + 80, y], [x + 120, y - 6]], k + 10 + j, t, 4, 0.4)); }
          wrip.setAttribute('d', RP.join(' ')); wline.setAttribute('d', lineS(surf, k + 3, t, 6, 0.5));
          // ---- embankment wall (stone courses) between river and earth
          const wl = rect(-40, ry1, W + 40, gy);
          wall.setAttribute('d', loopS(wl, k + 4, t, 0.4, false));
          const WR = [ringS(wl, k + 5, t, 5, 0.4, false)]; for (let c = 0; c < 9; c++) WR.push(lineS([[c * 130 + (c % 2) * 40, ry1], [c * 130 + (c % 2) * 40, gy]], k + 20 + c, t, 3, 0.3));
          WR.push(lineS([[-40, (ry1 + gy) / 2], [W + 40, (ry1 + gy) / 2]], k + 30, t, 3, 0.3));
          wallR.setAttribute('d', WR.join(' '));
          // ---- earth
          earth.setAttribute('d', loopS([[-40, gy], [W + 40, gy], [W + 40, H + 40], [-40, H + 40]], k + 6, t, 0.5, false));
          const HT = []; for (let i = 0; i < 60; i++) { const x = hn(sd + i, 3) * W, y = gy + 30 + hn(sd + i, 4) * (H - gy - 60); HT.push(lineS([[x, y], [x + 30, y + 30]], k + 300 + i, t, 2.5, 0.4)); }
          // clay strata + pebbles below the sewer so the lower frame is a real section, not empty ground
          const strata = P.strata ?? ((P.cy ?? 820) + (P.r ?? 240) * 1.4);
          for (let j = 0; j < 6; j++) { const y = strata + j * 90; const pts = []; for (let i = 0; i <= 10; i++) pts.push([-40 + i * (W + 80) / 10, y + Math.sin(i * 1.3 + j * 2) * 14]); HT.push(lineS(pts, k + 500 + j, t, 4, 0.5)); }
          for (let j = 0; j < 22; j++) { const x = hn(sd + j, 31) * W, y = strata + 20 + hn(sd + j, 32) * 520; HT.push(ringS(ell(x, y, 12 + hn(sd + j, 33) * 16, 8 + hn(sd + j, 34) * 8, 8), k + 520 + j, t, 3, 0.4)); }
          hatch.setAttribute('d', HT.join(' ')); earthR.setAttribute('d', lineS([[-40, gy], [W + 40, gy]], k + 7, t, 6, 0.5));
          // ---- the egg-shaped sewer (wide crown, narrow invert)
          const cx = W / 2, cy = P.cy ?? 820, R = (P.r ?? 240) * (1 + 0.02 * hit);
          const egg = s => { const pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, sy = Math.sin(a); pts.push([cx + Math.cos(a) * R * s * (sy > 0 ? 0.8 - 0.2 * sy : 1), cy + sy * R * s * (sy > 0 ? 1.2 : 1)]); } return pts; };
          inner.setAttribute('d', loopS(egg(0.86), k + 8, t, 0.4));
          // brown flow in the lower part, streaks moving to the right
          const inn = egg(0.86), fy = cy + R * 0.42, FL = inn.filter(q => q[1] >= fy);
          if (FL.length > 2) {
            const xl = Math.min(...FL.map(q => q[0])), xr = Math.max(...FL.map(q => q[0]));
            const fpts = [[xl, fy + Math.sin(lt * 3) * 3]]; for (let i = 1; i < 8; i++) fpts.push([lerp(xl, xr, i / 8), fy + Math.sin(i * 1.4 + lt * 4) * 5]); fpts.push([xr, fy]);
            flow.setAttribute('d', loopS(fpts.concat(FL.slice().sort((a, b) => b[0] - a[0])), k + 9, t, 0.4));
            const ST = []; for (let j = 0; j < 6; j++) { const u = (lt * 0.6 + j / 6) % 1, y = fy + 20 + (j % 3) * 26, x = lerp(xl + 20, xr - 60, u), w = 50; ST.push(loopS([[x, y], [x + w, y - 4], [x + w + 14, y + 6], [x + 8, y + 8]], k + 40 + j, t, 0.4)); }
            for (let j = 0; j < 3; j++) { const u = (lt * 0.5 + j / 3) % 1, x = lerp(xl + 30, xr - 40, u), y = fy + 40; ST.push(loopS([[x, y - 18], [x + 22, y], [x, y + 18], [x + 8, y]], k + 60 + j, t, 0.3, false)); }
            flowL.setAttribute('d', ST.join(' '));
          }
          const ba = P.build ? atOr(cues, P.build.at, 0) : null, bp = ba == null ? 1 : prog(lt, ba, P.build.dur ?? 2);
          const outer = egg(1.06), BB = [], BR = [], n = outer.length;
          for (let i = 0; i < n; i++) {
            const a = i / n * Math.PI * 2, fromBottom = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) / Math.PI;
            if (1 - fromBottom > bp) continue;
            const j = (i + 1) % n, q = [inn[i], outer[i], outer[j], inn[j]];
            BB.push(loopS(q, k + 100 + i, t, 0.4, false)); BR.push(ringS(q, k + 140 + i, t, 3, 0.4, false));
          }
          brick.setAttribute('d', BB.join(' ')); brickR.setAttribute('d', BR.join(' '));
          // lamp hanging in the crown
          const sw = Math.sin(lt * 1.6) * 8, lx = cx + sw, ly = cy - R * 0.74;
          lamp.setAttribute('d', loopS(ell(lx, ly + 30, 14, 18, 8), k + 180, t, 0.3));
          lampR.setAttribute('d', lineS([[cx, cy - R * 0.84], [lx, ly + 10]], k + 181, t, 3, 0.3) + ' ' + ringS(rect(lx - 20, ly + 6, lx + 20, ly + 56), k + 182, t, 3, 0.3, false));
          // timber shoring either side + the cholera notices pinned to it (fade out on cue "fade")
          const SHF = [], SHR = [];
          [-1, 1].forEach((s, c) => { const x = cx + s * (R * (P.side ?? 1.32)); const q = rect(x - 18, gy, x + 18, cy + R * 1.3); SHF.push(loopS(q, k + 200 + c, t, 0.4, false)); SHR.push(ringS(q, k + 202 + c, t, 4, 0.4, false));
            for (let j = 0; j < 3; j++) { const y = gy + 80 + j * 200, q2 = rect(Math.min(x, cx + s * R * 1.06) - 4, y - 12, Math.max(x, cx + s * R * 1.06) + 4, y + 12); SHF.push(loopS(q2, k + 210 + c * 5 + j, t, 0.3, false)); SHR.push(ringS(q2, k + 220 + c * 5 + j, t, 3, 0.3, false)); } });
          shore.setAttribute('d', SHF.join(' ')); shoreR.setAttribute('d', SHR.join(' '));
          const fa = atOr(cues, P.fade, null), fo = fa == null ? 1 : 1 - progIO(lt, fa, 0.8);
          posters.forEach((o, i) => {
            const s = i ? 1 : -1, ps = P.poster_s ?? 1, px = cx + s * R * (P.side ?? 1.32), py = gy + (P.poster_y ?? 190), w = 150, h = 190, rot = s * 4;
            o.g.setAttribute('opacity', fo.toFixed(3));
            o.g.setAttribute('transform', `translate(${f1(px)} ${f1(py + (1 - fo) * 40)}) rotate(${rot + (1 - fo) * s * 20}) scale(${ps})`);
            const sh = rect(-w / 2, -h / 2, w / 2, h / 2);
            o.f.setAttribute('d', loopS(sh, k + 240 + i, t, 0.4, false)); o.b.setAttribute('d', loopS(rect(-w / 2 + 8, -h / 2 + 8, w / 2 - 8, -h / 2 + 52), k + 242 + i, t, 0.3, false));
            o.r.setAttribute('d', ringS(sh, k + 244 + i, t, 4, 0.4, false));
            o.hd.setAttribute('y', -h / 2 + 41); o.tx.setAttribute('y', 40);
          });
          cast.forEach(c => c && c.update(lt, t, cues, W, H));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
