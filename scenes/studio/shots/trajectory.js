// trajectory: Earth–Moon free-return path as a hand-drawn ink diagram on parchment (brand/kit/BRAND.md §5), made for
// 05-apollo-13 but parametric: a figure-eight route (out under the Moon, around its far side, back to Earth),
// dashed red line drawn along a cue, a small spacecraft marker travelling on it, a big distance counter, the Moon's
// far side shaded, the radio link to Earth cut while the craft is behind the Moon, and optional Kaşif.
//
// SHOTS.trajectory P: {
//   route: {from: 0, to: 1, at: cue|seconds, dur: 2.5},   // part of the path (0..1 of its length) drawn as the scene runs
//   craft: {from: 0.3, to: 0.45, at, dur: 3} | false,      // marker position along the path (0..1)
//   counter: {from: 0, to: 400171, at, dur: 2.5, unit: "km", label: "Dünya'dan uzaklık", x: 0.5, y: 0.16},
//   farside: true,                // hatch the Moon's far half + "Ay'ın arkası" label (cue "far")
//   signal: true,                 // dashed radio line Earth -> craft; red ✗ "Sinyal yok" from cue "los"
//   off: true,                    // grey dashed path that misses Earth (the non-free-return course) drawn from the start;
//                                 // with route, the red free-return path is drawn over it at cue "route"
//   mark: {u: 0.32, text: "Patlama", at},   // red burst + label at a point of the path (cue "mark")
//   labels: true,                 // "Dünya" / "Ay" labels (default true)
//   note: {text, x: 0.5, y: 0.86, at, color},
//   zoom: 1.08, focus: [0.6, 0.45], // slow push-in over the scene
//   kasif: {x: 0.1, y: 0.92, pose: "point", at, then, dir, face, scale: 0.65, emotion, then_emotion, then_dir}
// }
// cues: route, craft, counter, far, los, mark, note, kasif.at (or the "at" names given in params)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const dirOf = d => d == null ? 0 : typeof d === 'number' ? d : (DIRS[d] ?? 0);
  const faceOf = v => v === 'left' ? -1 : v === 'right' ? 1 : (v ?? 1);

  // resample a polyline by arc length -> {pts, at(u) -> [x, y, angle]}
  function arc(pts) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = L[L.length - 1] || 1;
    const at = u => {
      const d = clamp01(u) * tot; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const a = pts[i - 1], b = pts[i], f = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
      return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
    };
    const upto = u => { const d = clamp01(u) * tot, out = []; for (let i = 0; i < pts.length && L[i] <= d; i++) out.push(pts[i]); const e = at(u); out.push([e[0], e[1]]); return out; };
    const range = (u0, u1) => { const d0 = clamp01(u0) * tot, d1 = clamp01(u1) * tot, s = at(u0), out = [[s[0], s[1]]]; for (let i = 0; i < pts.length; i++) if (L[i] > d0 && L[i] < d1) out.push(pts[i]); const e = at(u1); out.push([e[0], e[1]]); return out; };
    return { pts, at, upto, range };
  }
  const dstr = q => q.length < 2 ? '' : 'M' + q.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L');

  SH.trajectory = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bg = el(cam, 'g'), mid = el(cam, 'g'), top = el(cam, 'g'), hud = el(root, 'g'), kG = el(root, 'g');
      const mk = (g, fill = INK.ink, extra) => inkEl(g, fill, extra);
      const sd = seed * 1000;
      const E = { x: W * 0.17, y: H * 0.5, r: 105 }, M = { x: W * 0.78, y: H * 0.47, r: 68 };
      // figure-eight free-return path (Catmull-Rom through hand-placed points)
      const ctrl = [[E.x + 98, E.y - 46], [W * 0.33, H * 0.33], [W * 0.5, H * 0.47], [W * 0.66, H * 0.62], [M.x + 10, M.y + 112],
        [M.x + 118, M.y + 8], [M.x + 12, M.y - 110], [W * 0.66, H * 0.31], [W * 0.5, H * 0.47], [W * 0.33, H * 0.62], [E.x + 100, E.y + 52]];
      const path = arc(inkSpline(ctrl, false, 6));
      const offPts = arc(inkSpline([[E.x + 98, E.y - 46], [W * 0.33, H * 0.33], [W * 0.5, H * 0.47], [W * 0.66, H * 0.62], [M.x + 10, M.y + 112], [M.x + 150, M.y + 40], [W * 0.93, H * 0.17]], false, 6));
      // stars
      const r0 = rng(seed * 13 + 5);
      const stars = Array.from({ length: 30 }, () => [r0() * W, r0() * H * 0.84, 5 + r0() * 6, r0()]);
      const starE = mk(bg, INK.inkSoft, { 'fill-opacity': 0.65 });
      // bodies
      const eF = mk(mid, INK.paperLight), eC = mk(mid, INK.blue, { 'fill-opacity': 0.5 }), eR = mk(mid);
      const mF = mk(mid, INK.paperLight), mC = mk(mid, INK.inkSoft), mFar = mk(mid, INK.ink, { 'fill-opacity': 0.55 }), mR = mk(mid);
      // paths
      const offE = el(mid, 'path', { fill: 'none', stroke: INK.inkSoft, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '16 18' });
      const offX = mk(mid, INK.inkSoft);
      const ghost = el(mid, 'path', { fill: 'none', stroke: INK.inkSoft, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '4 14', opacity: 0.6 });
      const routeE = el(mid, 'path', { fill: 'none', stroke: INK.red, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': '22 16' });
      const head = mk(mid, INK.red);
      const sigE = el(mid, 'path', { fill: 'none', stroke: INK.blue, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '6 14' });
      const sigX = mk(top, INK.red);
      const markE = mk(top, INK.red), markR = mk(top, INK.gold);
      const craftG = el(top, 'g'), crF = mk(craftG, INK.paperLight), crR = mk(craftG), crRing = mk(top, INK.red);
      const T = (txt, size, fill, g = top, font = INK_FONT, weight = 400) => {
        const e = el(g, 'text', { 'font-family': font, 'font-size': size, 'font-weight': weight, 'text-anchor': 'middle', fill,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        e.textContent = txt; return e;
      };
      const eL = P.labels === false ? null : T('Dünya', 58, INK.ink), mL = P.labels === false ? null : T('Ay', 58, INK.ink);
      const farL = P.farside ? T("Ay'ın arkası", 50, INK.ink) : null;
      const losL = P.signal ? T('Sinyal yok', 52, INK.red) : null;
      const markL = P.mark ? T(P.mark.text || 'Patlama', 56, INK.red) : null;
      const C = P.counter ? (typeof P.counter === 'object' ? P.counter : { to: P.counter }) : null;
      const cNum = C ? T('0', 120, INK.ink, hud, 'Fraunces, Georgia, serif', 900) : null;
      const cLab = C && C.label ? T(C.label, 52, INK.inkSoft, hud) : null;
      const cUl = C ? mk(hud, INK.gold) : null;
      const note = P.note ? (typeof P.note === 'string' ? { text: P.note } : P.note) : null;
      const noteE = note ? T(note.text, note.size || 64, note.color === 'ink' ? INK.ink : INK.red, hud) : null;
      let kas = null;
      if (P.kasif && typeof KASIF !== 'undefined') {
        const K = typeof P.kasif === 'object' ? P.kasif : { pose: P.kasif };
        kas = { K, rig: KASIF.create(kG, { scale: K.scale ?? 0.65, hat: true, seed: seed + 3 }) };
      }
      const FOC = [(P.focus ? P.focus[0] : 0.6) * W, (P.focus ? P.focus[1] : 0.47) * H];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, A = (k, fb) => atOr(cues, k, fb);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.3) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(FOC[0])} ${f1(FOC[1])}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);
          // stars
          let sdd = '';
          stars.forEach((s, i) => {
            const k = s[2] * (0.6 + 0.4 * Math.sin(t * 1.2 + s[3] * 9));
            sdd += inkPath([[s[0] - k, s[1]], [s[0] + k, s[1]]], { seed: sd + 10 + i, t, w: 3, amp: 0.6 }) + inkPath([[s[0], s[1] - k], [s[0], s[1] + k]], { seed: sd + 60 + i, t, w: 3, amp: 0.6 });
          });
          starE.setAttribute('d', sdd);
          // Earth + Moon pop in
          const pe = spring(lt, 0, 0.8), pm = spring(lt, 0.15, 0.8);
          const er = E.r * pe, mr = M.r * pm, ey = E.y + Math.sin(t * 0.6) * 4;
          eF.setAttribute('d', er > 1 ? inkCircle(E.x, ey, er, sd + 1, t, { fill: true }) : '');
          eC.setAttribute('d', er > 1 ? inkLoop([[E.x - er * 0.5, ey - er * 0.35], [E.x - er * 0.05, ey - er * 0.6], [E.x + er * 0.15, ey - er * 0.1], [E.x - er * 0.2, ey + er * 0.35], [E.x - er * 0.6, ey + er * 0.1]], { seed: sd + 2, t }) +
            inkLoop([[E.x + er * 0.3, ey + er * 0.15], [E.x + er * 0.65, ey + er * 0.05], [E.x + er * 0.5, ey + er * 0.55], [E.x + er * 0.2, ey + er * 0.5]], { seed: sd + 3, t }) : '');
          eR.setAttribute('d', er > 1 ? inkCircle(E.x, ey, er, sd + 1, t, { w: 6 }) : '');
          mF.setAttribute('d', mr > 1 ? inkCircle(M.x, M.y, mr, sd + 4, t, { fill: true }) : '');
          let cr = '';
          if (mr > 1) [[-0.35, -0.25, 0.24], [0.2, 0.2, 0.18], [-0.1, 0.45, 0.12]].forEach((c, i) => cr += inkCircle(M.x + c[0] * mr, M.y + c[1] * mr, c[2] * mr, sd + 5 + i, t, { w: 3 }));
          mC.setAttribute('d', cr);
          mR.setAttribute('d', mr > 1 ? inkCircle(M.x, M.y, mr, sd + 4, t, { w: 6 }) : '');
          if (P.farside) {
            const fk = prog(lt, A('far', 0.4), 0.8), half = [];
            for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; half.push([M.x + Math.cos(a) * mr, M.y + Math.sin(a) * mr]); }
            for (let i = 10; i >= 0; i--) { const a = -Math.PI / 2 + i / 10 * Math.PI; half.push([M.x + Math.cos(a) * mr * (1 - fk) * 0.0 + Math.cos(a) * mr * 0.12, M.y + Math.sin(a) * mr]); }
            mFar.setAttribute('d', fk > 0.01 && mr > 1 ? inkLoop(half, { seed: sd + 8, t }) : '');
            mFar.setAttribute('fill-opacity', (0.5 * fk).toFixed(3));
            const b = boil(sd + 9, t, 1.4);
            farL.setAttribute('x', f1(M.x + 150 + b[0])); farL.setAttribute('y', f1(M.y - 150 + b[1]));
            farL.style.opacity = fk;
          }
          if (eL) { const b = boil(sd + 11, t, 1.2); eL.setAttribute('x', f1(E.x + b[0])); eL.setAttribute('y', f1(E.y + E.r + 72 + b[1])); eL.style.opacity = clamp01(pe); }
          if (mL) { const b = boil(sd + 12, t, 1.2); mL.setAttribute('x', f1(M.x - 120 + b[0])); mL.setAttribute('y', f1(M.y - M.r - 20 + b[1])); mL.style.opacity = clamp01(pm); }
          // ghost of the full path (very faint) so the figure eight reads even before it is drawn
          ghost.setAttribute('d', dstr(path.pts));
          ghost.style.opacity = P.ghost === false ? 0 : 0.5 * prog(lt, 0.2, 0.8);
          // the missed course
          if (P.off) {
            const ok = prog(lt, 0.2, 1.4);
            offE.setAttribute('d', dstr(offPts.upto(ok)));
            const e = offPts.at(1), xk = ok >= 1 ? spring(lt, 1.6, 0.5) : 0, zz = 30 * xk, x = e[0] - 20, y = e[1] + 40;
            offX.setAttribute('d', xk > 0.01 ? inkPath([[x - zz, y - zz], [x + zz, y + zz]], { seed: sd + 20, t, w: 9 }) + inkPath([[x + zz, y - zz], [x - zz, y + zz]], { seed: sd + 21, t, w: 9 }) : '');
          }
          // the route
          const R = P.route ? (typeof P.route === 'object' ? P.route : {}) : null;
          if (R) {
            const ra = A(R.at || 'route', 0.3), u = lerp(R.from ?? 0, R.to ?? 1, progIO(lt, ra, R.dur ?? 2.5));
            const q = inkJitter(path.range(R.from ?? 0, u), sd + 30, t, 1.2);
            routeE.setAttribute('d', dstr(q));
            routeE.setAttribute('stroke-dashoffset', f1(-lt * 20));
            const e = path.at(u);
            head.setAttribute('d', u > (R.from ?? 0) + 0.005 ? inkCircle(e[0], e[1], 10, sd + 31, t, { fill: true }) : '');
          }
          // craft marker
          let craftPos = null;
          if (P.craft !== false) {
            const Cr = typeof P.craft === 'object' ? P.craft : { from: R ? (R.from ?? 0) : 0.3, to: R ? (R.to ?? 1) : 0.3, at: R ? (R.at || 'route') : 0, dur: R ? (R.dur ?? 2.5) : 1 };
            const ca = A(Cr.at || 'craft', 0.3), u = lerp(Cr.from ?? 0.3, Cr.to ?? Cr.from ?? 0.3, progIO(lt, ca, Cr.dur ?? 3));
            const e = path.at(u), ang = e[2], s = 1.1 * spring(lt, 0.1, 0.7);
            craftPos = e;
            craftG.setAttribute('transform', `translate(${f1(e[0])} ${f1(e[1])}) rotate(${f1(ang * 180 / Math.PI)}) scale(${s.toFixed(3)})`);
            const body = [[-34, -14], [6, -14], [30, -6], [30, 6], [6, 14], [-34, 14]], lm = [[30, -16], [50, -16], [50, 16], [30, 16]];
            crF.setAttribute('d', inkLoop(body, { seed: sd + 40, t, smooth: false }) + inkLoop(lm, { seed: sd + 41, t, smooth: false }));
            crR.setAttribute('d', inkPath(body, { seed: sd + 40, t, closed: true, w: 5, smooth: false }) + inkPath(lm, { seed: sd + 41, t, closed: true, w: 5, smooth: false }) +
              inkPath([[-34, -9], [-48, -16], [-48, 16], [-34, 9]], { seed: sd + 42, t, w: 4, smooth: false }));
            const pr = (lt * 0.9) % 1;
            crRing.setAttribute('d', inkCircle(e[0], e[1], 40 + pr * 50, sd + 43, t, { w: 5 * (1 - pr) + 0.5 }));
          }
          // radio link Earth -> craft, cut while behind the Moon
          if (P.signal && craftPos) {
            const los = A('los', null), cut = los != null && lt >= los;
            sigE.setAttribute('d', dstr([[E.x + E.r * 0.7, ey - E.r * 0.5], [craftPos[0], craftPos[1]]]));
            sigE.setAttribute('stroke', cut ? INK.red : INK.blue);
            sigE.setAttribute('stroke-dashoffset', f1(-lt * 40));
            sigE.style.opacity = cut ? 0.35 : 0.9 * prog(lt, 0.3, 0.6);
            const k = cut ? spring(lt, los, 0.5) : 0, mx = lerp(E.x, craftPos[0], 0.55), my = lerp(ey, craftPos[1], 0.55), zz = 34 * k;
            sigX.setAttribute('d', k > 0.01 ? inkPath([[mx - zz, my - zz], [mx + zz, my + zz]], { seed: sd + 50, t, w: 10 }) + inkPath([[mx + zz, my - zz], [mx - zz, my + zz]], { seed: sd + 51, t, w: 10 }) : '');
            losL.setAttribute('x', f1(mx)); losL.setAttribute('y', f1(my + 90)); losL.style.opacity = k;
          }
          // explosion mark
          if (P.mark) {
            const mk2 = spring(lt, A(P.mark.at || 'mark', 0.8), 0.5), e = path.at(P.mark.u ?? 0.32);
            let rays = '';
            if (mk2 > 0.01) for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, r1 = 16, r2 = 16 + 36 * mk2 * (1 + 0.15 * Math.sin(t * 8 + i)); rays += inkPath([[e[0] + Math.cos(a) * r1, e[1] + Math.sin(a) * r1], [e[0] + Math.cos(a) * r2, e[1] + Math.sin(a) * r2]], { seed: sd + 60 + i, t, w: 6 }); }
            markE.setAttribute('d', rays);
            markR.setAttribute('d', mk2 > 0.01 ? inkCircle(e[0], e[1], 14 * mk2, sd + 70, t, { fill: true }) : '');
            markL.setAttribute('x', f1(e[0])); markL.setAttribute('y', f1(e[1] - 70)); markL.style.opacity = clamp01(mk2 * 2);
          }
          // counter (HUD: does not zoom with the camera)
          if (C) {
            const ca = A(C.at || 'counter', 0.3), u = prog(lt, ca, C.dur ?? 2.5), v = lerp(C.from ?? 0, C.to ?? 0, u);
            const x = (C.x ?? 0.5) * W, y = (C.y ?? 0.16) * H, sp = spring(lt, 0.05, 0.6) + punch(lt, ca + (C.dur ?? 2.5), 0.6) * 0.1;
            cNum.textContent = fmtNum(Math.round(v)) + (C.unit ? ' ' + C.unit : '');
            const b = boil(sd + 80, t, 1.2);
            cNum.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) scale(${sp.toFixed(3)})`);
            cNum.setAttribute('fill', u >= 1 && C.red !== false ? INK.red : INK.ink);
            if (cLab) { cLab.setAttribute('x', f1(x)); cLab.setAttribute('y', f1(y + 70)); cLab.style.opacity = clamp01(sp); }
            const tw = Math.min(W * 0.5, cNum.getComputedTextLength ? cNum.getComputedTextLength() : 400);
            cUl.setAttribute('d', inkPath([[x - tw / 2, y + 18], [x + tw / 2 * (2 * prog(lt, ca, 1.2) - 1), y + 22]], { seed: sd + 81, t, w: 7 }));
          }
          if (noteE) {
            const k = spring(lt, A(note.at || 'note', dur * 0.5), 0.6), b = boil(sd + 90, t, 1.5);
            noteE.setAttribute('transform', `translate(${f1((note.x ?? 0.5) * W + b[0])} ${f1((note.y ?? 0.86) * H + b[1])}) rotate(-2) scale(${lerp(0.6, 1, k).toFixed(3)})`);
            noteE.style.opacity = clamp01(k * 2);
          }
          if (kas) {
            const K = kas.K, at = A(K.at, null);
            let pose = K.pose || 'idle';
            const o = { x: (K.x ?? 0.1) * W, y: (K.y ?? 0.92) * H, face: faceOf(K.face), dir: dirOf(K.dir), emotion: K.emotion, since: lt };
            if (at != null && K.then && lt >= at) {
              const since = lt - at;
              o.prev = { pose, since: at, dir: dirOf(K.dir), emotion: K.emotion }; o.mix = Math.min(1, since / 0.3);
              pose = K.then; o.since = since; o.dir = dirOf(K.then_dir ?? K.dir); o.emotion = K.then_emotion || K.emotion;
            }
            kas.rig.update(t, pose, o);
          }
        },
      };
    },
  };
})();
