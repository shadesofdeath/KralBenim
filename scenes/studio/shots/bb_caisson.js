// bb_caisson: cross-section of a bridge caisson under a river, parchment ink (theme "parchment", BRAND.md §3, §5).
// River surface and water on top, riverbed mud, a giant upside-down timber box (the caisson) sunk into the mud with the
// stone tower masonry built on its roof, an air shaft with an air lock rising above the water, compressed air leaking
// out under the cutting edges as bubbles, hanging lanterns (flicker), drifting air specks in the working chamber, and
// workers (cast) digging inside. Parametric for any pneumatic caisson / tunnel shield moment.
// P: {
//   surface: 0.22, bed: 0.36, roof: 0.42, floor: 0.6 (0..1 H; floor = cast ground in the chamber),
//   box: [0.06, 0.94] (caisson x span), tower: {w: 0.56, x: 0.5} | false, shaft: {x: 0.74} | false,
//   bubbles: true, lamps: [0.25, 0.5, 0.75], pressure: cue | false (inward "push" arrows pulse on the walls),
//   cast: [...] (bb__lib: {who, x, y, scale, pose, swing: true + pose "swing" = digging with a pickaxe, ...}),
//   labels: [...], cam: {z0, zoom, focus, pan}, shake: cue, ache: {who: index, at: cue} (red pain marks around a cast member)
// }
// cues: pressure, labels, cast, shake, ache.at, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 10) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  SH.bb_caisson = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 523;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        waterF: L(INK.paperDark, { 'fill-opacity': 0.55 }), waterI: L(INK.blue, { 'fill-opacity': 0.75 }),
        mud: L(INK.paperDark), mudI: L(INK.inkSoft),
        bub: L(INK.paperLight), bubI: L(INK.blue),
        towF: L(INK.paperLight), towI: L(INK.ink), towS: L(INK.inkSoft),
        boxF: L(INK.inkSoft), boxI: L(INK.ink), boxS: L(INK.paperDark),
        cham: L(INK.paperLight), chamS: L(INK.inkSoft, { 'fill-opacity': 0.55 }),
        shaftF: L(INK.paperDark), shaftI: L(INK.ink),
        lampG: L(INK.gold), lampI: L(INK.ink),
        arrow: L(INK.red),
        floorF: L(INK.paperDark), floorI: L(INK.inkSoft),
      };
      const castG = el(cam, 'g');
      const ache = inkEl(cam, INK.red);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);

      const ys = (P.surface ?? 0.22) * H, yb = (P.bed ?? 0.36) * H, yr = (P.roof ?? 0.42) * H, yf = (P.floor ?? 0.6) * H;
      const [bx0r, bx1r] = P.box || [0.06, 0.94], bx0 = bx0r * W, bx1 = bx1r * W;
      const roofT = 64, wallT = 54, yc = yr + roofT;                     // chamber ceiling
      const TWR = P.tower === false ? null : Object.assign({ w: 0.56, x: 0.5 }, P.tower || {});
      const SHF = P.shaft === false ? null : Object.assign({ x: 0.74 }, P.shaft || {});
      const lamps = P.lamps || [0.25, 0.5, 0.75];
      const rs = rng(sd + 9), stones = Array.from({ length: 40 }, () => [rs(), rs(), 6 + rs() * 12]);
      const specks = Array.from({ length: 26 }, () => [rs(), rs(), rs()]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = base => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.2, w: 5 }, extra);
          const hit = punch(lt, at('hit', null), 0.6);
          const shA = at(P.shake, null), shk = shA == null ? 0 : punch(lt, shA, 0.8);
          B.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.5, 0.5] }, P.cam || {}), hit, shk);

          // water
          const wv = B.water(lt, t, W, ys, yb + 10, sd + 100, { rows: 3, step: 240 });
          lay.waterF.setAttribute('d', wv.fill); lay.waterI.setAttribute('d', wv.lines);
          // mud: everything below the bed (the chamber is drawn over it)
          const mp = [[-60, yb], [W * 0.3, yb + 6], [W * 0.6, yb - 4], [W + 60, yb + 2], [W + 60, H + 60], [-60, H + 60]];
          lay.mud.setAttribute('d', inkLoop(mp, o(sd + 200)(1, { smooth: false, amp: 1 })));
          const MI = [inkPath(mp.slice(0, 4), o(sd + 200)(2, { w: 5 }))];
          stones.forEach((s, k) => { const x = s[0] * W, y = yb + 20 + s[1] * (H - yb); if (x > bx0 - 20 && x < bx1 + 20 && y < yf + 10) return;
            MI.push(inkPath(inkEllipsePts(x, y, s[2], s[2] * 0.7, sd + 210 + k, 7), o(sd + 210)(k, { closed: true, w: 2.4, amp: 0.5 }))); });
          for (let r = 0; r < 6; r++) { const y = yb + 60 + r * 90; for (let x = 20 + (r % 2) * 70; x < W; x += 140) { if (x > bx0 - 30 && x < bx1 + 30 && y < yf) continue;
            MI.push(inkPath([[x, y], [x + 40, y + 4]], o(sd + 260 + r * 20)(Math.round(x / 140), { w: 2.2, amp: 0.6 }))); } }
          lay.mudI.setAttribute('d', MI.join(' '));

          // bubbles escaping under the cutting edges, rising through mud + water
          const BF = [], BI = [];
          if (P.bubbles !== false) for (let k = 0; k < 14; k++) {
            const side = k % 2 ? 1 : -1, ex = side < 0 ? bx0 - 14 : bx1 + 14, ph = ((lt * 0.45 + k / 14) % 1);
            const y = lerp(yf, ys + 6, ph), x = ex + side * (ph * 40 + Math.sin(lt * 3 + k) * 10), r = 6 + ph * 12 + (k % 3) * 3;
            BF.push(inkLoop(circ(x, y, r, 9), { seed: sd + 300 + k, t, amp: 1 }));
            BI.push(inkPath(circ(x, y, r, 9), { seed: sd + 330 + k, t, amp: 1, closed: true, w: 3 }));
          }
          lay.bub.setAttribute('d', BF.join(' ')); lay.bubI.setAttribute('d', BI.join(' '));

          // tower masonry on the caisson roof, through the water and out of frame
          if (TWR) {
            const cx = TWR.x * W, hw = TWR.w * W / 2, top = -80;
            const pts = rect(cx - hw, top, cx + hw, yr + 2);
            lay.towF.setAttribute('d', inkLoop(pts, o(sd + 400)(1, { smooth: false })));
            lay.towI.setAttribute('d', inkPath([[cx - hw, top], [cx - hw, yr], [cx + hw, yr], [cx + hw, top]], o(sd + 400)(2, { w: 6, smooth: false })));
            const TS = [];
            for (let r = 0, y = yr - 40; y > top; y -= 40, r++) {
              TS.push(inkPath([[cx - hw + 6, y], [cx + hw - 6, y]], o(sd + 410)(r, { w: 2.4, amp: 0.6 })));
              for (let x = cx - hw + (r % 2 ? 50 : 100); x < cx + hw - 20; x += 100) TS.push(inkPath([[x, y], [x, y + 40]], o(sd + 500 + r * 10)(Math.round(x / 100), { w: 2.2, amp: 0.5 })));
            }
            lay.towS.setAttribute('d', TS.join(' '));
          }
          // caisson: roof + slanted walls ending in cutting edges at the floor
          const outer = [[bx0, yr], [bx1, yr], [bx1 + 10, yf], [bx1 - wallT * 0.3, yf + 8], [bx1 - wallT, yc + 10], [bx0 + wallT, yc + 10], [bx0 + wallT * 0.3, yf + 8], [bx0 - 10, yf]];
          lay.boxF.setAttribute('d', inkLoop(outer, o(sd + 600)(1, { smooth: false })));
          const BX = [inkPath(outer, o(sd + 600)(2, { closed: true, w: 6, smooth: false }))];
          for (let k = 1; k < 3; k++) BX.push(inkPath([[bx0 + 10, yr + k * roofT / 3], [bx1 - 10, yr + k * roofT / 3]], o(sd + 610)(k, { w: 2.6 })));
          lay.boxS.setAttribute('d', BX.slice(1).join(' '));
          lay.boxI.setAttribute('d', BX[0]);
          // working chamber (lit air)
          const ch = [[bx0 + wallT, yc + 10], [bx1 - wallT, yc + 10], [bx1 - wallT * 0.3, yf + 8], [bx0 + wallT * 0.3, yf + 8]];
          lay.cham.setAttribute('d', inkLoop(ch, o(sd + 650)(1, { smooth: false, amp: 0.8 })));
          const SP = [];
          specks.forEach((s, k) => { const x = lerp(bx0 + 90, bx1 - 90, (s[0] + lt * 0.02 * (s[2] - 0.5) + 1) % 1), y = lerp(yc + 40, yf - 40, (s[1] + Math.sin(lt * 0.7 + k) * 0.04 + 1) % 1);
            SP.push(inkDot(x, y, 4 + s[2] * 4, 4 + s[2] * 4, sd + 660 + k, t)); });
          lay.chamS.setAttribute('d', SP.join(' '));
          // chamber floor (mud being dug)
          const fl = [[bx0 + wallT * 0.3, yf + 8], [W * 0.3, yf - 4], [W * 0.55, yf + 4], [W * 0.8, yf - 2], [bx1 - wallT * 0.3, yf + 8], [bx1 - 10, H + 60], [bx0 + 10, H + 60]];
          lay.floorF.setAttribute('d', inkLoop(fl, o(sd + 680)(1, { smooth: false })));
          const FI = [inkPath(fl.slice(0, 5), o(sd + 680)(2, { w: 5 }))];
          for (let k = 0; k < 8; k++) FI.push(inkPath(inkEllipsePts(lerp(bx0 + 80, bx1 - 80, k / 7), yf + 40 + (k % 3) * 40, 12, 8, sd + 690 + k, 7), o(sd + 690)(k, { closed: true, w: 2.4, amp: 0.5 })));
          lay.floorI.setAttribute('d', FI.join(' '));

          // air shaft + air lock
          if (SHF) {
            const sx = SHF.x * W, sw = 30, top = ys - 150;
            const tube = rect(sx - sw, top + 70, sx + sw, yc + 12);
            lay.shaftF.setAttribute('d', inkLoop(tube, o(sd + 700)(1, { smooth: false })) + ' ' + inkLoop(rect(sx - 60, top, sx + 60, top + 76), o(sd + 700)(2, { smooth: false })));
            const SI = [inkPath(tube, o(sd + 700)(3, { closed: true, w: 5, smooth: false })), inkPath(rect(sx - 60, top, sx + 60, top + 76), o(sd + 700)(4, { closed: true, w: 5, smooth: false }))];
            for (let y = top + 110; y < yc; y += 44) SI.push(inkPath([[sx - sw + 6, y], [sx + sw - 6, y]], o(sd + 720)(Math.round(y), { w: 3, amp: 0.5 })));
            SI.push(inkPath([[sx - 30, top + 38], [sx + 30, top + 38]], o(sd + 700)(5, { w: 4 })));
            lay.shaftI.setAttribute('d', SI.join(' '));
          }
          // hanging lanterns
          const LG = [], LI = [];
          lamps.forEach((lx, k) => {
            const x = lx * W + Math.sin(lt * 1.4 + k) * 4, y = yc + 70, fl2 = 1 + 0.15 * Math.sin(lt * 11 + k * 3);
            LI.push(inkPath([[lx * W, yc + 8], [x, y - 22]], o(sd + 800 + k)(0, { w: 2.5, amp: 0.4 })));
            LG.push(inkLoop(circ(x, y, 15 * fl2, 9), o(sd + 810 + k)(0, { amp: 0.8 })));
            LI.push(inkPath(rect(x - 16, y - 22, x + 16, y + 20), o(sd + 820 + k)(0, { closed: true, w: 3.5, smooth: false })));
          });
          lay.lampG.setAttribute('d', LG.join(' ')); lay.lampI.setAttribute('d', LI.join(' '));

          // pressure arrows: the river pushing on the walls, the air pushing back
          const pa = P.pressure == null || P.pressure === false ? null : at(P.pressure, 0.3);
          if (pa != null && lt >= pa) {
            const pp = spring(lt, pa, 0.5), pul = 1 + 0.12 * Math.sin((lt - pa) * 6), A2 = [];
            [[bx0 - 20, -1], [bx1 + 20, 1]].forEach(([x, s], j) => {
              const y = lerp(yc, yf, 0.45), len = 70 * pp * pul, tip = x - s * 6, tail = tip + s * len;
              A2.push(inkPath([[tail, y], [tip, y]], o(sd + 900 + j)(0, { w: 9 })));
              A2.push(inkPath([[tip + s * 26, y - 22], [tip, y], [tip + s * 26, y + 22]], o(sd + 910 + j)(0, { w: 9, smooth: false })));
            });
            lay.arrow.setAttribute('d', A2.join(' '));
          } else lay.arrow.setAttribute('d', '');

          const res = cast.update(lt, t, cues);
          // pain marks around a cast member
          const AC = P.ache ? P.ache : null, aa = AC ? at(AC.at, null) : null;
          if (AC && aa != null && lt >= aa && res[AC.who || 0]) {
            const r = res[AC.who || 0], c = r.head, s = r.s, k = spring(lt, aa, 0.4), A3 = [];
            for (let j = 0; j < 5; j++) {
              const ang = -2.6 + j * 0.55 + Math.sin(lt * 5 + j) * 0.05, r0 = 110 * s, r1 = r0 + (40 + 16 * Math.sin(lt * 8 + j)) * s * k;
              A3.push(inkPath([[c[0] + Math.cos(ang) * r0, c[1] + Math.sin(ang) * r0], [c[0] + Math.cos(ang) * r1, c[1] + Math.sin(ang) * r1]], { seed: sd + 950 + j, t, w: 8 * s / 0.6, amp: 0.8 }));
            }
            ache.setAttribute('d', A3.join(' '));
          } else ache.setAttribute('d', '');
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
