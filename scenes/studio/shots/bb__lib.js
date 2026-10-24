// bb__lib: shared helpers for the bb_* shots (Brooklyn Bridge Short). Not a shot type itself.
// window.BBL = {atOr, f1, FR, COL, rr, faceOf, dirOf, cast(group, list, W, H, sd), labels(group, list, W, H, sd),
//   camPush(g, lt, dur, W, H, opts, hit, shake), water(lt, t, W, y0, y1, sd, o) -> {fill, lines}}
// cast entry: {who: "kasif"|name, x, y (0..1 H, ground), scale: 0.6, pose: "idle", face: "right"|"left", dir, emotion,
//   beard, accessory, woman: true (hair bun + long dress, period woman), dress: "blue"|"red"|"green",
//   at (cue|s: switch to `then`), then, to (walk there, arriving at `at`, or at walk_at + walk_dur), walk_at, walk_dur: 1.6,
//   text, item, seq: [{at, pose, dir, face, emotion, text, item}], hide_until: cue}
//   cast.update(lt, t, cues) -> [{head: [x, y], face, s}] (world px of each member's head centre)
// label entry: {text, x, y (0..1), at, size: 64, color, font: "hand"|"serif", rot, arrow: [x, y], stamp: true, check: true (blue tick before the text), anchor}
// Everything is a pure function of (seed, lt); no Math.random. Palette tokens only (INK).
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rr = (x, y, w, h, r) => { const p = []; const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    c.forEach(([cx, cy, a0]) => { for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return p; };

  function cast(group, list, W, H, sd) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const back = el(g, 'g'), rg = el(g, 'g'), front = el(g, 'g');
      const bun = m.woman ? { f: inkEl(back, INK.inkSoft), r: inkEl(back) } : null;
      const dress = m.woman ? { f: inkEl(front, COL[m.dress] || INK.blue), r: inkEl(front), b: inkEl(front, INK.paperLight) } : null;
      const rig = KASIF.create(rg, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const pick = m.swing ? inkEl(front, INK.ink) : null;
      return { m, rig, g, bun, dress, pick, i };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        return items.map(({ m, rig, g, bun, dress, pick, i }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; return null; }
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
            if (lt < arrive && lt >= start) { pose = m.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / (gait * sc); pv = null; }
            else if (lt < start) { pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle'; }
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          }
          const y = H * (m.y ?? 0.86);
          let dir = dirOf(s.dir);
          if (m.swing && (s.swing ?? true) && pose === 'swing') { pose = 'point'; dir = -40 + 75 * Math.abs(Math.sin(lt * 3.2 + i)); pv = null; }
          const o = { x, y, face, since, ph, dir, text: s.text, item: s.item,
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
          const res = rig.update(t, pose, o) || {};
          const S = sc, W2 = (q) => [x + face * S * q[0], y + S * q[1]];
          const hc = res.head ? W2(res.head) : [x, y - 396 * S];
          if (bun) {   // hair bun behind the head + a few strands
            const bx = hc[0] - face * 50 * S, by = hc[1] - 44 * S, sd2 = sd + i * 31;
            const pts = inkEllipsePts(bx, by, 40 * S, 36 * S, sd2 + 1, 10);
            bun.f.setAttribute('d', inkLoop(pts, { seed: sd2 + 1, t, amp: 0.9 }));
            bun.r.setAttribute('d', inkPath(pts, { seed: sd2 + 2, t, w: 5 * S / 0.6, closed: true, amp: 0.9 }) + ' ' +
              inkPath([[bx - 18 * S * face, by - 10 * S], [bx + 8 * S * face, by + 4 * S], [bx + 20 * S * face, by + 22 * S]], { seed: sd2 + 3, t, w: 3 * S / 0.6, amp: 0.6 }) + ' ' +
              inkPath([[hc[0] - 64 * S * face, hc[1] - 10 * S], [hc[0] - 30 * S * face, hc[1] - 62 * S], [hc[0] + 20 * S * face, hc[1] - 70 * S]], { seed: sd2 + 4, t, w: 5 * S / 0.6, amp: 0.6 }));
          }
          if (dress) {   // long dress: waist (just under the hip) to near the ankles, flares while walking
            const hp = res.hip ? W2(res.hip) : [x, y - 184 * S];
            const wv = pose === 'walk' || pose === 'run' ? Math.sin(ph * Math.PI * 4) * 10 * S : Math.sin(t * 1.3) * 3 * S;
            const top = hp[1] - 70 * S, bot = y - 26 * S;
            const pts = [[hp[0] - 34 * S, top], [hp[0] + 34 * S, top], [hp[0] + 44 * S, hp[1] - 10 * S], [hp[0] + 96 * S + wv, bot], [hp[0] - 96 * S + wv, bot], [hp[0] - 44 * S, hp[1] - 10 * S]];
            const sd2 = sd + i * 31 + 10;
            dress.f.setAttribute('d', inkLoop(pts, { seed: sd2, t, amp: 1, smooth: false }));
            dress.r.setAttribute('d', inkPath(pts, { seed: sd2 + 1, t, w: 6 * S / 0.6, closed: true, amp: 1, smooth: false }) + ' ' +
              inkPath([[hp[0] - 40 * S, hp[1] - 4 * S], [hp[0] + 40 * S, hp[1] - 4 * S]], { seed: sd2 + 2, t, w: 5 * S / 0.6, amp: 0.8 }));
            dress.b.setAttribute('d', inkPath([[hp[0] - 80 * S + wv, bot - 26 * S], [hp[0] + 80 * S + wv, bot - 26 * S]], { seed: sd2 + 3, t, w: 6 * S / 0.6, amp: 0.8 }));
          }
          if (pick) {   // pickaxe in the forward hand (swing: true + pose "swing")
            if (m.swing && res.hands && (s.pose === 'swing')) {
              const hd = W2(res.hands[1]), a = (dir + 90) * Math.PI / 180;   // handle continues the arm, head across it
              const ux = face * Math.cos(dir * Math.PI / 180), uy = -Math.sin(dir * Math.PI / 180);
              const end = [hd[0] + ux * 120 * S, hd[1] + uy * 120 * S], nx = -uy, ny = ux;
              pick.setAttribute('d', inkPath([[hd[0] - ux * 30 * S, hd[1] - uy * 30 * S], end], { seed: sd + i * 31 + 40, t, w: 7 * S / 0.6, amp: 0.6 }) + ' ' +
                inkPath([[end[0] - nx * 46 * S - ux * 12 * S, end[1] - ny * 46 * S - uy * 12 * S], [end[0], end[1]], [end[0] + nx * 46 * S - ux * 12 * S, end[1] + ny * 46 * S - uy * 12 * S]], { seed: sd + i * 31 + 41, t, w: 9 * S / 0.6, amp: 0.6 }));
              void a;
            } else pick.setAttribute('d', '');
          }
          return { head: hc, face, s: S, x, y };
        });
      },
    };
  }

  function labels(group, list, W, H, sd) {
    const items = (list || []).map((L, i) => {
      const g = el(group, 'g');
      const box = L.stamp ? { f: inkEl(g, INK.paperLight), r: inkEl(g, COL[L.color] || INK.red) } : null;
      const font = L.font === 'serif' || L.stamp ? FR : INK_FONT;
      const size = Math.max(44, L.size || (L.stamp ? 96 : 64));
      const tx = el(g, 'text', { x: 0, y: 0, 'font-family': font, 'font-size': size, 'font-weight': font === FR ? 900 : 400,
        'text-anchor': L.anchor || 'middle', 'dominant-baseline': 'central', fill: COL[L.color] || INK.ink,
        style: L.stamp ? '' : `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      tx.textContent = L.stamp ? String(L.text).toLocaleUpperCase(LOCALE) : L.text;
      let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = 0; }
      if (!w) w = size * String(L.text).length * 0.55;
      const arrow = L.arrow ? inkEl(g, COL[L.color] || INK.ink) : null, head = L.arrow ? inkEl(g, COL[L.color] || INK.ink) : null;
      const chk = L.check ? inkEl(g, INK.blue) : null;
      return { L, g, box, tx, w, size, arrow, head, chk, i };
    });
    return {
      update(lt, t, cues) {
        items.forEach(({ L, g, box, w, size, arrow, head, chk, i }) => {
          const a = atOr(cues, L.at, 0.2 + i * 0.3);
          if (lt < a) { g.style.display = 'none'; return; }
          g.style.display = '';
          const p = spring(lt, a, 0.55), pk = punch(lt, a, 0.6);
          const x = L.x * W, y = L.y * H, rot = L.rot ?? (L.stamp ? -6 : -2);
          const s = (L.stamp ? lerp(1.8, 1, clamp01(p)) : p) * (1 + 0.08 * pk);
          const b = boil(sd + i * 17, t, 1.2);
          g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${rot}) scale(${Math.max(0.01, s).toFixed(3)})`);
          g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          const x0 = L.anchor === 'start' ? 0 : L.anchor === 'end' ? -w : -w / 2;
          if (box) {
            const pts = rr(x0 - 34, -size * 0.66, w + 68, size * 1.32, 14);
            box.f.setAttribute('d', inkLoop(pts, { seed: sd + i * 7 + 1, t, amp: 1.2 }));
            box.r.setAttribute('d', inkPath(pts, { w: 9, seed: sd + i * 7 + 2, t, amp: 1.5, closed: true }) + ' ' +
              inkPath(rr(x0 - 20, -size * 0.52, w + 40, size * 1.04, 10), { w: 4, seed: sd + i * 7 + 3, t, amp: 1.2, closed: true }));
          }
          if (chk) {   // blue tick drawn in front of the text
            const cp = prog(lt, a + 0.15, 0.35), cx0 = x0 - size * 1.05, pts = [[cx0, 0], [cx0 + size * 0.3, size * 0.32], [cx0 + size * 0.85, -size * 0.45]];
            const n = cp < 0.4 ? [pts[0], [lerp(pts[0][0], pts[1][0], cp / 0.4), lerp(pts[0][1], pts[1][1], cp / 0.4)]] : [pts[0], pts[1], [lerp(pts[1][0], pts[2][0], (cp - 0.4) / 0.6), lerp(pts[1][1], pts[2][1], (cp - 0.4) / 0.6)]];
            chk.setAttribute('d', cp > 0.02 ? inkPath(n, { w: size * 0.16, seed: sd + i * 7 + 6, t, amp: 1, smooth: false }) : '');
          }
          if (arrow) {
            const ax = L.arrow[0] * W - x, ay = L.arrow[1] * H - y;
            const rr0 = -rot * Math.PI / 180, c = Math.cos(rr0), sn = Math.sin(rr0);
            const tx2 = (ax * c - ay * sn) / s, ty2 = (ax * sn + ay * c) / s;
            const sx = tx2 > 0 ? x0 + w + 20 : x0 - 20, sy = ty2 > 0 ? size * 0.4 : -size * 0.2;
            const ap = prog(lt, a + 0.2, 0.5);
            const ex = lerp(sx, tx2, ap), ey = lerp(sy, ty2, ap);
            const mx = (sx + ex) / 2 + (ey - sy) * 0.18, my = (sy + ey) / 2 - (ex - sx) * 0.18;
            arrow.setAttribute('d', ap > 0.02 ? inkPath([[sx, sy], [mx, my], [ex, ey]], { w: 6, seed: sd + i * 7 + 4, t, amp: 1 }) : '');
            const ang = Math.atan2(ey - my, ex - mx), hl = 30;
            head.setAttribute('d', ap > 0.6 ? inkPath([[ex - Math.cos(ang - 0.5) * hl, ey - Math.sin(ang - 0.5) * hl], [ex, ey], [ex - Math.cos(ang + 0.5) * hl, ey - Math.sin(ang + 0.5) * hl]], { w: 6, seed: sd + i * 7 + 5, t, amp: 0.8, smooth: false }) : '');
          }
        });
      },
    };
  }

  function camPush(g, lt, dur, W, H, o = {}, hit = 0, shake = 0) {
    const z0 = o.z0 ?? 1, zoom = o.zoom ?? 1.05, [fx, fy] = (o.focus || [0.5, 0.55]).map((v, i) => v * (i ? H : W));
    const z = lerp(z0, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
    const pan = (o.pan || 0) * progIO(lt, 0, Math.max(1, dur));
    const sx = shake ? Math.sin(lt * 63) * 14 * shake : 0, sy = shake ? Math.cos(lt * 51) * 10 * shake : 0;
    g.setAttribute('transform', `translate(${f1(fx + sx + pan + Math.sin(lt * 0.4) * 4)} ${f1(fy + sy + Math.cos(lt * 0.33) * 3)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  // river water between y0 (surface) and y1: returns {fill, lines} path strings (drifting ripples)
  function water(lt, t, W, y0, y1, sd, o = {}) {
    const amp = o.amp ?? 6, pts = [];
    for (let x = -60; x <= W + 60; x += 60) pts.push([x, y0 + Math.sin(x * 0.013 + lt * 1.5) * amp]);
    const fill = inkLoop(pts.concat([[W + 60, y1], [-60, y1]]), { seed: sd, t, amp: 0.8, smooth: false });
    const L = [inkPath(pts, { seed: sd + 1, t, w: o.w ?? 5, amp: 1 })];
    const rows = o.rows ?? 4, step = o.step ?? 210;
    for (let r = 0; r < rows; r++) {
      const y = lerp(y0 + 28, y1 - 24, rows > 1 ? r / (rows - 1) : 0.5), off = ((lt * (16 + r * 5) + r * 97) % step);
      for (let x = -step + off; x < W + step; x += step) L.push(inkPath([[x, y], [x + 34, y - 7], [x + 68, y]], { seed: sd + 10 + r * 30 + Math.round((x - off) / step), t, w: 3.4, amp: 0.8 }));
    }
    return { fill, lines: L.join(' ') };
  }

  window.BBL = { atOr, f1, FR, COL, rr, faceOf, dirOf, cast, labels, camPush, water };
})();
