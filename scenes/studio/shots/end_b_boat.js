// end_b_boat: the James Caird (≈ 7 m lifeboat, 1916) in parchment ink (theme "parchment", BRAND.md §5). Every line
// boils at 8 Hz through _ink.js; everything is a pure function of lt (no Math.random). Crew are KASIF rigs
// (bereted sailors, Kaşif with his hat) standing inside the boat group: the hull side is drawn over their legs.
//
//   end_b_boat
//     mode "build":   the boat on blocks on a rocky beach under Elephant Island's cliffs; the carpenter (beret, grey
//                     beard) hammers; on cue "planks" deck planks appear one by one, on cue "canvas" a stitched
//                     canvas cover spreads from bow to stern, cue "deck" punches the finished deck.
//     mode "sextant": open sea under heavy cloud; the navigator stands holding a sextant at the sun; clouds part on
//                     cue "sun", a tally of 4 suns + "4 kez" appears on cue "four"; on cue "miss" a small island
//                     shows on the horizon with a dashed course that misses it and a red cross.
//     mode "wave":    night; a white glow low on the horizon between dark clouds ("cloud?"); on cue "reveal" it rises
//                     into the foaming crest of a gigantic wave towering over the little boat; camera shakes.
//     mode "launch":  Elephant Island beach on the left, the decked boat in the shallows (boat.to/at/dur: it sails off);
//                     P.shore = bereted figures on the beach (world x 0..1, scale), P.kasif = Kaşif on the beach.
//   P: {mode, boat: {x: 0.4, scale: 1, y: 0.68 (sea level), to, at, dur}, beach: 0.4, sea: 26 (wave height px),
//       cast (alias crew): [{who: "kasif"|name, x (boat units, -280..280), pose, at, then, dir, face, emotion, beard, scale: 0.3,
//               tool: "sextant"|"hammer"|"axe"|null, swing: true (tool arm chops)}],
//       labels: [{text, x, y, at, size, color, font: "hand"|"serif", arrow: [x, y], strike: cue}],
//       zoom: 1.06, focus: [0.5, 0.55]}
//   cues: planks, canvas, deck, sun, four, miss, reveal, labels[].at, crew[].at
//
//   end_b_launch — alias of end_b_boat mode "launch".
//
//   end_b_deck — close-up of the decked boat in a gale: spray flies in and freezes, an ice crust grows on the deck,
//     gunwale and rigging (icicles), the boat heels under the weight; on cue "chip" the crew hack the ice off with
//     axes (chunks fly) and the boat rights itself.
//   P: {crew: [...as above], labels: [...], boat: {x: 0.5, scale: 2.1, y: 0.8}, sea: 30}   cues: chip, ice, labels[].at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const COL = { ink: I.ink, red: I.red, blue: I.blue, gold: I.gold, green: I.green, soft: I.inkSoft };
  const tcue = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);

  function painter(parent) {
    const els = []; let n = 0, T = 0;
    const get = () => { const e = els[n] || (els[n] = el(parent, 'path', { stroke: 'none' })); n++; e.style.display = ''; return e; };
    const P = {
      begin(t) { n = 0; T = t; },
      end() { for (let i = n; i < els.length; i++) els[i].style.display = 'none'; },
      fill(pts, col, k, o = {}) {
        const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkLoop(pts, { seed: k, t: T, amp: o.amp ?? 1.2, smooth: o.smooth !== false }));
      },
      line(pts, w, k, o = {}) {
        const e = get(); e.setAttribute('fill', o.col || I.ink); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false, taper: o.taper }));
      },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? o.op })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
    };
    return P;
  }
  const ell = (cx, cy, rx, ry, k, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, k, n, rot, 0.04);
  const tf = (pts, x, y, s = 1, a = 0) => { const c = Math.cos(a), si = Math.sin(a); return pts.map(q => [x + (q[0] * c - q[1] * si) * s, y + (q[0] * si + q[1] * c) * s]); };

  function labels(parent, list, seed) {
    return (list || []).map((L, i) => {
      const g = el(parent, 'g'), serif = L.font === 'serif', col = COL[L.color] || I.ink;
      const t = el(g, 'text', { 'font-family': serif ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-size': L.size || 64,
        'font-weight': serif ? 900 : 400, 'text-anchor': 'middle', fill: col,
        style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
      t.textContent = L.text;
      return { L, g, t, u: el(g, 'path', { fill: col, stroke: 'none' }), ar: L.arrow ? el(g, 'path', { fill: col, stroke: 'none' }) : null,
        strike: L.strike ? el(g, 'path', { fill: I.red, stroke: 'none' }) : null, k: seed * 13 + i * 7 };
    });
  }
  function drawLabels(ls, lt, t, cues, W, H) {
    for (const o of ls) {
      const L = o.L, at = tcue(L.at, cues, 0.2), sp = spring(lt, at, 0.6);
      const x = L.x * W, y = L.y * H, b = boil(o.k, t, 1);
      o.g.style.display = lt < at ? 'none' : '';
      if (lt < at) continue;
      const pk = punch(lt, at, 0.5);
      o.t.setAttribute('transform', `translate(${inkF1(x + b[0])} ${inkF1(y + b[1])}) rotate(${(L.rot ?? -2) + b[0] * 0.3}) scale(${(lerp(0.6, 1, sp) * (1 + 0.08 * pk)).toFixed(3)})`);
      const tw = o.t.getComputedTextLength ? o.t.getComputedTextLength() : 200, pu = prog(lt, at + 0.2, 0.45);
      o.u.setAttribute('d', pu > 0.02 ? inkPath([[x - tw / 2, y + 20], [x - tw / 2 + tw * pu * 0.5, y + 25], [x - tw / 2 + tw * pu, y + 18]], { w: 6, seed: o.k + 1, t }) : '');
      if (o.ar) {
        const tx = L.arrow[0] * W, ty = L.arrow[1] * H, inside = tx >= x - tw / 2 && tx <= x + tw / 2;
        const sx = inside ? x : tx < x ? x - tw / 2 - 14 : x + tw / 2 + 14, sy = inside ? (ty > y ? y + 40 : y - 70) : y - 20;
        const pa = prog(lt, at + 0.3, 0.45), mx = (sx + tx) / 2 + (tx > sx ? 30 : -30), my = Math.min(sy, ty) - 20;
        const q = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * pa; q.push([(1 - v) * (1 - v) * sx + 2 * v * (1 - v) * mx + v * v * tx, (1 - v) * (1 - v) * sy + 2 * v * (1 - v) * my + v * v * ty]); }
        let d = pa > 0.02 ? inkPath(q, { w: 6, seed: o.k + 2, t }) : '';
        if (pa > 0.95) { const e = q[10], f = q[8], an = Math.atan2(e[1] - f[1], e[0] - f[0]); d += ' ' + inkPath([[e[0] - 28 * Math.cos(an - 0.5), e[1] - 28 * Math.sin(an - 0.5)], e, [e[0] - 28 * Math.cos(an + 0.5), e[1] - 28 * Math.sin(an + 0.5)]], { w: 6, seed: o.k + 3, t, smooth: false }); }
        o.ar.setAttribute('d', d);
      }
      if (o.strike) {
        const ps = prog(lt, tcue(L.strike, cues, 1e9), 0.35);
        o.strike.setAttribute('d', ps > 0.02 ? inkPath([[x - tw / 2 - 12, y - 10], [x - tw / 2 - 12 + (tw + 24) * ps, y - 30]], { w: 9, seed: o.k + 4, t }) : '');
      }
    }
  }

  // ---------------------------------------------------------------- the boat (local units: L ≈ 600, waterline y = 0)
  const HULL = [[-300, -92], [-150, -86], [0, -84], [150, -90], [300, -114], [318, -72], [296, -12], [220, 28], [60, 44], [-120, 40], [-250, 20], [-296, -10], [-308, -50]];
  const gunY = x => x < 0 ? lerp(-84, -92, -x / 300) : x < 150 ? lerp(-84, -90, x / 150) : lerp(-90, -114, (x - 150) / 150);
  function hullBack(pt, T, k, o = {}) {      // masts, sails, rudder behind the crew
    if (o.rig !== false) {
      pt.line(T([[60, -86], [64, -420]]), 9, k + 1);
      pt.line(T([[-230, -90], [-226, -300]]), 7, k + 2);
      const furl = o.furl ?? 0;
      pt.shape(T([[70, -120], [72, lerp(-400, -160, furl)], [lerp(200, 110, furl), lerp(-372, -150, furl)], [lerp(230, 120, furl), -122]]), I.paperLight, 5, k + 3);
      pt.shape(T([[70, -396], [296, -120], [96, -130]]), I.paperLight, 4, k + 4);
      pt.shape(T([[-220, -112], [-218, -286], [-150, -266], [-140, -112]]), I.paperLight, 4, k + 5);
      pt.line(T([[64, -420], [312, -110]]), 2.5, k + 6, { col: I.inkSoft });
      pt.line(T([[64, -420], [-290, -96]]), 2.5, k + 7, { col: I.inkSoft });
    }
    pt.shape(T([[-300, -70], [-338, -60], [-334, 22], [-300, 12]]), I.paperDark, 5, k + 8);
  }
  function hullFront(pt, T, k, o = {}) {
    pt.shape(T(HULL), I.paperDark, 6, k + 10);
    [24, 50, 76].forEach((off, i) => {
      const pts = []; for (let x = -288 + off * 0.5; x <= 300 - off * 0.9; x += 70) pts.push([x, gunY(x) + off]);
      pt.line(T(pts), 3, k + 11 + i, { col: I.inkSoft });
    });
    const deck = o.deck ?? 1;
    if (deck > 0) {     // canvas deck from the bow aft
      const x0 = lerp(300, -300, deck), top = [], bot = [];
      for (let x = 300; x >= x0 - 1; x -= 30) { top.push([x, gunY(x) - 14 - Math.abs(Math.sin(x * 0.03)) * 5]); bot.push([x, gunY(x) + 2]); }
      if (top.length > 1) {
        pt.shape([...T(top), ...T(bot.reverse())], I.paperLight, 4, k + 20);
        for (let x = 280; x > x0 + 10; x -= 46) pt.line(T([[x, gunY(x) - 12], [x - 10, gunY(x) - 2]]), 2.5, k + 30 + Math.round(x), { col: I.inkSoft });
      }
    }
  }
  function sextant(pt, x, y, s, a, k) {       // a small sextant held at (x, y)
    const T = pts => tf(pts, x, y, s, a);
    pt.shape(T([[0, 0], [-34, 70], [34, 70]]), I.paperLight, 4, k, { smooth: false });
    const arc = []; for (let i = 0; i <= 8; i++) { const u = -0.5 + i / 8; arc.push([u * 76, 70 + Math.cos(u * 2) * 8]); }
    pt.line(T(arc), 5, k + 1, { col: I.gold });
    pt.line(T([[0, 0], [14, 72]]), 4, k + 2);
    pt.shape(T([[-8, -6], [-30, -18], [-26, -4]]), I.inkSoft, 3, k + 3, { smooth: false });
  }
  function tool(pt, kind, x, y, s, ang, k) {   // hammer / axe in a hand, ang = arm direction (rad, world)
    const T = pts => tf(pts, x, y, s, ang);
    if (kind === 'sextant') return sextant(pt, x, y, s * 0.9, 0, k);
    pt.line(T([[-10, 0], [90, 0]]), 8, k);
    if (kind === 'hammer') pt.shape(T([[80, -22], [104, -22], [104, 22], [80, 22]]), I.inkSoft, 4, k + 1, { smooth: false });
    else pt.shape(T([[72, -6], [86, -40], [112, -34], [104, 6]]), I.paperLight, 4, k + 1, { lc: I.ink });
  }
  // crew rigs inside a group (boat units); returns updaters
  function crewOf(parent, list, seed) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(parent, 'g'), { scale: m.scale || 0.3, hat: isK, accessory: isK ? null : (m.accessory || 'beret'), beard: isK ? null : (m.beard || null), seed: seed + i * 7 + (isK ? 0 : 11) });
      return { m, rig };
    });
  }
  function crewUpdate(crew, lt, t, cues, foot, extra = () => ({})) {
    return crew.map(({ m, rig }, i) => {
      const st = [{ at: -1e9, pose: m.pose || 'idle', dir: m.dir ?? 20, face: m.face ?? 1, emotion: m.emotion0 || 'neutral' }];
      if (m.at != null) st.push({ at: tcue(m.at, cues, 1e9), pose: m.then || m.pose || 'idle', dir: m.dir_then ?? m.dir ?? 20, face: m.face_then ?? m.face ?? 1, emotion: m.emotion || 'neutral' });
      for (const s of m.seq || []) st.push({ at: tcue(s.at, cues, 1e9), pose: s.pose, dir: s.dir ?? m.dir ?? 20, face: s.face ?? m.face ?? 1, emotion: s.emotion || 'neutral' });
      st.sort((a, b) => a.at - b.at);
      let k = 0; while (k + 1 < st.length && lt >= st[k + 1].at) k++;
      const c = st[k], pv = st[k - 1], since = k ? lt - c.at : lt;
      let pose = c.pose, dir = c.dir;
      const sw = (m.swing === true || (m.swing && lt >= tcue(m.swing, cues, 1e9))) ? 0.5 + 0.5 * Math.sin(lt * (m.rate || 7) + i) : null;
      if (sw != null) { pose = 'point'; dir = lerp(m.up ?? 50, m.down ?? -40, sw * sw); }
      const o = Object.assign({ x: m.x || 0, y: m.y ?? foot, face: c.face, since, dir, emotion: c.emotion, ph: lt / 0.9 }, extra(i, m));
      if (pv && since < 0.3 && sw == null) { o.prev = { pose: pv.pose, since: k > 1 ? c.at - pv.at : c.at, dir: pv.dir, emotion: pv.emotion }; o.mix = since / 0.3; }
      const res = rig.update(t, pose, o);
      const s = (m.scale || 0.3), hand = res.hands[1];
      return { m, x: o.x + o.face * s * hand[0], y: o.y + s * hand[1], face: o.face, dir, sw, s };
    });
  }
  // sea: surface height at x
  const seaY = (x, lt, yb, A) => yb + A * (0.62 * Math.sin(x * 0.0055 - lt * 1.25) + 0.38 * Math.sin(x * 0.013 + lt * 0.85 + 1));
  function seaBack(pt, W, H, hy, yb, k) {
    pt.shape([[-60, hy], [W + 60, hy], [W + 60, H + 40], [-60, H + 40]], I.paperDark, 3, k, { smooth: false, lc: I.inkSoft });
  }
  function seaFront(pt, W, H, lt, yb, A, k, o = {}) {
    const top = []; for (let x = -60; x <= W + 60; x += 32) top.push([x, seaY(x, lt, yb, A)]);
    pt.fill([...top, [W + 60, H + 40], [-60, H + 40]], I.paperDark, k, { smooth: false, amp: 0.8 });
    pt.line(top, 6, k + 1, { amp: 1 });
    for (let r = 0; r < 5; r++) for (let j = 0; j < 7; j++) {
      const x = ((j * 300 + r * 140 + lt * (20 + r * 6)) % (W + 300)) - 150, y = seaY(x, lt, yb, A) + 34 + r * 46;
      pt.line([[x, y], [x + 18, y - 7], [x + 36, y], [x + 54, y - 7]], 3, k + 10 + r * 10 + j, { col: I.inkSoft, amp: 0.7 });
    }
    if (o.foam) for (let j = 0; j < 9; j++) {
      const x = ((j * 230 + lt * 40) % (W + 200)) - 100, y = seaY(x, lt, yb, A);
      pt.line([[x - 30, y - 4], [x - 10, y - 14], [x + 10, y - 8]], 3.5, k + 100 + j, { col: I.paperLight, amp: 0.8 });
    }
  }
  function nightSky(pt, W, hy, seed, lt) {
    const r = rng(seed * 3 + 1);
    for (let i = 0; i < 70; i++) {
      const x = W * (0.24 + r() * 0.8), y = 30 + r() * (hy - 40), L = 60 + r() * 100;
      pt.line([[x, y], [x - L * 0.55, y + L * 0.5]], 2.6, seed * 7 + i, { col: I.inkSoft, op: 0.6, amp: 0.8 });
    }
  }
  function cloudBank(pt, cx, cy, w, h, k, col, lc) {
    const pts = [[cx - w / 2, cy + h / 2]];
    const n = 7; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([cx - w / 2 + u * w, cy - h / 2 + Math.abs(Math.sin(u * 9.1 + k)) * h * 0.35 - (Math.sin(u * Math.PI)) * h * 0.25]); }
    pts.push([cx + w / 2, cy + h / 2]);
    pt.shape(pts, col, 4, k, { lc: lc || I.inkSoft });
    for (let j = 0; j < 5; j++) { const x = cx - w * 0.35 + j * w * 0.17; pt.line([[x, cy + h * 0.3], [x + 40, cy + h * 0.1]], 2.5, k + 20 + j, { col: I.inkSoft, op: 0.8 }); }
  }

  // ---------------------------------------------------------------- end_b_boat
  SH.end_b_boat = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'sextant';
      const Bt = Object.assign({ x: 0.4, scale: 1, y: 0.68 }, P.boat || {});
      const root = el(svg, 'g');
      const back = painter(el(root, 'g'));
      const boatG = el(root, 'g');
      const bBack = painter(el(boatG, 'g')), crewG = el(boatG, 'g'), bFront = painter(el(boatG, 'g'));
      const midP = painter(el(root, 'g'));
      const worldCast = el(root, 'g');
      const front = painter(el(root, 'g'));
      const LS = labels(el(svg, 'g'), P.labels, seed);
      const crew = crewOf(mode === 'build' ? worldCast : crewG, P.cast || P.crew, seed);
      const shore = mode === 'launch' ? crewOf(worldCast, [...(P.shore || []), ...(P.kasif ? [Object.assign({ who: 'kasif' }, P.kasif)] : [])], seed + 300) : [];
      const hy = (P.horizon ?? 0.5) * H, yb = Bt.y * H, A = P.sea ?? (mode === 'build' ? 0 : 26);
      const r = rng(seed * 17 + 5);
      const rocks = []; for (let i = 0; i < 12; i++) rocks.push([r() * W, H * (0.8 + r() * 0.12), 18 + r() * 30]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const aR = cue(cues, 'reveal', 1e9), rv = mode === 'wave' ? progIO(lt, aR, 1.7) : 0;
          const shake = mode === 'wave' && lt > aR ? Math.exp(-(lt - aR) * 1.2) * 7 : 0;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.06 * rv);
          const fx = (P.focus ? P.focus[0] : 0.5) * W, fy = (P.focus ? P.focus[1] : 0.55) * H;
          root.setAttribute('transform', `translate(${inkF1(Math.sin(lt * 0.35) * 6 + Math.sin(t * 31) * shake)} ${inkF1(Math.cos(lt * 0.27) * 4 + Math.cos(t * 27) * shake)}) translate(${fx} ${fy}) scale(${z.toFixed(4)}) translate(${-fx} ${-fy})`);
          for (const p of [back, bBack, bFront, midP, front]) p.begin(t);
          const bx = (Bt.to != null ? lerp(Bt.x, Bt.to, progIO(lt, tcue(Bt.at, cues, 0), Bt.dur || Math.max(1, dur))) : Bt.x) * W, s = Bt.scale;
          let by, ang;
          if (mode === 'build') {
            // sea on the left, Elephant Island cliffs + glacier on the right, pebble beach
            back.line([[-40, hy], [W * 0.5, hy]], 4, seed + 1, { col: I.inkSoft });
            for (let j = 0; j < 5; j++) { const x = 60 + j * 170 + Math.sin(lt * 0.6 + j) * 14, y = hy + 26 + (j % 2) * 30; back.line([[x, y], [x + 20, y - 6], [x + 40, y]], 3, seed + 10 + j, { col: I.inkSoft }); }
            const cl = [[W * 0.42, hy + 20], [W * 0.5, H * 0.3], [W * 0.56, H * 0.24], [W * 0.62, H * 0.3], [W * 0.7, H * 0.16], [W * 0.78, H * 0.22], [W * 0.86, H * 0.12], [W * 0.95, H * 0.2], [W + 60, H * 0.18], [W + 60, hy + 40]];
            back.shape(cl, I.paperDark, 5, seed + 20, { smooth: false });
            back.shape([[W * 0.66, H * 0.27], [W * 0.7, H * 0.19], [W * 0.75, H * 0.22], [W * 0.8, hy + 36], [W * 0.6, hy + 36]], I.paperLight, 4, seed + 21, { lc: I.inkSoft, smooth: false });
            for (let j = 0; j < 8; j++) { const x = W * (0.46 + j * 0.065), y = H * (0.36 + (j % 3) * 0.05); back.line([[x, y], [x - 30, y + 60]], 3, seed + 30 + j, { col: I.inkSoft }); }
            back.shape([[-60, H * 0.72], [W * 0.3, H * 0.7], [W * 0.7, H * 0.72], [W + 60, H * 0.7], [W + 60, H + 40], [-60, H + 40]], I.paperLight, 4, seed + 40, { lc: I.inkSoft });
            rocks.forEach(([x, y, q], i) => back.shape(ell(x, y, q, q * 0.6, seed + 50 + i, 9), I.paperDark, 3, seed + 50 + i, { lc: I.inkSoft }));
            by = H * 0.79 - 44 * s; ang = -0.03;
            [-150, 150].forEach((xx, i) => back.shape([[bx + xx * s - 40, H * 0.8], [bx + xx * s - 36, by + 30 * s], [bx + xx * s + 40, by + 30 * s], [bx + xx * s + 44, H * 0.8]], I.inkSoft, 4, seed + 60 + i, { smooth: false }));
          } else {
            if (mode === 'wave') nightSky(back, W, hy, seed, lt);
            if (mode === 'launch') {     // Elephant Island cliffs + glacier on the left, low clouds
              const cl = [[-60, hy + 40], [-60, H * 0.34], [W * 0.06, H * 0.27], [W * 0.14, H * 0.32], [W * 0.22, H * 0.22], [W * 0.3, H * 0.28], [W * 0.38, H * 0.34], [W * 0.46, hy + 20]];
              back.shape(cl, I.paperDark, 5, seed + 20, { smooth: false });
              back.shape([[W * 0.17, H * 0.3], [W * 0.22, H * 0.24], [W * 0.27, H * 0.28], [W * 0.31, hy + 30], [W * 0.12, hy + 30]], I.paperLight, 4, seed + 21, { lc: I.inkSoft, smooth: false });
              for (let j = 0; j < 6; j++) { const x = W * (0.03 + j * 0.07), y = H * (0.3 + (j % 3) * 0.05); back.line([[x, y], [x - 30, y + 60]], 3, seed + 30 + j, { col: I.inkSoft }); }
              cloudBank(back, W * 0.7 + lt * 8, H * 0.14, 460, 110, seed + 150, I.paperLight);
            }
            // horizon + back sea
            seaBack(back, W, H, hy, yb, seed + 70);
            for (let j = 0; j < 6; j++) { const x = ((j * 340 + lt * 14) % (W + 200)) - 100, y = hy + 16 + (j % 3) * 22; back.line([[x, y], [x + 22, y - 6], [x + 44, y]], 3, seed + 80 + j, { col: I.inkSoft }); }
            const y0 = seaY(bx, lt, yb, A), yl = seaY(bx - 200 * s, lt, yb, A), yr = seaY(bx + 200 * s, lt, yb, A);
            by = y0 - 6 * s; ang = Math.atan2(yr - yl, 400 * s) * 0.8;
            if (mode === 'wave') ang -= 0.2 * rv;
          }
          if (mode === 'sextant') {
            // sun behind clouds that part on "sun"
            const aS = cue(cues, 'sun', 1e9), op = progIO(lt, aS, 1.1);
            const sx = W * 0.74, sy = H * 0.2;
            back.shape(ell(sx, sy, 52, 52, seed + 90), I.paperLight, 6, seed + 90, { lc: I.gold });
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + lt * 0.2, r1 = 96 + 10 * Math.sin(lt * 4 + k) * op; back.line([[sx + Math.cos(a) * 68, sy + Math.sin(a) * 68], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], 5, seed + 91 + k, { col: I.gold, amp: 0.6 }); }
            cloudBank(back, sx - 120 - op * 160 + Math.sin(lt * 0.5) * 10, sy + 10, 360, 150, seed + 110, I.paperLight);
            cloudBank(back, sx + 140 + op * 170 + Math.sin(lt * 0.4) * 10, sy - 6, 380, 160, seed + 130, I.paperLight);
            cloudBank(back, W * 0.42 + lt * 6, H * 0.14, 420, 120, seed + 150, I.paperLight);
            // tally of four suns + "4 kez"
            const aF = cue(cues, 'four', 1e9);
            for (let q = 0; q < 4; q++) {
              const at = aF + q * 0.22, p = spring(lt, at, 0.5);
              if (lt < at) continue;
              const tx = W * (0.52 + q * 0.055), ty = H * 0.42;
              back.shape(ell(tx, ty, 20 * p, 20 * p, seed + 170 + q), I.gold, 4, seed + 170 + q);
              for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; back.line([[tx + Math.cos(a) * 28 * p, ty + Math.sin(a) * 28 * p], [tx + Math.cos(a) * 38 * p, ty + Math.sin(a) * 38 * p]], 3, seed + 180 + q * 9 + k, { col: I.gold, amp: 0.5 }); }
            }
            // missed island
            const aM = cue(cues, 'miss', 1e9);
            if (lt >= aM) {
              const p = spring(lt, aM, 0.6), ix = W * 0.84;
              back.shape([[ix - 90, hy + 2], [ix - 50, hy - 40 * p], [ix - 10, hy - 26 * p], [ix + 30, hy - 56 * p], [ix + 90, hy + 2]], I.paperLight, 4, seed + 200, { lc: I.ink });
            }
          }
          if (mode === 'wave') {
            // dark cloud banks with a pale gap low on the right, then the wave
            cloudBank(back, W * 0.5, H * 0.2, 560, 170, seed + 220, I.paperDark);
            cloudBank(back, W * 0.86, H * 0.24, 520, 180, seed + 240, I.paperDark);
            const h = lerp(0.06 * H, yb - 0.08 * H, rv);
            const base = yb + 40, X = u => u * W, Y = v => yb - v * h;
            const body = [[X(0.42), base], [X(0.47), Y(0.12)], [X(0.52), Y(0.42)], [X(0.55), Y(0.68)], [X(0.53), Y(0.8)], [X(0.5), Y(0.82)],
              [X(0.53), Y(0.94)], [X(0.59), Y(1)], [X(0.67), Y(0.97)], [X(0.78), Y(0.8)], [X(0.9), Y(0.62)], [X(1.04), Y(0.52)], [X(1.04), base]];
            if (rv <= 0.001) body.splice(4, 3);          // no curl while it is only a glow on the horizon
            back.shape(body, I.paperDark, 5, seed + 260, { lc: I.ink });
            for (let j = 0; j < 10; j++) {               // face hatching
              const u = 0.5 + j * 0.05, top = Y(Math.max(0.2, 0.95 - j * 0.04)), sw = Math.sin(lt * 2 + j) * 6;
              back.line([[X(u) + sw, top + 30], [X(u) - 20 + sw, top + h * 0.35], [X(u) - 10, Math.min(base - 20, top + h * 0.7)]], 3, seed + 270 + j, { col: I.inkSoft, op: 0.9 });
            }
            // the "white glow" = the foaming crest
            const crest = [[X(0.47), Y(0.84)], [X(0.52), Y(0.95)], [X(0.59), Y(1.02)], [X(0.67), Y(0.99)], [X(0.78), Y(0.82)], [X(0.9), Y(0.64)], [X(1.02), Y(0.55)]];
            back.line(rv > 0.001 ? crest : crest.slice(1), lerp(30, 24, rv), seed + 290, { col: I.paperLight, amp: 2 });
            for (let j = 0; j < 14; j++) { const u = 0.5 + j * 0.037 + Math.sin(lt * 1.5 + j) * 0.004, v = 1.05 + 0.06 * Math.sin(j * 2.3 + lt * 3); back.dot(X(u), Y(v - (u - 0.6) * (u - 0.6) * 2.4), 6 + (j % 3) * 3, I.paperLight, seed + 300 + j); }
            if (rv > 0.3) for (let j = 0; j < 8; j++) { const u = ((lt * 0.5 + j / 8) % 1); back.dot(X(0.5) - u * 140 + j * 8, Y(0.8) + u * h * 0.5, 7, I.paperLight, seed + 320 + j); }
          }
          // boat group
          boatG.setAttribute('transform', `translate(${inkF1(bx)} ${inkF1(by)}) rotate(${(ang * 180 / Math.PI).toFixed(2)}) scale(${s})`);
          const T = pts => pts;
          const aP = cue(cues, 'planks', 1e9), aC = cue(cues, 'canvas', 1e9), aD = cue(cues, 'deck', 1e9);
          hullBack(bBack, T, seed * 10, { rig: mode !== 'build', furl: mode === 'wave' ? 0.6 : 0 });
          const hands = crewUpdate(crew, lt, t, cues, mode === 'build' ? H * 0.8 : -36, (i, m) => mode === 'build' ? { x: m.x * W } : {});
          hands.forEach((h, i) => { if (h.m.tool) tool(mode === 'build' ? front : bFront, h.m.tool, h.x, h.y, mode === 'build' ? 0.9 : 1 / s * 0.9, h.m.tool === 'sextant' ? 0 : (-h.dir * Math.PI / 180) * h.face + (h.face < 0 ? Math.PI : 0), seed * 20 + i * 10); });
          let deck = 1;
          if (mode === 'build') {
            deck = progIO(lt, aC, 2.2);
            hullFront(bFront, T, seed * 10, { deck });
            const pkD = punch(lt, aD, 0.6);
            for (let q = 0; q < 6; q++) {              // planks laid one by one, stern to bow
              const at = aP + q * 0.32; if (lt < at) continue;
              const x0 = -270 + q * 92, x1 = x0 + 80, p = spring(lt, at, 0.5), lift = (1 - p) * -40 - pkD * 8;
              bFront.shape([[x0, gunY(x0) - 16 + lift], [x1, gunY(x1) - 16 + lift], [x1, gunY(x1) - 4 + lift], [x0, gunY(x0) - 4 + lift]], I.paperDark, 3, seed + 400 + q, { smooth: false });
            }
            if (lt >= aC) hullFront(bFront, T, seed * 10 + 5, { deck });   // canvas over the planks
            // hammer blows: tick marks where the hammer lands
            hands.forEach((h, i) => { if (h.m.tool === 'hammer' && h.sw != null && h.sw > 0.85) { front.line([[h.x - 70, h.y + 10], [h.x - 100, h.y - 20]], 4, seed + 420 + i); front.line([[h.x - 60, h.y - 10], [h.x - 70, h.y - 50]], 4, seed + 425 + i); } });
          } else hullFront(bFront, T, seed * 10, { deck: 1 });
          if (mode === 'launch') {
            seaFront(midP, W, H, lt, yb, A, seed + 500, { foam: true });
            const bw = (P.beach ?? 0.4) * W;
            midP.shape([[-60, H * 0.75], [bw * 0.75, H * 0.76], [bw, H * 0.8], [bw * 1.12, H + 40], [-60, H + 40]], I.paperLight, 5, seed + 520, { lc: I.inkSoft });
            rocks.forEach(([x, y, q], i) => { if (x < bw * 0.9) midP.shape(ell(x, Math.max(y, H * 0.86), q, q * 0.6, seed + 530 + i, 9), I.paperDark, 3, seed + 530 + i, { lc: I.inkSoft }); });
            crewUpdate(shore, lt, t, cues, H * 0.82, (i, m) => ({ x: m.x * W, y: (m.y ?? 0.82) * H }));
          } else if (mode !== 'build') seaFront(front, W, H, lt, yb, A, seed + 500, { foam: mode !== 'sextant' });
          if (mode === 'sextant') {
            const aM = cue(cues, 'miss', 1e9);
            if (lt >= aM) {      // dashed course from the bow that runs past the island
              const p = progIO(lt, aM + 0.2, 1.2), b0 = tf([[320, -100]], bx, by, s, ang)[0];
              const pts = []; for (let i = 0; i <= 24 * p; i++) { const u = i / 24; pts.push([lerp(b0[0], W * 0.97, u), lerp(b0[1], hy - 70, u) - Math.sin(u * Math.PI) * 120]); }
              for (let i = 0; i + 1 < pts.length; i += 2) front.line([pts[i], pts[i + 1]], 6, seed + 600 + i, { col: I.red, amp: 0.8 });
              if (p > 0.98) { const c = prog(lt, aM + 1.4, 0.3), ex = W * 0.95, ey = hy - 110; front.line([[ex - 26, ey - 26], [ex - 26 + 52 * c, ey - 26 + 52 * c]], 9, seed + 650, { col: I.red }); front.line([[ex + 26, ey - 26], [ex + 26 - 52 * c, ey - 26 + 52 * c]], 9, seed + 651, { col: I.red }); }
            }
          }
          for (const p of [back, bBack, bFront, midP, front]) p.end();
          drawLabels(LS, lt, t, cues, W, H);
        },
      };
    },
  };

  // end_b_launch: end_b_boat in mode "launch" (the boat leaves Elephant Island's beach); own name so a
  // build -> launch -> launch -> sextant run stays varied for the sequence rules.
  SH.end_b_launch = { kind: '2d', build(ctx) { return SH.end_b_boat.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'launch' }) })); } };

  // ---------------------------------------------------------------- end_b_deck
  SH.end_b_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const Bt = Object.assign({ x: 0.5, scale: 2.1, y: 0.82 }, P.boat || {});
      const root = el(svg, 'g');
      const back = painter(el(root, 'g'));
      const boatG = el(root, 'g');
      const bBack = painter(el(boatG, 'g')), crewG = el(boatG, 'g'), bFront = painter(el(boatG, 'g'));
      const front = painter(el(root, 'g'));
      const LS = labels(el(svg, 'g'), P.labels, seed);
      const crew = crewOf(crewG, P.cast || P.crew, seed);
      const hy = 0.36 * H, yb = Bt.y * H, A = P.sea ?? 30;
      const r = rng(seed * 23 + 1);
      const drops = []; for (let i = 0; i < 26; i++) drops.push([r(), -260 + r() * 520, r()]);
      const icicles = []; for (let i = 0; i < 16; i++) icicles.push([-280 + i * 36 + r() * 10, 18 + r() * 34]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const aC = cue(cues, 'chip', dur * 0.55), aI = cue(cues, 'ice', 0.3);
          const grow = prog(lt, 0, Math.max(0.5, aC)) * 0.7 + 0.3 * prog(lt, aI, 0.6);
          const ice = Math.max(0, grow - 0.85 * progIO(lt, aC + 0.3, Math.max(1, dur - aC - 0.4)));
          const z = lerp(1, P.zoom ?? 1.04, progIO(lt, 0, Math.max(1, dur)));
          root.setAttribute('transform', `translate(${inkF1(Math.sin(lt * 0.35) * 6)} ${inkF1(Math.cos(lt * 0.27) * 4)}) translate(${W / 2} ${H * 0.55}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-H * 0.55})`);
          for (const p of [back, bBack, bFront, front]) p.begin(t);
          // grey gale sky: slanted hatching + low clouds
          for (let i = 0; i < 40; i++) { const x = ((i * 97) % W) + 260, y = 40 + ((i * 53) % Math.round(hy - 60)), L = 80; back.line([[x, y], [x - L * 0.7, y + L * 0.4]], 2.5, seed * 3 + i, { col: I.inkSoft, op: 0.55, amp: 0.8 }); }
          cloudBank(back, W * 0.7 + lt * 10, H * 0.12, 600, 140, seed + 30, I.paperLight);
          seaBack(back, W, H, hy, yb, seed + 40);
          for (let j = 0; j < 8; j++) { const x = ((j * 260 + lt * 30) % (W + 200)) - 100, y = hy + 30 + (j % 4) * 40; back.line([[x, y], [x + 30, y - 12], [x + 60, y]], 3.5, seed + 50 + j, { col: I.inkSoft }); }
          const bx = Bt.x * W, s = Bt.scale;
          const y0 = seaY(bx, lt, yb, A), yl = seaY(bx - 300, lt, yb, A), yr = seaY(bx + 300, lt, yb, A);
          const heel = ice * 0.16 + Math.atan2(yr - yl, 600) * 0.6;
          const by = y0 - 10 + ice * 30;
          boatG.setAttribute('transform', `translate(${inkF1(bx)} ${inkF1(by)}) rotate(${(heel * 180 / Math.PI).toFixed(2)}) scale(${s})`);
          const T = pts => pts;
          hullBack(bBack, T, seed * 10, { furl: 0.7 });
          // ice on the rigging
          if (ice > 0.05) {
            bBack.line([[64, -420], [312, -110]], 2.5 + ice * 12, seed + 60, { col: I.paperLight }); bBack.line([[64, -420], [312, -110]], 2, seed + 61, { col: I.blue });
            bBack.line([[60, -86], [64, -420]], 9 + ice * 14, seed + 62, { col: I.paperLight }); bBack.line([[58, -86], [62, -420]], 2.5, seed + 63, { col: I.blue });
          }
          const hands = crewUpdate(crew, lt, t, cues, -40);
          hands.forEach((h, i) => { if (h.m.tool) tool(bFront, h.m.tool, h.x, h.y, 0.42, (-h.dir * Math.PI / 180) * h.face + (h.face < 0 ? Math.PI : 0), seed * 20 + i * 10); });
          hullFront(bFront, T, seed * 10, { deck: 1 });
          // ice crust on deck and icicles under the gunwale
          if (ice > 0.02) {
            const th = 8 + ice * 46, top = [], bot = [];
            for (let x = -300; x <= 304; x += 24) { top.push([x, gunY(x) - 14 - th * (0.7 + 0.3 * Math.sin(x * 0.05 + 1))]); bot.push([x, gunY(x) - 8]); }
            bFront.shape([...top, ...bot.reverse()], I.paperLight, 4, seed + 70, { lc: I.blue });
            for (let x = -270; x < 290; x += 52) bFront.line([[x, gunY(x) - 16], [x + 18, gunY(x) - 16 - th * 0.6]], 2.5, seed + 80 + Math.round(x), { col: I.blue, op: 0.8 });
            icicles.forEach(([x, L], i) => { const l = L * ice * 1.6; if (l > 4) bFront.shape([[x - 7, gunY(x) + 2], [x + 7, gunY(x) + 2], [x + 1, gunY(x) + 2 + l]], I.paperLight, 2.5, seed + 120 + i, { lc: I.blue, smooth: false }); });
          }
          // flying ice chunks while chopping
          hands.forEach((h, i) => {
            if (h.sw == null || lt < aC) return;
            const cyc = (lt * (h.m.rate || 7) + i) / (Math.PI * 2), base = Math.floor(cyc);
            for (let b = 0; b < 2; b++) {
              const u = cyc - (base - b); if (u < 0 || u > 1.4) continue;
              const rr = rng(seed * 101 + i * 31 + (base - b)); const vx = (rr() - 0.3) * 260, vy = -200 - rr() * 160;
              const px = h.x + vx * u, py = h.y + 20 + vy * u + 320 * u * u, q = 9 + rr() * 9;
              bFront.shape([[px - q, py], [px, py - q], [px + q, py + 2], [px, py + q]], I.paperLight, 2.5, seed + 200 + i * 7 + b, { lc: I.blue, smooth: false });
            }
          });
          seaFront(front, W, H, lt, yb, A, seed + 300, { foam: true });
          // spray that flies in from the left and freezes
          if (ice > 0 || lt < aC) drops.forEach(([u0, dy, v], i) => {
            const u = ((lt * (0.7 + v * 0.5) + u0) % 1), x = lerp(-40, bx + 200, u), y = lerp(H * 0.62 + dy * 0.3, by - 120 * s + dy * 0.2, u) - Math.sin(u * Math.PI) * 120;
            front.dot(x, y, 5 + v * 4, I.paperLight, seed + 400 + i, 1 - u * 0.3);
            front.line([[x - 18, y + 6], [x - 4, y + 1]], 2.5, seed + 450 + i, { col: I.blue, op: 0.8, amp: 0.4 });
          });
          for (const p of [back, bBack, bFront, front]) p.end();
          drawLabels(LS, lt, t, cues, W, H);
        },
      };
    },
  };
})();
