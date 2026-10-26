// sm__lib: shared helpers for the sm_* shots (04-sehzade-mustafa). Not a shot type itself.
// window.SMB = {cast(group, list, W, H, sd), kavuk(group) -> {draw(head, s, face, t, seed)}, signs(group, list, W, H, sd)}
// cast entry: same as MCB.cast ({who, x, y, scale, pose, face, dir, emotion, accessory, beard, at, then, to, walk_at,
//   walk_dur, text, item, seq, hide_until}) plus sultan: true -> no accessory, a tall white sultan's kavuk with a wrapped
//   base, a red band and a gold sorguç (jewel + plume) is drawn on the head, so the sultan never looks like his sons.
// sign entry: {text, x (0..1 W), at, h: 0.3 (board height above ground, 0..1 H), ground: 0.86}
// Pure function of (seed, lt); palette tokens only (INK).
'use strict';

(() => {
  const M = () => window.MCB;
  function kavuk(group) {
    const wrapF = inkEl(group, INK.paperLight), capF = inkEl(group, INK.paperLight), ink = inkEl(group), band = inkEl(group, INK.red),
      plumeF = inkEl(group, INK.inkSoft), jewel = inkEl(group, INK.gold);
    return {
      draw(hc, s, f, t, sd, show = true) {
        if (!show) { [wrapF, capF, ink, band, plumeF, jewel].forEach(n => n.setAttribute('d', '')); return; }
        const [hx, hy] = hc, r = 74 * s, w = 5 * s / 0.6;
        // a big bulbous white kavuk (wider than the head, rounded top), wrapped folds, a gold sorguç and a dark plume
        const bulb = [[hx - r * 0.92, hy - r * 0.5], [hx - r * 1.22, hy - r * 1.25], [hx - r * 1.0, hy - r * 2.0], [hx - r * 0.42, hy - r * 2.36],
          [hx + r * 0.42, hy - r * 2.36], [hx + r * 1.0, hy - r * 2.0], [hx + r * 1.22, hy - r * 1.25], [hx + r * 0.92, hy - r * 0.5]];
        capF.setAttribute('d', inkLoop(bulb, { seed: sd + 1, t, amp: 0.8 }));
        wrapF.setAttribute('d', '');
        let d = inkPath(bulb, { w, seed: sd + 4, t, closed: true });
        for (let k = 0; k < 4; k++) {
          const y0 = hy - r * (0.75 + k * 0.38);
          d += ' ' + inkPath([[hx - r * (1.05 - k * 0.05), y0 + r * 0.12], [hx, y0 - r * 0.08], [hx + r * (1.05 - k * 0.05), y0 - r * 0.22]], { w: w * 0.55, seed: sd + 5 + k, t });
        }
        ink.setAttribute('d', d);
        band.setAttribute('d', '');
        const jx = hx + f * r * 0.35, jy = hy - r * 1.3, sw = Math.sin(t * 1.8) * r * 0.1;
        jewel.setAttribute('d', inkDot(jx, jy, r * 0.2, r * 0.24, sd + 9, t));
        const pl = [[jx - r * 0.06, jy - r * 0.15], [jx - f * r * 0.05 + sw * 0.4, jy - r * 0.9], [jx - f * r * 0.4 + sw, jy - r * 1.75], [jx - f * r * 0.15 + sw, jy - r * 1.85], [jx + f * r * 0.2 + sw * 0.4, jy - r * 0.9], [jx + r * 0.08, jy - r * 0.15]];
        plumeF.setAttribute('d', inkLoop(pl, { seed: sd + 10, t, amp: 0.8 }));
      },
    };
  }

  function cast(group, list, W, H, sd) {
    const { atOr, faceOf, dirOf } = M();
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.6, hat: isK, accessory: isK || m.sultan ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const kv = m.sultan ? kavuk(g) : null;
      return { m, rig, g, kv, i };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, kv, i }) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; return; }
          g.style.display = '';
          const sc = m.scale ?? 0.6, face0 = faceOf(m.face, 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion0 || m.emotion, text: m.text0 ?? m.text, item: m.item }];
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
          const res = rig.update(t, pose, o);
          if (kv && res && res.head) kv.draw([x + face * sc * res.head[0], H * (m.y ?? 0.86) + sc * res.head[1]], sc, face, t, sd + 500 + i * 20);
        });
      },
    };
  }

  // simple hand-drawn signposts (post + board + Patrick Hand text), spring in on `at`
  function signs(group, list, W, H, sd) {
    const { atOr, f1 } = M();
    const items = (list || []).map((S, i) => {
      const g = el(group, 'g'), post = inkEl(g), boardF = inkEl(g, INK.paperLight), board = inkEl(g);
      const tx = el(g, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': S.size || 56, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
      tx.textContent = S.text;
      let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = String(S.text).length * (S.size || 56) * 0.5;
      return { S, g, post, boardF, board, tx, w, i };
    });
    return {
      update(lt, t, cues) {
        items.forEach(({ S, g, post, boardF, board, tx, w, i }) => {
          const a = atOr(cues, S.at, 0.2 + i * 0.3);
          if (lt < a) { g.style.display = 'none'; return; }
          g.style.display = '';
          const p = spring(lt, a, 0.55), gy = (S.ground ?? 0.86) * H, x = S.x * W, by = gy - (S.h ?? 0.3) * H;
          g.setAttribute('transform', `translate(${f1(x)} ${f1(gy)}) scale(1 ${Math.max(0.01, p).toFixed(3)}) translate(${f1(-x)} ${f1(-gy)})`);
          post.setAttribute('d', inkPath([[x, gy], [x, by]], { w: 8, seed: sd + i * 9, t }));
          const bw = w + 50, bh = (S.size || 56) * 1.5, pts = [[x - bw / 2, by - bh], [x + bw / 2, by - bh], [x + bw / 2, by], [x - bw / 2, by]];
          boardF.setAttribute('d', inkLoop(pts, { seed: sd + i * 9 + 1, t, amp: 0.8, smooth: false }));
          board.setAttribute('d', inkPath(pts, { w: 5, seed: sd + i * 9 + 2, t, closed: true, smooth: false }));
          tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(by - bh / 2));
        });
      },
    };
  }

  window.SMB = { cast, kavuk, signs };
})();
