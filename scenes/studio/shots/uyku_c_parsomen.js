// uyku_c_parsomen: parchment ink shots for 04-uykusuz-kalsak, chapters "Uykusuzluk öldürür mü?" and "Randy'ye ne
// oldu?" (brand/kit/BRAND.md §3, §5: every line boils at 8 Hz via _ink.js; pure functions of (seed, lt)).
//
// SHOTS.uyku_c_lab — Rechtschaffen's sleep lab, drawn respectfully and abstractly (no animal suffering).
//   mode "cage": a pinned day card on the wall fills with tally marks (one per day) while a calm, abstract rat sits on a
//     round platform in a wire cage on a table; on `hit` days [from, to] get a red ring and a red note pops.
//     P: {mode: "cage", days: 21, ring: [14, 21], note: "2–3 hafta", header: "Gün", cage_x: 0.56, dim: true,
//         cast: [...]}   cues: hit (ring + note)
//   mode "signs": three pinned cards side by side: a bowl whose food heap grows (up arrow), a dial scale whose needle
//     falls (down arrow) and a thermometer whose mercury drops (down arrow).
//     P: {mode: "signs", cards: [{icon: "bowl"|"scale"|"thermo", text: "Yemek", dir: "up"|"down", color: "green"|"red", at}],
//         cast: [...]}   cues: card "at" names (c0, c1, c2)
// SHOTS.uyku_c_head — big side-view head (facing right) with the brain inside and a small thalamus deep in the
//   middle that glows, sleep "Z"s above the head; on `hit` the thalamus turns red and cracks, the signals to the cortex
//   and the Z's fade; on `genes` a DNA double helix is drawn on the right with a green note.
//   P: {label: {text: "Talamus", at: "talamus"}, genes: {text: "genlerle gelir", at: "genlerle"}, cast: [...]}
//   cues: talamus, hit, genlerle
// SHOTS.uyku_c_bed — a bedroom.
//   mode "bed": night window with moon, a young man asleep under the blanket, rising Z's, a wall clock spinning fast and
//     a counter ("14+ saat"); on `hit` the window turns to morning, the blanket is thrown back and the sleeper (rig)
//     stands up beside the bed and walks out to the right.
//     P: {mode: "bed", counter: {to: 14, suffix: "+", unit: "saat"}, sleeper: {tag: "Randy"}, cast: [...]}   cues: hit
//   mode "morning": a big window where the sun rises over hills (rays turn, birds fly), a made bed, and hand-drawn pill
//     words that pop on their cues.
//     P: {mode: "morning", words: [{text, at, color: "blue"|"red"|"green"}], cast: [...]}
// SHOTS.uyku_c_clock24 — a hand-drawn 24-hour dial (00 at the top) with a sweeping hand; on `hit` the night slice
//   [from, to] is hatched in blue with a moon and a big blue note, on `third` a red "~1/3" note with an arrow.
//   P: {night: [23, 7], hours: {text: "7–9 saat", at: "hit"}, third: {text: "~1/3", sub: "uykuda", at: "third"}, cast}
//
// cast (all shots): [{who: "kasif"|name, x, y, scale, face: "left"|"right", pose, at, then, dir, emotion, emotion0,
//   seq: [{at, pose, dir, emotion}], to (walk target, reached on `at`), coat: true (white lab coat), tag: "Name",
//   hair: true (young, no hat)}]
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft };
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const rrect = (x, y, w, h, r) => {
    const p = [], n = 4;
    const cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = (a0 + 90 * i / n) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return p;
  };
  const seg = (a, b, n = 6) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const partial = (pts, p) => { const n = Math.max(2, Math.round(pts.length * clamp01(p))); return pts.slice(0, n); };
  function text(parent, s, size, font, fill, extra = {}) {
    const t = el(parent, 'text', Object.assign({ 'font-family': font, 'font-size': size, 'text-anchor': 'middle', fill,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: ${Math.round(size * 0.16)}px; stroke-linejoin: round` }, extra));
    t.textContent = s;
    return t;
  }
  const place = (node, x, y, sp, rot, b) => {
    node.setAttribute('opacity', clamp01(sp * 2).toFixed(3));
    node.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(rot)}) scale(${lerp(0.55, 1, sp).toFixed(3)})`);
  };
  // drawable: a path whose d is recomputed each frame from a points function
  function D(parent, fill, extra) { const n = mk(parent, fill, extra); return n; }
  const line = (node, pts, o) => node.setAttribute('d', inkPath(pts, o));
  const fillD = (node, pts, o) => node.setAttribute('d', inkLoop(pts, o));
  function arrowPts(x, y, len, dir) {   // vertical arrow centred on (x, y): dir 1 = up, -1 = down
    const y0 = y + dir * len / 2, y1 = y - dir * len / 2, h = 26;
    return { shaft: seg([x, y0], [x, y1], 4), head: [[x - h, y1 + dir * h], [x, y1], [x + h, y1 + dir * h]] };
  }

  // ---------------------------------------------------------------- cast (Kaşif + period figures)
  function makeCast(list, parent, seed, defScale) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = (m.scale ?? 1) * defScale;
      const g = el(parent, 'g');
      const coatG = el(g, 'g');
      const rig = typeof KASIF !== 'undefined' ? KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), seed: seed + 7 + i * 13 }) : null;
      const over = el(g, 'g');
      const c = { m, isK, sc, rig, g, steps: null,
        coatF: m.coat ? mk(coatG, INK.paperLight) : null, coatR: m.coat ? mk(coatG) : null,
        hair: m.hair ? mk(over) : null, tag: null, tagU: null };
      const st = [{ at: -99, pose: m.pose || 'idle', dir: m.dir0 ?? m.dir, emotion: m.emotion0 || null }];
      if (m.at != null) st.push({ at: m.at, pose: m.then || 'point', dir: m.dir, emotion: m.emotion });
      for (const s of m.seq || []) st.push(s);
      c.steps = st;
      if (m.tag) {
        c.tag = text(over, m.tag, m.tag_size || 54, INK_FONT, INK.ink);
        c.tagU = mk(over, INK.red);
      }
      return c;
    });
  }
  function updateCast(cast, lt, t, dur, cues, W, H, G, sd) {
    cast.forEach((c, ci) => {
      if (!c.rig) return;
      const m = c.m;
      const steps = c.steps.map(s => Object.assign({}, s, { T: s.at === -99 ? -99 : atOr(cues, s.at, null) })).filter(s => s.T != null).sort((a, b) => a.T - b.T);
      let k = 0; for (let i = 0; i < steps.length; i++) if (lt >= steps[i].T) k = i;
      const cur = steps[k], prev = steps[Math.max(0, k - 1)];
      const pose = cur.pose, since = cur.T === -99 ? lt : lt - cur.T;
      const atWalk = atOr(cues, m.at, dur);
      const moving = m.to != null && (m.pose === 'walk' || m.pose === 'run');
      let x = (m.x ?? 0.8) * W;
      if (moving) x = lerp(x, m.to * W, sm(clamp01(lt / Math.max(0.3, atWalk))));
      const y = m.y != null ? m.y * H : G;
      const face = m.face === 'left' ? -1 : 1;
      const dir = typeof cur.dir === 'number' ? cur.dir : DIRS[cur.dir] ?? 30;
      const emo = cur.emotion || (pose === 'shock' ? 'surprised' : null);
      const o = { x, y, face, since, dir, text: cur.text || m.text, item: cur.item || m.item, emotion: emo };
      if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
      if (k > 0 && since < 0.32) { o.prev = { pose: prev.pose, since: 1, dir: typeof prev.dir === 'number' ? prev.dir : DIRS[prev.dir] ?? 30, ph: o.ph }; o.mix = since / 0.32; }
      const fade = m.fade_in != null ? clamp01((lt - atOr(cues, m.fade_in, 0)) / 0.3) : 1;
      c.g.setAttribute('opacity', fade.toFixed(3));
      const r = c.rig.update(t, pose, o) || {};
      const s = c.sc, W2 = q => [x + face * s * q[0], y + s * q[1]];
      const hc = r.head || [0, -440], hip = r.hip || [0, -188];
      const O = (kk, xx) => Object.assign({ seed: sd + ci * 300 + kk, t, amp: 1 }, xx);
      if (c.coatF) {   // white lab coat: shoulders to below the hip, behind the limbs
        const sh = [hc[0] * 0.7 + hip[0] * 0.3, hc[1] + 104];
        const P = [[sh[0] - 44, sh[1]], [sh[0] + 44, sh[1]], [hip[0] + 70, hip[1] + 92], [hip[0] - 66, hip[1] + 96]].map(W2);
        fillD(c.coatF, P, O(1, { smooth: false }));
        const lap = [W2([sh[0] - 22, sh[1]]), W2([sh[0] + 2, sh[1] + 70]), W2([sh[0] + 26, sh[1]])];
        c.coatR.setAttribute('d', inkPath(P, O(1, { w: 4.5, closed: true, smooth: false })) + ' ' + inkPath(lap, O(2, { w: 3.5, smooth: false })) + ' ' +
          inkDot(...W2([sh[0] + 6, sh[1] + 110]), 5 * s, 5 * s, sd + ci * 300 + 3, t) + ' ' + inkDot(...W2([sh[0] + 8, sh[1] + 160]), 5 * s, 5 * s, sd + ci * 300 + 4, t));
      }
      if (c.hair) {    // short young hair tuft on top of the head
        const hp = [[-62, -30], [-40, -62], [-6, -74], [30, -70], [60, -44]].map(q => W2([hc[0] + q[0], hc[1] + q[1]]));
        c.hair.setAttribute('d', inkPath(hp, O(5, { w: 10 })) + ' ' + inkPath([W2([hc[0] + 4, hc[1] - 72]), W2([hc[0] + 22, hc[1] - 92])], O(6, { w: 7 })));
      }
      if (c.tag) {
        const ta = atOr(cues, m.tag_at, 0.15), sp = spring(lt, ta, 0.6), b = boil(sd + ci * 300 + 20, t, 1);
        const hw = W2(hc), hx = hw[0], hy = hw[1] - 150 * s;
        c.tag.setAttribute('opacity', clamp01(sp * 2));
        c.tag.setAttribute('transform', `translate(${f1(hx + b[0])} ${f1(hy + b[1])}) rotate(-3) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
        const tw = c.tag.getComputedTextLength ? c.tag.getComputedTextLength() : 200, pu = prog(lt, ta + 0.2, 0.4);
        c.tagU.setAttribute('d', pu > 0.01 ? inkPath([[hx - tw / 2, hy + 18], [hx - tw / 2 + tw * pu, hy + 13]], O(21, { w: 5 })) : '');
      }
    });
  }
  const drift = (t, root, W, H, lt, dur, zoom = 0.03) => {
    const z = 1 + zoom * sm(lt / Math.max(dur, 1));
    root.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 7 + W / 2)} ${f1(Math.cos(t * 0.23) * 6 + H / 2)}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
  };
  function ground(parent, W, gy, seed) {
    const n = mk(parent), band = mk(parent, INK.paperDark, { 'fill-opacity': 0.35 });
    const pts = []; for (let x = -60; x <= W + 60; x += 120) pts.push([x, gy + 4 + Math.sin(x * 0.013 + seed) * 4]);
    return t => { line(n, pts, { seed: seed + 1, t, w: 6, amp: 1.4 }); fillD(band, [...pts, [W + 60, gy + 46], [-60, gy + 46]], { seed: seed + 2, t, amp: 1, smooth: false }); };
  }
  function card(parent, x, y, w, h, seed, pin = INK.red) {
    const g = el(parent, 'g'), sh = mk(g, INK.ink, { 'fill-opacity': 0.16 }), f = mk(g, INK.paperLight), r = mk(g), p = mk(g, pin);
    const pts = rrect(x, y, w, h, 18);
    return { g, draw(t) {
      fillD(sh, pts.map(q => [q[0] + 8, q[1] + 10]), { seed, t, amp: 1.2 });
      fillD(f, pts, { seed: seed + 1, t, amp: 1.2 });
      line(r, pts, { seed: seed + 1, t, w: 3.5, closed: true, amp: 1.2 });
      p.setAttribute('d', inkDot(x + w / 2, y + 14, 12, 12, seed + 3, t));
    } };
  }

  // ================================================================ uyku_c_lab
  SH.uyku_c_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 31, gy = P.ground_y ?? 0.76 * H;
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const gnd = ground(back, W, gy, sd);
      const cast = makeCast(P.cast, actors, sd, 1);
      const mode = P.mode || 'cage';
      let upd;
      if (mode === 'cage') {
        const days = P.days ?? 21, ring = P.ring || [14, 21];
        const cx = (P.cage_x ?? 0.56) * W;
        // wall card with tally marks
        const cw = 860, chh = 230, cxL = cx - cw / 2 + 20, cyT = 0.1 * H;
        const cd = card(back, cxL, cyT, cw, chh, sd + 10);
        const head = text(cd.g, '', 52, FR, INK.ink, { 'font-weight': 800, 'text-anchor': 'start' });
        const marks = mk(cd.g), ringN = mk(cd.g, INK.red);
        const note = text(ui, P.note || '2–3 hafta', 84, INK_FONT, INK.red);
        const noteU = mk(ui, INK.red);
        const groups = Math.ceil(days / 5), gw = (cw - 200) / Math.max(groups, 4.4);
        const mx0 = cxL + 160, my0 = cyT + 80, mh = 110;
        const markPts = i => {
          const g = Math.floor(i / 5), j = i % 5, gx = mx0 + g * gw;
          if (j < 4) return [[gx + j * 26, my0], [gx + j * 26 + 2, my0 + mh]];
          return [[gx - 14, my0 + mh - 14], [gx + 26 * 3 + 16, my0 + 16]];
        };
        const rx0 = markPts(ring[0] - 1)[0][0] - 30, rx1 = markPts(ring[1] - 1)[1][0] + 34;
        const ringPts = inkEllipsePts((rx0 + rx1) / 2, my0 + mh / 2, (rx1 - rx0) / 2, mh / 2 + 34, sd + 40, 40, -0.02, 0.02);
        // table + cage
        const tY = gy - 190, tW = 520;
        const table = mk(mid), tableF = mk(mid, INK.paperDark, { 'fill-opacity': 0.6 });
        const cageF = mk(mid, INK.paperLight, { 'fill-opacity': 0.55 }), cage = mk(mid), bottle = mk(mid, INK.blue, { 'fill-opacity': 0.35 }), bottleR = mk(mid);
        const ratG = el(mid, 'g'), ratF = mk(ratG, INK.paperLight), ratR = mk(ratG), ratD = mk(ratG), platF = mk(mid, INK.paperDark), platR = mk(mid);
        mid.insertBefore(platF, ratG); mid.insertBefore(platR, ratG);
        const cgW = 400, cgH = 230, cgX = cx - cgW / 2, cgY = tY - cgH;
        upd = (lt, dur, cues, t) => {
          cd.draw(t);
          const hit = atOr(cues, 'hit', dur * 0.7);
          const n = Math.min(days, Math.floor(days * clamp01((lt - 0.3) / Math.max(0.5, hit - 0.5)) + 1e-6));
          head.textContent = `${P.header || 'Gün'} ${Math.max(1, n)}`;
          head.setAttribute('x', cxL + 26); head.setAttribute('y', cyT + 66);
          let d = '';
          for (let i = 0; i < n; i++) d += inkPath(markPts(i), { seed: sd + 100 + i, t, w: 7, amp: 1.3 }) + ' ';
          marks.setAttribute('d', d);
          const pr = prog(lt, hit, 0.7);
          ringN.setAttribute('d', pr > 0.02 ? inkPath(partial(ringPts.concat([ringPts[0], ringPts[1]]), pr), { seed: sd + 41, t, w: 8 }) : '');
          const sp = spring(lt, hit + 0.35, 0.6), b = boil(sd + 50, t, 1.2);
          const nx = cx + cw / 2 - 150, ny = cyT + chh + 96;
          place(note, nx, ny, sp, -3, b);
          const tw = note.getComputedTextLength ? note.getComputedTextLength() : 300, pu = prog(lt, hit + 0.6, 0.4);
          noteU.setAttribute('d', pu > 0.01 ? inkPath([[nx - tw / 2, ny + 22], [nx - tw / 2 + tw * pu, ny + 16]], { seed: sd + 51, t, w: 6 }) : '');
          // table
          line(table, [[cx - tW / 2, tY], [cx + tW / 2, tY]], { seed: sd + 60, t, w: 7 });
          table.setAttribute('d', table.getAttribute('d') + ' ' + inkPath([[cx - tW / 2 + 40, tY], [cx - tW / 2 + 46, gy]], { seed: sd + 61, t, w: 7 }) + ' ' +
            inkPath([[cx + tW / 2 - 40, tY], [cx + tW / 2 - 46, gy]], { seed: sd + 62, t, w: 7 }));
          fillD(tableF, rect(cx - tW / 2, tY, tW, 18), { seed: sd + 63, t, amp: 1, smooth: false });
          // cage: tray, arched top, bars
          const top = [];
          for (let i = 0; i <= 16; i++) { const u = i / 16; top.push([cgX + u * cgW, cgY + 30 - Math.sin(u * Math.PI) * 30]); }
          fillD(cageF, [...top, [cgX + cgW, tY], [cgX, tY]], { seed: sd + 70, t, amp: 1 });
          let cg = inkPath(top, { seed: sd + 71, t, w: 6 }) + ' ' + inkPath(rect(cgX - 10, tY - 34, cgW + 20, 34), { seed: sd + 72, t, w: 6, closed: true, smooth: false });
          for (let i = 0; i <= 12; i++) { const u = i / 12, x = cgX + u * cgW; cg += ' ' + inkPath([[x, cgY + 30 - Math.sin(u * Math.PI) * 30], [x, tY - 34]], { seed: sd + 80 + i, t, w: 3.2, amp: 1 }); }
          cage.setAttribute('d', cg);
          const bx = cgX + cgW - 40, by = cgY + 40;
          fillD(bottle, rrect(bx - 18, by, 36, 110, 12), { seed: sd + 90, t, amp: 1 });
          bottleR.setAttribute('d', inkPath(rrect(bx - 18, by, 36, 110, 12), { seed: sd + 90, t, w: 4, closed: true, amp: 1 }) + ' ' +
            inkPath([[bx - 4, by + 110], [bx - 12, by + 140]], { seed: sd + 91, t, w: 4 }));
          // platform + calm abstract rat (gentle breathing; dims softly after the ring)
          const px = cx - 30, py = tY - 70;
          const plat = inkEllipsePts(px, py, 110, 22, sd + 92, 18, 0, 0.02);
          fillD(platF, plat, { seed: sd + 93, t, amp: 1 });
          platR.setAttribute('d', inkPath(plat, { seed: sd + 93, t, w: 4.5, closed: true, amp: 1 }) + ' ' + inkPath([[px, py + 22], [px, tY - 34]], { seed: sd + 94, t, w: 6 }));
          const br = 1 + Math.sin(t * 2.6) * 0.03, rx = px - 6, ry = py - 34;
          const body = inkEllipsePts(rx, ry, 64, 30 * br, sd + 95, 16, 0, 0.03);
          const headC = [rx + 62, ry - 10];
          fillD(ratF, body, { seed: sd + 96, t, amp: 1 });
          ratF.setAttribute('d', ratF.getAttribute('d') + ' ' + inkCircle(headC[0], headC[1], 24, sd + 97, t, { fill: true, amp: 1 }) + ' ' + inkCircle(headC[0] - 8, headC[1] - 24, 12, sd + 98, t, { fill: true, amp: 0.8 }));
          const tail = []; for (let i = 0; i <= 10; i++) { const u = i / 10; tail.push([rx - 62 - u * 90, ry + 14 + Math.sin(u * 3 + t * 1.5) * 10 - u * 6]); }
          ratR.setAttribute('d', inkPath(body, { seed: sd + 96, t, w: 5, closed: true, amp: 1 }) + ' ' + inkCircle(headC[0], headC[1], 24, sd + 97, t, { w: 5, amp: 1 }) + ' ' +
            inkCircle(headC[0] - 8, headC[1] - 24, 12, sd + 98, t, { w: 4, amp: 0.8 }) + ' ' + inkPath(tail, { seed: sd + 99, t, w: 4, taper: 0.7 }));
          ratD.setAttribute('d', inkDot(headC[0] + 8, headC[1] - 4, 4.5, 4.5, sd + 101, t) + ' ' + inkDot(headC[0] + 24, headC[1] + 2, 5, 4, sd + 102, t));
          ratG.setAttribute('opacity', P.dim === false ? 1 : lerp(1, 0.4, prog(lt, hit + 1.2, 1.5)).toFixed(3));
        };
      } else {
        // signs: three pinned cards
        const cards = (P.cards || [{ icon: 'bowl', text: 'Yemek', dir: 'up', color: 'green', at: 'c0' }, { icon: 'scale', text: 'Kilo', dir: 'down', color: 'red', at: 'c1' },
          { icon: 'thermo', text: 'Isı', dir: 'down', color: 'red', at: 'c2' }]);
        const cw = 380, chh = 500, y0 = 0.12 * H, xs = P.xs || [0.2, 0.43, 0.66];
        const items = cards.map((c, i) => {
          const x = xs[i] * W - cw / 2, g = el(mid, 'g');
          const cd = card(g, x, y0, cw, chh, sd + 200 + i * 20, COL[c.color] || INK.red);
          const iconF = mk(g, INK.paperDark), iconF2 = mk(g, COL[c.color] || INK.red), iconR = mk(g);
          const word = text(g, c.text, 76, FR, INK.ink, { 'font-weight': 900 });
          const arr = mk(g, COL[c.color] || INK.red);
          return { c, g, x, cd, iconF, iconF2, iconR, word, arr, i };
        });
        upd = (lt, dur, cues, t) => {
          for (const it of items) {
            const { c, x, i } = it, at = atOr(cues, c.at, 0.3 + i * 1.2), sp = spring(lt, at - 0.25, 0.6), b = boil(sd + 300 + i, t, 0.8);
            const cxm = x + cw / 2, cym = y0 + chh / 2;
            it.g.setAttribute('opacity', clamp01(sp * 2).toFixed(3));
            it.g.setAttribute('transform', `translate(${f1(cxm + b[0])} ${f1(cym + b[1] + (1 - sp) * 60)}) rotate(${f1((i - 1) * 2.2)}) translate(${-cxm} ${-cym})`);
            it.cd.draw(t);
            const p = prog(lt, at, 1.6), O = (k, xx) => Object.assign({ seed: sd + 400 + i * 40 + k, t, amp: 1.2 }, xx);
            const ix = cxm, iy = y0 + 210;
            if (c.icon === 'bowl') {
              const bowl = []; for (let k = 0; k <= 14; k++) { const a = Math.PI * k / 14; bowl.push([ix - Math.cos(a) * 130, iy + 30 + Math.sin(a) * 80]); }
              const hh = lerp(14, 120, p), heap = [];
              for (let k = 0; k <= 12; k++) { const u = k / 12; heap.push([ix - 120 + u * 240, iy + 30 - Math.sin(u * Math.PI) * hh - (k % 2 ? 10 : 0) * Math.min(1, hh / 40)]); }
              fillD(it.iconF2, [...heap, [ix + 120, iy + 32], [ix - 120, iy + 32]], O(1, { smooth: true }));
              it.iconF2.setAttribute('fill', INK.gold);
              fillD(it.iconF, [...bowl], O(2));
              it.iconR.setAttribute('d', inkPath(heap, O(1, { w: 4.5 })) + ' ' + inkPath(bowl.concat([bowl[0]]), O(2, { w: 6, smooth: false })));
            } else if (c.icon === 'scale') {
              const bx = ix - 130, by = iy - 70, bw = 260, bh = 200;
              fillD(it.iconF, rrect(bx, by, bw, bh, 26), O(3));
              const dc = [ix, iy + 0], R = 70, ang = lerp(40, -60, p) * Math.PI / 180;
              const dial = inkEllipsePts(dc[0], dc[1], R, R, sd + 410 + i, 20, 0, 0.01);
              let d = inkPath(rrect(bx, by, bw, bh, 26), O(3, { w: 6, closed: true })) + ' ' + inkPath(dial, O(4, { w: 5, closed: true }));
              for (let k = 0; k <= 6; k++) { const a = (-70 + k * 23.3) * Math.PI / 180; d += ' ' + inkPath([[dc[0] + Math.sin(a) * (R - 8), dc[1] - Math.cos(a) * (R - 8)], [dc[0] + Math.sin(a) * (R - 22), dc[1] - Math.cos(a) * (R - 22)]], O(10 + k, { w: 3.5 })); }
              it.iconR.setAttribute('d', d);
              it.iconF2.setAttribute('d', inkPath([dc, [dc[0] + Math.sin(ang) * (R - 14), dc[1] - Math.cos(ang) * (R - 14)]], O(5, { w: 7 })) + ' ' + inkDot(dc[0], dc[1], 9, 9, sd + 420 + i, t));
              fillD(it.iconF, rrect(bx, by, bw, bh, 26), O(3));
            } else {
              const tx = ix, top = iy - 110, bot = iy + 60, r = 44;
              const tube = [[tx - 22, bot], [tx - 22, top + 22], [tx - 12, top], [tx + 12, top], [tx + 22, top + 22], [tx + 22, bot]];
              const lvl = lerp(top + 34, bot - 50, p);
              fillD(it.iconF, rect(tx - 22, top + 10, 44, bot - top), O(6, { smooth: false }));
              it.iconF2.setAttribute('d', inkLoop(rect(tx - 10, lvl, 20, bot - lvl + 10), O(7, { smooth: false })) + ' ' + inkCircle(tx, bot + r - 8, r - 10, sd + 430 + i, t, { fill: true, amp: 1 }));
              let d = inkPath(tube, O(6, { w: 6 })) + ' ' + inkCircle(tx, bot + r - 8, r, sd + 431 + i, t, { w: 6, amp: 1 });
              for (let k = 0; k < 6; k++) { const yy = top + 40 + k * 26; d += ' ' + inkPath([[tx + 26, yy], [tx + 50, yy]], O(20 + k, { w: 3.5 })); }
              const flake = [[tx - 90, top + 30], [tx - 70, top + 90]];
              d += ' ' + inkPath([[tx - 100, top + 40], [tx - 60, top + 40]], O(30, { w: 3.5 })) + ' ' + inkPath([[tx - 80, top + 20], [tx - 80, top + 60]], O(31, { w: 3.5 })) + ' ' +
                inkPath([[tx - 94, top + 26], [tx - 66, top + 54]], O(32, { w: 3.5 })) + ' ' + inkPath([[tx - 94, top + 54], [tx - 66, top + 26]], O(33, { w: 3.5 }));
              void flake;
              it.iconR.setAttribute('d', d);
            }
            const wy = y0 + chh - 70;
            it.word.setAttribute('x', cxm - 30); it.word.setAttribute('y', wy);
            const ww = it.word.getComputedTextLength ? it.word.getComputedTextLength() : 180;
            const pa = prog(lt, at + 0.15, 0.5), dir = c.dir === 'down' ? -1 : 1;
            const a = arrowPts(cxm - 30 + ww / 2 + 50, wy - 26, 90, dir);
            const yo = (1 - pa) * dir * 30;
            it.arr.setAttribute('opacity', pa.toFixed(3));
            it.arr.setAttribute('d', inkPath(a.shaft.map(q => [q[0], q[1] + yo]), O(40, { w: 9 })) + ' ' + inkPath(a.head.map(q => [q[0], q[1] + yo]), O(41, { w: 9, smooth: false })));
          }
        };
      }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          drift(t, root, W, H, lt, dur);
          gnd(t);
          upd(lt, dur, cues, t);
          updateCast(cast, lt, t, dur, cues, W, H, gy, sd + 900);
        },
      };
    },
  };

  // ================================================================ uyku_c_head
  SH.uyku_c_head = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 57, gy = 0.76 * H;
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const cast = makeCast(P.cast, actors, sd, 1);
      const HX = (P.head_x ?? 0.33) * W, HY = 0.47 * H, S = P.head_scale ?? 1.05;
      const T = q => [HX + q[0] * S, HY + q[1] * S];
      const prof = [[-230, -60], [-215, -170], [-150, -258], [-40, -298], [80, -284], [180, -222], [230, -132], [246, -62], [252, -22], [292, 30], [264, 50], [258, 80], [276, 100], [258, 118],
        [262, 150], [232, 186], [182, 200], [154, 262], [154, 340], [-110, 340], [-118, 232], [-186, 150], [-228, 60]].map(T);
      const headF = mk(back, INK.paperLight), headR = mk(back);
      const brainF = mk(mid, mix(INK.paperLight, INK.stain, 0.25)), folds = mk(mid, INK.inkSoft), brainR = mk(mid);
      const sig = mk(mid, INK.gold), thF = mk(mid, INK.gold), thH = mk(mid, INK.ink, { 'fill-opacity': 0.8 }), thR = mk(mid);
      const brain = inkEllipsePts(...T([-6, -150]), 205 * S, 128 * S, sd + 3, 26, -0.06, 0.05);
      const foldL = [0, 1, 2, 3, 4].map(k => { const p = []; for (let i = 0; i <= 8; i++) { const u = i / 8; p.push(T([-170 + u * 330, -230 + k * 34 + Math.sin(u * 9 + k * 2) * 12 + (k === 0 ? 30 * Math.sin(u * Math.PI) : 0)])); } return p; });
      const stem = [T([-30, -50]), T([-40, 20]), T([-58, 110])];
      const TH = T([-20, -122]);
      const zs = [0, 1, 2].map(k => text(ui, 'Z', 80 - k * 16, FR, INK.blue, { 'font-weight': 900 }));
      const lab = P.label || { text: 'Talamus', at: 'talamus' };
      const labT = text(ui, lab.text, 84, INK_FONT, INK.red), labA = mk(ui, INK.red);
      const G = P.genes || { text: 'genlerle gelir', at: 'genlerle' };
      const dnaA = mk(mid, INK.blue), dnaB = mk(mid, INK.green), rungs = mk(mid, INK.inkSoft);
      const gT = text(ui, G.text, 78, INK_FONT, INK.green), gU = mk(ui, INK.green);
      const DX = (P.dna_x ?? 0.63) * W, DY0 = 0.16 * H, DY1 = 0.62 * H;
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          drift(t, root, W, H, lt, dur, 0.04);
          const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.5 }, xx);
          fillD(headF, prof, O(1));
          headR.setAttribute('d', inkPath(prof, O(1, { w: 7, closed: true })) + ' ' + inkDot(...T([210, -30]), 7, 7, sd + 2, t));
          fillD(brainF, brain, O(3));
          brainR.setAttribute('d', inkPath(brain, O(3, { w: 5.5, closed: true })) + ' ' + inkPath(stem, O(4, { w: 12 })));
          folds.setAttribute('d', foldL.map((p, k) => inkPath(p, O(10 + k, { w: 3.5 }))).join(' '));
          const aT = atOr(cues, lab.at, 0.6), hit = atOr(cues, 'hit', dur * 0.4), aG = atOr(cues, G.at, dur * 0.7);
          const dmg = prog(lt, hit, 1.2), glow = 1 + Math.sin(t * 4) * 0.08 * (1 - dmg) + punch(lt, aT, 0.6) * 0.3;
          const thP = inkEllipsePts(TH[0], TH[1], 40 * S * glow, 27 * S * glow, sd + 20, 14, 0.1, 0.06);
          thF.setAttribute('fill', mix(INK.gold, INK.red, dmg));
          fillD(thF, thP, O(20));
          thR.setAttribute('d', inkPath(thP, O(20, { w: 5, closed: true })));
          // cracks + hatching when damaged
          let hd = '';
          if (dmg > 0.02) {
            const cr = [[[-26, -6], [-8, 4], [4, -4], [22, 8]], [[-6, -20], [0, -6], [-4, 10], [6, 22]]];
            hd = cr.map((c, k) => inkPath(partial(c.map(q => [TH[0] + q[0] * S, TH[1] + q[1] * S]), dmg), O(30 + k, { w: 3.5, smooth: false }))).join(' ');
          }
          thH.setAttribute('d', hd);
          // signals from the thalamus to the cortex: dashes running outwards, fading as it is destroyed
          let sd2 = '';
          const alive = 1 - prog(lt, hit + 0.3, 2.5);
          if (alive > 0.02) for (let k = 0; k < 7; k++) {
            const a = -Math.PI * 0.95 + k * Math.PI * 0.9 / 6, len = 150 * S;
            const u0 = ((t * 0.6 + k * 0.37) % 1), u1 = Math.min(1, u0 + 0.22);
            const p0 = [TH[0] + Math.cos(a) * (46 + u0 * len), TH[1] + Math.sin(a) * (30 + u0 * len * 0.62)];
            const p1 = [TH[0] + Math.cos(a) * (46 + u1 * len), TH[1] + Math.sin(a) * (30 + u1 * len * 0.62)];
            if (k / 7 < alive * 1.05) sd2 += inkPath([p0, p1], O(40 + k, { w: 6, amp: 0.8 })) + ' ';
          }
          sig.setAttribute('d', sd2);
          // Z's above the head (deep sleep), fade after the damage
          zs.forEach((z, k) => {
            const ph = ((t * 0.35 + k / 3) % 1), zx = HX + 180 * S + ph * 120 + k * 10, zy = HY - 300 * S - ph * 120;
            const b = boil(sd + 60 + k, t, 1.2);
            z.setAttribute('transform', `translate(${f1(zx + b[0])} ${f1(zy + b[1])}) rotate(${f1(-12 + Math.sin(t + k) * 6)})`);
            z.setAttribute('opacity', (Math.sin(ph * Math.PI) * (1 - prog(lt, hit, 1.2)) * clamp01(lt * 2)).toFixed(3));
          });
          // label + arrow to the thalamus
          const sp = spring(lt, aT, 0.6), lx = (P.label_x ?? 0.11) * W, ly = 0.3 * H;
          place(labT, lx, ly, sp, -4, boil(sd + 70, t, 1));
          const pa = prog(lt, aT + 0.25, 0.5);
          if (pa > 0.01) {
            const ex = TH[0] - 34, ey = TH[1] + 6, sx = lx + 40, sy = ly + 40, mxx = (sx + ex) / 2, myy = Math.max(sy, ey) + 70;
            const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mxx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * myy + u * u * ey]); }
            let d = inkPath(pts, O(71, { w: 6 }));
            if (pa > 0.95) { const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]); d += ' ' + inkPath([[ex - 34 * Math.cos(a - 0.5), ey - 34 * Math.sin(a - 0.5)], [ex, ey], [ex - 34 * Math.cos(a + 0.5), ey - 34 * Math.sin(a + 0.5)]], O(72, { w: 6, smooth: false })); }
            labA.setAttribute('d', d);
          } else labA.setAttribute('d', '');
          // DNA helix, drawn top-down on the genes cue
          const pg = prog(lt, aG, 1.4);
          if (pg > 0.01) {
            const yEnd = lerp(DY0, DY1, pg), A = 70, k2 = 0.018, ph = t * 1.4;
            const sa = [], sb = []; let rd = '';
            for (let y = DY0; y <= yEnd; y += 14) { sa.push([DX + A * Math.sin(y * k2 + ph), y]); sb.push([DX - A * Math.sin(y * k2 + ph), y]); }
            for (let y = DY0 + 10, k = 0; y <= yEnd; y += 30, k++) { const xa = DX + A * Math.sin(y * k2 + ph), xb = DX - A * Math.sin(y * k2 + ph); if (Math.abs(xa - xb) > 14) rd += inkPath([[xa, y], [xb, y]], O(100 + k, { w: 4, amp: 0.8 })) + ' '; }
            if (sa.length > 1) { line(dnaA, sa, O(80, { w: 8, amp: 1 })); line(dnaB, sb, O(81, { w: 8, amp: 1 })); }
            rungs.setAttribute('d', rd);
          } else { dnaA.setAttribute('d', ''); dnaB.setAttribute('d', ''); rungs.setAttribute('d', ''); }
          const sg = spring(lt, aG + 0.8, 0.6), gx = DX, gyy = DY1 + 110;
          place(gT, gx, gyy, sg, -3, boil(sd + 90, t, 1));
          const tw = gT.getComputedTextLength ? gT.getComputedTextLength() : 300, pu = prog(lt, aG + 1.1, 0.4);
          gU.setAttribute('d', pu > 0.01 ? inkPath([[gx - tw / 2, gyy + 22], [gx - tw / 2 + tw * pu, gyy + 16]], O(91, { w: 6 })) : '');
          updateCast(cast, lt, t, dur, cues, W, H, gy, sd + 900);
        },
      };
    },
  };

  // ================================================================ uyku_c_bed
  SH.uyku_c_bed = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 83, gy = 0.76 * H, mode = P.mode || 'bed';
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const gnd = ground(back, W, gy, sd);
      const morning = mode === 'morning';
      const WIN = morning ? { x: 0.34 * W, y: 0.1 * H, w: 0.32 * W, h: 0.42 * H } : { x: 0.17 * W, y: 0.2 * H, w: 0.17 * W, h: 0.29 * H };
      const skyF = mk(back, INK.paperDark), beam = mk(back, INK.gold, { 'fill-opacity': 0 }), sun = mk(back, INK.gold), rays = mk(back, INK.gold), moon = mk(back, INK.paperLight), moonR = mk(back), stars = mk(back, INK.paperLight);
      const hills = mk(back, INK.paperDark), hillsR = mk(back, INK.inkSoft), birds = mk(back), winR = mk(back), sill = mk(back, INK.paperDark);
      const BED = morning ? { x0: 0.74 * W, x1: 0.95 * W, top: gy - 130 } : { x0: 0.43 * W, x1: 0.74 * W, top: gy - 160 };
      const bedF = mk(mid, INK.hat, { 'fill-opacity': 0.55 }), bedR = mk(mid), matF = mk(mid, INK.paperLight), pil = mk(mid, INK.paperLight), pilR = mk(mid);
      const headG = el(mid, 'g'), headF = mk(headG, INK.paperLight), headR = mk(headG);
      const blF = mk(mid, INK.blue, { 'fill-opacity': 0.55 }), blR = mk(mid);
      const zs = [0, 1, 2].map(k => text(ui, 'Z', 72 - k * 14, FR, INK.blue, { 'font-weight': 900 }));
      const clockF = mk(back, INK.paperLight), clockR = mk(back);
      const C = P.counter || { to: 14, suffix: '+', unit: 'saat' };
      const cnt = morning ? null : text(ui, '', 96, FR, INK.gold, { 'font-weight': 900, 'text-anchor': 'start' });
      const words = (P.words || []).map((w, i) => {
        const g = el(ui, 'g'), f = mk(g, COL[w.color] || (i ? INK.red : INK.blue)), r = mk(g);
        const tx = text(g, w.text, 64, FR, INK.paperLight, { 'font-weight': 800, style: '' });
        return { w, g, f, r, tx, i };
      });
      // sleeper rig appears at the cue and walks out (mode bed)
      const sl = P.sleeper || { tag: 'Randy' };
      const castList = (P.cast || []).slice();
      if (!morning) castList.push({ who: 'randy', hair: true, x: (BED.x1 + 110) / W, pose: 'idle', face: 'right', scale: 0.92, tag: sl.tag, tag_at: 0.1, _walk: true });
      const cast = makeCast(castList, actors, sd, 1);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          drift(t, root, W, H, lt, dur);
          gnd(t);
          const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
          const hit = morning ? -9 : atOr(cues, 'hit', dur * 0.6);
          const day = morning ? 1 : prog(lt, hit, 0.9);
          // window
          const w = WIN, wp = rect(w.x, w.y, w.w, w.h);
          skyF.setAttribute('fill', mix(mix(INK.ink, INK.blue, 0.45), mix(INK.paperLight, INK.gold, 0.25), day));
          fillD(skyF, wp, O(1, { smooth: false, amp: 1 }));
          const sunUp = morning ? sm(lt / Math.max(dur, 1)) : day;
          const sx = w.x + w.w * (morning ? 0.5 : 0.62), sy = w.y + w.h * lerp(0.95, morning ? 0.38 : 0.55, sunUp), sr = morning ? 80 : 46;
          const clipY = w.y + w.h * (morning ? 0.72 : 0.86);
          // sun (only the part above the hills), rays
          if (day > 0.02) {
            sun.setAttribute('d', inkCircle(sx, sy, sr, sd + 2, t, { fill: true, amp: 1 }));
            sun.setAttribute('opacity', day.toFixed(3));
            let rd = '';
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * 0.25; rd += inkPath([[sx + Math.cos(a) * (sr + 16), sy + Math.sin(a) * (sr + 16)], [sx + Math.cos(a) * (sr + 46), sy + Math.sin(a) * (sr + 46)]], O(10 + k, { w: 5, amp: 1 })) + ' '; }
            rays.setAttribute('d', rd); rays.setAttribute('opacity', day.toFixed(3));
          } else { sun.setAttribute('d', ''); rays.setAttribute('d', ''); }
          // moon + stars (night)
          const night = 1 - day;
          moon.setAttribute('d', night > 0.02 ? inkCircle(w.x + w.w * 0.3, w.y + w.h * 0.3, 34, sd + 3, t, { fill: true, amp: 1 }) : '');
          moonR.setAttribute('d', night > 0.02 ? inkCircle(w.x + w.w * 0.3, w.y + w.h * 0.3, 34, sd + 3, t, { w: 4, amp: 1 }) : '');
          moon.setAttribute('opacity', night.toFixed(3)); moonR.setAttribute('opacity', night.toFixed(3));
          let st = '';
          if (night > 0.02) for (let k = 0; k < 6; k++) { const x = w.x + w.w * (0.12 + ((k * 0.37) % 0.8)), y = w.y + w.h * (0.12 + ((k * 0.53) % 0.55)), r = 5 + Math.sin(t * 3 + k) * 2; st += inkDot(x, y, r, r, sd + 20 + k, t) + ' '; }
          stars.setAttribute('d', st); stars.setAttribute('opacity', night.toFixed(3));
          // hills inside the window (in front of the sun)
          const hp = []; for (let i = 0; i <= 14; i++) { const u = i / 14; hp.push([w.x + u * w.w, clipY - Math.sin(u * 5.2 + 1) * 26 - Math.sin(u * 2.1) * 30]); }
          fillD(hills, [...hp, [w.x + w.w, w.y + w.h], [w.x, w.y + w.h]], O(30, { amp: 1 }));
          hills.setAttribute('fill', mix(INK.inkSoft, INK.paperDark, day));
          hillsR.setAttribute('d', inkPath(hp, O(30, { w: 4, amp: 1 })));
          // birds (morning)
          let bd = '';
          if (day > 0.5) for (let k = 0; k < (morning ? 4 : 2); k++) {
            const u = ((lt * 0.05 + k * 0.23) % 1), bx = w.x + w.w * (0.1 + u * 0.8), by = w.y + w.h * (0.18 + k * 0.08) + Math.sin(t * 2 + k) * 6, fl = Math.sin(t * 9 + k) * 8;
            bd += inkPath([[bx - 18, by - fl], [bx, by + 4], [bx + 18, by - fl]], O(40 + k, { w: 4, amp: 0.6 })) + ' ';
          }
          birds.setAttribute('d', bd);
          // frame + cross bars + sill
          winR.setAttribute('d', inkPath(wp, O(50, { w: 9, closed: true, smooth: false, amp: 1.2 })) + ' ' + inkPath([[w.x + w.w / 2, w.y], [w.x + w.w / 2, w.y + w.h]], O(51, { w: 7 })) + ' ' +
            inkPath([[w.x, w.y + w.h * 0.45], [w.x + w.w, w.y + w.h * 0.45]], O(52, { w: 7 })));
          fillD(sill, rect(w.x - 30, w.y + w.h, w.w + 60, 26), O(53, { smooth: false, amp: 1 }));
          sill.setAttribute('d', sill.getAttribute('d'));
          // light beam on the floor (morning)
          beam.setAttribute('fill-opacity', (0.16 * day).toFixed(3));
          fillD(beam, [[w.x, w.y + w.h + 26], [w.x + w.w, w.y + w.h + 26], [w.x + w.w * 2.1, gy + 40], [w.x + w.w * 0.4, gy + 40]], O(54, { smooth: false, amp: 1 }));
          // bed: frame, legs, headboard (right), footboard (left), mattress, pillow
          const { x0, x1, top } = BED, bw = x1 - x0;
          const frame = rect(x0, top + 40, bw, 50);
          fillD(bedF, frame, O(60, { smooth: false, amp: 1 }));
          const hbd = [[x1, gy], [x1, top - 120], [x1 + 18, top - 140], [x1 + 46, top - 120], [x1 + 46, gy]];
          const fbd = [[x0, gy], [x0, top - 30], [x0 - 34, top - 30], [x0 - 34, gy]];
          fillD(matF, rect(x0, top, bw, 42), O(61, { smooth: false, amp: 1 }));
          let bd2 = inkPath(frame, O(60, { w: 6, closed: true, smooth: false })) + ' ' + inkPath(rect(x0, top, bw, 42), O(61, { w: 5, closed: true, smooth: false })) + ' ' +
            inkPath(hbd, O(62, { w: 7, smooth: false })) + ' ' + inkPath(fbd, O(63, { w: 7, smooth: false })) + ' ' +
            inkPath([[x0 + 30, top + 90], [x0 + 30, gy]], O(64, { w: 7 })) + ' ' + inkPath([[x1 - 30, top + 90], [x1 - 30, gy]], O(65, { w: 7 }));
          bedR.setAttribute('d', bd2);
          const pp = inkEllipsePts(x1 - 90, top - 14, 80, 28, sd + 66, 14, 0.02, 0.04);
          fillD(pil, pp, O(66)); pilR.setAttribute('d', inkPath(pp, O(66, { w: 5, closed: true })));
          // sleeper's head on the pillow + blanket (breathing); thrown back when he gets up
          const up = morning ? 1 : prog(lt, hit, 0.4), br = Math.sin(t * 1.6) * 5 * (1 - up);
          const hcx = x1 - 100, hcy = top - 52;
          headG.setAttribute('opacity', (1 - up).toFixed(3));
          if (up < 0.99) {
            fillD(headF, inkEllipsePts(hcx, hcy, 50, 48, sd + 70, 12), O(70));
            headR.setAttribute('d', inkCircle(hcx, hcy, 50, sd + 70, t, { w: 6, amp: 1 }) + ' ' +
              inkPath([[hcx - 26, hcy - 4], [hcx - 14, hcy + 2], [hcx - 4, hcy - 4]], O(71, { w: 4 })) + ' ' +
              inkPath([[hcx - 52, hcy - 20], [hcx - 34, hcy - 46], [hcx - 4, hcy - 54], [hcx + 28, hcy - 46], [hcx + 48, hcy - 24]], O(72, { w: 9 })));
          }
          const bl = [], bTop = top - lerp(48, 6, morning ? 1 : up);
          const bx1 = lerp(x1 - 140, x1 - 200, up);
          for (let i = 0; i <= 12; i++) { const u = i / 12; bl.push([x0 + 10 + u * (bx1 - x0 - 10), bTop - Math.sin(u * Math.PI * 1.1) * (morning ? 4 : lerp(26, 6, up)) - br * Math.sin(u * Math.PI)]); }
          const blP = [...bl, [bx1 + 10, top + 30], [bx1 + 4, top + 70], [x0 + 8, top + 72]];
          fillD(blF, blP, O(73, { amp: 1.2 }));
          blR.setAttribute('d', inkPath(blP, O(73, { w: 5, closed: true, amp: 1.2 })) + (morning ? '' : ' ' + inkPath([[x0 + 60, top + 20], [bx1 - 30, top + 16]], O(74, { w: 3, amp: 1 }))));
          zs.forEach((z, k) => {
            const ph = ((t * 0.4 + k / 3) % 1), zx = hcx + 40 + ph * 110, zy = hcy - 80 - ph * 140, b = boil(sd + 80 + k, t, 1.2);
            z.setAttribute('transform', `translate(${f1(zx + b[0])} ${f1(zy + b[1])}) rotate(${f1(-10 + Math.sin(t + k) * 6)})`);
            z.setAttribute('opacity', morning ? 0 : (Math.sin(ph * Math.PI) * (1 - up)).toFixed(3));
          });
          // wall clock spinning fast + counter (bed mode)
          if (!morning) {
            const ccx = 0.57 * W, ccy = 0.2 * H, R = 76;
            fillD(clockF, inkEllipsePts(ccx, ccy, R, R, sd + 90, 18), O(90));
            const sp = lt < hit ? lt : hit, ah = sp * 1.9, am = sp * 22;
            let d = inkCircle(ccx, ccy, R, sd + 90, t, { w: 6, amp: 1 });
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; d += ' ' + inkPath([[ccx + Math.sin(a) * (R - 10), ccy - Math.cos(a) * (R - 10)], [ccx + Math.sin(a) * (R - 22), ccy - Math.cos(a) * (R - 22)]], O(91 + k, { w: 3.5, amp: 0.8 })); }
            d += ' ' + inkPath([[ccx, ccy], [ccx + Math.sin(ah) * 40, ccy - Math.cos(ah) * 40]], O(110, { w: 7, amp: 0.8 })) + ' ' + inkPath([[ccx, ccy], [ccx + Math.sin(am) * 60, ccy - Math.cos(am) * 60]], O(111, { w: 5, amp: 0.8 }));
            clockR.setAttribute('d', d);
            const n = Math.round((C.to ?? 14) * prog(lt, 0.2, Math.max(0.5, hit - 0.4)));
            cnt.textContent = `${n}${n >= (C.to ?? 14) ? (C.suffix ?? '+') : ''} ${C.unit ?? 'saat'}`;
            const b = boil(sd + 120, t, 1), pk = punch(lt, hit - 0.2, 0.5);
            cnt.setAttribute('transform', `translate(${f1(ccx + R + 40 + b[0])} ${f1(ccy + 34 + b[1])}) scale(${(1 + 0.08 * pk).toFixed(3)})`);
          }
          // pill words
          for (const it of words) {
            const at = atOr(cues, it.w.at, 0.5 + it.i), sp = spring(lt, at, 0.6), b = boil(sd + 130 + it.i, t, 1);
            const cx = it.w.x != null ? it.w.x * W : W / 2, cy = it.w.y != null ? it.w.y * H : (morning ? WIN.y + WIN.h + 110 + it.i * 108 : 0.2 * H);
            const tw = it.tx.getComputedTextLength ? it.tx.getComputedTextLength() : 300, pw = tw + 90, ph = 92;
            const pp2 = rrect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
            fillD(it.f, pp2, O(140 + it.i * 3, { amp: 1 })); it.r.setAttribute('d', inkPath(pp2, O(140 + it.i * 3, { w: 4, closed: true, amp: 1 })));
            it.tx.setAttribute('x', cx); it.tx.setAttribute('y', cy + 22);
            it.g.setAttribute('opacity', clamp01(sp * 2).toFixed(3));
            it.g.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(cy + b[1])}) rotate(${f1(it.i ? 2 : -2)}) scale(${lerp(0.5, 1, sp).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy)})`);
          }
          // other cast as usual; the sleeper stands up beside the bed, then walks out to the right
          updateCast(cast.filter(c => !c.m._walk), lt, t, dur, cues, W, H, gy, sd + 900);
          for (const c of cast) if (c.m._walk) {
            const tw0 = hit + 0.9, walking = lt > tw0;
            c.m.pose = walking ? 'walk' : 'shrug';
            c.m.to = walking ? 1.15 : null;
            c.m.at = 3.2;
            c.steps = [{ at: -99, pose: c.m.pose, emotion: 'happy' }];
            updateCast([c], Math.max(0, lt - tw0), t, dur, {}, W, H, gy, sd + 950);
            c.g.setAttribute('opacity', clamp01((lt - hit) / 0.3).toFixed(3));
          }
        },
      };
    },
  };

  // ================================================================ uyku_c_clock24
  SH.uyku_c_clock24 = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, gy = 0.8 * H;
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const cast = makeCast(P.cast, actors, sd, 1);
      const CX = (P.cx ?? 0.33) * W, CY = 0.49 * H, R = 0.3 * H;
      const [n0, n1] = P.night || [23, 7];
      const span = ((n1 - n0) + 24) % 24;
      const ang = h => (h / 24) * Math.PI * 2;                       // 0 = top, clockwise
      const pt = (a, r) => [CX + Math.sin(a) * r, CY - Math.cos(a) * r];
      const shF = mk(back, INK.ink, { 'fill-opacity': 0.16 }), faceF = mk(back, INK.paperLight), slice = mk(back, INK.blue, { 'fill-opacity': 0.35 }), hatch = mk(back, INK.blue), faceR = mk(back), ticks = mk(back);
      const nums = [0, 6, 12, 18].map(h => { const p = pt(ang(h), R - 74); const t = text(back, String(h).padStart(2, '0'), 58, FR, INK.ink, { 'font-weight': 800 }); t.setAttribute('x', p[0]); t.setAttribute('y', p[1] + 20); return t; });
      void nums;
      const moonF = mk(mid, INK.paperLight), moonR = mk(mid), hand = mk(mid, INK.red), hub = mk(mid);
      const Hn = P.hours || { text: '7–9 saat', at: 'hit' }, Th = P.third || { text: '~1/3', sub: 'uykuda', at: 'third' };
      const hT = text(ui, Hn.text, 120, FR, INK.blue, { 'font-weight': 900 }), hU = mk(ui, INK.blue);
      const tT = text(ui, Th.text, 170, FR, INK.red, { 'font-weight': 900 }), tS = text(ui, Th.sub || '', 70, INK_FONT, INK.red), tA = mk(ui, INK.red);
      const circ = Array.from({ length: 40 }, (_, i) => pt(i / 40 * Math.PI * 2, R));
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          drift(t, root, W, H, lt, dur);
          const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
          const aH = atOr(cues, Hn.at, dur * 0.3), aT = atOr(cues, Th.at, dur * 0.65);
          fillD(shF, circ.map(q => [q[0] + 10, q[1] + 12]), O(1));
          fillD(faceF, circ, O(2));
          faceR.setAttribute('d', inkPath(circ, O(2, { w: 7, closed: true })) + ' ' + inkPath(Array.from({ length: 40 }, (_, i) => pt(i / 40 * Math.PI * 2, R - 18)), O(3, { w: 3, closed: true, amp: 1 })));
          let tk = '';
          for (let h = 0; h < 24; h++) { const a = ang(h), big = h % 6 === 0; tk += inkPath([pt(a, R - 20), pt(a, R - (big ? 56 : 38))], O(10 + h, { w: big ? 7 : 4, amp: 1 })) + ' '; }
          ticks.setAttribute('d', tk);
          // night slice sweeps in on the hours cue
          const ps = prog(lt, aH, 1.0) * (1 + 0.04 * punch(lt, aT, 0.6));
          if (ps > 0.01) {
            const a0 = ang(n0), a1 = a0 + ang(span) * clamp01(ps), arc = [];
            for (let i = 0; i <= 24; i++) arc.push(pt(lerp(a0, a1, i / 24), R - 20));
            const poly = [[CX, CY], ...arc];
            fillD(slice, poly, O(40, { smooth: false, amp: 1 }));
            slice.setAttribute('fill-opacity', (0.3 + 0.12 * punch(lt, aT, 0.8)).toFixed(3));
            let hd = '';
            for (let k = 1; k <= 7; k++) { const a = lerp(a0, a1, k / 8); hd += inkPath([pt(a, 40), pt(a, R - 30)], O(50 + k, { w: 3.5, amp: 1 })) + ' '; }
            hatch.setAttribute('d', hd + inkPath(poly, O(40, { w: 5, closed: true, smooth: false, amp: 1 })));
            const ma = ang(n0 + span / 2), mp = pt(ma, R * 0.58), mr = 34 * clamp01(ps * 1.5);
            moonF.setAttribute('d', inkCircle(mp[0], mp[1], mr, sd + 60, t, { fill: true, amp: 1 }));
            moonR.setAttribute('d', inkCircle(mp[0], mp[1], mr, sd + 60, t, { w: 5, amp: 1 }) + ' ' + inkCircle(mp[0] + mr * 0.45, mp[1] - mr * 0.3, mr * 0.75, sd + 61, t, { w: 4, amp: 0.8 }));
          } else { slice.setAttribute('d', ''); hatch.setAttribute('d', ''); moonF.setAttribute('d', ''); moonR.setAttribute('d', ''); }
          // sweeping hand: one turn over the first part of the scene, then ticks slowly
          const ha = lt < aH ? ang(24 * sm(lt / Math.max(0.5, aH))) + ang(n0) * sm(lt / Math.max(0.5, aH)) : ang(n0) + (lt - aH) * 0.18;
          line(hand, [[CX, CY], pt(ha, R - 70)], O(70, { w: 9, amp: 1 }));
          hub.setAttribute('d', inkDot(CX, CY, 16, 16, sd + 71, t));
          // notes on the right
          const nx = (P.note_x ?? 0.7) * W;
          const sp = spring(lt, aH + 0.2, 0.6);
          place(hT, nx, 0.3 * H, sp, -3, boil(sd + 80, t, 1));
          const tw = hT.getComputedTextLength ? hT.getComputedTextLength() : 400, pu = prog(lt, aH + 0.5, 0.4);
          hU.setAttribute('d', pu > 0.01 ? inkPath([[nx - tw / 2, 0.3 * H + 26], [nx - tw / 2 + tw * pu, 0.3 * H + 20]], O(81, { w: 7 })) : '');
          const s2 = spring(lt, aT, 0.6);
          place(tT, nx, 0.6 * H, s2, -4, boil(sd + 82, t, 1));
          place(tS, nx, 0.6 * H + 90, spring(lt, aT + 0.3, 0.6), -2, boil(sd + 83, t, 1));
          const pa = prog(lt, aT + 0.4, 0.5);
          if (pa > 0.01) {
            const ma = ang(n0 + span / 2), ex = pt(ma, R * 0.82)[0] + 20, ey = pt(ma, R * 0.82)[1] + 10;
            const sx = nx - 160, sy = 0.6 * H + 10, mxx = (sx + ex) / 2, myy = Math.min(sy, ey) - 80;
            const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mxx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * myy + u * u * ey]); }
            let d = inkPath(pts, O(84, { w: 6 }));
            if (pa > 0.95) { const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]); d += ' ' + inkPath([[ex - 34 * Math.cos(a - 0.5), ey - 34 * Math.sin(a - 0.5)], [ex, ey], [ex - 34 * Math.cos(a + 0.5), ey - 34 * Math.sin(a + 0.5)]], O(85, { w: 6, smooth: false })); }
            tA.setAttribute('d', d);
          } else tA.setAttribute('d', '');
          updateCast(cast, lt, t, dur, cues, W, H, gy, sd + 900);
        },
      };
    },
  };
})();
