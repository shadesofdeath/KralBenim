// dr__lib: shared helpers for the dr_* shots (Derinkuyu underground city long video). Not a shot type itself.
// window.DRL = {atOr, f1, FR, rr, faceOf, dirOf, band(), rock(), lantern(), cast(), screenLabels()}
// cast entry (positions in the shot's own space, see each shot): {who: "kasif"|name, x, y, scale, pose: "idle",
//   face: "right"|"left", dir, emotion, accessory, beard, at (cue|s -> `then`), then, to (walk there, arriving at `at`
//   or at walk_at + walk_dur), walk_at, walk_dur: 1.6, seq: [{at, pose, dir, face, emotion}], lantern: true (hangs
//   from the front hand, gold flicker), tilt: deg (stoop forward, e.g. 22 in a low tunnel), tool: "hammer"|"pick"
//   (+ swing: [from_s, to_s] or true: arm swings the tool up and down), shrink: {to: 0.6, at, dur} (walks away into depth)}
// Everything is a pure function of (seed, lt); no Math.random. Palette tokens only (INK).
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rr = (x, y, w, h, r) => { const p = []; const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    c.forEach(([cx, cy, a0]) => { for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return p; };

  // outlined band (tunnel / shaft): ink stroke under a narrower paper stroke
  function band(group, sd, o = {}) {
    const out = inkEl(group, o.edge || INK.ink), inn = inkEl(group, o.fill || INK.paperLight);
    return {
      update(pts, t, w = 46, show = true) {
        if (!show || !pts || pts.length < 2) { out.setAttribute('d', ''); inn.setAttribute('d', ''); return; }
        out.setAttribute('d', inkPath(pts, { w: w + 12, seed: sd, t, amp: 1.4, vary: 0.08, taper: 0 }));
        inn.setAttribute('d', inkPath(pts, { w, seed: sd + 1, t, amp: 0.8, vary: 0.05, taper: 0 }));
      },
    };
  }

  // rock strata texture: wavy inkSoft lines + pebbles inside a rectangle (x0..x1, y0..y1)
  function rock(group, x0, x1, y0, y1, sd, o = {}) {
    const r = rng(sd + 4242), lines = [], peb = [];
    const gap = o.gap || 150;
    for (let y = y0 + gap * 0.6; y < y1 - 20; y += gap * (0.8 + r() * 0.4)) {
      let x = x0 + r() * 120;
      while (x < x1) {
        const len = 160 + r() * 360;
        const pts = []; for (let k = 0; k <= 4; k++) pts.push([x + len * k / 4, y + Math.sin(k * 1.7 + r() * 3) * 7]);
        lines.push({ pts, e: inkEl(group, INK.inkSoft, { 'fill-opacity': 0.55 }) });
        x += len + 80 + r() * 200;
      }
    }
    const np = o.pebbles ?? Math.round((x1 - x0) * (y1 - y0) / 60000);
    for (let i = 0; i < np; i++) peb.push({ x: x0 + r() * (x1 - x0), y: y0 + 20 + r() * (y1 - y0 - 40), rx: 6 + r() * 10, ry: 4 + r() * 6, e: inkEl(group, INK.inkSoft, { 'fill-opacity': 0.45 }) });
    return {
      update(t) {
        lines.forEach((L, i) => L.e.setAttribute('d', inkPath(L.pts, { w: 3, seed: sd + 10 + i, t, amp: 1.2 })));
        peb.forEach((p, i) => p.e.setAttribute('d', inkDot(p.x, p.y, p.rx, p.ry, sd + 500 + i, t)));
      },
    };
  }

  // hanging oil lantern (clay lamp in a frame), origin = hand, hangs down; glow flickers
  function lantern(group, sd) {
    const glow = el(group, 'circle', { fill: INK.gold, 'fill-opacity': 0.22 });
    const glow2 = el(group, 'circle', { fill: INK.gold, 'fill-opacity': 0.3 });
    const body = inkEl(group, INK.paperLight), rim = inkEl(group, INK.ink), flame = inkEl(group, INK.gold), fl2 = inkEl(group, INK.red);
    return {
      update(x, y, t, s = 1) {
        const fk = 0.85 + 0.15 * Math.sin(t * 13 + sd) * Math.sin(t * 7.3);
        const sw = Math.sin(t * 2.2 + sd) * 4 * s;
        const cx = x + sw, cy = y + 46 * s;
        glow.setAttribute('cx', f1(cx)); glow.setAttribute('cy', f1(cy)); glow.setAttribute('r', f1(120 * s * fk));
        glow2.setAttribute('cx', f1(cx)); glow2.setAttribute('cy', f1(cy)); glow2.setAttribute('r', f1(55 * s * fk));
        const b = [[cx - 20 * s, cy - 26 * s], [cx + 20 * s, cy - 26 * s], [cx + 24 * s, cy + 24 * s], [cx - 24 * s, cy + 24 * s]];
        body.setAttribute('d', inkLoop(b, { seed: sd, t, amp: 0.8, smooth: false }));
        rim.setAttribute('d', inkPath(b, { w: 5 * s, seed: sd + 1, t, closed: true, amp: 0.8, smooth: false }) + ' ' +
          inkPath([[x, y], [cx, cy - 26 * s]], { w: 4 * s, seed: sd + 2, t, amp: 0.6 }) + ' ' +
          inkPath([[cx - 28 * s, cy + 26 * s], [cx + 28 * s, cy + 26 * s]], { w: 7 * s, seed: sd + 3, t, amp: 0.6 }));
        const fh = 26 * s * fk;
        flame.setAttribute('d', inkLoop([[cx - 9 * s, cy + 12 * s], [cx, cy + 12 * s - fh], [cx + 9 * s, cy + 12 * s], [cx, cy + 18 * s]], { seed: sd + 4, t, amp: 1 }));
        fl2.setAttribute('d', inkDot(cx, cy + 10 * s, 4 * s, 6 * s, sd + 5, t));
      },
    };
  }

  // cast of KASIF rigs; pos(m) -> [x, y] in px; returns hands for tools / lanterns
  function cast(group, list, sd, pos) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g'), rg = el(g, 'g'), extra = el(g, 'g');
      const rig = KASIF.create(rg, { scale: 1, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const lamp = m.lantern ? lantern(extra, sd + i * 31 + 900) : null;
      const tool = m.tool ? { h: inkEl(extra, INK.hat), k: inkEl(extra, INK.ink), hd: inkEl(extra, INK.inkSoft) } : null;
      return { m, rig, g, lamp, tool };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, lamp, tool }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; return; }
          g.style.display = '';
          const face0 = faceOf(m.face, 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion0 || m.emotion }];
          const a = atOr(cues, m.at, null);
          if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.dir, face: m.face, emotion: m.emotion });
          (m.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({}, s, { at: sa })); });
          segs.sort((p, q) => p.at - q.at);
          let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
          let s = segs[si], pv = si > 0 ? segs[si - 1] : null, since = lt - Math.max(0, s.at);
          let sc = m.scale ?? 0.5;
          if (m.shrink) { const sa = atOr(cues, m.shrink.at, 0); sc = lerp(sc, m.shrink.to ?? sc * 0.6, progIO(lt, sa, m.shrink.dur ?? 2)); }
          let [x, y] = pos(m.x, m.y, m), face = faceOf(s.face, face0), pose = s.pose || 'idle', ph = 0;
          if (m.to != null) {
            const wd = m.walk_dur ?? 1.6;
            const arrive = m.walk_at != null ? atOr(cues, m.walk_at, 0) + wd : (a != null ? a : wd);
            const start = Math.max(0, arrive - wd), u = progIO(lt, start, Math.max(0.1, arrive - start));
            const [xa] = pos(m.x, m.y, m), [xb] = pos(m.to, m.y, m), dist = xb - xa;
            x = lerp(xa, xb, u);
            if (lt < arrive && lt >= start) { pose = m.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
            else if (lt < start) { pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle'; }
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          }
          let dir = dirOf(s.dir);
          if (lamp && pose === 'look') { pose = 'point'; dir = 4; }
          const sw = m.swing === true ? [0, 99] : m.swing;
          if (tool && sw && lt >= atOr(cues, sw[0], 0) && lt < atOr(cues, sw[1], 99) && pose !== 'walk') {
            pose = 'point'; since = 2; pv = null;
            const ph2 = (lt - atOr(cues, sw[0], 0)) * 1.6 % 1;   // up slowly, down fast
            dir = ph2 < 0.7 ? lerp(-40, 95, progIO(ph2 / 0.7, 0, 1)) : lerp(95, -40, (ph2 - 0.7) / 0.3);
          }
          const o = { x: 0, y: 0, face, since, ph, dir, emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir) }; o.mix = since / 0.32; }
          const tilt = (m.tilt || 0) * face;
          g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${tilt}) scale(${sc.toFixed(4)})`);
          const r = rig.update(t, pose, o) || {};
          const hands = r.hands || [[60, -300], [60, -300]];
          const hand = hands[1][1] > hands[0][1] ? hands[1] : hands[0];
          const hx = hand[0] * face, hy = hand[1];
          if (lamp) lamp.update(hx, hy, t, 1.6);
          if (tool) {
            const ang = (dir) * Math.PI / 180, ux = Math.cos(ang) * face, uy = -Math.sin(ang);
            const L = 200, ex = hx + ux * L, ey = hy + uy * L;
            tool.h.setAttribute('d', inkPath([[hx - ux * 20, hy - uy * 20], [ex, ey]], { w: 14, seed: sd + 71, t, amp: 0.8, taper: 0 }));
            tool.k.setAttribute('d', inkPath([[hx - ux * 20, hy - uy * 20], [ex, ey]], { w: 4, seed: sd + 72, t, amp: 0.8 }));
            const px = -uy, py = ux;
            const head = m.tool === 'pick'
              ? [[ex - px * 70 + ux * 10, ey - py * 70 + uy * 10], [ex + ux * 14, ey + uy * 14], [ex + px * 70 + ux * 10, ey + py * 70 + uy * 10]]
              : [[ex - px * 34 - ux * 26, ey - py * 34 - uy * 26], [ex + px * 34 - ux * 26, ey + py * 34 - uy * 26], [ex + px * 34 + ux * 26, ey + py * 34 + uy * 26], [ex - px * 34 + ux * 26, ey - py * 34 + uy * 26]];
            tool.hd.setAttribute('d', m.tool === 'pick' ? inkPath(head, { w: 16, seed: sd + 73, t, amp: 0.8 }) : inkLoop(head, { seed: sd + 73, t, amp: 0.8, smooth: false }));
          }
        });
      },
    };
  }

  window.DRL = { atOr, f1, FR, rr, faceOf, dirOf, band, rock, lantern, cast };
})();
