// sm_otag: the sultan's imperial tent (otağ) in an army camp, parchment ink style (brand/kit/BRAND.md §3, §5; every
// line boils at 8 Hz via _ink.js; pure function of (seed, lt), no Math.random). Written for 04-sehzade-mustafa
// (Ereğli camp, 6 October 1553), parametric: any "someone walks into a tent" moment.
// Far hills with small camp tents and waving pennants, a low sun, grass ticks; the big otağ in the middle (striped
// wall, scalloped valance, curved roof, gold finial with a pennant, an arched doorway with two flaps that can close),
// two tuğ standards flanking the door. A prince (KASIF rig, hatless, turban, beard) can walk in from the left, lay his
// sword (and bow) on the ground by the door, step into the dark doorway and vanish; the flaps close behind him.
// Optional: the tent shudders (struggle inside, shown only by the cloth), the roof pennant lowers to half-mast,
// a carpet with a white cloth is laid before the door (a covered body, never shown), a front row of janissaries
// (white börk caps) who bow their heads (mourn) or raise fists and spears (anger), labels, extra cast, Kaşif.
// P: {x: 0.56 (tent centre, 0..1 W), ground: 0.84 (0..1 H), size: 1.3 (tent scale), time: "dawn"|"day"|"dusk",
//     prince: {x: 0.12, accessory: "turban", beard: "black", scale: 0.45 (x tent size), walk_at: 0.1, drop: cue (weapons go down;
//              he arrives before the door on it), enter: cue (walks into the door, then fades), pose: "idle",
//              emotion, face: 1, bow: true (also carries a bow)} | false,
//     weapons: {at: cue|sec, scale: 1, lean: false} (weapons already by the door from that moment; scale enlarges sword
//              and bow; lean puts the bow upright against the right door post) | false,
//     close: cue (flaps close; negative = closed from the start; a dark seam + shadow then mark the closed door),
//     shudder: {at: cue, dur: 1.8}, muted: true (ink-soft stripes, paper-dark valance: a sombre tent),
//     flag: {lower: cue, droop: cue} (pennant slides down / goes limp and hangs), carpet: {at: cue, w: 440},
//     crowd: {n: 9, x0: 0.04, x1: 0.62, y: 0.98 (feet, 0..1 H), scale: 1, at: cue|sec (rises in), mourn: cue,
//             anger: cue} | false,
//     camp: 7 (small far tents), labels: [...MCB labels], cast: [...MCB cast],
//     kasif: {x: 0.86, y: 0.95, scale: 0.8, pose: "look", face: -1, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.06, focus: [x, y]}, shake: cue, cover_hide: true (thumbnail hides the shot's own Kaşif)}
//     tugs: false (no flanking standards), sun: false,
//     frame: {zoom: 1.6, at: [x, y] (stage 0..1), to: [sx, sy] (screen 0..1)} (fixed close-up framing; Kaşif and the crowd stay unscaled)
// cues: hit (punch), plus whatever names prince / close / shudder / flag / carpet / crowd / labels / seq use.
// Needs mcB__lib.js (MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rot = (p, o, a) => { const c = Math.cos(a), s = Math.sin(a), dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * c - dy * s, o[1] + dx * s + dy * c]; };

  SH.sm_otag = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 911, portrait = H > W;
      const root = el(svg, 'g'), frameG = el(root, 'g'), cam = el(frameG, 'g');
      if (P.frame) {   // fixed framing (close-ups): stage point `at` (0..1) lands on screen point `to`, scaled by zoom
        const z = P.frame.zoom || 1.5, [ax, ay] = P.frame.at || [0.5, 0.75], [sx, sy] = P.frame.to || [0.5, 0.6];
        frameG.setAttribute('transform', `translate(${(sx * W - z * ax * W).toFixed(1)} ${(sy * H - z * ay * H).toFixed(1)}) scale(${z})`);
      }
      const S = (P.size ?? 1.3) * (portrait ? 0.8 : 1);
      const tx = (P.x ?? (portrait ? 0.5 : 0.56)) * W, gy = (P.ground ?? (portrait ? 0.62 : 0.84)) * H;
      const hz = gy - 300 * S;                       // far horizon
      const tw = 660 * S, wh = 270 * S, rh = 230 * S, dw = 150 * S, dh = 210 * S;
      const time = P.time || 'day';

      // layers back to front
      const sunF = inkEl(cam, INK.paperLight), sunR = inkEl(cam, INK.gold), rays = inkEl(cam, INK.gold);
      const hillF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), hillR = inkEl(cam, INK.inkSoft);
      const campF = inkEl(cam, INK.paperLight), campR = inkEl(cam, INK.inkSoft), campFlag = inkEl(cam, INK.red);
      const groundR = inkEl(cam), grass = inkEl(cam, INK.inkSoft);
      const tent = el(cam, 'g');
      const roofF = inkEl(tent, INK.paperLight), wallF = inkEl(tent, INK.paperLight);
      const stripes = inkEl(tent, P.muted ? INK.inkSoft : INK.red), bandF = inkEl(tent, P.muted ? INK.inkSoft : INK.blue), valF = inkEl(tent, P.muted ? INK.paperDark : INK.red);
      const doorF = inkEl(tent, INK.ink, { 'fill-opacity': 0.88 });
      const outline = inkEl(tent);
      const princeG = el(cam, 'g');
      const flapF = inkEl(tent, INK.paperLight), flapS = inkEl(tent, P.muted ? INK.inkSoft : INK.red), flapR = inkEl(tent);
      const finial = inkEl(tent), ballF = inkEl(tent, INK.gold), ballR = inkEl(tent), penF = inkEl(tent, INK.red), penR = inkEl(tent);
      // re-order: the prince must be drawn in front of the door but behind the flaps
      tent.appendChild(flapF); tent.appendChild(flapS); tent.appendChild(flapR);
      const shade = inkEl(tent, INK.ink, { 'fill-opacity': 0.5 });
      cam.appendChild(princeG); cam.appendChild(tent); tent.insertBefore(princeG, flapF);
      const tugs = [-1, 1].map(() => ({ pole: inkEl(cam), strands: inkEl(cam), ballF: inkEl(cam, INK.gold), ball: inkEl(cam) }));
      const carpetF = inkEl(cam, INK.red), carpetB = inkEl(cam, INK.gold), carpetR = inkEl(cam);
      const clothF = inkEl(cam, INK.paperLight), clothR = inkEl(cam);
      const weap = { bladeF: inkEl(cam, INK.paperLight), blade: inkEl(cam), grip: inkEl(cam), guard: inkEl(cam, INK.gold), bow: inkEl(cam) };
      const castG = el(cam, 'g'), labG = el(cam, 'g');
      const crowdG = el(root, 'g');

      const PR = P.prince ? Object.assign({ x: 0.12, accessory: 'turban', beard: 'black', scale: 0.45, walk_at: 0.1, face: 1 }, P.prince) : null;
      const prig = PR ? KASIF.create(princeG, { scale: PR.scale * S, hat: false, accessory: PR.accessory, beard: PR.beard, seed: sd + 3 }) : null;
      const cast = MCB.cast(castG, P.cast, W, H, sd + 50), labels = MCB.labels(labG, P.labels, W, H, sd + 70);
      const K = P.kasif === false ? null : Object.assign({ x: 0.86, y: 0.95, scale: 0.8, pose: 'look', face: -1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      // crowd: janissary pictograms (bigger, in front, bottom of the frame)
      const CR = P.crowd ? Object.assign({ n: 9, x0: 0.04, x1: 0.62, y: 0.98, scale: 1 }, P.crowd) : null;
      const crowd = CR ? Array.from({ length: CR.n }, (_, i) => ({
        i, x: lerp(CR.x0, CR.x1, CR.n > 1 ? i / (CR.n - 1) : 0.5) * W + ((i * 37) % 23 - 11),
        y: CR.y * H + (i % 2 ? 26 : 0), body: inkEl(crowdG), headF: inkEl(crowdG, INK.paperLight), head: inkEl(crowdG),
        capF: inkEl(crowdG, INK.paperLight), cap: inkEl(crowdG), spear: inkEl(crowdG), tip: inkEl(crowdG, INK.inkSoft),
      })) : null;

      const grassPts = (() => { const r = rng(sd + 17), out = []; for (let k = 0; k < 34; k++) out.push([r() * W, gy + 8 + r() * (H - gy) * 0.8, r()]); return out; })();
      const campPts = (() => {
        const r = rng(sd + 23), out = [], n = P.camp ?? 7;
        for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; out.push([u * W + (r() - 0.5) * 80, 40 + r() * 30]); }
        return out;
      })();
      const kasifSegs = cues => {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        return segs.sort((a, b) => a.at - b.at);
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const isCover = document.documentElement.classList.contains('cover');
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const shA = atOr(cues, P.shake, null), shake = shA != null && lt >= shA ? Math.exp(-(lt - shA) * 2.2) : 0;
          MCB.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.06, focus: [tx / W, (gy - wh) / H] }, P.cam || {}), hit, shake);

          // sun + far hills + camp
          const sx = W * (time === 'dawn' ? 0.16 : time === 'dusk' ? 0.84 : 0.26), sy = time === 'day' ? H * 0.16 : hz - 40 * S, sr = 64 * S;
          if (P.sun !== false) {
            sunF.setAttribute('d', inkCircle(sx, sy, sr, sd + 1, t, { fill: true }));
            sunR.setAttribute('d', inkCircle(sx, sy, sr, sd + 2, t, { w: 5 }));
          }
          let rd = '';
          for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + t * 0.15; rd += inkPath([[sx + Math.cos(a) * (sr + 16), sy + Math.sin(a) * (sr + 16)], [sx + Math.cos(a) * (sr + 44), sy + Math.sin(a) * (sr + 44)]], { w: 4, seed: sd + 200 + k, t }) + ' '; }
          rays.setAttribute('d', P.sun === false ? '' : rd);
          const hp = []; for (let k = 0; k <= 24; k++) { const u = k / 24; hp.push([u * W * 1.1 - W * 0.05, hz - 30 * S - Math.sin(u * 7.1 + 1) * 34 * S - Math.sin(u * 2.3) * 40 * S]); }
          hillF.setAttribute('d', inkLoop(hp.concat([[W * 1.05, hz + 30], [-W * 0.05, hz + 30]]), { seed: sd + 3, t, amp: 1 }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 4, t }));
          let cf = '', cr = '', cfl = '';
          campPts.forEach(([x, h], k) => {
            if (Math.abs(x - tx) < tw * 0.55) return;
            const b = hz + 18, s = h * S, tri = [[x - s * 0.9, b], [x, b - s], [x + s * 0.9, b]];
            cf += inkLoop(tri, { seed: sd + 300 + k, t, amp: 0.8, smooth: false }) + ' ';
            cr += inkPath(tri, { w: 3.5, seed: sd + 320 + k, t, closed: true, smooth: false }) + ' ' + inkPath([[x, b - s], [x, b - s - 26 * S]], { w: 3, seed: sd + 340 + k, t });
            const wv = Math.sin(t * 3 + k) * 5 * S;
            cfl += inkLoop([[x, b - s - 26 * S], [x + 24 * S, b - s - 20 * S + wv], [x, b - s - 14 * S]], { seed: sd + 360 + k, t, amp: 0.6, smooth: false }) + ' ';
          });
          campF.setAttribute('d', cf); campR.setAttribute('d', cr); campFlag.setAttribute('d', cfl);
          groundR.setAttribute('d', inkPath([[-40, gy + 4], [W * 0.5, gy - 2], [W + 40, gy + 4]], { w: 5, seed: sd + 5, t }));
          let gd = '';
          grassPts.forEach(([x, y, r], k) => {
            if (Math.abs(x - tx) < tw * 0.5 && y < gy + 40) return;
            const lean = Math.sin(t * 1.6 + k) * 5;
            gd += inkPath([[x, y], [x + lean + 4, y - 18 - r * 14]], { w: 3, seed: sd + 400 + k, t }) + ' ' + inkPath([[x + 8, y], [x + 12 + lean, y - 12 - r * 10]], { w: 3, seed: sd + 450 + k, t }) + ' ';
          });
          grass.setAttribute('d', gd);

          // tent (with optional shudder)
          const shu = P.shudder ? atOr(cues, P.shudder.at, null) : null, sdur = (P.shudder && P.shudder.dur) || 1.8;
          const sk = shu != null && lt >= shu && lt < shu + sdur ? Math.sin((lt - shu) * 34) * (1 - (lt - shu) / sdur) : 0;
          tent.setAttribute('transform', `translate(${f1(sk * 7)} 0) skewX(${f1(sk * 0.8)})`);
          const L = tx - tw / 2, R = tx + tw / 2, top = gy - wh, ex = 34 * S;
          const breathe = Math.sin(t * 1.2) * 3 * S;
          const peak = [tx, top - rh + breathe];
          const roof = [[L - ex, top + 6], [L + tw * 0.12, top - rh * 0.42], [tx - tw * 0.16, top - rh * 0.86], peak, [tx + tw * 0.16, top - rh * 0.86], [R - tw * 0.12, top - rh * 0.42], [R + ex, top + 6]];
          roofF.setAttribute('d', inkLoop(roof, { seed: sd + 6, t, amp: 1 }));
          const wall = [[L, top], [R, top], [R, gy], [L, gy]];
          wallF.setAttribute('d', inkLoop(wall, { seed: sd + 7, t, amp: 0.8, smooth: false }));
          let st = '';
          for (let x = L + 40 * S, k = 0; x < R - 20 * S; x += 58 * S, k++) {
            if (Math.abs(x - tx) < dw * 0.62) continue;
            st += inkPath([[x, top + 40 * S], [x + 2, gy - 6]], { w: 7 * S, seed: sd + 500 + k, t }) + ' ';
          }
          // roof seams
          for (let k = -2; k <= 2; k++) st += inkPath([[tx + k * tw * 0.2, top + 2], [tx + k * tw * 0.07, top - rh * 0.55], [tx + k * 4, top - rh * 0.94]], { w: 4, seed: sd + 540 + k, t, amp: 1.2 }) + ' ';
          stripes.setAttribute('d', st);
          bandF.setAttribute('d', inkLoop([[L, top + 2], [R, top + 2], [R, top + 26 * S], [L, top + 26 * S]], { seed: sd + 8, t, amp: 0.8, smooth: false }));
          let vd = '';
          const nv = 11;
          for (let k = 0; k < nv; k++) {
            const x0 = L - ex + (tw + ex * 2) * k / nv, x1 = L - ex + (tw + ex * 2) * (k + 1) / nv, xm = (x0 + x1) / 2;
            const sw = Math.sin(t * 2 + k) * 2 * S;
            vd += inkLoop([[x0, top + 4], [x1, top + 4], [xm + sw, top + 44 * S]], { seed: sd + 600 + k, t, amp: 0.8 }) + ' ';
          }
          valF.setAttribute('d', vd);
          // doorway: arch
          const dp = []; const dl = tx - dw / 2, dr = tx + dw / 2, dtop = gy - dh;
          dp.push([dl, gy]);
          for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; dp.push([tx + Math.cos(a) * dw / 2, dtop + dw / 2 + Math.sin(a) * dw / 2]); }
          dp.push([dr, gy]);
          doorF.setAttribute('d', inkLoop(dp, { seed: sd + 9, t, amp: 0.8 }));
          outline.setAttribute('d', inkPath(roof, { w: 7, seed: sd + 10, t }) + ' ' + inkPath(wall, { w: 6, seed: sd + 11, t, closed: true, smooth: false }) + ' ' + inkPath(dp, { w: 6, seed: sd + 12, t }));
          // flaps: c = 0 open (tied back), 1 closed
          const ca = atOr(cues, P.close, null);
          const c = ca == null ? 0 : ca < 0 ? 1 : progIO(lt, ca, 0.7);
          const flut = sk * 10 + Math.sin(t * 2.4) * 2;
          const flap = side => {
            // follows the arch from the door post up towards the apex, then down its free edge to the tie point
            const fw = dw / 2 + 8 * S, ox = side < 0 ? tx - fw : tx + fw, reach = 0.3 + 0.7 * c, pts = [[ox, gy]];
            for (let k = 0; k <= 6; k++) {
              const a = side < 0 ? Math.PI + (k / 6) * (Math.PI / 2) * reach : 2 * Math.PI - (k / 6) * (Math.PI / 2) * reach;
              pts.push([tx + Math.cos(a) * fw, dtop + dw / 2 + Math.sin(a) * fw]);
            }
            const tie = [lerp(ox - side * dw * 0.14, tx - side * 3, c) + flut * (1 - c * 0.5), lerp(gy - dh * 0.42, gy, c)];
            pts.push(tie);
            return pts;
          };
          const fl = flap(-1), fr = flap(1);
          flapF.setAttribute('d', inkLoop(fl, { seed: sd + 13, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(fr, { seed: sd + 14, t, amp: 0.8, smooth: false }));
          flapS.setAttribute('d', inkPath([fl[3], fl[fl.length - 1]], { w: (P.muted ? 3 : 6) * S, seed: sd + 15, t }) + ' ' + inkPath([fr[3], fr[fr.length - 1]], { w: (P.muted ? 3 : 6) * S, seed: sd + 16, t }));
          flapR.setAttribute('d', inkPath(fl, { w: 5, seed: sd + 17, t, closed: true, smooth: false }) + ' ' + inkPath(fr, { w: 5, seed: sd + 18, t, closed: true, smooth: false }));
          shade.setAttribute('d', c > 0.5 ? inkLoop(inkEllipsePts(tx, gy + 2, dw * 0.62, 11 * S, sd + 24, 12), { seed: sd + 25, t, amp: 0.6 }) + ' ' +
            inkPath([[tx, dtop + 4], [tx, gy]], { w: 13 * S, seed: sd + 26, t }) : '');
          // finial + pennant (optionally lowered, or drooping limp: flag.droop)
          const fTop = [peak[0], peak[1] - 110 * S];
          finial.setAttribute('d', inkPath([peak, fTop], { w: 6, seed: sd + 19, t }));
          ballF.setAttribute('d', inkCircle(peak[0], peak[1] - 18 * S, 16 * S, sd + 20, t, { fill: true }));
          ballR.setAttribute('d', inkCircle(peak[0], peak[1] - 18 * S, 16 * S, sd + 21, t, { w: 4 }));
          const la = P.flag ? atOr(cues, P.flag.lower, null) : null, low = la != null ? progIO(lt, la, 1.6) : 0;
          const py0 = lerp(fTop[1] + 4, fTop[1] + 70 * S, low), wave = Math.sin(t * 3.2) * 9 * S * (1 - 0.6 * low);
          const da = P.flag ? atOr(cues, P.flag.droop, null) : null, dro = da != null ? progIO(lt, da, 1.6) : 0, wv = wave * (1 - 0.85 * dro);
          const pen = [[fTop[0], py0], [fTop[0] + 70 * S, py0 + 12 * S + wv], [fTop[0] + 120 * S, py0 + 20 * S + wv * 1.4], [fTop[0] + 66 * S, py0 + 28 * S + wv], [fTop[0], py0 + 36 * S]]
            .map(q => rot(q, [fTop[0], py0 + 4 * S], dro * 1.25));
          penF.setAttribute('d', inkLoop(pen, { seed: sd + 22, t, amp: 0.8 }));
          penR.setAttribute('d', inkPath(pen, { w: 4, seed: sd + 23, t, closed: true }));
          // tuğs flanking the door
          if (P.tugs !== false) [-1, 1].forEach((side, i) => {
            const T = tugs[i], px = tx + side * (tw / 2 + 80 * S), h = 380 * S, sway = Math.sin(t * 1.3 + i) * 0.03;
            const o = [px, gy], R2 = q => rot(q, o, sway), tp = R2([px, gy - h]);
            T.pole.setAttribute('d', inkPath([o, R2([px, gy - h * 0.5]), tp], { w: 8, seed: sd + 30 + i, t }));
            T.ballF.setAttribute('d', inkCircle(tp[0], tp[1] - 16, 15 * S, sd + 32 + i, t, { fill: true }));
            T.ball.setAttribute('d', inkCircle(tp[0], tp[1] - 16, 15 * S, sd + 34 + i, t, { w: 4 }));
            let sd2 = '';
            for (let s = 0; s < 6; s++) {
              const r0 = R2([px - 34 * S + s * 14 * S, gy - h * 0.88]), len = (110 + (s % 3) * 20) * S, sw = -sway * 2 + Math.sin(t * 2.2 + s + i) * 0.06, pts = [];
              for (let k = 0; k <= 4; k++) { const u = k / 4; pts.push([r0[0] + Math.sin(sw * u * 3) * len * u * 0.5, r0[1] + len * u]); }
              sd2 += inkPath(pts, { w: 5, seed: sd + 40 + s + i * 9, t, taper: 0.7 }) + ' ';
            }
            T.strands.setAttribute('d', sd2);
          });

          // carpet + white cloth before the door
          if (P.carpet) {
            const a = atOr(cues, P.carpet.at, 0.2), u = lt < a ? 0 : progIO(lt, a, 1.1), cw = (P.carpet.w || 440) * S;
            const cx0 = tx - cw / 2, y0 = gy + 18 * S, y1 = gy + 86 * S, xr = cx0 + cw * u;
            if (u > 0.01) {
              const quad = [[cx0 + 20 * S, y0], [xr + 20 * S, y0], [xr - 20 * S, y1], [cx0 - 20 * S, y1]];
              carpetF.setAttribute('d', inkLoop(quad, { seed: sd + 60, t, amp: 0.8, smooth: false }));
              const inner = [[cx0 + 34 * S, y0 + 10 * S], [xr + 6 * S, y0 + 10 * S], [xr - 30 * S, y1 - 10 * S], [cx0 - 6 * S, y1 - 10 * S]];
              carpetB.setAttribute('d', u > 0.9 ? inkPath(inner, { w: 5, seed: sd + 61, t, closed: true, smooth: false }) : '');
              carpetR.setAttribute('d', inkPath(quad, { w: 5, seed: sd + 62, t, closed: true, smooth: false }));
              const cv = prog(lt, a + 1.0, 0.8);
              if (cv > 0.01) {
                const clx0 = tx - cw * 0.34, clx1 = tx + cw * 0.34, cy = (y0 + y1) / 2, hh = 30 * S * cv, mound = [];
                for (let k = 0; k <= 12; k++) { const v = k / 12; mound.push([lerp(clx0, clx1, v), cy + 8 * S - Math.sin(v * Math.PI) * hh - (v < 0.22 ? 6 * S : 0)]); }
                mound.push([clx1 + 10 * S, cy + 14 * S], [clx0 - 10 * S, cy + 14 * S]);
                clothF.setAttribute('d', inkLoop(mound, { seed: sd + 63, t, amp: 0.8 }));
                clothR.setAttribute('d', inkPath(mound, { w: 5, seed: sd + 64, t, closed: true }) + ' ' +
                  inkPath([[lerp(clx0, clx1, 0.35), cy - hh * 0.7], [lerp(clx0, clx1, 0.42), cy + 8 * S]], { w: 3, seed: sd + 65, t }) + ' ' +
                  inkPath([[lerp(clx0, clx1, 0.62), cy - hh * 0.8], [lerp(clx0, clx1, 0.68), cy + 8 * S]], { w: 3, seed: sd + 66, t }));
              } else { clothF.setAttribute('d', ''); clothR.setAttribute('d', ''); }
            } else { carpetF.setAttribute('d', ''); carpetB.setAttribute('d', ''); carpetR.setAttribute('d', ''); clothF.setAttribute('d', ''); clothR.setAttribute('d', ''); }
          }

          // prince: walk in, lay weapons down, step into the doorway, fade
          let px = null, py = gy, dropP = 0;
          const wd = P.weapons ? atOr(cues, P.weapons.at, 0) : null;
          if (PR) {
            const dropA = atOr(cues, PR.drop, null), entA = atOr(cues, PR.enter, null);
            const stopX = tx - dw * 1.25, x0 = PR.x * W, gait = KASIF.gait ? KASIF.gait('walk') : 120, sc = PR.scale * S;
            const wa = atOr(cues, PR.walk_at, 0.1);
            const arrive1 = dropA != null ? dropA : (entA != null ? entA - 0.9 : null);
            let pose = PR.pose || 'idle', face = faceOf(PR.face, 1), ph = 0, alpha = 1, since = lt, pdir = 10;
            px = x0;
            if (arrive1 != null) {
              const w1 = Math.max(0.6, arrive1 - wa), u = progIO(lt, wa, w1);
              px = lerp(x0, stopX, u);
              if (lt >= wa && lt < arrive1) { pose = 'walk'; ph = Math.abs(stopX - x0) * u / (gait * sc); face = 1; }
              else if (lt >= arrive1) { pose = 'point'; pdir = -38; since = lt - arrive1; face = 1; }
            }
            if (dropA != null) dropP = prog(lt, dropA + 0.15, 0.6);
            if (entA != null && lt >= entA) {
              const u = progIO(lt, entA, 0.9);
              px = lerp(stopX, tx, u); pose = u < 1 ? 'walk' : 'idle'; ph = (stopX - (arrive1 != null ? x0 : stopX)) / (gait * sc) + Math.abs(tx - stopX) * u / (gait * sc);
              alpha = 1 - prog(lt, entA + 0.55, 0.45);
            }
            if (isCover && P.cover_prince === false) alpha = 0;
            prig.update(t, pose, { x: px, y: py, face, ph, since, emotion: PR.emotion || null, dir: pdir, mouth: 0, alpha });
          }
          // weapons (sword + optional bow): on the prince until dropped, then on the ground before the door
          // (weapons.scale enlarges them; weapons.lean: the bow ends up leaning upright against the right door post)
          const showW = PR || wd != null;
          if (showW && (!(wd != null) || lt >= wd || PR)) {
            const WS0 = (P.weapons && P.weapons.scale) || 1, lean = !!(P.weapons && P.weapons.lean);
            let k0 = PR ? dropP : 1; if (!PR && wd != null) k0 = lt >= wd ? 1 : 0;
            const WS = lerp(1, WS0, k0), len = lean ? lerp(170 * S, Math.min(170 * S * WS * 1.2, dh * 0.78), k0) : 170 * S * WS;
            const gx = tx - dw * 0.5 - len * 0.12, gyy = gy - 8 * S * WS;
            let k = PR ? dropP : 1;
            if (!PR && wd != null) k = lt >= wd ? 1 : 0;
            const holdX = px != null ? px + 40 * S : gx, holdY = py - 190 * PR_SC(PR, S);
            // final pose: lying flat before the door, or (lean) tip on the ground against the left door post, hilt up
            const fAng = lean ? 1.2 : 0.03, tipX = tx - dw * 0.5 - 8 * S, tipY = gy - 4 * S;
            const fx0 = lean ? tipX - Math.cos(fAng) * len * 0.7 : gx, fy0 = lean ? tipY - Math.sin(fAng) * len * 0.7 : gyy;
            const cx = lerp(holdX, fx0, k), cy = lerp(holdY, fy0, k), ang = lerp(1.35, fAng, k);
            const a = [cx - Math.cos(ang) * len * 0.3, cy - Math.sin(ang) * len * 0.3], b = [cx + Math.cos(ang) * len * 0.7, cy + Math.sin(ang) * len * 0.7];
            // a recognisable kılıç: pommel + grip (hilt end a), gold crossguard, broad curved paper-light blade with an ink
            // outline narrowing to a point at b
            const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, sq = Math.sqrt(WS);
            const gc = [lerp(a[0], b[0], 0.22), lerp(a[1], b[1], 0.22)], Lb = len * 0.78, bw = 12 * S * sq, curv = 0.09 * Lb;
            const L = [], Rr = [];
            for (let q = 0; q <= 12; q++) {
              const s = q / 12, off = curv * s * s, wdt = (s < 0.86 ? bw * (1 - 0.3 * s) : bw * 0.74 * (1 - (s - 0.86) / 0.14)) / 2;
              const cxp = gc[0] + ux * Lb * s + nx * off, cyp = gc[1] + uy * Lb * s + ny * off;
              L.push([cxp + nx * wdt, cyp + ny * wdt]); Rr.push([cxp - nx * wdt, cyp - ny * wdt]);
            }
            const blade = L.concat(Rr.reverse());
            weap.bladeF.setAttribute('d', inkLoop(blade, { seed: sd + 79, t, amp: 0.6, smooth: false }));
            weap.blade.setAttribute('d', inkPath(blade, { w: 4.5 * sq, seed: sd + 80, t, closed: true, smooth: false, amp: 0.8 }) + ' ' +
              inkPath([[gc[0] + ux * Lb * 0.05, gc[1] + uy * Lb * 0.05], [gc[0] + ux * Lb * 0.7 + nx * curv * 0.45, gc[1] + uy * Lb * 0.7 + ny * curv * 0.45]], { w: 2.5 * sq, seed: sd + 84, t }));
            weap.grip.setAttribute('d', inkPath([a, gc], { w: 11 * sq, seed: sd + 85, t }) + ' ' + inkDot(a[0], a[1], 9 * S * sq, 9 * S * sq, sd + 86, t));
            const gl = 24 * S * WS;
            weap.guard.setAttribute('d', inkPath([[gc[0] + nx * gl, gc[1] + ny * gl], [gc[0] - nx * gl, gc[1] - ny * gl]], { w: 11 * sq, seed: sd + 81, t }));
            if (PR ? PR.bow !== false : true) {
              const bl = lean ? lerp(120 * S, Math.min(120 * S * WS, dh * 0.46), k0) : 120 * S * WS;
              const fx = lean ? tx + dw * 0.5 + 6 * S : gx + 40 * S, fy = lean ? gy - bl * 0.98 : gyy + 22 * S, fa = lean ? 0.14 : Math.PI / 2;
              const bx = lerp(holdX - 70 * S, fx, k), by = lerp(holdY + 20 * S, fy, k), ba = lerp(-0.2, fa, k), arc = [];
              for (let q = 0; q <= 8; q++) { const v = q / 8 - 0.5; arc.push(rot([bx + v * bl * 2, by - Math.cos(v * Math.PI) * 26 * S * WS], [bx, by], ba - Math.PI / 2)); }
              weap.bow.setAttribute('d', inkPath(arc, { w: 5 * Math.sqrt(WS), seed: sd + 82, t }) + ' ' + inkPath([arc[0], arc[8]], { w: 2.5 * Math.sqrt(WS), seed: sd + 83, t }));
            }
            if (PR && px != null && lt >= (atOr(cues, PR.enter, 1e9) + 0.6) && k < 0.5) { ['bladeF', 'blade', 'grip', 'guard', 'bow'].forEach(n => weap[n].setAttribute('d', '')); }
          }

          cast.update(lt, t, cues);
          labels.update(lt, t, cues);

          // crowd
          if (crowd) {
            const ra = atOr(cues, CR.at, 0), rise = lt < ra ? 0 : progIO(lt, ra, 0.8);
            const mo = atOr(cues, CR.mourn, null), an = atOr(cues, CR.anger, null);
            const mourn = mo != null ? progIO(lt, mo, 0.8) : 0, anger = an != null ? progIO(lt, an, 0.5) : 0;
            const hide = isCover && P.cover_crowd === false;
            crowd.forEach(c => {
              const s = CR.scale * (portrait ? 0.8 : 1), ox = c.x, by = c.y + (1 - rise) * 260 * s;
              const bob = Math.sin(t * 2 + c.i) * 3 + (anger ? Math.abs(Math.sin(t * 7 + c.i * 1.7)) * -8 * anger : 0);
              const lean = mourn * 14 * s, hx = ox + lean, hy = by - 250 * s + bob + mourn * 16 * s, hr = 30 * s;
              if (hide) { [c.body, c.headF, c.head, c.capF, c.cap, c.spear, c.tip].forEach(n => n.setAttribute('d', '')); return; }
              const sh = [ox, by - 205 * s + bob];
              const armUp = (c.i % 2 === 0) ? anger : 0;
              const hand = armUp > 0 ? [ox + 40 * s, lerp(by - 120 * s, by - 330 * s, armUp) + bob] : [ox + 46 * s + lean, by - 110 * s + bob];
              c.body.setAttribute('d', inkPath([sh, [ox + lean * 0.4, by]], { w: 8, seed: sd + 700 + c.i, t }) + ' ' +
                inkPath([sh, [ox - 40 * s, by - 120 * s + bob]], { w: 7, seed: sd + 720 + c.i, t }) + ' ' +
                inkPath([sh, hand], { w: 7, seed: sd + 740 + c.i, t }) + ' ' + (armUp > 0.3 ? inkDot(hand[0], hand[1], 11 * s, 11 * s, sd + 760 + c.i, t) : ''));
              c.headF.setAttribute('d', inkCircle(hx, hy, hr, sd + 780 + c.i, t, { fill: true }));
              let hd = inkCircle(hx, hy, hr, sd + 800 + c.i, t, { w: 5 }) + ' ' + inkDot(hx + 8 * s, hy - 2 * s + mourn * 6 * s, 3.5 * s, 3.5 * s, sd + 820 + c.i, t);
              const browA = anger * 6 * s;
              hd += ' ' + inkPath([[hx + 2 * s, hy - 12 * s - browA * 0.2], [hx + 16 * s, hy - 10 * s + browA]], { w: 3, seed: sd + 830 + c.i, t });
              c.head.setAttribute('d', hd);
              // börk: tall white felt cap folding back
              const cap = [[hx - hr * 0.8, hy - hr * 0.6], [hx + hr * 0.8, hy - hr * 0.6], [hx + hr * 0.5, hy - hr * 2.6], [hx - hr * 0.3, hy - hr * 2.9], [hx - hr * 1.5, hy - hr * 0.9 + Math.sin(t * 2 + c.i) * 3]];
              c.capF.setAttribute('d', inkLoop(cap, { seed: sd + 840 + c.i, t, amp: 0.8 }));
              c.cap.setAttribute('d', inkPath(cap, { w: 4.5, seed: sd + 860 + c.i, t, closed: true }) + ' ' + inkPath([[hx - hr * 0.9, hy - hr * 0.62], [hx + hr * 0.9, hy - hr * 0.62]], { w: 7, seed: sd + 870 + c.i, t }));
              if (c.i % 2 === 1) {
                const sp0 = [ox - 40 * s, by - 60 * s], spT = [ox - 40 * s + anger * 18 * s, by - 420 * s - anger * 60 * s + bob];
                c.spear.setAttribute('d', inkPath([sp0, spT], { w: 5, seed: sd + 880 + c.i, t }));
                c.tip.setAttribute('d', inkLoop([[spT[0] - 9 * s, spT[1] + 6 * s], [spT[0], spT[1] - 30 * s], [spT[0] + 9 * s, spT[1] + 6 * s]], { seed: sd + 890 + c.i, t, amp: 0.6, smooth: false }));
              }
            });
          }

          if (kas) {
            const segs = kasifSegs(cues);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const oo = { x: K.x * W, y: H * K.y, face: faceOf(s.face ?? K.face, -1), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0,
              alpha: isCover && P.cover_hide !== false ? 0 : 1 };
            if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
            kas.update(t, s.pose || 'idle', oo);
          }
        },
      };
    },
  };
  // carried-weapon height follows the prince's scale
  function PR_SC(PR, S) { return PR ? PR.scale * S : S; }
})();
