// ag03_battle: bird's-eye parchment battlefield (Malazgirt 1071, brand/kit/BRAND.md §3, §5): rolling hills drawn as
// boiling contour rings, a top-down tent camp, Byzantine units as red blocks (rows of soldiers, a banner, a big ink
// direction arrow that can swing round), Seljuk horse archers as blue chevron riders in loose formations, arrow
// volleys flying in arcs and sticking into the blocks, the feigned retreat / crescent drawn as a red arc that can
// close into a ring, a reserve block that is "erased" as it withdraws, blocks that burst into fleeing dots (panic),
// riders that change sides, an optional herd of deer (the hunting crescent), hand-written labels, a pill badge and
// the narrator (Kaşif / fez) small on a hill in the corner. Every unit moves along cue-bound key frames.
// P: {units: [{id, side: "byz"|"sel", kind: "block"|"riders", x, y (0..1), face: 0 (deg, 0 = right, 90 = down),
//        w: 190, h: 96 (block px), n: 7 (riders), spread: 1 (formation size), moves: [{at, x, y, dur: 1.2, face}],
//        appear: cue (spring in; omit = there from the start), fade: {at, dur: 1.6} (withdraw: outline erased, fill
//        pales), scatter: cue (block bursts into fleeing dots), defect: cue (riders switch to the other side's colour),
//        banner: true | {turn: cue} (flag on the block, swings round on the cue), arrow: true | {len: 150, reverse: cue}
//        (ink direction arrow in front of the block; reverse = it swings 180°)}],
//     volleys: [{from: id, to: id, at, n: 14, dur: 0.9, waves: 2, gap: 0.8}] (arrows fly in arcs and stick),
//     crescent: {at, cx, cy (0..1), r: 280, a0: -125, a1: 125 (deg, 0 = right), dur: 1.1, close: cue (grows to a full
//       ring and thickens), color: "red"|"blue"},
//     herd: {x, y, n: 9, spread: 1, moves: [...]} (deer pictograms for the hunt),
//     hills: [{x, y, r}] | false (default: three hills, clear of the top-left kicker), camp: {x, y, n: 9, r: 120} | false,
//     labels: [{text, x, y, at, color: "ink"|"red"|"blue", size: 56, rot}], pill: {text, at, color: "blue", x: 0.5, y: 0.13},
//     shake: cue, kasif: {x: 0.9, y: 0.86, scale: 0.5, face: -1, pose: "look", dir, emotion, seq: [{at, pose, dir,
//       face, emotion}], hill: true} | false, cam: {zoom: 1.05, focus: [0.5, 0.5]}}
// cues: whatever names moves/volleys/crescent/labels/seq use (all optional; sensible fallbacks by time).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, green: INK.green, gold: INK.gold };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : -1);
  const rad = d => d * Math.PI / 180;
  const rotP = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };

  // position/face of a moving thing at lt: start values then each move eases in turn
  function track(o, lt, cues, W, H, fbBase = 0.4) {
    let x = o.x * W, y = o.y * H, face = o.face ?? 0, moving = 0;
    (o.moves || []).forEach((m, i) => {
      const a = atOr(cues, m.at, fbBase + i * 1.5), d = m.dur ?? 1.2, p = progIO(lt, a, d);
      if (lt > a && lt < a + d) moving = 1;
      if (m.x != null) x = lerp(x, m.x * W, p);
      if (m.y != null) y = lerp(y, m.y * H, p);
      if (m.face != null) {
        let df = m.face - face; while (df > 180) df -= 360; while (df < -180) df += 360;
        face = face + df * progIO(lt, a, Math.min(0.7, d));
      }
    });
    return { x, y, face, moving };
  }

  SH.ag03_battle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 731, r = rng(seed * 13 + 5);
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);

      // ------------------------------------------------ terrain
      const terr = el(cam, 'g');
      const grassR = mk(terr, INK.inkSoft, { 'fill-opacity': 0.55 });
      const grass = [];
      for (let i = 0; i < 70; i++) grass.push([r() * W, 140 + r() * (H - 200), r()]);
      const hills = P.hills === false ? [] : (P.hills || [{ x: 0.1, y: 0.56, r: 130 }, { x: 0.86, y: 0.12, r: 170 }, { x: 0.52, y: 0.06, r: 150 }]);
      const hillG = hills.map(() => ({ f: mk(terr, INK.paperDark, { 'fill-opacity': 0.55 }), r: mk(terr, INK.inkSoft) }));
      const C = P.camp === false ? null : (P.camp || null);
      const campF = C ? mk(terr, INK.paperLight) : null, campR = C ? mk(terr, INK.inkSoft) : null, campP = C ? mk(terr, INK.red) : null;
      const tents = [];
      if (C) {
        const n = C.n ?? 9, cr = C.r ?? 120;
        for (let i = 0; i < n; i++) { const a = i * 2.4 + r() * 0.5, d = cr * Math.sqrt((i + 0.5) / n); tents.push([C.x * W + Math.cos(a) * d, C.y * H + Math.sin(a) * d * 0.8, 20 + r() * 8]); }
      }

      // ------------------------------------------------ units
      const unitsG = el(cam, 'g');
      const crescG = el(cam, 'g'), crescR = mk(crescG, COL[(P.crescent || {}).color] || INK.red);
      const units = (P.units || []).map((u, i) => {
        const g = el(unitsG, 'g');
        const o = { u, i, g, kind: u.kind || (u.side === 'sel' ? 'riders' : 'block') };
        o.trail = mk(g, INK.inkSoft, { 'fill-opacity': 0.35 });
        if (o.kind === 'block') {
          o.fill = mk(g, INK.red); o.dots = mk(g, INK.paperLight); o.ring = mk(g); o.sticks = mk(g);
          o.flagF = mk(g, INK.red); o.flagR = mk(g); o.arrow = mk(g);
          o.burst = mk(g, INK.red); o.burstR = mk(g);
          const rr = rng(sd + i * 77);
          o.bd = []; for (let k = 0; k < 26; k++) o.bd.push([rr() - 0.5, rr() - 0.5, rr() * Math.PI * 2, 0.6 + rr()]);
        } else {
          o.fillB = mk(g, INK.blue); o.fillR = mk(g, INK.red); o.ring = mk(g);
          const n = u.n ?? 7, rr = rng(sd + i * 91), sp = u.spread ?? 1;
          o.off = [];
          for (let k = 0; k < n; k++) {
            const row = k % 3, col = Math.floor(k / 3);
            o.off.push([(-col * 50 - (row === 1 ? 0 : 22) + (rr() - 0.5) * 14) * sp, ((row - 1) * 46 + (rr() - 0.5) * 16) * sp, rr() * 6]);
          }
        }
        return o;
      });
      const byId = {}; units.forEach(o => { if (o.u.id) byId[o.u.id] = o; });

      // herd (deer pictograms)
      const Hd = P.herd || null, herdF = Hd ? mk(unitsG, INK.paperLight) : null, herdR = Hd ? mk(unitsG) : null;
      const deer = [];
      if (Hd) { const rr = rng(sd + 555), sp = Hd.spread ?? 1; for (let k = 0; k < (Hd.n ?? 9); k++) deer.push([(rr() - 0.5) * 220 * sp, (rr() - 0.5) * 150 * sp, rr() * 6, rr() < 0.5 ? 1 : -1]); }

      // volleys
      const arrowsR = mk(cam, INK.ink);
      const vols = (P.volleys || []).map((v, vi) => {
        const rr = rng(sd + 900 + vi * 37), list = [];
        const n = v.n ?? 14, waves = v.waves ?? 2;
        for (let w = 0; w < waves; w++) for (let k = 0; k < n; k++) list.push({ w, k, s: rr(), e: [(rr() - 0.5) * 0.8, (rr() - 0.5) * 0.7], lift: 50 + rr() * 50, dl: rr() * 0.35 });
        return { v, list };
      });

      // labels + pill
      const ui = el(root, 'g');
      const labels = (P.labels || []).map(L => {
        const t = el(ui, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 56, 'text-anchor': 'middle', fill: COL[L.color] || INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = L.text; return { L, t };
      });
      const PL = P.pill || null;
      let pill = null;
      if (PL) {
        const g = el(ui, 'g'), f = mk(g, COL[PL.color] || INK.blue), rr2 = mk(g);
        const t = el(g, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': PL.size || 64, 'text-anchor': 'middle', fill: INK.paperLight });
        t.textContent = PL.text; pill = { g, f, rr: rr2, t, w: 0 };
      }

      // narrator on a hill
      const K = P.kasif === false ? null : Object.assign({ x: 0.9, y: 0.86, scale: 0.5, pose: 'look', face: -1, hill: true }, P.kasif || {});
      const kHill = K && K.hill ? { f: mk(root, INK.paperDark), r: mk(root, INK.inkSoft) } : null;
      const kG = el(root, 'g');
      const kas = K ? KASIF.create(el(kG, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      let lastStep = -1, curT = 0, curCues = null;
      function volleys(lt) {
          const t = curT, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x), cues = curCues;
          let ad = '';
          vols.forEach((V, vi) => {
            const v = V.v, src = byId[v.from], dst = byId[v.to];
            if (!src || !dst || !src.tr || !dst.tr) return;
            const a0 = atOr(cues, v.at, 0.8), fl = v.dur ?? 0.9;
            V.list.forEach(ar => {
              const la = a0 + ar.w * (v.gap ?? 0.8) + ar.dl, p = (lt - la) / fl;
              if (p < 0) return;
              const of = src.off ? src.off[Math.floor(ar.s * src.off.length)] : [0, 0];
              const so = rotP(of[0], of[1], rad(src.tr.face));
              const sx = src.tr.x + so[0], sy = src.tr.y + so[1];
              const dw = dst.kind === 'block' ? (dst.u.w ?? 190) : 120, dh = dst.kind === 'block' ? (dst.u.h ?? 96) : 100;
              const eo = rotP(ar.e[0] * dw, ar.e[1] * dh, rad(dst.tr.face)), ex = dst.tr.x + eo[0], ey = dst.tr.y + eo[1];
              if (p >= 1) { if (dst.stuck) dst.stuck.push([ar.e[0], ar.e[1], ar.s < 0.5 ? -1 : 1]); return; }
              const P0 = (q) => [lerp(sx, ex, q), lerp(sy, ey, q) - Math.sin(Math.PI * q) * ar.lift];
              const A1 = P0(p), A2 = P0(Math.max(0, p - 0.08)), an = Math.atan2(A1[1] - A2[1], A1[0] - A2[0]);
              const tail = [A1[0] - Math.cos(an) * 34, A1[1] - Math.sin(an) * 34];
              ad += inkPath([tail, A1], O(1500 + vi * 100 + ar.k + ar.w * 40, { w: 3.5, amp: 0.6 })) + ' ' +
                inkPath([[A1[0] - Math.cos(an - 0.6) * 11, A1[1] - Math.sin(an - 0.6) * 11], A1, [A1[0] - Math.cos(an + 0.6) * 11, A1[1] - Math.sin(an + 0.6) * 11]], O(1700 + ar.k, { w: 3, smooth: false, amp: 0.5 })) + ' ';
            });
          });
          return ad;
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step; curT = t; curCues = cues;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          // camera: slow push + optional shake
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur)));
          const fc = Cm.focus || [0.5, 0.5], fx = fc[0] * W, fy = fc[1] * H;
          const sa = atOr(cues, P.shake, null), sk = sa != null && lt >= sa ? Math.exp(-(lt - sa) * 4) * 14 : 0;
          const shx = sk * Math.sin(lt * 61), shy = sk * Math.cos(lt * 47);
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.33) * 6 + shx)} ${f1(fy + Math.cos(lt * 0.27) * 4 + shy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // terrain (boils at 8 Hz)
          if (redraw || lt < 0.05) {
            grassR.setAttribute('d', grass.map((g, i) => inkPath([[g[0], g[1]], [g[0] + 6 + g[2] * 6, g[1] - 14 - g[2] * 6]], O(10 + i, { w: 3, amp: 0.8 })) + ' ' +
              inkPath([[g[0] + 12, g[1]], [g[0] + 14, g[1] - 12]], O(90 + i, { w: 2.5, amp: 0.8 }))).join(' '));
            hills.forEach((h, i) => {
              const cx = h.x * W, cy = h.y * H, R = h.r ?? 160;
              hillG[i].f.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, R, R * 0.62, sd + 200 + i, 14), O(200 + i)));
              let d = '';
              for (let q = 0; q < 3; q++) d += inkPath(inkEllipsePts(cx, cy, R * (1 - q * 0.3), R * 0.62 * (1 - q * 0.3), sd + 210 + i * 5 + q, 14, 0, 0.06), O(210 + i * 5 + q, { closed: true, w: q ? 3 : 4 })) + ' ';
              for (let q = 0; q < 9; q++) {             // hachures down the slope
                const a = q / 9 * Math.PI * 2, x0 = cx + Math.cos(a) * R * 0.72, y0 = cy + Math.sin(a) * R * 0.62 * 0.72;
                d += inkPath([[x0, y0], [x0 + Math.cos(a) * R * 0.2, y0 + Math.sin(a) * R * 0.13]], O(240 + i * 11 + q, { w: 2.5, amp: 0.8 })) + ' ';
              }
              hillG[i].r.setAttribute('d', d);
            });
            if (C) {
              let f = '', rr = '', pp = '';
              tents.forEach((tt, i) => {
                const [x, y, s] = tt;
                f += inkLoop(inkEllipsePts(x, y, s, s, sd + 300 + i, 9), O(300 + i)) + ' ';
                rr += inkPath(inkEllipsePts(x, y, s, s, sd + 300 + i, 9), O(330 + i, { closed: true, w: 3.5 })) + ' ';
                for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + 0.4; rr += inkPath([[x, y], [x + Math.cos(a) * s, y + Math.sin(a) * s]], O(360 + i * 4 + q, { w: 2, amp: 0.6 })) + ' '; }
                if (i % 3 === 0) pp += inkLoop([[x, y - s - 34], [x + 26, y - s - 26], [x, y - s - 18]], O(420 + i, { smooth: false })) + ' ';
                if (i % 3 === 0) rr += inkPath([[x, y - s * 0.2], [x, y - s - 36]], O(440 + i, { w: 3 })) + ' ';
              });
              campF.setAttribute('d', f); campR.setAttribute('d', rr); campP.setAttribute('d', pp);
            }
          }

          // units: positions first (volleys need them), then arrows, then drawing
          units.forEach(o => { o.tr = track(o.u, lt, cues, W, H, 0.4 + o.i * 0.2); o.stuck = []; });
          const arrowD = volleys(lt);
          units.forEach(o => {
            const u = o.u, tr = o.tr;
            const ap = u.appear != null ? atOr(cues, u.appear, 0.5) : null;
            const sp = ap == null ? 1 : (lt >= ap ? spring(lt, ap, 0.7) : 0);
            o.g.style.display = sp <= 0.001 ? 'none' : '';
            if (sp <= 0.001) return;
            const a = rad(tr.face), Q = (k, x) => O(1000 + o.i * 97 + k, x);
            // dust trail while moving
            o.trail.setAttribute('d', tr.moving ? [0, 1, 2].map(q => {
              const b = rotP(-(o.kind === 'block' ? (u.w ?? 190) / 2 + 40 : 120) - q * 34, (q - 1) * 30, a);
              return inkLoop(inkEllipsePts(tr.x + b[0], tr.y + b[1], 18 + q * 6, 14 + q * 4, sd + o.i * 7 + q, 8), Q(5 + q));
            }).join(' ') : '');
            if (o.kind === 'block') {
              const w = (u.w ?? 190) * sp, h = (u.h ?? 96) * sp;
              const F = u.fade || null, fa = F ? atOr(cues, F.at, dur * 0.4) : null, fp = F && lt >= fa ? progIO(lt, fa, F.dur ?? 1.6) : 0;
              const sc = u.scatter != null ? atOr(cues, u.scatter, null) : null, bp = sc != null && lt >= sc ? prog(lt, sc, 1.6) : 0;
              const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(c => { const q = rotP(c[0], c[1], a); return [tr.x + q[0], tr.y + q[1]]; });
              const solid = (1 - fp * 0.8) * (1 - bp);
              o.fill.setAttribute('d', solid > 0.02 ? inkLoop(corners, Q(1, { smooth: false })) : '');
              o.fill.setAttribute('fill-opacity', f1(0.88 * solid * 100) / 100);
              // soldiers: rows of light dots
              let dd = '';
              if (solid > 0.05) {
                for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 6; rx++) {
                  const q = rotP((rx - 2.5) * w / 7, (ry - 1) * h / 3.6, a);
                  dd += inkDot(tr.x + q[0], tr.y + q[1], 7 * sp, 7 * sp, sd + o.i * 50 + ry * 6 + rx, t) + ' ';
                }
              }
              o.dots.setAttribute('d', dd); o.dots.setAttribute('fill-opacity', f1(solid * 100) / 100);
              // outline: erased progressively while withdrawing
              const ringPts = inkLinear(corners, true, 18), keep = Math.max(0, Math.round(ringPts.length * (1 - fp)));
              o.ring.setAttribute('d', bp < 0.6 && keep > 2 ? inkPath(ringPts.slice(0, keep), Q(2, { w: 6, smooth: false, closed: fp < 0.01 })) : '');
              // arrows stuck in it
              const st = o.stuck || [];
              o.sticks.setAttribute('d', bp < 0.3 ? st.map((s, k) => {
                const q = rotP(s[0] * w, s[1] * h, a), x = tr.x + q[0], y = tr.y + q[1];
                return inkPath([[x, y], [x + s[2] * 18, y - 20]], Q(300 + k, { w: 3, amp: 0.6 }));
              }).join(' ') : '');
              // banner on the block (swings round on its cue)
              if (u.banner && bp < 0.5) {
                const B = typeof u.banner === 'object' ? u.banner : {};
                const ta = B.turn != null ? atOr(cues, B.turn, null) : null, tp = ta != null ? progIO(lt, ta, 0.6) : 0;
                const fl = lerp(1, -1, tp) * (1 + 0.15 * punch(lt, ta, 0.5));
                const q = rotP(w * 0.15, -h / 2, a), bx = tr.x + q[0], by = tr.y + q[1] - 6;
                const wv = Math.sin(t * 7) * 6;
                const flag = [[bx, by - 96], [bx + 70 * fl, by - 84 + wv], [bx + 58 * fl, by - 70], [bx + 74 * fl, by - 56 + wv * 0.6], [bx, by - 54]];
                o.flagF.setAttribute('d', inkLoop(flag, Q(20)));
                o.flagR.setAttribute('d', inkPath(flag, Q(21, { closed: true, w: 3.5 })) + ' ' + inkPath([[bx, by + 10], [bx, by - 100]], Q(22, { w: 6 })));
              } else { o.flagF.setAttribute('d', ''); o.flagR.setAttribute('d', ''); }
              // big direction arrow in front
              if (u.arrow && bp < 0.3) {
                const A = typeof u.arrow === 'object' ? u.arrow : {};
                const ra = A.reverse != null ? atOr(cues, A.reverse, null) : null, rp = ra != null ? progIO(lt, ra, 0.7) : 0;
                const len = A.len ?? 150, aa = a + rp * Math.PI;
                const base = rotP(w / 2 + 30, 0, a), sx = tr.x + base[0] * (1 - rp) + rotP(-w / 2 - 30, 0, a)[0] * rp, sy = tr.y + base[1] * (1 - rp) + rotP(-w / 2 - 30, 0, a)[1] * rp;
                const tip = [sx + Math.cos(aa) * len, sy + Math.sin(aa) * len], hk = 34;
                const pk = 1 + 0.25 * punch(lt, ra, 0.6);
                o.arrow.setAttribute('d', inkPath([[sx, sy], [lerp(sx, tip[0], 0.5), lerp(sy, tip[1], 0.5) + Math.sin(aa) * 4], tip], Q(30, { w: 10 * pk })) + ' ' +
                  inkPath([[tip[0] - Math.cos(aa - 0.55) * hk * pk, tip[1] - Math.sin(aa - 0.55) * hk * pk], tip, [tip[0] - Math.cos(aa + 0.55) * hk * pk, tip[1] - Math.sin(aa + 0.55) * hk * pk]], Q(31, { w: 10 * pk, smooth: false })));
              } else o.arrow.setAttribute('d', '');
              // panic: the block bursts into fleeing dots
              if (bp > 0) {
                let bf = '', br = '';
                o.bd.forEach((b, k) => {
                  const q = rotP(b[0] * w, b[1] * h, a), d = 180 * b[3] * bp;
                  const x = tr.x + q[0] + Math.cos(b[2]) * d + Math.sin(t * 9 + k) * 3, y = tr.y + q[1] + Math.sin(b[2]) * d * 0.8;
                  bf += inkDot(x, y, 11, 11, sd + 600 + o.i * 40 + k, t) + ' ';
                  br += inkPath(inkEllipsePts(x, y, 13, 13, sd + 700 + k, 7), Q(400 + k, { closed: true, w: 3, amp: 0.8 })) + ' ';
                });
                o.burst.setAttribute('d', bf); o.burstR.setAttribute('d', br);
              } else { o.burst.setAttribute('d', ''); o.burstR.setAttribute('d', ''); }
            } else {
              // riders: chevron pictograms (horse archers), bobbing while they move
              const df = u.defect != null ? atOr(cues, u.defect, null) : null, sw = df != null && lt >= df;
              const blue = (u.side !== 'byz') !== sw, pk = df != null ? punch(lt, df, 0.6) : 0;
              let d = '', dr = '';
              o.off.forEach((of, k) => {
                const bob = tr.moving ? Math.sin(t * 11 + of[2]) * 5 : Math.sin(t * 2 + of[2]) * 2;
                const q = rotP(of[0] * sp, of[1] * sp + bob, a), x = tr.x + q[0], y = tr.y + q[1];
                const s = (1 + 0.3 * pk) * sp;
                const pts = [[26, 0], [-18, -17], [-7, 0], [-18, 17]].map(c => { const v = rotP(c[0] * s, c[1] * s, a); return [x + v[0], y + v[1]]; });
                d += inkLoop(pts, Q(500 + k, { smooth: false, amp: 1 })) + ' ';
                const tail = rotP(-34 * s, 0, a);
                dr += inkPath(pts, Q(540 + k, { closed: true, w: 3, smooth: false, amp: 1 })) + ' ' + inkPath([[x - 7 * Math.cos(a) * s, y - 7 * Math.sin(a) * s], [x + tail[0], y + tail[1]]], Q(580 + k, { w: 3.5, amp: 1 })) + ' ';
              });
              o.fillB.setAttribute('d', blue ? d : ''); o.fillR.setAttribute('d', blue ? '' : d); o.ring.setAttribute('d', dr);
            }
          });

          // herd
          if (Hd) {
            const tr = track(Hd, lt, cues, W, H, 0.6);
            let f = '', rr = '';
            deer.forEach((dv, k) => {
              const x = tr.x + dv[0] + (tr.moving ? Math.sin(t * 9 + dv[2]) * 4 : 0), y = tr.y + dv[1] + Math.sin(t * 2 + dv[2]) * 2, s = dv[3];
              const body = inkEllipsePts(x, y, 26, 12, sd + 800 + k, 9);
              f += inkLoop(body, O(800 + k)) + ' ';
              rr += inkPath(body, O(830 + k, { closed: true, w: 3.5 })) + ' ';
              const hx = x + 24 * s, hy = y - 20;
              rr += inkPath([[x + 18 * s, y - 6], [hx, hy]], O(860 + k, { w: 4 })) + ' ' + inkDot(hx + 5 * s, hy, 8, 6, sd + 870 + k, t) + ' ';
              rr += inkPath([[hx, hy - 4], [hx - 4 * s, hy - 22], [hx - 12 * s, hy - 30]], O(880 + k, { w: 3 })) + ' ' + inkPath([[hx - 3 * s, hy - 16], [hx + 6 * s, hy - 28]], O(900 + k, { w: 3 })) + ' ';
              const lg = tr.moving ? Math.sin(t * 14 + k) * 8 : 0;
              rr += [[-16, 1], [-10, -1], [12, 1], [18, -1]].map((l, q) => inkPath([[x + l[0] * s, y + 8], [x + l[0] * s + l[1] * lg, y + 26]], O(920 + k * 4 + q, { w: 3 }))).join(' ') + ' ';
            });
            herdF.setAttribute('d', f); herdR.setAttribute('d', rr);
          }

          arrowsR.setAttribute('d', arrowD);

          // crescent arc (and closing ring)
          const Cr = P.crescent || null;
          if (Cr) {
            const ca = atOr(cues, Cr.at, dur * 0.5), cp = lt >= ca ? progIO(lt, ca, Cr.dur ?? 1.1) : 0;
            const cl = Cr.close != null ? atOr(cues, Cr.close, null) : null, kp = cl != null && lt >= cl ? progIO(lt, cl, 0.8) : 0;
            const a0 = lerp(Cr.a0 ?? -125, -180, kp), a1 = lerp(Cr.a1 ?? 125, 180, kp);
            const cx = Cr.cx * W, cy = Cr.cy * H, R = Cr.r ?? 280, n = 40, pts = [];
            const end = lerp(a0, a1, cp);
            for (let q = 0; q <= n; q++) { const aa = rad(lerp(a0, end, q / n)); pts.push([cx + Math.cos(aa) * R, cy + Math.sin(aa) * R * 0.8]); }
            const wk = (Cr.w ?? 10) * (1 + 0.6 * kp) * (1 + 0.4 * punch(lt, cl ?? ca, 0.7));
            crescR.setAttribute('d', cp > 0.01 ? inkPath(pts, O(1900, { w: wk, amp: 1.4, taper: 0.5 })) : '');
          }

          // labels + pill
          labels.forEach((o, i) => {
            const L = o.L, a = atOr(cues, L.at, 0.3 + i * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70 + i, t, 1.4);
            o.t.setAttribute('opacity', clamp01(p * 2));
            o.t.setAttribute('transform', `translate(${f1(W * L.x + b[0])} ${f1(H * L.y + b[1])}) rotate(${L.rot ?? -3}) scale(${lerp(0.5, 1, p).toFixed(3)})`);
          });
          if (pill) {
            const a = atOr(cues, PL.at, 0.4), p = lt >= a ? spring(lt, a, 0.6) : 0, pk = punch(lt, a, 0.5);
            if (!pill.w) { try { pill.w = pill.t.getComputedTextLength(); } catch (e) { pill.w = 0; } if (!pill.w) pill.w = PL.text.length * 40; }
            const px = W * (PL.x ?? 0.5), py = H * (PL.y ?? 0.13), fs = parseFloat(pill.t.getAttribute('font-size'));
            if (redraw || !pill.f.getAttribute('d')) {
              const x0 = px - pill.w / 2 - 50, x1 = px + pill.w / 2 + 50, y0 = py - fs * 0.95, y1 = py + fs * 0.45;
              const rr = [[x0 + 30, y0], [x1 - 30, y0], [x1, (y0 + y1) / 2], [x1 - 30, y1], [x0 + 30, y1], [x0, (y0 + y1) / 2]];
              pill.f.setAttribute('d', inkLoop(rr, O(1950)));
              pill.rr.setAttribute('d', inkPath(rr, O(1951, { closed: true, w: 5 })));
              pill.t.setAttribute('x', f1(px)); pill.t.setAttribute('y', f1(py));
            }
            pill.g.setAttribute('opacity', clamp01(p * 2.5));
            pill.g.setAttribute('transform', `translate(${f1(px)} ${f1(py)}) rotate(-2) scale(${(Math.max(0.001, lerp(0.5, 1, p)) * (1 + 0.08 * pk)).toFixed(3)}) translate(${f1(-px)} ${f1(-py)})`);
          }

          // narrator on his hill
          if (kas) {
            const kx = K.x * W, ky = K.y * H;
            if (kHill && (redraw || lt < 0.05)) {
              const hp = [[kx - 260, H + 20], [kx - 200, ky + 30], [kx - 90, ky - 4], [kx + 40, ky - 10], [kx + 170, ky + 6], [W + 30, ky + 40], [W + 30, H + 20]];
              kHill.f.setAttribute('d', inkLoop(hp, O(1990)));
              kHill.r.setAttribute('d', inkPath(hp.slice(0, 6), O(1991, { w: 5 })) + ' ' + [0, 1, 2, 3].map(q => inkPath([[kx - 150 + q * 80, ky + 50 + (q % 2) * 20], [kx - 130 + q * 80, ky + 34 + (q % 2) * 20]], O(1992 + q, { w: 3 }))).join(' '));
            }
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const o = { x: kx, y: ky, face: faceOf(s.face ?? K.face), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
            kas.update(t, s.pose, o);
          }
        },
      };
    },
  };
})();
