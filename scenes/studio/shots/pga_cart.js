// pga_cart: 1848 Vermont village road (parchment ink, brand/kit/BRAND.md §3, §5; boils at 8 Hz; pure function of
// (seed, lt), no Math.random). Written for ag-04-phineas-gage (chapter 2), parametric. Needs pga__lib.js + mcB__lib.js.
//
// mode "road": side view, the road scrolls left: far hills + pines (parallax), an ox walking in place pulls a two-wheeled
//   cart; on it a seated, bandaged man sits upright; a crewman leads the ox; a village (houses + white church steeple)
//   slides in from the right as they get closer; an optional milestone post passes by.
//   P: {mode: "road", rider: {bandage: true, head: "none", pose: "sit"}, leader: true, town: {from: 1.25, to: 0.86} (x, 0..1 W),
//       milestone: {at: cue, text: "1 MILE"} | false, speed: 1}
// mode "porch": a village tavern porch (roof, posts, steps, sign); the bandaged man sits on a bench; a doctor in a top hat
//   walks in from the right with his bag; a speech bubble pops from the seated man on `joke`.
//   P: {mode: "porch", sign: "TAVERN", doctor: {x: 1.1, to: 0.66, at: cue (arrives), dur: 1.8}, rider: {...},
//       bubble: {at: cue, text: "Business enough for you!", w: 640, h: 170, size: 54}}
// both: zoom: 1 (static scale around the ground centre), cast: [...PGA cast], kasif: {x, y, scale, pose, face, in_place, seq, ...} | false, labels: [...MCB], cam
// cues: joke, hit + any "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';

  function ox(group, sd) {
    const F = inkEl(group, INK.paperDark), L = inkEl(group), D = inkEl(group, INK.ink);
    return (t, lt, oxX, GL, k, walk = true) => {
      const by = GL - 118 * k, bob = walk ? Math.sin(lt * 10) * 3 * k : 0;
      const body = [[oxX - 110 * k, by - 50 * k + bob], [oxX - 20 * k, by - 66 * k + bob], [oxX + 80 * k, by - 58 * k + bob], [oxX + 112 * k, by - 18 * k + bob],
        [oxX + 100 * k, by + 40 * k + bob], [oxX - 10 * k, by + 52 * k + bob], [oxX - 112 * k, by + 38 * k + bob], [oxX - 126 * k, by - 8 * k + bob]];
      const hx = oxX + 150 * k, hy = by - 6 * k + bob + Math.sin(lt * 5) * 4 * k;
      const head = [[hx - 40 * k, hy - 40 * k], [hx + 22 * k, hy - 34 * k], [hx + 52 * k, hy + 16 * k], [hx + 40 * k, hy + 44 * k], [hx - 6 * k, hy + 40 * k], [hx - 44 * k, hy + 6 * k]];
      F.setAttribute('d', inkLoop(body, { seed: sd + 1, t, amp: 1.2 }) + ' ' + inkLoop(head, { seed: sd + 2, t, amp: 1 }));
      let ol = inkPath(body, { w: 6 * k, seed: sd + 3, t, amp: 1.4, closed: true }) + ' ' + inkPath(head, { w: 5.5 * k, seed: sd + 4, t, amp: 1.2, closed: true });
      ol += ' ' + inkPath([[hx - 22 * k, hy - 36 * k], [hx - 34 * k, hy - 70 * k], [hx - 8 * k, hy - 88 * k]], { w: 6 * k, seed: sd + 5, t, amp: 1 });
      ol += ' ' + inkPath([[hx + 6 * k, hy - 38 * k], [hx + 10 * k, hy - 74 * k], [hx + 36 * k, hy - 86 * k]], { w: 6 * k, seed: sd + 6, t, amp: 1 });
      ol += ' ' + inkPath([[hx - 44 * k, hy - 10 * k], [hx - 70 * k, hy - 18 * k]], { w: 5 * k, seed: sd + 7, t, amp: 1 });
      const tw = Math.sin(lt * 3.1) * 16 * k;
      ol += ' ' + inkPath([[oxX - 122 * k, by - 20 * k + bob], [oxX - 150 * k, by + 20 * k + bob], [oxX - 146 * k + tw, by + 64 * k + bob]], { w: 4.5 * k, seed: sd + 8, t, amp: 1 });
      [[-80, 0], [-50, 0.5], [55, 0.25], [85, 0.75]].forEach(([dx, ph], i) => {
        const c = walk ? (lt * 1.6 + ph) * Math.PI * 2 : ph, s = Math.sin(c), x0 = oxX + dx * k, y0 = by + 40 * k + bob;
        const knee = [x0 + s * 14 * k, y0 + 38 * k], foot = [x0 + s * 30 * k, GL - Math.max(0, Math.cos(c)) * 10 * k * (walk ? 1 : 0)];
        ol += ' ' + inkPath([[x0, y0], knee, foot], { w: 9 * k, seed: sd + 10 + i, t, amp: 1 });
      });
      L.setAttribute('d', ol);
      D.setAttribute('d', inkDot(hx + 18 * k, hy - 8 * k, 6 * k, 6 * k, sd + 20, t) + ' ' + inkDot(hx + 40 * k, hy + 30 * k, 4 * k, 4 * k, sd + 21, t));
      return { yokeX: oxX - 60 * k, yokeY: by - 10 * k + bob };
    };
  }

  function house(pts, x, base, w, h, roof, sd, t, steeple) {
    const body = [[x, base], [x, base - h], [x + w, base - h], [x + w, base]];
    const rf = [[x - 14, base - h], [x + w / 2, base - h - roof], [x + w + 14, base - h]];
    pts.f.push(inkLoop(body, { seed: sd, t, smooth: false, amp: 1 }));
    pts.l.push(inkPath(body, { w: 5, seed: sd + 1, t, closed: true, smooth: false }), inkPath(rf, { w: 5, seed: sd + 2, t, smooth: false }));
    pts.r.push(inkLoop(rf.concat([[x + w + 14, base - h]]), { seed: sd + 3, t, smooth: false }));
    for (let i = 0; i < 2; i++) { const wx = x + w * (0.22 + i * 0.4), wy = base - h * 0.62; const win = [[wx, wy], [wx + w * 0.18, wy], [wx + w * 0.18, wy + h * 0.24], [wx, wy + h * 0.24]]; pts.l.push(inkPath(win, { w: 3.5, seed: sd + 4 + i, t, closed: true, smooth: false })); }
    if (steeple) {
      const sx = x + w / 2, st = base - h - roof;
      const tw = [[sx - 26, st + 20], [sx - 26, st - 90], [sx + 26, st - 90], [sx + 26, st + 20]], sp = [[sx - 34, st - 90], [sx, st - 230], [sx + 34, st - 90]];
      pts.f.push(inkLoop(tw, { seed: sd + 8, t, smooth: false }), inkLoop(sp, { seed: sd + 9, t, smooth: false }));
      pts.l.push(inkPath(tw, { w: 5, seed: sd + 10, t, closed: true, smooth: false }), inkPath(sp, { w: 5, seed: sd + 11, t, closed: true, smooth: false }), inkPath([[sx, st - 230], [sx, st - 270]], { w: 4, seed: sd + 12, t }), inkPath([[sx - 14, st - 256], [sx + 14, st - 256]], { w: 4, seed: sd + 13, t }));
    }
  }

  SH.pga_cart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 8100, mode = P.mode || 'road';
      const gy = (P.ground ?? 0.82) * H;
      const root = el(svg, 'g'), base = el(root, 'g'), cam = el(base, 'g');
      { const Z = P.zoom ?? 1; base.setAttribute('transform', `translate(${W / 2} ${gy}) scale(${Z}) translate(${-W / 2} ${-gy})`); }
      const hl = PGA.hills(el(cam, 'g'), W, gy - 140, sd + 5, { h: 230, ridges: 2, pines: mode === 'road' ? 18 : 6 });
      const townF = inkEl(cam, INK.paperLight), townR = inkEl(cam, INK.red, { 'fill-opacity': 0.55 }), townL = inkEl(cam);
      const groundF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.35 }), groundL = inkEl(cam), groundT = inkEl(cam, INK.inkSoft);
      const mileG = el(cam, 'g'), mileF = inkEl(mileG, INK.paperLight), mileL = inkEl(mileG);
      const mileT = el(mileG, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 50, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
      mileT.textContent = (P.milestone && P.milestone.text) || '1 MILE';
      const porchD = inkEl(cam, INK.paperDark), porchL = inkEl(cam);
      const signG = el(cam, 'g'), signF = inkEl(signG, INK.paperLight), signL = inkEl(signG);
      const signT = el(signG, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
      signT.textContent = P.sign || 'TAVERN';
      const oxG = el(cam, 'g'), drawOx = ox(oxG, sd + 200);
      const cartBack = inkEl(cam, INK.paperDark), cartL = inkEl(cam);
      const castG = el(cam, 'g');
      const wheelL = inkEl(cam), hubs = inkEl(cam, INK.paperLight), yoke = inkEl(cam);
      const bagF = inkEl(cam, INK.inkSoft), bagL = inkEl(cam);
      const bub = PGA.bubble(cam, sd + 900);
      const RD = Object.assign({ bandage: true, head: 'none', pose: 'sit' }, P.rider || {});
      const list = [];
      const cartX = 0.42 * W, k = 1.15;
      if (mode === 'road') {
        list.push(Object.assign({ who: 'gage', x: cartX / W - 0.01, y: (gy - 120 * k) / H, scale: 0.55, pose: RD.pose, face: 'right', head: RD.head, bandage: RD.bandage, emotion: 'neutral' }, RD.cast || {}));
        if (P.leader !== false) list.push({ who: 'crew', x: 0.79, y: gy / H + 0.005, scale: 0.58, pose: 'walk', in_place: true, face: 'right', head: 'cap' });
      } else {
        list.push(Object.assign({ who: 'gage', x: 0.42, y: gy / H, scale: 0.62, pose: 'sit', face: 'right', head: RD.head, bandage: RD.bandage, emotion: 'happy' }, RD.cast || {}));
        const DC = Object.assign({ x: 1.1, to: 0.66, dur: 1.8 }, P.doctor || {});
        list.push({ who: 'doctor', x: DC.x, to: DC.to, at: DC.at, walk_dur: DC.dur, pose: 'walk', then: DC.then || 'idle', face: 'left', head: 'top', beard: DC.beard || 'short', scale: 0.64, y: gy / H, seq: DC.seq });
      }
      if (P.kasif !== false) list.push(Object.assign(mode === 'road' ? { who: 'kasif', x: 0.14, y: 0.93, scale: 0.7, pose: 'walk', in_place: true, face: 'right' } : { who: 'kasif', x: 0.14, y: 0.93, scale: 0.72, pose: 'talk', face: 'right' }, P.kasif || {}));
      (P.cast || []).forEach(m => list.push(m));
      const cs = PGA.cast(castG, list, W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const R = rng(sd + 1), ticks = Array.from({ length: 18 }, () => [R(), R()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.45, 0.6] }, hit);
          const sp = mode === 'road' ? (P.speed ?? 1) * 150 : 0, scroll = lt * sp;
          hl.update(t, -scroll * 0.25);
          groundF.setAttribute('d', inkLoop([[-60, gy], [W + 60, gy], [W + 60, H + 40], [-60, H + 40]], { seed: sd + 2, t, amp: 1, smooth: false }));
          groundL.setAttribute('d', inkPath([[-60, gy], [W * 0.5, gy + 3], [W + 60, gy]], { w: 6, seed: sd + 3, t }));
          groundT.setAttribute('d', ticks.map((q, i) => { const x = ((q[0] * (W + 200) - scroll) % (W + 200) + W + 200) % (W + 200) - 100, y = gy + 20 + q[1] * 60; return inkPath([[x, y], [x + 34, y - 2]], { w: 3, seed: sd + 10 + i, t, amp: 0.8 }); }).join(' '));
          // village
          const T = { f: [], l: [], r: [] };
          if (mode === 'road') {
            const TW = Object.assign({ from: 1.25, to: 0.86 }, P.town || {}), tx = lerp(TW.from, TW.to, progIO(lt, 0, Math.max(1, dur))) * W, base = gy - 60;
            house(T, tx - 60, base, 150, 110, 70, sd + 40, t, false);
            house(T, tx + 120, base, 170, 140, 80, sd + 60, t, true);
            house(T, tx + 330, base, 140, 100, 60, sd + 80, t, false);
          } else {
            // porch: back wall, door, windows, roof on posts, steps
            const x0 = 0.24 * W, x1 = 0.96 * W, roofY = gy - 420, wallTop = gy - 520;
            const wall = [[x0, gy], [x0, wallTop], [x1, wallTop], [x1, gy]];
            T.f.push(inkLoop(wall, { seed: sd + 40, t, smooth: false }));
            let pl = inkPath(wall, { w: 6, seed: sd + 41, t, closed: true, smooth: false });
            for (let i = 1; i < 9; i++) pl += ' ' + inkPath([[x0, wallTop + i * 58], [x1, wallTop + i * 58 + 2]], { w: 2.5, seed: sd + 42 + i, t });
            const door = [[0.6 * W, gy], [0.6 * W, gy - 300], [0.68 * W, gy - 300], [0.68 * W, gy]];
            porchD.setAttribute('d', inkLoop(door, { seed: sd + 55, t, smooth: false }) + ' ' + inkLoop([[0.3 * W, gy - 330], [0.4 * W, gy - 330], [0.4 * W, gy - 200], [0.3 * W, gy - 200]], { seed: sd + 56, t, smooth: false }) + ' ' + inkLoop([[0.78 * W, gy - 330], [0.88 * W, gy - 330], [0.88 * W, gy - 200], [0.78 * W, gy - 200]], { seed: sd + 57, t, smooth: false }));
            pl += ' ' + inkPath(door, { w: 5, seed: sd + 58, t, closed: true, smooth: false });
            const roof = [[x0 - 60, roofY], [x1 + 40, roofY], [x1 + 20, roofY - 70], [x0 - 30, roofY - 70]];
            T.r.push(inkLoop(roof, { seed: sd + 59, t, smooth: false }));
            pl += ' ' + inkPath(roof, { w: 6, seed: sd + 60, t, closed: true, smooth: false });
            [x0 - 30, 0.5 * W, 0.74 * W, x1].forEach((px, i) => { pl += ' ' + inkPath([[px, roofY], [px, gy]], { w: 10, seed: sd + 61 + i, t }); });
            pl += ' ' + inkPath([[x0 - 60, gy - 10], [x1 + 40, gy - 10]], { w: 6, seed: sd + 66, t });
            porchL.setAttribute('d', pl);
            const sg = [[-150, -46], [150, -46], [150, 46], [-150, 46]], sw = Math.sin(lt * 1.6) * 3;
            signG.setAttribute('transform', `translate(${f1(0.5 * W)} ${f1(roofY - 130)}) rotate(${f1(sw)})`);
            signF.setAttribute('d', inkLoop(sg, { seed: sd + 70, t, smooth: false }));
            signL.setAttribute('d', inkPath(sg, { w: 6, seed: sd + 71, t, closed: true, smooth: false }) + ' ' + inkPath([[-100, -46], [-80, -96]], { w: 4, seed: sd + 72, t }) + ' ' + inkPath([[100, -46], [80, -96]], { w: 4, seed: sd + 73, t }));
          }
          townF.setAttribute('d', T.f.join(' ')); townL.setAttribute('d', T.l.join(' ')); townR.setAttribute('d', T.r.join(' '));
          if (mode === 'porch') { townF.setAttribute('fill', INK.paperLight); townR.setAttribute('fill-opacity', 0.9); townR.setAttribute('fill', INK.inkSoft); }
          // milestone
          if (mode === 'road' && P.milestone) {
            const ma = atOr(cues, P.milestone.at, 0.5), mx = W + 140 - Math.max(0, lt - ma + 2) * sp * 1.6;
            mileG.setAttribute('transform', `translate(${f1(mx)} ${f1(gy)})`);
            const post = [[-16, 0], [-16, -330], [16, -330], [16, 0]], board = [[-120, -400], [120, -400], [130, -320], [-110, -320]];
            mileF.setAttribute('d', inkLoop(board, { seed: sd + 90, t, smooth: false }));
            mileL.setAttribute('d', inkPath(post, { w: 6, seed: sd + 91, t, closed: true, smooth: false }) + ' ' + inkPath(board, { w: 6, seed: sd + 92, t, closed: true, smooth: false }));
            mileT.setAttribute('x', 6); mileT.setAttribute('y', -360);
          } else mileG.style.display = 'none';
          // ox + cart (road)
          if (mode === 'road') {
            const GL = gy + 6, yk = drawOx(t, lt, 0.64 * W, GL, k, true);
            const rot = Math.sin(lt * 2.3) * 1.2, bob = Math.abs(Math.sin(lt * 4.6)) * -4;
            const ax = GL - 62 * k, bedY = ax - 36 * k, c0 = cartX - 190 * k, c1 = cartX + 150 * k;
            const bed = [[c0, bedY + bob], [c1, bedY + bob], [c1 - 8, bedY + 34 * k + bob], [c0 + 8, bedY + 34 * k + bob]];
            const sideB = [[c0, bedY + bob], [c0, bedY - 70 * k + bob], [c0 + 20, bedY - 70 * k + bob]];
            cartBack.setAttribute('d', inkLoop(bed, { seed: sd + 100, t, smooth: false }));
            cartL.setAttribute('d', inkPath(bed, { w: 6, seed: sd + 101, t, closed: true, smooth: false }) + ' ' + inkPath(sideB, { w: 7, seed: sd + 102, t, smooth: false }) + ' ' +
              inkPath([[c1, bedY + 10 + bob], [yk.yokeX, yk.yokeY]], { w: 8, seed: sd + 103, t }));
            let wd = '', hd = '';
            const wr = 62 * k;
            [cartX - 100 * k, cartX + 70 * k].forEach((wx, j) => {
              wd += inkCircle(wx, ax, wr, sd + 110 + j, t, { w: 8 }) + ' ';
              for (let s = 0; s < 6; s++) { const a = lt * 2.4 + s / 6 * Math.PI * 2; wd += inkPath([[wx, ax], [wx + Math.cos(a) * wr * 0.92, ax + Math.sin(a) * wr * 0.92]], { w: 4.5, seed: sd + 120 + j * 10 + s, t, amp: 0.8 }) + ' '; }
              hd += inkCircle(wx, ax, 11, sd + 140 + j, t, { fill: true }) + ' ';
            });
            wheelL.setAttribute('d', wd); hubs.setAttribute('d', hd);
            yoke.setAttribute('d', inkPath([[0.64 * W + 140 * k, gy - 150 * k], [0.79 * W - 40, gy - 230]], { w: 4, seed: sd + 150, t }));
            castG.setAttribute('transform', '');
            list[0].y = (bedY + bob + 4) / H;
            void rot;
          }
          const info = cs.update(lt, t, cues);
          // doctor's bag
          if (mode === 'porch') {
            const d = info[1];
            if (d) {
              const h = d.hands[0], b = [[h[0] - 40, h[1] + 10], [h[0] + 40, h[1] + 10], [h[0] + 46, h[1] + 70], [h[0] - 46, h[1] + 70]];
              bagF.setAttribute('d', inkLoop(b, { seed: sd + 160, t, smooth: false }));
              bagL.setAttribute('d', inkPath(b, { w: 5, seed: sd + 161, t, closed: true, smooth: false }) + ' ' + inkPath([[h[0] - 20, h[1] + 10], [h[0], h[1] - 8], [h[0] + 20, h[1] + 10]], { w: 4, seed: sd + 162, t }));
            }
            if (P.bubble) {
              const Bb = P.bubble, ba = atOr(cues, Bb.at, 1), g = info[0];
              if (g && lt >= ba) {
                const p = spring(lt, ba, 0.5);
                bub.update(t, lt, { x: g.head[0] + (Bb.dx ?? 120), y: g.head[1] - (Bb.dy ?? 190), w: Bb.w ?? 640, h: Bb.h ?? 170, tail: [g.head[0] + 30, g.head[1] - 60], p, text: Bb.text || 'Business enough for you!', size: Bb.size ?? 54 });
              } else bub.update(t, lt, { p: 0 });
            }
          }
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
