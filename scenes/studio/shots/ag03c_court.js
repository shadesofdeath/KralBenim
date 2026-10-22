// ag03c_court: a ruler's court in the parchment ink style (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via
// _ink.js, everything is a pure function of (seed, lt)). Written for the Malazgirt long video (Alp Arslan and the
// captive Romanos Diogenes; Mihail Dukas crowned in Constantinople) but parametric.
//   setting "tent":   a large campaign tent: two poles, a scalloped valance, tied-back drapes, striped back cloth, a
//                     patterned rug, a swaying oil lamp and a tuğ (horse-tail standard) beside the throne.
//   setting "palace": a palace hall: arcade of round arches on columns, a red curtain behind the throne, tiled floor.
// A raised throne (two-step dais, tall back) with a sitting ruler (KASIF rig, hatless, one accessory) who can stand
// up on a cue; an optional kneeling captive (hand-drawn kneeling stick figure with a gold crown and chained wrists:
// bows the head on a cue, the chain breaks on another); extra standing figures (guards with spears, courtiers),
// an optional crown that descends onto the ruler's head, a hand-written mark ("?") and the narrator (Kaşif / fez).
// P: {setting: "tent"|"palace",
//     throne: {x: 0.66, accessory: "turban", beard: "black", scale: 1, pose: "sit", face: -1, emotion,
//              seq: [{at, pose, dir, face, emotion}], crown: {at: cue (crown descends onto the head)}},
//     captive: {x: 0.42, scale: 1, face: 1, crown: true, chains: true, bow: cue|sec (head bows; negative = bowed
//               from the start), free: cue (chain breaks, hands drop), askew: 8 (crown tilt)} | false,
//     figures: [{x, accessory, beard, scale, pose: "idle", face: -1, emotion, spear: true, seq}],
//     tug: {x: 0.9} | false (tent: horse-tail standard), lamp: {x: 0.5} | false (tent: hanging oil lamp),
//     shadow: {from: 0.74, to: 1} (palace: hatched shade on the wall behind figures),
//     mark: {text: "?", at, x: 0.58, y: 0.3, size: 150, color: "red"|"ink"|"blue"},
//     kasif: {x: 0.14, scale: 0.85, pose: "talk", dir, face: 1, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.06, focus: [0.5, 0.55]}, cover_hide: true (thumbnail: the shot's own narrator hides),
//     cover: {zoom: 1.3, focus: [0.56, 0.6], kasif: {x, y, scale, pose, emotion, face, dir} | null, captive_scale: 1,
//       captive_x, mark: false} (thumbnail only:
//       static zoomed framing; with cover.kasif the shot's narrator stays visible at that spot instead of hiding)}
// cues: hit (punch), plus whatever names seq / bow / free / crown / mark use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, gold: INK.gold };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : fb);
  const CROWN = [[-56, -50], [-62, -104], [-34, -78], [-14, -118], [6, -80], [30, -120], [46, -80], [66, -106], [60, -50]];
  const rot = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

  // pose sequence -> rig opts (blends 0.35 s from the previous pose)
  function seqOpts(S, cues, lt, defFace) {
    const segs = [{ at: -1, pose: S.pose || 'idle', dir: S.dir, face: S.face, emotion: S.emotion }];
    (S.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
    segs.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
    const s = segs[i], p = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { pose: s.pose || 'idle', face: faceOf(s.face ?? S.face, defFace), since, dir: dirOf(s.dir ?? S.dir),
      emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : S.emotion || null), mouth: 0 };
    if (p && since < 0.35) { o.prev = { pose: p.pose || 'idle', since: since + 1, dir: dirOf(p.dir ?? S.dir), emotion: p.emotion }; o.mix = since / 0.35; }
    return o;
  }

  SH.ag03c_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 731, portrait = H > W;
      const k0 = portrait ? 1.25 : 1;
      const setting = P.setting || 'tent';
      const gy = H * (P.ground ?? (portrait ? 0.6 : 0.8));
      const root = el(svg, 'g'), cam = el(root, 'g');
      const back = el(cam, 'g'), mid = el(cam, 'g'), front = el(cam, 'g');

      // ---------------------------------------------------------------- background layers
      const bgFill = mk(back, INK.paperDark, { 'fill-opacity': 0.45 }), bgSoft = mk(back, INK.inkSoft, { 'fill-opacity': 0.8 });
      const bgRed = mk(back, INK.red, { 'fill-opacity': 0.85 }), bgLight = mk(back, INK.paperLight), bgInk = mk(back);
      const hatchE = mk(back, INK.inkSoft, { 'fill-opacity': 0.55 });
      const rugF = mk(back, INK.paperDark), rugR = mk(back, INK.red), rugInk = mk(back);
      const lampE = mk(back), lampF = mk(back, INK.gold);
      const T = Object.assign({ x: portrait ? 0.68 : 0.66, scale: 1, pose: 'sit', face: -1, accessory: 'turban' }, P.throne || {});
      const tx = T.x * W, ts = k0 * (T.scale || 1);
      const step1 = 36 * ts, step2 = 36 * ts, daisY = gy - step1 - step2;
      const throneF = mk(mid, INK.paperLight), throneR = mk(mid, INK.red, { 'fill-opacity': 0.9 }), throneInk = mk(mid), throneGold = mk(mid, INK.gold);
      const tugInk = mk(mid), tugSoft = mk(mid, INK.inkSoft), tugGold = mk(mid, INK.gold);
      const figG = el(mid, 'g');
      const figs = (P.figures || []).map((f, i) => ({ f, rig: KASIF.create(el(figG, 'g'), { scale: k0 * (f.scale || 0.95), hat: false, accessory: f.accessory || null, beard: f.beard || null, seed: sd + 40 + i * 7 }), spear: f.spear ? mk(figG) : null }));
      const ruler = KASIF.create(el(mid, 'g'), { scale: ts * 0.95, hat: false, accessory: T.crown ? null : (T.accessory || null), beard: T.beard || null, seed: sd + 20 });
      const crownDrop = T.crown ? { F: mk(mid, INK.gold), R: mk(mid), J: mk(mid, INK.red), S: mk(mid, INK.gold) } : null;

      // captive (hand-drawn kneeling figure)
      const C = P.captive ? Object.assign({ x: portrait ? 0.4 : 0.42, scale: 1, face: 1, crown: true, chains: true, askew: 8 }, P.captive) : null;
      const capG = el(front, 'g');
      const cap = C ? { head: mk(capG, INK.paperLight), body: mk(capG), face: mk(capG), crownF: mk(capG, INK.gold), crownR: mk(capG), chain: mk(capG), cuffs: mk(capG, INK.inkSoft), stake: mk(capG) } : null;

      // mark + narrator
      const ui = el(root, 'g');
      const M = P.mark || null;
      let markT = null;
      if (M) {
        markT = el(ui, 'text', { 'font-family': INK_FONT, 'font-size': M.size || (portrait ? 170 : 150), 'text-anchor': 'middle', fill: COL[M.color] || INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        markT.textContent = M.text || '?';
      }
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.2 : 0.14, scale: portrait ? 0.95 : 0.85, pose: 'talk', face: 1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      // static geometry (re-boiled 8x/s)
      const r = rng(seed * 19 + 7);
      const stripes = [], scallops = [], tiles = [];
      const topY = H * (portrait ? 0.14 : 0.1), valY = topY + (portrait ? 70 : 60);
      for (let x = 30; x < W; x += 92) stripes.push(x + r() * 8);
      for (let x = 0; x < W; x += 120) scallops.push(x);
      let lastStep = -1;

      const drawBack = (t) => {
        const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
        let fill = '', soft = '', red = '', light = '', inkd = '', hatch = '';
        if (setting === 'tent') {
          // back cloth with stripes
          const cloth = [[-40, valY], [W + 40, valY], [W + 40, gy], [-40, gy]];
          fill += inkLoop(cloth, O(1, { smooth: false })) + ' ';
          stripes.forEach((x, i) => { soft += inkPath([[x, valY + 20], [x + 4, gy - 6]], O(10 + i, { w: i % 2 ? 2.5 : 4 })) + ' '; });
          // canopy: sagging top between poles + scalloped valance
          const p0 = W * 0.04, p1 = W * 0.96;
          const cx0 = W * 0.44;   // the left drape covers the top-left corner (brand + kicker stay on plain cloth)
          inkd += inkPath([[cx0, topY + 6], [W * 0.5, topY - 18], [W * 0.75, topY + 10], [W + 40, topY + 40]], O(2, { w: 7 })) + ' ';
          let sc = '';
          scallops.forEach((x, i) => {
            if (x < cx0 - 20) return;
            const pts = []; for (let j = 0; j <= 6; j++) { const u = j / 6; pts.push([x + u * 120, valY - 30 + Math.sin(u * Math.PI) * 34]); }
            sc += inkPath(pts, O(40 + i, { w: 5 })) + ' ';
            if (i % 2 === 0) red += inkLoop([[x + 4, valY - 30], [x + 116, valY - 30], ...pts.slice().reverse()], O(70 + i, { amp: 1 })) + ' ';
          });
          inkd += sc + inkPath([[cx0, valY - 32], [W + 40, valY - 32]], O(3, { w: 5 })) + ' ';
          light += inkLoop([[cx0, topY + 6], [W * 0.5, topY - 18], [W * 0.75, topY + 10], [W + 40, topY + 40], [W + 40, valY - 32], [cx0, valY - 32]], O(4)) + ' ';
          // poles
          [p0, p1].forEach((x, i) => { inkd += inkPath([[x, topY - 30], [x + 2, gy + 6]], O(5 + i, { w: 11 })) + ' ' + inkDot(x, topY - 34, 12, 12, sd + 7 + i, t) + ' '; });
          // tied-back drapes at the frame edges
          [[0, 1], [W, -1]].forEach(([x, d], i) => {
            const dr = i === 0 ? [[x - 20, -30], [W * 0.5, -30], [W * 0.42, valY + 40], [W * 0.06, gy * 0.62], [W * 0.07, gy], [x - 20, gy]]
                               : [[x, valY - 30], [x + d * W * 0.1, valY - 30], [x + d * W * 0.04, gy * 0.62], [x + d * W * 0.07, gy], [x, gy]];
            light += inkLoop(dr, O(20 + i, { smooth: false })) + ' ';
            inkd += inkPath(dr.slice(0, 4), O(22 + i, { w: 5 })) + ' ' + inkPath([[x + d * W * 0.012, gy * 0.6], [x + d * W * 0.055, gy * 0.64]], O(24 + i, { w: 8 })) + ' ';
            for (let j = 1; j < 4; j++) soft += inkPath([[x + d * W * 0.025 * j, valY], [x + d * W * 0.012 * j, gy * 0.6], [x + d * W * 0.02 * j, gy - 10]], O(26 + i * 4 + j, { w: 2.5 })) + ' ';
          });
          // rug
          const rx0 = W * 0.2, rx1 = W * 0.84, rt = gy - 8, rb = Math.min(H - 110, gy + 80);
          const rug = [[rx0 + 30, rt], [rx1 - 30, rt], [rx1, rb], [rx0, rb]];
          rugF.setAttribute('d', inkLoop(rug, O(30, { smooth: false })));
          let rr = '';
          for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9, cx = lerp(rx0 + 30, rx1 - 30, u) + (u - 0.5) * 40, cy = (rt + rb) / 2; rr += inkLoop([[cx - 22, cy], [cx, cy - 18], [cx + 22, cy], [cx, cy + 18]], O(80 + i, { smooth: false, amp: 1 })) + ' '; }
          rugR.setAttribute('d', rr);
          rugInk.setAttribute('d', inkPath(rug, O(31, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[rx0 + 50, rt + 14], [rx1 - 50, rt + 14]], O(32, { w: 3 })) + ' ' + inkPath([[rx0 + 20, rb - 14], [rx1 - 20, rb - 14]], O(33, { w: 3 })));
        } else {
          // palace: arcade + columns + floor tiles + curtain behind the throne
          const wallT = topY - 10, archB = gy - 20, n = 4, aw = W / n;
          for (let i = 0; i < n; i++) {
            const x0 = i * aw + aw * 0.14, x1 = (i + 1) * aw - aw * 0.14, cx = (x0 + x1) / 2, rr = (x1 - x0) / 2, top = wallT + 140;
            const arch = [[x0, archB]]; for (let j = 0; j <= 10; j++) { const a = Math.PI - j * Math.PI / 10; arch.push([cx + Math.cos(a) * rr, top + rr - Math.sin(a) * rr]); } arch.push([x1, archB]);
            fill += inkLoop(arch, O(100 + i, { amp: 1 })) + ' ';
            soft += inkPath(arch, O(110 + i, { w: 4 })) + ' ';
          }
          for (let i = 0; i <= n; i++) {
            const x = i * aw, col = [[x - 26, wallT + 120], [x + 26, wallT + 120], [x + 22, archB], [x - 22, archB]];
            light += inkLoop(col, O(120 + i, { smooth: false })) + ' ';
            inkd += inkPath(col, O(130 + i, { w: 4.5, closed: true, smooth: false })) + ' ' + inkPath([[x - 40, wallT + 118], [x + 40, wallT + 118]], O(140 + i, { w: 8 })) + ' ';
          }
          inkd += inkPath([[-40, wallT], [W + 40, wallT + 4]], O(150, { w: 6 })) + ' ' + inkPath([[-40, archB], [W + 40, archB - 4]], O(151, { w: 5 })) + ' ';
          for (let i = 0; i < 14; i++) soft += inkPath([[i * W / 13 - 40, archB + 4], [i * W / 13 - 120 + (i - 6.5) * 30, H + 20]], O(160 + i, { w: 2.5 })) + ' ';
          soft += inkPath([[-40, gy + 40], [W + 40, gy + 36]], O(180, { w: 2.5 })) + ' ';
          // red curtain behind the throne
          const cw = 230 * ts, ct = wallT + 60;
          const cur = [[tx - cw, ct], [tx + cw, ct], [tx + cw * 0.92, daisY], [tx + cw * 0.7, daisY - 40], [tx - cw * 0.7, daisY - 40], [tx - cw * 0.92, daisY]];
          red += inkLoop(cur, O(190, { smooth: false })) + ' ';
          inkd += inkPath(cur, O(191, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[tx - cw - 30, ct], [tx + cw + 30, ct]], O(192, { w: 9 })) + ' ';
          for (let j = -2; j <= 2; j++) soft += inkPath([[tx + j * cw * 0.33, ct + 10], [tx + j * cw * 0.3, daisY - 44]], O(193 + j, { w: 3 })) + ' ';
          if (P.shadow) {
            const a = (P.shadow.from ?? 0.74) * W, b = (P.shadow.to ?? 1) * W;
            for (let y = wallT + 140; y < gy - 20; y += 34) for (let x = a + ((y / 34) % 2) * 20; x < b; x += 46) hatch += inkPath([[x, y + 14], [x + 22, y - 8]], O(200 + Math.round(x + y), { w: 3, amp: 1 })) + ' ';
          }
          rugF.setAttribute('d', ''); rugR.setAttribute('d', ''); rugInk.setAttribute('d', '');
        }
        bgFill.setAttribute('d', fill); bgSoft.setAttribute('d', soft); bgRed.setAttribute('d', red); bgLight.setAttribute('d', light); bgInk.setAttribute('d', inkd); hatchE.setAttribute('d', hatch);
        // throne: two-step dais + tall back
        const s1 = [[tx - 250 * ts, gy - step1], [tx + 250 * ts, gy - step1], [tx + 256 * ts, gy + 4], [tx - 256 * ts, gy + 4]];
        const s2 = [[tx - 190 * ts, daisY], [tx + 190 * ts, daisY], [tx + 196 * ts, gy - step1], [tx - 196 * ts, gy - step1]];
        const bw = 110 * ts, bt = daisY - 420 * ts;
        const bk = [[tx - bw, daisY], [tx - bw, bt + 60 * ts], [tx - bw * 0.6, bt + 10 * ts], [tx, bt - 20 * ts], [tx + bw * 0.6, bt + 10 * ts], [tx + bw, bt + 60 * ts], [tx + bw, daisY]];
        const panel = [[tx - bw * 0.7, daisY - 60 * ts], [tx - bw * 0.7, bt + 80 * ts], [tx, bt + 30 * ts], [tx + bw * 0.7, bt + 80 * ts], [tx + bw * 0.7, daisY - 60 * ts]];
        throneF.setAttribute('d', inkLoop(s1, O(300, { smooth: false })) + ' ' + inkLoop(s2, O(301, { smooth: false })) + ' ' + inkLoop(bk, O(302)));
        throneR.setAttribute('d', inkLoop(panel, O(303)));
        throneInk.setAttribute('d', inkPath(s1, O(304, { w: 5, closed: true, smooth: false })) + ' ' + inkPath(s2, O(305, { w: 5, closed: true, smooth: false })) + ' ' +
          inkPath(bk, O(306, { w: 6 })) + ' ' + inkPath(panel, O(307, { w: 3.5 })) + ' ' + inkPath([[tx, bt - 20 * ts], [tx, bt - 56 * ts]], O(308, { w: 5 })));
        const gold = inkDot(tx, bt - 66 * ts, 16 * ts, 16 * ts, sd + 309, t) + ' ' + inkDot(tx - bw, bt + 50 * ts, 11 * ts, 11 * ts, sd + 310, t) + ' ' + inkDot(tx + bw, bt + 50 * ts, 11 * ts, 11 * ts, sd + 311, t);
        throneGold.setAttribute('d', gold);
      };

      // kneeling captive: local units (ground under the knee = 0, +x forward, up = -y), mapped with face/scale
      function captive(lt, t, cues) {
        const cov = P.cover && document.documentElement.classList.contains('cover') ? P.cover : null;
        const s = k0 * (C.scale || 1) * ((cov && cov.captive_scale) || 1), fc = C.face || 1, cx = ((cov && cov.captive_x) ?? C.x) * W, cy = gy;
        const X = q => [cx + fc * s * q[0], cy + s * q[1]];
        const bowAt = atOr(cues, C.bow, null), freeAt = atOr(cues, C.free, null);
        const bow = bowAt == null ? 0 : bowAt < 0 ? 1 : sm((lt - bowAt) / 0.7);
        const fr = freeAt == null ? 0 : sm((lt - freeAt) / 0.5);
        const br = Math.sin(t * 2.1), sway = Math.sin(t * 0.8) * 2;
        const lean = 6 + bow * 22 + br * 1.2 - fr * 8, tilt = bow * 16 - fr * 10 + Math.sin(t * 0.9) * 2;
        const hip = [sway, -100 + br * 1.4], knee = [34, -4], foot = [-84, -6], heel = [-96, -2];
        const up = rot([0, -1], lean), hu = rot([0, -1], lean + tilt);
        const sho = [hip[0] + up[0] * 112, hip[1] + up[1] * 112], neck = [hip[0] + up[0] * 132, hip[1] + up[1] * 132];
        const hc = [neck[0] + hu[0] * 84, neck[1] + hu[1] * 84];
        const Hh = (x, y) => { const v = rot([x, y], lean + tilt); return [hc[0] + v[0], hc[1] + v[1]]; };
        // hands: bound together in front (wrists crossed) -> resting on the thighs when free
        const bound = [[sho[0] + 64, sho[1] + 96], [sho[0] + 74, sho[1] + 104]], rest = [[58, -116], [44, -104]];
        const hands = bound.map((b, i) => [lerp(b[0], rest[i][0], fr), lerp(b[1], rest[i][1], fr)]);
        const elbows = [[sho[0] + 18, sho[1] + 74], [sho[0] + 6, sho[1] + 80]];
        const O = (k, w, x) => Object.assign({ w: w * s, seed: sd + 500 + k, t, amp: 1.6 }, x);
        const L = pts => pts.map(X);
        let body = inkPath(L([hip, knee, foot]), O(1, 7)) + ' ' + inkPath(L([foot, heel]), O(2, 7)) + ' ' +
          inkPath(L([hip, [hip[0] + up[0] * 66, hip[1] + up[1] * 66], neck, [neck[0] + hu[0] * 14, neck[1] + hu[1] * 14]]), O(3, 7, { taper: 0.1 })) + ' ';
        hands.forEach((h, i) => { body += inkPath(L([sho, elbows[i], h]), O(4 + i, 7)) + ' '; const w = X(h); body += inkDot(w[0], w[1], 10.5 * s, 10 * s, sd + 520 + i, t) + ' '; });
        body += inkLoop(inkEllipsePts(X([-90, -2])[0], X([-90, -2])[1], 20 * s, 9 * s, sd + 530, 8), { seed: sd + 530, t, amp: 0.8 }) + ' ';
        // head
        const hp = inkEllipsePts(0, 0, 72, 70, sd + 540, 14).map(q => X(Hh(q[0], q[1])));
        cap.head.setAttribute('d', inkLoop(hp, { seed: sd + 540, t, amp: 1.4 }));
        body += inkPath(hp, O(6, 6, { closed: true, amp: 1.4 })) + ' ';
        cap.body.setAttribute('d', body);
        // face: worried brows, eyes looking down when bowed, flat sad mouth
        let fd = '';
        const look = bow * 6 - fr * 4;
        [-1, 1].forEach((sd2, i) => {
          const e = X(Hh(12 + sd2 * 22, 8 + look));
          fd += inkDot(e[0], e[1], 7.5 * s, 8 * s, sd + 550 + i, t, 0.6) + ' ';
          const inner = Hh(12 + sd2 * 9, -24 - (fr ? 0 : 3)), outer = Hh(12 + sd2 * 34, -12), midp = Hh(12 + sd2 * 21, -20);
          fd += inkPath(L([inner, midp, outer]), O(10 + i, 4.5, { amp: 0.8, taper: 0.5 })) + ' ';
        });
        const mth = [Hh(0, 40), Hh(15, 36 - fr * 4), Hh(30, 40)];
        fd += inkPath(L(mth), O(12, 4.5, { amp: 0.6, taper: 0.4 }));
        cap.face.setAttribute('d', fd);
        // crown, a little askew
        if (C.crown) {
          const cp = CROWN.map(q => { const v = rot([q[0], q[1] + 4], C.askew ?? 8); return X(Hh(v[0], v[1])); });
          cap.crownF.setAttribute('d', inkLoop(cp, { seed: sd + 560, t }));
          let cr = inkPath(cp, O(13, 5.5, { closed: true }));
          [[-34, -66], [6, -66], [44, -66]].forEach((q, i) => { const v = rot(q, C.askew ?? 8), j = X(Hh(v[0], v[1])); cr += ' ' + inkDot(j[0], j[1], 6 * s, 6 * s, sd + 570 + i, t); });
          cap.crownR.setAttribute('d', cr);
        }
        // chains: cuffs on the wrists + a chain hanging to an iron ring on a stake; on `free` the links fall away
        if (C.chains) {
          const cuffs = bound.map((b, i) => { const h = hands[i]; return inkLoop(inkEllipsePts(X(h)[0], X(h)[1], 15 * s, 12 * s, sd + 580 + i, 8), { seed: sd + 580 + i, t, amp: 0.8 }); }).join(' ');
          cap.cuffs.setAttribute('d', cuffs);
          const ring = [150, -18], a = hands[0], links = 9;
          let ch = '';
          const tf = freeAt == null ? -1 : lt - freeAt;
          for (let i = 0; i <= links; i++) {
            const u = i / links;
            let q = [lerp(a[0], ring[0], u), lerp(a[1], ring[1], u) + Math.sin(u * Math.PI) * 46 + Math.sin(t * 2 + u * 3) * 3];
            let alpha = 1;
            if (tf >= 0) { const g = Math.max(0, tf - u * 0.08); q = [q[0] + (u - 0.5) * 60 * g, Math.min(-6, q[1] + 900 * g * g)]; alpha = 1 - clamp01((tf - 0.6) / 0.6); }
            if (alpha <= 0.02) continue;
            const w = X(q);
            ch += inkPath(inkEllipsePts(w[0], w[1], (i % 2 ? 13 : 9) * s, (i % 2 ? 8 : 12) * s, sd + 600 + i, 8, (i * 37) % 180), { w: 4.5 * s, seed: sd + 600 + i, t, amp: 0.7, closed: true }) + ' ';
          }
          const st = X([150, 0]), st2 = X([150, -34]);
          ch += inkPath([st, st2], O(20, 9)) + ' ' + inkCircle(X(ring)[0], X(ring)[1], 16 * s, sd + 620, t, { w: 5 * s });
          cap.chain.setAttribute('d', ch);
          if (tf >= 0) { const cfo = 1 - clamp01((tf - 0.2) / 0.4); cap.cuffs.setAttribute('fill-opacity', cfo); }
        }
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const isCover = document.documentElement.classList.contains('cover');
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const CAM = P.cam || {}, foc = CAM.focus || [0.5, 0.55];
          const z = lerp(1, CAM.zoom || 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = foc[0] * W, fy = foc[1] * H;
          const CV = isCover && P.cover ? P.cover : null;   // thumbnail framing (optional)
          if (CV) {
            const cf = CV.focus || foc, cz = CV.zoom || 1.3;
            cam.setAttribute('transform', `translate(${f1(cf[0] * W)} ${f1(cf[1] * H)}) scale(${cz.toFixed(4)}) translate(${f1(-cf[0] * W)} ${f1(-cf[1] * H)})`);
          } else
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 5)} ${f1(fy + Math.cos(lt * 0.27) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          if (redraw || lt < 0.05) drawBack(t);

          // swaying lamp (tent)
          if (setting === 'tent' && P.lamp !== false) {
            const Lp = P.lamp || {}, lx = (Lp.x ?? 0.5) * W, ly0 = topY - 10, len = (portrait ? 260 : 210) * (Lp.len || 1);
            const a = Math.sin(t * 1.1) * 0.06, bx = lx + Math.sin(a) * len, by = ly0 + Math.cos(a) * len;
            const O = k => ({ seed: sd + 700 + k, t, amp: 1.2 });
            lampE.setAttribute('d', inkPath([[lx, ly0], [bx, by]], Object.assign(O(1), { w: 3.5 })) + ' ' +
              inkPath([[bx - 38, by], [bx + 38, by], [bx + 22, by + 26], [bx - 22, by + 26]], Object.assign(O(2), { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[bx - 26, by], [bx - 12, by - 22], [bx + 12, by - 22], [bx + 26, by]], Object.assign(O(3), { w: 4 })));
            const fl = 1 + 0.15 * Math.sin(t * 13) + 0.1 * Math.sin(t * 7.3);
            lampF.setAttribute('d', inkLoop([[bx + 30, by + 2], [bx + 44, by - 30 * fl], [bx + 52, by + 2]], { seed: sd + 710, t, amp: 0.8 }) + ' ' + inkLoop([[bx - 30, by + 2], [bx - 44, by - 26 * fl], [bx - 52, by + 2]], { seed: sd + 711, t, amp: 0.8 }));
          }
          // tuğ: pole, gold ball and a swaying horse-tail
          if (setting === 'tent' && P.tug !== false) {
            const tg = P.tug || {}, x = (tg.x ?? 0.9) * W, top = gy - (portrait ? 700 : 600);
            let soft = '';
            for (let i = 0; i < 9; i++) {
              const dx = (i - 4) * 9, sw = Math.sin(t * 1.4 + i * 0.5) * 10;
              soft += inkPath([[x + dx * 0.4, top + 46], [x + dx + sw * 0.5, top + 110], [x + dx * 1.3 + sw, top + 190 + (i % 3) * 14]], { w: 6, seed: sd + 730 + i, t, amp: 1, taper: 0.5 }) + ' ';
            }
            tugSoft.setAttribute('d', soft);
            tugInk.setAttribute('d', inkPath([[x, top], [x + 2, gy + 4]], { w: 9, seed: sd + 720, t, amp: 1.2 }) + ' ' + inkPath([[x - 22, top + 44], [x + 22, top + 44]], { w: 8, seed: sd + 721, t, amp: 1 }));
            tugGold.setAttribute('d', inkDot(x, top - 12, 20, 20, sd + 722, t) + ' ' + inkDot(x, top - 50, 8, 10, sd + 723, t));
          }
          // figures
          figs.forEach((F, i) => {
            const f = F.f, o = seqOpts(f, cues, lt, -1);
            const x = f.x * W, y = gy - (f.lift || 0);
            const ret = F.rig.update(t + i * 0.37, o.pose, Object.assign({ x, y }, o));
            if (F.spear) {
              const sc = k0 * (f.scale || 0.95), h = ret.hands[1], wx = x + o.face * sc * h[0], wy = y + sc * h[1];
              F.spear.setAttribute('d', inkPath([[wx + o.face * 6, y + 4], [wx + o.face * 2, wy - 420 * sc]], { w: 7, seed: sd + 760 + i, t, amp: 1 }) + ' ' +
                inkLoop([[wx + o.face * 2 - 14, wy - 420 * sc], [wx + o.face * 2, wy - 480 * sc], [wx + o.face * 2 + 14, wy - 420 * sc]], { seed: sd + 770 + i, t, amp: 0.8 }));
            }
          });
          // ruler on the throne
          const ro = seqOpts(T, cues, lt, -1);
          const rret = ruler.update(t, ro.pose, Object.assign({ x: tx + (ro.pose === 'sit' ? 10 * ro.face : 0), y: daisY }, ro));
          if (crownDrop) {
            const a = atOr(cues, T.crown.at, dur * 0.5), p = lt >= a ? sm((lt - a) / 0.9) : 0, rs = ts * 0.95;
            const hc = [tx + (ro.pose === 'sit' ? 10 * ro.face : 0) + ro.face * rs * rret.head[0], daisY + rs * rret.head[1]];
            const lift = (1 - p) * 260, pk = punch(lt, a + 0.9, 0.5);
            const X = q => [hc[0] + ro.face * rs * q[0], hc[1] + rs * (q[1] + 6) - lift];
            const cp = CROWN.map(X);
            crownDrop.F.setAttribute('d', inkLoop(cp, { seed: sd + 780, t }));
            crownDrop.R.setAttribute('d', inkPath(cp, { w: 5.5 * rs, seed: sd + 781, t, amp: 1.5, closed: true }));
            crownDrop.J.setAttribute('d', [[-34, -66], [6, -66], [44, -66]].map((q, i) => { const j = X(q); return inkDot(j[0], j[1], 6 * rs, 6 * rs, sd + 782 + i, t); }).join(' '));
            // sparkle ticks when it lands
            let sp = '';
            if (pk > 0.02) for (let i = 0; i < 6; i++) { const ang = i * Math.PI / 3 - Math.PI / 2, c = X([0, -90]), r0 = 110 * rs, r1 = r0 + 60 * rs * pk; sp += inkPath([[c[0] + Math.cos(ang) * r0, c[1] + Math.sin(ang) * r0], [c[0] + Math.cos(ang) * r1, c[1] + Math.sin(ang) * r1]], { w: 6, seed: sd + 790 + i, t, amp: 0.6 }) + ' '; }
            crownDrop.S.setAttribute('d', sp);
          }
          if (cap) captive(lt, t, cues);
          // mark
          if (markT && CV && CV.mark === false) markT.setAttribute('opacity', 0);
          else if (markT) {
            const a = atOr(cues, M.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 800, t, 1.6);
            markT.setAttribute('opacity', clamp01(p * 2));
            markT.setAttribute('transform', `translate(${f1(W * (M.x ?? 0.58) + b[0])} ${f1(H * (M.y ?? 0.3) + b[1] + Math.sin(t * 2) * 6)}) rotate(${f1(-6 + Math.sin(t * 1.3) * 3)}) scale(${lerp(0.4, 1, p).toFixed(3)})`);
          }
          // narrator
          if (kas) {
            const o = seqOpts(K, cues, lt, 1);
            o.alpha = isCover && P.cover_hide !== false ? 0 : 1;
            let kx = K.x * W, ky = H * (K.y ?? (gy / H));
            if (CV && CV.kasif) {           // cover.kasif: the shot's own narrator, re-placed for the thumbnail
              const CK = CV.kasif;
              o.alpha = 1; o.pose = CK.pose || o.pose; o.since = 1.5; o.prev = null; o.mix = null;
              o.emotion = CK.emotion || (o.pose === 'shock' ? 'surprised' : o.emotion); o.face = CK.face ?? o.face; o.dir = dirOf(CK.dir ?? o.dir);
              o.scale = (CK.scale || K.scale) / K.scale; kx = (CK.x ?? K.x) * W; ky = (CK.y ?? (ky / H)) * H;
            }
            kas.update(t, o.pose, Object.assign({ x: kx, y: ky }, o));
          }
        },
      };
    },
  };
})();
