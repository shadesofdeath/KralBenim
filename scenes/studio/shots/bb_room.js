// bb_room: a 19th-century sickroom with a tall window, parchment ink (theme "parchment", BRAND.md §3, §5).
// Striped wallpaper, a tall sash window with swaying red curtains, and through the glass the river with a small
// suspension bridge (two Gothic towers, cables drawing in), drifting clouds and gulls; an armchair, a telescope on a
// tripod aimed out of the window from a seated cast member's eye, floorboards. Parametric for any "watching from the
// window" moment.
// P: {
//   floor: 0.6 (0..1 H, cast ground), window: [0.44, 0.2, 0.94, 0.52] (x0, y0, x1, y1 as 0..1),
//   view: {towers: true, cables: {at, dur: 2} | true, water: 0.75 (0..1 of the window height)},
//   chair: {x: 0.34, face: "right"} | false, telescope: index of the cast member whose eye it sits at | false,
//   desk: {x: 0.12, papers: true} | false,
//   cast: [...] (bb__lib), labels: [...], cam: {z0, zoom, focus, pan}
// }
// cues: view.cables.at, labels, cast, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  SH.bb_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 777;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        wall: L(INK.inkSoft, { 'fill-opacity': 0.5 }),
        glass: L(INK.paperLight), cloud: L(INK.paper), cloudI: L(INK.inkSoft),
        vWater: L(INK.paperDark), vWaterI: L(INK.blue, { 'fill-opacity': 0.75 }),
        vTow: L(INK.paperDark), vI: L(INK.ink), vS: L(INK.inkSoft),
        frameF: L(INK.paperDark), frameI: L(INK.ink),
        curt: L(INK.red), curtI: L(INK.ink),
        floorF: L(INK.paperDark), floorI: L(INK.inkSoft),
        deskF: L(INK.paperDark), deskL: L(INK.paperLight), deskI: L(INK.ink),
        chairF: L(INK.red), chairD: L(INK.paperDark), chairI: L(INK.ink),
      };
      const castG = el(cam, 'g');
      const scope = { f: inkEl(cam, INK.gold), i: inkEl(cam, INK.ink) };
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);

      const yf = (P.floor ?? 0.6) * H;
      const [wx0r, wy0r, wx1r, wy1r] = P.window || [0.44, 0.2, 0.94, 0.52];
      const wx0 = wx0r * W, wy0 = wy0r * H, wx1 = wx1r * W, wy1 = wy1r * H, ww = wx1 - wx0, wh = wy1 - wy0;
      const V = Object.assign({ towers: true, cables: true, water: 0.72 }, P.view || {});
      const CH = P.chair === false ? null : Object.assign({ x: 0.34, face: 'right' }, P.chair || {});
      const DK = P.desk ? Object.assign({ x: 0.12, papers: true }, P.desk === true ? {} : P.desk) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = base => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.1, w: 5 }, extra);
          const hit = punch(lt, at('hit', null), 0.6);
          B.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.55, 0.45] }, P.cam || {}), hit, 0);

          // wallpaper: thin vertical stripes with small diamonds
          const WL = [];
          for (let x = 30, k = 0; x < W; x += 90, k++) {
            if (x > wx0 - 30 && x < wx1 + 30) continue;
            WL.push(inkPath([[x, 0], [x, yf - 4]], o(sd + 100)(k, { w: 2, amp: 0.6 })));
            for (let y = 120 + (k % 2) * 60; y < yf - 40; y += 120) WL.push(inkLoop([[x + 45, y - 12], [x + 55, y], [x + 45, y + 12], [x + 35, y]], o(sd + 140 + k * 20)(Math.round(y), { amp: 0.5, smooth: false })));
          }
          lay.wall.setAttribute('d', WL.join(' '));

          // view through the window
          lay.glass.setAttribute('d', inkLoop(rect(wx0, wy0, wx1, wy1), o(sd + 200)(1, { smooth: false, amp: 0.6 })));
          const CL = [], CI = [];
          for (let k = 0; k < 3; k++) {
            const cx = wx0 + ((lt * (14 + k * 6) + k * 190) % (ww + 200)) - 100, cy = wy0 + wh * (0.14 + k * 0.1);
            if (cx < wx0 + 40 || cx > wx1 - 40) continue;
            const pts = [[cx - 60, cy], [cx - 40, cy - 22], [cx - 6, cy - 30], [cx + 30, cy - 20], [cx + 60, cy], [cx, cy + 6]];
            CL.push(inkLoop(pts, o(sd + 220 + k)(0, { amp: 0.8 }))); CI.push(inkPath(pts, o(sd + 230 + k)(0, { closed: true, w: 3, amp: 0.8 })));
          }
          lay.cloud.setAttribute('d', CL.join(' ')); lay.cloudI.setAttribute('d', CI.join(' '));
          const yWv = wy0 + wh * V.water;
          lay.vWater.setAttribute('d', inkLoop(rect(wx0 + 4, yWv, wx1 - 4, wy1 - 4), o(sd + 240)(1, { smooth: false, amp: 0.6 })));
          const VW = [];
          for (let r = 0; r < 3; r++) { const y = yWv + 18 + r * 26, off = (lt * (12 + r * 4)) % 90; for (let x = wx0 + 10 + off; x < wx1 - 50; x += 90) VW.push(inkPath([[x, y], [x + 20, y - 4], [x + 40, y]], o(sd + 250 + r * 20)(Math.round((x - off) / 90), { w: 2.6, amp: 0.5 }))); }
          lay.vWaterI.setAttribute('d', VW.join(' '));
          const VT = [], VI = [], VS = [];
          if (V.towers) {
            const tA = wx0 + ww * 0.3, tB = wx0 + ww * 0.78, ttop = wy0 + wh * 0.28, tw2 = ww * 0.05, ydk = yWv - wh * 0.14;
            [tA, tB].forEach((cx, j) => {
              const pts = [[cx - tw2, yWv + 4], [cx - tw2 * 0.85, ttop], [cx + tw2 * 0.85, ttop], [cx + tw2, yWv + 4]];
              VT.push(inkLoop(pts, o(sd + 300 + j)(0, { smooth: false, amp: 0.6 })));
              VI.push(inkPath(pts, o(sd + 310 + j)(0, { closed: true, w: 3.5, smooth: false, amp: 0.6 })));
              [-1, 1].forEach((s, q) => VS.push(inkPath([[cx + s * tw2 * 0.45, ydk + 6], [cx + s * tw2 * 0.45, ttop + wh * 0.07]], o(sd + 320 + j * 4 + q)(0, { w: 3, amp: 0.4 }))));
            });
            VI.push(inkPath([[wx0 + 4, ydk], [wx1 - 4, ydk]], o(sd + 330)(0, { w: 4, amp: 0.5 })));
            const cp = V.cables === false ? 0 : V.cables === true ? 1 : progIO(lt, at(V.cables.at, 0.2), V.cables.dur || 2);
            if (cp > 0) {
              const main = [];
              for (let i = 0; i <= 14; i++) { const u = i / 14; main.push([lerp(tA, tB, u), ydk - 8 + (ttop - ydk + 8) * Math.pow(2 * u - 1, 2)]); }
              const n = Math.max(2, Math.ceil(main.length * cp));
              VI.push(inkPath(main.slice(0, n), o(sd + 340)(0, { w: 3, amp: 0.5 })));
              main.slice(1, n - 1).forEach((q, i) => VS.push(inkPath([[q[0], q[1]], [q[0], ydk]], o(sd + 350 + i)(0, { w: 1.6, amp: 0.3 }))));
              VI.push(inkPath([[tA, ttop], [wx0 + 4, ydk - 4]], o(sd + 370)(0, { w: 3, amp: 0.5 })));
              VI.push(inkPath([[tB, ttop], [wx1 - 4, ydk - 4]], o(sd + 371)(0, { w: 3, amp: 0.5 })));
            }
          }
          // gull
          { const gx = wx0 + 40 + ((lt * 40) % (ww - 80)), gy = wy0 + wh * 0.2 + Math.sin(lt * 1.5) * 8, fl = Math.sin(lt * 7) * 6;
            VS.push(inkPath([[gx - 16, gy - fl], [gx - 6, gy - 4], [gx, gy], [gx + 6, gy - 4], [gx + 16, gy - fl]], o(sd + 380)(0, { w: 2.6, amp: 0.4 }))); }
          lay.vTow.setAttribute('d', VT.join(' ')); lay.vI.setAttribute('d', VI.join(' ')); lay.vS.setAttribute('d', VS.join(' '));

          // window frame + sash bars + sill
          const fr = 22, FF = [], FI = [];
          FF.push(inkLoop([[wx0 - fr, wy0 - fr], [wx1 + fr, wy0 - fr], [wx1 + fr, wy1 + fr], [wx0 - fr, wy1 + fr], [wx0 - fr, wy0 - fr], [wx0, wy0], [wx0, wy1], [wx1, wy1], [wx1, wy0], [wx0, wy0]], o(sd + 400)(1, { smooth: false, amp: 0.5 })));
          FI.push(inkPath(rect(wx0 - fr, wy0 - fr, wx1 + fr, wy1 + fr), o(sd + 400)(2, { closed: true, w: 5, smooth: false })));
          FI.push(inkPath(rect(wx0, wy0, wx1, wy1), o(sd + 400)(3, { closed: true, w: 4, smooth: false })));
          FI.push(inkPath([[wx0, wy0 + wh * 0.5], [wx1, wy0 + wh * 0.5]], o(sd + 400)(4, { w: 8 })));
          FI.push(inkPath([[wx0 + ww * 0.5, wy0], [wx0 + ww * 0.5, wy1]], o(sd + 400)(5, { w: 6 })));
          const sill = rect(wx0 - fr - 30, wy1 + fr, wx1 + fr + 30, wy1 + fr + 26);
          FF.push(inkLoop(sill, o(sd + 400)(6, { smooth: false })));
          FI.push(inkPath(sill, o(sd + 400)(7, { closed: true, w: 4, smooth: false })));
          lay.frameF.setAttribute('d', FF.join(' ')); lay.frameI.setAttribute('d', FI.join(' '));
          // curtains
          const CU = [], CUI = [];
          [[wx0 - fr - 14, 1], [wx1 + fr + 14, -1]].forEach(([x, s], j) => {
            const sw = Math.sin(lt * 1.1 + j * 2) * 8, pts = [[x - s * 16, wy0 - fr - 40], [x + s * 30, wy0 - fr - 40], [x + s * 20 + sw, wy0 + wh * 0.4], [x + s * 40 + sw * 1.4, wy1 + fr + 60], [x - s * 16, wy1 + fr + 60]];
            CU.push(inkLoop(pts, o(sd + 450 + j)(0, { amp: 1 })));
            CUI.push(inkPath(pts, o(sd + 460 + j)(0, { closed: true, w: 4.5, amp: 1 })));
            for (let f = 1; f < 3; f++) CUI.push(inkPath([[x + s * (f * 14 - 4), wy0 - fr - 30], [x + s * (f * 13) + sw * 0.8, wy1 + fr + 50]], o(sd + 470 + j * 5 + f)(0, { w: 2.4, amp: 0.6 })));
          });
          CUI.push(inkPath([[wx0 - fr - 90, wy0 - fr - 40], [wx1 + fr + 90, wy0 - fr - 40]], o(sd + 480)(0, { w: 8 })));
          lay.curt.setAttribute('d', CU.join(' ')); lay.curtI.setAttribute('d', CUI.join(' '));

          // floor
          lay.floorF.setAttribute('d', inkLoop(rect(-60, yf, W + 60, H + 60), o(sd + 500)(1, { smooth: false, amp: 0.8 })));
          const FL = [inkPath([[-60, yf], [W + 60, yf]], o(sd + 500)(2, { w: 6 }))];
          for (let r = 1; r < 6; r++) FL.push(inkPath([[-60, yf + r * 62], [W + 60, yf + r * 62]], o(sd + 510)(r, { w: 2.2, amp: 0.6 })));
          for (let k = -6; k < 14; k++) FL.push(inkPath([[W / 2 + k * 60, yf + 4], [W / 2 + k * 140, H + 40]], o(sd + 520)(k + 6, { w: 2, amp: 0.6 })));
          lay.floorI.setAttribute('d', FL.join(' '));

          // desk with papers (plans)
          if (DK) {
            const dx = DK.x * W, top = yf - 230, D1 = [], D2 = [], D3 = [];
            D1.push(inkLoop(rect(dx - 120, top, dx + 120, top + 26), o(sd + 600)(1, { smooth: false })));
            D3.push(inkPath(rect(dx - 120, top, dx + 120, top + 26), o(sd + 600)(2, { closed: true, w: 4, smooth: false })));
            [[-104], [100]].forEach(([lx], j) => D3.push(inkPath([[dx + lx, top + 26], [dx + lx + (j ? 6 : -6), yf]], o(sd + 600)(3 + j, { w: 7 }))));
            if (DK.papers) {
              const pts = [[dx - 90, top - 4], [dx + 60, top - 10], [dx + 80, top - 2], [dx - 70, top + 4]];
              D2.push(inkLoop(pts, o(sd + 600)(6, { smooth: false })));
              D3.push(inkPath(pts, o(sd + 600)(7, { closed: true, w: 3, smooth: false })));
              const pts2 = rect(dx - 40, top - 60, dx + 40, top - 4);
              D2.push(inkLoop(pts2, o(sd + 600)(8, { smooth: false })));
              D3.push(inkPath(pts2, o(sd + 600)(9, { closed: true, w: 3, smooth: false })));
              D3.push(inkPath([[dx - 26, top - 34], [dx, top - 46], [dx + 26, top - 34]], o(sd + 600)(10, { w: 2.4 })));
            }
            lay.deskF.setAttribute('d', D1.join(' ')); lay.deskL.setAttribute('d', D2.join(' ')); lay.deskI.setAttribute('d', D3.join(' '));
          }
          // armchair (drawn behind the cast)
          if (CH) {
            const cx = CH.x * W, f = B.faceOf(CH.face, 1), CF = [], CD = [], CI2 = [];
            const back = [[cx - f * 120, yf - 120], [cx - f * 128, yf - 310], [cx - f * 84, yf - 336], [cx - f * 44, yf - 310], [cx - f * 40, yf - 120]];
            CF.push(inkLoop(back, o(sd + 700)(1, {})));
            CI2.push(inkPath(back, o(sd + 700)(2, { closed: true, w: 5 })));
            const seat = rect(cx - 130, yf - 130, cx + 130, yf - 80);
            CF.push(inkLoop(seat, o(sd + 700)(3, { smooth: false })));
            CI2.push(inkPath(seat, o(sd + 700)(4, { closed: true, w: 5, smooth: false })));
            [[-110], [110]].forEach(([lx], j) => CI2.push(inkPath([[cx + lx, yf - 80], [cx + lx, yf]], o(sd + 700)(5 + j, { w: 8 }))));
            lay.chairF.setAttribute('d', CF.join(' ')); lay.chairD.setAttribute('d', CD.join(' ')); lay.chairI.setAttribute('d', CI2.join(' '));
          }

          const res = cast.update(lt, t, cues);
          // telescope at a cast member's eye, on a tripod
          const ti = P.telescope;
          if (ti != null && ti !== false && res[ti]) {
            const r = res[ti], s = r.s, f = r.face, eye = [r.head[0] + f * 40 * s, r.head[1] + 6 * s];
            const ang = -0.2 + Math.sin(lt * 0.5) * 0.02, ux = f * Math.cos(ang), uy = Math.sin(ang);
            const a0 = [eye[0] + ux * 26 * s, eye[1] + uy * 26 * s], a1 = [eye[0] + ux * 330 * s, eye[1] + uy * 330 * s];
            const nx = -uy, ny = ux, w0 = 14 * s, w1 = 30 * s;
            const tube = [[a0[0] + nx * w0, a0[1] + ny * w0], [a1[0] + nx * w1, a1[1] + ny * w1], [a1[0] - nx * w1, a1[1] - ny * w1], [a0[0] - nx * w0, a0[1] - ny * w0]];
            const mid = [lerp(a0[0], a1[0], 0.55), lerp(a0[1], a1[1], 0.55)];
            scope.f.setAttribute('d', inkLoop(tube, { seed: sd + 800, t, amp: 0.6, smooth: false }));
            const SI = [inkPath(tube, { seed: sd + 801, t, w: 5 * s / 0.6, closed: true, amp: 0.6, smooth: false }),
              inkPath([[lerp(a0[0], a1[0], 0.35) + nx * 22 * s, lerp(a0[1], a1[1], 0.35) + ny * 22 * s], [lerp(a0[0], a1[0], 0.35) - nx * 22 * s, lerp(a0[1], a1[1], 0.35) - ny * 22 * s]], { seed: sd + 802, t, w: 4 * s / 0.6, amp: 0.5 })];
            [-60, 10, 70].forEach((dx, j) => SI.push(inkPath([[mid[0], mid[1] + 20 * s], [mid[0] + dx * s * 1.4, yf]], { seed: sd + 803 + j, t, w: 5 * s / 0.6, amp: 0.6 })));
            scope.i.setAttribute('d', SI.join(' '));
          } else { scope.f.setAttribute('d', ''); scope.i.setAttribute('d', ''); }
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
