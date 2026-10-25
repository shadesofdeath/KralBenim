// bm_marshall: Barry Marshall's self-experiment (Perth, 1984) in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random).
// Shared pieces: window.BM = {cast, glass, bug, bench, labels (window.MCB.labels), cam (window.MCB.camPush)}.
//
// cast entry (all shots): window.MCB cast entry ({who: "kasif"|name, x, y (ground 0..1 H), scale: 0.9, pose, face:
//   "left"|"right", dir, emotion, at, then, to, walk_at, walk_dur, seq: [{at, pose, dir, face, emotion}], hide_until})
//   plus glasses: true (round spectacles: Marshall) and hold: "glass"|"dish"|"clipboard" (prop in the hand nearest the
//   head; with pose "think" the glass sits at the lips), hold_at: cue (prop appears from then), drink: {at, dur: 1.4}
//   (the held glass tilts to the lips and empties), tag: {text, at} (hand-written name above the head).
//
// SHOTS.bm_drink — a lab bench (shelf of bottles behind) with a big glass of cloudy broth full of wriggling spiral
//   bacteria. P: {glass: {x: 0.5, h: 300, level: 0.78, cloud: 1, bugs: 9} | false (standing on the bench),
//     dish: {x: 0.5, at: "pour"} (a petri dish tips over the glass on the cue: germs fall in, the broth clouds up),
//     pick: cue (the bench glass vanishes; the first cast member with hold "glass" now holds it), glow: true (gold
//     rings pulse round the glass), bench_y: 0.6, labels: [MCB labels], cast, cam}   cues: pour, pick, hit, cast/labels
// SHOTS.bm_scope — the microscope on the bench and (optional) a round magnified view joined to the eyepiece by a
//   dashed line: stomach-lining cells with spiral bacteria that pop in one by one. P: {scope: {x: 0.28},
//     view: {x: 0.64, y: 0.3, r: 250, at: "view", bugs: 12, bugs_at: "find"} | false, bench_y, labels, cast, cam}
// SHOTS.bm_pig — a farm pen with healthy trotting piglets (curly tails). P: {pigs: 2, pen: [0.08, 0.92], labels,
//   cast, cam}   cues: hit, labels
// SHOTS.bm_sick — Marshall at home a few days later: wall calendar whose page tears off to "DAY 5" on a cue, a
//   chair, a pail, a queasy swirl and sweat drops (respectful: no vomit drawn). P: {calendar: {x: 0.72, y: 0.27,
//     from: 1, to: 5, at: "day"}, pail: {x: 0.56}, swirl: {who: 0, at: "sick"}, labels, cast, cam}
// SHOTS.bm_stomach — a big stomach cross-section with folds; an endoscope camera slides down the gullet with a light
//   cone; on a cue red inflamed patches bloom and spiral bacteria wriggle on the lining.
//   P: {scope: {at: 0, dur: 1.4} | false, inflame: {at: "inflamed"} (negative = inflamed from the start), bugs: 9,
//     heal: {at: "cured", check: [x, y]} (capsules slide down the gullet, sores + bacteria shrink away, green tick),
//     cx: 0.5, cy: 0.43, k: 0.88 (position / size), labels, cast, cam}
// SHOTS.bm_clinic — a 1980s doctor's office: wall chart (labels write on it), desk with stethoscope. See its block.
// SHOTS.bm_nobel — a gold medal swinging on a blue ribbon, a year counter rolling 1984 -> 2005.
//   P: {years: {from: 1984, to: 2005, at: 0, dur: 1.8, y: 0.19}, medal: {x: 0.5, y: 0.42, r: 190}, labels, cast, cam}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const FR = 'Fraunces, Georgia, serif';

  // ------------------------------------------------------------ spiral bacterium (H. pylori: corkscrew + tail tufts)
  function bug(x, y, len, ang, ph, sd, t, w = 5) {
    const c = Math.cos(ang), s = Math.sin(ang), pts = [];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12, a = (u - 0.5) * len, b = Math.sin(u * Math.PI * 5 + ph) * len * 0.13;
      pts.push([x + a * c - b * s, y + a * s + b * c]);
    }
    const e = pts[0], d = [];
    d.push(inkPath(pts, { w, seed: sd, t, amp: 0.6, taper: 0.5 }));
    for (let k = -1; k <= 1; k++) {
      const a2 = ang + Math.PI + k * 0.45 + Math.sin(ph * 1.3 + k) * 0.2, l = len * 0.32;
      d.push(inkPath([e, [e[0] + Math.cos(a2) * l * 0.5, e[1] + Math.sin(a2) * l * 0.5 + Math.sin(ph + k) * 3], [e[0] + Math.cos(a2) * l, e[1] + Math.sin(a2) * l]], { w: w * 0.45, seed: sd + 3 + k, t, amp: 0.5 }));
    }
    return d.join(' ');
  }

  // ------------------------------------------------------------ glass of broth (origin: bottom centre; h tall)
  function glass(parent, sd) {
    const g = el(parent, 'g');
    const inner = el(g, 'g');
    const liq = inkEl(inner, INK.gold, { 'fill-opacity': 0.42 }), cloud = inkEl(inner, INK.paperDark, { 'fill-opacity': 0.55 });
    const bugs = inkEl(inner, INK.ink), body = inkEl(g, INK.paperLight, { 'fill-opacity': 0.35 }), rim = inkEl(g), shine = inkEl(g, INK.paperLight);
    const r = rng(sd + 77), B = Array.from({ length: 14 }, () => [r(), r(), r(), r()]);
    return {
      g,
      update(t, o) {
        const h = o.h || 300, wt = h * 0.36, wb = h * 0.27, x = o.x || 0, y = o.y || 0;
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(o.rot || 0)}) scale(${(o.s ?? 1).toFixed(3)})`);
        g.style.display = o.hide ? 'none' : '';
        if (o.hide) return;
        inner.setAttribute('transform', o.tip ? `matrix(1 0 0 -1 0 ${f1(-h)})` : '');   // tipped: the broth runs to the rim
        const lv = clamp01(o.level ?? 0.78), ly = -h * lv + 6;
        const wAt = yy => lerp(wb, wt, -yy / h);
        const lq = [[-wAt(ly) + 6, ly + Math.sin(t * 3) * 3], [0, ly + Math.cos(t * 2.4) * 4], [wAt(ly) - 6, ly - Math.sin(t * 3) * 3], [wb - 8, -10], [-wb + 8, -10]];
        liq.setAttribute('d', lv > 0.02 ? inkLoop(lq, { seed: sd + 1, t, amp: 1, smooth: false }) : '');
        const cl = clamp01(o.cloud ?? 1);
        cloud.setAttribute('fill-opacity', (0.55 * cl).toFixed(3));
        let cd = '';
        if (lv > 0.08 && cl > 0.02) for (let k = 0; k < 4; k++) {
          const cy = lerp(-12, ly + 20, (k + 0.5) / 4), cw = wAt(cy) - 16;
          cd += inkLoop(inkEllipsePts(Math.sin(t * 0.9 + k) * cw * 0.25, cy, cw * 0.62, h * 0.07, sd + 10 + k, 10), { seed: sd + 10 + k, t, amp: 1.5 }) + ' ';
        }
        cloud.setAttribute('d', cd);
        let bd = '';
        const nb = Math.min(B.length, o.bugs ?? 9);
        if (lv > 0.08) for (let k = 0; k < nb; k++) {
          const q = B[k], vis = o.bugsVis == null ? 1 : clamp01(o.bugsVis * nb - k);
          if (vis <= 0) continue;
          if (o.big) {   // a few large, clearly separate spirals spread evenly through the broth
            const u = (k + 0.5) / nb, by = lerp(-30, ly + 30, k % 2 ? 0.3 : 0.7) + Math.sin(t * 1.3 + k) * 6;
            const bw = wAt(by) - 24, bx = (u * 2 - 1) * bw * 0.72 + Math.sin(t * 1.1 + k * 2) * 8;
            bd += bug(bx, by, h * 0.34 * vis, (k % 2 ? 0.5 : -0.5) + Math.sin(t * 1.4 + k) * 0.2, t * 9 + k, sd + 30 + k * 7, t, h * 0.04) + ' ';
            continue;
          }
          const by = lerp(-24, ly + 22, (q[1] * 0.85 + 0.08 + Math.sin(t * (0.6 + q[3]) + k) * 0.05));
          const bw = wAt(by) - 30, bx = (q[0] * 2 - 1) * bw * 0.8 + Math.sin(t * (0.9 + q[2]) + k * 2) * 14;
          bd += bug(bx, by, h * 0.2 * (0.8 + q[2] * 0.4) * vis, (q[3] - 0.5) * 2.2 + Math.sin(t * 1.4 + k) * 0.3, t * 9 + k, sd + 30 + k * 7, t, h * 0.024) + ' ';
        }
        bugs.setAttribute('d', bd);
        const sh = [[-wb, 0], [-wt, -h], [wt, -h], [wb, 0]];
        body.setAttribute('d', inkLoop(sh, { seed: sd + 2, t, amp: 1, smooth: false }));
        rim.setAttribute('d', inkPath(sh.concat([sh[0]]), { w: h * 0.022, seed: sd + 3, t, amp: 1.2, smooth: false }) + ' ' +
          inkPath(inkEllipsePts(0, -h, wt, h * 0.045, sd + 4, 12), { w: h * 0.016, seed: sd + 5, t, amp: 1, closed: true }));
        shine.setAttribute('d', inkPath([[-wt * 0.72, -h * 0.86], [-wb * 0.78, -h * 0.18]], { w: h * 0.03, seed: sd + 6, t, amp: 0.8 }));
      },
    };
  }

  // petri dish seen slightly from the side (origin: centre)
  function dish(parent, sd) {
    const g = el(parent, 'g'), base = inkEl(g, INK.paperLight), agar = inkEl(g, INK.gold, { 'fill-opacity': 0.5 }), rim = inkEl(g), dots = inkEl(g, INK.ink);
    return {
      g,
      update(t, o) {
        const r = o.r || 110;
        g.setAttribute('transform', `translate(${f1(o.x)} ${f1(o.y)}) rotate(${f1(o.rot || 0)})`);
        g.style.display = o.hide ? 'none' : '';
        const e = inkEllipsePts(0, 0, r, r * 0.34, sd + 1, 14);
        base.setAttribute('d', inkLoop(e, { seed: sd + 1, t, amp: 1 }));
        agar.setAttribute('d', inkLoop(inkEllipsePts(0, 2, r * 0.82, r * 0.25, sd + 2, 12), { seed: sd + 2, t, amp: 1 }));
        rim.setAttribute('d', inkPath(e, { w: 6, seed: sd + 3, t, amp: 1.2, closed: true }) + ' ' + inkPath([[-r, 0], [-r + 4, 22], [r - 4, 22], [r, 0]], { w: 5, seed: sd + 4, t, amp: 1 }));
        let d = '';
        for (let k = 0; k < 6; k++) d += bug(-r * 0.55 + k * r * 0.22, Math.sin(k * 2.1) * r * 0.1, r * 0.22, 0.3 * Math.sin(k + t), t * 8 + k, sd + 20 + k, t, 3.6) + ' ';
        dots.setAttribute('d', d);
      },
    };
  }

  // ------------------------------------------------------------ cast with attachments (spectacles, held props, tags)
  function cast(group, list, W, H, sd) {
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.9, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const att = el(rig.node, 'g');
      const spec = m.glasses ? { l: inkEl(att), f: inkEl(att, INK.paperLight, { 'fill-opacity': 0.35 }) } : null;
      const gl = m.hold === 'glass' ? glass(att, sd + 300 + i * 40) : null;
      const ds = m.hold === 'dish' ? dish(att, sd + 340 + i * 40) : null;
      const clip = m.hold === 'clipboard' ? { f: inkEl(att, INK.paperLight), r: inkEl(att) } : null;
      const gulp = m.drink ? inkEl(att, INK.inkSoft) : null;
      const tag = m.tag ? el(group, 'text', { 'font-family': INK_FONT, 'font-size': m.tag.size || 64, 'text-anchor': 'middle', fill: INK[m.tag.color || 'ink'] || INK.ink }) : null;
      if (tag) tag.textContent = m.tag.text;
      return { m, rig, g, isK, spec, gl, ds, clip, gulp, tag, i };
    });
    return {
      items,
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, spec, gl, ds, clip, gulp, tag, i }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; if (tag) tag.style.display = 'none'; return; }
          g.style.display = '';
          const sc = m.scale ?? 0.9, face0 = faceOf(m.face, 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion0 || m.emotion }];
          const a = atOr(cues, m.at, null);
          if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.dir, face: m.face, emotion: m.emotion });
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
            if (lt < arrive && lt >= start) { pose = 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
            else if (lt < start) { pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle'; }
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          }
          const y = H * (m.y ?? 0.6);
          const sh = atOr(cues, m.shake, null), shk = sh != null && lt >= sh ? Math.sin(lt * 31) * 4 : 0;
          const o = { x: x + shk, y, face, since, ph, dir: dirOf(s.dir),
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir) }; o.mix = since / 0.32; }
          const r = rig.update(t, pose, o) || {};
          const hc = r.head || [0, -470], hands = r.hands || [[-30, -300], [30, -300]];
          // the hand nearest the head holds the prop
          const hi = Math.hypot(hands[0][0] - hc[0], hands[0][1] - hc[1]) < Math.hypot(hands[1][0] - hc[0], hands[1][1] - hc[1]) ? 0 : 1;
          const hd = hands[hi];
          if (spec) {
            const ex = 12, ey = 6;
            spec.f.setAttribute('d', inkLoop(inkEllipsePts(hc[0] + ex - 22, hc[1] + ey, 19, 17, sd + 60 + i, 10), { seed: sd + 60 + i, t, amp: 0.5 }) + ' ' +
              inkLoop(inkEllipsePts(hc[0] + ex + 22, hc[1] + ey, 19, 17, sd + 61 + i, 10), { seed: sd + 61 + i, t, amp: 0.5 }));
            spec.l.setAttribute('d', inkPath(inkEllipsePts(hc[0] + ex - 22, hc[1] + ey, 19, 17, sd + 60 + i, 10), { w: 4.5, seed: sd + 62 + i, t, amp: 0.6, closed: true }) + ' ' +
              inkPath(inkEllipsePts(hc[0] + ex + 22, hc[1] + ey, 19, 17, sd + 61 + i, 10), { w: 4.5, seed: sd + 63 + i, t, amp: 0.6, closed: true }) + ' ' +
              inkPath([[hc[0] + ex - 4, hc[1] + ey - 2], [hc[0] + ex + 4, hc[1] + ey - 2]], { w: 4, seed: sd + 64 + i, t, amp: 0.4 }) + ' ' +
              inkPath([[hc[0] + ex - 41, hc[1] + ey - 2], [hc[0] - 62, hc[1] - 2]], { w: 4, seed: sd + 65 + i, t, amp: 0.4 }));
          }
          const ha = atOr(cues, m.hold_at, null), shown = ha == null || lt >= ha;
          const pin = ha != null ? spring(lt, ha, 0.45) : 1;
          if (gl) {
            const gh = m.glass_h || 230;
            const dk = m.drink ? atOr(cues, m.drink.at, null) : null, dd = (m.drink && m.drink.dur) || 1.4;
            const dp = dk != null ? progIO(lt, dk, 0.45) : 0;
            const empty = dk != null ? lin(lt, dk + 0.3, dd) : 0;
            const wob = Math.sin(t * 2) * 2;
            if (dk != null && lt >= dk) {
              // rim at the lips, bottom raised up and forward: rot -100 -> -128 while it empties
              const mouth = [hc[0] + 44, hc[1] + 30], th = lerp(-95, -128, empty) + wob;
              const a = th * Math.PI / 180, sx = Math.sin(a), cy = -Math.cos(a);
              const bx = mouth[0] - gh * sx, byy = mouth[1] - gh * cy;
              const ip = lerp(0.4, 1, dp);
              const hx0 = hd[0] + 14, hy0 = hd[1] + gh * 0.42;
              gl.update(t, { hide: !shown, x: lerp(hx0, bx, ip), y: lerp(hy0, byy, ip), h: gh, s: Math.max(0.01, pin), rot: lerp(0, th, ip), tip: ip > 0.6,
                level: (m.level ?? 0.78) * (1 - empty * 0.85), cloud: 1, bugs: m.bugs ?? 6, big: !!m.big_bugs });
            } else {
              gl.update(t, { hide: !shown, x: hd[0] + 14, y: hd[1] + gh * 0.42, h: gh, s: Math.max(0.01, pin), rot: wob, level: m.level ?? 0.78, cloud: 1, bugs: m.bugs ?? 6, big: !!m.big_bugs });
            }
            if (gulp) {
              const gk = dk != null && lt > dk + 0.35 && lt < dk + dd + 0.6;
              let d = '';
              if (gk) for (let k = 0; k < 3; k++) {
                const ph2 = ((lt - dk) * 2.2 + k / 3) % 1, rr = 18 + ph2 * 26;
                d += inkPath([[hc[0] - 70 - ph2 * 30, hc[1] - 20 - k * 22 - ph2 * 20], [hc[0] - 70 - rr - ph2 * 30, hc[1] - 12 - k * 22 - ph2 * 20]], { w: 4, seed: sd + 80 + k, t, amp: 0.6 }) + ' ';
              }
              gulp.setAttribute('d', d);
            }
          }
          if (ds) ds.update(t, { hide: !shown, x: hd[0] + 40, y: hd[1] - 10, r: 90, rot: m.dish_rot ?? -10 });
          if (clip) {
            const cx = hd[0] + 30, cy = hd[1] - 20, cp = [[cx - 60, cy - 90], [cx + 60, cy - 92], [cx + 62, cy + 80], [cx - 58, cy + 82]];
            clip.f.setAttribute('d', inkLoop(cp, { seed: sd + 90 + i, t, amp: 1, smooth: false }));
            let d = inkPath(cp.concat([cp[0]]), { w: 6, seed: sd + 91 + i, t, amp: 1, smooth: false });
            for (let k = 0; k < 4; k++) d += ' ' + inkPath([[cx - 38, cy - 50 + k * 32], [cx + 38 - (k % 2) * 20, cy - 52 + k * 32]], { w: 4, seed: sd + 92 + k, t, amp: 0.8 });
            clip.r.setAttribute('d', d);
          }
          if (tag) {
            const ta = atOr(cues, m.tag.at, 0.2);
            if (lt < ta) tag.style.display = 'none';
            else {
              tag.style.display = '';
              const p = spring(lt, ta, 0.5), b = boil(sd + 70 + i, t, 1.2);
              const tx = x + b[0], ty = y + (m.tag.dy ?? -620) * sc + b[1];
              tag.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) rotate(-3) scale(${Math.max(0.01, p).toFixed(3)})`);
            }
          }
        });
      },
    };
  }

  // ------------------------------------------------------------ lab room: back wall line, shelf with bottles, bench
  function lab(parent, W, H, by, sd, floor) {
    const wall = inkEl(parent, INK.inkSoft), shelf = inkEl(parent), bottlesF = inkEl(parent, INK.paperLight), bottlesR = inkEl(parent, INK.inkSoft),
      liquids = inkEl(parent, INK.blue, { 'fill-opacity': 0.35 }), top = inkEl(parent, INK.paperLight), benchR = inkEl(parent);
    const r = rng(sd + 5), BT = Array.from({ length: 6 }, (_, k) => [0.1 + k * 0.15 + r() * 0.04, 70 + r() * 60, 36 + r() * 22, r()]);
    return {
      update(t) {
        const sy = H * 0.22, fl = floor ?? by + 150;
        wall.setAttribute('d', inkPath([[-20, fl], [W + 20, fl - 4]], { w: 3, seed: sd + 1, t, amp: 1 }));
        shelf.setAttribute('d', inkPath([[W * 0.04, sy], [W * 0.96, sy - 4]], { w: 7, seed: sd + 2, t, amp: 1.2 }) + ' ' +
          inkPath([[W * 0.12, sy], [W * 0.14, sy + 40]], { w: 5, seed: sd + 3, t }) + ' ' + inkPath([[W * 0.88, sy - 3], [W * 0.86, sy + 40]], { w: 5, seed: sd + 4, t }));
        let f = '', rr = '', lq = '';
        BT.forEach(([bx, bh, bw, q], k) => {
          const x = bx * W, b = [[x - bw / 2, sy - 4], [x - bw / 2, sy - bh * 0.6], [x - bw * 0.2, sy - bh * 0.75], [x - bw * 0.2, sy - bh], [x + bw * 0.2, sy - bh], [x + bw * 0.2, sy - bh * 0.75], [x + bw / 2, sy - bh * 0.6], [x + bw / 2, sy - 4]];
          f += inkLoop(b, { seed: sd + 10 + k, t, amp: 0.8, smooth: false }) + ' ';
          rr += inkPath(b, { w: 4, seed: sd + 20 + k, t, amp: 0.8, smooth: false }) + ' ';
          const lv = sy - bh * (0.25 + q * 0.3);
          lq += inkLoop([[x - bw / 2 + 4, lv], [x + bw / 2 - 4, lv], [x + bw / 2 - 4, sy - 8], [x - bw / 2 + 4, sy - 8]], { seed: sd + 30 + k, t, amp: 0.6, smooth: false }) + ' ';
        });
        bottlesF.setAttribute('d', f); bottlesR.setAttribute('d', rr); liquids.setAttribute('d', lq);
        const tp = [[-30, by], [W + 30, by - 4], [W + 30, by + 34], [-30, by + 36]];
        top.setAttribute('d', inkLoop(tp, { seed: sd + 40, t, amp: 1, smooth: false }));
        benchR.setAttribute('d', inkPath([[-30, by], [W + 30, by - 4]], { w: 7, seed: sd + 41, t, amp: 1.2 }) + ' ' + inkPath([[-30, by + 36], [W + 30, by + 32]], { w: 5, seed: sd + 42, t, amp: 1 }) + ' ' +
          inkPath([[W * 0.08, by + 36], [W * 0.09, fl]], { w: 7, seed: sd + 43, t }) + ' ' + inkPath([[W * 0.92, by + 34], [W * 0.91, fl]], { w: 7, seed: sd + 44, t }));
      },
    };
  }

  // microscope (origin: foot centre on the bench; ~360 tall), eyepiece top-left
  function microscope(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, INK.paperLight), r = inkEl(g), dk = inkEl(g, INK.inkSoft);
    return {
      eye: [-70, -350],
      update(t, x, y, s = 1) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s})`);
        const base = [[-110, 0], [110, 0], [96, -34], [-96, -34]];
        const arm = [[50, -34], [70, -120], [66, -230], [30, -300], [6, -280], [36, -220], [38, -130], [20, -34]];
        const tube = [[-96, -350], [-56, -366], [10, -170], [-30, -152]];
        f.setAttribute('d', inkLoop(base, { seed: sd + 1, t, amp: 1, smooth: false }) + ' ' + inkLoop(arm, { seed: sd + 2, t, amp: 1 }) + ' ' + inkLoop(tube, { seed: sd + 3, t, amp: 1, smooth: false }));
        r.setAttribute('d', inkPath(base.concat([base[0]]), { w: 6, seed: sd + 4, t, smooth: false }) + ' ' + inkPath(arm, { w: 6, seed: sd + 5, t, closed: true }) + ' ' +
          inkPath(tube.concat([tube[0]]), { w: 6, seed: sd + 6, t, smooth: false }) + ' ' + inkPath([[-60, -110], [60, -112]], { w: 8, seed: sd + 7, t }) + ' ' +
          inkPath([[-10, -150], [-14, -126]], { w: 9, seed: sd + 8, t }));
        dk.setAttribute('d', inkLoop(inkEllipsePts(-76, -358, 24, 10, sd + 9, 8, -0.4), { seed: sd + 9, t, amp: 0.6 }) + ' ' + inkLoop(inkEllipsePts(46, -170, 22, 22, sd + 10, 8), { seed: sd + 10, t, amp: 0.6 }));
      },
    };
  }

  const labelsOf = (g, list, W, H, sd) => window.MCB ? window.MCB.labels(g, list, W, H, sd) : { update() {} };
  const camOf = (g, lt, dur, W, H, o, hit, shake) => window.MCB ? window.MCB.camPush(g, lt, dur, W, H, o, hit, shake) : null;

  window.BM = { atOr, f1, bug, glass, dish, cast, lab, microscope };

  // ============================================================ bm_drink
  SH.bm_drink = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const by = (P.bench_y ?? 0.47) * H;
      const room = lab(el(cam, 'g'), W, H, by, sd, (P.floor_y ?? 0.6) * H);
      const glowE = inkEl(cam, INK.gold, { 'fill-opacity': 0.5 });
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const G = P.glass === false ? null : Object.assign({ x: 0.5, h: 300, level: 0.78, cloud: 1, bugs: 9 }, P.glass || {});
      const gl = G ? glass(el(cam, 'g'), sd + 200) : null;
      const D0 = P.dish ? Object.assign({ x: G ? G.x : 0.5, at: 'pour' }, P.dish) : null;
      const ds = D0 ? dish(el(cam, 'g'), sd + 250) : null;
      const fall = D0 ? inkEl(cam, INK.ink) : null;
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          room.update(t);
          cs.update(lt, t, cues);
          const pick = atOr(cues, P.pick, null);
          if (gl) {
            const pa = D0 ? atOr(cues, D0.at, 0.6) : null;
            const cl = D0 ? lerp(0.15, 1, prog(lt, pa + 0.3, 1.0)) : G.cloud;
            const bv = D0 ? prog(lt, pa + 0.2, 1.1) : 1;
            const gx = G.x * W, gy = by + 2;
            gl.update(t, { x: gx, y: gy, h: G.h, s: 1 + 0.06 * hit, level: G.level, cloud: cl, bugs: G.bugs, bugsVis: bv, hide: pick != null && lt >= pick, rot: Math.sin(t * 1.3) * 1.2 });
            if (P.glow && !(pick != null && lt >= pick)) {
              let d = '';
              for (let k = 0; k < 2; k++) { const ph = ((t * 0.7 + k * 0.5) % 1), rr = G.h * (0.55 + ph * 0.5);
                d += inkPath(inkEllipsePts(gx, gy - G.h * 0.5, rr * 0.8, rr, sd + 300 + k, 16), { w: 6 * (1 - ph), seed: sd + 310 + k, t, amp: 1, closed: true }) + ' '; }
              glowE.setAttribute('d', d);
            } else glowE.setAttribute('d', '');
            if (ds) {
              const tip = prog(lt, pa - 0.4, 0.5), gone = prog(lt, pa + 1.3, 0.4);
              ds.update(t, { hide: gone >= 1, x: gx + G.h * 0.55 - tip * G.h * 0.2, y: gy - G.h * (1.25 + gone * 0.6) + Math.sin(t * 2) * 4, r: 110, rot: -tip * 48 });
              let d = '';
              const fp = lt - pa;
              if (fp > 0 && fp < 1.6) for (let k = 0; k < 5; k++) {
                const u = (fp * 1.4 - k * 0.12); if (u < 0 || u > 1) continue;
                d += bug(gx + G.h * 0.22 - k * 10 + Math.sin(k * 3) * 16, gy - G.h * 1.18 + u * G.h * 0.5, 40, 1.2 + k * 0.3, t * 9 + k, sd + 260 + k, t, 4.5) + ' ';
              }
              fall.setAttribute('d', d);
            }
          }
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ bm_scope
  SH.bm_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const by = (P.bench_y ?? 0.47) * H;
      const room = lab(el(cam, 'g'), W, H, by, sd, (P.floor_y ?? 0.6) * H);
      const S0 = Object.assign({ x: 0.28, s: 1 }, P.scope || {});
      const ms = microscope(el(cam, 'g'), sd + 50);
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const V = P.view ? Object.assign({ x: 0.64, y: 0.3, r: 250, at: 'view', bugs: 12, bugs_at: 'find' }, P.view) : null;
      const vg = el(cam, 'g');
      const dash = V ? inkEl(vg, INK.inkSoft) : null, disc = V ? inkEl(vg, INK.paperLight) : null, cells = V ? inkEl(vg, INK.stain, { 'fill-opacity': 0.35 }) : null,
        cellR = V ? inkEl(vg, INK.inkSoft) : null, bugsE = V ? inkEl(vg, INK.ink) : null, ring = V ? inkEl(vg) : null;
      const r = rng(sd + 9), BG = Array.from({ length: 16 }, () => [r() * 2 - 1, r() * 2 - 1, r(), r()]);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          room.update(t);
          const mx = S0.x * W, sc = S0.s;
          ms.update(t, mx, by + 2, sc);
          cs.update(lt, t, cues);
          if (V) {
            const va = atOr(cues, V.at, 0.3), p = spring(lt, va, 0.6), R = V.r * Math.max(0.01, p) * (1 + 0.05 * hit);
            const cx = V.x * W, cy = V.y * H, ex = mx + ms.eye[0] * sc, ey = by + ms.eye[1] * sc;
            vg.style.display = lt < va ? 'none' : '';
            const dd = [];
            const n = 9, dl = prog(lt, va, 0.5);
            for (let k = 0; k < n; k++) { const u0 = k / n, u1 = (k + 0.5) / n; if (u0 > dl) break;
              dd.push(inkPath([[lerp(ex, cx - R * 0.7, u0), lerp(ey, cy + R * 0.7, u0)], [lerp(ex, cx - R * 0.7, Math.min(u1, dl)), lerp(ey, cy + R * 0.7, Math.min(u1, dl))]], { w: 5, seed: sd + 60 + k, t, amp: 0.8 })); }
            dash.setAttribute('d', dd.join(' '));
            const dp = inkEllipsePts(cx, cy, R, R, sd + 70, 18);
            disc.setAttribute('d', inkLoop(dp, { seed: sd + 70, t, amp: 1 }));
            let cd = '', cr = '';
            for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
              const px = cx + i * R * 0.38 + (j % 2) * R * 0.19, py = cy + j * R * 0.34;
              if (Math.hypot(px - cx, py - cy) > R * 0.78) continue;
              const pts = inkEllipsePts(px, py, R * 0.16, R * 0.14, sd + 80 + i * 7 + j, 9);
              cd += inkLoop(pts, { seed: sd + 80 + i * 7 + j, t, amp: 0.8 }) + ' ';
              cr += inkPath(pts, { w: 3, seed: sd + 90 + i * 7 + j, t, amp: 0.8, closed: true }) + ' ';
            }
            cells.setAttribute('d', cd); cellR.setAttribute('d', cr);
            const ba = atOr(cues, V.bugs_at, va + 0.6);
            let bd = '';
            BG.slice(0, V.bugs).forEach((q, k) => {
              const at = ba + k * 0.09; if (lt < at) return;
              const s2 = spring(lt, at, 0.4), drift = Math.sin(t * (0.8 + q[2]) + k) * R * 0.05;
              const px = cx + q[0] * R * 0.62 + drift, py = cy + q[1] * R * 0.62 + Math.cos(t * (0.7 + q[3]) + k) * R * 0.04;
              bd += bug(px, py, R * 0.3 * Math.max(0.01, s2), q[3] * 3 + Math.sin(t + k) * 0.3, t * 10 + k, sd + 120 + k * 5, t, Math.max(3, R * 0.032)) + ' ';
            });
            bugsE.setAttribute('d', bd);
            ring.setAttribute('d', inkPath(dp, { w: 12, seed: sd + 71, t, amp: 1.2, closed: true }));
          }
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ bm_pig
  function piglet(parent, sd) {
    const g = el(parent, 'g'), legs = [0, 1, 2, 3].map(() => inkEl(g)), tail = inkEl(g), bodyF = inkEl(g, INK.paperLight), body = inkEl(g),
      ear = inkEl(g, INK.paperDark), earR = inkEl(g), snoutF = inkEl(g, INK.paperDark), snout = inkEl(g), eye = inkEl(g), cheek = inkEl(g, INK.red, { 'fill-opacity': 0.35 });
    return {
      update(t, x, y, s, face, ph) {
        const bob = -Math.abs(Math.sin(ph * Math.PI * 2)) * 14;
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y + bob)}) scale(${(face * s).toFixed(3)} ${s})`);
        [[-60, 0], [-30, 0.5], [40, 0.25], [70, 0.75]].forEach(([lx, o], k) => {
          const sw = Math.sin((ph + o) * Math.PI * 2) * 16;
          legs[k].setAttribute('d', inkPath([[lx, -50], [lx + sw, -4 - bob]], { w: 13, seed: sd + k, t, amp: 0.8 }));
        });
        const bp = inkEllipsePts(0, -100, 120, 72, sd + 10, 16);
        bodyF.setAttribute('d', inkLoop(bp, { seed: sd + 10, t, amp: 1 }));
        body.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 11, t, closed: true, amp: 1.2 }));
        const tw = Math.sin(t * 6) * 6;
        tail.setAttribute('d', inkPath([[-118, -118], [-146, -132 + tw], [-150, -104], [-134, -112], [-150, -150 + tw]], { w: 5, seed: sd + 12, t, amp: 0.8 }));
        const ep = [[56, -150], [74, -200], [96, -158]];
        ear.setAttribute('d', inkLoop(ep, { seed: sd + 13, t, amp: 0.8, smooth: false }));
        earR.setAttribute('d', inkPath(ep.concat([ep[0]]), { w: 5, seed: sd + 14, t, amp: 0.8, smooth: false }));
        const sp = inkEllipsePts(124, -100, 22, 28, sd + 15, 10);
        snoutF.setAttribute('d', inkLoop(sp, { seed: sd + 15, t, amp: 0.6 }));
        snout.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 16, t, closed: true, amp: 0.6 }) + ' ' + inkDot(120, -108, 4, 6, sd + 17, t) + ' ' + inkDot(130, -92, 4, 6, sd + 18, t) + ' ' +
          inkPath([[70, -78], [86, -70], [100, -76]], { w: 4, seed: sd + 20, t, amp: 0.5 }));
        eye.setAttribute('d', inkDot(84, -122, 7, 8, sd + 19, t));
        cheek.setAttribute('d', inkLoop(inkEllipsePts(70, -96, 16, 10, sd + 21, 8), { seed: sd + 21, t, amp: 0.5 }));
      },
    };
  }
  SH.bm_pig = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 337;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground_y ?? 0.6) * H, pen = P.pen || [0.06, 0.94];
      const hills = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), hillR = inkEl(cam, INK.inkSoft), fence = inkEl(cam), ground = inkEl(cam, INK.inkSoft), mud = inkEl(cam, INK.stain, { 'fill-opacity': 0.45 });
      const pigs = Array.from({ length: P.pigs ?? 2 }, (_, k) => piglet(el(cam, 'g'), sd + 50 + k * 40));
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const hp = [];
          for (let x = -40; x <= W + 40; x += 60) hp.push([x, gy - H * 0.2 - Math.sin(x * 0.006 + 1) * 50 - Math.sin(x * 0.017) * 18]);
          hills.setAttribute('d', inkLoop(hp.concat([[W + 40, gy], [-40, gy]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 2, t, amp: 1 }));
          const x0 = pen[0] * W, x1 = pen[1] * W, fy = gy - 40;
          let fd = inkPath([[x0, fy - 120], [x1, fy - 124]], { w: 7, seed: sd + 3, t }) + ' ' + inkPath([[x0, fy - 50], [x1, fy - 54]], { w: 7, seed: sd + 4, t });
          for (let k = 0; k <= 6; k++) { const px = lerp(x0, x1, k / 6); fd += ' ' + inkPath([[px, fy - 160], [px + 2, fy + 30]], { w: 9, seed: sd + 10 + k, t }); }
          fence.setAttribute('d', fd);
          ground.setAttribute('d', inkPath([[-30, gy + 30], [W + 30, gy + 26]], { w: 5, seed: sd + 20, t, amp: 1.2 }));
          mud.setAttribute('d', inkLoop(inkEllipsePts(W * 0.5, gy + 60, W * 0.3, 34, sd + 21, 14), { seed: sd + 21, t, amp: 1 }));
          pigs.forEach((pg, k) => {
            const sp = 0.07 + k * 0.03, u = (Math.sin(t * sp * 6 + k * 2.4) + 1) / 2;
            const pr = P.pig_range || [0.22, 0.78], px = lerp(W * pr[0], W * pr[1], u), face = Math.cos(t * sp * 6 + k * 2.4) >= 0 ? 1 : -1;
            pg.update(t, px, gy + 60 + k * 26, (P.pig_scale ?? 1) * (0.95 - k * 0.12) * (1 + 0.05 * hit), face, t * 2.2 + k * 0.3);
          });
          cs.update(lt, t, cues);
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ bm_sick
  SH.bm_sick = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 619;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground_y ?? 0.6) * H;
      const floor = inkEl(cam, INK.inkSoft), wallLine = inkEl(cam, INK.inkSoft);
      const C = Object.assign({ x: 0.72, y: 0.27, from: 1, to: 5, at: 'day' }, P.calendar || {});
      const calF = inkEl(cam, INK.paperLight), calR = inkEl(cam), calTop = inkEl(cam, INK.red);
      const calT = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
      const calL = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 56, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.paperLight });
      calL.textContent = 'DAY';
      const leafF = inkEl(cam, INK.paperLight), leafR = inkEl(cam);
      const Pl = Object.assign({ x: 0.56 }, P.pail || {});
      const pailF = inkEl(cam, INK.paperDark), pailR = inkEl(cam);
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const swirl = inkEl(cam, INK.green), drops = inkEl(cam, INK.blue, { 'fill-opacity': 0.8 });
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          floor.setAttribute('d', inkPath([[-30, gy + 4], [W + 30, gy]], { w: 6, seed: sd + 1, t, amp: 1.2 }));
          wallLine.setAttribute('d', inkPath([[-30, gy - H * 0.06], [W + 30, gy - H * 0.06 - 4]], { w: 3, seed: sd + 2, t, amp: 1 }));
          // calendar
          const cx = C.x * W, cy = C.y * H, cw = 250, ch = 280, da = atOr(cues, C.at, 0.8);
          const flips = Math.max(0, C.to - C.from), fp = clamp01((lt - (da - 0.9)) / 0.9);
          const day = Math.min(C.to, C.from + Math.floor(fp * flips + 1e-6));
          const cp = [[cx - cw / 2, cy - ch / 2], [cx + cw / 2, cy - ch / 2 - 3], [cx + cw / 2 + 2, cy + ch / 2], [cx - cw / 2 + 2, cy + ch / 2 + 2]];
          calF.setAttribute('d', inkLoop(cp, { seed: sd + 10, t, amp: 1, smooth: false }));
          calR.setAttribute('d', inkPath(cp.concat([cp[0]]), { w: 7, seed: sd + 11, t, amp: 1.2, smooth: false }) + ' ' + inkPath([[cx, cy - ch / 2 - 40], [cx, cy - ch / 2]], { w: 5, seed: sd + 12, t }));
          calTop.setAttribute('d', inkLoop([[cx - cw / 2, cy - ch / 2], [cx + cw / 2, cy - ch / 2 - 3], [cx + cw / 2, cy - ch / 2 + 74], [cx - cw / 2, cy - ch / 2 + 76]], { seed: sd + 13, t, amp: 1, smooth: false }));
          const pk = punch(lt, day === C.to && lt >= da ? da : null, 0.6);
          calL.setAttribute('x', f1(cx)); calL.setAttribute('y', f1(cy - ch / 2 + 38));
          calT.setAttribute('x', f1(cx)); calT.setAttribute('y', f1(cy + 46));
          calT.setAttribute('fill', day === C.to ? INK.red : INK.ink);
          calT.setAttribute('transform', `translate(${f1(cx)} ${f1(cy + 46)}) scale(${(1 + 0.15 * pk).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy - 46)})`);
          calT.textContent = String(day);
          // a torn leaf flying off at each flip
          const fl = (fp * flips) % 1, flying = fp > 0 && fp < 1 && flips > 0;
          if (flying) {
            const lx = cx + fl * 260, ly = cy + 40 + fl * fl * 260, rot = fl * 80;
            const lp = [[-90, -90], [90, -92], [92, 90], [-88, 92]].map(q => { const a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [lx + q[0] * c - q[1] * s, ly + q[0] * s + q[1] * c]; });
            leafF.setAttribute('d', inkLoop(lp, { seed: sd + 14, t, amp: 1, smooth: false }));
            leafR.setAttribute('d', inkPath(lp.concat([lp[0]]), { w: 5, seed: sd + 15, t, smooth: false }));
          } else { leafF.setAttribute('d', ''); leafR.setAttribute('d', ''); }
          // pail
          const px = Pl.x * W, pp = [[px - 70, gy - 150], [px + 70, gy - 152], [px + 54, gy], [px - 54, gy]];
          pailF.setAttribute('d', inkLoop(pp, { seed: sd + 20, t, amp: 1, smooth: false }));
          pailR.setAttribute('d', inkPath(pp.concat([pp[0]]), { w: 6, seed: sd + 21, t, smooth: false }) + ' ' +
            inkPath([[px - 70, gy - 150], [px - 40, gy - 230], [px + 40, gy - 232], [px + 70, gy - 152]], { w: 5, seed: sd + 22, t, amp: 1 }) + ' ' +
            inkPath([[px - 62, gy - 110], [px + 62, gy - 112]], { w: 4, seed: sd + 23, t }));
          cs.update(lt, t, cues);
          // queasy swirl + sweat over the sick figure
          const sw = P.swirl === false ? null : Object.assign({ who: 0, at: 'sick' }, P.swirl || {});
          const it = sw && P.cast && P.cast[sw.who];
          if (it) {
            const sa = atOr(cues, sw.at, 0.5), on = spring(lt, sa - 0.6, 0.6), sc = it.scale ?? 0.9;
            const hx = it.x * W, hy = (it.y ?? 0.6) * H - (it.pose === 'sit' ? 470 : 560) * sc;
            let d = '';
            if (lt > sa - 0.6) {
              const pts = [];
              for (let k = 0; k <= 26; k++) { const a = k * 0.5 + t * 4, rr = (6 + k * 2.6) * on; pts.push([hx + Math.cos(a) * rr, hy - 120 * sc + Math.sin(a) * rr * 0.55]); }
              d = inkPath(pts, { w: 6, seed: sd + 30, t, amp: 0.8 });
            }
            swirl.setAttribute('d', d);
            let dd = '';
            if (lt > sa - 0.3) for (let k = 0; k < 3; k++) {
              const ph = ((t * 0.9 + k / 3) % 1), dx = hx + (k - 1) * 70 * sc + (k === 1 ? 60 : 0), dy = hy - 30 * sc + ph * 60;
              dd += inkLoop([[dx, dy - 22], [dx + 11, dy], [dx, dy + 10], [dx - 11, dy]], { seed: sd + 40 + k, t, amp: 0.5 }) + ' ';
            }
            drops.setAttribute('d', dd);
          }
          camOf(cam, lt, dur, W, H, P.cam, hit, 0);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ bm_stomach
  SH.bm_stomach = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 271;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const k = (P.k ?? 0.88) * W / 1080, ox = W * (P.cx ?? 0.5), oy = H * (P.cy ?? 0.43);
      const S = (x, y) => [ox + x * k, oy + y * k];
      // J-shaped stomach outline (outer), gullet from the top left
      const outer = [[-150, -330], [-60, -320], [10, -250], [150, -270], [300, -200], [360, -40], [330, 140], [210, 300], [20, 350], [-160, 310], [-300, 220], [-360, 120],
        [-300, 70], [-200, 130], [-80, 150], [40, 90], [80, -20], [10, -120], [-110, -170], [-200, -250]].map(q => S(q[0], q[1]));
      const lining = [[-120, -250], [-40, -230], [40, -180], [170, -200], [270, -140], [300, -30], [270, 120], [170, 250], [20, 290], [-150, 250], [-270, 170]].map(q => S(q[0], q[1]));
      const gul = [[-260, -560], [-220, -460], [-190, -370], [-170, -310]].map(q => S(q[0], q[1]));
      const gul2 = [[-160, -560], [-120, -460], [-90, -380], [-60, -320]].map(q => S(q[0], q[1]));
      const fill = inkEl(cam, INK.paperLight), inner = inkEl(cam, INK.stain, { 'fill-opacity': 0.3 }), folds = inkEl(cam, INK.inkSoft), patches = inkEl(cam, INK.red, { 'fill-opacity': 0.5 }),
        bugsE = inkEl(cam, INK.ink), wall = inkEl(cam), gulF = inkEl(cam, INK.paperLight), gulR = inkEl(cam), light = inkEl(cam, INK.gold, { 'fill-opacity': 0.3 }), tube = inkEl(cam), camHead = inkEl(cam, INK.inkSoft);
      const pillsR = inkEl(cam, INK.red), pillsL = inkEl(cam, INK.paperLight), pillsO = inkEl(cam), check = inkEl(cam, INK.green);
      const HL = P.heal ? Object.assign({ at: 'cured', check: [0.78, 0.36] }, P.heal) : null;
      const r = rng(sd + 3), PT = Array.from({ length: 9 }, () => [r() * 2 - 1, r() * 2 - 1, r()]), BG = Array.from({ length: 12 }, () => [r() * 2 - 1, r() * 2 - 1, r()]);
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const br = 1 + Math.sin(t * 2.2) * 0.008;
          fill.setAttribute('d', inkLoop(outer, { seed: sd + 1, t, amp: 1.2 }));
          inner.setAttribute('d', inkLoop(lining, { seed: sd + 2, t, amp: 1.2 }));
          let fd = '';
          for (let i = 0; i < 6; i++) {
            const pts = [];
            for (let j = 0; j <= 6; j++) pts.push(S(-220 + j * 75, -120 + i * 60 + Math.sin(j * 1.3 + i + t * 1.5) * 16 + (j - 3) * (j - 3) * 4 - (i < 2 ? 0 : 0)));
            fd += inkPath(pts.filter(q => Math.hypot(q[0] - ox - 30 * k, q[1] - oy - 40 * k) < 260 * k), { w: 4, seed: sd + 10 + i, t, amp: 1 }) + ' ';
          }
          folds.setAttribute('d', fd);
          const ia = atOr(cues, (P.inflame || {}).at || 'inflamed', dur * 0.55);
          const ha = HL ? atOr(cues, HL.at, dur * 0.5) : null, hp = HL ? 1 - prog(lt, ha + 0.1, 0.9) : 1;
          let pd = '', bd = '';
          PT.forEach((q, i) => {
            const p = spring(lt, ia + i * 0.07, 0.5); if (lt < ia + i * 0.07) return;
            const rr = (40 + q[2] * 50) * k * Math.max(0.01, p) * hp * (1 + Math.sin(t * 4 + i) * 0.05);
            if (rr < 1) return;
            const c = S(q[0] * 150 + 20, q[1] * 130 + 50);
            pd += inkLoop(inkEllipsePts(c[0], c[1], rr, rr * 0.8, sd + 30 + i, 10), { seed: sd + 30 + i, t, amp: 1.2 }) + ' ';
          });
          patches.setAttribute('d', pd);
          BG.slice(0, P.bugs ?? 9).forEach((q, i) => {
            const at = ia - 0.4 + i * 0.06; if (lt < at || hp < 0.05) return;
            const c = S(q[0] * 220 + 30 + Math.sin(t + i) * 8, q[1] * 190 + 30 + Math.cos(t * 0.8 + i) * 8);
            bd += bug(c[0], c[1], 58 * k * spring(lt, at, 0.4) * hp, q[2] * 3 + Math.sin(t + i) * 0.3, t * 10 + i, sd + 50 + i * 5, t, 5 * k) + ' ';
          });
          bugsE.setAttribute('d', bd);
          wall.setAttribute('d', inkPath(outer, { w: 10 * k, seed: sd + 4, t, amp: 1.5, closed: true }) + ' ' + inkPath(lining, { w: 4, seed: sd + 5, t, amp: 1, closed: true }));
          gulF.setAttribute('d', inkLoop(gul.concat(gul2.slice().reverse()), { seed: sd + 6, t, amp: 1 }));
          gulR.setAttribute('d', inkPath(gul, { w: 8 * k, seed: sd + 7, t }) + ' ' + inkPath(gul2, { w: 8 * k, seed: sd + 8, t }));
          // endoscope: a cable slides down the gullet, the lit camera head swings its light over the lining
          const Sc = Object.assign({ at: 0, dur: 1.4 }, P.scope || {}), sp = progIO(lt, atOr(cues, Sc.at, 0), Sc.dur);
          const path0 = [S(-200, -600), S(-190, -560), S(-150, -440), S(-120, -330), S(-80, -230), S(-30, -150)];
          const n = Math.max(2, Math.round(2 + sp * (path0.length - 2)));
          const tp = path0.slice(0, n);
          const last = tp[tp.length - 1], prev = tp[tp.length - 2], u = sp * (path0.length - 2) % 1;
          const tip = sp >= 1 ? path0[path0.length - 1] : [lerp(prev[0], path0[Math.min(n, path0.length - 1)][0], u), lerp(prev[1], path0[Math.min(n, path0.length - 1)][1], u)];
          if (P.scope === false) { tube.setAttribute('d', ''); camHead.setAttribute('d', ''); light.setAttribute('d', ''); }
          else {
          tube.setAttribute('d', inkPath(tp.slice(0, -1).concat([tip]), { w: 14 * k, seed: sd + 9, t, amp: 0.8 }));
          camHead.setAttribute('d', inkLoop(inkEllipsePts(tip[0], tip[1], 22 * k, 22 * k, sd + 11, 8), { seed: sd + 11, t, amp: 0.6 }));
          const sweep = Math.sin(t * 1.6) * 0.5 + 0.35, L = 330 * k * clamp01(sp * 1.4 - 0.3);
          light.setAttribute('d', L > 5 ? inkLoop([tip, [tip[0] + Math.cos(sweep - 0.32) * L, tip[1] + Math.sin(sweep - 0.32) * L + 120 * k], [tip[0] + Math.cos(sweep + 0.32) * L, tip[1] + Math.sin(sweep + 0.32) * L + 180 * k]], { seed: sd + 12, t, amp: 1.5 }) : '');
          }
          // healing: capsules slide down the gullet into the stomach, then a green tick
          if (HL) {
            const gp = [S(-200, -600), S(-170, -460), S(-130, -330), S(-60, -200), S(20, -40)];
            let dr = '', dl = '', dO = '';
            for (let i = 0; i < 4; i++) {
              const u = clamp01((lt - ha + 0.3 - i * 0.18) / 1.0); if (u <= 0) continue;
              const f = u * (gp.length - 1), j = Math.min(gp.length - 2, Math.floor(f)), e = f - j;
              const x = lerp(gp[j][0], gp[j + 1][0], e) + (u >= 1 ? (i - 1.5) * 60 * k : 0), y = lerp(gp[j][1], gp[j + 1][1], e) + (u >= 1 ? Math.sin(i * 2) * 40 * k : 0);
              const a = 0.9 + i * 0.5 + t * (u < 1 ? 3 : 0.3), L = 46 * k, R = 18 * k, cx = Math.cos(a), sx = Math.sin(a);
              const cap = (s0, s1) => { const pts = []; for (let q = 0; q <= 8; q++) { const th = Math.PI / 2 + q / 8 * Math.PI; pts.push([s0 + Math.cos(th) * R, Math.sin(th) * R]); } pts.push([s1, R]); pts.push([s1, -R]); return pts; };
              const tf = pts => pts.map(([px, py]) => [x + px * cx - py * sx, y + px * sx + py * cx]);
              const left = tf(cap(-L / 2 + R, 0)), right = tf(cap(-L / 2 + R, 0).map(([px, py]) => [-px, py]));
              dr += inkLoop(left, { seed: sd + 200 + i, t, amp: 0.4, smooth: false }) + ' ';
              dl += inkLoop(right, { seed: sd + 210 + i, t, amp: 0.4, smooth: false }) + ' ';
              dO += inkPath(left.concat([left[0]]), { w: 4, seed: sd + 220 + i, t, amp: 0.4, smooth: false }) + ' ' + inkPath(right.concat([right[0]]), { w: 4, seed: sd + 230 + i, t, amp: 0.4, smooth: false }) + ' ';
            }
            pillsR.setAttribute('d', dr); pillsL.setAttribute('d', dl); pillsO.setAttribute('d', dO);
            const cp = prog(lt, ha + 1.0, 0.5), c0 = [HL.check[0] * W, HL.check[1] * H];
            const ck = [[c0[0] - 60, c0[1]], [c0[0] - 15, c0[1] + 50], [c0[0] + 80, c0[1] - 70]];
            check.setAttribute('d', cp > 0.02 ? inkPath(cp < 0.4 ? [ck[0], [lerp(ck[0][0], ck[1][0], cp / 0.4), lerp(ck[0][1], ck[1][1], cp / 0.4)]] : [ck[0], ck[1], [lerp(ck[1][0], ck[2][0], (cp - 0.4) / 0.6), lerp(ck[1][1], ck[2][1], (cp - 0.4) / 0.6)]], { w: 22, seed: sd + 240, t, amp: 1 }) : '');
          }
          cs.update(lt, t, cues);
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ bm_nobel
  SH.bm_nobel = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 199;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const Y = Object.assign({ from: 1984, to: 2005, at: 0, dur: 1.8, y: 0.2 }, P.years || {});
      const M = Object.assign({ x: 0.5, y: 0.43, r: 180 }, P.medal || {});
      const yearT = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
      const rays = inkEl(cam, INK.gold);
      const mg = el(cam, 'g');
      const ribbonF = inkEl(mg, INK.blue), ribbonR = inkEl(mg), discF = inkEl(mg, INK.gold), discR = inkEl(mg), face = inkEl(mg, INK.hatBand, { 'fill-opacity': 0.55 });
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      const lb = labelsOf(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const ya = atOr(cues, Y.at, 0), yp = progIO(lt, ya, Y.dur);
          const yr = Math.round(lerp(Y.from, Y.to, yp));
          yearT.textContent = String(yr);
          const ypk = punch(lt, ya + Y.dur, 0.6);
          yearT.setAttribute('fill', yp >= 1 ? INK.red : INK.ink);
          const yy = Y.y * H, b = boil(sd + 1, t, 1.5);
          yearT.setAttribute('transform', `translate(${f1(W / 2 + b[0])} ${f1(yy + b[1])}) scale(${(1 + 0.12 * ypk).toFixed(3)})`);
          // medal swings in on its ribbon
          const ma = atOr(cues, M.at, Y.at === 0 ? 0.3 : ya), mp = spring(lt, ma, 0.8);
          const sw = Math.sin(t * 1.8) * 6 * (0.4 + 0.6 * Math.exp(-(lt - ma) * 0.6)) + (1 - clamp01(mp)) * 30;
          const mx = M.x * W, my = M.y * H, top = yy + 110;
          mg.setAttribute('transform', `rotate(${f1(sw)} ${f1(mx)} ${f1(top)}) translate(0 ${f1((1 - clamp01(mp)) * -260)})`);
          mg.style.display = lt < ma ? 'none' : '';
          const R = M.r * (1 + 0.06 * hit);
          const rb = [[mx - 70, top], [mx + 70, top], [mx + 30, my - R + 10], [mx - 30, my - R + 10]];
          ribbonF.setAttribute('d', inkLoop(rb, { seed: sd + 2, t, amp: 1, smooth: false }));
          ribbonR.setAttribute('d', inkPath(rb.concat([rb[0]]), { w: 5, seed: sd + 3, t, smooth: false }));
          const dp = inkEllipsePts(mx, my, R, R, sd + 4, 18);
          discF.setAttribute('d', inkLoop(dp, { seed: sd + 4, t, amp: 1 }));
          discR.setAttribute('d', inkPath(dp, { w: 9, seed: sd + 5, t, closed: true }) + ' ' + inkPath(inkEllipsePts(mx, my, R * 0.8, R * 0.8, sd + 6, 16), { w: 4, seed: sd + 7, t, closed: true }));
          // simple profile head on the medal (facing left)
          const pr = [[0.18, -0.5], [-0.12, -0.46], [-0.3, -0.24], [-0.34, -0.06], [-0.44, 0.06], [-0.32, 0.12], [-0.3, 0.3], [-0.12, 0.4], [-0.06, 0.6], [0.36, 0.6], [0.3, 0.3], [0.4, 0.0], [0.38, -0.3]].map(q => [mx + q[0] * R * 0.7, my + q[1] * R * 0.7]);
          face.setAttribute('d', inkLoop(pr, { seed: sd + 8, t, amp: 0.8 }));
          let rd = '';
          if (lt > ma + 0.3) for (let k = 0; k < 12; k++) {
            const a = k / 12 * Math.PI * 2 + t * 0.15, r0 = R * 1.18 + Math.sin(t * 3 + k) * 8;
            rd += inkPath([[mx + Math.cos(a) * r0, my + Math.sin(a) * r0], [mx + Math.cos(a) * (r0 + 46), my + Math.sin(a) * (r0 + 46)]], { w: 6, seed: sd + 20 + k, t, amp: 0.8 }) + ' ';
          }
          rays.setAttribute('d', rd);
          cs.update(lt, t, cues);
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
  // ============================================================ bm_clinic
  // SHOTS.bm_clinic — a 1980s doctor's office: a framed chart on the wall (hand-written lines via labels), a desk
  //   with a stethoscope, a patient stool. P: {chart: {x: 0.3, y: 0.3, w: 0.5, h: 0.24}, labels, cast, cam}
  SH.bm_clinic = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 733;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground_y ?? 0.6) * H;
      const C = Object.assign({ x: 0.32, y: 0.3, w: 0.52, h: 0.22 }, P.chart || {});
      const floor = inkEl(cam, INK.inkSoft), chF = inkEl(cam, INK.paperLight), chR = inkEl(cam), cross = inkEl(cam, INK.red);
      const deskF = inkEl(cam, INK.paperDark), deskR = inkEl(cam), steth = inkEl(cam, INK.inkSoft);
      const lb = labelsOf(el(cam, 'g'), P.labels, W, H, sd + 400);
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 100);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          floor.setAttribute('d', inkPath([[-30, gy + 4], [W + 30, gy]], { w: 6, seed: sd + 1, t, amp: 1.2 }) + ' ' + inkPath([[-30, gy - H * 0.05], [W + 30, gy - H * 0.05 - 4]], { w: 3, seed: sd + 2, t }));
          const x0 = (C.x - C.w / 2) * W, x1 = (C.x + C.w / 2) * W, y0 = (C.y - C.h / 2) * H, y1 = (C.y + C.h / 2) * H;
          const cp = [[x0, y0], [x1, y0 - 4], [x1 + 3, y1], [x0 + 2, y1 + 3]];
          chF.setAttribute('d', inkLoop(cp, { seed: sd + 3, t, amp: 1, smooth: false }));
          chR.setAttribute('d', inkPath(cp.concat([cp[0]]), { w: 9, seed: sd + 4, t, amp: 1.2, smooth: false }) + ' ' + inkPath([[(x0 + x1) / 2, y0 - 60], [(x0 + x1) / 2, y0]], { w: 4, seed: sd + 5, t }));
          const cx = x1 - 50, cy = y0 + 50;
          cross.setAttribute('d', inkPath([[cx - 22, cy], [cx + 22, cy]], { w: 12, seed: sd + 6, t, amp: 0.6 }) + ' ' + inkPath([[cx, cy - 22], [cx, cy + 22]], { w: 12, seed: sd + 7, t, amp: 0.6 }));
          const dx = (P.desk_x ?? 0.62) * W, dp = [[dx - 150, gy - 230], [dx + 150, gy - 232], [dx + 150, gy - 200], [dx - 150, gy - 198]];
          deskF.setAttribute('d', inkLoop(dp, { seed: sd + 8, t, amp: 1, smooth: false }));
          deskR.setAttribute('d', inkPath(dp.concat([dp[0]]), { w: 6, seed: sd + 9, t, smooth: false }) + ' ' + inkPath([[dx - 130, gy - 200], [dx - 128, gy]], { w: 7, seed: sd + 10, t }) + ' ' + inkPath([[dx + 130, gy - 200], [dx + 128, gy]], { w: 7, seed: sd + 11, t }));
          const sw = Math.sin(t * 2) * 3;
          steth.setAttribute('d', inkPath([[dx - 80, gy - 236], [dx - 60, gy - 280 + sw], [dx - 20, gy - 290], [dx + 20, gy - 280 - sw], [dx + 40, gy - 236]], { w: 6, seed: sd + 12, t, amp: 0.8 }) + ' ' + inkDot(dx + 60, gy - 244, 16, 12, sd + 13, t));
          cs.update(lt, t, cues);
          camOf(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
