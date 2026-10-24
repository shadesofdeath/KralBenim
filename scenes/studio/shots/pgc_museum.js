// pgc_museum: two 19th-century interiors/exteriors in the parchment ink style (brand/kit/BRAND.md §3, §5; every line
// boils at 8 Hz via _ink.js; pure function of (seed, lt)). Written for ag-04-phineas-gage (chapter 5), parametric.
//
// SHOTS.pgc_museum P: {
//   mode: "case" | "grave"
//     case:  a museum hall (back wall, wainscot, two framed sketches, floor boards). In the middle a plinth with a glass
//            case holding a skull (side view) and a long iron bar lying beside it, a small card; light glints sweep
//            across the glass, a museum plaque (case.plaque, default "WARREN MUSEUM") on the wall. Visitors / students (cast) walk in and gather; `hit` punches the case and rings the skull.
//     grave: a quiet hillside: a headstone (text lines), a cypress, a far fence; a family member (carry) walks from the
//            grave to a waiting doctor holding a small wooden box (no digging shown, respectful).
//     class: a lecture room: a big board with a brain sketch (front lobe turns red at board.red) and a chalk Gage with
//            head bandage + eye patch, an arrow from Gage to the brain at `hit`; a bench (P.bench: false hides it; seated cast draw their own stools).
//   riser: {x0: 0.52, x1: 0.92, y: 0.72} (class: a raised step for seated students) · board: {x: 0.36, y: 0.1, w: 0.46, h: 0.48, text: "Phineas Gage", red: cue}   (class)
//   house: {x: 0.75, scale: 1} (grave: the family house on the hill) · stone.at: cue (the headstone rises then)
//   cast[].gage: true | {bandage, patch, cap} (window.PGB.gageMarks: Gage's bandage + eye patch)
// SHOTS.pgc_hall = pgc_museum with mode "case" by default (indoor views under their own type name).
//   case: {x: 0.5, w: 0.42, y: 0.56 (glass bottom, 0..1 H), card: "1848", ring: "hit" (cue for a red ring round the skull)}
//   stone: {x: 0.26, lines: ["GAGE", "1860"]}   (grave)
//   carry: {from: 0.3, to: 0.6, start: cue|sec, at: cue|sec (arrives), accessory, beard, scale: 0.6}   (grave)
//   label: {text, x, y, at, color, size, arrow: [x, y]} (handwritten note)
//   cast: [{who: "kasif"|name, accessory, beard, x, to, start, y, scale, pose, at, then, face, dir, emotion, emotion0, item,
//           text, seq: [{at, pose, dir, face, emotion}]}]   (walk/run + to: walks from x to `to`, arriving on `at`)
//   cam: {zoom: 1.06, focus: [0.5, 0.5]}
// }
// cues: hit + whatever names cast / carry / label use.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold };
  const FR = 'Fraunces, Georgia, serif';

  function poseAt(m, lt, cues) {
    let pose = m.pose || 'idle', dir = m.dir, face = m.face, emo = m.emotion0 || null, since = lt, prev = null, text = m.text, item = m.item;
    const steps = [];
    if (m.at != null) steps.push({ at: m.at, pose: m.then || 'point', dir: m.dir, face: m.face, emotion: m.emotion });
    (m.seq || []).forEach(s => steps.push(s));
    steps.map(s => Object.assign({}, s, { t: atOr(cues, s.at, 1e9) })).sort((a, b) => a.t - b.t).forEach(s => {
      if (lt >= s.t) {
        prev = { pose, dir: typeof dir === 'number' ? dir : DIRS[dir] ?? 25, since: s.t };
        pose = s.pose || pose; if (s.dir != null) dir = s.dir; if (s.face != null) face = s.face;
        if (s.text != null) text = s.text; if (s.item != null) item = s.item;
        emo = s.emotion || (s.pose === 'shock' ? 'surprised' : emo); since = lt - s.t;
      }
    });
    return { pose, dir: typeof dir === 'number' ? dir : DIRS[dir] ?? 25, face: face === 'left' ? -1 : 1, emo, since, prev, text, item };
  }
  function makeCast(list, parent, seed, defScale) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = m.scale ?? defScale;
      const rig = KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 });
      const marks = m.gage && window.PGB && window.PGB.gageMarks ? window.PGB.gageMarks(rig, seed + 500 + i * 31, m.gage) : null;
      return { m, isK, sc, rig, marks };
    });
  }
  function castX(m, lt, cues, W) {
    const x0 = (m.x ?? 0.8) * W;
    if (m.to == null) return x0;
    const a = atOr(cues, m.start, 0), b = atOr(cues, m.at, a + 1.5);
    return lerp(x0, m.to * W, sm((lt - a) / Math.max(0.3, b - a)));
  }
  function updateCast(cast, lt, t, cues, W, H, G) {
    return cast.map(c => {
      const m = c.m, s = poseAt(m, lt, cues);
      const x = castX(m, lt, cues, W), y = m.y != null ? m.y * H : G;
      const walking = m.to != null && (m.pose === 'walk' || m.pose === 'run') && lt < atOr(cues, m.at, 1e9);
      const pose = walking ? m.pose : s.pose;
      const face = m.to != null && walking ? (m.to * W > (m.x ?? 0.8) * W ? 1 : -1) : s.face;
      const o = { x, y, face, since: s.since, dir: s.dir, text: s.text, item: s.item, emotion: s.emo };
      if (walking) o.ph = Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(m.pose) * c.sc);
      if (s.prev && s.since < 0.32 && !walking) { o.prev = s.prev; o.mix = s.since / 0.32; }
      const res = c.rig.update(t, pose, o) || {};
      if (c.marks && res.head) c.marks(t, res.head);
      return { res, x, y, face, sc: c.sc };
    });
  }
  function makeNote(N, parent) {
    if (!N || !N.text) return null;
    const col = COL[N.color] || INK.ink;
    const t = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 66, 'text-anchor': 'middle', fill: col,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = N.text;
    return { N, t, u: mk(parent, col), ar: mk(parent, col) };
  }
  function updateNote(n, lt, t, cues, W, H, sd) {
    if (!n) return;
    const N = n.N, at = atOr(cues, N.at, 0.4), sp = lt >= at ? spring(lt, at, 0.6) : 0, x = (N.x ?? 0.5) * W, y = (N.y ?? 0.15) * H, b = boil(sd, t, 1.2);
    n.t.setAttribute('opacity', clamp01(sp * 2));
    n.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${N.rot ?? -3}) scale(${lerp(0.5, 1, sp).toFixed(3)})`);
    const tw = n.t.getComputedTextLength ? n.t.getComputedTextLength() : 300, pu = lt >= at ? prog(lt, at + 0.25, 0.45) : 0;
    const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
    n.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 15]], O(1, { w: 6 })) : '');
    if (N.arrow && lt >= at) {
      const pa = prog(lt, at + 0.35, 0.5), sx = x + (N.arrow[0] * W > x ? tw * 0.3 : -tw * 0.3), sy = y + 34, ex = N.arrow[0] * W, ey = N.arrow[1] * H;
      const mx = (sx + ex) / 2, my = (sy + ey) / 2 - 40, pts = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
      let d = pa > 0.01 ? inkPath(pts, O(2, { w: 6 })) : '';
      if (pa > 0.95) { const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]); d += ' ' + inkPath([[ex - 32 * Math.cos(a - 0.5), ey - 32 * Math.sin(a - 0.5)], [ex, ey], [ex - 32 * Math.cos(a + 0.5), ey - 32 * Math.sin(a + 0.5)]], O(3, { w: 6, smooth: false })); }
      n.ar.setAttribute('d', d);
    } else n.ar.setAttribute('d', '');
  }

  // skull in profile, facing left; unit ≈ skull half-height; origin = centre
  const SKULL = [[-0.95, 0.05], [-0.98, -0.35], [-0.78, -0.75], [-0.38, -1.0], [0.1, -1.04], [0.55, -0.9], [0.88, -0.58], [1.0, -0.15], [0.95, 0.25], [0.72, 0.52],
    [0.42, 0.6], [0.3, 0.9], [0.05, 0.98], [-0.35, 0.96], [-0.7, 0.92], [-0.98, 0.8], [-1.04, 0.56], [-1.1, 0.38], [-1.02, 0.2]];
  const ORBIT = [[-0.96, 0.08], [-0.78, 0.02], [-0.66, 0.16], [-0.74, 0.36], [-0.96, 0.38]];
  const TEETH = [[-0.98, 0.8], [-0.78, 0.84], [-0.58, 0.86], [-0.38, 0.88]];

  const BOUT = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [0.5, -0.88], [0.85, -0.6], [1.0, -0.2],
    [0.98, 0.18], [0.84, 0.42], [0.62, 0.5], [0.42, 0.52], [0.22, 0.62], [-0.05, 0.7], [-0.32, 0.66], [-0.55, 0.52], [-0.78, 0.38]];
  const BFRONT = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [-0.05, -0.6], [-0.15, -0.25], [-0.22, -0.02], [-0.6, 0.14], [-0.76, 0.37]];

  SH.pgc_museum = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'case', sd = seed * 1000 + 131;
      const G = (P.ground ?? 0.86) * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const r = rng((P.seed ?? 3) * 6151 + 5);
      const back = el(world, 'g'), mid = el(world, 'g'), castG = el(world, 'g'), front = el(world, 'g'), ui = el(root, 'g');
      const S = {};
      if (mode === 'case') {
        S.wall = mk(back, INK.inkSoft); S.boards = mk(back, INK.inkSoft, { 'fill-opacity': 0.6 });
        S.frames = [0].map(() => ({ f: mk(back, INK.paperLight), r: mk(back), s: mk(back, INK.inkSoft) }));
        S.plaque = el(back, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 62, 'text-anchor': 'middle', fill: INK.ink });
        S.plaque.textContent = (P.case && P.case.plaque) || 'WARREN MUSEUM';
        S.plaqueW = 520;
        S.plF = mk(mid, INK.paperDark); S.plR = mk(mid);
        S.glF = mk(mid, INK.paperLight, { 'fill-opacity': 0.55 });
        S.skF = mk(mid, INK.paperLight); S.skR = mk(mid); S.rodF = mk(mid, INK.inkSoft); S.rodR = mk(mid);
        S.cardF = mk(mid, INK.paperLight); S.cardR = mk(mid);
        S.card = el(mid, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 46, 'text-anchor': 'middle', fill: INK.ink });
        S.card.textContent = (P.case && P.case.card) || '1848';
        S.glR = mk(mid); S.glint = mk(mid, INK.paperLight); S.ring = mk(mid, INK.red);
      } else if (mode === 'class') {
        S.wall = mk(back, INK.inkSoft); S.bench = mk(back, INK.hat, { 'fill-opacity': 0.85 }); S.benchR = mk(back);
        S.riser = P.riser ? { f: mk(back, INK.paperDark), r: mk(back) } : null;
        S.bdF = mk(back, INK.paperDark); S.bdR = mk(back); S.bdBrain = mk(back); S.bdRed = mk(back, INK.red, { 'fill-opacity': 0 }); S.bdSul = mk(back, INK.inkSoft);
        S.bdFig = mk(back); S.bdBand = mk(back, INK.paperLight); S.bdBandR = mk(back); S.bdPatch = mk(back); S.bdArrow = mk(back, INK.red);
        S.bdTx = el(back, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink });
        S.bdTx.textContent = (P.board && P.board.text) || 'Phineas Gage';
      } else {
        S.hills = mk(back, INK.paperDark, { 'fill-opacity': 0.5 }); S.hillR = mk(back, INK.inkSoft);
        S.fence = mk(back, INK.inkSoft); S.ground = mk(back);
        S.tree = { f: mk(back, INK.green, { 'fill-opacity': 0.55 }), r: mk(back), trunk: mk(back) };
        S.stF = mk(mid, INK.paperLight); S.stR = mk(mid);
        const st = P.stone || {};
        S.stTx = (st.lines || ['GAGE', '1860']).map((l, i) => {
          const tx = el(mid, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': i === 0 ? 60 : 50, 'text-anchor': 'middle', fill: INK.ink });
          tx.textContent = l; return tx;
        });
        S.grass = mk(mid, INK.green);
        S.house = P.house ? { f: mk(back, INK.paperLight), r: mk(back), roof: mk(back, INK.red, { 'fill-opacity': 0.7 }) } : null;
        S.boxF = mk(front, INK.hat); S.boxR = mk(front);
      }
      const cast = makeCast(P.cast, castG, seed, 0.62);
      const carrier = mode === 'grave' && P.carry ? makeCast([Object.assign({ who: 'family', pose: 'walk', x: P.carry.from ?? 0.32, to: P.carry.to ?? 0.6, start: P.carry.start ?? 0.2, at: P.carry.at ?? 2.5, then: 'hold', face: 'right' }, P.carry)], castG, seed + 50, P.carry.scale ?? 0.62)[0] : null;
      const label = makeNote(P.label, ui);
      const frameArt = [0, 1].map(() => Array.from({ length: 3 }, () => [r(), r()]));
      const grassT = Array.from({ length: 22 }, () => [r(), r()]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const hitAt = atOr(cues, 'hit', 1e9), pk = punch(lt, hitAt, 0.6);
          const cam = P.cam || {}, fc = cam.focus || [0.5, 0.55], z = lerp(1, cam.zoom || 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fx = fc[0] * W, fy = fc[1] * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.4) * 6)} 0) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          if (mode === 'case') {
            const wy = G - 0.2 * H;
            S.wall.setAttribute('d', inkPath([[-40, G], [W + 40, G]], O(1, { w: 7 })) + ' ' + inkPath([[-40, wy], [W + 40, wy]], O(2, { w: 4 })) + ' ' + inkPath([[-40, wy + 18], [W + 40, wy + 18]], O(3, { w: 3 })));
            let bd = '';
            for (let k = 0; k < 9; k++) { const x = (k + 0.5) / 9 * W; bd += ' ' + inkPath([[x, G + 8], [x + (x - W / 2) * 0.35, H + 30]], O(10 + k, { w: 3 })); }
            for (let k = 0; k < 6; k++) { const x = (k + 0.5) / 6 * W; bd += ' ' + inkPath([[x, wy + 30], [x, G - 8]], O(30 + k, { w: 2.5 })); }
            S.boards.setAttribute('d', bd);
            // museum plaque on the wall above the case (P.case.plaque, default "WARREN MUSEUM")
            {
              const C0 = Object.assign({ x: 0.5 }, P.case || {}), px = C0.x * W, py = 0.17 * H, tw = (S.plaque.getComputedTextLength && S.plaque.getComputedTextLength()) || S.plaqueW, pw = tw / 2 + 50, ph = 52;
              const box = [[px - pw, py - ph], [px + pw, py - ph], [px + pw, py + ph], [px - pw, py + ph]];
              S.frames[0].f.setAttribute('d', inkLoop(box, O(40, { smooth: false })));
              S.frames[0].r.setAttribute('d', inkPath(box, O(40, { w: 7, closed: true, smooth: false })) + ' ' + inkPath([[px - pw + 16, py - ph + 14], [px + pw - 16, py - ph + 14], [px + pw - 16, py + ph - 14], [px - pw + 16, py + ph - 14]], O(41, { w: 3, closed: true, smooth: false })));
              S.frames[0].s.setAttribute('d', inkPath([[px - pw * 0.6, py - ph], [px, py - ph - 70], [px + pw * 0.6, py - ph]], O(42, { w: 3 })));
              const b = boil(sd + 43, t, 0.8);
              S.plaque.setAttribute('transform', `translate(${f1(px + b[0])} ${f1(py + 22 + b[1])})`);
            }
            const C = Object.assign({ x: 0.5, w: 0.42, y: 0.56 }, P.case || {});
            const ccx = C.x * W, cw = C.w * W, gb = C.y * H, gh = cw * 0.4, k = 1 + 0.03 * pk;
            const T = q => [ccx + (q[0] - ccx) * k, gb + (q[1] - gb) * k];
            const plinth = [[ccx - cw * 0.46, gb], [ccx + cw * 0.46, gb], [ccx + cw * 0.42, G], [ccx - cw * 0.42, G]].map(T);
            S.plF.setAttribute('d', inkLoop(plinth, O(50, { smooth: false })));
            S.plR.setAttribute('d', inkPath(plinth, O(50, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[ccx - cw * 0.4, gb + 40], [ccx + cw * 0.4, gb + 40]].map(T), O(51, { w: 3 })));
            const glass = [[ccx - cw / 2, gb], [ccx + cw / 2, gb], [ccx + cw / 2, gb - gh], [ccx - cw / 2, gb - gh]].map(T);
            S.glF.setAttribute('d', inkLoop(glass, O(52, { smooth: false, amp: 0.8 })));
            // skull (left) and the iron bar lying diagonally behind it
            const su = gh * 0.38, sx = ccx - cw * 0.28, sy = gb - su * 1.02;
            const SK = q => T([sx + q[0] * su, sy + q[1] * su]);
            S.skF.setAttribute('d', inkLoop(SKULL.map(SK), O(60)));
            S.skR.setAttribute('d', inkPath(SKULL.map(SK), O(60, { w: 5, closed: true })) + ' ' + inkPath(ORBIT.map(SK), O(61, { w: 4, closed: true })) + ' ' + inkPath(TEETH.map(SK), O(62, { w: 3 })) +
              ' ' + inkPath([[-0.35, -0.98], [-0.2, -0.75], [-0.3, -0.55]].map(SK), O(63, { w: 3.5 })) + ' ' + inkPath(inkEllipsePts(-0.25, -0.85, 0.12, 0.08, 4, 10, 0, 0.1).map(SK), O(64, { w: 3, closed: true })));
            const rA = T([ccx - cw * 0.1, gb - 20]), rB = T([ccx + cw * 0.47, gb - gh * 0.72]);
            const dx = rB[0] - rA[0], dy = rB[1] - rA[1], L = Math.hypot(dx, dy), nx = -dy / L * 13, ny = dx / L * 13, ux = dx / L, uy = dy / L;
            const rod = [[rA[0] + nx, rA[1] + ny], [rB[0] + nx * 0.6, rB[1] + ny * 0.6], [rB[0] + ux * 26, rB[1] + uy * 26], [rB[0] - nx * 0.6, rB[1] - ny * 0.6], [rA[0] - nx, rA[1] - ny]];
            S.rodF.setAttribute('d', inkLoop(rod, O(65, { smooth: false, amp: 0.8 })));
            S.rodR.setAttribute('d', inkPath(rod, O(65, { w: 4, closed: true, smooth: false, amp: 0.8 })));
            const cd = [[ccx + cw * 0.12, gb - 4], [ccx + cw * 0.3, gb - 4], [ccx + cw * 0.3, gb - 62], [ccx + cw * 0.12, gb - 62]].map(T);
            S.cardF.setAttribute('d', inkLoop(cd, O(66, { smooth: false })));
            S.cardR.setAttribute('d', inkPath(cd, O(66, { w: 3, closed: true, smooth: false })));
            const cc = T([ccx + cw * 0.21, gb - 18]), cb = boil(sd + 67, t, 0.8);
            S.card.setAttribute('transform', `translate(${f1(cc[0] + cb[0])} ${f1(cc[1] + cb[1])}) scale(${k.toFixed(3)})`);
            S.glR.setAttribute('d', inkPath(glass, O(52, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([glass[2], [glass[2][0] - 20, glass[2][1] - 22], [glass[3][0] + 20, glass[3][1] - 22], glass[3]], O(53, { w: 5, smooth: false })));
            // glints sweep across the glass
            let gd = '';
            [0, 0.45].forEach((off, i) => {
              const u = ((lt * 0.28 + off) % 1.3) - 0.15;
              if (u > 0 && u < 1) {
                const x0 = ccx - cw / 2 + cw * u;
                const a = T([x0, gb - gh * 0.08]), b = T([x0 + gh * 0.5, gb - gh * 0.92]);
                gd += ' ' + inkPath([a, b], O(70 + i, { w: 12 - i * 5, amp: 0.8 }));
              }
            });
            S.glint.setAttribute('d', gd);
            const ringAt = atOr(cues, C.ring || 'hit', 1e9), rp = prog(lt, ringAt, 0.6);
            if (rp > 0.01) {
              const pts = inkEllipsePts(sx, sy, su * 1.45, su * 1.35, 21, 16, 0, 0.05).map(T), n = Math.max(2, Math.round(pts.length * rp));
              S.ring.setAttribute('d', inkPath(pts.slice(0, n).concat(rp >= 1 ? [pts[0], pts[1]] : []), O(80, { w: 7 })));
            } else S.ring.setAttribute('d', '');
          } else if (mode === 'class') {
            const wy = G - 0.2 * H;
            S.wall.setAttribute('d', inkPath([[-40, G], [W + 40, G]], O(1, { w: 7 })) + ' ' + inkPath([[-40, wy], [W + 40, wy]], O(2, { w: 4 })));
            const Bd = Object.assign({ x: 0.36, y: 0.1, w: 0.46, h: 0.48 }, P.board || {});
            const bx = Bd.x * W, by = Bd.y * H, bw = Bd.w * W, bh = Bd.h * H, k = 1 + 0.02 * pk;
            const T = q => [bx + (q[0] - bx) * k, by + bh / 2 + (q[1] - by - bh / 2) * k];
            const bd = [[bx - bw / 2, by], [bx + bw / 2, by + 3], [bx + bw / 2, by + bh], [bx - bw / 2 + 2, by + bh - 2]].map(T);
            S.bdF.setAttribute('d', inkLoop(bd, O(5, { smooth: false })));
            S.bdR.setAttribute('d', inkPath(bd, O(5, { w: 9, closed: true, smooth: false })) + ' ' + inkPath([[bx - bw / 2 + 20, by + bh + 14], [bx + bw / 2 - 20, by + bh + 14]].map(T), O(6, { w: 6 })));
            // brain sketch on the left of the board, red front lobe from `red`
            const R = bh * 0.3, cx = bx - bw * 0.18, cy = by + bh * 0.5;
            const BR = q => T([cx + q[0] * R * 1.25, cy + q[1] * R]);
            const bp = prog(lt, 0.15, 0.9), OUTB = BOUT.slice(0, Math.max(2, Math.round(BOUT.length * bp))).map(BR);
            S.bdBrain.setAttribute('d', inkPath(OUTB, O(7, { w: 6, closed: bp >= 1 })));
            S.bdSul.setAttribute('d', bp >= 1 ? inkPath([[-0.05, -0.98], [-0.1, -0.5], [-0.22, -0.02]].map(BR), O(8, { w: 4 })) + ' ' + inkPath([[-0.62, 0.14], [-0.22, -0.02], [0.5, -0.3]].map(BR), O(9, { w: 4 })) : '');
            S.bdRed.setAttribute('d', inkLoop(BFRONT.map(BR), O(10, { amp: 1 })));
            S.bdRed.setAttribute('fill-opacity', f1(0.45 * sm((lt - atOr(cues, (P.board && P.board.red) || 'red', 0.8)) / 0.5) * 100) / 100);
            // chalk-ink Gage on the right of the board: head with bandage + eye patch, body
            const gx = bx + bw * 0.24, gy = by + bh * 0.36, hr = bh * 0.11, gp = prog(lt, 0.5, 0.8);
            const head = inkEllipsePts(gx, gy, hr, hr, 31, 12, 0, 0.04).map(T);
            S.bdFig.setAttribute('d', gp > 0.01 ? inkPath(head, O(11, { w: 6, closed: true })) + ' ' + inkPath([[gx, gy + hr], [gx, gy + hr + bh * 0.26 * gp]].map(T), O(12, { w: 6 })) +
              (gp > 0.6 ? ' ' + inkPath([[gx - hr * 1.3, gy + hr * 2.2], [gx, gy + hr * 1.5], [gx + hr * 1.3, gy + hr * 2.2]].map(T), O(13, { w: 5 })) + ' ' + inkPath([[gx - hr * 0.9, gy + hr + bh * 0.26], [gx, gy + hr + bh * 0.2], [gx + hr * 0.9, gy + hr + bh * 0.26]].map(T), O(14, { w: 5 })) : '') : '');
            const band = [[gx - hr * 1.02, gy - hr * 0.1], [gx - hr * 0.8, gy - hr * 0.75], [gx, gy - hr * 1.08], [gx + hr * 0.8, gy - hr * 0.75], [gx + hr * 1.02, gy - hr * 0.1], [gx, gy - hr * 0.5]].map(T);
            S.bdBand.setAttribute('d', gp > 0.3 ? inkLoop(band, O(15, { amp: 0.8 })) : '');
            S.bdBandR.setAttribute('d', gp > 0.3 ? inkPath(band, O(15, { w: 4, closed: true })) : '');
            S.bdPatch.setAttribute('d', gp > 0.3 ? inkDot(...T([gx - hr * 0.35, gy + hr * 0.1]), hr * 0.22, hr * 0.2, sd + 16, t) + ' ' + inkDot(...T([gx + hr * 0.35, gy + hr * 0.1]), 5, 5, sd + 17, t) : '');
            const ap = prog(lt, atOr(cues, 'hit', 1.5) - 0.2, 0.6);
            S.bdArrow.setAttribute('d', ap > 0.01 ? inkPath([[gx - hr * 1.6, gy + hr * 0.4], [lerp(gx - hr * 1.6, cx + R * 0.6, ap), lerp(gy + hr * 0.4, cy - R * 0.5, ap)]].map(T), O(18, { w: 6 })) : '');
            const tb = boil(sd + 19, t, 0.8), tp = T([gx, by + bh * 0.9]);
            S.bdTx.setAttribute('opacity', f1(gp * 10) / 10);
            S.bdTx.setAttribute('transform', `translate(${f1(tp[0] + tb[0])} ${f1(tp[1] + tb[1])}) rotate(-3)`);
            if (S.riser) {      // a raised step the seated students sit on (keeps them above the caption band)
              const Rz = P.riser, ry = Rz.y * H, rs = [[Rz.x0 * W, ry], [Rz.x1 * W, ry], [Rz.x1 * W, G], [Rz.x0 * W, G]];
              S.riser.f.setAttribute('d', inkLoop(rs, O(25, { smooth: false })));
              S.riser.r.setAttribute('d', inkPath(rs, O(25, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[Rz.x0 * W + 20, ry + 30], [Rz.x1 * W - 20, ry + 30]], O(26, { w: 3 })));
            }
            // benches for the seated students
            const bench = [[W * 0.52, G - 92], [W * 1.02, G - 92], [W * 1.02, G - 70], [W * 0.52, G - 70]];
            if (P.bench === false) { S.bench.setAttribute('d', ''); S.benchR.setAttribute('d', ''); } else {
            S.bench.setAttribute('d', inkLoop(bench, O(20, { smooth: false })));
            S.benchR.setAttribute('d', inkPath(bench, O(20, { w: 5, closed: true, smooth: false })) + ' ' + [0.56, 0.75, 0.98].map((x, i) => inkPath([[W * x, G - 70], [W * x, G]], O(21 + i, { w: 6 }))).join(' '));
            }
          } else {
            // ---------------- grave
            const hl = [[-40, G - 0.16 * H], [W * 0.25, G - 0.24 * H], [W * 0.55, G - 0.2 * H], [W * 0.8, G - 0.27 * H], [W + 40, G - 0.22 * H], [W + 40, G - 0.08 * H], [-40, G - 0.08 * H]];
            S.hills.setAttribute('d', inkLoop(hl, O(1)));
            S.hillR.setAttribute('d', inkPath(hl.slice(0, 5), O(1, { w: 4 })));
            let fd = '';
            for (let k = 0; k < 14; k++) { const x = W * 0.55 + k * 46; fd += ' ' + inkPath([[x, G - 0.05 * H], [x, G - 0.11 * H]], O(10 + k, { w: 4 })); }
            fd += ' ' + inkPath([[W * 0.55 - 10, G - 0.09 * H], [W * 0.55 + 13 * 46 + 10, G - 0.09 * H]], O(30, { w: 3 }));
            S.fence.setAttribute('d', fd);
            S.ground.setAttribute('d', inkPath([[-40, G], [W + 40, G]], O(2, { w: 7 })));
            // cypress, swaying slowly
            const tx = W * 0.08, sw = Math.sin(lt * 0.9) * 10;
            const tr = [[tx, G - 40], [tx - 46, G - 160], [tx - 38, G - 300], [tx + sw, G - 440], [tx + 38, G - 300], [tx + 46, G - 160]];
            S.tree.f.setAttribute('d', inkLoop(tr, O(40)));
            S.tree.r.setAttribute('d', inkPath(tr, O(40, { w: 5, closed: true })));
            S.tree.trunk.setAttribute('d', inkPath([[tx, G], [tx, G - 50]], O(41, { w: 9 })));
            // headstone
            if (S.house) {
              const hx = P.house.x * W, hs = P.house.scale ?? 1, w = 130 * hs, h = 120 * hs, Gh = G - 0.06 * H;
              const body = [[hx - w, Gh], [hx - w, Gh - h], [hx + w, Gh - h], [hx + w, Gh]], roof = [[hx - w - 24 * hs, Gh - h], [hx, Gh - h - 110 * hs], [hx + w + 24 * hs, Gh - h]];
              S.house.f.setAttribute('d', inkLoop(body, O(140, { smooth: false })));
              S.house.roof.setAttribute('d', inkLoop(roof, O(141, { smooth: false })));
              S.house.r.setAttribute('d', inkPath(body, O(140, { w: 6, closed: true, smooth: false })) + ' ' + inkPath(roof, O(141, { w: 6, closed: true, smooth: false })) + ' ' +
                inkPath([[hx - 26 * hs, Gh], [hx - 26 * hs, Gh - 70 * hs], [hx + 26 * hs, Gh - 70 * hs], [hx + 26 * hs, Gh]], O(142, { w: 5, smooth: false })) + ' ' +
                inkPath([[hx + 60 * hs, Gh - 80 * hs], [hx + 100 * hs, Gh - 80 * hs], [hx + 100 * hs, Gh - 44 * hs], [hx + 60 * hs, Gh - 44 * hs]], O(143, { w: 4, closed: true, smooth: false })));
            }
            const st = P.stone || {}, sx = (st.x ?? 0.26) * W, sw2 = 150, stAt = atOr(cues, st.at, 0), stp = lt >= stAt ? spring(lt, stAt, 0.7) : 0, shh = 300 * Math.max(0.001, stp);
            const stone = [[sx - sw2, G], [sx - sw2, G - shh * 0.72], [sx - sw2 * 0.7, G - shh * 0.94], [sx, G - shh], [sx + sw2 * 0.7, G - shh * 0.94], [sx + sw2, G - shh * 0.72], [sx + sw2, G]];
            S.stF.setAttribute('d', inkLoop(stone, O(50)));
            S.stR.setAttribute('d', inkPath(stone, O(50, { w: 7, closed: true })) + ' ' + inkPath([[sx - 90, G - shh * 0.42], [sx + 90, G - shh * 0.42]], O(51, { w: 3 })));
            S.stTx.forEach((tx2, i) => { const b = boil(sd + 52 + i, t, 0.8); tx2.setAttribute('opacity', stp > 0.6 ? 1 : 0); tx2.setAttribute('transform', `translate(${f1(sx + b[0])} ${f1(G - shh * (i === 0 ? 0.56 : 0.2) + b[1])})`); });
            if (stp <= 0) { S.stF.setAttribute('d', ''); S.stR.setAttribute('d', ''); }
            S.grass.setAttribute('d', grassT.map((g, i) => { const x = sx - 260 + g[0] * 520, h = 18 + g[1] * 26, s = Math.sin(lt * 1.5 + i) * 5; return inkPath([[x, G + 2], [x + s, G - h]], O(60 + i, { w: 3, amp: 0.8 })); }).join(' '));
          }

          updateCast(cast, lt, t, cues, W, H, G);
          if (carrier) {
            const cr = updateCast([carrier], lt, t, cues, W, H, G)[0], sc = cr.sc;
            const hs = cr.res.hands || [[40, -280], [60, -280]], arrived = lt >= atOr(cues, carrier.m.at, 1e9);
            const mx = (hs[0][0] + hs[1][0]) / 2 + (arrived ? 30 : 10), my = (hs[0][1] + hs[1][1]) / 2 - (arrived ? 64 : 20);
            const bx = cr.x + cr.face * sc * mx, by = cr.y + sc * my, bw = 100 * sc, bh = 70 * sc;
            const box = [[bx - bw, by - bh], [bx + bw, by - bh], [bx + bw, by + bh], [bx - bw, by + bh]];
            S.boxF.setAttribute('d', inkLoop(box, O(90, { smooth: false })));
            S.boxR.setAttribute('d', inkPath(box, O(90, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[bx - bw, by - bh * 0.3], [bx + bw, by - bh * 0.3]], O(91, { w: 3 })));
          }
          updateNote(label, lt, t, cues, W, H, sd + 7000);
        },
      };
    },
  };
  // the indoor views (glass case, lecture room) under their own type name
  SH.pgc_hall = { kind: '2d', build: ctx => SH.pgc_museum.build(Object.assign({}, ctx, { P: Object.assign({ mode: 'case' }, ctx.P) })) };
})();
