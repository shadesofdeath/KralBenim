// lz_grid: rebuilding Lisbon after 1755 (Pombal's Baixa) in the parchment ink style (brand/kit/BRAND.md §3, §5; every
// line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for
// 05-lizbon-depremi-1755 but parametric. Needs mcB__lib.js (window.MCB: cast, labels, camPush). 16:9 first.
//
// SHOTS.lz_grid P: {
//   mode: "plan" | "gaiola" | "march",
//     plan   — a town-plan sheet pinned to the page: the river along its bottom edge, the old maze of crooked lanes
//              (ink-soft); cue `erase`: the lanes fade and get crossed out; cue `grid`: straight wide streets rule
//              themselves in one by one (north-south, then east-west) into a right-angled grid; cue `square`: the
//              big riverside square is outlined in red. P.sheet: {x: 0.21, y: 0.18, w: 0.5, h: 0.73} (0..1 W/H).
//     gaiola — a building wall cut open: masonry infill (bricks) inside a timber frame of posts, beams and X braces
//              (the "gaiola", Pombaline cage) that draws itself on cue `frame`; cue `shake`: the whole wall sways
//              (shear); cue `hit`: bricks crack and tumble out, the timber cage stays standing. P.wall: {x: 0.28, w: 0.4}
//     march  — a small wooden model house on a plinth; a column of soldiers (helmet) marches past in front of it
//              and another behind it, stamping in step; on every step the model and the ground tremble a little and
//              dust puffs rise; the model stays up. P.soldiers: 5, P.speed: 0.06 (screen widths per second).
//   cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.06, focus}
// }
// Aliases: SHOTS.lz_gaiola (mode gaiola), SHOTS.lz_march (mode march).
// cues: erase, grid, square, frame, shake, hit, plus cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;

  SH.lz_grid = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1758;
      const mode = ctx.forceMode || P.mode || 'plan';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const R = rng(sd + 1);
      const L = {
        sheetSh: inkEl(cam, INK.ink, { 'fill-opacity': 0.12 }), sheet: inkEl(cam, INK.paperLight), sheetR: inkEl(cam),
        river: inkEl(cam, INK.blue, { 'fill-opacity': 0.25 }), riverR: inkEl(cam, INK.inkSoft),
        old: inkEl(cam, INK.inkSoft), oldX: inkEl(cam, INK.red), grid: inkEl(cam), blocks: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 }), square: inkEl(cam, INK.red), pins: inkEl(cam, INK.red),
        bricks: inkEl(cam, INK.paperDark), brickR: inkEl(cam, INK.inkSoft), fallen: inkEl(cam, INK.paperDark), fallenR: inkEl(cam, INK.inkSoft), timber: inkEl(cam, INK.hat), timberR: inkEl(cam), cracks: inkEl(cam, INK.red),
        ground: inkEl(cam), groundF: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.5 }), dust: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.75 }),
        model: inkEl(cam, INK.paperLight), modelR: inkEl(cam), modelX: inkEl(cam, INK.hat),
      };
      const backG = el(cam, 'g'), frontG = el(cam, 'g');
      cam.insertBefore(backG, L.model);
      const castG = el(cam, 'g'), cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);

      // ------------------------------------------------------------ plan data
      const S = Object.assign({ x: 0.21, y: 0.18, w: 0.5, h: 0.73 }, P.sheet || {});
      const sx0 = S.x * W, sy0 = S.y * H, sw = S.w * W, sh = S.h * H, ry = sy0 + sh * 0.84;
      const lanes = [];
      for (let k = 0; k < 16; k++) {
        const pts = []; let x = sx0 + 30 + R() * (sw - 60), y = sy0 + 30 + R() * (ry - sy0 - 60); const ang0 = R() * Math.PI * 2;
        for (let j = 0; j < 6; j++) { pts.push([x, y]); const a = ang0 + Math.sin(j * 1.7 + k) * 1.1; x = Math.max(sx0 + 20, Math.min(sx0 + sw - 20, x + Math.cos(a) * 70)); y = Math.max(sy0 + 20, Math.min(ry - 20, y + Math.sin(a) * 70)); }
        lanes.push(pts);
      }
      const NV = 7, NH = 5;

      // ------------------------------------------------------------ soldiers (march)
      const sold = [];
      if (mode === 'march') {
        const n = P.soldiers ?? 5;
        for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) {
          const g = el(r === 0 ? backG : frontG, 'g');
          sold.push({ r, i, rig: KASIF.create(g, { scale: r === 0 ? 0.42 : 0.6, hat: false, accessory: 'helmet', seed: sd + 50 + r * 20 + i }) });
        }
        cam.appendChild(frontG); cam.appendChild(castG);   // narrator in front of the marching rows
      }
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          if (mode === 'plan') plan(lt, t, cues, dur);
          else if (mode === 'gaiola') shake = gaiola(lt, t, cues);
          else march(lt, t, cues);
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit, shake);
          lb.update(lt, t, cues);
        },
      };

      function plan(lt, t, cues, dur) {
        const sp = spring(lt, 0, 0.6), dy = (1 - sp) * 60;
        const sheet = [[sx0, sy0 + dy], [sx0 + sw, sy0 + 6 + dy], [sx0 + sw - 4, sy0 + sh + dy], [sx0 + 6, sy0 + sh - 4 + dy]];
        L.sheetSh.setAttribute('d', inkLoop(sheet.map(q => [q[0] + 14, q[1] + 16]), { seed: sd + 2, t, amp: 1, smooth: false }));
        L.sheet.setAttribute('d', inkLoop(sheet, { seed: sd + 3, t, amp: 1, smooth: false }));
        L.sheetR.setAttribute('d', inkPath(sheet, { w: 4, seed: sd + 4, t, amp: 1.2, closed: true, smooth: false }));
        L.pins.setAttribute('d', inkDot(sx0 + 24, sy0 + 24 + dy, 11, 11, sd + 5, t) + ' ' + inkDot(sx0 + sw - 24, sy0 + 28 + dy, 11, 11, sd + 6, t));
        // river
        const rp = []; for (let x = sx0 + 6; x <= sx0 + sw - 4; x += 40) rp.push([x, ry + dy + Math.sin(x * 0.02 + t) * 5]);
        L.river.setAttribute('d', inkLoop(rp.concat([[sx0 + sw - 4, sy0 + sh + dy - 4], [sx0 + 6, sy0 + sh + dy - 4]]), { seed: sd + 7, t, amp: 0.8, smooth: false }));
        let rr = inkPath(rp, { w: 4, seed: sd + 8, t, amp: 1 });
        for (let k = 0; k < 5; k++) { const x = sx0 + 40 + ((k * 0.31 % 1) * (sw - 120) + t * 18) % (sw - 120), y = ry + dy + 30 + (k % 2) * 30; rr += ' ' + inkPath([[x, y], [x + 40, y - 5], [x + 80, y]], { w: 3, seed: sd + 9 + k, t, amp: 1 }); }
        L.riverR.setAttribute('d', rr);
        // old lanes
        const eAt = atOr(cues, 'erase', null), eg = eAt != null ? progIO(lt, eAt, 0.8) : 0;
        let od = '';
        lanes.forEach((pts, k) => { od += inkPath(pts.map(p => [p[0], p[1] + dy]), { w: 5, seed: sd + 20 + k, t, amp: 1.2 }) + ' '; });
        L.old.setAttribute('d', od); L.old.setAttribute('fill-opacity', (1 - 0.7 * eg).toFixed(3));
        let xd = '';
        if (eg > 0) { const a = [sx0 + 60, sy0 + 60 + dy], b = [sx0 + sw - 60, ry - 40 + dy], c = [sx0 + sw - 60, sy0 + 60 + dy], d = [sx0 + 60, ry - 40 + dy];
          const g1 = clamp01(eg * 2), g2 = clamp01(eg * 2 - 1);
          xd = inkPath([a, [lerp(a[0], b[0], g1), lerp(a[1], b[1], g1)]], { w: 12, seed: sd + 40, t, amp: 1.5 });
          if (g2 > 0) xd += ' ' + inkPath([c, [lerp(c[0], d[0], g2), lerp(c[1], d[1], g2)]], { w: 12, seed: sd + 41, t, amp: 1.5 });
          const gA = atOr(cues, 'grid', null); if (gA != null && lt > gA) xd = ''; }
        L.oldX.setAttribute('d', xd);
        // grid
        const gAt = atOr(cues, 'grid', null);
        let gd = '', bd = '';
        if (gAt != null && lt > gAt) {
          L.old.setAttribute('fill-opacity', '0.12');
          const gx0 = sx0 + 50, gx1 = sx0 + sw - 50, gy0 = sy0 + 50 + dy, gy1 = ry - 110 + dy;
          const per = Math.max(0.12, Math.min(0.28, (dur - (gAt) - 0.8) / (NV + NH)));
          for (let k = 0; k < NV; k++) { const g = progIO(lt, gAt + k * per, per * 1.4); if (g <= 0) continue; const x = lerp(gx0, gx1, k / (NV - 1));
            gd += inkPath([[x, gy0], [x, lerp(gy0, gy1, g)]], { w: 7, seed: sd + 60 + k, t, amp: 1.2 }) + ' '; }
          for (let k = 0; k < NH; k++) { const g = progIO(lt, gAt + (NV + k) * per, per * 1.4); if (g <= 0) continue; const y = lerp(gy0, gy1, k / (NH - 1));
            gd += inkPath([[gx0, y], [lerp(gx0, gx1, g), y]], { w: 7, seed: sd + 70 + k, t, amp: 1.2 }) + ' '; }
          const done = gAt + (NV + NH) * per;
          if (lt > done) for (let a = 0; a < NV - 1; a++) for (let b = 0; b < NH - 1; b++) {
            const p = spring(lt, done + (a + b) * 0.05, 0.4); if (p <= 0.01) continue;
            const x0 = lerp(gx0, gx1, a / (NV - 1)) + 12, x1 = lerp(gx0, gx1, (a + 1) / (NV - 1)) - 12, y0 = lerp(gy0, gy1, b / (NH - 1)) + 12, y1 = lerp(gy0, gy1, (b + 1) / (NH - 1)) - 12;
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, k = Math.min(1, p);
            bd += inkLoop([[cx + (x0 - cx) * k, cy + (y0 - cy) * k], [cx + (x1 - cx) * k, cy + (y0 - cy) * k], [cx + (x1 - cx) * k, cy + (y1 - cy) * k], [cx + (x0 - cx) * k, cy + (y1 - cy) * k]], { seed: sd + 80 + a * 7 + b, t, amp: 0.8, smooth: false }) + ' '; }
        }
        L.grid.setAttribute('d', gd); L.blocks.setAttribute('d', bd);
        const qAt = atOr(cues, 'square', null);
        let qd = '';
        if (qAt != null && lt > qAt) { const g = progIO(lt, qAt, 0.6), x0 = sx0 + sw * 0.32, x1 = sx0 + sw * 0.68, y0 = ry - 100 + dy, y1 = ry - 14 + dy;
          const pts = [[x0, y1], [x0, y0], [x1, y0], [x1, y1]]; const n = Math.max(2, Math.ceil(g * 4)); const sub = pts.slice(0, n);
          qd = inkPath(sub.length > 1 ? sub : pts.slice(0, 2), { w: 9, seed: sd + 90, t, amp: 1.4, smooth: false }); }
        L.square.setAttribute('d', qd);
      }

      function gaiola(lt, t, cues) {
        const Wd = Object.assign({ x: 0.28, w: 0.4 }, P.wall || {});
        const x0 = Wd.x * W, x1 = (Wd.x + Wd.w) * W, gy = 0.86 * H, y0 = 0.2 * H;
        const shAt = atOr(cues, 'shake', null), hitAt = atOr(cues, 'hit', null);
        const shake = shAt != null && lt > shAt ? clamp01((lt - shAt) / 0.4) : 0;
        const shear = shake * Math.sin(lt * 9) * 34;
        const T = p => [p[0] + shear * (gy - p[1]) / (gy - y0), p[1]];
        // ground
        L.ground.setAttribute('d', inkPath([[-20, gy], [W + 20, gy]], { w: 6, seed: sd + 100, t, amp: 1.2 }));
        L.groundF.setAttribute('d', inkLoop([[-20, gy], [W + 20, gy], [W + 20, H + 20], [-20, H + 20]], { seed: sd + 101, t, amp: 1, smooth: false }));
        const cols = 3, rows = 3, bw = (x1 - x0) / cols, bh = (gy - y0) / rows;
        // bricks
        let bd = '', br = '', fd = '', fr = '', cr = '';
        for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
          const bx = x0 + c * bw, by = y0 + r * bh;
          for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) {
            const k = (c * rows + r) * 15 + j * 3 + i;
            const w = (bw - 30) / 3, h = (bh - 30) / 5, px = bx + 15 + i * w + (j % 2 ? w * 0.5 : 0) - (j % 2 && i === 2 ? w * 0.5 : 0), py = by + 15 + j * h;
            const loose = ((k * 7) % 5) < 2;
            let off = [0, 0], rot = 0;
            if (hitAt != null && loose) { const age = lt - hitAt - ((k * 13) % 9) * 0.06; if (age > 0) { off = [((k % 3) - 1) * 60 * age, Math.min(gy - py - h, age * age * 1200)]; rot = age * ((k % 2) ? 2 : -2); } }
            const ww = j % 2 && i === 2 ? w * 0.5 : w;
            const cx = px + ww / 2 + off[0], cy = py + h / 2 + off[1], c2 = Math.cos(rot), s2 = Math.sin(rot);
            const pts = [[-ww / 2 + 3, -h / 2 + 3], [ww / 2 - 3, -h / 2 + 3], [ww / 2 - 3, h / 2 - 3], [-ww / 2 + 3, h / 2 - 3]].map(p => T([cx + p[0] * c2 - p[1] * s2, cy + p[0] * s2 + p[1] * c2]));
            if (off[1] > 2) { fd += inkLoop(pts, { seed: sd + 120 + k, t, amp: 0.6, smooth: false }) + ' '; fr += inkPath(pts, { w: 2.5, seed: sd + 900 + k, t, amp: 0.6, closed: true, smooth: false }) + ' '; }
            else { bd += inkLoop(pts, { seed: sd + 120 + k, t, amp: 0.6, smooth: false }) + ' '; br += inkPath(pts, { w: 2.5, seed: sd + 900 + k, t, amp: 0.6, closed: true, smooth: false }) + ' '; }
          }
          if (hitAt != null && lt > hitAt) { const pts = []; for (let j = 0; j <= 4; j++) pts.push(T([bx + bw * (0.3 + 0.1 * j) + (j % 2 ? 14 : -14), by + 20 + j * (bh - 40) / 4]));
            cr += inkPath(pts, { w: 5, seed: sd + 1100 + c * 3 + r, t, amp: 1, smooth: false }) + ' '; }
        }
        L.bricks.setAttribute('d', bd); L.brickR.setAttribute('d', br); L.fallen.setAttribute('d', fd); L.fallenR.setAttribute('d', fr); L.cracks.setAttribute('d', cr);
        // timber frame (drawn on cue frame)
        const fAt = atOr(cues, 'frame', 0.3), beams = [];
        for (let c = 0; c <= cols; c++) beams.push([[x0 + c * bw, gy], [x0 + c * bw, y0]]);
        for (let r = 0; r <= rows; r++) beams.push([[x0, y0 + r * bh], [x1, y0 + r * bh]]);
        for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const bx = x0 + c * bw, by = y0 + r * bh;
          beams.push([[bx, by], [bx + bw, by + bh]]); beams.push([[bx + bw, by], [bx, by + bh]]); }
        let td = '', tr = '';
        beams.forEach((b, k) => { const g = progIO(lt, fAt + k * 0.06, 0.35); if (g <= 0) return;
          const a = T(b[0]), e = T([lerp(b[0][0], b[1][0], g), lerp(b[0][1], b[1][1], g)]);
          const dx = e[0] - a[0], dy = e[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len * 9, ny = dx / len * 9;
          const q = [[a[0] + nx, a[1] + ny], [e[0] + nx, e[1] + ny], [e[0] - nx, e[1] - ny], [a[0] - nx, a[1] - ny]];
          td += inkLoop(q, { seed: sd + 200 + k, t, amp: 0.8, smooth: false }) + ' ';
          tr += inkPath(q, { w: 3.5, seed: sd + 300 + k, t, amp: 1, closed: true, smooth: false }) + ' '; });
        L.timber.setAttribute('d', td); L.timberR.setAttribute('d', tr);
        let dd = '';
        if (hitAt != null && lt > hitAt + 0.3) for (let k = 0; k < 4; k++) { const age = lt - hitAt - 0.3; dd += inkCircle(x0 + (k + 0.5) * (x1 - x0) / 4, gy - 20 - age * 25, Math.min(110, 30 + age * 60), sd + 400 + k, t, { fill: true, amp: 2 }) + ' '; }
        L.dust.setAttribute('d', dd);
        return shake * 0.6;
      }

      function march(lt, t, cues) {
        const gy = 0.84 * H, by = 0.68 * H, spd = (P.speed ?? 0.06) * W;
        const stepHz = 1.7, thump = Math.pow(Math.abs(Math.sin(lt * Math.PI * stepHz)), 6);
        const tremble = Math.sin(lt * 40) * 3 * thump;
        // ground (front and back lines)
        L.groundF.setAttribute('d', inkLoop([[-20, by], [W + 20, by], [W + 20, H + 20], [-20, H + 20]], { seed: sd + 101, t, amp: 1, smooth: false }));
        L.ground.setAttribute('d', inkPath([[-20, by + tremble * 0.5], [W + 20, by - tremble * 0.5]], { w: 5, seed: sd + 100, t, amp: 1.2 }) + ' ' + inkPath([[-20, gy], [W + 20, gy]], { w: 6, seed: sd + 102, t, amp: 1.2 }));
        // model house on a plinth (centre, between the rows)
        const mx = 0.5 * W, my = 0.76 * H, mw = 0.2 * W, mh = 0.26 * H, rot = Math.sin(lt * 37) * 0.012 * thump * 10;
        const c = Math.cos(rot), s = Math.sin(rot), T = p => [mx + p[0] * c - (p[1] - my) * s + tremble, my + p[0] * s + (p[1] - my) * c];
        const plinth = [[-mw * 0.62, my], [mw * 0.62, my], [mw * 0.62, my + 34], [-mw * 0.62, my + 34]].map(T);
        const house = [[-mw / 2, my], [-mw / 2, my - mh], [0, my - mh - mw * 0.32], [mw / 2, my - mh], [mw / 2, my]].map(T);
        L.model.setAttribute('d', inkLoop(house, { seed: sd + 500, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(plinth, { seed: sd + 501, t, amp: 0.8, smooth: false }));
        L.modelR.setAttribute('d', inkPath(house, { w: 5, seed: sd + 502, t, amp: 1, closed: true, smooth: false }) + ' ' + inkPath(plinth, { w: 4, seed: sd + 503, t, amp: 1, closed: true, smooth: false }));
        let xd = '';
        for (let k = 0; k < 2; k++) for (let r = 0; r < 2; r++) { const a = -mw / 2 + k * mw / 2, b = my - mh + r * mh / 2;
          const seg = (p, q, j) => { const A = T(p), B = T(q), dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * 5, ny = dx / l * 5;
            xd += inkLoop([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]], { seed: sd + 510 + j, t, amp: 0.6, smooth: false }) + ' '; };
          seg([a, b], [a + mw / 2, b + mh / 2], k * 4 + r * 2); seg([a + mw / 2, b], [a, b + mh / 2], k * 4 + r * 2 + 1); }
        L.modelX.setAttribute('d', xd);
        // soldiers
        let dd = '';
        sold.forEach(S0 => {
          const n = P.soldiers ?? 5, dir = S0.r === 0 ? -1 : 1, sc = S0.r === 0 ? 0.42 : 0.6, span = W * 1.3;
          const base = S0.i / n * span, d = lt * spd;
          let x = dir > 0 ? ((base + d) % span) - W * 0.15 : W * 1.15 - ((base + d) % span);
          const y = S0.r === 0 ? by : gy;
          S0.rig.update(t, 'walk', { x, y, face: dir, ph: (d + base) / (gait * sc) });
          if (thump > 0.6) dd += inkCircle(x, y - 6, 14 + thump * 10, sd + 600 + S0.r * 20 + S0.i, t, { fill: true, amp: 1.5 }) + ' ';
        });
        L.dust.setAttribute('d', dd);
      }
    },
  };
  // aliases: SHOTS.lz_gaiola (mode gaiola), SHOTS.lz_march (mode march), same P
  SH.lz_gaiola = { kind: '2d', build(ctx) { return SH.lz_grid.build(Object.assign({}, ctx, { forceMode: 'gaiola' })); } };
  SH.lz_march = { kind: '2d', build(ctx) { return SH.lz_grid.build(Object.assign({}, ctx, { forceMode: 'march' })); } };
})();
