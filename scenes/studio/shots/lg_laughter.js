// lg_laughter: shots for the Stickstory Short "The Tanganyika laughter epidemic" (2026-11-19): on 30 January 1962, at a
// mission boarding school for girls in Kashasha, near Bukoba on the west shore of Lake Victoria (Tanganyika, now
// Tanzania), three pupils started laughing and could not stop. By 18 March 95 of the 159 pupils had the fits (laughing
// and crying, attacks of a few hours), tests found no poison and no infection, the school closed, the girls went home
// and the laughter spread to villages such as Nshamba (Rankin & Philip 1963). Mass psychogenic illness.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. The girls are drawn with care (friendly faces, school
// uniforms, laughing with tears), never as a joke. Uses lh__lib.js (LH.kasif, LH.label, LH.person, LH.clock, LH.front)
// and td__lib.js (TD.stars). Parametric: any school / village / "contagious behaviour" story.
//
// Common: L = label {text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}
//   K = Kaşif {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//
// SHOTS.lg_school — the mission school seen from the yard: a long brick building with a corrugated roof, a cross on
//   the gable, a bell on a post, banana plants; a big iron gate in the foreground. P: {mode, gy (building base 0..1 H),
//   gate: {top, bottom} 0..1 H, kasif: K, girls: [[x0 0..1, x1 0..1, scale]] (walking away), labels}
//   mode "hook": gold laugh ripples pulse from the windows, the gate swings shut on cue "shut" (chain + padlock);
//   "closed": gate locked, a CLOSED board, girls with suitcases walk away (P.girls); "end": gate open, calm.
// SHOTS.lg_map — old map of Lake Victoria (west shore, Bukoba, Kashasha) drawn in, a red pulse on Kashasha from cue
//   "pin". P: {lon0, lat0 (map centre), ppd (px per degree), pin: [lon, lat], labels}
// SHOTS.lg_class — the classroom: blackboard with chalk, three rows of girls in uniform behind long wooden desks
//   (the front row big, the desk front down to the frame bottom). P: {mode, board: chalk text, count: [from, to],
//   of: "159", teacher: true, labels}
//   mode "start": the three front-row girls burst out laughing on cue "laugh" (others look round);
//   "spread": the fits spread girl to girl from the front row backwards from cue "spread", the chalk count rises.
// SHOTS.lg_hours — close: a wall clock whose hands race, a window light patch crossing the wall, one girl at her desk
//   laughing with tears, hands to her face; a second girl behind. P: {labels}
// SHOTS.lg_lab — a 1962 field doctor at a microscope: bench with a sample rack and bottles, a round inset of the
//   microscope view (pale cells, a scanning cross-hair); red cross over the bottles on cue "poison", NO GERM stamp
//   in the view on cue "germ". P: {labels}
// SHOTS.lg_road — the road from the school to the villages: beehive grass huts (Haya "mushonge"), banana plants, two
//   girls walking; from cue "follow" a gold dotted trail runs along the road and each hut in turn sends out laugh
//   ripples. P: {labels}
// SHOTS.lg_minds — a chain of people in profile (girls, a mother, an old man, a boy) at dusk; from cue "mind" a gold
//   spark jumps from one head to the next and lights each mind. P: {labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const L2 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  const ellP = (cx, cy, rx, ry, n = 16, a0 = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SERIF = 'Fraunces, Georgia, serif';
  const WARM = () => mix(INK.gold, INK.red, 0.3);
  const WOOD = () => mix(WARM(), INK.paperDark, 0.5), WOOD_D = () => mix(WARM(), INK.ink, 0.5), WOOD_L = () => mix(WARM(), INK.paperLight, 0.6);
  const SKIN = k => mix(mix(INK.red, INK.gold, 0.45), INK.ink, 0.42 + 0.14 * k);
  const UNI = () => mix(INK.blue, INK.paperLight, 0.32);
  const twoBone = (a, b, l1, l2, bend) => {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    const mx = l1 + l2 - 1; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1))));
    return [[a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1], [a[0] + dx, a[1] + dy]];
  };

  // ------------------------------------------------------------------ schoolgirl (front view)
  // y = desk top (seated) or ground (full); s = 1 -> head radius 52. st: {laugh 0..1, cover 0..1 (hands to face),
  // tears, look (-1..1 head turn), full (legs), walk (phase), bag (suitcase in the left hand), hair 0..1 (cap shape)}
  function girl(parent, sd, o = {}) {
    const g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const skin = SKIN(o.tone ?? hn(sd, 1)), uni = o.col || UNI();
    const legs = E(skin), shoes = E(INK.ink), bagF = E(WOOD_D()), bagL = E();
    const armB = E(skin), slvB = E(uni), dress = E(uni), dressL = E(), collar = E(INK.paperLight);
    const neck = E(skin), head = E(skin), headL = E(), hair = E(INK.ink), face = E(INK.ink), teeth = E(INK.paperLight), tears = E(mix(INK.blue, INK.paperLight, 0.25));
    const armF = E(skin), slvF = E(uni), armL = E();
    return {
      update(t, x, y, s, st = {}) {
        const ph = sd * 0.37, la = clamp01(st.laugh || 0), cv = clamp01(st.cover || 0), full = !!st.full;
        const bob = la * Math.abs(Math.sin(t * 11 + ph)) * 7 * s + (full ? Math.abs(Math.sin(st.walk || 0)) * 6 * s : 0);
        const B = [x + la * Math.sin(t * 5.5 + ph) * 4 * s, y - (full ? 270 : 150) * s - bob];
        const tilt = la * (0.12 + 0.07 * Math.sin(t * 6 + ph)) * (cv > 0.5 ? -0.6 : 1), turn = (st.look || 0);
        const hc = [B[0] + turn * 10 * s + Math.sin(tilt) * 10 * s, B[1] - 86 * s + tilt * 12 * s];
        const P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 5, seed: sd + k, t, amp: 0.9 }, ex));
        const bot = full ? y - 100 * s : y + 30 * s, fl = full ? 70 : 58;
        // legs + shoes (full figure)
        if (full) {
          const sw = Math.sin(st.walk || 0) * 24 * s, LG = [[[x - 20 * s, bot], [x - 22 * s + sw, y - 6 * s]], [[x + 20 * s, bot], [x + 22 * s - sw, y - 6 * s]]];
          legs.setAttribute('d', LG.map((L, i) => inkPath(L, { w: 17 * s + 2, seed: sd + 1 + i, t, taper: 0 })).join(' '));
          shoes.setAttribute('d', LG.map((L, i) => inkDot(L[1][0] + 6 * s, L[1][1], 15 * s, 8 * s, sd + 3 + i, t)).join(' '));
        } else blank(legs, shoes);
        // arms: targets
        const shL = [B[0] - 42 * s, B[1] + 12 * s], shR = [B[0] + 42 * s, B[1] + 12 * s];
        let tL, tR;
        if (full) {
          const sw = Math.sin(st.walk || 0) * 18 * s;
          tL = [shL[0] - 16 * s - sw, shL[1] + 150 * s]; tR = [shR[0] + 16 * s + sw, shR[1] + 148 * s];
        } else {
          tL = [B[0] - 62 * s, y - 6 * s]; tR = [B[0] + 58 * s, y - 10 * s + Math.sin(t * 3 + ph) * 3 * s];
        }
        if (la > 0.02) {
          const mo = [hc[0] + 6 * s, hc[1] + 30 * s], bel = [B[0] - 8 * s, B[1] + 110 * s];
          tR = L2(tR, mo, Math.min(1, la * 1.6)); tL = L2(tL, bel, Math.min(1, la * 1.6));
        }
        if (cv > 0.02) { tL = L2(tL, [hc[0] - 26 * s, hc[1] + 14 * s], cv); tR = L2(tR, [hc[0] + 26 * s, hc[1] + 14 * s], cv); }
        const [eL, hL] = twoBone(shL, tL, 70 * s, 72 * s, 1), [eR, hR] = twoBone(shR, tR, 70 * s, 72 * s, -1);
        armB.setAttribute('d', inkPath([shL, eL, hL], { w: 17 * s + 2, seed: sd + 10, t, amp: 0.8, taper: 0.1 }) + ' ' + inkDot(hL[0], hL[1], 12 * s, 12 * s, sd + 11, t));
        slvB.setAttribute('d', inkPath([shL, L2(shL, eL, 0.55)], { w: 26 * s, seed: sd + 12, t, amp: 0.6, taper: 0 }));
        // dress
        const D = [[B[0] - 44 * s, B[1]], [B[0] + 44 * s, B[1]], [x + fl * s, bot], [x - fl * s, bot]];
        dress.setAttribute('d', inkLoop(D, { seed: sd + 20, t, smooth: false, amp: 1 }));
        const C = [[B[0] - 22 * s, B[1] - 2 * s], [B[0] + 22 * s, B[1] - 2 * s], [B[0], B[1] + 32 * s]];
        collar.setAttribute('d', inkLoop(C, { seed: sd + 21, t, smooth: false, amp: 0.6 }));
        dressL.setAttribute('d', P(D, 22, { closed: true, smooth: false }) + ' ' + P(C, 23, { closed: true, smooth: false, w: 3.5 }) +
          (full ? ' ' + P([[x - fl * s * 0.86, bot - 26 * s], [x + fl * s * 0.86, bot - 26 * s]], 24, { w: 3 }) : ''));
        neck.setAttribute('d', inkLoop([[B[0] - 13 * s, B[1] + 6 * s], [B[0] + 13 * s, B[1] + 6 * s], [hc[0] + 13 * s, hc[1] + 40 * s], [hc[0] - 13 * s, hc[1] + 40 * s]], { seed: sd + 25, t, smooth: false, amp: 0.5 }));
        // head + short cropped hair
        const R = 52 * s;
        head.setAttribute('d', inkCircle(hc[0], hc[1], R, sd + 30, t, { fill: true }));
        headL.setAttribute('d', inkCircle(hc[0], hc[1], R, sd + 31, t, { w: 5 }));
        const hh = o.hair ?? hn(sd, 2), HP = [];
        for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.02 + 0.96 * i / 10); HP.push([hc[0] + Math.cos(a) * (R + 5 * s), hc[1] + Math.sin(a) * (R + (6 + hh * 8) * s) - 2 * s]); }
        HP.push([hc[0] + R * 0.86, hc[1] - R * 0.3], [hc[0] + R * 0.3, hc[1] - R * (0.56 - hh * 0.06)], [hc[0] - R * 0.3, hc[1] - R * (0.58 - hh * 0.06)], [hc[0] - R * 0.86, hc[1] - R * 0.3]);
        hair.setAttribute('d', inkLoop(HP, { seed: sd + 32, t, amp: 0.8 }));
        // face
        const F = [], ex = 18 * s, ey = hc[1] - 2 * s, cx = hc[0] + turn * 8 * s;
        const open = la * (0.65 + 0.35 * Math.abs(Math.sin(t * 11 + ph)));
        [-1, 1].forEach((sg, i) => {
          const e = cx + sg * ex;
          if (la > 0.15) F.push(P([[e - 9 * s, ey + 3 * s], [e, ey - 6 * s], [e + 9 * s, ey + 3 * s]], 40 + i, { w: 4, amp: 0.4 }));
          else F.push(((t + sd) % 3.4) < 0.12 ? P([[e - 6 * s, ey], [e + 6 * s, ey]], 40 + i, { w: 3.5 }) : inkDot(e, ey, 5.5 * s + 1, 6 * s + 1, sd + 40 + i, t));
          F.push(P([[e - 10 * s, ey - 16 * s - la * 6 * s], [e + 10 * s * 0.2, ey - 19 * s - la * 7 * s], [e + 10 * s, ey - 16 * s - la * 4 * s]].map(p => [p[0] + (sg < 0 ? 0 : 0), p[1]]), 44 + i, { w: 3.5, amp: 0.4 }));
        });
        let TT = '';
        if (open > 0.05 && cv < 0.6) {
          const my = hc[1] + 20 * s, mw = 21 * s, MO = [[cx - mw, my], [cx + mw, my], [cx + mw * 0.6, my + 22 * s * open], [cx, my + 28 * s * open], [cx - mw * 0.6, my + 22 * s * open]];
          F.push(inkLoop(MO, { seed: sd + 50, t, amp: 0.4 }));
          TT = inkLoop([[cx - mw * 0.85, my + 1], [cx + mw * 0.85, my + 1], [cx + mw * 0.7, my + 6 * s], [cx - mw * 0.7, my + 6 * s]], { seed: sd + 51, t, smooth: false, amp: 0.3 });
        } else F.push(P([[cx - 13 * s, hc[1] + 20 * s], [cx, hc[1] + 26 * s], [cx + 13 * s, hc[1] + 20 * s]], 52, { w: 3.5, amp: 0.4 }));
        face.setAttribute('d', F.join(' '));
        teeth.setAttribute('d', TT);
        // tears (laughing and crying)
        const TR = [];
        if (st.tears && la > 0.4) [-1, 1].forEach((sg, i) => { const f = (t * 0.9 + i * 0.5 + ph) % 1; TR.push(inkDot(cx + sg * (ex + 10 * s), ey + 10 * s + f * 46 * s, 5 * s * (1 - f * 0.4) + 1, 7 * s * (1 - f * 0.4) + 1, sd + 60 + i, t)); });
        tears.setAttribute('d', TR.join(' '));
        // front arm (over the dress)
        armF.setAttribute('d', inkPath([shR, eR, hR], { w: 17 * s + 2, seed: sd + 13, t, amp: 0.8, taper: 0.1 }) + ' ' + inkDot(hR[0], hR[1], 12 * s, 12 * s, sd + 14, t) + (cv > 0.3 ? ' ' + inkDot(hL[0], hL[1], 12 * s, 12 * s, sd + 15, t) : ''));
        slvF.setAttribute('d', inkPath([shR, L2(shR, eR, 0.55)], { w: 26 * s, seed: sd + 16, t, amp: 0.6, taper: 0 }));
        armL.setAttribute('d', P([shL, eL, hL], 17, { w: 3.5 }) + ' ' + P([shR, eR, hR], 18, { w: 3.5 }) + ' ' + inkCircle(hc[0], hc[1], R, sd + 31, t, { w: 5 }));
        // suitcase
        if (st.bag) {
          const bx = hL[0], by = hL[1] + 8 * s, BG = [[bx - 42 * s, by + 8 * s], [bx + 42 * s, by + 8 * s], [bx + 42 * s, by + 70 * s], [bx - 42 * s, by + 70 * s]];
          bagF.setAttribute('d', inkLoop(BG, { seed: sd + 70, t, smooth: false }));
          bagL.setAttribute('d', P(BG, 71, { closed: true, smooth: false }) + ' ' + P([[bx - 14 * s, by + 8 * s], [bx - 12 * s, by - 4 * s], [bx + 12 * s, by - 4 * s], [bx + 14 * s, by + 8 * s]], 72, { w: 4, smooth: false }));
        } else blank(bagF, bagL);
        return { hc, R };
      },
    };
  }

  // gold laugh ripples: arcs on both sides of a point, travelling outward
  function ripples(parent, sd) {
    const a = inkEl(parent, INK.gold), b = inkEl(parent, mix(INK.gold, INK.red, 0.35));
    return {
      update(t, list) {
        const A = [], Bq = [];
        list.forEach((q, i) => {
          const [x, y, r0, k, sp] = q, na = q[5] || 2, wm = q[6] || 1; if (k <= 0.02) return;
          for (let j = 0; j < na; j++) {
            const f = (t * (sp || 1.1) + j / na + hn(sd + i, 4)) % 1, r = r0 * (1 + f * 1.3), w = ((7 - f * 5) * k + 1) * wm;
            [-1, 1].forEach((sg, m) => {
              const pts = []; for (let n = 0; n <= 6; n++) { const an = (sg < 0 ? Math.PI : 0) + (n / 6 - 0.5) * 1.1; pts.push([x + Math.cos(an) * r, y + Math.sin(an) * r]); }
              (j ? Bq : A).push(inkPath(pts, { w, seed: sd + i * 9 + j * 3 + m, t, amp: 0.8 }));
            });
          }
        });
        a.setAttribute('d', A.join(' ')); b.setAttribute('d', Bq.join(' '));
      },
    };
  }

  // banana plant (trunk + big split leaves), origin at the foot
  function banana(parent, sd) {
    const tr = inkEl(parent, mix(INK.green, INK.stain, 0.45)), lv = inkEl(parent, mix(INK.green, INK.paperLight, 0.12)), lv2 = inkEl(parent, mix(INK.green, INK.ink, 0.2)), ln = inkEl(parent);
    return {
      update(t, x, y, s) {
        const top = [x + 6 * s, y - 330 * s];
        tr.setAttribute('d', inkLoop([[x - 26 * s, y], [x + 26 * s, y], [top[0] + 14 * s, top[1]], [top[0] - 14 * s, top[1]]], { seed: sd + 1, t, smooth: false }));
        const LV = [], LV2 = [], LN = [inkPath([[x - 26 * s, y], [top[0] - 14 * s, top[1]]], { w: 5, seed: sd + 2, t }), inkPath([[x + 26 * s, y], [top[0] + 14 * s, top[1]]], { w: 5, seed: sd + 3, t })];
        const AN = [-2.7, -2.1, -1.55, -1.0, -0.45];
        AN.forEach((a0, i) => {
          const a = a0 + Math.sin(t * 1.1 + i * 1.7 + sd) * 0.06, len = (230 + 60 * hn(sd, i)) * s, droop = 0.35 + 0.15 * hn(sd, i + 5);
          const tip = [top[0] + Math.cos(a) * len, top[1] + Math.sin(a) * len + droop * len * 0.5], mid = [top[0] + Math.cos(a) * len * 0.5, top[1] + Math.sin(a) * len * 0.5 - 10 * s];
          const nx = -Math.sin(a), ny = Math.cos(a), wd = 52 * s;
          const pts = [top, [mid[0] + nx * wd, mid[1] + ny * wd], [lerp(mid[0], tip[0], 0.6) + nx * wd * 0.7, lerp(mid[1], tip[1], 0.6) + ny * wd * 0.7], tip, [lerp(mid[0], tip[0], 0.6) - nx * wd * 0.7, lerp(mid[1], tip[1], 0.6) - ny * wd * 0.7], [mid[0] - nx * wd, mid[1] - ny * wd]];
          (i % 2 ? LV2 : LV).push(inkLoop(pts, { seed: sd + 10 + i, t, amp: 1.2 }));
          LN.push(inkPath(pts, { w: 4, seed: sd + 20 + i, t, closed: true }), inkPath([top, mid, tip], { w: 3.5, seed: sd + 30 + i, t }));
          for (let k = 1; k < 4; k++) { const q = L2(top, tip, 0.25 + k * 0.18); LN.push(inkPath([q, [q[0] + nx * wd * 0.8, q[1] + ny * wd * 0.8]], { w: 2.2, seed: sd + 40 + i * 4 + k, t })); }
        });
        lv.setAttribute('d', LV.join(' ')); lv2.setAttribute('d', LV2.join(' ')); ln.setAttribute('d', LN.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.lg_school
  SH.lg_school = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'hook';
      const gy = (P.gy ?? 0.56) * H, GT = Object.assign({ top: 0.6, bottom: 0.97 }, P.gate || {});
      const E = (c, x) => inkEl(root, c, x);
      const bananas = [[0.04, 0.5, 1.15], [0.95, 0.47, 1.05]].map((q, i) => ({ q, b: banana(el(root, 'g'), sd + 10 + i * 50) }));
      const roof = E(mix(INK.inkSoft, INK.paperLight, 0.35)), roofR = E(mix(INK.inkSoft, INK.paperDark, 0.2)), wall = E(mix(INK.red, INK.paperLight, 0.48)), brick = E(mix(INK.red, INK.ink, 0.3));
      const winF = E(mix(INK.ink, INK.blue, 0.25)), winL = E(INK.paperLight), door = E(WOOD_D()), cross = E(INK.ink), bL = E();
      const post = E(WOOD_D()), bell = E(INK.gold), bellL = E();
      const rip = ripples(el(root, 'g'), sd + 200);
      const HA = mode === 'hook' ? [0, 1, 2].map(() => { const hg = el(root, 'g'); const h1 = el(hg, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: 'none', stroke: INK.ink, 'stroke-width': 14, 'stroke-linejoin': 'round' }); const h2 = el(hg, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: INK.gold }); h1.textContent = h2.textContent = 'HA'; return { hg, h1, h2 }; }) : [];
      const yard = E(mix(INK.stain, INK.paperLight, 0.35)), yardL = E(mix(INK.stain, INK.ink, 0.3));
      const gate = E(mix(INK.ink, INK.inkSoft, 0.2)), gateP = E(mix(INK.inkSoft, INK.ink, 0.4)), chain = E(mix(INK.inkSoft, INK.paperDark, 0.2)), lock = E(INK.red), lockL = E();
      const GG = el(root, 'g'), girls = (P.girls || []).map((q, i) => ({ q, f: girl(el(GG, 'g'), sd + 300 + i * 40, { tone: hn(sd, i) }) }));
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sh = atOr(cues, 'shut', mode === 'hook' ? 0.5 : -9), hit = punch(lt, atOr(cues, 'hit', sh));
          const Pp = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 6, seed: sd + k, t, amp: 1.2 }, ex));
          bananas.forEach(b => b.b.update(t, b.q[0] * W, gy + 10 * u, b.q[2] * u));
          // building
          const x0 = 0.1 * W, x1 = 0.9 * W, wt = gy - 300 * u, rt = wt - 120 * u;
          const WL = [[x0, gy], [x1, gy], [x1, wt], [x0, wt]];
          wall.setAttribute('d', inkLoop(WL, { seed: sd + 1, t, smooth: false }));
          const BR = []; for (let r = 1; r < 9; r++) { const yy = lerp(gy, wt, r / 9); BR.push(Pp([[x0 + 6, yy], [x1 - 6, yy]], 100 + r, { w: 2, amp: 0.5 })); for (let c = 0; c < 18; c++) { const xx = lerp(x0, x1, (c + (r % 2) * 0.5) / 18); if (xx > x0 + 4 && xx < x1 - 4) BR.push(Pp([[xx, yy], [xx, yy - (gy - wt) / 9]], 120 + r * 20 + c, { w: 1.8, amp: 0.4 })); } }
          brick.setAttribute('d', BR.join(' '));
          const RF = [[x0 - 40 * u, wt + 6 * u], [x1 + 40 * u, wt + 6 * u], [x1 - 10 * u, rt], [x0 + 10 * u, rt]];
          roof.setAttribute('d', inkLoop(RF, { seed: sd + 2, t, smooth: false }));
          const RR = []; for (let i = 0; i <= 26; i++) { const f = i / 26; RR.push(Pp([L2(RF[0], RF[1], f), L2(RF[3], RF[2], f)], 300 + i, { w: 3.5, amp: 0.6 })); }
          roofR.setAttribute('d', RR.join(' '));
          const GA = [[W / 2 - 120 * u, rt + 4], [W / 2 + 120 * u, rt + 4], [W / 2, rt - 110 * u]];
          wall.setAttribute('d', inkLoop(WL, { seed: sd + 1, t, smooth: false }) + ' ' + inkLoop(GA, { seed: sd + 3, t, smooth: false }));
          const cxp = [W / 2, rt - 150 * u];
          cross.setAttribute('d', Pp([[cxp[0], cxp[1] - 70 * u], [cxp[0], cxp[1] + 50 * u]], 4, { w: 12 * u }) + ' ' + Pp([[cxp[0] - 36 * u, cxp[1] - 30 * u], [cxp[0] + 36 * u, cxp[1] - 30 * u]], 5, { w: 12 * u }));
          const WN = [], WNL = [], wins = [];
          [0.18, 0.31, 0.69, 0.82].forEach((fx, i) => {
            const cx = fx * W, wy0 = wt + 70 * u, wy1 = gy - 90 * u, ww = 52 * u, Q = [[cx - ww, wy1], [cx + ww, wy1], [cx + ww, wy0], [cx - ww, wy0]];
            WN.push(inkLoop(Q, { seed: sd + 20 + i, t, smooth: false })); wins.push([cx, (wy0 + wy1) / 2]);
            WNL.push(Pp(Q, 30 + i, { closed: true, smooth: false, w: 5 }), Pp([[cx, wy0], [cx, wy1]], 40 + i, { w: 3 }), Pp([[cx - ww, (wy0 + wy1) / 2], [cx + ww, (wy0 + wy1) / 2]], 45 + i, { w: 3 }));
          });
          winF.setAttribute('d', WN.join(' ')); winL.setAttribute('d', WNL.join(' '));
          const DR = [[W / 2 - 62 * u, gy], [W / 2 + 62 * u, gy], [W / 2 + 62 * u, gy - 200 * u], [W / 2 - 62 * u, gy - 200 * u]];
          door.setAttribute('d', inkLoop(DR, { seed: sd + 6, t, smooth: false }));
          bL.setAttribute('d', Pp(WL, 7, { closed: true, smooth: false }) + ' ' + Pp(RF, 8, { closed: true, smooth: false }) + ' ' + Pp(GA, 9, { closed: true, smooth: false }) + ' ' + Pp(DR, 10, { closed: true, smooth: false, w: 5 }) + ' ' + Pp([[W / 2, gy], [W / 2, gy - 200 * u]], 11, { w: 3 }));
          // bell post at the left
          const bx = 0.2 * W, by = gy + 90 * u, sw = Math.sin(t * (mode === 'hook' ? 6 : 1.4)) * (mode === 'hook' ? 0.35 : 0.08);
          post.setAttribute('d', Pp([[bx, by], [bx, by - 520 * u]], 50, { w: 20 * u }) + ' ' + Pp([[bx - 70 * u, by - 520 * u], [bx + 70 * u, by - 520 * u]], 51, { w: 16 * u }));
          const bc = [bx + Math.sin(sw) * 70 * u, by - 520 * u + Math.cos(sw) * 70 * u], BLp = [[-34, 30], [34, 30], [22, -26], [0, -38], [-22, -26]].map(p => { const c = Math.cos(sw), s2 = Math.sin(sw); return [bc[0] + (p[0] * c - p[1] * s2) * u, bc[1] + (p[0] * s2 + p[1] * c) * u]; });
          bell.setAttribute('d', inkLoop(BLp, { seed: sd + 52, t }));
          bellL.setAttribute('d', Pp(BLp, 53, { closed: true, w: 5 }) + ' ' + Pp([[bx, by - 520 * u], bc], 54, { w: 4 }));
          // laugh ripples from the windows
          const rk = mode === 'hook' ? 1 : mode === 'closed' ? 0.35 : 0;
          const big = mode === 'hook' ? 1.4 : 1, RL = wins.map((w, i) => [w[0], w[1], 60 * u * big, rk, 0.9 + i * 0.1, 2, big]);
          if (mode === 'hook') RL.push([W / 2, gy - 110 * u, 130 * u, 1, 0.8, 3, 2]);
          rip.update(t, RL);
          HA.forEach((h, i) => { const ph = (lt * 0.5 + i / 3) % 1, x = W / 2 + (i - 1) * 230 * u + Math.sin(t * 2 + i) * 10 * u, y = gy - 170 * u - (i % 2) * 80 * u - Math.sin(t * 3 + i * 2) * 14 * u, sz = (130 + 25 * Math.sin(t * 4 + i)) * u;
            h.hg.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1((i - 1) * 12 + Math.sin(t * 3 + i) * 5)})`); [h.h1, h.h2].forEach(e => e.setAttribute('font-size', f1(sz))); });
          // yard (dirt strip in front of the building, under the gate)
          const yt = gy + 30 * u;
          yard.setAttribute('d', inkLoop([[-20, yt], [W + 20, yt + 10], [W + 20, H + 20], [-20, H + 20]], { seed: sd + 60, t, smooth: false }));
          const YL = []; for (let i = 0; i < 16; i++) { const yy = yt + Math.pow((i + 1) / 16, 1.6) * (H - yt), xx = hn(sd, i) * W; YL.push(Pp([[xx - 60 * u, yy], [xx + 60 * u, yy + 4]], 400 + i, { w: 3 + i * 0.2, amp: 0.6 })); }
          yardL.setAttribute('d', YL.join(' '));
          // walking girls
          girls.forEach((g2, i) => { const [a, b2, s] = g2.q, f = clamp01(lt / Math.max(1, dur)), xx = lerp(a, b2, f) * W; g2.f.update(t, xx, (P.road ?? 0.9) * H + i * 14 * u, s * u, { full: true, walk: t * 7 + i * 1.3, bag: true, look: 0.5 }); });
          // the gate: two leaves hinged at the posts, closing towards the middle
          const close = mode === 'hook' ? progIO(lt, sh - 0.45, 0.5) : mode === 'end' ? 0 : 1;
          const gt = GT.top * H, gb = GT.bottom * H, pl = 0.04 * W, pr = 0.96 * W, half = (pr - pl) / 2;
          const GB = [], GP = [];
          [[pl, 1], [pr, -1]].forEach(([hx, dir], k) => {
            const a = (1 - close) * 1.32, wv = half * Math.cos(a), dz = half * Math.sin(a) * 0.22;   // width seen, perspective lift
            const tx = hx + dir * wv, tt = gt - dz * 0.6, tb = gb + dz * 0.3;
            const n = 9; for (let i = 0; i <= n; i++) { const f = i / n, xx = lerp(hx, tx, f), y0 = lerp(gt, tt, f), y1 = lerp(gb, tb, f); GB.push(Pp([[xx, y0 - 30 * u], [xx, y1]], 500 + k * 20 + i, { w: 11 * u })); GB.push(inkDot(xx, y0 - 38 * u, 9 * u, 14 * u, sd + 540 + k * 20 + i, t)); }
            [0.12, 0.55, 0.92].forEach((q, j) => GB.push(Pp([[hx, lerp(gt, gb, q)], [tx, lerp(tt, tb, q)]], 580 + k * 5 + j, { w: 14 * u })));
            GP.push(Pp([[hx, gt - 120 * u], [hx, H + 20]], 600 + k, { w: 44 * u }), inkCircle(hx, gt - 140 * u, 30 * u, sd + 602 + k, t, { fill: true }));
          });
          gate.setAttribute('d', GB.join(' ')); gateP.setAttribute('d', GP.join(' '));
          if (close > 0.97) {
            const lc = [W / 2, lerp(gt, gb, 0.5) + 30 * u], sc = 1 + 0.15 * hit, swing = Math.sin(Math.max(0, lt - sh) * 9) * Math.exp(-Math.max(0, lt - sh) * 2.5) * 0.4;
            const CH = []; for (let i = 0; i < 9; i++) { const f = i / 8; CH.push(inkCircle(lerp(W / 2 - 110 * u, W / 2 + 110 * u, f), lerp(gt, gb, 0.5) - 30 * u + Math.sin(f * Math.PI) * 50 * u, 16 * u, sd + 620 + i, t, { w: 7 * u, ry: 11 * u })); }
            chain.setAttribute('d', CH.join(' '));
            const lx = lc[0] + Math.sin(swing) * 60 * u, ly = lc[1] + Math.cos(swing) * 30 * u;
            const LK = [[lx - 44 * sc * u, ly], [lx + 44 * sc * u, ly], [lx + 44 * sc * u, ly + 80 * sc * u], [lx - 44 * sc * u, ly + 80 * sc * u]];
            lock.setAttribute('d', inkLoop(LK, { seed: sd + 640, t, smooth: false }));
            lockL.setAttribute('d', Pp(LK, 641, { closed: true, smooth: false, w: 6 }) + ' ' + Pp([[lx - 28 * sc * u, ly], [lx - 28 * sc * u, ly - 40 * sc * u], [lx, ly - 64 * sc * u], [lx + 28 * sc * u, ly - 40 * sc * u], [lx + 28 * sc * u, ly]], 642, { w: 11 * u }) + ' ' + inkDot(lx, ly + 36 * sc * u, 9 * u, 12 * u, sd + 643, t));
            lock.setAttribute('fill', INK.red);
          } else blank(chain, lock, lockL);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lg_map
  // Lake Victoria coast (lon, lat), clockwise from Entebbe; simplified by hand
  const LAKE = [[32.45, 0.05], [32.6, 0.3], [33.0, 0.38], [33.2, 0.45], [33.6, 0.3], [34.0, 0.18], [34.1, -0.05], [34.75, -0.25], [34.8, -0.42], [34.2, -0.4],
    [34.1, -0.75], [33.95, -1.1], [33.75, -1.5], [33.6, -1.9], [33.85, -2.1], [33.5, -2.3], [33.1, -2.25], [32.9, -2.5], [32.55, -2.6], [32.2, -2.45],
    [31.95, -2.7], [31.75, -2.5], [31.85, -2.1], [31.7, -1.75], [31.8, -1.4], [31.75, -1.1], [31.7, -0.75], [31.8, -0.4], [32.1, -0.25], [32.3, -0.1]];
  SH.lg_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 211, root = el(svg, 'g'), u = W / 1080;
      const lon0 = P.lon0 ?? 32.75, lat0 = P.lat0 ?? -1.15, ppd = (P.ppd ?? 300) * u, cy0 = (P.cy ?? 0.42) * H;
      const M = (lo, la) => [W / 2 + (lo - lon0) * ppd, cy0 - (la - lat0) * ppd];
      const E = (c, x) => inkEl(root, c, x);
      const land = E(mix(INK.paperLight, INK.stain, 0.12)), hatch = E(mix(INK.inkSoft, INK.paperLight, 0.35)), water = E(mix(INK.blue, INK.paperLight, 0.55)), waves = E(mix(INK.blue, INK.ink, 0.15)), coast = E(INK.inkSoft);
      const border = E(INK.red), hills = E(mix(INK.green, INK.inkSoft, 0.3)), towns = E(INK.ink), pulse = E(INK.red), pin = E(INK.red), pinL = E(), rose = E(), roseF = E(INK.red);
      const huts = [0, 1, 2, 3].map(i => ({ f: E(mix(INK.gold, INK.stain, 0.5)), l: E() }));
      const FB = (P.front || [[0.07, 1.0, 0.9, 'b'], [0.3, 0.98, 0.55, 'h'], [0.58, 1.01, 0.75, 'h'], [0.97, 1.0, 1.0, 'b']]).map((q, i) => ({ q, d: q[3] === 'b' ? banana(el(root, 'g'), sd + 700 + i * 40) : hut(el(root, 'g'), sd + 700 + i * 40) }));
      const LB = labels(root, P.labels, W, H);
      const PIN = P.pin || [31.68, -1.62], BUK = [31.82, -1.33];
      const r0 = rng(sd + 5), HL = Array.from({ length: 26 }, () => [lerp(-0.05, 0.3, r0()), lerp(0.22, 0.95, r0())]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, dr = prog(lt, 0, Math.min(1.2, dur * 0.5)), pt = atOr(cues, 'pin', dur * 0.3);
          land.setAttribute('d', inkLoop([[-30, -30], [W + 30, -30], [W + 30, H + 30], [-30, H + 30]], { seed: sd + 1, t, smooth: false }));
          const HT = []; for (let i = 0; i < 40; i++) { const yy = H * (0.66 + i * 0.01), xx = (hn(i, 3) * 0.9) * W; HT.push(inkPath([[xx, yy + 400 * u * hn(i, 7)], [xx + 90 * u, yy + 400 * u * hn(i, 7) - 6 * u]], { w: 2.5, seed: sd + 50 + i, t })); }
          hatch.setAttribute('d', HT.join(' '));
          const LK = LAKE.map(p => M(p[0], p[1]));
          const n = Math.max(3, Math.round(LK.length * dr));
          water.setAttribute('d', dr > 0.99 ? inkLoop(LK, { seed: sd + 2, t, amp: 1.2 }) : '');
          coast.setAttribute('d', inkPath(dr > 0.99 ? LK : LK.slice(0, n), { w: 7, seed: sd + 3, t, closed: dr > 0.99 }));
          const WV = []; if (dr > 0.99) for (let i = 0; i < 26; i++) { const lo = lerp(32.0, 34.6, hn(i, 1)), la = lerp(0.1, -2.3, hn(i, 2)), p = M(lo, la), off = Math.sin(t * 1.4 + i) * 10 * u; WV.push(inkPath([[p[0] - 30 * u + off, p[1]], [p[0] - 10 * u + off, p[1] - 9 * u], [p[0] + 10 * u + off, p[1]], [p[0] + 30 * u + off, p[1] - 9 * u]], { w: 3.5, seed: sd + 100 + i, t })); }
          waves.setAttribute('d', WV.join(' '));
          // border (1° S) dashed
          const BD = []; for (let lo = 29.5; lo < 31.75; lo += 0.16) { const a = M(lo, -1.0), b = M(lo + 0.09, -1.0); BD.push(inkPath([a, b], { w: 5, seed: sd + 200 + Math.round(lo * 10), t })); }
          border.setAttribute('d', BD.join(' '));
          // hills symbols on the west land
          const HS = []; HL.forEach((q, i) => { const x = q[0] * W, y = q[1] * H; if (Math.hypot(x - M(PIN[0], PIN[1])[0], y - M(PIN[0], PIN[1])[1]) < 110 * u) return; HS.push(inkPath([[x - 26 * u, y], [x, y - 22 * u], [x + 26 * u, y]], { w: 4, seed: sd + 300 + i, t })); });
          hills.setAttribute('d', HS.join(' '));
          // small beehive huts around Kashasha (villages)
          [[-0.18, 0.12], [-0.05, 0.3], [-0.32, 0.38], [0.02, -0.18]].forEach((q, i) => {
            const c = M(PIN[0] + q[0], PIN[1] + q[1]), s = 0.8 * u, D = [[c[0] - 26 * s, c[1]], [c[0] - 22 * s, c[1] - 26 * s], [c[0], c[1] - 44 * s], [c[0] + 22 * s, c[1] - 26 * s], [c[0] + 26 * s, c[1]]];
            const k = progIO(lt, pt + 0.3 + i * 0.15, 0.4);
            huts[i].f.setAttribute('d', k > 0.02 ? inkLoop(D.map(p => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]), { seed: sd + 400 + i, t }) : '');
            huts[i].l.setAttribute('d', k > 0.02 ? inkPath(D.map(p => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]), { w: 4, seed: sd + 410 + i, t, closed: true }) : '');
          });
          const bk = M(BUK[0], BUK[1]);
          towns.setAttribute('d', inkCircle(bk[0], bk[1], 13 * u, sd + 500, t, { fill: true }));
          // pin + pulse on Kashasha
          const pp = M(PIN[0], PIN[1]), sp = spring(lt, pt, 0.5), PU = [];
          if (lt > pt) for (let k = 0; k < 3; k++) { const f = ((lt - pt) * 0.7 + k / 3) % 1; PU.push(inkCircle(pp[0], pp[1], (30 + f * 150) * u, sd + 510 + k, t, { w: 7 * (1 - f) + 1 })); }
          pulse.setAttribute('d', PU.join(' '));
          const pr = 24 * u * sp, PN = [[pp[0], pp[1]], [pp[0] - pr, pp[1] - pr * 1.8], [pp[0], pp[1] - pr * 3], [pp[0] + pr, pp[1] - pr * 1.8]];
          pin.setAttribute('d', sp > 0.02 ? inkLoop(PN, { seed: sd + 520, t }) : '');
          pinL.setAttribute('d', sp > 0.02 ? inkPath(PN, { w: 5, seed: sd + 521, t, closed: true }) + ' ' + inkCircle(pp[0], pp[1] - pr * 1.9, pr * 0.4, sd + 522, t, { w: 4 }) : '');
          // compass rose (bottom right)
          const rc = [0.83 * W, 0.86 * H], rr = 90 * u, ra = Math.sin(t * 0.8) * 0.06;
          const RS = [0, 1, 2, 3].map(i => { const a = ra + i * Math.PI / 2 - Math.PI / 2; return [[rc[0], rc[1]], [rc[0] + Math.cos(a - 0.3) * rr * 0.32, rc[1] + Math.sin(a - 0.3) * rr * 0.32], [rc[0] + Math.cos(a) * rr, rc[1] + Math.sin(a) * rr], [rc[0] + Math.cos(a + 0.3) * rr * 0.32, rc[1] + Math.sin(a + 0.3) * rr * 0.32]]; });
          roseF.setAttribute('d', inkLoop(RS[0], { seed: sd + 600, t, smooth: false }));
          rose.setAttribute('d', RS.map((q, i) => inkPath(q, { w: 4, seed: sd + 601 + i, t, closed: true, smooth: false })).join(' ') + ' ' + inkCircle(rc[0], rc[1], rr * 0.62, sd + 610, t, { w: 3 }));
          FB.forEach(f => f.d.update(t, f.q[0] * W, f.q[1] * H, f.q[2] * u));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ classroom pieces
  function deskRow(parent, sd) {
    const top = inkEl(parent, WOOD_L()), front = inkEl(parent, WOOD()), cub = inkEl(parent, mix(WARM(), INK.ink, 0.72)), spines = [INK.red, INK.blue, INK.green, INK.gold, INK.paperLight].map(c => inkEl(parent, c)), lines = inkEl(parent), grain = inkEl(parent, WOOD_D());
    return {
      update(t, W, y, bottom, th, o = {}) {
        const x0 = (o.x0 ?? -0.04) * W, x1 = (o.x1 ?? 1.04) * W;
        const TP = [[x0, y], [x1, y], [x1 + 8, y + th], [x0 - 8, y + th]], FR = [[x0, y + th], [x1, y + th], [x1, bottom], [x0, bottom]];
        top.setAttribute('d', inkLoop(TP, { seed: sd + 1, t, smooth: false }));
        front.setAttribute('d', inkLoop(FR, { seed: sd + 2, t, smooth: false }));
        const G = []; for (let i = 0; i < 7; i++) { const yy = lerp(y + th + 20, bottom, (i + 0.5) / 7); G.push(inkPath([[x0 + hn(sd, i) * W * 0.4, yy], [x0 + hn(sd, i) * W * 0.4 + W * 0.3, yy + 3]], { w: 2.2, seed: sd + 10 + i, t })); }
        grain.setAttribute('d', G.join(' '));
        const LN = [inkPath(TP, { w: 5, seed: sd + 3, t, closed: true, smooth: false })], CB = [], SP = spines.map(() => []);
        (o.cubby || []).forEach((q, i) => {
          const cx = q[0] * W, cw = q[1] * W / 2, c0 = q[2] != null ? q[2] * W * 1920 / 1080 : y + th + 30, c1 = c0 + (o.ch || 200);
          const Q = [[cx - cw, c0], [cx + cw, c0], [cx + cw, c1], [cx - cw, c1]];
          CB.push(inkLoop(Q, { seed: sd + 40 + i, t, smooth: false })); LN.push(inkPath(Q, { w: 5, seed: sd + 50 + i, t, closed: true, smooth: false }));
          let x = cx - cw + 12; for (let k = 0; x < cx + cw - 30; k++) { const bw = 22 + 18 * hn(sd + i, k), bh = (c1 - c0) * (0.55 + 0.35 * hn(sd + i, k + 9)), lean = k % 5 === 4 ? 14 : 0; const B = [[x, c1 - 4], [x + bw, c1 - 4], [x + bw + lean, c1 - bh], [x + lean, c1 - bh]]; SP[(i * 3 + k) % 5].push(inkLoop(B, { seed: sd + 60 + i * 20 + k, t, smooth: false })); LN.push(inkPath(B, { w: 3, seed: sd + 80 + i * 20 + k, t, closed: true, smooth: false })); x += bw + 4; }
        });
        cub.setAttribute('d', CB.join(' ')); spines.forEach((e, k) => e.setAttribute('d', SP[k].join(' ')));
        (o.legs || []).forEach((q, i) => LN.push(inkPath([[q * W, y + th], [q * W, bottom]], { w: 4, seed: sd + 20 + i, t })));
        lines.setAttribute('d', LN.join(' '));
      },
    };
  }
  // exercise books, an ink pot and a pencil on a desk top
  function deskThings(parent, sd) {
    const book = inkEl(parent, INK.paperLight), bookB = inkEl(parent, mix(INK.blue, INK.paperLight, 0.2)), pot = inkEl(parent, INK.ink), lines = inkEl(parent), pen = inkEl(parent, INK.gold);
    return {
      update(t, spots, y, s) {
        const BK = [], BB = [], PO = [], LN = [], PE = [];
        spots.forEach((x, i) => {
          const w = 120 * s, h = 26 * s, ox = x + (hn(sd, i) - 0.5) * 30 * s;
          const Bk = [[ox - w, y - 2], [ox + w * 0.1, y - 2], [ox + w * 0.15, y - h], [ox - w * 0.95, y - h]];
          (i % 2 ? BB : BK).push(inkLoop(Bk, { seed: sd + i * 7, t, smooth: false }));
          LN.push(inkPath(Bk, { w: 4, seed: sd + i * 7 + 1, t, closed: true, smooth: false }), inkPath([[ox - w * 0.42, y - 2], [ox - w * 0.4, y - h]], { w: 3, seed: sd + i * 7 + 2, t }));
          const px = ox + w * 0.6, P0 = [[px - 18 * s, y], [px + 18 * s, y], [px + 14 * s, y - 34 * s], [px - 14 * s, y - 34 * s]];
          PO.push(inkLoop(P0, { seed: sd + i * 7 + 3, t, smooth: false }));
          PE.push(inkPath([[ox + w * 0.2, y - 6 * s], [ox + w * 0.42, y - 18 * s]], { w: 7 * s, seed: sd + i * 7 + 4, t, taper: 0 }));
        });
        book.setAttribute('d', BK.join(' ')); bookB.setAttribute('d', BB.join(' ')); pot.setAttribute('d', PO.join(' ')); lines.setAttribute('d', LN.join(' ')); pen.setAttribute('d', PE.join(' '));
      },
    };
  }
  function blackboard(parent, sd) {
    const fr = inkEl(parent, WOOD_D()), bd = inkEl(parent, mix(INK.green, INK.ink, 0.6)), ch = inkEl(parent, mix(INK.paperLight, INK.paperDark, 0.15));
    const tx = el(parent, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: mix(INK.paperLight, INK.paperDark, 0.1) });
    const tx2 = el(parent, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.paperLight });
    return {
      update(t, x0, y0, x1, y1, text, big, sub, u) {
        const Q = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
        bd.setAttribute('d', inkLoop(Q, { seed: sd + 1, t, smooth: false }));
        fr.setAttribute('d', inkPath(Q, { w: 22 * u, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[x0 + 30 * u, y1 + 22 * u], [x1 - 30 * u, y1 + 22 * u]], { w: 16 * u, seed: sd + 3, t }));
        const C = []; for (let i = 0; i < 3; i++) { const yy = lerp(y0, y1, 0.62 + i * 0.12); if (!big) C.push(inkPath([[x0 + 80 * u, yy], [lerp(x0, x1, 0.45 + hn(sd, i) * 0.4), yy + 4]], { w: 3, seed: sd + 10 + i, t, amp: 1.4 })); }
        ch.setAttribute('d', C.join(' '));
        tx.setAttribute('x', f1((x0 + x1) / 2)); tx.setAttribute('y', f1(lerp(y0, y1, big ? 0.88 : 0.42))); tx.setAttribute('font-size', f1((big ? 64 : 86) * u)); tx.textContent = big ? (sub || '') : (text || '');
        tx2.setAttribute('x', f1((x0 + x1) / 2)); tx2.setAttribute('y', f1(lerp(y0, y1, 0.56))); tx2.setAttribute('font-size', f1(170 * u)); tx2.textContent = big || '';
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.lg_class
  SH.lg_class = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 331, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'start';
      const board = blackboard(el(root, 'g'), sd + 1);
      const teacher = P.teacher === false || mode !== 'start' ? null : window.LH.person(el(root, 'g'), sd + 5, { kind: 'sweater', col: mix(INK.red, INK.paperLight, 0.45), hair: 'dark', glasses: true });
      // rows: [desk top 0..1 H, scale, girl xs]
      const ROWS = P.rows || [[0.445, 0.58, [0.1, 0.27, 0.44, 0.61, 0.78, 0.94]], [0.585, 0.86, [0.07, 0.34, 0.66, 0.93]], [0.705, 1.36, [0.19, 0.5, 0.81]]];
      const R = ROWS.map((r, ri) => ({ r, girls: r[2].map((x, i) => ({ x, f: girl(el(root, 'g'), sd + 100 + ri * 60 + i * 9, { tone: hn(sd + ri, i) }) })), desk: deskRow(el(root, 'g'), sd + 400 + ri * 20), things: ri === 2 ? deskThings(el(root, 'g'), sd + 480) : null, rip: ripples(el(root, 'g'), sd + 500 + ri * 30) }));
      const LB = labels(root, P.labels, W, H);
      // laugh start order: front row first (distance from the front centre)
      const order = []; R.forEach((row, ri) => row.girls.forEach((g, i) => order.push({ ri, i, d: (2 - ri) * 1.0 + Math.abs(g.x - 0.5) * 1.6 + hn(sd + ri, i) * 0.3 })));
      order.sort((a, b) => a.d - b.d); order.forEach((o, k) => { R[o.ri].girls[o.i].rank = k; });
      const total = order.length;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, la = atOr(cues, 'laugh', dur * 0.3), spr = atOr(cues, 'spread', 0.2);
          const cnt = P.count || [3, 95], cf = mode === 'spread' ? progIO(lt, spr, Math.max(1, dur * 0.75)) : 0;
          board.update(t, 0.14 * W, 0.15 * H, 0.86 * W, 0.355 * H, P.board ?? '30 January 1962', mode === 'spread' ? String(Math.round(lerp(cnt[0], cnt[1], cf))) : '', mode === 'spread' ? 'of ' + (P.of || '159') : '', u);
          if (teacher) { const turn = lt > la + 0.3; teacher.update(t, 0.9 * W, 0.66 * H, 0.95 * u, { face: turn ? -1 : -1, lean: turn ? -4 : 2, brow: turn ? 1 : 0, look: [2, 4], mouth: turn ? 0.6 : 0, armR: turn ? null : [0.8 * W, 0.28 * H] }); }
          R.forEach((row, ri) => {
            const y = row.r[0] * H, s = row.r[1] * u, RP = [];
            row.girls.forEach((g, i) => {
              let lk = 0, k = 0;
              if (mode === 'start') { k = ri === 2 ? clamp01((lt - la - i * 0.12) / 0.35) : 0; lk = ri < 2 && lt > la + 0.4 ? (g.x < 0.5 ? 0.6 : -0.6) * Math.min(1, (lt - la - 0.4) * 3) : 0; }
              else { const st = spr + (g.rank / total) * dur * 0.7 - (g.rank < 3 ? 1 : 0); k = clamp01((lt - st) / 0.4); }
              const o = g.f.update(t, g.x * W, y, s, { laugh: k, tears: true, look: lk });
              RP.push([o.hc[0], o.hc[1], o.R * 1.35, k, 1.0 + (i % 3) * 0.15]);
            });
            const bottom = ri === 2 ? H + 30 : (ROWS[ri + 1][0] * H + 40 * u);
            row.desk.update(t, W, y, bottom, (ri === 2 ? 40 : 24) * row.r[1] / 1.36 * u * 1.36, { legs: ri === 2 ? [0.02, 0.35, 0.66, 0.98] : [], cubby: ri === 2 ? [[0.185, 0.27], [0.5, 0.27], [0.815, 0.27]] : [], ch: 230 * u });
            if (row.things) row.things.update(t, row.r[2].map(x => x * W), y + 2, s * 0.9);
            row.rip.update(t, RP);
          });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lg_hours
  SH.lg_hours = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 457, root = el(svg, 'g'), u = W / 1080;
      const patch = inkEl(root, INK.paperLight, { 'fill-opacity': 0.55 });
      const clk = window.LH.clock(el(root, 'g'), sd + 3);
      const back = girl(el(root, 'g'), sd + 20, { tone: 0.7 }), backDesk = deskRow(el(root, 'g'), sd + 40);
      const main = girl(el(root, 'g'), sd + 60, { tone: 0.3, hair: 0.6 }), desk = deskRow(el(root, 'g'), sd + 80), things = deskThings(el(root, 'g'), sd + 90);
      const rip = ripples(el(root, 'g'), sd + 120);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null));
          const px = lerp(0.05, 0.55, (lt / Math.max(1, dur))) * W, PA = [[px, 0.16 * H], [px + 260 * u, 0.16 * H], [px + 420 * u, 0.5 * H], [px + 160 * u, 0.5 * H]];
          patch.setAttribute('d', inkLoop(PA, { seed: sd + 1, t, smooth: false }));
          clk.update(t, 0.5 * W, 0.36 * H, 120 * u * (1 + 0.05 * hit), lt * 1.6 + 0.3);
          const ob = back.update(t, 0.8 * W, 0.56 * H, 0.8 * u, { laugh: 0.8, tears: true });
          backDesk.update(t, W, 0.56 * H, 0.62 * H, 20 * u, { x0: 0.55, x1: 1.05 });
          const om = main.update(t, 0.42 * W, 0.76 * H, 1.75 * u, { laugh: 1, cover: 0.35 + 0.35 * Math.sin(t * 1.3), tears: true });
          desk.update(t, W, 0.76 * H, H + 30, 46 * u, { legs: [0.05, 0.95], cubby: [[0.3, 0.42], [0.76, 0.34]], ch: 250 * u });
          things.update(t, [0.62 * W], 0.76 * H + 2, 1.3 * u);
          rip.update(t, [[om.hc[0], om.hc[1], om.R * 1.3, 1, 1.1], [ob.hc[0], ob.hc[1], ob.R * 1.3, 0.7, 1.3]]);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lg_lab
  function microscope(parent, sd) {
    const body = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.3)), metal = inkEl(parent, mix(INK.paperLight, INK.inkSoft, 0.2)), lines = inkEl(parent), lamp = inkEl(parent, INK.gold);
    return {
      update(t, x, y, s) {
        const P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 5, seed: sd + k, t }, ex));
        const base = [[x - 110 * s, y], [x + 110 * s, y], [x + 90 * s, y - 40 * s], [x - 90 * s, y - 40 * s]];
        const arm = [[x + 40 * s, y - 40 * s], [x + 90 * s, y - 40 * s], [x + 80 * s, y - 280 * s], [x + 20 * s, y - 300 * s], [x + 30 * s, y - 220 * s]];
        const stage = [[x - 90 * s, y - 120 * s], [x + 60 * s, y - 120 * s], [x + 60 * s, y - 140 * s], [x - 90 * s, y - 140 * s]];
        const tube = [[x - 60 * s, y - 160 * s], [x - 20 * s, y - 160 * s], [x - 50 * s, y - 360 * s], [x - 90 * s, y - 360 * s]];
        const eye = [[x - 98 * s, y - 360 * s], [x - 42 * s, y - 360 * s], [x - 50 * s, y - 410 * s], [x - 92 * s, y - 410 * s]];
        body.setAttribute('d', inkLoop(base, { seed: sd + 1, t, smooth: false }) + ' ' + inkLoop(arm, { seed: sd + 2, t }));
        metal.setAttribute('d', inkLoop(stage, { seed: sd + 3, t, smooth: false }) + ' ' + inkLoop(tube, { seed: sd + 4, t, smooth: false }) + ' ' + inkLoop(eye, { seed: sd + 5, t, smooth: false }));
        lines.setAttribute('d', [base, stage, tube, eye].map((q, i) => P(q, 10 + i, { closed: true, smooth: false })).join(' ') + ' ' + P(arm, 15, { closed: true }) + ' ' + inkCircle(x + 64 * s, y - 200 * s, 22 * s, sd + 16, t, { w: 5 }));
        lamp.setAttribute('d', inkCircle(x - 15 * s, y - 80 * s, 16 * s * (0.9 + 0.1 * Math.sin(t * 4)), sd + 17, t, { fill: true }));
        return { eye: [x - 70 * s, y - 410 * s] };
      },
    };
  }
  SH.lg_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 577, root = el(svg, 'g'), u = W / 1080;
      const by = (P.bench ?? 0.6) * H;
      const shelf = inkEl(root, WOOD()), shelfL = inkEl(root), jars = inkEl(root, mix(INK.paperLight, INK.blue, 0.2)), jarsL = inkEl(root);
      const doc = window.LH.person(el(root, 'g'), sd + 5, { kind: 'lab', hair: 'white', glasses: true });
      const bench = deskRow(el(root, 'g'), sd + 30);
      const ms = microscope(el(root, 'g'), sd + 50);
      const rack = inkEl(root, WOOD_D()), tubes = inkEl(root, mix(INK.paperLight, INK.blue, 0.15)), liq = inkEl(root, mix(INK.gold, INK.paperLight, 0.3)), bottle = inkEl(root, mix(INK.green, INK.ink, 0.25)), bottleT = inkEl(root, INK.paperLight), rackL = inkEl(root);
      const xmark = inkEl(root, INK.red);
      const call = inkEl(root, INK.inkSoft), view = inkEl(root, INK.paperLight), cells = inkEl(root, mix(INK.red, INK.paperLight, 0.6)), viewL = inkEl(root), cross = inkEl(root, INK.inkSoft);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, po = atOr(cues, 'poison', dur * 0.45), gm = atOr(cues, 'germ', dur * 0.7);
          // back shelf with jars
          const sy = 0.47 * H;
          shelf.setAttribute('d', inkLoop([[0.52 * W, sy], [1.04 * W, sy], [1.04 * W, sy + 22 * u], [0.52 * W, sy + 22 * u]], { seed: sd + 1, t, smooth: false }));
          const JR = [], JL = []; [0.58, 0.68, 0.79, 0.9, 0.99].forEach((x, i) => { const h = (80 + 40 * hn(sd, i)) * u, w = 34 * u, Q = [[x * W - w, sy], [x * W + w, sy], [x * W + w, sy - h], [x * W - w, sy - h]]; JR.push(inkLoop(Q, { seed: sd + 10 + i, t, smooth: false })); JL.push(inkPath(Q, { w: 4, seed: sd + 20 + i, t, closed: true, smooth: false })); });
          jars.setAttribute('d', JR.join(' ')); jarsL.setAttribute('d', JL.join(' ')); shelfL.setAttribute('d', inkPath([[0.52 * W, sy], [1.04 * W, sy]], { w: 5, seed: sd + 2, t }));
          // the doctor bends to the eyepiece
          const mx = 0.47 * W, ps = 1.6 * u;
          const oe = ms.update(t, mx, by, 1.0 * u);
          const hip = by + 30 * u, gy = hip + 190 * ps;
          doc.update(t, 0.2 * W, gy, ps, { face: 1, lean: 18 + Math.sin(t * 0.8) * 2, brow: lt > gm ? 1 : 0.3, look: [6, 4], armR: [mx - 60 * u, by - 170 * u + Math.sin(t * 2) * 6 * u], armL: [mx - 140 * u, by - 40 * u] });
          bench.update(t, W, by, H + 30, 40 * u, { legs: [0.03, 0.97], cubby: [[0.3, 0.4, 0.72], [0.75, 0.36, 0.72], [0.3, 0.4, 0.86], [0.75, 0.36, 0.86]], ch: 220 * u });
          // rack of test tubes + bottle
          const rx = 0.68 * W, RK = [[rx - 140 * u, by], [rx + 140 * u, by], [rx + 140 * u, by - 70 * u], [rx - 140 * u, by - 70 * u]];
          rack.setAttribute('d', inkLoop(RK, { seed: sd + 30, t, smooth: false }));
          const TB = [], LQ = [], TL = [inkPath(RK, { w: 5, seed: sd + 31, t, closed: true, smooth: false })];
          for (let i = 0; i < 4; i++) { const x = rx - 105 * u + i * 52 * u, Q = [[x - 16 * u, by - 40 * u], [x + 16 * u, by - 40 * u], [x + 16 * u, by - 230 * u], [x - 16 * u, by - 230 * u]]; TB.push(inkLoop(Q, { seed: sd + 40 + i, t, smooth: false })); const lv = by - 100 * u - 30 * u * hn(sd, i) + Math.sin(t * 2 + i) * 3 * u; LQ.push(inkLoop([[x - 14 * u, by - 42 * u], [x + 14 * u, by - 42 * u], [x + 14 * u, lv], [x - 14 * u, lv]], { seed: sd + 50 + i, t, smooth: false })); TL.push(inkPath(Q, { w: 4, seed: sd + 60 + i, t, closed: true, smooth: false })); }
          const bx = rx + 100 * u, BT = [[bx - 40 * u, by - 70 * u], [bx + 40 * u, by - 70 * u], [bx + 40 * u, by - 200 * u], [bx + 14 * u, by - 230 * u], [bx + 14 * u, by - 270 * u], [bx - 14 * u, by - 270 * u], [bx - 14 * u, by - 230 * u], [bx - 40 * u, by - 200 * u]];
          tubes.setAttribute('d', TB.join(' ')); liq.setAttribute('d', LQ.join(' ')); bottle.setAttribute('d', inkLoop(BT, { seed: sd + 70, t, smooth: false }));
          bottleT.setAttribute('d', inkLoop([[bx - 30 * u, by - 110 * u], [bx + 30 * u, by - 110 * u], [bx + 30 * u, by - 170 * u], [bx - 30 * u, by - 170 * u]], { seed: sd + 71, t, smooth: false }));
          TL.push(inkPath(BT, { w: 5, seed: sd + 72, t, closed: true, smooth: false }));
          rackL.setAttribute('d', TL.join(' '));
          const xk = spring(lt, po, 0.4), xc = [rx + 10 * u, by - 150 * u], xr = 120 * u * xk;
          xmark.setAttribute('d', lt > po ? inkPath([[xc[0] - xr, xc[1] - xr], [xc[0] + xr, xc[1] + xr]], { w: 18 * u, seed: sd + 80, t }) + ' ' + inkPath([[xc[0] + xr, xc[1] - xr], [xc[0] - xr, xc[1] + xr]], { w: 18 * u, seed: sd + 81, t }) : '');
          // microscope view inset
          const vc = [0.72 * W, 0.265 * H], vr = 170 * u;
          call.setAttribute('d', inkPath([[oe[0] + 10 * u, oe[1] - 10 * u], [vc[0] - vr * 0.7, vc[1] + vr * 0.7]], { w: 4, seed: sd + 90, t }) + ' ' + inkPath([[oe[0] + 40 * u, oe[1]], [vc[0] - vr * 0.1, vc[1] + vr * 0.98]], { w: 4, seed: sd + 91, t }));
          view.setAttribute('d', inkCircle(vc[0], vc[1], vr, sd + 92, t, { fill: true }));
          const CE = []; for (let i = 0; i < 9; i++) { const a = hn(sd, i) * TAU + lt * 0.15, rr = vr * 0.7 * Math.sqrt(hn(sd, i + 20)), cx = vc[0] + Math.cos(a) * rr, cy = vc[1] + Math.sin(a) * rr; CE.push(inkCircle(cx, cy, 26 * u, sd + 100 + i, t, { fill: true, ry: 20 * u })); }
          cells.setAttribute('d', CE.join(' '));
          viewL.setAttribute('d', inkCircle(vc[0], vc[1], vr, sd + 93, t, { w: 12 * u }));
          const ch = [vc[0] + Math.sin(lt * 1.7) * vr * 0.4, vc[1] + Math.cos(lt * 1.3) * vr * 0.3];
          cross.setAttribute('d', inkPath([[ch[0] - 60 * u, ch[1]], [ch[0] + 60 * u, ch[1]]], { w: 3, seed: sd + 95, t }) + ' ' + inkPath([[ch[0], ch[1] - 60 * u], [ch[0], ch[1] + 60 * u]], { w: 3, seed: sd + 96, t }) + ' ' + inkCircle(ch[0], ch[1], 34 * u, sd + 97, t, { w: 3 }));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ beehive grass hut (Haya mushonge), origin at the foot centre
  function hut(parent, sd) {
    const f = inkEl(parent, mix(INK.gold, INK.stain, 0.45)), th = inkEl(parent, mix(INK.stain, INK.ink, 0.35)), dr = inkEl(parent, INK.ink), l = inkEl(parent);
    return {
      update(t, x, y, s) {
        const D = [[x - 150 * s, y], [x - 148 * s, y - 90 * s], [x - 110 * s, y - 200 * s], [x - 40 * s, y - 270 * s], [x, y - 300 * s], [x + 40 * s, y - 270 * s], [x + 110 * s, y - 200 * s], [x + 148 * s, y - 90 * s], [x + 150 * s, y]];
        f.setAttribute('d', inkLoop(D, { seed: sd + 1, t, amp: 1.2 }));
        const T = []; for (let r = 1; r < 6; r++) { const yy = y - r * 50 * s, hw = 150 * s * Math.sqrt(Math.max(0, 1 - Math.pow((r * 50) / 300, 2))); T.push(inkPath([[x - hw, yy + 8 * s], [x, yy - 6 * s], [x + hw, yy + 8 * s]], { w: 3, seed: sd + 10 + r, t })); }
        for (let i = 0; i < 9; i++) { const a = lerp(-1.2, 1.2, i / 8); T.push(inkPath([[x + Math.sin(a) * 140 * s, y - 20 * s], [x + Math.sin(a) * 60 * s, y - 250 * s]], { w: 2, seed: sd + 20 + i, t })); }
        T.push(inkPath([[x - 10 * s, y - 300 * s], [x, y - 350 * s], [x + 10 * s, y - 300 * s]], { w: 5, seed: sd + 30, t }));
        th.setAttribute('d', T.join(' '));
        const DQ = [[x - 40 * s, y], [x - 40 * s, y - 80 * s], [x, y - 110 * s], [x + 40 * s, y - 80 * s], [x + 40 * s, y]];
        dr.setAttribute('d', inkLoop(DQ, { seed: sd + 2, t }));
        l.setAttribute('d', inkPath(D, { w: 6, seed: sd + 3, t, closed: true }));
        return { door: [x, y - 70 * s], top: [x, y - 300 * s] };
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.lg_road
  SH.lg_road = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 683, root = el(svg, 'g'), u = W / 1080;
      const road = inkEl(root, mix(INK.stain, INK.paperLight, 0.4)), roadL = inkEl(root, mix(INK.stain, INK.ink, 0.25));
      const school = inkEl(root, mix(INK.red, INK.paperLight, 0.5)), schoolR = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.35)), schoolL = inkEl(root);
      const trail = inkEl(root, INK.gold);
      // huts: [x 0..1, foot y 0..1, scale]
      const HU = P.huts || [[0.8, 0.385, 0.42], [0.22, 0.47, 0.62], [0.76, 0.58, 0.85], [0.3, 0.9, 1.6]];
      const huts = HU.map((q, i) => ({ q, h: hut(el(root, 'g'), sd + 100 + i * 20) }));
      const GG = el(root, 'g'), walkers = [0, 1].map(i => girl(el(GG, 'g'), sd + 300 + i * 40, { tone: 0.3 + i * 0.4 }));
      const ban = [banana(el(root, 'g'), sd + 400), banana(el(root, 'g'), sd + 450)];
      const rip = ripples(el(root, 'g'), sd + 500);
      const LB = labels(root, P.labels, W, H);
      // road centre line (from the school far up-left to the frame bottom right)
      const RD = [[0.18, 0.3], [0.45, 0.36], [0.62, 0.43], [0.48, 0.52], [0.4, 0.62], [0.6, 0.74], [0.78, 0.86], [0.86, 1.02]];
      const spline = () => { const pts = RD.map(p => [p[0] * W, p[1] * H]); return inkSpline(pts, false, 8); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, fo = atOr(cues, 'follow', dur * 0.25);
          const S = spline(), Lf = [], Rt = [];
          S.forEach((p, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(14, 150, Math.pow(i / (S.length - 1), 1.5)) * u; Lf.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rt.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
          road.setAttribute('d', inkLoop(Lf.concat(Rt.slice().reverse()), { seed: sd + 1, t, smooth: false, amp: 1 }));
          roadL.setAttribute('d', inkPath(Lf, { w: 4, seed: sd + 2, t }) + ' ' + inkPath(Rt, { w: 4, seed: sd + 3, t }));
          // the school, small and far
          const sx = 0.14 * W, sy = 0.31 * H, sw = 120 * u, sh2 = 50 * u;
          const SW = [[sx - sw, sy], [sx + sw, sy], [sx + sw, sy - sh2], [sx - sw, sy - sh2]], SR = [[sx - sw - 14 * u, sy - sh2], [sx + sw + 14 * u, sy - sh2], [sx + sw - 6 * u, sy - sh2 - 26 * u], [sx - sw + 6 * u, sy - sh2 - 26 * u]];
          school.setAttribute('d', inkLoop(SW, { seed: sd + 4, t, smooth: false })); schoolR.setAttribute('d', inkLoop(SR, { seed: sd + 5, t, smooth: false }));
          schoolL.setAttribute('d', inkPath(SW, { w: 4, seed: sd + 6, t, closed: true, smooth: false }) + ' ' + inkPath(SR, { w: 4, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath([[sx, sy - sh2 - 26 * u], [sx, sy - sh2 - 66 * u]], { w: 5, seed: sd + 8, t }) + ' ' + inkPath([[sx - 14 * u, sy - sh2 - 52 * u], [sx + 14 * u, sy - sh2 - 52 * u]], { w: 5, seed: sd + 9, t }));
          // gold dotted trail along the road from cue "follow"
          const k = progIO(lt, fo, Math.max(1, dur * 0.65)), nS = Math.floor(S.length * k), TD = [];
          for (let i = 0; i < nS; i += 4) { const p = S[i], r = lerp(5, 14, i / S.length) * u; TD.push(inkCircle(p[0], p[1], r, sd + 600 + i, t, { fill: true })); }
          trail.setAttribute('d', TD.join(' '));
          // huts: lit in turn as the trail passes them
          const RP = [];
          huts.forEach((h, i) => {
            const o = h.h.update(t, h.q[0] * W, h.q[1] * H, h.q[2] * u);
            const on = clamp01((k - (i + 0.6) / (HU.length + 0.6)) * 6);
            RP.push([o.door[0], o.door[1] - 60 * h.q[2] * u, 120 * h.q[2] * u, on, 1 + i * 0.1]);
          });
          // two girls walking down the road
          walkers.forEach((w, i) => { const f = clamp01(0.12 + i * 0.07 + lt / Math.max(1, dur) * 0.22), id = Math.floor(f * (S.length - 1)), p = S[id], s = lerp(0.18, 0.9, Math.pow(f, 1.2)); w.update(t, p[0] + (i ? 40 : -40) * s * u, p[1], s * u, { full: true, walk: t * 7 + i * 2, bag: i === 0, laugh: k > 0.05 ? 0.5 : 0 }); });
          ban[0].update(t, 0.97 * W, 1.0 * H, 1.5 * u); ban[1].update(t, 0.06 * W, 0.6 * H, 0.9 * u);
          rip.update(t, RP);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.lg_minds
  // profile bust facing +x: head + neck + shoulders, kinds: girl | woman (head wrap) | man (old, beard) | boy
  function bust(parent, sd, kind) {
    const sh = inkEl(parent, kind === 'woman' ? mix(INK.red, INK.paperLight, 0.4) : kind === 'man' ? mix(INK.paperLight, INK.stain, 0.25) : UNI()), skin = inkEl(parent, SKIN(hn(sd, 3))), hair = inkEl(parent, kind === 'woman' ? mix(INK.gold, INK.red, 0.3) : kind === 'man' ? INK.paperLight : INK.ink), l = inkEl(parent), glow = inkEl(parent, INK.gold, { 'fill-opacity': 0 }), face = inkEl(parent, INK.ink);
    return {
      update(t, x, y, s, fc, lit) {
        const H2 = [x, y], R = 70 * s, P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 5, seed: sd + k, t }, ex));
        const SH2 = [[x - 170 * s * fc, y + 260 * s], [x - 150 * s * fc, y + 140 * s], [x - 20 * s * fc, y + 100 * s], [x + 120 * s * fc, y + 140 * s], [x + 150 * s * fc, y + 260 * s]];
        sh.setAttribute('d', inkLoop(SH2, { seed: sd + 1, t }));
        const HP = ellP(x, y, R, R * 1.08, 14).concat([]);
        const prof = [[x + R * 0.9 * fc, y - 10 * s], [x + R * 1.15 * fc, y + 14 * s], [x + R * 0.95 * fc, y + 22 * s], [x + R * 0.95 * fc, y + 50 * s], [x + R * 0.6 * fc, y + 74 * s]];
        skin.setAttribute('d', inkLoop(HP, { seed: sd + 2, t }) + ' ' + inkLoop([[x - 30 * s * fc, y + 50 * s], [x + 30 * s * fc, y + 50 * s], [x + 26 * s * fc, y + 115 * s], [x - 30 * s * fc, y + 115 * s]], { seed: sd + 3, t, smooth: false }) + ' ' + inkLoop([[x + R * 0.7 * fc, y - 20 * s]].concat(prof).concat([[x + R * 0.3 * fc, y + 60 * s]]), { seed: sd + 4, t }));
        let HR;
        if (kind === 'woman') HR = [[x - R * 1.05, y + 10 * s], [x - R * 1.1, y - R * 0.6], [x - R * 0.4, y - R * 1.45], [x + R * 0.5, y - R * 1.3], [x + R * 0.95 * fc, y - R * 0.5], [x - R * 0.1 * fc, y - R * 0.55]];
        else if (kind === 'man') HR = [[x - R * 1.0 * fc, y + 6 * s], [x - R * 1.02 * fc, y - R * 0.35], [x - R * 0.65 * fc, y - R * 0.7], [x - R * 0.55 * fc, y - R * 0.25]];
        else HR = [[x - R * 1.04 * fc, y + 4 * s], [x - R * 0.95 * fc, y - R * 0.6], [x - R * 0.2 * fc, y - R * 1.15], [x + R * 0.55 * fc, y - R * 0.95], [x + R * 0.75 * fc, y - R * 0.55], [x - R * 0.2 * fc, y - R * 0.72]];
        hair.setAttribute('d', inkLoop(HR, { seed: sd + 5, t }) + (kind === 'man' ? ' ' + inkLoop([[x + R * 0.2 * fc, y + 50 * s], [x + R * 0.85 * fc, y + 52 * s], [x + R * 0.6 * fc, y + 96 * s], [x + R * 0.1 * fc, y + 86 * s]], { seed: sd + 6, t }) : ''));
        l.setAttribute('d', P(SH2, 10, { closed: true }) + ' ' + P(HP, 11, { closed: true }) + ' ' + P(HR, 12, { closed: true, w: 3.5 }));
        face.setAttribute('d', inkDot(x + R * 0.55 * fc, y - 8 * s, 6 * s + 1, 6 * s + 1, sd + 20, t) + ' ' + P([[x + R * 0.35 * fc, y - 26 * s], [x + R * 0.75 * fc, y - 30 * s]], 21, { w: 3.5 }) +
          ' ' + (lit > 0.3 ? P([[x + R * 0.45 * fc, y + 34 * s], [x + R * 0.68 * fc, y + 42 * s], [x + R * 0.88 * fc, y + 32 * s]], 22, { w: 4 }) : P([[x + R * 0.5 * fc, y + 38 * s], [x + R * 0.85 * fc, y + 38 * s]], 22, { w: 3.5 })));
        glow.setAttribute('fill-opacity', f1(lit * 8) / 10);
        glow.setAttribute('d', lit > 0.02 ? inkCircle(x - R * 0.05 * fc, y - R * 0.25, R * (0.42 + 0.08 * Math.sin(t * 5 + sd)) * lit, sd + 30, t, { fill: true }) : '');
        return { mind: [x - R * 0.05 * fc, y - R * 0.25] };
      },
    };
  }
  SH.lg_minds = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, root = el(svg, 'g'), u = W / 1080;
      const st = window.TD && window.TD.stars ? window.TD.stars(el(root, 'g'), sd + 1, W, H, 40, 0.05, 0.45) : null;
      // [x, y (head centre), scale, face, kind]
      const PPL = P.people || [[0.22, 0.25, 0.55, 1, 'girl'], [0.72, 0.33, 0.7, -1, 'woman'], [0.27, 0.47, 0.85, 1, 'man'], [0.74, 0.6, 1.0, -1, 'girl'], [0.3, 0.8, 1.35, 1, 'boy']];
      const arcs = inkEl(root, INK.gold), spark = inkEl(root, INK.gold), sparkL = inkEl(root, mix(INK.gold, INK.red, 0.4));
      const B = PPL.map((q, i) => ({ q, b: bust(el(root, 'g'), sd + 100 + i * 40, q[4]) }));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, mi = atOr(cues, 'mind', dur * 0.35), step = Math.max(0.35, (dur - mi) * 0.8 / (PPL.length - 1));
          if (st) st.update(t * 2);
          const M = [];
          B.forEach((b, i) => { const lit = clamp01((lt - (mi + (i - 1) * step)) / 0.3) * (i === 0 ? clamp01((lt - mi + 0.6) / 0.3) : 1); const o = b.b.update(t, b.q[0] * W, b.q[1] * H, b.q[2] * u, b.q[3], lit); M.push(o.mind); });
          const AR = [], SP = [], SPL = [];
          for (let i = 0; i < M.length - 1; i++) {
            const t0 = mi + (i - 1) * step + 0.2, f = clamp01((lt - t0) / step), a = M[i], b = M[i + 1], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 120 * u];
            if (f <= 0) continue;
            const pts = []; for (let k = 0; k <= 20; k++) { const q = k / 20 * f; pts.push([lerp(lerp(a[0], c[0], q), lerp(c[0], b[0], q), q), lerp(lerp(a[1], c[1], q), lerp(c[1], b[1], q), q)]); }
            for (let k = 0; k < pts.length - 1; k += 2) AR.push(inkPath([pts[k], pts[k + 1]], { w: 6, seed: sd + 200 + i * 30 + k, t }));
            if (f < 1) { const hp = pts[pts.length - 1]; SP.push(inkCircle(hp[0], hp[1], 22 * u, sd + 300 + i, t, { fill: true })); for (let r = 0; r < 6; r++) { const an = r / 6 * TAU + t * 4; SPL.push(inkPath([[hp[0] + Math.cos(an) * 30 * u, hp[1] + Math.sin(an) * 30 * u], [hp[0] + Math.cos(an) * 50 * u, hp[1] + Math.sin(an) * 50 * u]], { w: 4, seed: sd + 320 + i * 6 + r, t })); } }
          }
          arcs.setAttribute('d', AR.join(' ')); spark.setAttribute('d', SP.join(' ')); sparkL.setAttribute('d', SPL.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
  // ------------------------------------------------------------------ SHOTS.lg_flag
  // the new country: Tanganyika's flag (green, gold-edged black band, green) waving on a tall pole in the school field,
  // a notice board with a tear-off calendar (leaves fly from cue "weeks"), three schoolgirls in front looking up.
  // P: {year: "1962", girls: [[x, scale]], labels}
  SH.lg_flag = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 911, root = el(svg, 'g'), u = W / 1080;
      const pole = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.3)), poleL = inkEl(root), knob = inkEl(root, INK.gold);
      const fG = inkEl(root, INK.green), fGd = inkEl(root, INK.gold), fK = inkEl(root, INK.ink), fL = inkEl(root), rope = inkEl(root, INK.inkSoft);
      const posts = inkEl(root, WOOD_D()), board = inkEl(root, WOOD()), boardL = inkEl(root);
      const cal = window.LH.calendar(el(root, 'g'), sd + 40);
      const grass = window.LH.front(el(root, 'g'), sd + 60, 'grass');
      const GS = (P.girls || [[0.2, 1.2], [0.52, 1.3], [0.84, 1.2]]).map((q, i) => ({ q, f: girl(el(root, 'g'), sd + 100 + i * 40, { tone: hn(sd, i) }) }));
      const rip = ripples(el(root, 'g'), sd + 300);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, wk = atOr(cues, 'weeks', dur * 0.5);
          const px = 0.2 * W, top = 0.27 * H, bot = 0.66 * H;
          pole.setAttribute('d', inkPath([[px, bot], [px, top]], { w: 18 * u, seed: sd + 1, t, taper: 0 }));
          poleL.setAttribute('d', inkPath([[px - 9 * u, bot], [px - 9 * u, top]], { w: 3, seed: sd + 2, t }) + ' ' + inkPath([[px + 9 * u, bot], [px + 9 * u, top]], { w: 3, seed: sd + 3, t }));
          knob.setAttribute('d', inkCircle(px, top - 16 * u, 18 * u, sd + 4, t, { fill: true }));
          rope.setAttribute('d', inkPath([[px + 14 * u, top + 10 * u], [px + 20 * u, bot - 40 * u]], { w: 3, seed: sd + 5, t }));
          // flag: 400 x 270, waving
          const fw = 330 * u, fh = 220 * u, fx = px + 9 * u, fy = top + 10 * u, N = 10;
          const wv = (x, ph) => Math.sin(t * 3 - x / fw * 5 + ph) * 16 * u * (x / fw);
          const band = (a, b) => { const T = [], B = []; for (let i = 0; i <= N; i++) { const x = i / N * fw; T.push([fx + x, fy + a * fh + wv(x, 0)]); B.push([fx + x, fy + b * fh + wv(x, 0)]); } return T.concat(B.reverse()); };
          fG.setAttribute('d', inkLoop(band(0, 1), { seed: sd + 10, t, smooth: false, amp: 0.8 }));
          fGd.setAttribute('d', inkLoop(band(0.36, 0.64), { seed: sd + 11, t, smooth: false, amp: 0.5 }));
          fK.setAttribute('d', inkLoop(band(0.41, 0.59), { seed: sd + 12, t, smooth: false, amp: 0.5 }));
          fL.setAttribute('d', inkPath(band(0, 1), { w: 5, seed: sd + 13, t, closed: true, smooth: false }));
          // notice board with the calendar
          const bx = 0.76 * W, bt = 0.23 * H, bb = 0.5 * H, bw = 200 * u;
          posts.setAttribute('d', inkPath([[bx - bw + 30 * u, bt], [bx - bw + 30 * u, 0.67 * H]], { w: 22 * u, seed: sd + 20, t, taper: 0 }) + ' ' + inkPath([[bx + bw - 30 * u, bt], [bx + bw - 30 * u, 0.67 * H]], { w: 22 * u, seed: sd + 21, t, taper: 0 }));
          const BQ = [[bx - bw, bt], [bx + bw, bt], [bx + bw, bb], [bx - bw, bb]];
          board.setAttribute('d', inkLoop(BQ, { seed: sd + 22, t, smooth: false }));
          boardL.setAttribute('d', inkPath(BQ, { w: 6, seed: sd + 23, t, closed: true, smooth: false }));
          cal.update(t, bx, (bt + bb) / 2 + 20 * u, 270 * u, 340 * u, P.year || '1962', lt > wk ? Math.min(1, (lt - wk) * 0.4) : 0);
          grass.update(t, W, H, 0.74 * H);
          const RP = [];
          GS.forEach((g, i) => { const o = g.f.update(t, g.q[0] * W, 1.04 * H, g.q[1] * u, { full: true, laugh: 0.35 + 0.15 * Math.sin(t + i), tears: false, look: (0.5 - g.q[0]) * 0.8 }); RP.push([o.hc[0], o.hc[1], o.R * 1.3, 0.6, 1 + i * 0.1]); });
          rip.update(t, RP);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
