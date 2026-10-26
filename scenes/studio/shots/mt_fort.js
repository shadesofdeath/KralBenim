// mt_fort: side view of a 16th-century bastioned harbour fort under siege, in parchment ink (theme "parchment",
// brand/kit/BRAND.md §3, §5). Written for the Great Siege of Malta 1565 (Fort St Elmo, Birgu, Senglea), parametric for
// any coastal fort under bombardment. Every line boils at 8 Hz via _ink.js; a pure function of (seed, lt), no Math.random.
// Needs mcB__lib.js (window.MCB: cast, labels, sea, camPush).
// Planes: sky (clouds; at night ink hatching, a gold moon and stars) · a far hill with gun batteries (smoke puffs, gold
// flashes, balls flying in arcs to a fort and bursting into dust) · the sea (drifting hatching) · rocky headlands, each
// with a fort (sloped walls, two angled bastions, crenels, stone courses, a flag) that crumbles on cue (the top edge
// breaks down, cracks, rubble piles up, the flag pole can fall) · rowboats crossing the water (oars sweep; a red dashed
// route and a red X can "cut" them) · cast (Kaşif / fez narrator + period figures) on a foreground quay · labels.
// P: {
//   sea: 0.72 (waterline, 0..1 H), night: false | true | cue (dusk falls from the cue), moon: {x: 0.82, y: 0.18},
//   hill: {side: "right"|"left", w: 0.42, h: 0.2} | false (far battery hill on the horizon),
//   forts: [{x: 0.36, w: 560, h: 220 (wall px), base: 0.66 (rock top, 0..1 H), scale: 1,
//            damage: 0..1 | {from: 0, to: 1, at: cue|s, dur: 2.5}, flag: true | {fall: cue} | false,
//            label: {text, at, dy: -0.06, color: "ink"|"red", size: 60}}],
//   guns: {at: cue|s (first shot), n: 4, gap: 0.7 (s), target: 0 (fort index), from: [[0.9, 0.5], [0.8, 0.52]] (0..1)} | false,
//   boats: {n: 3, from: 0.86, to: 0.5, y: 0.8, at: cue|s, dur: 4, gap: 0.9, cut: cue (red dashed route + X)} | false,
//   quay: {side: "left"|"right", w: 0.34, y: 0.86} | false (foreground stone quay the cast stands on),
//   clouds: true | false,
//   fleet: {n: 12, y: 0.71 (waterline, 0..1 H), x0: 0.5, x1: 1.0 (spread), scale: 0.5, at: cue|s (sails in from the
//     right edge, staggered), drift: 6 (px/s), front: false (drawn in front of the forts), rows: 3} | false (galleys on the sea: hull, oars,
//     lateen sail, red pennant),
//   cannon: {x: 0.3, y: 0.86 (wheel ground, 0..1), scale: 1, face: 1, fire: cue} | false (bronze gun on a carriage),
//   gabions: true (row of wicker baskets along the quay edge: a siege trench parapet),
//   strike: {at: cue, x: 0.5, y: 0.8 (0..1 impact point), from: [1.0, 0.45]} | false (a ball flies in and smashes into
//     the ground/stone there: flash, flying stone chips, dust, camera shake),
//   cast: [MCB cast entries], labels: [MCB label entries], cam: {zoom: 1.06, focus: [0.5, 0.55]}, shake: cue
// }
// SHOTS.mt_trench: the same drawing preset as a siege-trench close-up (no far hill, a small far fort, quay as the
//   trench with gabions, a cannon, foreground cast) — the params above override the preset.
// cues: hit (punch), night, damage.at, flag.fall, guns.at, boats.at / cut, label/cast "at" names, shake.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';

  SH.mt_fort = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB;
      const portrait = H > W, sd = seed * 1000 + 565;
      const S = portrait ? W / 1080 : H / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra = {}) => inkEl(cam, fill, extra);
      const seaY = (P.sea ?? 0.72) * H;
      const lay = {
        hatch: L(INK.inkSoft), moon: L(INK.gold), stars: L(INK.gold),
        cloudF: L(INK.paperLight), cloudI: L(INK.inkSoft),
        hillF: L(INK.paperDark, { 'fill-opacity': 0.8 }), hillI: L(INK.inkSoft),
        smokeF: L(INK.paperDark, { 'fill-opacity': 0.85 }), smokeI: L(INK.inkSoft), flash: L(INK.gold),
      };
      const seaG = el(cam, 'g');
      const sea = M ? M.sea(seaG, W, H, seaY, sd + 5, { hatch: 18 }) : null;
      Object.assign(lay, { flH: L(INK.paperDark), flS: L(INK.paperLight), flI: L(INK.ink), flR: L(INK.red) });
      Object.assign(lay, {
        rockF: L(INK.paperDark), rockI: L(INK.ink),
        wallF: L(INK.paperLight), wallD: L(INK.paperDark), wallI: L(INK.ink), course: L(INK.inkSoft),
        rubF: L(INK.paperDark), rubI: L(INK.ink), dustF: L(INK.paperDark, { 'fill-opacity': 0.6 }), dustI: L(INK.inkSoft),
        pole: L(INK.ink), flagF: L(INK.red), flagX: L(INK.paperLight), ball: L(INK.ink),
        route: L(INK.red), boatF: L(INK.hat), boatI: L(INK.ink), oar: L(INK.ink), heads: L(INK.paperLight), headI: L(INK.ink),
        quayF: L(INK.paperDark), quayI: L(INK.ink), quayC: L(INK.inkSoft), gabF: L(INK.paperLight), gabI: L(INK.hat),
        canW: L(INK.paperDark), canB: L(INK.gold), canI: L(INK.ink),
      });
      const flFront = { flH: L(INK.paperDark), flS: L(INK.paperLight), flI: L(INK.ink), flR: L(INK.red) };
      const castG = el(cam, 'g');
      const fx = { chipF: L(INK.paperDark), chipI: L(INK.ink), dF: L(INK.paperDark, { 'fill-opacity': 0.85 }), dI: L(INK.inkSoft), fl: L(INK.gold), ball: L(INK.ink) };
      const labG = el(root, 'g');
      const cast = M && typeof KASIF !== 'undefined' ? M.cast(castG, P.cast, W, H, sd + 50) : null;
      const labs = M ? M.labels(labG, P.labels, W, H, sd + 70) : null;
      // fort labels: handwritten, above each fort
      const forts = (P.forts || [{}]).map((f, i) => {
        const F = Object.assign({ x: 0.36, w: 560, h: 220, base: 0.66, scale: 1, flag: true }, f, { i });
        const r = rng(sd + 300 + i * 31);
        F.bites = Array.from({ length: 9 }, () => [r(), r(), r()]);
        F.rub = Array.from({ length: 16 }, () => [r(), r(), r()]);
        if (F.label && F.label.text) {
          const g = el(root, 'g');
          const size = Math.max(44, F.label.size || 60) * S;
          const tx = el(g, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': f1(size), 'text-anchor': 'middle',
            'dominant-baseline': 'central', fill: F.label.color === 'red' ? INK.red : INK.ink });
          tx.textContent = F.label.text;
          F.lab = g;
        }
        return F;
      });
      const HL = P.hill === false ? null : Object.assign({ side: 'right', w: 0.42, h: 0.2 }, P.hill || {});
      const G = P.guns ? Object.assign({ n: 4, gap: 0.7, target: 0 }, P.guns) : null;
      if (G && !G.from) G.from = HL ? (HL.side === 'right' ? [[0.88, 0], [0.76, 0]] : [[0.12, 0], [0.24, 0]]) : [[0.95, 0.55]];
      const BT = P.boats ? Object.assign({ n: 3, from: 0.86, to: 0.5, y: 0.8, dur: 4, gap: 0.9 }, P.boats) : null;
      const Q = P.quay ? Object.assign({ side: 'left', w: 0.34, y: 0.86 }, P.quay === true ? {} : P.quay) : null;
      const rs = rng(sd + 9), STARS = Array.from({ length: 14 }, () => [rs(), rs() * 0.4, rs()]);
      const hillTop = (u) => seaY - HL.h * H * Math.sin(Math.PI * clamp01(u)) * (0.85 + 0.15 * Math.sin(u * 9));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const o = base => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.4, w: 5 * S }, extra);
          const oS = o(sd + 1000);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const shA = atOr(cues, P.shake, null);
          if (M) M.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.06, focus: [0.5, 0.55] }, P.cam || {}), hit, shA == null ? 0 : punch(lt, shA, 0.7));

          // ---- sky: night hatching, moon, stars / day clouds
          const na = P.night === true ? -10 : atOr(cues, P.night, null);
          const nt = na == null ? 0 : prog(lt, na, 1.4);
          const Hd = [], Sd = [], Cf = [], Ci = [];
          if (nt > 0) {
            const rows = Math.round(22 * nt);
            for (let k = 0; k < rows; k++) {
              const y = (k + 0.5) / 22 * seaY * 0.98, len = W * (0.12 + 0.08 * ((k * 7) % 5) / 5);
              for (let x0 = ((k * 137) % 200) - 200; x0 < W; x0 += len * 1.5) Hd.push(inkPath([[x0, y], [x0 + len, y - 6 * S]], oS(k * 40 + Math.round(x0), { w: 3.4 * S, amp: 1 })));
            }
            const mo = Object.assign({ x: 0.82, y: 0.18 }, P.moon || {});
            lay.moon.setAttribute('d', inkCircle(mo.x * W, mo.y * H, 44 * S * nt, sd + 7, t, { fill: true }));
            STARS.forEach((s, i) => { const tw = 0.6 + 0.4 * Math.sin(t * 3 + i); Sd.push(inkDot(s[0] * W, (0.04 + s[1]) * H, 5 * S * nt * tw, 5 * S * nt * tw, sd + 20 + i, t)); });
          } else lay.moon.setAttribute('d', '');
          if (nt < 1 && P.clouds !== false) {
            for (let c = 0; c < 3; c++) {
              const cx = 0.34 * W + ((c * 0.27 + 0.05) * W + lt * (10 + c * 4) * S) % (0.62 * W), cy = (0.24 + 0.05 * c) * H;
              const pts = [], bw = 120 * S;
              [[-0.6, 0.55], [-0.15, 0.85], [0.35, 0.7], [0.75, 0.45]].forEach(([u, hgt], j) => {
                for (let q = 0; q <= 6; q++) { const a0 = Math.PI * (1 - q / 6); pts.push([cx + u * bw + Math.cos(a0) * bw * 0.32, cy - Math.sin(a0) * bw * 0.42 * hgt]); }
              });
              const line = pts.concat([[cx + bw * 1.05, cy], [cx - bw * 0.95, cy]]);
              Cf.push(inkLoop(line, oS(60 + c, { smooth: false, amp: 1 })));
              Ci.push(inkPath(pts, oS(70 + c, { w: 3.5 * S, amp: 1 })) + ' ' + inkPath([[cx - bw * 0.95, cy], [cx + bw * 1.05, cy]], oS(75 + c, { w: 3 * S })));
            }
          }
          lay.hatch.setAttribute('d', Hd.join(' ')); lay.stars.setAttribute('d', Sd.join(' '));
          lay.cloudF.setAttribute('d', nt < 1 ? Cf.join(' ') : ''); lay.cloudI.setAttribute('d', nt < 1 ? Ci.join(' ') : '');

          // ---- far battery hill
          if (HL) {
            const x0 = HL.side === 'right' ? W * (1 - HL.w) : -W * 0.02, x1 = HL.side === 'right' ? W * 1.02 : W * HL.w;
            const pts = [];
            for (let k = 0; k <= 14; k++) { const u = k / 14; pts.push([lerp(x0, x1, u), hillTop(HL.side === 'right' ? u * 0.5 + 0.5 : u * 0.5)]); }
            lay.hillF.setAttribute('d', inkLoop(pts.concat([[x1, seaY + 10 * S], [x0, seaY + 10 * S]]), oS(80, { smooth: false })));
            lay.hillI.setAttribute('d', inkPath(pts, oS(81, { w: 4 * S })));
          }

          // ---- sea
          if (sea) sea.update(t);

          // ---- fleet on the sea
          if (P.fleet) {
            const FT = Object.assign({ n: 12, y: (P.sea ?? 0.72) - 0.01, x0: 0.5, x1: 1.0, scale: 0.5, at: 0, drift: 6, rows: 3 }, P.fleet);
            const LY = FT.front ? flFront : lay;
            const a0 = atOr(cues, FT.at, 0), HH = [], SS = [], II = [], RR = [];
            for (let k = 0; k < FT.n; k++) {
              const row = k % FT.rows, sc = FT.scale * S * (1 - row * 0.18), u = (k + 0.5) / FT.n;
              const tx = lerp(FT.x0, FT.x1, u) * W - lt * FT.drift * S, ap = progIO(lt, a0 + k * 0.12, 1.6);
              const x = lerp(W + 260 * S, tx, ap), y = FT.y * H - row * 34 * S * FT.scale + Math.sin(t * 1.6 + k) * 2 * S;
              if (x > W + 240 * S) continue;
              const L0 = 230 * sc, hull = [[x - L0 / 2, y - 18 * sc], [x + L0 / 2 + 20 * sc, y - 26 * sc], [x + L0 * 0.4, y + 6 * sc], [x - L0 * 0.42, y + 6 * sc]];
              HH.push(inkLoop(hull, oS(1200 + k, { smooth: false, amp: 0.8 })));
              II.push(inkPath(hull, oS(1220 + k, { w: 3.5 * sc / S * S, smooth: false, closed: true })));
              for (let j = 0; j < 5; j++) { const ox = x - L0 * 0.35 + j * L0 * 0.16; II.push(inkPath([[ox, y], [ox - 14 * sc, y + 24 * sc]], oS(1240 + k * 5 + j, { w: 2.5 * S }))); }
              const mx = x + 10 * sc, top = y - 150 * sc;
              II.push(inkPath([[mx, y - 20 * sc], [mx, top]], oS(1300 + k, { w: 3 * S })));
              const sail = [[mx - 90 * sc, y - 40 * sc], [mx + 70 * sc, top + 6 * sc], [mx + 20 * sc, y - 34 * sc]];
              SS.push(inkLoop(sail, oS(1320 + k, { smooth: false, amp: 0.8 }))); II.push(inkPath(sail, oS(1340 + k, { w: 3 * S, smooth: false, closed: true })));
              const wv = Math.sin(t * 6 + k) * 5 * sc;
              RR.push(inkLoop([[mx, top], [mx - 40 * sc, top + 6 * sc + wv], [mx, top + 14 * sc]], oS(1360 + k, { smooth: false, amp: 0.6 })));
            }
            LY.flH.setAttribute('d', HH.join(' ')); LY.flS.setAttribute('d', SS.join(' ')); LY.flI.setAttribute('d', II.join(' ')); LY.flR.setAttribute('d', RR.join(' '));
          }

          // ---- forts
          const RF = [], RI = [], WF = [], WD = [], WI = [], CO = [], UF = [], UI = [], PO = [], FF = [], FX = [];
          const DF = [], DI = [];
          const impacts = [];
          forts.forEach(F => {
            const s = S * F.scale, cx = F.x * W, by = F.base * H, w = F.w * s, h = F.h * s;
            const ob = o(sd + 2000 + F.i * 300);
            // rock headland
            const rock = [[cx - w * 0.78, seaY + 30 * s], [cx - w * 0.66, by + 10 * s], [cx - w * 0.5, by], [cx + w * 0.5, by], [cx + w * 0.7, by + 16 * s], [cx + w * 0.82, seaY + 30 * s]];
            RF.push(inkLoop(rock, ob(1, { smooth: false })));
            RI.push(inkPath(rock, ob(2, { w: 6 * s, smooth: false })));
            for (let k = 0; k < 3; k++) RI.push(inkPath([[cx - w * (0.5 - k * 0.3), by + 30 * s], [cx - w * (0.42 - k * 0.3), by + 60 * s + k * 8 * s]], ob(3 + k, { w: 3 * s })));
            // damage 0..1
            let dmg = 0;
            if (typeof F.damage === 'number') dmg = F.damage;
            else if (F.damage) { const a = atOr(cues, F.damage.at, 0.3); dmg = lerp(F.damage.from ?? 0, F.damage.to ?? 1, progIO(lt, a, F.damage.dur ?? 2.5)); }
            // wall outline: sloped base, two angled bastions
            const xl = cx - w * 0.5, xr = cx + w * 0.5, ty = by - h, bw = w * 0.2;
            const top = (x) => {   // broken top edge
              let y = ty;
              F.bites.forEach(([u, d2, k]) => { const bx = lerp(xl, xr, u), r0 = w * (0.05 + 0.07 * k); const q = clamp01(1 - Math.abs(x - bx) / r0); y += q * q * dmg * h * (0.25 + 0.45 * d2); });
              return Math.min(y, by - h * 0.18);
            };
            const xs = []; for (let k = 0; k <= 24; k++) xs.push(lerp(xl + 14 * s, xr - 14 * s, k / 24));
            const topPts = xs.map(x => [x, top(x)]);
            const body = [[xl - 10 * s, by]].concat(topPts).concat([[xr + 10 * s, by]]);
            WF.push(inkLoop(body, ob(10, { smooth: false, amp: 1 })));
            WI.push(inkPath(body, ob(11, { w: 6 * s, smooth: false, closed: true })));
            // bastion faces (darker, angled)
            [[xl - 10 * s, xl + bw], [xr - bw, xr + 10 * s]].forEach(([a0, a1], j) => {
              const face = [[a0, by], [a0 + 12 * s, top(a0 + 12 * s)], [a1, top(a1)], [a1, by]];
              WD.push(inkLoop(face, ob(20 + j, { smooth: false, amp: 1 })));
              WI.push(inkPath([[a1, top(a1)], [a1, by]], ob(22 + j, { w: 4 * s })));
            });
            // crenels on the intact parts
            for (let k = 0; k < 10; k++) {
              const x = lerp(xl + 30 * s, xr - 50 * s, k / 9), y = top(x);
              if (y - ty > 8 * s) continue;
              const cr = [[x, y], [x, y - 26 * s], [x + 30 * s, y - 26 * s], [x + 30 * s, y]];
              WF.push(inkLoop(cr, ob(30 + k, { smooth: false, amp: 1 }))); WI.push(inkPath(cr, ob(45 + k, { w: 4.5 * s, smooth: false })));
            }
            // stone courses
            for (let k = 1; k < 4; k++) {
              const y = lerp(ty, by, k / 4) + 6 * s;
              const seg = xs.filter(x => top(x) < y - 6 * s);
              if (seg.length > 1) CO.push(inkPath([[seg[0], y], [seg[seg.length - 1], y + 3 * s]], ob(60 + k, { w: 3 * s })));
            }
            // cracks
            if (dmg > 0.15) for (let k = 0; k < 4; k++) {
              const [u] = F.bites[k], x = lerp(xl + w * 0.1, xr - w * 0.1, u), y = top(x);
              const len = h * 0.45 * clamp01((dmg - 0.15) * 2);
              WI.push(inkPath([[x, y], [x + 14 * s, y + len * 0.4], [x - 8 * s, y + len * 0.7], [x + 6 * s, y + len]], ob(70 + k, { w: 3.5 * s })));
            }
            // rubble at the foot
            const nr = Math.round(F.rub.length * dmg);
            for (let k = 0; k < nr; k++) {
              const [u, v, z] = F.rub[k], x = lerp(xl - 20 * s, xr + 20 * s, u), y = by - 6 * s - v * 20 * s, r = (12 + z * 16) * s;
              const pts = [[x - r, y + r * 0.5], [x - r * 0.6, y - r * 0.6], [x + r * 0.5, y - r * 0.7], [x + r, y + r * 0.4]];
              UF.push(inkLoop(pts, ob(80 + k, { smooth: false, amp: 1 }))); UI.push(inkPath(pts, ob(100 + k, { w: 3.5 * s, smooth: false, closed: true })));
            }
            // flag
            if (F.flag) {
              const fa = typeof F.flag === 'object' ? atOr(cues, F.flag.fall, null) : null;
              const fp = fa == null ? 0 : progIO(lt, fa, 0.9);
              const px = cx + w * 0.12, py = top(px), ph = 150 * s;
              const ang = fp * 1.35;   // pole tips over to the right
              const tipX = px + Math.sin(ang) * ph, tipY = py - Math.cos(ang) * ph;
              PO.push(inkPath([[px, py], [tipX, tipY]], ob(120, { w: 5 * s })));
              if (fp < 0.98) {
                const wv = Math.sin(t * 5) * 8 * s, fw = 96 * s, fh = 62 * s, c = Math.cos(ang), sn = Math.sin(ang);
                const R = (dx, dy) => [tipX + dx * c - dy * sn, tipY + dx * sn + dy * c];
                const fl = [R(0, 0), R(fw * 0.5, wv * 0.5), R(fw, wv), R(fw, fh + wv), R(fw * 0.5, fh + wv * 0.5), R(0, fh)];
                FF.push(inkLoop(fl, ob(121, { smooth: false, amp: 1 })));
                FX.push(inkPath([R(fw * 0.5, 8 * s + wv * 0.5), R(fw * 0.5, fh - 8 * s + wv * 0.5)], ob(122, { w: 6 * s })) + ' ' +
                  inkPath([R(12 * s, fh / 2 + wv * 0.4), R(fw - 12 * s, fh / 2 + wv * 0.8)], ob(123, { w: 6 * s })));
                PO.push(inkPath(fl, ob(124, { w: 3 * s, smooth: false, closed: true })));
              }
            }
            if (F.lab) {
              const a = atOr(cues, F.label.at, 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0, b = boil(sd + 400 + F.i, t, 1.2);
              F.lab.setAttribute('opacity', clamp01(p * 3).toFixed(3));
              F.lab.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(by - h - (F.label.dy ?? 0.08) * H - 30 * s + b[1])}) rotate(-3) scale(${Math.max(0.01, p).toFixed(3)})`);
            }
            impacts.push({ x: cx, y: by - h * 0.55, w });
          });
          lay.rockF.setAttribute('d', RF.join(' ')); lay.rockI.setAttribute('d', RI.join(' '));
          lay.wallF.setAttribute('d', WF.join(' ')); lay.wallD.setAttribute('d', WD.join(' ')); lay.wallI.setAttribute('d', WI.join(' '));
          lay.course.setAttribute('d', CO.join(' ')); lay.rubF.setAttribute('d', UF.join(' ')); lay.rubI.setAttribute('d', UI.join(' '));
          lay.pole.setAttribute('d', PO.join(' ')); lay.flagF.setAttribute('d', FF.join(' ')); lay.flagX.setAttribute('d', FX.join(' '));

          // ---- guns: smoke puffs on the hill, balls in arcs, dust bursts at the fort
          const SF = [], SI = [], FL = [], BL = [];
          if (G && impacts.length) {
            const g0 = atOr(cues, G.at, 0.3), tg = impacts[Math.min(impacts.length - 1, G.target)];
            const nShots = Math.max(G.n, Math.ceil((dur - g0) / G.gap));
            for (let k = 0; k < nShots; k++) {
              const a = g0 + k * G.gap; if (lt < a) break;
              const [fx, fy0] = G.from[k % G.from.length];
              const gx = fx * W, gy = HL ? hillTop(HL.side === 'right' ? (fx - (1 - HL.w)) / HL.w * 0.5 + 0.5 : fx / HL.w * 0.5) - 10 * S : fy0 * H;
              const e = lt - a;
              if (e < 0.12) FL.push(inkDot(gx, gy, 16 * S, 12 * S, sd + 500 + k, t));
              if (e < 3) {
                const r = (10 + e * 14) * S;
                for (let j = 0; j < 3; j++) {
                  const pts = inkEllipsePts(gx + (j - 1) * r * 0.9, gy - e * 34 * S - (j === 1 ? r * 0.5 : 0), r, r * 0.8, sd + 520 + k * 3 + j, 9);
                  SF.push(inkLoop(pts, oS(500 + k * 3 + j))); SI.push(inkPath(pts, oS(540 + k * 3 + j, { closed: true, w: 3 * S })));
                }
              }
              const fl = 0.75;
              const tx = tg.x + ((k * 53) % 7 - 3) * tg.w * 0.06, ty = tg.y + ((k * 31) % 5 - 2) * 14 * S;
              if (e < fl) {
                const u = e / fl, x = lerp(gx, tx, u), y = lerp(gy, ty, u) - Math.sin(Math.PI * u) * 120 * S;
                BL.push(inkDot(x, y, 9 * S, 9 * S, sd + 560 + k, t));
              } else if (e < fl + 1.4) {
                const q = (e - fl) / 1.4, r = (12 + q * 26) * S;
                for (let j = 0; j < 3; j++) {
                  const pts = inkEllipsePts(tx + (j - 1) * r * 0.95, ty - q * 40 * S - (j === 1 ? r * 0.55 : 0), r, r * 0.8, sd + 600 + k * 3 + j, 9);
                  DF.push(inkLoop(pts, oS(600 + k * 3 + j))); DI.push(inkPath(pts, oS(640 + k * 3 + j, { closed: true, w: 3 * S })));
                }
                if (q < 0.12) FL.push(inkDot(tx, ty, 22 * S, 16 * S, sd + 680 + k, t));
              }
            }
          }
          lay.smokeF.setAttribute('d', SF.join(' ')); lay.smokeI.setAttribute('d', SI.join(' '));
          lay.flash.setAttribute('d', FL.join(' ')); lay.ball.setAttribute('d', BL.join(' '));
          lay.dustF.setAttribute('d', DF.join(' ')); lay.dustI.setAttribute('d', DI.join(' '));

          // ---- rowboats
          const BF = [], BI = [], OA = [], HE = [], HI = [], RT = [];
          if (BT) {
            const b0 = atOr(cues, BT.at, 0.2);
            for (let k = 0; k < BT.n; k++) {
              const a = b0 + k * BT.gap, u = progIO(lt, a, BT.dur);
              if (lt < a - 0.01 && k > 0) continue;
              const x = lerp(BT.from, BT.to, u) * W - k * 40 * S * (1 - u), y = BT.y * H + k * 26 * S + Math.sin(t * 2.2 + k) * 4 * S;
              const dir = BT.to < BT.from ? -1 : 1, bl = 190 * S, bh = 36 * S;
              const hull = [[x - bl / 2, y - bh * 0.4], [x + bl / 2, y - bh * 0.4], [x + bl * 0.38, y + bh * 0.5], [x - bl * 0.38, y + bh * 0.5]];
              const ob = o(sd + 3000 + k * 50);
              BF.push(inkLoop(hull, ob(1, { smooth: false, amp: 1 }))); BI.push(inkPath(hull, ob(2, { w: 4 * S, smooth: false, closed: true })));
              const sw = Math.sin(t * 4 + k) * 0.5;
              for (let j = 0; j < 3; j++) {
                const hx = x + (j - 1) * 40 * S, hy = y - bh * 0.4 - 26 * S;
                HE.push(inkDot(hx, hy, 13 * S, 13 * S, sd + 3100 + k * 5 + j, t)); HI.push(inkCircle(hx, hy, 13 * S, sd + 3120 + k * 5 + j, t, { w: 3.5 * S }));
                BI.push(inkPath([[hx, hy + 12 * S], [hx, y - bh * 0.4]], ob(10 + j, { w: 4 * S })));
                OA.push(inkPath([[hx - dir * 6 * S, y - bh * 0.4], [hx - dir * (30 + sw * 30) * S, y + 40 * S]], ob(20 + j, { w: 4 * S })));
              }
            }
            const ca = atOr(cues, BT.cut, null);
            if (ca != null && lt >= ca) {
              const p = prog(lt, ca, 0.6), xa = BT.from * W, xb = BT.to * W, yy = BT.y * H + 70 * S, n = 12;
              for (let k = 0; k < n * p; k += 2) RT.push(inkPath([[lerp(xa, xb, k / n), yy], [lerp(xa, xb, (k + 1) / n), yy]], oS(700 + k, { w: 7 * S })));
              const q = prog(lt, ca + 0.4, 0.4), mx = (xa + xb) / 2, my = BT.y * H + 10 * S, r = 90 * S * (1 + 0.1 * punch(lt, ca + 0.4, 0.6));
              if (q > 0) {
                RT.push(inkPath([[mx - r, my - r], [lerp(mx - r, mx + r, q), lerp(my - r, my + r, q)]], oS(730, { w: 16 * S })));
                if (q > 0.5) RT.push(inkPath([[mx + r, my - r], [lerp(mx + r, mx - r, (q - 0.5) * 2), lerp(my - r, my + r, (q - 0.5) * 2)]], oS(731, { w: 16 * S })));
              }
            }
          }
          lay.boatF.setAttribute('d', BF.join(' ')); lay.boatI.setAttribute('d', BI.join(' ')); lay.oar.setAttribute('d', OA.join(' '));
          lay.heads.setAttribute('d', HE.join(' ')); lay.headI.setAttribute('d', HI.join(' ')); lay.route.setAttribute('d', RT.join(' '));

          // ---- foreground quay
          if (Q) {
            const x0 = Q.side === 'left' ? -40 * S : W * (1 - Q.w), x1 = Q.side === 'left' ? W * Q.w : W + 40 * S, y = Q.y * H;
            const pts = [[x0, y], [x1, y + 6 * S], [x1, H + 20], [x0, H + 20]];
            lay.quayF.setAttribute('d', inkLoop(pts, oS(800, { smooth: false })));
            lay.quayI.setAttribute('d', inkPath([[x0, y], [x1, y + 6 * S], [x1, H + 20]], oS(801, { w: 6 * S, smooth: false })));
            const C = [];
            for (let k = 1; k < 6; k++) { const xx = lerp(x0, x1, k / 6); C.push(inkPath([[xx, y + 10 * S], [xx + 4 * S, y + 60 * S]], oS(810 + k, { w: 3 * S }))); }
            C.push(inkPath([[x0, y + 64 * S], [x1, y + 68 * S]], oS(820, { w: 3 * S })));
            lay.quayC.setAttribute('d', C.join(' '));
          }

          // ---- gabions on the quay edge
          if (Q && P.gabions) {
            const x0 = Q.side === 'left' ? 0 : W * (1 - Q.w), x1 = Q.side === 'left' ? W * Q.w : W, y = Q.y * H, GF = [], GI = [];
            for (let x = x0 + 10 * S, k = 0; x < x1 - 60 * S; x += 78 * S, k++) {
              const b = [[x, y + 4 * S], [x + 2 * S, y - 58 * S], [x + 66 * S, y - 58 * S], [x + 68 * S, y + 4 * S]];
              GF.push(inkLoop(b, oS(900 + k, { smooth: false, amp: 1 })));
              GI.push(inkPath(b, oS(940 + k, { w: 4 * S, smooth: false, closed: true })));
              for (let j = 1; j < 4; j++) GI.push(inkPath([[x + j * 17 * S, y - 54 * S], [x + j * 17 * S, y]], oS(960 + k * 4 + j, { w: 2.5 * S })));
            }
            lay.gabF.setAttribute('d', GF.join(' ')); lay.gabI.setAttribute('d', GI.join(' '));
          }
          // ---- cannon
          if (P.cannon) {
            const C0 = Object.assign({ x: 0.3, y: 0.86, scale: 1, face: 1 }, P.cannon), cs = S * C0.scale, f = C0.face;
            const fa = atOr(cues, C0.fire, null), rec = fa == null ? 0 : punch(lt, fa, 0.5) * 30 * cs;
            const cx = C0.x * W - f * rec, gy = C0.y * H, wr = 46 * cs;
            const bar = [[cx - f * 120 * cs, gy - wr - 26 * cs], [cx + f * 150 * cs, gy - wr - 46 * cs], [cx + f * 156 * cs, gy - wr - 20 * cs], [cx - f * 124 * cs, gy - wr + 12 * cs]];
            lay.canB.setAttribute('d', inkLoop(bar, oS(980, { smooth: false, amp: 1 })));
            const wl = inkCircle(cx, gy - wr, wr, sd + 981, t, { w: 6 * cs });
            const sp = []; for (let j = 0; j < 4; j++) { const a0 = j * Math.PI / 4 + lt * 0; sp.push(inkPath([[cx - Math.cos(a0) * wr, gy - wr - Math.sin(a0) * wr], [cx + Math.cos(a0) * wr, gy - wr + Math.sin(a0) * wr]], oS(982 + j, { w: 3.5 * cs }))); }
            lay.canW.setAttribute('d', inkCircle(cx, gy - wr, wr, sd + 981, t, { fill: true }));
            lay.canI.setAttribute('d', inkPath(bar, oS(990, { w: 5 * cs, smooth: false, closed: true })) + ' ' + wl + ' ' + sp.join(' ') +
              ' ' + inkPath([[cx - f * 30 * cs, gy - wr], [cx - f * 170 * cs, gy - 4 * cs]], oS(991, { w: 8 * cs })));
            if (fa != null && lt >= fa && lt < fa + 2) {
              const e = lt - fa, mx = cx + f * 170 * cs, my = gy - wr - 34 * cs, r = (14 + e * 22) * cs, D = [], DI = [];
              for (let j = 0; j < 3; j++) { const pts = inkEllipsePts(mx + f * (e * 60 + j * r * 0.9) * cs, my - e * 30 * cs - (j === 1 ? r * 0.5 : 0), r, r * 0.8, sd + 995 + j, 9); D.push(inkLoop(pts, oS(995 + j))); DI.push(inkPath(pts, oS(998 + j, { closed: true, w: 3 * S }))); }
              lay.smokeF.setAttribute('d', (lay.smokeF.getAttribute('d') || '') + ' ' + D.join(' '));
              lay.smokeI.setAttribute('d', (lay.smokeI.getAttribute('d') || '') + ' ' + DI.join(' '));
              if (e < 0.12) lay.flash.setAttribute('d', (lay.flash.getAttribute('d') || '') + ' ' + inkDot(mx, my, 26 * cs, 18 * cs, sd + 1001, t));
            }
          }
          // ---- strike: a ball smashes into stone beside someone
          const SK = P.strike ? Object.assign({ x: 0.5, y: 0.8, from: [1.0, 0.45] }, P.strike) : null;
          const CF = [], CI = [], DF2 = [], DI2 = [], FL2 = [], BL2 = [];
          let shk = 0;
          if (SK) {
            const a = atOr(cues, SK.at, dur * 0.5), fly = 0.45, x1 = SK.x * W, y1 = SK.y * H, x0 = SK.from[0] * W, y0 = SK.from[1] * H;
            if (lt >= a - fly && lt < a) { const u = (lt - a + fly) / fly; BL2.push(inkDot(lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(Math.PI * u) * 90 * S, 12 * S, 12 * S, sd + 1100, t)); }
            if (lt >= a) {
              const e = lt - a; shk = punch(lt, a, 0.8);
              if (e < 0.15) FL2.push(inkDot(x1, y1, 60 * S, 40 * S, sd + 1101, t));
              for (let j = 0; j < 9; j++) {
                const ang = -Math.PI * (0.1 + 0.8 * j / 8), sp = (260 + (j * 37) % 120) * S, q = Math.min(e, 1.4);
                const cx = x1 + Math.cos(ang) * sp * q, cy = y1 + Math.sin(ang) * sp * q + 420 * S * q * q;
                if (cy > y1 + 40 * S) continue;
                const r = (10 + (j * 13) % 12) * S, pts = [[cx - r, cy + r * 0.4], [cx - r * 0.3, cy - r], [cx + r, cy - r * 0.2], [cx + r * 0.4, cy + r]];
                CF.push(inkLoop(pts, oS(1110 + j, { smooth: false, amp: 1 }))); CI.push(inkPath(pts, oS(1130 + j, { w: 3 * S, smooth: false, closed: true })));
              }
              if (e < 2.5) for (let j = 0; j < 4; j++) {
                const r = (20 + e * 34) * S, pts = inkEllipsePts(x1 + (j - 1.5) * r * 0.8, y1 - e * 40 * S - (j % 2) * r * 0.5, r, r * 0.75, sd + 1150 + j, 9);
                DF2.push(inkLoop(pts, oS(1150 + j))); DI2.push(inkPath(pts, oS(1160 + j, { closed: true, w: 3 * S })));
              }
            }
          }
          fx.chipF.setAttribute('d', CF.join(' ')); fx.chipI.setAttribute('d', CI.join(' '));
          fx.dF.setAttribute('d', DF2.join(' ')); fx.dI.setAttribute('d', DI2.join(' '));
          fx.fl.setAttribute('d', FL2.join(' ')); fx.ball.setAttribute('d', BL2.join(' '));
          if (shk > 0) cam.setAttribute('transform', (cam.getAttribute('transform') || '') + ` translate(${f1(Math.sin(lt * 63) * 16 * shk)} ${f1(Math.cos(lt * 51) * 11 * shk)})`);

          if (cast) cast.update(lt, t, cues);
          if (labs) labs.update(lt, t, cues);
        },
      };
    },
  };
  SH.mt_trench = {
    kind: '2d',
    build(ctx) {
      const P0 = ctx.P || {};
      const P = Object.assign({ sea: 0.6, hill: false, gabions: true, quay: { side: 'left', w: 1.02, y: 0.8 },
        forts: [{ x: 0.82, w: 360, h: 150, base: 0.56, damage: 0.6, flag: true }], cam: { zoom: 1.05, focus: [0.4, 0.7] } }, P0);
      return SH.mt_fort.build(Object.assign({}, ctx, { P }));
    },
  };
})();
