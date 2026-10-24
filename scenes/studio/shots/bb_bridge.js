// bb_bridge: a stone suspension bridge over a river in parchment ink (Brooklyn Bridge style: two granite towers with
// twin pointed Gothic arches, four-cable catenary, vertical suspenders + diagonal stays, deck), a far city shore, a
// near stone quay the cast stands on. Parametric: towers can rise, cables draw in on a cue, the whole bridge can be a
// pale "ghost" plan, a horse carriage can cross the deck, fireworks can burst. (theme "parchment", BRAND.md §3, §5)
// P: {
//   water: 0.5 (river surface, 0..1 H), top: 0.2 (tower top), quay: 0.6 (near quay top = cast ground),
//   towers: {h: 1, from: null, at, dur: 1.6} | false   (built height 0..1; from -> h rises on `at`),
//   cables: {at: 0 | cue, dur: 2} | true | false        (cables + suspenders draw in),
//   deck: true | false, ghost: false | {at, dur} (pale dashed plan drawing itself in),
//   carriage: {at, dur: 3, from: -0.15, to: 0.62, scale: 1, rider: "woman"|false, flag: true, rooster: false} | false,
//   fireworks: cue | false, gulls: 3, pier: {from: 0, to: 0.7, y} (wooden pier on posts instead of the stone quay),
//   cast: [...] (see bb__lib), labels: [...], cam: {z0, zoom, focus, pan}, shake: cue
// }
// cues: towers.at, cables.at, ghost.at, carriage.at, fireworks, labels, cast, shake, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  // cut a polyline at fraction u of its length
  function partial(pts, u) {
    if (u >= 1) return pts;
    if (u <= 0) return [pts[0], pts[0]];
    let L = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let need = L * u; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (need <= seg[i - 1]) { const f = need / seg[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); return out; }
      need -= seg[i - 1]; out.push(pts[i]);
    }
    return out;
  }

  SH.bb_bridge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, portrait = H > W, sd = seed * 1000 + 911;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        fw: L(INK.gold), fwR: L(INK.red),
        city: L(INK.paperDark), cityI: L(INK.inkSoft),
        gull: L(INK.inkSoft),
        riverF: L(INK.paperDark, { 'fill-opacity': 0.6 }), riverI: L(INK.blue, { 'fill-opacity': 0.7 }),
        ghost: L(INK.inkSoft, { 'fill-opacity': 0.6 }),
        stays: L(INK.inkSoft), cab: L(INK.ink),
        towF: L(INK.paperLight), towD: L(INK.paperDark), towI: L(INK.ink), towS: L(INK.inkSoft),
        deckF: L(INK.paperDark), deckI: L(INK.ink),
        carF: L(INK.paperDark), carL: L(INK.paperLight), carR: L(INK.red), carI: L(INK.ink), carB: L(INK.inkSoft),
        quayF: L(INK.paperDark), quayI: L(INK.ink), quayS: L(INK.inkSoft),
      };
      const castG = el(cam, 'g');
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);

      const yw = (P.water ?? (portrait ? 0.5 : 0.62)) * H, yt = (P.top ?? (portrait ? 0.2 : 0.12)) * H;
      const PR = P.pier ? Object.assign({ from: 0, to: 0.7, y: P.quay ?? (portrait ? 0.6 : 0.86) }, P.pier === true ? {} : P.pier) : null;
      const yq = PR || P.quay === false ? null : (P.quay ?? (portrait ? 0.6 : 0.86)) * H;
      const th = yw - yt, yd = yw - 0.46 * th;                      // deck level
      const TX = P.towers_x || (portrait ? [0.25, 0.8] : [0.3, 0.72]), tw = (portrait ? 190 : 150);
      const TW = P.towers === false ? null : Object.assign({ h: 1, dur: 1.6 }, P.towers || {});
      const CB = P.cables === false ? null : Object.assign({ at: 0, dur: 2 }, P.cables === true || !P.cables ? {} : P.cables);
      const GH = P.ghost ? Object.assign({ at: 0, dur: 2.2 }, P.ghost === true ? {} : P.ghost) : null;
      const CR = P.carriage ? Object.assign({ at: 0, dur: 3, from: -0.15, to: 0.62, rider: 'woman', flag: true }, P.carriage) : null;
      // fixed city skyline
      const rc = rng(sd + 3), blds = [];
      for (let x = -40; x < W + 40;) { const w = 40 + rc() * 70, h = 26 + rc() * 70, sp = rc() < 0.18; blds.push({ x, w, h, sp }); x += w + rc() * 10; }
      const rf = rng(sd + 5), bursts = Array.from({ length: 7 }, (_, k) => ({ x: 0.12 + rf() * 0.76, y: 0.08 + rf() * 0.2, d: k * 0.42 + rf() * 0.2, r: 70 + rf() * 60, c: k % 3 === 1 }));

      // tower outline (built fraction b): returns {F, D, I, S} pushes
      function tower(cx, b, A, o, gh) {
        const base = yw + 18, topFull = yt, top = lerp(base, topFull, b);
        const hw = tw / 2, hwT = hw * 0.9, x0 = cx - hw, x1 = cx + hw;
        const xt0 = cx - lerp(hw, hwT, b), xt1 = cx + lerp(hw, hwT, b);
        const body = [[x0, base], [xt0, top], [xt1, top], [x1, base]];
        if (gh) { A.G.push(inkPath(body, o(1, { closed: true, w: 4, smooth: false }))); }
        else { A.F.push(inkLoop(body, o(2, { smooth: false }))); A.I.push(inkPath(body, o(3, { closed: true, w: 6, smooth: false }))); }
        // stone courses
        if (!gh) for (let y = base - 34; y > top + 10; y -= 34) {
          const k = (base - y) / (base - topFull), hx = lerp(hw, hwT, k) - 6;
          A.S.push(inkPath([[cx - hx, y], [cx + hx, y]], o(10 + Math.round(y), { w: 2.4, amp: 0.7 })));
        }
        // twin pointed arches between deck and 80% height
        const aB = yd + 26, aT = yw - 0.8 * th;
        if (top < aB - 40) {
          [-1, 1].forEach((sdn, j) => {
            const ax = cx + sdn * hw * 0.42, aw = hw * 0.62, topY = Math.max(aT, top + 30);
            const pts = [[ax - aw / 2, aB], [ax - aw / 2, topY + aw * 0.7], [ax - aw * 0.25, topY + aw * 0.18], [ax, topY], [ax + aw * 0.25, topY + aw * 0.18], [ax + aw / 2, topY + aw * 0.7], [ax + aw / 2, aB]];
            if (gh) A.G.push(inkPath(pts, o(40 + j, { w: 3.5 })));
            else { A.D.push(inkLoop(pts, o(42 + j))); A.I.push(inkPath(pts, o(44 + j, { w: 5 }))); }
          });
        }
        // cornice + top cap when finished
        if (b > 0.98) {
          const cap = rect(xt0 - 14, topFull - 18, xt1 + 14, topFull + 14);
          if (gh) A.G.push(inkPath(cap, o(50, { closed: true, w: 3.5, smooth: false })));
          else { A.F.push(inkLoop(cap, o(51, { smooth: false }))); A.I.push(inkPath(cap, o(52, { closed: true, w: 5, smooth: false }))); }
        } else if (!gh && b > 0.05) {   // scaffold + derrick on an unfinished top
          A.I.push(inkPath([[xt0 - 20, top], [xt1 + 20, top]], o(53, { w: 5 })));
          A.S.push(inkPath([[cx - 10, top], [cx + 40, top - 120], [cx + 120, top - 70]], o(54, { w: 4 })));
          A.S.push(inkPath([[cx + 120, top - 70], [cx + 120, top - 10]], o(55, { w: 2.5 })));
        }
        return { top };
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = base => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.3, w: 5 }, extra);
          const hit = punch(lt, at('hit', null), 0.6);
          const shA = at(P.shake, null), shk = shA == null ? 0 : punch(lt, shA, 0.7);
          B.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.5, 0.45] }, P.cam || {}), hit, shk);

          // fireworks (behind everything)
          const FW = [], FWR = [];
          const fwa = P.fireworks == null || P.fireworks === false ? null : at(P.fireworks, 0.3);
          if (fwa != null) bursts.forEach((b, k) => {
            const cyc = 2.9, a0 = fwa + b.d; if (lt < a0) return;
            const ph = ((lt - a0) % cyc) / cyc, n = Math.floor((lt - a0) / cyc);
            if (ph > 0.6) return;
            const pp = ph / 0.6, r = b.r * Math.sqrt(pp), w = 7 * (1 - pp) + 1.5;
            const bx = b.x * W + n * 37 % 90, by = b.y * H + (n * 53 % 60);
            for (let j = 0; j < 12; j++) {
              const ang = j / 12 * 6.2832 + k, r0 = r * 0.45;
              (b.c ? FWR : FW).push(inkPath([[bx + Math.cos(ang) * r0, by + Math.sin(ang) * r0 + pp * 16], [bx + Math.cos(ang) * r, by + Math.sin(ang) * r + pp * 30]], { seed: sd + 300 + k * 20 + j, t, w, amp: 0.6 }));
            }
          });
          lay.fw.setAttribute('d', FW.join(' ')); lay.fwR.setAttribute('d', FWR.join(' '));

          // far city on the opposite shore
          const cyF = [], cyI = [];
          blds.forEach((b, k) => {
            const r = rect(b.x, yw - b.h, b.x + b.w, yw + 2);
            cyF.push(inkLoop(r, { seed: sd + 400 + k, t, amp: 0.8, smooth: false }));
            cyI.push(inkPath([[b.x, yw], [b.x, yw - b.h], [b.x + b.w, yw - b.h], [b.x + b.w, yw]], { seed: sd + 450 + k, t, w: 3, amp: 0.8, smooth: false }));
            if (b.sp) cyI.push(inkPath([[b.x + b.w * 0.3, yw - b.h], [b.x + b.w * 0.5, yw - b.h - 60], [b.x + b.w * 0.7, yw - b.h]], { seed: sd + 500 + k, t, w: 3, amp: 0.8, smooth: false }));
          });
          lay.city.setAttribute("d", cyF.join(" ")); lay.cityI.setAttribute("d", cyI.join(" "));
          // gulls
          const GL = [];
          for (let k = 0; k < (P.gulls ?? 3); k++) {
            const gx = ((lt * (26 + k * 9) + k * 330) % (W + 200)) - 100, gy = H * (0.14 + k * 0.05) + Math.sin(lt * 1.3 + k) * 10, fl = Math.sin(lt * 7 + k) * 8;
            GL.push(inkPath([[gx - 24, gy - fl], [gx - 10, gy - 6], [gx, gy], [gx + 10, gy - 6], [gx + 24, gy - fl]], { seed: sd + 520 + k, t, w: 3.5, amp: 0.5 }));
          }
          lay.gull.setAttribute('d', GL.join(' '));

          // river
          const rv = B.water(lt, t, W, yw, (yq ?? H) + 30, sd + 600, { rows: PR ? 7 : 3, step: PR ? 200 : 210 });
          lay.riverF.setAttribute('d', rv.fill); lay.riverI.setAttribute('d', rv.lines);

          // bridge
          const A = { F: [], D: [], I: [], S: [], G: [] };
          const gp = GH ? progIO(lt, at(GH.at, 0), GH.dur) : 1, gh = !!GH;
          let tb = 1;
          if (TW) { tb = TW.from != null ? lerp(TW.from, TW.h, progIO(lt, at(TW.at, 0.2), TW.dur)) : TW.h; }
          if (gh) tb = 1;
          const tops = [];
          if (TW) TX.forEach((x, j) => tops.push(tower(x * W, gh ? 1 : tb, A, o(sd + 700 + j * 80), gh)));
          // deck
          const DK = [], DI = [];
          if (P.deck !== false && (gh || tb > 0.55)) {
            const dk = rect(-60, yd - 12, W + 60, yd + 16);
            if (gh) A.G.push(inkPath(dk, o(sd + 900)(1, { closed: true, w: 3, smooth: false })));
            else {
              DK.push(inkLoop(dk, o(sd + 900)(2, { smooth: false })));
              DI.push(inkPath([[-60, yd - 12], [W + 60, yd - 12]], o(sd + 900)(3, { w: 5 })));
              DI.push(inkPath([[-60, yd + 16], [W + 60, yd + 16]], o(sd + 900)(4, { w: 5 })));
              for (let x = -40; x < W + 40; x += 46) DI.push(inkPath([[x, yd + 14], [x + 23, yd - 10], [x + 46, yd + 14]], o(sd + 910 + Math.round(x))(0, { w: 2.2, amp: 0.6 })));
            }
          }
          // cables
          if (CB && TW && (gh || tb > 0.98)) {
            const cp = gh ? gp : (typeof CB.at === 'number' && CB.at <= 0 ? 1 : progIO(lt, at(CB.at, 0), CB.dur));
            const xa = TX[0] * W, xb = TX[1] * W, ytop = yt - 6, ymid = yd - 30;
            const main = [], sideL = [], sideR = [];
            for (let i = 0; i <= 24; i++) { const u = i / 24, x = lerp(xa, xb, u); main.push([x, ymid + (ytop - ymid) * Math.pow(2 * u - 1, 2)]); }
            for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(xa, -80, u); sideL.push([x, lerp(ytop, yd - 14, Math.pow(u, 0.75))]); }
            for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(xb, W + 80, u); sideR.push([x, lerp(ytop, yd - 14, Math.pow(u, 0.75))]); }
            const dst = gh ? A.G : A.I, wC = gh ? 3.5 : 6;
            [main, sideL, sideR].forEach((c, j) => dst.push(inkPath(partial(c, cp), o(sd + 1000)(j, { w: wC }))));
            if (!gh) dst.push(inkPath(partial(main.map(q => [q[0], q[1] + 12]), cp), o(sd + 1000)(5, { w: 4 })));
            // suspenders
            const S2 = gh ? A.G : A.S;
            main.forEach((q, i) => { if (i > 0 && i < 24 && i / 24 <= cp) S2.push(inkPath([[q[0], q[1] + 6], [q[0], yd - 12]], o(sd + 1100 + i)(0, { w: 2.2, amp: 0.5 }))); });
            [sideL, sideR].forEach((c, s) => c.forEach((q, i) => { if (i > 0 && i < 8 && i / 8 <= cp) S2.push(inkPath([[q[0], q[1] + 6], [q[0], yd - 12]], o(sd + 1200 + s * 20 + i)(0, { w: 2.2, amp: 0.5 }))); }));
            // diagonal stays fanning from the tower tops
            const ST = [];
            if (cp > 0.5) [xa, xb].forEach((tx, s) => [-1, 1].forEach(dn => {
              for (let k = 1; k <= 4; k++) { const ex = tx + dn * k * 52 * (portrait ? 1 : 1.3); const u = clamp01((cp - 0.5) * 2 - (k - 1) * 0.1);
                if (u > 0) ST.push(inkPath(partial([[tx + dn * 10, ytop + 30], [ex, yd - 12]], u), o(sd + 1300 + s * 40 + k * 3 + (dn > 0 ? 1 : 0))(0, { w: 2, amp: 0.5 }))); }
            }));
            lay.stays.setAttribute('d', gh ? '' : ST.join(' '));
          } else lay.stays.setAttribute('d', '');
          lay.towF.setAttribute('d', A.F.join(' ')); lay.towD.setAttribute('d', A.D.join(' '));
          lay.towI.setAttribute('d', A.I.join(' ')); lay.towS.setAttribute('d', A.S.join(' '));
          lay.deckF.setAttribute('d', DK.join(' ')); lay.deckI.setAttribute('d', DI.join(' '));
          if (gh) {   // ghost: dashed reveal (cut the joined ghost into a growing prefix of strokes)
            const n = Math.ceil(A.G.length * gp);
            lay.ghost.setAttribute('d', A.G.slice(0, n).join(' '));
          } else lay.ghost.setAttribute('d', '');

          // carriage on the deck
          const cF = [], cL = [], cR = [], cI = [], cB = [];
          if (CR && !gh) {
            const ca = at(CR.at, 0.2), u = progIO(lt, ca, CR.dur), k = (CR.scale ?? 1) * (portrait ? 1 : 0.8);
            const cx = lerp(CR.from, CR.to, u) * W, gy = yd - 12, moving = u > 0 && u < 1;
            const bob = moving ? Math.abs(Math.sin(lt * 9)) * 3 : 0, oc = o(sd + 1500);
            // horse (in front, facing right)
            const hx = cx + 92 * k, hy = gy - 46 * k - bob;
            cB.push(inkLoop(inkEllipsePts(hx, hy, 40 * k, 18 * k, sd + 1501, 10), oc(1)));
            cI.push(inkPath(inkEllipsePts(hx, hy, 40 * k, 18 * k, sd + 1501, 10), oc(2, { closed: true, w: 4 })));
            cI.push(inkPath([[hx + 30 * k, hy - 8 * k], [hx + 46 * k, hy - 40 * k], [hx + 64 * k, hy - 34 * k]], oc(3, { w: 7 })));
            const lg = moving ? Math.sin(lt * 12) * 10 * k : 0;
            [[-28, lg], [-16, -lg], [22, -lg], [32, lg]].forEach(([lx, sw], j) => cI.push(inkPath([[hx + lx * k, hy + 12 * k], [hx + lx * k + sw, gy]], oc(4 + j, { w: 4 }))));
            cI.push(inkPath([[hx - 40 * k, hy - 4 * k], [hx - 54 * k, hy + 14 * k]], oc(9, { w: 3 })));
            // carriage body + wheels
            const body = [[cx - 52 * k, gy - 30 * k - bob], [cx + 46 * k, gy - 30 * k - bob], [cx + 50 * k, gy - 76 * k - bob], [cx - 56 * k, gy - 80 * k - bob]];
            cF.push(inkLoop(body, oc(10, { smooth: false })));
            cI.push(inkPath(body, oc(11, { closed: true, w: 4, smooth: false })));
            cI.push(inkPath([[cx + 46 * k, gy - 46 * k], [hx - 34 * k, hy]], oc(12, { w: 3 })));
            const rot = moving ? lt * 8 : 0;
            [[-34, 22], [32, 22]].forEach(([wx, r], j) => {
              const wc = [cx + wx * k, gy - r * k];
              cI.push(inkPath(circ(wc[0], wc[1], r * k, 12), oc(13 + j, { closed: true, w: 4, amp: 0.5 })));
              for (let s = 0; s < 3; s++) { const a = rot + s * 1.047; cI.push(inkPath([[wc[0] - Math.cos(a) * r * k, wc[1] - Math.sin(a) * r * k], [wc[0] + Math.cos(a) * r * k, wc[1] + Math.sin(a) * r * k]], oc(16 + j * 3 + s, { w: 2.2, amp: 0.4 }))); }
            });
            if (CR.rider) {   // woman rider: head, bun, shoulders in the open carriage
              const rx = cx - 8 * k, ry = gy - 112 * k - bob;
              cI.push(inkPath([[rx - 22 * k, gy - 80 * k - bob], [rx, ry + 22 * k], [rx + 22 * k, gy - 80 * k - bob]], oc(30, { w: 5 })));
              cF.push(inkLoop(inkEllipsePts(rx - 24 * k, ry - 12 * k, 11 * k, 10 * k, sd + 1531, 8), oc(31)));
              cL.push(inkLoop(inkEllipsePts(rx, ry, 22 * k, 22 * k, sd + 1532, 10), oc(32)));
              cI.push(inkPath(inkEllipsePts(rx, ry, 22 * k, 22 * k, sd + 1532, 10), oc(33, { closed: true, w: 4, amp: 0.5 })));
              cI.push(inkDot(rx + 8 * k, ry - 2 * k, 3.2 * k, 3.2 * k, sd + 1534, t));
            }
            if (CR.rooster) {   // rooster held in front of the rider (victory symbol)
              const bx = cx + 30 * k, by = gy - 80 * k - bob, fl = Math.sin(lt * 6) * 2 * k;
              const body = inkEllipsePts(bx, by, 22 * k, 16 * k, sd + 1560, 10);
              cL.push(inkLoop(body, oc(50)));
              cI.push(inkPath(body, oc(51, { closed: true, w: 3.5, amp: 0.5 })));
              const hd = [bx + 18 * k, by - 24 * k];
              cL.push(inkLoop(inkEllipsePts(hd[0], hd[1], 10 * k, 10 * k, sd + 1561, 8), oc(52)));
              cI.push(inkPath(inkEllipsePts(hd[0], hd[1], 10 * k, 10 * k, sd + 1561, 8), oc(53, { closed: true, w: 3, amp: 0.4 })));
              cR.push(inkLoop([[hd[0] - 8 * k, hd[1] - 8 * k], [hd[0] - 4 * k, hd[1] - 20 * k + fl], [hd[0] + 2 * k, hd[1] - 12 * k], [hd[0] + 6 * k, hd[1] - 22 * k + fl], [hd[0] + 10 * k, hd[1] - 8 * k]], oc(54, { smooth: false })));
              cR.push(inkLoop([[hd[0] + 4 * k, hd[1] + 8 * k], [hd[0] + 9 * k, hd[1] + 18 * k], [hd[0] + 1 * k, hd[1] + 12 * k]], oc(55, { smooth: false })));
              cF.push(inkLoop([[hd[0] + 9 * k, hd[1] - 3 * k], [hd[0] + 20 * k, hd[1] + 1 * k], [hd[0] + 9 * k, hd[1] + 4 * k]], oc(56, { smooth: false })));
              cI.push(inkDot(hd[0] + 3 * k, hd[1] - 2 * k, 2.2 * k, 2.2 * k, sd + 1562, t));
              [[-18, -26], [-22, -14], [-14, -32]].forEach(([dx, dy], j) => cI.push(inkPath([[bx - 16 * k, by - 4 * k], [bx + (dx - 10) * k, by + dy * k + fl]], oc(57 + j, { w: 4 }))));
            }
            if (CR.flag) {
              const fx = cx - 56 * k, fy = gy - 150 * k - bob, wv = Math.sin(lt * 6) * 5;
              cI.push(inkPath([[fx, gy - 80 * k - bob], [fx, fy]], oc(40, { w: 3.5 })));
              cR.push(inkLoop([[fx, fy], [fx - 50 * k, fy + 8 + wv], [fx, fy + 28 * k]], oc(41)));
            }
          }
          lay.carF.setAttribute('d', cF.join(' ')); lay.carL.setAttribute('d', cL.join(' '));
          lay.carR.setAttribute('d', cR.join(' ')); lay.carI.setAttribute('d', cI.join(' ')); lay.carB.setAttribute('d', cB.join(' '));

          // near quay (stone wall the cast stands on)
          if (yq != null) {
            const qp = [[-60, yq], [W * 0.3, yq - 3], [W * 0.7, yq + 2], [W + 60, yq], [W + 60, H + 60], [-60, H + 60]];
            lay.quayF.setAttribute('d', inkLoop(qp, { seed: sd + 1600, t, amp: 1, smooth: false }));
            lay.quayI.setAttribute('d', inkPath(qp.slice(0, 4), { seed: sd + 1601, t, w: 6, amp: 1.2 }));
            const QS = [];
            for (let r = 0; r < 5; r++) {
              const y = yq + 46 + r * 58, off = r % 2 ? 60 : 0;
              QS.push(inkPath([[-40, y], [W + 40, y]], { seed: sd + 1610 + r, t, w: 2.4, amp: 0.8 }));
              for (let x = -60 + off; x < W + 60; x += 120) QS.push(inkPath([[x, y - 58 + 6], [x, y - 4]], { seed: sd + 1620 + r * 20 + Math.round(x / 120), t, w: 2.4, amp: 0.6 }));
            }
            lay.quayS.setAttribute('d', QS.join(' '));
          }

          if (PR) {   // wooden pier: plank deck on posts standing in the water
            const py = PR.y * H, x0 = PR.from * W - 60, x1 = PR.to * W, PF = [], PI = [];
            const deckP = [[x0, py], [x1, py - 2], [x1 + 6, py + 34], [x0, py + 36]];
            PF.push(inkLoop(deckP, { seed: sd + 1700, t, amp: 0.8, smooth: false }));
            PI.push(inkPath(deckP, { seed: sd + 1701, t, w: 5, closed: true, amp: 0.8, smooth: false }));
            for (let x = x0 + 70, k = 0; x < x1; x += 70, k++) PI.push(inkPath([[x, py + 2], [x + 2, py + 34]], { seed: sd + 1710 + k, t, w: 2.4, amp: 0.5 }));
            for (let x = x0 + 120, k = 0; x < x1 + 10; x += 170, k++) {
              const post = [[x - 14, py + 36], [x + 14, py + 36], [x + 12, py + 300], [x - 12, py + 300]];
              PF.push(inkLoop(post, { seed: sd + 1730 + k, t, amp: 0.8, smooth: false }));
              PI.push(inkPath(post, { seed: sd + 1750 + k, t, w: 4, closed: true, amp: 0.8, smooth: false }));
              PI.push(inkPath([[x - 40, py + 300 + Math.sin(lt * 2 + k) * 4], [x + 40, py + 300 - Math.sin(lt * 2 + k) * 4]], { seed: sd + 1770 + k, t, w: 3, amp: 0.8 }));
            }
            lay.quayF.setAttribute('d', PF.join(' ')); lay.quayI.setAttribute('d', PI.join(' ')); lay.quayS.setAttribute('d', '');
          }
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
