// sm_seal: a forged seal and an intercepted letter, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz via
// _ink.js; pure function of (seed, lt), no Math.random). Written for 04-sehzade-mustafa (the story that Rüstem Paşa had
// a copy of Mustafa's seal cut and sent a letter to the Shah in his name), parametric: any forgery / intercepted letter.
// Left: the original round seal (double ring, calligraphic loops). On `copy` a second seal is cut beside it (a chisel
// circles it, the loops appear one by one, a red "kopya" label). On `stamp` the copy presses onto a letter sheet below
// and leaves a red wax mark. On `send` the sheet rolls into a scroll and flies along a dashed arc towards the right
// (`to` label). On `catch` it is stopped mid-flight inside a red ring; on `back` it drops to the second target
// (`back_to` label). Optional handwritten header and the narrator (Kaşif / fez).
// P: {header: {text: "Rivayet", at}, orig: {x: 0.27, y: 0.42, r: 120, label: "Mustafa"}, copy: {at: cue, label: "kopya"},
//     letter: {x: 0.5, y: 0.74}, stamp: cue, send: cue, to: {text: "Şah", x: 0.9, y: 0.3}, catch: cue,
//     back: cue, back_to: {text: "Padişah", x: 0.84, y: 0.78},
//     kasif: {x: 0.09, y: 0.95, scale: 0.75, pose: "talk", face: 1, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.05, focus: [0.5, 0.5]}}
// cues: hit (punch), copy.at, stamp, send, catch, back, header.at, seq names. Needs mcB__lib.js (MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  SH.sm_seal = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const O = Object.assign({ x: portrait ? 0.3 : 0.27, y: portrait ? 0.3 : 0.42, r: portrait ? 120 : 150, label: 'Mustafa' }, P.orig || {});
      const C = Object.assign({ label: 'kopya' }, P.copy || {});
      const LT = Object.assign({ x: portrait ? 0.5 : 0.5, y: portrait ? 0.52 : 0.76 }, P.letter || {});
      const TO = Object.assign({ text: 'Şah', x: 0.9, y: 0.3 }, P.to || {});
      const BK = Object.assign({ text: 'Padişah', x: 0.84, y: 0.8 }, P.back_to || {});
      const r = O.r, ox = O.x * W, oy = O.y * H, cx = (O.x + (portrait ? 0.38 : 0.21)) * W, cy = oy;
      // calligraphic loops inside a seal (fixed per seed)
      const loops = (() => {
        const q = rng(sd + 9), out = [];
        for (let k = 0; k < 6; k++) {
          const a0 = q() * Math.PI * 2, rr = r * (0.18 + q() * 0.36), x0 = (q() - 0.5) * r * 0.7, y0 = (q() - 0.5) * r * 0.6, pts = [];
          for (let j = 0; j <= 9; j++) { const a = a0 + j / 9 * Math.PI * (1.1 + q() * 0.4); pts.push([x0 + Math.cos(a) * rr, y0 + Math.sin(a) * rr * 0.55 + j * 2]); }
          out.push(pts);
        }
        return out;
      })();
      const mk = (fill) => ({ fill: inkEl(cam, fill), ring: inkEl(cam), cal: inkEl(cam), handle: inkEl(cam, INK.inkSoft) });
      const sealO = mk(INK.paperLight), sealC = mk(INK.paperLight);
      const sheetF = inkEl(cam, INK.paperLight), sheetR = inkEl(cam), lines = inkEl(cam, INK.inkSoft), wax = inkEl(cam, INK.red), waxR = inkEl(cam, INK.ink);
      const trail = inkEl(cam, INK.inkSoft), ringRed = inkEl(cam, INK.red), chisel = inkEl(cam);
      const labG = el(cam, 'g');
      const lab = [];
      if (O.label) lab.push({ text: O.label, x: O.x, y: O.y + (r + 70) / H, at: 0.1, size: 60 });
      if (C.at != null) lab.push({ text: C.label, x: cx / W, y: (cy - r - 60) / H, at: C.at, color: 'red', size: 64 });
      if (P.header) lab.push({ text: P.header.text, x: P.header.x ?? 0.5, y: P.header.y ?? 0.13, at: P.header.at ?? 0.2, size: 72, font: 'serif' });
      if (P.send != null && TO.text) lab.push({ text: TO.text, x: TO.x, y: TO.y + 0.11, at: P.send, stamp: true, color: 'blue', size: 64 });
      if (P.back != null && BK.text) lab.push({ text: BK.text, x: BK.x, y: BK.y + 0.1, at: P.back, stamp: true, color: 'red', size: 64 });
      const labels = MCB.labels(labG, lab.concat(P.labels || []), W, H, sd + 40);
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.15 : 0.1, y: 0.95, scale: portrait ? 0.8 : 0.75, pose: 'talk', face: 1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      const drawSeal = (S, x, y, t, prog0, k, off) => {
        if (prog0 <= 0) { ['fill', 'ring', 'cal', 'handle'].forEach(n => S[n].setAttribute('d', '')); return; }
        S.fill.setAttribute('d', inkCircle(x, y, r * Math.min(1, prog0 * 1.5), sd + off, t, { fill: true }));
        const ringP = clamp01(prog0 * 1.6), n = Math.max(3, Math.round(24 * ringP)), rp = [], rp2 = [];
        for (let j = 0; j <= n; j++) { const a = -Math.PI / 2 + j / 24 * Math.PI * 2; rp.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); rp2.push([x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84]); }
        S.ring.setAttribute('d', inkPath(rp, { w: 8, seed: sd + off + 1, t }) + ' ' + inkPath(rp2, { w: 4, seed: sd + off + 2, t }));
        const shown = Math.floor(clamp01((prog0 - 0.35) / 0.65) * loops.length + 0.0001);
        S.cal.setAttribute('d', loops.slice(0, shown).map((L, j) => inkPath(L.map(p => [x + p[0], y + p[1]]), { w: 6, seed: sd + off + 10 + j, t, taper: 0.5 })).join(' '));
        // the handle of the seal stamp (a short knob above), only for the copy when it moves
        S.handle.setAttribute('d', k ? inkLoop([[x - 26, y - r - 4], [x + 26, y - r - 4], [x + 18, y - r - 70], [x - 18, y - r - 70]], { seed: sd + off + 30, t, amp: 0.8 }) : '');
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          MCB.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.5, 0.5] }, P.cam || {}), hit);
          // original seal: springs in
          const pO = spring(lt, 0.05, 0.6);
          const pk = punch(lt, atOr(cues, C.at, null), 0.6);
          drawSeal(sealO, ox, oy + Math.sin(t * 1.1) * 4, t, Math.min(1, pO), 0, 100);
          // copy: cut in place, then stamps onto the letter
          const ca = atOr(cues, C.at, null);
          const cp = ca == null ? 0 : clamp01((lt - ca) / 1.6);
          const sa = atOr(cues, P.stamp, null), lx = LT.x * W, ly = LT.y * H;
          let sx = cx, sy = cy + Math.sin(t * 1.3 + 1) * 4, press = 0;
          if (sa != null && lt >= sa - 0.5) {
            const down = progIO(lt, sa - 0.5, 0.5), up = progIO(lt, sa + 0.25, 0.6);
            sx = lerp(cx, lx, down); sy = lerp(cy, ly - r * 0.15, down) - up * 220;
            press = lt >= sa && lt < sa + 0.25 ? 1 : 0;
          }
          drawSeal(sealC, sx, sy, t, cp, sa != null && lt >= sa - 0.5 ? 1 : 0, 200);
          // chisel circling the copy while it is cut
          if (ca != null && lt >= ca && lt < ca + 1.7) {
            const a = (lt - ca) * 7, tipx = cx + Math.cos(a) * r * 0.6, tipy = cy + Math.sin(a) * r * 0.5;
            chisel.setAttribute('d', inkPath([[tipx, tipy], [tipx + 90, tipy - 120]], { w: 9, seed: sd + 300, t, taper: 0.6 }));
          } else chisel.setAttribute('d', '');
          // letter: sheet -> scroll -> flight
          const sn = atOr(cues, P.send, null), cat = atOr(cues, P.catch, null), bk = atOr(cues, P.back, null);
          const roll = sn != null ? progIO(lt, sn, 0.5) : 0;
          let fx = lx, fy = ly, flight = 0;
          const A = [lx, ly], Bp = [TO.x * W, TO.y * H], M = [(A[0] + Bp[0]) / 2, Math.min(A[1], Bp[1]) - H * 0.28];
          const bez = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * M[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * M[1] + u * u * Bp[1]];
          const stopU = 0.62;
          if (sn != null && lt >= sn + 0.4) {
            const end = cat != null ? stopU : 1;
            flight = Math.min(end, clamp01((lt - sn - 0.4) / 1.8));
            if (cat != null && lt < cat) flight = Math.min(flight, stopU * 0.98);
            [fx, fy] = bez(flight);
          }
          const caught = cat != null && lt >= cat ? 1 : 0;
          if (bk != null && lt >= bk) { const u = progIO(lt, bk, 1.2); const c0 = bez(stopU); fx = lerp(c0[0], BK.x * W, u); fy = lerp(c0[1], BK.y * H, u); }
          const sw = lerp(340, 80, roll), sh = lerp(230, 140, roll);
          const tilt = roll * 0.3 + Math.sin(t * 2) * 0.03;
          const corn = [[-sw / 2, -sh / 2], [sw / 2, -sh / 2], [sw / 2, sh / 2], [-sw / 2, sh / 2]].map(([a, b]) => [fx + a * Math.cos(tilt) - b * Math.sin(tilt), fy + a * Math.sin(tilt) + b * Math.cos(tilt)]);
          sheetF.setAttribute('d', inkLoop(corn, { seed: sd + 400, t, amp: 0.8, smooth: false }));
          sheetR.setAttribute('d', inkPath(corn, { w: 5, seed: sd + 401, t, closed: true, smooth: false }) +
            (roll > 0.5 ? ' ' + inkPath([[fx - sw * 0.5, fy - sh * 0.5], [fx - sw * 0.5, fy + sh * 0.5]], { w: 8, seed: sd + 402, t }) + ' ' + inkPath([[fx + sw * 0.5, fy - sh * 0.5], [fx + sw * 0.5, fy + sh * 0.5]], { w: 8, seed: sd + 403, t }) : ''));
          let ld = '';
          if (roll < 0.4) for (let k = 0; k < 4; k++) { const yy = fy - sh * 0.3 + k * sh * 0.17, wv = sw * (0.62 - (k === 3 ? 0.25 : 0)); ld += inkPath([[fx - sw * 0.38, yy], [fx - sw * 0.38 + wv * 0.5, yy - 4], [fx - sw * 0.38 + wv, yy]], { w: 4, seed: sd + 410 + k, t }) + ' '; }
          lines.setAttribute('d', ld);
          const stamped = sa != null && lt >= sa;
          if (stamped) {
            const wr = lerp(30, 22, roll) * (1 + 0.25 * punch(lt, sa, 0.5)), wx = fx + (roll > 0.5 ? 0 : sw * 0.3), wy = fy + (roll > 0.5 ? 0 : sh * 0.2);
            wax.setAttribute('d', inkCircle(wx, wy, wr, sd + 420, t, { fill: true }));
            waxR.setAttribute('d', inkCircle(wx, wy, wr * 0.55, sd + 421, t, { w: 3 }));
          } else { wax.setAttribute('d', ''); waxR.setAttribute('d', ''); }
          // dashed flight trail
          if (flight > 0.02) {
            let td = ''; const n = 18;
            for (let k = 0; k < n; k++) { const u0 = k / n * flight, u1 = (k + 0.5) / n * flight; td += inkPath([bez(u0), bez(u1)], { w: 5, seed: sd + 430 + k, t }) + ' '; }
            trail.setAttribute('d', td);
          } else trail.setAttribute('d', '');
          if (caught) {
            const c0 = bez(stopU), p = spring(lt, cat, 0.5), rr2 = 120 * p, pts = [];
            for (let k = 0; k <= 22; k++) { const a = k / 20 * Math.PI * 2; pts.push([c0[0] + Math.cos(a) * rr2 * 1.25, c0[1] + Math.sin(a) * rr2]); }
            ringRed.setAttribute('d', p > 0.02 ? inkPath(pts, { w: 9, seed: sd + 450, t }) : '');
          } else ringRed.setAttribute('d', '');
          void pk;
          labels.update(lt, t, cues);

          if (kas) {
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const oo = { x: K.x * W, y: H * K.y, face: faceOf(s.face ?? K.face, 1), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
            if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
            kas.update(t, s.pose || 'idle', oo);
          }
        },
      };
    },
  };
})();
