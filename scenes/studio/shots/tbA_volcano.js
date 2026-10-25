// tbA_volcano: a big stratovolcano seen from the side in parchment ink (brand/kit/BRAND.md §3, §5) — written for
// ag-04-tambora-1816 (Mount Tambora, April 1815), parametric for any volcano story. Every line boils at 8 Hz
// (_ink.js); everything is a pure function of (seed, lt), no Math.random. Needs mcB__lib.js (window.MCB).
//
// Three type names share one builder (only the default mode differs):
//   SHOTS.tbA_peak  (mode "quiet" | "rumble" | "blast" | "shorter")   SHOTS.tbA_erupt (mode "columns" | "liquid")
//   SHOTS.tbA_flow  (mode "flow")
//   quiet   — calm mountain, drifting clouds, birds, rice terraces, stilt huts, palms, a small palace with a flag.
//   rumble  — like quiet, then from cue `rumble` the mountain shakes, an ash puff climbs from the summit, rocks roll
//             down the slopes and the birds scatter.
//   blast   — night sky (ink hatching): on cue `boom` a giant ash column with fire at its root shoots up, a shock ring
//             races out, lava bombs fly, the camera shakes.
//   columns — night: from cue `fire` three fire columns rise from the summit; on cue `join` they lean together and
//             merge into one huge column.
//   liquid  — night: the summit burns and red-gold lava rivers run down every slope from cue `lava`.
//   flow    — mountain on the left, sea on the right: from cue `flow` grey avalanches of burning ash (billowing ink
//             clouds) race down the right slope, sweep the shore huts into the sea, a splash + steam where they hit.
//   shorter — the full mountain; on cue `cut` its top breaks into chunks that fly up out of frame, leaving a flat
//             caldera, a red dashed ghost of the old peak and a dimension bracket (label it with P.labels).
// P: {mode, x: 0.5 (summit x, 0..1 W), base: 0.74 (foot line, 0..1 H), hw: 0.5 (half width, 0..1 W), h: 0.5 (0..1 H),
//     night: auto, terraces: true, huts: [{x, s: 1, at}] | false, palms: [{x, h: 1}] | false, palace: {x, at} | false,
//     village: cue (huts pop in one by one from it), rice: cue (terraces draw from it), sun: {x, y, cross: cue} | false,
//     clouds: true, birds: true, cut: 0.3 (shorter: fraction of the height blown away), bracket: true,
//     sea: {x: 0.72} (flow), flow_dur: 2.6, bubble: {text, x, y, at, w: 520, tail: [x, y]} (speech bubble, 0..1),
//     cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.5]}}
// cues: rumble, boom, fire, join, lava, flow, cut, village, rice, sun.cross, bubble.at + cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const J = a => a.filter(Boolean).join(' ');
  const ff = v => Math.round(v * 10) / 10;

  function build(defMode) {
    return {
      kind: '2d',
      build(ctx) {
        const { P, W, H, svg, seed } = ctx;
        const { atOr, cast, labels, camPush, rr } = window.MCB;
        const sd = seed * 1000 + 1815;
        const mode = P.mode || defMode;
        const night = P.night ?? ['blast', 'columns', 'liquid'].includes(mode);
        const isFlow = mode === 'flow';
        const CX = (P.x ?? (isFlow ? 0.36 : 0.5)) * W, BASE = (P.base ?? (isFlow ? 0.7 : 0.74)) * H;
        const HW = (P.hw ?? (isFlow ? 0.62 : 0.5)) * W, HH = (P.h ?? 0.5) * H;
        const CUT = P.cut ?? 0.3, maxH = HH * (1 - CUT), UC = 1 - Math.pow(1 - CUT, 1 / 1.5);
        // profile: y of the mountain top line at u in [-1, 1]; cut = true -> caldera
        const prof = (u, cut) => {
          const a = Math.max(0, 1 - Math.abs(u));
          let hh = HH * Math.pow(a, 1.5) * (1 + 0.035 * Math.sin(u * 9 + 1.3) * (1 - a));
          if (!cut && Math.abs(u) < 0.045) hh -= HH * 0.022 * (1 - Math.abs(u) / 0.045);
          if (cut && hh > maxH) { const q = Math.abs(u) / UC; hh = maxH - HH * 0.06 * (1 - q * q); }
          return BASE - hh;
        };
        const N = 64, US = Array.from({ length: N + 1 }, (_, i) => -1 + 2 * i / N);
        const ptsOf = (cut) => US.map(u => [CX + u * HW, prof(u, cut)]);

        const root = el(svg, 'g'), cam = el(root, 'g'), vw = el(cam, 'g');
        if (P.view) { const vs = P.view.scale ?? 1.4, [vx, vy] = (P.view.focus || [0.5, 0.7]).map((v, i) => v * (i ? H : W)); vw.setAttribute('transform', `translate(${ff(vx)} ${ff(vy)}) scale(${vs}) translate(${ff(-vx)} ${ff(-vy)})`); }
        const L = {
          sky: inkEl(vw, INK.inkSoft), hatch: inkEl(vw, INK.ink, { 'fill-opacity': 0.6 }), stars: inkEl(vw, INK.gold),
          sun: inkEl(vw, INK.gold), sunR: inkEl(vw), sunX: inkEl(vw, INK.red),
          cloudF: inkEl(vw, INK.paperLight), cloudR: inkEl(vw, INK.inkSoft), birds: inkEl(vw),
          glow: inkEl(vw, INK.red, { 'fill-opacity': 0.22 }),
          ash: inkEl(vw, night ? INK.paperDark : INK.inkSoft, { 'fill-opacity': 0.92 }), ashR: inkEl(vw),
          fireR: inkEl(vw, INK.red), fireG: inkEl(vw, INK.gold),
        };
        const mtnG = el(vw, 'g');
        const M = { fill: inkEl(mtnG, night ? INK.ink : INK.paperDark), shade: inkEl(mtnG, INK.inkSoft, { 'fill-opacity': night ? 0.0 : 0.55 }),
          terF: inkEl(mtnG, INK.green, { 'fill-opacity': 0.55 }), terR: inkEl(mtnG, INK.green),
          line: inkEl(mtnG), gully: inkEl(mtnG, INK.inkSoft),
          lavaR: inkEl(mtnG, INK.red), lavaG: inkEl(mtnG, INK.gold), crown: inkEl(mtnG, INK.red), crownG: inkEl(mtnG, INK.gold) };
        const C = { colR: inkEl(vw, INK.red), colG: inkEl(vw, INK.gold), capF: inkEl(vw, INK.paperDark), capR: inkEl(vw),
          ghost: inkEl(vw, INK.red), brk: inkEl(vw, INK.red), rocks: inkEl(vw, INK.paperDark), rocksR: inkEl(vw),
          bombs: inkEl(vw, INK.gold), bombsR: inkEl(vw, INK.red), ring: inkEl(vw, INK.paperLight), ringR: inkEl(vw),
          puff: inkEl(vw, INK.paperDark), puffR: inkEl(vw, INK.inkSoft) };
        const G = { f: inkEl(vw, INK.paperDark, { 'fill-opacity': 0.7 }), r: inkEl(vw), tick: inkEl(vw, INK.inkSoft) };
        const V = { hutF: inkEl(vw, INK.paperLight), roof: inkEl(vw, INK.paperDark), hutR: inkEl(vw), flag: inkEl(vw, INK.red),
          palm: inkEl(vw), frond: inkEl(vw, INK.green), frondR: inkEl(vw) };
        const S = { f: inkEl(vw, INK.paperLight), tint: inkEl(vw, INK.blue, { 'fill-opacity': 0.22 }), r: inkEl(vw, INK.inkSoft), h: inkEl(vw, INK.blue), splash: inkEl(vw, INK.paperLight), splashR: inkEl(vw, INK.inkSoft) };
        const F = { b: inkEl(vw, INK.paperDark), bR: inkEl(vw, INK.inkSoft), f: inkEl(vw, INK.inkSoft, { 'fill-opacity': 0.94 }), r: inkEl(vw), glow: inkEl(vw, INK.red, { 'fill-opacity': 0.8 }) };
        const castG = el(cam, 'g');
        const cs = cast(castG, P.cast, W, H, sd + 200);
        const bubG = el(root, 'g');
        const B = P.bubble ? { f: inkEl(bubG, INK.paperLight), r: inkEl(bubG), tx: el(bubG, 'text', { 'font-family': INK_FONT, 'font-size': P.bubble.size || 64, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }) } : null;
        if (B) B.tx.textContent = P.bubble.text;
        const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);

        const R = rng(sd + 7);
        const hatchL = Array.from({ length: 120 }, (_, k) => ({ x: R(), y: Math.pow(R(), 1.6), l: 60 + R() * 110, c: k % 2 }));
        const starL = Array.from({ length: 14 }, () => ({ x: R(), y: R() * 0.32 }));
        const huts = P.huts === false ? [] : (P.huts || (isFlow ? [{ x: 0.58 }, { x: 0.66, s: 0.9 }, { x: 0.74 }, { x: 0.81, s: 0.85 }]
          : [{ x: 0.17 }, { x: 0.25, s: 0.85 }, { x: 0.36 }, { x: 0.69, s: 0.9 }, { x: 0.78 }])).map((h, i) => Object.assign({ i, s: 1 }, h));
        const palms = P.palms === false ? [] : (P.palms || (isFlow ? [{ x: 0.53 }, { x: 0.7, h: 0.8 }] : [{ x: 0.08 }, { x: 0.31, h: 0.8 }, { x: 0.86, h: 0.9 }]));
        const palace = P.palace === false || P.palace == null ? null : Object.assign({ x: 0.55 }, P.palace);
        const rocks = Array.from({ length: 7 }, (_, k) => ({ side: k % 2 ? 1 : -1, d: R() * 1.5, sp: 0.35 + R() * 0.25, s: (14 + R() * 14) * (P.rock_scale ?? 1) }));
        const bombs = Array.from({ length: 16 }, () => ({ a: (R() - 0.5) * 2.2, v: 0.6 + R() * 0.6, ph: R() }));
        const seaX = (P.sea && P.sea.x != null ? P.sea.x : 0.73) * W;

        const hutPts = (x, y, s) => {
          const w = 92 * s, h = 54 * s, st = 26 * s;
          return { body: [[x - w / 2, y - st - h], [x + w / 2, y - st - h], [x + w / 2, y - st], [x - w / 2, y - st]],
            roof: [[x - w * 0.68, y - st - h + 4], [x, y - st - h - 62 * s], [x + w * 0.68, y - st - h + 4]],
            stilts: [[[x - w * 0.4, y - st], [x - w * 0.4, y]], [[x + w * 0.4, y - st], [x + w * 0.4, y]], [[x, y - st], [x, y]]],
            door: [[x - 12 * s, y - st], [x - 12 * s, y - st - 32 * s], [x + 12 * s, y - st - 32 * s], [x + 12 * s, y - st]] };
        };
        const rot = (p, c, a) => { const s = Math.sin(a), co = Math.cos(a); return [c[0] + (p[0] - c[0]) * co - (p[1] - c[1]) * s, c[1] + (p[0] - c[0]) * s + (p[1] - c[1]) * co]; };
        const puff = (cx, cy, r, k0, t, n = 22) => { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, q = r * (0.9 + 0.16 * Math.abs(Math.sin(a * 3.5 + k0 * 1.3 + t * 0.4))); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.88]); } return pts; };

        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt;
            const rumble = atOr(cues, 'rumble', mode === 'rumble' ? dur * 0.45 : null);
            const boom = atOr(cues, 'boom', mode === 'blast' ? dur * 0.3 : null);
            const fireAt = atOr(cues, 'fire', mode === 'columns' ? 0.4 : null), joinAt = atOr(cues, 'join', mode === 'columns' ? dur * 0.7 : null);
            const lavaAt = atOr(cues, 'lava', mode === 'liquid' ? 0.3 : null);
            const flowAt = atOr(cues, 'flow', isFlow ? 0.3 : null), flowDur = P.flow_dur ?? 2.6;
            const cutAt = atOr(cues, 'cut', mode === 'shorter' ? dur * 0.3 : null);
            const cutDone = cutAt != null && lt >= cutAt;
            const pk = Math.max(punch(lt, boom, 0.8), punch(lt, joinAt, 0.6), punch(lt, cutAt, 0.8), punch(lt, rumble, 0.5));
            let shake = 0;
            if (boom != null && lt >= boom) shake = Math.exp(-(lt - boom) * 1.6);
            if (cutDone) shake = Math.max(shake, Math.exp(-(lt - cutAt) * 2.2));
            if (rumble != null && lt >= rumble) shake = Math.max(shake, 0.25 + 0.12 * Math.sin(t * 5));
            camPush(cam, lt, dur, W, H, P.cam || {}, pk, shake);

            // ---------------------------------------------------- sky
            if (night) {
              L.sky.setAttribute('d', inkLoop([[640, -80], [W + 80, -80], [W + 80, BASE + 10], [-80, BASE + 10], [-80, 230], [120, 214], [300, 236], [470, 212], [600, 196], [640, 120]], { seed: sd + 19, t, amp: 1, smooth: false }));
              L.hatch.setAttribute('d', J(hatchL.map((h, k) => { const x = h.x * (W + 200) - 100, y = h.y * BASE * 0.95;
                if (x < 680 && y < 250) return '';
                return inkPath(h.c ? [[x, y], [x + h.l, y - h.l * 0.42]] : [[x, y - h.l * 0.42], [x + h.l, y]], { w: 5.5, seed: sd + 20 + k, t, amp: 1 }); })));
              L.stars.setAttribute('d', J(starL.map((s, k) => s.x * W < 680 && s.y * H < 250 ? '' : inkDot(s.x * W, s.y * H, 4 + 2 * Math.sin(t * 2 + k), null, sd + 60 + k, t))));
            }
            const sun = P.sun ? Object.assign({ x: 0.8, y: 0.2 }, P.sun) : null;
            if (sun && !night) {
              const sx = sun.x * W, sy = sun.y * H, cr = atOr(cues, sun.cross, null);
              const dim = cr != null ? prog(lt, cr, 0.6) : 0, rays = [];
              for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * 0.25, r1 = 92, r2 = lerp(140, 104, dim) + 8 * Math.sin(t * 3 + k);
                rays.push(inkPath([[sx + Math.cos(a) * r1, sy + Math.sin(a) * r1], [sx + Math.cos(a) * r2, sy + Math.sin(a) * r2]], { w: 7, seed: sd + 80 + k, t, amp: 1 })); }
              L.sun.setAttribute('d', inkCircle(sx, sy, 72, sd + 90, t, { fill: true }));
              L.sunR.setAttribute('d', J([inkCircle(sx, sy, 72, sd + 91, t, { w: 6 }), ...rays]));
              const xp = cr != null ? prog(lt, cr, 0.4) : 0;
              L.sunX.setAttribute('d', xp > 0.01 ? J([inkPath([[sx - 120, sy - 120], [lerp(sx - 120, sx + 120, xp), lerp(sy - 120, sy + 120, xp)]], { w: 16, seed: sd + 95, t }),
                xp > 0.5 ? inkPath([[sx + 120, sy - 120], [lerp(sx + 120, sx - 120, (xp - 0.5) * 2), lerp(sy - 120, sy + 120, (xp - 0.5) * 2)]], { w: 16, seed: sd + 96, t }) : '']) : '');
            }
            if (!night && P.clouds !== false) {
              const cf = [], crr = [];
              [[0.16, 0.28, 110], [0.62, 0.25, 90], [1.05, 0.3, 80]].forEach(([x, y, r], k) => {
                const cx = ((x * W + t * (14 + k * 6)) % (W + 400)) - 120, cy = y * H;
                const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, q = r * (1 + 0.18 * Math.sin(i * 3.1 + k)); pts.push([cx + Math.cos(a) * q * 1.9, cy + Math.sin(a) * q * 0.55]); }
                cf.push(inkLoop(pts, { seed: sd + 100 + k, t, amp: 1.5 })); crr.push(inkPath(pts, { w: 4, seed: sd + 110 + k, t, closed: true }));
              });
              L.cloudF.setAttribute('d', J(cf)); L.cloudR.setAttribute('d', J(crr));
            }
            if (!night && P.birds !== false) {
              const flee = rumble != null && lt >= rumble ? (lt - rumble) : 0, bs = [];
              for (let k = 0; k < 5; k++) {
                const bx = ((0.2 + k * 0.13) * W + t * 40 + flee * flee * 260 * (k % 2 ? 1 : 0.8)) % (W + 200) - 100;
                const by = (0.3 + 0.05 * Math.sin(k * 2.1)) * H - flee * 180 - (k % 3) * 30 + Math.sin(t * 1.3 + k) * 8, f = Math.sin(t * 9 + k) * 12;
                bs.push(inkPath([[bx - 26, by - f], [bx, by + 6], [bx + 26, by - f]], { w: 5, seed: sd + 120 + k, t, amp: 0.8 }));
              }
              L.birds.setAttribute('d', J(bs));
            }

            // ---------------------------------------------------- summit glow + ash column (behind the mountain line)
            const top = [CX, prof(0, cutDone)];
            const burning = (boom != null && lt >= boom) || (fireAt != null && lt >= fireAt) || lavaAt != null || (flowAt != null);
            L.glow.setAttribute('d', burning && !isFlow ? inkCircle(top[0], top[1] + 20, 260 + 30 * Math.sin(t * 2.3), sd + 130, t, { fill: true, ry: 200 }) : '');
            const ashOn = (boom != null && lt >= boom) || (joinAt != null && lt >= joinAt) || lavaAt != null || flowAt != null || (cutDone);
            if (ashOn) {
              const a0 = boom != null && lt >= boom ? boom : joinAt != null && lt >= joinAt ? joinAt : cutDone ? cutAt : -2;
              const u = Math.max(0, lt - a0), up = Math.min(1, u / 1.6);
              const ct = top[1] - lerp(60, top[1] + 160, Math.pow(up, 0.6));
              const cl = [], clr = [];
              for (let k = 0; k < 9; k++) {
                const v = k / 8, y = lerp(top[1] - 30, ct, v), r = lerp(90, 210, v) * (0.92 + 0.08 * Math.sin(t * 1.8 + k)) * (0.4 + 0.6 * up);
                const px0 = top[0] + Math.sin(k * 1.7 + t * 0.6) * 26; if (px0 - r < 600 && y - r < 180) continue;
                const pts = puff(px0, y, r, k, t);
                cl.push(inkLoop(pts, { seed: sd + 140 + k, t, amp: 1.5 })); if (k % 2) clr.push(inkPath(pts, { w: 4, seed: sd + 150 + k, t, closed: true }));
              }
              for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t * 0.15, rx = lerp(120, 480, up);
                const qx = top[0] + Math.cos(a) * rx * 0.75, qy = ct + Math.sin(a) * rx * 0.22; if (qx - rx * 0.4 < 600 && qy - rx * 0.4 < 180) continue;
                const pts = puff(qx, qy, rx * 0.4, k + 20, t);
                cl.push(inkLoop(pts, { seed: sd + 160 + k, t, amp: 1.5 })); clr.push(inkPath(pts, { w: 4, seed: sd + 170 + k, t, closed: true })); }
              L.ash.setAttribute('d', J(cl)); L.ashR.setAttribute('d', J(clr));
            } else { L.ash.setAttribute('d', ''); L.ashR.setAttribute('d', ''); }

            // ---------------------------------------------------- mountain
            const mshake = rumble != null && lt >= rumble ? Math.sin(t * 47) * (P.shake_amp ?? 6) : 0;
            mtnG.setAttribute('transform', `translate(${ff(mshake)} ${ff(Math.cos(t * 39) * Math.abs(mshake) * 0.4)})`);
            const pp = ptsOf(cutDone);
            const fillPts = pp.concat([[CX + HW + 40, BASE + 8], [CX - HW - 40, BASE + 8]]);
            M.fill.setAttribute('d', inkLoop(fillPts, { seed: sd + 200, t, amp: 1.2, smooth: false }));
            M.line.setAttribute('d', inkPath(pp, { w: 7, seed: sd + 201, t, amp: 1.6 }));
            // shaded right flank
            const sh = [];
            for (let k = 0; k < 16; k++) { const u = 0.07 + 0.82 * k / 15, x = CX + u * HW, y = prof(u, cutDone) + 26 + (k % 3) * 22;
              if (y < BASE - 10) sh.push(inkPath([[x, y], [x - 46, y + 56]], { w: 4, seed: sd + 210 + k, t, amp: 0.8 })); }
            const gu = [];
            [-0.55, -0.3, -0.12, 0.16, 0.36, 0.6].forEach((u, k) => {
              const u0 = u * 0.18 + (cutDone ? Math.sign(u) * UC * 0.9 : 0), u1 = u * 1.05;
              gu.push(inkPath([[CX + u0 * HW, prof(u0, cutDone) + 14], [CX + (u0 + u1) / 2 * HW + 10, prof((u0 + u1) / 2, cutDone) + 60], [CX + u1 * HW, prof(u1, cutDone) + 90]], { w: 4, seed: sd + 230 + k, t, amp: 1.2 }));
            });
            M.gully.setAttribute('d', J(gu.concat(night ? [] : sh)));
            // terraces (rice fields) on the lower slopes
            if (P.terraces !== false && !night) {
              const ra = atOr(cues, P.rice || 'rice', 0), tf = [], tr = [];
              [-1, 1].forEach(side => [0, 1, 2].forEach(k => {
                const rp = prog(lt, ra + k * 0.18 + (side > 0 ? 0.1 : 0), 0.7); if (rp < 0.01) return;
                const u0 = 0.56 + k * 0.02, u1 = lerp(u0 + 0.02, 0.95 - k * 0.03, rp), off = 34 + k * 42, top2 = [], bot = [];
                for (let i = 0; i <= 10; i++) { const u = lerp(u0, u1, i / 10), x = CX + side * u * HW, y = prof(side * u, cutDone);
                  if (y + off + 26 > BASE + 4) continue; top2.push([x, y + off]); bot.push([x, y + off + 26]); }
                if (top2.length < 2) return;
                tf.push(inkLoop(top2.concat(bot.reverse()), { seed: sd + 250 + k + side * 9, t, amp: 0.8 }));
                tr.push(inkPath(top2, { w: 4, seed: sd + 260 + k + side * 9, t, amp: 0.8 }));
              }));
              M.terF.setAttribute('d', J(tf)); M.terR.setAttribute('d', J(tr));
            }
            // lava rivers
            if (lavaAt != null) {
              const lr = [], lg = [];
              [-0.72, -0.42, -0.18, 0.2, 0.46, 0.8].forEach((ue, k) => {
                const rp = progIO(lt, lavaAt + k * 0.22, 2.4); if (rp < 0.01) return;
                const pts = []; const n = 14;
                for (let i = 0; i <= n * rp; i++) { const v = i / n, u = ue * v, wig = Math.sin(v * 7 + k) * 18 * v;
                  pts.push([CX + u * HW + wig, prof(u, false) + 8 + v * (30 + (k % 3) * 26)]); }
                if (pts.length < 2) return;
                const w0 = 20 + 4 * Math.sin(t * 4 + k);
                lr.push(inkPath(pts, { w: w0, seed: sd + 300 + k, t, amp: 1.5, taper: 0.5 }));
                lg.push(inkPath(pts, { w: w0 * 0.38, seed: sd + 310 + k, t, amp: 1.2, taper: 0.5 }));
              });
              M.lavaR.setAttribute('d', J(lr)); M.lavaG.setAttribute('d', J(lg));
            }
            // burning crown on the summit
            if (burning && mode !== 'shorter') {
              const cw = [], cg = [];
              for (let k = 0; k < 5; k++) { const x = top[0] + (k - 2) * 34, hh = 70 + 30 * Math.sin(t * 6 + k * 1.7);
                cw.push(inkLoop([[x - 26, top[1] + 12], [x + Math.sin(t * 5 + k) * 10, top[1] - hh], [x + 26, top[1] + 12]], { seed: sd + 330 + k, t, amp: 1.5 }));
                cg.push(inkLoop([[x - 12, top[1] + 10], [x + Math.sin(t * 5 + k) * 6, top[1] - hh * 0.55], [x + 12, top[1] + 10]], { seed: sd + 340 + k, t, amp: 1 })); }
              M.crown.setAttribute('d', J(cw)); M.crownG.setAttribute('d', J(cg));
            } else { M.crown.setAttribute('d', ''); M.crownG.setAttribute('d', ''); }

            // ---------------------------------------------------- fire columns / blast root
            const colR = [], colG = [];
            const flame = (x0, y0, w, h, sway, k) => {
              const pts = [], n = 9;
              for (let i = 0; i <= n; i++) { const v = i / n; pts.push([x0 - w / 2 * (1 - v * 0.55) + Math.sin(v * 6 + t * 7 + k) * 10 * v + sway * v * v, y0 - h * v]); }
              pts.push([x0 + sway + Math.sin(t * 9 + k) * 8, y0 - h * 1.06]);
              for (let i = n; i >= 0; i--) { const v = i / n; pts.push([x0 + w / 2 * (1 - v * 0.55) + Math.sin(v * 6 + t * 7 + k + 2) * 10 * v + sway * v * v, y0 - h * v]); }
              return pts;
            };
            if (fireAt != null && lt >= fireAt) {
              const g = spring(lt, fireAt, 1.0), j = joinAt != null ? progIO(lt, joinAt, 0.9) : 0;
              if (j < 0.98) [-1, 0, 1].forEach(o => {
                const x0 = top[0] + o * 70 * (1 - j * 0.6), hgt = (300 + 40 * Math.sin(t * 3 + o)) * g * (1 + 0.3 * j), sway = -o * 150 * j + o * 60 * (1 - j);
                const w = 70 * (1 + j * 0.4);
                colR.push(inkLoop(flame(x0, top[1] + 10, w, hgt, sway, o + 3), { seed: sd + 360 + o, t, amp: 1.5 }));
                colG.push(inkLoop(flame(x0, top[1] + 8, w * 0.45, hgt * 0.7, sway * 0.7, o + 5), { seed: sd + 370 + o, t, amp: 1 }));
              });
              if (j > 0.3) {
                const hh = lerp(360, 700, j) * g + 40 * Math.sin(t * 3);
                colR.push(inkLoop(flame(top[0], top[1] + 12, lerp(80, 230, j), hh, 0, 9), { seed: sd + 380, t, amp: 2 }));
                colG.push(inkLoop(flame(top[0], top[1] + 10, lerp(40, 110, j), hh * 0.68, 0, 11), { seed: sd + 381, t, amp: 1.5 }));
              }
            }
            if (boom != null && lt >= boom) {
              const u = lt - boom, g = spring(lt, boom, 0.7), hh = lerp(80, 520, g);
              colR.push(inkLoop(flame(top[0], top[1] + 14, 230, hh, 0, 1), { seed: sd + 390, t, amp: 2 }));
              colG.push(inkLoop(flame(top[0], top[1] + 12, 110, hh * 0.65, 0, 2), { seed: sd + 391, t, amp: 1.5 }));
              const rr0 = u * 1400;
              C.ringR.setAttribute('d', rr0 > 40 && rr0 < W * 1.2 ? J([inkCircle(top[0], top[1], rr0, sd + 392, t, { w: 7, ry: rr0 * 0.42 }), rr0 > 260 ? inkCircle(top[0], top[1], rr0 - 220, sd + 393, t, { w: 4, ry: (rr0 - 220) * 0.42 }) : '']) : '');
            } else C.ringR.setAttribute('d', '');
            C.colR.setAttribute('d', J(colR)); C.colG.setAttribute('d', J(colG));
            // lava bombs
            const bombOn = (boom != null && lt >= boom) || (fireAt != null && lt >= fireAt) || lavaAt != null;
            if (bombOn) {
              const bg = [], br = [];
              bombs.forEach((b, k) => { const ph = ((t * 0.55 + b.ph) % 1), x = top[0] + b.a * 420 * ph, y = top[1] - 520 * b.v * ph + 900 * ph * ph;
                if (y < BASE) { bg.push(inkDot(x, y, 11, null, sd + 400 + k, t)); br.push(inkPath([[x, y], [x - b.a * 40, y + 50 - ph * 80]], { w: 5, seed: sd + 420 + k, t, amp: 0.6, taper: 0.8 })); } });
              C.bombs.setAttribute('d', J(bg)); C.bombsR.setAttribute('d', J(br));
            }
            // rumble: ash puff + rolling rocks
            if (rumble != null && lt >= rumble) {
              const u = lt - rumble, pf = [], pr = [];
              for (let k = 0; k < 5; k++) { const v = ((u * 0.45 + k / 5) % 1), r = 30 + v * 90 * Math.min(1, u / 1.2);
                const pts = puff(top[0] + v * 70 + Math.sin(k) * 20, top[1] - 30 - v * 260 * Math.min(1, u / 0.8), r, k + 40, t);
                pf.push(inkLoop(pts, { seed: sd + 440 + k, t, amp: 1.2 })); pr.push(inkPath(pts, { w: 4, seed: sd + 450 + k, t, closed: true })); }
              C.puff.setAttribute('d', J(pf)); C.puffR.setAttribute('d', J(pr));
              const rf = [], rk = [];
              rocks.forEach((r, k) => { const v = ((u - r.d) * r.sp); if (v < 0 || v > 0.92) return; const uu = r.side * (0.08 + v),
                x = CX + uu * HW + mshake, y = prof(uu, false) - r.s * 0.8 + Math.abs(Math.sin(v * 30)) * -14;
                const pts = inkEllipsePts(x, y, r.s, r.s * 0.8, sd + 460 + k, 7, v * 12 * r.side);
                rf.push(inkLoop(pts, { seed: sd + 470 + k, t, amp: 0.6 })); rk.push(inkPath(pts, { w: 4, seed: sd + 480 + k, t, closed: true, amp: 0.6 })); });
              C.rocks.setAttribute('d', J(rf)); C.rocksR.setAttribute('d', J(rk));
            }
            // shorter: flying chunks of the old top + red dashed ghost + bracket
            if (mode === 'shorter') {
              const capPts = Array.from({ length: 41 }, (_, i) => { const u = -UC + 2 * UC * i / 40; return [CX + u * HW, prof(u, false)]; });
              const slices = [[-UC, -UC / 3], [-UC / 3, UC / 3], [UC / 3, UC]];
              const capF = [], capR = [];
              slices.forEach(([a, b], k) => {
                const top2 = US.filter(u => u >= a - 1e-6 && u <= b + 1e-6).map(u => [CX + u * HW, prof(u, false)]);
                const bot = [[CX + b * HW, BASE - maxH], [CX + a * HW, BASE - maxH]];
                let poly = top2.concat(bot);
                if (cutDone) { const u = lt - cutAt, c = [CX + (a + b) / 2 * HW, BASE - maxH - 40];
                  const dx = (k - 1) * 520 * u, dy = -(1100 + k * 200) * u + 300 * u * u, ang = (k - 1 || 0.4) * u * 2.2;
                  poly = poly.map(p => { const q = rot(p, c, ang); return [q[0] + dx, q[1] + dy]; });
                  if (u > 1.6) return; }
                capF.push(inkLoop(poly, { seed: sd + 500 + k, t, amp: 1.2, smooth: false })); capR.push(inkPath(poly, { w: 6, seed: sd + 510 + k, t, closed: true, smooth: false }));
              });
              C.capF.setAttribute('d', J(capF)); C.capR.setAttribute('d', J(capR));
              if (cutDone) {
                const gp = prog(lt, cutAt + 0.5, 0.8), dashes = [];
                for (let i = 0; i < capPts.length - 1; i += 2) { if (i / capPts.length > gp) break; dashes.push(inkPath([capPts[i], capPts[i + 1]], { w: 6, seed: sd + 520 + i, t, amp: 0.8 })); }
                C.ghost.setAttribute('d', J(dashes));
                if (P.bracket !== false) {
                  const bp = prog(lt, cutAt + 0.9, 0.6), bx = CX + UC * HW + 150, y0 = BASE - HH, y1 = BASE - maxH;
                  const yb = lerp(y1, y0, bp);
                  C.brk.setAttribute('d', bp > 0.01 ? J([inkPath([[bx, y1], [bx, yb]], { w: 7, seed: sd + 540, t }), inkPath([[bx - 30, y1], [bx + 30, y1]], { w: 7, seed: sd + 541, t }),
                    bp > 0.95 ? inkPath([[bx - 30, y0], [bx + 30, y0]], { w: 7, seed: sd + 542, t }) : '', inkPath([[bx - 22, yb + 30], [bx, yb], [bx + 22, yb + 30]], { w: 7, seed: sd + 543, t, smooth: false })]) : '');
                }
              }
            }

            // ---------------------------------------------------- foreground ground (left of the sea in flow mode)
            const gx1 = W + 40;
            const gpts = []; for (let x = -40; x <= gx1; x += 60) gpts.push([x, BASE + 4 + Math.sin(x * 0.01) * 6]);
            G.f.setAttribute('d', inkLoop(gpts.concat([[gx1, H + 20], [-40, H + 20]]), { seed: sd + 600, t, amp: 0.8, smooth: false }));
            G.r.setAttribute('d', inkPath(gpts, { w: 6, seed: sd + 601, t, amp: 1.2 }));
            const ticks = []; for (let k = 0; k < 22; k++) { const x = (k + 0.5) / 22 * gx1, y = BASE + 40 + (k % 4) * 34; if (y < H * 0.84) ticks.push(inkPath([[x, y], [x + 10, y - 22], [x + 18, y]], { w: 3.5, seed: sd + 610 + k, t, amp: 0.8 })); }
            G.tick.setAttribute('d', J(ticks));

            // ---------------------------------------------------- village: huts, palms, palace
            const va = atOr(cues, P.village || 'village', 0);
            const sweptAt = isFlow ? atOr(cues, 'swept', null) : null;
            const f = flowAt == null ? 0 : sweptAt != null && sweptAt > flowAt + 0.5   // flow front 0..1 along the right slope
              ? (lt < sweptAt ? 0.7 * progIO(lt, flowAt, sweptAt - flowAt) : 0.7 + 0.3 * prog(lt, sweptAt, 1.6)) : progIO(lt, flowAt, flowDur);
            const hf = [], hro = [], hr = [];
            huts.forEach((h, k) => {
              const at = h.at != null ? atOr(cues, h.at, 0) : va + k * 0.18, p = spring(lt, at, 0.5); if (p < 0.01) return;
              let x = h.x * W, y = isFlow ? prof((x - CX) / HW, false) + 6 : BASE + 6, ang = 0, s = h.s * Math.max(0.01, p);
              if (isFlow) { const uh = (x - CX) / HW; if (f > uh) { const d = (f - uh) / Math.max(0.05, 1.05 - uh), u2 = uh + d * (1.1 - uh);
                x = CX + u2 * HW; y = (u2 < 1 ? prof(u2, false) : BASE) + 6 + Math.max(0, u2 - 0.95) * 900; ang = d * 1.4; } }
              const hp = hutPts(0, 0, s), tf = q => { const r2 = rot(q, [0, -20 * s], ang); return [x + r2[0], y + r2[1]]; };
              if (isFlow && y > BASE + 90) return;
              hf.push(inkLoop(hp.body.map(tf), { seed: sd + 700 + k, t, amp: 0.8, smooth: false }));
              hro.push(inkLoop(hp.roof.map(tf), { seed: sd + 710 + k, t, amp: 0.8, smooth: false }));
              hr.push(inkPath(hp.body.map(tf), { w: 4.5, seed: sd + 720 + k, t, closed: true, smooth: false, amp: 0.8 }),
                inkPath(hp.roof.map(tf), { w: 5, seed: sd + 730 + k, t, closed: true, smooth: false, amp: 0.8 }),
                inkPath(hp.door.map(tf), { w: 3.5, seed: sd + 740 + k, t, smooth: false, amp: 0.6 }),
                ...hp.stilts.map((st, i) => inkPath(st.map(tf), { w: 4.5, seed: sd + 750 + k * 3 + i, t, amp: 0.6 })));
            });
            let flagD = '';
            if (palace) {
              const pa = atOr(cues, palace.at, va + 0.4), p = spring(lt, pa, 0.6);
              if (p > 0.01) {
                const x = palace.x * W, y = BASE + 6, s = p * (palace.s ?? 1.2);
                const body = [[x - 90 * s, y - 120 * s], [x + 90 * s, y - 120 * s], [x + 90 * s, y], [x - 90 * s, y]];
                const r1 = [[x - 130 * s, y - 116 * s], [x, y - 176 * s], [x + 130 * s, y - 116 * s]], r2 = [[x - 80 * s, y - 170 * s], [x, y - 226 * s], [x + 80 * s, y - 170 * s]];
                const pole = [[x, y - 220 * s], [x, y - 330 * s]], wv = Math.sin(t * 4);
                const flag = [[x, y - 330 * s], [x + 50 * s, y - (322 + wv * 8) * s], [x + 96 * s, y - (330 + wv * 4) * s], [x + 96 * s, y - (286 + wv * 4) * s], [x + 50 * s, y - (280 + wv * 8) * s], [x, y - 288 * s]];
                hf.push(inkLoop(body, { seed: sd + 790, t, amp: 0.8, smooth: false }));
                hro.push(inkLoop(r1, { seed: sd + 791, t, amp: 0.8, smooth: false }), inkLoop(r2, { seed: sd + 792, t, amp: 0.8, smooth: false }));
                hr.push(inkPath(body, { w: 5, seed: sd + 793, t, closed: true, smooth: false }), inkPath(r1, { w: 5, seed: sd + 794, t, closed: true, smooth: false }),
                  inkPath(r2, { w: 5, seed: sd + 795, t, closed: true, smooth: false }), inkPath(pole, { w: 5, seed: sd + 796, t }),
                  inkPath([[x - 22 * s, y], [x - 22 * s, y - 60 * s], [x + 22 * s, y - 60 * s], [x + 22 * s, y]], { w: 4, seed: sd + 797, t, smooth: false }),
                  inkPath(flag, { w: 4, seed: sd + 798, t, closed: true }));
                flagD = inkLoop(flag, { seed: sd + 799, t, amp: 0.8 });
              }
            }
            V.hutF.setAttribute('d', J(hf)); V.roof.setAttribute('d', J(hro)); V.hutR.setAttribute('d', J(hr)); V.flag.setAttribute('d', flagD);
            const pm = [], fr = [], frr = [];
            palms.forEach((pl, k) => {
              const x = pl.x * W, y = isFlow ? prof((x - CX) / HW, false) + 6 : BASE + 8, h = 250 * (pl.h ?? 1), sw = Math.sin(t * 1.1 + k) * 10;
              if (isFlow && f > (x - CX) / HW) return;
              const tp = [x + 30 + sw, y - h];
              pm.push(inkPath([[x, y], [x + 18, y - h * 0.5], tp], { w: 10, seed: sd + 800 + k, t, amp: 1, taper: 0.1 }));
              for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55 + Math.sin(t * 1.4 + i + k) * 0.06, L1 = 120;
                const e = [tp[0] + Math.cos(a) * L1 * 1.2, tp[1] + Math.sin(a) * L1 * 0.5 + 60], m = [tp[0] + Math.cos(a) * L1 * 0.6, tp[1] + Math.sin(a) * L1 * 0.6 - 10];
                const n1 = [m[0] + 12, m[1] + 14];
                fr.push(inkLoop([tp, m, e, n1], { seed: sd + 810 + k * 6 + i, t, amp: 0.8 })); frr.push(inkPath([tp, m, e], { w: 4, seed: sd + 850 + k * 6 + i, t, amp: 0.8 })); }
            });
            V.palm.setAttribute('d', J(pm)); V.frond.setAttribute('d', J(fr)); V.frondR.setAttribute('d', J(frr));

            // ---------------------------------------------------- sea (flow mode)
            if (isFlow) {
              const sy = BASE - 0.015 * H, top3 = [];
              for (let x = seaX; x <= W + 60; x += 40) top3.push([x, sy + Math.sin(x * 0.012 + t * 1.6) * 7]);
              const seaP = top3.concat([[W + 60, H + 20], [seaX - 260, H + 20], [seaX - 120, BASE + 120]]);
              S.f.setAttribute('d', inkLoop(seaP, { seed: sd + 900, t, amp: 0.8 }));
              S.tint.setAttribute('d', inkLoop(seaP, { seed: sd + 900, t, amp: 0.8 }));
              S.r.setAttribute('d', inkPath([[seaX - 260, H + 20], [seaX - 120, BASE + 120]].concat(top3), { w: 5, seed: sd + 901, t, amp: 1.2 }));
              const hs = []; for (let k = 0; k < 10; k++) { const yy = sy + 40 + (k % 5) * 50, xx = seaX + ((k * 137 + t * 22) % (W - seaX)), l = 60;
                if (yy < H * 0.84) hs.push(inkPath([[xx, yy], [xx + l / 2, yy - 6], [xx + l, yy]], { w: 3.5, seed: sd + 910 + k, t, amp: 0.8 })); }
              S.h.setAttribute('d', J(hs));
              // splash + steam where the flow meets the sea
              if (f > 0.8) { const u = (f - 0.8) / 0.2, sx = seaX + 140, sp = [], spr = [];
                for (let k = 0; k < 8; k++) { const rise = ((t * 0.35 + k / 8) % 1); const pts = puff(sx - 100 + (k % 4) * 110 + rise * 40, sy - 30 - rise * 260 * u - (k % 2) * 40, (40 + 70 * u) * (0.6 + 0.6 * rise), k + 60, t);
                  sp.push(inkLoop(pts, { seed: sd + 920 + k, t, amp: 1 })); spr.push(inkPath(pts, { w: 4, seed: sd + 930 + k, t, closed: true })); }
                S.splash.setAttribute('d', J(sp)); S.splashR.setAttribute('d', J(spr)); }
              // the avalanche: billows along the right slope (and a smaller one on the left)
              if (f > 0.001) {
                const bf = [], br = [], bgl = [], bb = [], bbr = [];
                const nb = 26;
                for (let k = 0; k <= 14; k++) { const v = k / 14 * f, u = 0.02 + v * 0.98, x = CX + u * HW + 30, y = Math.min(BASE, prof(u, false));
                  const r = (50 + 60 * v) * (1 + 0.12 * Math.sin(t * 2.2 + k)), pts = puff(x, y - r * 0.9 - 30 * Math.sin(t * 1.5 + k), r, k + 30, t);
                  bb.push(inkLoop(pts, { seed: sd + 1200 + k, t, amp: 1.2 })); bbr.push(inkPath(pts, { w: 4, seed: sd + 1220 + k, t, closed: true })); }
                F.b.setAttribute('d', J(bb)); F.bR.setAttribute('d', J(bbr));
                for (let k = 0; k <= nb; k++) { const v = k / nb * f, u = 0.02 + v * 0.98, x = CX + u * HW, y = Math.min(BASE, prof(u, false));
                  const front = Math.pow(1 - (f - v) / Math.max(0.05, f), 3); const r = (30 + 40 * v + 50 * front) * (1 + 0.12 * Math.sin(t * 3 + k * 1.3));
                  const pts = puff(x, y - r * 0.4, r, k + 70, t);
                  bf.push(inkLoop(pts, { seed: sd + 940 + k, t, amp: 1.5 })); if (k % 3 === 0 || k === nb) br.push(inkPath(pts, { w: 5, seed: sd + 960 + k, t, closed: true }));
                  if (k % 3 === 1) bgl.push(inkDot(x - r * 0.3, y - r * 0.2, r * 0.22, r * 0.12, sd + 980 + k, t)); }
                const fl = Math.min(f * 1.2, 0.7);
                for (let k = 0; k <= 8; k++) { const v = k / 8 * fl, u = -(0.03 + v), x = CX + u * HW, y = prof(u, false), r = 26 + 32 * v;
                  const pts = puff(x, y - r * 0.5, r, k + 90, t); bf.push(inkLoop(pts, { seed: sd + 990 + k, t, amp: 1.2 })); if (k % 2) br.push(inkPath(pts, { w: 4, seed: sd + 1000 + k, t, closed: true })); }
                F.f.setAttribute('d', J(bf)); F.r.setAttribute('d', J(br)); F.glow.setAttribute('d', J(bgl));
              }
            }

            cs.update(lt, t, cues);
            // speech bubble
            if (B) {
              const ba = atOr(cues, P.bubble.at, dur * 0.4), p = spring(lt, ba, 0.5);
              if (p < 0.01) bubG.style.display = 'none';
              else {
                bubG.style.display = '';
                const bx = (P.bubble.x ?? 0.3) * W, by = (P.bubble.y ?? 0.3) * H, bw = P.bubble.w ?? 520, bh = (P.bubble.size || 64) * 1.9;
                const tl2 = P.bubble.tail ? [P.bubble.tail[0] * W - bx, P.bubble.tail[1] * H - by] : [-bw * 0.2, bh];
                const box = rr(-bw / 2, -bh / 2, bw, bh, 34), tail = [[-40, bh / 2 - 4], tl2, [20, bh / 2 - 4]];
                bubG.setAttribute('transform', `translate(${ff(bx)} ${ff(by)}) scale(${(p * (1 + 0.08 * punch(lt, ba, 0.6))).toFixed(3)}) rotate(-2)`);
                B.f.setAttribute('d', J([inkLoop(box, { seed: sd + 1100, t, amp: 1 }), inkLoop(tail, { seed: sd + 1101, t, amp: 1, smooth: false })]));
                B.r.setAttribute('d', J([inkPath(box, { w: 6, seed: sd + 1102, t, closed: true }), inkPath(tail, { w: 6, seed: sd + 1103, t, smooth: false })]));
              }
            }
            lb.update(lt, t, cues);
          },
        };
      },
    };
  }

  SH.tbA_peak = { kind: '2d', build: ctx => build('quiet').build(ctx) };
  SH.tbA_erupt = { kind: '2d', build: ctx => build('columns').build(ctx) };
  SH.tbA_flow = { kind: '2d', build: ctx => build('flow').build(ctx) };
})();
