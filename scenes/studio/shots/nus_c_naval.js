// nus_c_naval: 18 March 1915 at the Dardanelles in parchment ink (theme "parchment", brand/kit/BRAND.md §5).
// Three shot types, everything boils at 8 Hz and is a pure function of lt (no Math.random):
//
//   nus_c_sea — side view of the strait: grey ink ironclads (2-3 funnels, turrets, small flag), the small dark
//     minelayer Nusret (one funnel, red crescent-and-star ensign), horned mines on chains under the water,
//     far shore with a stone tabya, day / dusk / night sky. Ships steam, hit a mine on a cue (water column,
//     flash, smoke) and then sink, drift, list or withdraw. No human figures in the sinking (BRAND: respect).
//   P: {sky: "day"|"dusk"|"night", night: cue (day turns to night from that cue), horizon: 0.56,
//       shore: "left"|"right"|false, tabya: true, guns: true (muzzle puffs from the tabya),
//       ships: [{kind: "ironclad"|"nusret", x: 0.2, to: 0.5, at: 0 (start), dur (no hit: travel time), hit: cue,
//               fate: "sink"|"drift"|"list"|"withdraw", sink_dur: 4, sink_at: cue (sinking starts; default hit; hit: -10 = damaged before the scene), drift: -40 (px/s), face: 1|-1, scale: 1,
//               depth: 0 (0..1, far ships smaller and higher), funnels: 2, flag: "fr"|"uk"|"tr", dry: true (on a
//               cradle on land), smoke: true}],
//       mines: [{x: 0.5, ship: 0 (index of the ship that sets it off)}],
//       land: {from: 0, to: 0.46, at} (a stretch of shore ground instead of water; museum park),
//       labels: [{text, x, y, at, color: "red"|"ink"|"blue", size}], ledge: "left"|"right" (foreground rock),
//       zoom: 1.05, focus: [0.5, 0.55],
//       kasif: {x: 0.1, y: 0.94, pose: "look", at: cue, then: "shock", dir, face: "right"|"left", scale: 0.6,
//               emotion, to: 0.4 (walks there from walk_at), walk_at: cue|s, walk_dur: 2}}
//   cues: ship "hit" names, night, labels[].at, kasif.at / walk_at
//
//   nus_c_bay — bird's-eye schematic of the strait and Erenköy Bay on a map sheet: European shore on top, Asian
//     shore with the bay below, the swept channel (blue band, moving dashes), the ships' turning loop (red dashed
//     route) leaving the channel close to the shore, a top-down ironclad travelling along it, the single row of
//     26 mines parallel to the bay shore, a burst where the route meets the row, an optional current arrow.
//   P: {channel: true | {at}, route: true | {at, dur: 3}, mines: true | {at, dur: 1.6}, boom: cue (ship reaches
//       the row exactly then), drift: {at, label: "akıntı"} (after the boom the ship drifts with the current),
//       parallel: {at} (red arrow along the row), loop: true (ship keeps sailing the loop when there is no boom),
//       labels: [{text, u, v, size, rot, at, color}], zoom: 1.08, focus: [0.5, 0.6],
//       kasif: {x: 0.09, pose, at, then, dir, face, scale: 0.7, emotion}}
//   cues: channel, route, mines, boom, drift, parallel, labels[].at, kasif.at
//
//   nus_c_memorial — Gallipoli hillside at dusk: two quiet groups of plain headstones (both sides), red poppies
//     swaying, the sea behind, Kaşif standing between them with his head bowed. P: {rows: 3, per: 7,
//     label: {text, at}, kasif: {x: 0.5, pose: "idle", at: cue, then: "think", emotion: "worried"}}
//   cues: hit (stones finish / label), label.at, kasif.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = INK;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { red: C.red, ink: C.ink, blue: C.blue, gold: C.gold, green: C.green, soft: C.inkSoft };
  const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // ---------------------------------------------------------------- shared: Kaşif
  function makeKasif(parent, K, seed, portrait) {
    if (!K || typeof KASIF === 'undefined') return null;
    return { K, rig: KASIF.create(el(parent, 'g'), { scale: K.scale ?? (portrait ? 0.75 : 0.62), hat: true, seed: seed + 3 }) };
  }
  function updKasif(kas, lt, t, cues, env, W, H, portrait) {
    if (!kas) return;
    const K = kas.K, at = atOr(cues, K.at, null);
    let x = (K.x ?? 0.1) * W, face = K.face === 'left' ? -1 : 1, walking = false, ph = 0;
    const y = (K.y ?? (portrait ? 0.6 : 0.95)) * H;
    if (K.to != null) {
      const wa = atOr(cues, K.walk_at, 0.2), wd = K.walk_dur ?? 2, p = clamp01((lt - wa) / wd);
      const x1 = K.to * W;
      walking = lt >= wa && p < 1;
      face = x1 >= x ? 1 : -1;
      const d = Math.abs(x1 - x) * p;
      x = lerp(x, x1, p);
      ph = d / (KASIF.gait('walk') * kas.rig_scale());
      if (p >= 1 && K.face) face = K.face === 'left' ? -1 : 1;
    }
    const after = at != null && lt >= at;
    const pose = walking ? 'walk' : after ? (K.then || 'shock') : (K.pose || 'idle');
    const since = after ? lt - at : lt, dir = typeof K.dir === 'number' ? K.dir : DIRS[K.dir] ?? 25;
    const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
    const o = { x, y, face, since, dir, ph, emotion: after ? (K.emotion || (pose === 'shock' ? 'surprised' : null)) : (K.emotion0 || null), mouth: inkTalk(t, words) };
    if (after && !walking && since < 0.32) { o.prev = { pose: K.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
    kas.rig.update(t, pose, o);
  }

  // stroke specs -> filled + outlined ink paths in a group; draw(t) re-boils
  function strokeSet(g, specs, seed) {
    const parts = specs.map(st => ({ st, f: st.f ? inkEl(g, st.f, st.fo != null ? { 'fill-opacity': st.fo } : {}) : null, r: st.w ? inkEl(g, st.col || C.ink) : null }));
    return t => parts.forEach((pp, i) => {
      const o = { seed: seed + i * 7, t, amp: pp.st.amp ?? 1.1, smooth: pp.st.sm !== 0 };
      if (pp.f) pp.f.setAttribute('d', inkLoop(pp.st.p, o));
      if (pp.r) pp.r.setAttribute('d', inkPath(pp.st.p, Object.assign({}, o, { w: pp.st.w, closed: !!pp.st.c })));
    });
  }
  function flagSpecs(kind, x, y, w, h) {
    const R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    if (kind === 'fr') {
      const s = w / 3;
      return [{ p: R(x, y, x + s, y + h), f: C.blue, sm: 0, amp: 0.4 }, { p: R(x + s, y, x + 2 * s, y + h), f: C.paperLight, sm: 0, amp: 0.4 },
        { p: R(x + 2 * s, y, x + w, y + h), f: C.red, sm: 0, amp: 0.4 }, { p: R(x, y, x + w, y + h), c: 1, w: 2.5, sm: 0, amp: 0.4 }];
    }
    if (kind === 'uk') {
      return [{ p: R(x, y, x + w, y + h), f: C.paperLight, sm: 0, amp: 0.4 }, { p: R(x + w * 0.42, y, x + w * 0.58, y + h), f: C.red, sm: 0, amp: 0.3 },
        { p: R(x, y + h * 0.38, x + w, y + h * 0.62), f: C.red, sm: 0, amp: 0.3 }, { p: R(x, y, x + w * 0.4, y + h * 0.36), f: C.blue, sm: 0, amp: 0.3 },
        { p: R(x, y, x + w, y + h), c: 1, w: 2.5, sm: 0, amp: 0.4 }];
    }
    // tr: red field, paper crescent and star
    const cx = x + w * 0.42, cy = y + h / 2, r = h * 0.3;
    const cres = [];
    for (let i = 0; i <= 10; i++) { const a = -2.3 + i * 4.6 / 10; cres.push([cx + Math.cos(a + Math.PI) * r * -1, cy + Math.sin(a) * r]); }
    for (let i = 10; i >= 0; i--) { const a = -2.0 + i * 4.0 / 10; cres.push([cx + r * 0.35 + Math.cos(a + Math.PI) * r * -0.78, cy + Math.sin(a) * r * 0.78]); }
    const sx = cx + r * 1.15, star = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.18 : r * 0.42; star.push([sx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return [{ p: R(x, y, x + w, y + h), f: C.red, sm: 0, amp: 0.4 }, { p: cres, f: C.paperLight, amp: 0.2 }, { p: star, f: C.paperLight, sm: 0, amp: 0.2 },
      { p: R(x, y, x + w, y + h), c: 1, w: 2.5, sm: 0, amp: 0.4 }];
  }
  // side-view ironclad facing +x, waterline y = 0; returns {specs, funnels: [[x, ytop]], bow, mast}
  function ironclad(n = 2, flag = 'uk') {
    const S = [];
    S.push({ p: [[-182, -30], [176, -32], [192, -28], [174, 24], [-166, 24], [-188, 0]], c: 1, f: C.inkSoft, w: 5, sm: 0 });
    S.push({ p: [[-176, -12], [182, -14]], w: 2.5, col: C.paperDark });
    S.push({ p: [[-74, -31], [74, -31], [66, -64], [-66, -64]], c: 1, f: C.paperDark, w: 4, sm: 0 });
    S.push({ p: [[28, -64], [72, -64], [68, -88], [32, -88]], c: 1, f: C.paperDark, w: 4, sm: 0 });
    const fx = n >= 3 ? [-52, -16, 20] : [-36, 4];
    const funnels = [];
    fx.forEach(x => {
      S.push({ p: [[x - 12, -64], [x + 12, -64], [x + 11, -126], [x - 11, -126]], c: 1, f: C.inkSoft, w: 4, sm: 0 });
      S.push({ p: [[x - 12, -118], [x + 12, -118], [x + 12, -128], [x - 12, -128]], f: C.ink, sm: 0, amp: 0.5 });
      funnels.push([x, -130]);
    });
    S.push({ p: [[96, -31], [96, -47], [110, -56], [132, -56], [140, -45], [140, -31]], c: 1, f: C.paperDark, w: 4, sm: 0 });
    S.push({ p: [[136, -46], [196, -50]], w: 7 });
    S.push({ p: [[-96, -31], [-96, -47], [-110, -56], [-132, -56], [-140, -45], [-140, -31]], c: 1, f: C.paperDark, w: 4, sm: 0 });
    S.push({ p: [[-136, -46], [-194, -50]], w: 7 });
    S.push({ p: [[-100, -32], [-100, -160]], w: 4 });
    S.push({ p: [[-116, -138], [-84, -138]], w: 3 });
    S.push({ p: [[52, -88], [52, -172]], w: 4 });
    S.push({ p: [[38, -150], [66, -150]], w: 3 });
    for (let i = 0; i < 7; i++) S.push({ p: [[-120 + i * 40, -15], [-114 + i * 40, -15]], w: 5, col: C.paperLight, amp: 0.4 });
    S.push(...flagSpecs(flag, -146, -162, 44, 28));
    return { S, funnels, bow: 160, len: 380, top: -175 };
  }
  // side-view Nusret facing +x: small dark hull, one funnel, stern ensign, mines on the stern rails
  function nusretShip() {
    const S = [];
    S.push({ p: [[-80, -18], [72, -20], [86, -16], [72, 15], [-70, 15], [-84, 0]], c: 1, f: C.ink, w: 5, sm: 0 });
    S.push({ p: [[-22, -19], [28, -19], [24, -40], [-18, -40]], c: 1, f: C.inkSoft, w: 4, sm: 0 });
    S.push({ p: [[-4, -40], [12, -40], [11, -76], [-3, -76]], c: 1, f: C.ink, w: 4, sm: 0 });
    S.push({ p: [[-4, -66], [12, -66]], w: 3, col: C.paperDark });
    S.push({ p: [[44, -20], [44, -102]], w: 4 });
    S.push({ p: [[32, -84], [56, -84]], w: 3 });
    S.push({ p: [[-76, -18], [-76, -62]], w: 3.5 });
    for (let i = 0; i < 3; i++) S.push({ p: ptsCircleL(-58 + i * 15, -26, 7), c: 1, f: C.paperDark, w: 2.5 });
    S.push(...flagSpecs('tr', -112, -64, 36, 24));
    return { S, funnels: [[4, -78]], bow: 70, len: 170, top: -105 };
  }
  function ptsCircleL(cx, cy, r, n = 10) { return Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]); }
  // horned mine (local, centre 0,0)
  function mineSpecs(r = 22) {
    const S = [{ p: ptsCircleL(0, 0, r, 12), c: 1, f: C.ink, w: 3 }];
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.2832 - 1.57; S.push({ p: [[Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9], [Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45]], w: 5 }); }
    S.push({ p: ptsCircleL(-r * 0.35, -r * 0.35, r * 0.18, 6), f: C.inkSoft, amp: 0.3 });
    return S;
  }

  // ================================================================ nus_c_sea
  SH.nus_c_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const HY = (P.horizon ?? (portrait ? 0.5 : 0.56)) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sky = el(cam, 'g'), far = el(cam, 'g'), waterG = el(cam, 'g');
      // night / dusk sky
      const night = P.sky === 'night' || P.night != null;
      const hatch = night ? inkEl(sky, C.ink, { 'fill-opacity': 0 }) : null;
      const moon = night ? inkEl(sky, C.paperLight) : null, moonR = night ? inkEl(sky, C.ink) : null;
      const stars = night ? inkEl(sky, C.ink, { 'fill-opacity': 0 }) : null;
      const sun = P.sky === 'dusk' ? { f: inkEl(sky, C.gold, { 'fill-opacity': 0.55 }), r: inkEl(sky, C.inkSoft), rays: inkEl(sky, C.gold) } : null;
      // far shore + tabya
      const shore = P.shore === undefined ? 'left' : P.shore;
      let shoreF = null, shoreR = null, tabya = null, gunPuffs = [];
      if (shore) {
        shoreF = inkEl(far, C.paperDark); shoreR = inkEl(far, C.inkSoft);
        if (P.tabya !== false) {
          const g = el(far, 'g');
          const tx = shore === 'left' ? W * 0.16 : W * 0.84, ty = HY - 62;
          const sp = [{ p: [[-60, 0], [-56, -70], [-60, -70], [-60, -92], [-44, -92], [-44, -80], [-26, -80], [-26, -92], [-10, -92], [-10, -80], [8, -80], [8, -92], [24, -92], [24, -80], [42, -80], [42, -92], [58, -92], [58, -70], [54, -70], [60, 0]], c: 1, f: C.paperLight, w: 4, sm: 0 },
            { p: [[-40, -30], [-12, -30]], w: 3, col: C.inkSoft }, { p: [[10, -50], [40, -50]], w: 3, col: C.inkSoft }, { p: [[-30, -60], [0, -60]], w: 3, col: C.inkSoft },
            { p: [[(shore === 'left' ? 58 : -58), -70], [(shore === 'left' ? 104 : -104), -78]], w: 9 }];
          tabya = { g, tx, ty, draw: strokeSet(g, sp, sd + 40) };
          if (P.guns) for (let k = 0; k < 4; k++) gunPuffs.push(inkEl(far, C.inkSoft, { 'fill-opacity': 0 }));
        }
      }
      // water
      const waterF = el(waterG, 'rect', { x: -60, y: HY, width: W + 120, height: H - HY + 60, fill: C.paperLight });
      const surf = inkEl(waterG, C.inkSoft), waves = inkEl(waterG, C.inkSoft, { 'fill-opacity': 0.7 });
      const bedY = HY + (portrait ? 330 : 270);
      const bedF = inkEl(waterG, C.paperDark), bedR = inkEl(waterG, C.inkSoft), bedH = inkEl(waterG, C.inkSoft, { 'fill-opacity': 0.6 });
      // land (museum park) instead of water
      let land = null;
      if (P.land) { const g = el(cam, 'g'); land = { g, f: inkEl(g, C.paperDark), r: inkEl(g, C.ink), grass: inkEl(g, C.green), L: P.land }; }
      // mines (under the ships)
      const mineG = el(cam, 'g');
      const mines = (P.mines || []).map((m, k) => {
        const g = el(mineG, 'g'), chain = inkEl(mineG, C.inkSoft);
        return { m, k, g, chain, draw: strokeSet(g, mineSpecs(portrait ? 24 : 21), sd + 60 + k * 30) };
      });
      // ships clipped at the water line (they sink out of sight)
      const cid = 'nuscclip' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: -200, y: -200, width: W + 400, height: HY + 200 + 24 });
      const shipLayer = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const fx = el(cam, 'g');
      const ships = (P.ships || []).map((s, k) => {
        const g = el(shipLayer, 'g'), def = s.kind === 'nusret' ? nusretShip() : ironclad(s.funnels || 2, s.flag || 'uk');
        const draw = strokeSet(g, def.S, sd + 100 + k * 97);
        const smoke = Array.from({ length: 9 }, () => inkEl(fx, C.inkSoft, { 'fill-opacity': 0 }));
        const fsmoke = Array.from({ length: 6 }, () => inkEl(shipLayer, C.inkSoft, { 'fill-opacity': 0 }));
        const col = inkEl(fx, C.paperLight, { 'fill-opacity': 0 }), colR = inkEl(fx, C.ink, { 'fill-opacity': 0 });
        const flash = inkEl(fx, C.gold, { 'fill-opacity': 0 }), flashR = inkEl(fx, C.red, { 'fill-opacity': 0 });
        const cradle = s.dry ? inkEl(shipLayer, C.ink) : null;
        return { s, k, g, def, draw, smoke, fsmoke, col, colR, flash, flashR, cradle };
      });
      // front water strip over the hulls
      const front = inkEl(cam, C.paperLight), frontR = inkEl(cam, C.inkSoft);
      // foreground ledge
      let ledge = null;
      if (P.ledge) { const g = el(cam, 'g'); ledge = { f: inkEl(g, C.paperDark), r: inkEl(g, C.ink), h: inkEl(g, C.inkSoft) }; }
      // labels
      const labs = (P.labels || []).map((L, k) => {
        const g = el(root, 'g'), box = inkEl(g, C.paperLight), boxR = inkEl(g, C.ink);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 70 : 64), 'text-anchor': 'middle', fill: COL[L.color] || C.ink });
        t.textContent = L.text;
        return { L, k, g, box, boxR, t };
      });
      const kas = makeKasif(root, P.kasif, seed, portrait);
      if (kas) kas.rig_scale = () => P.kasif.scale ?? (portrait ? 0.75 : 0.62);
      const FOC = [(P.focus || [0.5, 0.55])[0] * W, (P.focus || [0.5, 0.55])[1] * H];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(FOC[0])} ${f1(FOC[1])}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);
          // sky
          if (night) {
            const nAt = P.night != null ? atOr(cues, P.night, 0) : -1, nk = P.night != null ? progIO(lt, nAt, 2.6) : 1;
            let d = '';
            for (let i = 0; i < 46; i++) {
              const x0 = -80 + i * (W + 160) / 46, y0 = 0, len = HY * (0.55 + 0.4 * ((i * 37) % 11) / 11);
              d += inkPath([[x0, y0], [x0 + len * 0.35, y0 + len]], { seed: sd + 5 + i, t, w: 2.2, amp: 1.2 }) + ' ';
            }
            hatch.setAttribute('d', d); hatch.setAttribute('fill-opacity', f1(0.32 * nk * 100) / 100);
            const mx = W * 0.8, my = H * 0.17, mr = 46;
            const cres = [];
            for (let i = 0; i <= 12; i++) { const a = -1.9 + i * 3.8 / 12; cres.push([mx + Math.cos(a) * mr, my + Math.sin(a) * mr]); }
            for (let i = 12; i >= 0; i--) { const a = -1.6 + i * 3.2 / 12; cres.push([mx + 18 + Math.cos(a) * mr * 0.78, my + Math.sin(a) * mr * 0.86]); }
            moon.setAttribute('d', inkLoop(cres, { seed: sd + 8, t, amp: 0.8 })); moon.setAttribute('fill-opacity', f1(nk * 100) / 100);
            moonR.setAttribute('d', inkPath(cres, { seed: sd + 8, t, w: 3.5, closed: true, amp: 0.8 })); moonR.setAttribute('fill-opacity', f1(nk * 100) / 100);
            let sdd = '';
            for (let i = 0; i < 14; i++) { const sx = (0.08 + ((i * 0.618) % 1) * 0.84) * W, sy = (0.05 + ((i * 0.37) % 1) * 0.32) * H, tw = 3 + 2.5 * (0.5 + 0.5 * Math.sin(t * 2 + i)); sdd += inkDot(sx, sy, tw, tw, sd + 300 + i, t) + ' '; }
            stars.setAttribute('d', sdd); stars.setAttribute('fill-opacity', f1(nk * 0.8 * 100) / 100);
          }
          if (sun) {
            const sx = W * (shore === 'right' ? 0.3 : 0.7), r = 92, pts = [];
            for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; pts.push([sx + Math.cos(a) * r, HY + 6 + Math.sin(a) * r]); }
            sun.f.setAttribute('d', inkLoop(pts, { seed: sd + 9, t }));
            sun.r.setAttribute('d', inkPath(pts, { seed: sd + 9, t, w: 3.5, closed: true }));
            let rd = '';
            for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI, r0 = r + 22, r1 = r + 60 + 14 * Math.sin(t * 1.5 + i); rd += inkPath([[sx + Math.cos(a) * r0, HY + Math.sin(a) * r0], [sx + Math.cos(a) * r1, HY + Math.sin(a) * r1]], { seed: sd + 20 + i, t, w: 4 }) + ' '; }
            sun.rays.setAttribute('d', rd);
          }
          // far shore
          if (shoreF) {
            const L = shore === 'left', x0 = L ? -40 : W + 40, x1 = L ? W * 0.42 : W * 0.58;
            const pts = [[x0, HY + 2], [x0, HY - 120], [lerp(x0, x1, 0.25), HY - 140], [lerp(x0, x1, 0.5), HY - 96], [lerp(x0, x1, 0.75), HY - 50], [x1, HY + 2]];
            shoreF.setAttribute('d', inkLoop(pts, { seed: sd + 30, t }));
            shoreR.setAttribute('d', inkPath(pts.slice(1, 6), { seed: sd + 30, t, w: 4 }));
            if (tabya) {
              tabya.g.setAttribute('transform', `translate(${f1(tabya.tx)} ${f1(tabya.ty + 20)})`);
              tabya.draw(t);
              gunPuffs.forEach((pf, k) => {
                const per = 2.2, ph = ((lt + k * per / gunPuffs.length) % per) / per, gx = tabya.tx + (L ? 104 : -104) + (L ? 1 : -1) * ph * 60, gy = tabya.ty - 58 - ph * 50;
                const r = 14 + ph * 34;
                pf.setAttribute('d', inkCircle(gx, gy, r, sd + 50 + k, t, { fill: true }));
                pf.setAttribute('fill-opacity', f1((1 - ph) * 0.55 * 100) / 100);
              });
            }
          }
          // water surface, waves, sea bed
          const sp = []; for (let i = 0; i <= 24; i++) sp.push([-60 + i * (W + 120) / 24, HY + Math.sin(i * 1.3 + t * 1.4) * 3]);
          surf.setAttribute('d', inkPath(sp, { seed: sd + 70, t, w: 4 }));
          let wd = '';
          for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) {
            const y = HY + 40 + r * ((bedY - HY - 60) / 4), x = (((i * 0.143 + r * 0.071) * (W + 200) + t * (24 + r * 6)) % (W + 200)) - 100, w = [];
            for (let j = 0; j <= 6; j++) w.push([x + j * 12, y + Math.sin(j * 1.7) * 5]);
            wd += inkPath(w, { seed: sd + 80 + r * 10 + i, t, w: 3 }) + ' ';
          }
          waves.setAttribute('d', wd);
          const bp = [[-60, bedY], [W * 0.3, bedY + 10], [W * 0.6, bedY - 6], [W + 60, bedY + 6], [W + 60, H + 60], [-60, H + 60]];
          bedF.setAttribute('d', inkLoop(bp, { seed: sd + 90, t, smooth: false }));
          bedR.setAttribute('d', inkPath(bp.slice(0, 4), { seed: sd + 90, t, w: 4 }));
          let hd = '';
          for (let i = 0; i < 26; i++) { const x = 20 + i * (W / 26); hd += inkPath([[x, bedY + 26], [x + 22, bedY + 48]], { seed: sd + 95 + i, t, w: 2.5 }) + ' '; }
          bedH.setAttribute('d', hd);
          if (land) {
            const x0 = (land.L.from ?? 0) * W - 60, x1 = (land.L.to ?? 0.46) * W, gy = HY - 8;
            const lp = [[x0, gy], [x1 - 40, gy - 4], [x1, gy + 30], [x1 + 30, H + 60], [x0, H + 60]];
            land.f.setAttribute('d', inkLoop(lp, { seed: sd + 96, t, smooth: false }));
            land.r.setAttribute('d', inkPath(lp.slice(0, 4), { seed: sd + 96, t, w: 5, smooth: false }));
            let gd = '';
            for (let i = 0; i < 18; i++) { const gx = x0 + 80 + i * (x1 - x0 - 120) / 18, sw = Math.sin(t * 1.8 + i) * 5; gd += inkPath([[gx, gy + 2], [gx + 4 + sw, gy - 22]], { seed: sd + 97 + i, t, w: 3 }) + ' '; }
            land.grass.setAttribute('d', gd);
          }
          // ships
          const shipPos = ships.map(sh => {
            const s = sh.s, dsc = (s.scale ?? 1) * lerp(1, 0.6, s.depth || 0) * (portrait ? 0.8 : 1);
            const y0 = HY - (s.depth || 0) * 70;
            const at = atOr(cues, s.at, 0), hitT = s.hit != null ? atOr(cues, s.hit, null) : null;
            let x = (s.x ?? 0.3) * W, face = s.face ?? 1, rot = Math.sin(t * 1.1 + sh.k) * 1.2, dy = Math.sin(t * 1.5 + sh.k * 2) * 2.5, hp = 0;
            const x1 = (s.to ?? s.x ?? 0.3) * W;
            if (hitT != null) {
              x = lerp(x, x1, clamp01((lt - at) / Math.max(0.3, hitT - at)));
              if (lt >= hitT) {
                const e = lt - hitT; hp = e;
                rot += punch(lt, hitT, 0.8) * -6 * face;
                const fate = s.fate || 'sink';
                if (fate === 'sink') { const sT = s.sink_at != null ? atOr(cues, s.sink_at, hitT) : hitT, sk = smooth((lt - sT) / (s.sink_dur ?? 4)); rot += -face * 6 * smooth(e / 2) + face * 16 * sk; dy += 8 * smooth(e / 2) + sk * 260 * dsc; x += face * sk * 30; }
                else if (fate === 'drift') { x += (s.drift ?? -40) * e; rot += -face * 7 * smooth(e / 2.5) + Math.sin(t * 0.8) * 2; dy += 8 * smooth(e / 2); }
                else if (fate === 'list') { rot += -face * 8 * smooth(e / 2); dy += 10 * smooth(e / 2); }
                else if (fate === 'withdraw') { const tp = smooth(e / 1.6); face = lerp(face, -face, tp); x += -(s.face ?? 1) * Math.max(0, e - 1.2) * 34; rot += (s.face ?? 1) * 4 * smooth(e / 1.5); dy += 6 * tp; }
              }
            } else {
              const d = s.dur ?? Math.max(1, dur);
              x = lerp(x, x1, clamp01((lt - at) / d));
            }
            if (s.dry) { dy = 0; rot = 0; }
            const yy = (s.dry ? HY - 70 : y0) + dy;
            if (Math.abs(face) < 0.08) face = face < 0 ? -0.08 : 0.08;
            sh.g.setAttribute('transform', `translate(${f1(x)} ${f1(yy)}) rotate(${f1(rot)}) scale(${(face * dsc).toFixed(3)} ${dsc.toFixed(3)})`);
            sh.draw(t);
            if (sh.cradle) {
              let cd = '';
              for (const ox of [-50, 40]) cd += inkPath([[x + ox * dsc - 26, HY - 8], [x + ox * dsc, yy + 14 * dsc], [x + ox * dsc + 26, HY - 8]], { seed: sd + 600 + ox, t, w: 6, smooth: false }) + ' ';
              sh.cradle.setAttribute('d', cd);
            }
            // funnel smoke (steaming)
            const fsOn = s.smoke !== false && !s.dry;
            sh.fsmoke.forEach((pf, k) => {
              if (!fsOn) { pf.setAttribute('fill-opacity', 0); return; }
              const fn = sh.def.funnels[k % sh.def.funnels.length], per = 2.4, ph = ((t + k * 0.4) % per) / per;
              const ang = rot * Math.PI / 180, lx = fn[0] * face * dsc, ly = fn[1] * dsc;
              const px = x + lx * Math.cos(ang) - ly * Math.sin(ang) - face * ph * 70, py = yy + lx * Math.sin(ang) + ly * Math.cos(ang) - ph * 60;
              pf.setAttribute('d', inkCircle(px, py, (10 + ph * 22) * dsc, sd + 700 + sh.k * 20 + k, t, { fill: true }));
              pf.setAttribute('fill-opacity', f1((1 - ph) * 0.42 * 100) / 100);
            });
            // hit: water column, flash, smoke
            if (hitT != null && lt >= hitT) {
              const e = lt - hitT, bx = x + (s.face ?? 1) * sh.def.bow * 0.7 * dsc, by = HY;
              const hh = 300 * dsc * spring(lt, hitT, 0.5), fo = clamp01(1 - (e - 1.0) / 1.0);
              const cp = [[-46, 0], [-34, -0.5], [-52, -0.78], [-18, -1], [4, -0.84], [26, -1.06], [46, -0.7], [34, -0.42], [50, 0]].map(q => [bx + q[0] * dsc, by + q[1] * hh]);
              sh.col.setAttribute('d', inkLoop(cp, { seed: sd + 800 + sh.k, t })); sh.col.setAttribute('fill-opacity', f1(fo * 100) / 100);
              sh.colR.setAttribute('d', inkPath(cp, { seed: sd + 800 + sh.k, t, w: 4, closed: true })); sh.colR.setAttribute('fill-opacity', f1(fo * 100) / 100);
              const fl = clamp01(1 - e / 0.45), star = [];
              for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, r = (i % 2 ? 40 : 110) * dsc * (0.6 + 0.6 * spring(lt, hitT, 0.25)); star.push([bx + Math.cos(a) * r, by - 30 * dsc + Math.sin(a) * r]); }
              sh.flash.setAttribute('d', inkLoop(star, { seed: sd + 820 + sh.k, t, smooth: false })); sh.flash.setAttribute('fill-opacity', f1(fl * 0.9 * 100) / 100);
              sh.flashR.setAttribute('d', inkPath(star, { seed: sd + 820 + sh.k, t, w: 4, closed: true, smooth: false })); sh.flashR.setAttribute('fill-opacity', f1(fl * 100) / 100);
              const sinkGone = (s.fate || 'sink') === 'sink' ? smooth((lt - (s.sink_at != null ? atOr(cues, s.sink_at, hitT) : hitT)) / (s.sink_dur ?? 4)) : 0;
              sh.smoke.forEach((pf, k) => {
                const birth = k * 0.33; if (e < birth) { pf.setAttribute('fill-opacity', 0); return; }
                const per = 3.0, age = ((e - birth) % per), ph = age / per;
                const ox = (s.fate === 'sink') ? x : x + (s.face ?? 1) * 40 * dsc;
                const px = ox + ph * 120 * (P.wind ?? -1) + Math.sin(k * 2.1) * 30 * dsc, py = HY - 90 * dsc - ph * 260 * dsc;
                pf.setAttribute('d', inkCircle(px, py, (26 + ph * 46) * dsc, sd + 900 + sh.k * 30 + k, t, { fill: true }));
                pf.setAttribute('fill-opacity', f1((1 - ph) * 0.55 * (1 - 0.5 * sinkGone) * 100) / 100);
              });
            } else {
              [sh.col, sh.colR, sh.flash, sh.flashR, ...sh.smoke].forEach(n => n.setAttribute('fill-opacity', 0));
            }
            return { x, hitT };
          });
          // mines
          mines.forEach(mn => {
            const m = mn.m, sh = ships[m.ship ?? 0], hp = shipPos[m.ship ?? 0];
            const gone = hp && hp.hitT != null && lt >= hp.hitT;
            const mx = (m.x ?? 0.5) * W, my = HY + (portrait ? 110 : 88) + Math.sin(t * 1.3 + mn.k) * 5;
            const p = spring(lt, atOr(cues, m.at, 0), 0.6);
            mn.g.style.opacity = gone ? 0 : clamp01(p * 2);
            mn.g.setAttribute('transform', `translate(${f1(mx)} ${f1(my)}) rotate(${f1(Math.sin(t * 0.9 + mn.k) * 6)})`);
            mn.draw(t);
            const ch = []; for (let i = 0; i <= 6; i++) ch.push([mx + Math.sin(i * 1.4 + t) * 3, lerp(my + 24, bedY + 4, i / 6)]);
            mn.chain.setAttribute('d', gone ? '' : inkPath(ch, { seed: sd + 1000 + mn.k, t, w: 3 }));
            mn.chain.setAttribute('fill-opacity', f1(clamp01(p * 2) * 100) / 100);
          });
          // front water
          const fp = [[-60, HY + 18]]; for (let i = 0; i <= 24; i++) fp.push([-60 + i * (W + 120) / 24, HY + 14 + Math.sin(i * 1.9 - t * 1.8) * 4]);
          fp.push([W + 60, HY + 30]); fp.push([-60, HY + 30]);
          front.setAttribute('d', inkLoop(fp, { seed: sd + 1100, t, smooth: false, amp: 0.8 }));
          frontR.setAttribute('d', inkPath(fp.slice(1, 26), { seed: sd + 1100, t, w: 2.5, amp: 0.8 }));
          if (ledge) {
            const L = P.ledge === 'left', x0 = L ? -60 : W + 60, x1 = L ? W * 0.27 : W * 0.73;
            const lp = [[x0, H * 0.86], [lerp(x0, x1, 0.5), H * 0.85], [lerp(x0, x1, 0.85), H * 0.875], [x1, H * 0.93], [x1 + (L ? 40 : -40), H + 60], [x0, H + 60]];
            ledge.f.setAttribute('d', inkLoop(lp, { seed: sd + 1200, t, smooth: false }));
            ledge.r.setAttribute('d', inkPath(lp.slice(0, 5), { seed: sd + 1200, t, w: 5 }));
            let hd2 = '';
            for (let i = 0; i < 7; i++) { const hx = lerp(x0, x1, 0.12 + i * 0.12); hd2 += inkPath([[hx, H * 0.9], [hx + 26, H * 0.95]], { seed: sd + 1210 + i, t, w: 3 }) + ' '; }
            ledge.h.setAttribute('d', hd2);
          }
          // labels
          labs.forEach(lb => {
            const L = lb.L, at = atOr(cues, L.at, 0.4 + lb.k * 0.3), p = spring(lt, at, 0.6);
            const nx = (L.x ?? 0.5) * W, ny = (L.y ?? 0.16) * H, fs = L.size || (portrait ? 70 : 64);
            const tw = lb.t.getComputedTextLength ? lb.t.getComputedTextLength() : 300;
            const bp2 = [[nx - tw / 2 - 26, ny - fs * 0.85], [nx + tw / 2 + 26, ny - fs * 0.88], [nx + tw / 2 + 28, ny + fs * 0.4], [nx - tw / 2 - 24, ny + fs * 0.43]];
            lb.box.setAttribute('d', inkLoop(bp2, { seed: sd + 1300 + lb.k, t, smooth: false }));
            lb.boxR.setAttribute('d', inkPath(bp2, { seed: sd + 1300 + lb.k, t, w: 4, closed: true, smooth: false }));
            lb.t.setAttribute('x', nx); lb.t.setAttribute('y', ny);
            lb.g.style.opacity = clamp01(p * 2.5);
            lb.g.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1((lb.k % 2 ? 2 : -2) + (1 - p) * -6)}) scale(${lerp(0.7, 1, p).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
          });
          updKasif(kas, lt, t, cues, env, W, H, portrait);
        },
      };
    },
  };

  // ================================================================ nus_c_bay
  // sheet geometry (u right, v down): European shore on top, Asian shore with Erenköy Bay below
  const NORTH = [[-0.1, 0.2], [0.1, 0.21], [0.3, 0.19], [0.5, 0.22], [0.68, 0.26], [0.84, 0.32], [1.1, 0.35]];
  const SOUTH = [[1.1, 0.6], [0.9, 0.62], [0.76, 0.64], [0.66, 0.68], [0.6, 0.78], [0.5, 0.86], [0.38, 0.88], [0.28, 0.83], [0.2, 0.74], [0.1, 0.72], [-0.1, 0.72]];
  const ROW = [[0.24, 0.72], [0.3, 0.775], [0.38, 0.81], [0.48, 0.8], [0.555, 0.745], [0.6, 0.69]];
  const LOOP = [[-0.08, 0.455], [0.15, 0.46], [0.38, 0.465], [0.56, 0.48], [0.68, 0.53], [0.7, 0.62], [0.62, 0.72], [0.5, 0.78], [0.38, 0.77], [0.27, 0.7], [0.17, 0.63], [0.02, 0.6], [-0.1, 0.6]];
  function dense(pts, k = 14) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < k; j++) {
      const u = j / k, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function arc(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function along(pts, cum, d) {
    const L = cum[cum.length - 1]; d = Math.max(0, Math.min(L, d));
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const a = pts[i - 1], b = pts[i], f = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], ang: Math.atan2(b[1] - a[1], b[0] - a[0]), i };
  }

  SH.nus_c_bay = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const S = portrait ? { x: 50, y: 300, w: 980, h: 840 } : { x: 360, y: 150, w: 1220, h: 720 };
      const X = q => [S.x + q[0] * S.w, S.y + q[1] * S.h];
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sheetPts = [[S.x, S.y], [S.x + S.w, S.y - 4], [S.x + S.w + 3, S.y + S.h], [S.x - 2, S.y + S.h + 3]];
      const shadow = inkEl(cam, C.ink, { 'fill-opacity': 0.16 }), sheetF = inkEl(cam, C.paperLight), sheetR = inkEl(cam, C.ink);
      const cid = 'nusbayclip' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: S.x + 4, y: S.y + 4, width: S.w - 8, height: S.h - 8, rx: 8 });
      const outer = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const mg = el(outer, 'g');
      el(mg, 'rect', { x: S.x - 200, y: S.y - 200, width: S.w + 400, height: S.h + 400, fill: C.paperDark });
      const landH = inkEl(mg, C.inkSoft, { 'fill-opacity': 0.45 });
      const waterF = inkEl(mg, C.paperLight), coast = inkEl(mg, C.inkSoft);
      const waves = inkEl(mg, C.inkSoft, { 'fill-opacity': 0.6 });
      const oldMines = inkEl(mg, C.inkSoft, { 'fill-opacity': 0.75 });
      // channel
      const ch = P.channel ? (typeof P.channel === 'object' ? P.channel : {}) : null;
      const chF = ch ? inkEl(mg, C.blue, { 'fill-opacity': 0 }) : null;
      const chE = ch ? [0, 1].map(() => el(mg, 'path', { fill: 'none', stroke: C.blue, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '18 14' })) : null;
      // route
      const RD = dense(LOOP.map(X)), RC = arc(RD), RL = RC[RC.length - 1];
      const rt = P.route ? (typeof P.route === 'object' ? P.route : {}) : null;
      const routeP = rt ? el(mg, 'path', { fill: 'none', stroke: C.red, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '20 16' }) : null;
      const routeHead = rt ? inkEl(mg, C.red) : null;
      // mine row
      const RW = dense(ROW.map(X), 10), RWC = arc(RW), RWL = RWC[RWC.length - 1];
      const mn = P.mines ? (typeof P.mines === 'object' ? P.mines : {}) : null;
      const mineDots = mn ? Array.from({ length: 26 }, (_, i) => ({ q: along(RW, RWC, (i + 0.5) / 26 * RWL).p, n: inkEl(mg, C.ink), h: inkEl(mg, C.ink) })) : [];
      // where the loop meets the row
      let hitD = RL * 0.6;
      { // first point of the loop close to the row
        for (let i = 0; i < RD.length; i++) { if (RC[i] < RL * 0.35) continue; if (RW.some(r => Math.hypot(RD[i][0] - r[0], RD[i][1] - r[1]) < 12)) { hitD = RC[i]; break; } }
      }
      const parG = P.parallel ? inkEl(mg, C.red) : null;
      const curG = P.drift ? inkEl(mg, C.blue) : null;
      let curT = null;
      if (P.drift && P.drift.label !== false) {
        curT = el(mg, 'text', { 'font-family': INK_FONT, 'font-size': 52, 'text-anchor': 'middle', fill: C.blue, style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        curT.textContent = P.drift.label || 'akıntı';
      }
      // ship (top-down ironclad)
      const shipG = el(mg, 'g'), shipF = inkEl(shipG, C.inkSoft), shipR = inkEl(shipG, C.ink), shipD = inkEl(shipG, C.ink), wake = inkEl(mg, C.inkSoft, { 'fill-opacity': 0.6 });
      mg.insertBefore(wake, shipG);
      const boomF = inkEl(mg, C.gold, { 'fill-opacity': 0 }), boomR = inkEl(mg, C.red, { 'fill-opacity': 0 }), ring = inkEl(mg, C.red, { 'fill-opacity': 0 });
      // labels
      const labs = (P.labels || []).map((L, k) => {
        const t = el(mg, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 58 : 54), 'text-anchor': 'middle', fill: COL[L.color] || C.ink,
          style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        t.textContent = L.text;
        return { L, t, k };
      });
      const frame = inkEl(cam, C.inkSoft);
      const compG = el(cam, 'g'), compF = inkEl(compG, C.paperLight), compR = inkEl(compG, C.inkSoft), compN = inkEl(compG, C.ink), compS = inkEl(compG, C.paperDark);
      const compT = el(compG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': 44, 'text-anchor': 'middle', fill: C.ink });
      compT.textContent = 'K';
      const kas = makeKasif(root, P.kasif, seed, portrait);
      if (kas) kas.rig_scale = () => P.kasif.scale ?? (portrait ? 0.75 : 0.62);
      const FOC = X(P.focus || [0.5, 0.6]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const pin = spring(lt, 0, 0.7);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5 + (1 - pin) * 40)})`);
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0.1, Math.max(1, dur)));
          mg.setAttribute('transform', `translate(${f1(FOC[0])} ${f1(FOC[1])}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);
          shadow.setAttribute('d', inkLoop(sheetPts.map(q => [q[0] + 10, q[1] + 12]), { seed: sd + 1, t, smooth: false }));
          sheetF.setAttribute('d', inkLoop(sheetPts, { seed: sd + 2, t, smooth: false, amp: 1.2 }));
          sheetR.setAttribute('d', inkPath(sheetPts, { seed: sd + 2, t, closed: true, w: 4, smooth: false, amp: 1.2 }));
          // land hatching
          let hd = '';
          for (let i = 0; i < 22; i++) { const u = 0.02 + i * 0.047, v1 = 0.06 + (i % 3) * 0.035; const a = X([u, v1]); hd += inkPath([a, [a[0] + 26, a[1] + 18]], { seed: sd + 10 + i, t, w: 2.5 }) + ' '; }
          for (let i = 0; i < 22; i++) { const u = 0.02 + i * 0.047, v1 = 0.93 + (i % 3) * 0.025; if (u > 0.22 && u < 0.6) continue; const a = X([u, v1 - (u > 0.7 ? 0.2 : 0)]); hd += inkPath([a, [a[0] + 26, a[1] + 18]], { seed: sd + 40 + i, t, w: 2.5 }) + ' '; }
          landH.setAttribute('d', hd);
          const WP = [...NORTH, ...SOUTH].map(X);
          waterF.setAttribute('d', inkLoop(WP, { seed: sd + 3, t, amp: 1.4 }));
          coast.setAttribute('d', inkPath(NORTH.map(X), { seed: sd + 4, t, w: 4 }) + ' ' + inkPath(SOUTH.map(X), { seed: sd + 5, t, w: 4 }));
          let wd = '';
          [[0.12, 0.33], [0.3, 0.6], [0.8, 0.45], [0.92, 0.5], [0.08, 0.64], [0.45, 0.32]].forEach(([u, v], i) => {
            const [x0, y0] = X([u, v]), dx = Math.sin(t * 0.8 + i) * 8, w = [];
            for (let j = 0; j <= 6; j++) w.push([x0 - 30 + j * 10 + dx, y0 + Math.sin(j * 1.6) * 5]);
            wd += inkPath(w, { seed: sd + 60 + i, t, w: 2.6 }) + ' ';
          });
          waves.setAttribute('d', wd);
          // old Ottoman mine lines at the narrows (across the strait)
          let od = '';
          for (const u of [0.8, 0.86, 0.92]) for (let j = 0; j < 7; j++) { const v = lerp(0.34, 0.6, (j + 0.5) / 7) + (u - 0.8) * 0.05; const [x, y] = X([u, v]); od += inkDot(x, y, 5, 5, sd + 70 + j + u * 100, t) + ' '; }
          oldMines.setAttribute('d', od);
          // channel band
          if (ch) {
            const at = atOr(cues, ch.at || 'channel', 0.2), p = prog(lt, at, 0.8);
            const top = [[-0.1, 0.375], [0.3, 0.375], [0.6, 0.39], [0.74, 0.41]].map(X), bot = [[0.74, 0.54], [0.6, 0.545], [0.3, 0.54], [-0.1, 0.54]].map(X);
            const cut = S.x + (0.74 * S.w + 140) * p - 120;
            const clipX = q => [Math.min(q[0], cut), q[1]];
            chF.setAttribute('d', inkLoop([...top, ...bot].map(clipX), { seed: sd + 80, t, smooth: false }));
            chF.setAttribute('fill-opacity', f1(0.2 * clamp01(p * 3) * 100) / 100);
            chE[0].setAttribute('d', 'M' + top.map(clipX).map(q => f1(q[0]) + ' ' + f1(q[1])).join(' L'));
            chE[1].setAttribute('d', 'M' + bot.map(clipX).map(q => f1(q[0]) + ' ' + f1(q[1])).join(' L'));
            chE.forEach(e => { e.setAttribute('stroke-dashoffset', f1(-t * 18)); e.style.opacity = clamp01(p * 3); });
          }
          // route
          let rAt = 0, rDur = 3;
          if (rt) {
            rAt = atOr(cues, rt.at || 'route', 0.3); rDur = rt.dur ?? 3;
            const p = prog(lt, rAt, rDur), d = p * RL;
            let i = 0; while (i < RC.length - 1 && RC[i] < d) i++;
            const pts = RD.slice(0, Math.max(2, i + 1));
            routeP.setAttribute('d', p > 0.002 ? 'M' + pts.map(q => f1(q[0]) + ' ' + f1(q[1])).join(' L') : '');
            routeP.setAttribute('stroke-dashoffset', f1(-t * 12));
            if (p > 0.97) {
              const e = RD[RD.length - 1], b = RD[RD.length - 4], ea = Math.atan2(e[1] - b[1], e[0] - b[0]);
              routeHead.setAttribute('d', inkPath([[e[0] - 34 * Math.cos(ea - 0.55), e[1] - 34 * Math.sin(ea - 0.55)], e, [e[0] - 34 * Math.cos(ea + 0.55), e[1] - 34 * Math.sin(ea + 0.55)]], { seed: sd + 90, t, w: 7, smooth: false }));
            } else routeHead.setAttribute('d', '');
          }
          // mines
          if (mn) {
            const at = mn.at != null ? atOr(cues, mn.at, 0) : -5, md = mn.dur ?? 1.6;
            mineDots.forEach((m, i) => {
              const p = spring(lt, at + i / 26 * md, 0.35), r = 9 * p;
              const [x, y] = m.q, bob = Math.sin(t * 1.4 + i) * 1.2;
              m.n.setAttribute('d', p > 0.02 ? inkDot(x, y + bob, r, r, sd + 100 + i, t) : '');
              let hh = '';
              if (p > 0.5) for (let k = 0; k < 4; k++) { const a = k * 1.5708 + 0.78; hh += inkPath([[x + Math.cos(a) * r * 0.8, y + bob + Math.sin(a) * r * 0.8], [x + Math.cos(a) * r * 1.6, y + bob + Math.sin(a) * r * 1.6]], { seed: sd + 130 + i * 4 + k, t, w: 3 }) + ' '; }
              m.h.setAttribute('d', hh);
            });
          }
          // parallel arrow along the row (on the water side)
          if (parG) {
            const at = atOr(cues, P.parallel.at || 'parallel', dur * 0.5), p = prog(lt, at, 0.8);
            const off = RW.map((q, i) => { const a = RW[Math.max(0, i - 1)], b = RW[Math.min(RW.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [q[0] + dy / l * 34, q[1] - dx / l * 34]; });
            const n = Math.max(2, Math.round(off.length * p)), sub = off.slice(0, n);
            let d = p > 0.02 ? inkPath(sub, { seed: sd + 150, t, w: 6 }) : '';
            const head = (e, b) => { const ea = Math.atan2(e[1] - b[1], e[0] - b[0]); return inkPath([[e[0] - 26 * Math.cos(ea - 0.6), e[1] - 26 * Math.sin(ea - 0.6)], e, [e[0] - 26 * Math.cos(ea + 0.6), e[1] - 26 * Math.sin(ea + 0.6)]], { seed: sd + 151, t, w: 6, smooth: false }); };
            if (p > 0.98) d += ' ' + head(off[off.length - 1], off[off.length - 4]) + ' ' + head(off[0], off[3]);
            parG.setAttribute('d', d);
          }
          // ship along the loop
          const boomAt = P.boom != null ? atOr(cues, P.boom, null) : null;
          let sp = null, sang = 0, op = 1;
          {
            const shipAt = rt ? rAt : 0.2;
            let d;
            if (boomAt != null) d = lerp(0, hitD, clamp01((lt - shipAt) / Math.max(0.4, boomAt - shipAt)));
            else d = rt ? clamp01((lt - shipAt) / rDur) * RL : ((lt * 90) % RL);
            const a = along(RD, RC, d); sp = a.p; sang = a.ang;
            if (boomAt != null && lt >= boomAt && P.drift) {
              const dAt = atOr(cues, P.drift.at || 'drift', boomAt + 0.6), e = Math.max(0, lt - dAt);
              sp = [sp[0] - e * 34, sp[1] - e * 6]; sang += smooth(e / 3) * 1.2 + Math.sin(t * 0.7) * 0.06;
            }
            if (boomAt != null && lt >= boomAt && !P.drift && P.sink) op = clamp01(1 - (lt - boomAt - 1.2) / 1.5);
            const L = 40, Wd = 11;
            const hull = [[-L, 0], [-L * 0.8, -Wd], [L * 0.5, -Wd], [L * 1.15, 0], [L * 0.5, Wd], [-L * 0.8, Wd]];
            shipG.setAttribute('transform', `translate(${f1(sp[0])} ${f1(sp[1])}) rotate(${f1(sang * 180 / Math.PI)})`);
            shipG.style.opacity = f1(clamp01(op) * 100) / 100;
            shipF.setAttribute('d', inkLoop(hull, { seed: sd + 200, t, amp: 0.8 }));
            shipR.setAttribute('d', inkPath(hull, { seed: sd + 200, t, w: 4, closed: true, amp: 0.8 }));
            shipD.setAttribute('d', inkDot(-6, 0, 5, 5, sd + 201, t) + ' ' + inkDot(10, 0, 5, 5, sd + 202, t) + ' ' + inkPath([[22, 0], [44, 0]], { seed: sd + 203, t, w: 4 }));
            const moving = !(boomAt != null && lt >= boomAt) || P.drift;
            if (moving && op > 0.5) {
              const c = Math.cos(sang), s = Math.sin(sang);
              const w1 = [[-L - 6, -8], [-L - 60, -24]], w2 = [[-L - 6, 8], [-L - 60, 24]];
              const tr = q => [sp[0] + q[0] * c - q[1] * s, sp[1] + q[0] * s + q[1] * c];
              wake.setAttribute('d', inkPath(w1.map(tr), { seed: sd + 210, t, w: 3 }) + ' ' + inkPath(w2.map(tr), { seed: sd + 211, t, w: 3 }));
            } else wake.setAttribute('d', '');
          }
          // boom
          if (boomAt != null && lt >= boomAt) {
            const e = lt - boomAt, bp = along(RD, RC, hitD + 30).p, fl = clamp01(1 - (e - 0.4) / 0.8);
            const star = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, r = (i % 2 ? 22 : 64) * (0.5 + 0.6 * spring(lt, boomAt, 0.3)); star.push([bp[0] + Math.cos(a) * r, bp[1] + Math.sin(a) * r]); }
            boomF.setAttribute('d', inkLoop(star, { seed: sd + 300, t, smooth: false })); boomF.setAttribute('fill-opacity', f1(fl * 0.95 * 100) / 100);
            boomR.setAttribute('d', inkPath(star, { seed: sd + 300, t, w: 4, closed: true, smooth: false })); boomR.setAttribute('fill-opacity', f1(Math.max(fl, 0.0) * 100) / 100);
            const rp = ((e % 1.6) / 1.6);
            ring.setAttribute('d', inkCircle(bp[0], bp[1], 30 + rp * 70, sd + 310, t, { w: 5 })); ring.setAttribute('fill-opacity', f1((1 - rp) * 0.9 * 100) / 100);
          } else { boomF.setAttribute('fill-opacity', 0); boomR.setAttribute('fill-opacity', 0); ring.setAttribute('fill-opacity', 0); }
          // current arrow
          if (curG) {
            const at = atOr(cues, P.drift.at || 'drift', (boomAt ?? dur * 0.5) + 0.5), p = prog(lt, at, 0.8);
            const a0 = X([0.5, 0.6]), a1 = X([0.24, 0.6]), x1 = lerp(a0[0], a1[0], p), off = Math.sin(t * 3) * 4;
            const pts = []; for (let i = 0; i <= 8; i++) { const x = lerp(a0[0], x1, i / 8); pts.push([x, a0[1] + Math.sin(i * 1.3 + t * 2) * 6]); }
            let d = p > 0.02 ? inkPath(pts, { seed: sd + 400, t, w: 7 }) : '';
            if (p > 0.95) d += ' ' + inkPath([[x1 + 30, a0[1] - 24 + off], [x1, a0[1]], [x1 + 30, a0[1] + 24 + off]], { seed: sd + 401, t, w: 7, smooth: false });
            curG.setAttribute('d', d);
            if (curT) { curT.setAttribute('x', f1((a0[0] + a1[0]) / 2)); curT.setAttribute('y', f1(a0[1] - 26)); curT.style.opacity = clamp01((p - 0.4) * 3); }
          }
          labs.forEach(lb => {
            const L = lb.L, at = atOr(cues, L.at, 0.3 + lb.k * 0.2), p = spring(lt, at, 0.6), b = boil(sd + 500 + lb.k, t, 0.9);
            const [x, y] = X([L.u ?? 0.5, L.v ?? 0.5]);
            lb.t.style.opacity = clamp01(p * 2);
            lb.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${L.rot || 0}) scale(${lerp(0.6, 1, p).toFixed(3)})`);
          });
          // frame + compass (north up-left: the strait runs SW -> NE)
          frame.setAttribute('d', inkPath([[S.x + 16, S.y + 16], [S.x + S.w - 16, S.y + 16], [S.x + S.w - 16, S.y + S.h - 16], [S.x + 16, S.y + S.h - 16]], { seed: sd + 600, t, closed: true, w: 2.5, smooth: false, amp: 1.2 }));
          const ccx = S.x + S.w - 96, ccy = S.y + 110, R = 56, ca = (-45 + Math.sin(t * 0.6) * 4) * Math.PI / 180;
          const rotp = (x, y) => [ccx + x * Math.cos(ca) - y * Math.sin(ca), ccy + x * Math.sin(ca) + y * Math.cos(ca)];
          compF.setAttribute('d', inkCircle(ccx, ccy, R * 0.72, sd + 610, t, { fill: true }));
          compR.setAttribute('d', inkCircle(ccx, ccy, R * 0.72, sd + 610, t, { w: 3 }));
          compN.setAttribute('d', inkLoop([rotp(-12, 0), rotp(0, -R), rotp(12, 0)], { seed: sd + 611, t, smooth: false, amp: 0.8 }));
          compS.setAttribute('d', inkLoop([rotp(-12, 0), rotp(0, R), rotp(12, 0)], { seed: sd + 612, t, smooth: false, amp: 0.8 }));
          const np = rotp(0, -R - 26); compT.setAttribute('x', f1(np[0])); compT.setAttribute('y', f1(np[1] + 14));
          updKasif(kas, lt, t, cues, env, W, H, portrait);
        },
      };
    },
  };

  // ================================================================ nus_c_memorial
  SH.nus_c_memorial = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const HY = H * (portrait ? 0.42 : 0.4);
      const sea = inkEl(cam, C.paperLight), seaR = inkEl(cam, C.inkSoft), seaW = inkEl(cam, C.inkSoft, { 'fill-opacity': 0.6 });
      const sun = inkEl(cam, C.gold, { 'fill-opacity': 0.5 }), sunR = inkEl(cam, C.inkSoft);
      const gulls = inkEl(cam, C.ink);
      const hillF = inkEl(cam, C.paperDark), hillR = inkEl(cam, C.ink);
      const rows = P.rows ?? 3, per = P.per ?? 7;
      const stones = [];
      const groups = [[0.06, 0.4], [0.6, 0.94]];
      groups.forEach((gx, gi) => {
        for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
          const k = stones.length, sc = lerp(0.62, 1, r / Math.max(1, rows - 1));
          const x = lerp(gx[0], gx[1], (i + 0.5 + (r % 2) * 0.3) / (per + 0.3)) * W, y = lerp(HY + 150, H * 0.84, r / Math.max(1, rows - 1)) + Math.sin(i * 1.7 + gi) * 6;
          stones.push({ k, x, y, sc, gi, r, i, f: inkEl(cam, C.paperLight), o: inkEl(cam, C.ink) });
        }
      });
      const grass = inkEl(cam, C.green), pop = inkEl(cam, C.red), popC = inkEl(cam, C.ink);
      let lab = null;
      if (P.label) {
        const g = el(root, 'g'), box = inkEl(g, C.paperLight), boxR = inkEl(g, C.ink);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 72 : 66, 'text-anchor': 'middle', fill: C.ink });
        t.textContent = typeof P.label === 'string' ? P.label : P.label.text;
        lab = { g, box, boxR, t, L: typeof P.label === 'string' ? { text: P.label } : P.label };
      }
      const kas = makeKasif(root, Object.assign({ x: 0.5, y: 0.93, pose: 'idle', then: 'think', emotion: 'worried', scale: 0.66 }, P.kasif || {}), seed, portrait);
      if (kas) kas.rig_scale = () => kas.K.scale;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.3) * 5)} ${f1(Math.cos(t * 0.2) * 4)}) translate(${W / 2} ${H * 0.6}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-H * 0.6})`);
          const sp = [[-60, HY], [W + 60, HY], [W + 60, HY + 200], [-60, HY + 200]];
          sea.setAttribute('d', inkLoop(sp, { seed: sd + 1, t, smooth: false }));
          seaR.setAttribute('d', inkPath([[-60, HY], [W + 60, HY]], { seed: sd + 2, t, w: 3.5 }));
          let wd = '';
          for (let i = 0; i < 9; i++) { const x = ((i * 0.13 * (W + 200) + t * 14) % (W + 200)) - 100, y = HY + 30 + (i % 3) * 26, w = []; for (let j = 0; j <= 5; j++) w.push([x + j * 11, y + Math.sin(j * 1.6) * 4]); wd += inkPath(w, { seed: sd + 10 + i, t, w: 2.5 }) + ' '; }
          seaW.setAttribute('d', wd);
          const sx = W * 0.5, r = 70, spp = [];
          for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; spp.push([sx + Math.cos(a) * r, HY + 4 + Math.sin(a) * r]); }
          sun.setAttribute('d', inkLoop(spp, { seed: sd + 20, t }));
          sunR.setAttribute('d', inkPath(spp, { seed: sd + 20, t, w: 3, closed: true }));
          let gd = '';
          for (let i = 0; i < 3; i++) { const gx = W * (0.25 + i * 0.22) + Math.sin(t * 0.5 + i) * 40 + t * 12, gy = H * (0.14 + i * 0.05) + Math.sin(t * 0.8 + i * 2) * 10, fl = Math.sin(t * 5 + i) * 8; gd += inkPath([[gx - 26, gy + fl], [gx - 10, gy - 6], [gx, gy + 2], [gx + 10, gy - 6], [gx + 26, gy + fl]], { seed: sd + 30 + i, t, w: 3.5 }) + ' '; }
          gulls.setAttribute('d', gd);
          const hp = [[-60, HY + 70], [W * 0.2, HY + 40], [W * 0.45, HY + 90], [W * 0.7, HY + 50], [W + 60, HY + 80], [W + 60, H + 60], [-60, H + 60]];
          hillF.setAttribute('d', inkLoop(hp, { seed: sd + 40, t }));
          hillR.setAttribute('d', inkPath(hp.slice(0, 5), { seed: sd + 40, t, w: 5 }));
          const hitAt = atOr(cues, 'hit', dur * 0.6);
          stones.forEach(s => {
            const at = 0.2 + (s.r * per + s.i) / (rows * per) * Math.max(0.8, hitAt - 0.4) + s.gi * 0.12, p = spring(lt, at, 0.5);
            if (p < 0.02) { s.f.setAttribute('d', ''); s.o.setAttribute('d', ''); return; }
            const w = 34 * s.sc, h = 56 * s.sc * p, x = s.x, y = s.y;
            const pts = [[x - w / 2, y], [x - w / 2, y - h * 0.7], [x - w * 0.3, y - h * 0.95], [x, y - h], [x + w * 0.3, y - h * 0.95], [x + w / 2, y - h * 0.7], [x + w / 2, y]];
            s.f.setAttribute('d', inkLoop(pts, { seed: sd + 100 + s.k, t, amp: 0.8 }));
            s.o.setAttribute('d', inkPath(pts, { seed: sd + 100 + s.k, t, w: 3.5 * s.sc + 1, closed: true, amp: 0.8 }));
          });
          let grd = '', pd = '', pc = '';
          for (let i = 0; i < 34; i++) {
            const gx = (0.02 + ((i * 0.618) % 1) * 0.96) * W, gy = H * (0.6 + ((i * 0.37) % 1) * 0.3), sw = Math.sin(t * 1.6 + i) * 6;
            if (Math.abs(gx - W * 0.5) < 90 && gy > H * 0.75) continue;
            grd += inkPath([[gx, gy], [gx + sw, gy - 26]], { seed: sd + 300 + i, t, w: 3 }) + ' ';
            if (i % 3 === 0) { const px = gx + sw, py = gy - 30; pd += inkDot(px, py, 11, 9, sd + 400 + i, t) + ' '; pc += inkDot(px, py, 3.5, 3.5, sd + 450 + i, t) + ' '; }
          }
          grass.setAttribute('d', grd); pop.setAttribute('d', pd); popC.setAttribute('d', pc);
          if (lab) {
            const at = atOr(cues, lab.L.at || 'hit', hitAt), p = spring(lt, at, 0.6);
            const nx = W * (lab.L.x ?? 0.5), ny = H * (lab.L.y ?? 0.15), fs = portrait ? 72 : 66;
            const tw = lab.t.getComputedTextLength ? lab.t.getComputedTextLength() : 300;
            const bp = [[nx - tw / 2 - 26, ny - fs * 0.85], [nx + tw / 2 + 26, ny - fs * 0.88], [nx + tw / 2 + 28, ny + fs * 0.4], [nx - tw / 2 - 24, ny + fs * 0.43]];
            lab.box.setAttribute('d', inkLoop(bp, { seed: sd + 500, t, smooth: false }));
            lab.boxR.setAttribute('d', inkPath(bp, { seed: sd + 500, t, w: 4, closed: true, smooth: false }));
            lab.t.setAttribute('x', nx); lab.t.setAttribute('y', ny);
            lab.g.style.opacity = clamp01(p * 2.5);
            lab.g.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(-2 + (1 - p) * -6)}) scale(${lerp(0.7, 1, p).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
          }
          updKasif(kas, lt, t, cues, env, W, H, portrait);
        },
      };
    },
  };
})();
