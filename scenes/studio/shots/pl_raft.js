// pl_raft: shots for the Poon Lim survival Short (Stickstory 2026-10-27): 133 days alone on a raft, 1942-43.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any castaway / raft / shipwreck story.
// Uses td__lib.js (TD.label) and tz__lib.js (TZ.water) at build time. Period figures use the KASIF rig without a hat;
// the narrator (fez) comes from params.kasif. The hero is params.lim (NOT params.cast: lint counts cast as narrator).
//
// K (figure) = {x, y (ground, 0..1 H), scale, pose, face: "left"|"right", dir, emotion, seq: [{at, pose, dir, face, emotion}]}
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot, underline}
//
// SHOTS.pl_sea — open ocean, side view: a small square wooden raft (planks, water keg, tins) rocking on the swell, the
//   hero on it; optional swimmer (the hero swims to the raft), a cargo steamer passing far away (smoke), a small
//   fishing sailboat with fishermen arriving, a day counter, gulls, shout arcs, the narrator standing on a floating
//   barrel in the near water. The water band runs to the frame bottom (use "set": "ocean"|"coast"|"storm").
//   P: {sea: 0.62 (near water line, 0..1 H), raft: {x: 0.62, y: 0.62, s: 1, rock: 3} | false,
//       lim: K (stands/sits on the raft deck; x ignored when on the raft) | false, swim: {from: 0.1, at: cue|s, dur: 2.2, y} | false,
//       sub: {x: 0.8, y, s: 0.35, at: cue (surfaces), gone: cue (dives)} | false,
//       ship: {from: -0.2, to: 1.2, y: 0.36 (waterline), s: 0.35, at, dur} | false, boat: {from: 1.3, to: 0.86, y: 0.6, s: 0.8, at, dur, fishers: 3,
//       happy: cue (fishermen wave)} | false, counter: {from: 1, to: 133, at, dur: 2, x: 0.74, y: 0.22, prefix: "DAY ", size: 110} | false,
//       shout: {at, dur} | false, gulls: 3, kasif: K + {barrel: true} | false, labels: [L], dark: false, rough: 1, front}
//   cues: hit (punch), swim.at, ship.at, boat.at, boat.happy, counter.at, shout.at, label / seq names
// SHOTS.pl_sink — a cargo steamer (side view) and a surfaced U-boat; on "torpedo" a bubble track runs to the hull, on
//   "hit" an explosion + water column, then the ship lists and slides under the water line (clipped).
//   P: {sea: 0.6, ship: {x: 0.6, s: 0.95}, uboat: {x: 0.14, s: 0.55}, torpedo: cue|s, hit: cue|s, sink_dur: 3, labels: [L]}
// SHOTS.pl_hook — close-up, top view of the raft's deck planks filling the frame (water beyond the far edge at the top):
//   an empty tin tips over (cue "empty"), a hand pulls a nail out of a plank (cue "pull"), then two hands bend it into a
//   barbed fishhook (cue "bend"), gold glint. Own full frame: use "set": false.
//   P: {edge: 0.2 (far edge of the raft, 0..1 H), nail: {x: 0.5, y: 0.42}, empty: cue|s, pull: cue|s, bend: cue|s, labels: [L]}
// SHOTS.pl_catch — split view at the surface: raft and hero above, underwater below: a fishing line with the hook, fish
//   that bite (cue "fish"), a gull that lands on the raft (cue "bird"), a big shark gliding in below (cue "shark").
//   P: {sea: 0.34 (surface), raft: {x: 0.36, s: 1}, lim: K, fish: cue, bird: cue, shark: cue, labels: [L]}
// SHOTS.pl_end — closing card: giant Fraunces lines word by word (highlight word in a red box) over the sea; a big raft
//   in the foreground with ONE figure standing on its deck: the hero (P.lim, no hat) or the narrator (P.kasif, fez),
//   optionally holding up the fishhook.
//   P: {lines: [{words: [...], at: [cue...], y, size}], highlight: "RECORD", sea: 0.6 (far water), raft: {x: 0.5, y: 0.74, s: 1.5},
//       close: {focus: [x, y] (0..1), zoom: 1.8, to: [0.5, 0.42]} (close-up of the world only; use "camera": false), lim: K + {hook, dx} | kasif: K + {hook, dx}, front: "wave"|"fin"|{type, y, s} | false, labels: [L]}
// Shared P.front (pl_sea, pl_end): a foreground swell over the lower frame ({type: "wave"|"fin", y: 0.76, s: 1.3, phase}).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const R2 = (x, y, s, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s]; };
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ring = (e, pts, sd, t, w = 5, amp = 1, smooth = true) => e.setAttribute('d', inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth }));
  const line = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);

  // ------------------------------------------------------------------ figure (hero / fishermen / narrator)
  function figure(parent, K, sd, hat) {
    const rig = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.5, hat, accessory: hat ? null : (K.accessory || null), beard: hat ? null : (K.beard || null), seed: sd });
    return {
      update(lt, t, cues, x, y) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at), face = faceOf(s.face ?? K.face, 1);
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o), sc = K.scale ?? 0.5, hw = r.hands[1];
        return { hand: [x + face * sc * hw[0], y + sc * hw[1]], head: [x + face * sc * r.head[0], y + sc * r.head[1]], face };
      },
    };
  }

  // ------------------------------------------------------------------ the raft (3/4 side view), local units, deck top y ≈ -40
  function raft(parent, sd) {
    const g = el(parent, 'g');
    const side = inkEl(g, INK.stain), sideR = inkEl(g), deck = inkEl(g, mix(INK.paperDark, INK.stain, 0.35)), deckR = inkEl(g), pl = inkEl(g, INK.inkSoft);
    const keg = inkEl(g, INK.stain), kegR = inkEl(g), tins = inkEl(g, INK.paperLight), tinsR = inkEl(g);
    return {
      g,
      update(t, x, y, s, rock, o = {}) {
        const R = R2(x, y, s, rock), k = sd * 7;
        const top = [[-165, -18], [160, -22], [128, -64], [-136, -60]].map(R), fr = [[-165, -18], [160, -22], [160, 14], [-165, 18]].map(R);
        fill(side, fr, k + 1, t, 1, false); ring(sideR, fr, k + 2, t, 5, 1, false);
        fill(deck, top, k + 3, t, 1, false); ring(deckR, top, k + 4, t, 5, 1, false);
        const P = [];
        for (let i = 1; i < 5; i++) { const u = i / 5; P.push(line([[lerp(-165, 160, u), -19], [lerp(-136, 128, u), -61]].map(R), k + 10 + i, t, 2.5)); }
        P.push(line([[-150, -2], [150, -4]].map(R), k + 20, t, 2.5));
        pl.setAttribute('d', P.join(' '));
        if (o.keg !== false) {
          const kp = [[60, -40], [62, -110], [70, -118], [120, -118], [128, -110], [130, -40]].map(R);
          fill(keg, kp, k + 30, t); ring(kegR, kp, k + 31, t, 4);
          kegR.setAttribute('d', kegR.getAttribute('d') + ' ' + line([[62, -66], [128, -66]].map(R), k + 32, t, 3) + ' ' + line([[64, -92], [126, -92]].map(R), k + 33, t, 3));
        } else { keg.setAttribute('d', ''); kegR.setAttribute('d', ''); }
        if (o.tins !== false) {
          const a = [[-120, -40], [-120, -78], [-82, -78], [-82, -40]].map(R), b = [[-76, -38], [-76, -66], [-46, -66], [-46, -38]].map(R);
          tins.setAttribute('d', inkLoop(a, { seed: k + 40, t, smooth: false }) + ' ' + inkLoop(b, { seed: k + 41, t, smooth: false }));
          tinsR.setAttribute('d', inkPath(a, { w: 4, seed: k + 42, t, closed: true, smooth: false }) + ' ' + inkPath(b, { w: 4, seed: k + 43, t, closed: true, smooth: false }) + ' ' + line([[-120, -66], [-82, -66]].map(R), k + 44, t, 2.5));
        } else { tins.setAttribute('d', ''); tinsR.setAttribute('d', ''); }
        return { deck: R([-20, -42]), R };
      },
    };
  }

  // ------------------------------------------------------------------ cargo steamer (side view, bow to the right), waterline y = 0
  function steamer(parent, sd) {
    const g = el(parent, 'g');
    const smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.35 });
    const masts = inkEl(g), hull = inkEl(g, mix(INK.ink, INK.inkSoft, 0.35)), hullR = inkEl(g), band = inkEl(g, INK.red, { 'fill-opacity': 0.85 });
    const sup = inkEl(g, INK.paperLight), supR = inkEl(g), win = inkEl(g), fun = inkEl(g, INK.stain), funR = inkEl(g), funB = inkEl(g);
    return {
      g,
      update(t, x, y, s, rot, o = {}) {
        const R = R2(x, y, s, rot), k = sd * 11;
        const hp = [[-440, -78], [360, -84], [460, -120], [415, 28], [-395, 30], [-450, -20]];
        fill(hull, hp.map(R), k + 1, t); ring(hullR, hp.map(R), k + 2, t, 6);
        fill(band, [[-395, 30], [415, 28], [430, -4], [-425, 0]].map(R), k + 3, t, 0.8);
        const sp = [[-70, -82], [-62, -180], [96, -182], [104, -82]], sp2 = [[-260, -82], [-255, -122], [-170, -122], [-165, -82]], sp3 = [[200, -84], [204, -124], [290, -124], [292, -84]];
        sup.setAttribute('d', [sp, sp2, sp3].map((q, i) => inkLoop(q.map(R), { seed: k + 4 + i, t, smooth: false })).join(' '));
        supR.setAttribute('d', [sp, sp2, sp3].map((q, i) => inkPath(q.map(R), { w: 5, seed: k + 8 + i, t, closed: true, smooth: false })).join(' '));
        win.setAttribute('d', [-40, -5, 30, 65].map((wx, i) => inkLoop([[wx, -160], [wx + 20, -160], [wx + 20, -142], [wx, -142]].map(R), { seed: k + 12 + i, t, smooth: false, amp: 0.6 })).join(' '));
        const fp = [[0, -180], [6, -290], [62, -290], [66, -180]];
        fill(fun, fp.map(R), k + 20, t, 1, false); ring(funR, fp.map(R), k + 21, t, 5, 1, false);
        fill(funB, [[5, -290], [62, -290], [63, -262], [4, -262]].map(R), k + 22, t, 0.8, false);
        masts.setAttribute('d', [line([[-320, -82], [-320, -360]].map(R), k + 30, t, 6), line([[300, -84], [300, -350]].map(R), k + 31, t, 6),
          line([[-370, -300], [-270, -300]].map(R), k + 32, t, 4), line([[250, -290], [350, -290]].map(R), k + 33, t, 4),
          line([[-320, -360], [-440, -80]].map(R), k + 34, t, 2.5), line([[300, -350], [455, -118]].map(R), k + 35, t, 2.5)].join(' '));
        if (o.smoke !== false) {
          const S = [];
          for (let i = 0; i < 6; i++) { const u = ((t * 0.35 + i / 6) % 1), c = R([34 - u * 520, -310 - u * 120 - Math.sin(u * 6 + i) * 20]); S.push(inkLoop(ell(c[0], c[1], (30 + u * 70) * s, (22 + u * 45) * s, 10), { seed: k + 40 + i, t, amp: 1.5 })); }
          smoke.setAttribute('d', S.join(' '));
        } else smoke.setAttribute('d', '');
        return { R };
      },
    };
  }

  // ------------------------------------------------------------------ U-boat (side view, bow right), waterline y = 0
  function uboat(parent, sd) {
    const g = el(parent, 'g'), hull = inkEl(g, mix(INK.ink, INK.blue, 0.3)), hullR = inkEl(g), tw = inkEl(g, mix(INK.ink, INK.blue, 0.2)), twR = inkEl(g), det = inkEl(g);
    return {
      update(t, x, y, s) {
        const R = R2(x, y, s, Math.sin(t * 1.3 + sd) * 1.2), k = sd * 13;
        const hp = [[-300, -6], [260, -14], [320, 4], [250, 22], [-280, 18]];
        fill(hull, hp.map(R), k + 1, t); ring(hullR, hp.map(R), k + 2, t, 6);
        const tp = [[-60, -12], [-46, -120], [70, -122], [96, -12]];
        fill(tw, tp.map(R), k + 3, t, 1, false); ring(twR, tp.map(R), k + 4, t, 6, 1, false);
        det.setAttribute('d', [line([[10, -122], [10, -200], [24, -200]].map(R), k + 5, t, 5), line([[150, -14], [150, -40], [210, -46]].map(R), k + 6, t, 6),
          line([[-260, -8], [-120, -10]].map(R), k + 7, t, 3), line([[-30, -40], [70, -42]].map(R), k + 8, t, 3)].join(' '));
        return { bow: R([320, 8]) };
      },
    };
  }

  // ------------------------------------------------------------------ small fishing sailboat (bow left), waterline y = 0
  function sailboat(parent, sd) {
    const g = el(parent, 'g'), sail = inkEl(g, INK.paperLight), sailR = inkEl(g), crew = el(g, 'g'), hull = inkEl(g, INK.stain), hullR = inkEl(g), det = inkEl(g);
    return {
      crew,
      update(t, x, y, s, rock) {
        const R = R2(x, y, s, rock), k = sd * 17;
        const sp = [[-10, -60], [10, -560], [250, -90]];
        fill(sail, sp.map(R), k + 1, t); ring(sailR, sp.map(R), k + 2, t, 5);
        const hp = [[-300, -70], [290, -60], [250, 18], [-240, 20]];
        fill(hull, hp.map(R), k + 3, t); ring(hullR, hp.map(R), k + 4, t, 6);
        det.setAttribute('d', [line([[0, -60], [0, -580]].map(R), k + 5, t, 6), line([[-270, -30], [270, -22]].map(R), k + 6, t, 2.5)].join(' '));
        return { R };
      },
    };
  }

  // gull (side, wings flapping) path
  const gull = (x, y, s, flap, sd, t) => inkPath([[x - 40 * s, y + flap * s], [x - 16 * s, y - 12 * s], [x, y + 3 * s], [x + 16 * s, y - 12 * s], [x + 40 * s, y + flap * s]], { w: 5 * Math.max(0.7, s), seed: sd, t, amp: 0.6 });

  // shared: day counter (big Fraunces number in a card)
  function counter(parent, C, W, H, sd) {
    if (!C) return null;
    const g = el(parent, 'g'), card = inkEl(g, INK.paperLight), cardR = inkEl(g);
    const size = C.size || 110;
    const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink });
    return {
      update(lt, t, cues, dur) {
        const a = atOr(cues, C.at, 0.1), d = C.dur ?? 2, p = spring(lt, a - 0.2, 0.5), u = progIO(lt, a, d);
        const v = Math.round(lerp(C.from ?? 1, C.to ?? 133, u)), done = u >= 1, pk = punch(lt, a + d, 0.6);
        const x = (C.x ?? 0.74) * W, y = (C.y ?? 0.22) * H, w = size * 4.1, h = size * 1.4;
        g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(-2 + (1 - p) * 6)}) scale(${(lerp(0.5, 1, p) * (1 + 0.1 * pk)).toFixed(3)})`);
        const cp = [[-w / 2, -h / 2], [w / 2, -h / 2 - 5], [w / 2 + 4, h / 2], [-w / 2 - 3, h / 2 + 4]];
        card.setAttribute('fill', done ? INK.red : INK.paperLight);
        fill(card, cp, sd + 1, t, 1, false); ring(cardR, cp, sd + 2, t, 5, 1, false);
        tx.textContent = (C.prefix ?? 'DAY ') + v; tx.setAttribute('y', f1(size * 0.35));
        tx.setAttribute('fill', done ? INK.paperLight : INK.ink);
      },
    };
  }

  // ------------------------------------------------------------------ foreground layer for the lower frame (y > ~0.72 H)
  //   type "wave": a big dark swell with a foam crest rolling across; "fin": the swell plus a shark fin cutting through it
  function front(parent, F, sd) {
    if (!F) return null;
    const o = typeof F === 'string' ? { type: F } : F;
    const g = el(parent, 'g');
    const sw = inkEl(g, mix(INK.blue, INK.ink, 0.35)), swR = inkEl(g), foam = inkEl(g, INK.paperLight), lines = inkEl(g, INK.ink, { 'fill-opacity': 0.6 });
    const fin = inkEl(g, mix(INK.inkSoft, INK.ink, 0.4)), finR = inkEl(g), wake = inkEl(g, INK.paperLight);
    return {
      update(lt, t, W, H) {
        const y0 = (o.y ?? 0.76) * H, top = [];
        for (let i = 0; i <= 18; i++) { const x = -40 + i / 18 * (W + 80); top.push([x, y0 + Math.sin(x * 0.006 + t * 1.1 + sd) * 46 + Math.sin(x * 0.017 - t * 1.7) * 14]); }
        fill(sw, [...top, [W + 40, H + 40], [-40, H + 40]], sd + 1, t, 1, false);
        swR.setAttribute('d', inkPath(top, { w: 7, seed: sd + 2, t }));
        const FO = [], LN = [];
        for (let i = 0; i < 6; i++) { const k = i * 3 + 1, p = top[k], q = top[k + 1]; FO.push(inkLoop([[p[0], p[1] - 4], [lerp(p[0], q[0], 0.5), Math.min(p[1], q[1]) - 22], [q[0], q[1] - 2], [lerp(p[0], q[0], 0.5), Math.max(p[1], q[1]) + 8]], { seed: sd + 10 + i, t })); }
        for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = ((i + 0.5 * j) / 4 * (W + 200) + t * (30 + j * 8)) % (W + 200) - 100, y = y0 + 110 + j * 110; LN.push(inkPath([[x, y], [x + 60, y - 14], [x + 130, y]], { w: 4, seed: sd + 20 + j * 4 + i, t })); }
        foam.setAttribute('d', FO.join(' ')); lines.setAttribute('d', LN.join(' '));
        if (o.type === 'fin') {
          const u = ((lt * 0.22 + (o.phase ?? 0.1)) % 1), fx = lerp(-160, W + 160, u), fy = y0 + 90 + Math.sin(t * 1.4) * 8, sc = o.s ?? 1.3;
          const fp = [[fx - 60 * sc, fy], [fx + 20 * sc, fy - 150 * sc], [fx + 50 * sc, fy - 130 * sc], [fx + 70 * sc, fy]];
          fill(fin, fp, sd + 40, t, 1); ring(finR, fp, sd + 41, t, 6);
          wake.setAttribute('d', [0, 1, 2].map(i => inkLoop(ell(fx - (100 + i * 90) * sc, fy + 4, (60 - i * 14) * sc, 10, 8), { seed: sd + 42 + i, t })).join(' '));
        }
      },
    };
  }

  // ================================================================== pl_sea
  SH.pl_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 611, root = el(svg, 'g'), cam = el(root, 'g');
      const seaY = (P.sea ?? 0.62) * H;
      const farG = el(cam, 'g'), gullE = inkEl(farG);
      const ship = P.ship ? steamer(farG, sd + 10) : null;
      const sub = P.sub ? uboat(farG, sd + 12) : null;
      const farWater = window.TZ.water(el(cam, 'g'), sd + 15);
      const RA = P.raft === false ? null : Object.assign({ x: 0.62, y: P.sea ?? 0.62, s: 1, rock: 3 }, P.raft || {});
      const limG = el(cam, 'g');
      const raftO = RA ? raft(cam, sd + 20) : null;
      if (raftO) cam.insertBefore(raftO.g, limG);
      const lim = P.lim ? figure(limG, P.lim, sd + 30, false) : null;
      const swimG = el(cam, 'g'), swimHead = inkEl(swimG, INK.paperLight), swimR = inkEl(swimG), swimF = inkEl(swimG), swimHair = inkEl(swimG, INK.ink), swimArm = inkEl(swimG), splash = inkEl(swimG, INK.paperLight);
      const BO = P.boat ? Object.assign({ from: 1.3, to: 0.86, y: P.sea ?? 0.62, s: 0.8, at: 0, dur: 2.2, fishers: 3 }, P.boat) : null;
      const boatO = BO ? sailboat(cam, sd + 40) : null;
      const fishers = BO ? Array.from({ length: BO.fishers }, (_, i) => figure(boatO.crew, { scale: 0.5 * BO.s, pose: i === 1 ? 'point' : 'idle', face: 'left', dir: 10, beard: i === 0 ? 'black' : i === 2 ? 'short' : null,
        accessory: i === 1 ? 'slouch' : null, seq: BO.happy ? [{ at: BO.happy, pose: i === 1 ? 'point' : 'wave', emotion: i === 0 ? 'surprised' : 'happy' }] : [] }, sd + 50 + i * 7, false)) : null;
      const water = window.TZ.water(el(cam, 'g'), sd + 60);
      const shoutE = inkEl(cam);
      const KK = P.kasif ? Object.assign({ x: 0.22, y: 0.64, scale: 1, pose: 'look', face: 'right' }, P.kasif) : null;
      const barG = el(cam, 'g'), bar = inkEl(barG, INK.stain), barR = inkEl(barG), barH = inkEl(barG);
      const kas = KK ? figure(el(cam, 'g'), KK, sd + 80, true) : null;
      const near = window.TZ.water(el(cam, 'g'), sd + 90);
      const fr = front(el(cam, 'g'), P.front, sd + 95);
      const cnt = counter(el(root, 'g'), P.counter, W, H, sd + 100);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pk = punch(lt, atOr(cues, 'hit', null), 0.6), ro = P.rough ?? 1;
          cam.setAttribute('transform', `translate(${W / 2} ${seaY}) scale(${(1 + 0.05 * pk).toFixed(3)}) translate(${-W / 2} ${-seaY})`);
          // gulls
          const GN = P.gulls ?? 3, GS = [];
          for (let i = 0; i < GN; i++) { const x = ((0.15 + i * 0.27) * W + lt * (26 + i * 9)) % (W + 120) - 60, y = H * (0.2 + (i % 2) * 0.06) + Math.sin(lt * 2 + i) * 10;
            GS.push(gull(x, y, 0.8 + (i % 2) * 0.3, Math.sin(lt * 7 + i * 2) * 14, sd + 3 + i, t)); }
          gullE.setAttribute('d', GS.join(' '));
          if (ship) {
            const S = Object.assign({ from: -0.2, to: 1.25, y: 0.36, s: 0.35, at: 0, dur: dur }, P.ship), a = atOr(cues, S.at, 0);
            const u = lin(lt, a, S.dur ?? Math.max(1, dur - a));
            ship.update(t, lerp(S.from, S.to, u) * W, S.y * H + Math.sin(t * 1.2) * 3, S.s, Math.sin(t * 0.9) * 1.2);
          }
          if (sub) {   // a U-boat surfaces on the horizon (sub.at) and dives away again (sub.gone)
            const B = Object.assign({ x: 0.8, y: P.ship ? P.ship.y ?? 0.36 : 0.36, s: 0.35 }, P.sub), a = atOr(cues, B.at, 0.5), gz = atOr(cues, B.gone, 99);
            const up = progIO(lt, a - 0.3, 0.6) * (1 - progIO(lt, gz, 0.9));
            sub.update(t, B.x * W - (lt > gz ? (lt - gz) * 60 : 0), B.y * H + (1 - up) * 140 * B.s, B.s);
          }
          farWater.update(t, W, H, (P.ship ? P.ship.y ?? 0.36 : 0.4) * H + 6, { rough: 0.5 * ro, dark: !!P.dark });
          let deck = null;
          if (raftO) {
            const bob = Math.sin(t * 1.7) * 8 * ro, rk = Math.sin(t * 1.3 + 0.5) * (RA.rock ?? 3) * ro;
            const r = raftO.update(t, RA.x * W, RA.y * H + bob, RA.s, rk, { keg: RA.keg, tins: RA.tins });
            deck = r.deck;
          }
          // swimmer: head + stroking arm moving to the raft
          let swimming = false;
          if (P.swim) {
            const SW = Object.assign({ from: 0.12, dur: 2.2 }, P.swim), a = atOr(cues, SW.at, 0.1), u = progIO(lt, a, SW.dur);
            const tx = RA ? (RA.x - 0.2 * RA.s) : 0.5, x = lerp(SW.from, tx, u) * W, y = (SW.y ?? (RA ? RA.y : 0.62)) * H + 6 + Math.sin(t * 3) * 5, s = SW.s ?? 1;
            swimming = true;
            const hp = ell(x, y - 38 * s, 40 * s, 44 * s, 12);
            fill(swimHead, hp, sd + 300, t); ring(swimR, hp, sd + 301, t, 5);
            fill(swimHair, [[x - 41 * s, y - 34 * s], [x - 38 * s, y - 62 * s], [x - 20 * s, y - 80 * s], [x + 6 * s, y - 84 * s], [x + 30 * s, y - 74 * s], [x + 40 * s, y - 58 * s], [x + 14 * s, y - 64 * s], [x - 16 * s, y - 58 * s], [x - 30 * s, y - 40 * s]], sd + 302, t, 0.8);
            swimF.setAttribute('d', inkDot(x + 12 * s, y - 40 * s, 4.5 * s, 5.5 * s, sd + 303, t) + ' ' + inkDot(x + 30 * s, y - 40 * s, 4.5 * s, 5.5 * s, sd + 304, t) +
              ' ' + line([[x + 2 * s, y - 56 * s], [x + 18 * s, y - 52 * s]], sd + 305, t, 3) + ' ' + line([[x + 24 * s, y - 52 * s], [x + 40 * s, y - 57 * s]], sd + 306, t, 3));
            const ph = u < 1 ? lt * 3.2 : 0.25, ang = ph * Math.PI * 2, sh = [x + 10 * s, y - 6 * s];
            const reach = u >= 1 && deck ? [deck[0] - 120 * RA.s, deck[1] + 4] : [sh[0] + Math.cos(ang) * 110 * s, sh[1] - Math.abs(Math.sin(ang)) * 120 * s];
            swimArm.setAttribute('d', line([sh, [lerp(sh[0], reach[0], 0.5), Math.min(sh[1], reach[1]) - 30 * s], reach], sd + 307, t, 7) + ' ' + inkDot(reach[0], reach[1], 10 * s, 10 * s, sd + 308, t));
            splash.setAttribute('d', u < 1 ? [0, 1, 2].map(i => inkLoop(ell(x - (60 + i * 70) * s, y + 4, (34 - i * 8) * s, 9 * s, 8), { seed: sd + 310 + i, t })).join(' ') : '');
          }
          if (lim && deck && !swimming) lim.update(lt, t, cues, deck[0], deck[1]);
          if (lim && swimming) limG.setAttribute('opacity', 0);
          // shout arcs from the hero's head
          if (P.shout && lim && deck) {
            const a = atOr(cues, P.shout.at, 0.3), d = P.shout.dur ?? 1.6, S = [];
            for (let i = 0; i < 3; i++) { const u = ((lt - a) / 0.6 + i / 3) % 1; if (lt < a || lt > a + d) continue;
              const cx = deck[0] - 70, cy = deck[1] - 270 * (P.lim.scale ?? 0.5) / 0.5, r = 40 + u * 90;
              S.push(line([[cx - r * 0.5, cy - r * 0.9], [cx - r * 0.95, cy], [cx - r * 0.5, cy + r * 0.9]], sd + 320 + i, t, 5)); }
            shoutE.setAttribute('d', S.join(' '));
          }
          if (boatO) {
            const a = atOr(cues, BO.at, 0), u = progIO(lt, a, BO.dur), bx = lerp(BO.from, BO.to, u) * W, by = BO.y * H + Math.sin(t * 1.6 + 1) * 7;
            const b = boatO.update(t, bx, by, BO.s, Math.sin(t * 1.2) * 2.5);
            fishers.forEach((f, i) => { const p = b.R([-210 + i * 150, -64]); f.update(lt, t, cues, p[0], p[1]); });
          }
          water.update(t, W, H, seaY + 10, { rough: ro, dark: !!P.dark });
          if (kas) {
            const by = KK.y * H + Math.sin(t * 1.9 + 2) * 6, bx = KK.x * W, s = KK.scale;
            kas.update(lt, t, cues, bx, by);
            if (KK.barrel !== false) {
              const bp = [[bx - 95 * s, by], [bx - 105 * s, by + 120 * s], [bx - 88 * s, by + 220 * s], [bx + 88 * s, by + 220 * s], [bx + 105 * s, by + 120 * s], [bx + 95 * s, by]];
              fill(bar, bp, sd + 400, t); ring(barR, bp, sd + 401, t, 6);
              barH.setAttribute('d', [40, 110, 180].map((dy, i) => line([[bx - (98 + (i === 1 ? 7 : 0)) * s, by + dy * s], [bx + (98 + (i === 1 ? 7 : 0)) * s, by + dy * s]], sd + 402 + i, t, 4)).join(' ') +
                ' ' + inkLoop(ell(bx, by, 95 * s, 16 * s, 12), { seed: sd + 406, t }));
            }
          }
          near.update(t, W, H, Math.max(seaY + 10, KK && KK.barrel !== false ? KK.y * H + 130 * KK.scale : seaY + 160), { rough: 1.3 * ro, dark: !!P.dark });
          if (fr) fr.update(lt, t, W, H);
          if (cnt) cnt.update(lt, t, cues, dur);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pl_sink
  SH.pl_sink = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 711, root = el(svg, 'g'), cam = el(root, 'g');
      const seaY = (P.sea ?? 0.6) * H;
      const cid = 'plclip' + seed + '_' + Math.floor(sd);
      const cp = el(defs || svg, 'clipPath', { id: cid }); const cr = el(cp, 'rect', { x: -400, y: -400, width: W + 800, height: seaY + 420 });
      const smokeE = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.45 });
      const shipG = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const shipO = steamer(shipG, sd + 10);
      const water = window.TZ.water(el(cam, 'g'), sd + 20);
      const uG = el(cam, 'g'), ub = uboat(uG, sd + 30);
      const track = inkEl(cam, INK.paperLight), trackR = inkEl(cam, INK.inkSoft);
      const boom = inkEl(cam, INK.gold), boomR = inkEl(cam, INK.red), col = inkEl(cam, INK.paperLight), colR = inkEl(cam);
      const near = window.TZ.water(el(cam, 'g'), sd + 40);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const S = Object.assign({ x: 0.62, s: 0.95 }, P.ship || {}), U = Object.assign({ x: 0.13, s: 0.55 }, P.uboat || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ta = atOr(cues, P.torpedo ?? 'torpedo', 0.3), ha = Math.max(ta + 0.6, atOr(cues, P.hit ?? 'hit', ta + 1.2));
          const pk = punch(lt, ha, 0.7), shake = pk * 12;
          cam.setAttribute('transform', `translate(${f1(Math.sin(lt * 61) * shake)} ${f1(Math.cos(lt * 47) * shake)})`);
          const sinkD = P.sink_dur ?? Math.max(1.5, dur - ha), su = progIO(lt, ha + 0.25, sinkD);
          const sx = S.x * W, sy = seaY + 6 + Math.sin(t * 1.1) * 4 + su * 420 * S.s, rot = -su * 16 + Math.sin(t * 0.9) * 1;
          shipO.update(t, sx, sy, S.s, rot, { smoke: true });
          // fire smoke after the hit
          const SM = [];
          if (lt > ha) for (let i = 0; i < 7; i++) { const u = ((lt - ha) * 0.45 + i / 7) % 1; SM.push(inkLoop(ell(sx - 120 * S.s - u * 260, seaY - 120 - u * 520, 50 + u * 110, 36 + u * 70, 10), { seed: sd + 50 + i, t, amp: 2 })); }
          smokeE.setAttribute('d', SM.join(' '));
          water.update(t, W, H, seaY, { rough: 0.8 });
          const bow = ub.update(t, U.x * W, seaY + 40, U.s).bow;
          // torpedo track: bubbles from the U-boat bow to the hull
          const tu = lin(lt, ta, ha - ta), hx = sx - 200 * S.s, hy = seaY + 70;
          const B = [];
          if (lt >= ta) for (let i = 0; i < 16; i++) { const v = i / 16; if (v > tu) break; const x = lerp(bow[0], hx, v), y = lerp(bow[1] + 30, hy, v) + Math.sin(v * 20 + t * 6) * 4;
            const fade = lt > ha ? clamp01(1 - (lt - ha) / 1.2) : 1; if (fade <= 0) break; B.push(inkLoop(ell(x, y, (7 + (i % 3) * 3) * fade, (5 + (i % 2) * 2) * fade, 7), { seed: sd + 60 + i, t, amp: 0.6 })); }
          track.setAttribute('d', B.join(' ')); trackR.setAttribute('d', lt >= ta && tu < 1 ? line([[lerp(bow[0], hx, tu) - 40, lerp(bow[1] + 30, hy, tu)], [lerp(bow[0], hx, tu), lerp(bow[1] + 30, hy, tu)]], sd + 80, t, 10) : '');
          // explosion + water column
          if (lt >= ha && lt < ha + 1.6) {
            const u = (lt - ha) / 1.6, r = lerp(60, 260, Math.min(1, u * 2.5)), cx = hx, cy = seaY - 20, star = [];
            for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, rr = i % 2 ? r : r * 0.5; star.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9]); }
            boom.setAttribute('fill-opacity', (1 - u).toFixed(3)); boomR.setAttribute('fill-opacity', (1 - u).toFixed(3));
            fill(boom, star, sd + 90, t, 2, false); ring(boomR, star, sd + 91, t, 6, 2, false);
            const ch = 340 * Math.sin(Math.min(1, u * 1.4) * Math.PI);
            const cpts = [[cx - 70, seaY + 10], [cx - 50, seaY - ch * 0.5], [cx - 64, seaY - ch * 0.8], [cx - 20, seaY - ch * 0.7], [cx - 6, seaY - ch], [cx + 18, seaY - ch * 0.72], [cx + 56, seaY - ch * 0.86], [cx + 44, seaY - ch * 0.45], [cx + 74, seaY + 10]];
            fill(col, cpts, sd + 92, t, 2, false); ring(colR, cpts, sd + 93, t, 4, 2, false);
          } else { boom.setAttribute('d', ''); boomR.setAttribute('d', ''); col.setAttribute('d', ''); colR.setAttribute('d', ''); }
          near.update(t, W, H, seaY + 260, { rough: 1.4 });
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pl_hook
  SH.pl_hook = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, root = el(svg, 'g'), cam = el(root, 'g');
      const edge = (P.edge ?? 0.2) * H, N = Object.assign({ x: 0.5, y: 0.42 }, P.nail || {});
      const water = window.TZ.water(el(cam, 'g'), sd + 5);
      const planks = Array.from({ length: 5 }, (_, i) => ({ f: inkEl(cam, i % 2 ? mix(INK.paperDark, INK.stain, 0.55) : mix(INK.paperDark, INK.stain, 0.3)), r: inkEl(cam), gr: inkEl(cam, INK.inkSoft) }));
      const holes = inkEl(cam, INK.ink);
      const tinG = el(cam, 'g'), tin = inkEl(tinG, INK.paperLight), tinR = inkEl(tinG), tinL = inkEl(tinG);
      const keg = inkEl(cam, INK.stain), kegR = inkEl(cam);
      const armL = inkEl(cam, mix(INK.blue, INK.paperLight, 0.35)), armLR = inkEl(cam), handL = inkEl(cam, INK.paperLight), handLR = inkEl(cam);
      const nail = inkEl(cam, mix(INK.ink, INK.inkSoft, 0.45)), nailR = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.6 }), rust = inkEl(cam, INK.red, { 'fill-opacity': 0.5 });
      const armR = inkEl(cam, mix(INK.blue, INK.paperLight, 0.35)), armRR = inkEl(cam), handR = inkEl(cam, INK.paperLight), handRR = inkEl(cam);
      const glint = inkEl(cam, INK.gold), glintR = inkEl(cam);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      // a mitten hand: palm ellipse + thumb + finger lines, rotated
      const hand = (fE, rE, x, y, s, rot, k, t, grip) => {
        const R = R2(x, y, s, rot), pts = [[-48, -40], [-10, -62], [36, -56], [56, -20], [50, 30], [10, 52], [-40, 40], [-58, 0]].map(R);
        const th = [[-50, -10], [-92, -40], [-96, -66], [-70, -60], [-40, -36]].map(R);
        fE.setAttribute('d', inkLoop(pts, { seed: k, t }) + ' ' + inkLoop(th, { seed: k + 1, t }));
        rE.setAttribute('d', inkPath(pts, { w: 5, seed: k + 2, t, closed: true }) + ' ' + inkPath(th, { w: 4.5, seed: k + 3, t }) +
          [0, 1, 2].map(i => ' ' + inkPath([[-20 + i * 22, -50 + grip * 20], [-14 + i * 22, -20]].map(R), { w: 3, seed: k + 4 + i, t })).join(''));
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ea = atOr(cues, P.empty ?? 'empty', 0.2), pa = P.pull === false ? 99 : atOr(cues, P.pull ?? 'pull', dur * 0.3), ba = P.pull === false ? 99 : Math.max(pa + 0.6, atOr(cues, P.bend ?? 'bend', dur * 0.65));
          const pk = punch(lt, ba, 0.6) + punch(lt, P.pull === false ? ea : null, 0.6);
          water.update(t, W, H, -60, { rough: 0.7 });
          const pw = W / 5;
          planks.forEach((p, i) => {
            const x0 = i * pw - 4, x1 = (i + 1) * pw - 8, pts = [[x0, edge + (i % 2) * 12], [x1, edge + ((i + 1) % 2) * 10], [x1, H + 20], [x0, H + 20]];
            fill(p.f, pts, sd + 10 + i, t, 1, false); ring(p.r, pts, sd + 20 + i, t, 6, 1, false);
            const G = [];
            for (let j = 0; j < 3; j++) { const gx = x0 + pw * (0.25 + j * 0.25); G.push(line([[gx, edge + 60 + j * 90], [gx + 10 * Math.sin(j + i), H * 0.5], [gx - 8, H + 10]], sd + 30 + i * 5 + j, t, 2.5, 1.2)); }
            G.push(inkPath(inkEllipsePts(x0 + pw * 0.6, edge + 380 + i * 130, 26, 12, sd + 60 + i, 9), { w: 2.5, seed: sd + 61 + i, t, closed: true }));
            p.gr.setAttribute('d', G.join(' '));
          });
          // other nail heads on the cross plank lines
          holes.setAttribute('d', [0, 1, 2, 3, 4].map(i => inkDot(i * pw + pw * 0.5, edge + 70, 9, 9, sd + 70 + i, t) + ' ' + inkDot(i * pw + pw * 0.5, H * 0.86, 9, 9, sd + 75 + i, t)).join(' '));
          // empty tin tips over
          const eu = progIO(lt, ea, 0.6), tx = W * 0.82, ty = edge + 150, R = R2(tx, ty, 1, eu * 82);
          tinG.setAttribute('opacity', P.tin === false ? 0 : 1);
          const tp = [[-50, 70], [-50, -70], [50, -70], [50, 70]].map(R);
          fill(tin, tp, sd + 80, t, 1, false); ring(tinR, tp, sd + 81, t, 5, 1, false);
          tinL.setAttribute('d', inkPath([[-50, -40], [50, -40]].map(R), { w: 3, seed: sd + 82, t }) + ' ' + inkPath([[-50, -70], [-20, -110], [40, -96]].map(R), { w: 4, seed: sd + 83, t }));
          const kp = [[W * 0.06, edge + 40], [W * 0.05, edge + 230], [W * 0.25, edge + 236], [W * 0.26, edge + 40]];
          fill(keg, kp, sd + 84, t); ring(kegR, kp, sd + 85, t, 5);
          // nail: rises out of the plank on pull, moves up to the middle, bends on bend
          const nx0 = N.x * W, ny0 = N.y * H, len = 380;
          const noHands = P.pull === false, up = noHands ? 0 : progIO(lt, pa, 0.8), mv = noHands ? 0 : progIO(lt, pa + 0.9, 0.5), bend = noHands ? 0 : progIO(lt, ba, 0.7);
          const cx = nx0, headY = lerp(ny0, ny0 - len * 0.75, up) + mv * -40 + Math.sin(t * 2) * 3;
          // shaft points from head (top) down; the lower part curls up into a J as bend grows
          const SP = [];
          for (let i = 0; i <= 12; i++) {
            const u = i / 12, L = u * len;
            if (u < 0.5 || bend <= 0) SP.push([cx, headY + L]);
            else { const rr = 85, a = (L - len * 0.5) / rr * bend; const bx = cx, by = headY + len * 0.5; SP.push([bx + rr * (1 - Math.cos(a)) * 1, by + rr * Math.sin(a) + (L - len * 0.5) * (1 - bend)]); }
          }
          const visible = SP.filter(p => p[1] <= ny0 + 4 || up >= 0.99);
          const shaft = visible.length > 1 ? visible : [[cx, headY], [cx, headY + 2]];
          nail.setAttribute('d', inkPath(shaft, { w: 32, seed: sd + 90, t, amp: 0.6, taper: 0.15 }) + ' ' + inkLoop(ell(cx, headY - 6, 52, 17, 12), { seed: sd + 91, t, amp: 0.5 }));
          nailR.setAttribute('d', inkPath(shaft.map(p => [p[0] - 7, p[1]]), { w: 4, seed: sd + 92, t, amp: 0.5 }) + ' ' + inkPath(ell(cx, headY - 6, 52, 17, 12), { w: 4.5, seed: sd + 93, t, closed: true, amp: 0.5 }));
          // barb + sharpened tip appear while bending
          const tip = shaft[shaft.length - 1];
          rust.setAttribute('d', [0.25, 0.4].map((v, i) => inkDot(cx + 2, headY + len * v, 7, 9, sd + 95 + i, t)).join(' ') +
            (bend > 0.6 ? ' ' + inkLoop([[tip[0], tip[1]], [tip[0] - 40 * bend, tip[1] + 50 * bend], [tip[0] - 6, tip[1] + 12]], { seed: sd + 97, t, smooth: false }) : ''));
          // hands: right hand grips the head and pulls; left hand comes in to bend
          const hR = [cx + 70, headY + 40], gp = lt >= pa - 0.3 ? 1 : 0;
          const enterR = spring(lt, Math.max(0, pa - 0.8), 0.6);
          const hRx = lerp(W + 200, hR[0], enterR), hRy = lerp(hR[1] + 300, hR[1], enterR);
          hand(handR, handRR, hRx, hRy, 1.25, -70, sd + 100, t, gp);
          if (noHands) [handR, handRR].forEach(e => e.setAttribute('d', ''));
          const sleeve = (fE, rE, from, to, k) => { const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * 40, ny = dx / L * 40;
            const pts = [[from[0] + nx, from[1] + ny], [to[0] + nx * 0.8, to[1] + ny * 0.8], [to[0] - nx * 0.8, to[1] - ny * 0.8], [from[0] - nx, from[1] - ny]];
            fill(fE, pts, k, t, 1, false); ring(rE, pts, k + 1, t, 5, 1, false); };
          if (!noHands) sleeve(armR, armRR, [W + 160, hRy + 320], [hRx + 50, hRy + 50], sd + 110);
          const enterL = spring(lt, ba - 0.7, 0.6), hL = [cx - 90 + bend * 40, headY + len * 0.75];
          const hLx = lerp(-200, hL[0], enterL), hLy = lerp(hL[1] + 300, hL[1], enterL);
          if (!noHands) { hand(handL, handLR, hLx, hLy, 1.2, 60 - bend * 30, sd + 120, t, 1); sleeve(armL, armLR, [-160, hLy + 300], [hLx - 50, hLy + 50], sd + 130); }
          // glint on the finished hook
          if (lt > ba + 0.5) {
            const u = ((lt - ba - 0.5) % 1.2) / 1.2, s = Math.sin(u * Math.PI) * (1 + pk), gx = tip[0] + 24, gy = tip[1] - 30, st = [];
            for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = (i % 2 ? 50 : 14) * s; st.push([gx + Math.cos(a) * r, gy + Math.sin(a) * r]); }
            fill(glint, st, sd + 140, t, 0.6, false); ring(glintR, st, sd + 141, t, 3, 0.6, false);
          } else { glint.setAttribute('d', ''); glintR.setAttribute('d', ''); }
          cam.setAttribute('transform', `translate(${cx} ${ny0}) scale(${(1 + 0.06 * pk).toFixed(3)}) translate(${-cx} ${-ny0})`);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pl_catch
  SH.pl_catch = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 911, root = el(svg, 'g'), cam = el(root, 'g');
      const seaY = (P.sea ?? 0.34) * H;
      const RA = Object.assign({ x: 0.36, s: 1 }, P.raft || {});
      const limG = el(cam, 'g'), raftO = raft(cam, sd + 10);
      cam.insertBefore(raftO.g, limG);
      const lim = figure(limG, Object.assign({ scale: 0.5, pose: 'point', dir: -38, face: 'right' }, P.lim || {}), sd + 20, false);
      const gullE = inkEl(cam, INK.paperLight), gullR = inkEl(cam), gullB = inkEl(cam, INK.gold);
      const deep = inkEl(cam, INK.blue, { 'fill-opacity': 0.42 }), deep2 = inkEl(cam, INK.blue, { 'fill-opacity': 0.3 }), hatch = inkEl(cam, INK.inkSoft), surf = inkEl(cam);
      const weeds = inkEl(cam, INK.green, { 'fill-opacity': 0.7 }), weedsR = inkEl(cam);
      const lineE = inkEl(cam, INK.ink), hookE = inkEl(cam, INK.inkSoft);
      const fishes = [0, 1, 2, 3].map(() => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam), e: inkEl(cam) }));
      const shark = { f: inkEl(cam, mix(INK.inkSoft, INK.blue, 0.35)), b: inkEl(cam, INK.paperLight), r: inkEl(cam), e: inkEl(cam) };
      const school = inkEl(cam, mix(INK.blue, INK.ink, 0.45), { 'fill-opacity': 0.75 });
      const bub = inkEl(cam, INK.paperLight), bubR = inkEl(cam);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const fa = atOr(cues, P.fish ?? 'fish', dur * 0.3), ga = atOr(cues, P.bird ?? 'bird', dur * 0.5), sa = atOr(cues, P.shark ?? 'shark', dur * 0.7);
          const pk = punch(lt, sa, 0.7);
          cam.setAttribute('transform', `translate(${W / 2} ${H * 0.6}) scale(${(1 + 0.05 * pk).toFixed(3)}) translate(${-W / 2} ${-H * 0.6})`);
          const bob = Math.sin(t * 1.7) * 6, rk = Math.sin(t * 1.3) * 2.5;
          const r = raftO.update(t, RA.x * W, seaY + bob, RA.s, rk, { keg: false });
          const pull = lt > fa ? Math.sin(Math.min(1, (lt - fa) / 0.6) * Math.PI) : 0;
          const L = lim.update(lt, t, cues, r.deck[0] + 60, r.deck[1]);
          // underwater body + surface line
          const top = [];
          for (let i = 0; i <= 20; i++) { const x = -20 + i / 20 * (W + 40); top.push([x, seaY + 6 + Math.sin(x * 0.014 + t * 1.6) * 8]); }
          deep.setAttribute('d', inkLoop([...top, [W + 20, H + 20], [-20, H + 20]], { seed: sd + 30, t, amp: 1, smooth: false }));
          deep2.setAttribute('d', inkLoop([[-20, H * 0.72], [W * 0.5, H * 0.7], [W + 20, H * 0.73], [W + 20, H + 20], [-20, H + 20]], { seed: sd + 31, t }));
          surf.setAttribute('d', inkPath(top, { w: 5, seed: sd + 32, t }));
          const HT = [];
          for (let j = 0; j < 7; j++) { const yy = seaY + 120 + j * 170; for (let i = 0; i < 4; i++) { const x = ((i + 0.3 * j) / 4 * (W + 200) + t * 18) % (W + 200) - 100; HT.push(line([[x, yy], [x + 40, yy - 6], [x + 80, yy]], sd + 40 + j * 5 + i, t, 2.2)); } }
          hatch.setAttribute('d', HT.join(' '));
          // seaweed hanging under the raft (floating weed patch)
          const WP = [];
          for (let i = 0; i < 5; i++) { const x = RA.x * W - 140 + i * 60, sway = Math.sin(t * 1.5 + i) * 18; WP.push([[x, seaY + 20], [x + sway, seaY + 110 + (i % 2) * 40], [x + 14 + sway * 1.3, seaY + 190 + (i % 3) * 30], [x + 18, seaY + 20]]); }
          weeds.setAttribute('d', WP.map((p, i) => inkLoop(p, { seed: sd + 60 + i, t })).join(' ')); weedsR.setAttribute('d', WP.map((p, i) => inkPath(p, { w: 3, seed: sd + 66 + i, t, closed: true })).join(' '));
          // the line from his hand down to the hook
          const hx = W * 0.62 + Math.sin(t * 1.1) * 14, hy = H * (P.hook_y ?? 0.47) - pull * 90;
          lineE.setAttribute('d', line([L.hand, [lerp(L.hand[0], hx, 0.6), seaY + 30], [hx, hy]], sd + 70, t, 3.5, 0.6));
          hookE.setAttribute('d', inkPath([[hx, hy], [hx, hy + 40], [hx - 6, hy + 62], [hx - 26, hy + 64], [hx - 34, hy + 46]], { w: 7, seed: sd + 71, t, amp: 0.4 }));
          // fish: circle around, one bites at fa and is pulled up
          fishes.forEach((F, i) => {
            const bite = i === 0;
            let x, y, face, s = i === 0 ? 1.1 : 0.75 + (i % 2) * 0.15;
            if (bite && lt > fa - 0.8) { const u = clamp01((lt - fa + 0.8) / 0.8); x = lerp(W * 0.2, hx - 30, u); y = lerp(H * 0.52, hy + 70, u); face = 1; if (lt > fa) { x = hx - 30 + Math.sin(t * 20) * 8; y = hy + 70; } }
            else { const ph = t * (0.25 + i * 0.05) + i * 1.7; x = W * (0.5 + 0.38 * Math.sin(ph)); y = H * (0.43 + 0.03 * i) + Math.sin(ph * 2) * 24; face = Math.cos(ph) > 0 ? 1 : -1; }
            const R = R2(x, y, s * face, 0), Rf = p => { const q = R([p[0] * 1, p[1]]); return q; };
            const body = [[-70, 0], [-30, -32], [30, -30], [70, 0], [30, 30], [-30, 30]].map(p => [x + p[0] * s * face, y + p[1] * s]);
            const tail = [[-66, 0], [-110, -34], [-100, 0], [-110, 34]].map(p => [x + p[0] * s * face, y + p[1] * s]);
            F.f.setAttribute('d', inkLoop(body, { seed: sd + 80 + i, t }) + ' ' + inkLoop(tail, { seed: sd + 85 + i, t, smooth: false }));
            F.r.setAttribute('d', inkPath(body, { w: 4.5, seed: sd + 90 + i, t, closed: true }) + ' ' + inkPath(tail, { w: 4, seed: sd + 95 + i, t, closed: true, smooth: false }) +
              ' ' + inkPath([[x + 30 * s * face, y - 26 * s], [x + 22 * s * face, y + 24 * s]], { w: 3, seed: sd + 99 + i, t }));
            F.e.setAttribute('d', inkDot(x + 46 * s * face, y - 6 * s, 5, 5, sd + 104 + i, t));
            void Rf;
          });
          // gull: flies in and lands on the raft corner at ga
          const gu = progIO(lt, ga - 0.9, 0.9), gx = lerp(W + 80, RA.x * W - 110, gu), gy = lerp(H * 0.1, seaY - 80 + bob, gu), fl = gu < 1 ? Math.sin(lt * 9) * 30 : -8;
          const gb = [[gx - 40, gy], [gx - 10, gy - 30], [gx + 30, gy - 24], [gx + 50, gy - 6], [gx + 20, gy + 20], [gx - 30, gy + 14]];
          gullE.setAttribute('d', inkLoop(gb, { seed: sd + 110, t }) + ' ' + inkLoop(ell(gx + 40, gy - 32, 20, 18, 10), { seed: sd + 111, t }));
          gullR.setAttribute('d', inkPath(gb, { w: 4.5, seed: sd + 112, t, closed: true }) + ' ' + inkPath(ell(gx + 40, gy - 32, 20, 18, 10), { w: 4, seed: sd + 113, t, closed: true }) +
            ' ' + line([[gx - 20, gy - 6], [gx - 60, gy - 40 - fl], [gx - 100, gy - 20 - fl * 1.4]], sd + 114, t, 5) + ' ' + inkDot(gx + 46, gy - 36, 3.5, 3.5, sd + 115, t) +
            (gu >= 1 ? ' ' + line([[gx - 6, gy + 18], [gx - 8, gy + 44]], sd + 116, t, 3.5) + ' ' + line([[gx + 14, gy + 18], [gx + 16, gy + 44]], sd + 117, t, 3.5) : ''));
          gullB.setAttribute('d', inkLoop([[gx + 56, gy - 36], [gx + 82, gy - 30], [gx + 56, gy - 26]], { seed: sd + 118, t, smooth: false }));
          // shark: glides in from the right, big, at the bottom
          const su = progIO(lt, sa - 0.7, 1.0), shx = lerp(W + 520, W * (P.shark_x ?? 0.45), su) + Math.sin(t * 1.2) * 10, shy = H * (P.shark_y ?? 0.56) + Math.sin(t * 1.6) * 8, s = P.shark_s ?? 1.1;
          const sb = [[-330, 10], [-180, -40], [40, -70], [200, -50], [300, -10], [310, 10], [220, 40], [40, 60], [-200, 40]].map(p => [shx + p[0] * s * -1, shy + p[1] * s]);
          const fin = [[60, -66], [-10, -170], [-50, -60]].map(p => [shx + p[0] * s * -1, shy + p[1] * s]);
          const tl = [[-310, 8], [-420, -90], [-380, 10], [-420, 90]].map(p => [shx + p[0] * s * -1, shy + p[1] * s]);
          const belly = [[-200, 34], [40, 54], [220, 36], [300, 12], [200, 20], [40, 30]].map(p => [shx + p[0] * s * -1, shy + p[1] * s]);
          shark.f.setAttribute('d', inkLoop(sb, { seed: sd + 120, t }) + ' ' + inkLoop(fin, { seed: sd + 121, t, smooth: false }) + ' ' + inkLoop(tl, { seed: sd + 122, t, smooth: false }));
          shark.b.setAttribute('d', inkLoop(belly, { seed: sd + 123, t }));
          shark.r.setAttribute('d', inkPath(sb, { w: 6, seed: sd + 124, t, closed: true }) + ' ' + inkPath(fin, { w: 5, seed: sd + 125, t, closed: true, smooth: false }) + ' ' + inkPath(tl, { w: 5, seed: sd + 126, t, closed: true, smooth: false }) +
            [0, 1, 2].map(i => ' ' + inkPath([[shx - (150 + i * 22) * s, shy - 30 * s], [shx - (140 + i * 22) * s, shy + 14 * s]], { w: 3, seed: sd + 127 + i, t })).join('') +
            ' ' + inkPath([[shx - 250 * s, shy + 18 * s], [shx - 290 * s, shy + 26 * s]], { w: 4, seed: sd + 131, t }));
          shark.e.setAttribute('d', inkDot(shx - 240 * s, shy - 8 * s, 7, 7, sd + 132, t));
          // a school of small fish drifting in the deep (fills the lower frame)
          const SC = [];
          for (let i = 0; i < 26; i++) { const row = i % 4, x = ((i * 137) % (W + 200)) - 100 + lt * (40 + row * 8) + Math.sin(t * 1.3 + i) * 10, xx = ((x % (W + 200)) + W + 200) % (W + 200) - 100, y = H * (0.72 + row * 0.055) + Math.sin(t + i) * 10, s2 = 0.9 + (i % 3) * 0.25;
            SC.push(inkLoop([[xx - 30 * s2, y], [xx, y - 10 * s2], [xx + 26 * s2, y], [xx, y + 10 * s2]], { seed: sd + 150 + i, t, amp: 0.6 }) + ' ' + inkLoop([[xx - 26 * s2, y], [xx - 44 * s2, y - 10 * s2], [xx - 44 * s2, y + 10 * s2]], { seed: sd + 190 + i, t, amp: 0.6, smooth: false })); }
          school.setAttribute('d', SC.join(' '));
          // bubbles
          const BB = [];
          for (let i = 0; i < 8; i++) { const u = ((t * 0.3 + i / 8) % 1), x = W * (0.12 + (i * 0.37) % 0.8) + Math.sin(u * 8 + i) * 12, y = lerp(H * 0.95, seaY + 40, u); BB.push(inkCircle(x, y, 8 + (i % 3) * 4, sd + 140 + i, t, { w: 3 })); }
          bubR.setAttribute('d', BB.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pl_uboat
  // SHOTS.pl_uboat — a U-boat surfaces close to the raft (cue "surface": it rises out of the water, a lookout on the
  //   conning tower turns to the raft), then leaves (cue "gone": it sails off to the right and dives). Hero on the raft.
  //   P: {sea: 0.52, raft: {x: 0.3, y: 0.52, s: 1.2}, lim: K, uboat: {x: 0.68, y: 0.5, s: 0.85}, surface, gone,
  //       front: "wave"|"fin"|false, labels: [L]}   cues: surface, gone, hit (punch)
  SH.pl_uboat = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 1211, root = el(svg, 'g');
      const seaY = (P.sea ?? 0.52) * H, U = Object.assign({ x: 0.68, y: P.sea ?? 0.52, s: 0.85 }, P.uboat || {});
      const farWater = window.TZ.water(el(root, 'g'), sd + 3);
      const cid = 'plub' + seed + '_' + Math.floor(sd);
      const cp = el(defs || svg, 'clipPath', { id: cid }); el(cp, 'rect', { x: -400, y: -600, width: W + 800, height: U.y * H + 620 });
      const subG = el(root, 'g', { 'clip-path': `url(#${cid})` });
      const lookG = el(subG, 'g'), ub = uboat(subG, sd + 10);
      const look = figure(lookG, { scale: 0.3 * U.s / 0.85, pose: 'look', face: 'left' }, sd + 15, false);
      subG.appendChild(lookG);
      const foam = inkEl(root, INK.paperLight);
      const RA = Object.assign({ x: 0.3, y: P.sea ?? 0.52, s: 1.2 }, P.raft || {});
      const limG = el(root, 'g'), raftO = raft(root, sd + 20);
      root.insertBefore(raftO.g, limG);
      const lim = figure(limG, Object.assign({ scale: 0.7, pose: 'wave', face: 'right' }, P.lim || {}), sd + 25, false);
      const water = window.TZ.water(el(root, 'g'), sd + 30);
      const fr = front(el(root, 'g'), P.front, sd + 35);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const sa = atOr(cues, P.surface ?? 'surface', 0.3), ga = atOr(cues, P.gone ?? 'gone', dur * 0.7);
          farWater.update(t, W, H, seaY - 30, { rough: 0.5 });
          const up = progIO(lt, sa - 0.4, 0.9), go = progIO(lt, ga, Math.max(0.8, dur - ga));
          const ux = U.x * W + go * 260, uy = U.y * H + (1 - up) * 160 * U.s + go * 150 * U.s;
          ub.update(t, ux, uy, U.s * 1.3);
          look.update(lt, t, cues, ux + 10 * U.s * 1.3, uy - 122 * U.s * 1.3);
          foam.setAttribute('d', up > 0.05 && up < 1 || go > 0 ? [0, 1, 2].map(i => inkLoop(ell(ux - (200 - i * 180) * U.s, U.y * H + 4, 70 * U.s, 12, 8), { seed: sd + 40 + i, t })).join(' ') : '');
          const r = raftO.update(t, RA.x * W, RA.y * H + Math.sin(t * 1.7) * 7, RA.s, Math.sin(t * 1.3) * 2.5);
          lim.update(lt, t, cues, r.deck[0], r.deck[1]);
          water.update(t, W, H, Math.max(RA.y, U.y) * H + 10, { rough: 1 });
          if (fr) fr.update(lt, t, W, H);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pl_end
  SH.pl_end = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1011, top = el(svg, 'g'), root = el(top, 'g');
      const seaY = (P.sea ?? 0.6) * H;
      const farWater = window.TZ.water(el(root, 'g'), sd + 5);
      const RA = Object.assign({ x: 0.5, y: 0.74, s: 1.5 }, P.raft || {});
      const figG = el(root, 'g'), raftO = raft(root, sd + 10);
      root.insertBefore(raftO.g, figG);
      const hero = !!P.lim, KK = Object.assign({ scale: 0.75, pose: 'point', dir: 60, face: 'right', hook: false, dx: 0 }, P.lim || P.kasif || {});
      const fig = figure(figG, KK, sd + 20, !hero);
      const hookE = inkEl(root, mix(INK.ink, INK.inkSoft, 0.45)), hookR = inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 }), glint = inkEl(root, INK.gold);
      const water = window.TZ.water(el(root, 'g'), sd + 15);
      const fr = front(el(root, 'g'), P.front, sd + 25);
      const wordsG = el(top, 'g');
      const W2 = [];
      (P.lines || []).forEach((Ln, li) => {
        const size = Ln.size || 120, y = (Ln.y ?? 0.2 + li * 0.1) * H;
        const ts = Ln.words.map(w => { const g = el(wordsG, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
        const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
        const gap = size * 0.35, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
        let x = W / 2 - tot / 2;
        ts.forEach((o, i) => { o.x = x + ws[i] / 2; o.y = y; o.ww = ws[i]; o.size = size; o.at = (Ln.at || [])[i]; o.k = li * 10 + i; x += ws[i] + gap; W2.push(o); });
      });
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const CL = P.close ? Object.assign({ focus: [0.5, 0.45], zoom: 1.8, to: [0.5, 0.42] }, P.close) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (CL) {   // internal close-up on the world only (the words stay put): focus point -> 'to' on screen, slow push
            const z = CL.zoom * (1 + 0.05 * lt / Math.max(1, dur)), fx = CL.focus[0] * W, fy = CL.focus[1] * H;
            root.setAttribute('transform', `translate(${f1(CL.to[0] * W)} ${f1(CL.to[1] * H)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          }
          farWater.update(t, W, H, seaY, { rough: 0.5 });
          const r = raftO.update(t, RA.x * W, RA.y * H + Math.sin(t * 1.5) * 7, RA.s, Math.sin(t * 1.2) * 2.5, { tins: RA.tins });
          const k = fig.update(lt, t, cues, r.deck[0] + (KK.dx || 0) * W, r.deck[1]);
          if (KK.hook) {
            const hx = k.hand[0], hy = k.hand[1] + 110;   // the hook hangs from the raised hand
            const hp = [[hx, hy - 90], [hx, hy + 30], [hx + 34, hy + 70], [hx + 72, hy + 44], [hx + 66, hy + 10]];
            hookE.setAttribute('d', inkPath(hp, { w: 20, seed: sd + 40, t, amp: 0.5 }) + ' ' + inkLoop(ell(hx, hy - 94, 28, 10, 10), { seed: sd + 41, t }));
            hookR.setAttribute('d', inkPath(hp.map(p => [p[0] - 6, p[1]]), { w: 3, seed: sd + 42, t, amp: 0.5 }));
            const u = (lt % 1.4) / 1.4, gs = Math.sin(u * Math.PI), st = [];
            for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = (i % 2 ? 40 : 12) * gs; st.push([hx + 76 + Math.cos(a) * rr, hy + 34 + Math.sin(a) * rr]); }
            fill(glint, st, sd + 45, t, 0.5, false);
          }
          water.update(t, W, H, RA.y * H + 10 * RA.s, { rough: 0.8 });
          if (fr) fr.update(lt, t, W, H);
          W2.forEach(o => {
            const a = atOr(cues, o.at, 0.1 + o.k * 0.2), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5), b = boil(sd + 50 + o.k, t, 1.2);
            o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            o.g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1((o.hl ? -3 : 0) + (1 - p) * -6)}) scale(${(lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
            o.tx.setAttribute('y', f1(o.size * 0.35));
            if (o.hl) {
              o.tx.setAttribute('fill', INK.paperLight);
              const bw = o.ww + 50, bh = o.size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
              o.box.setAttribute('d', inkLoop(pts, { seed: sd + 60 + o.k, t, smooth: false })); o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 70 + o.k, t, closed: true, smooth: false }));
            }
          });
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
