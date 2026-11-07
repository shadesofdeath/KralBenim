// pz_pisa: shots for the Stickstory Short "Why the Leaning Tower of Pisa didn't fall" (2026-11-07): work began in 1173,
// by 1178 (second/third storey) the tower was sinking into soft clay on a 3 m foundation; Pisa's wars with Genoa, Lucca and
// Florence stopped the work for almost a century, the clay consolidated and the tower did not topple; when work resumed
// (1272) the builders made the upper storeys taller on the low side, so the tower is curved like a banana.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif, LH.label). Parametric: any
// "tall masonry tower on soft ground" story (Pisa, Bologna's Garisenda, Suurhusen).
//
// Tower: 8 storeys (base with blind arches, six arcaded galleries, narrower bell chamber), side view, tilt in degrees
// (+ leans right), "curve" bends the upper storeys back towards the vertical (each storey is a wedge, taller on the low side).
// Common P: labels [{text, x, y, at, size, color, font, card, rot, underline}], kasif {x, y, scale, pose, face, dir, emotion, seq},
//   gy (ground line 0..1 H), x (tower base 0..1 W), s (tower scale), tilt
//
// SHOTS.pz_build — ground cross-section (cutaway, soil layers down to the frame bottom) with the tower stump on it.
//   mode "sink":   storeys rise 0 -> 3, then at cue "sink" the stump sinks into the clay and tilts; the layers dip under it
//   mode "settle": the overgrown stump with its scaffold stands still; at cue "pause" the clay layers squeeze together,
//                  water beads rise out of the clay; finished (firm) at cue "firm"; Kaşif (P.kasif) points down at the clay
//   mode "fall":   what-if ghost (red ink): storeys keep rising with no pause, at cue "hit" the tower topples, cracks + dust
// SHOTS.pz_tower — the Piazza: pale cathedral behind, lawn and marble path in front, the finished tower.
//   mode "hook":  the tower creaks a little further over; at cue "hit" two war banners on spears spring up in the lawn
//   mode "plumb": two tourists on the lawn do the "hold it up" pose; at cue "hit" a red plumb line drops from the top
//   mode "end":   Kaşif (P.kasif) on the lawn in front of the tower
// SHOTS.pz_floors — mode "build": the upper storeys are added one by one at cues "f1", "f2", "f3" (wedges, taller on
//   the low side) on a wooden scaffold, a mason points at the new storey; at cue "hit" an arrow + P.arrowLabel shows the
//   taller side. mode "banana": the finished tower, at cue "axis" a gold line traces its bent axis next to a straight
//   dashed one; at cue "hit" a big ink banana pops up.
// SHOTS.pz_war — the half-built stump on a hillside with scaffold, vines grow over it; soldiers with spears and red
//   banners march past; at cue "hit" a big year counter runs P.from -> P.to (1178 -> 1272).
// cues: as listed + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x && x.setAttribute('d', ''));
  const D2R = Math.PI / 180;
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const L2 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  const easeIn = x => { x = clamp01(x); return x * x * x; };
  const SERIF = 'Fraunces, Georgia, serif';
  const MARBLE = () => mix(INK.paperLight, INK.paper, 0.15);
  const MARBLE_D = () => mix(INK.paperDark, INK.paper, 0.25);
  const BAY = () => mix(INK.inkSoft, INK.paperDark, 0.3);
  const WOOD = () => mix(INK.stain, INK.ink, 0.35);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));

  // ------------------------------------------------------------------ the tower
  const FL = [[200, 132, 'base'], [208, 78, 'log'], [208, 78, 'log'], [208, 78, 'log'], [208, 78, 'log'], [208, 78, 'log'], [208, 78, 'log'], [134, 100, 'bell']];
  const CORR = [0, 0, 0, 0.7, 1.4, 2.1, 2.8, 3.6];   // degrees each storey is turned back towards the vertical (curve = 1)
  function tower(parent, sd, opt = {}) {
    const ghost = !!opt.ghost;
    const shadow = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.25));
    const found = inkEl(parent, mix(INK.paperDark, INK.stain, 0.3)), foundR = inkEl(parent);
    const fill = inkEl(parent, ghost ? mix(INK.paperLight, INK.red, 0.12) : MARBLE()), shade = inkEl(parent, ghost ? mix(INK.paperLight, INK.red, 0.25) : MARBLE_D());
    const bays = inkEl(parent, ghost ? mix(INK.red, INK.paperLight, 0.45) : BAY()), lines = inkEl(parent, ghost ? INK.red : INK.ink);
    const scaf = inkEl(parent, WOOD()), vine = inkEl(parent, mix(INK.green, INK.ink, 0.2)), leaf = inkEl(parent, mix(INK.green, INK.paperLight, 0.15));
    return {
      update(t, o) {
        const s = o.s, n = o.floors ?? 8, tilt = o.tilt ?? 5, cv = o.curve ?? 0, base = [o.x, o.gy + (o.sink || 0)];
        let c0 = base, aPrev = tilt - cv * CORR[0];
        const Fi = [], Sh = [], By = [], Ln = [], info = [], centers = [base];
        for (let i = 0; i < FL.length; i++) {
          const fr = Math.min(1, n - i);
          if (fr <= 0.001) break;
          const [w0, h0, kind] = FL[i], w = w0 * s, h = h0 * s * fr, a = (tilt - cv * CORR[i]) * D2R, ap = aPrev * D2R;
          const dir = [Math.sin(a), -Math.cos(a)], perp = [Math.cos(a), Math.sin(a)], pp = [Math.cos(ap), Math.sin(ap)];
          const BL = add(c0, pp, -w / 2), BR = add(c0, pp, w / 2), c1 = add(c0, dir, h), TL = add(c1, perp, -w / 2), TR = add(c1, perp, w / 2);
          const Q = (u, v) => L2(L2(BL, BR, u), L2(TL, TR, u), v);
          const sdi = sd + i * 40;
          Fi.push(inkLoop([BL, BR, TR, TL], { seed: sdi, t, amp: 0.5, smooth: false }));
          Sh.push(inkLoop([Q(0.8, 0), Q(1, 0), Q(1, 1), Q(0.8, 1)], { seed: sdi + 1, t, amp: 0.4, smooth: false }));
          const nb = kind === 'log' ? 5 : 4, v0 = kind === 'base' ? 0.07 : 0.1, v1 = kind === 'base' ? 0.66 : kind === 'bell' ? 0.58 : 0.6, va = kind === 'base' ? 0.2 : 0.24;
          if (fr > 0.6) for (let k = 0; k < nb; k++) {
            const u0 = k / nb + 0.035, u1 = (k + 1) / nb - 0.035, um = (u0 + u1) / 2, hw = (u1 - u0) / 2, A = [Q(u0, v0), Q(u0, v1)];
            for (let j = 1; j < 6; j++) { const g = Math.PI * j / 6; A.push(Q(um - Math.cos(g) * hw, v1 + Math.sin(g) * va)); }
            A.push(Q(u1, v1), Q(u1, v0));
            if (kind === 'base') Ln.push(inkPath(A, { w: 3, seed: sdi + 5 + k, t, amp: 0.6 }));
            else By.push(inkLoop(A, { seed: sdi + 5 + k, t, amp: 0.5 }));
            if (kind !== 'base') Ln.push(inkPath([Q(u0 - 0.02, v0), Q(u0 - 0.02, v1 + 0.02)], { w: 3.5, seed: sdi + 15 + k, t, amp: 0.6 }));
          }
          Ln.push(inkPath([BL, BR, TR, TL], { w: 5, seed: sdi + 30, t, closed: true, smooth: false, amp: 0.8 }));
          Ln.push(inkPath([add(c1, perp, -w * 0.55), add(c1, perp, w * 0.55)], { w: 8, seed: sdi + 31, t, amp: 0.8 }));
          if (kind === 'log') Ln.push(inkPath([Q(0, 0.08), Q(1, 0.08)], { w: 3, seed: sdi + 32, t, amp: 0.6 }));
          if (kind === 'bell' && fr >= 1) {   // little rim on top
            const R = [add(add(c1, perp, -w * 0.42), dir, 2), add(add(c1, perp, w * 0.42), dir, 2), add(add(c1, perp, w * 0.36), dir, 22 * s), add(add(c1, perp, -w * 0.36), dir, 22 * s)];
            Fi.push(inkLoop(R, { seed: sdi + 33, t, amp: 0.4, smooth: false })); Ln.push(inkPath(R, { w: 4, seed: sdi + 34, t, closed: true, smooth: false }));
          }
          info.push({ BL, BR, TL, TR, Q, c0, c1, w, a });
          centers.push(c1);
          c0 = c1; aPrev = tilt - cv * CORR[i];
        }
        fill.setAttribute('d', Fi.join(' ')); shade.setAttribute('d', ghost ? '' : Sh.join(' ')); bays.setAttribute('d', By.join(' ')); lines.setAttribute('d', Ln.join(' '));
        // foundation slab (seen only in the cutaway) and the ground shadow
        const a0 = (tilt - cv * CORR[0]) * D2R, p0 = [Math.cos(a0), Math.sin(a0)], d0 = [Math.sin(a0), -Math.cos(a0)], fw = 260 * s;
        const FD = [add(base, p0, -fw / 2), add(base, p0, fw / 2), add(add(base, p0, fw / 2), d0, -42 * s), add(add(base, p0, -fw / 2), d0, -42 * s)];
        if (o.found) { found.setAttribute('d', inkLoop(FD, { seed: sd + 400, t, amp: 0.5, smooth: false })); foundR.setAttribute('d', inkPath(FD, { w: 5, seed: sd + 401, t, closed: true, smooth: false })); }
        else blank(found, foundR);
        shadow.setAttribute('d', o.shadow === false ? '' : inkLoop(inkEllipsePts(o.x + 60 * s, o.gy + 8 * s, 220 * s, 22 * s, sd + 402, 12, 0, 0.05), { seed: sd + 402, t, amp: 0.5 }));
        // scaffold round the top storey (vertical poles, ledgers, a brace)
        if (o.scaffold && info.length) {
          const top = info[info.length - 1], xs = [Math.min(top.BL[0], top.TL[0], info[0].BL[0]) - 34 * s, Math.max(top.BR[0], top.TR[0]) + 34 * s];
          const yTop = Math.min(top.TL[1], top.TR[1]) - 70 * s, yBot = Math.max(top.BL[1], top.BR[1]) + 10 * s, S = [];
          xs.forEach((x, i) => { S.push(inkPath([[x, yBot], [x, yTop]], { w: 7, seed: sd + 410 + i, t })); S.push(inkPath([[x + (i ? 26 : -26) * s, yBot], [x + (i ? 26 : -26) * s, yTop + 20 * s]], { w: 6, seed: sd + 412 + i, t })); });
          for (let y = yBot - 10 * s, j = 0; y > yTop + 10 * s; y -= 70 * s, j++) xs.forEach((x, i) => S.push(inkPath([[x - 40 * s, y], [x + 40 * s, y]], { w: 6, seed: sd + 420 + j * 2 + i, t })));
          S.push(inkPath([[xs[1] - 26 * s, yBot], [xs[1] + 26 * s, yTop + 40 * s]], { w: 4, seed: sd + 440, t }));
          scaf.setAttribute('d', S.join(' '));
        } else blank(scaf);
        // vines climbing the stump (time passing)
        if (o.vines > 0 && info.length) {
          const V = [], Lf = [], tot = info.length;
          [0.08, 0.5, 0.9].forEach((u, i) => {
            const pts = [], hgt = o.vines * (0.6 + 0.4 * hn(sd + 450, i)) * tot;
            for (let q = 0; q <= 14; q++) { const f = q / 14 * hgt, k = Math.min(tot - 1, Math.floor(f)), v = f - k; const p = info[k].Q(u + 0.04 * Math.sin(q * 1.3 + i + t * 0.6), Math.min(1, v)); pts.push(p); if (q % 2 === 1) Lf.push(inkDot(p[0] + (q % 4 === 1 ? 14 : -14) * s, p[1], 13 * s, 8 * s, sd + 470 + i * 20 + q, t)); }
            V.push(inkPath(pts, { w: 4, seed: sd + 460 + i, t, taper: 0.5 }));
          });
          vine.setAttribute('d', V.join(' ')); leaf.setAttribute('d', Lf.join(' '));
        } else blank(vine, leaf);
        return { base, top: c0, centers, info };
      },
    };
  }

  // ------------------------------------------------------------------ soil cross-section from `top` to the frame bottom
  function soil(parent, sd) {
    const cols = () => [mix(INK.paperDark, INK.stain, 0.35), mix(INK.gold, INK.paperLight, 0.5), mix(INK.stain, INK.inkSoft, 0.35), mix(INK.gold, INK.paperDark, 0.45), mix(INK.inkSoft, INK.stain, 0.45)];
    const C = cols(), layers = C.map(c => inkEl(parent, c)), hatch = inkEl(parent, mix(INK.ink, INK.stain, 0.3)), bounds = inkEl(parent), surf = inkEl(parent), peb = inkEl(parent, mix(INK.paperLight, INK.gold, 0.2)), drops = inkEl(parent, mix(INK.blue, INK.paperLight, 0.25));
    const DEP = [0, 70, 210, 470, 640];
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, sq = o.squeeze || 0;
        const dip = x => (o.dip || 0) * Math.exp(-Math.pow((x - (o.dx ?? W / 2)) / (o.dw ?? 260 * u), 2));
        const yb = (k, x) => top + DEP[k] * u * (1 - 0.12 * sq * (k >= 2 ? 1 : 0)) + dip(x) * Math.max(0.2, 1 - k * 0.22) + (k ? 8 * u * Math.sin(x * 0.006 + k * 1.7) : 0);
        const B = [], Hh = [];
        for (let k = 0; k < DEP.length; k++) {
          const pts = []; for (let x = -60; x <= W + 60; x += 40) pts.push([x, yb(k, x)]);
          layers[k].setAttribute('d', inkLoop(pts.concat([[W + 60, H + 80], [-60, H + 80]]), { seed: sd + k, t, amp: 0.6 }));
          if (k) B.push(inkPath(pts, { w: 4, seed: sd + 10 + k, t, amp: 1 }));
          else surf.setAttribute('d', inkPath(pts, { w: 7, seed: sd + 10, t }));
          if (k === 2 || k === 4) {   // clay laminations: dashed lines, denser when squeezed
            const rows = Math.round(4 + 4 * sq), y0 = k === 2 ? 0 : 0, th = (k === 2 ? DEP[3] - DEP[2] : 300) * u * (1 - 0.12 * sq);
            for (let r = 0; r < rows; r++) for (let x = -20 + (r % 2) * 50; x < W; x += 100) {
              const yy = yb(k, x) + y0 + (r + 0.6) * th / (rows + 0.4);
              Hh.push(inkPath([[x, yy], [x + 60 * u, yb(k, x + 60 * u) + (r + 0.6) * th / (rows + 0.4)]], { w: 3 + sq * 1.5, seed: sd + 100 + r * 20 + (x | 0) % 97, t, amp: 0.8 }));
            }
          }
        }
        bounds.setAttribute('d', B.join(' ')); hatch.setAttribute('d', Hh.join(' '));
        const P = []; for (let i = 0; i < 26; i++) { const x = hn(sd + 1, i) * W, k = i % 2 ? 1 : 3, y = lerp(yb(k, x), yb(k + 1, x), 0.2 + 0.6 * hn(sd + 2, i)); P.push(inkDot(x, y, (7 + 6 * hn(sd + 3, i)) * u, (5 + 3 * hn(sd + 4, i)) * u, sd + 300 + i, t)); }
        peb.setAttribute('d', P.join(' '));
        const Dr = [];
        if (o.drops > 0) for (let i = 0; i < Math.round(16 * o.drops); i++) {
          const ph = (t * (0.35 + 0.2 * hn(sd + 5, i)) + hn(sd + 6, i)) % 1, x = (0.05 + 0.9 * hn(sd + 7, i)) * W, y = lerp(yb(3, x), yb(0, x) + 10 * u, ph);
          Dr.push(inkLoop([[x, y - 16 * u], [x + 9 * u, y + 2 * u], [x, y + 10 * u], [x - 9 * u, y + 2 * u]], { seed: sd + 400 + i, t, amp: 0.4 }));
        }
        drops.setAttribute('d', Dr.join(' '));
        return { yb };
      },
    };
  }

  // ------------------------------------------------------------------ lawn (Piazza) or wild grass, to the frame bottom
  function lawn(parent, sd, wild) {
    const base = inkEl(parent, wild ? mix(INK.green, INK.stain, 0.45) : mix(INK.green, INK.paperLight, 0.42)), stripe = inkEl(parent, wild ? mix(INK.green, INK.ink, 0.15) : mix(INK.green, INK.paperLight, 0.25));
    const pathF = inkEl(parent, MARBLE()), pathR = inkEl(parent), edge = inkEl(parent), blades = inkEl(parent, mix(INK.green, INK.ink, 0.3));
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080;
        const pts = []; for (let x = -60; x <= W + 60; x += 40) pts.push([x, top + 6 * u * Math.sin(x * 0.01 + sd)]);
        base.setAttribute('d', inkLoop(pts.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.6 }));
        edge.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 1, t }));
        const S = [];
        if (!wild) for (let i = 0; i < 6; i++) { if (i % 2) continue; const y0 = top + (40 + i * 120) * u, y1 = y0 + 120 * u; S.push(inkLoop([[-60, y0], [W + 60, y0 + 20 * u], [W + 60, y1 + 20 * u], [-60, y1]], { seed: sd + 10 + i, t, amp: 0.6, smooth: false })); }
        stripe.setAttribute('d', S.join(' '));
        if (!wild && o.path !== false) {
          const px = (o.px ?? 0.62) * W, PP = [[px - 50 * u, top], [px + 50 * u, top], [px + 330 * u, H + 60], [px - 230 * u, H + 60]];
          pathF.setAttribute('d', inkLoop(PP, { seed: sd + 20, t, amp: 0.6, smooth: false }));
          pathR.setAttribute('d', inkPath([PP[0], PP[3]], { w: 5, seed: sd + 21, t }) + ' ' + inkPath([PP[1], PP[2]], { w: 5, seed: sd + 22, t }) +
            ' ' + [1, 2, 3, 4].map(k => { const y = top + k * k * 34 * u, a = L2(PP[0], PP[3], (y - top) / (H + 60 - top)), b = L2(PP[1], PP[2], (y - top) / (H + 60 - top)); return inkPath([a, b], { w: 3, seed: sd + 23 + k, t }); }).join(' '));
        } else blank(pathF, pathR);
        const G = [];
        (o.tufts ?? [0.05, 0.3, 0.95]).forEach((q, i) => {
          const x = q * W, y = top + (220 + (i % 2) * 160) * u;
          for (let j = 0; j < 9; j++) { const a = -Math.PI / 2 + (j - 4) * 0.2, sw = Math.sin(t * 1.5 + i + j * 0.4) * 10 * u, L = (wild ? 200 : 120) * (0.8 + 0.4 * hn(sd + 7, j + i * 9)) * u;
            G.push(inkPath([[x + (j - 4) * 6 * u, y], [x + Math.cos(a) * L * 0.5 + sw * 0.4, y + Math.sin(a) * L * 0.55], [x + Math.cos(a) * L + sw, y + Math.sin(a) * L]], { w: 6, seed: sd + 50 + i * 10 + j, t, taper: 0.85 })); }
        });
        blades.setAttribute('d', G.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ the cathedral, pale, behind
  function duomo(parent, sd) {
    const f = inkEl(parent, mix(INK.paperLight, INK.paperDark, 0.45)), dome = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.15)), ln = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.25));
    return {
      update(t, x, gy, s) {
        const T = q => [x + q[0] * s, gy + q[1] * s];
        const F = [[-300, 0], [-300, -260], [-160, -340], [0, -400], [160, -340], [300, -260], [300, 0]].map(T);
        const Dm = inkEllipsePts(...T([380, -330]), 120 * s, 110 * s, sd, 14).filter(p => p[1] <= gy - 330 * s + 2).concat([T([500, -330]), T([260, -330])]);
        dome.setAttribute('d', inkLoop(inkEllipsePts(...T([380, -330]), 120 * s, 110 * s, sd, 14), { seed: sd, t, amp: 0.5 }) + ' ' + inkLoop([[260, -330], [500, -330], [500, 0], [260, 0]].map(T), { seed: sd + 1, t, amp: 0.5, smooth: false }));
        void Dm;
        f.setAttribute('d', inkLoop(F, { seed: sd + 2, t, amp: 0.5, smooth: false }));
        const L = [inkPath(F, { w: 3.5, seed: sd + 3, t, smooth: false })];
        [-60, -150, -230].forEach((y, r) => { L.push(inkPath([T([-300, y]), T([300, y])], { w: 3, seed: sd + 10 + r, t })); for (let k = 0; k < 9; k++) { const xx = -270 + k * 68; L.push(inkPath([T([xx, y + 50]), T([xx, y + 12]), T([xx + 20, y + 2]), T([xx + 40, y + 12]), T([xx + 40, y + 50])], { w: 2.5, seed: sd + 20 + r * 10 + k, t })); } });
        L.push(inkPath([[260, -330], [500, -330]].map(T), { w: 3, seed: sd + 50, t }));
        ln.setAttribute('d', L.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a medieval soldier (hatless rig + helmet) with a spear / banner
  function soldier(parent, sd, sc, banner, spearLen = 420) {
    const g = el(parent, 'g'), rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: 'helmet_byz', seed: sd });
    const spear = inkEl(g, WOOD()), tip = inkEl(g, INK.inkSoft), flag = inkEl(g, INK.red), cross = inkEl(g, INK.paperLight), flagR = inkEl(g);
    return {
      update(t, x, y, ph, face = 1, pose = 'walk') {
        const r = rig.update(t, pose, { x, y, face, ph, since: 1 });
        const hd = r.hands[1], h = [x + face * sc * hd[0], y + sc * hd[1]];
        const bot = [h[0] - 8 * sc * face, h[1] + 160 * sc], top = [h[0] + 14 * sc * face, h[1] - spearLen * sc];
        spear.setAttribute('d', inkPath([bot, top], { w: 7, seed: sd + 1, t }));
        tip.setAttribute('d', inkLoop([[top[0] - 12 * sc, top[1] + 4 * sc], [top[0] + 2 * sc, top[1] - 50 * sc], [top[0] + 14 * sc, top[1] + 4 * sc]], { seed: sd + 2, t, amp: 0.5, smooth: false }));
        if (banner) {
          const wv = q => Math.sin(t * 5 + q * 3 + sd) * 14 * sc * q, x0 = top[0] + 4 * sc, y0 = top[1] + 30 * sc, Wd = 190 * sc * face, Hd = 130 * sc;
          const FP = [[x0, y0], [x0 + Wd * 0.5, y0 + wv(0.5)], [x0 + Wd, y0 + wv(1)], [x0 + Wd, y0 + Hd + wv(1)], [x0 + Wd * 0.5, y0 + Hd + wv(0.5)], [x0, y0 + Hd]];
          flag.setAttribute('d', inkLoop(FP, { seed: sd + 3, t, amp: 0.6 }));
          flagR.setAttribute('d', inkPath(FP, { w: 4, seed: sd + 4, t, closed: true }));
          const cx = x0 + Wd * 0.5, cy = y0 + Hd * 0.5 + wv(0.5);
          cross.setAttribute('d', inkPath([[cx - Wd * 0.3, cy], [cx + Wd * 0.3, cy]], { w: 14 * sc + 3, seed: sd + 5, t }) + ' ' + inkPath([[cx, cy - Hd * 0.36], [cx, cy + Hd * 0.36]], { w: 14 * sc + 3, seed: sd + 6, t }));
        } else blank(flag, cross, flagR);
        return r;
      },
    };
  }
  // a planted war banner (no person): pole + red flag with a pale cross
  function bannerPole(parent, sd) {
    const pole = inkEl(parent, WOOD()), flag = inkEl(parent, INK.red), cross = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    return {
      update(t, x, yBot, len, s, k, face = 1) {
        if (k <= 0.01) { blank(pole, flag, cross, rim); return; }
        const top = [x + face * 30 * s, yBot - len * k];
        pole.setAttribute('d', inkPath([[x, yBot], top], { w: 12 * s + 2, seed: sd, t }) + ' ' + inkLoop([[top[0] - 16 * s, top[1] + 6 * s], [top[0], top[1] - 60 * s], [top[0] + 16 * s, top[1] + 6 * s]], { seed: sd + 1, t, amp: 0.4, smooth: false }));
        const wv = q => Math.sin(t * 4 + q * 3 + sd) * 20 * s * q, x0 = top[0], y0 = top[1] + 30 * s, Wd = 300 * s * face, Hd = 200 * s;
        const FP = [[x0, y0], [x0 + Wd * 0.5, y0 + wv(0.5)], [x0 + Wd, y0 + wv(1)], [x0 + Wd, y0 + Hd + wv(1)], [x0 + Wd * 0.5, y0 + Hd + wv(0.5)], [x0, y0 + Hd]];
        flag.setAttribute('d', inkLoop(FP, { seed: sd + 2, t, amp: 0.6 })); rim.setAttribute('d', inkPath(FP, { w: 5, seed: sd + 3, t, closed: true }));
        const cx = x0 + Wd * 0.5, cy = y0 + Hd * 0.5 + wv(0.5);
        cross.setAttribute('d', inkPath([[cx - Wd * 0.32, cy], [cx + Wd * 0.32, cy]], { w: 22 * s, seed: sd + 4, t }) + ' ' + inkPath([[cx, cy - Hd * 0.36], [cx, cy + Hd * 0.36]], { w: 22 * s, seed: sd + 5, t }));
      },
    };
  }

  // ------------------------------------------------------------------ arrow, dashed line, banana, dust
  function arrow(parent, sd, col) {
    const e = inkEl(parent, col || INK.red);
    return { update(t, a, b, k) {
      if (k <= 0.01) { e.setAttribute('d', ''); return; }
      const m = [lerp(a[0], b[0], 0.5) + (b[1] - a[1]) * 0.2, lerp(a[1], b[1], 0.5) - (b[0] - a[0]) * 0.2], pts = [];
      for (let i = 0; i <= 10; i++) { const q = i / 10 * k; pts.push([(1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * m[0] + q * q * b[0], (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * m[1] + q * q * b[1]]); }
      const end = pts[pts.length - 1], pr = pts[pts.length - 2], ang = Math.atan2(end[1] - pr[1], end[0] - pr[0]), hl = 60;
      e.setAttribute('d', inkPath(pts, { w: 22, seed: sd, t }) + (k > 0.9 ? ' ' + inkPath([[end[0] - Math.cos(ang - 0.5) * hl, end[1] - Math.sin(ang - 0.5) * hl], end, [end[0] - Math.cos(ang + 0.5) * hl, end[1] - Math.sin(ang + 0.5) * hl]], { w: 20, seed: sd + 1, t, smooth: false }) : ''));
    } };
  }
  function dashed(a, b, k, sd, t, w = 5, n = 18) {
    const D = [];
    for (let i = 0; i < n; i++) { const p0 = i / n, p1 = (i + 0.55) / n; if (p1 > k) break; D.push(inkPath([L2(a, b, p0), L2(a, b, p1)], { w, seed: sd + i, t })); }
    return D.join(' ');
  }
  function banana(parent, sd) {
    const f = inkEl(parent, mix(INK.gold, INK.paperLight, 0.3)), sh = inkEl(parent, mix(INK.gold, INK.stain, 0.35)), r = inkEl(parent), tips = inkEl(parent, mix(INK.stain, INK.ink, 0.4));
    return { update(t, cx, cy, s, k, rot = -20) {
      if (k <= 0.01) { blank(f, sh, r, tips); return; }
      const c = Math.cos(rot * D2R), sn = Math.sin(rot * D2R), T = q => [cx + (q[0] * c - q[1] * sn) * s * k, cy + (q[0] * sn + q[1] * c) * s * k];
      const O = [], I = [], M = [];
      for (let i = 0; i <= 12; i++) { const a = (25 + i * 130 / 12) * D2R; O.push([Math.cos(a) * 170, Math.sin(a) * 120 - 60]); }
      for (let i = 12; i >= 0; i--) { const a = (32 + i * 116 / 12) * D2R; I.push([Math.cos(a) * 150, Math.sin(a) * 70 - 64]); M.push([Math.cos(a) * 160, Math.sin(a) * 96 - 62]); }
      const SH = O.concat(I).map(T);
      f.setAttribute('d', inkLoop(SH, { seed: sd, t, amp: 0.6 }));
      sh.setAttribute('d', inkLoop(O.slice(2, 11).concat(M.slice(2, 11).reverse().reverse()).map(T), { seed: sd + 1, t, amp: 0.5 }));
      r.setAttribute('d', inkPath(SH, { w: 6, seed: sd + 2, t, closed: true }) + ' ' + inkPath(M.slice(1, 12).map(T), { w: 3, seed: sd + 3, t }));
      tips.setAttribute('d', inkPath([T(O[0]), T([O[0][0] + 26, O[0][1] - 30])], { w: 12, seed: sd + 4, t }) + ' ' + inkDot(...T(O[12]), 10 * s * k, 8 * s * k, sd + 5, t));
    } };
  }
  function dust(parent, sd) {
    const e = inkEl(parent, mix(INK.paperDark, INK.stain, 0.3)), r = inkEl(parent);
    return { update(t, x, y, k, s) {
      if (k <= 0 || k >= 1) { blank(e, r); return; }
      const F = [], R = [];
      for (let i = 0; i < 7; i++) { const P = inkEllipsePts(x + (i - 3) * 90 * s * (0.6 + k), y - k * 70 * s - (i % 2) * 40 * s, (60 + 70 * k) * s, (40 + 40 * k) * s, sd + i, 10, 0, 0.15); F.push(inkLoop(P, { seed: sd + i, t, amp: 1 })); R.push(inkPath(P.slice(6, 11), { w: 3, seed: sd + 20 + i, t })); }
      e.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
    } };
  }
  function bigText(parent, size) {
    const g = el(parent, 'g'), halo = el(g, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: 'none', stroke: INK.paperLight, 'stroke-width': 18, 'stroke-linejoin': 'round' }), tx = el(g, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.red });
    return { update(str, x, y, k, rot = -3) {
      halo.textContent = tx.textContent = str;
      g.setAttribute('transform', k <= 0.01 ? 'scale(0)' : `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${f1(k * 100) / 100})`);
    } };
  }

  // ------------------------------------------------------------------ SHOTS.pz_build (cutaway)
  SH.pz_build = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'sink', u = W / 1080, sd = seed * 1000 + 211;
      const gy = (P.gy ?? (mode === 'fall' ? 0.6 : 0.5)) * H, tx = (P.x ?? (mode === 'fall' ? 0.34 : 0.5)) * W, s = (P.s ?? (mode === 'fall' ? 0.98 : 1.3)) * u;
      const root = el(svg, 'g');
      const so = soil(el(root, 'g'), sd + 10);
      const tw = tower(el(root, 'g'), sd + 100, { ghost: mode === 'fall' });
      const crack = inkEl(root, INK.red), du2 = dust(el(root, 'g'), sd + 640), du = dust(el(root, 'g'), sd + 600);
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), Object.assign({ x: 0.2, y: P.gy ?? 0.5, scale: 0.85, pose: 'point', dir: -45, face: 'right' }, P.kasif), W, H, seed) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          let floors = 3, tilt = 4.2, sink = 44 * u, squeeze = 0, dropsK = 0, vines = 0, scaffold = false, dip = 0;
          if (mode === 'sink') {
            const sk = atOr(cues, 'sink', dur * 0.55);
            floors = 3 * prog(lt, 0.05, Math.max(0.8, sk - 0.4));
            const k = progIO(lt, sk - 0.1, 1.6);
            tilt = 4.6 * k + 0.25 * punch(lt, sk, 0.8) * Math.sin(lt * 30);
            sink = 50 * u * k; dip = sink * 1.1; scaffold = lt < sk;
          } else if (mode === 'settle') {
            const pa = atOr(cues, 'pause', 0.3), fm = atOr(cues, 'firm', dur * 0.7);
            squeeze = progIO(lt, pa, Math.max(0.8, fm - pa + 0.4)); dropsK = squeeze > 0 && squeeze < 1 ? 1 : 0.25 + 0.5 * squeeze * (1 - squeeze);
            vines = 0.5 + 0.5 * prog(lt, 0, dur); scaffold = true; dip = 55 * u;
          } else {
            const fc = atOr(cues, 'hit', dur * 0.55);
            const f0 = fc - (P.lead ?? 0.6), fk = clamp01((lt - f0) / (P.fallDur ?? 1.0)), fall = fk * fk;
            floors = Math.min(8, 3 + 5 * prog(lt, 0, Math.max(0.6, f0 - 0.2)));
            tilt = 4.5 + 4.5 * prog(lt, 0, f0) + ((P.fallTo ?? 72) - 9) * fall + (fk >= 1 ? 1.5 * punch(lt, f0 + (P.fallDur ?? 1.0), 0.6) * Math.sin(lt * 30) : 0);
            sink = (40 + 30 * prog(lt, 0, fc) + 40 * fall) * u; dip = sink * 1.2;
          }
          const S = so.update(t, W, H, gy, { squeeze, drops: dropsK, dip, dx: tx + 70 * s, dw: 300 * u });
          void S;
          const r = tw.update(t, { x: tx, gy, s, floors, tilt, sink, curve: 0, found: true, shadow: false, scaffold, vines });
          if (mode === 'fall') {
            const fc = atOr(cues, 'hit', dur * 0.55), f0 = fc - (P.lead ?? 0.6), ck = clamp01((lt - f0) / 0.4), C = [], imp = f0 + (P.fallDur ?? 1.0);
            if (ck > 0) r.info.slice(0, 4).forEach((f, i) => { const Z = []; for (let j = 0; j <= 5; j++) Z.push(f.Q(0.3 + 0.1 * (j % 2) + 0.08 * i, j / 5 * ck)); C.push(inkPath(Z, { w: 5, seed: sd + 700 + i, t, smooth: false })); });
            crack.setAttribute('d', C.join(' '));
            du.update(t, r.top[0] - 40 * s, Math.min(gy + 10 * u, r.top[1] + 120 * s), clamp01((lt - imp + 0.05) / 1.4), s * 1.2);
            du2.update(t, tx + 100 * s, gy + 10 * u, clamp01((lt - f0) / 1.8), s * 0.8);
          } else blank(crack);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ Piazza shots (pz_tower, pz_floors)
  function piazza(ctx, def) {
    const { P, W, H, svg, seed } = ctx;
    const mode = P.mode || def, u = W / 1080, sd = seed * 1000 + 431;
    const gy = (P.gy ?? 0.62) * H, fy = gy + 6 * u;
    const root = el(svg, 'g');
    const dm = P.duomo === false ? null : duomo(el(root, 'g'), sd + 10);
    const tw = tower(el(root, 'g'), sd + 100);
    const mason = mode === 'build' ? KASIF.create(el(root, 'g'), { scale: 0.42 * u, hat: false, accessory: 'beret', seed: sd + 300 }) : null;
    const plank = inkEl(root, WOOD()), meas = inkEl(root, INK.red);
    const tour = mode === 'plumb' ? [0, 1].map(i => KASIF.create(el(root, 'g'), { scale: (0.8 + 0.06 * i) * u, hat: false, accessory: null, beard: i ? 'short' : null, seed: sd + 320 + i * 7 })) : [];
    const plumb = inkEl(root, INK.red), axis = inkEl(root, INK.gold), axisR = inkEl(root, INK.red);
    const ar = arrow(el(root, 'g'), sd + 500);
    const ba = mode === 'banana' ? banana(el(root, 'g'), sd + 520) : null;
    const ln = lawn(el(root, 'g'), sd + 900);
    const birds = mode === 'hook' || mode === 'end' ? inkEl(root) : null;
    const bn = mode === 'hook' ? [bannerPole(el(root, 'g'), sd + 700), bannerPole(el(root, 'g'), sd + 720)] : [];
    const kas = P.kasif ? window.LH.kasif(el(root, 'g'), Object.assign({ x: 0.24, y: 0.8, scale: 1, pose: 'point', dir: 40, face: 'right' }, P.kasif), W, H, seed) : null;
    const LB = labels(root, P.labels, W, H);
    return {
      update(lt, dur, cues, env = {}) {
        const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5);
        const tx = (P.x ?? 0.5) * W, s = (P.s ?? 1.25) * u;
        if (dm) dm.update(t, (P.duomoX ?? 0.06) * W, gy, (P.duomoS ?? 0.95) * u);
        let floors = 8, tilt = P.tilt ?? 5, curve = P.curve ?? 1, scaffold = false;
        if (mode === 'hook') tilt += 1.2 * progIO(lt, 0, dur) + 0.5 * punch(lt, hit, 0.9) * Math.sin(lt * 26);
        if (mode === 'build') {
          floors = 4 + ['f1', 'f2', 'f3'].reduce((a, c, i) => a + spring(lt, atOr(cues, c, 0.3 + i * dur * 0.25), 0.55), 0);
          floors = Math.min(7, floors); scaffold = true;
        }
        const r = tw.update(t, { x: tx, gy, s, floors, tilt, curve, scaffold, sink: Math.sin(tilt * D2R) * 100 * s });
        // mason on a plank at the low side of the newest storey
        if (mason) {
          const f = r.info[r.info.length - 1], px = Math.max(f.BR[0], f.TR[0]) + 90 * u, py = Math.max(f.BR[1], f.TR[1]) - 4 * u;
          plank.setAttribute('d', inkLoop([[px - 120 * u, py], [px + 110 * u, py], [px + 110 * u, py + 18 * u], [px - 120 * u, py + 18 * u]], { seed: sd + 340, t, amp: 0.5, smooth: false }));
          mason.update(t, lt < hit ? 'hold' : 'point', { x: px + 20 * u, y: py, face: -1, since: lt < hit ? lt : lt - hit, dir: 30, item: lt < hit ? 'column' : undefined, emotion: 'happy' });
          const nf = r.info[r.info.length - 1], tgt = nf.Q(1, 0.5), from = [(P.arrowFrom ?? [0.8, 0.2])[0] * W, (P.arrowFrom ?? [0.8, 0.2])[1] * H];
          ar.update(t, from, [tgt[0] + 30 * u, tgt[1]], prog(lt, hit, 0.6));
          // red measure brackets: short on the left (high) side, long on the right (low) side
          const mk = prog(lt, atOr(cues, 'f3', hit - 0.5), 0.5), M = [];
          if (mk > 0) [[nf.BL, nf.TL, -1], [nf.BR, nf.TR, 1]].forEach(([a, b, sg], i) => {
            const dx = b[1] - a[1], dy = a[0] - b[0], L = Math.hypot(dx, dy) || 1, o = [sg * -dx / L * 34 * u, sg * -dy / L * 34 * u];
            const nx = [Math.abs(o[0]) > 0 ? o[0] / 34 / u : 0, o[1] / 34 / u];
            const A = add(a, o), B = add(L2(a, b, mk), o), tk = 18 * u;
            M.push(inkPath([A, B], { w: 9, seed: sd + 360 + i, t }), inkPath([add(A, nx, -tk), add(A, nx, tk)], { w: 8, seed: sd + 362 + i, t }));
            if (mk > 0.95) M.push(inkPath([add(B, nx, -tk), add(B, nx, tk)], { w: 8, seed: sd + 364 + i, t }));
          });
          meas.setAttribute('d', M.join(' '));
        } else if (mode !== 'banana') { plank.setAttribute('d', ''); ar.update(t, [0, 0], [0, 0], 0); }
        if (mode === 'plumb') {
          tour.forEach((g, i) => { const x = (0.17 + 0.17 * i) * W, y = gy + (150 + 70 * i) * u; g.update(t, 'point', { x, y, face: 1, dir: 52 + 6 * Math.sin(t * 1.4 + i), since: 1, emotion: 'happy' }); });
          const k = prog(lt, hit - 0.1, 1.1), top = r.top;
          plumb.setAttribute('d', dashed(top, [top[0], gy], k, sd + 540, t, 20, 14) + (k > 0.95 ? ' ' + inkDot(top[0], gy - 14 * u, 16 * u, 22 * u, sd + 560, t) : ''));
        } else plumb.setAttribute('d', '');
        if (mode === 'banana') {
          const ax = atOr(cues, 'axis', 0.3), k = prog(lt, ax, 1.3), C = r.centers;
          const pts = []; const n = C.length - 1;
          for (let i = 0; i <= n; i++) { if (i / n > k + 1e-6) { const j = Math.floor(k * n); pts.push(L2(C[j], C[Math.min(n, j + 1)], k * n - j)); break; } pts.push(C[i]); }
          axis.setAttribute('d', pts.length > 1 ? inkPath(pts, { w: 14, seed: sd + 580, t }) : '');
          const d0 = [r.info[0].c1[0] - r.info[0].c0[0], r.info[0].c1[1] - r.info[0].c0[1]], L0 = Math.hypot(...d0), H0 = C[0][1] - C[n][1] + 60 * u;
          axisR.setAttribute('d', dashed(C[0], [C[0][0] + d0[0] / L0 * H0 * 1.12, C[0][1] + d0[1] / L0 * H0 * 1.12], k, sd + 600, t, 7, 20));
          ba.update(t, (P.bananaX ?? 0.8) * W, (P.bananaY ?? 0.36) * H, (P.bananaS ?? 1.15) * u, spring(lt, hit, 0.6) * (1 + 0.1 * punch(lt, hit)), -60 + 4 * Math.sin(t * 2));
        } else blank(axis, axisR);
        ln.update(t, W, H, fy, { px: P.pathX, tufts: P.tufts });
        if (birds) {   // pigeons taking off and circling the top (startled at the hit)
          const B = [], tp = r.centers[5] || r.top;
          for (let i = 0; i < 6; i++) {
            const a = t * (1.6 + 0.15 * i) + i * 1.05, rr = (260 + 50 * i) * u + 90 * u * prog(lt, hit, 1.2), x = tp[0] + Math.cos(a) * rr, y = tp[1] + 60 * u + Math.sin(a) * rr * 0.35 - 30 * u * i * prog(lt, hit, 1.5), sc = 0.95 * u, fl = Math.sin(t * 9 + i) * 26 * sc;
            B.push(inkPath([[x - 60 * sc, y - 4 * sc - fl], [x - 28 * sc, y - 20 * sc - fl * 0.4], [x, y], [x + 28 * sc, y - 20 * sc - fl * 0.4], [x + 60 * sc, y - 4 * sc - fl]], { w: 6, seed: sd + 800 + i, t, taper: 0.3 }));
          }
          birds.setAttribute('d', B.join(' '));
        }
        const BNS = P.banners || [[0.36, -1], [0.93, -1]];
        bn.forEach((b, i) => BNS[i] && b.update(t, BNS[i][0] * W, H + 40 * u, (P.bannerLen ?? 1060) * u, 0.75 * u, spring(lt, hit + i * 0.15, 0.6), BNS[i][1]));
        if (kas) kas.update(lt, t, cues);
        LB.forEach(l => l.update(lt, t, cues));
      },
    };
  }
  SH.pz_tower = { kind: '2d', build: ctx => piazza(ctx, 'hook') };
  SH.pz_floors = { kind: '2d', build: ctx => piazza(ctx, 'build') };

  // ------------------------------------------------------------------ SHOTS.pz_war
  SH.pz_war = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const u = W / 1080, sd = seed * 1000 + 631, gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const N = P.soldiers ?? 5, sol = Array.from({ length: N }, (_, i) => soldier(el(root, 'g'), sd + 300 + i * 13, (0.6 + 0.05 * (i % 2)) * u, i % 2 === 0, 600));
      const tw = tower(el(root, 'g'), sd + 100);
      const ln = lawn(el(root, 'g'), sd + 900, true);
      const NF = P.front ?? 3, fr = Array.from({ length: NF }, (_, i) => soldier(el(root, 'g'), sd + 500 + i * 17, (1.35 + 0.08 * (i % 2)) * u, false, 190));
      const yr = bigText(root, 170 * u), sub = bigText(root, 0);
      void sub;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          tw.update(t, { x: (P.x ?? 0.36) * W, gy: gy - 20 * u, s: (P.s ?? 1.25) * u, floors: 3, tilt: 4.2, sink: 30 * u, scaffold: true, vines: prog(lt, hit, dur - hit) * 0.9 });
          for (let i = 0; i < N; i++) {
            const x = (-0.15 + i * 0.33 + lt * 0.11) * W, y = gy - 60 * u + (i % 2) * 30 * u;
            sol[i].update(t, ((x / W + 0.3) % 1.45 - 0.3) * W, y, lt * 0.95 + i * 0.37, 1);
          }
          ln.update(t, W, H, gy + 40 * u, { tufts: [0.04, 0.5, 0.96] });
          for (let i = 0; i < NF; i++) {   // the near row: big soldiers cropped by the frame bottom, marching the other way
            let q = (P.frontX ?? 1.1) - i * 0.5 - lt * 0.16; q = ((q + 0.3) % 1.5 + 1.5) % 1.5 - 0.3;
            fr[i].update(t, q * W, H + (230 + 50 * (i % 2)) * u, lt * 0.8 + i * 0.4, -1);
          }
          const k = prog(lt, hit, Math.max(0.6, dur - hit - 0.3)), from = P.from ?? 1178, to = P.to ?? 1272;
          yr.update(String(Math.round(lerp(from, to, k))), (P.yx ?? 0.66) * W, (P.yy ?? 0.25) * H, spring(lt, hit - 0.2, 0.5) * (1 + 0.08 * punch(lt, hit)));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
