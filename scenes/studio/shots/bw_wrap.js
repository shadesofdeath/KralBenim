// bw_wrap: the origin of bubble wrap (Hawthorne, New Jersey 1957 -> IBM 1401 shipping) in the parchment ink style
// (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no
// Math.random). Written for ag-01-bubble-wrap (Stickstory), parametric: any bubble wrap / packaging / wallpaper moment.
// Needs mcB__lib.js (window.MCB.labels, camPush) at build time.
//
// Shared: cast: [{who: "kasif"|name, x, y (ground, 0..1 H), scale: 0.9, pose, face: "left"|"right", dir, emotion,
//   accessory, beard, at, then, to, walk_dur: 1.6, seq: [{at, pose, dir, face, emotion}],
//   sheet: true (a small bubble sheet held between the hands; pops: {at: cue|s, every: 0.55} make its bubbles burst)}]
//   labels: [MCB label entries: {text, x, y, at, size, color, font: "hand"|"serif", stamp, arrow, rot}]
//   cam: {zoom: 1.06, focus: [0.5, 0.5]}, hit: cue name (camera punch; default "hit")
//
// SHOTS.bw_room — a 1950s living-room wall covered in bubble-wrap "wallpaper", floorboards, optional furniture.
//   P: {wall: {top: 0.17, floor: 0.6}, r: 34 (bubble radius), reveal: {at, dur: 1.8} (wallpaper unrolls left -> right
//       over a plain striped wall; omit = already papered), pops: [{x, y (0..1), at}] (a bubble bursts: rays + "POP!"),
//       frame: true|{x, y}, lamp: true|{x}, chair: true|{x}, cast, labels, cam}
//   cues: reveal.at, pops[].at, labels, cast, hit
//
// SHOTS.bw_seal — mode "curtains": two plastic shower curtains on a rail (rings, stripes, folds) slide together on
//   `seal` and a hot iron runs down the seam (gold tip, steam). mode "sheet": a big plastic sheet seen head-on whose
//   bubbles inflate in a wave on `air` (little air puffs fly in first).
//   P: {mode, rail_y: 0.2, bottom: 0.56, sheet: {x0: 0.06, x1: 0.94, y0: 0.18, y1: 0.43}, r: 40, cast, labels, cam}
//   cues: seal, iron, air, hit
//
// SHOTS.bw_green — a glass greenhouse with plants and a turning sun; on `wrap` bubble wrap covers the panes one by one.
//   P: {x0: 0.1, x1: 0.9, ridge: 0.22, eave: 0.34, base: 0.6, cast, labels, cam}   cues: wrap, hit
//
// SHOTS.bw_ship — the IBM 1401 (late-1950s office computer: processing cabinet, tape unit with spinning reels, printer).
//   mode "lab":   the machines on a floor, blinking lights, reels turning.
//   mode "truck": the main cabinet strapped on a flatbed truck that bounces along a scrolling road; on `jolt` a big
//                 bump, cracks and a red "!" (FRAGILE stamp via labels).
//   mode "wrap":  the cabinet alone; on `wrap` a bubble sheet rises and wraps it, tape strips land on `tape`.
//   P: {mode, floor: 0.6, cast, labels, cam}   cues: jolt, wrap, tape, hit
//
// SHOTS.bw_world — a slowly turning ink globe; parcels (lids open, bubble wrap bulging out) ride a conveyor in front.
//   P: {globe: {x: 0.5, y: 0.31, r: 250}, belt_y: 0.6, parcels: 4, speed: 90, cast, labels, cam}   cues: hit, labels
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const FR = 'Fraunces, Georgia, serif';

  // ------------------------------------------------------------ bubbles
  // One bubble: a pale disc, an ink-soft ring, a blue shine arc and a paper-dark shadow crescent. Returns 4 path ds.
  function bubbleD(x, y, r, sd, t, k = 1) {
    if (r * k < 2) return ['', '', '', ''];
    const rr = r * k;
    const disc = inkCircle(x, y, rr, sd, t, { fill: true, amp: 0.7, n: 9 });
    const ring = inkCircle(x, y, rr, sd, t, { w: 3.2, amp: 0.7, n: 9 });
    const a0 = -2.5, a1 = -1.3, sh = [];
    for (let i = 0; i <= 4; i++) { const a = lerp(a0, a1, i / 4); sh.push([x + Math.cos(a) * rr * 0.62, y + Math.sin(a) * rr * 0.62]); }
    const shine = inkPath(sh, { w: Math.max(2, rr * 0.16), seed: sd + 3, t, amp: 0.4, taper: 0.6 });
    const sw = [];
    for (let i = 0; i <= 4; i++) { const a = lerp(0.2, 1.5, i / 4); sw.push([x + Math.cos(a) * rr * 0.78, y + Math.sin(a) * rr * 0.78]); }
    const shade = inkPath(sw, { w: Math.max(2, rr * 0.18), seed: sd + 5, t, amp: 0.4, taper: 0.7 });
    return [disc, ring, shine, shade];
  }
  // a field of bubbles: 4 path elements; draw(t, list) where list = [{x, y, r, k}] (k = inflation 0..1)
  function bubbleLayer(parent, sd) {
    const disc = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.8 }), shade = inkEl(parent, INK.paperDark),
      ring = inkEl(parent, INK.inkSoft), shine = inkEl(parent, INK.blue, { 'fill-opacity': 0.7 });
    let key = null;
    return {
      draw(t, list, dyn = false) {
        const k = dyn ? null : inkFrame(t);
        if (!dyn && k === key) return;
        key = k;
        const D = ['', '', '', ''];
        list.forEach((b, i) => { if ((b.k ?? 1) <= 0.02) return; const d = bubbleD(b.x, b.y, b.r, sd + i * 11, t, b.k ?? 1); for (let j = 0; j < 4; j++) D[j] += d[j] + ' '; });
        disc.setAttribute('d', D[0]); ring.setAttribute('d', D[1]); shine.setAttribute('d', D[2]); shade.setAttribute('d', D[3]);
      },
    };
  }
  // hex grid of bubble centres inside a box
  function grid(x0, y0, x1, y1, r, gap = 1.12) {
    const out = [], dx = r * 2 * gap, dy = dx * 0.87;
    let row = 0;
    for (let y = y0 + r; y <= y1 - r * 0.6; y += dy, row++)
      for (let x = x0 + r + (row % 2 ? dx / 2 : 0); x <= x1 - r * 0.6; x += dx) out.push({ x, y, r, row });
    return out;
  }
  // a burst: rays + popped wrinkle + optional "POP!"
  function popFx(parent) {
    const rays = inkEl(parent, INK.ink), flat = inkEl(parent, INK.inkSoft);
    const tx = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.red });
    tx.textContent = 'POP!';
    return {
      update(lt, t, at, x, y, r, sd, word = true, size = 64, side = 1, hold = 1.6) {
        if (at == null || lt < at) { rays.setAttribute('d', ''); flat.setAttribute('d', ''); tx.style.display = 'none'; return false; }
        const u = lt - at, p = clamp01(u / 0.35);
        let d = '';
        if (u < 0.9) for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2 + 0.3, ra = r * (1.1 + p * 0.9), rb = r * (1.5 + p * 1.6);
          d += inkPath([[x + Math.cos(a) * ra, y + Math.sin(a) * ra], [x + Math.cos(a) * rb, y + Math.sin(a) * rb]], { w: 5 * (1 - u / 0.9) + 1, seed: sd + i, t, amp: 0.6 }) + ' ';
        }
        rays.setAttribute('d', d);
        flat.setAttribute('d', inkPath([[x - r * 0.7, y + 2], [x - r * 0.3, y - r * 0.25], [x, y + r * 0.2], [x + r * 0.35, y - r * 0.2], [x + r * 0.7, y + 3]], { w: 3.5, seed: sd + 20, t, amp: 0.8 }) +
          ' ' + inkCircle(x, y, r * 0.95, sd + 21, t, { w: 2.5, amp: 1.2, n: 9 }));
        if (word && u < hold) {
          tx.style.display = '';
          const s = spring(lt, at, 0.4), b = boil(sd + 30, t, 1);
          tx.setAttribute('font-size', size);
          tx.setAttribute('transform', `translate(${f1(x + side * r * 1.6 + b[0])} ${f1(y - r * 1.5 - u * 30 + b[1])}) rotate(-10) scale(${Math.max(0.01, s).toFixed(3)})`);
        } else tx.style.display = 'none';
        return true;
      },
    };
  }

  // ------------------------------------------------------------ cast (returns hand positions for held props)
  function castK(group, list, W, H, sd) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.9, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const sg = m.sheet ? el(group, 'g') : null;
      const sheet = sg ? { f: inkEl(sg, INK.paperLight), r: inkEl(sg, INK.inkSoft), bl: bubbleLayer(sg, sd + 300 + i), pop: popFx(sg) } : null;
      return { m, rig, g, sheet };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        items.forEach(({ m, rig, sheet }) => {
          const sc = m.scale ?? 0.9, face0 = faceOf(m.face, 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion }];
          const a = atOr(cues, m.at, null);
          if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.then_dir ?? m.dir, face: m.face, emotion: m.then_emotion || m.emotion });
          (m.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({}, s, { at: sa })); });
          segs.sort((p, q) => p.at - q.at);
          let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
          let s = segs[si], pv = si > 0 ? segs[si - 1] : null, since = lt - Math.max(0, s.at);
          let x = m.x * W, face = faceOf(s.face, face0), pose = s.pose || 'idle', ph = 0;
          if (m.to != null) {
            const wd = m.walk_dur ?? 1.6;
            const arrive = m.walk_at != null ? atOr(cues, m.walk_at, 0) + wd : (a != null ? a : wd);
            const start = Math.max(0, arrive - wd), u = progIO(lt, start, Math.max(0.1, arrive - start));
            const dist = (m.to - m.x) * W;
            x = (m.x + (m.to - m.x) * u) * W;
            if (lt < arrive && lt >= start) { pose = m.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
            else if (lt < start) { pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle'; }
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          }
          if (m.run_in_place) { pose = 'run'; ph = lt / 0.62; }
          const y = H * (m.y ?? 0.6);
          const o = { x, y, face, since, ph, dir: dirOf(s.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir) }; o.mix = since / 0.32; }
          const r = rig.update(t, pose, o);
          if (sheet && r && r.hands) {
            const hw = r.hands.map(h => [x + face * sc * h[0], y + sc * h[1]]);
            const cx = (hw[0][0] + hw[1][0]) / 2, cy = (hw[0][1] + hw[1][1]) / 2 + 10 * sc;
            const w = Math.max(120 * sc, Math.abs(hw[0][0] - hw[1][0]) + 10), h = (m.sheet_h ?? 92) * sc;
            const pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2 - 6], [cx + w / 2 + 4, cy + h / 2], [cx - w / 2 - 2, cy + h / 2 + 4]];
            sheet.f.setAttribute('d', inkLoop(pts, { seed: sd + 401, t, amp: 1.2 }));
            sheet.r.setAttribute('d', inkPath(pts, { w: 3.5, seed: sd + 402, t, amp: 1.2, closed: true }));
            const br = (m.bubble_r ?? 19) * sc / 0.9;
            const bs = grid(cx - w / 2 + 6, cy - h / 2 + 6, cx + w / 2 - 6, cy + h / 2 - 6, br, 1.08);
            const PO = m.pops || {}, pa = atOr(cues, PO.at, null), every = PO.every ?? 0.55;
            const order = [4, 1, 6, 2, 5, 0, 3, 7, 8, 9];
            let last = -1;
            bs.forEach((b, i) => {
              const oi = order.indexOf(i % 10), tp = pa == null || oi < 0 || oi >= (PO.max ?? 10) ? null : pa + oi * every;
              b.k = tp != null && lt >= tp ? 0 : 1;
              if (tp != null && lt >= tp) last = i;
            });
            sheet.bl.draw(t, bs, true);
            const lb = last >= 0 ? bs[last] : null, lo = lb ? order.indexOf(last % 10) : -1;
            sheet.pop.update(lt, t, lb ? pa + lo * every : null, lb ? lb.x : 0, lb ? lb.y : 0, br, sd + 410 + last, true, m.pop_size || 72, 1, 0.38);
          }
        });
      },
    };
  }

  function common(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const root = el(svg, 'g'), cam = el(root, 'g');
    return { P, W, H, root, cam, sd: seed * 1000 + 523, portrait: H > W };
  }
  function tail(B, lt, dur, cues, t) {
    const hitAt = atOr(cues, (B.P.hit || 'hit'), null), hit = punch(lt, hitAt, 0.6);
    MCB.camPush(B.cam, lt, dur, B.W, B.H, Object.assign({ zoom: 1.06, focus: [0.5, 0.5] }, B.P.cam || {}), hit, B.shake || 0);
    if (B.cast) B.cast.update(lt, t, cues);
    if (B.labels) B.labels.update(lt, t, cues);
    return hit;
  }
  function finish(B) {
    B.cast = typeof KASIF !== 'undefined' ? castK(el(B.cam, 'g'), B.P.cast, B.W, B.H, B.sd + 50) : null;
    B.labels = window.MCB ? MCB.labels(el(B.cam, 'g'), B.P.labels, B.W, B.H, B.sd + 70) : null;
  }

  // ------------------------------------------------------------ furniture
  function lampD(x, fy, sd, t, sw) {
    const top = fy - 470, shade = [[x - 80, top + 110], [x - 46, top], [x + 46, top], [x + 80, top + 110]];
    return { shade, d: inkPath([[x, fy], [x + sw, top + 110]], { w: 7, seed: sd, t }) + ' ' + inkPath([[x - 60, fy], [x + 60, fy]], { w: 8, seed: sd + 1, t }) };
  }

  // ============================================================ bw_room
  SH.bw_room = {
    kind: '2d',
    build(ctx) {
      const B = common(ctx), { P, W, H, cam, sd } = B;
      const WL = Object.assign({ top: 0.17, floor: 0.6 }, P.wall || {});
      const wy0 = WL.top * H, fy = WL.floor * H, r = P.r || 34;
      const back = el(cam, 'g');
      const wallF = inkEl(back, INK.paperLight, { 'fill-opacity': 0.55 }), stripes = inkEl(back, INK.paperDark);
      const bubG = el(back, 'g'), clipId = `bwc${sd}`;
      const cp = el(el(back, 'defs'), 'clipPath', { id: clipId }), cpr = el(cp, 'rect', { x: 0, y: wy0, width: W, height: fy - wy0 });
      bubG.setAttribute('clip-path', `url(#${clipId})`);
      const bl = bubbleLayer(bubG, sd + 100);
      const cells = grid(-r, wy0 + 4, W + r, fy - 4, r, 1.1);
      const rollF = inkEl(back, INK.paperLight), rollR = inkEl(back);
      const lines = inkEl(back), floorF = inkEl(back, INK.paperDark, { 'fill-opacity': 0.5 }), boards = inkEl(back, INK.inkSoft);
      const furn = el(cam, 'g');
      const FRm = P.frame ? Object.assign({ x: 0.3, y: 0.3 }, P.frame === true ? {} : P.frame) : null;
      const frame = FRm ? { f: inkEl(furn, INK.paperLight), r: inkEl(furn), pic: inkEl(furn, INK.inkSoft), sun: inkEl(furn, INK.gold) } : null;
      const LM = P.lamp ? Object.assign({ x: 0.1 }, P.lamp === true ? {} : P.lamp) : null;
      const lamp = LM ? { f: inkEl(furn, INK.gold), r: inkEl(furn) } : null;
      const CH = P.chair ? Object.assign({ x: 0.3 }, P.chair === true ? {} : P.chair) : null;
      const chair = CH ? { f: inkEl(furn, INK.red), r: inkEl(furn) } : null;
      const popsG = el(cam, 'g');
      const pops = (P.pops || []).map(p => ({ p, fx: popFx(popsG) }));
      finish(B);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const RV = P.reveal, ra = RV ? atOr(cues, RV.at, 0.3) : null;
          const rp = RV ? progIO(lt, ra, RV.dur || 1.8) : 1, rx = lerp(-60, W + 80, rp);
          cpr.setAttribute('width', f1(Math.max(0, rx)));
          wallF.setAttribute('d', inkLoop(rect(-20, wy0, W + 40, fy - wy0), { seed: sd + 1, t, amp: 1, smooth: false }));
          let sdd = '';
          if (RV) for (let x = rx + 30; x < W + 40; x += 90) sdd += inkLoop(rect(x, wy0, 28, fy - wy0), { seed: sd + 2 + x, t, amp: 0.8, smooth: false }) + ' ';
          stripes.setAttribute('d', sdd);
          cells.forEach(c => { c.k = 1; });
          (P.pops || []).forEach(pp => { const a = atOr(cues, pp.at, null); if (a != null && lt >= a) {
            let bi = 0, bd = 1e9; cells.forEach((c, i) => { const d = (c.x - pp.x * W) ** 2 + (c.y - pp.y * H) ** 2; if (d < bd) { bd = d; bi = i; } }); cells[bi].k = 0; } });
          bl.draw(t, cells, pops.some(q => { const a = atOr(cues, q.p.at, null); return a != null && lt >= a - 0.05 && lt < a + 0.1; }) || (RV && rp > 0 && rp < 1));
          if (RV && rp > 0 && rp < 1) {
            const rc = [[rx - 26, wy0 - 10], [rx + 26, wy0 - 10], [rx + 26, fy + 6], [rx - 26, fy + 6]];
            rollF.setAttribute('d', inkLoop(rc, { seed: sd + 5, t, amp: 1, smooth: false }));
            rollR.setAttribute('d', inkPath(rc, { w: 5, seed: sd + 6, t, closed: true, smooth: false }) + ' ' +
              inkPath([[rx, wy0], [rx + 4, fy]], { w: 3, seed: sd + 7, t }));
          } else { rollF.setAttribute('d', ''); rollR.setAttribute('d', ''); }
          lines.setAttribute('d', inkPath([[-20, wy0], [W + 20, wy0]], { w: 7, seed: sd + 10, t }) + ' ' + inkPath([[-20, wy0 - 22], [W + 20, wy0 - 22]], { w: 4, seed: sd + 11, t }) + ' ' +
            inkPath([[-20, fy], [W + 20, fy]], { w: 7, seed: sd + 12, t }) + ' ' + inkPath([[-20, fy - 34], [W + 20, fy - 34]], { w: 4, seed: sd + 13, t }));
          const fb = H * 0.8;
          floorF.setAttribute('d', inkLoop(rect(-20, fy, W + 40, fb - fy), { seed: sd + 14, t, amp: 1, smooth: false }));
          let bd = '';
          for (let i = -6; i <= 6; i++) bd += inkPath([[W / 2 + i * 90, fy + 4], [W / 2 + i * 260, fb]], { w: 3, seed: sd + 20 + i, t }) + ' ';
          boards.setAttribute('d', bd);
          if (frame) {
            const fx = FRm.x * W, fyy = FRm.y * H, fw = 250, fh = 190, sw = Math.sin(lt * 1.2) * 1.5;
            const pts = rect(fx - fw / 2, fyy - fh / 2, fw, fh).map(q => [q[0] + sw * (q[1] - fyy) * 0.01, q[1]]);
            frame.f.setAttribute('d', inkLoop(pts, { seed: sd + 30, t, smooth: false }));
            frame.r.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 31, t, closed: true, smooth: false }) + ' ' + inkPath([[fx - 40, fyy - fh / 2], [fx, fyy - fh / 2 - 50], [fx + 40, fyy - fh / 2]], { w: 3, seed: sd + 32, t }));
            frame.pic.setAttribute('d', inkPath([[fx - 100, fyy + 50], [fx - 40, fyy - 10], [fx + 10, fyy + 30], [fx + 60, fyy - 30], [fx + 105, fyy + 50]], { w: 4, seed: sd + 33, t }));
            frame.sun.setAttribute('d', inkDot(fx + 60, fyy - 52, 18, 18, sd + 34, t));
          }
          if (lamp) {
            const L = lampD(LM.x * W, fy + 20, sd + 40, t, Math.sin(lt * 0.8) * 3);
            lamp.f.setAttribute('d', inkLoop(L.shade, { seed: sd + 42, t, smooth: false }));
            lamp.r.setAttribute('d', L.d + ' ' + inkPath(L.shade, { w: 6, seed: sd + 43, t, closed: true, smooth: false }));
          }
          if (chair) {
            const cx = CH.x * W, by = fy + 30;
            const body = [[cx - 150, by - 40], [cx - 150, by - 300], [cx - 110, by - 330], [cx + 110, by - 330], [cx + 150, by - 300], [cx + 150, by - 40]];
            chair.f.setAttribute('d', inkLoop(body, { seed: sd + 50, t }));
            chair.r.setAttribute('d', inkPath(body, { w: 6, seed: sd + 51, t, closed: true }) + ' ' + inkPath([[cx - 150, by - 150], [cx + 150, by - 150]], { w: 5, seed: sd + 52, t }) + ' ' +
              inkPath([[cx - 120, by - 40], [cx - 126, by]], { w: 7, seed: sd + 53, t }) + ' ' + inkPath([[cx + 120, by - 40], [cx + 126, by]], { w: 7, seed: sd + 54, t }));
          }
          pops.forEach((q, i) => q.fx.update(lt, t, atOr(cues, q.p.at, null), q.p.x * W, q.p.y * H, r * (q.p.k || 1), sd + 60 + i * 9, q.p.word !== false, q.p.size || 72, q.p.side ?? 1, q.p.hold ?? 1.6));
          tail(B, lt, dur, cues, t);
        },
      };
    },
  };

  // ============================================================ bw_seal
  SH.bw_seal = {
    kind: '2d',
    build(ctx) {
      const B = common(ctx), { P, W, H, cam, sd } = B;
      const mode = P.mode || 'curtains';
      const G = el(cam, 'g');
      let upd;
      if (mode === 'curtains') {
        const ry = (P.rail_y ?? 0.2) * H, by = (P.bottom ?? 0.56) * H;
        const rail = inkEl(G), panels = [0, 1].map(i => ({ f: inkEl(G, INK.paperLight, { 'fill-opacity': 0.9 }), st: inkEl(G, i ? INK.green : INK.blue, { 'fill-opacity': 0.55 }), r: inkEl(G), rings: inkEl(G, INK.inkSoft) }));
        const seam = inkEl(G, INK.gold), iron = { f: inkEl(G, INK.paperDark), r: inkEl(G), tip: inkEl(G, INK.red) }, steam = inkEl(G, INK.inkSoft);
        const tableF = inkEl(G, INK.hat, { 'fill-opacity': 0.55 }), tableR = inkEl(G);
        upd = (lt, dur, cues, t) => {
          const sa = atOr(cues, 'seal', 0.6), sp = progIO(lt, sa, 1.1), pw = W * 0.34;
          rail.setAttribute('d', inkPath([[W * 0.04, ry], [W * 0.96, ry]], { w: 8, seed: sd + 1, t }) + ' ' + inkDot(W * 0.04, ry, 12, 12, sd + 2, t) + ' ' + inkDot(W * 0.96, ry, 12, 12, sd + 3, t));
          const cx = W / 2;
          panels.forEach((p, i) => {
            const sgn = i ? 1 : -1, xin = lerp(cx + sgn * W * 0.1, cx + sgn * W * 0.012, sp), xout = xin + sgn * pw;
            const x0 = Math.min(xin, xout), x1 = Math.max(xin, xout), nF = 5;
            const top = [], bot = [];
            for (let k = 0; k <= nF * 2; k++) { const x = lerp(x0, x1, k / (nF * 2)); top.push([x, ry + 24]); bot.push([x + Math.sin(k * 1.7 + lt * 1.4 + i) * 6, by + (k % 2 ? 16 : -6)]); }
            const shape = top.concat(bot.reverse());
            p.f.setAttribute('d', inkLoop(shape, { seed: sd + 10 + i, t, amp: 1, smooth: false }));
            let st = '';
            for (let k = 0; k < 4; k++) { const xa = lerp(x0, x1, (k + 0.3) / 4), wv = Math.sin(lt * 1.3 + k) * 5; st += inkLoop([[xa, ry + 28], [xa + 26, ry + 28], [xa + 26 + wv, by - 8], [xa + wv, by - 8]], { seed: sd + 20 + k + i * 9, t, amp: 0.8, smooth: false }) + ' '; }
            p.st.setAttribute('d', st);
            let fd = inkPath(shape, { w: 5, seed: sd + 30 + i, t, closed: true, smooth: false, amp: 1 });
            for (let k = 1; k < nF * 2; k += 2) { const x = lerp(x0, x1, k / (nF * 2)); fd += ' ' + inkPath([[x, ry + 40], [x + Math.sin(lt + k) * 4, (ry + by) / 2], [x + 3, by - 20]], { w: 2.5, seed: sd + 40 + k + i * 20, t, amp: 0.8 }); }
            p.r.setAttribute('d', fd);
            let rg = '';
            for (let k = 0; k <= 6; k++) rg += inkCircle(lerp(x0 + 10, x1 - 10, k / 6), ry, 13, sd + 60 + k + i * 10, t, { w: 3.5, amp: 0.6 }) + ' ';
            p.rings.setAttribute('d', rg);
          });
          // the hot iron runs down the seam
          const ia = atOr(cues, 'iron', sa + 1.2), ip = progIO(lt, ia, 1.6);
          if (lt >= ia) {
            const iy = lerp(ry + 70, by - 40, ip), ix = cx + Math.sin(lt * 7) * 3;
            seam.setAttribute('d', inkPath([[cx, ry + 40], [cx, Math.max(ry + 41, iy)]], { w: 9, seed: sd + 70, t, amp: 0.8 }));
            const ir = [[ix - 70, iy - 40], [ix + 50, iy - 40], [ix + 80, iy + 30], [ix - 70, iy + 30]];
            iron.f.setAttribute('d', inkLoop(ir, { seed: sd + 71, t, smooth: false }));
            iron.r.setAttribute('d', inkPath(ir, { w: 6, seed: sd + 72, t, closed: true, smooth: false }) + ' ' + inkPath([[ix - 50, iy - 40], [ix - 40, iy - 90], [ix + 30, iy - 90], [ix + 36, iy - 40]], { w: 7, seed: sd + 73, t }));
            iron.tip.setAttribute('d', inkDot(ix + 66, iy + 14, 12, 10, sd + 74, t));
            let sm = '';
            for (let k = 0; k < 3; k++) { const ph = (lt * 0.9 + k / 3) % 1, sx = ix - 30 + k * 40, sy = iy - 100 - ph * 140;
              sm += inkPath([[sx, sy + 60], [sx + 14, sy + 30], [sx - 10, sy], [sx + 6, sy - 30]], { w: 4 * (1 - ph) + 1, seed: sd + 75 + k, t, amp: 1 }) + ' '; }
            steam.setAttribute('d', sm);
          } else { seam.setAttribute('d', ''); iron.f.setAttribute('d', ''); iron.r.setAttribute('d', ''); iron.tip.setAttribute('d', ''); steam.setAttribute('d', ''); }
          const tb = rect(W * 0.08, by + 4, W * 0.84, 46);
          tableF.setAttribute('d', inkLoop(tb, { seed: sd + 80, t, smooth: false }));
          tableR.setAttribute('d', inkPath(tb, { w: 6, seed: sd + 81, t, closed: true, smooth: false }) + ' ' + inkPath([[W * 0.14, by + 50], [W * 0.14, H * 0.6]], { w: 8, seed: sd + 82, t }) + ' ' + inkPath([[W * 0.86, by + 50], [W * 0.86, H * 0.6]], { w: 8, seed: sd + 83, t }) + ' ' + inkPath([[-20, H * 0.6], [W + 20, H * 0.6]], { w: 6, seed: sd + 84, t }));
        };
      } else {
        const S = Object.assign({ x0: 0.06, x1: 0.94, y0: 0.18, y1: 0.43 }, P.sheet || {});
        const x0 = S.x0 * W, x1 = S.x1 * W, y0 = S.y0 * H, y1 = S.y1 * H, r = P.r || 40;
        const shF = inkEl(G, INK.paperLight, { 'fill-opacity': 0.75 }), shR = inkEl(G), seams = inkEl(G, INK.inkSoft);
        const bl = bubbleLayer(el(G, 'g'), sd + 200), cells = grid(x0 + 10, y0 + 10, x1 - 10, y1 - 10, r, 1.1);
        const puffs = inkEl(G, INK.blue), floor = inkEl(G);
        upd = (lt, dur, cues, t) => {
          const aa = atOr(cues, 'air', 0.8);
          const sh = rect(x0, y0, x1 - x0, y1 - y0).map((q, i) => [q[0], q[1] + Math.sin(lt * 1.2 + i) * 4]);
          shF.setAttribute('d', inkLoop(sh, { seed: sd + 1, t, amp: 1.2, smooth: false }));
          shR.setAttribute('d', inkPath(sh, { w: 6, seed: sd + 2, t, closed: true, amp: 1.2, smooth: false }) + ' ' + inkPath([[x0 + 14, y0 + 14], [x1 - 14, y0 + 12]], { w: 2.5, seed: sd + 3, t }));
          let dyn = false;
          cells.forEach(c => { const st = aa + (c.x - x0) / (x1 - x0) * 1.1 + (c.row % 2) * 0.08; c.k = lt < st ? 0 : spring(lt, st, 0.5); if (lt >= st && lt < st + 0.7) dyn = true; });
          bl.draw(t, cells, dyn);
          let sm = '';
          if (lt < aa + 1.4) cells.forEach((c, i) => { if (c.k > 0.05) return; if (i % 3) return;
            const st = aa + (c.x - x0) / (x1 - x0) * 1.1, u = clamp01(1 - (st - lt) / 0.6); if (u <= 0) return;
            const sx = lerp(c.x - 60, c.x, u), sy = lerp(c.y - 120, c.y, u);
            sm += inkPath([[sx - 26, sy - 10], [sx - 10, sy - 18], [sx + 6, sy - 6]], { w: 4, seed: sd + 40 + i, t, amp: 0.8 }) + ' '; });
          puffs.setAttribute('d', sm);
          seams.setAttribute('d', '');
          floor.setAttribute('d', inkPath([[-20, H * 0.6], [W + 20, H * 0.6]], { w: 6, seed: sd + 50, t }));
        };
      }
      finish(B);
      return { update(lt, dur, cues, env = {}) { const t = env.t ?? lt; upd(lt, dur, cues, t); tail(B, lt, dur, cues, t); } };
    },
  };

  // ============================================================ bw_green
  SH.bw_green = {
    kind: '2d',
    build(ctx) {
      const B = common(ctx), { P, W, H, cam, sd } = B;
      const X0 = (P.x0 ?? 0.1) * W, X1 = (P.x1 ?? 0.9) * W, RY = (P.ridge ?? 0.22) * H, EY = (P.eave ?? 0.34) * H, BY = (P.base ?? 0.6) * H;
      const back = el(cam, 'g');
      const sun = inkEl(back, INK.gold), rays = inkEl(back, INK.gold), hills = inkEl(back, INK.inkSoft);
      const glassF = inkEl(back, INK.paperLight, { 'fill-opacity': 0.5 });
      const plants = { pots: inkEl(back, INK.red, { 'fill-opacity': 0.8 }), potsR: inkEl(back), leaves: inkEl(back, INK.green, { 'fill-opacity': 0.85 }), stems: inkEl(back) , bench: inkEl(back) };
      const wrapG = el(back, 'g'), bl = bubbleLayer(wrapG, sd + 300);
      const frameR = inkEl(back), ground = inkEl(back);
      const ncol = 6, panes = [];
      for (let i = 0; i < ncol; i++) panes.push({ x0: lerp(X0, X1, i / ncol), x1: lerp(X0, X1, (i + 1) / ncol), i });
      const cellsOf = (p) => grid(p.x0 + 4, EY + 4, p.x1 - 4, BY - 4, 22, 1.08);
      const roofCells = (side) => { // roof triangle half: cells inside the slope
        const out = [], mid = (X0 + X1) / 2;
        grid(side ? mid : X0, RY, side ? X1 : mid, EY, 20, 1.08).forEach(c => {
          const yr = side ? lerp(RY, EY, (c.x - mid) / (X1 - mid)) : lerp(EY, RY, (c.x - X0) / (mid - X0));
          if (c.y - c.r > yr + 4) out.push(c);
        });
        return out;
      };
      const PC = panes.map(cellsOf), RC = [roofCells(0), roofCells(1)];
      finish(B);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const sx = W * 0.84, sy = H * 0.15, sr = 62;
          sun.setAttribute('d', inkCircle(sx, sy, sr, sd + 1, t, { fill: true }));
          let rd = '';
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + lt * 0.4; rd += inkPath([[sx + Math.cos(a) * (sr + 16), sy + Math.sin(a) * (sr + 16)], [sx + Math.cos(a) * (sr + 50), sy + Math.sin(a) * (sr + 50)]], { w: 6, seed: sd + 2 + i, t }) + ' '; }
          rays.setAttribute('d', rd);
          hills.setAttribute('d', inkPath([[-20, BY - 90], [W * 0.2, BY - 150], [W * 0.45, BY - 110], [W * 0.7, BY - 170], [W + 20, BY - 100]], { w: 3.5, seed: sd + 5, t }));
          const mid = (X0 + X1) / 2;
          const outline = [[X0, BY], [X0, EY], [mid, RY], [X1, EY], [X1, BY]];
          glassF.setAttribute('d', inkLoop(outline, { seed: sd + 6, t, smooth: false, amp: 1 }));
          // plants on a bench
          const benchY = BY - 120;
          let pd = '', prd = '', ld = '', st = '';
          for (let i = 0; i < 5; i++) {
            const px = lerp(X0 + 90, X1 - 90, i / 4), sw = Math.sin(lt * 1.6 + i) * 6;
            const pot = [[px - 38, benchY - 70], [px + 38, benchY - 70], [px + 28, benchY], [px - 28, benchY]];
            pd += inkLoop(pot, { seed: sd + 10 + i, t, smooth: false }) + ' ';
            prd += inkPath(pot, { w: 4.5, seed: sd + 20 + i, t, closed: true, smooth: false }) + ' ';
            const top = [px + sw, benchY - 200 - (i % 2) * 40];
            st += inkPath([[px, benchY - 70], [px + sw * 0.5, benchY - 140], top], { w: 5, seed: sd + 30 + i, t }) + ' ';
            for (let k = 0; k < 3; k++) { const ly = lerp(benchY - 110, top[1], k / 2), dir = k % 2 ? 1 : -1, lx = px + sw * (k / 2);
              ld += inkLoop(inkEllipsePts(lx + dir * 34, ly, 34, 15, sd + 40 + i * 5 + k, 10, dir * -0.4 + Math.sin(lt * 2 + k + i) * 0.08), { seed: sd + 40 + i * 5 + k, t, amp: 0.8 }) + ' '; }
          }
          plants.pots.setAttribute('d', pd); plants.potsR.setAttribute('d', prd); plants.leaves.setAttribute('d', ld); plants.stems.setAttribute('d', st);
          plants.bench.setAttribute('d', inkPath([[X0 + 20, benchY], [X1 - 20, benchY]], { w: 7, seed: sd + 60, t }) + ' ' + inkPath([[X0 + 60, benchY], [X0 + 60, BY]], { w: 6, seed: sd + 61, t }) + ' ' + inkPath([[X1 - 60, benchY], [X1 - 60, BY]], { w: 6, seed: sd + 62, t }));
          // bubble wrap pane by pane
          const wa = atOr(cues, 'wrap', null), list = [];
          let dyn = false;
          if (wa != null) {
            panes.forEach((p, i) => { const st0 = wa + i * 0.22; PC[i].forEach(c => { const k = lt < st0 ? 0 : spring(lt, st0, 0.45); list.push(Object.assign({}, c, { k })); }); if (lt >= st0 && lt < st0 + 0.6) dyn = true; });
            RC.forEach((cs, s) => { const st0 = wa + (s ? 1.0 : 0.3) + 0.2; cs.forEach(c => list.push(Object.assign({}, c, { k: lt < st0 ? 0 : spring(lt, st0, 0.45) }))); if (lt >= st0 && lt < st0 + 0.6) dyn = true; });
          }
          bl.draw(t, list, dyn);
          let fr = inkPath(outline, { w: 8, seed: sd + 70, t, smooth: false });
          panes.slice(1).forEach((p, i) => { fr += ' ' + inkPath([[p.x0, EY - (Math.abs(p.x0 - mid) < 3 ? EY - RY : 0)], [p.x0, BY]], { w: 5, seed: sd + 71 + i, t }); });
          fr += ' ' + inkPath([[X0, EY], [X1, EY]], { w: 5, seed: sd + 80, t });
          [0.25, 0.5, 0.75].forEach((u, i) => { const x = lerp(X0, mid, u); fr += ' ' + inkPath([[x, lerp(EY, RY, u)], [x, EY]], { w: 4, seed: sd + 81 + i, t }); const x2 = lerp(mid, X1, u); fr += ' ' + inkPath([[x2, lerp(RY, EY, u)], [x2, EY]], { w: 4, seed: sd + 85 + i, t }); });
          fr += ' ' + inkPath([[mid, RY], [mid, EY]], { w: 4, seed: sd + 89, t });
          frameR.setAttribute('d', fr);
          ground.setAttribute('d', inkPath([[-20, BY], [W + 20, BY + 4]], { w: 7, seed: sd + 90, t }));
          tail(B, lt, dur, cues, t);
        },
      };
    },
  };

  // ============================================================ bw_ship (IBM 1401)
  // machine drawings: returns {fill: [d by colour], line: d}
  function cabinet(x, by, w, h, sd, t, lt, kind) {
    const F = { light: '', dark: '', blue: '', gold: '', red: '' };
    let L = '';
    const box = rect(x - w / 2, by - h, w, h);
    F.light += inkLoop(box, { seed: sd, t, smooth: false, amp: 1 }) + ' ';
    L += inkPath(box, { w: 6, seed: sd + 1, t, closed: true, smooth: false }) + ' ';
    if (kind === 'cpu') {
      const pnl = rect(x - w / 2 + 24, by - h + 30, w - 48, h * 0.32);
      F.blue += inkLoop(pnl, { seed: sd + 2, t, smooth: false, amp: 0.8 }) + ' ';
      L += inkPath(pnl, { w: 4, seed: sd + 3, t, closed: true, smooth: false }) + ' ';
      const r = rng(inkHash(sd, Math.floor(lt * 4)));
      for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
        const lx = x - w / 2 + 50 + j * (w - 100) / 5, ly = by - h + 60 + i * (h * 0.32 - 60) / 3, on = r() > 0.45;
        F[on ? (r() > 0.75 ? 'red' : 'gold') : 'light'] += inkDot(lx, ly, 9, 9, sd + 10 + i * 7 + j, t) + ' ';
      }
      for (let k = 0; k < 3; k++) L += inkPath([[x - w / 2 + 24, by - h * 0.5 + k * 60], [x + w / 2 - 24, by - h * 0.5 + k * 60]], { w: 3, seed: sd + 50 + k, t }) + ' ';
      L += inkPath([[x, by - h * 0.62], [x, by - 20]], { w: 3, seed: sd + 60, t }) + ' ';
    } else if (kind === 'tape') {
      const a = lt * 2.4;
      [[-0.22, 0.24], [0.22, 0.24]].forEach(([u, v], i) => {
        const cx = x + u * w, cy = by - h + v * h + 40, rr = w * 0.19;
        F.dark += inkCircle(cx, cy, rr, sd + 70 + i, t, { fill: true }) + ' ';
        L += inkCircle(cx, cy, rr, sd + 72 + i, t, { w: 5 }) + ' ' + inkCircle(cx, cy, rr * 0.3, sd + 74 + i, t, { w: 4 }) + ' ';
        for (let k = 0; k < 3; k++) { const aa = (i ? -a : a) + k * 2.094; L += inkPath([[cx + Math.cos(aa) * rr * 0.35, cy + Math.sin(aa) * rr * 0.35], [cx + Math.cos(aa) * rr * 0.9, cy + Math.sin(aa) * rr * 0.9]], { w: 4, seed: sd + 80 + k + i * 3, t }) + ' '; }
      });
      const win = rect(x - w / 2 + 20, by - h + 16, w - 40, h * 0.5);
      L += inkPath(win, { w: 4, seed: sd + 90, t, closed: true, smooth: false }) + ' ';
      for (let k = 0; k < 4; k++) L += inkPath([[x - w / 2 + 30, by - h * 0.35 + k * 40], [x + w / 2 - 30, by - h * 0.35 + k * 40]], { w: 3, seed: sd + 91 + k, t }) + ' ';
    } else if (kind === 'printer') {
      const lid = [[x - w / 2, by - h], [x - w / 2 + 30, by - h - 40], [x + w / 2 - 30, by - h - 40], [x + w / 2, by - h]];
      F.dark += inkLoop(lid, { seed: sd + 100, t, smooth: false }) + ' ';
      L += inkPath(lid, { w: 5, seed: sd + 101, t, closed: true, smooth: false }) + ' ';
      const pp = (lt * 30) % 40;
      const paper = [[x - w * 0.3, by - h - 40], [x - w * 0.28, by - h - 130 - pp], [x + w * 0.28, by - h - 126 - pp], [x + w * 0.3, by - h - 40]];
      F.light += inkLoop(paper, { seed: sd + 102, t, smooth: false }) + ' ';
      L += inkPath(paper, { w: 4, seed: sd + 103, t, closed: true, smooth: false }) + ' ';
      for (let k = 0; k < 3; k++) L += inkPath([[x - w * 0.2, by - h - 70 - k * 18 - pp], [x + w * (0.05 + (k % 2) * 0.12), by - h - 70 - k * 18 - pp]], { w: 2.5, seed: sd + 104 + k, t }) + ' ';
      L += inkPath([[x - w / 2 + 20, by - h * 0.45], [x + w / 2 - 20, by - h * 0.45]], { w: 3, seed: sd + 110, t }) + ' ';
    }
    return { F, L };
  }
  function machineEls(parent) {
    return { light: inkEl(parent, INK.paperLight), dark: inkEl(parent, INK.paperDark), blue: inkEl(parent, INK.blue, { 'fill-opacity': 0.6 }),
      gold: inkEl(parent, INK.gold), red: inkEl(parent, INK.red), line: inkEl(parent) };
  }
  function machineSet(E, parts) {
    const F = { light: '', dark: '', blue: '', gold: '', red: '' }; let L = '';
    parts.forEach(p => { Object.keys(F).forEach(k => { F[k] += p.F[k]; }); L += p.L; });
    Object.keys(F).forEach(k => E[k].setAttribute('d', F[k])); E.line.setAttribute('d', L);
  }

  SH.bw_ship = {
    kind: '2d',
    build(ctx) {
      const B = common(ctx), { P, W, H, cam, sd } = B;
      const mode = P.mode || 'lab', fy = (P.floor ?? (P.mode === 'truck' ? 0.53 : 0.6)) * H;
      const G = el(cam, 'g');
      let upd;
      if (mode === 'lab') {
        const wallL = inkEl(G, INK.inkSoft), E = machineEls(G);
        upd = (lt, dur, cues, t) => {
          wallL.setAttribute('d', inkPath([[-20, fy], [W + 20, fy]], { w: 7, seed: sd + 1, t }) + ' ' +
            [0, 1, 2, 3, 4, 5].map(i => inkPath([[W * 0.1 + i * W * 0.17, fy + 10], [W * 0.02 + i * W * 0.2, H * 0.78]], { w: 3, seed: sd + 2 + i, t })).join(' '));
          const pop = i => spring(lt, 0.1 + i * 0.25, 0.6);
          const parts = [];
          const a = pop(0), b = pop(1), c = pop(2);
          if (a > 0.01) parts.push(cabinet(W * 0.2, fy, 230, 260 * a, sd + 100, t, lt, 'printer'));
          if (b > 0.01) parts.push(cabinet(W * 0.5, fy, 300, 560 * b, sd + 200, t, lt, 'cpu'));
          if (c > 0.01) parts.push(cabinet(W * 0.8, fy, 220, 520 * c, sd + 300, t, lt, 'tape'));
          machineSet(E, parts);
        };
      } else if (mode === 'truck') {
        const road = inkEl(G), dash = inkEl(G, INK.inkSoft), E = machineEls(el(G, 'g')), truckF = inkEl(G, INK.red, { 'fill-opacity': 0.8 }), truckL = inkEl(G), wheels = inkEl(G, INK.ink), cracks = inkEl(G, INK.red), bang = inkEl(G, INK.red), hillsL = inkEl(G, INK.inkSoft);
        const mg = E.line.parentNode;
        upd = (lt, dur, cues, t) => {
          const ja = atOr(cues, 'jolt', null), jp = ja != null && lt >= ja ? Math.exp(-(lt - ja) * 3) : 0;
          const bump = Math.abs(Math.sin(lt * 4.2)) * 10 + jp * 60 * Math.abs(Math.sin((lt - (ja || 0)) * 9));
          const scroll = lt * 420;
          hillsL.setAttribute('d', inkPath([0, 1, 2, 3, 4, 5, 6].map(i => [((i * 260 - scroll * 0.25) % 1820 + 1820) % 1820 - 200, fy - 260 - (i % 2) * 80]).sort((p, q) => p[0] - q[0]), { w: 3.5, seed: sd + 1, t }));
          road.setAttribute('d', inkPath([[-20, fy + 60], [W + 20, fy + 60]], { w: 7, seed: sd + 2, t }) + ' ' + inkPath([[-20, fy + 200], [W + 20, fy + 200]], { w: 5, seed: sd + 3, t }));
          let dd = '';
          for (let i = 0; i < 6; i++) { const x = ((i * 240 - scroll) % 1440 + 1440) % 1440 - 180; dd += inkPath([[x, fy + 130], [x + 110, fy + 130]], { w: 6, seed: sd + 4 + i, t }) + ' '; }
          dash.setAttribute('d', dd);
          const tx = W * 0.47, ty = fy + 50 - bump;
          const bed = rect(tx - 330, ty - 70, 520, 40), cab = [[tx + 190, ty - 30], [tx + 190, ty - 230], [tx + 300, ty - 230], [tx + 360, ty - 140], [tx + 360, ty - 30]];
          truckF.setAttribute('d', inkLoop(bed, { seed: sd + 10, t, smooth: false }) + ' ' + inkLoop(cab, { seed: sd + 11, t, smooth: false }));
          truckL.setAttribute('d', inkPath(bed, { w: 6, seed: sd + 12, t, closed: true, smooth: false }) + ' ' + inkPath(cab, { w: 6, seed: sd + 13, t, closed: true, smooth: false }) + ' ' +
            inkPath([[tx + 210, ty - 210], [tx + 290, ty - 210], [tx + 330, ty - 150], [tx + 210, ty - 150]], { w: 4, seed: sd + 14, t, closed: true, smooth: false }));
          let wd = '';
          [tx - 240, tx + 40, tx + 280].forEach((wx, i) => { wd += inkCircle(wx, fy + 10 - bump * 0.2, 48, sd + 20 + i, t, { w: 14 }) + ' ' + inkDot(wx, fy + 10 - bump * 0.2, 12, 12, sd + 23 + i, t) + ' ';
            const a = lt * 9 + i; wd += inkPath([[wx + Math.cos(a) * 14, fy + 10 - bump * 0.2 + Math.sin(a) * 14], [wx + Math.cos(a) * 36, fy + 10 - bump * 0.2 + Math.sin(a) * 36]], { w: 5, seed: sd + 26 + i, t }) + ' '; });
          wheels.setAttribute('d', wd);
          const rotA = Math.sin(lt * 5.3) * 2 + jp * 9 * Math.sin((lt - (ja || 0)) * 12);
          const cx = tx - 70, cby = ty - 70;
          mg.setAttribute('transform', `rotate(${f1(rotA)} ${f1(cx)} ${f1(cby)})`);
          machineSet(E, [cabinet(cx, cby, 280, 500, sd + 200, t, lt, 'cpu')]);
          // straps (part of the machine group so they tilt with it)
          E.line.setAttribute('d', E.line.getAttribute('d') + ' ' + inkPath([[cx - 150, cby - 150], [cx + 150, cby - 160]], { w: 6, seed: sd + 30, t }) + ' ' + inkPath([[cx - 150, cby - 360], [cx + 150, cby - 350]], { w: 6, seed: sd + 31, t }));
          if (ja != null && lt >= ja) {
            const u = clamp01((lt - ja) / 0.3);
            cracks.setAttribute('d', inkPath([[cx + 60, cby - 470], [cx + 30, cby - 420], [cx + 70, cby - 380], [cx + 20, cby - 330]].slice(0, 2 + Math.round(u * 2)), { w: 6, seed: sd + 40, t, amp: 1 }) + ' ' +
              inkPath([[cx - 140, cby - 240], [cx - 100, cby - 220], [cx - 120, cby - 180]].slice(0, 1 + Math.round(u * 2)), { w: 5, seed: sd + 41, t, amp: 1 }));
            cracks.setAttribute('transform', `rotate(${f1(rotA)} ${f1(cx)} ${f1(cby)})`);
            const bs = spring(lt, ja, 0.4), bx = cx + 230, by2 = cby - 560;
            bang.setAttribute('d', bs > 0.05 ? inkLoop([[bx - 22 * bs, by2 - 110 * bs], [bx + 22 * bs, by2 - 110 * bs], [bx + 10 * bs, by2], [bx - 10 * bs, by2]], { seed: sd + 42, t, smooth: false }) + ' ' + inkDot(bx, by2 + 40 * bs, 18 * bs, 18 * bs, sd + 43, t) : '');
          } else { cracks.setAttribute('d', ''); bang.setAttribute('d', ''); }
        };
      } else { // wrap
        const floorL = inkEl(G), E = machineEls(G), wrapF = inkEl(G, INK.paperLight, { 'fill-opacity': 0.55 }), wrapR = inkEl(G, INK.inkSoft);
        const bG = el(G, 'g'), clipId = `bws${sd}`, cp = el(el(G, 'defs'), 'clipPath', { id: clipId }), cpr = el(cp, 'rect', { x: 0, y: 0, width: W, height: 0 });
        bG.setAttribute('clip-path', `url(#${clipId})`);
        const bl = bubbleLayer(bG, sd + 500), tape = inkEl(G, INK.gold, { 'fill-opacity': 0.9 }), tapeR = inkEl(G);
        const cx = (P.x ?? 0.42) * W, cw = 300, ch = 560;
        const cells = grid(cx - cw / 2 - 40, fy - ch - 40, cx + cw / 2 + 40, fy, 30, 1.06);
        upd = (lt, dur, cues, t) => {
          floorL.setAttribute('d', inkPath([[-20, fy], [W + 20, fy]], { w: 7, seed: sd + 1, t }));
          machineSet(E, [cabinet(cx, fy, cw, ch, sd + 200, t, lt, 'cpu')]);
          const wa = atOr(cues, 'wrap', 0.4), wp = progIO(lt, wa, 1.3), top = lerp(fy, fy - ch - 40, wp);
          cpr.setAttribute('y', f1(top)); cpr.setAttribute('height', f1(Math.max(0, fy - top + 4)));
          const sh = [[cx - cw / 2 - 40, top + Math.sin(lt * 3) * 6], [cx + cw / 2 + 40, top - Math.sin(lt * 3) * 6], [cx + cw / 2 + 44, fy], [cx - cw / 2 - 44, fy]];
          wrapF.setAttribute('d', wp > 0.01 ? inkLoop(sh, { seed: sd + 2, t, smooth: false }) : '');
          wrapR.setAttribute('d', wp > 0.01 ? inkPath(sh, { w: 4, seed: sd + 3, t, closed: true, smooth: false }) : '');
          bl.draw(t, cells, wp > 0 && wp < 1);
          const ta = atOr(cues, 'tape', null);
          let td = '', tr = '';
          if (ta != null) [0.3, 0.7].forEach((v, i) => { const s = spring(lt, ta + i * 0.3, 0.4); if (s < 0.02) return;
            const yy = lerp(fy - ch - 40, fy, v), half = (cw / 2 + 56) * s, tp = [[cx - half, yy - 22], [cx + half, yy - 26], [cx + half, yy + 22], [cx - half, yy + 26]];
            td += inkLoop(tp, { seed: sd + 10 + i, t, smooth: false }) + ' '; tr += inkPath(tp, { w: 3.5, seed: sd + 12 + i, t, closed: true, smooth: false }) + ' '; });
          tape.setAttribute('d', td); tapeR.setAttribute('d', tr);
        };
      }
      finish(B);
      return { update(lt, dur, cues, env = {}) { const t = env.t ?? lt; upd(lt, dur, cues, t); tail(B, lt, dur, cues, t); } };
    },
  };

  // ============================================================ bw_world
  SH.bw_world = {
    kind: '2d',
    build(ctx) {
      const B = common(ctx), { P, W, H, cam, sd } = B;
      const GL = Object.assign({ x: 0.5, y: 0.31, r: 250 }, P.globe || {});
      const gx = GL.x * W, gy = GL.y * H, gr = GL.r, by = (P.belt_y ?? 0.6) * H;
      const G = el(cam, 'g');
      const globeF = inkEl(G, INK.paperLight), land = inkEl(G, INK.green, { 'fill-opacity': 0.55 }), globeL = inkEl(G), stand = inkEl(G);
      const routes = inkEl(G, INK.red);
      const belt = inkEl(G), rollers = inkEl(G, INK.inkSoft);
      const boxF = inkEl(G, INK.stain, { 'fill-opacity': 0.75 }), boxL = inkEl(G), blG = el(G, 'g'), bl = bubbleLayer(blG, sd + 600); bl.g = blG;
      const n = P.parcels ?? 4, speed = P.speed ?? 90, bx0 = (P.belt_x0 ?? 0) * W, span = W - bx0 + 400;
      const pcId = `bwp${sd}`, pcr = el(el(G, 'defs'), 'clipPath', { id: pcId });
      el(pcr, 'rect', { x: bx0, y: 0, width: W - bx0 + 40, height: H });
      [boxF, boxL].forEach(e => e.setAttribute('clip-path', `url(#${pcId})`)); bl.g && bl.g.setAttribute('clip-path', `url(#${pcId})`);
      const SF = P.safe ? Object.assign({ text: 'SAFE!', parcel: 0, size: 64 }, P.safe) : null;
      let safe = null;
      if (SF) { const sg = el(G, 'g'); safe = { g: sg, f: inkEl(sg, INK.paperLight), r: inkEl(sg, INK.red), tx: el(sg, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': SF.size, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red }) }; safe.tx.textContent = SF.text; }
      const LANDS = [[[-0.5, -0.5], [-0.1, -0.6], [0.1, -0.2], [-0.2, 0.1], [-0.45, -0.1]], [[0.2, 0.0], [0.55, -0.1], [0.6, 0.35], [0.3, 0.5]], [[-0.4, 0.35], [-0.1, 0.3], [-0.2, 0.65]]];
      finish(B);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const sp = spring(lt, 0, 0.6);
          globeF.setAttribute('d', inkCircle(gx, gy, gr * sp, sd + 1, t, { fill: true, n: 18 }));
          const rot = lt * 0.35;
          let ld = '';
          LANDS.forEach((poly, i) => {
            const pts = [];
            poly.forEach(([u, v]) => { const lon = Math.asin(Math.max(-1, Math.min(1, u))) + rot, x = Math.sin(lon) * Math.sqrt(1 - v * v); if (Math.cos(lon) > -0.1) pts.push([gx + x * gr * sp, gy + v * gr * sp]); });
            if (pts.length >= 3) ld += inkLoop(pts, { seed: sd + 10 + i, t, amp: 1.5 }) + ' ';
          });
          land.setAttribute('d', ld);
          let gl = inkCircle(gx, gy, gr * sp, sd + 2, t, { w: 7, n: 18 });
          for (let k = 0; k < 4; k++) { const ph = ((k / 4 + rot / (2 * Math.PI)) % 1) * Math.PI, sx = Math.cos(ph);
            const pts = []; for (let j = 0; j <= 10; j++) { const v = -1 + j / 5; pts.push([gx + sx * Math.sqrt(1 - v * v) * gr * sp, gy + v * gr * sp]); }
            gl += ' ' + inkPath(pts, { w: 3, seed: sd + 20 + k, t, amp: 0.8 }); }
          [-0.5, 0, 0.5].forEach((v, k) => { const hw = Math.sqrt(1 - v * v) * gr * sp; gl += ' ' + inkPath([[gx - hw, gy + v * gr * sp], [gx, gy + v * gr * sp + 14 * (1 - Math.abs(v))], [gx + hw, gy + v * gr * sp]], { w: 3, seed: sd + 30 + k, t, amp: 0.8 }); });
          globeL.setAttribute('d', gl);
          stand.setAttribute('d', inkPath([[gx, gy + gr + 6], [gx, gy + gr + 60]], { w: 9, seed: sd + 40, t }) + ' ' + inkPath([[gx - 90, gy + gr + 64], [gx + 90, gy + gr + 64]], { w: 9, seed: sd + 41, t }));
          // dashed routes around the globe (parcels travelling)
          let rd = '';
          for (let k = 0; k < 3; k++) { const a0 = lt * 0.9 + k * 2.1;
            for (let j = 0; j < 5; j++) { const a = a0 + j * 0.16; const R = gr * 1.18 + k * 26;
              rd += inkPath([[gx + Math.cos(a) * R, gy + Math.sin(a) * R * 0.5 - k * 30], [gx + Math.cos(a + 0.08) * R, gy + Math.sin(a + 0.08) * R * 0.5 - k * 30]], { w: 5, seed: sd + 50 + k * 5 + j, t, amp: 0.6 }) + ' '; } }
          routes.setAttribute('d', sp > 0.9 ? rd : '');
          belt.setAttribute('d', inkPath([[bx0, by], [W + 20, by]], { w: 7, seed: sd + 60, t }) + ' ' + inkPath([[bx0, by + 46], [W + 20, by + 46]], { w: 7, seed: sd + 61, t }) + (bx0 > 0 ? ' ' + inkCircle(bx0, by + 23, 23, sd + 59, t, { w: 6 }) + ' ' + inkPath([[bx0 + 20, by + 50], [bx0 + 10, (P.floor ?? 0.6) * H]], { w: 7, seed: sd + 58, t }) + ' ' + inkPath([[W * 0.9, by + 50], [W * 0.92, (P.floor ?? 0.6) * H]], { w: 7, seed: sd + 57, t }) + ' ' + inkPath([[-20, (P.floor ?? 0.6) * H], [W + 20, (P.floor ?? 0.6) * H]], { w: 6, seed: sd + 56, t }) : ''));
          let rl = '';
          for (let i = 0; i < 9; i++) { const x = ((i * 140 - lt * speed) % 1260 + 1260) % 1260 - 90; if (x < bx0 + 30) continue; rl += inkCircle(x, by + 23, 15, sd + 62 + i, t, { w: 4 }) + ' '; }
          rollers.setAttribute('d', rl);
          let bf = '', bL = '';
          const cells = [];
          for (let i = 0; i < n; i++) {
            const x = bx0 + ((i * span / n + lt * speed) % span) - 200, w = (P.box_w ?? 230) - (i % 2) * 30, h = (P.box_h ?? 170) + (i % 3) * 20;
            const box = rect(x - w / 2, by - h, w, h);
            bf += inkLoop(box, { seed: sd + 70 + i, t, smooth: false }) + ' ';
            bL += inkPath(box, { w: 6, seed: sd + 80 + i, t, closed: true, smooth: false }) + ' ' +
              inkPath([[x - w / 2, by - h], [x - w / 2 - 50, by - h - 50]], { w: 5, seed: sd + 90 + i, t }) + ' ' + inkPath([[x + w / 2, by - h], [x + w / 2 + 50, by - h - 50]], { w: 5, seed: sd + 95 + i, t }) + ' ' +
              inkPath([[x - 14, by - h], [x - 14, by]], { w: 3, seed: sd + 100 + i, t }) + ' ' + inkPath([[x + 14, by - h], [x + 14, by]], { w: 3, seed: sd + 105 + i, t });
            for (let k = 0; k < 4; k++) cells.push({ x: x - w / 2 + 34 + k * (w - 68) / 3, y: by - h - 16 - (k % 2) * 18, r: 26 });
          }
          boxF.setAttribute('d', bf); boxL.setAttribute('d', bL);
          if (safe) {
            const a = atOr(cues, SF.at, 0.5), i = SF.parcel;
            const x = bx0 + ((i * span / n + lt * speed) % span) - 200, h = (P.box_h ?? 170) + (i % 3) * 20;
            if (lt < a || x < bx0 + 40) safe.g.style.display = 'none';
            else {
              safe.g.style.display = '';
              const sp = spring(lt, a, 0.45), sz = SF.size, w = sz * SF.text.length * 0.62, hh = sz * 1.25, b = boil(sd + 700, t, 1);
              safe.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(by - h * 0.5 + b[1])}) rotate(-8) scale(${f1(lerp(1.8, 1, sp) * 1000) / 1000})`);
              const pts = rect(-w / 2 - 18, -hh / 2, w + 36, hh);
              safe.f.setAttribute('d', inkLoop(pts, { seed: sd + 701, t, amp: 1, smooth: false }));
              safe.r.setAttribute('d', inkPath(pts, { w: 7, seed: sd + 702, t, closed: true, smooth: false, amp: 1.2 }));
            }
          }
          bl.draw(t, cells, true);
          tail(B, lt, dur, cues, t);
        },
      };
    },
  };
})();

// SHOTS.bw_pack — the same as bw_ship mode "wrap" (the computer cabinet gets wrapped in bubble wrap), as its own type.
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.bw_pack = { kind: '2d', build(ctx) { return SH.bw_ship.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'wrap' }) })); } };
})();
