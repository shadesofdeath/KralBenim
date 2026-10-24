// an_water: a stream diverted before a battle, in the parchment ink style (brand/kit/BRAND.md §3, §5).
// mode "divert": a bird's-eye plain drawn straight on the paper: a winding river (blue wash, flowing ink dashes, two
// ink banks), a red-pennant camp with an empty pond basin; on `dig` tiny diggers with shovels appear, earth heaps grow,
// a dam of stones closes the old bed and a new channel draws itself towards the camp; on `turn` the water runs down the
// new channel, the pond fills (ripples), the old bed below the dam dries (wash fades, cracks and stones appear).
// mode "dry": side-on close-up of a dried creek bed (cracked clay, stones, dry reeds, heat shimmer): narrator-style
// soldiers (KASIF rigs, team cap) stand in the bed shaking an empty bucket / water skin; behind them, on the far bank,
// a row of small ink soldiers with spears and banners; on `q` a big red "?" stamps down above that row.
//
// P: {mode: "divert"|"dry",
//   river: {pts: [[x, y]...] (0..1, centre line, top to bottom), w: 54 (px), split: 0.42 (0..1 along the river where the
//           channel leaves), label: "Çubuk Çayı" | {text, x, y, at, size}},
//   camp: {color: "red", x: 0.74, y: 0.4, n: 5, pond: [0.66, 0.62], pond_r: [130, 62]},
//   channel: [[x, y]...] (0..1, from the split point to the pond; default: a gentle curve),
//   dig: cue (diggers + earth heaps + dam), turn: cue (water switches), diggers: 4,
//   note: {text: "anlatılana göre", x: 0.2, y: 0.14, at, size: 62, color: "soft"|"red"|"ink"},
//   labels: [{text, x, y, at, size, color}],
//   -- dry mode --
//   team: "blue" (cap colour), cast: [{x: 0.36, scale: 0.62, face: 1|-1, pose: "idle", emotion: "worried",
//         carry: "bucket"|"skin"|null, shake: cue (turns it upside down and shakes), seq: [{at, pose, face, emotion}]}],
//   row: {n: 9, color: "blue", y: 0.5, x0: 0.18, x1: 0.86, scale: 0.34},
//   q: cue (red "?" above the row), dry: cue (cracks spread across the bed),
//   kasif: {x, y, scale: 0.6, face, pose, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//   cam: {zoom: 1.06, focus: [0.5, 0.6]}}
// cues: hit (camera punch), dig, turn, q, dry and whatever the cast/kasif sequences reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, gold: INK.gold, green: INK.green, light: INK.paperLight, dark: INK.paperDark };
  const colOf = (c, fb) => COL[c] || fb || INK.ink;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const mod = (a, n) => ((a % n) + n) % n;
  const rotV = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

  function segs(K, cues, lt) {
    const L = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) L.push(Object.assign({}, s, { at: a })); });
    L.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < L.length; j++) if (lt >= L[j].at) i = j;
    const s = L[i], pv = i > 0 ? L[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : (K.emotion || null)), mouth: 0, seg: s };
    if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
    const f1v = faceOf(s.face ?? K.face ?? 1), f0v = pv ? faceOf(pv.face ?? K.face ?? 1) : f1v;
    o.face = lerp(f0v, f1v, progIO(since, 0, 0.35));
    return { pose: s.pose || 'idle', o };
  }

  // polyline helpers: resample by arc length
  function resample(pts, n) {
    const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = d[d.length - 1], out = [];
    for (let k = 0; k <= n; k++) {
      const s = k / n * L; let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const u = (s - d[i - 1]) / ((d[i] - d[i - 1]) || 1);
      out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]);
    }
    return out;
  }
  const normals = pts => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  const offset = (pts, nm, w) => pts.map((p, i) => [p[0] + nm[i][0] * w, p[1] + nm[i][1] * w]);
  const band = (pts, nm, w0, w1) => offset(pts, nm, w0).concat(offset(pts, nm, w1).reverse());

  function textNode(parent, o, def, col) {
    const t = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': o.size || def, 'text-anchor': 'middle', fill: colOf(o.color, col),
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
    t.textContent = o.text;
    return t;
  }

  SH.an_water = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const dry = P.mode === 'dry';
      const sd = seed * 1000 + 517, r = rng(seed * 29 + 3);
      const U = Math.min(W, H) / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g'), front = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const heat = SH.an_heat || {};
      const labels = (P.labels || []).map(L => ({ L, t: textNode(front, L, 60, INK.ink) }));
      const N = P.note || null, noteT = N ? textNode(front, N, 62, INK.inkSoft) : null;
      const K = P.kasif === false ? null : Object.assign({ x: dry ? 0.08 : 0.08, scale: 0.6, face: 1, pose: 'idle' }, P.kasif || {});
      const kasR = K ? KASIF.create(el(front, 'g'), { scale: 1, hat: true, seed: sd + 9 }) : null;

      let upd;
      if (!dry) {
        // ================================================================ divert (bird's-eye)
        const R = Object.assign({ pts: [[0.3, -0.04], [0.31, 0.12], [0.37, 0.26], [0.41, 0.44], [0.36, 0.6], [0.41, 0.76], [0.52, 0.9], [0.56, 1.06]], w: 54, split: 0.42 }, P.river || {});
        const Cp = Object.assign({ color: 'red', x: 0.76, y: 0.34, n: 5, pond: [0.7, 0.6], pond_r: [140, 66] }, P.camp || {});
        const rp = resample(R.pts.map(p => [p[0] * W, p[1] * H]), 80), rn = normals(rp), rw = R.w * U;
        const si = Math.round(R.split * 80), di = Math.min(79, si + 5);           // split index, dam index
        const sP = rp[si], pond = [Cp.pond[0] * W, Cp.pond[1] * H], prx = Cp.pond_r[0] * U, pry = Cp.pond_r[1] * U;
        const chPts0 = P.channel ? P.channel.map(p => [p[0] * W, p[1] * H]) : [sP, [lerp(sP[0], pond[0], 0.35), sP[1] - 10 * U], [lerp(sP[0], pond[0], 0.7), lerp(sP[1], pond[1], 0.55)], [pond[0] - prx * 0.85, pond[1]]];
        const cp = resample(chPts0, 40), cn = normals(cp), cw = rw * 0.62;
        // static texture: grass tufts and contour hills
        const tufts = []; for (let i = 0; i < 46; i++) { const p = [r() * W, r() * H * 0.95]; const near = rp.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < rw * 2.2) || cp.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < cw * 2.4) || Math.hypot((p[0] - pond[0]) / prx, (p[1] - pond[1]) / pry) < 1.4; if (!near) tufts.push(p); }
        const tents = []; for (let i = 0; i < Cp.n; i++) tents.push([W * Cp.x + (i - (Cp.n - 1) / 2) * 120 * U + (i % 2) * 20 * U, H * Cp.y + (i % 2 ? 50 : -20) * U]);
        const stones = []; for (let i = di + 2; i < 80; i += 3) { const p = rp[i], n = rn[i], o = (r() - 0.5) * rw * 1.2; stones.push([p[0] + n[0] * o, p[1] + n[1] * o, (8 + r() * 10) * U]); }
        const cracks = []; for (let i = di + 2; i < 79; i += 2) { const p = rp[i], n = rn[i]; const o = (r() - 0.5) * rw * 1.3; const a = r() * TAU; cracks.push([[p[0] + n[0] * o, p[1] + n[1] * o], [p[0] + n[0] * o + Math.cos(a) * 26 * U, p[1] + n[1] * o + Math.sin(a) * 18 * U], [p[0] + n[0] * o + Math.cos(a + 0.8) * 44 * U, p[1] + n[1] * o + Math.sin(a + 0.8) * 30 * U]]); }

        const gTex = mk(cam, INK.inkSoft), hillR = mk(cam, INK.inkSoft);
        const pondF = mk(cam, INK.blue, { 'fill-opacity': 0.5 }), pondR = mk(cam), pondRip = mk(cam, INK.paperLight);
        const bedF = mk(cam, INK.paperDark), riverF = mk(cam, INK.blue, { 'fill-opacity': 0.45 }), oldF = mk(cam, INK.blue), chanF = mk(cam, INK.blue, { 'fill-opacity': 0.45 });
        const flowR = mk(cam, INK.paperLight), crackR = mk(cam, INK.inkSoft), stoneF = mk(cam, INK.paperDark), bankR = mk(cam);
        const heapF = mk(cam, INK.paperDark), heapR = mk(cam);
        const campF = mk(cam, INK.paperLight), campR = mk(cam), campP = mk(cam, colOf(Cp.color, INK.red));
        const digG = el(cam, 'g'), digR = mk(digG);
        const RL = typeof R.label === 'string' ? { text: R.label } : (R.label || null);
        const rlT = RL ? textNode(front, Object.assign({ size: 58 }, RL), 58, INK.blue) : null;
        const nD = P.diggers ?? 4;

        let lastStep = -1;
        upd = (lt, dur, cues, t) => {
          const step = inkFrame(t), redraw = step !== lastStep; lastStep = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const dA = atOr(cues, P.dig, null), tA = atOr(cues, P.turn, null);
          const digP = dA != null ? prog(lt, dA + 0.2, Math.max(1.2, (tA != null ? tA - dA : 2.4) - 0.2)) : 0;
          const turnP = tA != null ? progIO(lt, tA, 1.4) : 0;
          const dryP = tA != null ? progIO(lt, tA + 0.4, 1.6) : 0;
          if (redraw || lt < 0.05) {
            let gt = '';
            tufts.forEach((p, i) => { gt += inkPath([[p[0] - 10 * U, p[1]], [p[0] - 4 * U, p[1] - 16 * U]], O(10 + i, { w: 3, amp: 0.7 })) + ' ' + inkPath([[p[0], p[1]], [p[0] + 4 * U, p[1] - 20 * U]], O(70 + i, { w: 3, amp: 0.7 })) + ' ' + inkPath([[p[0] + 9 * U, p[1]], [p[0] + 14 * U, p[1] - 13 * U]], O(130 + i, { w: 3, amp: 0.7 })) + ' '; });
            gTex.setAttribute('d', gt);
            // two soft contour hills
            let hr = '';
            [[0.88, 0.8, 200, 90], [0.2, 0.5, 150, 70]].forEach((h, i) => { for (let q = 0; q < 3; q++) hr += inkPath(inkEllipsePts(h[0] * W, h[1] * H, (h[2] - q * 50) * U, (h[3] - q * 22) * U, sd + 200 + i * 5 + q, 14), O(200 + i * 5 + q, { closed: true, w: 3 })) + ' '; });
            hillR.setAttribute('d', hr);
            // camp
            let cf = '', cr = '', cpp = '';
            tents.forEach((p, i) => {
              const s = U * 0.9, x = p[0], y = p[1], wv = Math.sin(t * 5 + i) * 6 * s;
              const tn = [[x - 56 * s, y], [x - 40 * s, y - 40 * s], [x, y - 76 * s], [x + 40 * s, y - 40 * s], [x + 56 * s, y]];
              cf += inkLoop(tn, O(300 + i, { smooth: false })) + ' ';
              cr += inkPath(tn, O(310 + i, { w: 4, smooth: false })) + ' ' + inkPath([[x, y - 76 * s], [x, y - 128 * s]], O(320 + i, { w: 3.5 })) + ' ' + inkPath([[x - 10 * s, y], [x, y - 34 * s], [x + 10 * s, y]], O(330 + i, { w: 3 })) + ' ';
              cpp += inkLoop([[x, y - 128 * s], [x + 44 * s, y - 118 * s + wv], [x, y - 104 * s]], O(340 + i)) + ' ';
            });
            campF.setAttribute('d', cf); campR.setAttribute('d', cr); campP.setAttribute('d', cpp);
          }
          // riverbed + water (upper part always wet, old bed dries after the turn)
          const up = rp.slice(0, di + 1), upN = rn.slice(0, di + 1), lo = rp.slice(si), loN = rn.slice(si);
          bedF.setAttribute('d', inkLoop(band(rp, rn, -rw / 2, rw / 2), O(400, { amp: 1 })) + ' ' + (digP > 0 ? inkLoop(band(cp.slice(0, Math.max(2, Math.round(40 * digP)) + 1), cn, -cw / 2, cw / 2), O(401, { amp: 1 })) : ''));
          riverF.setAttribute('d', inkLoop(band(up, upN, -rw * 0.42, rw * 0.42), O(402, { amp: 1 })));
          oldF.setAttribute('d', inkLoop(band(lo, loN, -rw * 0.42, rw * 0.42), O(403, { amp: 1 })));
          oldF.setAttribute('fill-opacity', (0.45 * (1 - dryP)).toFixed(3));
          // channel water: runs from the split towards the pond after the turn
          const wl = Math.round(40 * turnP);
          chanF.setAttribute('d', wl >= 2 ? inkLoop(band(cp.slice(0, wl + 1), cn, -cw * 0.4, cw * 0.4), O(404, { amp: 1 })) : '');
          // banks
          let bk = inkPath(offset(rp, rn, -rw / 2), O(410, { w: 5 })) + ' ' + inkPath(offset(rp, rn, rw / 2), O(411, { w: 5 }));
          if (digP > 0) {
            const k = Math.max(2, Math.round(40 * digP));
            const c0 = cp.slice(0, k + 1), n0 = cn.slice(0, k + 1);
            bk += ' ' + inkPath(offset(c0, n0, -cw / 2), O(412, { w: 4.5 })) + ' ' + inkPath(offset(c0, n0, cw / 2), O(413, { w: 4.5 }));
          }
          bankR.setAttribute('d', bk);
          // flowing dashes
          let fl = '';
          const dash = (pts, nm, k0, n, wet, sp, wd) => {
            for (let q = 0; q < n; q++) {
              const u = mod(lt * sp + q / n, 1), i = Math.floor(u * (pts.length - 4));
              if (i + 3 >= pts.length || !wet(i)) continue;
              const side = ((q * 7) % 3 - 1) * wd * 0.22;
              fl += inkPath([[pts[i][0] + nm[i][0] * side, pts[i][1] + nm[i][1] * side], [pts[i + 2][0] + nm[i + 2][0] * side, pts[i + 2][1] + nm[i + 2][1] * side]], O(k0 + q, { w: 3.5, amp: 0.6 })) + ' ';
            }
          };
          dash(rp, rn, 500, 22, i => i <= di || dryP < 0.5, 0.09, rw);
          if (turnP > 0) dash(cp, cn, 560, 9, i => i < 40 * turnP - 2, 0.16, cw);
          flowR.setAttribute('d', fl);
          // pond fills
          const pf = turnP > 0 ? progIO(lt, tA + 0.8, 1.4) : 0;
          const basin = inkEllipsePts(pond[0], pond[1], prx, pry, sd + 600, 16);
          pondR.setAttribute('d', inkPath(basin, O(600, { closed: true, w: 4 })));
          pondF.setAttribute('d', pf > 0.02 ? inkLoop(inkEllipsePts(pond[0], pond[1], prx * pf * 0.92, pry * pf * 0.88, sd + 601, 16), O(601)) : '');
          let rip = '';
          if (pf > 0.2) for (let q = 0; q < 2; q++) { const u = mod(lt * 0.6 + q * 0.5, 1); rip += inkPath(inkEllipsePts(pond[0], pond[1], prx * pf * 0.75 * u + 8, pry * pf * 0.7 * u + 4, sd + 610 + q, 12), O(610 + q, { closed: true, w: 3, amp: 0.6 })) + ' '; }
          pondRip.setAttribute('d', rip);
          // dried bed: cracks + stones
          let cr2 = '', stn = '';
          if (dryP > 0) {
            cracks.forEach((c, i) => { if (i / cracks.length < dryP) cr2 += inkPath(c, O(700 + i, { w: 3, amp: 0.7, smooth: false })) + ' '; });
            stones.forEach((s, i) => { if (i / stones.length < dryP) { const pts = inkEllipsePts(s[0], s[1], s[2], s[2] * 0.7, sd + 760 + i, 8); stn += inkLoop(pts, O(760 + i)) + ' '; cr2 += inkPath(pts, O(800 + i, { closed: true, w: 2.5 })) + ' '; } });
          }
          // dam of stones across the bed just below the split
          let hf = '', hr2 = '';
          if (digP > 0) {
            const p = rp[di], n = rn[di], nst = 6;
            for (let q = 0; q < nst; q++) {
              const a = dA + 0.5 + q * 0.18, sp2 = lt >= a ? spring(lt, a, 0.45) : 0;
              if (sp2 <= 0) continue;
              const o = (q / (nst - 1) - 0.5) * rw * 1.25, x = p[0] + n[0] * o, y = p[1] + n[1] * o - (1 - sp2) * 40 * U, rr = 15 * U;
              const pts = inkEllipsePts(x, y, rr, rr * 0.8, sd + 900 + q, 8);
              stn += inkLoop(pts, O(900 + q)) + ' '; hr2 += inkPath(pts, O(910 + q, { closed: true, w: 4 })) + ' ';
            }
            // earth heaps along the new channel
            for (let q = 0; q < 4; q++) {
              const u = (q + 0.6) / 5; if (u > digP) continue;
              const i = Math.round(u * 40), c = cp[i], n = cn[i], g = clamp01((digP - u) * 5);
              const x = c[0] + n[0] * cw * 1.25, y = c[1] + n[1] * cw * 1.25, w = 34 * U * g, h = 22 * U * g;
              const pts = [[x - w, y + 4], [x - w * 0.5, y - h * 0.8], [x, y - h], [x + w * 0.6, y - h * 0.7], [x + w, y + 4]];
              hf += inkLoop(pts, O(950 + q)) + ' '; hr2 += inkPath(pts, O(960 + q, { w: 3.5 })) + ' ';
            }
          }
          stoneF.setAttribute('d', stn); crackR.setAttribute('d', cr2); heapF.setAttribute('d', hf); heapR.setAttribute('d', hr2);
          // diggers at the tip of the channel (visible while digging, then they step aside)
          let dg = '';
          if (dA != null && lt >= dA) {
            const ap = spring(lt, dA, 0.5);
            for (let q = 0; q < nD; q++) {
              const u = clamp01(digP - q * 0.08), i = Math.min(39, Math.round(u * 40)), c = cp[i], n = cn[i];
              const side = q % 2 ? 1 : -1, x = c[0] + n[0] * cw * 0.9 * side - (q > 1 ? 30 * U : 0), y = c[1] + n[1] * cw * 0.9 * side;
              const s = 0.42 * U * ap, sw = Math.sin(lt * 7 + q * 1.7);
              const T = (a, b) => [x + a * s, y + b * s];
              const hip = T(0, -60), nk = T(10 + sw * 8, -120), hd = T(16 + sw * 10, -146);
              dg += inkPath([T(-18, 0), hip, T(18, 0)], O(1000 + q * 5, { w: 4.5 })) + ' ' + inkPath([hip, nk], O(1001 + q * 5, { w: 4.5 })) + ' ';
              dg += inkPath(inkEllipsePts(hd[0], hd[1], 20 * s, 20 * s, sd + 1002 + q * 5, 8), O(1002 + q * 5, { closed: true, w: 4 })) + ' ';
              const hand = T(44, -90 + sw * 30), blade = T(70 + sw * 6, -20 + sw * 40);
              dg += inkPath([T(12, -104), hand], O(1003 + q * 5, { w: 4 })) + ' ' + inkPath([T(-10, -150 + sw * 20), blade], O(1004 + q * 5, { w: 4 })) + ' ';
              dg += inkLoop([[blade[0] - 9 * s / 0.42 * 0.42, blade[1]], [blade[0] + 9 * s / 0.42 * 0.42, blade[1]], [blade[0], blade[1] + 18 * s]], O(1005 + q * 5)) + ' ';
            }
          }
          digR.setAttribute('d', dg);
          // labels
          if (rlT) {
            const a = atOr(cues, RL.at, 0.2), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70, t, 1.2);
            const lp = RL.x != null ? [RL.x * W, RL.y * H] : [rp[16][0] - 190 * U, rp[16][1] + 10 * U];
            rlT.setAttribute('opacity', clamp01(p * 2));
            rlT.setAttribute('transform', `translate(${f1(lp[0] + b[0])} ${f1(lp[1] + b[1])}) rotate(${RL.rot ?? -6}) scale(${Math.max(0.001, lerp(0.5, 1, p)).toFixed(3)})`);
          }
          return { hit: atOr(cues, 'hit', null) };
        };
      } else {
        // ================================================================ dry (side-on close-up of the dry bed)
        const gy = H * 0.56, by = H * (P.bed_y ?? 0.86);
        const bankL = [[-40, gy], [W * 0.1, gy + 6], [W * 0.18, by - 30 * U], [W * 0.24, by]], bankR = [[W * 0.78, by], [W * 0.84, by - 40 * U], [W * 0.9, gy + 8], [W + 40, gy]];
        const tiles = []; for (let i = 0; i < 26; i++) { const x = lerp(W * 0.2, W * 0.82, r()), y = lerp(by - 4 * U, H * 0.99, r()); tiles.push([x, y, r() * TAU]); }
        const stones = []; for (let i = 0; i < 9; i++) stones.push([lerp(W * 0.2, W * 0.85, r()), by + r() * (H * 0.97 - by), (10 + r() * 16) * U]);
        const reeds = []; for (let i = 0; i < 10; i++) { const left = i < 5; reeds.push([left ? lerp(W * 0.02, W * 0.14, r()) : lerp(W * 0.86, W * 0.98, r()), gy + (r() * 14) * U, r()]); }
        const farF = mk(cam, INK.paperDark, { 'fill-opacity': 0.55 }), farR = mk(cam, INK.inkSoft);
        const rowG = el(cam, 'g');
        const bedF = mk(cam, INK.paperDark, { 'fill-opacity': 0.75 }), bedR = mk(cam), crackR = mk(cam, INK.inkSoft), stoneF = mk(cam, INK.paperDark), stoneR = mk(cam), reedR = mk(cam, INK.inkSoft), waveR = mk(cam, INK.inkSoft);
        const qG = el(front, 'g'), qT = el(qG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 230 * U, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        qT.textContent = '?';
        const castG = el(cam, 'g');
        const Rw = Object.assign({ n: 9, color: P.team || 'blue', y: 0.555, x0: 0.18, x1: 0.86, scale: 0.34 }, P.row || {});
        const row = []; for (let i = 0; i < Rw.n; i++) { const g = el(rowG, 'g'); row.push({ g, paint: heat.painter ? heat.painter(g) : null, x: W * lerp(Rw.x0, Rw.x1, Rw.n > 1 ? i / (Rw.n - 1) : 0.5), k: i }); }
        const cast = (P.cast || [{ x: 0.36, face: 1, carry: 'bucket', emotion: 'worried' }, { x: 0.58, face: -1, carry: 'skin', emotion: 'worried', pose: 'shrug' }, { x: 0.74, face: -1, pose: 'idle', emotion: 'worried' }]).map((m, i) => {
          const g = el(castG, 'g');
          const rig = KASIF.create(el(g, 'g'), { scale: 1, hat: false, accessory: 'beret', seed: sd + 40 + i * 7 });
          const itF = mk(g, INK.paperDark), itR = mk(g), drip = mk(g, INK.blue);
          return { m, g, rig, itF, itR, drip };
        });
        let lastStep = -1;
        upd = (lt, dur, cues, t) => {
          const step = inkFrame(t), redraw = step !== lastStep; lastStep = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const qa = atOr(cues, P.q, null), drA = atOr(cues, P.dry, null), drP = drA != null ? progIO(lt, drA, 1.2) : 0;
          if (redraw || lt < 0.05) {
            // far bank + hills
            const ridge = []; for (let i = 0; i <= 12; i++) ridge.push([i / 12 * (W + 80) - 40, gy - 150 * U - Math.sin(i * 1.2 + 2) * 24 * U - Math.sin(i * 0.5) * 20 * U]);
            farF.setAttribute('d', inkLoop(ridge.concat([[W + 40, gy], [-40, gy]]), O(10, { amp: 1 })));
            farR.setAttribute('d', inkPath(ridge, O(11, { w: 4 })));
            const bed = bankL.concat(bankR, [[W + 40, H + 40], [-40, H + 40]]);
            bedF.setAttribute('d', inkLoop(bed, O(20, { smooth: false })));
            bedR.setAttribute('d', inkPath(bankL, O(21, { w: 6 })) + ' ' + inkPath(bankR, O(22, { w: 6 })) + ' ' + inkPath([[W * 0.24, by], [W * 0.5, by + 6 * U], [W * 0.78, by]], O(23, { w: 4 })));
            let rd = '';
            reeds.forEach((p, i) => { for (let q = 0; q < 3; q++) rd += inkPath([[p[0] + q * 10 * U, p[1]], [p[0] + q * 10 * U + (q - 1) * 14 * U + Math.sin(t + i) * 3, p[1] - (50 + p[2] * 40 - q * 10) * U]], O(30 + i * 3 + q, { w: 3.5, amp: 0.7 })) + ' '; });
            reedR.setAttribute('d', rd);
          }
          // cracks (spread on the `dry` cue) + stones
          let cd = '', sf = '', sr = '';
          tiles.forEach((p, i) => {
            const vis = drA == null ? 1 : (i / tiles.length < 0.35 + 0.65 * drP ? 1 : 0);
            if (!vis) return;
            const a = p[2], L = 48 * U;
            cd += inkPath([[p[0], p[1]], [p[0] + Math.cos(a) * L * 0.5, p[1] + Math.sin(a) * L * 0.2], [p[0] + Math.cos(a + 0.6) * L, p[1] + Math.sin(a + 0.6) * L * 0.3]], O(100 + i, { w: 3.5, amp: 0.8, smooth: false })) + ' ' +
              inkPath([[p[0] + Math.cos(a) * L * 0.5, p[1] + Math.sin(a) * L * 0.2], [p[0] + Math.cos(a - 1.2) * L * 0.8, p[1] + Math.sin(a - 1.2) * L * 0.25]], O(140 + i, { w: 2.5, amp: 0.8 })) + ' ';
          });
          stones.forEach((s, i) => { const pts = inkEllipsePts(s[0], s[1], s[2], s[2] * 0.66, sd + 200 + i, 8); sf += inkLoop(pts, O(200 + i)) + ' '; sr += inkPath(pts, O(220 + i, { closed: true, w: 3 })) + ' '; });
          crackR.setAttribute('d', cd); stoneF.setAttribute('d', sf); stoneR.setAttribute('d', sr);
          // heat shimmer
          let wd = '';
          for (let q = 0; q < 5; q++) {
            const rise = mod(lt * 20 * U + q * 31 * U, 120 * U), y0 = gy - 190 * U - rise - (q % 2) * 40 * U, xa = W * (0.08 + q * 0.18), pts = [];
            for (let j = 0; j <= 8; j++) { const x = xa + j * 30 * U; pts.push([x, y0 + Math.sin(x * 0.03 / U + lt * 4 + q) * 6 * U]); }
            wd += inkPath(pts, O(300 + q, { w: 3, amp: 0.6, taper: 0.8 })) + ' ';
          }
          waveR.setAttribute('d', wd);
          // the row behind (on the far bank)
          const qp = qa != null ? punch(lt, qa, 0.7) : 0;
          row.forEach((s, i) => {
            if (!s.paint) return;
            const st = heat.soldier({ t, k: s.k, walk: 0, lean: 4 + Math.sin(t * 0.8 + i) * 2, team: colOf(Rw.color, INK.blue), carry: i % 3 === 1 ? 'banner' : 'spear', droop: 0.3, worried: 0.5 });
            s.paint(st, t, sd + 400 + i * 60, s.x, H * Rw.y + (i % 2 ? -6 : 6) * U, Rw.scale * U * (1 + 0.05 * qp), i % 2 ? -1 : 1);
          });
          // red "?" above the row
          if (qa != null && lt >= qa) {
            const p = spring(lt, qa, 0.5), b = boil(sd + 77, t, 1.6);
            qG.setAttribute('opacity', clamp01(p * 3));
            qG.setAttribute('transform', `translate(${f1(W * 0.52 + b[0])} ${f1(H * 0.3 + b[1])}) rotate(-6) scale(${(lerp(1.8, 1, p) * (1 + 0.1 * qp)).toFixed(3)})`);
          } else qG.setAttribute('opacity', 0);
          // cast in the bed
          cast.forEach((c, i) => {
            const m = c.m, sg = segs(m, cues, lt), o = sg.o, s = (m.scale ?? 0.62) * U;
            o.x = m.x * W; o.y = (m.y != null ? m.y * H : by + 30 * U); o.scale = s;
            let pose = sg.pose;
            const shA = m.shake != null ? atOr(cues, m.shake, null) : (drA ?? 0.6);
            const out = c.rig.update(t, m.carry && pose === 'idle' ? 'idle' : pose, o);
            if (m.carry && out && out.hands) {
              const fc = o.face >= 0 ? 1 : -1;
              const hl = out.hands[1] || out.hands[0], ff = o.face, hand = [o.x + hl[0] * ff * s, o.y + hl[1] * s];
              const shaking = lt >= shA, ang = shaking ? 180 + Math.sin((lt - shA) * 14) * 18 : 20;
              const C2 = [hand[0], hand[1]];
              const Rp = (x, y) => { const v = rotV([x * s * 1.6 * fc, y * s * 1.6], ang * fc); return [C2[0] + v[0], C2[1] + v[1]]; };
              let f = '', rr = '';
              if (m.carry === 'bucket') {
                const b = [Rp(-30, 4), Rp(30, 4), Rp(24, 64), Rp(-24, 64)];
                f = inkLoop(b, O(500 + i * 9, { smooth: false }));
                rr = inkPath(b, O(501 + i * 9, { closed: true, w: 5, smooth: false })) + ' ' + inkPath([Rp(-28, 24), Rp(28, 24)], O(502 + i * 9, { w: 3 })) + ' ' + inkPath([Rp(-30, 4), Rp(-18, -22), Rp(0, -28), Rp(18, -22), Rp(30, 4)], O(503 + i * 9, { w: 3.5 }));
              } else {
                const b = [Rp(-30, 10), Rp(-22, -10), Rp(4, -16), Rp(30, -6), Rp(36, 18), Rp(20, 40), Rp(6, 46), Rp(4, 66), Rp(-8, 66), Rp(-10, 44), Rp(-26, 34)];
                f = inkLoop(b, O(504 + i * 9));
                rr = inkPath(b, O(505 + i * 9, { closed: true, w: 5 }));
              }
              c.itF.setAttribute('d', f); c.itR.setAttribute('d', rr);
              // one sad drop from the upturned vessel
              let dd = '';
              if (shaking) {
                const u = mod((lt - shA - 0.3) / 1.6, 1), mouth = m.carry === 'bucket' ? Rp(0, 4) : Rp(-2, 66), y = lerp(mouth[1], o.y, u * u);
                if (lt - shA > 0.3 && u < 0.92) dd = inkLoop([[mouth[0], y - 12 * U], [mouth[0] + 7 * U, y + 2 * U], [mouth[0], y + 8 * U], [mouth[0] - 7 * U, y + 2 * U]], O(509 + i * 9, { amp: 0.4 }));
              }
              c.drip.setAttribute('d', dd);
            }
          });
          return { hit: atOr(cues, 'hit', null) };
        };
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const res = upd(lt, dur, cues, t) || {};
          const hit = punch(lt, res.hit, 0.7);
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          const fc = Cm.focus || [0.5, 0.6], fx = fc[0] * W, fy = fc[1] * H;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.33) * 4)} ${f1(fy + Math.cos(lt * 0.29) * 3)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          labels.forEach((lb, i) => {
            const L = lb.L, a = atOr(cues, L.at, 0.3), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 80 + i, t, 1.4);
            lb.t.setAttribute('opacity', clamp01(p * 2));
            lb.t.setAttribute('transform', `translate(${f1(W * (L.x ?? 0.5) + b[0])} ${f1(H * (L.y ?? 0.15) + b[1])}) rotate(${L.rot ?? -3}) scale(${Math.max(0.001, lerp(0.5, 1, p)).toFixed(3)})`);
          });
          if (noteT) {
            const a = atOr(cues, N.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 90, t, 1.4);
            noteT.setAttribute('opacity', clamp01(p * 2));
            noteT.setAttribute('transform', `translate(${f1(W * (N.x ?? 0.2) + b[0])} ${f1(H * (N.y ?? 0.14) + b[1])}) rotate(${N.rot ?? -4}) scale(${Math.max(0.001, lerp(0.5, 1, p)).toFixed(3)})`);
          }
          if (kasR) {
            const sg = segs(K, cues, lt), o = sg.o;
            o.x = K.x * W; o.y = K.y != null ? K.y * H : H * 0.97; o.scale = K.scale * U;
            kasR.update(t, sg.pose, o);
          }
        },
      };
    },
  };
})();
