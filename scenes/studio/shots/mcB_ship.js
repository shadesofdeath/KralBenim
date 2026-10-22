// mcB_ship: side view of a two-masted brigantine (the Mary Celeste) at sea in parchment ink (BRAND.md §3, §5; every
// line boils at 8 Hz via _ink.js; pure function of (seed, lt), no Math.random). Written for the Mary Celeste long video
// (chapters 4-7) but parametric: drifting ghost ship with torn sails, two ships sailing together, a lifeboat on a long
// tow rope that snaps, a lifeboat rowing towards an island, a ship running onto a reef, an empty ocean.
// Needs mcB__lib.js (window.MCB).
// P: {horizon: 0.5, water: 0.74 (near water line, 0..1 H),
//     ships: [{x: 0.5, to, at: 0, dur (travel time; default whole scene), scale: 1, face: 1|-1, sails: "full"|"half"|"torn"|"none",
//              name: "MARY CELESTE", boat: "deck"|"none" (lifeboat on deck), boat_scale: 1 (deck lifeboat size), wander: false (rolls hard, no one steering),
//              heel: 0 (deg), strike: cue (reef hit: jolt + heel 9° + red cracks), flag: true, far: false}],
//     boats: [{x: 0.7, y (waterline 0..1 H; default water), scale: 1, crew: 3, row: true, to, at, dur, face: 1|-1,
//              tow: {ship: 0, len: 0.2 (W), snap: cue, drift: 40 px/s}, fade: {at, dur: 2}}],
//     island: {x: 0.2, w: 0.22, h: 0.06, at, bold: false (green fill, ink outline, hatching)} (island on the horizon), gib: {x: 0.8, at} (Rock of Gibraltar),
//     reef: {x: 0.66, w: 0.22, at} (jagged rocks at the water line),
//     rocks: [{x, y, w: 0.12}] (rocks in front of the water for cast to stand on),
//     cast: [...MCB cast entries], labels: [...MCB label entries], sky: {clouds: 3, gulls: 2},
//     shake: [cue...], cam: {zoom: 1.05, focus: [0.5, 0.55]}}
// cues: hit (punch), ships[].strike, boats[].tow.snap, island.at, labels/cast "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const M = () => window.MCB;

  // ---- brigantine geometry (bow to +x, waterline y = 0, ~760 units long)
  const HULL = [[-372, -96], [-200, -82], [100, -84], [330, -102], [394, -124], [376, -64], [330, 10], [-330, 14], [-354, -30]];
  const BAND = [[-366, -76], [-200, -62], [100, -64], [330, -82], [386, -102], [380, -84], [330, -64], [100, -46], [-200, -44], [-360, -58]];
  const FORE = 150, MAIN = -140;
  const SQ = [ // [top y, bottom y, top half-width, bottom half-width] foremast square sails, low to high
    [-232, -116, 150, 168], [-362, -244, 130, 148], [-472, -372, 110, 128], [-560, -480, 84, 104]];
  const YARDS = [-232, -362, -472, -560];

  function makeShip(g, sd) {
    const P = (f, x) => inkEl(g, f, x);
    return {
      sailF: SQ.map(() => P(INK.paperLight)), sailR: SQ.map(() => P()), furl: SQ.map(() => P(INK.paperDark)),
      tatter: SQ.map(() => P(INK.paperLight)), tatR: SQ.map(() => P()),
      gaffF: P(INK.paperLight), gaffR: P(), jibF: [P(INK.paperLight), P(INK.paperLight)], jibR: [P(), P()],
      rig: P(INK.inkSoft), masts: P(), yards: P(), flag: P(INK.red),
      boatF: P(INK.paperLight), boatR: P(),
      hullF: P(INK.paperDark), band: P(INK.inkSoft), hullR: P(), rail: P(), ports: P(),
      cracks: P(INK.red), name: null, sd,
    };
  }
  function drawShip(S, t, o) {
    const sd = S.sd, ip = (pts, k, w, x) => inkPath(pts, Object.assign({ w, seed: sd + k, t, amp: 1.4 }, x));
    const lp = (pts, k, x) => inkLoop(pts, Object.assign({ seed: sd + k, t, amp: 1.2 }, x));
    const mode = o.sails || 'full';
    S.hullF.setAttribute('d', lp(HULL, 1, { smooth: false }));
    S.band.setAttribute('d', lp(BAND, 2, { smooth: false }));
    S.hullR.setAttribute('d', ip(HULL, 3, 6, { closed: true, smooth: false }));
    S.rail.setAttribute('d', ip([[-372, -110], [-200, -96], [100, -98], [330, -116], [392, -138]], 4, 4) + ' ' +
      [-300, -200, -100, 0, 100, 200, 300].map((x, i) => ip([[x, -84 - (x > 100 ? (x - 100) * 0.08 : 0)], [x, -98 - (x > 100 ? (x - 100) * 0.08 : 0)]], 5 + i, 3)).join(' '));
    S.ports.setAttribute('d', [-260, -120, 20, 160, 280].map((x, i) => inkCircle(x, -30, 9, sd + 20 + i, t, { w: 3.5 })).join(' '));
    // masts, bowsprit, yards
    S.masts.setAttribute('d', ip([[FORE, -84], [FORE + 4, -650]], 30, 11) + ' ' + ip([[MAIN, -82], [MAIN - 4, -612]], 31, 11) + ' ' +
      ip([[372, -118], [580, -186]], 32, 8));
    const roll = Math.sin(t * 1.7) * 3;
    S.yards.setAttribute('d', YARDS.map((y, i) => { const hw = SQ[i][2] + 14; return ip([[FORE - hw, y + roll * 0.2], [FORE + hw, y - roll * 0.2]], 40 + i, 6); }).join(' ') + ' ' +
      ip([[MAIN, -540], [MAIN - 250, -584]], 45, 6) + ' ' + ip([[MAIN, -150], [MAIN - 290, -156]], 46, 6));
    // rigging
    S.rig.setAttribute('d', [ip([[FORE, -650], [578, -184]], 50, 2.5), ip([[FORE, -560], [470, -152]], 51, 2.5), ip([[MAIN, -612], [-372, -104]], 52, 2.5),
      ip([[MAIN, -600], [FORE, -520]], 53, 2.5), ip([[FORE - 10, -600], [FORE - 70, -100]], 54, 2.5), ip([[FORE + 10, -600], [FORE + 66, -102]], 55, 2.5),
      ip([[MAIN - 10, -560], [MAIN - 70, -94]], 56, 2.5), ip([[MAIN + 8, -560], [MAIN + 64, -92]], 57, 2.5)].join(' '));
    // square sails
    const fl = Math.sin(t * 3.1) * 1;
    SQ.forEach(([ty, by, tw, bw], i) => {
      const set = mode === 'full' || ((mode === 'half' || mode === 'torn') && (i === 1 || i === 2));
      const bil = 16 + Math.sin(t * 1.3 + i) * 5;
      if (set && mode !== 'none') {
        const pts = [[FORE - tw, ty], [FORE + tw, ty], [FORE + bw + bil * 0.3, (ty + by) / 2], [FORE + bw, by], [FORE, by + bil * 0.6], [FORE - bw, by], [FORE - bw - bil * 0.3, (ty + by) / 2]];
        if (mode === 'torn' && i === 1) { pts.splice(3, 3, [FORE + bw, by - 20], [FORE + 40, by - 50], [FORE + 10, by - 6], [FORE - 30, by - 44], [FORE - bw, by - 10]); }
        S.sailF[i].setAttribute('d', lp(pts, 60 + i));
        S.sailR[i].setAttribute('d', ip(pts, 64 + i, 4.5, { closed: true }) + ' ' + ip([[FORE, ty + 6], [FORE + 2, by]], 68 + i, 2.5, { taper: 0.6 }));
        S.furl[i].setAttribute('d', '');
      } else {
        S.sailF[i].setAttribute('d', ''); S.sailR[i].setAttribute('d', '');
        S.furl[i].setAttribute('d', mode === 'none' && false ? '' : lp(inkEllipsePts(FORE, ty + 12, tw, 12, sd + 70 + i, 10), 70 + i));
      }
      // tattered strip hanging and flapping from the lowest (furled) course in "torn"
      if (mode === 'torn' && (i === 0 || i === 2)) {
        const sw = Math.sin(t * 4.2 + i * 2) * 26, x0 = FORE + (i === 0 ? -60 : 50);
        const strip = [[x0 - 26, ty + 10], [x0 + 22, ty + 10], [x0 + 20 + sw * 0.6, ty + 80], [x0 + 6 + sw, ty + 150], [x0 - 10 + sw * 0.8, ty + 96], [x0 - 24 + sw * 0.4, ty + 60]];
        S.tatter[i].setAttribute('d', lp(strip, 74 + i));
        S.tatR[i].setAttribute('d', ip(strip, 78 + i, 3.5, { closed: true }));
      } else { S.tatter[i].setAttribute('d', ''); S.tatR[i].setAttribute('d', ''); }
    });
    // gaff mainsail
    if (mode !== 'none') {
      const b = 18 + Math.sin(t * 1.1) * 6, flap = mode === 'torn' ? Math.sin(t * 3.4) * 22 : 0;
      const gp = [[MAIN - 8, -530], [MAIN - 246, -576], [MAIN - 270 - b, -360 + flap], [MAIN - 286, -162], [MAIN - 150, -156 - b], [MAIN - 8, -160]];
      S.gaffF.setAttribute('d', lp(gp, 80)); S.gaffR.setAttribute('d', ip(gp, 81, 4.5, { closed: true }));
    } else { S.gaffF.setAttribute('d', ''); S.gaffR.setAttribute('d', ''); }
    // jibs
    [[[FORE + 8, -620], [570, -184], [400, -128]], [[FORE + 8, -520], [470, -156], [330, -112]]].forEach((pts, i) => {
      const on = mode === 'full' || (mode !== 'none' && i === 1);
      const q = on ? [pts[0], [(pts[0][0] + pts[1][0]) / 2 + 18, (pts[0][1] + pts[1][1]) / 2 + 6 + fl], pts[1], pts[2]] : null;
      S.jibF[i].setAttribute('d', q ? lp(q, 84 + i) : ''); S.jibR[i].setAttribute('d', q ? ip(q, 86 + i, 4, { closed: true }) : '');
    });
    // pennant
    const w = Math.sin(t * 6) * 10;
    S.flag.setAttribute('d', o.flag === false ? '' : lp([[MAIN - 4, -612], [MAIN - 64, -604 + w * 0.4], [MAIN - 110, -598 + w], [MAIN - 60, -590 + w * 0.5], [MAIN - 4, -590]], 88));
    // lifeboat on deck
    if (o.boat === 'deck') {
      const k = o.boatScale || 1, B = q => [q[0] * k, -88 + (q[1] + 88) * k];
      const bp = [[-90, -132], [80, -132], [100, -150], [62, -110], [-60, -106], [-104, -146]].map(B);
      S.boatF.setAttribute('d', lp(bp, 90)); S.boatR.setAttribute('d', ip(bp, 91, 4.5 * Math.sqrt(k), { closed: true }) + ' ' + ip([[-40, -106], [-50, -88]].map(B), 92, 4) + ' ' + ip([[40, -108], [46, -90]].map(B), 93, 4) + ' ' + ip([[-80, -128], [84, -130]].map(B), 94, 3));
    } else { S.boatF.setAttribute('d', ''); S.boatR.setAttribute('d', ''); }
    // reef cracks
    const ck = o.crack || 0;
    S.cracks.setAttribute('d', ck > 0.01 ? [[[260, -70], [240, -40], [262, -20], [236, 6]], [[300, -86], [320, -52], [298, -30]], [[180, -60], [196, -36], [176, -8]]]
      .map((c, i) => { const n = Math.max(2, Math.round(c.length * ck)); return ip(c.slice(0, n), 95 + i, 7, { smooth: false }); }).join(' ') : '');
  }

  // ---- lifeboat (~200 units long), crew = simple ink sailors (head + body + oar)
  function makeBoat(g, sd, crew) {
    return { g, f: inkEl(g, INK.paperLight), r: inkEl(g), crew: Array.from({ length: crew }, () => ({ head: inkEl(g, INK.paperLight), hr: inkEl(g), body: inkEl(g), oar: inkEl(g, INK.inkSoft) })), sd };
  }
  function drawBoat(B, t, row, alpha = 1) {
    const sd = B.sd;
    if (B._a !== alpha) { B._a = alpha; B.g.querySelectorAll('path').forEach(e => e.setAttribute('fill-opacity', alpha.toFixed(3))); }
    const hull = [[-104, -40], [104, -46], [86, -6], [50, 8], [-60, 8], [-94, -8]];
    B.f.setAttribute('d', inkLoop(hull, { seed: sd + 1, t, amp: 1 }));
    B.r.setAttribute('d', inkPath(hull, { w: 5, seed: sd + 2, t, amp: 1.2, closed: true }) + ' ' + inkPath([[-90, -28], [92, -32]], { w: 3, seed: sd + 3, t, amp: 1 }));
    const n = B.crew.length;
    B.crew.forEach((c, i) => {
      const x = n === 1 ? 0 : -58 + i * 116 / (n - 1), small = i === n - 1 && n >= 3;
      const st = row ? Math.sin(t * 2.6 + i * 0.3) : 0, hy = small ? -74 : -96;
      c.head.setAttribute('d', inkCircle(x + st * 4, hy, small ? 13 : 17, sd + 10 + i, t, { fill: true }));
      c.hr.setAttribute('d', inkCircle(x + st * 4, hy, small ? 13 : 17, sd + 20 + i, t, { w: 4 }));
      c.body.setAttribute('d', inkPath([[x + st * 4, hy + (small ? 13 : 17)], [x, -40]], { w: 6, seed: sd + 30 + i, t, amp: 1 }));
      c.oar.setAttribute('d', row && !small ? inkPath([[x + st * 6, hy + 36], [x + 30 + st * 40, 10], [x + 44 + st * 56, 26]], { w: 4.5, seed: sd + 40 + i, t, amp: 1 }) : '');
    });
  }

  SH.mcB_ship = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1, cast, labels, sea, camPush } = M();
      const sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const HZ = (P.horizon ?? 0.5) * H, WY = (P.water ?? 0.74) * H;
      const sky = P.sky || {};
      // sky: clouds + gulls
      const clouds = Array.from({ length: sky.clouds ?? 3 }, () => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam, INK.inkSoft) }));
      const gulls = Array.from({ length: sky.gulls ?? 2 }, () => inkEl(cam));
      // horizon things
      const isl = P.island ? { f: inkEl(cam, P.island.bold ? INK.green : INK.paperDark, P.island.bold ? { 'fill-opacity': 0.55 } : {}), r: inkEl(cam, P.island.bold ? INK.ink : INK.inkSoft) } : null;
      const gib = P.gib ? { f: inkEl(cam, INK.paperDark), r: inkEl(cam, INK.inkSoft), h: inkEl(cam, INK.inkSoft) } : null;
      const far = sea(cam, W, H, HZ, sd + 100, { amp: 2.5, hatch: 12, bottom: WY + 10 });
      far.update = far.update.bind(far);
      const shipG = (P.ships || []).map((s, i) => { const g = el(cam, 'g'); return { s, g, S: makeShip(g, sd + 200 + i * 300) }; });
      shipG.forEach(o => { if (o.s.name) { o.name = el(o.g, 'text', { x: -210, y: -38, 'font-family': M().FR, 'font-weight': 800, 'font-size': Math.max(46, 44 / (o.s.scale ?? 1)), 'text-anchor': 'middle', fill: INK.paperLight }); o.name.textContent = String(o.s.name).toLocaleUpperCase(LOCALE); } });
      const ropes = (P.boats || []).map(() => ({ a: inkEl(cam, INK.ink), b: inkEl(cam, INK.ink) }));
      const boatG = (P.boats || []).map((b, i) => { const g = el(cam, 'g'); return { b, g, B: makeBoat(g, sd + 1300 + i * 100, b.crew ?? 3) }; });
      const reef = P.reef ? { f: inkEl(cam, INK.inkSoft), r: inkEl(cam), foam: inkEl(cam, INK.paperLight), foamR: inkEl(cam, INK.inkSoft) } : null;
      const near = sea(cam, W, H, WY, sd + 500, { amp: 8, hatch: 20 });
      near.update = near.update.bind(near);
      const rocks = (P.rocks || []).map(() => ({ f: inkEl(cam, INK.paperDark), r: inkEl(cam) }));
      const splash = inkEl(cam, INK.paperLight), splashR = inkEl(cam, INK.inkSoft);
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 2000);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 3000);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          (P.shake || []).forEach(c => { const a = atOr(cues, c, null); if (a != null && lt >= a && lt < a + 0.8) shake = Math.max(shake, 1 - (lt - a) / 0.8); });
          // sky
          clouds.forEach((c, i) => {
            const cx = ((i * 0.37 + 0.12) * W + lt * (8 + i * 3)) % (W + 400) - 200, cy = HZ * (0.18 + 0.2 * (i % 2)) + 40;
            const pts = [[-120, 20], [-110, -10], [-70, -30], [-20, -48], [40, -40], [90, -20], [130, 10], [100, 26], [-90, 28]].map(q => [cx + q[0] * (1 + i * 0.15), cy + q[1]]);
            c.f.setAttribute('d', inkLoop(pts, { seed: sd + 10 + i, t, amp: 1 })); c.r.setAttribute('d', inkPath(pts, { w: 3.5, seed: sd + 14 + i, t, amp: 1.2, closed: true }));
          });
          gulls.forEach((gl, i) => {
            const gx = ((0.55 + i * 0.18) * W + lt * (30 + i * 9)) % (W + 200) - 100, gy = HZ * 0.3 + i * 50 + Math.sin(lt * 1.3 + i) * 10, fl = Math.sin(lt * 7 + i) * 9;
            gl.setAttribute('d', inkPath([[gx - 26, gy - 6 + fl], [gx - 10, gy - 12 + fl * 0.3], [gx, gy], [gx + 10, gy - 12 + fl * 0.3], [gx + 26, gy - 6 + fl]], { w: 4, seed: sd + 20 + i, t, amp: 0.8 }));
          });
          if (isl) {
            const I = P.island, p = spring(lt, atOr(cues, I.at, 0), 0.8), cx = I.x * W, w = (I.w ?? 0.22) * W, h = (I.h ?? 0.06) * H * p;
            const pts = [[cx - w / 2, HZ + 4], [cx - w * 0.3, HZ - h * 0.6], [cx - w * 0.1, HZ - h], [cx + w * 0.08, HZ - h * 0.8], [cx + w * 0.28, HZ - h * 0.45], [cx + w / 2, HZ + 4]];
            isl.f.setAttribute('d', inkLoop(pts, { seed: sd + 30, t, amp: 1 })); isl.r.setAttribute('d', inkPath(pts, { w: I.bold ? 7 : 4, seed: sd + 31, t, amp: 1.2 }) + (I.bold ? ' ' + [0.2, 0.4, 0.6].map((u, k) => inkPath([[cx - w * 0.3 + u * w * 0.5, HZ - h * (0.5 + 0.2 * Math.sin(k))], [cx - w * 0.34 + u * w * 0.5, HZ - 4]], { w: 3, seed: sd + 32 + k, t, amp: 1 })).join(' ') : ''));
          }
          if (gib) {
            const G = P.gib, p = spring(lt, atOr(cues, G.at, 0), 0.9), cx = G.x * W, s = Math.min(W, H) * 0.0013 * (G.scale ?? 1);
            const pts = [[-170, 0], [-150, -30], [-120, -150 * p], [-96, -168 * p], [-60, -150 * p], [10, -120 * p], [80, -80 * p], [150, -40 * p], [200, 0]].map(q => [cx + q[0] * s, HZ + 4 + q[1] * s]);
            gib.f.setAttribute('d', inkLoop(pts, { seed: sd + 33, t, amp: 1, smooth: false }));
            gib.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 34, t, amp: 1.2 }));
            gib.h.setAttribute('d', [0, 1, 2, 3].map(k => inkPath([[cx + (-110 + k * 26) * s, HZ - (140 - k * 22) * s * p], [cx + (-120 + k * 30) * s, HZ - 10 * s]], { w: 2.5, seed: sd + 35 + k, t, amp: 1 })).join(' '));
          }
          far.update(t);
          // ships
          const pose = (o, i, tt) => {
            const s = o.s, sc = (s.scale ?? 1) * (W / 1920) * (s.far ? 0.5 : 1), face = s.face ?? 1;
            const a0 = atOr(cues, s.at, 0), st = s.strike != null ? atOr(cues, s.strike, null) : null;
            const d0 = st != null ? Math.max(0.5, st - a0) : (s.dur ?? Math.max(1, dur - a0));
            const u = s.to != null ? (st != null ? lin(tt, a0, d0) : progIO(tt, a0, d0)) : 0;
            const x = lerp(s.x, s.to ?? s.x, u) * W;
            let heel = s.heel || 0, crack = 0, jolt = 0;
            if (st != null && tt >= st) { heel += 9 * prog(tt, st, 0.5); crack = prog(tt, st + 0.1, 0.5); jolt = Math.exp(-(tt - st) * 5) * Math.sin((tt - st) * 40) * 10; }
            const roll = Math.sin(t * (s.wander ? 0.9 : 1.1) + i) * (s.wander ? 5 : 2) + heel, bob = Math.sin(t * 1.5 + i) * 5;
            const xw = x + (s.wander ? Math.sin(t * 0.5) * 18 : 0) + jolt;
            const y = (s.far ? HZ + (WY - HZ) * 0.35 : WY) + bob;
            const rr0 = roll * face * Math.PI / 180, lx = -370 * face * sc, ly = -70 * sc;
            return { sc, face, xw, y, roll, crack, stern: [xw + lx * Math.cos(rr0) - ly * Math.sin(rr0), y + lx * Math.sin(rr0) + ly * Math.cos(rr0)] };
          };
          const sternPt = [];
          shipG.forEach((o, i) => {
            const q = pose(o, i, lt), s = o.s;
            o.g.setAttribute('transform', `translate(${f1(q.xw)} ${f1(q.y)}) rotate(${f1(q.roll * q.face)}) scale(${(q.face * q.sc).toFixed(4)} ${q.sc.toFixed(4)})`);
            drawShip(o.S, t, { sails: s.sails, boat: s.boat, boatScale: s.boat_scale, flag: s.flag, crack: q.crack });
            if (o.name) o.name.setAttribute('transform', q.face < 0 ? 'scale(-1 1) translate(420 0)' : '');
            sternPt[i] = { now: q.stern, at: tt => pose(o, i, tt).stern };
          });
          // boats
          boatG.forEach((o, i) => {
            const b = o.b, sc = (b.scale ?? 1) * (W / 1920), face = b.face ?? 1, rope = ropes[i];
            let x, y = (b.y != null ? b.y * H : WY) + Math.sin(t * 1.9 + i) * 6;
            const SP = b.tow ? sternPt[b.tow.ship ?? 0] : null;
            if (SP) {
              const sp = SP.now, len = (b.tow.len ?? 0.2) * W, sn = atOr(cues, b.tow.snap, null);
              if (sn == null || lt < sn) {
                x = sp[0] - len + Math.sin(t * 0.8) * 10;
                const bx = x + 100 * sc, by = y - 30 * sc, sag = 26 + Math.sin(t * 1.4) * 6;
                rope.a.setAttribute('d', inkPath([[sp[0], sp[1]], [(sp[0] + bx) / 2, Math.max(sp[1], by) + sag], [bx, by]], { w: 4, seed: sd + 60 + i, t, amp: 1 }));
                rope.b.setAttribute('d', '');
              } else {
                const k = lt - sn, s0 = SP.at(sn);
                x = s0[0] - len - k * (b.tow.drift ?? 50);
                const bx = x + 100 * sc, by = y - 30 * sc, fall = prog(lt, sn, 0.8), seg = len * 0.42;
                rope.a.setAttribute('d', inkPath([[sp[0], sp[1]], [sp[0] - seg * 0.5, lerp(sp[1] + 30, WY - 4, fall)], [sp[0] - seg + fall * 40, lerp(sp[1] + 40, WY + 14, fall)]], { w: 4, seed: sd + 60 + i, t, amp: 1 }));
                rope.b.setAttribute('d', inkPath([[bx, by], [bx + seg * 0.5, lerp(by + 20, WY - 2, fall)], [bx + seg - fall * 40, lerp(by + 30, WY + 14, fall)]], { w: 4, seed: sd + 62 + i, t, amp: 1 }));
              }
            } else {
              const a0 = atOr(cues, b.at, 0), u = b.to != null ? progIO(lt, a0, b.dur ?? Math.max(1, dur - a0)) : 0;
              x = lerp(b.x, b.to ?? b.x, u) * W;
              rope.a.setAttribute('d', ''); rope.b.setAttribute('d', '');
            }
            const alpha = b.fade ? 1 - prog(lt, atOr(cues, b.fade.at, 0), b.fade.dur ?? 2) : 1;
            o.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(Math.sin(t * 1.7 + i) * 4)}) scale(${(face * sc).toFixed(4)} ${sc.toFixed(4)})`);
            o.g.style.display = alpha < 0.01 ? 'none' : '';
            drawBoat(o.B, t, b.row !== false && (b.crew ?? 3) > 0, alpha);
          });
          // reef
          if (reef) {
            const R = P.reef, cx = R.x * W, w = (R.w ?? 0.22) * W, p = spring(lt, atOr(cues, R.at, 0), 0.6);
            const r2 = rng(sd + 77), pts = [[cx - w / 2, WY + 30]];
            for (let k = 0; k <= 8; k++) pts.push([cx - w / 2 + w * k / 8, WY + 30 - (k % 2 ? 50 + r2() * 40 : 10 + r2() * 14) * p]);
            pts.push([cx + w / 2, WY + 30]);
            reef.f.setAttribute('d', inkLoop(pts, { seed: sd + 70, t, amp: 1, smooth: false }));
            reef.r.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 71, t, amp: 1.2, smooth: false }));
            const fo = [0, 1, 2, 3].map(k => inkCircle(cx - w * 0.4 + k * w * 0.26 + Math.sin(t * 2 + k) * 8, WY + 6, 22 + Math.sin(t * 3 + k) * 6, sd + 72 + k, t, { fill: true, ry: 10 })).join(' ');
            reef.foam.setAttribute('d', fo); reef.foamR.setAttribute('d', '');
          }
          near.update(t);
          // impact splash at the reef strike
          let spd = '';
          shipG.forEach(o => { const st = o.s.strike != null ? atOr(cues, o.s.strike, null) : null; if (st != null && lt >= st && lt < st + 1.6) {
            const k = (lt - st) / 1.6, cx = (P.reef ? P.reef.x : o.s.to) * W;
            for (let j = 0; j < 7; j++) { const a = -Math.PI / 2 + (j - 3) * 0.32, r = 40 + k * 220; spd += inkCircle(cx + Math.cos(a) * r, WY - 20 + Math.sin(a) * r + k * k * 160, 22 * (1 - k) + 4, sd + 80 + j, t, { fill: true }) + ' '; } } });
          splash.setAttribute('d', spd); splashR.setAttribute('d', '');
          rocks.forEach((r, i) => {
            const R = P.rocks[i], cx = R.x * W, cy = R.y * H, w = (R.w ?? 0.12) * W;
            const pts = [[cx - w / 2, H + 30], [cx - w / 2 + 10, cy + 30], [cx - w * 0.3, cy + 4], [cx, cy - 6], [cx + w * 0.3, cy + 2], [cx + w / 2 - 6, cy + 34], [cx + w / 2, H + 30]];
            r.f.setAttribute('d', inkLoop(pts, { seed: sd + 90 + i, t, amp: 1 })); r.r.setAttribute('d', inkPath(pts.slice(1, -1), { w: 6, seed: sd + 94 + i, t, amp: 1.2 }));
          });
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit, shake);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
