// cmh__lib: shared ink helpers for the cmh_* shots (02-cumhuriyetin-ilani-1923). Not a shot type itself.
// window.CMH = {atOr, f1, faceOf, dirOf, cast(group, list, W, H, sd), bust(group, o), clock(group, o), lamp(group, o),
//   puff(cx, cy, r, seed, t), star(cx, cy, r, seed, t), labels(group, list, W, H, sd) (window.MCB.labels)}
// cast entry: {who: "kasif"|name, hat: "kalpak"|"fes"|"none", accessory ("turban"...), beard, x (0..1 W), y (0..1 H,
//   ground point), scale: 0.6, pose, face: "left"|"right", at, then, dir, emotion, text, item, seq: [{at, pose, dir, face,
//   emotion}], to (walks there, arriving at `at`), walk_at, walk_dur: 1.6, tag: "İsmet Paşa", tag_at: cue, hide_until: cue}
// bust(group, {hat, seed}).update(t, {x, y (shoulder line), s, rise: 0..1 (stands up), cheer: 0..1 (arms up, hat waved),
//   back: true (seen from behind: no face), turn: -1..1, argue: 0..1 (one arm points)})
// Palette tokens only (INK); everything is a pure function of (seed, t).
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------ hats (rig-local units, head centre hc, radius ~72)
  // returns {fill: d, line: d, extra: d (tassel / fur hatching)} in the coordinates given
  function hatPaths(kind, cx, cy, r, seed, t, w = 6) {
    if (kind === 'kalpak') {
      const pts = [[cx - r * 0.92, cy - r * 0.55], [cx - r * 0.98, cy - r * 1.55], [cx - r * 0.7, cy - r * 1.82], [cx + r * 0.7, cy - r * 1.82],
        [cx + r * 0.98, cy - r * 1.55], [cx + r * 0.92, cy - r * 0.55], [cx, cy - r * 0.42]];
      let ex = '';
      for (let k = 0; k < 7; k++) { const x = cx - r * 0.7 + k * r * 0.23; ex += inkPath([[x, cy - r * 0.75], [x + r * 0.08, cy - r * 1.05]], { w: w * 0.6, seed: seed + 20 + k, t, amp: 0.8 }); }
      for (let k = 0; k < 5; k++) { const x = cx - r * 0.5 + k * r * 0.25; ex += inkPath([[x, cy - r * 1.3], [x + r * 0.08, cy - r * 1.6]], { w: w * 0.6, seed: seed + 40 + k, t, amp: 0.8 }); }
      return { fill: inkLoop(pts, { seed, t, amp: 1, smooth: true }), line: inkPath(pts, { w, seed: seed + 1, t, closed: true, amp: 1 }), extra: ex, col: INK.inkSoft };
    }
    if (kind === 'fes') {
      const pts = [[cx - r * 0.86, cy - r * 0.5], [cx - r * 0.68, cy - r * 1.6], [cx + r * 0.68, cy - r * 1.6], [cx + r * 0.86, cy - r * 0.5]];
      const sw = Math.sin(t * 2.4 + seed) * r * 0.08;
      const tas = inkPath([[cx, cy - r * 1.6], [cx + r * 0.45, cy - r * 1.55], [cx + r * 0.7 + sw, cy - r * 1.1]], { w: w * 0.9, seed: seed + 3, t, amp: 0.8 })
        + inkDot(cx + r * 0.72 + sw, cy - r * 1.02, w * 1.3, w * 2, seed + 4, t);
      return { fill: inkLoop(pts, { seed, t, amp: 0.8, smooth: false }), line: inkPath(pts, { w, seed: seed + 1, t, closed: true, amp: 0.8, smooth: false }), extra: tas, col: INK.red };
    }
    if (kind === 'sarik') {
      const pts = inkEllipsePts(cx, cy - r * 0.9, r * 1.05, r * 0.62, seed, 12);
      const ex = inkPath([[cx - r * 0.9, cy - r * 0.95], [cx, cy - r * 0.62], [cx + r * 0.9, cy - r * 1.05]], { w: w * 0.6, seed: seed + 5, t })
        + inkPath([[cx - r * 0.8, cy - r * 1.25], [cx, cy - r * 0.98], [cx + r * 0.8, cy - r * 1.3]], { w: w * 0.6, seed: seed + 6, t });
      return { fill: inkLoop(pts, { seed, t, amp: 0.8 }), line: inkPath(pts, { w, seed: seed + 1, t, closed: true, amp: 0.8 }), extra: ex, col: INK.paperLight };
    }
    return null;
  }

  // ------------------------------------------------------------ cast: KASIF rigs + period hats + name tags
  function cast(group, list, W, H, sd) {
    const FR = 'Fraunces, Georgia, serif';
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const hg = !isK && m.hat && m.hat !== 'none' ? el(rig.node, 'g') : null;
      const hat = hg ? { f: inkEl(hg, m.hat === 'fes' ? INK.red : m.hat === 'sarik' ? INK.paperLight : INK.inkSoft), l: inkEl(hg, INK.ink), x: inkEl(hg, INK.ink) } : null;
      let tag = null;
      if (m.tag) {
        const tg = el(group, 'g');
        const bx = inkEl(tg, INK.paperLight), br = inkEl(tg, INK.ink);
        const tx = el(tg, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': m.tag_size || 50, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
        tx.textContent = m.tag;
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = 26 * m.tag.length; }
        tag = { tg, bx, br, w };
      }
      return { m, rig, g, hat, tag, isK, i };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      items,
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, hat, tag, i }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; if (tag) tag.tg.style.display = 'none'; return; }
          g.style.display = '';
          const sc = m.scale ?? 0.6, face0 = faceOf(m.face, 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion0 || m.emotion, text: m.text, item: m.item }];
          const a = atOr(cues, m.at, null);
          if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.dir, face: m.face, emotion: m.emotion, text: m.text, item: m.item });
          (m.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({ text: m.text, item: m.item }, s, { at: sa })); });
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
          const gy = H * (m.y ?? 0.86);
          const o = { x, y: gy, face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item,
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
          const res = rig.update(t, pose, o) || {};
          if (hat && res.head) {
            const hp = hatPaths(m.hat, res.head[0], res.head[1], 72, sd + 300 + i * 11, t, 6);
            hat.f.setAttribute('d', hp.fill); hat.l.setAttribute('d', hp.line); hat.x.setAttribute('d', hp.extra);
          }
          if (tag) {
            const ta = atOr(cues, m.tag_at, 0.3);
            if (lt < ta) { tag.tg.style.display = 'none'; }
            else {
              tag.tg.style.display = '';
              const p = spring(lt, ta, 0.5), hx = res.head ? x + face * sc * res.head[0] : x, hy = res.head ? gy + sc * res.head[1] : gy - 400 * sc;
              const ty = hy - sc * 72 * (m.hat ? 2.2 : 1.6) - 46 + (m.tag_dy || 0);
              const b = boil(sd + 700 + i, t, 1);
              tag.tg.setAttribute('transform', `translate(${f1(hx + b[0] + (m.tag_dx || 0))} ${f1(ty + b[1])}) scale(${Math.max(0.01, p).toFixed(3)})`);
              const w = tag.w + 40, hh = (m.tag_size || 50) * 1.25;
              const box = [[-w / 2, -hh / 2], [w / 2, -hh / 2], [w / 2, hh / 2], [10, hh / 2], [0, hh / 2 + 16], [-10, hh / 2], [-w / 2, hh / 2]];
              tag.bx.setAttribute('d', inkLoop(box, { seed: sd + 710 + i, t, amp: 1, smooth: false }));
              tag.br.setAttribute('d', inkPath(box, { w: 4, seed: sd + 720 + i, t, closed: true, amp: 1, smooth: false }));
            }
          }
        });
      },
    };
  }

  // ------------------------------------------------------------ bust: a deputy seen from behind / front (head + shoulders + hat)
  function bust(g0, o = {}) {
    const sd = o.seed || 1, g = el(g0, 'g');
    const kind = o.hat || 'kalpak';
    const arms = inkEl(g, INK.ink), body = inkEl(g, o.coat || INK.inkSoft), bodyL = inkEl(g, INK.ink), head = inkEl(g, INK.paperLight), headL = inkEl(g, INK.ink),
      hatF = inkEl(g, kind === 'fes' ? INK.red : kind === 'sarik' ? INK.paperLight : INK.inkSoft), hatL = inkEl(g, INK.ink), face = inkEl(g, INK.ink);
    return {
      node: g,
      update(t, a) {
        const s = a.s ?? 1, x = a.x, rise = a.rise ?? 0, ch = a.cheer ?? 0, arg = a.argue ?? 0;
        const y = a.y - rise * 70 * s + Math.sin(t * 1.7 + sd) * 2 * s - ch * Math.abs(Math.sin(t * 7 + sd)) * 8 * s;
        const w = 6 * Math.max(0.55, s);
        const R = 40 * s, hy = y - 58 * s, turn = (a.turn ?? 0) * 12 * s;
        // shoulders / coat
        const sh = [[x - 78 * s, y + 120 * s], [x - 70 * s, y + 10 * s], [x - 34 * s, y - 14 * s], [x + 34 * s, y - 14 * s], [x + 70 * s, y + 10 * s], [x + 78 * s, y + 120 * s]];
        body.setAttribute('d', inkLoop(sh, { seed: sd + 1, t, amp: 1 }));
        bodyL.setAttribute('d', inkPath(sh, { w, seed: sd + 2, t, amp: 1 }));
        // arms: cheer = both up (one waving), argue = one pointing forward-up
        let ad = '';
        if (ch > 0.02) {
          const wv = Math.sin(t * 9 + sd) * 18 * s;
          ad += inkPath([[x - 52 * s, y + 6 * s], [x - 82 * s, y - 70 * s * ch], [x - 74 * s + wv, y - 150 * s * ch]], { w: w * 1.1, seed: sd + 3, t });
          ad += inkPath([[x + 52 * s, y + 6 * s], [x + 84 * s, y - 70 * s * ch], [x + 70 * s - wv, y - 150 * s * ch]], { w: w * 1.1, seed: sd + 4, t });
          ad += inkDot(x - 74 * s + wv, y - 156 * s * ch, 9 * s, 9 * s, sd + 5, t) + inkDot(x + 70 * s - wv, y - 156 * s * ch, 9 * s, 9 * s, sd + 6, t);
        } else if (arg > 0.02) {
          const d = a.argueDir ?? 1, j = Math.sin(t * 6 + sd) * 8 * s;
          ad += inkPath([[x + d * 52 * s, y + 6 * s], [x + d * 100 * s, y - 40 * s * arg], [x + d * 150 * s, y - 80 * s * arg + j]], { w: w * 1.1, seed: sd + 3, t });
          ad += inkDot(x + d * 152 * s, y - 82 * s * arg + j, 9 * s, 9 * s, sd + 5, t);
        }
        arms.setAttribute('d', ad);
        // head
        const hp = inkEllipsePts(x + turn, hy, R, R * 0.98, sd + 7, 12);
        head.setAttribute('d', inkLoop(hp, { seed: sd + 7, t, amp: 0.8 }));
        headL.setAttribute('d', inkPath(hp, { w, seed: sd + 8, t, closed: true, amp: 0.8 }));
        // face only when seen from the front
        face.setAttribute('d', a.back ? '' : inkDot(x + turn - 12 * s, hy + 4 * s, 4 * s, 4.6 * s, sd + 9, t) + inkDot(x + turn + 12 * s, hy + 4 * s, 4 * s, 4.6 * s, sd + 10, t)
          + inkPath([[x + turn - 9 * s, hy + 22 * s], [x + turn + 9 * s, hy + 22 * s]], { w: w * 0.6, seed: sd + 11, t, amp: 0.5 }));
        // hat (waved in the hand while cheering, for kalpak/fes wearers: lifted above the head)
        const lift = ch * (sd % 3 === 0 ? 1 : 0);
        const hcx = x + turn - lift * 70 * s + lift * Math.sin(t * 9 + sd) * 18 * s, hcy = hy - lift * 120 * s;
        const H = hatPaths(kind, hcx, hcy, R, sd + 20, t, w);
        if (H) { hatF.setAttribute('d', H.fill); hatL.setAttribute('d', H.line + H.extra); } else { hatF.setAttribute('d', ''); hatL.setAttribute('d', ''); }
      },
    };
  }

  // ------------------------------------------------------------ wall clock: hands move from `from` to `to` ("HH:MM")
  function clock(g0, o = {}) {
    const sd = o.seed || 3, g = el(g0, 'g');
    const face = inkEl(g, INK.paperLight), rim = inkEl(g, INK.ink), ticks = inkEl(g, INK.ink), hands = inkEl(g, INK.ink), pend = inkEl(g, INK.gold), pendL = inkEl(g, INK.ink);
    const hm = s => { const [h, m] = String(s || '12:00').split(':').map(Number); return (h % 12) * 60 + (m || 0); };
    return {
      update(t, lt, cues, a = {}) {
        const x = a.x, y = a.y, r = a.r ?? 70;
        const m0 = hm(o.from || o.time), m1 = hm(o.to || o.time || o.from);
        const u = o.at != null ? progIO(lt, atOr(cues, o.at, 0), o.dur ?? 1.6) : clamp01(lt / Math.max(1, a.dur || 6));
        const mins = lerp(m0, m1 < m0 ? m1 + 720 : m1, u);
        const cp = inkEllipsePts(x, y, r, r, sd, 16);
        face.setAttribute('d', inkLoop(cp, { seed: sd, t, amp: 0.8 }));
        let rd = inkPath(cp, { w: 7, seed: sd + 1, t, closed: true, amp: 0.8 });
        if (o.case !== false) {   // long-case pendulum box below
          const bx = [[x - r * 0.55, y + r * 0.92], [x + r * 0.55, y + r * 0.92], [x + r * 0.55, y + r * 2.6], [x - r * 0.55, y + r * 2.6]];
          rd += inkPath(bx, { w: 5, seed: sd + 2, t, closed: true, smooth: false });
          const sw = Math.sin(t * Math.PI) * 0.35, px = x + Math.sin(sw) * r * 1.2, py = y + r * 1.0 + Math.cos(sw) * r * 1.2;
          pend.setAttribute('d', inkDot(px, py, r * 0.2, r * 0.2, sd + 3, t));
          pendL.setAttribute('d', inkPath([[x, y + r * 1.0], [px, py]], { w: 4, seed: sd + 4, t }) + inkPath(inkEllipsePts(px, py, r * 0.2, r * 0.2, sd + 3, 8), { w: 4, seed: sd + 5, t, closed: true }));
        }
        rim.setAttribute('d', rd);
        let td = '';
        for (let k = 0; k < 12; k++) { const an = k / 12 * TAU, r0 = r * (k % 3 ? 0.8 : 0.7); td += inkPath([[x + Math.sin(an) * r0, y - Math.cos(an) * r0], [x + Math.sin(an) * r * 0.9, y - Math.cos(an) * r * 0.9]], { w: k % 3 ? 3 : 5, seed: sd + 10 + k, t, amp: 0.4 }); }
        ticks.setAttribute('d', td);
        const ha = (mins / 720) * TAU, ma = ((mins % 60) / 60) * TAU;
        hands.setAttribute('d', inkPath([[x, y], [x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5]], { w: 8, seed: sd + 30, t, amp: 0.5 })
          + inkPath([[x, y], [x + Math.sin(ma) * r * 0.78, y - Math.cos(ma) * r * 0.78]], { w: 5, seed: sd + 31, t, amp: 0.5 }) + inkDot(x, y, 7, 7, sd + 32, t));
      },
    };
  }

  // ------------------------------------------------------------ hanging oil lamp / chandelier with a soft glow
  function lamp(g0, o = {}) {
    const sd = o.seed || 5, g = el(g0, 'g');
    const glow = [0, 1, 2].map(k => inkEl(g, INK.gold, { 'fill-opacity': (o.glow ?? 0.12) * (1 - k * 0.25) }));
    const body = inkEl(g, INK.paperLight), flame = inkEl(g, INK.gold), line = inkEl(g, INK.ink);
    return {
      update(t, a) {
        const sw = Math.sin(t * 1.1 + sd) * (a.swing ?? 0.05), L = a.len ?? 180;
        const x = a.x + Math.sin(sw) * L, y = a.top + Math.cos(sw) * L, s = a.s ?? 1;
        const fl = 1 + Math.sin(t * 13 + sd) * 0.05 + Math.sin(t * 7.3) * 0.04;
        glow.forEach((e, k) => e.setAttribute('d', o.lit === false ? '' : inkLoop(inkEllipsePts(x, y + 30 * s, (110 + k * 70) * s * fl, (90 + k * 55) * s * fl, sd + k, 12), { seed: sd + k, t, amp: 2 })));
        const shade = [[x - 60 * s, y + 10 * s], [x - 26 * s, y - 34 * s], [x + 26 * s, y - 34 * s], [x + 60 * s, y + 10 * s]];
        const chim = inkEllipsePts(x, y + 42 * s, 22 * s, 30 * s, sd + 9, 10);
        body.setAttribute('d', inkLoop(shade, { seed: sd + 5, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(chim, { seed: sd + 6, t, amp: 0.6 }));
        flame.setAttribute('d', o.lit === false ? '' : inkLoop([[x, y + 22 * s - 14 * s * fl], [x + 8 * s, y + 48 * s], [x, y + 60 * s], [x - 8 * s, y + 48 * s]], { seed: sd + 7, t, amp: 0.6 }));
        line.setAttribute('d', inkPath([[a.x, a.top - 10], [x, y - 34 * s]], { w: 4, seed: sd + 8, t, amp: 0.6 })
          + inkPath(shade, { w: 5, seed: sd + 10, t, closed: true, smooth: false }) + inkPath(chim, { w: 4, seed: sd + 11, t, closed: true })
          + inkPath([[x - 30 * s, y + 76 * s], [x + 30 * s, y + 76 * s]], { w: 5, seed: sd + 12, t }));
      },
    };
  }

  // smoke puff and muzzle/firework star
  function puffPts(cx, cy, r, seed) {
    const q = rng(inkHash(seed, 4242)), pts = [];
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, k = 0.78 + q() * 0.42; pts.push([cx + Math.cos(a) * r * k * 1.25, cy + Math.sin(a) * r * k * (a > Math.PI ? 0.95 : 0.62)]); }
    return pts;
  }
  const puff = (cx, cy, r, seed, t) => inkLoop(puffPts(cx, cy, r, seed), { seed, t, amp: Math.min(3, r * 0.04) });
  function star(cx, cy, r, seed, t) {
    const pts = [], q = rng(inkHash(seed, inkFrame(t)));
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, k = i % 2 ? 0.38 : 0.85 + q() * 0.35; pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); }
    return inkLoop(pts, { seed, t, amp: 1, smooth: false });
  }
  const labels = (group, list, W, H, sd) => window.MCB ? window.MCB.labels(group, list, W, H, sd) : { update() {} };

  window.CMH = { atOr, f1, faceOf, dirOf, hatPaths, cast, bust, clock, lamp, puff, puffPts, star, labels };
})();
