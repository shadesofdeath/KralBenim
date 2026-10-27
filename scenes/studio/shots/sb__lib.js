// sb__lib: shared ink drawings for the sb_* shots (Stickstory "Battle of Stamford Bridge 1066", 2026-10-27). Not a
// shot type itself. Parchment ink (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens
// only (INK), everything a pure function of (seed, t) — no Math.random. Parametric: usable for any early-medieval
// (Viking / Saxon / Norman) battle story.
// window.SB = {
//   atOr(cues, name|sec, fb), f1, COL,
//   warrior(parent, K, sd) -> {update(lt, t, cues, W, H) -> {x, y, head: [x, y]}}
//       a period stick figure (KASIF rig, no hat) with 11th-century kit: K = {x, y (ground, 0..1), scale: 0.55,
//       pose: "idle", face: "right"|"left", emotion, dir, seq: [{at, pose, face, emotion, dir}],
//       move: {at, to (0..1), dur: 1.2, run: false} (walks/runs there), side: "nor"|"eng"|"nrm" (shield colour),
//       mail: false (hatched mail shirt), helmet: true (conical nasal helmet), crown: false (gold circlet instead),
//       shield: "round"|"kite"|false, spear: false | true, axe: false, beard, fall: cue (topples backwards),
//       stagger: cue (rocks back), hide_until: cue, sway: 1}
//       The narrator: {who: "kasif", ...} (fez from the script's narrator, no kit).
//   longship(parent, sd) -> {update(t, o)}  clinker-built ship side view: crescent hull with plank lines, a curled
//       dragon prow + stern, shields on the rail, mast, square striped sail (o.sail 0 = furled, 1 = set), oars.
//       o: {x, y (waterline), s: 1 (1 = ~620 px long), face: 1|-1, sail: 1, stripes: "red"|"blue", rock: 1,
//       shields: true, oars: false, beached: 0..1 (tilts as it runs aground)}
//   byrnie(parent, sd) -> {update(t, o)}  a mail shirt (T-shape, short sleeves, ring hatching) hung from a pole or
//       lying. o: {x, y (top centre), s: 1 (1 = ~220 px wide), rot, sway}
//   rack(parent, sd) -> {update(t, o)}  wooden pole rack (two forked posts + crossbar) o: {x, y (ground), w, h}
//   dust(parent, sd) -> {update(t, o)}  rolling dust cloud: o: {x, y (base), w, h, p 0..1 (growth)}
//   grass(parent, sd, list) -> {update(t)}  foreground tufts: list [{x, y, s, n}] (stage px)
//   shield(parent, sd) -> {update(t, o)}  loose round/kite shield lying or leaning: o {x, y, r, kind, side, rot, tilt}
//   spear(parent, sd) -> {update(t, o)}   spear stuck in the ground: o {x, y, len, rot}
//   arrow(parent, sd) -> {update(t, from, to, p, arc)}  flying arrow with fletching (p 0..1 along the arc)
//   burst(parent, sd) -> {update(t, x, y, r, p)}  gold/red ink impact star
//   banner(parent, sd) -> {update(t, o)}  raven banner on a pole: o {x, y (pole foot), h, fall: 0..1, wave}
//   sun(parent, sd) -> {update(t, x, y, r)}  hot gold sun with heat rays
//   label(parent, L, W, H, sd) -> MCB-style label (delegates to MCB.labels)
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft, paper: INK.paperLight };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const ell = (cx, cy, rx, ry, n = 16) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const SB_ell = (cx, cy, rx, ry, n = 16) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const pip = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  // dense mail-ring hatching inside a polygon: rows of small open arcs (each ring a "u"), offset every other row
  const ringArcs = (poly, seed, t, step = 22, r = 8, w = 2.6) => {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; poly.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    let d = '', k = 0;
    for (let y = y0 + step * 0.7, row = 0; y < y1 - 4; y += step * 0.75, row++) for (let x = x0 + (row % 2 ? step / 2 : 0) + 6; x < x1 - 4; x += step) {
      if (!pip(poly, x, y)) continue;
      d += inkPath([[x - r, y - r * 0.35], [x, y + r * 0.55], [x + r, y - r * 0.35]], { w, seed: seed + (k++), t, amp: 0.4, taper: 0.4 }) + ' ';
    }
    return d;
  };
  // round shield: coloured face, vertical plank seams, thick rim, iron boss
  const roundShield = (E, cx, cy, R, seed, t) => {
    const rp = ell(cx, cy, R, R, 18);
    E.f.setAttribute('d', inkLoop(rp, { seed: seed + 1, t, amp: 1 }));
    let pl = '';
    for (let k = -3; k <= 3; k++) { if (!k) continue; const x = cx + k * R * 0.27, h = Math.sqrt(Math.max(0, R * R - (k * R * 0.27) ** 2)) * 0.9; pl += inkPath([[x, cy - h], [x + 2, cy + h]], { w: 3, seed: seed + 10 + k, t, amp: 0.6, taper: 0.2 }) + ' '; }
    E.p.setAttribute('d', pl);
    E.r.setAttribute('d', inkPath(rp, { w: Math.max(6, R * 0.1), seed: seed + 2, t, closed: true, amp: 1 }));
    E.b.setAttribute('d', inkDot(cx, cy, R * 0.26, R * 0.26, seed + 3, t) + ' ' + inkCircle(cx, cy, R * 0.26, seed + 4, t, { w: 4 }));
  };
  const SIDE = { nor: INK.red, eng: INK.blue, nrm: INK.gold };

  // ------------------------------------------------------------------ warrior (period figure with kit)
  function warrior(parent, K, sd) {
    const isK = K.who === 'kasif';
    const outer = el(parent, 'g');
    const back = el(outer, 'g');                      // mail shirt behind the stick body
    const mailF = inkEl(back, INK.inkSoft), mailR = inkEl(back), mailH = inkEl(back, INK.paperLight, { 'fill-opacity': 0.85 });
    const spearE = inkEl(outer), spearTip = inkEl(outer, INK.inkSoft), spearTipR = inkEl(outer);
    const rigG = el(outer, 'g');
    const rig = KASIF.create(rigG, { scale: 1, hat: isK, accessory: isK ? null : (K.crown ? 'crown' : null), beard: isK ? null : (K.beard || null), seed: sd });
    const front = el(outer, 'g');
    const helmF = inkEl(front, INK.inkSoft), helmR = inkEl(front), helmN = inkEl(front);
    const axeE = inkEl(front), axeB = inkEl(front, INK.inkSoft), axeR = inkEl(front);
    const shF = inkEl(front, SIDE[K.side] || INK.red), shP = inkEl(front, INK.paperLight), shR = inkEl(front), shB = inkEl(front, INK.inkSoft);
    const gait = KASIF.gait ? KASIF.gait('walk') : 120, gaitR = KASIF.gait ? KASIF.gait('run') : 160;
    const kit = !isK;
    return {
      K,
      update(lt, t, cues, W, H) {
        const hu = atOr(cues, K.hide_until, null);
        if (hu != null && lt < hu) { outer.style.display = 'none'; return null; }
        outer.style.display = '';
        const sc = K.scale ?? 0.55, face0 = faceOf(K.face, 1);
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
        const s = segs[si]; let pv = si > 0 ? segs[si - 1] : null; const since = lt - Math.max(0, s.at);
        let x = (K.x ?? 0.5) * W, face = faceOf(s.face, face0), pose = s.pose || 'idle', ph = 0;
        if (K.move) {
          const M = K.move, a = atOr(cues, M.at, 0) + (M.delay ?? 0), d = M.dur ?? 1.2, u = progIO(lt, a, d), dist = ((M.to ?? K.x) - (K.x ?? 0.5)) * W;
          x = (K.x ?? 0.5) * W + dist * u;
          if (lt >= a && lt < a + d) { pose = M.run ? 'run' : 'walk'; face = dist < 0 ? -1 : 1; ph = Math.abs(dist * u) / ((M.run ? gaitR : gait) * sc); pv = null; }
        }
        const y = (K.y ?? 0.6) * H;
        // fall / stagger: rotate the whole figure backwards around its feet
        const fa = atOr(cues, K.fall, null), fp = fa == null ? 0 : progIO(lt, fa, 0.7);
        const sa = atOr(cues, K.stagger, null), sp = sa == null ? 0 : Math.sin(clamp01((lt - sa) / 0.8) * Math.PI) * (lt >= sa ? 1 : 0);
        const sway = Math.sin(t * 1.3 + sd) * 1.2 * (K.sway ?? 1);
        const rotA = -face * (fp * 78 + sp * 12) + sway;
        outer.setAttribute('transform', `rotate(${f1(rotA)} ${f1(x)} ${f1(y)}) translate(0 ${f1(fp * 30)})`);
        const o = { x, y, face, since, ph, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, Object.assign(o, { scale: sc }));
        const xf = `translate(${f1(x)} ${f1(y)}) scale(${(face * sc).toFixed(4)} ${sc.toFixed(4)})`;
        back.setAttribute('transform', xf); front.setAttribute('transform', xf);
        const S = k => sd * 100 + k, amp = 1.4;
        const hc = r.head, hip = r.hip, [hA, hB] = r.hands;
        if (kit) {
          // mail shirt: trapezoid from the shoulders to mid-thigh along the torso line, short sleeves
          if (K.mail) {
            const ux = hc[0] - hip[0], uy = hc[1] - hip[1], L = Math.hypot(ux, uy) || 1, u = [ux / L, uy / L], n = [-u[1], u[0]];
            const P = (a, b) => [hip[0] + u[0] * a + n[0] * b, hip[1] + u[1] * a + n[1] * b];
            const pts = [P(140, -40), P(132, -76), P(96, -82), P(96, -56), P(-58, -62), P(-58, 62), P(96, 56), P(96, 82), P(132, 76), P(140, 40)];
            mailF.setAttribute('d', inkLoop(pts, { seed: S(1), t, amp, smooth: false }));
            mailR.setAttribute('d', inkPath(pts, { w: 5, seed: S(2), t, closed: true, amp, smooth: false }));
            const hd = ringArcs(pts, S(10), t, 20, 7, 2.6);
            mailH.setAttribute('d', hd);
          } else { mailF.setAttribute('d', ''); mailR.setAttribute('d', ''); mailH.setAttribute('d', ''); }
          // helmet (conical, nose guard) unless crowned
          if (K.helmet !== false && !K.crown) {
            const H0 = (px, py) => [hc[0] + px, hc[1] + py];
            const hp = [H0(-76, -14), H0(-72, -52), H0(-46, -92), H0(-12, -124), H0(0, -134), H0(12, -124), H0(46, -92), H0(72, -52), H0(76, -14), H0(40, -26), H0(0, -30), H0(-40, -26)];
            helmF.setAttribute('d', inkLoop(hp, { seed: S(3), t, amp: 1 }));
            helmR.setAttribute('d', inkPath(hp, { w: 6, seed: S(4), t, closed: true, amp: 1 }));
            helmN.setAttribute('d', inkPath([H0(14, -28), H0(16, 30)], { w: 9, seed: S(5), t, amp: 0.8 }) + ' ' + inkPath([H0(-74, -34), H0(0, -44), H0(74, -34)], { w: 4, seed: S(6), t, amp: 0.8 }));
          } else { helmF.setAttribute('d', ''); helmR.setAttribute('d', ''); helmN.setAttribute('d', ''); }
          // spear in the back hand (long shaft, leaf blade)
          if (K.spear) {
            const hx = hA[0], hy = hA[1], a = (K.spear_rot ?? -14) * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
            const b0 = [hx - dx * 150, hy - dy * 150], b1 = [hx + dx * 330, hy + dy * 330];
            spearE.setAttribute('d', inkPath([b0, b1], { w: 7, seed: S(7), t, amp: 1 }));
            const tp = [[b1[0] - dy * 14, b1[1] + dx * 14], [b1[0] + dx * 70, b1[1] + dy * 70], [b1[0] + dy * 14, b1[1] - dx * 14]];
            spearTip.setAttribute('d', inkLoop(tp, { seed: S(8), t, amp: 0.6, smooth: false }));
            spearTipR.setAttribute('d', inkPath(tp, { w: 4, seed: S(9), t, closed: true, amp: 0.6, smooth: false }));
          }
          // axe in the front hand
          if (K.axe) {
            const hx = hB[0], hy = hB[1];
            axeE.setAttribute('d', inkPath([[hx, hy + 40], [hx + 6, hy - 150]], { w: 8, seed: S(11), t, amp: 1 }));
            const bl = [[hx + 4, hy - 150], [hx + 62, hy - 178], [hx + 70, hy - 108], [hx + 6, hy - 118]];
            axeB.setAttribute('d', inkLoop(bl, { seed: S(12), t, amp: 0.8 }));
            axeR.setAttribute('d', inkPath(bl, { w: 5, seed: S(13), t, closed: true, amp: 0.8 }));
          }
          // shield on the front hand
          if (K.shield) {
            const cx = hB[0] + 18, cy = hB[1] - 10;
            if (K.shield === 'kite') {
              const kp = [[cx - 62, cy - 96], [cx, cy - 112], [cx + 62, cy - 96], [cx + 54, cy + 10], [cx, cy + 150], [cx - 54, cy + 10]];
              shF.setAttribute('d', inkLoop(kp, { seed: S(14), t, amp: 1 }));
              shP.setAttribute('fill', INK.paperLight);
              shP.setAttribute('d', inkLoop([[cx - 10, cy - 104], [cx + 10, cy - 104], [cx + 8, cy + 130], [cx - 8, cy + 130]], { seed: S(15), t, amp: 0.6 }));
              shR.setAttribute('d', inkPath(kp, { w: 10, seed: S(16), t, closed: true, amp: 1 }));
              shB.setAttribute('fill', INK.inkSoft); shB.setAttribute('d', inkDot(cx, cy - 30, 22, 22, S(17), t) + ' ' + inkCircle(cx, cy - 30, 22, S(18), t, { w: 4 }));
            } else {
              shP.setAttribute('fill', INK.ink); shB.setAttribute('fill', INK.inkSoft);
              roundShield({ f: shF, p: shP, r: shR, b: shB }, cx, cy, 92, S(14), t);
            }
          }
        }
        const fx = face * sc;
        return { x, y, face, head: [x + fx * hc[0], y + sc * hc[1]], neck: [x + fx * hc[0], y + sc * (hc[1] + 70)], hand: [x + fx * hB[0], y + sc * hB[1]], hand2: [x + fx * hA[0], y + sc * hA[1]] };
      },
    };
  }

  // ------------------------------------------------------------------ longship
  function longship(parent, sd) {
    const g = el(parent, 'g');
    const oarE = inkEl(g), mastE = inkEl(g), yard = inkEl(g);
    const sailF = inkEl(g, INK.paperLight), sailS = inkEl(g, INK.red), sailR = inkEl(g);
    const hullF = inkEl(g, INK.paperDark), hullR = inkEl(g), planks = inkEl(g, INK.inkSoft), headR = inkEl(g);
    const shields = Array.from({ length: 9 }, () => ({ f: inkEl(g, INK.red), r: inkEl(g), b: inkEl(g, INK.ink) }));
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, face = o.face ?? 1, rock = (o.rock ?? 1);
        const bob = Math.sin(t * 1.4 + sd) * 6 * rock, tilt = Math.sin(t * 1.1 + sd * 0.7) * 1.6 * rock + (o.beached ?? 0) * -5;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1((o.y ?? 0) + bob)}) rotate(${f1(tilt)}) scale(${(face * s).toFixed(4)} ${s.toFixed(4)})`);
        const S = k => sd * 50 + k;
        // hull: waterline at y = 0; length ~620 (x -310..310), gunwale at -70, prow/stern curl up to -190
        const hull = [[-300, -80], [-250, -66], [-120, -60], [0, -58], [120, -60], [250, -66], [300, -80], [300, -86], [326, -150], [312, -196], [282, -200], [270, -172], [292, -150], [278, -100],
          [240, -30], [150, 6], [0, 14], [-150, 6], [-240, -30], [-278, -100], [-296, -150], [-290, -176], [-268, -190], [-262, -168], [-282, -150], [-300, -86]];
        hullF.setAttribute('d', inkLoop(hull, { seed: S(1), t, amp: 1.2, smooth: false }));
        hullR.setAttribute('d', inkPath(hull, { w: 6, seed: S(2), t, closed: true, amp: 1.2, smooth: false }));
        let pl = '';
        for (let k = 0; k < 3; k++) { const yy = -40 + k * 18; pl += inkPath([[-262 + k * 20, yy - 22 + k * 4], [-130, yy], [0, yy + 4], [130, yy], [262 - k * 20, yy - 22 + k * 4]], { w: 3, seed: S(3 + k), t, amp: 1 }) + ' '; }
        planks.setAttribute('d', pl);
        // dragon-head scroll at the prow (right) + eye
        headR.setAttribute('d', inkPath([[312, -196], [336, -214], [352, -200], [338, -188], [316, -190]], { w: 6, seed: S(7), t, amp: 0.8 }) + ' ' + inkDot(334, -204, 4, 4, S(8), t));
        // shields along the rail
        const sc = COL[o.stripes] || INK.red, n = o.shields === false ? 0 : 9;
        shields.forEach((sh, i) => {
          if (i >= n) { sh.f.setAttribute('d', ''); sh.r.setAttribute('d', ''); sh.b.setAttribute('d', ''); return; }
          const cx = -220 + i * 55, cy = -66, pts = ell(cx, cy, 25, 25, 12);
          sh.f.setAttribute('fill', i % 2 ? INK.paperLight : sc);
          sh.f.setAttribute('d', inkLoop(pts, { seed: S(10 + i), t, amp: 0.6 }));
          sh.r.setAttribute('d', inkPath(pts, { w: 4, seed: S(20 + i), t, closed: true, amp: 0.6 }));
          sh.b.setAttribute('d', inkDot(cx, cy, 6, 6, S(30 + i), t));
        });
        // oars
        if (o.oars) {
          let od = ''; const sw = Math.sin(t * 2.2) * 14;
          for (let k = 0; k < 6; k++) { const x0 = -170 + k * 66; od += inkPath([[x0, -50], [x0 - 40 + sw, 60]], { w: 5, seed: S(40 + k), t, amp: 0.8 }) + ' '; }
          oarE.setAttribute('d', od);
        } else oarE.setAttribute('d', '');
        // mast + sail
        const sail = clamp01(o.sail ?? 1), billow = Math.sin(t * 1.7 + sd) * 8;
        mastE.setAttribute('d', inkPath([[0, -60], [2, -560]], { w: 9, seed: S(50), t, amp: 1 }));
        yard.setAttribute('d', inkPath([[-170, -520], [0, -526], [170, -520]], { w: 7, seed: S(51), t, amp: 1 }));
        if (sail > 0.02) {
          const top = -514, bot = lerp(-480, -150, sail), wid = 162;
          const sp = [[-wid, top], [wid, top], [wid + 12, bot], [0, bot + 20 + billow], [-wid - 12, bot]];
          sailF.setAttribute('d', inkLoop(sp, { seed: S(52), t, amp: 1 }));
          let st = '';
          for (let k = 0; k < 3; k++) { const x0 = -wid + 40 + k * 108, x1 = x0 + 54; st += inkLoop([[x0, top + 4], [x1, top + 4], [x1 + 4, bot - 2], [x0 + 2, bot + 10 + billow * 0.5]], { seed: S(53 + k), t, amp: 0.8, smooth: false }) + ' '; }
          sailS.setAttribute('fill', sc); sailS.setAttribute('d', st);
          sailR.setAttribute('d', inkPath(sp, { w: 6, seed: S(56), t, closed: true, amp: 1 }));
        } else { sailF.setAttribute('d', ''); sailS.setAttribute('d', ''); sailR.setAttribute('d', inkPath([[-170, -512], [170, -512]], { w: 16, seed: S(57), t, amp: 1 })); }
      },
    };
  }

  // ------------------------------------------------------------------ mail shirt (byrnie)
  function byrnie(parent, sd) {
    const g = el(parent, 'g');
    const f = inkEl(g, INK.inkSoft), rings = inkEl(g, INK.paperLight, { 'fill-opacity': 0.85 }), r = inkEl(g), belt = inkEl(g, INK.hatBand), buckle = inkEl(g, INK.gold), hem = inkEl(g);
    // T-shape with elbow-length sleeves: neck at (0,0), shoulders ±105, sleeves out to ±190, body to y 370
    const p = [[-36, 0], [-105, 14], [-190, 140], [-150, 172], [-94, 112], [-96, 360], [-14, 374], [0, 344], [14, 374], [96, 360], [94, 112], [150, 172], [190, 140], [105, 14], [36, 0], [0, 30]];
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, rot = (o.rot ?? 0) + Math.sin(t * 1.2 + sd) * (o.sway ?? 1.5);
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(rot)}) scale(${s.toFixed(4)})`);
        const S = k => sd * 40 + k;
        f.setAttribute('d', inkLoop(p, { seed: S(1), t, amp: 1.2, smooth: false }));
        r.setAttribute('d', inkPath(p, { w: 7, seed: S(2), t, closed: true, amp: 1.2, smooth: false }));
        rings.setAttribute('d', ringArcs(p, S(10), t, 21, 7.5, 2.8));
        const bp = [[-98, 214], [98, 210], [98, 238], [-98, 242]];
        belt.setAttribute('d', inkLoop(bp, { seed: S(3), t, amp: 0.8, smooth: false }));
        buckle.setAttribute('d', inkLoop([[-14, 208], [14, 208], [14, 244], [-14, 244]], { seed: S(4), t, amp: 0.6, smooth: false }));
        hem.setAttribute('d', inkPath(bp, { w: 4, seed: S(5), t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath([[-90, 346], [-14, 360], [0, 336], [14, 360], [90, 346]], { w: 4, seed: S(6), t, amp: 1 }));
      },
    };
  }

  // ------------------------------------------------------------------ rack: two forked posts + crossbar
  function rack(parent, sd) {
    const e = inkEl(parent, INK.ink), wood = inkEl(parent, INK.hatBand);
    return {
      update(t, o = {}) {
        const x = o.x ?? 500, y = o.y ?? 1150, w = o.w ?? 600, h = o.h ?? 470, S = k => sd * 30 + k;
        let d = '';
        for (const [k, px] of [[0, x - w / 2], [1, x + w / 2]]) {
          d += inkPath([[px, y + 10], [px + 4, y - h]], { w: 14, seed: S(k), t, amp: 1 }) + ' ';
          d += inkPath([[px + 4, y - h], [px - 24, y - h - 40]], { w: 9, seed: S(k + 2), t, amp: 1 }) + ' ' + inkPath([[px + 4, y - h], [px + 30, y - h - 38]], { w: 9, seed: S(k + 4), t, amp: 1 }) + ' ';
        }
        e.setAttribute('d', d);
        wood.setAttribute('d', inkPath([[x - w / 2 - 60, y - h - 16], [x, y - h - 22], [x + w / 2 + 60, y - h - 14]], { w: 16, seed: S(8), t, amp: 1 }));
      },
    };
  }

  // ------------------------------------------------------------------ dust cloud
  function dust(parent, sd) {
    const N = 11, lobes = Array.from({ length: N }, () => ({ f: inkEl(parent, INK.stain, { 'fill-opacity': 0.8 }), r: inkEl(parent, INK.inkSoft) }));
    const r0 = rng(sd + 77), L = lobes.map(() => [r0(), r0(), r0()]);
    return {
      update(t, o = {}) {
        const p = clamp01(o.p ?? 1), x = o.x ?? 540, y = o.y ?? 700, w = (o.w ?? 600), h = (o.h ?? 260);
        lobes.forEach((lb, i) => {
          const q = L[i], u = (i + 0.5) / N, k = clamp01(p * 1.6 - Math.abs(u - 0.5) * 1.2);
          if (k < 0.02) { lb.f.setAttribute('d', ''); lb.r.setAttribute('d', ''); return; }
          const R = (0.32 + 0.4 * q[0]) * h * k * (0.6 + 0.4 * Math.sin(u * Math.PI));
          const cx = x + (u - 0.5) * w * lerp(0.4, 1, p) + Math.sin(t * 0.9 + i) * 8;
          const cy = y - R * 0.6 - q[1] * h * 0.45 * k - Math.sin(u * Math.PI) * h * 0.25 * k + Math.sin(t * 1.3 + i * 2) * 5;
          const pts = SB_ell(cx, cy, R, R * 0.85, 12);
          lb.f.setAttribute('d', inkLoop(pts, { seed: sd + 10 + i, t, amp: 2 }));
          lb.r.setAttribute('d', inkPath(pts, { w: 4.5, seed: sd + 30 + i, t, closed: true, amp: 2 }));
        });
      },
    };
  }

  // ------------------------------------------------------------------ foreground grass tufts
  function grass(parent, sd, list) {
    const e = inkEl(parent, INK.inkSoft), e2 = inkEl(parent);
    return {
      update(t) {
        let d = '', d2 = '';
        (list || []).forEach((q, i) => {
          const n = q.n ?? 5, s = q.s ?? 1;
          for (let k = 0; k < n; k++) {
            const a = (k - (n - 1) / 2) * 0.28 + Math.sin(t * 1.5 + i + k * 0.7) * 0.06, L = (60 + (k * 37 % 50)) * s;
            const tip = [q.x + Math.sin(a) * L, q.y - Math.cos(a) * L];
            const path = inkPath([[q.x + (k - n / 2) * 6 * s, q.y], [lerp(q.x, tip[0], 0.5) + 6 * s, lerp(q.y, tip[1], 0.55)], tip], { w: 5 * s, seed: sd + i * 13 + k, t, amp: 1, taper: 0.7 });
            if (k % 2) d2 += path + ' '; else d += path + ' ';
          }
        });
        e.setAttribute('d', d); e2.setAttribute('d', d2);
      },
    };
  }

  // ------------------------------------------------------------------ loose shield / spear
  function shield(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, INK.red), p = inkEl(g, INK.paperLight), r = inkEl(g), b = inkEl(g, INK.inkSoft);
    return {
      update(t, o = {}) {
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(1 ${(o.tilt ?? 1).toFixed(3)})`);
        f.setAttribute('fill', SIDE[o.side] || INK.red);
        const R = o.r ?? 90;
        if (o.kind === 'kite') {
          const kp = [[-R * 0.7, -R], [0, -R * 1.15], [R * 0.7, -R], [R * 0.6, R * 0.1], [0, R * 1.6], [-R * 0.6, R * 0.1]];
          f.setAttribute('d', inkLoop(kp, { seed: sd + 1, t, amp: 1 })); p.setAttribute('d', ''); b.setAttribute('fill', INK.inkSoft);
          r.setAttribute('d', inkPath(kp, { w: 6, seed: sd + 2, t, closed: true, amp: 1 })); b.setAttribute('d', inkDot(0, -R * 0.3, R * 0.15, R * 0.15, sd + 3, t));
        } else {
          p.setAttribute('fill', INK.ink); b.setAttribute('fill', INK.inkSoft);
          roundShield({ f, p, r, b }, 0, 0, R, sd + 1, t);
        }
      },
    };
  }
  function spear(parent, sd) {
    const e = inkEl(parent), tip = inkEl(parent, INK.inkSoft), tr = inkEl(parent);
    return {
      update(t, o = {}) {
        const L = o.len ?? 420, a = (o.rot ?? 0) * Math.PI / 180, x = o.x ?? 0, y = o.y ?? 0;
        const dx = Math.sin(a), dy = -Math.cos(a), top = [x + dx * L, y + dy * L];
        e.setAttribute('d', inkPath([[x, y], top], { w: 7, seed: sd + 1, t, amp: 1 }));
        const tp = [[top[0] - dy * 13, top[1] + dx * 13], [top[0] + dx * 64, top[1] + dy * 64], [top[0] + dy * 13, top[1] - dx * 13]];
        tip.setAttribute('d', inkLoop(tp, { seed: sd + 2, t, amp: 0.6, smooth: false }));
        tr.setAttribute('d', inkPath(tp, { w: 4, seed: sd + 3, t, closed: true, amp: 0.6, smooth: false }));
      },
    };
  }

  // ------------------------------------------------------------------ flying arrow + impact burst
  function arrow(parent, sd) {
    const e = inkEl(parent), fl = inkEl(parent, INK.red), hd = inkEl(parent);
    return {
      update(t, from, to, p, arc = 120) {
        if (p <= 0 || p >= 1) { e.setAttribute('d', ''); fl.setAttribute('d', ''); hd.setAttribute('d', ''); return; }
        const P = u => [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * arc];
        const a = P(p), b = P(Math.max(0, p - 0.02)), ang = Math.atan2(a[1] - b[1], a[0] - b[0]), c = Math.cos(ang), s = Math.sin(ang), L = 230;
        const tail = [a[0] - c * L, a[1] - s * L];
        e.setAttribute('d', inkPath([tail, a], { w: 10, seed: sd + 1, t, amp: 0.6, taper: 0.1 }));
        hd.setAttribute('d', inkLoop([[a[0] + c * 40, a[1] + s * 40], [a[0] - s * 18, a[1] + c * 18], [a[0] + s * 18, a[1] - c * 18]], { seed: sd + 2, t, amp: 0.4, smooth: false }));
        let fd = '';
        for (const k of [-1, 1]) fd += inkLoop([[tail[0] + c * 56, tail[1] + s * 56], [tail[0] - s * 28 * k - c * 6, tail[1] + c * 28 * k - s * 6], [tail[0] + c * 2, tail[1] + s * 2]], { seed: sd + 3 + k, t, amp: 0.4, smooth: false }) + ' ';
        fl.setAttribute('d', fd);
      },
    };
  }
  function burst(parent, sd) {
    const f = inkEl(parent, INK.gold), r = inkEl(parent, INK.red);
    return {
      update(t, x, y, R, p) {
        if (p <= 0 || p >= 1) { f.setAttribute('d', ''); r.setAttribute('d', ''); return; }
        const k = Math.sin(p * Math.PI), pts = [];
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = (i % 2 ? 0.45 : 1) * R * (0.5 + 0.7 * k); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
        f.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 1.2, smooth: false }));
        r.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, amp: 1.2, smooth: false }));
      },
    };
  }

  // ------------------------------------------------------------------ raven banner
  function banner(parent, sd) {
    const g = el(parent, 'g'), pole = inkEl(g), flag = inkEl(g, INK.paperLight), fr = inkEl(g), raven = inkEl(g, INK.ink), edge = inkEl(g, INK.red), eye = inkEl(g, INK.paperLight);
    return {
      update(t, o = {}) {
        const x = o.x ?? 300, y = o.y ?? 1100, h = o.h ?? 700, fall = clamp01(o.fall ?? 0);
        g.setAttribute('transform', `rotate(${f1(-fall * 70 * (o.dir ?? 1))} ${f1(x)} ${f1(y)})`);
        pole.setAttribute('d', inkPath([[x, y], [x + 4, y - h]], { w: 10, seed: sd + 1, t, amp: 1 }));
        const top = y - h + 20, wv = Math.sin(t * 2.4) * 16 * (o.wave ?? 1);
        const fp = [[x + 4, top], [x + 150, top + 20 + wv * 0.3], [x + 300, top + 64 + wv], [x + 150, top + 140 + wv * 0.5], [x + 4, top + 210]];
        flag.setAttribute('d', inkLoop(fp, { seed: sd + 2, t, amp: 1.2 }));
        fr.setAttribute('d', inkPath(fp, { w: 6, seed: sd + 3, t, closed: true, amp: 1.2 }));
        edge.setAttribute('d', inkPath([[x + 10, top + 196], [x + 150, top + 128 + wv * 0.5], [x + 286, top + 70 + wv]], { w: 8, seed: sd + 4, t, amp: 1 }));
        // raven (side view, wings raised): body, head, beak, two feathered wings, fan tail, legs
        const cx = x + 118, cy = top + 104 + wv * 0.35, k = 1.25, Q = (dx, dy) => [cx + dx * k, cy + dy * k];
        const flap = Math.sin(t * 3) * 6;
        const parts = [
          SB_ell(cx, cy, 44 * k, 21 * k, 14).map(([px, py]) => [px, py + (px - cx) * -0.25]),
          SB_ell(Q(44, -24)[0], Q(44, -24)[1], 16 * k, 15 * k, 10),
          [Q(56, -30), Q(84, -22), Q(56, -16)],
          [Q(-14, -10), Q(-40, -66 - flap), Q(-28, -58 - flap), Q(-22, -84 - flap), Q(-8, -60 - flap), Q(6, -82 - flap), Q(14, -56 - flap), Q(26, -70 - flap), Q(22, -12)],
          [Q(-36, 6), Q(-80, 14), Q(-82, 26), Q(-70, 24), Q(-74, 36), Q(-32, 20)],
        ];
        raven.setAttribute('d', parts.map((pp, i) => inkLoop(pp, { seed: sd + 5 + i, t, amp: 0.7, smooth: i < 2 })).join(' ') + ' ' +
          inkPath([Q(-2, 18), Q(-6, 40)], { w: 4, seed: sd + 12, t, amp: 0.5 }) + ' ' + inkPath([Q(12, 16), Q(10, 40)], { w: 4, seed: sd + 13, t, amp: 0.5 }));
        eye.setAttribute('d', inkDot(Q(50, -28)[0], Q(50, -28)[1], 3.5, 3.5, sd + 14, t));
      },
    };
  }

  // ------------------------------------------------------------------ hot sun
  function sun(parent, sd) {
    const f = inkEl(parent, INK.gold, { 'fill-opacity': 0.85 }), r = inkEl(parent, INK.gold), ring = inkEl(parent, INK.inkSoft);
    return {
      update(t, x, y, R) {
        f.setAttribute('d', inkLoop(ell(x, y, R, R, 18), { seed: sd + 1, t, amp: 1 }));
        ring.setAttribute('d', inkPath(ell(x, y, R, R, 18), { w: 4, seed: sd + 2, t, closed: true, amp: 1 }));
        let d = '';
        for (let k = 0; k < 14; k++) {
          const a = k / 14 * Math.PI * 2 + t * 0.15, r0 = R * 1.25, r1 = R * (1.62 + 0.12 * Math.sin(t * 3 + k));
          const m = [x + Math.cos(a + 0.08) * (r0 + r1) / 2, y + Math.sin(a + 0.08) * (r0 + r1) / 2];
          d += inkPath([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], m, [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 6, seed: sd + 3 + k, t, amp: 1, taper: 0.6 }) + ' ';
        }
        r.setAttribute('d', d);
      },
    };
  }

  // ------------------------------------------------------------------ heat shimmer: wavy lines rising
  function heat(parent, sd) {
    const e = inkEl(parent, INK.gold, { 'fill-opacity': 0.8 });
    return {
      update(t, list) {
        let d = '';
        (list || []).forEach((q, i) => {
          const u = ((t * 0.35 + i * 0.37) % 1), y0 = q.y - u * 140, pts = [];
          for (let k = 0; k <= 6; k++) pts.push([q.x + Math.sin(k * 1.3 + t * 3 + i) * 12, y0 - k * 16]);
          if (u < 0.85) d += inkPath(pts, { w: 4.5 * (1 - u), seed: sd + i, t, amp: 0.6, taper: 0.8 }) + ' ';
        });
        e.setAttribute('d', d);
      },
    };
  }

  window.SB = { atOr, f1, COL, ell, warrior, longship, byrnie, rack, dust, grass, shield, spear, arrow, burst, banner, sun, heat };
})();
