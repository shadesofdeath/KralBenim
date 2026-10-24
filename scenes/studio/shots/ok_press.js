// ok_press: the origin of "OK" (Boston 1839, the 1840 election) in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for
// ag-03-origin-of-ok (Stickstory), parametric. Five 2D shots; all take an optional narrator / cast member:
//   K = {x: 0..1 W, y: ground 0..1 H, scale, pose, face: "left"|"right", dir, emotion,
//        seq: [{at: cue|sec, pose, dir, face, emotion}], hat: true (narrator; false = period figure), accessory,
//        vanburen: true (mutton chops + bow tie, for Martin Van Buren)}
//
//   ok_page — a big 1830s newspaper sheet: masthead, date line, three columns of scribbled print, and red ink stamps
//     (initials) that slam onto it one by one, each with an optional handwritten note.
//     P: {masthead: "MORNING POST", date: "BOSTON, 1839", page: {x: 0.5, y: 0.39, w: 0.82, h: 0.42, rot: -2.5},
//         stamps: [{text: "O.K.", x: 0.5, y: 0.62 (0..1 of the page), size: 260, rot: -6, at, color: "red"|"ink"|"blue",
//                   ring: true, note: {text, dx, dy, size: 56}}], kasif: K | false, cam: {zoom: 1.06}}
//     cues: hit (shake + punch), stamps "at"
//
//   ok_press — a wooden hand press in a print shop: a pressman pulls the bar, the platen comes down, printed sheets
//     (with a small red mark) flutter up out of the press. P: {period: 1.5, mark: "O.K.", pressman: K, kasif: K, at}
//     cues: go (first pull), hit (punch)
//
//   ok_morph — words set in wooden type blocks; letters flip (swap) to a misspelling, then every letter falls away
//     except the initials, which slide together into a giant abbreviation.
//     P: {words: ["ALL", "CORRECT"], to: ["OLL", "KORRECT"] (same lengths), final: "O.K.", y: 0.22,
//         shrink_delay: 0 (s after the shrink cue), at: cue (blocks drop in; default 0), pre: "?" (big red mark shown until the blocks drop in), block: 130 (max px), final_x: 0.4, ground: 0.61 (back layer: type cases, desk, lamp), kasif: K}
//     cues: swap (letters flip), hl (initials turn red), shrink (others fall, initials join), hit
//
//   ok_rally — an 1840 street: brick houses behind, a speaker's platform with bunting (podium: {x, text, at}) and a
//     candidate on it (vb: K), a crowd that marches or cheers holding signs and a banner.
//     P: {podium: {x: 0.74, text: "VAN BUREN", y: 0.62} | false, vb: K | false,
//         crowd: {n: 5, walk: true, from: -0.15, speed: 120, y: 0.6 (ground), scale: 0.55, signs: ["O.K.", null, ...],
//                 banner: {text: "O.K. CLUB", between: [1, 2], at}, at} | false,
//         label: {text, x, y, size, at, color}, kasif: K, cam: {zoom}}   cues: hit, label.at, crowd.at
//
//   ok_world — a slowly turning ink globe; speech bubbles saying "OK" pop up around it, one after another.
//     P: {word: "OK", bubbles: 7, at: cue|sec (first bubble), every: 0.28, x, y, r, kasif: K,
//         vb: K (a period figure beside the globe, e.g. Van Buren), label: {text, x, y, size, at, color}}   cues: hit, at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const around = (x, y, tf) => `translate(${f1(x)} ${f1(y)}) ${tf} translate(${f1(-x)} ${f1(-y)})`;
  const tlen = (node, fb) => { let w = 0; try { w = node.getComputedTextLength(); } catch (e) { w = 0; } return w || fb; };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const rrect = (x, y, w, h, r) => {
    const out = [];
    for (const [cx, cy, a0] of [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]])
      for (let k = 0; k <= 2; k++) { const a = (a0 + k * 45) * Math.PI / 180; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  };

  // ------------------------------------------------------------- a cast member (narrator or period figure)
  // Van Buren's mutton chops, hair tufts and bow tie are drawn inside the rig node (rig-local units, mirrored with it).
  function figure(parent, K, sd, portrait) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    let vb = null;
    if (K.vanburen) {
      const n = rig.node;
      vb = { chF: inkEl(n, INK.inkSoft), chR: inkEl(n), tuft: inkEl(n), bow: inkEl(n, INK.red), bowR: inkEl(n) };
    }
    return {
      K,
      update(lt, t, cues, W, H, extra = {}) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        if (K.at != null && K.then) { const a = atOr(cues, K.at, null); if (a != null) segs.push({ at: a, pose: K.then, dir: K.then_dir ?? K.dir, emotion: K.then_emotion || K.emotion }); }
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const o = Object.assign({ x: (extra.x ?? K.x ?? 0.8) * W, y: (extra.y ?? K.y ?? 0.6) * H, face: faceOf(s.face ?? K.face, -1), since,
          dir: dirOf(extra.dir ?? s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: s.text ?? K.text }, extra.o || {});
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, extra.pose || s.pose || 'idle', o);
        if (vb && r) {
          const [hx, hy] = r.head, R = KASIF.LEN.head;
          const S = k => sd * 100 + k;
          const back = [[-58, -14], [-72, 4], [-72, 40], [-54, 70], [-30, 74], [-40, 46], [-46, 10]];
          const front = [[60, -10], [73, 10], [70, 44], [54, 68], [36, 66], [46, 40], [50, 8]];
          const P = q => q.map(p => [hx + p[0] * R / 72, hy + p[1] * R / 72]);
          vb.chF.setAttribute('d', inkLoop(P(back), { seed: S(91), t, amp: 1 }) + ' ' + inkLoop(P(front), { seed: S(92), t, amp: 1 }));
          vb.chR.setAttribute('d', inkPath(P(back), { w: 4, seed: S(93), t, closed: true, amp: 1 }) + ' ' + inkPath(P(front), { w: 4, seed: S(94), t, closed: true, amp: 1 }));
          vb.tuft.setAttribute('d', inkPath(P([[-50, -46], [-74, -40], [-62, -30], [-84, -22], [-64, -16]]), { w: 5, seed: S(95), t, amp: 1, taper: 0.5 }) + ' ' +
            inkPath(P([[54, -48], [76, -40], [64, -30], [82, -22]]), { w: 5, seed: S(96), t, amp: 1, taper: 0.5 }));
          const nx = hx + 4, ny = hy + R + 26;
          const bw = [[nx, ny], [nx - 34, ny - 16], [nx - 36, ny + 16]], be = [[nx, ny], [nx + 34, ny - 16], [nx + 36, ny + 16]];
          vb.bow.setAttribute('d', inkLoop(bw, { seed: S(97), t, amp: 0.8, smooth: false }) + ' ' + inkLoop(be, { seed: S(98), t, amp: 0.8, smooth: false }));
          vb.bowR.setAttribute('d', inkPath(bw, { w: 3.5, seed: S(99), t, closed: true, smooth: false, amp: 0.8 }) + ' ' + inkPath(be, { w: 3.5, seed: S(100), t, closed: true, smooth: false, amp: 0.8 }) + ' ' + inkDot(nx, ny, 8, 8, S(101), t));
        }
        return r;
      },
    };
  }

  // scribbled "print" lines (a column of fake text): returns path d
  function scribble(x0, y0, w, rows, lh, sd, t, upto = 1) {
    let d = '';
    const r = rng(inkHash(sd, 7));
    const n = Math.floor(rows * upto + 1e-6);
    for (let i = 0; i < n; i++) {
      const y = y0 + i * lh, ww = w * (i % 7 === 6 ? 0.55 : 0.82 + r() * 0.18);
      const pts = []; for (let k = 0; k <= 6; k++) pts.push([x0 + ww * k / 6, y + Math.sin(k * 2.1 + i) * 2.2]);
      d += inkPath(pts, { w: 4, seed: sd + i * 3, t, amp: 0.9, taper: 0.4 }) + ' ';
    }
    return d;
  }

  // ------------------------------------------------------------- ok_page
  SH.ok_page = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 311, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const PG = Object.assign({ x: 0.5, y: portrait ? 0.39 : 0.46, w: portrait ? 0.82 : 0.46, h: portrait ? 0.42 : 0.72, rot: -2.5 }, P.page || {});
      const pw = PG.w * W, ph = PG.h * H, px = PG.x * W - pw / 2, py = PG.y * H - ph / 2;
      const page = el(cam, 'g');
      const shadow = inkEl(page, rgba(INK.ink, 0.16)), sheetF = inkEl(page, INK.paperLight), sheetR = inkEl(page);
      const corner = inkEl(page, INK.paperDark);
      const mast = el(page, 'text', { x: px + pw / 2, y: py + 112, 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 96 : 84, 'text-anchor': 'middle', fill: INK.ink });
      mast.textContent = P.masthead ?? 'MORNING POST';
      let fs = parseFloat(mast.getAttribute('font-size'));
      while (fs > 50 && tlen(mast, 0) > pw - 90) { fs -= 4; mast.setAttribute('font-size', fs); }
      const rules = inkEl(page);
      const date = el(page, 'text', { x: px + pw / 2, y: py + 190, 'font-family': INK_FONT, 'font-size': portrait ? 50 : 46, 'text-anchor': 'middle', fill: INK.inkSoft });
      date.textContent = P.date ?? '';
      const cols = inkEl(page, INK.inkSoft);
      const colTop = py + 250, colH = ph - 290, ncol = 3, cg = 34, cw = (pw - 80 - cg * (ncol - 1)) / ncol;
      const stamps = (P.stamps || []).map((s, i) => {
        const g = el(cam, 'g');
        const size = s.size || (portrait ? 230 : 200), col = COL[s.color] || INK.red;
        const cx = px + (s.x ?? 0.5) * pw, cy = py + (s.y ?? 0.62) * ph;
        const ringF = inkEl(g, INK.paperLight), ring = inkEl(g, col);
        const tx = el(g, 'text', { x: cx, y: cy + size * 0.35, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: col });
        tx.textContent = s.text;
        const w = tlen(tx, s.text.length * size * 0.6);
        const splat = inkEl(g, col);
        let note = null;
        if (s.note) {
          const N = typeof s.note === 'string' ? { text: s.note } : s.note;
          const ng = el(g, 'g');
          const nx = cx + (N.dx ?? 0), ny = cy + size * 0.35 + (N.dy ?? 80);
          const nt = el(ng, 'text', { x: nx, y: ny, 'font-family': INK_FONT, 'font-size': N.size || 60, 'text-anchor': 'middle', fill: INK.ink });
          nt.textContent = N.text;
          const nw = tlen(nt, N.text.length * 26);
          const ul = inkEl(ng, col);
          note = { ng, nx, ny, nw, ul, N };
        }
        return { s, g, cx, cy, w, size, ringF, ring, splat, note, i };
      });
      const kas = figure(root, P.kasif === false ? null : Object.assign({ x: 0.8, y: portrait ? 0.6 : 0.9, scale: portrait ? 1.15 : 0.9, pose: 'talk', face: -1 }, P.kasif || {}), sd + 5, portrait);
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = atOr(cues, 'hit', null), hit = punch(lt, hitAt, 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur)));
          const sh = hit ? Math.sin(lt * 70) * 9 * hit : 0;
          const fx = W / 2, fy = H * 0.45;
          cam.setAttribute('transform', `translate(${f1(fx + sh + Math.sin(lt * 0.4) * 5)} ${f1(fy + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          page.setAttribute('transform', around(px + pw / 2, py + ph / 2, `rotate(${f1(PG.rot + Math.sin(lt * 0.5) * 0.4)})`));
          const sp = rect(px, py, pw, ph);
          shadow.setAttribute('d', inkLoop(sp.map(q => [q[0] + 12, q[1] + 16]), { seed: sd + 1, t, amp: 1.2, smooth: false }));
          sheetF.setAttribute('d', inkLoop(sp, { seed: sd + 2, t, amp: 1.2, smooth: false }));
          sheetR.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 3, t, closed: true, smooth: false, amp: 1.2 }));
          corner.setAttribute('d', inkLoop([[px + pw - 70, py + ph], [px + pw, py + ph - 70], [px + pw - 20, py + ph - 20]], { seed: sd + 4, t, amp: 1, smooth: false }));
          rules.setAttribute('d', inkPath([[px + 40, py + 140], [px + pw - 40, py + 138]], { w: 6, seed: sd + 5, t }) + ' ' +
            inkPath([[px + 40, py + 152], [px + pw - 40, py + 150]], { w: 3, seed: sd + 6, t }) + ' ' +
            inkPath([[px + 40, py + 214], [px + pw - 40, py + 212]], { w: 4, seed: sd + 7, t }) +
            [1, 2].map(c => ' ' + inkPath([[px + 40 + c * (cw + cg) - cg / 2, colTop], [px + 40 + c * (cw + cg) - cg / 2, colTop + colH]], { w: 3, seed: sd + 8 + c, t })).join(''));
          const wr = P.write === false ? 1 : prog(lt, 0, Math.max(0.8, dur * 0.8));
          let d = '';
          for (let c = 0; c < ncol; c++) d += scribble(px + 40 + c * (cw + cg), colTop + 10, cw, Math.floor(colH / 34), 34, sd + 50 + c * 40, t, clamp01(0.55 + wr * 0.45 - c * 0.05));
          cols.setAttribute('d', d);
          stamps.forEach(S => {
            const a = atOr(cues, S.s.at, 0.2 + S.i * 0.5), on = lt >= a;
            const p = on ? spring(lt, a, 0.45) : 0, pk = punch(lt, a, 0.5);
            S.g.setAttribute('opacity', on ? clamp01(lin(lt, a, 0.08)) : 0);
            const b = boil(sd + 70 + S.i, t, 1.2);
            S.g.setAttribute('transform', around(S.cx, S.cy, `translate(${f1(b[0])} ${f1(b[1])}) rotate(${f1((S.s.rot ?? -6) + (1 - p) * 8)}) scale(${f1(lerp(1.9, 1, p) * (1 + 0.07 * pk) * 1000) / 1000})`));
            if (S.s.ring !== false) {
              const rp = rrect(S.cx - S.w / 2 - 50, S.cy - S.size * 0.48, S.w + 100, S.size * 1.0, S.size * 0.2);
              S.ringF.setAttribute('d', inkLoop(rp, { seed: sd + 80 + S.i, t, amp: 1.5 }));
              S.ring.setAttribute('d', inkPath(rp, { w: 12, seed: sd + 81 + S.i, t, closed: true, amp: 2 }));
            }
            let sd2 = '';
            const r = rng(inkHash(sd + 90, S.i));
            for (let k = 0; k < 7; k++) {
              const ang = r() * 6.283, dist = S.w / 2 + 70 + r() * 70, rr = 6 + r() * 10;
              sd2 += inkDot(S.cx + Math.cos(ang) * dist, S.cy + Math.sin(ang) * dist * 0.55, rr, rr, sd + 100 + k, t) + ' ';
            }
            S.splat.setAttribute('d', on ? sd2 : '');
            if (S.note) {
              const na = atOr(cues, S.note.N.at, a + 0.45), np = lt >= na ? spring(lt, na, 0.5) : 0;
              S.note.ng.setAttribute('opacity', clamp01(np * 2));
              const u = lt >= na ? prog(lt, na + 0.15, 0.35) : 0, x0 = S.note.nx - S.note.nw / 2, y0 = S.note.ny + 16;
              S.note.ul.setAttribute('d', u > 0.02 ? inkPath([[x0, y0], [x0 + S.note.nw * u, y0 - 4]], { w: 6, seed: sd + 120 + S.i, t }) : '');
            }
          });
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------- ok_press
  SH.ok_press = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 521, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const G = portrait ? 1130 : 950;                         // ground line
      const cx = portrait ? 560 : 900, s = portrait ? 1 : 0.85;
      const X = v => cx + v * s, Y = v => G + v * s;             // press-local: x around the screw, y up from the ground (negative)
      const back = inkEl(cam, INK.inkSoft), win = inkEl(cam, INK.paperLight), winR = inkEl(cam, INK.inkSoft);
      const shelf = inkEl(cam, INK.inkSoft), cases = inkEl(cam, INK.paperDark);
      const floor = inkEl(cam);
      const frameF = inkEl(cam, INK.paperDark), frameR = inkEl(cam), grain = inkEl(cam, INK.inkSoft);
      const screw = inkEl(cam), platenF = inkEl(cam, INK.paperDark), platenR = inkEl(cam);
      const bedF = inkEl(cam, INK.paperDark), bedR = inkEl(cam), sheetOnBed = inkEl(cam, INK.paperLight), sheetOnBedR = inkEl(cam);
      const bar = inkEl(cam);
      const flyG = el(root, 'g');
      const N = 6, mark = P.mark ?? 'O.K.';
      const flyers = Array.from({ length: N }, (_, i) => {
        const g = el(flyG, 'g');
        const f = inkEl(g, INK.paperLight), r = inkEl(g), lines = inkEl(g, INK.inkSoft);
        const tx = el(g, 'text', { x: 0, y: 34, 'font-family': FR, 'font-weight': 900, 'font-size': 56, 'text-anchor': 'middle', fill: INK.red });
        tx.textContent = Array.isArray(mark) ? mark[i % mark.length] : mark;
        return { g, f, r, lines, i };
      });
      const press = figure(root, Object.assign({ hat: false, accessory: 'beret', x: (cx + 300 * s) / W, y: G / H, scale: portrait ? 0.95 : 0.8, pose: 'point', face: -1, emotion: 'happy' }, P.pressman || {}), sd + 9, portrait);
      const kas = figure(root, P.kasif === false ? null : Object.assign({ x: 0.13, y: G / H + 0.01, scale: portrait ? 0.85 : 0.75, pose: 'point', dir: 40, face: 1, emotion: 'happy' }, P.kasif || {}), sd + 5, portrait);
      const period = P.period || 1.5;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const go = atOr(cues, 'go', atOr(cues, P.at, 0.2));
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1.0, 1.07, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.015 * hit);
          const fx = cx, fy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          flyG.setAttribute('transform', cam.getAttribute('transform'));
          // pull cycle: 0..1 down-stroke strength
          const cyc = lt < go ? 0 : ((lt - go) / period) % 1;
          const pull = lt < go ? 0 : Math.max(0, Math.sin(Math.min(1, cyc / 0.5) * Math.PI));
          // back wall: window + type-case shelf
          const wx = portrait ? 690 : 1220, wy = portrait ? 330 : 170, ww = portrait ? 260 : 300, wh = portrait ? 260 : 240;
          win.setAttribute('d', inkLoop(rect(wx, wy, ww, wh), { seed: sd + 1, t, amp: 1, smooth: false }));
          winR.setAttribute('d', inkPath(rect(wx, wy, ww, wh), { w: 5, seed: sd + 2, t, closed: true, smooth: false }) + ' ' +
            inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { w: 4, seed: sd + 3, t }) + ' ' + inkPath([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], { w: 4, seed: sd + 4, t }));
          const shx = portrait ? 90 : 300, shy = portrait ? 420 : 300;
          shelf.setAttribute('d', inkPath([[shx, shy], [shx + 330, shy - 2]], { w: 7, seed: sd + 5, t }) + ' ' + inkPath([[shx, shy + 140], [shx + 330, shy + 138]], { w: 7, seed: sd + 6, t }));
          let cd = '';
          for (let k = 0; k < 4; k++) cd += inkLoop(rect(shx + 12 + k * 80, shy - 70 + (k % 2) * 8, 66, 66 - (k % 2) * 8), { seed: sd + 10 + k, t, amp: 1, smooth: false }) + ' ';
          for (let k = 0; k < 3; k++) cd += inkLoop(rect(shx + 30 + k * 100, shy + 70, 80, 66), { seed: sd + 20 + k, t, amp: 1, smooth: false }) + ' ';
          cases.setAttribute('d', cd);
          back.setAttribute('d', '');
          floor.setAttribute('d', inkPath([[0, G + 4], [W, G]], { w: 6, seed: sd + 30, t }) + ' ' + [0.1, 0.32, 0.55, 0.78].map((u, k) => inkPath([[u * W, G + 40], [u * W + 90, G + 38]], { w: 3.5, seed: sd + 31 + k, t, taper: 0.6 })).join(' '));
          // frame: two cheeks, head, winter, feet
          const cheekL = rect(X(-190), Y(-760), 56, 760), cheekR = rect(X(134), Y(-760), 56, 760);
          const head = rect(X(-230), Y(-800), 460, 96), winter = rect(X(-190), Y(-520), 380, 50), feet = rect(X(-260), Y(-30), 520, 30);
          const parts = [cheekL, cheekR, head, winter, feet];
          frameF.setAttribute('d', parts.map((q, k) => inkLoop(q, { seed: sd + 40 + k, t, amp: 1.2, smooth: false })).join(' '));
          frameR.setAttribute('d', parts.map((q, k) => inkPath(q, { w: 6, seed: sd + 45 + k, t, closed: true, smooth: false })).join(' '));
          grain.setAttribute('d', [[-170, -700, -170, -100], [160, -700, 160, -100], [-200, -770, 180, -772]].map((q, k) => inkPath([[X(q[0]), Y(q[1])], [X(q[2]), Y(q[3])]], { w: 2.5, seed: sd + 50 + k, t, taper: 0.7 })).join(' '));
          // screw + platen go down with the pull
          const drop = 46 * pull;
          let sdp = inkPath([[X(0), Y(-704)], [X(0), Y(-470 + drop)]], { w: 16, seed: sd + 60, t });
          for (let k = 0; k < 7; k++) { const yy = -690 + k * 30 + (drop * 0.6) % 30; sdp += ' ' + inkPath([[X(-16), Y(yy)], [X(16), Y(yy - 10)]], { w: 3, seed: sd + 61 + k, t }); }
          screw.setAttribute('d', sdp);
          const plat = rect(X(-130), Y(-470 + drop), 260, 50);
          platenF.setAttribute('d', inkLoop(plat, { seed: sd + 70, t, amp: 1, smooth: false }));
          platenR.setAttribute('d', inkPath(plat, { w: 6, seed: sd + 71, t, closed: true, smooth: false }));
          const bed = rect(X(-300), Y(-380), 560, 46);
          bedF.setAttribute('d', inkLoop(bed, { seed: sd + 72, t, amp: 1, smooth: false }));
          bedR.setAttribute('d', inkPath(bed, { w: 6, seed: sd + 73, t, closed: true, smooth: false }) + ' ' +
            inkPath([[X(-280), Y(-334)], [X(-280), Y(-30)]], { w: 7, seed: sd + 74, t }) + ' ' + inkPath([[X(240), Y(-334)], [X(240), Y(-30)]], { w: 7, seed: sd + 75, t }));
          const sb = rect(X(-120), Y(-396), 240, 16);
          sheetOnBed.setAttribute('d', inkLoop(sb, { seed: sd + 76, t, amp: 0.8, smooth: false }));
          sheetOnBedR.setAttribute('d', inkPath(sb, { w: 3, seed: sd + 77, t, closed: true, smooth: false }));
          // pressman: arm follows the bar (dir swings down on the pull)
          let hand = null;
          if (press) {
            const r = press.update(lt, t, cues, W, H, { pose: 'point', dir: lerp(28, -18, pull) });
            if (r) {
              const k = (press.K.scale ?? 0.95), fc = faceOf(press.K.face, -1);
              const h = r.hands[1];
              hand = [press.K.x * W + fc * h[0] * k, press.K.y * H + h[1] * k];
            }
          }
          const pv = [X(10), Y(-600 + drop * 0.6)];
          const end = hand || [X(280), Y(-560 + 120 * pull)];
          bar.setAttribute('d', inkPath([pv, [lerp(pv[0], end[0], 0.5), lerp(pv[1], end[1], 0.5) - 6], end], { w: 13, seed: sd + 80, t }) + ' ' + inkDot(pv[0], pv[1], 16, 16, sd + 81, t));
          // printed sheets flutter up and out of the press, one per pull
          flyers.forEach(F => {
            const n = lt < go ? -1 : Math.floor((lt - go) / period) - F.i * 0;
            // flyer i shows the sheet printed at pull number (current - i)
            const k = n - F.i, born = go + k * period + period * 0.5;
            const age = lt - born, life = 2.6;
            if (k < 0 || age < 0 || age > life) { F.g.setAttribute('opacity', 0); return; }
            const u = age / life, r = rng(inkHash(sd + 200, k));
            const tx = lerp(X(-140), X(-140) + (r() * 2 - 1) * 260 - 120, u), ty = lerp(Y(-420), (portrait ? 320 : 120) + r() * 120, 1 - Math.pow(1 - u, 1.6));
            const rot = (r() * 2 - 1) * 30 * u + Math.sin(age * 5 + k) * 12 * u;
            const sc = lerp(0.6, 1.05, clamp01(u * 2));
            F.g.setAttribute('opacity', clamp01((1 - u) * 4) * clamp01(age * 6));
            F.g.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) rotate(${f1(rot)}) scale(${f1(sc * 1000) / 1000})`);
            const sp = rect(-80, -100, 160, 200);
            F.f.setAttribute('d', inkLoop(sp, { seed: sd + 210 + k, t, amp: 1, smooth: false }));
            F.r.setAttribute('d', inkPath(sp, { w: 4, seed: sd + 211 + k, t, closed: true, smooth: false }));
            let dl = inkPath([[-60, -74], [60, -76]], { w: 7, seed: sd + 212 + k, t });
            for (let j = 0; j < 3; j++) dl += ' ' + inkPath([[-60, -46 + j * 16], [55 - (j % 2) * 20, -46 + j * 16]], { w: 3, seed: sd + 213 + j, t, taper: 0.5 });
            for (let j = 0; j < 2; j++) dl += ' ' + inkPath([[-60, 64 + j * 16], [50 - j * 24, 64 + j * 16]], { w: 3, seed: sd + 216 + j, t, taper: 0.5 });
            F.lines.setAttribute('d', dl);
          });
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------- ok_morph
  SH.ok_morph = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 731, portrait = H > W;
      const root = el(svg, 'g'), bg = el(root, 'g'), cam = el(root, 'g');
      // back layer: print-shop wall with a type-case shelf, a hanging lamp and a desk with a tilted type case
      const bgF = inkEl(bg, INK.paperDark), bgR = inkEl(bg, INK.inkSoft), bgL = inkEl(bg, INK.paperLight), floorL = inkEl(bg);
      const GY = (P.ground ?? (portrait ? 0.61 : 0.9)) * H;
      const words = (P.words || ['ALL', 'CORRECT']).map(w => String(w).toUpperCase());
      const to = (P.to || words).map(w => String(w).toUpperCase());
      const maxLen = Math.max(...words.map(w => w.length));
      const gap = 12, bw = Math.min(P.block || (portrait ? 130 : 170), ((portrait ? W - 110 : W * 0.7) - gap * (maxLen - 1)) / maxLen), bh = bw * 1.18;
      const y0 = (P.y ?? (portrait ? 0.155 : 0.2)) * H, rowGap = 36;
      const cxs = portrait ? W / 2 : W * 0.42;
      const fcx = (P.final_x ?? (portrait ? 0.4 : 0.42)) * W;
      const blocks = [];
      words.forEach((w, r) => {
        const rowW = w.length * bw + (w.length - 1) * gap;
        [...w].forEach((ch, c) => {
          const x = cxs - rowW / 2 + c * (bw + gap) + bw / 2, y = y0 + r * (bh + rowGap) + bh / 2;
          const g = el(cam, 'g');
          const sh = inkEl(g, rgba(INK.ink, 0.18)), f = inkEl(g, INK.paperLight), rr = inkEl(g), nick = inkEl(g, INK.inkSoft);
          const tx = el(g, 'text', { x, y: y + bw * 0.36, 'font-family': FR, 'font-weight': 900, 'font-size': bw * 0.98, 'text-anchor': 'middle', fill: INK.ink });
          tx.textContent = ch;
          const nch = (to[r] || w)[c] || ch;
          blocks.push({ g, sh, f, rr, nick, tx, ch, nch, changed: nch !== ch, keep: c === 0, x, y, r, c, k: blocks.length });
        });
      });
      const kept = blocks.filter(b => b.keep);
      const fin = String(P.final ?? kept.map(b => b.nch).join('.') + '.');
      // final layout: kept blocks scaled up, side by side, with dots after each
      const fs = portrait ? 1.75 : 1.6, fbw = bw * fs, dotW = fbw * 0.42;
      const totW = kept.length * fbw + kept.length * dotW;
      const enter = P.at;
      const pre = P.pre ? el(cam, 'text', { x: cxs, y: H * 0.36, 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 360 : 300, 'text-anchor': 'middle', fill: INK.red }) : null;
      if (pre) pre.textContent = P.pre;
      const fy = (P.final_y ?? (portrait ? 0.3 : 0.4)) * H;
      kept.forEach((b, i) => { b.fx = fcx - totW / 2 + i * (fbw + dotW) + fbw / 2; b.fy = fy; });
      const dots = kept.map((b, i) => ({ x: b.fx + fbw / 2 + dotW / 2, y: fy + fbw * 0.48 }));
      const dotG = inkEl(cam, INK.red);
      const under = inkEl(cam, INK.red);
      const kas = figure(root, P.kasif === false ? null : Object.assign({ x: 0.8, y: portrait ? 0.6 : 0.88, scale: portrait ? 0.85 : 0.75, pose: 'point', dir: 50, face: -1, emotion: 'happy' }, P.kasif || {}), sd + 5, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const swap = atOr(cues, 'swap', null), hl = atOr(cues, 'hl', null), shrink0 = atOr(cues, 'shrink', null), shrink = shrink0 == null ? null : shrink0 + (P.shrink_delay || 0);
          const hitAt = atOr(cues, 'hit', shrink != null ? shrink + 0.55 : null), hit = punch(lt, hitAt, 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = cxs, fyc = H * 0.4;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fyc + Math.cos(lt * 0.33) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fyc)})`);
          // back layer (slower parallax)
          bg.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.4) * 2 - lt * 4)} 0)`);
          {
            let f = '', r = '', l = '';
            const sx = portrait ? 40 : 120, sy = portrait ? GY - 470 : GY - 420;
            for (let k = 0; k < 3; k++) {            // type case drawers stacked on the left wall
              const q = rect(sx, sy + k * 120, 230, 100);
              f += inkLoop(q, { seed: sd + 500 + k, t, amp: 1, smooth: false }) + ' ';
              r += inkPath(q, { w: 4, seed: sd + 510 + k, t, closed: true, smooth: false }) + ' ' + inkDot(sx + 115, sy + k * 120 + 50, 14, 8, sd + 520 + k, t) + ' ';
            }
            const dx = portrait ? W - 330 : W - 520, dy = GY - 260;   // desk with a tilted case of sorts on the right
            const top = [[dx - 20, dy], [dx + 320, dy - 6], [dx + 330, dy + 26], [dx - 14, dy + 30]];
            f += inkLoop(top, { seed: sd + 530, t, amp: 1, smooth: false }) + ' ';
            r += inkPath(top, { w: 4, seed: sd + 531, t, closed: true, smooth: false }) + ' ' +
              inkPath([[dx, dy + 30], [dx + 6, GY]], { w: 5, seed: sd + 532, t }) + ' ' + inkPath([[dx + 300, dy + 26], [dx + 296, GY]], { w: 5, seed: sd + 533, t }) + ' ';
            const tray = [[dx + 10, dy - 6], [dx + 40, dy - 150], [dx + 300, dy - 160], [dx + 310, dy - 8]];
            l += inkLoop(tray, { seed: sd + 534, t, amp: 1, smooth: false }) + ' ';
            r += inkPath(tray, { w: 4, seed: sd + 535, t, closed: true, smooth: false }) + ' ';
            for (let k = 1; k < 4; k++) r += inkPath([[lerp(dx + 10, dx + 40, k / 4), lerp(dy - 6, dy - 150, k / 4)], [lerp(dx + 310, dx + 300, k / 4), lerp(dy - 8, dy - 160, k / 4)]], { w: 2.5, seed: sd + 540 + k, t }) + ' ';
            for (let k = 1; k < 6; k++) r += inkPath([[lerp(dx + 10, dx + 310, k / 6) + 12, dy - 8], [lerp(dx + 40, dx + 300, k / 6), dy - 154]], { w: 2.5, seed: sd + 550 + k, t }) + ' ';
            const lx = portrait ? W * 0.82 : W * 0.85, sw = Math.sin(t * 1.3) * 10;   // hanging oil lamp
            r += inkPath([[lx, 0], [lx + sw, portrait ? 300 : 120]], { w: 3, seed: sd + 560, t }) + ' ';
            const lamp = inkEllipsePts(lx + sw, (portrait ? 300 : 120) + 34, 34, 30, sd + 561, 10);
            l += inkLoop(lamp, { seed: sd + 562, t, amp: 1 }) + ' ';
            r += inkPath(lamp, { w: 4, seed: sd + 563, t, closed: true }) + ' ';
            bgF.setAttribute('d', f); bgR.setAttribute('d', r); bgL.setAttribute('d', l);
            floorL.setAttribute('d', inkPath([[-40, GY + 4], [W + 60, GY]], { w: 6, seed: sd + 570, t }) + ' ' + [0.12, 0.4, 0.66, 0.9].map((u, k) => inkPath([[u * W, GY + 44], [u * W + 80, GY + 42]], { w: 3.5, seed: sd + 571 + k, t, taper: 0.6 })).join(' '));
          }
          const ent = enter == null ? 0 : atOr(cues, enter, 0);
          if (pre) {
            const pa = spring(lt, 0.05, 0.6), out = clamp01((lt - ent) / 0.25), b = boil(sd + 600, t, 2);
            pre.setAttribute('opacity', clamp01(pa * 2) * (1 - out));
            pre.setAttribute('transform', around(cxs, H * 0.3, `translate(${f1(b[0])} ${f1(b[1])}) rotate(${f1(Math.sin(t * 3) * 6)}) scale(${f1(lerp(0.4, 1, pa) * (1 + 0.5 * out) * 1000) / 1000})`));
          }
          blocks.forEach(b => {
            const a = ent + 0.03 + b.k * 0.035, p = spring(lt, a, 0.55);
            let x = b.x, y = b.y - (1 - p) * 200, sc = 1, rot = Math.sin(b.k * 1.7) * 2, op = clamp01(lin(lt, a, 0.1)), flip = 1;
            // swap: the block flips over and shows its new letter in red
            let ch = b.ch, red = false;
            if (swap != null && b.changed) {
              const sa = swap + (b.c % 3) * 0.06, fp = clamp01((lt - sa) / 0.36);
              flip = Math.abs(Math.cos(fp * Math.PI)); if (fp > 0.5) { ch = b.nch; red = true; }
              if (fp > 0 && fp < 1) sc *= 1 + 0.12 * Math.sin(fp * Math.PI);
            }
            if (hl != null && b.keep && lt >= hl) { red = true; sc *= 1 + 0.15 * punch(lt, hl + b.r * 0.12, 0.6); }
            if (shrink != null && lt >= shrink) {
              const u = clamp01((lt - shrink) / 0.6);
              if (b.keep) {
                if (swap == null || !b.changed) ch = b.nch;
                const e = 1 - Math.pow(1 - u, 3);
                x = lerp(b.x, b.fx, e); y = lerp(b.y, b.fy, e); sc *= lerp(1, fs, e); red = true; rot = lerp(rot, 0, e);
              } else {
                const d = clamp01((lt - shrink - (b.k % 5) * 0.03) / 0.55);
                y += d * d * 700; x += (b.x < W / 2 ? -1 : 1) * d * 160; rot += d * (b.k % 2 ? 50 : -40); op *= 1 - clamp01(d * 2.2);
              }
            }
            if (b.tx.textContent !== ch) b.tx.textContent = ch;
            b.tx.setAttribute('fill', red ? INK.red : INK.ink);
            const bx = b.x - bw / 2, by = b.y - bh / 2;
            const q = rrect(bx, by, bw, bh, 12);
            b.sh.setAttribute('d', inkLoop(q.map(v => [v[0] + 7, v[1] + 9]), { seed: sd + 10 + b.k, t, amp: 1 }));
            b.f.setAttribute('d', inkLoop(q, { seed: sd + 11 + b.k, t, amp: 1 }));
            b.rr.setAttribute('d', inkPath(q, { w: red ? 7 : 5, seed: sd + 12 + b.k, t, closed: true, amp: 1.2 }));
            b.nick.setAttribute('d', inkDot(b.x, by + bh - 14, 12, 5, sd + 13 + b.k, t));
            b.g.setAttribute('opacity', op);
            const bo = boil(sd + 300 + b.k, t, 1);
            b.g.setAttribute('transform', `translate(${f1(x - b.x + bo[0])} ${f1(y - b.y + bo[1])}) ` + around(b.x, b.y, `rotate(${f1(rot)}) scale(${f1(sc * flip * 1000) / 1000} ${f1(sc * 1000) / 1000})`));
          });
          if (shrink != null && lt >= shrink + 0.45) {
            let dd = '';
            dots.forEach((d, i) => { const p = spring(lt, shrink + 0.45 + i * 0.12, 0.4), r = 20 * p; if (r > 0.5) dd += inkDot(d.x, d.y, r, r, sd + 400 + i, t) + ' '; });
            dotG.setAttribute('d', dd);
            const u = prog(lt, shrink + 0.75, 0.4), x0 = fcx - totW / 2 - 10, x1 = x0 + (totW + 20) * u, yy = fy + fbw * 0.85;
            under.setAttribute('d', u > 0.02 ? inkPath([[x0, yy], [lerp(x0, x1, 0.5), yy + 8], [x1, yy - 4]], { w: 14, seed: sd + 410, t, taper: 0.4 }) : '');
          } else { dotG.setAttribute('d', ''); under.setAttribute('d', ''); }
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------- ok_rally
  SH.ok_rally = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 941, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const far = el(cam, 'g'), mid = el(cam, 'g'), front = el(root, 'g');
      const houseF = inkEl(far, INK.paperDark), houseR = inkEl(far, INK.inkSoft), winD = inkEl(far, INK.inkSoft);
      const ground = inkEl(far);
      // podium
      const gy0 = (P.crowd && P.crowd.y != null ? P.crowd.y : (portrait ? 0.6 : 0.88)) * H;
      const PD = P.podium === false ? null : Object.assign({ x: 0.74, w: portrait ? 330 : 360, h: portrait ? 210 : 200, text: 'VAN BUREN' }, P.podium || {});
      if (PD && PD.y == null) PD.y = (gy0 - PD.h) / H;
      let pod = null;
      if (PD) {
        const g = el(mid, 'g');
        pod = { g, f: inkEl(g, INK.paperLight), r: inkEl(g), bR: inkEl(g, INK.red), bB: inkEl(g, INK.blue), legs: inkEl(g) };
        pod.tx = el(g, 'text', { x: PD.x * W, y: PD.y * H + PD.h * 0.62, 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 56 : 52, 'text-anchor': 'middle', fill: INK.ink });
        pod.tx.textContent = PD.text || '';
        let f = parseFloat(pod.tx.getAttribute('font-size'));
        while (f > 44 && tlen(pod.tx, 0) > PD.w - 30) { f -= 3; pod.tx.setAttribute('font-size', f); }
      }
      const vb = P.vb === false || !P.vb ? null : figure(mid, Object.assign({ hat: false, vanburen: true, x: PD ? PD.x : 0.7, y: PD ? PD.y : 0.6, scale: portrait ? 0.78 : 0.7, pose: 'wave', face: -1, emotion: 'happy' }, P.vb), sd + 21, portrait);
      // crowd
      const CR = P.crowd === false ? null : Object.assign({ n: 5, walk: true, from: -0.1, speed: 120, y: portrait ? 0.6 : 0.88, scale: portrait ? 0.55 : 0.5, signs: ['O.K.', null, null, 'O.K.', 'O.K.'], spacing: 0.2 }, P.crowd || {});
      const crowd = CR ? Array.from({ length: CR.n }, (_, i) => {
        const g = el(mid, 'g');
        const sign = el(g, 'g'), sf = inkEl(sign, INK.paperLight), sr = inkEl(sign), stick = inkEl(g);
        const s = (CR.signs || [])[i];
        const tx = el(sign, 'text', { x: 0, y: 22, 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 64 : 56, 'text-anchor': 'middle', fill: INK.red });
        tx.textContent = s || '';
        const fig = figure(g, { hat: false, accessory: (CR.acc || [])[i] || null, beard: (CR.beards || [])[i] || null, x: 0, y: CR.y, scale: CR.scale * (1 + ((i * 37) % 5 - 2) * 0.03), face: CR.walk ? 1 : faceOf((CR.faces || [])[i], 1), pose: CR.walk ? 'walk' : (CR.poses || [])[i] || 'wave', emotion: 'happy' }, sd + 40 + i * 7, portrait);
        return { g, sign, sf, sr, stick, tx, has: !!s, fig, i };
      }) : [];
      let banner = null;
      if (CR && CR.banner) {
        const g = el(null, 'g'); mid.insertBefore(g, crowd.length ? crowd[0].g : null);
        banner = { g, f: inkEl(g, INK.paperLight), r: inkEl(g), poles: inkEl(g), B: CR.banner };
        banner.tx = el(g, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 66 : 58, 'text-anchor': 'middle', fill: INK.blue });
        banner.tx.textContent = CR.banner.text || 'O.K. CLUB';
        banner.w = tlen(banner.tx, 300) + 60;
      }
      const L = P.label || null;
      let label = null;
      if (L) {
        label = el(front, 'text', { x: (L.x ?? 0.5) * W, y: (L.y ?? 0.22) * H, 'font-family': FR, 'font-weight': 900, 'font-size': L.size || 110, 'text-anchor': 'middle', fill: COL[L.color] || INK.red });
        label.textContent = L.text;
      }
      const kas = figure(front, P.kasif === false ? null : Object.assign({ x: 0.14, y: portrait ? 0.61 : 0.9, scale: portrait ? 0.9 : 0.75, pose: 'point', dir: 20, face: 1, emotion: 'happy' }, P.kasif || {}), sd + 5, portrait);
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      const gy = CR ? CR.y * H : gy0;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = W / 2, fy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          far.setAttribute('transform', `translate(${f1(-lt * 6)} 0)`);
          // far street: brick row houses
          const hb = gy - (portrait ? 40 : 30);
          let hf = '', hr = '', wd = '';
          for (let k = -1; k < 7; k++) {
            const x0 = k * (portrait ? 190 : 300), w = portrait ? 180 : 290, h = (portrait ? 420 : 380) + ((k * 53) % 3) * 50;
            const q = [[x0, hb], [x0, hb - h], [x0 + w * 0.5, hb - h - 70], [x0 + w, hb - h], [x0 + w, hb]];
            hf += inkLoop(q, { seed: sd + 60 + k, t, amp: 1, smooth: false }) + ' ';
            hr += inkPath(q, { w: 4, seed: sd + 70 + k, t, smooth: false }) + ' ';
            for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
              const wx = x0 + w * (0.22 + c * 0.38), wy = hb - h + 50 + r * 110;
              if (wy < hb - 90) wd += inkLoop(rect(wx, wy, w * 0.2, 64), { seed: sd + 80 + k * 9 + r * 2 + c, t, amp: 0.8, smooth: false }) + ' ';
            }
            for (let b = 0; b < 4; b++) hr += inkPath([[x0 + 10, hb - 40 - b * 22 - (k % 2) * 11], [x0 + 40, hb - 40 - b * 22 - (k % 2) * 11]], { w: 2.5, seed: sd + 120 + k * 4 + b, t }) + ' ';
          }
          houseF.setAttribute('d', hf); houseR.setAttribute('d', hr); winD.setAttribute('d', wd);
          ground.setAttribute('d', inkPath([[-60, gy + 2], [W + 260, gy]], { w: 6, seed: sd + 50, t }) + ' ' + [0.05, 0.3, 0.5, 0.72, 0.95].map((u, k) => inkPath([[u * W, gy + 40 + (k % 2) * 20], [u * W + 80, gy + 38 + (k % 2) * 20]], { w: 3.5, seed: sd + 51 + k, t, taper: 0.6 })).join(' '));
          if (pod) {
            const x = PD.x * W, y = PD.y * H, w = PD.w, h = PD.h;
            const pa = atOr(cues, PD.at, 0), pp = spring(lt, pa, 0.6);
            pod.g.setAttribute('opacity', clamp01(pp * 2));
            pod.g.setAttribute('transform', `translate(0 ${f1((1 - pp) * 60)})`);
            const q = rect(x - w / 2, y, w, h);
            pod.f.setAttribute('d', inkLoop(q, { seed: sd + 1, t, amp: 1, smooth: false }));
            pod.r.setAttribute('d', inkPath(q, { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
            // bunting: red / blue scallops along the top edge
            let br = '', bb = '';
            const n = 5, sw = w / n;
            for (let k = 0; k < n; k++) {
              const sx = x - w / 2 + k * sw, pts = [[sx, y + 4], [sx + sw * 0.25, y + 40], [sx + sw * 0.5, y + 50], [sx + sw * 0.75, y + 40], [sx + sw, y + 4]];
              (k % 2 ? bb += inkLoop(pts, { seed: sd + 3 + k, t, amp: 0.8 }) + ' ' : br += inkLoop(pts, { seed: sd + 3 + k, t, amp: 0.8 }) + ' ');
            }
            pod.bR.setAttribute('d', br); pod.bB.setAttribute('d', bb);
            pod.legs.setAttribute('d', inkPath([[x - w / 2 + 20, y + h], [x - w / 2 + 20, gy]], { w: 7, seed: sd + 9, t }) + ' ' + inkPath([[x + w / 2 - 20, y + h], [x + w / 2 - 20, gy]], { w: 7, seed: sd + 10, t }));
          }
          if (vb) vb.update(lt, t, cues, W, H);
          // crowd
          const ca = CR ? atOr(cues, CR.at, 0) : 0;
          const xs = crowd.map(c => {
            const base = (CR.from + c.i * CR.spacing) * W;
            const d = CR.walk ? Math.max(0, lt - ca) * CR.speed : 0;
            return base + d;
          });
          crowd.forEach((c, i) => {
            const k = CR.scale;
            const x = xs[i], dist = CR.walk ? Math.max(0, lt - ca) * CR.speed : 0;
            const ph = dist / (KASIF.gait('walk') * k) + i * 0.27;
            const r = c.fig.update(lt + i * 0.37, t + i * 0.37, cues, W, H, { x: x / W, o: CR.walk ? { ph } : {} });
            if (c.has && r) {
              const fc = CR.walk ? 1 : faceOf((CR.faces || [])[i], 1);
              const hd = r.head, hand = r.hands[1];
              const hx = x + fc * hand[0] * k, hy = CR.y * H + hand[1] * k;
              const sx = x + fc * 30 * k, sy = CR.y * H + hd[1] * k - 150 + Math.sin(t * 6 + i) * 6;
              const q = rect(-90, -55, 180, 110);
              c.sf.setAttribute('d', inkLoop(q, { seed: sd + 140 + i, t, amp: 0.9, smooth: false }));
              c.sr.setAttribute('d', inkPath(q, { w: 5, seed: sd + 150 + i, t, closed: true, smooth: false }));
              c.sign.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(${f1(Math.sin(t * 3 + i * 1.3) * 5)})`);
              c.stick.setAttribute('d', inkPath([[sx, sy + 55], [lerp(sx, hx, 0.6), lerp(sy + 55, hy, 0.6)], [hx, hy]], { w: 7, seed: sd + 160 + i, t }));
            } else { c.sign.setAttribute('opacity', 0); c.stick.setAttribute('d', ''); }
          });
          if (banner) {
            const [a, b] = banner.B.between || [1, 2];
            const ba = atOr(cues, banner.B.at, 0), bp = spring(lt, ba, 0.6);
            const xa = xs[a] ?? W * 0.3, xb = xs[b] ?? W * 0.6, top = CR.y * H - 540 * CR.scale - 210;
            const sag = Math.sin(t * 2.3) * 8;
            const q = [[xa, top], [(xa + xb) / 2, top + 10 + sag], [xb, top], [xb, top + 110], [(xa + xb) / 2, top + 124 + sag], [xa, top + 110]];
            banner.f.setAttribute('d', inkLoop(q, { seed: sd + 170, t, amp: 1 }));
            banner.r.setAttribute('d', inkPath(q, { w: 5, seed: sd + 171, t, closed: true, amp: 1 }));
            banner.poles.setAttribute('d', inkPath([[xa, top - 20], [xa, CR.y * H - 300 * CR.scale]], { w: 7, seed: sd + 172, t }) + ' ' + inkPath([[xb, top - 20], [xb, CR.y * H - 300 * CR.scale]], { w: 7, seed: sd + 173, t }));
            banner.tx.setAttribute('x', (xa + xb) / 2); banner.tx.setAttribute('y', top + 80 + sag * 0.6);
            let f = parseFloat(banner.tx.getAttribute('font-size'));
            while (f > 44 && tlen(banner.tx, 0) > Math.abs(xb - xa) - 30) { f -= 3; banner.tx.setAttribute('font-size', f); }
            banner.g.setAttribute('opacity', clamp01(bp * 2));
          }
          if (label) {
            const la = atOr(cues, L.at, 0.3), lp = lt >= la ? spring(lt, la, 0.5) : 0, b = boil(sd + 190, t, 1.2);
            label.setAttribute('opacity', clamp01(lp * 2));
            const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.22) * H;
            label.setAttribute('transform', around(x, y, `translate(${f1(b[0])} ${f1(b[1])}) rotate(${f1(-4 + (1 - lp) * 10)}) scale(${f1(lerp(1.8, 1, lp) * 1000) / 1000})`));
          }
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------- ok_world
  // very rough continents in [lon, lat]
  const LANDS = [
    [[-165, 65], [-140, 70], [-95, 72], [-75, 62], [-60, 55], [-65, 45], [-75, 38], [-81, 30], [-82, 25], [-97, 26], [-97, 20], [-87, 16], [-80, 8], [-105, 20], [-117, 32], [-124, 42], [-125, 50], [-150, 60]],
    [[-80, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-66, -55], [-74, -50], [-72, -30], [-70, -18], [-80, -5]],
    [[-10, 36], [-5, 43], [-2, 48], [5, 52], [10, 58], [20, 68], [40, 70], [70, 74], [110, 76], [140, 72], [175, 68], [160, 60], [140, 52], [130, 42], [122, 30], [110, 20], [100, 10], [92, 22], [80, 10], [72, 20], [60, 25], [50, 28], [44, 38], [36, 36], [28, 40], [20, 38], [12, 44], [5, 42]],
    [[-17, 21], [-10, 35], [10, 37], [32, 31], [35, 28], [43, 12], [51, 11], [40, -15], [32, -28], [20, -35], [12, -18], [9, 4], [-8, 5], [-15, 11]],
    [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [130, -32], [116, -34]],
  ];
  SH.ok_world = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 151, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cx = (P.x ?? (portrait ? 0.46 : 0.42)) * W, cy = (P.y ?? (portrait ? 0.38 : 0.48)) * H, R = P.r || (portrait ? 290 : 300);
      const shadow = inkEl(cam, rgba(INK.ink, 0.15)), sea = inkEl(cam, INK.paperLight), land = inkEl(cam, INK.paperDark), landR = inkEl(cam, INK.inkSoft), grid = inkEl(cam, INK.inkSoft), rim = inkEl(cam);
      const n = P.bubbles || 7, word = P.word || 'OK';
      const spots = [[-0.95, -0.75], [0.95, -0.85], [-1.12, 0.1], [1.08, 0.05], [-0.8, 0.85], [0.75, 0.9], [0.05, -1.22], [0.0, 1.2]];
      const bubbles = Array.from({ length: n }, (_, i) => {
        const g = el(root, 'g');
        const s = spots[i % spots.length], red = i % 3 === 1;
        const f = inkEl(g, red ? INK.red : INK.paperLight), r = inkEl(g);
        const tx = el(g, 'text', { x: 0, y: 26, 'font-family': FR, 'font-weight': 900, 'font-size': 76, 'text-anchor': 'middle', fill: red ? INK.paperLight : INK.ink });
        tx.textContent = word;
        return { g, f, r, i, bx: cx + s[0] * R, by: cy + s[1] * R };
      });
      const kas = figure(root, P.kasif === false ? null : Object.assign({ x: 0.85, y: portrait ? 0.6 : 0.88, scale: portrait ? 0.8 : 0.75, pose: 'wave', face: -1, emotion: 'happy' }, P.kasif || {}), sd + 5, portrait);
      const vbf = P.vb ? figure(root, Object.assign({ hat: false, vanburen: true, x: 0.16, y: portrait ? 0.6 : 0.88, scale: portrait ? 0.75 : 0.7, pose: 'idle', face: 1, emotion: 'worried' }, P.vb), sd + 31, portrait) : null;
      const L = P.label || null;
      let label = null;
      if (L) {
        label = el(root, 'text', { x: (L.x ?? 0.2) * W, y: (L.y ?? 0.2) * H, 'font-family': FR, 'font-weight': 900, 'font-size': L.size || 90, 'text-anchor': 'middle', fill: COL[L.color] || INK.red });
        label.textContent = L.text;
      }
      const proj = (lon, lat, rot) => {
        const l = (lon - rot) * Math.PI / 180, p = lat * Math.PI / 180;
        let x = Math.cos(p) * Math.sin(l), z = Math.cos(p) * Math.cos(l);
        const y = -Math.sin(p);
        if (z < 0) { const k = Math.sqrt(Math.max(0, 1 - y * y)) / (Math.abs(x) || 1e-6); x = Math.sign(x || 1) * Math.sqrt(Math.max(0, 1 - y * y)); }
        return [cx + x * R, cy + y * R * 0.98, z];
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', around(cx, cy, `scale(${z.toFixed(4)}) rotate(${f1(Math.sin(lt * 0.5) * 1.5)})`));
          const rot = -80 + lt * 26;
          const disc = inkEllipsePts(cx, cy, R, R * 0.98, sd + 1, 28);
          shadow.setAttribute('d', inkLoop(disc.map(q => [q[0] + 14, q[1] + 18]), { seed: sd + 2, t, amp: 1.2 }));
          sea.setAttribute('d', inkLoop(disc, { seed: sd + 3, t, amp: 1.2 }));
          rim.setAttribute('d', inkPath(disc, { w: 7, seed: sd + 4, t, closed: true, amp: 1.4 }));
          let lf = '', lr = '';
          LANDS.forEach((poly, k) => {
            const dense = [];
            for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; for (let j = 0; j < 3; j++) dense.push([lerp(a[0], b[0], j / 3), lerp(a[1], b[1], j / 3)]); }
            const pts = dense.map(q => proj(q[0], q[1], rot));
            if (pts.every(q => q[2] < 0)) return;
            const pp = pts.map(q => [q[0], q[1]]);
            lf += inkLoop(pp, { seed: sd + 10 + k, t, amp: 1 }) + ' ';
            lr += inkPath(pp, { w: 4, seed: sd + 20 + k, t, closed: true, amp: 1 }) + ' ';
          });
          land.setAttribute('d', lf); landR.setAttribute('d', lr);
          let gd = '';
          for (let k = 0; k < 6; k++) {
            const lon = ((k * 30 - rot) % 180 + 180) % 180 - 90, rx = Math.abs(Math.sin(lon * Math.PI / 180)) * R;
            if (rx > 6) gd += inkPath(inkEllipsePts(cx, cy, rx, R * 0.98, sd + 30 + k, 20), { w: 2.5, seed: sd + 30 + k, t, closed: true, amp: 1 }) + ' ';
          }
          for (const la of [-0.5, 0, 0.5]) gd += inkPath([[cx - Math.sqrt(1 - la * la) * R, cy + la * R], [cx + Math.sqrt(1 - la * la) * R, cy + la * R]], { w: 2.5, seed: sd + 40 + la * 10, t, amp: 1 }) + ' ';
          grid.setAttribute('d', gd);
          const a0 = atOr(cues, P.at, 0.25), every = P.every || 0.28;
          bubbles.forEach(B => {
            const a = a0 + B.i * every, p = lt >= a ? spring(lt, a, 0.5) : 0;
            B.g.setAttribute('opacity', clamp01(p * 3));
            const bo = boil(sd + 60 + B.i, t, 1.5), bob = Math.sin(t * 2.2 + B.i) * 6;
            const tailDir = [cx - B.bx, cy - B.by], tl = Math.hypot(tailDir[0], tailDir[1]) || 1;
            const ux = tailDir[0] / tl, uy = tailDir[1] / tl;
            const q = inkEllipsePts(0, 0, 110, 72, sd + 70 + B.i, 14);
            const tip = [ux * 130, uy * 110], bL = [ux * 60 - uy * 30, uy * 50 + ux * 30], bR = [ux * 60 + uy * 30, uy * 50 - ux * 30];
            B.f.setAttribute('d', inkLoop(q, { seed: sd + 80 + B.i, t, amp: 1 }) + ' ' + inkLoop([bL, tip, bR], { seed: sd + 90 + B.i, t, amp: 0.8, smooth: false }));
            B.r.setAttribute('d', inkPath(q, { w: 5, seed: sd + 100 + B.i, t, closed: true, amp: 1 }) + ' ' + inkPath([bL, tip, bR], { w: 5, seed: sd + 110 + B.i, t, amp: 0.8, smooth: false }));
            B.g.setAttribute('transform', `translate(${f1(B.bx + bo[0])} ${f1(B.by + bo[1] + bob)}) rotate(${f1((B.i % 2 ? 6 : -6) + (1 - p) * 20)}) scale(${f1(lerp(0.3, 1, p) * 1000) / 1000})`);
          });
          if (vbf) vbf.update(lt, t, cues, W, H);
          if (label) {
            const la = atOr(cues, L.at, 0.3), lp = lt >= la ? spring(lt, la, 0.5) : 0, b = boil(sd + 190, t, 1.2);
            const x = (L.x ?? 0.2) * W, y = (L.y ?? 0.2) * H;
            label.setAttribute('opacity', clamp01(lp * 2));
            label.setAttribute('transform', around(x, y, `translate(${f1(b[0])} ${f1(b[1])}) rotate(${f1(-5 + (1 - lp) * 10)}) scale(${f1(lerp(1.8, 1, lp) * 1000) / 1000})`));
          }
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
