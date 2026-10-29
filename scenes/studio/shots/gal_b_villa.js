// gal_b_villa: Galileo's room in the Arcetri villa at night, seen from inside (02-galileo-teleskop, B5). "set": false:
// a dark stone room (GAL.room) with a tall barred window, the Moon and stars in it, an old spyglass leaning on the wall,
// a candle on a small table, books and rolled papers on the floor in front (foreground), a plank floor to the frame
// bottom. Parchment ink, palette tokens only, pure function of (seed, lt).
//   "blind" — old Galileo sits in a high-backed chair by the window, head bowed; on `fade.at` the Moon in the window
//             blurs and goes out like an ink blot spreading, the stars go out one by one.
//   "empty" — the chair is empty, the candle is out (`candle.out` s; a smoke wisp rises), a guard's shadow stands in the
//             doorway on the right, swaying; Kaşif walks in (kasif.moves), picks the spyglass up when he reaches it and
//             on `aim` (cue) raises it to the Moon in the window.
// P: {mode: "blind"|"empty", window: {x: 0.5, y: 0.13, w: 0.17, h: 0.47}, fade: {at, dur: 2}, candle: {out: sec|cue},
//     chair: {x: 0.3}, galileo: GAL.person (sits in the chair), guard: true (empty) | false (blind; true shows the guard there too), scope: {x: 0.45},
//     kasif: GAL.person (+ pick: sec|cue to take the scope; default = end of its first move), aim: cue, labels}
// cues: fade.at, aim (default hit), hit (punch), + person cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_b_villa = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 641, mode = P.mode || 'blind';
      const gy = 0.8 * H;
      const WN = Object.assign({ x: 0.5, y: 0.13, w: 0.17, h: 0.47 }, P.window || {});
      const SKY = mix(INK.ink, INK.blue, 0.25);
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const winG = el(root, 'g');
      const stars = G.stars(winG, sd + 2, 14);
      const moon = G.moon(winG, sd + 3);
      const blot = inkEl(winG, SKY), blotL = inkEl(winG, mix(INK.inkSoft, SKY, 0.4));
      const bars = inkEl(root, mix(INK.stain, INK.ink, 0.35)), barsL = inkEl(root, INK.ink), sill = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35));
      const beam = inkEl(root, INK.paperLight, { 'fill-opacity': 0.12 });
      const door = (mode === 'empty' ? P.guard !== false : !!P.guard) ? { frame: inkEl(root, mix(INK.stain, INK.ink, 0.4)), hole: inkEl(root, mix(INK.inkSoft, INK.ink, 0.45)), guard: inkEl(root, INK.ink), shadow: inkEl(root, mix(INK.ink, INK.inkSoft, 0.35)), l: inkEl(root, INK.ink) } : null;
      const SC = Object.assign({ x: 0.45 }, P.scope || {});
      const scope = G.scope(el(root, 'g'), sd + 4);
      const chair = { back: inkEl(root, mix(INK.stain, INK.ink, 0.45)), l: inkEl(root, INK.ink) };
      const CH = Object.assign({ x: 0.3 }, P.chair || {});
      const castG = el(root, 'g');
      const gal = mode === 'blind' ? G.person(castG, Object.assign({ who: 'galileo', age: 'old', robe: 'scholar', cap: 'scholar', x: CH.x, y: 0.79, scale: 0.7, face: 'right', pose: 'sit', emotion: 'worried' }, P.galileo || {}), sd + 5) : null;
      const seatF = { f: inkEl(root, mix(INK.stain, INK.ink, 0.35)), l: inkEl(root, INK.ink) };
      const tbl = { f: inkEl(root, mix(INK.stain, INK.ink, 0.4)), cand: inkEl(root, INK.paperLight), flame: inkEl(root, INK.gold), glow: inkEl(root, INK.gold, { 'fill-opacity': 0.25 }), smoke: inkEl(root, INK.paperDark), l: inkEl(root, INK.ink) };
      const kasG = el(root, 'g');
      const km = P.kasif ? Object.assign({ who: 'kasif', y: 0.86 }, P.kasif) : null;
      let kas = null;
      if (km) {
        // after the walk: hold the spyglass low, then raise it to the Moon on `aim`
        const seq = (km.seq || []).slice();
        seq.push({ at: '_pick', pose: 'hold', item: 'scope', dir: -8, face: 'right', emotion: km.emotion });
        seq.push({ at: '_aim', pose: 'hold', item: 'scope', dir: km.aim_dir ?? 48, face: 'right', emotion: km.emotion });
        delete km.at; delete km.then;
        km.seq = seq;
        kas = G.person(kasG, km, sd + 6);
      }
      const fg = { books: inkEl(root, mix(INK.red, INK.ink, 0.35)), books2: inkEl(root, mix(INK.blue, INK.ink, 0.4)), pages: inkEl(root, INK.paperLight), roll: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink) };
      const labels = (P.labels || []).map((L, i) => G.label(root, L, W, H, sd + 40 + i));
      const cues2 = {};

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          const r = room.update(t, W, H, { gy, kind: 'stone', dark: true, beams: true, floor: 'planks', window: { x: WN.x, y: WN.y, w: WN.w, h: WN.h, night: true, bars: false } });
          const [x0, y0, ww, wh] = r.win;
          // the window: stars + Moon (blind: an ink blot swallows the Moon)
          const fa = P.fade ? G.atOr(cues, P.fade.at, null) : null, fk = fa == null ? 0 : progIO(lt, fa, P.fade.dur ?? 2);
          stars.update(t, x0 + 14, y0 + ww * 0.3, x0 + ww - 14, y0 + wh - 20, 1 - fk);
          const mx = x0 + ww * 0.52, my = y0 + wh * 0.36, mr = ww * 0.3 * (1 - fk * 0.25);
          moon.update(t, { x: mx, y: my, r: mr * (1 + 0.02 * Math.sin(t * 0.8)), term: -0.25, rough: 1, halo: true, shade: 0.7 });
          if (fk > 0) {
            const br = mr * 1.6 * fk, n = 16, pts = [];
            for (let i = 0; i < n; i++) { const a = i / n * G.TAU, wob = 1 + 0.18 * Math.sin(i * 2.7 + t * 1.5) * fk; pts.push([mx + Math.cos(a) * br * wob, my + Math.sin(a) * br * wob]); }
            blot.setAttribute('d', inkLoop(pts, { seed: sd + 10, t, amp: 1.2 }));
            let dl = G.ring(pts, sd + 11, t, 4, 1.2);
            for (let k = 0; k < 4; k++) { const x = mx + (k - 1.5) * br * 0.4, y0d = my + br * 0.9; dl += ' ' + G.line([[x, y0d], [x + 2, y0d + fk * (40 + k * 22)]], sd + 12 + k, t, 6, 0.6, 0.6); }
            blotL.setAttribute('d', dl);
          } else { blot.setAttribute('d', ''); blotL.setAttribute('d', ''); }
          // window bars + sill (in front of the sky)
          let bd = G.line([[x0 + ww / 2, y0 + ww * 0.1], [x0 + ww / 2, y0 + wh]], sd + 20, t, 10) + ' ' + G.line([[x0, y0 + wh * 0.55], [x0 + ww, y0 + wh * 0.55]], sd + 21, t, 10);
          for (const u of [0.25, 0.75]) bd += ' ' + G.line([[x0 + ww * u, y0 + ww * (u < 0.5 ? 0.2 : 0.2)], [x0 + ww * u, y0 + wh]], sd + 22 + u * 10, t, 5);
          bars.setAttribute('d', bd);
          sill.setAttribute('d', inkLoop([[x0 - 40, y0 + wh], [x0 + ww + 40, y0 + wh], [x0 + ww + 30, y0 + wh + 34], [x0 - 30, y0 + wh + 34]], { seed: sd + 25, t, amp: 0.4, smooth: false }));
          barsL.setAttribute('d', G.ring([[x0 - 40, y0 + wh], [x0 + ww + 40, y0 + wh], [x0 + ww + 30, y0 + wh + 34], [x0 - 30, y0 + wh + 34]], sd + 26, t, 4, 0.4));
          // moonlight falling on the floor (a pale shape that breathes; gone when the Moon goes out)
          const bk = (1 - fk) * (0.9 + 0.1 * Math.sin(t * 0.7));
          beam.setAttribute('d', bk > 0.02 ? inkLoop([[x0 + 10, y0 + wh + 34], [x0 + ww - 10, y0 + wh + 34], [x0 + ww - 120, gy + (H - gy) * 0.7], [x0 - 260, gy + (H - gy) * 0.7]], { seed: sd + 27, t, amp: 0.8, smooth: false }) : '');
          beam.setAttribute('fill-opacity', G.f1(12 * bk) / 100);
          // doorway + guard shadow
          if (door) {
            const dx0 = 0.82 * W, dx1 = 0.95 * W, dy0 = 0.2 * H, sw = Math.sin(t * 0.9) * 10;
            const fr = [[dx0 - 30, gy], [dx0 - 30, dy0 - 30], [dx1 + 30, dy0 - 30], [dx1 + 30, gy]], hole = [[dx0, gy], [dx0, dy0], [dx1, dy0], [dx1, gy]];
            door.frame.setAttribute('d', inkLoop(fr, { seed: sd + 30, t, amp: 0.4, smooth: false }));
            door.hole.setAttribute('d', inkLoop(hole, { seed: sd + 31, t, amp: 0.4, smooth: false }));
            const gx = (dx0 + dx1) / 2 + sw, gh = gy - dy0 - 60;
            const sil = [[gx - 70, gy], [gx - 66, gy - gh * 0.55], [gx - 50, gy - gh * 0.72], [gx - 28, gy - gh * 0.78], [gx - 34, gy - gh * 0.9], [gx, gy - gh], [gx + 34, gy - gh * 0.9], [gx + 28, gy - gh * 0.78], [gx + 50, gy - gh * 0.72], [gx + 66, gy - gh * 0.55], [gx + 70, gy]];
            door.guard.setAttribute('d', inkLoop(sil, { seed: sd + 32, t, amp: 0.8 }) + ' ' + G.line([[gx + 84, gy + 4], [gx + 84, gy - gh - 40]], sd + 33, t, 8) + ' ' + inkLoop([[gx + 84, gy - gh - 40], [gx + 120, gy - gh - 10], [gx + 84, gy - gh - 2], [gx + 60, gy - gh - 30]], { seed: sd + 34, t, amp: 0.6, smooth: false }));
            door.shadow.setAttribute('d', inkLoop([[dx0 + 10, gy + 4], [dx1 - 10, gy + 4], [dx0 - 120 + sw * 2, H * 0.97], [dx0 - 360 + sw * 2, H * 0.97]], { seed: sd + 35, t, amp: 0.8, smooth: false }));
            door.l.setAttribute('d', G.ring(fr, sd + 36, t, 4.5, 0.4) + ' ' + G.ring(hole, sd + 37, t, 3.5, 0.4));
          }
          // the leaning spyglass (gone once Kaşif has picked it up)
          const k1 = km && km.moves && km.moves[0] ? km.moves[0] : null;
          const wa = k1 ? G.atOr(cues, k1.at, 0) : 0;
          const pick = km ? G.atOr(cues, km.pick, wa + (k1 ? (k1.dur ?? 1.6) : 0.6)) : 1e9;
          const aim = km ? G.atOr(cues, P.aim ?? 'hit', pick + 1.2) : 1e9;
          Object.assign(cues2, cues, { _pick: pick, _aim: Math.max(aim, pick + 0.3) });
          if (lt < pick) { scope.update(t, { x: SC.x * W, y: gy + 2, ang: -82, len: 420, r: 22 }); } else scope.update(t, { x: -9999, y: -9999, ang: -82, len: 1, r: 1 });
          // the high-backed chair
          const cx = CH.x * W;
          const back = [[cx - 120, gy + 6], [cx - 126, gy - 330], [cx - 100, gy - 360], [cx - 70, gy - 330], [cx - 76, gy - 150], [cx - 96, gy + 6]];
          chair.back.setAttribute('d', inkLoop(back, { seed: sd + 40, t, amp: 0.5, smooth: false }));
          chair.l.setAttribute('d', G.ring(back, sd + 41, t, 4, 0.5) + ' ' + inkDot(cx - 100, gy - 360, 14, 14, sd + 42, t));
          if (gal) gal.update(lt, t, cues, W, H);
          const seat = [[cx - 120, gy - 92], [cx + 70, gy - 92], [cx + 60, gy - 60], [cx - 112, gy - 60]];
          seatF.f.setAttribute('d', inkLoop(seat, { seed: sd + 43, t, amp: 0.5, smooth: false }) + ' ' + inkLoop([[cx + 40, gy - 60], [cx + 60, gy - 60], [cx + 58, gy + 6], [cx + 42, gy + 6]], { seed: sd + 44, t, amp: 0.4, smooth: false }) + (gal ? '' : ' ' + inkLoop([[cx - 70, gy - 60], [cx - 50, gy - 60], [cx - 52, gy + 6], [cx - 68, gy + 6]], { seed: sd + 45, t, amp: 0.4, smooth: false })));
          seatF.l.setAttribute('d', G.ring(seat, sd + 46, t, 4, 0.5));
          // small table with the candle (blind: lit; empty: out after candle.out, smoke rising)
          const tx = 0.14 * W, ty = 0.64 * H;
          const top = [[tx - 120, ty], [tx + 120, ty], [tx + 110, ty + 24], [tx - 110, ty + 24]];
          tbl.f.setAttribute('d', inkLoop(top, { seed: sd + 50, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[tx - 14, ty + 24], [tx + 14, ty + 24], [tx + 18, gy + 6], [tx - 18, gy + 6]], { seed: sd + 51, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[tx - 80, gy - 4], [tx + 80, gy - 4], [tx + 90, gy + 10], [tx - 90, gy + 10]], { seed: sd + 52, t, amp: 0.4, smooth: false }));
          const ca = [[tx - 16, ty - 120], [tx + 16, ty - 120], [tx + 18, ty], [tx - 18, ty]];
          tbl.cand.setAttribute('d', inkLoop(ca, { seed: sd + 53, t, amp: 0.4, smooth: false }));
          const out = mode === 'empty' ? G.atOr(cues, (P.candle || {}).out, 0.3) : 1e9;
          const fl = Math.sin(t * 9) * 0.12 + Math.sin(t * 14) * 0.08;
          if (lt < out) {
            const k = lt > out - 0.3 ? (out - lt) / 0.3 : 1;
            tbl.flame.setAttribute('d', inkLoop([[tx, ty - 120 - 70 * (1 + fl) * k], [tx + 16 * k, ty - 142], [tx, ty - 122], [tx - 16 * k, ty - 142]], { seed: sd + 54, t, amp: 0.8 }));
            tbl.glow.setAttribute('d', inkCircle(tx, ty - 150, 70 * k * (1 + fl * 0.4), sd + 55, t, { fill: true }));
            tbl.smoke.setAttribute('d', '');
          } else {
            tbl.flame.setAttribute('d', ''); tbl.glow.setAttribute('d', '');
            let sm = '';
            for (let k = 0; k < 3; k++) { const age = ((lt - out) * 0.5 + k / 3) % 1, pts = []; for (let j = 0; j <= 6; j++) { const u = j / 6; pts.push([tx + Math.sin(u * 5 + t * 1.4 + k) * 20 * (u + age), ty - 124 - u * 160 - age * 120]); } sm += G.line(pts, sd + 56 + k, t, 4 * (1 - age) + 1, 0.6, 0.6) + ' '; }
            tbl.smoke.setAttribute('d', sm);
          }
          tbl.l.setAttribute('d', G.ring(top, sd + 60, t, 4, 0.4) + ' ' + G.ring(ca, sd + 61, t, 3.5, 0.4) + ' ' + G.line([[tx, ty - 120], [tx, ty - 132]], sd + 62, t, 3));
          if (kas) kas.update(lt, t, cues2, W, H);
          // foreground: a pile of books and a rolled star chart on the floor, lower left
          const bx = 0.06 * W, by = H + 10;
          let b1 = '', b2 = '', pg = '';
          [[0, 0, 300, 60, 1], [20, -60, 260, 52, 2], [-10, -112, 280, 48, 1], [30, -160, 220, 44, 2]].forEach(([dx, dy, w, h, c], i) => {
            const p = [[bx + dx, by + dy - h], [bx + dx + w, by + dy - h - 4], [bx + dx + w + 4, by + dy], [bx + dx - 2, by + dy]];
            if (c === 1) b1 += inkLoop(p, { seed: sd + 70 + i, t, amp: 0.4, smooth: false }) + ' '; else b2 += inkLoop(p, { seed: sd + 70 + i, t, amp: 0.4, smooth: false }) + ' ';
            pg += inkLoop([[bx + dx + w - 30, by + dy - h + 8], [bx + dx + w, by + dy - h + 6], [bx + dx + w + 2, by + dy - 8], [bx + dx + w - 30, by + dy - 8]], { seed: sd + 80 + i, t, amp: 0.3, smooth: false }) + ' ';
          });
          fg.books.setAttribute('d', b1); fg.books2.setAttribute('d', b2); fg.pages.setAttribute('d', pg);
          const rl = inkEllipsePts(0.24 * W, H * 0.97, 180, 34, sd + 90, 12, -0.08);
          fg.roll.setAttribute('d', inkLoop(rl, { seed: sd + 90, t, amp: 0.5 }));
          fg.l.setAttribute('d', G.ring(rl, sd + 91, t, 4, 0.5) + ' ' + inkCircle(0.24 * W + 178, H * 0.97 - 14, 30, sd + 92, t, { w: 3.5 }) + ' ' + G.line([[bx - 10, by - 205], [bx + 300, by - 210]], sd + 93, t, 2));
          labels.forEach(l => l.update(lt, t, cues));
          void hp;
        },
      };
    },
  };
})();
