// cs_hand: a big hand-drawn hand in the Latin blessing gesture (thumb, index and middle finger raised, ring and
// little finger folded) coming out of a red robe sleeve, parchment ink style (brand/kit/BRAND.md §3, §5; boils at
// 8 Hz, pure function of (seed, lt)). Numbers 1-2-3 pop beside the raised fingers; on a cue the three fingers are
// marked with red dashed cut lines and turn into faint dashed "missing" outlines that drift up (not gory).
// Written for the Cadaver Synod (897: three fingers of Formosus' blessing hand were cut off) but parametric.
// P: {x: 0.4, y: 0.47 (palm centre, 0..1), scale: 1, count: cue (numbers start), cut: cue (fingers removed),
//     label: {text: "3 FINGERS", x: 0.5, y: 0.17, size: 110, at: cue, color: "red"},
//     kasif: {x: 0.82, scale: 0.85, pose: "think", face: -1, emotion, seq: [{at, pose, emotion, dir, face}]} | false,
//     cam: {zoom: 1.06, focus: [0.45, 0.5]}}
// cues: hit (punch), count, cut, label.at, kasif seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;

  // capsule outline from base (bx, by) along angle a (deg from vertical), length l, width w
  function capsule(bx, by, a, l, w) {
    const r = a * Math.PI / 180, ux = Math.sin(r), uy = -Math.cos(r), nx = -uy, ny = ux, h = w / 2, pts = [];
    pts.push([bx - nx * h, by - ny * h]);
    const tx = bx + ux * (l - h), ty = by + uy * (l - h);
    pts.push([tx - nx * h, ty - ny * h]);
    for (let k = 1; k < 6; k++) { const q = Math.PI * k / 6; pts.push([tx - nx * h * Math.cos(q) + ux * h * Math.sin(q), ty - ny * h * Math.cos(q) + uy * h * Math.sin(q)]); }
    pts.push([tx + nx * h, ty + ny * h]);
    pts.push([bx + nx * h, by + ny * h]);
    return pts;
  }

  SH.cs_hand = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 333, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g'), top = el(root, 'g');
      const s = (P.scale || 1) * (portrait ? 1.15 : 0.85);
      const cx = (P.x ?? 0.4) * W, cy = (P.y ?? 0.47) * H;
      const X = u => cx + u * s, Y = v => cy + v * s;
      const sleeve = { f: mk(cam, INK.red), gold: mk(cam, INK.gold), r: mk(cam) };
      const palm = { f: mk(cam, INK.paperLight), r: mk(cam) };
      const ghost = { f: mk(cam, INK.paperLight, { 'fill-opacity': 0.35 }), r: mk(cam, INK.inkSoft) };
      const fing = { f: mk(cam, INK.paperLight), r: mk(cam) };
      const cuts = mk(cam, INK.red);
      const nums = [0, 1, 2].map(i => {
        const t = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 84, 'text-anchor': 'middle', fill: INK.red });
        t.textContent = String(i + 1); return t;
      });
      // raised fingers: thumb, index, middle (base x, base y, angle, length, width); folded: ring, little
      const RAISED = [[-112, -10, -48, 190, 74], [-58, -120, -6, 250, 70], [12, -126, 4, 270, 70]];
      const FOLD = [[78, -62, 72, 30, -0.12], [92, -4, 66, 28, -0.05]];
      const L = P.label ? Object.assign({ x: 0.5, y: 0.17, size: 110, color: 'red' }, P.label) : null;
      let lab = null;
      if (L) {
        lab = el(top, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': L.size, 'text-anchor': 'middle', fill: L.color === 'ink' ? INK.ink : INK.red });
        lab.textContent = L.text;
      }
      const K = P.kasif ? Object.assign({ x: 0.82, scale: 0.85, pose: 'think', face: -1 }, P.kasif) : null;
      const kas = K && typeof KASIF !== 'undefined' ? KASIF.create(el(root, 'g'), { scale: (portrait ? 1 : 0.8) * K.scale, hat: true, seed: sd + 9 }) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const isCover = document.documentElement.classList.contains('cover');
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const C = P.cam || {}, foc = C.focus || [0.45, 0.5];
          const z = lerp(1, C.zoom || 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(foc[0] * W + Math.sin(lt * 0.35) * 6)} ${f1(foc[1] * H + Math.cos(lt * 0.27) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-foc[0] * W)} ${f1(-foc[1] * H)})`);
          const S = k => sd + k;
          const ip = (pts, k, w, o) => inkPath(pts, Object.assign({ seed: S(k), t, w, amp: 1.5 }, o));
          const il = (pts, k, o) => inkLoop(pts, Object.assign({ seed: S(k), t, amp: 1.3 }, o));
          // the hand rises in, then sways slowly
          const rise = spring(lt, 0, 0.7), dy = (1 - rise) * 260 + Math.sin(lt * 1.1) * 6;
          const rot = Math.sin(lt * 0.8) * 1.5;
          cam.setAttribute('transform', cam.getAttribute('transform') + ` translate(0 ${f1(dy)}) rotate(${f1(rot)} ${f1(cx)} ${f1(cy + 300)})`);
          // sleeve
          const sl = [[X(-170), Y(110)], [X(150), Y(110)], [X(230), Y(560)], [X(-250), Y(560)]];
          sleeve.f.setAttribute('d', il(sl, 1));
          sleeve.r.setAttribute('d', ip(sl, 2, 6, { closed: true }));
          sleeve.gold.setAttribute('d', ip([[X(-176), Y(130)], [X(156), Y(130)]], 3, 22) + ' ' + ip([[X(-30), Y(150)], [X(-50), Y(540)]], 4, 10));
          // palm
          const pm = [[X(-140), Y(-40)], [X(-104), Y(-130)], [X(160), Y(-112)], [X(170), Y(30)], [X(140), Y(110)], [X(-130), Y(110)]];
          palm.f.setAttribute('d', il(pm, 5));
          // folded fingers (knuckle bumps on the palm)
          const fold = FOLD.map(([bx, by, l, w, r], i) => inkEllipsePts(X(bx), Y(by), l * s, w * s, S(10 + i), 12, r));
          const cutAt = atOr(cues, P.cut, null), cp = cutAt != null && lt >= cutAt ? clamp01((lt - cutAt) / 0.5) : 0;
          const raised = RAISED.map(([bx, by, a, l, w]) => capsule(X(bx), Y(by), a, l * s, w * s));
          // cut fingers drift up as faint dashed ghosts
          const lift = cp * 70;
          const liftP = pts => pts.map(([x, y]) => [x, y - lift]);
          if (cp > 0) {
            fing.f.setAttribute('d', ''); fing.r.setAttribute('d', '');
            ghost.f.setAttribute('d', raised.map((q, i) => il(liftP(q), 20 + i)).join(' '));
            // dashed outline: draw every other segment
            ghost.r.setAttribute('d', raised.map((q, i) => {
              const lp = liftP(inkSpline(q, true, 18)); let d = '';
              for (let k = 0; k + 1 < lp.length; k += 2) d += ip([lp[k], lp[k + 1]], 30 + i * 40 + k, 4) + ' ';
              return d;
            }).join(' '));
          } else {
            fing.f.setAttribute('d', raised.map((q, i) => il(q, 20 + i)).join(' '));
            fing.r.setAttribute('d', raised.map((q, i) => ip(q, 25 + i, 6, { closed: true })).join(' '));
            ghost.f.setAttribute('d', ''); ghost.r.setAttribute('d', '');
          }
          palm.r.setAttribute('d', [ip(pm, 6, 6, { closed: true })].concat(fold.map((q, i) => ip(q, 12 + i, 5, { closed: true }))).join(' '));
          palm.f.setAttribute('d', il(pm, 5) + ' ' + fold.map((q, i) => il(q, 14 + i)).join(' '));
          // red dashed cut lines at the base of each raised finger
          if (cp > 0) {
            cuts.setAttribute('d', RAISED.map(([bx, by, a, l, w], i) => {
              const r = a * Math.PI / 180, nx = Math.cos(r), ny = Math.sin(r), h = w * s * 0.75, x0 = X(bx), y0 = Y(by);
              let d = '';
              for (let k = 0; k < 4; k++) {
                const u0 = -1 + k * 0.5, u1 = u0 + 0.3 * Math.min(1, cp * 2);
                d += ip([[x0 + nx * h * u0, y0 + ny * h * u0], [x0 + nx * h * u1, y0 + ny * h * u1]], 300 + i * 9 + k, 9) + ' ';
              }
              return d;
            }).join(' '));
          } else cuts.setAttribute('d', '');
          // numbers 1-2-3 beside the fingertips
          const ca = atOr(cues, P.count, dur * 0.15);
          nums.forEach((n, i) => {
            const [bx, by, a, l] = RAISED[i], r = a * Math.PI / 180;
            const tx = X(bx) + Math.sin(r) * l * s * 0.95 + (i === 0 ? -70 : i === 1 ? -64 : 70), ty = Y(by) - Math.cos(r) * l * s * 0.95 + 10 - lift;
            const p = lt >= ca + i * 0.3 ? spring(lt, ca + i * 0.3, 0.5) : 0, b = boil(S(500 + i), t, 1.5);
            n.setAttribute('opacity', clamp01(p * 2));
            n.setAttribute('transform', `translate(${f1(tx + b[0])} ${f1(ty + b[1])}) scale(${lerp(0.3, 1, p).toFixed(3)})`);
          });
          if (lab) {
            const a = atOr(cues, L.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.55) : 0, b = boil(S(600), t, 1.6);
            lab.setAttribute('opacity', clamp01(p * 2));
            lab.setAttribute('transform', `translate(${f1(L.x * W + b[0])} ${f1(L.y * H + b[1])}) rotate(${f1(-3 + Math.sin(t * 1.3) * 1.5)}) scale(${lerp(0.4, 1, p).toFixed(3)})`);
          }
          if (kas) {
            const segs = [{ at: -1, pose: K.pose, emotion: K.emotion, dir: K.dir, face: K.face }];
            (K.seq || []).forEach(q => { const a = atOr(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; segs.forEach((q, j) => { if (lt >= q.at) i = j; });
            const q = segs[i], pq = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, q.at);
            const o = { x: K.x * W, y: (K.y ?? 0.585) * H, face: q.face ?? K.face, since, dir: dirOf(q.dir ?? K.dir), emotion: q.emotion || (q.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, alpha: isCover ? 0 : 1 };
            if (pq && since < 0.35) { o.prev = { pose: pq.pose, since: since + 1, dir: dirOf(pq.dir ?? K.dir) }; o.mix = since / 0.35; }
            kas.update(t, q.pose, o);
          }
        },
      };
    },
  };
})();
