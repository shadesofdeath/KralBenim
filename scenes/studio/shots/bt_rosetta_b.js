// bt_rosetta_b: the Rosetta Stone and the decipherment, part 2 (London 1814 → Paris 1822 → today), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; faceless silhouettes; the only motion is slow and natural
// (a candle or lamp flame, drifting dust, a slow light, stars, water). Wide 1920x1080 frame (long video).
// Hieroglyphs are plain one-line signs close to their real forms and values (sign keys below).
//   bt_rosb_cartouche P: {mode}  cues: hit, b
//       frame     a horizontal cartouche (oval ring + end bar) draws itself, faint signs inside; hit: gold italic "kartuş"
//       ptolemy   same cartouche, the Ptolemaios signs clear (stool p, bread t, lasso o, lion l, m, two reeds i, folded
//                 cloth s), italic "Ptolemaios" above; hit: a letter appears under each sign (P T O L M İ S)
//       kleopatra a faint obelisk; hit: a Kleopatra cartouche grows forward out of it; b: italic name + gold contour (basket k, lion l, reed e, lasso o,
//                 stool p, vulture a, hand t, mouth r, vulture a), italic "Kleopatra"
//       compare   the two cartouches one above the other; hit: stool, lasso and lion light gold in both, gold lines join them
//       mes       a vertical cartouche: sun disk (ra) from the start; hit: the ms sign; b: two folded cloths (s); labels right
//       ramses    the full Ramses cartouche; hit: gold contour + big thin "Ramses" beside it
//       paper     a sheet with the Ramses cartouche in pencil; hit: faint gold; b: the sheet's edges sink into the dark
//   bt_rosb_sign      P: {mode: "sun"|"dual"|"glow"}  cues: hit, b   one big sun-disk sign (circle + centre dot) in a light pool.
//       sun: draws itself, hit: the pool brightens, b: gold "Ra" under it. dual: hit: italic "resim" left, b: "ses" right,
//       thin gold lines join them. glow: darkness, the pool grows slowly; hit: thin gold "Ra"
//   bt_rosb_desk      P: {label}  cues: hit   night, Young's desk: candle, open notebook, a quill writing a line; on hit it
//       stops, the quill is laid down beside the half line; italic label (default "Thomas Young")
//   bt_rosb_books     P: {label}  cues: hit, b, c   a stack of old books on a table, candle; hit: italic label
//       ("Champollion"); b: one book slides out of the stack and opens; c: Coptic letters (ϩ ϣ ϧ ϥ ϫ ϭ, no Latin look-alikes) glow gold on its page
//   bt_rosb_church    P: {}  cues: hit   a dim Coptic church: one apse arch, a hanging lamp, a lectern with an open book;
//       hit: the page lights
//   bt_rosb_abusimbel P: {}  cues: hit   night: four seated colossi cut in the cliff (the second broken), sand, stars;
//       hit: a thin light seeps from the central door
//   bt_rosb_triad     P: {}  cues: hit, b, c   small black stone, open Coptic book, Ramses cartouche side by side; the stone
//       lights first, hit: the book, b: a gold line stone→book draws, c: the cartouche, the second line closes them
//   bt_rosb_academy   P: {label}  cues: hit   a domed hall: rows of seated figures seen from behind, a reader at the
//       lectern with a sheet; hit: one front-row figure near him lights; italic label (default "27 Eylül 1822")
//   bt_rosb_rivals    P: {mode: "face"|"ask"}  cues: hit, b, c   two faceless profiles (Young left, Champollion right).
//       face: hit: a small cartouche between them, b: Young's profile fades, c: the cartouche turns into the small stone.
//       ask: wider apart, names under them; hit: the left one lights, b: the right one
//   bt_rosb_map       P: bt_rosa_map's + {link: [i, j, at]}  a plain map (bt_rosa_map) with a neutral dashed line between
//       two points, no route
//   (the street, the stone, the Europe map frame come from bt_rosetta_a.js: bt_rosa_street, bt_rosa_stone, window.ROSA)
//   bt_rosb_philae    P: {}  cues: hit   night on the Nile: Philae's pylon and kiosk, palms, stars, reflection; one lamp
//       burns at the gate; hit: its light grows a little
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, E = BTL.E, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const T = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 50, o = {}) => T(g, s, x, y, size, Object.assign({ font: LO, italic: true, weight: 400, color: C.inkSoft }, o));
  const sa = (e, a) => e && e.setAttribute('stroke-opacity', clamp01(a).toFixed(3));
  const fa = (e, a) => e && e.setAttribute('fill-opacity', clamp01(a).toFixed(3));
  let UID = 0;
  const wall = () => mix(C.paper, C.paperLight, 0.35), floorT = () => mix(C.paperDark, C.paper, 0.45);
  const SIL = () => C.paperDark, RIM = () => C.inkSoft;

  // slow drifting dust in a box
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: 1.3 + r() * 2.2, v: 0.006 + r() * 0.012, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.x + q.v * lt + 10) % 1, x = box[0] + u * w, y = box[1] + q.y * h + 9 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.35) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // candle / lamp flame (ink core, gold, red tongues); origin = wick base. update(lt, amp)
  function flame(parent, x, y, s = 1, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${s})` });
    if (o.body) {
      P0(g, 'M-18 0L-18 120L18 120L18 0Z', C.paperLight, 1);
      L0(g, 'M-18 120L-18 4C-10 -2 10 -2 18 4L18 120', C.ink, 2.6, 0.9);
      L0(g, 'M-10 8C-12 30-10 50-12 66', C.inkSoft, 2, 0.6);
      P0(g, E(0, 124, 54, 11), C.paperLight, 1); L0(g, E(0, 124, 54, 11), C.inkSoft, 2.4, 0.8);
    }
    L0(g, 'M0 2L1 -12', C.ink, 2.5, 0.9);
    const fl = [[C.red, 1, 0], [C.gold, 0.72, 1.3], [C.ink, 0.4, 2.1]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.92), k, ph: ph + (o.ph || 0) }));
    return {
      g,
      update(lt, amp = 1) {
        for (const f of fl) {
          const h = (64 + 5 * Math.sin(lt * 1.9 + f.ph) + 3 * Math.sin(lt * 3.1 + f.ph * 2)) * f.k * amp, w = 15 * f.k * Math.max(0.25, amp), lean = 2.2 * Math.sin(lt * 0.9 + f.ph), b = -8;
          f.e.setAttribute('d', h < 1 ? '' : `M${f1(-w)} ${b}C${f1(-w)} ${f1(b - h * 0.45)} ${f1(-w * 0.2 + lean)} ${f1(b - h * 0.72)} ${f1(lean)} ${f1(b - h)}C${f1(w * 0.2 + lean)} ${f1(b - h * 0.72)} ${f1(w)} ${f1(b - h * 0.45)} ${f1(w)} ${b}Z`);
        }
      },
    };
  }

  // ---------------------------------------------------------------- hieroglyph signs (box about ±50, facing right)
  const reed = dx => ({ f: [`M${dx} -26C${dx + 14} -30 ${dx + 16} -44 ${dx + 6} -52C${dx + 2} -44 ${dx - 2} -36 ${dx} -26Z`], s: [`M${dx} 44V-26`, `M${dx} -26C${dx + 14} -30 ${dx + 16} -44 ${dx + 6} -52C${dx + 2} -44 ${dx - 2} -36 ${dx} -26Z`] });
  const SIGNS = {
    p: { f: ['M-30-30H30V30H-30Z'], s: ['M-30-30H30V30H-30Z'] },                                         // stool (Q3)
    t: { f: ['M-42 18C-42-20 42-20 42 18Z'], s: ['M-42 18C-42-20 42-20 42 18Z'] },                       // bread (X1)
    o: { f: [], s: [E(0, -24, 17, 20), 'M-6-5C-10 14-18 30-26 46M6-5C8 14 10 30 12 46'] },             // lasso (V4)
    l: { f: ['M-50 26C-52 6-42-6-28-8C-10-10 6-12 16-16C20-30 34-36 44-30C52-26 54-14 50-8L44-4C40 4 40 12 42 16L58 18L58 26Z'],
      s: ['M-50 26C-52 6-42-6-28-8C-10-10 6-12 16-16C20-30 34-36 44-30C52-26 54-14 50-8L44-4C40 4 40 12 42 16L58 18L58 26Z', 'M-48 4C-58-2-60-14-52-20', 'M18-14C22-6 22 4 18 12'] },   // recumbent lion (E23)
    m: { f: ['M-14 42V-24C-14-42 14-42 14-24V42Z'], s: ['M-14 42V-24C-14-42 14-42 14-24V42Z', 'M-14 6H14'] },
    i: { f: [...reed(-13).f, ...reed(13).f], s: [...reed(-13).s, ...reed(13).s] },                       // two reeds (M17)
    e: reed(0),                                                                                          // reed (M17)
    s: { f: ['M-12 46L-12-22C-12-42 16-48 18-30C19-20 8-17 3-22L3 46Z'], s: ['M-12 46L-12-22C-12-42 16-48 18-30C19-20 8-17 3-22L3 46Z'] },   // folded cloth (S29)
    k: { f: ['M-38-12C-36 14-20 22 0 22C20 22 36 14 38-12Z'], s: ['M-38-12C-36 14-20 22 0 22C20 22 36 14 38-12Z', 'M38-8C50-10 54 4 44 12C40 15 36 14 33 12'] },   // basket (V31)
    a: { f: ['M-36 34C-30 14-24 0-12-10C-8-22-4-32 4-38C12-44 22-42 26-34L36-30L26-26C22-18 20-10 24-2C32 10 36 20 38 34Z'],
      s: ['M-36 34C-30 14-24 0-12-10C-8-22-4-32 4-38C12-44 22-42 26-34L36-30L26-26C22-18 20-10 24-2C32 10 36 20 38 34Z', 'M-12-4C0 4 12 8 22 8', 'M2 34V46M14 34V46'] },   // vulture (G1)
    h: { f: ['M-46-8C-20-14 20-12 40-10C50-9 50 2 40 2L-6 4C-10 12-22 14-28 8L-46 8Z'], s: ['M-46-8C-20-14 20-12 40-10C50-9 50 2 40 2L-6 4C-10 12-22 14-28 8L-46 8Z'] },   // hand (D46)
    r: { f: ['M-46 0C-22-18 22-18 46 0C22 18-22 18-46 0Z'], s: ['M-46 0C-22-18 22-18 46 0C22 18-22 18-46 0Z'] },   // mouth (D21)
    ra: { f: [E(0, 0, 36, 36)], s: [E(0, 0, 36, 36)], dot: [0, 0, 7] },                                  // sun disk (N5)
    ms: { f: ['M-8-46H8V-34H-8Z'], s: ['M-8-46H8V-34H-8Z', 'M-2-34C-6-10-20 12-24 38', 'M0-34V40', 'M2-34C6-10 20 12 24 38'], dots: [[-24, 41, 5], [0, 43, 5], [24, 41, 5]] },   // ms (F31)
  };
  const PTO = ['p', 't', 'o', 'l', 'm', 'i', 's'], PTO_L = ['P', 'T', 'O', 'L', 'M', 'İ', 'S'];
  const KLE = ['k', 'l', 'e', 'o', 'p', 'a', 'h', 'r', 'a'], KLE_L = ['K', 'L', 'E', 'O', 'P', 'A', 'T', 'R', 'A'];
  function sign(parent, key, x, y, k, o = {}) {
    const S = SIGNS[key], g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${k})` });
    const D = BTL.drawing(g), w = (o.w || 4) / k;
    for (const d of S.f) D.f(d, o.fill || C.paperLight, 1);
    for (const d of S.s) D.s(d, { w, color: o.color || C.ink });
    if (S.dot) D.f(E(...S.dot.slice(0, 2), S.dot[2], S.dot[2]), o.color || C.ink, 1);
    if (S.dots) for (const [cx, cy, r] of S.dots) D.f(E(cx, cy, r, r), o.color || C.ink, 1);
    const gg = el(g, 'g', { opacity: 0 });
    for (const d of S.s) L0(gg, d, C.gold, w * 1.35, 1);
    return { g, D, x, y, k, gold(a) { fade(gg, a); } };
  }
  // cartouche: horizontal (bar at the right end) or vertical (bar under it). Ring + inner hairline + gold overlay
  function cartouche(parent, cx, cy, w, h, o = {}) {
    const vert = !!o.vertical, g = el(parent, 'g'), D = BTL.drawing(g), sw = o.w || 5;
    const ring = ins => {
      const x0 = cx - w / 2 + ins, x1 = cx + w / 2 - ins, y0 = cy - h / 2 + ins, y1 = cy + h / 2 - ins;
      if (!vert) { const r = (y1 - y0) / 2; return `M${f1(x0 + r)} ${f1(y0)}H${f1(x1 - r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1 - r)} ${f1(y1)}H${f1(x0 + r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x0 + r)} ${f1(y0)}Z`; }
      const r = (x1 - x0) / 2; return `M${f1(x0)} ${f1(y0 + r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1)} ${f1(y0 + r)}V${f1(y1 - r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x0)} ${f1(y1 - r)}Z`;
    };
    const bar = vert ? `M${f1(cx - w / 2 + 14)} ${f1(cy + h / 2 + 20)}H${f1(cx + w / 2 - 14)}` : `M${f1(cx + w / 2 + 20)} ${f1(cy - h / 2 + 14)}V${f1(cy + h / 2 - 14)}`;
    D.f(ring(0), o.fill || mix(C.paperLight, C.paper, 0.25), 1);
    D.s(ring(0), { w: sw, color: o.color || C.ink }); D.s(ring(15), { w: sw * 0.4, color: C.inkSoft }); D.s(bar, { w: sw, color: o.color || C.ink });
    const gold = L0(g, ring(0) + bar, C.gold, sw + 2, 0);
    return { g, D, gold: a => sa(gold, a) };
  }
  // the Ramses cartouche, vertical, built about (0, 0): sun (ra), ms, two folded cloths (s); ~250 x 640
  function ramsesCart(parent, o = {}) {
    const car = cartouche(parent, 0, 0, 250, 620, { vertical: true, color: o.color, fill: o.fill });
    const so = { color: o.color, fill: o.fill };
    const signs = [sign(parent, 'ra', 0, -195, 1.55, so), sign(parent, 'ms', 0, 5, 1.75, so), sign(parent, 's', -44, 195, 1.45, so), sign(parent, 's', 44, 195, 1.45, so)];
    return { car, signs };
  }

  // ---------------------------------------------------------------- the black stone: A's drawing (window.ROSA, bt_rosetta_a.js)
  // so it is the same stone as in the opening. Centre (x, y); k = on-screen height / 750
  function rosaStone(parent, defs, x, y, k) {
    const R = window.ROSA, sg = R.place(parent, x, y, k), ST = R.stone(sg, defs);
    ST.bands.forEach(b => { draw(b, 1); b.setAttribute('stroke-opacity', '0.75'); });
    draw(ST.outline, 1);
    return sg;
  }

  // ---------------------------------------------------------------- open book (origin = spine centre, ~600 x 190)
  const COPT = {   // Coptic letters that have no Latin look-alike (hori, shai, khai, fai, janja, shima); baseline-left, x-height 40
    'ϩ': ['M4-52C14-62 30-56 26-42C22-30 0-28 2-14C4 0 24 0 30-8C34 4 30 18 20 24', 34],
    'ϣ': ['M0-40C0-10 8 0 16 0C24 0 26-14 26-30M26-14C26 0 34 4 42 0C50-4 52-20 52-40M26 0V24', 52],
    'ϧ': ['M0-62V0M0-30C20-44 36-30 30-14C26 0 8 2 4-6M30-14C34 6 28 20 16 24', 36],
    'ϥ': ['M2-36C2-56 30-58 30-38C30-24 14-22 14-8V24M14-8C14 2 26 4 32-2', 34],
    'ϫ': ['M0-40H34M17-40V-8C17 6 4 10-4 2', 34],
    'ϭ': ['M30-50C14-62-2-48 8-34C18-22 34-20 30-4C26 10 4 10-2 0', 32],
  };
  function coptic(str, x, y, s) {
    let d = '', cx = x;
    for (const ch of str) {
      if (ch === ' ') { cx += 26 * s; continue; }
      const [p, w] = COPT[ch];
      let cmd = '', k = 0;
      for (const tok of p.match(/[A-Za-z]|-?\d*\.?\d+/g)) {
        if (/[A-Za-z]/.test(tok)) { cmd = tok; k = 0; d += tok; continue; }
        const v = +tok, isX = cmd === 'H' || (cmd !== 'V' && k % 2 === 0);
        d += (k ? ' ' : '') + f1(isX ? cx + v * s : y + v * s); k++;
      }
      cx += (w + 16) * s;
    }
    return d;
  }
  function scribble(x0, y, len, seed, hh = 1) {
    const r = rng(seed); let d = `M${f1(x0)} ${f1(y)}`, x = x0;
    while (x < x0 + len) {
      if (r() < 0.12) { x += 16 + r() * 10; d += `M${f1(x)} ${f1(y)}`; continue; }
      const w = (8 + r() * 6) * hh, h = (8 + r() * 10) * hh, tall = r() < 0.18 ? 14 * hh : 0;
      d += `C${f1(x + w * 0.2)} ${f1(y - h - tall)} ${f1(x + w * 0.9)} ${f1(y - h - tall)} ${f1(x + w * 0.6)} ${f1(y - 2)}C${f1(x + w * 0.5)} ${f1(y + 3)} ${f1(x + w * 0.9)} ${f1(y + 2)} ${f1(x + w)} ${f1(y)}`;
      x += w;
    }
    return d;
  }
  function openBook(parent, x, y, k, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${k})` });
    const pageT = mix(C.paperLight, C.ink, 0.12);
    const L = 'M-300-30C-200-70-60-60 0-30L0 160C-60 130-200 120-300 160Z', R = 'M300-30C200-70 60-60 0-30L0 160C60 130 200 120 300 160Z';
    P0(g, 'M-312-18L-312 172C-200 132-60 142 0 172C60 142 200 132 312 172L312-18Z', mix(C.paperDark, C.paperLight, 0.4), 1);
    const pl = P0(g, L, pageT, 1), pr = P0(g, R, pageT, 1);
    const lit = P0(g, R, C.gold, 0);
    L0(g, L + R, C.ink, 3 / k, 0.85); L0(g, 'M0-30V160', C.inkSoft, 2 / k, 0.9);
    let lines = ''; for (let i = 0; i < 6; i++) lines += scribble(-270, -8 + i * 26 + i * 0.5, 230, 70 + i, 0.7);
    L0(g, lines, C.inkSoft, 1.8, 0.75);
    let cg = null;
    if (o.coptic) {
      const d = coptic('ϩϣϧ', 60, 44, 0.95) + coptic('ϥϫϭϣ', 46, 122, 0.95);
      L0(g, d, C.inkSoft, 3, 0.5);
      cg = L0(g, d, C.gold, 4, 0, { pathLength: 1 });
    } else {
      let rl = ''; for (let i = 0; i < 6; i++) rl += scribble(40, -8 + i * 26, 230, 90 + i, 0.7);
      L0(g, rl, C.inkSoft, 1.8, 0.75);
    }
    return { g, lit, cg, pl, pr };
  }

  // ---------------------------------------------------------------- quill (origin = tip, feather up and to the right)
  function quill(parent) {
    const g = el(parent, 'g'), D = BTL.drawing(g);
    const vane = 'M30-40C90-130 200-250 340-330C380-350 400-340 380-310C300-210 180-110 60-30Z';
    D.f(vane, C.paperLight, 1); D.s(vane, { w: 3 });
    D.s('M0 0L40-46C130-150 250-260 372-334', { w: 3 });
    let barbs = ''; for (let i = 1; i < 12; i++) { const u = i / 12, x = 40 + u * 320, yy = -46 - u * 290; barbs += `M${f1(x)} ${f1(yy)}l${f1(-30 + u * 8)} ${f1(-14 + u * 6)}M${f1(x)} ${f1(yy)}l${f1(16 - u * 4)} ${f1(26 - u * 6)}`; }
    D.s(barbs, { w: 1.6, color: C.inkSoft, alpha: 0.8 });
    D.reveal(1);
    return g;
  }

  // ---------------------------------------------------------------- faceless profile bust (facing +x; bottom at y 0, top ~ -560)
  const BUST = 'M-230 0C-230-80-200-130-120-150L-90-160C-80-200-90-250-110-290C-150-350-150-470-60-520C0-552 80-540 100-470C108-440 110-415 104-400C112-380 130-350 138-336C140-328 130-322 116-322C120-312 122-304 116-298C122-292 120-282 112-280C118-266 116-246 96-238C80-232 64-226 56-210L60-170C90-160 120-150 150-130C200-100 220-50 225 0Z';
  const HAIR = {
    young: 'M102-466C82-556-62-574-130-486C-162-442-158-372-120-314C-106-342-92-382-62-404C-20-432 42-440 102-466Z',
    champ: 'M106-458C98-566-70-598-150-500C-186-450-176-362-128-300C-100-330-60-400-10-420C34-440 74-440 106-458Z',
  };
  function bust(parent, kind, x, y, s, face) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${f1(face * s)} ${s})` });
    const rw = 3 / s;
    el(g, 'path', { d: BUST, fill: SIL(), stroke: RIM(), 'stroke-width': rw * 2, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' });
    el(g, 'path', { d: HAIR[kind], fill: mix(SIL(), C.paperLight, 0.35), stroke: RIM(), 'stroke-width': rw * 1.4, 'stroke-opacity': 0.7, 'stroke-linejoin': 'round' });
    if (kind === 'champ') L0(g, 'M60-470C20-500-40-506-90-470M40-446C0-470-60-470-110-430', RIM(), rw * 1.2, 0.45);   // a few soft strands
    L0(g, 'M-90-160C-60-120 20-112 60-170M56-210C72-190 84-170 62-150M62-150C42-100 32-50 36 0', RIM(), rw * 1.3, 0.7);
    const rim = L0(g, BUST, C.gold, rw * 1.6, 0);
    return { g, rim };
  }

  // ================================================================ bt_rosb_cartouche
  SH.bt_rosb_cartouche = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'ptolemy', g = el(svg, 'g');
      const pool = BTL.glow(svg, defs, 960, 450, 780, C.stain, 0.12, g);
      const breathe = lt => pool.set(0.12 + 0.03 * Math.sin(lt * 0.6));

      if (mode === 'frame' || mode === 'ptolemy') {
        const cy = 440, sp = 172, k = 1.25;
        const car = cartouche(g, 960, cy, 1380, 290);
        const signs = PTO.map((key, i) => sign(g, key, 960 + (i - 3) * sp, cy, k));
        const letters = mode === 'ptolemy' ? PTO_L.map((L, i) => T(g, L, 960 + (i - 3) * sp, cy + 245, 64, { weight: 400 })) : [];
        const name = mode === 'ptolemy' ? ital(g, 'Ptolemaios', 960, cy - 205, 62, { color: C.ink }) : null;
        const word = mode === 'frame' ? ital(g, 'kartuş', 960, cy + 255, 76, { color: C.gold }) : null;
        return {
          update(lt, dur, cues) {
            breathe(lt);
            const th = cue(cues, 'hit', dur * 0.55);
            if (mode === 'frame') {
              car.D.reveal(BTL.ease(lt, 0.1, 2.6));
              signs.forEach((s, i) => { s.D.reveal(BTL.ease(lt, 1.4 + i * 0.3, 1.8)); fade(s.g, 0.32); });
              fade(word, BTL.ease(lt, th - 0.2, 1.2));
              car.gold(0.35 * BTL.ease(lt, th - 0.2, 1.4));
            } else {
              car.D.reveal(1);
              signs.forEach((s, i) => { s.D.reveal(1); fade(s.g, 0.32 + 0.68 * BTL.ease(lt, 0.1 + i * 0.22, 1.1)); s.gold(0.55 * BTL.ease(lt, th + i * 0.24, 0.8)); });
              fade(name, BTL.ease(lt, 0.9, 1.3));
              letters.forEach((e, i) => fade(e, BTL.ease(lt, th + i * 0.24, 0.8)));
            }
          },
        };
      }

      if (mode === 'kleopatra') {
        // the obelisk, faint, with columns of marks
        const ob = el(g, 'g'), OB = 'M896 940L912 170L960 96L1008 170L1024 940Z';
        P0(ob, OB, mix(C.paperLight, C.paper, 0.3), 1);
        L0(ob, OB, C.inkSoft, 2.5, 0.8);
        const r = rng(41); let mk = '';
        for (let y = 200; y < 920; y += 24) for (const x of [936, 960, 984]) { const t = r(); mk += t < 0.4 ? `M${x} ${y - 7}V${y + 7}` : t < 0.7 ? E(x, y, 5, 5) : `M${x - 6} ${y}h12`; }
        L0(ob, mk, C.inkSoft, 1.6, 0.55);
        const grow = el(g, 'g');
        const sp = 136, car = cartouche(grow, 0, 0, 1330, 240);
        const signs = KLE.map((key, i) => sign(grow, key, (i - 4) * sp, 0, 1.02));
        car.D.reveal(1); signs.forEach(s => s.D.reveal(1));
        const name = ital(g, 'Kleopatra', 960, 670, 66, { color: C.ink });
        return {
          update(lt, dur, cues) {
            breathe(lt);
            const th = cue(cues, 'hit', dur * 0.4), tb = cue(cues, 'b', dur * 0.75), q = BTL.ease(lt, th - 0.2, 2);
            fade(ob, BTL.ease(lt, 0, 1.6) * (1 - 0.72 * q));
            const s = 0.075 + 0.925 * q, y = 330 + 130 * q;
            grow.setAttribute('transform', `translate(960 ${f1(y)}) scale(${s.toFixed(4)})`);
            fade(grow, 0.75 * BTL.ease(lt, 0.4, 1.2) + 0.25 * q);
            car.gold(0.4 * BTL.ease(lt, tb - 0.2, 1.2));
            fade(name, BTL.ease(lt, tb - 0.2, 1.2));
          },
        };
      }

      if (mode === 'compare') {
        const yT = 300, yB = 650, spT = 142, spB = 122;
        const cT = cartouche(g, 960, yT, 1100, 220), cB = cartouche(g, 960, yB, 1240, 210);
        const sT = PTO.map((key, i) => sign(g, key, 960 + (i - 3) * spT, yT, 0.95));
        const sB = KLE.map((key, i) => sign(g, key, 960 + (i - 4) * spB, yB, 0.88));
        const pairs = [[0, 4, 'P'], [2, 3, 'O'], [3, 1, 'L']];
        const links = pairs.map(([a, b, L], j) => {
          const x0 = sT[a].x, x1 = sB[b].x, y0 = yT + 78, y1 = yB - 72;
          const e = L0(g, `M${f1(x0)} ${y0}C${f1(x0)} ${y0 + 90} ${f1(x1)} ${y1 - 90} ${f1(x1)} ${y1}`, C.gold, 3, 0.9, { pathLength: 1 });
          draw(e, 0);
          const lab = T(g, L, (x0 + x1) / 2 + (j === 1 ? 34 : -34), (y0 + y1) / 2 + 18, 52, { weight: 400, color: C.gold });
          return { e, lab, a, b };
        });
        return {
          update(lt, dur, cues) {
            breathe(lt);
            const th = cue(cues, 'hit', dur * 0.55);
            cT.D.reveal(BTL.ease(lt, 0, 1.4)); cB.D.reveal(BTL.ease(lt, 0.3, 1.4));
            sT.forEach((s, i) => s.D.reveal(BTL.ease(lt, 0.3 + i * 0.12, 1)));
            sB.forEach((s, i) => s.D.reveal(BTL.ease(lt, 0.6 + i * 0.1, 1)));
            const hot = new Set(), hotB = new Set();
            links.forEach((l, j) => {
              const q = BTL.ease(lt, th + j * 0.45, 1.1);
              draw(l.e, q); fade(l.lab, BTL.ease(lt, th + j * 0.45 + 0.5, 0.8));
              sT[l.a].gold(q); sB[l.b].gold(q); hot.add(l.a); hotB.add(l.b);
            });
            const dim = 1 - 0.45 * BTL.ease(lt, th, 1.2);
            sT.forEach((s, i) => fade(s.g, hot.has(i) ? 1 : dim)); sB.forEach((s, i) => fade(s.g, hotB.has(i) ? 1 : dim));
          },
        };
      }

      // vertical Ramses cartouche: mes, ramses, paper
      if (mode === 'paper') {
        const sx0 = 690, sx1 = 1230, sy0 = 90, sy1 = 860;
        const sheetT = mix(C.paperLight, C.ink, 0.13);
        const sheet = P0(g, `M${sx0} ${sy0}L${sx1} ${sy0 + 8}L${sx1 - 6} ${sy1}L${sx0 + 4} ${sy1 - 6}Z`, sheetT, 1);
        const edge = L0(g, `M${sx0} ${sy0}L${sx1} ${sy0 + 8}L${sx1 - 6} ${sy1}L${sx0 + 4} ${sy1 - 6}Z`, C.inkSoft, 2.5, 0.9);
        const cg = el(g, 'g', { transform: 'translate(960 470) scale(0.95)' });
        const R = ramsesCart(cg, { color: C.inkSoft, fill: sheetT });
        const gr = L0(g, scribble(sx0 + 40, sy1 - 40, 200, 3, 0.6), C.inkSoft, 1.6, 0.5);
        return {
          update(lt, dur, cues) {
            breathe(lt);
            const th = cue(cues, 'hit', dur * 0.3), tb = cue(cues, 'b', dur * 0.7);
            R.car.D.reveal(BTL.ease(lt, 0.1, 2)); R.signs.forEach((s, i) => s.D.reveal(BTL.ease(lt, 0.8 + i * 0.4, 1.6)));
            R.car.gold(0.4 * BTL.ease(lt, th, 1.4));
            const q = BTL.ease(lt, tb - 0.2, 2.2);
            fa(sheet, 1 - 0.55 * q); sa(edge, 0.9 * (1 - q)); sa(gr, 0.5 * (1 - q));
            pool.set((0.12 + 0.03 * Math.sin(lt * 0.6)) * (1 - 0.4 * q));
          },
        };
      }
      const ram = mode === 'ramses', cx = ram ? 760 : 960, ks = ram ? 1.08 : 1;
      const cg = el(g, 'g', { transform: `translate(${cx} 445) scale(${ks})` });
      const R = ramsesCart(cg);
      const labs = ram ? [] : [['ra', -180], ['mes', 20], ['s', 210]].map(([s, y]) => ital(g, s, cx + 200, 445 + y, 58, { color: C.gold, anchor: 'start' }));
      const word = ram ? T(g, 'Ramses', 1360, 500, 150, { weight: 300 }) : null;
      const wline = ram ? L0(g, 'M1140 560H1580', C.gold, 2.5, 0.9, { pathLength: 1 }) : null;
      if (wline) draw(wline, 0);
      return {
        update(lt, dur, cues) {
          breathe(lt);
          const th = cue(cues, 'hit', dur * 0.35), tb = cue(cues, 'b', dur * 0.7);
          if (ram) {
            R.car.D.reveal(BTL.ease(lt, 0, 0.8)); R.signs.forEach((s, i) => s.D.reveal(BTL.ease(lt, 0.1 + i * 0.12, 0.7)));
            const q = clamp01((lt - th) / 0.4);
            R.car.gold(q); R.signs.forEach(s => s.gold(0.5 * q));
            fade(word, q); draw(wline, BTL.ease(lt, th + 0.2, 1.2));
            pool.set(0.12 + 0.08 * q + 0.03 * Math.sin(lt * 0.6));
            return;
          }
          R.car.D.reveal(BTL.ease(lt, 0, 1.4));
          R.signs[0].D.reveal(BTL.ease(lt, 0.2, 1.2));
          R.signs[1].D.reveal(BTL.ease(lt, th - 0.2, 1.4));
          R.signs[2].D.reveal(BTL.ease(lt, tb - 0.2, 1.2)); R.signs[3].D.reveal(BTL.ease(lt, tb + 0.2, 1.2));
          R.signs[1].gold(0.5 * BTL.ease(lt, th, 1)); R.signs[2].gold(0.5 * BTL.ease(lt, tb, 1)); R.signs[3].gold(0.5 * BTL.ease(lt, tb + 0.3, 1));
          fade(labs[0], BTL.ease(lt, 0.6, 1)); fade(labs[1], BTL.ease(lt, th, 1)); fade(labs[2], BTL.ease(lt, tb, 1));
        },
      };
    },
  };

  // ================================================================ bt_rosb_sign
  SH.bt_rosb_sign = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'sun', g = el(svg, 'g'), cx = 960, cy = mode === 'dual' ? 440 : 410;
      const R = mode === 'glow' ? 118 : mode === 'dual' ? 130 : 160;
      const pool = BTL.glow(svg, defs, cx, cy, mode === 'glow' ? 620 : 700, C.stain, 0.1, g);
      const warm = BTL.glow(svg, defs, cx, cy, R * 2.2, C.gold, 0, g);
      const D = BTL.drawing(g);
      D.f(E(cx, cy, R, R), mix(C.paperLight, C.paper, 0.2), 1);
      D.s(E(cx, cy, R, R), { w: 7 });
      D.s(E(cx, cy, R - 16, R - 16), { w: 2, color: C.inkSoft, alpha: 0.8 });
      D.f(E(cx, cy, R * 0.15, R * 0.15), C.ink, 1);
      const ring = L0(g, E(cx, cy, R + 22, R + 22), C.gold, 2.5, 0.85, { pathLength: 1 }); draw(ring, 0);
      const ds = motes(g, 17, 22, [cx - 520, cy - 340, cx + 520, cy + 360], { alpha: 0.28 });
      let ra = null, left = null, right = null, ll = null, lr = null;
      if (mode === 'sun') ra = T(g, 'Ra', cx, cy + R + 190, 150, { weight: 400, color: C.gold });
      if (mode === 'glow') ra = T(g, 'Ra', cx, cy + R + 150, 110, { weight: 300, color: C.gold });
      if (mode === 'dual') {
        left = ital(g, 'resim', cx - R - 300, cy + 26, 84, { color: C.gold });
        right = ital(g, 'ses', cx + R + 290, cy + 26, 84, { color: C.gold });
        ll = L0(g, `M${cx - R - 18} ${cy}H${cx - R - 190}`, C.gold, 2.5, 0.9, { pathLength: 1 });
        lr = L0(g, `M${cx + R + 18} ${cy}H${cx + R + 200}`, C.gold, 2.5, 0.9, { pathLength: 1 });
        draw(ll, 0); draw(lr, 0);
      }
      return {
        update(lt, dur, cues) {
          ds.update(lt);
          const th = cue(cues, 'hit', dur * 0.4), tb = cue(cues, 'b', dur * 0.7), br = 0.03 * Math.sin(lt * 0.55);
          if (mode === 'sun') {
            D.reveal(BTL.ease(lt, 0.15, 2));
            const q = BTL.ease(lt, th - 0.3, 1.8);
            pool.set(0.1 + 0.1 * q + br); warm.set(0.16 * q * (0.9 + 0.1 * Math.sin(lt * 0.8)));
            draw(ring, BTL.ease(lt, th, 2.2));
            fade(ra, BTL.ease(lt, tb - 0.2, 1.2));
          } else if (mode === 'dual') {
            D.reveal(BTL.ease(lt, 0, 1.2));
            pool.set(0.12 + br); warm.set(0.1 + 0.04 * Math.sin(lt * 0.7));
            draw(ll, BTL.ease(lt, th - 0.2, 1)); fade(left, BTL.ease(lt, th, 1));
            draw(lr, BTL.ease(lt, tb - 0.2, 1)); fade(right, BTL.ease(lt, tb, 1));
            draw(ring, BTL.ease(lt, tb + 0.4, 2));
          } else {
            D.reveal(BTL.ease(lt, 0.2, 2.4));
            const grow = BTL.ease(lt, 0, Math.max(3, dur));
            pool.set(0.04 + 0.2 * grow + br); warm.set(0.18 * grow);
            fade(ra, BTL.ease(lt, th, 1.4));
            draw(ring, BTL.ease(lt, th + 0.3, 2));
          }
        },
      };
    },
  };

  // ================================================================ bt_rosb_desk (Young's desk at night)
  SH.bt_rosb_desk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), TY = 560;
      P0(g, `M-100 -100L2020 -100L2020 ${TY}L-100 ${TY}Z`, wall(), 1);
      P0(g, `M-100 ${TY}L2020 ${TY}L2020 1200L-100 1200Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
      L0(g, `M-100 ${TY}L2020 ${TY}`, C.inkSoft, 2.5, 0.7);
      let wood = ''; for (let i = 0; i < 6; i++) wood += `M-100 ${TY + 40 + i * 70}C400 ${TY + 30 + i * 72} 1200 ${TY + 52 + i * 70} 2020 ${TY + 40 + i * 71}`;
      L0(g, wood, C.inkSoft, 1.4, 0.22);
      const light = BTL.glow(svg, defs, 520, 430, 820, C.stain, 0.26, g);
      const warm = BTL.glow(svg, defs, 420, 360, 260, C.gold, 0.14, g);
      const can = flame(g, 420, 440, 1.15, { body: true, ph: 1.2 });
      // the notebook (open, slightly in perspective)
      const pageT = mix(C.paperLight, C.ink, 0.12);
      const LP = 'M640 640C760 610 880 608 980 622L980 846C880 834 760 836 616 862Z', RP = 'M980 622C1080 608 1200 610 1320 640L1344 862C1200 836 1080 834 980 846Z';
      P0(g, 'M610 650L980 634L1350 650L1360 874L980 858L604 874Z', mix(C.paperDark, C.paperLight, 0.4), 1);
      P0(g, LP, pageT, 1); P0(g, RP, pageT, 1);
      L0(g, LP + RP, C.ink, 3, 0.85); L0(g, 'M980 622V846', C.inkSoft, 2, 0.9);
      let ln = ''; for (let i = 0; i < 7; i++) ln += scribble(670 + i * 2, 664 + i * 26, 270 - i * 4, 20 + i, 0.75);
      for (let i = 0; i < 3; i++) ln += scribble(1012, 660 + i * 26, 270, 40 + i, 0.75);
      L0(g, ln, C.inkSoft, 1.8, 0.8);
      const lineY = 740, lx0 = 1012, lx1 = 1180;
      const wr = L0(g, scribble(lx0, lineY, lx1 - lx0, 55, 0.75), C.ink, 2.2, 0.95, { pathLength: 1 }); draw(wr, 0);
      const qg = el(g, 'g'), q = quill(qg);
      const lab = ital(g, P.label || 'Thomas Young', 1640, 250, 56, { color: C.ink, anchor: 'end' });
      const ds = motes(g, 23, 24, [200, 150, 1300, 560], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); can.update(lt); light.set(0.26 + 0.03 * Math.sin(lt * 0.7)); warm.set(0.14 + 0.03 * Math.sin(lt * 1.1));
          const th = cue(cues, 'hit', dur * 0.3);
          const wp = clamp01(lt / Math.max(0.5, th)) * 0.62;            // the half line, written until the stop
          draw(wr, wp);
          const tipX = lx0 + (lx1 - lx0) * wp, tipY = lineY - 2;
          const m = BTL.ease(lt, th + 0.2, 2.4);                        // then the quill is laid down beside the book
          const x = lerp(tipX, 1440, m), y = lerp(tipY, 830, m) - 60 * Math.sin(Math.PI * m), rot = lerp(0, 38, m);
          qg.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${rot.toFixed(2)}) scale(0.8)`);
          fade(lab, BTL.ease(lt, 0.6, 1.4));
        },
      };
    },
  };

  // ================================================================ bt_rosb_books
  SH.bt_rosb_books = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), TY = 700;
      P0(g, `M-100 -100L2020 -100L2020 ${TY}L-100 ${TY}Z`, wall(), 1);
      P0(g, `M-100 ${TY}L2020 ${TY}L2020 1200L-100 1200Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
      L0(g, `M-100 ${TY}L2020 ${TY}`, C.inkSoft, 2.5, 0.7);
      const light = BTL.glow(svg, defs, 1300, 460, 820, C.stain, 0.24, g);
      const warm = BTL.glow(svg, defs, 1560, 380, 240, C.gold, 0.12, g);
      const can = flame(g, 1560, 470, 1.05, { body: true, ph: 0.4 });
      // a stack of books lying flat, spines toward us
      const books = [[470, 84, -6], [440, 70, 10], [500, 92, -4], [420, 64, 8], [450, 72, -2]];
      let y = TY;
      const stack = el(g, 'g'), spines = [];
      books.forEach(([w, h, dx], i) => {
        const x0 = 720 - w / 2 + dx, y0 = y - h;
        const tone = mix(C.paperLight, i % 2 ? C.inkSoft : C.paper, i % 2 ? 0.18 : 0.3);
        const bg = el(stack, 'g');
        P0(bg, `M${x0} ${y0}h${w}v${h}h${-w}z`, tone, 1);
        L0(bg, `M${x0} ${y0}h${w}v${h}h${-w}z`, C.ink, 2.6, 0.8);
        L0(bg, `M${x0 + 30} ${y0 + 8}v${h - 16}M${x0 + w - 30} ${y0 + 8}v${h - 16}M${x0 + 30} ${y0 + h / 2}H${x0 + w - 30}`, C.inkSoft, 1.8, 0.6);
        spines.push({ bg, x0, y0, w, h });
        y = y0;
      });
      // the Coptic book: lies on top of the stack, slides forward onto the table and opens
      const top = spines[spines.length - 1];
      const mover = el(g, 'g'), cb = el(mover, 'g');
      const bw = 400, bh = 60;
      P0(cb, `M${-bw / 2} ${-bh}h${bw}v${bh}h${-bw}z`, mix(C.paperLight, C.gold, 0.12), 1);
      L0(cb, `M${-bw / 2} ${-bh}h${bw}v${bh}h${-bw}z`, C.ink, 2.6, 0.85);
      L0(cb, `M${-bw / 2 + 26} ${-bh + 8}v${bh - 16}M${bw / 2 - 26} ${-bh + 8}v${bh - 16}`, C.gold, 2, 0.7);
      const ob = openBook(g, 1180, 760, 0.82, { coptic: true });
      fade(ob.g, 0);
      const lab = ital(g, P.label || 'Champollion', 1700, 210, 58, { color: C.ink, anchor: 'end' });
      const ds = motes(g, 29, 22, [500, 160, 1700, 680], { alpha: 0.3 });
      const sx = 720, sy = top.y0;
      return {
        update(lt, dur, cues) {
          ds.update(lt); can.update(lt); light.set(0.24 + 0.03 * Math.sin(lt * 0.6)); warm.set(0.12 + 0.03 * Math.sin(lt * 1.2));
          const th = cue(cues, 'hit', dur * 0.25), tb = cue(cues, 'b', dur * 0.6), tc = cue(cues, 'c', dur * 0.85);
          fade(lab, BTL.ease(lt, th - 0.1, 1.2));
          const m = BTL.ease(lt, tb, 1.3);
          const x = lerp(sx, 1180, m), yy = lerp(sy, 830, m) - 70 * Math.sin(Math.PI * m);
          mover.setAttribute('transform', `translate(${f1(x)} ${f1(yy)})`);
          const op = BTL.ease(lt, tb + 1.1, 0.8);
          fade(mover, 1 - op); fade(ob.g, op);
          if (ob.cg) { draw(ob.cg, BTL.ease(lt, Math.max(tc - 0.3, tb + 1.3), 1.4)); sa(ob.cg, 0.95); }
          fa(ob.lit, 0.12 * BTL.ease(lt, Math.max(tc - 0.3, tb + 1.3), 1.4));
        },
      };
    },
  };

  // ================================================================ bt_rosb_church
  SH.bt_rosb_church = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), FY = 820, cx = 960, ar = 330, spring = 470;
      P0(g, `M-100 -100L2020 -100L2020 ${FY}L-100 ${FY}Z`, wall(), 1);
      // stone courses
      const r = rng(61); let cs = '';
      for (let y = 40, row = 0; y < FY; y += 76, row++) { cs += `M-100 ${y}H2020`; for (let x = -100 + (row % 2) * 90 + r() * 30; x < 2020; x += 190 + r() * 40) if (Math.abs(x - cx) > ar + 70 || y < spring - ar - 70) cs += `M${f1(x)} ${y}v76`; }
      L0(g, cs, C.inkSoft, 1.4, 0.3);
      // the apse arch, darker inside
      const archD = `M${cx - ar} ${FY}V${spring}A${ar} ${ar} 0 0 1 ${cx + ar} ${spring}V${FY}Z`;
      P0(g, archD, mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, `M${cx - ar} ${FY}V${spring}A${ar} ${ar} 0 0 1 ${cx + ar} ${spring}V${FY}`, C.ink, 3.5, 0.85);
      L0(g, `M${cx - ar - 50} ${FY}V${spring}A${ar + 50} ${ar + 50} 0 0 1 ${cx + ar + 50} ${spring}V${FY}`, C.inkSoft, 2, 0.7);
      // a small Coptic cross above the arch
      const kx = cx, ky = spring - ar - 110;
      L0(g, `M${kx} ${ky - 34}V${ky + 34}M${kx - 34} ${ky}H${kx + 34}M${kx - 10} ${ky - 34}H${kx + 10}M${kx - 10} ${ky + 34}H${kx + 10}M${kx - 34} ${ky - 10}V${ky + 10}M${kx + 34} ${ky - 10}V${ky + 10}`, C.gold, 3, 0.75);
      P0(g, `M-100 ${FY}L2020 ${FY}L2020 1200L-100 1200Z`, floorT(), 1);
      L0(g, `M-100 ${FY}H2020`, C.inkSoft, 2.5, 0.7);
      // the hanging lamp
      const ly = 330;
      L0(g, `M${cx} ${spring - ar}V${ly - 40}M${cx} ${ly - 40}L${cx - 40} ${ly - 4}M${cx} ${ly - 40}L${cx + 40} ${ly - 4}`, C.inkSoft, 2, 0.85);
      const lampG = BTL.glow(svg, defs, cx, ly - 20, 380, C.gold, 0.2, g);
      P0(g, `M${cx - 44} ${ly}C${cx - 40} ${ly + 44} ${cx + 40} ${ly + 44} ${cx + 44} ${ly}Z`, mix(C.paperLight, C.gold, 0.2), 1);
      L0(g, `M${cx - 44} ${ly}C${cx - 40} ${ly + 44} ${cx + 40} ${ly + 44} ${cx + 44} ${ly}Z`, C.ink, 2.6, 0.85);
      const fl = flame(g, cx, ly + 2, 0.7, { ph: 0.8 });
      // the lectern and its open book
      const pool = BTL.glow(svg, defs, cx, 650, 300, C.stain, 0.1, g);
      L0(g, `M${cx} ${FY}V680M${cx - 70} ${FY}H${cx + 70}`, C.ink, 6, 0.85);
      P0(g, `M${cx - 160} 690L${cx + 160} 690L${cx + 140} 650L${cx - 140} 650Z`, mix(C.paperLight, C.paperDark, 0.3), 1);
      L0(g, `M${cx - 160} 690L${cx + 160} 690L${cx + 140} 650L${cx - 140} 650Z`, C.ink, 2.6, 0.85);
      const ob = openBook(g, cx, 588, 0.42, { coptic: true });
      const ds = motes(g, 37, 22, [cx - 500, 200, cx + 500, 780], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); fl.update(lt); lampG.set(0.2 + 0.04 * Math.sin(lt * 0.9));
          const th = cue(cues, 'hit', dur * 0.6), q = BTL.ease(lt, th - 0.2, 1.8);
          pool.set(0.08 + 0.22 * q); fa(ob.lit, 0.2 * q);
          if (ob.cg) draw(ob.cg, q);
        },
      };
    },
  };

  // ================================================================ bt_rosb_abusimbel
  function colossus(g, x, base, s, broken) {
    const cg = el(g, 'g', { transform: `translate(${x} ${base}) scale(${s})` });
    const col = mix(C.paperLight, C.ink, 0.07), rim = C.inkSoft;
    const F = d => el(cg, 'path', { d, fill: col, stroke: rim, 'stroke-width': 2.4 / s, 'stroke-opacity': 0.9, 'stroke-linejoin': 'round' });
    F('M-160-270L-124-270L-124 0L-160 0Z'); F('M160-270L124-270L124 0L160 0Z');         // throne sides
    F('M-112-140L-32-140L-30 0L-114 0Z'); F('M112-140L32-140L30 0L114 0Z');             // lower legs
    F('M-126-196L126-196L120-136L-120-136Z');                                          // knees
    if (broken) {
      F('M-112-196L-104-262L-70-250L-50-280L-10-262L20-292L56-268L88-284L112-196Z');   // the broken torso
      F('M-250 0L-240-50L-190-62L-150-40L-140 0Z'); F('M170 0L180-34L230-40L262 0Z');   // fallen pieces at its feet
      return cg;
    }
    F('M-112-336L112-336L104-196L-104-196Z');                                          // torso
    L0(cg, 'M-100-300C-104-260-100-220-80-200M100-300C104-260 100-220 80-200', rim, 2 / s, 0.8);   // arms on the knees
    // nemes headcloth: rounded top, wings out over the ears, lappets down on the chest; the face left plain
    F('M-50-548C-50-596 50-596 50-548L56-470L96-404L74-336L-74-336L-96-404L-56-470Z');
    L0(cg, 'M-54-520H54M-56-496H56M-70-440L-90-404M70-440L90-404M-60-420L-76-370M60-420L76-370', rim, 1.4 / s, 0.5);
    el(cg, 'path', { d: 'M-32-524L32-524L30-430C20-410-20-410-30-430Z', fill: mix(col, C.paper, 0.35), stroke: rim, 'stroke-width': 1.6 / s, 'stroke-opacity': 0.7 });
    F('M-9-414h18v40h-18z');                                                            // beard
    F('M-30-588L30-588L22-608L-22-608Z');                                               // low crown band
    return cg;
  }
  SH.bt_rosb_abusimbel = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g');
      const sky = BTL.stars(g, 140, 83, [0, 0, 1920, 300]);
      const CL = 'M150 1000L230 230L560 214L960 206L1380 214L1700 230L1780 1000Z';
      P0(g, CL, C.paperLight, 1);
      L0(g, 'M150 1000L230 230L560 214L960 206L1380 214L1700 230L1780 1000', C.inkSoft, 2.4, 0.8);
      let cor = ''; for (let x = 300; x < 1640; x += 34) cor += `M${x} 236v22`;
      L0(g, cor + 'M260 266H1670', C.inkSoft, 1.6, 0.6);
      const r = rng(91); let cr = '';
      for (let i = 0; i < 40; i++) { const x = 240 + r() * 1440, y = 280 + r() * 600; cr += `M${f1(x)} ${f1(y)}l${f1(10 + r() * 30)} ${f1(-4 + r() * 8)}`; }
      L0(g, cr, C.inkSoft, 1.2, 0.25);
      // the door and its light
      const doorD = 'M916 880V660L1004 660V880Z';
      P0(g, doorD, C.paperDark, 1);
      const doorLit = P0(g, doorD, C.gold, 0);
      const doorG = BTL.glow(svg, defs, 960, 780, 260, C.gold, 0, g);
      L0(g, doorD, C.ink, 2.6, 0.8);
      const beam = P0(g, 'M916 880L1004 880L1110 1000L810 1000Z', C.gold, 0);
      [[430, false], [720, true], [1200, false], [1490, false]].forEach(([x, b]) => colossus(g, x, 880, 0.95, b));
      // the sand that half buried the front
      P0(g, 'M-100 900C300 846 620 898 960 890C1300 882 1600 842 2020 900L2020 1200L-100 1200Z', mix(C.paper, C.paperLight, 0.6), 1);
      L0(g, 'M-100 900C300 846 620 898 960 890C1300 882 1600 842 2020 900', C.inkSoft, 2, 0.7);
      return {
        update(lt, dur, cues) {
          sky.update(lt);
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th - 0.2, 2.6);
          fa(doorLit, 0.35 * q); doorG.set(0.3 * q * (0.92 + 0.08 * Math.sin(lt * 0.8))); fa(beam, 0.07 * q);
        },
      };
    },
  };

  // ================================================================ bt_rosb_triad
  SH.bt_rosb_triad = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), xs = [450, 960, 1470], cy = 430;
      const pools = xs.map(x => BTL.glow(svg, defs, x, cy, 330, C.stain, 0, g));
      const items = [el(g, 'g'), el(g, 'g'), el(g, 'g')];
      rosaStone(items[0], defs, xs[0], cy, 0.4);
      openBook(items[1], xs[1], cy - 40, 0.68, { coptic: true });
      const rc = el(items[2], 'g', { transform: `translate(${xs[2]} ${cy}) scale(0.5)` }), R = ramsesCart(rc);
      R.car.D.reveal(1); R.signs.forEach(s => s.D.reveal(1));
      const labs = [['taş', 0], ['Kıptice', 1], ['bir ad', 2]].map(([s, i]) => ital(g, s, xs[i], 680, 56, { color: C.ink }));
      const l1 = L0(g, `M${xs[0] + 70} 740Q${(xs[0] + xs[1]) / 2} 810 ${xs[1] - 70} 740`, C.gold, 3, 0.9, { pathLength: 1 });
      const l2 = L0(g, `M${xs[1] + 70} 740Q${(xs[1] + xs[2]) / 2} 810 ${xs[2] - 70} 740`, C.gold, 3, 0.9, { pathLength: 1 });
      draw(l1, 0); draw(l2, 0);
      return {
        update(lt, dur, cues) {
          const t = [0.3, cue(cues, 'hit', dur * 0.3), cue(cues, 'c', dur * 0.75)], tb = cue(cues, 'b', dur * 0.5);
          items.forEach((e, i) => {
            const q = BTL.ease(lt, t[i] - 0.2, 1.4);
            fade(e, 0.28 + 0.72 * q); fade(labs[i], q);
            pools[i].set((0.04 + 0.18 * q) * (1 + 0.1 * Math.sin(lt * 0.6 + i)));
          });
          draw(l1, BTL.ease(lt, tb - 0.2, 2.2)); draw(l2, BTL.ease(lt, t[2] + 0.2, 1.8));
        },
      };
    },
  };

  // ================================================================ bt_rosb_academy
  SH.bt_rosb_academy = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), FY = 650, cx = 960, R = 640;
      P0(g, `M-100 -100L2020 -100L2020 ${FY}L-100 ${FY}Z`, wall(), 1);
      // the dome: two arcs, coffer ribs, a lantern ring at the top
      P0(g, `M${cx - R} ${FY}A${R} ${R} 0 0 1 ${cx + R} ${FY}Z`, mix(C.paper, C.paperLight, 0.6), 1);
      let ribs = '';
      for (let i = 1; i < 12; i++) { const a = Math.PI * i / 12; ribs += `M${f1(cx - Math.cos(a) * R)} ${f1(FY - Math.sin(a) * R)}L${f1(cx - Math.cos(a) * 140)} ${f1(FY - Math.sin(a) * 140 - 380)}`; }
      for (const k of [0.82, 0.62]) ribs += `M${f1(cx - R * k)} ${FY}A${f1(R * k)} ${f1(R * k)} 0 0 1 ${f1(cx + R * k)} ${FY}`;
      L0(g, ribs, C.inkSoft, 1.6, 0.35);
      L0(g, `M${cx - R} ${FY}A${R} ${R} 0 0 1 ${cx + R} ${FY}`, C.ink, 3, 0.8);
      const top = BTL.glow(svg, defs, cx, 60, 360, C.stain, 0.18, g);
      L0(g, `M${cx - 200} 130Q${cx} 70 ${cx + 200} 130`, C.inkSoft, 2, 0.6);
      L0(g, `M${cx - R - 90} ${FY}V120M${cx + R + 90} ${FY}V120M${cx - R - 130} ${FY}V120M${cx + R + 130} ${FY}V120`, C.inkSoft, 2, 0.5);
      P0(g, `M-100 ${FY}L2020 ${FY}L2020 1200L-100 1200Z`, floorT(), 1);
      L0(g, `M-100 ${FY}H2020`, C.inkSoft, 2.5, 0.7);
      // the reader at the lectern
      const pool = BTL.glow(svg, defs, cx, 520, 320, C.stain, 0.2, g);
      BTL.person(g, 'stand', cx, FY - 20, 300, { face: 1 });
      L0(g, `M${cx + 30} 440L${cx + 58} 420`, C.inkSoft, 10, 0.9);
      const sheet = P0(g, `M${cx + 52} 386L${cx + 96} 380L${cx + 100} 432L${cx + 56} 438Z`, mix(C.paperLight, C.ink, 0.5), 1);
      P0(g, `M${cx - 80} ${FY}L${cx + 80} ${FY}L${cx + 64} 520L${cx - 64} 520Z`, mix(C.paperLight, C.paperDark, 0.3), 1);
      L0(g, `M${cx - 80} ${FY}L${cx + 80} ${FY}L${cx + 64} 520L${cx - 64} 520ZM${cx - 90} 520H${cx + 90}`, C.ink, 2.6, 0.85);
      // the audience, seen from behind
      const backD = 'M-56 0C-56-46-36-66 0-66C36-66 56-46 56 0Z';
      const seat = (x, y, s, o = {}) => {
        const sg = el(g, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${s})` });
        const fill = o.fill || SIL();
        el(sg, 'path', { d: backD + E(0, -92, 24, 27), fill, stroke: RIM(), 'stroke-width': 2.6 / s, 'stroke-opacity': 0.8 });
        return sg;
      };
      const yg = BTL.glow(svg, defs, 1160, 680, 300, C.gold, 0, g);
      const rows = [[750, 0.95, 160, 0], [860, 1.2, 200, 80]];
      let young = null;
      rows.forEach(([y, s, step, off]) => { for (let x = 120 + off; x < 1880; x += step) { if (y === 750 && Math.abs(x - 1160) < 20) { young = { x, y, s }; continue; } seat(x, y, s); } });
      const yrim = L0(g, '', C.gold, 3, 0);
      let yfill = null;
      if (young) { seat(young.x, young.y, young.s); yfill = P0(g, '', C.gold, 0); yrim.setAttribute('d', `M${young.x - 56 * young.s} ${young.y}C${young.x - 56 * young.s} ${young.y - 46 * young.s} ${young.x - 36 * young.s} ${young.y - 66 * young.s} ${young.x} ${young.y - 66 * young.s}C${young.x + 36 * young.s} ${young.y - 66 * young.s} ${young.x + 56 * young.s} ${young.y - 46 * young.s} ${young.x + 56 * young.s} ${young.y}` + E(young.x, young.y - 92 * young.s, 24 * young.s, 27 * young.s)); yfill.setAttribute('d', yrim.getAttribute('d') + 'Z'); g.appendChild(yrim); }
      const lab = ital(g, P.label || '27 Eylül 1822', 1840, 120, 54, { color: C.ink, anchor: 'end' });
      return {
        update(lt, dur, cues) {
          top.set(0.18 + 0.03 * Math.sin(lt * 0.5)); pool.set(0.2 + 0.03 * Math.sin(lt * 0.7 + 1));
          fa(sheet, 0.85 + 0.15 * Math.sin(lt * 0.9));
          const th = cue(cues, 'hit', dur * 0.65), q = BTL.ease(lt, th - 0.2, 1.6);
          yg.set(0.55 * q * (0.94 + 0.06 * Math.sin(lt * 0.9))); sa(yrim, q); fa(yfill, 0.4 * q); yrim.setAttribute('stroke-width', 4);
          fade(lab, BTL.ease(lt, 0.5, 1.4));
        },
      };
    },
  };

  // ================================================================ bt_rosb_rivals
  SH.bt_rosb_rivals = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'face', g = el(svg, 'g'), ask = mode === 'ask';
      const xL = ask ? 470 : 560, xR = ask ? 1450 : 1360, by = 820, s = 0.98;
      const gl = BTL.glow(svg, defs, xL, 460, 420, C.stain, 0.1, g), gr = BTL.glow(svg, defs, xR, 460, 420, C.stain, 0.1, g);
      const Y = bust(g, 'young', xL - 40, by, s, 1), CH = bust(g, 'champ', xR + 40, by, s, -1);
      let mid = null, st = null, nl = null, nr = null;
      if (!ask) {
        mid = el(g, 'g', { transform: 'translate(960 430) scale(0.42)' });
        const R = ramsesCart(mid); R.car.D.reveal(1); R.signs.forEach(q => q.D.reveal(1)); R.car.gold(0.5);
        st = el(g, 'g'); rosaStone(st, defs, 960, 440, 0.36);
      } else {
        nl = ital(g, 'Young', xL, 900, 60, { color: C.ink }); nr = ital(g, 'Champollion', xR, 900, 60, { color: C.ink });
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.2), tb = cue(cues, 'b', dur * 0.5), tc = cue(cues, 'c', dur * 0.8), br = 0.02 * Math.sin(lt * 0.6);
          fade(Y.g, BTL.ease(lt, 0, 1.4)); fade(CH.g, BTL.ease(lt, 0.3, 1.4));
          if (!ask) {
            const qm = BTL.ease(lt, th - 0.2, 1.4), qc = BTL.ease(lt, tc - 0.2, 2);
            fade(mid, qm * (1 - qc)); fade(st, qc);
            const qy = BTL.ease(lt, tb, 2);
            fade(Y.g, BTL.ease(lt, 0, 1.4) * (1 - 0.6 * qy));
            gl.set((0.12 + br) * (1 - 0.7 * qy)); gr.set(0.12 + br + 0.06 * qy);
          } else {
            const ql = BTL.ease(lt, th - 0.2, 1.2), qr = BTL.ease(lt, tb - 0.2, 1.2);
            gl.set(0.08 + 0.18 * ql + br); gr.set(0.08 + 0.18 * qr + br);
            sa(Y.rim, 0.8 * ql); sa(CH.rim, 0.8 * qr);
            fade(nl, 0.4 + 0.6 * ql); fade(nr, 0.4 + 0.6 * qr);
            if (lt < 0.6) { fade(nl, BTL.ease(lt, 0, 1) * 0.4); fade(nr, BTL.ease(lt, 0, 1) * 0.4); }
          }
        },
      };
    },
  };

  // ================================================================ bt_rosb_map: bt_rosa_map + a thin dashed line between two
  // points (no route, no arrow: neutral). P: as bt_rosa_map + {link: [i, j, at]}  cues: the points' "at" names + link's
  SH.bt_rosb_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg } = ctx, inner = SH.bt_rosa_map.build(ctx);
      const [l0, b0, l1, b1] = P.bounds || (P.preset === 'delta' ? [29.3, 29.6, 32.6, 31.8] : [-11, 28, 33, 54]);
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 1000 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const [i, j, at] = P.link || [0, 1, null], A = P.points[i], B = P.points[j];
      const ax = X(A.lon), ay = Y(A.lat), bx = X(B.lon), by = Y(B.lat), len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
      const line = L0(svg, `M${f1(ax + ux * 26)} ${f1(ay + uy * 26)}L${f1(bx - ux * 26)} ${f1(by - uy * 26)}`, C.inkSoft, 2.5, 0, { 'stroke-dasharray': '12 12' });
      return {
        update(lt, dur, cues) {
          inner.update(lt, dur, cues);
          sa(line, 0.85 * BTL.ease(lt, cue(cues, at, 0.8) - 0.2, 1.4));
        },
      };
    },
  };

  // ================================================================ bt_rosb_philae (night)
  function philaeSil(g, col, rim, a = 1) {
    const F = d => el(g, 'path', { d, fill: col, 'fill-opacity': a, stroke: rim, 'stroke-width': 2.2, 'stroke-opacity': 0.8 * a, 'stroke-linejoin': 'round' });
    F('M-100 700L-100 680L2020 690L2020 700Z');
    F('M620 700L660 340L900 340L920 700Z'); F('M1000 700L1020 340L1260 340L1300 700Z');      // the pylon's towers
    F('M900 700L900 470L1020 470L1020 700Z');                                              // the gate between
    F('M650 340L910 340L910 322L650 322Z'); F('M1010 340L1270 340L1270 322L1010 322Z');   // cornices
    // Trajan's kiosk
    F('M1400 540L1720 540L1720 516L1400 516Z');
    for (let x = 1410; x <= 1690; x += 70) { F(`M${x} 700L${x} 556L${x + 24} 556L${x + 24} 700Z`); F(`M${x - 8} 556L${x + 32} 556L${x + 24} 540L${x} 540Z`); }
    // palms
    const palm = (x, h, lean) => {
      el(g, 'path', { d: `M${x} 700C${x + lean * 0.3} ${700 - h * 0.5} ${x + lean * 0.8} ${700 - h * 0.85} ${x + lean} ${700 - h}`, fill: 'none', stroke: col, 'stroke-width': 10, 'stroke-opacity': a, 'stroke-linecap': 'round' });
      const tx = x + lean, ty = 700 - h;
      let fr = ''; for (let i = 0; i < 7; i++) { const an = -Math.PI + i * Math.PI / 6, L = 90; fr += `M${tx} ${ty}Q${f1(tx + Math.cos(an) * L * 0.6)} ${f1(ty - 40 + Math.sin(an) * L * 0.3)} ${f1(tx + Math.cos(an) * L)} ${f1(ty + 30 + Math.abs(Math.cos(an)) * 20)}`; }
      el(g, 'path', { d: fr, fill: 'none', stroke: col, 'stroke-width': 7, 'stroke-opacity': a, 'stroke-linecap': 'round' });
    };
    palm(330, 300, -30); palm(450, 250, 24); palm(1830, 270, -20);
  }
  SH.bt_rosb_philae = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), HY = 700;
      const sky = BTL.stars(g, 170, 29, [0, 0, 1920, 560]);
      const moonG = BTL.glow(svg, defs, 1500, 160, 260, C.stain, 0.12, g);
      P0(g, `M-100 ${HY}L2020 ${HY}L2020 1300L-100 1300Z`, mix(C.paper, C.paperDark, 0.55), 1);
      // reflection (mirrored silhouette, faint), then the temple itself
      const rf = el(g, 'g', { transform: `translate(0 ${2 * HY}) scale(1 -1)` });
      philaeSil(rf, mix(C.paperDark, C.paper, 0.3), C.inkSoft, 0.35);
      philaeSil(g, SIL(), RIM());
      // ripples drifting slowly across the reflection
      const rip = [0, 1, 2, 3, 4, 5, 6, 7].map(i => L0(g, '', mix(C.paper, C.ink, 0.25), 2, 0.3));
      const lx = 960, ly = 696;
      const lampG = BTL.glow(svg, defs, lx, ly - 30, 300, C.gold, 0.26, g);
      L0(g, `M${lx - 12} ${ly}L${lx + 12} ${ly}L${lx + 8} ${ly - 14}L${lx - 8} ${ly - 14}Z`, C.ink, 2.4, 0.9);
      const fl = flame(g, lx, ly - 14, 0.42, { ph: 1.7 });
      const streak = el(g, 'g'), sts = [0, 1, 2, 3, 4].map(i => L0(streak, '', C.gold, 3, 0.4));
      return {
        update(lt, dur, cues) {
          sky.update(lt); fl.update(lt); moonG.set(0.12 + 0.02 * Math.sin(lt * 0.4));
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th - 0.2, 2);
          lampG.set((0.24 + 0.08 * q) * (0.94 + 0.06 * Math.sin(lt * 1.1)));
          rip.forEach((e, i) => {
            const y = HY + 40 + i * 48 + i * i * 4, x0 = 200 + ((lt * (8 + i * 2) + i * 230) % 1500), len = 120 + 40 * Math.sin(i * 1.7);
            e.setAttribute('d', `M${f1(x0)} ${f1(y)}h${f1(len)}M${f1((x0 + 760) % 1900)} ${f1(y + 14)}h${f1(len * 0.7)}`);
          });
          sts.forEach((e, i) => {
            const y = HY + 26 + i * 34, w = (24 + 10 * Math.sin(lt * 0.7 + i * 1.3)) * (1 + 0.3 * q) * (1 - i * 0.12);
            e.setAttribute('d', `M${f1(lx - w + 4 * Math.sin(lt * 0.5 + i))} ${y}h${f1(2 * w)}`);
            sa(e, (0.45 - i * 0.07) * (0.8 + 0.2 * q));
          });
        },
      };
    },
  };
})();
