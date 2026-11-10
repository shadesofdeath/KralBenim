// lv_livingstone: shots for the Stickstory Short "Doctor Livingstone, I presume?" (2026-11-10). The New York Herald
// (James Gordon Bennett Jr.) sent its reporter Henry Morton Stanley to find the missionary-explorer David Livingstone,
// missing in Africa for years; Stanley left Zanzibar in March 1871 and found him at Ujiji on Lake Tanganyika about
// seven months later (late Oct / Nov 1871: the date is debated). The page of Stanley's diary for the meeting is
// missing (torn out), so nobody can confirm the famous greeting (Smithsonian Magazine; Tim Jeal, Stanley, 2007).
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any explorer / lakeshore / diary story.
// Uses lh__lib.js (LH.kasif, LH.label, LH.front) at build time.
//
// Common: labels [{text, x, y, at, size, color, font, card, rot}] (LH.label), kasif {x, y, scale, pose, face, dir,
//   emotion, seq} (LH.kasif). People are hatless period figures (KASIF rig, hat: false) with drawn headgear:
//   "pith" (white sun helmet: Stanley) or "cap" (faded blue peaked cap: Livingstone, grey beard).
//
// SHOTS.lv_shore — Ujiji on Lake Tanganyika (set "sea": pass ground ~1150 and horizon ~800). Far mountains across the
//   lake, a dhow sailing, palms, flat-roofed mud houses, sandy shore and a row of onlookers' heads in the foreground.
//   P: {mode: "hook"|"arrive"|"greet"|"dusk", bubble: {text: ["I PRESUME?"], at, x, y, size}, stamp: {text, at, x, y,
//       size, rot}, kasif, labels, crowd: true}
//   "hook": Stanley (left) lifts his helmet to Livingstone (right); speech bubble; a red stamp slams on cue "hit".
//   "arrive": wide: Stanley's caravan (flag bearer with the Stars and Stripes, porters with loads) walks in from the left
//     towards Livingstone, who stands in front of a house; at cue "hit" he turns and raises a hand.
//   "greet": closer two-shot; Stanley lifts his helmet at cue "hat", the bubble pops at its cue.
//   "dusk": low sun over the lake, the dhow crosses; only Kaşif on the shore (P.kasif).
// SHOTS.lv_office — a newspaper office (set "interior"): a big wall sign (P.sign, "NEW YORK HERALD"), a wall map of
//   Africa with a red "?" on the great lakes, the editor behind his desk points at it, the reporter stands in front;
//   at cue "hit" a letter flies from the editor's hand to the reporter's; a desk front fills the frame bottom.
//   P: {sign, order: {text, at} (red card on the letter), labels}
// SHOTS.lv_map — an old map of Africa filling the frame (no set): coast, Lake Victoria and Lake Tanganyika, Zanzibar;
//   a big "?" pulses over Lake Tanganyika, a red ring draws around it at cue "hit"; ocean hatching, a compass rose and a
//   small sailing ship fill the bottom. P: {labels, stamp: {text, at, x, y}, route: {at, dur} (dashed route Zanzibar ->
//   Ujiji, optional)}
// SHOTS.lv_trek — the caravan's march through the dry grassland (set "field"): flat-topped acacias, a long line of
//   porters with loads on their heads behind Stanley and the flag, tall grass in the foreground; the sun crosses the
//   sky and days tick by (moon/sun cycles) while the column walks. P: {labels, n: 6 (porters)}
// SHOTS.lv_diary — a big open notebook on a desk (set "interior"), close: handwritten pages; a candle, an inkpot with a
//   quill and the desk front fill the bottom. P: {mode: "flip"|"torn", kasif, labels, ring: true}
//   "flip": pages keep turning (Kaşif beside it, P.kasif); "torn": the right page rips out at cue "hit" and flutters
//   away, leaving a jagged stub along the gutter; a red ring draws around the stub.
// cues: hit, hat, bubble/stamp "at", labels "at", Kaşif seq "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const RC = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const R2 = (p, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const FR = 'Fraunces, Georgia, serif';
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const MUD = () => mix(INK.stain, INK.paperDark, 0.35), MUD_D = () => mix(INK.stain, INK.ink, 0.35);
  const SAND = () => mix(INK.gold, INK.paperLight, 0.55), LAKE = () => mix(INK.blue, INK.paperLight, 0.45);
  const LEAF = () => mix(INK.green, INK.ink, 0.15), LEAF_L = () => mix(INK.green, INK.paperLight, 0.3);
  const CROWD = () => mix(INK.ink, INK.inkSoft, 0.45);

  // ------------------------------------------------------------------ a period figure with headgear
  // o: {hat: "pith"|"cap"|null, beard, scale}; update(t, pose, ro, ex) -> {head, hands} (stage px)
  // ex: {hatHand: true (the helmet is lifted in the raised hand), hatTilt}
  function man(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const sc = o.scale ?? 0.9;
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, beard: o.beard || null, seed });
    const hg = el(g, 'g');
    const hatF = inkEl(hg, o.hat === 'cap' ? mix(INK.blue, INK.paperLight, 0.3) : INK.paperLight), band = inkEl(hg, o.hat === 'cap' ? INK.gold : mix(INK.paperDark, INK.stain, 0.3));
    const peak = inkEl(hg, INK.ink), hatR = inkEl(hg);
    return {
      update(t, pose, ro, ex = {}) {
        const r = rig.update(t, pose, ro);
        const f = ro.face ?? 1, s = sc * (ro.scale ?? 1);
        const S = p => [ro.x + f * s * p[0], ro.y + s * p[1]];
        const head = S(r.head), hands = r.hands.map(S);
        if (!o.hat) { blank(hatF, band, peak, hatR); return { head, hands }; }
        // headgear points in rig units, relative to the head centre (or the lifted hand)
        let base = r.head, tilt = 0, lift = 0;
        if (ex.hatHand) { const hi = r.hands[0][1] < r.hands[1][1] ? r.hands[0] : r.hands[1]; base = [hi[0] + 92, hi[1] + 24]; tilt = ex.hatTilt ?? -14; lift = 0; }
        const M = pts => pts.map(p => { const q = R2([p[0], p[1] + lift], tilt); return S([base[0] + q[0], base[1] + q[1]]); });
        const sd = seed * 31 + 7;
        if (o.hat === 'pith') {
          const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; dome.push([Math.cos(a) * 80, -34 + Math.sin(a) * 96]); }
          const brim = inkEllipsePts(0, -34, 118, 22, sd, 14, 0, 0.02);
          const D = M(dome.concat([[80, -34], [-80, -34]])), B = M(brim);
          hatF.setAttribute('d', inkLoop(B, { seed: sd, t, amp: 1 }) + ' ' + inkLoop(D, { seed: sd + 1, t, amp: 1 }));
          band.setAttribute('d', inkLoop(M([[-79, -38], [-74, -62], [74, -62], [79, -38]]), { seed: sd + 2, t, amp: 0.8, smooth: false }));
          peak.setAttribute('d', '');
          hatR.setAttribute('d', inkPath(B, { w: 5, seed: sd + 3, t, closed: true }) + ' ' + inkPath(M(dome), { w: 5.5, seed: sd + 4, t }) + ' ' + inkPath(M([[-6, -128], [8, -128]]), { w: 9, seed: sd + 5, t }));
        } else {
          const CR = M([[-66, -36], [-80, -96], [78, -98], [68, -36]]), BD = M([[-67, -36], [-69, -58], [69, -60], [68, -36]]);
          const PK = M([[26, -40], [124, -28], [118, -16], [26, -28]]);
          hatF.setAttribute('d', inkLoop(CR, { seed: sd, t, amp: 0.9, smooth: false }));
          band.setAttribute('d', inkLoop(BD, { seed: sd + 2, t, amp: 0.7, smooth: false }));
          peak.setAttribute('d', inkLoop(PK, { seed: sd + 3, t, amp: 0.6 }));
          hatR.setAttribute('d', inkPath(CR, { w: 5, seed: sd + 4, t, closed: true, smooth: false }));
        }
        return { head, hands };
      },
    };
  }

  // ------------------------------------------------------------------ speech bubble (Fraunces 900, ink on paper-light)
  function bubble(parent, sd) {
    const g = el(parent, 'g'), fill = inkEl(g, INK.paperLight), rim = inkEl(g);
    const tx = [0, 1, 2].map(() => el(g, 'text', { 'text-anchor': 'middle', 'font-family': FR, 'font-weight': 900, fill: INK.ink }));
    return {
      update(t, x, y, lines, size, p, tail) {
        if (p <= 0.001 || !lines || !lines.length) { g.setAttribute('transform', 'scale(0)'); return; }
        const n = lines.length, lh = size * 1.12, wmax = Math.max(...lines.map(l => l.length)) * size * 0.66 + size * 1.0;
        const h = n * lh + size * 0.75, x0 = x - wmax / 2, y0 = y - h / 2;
        const box = [[x0, y0 + 30], [x0 + 30, y0], [x0 + wmax - 30, y0], [x0 + wmax, y0 + 30], [x0 + wmax, y0 + h - 30], [x0 + wmax - 30, y0 + h]];
        const tb = [Math.max(x0 + 60, Math.min(x0 + wmax - 60, tail[0])), y0 + h];
        box.push([tb[0] + 40, y0 + h], tail, [tb[0] - 30, y0 + h], [x0 + 30, y0 + h], [x0, y0 + h - 30]);
        fill.setAttribute('d', inkLoop(box, { seed: sd, t, amp: 1, smooth: false }));
        rim.setAttribute('d', inkPath(box, { w: 6, seed: sd + 1, t, closed: true, smooth: false }));
        tx.forEach((e, i) => {
          e.textContent = lines[i] || '';
          e.setAttribute('x', f1(x)); e.setAttribute('y', f1(y0 + size * 0.42 + lh * (i + 0.72))); e.setAttribute('font-size', f1(size));
        });
        const b = boil(sd + 5, t, 1);
        g.setAttribute('transform', `translate(${f1(tail[0] + b[0])} ${f1(tail[1] + b[1])}) scale(${p.toFixed(3)}) translate(${f1(-tail[0])} ${f1(-tail[1])})`);
      },
    };
  }

  // ------------------------------------------------------------------ red rubber stamp
  function stamp(parent, sd) {
    const g = el(parent, 'g'), bg = inkEl(g, INK.paperLight, { 'fill-opacity': 0.8 }), rim = inkEl(g, INK.red);
    const tx = el(g, 'text', { 'text-anchor': 'middle', 'font-family': FR, 'font-weight': 900, fill: INK.red });
    return {
      update(t, x, y, text, size, rot, lt, a) {
        if (a == null || lt < a) { g.setAttribute('transform', 'scale(0)'); return; }
        const k = clamp01((lt - a) / 0.18), sc = lerp(1.9, 1, k * k) * (1 + 0.06 * punch(lt, a + 0.18, 0.4));
        tx.textContent = text; tx.setAttribute('font-size', size); tx.setAttribute('x', 0); tx.setAttribute('y', f1(size * 0.36));
        const w = text.length * size * 0.68 + size * 0.7, h = size * 1.35;
        bg.setAttribute('d', inkLoop(RC(-w / 2, -h / 2, w / 2, h / 2), { seed: sd, t, amp: 1, smooth: false }));
        rim.setAttribute('d', inkPath(RC(-w / 2, -h / 2, w / 2, h / 2), { w: 10, seed: sd + 1, t, closed: true, smooth: false }) + ' ' + inkPath(RC(-w / 2 + 14, -h / 2 + 14, w / 2 - 14, h / 2 - 14), { w: 4, seed: sd + 2, t, closed: true, smooth: false }));
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${sc.toFixed(3)})`);
        g.style.opacity = k;
      },
    };
  }

  // ------------------------------------------------------------------ palm tree (base at x, gy; height h)
  function palm(parent, sd) {
    const trunk = inkEl(parent, MUD_D()), leaf = inkEl(parent, LEAF()), leafR = inkEl(parent), nuts = inkEl(parent, MUD_D());
    return {
      update(t, x, gy, h, lean = 1, k = 1) {
        const sw = Math.sin(t * 0.9 + sd) * 10 * k;
        const top = [x + lean * h * 0.22 + sw, gy - h];
        const tp = [[x, gy], [x + lean * h * 0.05, gy - h * 0.4], [x + lean * h * 0.14 + sw * 0.4, gy - h * 0.75], top];
        trunk.setAttribute('d', inkPath(tp, { w: 22, seed: sd, t, taper: 0.1, amp: 1 }));
        const L = [], LR = [];
        for (let i = 0; i < 7; i++) {
          const a = (-170 + i * 30 + Math.sin(t * 1.3 + i) * 5) * Math.PI / 180, len = h * (0.42 + 0.08 * hn(sd, i));
          const mid = [top[0] + Math.cos(a) * len * 0.55, top[1] + Math.sin(a) * len * 0.55 - len * 0.12];
          const end = [top[0] + Math.cos(a) * len, top[1] + Math.sin(a) * len + len * 0.25];
          const nx = -Math.sin(a) * 18, ny = Math.cos(a) * 18;
          const pts = [top, [mid[0] + nx, mid[1] + ny], end, [mid[0] - nx, mid[1] - ny]];
          L.push(inkLoop(pts, { seed: sd + 10 + i, t, amp: 1 }));
          LR.push(inkPath([top, mid, end], { w: 4, seed: sd + 20 + i, t }));
        }
        leaf.setAttribute('d', L.join(' ')); leafR.setAttribute('d', LR.join(' '));
        nuts.setAttribute('d', [0, 1, 2].map(i => inkCircle(top[0] - 14 + i * 14, top[1] + 16, 10, sd + 30 + i, t, { fill: true })).join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ flat-roofed mud house (tembe), bottom centre at x, gy
  function house(parent, sd) {
    const wall = inkEl(parent, MUD()), roof = inkEl(parent, MUD_D()), door = inkEl(parent, INK.ink), rim = inkEl(parent);
    return {
      update(t, x, gy, w, h) {
        const WL = RC(x - w / 2, gy - h, x + w / 2, gy);
        wall.setAttribute('d', inkLoop(WL, { seed: sd, t, amp: 1, smooth: false }));
        roof.setAttribute('d', inkLoop(RC(x - w / 2 - 16, gy - h - 22, x + w / 2 + 16, gy - h + 4), { seed: sd + 1, t, amp: 1, smooth: false }));
        door.setAttribute('d', inkLoop(RC(x - w * 0.09, gy - h * 0.62, x + w * 0.09, gy), { seed: sd + 2, t, amp: 0.6, smooth: false }));
        const poles = []; for (let i = 0; i < 6; i++) { const px = x - w / 2 + 10 + i * (w - 20) / 5; poles.push(inkPath([[px, gy - h - 8], [px + 6, gy - h + 14]], { w: 6, seed: sd + 10 + i, t })); }
        rim.setAttribute('d', inkPath(WL, { w: 5, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + poles.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ dhow with a lateen sail (waterline centre x, y)
  function dhow(parent, sd) {
    const sail = inkEl(parent, INK.paperLight), hull = inkEl(parent, MUD_D()), rim = inkEl(parent);
    return {
      update(t, x, y, s) {
        const bob = Math.sin(t * 1.4 + sd) * 4 * s;
        const HU = [[x - 120 * s, y - 30 * s + bob], [x + 140 * s, y - 40 * s + bob], [x + 90 * s, y + bob], [x - 90 * s, y + bob]];
        const SA = [[x - 10 * s, y - 34 * s + bob], [x + 20 * s, y - 250 * s + bob], [x + 150 * s, y - 60 * s + bob]];
        sail.setAttribute('d', inkLoop(SA, { seed: sd, t, amp: 1, smooth: false }));
        hull.setAttribute('d', inkLoop(HU, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        rim.setAttribute('d', inkPath(SA, { w: 4, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath(HU, { w: 5, seed: sd + 3, t, closed: true, smooth: false }) +
          ' ' + inkPath([[x + 4 * s, y - 34 * s + bob], [x + 20 * s, y - 200 * s + bob]], { w: 5, seed: sd + 4, t }));
      },
    };
  }

  // ------------------------------------------------------------------ onlookers' heads and shoulders (foreground row)
  function crowd(parent, sd, n = 7) {
    const body = inkEl(parent, CROWD()), wrap = inkEl(parent, mix(INK.paperLight, INK.stain, 0.25)), rim = inkEl(parent);
    return {
      update(t, W, H, y0) {
        const B = [], WR = [], R = [];
        for (let i = 0; i < n; i++) {
          const x = (i + 0.5 + (hn(sd, i) - 0.5) * 0.5) / n * W, bob = Math.sin(t * 1.5 + i * 1.3) * 6, s = 1 + 0.25 * hn(sd + 1, i);
          const y = y0 + 60 * hn(sd + 2, i) + bob;
          const sh = [[x - 150 * s, H + 40], [x - 130 * s, y + 150 * s], [x - 50 * s, y + 104 * s], [x + 50 * s, y + 104 * s], [x + 130 * s, y + 150 * s], [x + 150 * s, H + 40]];
          B.push(inkLoop(sh, { seed: sd + 10 + i, t, amp: 1 }), inkCircle(x, y + 30 * s, 62 * s, sd + 20 + i, t, { fill: true }));
          if (i % 3 === 1) WR.push(inkLoop(inkEllipsePts(x, y - 16 * s, 66 * s, 34 * s, sd + 30 + i, 10, 0, 0.05), { seed: sd + 30 + i, t, amp: 0.8 }));
          R.push(inkPath(sh.slice(1, 5), { w: 4, seed: sd + 40 + i, t }));
        }
        body.setAttribute('d', B.join(' ')); wrap.setAttribute('d', WR.join(' ')); rim.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ porter's load on the head / Stars and Stripes flag
  function load(parent, sd) {
    const f = inkEl(parent, mix(INK.paperLight, INK.stain, 0.45)), r = inkEl(parent);
    return { update(t, items) {
      const F = [], RR = [];
      items.forEach((h, i) => { const B = RC(h[0] - 50 * h[2], h[1] - 120 * h[2], h[0] + 50 * h[2], h[1] - 60 * h[2]); F.push(inkLoop(B, { seed: sd + i, t, amp: 0.8, smooth: false })); RR.push(inkPath(B, { w: 4, seed: sd + 20 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[h[0] - 50 * h[2], h[1] - 90 * h[2]], [h[0] + 50 * h[2], h[1] - 90 * h[2]]], { w: 3, seed: sd + 40 + i, t })); });
      f.setAttribute('d', F.join(' ')); r.setAttribute('d', RR.join(' '));
    } };
  }
  function flag(parent, sd) {
    const pole = inkEl(parent), cloth = inkEl(parent, INK.paperLight), red = inkEl(parent, INK.red), blue = inkEl(parent, INK.blue), stars = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    return {
      update(t, base, top, s) {
        pole.setAttribute('d', inkPath([base, top], { w: 8 * s, seed: sd, t }));
        const fw = 230 * s, fh = 150 * s;
        const P = (u, v) => [top[0] + u * fw, top[1] + 10 * s + v * fh + Math.sin(t * 4 + u * 5) * 12 * s * u];
        const quad = (u0, v0, u1, v1) => { const pts = []; for (let k = 0; k <= 4; k++) pts.push(P(lerp(u0, u1, k / 4), v0)); for (let k = 4; k >= 0; k--) pts.push(P(lerp(u0, u1, k / 4), v1)); return pts; };
        cloth.setAttribute('d', inkLoop(quad(0, 0, 1, 1), { seed: sd + 1, t, amp: 0.8 }));
        const RD = []; for (let i = 0; i < 7; i += 2) RD.push(inkLoop(quad(0, i / 7, 1, (i + 1) / 7), { seed: sd + 2 + i, t, amp: 0.5 }));
        red.setAttribute('d', RD.join(' '));
        blue.setAttribute('d', inkLoop(quad(0, 0, 0.42, 4 / 7), { seed: sd + 12, t, amp: 0.5 }));
        const ST = []; for (let i = 0; i < 6; i++) { const p = P(0.07 + (i % 3) * 0.14, 0.12 + Math.floor(i / 3) * 0.28); ST.push(inkCircle(p[0], p[1], 6 * s, sd + 20 + i, t, { fill: true })); }
        stars.setAttribute('d', ST.join(' '));
        rim.setAttribute('d', inkPath(quad(0, 0, 1, 1), { w: 4, seed: sd + 30, t, closed: true }));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.lv_shore
  SH.lv_shore = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, mode = P.mode || 'hook', u = W / 1080;
      const hz = (P.horizon ?? 0.42) * H, gy = (P.ground ?? 0.6) * H;
      const root = el(svg, 'g');
      const mtn = inkEl(root, mix(INK.blue, INK.paperLight, 0.25)), mtnR = inkEl(root), sunG = inkEl(root, INK.gold, { 'fill-opacity': 0.85 }), glitter = inkEl(root, INK.paperLight);
      const waves = inkEl(root, mix(INK.blue, INK.ink, 0.1));
      const boat = dhow(el(root, 'g'), sd + 10);
      const shore = inkEl(root, SAND()), shoreR = inkEl(root), stones = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3));
      const houses = [0, 1, 2].map(i => house(el(root, 'g'), sd + 20 + i * 10));
      const palms = [0, 1].map(i => palm(el(root, 'g'), sd + 60 + i * 20));
      const fl = (mode === 'arrive') ? flag(el(root, 'g'), sd + 100) : null;
      const ld = (mode === 'arrive') ? load(el(root, 'g'), sd + 120) : null;
      const porters = mode === 'arrive' ? [0, 1, 2].map(i => man(el(root, 'g'), seed * 7 + 20 + i, { scale: 0.62 - i * 0.03 })) : [];
      const bearer = mode === 'arrive' ? man(el(root, 'g'), seed * 7 + 30, { scale: 0.66 }) : null;
      const big = mode === 'greet' ? 1.25 : mode === 'hook' ? 1.12 : 0.72;
      const stan = mode !== 'dusk' ? man(el(root, 'g'), seed * 7 + 1, { hat: 'pith', scale: big }) : null;
      const liv = mode !== 'dusk' ? man(el(root, 'g'), seed * 7 + 2, { hat: 'cap', beard: 'grey', scale: big }) : null;
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const cr = P.crowd !== false && mode !== 'dusk' ? crowd(el(root, 'g'), sd + 200, 6) : null;
      const beached = mode === 'dusk' ? dhow(el(root, 'g'), sd + 15) : null;
      const reeds = inkEl(root, LEAF()), reedsL = inkEl(root, LEAF_L());
      const bub = bubble(el(root, 'g'), sd + 300), stp = stamp(el(root, 'g'), sd + 310);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.55);
          // far mountains across the lake
          const M = []; for (let i = 0; i <= 24; i++) { const x = -40 + i * (W + 80) / 24; M.push([x, hz - (60 + 70 * Math.abs(Math.sin(i * 0.7 + sd)) + 30 * Math.sin(i * 1.9)) * u]); }
          mtn.setAttribute('d', inkLoop(M.concat([[W + 40, hz + 4], [-40, hz + 4]]), { seed: sd, t, amp: 1, smooth: false }));
          mtnR.setAttribute('d', inkPath(M, { w: 4, seed: sd + 1, t }));
          if (mode === 'dusk') {
            const sy = hz - 120 * u + lt * 10 * u;
            sunG.setAttribute('d', inkCircle(0.72 * W, sy, 95 * u, sd + 2, t, { fill: true }));
            const GL = []; for (let i = 0; i < 9; i++) { const y = hz + 20 * u + i * 26 * u, w = (140 - i * 6) * u * (0.7 + 0.3 * Math.sin(t * 3 + i)); GL.push(inkPath([[0.72 * W - w, y], [0.72 * W + w, y]], { w: 6, seed: sd + 3 + i, t })); }
            glitter.setAttribute('d', GL.join(' '));
          } else blank(sunG, glitter);
          // little waves on the lake
          const WV = []; for (let i = 0; i < 16; i++) { const y = hz + 30 * u + (i % 4) * (gy - hz - 90 * u) / 4, x = ((hn(sd + 4, i) * W + t * 22 * (P.sway || 1) * u * (1 + (i % 3))) % (W + 200)) - 100; WV.push(inkPath([[x, y], [x + 30 * u, y - 8 * u], [x + 60 * u, y]], { w: 4, seed: sd + 5 + i, t })); }
          waves.setAttribute('d', WV.join(' '));
          const bx = mode === 'dusk' ? lerp(0.15, 0.55, lt / Math.max(1, dur)) * W : (0.2 + 0.05 * (P.sway || 1) * lt / Math.max(1, dur)) * W;
          boat.update(t, mode === 'greet' ? -9999 : bx, hz + 70 * u, (mode === 'arrive' ? 0.5 : 0.65) * u);
          // shore: sand from the waterline to the frame bottom
          const sh = []; for (let i = 0; i <= 20; i++) sh.push([-40 + i * (W + 80) / 20, gy - 70 * u + Math.sin(i * 1.3) * 8 * u]);
          shore.setAttribute('d', inkLoop(sh.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 30, t, amp: 1, smooth: false }));
          shoreR.setAttribute('d', inkPath(sh, { w: 5, seed: sd + 31, t }));
          const STN = []; for (let i = 0; i < 10; i++) { const x = hn(sd + 32, i) * W, y = gy + 40 * u + hn(sd + 33, i) * (H - gy - 200 * u); STN.push(inkLoop(inkEllipsePts(x, y, 26 * u, 12 * u, sd + 40 + i, 8, 0, 0.1), { seed: sd + 40 + i, t, amp: 0.6 })); }
          stones.setAttribute('d', STN.join(' '));
          // houses + palms behind the cast
          const hy = gy - 60 * u;
          if (mode === 'greet') { houses[0].update(t, 0.86 * W, hy, 380 * u, 250 * u); houses[1].update(t, -9999, hy, 1, 1); houses[2].update(t, -9999, hy, 1, 1); }
          else if (mode === 'dusk') { houses[0].update(t, 0.12 * W, hy, 240 * u, 150 * u); houses[1].update(t, -9999, hy, 1, 1); houses[2].update(t, -9999, hy, 1, 1); }
          else { houses[0].update(t, 0.82 * W, hy, 300 * u, 190 * u); houses[1].update(t, 0.5 * W, hy - 30 * u, 200 * u, 120 * u); houses[2].update(t, mode === 'arrive' ? -9999 : 0.12 * W, hy, 220 * u, 140 * u); }
          palms[0].update(t, (mode === 'greet' ? 0.08 : 0.06) * W, hy, (mode === 'greet' ? 620 : 520) * u, 1, P.sway || 1);
          palms[1].update(t, (mode === 'dusk' ? 0.92 : 0.66) * W, hy - 10 * u, 430 * u, -1, P.sway || 1);
          // cast
          if (mode === 'hook' || mode === 'greet') {
            const lift = mode === 'hook' ? 0 : atOr(cues, 'hat', 0.5), up = lt >= lift;
            const sx = (mode === 'hook' ? 0.26 : 0.28) * W, lx = (mode === 'hook' ? 0.64 : 0.74) * W;
            stan.update(t, up ? 'wave' : 'idle', { x: sx, y: gy, face: 1, since: up ? lt - lift : lt, emotion: 'happy' }, { hatHand: up });
            liv.update(t, mode === 'hook' && lt >= hit ? 'shrug' : 'idle', { x: lx, y: gy, face: -1, since: lt >= hit ? lt - hit : lt, emotion: mode === 'hook' && lt >= hit ? 'surprised' : 'neutral' });
          } else if (mode === 'arrive') {
            const walkEnd = Math.max(1.2, dur * 0.85), k = prog(lt, 0, walkEnd), dx = lerp(-0.35, 0, k) * W, walking = lt < walkEnd;
            const g = KASIF.gait('walk'), ph = (k * 0.35 * W) / (g * 0.7);
            const items = [];
            [0, 1, 2].forEach(i => { const x = 0.12 * W - i * 120 * u + dx; const r = porters[i].update(t, walking ? 'walk' : 'idle', { x, y: gy + 10 * u, face: 1, ph: ph + i * 0.3, since: lt }); items.push([r.head[0], r.head[1] - 40 * u, 0.62]); });
            ld.update(t, items);
            const bxx = 0.26 * W + dx, rb = bearer.update(t, walking ? 'walk' : 'idle', { x: bxx, y: gy + 6 * u, face: 1, ph: ph + 0.5, since: lt });
            fl.update(t, [rb.hands[1][0], rb.hands[1][1] + 30 * u], [rb.hands[1][0] + 10 * u, rb.head[1] - 260 * u], 0.8 * u);
            stan.update(t, walking ? 'walk' : 'idle', { x: 0.4 * W + dx, y: gy, face: 1, ph, since: lt });
            const turn = lt >= hit;
            liv.update(t, turn ? 'wave' : 'idle', { x: 0.74 * W, y: gy - 10 * u, face: turn ? -1 : 1, since: turn ? lt - hit : lt, emotion: turn ? 'surprised' : 'neutral' });
          }
          if (kas) kas.update(lt, t, cues);
          // foreground: reeds at the bottom corners + onlookers' heads
          const RD = [], RL = [];
          for (let i = 0; i < 18; i++) { const side = i < 9 ? 0 : 1, x = side ? W - (i - 9) * 22 * u : (i) * 22 * u, h = (260 + 140 * hn(sd + 50, i)) * u, sw = Math.sin(t * 1.4 + i) * 16 * u; (i % 2 ? RD : RL).push(inkPath([[x, H + 20], [x + sw * 0.4 + (side ? -20 : 20) * u, H - h * 0.5], [x + sw + (side ? -40 : 40) * u, H - h]], { w: 12, seed: sd + 60 + i, t, taper: 0.8 })); }
          if (beached) beached.update(t, 0.7 * W, H - 170 * u, 1.6 * u);
          reeds.setAttribute('d', RD.join(' ')); reedsL.setAttribute('d', RL.join(' '));
          if (cr) cr.update(t, W, H, H - 330 * u);
          // bubble + stamp
          if (P.bubble) {
            const B = P.bubble, a = atOr(cues, B.at, 0.15), p = spring(lt, a, 0.5);
            bub.update(t, (B.x ?? 0.5) * W, (B.y ?? 0.3) * H + (B.bob ?? 0) * u * Math.sin(lt * 2.2), B.text, (B.size ?? 84) * u, lt < a ? 0 : p, [(B.tx ?? 0.36) * W, (B.ty ?? 0.4) * H]);
          } else bub.update(t, 0, 0, null, 1, 0, [0, 0]);
          if (P.stamp) { const S = P.stamp; stp.update(t, (S.x ?? 0.5) * W, (S.y ?? 0.3) * H, S.text, (S.size ?? 120) * u, S.rot ?? -8, lt, atOr(cues, S.at, hit)); }
          else stp.update(t, 0, 0, '', 1, 0, lt, null);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ Africa outline (lon, lat) and lakes
  const AFRICA = [[-17, 14.7], [-16.8, 21], [-13, 27.6], [-9.8, 30], [-6, 35.8], [0, 35.6], [10, 37.2], [11, 33.5], [15, 32.2], [19.5, 30.5], [25, 31.6], [32, 31.3],
    [34.5, 28], [35.5, 24], [37.5, 18.5], [39.5, 15.5], [43.2, 12.5], [51.2, 11.8], [49.5, 7], [45, 2], [41.5, -1.5], [39.3, -6.5], [40.5, -10.5], [40.6, -15],
    [36.5, -18.8], [35.4, -23], [32.7, -26], [31, -29.8], [27, -33.8], [20, -34.8], [18.4, -34], [17.8, -31], [15, -27], [14.4, -22.5], [11.8, -17], [13.4, -11.5],
    [12, -6], [9.4, -1], [9.6, 3.5], [8.4, 4.5], [5, 6.2], [1, 6], [-4, 5.2], [-7.6, 4.4], [-11, 6.8], [-13.6, 9.5], [-15.4, 11.5]];
  const TANG = [[29.1, -3.4], [29.4, -4.6], [29.6, -5.8], [30.2, -7.0], [30.8, -8.0], [31.2, -8.7], [30.6, -8.4], [30.0, -7.2], [29.5, -6.2], [29.2, -5.0], [28.9, -3.8]];
  const VICT = [[31.8, -0.3], [33.2, 0.4], [34.2, 0.0], [34.8, -1.0], [33.8, -2.6], [32.2, -2.8], [31.6, -1.6]];
  const NYASA = [[34.0, -9.6], [34.6, -11.0], [35.0, -12.6], [35.3, -14.3], [34.8, -14.2], [34.4, -12.6], [34.1, -11.0], [33.9, -10.0]];

  SH.lv_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 501, u = W / 1080;
      const k = 14.2 * u, x0 = W / 2 - 17 * k, y0 = 0.17 * H;           // lon 17 E at the frame centre, lat 37 N at y0
      const PR = ([lo, la]) => [x0 + lo * k, y0 + (37 - la) * k];
      const root = el(svg, 'g');
      const sea = inkEl(root, mix(INK.blue, INK.paperLight, 0.62)), hatch = inkEl(root, mix(INK.blue, INK.paperLight, 0.2));
      const land = inkEl(root, mix(INK.paperLight, INK.stain, 0.25)), landD = inkEl(root, mix(INK.stain, INK.paperLight, 0.45)), coast = inkEl(root);
      const lakes = inkEl(root, mix(INK.blue, INK.paperLight, 0.35)), lakesR = inkEl(root), isle = inkEl(root, mix(INK.paperLight, INK.stain, 0.25));
      const route = inkEl(root, INK.red), dots = inkEl(root, INK.ink);
      const q = el(root, 'text', { 'text-anchor': 'middle', 'font-family': FR, 'font-weight': 900, fill: INK.red });
      const ring = inkEl(root, INK.red);
      const rose = inkEl(root, INK.inkSoft), roseF = inkEl(root, INK.red), ship = dhow(el(root, 'g'), sd + 40), frame = inkEl(root);
      const stp = stamp(el(root, 'g'), sd + 60);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5);
          sea.setAttribute('d', inkLoop(RC(-20, -20, W + 20, H + 20), { seed: sd, t, amp: 0.5, smooth: false }));
          const HT = []; for (let i = 0; i < 26; i++) { const y = 0.12 * H + i * 0.034 * H, x = (hn(sd + 1, i) * W + t * 8) % W; HT.push(inkPath([[x - 60 * u, y], [x - 30 * u, y - 8 * u], [x, y], [x + 30 * u, y - 8 * u], [x + 60 * u, y]], { w: 3, seed: sd + 2 + i, t })); }
          hatch.setAttribute('d', HT.join(' '));
          const A = AFRICA.map(PR);
          land.setAttribute('d', inkLoop(A, { seed: sd + 30, t, amp: 1.2 }));
          // a faint relief: the dry north and the forest belt drawn as soft bands of dashes
          const RL = []; for (let i = 0; i < 40; i++) { const lo = -10 + hn(sd + 31, i) * 50, la = -25 + hn(sd + 32, i) * 50, p = PR([lo, la]); RL.push(inkPath([[p[0] - 14 * u, p[1]], [p[0], p[1] - 8 * u], [p[0] + 14 * u, p[1]]], { w: 3, seed: sd + 33 + i, t })); }
          landD.setAttribute('d', RL.join(' '));
          coast.setAttribute('d', inkPath(A, { w: 6, seed: sd + 34, t, closed: true }));
          const L = [TANG, VICT, NYASA].map(l => l.map(PR));
          lakes.setAttribute('d', L.map((l, i) => inkLoop(l, { seed: sd + 35 + i, t, amp: 0.8 })).join(' '));
          lakesR.setAttribute('d', L.map((l, i) => inkPath(l, { w: 4, seed: sd + 38 + i, t, closed: true })).join(' '));
          const zb = PR([39.6, -6.1]);
          isle.setAttribute('d', inkLoop(inkEllipsePts(zb[0] + 8 * u, zb[1], 10 * u, 20 * u, sd + 41, 8, 0.3, 0.08), { seed: sd + 41, t, amp: 0.6 }) + ' ' + inkPath(inkEllipsePts(zb[0] + 8 * u, zb[1], 10 * u, 20 * u, sd + 41, 8, 0.3, 0.08), { w: 3, seed: sd + 42, t, closed: true }));
          const uj = PR([29.7, -4.9]);
          dots.setAttribute('d', inkCircle(uj[0] + 4 * u, uj[1], 9 * u, sd + 43, t, { fill: true }) + ' ' + inkCircle(zb[0] - 12 * u, zb[1] + 6 * u, 8 * u, sd + 44, t, { fill: true }));
          if (P.route) {
            const a = atOr(cues, P.route.at, 0.3), d = P.route.dur ?? 2.4, pr = clamp01((lt - a) / d);
            const RP = [[38.8, -6.3], [36.5, -6.0], [33.8, -5.0], [32.8, -5.0], [31.0, -5.0], [29.9, -4.9]].map(PR), DS = [];
            const tot = RP.length - 1, upto = pr * tot;
            for (let i = 0; i < Math.floor(upto * 4); i++) { const s0 = i / 4, s1 = s0 + 0.14, seg = Math.floor(s0); if (seg >= tot) break; const a0 = RP[seg], a1 = RP[seg + 1]; DS.push(inkPath([[lerp(a0[0], a1[0], s0 - seg), lerp(a0[1], a1[1], s0 - seg)], [lerp(a0[0], a1[0], s1 - seg), lerp(a0[1], a1[1], s1 - seg)]], { w: 6, seed: sd + 50 + i, t })); }
            route.setAttribute('d', DS.join(' '));
          } else route.setAttribute('d', '');
          // the big "?" over Lake Tanganyika
          const pul = 1 + 0.08 * Math.sin(lt * 4) + 0.15 * punch(lt, hit), qp = spring(lt, 0.2, 0.6);
          q.textContent = '?'; q.setAttribute('font-size', f1(260 * u * pul * qp)); q.setAttribute('x', f1(uj[0] - 70 * u)); q.setAttribute('y', f1(uj[1] + 40 * u));
          const rp = clamp01((lt - hit) / 0.6);
          if (rp > 0) { const pts = inkEllipsePts(uj[0] - 40 * u, uj[1] - 30 * u, 170 * u, 210 * u, sd + 55, 16, 0.2, 0.05); const n = Math.max(2, Math.round(16 * rp)); ring.setAttribute('d', inkPath(pts.slice(0, n).concat(rp >= 1 ? [pts[0]] : []), { w: 9, seed: sd + 56, t })); }
          else ring.setAttribute('d', '');
          // compass rose (bottom left) and a small ship on the Indian Ocean (bottom right)
          const rc = [0.2 * W, 0.83 * H], rr = 110 * u, sp = t * 0.15;
          const RO = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + sp * 0.2, l = i % 2 ? rr * 0.55 : rr; RO.push(inkPath([[rc[0], rc[1]], [rc[0] + Math.cos(a) * l, rc[1] + Math.sin(a) * l]], { w: i % 2 ? 4 : 6, seed: sd + 70 + i, t })); }
          rose.setAttribute('d', RO.join(' ') + ' ' + inkCircle(rc[0], rc[1], rr * 0.7, sd + 80, t, { w: 4 }));
          roseF.setAttribute('d', inkLoop([[rc[0], rc[1] - rr * 1.15], [rc[0] + 16 * u, rc[1] - rr * 0.3], [rc[0] - 16 * u, rc[1] - rr * 0.3]], { seed: sd + 81, t, amp: 0.6, smooth: false }));
          ship.update(t, (0.74 + 0.04 * Math.sin(lt * 0.5)) * W, 0.9 * H, 0.75 * u);
          frame.setAttribute('d', inkPath(RC(24 * u, 24 * u, W - 24 * u, H - 24 * u), { w: 8, seed: sd + 90, t, closed: true, smooth: false }) + ' ' + inkPath(RC(42 * u, 42 * u, W - 42 * u, H - 42 * u), { w: 3, seed: sd + 91, t, closed: true, smooth: false }));
          if (P.stamp) { const S = P.stamp; stp.update(t, (S.x ?? 0.5) * W, (S.y ?? 0.3) * H, S.text, (S.size ?? 110) * u, S.rot ?? -8, lt, atOr(cues, S.at, hit)); }
          else stp.update(t, 0, 0, '', 1, 0, lt, null);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lv_trek
  SH.lv_trek = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 701, u = W / 1080, gy = (P.ground ?? 0.6) * H, n = P.n ?? 5;
      const root = el(svg, 'g');
      const sunG = inkEl(root, INK.gold, { 'fill-opacity': 0.9 }), sunR = inkEl(root, INK.gold);
      const trees = inkEl(root, mix(INK.green, INK.ink, 0.3)), treesL = inkEl(root, LEAF_L()), trunks = inkEl(root, MUD_D());
      const dust = inkEl(root, mix(INK.stain, INK.paperLight, 0.4), { 'fill-opacity': 0.55 });
      const porters = Array.from({ length: n }, (_, i) => man(el(root, 'g'), seed * 7 + 40 + i, { scale: 0.6 }));
      const ld = load(el(root, 'g'), sd + 20);
      const bearer = man(el(root, 'g'), seed * 7 + 60, { scale: 0.64 }), fl = flag(el(root, 'g'), sd + 40);
      const stan = man(el(root, 'g'), seed * 7 + 1, { hat: 'pith', scale: 0.7 });
      const fr = window.LH.front(el(root, 'g'), sd + 80, 'grass');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // the sun races across the sky: days passing
          const day = (lt * 0.5) % 1, sx = lerp(0.62, 1.05, day) * W, sy = 0.36 * H - Math.sin(day * Math.PI) * 0.12 * H;
          sunG.setAttribute('d', inkCircle(sx, sy, 70 * u, sd, t, { fill: true }));
          const SR = []; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + t; SR.push(inkPath([[sx + Math.cos(a) * 90 * u, sy + Math.sin(a) * 90 * u], [sx + Math.cos(a) * 125 * u, sy + Math.sin(a) * 125 * u]], { w: 6, seed: sd + 1 + i, t })); }
          sunR.setAttribute('d', SR.join(' '));
          // acacias scroll by (the column walks, the land moves past)
          const TR = [], TL = [], TK = [], span = W + 600 * u;
          for (let i = 0; i < 4; i++) {
            const x = ((hn(sd + 2, i) * span + i * span / 4 - t * 70 * u) % span + span) % span - 300 * u, s = (0.8 + 0.5 * hn(sd + 3, i)) * u, by = gy - 70 * u - 30 * hn(sd + 4, i) * u;
            TK.push(inkPath([[x, by], [x - 10 * s, by - 120 * s], [x - 50 * s, by - 200 * s]], { w: 14 * s, seed: sd + 10 + i, t }) + ' ' + inkPath([[x - 10 * s, by - 120 * s], [x + 50 * s, by - 210 * s]], { w: 10 * s, seed: sd + 14 + i, t }));
            const crown = [[x - 200 * s, by - 210 * s], [x - 120 * s, by - 270 * s], [x + 20 * s, by - 290 * s], [x + 170 * s, by - 260 * s], [x + 220 * s, by - 215 * s], [x, by - 200 * s]];
            TR.push(inkLoop(crown, { seed: sd + 18 + i, t, amp: 1.2 }));
            TL.push(inkLoop(crown.map(p => [p[0] * 0.8 + x * 0.2, p[1] - 10 * s]).slice(0, 5), { seed: sd + 22 + i, t, amp: 1 }));
          }
          trees.setAttribute('d', TR.join(' ')); treesL.setAttribute('d', TL.join(' ')); trunks.setAttribute('d', TK.join(' '));
          // the column: Stanley leads, the flag, then the porters
          const g = KASIF.gait('walk'), ph = t * 1.1, items = [];
          const lead = 0.74 * W;
          const rs = stan.update(t, 'walk', { x: lead, y: gy, face: 1, ph, since: lt });
          const rb = bearer.update(t, 'walk', { x: lead - 150 * u, y: gy + 4 * u, face: 1, ph: ph + 0.4, since: lt });
          fl.update(t, [rb.hands[1][0], rb.hands[1][1] + 30 * u], [rb.hands[1][0] + 10 * u, rb.head[1] - 250 * u], 0.75 * u);
          porters.forEach((p, i) => { const x = lead - (290 + i * 125) * u; const r = p.update(t, 'walk', { x, y: gy + 8 * u, face: 1, ph: ph + 0.2 * i + 0.7, since: lt }); items.push([r.head[0], r.head[1] - 36 * u, 0.6]); });
          ld.update(t, items);
          const DU = []; for (let i = 0; i < 8; i++) { const q = ((t * 0.6 + i / 8) % 1), x = lead - q * 900 * u, y = gy + 10 * u - q * 40 * u; DU.push(inkCircle(x, y, (20 + 50 * q) * u, sd + 60 + i, t, { fill: true })); }
          dust.setAttribute('d', DU.join(' '));
          fr.update(t, W, H, gy + 160 * u);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ handwriting lines on a page
  function scrib(x0, y0, w, rows, lh, sd, t) {
    let d = '';
    for (let i = 0; i < rows; i++) {
      const y = y0 + i * lh, ww = w * (i % 5 === 4 ? 0.55 : 0.82 + 0.18 * hn(sd, i)), pts = [];
      for (let k = 0; k <= 8; k++) pts.push([x0 + ww * k / 8, y + Math.sin(k * 2.3 + i) * 3]);
      d += inkPath(pts, { w: 3.6, seed: sd + i * 3, t, amp: 0.7, taper: 0.4 }) + ' ';
    }
    return d;
  }

  // ------------------------------------------------------------------ SHOTS.lv_office
  SH.lv_office = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 801, u = W / 1080, gy = (P.ground ?? 0.6) * H;
      const root = el(svg, 'g');
      const signB = inkEl(root, INK.ink), sign = el(root, 'text', { 'text-anchor': 'middle', 'font-family': FR, 'font-weight': 900, fill: INK.paperLight });
      const mapF = inkEl(root, mix(INK.paperLight, INK.stain, 0.2)), mapS = inkEl(root, mix(INK.blue, INK.paperLight, 0.6)), mapL = inkEl(root, mix(INK.paperLight, INK.stain, 0.4)), mapR = inkEl(root);
      const mq = el(root, 'text', { 'text-anchor': 'middle', 'font-family': FR, 'font-weight': 900, fill: INK.red });
      const ed = man(el(root, 'g'), seed * 7 + 3, { beard: 'short', scale: 0.95 });
      const rep = man(el(root, 'g'), seed * 7 + 1, { scale: 1.0 });
      const desk = inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), deskD = inkEl(root, MUD_D()), deskR = inkEl(root);
      const lamp = inkEl(root, INK.gold), lampR = inkEl(root), pap = inkEl(root, INK.paperLight), papR = inkEl(root);
      const letter = inkEl(root, INK.paperLight), letterR = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5);
          // sign over the wall
          const sy = 0.2 * H, txt = P.sign || 'NEW YORK HERALD', fs = (P.signSize ?? 74) * u;
          sign.textContent = txt; sign.setAttribute('x', f1(W * 0.56)); sign.setAttribute('y', f1(sy + fs * 0.34)); sign.setAttribute('font-size', f1(fs));
          const sw = txt.length * fs * 0.62 + 60 * u;
          signB.setAttribute('d', inkLoop(RC(W * 0.56 - sw / 2, sy - fs * 0.62, W * 0.56 + sw / 2, sy + fs * 0.62), { seed: sd, t, amp: 1, smooth: false }));
          // wall map of Africa with a red "?"
          const mx0 = 0.12 * W, my0 = 0.29 * H, mw = 0.4 * W, mh = 0.3 * H, sw2 = Math.sin(t * 1.2) * 1.5;
          const MR = RC(mx0, my0, mx0 + mw, my0 + mh).map(p => [p[0], p[1] + sw2 * (p[0] - mx0) / mw]);
          mapF.setAttribute('d', inkLoop(MR, { seed: sd + 1, t, amp: 0.8, smooth: false }));
          mapS.setAttribute('d', inkLoop(RC(mx0 + 14 * u, my0 + 14 * u, mx0 + mw - 14 * u, my0 + mh - 14 * u), { seed: sd + 2, t, amp: 0.6, smooth: false }));
          const kk = mh * 0.9 / 74, PR = ([lo, la]) => [mx0 + mw / 2 + (lo - 17) * kk, my0 + mh * 0.05 + (37 - la) * kk];
          mapL.setAttribute('d', inkLoop(AFRICA.map(PR), { seed: sd + 3, t, amp: 0.8 }));
          mapR.setAttribute('d', inkPath(MR, { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath(AFRICA.map(PR), { w: 3.5, seed: sd + 5, t, closed: true }));
          const qq = PR([29.7, -4.9]), qk = 1 + 0.1 * Math.sin(lt * 4) + 0.2 * punch(lt, hit);
          mq.textContent = '?'; mq.setAttribute('x', f1(qq[0])); mq.setAttribute('y', f1(qq[1] + 30 * u)); mq.setAttribute('font-size', f1(120 * u * qk));
          // editor behind the desk points at the map, then holds out the letter
          const give = lt >= hit - 0.4;
          const re = ed.update(t, give ? 'talk' : 'point', { x: 0.62 * W, y: gy - 40 * u, face: -1, dir: 35, since: give ? lt - hit + 0.4 : lt, emotion: 'angry' });
          const rr = rep.update(t, lt >= hit + 0.5 ? 'hold' : 'idle', { x: 0.84 * W, y: gy + 120 * u, face: -1, since: lt >= hit + 0.5 ? lt - hit - 0.5 : lt, emotion: lt >= hit + 0.5 ? 'surprised' : 'neutral' });
          // desk front fills the bottom
          const dy = gy + 60 * u;
          desk.setAttribute('d', inkLoop(RC(-40, dy, W * 0.78, dy + 70 * u), { seed: sd + 6, t, amp: 0.8, smooth: false }));
          deskD.setAttribute('d', inkLoop(RC(-40, dy + 70 * u, W * 0.74, H + 40), { seed: sd + 7, t, amp: 0.8, smooth: false }));
          const DR = []; for (let i = 0; i < 3; i++) { const yy = dy + 130 * u + i * 190 * u; DR.push(inkPath(RC(0.06 * W, yy, 0.66 * W, yy + 150 * u), { w: 4, seed: sd + 8 + i, t, closed: true, smooth: false }), inkCircle(0.36 * W, yy + 75 * u, 14 * u, sd + 12 + i, t, { w: 5 })); }
          deskR.setAttribute('d', inkPath(RC(-40, dy, W * 0.78, dy + 70 * u), { w: 5, seed: sd + 15, t, closed: true, smooth: false }) + ' ' + DR.join(' '));
          // desk lamp + paper pile on the desk top
          const lx = 0.14 * W, ly = dy;
          lamp.setAttribute('d', inkLoop([[lx - 70 * u, ly - 180 * u], [lx + 70 * u, ly - 180 * u], [lx + 40 * u, ly - 250 * u], [lx - 40 * u, ly - 250 * u]], { seed: sd + 16, t, amp: 0.8, smooth: false }));
          lampR.setAttribute('d', inkPath([[lx, ly], [lx, ly - 180 * u]], { w: 8, seed: sd + 17, t }) + ' ' + inkPath([[lx - 50 * u, ly], [lx + 50 * u, ly]], { w: 10, seed: sd + 18, t }));
          const PP = []; for (let i = 0; i < 4; i++) PP.push(RC(0.3 * W + i * 4 * u, dy - 18 * u - i * 12 * u, 0.48 * W + i * 6 * u, dy - 6 * u - i * 12 * u));
          pap.setAttribute('d', PP.map((p, i) => inkLoop(p, { seed: sd + 20 + i, t, amp: 0.6, smooth: false })).join(' '));
          papR.setAttribute('d', PP.map((p, i) => inkPath(p, { w: 3, seed: sd + 24 + i, t, closed: true, smooth: false })).join(' '));
          // the letter: in the editor's hand, then flies to the reporter
          const hE = re.hands[0][0] > re.hands[1][0] ? re.hands[1] : re.hands[0];
          const hR = rr.hands[0][0] < rr.hands[1][0] ? rr.hands[0] : rr.hands[1];
          const fp = prog(lt, hit, 0.6), lxp = lerp(hE[0], hR[0], fp), lyp = lerp(hE[1], hR[1], fp) - Math.sin(fp * Math.PI) * 120 * u, rot = -10 + fp * 30 + Math.sin(t * 3) * 3;
          const LP = RC(-60, -40, 60, 40).map(p => { const q = R2(p, rot); return [lxp + q[0] * u, lyp - 30 * u + q[1] * u]; });
          if (lt >= hit - 0.4) { letter.setAttribute('d', inkLoop(LP, { seed: sd + 30, t, amp: 0.6, smooth: false })); letterR.setAttribute('d', inkPath(LP, { w: 4, seed: sd + 31, t, closed: true, smooth: false }) + ' ' + inkPath([LP[0], [lxp, lyp - 20 * u], LP[1]], { w: 3, seed: sd + 32, t })); }
          else blank(letter, letterR);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lv_diary
  SH.lv_diary = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 901, u = W / 1080, mode = P.mode || 'torn';
      const root = el(svg, 'g');
      const deskT = inkEl(root, mix(INK.stain, INK.paperDark, 0.15)), grain = inkEl(root, mix(INK.stain, INK.ink, 0.15));
      const cover = inkEl(root, mix(INK.red, INK.ink, 0.45)), pageL = inkEl(root, INK.paperLight), pageR = inkEl(root, INK.paperLight), stub = inkEl(root, INK.paperLight);
      const lines = inkEl(root, INK.inkSoft), head = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: INK.ink }), rims = inkEl(root);
      const flipF = inkEl(root, INK.paperLight), flipR = inkEl(root);
      const tornF = inkEl(root, INK.paperLight), tornR = inkEl(root), tornL = inkEl(root, INK.inkSoft);
      const ring = inkEl(root, INK.red);
      const candle = inkEl(root, INK.paperLight), flame = inkEl(root, INK.gold), candleR = inkEl(root), pot = inkEl(root, INK.ink), quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          const cx = (P.cx ?? 0.5) * W, top = (P.top ?? 0.3) * H, pw = (P.pw ?? 0.42) * W, ph = (P.ph ?? 0.42) * H;
          // desk top fills the frame from the book down
          deskT.setAttribute('d', inkLoop(RC(-40, top - 120 * u, W + 40, H + 40), { seed: sd, t, amp: 0.5, smooth: false }));
          const GR = []; for (let i = 0; i < 14; i++) { const y = top - 80 * u + i * 110 * u; GR.push(inkPath([[-20, y], [W * 0.3, y + 10 * u], [W * 0.7, y - 6 * u], [W + 20, y + 4 * u]], { w: 3, seed: sd + 1 + i, t })); }
          grain.setAttribute('d', GR.join(' '));
          // the open book
          const CV = RC(cx - pw - 26 * u, top - 22 * u, cx + pw + 26 * u, top + ph + 28 * u);
          cover.setAttribute('d', inkLoop(CV, { seed: sd + 20, t, amp: 0.8, smooth: false }));
          const PL = [[cx - pw, top + 8 * u], [cx - 10 * u, top], [cx - 6 * u, top + ph], [cx - pw, top + ph + 6 * u]];
          const PRt = [[cx + 10 * u, top], [cx + pw, top + 8 * u], [cx + pw, top + ph + 6 * u], [cx + 6 * u, top + ph]];
          pageL.setAttribute('d', inkLoop(PL, { seed: sd + 21, t, amp: 0.6, smooth: false }));
          const ripped = mode === 'torn' && lt >= hit;
          // torn stub: a jagged strip along the gutter once the page is gone
          const J = []; for (let i = 0; i <= 14; i++) { const y = top + i * ph / 14; J.push([cx + (40 + (i % 2 ? 26 : 0) + 14 * hn(sd + 22, i)) * u, y]); }
          const STUB = [[cx + 10 * u, top]].concat(J).concat([[cx + 6 * u, top + ph]]);
          if (mode === 'torn' && ripped) { pageR.setAttribute('d', inkLoop(RC(cx + 14 * u, top + 30 * u, cx + pw - 30 * u, top + ph - 10 * u).map(p => p), { seed: sd + 23, t, amp: 0.5, smooth: false })); }
          else pageR.setAttribute('d', inkLoop(PRt, { seed: sd + 24, t, amp: 0.6, smooth: false }));
          // when torn, the "next" sheet under it shows (slightly darker = paper below, blank)
          pageR.setAttribute('fill', ripped ? mix(INK.paperLight, INK.paperDark, 0.35) : INK.paperLight);
          stub.setAttribute('d', ripped ? inkLoop(STUB, { seed: sd + 25, t, amp: 0.5, smooth: false }) : '');
          let L = scrib(cx - pw + 50 * u, top + 150 * u, pw - 110 * u, 9, 0.034 * H, sd + 30, t);
          if (!ripped) L += scrib(cx + 60 * u, top + 80 * u, pw - 110 * u, 11, 0.034 * H, sd + 60, t);
          lines.setAttribute('d', L);
          head.textContent = P.head ?? 'Ujiji'; head.setAttribute('x', f1(cx - pw / 2)); head.setAttribute('y', f1(top + 100 * u)); head.setAttribute('font-size', f1(66 * u));
          rims.setAttribute('d', [inkPath(CV, { w: 5, seed: sd + 26, t, closed: true, smooth: false }), inkPath(PL, { w: 4, seed: sd + 27, t, closed: true, smooth: false }),
            ripped ? inkPath(STUB, { w: 4, seed: sd + 28, t, closed: true, smooth: false }) : inkPath(PRt, { w: 4, seed: sd + 29, t, closed: true, smooth: false }),
            inkPath([[cx, top - 6 * u], [cx, top + ph + 10 * u]], { w: 6, seed: sd + 19, t })].join(' '));
          // flipping pages (mode flip): a page lifts from the right and turns over to the left, again and again
          if (mode === 'flip') {
            const c = (lt * 0.9) % 1, a = progIO(c, 0, 0.9) * Math.PI, ex = cx + Math.cos(a) * pw, lift = Math.sin(a) * 120 * u;
            const FP = [[cx, top], [ex, top + 8 * u - lift * 0.6], [ex, top + ph + 6 * u - lift * 0.6], [cx, top + ph]];
            flipF.setAttribute('d', inkLoop(FP, { seed: sd + 40, t, amp: 0.6, smooth: false }));
            flipR.setAttribute('d', inkPath(FP, { w: 4, seed: sd + 41, t, closed: true, smooth: false }));
          } else blank(flipF, flipR);
          // torn: the page tears out at the cue and flutters up and away
          if (mode === 'torn') {
            const fp = prog(lt, hit, 1.6), rot = fp * 40 + Math.sin(t * 5) * 6 * fp, dx = fp * 0.5 * W, dy = -fp * 0.35 * H;
            if (lt >= hit - 0.25 && fp < 1) {
              const pull = lt < hit ? (lt - hit + 0.25) / 0.25 : 1;
              const ccx = cx + pw / 2 + dx, ccy = top + ph / 2 + dy - pull * 10 * u;
              const TP = J.map(p => [p[0] + 4 * u, p[1]]).concat([[cx + pw, top + ph + 6 * u], [cx + pw, top + 8 * u]]).map(p => { const q = R2([p[0] - (cx + pw / 2), p[1] - (top + ph / 2)], rot); return [ccx + q[0], ccy + q[1]]; });
              tornF.setAttribute('d', inkLoop(TP, { seed: sd + 50, t, amp: 0.6, smooth: false }));
              tornR.setAttribute('d', inkPath(TP, { w: 4, seed: sd + 51, t, closed: true, smooth: false }));
              const TL = []; for (let i = 0; i < 8; i++) { const yy = top + 90 * u + i * 0.04 * H - top - ph / 2, a0 = R2([60 * u - pw / 2 + 40 * u, yy], rot), a1 = R2([pw / 2 - 60 * u, yy], rot); TL.push(inkPath([[ccx + a0[0], ccy + a0[1]], [ccx + a1[0], ccy + a1[1]]], { w: 3.4, seed: sd + 52 + i, t })); }
              tornL.setAttribute('d', TL.join(' '));
            } else blank(tornF, tornR, tornL);
            const rp = clamp01((lt - hit - (P.ringDelay ?? 0.4)) / 0.4);
            if (P.ring !== false && rp > 0) { const pts = inkEllipsePts(cx + 50 * u, top + ph / 2, 130 * u, ph * (P.ringRy ?? 0.6), sd + 60, 16, 0.05, 0.05); const n = Math.max(2, Math.round(16 * rp)); ring.setAttribute('d', inkPath(pts.slice(0, n).concat(rp >= 1 ? [pts[0]] : []), { w: 9, seed: sd + 61, t })); }
            else ring.setAttribute('d', '');
          } else { blank(tornF, tornR, tornL, ring); }
          // desk props in the lower part of the frame: candle (left), inkpot + quill (right)
          const by = top + ph + 230 * u;
          const fl = Math.sin(t * 9) * 4 * u, fl2 = Math.sin(t * 13) * 3 * u;
          candle.setAttribute('d', inkLoop(RC(0.12 * W, by - 240 * u, 0.2 * W, by + 160 * u), { seed: sd + 70, t, amp: 0.6, smooth: false }));
          flame.setAttribute('d', inkLoop([[0.16 * W, by - 330 * u + fl], [0.16 * W + 22 * u + fl2, by - 270 * u], [0.16 * W, by - 246 * u], [0.16 * W - 22 * u, by - 270 * u]], { seed: sd + 71, t, amp: 0.6 }));
          candleR.setAttribute('d', inkPath(RC(0.12 * W, by - 240 * u, 0.2 * W, by + 160 * u), { w: 5, seed: sd + 72, t, closed: true, smooth: false }) + ' ' + inkPath([[0.16 * W, by - 240 * u], [0.16 * W, by - 262 * u]], { w: 4, seed: sd + 73, t }));
          pot.setAttribute('d', inkLoop([[0.74 * W, by + 160 * u], [0.72 * W, by + 20 * u], [0.78 * W, by - 20 * u], [0.86 * W, by - 20 * u], [0.92 * W, by + 20 * u], [0.9 * W, by + 160 * u]], { seed: sd + 74, t, amp: 0.8 }));
          const qs = Math.sin(t * 1.3) * 3;
          const QP = [[0.82 * W, by - 10 * u], [0.9 * W + qs * u, by - 300 * u], [0.97 * W + qs * u, by - 420 * u], [0.93 * W, by - 260 * u]];
          quill.setAttribute('d', inkLoop(QP, { seed: sd + 75, t, amp: 0.8 }));
          quillR.setAttribute('d', inkPath(QP, { w: 4, seed: sd + 76, t, closed: true }) + ' ' + inkPath([[0.82 * W, by - 10 * u], [0.96 * W + qs * u, by - 400 * u]], { w: 3, seed: sd + 77, t }));
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
