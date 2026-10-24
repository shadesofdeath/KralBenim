// an_letters: two rulers' war of letters in the parchment ink style (BRAND.md §3, §5). Written for the Ankara 1402
// long video (scene 11: Bayezid and Timur trade insulting letters), parametric. On the left and the right a ruler
// (KASIF rig, hatless, one accessory, beard colour) sits on a carpet beside a low table, his banner (pennant on a pole)
// waving behind him. Sealed scrolls (red wax seal) fly between them in arcs: each one lands in the receiver's hands,
// opens into a sheet covered in red scribbles, a big red "!" bursts above it, the receiver's brows turn angry and he
// jolts; the sheet then drops onto the pile on his table (the pile grows). `storm` sends many scrolls at once.
// The narrator (Kaşif) stands in the middle under the arcs and ducks (shock) whenever a scroll flies over his head,
// turning towards the side it is heading to.
// P: {
//   left:  {accessory: "turban", beard: "black", name: "Bayezid", color: "blue" (banner), x: 0.2, scale: 0.95},
//   right: {accessory: "turban", beard: "grey", name: "Timur", color: "red", x: 0.8, scale: 0.95},
//   throws: [{from: "left"|"right", at: cue|sec, dur: 0.95 (flight)}],
//   storm: {at: cue|sec, n: 8, gap: 0.17} (many scrolls from both sides; each lands on a pile with a small "!"),
//   ground: 0.8 (0..1 H), arc: 0.24 (apex height, 0..1 H from the top),
//   kasif: {x: 0.5, scale: 0.8, pose: "talk", face: 1, emotion, duck: true, seq: [{at, pose, dir, face, emotion}]} | false,
//   labels: [{text, x, y (0..1), at, size: 60, color: "ink"|"red"|"blue"}] (names are printed by default above the
//            rulers; set left.name / right.name to "" to hide),
//   hit: cue (punch), cam: {zoom: 1.05, focus: [0.5, 0.55]}
// }
// cues: whatever names the params reference. Everything is a pure function of (seed, lt, cues): no Math.random.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const tc = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);
  const FR = 'Fraunces, Georgia, serif';
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, gold: INK.gold, soft: INK.inkSoft };
  const colOf = (c, fb) => COL[c] || fb || INK.ink;
  const DIRS = { up: 70, down: -38, forward: 8 };
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rot = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  function painter(parent) {
    const els = [];
    return function paint(strokes, t, sd) {
      let k = 0;
      const get = () => { const e = els[k] || (els[k] = inkEl(parent)); k++; e.style.display = ''; return e; };
      for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!s || !s.p || s.p.length < 2) continue;
        const base = { seed: sd + i * 7, t, amp: s.amp ?? 1.3, smooth: s.sm !== 0 };
        if (s.f) { const e = get(); e.setAttribute('fill', s.f); e.setAttribute('fill-opacity', s.fo ?? 1); e.setAttribute('d', inkLoop(s.p, base)); }
        if (s.w !== 0) {
          const e = get(); e.setAttribute('fill', s.col || INK.ink); e.setAttribute('fill-opacity', s.o ?? 1);
          e.setAttribute('d', inkPath(s.p, Object.assign({}, base, { w: s.w ?? 5, closed: !!s.c, taper: s.taper ?? 0.3 })));
        }
      }
      for (let j = k; j < els.length; j++) els[j].style.display = 'none';
    };
  }
  // rolled scroll, centred, length ~110 x 34 (local), rotated by ang
  function scrollStrokes(cx, cy, ang, s = 1) {
    const T = q => { const r = rot([q[0] * s, q[1] * s], ang); return [cx + r[0], cy + r[1]]; };
    const body = [[-50, -15], [50, -15], [50, 15], [-50, 15]].map(T);
    const e1 = inkEllipsePts(0, 0, 7, 16, 3, 8).map(q => T([q[0] - 52, q[1]])), e2 = inkEllipsePts(0, 0, 7, 16, 4, 8).map(q => T([q[0] + 52, q[1]]));
    return [
      { p: body, c: 1, f: INK.paperLight, w: 4, sm: 0 },
      { p: e1, c: 1, f: INK.paperDark, w: 3.5 }, { p: e2, c: 1, f: INK.paperDark, w: 3.5 },
      { p: [[-8, -15], [-8, 15]].map(T), w: 3, col: INK.red },
      { p: inkEllipsePts(0, 0, 10, 10, 6, 8).map(q => T([q[0] - 8, q[1] + 4])), c: 1, f: INK.red, w: 0 },
    ];
  }

  SH.an_letters = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const gy = (P.ground ?? (portrait ? 0.56 : 0.8)) * H;
      const L = Object.assign({ accessory: 'turban', beard: 'black', name: 'Bayezid', color: 'blue', x: portrait ? 0.2 : 0.18, scale: portrait ? 0.7 : 0.95 }, P.left || {});
      const R = Object.assign({ accessory: 'turban', beard: 'grey', name: 'Timur', color: 'red', x: portrait ? 0.8 : 0.82, scale: portrait ? 0.7 : 0.95 }, P.right || {});
      const K0 = P.kasif === false ? null : Object.assign({ x: 0.5, scale: portrait ? 0.62 : 0.8, pose: 'talk', face: 1, duck: true }, P.kasif || {});
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bgG = el(cam, 'g'), paintBg = painter(bgG);
      const sides = [L, R].map((S, i) => {
        const f = i === 0 ? 1 : -1, x = S.x * W;
        const g = el(cam, 'g');
        const backG = el(g, 'g'), paintBack = painter(backG);
        const rig = KASIF.create(el(g, 'g'), { scale: S.scale, hat: false, accessory: S.accessory || null, beard: S.beard || null, seed: seed + 11 + i * 9 });
        const frontG = el(g, 'g'), paintFront = painter(frontG);
        let name = null;
        if (S.name) {
          name = el(g, 'text', { 'font-family': INK_FONT, 'font-size': S.size || (portrait ? 54 : 62), 'text-anchor': 'middle', fill: colOf(S.color, INK.ink),
            style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
          name.textContent = S.name;
        }
        return { S, f, x, g, paintBack, rig, paintFront, name, i, tableX: x + f * 250 * S.scale };
      });
      // flights
      const flights = [];
      (P.throws || []).forEach((th, j) => flights.push({ from: th.from === 'right' ? 1 : 0, at: th.at, dur: th.dur || 0.95, open: true, j }));
      if (P.storm) {
        const n = P.storm.n || 8;
        for (let j = 0; j < n; j++) flights.push({ from: j % 2, at: { base: P.storm.at, off: j * (P.storm.gap ?? 0.17) }, dur: 0.8 + (j % 3) * 0.08, open: false, storm: true, j: 100 + j });
      }
      const flyG = el(cam, 'g'), paintFly = painter(flyG);
      const cardG = el(cam, 'g'), paintCard = painter(cardG);
      const bangs = [0, 1].map(() => {
        const t = el(cardG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 130 : 170, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = '!';
        return t;
      });
      const kg = el(cam, 'g'), groundK = inkEl(kg, INK.inkSoft);
      const krig = K0 ? KASIF.create(el(kg, 'g'), { scale: K0.scale, hat: true, seed: seed + 5 }) : null;
      const labs = (P.labels || []).map(Lb => {
        const t = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': Lb.size || 60, 'text-anchor': 'middle', fill: colOf(Lb.color, INK.ink),
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        t.textContent = Lb.text;
        return { Lb, t };
      });
      const atOf = (a, cues, fb) => (a && typeof a === 'object') ? tc(a.base, cues, fb) + a.off : tc(a, cues, fb);
      const handPt = sd => [sd.x + sd.f * 120 * sd.S.scale, gy - 150 * sd.S.scale];
      const apexY = (P.arc ?? (portrait ? 0.2 : 0.24)) * H;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const C = P.cam || {}, pin = spring(lt, 0, 0.7), hitAt = tc(P.hit, cues, null);
          const z = lerp(1, C.zoom || 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.035 * punch(lt, hitAt, 0.6));
          const fx = (C.focus || [0.5, 0.55])[0] * W, fy = (C.focus || [0.5, 0.55])[1] * H;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.3) * 4)} ${f1((1 - pin) * 40)}) translate(${f1(fx)} ${f1(fy)}) scale(${f1(z * 1000) / 1000}) translate(${f1(-fx)} ${f1(-fy)})`);
          // ground + background tent cloth line
          const bg = [];
          bg.push({ p: [[-40, gy + 6], [W * 0.3, gy + 2], [W * 0.7, gy + 8], [W + 40, gy + 3]], w: 5 });
          for (let i = 0; i < 9; i++) { const x = W * (0.04 + i * 0.12) + Math.sin(i * 3.1) * 20; bg.push({ p: [[x, gy + 28 + (i % 2) * 18], [x + 60, gy + 26 + (i % 2) * 18]], w: 3, col: INK.inkSoft, o: 0.7 }); }
          paintBg(bg, t, seed * 7);
          // flights state
          const recv = [0, 0], lastHit = [-9, -9], pile = [0, 0];
          const cards = [], fly = [];
          let duck = null;
          flights.forEach(fl => {
            const a = atOf(fl.at, cues, 0.6), d = fl.dur, src = sides[fl.from], dst = sides[1 - fl.from];
            if (lt < a) return;
            const u = clamp01((lt - a) / d), p0 = handPt(src), p1 = handPt(dst);
            const apex = fl.storm ? apexY + ((fl.j * 37) % 5) * 26 : apexY;
            if (u < 1) {
              const x = lerp(p0[0], p1[0], u), y = (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * (2 * apex - (p0[1] + p1[1]) / 2) + u * u * p1[1];
              fly.push(...scrollStrokes(x, y, (src.f) * u * 540 + (fl.j * 40), fl.storm ? 0.8 : 1));
              if (Math.abs(u - 0.5) < 0.36) duck = { since: lt - (a + d * 0.14), face: dst.f * -1 };
            } else {
              const ta = a + d, s = lt - ta, side = 1 - fl.from;
              if (s < 0.5) recv[side] = Math.max(recv[side], 1);
              lastHit[side] = Math.max(lastHit[side], ta);
              if (fl.open && s < 1.5) cards.push({ side, s, j: fl.j });
              else pile[side]++;
              if (!fl.open) cards.push({ side, s, j: fl.j, mini: true });
            }
          });
          paintFly(fly, t, seed * 13);
          // rulers
          sides.forEach(sd => {
            const S = sd.S, s = lt - lastHit[sd.i], jolt = s >= 0 && s < 0.6 ? Math.sin(Math.min(1, s / 0.3) * Math.PI) * 14 * Math.exp(-s * 3) : 0;
            // sender: arm thrust (blend sit -> point) shortly before each of his own throws
            let thrust = 0;
            flights.forEach(fl => { if (fl.from !== sd.i) return; const a = atOf(fl.at, cues, 0.6), q = lt - (a - 0.3); if (q > 0 && q < 0.65) thrust = Math.max(thrust, Math.sin(Math.PI * q / 0.65)); });
            const angry = lastHit[sd.i] > -9 && lt >= lastHit[sd.i] + 0.1;
            const o = { x: sd.x, y: gy - jolt, face: sd.f, since: 1, dir: 35, emotion: angry ? 'angry' : (S.emotion || null), mouth: 0 };
            if (thrust > 0.01) { o.prev = { pose: 'sit', since: 1 }; o.mix = 0.62 * thrust; sd.rig.update(t, 'point', o); }
            else sd.rig.update(t, 'sit', o);
            // banner behind, carpet under, table + pile in front
            const bx = sd.x - sd.f * 150 * S.scale, top = gy - 560 * S.scale, wv = Math.sin(t * 4 + sd.i) * 8, wv2 = Math.sin(t * 4 + sd.i + 1.1) * 12;
            const col = colOf(S.color, INK.blue);
            sd.paintBack([
              { p: [[bx, gy], [bx + 2, top]], w: 7 },
              { p: [[bx, top + 4], [bx + sd.f * 90, top + 14 + wv], [bx + sd.f * 170, top + 34 + wv2], [bx + sd.f * 92, top + 62 + wv], [bx, top + 76]], c: 1, f: col, w: 4 },
              { p: inkEllipsePts(bx, top - 10, 10, 10, 3, 8), c: 1, f: INK.gold, w: 3 },
              { p: inkEllipsePts(sd.x + sd.f * 30, gy + 6, 190 * S.scale, 26 * S.scale, 5 + sd.i, 14), c: 1, f: INK.paperDark, w: 4 },
            ], t, seed * 17 + sd.i * 40);
            const tx = sd.tableX, tw = 110 * S.scale, th = 105 * S.scale, fr = [];
            fr.push({ p: [[tx - tw, gy - th], [tx + tw, gy - th - 2], [tx + tw + 8, gy - th + 18], [tx - tw - 8, gy - th + 20]], c: 1, f: INK.paperLight, w: 4, sm: 0 });
            fr.push({ p: [[tx - tw + 14, gy - th + 18], [tx - tw + 18, gy]], w: 6 }, { p: [[tx + tw - 14, gy - th + 18], [tx + tw - 18, gy]], w: 6 });
            const n = Math.min(12, pile[sd.i]);
            for (let k = 0; k < n; k++) {
              const row = k < 5 ? 0 : k < 9 ? 1 : k < 11 ? 2 : 3, inRow = row === 0 ? k : row === 1 ? k - 5 : row === 2 ? k - 9 : 0, cnt = [5, 4, 2, 1][row];
              const cx = tx + (inRow - (cnt - 1) / 2) * 34 * S.scale, cy = gy - th - 16 * S.scale - row * 26 * S.scale;
              fr.push(...scrollStrokes(cx, cy, 90 + (k % 3 - 1) * 8, 0.55 * S.scale));
            }
            sd.paintFront(fr, t, seed * 19 + sd.i * 60);
            if (sd.name) {
              const la = tc(S.name_at, cues, 0.2), s2 = spring(lt, la, 0.6);
              sd.name.style.display = lt >= la ? '' : 'none';
              sd.name.setAttribute('transform', `translate(${f1(sd.x + sd.f * 110 * S.scale)} ${f1(gy - 540 * S.scale)}) rotate(-3) scale(${f1(lerp(0.6, 1, s2) * 1000) / 1000})`);
            }
          });
          // opened letters: sheet with red scribbles + "!" above the receiver
          const cs = [];
          const bangOn = [false, false];
          cards.forEach(c => {
            const sd = sides[c.side], hp = handPt(sd), S = sd.S;
            if (c.mini) {   // storm: a small red burst at the pile
              if (c.s < 0.45) { const q = c.s / 0.45, r = 20 + 50 * q, cx = sd.tableX, cy = gy - 150 * S.scale; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + c.j; cs.push({ p: [[cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], w: 4, col: INK.red, o: 1 - q }); } }
              if (c.s < 0.5) bangOn[c.side] = true;
              return;
            }
            const op = clamp01(c.s / 0.3), drop = clamp01((c.s - 1.2) / 0.3);
            const cw = 120 * S.scale * op, chh = 82 * S.scale, cx = lerp(sd.x + sd.f * 300 * S.scale, sd.tableX, drop), cy = lerp(gy - 330 * S.scale, gy - 150 * S.scale, drop);
            const sk = 1 - drop * 0.7;
            cs.push({ p: [[cx - cw * sk, cy - chh * sk], [cx + cw * sk, cy - chh * sk - 3], [cx + cw * sk + 3, cy + chh * sk], [cx - cw * sk + 2, cy + chh * sk + 2]], c: 1, f: INK.paperLight, w: 4, sm: 0 });
            cs.push({ p: inkEllipsePts(cx - cw * sk, cy, 8 * sk, chh * sk + 6, 3, 8), c: 1, f: INK.paperDark, w: 3 }, { p: inkEllipsePts(cx + cw * sk, cy, 8 * sk, chh * sk + 6, 4, 8), c: 1, f: INK.paperDark, w: 3 });
            if (op > 0.5 && drop < 0.6) for (let r = 0; r < 3; r++) {
              const yy = cy - chh * 0.5 * sk + r * chh * 0.5 * sk, pr = clamp01((c.s - 0.2 - r * 0.1) / 0.3), pts = [];
              for (let k = 0; k <= 10 * pr; k++) pts.push([cx - cw * 0.8 * sk + k * cw * 0.16 * sk, yy + ((k + r) % 2 ? -10 : 10) * sk]);
              if (pts.length > 1) cs.push({ p: pts, w: 7, col: INK.red, sm: 0 });
            }
            if (c.s > 0.2 && c.s < 1.3) bangOn[c.side] = true;
          });
          paintCard(cs, t, seed * 23);
          bangs.forEach((b, i) => {
            const sd = sides[i], la = lastHit[i] + 0.2, pk = punch(lt, la, 0.6);
            b.style.display = bangOn[i] ? '' : 'none';
            const s = (1 + 0.5 * pk) * spring(lt, la, 0.4);
            b.setAttribute('transform', `translate(${f1(sd.x + sd.f * 440 * sd.S.scale)} ${f1(gy - 330 * sd.S.scale)}) rotate(${f1(sd.f * 8 + Math.sin(t * 9) * 3)}) scale(${f1(Math.max(0.01, s) * 1000) / 1000})`);
          });
          // narrator
          if (krig) {
            const kx = K0.x * W, ky = gy + (portrait ? 40 : 60);
            const segs = [{ at: -1, pose: K0.pose, dir: K0.dir, face: K0.face, emotion: K0.emotion }];
            (K0.seq || []).forEach(s => { const a = tc(s.at, cues, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const dirOf = d => typeof d === 'number' ? d : DIRS[d] ?? 12;
            let o = { x: kx, y: ky, face: faceOf(s.face ?? K0.face, 1), since, dir: dirOf(s.dir ?? K0.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K0.emotion || null), mouth: 0 };
            let pose = s.pose || 'talk';
            if (pv && since < 0.35) { o.prev = { pose: pv.pose || 'idle', since: since + 1, dir: dirOf(pv.dir ?? K0.dir), emotion: pv.emotion }; o.mix = since / 0.35; }
            if (K0.duck !== false && duck) { pose = 'shock'; o = { x: kx, y: ky, face: duck.face, since: Math.max(0, duck.since), emotion: 'surprised', mouth: 0 }; }
            groundK.setAttribute('d', inkPath([[kx - 130, ky + 4], [kx, ky + 7], [kx + 130, ky + 3]], { seed: seed + 71, t, w: 5 }));
            krig.update(t, pose, o);
          }
          labs.forEach(({ Lb, t: te }) => {
            const la = tc(Lb.at, cues, 0.3), s2 = spring(lt, la, 0.6);
            te.style.display = lt >= la ? '' : 'none';
            te.setAttribute('transform', `translate(${f1(Lb.x * W)} ${f1(Lb.y * H)}) rotate(-3) scale(${f1(lerp(0.6, 1, s2) * 1000) / 1000})`);
          });
        },
      };
    },
  };
})();
