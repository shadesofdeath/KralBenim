// pgc_gage: a parchment stage for Phineas Gage scenes (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via
// _ink.js; pure function of (seed, lt)). Uses writer B's shared cast (window.PGB.cast: `gage: true` draws Gage's head
// bandage + eye patch, `gage: {cap: true, bandage: false, patch: false}` the 1848 cap) and window.MCB labels, so Gage
// looks the same in every chapter. Written for ag-04-phineas-gage (chapters 4-5), parametric.
//   P: {bg: "hills" | "study" | "plain",
//       ground: 0.84 (0..1 H),
//       chart: {x: 0.5, y: 0.2, w: 0.3, h: 0.42, at: cue (lobe borders draw in), red: cue (front lobe turns red), q: true (a "?" until `at`)}
//         a pinned paper on an easel with a brain outline
//       desk: {x: 0.5, w: 0.3}            (a plain table in front of the chart)
//       iron: {x: 0.6, at: cue|sec, ang: -12} (the tamping iron standing on its butt, leaning; pops in at `at`)
//       house: {x: 0.8, scale: 1}         (a small house)
//       divider: {x: 0.5, at}             (dashed vertical line, e.g. between an old and a new Gage)
//       cast: [PGB cast entries: {who, x, y, scale, pose, face, at, then, to, walk_at, walk_dur, seq, text, item, gage, alpha, hide_until, shake}],
//       labels: [MCB labels: {text, x, y, at, size, color, font: "serif", stamp, strike, arrow, rot}],
//       cam: {zoom: 1.05, focus: [0.5, 0.55]}}
//   cues: hit (punch) + whatever cast / labels / chart / iron use
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (p, fill = INK.ink, extra) => inkEl(p, fill, extra);
  // brain outline (face left), unit = half-height
  const OUT = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [0.5, -0.88], [0.85, -0.6], [1.0, -0.2],
    [0.98, 0.18], [0.84, 0.42], [0.62, 0.5], [0.42, 0.52], [0.22, 0.62], [-0.05, 0.7], [-0.32, 0.66], [-0.55, 0.52], [-0.78, 0.38]];
  const FRONT = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [-0.05, -0.6], [-0.15, -0.25], [-0.22, -0.02], [-0.6, 0.14], [-0.76, 0.37]];
  const SUL = [[[-0.05, -0.98], [-0.05, -0.6], [-0.15, -0.25], [-0.22, -0.02]], [[-0.62, 0.14], [-0.22, -0.02], [0.3, -0.12], [0.5, -0.3]], [[0.7, -0.74], [0.5, -0.3], [0.55, 0.1], [0.62, 0.48]]];

  SH.pgc_gage = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const PGB = window.PGB, MCB = window.MCB, sd = seed * 1000 + 457;
      const G = (P.ground ?? 0.84) * H, bg = P.bg || 'hills';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const back = { f: mk(cam, INK.paperDark, { 'fill-opacity': 0.45 }), r: mk(cam, INK.inkSoft), g: mk(cam), x: mk(cam, INK.inkSoft) };
      const r = rng(seed * 37 + 3), ticks = Array.from({ length: 10 }, () => [r(), r()]);
      const study = bg === 'study' ? { win: { f: mk(cam, INK.paperLight), r: mk(cam) }, shelf: mk(cam), books: Array.from({ length: 9 }, (_, i) => mk(cam, [INK.red, INK.blue, INK.green, INK.hat, INK.inkSoft][i % 5], { 'fill-opacity': 0.8 })) } : null;
      const house = P.house ? { f: mk(cam, INK.paperLight), r: mk(cam), roof: mk(cam, INK.red, { 'fill-opacity': 0.75 }) } : null;
      const chart = P.chart ? { f: mk(cam, INK.paperLight), r: mk(cam), legs: mk(cam), red: mk(cam, INK.red, { 'fill-opacity': 0 }), b: mk(cam), s: mk(cam), q: null } : null;
      if (chart && P.chart.q !== false) { chart.q = el(cam, 'text', { 'font-family': MCB.FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.red }); chart.q.textContent = '?'; }
      const desk = P.desk ? { f: mk(cam, INK.paperDark), r: mk(cam) } : null;
      const iron = P.iron ? { f: mk(cam, INK.inkSoft), r: mk(cam) } : null;
      const divider = P.divider ? mk(cam, INK.inkSoft) : null;
      const castG = el(cam, 'g'), labG = el(cam, 'g');
      const cast = PGB.cast(castG, P.cast || [], W, H, sd + 100);
      const labs = MCB.labels(labG, P.labels || [], W, H, sd + 300);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          MCB.camPush(cam, lt, dur, W, H, P.cam || {}, hit);
          // background
          if (bg === 'hills') {
            const pts = [[-60, G - 0.2 * H], [W * 0.2, G - 0.28 * H], [W * 0.45, G - 0.22 * H], [W * 0.7, G - 0.3 * H], [W + 60, G - 0.22 * H]];
            back.f.setAttribute('d', inkLoop(pts.concat([[W + 60, G], [-60, G]]), O(1)));
            back.r.setAttribute('d', inkPath(pts, O(1, { w: 4 })));
          } else if (bg === 'study') {
            const wy = G - 0.24 * H;
            back.r.setAttribute('d', inkPath([[-60, wy], [W + 60, wy]], O(1, { w: 4 })) + ' ' + inkPath([[-60, wy + 16], [W + 60, wy + 16]], O(2, { w: 3 })));
            const wx = 0.86 * W, wbox = [[wx - 110, 0.12 * H], [wx + 110, 0.12 * H], [wx + 110, 0.42 * H], [wx - 110, 0.42 * H]];
            study.win.f.setAttribute('d', inkLoop(wbox, O(3, { smooth: false })));
            study.win.r.setAttribute('d', inkPath(wbox, O(3, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[wx, 0.12 * H], [wx, 0.42 * H]], O(4, { w: 4 })) + ' ' + inkPath([[wx - 110, 0.27 * H], [wx + 110, 0.27 * H]], O(5, { w: 4 })));
            const sx = 0.05 * W, sy = 0.42 * H;
            study.shelf.setAttribute('d', inkPath([[sx - 20, sy], [sx + 230, sy]], O(6, { w: 7 })));
            study.books.forEach((b, i) => { const x = sx + i * 24, h = 70 + (i * 37 % 40); b.setAttribute('d', inkLoop([[x, sy - 4], [x + 20, sy - 4], [x + 20, sy - h], [x, sy - h]], O(10 + i, { smooth: false, amp: 0.8 }))); });
          }
          back.g.setAttribute('d', inkPath([[-60, G], [W + 60, G]], O(20, { w: 7 })));
          back.x.setAttribute('d', ticks.map((q, i) => { const x = 40 + q[0] * (W - 80), y = G + 22 + q[1] * 30; return inkPath([[x, y], [x + 26, y - 2]], O(30 + i, { w: 3 })); }).join(' '));
          if (house) {
            const hx = P.house.x * W, s = P.house.scale ?? 1, w = 130 * s, h = 120 * s;
            const body = [[hx - w, G], [hx - w, G - h], [hx + w, G - h], [hx + w, G]], roof = [[hx - w - 24 * s, G - h], [hx, G - h - 110 * s], [hx + w + 24 * s, G - h]];
            house.f.setAttribute('d', inkLoop(body, O(40, { smooth: false })));
            house.roof.setAttribute('d', inkLoop(roof, O(41, { smooth: false })));
            house.r.setAttribute('d', inkPath(body, O(40, { w: 6, closed: true, smooth: false })) + ' ' + inkPath(roof, O(41, { w: 6, closed: true, smooth: false })) + ' ' +
              inkPath([[hx - 26 * s, G], [hx - 26 * s, G - 70 * s], [hx + 26 * s, G - 70 * s], [hx + 26 * s, G]], O(42, { w: 5, smooth: false })) + ' ' +
              inkPath([[hx + 60 * s, G - 80 * s], [hx + 100 * s, G - 80 * s], [hx + 100 * s, G - 44 * s], [hx + 60 * s, G - 44 * s]], O(43, { w: 4, closed: true, smooth: false })));
          }
          if (chart) {
            const C = P.chart, cx = (C.x ?? 0.5) * W, y0 = (C.y ?? 0.2) * H, cw = (C.w ?? 0.3) * W, ch = (C.h ?? 0.42) * H, sp = spring(lt, 0.05, 0.6);
            const box = [[cx - cw / 2, y0], [cx + cw / 2, y0 + 4], [cx + cw / 2 + 2, y0 + ch], [cx - cw / 2, y0 + ch - 3]].map(p => [cx + (p[0] - cx) * sp, y0 + (p[1] - y0) * sp]);
            chart.f.setAttribute('d', inkLoop(box, O(50, { smooth: false })));
            chart.r.setAttribute('d', inkPath(box, O(50, { w: 6, closed: true, smooth: false })));
            chart.legs.setAttribute('d', inkPath([[cx - cw * 0.3, y0 + ch], [cx - cw * 0.4, G]], O(51, { w: 7 })) + ' ' + inkPath([[cx + cw * 0.3, y0 + ch], [cx + cw * 0.4, G]], O(52, { w: 7 })) + ' ' + inkPath([[cx, y0 + ch], [cx + 10, G - 30]], O(53, { w: 6 })));
            const R = Math.min(cw / 2.8, ch / 2.6), bx = cx, by = y0 + ch * 0.5;
            const B = q => [bx + q[0] * R * 1.25 * sp, by + q[1] * R * sp];
            chart.b.setAttribute('d', inkPath(OUT.map(B), O(54, { w: 6, closed: true })));
            const la = atOr(cues, C.at, 1e9), lp = prog(lt, la, 0.9);
            chart.s.setAttribute('d', lp > 0.01 ? SUL.map((s, i) => { const n = Math.max(2, Math.round(s.length * lp)); return inkPath(s.slice(0, n).map(B), O(60 + i, { w: 5 })); }).join(' ') : '');
            const ra = atOr(cues, C.red, 1e9);
            chart.red.setAttribute('d', inkLoop(FRONT.map(B), O(70, { amp: 1 })));
            chart.red.setAttribute('fill-opacity', f1(0.45 * sm((lt - ra) / 0.5) * 100) / 100);
            if (chart.q) {
              const qa = clamp01(1 - sm((lt - la) / 0.3)) * sp, b = boil(sd + 80, t, 2);
              chart.q.setAttribute('opacity', f1(qa * 10) / 10);
              chart.q.setAttribute('transform', `translate(${f1(bx + b[0])} ${f1(by + 42 + Math.sin(lt * 2.4) * 8 + b[1])}) rotate(${f1(Math.sin(lt * 1.7) * 8)})`);
            }
          }
          if (desk) {
            const dx = P.desk.x * W, dw = (P.desk.w ?? 0.3) * W / 2, dy = G - 150;
            const top = [[dx - dw, dy], [dx + dw, dy], [dx + dw, dy + 26], [dx - dw, dy + 26]];
            desk.f.setAttribute('d', inkLoop(top, O(90, { smooth: false })));
            desk.r.setAttribute('d', inkPath(top, O(90, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[dx - dw + 24, dy + 26], [dx - dw + 24, G]], O(91, { w: 7 })) + ' ' + inkPath([[dx + dw - 24, dy + 26], [dx + dw - 24, G]], O(92, { w: 7 })));
          }
          if (iron) {
            const I = P.iron, ia = atOr(cues, I.at, 0.1), sp = spring(lt, ia, 0.6), x = (I.x ?? 0.6) * W, ang = ((I.ang ?? -12) + Math.sin(lt * 1.3) * 1.2) * Math.PI / 180;
            const L = 0.58 * H * Math.max(0.01, sp), ux = Math.sin(ang), uy = -Math.cos(ang), nx = -uy * 9, ny = ux * 9;
            const tip = [x + ux * L, G + uy * L];
            const poly = [[x + nx, G + ny], [x + ux * L * 0.7 + nx, G + uy * L * 0.7 + ny], tip, [x + ux * L * 0.7 - nx, G + uy * L * 0.7 - ny], [x - nx, G - ny]];
            iron.f.setAttribute('d', lt >= ia ? inkLoop(poly, O(95, { smooth: false, amp: 0.8 })) : '');
            iron.r.setAttribute('d', lt >= ia ? inkPath(poly, O(95, { w: 5, closed: true, smooth: false, amp: 0.8 })) : '');
          }
          if (divider) {
            const dx = P.divider.x * W, dp = prog(lt, atOr(cues, P.divider.at, 0.1), 0.8);
            let d = '';
            for (let k = 0; k < 12; k++) { const a = 0.1 + k * 0.065; if (a < 0.1 + 0.78 * dp) d += ' ' + inkPath([[dx, a * H], [dx + 2, (a + 0.035) * H]], O(100 + k, { w: 5 })); }
            divider.setAttribute('d', d);
          }
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
