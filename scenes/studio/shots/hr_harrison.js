// hr_harrison: John Harrison and the longitude problem in parchment ink (theme "parchment", BRAND.md §3, §5).
// Every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random. Uses
// window.MCB (mcB__lib.js) for cast, labels and the camera push. 16:9 first (long video), works in 9:16.
//
// SHOTS.hr_clock P: {mode, x: 0.5, y: 0.5 (centre of the main object, 0..1 W/H), size: 1,
//   cast: [MCB cast entries], labels: [MCB label entries], cam: {zoom: 1.05, focus: [0.5, 0.55]}, shake: [cue...]}
//   mode "h1":       Harrison's H1 sea clock: brass frame, two dumbbell balances swinging against each other, linked by
//                    springs, four small dials, a big turning wheel. P.rock: deg (the clock rocks like on a ship), P.sea: true
//                    (wave band under it).
//   mode "h4":       a big pocket watch (H4): gold case, bow and crown, enamel dial, hands, a second hand that ticks 5 times
//                    a second. P.r: 250 (radius px), P.ghost: {at} (dashed outline of the big H1 box behind it: size contrast),
//                    P.slow: {at, text: "-5 sn"} (red arc on the dial from the 12 back 5 seconds + label).
//   mode "longcase": a wooden pendulum clock with wooden wheels showing through a window. P.sea: {at} (from that cue the
//                    case rolls on waves, the pendulum swings wildly, hands race and stall), P.marks: {at} (red "?" marks).
//   mode "earth":    a turning globe (meridians scroll), the sun on the left with rays, a small clock; P.wedge: {at, text: "15°"}
//                    (one hour's slice of the globe fills red), P.clock: {x: 0.8, y: 0.3, r: 120, at (hand turns one hour)}.
//   mode "noon":     left: a ship on the sea with the noon sun overhead (P.sun_at); right: a big "LONDRA" clock whose
//                    hands turn from 12 to 1 on P.turn (cue); P.result: {at, text: "15° batı"} badge.
//   mode "bimetal":  a two-metal strip clamped on the left (gold brass over ink-soft steel); P.hot: cue (flame under it,
//                    the strip bends down), P.cold: cue (frost, bends up), P.fix: cue (a second strip cancels the bend).
//   mode "lunar":    night sky strip (stars), the moon and a bright star; an observer (cast[0]) at the bottom left; dashed
//                    sight lines from his eye to the moon and the star, an angle arc on P.angle (cue), a table book on P.book.
//   mode "gps":      the curve of the Earth at the bottom, satellites with tiny clock faces orbiting; signal rings run
//                    from each to a red pin on the ground on P.ping (cue).
//   mode "quadrant": a ship's deck and the sea; the sun (P.sun [x, y]) grows on P.sun_at; a navigator (cast) stands
//                    with his back to it holding a Davis quadrant (backstaff) at P.nav [x, y] (P.nav_scale); a gold sun
//                    ray reaches the quadrant's vane on P.beam (cue).
//   P.cover_hide: true hides this shot's own cast in the thumbnail (the cover draws its own big Kaşif).
// cues: hit (punch), the cues named above, cast / label "at" names.
//
// SHOTS.hr_scilly — the 1707 Scilly wreck: SHOTS.pv_sea (night, tall sailing ships) + jagged ink rocks in the water,
//   slanting rain and spray bursts when a ship strikes. P: everything pv_sea takes (ships use "stop" for the strike) +
//   rocks: [{x: 0.6, y: 0.62 (waterline), w: 0.16, h: 0.1, at (drawn in on cue)}], rain: true, spray: [{x, y, at}],
//   fog: {at, n: 5} (drifting fog bands drawn as hatching).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const TAU = Math.PI * 2;
  const f1 = v => Math.round(v * 10) / 10;
  const at = (cues, v, fb) => typeof v === 'number' ? v : (v != null && cues && cues[v] != null) ? cues[v] : fb;
  const rot = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; };
  const ell = (cx, cy, r, n = 14) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const FR = 'Fraunces, Georgia, serif';

  // a set of boiling ink paths: P(parent, colour) -> setter(pts, opts)
  function pen(parent, col = INK.ink, extra = {}) {
    const e = inkEl(parent, col, extra);
    return (pts, o = {}) => e.setAttribute('d', pts && pts.length > 1 ? inkPath(pts, o) : '');
  }
  function fill(parent, col, extra = {}) {
    const e = inkEl(parent, col, extra);
    return (pts, o = {}) => e.setAttribute('d', pts && pts.length > 2 ? inkLoop(pts, o) : '');
  }
  function text(parent, s, size, col = INK.ink, font = INK_FONT, weight = 400) {
    const tx = el(parent, 'text', { 'font-family': font, 'font-size': size, 'font-weight': weight, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: col });
    tx.textContent = s; return tx;
  }
  // clock face helper: ring + ticks + hands; returns update(t, hourAngle, minAngle, secAngle|null)
  function clockFace(g, cx, cy, r, sd, o = {}) {
    const case_ = o.gold ? fill(g, o.caseCol || INK.gold) : null, disc = fill(g, o.face || INK.paperLight), inner = o.ring ? pen(g, INK.inkSoft) : null;
    const ring = pen(g), ring2 = pen(g, INK.inkSoft), ticks = pen(g), hh = pen(g), mh = pen(g), sh = pen(g, INK.red), hub = fill(g, INK.ink);
    return (t, ha, ma, sa) => {
      if (case_) case_(ell(cx, cy, r * 1.12, 18), { seed: sd, t, amp: 1 });
      disc(ell(cx, cy, r, 18), { seed: sd + 1, t, amp: 1 });
      ring(ell(cx, cy, r, 18), { w: 6, seed: sd + 2, t, closed: true });
      if (case_) ring2(ell(cx, cy, r * 1.12, 18), { w: 5, seed: sd + 3, t, closed: true });
      if (inner) inner(ell(cx, cy, r * 0.6, 16), { w: 3, seed: sd + 8, t, closed: true, amp: 0.8 });
      // ticks as one path string
      let d = '';
      const n = o.minutes ? 60 : 12;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU, big = o.minutes ? i % 5 === 0 : true;
        const r0 = r * (big ? 0.78 : 0.86), r1 = r * 0.93;
        d += inkPath([[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * r1, cy - Math.cos(a) * r1]], { w: big ? Math.max(4, r * 0.035) : 2.5, seed: sd + 10 + i, t, amp: 0.6 }) + ' ';
      }
      g.__tk = g.__tk || inkEl(g, INK.ink); g.__tk.setAttribute('d', d);
      const hand = (a, len, w, s) => [[cx - Math.sin(a) * len * 0.12, cy + Math.cos(a) * len * 0.12], [cx + Math.sin(a) * len, cy - Math.cos(a) * len]];
      hh(hand(ha, r * 0.5, 0, 0), { w: Math.max(8, r * 0.07), seed: sd + 4, t, amp: 0.8, taper: 0.5 });
      mh(hand(ma, r * 0.74, 0, 0), { w: Math.max(6, r * 0.045), seed: sd + 5, t, amp: 0.8, taper: 0.5 });
      if (sa != null) sh(hand(sa, r * 0.82, 0, 0), { w: Math.max(3, r * 0.022), seed: sd + 6, t, amp: 0.5 }); else sh(null);
      hub(ell(cx, cy, Math.max(7, r * 0.06), 8), { seed: sd + 7, t, amp: 0.4 });
    };
  }

  SH.hr_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, mode = P.mode || 'h4';
      const g = el(svg, 'g'), back = el(g, 'g'), mid = el(g, 'g'), front = el(g, 'g'), lab = el(g, 'g');
      const S = (P.size ?? 1) * Math.min(W, H) / 1080;
      const cx = (P.x ?? 0.5) * W, cy = (P.y ?? 0.5) * H;
      const sd = seed * 97;
      const castLayer = el(g, 'g');
      const cast = M.cast(castLayer, P.cast || [], W, H, sd + 300);
      const labels = M.labels(lab, P.labels || [], W, H, sd + 500);
      let upd = () => {};

      if (mode === 'h1') {
        const sea = P.sea ? M.sea(back, W, H, H * 0.8, sd + 1, { hatch: 14 }) : null;
        const body = el(mid, 'g');
        const frameF = fill(body, INK.paperLight), frame = pen(body), posts = pen(body, INK.inkSoft), base = fill(body, INK.paperDark), baseL = pen(body);
        const wheelF = fill(body, INK.gold, { 'fill-opacity': 0.55 }), wheel = pen(body), spokes = pen(body);
        const bars = [0, 1].map(() => ({ bar: pen(body), b1: fill(body, INK.gold), b2: fill(body, INK.gold), o1: pen(body), o2: pen(body), piv: fill(body, INK.ink) }));
        const spring = [pen(body, INK.inkSoft), pen(body, INK.inkSoft)];
        const dialG = [[-0.5, 0.18], [0.5, 0.18], [-0.5, 0.58], [0.5, 0.58]].map((q, i) => { const gg = el(body, 'g'); return { gg, f: clockFace(gg, 0, 0, 62 * S, sd + 40 + i * 9), q }; });
        const w2 = 300 * S, h2 = 330 * S;
        upd = (lt, t, cues, hit) => {
          if (sea) sea.update(lt);
          const rk = (P.rock || 0) * Math.sin(lt * 1.3) * Math.PI / 180;
          body.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${(rk * 180 / Math.PI).toFixed(2)}) scale(${(1 + 0.06 * hit).toFixed(3)})`);
          base(rect(-w2 - 30 * S, h2, 2 * w2 + 60 * S, 46 * S), { seed: sd + 2, t: lt });
          baseL(rect(-w2 - 30 * S, h2, 2 * w2 + 60 * S, 46 * S).concat([[-w2 - 30 * S, h2]]), { w: 6, seed: sd + 3, t: lt, smooth: false });
          frameF(rect(-w2, -h2 * 0.15, 2 * w2, h2 * 1.15), { seed: sd + 4, t: lt, smooth: false });
          frame(rect(-w2, -h2 * 0.15, 2 * w2, h2 * 1.15), { w: 7, seed: sd + 5, t: lt, closed: true, smooth: false });
          posts([[-w2, -h2 * 0.15], [-w2 * 0.8, -h2 * 0.95], [w2 * 0.8, -h2 * 0.95], [w2, -h2 * 0.15]], { w: 6, seed: sd + 6, t: lt, smooth: false });
          // big wheel behind the dials
          const wa = lt * 0.6;
          wheelF(ell(0, h2 * 0.36, 150 * S, 20), { seed: sd + 7, t: lt, amp: 1 });
          let teeth = [];
          for (let i = 0; i < 28; i++) { const a = wa + i / 28 * TAU; teeth.push([Math.cos(a) * 150 * S, h2 * 0.36 + Math.sin(a) * 150 * S], [Math.cos(a + 0.06) * 166 * S, h2 * 0.36 + Math.sin(a + 0.06) * 166 * S], [Math.cos(a + 0.16) * 166 * S, h2 * 0.36 + Math.sin(a + 0.16) * 166 * S], [Math.cos(a + 0.22) * 150 * S, h2 * 0.36 + Math.sin(a + 0.22) * 150 * S]); }
          wheel(teeth, { w: 4, seed: sd + 8, t: lt, closed: true, smooth: false, amp: 0.8 });
          let sp = '';
          for (let i = 0; i < 4; i++) { const a = wa + i / 4 * TAU; sp += inkPath([[0, h2 * 0.36], [Math.cos(a) * 140 * S, h2 * 0.36 + Math.sin(a) * 140 * S]], { w: 5, seed: sd + 9 + i, t: lt }) + ' '; }
          spokes.__s = sp; body.__sp = body.__sp || inkEl(body, INK.ink); body.__sp.setAttribute('d', sp);
          // two balances (they swing against each other)
          const sw = Math.sin(lt * TAU * 0.9) * 0.42;
          bars.forEach((b, i) => {
            const px = (i ? 1 : -1) * w2 * 0.42, py = -h2 * 0.62, a = (i ? -sw : sw) + (i ? -0.5 : 0.5);
            const L = 210 * S;
            const e1 = [px + Math.cos(a) * L, py + Math.sin(a) * L], e2 = [px - Math.cos(a) * L, py - Math.sin(a) * L];
            b.bar([e2, e1], { w: 10 * S + 2, seed: sd + 20 + i, t: lt });
            b.b1(ell(e1[0], e1[1], 40 * S, 12), { seed: sd + 22 + i, t: lt, amp: 1 });
            b.b2(ell(e2[0], e2[1], 40 * S, 12), { seed: sd + 24 + i, t: lt, amp: 1 });
            b.o1(ell(e1[0], e1[1], 40 * S, 12), { w: 5, seed: sd + 26 + i, t: lt, closed: true });
            b.o2(ell(e2[0], e2[1], 40 * S, 12), { w: 5, seed: sd + 28 + i, t: lt, closed: true });
            b.piv(ell(px, py, 12 * S, 8), { seed: sd + 30 + i, t: lt, amp: 0.5 });
            b._top = i ? e2 : e1;
          });
          // springs between the upper ends (zig-zag)
          const A = bars[0]._top, B = bars[1]._top;
          [0, 1].forEach(k => {
            const pts = [], n = 9, oy = k ? 26 * S : -10 * S;
            for (let j = 0; j <= n; j++) { const u = j / n; pts.push([lerp(A[0], B[0], u), lerp(A[1], B[1], u) + oy + (j % 2 ? 14 : -14) * S * (j && j < n ? 1 : 0)]); }
            spring[k](pts, { w: 3.5, seed: sd + 34 + k, t: lt, smooth: false, amp: 0.8 });
          });
          dialG.forEach((d, i) => {
            d.gg.setAttribute('transform', `translate(${f1(d.q[0] * w2 * 0.9)} ${f1(d.q[1] * h2 + 30 * S)})`);
            const sp2 = lt * (0.4 + i * 0.3);
            d.f(lt, sp2 * 0.08 + i, sp2, null);
          });
        };
      } else if (mode === 'h4') {
        const R = (P.r ?? 250) * S;
        const ghost = P.ghost ? pen(back, INK.inkSoft) : null, ghostF = P.ghost ? fill(back, INK.paperDark, { 'fill-opacity': 0.35 }) : null;
        const body = el(mid, 'g');
        const bow = pen(body), crown = fill(body, INK.gold), crownL = pen(body);
        const face = clockFace(body, 0, 0, R, sd + 5, { gold: true, minutes: true, ring: !P.plain, caseCol: P.case === 'dark' ? INK.paperDark : INK.gold });
        const orn = pen(body, INK.inkSoft);
        const slowArc = P.slow ? pen(body, INK.red) : null;
        upd = (lt, t, cues, hit) => {
          const sw = Math.sin(lt * 1.1) * 2.2;
          body.setAttribute('transform', `translate(${f1(cx)} ${f1(cy + Math.sin(lt * 1.4) * 6)}) rotate(${sw.toFixed(2)}) scale(${(spring(lt, 0, 0.7) * (1 + 0.07 * hit)).toFixed(3)})`);
          if (ghost) {
            const ga = at(cues, P.ghost.at, 0.4), gp = prog(lt, ga, 0.9);
            const gx = (P.ghost.x ?? 0.28) * W, gy = (P.ghost.y ?? 0.56) * H, k = (P.ghost.size ?? 1) * S;
            const dash = (A, B) => { let d = ''; for (let i = 0; i < 9; i++) { const u0 = i / 9, u1 = (i + 0.55) / 9; if (u0 > gp) break; d += inkPath([[lerp(A[0], B[0], u0), lerp(A[1], B[1], u0)], [lerp(A[0], B[0], Math.min(u1, gp)), lerp(A[1], B[1], Math.min(u1, gp))]], { w: 5, seed: sd + 100 + i + Math.round(A[0]), t: lt, amp: 0.8 }) + ' '; } return d; };
            const bw = 330 * k, bt = gy - 160 * k, bb = gy + 330 * k;
            const C = [[gx - bw, bt], [gx + bw, bt], [gx + bw, bb], [gx - bw, bb]];
            let d = dash(C[0], C[1]) + dash(C[1], C[2]) + dash(C[2], C[3]) + dash(C[3], C[0]);
            const sw = Math.sin(lt * TAU * 0.9) * 0.3;
            [[-1, sw], [1, -sw]].forEach(([q, a0]) => {
              const px = gx + q * bw * 0.42, py = bt - 120 * k, a = a0 + q * 0.45, L = 200 * k;
              const e1 = [px + Math.cos(a) * L, py + Math.sin(a) * L], e2 = [px - Math.cos(a) * L, py - Math.sin(a) * L];
              d += dash(e2, e1);
              if (gp > 0.6) d += inkPath(inkEllipsePts(e1[0], e1[1], 58 * k, 58 * k, sd + 7, 12), { w: 5, seed: sd + 8, t: lt, closed: true }) + ' ' + inkPath(inkEllipsePts(e2[0], e2[1], 58 * k, 58 * k, sd + 9, 12), { w: 5, seed: sd + 10, t: lt, closed: true }) + ' ';
            });
            back.__g = back.__g || inkEl(back, INK.inkSoft); back.__g.setAttribute('d', d);
            ghost(null); ghostF(null);
          }
          bow(ell(0, -R * 1.3, R * 0.16, 12).map(p => [p[0], p[1] - 4]), { w: 8, seed: sd + 3, t: lt, closed: true });
          crown(rect(-R * 0.09, -R * 1.22, R * 0.18, R * 0.12), { seed: sd + 4, t: lt, smooth: false });
          crownL(rect(-R * 0.09, -R * 1.22, R * 0.18, R * 0.12).concat([[-R * 0.09, -R * 1.22]]), { w: 5, seed: sd + 6, t: lt, smooth: false });
          const sec = Math.floor(lt * 5) / 5 + (P.sec0 ?? 20);
          face(lt, ((P.h ?? 10) + (P.m ?? 9) / 60) / 12 * TAU, (P.m ?? 9) / 60 * TAU + lt * 0.02, sec / 60 * TAU);
          if (slowArc) {
            const sa = at(cues, P.slow.at, 1), p = prog(lt, sa, 0.7);
            const pts = []; for (let i = 0; i <= 10; i++) { const a = -i / 10 * (5 / 60) * TAU * p; pts.push([Math.sin(a) * R * 0.66, -Math.cos(a) * R * 0.66]); }
            slowArc(p > 0.02 ? pts : null, { w: 12, seed: sd + 9, t: lt });
          }
        };
      } else if (mode === 'longcase') {
        const sea = P.sea ? M.sea(front, W, H, H * 0.84, sd + 1, { hatch: 16, dark: true }) : null;
        const body = el(mid, 'g');
        const caseF = fill(body, INK.paperDark), caseL = pen(body), grain = pen(body, INK.stain), win = fill(body, INK.paperLight), winL = pen(body);
        const pend = pen(body), bob = fill(body, INK.stain), bobL = pen(body);
        const wheels = [0, 1, 2].map(() => ({ f: fill(body, INK.stain, { 'fill-opacity': 0.8 }), l: pen(body) }));
        const faceG = el(body, 'g'); const face = clockFace(faceG, 0, 0, 105 * S, sd + 7);
        const marks = P.marks ? [0, 1].map(() => text(lab, '?', 150 * S, INK.red, FR, 900)) : [];
        const cw = 230 * S, ch = 860 * S, top = -ch;
        upd = (lt, t, cues, hit) => {
          const sa = P.sea ? at(cues, P.sea.at, 0) : 1e9, on = lt >= sa ? prog(lt, sa, 0.8) : 0;
          if (sea) sea.update(lt);
          const roll = on * (Math.sin((lt - sa) * 1.9) * 9 + Math.sin((lt - sa) * 3.3) * 3);
          body.setAttribute('transform', `translate(${f1(cx)} ${f1(cy + H * 0.36 + on * Math.sin(lt * 2.1) * 16)}) rotate(${roll.toFixed(2)}) scale(${(1 + 0.05 * hit).toFixed(3)})`);
          const shape = [[-cw / 2, 0], [-cw / 2, top + 300 * S], [-cw / 2 - 30 * S, top + 280 * S], [-cw / 2 - 30 * S, top], [cw / 2 + 30 * S, top], [cw / 2 + 30 * S, top + 280 * S], [cw / 2, top + 300 * S], [cw / 2, 0]];
          caseF(shape, { seed: sd + 2, t: lt, smooth: false });
          caseL(shape.concat([shape[0]]), { w: 7, seed: sd + 3, t: lt, smooth: false });
          let gr = ''; for (let i = 0; i < 5; i++) gr += inkPath([[-cw * 0.35 + i * cw * 0.17, -20 * S], [-cw * 0.33 + i * cw * 0.17, top + 330 * S]], { w: 3, seed: sd + 20 + i, t: lt }) + ' ';
          body.__gr = body.__gr || inkEl(body, INK.stain); body.__gr.setAttribute('d', gr);
          // pendulum window + pendulum (swing; wild at sea)
          const wy0 = top + 330 * S, wh = 470 * S;
          win(rect(-cw * 0.34, wy0, cw * 0.68, wh), { seed: sd + 4, t: lt, smooth: false });
          winL(rect(-cw * 0.34, wy0, cw * 0.68, wh).concat([[-cw * 0.34, wy0]]), { w: 5, seed: sd + 5, t: lt, smooth: false });
          const base = Math.sin(lt * TAU * 0.5) * 0.16;
          const wild = on * (Math.sin(lt * 4.3) * 0.25 + Math.sin(lt * 7.1) * 0.12);
          const a = base * (1 - on * 0.5) + wild - roll * Math.PI / 180;
          const px = 0, py = wy0 + 6 * S, L = wh - 80 * S;
          const ex = px + Math.sin(a) * L, ey = py + Math.cos(a) * L;
          pend([[px, py], [ex, ey]], { w: 5, seed: sd + 6, t: lt });
          bob(ell(ex, ey, 42 * S, 12), { seed: sd + 8, t: lt });
          bobL(ell(ex, ey, 42 * S, 12), { w: 5, seed: sd + 9, t: lt, closed: true });
          // wooden wheels in the hood around the dial
          wheels.forEach((w, i) => {
            const r = (60 - i * 14) * S, wx = (i - 1) * 86 * S, wy = top + 230 * S + (i % 2) * 20 * S, ang = lt * (i % 2 ? -0.9 : 0.7);
            const tt = []; for (let k = 0; k < 16; k++) { const q = ang + k / 16 * TAU; tt.push([wx + Math.cos(q) * r, wy + Math.sin(q) * r], [wx + Math.cos(q + 0.12) * r * 1.16, wy + Math.sin(q + 0.12) * r * 1.16], [wx + Math.cos(q + 0.27) * r * 1.16, wy + Math.sin(q + 0.27) * r * 1.16], [wx + Math.cos(q + 0.39) * r, wy + Math.sin(q + 0.39) * r]); }
            w.f(tt, { seed: sd + 30 + i, t: lt, smooth: false, amp: 0.8 });
            w.l(tt, { w: 3.5, seed: sd + 33 + i, t: lt, closed: true, smooth: false, amp: 0.8 });
          });
          faceG.setAttribute('transform', `translate(0 ${f1(top + 120 * S)})`);
          const race = on * (lt - sa) * 6;
          face(lt, (lt * 0.05 + race * 0.1 + 1.2), lt * 0.6 + race, null);
          marks.forEach((m, i) => {
            const ma = at(cues, P.marks.at, 1) + i * 0.4, p = spring(lt, ma, 0.5);
            m.setAttribute('x', f1(cx + (i ? 1 : -1) * 260 * S)); m.setAttribute('y', f1(cy - 120 * S + i * 90 * S));
            m.setAttribute('transform', `rotate(${i ? 10 : -12} ${f1(cx + (i ? 1 : -1) * 260 * S)} ${f1(cy)})`);
            m.style.display = lt < ma ? 'none' : ''; m.setAttribute('font-size', f1(150 * S * Math.max(0.01, p)));
          });
        };
      } else if (mode === 'earth') {
        const R = (P.r ?? 300) * S;
        const rays = pen(back, INK.gold), sunF = fill(back, INK.gold), sunL = pen(back);
        const globeF = fill(mid, INK.paperLight), wedgeF = fill(mid, INK.red, { 'fill-opacity': 0.55 }), merid = inkEl(mid, INK.inkSoft), globeL = pen(mid), eq = pen(mid, INK.inkSoft), shadow = fill(mid, INK.paperDark, { 'fill-opacity': 0.6 });
        const land = [0, 1, 2].map(() => fill(mid, INK.green, { 'fill-opacity': 0.6 }));
        const wl = P.wedge ? text(lab, P.wedge.text || '15°', 96 * S, INK.red, FR, 900) : null;
        const ck = P.clock || null, ckG = ck ? el(front, 'g') : null, ckF = ck ? clockFace(ckG, 0, 0, (ck.r ?? 120) * S, sd + 60) : null;
        upd = (lt, t, cues, hit) => {
          const sx = cx - R * 1.9, sy = cy - R * 0.2;
          sunF(ell(sx, sy, 80 * S, 14), { seed: sd + 1, t: lt });
          sunL(ell(sx, sy, 80 * S, 14), { w: 6, seed: sd + 2, t: lt, closed: true });
          let rd = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + lt * 0.2, r0 = 100 * S, r1 = (130 + 14 * Math.sin(lt * 3 + i)) * S; rd += inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], { w: 6, seed: sd + 3 + i, t: lt }) + ' '; }
          back.__r = back.__r || inkEl(back, INK.gold); back.__r.setAttribute('d', rd);
          const gx = cx, gy = cy, sc = 1 + 0.05 * hit;
          mid.setAttribute('transform', `translate(${f1(gx)} ${f1(gy)}) scale(${sc.toFixed(3)}) translate(${f1(-gx)} ${f1(-gy)})`);
          globeF(ell(gx, gy, R, 24), { seed: sd + 5, t: lt, amp: 1 });
          const spin = lt * 0.35;
          // land blobs on the sphere (move with the spin, hidden on the far side)
          [[0.4, -0.3, 0.5], [2.4, 0.2, 0.6], [4.2, -0.1, 0.45]].forEach(([lon, lat, s], i) => {
            const l = lon + spin, c = Math.cos(l);
            if (c < 0.1) { land[i](null); return; }
            const x0 = gx + Math.sin(l) * R * Math.cos(lat), y0 = gy + Math.sin(lat) * R;
            const pts = ell(0, 0, 1, 9).map(([u, v]) => [x0 + u * R * 0.3 * s * c, y0 + v * R * 0.24 * s]);
            land[i](pts, { seed: sd + 70 + i, t: lt });
          });
          let md = '';
          for (let k = 0; k < 12; k++) {
            const l = k / 12 * TAU + spin, c = Math.cos(l);
            if (c < 0) continue;
            const pts = []; for (let j = 0; j <= 10; j++) { const la = -Math.PI / 2 + j / 10 * Math.PI; pts.push([gx + Math.sin(l) * R * Math.cos(la), gy + Math.sin(la) * R]); }
            md += inkPath(pts, { w: 3, seed: sd + 10 + k, t: lt, amp: 0.8 }) + ' ';
          }
          merid.setAttribute('d', md);
          if (P.wedge) {
            const wa = at(cues, P.wedge.at, 1), p = prog(lt, wa, 0.8);
            const l0 = -0.5, l1 = l0 + (TAU / 24) * p * 1.0;   // 15° = 1/24 of a turn
            if (p > 0.01) {
              const pts = [];
              for (let j = 0; j <= 10; j++) { const la = -Math.PI / 2 + j / 10 * Math.PI; pts.push([gx + Math.sin(l0) * R * Math.cos(la), gy + Math.sin(la) * R]); }
              for (let j = 10; j >= 0; j--) { const la = -Math.PI / 2 + j / 10 * Math.PI; pts.push([gx + Math.sin(l1 - 0.0) * R * Math.cos(la) + 0, gy + Math.sin(la) * R]); }
              wedgeF(pts, { seed: sd + 40, t: lt, amp: 0.8 });
            } else wedgeF(null);
            wl.setAttribute('x', f1(gx + R * 0.05)); wl.setAttribute('y', f1(gy - R - 70 * S));
            wl.style.display = p > 0.05 ? '' : 'none';
          }
          { const sp = []; for (let j = 0; j <= 16; j++) { const la = -Math.PI / 2 + j / 16 * Math.PI; sp.push([gx + R * Math.cos(la), gy + R * Math.sin(la)]); }
            for (let j = 16; j >= 0; j--) { const la = -Math.PI / 2 + j / 16 * Math.PI; sp.push([gx + R * 0.55 * Math.cos(la), gy + R * Math.sin(la)]); }
            shadow(sp, { seed: sd + 41, t: lt, amp: 0.6 }); }
          eq([[gx - R, gy], [gx - R * 0.5, gy + R * 0.04], [gx, gy + R * 0.05], [gx + R * 0.5, gy + R * 0.04], [gx + R, gy]], { w: 3, seed: sd + 42, t: lt });
          globeL(ell(gx, gy, R, 24), { w: 7, seed: sd + 43, t: lt, closed: true });
          if (ckF) {
            ckG.setAttribute('transform', `translate(${f1((ck.x ?? 0.82) * W)} ${f1((ck.y ?? 0.3) * H)}) scale(${spring(lt, 0.2, 0.6).toFixed(3)})`);
            const ca = at(cues, ck.at, 1), p = progIO(lt, ca, 1.6);
            ckF(lt, (12 + p) / 12 * TAU, p * TAU, null);
          }
        };
      } else if (mode === 'noon') {
        const seaY = H * 0.68;
        const sea = M.sea(back, W, H, seaY, sd + 1, { hatch: 12, bottom: H * 0.86 });
        const sunF = fill(back, INK.gold), sunL = pen(back), rays = inkEl(back, INK.gold);
        const hull = fill(mid, INK.paperDark), hullL = pen(mid), masts = inkEl(mid, INK.ink), sails = [0, 1, 2].map(() => fill(mid, INK.paperLight)), sailL = inkEl(mid, INK.ink);
        const ckx = (P.clock_x ?? 0.72) * W, cky = H * 0.44, cr = 210 * S;
        const ckG = el(front, 'g'), ck = clockFace(ckG, ckx, cky, cr, sd + 30, { minutes: true });
        const plateF = fill(front, INK.paperLight), plateL = pen(front);
        const plate = text(front, P.clock_label || 'LONDRA', 60 * S, INK.ink, FR, 900);
        const sunLab = text(lab, P.sun_label || 'öğle', 64 * S, INK.ink);
        const resF = P.result ? fill(lab, INK.red) : null;
        const res = P.result ? text(lab, P.result.text || '15° batı', 84 * S, INK.paperLight, FR, 900) : null;
        upd = (lt, t, cues, hit) => {
          sea.update(lt);
          const shx = W * 0.27, bobY = Math.sin(lt * 1.6) * 10, tilt = Math.sin(lt * 1.2) * 4.5;
          const sa = at(cues, P.sun_at, 0.3), sp = prog(lt, sa, 1.2);
          const sx = shx + W * 0.04, sy = lerp(H * 0.62, H * 0.27, sp);
          sunF(ell(sx, sy, 62 * S, 14), { seed: sd + 2, t: lt });
          sunL(ell(sx, sy, 62 * S, 14), { w: 6, seed: sd + 3, t: lt, closed: true });
          let rd = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + lt * 0.3, r0 = 82 * S, r1 = (108 + 12 * Math.sin(lt * 3 + i)) * S; rd += inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], { w: 5, seed: sd + 4 + i, t: lt }) + ' '; }
          rays.setAttribute('d', rd);
          sunLab.setAttribute('x', f1(sx + 150 * S)); sunLab.setAttribute('y', f1(sy)); sunLab.style.display = sp > 0.8 ? '' : 'none';
          // ship
          mid.setAttribute('transform', `translate(0 ${f1(bobY)}) rotate(${tilt.toFixed(2)} ${f1(shx)} ${f1(seaY)})`);
          const hw = 230 * S;
          const hp = [[shx - hw * 1.02, seaY - 96 * S], [shx - hw * 0.6, seaY - 66 * S], [shx, seaY - 60 * S], [shx + hw * 0.7, seaY - 66 * S], [shx + hw * 1.12, seaY - 92 * S], [shx + hw * 0.86, seaY + 10 * S], [shx + hw * 0.4, seaY + 28 * S], [shx - hw * 0.5, seaY + 26 * S], [shx - hw * 0.86, seaY + 6 * S]];
          hull(hp, { seed: sd + 20, t: lt }); hullL(hp, { w: 6, seed: sd + 21, t: lt, closed: true });
          mid.__gp = mid.__gp || inkEl(mid, INK.ink); { let gd = ''; for (let k = 0; k < 5; k++) gd += inkDot(shx - hw * 0.5 + k * hw * 0.25, seaY - 24 * S, 9 * S, 7 * S, sd + 90 + k, lt) + ' '; mid.__gp.setAttribute('d', gd); }
          let md = '', sl = '';
          [-0.5, 0, 0.5].forEach((q, i) => {
            const mx = shx + q * hw * 1.2, mt = seaY - (300 + (i === 1 ? 50 : 0)) * S;
            md += inkPath([[mx, seaY - 66 * S], [mx, mt]], { w: 6, seed: sd + 22 + i, t: lt }) + ' ';
            const sw = 70 * S, bil = Math.sin(lt * 1.5 + i) * 6 * S;
            const s1 = [[mx - sw, mt + 30 * S], [mx, mt + 22 * S], [mx + sw, mt + 30 * S], [mx + sw * 0.95 + bil * 2, mt + 92 * S], [mx + sw * 0.85 + bil, mt + 150 * S], [mx, mt + 162 * S + bil], [mx - sw * 0.85 + bil, mt + 150 * S], [mx - sw * 0.95 + bil * 2, mt + 92 * S]];
            sails[i](s1, { seed: sd + 25 + i, t: lt });
            sl += inkPath(s1, { w: 4, seed: sd + 28 + i, t: lt, closed: true }) + ' ';
          });
          masts.setAttribute('d', md); sailL.setAttribute('d', sl);
          // London clock: 12 -> 1 on cue
          const ta = at(cues, P.turn, 1.5), p = progIO(lt, ta, 1.8);
          ckG.setAttribute('transform', `translate(${f1(ckx)} ${f1(cky)}) scale(${(spring(lt, 0.1, 0.6) * (1 + 0.06 * hit)).toFixed(3)}) translate(${f1(-ckx)} ${f1(-cky)})`);
          ck(lt, p / 12 * TAU, p * TAU, (Math.floor(lt * 2) / 2) / 60 * TAU * 6);
          const pw = 300 * S, ph = 86 * S, py = cky + cr + 70 * S;
          plateF(rect(ckx - pw / 2, py - ph / 2, pw, ph), { seed: sd + 40, t: lt, smooth: false });
          plateL(rect(ckx - pw / 2, py - ph / 2, pw, ph).concat([[ckx - pw / 2, py - ph / 2]]), { w: 5, seed: sd + 41, t: lt, smooth: false });
          plate.setAttribute('x', f1(ckx)); plate.setAttribute('y', f1(py));
          if (res) {
            const ra = at(cues, P.result.at, 3), rp = spring(lt, ra, 0.5);
            const bx = (P.result.x ?? 0.47) * W, by = (P.result.y ?? 0.2) * H, bw = 420 * S, bh = 120 * S;
            if (lt < ra) { resF(null); res.style.display = 'none'; }
            else {
              const k = Math.max(0.01, rp);
              resF(rect(bx - bw / 2 * k, by - bh / 2 * k, bw * k, bh * k), { seed: sd + 50, t: lt, smooth: false });
              res.style.display = ''; res.setAttribute('x', f1(bx)); res.setAttribute('y', f1(by)); res.setAttribute('font-size', f1(84 * S * k));
            }
          }
        };
      } else if (mode === 'bimetal') {
        const clampF = fill(mid, INK.paperDark), clampL = pen(mid), topF = fill(mid, INK.gold), botF = fill(mid, INK.inkSoft), outL = pen(mid);
        const flame = fill(front, INK.red), flameIn = fill(front, INK.gold), frost = inkEl(front, INK.blue);
        const t1 = text(lab, P.top_label || 'pirinç', 60 * S, INK.ink), t2 = text(lab, P.bot_label || 'çelik', 60 * S, INK.inkSoft);
        const L = 900 * S, th = 34 * S, x0 = cx - L / 2, y0 = cy;
        upd = (lt, t, cues, hit) => {
          const ha = at(cues, P.hot, null), ca = at(cues, P.cold, null), fa = at(cues, P.fix, null);
          let k = 0;
          if (ha != null) k += prog(lt, ha, 1.0) * 1;
          if (ca != null) k -= prog(lt, ca, 1.0) * 2;
          if (fa != null) k *= 1 - prog(lt, fa, 1.0);
          k += Math.sin(lt * 2.2) * 0.04;
          const curve = (off) => { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16, x = x0 + u * L; const b = k * 260 * S * u * u; const ang = Math.atan(2 * k * 260 * S * u / L); pts.push([x - Math.sin(ang) * off, y0 + b + Math.cos(ang) * off]); } return pts; };
          const a = curve(-th), m = curve(0), b = curve(th);
          topF(a.concat(m.slice().reverse()), { seed: sd + 1, t: lt, amp: 0.8, smooth: false });
          botF(m.concat(b.slice().reverse()), { seed: sd + 2, t: lt, amp: 0.8, smooth: false });
          outL(a.concat(b.slice().reverse()).concat([a[0]]), { w: 5, seed: sd + 3, t: lt, smooth: false });
          clampF(rect(x0 - 120 * S, y0 - 110 * S, 140 * S, 220 * S), { seed: sd + 4, t: lt, smooth: false });
          clampL(rect(x0 - 120 * S, y0 - 110 * S, 140 * S, 220 * S).concat([[x0 - 120 * S, y0 - 110 * S]]), { w: 6, seed: sd + 5, t: lt, smooth: false });
          t1.setAttribute('x', f1(x0 + L * 0.3)); t1.setAttribute('y', f1(y0 - th - 50 * S + k * 260 * S * 0.09));
          t2.setAttribute('x', f1(x0 + L * 0.3)); t2.setAttribute('y', f1(y0 + th + 54 * S + k * 260 * S * 0.09));
          if (ha != null && lt >= ha && (ca == null || lt < ca)) {
            const fx = x0 + L * 0.55, fy = y0 + 300 * S, fl = 1 + 0.15 * Math.sin(lt * 17);
            const f = [[fx - 60 * S, fy], [fx - 40 * S, fy - 90 * S * fl], [fx - 8 * S, fy - 60 * S], [fx + 6 * S, fy - 150 * S * fl], [fx + 34 * S, fy - 70 * S], [fx + 56 * S, fy - 100 * S * fl], [fx + 64 * S, fy]];
            flame(f, { seed: sd + 6, t: lt }); flameIn(f.map(([x, y]) => [fx + (x - fx) * 0.5, fy + (y - fy) * 0.55]), { seed: sd + 7, t: lt });
          } else { flame(null); flameIn(null); }
          if (ca != null && lt >= ca) {
            let d = ''; const fx = x0 + L * 0.6, fy = y0 - 300 * S;
            for (let i = 0; i < 3; i++) { const a2 = i / 3 * Math.PI + lt * 0.5; d += inkPath([[fx - Math.cos(a2) * 70 * S, fy - Math.sin(a2) * 70 * S], [fx + Math.cos(a2) * 70 * S, fy + Math.sin(a2) * 70 * S]], { w: 8, seed: sd + 8 + i, t: lt }) + ' '; }
            frost.setAttribute('d', d);
          } else frost.setAttribute('d', '');
          mid.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${(1 + 0.04 * hit).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy)})`);
        };
      } else if (mode === 'lunar') {
        const stars = inkEl(back, INK.ink), moonF = fill(back, INK.paperLight), moonL = pen(back), moonS = fill(back, INK.paperDark), starF = fill(back, INK.gold), starL = pen(back);
        const s1 = pen(mid, INK.blue), s2 = pen(mid, INK.blue), arc = pen(mid, INK.red);
        const arcT = text(lab, P.angle_text || 'açı', 72 * S, INK.red, FR, 900);
        const bookF = fill(front, INK.paperLight), bookL = pen(front), bookLines = inkEl(front, INK.inkSoft), bookT = text(front, P.book_text || 'TABLO', 52 * S, INK.ink, FR, 900);
        const r = rng(sd + 3), SP = Array.from({ length: 22 }, () => [r() * W, r() * H * 0.5 + H * 0.05, r()]);
        const mx = (P.moon || [0.3, 0.2])[0] * W, my = (P.moon || [0.3, 0.2])[1] * H, stx = (P.star || [0.78, 0.16])[0] * W, sty = (P.star || [0.78, 0.16])[1] * H;
        const eye = [(P.eye || [0.2, 0.55])[0] * W, (P.eye || [0.2, 0.55])[1] * H];
        upd = (lt, t, cues, hit) => {
          let d = ''; SP.forEach(([x, y, k], i) => { const tw = 0.6 + 0.4 * Math.sin(lt * (2 + k * 3) + i); d += inkDot(x, y, (4 + k * 5) * tw, null, sd + i, lt) + ' '; });
          stars.setAttribute('d', d);
          const mr = 95 * S;
          moonF(ell(mx, my, mr, 16), { seed: sd + 4, t: lt }); moonS(ell(mx + mr * 0.35, my, mr * 0.8, 14).map(([x, y]) => [Math.max(x, mx), y]), { seed: sd + 5, t: lt });
          moonL(ell(mx, my, mr, 16), { w: 6, seed: sd + 6, t: lt, closed: true });
          const sr = (34 + 4 * Math.sin(lt * 4)) * S, sp = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr2 = i % 2 ? sr * 0.45 : sr; sp.push([stx + Math.cos(a) * rr2, sty + Math.sin(a) * rr2]); }
          starF(sp, { seed: sd + 7, t: lt, smooth: false }); starL(sp.concat([sp[0]]), { w: 4, seed: sd + 8, t: lt, smooth: false });
          const la = at(cues, P.lines, 0.4), lp = prog(lt, la, 1.0);
          const dash = (A, B, p) => { const pts = []; const n = 14; let out = []; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 0.55) / n; if (u1 > p) break; out.push([[lerp(A[0], B[0], u0), lerp(A[1], B[1], u0)], [lerp(A[0], B[0], u1), lerp(A[1], B[1], u1)]]); } return out; };
          const segs1 = dash(eye, [mx, my + mr * 0.2], lp), segs2 = dash(eye, [stx, sty], lp);
          mid.__a = mid.__a || inkEl(mid, INK.blue);
          mid.__a.setAttribute('d', segs1.concat(segs2).map((sg, i) => inkPath(sg, { w: 6, seed: sd + 20 + i, t: lt, amp: 0.6 })).join(' '));
          const aa = at(cues, P.angle, 1.5), ap = prog(lt, aa, 0.8);
          const a1 = Math.atan2(my + mr * 0.2 - eye[1], mx - eye[0]), a2 = Math.atan2(sty - eye[1], stx - eye[0]), R2 = 260 * S;
          if (ap > 0.01) { const pts = []; for (let i = 0; i <= 12; i++) { const a = lerp(a1, lerp(a1, a2, ap), i / 12); pts.push([eye[0] + Math.cos(a) * R2, eye[1] + Math.sin(a) * R2]); } arc(pts, { w: 9, seed: sd + 9, t: lt }); }
          else arc(null);
          const am = (a1 + a2) / 2; arcT.setAttribute('x', f1(eye[0] + Math.cos(am) * (R2 + 90 * S))); arcT.setAttribute('y', f1(eye[1] + Math.sin(am) * (R2 + 90 * S))); arcT.style.display = ap > 0.6 ? '' : 'none';
          const ba = at(cues, P.book, null);
          if (ba != null && lt >= ba) {
            const bp = spring(lt, ba, 0.6), bx = (P.book_x ?? 0.74) * W, by = (P.book_y ?? 0.62) * H, bw = 360 * S * bp, bh = 250 * S * bp;
            const pg = [[bx - bw / 2, by - bh / 2], [bx, by - bh / 2 + 16 * S], [bx + bw / 2, by - bh / 2], [bx + bw / 2, by + bh / 2], [bx, by + bh / 2 + 16 * S], [bx - bw / 2, by + bh / 2]];
            bookF(pg, { seed: sd + 10, t: lt, smooth: false }); bookL(pg.concat([pg[0]]), { w: 6, seed: sd + 11, t: lt, smooth: false });
            let ld = ''; for (let i = 0; i < 4; i++) { const yy = by - bh * 0.05 + i * bh * 0.16; ld += inkPath([[bx - bw * 0.42, yy], [bx - bw * 0.08, yy]], { w: 3, seed: sd + 30 + i, t: lt }) + ' ' + inkPath([[bx + bw * 0.08, yy], [bx + bw * 0.42, yy]], { w: 3, seed: sd + 40 + i, t: lt }) + ' '; }
            bookLines.setAttribute('d', ld);
            bookT.style.display = ''; bookT.setAttribute('x', f1(bx)); bookT.setAttribute('y', f1(by - bh * 0.28)); bookT.setAttribute('font-size', f1(Math.max(1, 52 * S * bp)));
          } else { bookF(null); bookL(null); bookLines.setAttribute('d', ''); bookT.style.display = 'none'; }
        };
      } else if (mode === 'quadrant') {
        // a navigator with his back to the sun takes the sun's height with a Davis quadrant (backstaff)
        const seaY = H * 0.62;
        const sea = M.sea(back, W, H, seaY, sd + 1, { hatch: 14 });
        const sunF = fill(back, INK.gold), sunL = pen(back), rays = inkEl(back, INK.gold);
        const deckF = fill(mid, INK.paperDark), deckL = pen(mid), rail = inkEl(mid, INK.ink);
        const qd = el(front, 'g'), secB = fill(qd, INK.paperDark), secS = fill(qd, INK.paperDark), arcBig = pen(qd), arcSm = pen(qd), staff = pen(qd), vane = fill(qd, INK.ink);
        const beam = pen(front, INK.gold), spot = fill(front, INK.gold);
        const sx = (P.sun || [0.2, 0.2])[0] * W, sy = (P.sun || [0.2, 0.2])[1] * H;
        const nav = (P.nav || [0.62, 0.86]);
        upd = (lt, t, cues, hit) => {
          sea.update(lt);
          const sa = at(cues, P.sun_at, 0.2), sp = prog(lt, sa, 1);
          const r0 = 70 * S * (0.6 + 0.4 * sp);
          sunF(ell(sx, sy, r0, 14), { seed: sd + 2, t: lt }); sunL(ell(sx, sy, r0, 14), { w: 6, seed: sd + 3, t: lt, closed: true });
          let rd = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + lt * 0.3, q0 = r0 + 20 * S, q1 = r0 + (46 + 12 * Math.sin(lt * 3 + i)) * S; rd += inkPath([[sx + Math.cos(a) * q0, sy + Math.sin(a) * q0], [sx + Math.cos(a) * q1, sy + Math.sin(a) * q1]], { w: 5, seed: sd + 4 + i, t: lt }) + ' '; }
          rays.setAttribute('d', rd);
          const roll = Math.sin(lt * 1.1) * 1.5;
          mid.setAttribute('transform', `rotate(${roll.toFixed(2)} ${f1(W * 0.6)} ${f1(H)})`);
          const dy = H * 0.86, dk = [[W * 0.18, dy], [W * 1.05, dy - 20], [W * 1.05, H + 20], [W * 0.22, H + 20]];
          deckF(dk, { seed: sd + 20, t: lt, smooth: false }); deckL([[W * 0.16, dy - 70 * S], [W * 0.18, dy], [W * 1.05, dy - 20]], { w: 7, seed: sd + 21, t: lt, smooth: false });
          let rl = inkPath([[W * 0.16, dy - 70 * S], [W * 1.05, dy - 100 * S]], { w: 6, seed: sd + 22, t: lt }) + ' ';
          for (let i = 0; i < 9; i++) { const x = W * 0.2 + i * W * 0.1; rl += inkPath([[x, dy - 70 * S - (x - W * 0.16) * 0.035], [x, dy - (x - W * 0.18) * 0.024]], { w: 4, seed: sd + 23 + i, t: lt }) + ' '; }
          rail.setAttribute('d', rl);
          // the quadrant in front of the navigator's chest (rig units: chest ≈ 300 px * scale above the ground)
          const ns0 = P.nav_scale ?? 0.66, qx = nav[0] * W + 80 * ns0, qy = nav[1] * H - 330 * ns0, ns = ns0 * 1.7;
          qd.setAttribute('transform', `translate(${f1(qx)} ${f1(qy)}) rotate(${(-28 + Math.sin(lt * 1.3) * 2).toFixed(2)})`);
          const big = [], sm = []; for (let i = 0; i <= 8; i++) { const a = -0.5 + i / 8 * 0.5; big.push([Math.cos(a) * 170 * ns, Math.sin(a) * 170 * ns]); const b = -1.2 + i / 8 * 1.0; sm.push([-Math.cos(b) * 90 * ns, -Math.sin(b) * 90 * ns]); }
          secB([[0, 0]].concat(big), { seed: sd + 44, t: lt, smooth: false }); secS([[0, 0]].concat(sm), { seed: sd + 45, t: lt, smooth: false });
          arcBig([[0, 0]].concat(big, [[0, 0]]), { w: 7, seed: sd + 40, t: lt, smooth: false }); arcSm([[0, 0]].concat(sm, [[0, 0]]), { w: 7, seed: sd + 41, t: lt, smooth: false });
          staff([[-90 * ns, 0], [175 * ns, 0]], { w: 7, seed: sd + 42, t: lt });
          vane(ell(175 * ns, 0, 12 * ns, 8), { seed: sd + 43, t: lt });
          const ba = at(cues, P.beam, 1), bp = prog(lt, ba, 0.8);
          if (bp > 0.01) { const ex = lerp(sx, qx - 80 * ns, bp), ey = lerp(sy, qy + 10 * ns, bp); beam([[sx + r0, sy + r0 * 0.3], [ex, ey]], { w: 4, seed: sd + 50, t: lt }); spot(bp > 0.95 ? ell(qx - 80 * ns, qy + 10 * ns, 14 * ns, 8) : null, { seed: sd + 51, t: lt }); }
          else { beam(null); spot(null); }
        };
      } else if (mode === 'gps') {
        const earthF = fill(back, INK.paperLight), earthL = pen(back), landE = [0, 1, 2].map(() => fill(back, INK.green, { 'fill-opacity': 0.55 }));
        const orbit = pen(back, INK.inkSoft), sats = [0, 1, 2].map(i => ({ g: el(mid, 'g'), panel: fill(mid, INK.blue), panel2: fill(mid, INK.blue), panelL: pen(mid), body: fill(mid, INK.paperLight), bodyL: pen(mid) }));
        sats.forEach((s, i) => { s.face = clockFace(s.g, 0, 0, 70 * S, sd + 80 + i * 7); });
        const rings = inkEl(front, INK.red), pinF = fill(front, INK.red), pinL = pen(front);
        const ER = W * 1.1, ecx = W * 0.5, ecy = H * 0.78 + ER, OR = ER + H * 0.42;
        upd = (lt, t, cues, hit) => {
          const pts = []; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + (i / 30 - 0.5) * 1.3; pts.push([ecx + Math.cos(a) * ER, ecy + Math.sin(a) * ER]); }
          earthF(pts.concat([[W + 100, H + 100], [-100, H + 100]]), { seed: sd + 1, t: lt, smooth: false, amp: 1 });
          earthL(pts, { w: 7, seed: sd + 2, t: lt });
          [[0.18, 0.86, 220], [0.52, 0.84, 300], [0.84, 0.87, 200]].forEach(([u, v, w], i) => {
            const xx = u * W - lt * 6;
            landE[i](ell(0, 0, 1, 9).map(([a, b]) => [xx + a * w * S, v * H + b * 26 * S + 10 * S]), { seed: sd + 3 + i, t: lt });
          });
          const op = []; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + (i / 30 - 0.5) * 1.1; op.push([ecx + Math.cos(a) * OR, ecy + Math.sin(a) * OR]); }
          // dashed orbit
          let od = ''; for (let i = 0; i < 30; i += 2) od += inkPath([op[i], op[i + 1]], { w: 3, seed: sd + 10 + i, t: lt }) + ' ';
          back.__o = back.__o || inkEl(back, INK.inkSoft); back.__o.setAttribute('d', od);
          const pinX = (P.pin_x ?? 0.5) * W, pinY = ecy - Math.sqrt(ER * ER - (pinX - ecx) ** 2);
          const pa = at(cues, P.ping, 1);
          let rd = '';
          sats.forEach((s, i) => {
            const a = -Math.PI / 2 + (i - 1) * 0.22 + lt * 0.01;
            const sx = ecx + Math.cos(a) * OR, sy = ecy + Math.sin(a) * OR;
            const bob = Math.sin(lt * 1.3 + i) * 6;
            s.panel(rect(sx - 200 * S, sy - 30 * S + bob, 110 * S, 60 * S), { seed: sd + 20 + i, t: lt, smooth: false });
            s.panel2(rect(sx + 90 * S, sy - 30 * S + bob, 110 * S, 60 * S), { seed: sd + 23 + i, t: lt, smooth: false });
            s.panelL([[sx - 200 * S, sy + bob], [sx + 200 * S, sy + bob]], { w: 4, seed: sd + 26 + i, t: lt });
            s.g.setAttribute('transform', `translate(${f1(sx)} ${f1(sy + bob)})`);
            s.face(lt, lt * 0.1 + i, lt * 0.8 + i, (Math.floor(lt * 4) / 4) / 60 * TAU * 4);
            if (lt >= pa) {
              for (let k = 0; k < 4; k++) {
                const u = ((lt - pa) * 0.7 + k / 4) % 1, u2 = Math.min(1, u + 0.08);
                const ax = lerp(sx, pinX, u), ay = lerp(sy + 80 * S, pinY - 120 * S, u), bx = lerp(sx, pinX, u2), by = lerp(sy + 80 * S, pinY - 120 * S, u2);
                rd += inkPath([[ax, ay], [bx, by]], { w: 7, seed: sd + 40 + i * 4 + k, t: lt }) + ' ';
              }
            }
          });
          rings.setAttribute('d', rd);
          const pp = spring(lt, pa, 0.5);
          if (lt >= pa) {
            const pin = [[pinX, pinY], [pinX - 30 * S * pp, pinY - 60 * S * pp], [pinX - 30 * S * pp, pinY - 95 * S * pp], [pinX, pinY - 120 * S * pp], [pinX + 30 * S * pp, pinY - 95 * S * pp], [pinX + 30 * S * pp, pinY - 60 * S * pp]];
            pinF(pin, { seed: sd + 60, t: lt }); pinL(pin.concat([pin[0]]), { w: 5, seed: sd + 61, t: lt });
          } else { pinF(null); pinL(null); }
        };
      }

      return {
        update(lt, dur, cues, env) {
          const t = lt;
          const hit = punch(lt, cue(cues, 'hit', null));
          const sh = (P.shake || []).reduce((m, c) => Math.max(m, punch(lt, at(cues, c, null), 0.8)), 0);
          M.camPush(g, lt, dur, W, H, P.cam || {}, hit, sh);
          upd(lt, t, cues, hit);
          castLayer.style.display = lab.style.display = P.cover_hide && document.documentElement.classList.contains('cover') ? 'none' : '';
          cast.update(lt, lt, cues);
          labels.update(lt, lt, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------ hr_scilly: pv_sea at night + rocks, rain, spray
  SH.hr_scilly = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const base = SH.pv_sea.build(Object.assign({}, ctx, { P: Object.assign({ night: true, moon: false }, P) }));
      const sky = el(svg, 'g'); svg.insertBefore(sky, svg.children[1] || null);
      const skyF = inkEl(sky, INK.paperDark), skyH = inkEl(sky, INK.inkSoft, { 'fill-opacity': 0.9 });
      const over = el(svg, 'g');
      const sd = seed * 131;
      const fogs = P.fog ? Array.from({ length: P.fog.n ?? 5 }, () => inkEl(over, INK.inkSoft, { 'fill-opacity': 0.5 })) : [];
      const rocks = (P.rocks || []).map(() => ({ f: inkEl(over, INK.inkSoft), l: inkEl(over, INK.ink), foam: inkEl(over, INK.paperLight) }));
      const rain = P.rain !== false ? inkEl(over, INK.inkSoft, { 'fill-opacity': 0.8 }) : null;
      const spray = (P.spray || []).map(() => inkEl(over, INK.paperLight));
      const sprayL = (P.spray || []).map(() => inkEl(over, INK.ink));
      const r = rng(sd + 7), drops = Array.from({ length: 46 }, () => [r(), r(), r()]);
      return {
        update(lt, dur, cues, env) {
          base.update(lt, dur, cues, env);
          if (P.sky !== false) {
            const hy = (P.horizon ?? 0.4) * H, pts = [[-40, -40], [W + 40, -40], [W + 40, hy]];
            for (let x = W; x >= -40; x -= 80) pts.push([x, hy + Math.sin(x * 0.01 + lt) * 4]);
            skyF.setAttribute('d', inkLoop(pts, { seed: sd + 900, t: lt, amp: 1, smooth: false }));
            let hd = ''; for (let i = 0; i < 110; i++) { const x0 = ((i * 137 + lt * 20) % (W + 300)) - 150, y0 = (i * 29) % Math.max(60, hy - 30) + 6; if (x0 < W * 0.34 && y0 < H * 0.22) continue; hd += inkPath([[x0, y0], [x0 + 150, y0 + 20]], { w: 5, seed: sd + 910 + i, t: lt, amp: 1 }) + ' '; }
            skyH.setAttribute('d', hd);
          }
          fogs.forEach((f, i) => {
            const fa = at(cues, P.fog.at, 0), p = prog(lt, fa, 1.2);
            const y = H * (0.24 + i * 0.07), x0 = ((lt * (14 + i * 5) + i * 300) % (W + 600)) - 400;
            const pts = []; for (let k = 0; k <= 8; k++) pts.push([x0 + k * 90, y + Math.sin(k + lt + i) * 8]);
            f.setAttribute('d', p > 0.01 ? inkPath(pts, { w: 10 * p, seed: sd + 50 + i, t: lt, amp: 2 }) : '');
          });
          rocks.forEach((rk, i) => {
            const R = P.rocks[i], ra = at(cues, R.at, 0), p = prog(lt, ra, 0.6);
            const x = R.x * W, y = R.y * H, w = (R.w ?? 0.16) * W, h = (R.h ?? 0.1) * H * p;
            const pts = [[x - w / 2, y + 30], [x - w * 0.42, y - h * 0.5], [x - w * 0.3, y - h * 0.7], [x - w * 0.18, y - h * 1.0], [x - w * 0.05, y - h * 0.6], [x + w * 0.08, y - h * 0.85], [x + w * 0.22, y - h * 0.4], [x + w * 0.36, y - h * 0.55], [x + w / 2, y + 30]];
            if (p < 0.01) { rk.f.setAttribute('d', ''); rk.l.setAttribute('d', ''); rk.foam.setAttribute('d', ''); return; }
            rk.f.setAttribute('d', inkLoop(pts, { seed: sd + i * 9, t: lt, smooth: false }));
            rk.l.setAttribute('d', inkPath(pts, { w: 6, seed: sd + i * 9 + 1, t: lt, smooth: false }) + ' ' +
              inkPath([[x - w * 0.18, y - h * 0.9], [x - w * 0.12, y - h * 0.3]], { w: 3.5, seed: sd + i * 9 + 2, t: lt }) + ' ' +
              inkPath([[x + w * 0.08, y - h * 0.75], [x + w * 0.16, y - h * 0.2]], { w: 3.5, seed: sd + i * 9 + 3, t: lt }));
            let fd = ''; for (let k = 0; k < 5; k++) { const fx = x - w * 0.5 + k * w * 0.25, fy = y + 6 + Math.sin(lt * 3 + k) * 6; fd += inkDot(fx, fy, 26 + 8 * Math.sin(lt * 2.4 + k), 9, sd + i * 9 + 10 + k, lt) + ' '; }
            rk.foam.setAttribute('d', fd);
          });
          if (rain) {
            let d = '';
            drops.forEach(([u, v, k], i) => {
              const y = ((v * H + lt * (520 + k * 300)) % (H * 0.9)), x = (u * (W + 200) - y * 0.35 + lt * 60) % (W + 200) - 100;
              d += inkPath([[x, y], [x - 16, y + 46 + k * 24]], { w: 3, seed: sd + 200 + i, t: lt, amp: 0.4 }) + ' ';
            });
            rain.setAttribute('d', d);
          }
          spray.forEach((sp, i) => {
            const S2 = P.spray[i], sa = at(cues, S2.at, null);
            if (sa == null || lt < sa) { sp.setAttribute('d', ''); sprayL[i].setAttribute('d', ''); return; }
            const p = prog(lt, sa, 1.2), x = S2.x * W, y = S2.y * H;
            let d = '', dl = '';
            for (let k = 0; k < 9; k++) {
              const a = -Math.PI / 2 + (k / 8 - 0.5) * 2.2, rr2 = (60 + 200 * p) * (0.7 + 0.3 * Math.sin(k * 3.7));
              const px = x + Math.cos(a) * rr2, py = y + Math.sin(a) * rr2 + p * p * 120;
              const sz = (28 - 14 * p) * (1 + (k % 3) * 0.3);
              d += inkDot(px, py, sz, sz * 0.8, sd + 300 + i * 20 + k, lt) + ' ';
              dl += inkPath(inkEllipsePts(px, py, sz, sz * 0.8, sd + 400 + k, 8), { w: 3, seed: sd + 400 + k, t: lt, closed: true }) + ' ';
            }
            sp.setAttribute('d', p < 1 ? d : ''); sprayL[i].setAttribute('d', p < 1 ? dl : '');
          });
        },
      };
    },
  };

  // ------------------------------------------------------------ hr_map: Western Europe sea chart (Britain, Ireland, France, Iberia)
  // P: {view: [-20, 10, 35, 58] (lon0, lon1, lat0, lat1), sheet: {x: 0.08, y: 0.1, w: 0.56, h: 0.74} (0..1 of W/H),
  //     cities: [{name, lon, lat, at, color, dx, dy, ring: true}],
  //     routes: [{pts: [[lon, lat]...], at, dur: 1.8, color: "red"|"blue"|"ink", label: {text, u: 0.5, dx, dy, at}}] (dashed, drawn in),
  //     marks: [{lon, lat, at, text, color}] (red X + hand label), labels / cast: MCB entries (0..1 of W/H), cam}
  // cues: routes[].at, cities[].at, marks[].at, labels / cast names
  const WEST_EU = [
    [[-5.7, 50.05], [-4.2, 50.35], [-3.5, 50.6], [-2, 50.6], [-0.8, 50.75], [1.4, 51.15], [1.6, 51.9], [1.75, 52.6], [0.3, 53.1], [0.1, 53.6], [-0.6, 54.5], [-1.6, 55.6], [-2.6, 56.3], [-1.8, 57.5], [-4, 57.6], [-3.1, 58.6], [-5, 58.6], [-5.7, 57.9], [-5.8, 56.7], [-6.2, 56.3], [-5.6, 55.4], [-4.9, 55], [-3.4, 54.9], [-3.6, 54.5], [-3, 53.9], [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.9], [-4.1, 52.3], [-5.3, 51.8], [-4.2, 51.6], [-3.2, 51.4], [-4.2, 51.2], [-5, 50.9]],
    [[-6, 52.2], [-6.2, 53.3], [-6, 54], [-5.5, 54.4], [-6, 55.2], [-7.3, 55.3], [-8.3, 55], [-8.6, 54.3], [-10, 54.2], [-9.9, 53.5], [-9.6, 52.6], [-10.4, 52], [-9.6, 51.5], [-8.2, 51.8]],
    [[14, 54], [8.6, 54], [8.6, 53.5], [7, 53.4], [4.8, 52.9], [4.5, 51.6], [3.5, 51.4], [2.5, 51.1], [1.6, 50.3], [1, 49.9], [0.1, 49.6], [-1.2, 49.4], [-1.9, 49.7], [-1.6, 48.7], [-3, 48.8], [-4.7, 48.4], [-4.3, 47.8], [-2.5, 47.3], [-2.2, 46.8], [-1.2, 46], [-1.2, 44.6], [-1.5, 43.4], [-3.8, 43.4], [-5.8, 43.6], [-8, 43.7], [-9.3, 43], [-8.9, 42], [-8.8, 41], [-9.5, 39.4], [-9.2, 38.7], [-8.8, 38.4], [-8.8, 37.9], [-9, 37], [-7.4, 37.2], [-6.4, 36.8], [-5.6, 36], [-4.4, 36.7], [-2, 36.7], [-0.5, 38.3], [0.2, 38.8], [-0.3, 39.5], [0.9, 41], [3.2, 41.9], [3, 43], [4.5, 43.4], [7.5, 43.8], [14, 44]],
    [[-5.4, 35.9], [-6.3, 35.3], [-6.9, 34], [-8.5, 33.2], [-9.8, 31], [-11, 28], [14, 28], [14, 37], [10, 37.2], [3, 36.8], [-1, 35.2], [-2.9, 35.2]],
  ];
  SH.hr_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 151;
      const g = el(svg, 'g'), sheetG = el(g, 'g');
      const SHT = Object.assign({ x: 0.08, y: 0.1, w: 0.56, h: 0.74 }, P.sheet || {});
      const sx0 = SHT.x * W, sy0 = SHT.y * H, sw = SHT.w * W, sh = SHT.h * H;
      const [lo0, lo1, la0, la1] = P.view || [-20, 10, 35, 58];
      const kx = Math.cos((la0 + la1) / 2 * Math.PI / 180);
      const sc = Math.min(sw / ((lo1 - lo0) * kx), sh / (la1 - la0));
      const cxm = (lo0 + lo1) / 2, cym = (la0 + la1) / 2;
      const PX = ([lo, la]) => [sx0 + sw / 2 + (lo - cxm) * kx * sc, sy0 + sh / 2 - (la - cym) * sc];
      const clipId = 'hrmap' + seed;
      const cp = el(el(svg, 'defs'), 'clipPath', { id: clipId }); el(cp, 'rect', { x: sx0, y: sy0, width: sw, height: sh });
      const paper = fill(sheetG, INK.paperLight), inner = el(sheetG, 'g', { 'clip-path': `url(#${clipId})` });
      const grat = inkEl(inner, INK.inkSoft, { 'fill-opacity': 0.5 });
      const lands = WEST_EU.map(() => ({ f: fill(inner, INK.paperDark), l: pen(inner, INK.inkSoft) }));
      const waves = inkEl(inner, INK.inkSoft);
      const frame = pen(sheetG);
      const routes = (P.routes || []).map(() => inkEl(inner, INK.red));
      const heads = (P.routes || []).map(() => inkEl(inner, INK.red));
      const rlabels = (P.routes || []).map(r => r.label ? text(sheetG, r.label.text, r.label.size || 52, M.COL[r.color] || INK.red) : null);
      const cities = (P.cities || []).map(c => ({ dot: fill(sheetG, M.COL[c.color] || INK.ink), ring: pen(sheetG, M.COL[c.color] || INK.ink), tx: text(sheetG, c.name, c.size || 54, M.COL[c.color] || INK.ink) }));
      const marks = (P.marks || []).map(m => ({ x: pen(sheetG, INK.red), tx: m.text ? text(sheetG, m.text, 50, INK.red) : null }));
      const castLayer = el(g, 'g'), lab = el(g, 'g');
      const cast = M.cast(castLayer, P.cast || [], W, H, sd + 300), labels = M.labels(lab, P.labels || [], W, H, sd + 500);
      const routePx = (P.routes || []).map(r => r.pts.map(PX));
      return {
        update(lt, dur, cues) {
          const hit = punch(lt, cue(cues, 'hit', null));
          M.camPush(g, lt, dur, W, H, P.cam || { zoom: 1.04, focus: [0.4, 0.5] }, hit);
          const box = rect(sx0, sy0, sw, sh);
          paper(box, { seed: sd + 1, t: lt, smooth: false, amp: 1 });
          frame(box, { w: 7, seed: sd + 2, t: lt, closed: true, smooth: false });
          let gd = '';
          for (let lo = Math.ceil(lo0 / 5) * 5; lo <= lo1; lo += 5) { const a = PX([lo, la0 - 5]), b = PX([lo, la1 + 5]); for (let k = 0; k < 14; k++) { const u0 = k / 14, u1 = (k + 0.4) / 14; gd += inkPath([[lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)]], { w: 2, seed: sd + 10 + lo * 3 + k, t: lt, amp: 0.4 }) + ' '; } }
          for (let la = Math.ceil(la0 / 5) * 5; la <= la1; la += 5) { const a = PX([lo0 - 5, la]), b = PX([lo1 + 5, la]); for (let k = 0; k < 18; k++) { const u0 = k / 18, u1 = (k + 0.4) / 18; gd += inkPath([[lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)]], { w: 2, seed: sd + 60 + la * 3 + k, t: lt, amp: 0.4 }) + ' '; } }
          grat.setAttribute('d', gd);
          WEST_EU.forEach((poly, i) => { const pts = poly.map(PX); lands[i].f(pts, { seed: sd + 100 + i, t: lt, amp: 0.8, smooth: false }); lands[i].l(pts, { w: 4, seed: sd + 110 + i, t: lt, closed: true, smooth: false, amp: 0.8 }); });
          let wd = ''; [[-16, 47], [-14, 41], [-11, 52.5], [-18, 38]].forEach(([lo, la], i) => { const [x, y] = PX([lo, la]); const o = Math.sin(lt * 1.5 + i) * 6; wd += inkPath([[x - 30 + o, y], [x - 15 + o, y - 8], [x + o, y], [x + 15 + o, y - 8], [x + 30 + o, y]], { w: 3, seed: sd + 130 + i, t: lt }) + ' '; });
          waves.setAttribute('d', wd);
          (P.routes || []).forEach((r, i) => {
            const pts = routePx[i], a = at(cues, r.at, 0.3), p = prog(lt, a, r.dur ?? 1.8);
            const col = M.COL[r.color] || INK.red; routes[i].setAttribute('fill', col); heads[i].setAttribute('fill', col);
            const segL = []; let tot = 0; for (let k = 1; k < pts.length; k++) { const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); segL.push(l); tot += l; }
            const pos = d => { let acc = 0; for (let k = 0; k < segL.length; k++) { if (acc + segL[k] >= d) { const u = (d - acc) / segL[k]; return [lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)]; } acc += segL[k]; } return pts[pts.length - 1]; };
            let d = ''; const dl = 22, gap = 16, end = tot * p;
            for (let x = 0, k = 0; x < end; x += dl + gap, k++) d += inkPath([pos(x), pos(Math.min(end, x + dl))], { w: 7, seed: sd + 200 + i * 50 + k, t: lt, amp: 0.6, smooth: false }) + ' ';
            routes[i].setAttribute('d', d);
            if (p > 0.05) { const e = pos(end), b = pos(Math.max(0, end - 20)), ang = Math.atan2(e[1] - b[1], e[0] - b[0]); heads[i].setAttribute('d', inkPath([[e[0] - Math.cos(ang - 0.5) * 30, e[1] - Math.sin(ang - 0.5) * 30], e, [e[0] - Math.cos(ang + 0.5) * 30, e[1] - Math.sin(ang + 0.5) * 30]], { w: 7, seed: sd + 190 + i, t: lt, smooth: false })); }
            else heads[i].setAttribute('d', '');
            const L = r.label, tx = rlabels[i];
            if (tx) { const la = at(cues, L.at, a + 0.6), q = pos(tot * (L.u ?? 0.5)); tx.style.display = lt >= la ? '' : 'none'; tx.setAttribute('x', f1(q[0] + (L.dx ?? 0))); tx.setAttribute('y', f1(q[1] + (L.dy ?? -40))); }
          });
          (P.cities || []).forEach((c, i) => {
            const [x, y] = PX([c.lon, c.lat]), a = at(cues, c.at, 0.2 + i * 0.2), p = spring(lt, a, 0.5), C = cities[i];
            if (lt < a) { C.dot(null); C.ring(null); C.tx.style.display = 'none'; return; }
            C.dot(ell(x, y, 9, 8), { seed: sd + 300 + i, t: lt, amp: 0.4 });
            C.ring(c.ring === false ? null : ell(x, y, 26 * Math.max(0.01, p), 10), { w: 5, seed: sd + 310 + i, t: lt, closed: true });
            C.tx.style.display = ''; C.tx.setAttribute('x', f1(x + (c.dx ?? 0))); C.tx.setAttribute('y', f1(y + (c.dy ?? -50)));
          });
          (P.marks || []).forEach((m, i) => {
            const [x, y] = PX([m.lon, m.lat]), a = at(cues, m.at, 1), p = prog(lt, a, 0.4), Mk = marks[i], r = 22;
            Mk.x.__e = 1;
            if (p < 0.01) { Mk.x(null); if (Mk.tx) Mk.tx.style.display = 'none'; return; }
            sheetG.__mx = sheetG.__mx || {}; 
            Mk.x([[x - r * p, y - r * p], [x, y], [x + r * p, y + r * p], [x, y], [x + r * p, y - r * p], [x, y], [x - r * p, y + r * p]], { w: 8, seed: sd + 400 + i, t: lt, smooth: false, taper: 0 });
            if (Mk.tx) { Mk.tx.style.display = ''; Mk.tx.setAttribute('x', f1(x + (m.dx ?? 0))); Mk.tx.setAttribute('y', f1(y + (m.dy ?? 50))); }
          });
          cast.update(lt, lt, cues); labels.update(lt, lt, cues);
        },
      };
    },
  };
})();
