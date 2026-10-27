// tank_room: a 1915-1916 staff room (Admiralty committee, army headquarters) in parchment ink (BRAND.md §3, §5; set
// "interior"). Wainscot wall, a tall window with light falling in, a framed chart on the wall ("ship": a battleship
// sketch that sprouts tracks at cue `idea`; "front": a map with the red zig-zag trench line and a pin that jabs at
// cue `pin`), a swinging ceiling lamp, a long table with scattered papers and a curling pipe smoke, and the cast
// (bb__lib) with period caps and moustaches drawn over the heads.
// P: {ground: 0.86, chart: "ship"|"front"|false, chart_x: 0.5, chart_w: 0.34, table: true, lamp: true, smoke: [x, y] (0..1, pipe smoke),
//     cast: [... + helmet: "naval"|"cap"|"top", moustache: true], labels}
// cues: idea, pin, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 787;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const gy = (P.ground ?? 0.86) * H;
      const lay = { wall: L(INK.inkSoft), winF: L(INK.paperLight), winI: L(INK.ink), beam: L(INK.paperLight, { 'fill-opacity': 0.55 }),
        chartF: L(INK.paperLight), chartI: L(INK.ink), chartB: L(INK.blue), chartR: L(INK.red), lampF: L(INK.gold), lampI: L(INK.ink),
        tableF: L(INK.paperDark), tableI: L(INK.ink), papers: L(INK.paperLight), papersI: L(INK.inkSoft), smoke: L(INK.inkSoft) };
      const castG = el(cam, 'g'), capF = L(INK.inkSoft), capI = L(INK.ink);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const chx = (P.chart_x ?? 0.5) * W, chw = (P.chart_w ?? 0.34) * W, chh = chw * 0.58, chy = H * 0.12;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.1, w: 5 }, extra || {});
          const WL = [inkPath([[-20, gy - 300], [W + 20, gy - 300]], o(1, { w: 4 })), inkPath([[-20, gy - 290], [W + 20, gy - 290]], o(2, { w: 2 })), inkPath([[-20, gy], [W + 20, gy]], o(3, { w: 6 }))];
          for (let x = 60; x < W; x += 160) WL.push(inkPath([[x, gy - 280], [x, gy - 20]], o(10 + x, { w: 2.4 })));
          lay.wall.setAttribute('d', WL.join(' '));
          // window (left) + light beam
          const wx0 = W * (P.win_x ?? 0.82), wx1 = wx0 + W * 0.13, wy0 = H * 0.1, wy1 = gy - 330;
          const win = [[wx0, wy1], [wx0, wy0 + 50], [(wx0 + wx1) / 2, wy0], [wx1, wy0 + 50], [wx1, wy1]];
          lay.winF.setAttribute('d', inkLoop(win, o(20, { smooth: false })));
          lay.winI.setAttribute('d', inkPath(win.concat([win[0]]), o(21, { smooth: false, w: 6 })) + ' ' + inkPath([[(wx0 + wx1) / 2, wy0 + 10], [(wx0 + wx1) / 2, wy1]], o(22, { w: 3 })) + ' ' +
            inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], o(23, { w: 3 })));
          const sway = Math.sin(lt * 0.4) * 10;
          lay.beam.setAttribute('d', inkLoop([[wx0, wy0 + 60], [wx1, wy0 + 60], [wx1 - 160 + sway, gy], [wx0 - 380 + sway, gy]], o(24, { smooth: false, amp: 0.5 })));
          // wall chart
          if (P.chart !== false) {
            const c0 = [chx - chw / 2, chy], c1 = [chx + chw / 2, chy + chh];
            const fr = [[c0[0], c0[1]], [c1[0], c0[1]], [c1[0], c1[1]], [c0[0], c1[1]]];
            lay.chartF.setAttribute('d', inkLoop(fr, o(30, { smooth: false })));
            const CI = [inkPath(fr, o(31, { closed: true, smooth: false, w: 7 })), inkPath([[chx - 40, chy], [chx, chy - 50], [chx + 40, chy]], o(32, { w: 3 }))], CB = [], CR = [];
            const X = (u, v) => [chx + u * chw / 2, chy + chh / 2 + v * chh / 2];
            if ((P.chart || 'ship') === 'ship') {
              const hull = [X(-0.8, 0.1), X(0.85, 0.1), X(0.78, 0.35), X(-0.75, 0.35)];
              CB.push(inkPath(hull.concat([hull[0]]), o(33, { w: 5, smooth: false })), inkPath([X(-0.25, 0.1), X(-0.25, -0.2), X(0.25, -0.2), X(0.25, 0.1)], o(34, { w: 4, smooth: false })),
                inkPath([X(-0.05, -0.2), X(-0.05, -0.55)], o(35, { w: 6 })), inkPath([X(0.12, -0.2), X(0.12, -0.5)], o(36, { w: 6 })));
              const ia = at('idea', null), ip = ia == null ? 0 : progIO(lt, ia, 1.2);
              if (ip > 0) [[-0.7, -0.08], [0.08, 0.72]].forEach(([a, b], k) => { const lp = [X(a, 0.38), X(b, 0.38), X(b + 0.06, 0.55), X(b, 0.72), X(a, 0.72), X(a - 0.06, 0.55)];
                CR.push(inkPath(lp.slice(0, Math.max(2, Math.round(lp.length * ip))).concat(ip >= 1 ? [lp[0]] : []), o(37 + k, { w: 6, smooth: false }))); });
              else for (let k = 0; k < 5; k++) CB.push(inkPath([X(-0.8 + k * 0.38, 0.5), X(-0.7 + k * 0.38, 0.42), X(-0.6 + k * 0.38, 0.5)], o(40 + k, { w: 3 })));
            } else {
              CB.push(inkPath([X(-0.9, -0.6), X(-0.6, -0.5), X(-0.5, -0.1), X(-0.75, 0.2), X(-0.9, 0.3)], o(33, { w: 4 })));
              const fl = [X(-0.55, -0.85), X(-0.45, -0.4), X(-0.5, -0.05), X(-0.25, 0.15), X(0.2, 0.25), X(0.5, 0.45), X(0.7, 0.85)];
              CR.push(inkPath(fl, o(34, { w: 6 })));
              const pa = at('pin', null), pk = pa == null ? 0 : spring(lt, pa, 0.4), pp = X(-0.5, -0.12);
              if (pk > 0) { CR.push(inkDot(pp[0], pp[1] - 30 * (1 - pk), 16, 16, sd + 35, t)); CI.push(inkPath([[pp[0], pp[1] - 30 * (1 - pk)], [pp[0] + 30, pp[1] + 40 - 30 * (1 - pk)]], o(36, { w: 4 }))); }
            }
            lay.chartI.setAttribute('d', CI.join(' ')); lay.chartB.setAttribute('d', CB.join(' ')); lay.chartR.setAttribute('d', CR.join(' '));
          }
          // lamp
          if (P.lamp !== false) { const lx = W * (P.lamp_x ?? 0.72), sw = Math.sin(lt * 1.2) * 0.06, len = H * 0.2, tip = [lx + Math.sin(sw) * len, Math.cos(sw) * len];
            lay.lampI.setAttribute('d', inkPath([[lx, -10], tip], o(50, { w: 4 })) + ' ' + inkPath([[tip[0] - 60, tip[1] + 50], [tip[0], tip[1]], [tip[0] + 60, tip[1] + 50]], o(51, { w: 6, smooth: false })) + ' ' +
              inkPath([[tip[0] - 60, tip[1] + 50], [tip[0] + 60, tip[1] + 50]], o(52, { w: 5 })));
            lay.lampF.setAttribute('d', inkDot(tip[0], tip[1] + 58, 20 + Math.sin(lt * 9) * 1.5, 14, sd + 53, t)); }
          // table + papers
          if (P.table !== false) {
            const tx0 = W * (P.table_x0 ?? 0.3), tx1 = W * (P.table_x1 ?? 0.78), ty = gy - 170;
            const top = [[tx0 - 20, ty], [tx1 + 20, ty], [tx1 + 50, ty + 26], [tx0 - 50, ty + 26]];
            lay.tableF.setAttribute('d', inkLoop(top, o(60, { smooth: false })));
            lay.tableI.setAttribute('d', inkPath(top, o(61, { closed: true, smooth: false, w: 6 })) + ' ' + [tx0, tx1].map((x, k) => inkPath([[x, ty + 26], [x, gy]], o(62 + k, { w: 9 }))).join(' '));
            const PA = [], PI = []; for (let k = 0; k < 4; k++) { const px = lerp(tx0 + 40, tx1 - 120, k / 3), q = [[px, ty - 2], [px + 110, ty - 6], [px + 118, ty - 22 - (k % 2) * 6], [px + 6, ty - 18]];
              PA.push(inkLoop(q, o(70 + k, { smooth: false, amp: 0.6 }))); PI.push(inkPath(q, o(80 + k, { closed: true, smooth: false, w: 2.5 }))); }
            lay.papers.setAttribute('d', PA.join(' ')); lay.papersI.setAttribute('d', PI.join(' '));
          }
          if (P.smoke) { const [sx, sy] = [P.smoke[0] * W, P.smoke[1] * H], SM = []; for (let k = 0; k < 4; k++) { const age = (lt * 0.4 + k / 4) % 1, pts = [];
            for (let j = 0; j < 6; j++) pts.push([sx + Math.sin(age * 6 + j * 0.8 + k) * (8 + age * 20), sy - age * 220 - j * 22]); SM.push(inkPath(pts, o(90 + k, { w: 3 * (1 - age) + 0.6 }))); }
            lay.smoke.setAttribute('d', SM.join(' ')); }
          const cres = cast.update(lt, t, cues), CF = [], CI2 = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return; if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 200 + i * 20); CF.push(h.fill); CI2.push(h.ink); }
            if (m.moustache) CI2.push(T.moustache(q.head, q.face, q.s, t, sd + 260 + i * 7));
            if (m.bowtie) { const b = T.bowtie(q.head, q.face, q.s, t, sd + 280 + i * 5); CF.push(b.fill); CI2.push(b.ink); }
            if (m.cigar) { const c = T.cigar(q.head, q.face, q.s, lt, t, sd + 290 + i * 9); CI2.push(c.ink); CF.push(c.smoke); } });
          capF.setAttribute('d', CF.join(' ')); capI.setAttribute('d', CI2.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
