// pga_blast: 1848 railroad rock blasting in parchment ink (brand/kit/BRAND.md §3, §5; boils at 8 Hz; pure function of
// (seed, lt), no Math.random). Written for ag-04-phineas-gage (cold open, chapters 1-2), parametric. Needs pga__lib.js.
//
// SHOTS.pga_site — wide side view of a railroad cut in the Vermont hills: far hills with pines, a half-laid track
//   (ties + rails) running in from the left, a layered rock ledge on the right with a drill hole on top, the crew
//   (period figures with 1848 cloth caps) and the foreman holding his tamping iron.
//   P: {ground: 0.8 (0..1 H), hills: true, track: {to: 0.5} | false, rock: {x0: 0.58, top: 0.56, w: 0.5} | false,
//       hole_x: 0.74 (0..1 W, drill hole on the rock top),
//       cast: [{who: "gage"|"kasif"|name, x, y, scale, pose, face, at, then, to, run, seq, head: "cap"|"top"|"none",
//               bandage, shake, shake_until, in_place, iron: true | {tamp: cue|true, len: 1.0}, tool: "shovel"|"pick"}],
//       zoom: 1 (static scale around the ground centre), hills_h: 250, iron options: {tamp, len: 1, side: 46 (px beside the hands), lean: 0},
//       blast: {at: cue, x: 0.62, y: 0.7, r: 170, chunk: 0.12 (W cleared from the ledge's left side)} | false,
//       smoke: {x, y, r, at: 0|cue, clear: cue} (lingering smoke cloud that thins out from `clear`),
//       fly: {at: cue, from: [x, y], to: [x, y], dur: 1.6, h: 0.45 (arc height, 0..1 H), dist: {at, y: 0.2} (distance arrow; put the
//            text in labels)} —
//            the iron arcs across the field and sticks in the ground, a dashed arc + distance arrow,
//       bubble: {at: cue, who: 0 (cast index), text, dots: true, dx, dy, w, h},
//       labels: [...MCB labels], shake: cue, cam: {zoom: 1.05, focus: [0.5, 0.6]}}
//   cues: blast, hit (punch), plus every "at" name used above.
//
// SHOTS.pga_hole — close-up cutaway of the drill hole in the rock (how blasting worked): rock block cross-section
//   with strata, the hole cut open so you see inside; above it the tamping iron in two gripping hands.
//   P: {top: 0.3 (rock top, 0..1 H), hole: {x: 0.5, w: 96, depth: 0.42 (0..1 H)},
//       drill: cue|false (drill steel + hammer strikes deepen the hole; without it the hole is already drilled),
//       powder: cue|true|false, fuse: cue|true|false, sand: cue|true|false, tamp: cue|false (3 tamping strokes),
//       nosand: cue|false (empty sand slot outlined in red dashes + a red X),
//       strike: cue (iron comes down and grates on the rock), spark: cue (gold spark star),
//       boom: cue (powder flashes, burst at the mouth, the iron shoots straight up off the frame, rock chips fly),
//       iron: true, labels: [...MCB labels], kasif: {x: 0.7, y: top + 0.005, scale: 0.55, face: "left", ...MCB cast} | false, cast: [...],
//       cam: {zoom: 1.05, focus: [0.5, 0.55]}}
//   cues: drill, powder, fuse, sand, tamp, nosand, strike, spark, boom, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;

  // ---------------------------------------------------------------- pga_site
  SH.pga_site = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 7300;
      const gy = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g'), base = el(root, 'g'), cam = el(base, 'g');
      { const Z = P.zoom ?? 1; base.setAttribute('transform', `translate(${W / 2} ${gy}) scale(${Z}) translate(${-W / 2} ${-gy})`); }
      const farG = el(cam, 'g');
      const hl = P.hills === false ? null : PGA.hills(farG, W, gy - 120, sd + 5, { h: P.hills_h ?? 250, ridges: 2, pines: 18 });
      const groundF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.35 }), groundL = inkEl(cam), groundT = inkEl(cam, INK.inkSoft);
      const trackT = inkEl(cam, INK.inkSoft), trackL = inkEl(cam), trackR = inkEl(cam, INK.inkSoft);
      const RK = P.rock === false ? null : Object.assign({ x0: 0.58, top: 0.56, w: 0.5 }, P.rock || {});
      const rockF = inkEl(cam, INK.paperDark), rockL = inkEl(cam), rockS = inkEl(cam, INK.inkSoft), holeE = inkEl(cam, INK.ink);
      const rubF = inkEl(cam, INK.paperDark), rubL = inkEl(cam);
      const flyArc = inkEl(cam, INK.red), flyArrow = inkEl(cam, INK.ink);
      const castG = el(cam, 'g');
      const tools = inkEl(cam, INK.ink), toolF = inkEl(cam, INK.inkSoft);
      const ironG = el(cam, 'g'), irons = [];
      const debF = inkEl(cam, INK.paperDark), debL = inkEl(cam);
      const smokeL = inkEl(cam, INK.inkSoft), smokeF = inkEl(cam, INK.paperLight);
      const burstF = inkEl(cam, INK.gold), burstR = inkEl(cam, INK.red), burstL = inkEl(cam);
      const flyG = el(cam, 'g'), flyIron = PGA.iron(flyG), flySpeed = inkEl(cam, INK.inkSoft);
      const bub = PGA.bubble(cam, sd + 800);
      const list = (P.cast || []).map(m => (m.who === 'gage' ? Object.assign({ head: 'cap' }, m, { who: 'gage' }) : m));
      const cs = PGA.cast(castG, list, W, H, sd + 300);
      list.forEach(() => irons.push(PGA.iron(el(ironG, 'g'))));
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const R = rng(sd + 1);
      const ticks = Array.from({ length: 14 }, () => [R() * W, gy + 18 + R() * 40]);
      const BL = P.blast ? Object.assign({ x: 0.62, y: 0.7, r: 170, chunk: 0.12 }, P.blast) : null;
      const deb = Array.from({ length: 12 }, (_, i) => ({ a: -Math.PI * (0.15 + 0.7 * R()), v: 500 + R() * 700, r: 14 + R() * 22, land: gy + 10 + R() * 30, rot: R() * 6 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const bAt = BL ? atOr(cues, BL.at, null) : null;
          const hit = Math.max(punch(lt, atOr(cues, 'hit', null), 0.6), bAt != null ? punch(lt, bAt, 0.6) : 0);
          const shA = atOr(cues, P.shake, bAt);
          const shake = shA != null && lt >= shA ? Math.exp(-(lt - shA) * 4) * 0.9 : 0;
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.6] }, hit, shake);
          if (hl) hl.update(t, 0);
          // ground
          groundF.setAttribute('d', inkLoop([[-60, gy], [W + 60, gy], [W + 60, H + 40], [-60, H + 40]], { seed: sd + 2, t, amp: 1, smooth: false }));
          groundL.setAttribute('d', inkPath([[-60, gy], [W * 0.3, gy + 4], [W * 0.7, gy - 2], [W + 60, gy + 2]], { w: 6, seed: sd + 3, t }));
          groundT.setAttribute('d', ticks.map((q, i) => inkPath([q, [q[0] + 30, q[1] - 2]], { w: 3, seed: sd + 10 + i, t, amp: 0.8 })).join(' '));
          // track
          if (P.track !== false) {
            const x1 = (P.track && P.track.to != null ? P.track.to : 0.5) * W;
            let td = '';
            for (let x = 20; x < x1; x += 70) td += inkLoop([[x - 22, gy - 4], [x + 22, gy - 4], [x + 26, gy + 12], [x - 26, gy + 12]], { seed: sd + 30 + x, t, amp: 0.8, smooth: false }) + ' ';
            trackT.setAttribute('d', td);
            trackL.setAttribute('d', inkPath([[-40, gy - 10], [x1 - 30, gy - 10]], { w: 7, seed: sd + 31, t }) + ' ' + inkPath([[-40, gy - 18], [x1 - 50, gy - 18]], { w: 4, seed: sd + 32, t }));
            trackR.setAttribute('d', inkPath([[x1 + 10, gy - 6], [x1 + 60, gy - 8]], { w: 3, seed: sd + 33, t }));
          }
          // rock ledge (its left part is blown away on the blast)
          let cut = 0;
          if (BL && bAt != null && lt >= bAt) cut = BL.chunk * W * prog(lt, bAt, 0.25);
          if (RK) {
            const x0 = RK.x0 * W + cut, top = RK.top * H, x1 = W + 80;
            const pts = [[x0, gy + 4], [x0 + 30, top + 60], [x0 + 70, top + 8], [x0 + 200, top - 6], [x0 + 420, top + 6], [x1, top - 10], [x1, gy + 4]];
            rockF.setAttribute('d', inkLoop(pts, { seed: sd + 40, t, amp: 1.2, smooth: false }));
            rockL.setAttribute('d', inkPath(pts.slice(0, 6), { w: 7, seed: sd + 41, t, smooth: false }));
            let sdd = '';
            for (let i = 1; i < 4; i++) { const y = top + (gy - top) * i / 4; sdd += inkPath([[x0 + 30 + i * 8, y], [x0 + 260, y + 8], [W + 40, y - 6]], { w: 3.5, seed: sd + 42 + i, t }) + ' '; }
            for (let i = 0; i < 6; i++) { const x = x0 + 80 + i * 150, y = top + 30 + (i % 3) * 40; sdd += inkPath([[x, y], [x + 20, y + 26]], { w: 3, seed: sd + 50 + i, t }) + ' '; }
            rockS.setAttribute('d', sdd);
            const hx = (P.hole_x ?? 0.74) * W;
            holeE.setAttribute('d', hx > x0 + 40 ? inkLoop(inkEllipsePts(hx, top + 2, 22, 7, sd + 55, 8), { seed: sd + 55, t, amp: 0.6 }) : '');
          }
          // rubble pile + debris after the blast
          if (BL && bAt != null && lt >= bAt) {
            const bx = BL.x * W, by = BL.y * H, u = lt - bAt;
            const rp = prog(lt, bAt + 0.3, 0.8);
            const pile = [[bx - 200, gy + 4], [bx - 120, gy - 50 * rp], [bx - 20, gy - 80 * rp], [bx + 80, gy - 46 * rp], [bx + 160, gy + 4]];
            rubF.setAttribute('d', rp > 0.02 ? inkLoop(pile, { seed: sd + 60, t, amp: 1.2 }) : '');
            rubL.setAttribute('d', rp > 0.02 ? inkPath(pile, { w: 6, seed: sd + 61, t }) : '');
            let df = '', dl = '';
            deb.forEach((d, i) => {
              let x = bx + Math.cos(d.a) * d.v * u, y = by + Math.sin(d.a) * d.v * u + 900 * u * u;
              if (y > d.land) y = d.land;
              const pts = inkEllipsePts(x, y, d.r, d.r * 0.8, sd + 70 + i, 6, d.rot + u * 4);
              df += inkLoop(pts, { seed: sd + 70 + i, t, amp: 0.8, smooth: false }) + ' ';
              dl += inkPath(pts, { w: 4, seed: sd + 90 + i, t, closed: true, smooth: false }) + ' ';
            });
            debF.setAttribute('d', df); debL.setAttribute('d', dl);
            const bp = clamp01(u / 0.12), fade = 1 - clamp01((u - 0.5) / 0.5);
            if (fade > 0.01) {
              const r = BL.r * (0.4 + 0.8 * bp) * (1 + 0.1 * Math.sin(u * 40));
              burstR.setAttribute('d', inkLoop(PGA.burst(bx, by, r * 1.15, sd + 100, t, 12), { seed: sd + 101, t, smooth: false }));
              burstF.setAttribute('d', inkLoop(PGA.burst(bx, by, r * 0.75, sd + 102, t, 10), { seed: sd + 103, t, smooth: false }));
              burstL.setAttribute('d', inkPath(PGA.burst(bx, by, r * 1.15, sd + 100, t, 12), { w: 6, seed: sd + 104, t, closed: true, smooth: false }));
            } else { burstR.setAttribute('d', ''); burstF.setAttribute('d', ''); burstL.setAttribute('d', ''); }
          }
          // smoke cloud
          const SM = P.smoke || (BL ? { x: BL.x, y: BL.y - 0.08, r: BL.r * 1.3, at: BL.at } : null);
          if (SM) {
            const sa = atOr(cues, SM.at, 0);
            const ca = SM.clear != null ? atOr(cues, SM.clear, null) : null;
            if (lt >= sa) {
              const g = prog(lt, sa + 0.15, 1.2), cl = ca != null ? prog(lt, ca, 1.6) : 0;
              const r0 = (SM.r || 220) * (0.3 + 0.7 * g) * (1 - 0.6 * cl);
              let sf = '', sl = '';
              if (r0 > 6) for (let i = 0; i < 6; i++) {
                const a = i / 6 * Math.PI * 2 + lt * 0.3, cx = SM.x * W + Math.cos(a) * r0 * 0.55 + lt * 14, cy = SM.y * H + Math.sin(a) * r0 * 0.3 - g * 40 - cl * 60;
                sf += inkCircle(cx, cy, r0 * 0.45, sd + 120 + i, t, { fill: true }) + ' ';
                sl += inkCircle(cx, cy, r0 * 0.45, sd + 120 + i, t, { w: 9 }) + ' ';
              }
              smokeF.setAttribute('d', sf); smokeL.setAttribute('d', sl);
            } else { smokeF.setAttribute('d', ''); smokeL.setAttribute('d', ''); }
          }
          // cast + irons + tools
          const info = cs.update(lt, t, cues);
          let tl = '', tf = '';
          info.forEach((f, i) => {
            if (!f) { irons[i].draw(t, 0, [0, 0], [0, 0], 0, false); return; }
            const m = f.m;
            if (m.iron) {
              const I = typeof m.iron === 'object' ? m.iron : {};
              const ta = I.tamp === true ? 0 : I.tamp != null ? atOr(cues, I.tamp, null) : null;
              const bob = ta != null && lt >= ta ? -Math.abs(Math.sin((lt - ta) * Math.PI * 1.6)) * 46 * f.s / 0.6 : 0;
              const hx = (f.hands[0][0] + f.hands[1][0]) / 2, hy = (f.hands[0][1] + f.hands[1][1]) / 2;
              const len = 520 * f.s / 0.6 * (I.len ?? 1);
              const lean = (I.lean ?? 0) * f.face;
              const side = (I.side ?? 46) * f.s / 0.6 * f.face;
              const butt = [hx + side + lean * 0.4, f.y - 4 + bob], tip = [hx + side - lean * 0.6, f.y - 4 + bob - len];
              irons[i].draw(t, sd + 200 + i * 5, butt, tip, 16 * f.s / 0.6, true);
            } else irons[i].draw(t, 0, [0, 0], [0, 0], 0, false);
            if (m.tool) {
              const hx = f.hands[1][0], hy = f.hands[1][1], k = f.s / 0.6, fc = f.face;
              const swing = Math.sin(lt * 3 + i) * 0.25;
              const ang = -1.25 + swing, L = 200 * k;
              const ex = hx + Math.cos(ang) * L * fc * -1, ey = hy - Math.sin(ang) * L * -1;
              tl += inkPath([[hx - (ex - hx) * 0.5, hy - (ey - hy) * 0.5], [ex, ey]], { w: 7 * k, seed: sd + 220 + i, t }) + ' ';
              if (m.tool === 'shovel') { const bl = inkEllipsePts(ex, ey + 18 * k, 22 * k, 30 * k, sd + 230 + i, 8); tf += inkLoop(bl, { seed: sd + 230 + i, t }) + ' '; tl += inkPath(bl, { w: 4, seed: sd + 231 + i, t, closed: true }) + ' '; }
              else { const a2 = [ex - 50 * k, ey - 10 * k], b2 = [ex + 50 * k, ey - 6 * k]; tl += inkPath([a2, [ex, ey - 16 * k], b2], { w: 8 * k, seed: sd + 232 + i, t }) + ' '; }
            }
          });
          tools.setAttribute('d', tl); toolF.setAttribute('d', tf);
          // flying iron
          if (P.fly) {
            const F = Object.assign({ from: [0.18, 0.62], to: [0.86, 0.79], dur: 1.6, h: 0.45 }, P.fly);
            const fa = atOr(cues, F.at, 0.3), u = clamp01((lt - fa) / F.dur);
            const A = [F.from[0] * W, F.from[1] * H], B = [F.to[0] * W, F.to[1] * H], hh = F.h * H;
            const pos = s => [lerp(A[0], B[0], s), lerp(A[1], B[1], s) - 4 * hh * s * (1 - s)];
            if (lt >= fa) {
              let ad = '';
              const n = Math.floor(u * 40);
              for (let i = 0; i < n; i += 2) ad += inkPath([pos(i / 40), pos((i + 1) / 40)], { w: 5, seed: sd + 300 + i, t, amp: 0.8 }) + ' ';
              flyArc.setAttribute('d', ad);
              const s1 = Math.min(u, 0.999), p = pos(s1), q = pos(Math.min(1, s1 + 0.01));
              let ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
              const L = (F.len ?? 260);
              let tip, butt;
              if (u < 1) { const spin = Math.sin(u * 9) * 0.15; ang += spin; tip = [p[0] + Math.cos(ang) * L * 0.5, p[1] + Math.sin(ang) * L * 0.5]; butt = [p[0] - Math.cos(ang) * L * 0.5, p[1] - Math.sin(ang) * L * 0.5]; }
              else { const a2 = B[0] >= A[0] ? 1.1 : Math.PI - 1.1; tip = [B[0] + Math.cos(a2) * L * 0.2, B[1] + Math.sin(a2) * L * 0.2]; butt = [tip[0] - Math.cos(a2) * L, tip[1] - Math.sin(a2) * L]; }
              flyIron.draw(t, sd + 320, butt, tip, 15, true);
              let sp = '';
              if (u < 1) for (let i = 0; i < 3; i++) { const b = pos(Math.max(0, s1 - 0.04 - i * 0.02)); sp += inkPath([[b[0], b[1] + (i - 1) * 16], [b[0] - 60 * (B[0] >= A[0] ? 1 : -1), b[1] + (i - 1) * 16 + 10]], { w: 4, seed: sd + 330 + i, t }) + ' '; }
              else for (let i = 0; i < 4; i++) { const a = -Math.PI * (0.2 + i * 0.2), r = 30 + 30 * prog(lt, fa + F.dur, 0.3); sp += inkPath([[B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r], [B[0] + Math.cos(a) * (r + 26), B[1] + Math.sin(a) * (r + 26)]], { w: 5, seed: sd + 340 + i, t }) + ' '; }
              flySpeed.setAttribute('d', sp);
              const D = F.dist ? atOr(cues, F.dist.at, fa + F.dur) : null;
              const dp = D != null ? prog(lt, D, 0.7) : 0;
              if (dp > 0.01) {
                const yA = (F.dist.y ?? 0.2) * H, xa = A[0], xb = lerp(A[0], B[0], dp), sg = B[0] >= A[0] ? 1 : -1;
                flyArrow.setAttribute('d', inkPath([[xa, yA], [xb, yA]], { w: 6, seed: sd + 350, t }) + ' ' + inkPath([[xa, yA - 20], [xa, yA + 20]], { w: 6, seed: sd + 351, t }) +
                  (dp > 0.9 ? ' ' + inkPath([[xb - 26 * sg, yA - 16], [xb, yA], [xb - 26 * sg, yA + 16]], { w: 6, seed: sd + 352, t, smooth: false }) : ''));
              } else flyArrow.setAttribute('d', '');
            } else { flyArc.setAttribute('d', ''); flyIron.draw(t, 0, [0, 0], [0, 0], 0, false); flySpeed.setAttribute('d', ''); }
          }
          // speech bubble
          if (P.bubble) {
            const Bb = P.bubble, ba = atOr(cues, Bb.at, 0.5), who = info[Bb.who ?? 0];
            if (who && lt >= ba) {
              const p = spring(lt, ba, 0.5), hx = who.head[0], hy = who.head[1];
              const bx = hx + (Bb.dx ?? 190) * (Bb.flip ? -1 : 1), by = hy + (Bb.dy ?? -120);
              bub.update(t, lt, { x: bx, y: by, w: Bb.w ?? (Bb.text ? 420 : 260), h: Bb.h ?? 130, tail: [hx + (bx > hx ? 40 : -40), hy - 30], p, text: Bb.text, dots: Bb.dots ?? !Bb.text, size: Bb.size });
            } else bub.update(t, lt, { p: 0 });
          }
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ---------------------------------------------------------------- pga_hole
  SH.pga_hole = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 7600;
      const top = (P.top ?? 0.3) * H;
      const HO = Object.assign({ x: 0.5, w: 96, depth: 0.42 }, P.hole || {});
      const hx = HO.x * W, hw = HO.w, hb = top + HO.depth * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const rockF = inkEl(cam, INK.paperDark), rockS = inkEl(cam, INK.inkSoft), rockL = inkEl(cam);
      const holeF = inkEl(cam, INK.paperLight), holeL = inkEl(cam);
      const powF = inkEl(cam, INK.inkSoft), powD = inkEl(cam, INK.ink), flash = inkEl(cam, INK.gold), flashR = inkEl(cam, INK.red);
      const sandF = inkEl(cam, INK.stain, { 'fill-opacity': 0.75 }), sandD = inkEl(cam, INK.inkSoft);
      const fuseL = inkEl(cam, INK.ink), fuseT = inkEl(cam, INK.red);
      const slot = inkEl(cam, INK.red);
      const stream = inkEl(cam, INK.inkSoft);
      const drillG = inkEl(cam, INK.ink), drillF = inkEl(cam, INK.inkSoft);
      const ironG = el(cam, 'g'), iron = PGA.iron(ironG), arms = inkEl(cam, INK.ink), handsF = inkEl(cam, INK.paperLight), hands = inkEl(cam, INK.ink);
      const spark = inkEl(cam, INK.gold), sparkL = inkEl(cam, INK.red);
      const burstF = inkEl(cam, INK.gold), burstR = inkEl(cam, INK.red), burstL = inkEl(cam), speed = inkEl(cam, INK.inkSoft);
      const chips = inkEl(cam, INK.ink);
      const castG = el(cam, 'g');
      const KZ = P.kasif === false ? null : Object.assign({ who: 'kasif', x: 0.7, y: (P.top ?? 0.3) + 0.005, scale: 0.55, pose: 'point', dir: -20, face: 'left' }, P.kasif || {});
      const cs = cast(castG, (P.cast || []).concat(KZ ? [KZ] : []), W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const R = rng(sd + 2);
      const grains = Array.from({ length: 70 }, () => [R(), R()]);
      const sandG = Array.from({ length: 40 }, () => [R(), R()]);
      const bx0 = (P.x0 ?? 0.2) * W, bx1 = (P.x1 ?? 0.8) * W;
      const at = (v, fb = null) => v === true ? -1 : v ? atOr(cues0, v, fb) : null;
      let cues0 = null;
      return {
        update(lt, dur, cues, env = {}) {
          cues0 = cues;
          const t = env.t ?? lt;
          const aDrill = at(P.drill), aPow = at(P.powder), aFuse = at(P.fuse), aSand = at(P.sand), aTamp = at(P.tamp);
          const aNo = at(P.nosand), aStrike = at(P.strike), aSpark = at(P.spark), aBoom = at(P.boom);
          const hit = Math.max(punch(lt, atOr(cues, 'hit', null), 0.6), aBoom != null ? punch(lt, aBoom, 0.6) : 0);
          const shake = aBoom != null && lt >= aBoom ? Math.exp(-(lt - aBoom) * 4) : 0;
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [HO.x, 0.55] }, hit, shake);
          // rock block (cross-section) with the hole cut open
          const blk = [[bx0 - 40, top + 30], [bx0 + 60, top - 4], [hx - hw / 2, top], [hx + hw / 2, top], [bx1 - 60, top + 6], [bx1 + 40, top + 40], [bx1 + 60, H + 40], [bx0 - 60, H + 40]];
          rockF.setAttribute('d', inkLoop(blk, { seed: sd + 1, t, amp: 1.2, smooth: false }));
          rockL.setAttribute('d', inkPath(blk.slice(0, 7), { w: 7, seed: sd + 2, t, smooth: false }));
          let sdd = '';
          for (let i = 1; i < 5; i++) { const y = top + i * 90; sdd += inkPath([[bx0 - 40, y + 10], [hx - hw / 2 - 10, y], [hx - hw / 2 - 4, y]], { w: 3.5, seed: sd + 3 + i, t }) + ' ' + inkPath([[hx + hw / 2 + 4, y + 4], [bx1 + 40, y - 8]], { w: 3.5, seed: sd + 9 + i, t }) + ' '; }
          for (let i = 0; i < 10; i++) { const x = lerp(bx0, bx1, (i + 0.5) / 10), y = top + 60 + (i * 53) % 300; if (Math.abs(x - hx) > hw) sdd += inkPath([[x, y], [x + 22, y + 22]], { w: 3, seed: sd + 20 + i, t }) + ' '; }
          rockS.setAttribute('d', sdd);
          // hole depth (drilling)
          let depth = 1;
          if (aDrill != null) depth = lt < aDrill ? 0.05 : Math.min(1, 0.05 + Math.floor((lt - aDrill) / 0.45 + 1) * 0.16 * prog(lt, aDrill, 0.2));
          const bot = top + (hb - top) * depth;
          const hole = [[hx - hw / 2, top], [hx - hw / 2 + 2, bot - 18], [hx, bot + 4], [hx + hw / 2 - 2, bot - 18], [hx + hw / 2, top]];
          holeF.setAttribute('d', inkLoop(hole, { seed: sd + 30, t, amp: 0.8 }));
          holeL.setAttribute('d', inkPath(hole, { w: 6, seed: sd + 31, t, amp: 1 }));
          if (aDrill != null && lt >= aDrill - 0.3 && lt < aDrill + 2.8) {
            const ph = ((lt - aDrill) / 0.45) % 1, lift = lt < aDrill ? 1 : Math.max(0, Math.cos(ph * Math.PI * 2)) ;
            const dtop = top - 170, dl = inkPath([[hx, bot - 6], [hx, dtop]], { w: 14, seed: sd + 40, t }) + ' ' + inkPath([[hx - 10, bot + 2], [hx, bot + 14], [hx + 10, bot + 2]], { w: 6, seed: sd + 41, t, smooth: false });
            const ha = -0.2 - lift * 0.9, pv = [hx + 230, dtop + 40], hd = [pv[0] + Math.cos(Math.PI + ha) * 230, pv[1] + Math.sin(Math.PI + ha) * 230];
            drillG.setAttribute('d', dl + ' ' + inkPath([pv, hd], { w: 10, seed: sd + 42, t }) + ' ' + inkDot(pv[0], pv[1], 16, 16, sd + 43, t));
            drillF.setAttribute('d', inkLoop([[hd[0] - 40, hd[1] - 26], [hd[0] + 40, hd[1] - 26], [hd[0] + 40, hd[1] + 26], [hd[0] - 40, hd[1] + 26]], { seed: sd + 44, t, smooth: false }));
          } else { drillG.setAttribute('d', ''); drillF.setAttribute('d', ''); }
          // layers: powder bottom 45%, sand on top up to 12% below the mouth
          const L = (a, b) => [[hx - hw / 2 + 5, a], [hx + hw / 2 - 5, a], [hx + hw / 2 - 5, b], [hx - hw / 2 + 5, b]];
          const powTop = hb - (hb - top) * 0.48, sandTop0 = top + (hb - top) * 0.12;
          const boomU = aBoom != null && lt >= aBoom ? lt - aBoom : -1;
          if (aPow != null && depth >= 1) {
            const p = prog(lt, aPow, 1.0), y = lerp(hb, powTop, p);
            if (p > 0.01 && boomU < 0.15) {
              powF.setAttribute('d', inkLoop(L(y, hb - 6), { seed: sd + 50, t, amp: 0.8, smooth: false }));
              powD.setAttribute('d', grains.filter(g => hb - 10 - g[1] * (hb - powTop - 10) > y).map((g, i) => inkDot(hx - hw / 2 + 10 + g[0] * (hw - 20), hb - 10 - g[1] * (hb - powTop - 14), 3.5, 3.5, sd + 60 + i, t)).join(' '));
            } else { powF.setAttribute('d', ''); powD.setAttribute('d', ''); }
            stream.setAttribute('d', p > 0 && p < 0.97 ? Array.from({ length: 8 }, (_, i) => { const yy = top - 60 + ((lt * 400 + i * 50) % Math.max(60, y - top + 60)); return inkDot(hx + Math.sin(i) * 6, yy, 4, 4, sd + 140 + i, t); }).join(' ') : '');
          }
          if (aFuse != null) {
            const p = prog(lt, aFuse, 0.9);
            if (p > 0.01 && boomU < 0.15) {
              const pts = [[hx - 8, hb - 30], [hx - 4, powTop], [hx + 6, top + 20], [hx + 14, top - 30], [hx + 70, top - 60], [hx + 130, top - 40]];
              const n = Math.max(2, Math.ceil(pts.length * p));
              fuseL.setAttribute('d', inkPath(pts.slice(0, n), { w: 6, seed: sd + 70, t }));
              const e = pts[n - 1];
              fuseT.setAttribute('d', p > 0.95 ? inkDot(e[0], e[1], 9, 9, sd + 71, t) : '');
            } else { fuseL.setAttribute('d', ''); fuseT.setAttribute('d', ''); }
          }
          // tamping lowers the sand a little (packed)
          let tampY = 0;
          const tampN = 3, tampT = 0.62;
          if (aTamp != null && lt >= aTamp) tampY = Math.min(1, (lt - aTamp) / (tampN * tampT)) * 16;
          if (aSand != null) {
            const p = prog(lt, aSand, 0.9), y = lerp(powTop, sandTop0 + tampY, p);
            if (p > 0.01 && boomU < 0.15) {
              sandF.setAttribute('d', inkLoop(L(y, powTop), { seed: sd + 80, t, amp: 0.8, smooth: false }));
              sandD.setAttribute('d', sandG.filter(g => powTop - 6 - g[1] * (powTop - sandTop0 - 10) > y).map((g, i) => inkDot(hx - hw / 2 + 10 + g[0] * (hw - 20), powTop - 6 - g[1] * (powTop - sandTop0 - 12), 2.6, 2.6, sd + 90 + i, t)).join(' '));
            } else { sandF.setAttribute('d', ''); sandD.setAttribute('d', ''); }
            if (aPow == null || lt < aPow || prog(lt, aPow, 1.0) >= 0.97) stream.setAttribute('d', p > 0 && p < 0.97 ? Array.from({ length: 8 }, (_, i) => { const yy = top - 60 + ((lt * 400 + i * 50) % Math.max(60, y - top + 60)); return inkDot(hx + Math.sin(i) * 6, yy, 3.5, 3.5, sd + 150 + i, t); }).join(' ') : '');
          }
          if (aNo != null) {
            const p = prog(lt, aNo, 0.7);
            let d = '';
            if (p > 0.01 && boomU < 0) {
              const box = L(sandTop0, powTop), per = [box[0], box[1], box[2], box[3], box[0]];
              for (let i = 0; i < 4; i++) { const a = per[i], b = per[i + 1], segs = 6; for (let k = 0; k < segs; k += 2) { if ((i * segs + k) / (4 * segs) > p) break; d += inkPath([[lerp(a[0], b[0], k / segs), lerp(a[1], b[1], k / segs)], [lerp(a[0], b[0], (k + 1) / segs), lerp(a[1], b[1], (k + 1) / segs)]], { w: 5, seed: sd + 100 + i * 10 + k, t }) + ' '; } }
              const xp = spring(lt, aNo + 0.5, 0.5), cx = hx + hw / 2 + 120, cy = (sandTop0 + powTop) / 2, r = 54 * Math.max(0.01, xp);
              if (lt > aNo + 0.5) d += inkPath([[cx - r, cy - r], [cx + r, cy + r]], { w: 16, seed: sd + 120, t }) + ' ' + inkPath([[cx + r, cy - r], [cx - r, cy + r]], { w: 16, seed: sd + 121, t });
            }
            slot.setAttribute('d', d);
          }
          // the iron above the hole, held by two hands (arms reach in from the top-right)
          if (P.iron !== false) {
            let low = top - 40;                               // butt height above the mouth when resting
            if (aTamp != null && lt >= aTamp && lt < aTamp + tampN * tampT) {
              const ph = ((lt - aTamp) / tampT) % 1;
              low = lerp(top - 120, sandTop0 + tampY - 4, Math.max(0, Math.sin(ph * Math.PI)));
            } else if (aTamp != null && lt >= aTamp + tampN * tampT) low = top - 120;
            if (aStrike != null && lt >= aStrike) {
              const p = prog(lt, aStrike, 0.35);
              low = lerp(top - 140, powTop - 30, p);
            } else if (aStrike != null) low = top - 140 - Math.sin(lt * 2) * 10;
            let off = 0;
            if (boomU >= 0) off = boomU * boomU * 9000 + boomU * 900;
            const len = 640, butt = [hx, low - off], tip = [hx, low - off - len];
            iron.draw(t, sd + 160, butt, tip, 40, true);
            if (boomU < 0) {
              const gy1 = low - 300, gy2 = low - 420;
              const fist = (x, y, k) => inkEllipsePts(x, y, 34, 26, sd + k, 9);
              handsF.setAttribute('d', inkLoop(fist(hx + 6, gy1, 170), { seed: sd + 170, t }) + ' ' + inkLoop(fist(hx + 6, gy2, 171), { seed: sd + 171, t }));
              hands.setAttribute('d', inkPath(fist(hx + 6, gy1, 170), { w: 6, seed: sd + 174, t, closed: true }) + ' ' + inkPath(fist(hx + 6, gy2, 171), { w: 6, seed: sd + 175, t, closed: true }));
              arms.setAttribute('d', inkPath([[hx + 30, gy1], [hx + 160, gy1 - 60], [hx + 260, gy1 - 260]], { w: 14, seed: sd + 172, t }) + ' ' + inkPath([[hx + 30, gy2], [hx + 170, gy2 - 70], [hx + 230, gy2 - 300]], { w: 14, seed: sd + 173, t }));
            } else { hands.setAttribute('d', ''); handsF.setAttribute('d', ''); arms.setAttribute('d', ''); }
            let sp = '';
            if (boomU >= 0 && boomU < 1.2) for (let i = 0; i < 5; i++) { const x = hx + (i - 2) * 26, y0 = low - off + 40 + i * 30; sp += inkPath([[x, y0], [x, y0 + 200 + i * 40]], { w: 5, seed: sd + 180 + i, t }) + ' '; }
            speed.setAttribute('d', sp);
          }
          // spark + explosion
          if (aSpark != null && lt >= aSpark && (boomU < 0.1)) {
            const p = spring(lt, aSpark, 0.3), cx = hx + hw / 2 - 4, cy = Math.min(powTop - 34, sandTop0 + 30), r = 70 * p * (1 + 0.15 * Math.sin(lt * 50));
            spark.setAttribute('d', inkLoop(PGA.burst(cx, cy, r, sd + 190, t, 8), { seed: sd + 191, t, smooth: false }));
            sparkL.setAttribute('d', inkPath(PGA.burst(cx, cy, r, sd + 190, t, 8), { w: 4, seed: sd + 192, t, closed: true, smooth: false }));
          } else { spark.setAttribute('d', ''); sparkL.setAttribute('d', ''); }
          if (boomU >= 0) {
            const bp = clamp01(boomU / 0.15), fade = 1 - clamp01((boomU - 0.9) / 0.6);
            let bf = '', br = '', bl = '';
            if (fade > 0.02) {
              const r = 240 * (0.3 + 0.9 * bp) * fade;
              br = inkLoop(PGA.burst(hx, top - 10, r, sd + 200, t, 13), { seed: sd + 201, t, smooth: false });
              bf = inkLoop(PGA.burst(hx, top - 10, r * 0.62, sd + 202, t, 10), { seed: sd + 203, t, smooth: false }) + ' ' + inkLoop(L(top + 4, hb - 6), { seed: sd + 204, t, smooth: false });
              bl = inkPath(PGA.burst(hx, top - 10, r, sd + 200, t, 13), { w: 6, seed: sd + 205, t, closed: true, smooth: false });
              flashR.setAttribute('d', inkLoop(L(powTop, hb - 6), { seed: sd + 206, t, smooth: false }));
            } else flashR.setAttribute('d', '');
            burstF.setAttribute('d', bf); burstR.setAttribute('d', br); burstL.setAttribute('d', bl);
            let cd = '';
            for (let i = 0; i < 10; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 9)), v = 600 + (i * 137) % 400; const x = hx + Math.cos(a) * v * boomU, y = top + Math.sin(a) * v * boomU + 800 * boomU * boomU; if (y < H) cd += inkLoop(inkEllipsePts(x, y, 12, 9, sd + 210 + i, 6, boomU * 5), { seed: sd + 210 + i, t, smooth: false }) + ' '; }
            chips.setAttribute('d', cd);
          }
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
