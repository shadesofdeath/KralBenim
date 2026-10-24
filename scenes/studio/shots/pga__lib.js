// pga__lib: shared helpers for the pga_* shots (Stickstory long video ag-04-phineas-gage, cold open + chapters 1-2).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5), every line boils at 8 Hz via _ink.js,
// pure function of (seed, lt): no Math.random. Needs _ink.js, kasif.js, mcB__lib.js (loaded before: sorted names).
// window.PGA = {
//   gage(group, {scale: 0.6, seed, head: "cap"|"top"|"none", bandage: false, beard}) -> {update(t, pose, o) -> {head, headR, hands, hip}}
//       a period figure (hatless rig + a drawn 1848 cloth cap / top hat, optional head bandage). o as KASIF update
//       ({x, y, face, since, dir, emotion, prev, mix}); the returned points are in stage px.
//   iron(group) -> {draw(t, sd, butt, tip, w)}   the tamping iron: a long round bar, the last 30% tapering to a point
//   burst(cx, cy, r, sd, t, n) -> points of a jagged explosion star
//   bubble(group, sd) -> {update(t, lt, {x, y, w, h, tail: [x, y], p, text, dots})}   speech bubble (hand lettering)
//   hills(group, W, yBase, sd, {h, ridges, pines}) -> {update(t, dx)}   far Vermont hills with little pines
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const HEADS = {
    // 1848 cloth cap: soft crown + a short visor towards the facing side
    cap: { fill: INK.paperDark, crown: [[-76, -26], [-80, -64], [-56, -98], [-6, -110], [46, -100], [76, -66], [78, -32]], visor: [[44, -40], [122, -38], [128, -24], [58, -24]] },
    // doctor's top hat
    top: { fill: INK.ink, crown: [[-58, -52], [-54, -170], [-30, -176], [30, -176], [56, -170], [60, -52]], visor: [[-104, -52], [-60, -60], [60, -60], [106, -52], [100, -40], [-98, -40]] },
  };

  function gage(group, o = {}) {
    const sc = o.scale ?? 0.6, seed = o.seed ?? 11;
    const rig = KASIF.create(group, { scale: sc, hat: false, beard: o.beard || null, seed });
    // the rig's sign/item groups are not used here: the 'hold' pose would otherwise show an empty sign board
    [...rig.node.querySelectorAll(':scope > g')].forEach(g => { g.style.display = 'none'; });
    const kind = o.head ?? 'cap', H0 = HEADS[kind] || null;
    const bandF = o.bandage ? inkEl(rig.node, INK.paperLight) : null, bandR = o.bandage ? inkEl(rig.node) : null;
    const capF = H0 ? inkEl(rig.node, H0.fill) : null, capR = H0 ? inkEl(rig.node) : null;
    const visF = H0 ? inkEl(rig.node, H0.fill) : null;
    return {
      node: rig.node,
      update(t, pose, u = {}) {
        const r = rig.update(t, pose, u) || { head: [0, -470], hip: [0, -180], hands: [[0, -300], [0, -300]] };
        const hc = r.head, P = pts => pts.map(q => [hc[0] + q[0], hc[1] + q[1]]);
        if (H0) {
          const cr = P(H0.crown), vi = P(H0.visor);
          capF.setAttribute('d', inkLoop(cr, { seed: seed * 7 + 1, t, amp: 1.2 }));
          visF.setAttribute('d', inkLoop(vi, { seed: seed * 7 + 2, t, amp: 1, smooth: false }));
          capR.setAttribute('d', inkPath(cr, { w: 5.5, seed: seed * 7 + 3, t, closed: true, amp: 1.2 }) + ' ' +
            inkPath(vi, { w: 5, seed: seed * 7 + 4, t, closed: true, amp: 1, smooth: false }) +
            (kind === 'top' ? ' ' + inkPath(P([[-56, -78], [58, -78]]), { w: 9, seed: seed * 7 + 5, t, amp: 0.8 }) : ''));
        }
        if (bandF) {
          const b = P([[-75, -16], [-74, -46], [0, -52], [74, -44], [75, -14], [0, -20]]);
          const knot = P([[-74, -30], [-104, -46], [-110, -14]]);
          bandF.setAttribute('d', inkLoop(b, { seed: seed * 7 + 6, t, amp: 1 }));
          bandR.setAttribute('d', inkPath(b, { w: 4.5, seed: seed * 7 + 7, t, closed: true, amp: 1 }) + ' ' + inkPath(knot, { w: 5, seed: seed * 7 + 8, t, amp: 1 }));
        }
        const face = u.face ?? 1, s = sc * (u.scale ?? 1), X = u.x ?? 0, Y = u.y ?? 0;
        const W2 = q => [X + face * s * q[0], Y + s * q[1]];
        return { head: W2(hc), headR: 72 * s, hip: W2(r.hip), hands: r.hands.map(W2), s, face };
      },
    };
  }

  function iron(group) {
    const fill = inkEl(group, INK.inkSoft), line = inkEl(group), shine = inkEl(group, INK.paperLight, { 'fill-opacity': 0.7 });
    return {
      fill, line, shine,
      draw(t, sd, b, tp, w = 20, vis = true) {
        if (!vis) { fill.setAttribute('d', ''); line.setAttribute('d', ''); shine.setAttribute('d', ''); return; }
        const dx = tp[0] - b[0], dy = tp[1] - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const m = [b[0] + ux * L * 0.7, b[1] + uy * L * 0.7], hw = w / 2;
        const pts = [[b[0] + nx * hw, b[1] + ny * hw], [m[0] + nx * hw, m[1] + ny * hw], tp, [m[0] - nx * hw, m[1] - ny * hw], [b[0] - nx * hw, b[1] - ny * hw]];
        fill.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.9, smooth: false }));
        line.setAttribute('d', inkPath(pts, { w: Math.max(3.5, w * 0.24), seed: sd + 1, t, closed: true, amp: 0.9, smooth: false }));
        const s0 = [b[0] + nx * hw * 0.35 + ux * L * 0.05, b[1] + ny * hw * 0.35 + uy * L * 0.05], s1 = [b[0] + nx * hw * 0.3 + ux * L * 0.66, b[1] + ny * hw * 0.3 + uy * L * 0.66];
        shine.setAttribute('d', inkPath([s0, s1], { w: Math.max(2.5, w * 0.16), seed: sd + 2, t, amp: 0.6, taper: 0.6 }));
      },
    };
  }

  function burst(cx, cy, r, sd, t, n = 11) {
    const R = rng(sd * 13 + 7), pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = i / (n * 2) * Math.PI * 2 + 0.2, k = i % 2 ? 0.45 + R() * 0.15 : 0.85 + R() * 0.3;
      pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
    }
    return pts;
  }

  function bubble(group, sd) {
    const g = el(group, 'g'), f = inkEl(g, INK.paperLight), r = inkEl(g), dots = inkEl(g, INK.ink);
    const tx = el(g, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': 56, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
    return {
      update(t, lt, o) {
        const p = o.p ?? 1;
        if (p < 0.01) { g.style.display = 'none'; return; }
        g.style.display = '';
        const w = o.w ?? 300, h = o.h ?? 130, x = o.x, y = o.y, s = Math.max(0.01, p);
        const pts = inkEllipsePts(0, 0, w / 2, h / 2, sd, 16);
        const tl = o.tail ? [(o.tail[0] - x) / s, (o.tail[1] - y) / s] : [-w * 0.3, h];
        const a0 = Math.atan2(tl[1], tl[0]);
        const b1 = [Math.cos(a0 - 0.28) * w * 0.42, Math.sin(a0 - 0.28) * h * 0.42], b2 = [Math.cos(a0 + 0.28) * w * 0.42, Math.sin(a0 + 0.28) * h * 0.42];
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
        const tail = [b1, tl, b2];
        f.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 1.2 }) + ' ' + inkLoop(tail, { seed: sd + 1, t, amp: 1, smooth: false }));
        r.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, amp: 1.2 }) + ' ' + inkPath(tail, { w: 5, seed: sd + 3, t, amp: 1 }));
        if (o.text) { if (tx.textContent !== o.text) tx.textContent = o.text; tx.setAttribute('font-size', o.size || 56); }
        else tx.textContent = '';
        if (o.dots) {
          let d = '';
          for (let i = 0; i < 3; i++) { const j = Math.max(0, Math.sin(lt * 6 - i * 0.9)) * 12; d += inkDot((i - 1) * 46, -j, 11, 11, sd + 10 + i, t) + ' '; }
          dots.setAttribute('d', d);
        } else dots.setAttribute('d', '');
      },
    };
  }

  function hills(group, W, yb, sd, o = {}) {
    const hgt = o.h ?? 150, R = rng(sd + 3), ridges = [];
    const n = o.ridges ?? 2;
    for (let k = 0; k < n; k++) {
      const pts = [], amp = hgt * (1 - k * 0.35), off = R() * 10;
      for (let x = -200; x <= W + 200; x += 120) pts.push([x, yb - k * 30 - amp * (0.45 + 0.55 * Math.abs(Math.sin(x * 0.0021 + off + k)))]);
      ridges.push(pts);
    }
    const pines = [];
    for (let i = 0; i < (o.pines ?? 16); i++) pines.push([R() * (W + 200) - 100, 0.6 + R() * 0.5]);
    const fills = ridges.map((_, k) => inkEl(group, INK.paperDark, { 'fill-opacity': k === 0 ? 0.55 : 0.32 }));
    const lines = inkEl(group, INK.inkSoft), pine = inkEl(group, INK.inkSoft, { 'fill-opacity': 0.85 });
    return {
      update(t, dx = 0) {
        let dl = '';
        ridges.slice().reverse().forEach((pts, kk) => {
          const k = ridges.length - 1 - kk, sh = dx * (0.3 + 0.2 * (ridges.length - k));
          const p2 = pts.map(q => [q[0] + sh, q[1]]);
          fills[k].setAttribute('d', inkLoop(p2.concat([[W + 300, yb + 4], [-300, yb + 4]]), { seed: sd + 10 + k, t, amp: 0.8, smooth: true }));
          dl += inkPath(p2, { w: 4, seed: sd + 20 + k, t, amp: 1 }) + ' ';
        });
        lines.setAttribute('d', dl);
        const top = ridges[0];
        let dp = '';
        pines.forEach(([x0, k], i) => {
          const x = ((x0 + dx * 0.5) % (W + 200) + W + 200) % (W + 200) - 100;
          const j = Math.max(0, Math.min(top.length - 2, Math.floor((x + 200) / 120))), u = ((x + 200) - j * 120) / 120;
          const y = lerp(top[j][1], top[j + 1][1], u) + 14, h = 70 * k;
          dp += inkLoop([[x, y - h], [x + h * 0.32, y], [x - h * 0.32, y]], { seed: sd + 40 + i, t, amp: 0.8, smooth: false }) + ' ';
        });
        pine.setAttribute('d', dp);
      },
    };
  }

  // cast like MCB.cast, but period figures are PGA.gage (cap / top hat / bandage) and every member may
  // shake: cue|s (jitter that fades, "his body shook") · shake_until: cue · in_place: true (walk/run cycles without moving,
  // for scrolling backgrounds) · head: "cap"|"top"|"none" · bandage: true. Kaşif entries: who "kasif" (fez/hat rig).
  // update(lt, t, cues) -> [{head, hands, hip, s, face, x, y, m}] per member (stage px), for props held in the hands.
  function cast(group, list, W, H, sd) {
    const { atOr, faceOf, dirOf } = window.MCB;
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', g = el(group, 'g');
      const rig = isK ? KASIF.create(g, { scale: m.scale ?? 0.6, seed: sd + i * 13 })
        : gage(g, { scale: m.scale ?? 0.6, seed: sd + i * 13 + 7, head: m.head ?? 'cap', bandage: !!m.bandage, beard: m.beard });
      return { m, rig, g, isK };
    });
    return {
      update(lt, t, cues) {
        return items.map(({ m, rig, g, isK }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; return null; }
          g.style.display = '';
          const sc = m.scale ?? 0.6, face0 = faceOf(m.face, 1);
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
            if (lt < arrive && lt >= start) { pose = m.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
            else if (lt < start) pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle';
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          } else if (m.in_place && (pose === 'walk' || pose === 'run')) ph = lt / (pose === 'run' ? 0.62 : 0.9);
          let y = H * (m.y ?? 0.86);
          const shA = atOr(cues, m.shake, null), shU = atOr(cues, m.shake_until, null);
          if (shA != null && lt >= shA && (shU == null || lt < shU)) {
            const k = shU == null ? Math.exp(-(lt - shA) * 1.2) : 1;
            x += Math.sin(lt * 57) * 7 * k; y += Math.cos(lt * 43) * 3 * k;
          }
          const o = { x, y, face, since, ph, dir: dirOf(s.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir) }; o.mix = since / 0.32; }
          const r = isK ? rig.update(t, pose, o) : null;
          const info = isK ? (() => { const s2 = sc, W2 = q => [x + face * s2 * q[0], y + s2 * q[1]]; const rr = r || { head: [0, -470], hands: [[0, 0], [0, 0]], hip: [0, -180] };
            return { head: W2(rr.head), hands: rr.hands.map(W2), hip: W2(rr.hip), s: s2, face, headR: 72 * s2 }; })() : rig.update(t, pose, o);
          return Object.assign(info, { x, y, m, pose });
        });
      },
    };
  }

  window.PGA = { gage, iron, burst, bubble, hills, cast, f1 };
})();
