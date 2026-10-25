// tbC__lib: shared helpers for the tbC_* shots (Tambora long video, chapters 4-5: the year without a summer and the
// answer in the ice). Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §5), palette tokens only (INK).
// window.TBC = {atOr, f1, FR, LO, ink(parent, seed) (immediate-mode boiling ink pool), cast(group, list, W, H, sd),
//   labels (= MCB.labels), cam(g, lt, dur, W, H, opts, hit, shake), snow, rain, clouds, bolt, hills, house, calendar,
//   candle, stalk, wheel}
// ink pool: const R = TBC.ink(group, seed); every frame R.begin(t) then draw calls in a FIXED order (each call takes
//   the next pooled element, so seeds stay stable): R.line(pts, {w, c, amp, taper, smooth, closed}),
//   R.fill(pts, {c, amp, smooth, op}), R.shape(pts, {f (fill), w, c, amp, smooth}), R.circle(cx, cy, r, {f, w, c, ry}),
//   R.dot(x, y, r, {c}), R.text(str, x, y, {size, font: "hand"|"serif", c, anchor, weight, rot, op, maxw (shrink to fit)}),
//   R.push(transform, op) / R.pop(); R.end() hides unused elements. pts = null draws nothing.
// cast entry: {who: "kasif"|name, x, y (0..1 H, ground), scale: 0.6, pose, face, dir, emotion, emotion0, at, then, to,
//   walk_at, walk_dur: 1.6, run, seq: [{at, pose, dir, face, emotion}], hide_until, alpha, text, item,
//   noseat: true (hide the rig's rock seat: the shot draws a chair), shiver: true | cue (small cold tremble, from the cue on), carry: "bundle" (sack on the back),
//   look: {hair: "bun"|"curls"|"short"|"sideburns"|"grey", hc: "ink"|"soft" (hair colour), skirt: "blue"|"green"|"red"|"soft",
//          cravat: true, glasses: true, hood: true (fur parka hood), coat: "blue"|"red"|"soft"|"green" (coat tails)}}
//   Hatless period figures (BRAND §2); Kaşif (who "kasif") keeps his red fez.
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif', LO = 'Lora, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft,
    light: INK.paperLight, dark: INK.paperDark, paper: INK.paper, stain: INK.stain };
  const col = (v, fb) => v == null ? fb : (COL[v] || v);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  // ------------------------------------------------------------ immediate-mode ink pool
  function ink(parent, seed0) {
    const root = el(parent, 'g');
    const pool = [];
    let k = 0, t = 0, stack = [root];
    const take = (tag, mk) => {
      let it = pool[k];
      if (!it || it.tag !== tag) {
        const node = mk(stack[stack.length - 1]);
        it = { tag, node, parent: stack[stack.length - 1] };
        if (pool[k]) pool[k].node.remove();
        pool[k] = it;
      } else if (it.parent !== stack[stack.length - 1]) { stack[stack.length - 1].appendChild(it.node); it.parent = stack[stack.length - 1]; }
      it.used = true;
      const s = seed0 * 977 + k * 13;
      k++;
      return [it, s];
    };
    const P = {
      begin(tt) { t = tt; k = 0; stack = [root]; pool.forEach(p => { p.used = false; }); return P; },
      end() { pool.forEach(p => { if (!p.used) p.node.style.display = 'none'; else p.node.style.display = ''; }); },
      line(pts, o = {}) {
        const [it, s] = take('p', g => inkEl(g, INK.ink));
        it.node.setAttribute('fill', col(o.c, INK.ink));
        it.node.setAttribute('fill-opacity', o.op ?? 1);
        it.node.setAttribute('d', pts && pts.length > 1 ? inkPath(pts, { w: o.w ?? 6, seed: s, t, amp: o.amp ?? 1.6, taper: o.taper ?? 0.3, smooth: o.smooth, closed: o.closed }) : '');
        return it.node;
      },
      fill(pts, o = {}) {
        const [it, s] = take('p', g => inkEl(g, INK.ink));
        it.node.setAttribute('fill', col(o.c, INK.paperLight));
        it.node.setAttribute('fill-opacity', o.op ?? 1);
        it.node.setAttribute('d', pts && pts.length > 2 ? inkLoop(pts, { seed: s, t, amp: o.amp ?? 1.2, smooth: o.smooth }) : '');
        return it.node;
      },
      shape(pts, o = {}) {
        P.fill(pts, { c: o.f ?? 'light', amp: o.amp, smooth: o.smooth, op: o.fop });
        return P.line(pts, { w: o.w ?? 5.5, c: o.c, amp: o.amp, smooth: o.smooth, closed: true, op: o.op });
      },
      circle(cx, cy, r, o = {}) {
        const pts = inkEllipsePts(cx, cy, r, o.ry ?? r, (o.seed ?? 7) + k, Math.max(8, Math.min(18, Math.round(r / 5))), o.rot || 0);
        if (o.f) P.fill(pts, { c: o.f, op: o.fop });
        if (o.w !== 0) P.line(pts, { w: o.w ?? 5, c: o.c, closed: true, amp: o.amp ?? 1.2, op: o.op });
      },
      dot(x, y, r, o = {}) {
        const [it, s] = take('p', g => inkEl(g, INK.ink));
        it.node.setAttribute('fill', col(o.c, INK.ink));
        it.node.setAttribute('fill-opacity', o.op ?? 1);
        it.node.setAttribute('d', inkDot(x, y, r, o.ry ?? r, s, t, o.amp ?? 0.7));
      },
      text(str, x, y, o = {}) {
        const [it] = take('t', g => el(g, 'text', { 'dominant-baseline': 'central' }));
        const n = it.node, serif = o.font === 'serif';
        const key = `${str}|${o.size}|${o.font}|${o.weight}|${o.c}|${o.anchor}|${o.maxw}`;
        if (it.key !== key) {
          it.key = key;
          n.textContent = str;
          n.setAttribute('font-family', serif ? FR : o.font === 'lora' ? LO : INK_FONT);
          n.setAttribute('font-size', Math.max(44, o.size || 60));
          n.setAttribute('font-weight', o.weight ?? (serif ? 900 : 400));
          n.setAttribute('fill', col(o.c, INK.ink));
          n.setAttribute('text-anchor', o.anchor || 'middle');
          if (o.maxw) {   // shrink to fit (never below 44 px)
            let fs = Math.max(44, o.size || 60), w = 0;
            try { w = n.getComputedTextLength(); } catch (e) { w = 0; }
            if (w > o.maxw) { fs = Math.max(44, Math.floor(fs * o.maxw / w)); n.setAttribute('font-size', fs); }
          }
        }
        const b = boil(Math.round(x * 3 + y), t, 1);
        n.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${o.rot ?? 0}) scale(${(o.scale ?? 1).toFixed(3)})`);
        n.setAttribute('fill-opacity', o.op ?? 1);
        return n;
      },
      push(tf, op) {
        const [it] = take('g', g => el(g, 'g'));
        it.node.setAttribute('transform', tf || '');
        if (op != null) it.node.setAttribute('opacity', op); else it.node.removeAttribute('opacity');
        stack.push(it.node);
        return it.node;
      },
      pop() { if (stack.length > 1) stack.pop(); },
      get t() { return t; },
    };
    return P;
  }

  // ------------------------------------------------------------ cast with period looks
  const HAIR = {
    // head frame (+x = the side the figure faces, head radius 72); cap drawn over the head
    cap: [[-66, 26], [-78, -14], [-72, -50], [-46, -78], [-6, -88], [34, -80], [60, -60], [70, -38], [44, -48], [10, -54], [-24, -48], [-46, -22], [-50, 18]],
    short: [[-70, 0], [-76, -30], [-66, -60], [-36, -82], [6, -86], [42, -74], [64, -50], [66, -36], [40, -46], [6, -52], [-30, -44], [-50, -14]],
  };
  function lookPool(rig, sd) {
    const behind = el(null, 'g'); rig.node.insertBefore(behind, rig.node.firstChild);
    const mid = el(null, 'g'); rig.node.insertBefore(mid, rig.node.children[11] || null);   // in front of legs, behind the torso
    const front = el(rig.node, 'g');
    return { B: ink(behind, sd + 1), M: ink(mid, sd + 2), F: ink(front, sd + 3) };
  }
  function drawLook(L, lk, t, r, pose) {
    const [hx, hy] = r.head, [px, py] = r.hip;
    const H = pts => pts.map(q => [hx + q[0], hy + q[1]]);
    L.B.begin(t); L.M.begin(t); L.F.begin(t);
    const hc = lk.hc === 'soft' ? INK.inkSoft : lk.hc === 'grey' ? INK.paperDark : INK.ink;
    if (lk.hood) {
      L.B.circle(hx - 4, hy - 4, 98, { f: INK.paperDark, w: 6 });
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; L.B.line([[hx + Math.cos(a) * 82, hy + Math.sin(a) * 82], [hx + Math.cos(a) * 104, hy + Math.sin(a) * 104]], { w: 4, c: INK.inkSoft }); }
    }
    if (lk.hair === 'bun') {
      L.B.circle(hx - 74, hy - 34, 32, { f: hc, w: 5 });
      L.F.shape(H(HAIR.cap), { f: hc, w: 5 });
      L.F.line(H([[-8, -86], [18, -60], [40, -50]]), { w: 3, c: INK.paperDark, amp: 0.8 });
    } else if (lk.hair === 'curls') {
      const bumps = [];
      for (let i = 0; i <= 16; i++) { const a = Math.PI * (0.95 + i / 16 * 1.08), rr = 84 + (i % 2) * 12; bumps.push([Math.cos(a) * rr, Math.sin(a) * rr - 4]); }
      L.B.shape(H(bumps.concat([[-40, 30], [-80, 20]])), { f: hc, w: 5 });
      L.F.shape(H(HAIR.cap), { f: hc, w: 5 });
      L.F.line(H([[-40, -20], [-38, 14], [-30, 30]]), { w: 9, c: hc });
    } else if (lk.hair === 'short' || lk.hair === 'sideburns' || lk.hair === 'grey') {
      L.F.shape(H(HAIR.short), { f: lk.hair === 'grey' ? INK.paperDark : hc, w: 5 });
      if (lk.hair === 'sideburns') L.F.line(H([[-38, -30], [-36, 10], [-26, 34]]), { w: 12, c: hc });
    }
    if (lk.glasses) {
      L.F.circle(hx + 2, hy - 6, 17, { w: 4 }); L.F.circle(hx + 46, hy - 6, 17, { w: 4 });
      L.F.line([[hx + 19, hy - 8], [hx + 29, hy - 8]], { w: 4 });
    }
    if (lk.cravat) L.F.shape([[hx - 18, hy + 74], [hx + 22, hy + 74], [hx + 8, hy + 112], [hx - 6, hy + 112]], { f: INK.paperLight, w: 4 });
    const sit = pose === 'sit';
    if (lk.coat) {
      const c = col(lk.coat, INK.blue);
      const pts = sit ? [[px - 30, py - 70], [px + 26, py - 70], [px + 20, py + 6], [px - 64, py + 40], [px - 40, py - 10]]
                      : [[px - 26, py - 76], [px + 24, py - 76], [px + 22, py + 10], [px - 10, py + 70], [px - 44, py + 64], [px - 34, py + 6]];
      L.M.shape(pts, { f: c, w: 5 });
    }
    if (lk.skirt) {
      const c = col(lk.skirt, INK.green);
      const pts = sit ? [[px - 38, py - 52], [px + 26, py - 52], [px + 118, py - 8], [px + 132, py + 92], [px + 70, py + 98], [px - 40, py + 20]]
                      : [[px - 32, py - 56], [px + 30, py - 56], [px + 62, py + 150], [px - 60, py + 150]];
      L.M.shape(pts, { f: c, w: 5 });
    }
    if (lk.parka) {
      L.M.shape([[px - 46, py - 120], [px + 44, py - 120], [px + 56, py + 30], [px - 56, py + 30]], { f: INK.blue, w: 5 });
    }
    L.B.end(); L.M.end(); L.F.end();
  }

  function cast(group, list, W, H, sd) {
    const items = (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const g = el(group, 'g');
      const rig = KASIF.create(g, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + (isK ? 0 : 7) });
      const kids = Array.from(rig.node.children), seat = kids.slice(3, 6);
      const lk = m.look || null, L = lk ? lookPool(rig, sd + i * 31) : null;
      const bundle = m.carry ? ink(rig.node, sd + i * 31 + 9) : null;
      return { m, rig, g, lk, L, bundle, seat };
    });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120, gaitR = KASIF.gait ? KASIF.gait('run') : 175;
    const state = [];
    return {
      state,
      update(lt, t, cues) {
        items.forEach(({ m, rig, g, lk, L, bundle, seat }, idx) => {
          const hu = atOr(cues, m.hide_until, null);
          if (hu != null && lt < hu) { g.style.display = 'none'; state[idx] = null; return; }
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
            if (lt < arrive && lt >= start) { pose = m.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / ((m.run ? gaitR : gait) * sc); pv = null; }
            else if (lt < start) { pose = m.pose && m.pose !== 'walk' ? m.pose : 'idle'; }
            else if (lt >= arrive && si === 0 && m.pose === 'walk') { pose = m.then || 'idle'; since = lt - arrive; }
          } else if (pose === 'walk' || pose === 'run') ph = lt / (pose === 'run' ? 0.62 : 0.9);
          const shv = m.shiver != null && (m.shiver === true || lt >= atOr(cues, m.shiver, 1e9)) ? Math.sin(lt * 55) * 3.2 + Math.sin(lt * 31) * 1.6 : 0;
          const o = { x: x + shv, y: H * (m.y ?? 0.86), face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item,
            emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0, alpha: m.alpha };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.32; }
          const r = rig.update(t, pose, o);
          if (lk && L) drawLook(L, lk, t, r, pose);
          if (m.noseat) seat.forEach(e => { e.style.opacity = 0; });
          if (bundle) {
            bundle.begin(t);
            const [hx, hy] = r.head;
            bundle.line([[hx - 10, hy + 100], [hx - 92, hy + 70]], { w: 6, c: INK.inkSoft });
            bundle.shape(inkEllipsePts(hx - 96, hy + 120, 46, 54, 3, 10), { f: INK.paperDark, w: 5 });
            bundle.line([[hx - 120, hy + 96], [hx - 74, hy + 90]], { w: 4 });
            bundle.end();
          }
          const sc2 = sc;
          state[idx] = { x: o.x, y: o.y, face, s: sc2, head: [o.x + face * sc2 * r.head[0], o.y + sc2 * r.head[1]],
            hands: r.hands.map(h => [o.x + face * sc2 * h[0], o.y + sc2 * h[1]]), hip: [o.x + face * sc2 * r.hip[0], o.y + sc2 * r.hip[1]], pose };
        });
      },
    };
  }

  // ------------------------------------------------------------ camera
  function cam(g, lt, dur, W, H, o = {}, hit = 0, shake = 0) {
    if (window.MCB && window.MCB.camPush) return window.MCB.camPush(g, lt, dur, W, H, o, hit, shake);
    const zoom = o.zoom ?? 1.05, [fx, fy] = (o.focus || [0.5, 0.55]).map((v, i) => v * (i ? H : W));
    const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
    g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  const labels = (group, list, W, H, sd) => window.MCB ? window.MCB.labels(group, list, W, H, sd) : { update() {} };

  // ------------------------------------------------------------ weather
  function snow(R, W, H, n, lt, o = {}) {
    const r = rng(o.seed ?? 4242), y0 = o.y0 ?? -20, y1 = o.y1 ?? H * 0.9, sp = o.speed ?? 70, wind = o.wind ?? 18;
    const a = o.alpha ?? 1;
    for (let i = 0; i < n; i++) {
      const x0 = r() * (W + 200) - 100, ph = r(), sz = (o.size ?? 9) * (0.6 + r() * 0.8), v = sp * (0.7 + r() * 0.6);
      const span = y1 - y0, y = y0 + ((ph * span + lt * v) % span);
      const x = x0 + Math.sin(lt * 1.3 + i) * 14 + wind * lt * 0.6;
      const xx = ((x % (W + 200)) + W + 200) % (W + 200) - 100;
      R.dot(xx, y, sz, { c: INK.paperLight, op: a });
      R.circle(xx, y, sz, { w: 2.5, c: INK.inkSoft, op: a * 0.9 });
    }
  }
  function rain(R, W, H, n, lt, o = {}) {
    const r = rng(o.seed ?? 777), y0 = o.y0 ?? -40, y1 = o.y1 ?? H * 0.86, sp = o.speed ?? 900, sl = o.slant ?? 0.22;
    for (let i = 0; i < n; i++) {
      const x0 = r() * (W + 300) - 150, ph = r(), len = 34 + r() * 30, span = y1 - y0;
      const y = y0 + ((ph * span + lt * sp * (0.8 + r() * 0.4)) % span);
      const x = x0 - (y - y0) * sl;
      R.line([[x, y], [x - len * sl, y + len]], { w: 3, c: INK.inkSoft, amp: 0.6, op: o.op ?? 0.85 });
    }
  }
  // a band of storm clouds across the top: puffy outlines, paper-dark fill, ink-soft hatching; drifts slowly
  function clouds(R, W, y, n, lt, o = {}) {
    const r = rng(o.seed ?? 99), drift = (o.drift ?? 10) * lt, x0 = o.x0 ?? -80, x1 = o.x1 ?? W + 80;
    for (let i = 0; i < n; i++) {
      const cx = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 60 + drift * (0.6 + r() * 0.6), cy = y + (r() - 0.5) * 50;
      const w = (o.w ?? 300) * (0.8 + r() * 0.5), h = w * 0.36;
      const pts = [];
      for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; const bump = 1 + 0.16 * Math.sin(k * 2.3 + i); pts.push([cx + Math.cos(a) * w / 2 * bump, cy + Math.sin(a) * h * bump]); }
      pts.push([cx + w / 2, cy + h * 0.35], [cx - w / 2, cy + h * 0.35]);
      R.shape(pts, { f: o.dark ? INK.inkSoft : INK.paperDark, w: 5, fop: o.dark ? 0.55 : 1 });
      for (let k = 0; k < 4; k++) R.line([[cx - w * 0.3 + k * w * 0.16, cy + h * 0.25], [cx - w * 0.36 + k * w * 0.16, cy - h * 0.15]], { w: 3, c: INK.inkSoft, op: 0.7 });
    }
  }
  // zig-zag lightning bolt (gold with an ink outline) for 0.35 s after each cue time
  function bolt(R, x, y0, y1, lt, ats, sd = 1) {
    const at = (ats || []).filter(v => v != null && lt >= v && lt < v + 0.4).pop();
    if (at == null) { R.shape(null); return 0; }
    const r = rng(sd * 31 + Math.round(at * 10)), pts = [[x, y0]];
    const n = 6;
    for (let i = 1; i <= n; i++) pts.push([x + (i % 2 ? 1 : -1) * (24 + r() * 26) + (r() - 0.5) * 20, lerp(y0, y1, i / n)]);
    const L = pts.map(p => [p[0] - 12, p[1]]), Rr = pts.map(p => [p[0] + 12, p[1] + 10]).reverse();
    R.shape(L.concat(Rr), { f: INK.gold, w: 4, smooth: false });
    return 1 - (lt - at) / 0.4;
  }
  // rolling hill line across the frame (fixed shape per seed)
  function hillPts(W, y, amp, sd, n = 9) {
    const r = rng(sd), pts = [];
    for (let i = 0; i <= n; i++) pts.push([lerp(-60, W + 60, i / n), y - r() * amp]);
    return pts;
  }
  // gabled house: origin bottom centre; w, h body size; o: {roof: "red"|"soft"|..., door, windows: 2, lit, chimney, snow}
  function house(R, x, y, w, h, o = {}) {
    const rh = h * 0.6;
    R.shape([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], { f: o.wall ?? INK.paperLight, w: 5, smooth: false });
    if (o.chimney !== false) R.shape([[x + w * 0.22, y - h - rh * 0.3], [x + w * 0.22, y - h - rh * 0.85], [x + w * 0.34, y - h - rh * 0.85], [x + w * 0.34, y - h - rh * 0.1]], { f: INK.paperDark, w: 4, smooth: false });
    R.shape([[x - w / 2 - 24, y - h + 4], [x, y - h - rh], [x + w / 2 + 24, y - h + 4]], { f: col(o.roof, INK.red), w: 5, smooth: false });
    if (o.snow) R.shape([[x - w / 2 - 30, y - h + 2], [x, y - h - rh - 8], [x + w / 2 + 30, y - h + 2], [x + w / 2 + 6, y - h - 14], [x, y - h - rh + 18], [x - w / 2 - 6, y - h - 14]], { f: INK.paperLight, w: 4 });
    if (o.door !== false) R.shape([[x - w * 0.1, y], [x - w * 0.1, y - h * 0.55], [x + w * 0.1, y - h * 0.55], [x + w * 0.1, y]], { f: INK.paperDark, w: 4, smooth: false });
    const nw = o.windows ?? 2;
    for (let i = 0; i < nw; i++) {
      const wx = x + (i === 0 ? -1 : 1) * w * 0.3, wy = y - h * 0.62, s = Math.min(w, h) * 0.13;
      R.shape([[wx - s, wy - s], [wx + s, wy - s], [wx + s, wy + s], [wx - s, wy + s]], { f: o.lit ? INK.gold : INK.paperDark, w: 4, smooth: false });
      R.line([[wx, wy - s], [wx, wy + s]], { w: 3 }); R.line([[wx - s, wy], [wx + s, wy]], { w: 3 });
    }
  }
  // calendar page (paper card with a red header, Fraunces word); flip 0..1 = the page turning in (squash)
  function calendar(R, x, y, w, word, flip = 1, o = {}) {
    const h = w * 1.05, sy = Math.max(0.02, flip);
    R.push(`translate(${f1(x)} ${f1(y)}) scale(1 ${sy.toFixed(3)}) rotate(${o.rot ?? -3})`);
    R.shape([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { f: INK.paperLight, w: 5, smooth: false });
    R.shape([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, -h / 2 + h * 0.24], [-w / 2, -h / 2 + h * 0.24]], { f: INK.red, w: 5, smooth: false });
    for (const rx of [-w * 0.25, w * 0.25]) R.circle(rx, -h / 2 + h * 0.12, 9, { f: INK.paperLight, w: 3 });
    R.text(word, 0, h * 0.12, { font: 'serif', size: Math.min(o.size ?? Math.round(w * 0.26), Math.round(w * 1.25 / Math.max(3, word.length))) });
    if (o.sub) R.text(o.sub, 0, h * 0.36, { size: 46, c: 'soft' });
    R.pop();
  }
  // candle on a holder: origin = holder base; s scale; flame flickers
  function candle(R, x, y, s, t, o = {}) {
    const fl = 1 + 0.12 * Math.sin(t * 13 + x) + 0.08 * Math.sin(t * 21 + y);
    R.shape([[x - 44 * s, y], [x + 44 * s, y], [x + 30 * s, y - 14 * s], [x - 30 * s, y - 14 * s]], { f: INK.gold, w: 4, smooth: false });
    R.shape([[x - 14 * s, y - 14 * s], [x + 14 * s, y - 14 * s], [x + 14 * s, y - (o.h ?? 110) * s], [x - 14 * s, y - (o.h ?? 110) * s]], { f: INK.paperLight, w: 4, smooth: false });
    const fy = y - (o.h ?? 110) * s, sw = Math.sin(t * 7 + x) * 4 * s;
    R.shape([[x, fy - 4], [x - 14 * s, fy - 22 * s], [x + sw, fy - 62 * s * fl], [x + 14 * s, fy - 22 * s]], { f: INK.gold, w: 3.5 });
    R.fill([[x, fy - 10 * s], [x - 6 * s, fy - 22 * s], [x + sw * 0.6, fy - 40 * s * fl], [x + 6 * s, fy - 22 * s]], { c: INK.red });
  }
  // corn stalk: origin = foot; h height; droop 0..1 (frost kills it: bends over, leaves hang, colour fades)
  function stalk(R, x, y, h, t, droop = 0, sd = 1, o = {}) {
    const sway = Math.sin(t * 1.2 + sd) * 6 * (1 - droop);
    const bend = droop * 0.9;
    const P = u => { const a = bend * u * u * 1.6; return [x + sway * u + Math.sin(a) * h * u * 0.6 * (o.dir ?? 1), y - h * u * (1 - 0.35 * bend * u)]; };
    const stem = [0, 0.25, 0.5, 0.75, 1].map(P);
    const c = droop > 0.5 ? INK.inkSoft : INK.green;
    R.line(stem, { w: 7, c });
    for (const [u, side] of [[0.3, 1], [0.5, -1], [0.7, 1]]) {
      const b = P(u), len = h * 0.32, hang = 0.4 + droop * 0.7;
      R.line([b, [b[0] + side * len * 0.55, b[1] - len * (0.35 - hang * 0.35)], [b[0] + side * len, b[1] + len * (hang * 0.6 - 0.1)]], { w: 6, c, taper: 0.8 });
    }
    const e = P(0.62);
    R.shape(inkEllipsePts(e[0] + 12, e[1] - 10, 14, 34, sd, 10, 0.3 + droop), { f: droop > 0.5 ? INK.paperDark : INK.gold, w: 4 });
    const top = P(1);
    R.line([top, [top[0] + 10, top[1] - 26]], { w: 4, c });
  }
  // spoked wooden wheel: centre, radius, rotation (rad)
  function wheel(R, cx, cy, r, rot, o = {}) {
    R.circle(cx, cy, r, { f: o.f, w: 7 });
    R.circle(cx, cy, r * 0.82, { w: 3, c: INK.inkSoft });
    const n = o.spokes ?? 8;
    for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; R.line([[cx, cy], [cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82]], { w: 4 }); }
    R.dot(cx, cy, r * 0.12);
  }

  window.TBC = { atOr, f1, FR, LO, COL, col, dirOf, faceOf, ink, cast, cam, labels, snow, rain, clouds, bolt, hillPts, house, calendar, candle, stalk, wheel };
})();
