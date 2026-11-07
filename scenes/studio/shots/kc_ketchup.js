// kc_ketchup: shots for the Stickstory Short "Ketchup Was Medicine" (2026-11-07): in 1834 the Ohio doctor John Cook
// Bennett claimed tomatoes could cure diarrhea and indigestion and published tomato ketchup recipes; from 1837 "tomato
// pills" (Archibald Miles' Compound Extract of Tomato, Guy Phelps' Compound Tomato Pills) filled the newspaper ads, the
// two sellers fought in print (Phelps: Miles had "about as much claim to the title of doctor as my horse"); the pills
// that were analysed held no tomato and were essentially laxatives. Parchment ink style (brand/kit/BRAND.md §3, §5):
// palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no
// Math.random. Parametric: any 19th-century patent-medicine / shop / street story. Uses lh__lib.js (LH.kasif, LH.label).
//
// Common: K = Kaşif {x, y (0..1 H, ground point), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = labels [{text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}]
//
// SHOTS.kc_shop — an apothecary: shelves of jars behind, a wooden counter in front (top at P.top, 0..1 H, default 0.585).
//   P: {mode: "hook"|"ask"|"end", bottle: {x, s, lines: [..], lines2: [..], content: "sauce"|"pills"}, tag: "MEDICINE",
//       kasif: K, labels}
//   "hook": a big bottle gleams on the counter, pills roll out of a tipped pillbox; red tag swings in at cue "hit"
//   "ask":  Kaşif behind the counter beside the bottle; at cue "flip" the label turns over to `lines2` (red)
//   "end":  Kaşif behind the counter, bottle + tomatoes beside him
// SHOTS.kc_hall — mode "lecture": a doctor in a frock coat at a lectern lifts a big tomato at cue "hit", chalk drawing
//   (tomato -> arrow -> stomach) appears on the blackboard, audience heads fill the frame bottom.
//   mode "lab": a chemist behind a table grinds in a mortar; a magnifier slides over a pill; at cue "hit" a red X is
//   drawn over the tomato and the chemist jumps back. P: {mode, labels}
// SHOTS.kc_kitchen — close on a kitchen table: a pot of bubbling red sauce with steam and a stirring spoon, tomatoes,
//   a recipe card whose title and lines are written by a quill (cue "write"). P: {title: ["TOMATO", "KETCHUP"], labels}
// SHOTS.kc_street — mode "ads": newspaper posters slap onto a wall one by one (from cue "box"), a newsboy waves a paper;
//   mode "feud": two sellers by a pill cart point at each other, the rival's horse neighs at cue "hit";
//   mode "run": a man clutching his belly runs into an outhouse, the door slams at cue "hit" and the shed shakes.
//   P: {mode, posters: [{lines, x, y, w, h, rot, big}], sign, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SERIF = 'Fraunces, Georgia, serif';
  const txt = (parent, a = {}) => el(parent, 'text', Object.assign({ 'text-anchor': 'middle' }, a));
  const TOM = () => INK.red, TOM_D = () => mix(INK.red, INK.ink, 0.3), TOM_L = () => mix(INK.red, INK.paperLight, 0.55);
  const LEAF = () => mix(INK.green, INK.ink, 0.15);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25), WOOD_D = () => mix(INK.stain, INK.ink, 0.35), WOOD_L = () => mix(INK.stain, INK.paperLight, 0.4);
  const GLASS = () => mix(INK.blue, INK.paperLight, 0.68);
  const COAT = () => mix(INK.ink, INK.blue, 0.3);
  const PILL = () => mix(INK.paperLight, INK.stain, 0.35);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const rectP = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const tf = (g, x, y, s, rot = 0) => g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${Math.round(s * 1000) / 1000})`);

  // ------------------------------------------------------------------ a tomato (world coords; y = centre)
  function tomato(parent, sd) {
    const body = inkEl(parent, TOM()), shade = inkEl(parent, TOM_D()), hl = inkEl(parent, TOM_L()), rim = inkEl(parent), leaf = inkEl(parent, LEAF()), leafR = inkEl(parent);
    return {
      update(t, list) {   // list: [[x, y, r, rot]]
        const B = [], S = [], Hl = [], R = [], Lf = [], LR = [];
        list.forEach(([x, y, r, rot = 0], i) => {
          const k = sd + i * 17, P = [];
          for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2 + rot, rr = r * (1 + 0.045 * Math.sin(a * 5 - rot * 5)); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.88]); }
          B.push(inkLoop(P, { seed: k, t, amp: 0.7 }));
          R.push(inkPath(P, { w: Math.max(3.5, r * 0.07), seed: k + 1, t, closed: true, amp: 0.7 }));
          S.push(inkLoop([[x + r * 0.15, y + r * 0.82], [x + r * 0.75, y + r * 0.42], [x + r * 0.92, y - r * 0.1], [x + r * 0.55, y + r * 0.35], [x - r * 0.1, y + r * 0.7]], { seed: k + 2, t, amp: 0.5 }));
          Hl.push(inkDot(x - r * 0.42, y - r * 0.3, r * 0.2, r * 0.12, k + 3, t));
          const cx = x, cy = y - r * 0.8;
          for (let q = 0; q < 5; q++) { const a = -Math.PI / 2 + (q - 2) * 0.62 + rot * 0.3, L = r * 0.48;
            const pts = [[cx, cy], [cx + Math.cos(a - 0.25) * L * 0.5, cy + Math.sin(a - 0.25) * L * 0.5 + r * 0.2], [cx + Math.cos(a) * L, cy + r * 0.22 + Math.sin(a) * L * 0.25], [cx + Math.cos(a + 0.25) * L * 0.5, cy + Math.sin(a + 0.25) * L * 0.5 + r * 0.2]];
            Lf.push(inkLoop(pts, { seed: k + 4 + q, t, amp: 0.5 })); }
          LR.push(inkPath([[cx, cy + r * 0.08], [cx + r * 0.06, cy - r * 0.22], [cx + r * 0.16, cy - r * 0.3]], { w: Math.max(4, r * 0.09), seed: k + 10, t }));
        });
        body.setAttribute('d', B.join(' ')); shade.setAttribute('d', S.join(' ')); hl.setAttribute('d', Hl.join(' '));
        rim.setAttribute('d', R.join(' ')); leaf.setAttribute('d', Lf.join(' ')); leafR.setAttribute('d', LR.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ pills (world coords)
  function pills(parent, sd) {
    const fill = inkEl(parent, PILL()), rim = inkEl(parent);
    return {
      update(t, list) {   // [[x, y, r, rot]]
        const F = [], R = [];
        list.forEach(([x, y, r, rot = 0], i) => {
          const P = inkEllipsePts(x, y, r, r * 0.78, sd + i, 10, rot, 0.06);
          F.push(inkLoop(P, { seed: sd + i, t, amp: 0.5 }));
          R.push(inkPath(P, { w: 3.5, seed: sd + 40 + i, t, closed: true, amp: 0.5 }), inkPath([[x - Math.cos(rot) * r * 0.6, y - Math.sin(rot) * r * 0.6], [x + Math.cos(rot) * r * 0.6, y + Math.sin(rot) * r * 0.6]], { w: 2.5, seed: sd + 80 + i, t, amp: 0.4 }));
        });
        fill.setAttribute('d', F.join(' ')); rim.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ an 1830s bottle with a paper label (local units, base y = 0)
  const BOT = [[-112, 0], [112, 0], [122, -24], [122, -300], [104, -342], [46, -372], [40, -458], [54, -470], [54, -490], [-54, -490], [-54, -470], [-40, -458], [-46, -372], [-104, -342], [-122, -300], [-122, -24]];
  function bottle(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const shadow = inkEl(g, INK.ink, { 'fill-opacity': 0.16 }), glass = inkEl(g, GLASS()), cont = inkEl(g, o.content === 'pills' ? mix(PILL(), INK.paperLight, 0.3) : TOM()), contD = inkEl(g, o.content === 'pills' ? PILL() : TOM_D());
    const pl = pills(g, sd + 300);
    const rim = inkEl(g), cork = inkEl(g, WOOD_L()), corkR = inkEl(g), gleam = inkEl(g, INK.paperLight), star = inkEl(g, INK.gold);
    const lab = el(g, 'g'), labF = inkEl(lab, INK.paperLight), labR = inkEl(lab), labT = el(lab, 'g');
    const mk = (n, col) => Array.from({ length: n }, () => txt(labT, { 'font-family': SERIF, 'font-weight': 900, fill: col }));
    const T1 = mk(3, INK.ink), T2 = mk(3, INK.red);
    const setLines = (E, lines, big) => E.forEach((e, i) => {
      const s = lines[i] || ''; e.textContent = s;
      const n = Math.max(1, s.length), size = Math.min(big ? 62 : 50, 214 / (n * 0.8));
      e.setAttribute('font-size', f1(size)); e.setAttribute('x', 0);
      const tot = lines.length, y0 = -190 - (tot - 1) * 26;
      e.setAttribute('y', f1(y0 + i * 54 + size * 0.35));
    });
    setLines(T1, o.lines || ['TOMATO', 'KETCHUP'], (o.lines || []).length === 1);
    setLines(T2, o.lines2 || [], (o.lines2 || []).length === 1);
    return {
      g,
      update(t, x, y, s, op = {}) {
        tf(g, x, y, s, op.rot || 0);
        const k = sd;
        shadow.setAttribute('d', inkLoop(inkEllipsePts(10, 4, 150, 18, k, 12, 0, 0.05), { seed: k, t, amp: 0.5 }));
        glass.setAttribute('d', inkLoop(BOT, { seed: k + 1, t, amp: 0.8 }));
        if (o.content === 'pills') {
          cont.setAttribute('d', inkLoop(rectP(-104, -14, 104, -322), { seed: k + 2, t, amp: 0.8 }));
          contD.setAttribute('d', '');
          const L = []; for (let i = 0; i < 54; i++) { const row = Math.floor(i / 6), col = i % 6; L.push([-86 + col * 34 + (row % 2) * 16, -28 - row * 30 + Math.sin(t * 9 + i) * (op.shake || 0) * 6, 18, i]); }
          pl.update(t, L);
        } else {
          const lvl = -318 + Math.sin(t * 1.6) * 6, W2 = [];
          for (let xx = -106; xx <= 106; xx += 26) W2.push([xx, lvl + Math.sin(xx * 0.05 + t * 2.2) * 5]);
          cont.setAttribute('d', inkLoop(W2.concat([[106, -16], [-106, -16]]), { seed: k + 2, t, amp: 0.6 }));
          contD.setAttribute('d', inkLoop([[50, -30], [100, -30], [102, -290], [70, -300]], { seed: k + 3, t, amp: 0.5 }));
          pl.update(t, []);
        }
        rim.setAttribute('d', inkPath(BOT, { w: 6, seed: k + 4, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[-46, -376], [46, -376]], { w: 4, seed: k + 5, t }));
        const C = [[-46, -486], [46, -486], [40, -566], [-40, -566]];
        cork.setAttribute('d', inkLoop(C, { seed: k + 6, t, amp: 0.5, smooth: false }));
        corkR.setAttribute('d', inkPath(C, { w: 5, seed: k + 7, t, closed: true, smooth: false }) + ' ' + inkPath([[-30, -520], [-10, -526]], { w: 3, seed: k + 8, t }) + ' ' + inkPath([[8, -548], [28, -544]], { w: 3, seed: k + 9, t }));
        // gleam: a fixed highlight + a sweeping shine
        const sw = op.gleam != null ? op.gleam : -1, G = [inkPath([[-96, -60], [-98, -290]], { w: 9, seed: k + 10, t, taper: 0.6 })];
        if (sw >= 0 && sw <= 1) { const gx = lerp(-130, 130, sw); G.push(inkPath([[gx - 30, -20], [gx + 30, -320]], { w: 18, seed: k + 11, t, taper: 0.8 })); }
        gleam.setAttribute('d', G.join(' '));
        // sparkle star
        if (op.star) { const a = op.star, r = 60 * a, cx = 108, cy = -420, S = [];
          for (let q = 0; q < 4; q++) { const an = q * Math.PI / 2 + t; S.push(inkLoop([[cx, cy], [cx + Math.cos(an - 0.2) * r * 0.25, cy + Math.sin(an - 0.2) * r * 0.25], [cx + Math.cos(an) * r, cy + Math.sin(an) * r], [cx + Math.cos(an + 0.2) * r * 0.25, cy + Math.sin(an + 0.2) * r * 0.25]], { seed: k + 12 + q, t, amp: 0.4, smooth: false })); }
          star.setAttribute('d', S.join(' ')); } else star.setAttribute('d', '');
        // label (flips about its centre line: |cos| squash, back side shows lines2)
        const fl = clamp01(op.flip || 0), fy = Math.max(0.02, Math.abs(Math.cos(fl * Math.PI))), back = fl > 0.5;
        lab.setAttribute('transform', `translate(0 -192) scale(1 ${Math.round(fy * 1000) / 1000}) translate(0 192)`);
        const LP = [[-114, -276], [114, -280], [116, -104], [-116, -100]];
        labF.setAttribute('d', inkLoop(LP, { seed: k + 20, t, amp: 0.6, smooth: false }));
        labR.setAttribute('d', inkPath(LP, { w: 4.5, seed: k + 21, t, closed: true, smooth: false }) + ' ' + inkPath([[-90, -262], [90, -265]], { w: 2.5, seed: k + 22, t }) + ' ' + inkPath([[-90, -118], [90, -116]], { w: 2.5, seed: k + 23, t }));
        T1.forEach(e => e.style.display = back ? 'none' : '');
        T2.forEach(e => e.style.display = back ? '' : 'none');
      },
    };
  }

  // ------------------------------------------------------------------ apothecary shelves with jars (mid plane)
  function shelves(parent, sd) {
    const cols = [INK.blue, INK.green, INK.gold, INK.red, INK.paperLight].map(c => mix(c, INK.paperLight, 0.45));
    const planks = inkEl(parent, WOOD()), plankR = inkEl(parent), jars = cols.map(c => inkEl(parent, c)), lids = inkEl(parent, WOOD_D()), labs = inkEl(parent, INK.paperLight), rim = inkEl(parent), shine = inkEl(parent, INK.paperLight);
    return {
      update(t, W, H, o = {}) {
        const u = W / 1080, rows = o.rows || [0.25, 0.41, 0.56], x0 = (o.x0 ?? -0.02) * W, x1 = (o.x1 ?? 1.02) * W;
        const P = [], PR = [], J = cols.map(() => []), LD = [], LB = [], R = [], SH2 = [];
        rows.forEach((q, ri) => {
          const y = q * H, th = 26 * u;
          const pk = rectP(x0, y, x1, y + th); P.push(inkLoop(pk, { seed: sd + ri, t, amp: 0.6, smooth: false })); PR.push(inkPath(pk, { w: 5, seed: sd + 10 + ri, t, closed: true, smooth: false }));
          [0.12, 0.88].forEach((bq, bi) => PR.push(inkPath([[bq * W, y + th], [bq * W, y + th + 46 * u], [bq * W + (bi ? -40 : 40) * u, y + th]], { w: 4, seed: sd + 20 + ri * 2 + bi, t })));
          let x = x0 + (20 + 30 * hn(sd, ri)) * u, j = 0;
          while (x < x1 - 60 * u) {
            const w = (70 + 46 * hn(sd + 1, ri * 20 + j)) * u, h = (110 + 70 * hn(sd + 2, ri * 20 + j)) * u, ci = Math.floor(hn(sd + 3, ri * 20 + j) * cols.length) % cols.length;
            const cx = x + w / 2, kk = sd + 100 + ri * 40 + j;
            const jar = [[cx - w / 2, y], [cx + w / 2, y], [cx + w / 2, y - h * 0.8], [cx + w * 0.32, y - h * 0.92], [cx - w * 0.32, y - h * 0.92], [cx - w / 2, y - h * 0.8]];
            J[ci].push(inkLoop(jar, { seed: kk, t, amp: 0.6 })); R.push(inkPath(jar, { w: 4, seed: kk + 1, t, closed: true, amp: 0.6 }));
            const lid = rectP(cx - w * 0.36, y - h * 0.92, cx + w * 0.36, y - h); LD.push(inkLoop(lid, { seed: kk + 2, t, amp: 0.4, smooth: false })); R.push(inkPath(lid, { w: 3.5, seed: kk + 3, t, closed: true, smooth: false }));
            const lb = rectP(cx - w * 0.34, y - h * 0.62, cx + w * 0.34, y - h * 0.3); LB.push(inkLoop(lb, { seed: kk + 4, t, amp: 0.4, smooth: false })); R.push(inkPath([[cx - w * 0.22, y - h * 0.46], [cx + w * 0.22, y - h * 0.46]], { w: 2.5, seed: kk + 5, t }));
            const ph = (t * 0.45 + hn(sd + 4, ri * 20 + j)) % 1; if (ph < 0.18) SH2.push(inkPath([[cx - w * 0.36, y - h * 0.18], [cx - w * 0.3, y - h * 0.74]], { w: 6, seed: kk + 6, t, taper: 0.5 }));
            x += w + (14 + 30 * hn(sd + 5, ri * 20 + j)) * u; j++;
          }
        });
        planks.setAttribute('d', P.join(' ')); plankR.setAttribute('d', PR.join(' '));
        jars.forEach((e, i) => e.setAttribute('d', J[i].join(' ')));
        lids.setAttribute('d', LD.join(' ')); labs.setAttribute('d', LB.join(' ')); rim.setAttribute('d', R.join(' ')); shine.setAttribute('d', SH2.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a wooden counter / table front down to the frame bottom
  function counter(parent, sd) {
    const top = inkEl(parent, WOOD_L()), front = inkEl(parent, WOOD()), panel = inkEl(parent, mix(WOOD(), INK.paperLight, 0.15)), lines = inkEl(parent), grain = inkEl(parent, WOOD_D()), knobs = inkEl(parent, INK.gold);
    return {
      update(t, W, H, y, o = {}) {
        const u = W / 1080, th = 46 * u, x0 = -60, x1 = W + 60;
        const TP = [[x0, y], [x1, y], [x1, y + th], [x0, y + th]];
        top.setAttribute('d', inkLoop(TP, { seed: sd, t, amp: 0.6, smooth: false }));
        front.setAttribute('d', inkLoop([[x0, y + th], [x1, y + th], [x1, H + 60], [x0, H + 60]], { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const n = o.panels ?? 3, PN = [], L = [inkPath(TP, { w: 6, seed: sd + 2, t, closed: true, smooth: false }), inkPath([[x0, y + th + 18 * u], [x1, y + th + 18 * u]], { w: 3.5, seed: sd + 3, t })], K = [];
        for (let i = 0; i < n; i++) {
          const a = lerp(30 * u, W - 30 * u, i / n) + 20 * u, b = lerp(30 * u, W - 30 * u, (i + 1) / n) - 20 * u, p = rectP(a, y + th + 60 * u, b, H - 120 * u);
          PN.push(inkLoop(p, { seed: sd + 10 + i, t, amp: 0.6, smooth: false })); L.push(inkPath(p, { w: 4.5, seed: sd + 20 + i, t, closed: true, smooth: false }));
          const q = rectP(a + 26 * u, y + th + 86 * u, b - 26 * u, H - 146 * u); L.push(inkPath(q, { w: 2.5, seed: sd + 30 + i, t, closed: true, smooth: false }));
          if (o.knobs !== false) K.push(inkCircle((a + b) / 2, y + th + 34 * u, 10 * u, sd + 40 + i, t, { fill: true }));
        }
        panel.setAttribute('d', PN.join(' ')); lines.setAttribute('d', L.join(' ')); knobs.setAttribute('d', K.join(' '));
        const G = []; for (let i = 0; i < 6; i++) { const yy = y + 10 * u + i * 6 * u; G.push(inkPath([[(0.05 + 0.15 * i) * W, yy], [(0.18 + 0.15 * i) * W, yy + 2]], { w: 2, seed: sd + 50 + i, t })); }
        grain.setAttribute('d', G.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a hatless 1830s man in a frock coat (stick rig + coat)
  function man(parent, sd, o = {}) {
    const g = el(parent, 'g'), sc = o.scale ?? 1;
    const coat = inkEl(g, o.col || COAT()), coatR = inkEl(g), crav = inkEl(g, o.apron ? INK.paperLight : INK.paperLight);
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: null, beard: o.beard ?? null, seed: sd });
    return {
      g,
      update(t, pose, op) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, Wp = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.7), lerp(hip[1], hd[1], 0.7)];
        if (o.coat !== false) {
          const V = o.apron
            ? [[sh[0] - 30 * sc, sh[1] + 20 * sc], [sh[0] + 30 * sc, sh[1] + 20 * sc], [hip[0] + 48 * sc, hip[1] + 90 * sc], [hip[0] - 48 * sc, hip[1] + 90 * sc]]
            : [[sh[0] - 36 * sc, sh[1] - 6 * sc], [sh[0] + 36 * sc, sh[1] - 6 * sc], [hip[0] + 44 * sc, hip[1] + 20 * sc], [hip[0] + 30 * sc - f * 26 * sc, hip[1] + 120 * sc], [hip[0] - 50 * sc, hip[1] + 110 * sc], [hip[0] - 42 * sc, hip[1] + 18 * sc]];
          coat.setAttribute('d', inkLoop(V, { seed: sd + 1, t, amp: 0.7 }));
          coatR.setAttribute('d', inkPath(V, { w: 4, seed: sd + 2, t, closed: true }) + (o.apron ? '' : ' ' + inkPath([[sh[0] - 14 * sc, sh[1]], [lerp(sh[0], hip[0], 0.55), lerp(sh[1], hip[1], 0.55)], [sh[0] + 14 * sc, sh[1]]], { w: 3.5, seed: sd + 3, t })));
          crav.setAttribute('d', o.apron ? '' : inkLoop([[sh[0] - 14 * sc, sh[1] - 4 * sc], [sh[0] + 14 * sc, sh[1] - 4 * sc], [sh[0], sh[1] + 30 * sc]], { seed: sd + 4, t, amp: 0.5 }));
        }
        if (op.belly) {
          const ch = rig.node.children, n = ch.length, [aL, aR, hL, hR] = [ch[n - 5], ch[n - 4], ch[n - 3], ch[n - 2]];
          const dx = r.head[0] - r.hip[0], dy = r.head[1] - r.hip[1], dl = Math.hypot(dx, dy) || 1, uu = [dx / dl, dy / dl];
          const sho = [r.hip[0] + uu[0] * 112, r.hip[1] + uu[1] * 112], bel = [r.hip[0] + uu[0] * 42 + 34, r.hip[1] + uu[1] * 42];
          const wob = Math.sin(t * 9) * 4, eL = [sho[0] - 34, sho[1] + 64], eR = [sho[0] + 52, sho[1] + 58];
          const wL = [bel[0] + 2, bel[1] - 14 + wob], wR = [bel[0] + 26, bel[1] + 10 - wob];
          aL.setAttribute('d', inkPath([sho, eL, wL], { w: 7, seed: sd * 100 + 6, t, amp: 1.7 }));
          aR.setAttribute('d', inkPath([sho, eR, wR], { w: 7, seed: sd * 100 + 7, t, amp: 1.7 }));
          hL.setAttribute('d', inkDot(wL[0], wL[1], 10.5, 10, sd * 100 + 8, t));
          hR.setAttribute('d', inkDot(wR[0], wR[1], 10.5, 10, sd * 100 + 9, t));
        }
        r.Wp = Wp; r.hipW = hip; r.headW = hd; r.handsW = r.hands.map(Wp);
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ a horse, side view (local units, ground 0, nose at -x)
  function horse(parent, sd) {
    const g = el(parent, 'g'), body = inkEl(g, mix(INK.stain, INK.paperLight, 0.25)), legs = inkEl(g), legsI = inkEl(g, mix(INK.stain, INK.paperLight, 0.25)), mane = inkEl(g, INK.ink), head = el(g, 'g'), headF = inkEl(head, mix(INK.stain, INK.paperLight, 0.25)), headR = inkEl(head), maneH = inkEl(head, INK.ink), hooves = inkEl(g, INK.ink), rim = inkEl(g), tail = inkEl(g, INK.ink);
    return {
      g,
      update(t, x, y, s, op = {}) {
        const fc = op.face ?? -1;
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${Math.round(-fc * s * 1000) / 1000} ${Math.round(s * 1000) / 1000})`);
        const k = sd, br = Math.sin(t * 2.1) * 4, ne = op.neigh || 0;
        const BP = inkEllipsePts(0, -300 + br, 210, 88, k, 16, 0, 0.04);
        body.setAttribute('d', inkLoop(BP, { seed: k, t, amp: 0.7 }));
        const neck = [[-150, -350], [-210, -470 - ne * 30], [-250, -460 - ne * 40], [-200, -300]];
        const LG = [[-150, -240, -160], [-110, -240, -96], [130, -250, 140], [170, -250, 182]].map(([a, b, c], i) => { const sw = (i % 2 ? 1 : -1) * Math.sin(t * 1.2) * 4; return [[a, b], [(a + c) / 2 + sw, -120], [c, -10]]; });
        legs.setAttribute('d', LG.map((L, i) => inkPath(L, { w: 34, seed: k + 10 + i, t, taper: 0 })).join(' '));
        legsI.setAttribute('d', LG.map((L, i) => inkPath(L, { w: 22, seed: k + 20 + i, t, taper: 0, amp: 0.5 })).join(' '));
        hooves.setAttribute('d', LG.map((L, i) => inkDot(L[2][0], L[2][1], 22, 12, k + 30 + i, t)).join(' '));
        // head on the neck, tilting up while neighing
        const hx = -240, hy = -470 - ne * 40, a = -ne * 34;
        head.setAttribute('transform', `translate(${hx} ${hy}) rotate(${f1(a)})`);
        const HP = [[20, -30], [-10, -46], [-80, -30], [-150, 10], [-160, 40], [-140, 58], [-90, 50 + ne * 10], [-30, 40], [20, 30]];
        headF.setAttribute('d', inkLoop(HP, { seed: k + 40, t, amp: 0.6 }));
        headR.setAttribute('d', inkPath(HP, { w: 6, seed: k + 41, t, closed: true, amp: 0.6 }) + ' ' + inkDot(-60, -16, 7, 7, k + 42, t) + ' ' + inkPath([[-14, -40], [-4, -86], [12, -44]], { w: 5, seed: k + 43, t, closed: true }) +
          ' ' + inkPath([[-150, 40 + ne * 6], [-104, 40 + ne * 14]], { w: 4, seed: k + 44, t }) + ' ' + inkDot(-140, 18, 6, 4, k + 45, t));
        maneH.setAttribute('d', inkLoop([[22, -36], [0, -60], [-30, -50], [-6, -30]], { seed: k + 46, t, amp: 0.5 }));
        const BN = inkLoop(neck, { seed: k + 50, t, amp: 0.6 });
        body.setAttribute('d', body.getAttribute('d') + ' ' + BN);
        rim.setAttribute('d', inkPath(BP, { w: 6, seed: k + 51, t, closed: true, amp: 0.7 }) + ' ' + inkPath(neck, { w: 6, seed: k + 52, t, closed: true, amp: 0.6 }));
        const M = []; for (let i = 0; i < 6; i++) { const q = i / 5, mx = lerp(-165, -235, q), my = lerp(-370, -470 - ne * 30, q), sw = Math.sin(t * 3 + i) * 8; M.push(inkLoop([[mx, my], [mx + 34 + sw, my + 30], [mx + 40 + sw, my + 4]], { seed: k + 60 + i, t, amp: 0.4 })); }
        mane.setAttribute('d', M.join(' '));
        const sw = Math.sin(t * 2.6) * 30;
        tail.setAttribute('d', inkLoop([[200, -340], [250, -300], [262 + sw * 0.5, -200], [250 + sw, -120], [230 + sw, -130], [228, -250], [190, -310]], { seed: k + 70, t, amp: 0.6 }));
        return { nose: [x - fc * (-150 * Math.cos(a * Math.PI / 180) + hx) * s, y + (hy - 150 * Math.sin(a * Math.PI / 180) + 40) * s], top: [x - fc * hx * s, y + (hy - 90) * s] };
      },
    };
  }

  // ------------------------------------------------------------------ a pill seller's hand cart (local units, ground 0)
  function cart(parent, sd) {
    const g = el(parent, 'g'), box = inkEl(g, WOOD()), boxR = inkEl(g), wheel = inkEl(g, WOOD_L()), wheelR = inkEl(g), bots = inkEl(g, TOM()), botR = inkEl(g), cork = inkEl(g, WOOD_L()), sign = inkEl(g, INK.paperLight), signR = inkEl(g);
    const tom = tomato(g, sd + 50);
    return {
      g,
      update(t, x, y, s) {
        tf(g, x, y, s);
        const k = sd, B = rectP(-190, -330, 190, -140);
        box.setAttribute('d', inkLoop(B, { seed: k, t, amp: 0.6, smooth: false }));
        boxR.setAttribute('d', inkPath(B, { w: 6, seed: k + 1, t, closed: true, smooth: false }) + ' ' + inkPath([[-190, -270], [190, -270]], { w: 3.5, seed: k + 2, t }) + ' ' + inkPath([[190, -200], [300, -150]], { w: 9, seed: k + 3, t }) + ' ' + inkPath([[-150, -140], [-160, -10]], { w: 9, seed: k + 4, t }) +
          ' ' + inkPath([[-170, -560], [-170, -330]], { w: 8, seed: k + 5, t }) + ' ' + inkPath([[170, -560], [170, -330]], { w: 8, seed: k + 6, t }));
        wheel.setAttribute('d', inkCircle(80, -96, 92, k + 7, t, { fill: true }));
        const sp = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; sp.push(inkPath([[80 + Math.cos(a) * 88, -96 + Math.sin(a) * 88], [80 - Math.cos(a) * 88, -96 - Math.sin(a) * 88]], { w: 4, seed: k + 8 + i, t })); }
        wheelR.setAttribute('d', inkCircle(80, -96, 92, k + 15, t, { w: 6 }) + ' ' + sp.join(' ') + ' ' + inkCircle(80, -96, 16, k + 16, t, { w: 5 }));
        const BB = [], BR = [], CK = [];
        [-120, -60, 0, 60, 120].forEach((bx, i) => { const h = 110 + (i % 2) * 18, P = [[bx - 24, -330], [bx + 24, -330], [bx + 24, -330 - h * 0.7], [bx + 9, -330 - h * 0.85], [bx + 9, -330 - h], [bx - 9, -330 - h], [bx - 9, -330 - h * 0.85], [bx - 24, -330 - h * 0.7]];
          BB.push(inkLoop(P, { seed: k + 20 + i, t, amp: 0.5, smooth: false })); BR.push(inkPath(P, { w: 4, seed: k + 30 + i, t, closed: true, smooth: false })); CK.push(inkLoop(rectP(bx - 10, -330 - h - 22, bx + 10, -330 - h), { seed: k + 40 + i, t, amp: 0.4, smooth: false })); });
        bots.setAttribute('d', BB.join(' ')); botR.setAttribute('d', BR.join(' ')); cork.setAttribute('d', CK.join(' '));
        const S = [[-200, -700], [200, -704], [204, -560], [-202, -556]];
        sign.setAttribute('d', inkLoop(S, { seed: k + 50, t, amp: 0.6, smooth: false })); signR.setAttribute('d', inkPath(S, { w: 6, seed: k + 51, t, closed: true, smooth: false }));
        // a painted tomato on the sign (world coords via the group transform: local units)
        tom.update(t, [[0, -626, 52, 0.2]]);
      },
    };
  }

  // ------------------------------------------------------------------ an outhouse (local units, ground 0, front face)
  function outhouse(parent, sd) {
    const g = el(parent, 'g'), wallF = inkEl(g, WOOD_L()), dark = inkEl(g, INK.ink), door = inkEl(g, WOOD()), rim = inkEl(g), roof = inkEl(g, WOOD_D()), moon = inkEl(g, INK.ink);
    return {
      g,
      update(t, x, y, s, op = {}) {
        const sh = (op.shake || 0) * Math.sin(t * 46) * 8;
        tf(g, x + sh * s, y, s, (op.shake || 0) * Math.sin(t * 31) * 1.5);
        const k = sd, F = rectP(-150, -560, 150, 0);
        wallF.setAttribute('d', inkLoop(F, { seed: k, t, amp: 0.6, smooth: false }));
        const RF = [[-200, -540], [0, -680], [200, -540], [180, -520], [0, -640], [-180, -520]];
        roof.setAttribute('d', inkLoop(RF, { seed: k + 1, t, amp: 0.6, smooth: false }));
        const DR = rectP(-110, -470, 110, 0), op1 = clamp01(op.open || 0), dw = 220 * Math.cos(op1 * Math.PI * 0.45);
        dark.setAttribute('d', op1 > 0.02 ? inkLoop(DR, { seed: k + 2, t, amp: 0.4, smooth: false }) : '');
        const DP = [[-110, -470], [-110 + dw, -470 - op1 * 30], [-110 + dw, 0 + op1 * 24], [-110, 0]];
        door.setAttribute('d', inkLoop(DP, { seed: k + 3, t, amp: 0.4, smooth: false }));
        const L = [inkPath(F, { w: 6, seed: k + 4, t, closed: true, smooth: false }), inkPath(RF, { w: 6, seed: k + 5, t, closed: true, smooth: false }), inkPath(DP, { w: 5, seed: k + 6, t, closed: true, smooth: false })];
        for (let i = 1; i < 4; i++) L.push(inkPath([[-150 + i * 0 - 150 + 75 * i + 150, -556], [-150 + 75 * i, -4]], { w: 3, seed: k + 10 + i, t }));
        L.push(inkDot(-110 + dw - 24, -230, 10, 10, k + 20, t));
        rim.setAttribute('d', L.join(' '));
        // crescent moon on the door
        const mx = -110 + dw * 0.5, my = -380, r = 38 * Math.max(0.05, dw / 220);
        moon.setAttribute('d', inkLoop([[mx - r * 0.2, my - 40], [mx + r * 0.6, my - 20], [mx + r * 0.7, my + 10], [mx + r * 0.2, my + 40], [mx + r * 0.05, my + 20], [mx + r * 0.25, my], [mx + r * 0.05, my - 22]], { seed: k + 21, t, amp: 0.4 }));
      },
    };
  }

  // ------------------------------------------------------------------ foregrounds: cobbles / yard (fence + grass) / audience heads
  function cobbles(parent, sd) {
    const curb = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.25)), road = inkEl(parent, mix(INK.paperDark, INK.stain, 0.35)), stones = inkEl(parent, mix(INK.paperDark, INK.stain, 0.15)), rim = inkEl(parent), papers = inkEl(parent, INK.paperLight), papR = inkEl(parent);
    return {
      update(t, W, H, top) {
        const u = W / 1080, C = rectP(-60, top, W + 60, top + 44 * u);
        curb.setAttribute('d', inkLoop(C, { seed: sd, t, amp: 0.6, smooth: false }));
        road.setAttribute('d', inkLoop(rectP(-60, top + 44 * u, W + 60, H + 60), { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const S = [], R = [inkPath([[-60, top], [W + 60, top]], { w: 6, seed: sd + 2, t }), inkPath([[-60, top + 44 * u], [W + 60, top + 44 * u]], { w: 4, seed: sd + 3, t })];
        let y = top + 70 * u, row = 0;
        while (y < H + 40) { const h = (34 + (y - top) * 0.08) * u, w = h * 2.1;
          for (let x = (row % 2) * w * 0.5 - w; x < W + w; x += w + 8 * u) { const P = inkEllipsePts(x, y, w * 0.46, h * 0.42, sd + row * 30 + Math.round(x), 8, 0, 0.12); S.push(inkLoop(P, { seed: sd + 10 + row, t, amp: 0.6 })); if ((row + Math.round(x / w)) % 2 === 0) R.push(inkPath(P.slice(0, 5), { w: 3, seed: sd + 50 + row, t })); }
          y += h + 6 * u; row++; }
        stones.setAttribute('d', S.join(' ')); rim.setAttribute('d', R.join(' '));
        const Pp = [], PR = [];
        [[0.14, 0.86], [0.8, 0.93]].forEach(([qx, qy], i) => { const x = qx * W + Math.sin(t * 0.9 + i) * 30 * u, y2 = qy * H, a = Math.sin(t * 1.3 + i) * 0.2 + i * 0.5;
          const P = [[-90, -60], [90, -60], [90, 60], [-90, 60]].map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * u, y2 + (px * Math.sin(a) + py * Math.cos(a)) * u]);
          Pp.push(inkLoop(P, { seed: sd + 90 + i, t, amp: 0.6, smooth: false })); PR.push(inkPath(P, { w: 4, seed: sd + 92 + i, t, closed: true, smooth: false }));
          for (let j = 0; j < 3; j++) PR.push(inkPath([lerpP(P[0], P[3], 0.3 + j * 0.2).map((v, m) => v + (m ? 0 : 20 * u)), lerpP(P[1], P[2], 0.3 + j * 0.2).map((v, m) => v - (m ? 0 : 20 * u))], { w: 2.5, seed: sd + 94 + i * 3 + j, t })); });
        papers.setAttribute('d', Pp.join(' ')); papR.setAttribute('d', PR.join(' '));
      },
    };
  }
  const lerpP = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  function yard(parent, sd) {
    const grassB = inkEl(parent, mix(INK.green, INK.paperLight, 0.45)), picket = inkEl(parent, INK.paperLight), rim = inkEl(parent), blades = inkEl(parent, mix(INK.green, INK.ink, 0.2));
    return {
      update(t, W, H, top) {
        const u = W / 1080, fb = top + 300 * u;
        grassB.setAttribute('d', inkLoop([[-60, top + 40 * u], [W + 60, top + 30 * u], [W + 60, H + 60], [-60, H + 60]], { seed: sd, t, amp: 0.6, smooth: false }));
        const P = [], R = [inkPath([[-60, top + 90 * u], [W + 60, top + 84 * u]], { w: 16 * u + 4, seed: sd + 1, t }), inkPath([[-60, top + 220 * u], [W + 60, top + 214 * u]], { w: 16 * u + 4, seed: sd + 2, t })];
        for (let i = 0; i < 10; i++) { const x = (i + 0.3) / 9.6 * W, w = 64 * u, pts = [[x - w / 2, fb], [x - w / 2, top + 20 * u], [x, top - 26 * u], [x + w / 2, top + 20 * u], [x + w / 2, fb]];
          P.push(inkLoop(pts, { seed: sd + 10 + i, t, amp: 0.5, smooth: false })); R.push(inkPath(pts, { w: 5, seed: sd + 30 + i, t, closed: true, smooth: false })); }
        picket.setAttribute('d', P.join(' ')); rim.setAttribute('d', R.join(' '));
        const B = []; for (let i = 0; i < 40; i++) { const x = (i + hn(sd, i)) / 40 * (W + 80) - 40, y = fb - 20 * u + hn(sd + 1, i) * (H - fb), L = (80 + 90 * hn(sd + 2, i)) * u, sw = Math.sin(t * 1.5 + i) * 10 * u;
          B.push(inkLoop([[x - 10 * u, y + 40 * u], [x + sw, y - L], [x + 10 * u, y + 40 * u]], { seed: sd + 50 + i, t, amp: 0.4 })); }
        blades.setAttribute('d', B.join(' '));
      },
    };
  }
  function audience(parent, sd) {
    const coats = inkEl(parent, COAT()), coatR = inkEl(parent), heads = inkEl(parent, mix(INK.paperDark, INK.stain, 0.25)), hair = inkEl(parent, INK.ink), rim = inkEl(parent);
    return {
      update(t, W, H, top) {
        const u = W / 1080, C = [], CR = [], Hd = [], Hr = [], R = [];
        const seats = [[0.1, 0], [0.36, 0.08], [0.64, 0.02], [0.9, 0.1], [0.23, 0.42], [0.52, 0.48], [0.8, 0.4]];
        seats.forEach(([qx, qy], i) => {
          const r = (qy > 0.3 ? 120 : 92) * u, x = qx * W + Math.sin(t * 0.8 + i * 1.7) * 8 * u, y = top + qy * 520 * u + r + Math.sin(t * 1.1 + i) * 5 * u, k = sd + i * 13;
          const S = [[x - r * 1.9, H + 60], [x - r * 1.7, y + r * 1.5], [x - r * 0.6, y + r * 0.9], [x + r * 0.6, y + r * 0.9], [x + r * 1.7, y + r * 1.5], [x + r * 1.9, H + 60]];
          C.push(inkLoop(S, { seed: k, t, amp: 0.6 })); CR.push(inkPath(S.slice(1, 5), { w: 5, seed: k + 1, t }));
          Hd.push(inkCircle(x, y, r, k + 2, t, { fill: true })); R.push(inkCircle(x, y, r, k + 3, t, { w: 5 }));
          Hr.push(inkLoop([[x - r * 1.0, y + r * 0.1], [x - r * 0.9, y - r * 0.6], [x - r * 0.3, y - r * 1.02], [x + r * 0.4, y - r * 0.98], [x + r * 0.95, y - r * 0.5], [x + r * 1.0, y + r * 0.2], [x + r * 0.6, y + r * 0.5], [x - r * 0.6, y + r * 0.5]], { seed: k + 4, t, amp: 0.6 }));
          R.push(inkCircle(x - r * 1.0, y + r * 0.15, r * 0.18, k + 5, t, { w: 4 }), inkCircle(x + r * 1.0, y + r * 0.15, r * 0.18, k + 6, t, { w: 4 }));
        });
        coats.setAttribute('d', C.join(' ')); coatR.setAttribute('d', CR.join(' ')); heads.setAttribute('d', Hd.join(' ')); hair.setAttribute('d', Hr.join(' ')); rim.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ lab bench front (slate, drawers with brass pulls) + wall shelf of flasks
  function labBench(parent, sd) {
    const top = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.35)), front = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.45)), drw = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.25)), lines = inkEl(parent), pulls = inkEl(parent, INK.gold);
    return {
      update(t, W, H, y) {
        const u = W / 1080, th = 40 * u, TP = rectP(-60, y, W + 60, y + th);
        top.setAttribute('d', inkLoop(TP, { seed: sd, t, amp: 0.6, smooth: false }));
        front.setAttribute('d', inkLoop(rectP(-60, y + th, W + 60, H + 60), { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const D = [], L = [inkPath(TP, { w: 6, seed: sd + 2, t, closed: true, smooth: false })], K = [];
        const rows = 3, cols = 3, y0 = y + th + 30 * u, rh = (H - 60 * u - y0) / rows;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const a = 30 * u + c * (W - 60 * u) / cols + 12 * u, b = 30 * u + (c + 1) * (W - 60 * u) / cols - 12 * u, q = rectP(a, y0 + r * rh + 10 * u, b, y0 + (r + 1) * rh - 10 * u), k = sd + 10 + r * 3 + c;
          D.push(inkLoop(q, { seed: k, t, amp: 0.5, smooth: false })); L.push(inkPath(q, { w: 4.5, seed: k + 20, t, closed: true, smooth: false }));
          const cx = (a + b) / 2, cy = y0 + (r + 0.5) * rh;
          K.push(inkLoop([[cx - 50 * u, cy - 12 * u], [cx + 50 * u, cy - 12 * u], [cx + 40 * u, cy + 14 * u], [cx - 40 * u, cy + 14 * u]], { seed: k + 40, t, amp: 0.4 }));
          L.push(inkPath([[cx - 50 * u, cy - 12 * u], [cx + 50 * u, cy - 12 * u], [cx + 40 * u, cy + 14 * u], [cx - 40 * u, cy + 14 * u]], { w: 3.5, seed: k + 60, t, closed: true }));
          L.push(inkPath([[cx - 34 * u, y0 + r * rh + 40 * u], [cx + 34 * u, y0 + r * rh + 40 * u]], { w: 2.5, seed: k + 80, t }));
        }
        drw.setAttribute('d', D.join(' ')); lines.setAttribute('d', L.join(' ')); pulls.setAttribute('d', K.join(' '));
      },
    };
  }
  function flaskShelf(parent, sd) {
    const plank = inkEl(parent, WOOD()), glass = inkEl(parent, GLASS()), liq = [INK.blue, INK.green, INK.gold, INK.red].map(c => inkEl(parent, mix(c, INK.paperLight, 0.25))), rim = inkEl(parent), bub = inkEl(parent);
    return {
      update(t, W, H, y, x0, x1) {
        const u = W / 1080, PK = rectP(x0, y, x1, y + 24 * u);
        plank.setAttribute('d', inkLoop(PK, { seed: sd, t, amp: 0.5, smooth: false }));
        const G = [], LQ = [[], [], [], []], R = [inkPath(PK, { w: 5, seed: sd + 1, t, closed: true, smooth: false }), inkPath([[x0 + 40 * u, y + 24 * u], [x0 + 40 * u, y + 70 * u], [x0 + 80 * u, y + 24 * u]], { w: 4, seed: sd + 2, t }), inkPath([[x1 - 40 * u, y + 24 * u], [x1 - 40 * u, y + 70 * u], [x1 - 80 * u, y + 24 * u]], { w: 4, seed: sd + 3, t })], B = [];
        const n = 5, step = (x1 - x0) / n;
        for (let i = 0; i < n; i++) {
          const cx = x0 + step * (i + 0.5), k = sd + 10 + i * 7, kind = i % 3;
          let body, lv;
          if (kind === 0) { body = [[cx - 70 * u, y], [cx + 70 * u, y], [cx + 18 * u, y - 120 * u], [cx + 18 * u, y - 200 * u], [cx - 18 * u, y - 200 * u], [cx - 18 * u, y - 120 * u]]; lv = [[cx - 62 * u, y - 4 * u], [cx + 62 * u, y - 4 * u], [cx + 34 * u, y - 70 * u], [cx - 34 * u, y - 70 * u]]; }
          else if (kind === 1) { const E = inkEllipsePts(cx, y - 70 * u, 70 * u, 70 * u, k, 14, 0, 0.02); body = E.concat([[cx - 18 * u, y - 136 * u], [cx - 18 * u, y - 210 * u], [cx + 18 * u, y - 210 * u], [cx + 18 * u, y - 136 * u]]); body = inkEllipsePts(cx, y - 70 * u, 70 * u, 70 * u, k, 14, 0, 0.02); lv = inkEllipsePts(cx, y - 44 * u, 60 * u, 40 * u, k + 1, 12, 0, 0.02); R.push(inkPath(rectP(cx - 18 * u, y - 210 * u, cx + 18 * u, y - 136 * u), { w: 5, seed: k + 2, t, closed: true, smooth: false })); }
          else { body = rectP(cx - 40 * u, y, cx + 40 * u, y - 230 * u); lv = rectP(cx - 34 * u, y - 4 * u, cx + 34 * u, y - 110 * u); }
          G.push(inkLoop(body, { seed: k + 3, t, amp: 0.5 })); LQ[i % 4].push(inkLoop(lv, { seed: k + 4, t, amp: 0.5 })); R.push(inkPath(body, { w: 5, seed: k + 5, t, closed: true }));
          const q = (t * 0.6 + i * 0.37) % 1; B.push(inkCircle(cx + Math.sin(t * 3 + i) * 10 * u, y - 40 * u - q * 120 * u, (5 + 5 * q) * u, k + 6, t, { w: 3 }));
        }
        glass.setAttribute('d', G.join(' ')); liq.forEach((e, i) => e.setAttribute('d', LQ[i].join(' '))); rim.setAttribute('d', R.join(' ')); bub.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.kc_shop
  SH.kc_shop = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 211, u = W / 1080, mode = P.mode || 'hook', top = (P.top ?? 0.585) * H;
      const root = el(svg, 'g');
      const sh = shelves(el(root, 'g'), sd + 10);
      const Bo = Object.assign({ x: mode === 'hook' ? 0.6 : mode === 'ask' ? 0.66 : 0.72, s: mode === 'hook' ? 1.12 : mode === 'ask' ? 1.0 : 0.85 }, P.bottle || {});
      const K = Object.assign({ x: 0.28, y: (top + 170 * u) / H, scale: 1.1, pose: 'idle', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), K, W, H, seed) : null;
      const bt = bottle(el(root, 'g'), sd + 40, Bo);
      const box = inkEl(root, mix(INK.blue, INK.paperLight, 0.3)), boxR = inkEl(root);
      const pl = pills(el(root, 'g'), sd + 70);
      const tom = tomato(el(root, 'g'), sd + 90);
      const tagG = el(root, 'g'), tagF = inkEl(tagG, INK.red), tagR = inkEl(tagG), tagS = inkEl(tagG), tagT = txt(tagG, { 'font-family': SERIF, 'font-weight': 900, 'font-size': 56, fill: INK.paperLight });
      tagT.textContent = String(P.tag || '').toLocaleUpperCase('en-US');
      const spn = inkEl(root, INK.paperLight), spnS = inkEl(root, TOM()), spnR = inkEl(root);
      const cn = counter(el(root, 'g'), sd + 120);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', mode === 'hook' ? 0.9 : dur * 0.5), flip = atOr(cues, 'flip', null);
          sh.update(t, W, H, { rows: [0.2, 0.37, 0.53] });
          if (kas) kas.update(lt, t, cues);
          const bx = Bo.x * W, pu = 1 + 0.07 * punch(lt, hit) + (mode === 'hook' ? 0.02 * Math.sin(t * 1.4) : 0);
          const fk = flip != null ? clamp01((lt - flip) / 0.45) : 0;
          bt.update(t, bx, top + 6 * u, Bo.s * u * pu * (mode === 'hook' ? lerp(0.9, 1, spring(lt, 0, 0.7)) : 1), { gleam: mode === 'hook' ? ((lt * 0.55) % 1.6) / 1.2 : ((lt * 0.4) % 2) / 1.4, star: lt > hit ? clamp01(1 - (lt - hit) / 1.4) * (0.8 + 0.2 * Math.sin(t * 9)) : 0, flip: fk, shake: flip != null && lt > flip ? 1 : 0, rot: flip != null && lt > flip ? Math.sin(t * 30) * 2 * clamp01(1 - (lt - flip) / 1.2) : 0 });
          // tipped pillbox + rolling pills (hook) / tomatoes (end, ask)
          if (mode === 'hook') {
            const px = 0.2 * W, py = top + 4 * u, B = [[px - 120 * u, py], [px + 40 * u, py], [px + 70 * u, py - 90 * u], [px - 90 * u, py - 100 * u]];
            box.setAttribute('d', inkLoop(B, { seed: sd + 1, t, amp: 0.5, smooth: false }));
            boxR.setAttribute('d', inkPath(B, { w: 5, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[px - 90 * u, py - 100 * u], [px - 150 * u, py - 170 * u], [px + 10 * u, py - 180 * u], [px + 70 * u, py - 90 * u]], { w: 5, seed: sd + 3, t }));
            const L = []; for (let i = 0; i < 9; i++) { const st = 0.15 + i * 0.22, p = clamp01((lt - st) / 1.8), e = 1 - Math.pow(1 - p, 2); if (lt < st) continue; const x = px + 60 * u + e * (120 + 70 * hn(sd + 4, i)) * u + (i % 3) * 30 * u; L.push([x, py - 18 * u, 18 * u, lt * 4 * (1 - p) + i]); }
            pl.update(t, L); tom.update(t, [[0.93 * W, top - 56 * u, 58 * u, 0.3]]);
            // a spoonful of red sauce lying in front of the bottle: the dose
            const sx = 0.8 * W, sy = top - 26 * u, wob = Math.sin(t * 2) * 2 * u, SB = inkEllipsePts(sx, sy, 62 * u, 30 * u, sd + 9, 14, -0.12, 0.03);
            spn.setAttribute('d', inkLoop(SB, { seed: sd + 9, t, amp: 0.5 }) + ' ' + inkPath([[sx - 56 * u, sy + 4 * u], [sx - 250 * u, sy + 20 * u]], { w: 16 * u, seed: sd + 10, t }));
            spnS.setAttribute('d', inkLoop(inkEllipsePts(sx + 4 * u, sy - 2 * u + wob, 46 * u, 18 * u, sd + 11, 12, -0.12, 0.05), { seed: sd + 11, t, amp: 0.5 }));
            spnR.setAttribute('d', inkPath(SB, { w: 5, seed: sd + 12, t, closed: true }) + ' ' + inkPath([[sx - 56 * u, sy + 4 * u], [sx - 250 * u, sy + 20 * u]], { w: 4, seed: sd + 13, t }));
          } else {
            blank(box, boxR, spn, spnS, spnR);
            const L = mode === 'ask' ? [[0.46 * W, top - 16 * u, 18 * u, 0.4], [0.5 * W, top - 14 * u, 18 * u, 1.2], [0.86 * W, top - 16 * u, 18 * u, 2]] : [];
            pl.update(t, L);
            tom.update(t, mode === 'end' ? [[0.52 * W, top - 58 * u, 62 * u, 0.2], [0.9 * W, top - 50 * u, 54 * u, 1.1]] : [[0.9 * W, top - 52 * u, 56 * u, 0.5]]);
          }
          // red tag swinging on a string from the bottle neck (hook)
          if (mode === 'hook' && P.tag && lt >= hit - 0.05) {
            const k = spring(lt, hit - 0.05, 0.7), sw = Math.sin(t * 2.4) * 6 * (1 - 0.5 * k);
            const nk = [bx + 50 * u * Bo.s, top - 440 * u * Bo.s];
            tagG.setAttribute('transform', `translate(${f1(nk[0])} ${f1(nk[1])}) rotate(${f1(-8 + sw + (1 - k) * 30)}) scale(${f1(k * 100) / 100})`);
            const TB = [[60, 40], [380, 30], [400, 120], [60, 130], [30, 86]];
            tagF.setAttribute('d', inkLoop(TB, { seed: sd + 5, t, amp: 0.6, smooth: false }));
            tagR.setAttribute('d', inkPath(TB, { w: 5, seed: sd + 6, t, closed: true, smooth: false }) + ' ' + inkCircle(58, 86, 10, sd + 7, t, { w: 4 }));
            tagS.setAttribute('d', inkPath([[0, 0], [30, 50], [50, 84]], { w: 4, seed: sd + 8, t }));
            tagT.setAttribute('x', 225); tagT.setAttribute('y', 104);
          } else tagG.setAttribute('transform', 'scale(0)');
          cn.update(t, W, H, top);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.kc_hall
  SH.kc_hall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 411, u = W / 1080, mode = P.mode || 'lecture', gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const board = inkEl(root, mix(INK.ink, INK.green, 0.35)), boardR = inkEl(root, mix(INK.stain, INK.ink, 0.3)), chalk = inkEl(root, INK.paperLight);
      const lect = inkEl(root, WOOD()), lectR = inkEl(root);
      const shelfG = el(root, 'g');
      const doc = man(el(root, 'g'), sd + 50, { scale: (mode === 'lab' ? 1.3 : 1.25) * u, beard: mode === 'lab' ? 'grey' : 'short', apron: mode === 'lab' });
      const tom = tomato(el(root, 'g'), sd + 80);
      const mort = inkEl(root, mix(INK.paperLight, INK.inkSoft, 0.25)), mortR = inkEl(root), pest = inkEl(root, WOOD_D());
      const fs = mode === 'lab' ? flaskShelf(shelfG, sd + 110) : null;
      const cn = mode === 'lab' ? labBench(el(root, 'g'), sd + 120) : null;
      const pl = pills(el(root, 'g'), sd + 140);
      const lens = inkEl(root, mix(INK.blue, INK.paperLight, 0.75)), lensR = inkEl(root), big = pills(el(root, 'g'), sd + 150), cross = inkEl(root, INK.red), tom2 = tomato(el(root, 'g'), sd + 160);
      const aud = mode === 'lecture' ? audience(el(root, 'g'), sd + 200) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5);
          if (mode === 'lecture') {
            // blackboard with a chalk tomato -> arrow -> stomach, drawn in from the cue "draw"
            const B = rectP(0.36 * W, 0.17 * H, 0.97 * W, 0.47 * H);
            board.setAttribute('d', inkLoop(B, { seed: sd, t, amp: 0.6, smooth: false }));
            boardR.setAttribute('d', inkPath(B, { w: 16, seed: sd + 1, t, closed: true, smooth: false }));
            const dk = clamp01((lt - atOr(cues, 'draw', 0.2)) / Math.max(0.8, dur * 0.6)), CH = [];
            const cx = 0.5 * W, cy = 0.32 * H;
            if (dk > 0) CH.push(inkPath(inkEllipsePts(cx, cy, 80 * u, 72 * u, sd + 2, 14, 0, 0.05).slice(0, 1 + Math.ceil(13 * clamp01(dk * 3))), { w: 7, seed: sd + 3, t }));
            if (dk > 0.33) CH.push(inkPath([[cx + 110 * u, cy], [lerp(cx + 110 * u, cx + 230 * u, clamp01((dk - 0.33) * 3)), cy]], { w: 7, seed: sd + 4, t }), dk > 0.6 ? inkPath([[cx + 200 * u, cy - 26 * u], [cx + 234 * u, cy], [cx + 200 * u, cy + 26 * u]], { w: 7, seed: sd + 5, t }) : '');
            if (dk > 0.6) { const S = [[0.76 * W, 0.255 * H], [0.84 * W, 0.25 * H], [0.89 * W, 0.29 * H], [0.88 * W, 0.35 * H], [0.82 * W, 0.385 * H], [0.75 * W, 0.375 * H], [0.73 * W, 0.42 * H], [0.7 * W, 0.415 * H], [0.715 * W, 0.36 * H], [0.79 * W, 0.335 * H], [0.8 * W, 0.3 * H], [0.765 * W, 0.28 * H]]; const n = Math.ceil(S.length * clamp01((dk - 0.6) * 2.8)); CH.push(inkPath(S.slice(0, Math.max(2, n)), { w: 7, seed: sd + 6, t, closed: n >= S.length })); }
            if (dk > 0.95) CH.push(inkPath([[0.92 * W, 0.2 * H], [0.92 * W, 0.24 * H]], { w: 8, seed: sd + 7, t }), inkPath([[0.9 * W, 0.22 * H], [0.94 * W, 0.22 * H]], { w: 8, seed: sd + 8, t }));
            chalk.setAttribute('d', CH.join(' '));
            // lectern + doctor
            const lx = 0.2 * W, L = [[lx - 130 * u, gy - 330 * u], [lx + 130 * u, gy - 330 * u], [lx + 100 * u, gy], [lx - 100 * u, gy]];
            const r = doc.update(t, lt < hit ? 'talk' : 'point', { x: lx + 175 * u, y: gy + 20 * u, face: 1, since: Math.max(0, lt - hit), dir: 70, emotion: lt < hit ? 'happy' : 'surprised', prev: lt >= hit && lt < hit + 0.3 ? { pose: 'talk', since: 1 } : undefined, mix: clamp01((lt - hit) / 0.3) });
            lect.setAttribute('d', inkLoop(L, { seed: sd + 10, t, amp: 0.6, smooth: false }) + ' ' + inkLoop([[lx - 150 * u, gy - 350 * u], [lx + 150 * u, gy - 350 * u], [lx + 140 * u, gy - 320 * u], [lx - 140 * u, gy - 320 * u]], { seed: sd + 11, t, amp: 0.5, smooth: false }));
            lectR.setAttribute('d', inkPath(L, { w: 6, seed: sd + 12, t, closed: true, smooth: false }) + ' ' + inkPath([[lx - 60 * u, gy - 230 * u], [lx + 60 * u, gy - 230 * u]], { w: 4, seed: sd + 13, t }));
            const hand = r.handsW.reduce((a, b) => (b[1] < a[1] ? b : a));
            const tr = (70 + 12 * punch(lt, hit)) * u * (lt < hit ? 0.9 : 1.2);
            tom.update(t, [[hand[0] + 6 * u, hand[1] - tr * 0.8, tr, 0.2]]);
            blank(mort, mortR, pest, lens, lensR, cross); pl.update(t, []); big.update(t, []); tom2.update(t, []);
            aud.update(t, W, H, gy + 120 * u);
          } else {
            blank(board, boardR, chalk, lect, lectR);
            const top = gy - 40 * u;
            const r = doc.update(t, lt < hit ? 'point' : 'shock', { x: 0.25 * W, y: top + 170 * u, face: 1, dir: -30, since: lt < hit ? 1 : lt - hit, emotion: lt < hit ? null : 'surprised' });
            void r;
            tom.update(t, []);
            fs.update(t, W, H, 0.3 * H, 0.42 * W, 1.0 * W);
            cn.update(t, W, H, top);
            // mortar + pestle grinding (left), pills, magnifier over a pill (centre), tomato (right) crossed at cue "hit"
            const mx = 0.38 * W, my = top + 2 * u, M = [[mx - 110 * u, my - 120 * u], [mx + 110 * u, my - 120 * u], [mx + 70 * u, my - 20 * u], [mx + 40 * u, my], [mx - 40 * u, my], [mx - 70 * u, my - 20 * u]];
            mort.setAttribute('d', inkLoop(M, { seed: sd + 20, t, amp: 0.6 }));
            mortR.setAttribute('d', inkPath(M, { w: 6, seed: sd + 21, t, closed: true }) + ' ' + inkPath([[mx - 108 * u, my - 120 * u], [mx + 108 * u, my - 120 * u]], { w: 8, seed: sd + 22, t }));
            const ga = Math.sin(t * 5) * 0.5, pt = [mx + Math.sin(ga) * 60 * u, my - 90 * u];
            pest.setAttribute('d', inkPath([pt, [pt[0] + 90 * u + Math.sin(ga) * 30 * u, pt[1] - 200 * u]], { w: 30 * u, seed: sd + 23, t, taper: 0.3 }));
            pl.update(t, [[0.08 * W, my - 18 * u, 20 * u, 0.3], [0.52 * W, my - 18 * u, 20 * u, 1.2], [0.88 * W, my - 18 * u, 20 * u, 2.2]]);
            const lx2 = lerp(0.5, 0.58, progIO(lt, 0, Math.max(0.6, hit - 0.2))) * W, ly = my - 230 * u, lr = 120 * u;
            lens.setAttribute('d', inkCircle(lx2, ly, lr, sd + 30, t, { fill: true }));
            lensR.setAttribute('d', inkCircle(lx2, ly, lr, sd + 31, t, { w: 12 }) + ' ' + inkPath([[lx2 + lr * 0.7, ly + lr * 0.7], [lx2 + lr * 1.5, ly + lr * 1.55]], { w: 26 * u, seed: sd + 32, t }) + ' ' + inkPath([[lx2 - lr * 0.6, ly - lr * 0.2], [lx2 - lr * 0.3, ly - lr * 0.6]], { w: 6, seed: sd + 33, t }));
            big.update(t, [[lx2, ly, 62 * u, 0.3 + Math.sin(t) * 0.1]]);
            const tx = 0.83 * W, ty = my - 120 * u, trr = 100 * u;
            tom2.update(t, [[tx, ty, trr * (1 + 0.06 * punch(lt, hit)), 0.2]]);
            const xk = clamp01((lt - hit) / 0.4), xk2 = clamp01((lt - hit - 0.25) / 0.4), X = [];
            if (xk > 0) X.push(inkPath([[tx - 150 * u, ty - 150 * u], lerpP([tx - 150 * u, ty - 150 * u], [tx + 150 * u, ty + 150 * u], xk)], { w: 26, seed: sd + 40, t }));
            if (xk2 > 0) X.push(inkPath([[tx + 150 * u, ty - 150 * u], lerpP([tx + 150 * u, ty - 150 * u], [tx - 150 * u, ty + 150 * u], xk2)], { w: 26, seed: sd + 41, t }));
            cross.setAttribute('d', X.join(' '));
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.kc_kitchen
  SH.kc_kitchen = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 611, u = W / 1080, top = (P.top ?? 0.5) * H, edge = (P.edge ?? 0.665) * H;
      const root = el(svg, 'g');
      const table = inkEl(root, WOOD_L()), tableR = inkEl(root, WOOD_D());
      const steam = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.35)), steamR = inkEl(root, INK.paperLight);
      const pot = inkEl(root, mix(INK.ink, INK.inkSoft, 0.4)), potR = inkEl(root), sauce = inkEl(root, TOM()), bub = inkEl(root, TOM_L()), bubR = inkEl(root, TOM_D()), spoon = inkEl(root, WOOD());
      const tom = tomato(el(root, 'g'), sd + 40);
      const cardG = el(root, 'g'), card = inkEl(cardG, INK.paperLight), cardR = inkEl(cardG), lines = inkEl(cardG, INK.inkSoft);
      const title = (P.title || ['TOMATO', 'KETCHUP']).map(s => { const e = txt(cardG, { 'font-family': INK_FONT, 'font-size': 76, fill: INK.red }); e.textContent = s; return e; });
      const quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const apron = inkEl(root, WOOD()), legs = inkEl(root, WOOD_D()), tLines = inkEl(root), knob = inkEl(root, INK.gold);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, wr = atOr(cues, 'write', 0.2), hit = atOr(cues, 'hit', dur * 0.5);
          // table top from `top` down (planks converge to the back)
          table.setAttribute('d', inkLoop([[-60, top], [W + 60, top], [W + 60, H + 60], [-60, H + 60]], { seed: sd, t, amp: 0.6, smooth: false }));
          const TL = [inkPath([[-60, top], [W + 60, top]], { w: 6, seed: sd + 1, t })];
          for (let i = -6; i <= 6; i++) TL.push(inkPath([[W / 2 + i * 90 * u, top], [W / 2 + i * 150 * u, edge]], { w: 3, seed: sd + 10 + i, t }));
          tableR.setAttribute('d', TL.join(' '));
          // pot (left)
          const px = 0.355 * W, py = top + 190 * u, pw = 160 * u, ph = 240 * u;
          const PB = [[px - pw, py - ph], [px + pw, py - ph], [px + pw * 0.92, py - 40 * u], [px + pw * 0.7, py], [px - pw * 0.7, py], [px - pw * 0.92, py - 40 * u]];
          pot.setAttribute('d', inkLoop(PB, { seed: sd + 20, t, amp: 0.6 }));
          const rimE = inkEllipsePts(px, py - ph, pw, 40 * u, sd + 21, 16, 0, 0.02);
          potR.setAttribute('d', inkPath(PB, { w: 6, seed: sd + 22, t, closed: true }) + ' ' + inkPath(rimE, { w: 7, seed: sd + 23, t, closed: true }) + ' ' + inkPath([[px - pw, py - ph + 60 * u], [px - pw - 60 * u, py - ph + 40 * u]], { w: 14, seed: sd + 24, t }) + ' ' + inkPath([[px + pw, py - ph + 60 * u], [px + pw + 60 * u, py - ph + 40 * u]], { w: 14, seed: sd + 25, t }));
          sauce.setAttribute('d', inkLoop(inkEllipsePts(px, py - ph + 4 * u, pw * 0.92, 32 * u, sd + 26, 16, 0, 0.04), { seed: sd + 26, t, amp: 0.6 }));
          const BU = [], BR = [];
          for (let i = 0; i < 7; i++) { const ph2 = (t * 0.9 + hn(sd + 3, i)) % 1, bx = px + (hn(sd + 4, i) - 0.5) * pw * 1.5, by = py - ph + (hn(sd + 5, i) - 0.5) * 30 * u, br = (8 + 22 * ph2) * u;
            if (ph2 < 0.85) { BU.push(inkCircle(bx, by - br * 0.4, br, sd + 30 + i, t, { fill: true })); BR.push(inkCircle(bx, by - br * 0.4, br, sd + 40 + i, t, { w: 3.5 })); } }
          bub.setAttribute('d', BU.join(' ')); bubR.setAttribute('d', BR.join(' '));
          const sa = t * 2.2, sp0 = [px + Math.cos(sa) * pw * 0.45, py - ph + Math.sin(sa) * 18 * u];
          spoon.setAttribute('d', inkPath([sp0, [sp0[0] + 120 * u, sp0[1] - 360 * u]], { w: 24 * u, seed: sd + 50, t, taper: 0.1 }) + ' ' + inkDot(sp0[0], sp0[1] + 6 * u, 34 * u, 18 * u, sd + 51, t));
          // steam curls
          const ST = [], STR = [];
          for (let i = 0; i < 5; i++) { const q = (t * 0.3 + i / 5) % 1, x0 = px + (i - 2) * 70 * u, y0 = py - ph - 30 * u - q * 260 * u, pts = [];
            for (let j = 0; j <= 10; j++) pts.push([x0 + Math.sin(j * 0.9 + t * 2.2 + i * 1.3) * (16 + j * 3) * u, y0 - j * 34 * u]);
            const w = 9 * Math.sin(Math.PI * Math.min(1, q * 1.15)) + 1.5; ST.push(inkPath(pts, { w: w + 4, seed: sd + 60 + i, t, taper: 0.7 })); STR.push(inkPath(pts, { w, seed: sd + 60 + i, t, taper: 0.7 })); }
          steam.setAttribute('d', ST.join(' ')); steamR.setAttribute('d', STR.join(' '));
          tom.update(t, [[0.27 * W, top + 250 * u, 58 * u, 0.3], [0.56 * W, top + 240 * u, 54 * u, 1.4], [0.7 * W, top + 250 * u, 54 * u, 2.2]]);
          // recipe card (right), title + lines written by a quill
          const cx = 0.625 * W, cy = 0.4 * H, cw = 250 * u, ch = 380 * u, rot = 4 + Math.sin(t * 0.8) * 0.6;
          cardG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot)})`);
          const C = [[-cw / 2, -ch / 2], [cw / 2, -ch / 2 - 4], [cw / 2 + 4, ch / 2], [-cw / 2 + 2, ch / 2 + 4]];
          card.setAttribute('d', inkLoop(C, { seed: sd + 80, t, amp: 0.8, smooth: false }));
          cardR.setAttribute('d', inkPath(C, { w: 5, seed: sd + 81, t, closed: true, smooth: false }));
          const wk = clamp01((lt - wr) / Math.max(1, dur * 0.75)), Ls = [];
          title.forEach((e, i) => { const k = clamp01(wk * 3 - i); e.setAttribute('x', 0); e.setAttribute('y', f1(-ch / 2 + 110 * u + i * 86 * u)); e.setAttribute('font-size', f1(Math.min(70, 215 / (Math.max(1, e.textContent.length) * 0.5)) * u)); e.style.display = k > 0.05 ? '' : 'none'; e.setAttribute('transform', `scale(${f1(0.6 + 0.4 * k)})`); });
          for (let i = 0; i < 5; i++) { const k = clamp01(wk * 6 - 2 - i * 0.8); if (k > 0) Ls.push(inkPath([[-cw * 0.38, -ch / 2 + 230 * u + i * 40 * u], [lerp(-cw * 0.38, cw * (0.2 + 0.15 * hn(sd + 6, i)), k), -ch / 2 + 230 * u + i * 40 * u]], { w: 4, seed: sd + 90 + i, t })); }
          lines.setAttribute('d', Ls.join(' '));
          // quill moving along the writing
          const qi = Math.min(4, Math.floor(clamp01(wk * 6 - 2) * 5 / 0.999)), qy = wk < 0.34 ? -ch / 2 + 110 * u : -ch / 2 + 230 * u + qi * 40 * u, qx = Math.sin(t * 7) * cw * 0.3;
          const a = rot * Math.PI / 180, wx = cx + qx * Math.cos(a) - qy * Math.sin(a), wy = cy + qx * Math.sin(a) + qy * Math.cos(a);
          const Q = [[wx, wy], [wx + 40 * u, wy - 90 * u], [wx + 150 * u, wy - 300 * u], [wx + 110 * u, wy - 140 * u], [wx + 20 * u, wy - 30 * u]];
          quill.setAttribute('d', inkLoop(Q, { seed: sd + 100, t, amp: 0.6 }));
          quillR.setAttribute('d', inkPath(Q, { w: 4, seed: sd + 101, t, closed: true }) + ' ' + inkPath([[wx, wy], [wx + 150 * u, wy - 300 * u]], { w: 3, seed: sd + 102, t }));
          void hit;
          // plain kitchen table: thick top edge, apron with a drawer, two legs and a stretcher; the floor shows between the legs
          const th = 44 * u, ah = 120 * u, l1 = 0.24 * W, l2 = 0.8 * W, lw = 74 * u;
          const ED = rectP(-60, edge, W + 60, edge + th), AP = rectP(-60, edge + th, W + 60, edge + th + ah);
          apron.setAttribute('d', inkLoop(ED, { seed: sd + 140, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(AP, { seed: sd + 141, t, amp: 0.6, smooth: false }));
          const LG = [rectP(l1 - lw / 2, edge + th + ah, l1 + lw / 2, H + 60), rectP(l2 - lw / 2, edge + th + ah, l2 + lw / 2, H + 60)], STR2 = rectP(l1, H - 330 * u, l2, H - 290 * u);
          legs.setAttribute('d', LG.concat([STR2]).map((q, i) => inkLoop(q, { seed: sd + 142 + i, t, amp: 0.5, smooth: false })).join(' '));
          const DR = rectP(0.42 * W, edge + th + 18 * u, 0.62 * W, edge + th + ah - 18 * u);
          tLines.setAttribute('d', [ED, AP, DR].concat(LG, [STR2]).map((q, i) => inkPath(q, { w: i < 2 ? 6 : 5, seed: sd + 150 + i, t, closed: true, smooth: false })).join(' ') +
            ' ' + [0.1, 0.3, 0.7, 0.9].map((q, i) => inkPath([[q * W, edge + th + 30 * u], [q * W + 90 * u, edge + th + 32 * u]], { w: 2.5, seed: sd + 160 + i, t })).join(' '));
          knob.setAttribute('d', inkCircle(0.52 * W, edge + th + ah / 2, 12 * u, sd + 170, t, { fill: true }));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.kc_street
  SH.kc_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, u = W / 1080, mode = P.mode || 'ads', gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const wall = inkEl(root, mix(INK.paperDark, INK.red, 0.18)), wallR = inkEl(root, mix(INK.stain, INK.ink, 0.25));
      const posters = (mode === 'ads' ? (P.posters || [
        { lines: ['TOMATO', 'PILLS!'], x: 0.5, y: 0.25, w: 600, h: 400, rot: -3, big: true },
        { lines: ['CURES', 'ALL!'], x: 0.24, y: 0.47, w: 380, h: 300, rot: 4 },
        { lines: [], x: 0.6, y: 0.47, w: 300, h: 280, rot: -5, tomato: true },
        { lines: [], x: 0.12, y: 0.21, w: 260, h: 330, rot: 6 },
        { lines: [], x: 0.9, y: 0.22, w: 240, h: 320, rot: -6 },
      ]) : []).map((o, i) => {
        const g = el(root, 'g'), f = inkEl(g, INK.paperLight), r = inkEl(g), cols = inkEl(g, INK.inkSoft);
        const T = (o.lines || []).map(s => { const e = txt(g, { 'font-family': SERIF, 'font-weight': 900, fill: INK.ink }); e.textContent = s; return e; });
        const tm = o.tomato ? tomato(g, sd + 300 + i * 10) : null;
        return { o, g, f, r, cols, T, tm };
      });
      const cartA = mode === 'feud' ? cart(el(root, 'g'), sd + 100) : null;
      const hs = mode === 'feud' ? horse(el(root, 'g'), sd + 150) : null;
      const oh = mode === 'run' ? outhouse(el(root, 'g'), sd + 200) : null;
      const m1 = man(el(root, 'g'), sd + 20, { scale: (mode === 'ads' ? 0.95 : mode === 'run' ? 1.2 : 1.15) * u, beard: mode === 'feud' ? 'short' : null, col: mode === 'ads' ? mix(INK.blue, INK.paperLight, 0.2) : COAT() });
      const m2 = mode === 'feud' ? man(el(root, 'g'), sd + 40, { scale: 1.15 * u, beard: 'black', col: mix(INK.green, INK.ink, 0.35) }) : null;
      const paper = inkEl(root, INK.paperLight), paperR = inkEl(root);
      const motion = inkEl(root, INK.inkSoft), bang = inkEl(root, INK.red);
      const front = mode === 'run' ? yard(el(root, 'g'), sd + 990) : cobbles(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.55);
          if (mode === 'ads') {
            const B = rectP(-40, 0.08 * H, W + 40, gy);
            wall.setAttribute('d', inkLoop(B, { seed: sd, t, amp: 0.5, smooth: false }));
            const BR = [];
            for (let y = 0.08 * H + 60 * u, row = 0; y < gy; y += 60 * u, row++) { BR.push(inkPath([[-40, y], [W + 40, y]], { w: 2.5, seed: sd + 1 + row, t })); for (let x = (row % 2) * 70 * u; x < W; x += 140 * u) BR.push(inkPath([[x, y - 60 * u], [x, y]], { w: 2.5, seed: sd + 40 + row * 9 + Math.round(x / (140 * u)), t })); }
            wallR.setAttribute('d', BR.join(' '));
            const b0 = atOr(cues, 'box', 0.15), order = [3, 0, 4, 1, 2];
            posters.forEach((p, i) => {
              const o = p.o, at = b0 + order.indexOf(i) * Math.max(0.28, dur * 0.14), k = spring(lt, at, 0.4);
              if (lt < at) { p.g.setAttribute('transform', 'scale(0)'); return; }
              const s = (1.35 - 0.35 * k) * (1 + 0.05 * punch(lt, at + 0.25)), w = o.w * u, h = o.h * u;
              p.g.setAttribute('transform', `translate(${f1(o.x * W)} ${f1(o.y * H)}) rotate(${f1((o.rot || 0) + (1 - k) * 8)}) scale(${Math.round(s * 1000) / 1000})`);
              const C = [[-w / 2, -h / 2], [w / 2, -h / 2 + 4], [w / 2 - 4, h / 2], [-w / 2 + 3, h / 2 - 2]];
              p.f.setAttribute('d', inkLoop(C, { seed: sd + 200 + i, t, amp: 0.8, smooth: false }));
              const R = [inkPath(C, { w: 5, seed: sd + 210 + i, t, closed: true, smooth: false })];
              const nl = p.T.length, Lc = [];
              p.T.forEach((e, j) => { const fs = Math.min(o.big ? 150 : 110, (w * 0.9) / (Math.max(1, e.textContent.length) * 0.72)); e.setAttribute('font-size', f1(fs)); e.setAttribute('x', 0); e.setAttribute('y', f1(-h / 2 + (j + 1) * h / (nl + 1) + fs * 0.32 - (o.big ? 20 * u : 0))); if (o.big && j === 1) e.setAttribute('fill', INK.red); });
              if (nl === 0) for (let j = 0; j < 5; j++) Lc.push(inkPath([[-w * 0.38, -h * 0.3 + j * h * 0.15], [w * (0.2 + 0.18 * hn(sd + 7, i * 5 + j)), -h * 0.3 + j * h * 0.15]], { w: j ? 4 : 10, seed: sd + 220 + i * 5 + j, t }));
              if (o.big) R.push(inkPath([[-w * 0.42, h * 0.38], [w * 0.42, h * 0.38]], { w: 4, seed: sd + 230 + i, t }));
              p.r.setAttribute('d', R.join(' ')); p.cols.setAttribute('d', Lc.join(' '));
              if (p.tm) p.tm.update(t, [[0, -h * 0.05, h * 0.3, 0.2]]);
            });
            // newsboy on the sidewalk waving a paper ("EXTRA!" sign)
            const r = m1.update(t, 'hold', { x: 0.86 * W, y: gy + 10 * u, face: -1, since: 1, text: P.sign || 'EXTRA!', emotion: 'happy' });
            void r; blank(paper, paperR, motion, bang);
            front.update(t, W, H, gy + 120 * u);
          } else if (mode === 'feud') {
            blank(wall, wallR);
            cartA.update(t, 0.93 * W, gy + 40 * u, 1.0 * u);
            const ne = clamp01((lt - hit) / 0.3) * (lt < hit + 1.4 ? 1 : clamp01(1 - (lt - hit - 1.4) / 0.5));
            const hr = hs.update(t, 0.12 * W, gy + 60 * u, 0.95 * u, { neigh: ne, face: 1 });
            m1.update(t, 'point', lt < hit ? { x: 0.46 * W, y: gy + 90 * u, face: 1, since: 1, dir: 10 + Math.sin(t * 6) * 4, emotion: 'angry' } : { x: 0.46 * W, y: gy + 90 * u, face: -1, since: lt - hit, dir: 30, emotion: 'happy' });
            m2.update(t, lt < hit ? 'point' : 'shock', { x: 0.7 * W, y: gy + 90 * u, face: -1, since: lt < hit ? 1 : lt - hit, dir: 6, emotion: lt < hit ? 'angry' : 'surprised' });
            // neigh lines from the horse's mouth
            const N = []; if (ne > 0.1) for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.4, r0 = 40 * u, r1 = (90 + 30 * Math.sin(t * 12 + i)) * u; N.push(inkPath([[hr.nose[0] + Math.cos(a) * r0, hr.nose[1] + Math.sin(a) * r0 - 40 * u], [hr.nose[0] + Math.cos(a) * r1, hr.nose[1] + Math.sin(a) * r1 - 60 * u]], { w: 6, seed: sd + 60 + i, t })); }
            bang.setAttribute('d', N.join(' '));
            // angry squiggle between the two sellers
            const Q = []; for (let i = 0; i < 3; i++) { const x = 0.58 * W + (i - 1) * 40 * u, y = gy - 640 * u + Math.sin(t * 8 + i) * 10 * u; Q.push(inkPath([[x - 14 * u, y - 20 * u], [x + 14 * u, y], [x - 14 * u, y + 20 * u]], { w: 5, seed: sd + 70 + i, t })); }
            motion.setAttribute('d', Q.join(' '));
            blank(paper, paperR);
            front.update(t, W, H, gy + 120 * u);
          } else {
            blank(wall, wallR, paperR);
            const ox = 0.74 * W, arr = Math.max(0.6, hit - 0.08), inside = lt >= arr;
            const open = lt < arr - 0.35 ? 0 : lt < arr ? clamp01((lt - (arr - 0.35)) / 0.3) : clamp01(1 - (lt - arr) / 0.08);
            const shake = inside ? clamp01((lt - arr - 0.1) / 0.1) * (0.6 + 0.4 * Math.sin(t * 3)) : 0;
            oh.update(t, ox, gy + 40 * u, 1.25 * u, { open, shake });
            if (!inside) {
              const p = clamp01(lt / arr), x = lerp(0.08, 0.6, p) * W;
              m1.g.setAttribute('transform', '');
              const rr = m1.update(t, 'run', { x, y: gy + 50 * u, face: 1, ph: lt * 1.7, since: 1, emotion: 'worried', belly: true });
              const hw = rr.headW, SW = [];
              for (let i = 0; i < 3; i++) { const q = (t * 1.6 + i / 3) % 1, sx = hw[0] - (60 + 30 * i) * u - q * 40 * u, sy = hw[1] - 40 * u + i * 30 * u + q * 50 * u;
                SW.push(inkLoop([[sx, sy - 22 * u], [sx + 10 * u, sy], [sx, sy + 9 * u], [sx - 10 * u, sy]], { seed: sd + 120 + i, t, amp: 0.4 })); }
              paper.setAttribute('d', SW.join(' '));
              const ML = []; for (let i = 0; i < 3; i++) ML.push(inkPath([[x - (120 + i * 10) * u, gy - (250 + i * 60) * u], [x - (220 + i * 30) * u, gy - (250 + i * 60) * u]], { w: 6, seed: sd + 80 + i, t }));
              motion.setAttribute('d', ML.join(' ')); bang.setAttribute('d', '');
            } else {
              m1.g.setAttribute('transform', 'translate(9999 0)');
              motion.setAttribute('d', ''); paper.setAttribute('d', '');
              const B = []; if (shake > 0.1) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.45, r0 = 380 * u, r1 = (450 + 20 * Math.sin(t * 14 + i)) * u; B.push(inkPath([[ox + Math.cos(a) * r0 * 0.8, gy - 420 * u + Math.sin(a) * r0 * 1.3], [ox + Math.cos(a) * r1 * 0.8, gy - 420 * u + Math.sin(a) * r1 * 1.3]], { w: 8, seed: sd + 90 + i, t })); }
              bang.setAttribute('d', B.join(' '));
            }
            front.update(t, W, H, gy + 150 * u);
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
