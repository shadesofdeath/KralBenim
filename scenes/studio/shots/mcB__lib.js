// mcB__lib: shared helpers for the mcB_* shots (Mary Celeste long video, chapters 4-7). Not a shot type itself.
// window.MCB = {atOr, f1, FR, LO, rr, faceOf, dirOf, cast(group, list, W, H, sd), labels(group, list, W, H, sd),
//   sea(group, W, H, y, sd, opts), camPush(g, lt, dur, W, H, opts, hit)}
// cast entry: {who: "kasif"|name, x, y (0..1 H, ground), scale: 0.6, pose: "idle", face: "right"|"left", dir, emotion,
//   accessory, beard, at (cue|s: switch to `then`), then, to (walk there, arriving at `at`, or at walk_at + walk_dur),
//   walk_at, walk_dur: 1.6, text, item, seq: [{at, pose, dir, face, emotion}], hide_until: cue}
// label entry: {text, x, y (0..1), at, size: 64, color: "ink"|"red"|"blue"|"green"|"gold", font: "hand"|"serif",
//   rot: -3, arrow: [x, y], stamp: true (boxed rubber stamp), strike: cue (red line through it), anchor: "middle"}
// Everything is a pure function of (seed, lt); no Math.random. Palette tokens only (INK).
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif', LO = 'Lora, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rr = (x, y, w, h, r) => { const p = []; const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    c.forEach(([cx, cy, a0]) => { for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return p; };

  // ------------------------------------------------------------ cast (Kaşif + period figures)
  function cast(group, list, W, H, sd) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      return { m, rig, g };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        items.forEach(({ m, rig, g }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; return; }
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
          const o = { x, y: H * (m.y ?? 0.86), face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item,
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
          rig.update(t, pose, o);
        });
      },
    };
  }

  // ------------------------------------------------------------ hand-written labels / stamps
  function labels(group, list, W, H, sd) {
    const items = (list || []).map((L, i) => {
      const g = el(group, 'g');
      const box = L.stamp ? { f: inkEl(g, INK.paperLight), r: inkEl(g, COL[L.color] || INK.red) } : null;
      const font = L.font === 'serif' || L.stamp ? FR : INK_FONT;
      const size = Math.max(44, L.size || (L.stamp ? 96 : 64));
      const tx = el(g, 'text', { x: 0, y: 0, 'font-family': font, 'font-size': size, 'font-weight': font === FR ? 900 : 400,
        'text-anchor': L.anchor || 'middle', 'dominant-baseline': 'central', fill: COL[L.color] || INK.ink });
      tx.textContent = L.stamp ? String(L.text).toLocaleUpperCase(LOCALE) : L.text;
      let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * String(L.text).length * 0.5; }
      const arrow = L.arrow ? inkEl(g, COL[L.color] || INK.ink) : null, head = L.arrow ? inkEl(g, COL[L.color] || INK.ink) : null;
      const strike = L.strike ? inkEl(g, INK.red) : null;
      return { L, g, box, tx, w, size, arrow, head, strike, i };
    });
    return {
      update(lt, t, cues) {
        items.forEach(({ L, g, box, tx, w, size, arrow, head, strike, i }) => {
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
          if (strike) {
            const sa = atOr(cues, L.strike, null), sp = sa != null ? prog(lt, sa, 0.35) : 0;
            strike.setAttribute('d', sp > 0.01 ? inkPath([[x0 - 16, 6], [x0 - 16 + (w + 32) * sp, -4]], { w: 12, seed: sd + i * 7 + 6, t, amp: 1.2 }) : '');
          }
        });
      },
    };
  }

  // ------------------------------------------------------------ sea band (wavy top line, hatching that drifts)
  function sea(group, W, H, y0, sd, o = {}) {
    const fill = inkEl(group, INK.paperDark, { 'fill-opacity': o.dark ? 0.75 : 0.45 }), line = inkEl(group, INK.inkSoft);
    const hatch = Array.from({ length: o.hatch ?? 22 }, () => inkEl(group, INK.inkSoft, { 'fill-opacity': 0.75 }));
    const r = rng(sd + 991), H0 = hatch.map(() => [r(), r(), r()]);
    const bottom = o.bottom ?? H + 20, amp = o.amp ?? 9;
    return {
      top: (x, t) => y0 + Math.sin(x * 0.012 + t * 1.6) * amp + Math.sin(x * 0.031 - t * 2.3) * amp * 0.4,
      update(t) {
        const pts = [];
        for (let x = -40; x <= W + 40; x += 40) pts.push([x, this.top(x, t)]);
        fill.setAttribute('d', inkLoop(pts.concat([[W + 40, bottom], [-40, bottom]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
        line.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, amp: 1.2 }));
        hatch.forEach((h, i) => {
          const yy = y0 + 30 + h[1] * (Math.min(bottom, H) - y0 - 40);
          const len = 50 + h[2] * 90, xx = ((h[0] * (W + 300) + t * (18 + h[2] * 20)) % (W + 300)) - 150;
          const k = (yy - y0) / Math.max(1, H - y0);
          hatch[i].setAttribute('d', inkPath([[xx, yy], [xx + len * 0.5, yy - 6 - 4 * Math.sin(t * 2 + i)], [xx + len, yy]], { w: 3 + k * 2, seed: sd + 10 + i, t, amp: 1 }));
        });
      },
    };
  }

  // ------------------------------------------------------------ slow camera push (+ punch, + optional shake)
  function camPush(g, lt, dur, W, H, o = {}, hit = 0, shake = 0) {
    const zoom = o.zoom ?? 1.05, [fx, fy] = (o.focus || [0.5, 0.55]).map((v, i) => v * (i ? H : W));
    const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
    const sx = shake ? Math.sin(lt * 63) * 14 * shake : 0, sy = shake ? Math.cos(lt * 51) * 10 * shake : 0;
    g.setAttribute('transform', `translate(${f1(fx + sx + Math.sin(lt * 0.4) * 4)} ${f1(fy + sy + Math.cos(lt * 0.33) * 3)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  window.MCB = { atOr, f1, FR, LO, COL, rr, faceOf, dirOf, cast, labels, sea, camPush };
})();
