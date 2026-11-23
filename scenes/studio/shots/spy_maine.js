// spy_maine: Operation Elster (29 Nov 1944, two German agents landed by U-1230 at Hancock Point, Maine) in parchment
// ink (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js; pure function of (seed, lt), no Math.random).
// Written for Stickstory ag-03-nazi-spies-maine (2026-11-23); parametric for any night landing / snowy road / cash
// suitcase moment. Palette tokens only (INK.*). Needs mcB__lib.js (window.MCB: cast, labels).
//
// Common P: kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, text, seq} · cast: [MCB cast entries]
//   labels: [MCB label entries {text, x, y, at, size, color, stamp, arrow}] · snow: 1 (falling snow density, 0 = none)
//   zoom: 1.05 (slow push-in), focus: [0.5, 0.6]
//
// SHOTS.spy_bay — a night bay seen from the water: far shore with pines and (optional) one lit cabin window, dark
//   water (use "set": {"name": "storm", "horizon": <water px>}), snow falling.
//   P: {mode: "surface"|"row"|"sub"|"dive", water: 0.56 (waterline 0..1 H), shore: true (pines on the far shore),
//       cabin: {x: 0.7} | false, sub: {x: 0.32, s: 1, rise: cue (surface: rises from under the water), dive: cue},
//       raft: {from: 0.42, to: 0.84, at: cue|sec, dur: 6, men: 2} (row: a rubber dinghy with a rower and two men with
//       suitcases), rocks: true (near rocks bottom right, where the raft lands)}
//   cues: hit, rise, dive, raft.at, label names
// SHOTS.spy_road — a snowy country road at night (use "set": {"name": "night", "ground": <px>}): pines, snow cover,
//   two men in long city coats carrying suitcases, footprints in the snow.
//   P: {mode: "walk"|"village"|"car"|"teen"|"tracks"|"empty", ground: 0.8,
//       spies: {x: 0.3, to: 0.6, at, dur: 4, scale: 0.62, face} | false, houses: [{x, w, lit: true}] (village),
//       car: {at, dur: 3.4, from: 1.25, to: -0.35, y} (headlights sweep across), teen: {x, to, at, dur, scale, look: cue},
//       prints: {from: 0.0, to: 0.7, at: 0, fill: cue (snow covers them)} , water: {from: 0.78} (tracks: shore + raft)}
//   cues: hit, car.at, teen.at, prints.fill, label names
// SHOTS.spy_case — close-up: an open leather suitcase on a table, packed with banded bundles of dollar bills; a small
//   pouch spills diamonds. P: {mode: "cash"|"spend", open: cue (lid swings open), diamonds: cue, fly: cue (spend:
//   bills fly out of the case one after another and the bundles shrink)}   cues: hit, open, diamonds, fly, labels
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const rot = (pts, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };

  function extras(root, P, W, H, sd) {
    const M = window.MCB;
    const list = (P.cast || []).slice();
    if (P.kasif) list.push(Object.assign({ who: 'kasif' }, P.kasif));
    const k = list.length ? M.cast(el(root, 'g'), list, W, H, sd + 501) : null;
    const lb = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 601);
    return { update(lt, t, cues) { if (k) k.update(lt, t, cues); lb.update(lt, t, cues); } };
  }
  function cam(g, lt, dur, W, H, P, hit) {
    const [fx, fy] = (P.focus || [0.5, 0.6]).map((v, i) => v * (i ? H : W));
    const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  // falling snow: one path of small blobs, positions a pure function of t
  function snow(parent, W, H, sd, n) {
    const p = inkEl(parent, INK.paperLight), r = rng(sd + 77), F = Array.from({ length: n }, () => [r(), r(), r(), r()]);
    return {
      update(t) {
        let d = '';
        F.forEach(([a, b, c, e], i) => {
          const sp = 60 + c * 90, y = ((b * (H + 80) + t * sp) % (H + 80)) - 40, x = a * W + Math.sin(t * (0.6 + e) + i) * 26 + t * 14 * (e - 0.3);
          const rr = 3 + c * 4.5; d += inkDot(((x % W) + W) % W, y, rr, rr, sd + i, t, 0.4) + ' ';
        });
        p.setAttribute('d', d);
      },
    };
  }
  // a pine silhouette (filled ink-soft, ink outline)
  function pinePts(x, y, h, w) {
    const pts = [[x, y - h]];
    for (let k = 1; k <= 4; k++) { const yy = y - h + h * k / 4.4; pts.push([x + w * k / 4, yy], [x + w * k / 9, yy - h * 0.04]); }
    pts.push([x + w * 0.1, y], [x - w * 0.1, y]);
    for (let k = 4; k >= 1; k--) { const yy = y - h + h * k / 4.4; pts.push([x - w * k / 9, yy - h * 0.04], [x - w * k / 4, yy]); }
    return pts;
  }
  function forest(parent, sd, list) {
    const f = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.85 }), o = inkEl(parent), sn = inkEl(parent, INK.paperLight);
    return {
      update(t) {
        let df = '', dl = '', ds = '';
        list.forEach(([x, y, h, w], i) => {
          const sw = Math.sin(t * 0.9 + i) * h * 0.006, P = pinePts(x + sw, y, h, w);
          df += inkLoop(P, { seed: sd + i, t, amp: 0.8, smooth: false }) + ' ';
          dl += inkPath(P, { w: Math.max(3, h / 70), seed: sd + 40 + i, t, amp: 0.8, closed: true, smooth: false }) + ' ';
          for (let k = 1; k <= 3; k++) { const yy = y - h + h * k / 4.4 - h * 0.035, ww = w * k / 6; ds += inkLoop([[x - ww, yy], [x, yy - h * 0.035], [x + ww, yy], [x, yy + h * 0.02]], { seed: sd + 80 + i * 4 + k, t, amp: 0.6 }) + ' '; }
        });
        f.setAttribute('d', df); o.setAttribute('d', dl); sn.setAttribute('d', ds);
      },
    };
  }
  // a long city overcoat + a suitcase on a walking rig (drawn by hand, follows the rig's x)
  function walker(parent, sd, o) {
    const coat = inkEl(parent, INK.inkSoft), coatL = inkEl(parent), g = el(parent, 'g');
    const rig = KASIF.create(g, { scale: o.scale, hat: false, accessory: o.accessory || null, seed: sd });
    const caseF = inkEl(parent, INK.red), caseL = inkEl(parent);
    return {
      update(t, x, gy, pose, face, ph, extra = {}) {
        const s = o.scale, top = gy - 318 * s, hip = gy - 150 * s, bob = pose === 'walk' ? Math.abs(Math.sin(ph * Math.PI * 2)) * 5 * s : 0;
        const C = [[x - 34 * s, top + bob], [x + 34 * s, top + bob], [x + 52 * s, hip - bob], [x - 52 * s, hip - bob]];
        coat.setAttribute('d', inkLoop(C, { seed: sd + 1, t, amp: 1 }));
        coatL.setAttribute('d', inkPath(C, { w: 5, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[x, top + 20 * s], [x, hip - 4]], { w: 3, seed: sd + 3, t }));
        rig.update(t, pose, Object.assign({ x, y: gy, face, ph, since: 2 }, extra));
        if (o.suitcase !== false) {
          const sw = pose === 'walk' ? Math.sin(ph * Math.PI * 2) * 7 * s : 0, cx = x + face * 64 * s + sw, cy = gy - 150 * s;
          const B = rect(cx - 46 * s, cy, cx + 46 * s, cy + 66 * s);
          caseF.setAttribute('d', inkLoop(B, { seed: sd + 4, t, amp: 0.8, smooth: false }));
          caseL.setAttribute('d', inkPath(B, { w: 5, seed: sd + 5, t, closed: true, smooth: false }) + ' ' +
            inkPath([[cx - 14 * s, cy], [cx - 12 * s, cy - 14 * s], [cx + 12 * s, cy - 14 * s], [cx + 14 * s, cy]], { w: 4, seed: sd + 6, t }) + ' ' +
            inkPath([[cx - 46 * s, cy + 30 * s], [cx + 46 * s, cy + 30 * s]], { w: 3, seed: sd + 7, t }));
        }
      },
    };
  }

  // ============================================================ spy_bay
  SH.spy_bay = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx, sd = seed + 11;
      const mode = P.mode || 'surface', WY = (P.water ?? 0.56) * H;
      const root = el(svg, 'g');
      const shore = P.shore === false ? null : forest(root, sd + 100, (() => {
        const r = rng(sd + 3), L = []; for (let x = -20; x < W + 40; x += 34 + r() * 40) L.push([x, WY - 4 - r() * 10, 90 + r() * 110, 46 + r() * 26]); return L; })());
      const hill = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.55 });
      const cabin = P.cabin ? { f: inkEl(root, INK.paperDark), l: inkEl(root), w: inkEl(root, INK.gold) } : null;
      // submarine (local units: length 1000, waterline 0)
      const clipId = 'spyclip' + seed;
      const cp = el(defs, 'clipPath', { id: clipId }); el(cp, 'rect', { x: -W, y: -H, width: W * 3, height: WY + H + 10 });
      const subWrap = el(root, 'g', { 'clip-path': `url(#${clipId})` });
      const sub = el(subWrap, 'g'); if (P.sub === false) subWrap.style.display = 'none';
      const hullF = inkEl(sub, INK.ink, { 'fill-opacity': 0.85 }), hullL = inkEl(sub), towerF = inkEl(sub, INK.ink), towerL = inkEl(sub), det = inkEl(sub, INK.paperLight);
      const SB = P.sub || {}, SX = (SB.x ?? (mode === 'sub' ? 0.5 : 0.3)) * W, SS = (SB.s ?? (mode === 'sub' ? 1.5 : 0.75)) * W / 1920;
      const water = inkEl(root, INK.blue, { 'fill-opacity': 0.35 }), wl = inkEl(root, INK.paperLight), ripples = inkEl(root, INK.paperLight);
      const raft = (mode === 'row' && P.raft !== false) ? (() => {
        const g = el(root, 'g'), f = inkEl(g, INK.inkSoft), l = inkEl(g), oar = inkEl(g);
        const men = [0, 1, 2].map(i => KASIF.create(el(g, 'g'), { scale: 0.3, hat: false, seed: sd + 300 + i * 9 }));
        const cases = inkEl(g, INK.red), casesL = inkEl(g);
        return { g, f, l, oar, men, cases, casesL };
      })() : null;
      const rocks = P.rocks ? { f: inkEl(root, INK.paperDark), l: inkEl(root), h: inkEl(root, INK.inkSoft), sn: inkEl(root, INK.paperLight) } : null;
      const bub = inkEl(root, INK.paperLight);
      const lc = P.case ? { f: inkEl(root, INK.red), l: inkEl(root), b: inkEl(root, INK.green, { 'fill-opacity': 0.85 }), bl: inkEl(root) } : null;
      const sn = snow(root, W, H, sd + 500, Math.round(70 * (P.snow ?? 1)));
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, WY / H] }, P), hit);
          // far hill behind the pines
          const hp = []; for (let x = -40; x <= W + 40; x += 80) hp.push([x, WY - 60 - 40 * Math.sin(x * 0.004 + 1) - 20 * Math.sin(x * 0.011)]);
          hill.setAttribute('d', inkLoop(hp.concat([[W + 40, WY + 4], [-40, WY + 4]]), { seed: sd + 1, t, amp: 0.8 }));
          if (shore) shore.update(t);
          if (cabin) {
            const cx = P.cabin.x * W, cy = WY - 8, B = [[cx - 60, cy], [cx - 60, cy - 70], [cx, cy - 115], [cx + 60, cy - 70], [cx + 60, cy]];
            cabin.f.setAttribute('d', inkLoop(B, { seed: sd + 5, t, smooth: false }));
            cabin.l.setAttribute('d', inkPath(B, { w: 5, seed: sd + 6, t, closed: true, smooth: false }));
            const fl = 0.75 + 0.25 * Math.sin(t * 7) * Math.sin(t * 2.3);
            cabin.w.setAttribute('d', inkLoop(rect(cx - 22, cy - 58, cx + 10, cy - 28), { seed: sd + 7, t, smooth: false }));
            cabin.w.setAttribute('fill-opacity', fl.toFixed(2));
          }
          // the U-boat
          let rise = 0, dive = 0;
          if (mode === 'surface') rise = 1 - progIO(lt, atOr(cues, SB.rise ?? 'rise', 0.8), 2.6);
          if (mode === 'dive') dive = progIO(lt, atOr(cues, SB.dive ?? 'dive', dur * 0.35), 3.2);
          const sy = WY + 4 + rise * 190 * SS + dive * 260 * SS + Math.sin(t * 0.9) * 4;
          sub.setAttribute('transform', `translate(${f1(SX)} ${f1(sy)}) rotate(${(dive * 4 - rise * 3).toFixed(2)}) scale(${SS.toFixed(4)})`);
          const hull = [[-520, -10], [-380, -46], [300, -46], [480, -20], [540, 0], [470, 34], [-430, 34], [-560, 6]];
          hullF.setAttribute('d', inkLoop(hull, { seed: sd + 20, t, amp: 1.5 }));
          hullL.setAttribute('d', inkPath(hull, { w: 8, seed: sd + 21, t, closed: true }) + ' ' + inkPath([[-470, -40], [-60, -150], [380, -40]], { w: 3, seed: sd + 22, t }) +
            ' ' + inkPath([[-470, -40], [-470, -60]], { w: 4, seed: sd + 23, t }) + ' ' + inkPath([[380, -40], [380, -60]], { w: 4, seed: sd + 24, t }));
          const tower = [[-110, -46], [-90, -150], [70, -150], [110, -100], [130, -46]];
          towerF.setAttribute('d', inkLoop(tower, { seed: sd + 25, t, amp: 1.2, smooth: false }));
          towerL.setAttribute('d', inkPath(tower, { w: 8, seed: sd + 26, t, smooth: false }) + ' ' + inkPath([[-40, -150], [-40, -230]], { w: 6, seed: sd + 27, t }) +
            ' ' + inkPath([[20, -150], [20, -205], [44, -205]], { w: 6, seed: sd + 28, t, smooth: false }) + ' ' + inkPath([[220, -46], [222, -78], [262, -78]], { w: 6, seed: sd + 29, t, smooth: false }));
          let dd = ''; for (let k = 0; k < 7; k++) dd += inkDot(-300 + k * 90, -2, 7, 7, sd + 30 + k, t) + ' ';
          det.setAttribute('d', dd);
          // water: front band + waterline + ripples round the hull
          const top = x => WY + Math.sin(x * 0.01 + t * 1.3) * 5 + Math.sin(x * 0.027 - t * 1.9) * 3;
          const wp = []; for (let x = -40; x <= W + 40; x += 40) wp.push([x, top(x)]);
          water.setAttribute('d', inkLoop(wp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 40, t, amp: 0.8, smooth: false }));
          wl.setAttribute('d', inkPath(wp, { w: 4, seed: sd + 41, t, amp: 1 }));
          let rd = '';
          for (let k = 0; k < 14; k++) { const y = WY + 30 + (k % 7) * (H - WY) / 7.5, x = ((k * 337 + t * (20 + k * 3)) % (W + 300)) - 150, len = 60 + (k % 4) * 30; rd += inkPath([[x, y], [x + len / 2, y - 5], [x + len, y]], { w: 3, seed: sd + 50 + k, t }) + ' '; }
          if (rise < 0.95) for (let k = 0; k < 3; k++) { const u = ((t * 0.5 + k / 3) % 1); rd += inkPath([[SX - 560 * SS - u * 60, WY + 6 + k * 8], [SX + 560 * SS + u * 60, WY + 6 + k * 8]], { w: 3, seed: sd + 70 + k, t }) + ' '; }
          ripples.setAttribute('d', rd);
          // the raft rows from the sub to the near rocks
          if (raft) {
            const R = P.raft || {}, ra = atOr(cues, R.at, 0.2), u = progIO(lt, ra, R.dur ?? Math.max(3, dur - ra - 0.5));
            const rx = lerp((R.from ?? 0.42) * W, (R.to ?? 0.82) * W, u), ry = lerp(WY + 40, (R.y ?? 0.82) * H, u) + Math.sin(t * 1.6) * 6;
            const sc = lerp(R.s0 ?? 0.8, R.s1 ?? 1.5, u);
            raft.g.setAttribute('transform', `translate(${f1(rx)} ${f1(ry)}) rotate(${(Math.sin(t * 1.4) * 2.5).toFixed(2)}) scale(${sc.toFixed(3)})`);
            const B = [[-170, -18], [-120, -34], [120, -34], [175, -20], [160, 18], [-160, 18]];
            raft.f.setAttribute('d', inkLoop(B, { seed: sd + 80, t, amp: 0.8 }));
            raft.l.setAttribute('d', inkPath(B, { w: 6, seed: sd + 81, t, closed: true }) + ' ' + inkPath([[-150, -2], [150, -2]], { w: 3, seed: sd + 82, t }));
            if (R.empty) { raft.men.forEach(m => m.node && (m.node.style.display = 'none')); } else raft.men.forEach((m, i) => { if (i === 0 && R.rower === false) { m.node.style.display = 'none'; return; } m.update(t, i === 0 ? 'talk' : 'sit', { x: -95 + i * 85, y: -24, face: i === 0 ? -1 : 1, since: 2 }); });
            const oa = Math.sin(t * 2.6) * 0.5;
            raft.oar.setAttribute('d', R.empty ? '' : R.rower === false ? inkPath([[-150, -10], [-215, 34 + Math.sin(t * 2.6) * 8]], { w: 7, seed: sd + 83, t }) + ' ' + inkPath([[150, -10], [215, 34 - Math.sin(t * 2.6) * 8]], { w: 7, seed: sd + 84, t }) : inkPath(rot([[-110, -80], [-230, 40]], -110, -80, oa), { w: 6, seed: sd + 83, t }) + ' ' + inkPath(rot([[-110, -80], [10, 40]], -110, -80, -oa), { w: 6, seed: sd + 84, t }));
            let cd = '', cl = ''; [[0, -30], [80, -30]].forEach(([x, y], k) => { const C = rect(x - 22, y - 34, x + 22, y); cd += inkLoop(C, { seed: sd + 85 + k, t, smooth: false }) + ' '; cl += inkPath(C, { w: 4, seed: sd + 87 + k, t, closed: true, smooth: false }) + ' '; });
            raft.cases.setAttribute('d', R.empty ? '' : cd); raft.casesL.setAttribute('d', R.empty ? '' : cl);
          }
          if (rocks) {
            const ox = ((P.rocks.x0 ?? 0.7) - 0.7) * W, B = [[W * 0.7 + ox, H + 40], [W * 0.74 + ox, H * 0.9], [W * 0.82 + ox, H * 0.84], [W * 0.9 + ox, H * 0.8], [W * 0.98 + ox, H * 0.76], [W + 40, H * 0.75], [W + 40, H + 40]];
            rocks.f.setAttribute('d', inkLoop(B, { seed: sd + 90, t, smooth: false }));
            rocks.l.setAttribute('d', inkPath(B.slice(0, 6), { w: 7, seed: sd + 91, t, smooth: false }));
            let hd = ''; for (let k = 0; k < 8; k++) { const x = W * (0.78 + k * 0.03) + ox * (1 - k / 10), y = H * (0.88 + (k % 3) * 0.035); hd += inkPath([[x, y], [x + 40, y + 18]], { w: 4, seed: sd + 92 + k, t }) + ' '; }
            rocks.h.setAttribute('d', hd);
            rocks.sn.setAttribute('d', inkLoop([[W * 0.8 + ox, H * 0.845], [W * 0.9 + ox, H * 0.805], [W * 0.98 + ox, H * 0.77], [W + 40, H * 0.76], [W + 40, H * 0.785], [W * 0.9 + ox, H * 0.83]], { seed: sd + 99, t }));
          }
          let bd = ''; if (mode === 'dive' && dive > 0.05) for (let i = 0; i < 12; i++) { const u = ((lt * 0.7 + i * 0.11) % 1); bd += inkCircle(SX + Math.sin(i * 2.1) * 420 * SS, WY + 40 + (1 - u) * 120, 5 + (i % 3) * 3, sd + 110 + i, t, { w: 3 }) + ' '; }
          bub.setAttribute('d', bd);
          if (lc) { const cx = P.case.x * W, cy = P.case.y * H, B = [[cx - 90, cy - 110], [cx + 90, cy - 110], [cx + 96, cy], [cx - 96, cy]];
            lc.f.setAttribute('d', inkLoop(B, { seed: sd + 120, t, smooth: false }));
            lc.l.setAttribute('d', inkPath(B, { w: 7, seed: sd + 121, t, closed: true, smooth: false }) + ' ' + inkPath([[cx - 26, cy - 110], [cx - 22, cy - 138], [cx + 22, cy - 138], [cx + 26, cy - 110]], { w: 6, seed: sd + 122, t }) + ' ' + inkPath([[cx - 96, cy - 50], [cx + 96, cy - 50]], { w: 4, seed: sd + 123, t }));
            const fa = atOr(cues, P.case.fly, null); let fd = '', fl = '';
            if (fa != null) for (let k = 0; k < 10; k++) { const s = fa + k * 0.35, u = (lt - s) / 2.4; if (u < 0 || u > 1) continue; const x = cx + (k % 2 ? 1 : -1) * u * 260 + Math.sin(k * 2) * 40, y = cy - 130 - u * 380 + Math.sin(u * 8 + k) * 24, a = u * 5 + k;
              const R = rot(rect(x - 46, y - 20, x + 46, y + 20), x, y, a * 0.5); fd += inkLoop(R, { seed: sd + 130 + k, t, smooth: false }) + ' '; fl += inkPath(R, { w: 4, seed: sd + 150 + k, t, closed: true, smooth: false }) + ' '; }
            lc.b.setAttribute('d', fd); lc.bl.setAttribute('d', fl); }
          sn.update(t);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_road
  SH.spy_road = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 23;
      const mode = P.mode || 'walk', GY = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g');
      const r0 = rng(sd + 5), trees = [];
      const tx = mode === 'village' ? [0.04, 0.12, 0.5, 0.58, 0.95] : mode === 'tracks' ? [0.04, 0.14, 0.24, 0.44, 0.56] : [0.03, 0.11, 0.2, 0.62, 0.76, 0.88, 0.97];
      tx.forEach(x => trees.push([x * W + (r0() - 0.5) * 40, GY - 30, 300 + r0() * 160, 120 + r0() * 50]));
      const houses = mode === 'village' ? (P.houses || [{ x: 0.3, w: 0.16, lit: false }, { x: 0.76, w: 0.2, lit: true }]).map(() => ({ f: inkEl(root, INK.paperDark), l: inkEl(root), w: inkEl(root, INK.gold), d: inkEl(root, INK.inkSoft), s: inkEl(root, INK.paperLight) })) : [];
      const fo = forest(root, sd + 100, trees);
      const snowF = inkEl(root, INK.paperLight), snowL = inkEl(root, INK.inkSoft), ruts = inkEl(root, INK.inkSoft);
      const water = mode === 'tracks' ? { f: inkEl(root, INK.blue, { 'fill-opacity': 0.75 }), l: inkEl(root), raft: inkEl(root, INK.inkSoft), rl: inkEl(root) } : null;
      const prints = inkEl(root, INK.inkSoft);
      const beam = inkEl(root, INK.gold, { 'fill-opacity': 0.32 });
      const car = mode === 'car' ? { f: inkEl(root, INK.ink, { 'fill-opacity': 0.9 }), l: inkEl(root), w: inkEl(root, INK.paperLight), wh: inkEl(root), lamp: inkEl(root, INK.gold), drv: inkEl(root) } : null;
      const S = P.spies === false || mode === 'village' || mode === 'empty' || mode === 'tracks' ? null : Object.assign({ x: 0.3, to: 0.62, scale: 0.62 }, P.spies || {});
      const men = S ? [0, 1].map(i => walker(el(root, 'g'), sd + 200 + i * 31, { scale: S.scale * (i ? 0.96 : 1) })) : [];
      const teen = P.teen ? (() => { const g = el(root, 'g'); return KASIF.create(g, { scale: P.teen.scale ?? 0.58, hat: false, accessory: P.teen.accessory ?? 'slouch', seed: sd + 260 }); })() : null;
      const sn = snow(root, W, H, sd + 500, Math.round(80 * (P.snow ?? 1)));
      const ex = extras(root, P, W, H, sd);
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, GY / H - 0.15] }, P), hit);
          // houses (village)
          houses.forEach((hh, i) => {
            const Hd = (P.houses || [{ x: 0.3, w: 0.16, lit: false }, { x: 0.76, w: 0.2, lit: true }])[i];
            const cx = Hd.x * W, w = Hd.w * W, hgt = w * 0.55, y = GY - 10;
            const B = [[cx - w / 2, y], [cx - w / 2, y - hgt], [cx, y - hgt - w * 0.36], [cx + w / 2, y - hgt], [cx + w / 2, y]];
            hh.f.setAttribute('d', inkLoop(B, { seed: sd + 30 + i, t, smooth: false }));
            hh.l.setAttribute('d', inkPath(B, { w: 6, seed: sd + 32 + i, t, closed: true, smooth: false }) + ' ' + inkPath(rect(cx - w * 0.08, y - hgt * 0.62, cx + w * 0.08, y), { w: 5, seed: sd + 34 + i, t, smooth: false, closed: true }));
            const win = [rect(cx - w * 0.38, y - hgt * 0.8, cx - w * 0.18, y - hgt * 0.45), rect(cx + w * 0.18, y - hgt * 0.8, cx + w * 0.38, y - hgt * 0.45)];
            hh.w.setAttribute('d', Hd.lit ? inkLoop(win[1], { seed: sd + 36 + i, t, smooth: false }) : '');
            hh.w.setAttribute('fill-opacity', (0.7 + 0.3 * Math.sin(t * 5 + i)).toFixed(2));
            hh.d.setAttribute('d', win.map((q, k) => (Hd.lit && k === 1) ? '' : inkLoop(q, { seed: sd + 38 + i + k, t, smooth: false })).join(' '));
            hh.s.setAttribute('d', inkLoop([[cx - w / 2 - 14, y - hgt + 4], [cx, y - hgt - w * 0.36 - 10], [cx + w / 2 + 14, y - hgt + 4], [cx, y - hgt - w * 0.3]], { seed: sd + 40 + i, t }));
          });
          fo.update(t);
          // snow cover + road ruts
          const sp = []; for (let x = -40; x <= W + 40; x += 60) sp.push([x, GY - 6 + Math.sin(x * 0.013 + 2) * 8]);
          snowF.setAttribute('d', inkLoop(sp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 60, t, amp: 0.8, smooth: false }));
          snowL.setAttribute('d', inkPath(sp, { w: 4, seed: sd + 61, t }));
          const rutY = [GY + (H - GY) * 0.25, GY + (H - GY) * 0.7];
          ruts.setAttribute('d', rutY.map((y, k) => inkPath([[-40, y], [W * 0.5, y + 8], [W + 40, y - 4]], { w: 3, seed: sd + 62 + k, t })).join(' '));
          // shore water at the right (tracks)
          if (water) {
            const x0 = (P.water && P.water.from != null ? P.water.from : 0.74) * W;
            const B = [[x0, GY + 10], [W + 40, GY - 20], [W + 40, H + 40], [x0 + 160, H + 40]];
            water.f.setAttribute('d', inkLoop(B, { seed: sd + 50, t, smooth: false }));
            let wd = inkPath([[x0, GY + 10], [x0 + 80, GY + 140], [x0 + 160, H + 40]], { w: 6, seed: sd + 51, t });
            for (let k = 0; k < 5; k++) { const y = GY + 40 + k * 40, x = x0 + 120 + k * 30 + Math.sin(t * 1.5 + k) * 20; wd += ' ' + inkPath([[x, y], [x + 120, y - 4]], { w: 3, seed: sd + 52 + k, t }); }
            water.l.setAttribute('d', wd);
            const rx = x0 + 230, ry = GY + 80 + Math.sin(t * 1.3) * 5, Rf = [[rx - 120, ry - 10], [rx - 80, ry - 30], [rx + 90, ry - 30], [rx + 125, ry - 12], [rx + 110, ry + 16], [rx - 110, ry + 16]];
            water.raft.setAttribute('d', inkLoop(Rf, { seed: sd + 58, t }));
            water.rl.setAttribute('d', inkPath(Rf, { w: 6, seed: sd + 59, t, closed: true }));
          }
          // footprints
          const Pr = P.prints || (S ? { from: S.x, to: S.to, follow: true } : null);
          let pd = '';
          if (Pr) {
            const fillA = atOr(cues, Pr.fill, null), fade = fillA != null ? 1 - prog(lt, fillA, 2.5) : 1;
            const pa = atOr(cues, Pr.at, 0), up = Pr.follow ? 1 : prog(lt, pa, Pr.dur ?? 2.4);
            const n = 24, y = GY + (H - GY) * 0.48;
            for (let k = 0; k < n; k++) {
              const u = k / (n - 1), x = lerp(Pr.from * W, Pr.to * W, u);
              if (!Pr.follow && u > up) break;
              if (Pr.follow && S) { const wx = lerp(S.x, S.to, progIO(lt, atOr(cues, S.at, 0), S.dur ?? Math.max(2, dur - 0.6))); if ((S.to > S.x ? x > wx * W - 60 : x < wx * W + 60)) continue; }
              if (fade < 0.05) break;
              const yy = y + (k % 2 ? 14 : -14) + (Pr.slope ? Pr.slope * u * (H - GY) : 0);
              pd += inkDot(x, yy, 13 * fade, 6 * fade, sd + 70 + k, t, 0.4) + ' ';
            }
          }
          prints.setAttribute('d', pd);
          // car with headlights
          if (car) {
            const C = P.car || {}, ca = atOr(cues, C.at, 0.4), u = progIO(lt, ca, C.dur ?? 3.6);
            const cx = lerp((C.from ?? 1.25) * W, (C.to ?? -0.35) * W, u), cy = (C.y ?? (GY + (H - GY) * 0.42) / H) * H, dir = (C.to ?? -0.35) < (C.from ?? 1.25) ? -1 : 1;
            const body = [[-200, 0], [-205, -60], [-120, -78], [-70, -140], [80, -140], [130, -78], [210, -66], [215, 0]].map(([x, y]) => [cx + x * dir, cy + y]);
            car.f.setAttribute('d', inkLoop(body, { seed: sd + 80, t }));
            car.l.setAttribute('d', inkPath(body, { w: 6, seed: sd + 81, t, closed: true }));
            car.w.setAttribute('d', inkLoop([[-55, -128], [65, -128], [100, -84], [-95, -84]].map(([x, y]) => [cx + x * dir, cy + y]), { seed: sd + 82, t, smooth: false }));
            const sp2 = t * 9; car.wh.setAttribute('d', [-120, 130].map((x, k) => inkCircle(cx + x * dir, cy + 4, 40, sd + 83 + k, t, { w: 9 }) + ' ' + inkPath([[cx + x * dir - Math.cos(sp2) * 30, cy + 4 - Math.sin(sp2) * 30], [cx + x * dir + Math.cos(sp2) * 30, cy + 4 + Math.sin(sp2) * 30]], { w: 4, seed: sd + 85 + k, t })).join(' '));
            const lx = cx + 205 * dir, ly = cy - 44;
            car.lamp.setAttribute('d', inkDot(lx, ly, 16, 14, sd + 87, t));
            beam.setAttribute('d', u > 0 && u < 1 ? inkLoop([[lx, ly - 12], [lx + dir * 900, ly - 150], [lx + dir * 900, ly + 170], [lx, ly + 12]], { seed: sd + 88, t, smooth: false }) : '');
            car.drv.setAttribute('d', inkCircle(cx + 20 * dir, cy - 106, 18, sd + 89, t, { w: 5 }) + ' ' + inkDot(cx + 26 * dir, cy - 108, 3, 3, sd + 90, t));
          } else beam.setAttribute('d', '');
          // the two men
          if (S) {
            const sa = atOr(cues, S.at, 0), sdur = S.dur ?? Math.max(2, dur - 0.6), u = progIO(lt, sa, sdur), moving = lt > sa && u < 1;
            const face = S.face != null ? (S.face === 'left' ? -1 : 1) : (S.to >= S.x ? 1 : -1);
            const xs = lerp(S.x, S.to, u) * W, y = GY + (H - GY) * 0.42;
            men.forEach((m, i) => {
              const x = xs - face * i * 190 * S.scale, ph = Math.abs(lerp(S.x, S.to, u) - S.x) * W / (gait * S.scale) + i * 0.37;
              m.update(t, x, y - i * 6, moving ? 'walk' : (S.pose || 'idle'), face, ph);
            });
          }
          if (teen) {
            const T = P.teen, ta = atOr(cues, T.at, 0), u = progIO(lt, ta, T.dur ?? 3.2), moving = T.to != null && lt > ta && u < 1;
            const x = lerp(T.x, T.to ?? T.x, u) * W, y = GY + (H - GY) * (T.y ?? 0.62), dirn = (T.to ?? T.x) >= T.x ? 1 : -1;
            const look = atOr(cues, T.look, null), face = look != null && lt > look ? -dirn : dirn;
            const pose = moving ? 'walk' : (look != null && lt > look ? (T.then || 'look') : (T.pose || 'idle'));
            teen.update(t, pose, { x, y, face, ph: Math.abs(x - T.x * W) / (gait * (T.scale ?? 0.58)), since: look != null ? lt - look : 2, emotion: look != null && lt > look ? 'surprised' : null, dir: 0 });
          }
          sn.update(t);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_case
  SH.spy_case = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 41;
      const mode = P.mode || 'cash';
      const root = el(svg, 'g');
      const table = inkEl(root, INK.paperDark), tableL = inkEl(root), grain = inkEl(root, INK.inkSoft);
      const lidF = inkEl(root, INK.red), lidL = inkEl(root), lining = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.85 }), straps = inkEl(root, INK.stain);
      const baseF = inkEl(root, INK.red), baseL = inkEl(root), inner = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.6 });
      const bills = inkEl(root, INK.green, { 'fill-opacity': 0.75 }), billL = inkEl(root), bands = inkEl(root, INK.paperLight), bandL = inkEl(root);
      const pouch = inkEl(root, INK.stain), pouchL = inkEl(root), gems = inkEl(root, INK.paperLight), gemL = inkEl(root, INK.blue), sparks = inkEl(root, INK.gold);
      const flyF = inkEl(root, INK.green, { 'fill-opacity': 0.8 }), flyL = inkEl(root);
      const ex = extras(root, P, W, H, sd);
      const cx = (P.x ?? 0.42) * W, by = (P.y ?? 0.78) * H, cw = (P.w ?? 0.6) * W, ch = cw * 0.2;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [cx / W, by / H - 0.2], zoom: 1.06 }, P), hit);
          const TB = [[-60, by + 10], [W + 60, by - 10], [W + 60, H + 60], [-60, H + 60]];
          table.setAttribute('d', inkLoop(TB, { seed: sd + 1, t, smooth: false }));
          tableL.setAttribute('d', inkPath([[-60, by + 10], [W + 60, by - 10]], { w: 7, seed: sd + 2, t }));
          let gd = ''; for (let k = 0; k < 7; k++) { const y = by + 50 + k * 34; gd += inkPath([[-20, y], [W * 0.4, y + 6], [W + 20, y - 3]], { w: 3, seed: sd + 3 + k, t }) + ' '; }
          grain.setAttribute('d', gd);
          // lid: hinged at the back edge, opens upward
          const oa = atOr(cues, P.open, mode === 'spend' ? -5 : 0.3), op = mode === 'spend' ? 1 : spring(lt, oa, 1.0);
          const back = by - ch * 1.6, lh = cw * 0.24 * clamp01(op);
          const lid = [[cx - cw / 2, back], [cx + cw / 2, back], [cx + cw / 2 - 20, back - lh], [cx - cw / 2 + 20, back - lh]];
          lidF.setAttribute('d', lh > 4 ? inkLoop(lid, { seed: sd + 10, t, smooth: false }) : '');
          lidL.setAttribute('d', lh > 4 ? inkPath(lid, { w: 7, seed: sd + 11, t, closed: true, smooth: false }) : '');
          lining.setAttribute('d', lh > 30 ? inkLoop([[cx - cw / 2 + 30, back - 14], [cx + cw / 2 - 30, back - 14], [cx + cw / 2 - 44, back - lh + 24], [cx - cw / 2 + 44, back - lh + 24]], { seed: sd + 12, t, smooth: false }) : '');
          straps.setAttribute('d', lh > 30 ? [-0.28, 0.28].map((k, i) => inkLoop(rect(cx + k * cw - 22, back - lh + 26, cx + k * cw + 22, back - 16), { seed: sd + 300 + i, t, smooth: false })).join(' ') + ' ' + inkLoop(rect(cx - cw * 0.14, back - lh * 0.75, cx + cw * 0.14, back - 30), { seed: sd + 303, t, smooth: false }) : '');
          // base (box seen from the front-top)
          const base = [[cx - cw / 2, back], [cx + cw / 2, back], [cx + cw / 2 + 30, by], [cx - cw / 2 - 30, by]];
          const front = [[cx - cw / 2 - 30, by], [cx + cw / 2 + 30, by], [cx + cw / 2 + 30, by + ch * 0.9], [cx - cw / 2 - 30, by + ch * 0.9]];
          baseF.setAttribute('d', inkLoop(base, { seed: sd + 13, t, smooth: false }) + ' ' + inkLoop(front, { seed: sd + 14, t, smooth: false }));
          baseL.setAttribute('d', inkPath(base, { w: 7, seed: sd + 15, t, closed: true, smooth: false }) + ' ' + inkPath(front, { w: 7, seed: sd + 16, t, closed: true, smooth: false }) +
            ' ' + [-0.3, 0.3].map((k, i) => inkPath(rect(cx + k * cw - 22, by + 8, cx + k * cw + 22, by + 44), { w: 5, seed: sd + 17 + i, t, closed: true, smooth: false })).join(' '));
          inner.setAttribute('d', inkLoop([[cx - cw / 2 + 24, back + 10], [cx + cw / 2 - 24, back + 10], [cx + cw / 2, by - 14], [cx - cw / 2, by - 14]], { seed: sd + 18, t, smooth: false }));
          // bundles of bills in rows
          const fa = atOr(cues, P.fly, mode === 'spend' ? 0.3 : null);
          const gone = fa != null ? clamp01((lt - fa) / Math.max(1, dur - fa - 0.4)) : 0;
          let bd = '', bl = '', nd = '', nl = '', i = 0;
          const rows = 3, cols = 6, bw = cw / cols * 0.84, bh = ch * 0.42;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
            if (i / (rows * cols) < gone) continue;
            const u = (c + 0.5) / cols - 0.5, ry = back + 26 + r * (bh + 10), x = cx + u * (cw - 60) * (1 + r * 0.05);
            const B = rect(x - bw / 2, ry, x + bw / 2, ry + bh);
            bd += inkLoop(B, { seed: sd + 30 + i, t, amp: 0.8, smooth: false }) + ' '; bl += inkPath(B, { w: 4, seed: sd + 60 + i, t, closed: true, smooth: false }) + ' ';
            const Bd = rect(x - 12, ry - 2, x + 12, ry + bh + 2); nd += inkLoop(Bd, { seed: sd + 90 + i, t, smooth: false }) + ' '; nl += inkPath(Bd, { w: 3, seed: sd + 120 + i, t, closed: true, smooth: false }) + ' ';
          }
          bills.setAttribute('d', bd); billL.setAttribute('d', bl); bands.setAttribute('d', nd); bandL.setAttribute('d', nl);
          // flying bills (spend)
          let fd = '', fl = '';
          if (fa != null) for (let k = 0; k < 9; k++) {
            const st = fa + k * 0.45, u = (lt - st) / 1.8; if (u < 0 || u > 1) continue;
            const x = cx + (k % 2 ? 1 : -1) * (80 + u * W * 0.45) + Math.sin(k * 3) * 60, y = back - u * H * 0.55 + Math.sin(u * 9 + k) * 30;
            const a = u * 6 + k, B = rot(rect(x - 70, y - 30, x + 70, y + 30), x, y, a * 0.6);
            fd += inkLoop(B, { seed: sd + 150 + k, t, smooth: false }) + ' '; fl += inkPath(B, { w: 4, seed: sd + 170 + k, t, closed: true, smooth: false }) + ' ' + inkCircle(x, y, 16, sd + 190 + k, t, { w: 3 }) + ' ';
          }
          flyF.setAttribute('d', fd); flyL.setAttribute('d', fl);
          // diamond pouch
          if (mode === 'cash') {
            const da = atOr(cues, P.diamonds, null), dp = da != null ? spring(lt, da, 0.8) : 0;
            const back2 = by - ch * 1.6, px = cx + cw * 0.06, py = back2 - 34;
            const Pp = [[px - 70, py], [px - 80, py - 70], [px - 30, py - 120], [px + 30, py - 120], [px + 80, py - 70], [px + 70, py]];
            pouch.setAttribute('d', inkLoop(Pp, { seed: sd + 200, t }));
            pouchL.setAttribute('d', inkPath(Pp, { w: 6, seed: sd + 201, t, closed: true }) + ' ' + inkPath([[px - 40, py - 112], [px, py - 100], [px + 40, py - 112]], { w: 4, seed: sd + 202, t }));
            let gd2 = '', gl = '', sk = '';
            for (let k = 0; k < 9; k++) {
              const u = clamp01(dp * 1.2 - k * 0.04), gx = px + 100 + k * 34 * u + Math.sin(k) * 10, gy = py + 10 - Math.abs(Math.sin(k * 1.7)) * 12, s = 16 + (k % 3) * 4;
              if (dp < 0.02) break;
              const G = [[gx - s, gy - s * 0.3], [gx - s * 0.5, gy - s], [gx + s * 0.5, gy - s], [gx + s, gy - s * 0.3], [gx, gy + s]];
              gd2 += inkLoop(G, { seed: sd + 210 + k, t, smooth: false, amp: 0.6 }) + ' '; gl += inkPath(G, { w: 3, seed: sd + 230 + k, t, closed: true, smooth: false, amp: 0.6 }) + ' ';
              const tw = Math.max(0, Math.sin(t * 4 + k * 1.3)); if (tw > 0.7) sk += inkPath([[gx - 14, gy - s - 14], [gx + 14, gy - s - 14]], { w: 3, seed: sd + 250 + k, t }) + ' ' + inkPath([[gx, gy - s - 28], [gx, gy - s]], { w: 3, seed: sd + 270 + k, t }) + ' ';
            }
            gems.setAttribute('d', gd2); gemL.setAttribute('d', gl); sparks.setAttribute('d', sk);
          }
          ex.update(lt, t, cues);
        },
      };
    },
  };
})();
