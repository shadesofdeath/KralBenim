// bt_montagu: Lady Mary Wortley Montagu and smallpox inoculation (Edirne / Pera 1717-1718), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural (a candle flame, a
// thread of smoke, slow light, water, a slow walk, a line that writes itself). Places are drawn on the 1920x1080 stage.
// People are faceless silhouettes; the needle and the skin are drawn soberly (no blood, no sores: "the disease" is
// only a soft light). Shared kit for bt_montagu_b.js: window.MW (P0, L0, T, ital, fade, f1, candle, smoke, fig,
// walnut, walnutHalf, walnutCap, hand, pera, floor).
//
//   bt_mw_room     P: {mode: "child"|"woman"|"mother"|"all"|"two"}  cues: hit, b
//                  a night room in Pera lit by one tall candle; an arched window shows the Pera hill and the Galata
//                  tower. child: a small child sits on a low divan, one arm held out. woman: + an old woman in a
//                  headscarf sits on the floor before the child; on hit a needle glints gold in her hand, on b a walnut
//                  shell appears on the low tray in a pool of light. mother: wide; a woman in a wide 18th-century dress
//                  stands in the lit doorway (right), child and old woman dim; on hit the light falls on her.
//                  all: mother, child and old woman together; on hit the needle glints, on b morning light fills the
//                  window and the candle goes out. two: Mary (left) and the old woman (right) standing, one candle
//                  between them; on hit the candle light grows a little
//   bt_mw_nutshell P: {mode: "closed"|"open"|"hand"}  cues: hit
//                  closed: a whole walnut draws itself in a light pool; on hit a thin gold light leaks from the seam.
//                  open: a half shell (cup) with the other half on it; the lid lifts slowly away and a soft gold light
//                  shows inside; the light grows on hit. hand: an old, veined hand, palm up,
//                  holds the open half shell with the soft light in it; on hit the light grows (cover frame)
//   bt_mw_arm      P: {mode: "prick"|"dose"|"skin"|"jenner", label, text}  cues: hit, b
//                  prick: close-up of a child's forearm; a needle with a tiny gold drop comes down, touches the skin on
//                  hit, on b the drop passes in and a small gold dot stays. dose: the needle tip magnified with a gold
//                  drop; on hit a measure bracket and the italic text (default "iğnenin ucu kadar"). skin: the skin
//                  line in section; on hit one tiny gold dot sinks in and a soft ring spreads around it.
//                  jenner: the forearm and a lancet; on hit a small gold scratch, label (default "James Phipps · 8")
//                  appears; on b the mark fades slowly
//   bt_mw_candle   P: {mode: "out", label, frame: true, shell: false}  cues: hit, b
//                  one candle on a table, an oval portrait frame beside it (a faceless young man; frame: false hides it);
//                  on hit the flame dies and a thread of smoke rises; label (italic) above the frame. shell: true
//                  (instead of the frame): on b a faint walnut-shell outline appears in the dark
//   bt_mw_face     P: {mode: "scars"|"mirror"}  cues: hit, b
//                  scars: a woman's profile (hair in a bun) drawn in thin line; on hit tiny faint marks appear on the
//                  cheek one by one. mirror: an oval hand mirror holding the profile (with the marks); on hit the glass
//                  brightens, on b the view moves slowly in to the eye and the lashes fade one by one
//   bt_mw_letter   P: {mode: "write"|"line", date, text}  cues: hit
//                  a sheet of letter paper by candlelight; write: a quill writes line after line (date top right,
//                  default "1 Nisan 1717"); on hit `text` (default "korkunç değil") appears as a gold italic line.
//                  line: closer; the quill draws a line under one row on hit, `text` (default "ölen yok") appears
//   bt_mw_street   P: {label}  cues: hit   night street of wooden Ottoman houses with bay windows; an old woman with a
//                  lantern walks slowly from left to right, doors and windows light up as she passes; label (default
//                  "eylül", italic) at the top on hit
//   bt_mw_journal  P: {title, year, sub}  cues: hit   a leather-bound volume in a light pool, "Royal Society" on the
//                  cover; on hit the year (default "1714") appears in gold on it; sub (default "Timoni · Pylarini") under
//   bt_mw_figure   P: {who: "maitland", label, sub}  cues: hit   a lit arched doorway, a man in a tricorn hat and long
//                  coat with a surgeon's bag steps slowly forward in it; on hit label/sub on the right
//                  (default "Charles Maitland" / "elçilik cerrahı")
//   bt_mw_pera     P: {}  cues: hit   night over the Golden Horn: the Pera hill with the Galata tower and houses, water
//                  in front; the window lights go out one by one, one stays lit and trembles on the water
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const T = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const ital = (g, s, x, y, size = 48, o = {}) => T(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const place = (parent, x, y, s = 1, o = {}) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${o.rot})` : ''} scale(${(o.flip ? -s : s).toFixed(3)} ${s.toFixed(3)})` });
  let UID = 0;
  const E = BTL.E;

  // ------------------------------------------------------------------ the floor of a room / the ground
  function floor(g, y, a = 0.9) {
    P0(g, `M-300 ${y}L2220 ${y}L2220 1900L-300 1900Z`, C.paperDark, a);
    L0(g, `M-300 ${y}L2220 ${y}`, C.inkSoft, 2, 0.45);
  }

  // ------------------------------------------------------------------ candle: flame (ink core, gold, red tongues)
  // origin = the wick's base; s = scale. update(lt, amp): amp 0..1 the flame's size (0 = out)
  function candle(parent, x, y, s = 1, o = {}) {
    const g = place(parent, x, y, s);
    if (o.body !== false) {
      P0(g, 'M-18 0L-18 120L18 120L18 0Z', C.paperLight, 1);
      L0(g, 'M-18 120L-18 4C-10 -2 10 -2 18 4L18 120', C.ink, 2.6, 0.9);
      L0(g, 'M-10 8C-12 30-10 50-12 66', C.inkSoft, 2, 0.6);
    }
    L0(g, 'M0 2L1 -12', C.ink, 2.5, 0.9);
    const fl = [[C.red, 1, 0], [C.gold, 0.72, 1.3], [C.ink, 0.4, 2.1]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.92), k, ph: ph + (o.ph || 0) }));
    return {
      g,
      update(lt, amp = 1) {
        for (const f of fl) {
          const h = (64 + 5 * Math.sin(lt * 1.9 + f.ph) + 3 * Math.sin(lt * 3.1 + f.ph * 2)) * f.k * amp, w = 15 * f.k * Math.max(0.25, amp), lean = 2.2 * Math.sin(lt * 0.9 + f.ph);
          const b = -8;
          f.e.setAttribute('d', h < 1 ? '' : `M${f1(-w)} ${b}C${f1(-w)} ${f1(b - h * 0.45)} ${f1(-w * 0.2 + lean)} ${f1(b - h * 0.72)} ${f1(lean)} ${f1(b - h)}C${f1(w * 0.2 + lean)} ${f1(b - h * 0.72)} ${f1(w)} ${f1(b - h * 0.45)} ${f1(w)} ${b}Z`);
        }
      },
    };
  }
  // a thread of smoke rising from (x, y); update(lt, t0): starts at t0, curls slowly up and thins out
  function smoke(parent, x, y, s = 1) {
    const g = el(parent, 'g'), lines = [0, 1].map(i => L0(g, '', C.inkSoft, (i ? 2 : 3) * s, 0));
    return {
      update(lt, t0) {
        const u = lt - t0;
        lines.forEach((e, i) => {
          if (u <= 0) { e.setAttribute('d', ''); return; }
          const len = Math.min(1, u / 2.4) * 300 * s, pts = [];
          for (let k = 0; k <= 24; k++) { const v = k / 24, yy = y - 14 * s - v * len, xx = x + Math.sin(v * 5.2 + u * 0.7 + i * 1.7) * (6 + 34 * v) * s + i * 4 * v * s; pts.push(f1(xx) + ' ' + f1(yy)); }
          e.setAttribute('d', 'M' + pts.join('L'));
          e.setAttribute('stroke-opacity', ((i ? 0.35 : 0.6) * clamp01(u / 0.6) * (1 - clamp01((u - 3.2) / 3))).toFixed(3));
        });
      },
    };
  }

  // ------------------------------------------------------------------ silhouettes (filled, rim line), facing +x
  // origin = feet (or the seat for "child"); design units px at s = 1
  const FIG = {
    oldSit: {   // an old woman in a headscarf sitting on the floor, leaning forward, one arm reaching out (h ~ 330)
      fills: ['M-150 0C-165-60-145-130-105-175C-80-205-45-228-5-238L25-232C45-205 55-178 66-160C100-118 132-66 152-22C160-6 158 0 146 0Z',
        'M84-266C90-294 72-314 44-314C14-314-4-294-8-268C-12-244-32-222-62-202L-30-214C-6-224 20-230 44-230C66-230 80-246 84-266Z'],
      limbs: [['M14-205C44-192 74-192 104-198C130-204 150-210 168-214', 24]],
      dots: [[176, -215, 13, 10]],
      hand: [180, -216],
    },
    oldStand: {   // the old woman standing, a little bent, hands together in front (h ~ 380)
      fills: ['M-78 0C-70-90-72-170-58-236C-48-284-20-316 18-322L44-314C60-296 66-272 66-250C74-170 86-90 98 0Z',
        'M92-322C98-352 80-378 50-380C18-382-2-360-6-332C-10-306-26-286-50-262L-30-272C-6-290 20-300 44-302C66-304 86-306 92-322Z'],
      limbs: [['M40-292C62-262 76-236 86-206', 24]],
      dots: [[90, -200, 13, 11]],
    },
    oldWalk: {   // the old woman walking bent, a lantern held out (h ~ 380)
      fills: ['M-78 0C-70-90-72-170-58-236C-48-284-20-316 18-322L44-314C60-296 66-272 66-250C74-170 86-90 98 0Z',
        'M92-322C98-352 80-378 50-380C18-382-2-360-6-332C-10-306-26-286-50-262L-30-272C-6-290 20-300 44-302C66-304 86-306 92-322Z'],
      limbs: [['M40-290C70-262 92-238 118-226', 22]],
      dots: [[122, -224, 11, 9]],
      hand: [122, -222],
    },
    lady: {   // a woman in a wide 18th-century dress, hair up (h ~ 500)
      fills: ['M-160 0C-150-80-130-170-70-240L-40-262L-48-372C-40-386-24-392-12-394L12-394C24-392 40-386 48-372L40-262L70-240C130-170 150-80 160 0Z',
        E(0, -428, 32, 34), E(-4, -468, 22, 16)],
      limbs: [['M-44-370C-64-326-68-292-34-262', 18], ['M44-370C64-326 68-292 34-262', 18]],
      dots: [],
    },
    gent: {   // a man in a tricorn hat and a long coat with a surgeon's bag (h ~ 510)
      fills: ['M-100-60C-96-160-80-280-66-370C-62-392-44-402-14-406L14-406C44-402 62-392 66-370C80-280 96-160 100-60C60-48 20-52 0-80C-20-52-60-48-100-60Z',
        E(0, -436, 30, 32),
        'M-84-470L-44-472C-30-500 30-500 44-472L84-470C60-454 20-444 0-438C-20-444-60-454-84-470Z',
        'M60-200L140-200L150-126L50-126Z'],
      limbs: [['M-26-70L-30-8', 26], ['M26-70L30-8', 26], ['M-62-372C-82-300-90-240-92-196', 22], ['M62-372C80-300 90-250 96-212', 22], ['M80-200C80-228 120-228 120-200', 6]],
      dots: [[-36, -4, 20, 9], [36, -4, 20, 9]],
    },
    child: {   // a small child sitting on a seat, one arm held straight out (origin = the seat under the hips; h ~ 190)
      fills: ['M-34 6C-40-40-36-90-18-120L22-120C38-90 42-40 40 6Z', E(4, -152, 30, 31)],
      limbs: [['M0 2L58 6L60 66', 22], ['M10 0L72 2L74 64', 24], ['M-10-106C-22-80-16-50 2-36', 17], ['M10-106C44-100 84-96 136-94', 17]],
      dots: [[146, -94, 12, 9]],
      hand: [146, -94],
    },
  };
  function fig(parent, kind, x, y, s = 1, o = {}) {
    const F = FIG[kind], g = place(parent, x, y, s, { flip: o.flip }), col = o.color || C.paperDark, rim = o.rim || C.inkSoft, rw = 3 / s;
    for (const [d, w] of F.limbs) L0(g, d, rim, w + rw * 2, 0.85);
    for (const [cx, cy, rx, ry] of F.dots) P0(g, E(cx, cy, rx + rw, ry + rw), rim, 0.85);
    for (const d of F.fills) el(g, 'path', { d, fill: col, stroke: rim, 'stroke-width': rw * 2, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' });
    for (const [d, w] of F.limbs) L0(g, d, col, w, 1);
    for (const [cx, cy, rx, ry] of F.dots) P0(g, E(cx, cy, rx, ry), col, 1);
    const hp = F.hand ? [x + (o.flip ? -1 : 1) * F.hand[0] * s, y + F.hand[1] * s] : null;
    return { g, hand: hp };
  }

  // ------------------------------------------------------------------ walnut drawings (into a BTL.drawing D, origin = centre)
  // the walnut's brain-like wrinkles: short meandering grooves inside a region, drawn as a dark groove + a light rim
  function worms(D, inside, box, n, seed, o = {}) {
    // furrows: short, thick, slightly bent grooves that mostly follow the shell's meridians (dir(x, y) -> angle),
    // a dark groove with a faint light ridge beside it
    const r = rng(seed); let d = '', h = '';
    const dir = o.dir || (() => Math.PI / 2);
    for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
      let x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]);
      if (!inside(x, y)) continue;
      i++;
      const steps = (o.min || 4) + Math.floor(r() * (o.var || 5)), st = o.step || 11, bend = (r() - 0.5) * 0.3;
      let a = dir(x, y) + (r() - 0.5) * 0.5;
      let q = f1(x) + ' ' + f1(y), k = 0;
      for (; k < steps; k++) {
        a += bend + (r() - 0.5) * 0.2;
        const nx = x + Math.cos(a) * st, ny = y + Math.sin(a) * st;
        if (!inside(nx, ny)) break;
        x = nx; y = ny; q += 'L' + f1(x) + ' ' + f1(y);
      }
      if (k > 1) { d += 'M' + q; h += 'M' + q.split('L').map(pt => { const [px, py] = pt.split(' ').map(Number); return f1(px - 3.5) + ' ' + f1(py - 3); }).join('L'); }
    }
    D.s(d, { w: o.deep || 7, color: C.paperDark, alpha: 0.8 });
    D.s(h, { w: 1.6, color: C.ink, alpha: 0.18 });
    return d;
  }
  // a closed walnut seen from the side (~380 x 460): wrinkled shell, the seam ridge in the middle, a pointed tip on top
  function walnut(D, o = {}) {
    const rx = 185, ry = 200, N = 140, pts = [];
    for (let i = 0; i <= N; i++) {
      const a = i / N * TAU, rr = 1 + 0.012 * Math.sin(a * 11 + 0.7) + 0.008 * Math.sin(a * 23 + 2.1);
      let x = Math.sin(a) * rx * rr, y = -Math.cos(a) * ry * rr;
      const c = Math.cos(a);
      if (c > 0) y -= 34 * Math.pow(c, 14);            // the pointed tip on top
      if (c < 0) y *= 1 - 0.05 * Math.pow(-c, 4);       // a slightly flatter base
      pts.push(f1(x) + ' ' + f1(y));
    }
    const out = 'M' + pts.join('L') + 'Z';
    D.f(out, mix(C.paperLight, C.stain, 0.3), 1);
    D.f(`M30 ${-ry * 0.98}C${rx * 0.95} ${-ry * 0.75} ${rx * 1.02} ${ry * 0.6} 20 ${ry * 0.96}C${rx * 0.7} ${ry * 0.55} ${rx * 0.72} ${-ry * 0.55} 30 ${-ry * 0.98}Z`, C.paperDark, 0.5);
    const ins = side => (x, y) => side * x > 16 && (x / (rx - 16)) ** 2 + (y / (ry - 14)) ** 2 < 1;
    const mer = (x, y) => { const t = Math.max(-0.97, Math.min(0.97, y / ry)), u = x / (rx * Math.sqrt(1 - t * t)); return Math.atan2(1, -u * rx * t / (ry * Math.sqrt(1 - t * t))); };
    worms(D, ins(-1), [-rx, -ry, 0, ry], 62, (o.seed || 21), { dir: mer });
    worms(D, ins(1), [0, -ry, rx, ry], 62, (o.seed || 21) + 7, { dir: mer });
    D.s(out, { w: 4 });
    // the seam: a raised double ridge from the tip to the base
    const seam = `M0 ${-ry - 34}C-6 ${-ry * 0.5} 6 0 -4 ${ry * 0.5}C-8 ${ry * 0.8} 0 ${ry} 0 ${ry - 6}`;
    D.f(`M-10 ${-ry - 10}C-16 ${-ry * 0.5} -4 0 -14 ${ry * 0.5}C-17 ${ry * 0.8} -10 ${ry} -10 ${ry - 8}L10 ${ry - 8}C10 ${ry} 3 ${ry * 0.8} 6 ${ry * 0.5}C16 0 4 ${-ry * 0.5} 10 ${-ry - 10}Z`, mix(C.paperLight, C.ink, 0.06), 1);
    D.s(`M-10 ${-ry - 10}C-16 ${-ry * 0.5} -4 0 -14 ${ry * 0.5}C-17 ${ry * 0.8} -10 ${ry} -10 ${ry - 8}`, { w: 2.5, color: C.inkSoft });
    D.s(`M10 ${-ry - 10}C4 ${-ry * 0.5} 16 0 6 ${ry * 0.5}C3 ${ry * 0.8} 10 ${ry} 10 ${ry - 8}`, { w: 2.5, color: C.inkSoft });
    const sm = D.s(seam, { w: 3 });
    return { seam, sm, rx, ry };
  }
  // the lower half of an opened shell seen from a little above: a wrinkled cup, a thick rim, inside the two hollow
  // chambers and the dividing wall (~460 wide), origin = rim centre
  function walnutHalf(D, o = {}) {
    const RX = 230, RY = 70, Hc = 190;
    const cup = `M${-RX} 0C${-RX} ${Hc * 0.6} ${-RX * 0.6} ${Hc} 0 ${Hc}C${RX * 0.6} ${Hc} ${RX} ${Hc * 0.6} ${RX} 0Z`;
    D.f(cup, mix(C.paperLight, C.stain, 0.3), 1);
    D.f(`M50 ${Hc * 0.98}C${RX * 0.7} ${Hc * 0.92} ${RX} ${Hc * 0.5} ${RX} 4C${RX * 0.8} ${Hc * 0.45} ${RX * 0.5} ${Hc * 0.82} 50 ${Hc * 0.98}Z`, C.paperDark, 0.5);
    worms(D, (x, y) => y > RY * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2)) + 10 && (x / (RX - 14)) ** 2 + (y / (Hc - 12)) ** 2 < 1, [-RX, 0, RX, Hc], 60, o.seed || 33, { dir: (x, y) => Math.atan2(1, -x / 260) });
    D.s(cup.slice(0, -1), { w: 4 });
    // the rim: a thick, slightly uneven edge
    let rim = '', inner = '';
    for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, k = 1 + 0.012 * Math.sin(a * 13); rim += (i ? 'L' : 'M') + f1(Math.cos(a) * RX * k) + ' ' + f1(Math.sin(a) * RY * k); inner += (i ? 'L' : 'M') + f1(Math.cos(a) * (RX - 24) * k) + ' ' + f1(4 + Math.sin(a) * (RY - 18) * k); }
    D.f(rim + 'Z', mix(C.paperLight, C.ink, 0.08), 1);
    D.f(inner + 'Z', C.paperDark, 1);
    D.s(rim + 'Z', { w: 4 });
    D.s(inner + 'Z', { w: 2.5, color: C.inkSoft });
    // the two chambers and the wall between them
    D.s(`M-6 ${4 - RY + 20}C-14 -10 14 10 6 ${4 + RY - 20}`, { w: 5, color: mix(C.paperLight, C.ink, 0.1) });
    D.s(`M-120 4C-100-26-40-30-20 0M120 6C100 34 40 34 20 4`, { w: 2, color: C.inkSoft, alpha: 0.6 });
    return { RX, RY, Hc };
  }
  // the upper half (lid): a wrinkled dome with a pointed tip, standing on its rim (~460 wide), origin = rim centre
  function walnutCap(D, o = {}) {
    const RX = 230, RY = 70, Hc = 220;
    const dome = `M${-RX} 0C${-RX} ${-Hc * 0.62} ${-RX * 0.55} ${-Hc} -14 ${-Hc - 4}L0 ${-Hc - 34}L14 ${-Hc - 4}C${RX * 0.55} ${-Hc} ${RX} ${-Hc * 0.62} ${RX} 0C${RX * 0.6} ${RY} ${-RX * 0.6} ${RY} ${-RX} 0Z`;
    D.f(dome, mix(C.paperLight, C.stain, 0.3), 1);
    D.f(`M40 ${-Hc}C${RX * 0.8} ${-Hc * 0.8} ${RX} ${-Hc * 0.3} ${RX} 0C${RX * 0.8} ${-Hc * 0.25} ${RX * 0.6} ${-Hc * 0.7} 40 ${-Hc}Z`, C.paperDark, 0.5);
    worms(D, (x, y) => y < RY * 0.4 * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2)) - 6 && (x / (RX - 14)) ** 2 + (y / (Hc - 12)) ** 2 < 1, [-RX, -Hc, RX, RY], 66, o.seed || 41, { dir: (x, y) => Math.atan2(1, x / 260) });
    D.s(dome, { w: 4 });
    return { RX, RY, Hc };
  }
  // an old hand, palm up, seen from the side; the cupped fingers rise on the left, the thumb on the right, the wrist
  // runs out to the lower right. Returns {back, front} groups: the shell goes between them.
  function hand(parent) {
    // palm up, seen from the side: four fingers lie to the left (tips lifting a little), the thumb rises behind the
    // shell on the right, the wrist runs into the sleeve. Thin creases, a few fine veins on the wrist.
    const back = el(parent, 'g'), front = el(parent, 'g');
    const DB = BTL.drawing(back), DF = BTL.drawing(front);
    const skin = mix(C.paperLight, C.stain, 0.22);
    const finger = (x0, y0, len, w, curl) => {
      const tx = x0 - len, ty = y0 - curl, h = w / 2;
      return `M${x0} ${y0 - h}Q${f1(x0 - len * 0.55)} ${f1(y0 - h - curl * 0.35)} ${f1(tx)} ${f1(ty - h)}A${f1(h)} ${f1(h)} 0 0 0 ${f1(tx)} ${f1(ty + h)}Q${f1(x0 - len * 0.55)} ${f1(y0 + h - curl * 0.35)} ${x0} ${y0 + h}Z`;
    };
    // the thumb (behind the shell)
    const th = 'M170 120C176 60 186 10 196-30C204-56 238-56 244-28C250 10 252 70 262 120Z';
    DB.f(th, skin, 1); DB.s(th, { w: 3.5 });
    DB.s('M206-30C212-38 228-38 234-30M200 40C212 34 236 34 250 40', { w: 2, color: C.inkSoft, alpha: 0.7 });
    // palm and wrist
    const palm = 'M700 50C520 44 340 70 220 110C120 140-60 150-190 128C-230 150-236 236-180 252C-60 290 200 284 330 272C460 262 560 292 700 330Z';
    DB.f(palm, skin, 1);
    DB.f('M-180 252C-60 290 200 284 330 272C460 262 560 292 700 330L700 300C560 270 460 244 330 252C200 262-60 270-170 236Z', C.paperDark, 0.45);
    DB.s(palm, { w: 4 });
    DB.s('M-120 170C-40 200 60 206 150 196M-100 214C0 236 100 240 200 232', { w: 2, color: C.inkSoft, alpha: 0.6 });
    DB.s('M380 120C430 112 480 128 560 120C590 118 610 128 640 136M400 170C450 164 500 180 600 186', { w: 2, color: C.inkSoft, alpha: 0.75 });
    // four fingers, lowest (little finger) first
    const F = [[-170, 240, 190, 36, 22], [-176, 206, 232, 40, 30], [-180, 172, 250, 42, 34], [-182, 138, 228, 40, 30]];
    for (const [x0, y0, len, w, c] of F) {
      const d = finger(x0, y0, len, w, c);
      DF.f(d, skin, 1); DF.s(d, { w: 3.2 });
      // two joint creases and a nail-less tip line
      const j1 = x0 - len * 0.38, j2 = x0 - len * 0.7, y1 = y0 - c * 0.2, y2 = y0 - c * 0.55;
      DF.s(`M${f1(j1)} ${f1(y1 - w * 0.32)}q-5 ${f1(w * 0.32)} 0 ${f1(w * 0.64)}M${f1(j2)} ${f1(y2 - w * 0.3)}q-4 ${f1(w * 0.3)} 0 ${f1(w * 0.6)}`, { w: 1.8, color: C.inkSoft, alpha: 0.8 });
    }
    // the sleeve's cuff at the wrist
    DF.f('M600 20L780 10L780 380L640 350C634 250 620 130 600 20Z', C.paperDark, 1);
    DF.s('M600 20C620 130 634 250 640 350', { w: 4 });
    DF.s('M632 36C648 140 658 240 666 340', { w: 2, color: C.inkSoft, alpha: 0.7 });
    return { back, front, reveal: p => { DB.reveal(p); DF.reveal(p); } };
  }

  // ------------------------------------------------------------------ Pera at night (1920x1080 composition)
  // the hill with the Galata tower, houses on the slope, cypresses, the Golden Horn in front.
  // returns {wins: [{e, x, y}], keep (the lit window), water: update(lt)}
  function pera(g, o = {}) {
    const WL = o.water ?? 760, r = rng(o.seed || 17);
    const hill = `M-300 ${WL}L-300 600C0 590 300 520 600 470C780 440 920 410 1040 400C1180 410 1380 440 1560 500C1720 550 1900 580 2220 600L2220 ${WL}Z`;
    const hy = x => { // the hill's top line at x (piecewise)
      const P = [[-300, 600], [0, 590], [300, 545], [600, 470], [780, 440], [920, 412], [1040, 400], [1180, 410], [1380, 440], [1560, 500], [1720, 550], [1900, 580], [2220, 600]];
      for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const u = (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P[i - 1][1] + u * (P[i][1] - P[i - 1][1]); }
      return 600;
    };
    const land = el(g, 'g');
    P0(land, hill, mix(C.paperLight, C.paperDark, 0.35), 1);
    // houses: rows of small blocks with roofs on the slope
    let hs = '', hl = '';
    const wins = [];
    for (let row = 0; row < 3; row++) for (let x = 40 + row * 50; x < 1880; x += 74 + r() * 50) {
      if (Math.abs(x - 1040) < 70) continue;
      const top = hy(x) + 30 + row * 95 + r() * 20, w = 46 + r() * 30, h = 52 + r() * 34;
      if (top + h > WL - 6) continue;
      hs += `M${f1(x)} ${f1(top + h)}L${f1(x)} ${f1(top)}L${f1(x + w / 2)} ${f1(top - 20)}L${f1(x + w)} ${f1(top)}L${f1(x + w)} ${f1(top + h)}Z`;
      hl += `M${f1(x)} ${f1(top)}L${f1(x + w / 2)} ${f1(top - 20)}L${f1(x + w)} ${f1(top)}`;
      if (r() < 0.55) wins.push({ x: x + w * (0.3 + r() * 0.4), y: top + h * 0.45 });
    }
    P0(land, hs, mix(C.paperLight, C.paper, 0.2), 1);
    L0(land, hl, C.inkSoft, 1.6, 0.55);
    // cypresses
    let cy = '';
    for (const x of [230, 420, 760, 1290, 1480, 1700]) { const b = hy(x) + 60; cy += `M${x - 16} ${b}C${x - 18} ${b - 60} ${x - 6} ${b - 120} ${x} ${b - 150}C${x + 6} ${b - 120} ${x + 18} ${b - 60} ${x + 16} ${b}Z`; }
    P0(land, cy, C.paperDark, 0.9);
    // the Galata tower: round body, a gallery, the conical roof
    const tx = 1040, tb = 430, tw = 46, tt = tb - 230;
    const tower = `M${tx - tw} ${tb}L${tx - tw + 4} ${tt}L${tx + tw - 4} ${tt}L${tx + tw} ${tb}Z`;
    const gal = `M${tx - tw - 12} ${tt}L${tx - tw - 12} ${tt - 18}L${tx + tw + 12} ${tt - 18}L${tx + tw + 12} ${tt}Z`;
    const cap = `M${tx - tw - 4} ${tt - 18}L${tx - tw + 4} ${tt - 46}L${tx} ${tt - 130}L${tx + tw - 4} ${tt - 46}L${tx + tw + 4} ${tt - 18}Z`;
    for (const d of [tower, gal, cap]) P0(land, d, mix(C.paperLight, C.paper, 0.1), 1);
    L0(land, tower + gal + cap, C.ink, 2.4, 0.8);
    L0(land, `M${tx - 14} ${tt + 40}L${tx - 14} ${tt + 70}M${tx + 14} ${tt + 40}L${tx + 14} ${tt + 70}M${tx} ${tt + 120}L${tx} ${tt + 150}`, C.inkSoft, 3, 0.8);
    L0(land, 'M-300 600C0 590 300 520 600 470C780 440 920 410 1040 400C1180 410 1380 440 1560 500C1720 550 1900 580 2220 600', C.inkSoft, 2, 0.6);
    // windows: small lit squares
    for (const w of wins) w.e = P0(land, `M${f1(w.x - 6)} ${f1(w.y - 8)}L${f1(w.x + 6)} ${f1(w.y - 8)}L${f1(w.x + 6)} ${f1(w.y + 8)}L${f1(w.x - 6)} ${f1(w.y + 8)}Z`, C.gold, 0.6);
    let keep = wins.reduce((b, w) => (Math.abs(w.x - 1240) < Math.abs(b.x - 1240) ? w : b), wins[0]);
    // the water: a slightly lighter band with slow moving glints
    const wg = el(g, 'g');
    P0(wg, `M-300 ${WL}L2220 ${WL}L2220 1900L-300 1900Z`, mix(C.paper, C.paperDark, 0.5), 1);
    L0(wg, `M-300 ${WL}L2220 ${WL}`, C.inkSoft, 2, 0.5);
    const glints = [];
    for (let i = 0; i < 46; i++) glints.push({ e: L0(wg, '', C.inkSoft, 2, 0.5), x: r() * 1920, y: WL + 20 + Math.pow(r(), 1.3) * 400, l: 30 + r() * 80, ph: r() * TAU, sp: 0.18 + r() * 0.2 });
    const refl = L0(wg, '', C.gold, 3, 0);
    return {
      wins, keep,
      update(lt, on = 1) {
        for (const q of glints) {
          const dx = 18 * Math.sin(lt * q.sp + q.ph);
          q.e.setAttribute('d', `M${f1(q.x + dx)} ${f1(q.y)}l${f1(q.l)} 0`);
          q.e.setAttribute('stroke-opacity', (0.22 + 0.2 * Math.sin(lt * q.sp * 1.6 + q.ph)).toFixed(3));
        }
        if (keep) {
          let d = ''; for (let k = 0; k < 9; k++) { const y = WL + 18 + k * 22, w = 10 + k * 3 + 6 * Math.sin(lt * 0.8 + k); d += `M${f1(keep.x - w / 2 + 5 * Math.sin(lt * 0.6 + k * 1.3))} ${y}l${f1(w)} 0`; }
          refl.setAttribute('d', d); refl.setAttribute('stroke-opacity', (0.55 * on).toFixed(3));
        }
      },
    };
  }

  window.MW = { P0, L0, T, ital, fade, f1, place, floor, candle, smoke, fig, FIG, walnut, walnutHalf, walnutCap, hand, pera };

  // ------------------------------------------------------------------ bt_mw_room
  SH.bt_mw_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'child', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820;
      const two = mode === 'two';
      // the arched window with the Pera hill in it
      const wx = two ? 960 : 900, wy0 = 210, wy1 = 600, ww = 150;
      const winD = `M${wx - ww} ${wy1}L${wx - ww} ${wy0 + 110}C${wx - ww} ${wy0 + 30} ${wx - 60} ${wy0} ${wx} ${wy0 - 20}C${wx + 60} ${wy0} ${wx + ww} ${wy0 + 30} ${wx + ww} ${wy0 + 110}L${wx + ww} ${wy1}Z`;
      const cid = 'mwwin' + (++UID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: winD });
      const wing = el(g, 'g', { 'clip-path': `url(#${cid})` });
      P0(wing, winD, C.paper, 1);
      const sky = P0(wing, winD, C.stain, 0);
      const view = el(wing, 'g', { transform: `translate(${wx - 1040 * 0.34} ${wy0 + 70 - 300 * 0.34}) scale(0.34)` });
      const PV = pera(view, { seed: 5 });
      BTL.stars(wing, 14, 3, [wx - ww, wy0, wx + ww, wy0 + 140]);
      L0(g, winD, C.ink, 3.2, 0.85);
      L0(g, `M${wx} ${wy0 - 20}L${wx} ${wy1}M${wx - ww} ${wy0 + 250}L${wx + ww} ${wy0 + 250}`, C.inkSoft, 2.4, 0.7);
      P0(g, `M${wx - ww - 26} ${wy1}L${wx + ww + 26} ${wy1}L${wx + ww + 16} ${wy1 + 22}L${wx - ww - 16} ${wy1 + 22}Z`, C.paperLight, 1);
      L0(g, `M${wx - ww - 26} ${wy1}L${wx + ww + 26} ${wy1}`, C.inkSoft, 2, 0.7);
      floor(g, GR, 0.9);
      // the doorway on the right (mother / all)
      let door = null;
      if (mode === 'mother' || mode === 'all') {
        const dx0 = 1560, dx1 = 1790, dt = 240;
        const dd = `M${dx0} ${GR}L${dx0} ${dt + 60}C${dx0} ${dt} ${dx1} ${dt} ${dx1} ${dt + 60}L${dx1} ${GR}Z`;
        P0(g, dd, C.paperLight, 1);
        door = P0(g, dd, C.stain, 0.12);
        L0(g, dd, C.ink, 3, 0.8);
      }
      // the divan (sedir) along the back wall with a long cushion
      const sx0 = two ? -1 : 1060, sx1 = 1500, seat = 700;
      if (!two) {
        P0(g, `M${sx0} ${GR}L${sx0} ${seat}L${sx1} ${seat}L${sx1} ${GR}Z`, C.paperLight, 1);
        P0(g, `M${sx0 + 6} ${seat}L${sx0 + 6} ${seat - 90}C${sx0 + 6} ${seat - 110} ${sx1 - 6} ${seat - 110} ${sx1 - 6} ${seat - 90}L${sx1 - 6} ${seat}Z`, mix(C.paperLight, C.paper, 0.4), 1);
        L0(g, `M${sx0} ${GR}L${sx0} ${seat}L${sx1} ${seat}L${sx1} ${GR}M${sx0 + 6} ${seat}L${sx0 + 6} ${seat - 90}C${sx0 + 6} ${seat - 110} ${sx1 - 6} ${seat - 110} ${sx1 - 6} ${seat - 90}L${sx1 - 6} ${seat}`, C.inkSoft, 2.4, 0.8);
        L0(g, `M${sx0 + 20} ${seat + 40}L${sx1 - 20} ${seat + 40}`, C.inkSoft, 1.6, 0.4);
      }
      // the tall candlestick
      const cx = two ? 960 : 470, cTop = two ? 600 : 560;
      if (two) {   // a small round table between the two women
        P0(g, `M${cx - 120} ${cTop + 130}L${cx + 120} ${cTop + 130}L${cx + 100} ${cTop + 150}L${cx - 100} ${cTop + 150}Z`, C.paperLight, 1);
        L0(g, `M${cx - 120} ${cTop + 130}L${cx + 120} ${cTop + 130}M${cx} ${cTop + 150}L${cx} ${GR}M${cx - 60} ${GR}L${cx + 60} ${GR}`, C.inkSoft, 3, 0.85);
      } else {
        L0(g, `M${cx} ${cTop + 120}L${cx} ${GR - 10}M${cx - 50} ${GR}C${cx - 40} ${GR - 20} ${cx + 40} ${GR - 20} ${cx + 50} ${GR}M${cx - 34} ${cTop + 120}L${cx + 34} ${cTop + 120}`, C.inkSoft, 4, 0.9);
      }
      const lightA = BTL.glow(svg, defs, cx + (two ? 0 : 200), cTop, two ? 560 : 620, C.stain, 0.3, g);
      const can = candle(g, cx, cTop + (two ? 10 : 0), 1, { ph: 0.4 });
      const sm = smoke(g, cx, cTop - 4, 1);
      const morning = mode === 'all' ? BTL.glow(svg, defs, wx, 420, 560, C.stain, 0, g) : null;
      // people
      const dimG = el(g, 'g');
      let child = null, old = null, mother = null, needle = null, shellG = null, motherLight = null;
      if (mode === 'mother' || mode === 'all') {
        motherLight = BTL.glow(svg, defs, 1675, 520, 380, C.stain, 0, g);
        mother = fig(g, 'lady', mode === 'all' ? 1640 : 1675, GR, mode === 'all' ? 1.0 : 1.04, { flip: true });
      }
      if (mode !== 'two') child = fig(dimG, 'child', 1250, seat, 1.5, { flip: true });
      if (mode === 'woman' || mode === 'mother' || mode === 'all') {
        old = fig(dimG, 'oldSit', 760, GR, 1.25);
        const [hx, hy] = old.hand;
        needle = L0(dimG, `M${hx + 6} ${hy}L${hx + 78} ${hy + 14}`, C.gold, 3.2, 0, { pathLength: 1 });
      }
      if (mode === 'woman') {
        shellG = el(g, 'g', { opacity: 0 });
        BTL.glow(svg, defs, 930, 800, 160, C.stain, 0.5, shellG);
        P0(shellG, `M840 818L1020 818L1004 834L856 834Z`, C.paperLight, 1);
        L0(shellG, `M840 818L1020 818`, C.inkSoft, 2.4, 0.9);
        const sg = place(shellG, 930, 790, 0.16), DS = BTL.drawing(sg);
        walnutHalf(DS); DS.reveal(1);
        P0(sg, E(0, 4, 150, 34), C.gold, 0.5);
      }
      let two1 = null, two2 = null;
      if (two) {
        two1 = fig(g, 'lady', 600, GR, 1.02);
        two2 = fig(g, 'oldStand', 1330, GR, 1.22, { flip: true });
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5), tb = cue(cues, 'b', dur * 0.75);
          // the candle: out at b in "all"
          const out = mode === 'all' ? BTL.ease(lt, tb + 0.4, 1.6) : 0;
          can.update(lt, 1 - out);
          if (mode === 'all') sm.update(lt, tb + 1.2);
          lightA.set((two ? 0.3 + 0.08 * BTL.ease(lt, th, 2) : 0.3) * (1 - 0.7 * out) + 0.02 * Math.sin(lt * 1.3));
          PV.update(lt, 1);
          if (morning) { morning.set(0.35 * BTL.ease(lt, tb, 3)); sky.setAttribute('fill-opacity', (0.35 * BTL.ease(lt, tb, 3)).toFixed(3)); }
          if (mode === 'mother') { fade(dimG, 1 - 0.55 * BTL.ease(lt, 0.2, 1.4)); motherLight.set(0.06 + 0.3 * BTL.ease(lt, th - 0.3, 1.8)); door.setAttribute('fill-opacity', (0.12 + 0.18 * BTL.ease(lt, th - 0.3, 1.8)).toFixed(3)); }
          if (mode === 'all') motherLight.set(0.12 + 0.1 * BTL.ease(lt, tb, 3));
          if (mode === 'woman') { fade(old.g, BTL.ease(lt, 0.1, 1.6)); fade(shellG, BTL.ease(lt, tb - 0.2, 1.2)); }
          if (needle) {
            const tn = mode === 'mother' ? 0 : th - 0.3;
            draw(needle, mode === 'mother' ? 1 : BTL.ease(lt, tn, 0.8));
            needle.setAttribute('stroke-opacity', mode === 'mother' ? '0.6' : (0.5 + 0.5 * BTL.ease(lt, tn, 0.8)).toFixed(3));
          }
          if (two) { fade(two1.g, BTL.ease(lt, 0, 1.6)); fade(two2.g, BTL.ease(lt, 0.4, 1.6)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_nutshell
  SH.bt_mw_nutshell = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'closed', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 700 : 470;
      const pool = BTL.glow(svg, defs, cx, cy, portrait ? 520 : 560, C.stain, 0.2, g);
      // a soft shadow on the "table"
      P0(g, E(cx, cy + (mode === 'hand' ? 330 : 230), mode === 'hand' ? 420 : 300, 34), C.paperDark, mode === 'hand' ? 0 : 0.7);
      if (mode === 'closed') {
        const og = place(g, cx, cy, portrait ? 1.3 : 1.15), D = BTL.drawing(og), Wn = walnut(D);
        const leak = BTL.glow(svg, defs, cx, cy, 300, C.gold, 0, g);
        const seamG = L0(og, Wn.seam, C.gold, 5, 0, { pathLength: 1 });
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.5);
            D.reveal(BTL.ease(lt, 0, 2.6));
            pool.set(0.18 + 0.03 * Math.sin(lt * 0.9));
            const q = BTL.ease(lt, th - 0.2, 2);
            draw(seamG, q); seamG.setAttribute('stroke-opacity', (q * (0.8 + 0.2 * Math.sin(lt * 1.7))).toFixed(3));
            leak.set(q * (0.28 + 0.05 * Math.sin(lt * 1.3)));
          },
        };
      }
      if (mode === 'open') {
        const s = portrait ? 1.2 : 1.05, base = place(g, cx, cy + 40 * s, s), DB = BTL.drawing(base), WH = walnutHalf(DB);
        const inner = BTL.glow(svg, defs, 0, 0, 200, C.gold, 0, base);
        const liquid = P0(base, E(0, 6, 120, 26), C.gold, 0);
        const lidG = el(g, 'g'), lid = el(lidG, 'g'), DL = BTL.drawing(lid);
        walnutCap(DL);
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.6);
            DB.reveal(BTL.ease(lt, 0, 1.6)); DL.reveal(BTL.ease(lt, 0, 1.6));
            const u = BTL.ease(lt, 0.9, Math.max(2.5, Math.min(4.5, dur - 1.6))), k = BTL.ease(lt, th - 0.2, 1.6);
            lid.setAttribute('transform', `translate(${f1(cx + 240 * u * s)} ${f1(cy + 40 * s - 230 * u * s)}) rotate(${f1(28 * u)}) scale(${s})`);
            inner.set(u * (0.35 + 0.3 * k + 0.06 * Math.sin(lt * 1.2)));
            liquid.setAttribute('fill-opacity', (u * (0.3 + 0.2 * k + 0.06 * Math.sin(lt * 0.9))).toFixed(3));
            pool.set(0.16 + 0.04 * u + 0.06 * k);
          },
        };
      }
      // hand: the old hand holding the open half shell
      const s = portrait ? 1.05 : 0.95, hg = place(g, cx - 60 * s, cy + 20, s);
      const HN = hand(hg);
      // the shell sits in the palm, between the hand's back and its front fingers
      const sg = place(hg, 4, -14, 0.8);
      hg.insertBefore(sg, HN.front);
      const DS = BTL.drawing(sg); walnutHalf(DS);
      const inner = BTL.glow(svg, defs, 0, 0, 230, C.gold, 0, sg);
      const liquid = P0(sg, E(0, 6, 140, 30), C.gold, 0);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          HN.reveal(BTL.ease(lt, 0, 2.4)); DS.reveal(BTL.ease(lt, 0.2, 2.2));
          const q = BTL.ease(lt, 0.8, 2), k = BTL.ease(lt, th - 0.2, 2.2);
          inner.set(q * (0.42 + 0.25 * k + 0.05 * Math.sin(lt * 1.1)));
          liquid.setAttribute('fill-opacity', (q * (0.42 + 0.15 * k)).toFixed(3));
          pool.set(0.16 + 0.12 * k + 0.02 * Math.sin(lt * 0.8));
        },
      };
    },
  };

  // a child's forearm across the frame: the relaxed hand on the left, the sleeve on the right (top edge at y ~ 517 at x 1080)
  function forearm(D) {
    const handD = 'M560 540C500 532 440 528 380 534C330 538 290 548 250 560C210 572 180 584 172 602C168 618 186 626 210 618C240 608 270 604 300 606C270 620 240 636 230 652C224 668 244 676 266 666C300 650 340 646 380 652C420 676 490 696 560 700';
    const limb = handD + 'C900 720 1400 740 2220 760L2220 480C1300 500 900 520 560 540Z';
    D.f(limb, mix(C.paperLight, C.stain, 0.22), 1);
    D.f('M380 652C420 676 490 696 560 700C900 720 1400 740 2220 760L2220 700C1400 690 900 680 560 664C480 660 420 650 380 652Z', C.paperDark, 0.45);
    D.s(handD + 'C900 720 1400 740 2220 760', { w: 4 }); D.s('M560 540C900 520 1300 500 2220 480', { w: 4 });
    D.s('M300 606C330 600 360 598 390 602M266 666C300 660 330 660 360 664M440 560C470 590 520 600 560 600', { w: 2, color: C.inkSoft, alpha: 0.6 });
    D.s('M700 600C800 596 900 596 980 602M1240 640C1320 636 1400 640 1460 646', { w: 2, color: C.inkSoft, alpha: 0.35 });
    // the sleeve on the right
    const slv = 'M1640 470C1664 580 1652 690 1690 790L2220 820L2220 440Z';
    D.f(slv, C.paperDark, 1); D.s('M1640 470C1664 580 1652 690 1690 790', { w: 3.5 });
    D.s('M1720 480C1736 560 1730 650 1756 760M1800 470C1820 560 1812 660 1840 770', { w: 2, color: C.inkSoft, alpha: 0.6 });
  }

  // ------------------------------------------------------------------ bt_mw_arm
  SH.bt_mw_arm = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'prick', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.3 });
      const pool = BTL.glow(svg, defs, 980, 520, 640, C.stain, 0.18, g);
      if (mode === 'dose') {
        // the needle tip magnified, coming down from the upper left; a drop hangs at the point
        const tip = [1000, 560], ang = Math.atan2(560 - 120, 1000 - 220);
        const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
        const bw = 26, L = 900;
        const p = (a, b) => `${f1(tip[0] - ux * a + nx * b)} ${f1(tip[1] - uy * a + ny * b)}`;
        const nd = `M${p(0, 0)}L${p(140, bw)}L${p(L, bw)}L${p(L, -bw)}L${p(140, -bw)}Z`;
        const D = BTL.drawing(g);
        D.f(nd, C.paperLight, 1); D.s(nd, { w: 4 });
        D.s(`M${p(140, bw * 0.4)}L${p(L, bw * 0.4)}`, { w: 2, color: C.inkSoft, alpha: 0.8 });
        const drop = P0(g, '', C.gold, 0.9);
        const dropGlow = BTL.glow(svg, defs, tip[0], tip[1] + 30, 120, C.gold, 0, g);
        const br = el(g, 'g', { opacity: 0 });
        L0(br, `M${tip[0] - 50} ${tip[1] + 90}L${tip[0] - 50} ${tip[1] + 110}L${tip[0] + 50} ${tip[1] + 110}L${tip[0] + 50} ${tip[1] + 90}`, C.gold, 3, 0.9);
        L0(br, `M${tip[0] + 50} ${tip[1] + 110}L${tip[0] + 110} ${tip[1] + 110}`, C.gold, 2, 0.6);
        const lab = ital(br, P.text || 'iğnenin ucu kadar', tip[0] + 130, tip[1] + 126, 54, { color: C.ink, anchor: 'start' });
        lab.setAttribute('opacity', 1);
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.5);
            D.reveal(BTL.ease(lt, 0, 1.8));
            const grow = BTL.ease(lt, 0.6, 3), r = 6 + 20 * grow, sw = 1 + 0.04 * Math.sin(lt * 1.4);
            drop.setAttribute('d', `M${tip[0]} ${tip[1] + 4}C${f1(tip[0] + r * 0.4)} ${f1(tip[1] + r * 0.6)} ${f1(tip[0] + r)} ${f1(tip[1] + r * 1.2 * sw)} ${tip[0]} ${f1(tip[1] + r * 2 * sw)}C${f1(tip[0] - r)} ${f1(tip[1] + r * 1.2 * sw)} ${f1(tip[0] - r * 0.4)} ${f1(tip[1] + r * 0.6)} ${tip[0]} ${tip[1] + 4}Z`);
            dropGlow.set(grow * (0.35 + 0.05 * Math.sin(lt * 1.2)));
            fade(br, BTL.ease(lt, th - 0.2, 1.2));
          },
        };
      }
      if (mode === 'skin') {
        // the forearm close; one tiny gold dose falls onto the skin, sinks in, a soft ring spreads over the skin
        const D = BTL.drawing(g); forearm(D);
        const sx = 1080, sy = 520;
        const dot = P0(g, E(0, 0, 9, 9), C.gold, 0);
        const ring = el(g, 'ellipse', { cx: sx, cy: sy + 34, rx: 10, ry: 3, fill: 'none', stroke: C.gold, 'stroke-width': 3, 'stroke-opacity': 0 });
        const spot = P0(g, E(sx, sy + 12, 8, 5), C.gold, 0);
        const halo = BTL.glow(svg, defs, sx, sy + 20, 170, C.gold, 0, g);
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.45);
            D.reveal(BTL.ease(lt, 0, 1.6));
            pool.set(0.16 + 0.02 * Math.sin(lt));
            const fall = BTL.ease(lt, th - 1.2, 1.3), sink = BTL.ease(lt, th + 0.1, 1);
            dot.setAttribute('transform', `translate(${sx} ${f1(sy - 330 + 330 * fall)})`);
            dot.setAttribute('fill-opacity', (BTL.ease(lt, th - 1.4, 0.6) * (1 - sink)).toFixed(3));
            spot.setAttribute('fill-opacity', (0.9 * sink).toFixed(3));
            const rr = BTL.ease(lt, th + 0.5, 3);
            ring.setAttribute('rx', f1(12 + 220 * rr)); ring.setAttribute('ry', f1(4 + 66 * rr));
            ring.setAttribute('stroke-opacity', (rr > 0 ? 0.85 * (1 - rr) + 0.1 : 0).toFixed(3));
            halo.set(0.4 * sink);
          },
        };
      }
      // prick / jenner: a child's forearm across the frame, the wrist on the left
      const D = BTL.drawing(g);
      forearm(D);
      const px = 1080, py = 517;
      const ang = mode === 'jenner' ? -0.62 : -0.8;
      const ux = Math.cos(ang), uy = Math.sin(ang);   // up and to the right
      const tool = el(g, 'g');
      if (mode === 'jenner') {   // a lancet: a small leaf-shaped blade in a two-sided handle
        const bl = 'M0 0C30-10 70-14 110-8L140-4L140 4L110 8C70 14 30 10 0 0Z';
        P0(tool, bl, C.paperLight, 1); L0(tool, bl, C.ink, 3, 1);
        const hd = 'M140-14L620-24L630 0L620 24L140 14Z';
        P0(tool, hd, mix(C.paperLight, C.paper, 0.3), 1); L0(tool, hd, C.inkSoft, 3, 1);
        L0(tool, 'M160 0L600 0', C.inkSoft, 2, 0.6);
      } else {                    // a long needle with an eye
        L0(tool, 'M0 0L400 0', C.ink, 4.5, 1);
        L0(tool, 'M30-1.6L380-1.6', C.inkSoft, 1.4, 0.6);
      }
      // two old fingertips pinching the tool's far end
      const fx0 = mode === 'jenner' ? 520 : 360;
      const thumb = `M${fx0} -6C${fx0 + 20} -40 ${fx0 + 90} -58 ${fx0 + 170} -50L${fx0 + 420} -40L${fx0 + 420} 0L${fx0 + 60} 0C${fx0 + 20} 0 ${fx0} -2 ${fx0} -6Z`;
      const index = `M${fx0 + 10} 6C${fx0 + 30} 40 ${fx0 + 100} 60 ${fx0 + 180} 54L${fx0 + 420} 50L${fx0 + 420} 2L${fx0 + 70} 2C${fx0 + 30} 2 ${fx0 + 10} 2 ${fx0 + 10} 6Z`;
      for (const d of [index, thumb]) { P0(tool, d, C.paperLight, 1); L0(tool, d, C.ink, 3, 1); }
      L0(tool, `M${fx0 + 120} -48C${fx0 + 116} -40 ${fx0 + 116} -30 ${fx0 + 122} -24M${fx0 + 140} 50C${fx0 + 136} 42 ${fx0 + 136} 32 ${fx0 + 142} 26M${fx0 + 220} -46C${fx0 + 214} -36 ${fx0 + 216} -26 ${fx0 + 222} -18`, C.inkSoft, 2, 0.75);
      const drop = mode === 'prick' ? P0(g, '', C.gold, 0.95) : null;
      const mark = mode === 'jenner' ? L0(g, `M${px - 34} ${py + 14}L${px + 34} ${py + 6}M${px - 30} ${py + 30}L${px + 30} ${py + 22}`, C.gold, 4, 0) : P0(g, E(px, py + 16, 9, 6), C.gold, 0);
      const halo = BTL.glow(svg, defs, px, py + 20, 110, C.gold, 0, g);
      const lab = mode === 'jenner' ? ital(g, P.label || 'James Phipps · 8', 700, 300, 58, { anchor: 'middle', color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.45), tb = cue(cues, 'b', dur * 0.75);
          D.reveal(BTL.ease(lt, 0, 1.6));
          pool.set(0.16 + 0.02 * Math.sin(lt * 0.9));
          // the tool comes down to the skin by hit, then lifts a little after the dose
          const down = BTL.ease(lt, 0.2, Math.max(1, th - 0.2)), lift = BTL.ease(lt, (mode === 'prick' ? tb : th) + 0.6, 2);
          const off = 260 * (1 - down) + 110 * lift;
          const x = px + ux * off, y = py + uy * off;
          tool.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang * 180 / Math.PI)})`);
          fade(tool, BTL.ease(lt, 0, 1));
          if (drop) {
            const r = 11 * (1 - BTL.ease(lt, tb, 0.9));
            drop.setAttribute('d', r < 0.5 ? '' : E(x + 2, y + 10, r, r * 1.15));
            mark.setAttribute('fill-opacity', BTL.ease(lt, tb, 1).toFixed(3));
            halo.set(0.4 * BTL.ease(lt, tb, 1.2) * (1 - 0.4 * BTL.ease(lt, tb + 1.5, 3)));
          } else {
            mark.setAttribute('stroke-opacity', (0.95 * BTL.ease(lt, th, 0.8) * (1 - 0.75 * BTL.ease(lt, tb, 3))).toFixed(3));
            halo.set(0.3 * BTL.ease(lt, th, 0.8) * (1 - 0.8 * BTL.ease(lt, tb, 3)));
            fade(lab, BTL.ease(lt, th + 0.2, 1.2));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_candle
  SH.bt_mw_candle = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const TY = 720, shell = !!P.shell, frame = P.frame !== false && !shell;
      // the table top and its front edge
      P0(g, `M-300 ${TY}L2220 ${TY}L2220 1900L-300 1900Z`, C.paperLight, 1);
      P0(g, `M-300 ${TY + 70}L2220 ${TY + 70}L2220 1900L-300 1900Z`, C.paperDark, 0.85);
      L0(g, `M-300 ${TY}L2220 ${TY}M-300 ${TY + 70}L2220 ${TY + 70}`, C.inkSoft, 2, 0.6);
      const cx = frame || shell ? 800 : 960, light = BTL.glow(svg, defs, cx + 80, TY - 200, 640, C.stain, 0.34, g);
      // the candlestick: a low dish with a handle ring
      P0(g, E(cx, TY - 6, 96, 18), C.paperLight, 1);
      L0(g, E(cx, TY - 6, 96, 18) + `M${cx - 30} ${TY - 22}L${cx - 30} ${TY - 60}L${cx + 30} ${TY - 60}L${cx + 30} ${TY - 22}`, C.inkSoft, 3, 0.9);
      L0(g, `M${cx + 96} ${TY - 8}C${cx + 140} ${TY - 10} ${cx + 140} ${TY - 46} ${cx + 100} ${TY - 40}`, C.inkSoft, 3, 0.9);
      const can = candle(g, cx, TY - 60 - 210, 1.75, { ph: 1.1 });
      const sm = smoke(g, cx, TY - 60 - 210 - 4, 1.4);
      let fr = null;
      if (frame) {   // an oval portrait on a little stand: a faceless young man
        fr = el(g, 'g');
        const fx = 1240, fy = TY - 240;
        L0(fr, `M${fx - 60} ${TY}L${fx} ${fy + 170}L${fx + 60} ${TY}`, C.inkSoft, 3, 0.9);
        P0(fr, E(fx, fy, 150, 190), C.paperLight, 1);
        P0(fr, E(fx, fy, 122, 160), C.paper, 1);
        const cid = 'mwfr' + (++UID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: E(fx, fy, 122, 160) });
        const pin = el(fr, 'g', { 'clip-path': `url(#${cid})` });
        P0(pin, `M${fx - 120} ${fy + 170}C${fx - 110} ${fy + 70} ${fx - 70} ${fy + 50} ${fx} ${fy + 46}C${fx + 70} ${fy + 50} ${fx + 110} ${fy + 70} ${fx + 120} ${fy + 170}Z`, C.paperDark, 1);
        P0(pin, E(fx, fy - 30, 52, 62), C.paperDark, 1);
        L0(pin, `M${fx - 22} ${fy + 50}L${fx} ${fy + 86}L${fx + 22} ${fy + 50}`, C.inkSoft, 3, 0.8);
        L0(fr, E(fx, fy, 150, 190) + E(fx, fy, 122, 160), C.ink, 3, 0.85);
        L0(fr, E(fx, fy, 136, 175), C.gold, 2, 0.5);
      }
      const lab = P.label ? ital(g, P.label, frame ? 1240 : cx, frame ? TY - 470 : 230, 64, { anchor: 'middle', color: C.ink }) : null;
      let sh = null;
      if (shell) { sh = place(g, 1260, TY - 120, 0.62); const DS = BTL.drawing(sh); walnut(DS); DS.reveal(1); sh.setAttribute('opacity', 0); }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5), tb = cue(cues, 'b', dur * 0.8);
          const out = BTL.ease(lt, th, 1.6);
          can.update(lt, 1 - out);
          sm.update(lt, th + 0.6);
          light.set((0.34 + 0.02 * Math.sin(lt * 1.6)) * (1 - 0.82 * out));
          if (fr) fade(fr, BTL.ease(lt, 0.2, 1.4) * (1 - 0.45 * out));
          if (lab) fade(lab, BTL.ease(lt, 0.6, 1.2) * (1 - 0.3 * out));
          if (sh) fade(sh, 0.4 * BTL.ease(lt, tb - 0.2, 2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_face
  // a woman's profile facing right (origin ~ the cheek), hair in a bun at the back
  const FACE = {
    front: 'M40-232C62-214 74-170 74-120C74-106 80-98 82-88C86-74 92-58 108-28C116-14 110-6 96-6C88-6 86 0 88 8C90 14 86 18 84 22C88 30 90 36 82 42C76 46 72 52 76 62C82 78 82 92 70 104C56 116 30 120 6 122',
    neck: 'M6 122C-2 150-4 190 6 250M-104 70C-100 140-110 200-130 250',
    hair: 'M40-232C10-262-60-268-110-240C-160-212-176-150-160-90C-150-50-130-10-104 70',
    hairline: 'M44-226C20-200 0-180-20-176C-40-172-56-150-60-120',
    bun: E(-150, -206, 54, 46),
    ear: 'M-46-70C-60-86-60-46-46-30C-38-22-30-34-34-46',
    brow: 'M34-128C46-136 60-136 70-128',
    eye: 'M38-104C46-110 56-110 62-104M40-98C48-94 56-96 62-104',
    mouth: 'M64 32C72 30 78 32 84 30',
    strands: 'M-100-226C-60-214-30-200 0-170M-140-180C-110-150-100-110-104-60M-70-240C-40-230-10-216 20-196',
  };
  function profile(g, o = {}) {
    const D = BTL.drawing(g);
    D.f(FACE.hair + 'C-92 0-70-80-60-120C-56-150-40-172-20-176C0-180 20-200 44-226Z', mix(C.paperLight, C.paper, 0.2), 1);
    D.f(FACE.bun, mix(C.paperLight, C.paper, 0.2), 1);
    D.s(FACE.front, { w: 4 }); D.s(FACE.neck, { w: 3 }); D.s(FACE.hair, { w: 3.5 }); D.s(FACE.bun, { w: 3.5 });
    D.s(FACE.hairline, { w: 2.5, color: C.inkSoft }); D.s(FACE.strands, { w: 2, color: C.inkSoft, alpha: 0.7 });
    D.s(FACE.ear, { w: 2.5 }); D.s(FACE.brow, { w: 2.5, color: C.inkSoft }); D.s(FACE.eye, { w: 3 }); D.s(FACE.mouth, { w: 2.5, color: C.inkSoft });
    const r = rng(o.seed || 7), marks = [];
    for (let i = 0; i < 20; i++) {
      const x = -20 + r() * 86, y = -60 + r() * 120;
      if (x > 50 + y * 0.25 || (x > 20 && y < -40)) continue;
      marks.push(el(g, 'circle', { cx: f1(x), cy: f1(y), r: f1(1.6 + r() * 1.6), fill: 'none', stroke: C.inkSoft, 'stroke-width': 1.6, 'stroke-opacity': 0 }));
    }
    const lashes = [];
    for (let i = 0; i < 6; i++) { const x = 42 + i * 4; lashes.push(L0(g, `M${x} ${-106 + i * 0.4}l${f1(5 + i * 1.8)} ${f1(-16 + i * 1)}`, C.ink, 2.6, 1)); }
    return { D, marks, lashes };
  }
  SH.bt_mw_face = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'scars', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 680 : 470;
      const pool = BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.18, g);
      if (mode === 'scars') {
        const pg = place(g, cx + 20, cy + 40, portrait ? 1.7 : 1.45), F = profile(pg);
        F.lashes.forEach(e => e.setAttribute('stroke-opacity', 0));
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.5);
            F.D.reveal(BTL.ease(lt, 0, 2.2));
            F.lashes.forEach(e => e.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 1.4, 1)).toFixed(3)));
            pool.set(0.18 + 0.02 * Math.sin(lt * 0.8));
            F.marks.forEach((m, i) => m.setAttribute('stroke-opacity', (0.75 * BTL.ease(lt, th - 0.2 + i * 0.09, 1)).toFixed(3)));
          },
        };
      }
      // mirror: an oval hand mirror; the view moves in to the eye on b
      const zoomG = el(g, 'g'), mx = cx, my = portrait ? cy : cy - 10, RX = 190, RY = 236;
      const DM = BTL.drawing(zoomG);
      DM.f(E(mx, my, RX + 26, RY + 26), C.paperLight, 1);
      DM.s(E(mx, my, RX + 26, RY + 26), { w: 4 }); DM.s(E(mx, my, RX + 12, RY + 12), { w: 2, color: C.gold, alpha: 0.7 });
      P0(zoomG, E(mx, my, RX, RY), C.paper, 1);
      const glass = P0(zoomG, E(mx, my, RX, RY), C.stain, 0.04);
      const cid = 'mwmir' + (++UID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: E(mx, my, RX, RY) });
      const inside = el(zoomG, 'g', { 'clip-path': `url(#${cid})` });
      const ex = mx + 30, ey = my + 40, ks = 1;
      const pg = place(inside, ex, ey, ks), F = profile(pg, { seed: 9 });
      L0(zoomG, `M${mx - RX * 0.6} ${my - RY * 0.55}C${mx - RX * 0.4} ${my - RY * 0.75} ${mx - RX * 0.1} ${my - RY * 0.82} ${mx + RX * 0.1} ${my - RY * 0.8}`, C.ink, 2, 0.25);
      DM.s(E(mx, my, RX, RY), { w: 3, color: C.inkSoft });
      // the eye in frame coordinates (to zoom about)
      const eyeX = ex + 50 * ks, eyeY = ey - 104 * ks;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.3), tb = cue(cues, 'b', dur * 0.7);
          DM.reveal(BTL.ease(lt, 0, 1.6)); F.D.reveal(BTL.ease(lt, 0.3, 2));
          F.marks.forEach(m => m.setAttribute('stroke-opacity', (0.7 * BTL.ease(lt, 0.8, 1.5)).toFixed(3)));
          const q = BTL.ease(lt, th - 0.2, 1.8);
          glass.setAttribute('fill-opacity', (0.04 + 0.16 * q).toFixed(3));
          pool.set(0.16 + 0.12 * q);
          // the slow move in to the eye
          const z = BTL.ease(lt, tb - 1.2, 3), s = 1 + 0.3 * z, pvx = mx + (eyeX - mx) * z, pvy = my + (eyeY - my) * z;
          zoomG.setAttribute('transform', `translate(${f1(mx)} ${f1(my)}) scale(${s.toFixed(4)}) translate(${f1(-pvx)} ${f1(-pvy)})`);
          F.lashes.forEach((e, i) => e.setAttribute('stroke-opacity', (0.95 * (1 - BTL.ease(lt, tb + 0.3 + i * 0.35, 0.9))).toFixed(3)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_letter
  // handwriting: a row of small connected loops (no real letters, quiet and even)
  function scribble(x0, y, len, seed) {
    const r = rng(seed); let d = `M${f1(x0)} ${f1(y)}`, x = x0;
    while (x < x0 + len) {
      if (r() < 0.12) { x += 18 + r() * 10; d += `M${f1(x)} ${f1(y)}`; continue; }   // a gap between words
      const w = 9 + r() * 7, h = 10 + r() * 12, tall = r() < 0.18 ? 18 : 0;
      d += `C${f1(x + w * 0.2)} ${f1(y - h - tall)} ${f1(x + w * 0.9)} ${f1(y - h - tall)} ${f1(x + w * 0.6)} ${f1(y - 2)}C${f1(x + w * 0.5)} ${f1(y + 3)} ${f1(x + w * 0.9)} ${f1(y + 2)} ${f1(x + w)} ${f1(y)}`;
      x += w;
    }
    return d;
  }
  // a quill: the feather drawn from the tip (origin) up and to the right
  function quill(parent) {
    const g = el(parent, 'g'), D = BTL.drawing(g);
    const vane = 'M30-40C90-130 200-250 340-330C380-350 400-340 380-310C300-210 180-110 60-30Z';
    D.f(vane, C.paperLight, 1); D.s(vane, { w: 3 });
    D.s('M0 0L40-46C130-150 250-260 372-334', { w: 3 });
    let barbs = ''; for (let i = 1; i < 12; i++) { const u = i / 12, x = 40 + u * 320, y = -46 - u * 290; barbs += `M${f1(x)} ${f1(y)}l${f1(-30 + u * 8)} ${f1(-14 + u * 6)}M${f1(x)} ${f1(y)}l${f1(16 - u * 4)} ${f1(26 - u * 6)}`; }
    D.s(barbs, { w: 1.6, color: C.inkSoft, alpha: 0.8 });
    D.reveal(1);
    return g;
  }
  SH.bt_mw_letter = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'write', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const closer = mode === 'line';
      const k = closer ? 1.2 : 1;
      const root = el(g, 'g', { transform: closer ? `translate(${f1(960 - 1000 * k)} ${f1(420 - 600 * k)}) scale(${k})` : '' });
      // the desk, the candle on the left
      P0(root, 'M-400-200L2400-200L2400 1900L-400 1900Z', mix(C.paperDark, C.paper, 0.4), 1);
      const light = BTL.glow(svg, defs, 600, 360, 720, C.stain, 0.3, root);
      const can = candle(root, 330, 330, 1.2, { ph: 2 });
      P0(root, E(330, 474, 70, 14), C.paperLight, 1); L0(root, E(330, 474, 70, 14), C.inkSoft, 2.5, 0.8);
      // the sheet (slightly turned)
      const sheet = el(root, 'g', { transform: 'rotate(-3 1000 520)' });
      const x0 = 640, x1 = 1360, y0 = 80, y1 = 860;
      P0(sheet, `M${x0 + 10} ${y0 + 12}L${x1 + 10} ${y0 + 12}L${x1 + 10} ${y1 + 12}L${x0 + 10} ${y1 + 12}Z`, C.paperDark, 0.8);
      P0(sheet, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, mix(C.paperLight, C.ink, 0.06), 1);
      L0(sheet, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.inkSoft, 2.5, 0.9);
      L0(sheet, `M${x0 + 30} ${y0 + 40}L${x1 - 30} ${y0 + 40}`, C.inkSoft, 1, 0);
      const date = ital(sheet, P.date || '1 Nisan 1717', x1 - 60, y0 + 92, 46, { anchor: 'end', color: C.ink });
      const rows = [];
      const RY0 = y0 + 170, GAP = 58;
      const hiRow = closer ? 5 : 6, N = closer ? hiRow + 1 : 10;
      for (let i = 0; i < N; i++) {
        const y = RY0 + i * GAP, xs = x0 + 70 + (i === 0 ? 40 : 0), len = (x1 - 70 - xs) * (i === N - 1 ? 0.55 : 0.92 + 0.08 * Math.sin(i * 2.1));
        if (!closer && i === hiRow) { rows.push({ text: true, y, xs }); continue; }
        rows.push({ e: L0(sheet, scribble(xs, y, len, 50 + i), C.ink, 2.4, 0.9, { pathLength: 1 }), y, xs, len });
      }
      const hi = closer ? null : T(sheet, P.text || 'korkunç değil', x0 + 70, RY0 + hiRow * GAP + 10, 58, { font: LO, italic: true, color: C.gold, anchor: 'start' });
      const under = closer ? L0(sheet, `M${x0 + 64} ${RY0 + hiRow * GAP + 18}C${x0 + 300} ${RY0 + hiRow * GAP + 24} ${x0 + 520} ${RY0 + hiRow * GAP + 14} ${x1 - 90} ${RY0 + hiRow * GAP + 20}`, C.gold, 4, 1, { pathLength: 1 }) : null;
      const note = closer ? T(sheet, P.text || 'ölen yok', x0 + 70, RY0 + hiRow * GAP + 112, 64, { font: LO, italic: true, color: C.gold, anchor: 'start' }) : null;
      const qg = quill(sheet);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          can.update(lt, 1); light.set(0.3 + 0.02 * Math.sin(lt * 1.5));
          fade(date, BTL.ease(lt, 0.2, 1.2));
          let qx = x0 + 100, qy = RY0;
          if (!closer) {
            // rows written one after the other until hit, the highlighted line at hit, then more rows
            const before = rows.slice(0, hiRow), after = rows.slice(hiRow + 1);
            const t0 = 0.3, per = Math.max(0.25, (th - 0.3 - t0) / before.length);
            before.forEach((rw, i) => { const p = BTL.ease(lt, t0 + i * per, per); draw(rw.e, p); if (p > 0 && p < 1) { qx = rw.xs + rw.len * p; qy = rw.y; } });
            if (lt >= th - 0.3) { qx = x0 + 110 + 420 * BTL.ease(lt, th - 0.3, 1.2); qy = RY0 + hiRow * GAP + 10; }
            fade(hi, BTL.ease(lt, th - 0.2, 1.2));
            const per2 = 1.6;
            after.forEach((rw, i) => { const p = BTL.ease(lt, th + 1.1 + i * per2, per2); draw(rw.e, p); if (p > 0 && p < 1) { qx = rw.xs + rw.len * p; qy = rw.y; } });
          } else {
            rows.forEach(rw => rw.e && draw(rw.e, 1));
            const p = BTL.ease(lt, th - 0.2, 1.4);
            draw(under, p);
            qx = x0 + 64 + (x1 - 154 - x0) * p; qy = RY0 + hiRow * GAP + 18;
            if (lt < th - 0.2) { const a = BTL.ease(lt, 0, th - 0.2); qx = x0 + 64 + 40 * (1 - a); qy = RY0 + hiRow * GAP + 18 - 60 * (1 - a); }
            fade(note, BTL.ease(lt, th + 0.2, 0.9));
          }
          qg.setAttribute('transform', `translate(${f1(qx)} ${f1(qy)})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_street
  SH.bt_mw_street = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820;
      BTL.stars(g, 60, 12, [0, 40, 1920, 300]);
      // a thin crescent moon (top right)
      P0(g, 'M1640 150A56 56 0 1 0 1690 232A46 46 0 1 1 1640 150Z', C.ink, 0.85);
      const houses = [], D = BTL.drawing(g);
      const xs = [[-40, 330], [330, 690], [690, 1070], [1070, 1430], [1430, 1800], [1800, 2100]];
      xs.forEach(([a, b], i) => {
        const h = 380 + (i % 2) * 50, top = GR - h, bay = top + 90;
        // ground floor + projecting upper floor (cumba) + hipped roof with wide eaves
        const body = `M${a + 20} ${GR}L${a + 20} ${bay + 120}L${a} ${bay + 120}L${a} ${top}L${b} ${top}L${b} ${bay + 120}L${b - 20} ${bay + 120}L${b - 20} ${GR}Z`;
        const roof = `M${a - 30} ${top}L${a + 40} ${top - 70}L${b - 40} ${top - 70}L${b + 30} ${top}Z`;
        D.f(body, mix(C.paperLight, C.paper, 0.1), 1); D.f(roof, C.paperDark, 1);
        D.s(body, { w: 2.6, color: C.inkSoft }); D.s(roof, { w: 2.6, color: C.inkSoft });
        D.s(`M${a + 20} ${bay + 120}L${b - 20} ${bay + 120}M${a} ${bay + 128}L${a + 20} ${bay + 150}M${b} ${bay + 128}L${b - 20} ${bay + 150}`, { w: 2, color: C.inkSoft, alpha: 0.7 });
        // clapboards
        let cl = ''; for (let y = top + 24; y < GR; y += 34) if (y < bay + 110 || y > bay + 140) cl += `M${y < bay + 120 ? a + 8 : a + 28} ${y}L${y < bay + 120 ? b - 8 : b - 28} ${y}`;
        D.s(cl, { w: 1.2, color: C.inkSoft, alpha: 0.35 });
        const lights = [];
        const mid = (a + b) / 2;
        for (const wxo of [-90, 0, 90]) { const wx = mid + wxo; lights.push(P0(g, `M${wx - 26} ${bay - 30}L${wx + 26} ${bay - 30}L${wx + 26} ${bay + 60}L${wx - 26} ${bay + 60}Z`, C.gold, 0)); D.s(`M${wx - 26} ${bay - 30}L${wx + 26} ${bay - 30}L${wx + 26} ${bay + 60}L${wx - 26} ${bay + 60}ZM${wx} ${bay - 30}L${wx} ${bay + 60}`, { w: 2, color: C.inkSoft }); }
        const dx = mid + (i % 2 ? 100 : -100);
        lights.push(P0(g, `M${dx - 44} ${GR}L${dx - 44} ${GR - 170}C${dx - 44} ${GR - 210} ${dx + 44} ${GR - 210} ${dx + 44} ${GR - 170}L${dx + 44} ${GR}Z`, C.gold, 0));
        D.s(`M${dx - 44} ${GR}L${dx - 44} ${GR - 170}C${dx - 44} ${GR - 210} ${dx + 44} ${GR - 210} ${dx + 44} ${GR - 170}L${dx + 44} ${GR}`, { w: 2.4, color: C.inkSoft });
        houses.push({ mid, lights });
      });
      floor(g, GR, 0.95);
      let cob = ''; const r = rng(4);
      for (let i = 0; i < 70; i++) { const x = -100 + r() * 2100, y = GR + 20 + Math.pow(r(), 1.3) * 360; cob += `M${f1(x)} ${f1(y)}l${f1(20 + r() * 30)} 0`; }
      L0(g, cob, C.inkSoft, 2, 0.25);
      const lamp = BTL.glow(svg, defs, 0, 0, 260, C.stain, 0.45, g);
      const walker = el(g, 'g');
      const wf = fig(walker, 'oldWalk', 0, GR, 0.95);
      const [hx, hy] = wf.hand;
      L0(walker, `M${hx} ${hy}L${hx} ${hy + 18}`, C.inkSoft, 2.5, 0.9);
      P0(walker, `M${hx - 18} ${hy + 18}L${hx + 18} ${hy + 18}L${hx + 14} ${hy + 70}L${hx - 14} ${hy + 70}Z`, C.paperLight, 1);
      L0(walker, `M${hx - 18} ${hy + 18}L${hx + 18} ${hy + 18}L${hx + 14} ${hy + 70}L${hx - 14} ${hy + 70}ZM${hx - 22} ${hy + 18}L${hx + 22} ${hy + 18}`, C.ink, 2.4, 0.9);
      const lf = candle(walker, hx, hy + 62, 0.42, { body: false, ph: 0.8 });
      const lab = ital(g, P.label || 'eylül', 960, 200, 72, { anchor: 'middle', color: C.ink });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.3);
          D.reveal(BTL.ease(lt, 0, 1.8));
          const x = 160 + 1400 * clamp01(lt / Math.max(dur, 4) * 1.05);
          walker.setAttribute('transform', `translate(${f1(x)} 0)`);
          fade(walker, BTL.ease(lt, 0, 1));
          lf.update(lt, 1);
          lamp.e.setAttribute('cx', f1(x + hx * 0.95)); lamp.e.setAttribute('cy', f1(hy + 40));
          lamp.set(0.4 + 0.04 * Math.sin(lt * 2.2));
          for (const hs of houses) hs.lights.forEach((e, j) => { const on = clamp01((x - hs.mid + 220 - j * 40) / 160); e.setAttribute('fill-opacity', (0.5 * on * (j === 3 ? 0.8 : 1)).toFixed(3)); });
          fade(lab, BTL.ease(lt, th - 0.2, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_journal
  SH.bt_mw_journal = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 660 : 440;
      const pool = BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.22, g);
      const bk = place(g, cx, cy, portrait ? 1.15 : 1, { rot: -4 }), D = BTL.drawing(bk);
      const w = 230, h = 300, t = 34;
      P0(bk, `M${-w + 20} ${h + 14}L${w + 40} ${h + 14}L${w + 40} ${h + 34}L${-w + 20} ${h + 34}Z`, C.paperDark, 0.7);
      // the page block on the right and at the bottom, the spine on the left
      const pages = `M${w} ${-h + 10}L${w + t} ${-h + 24}L${w + t} ${h + 14}L${-w + 10} ${h + 14}L${-w} ${h}Z`;
      D.f(pages, mix(C.paperLight, C.ink, 0.1), 1); D.s(pages, { w: 2.6, color: C.inkSoft });
      let pl = ''; for (let i = 1; i < 5; i++) pl += `M${w + i * 7} ${-h + 12 + i * 3}L${w + i * 7} ${h + 2 + i * 3}`;
      D.s(pl, { w: 1.2, color: C.inkSoft, alpha: 0.6 });
      const cover = `M${-w} ${-h}L${w} ${-h}L${w} ${h}L${-w} ${h}Z`;
      D.f(cover, mix(C.paperLight, C.red, 0.14), 1); D.s(cover, { w: 4 });
      D.f(`M${-w} ${-h}L${-w + 40} ${-h}L${-w + 40} ${h}L${-w} ${h}Z`, mix(C.paperDark, C.red, 0.12), 1);
      D.s(`M${-w + 40} ${-h}L${-w + 40} ${h}`, { w: 2.5, color: C.inkSoft });
      D.s(`M${-w + 60} ${-h + 24}L${w - 24} ${-h + 24}L${w - 24} ${h - 24}L${-w + 60} ${h - 24}Z`, { w: 2, color: C.gold, alpha: 0.7 });
      D.s(`M${-w + 72} ${-h + 36}L${w - 36} ${-h + 36}L${w - 36} ${h - 36}L${-w + 72} ${h - 36}Z`, { w: 1.2, color: C.gold, alpha: 0.5 });
      D.s(`M20 ${-40}L60 0L20 40L-20 0Z`, { w: 2, color: C.gold, alpha: 0.6 });
      const tt = T(bk, P.title || 'Royal Society', 20, -h + 120, 48, { font: LO, italic: true, anchor: 'middle', color: C.ink });
      L0(bk, `M-60 ${-h + 150}L100 ${-h + 150}`, C.gold, 2, 0.6);
      const yr = T(bk, P.year || '1714', 20, 160, 116, { anchor: 'middle', color: C.gold, weight: 400 });
      const sub = ital(g, P.sub || 'Timoni · Pylarini', cx, portrait ? 1100 : 880, 50, { anchor: 'middle', color: C.ink });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.6);
          D.reveal(BTL.ease(lt, 0, 2));
          fade(tt, BTL.ease(lt, 1.0, 1.2));
          fade(yr, BTL.ease(lt, th - 0.2, 1.2));
          fade(sub, BTL.ease(lt, th + 0.5, 1.2));
          pool.set(0.2 + 0.08 * BTL.ease(lt, th, 2) + 0.02 * Math.sin(lt * 0.9));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_figure
  SH.bt_mw_figure = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 760, fy: 540 });
      const GR = 840, dx0 = 560, dx1 = 960, dt = 160, dcx = (dx0 + dx1) / 2;
      floor(g, GR, 0.9);
      const dd = `M${dx0} ${GR}L${dx0} ${dt + 200}C${dx0} ${dt + 40} ${dx1} ${dt + 40} ${dx1} ${dt + 200}L${dx1} ${GR}Z`;
      P0(g, dd, C.paperLight, 1);
      const inner = P0(g, dd, C.stain, 0.3);
      const out = BTL.glow(svg, defs, dcx, 520, 520, C.stain, 0.22, g);
      // the frame and a light spill on the floor
      L0(g, dd, C.ink, 4, 0.9);
      L0(g, `M${dx0 - 30} ${GR}L${dx0 - 30} ${dt + 200}C${dx0 - 30} ${dt + 10} ${dx1 + 30} ${dt + 10} ${dx1 + 30} ${dt + 200}L${dx1 + 30} ${GR}`, C.inkSoft, 2.5, 0.7);
      P0(g, `M${dx0} ${GR}L${dx1} ${GR}L${dx1 + 220} 1100L${dx0 - 220} 1100Z`, C.stain, 0.12);
      const man = el(g, 'g');
      fig(man, 'gent', 0, 0, 1);
      const lab = T(g, P.label || 'Charles Maitland', 1100, 500, 76, { weight: 400, anchor: 'start' });
      const sub = ital(g, P.sub || 'elçilik cerrahı', 1104, 594, 54, { anchor: 'start', color: C.ink });
      const rule = L0(g, 'M1102 530L1500 530', C.gold, 2.5, 0.8, { pathLength: 1 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.6);
          // he steps slowly forward through the door (grows a little, comes down to the floor line)
          const u = BTL.ease(lt, 0, Math.max(3, dur));
          const s = 0.9 + 0.14 * u;
          man.setAttribute('transform', `translate(${dcx} ${f1(GR - 20 + 20 * u)}) scale(${s.toFixed(4)})`);
          fade(man, BTL.ease(lt, 0, 1.4));
          inner.setAttribute('fill-opacity', (0.3 + 0.04 * Math.sin(lt * 1.1)).toFixed(3));
          out.set(0.22 + 0.03 * Math.sin(lt * 0.9));
          fade(lab, BTL.ease(lt, th - 0.2, 1.2)); draw(rule, BTL.ease(lt, th, 1.2)); fade(sub, BTL.ease(lt, th + 0.5, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_pera
  SH.bt_mw_pera = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1040, fy: 520 });
      const st = BTL.stars(g, 90, 8, [0, 30, 1920, 380]);
      P0(g, 'M380 170A50 50 0 1 0 424 244A41 41 0 1 1 380 170Z', C.ink, 0.8);
      const PV = pera(g, { seed: 17 });
      const halo = BTL.glow(svg, defs, PV.keep.x, PV.keep.y, 120, C.gold, 0.3, g);
      const others = PV.wins.filter(w => w !== PV.keep);
      return {
        update(lt, dur, cues) {
          st.update(lt); PV.update(lt, 1);
          // the lights go out one by one; one stays
          const span = Math.max(2, dur - 1.5);
          others.forEach((w, i) => w.e.setAttribute('fill-opacity', (0.6 * (1 - BTL.ease(lt, 0.4 + (i * 0.618 % 1) * span, 0.8))).toFixed(3)));
          PV.keep.e.setAttribute('fill-opacity', (0.85 + 0.1 * Math.sin(lt * 1.3)).toFixed(3));
          halo.set(0.28 + 0.06 * Math.sin(lt * 1.1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mw_chapter / bt_mw_field / bt_mw_map
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR, 'font-weight': o.weight || 300 },
    o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  // bt_mw_chapter: the chapter card of bt_chapter, but it reads at once (short chapter lines): everything is in by ~1 s
  SH.bt_mw_chapter = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), cx = W / 2, cy = H > W ? 640 : H * 0.44;
      BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.12, g);
      const num = txt(g, P.n || 'I', cx, cy - 120, 58, { color: C.gold, weight: 400, spacing: '0.08em' });
      const rule = el(g, 'path', { d: `M${cx - 160} ${cy - 70}L${cx + 160} ${cy - 70}`, stroke: C.inkSoft, 'stroke-width': 2, pathLength: 1, fill: 'none' });
      const title = BTL.fit(txt(g, P.title || '', cx, cy + 50, 118, { weight: 400 }), W - 120);
      const sub = P.sub ? txt(g, P.sub, cx, cy + 132, 50, { font: LO, italic: true, color: C.ink, weight: 400 }) : null;
      return {
        update(lt) {
          fade(num, BTL.ease(lt, 0, 0.6)); draw(rule, BTL.ease(lt, 0.05, 0.8));
          fade(title, BTL.ease(lt, 0.1, 0.7)); title.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, 0.1, 1.2)) * 10)})`);
          if (sub) fade(sub, 0.85 * BTL.ease(lt, 0.4, 0.7));
        },
      };
    },
  };
  // bt_mw_field: P: {n: 300, cols: 30, every: 3, label, note}  cues: hit   a quiet field of n small marks (people),
  // centred; on hit every third mark turns gold, left to right, and label (gold italic) appears under the field;
  // note (italic) above it from the start
  SH.bt_mw_field = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), n = P.n || 300, cols = P.cols || (portrait ? 20 : 30), every = P.every || 3;
      const rows = Math.ceil(n / cols), sx = portrait ? 46 : 40, sy = portrait ? 46 : 40, x0 = W / 2 - (cols - 1) * sx / 2, y0 = portrait ? 420 : 250;
      BTL.glow(svg, defs, W / 2, y0 + rows * sy / 2, 620, C.stain, 0.12, g);
      const marks = [];
      for (let i = 0; i < n; i++) {
        const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy;
        const e = el(g, 'path', { d: `M${f1(x)} ${f1(y + 10)}L${f1(x)} ${f1(y - 6)}`, stroke: C.inkSoft, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none', opacity: 0 });
        el(g, 'circle', { cx: f1(x), cy: f1(y - 14), r: 4, fill: C.inkSoft, opacity: 0 });
        marks.push({ e, h: e.nextSibling, hit: i % every === every - 1, u: (i % cols) / cols, v: Math.floor(i / cols) / rows });
      }
      const note = P.note ? txt(g, P.note, W / 2, y0 - 70, 52, { font: LO, italic: true, color: C.inkSoft, weight: 400, anchor: 'middle' }) : null;
      const lab = txt(g, P.label || 'üçte biri', W / 2, y0 + rows * sy + 110, 110, { font: LO, italic: true, color: C.gold, weight: 400, anchor: 'middle' });
      if (note) note.setAttribute('opacity', 0); lab.setAttribute('opacity', 0);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          for (const m of marks) {
            const a = BTL.ease(lt, 0.1 + m.v * 0.8 + m.u * 0.4, 0.6);
            const q = m.hit ? BTL.ease(lt, th - 0.3 + m.u * 0.9, 0.5) : 0;
            const col = q > 0.5 ? C.gold : C.inkSoft;
            for (const e of [m.e, m.h]) { e.setAttribute('opacity', (a * (m.hit ? 0.6 + 0.4 * q : 0.6 - 0.25 * BTL.ease(lt, th, 1))).toFixed(3)); if (e === m.e) e.setAttribute('stroke', col); else e.setAttribute('fill', col); }
          }
          if (note) fade(note, BTL.ease(lt, 0.2, 1));
          fade(lab, BTL.ease(lt, th + 0.1, 0.6));
        },
      };
    },
  };
  // bt_mw_map: bt_map with the British Isles and the Channel drawn (London on its island). Same P as bt_map, plus
  // points[].side "left"|"right" for the label
  const LAND_MW = [
    [[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [60, 47], [60, 75], [12, 75], [10.5, 59], [8.5, 57.6], [8.1, 56.5], [8.6, 55.4], [8.6, 54.0], [7, 53.6], [5, 53.4], [4.7, 52.9], [4.2, 52.0], [3.4, 51.4], [2.5, 51.1], [1.6, 50.9], [1.6, 50.2], [0.2, 49.7], [-1.3, 49.6], [-1.9, 49.7], [-1.5, 48.7], [-3.0, 48.8], [-4.7, 48.4], [-4.2, 47.8], [-2.5, 47.3], [-2.2, 46.9], [-1.2, 46.0], [-1.3, 44.6], [-1.5, 43.5], [-3, 43.4], [-5.6, 43.6], [-8, 43.7], [-9.3, 43.2]],
    [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [41.5, 42.5], [60, 42.5], [60, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
    [[-30, 33], [-9.8, 30], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [60, 36.6], [60, -10], [-30, -10]],
    [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
    [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
    [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
    [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
    [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],,
    [[-5.7, 50.0], [-4.2, 50.4], [-3, 50.7], [-1, 50.8], [1.4, 51.2], [1.7, 52.6], [0.3, 53.4], [-0.2, 54.1], [-1.3, 54.9], [-1.6, 55.6], [-2.1, 56.0], [-2.6, 56.3], [-1.8, 57.6], [-3.3, 58.6], [-5.0, 58.6], [-5.7, 57.5], [-5.6, 56.4], [-4.9, 55.7], [-5.0, 54.8], [-3.2, 54.9], [-3.0, 53.9], [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.8], [-4.9, 52.0], [-5.2, 51.7], [-3.2, 51.4], [-4.5, 51.1]],
    [[-6.0, 52.2], [-6.2, 53.3], [-6.0, 54.0], [-5.6, 54.6], [-6.2, 55.2], [-7.3, 55.3], [-8.5, 54.6], [-10.0, 54.2], [-9.9, 53.4], [-10.3, 52.1], [-9.5, 51.6], [-8.0, 51.7], [-6.4, 52.2]],
  ];
  SH.bt_mw_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), [l0, b0, l1, b1] = P.bounds || [-2, 28, 40, 46];
      // the requested bounds fit inside the picture (above the subtitles); the land then runs on to every frame edge
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 1000 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const mg = el(g, 'g');
      let grat = '';
      for (let lon = -30; lon <= 60; lon += 5) grat += `M${X(lon).toFixed(0)} -10L${X(lon).toFixed(0)} ${H + 10}`;
      for (let lat = 10; lat <= 70; lat += 5) grat += `M-10 ${Y(lat).toFixed(0)}L${W + 10} ${Y(lat).toFixed(0)}`;
      el(mg, 'path', { d: grat, stroke: C.inkSoft, 'stroke-opacity': 0.18, 'stroke-width': 1.5, fill: 'none' });
      const landD = LAND_MW.map(poly => 'M' + poly.map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + 'Z').join('');
      el(mg, 'path', { d: landD, fill: C.paperLight, 'fill-opacity': 0.9, stroke: 'none' });
      const coast = el(mg, 'path', { d: landD, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g');
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const right = p.side ? p.side === 'right' : x < W * 0.7, ax = right ? x + 34 : x - 34, an = right ? 'start' : 'end';
        const lab = txt(pg, p.label || '', ax, y + 16, 54, { weight: 400, anchor: an });
        const sub = p.sub ? txt(pg, p.sub, ax, y + 70, 42, { font: LO, italic: true, color: C.inkSoft, weight: 400, anchor: an }) : null;
        for (const t of [lab, sub]) if (t) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); }
        return { p, pg, ring, lab, sub, x, y };
      });
      const routes = (P.routes || []).map(([a, b, at]) => {
        const A = pts[a], B = pts[b], mxp = (A.x + B.x) / 2, myp = Math.min(A.y, B.y) - Math.abs(A.x - B.x) * 0.18;
        return { at, e: el(g, 'path', { d: `M${A.x} ${A.y}Q${mxp} ${myp} ${B.x} ${B.y}`, fill: 'none', stroke: C.gold, 'stroke-width': 3, pathLength: 1, 'stroke-linecap': 'round' }) };
      });
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', BTL.ease(lt, 0, 1.2).toFixed(3));
          pts.forEach((q, i) => {
            const at = cue(cues, q.p.at, 0.6 + i * 0.8);
            fade(q.pg, BTL.ease(lt, at - 0.3, 1));
            const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6;
            q.ring.setAttribute('r', (14 + 26 * ph).toFixed(1)); q.ring.setAttribute('stroke-opacity', ((1 - ph) * 0.8).toFixed(3));
          });
          routes.forEach(r => draw(r.e, BTL.ease(lt, cue(cues, r.at, dur * 0.4), 1.6)));
        },
      };
    },
  };
})();
