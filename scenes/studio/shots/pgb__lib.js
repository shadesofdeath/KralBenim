// pgb__lib: shared helpers for the pgb_* shots (Phineas Gage long video, chapter 3). Not a shot type itself.
// window.PGB = {atOr, f1, cast(group, list, W, H, sd), horse(group, sd, near), coach(group, sd)}
// cast entry = window.MCB cast entry ({who, x, y (0..1 H, ground), scale: 0.6, pose, face, dir, emotion, accessory,
//   beard, at, then, to, walk_at, walk_dur, text, item, seq, hide_until}) plus:
//   gage: true | {bandage: true, patch: true, cap: false}  (Phineas Gage: white head bandage + eye patch after the
//     accident; {bandage: false, patch: false, cap: true} = the 1848 cloth cap of before, same shape as pga__lib)
// PGB.gageMarks(rig, seed, cfg) -> draw(t, rig.update(...).head): adds those marks to any KASIF rig (cfg as `gage`).
//   lie: -90 (deg: the whole figure is rotated around its feet, lying on a bed; face 1 looks up)
//   alpha: 0.45 (faded figure), shake: cue (small angry tremble after the cue)
// Everything is a pure function of (seed, lt); palette tokens only (INK). Hatless period figures (BRAND.md §2).
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  // Gage marks drawn in the rig's own (head) frame: appended to the rig node so they share its transform.
  function gageMarks(rig, sd, cfg) {
    const o = Object.assign({ bandage: true, patch: true, cap: false }, cfg === true ? {} : cfg);
    const g = el(rig.node, 'g');
    // 1848 cloth cap: same shape as pga__lib (PGA.gage head "cap") so Gage looks the same before the accident
    const CAP = { crown: [[-76, -26], [-80, -64], [-56, -98], [-6, -110], [46, -100], [76, -66], [78, -32]], visor: [[44, -40], [122, -38], [128, -24], [58, -24]] };
    const cap = o.cap ? { f: inkEl(g, INK.paperDark), v: inkEl(g, INK.paperDark), r: inkEl(g) } : null;
    const band = o.bandage ? { f: inkEl(g, INK.paperLight), r: inkEl(g) } : null;
    const patch = o.patch ? { f: inkEl(g, INK.ink), s: inkEl(g) } : null;
    return (t, hc) => {
      const [hx, hy] = hc;
      if (cap) {
        const P = pts => pts.map(q => [hx + q[0], hy + q[1]]), cr = P(CAP.crown), vi = P(CAP.visor);
        cap.f.setAttribute('d', inkLoop(cr, { seed: sd + 11, t, amp: 1.2 }));
        cap.v.setAttribute('d', inkLoop(vi, { seed: sd + 12, t, amp: 1, smooth: false }));
        cap.r.setAttribute('d', inkPath(cr, { w: 5.5, seed: sd + 13, t, closed: true, amp: 1.2 }) + ' ' + inkPath(vi, { w: 5, seed: sd + 14, t, closed: true, amp: 1, smooth: false }));
      }
      if (band) {
        const bp = [[-74, -14], [-66, -52], [-36, -76], [6, -82], [44, -72], [70, -46], [76, -18], [46, -34], [10, -40], [-30, -36]].map(q => [hx + q[0], hy + q[1]]);
        band.f.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, amp: 0.9 }));
        band.r.setAttribute('d', inkPath(bp, { w: 4.5, seed: sd + 2, t, amp: 1, closed: true }) + ' ' +
          inkPath([[hx - 52, hy - 50], [hx + 2, hy - 60], [hx + 56, hy - 52]], { w: 3, seed: sd + 3, t, amp: 0.8 }) + ' ' +
          inkPath([[hx - 64, hy - 30], [hx - 10, hy - 44], [hx + 60, hy - 36]], { w: 3, seed: sd + 4, t, amp: 0.8 }));
      }
      if (patch) {
        const ex = hx + 12 - 22, ey = hy + 6;
        patch.f.setAttribute('d', inkLoop(inkEllipsePts(ex, ey, 15, 13, sd + 5, 10), { seed: sd + 5, t, amp: 0.6 }));
        patch.s.setAttribute('d', inkPath([[ex - 12, ey - 6], [hx - 50, hy - 18], [hx - 72, hy - 22]], { w: 4, seed: sd + 6, t, amp: 0.6 }) + ' ' +
          inkPath([[ex + 12, ey - 8], [hx + 30, hy - 22], [hx + 66, hy - 30]], { w: 4, seed: sd + 7, t, amp: 0.6 }));
      }
    };
  }

  // ------------------------------------------------------------ cast (window.MCB logic + Gage marks, lying, alpha)
  function cast(group, list, W, H, sd) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const marks = m.gage ? gageMarks(rig, sd + 500 + i * 31, m.gage) : null;
      return { m, rig, g, marks };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      items,
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, marks }) => {
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
          const y = H * (m.y ?? 0.86);
          const sh = atOr(cues, m.shake, null), shk = sh != null && lt >= sh ? Math.sin(lt * 47) * 5 : 0;
          const o = { x: m.lie ? 0 : x + shk, y: m.lie ? 0 : y, face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item,
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0, alpha: m.alpha ?? 1 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
          if (m.lie) g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${m.lie})`);
          const r = rig.update(t, pose, o);
          if (marks && r && r.head) marks(t, r.head);
        });
      },
    };
  }

  // ------------------------------------------------------------ horse (side view, facing right; origin = hooves' ground
  // point under the body centre; ~ 300 units long, 250 tall). update(t, ph) with ph = gallop phase in cycles.
  function horse(group, sd, near = true) {
    const g = el(group, 'g');
    const fill = near ? INK.paperLight : INK.paperDark;
    const legs = [0, 1, 2, 3].map(() => inkEl(g));
    const tail = inkEl(g), body = { f: inkEl(g, fill), r: inkEl(g) }, mane = inkEl(g), eye = inkEl(g);
    const HIPS = [[-62, -118, 0.0], [-50, -118, 0.5], [52, -118, 0.15], [64, -118, 0.65]];
    return {
      g,
      update(t, ph) {
        const bob = Math.sin(ph * Math.PI * 4) * 5;
        HIPS.forEach(([hx, hy, off], i) => {
          const a = Math.sin((ph + off) * Math.PI * 2), b = Math.cos((ph + off) * Math.PI * 2);
          const knee = [hx + a * 26, hy + bob + 52], hoof = [hx + a * 40 + (i < 2 ? -6 : 6), Math.min(0, -10 + b * -14 - 2) ];
          legs[i].setAttribute('d', inkPath([[hx, hy + bob], knee, hoof], { w: 7, seed: sd + 10 + i, t, amp: 1 }));
        });
        const B = (x, y) => [x, y + bob];
        const bp = [B(-92, -150), B(-60, -170), B(10, -172), B(62, -170), B(96, -190), B(124, -222), B(146, -236), B(176, -222), B(190, -194),
          B(178, -186), B(152, -198), B(128, -176), B(104, -136), B(60, -112), B(-10, -110), B(-70, -114), B(-96, -128)];
        body.f.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, amp: 1 }));
        body.r.setAttribute('d', inkPath(bp, { w: 5.5, seed: sd + 2, t, amp: 1.2, closed: true }));
        const tw = Math.sin(t * 9 + sd) * 10;
        tail.setAttribute('d', inkPath([B(-92, -148), B(-122, -138 + tw), B(-140, -104 + tw * 1.4)], { w: 9, seed: sd + 3, t, amp: 1.2, taper: 0.7 }));
        mane.setAttribute('d', inkPath([B(92, -192), B(112, -214), B(132, -232)], { w: 9, seed: sd + 4, t, amp: 1 }) + ' ' +
          inkPath([B(140, -236), B(144, -250), B(152, -240)], { w: 5, seed: sd + 5, t, amp: 0.8 }));
        eye.setAttribute('d', inkDot(160, -220 + bob, 4.5, 4.5, sd + 6, t));
      },
    };
  }

  window.PGB = { atOr, f1, dirOf, faceOf, cast, horse, gageMarks };
})();
