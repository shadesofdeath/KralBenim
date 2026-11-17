// bt_elaious: the necropolis of Elaious found under the French trenches at Seddülbahir (Gallipoli, 1915), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; only slow natural motion (trickling soil, a swinging pick,
// a lantern flame, far gun flashes, dust in a light pool, sea glints). Every type is composed on a 1080x1920 vertical
// canvas (the Short); a wide frame shows it as a centred column. Death is told abstractly (a few thin bone lines).
//   bt_el_section P: {mode: "hook"|"open"|"layers"|"end"}  cues: hit
//                 the ground in cross-section: night sky, a trench with sandbags cut into it, soil strata below.
//                 hook: a pick stands in the trench floor; under it, in a light pool, a stone sarcophagus with a
//                 gabled lid, drawn as a cutaway (a faint skull line, a small flask inside); on "hit" its outline and the
//                 flask turn gold and the light grows (the cover frame)
//                 open: the trench is dug down to the sarcophagus; its lid slides slowly aside: a skull's thin outline
//                 and a small oil flask (lekythos); on "hit" the flask turns gold
//                 layers: three helmeted soldier silhouettes with rifles stand in the trench; below them two rows of
//                 old graves (sarcophagi and burial jars); on "hit" the graves light up gold one after another
//                 end: the empty trench, one sarcophagus in its light; the rest of the world slowly sinks into the dark
//   bt_el_map     P: {label: "Seddülbahir", sub: "Mayıs 1915", region: "Gelibolu"}  cues: hit
//                 the tip of the Gallipoli peninsula and the Dardanelles; a gold point pulses at Seddülbahir
//   bt_el_dig     dusk; one helmeted soldier silhouette, bent in a trench seen in cross-section, swings a pick slowly;
//                 chips of earth jump where it bites, the spoil heap on the parapet grows; the sea and a far shore behind
//   bt_el_strike  cues: hit   close-up: a pick comes slowly down out of the dark onto a stone slab; on "hit" it
//                 touches, a gold line runs along the lid's edge and dust drifts out
//   bt_el_city    P: {label: "Elaious", sub: "zeytin kenti"}  cues: hit   dusk on a headland over a dark sea: an olive tree
//                 and the ghost of an ancient Greek city (walls, houses, a temple) drawing itself in; a light path on the
//                 water down to dark rocks in the foreground; the name appears in the sky on "hit"
//   bt_el_lamp    cues: hit   night in the trench: a lantern hangs from a post, a kneeling figure beside a great burial jar
//                 lying in the trench wall reaches a brush to its mouth; far gun flashes over the parapet; on "hit" the jar turns gold
//   bt_el_graves  P: {n: 56, label: "mezar"}  cues: hit   far gun flashes on a dark horizon; the number counts up to 56
//                 while 56 small grave lids appear in rows below it and turn gold
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const LD = (p, d, stroke, w = 3, a = 1) => { const e = L0(p, d, stroke, w, a, { pathLength: 1 }); draw(e, 0); return e; };
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
      'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    if (o.halo) { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 12); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); }
    return e;
  };
  const SOIL = () => mix(C.paperLight, C.stain, 0.1);
  const STONE = () => mix(C.paperLight, C.ink, 0.13);
  const SIL = () => C.paperDark;
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  // a sandbag seen end-on: a soft rounded pillow
  const bag = (x, y, w = 62, h = 30) => `M${x - w / 2} ${y}C${x - w / 2} ${y - h * 0.62} ${x - w * 0.32} ${y - h} ${x} ${y - h}C${x + w * 0.32} ${y - h} ${x + w / 2} ${y - h * 0.62} ${x + w / 2} ${y}C${x + w * 0.3} ${y + 4} ${x - w * 0.3} ${y + 4} ${x - w / 2} ${y}Z`;
  function sandbags(g, list) {
    let d = ''; for (const [x, y, w, h] of list) d += bag(x, y, w, h);
    P0(g, d, mix(C.paperLight, C.stain, 0.2), 1);
    L0(g, d, C.inkSoft, 2.2, 0.85);
  }
  // soil grains trickling down a wall, a soft natural motion
  function trickle(g, x, y0, y1, seed, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < (o.n || 10); i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: r(), dx: (r() - 0.5) * (o.spread || 14), s: 1.6 + r() * 1.8 });
    return { update(lt) { for (const q of list) {
      const u = (q.ph + lt * (o.speed || 0.33)) % 1, y = y0 + (y1 - y0) * u * u, xx = x + q.dx * u;
      q.e.setAttribute("d", BTL.E(xx, y, q.s, q.s)); q.e.setAttribute("fill-opacity", (0.75 * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // dust motes drifting in a light pool
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: (o.size || 2.2) * (0.7 + r() * 0.8), v: 0.012 + r() * 0.02, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = box[3] - u * h, x = box[0] + q.x * w + 12 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // a slow far gun flash: a glow that swells and dies (no flicker)
  function flashes(g, svg, defs, spots) {
    const list = spots.map(([x, y, r, ph]) => ({ gl: BTL.glow(svg, defs, x, y, r, C.stain, 0, g), ph }));
    return { update(lt, k = 1) { for (const q of list) {
      const u = ((lt * 0.42 + q.ph) % 1 + 1) % 1, a = u < 0.18 ? u / 0.18 : Math.max(0, 1 - (u - 0.18) / 0.5);
      q.gl.set(k * 0.42 * a * a);
    } } };
  }
  // soldier silhouette with a round helmet and a rifle (faceless, BTL.person)
  function soldier(g, pose, x, y, h, o = {}) {
    const fc = o.face ?? 1, sg = el(g, 'g');
    const P = { stand: { head: [0, -0.9], h2: [0.12, -0.44] }, bend: { head: [0.36, -0.6] }, kneel: { head: [0.3, -0.63] } }[pose];
    BTL.person(sg, pose, x, y, h, { color: SIL(), rim: C.inkSoft });
    const hx = x + P.head[0] * h * fc, hy = y + P.head[1] * h, r = 0.078 * h;
    // helmet: a dome with a thin brim, and a crest ridge (Adrian helmet)
    const hel = `M${f1(hx - r * 1.5)} ${f1(hy + r * 0.05)}C${f1(hx - r * 1.25)} ${f1(hy - r * 1.75)} ${f1(hx + r * 1.25)} ${f1(hy - r * 1.75)} ${f1(hx + r * 1.5)} ${f1(hy + r * 0.05)}Z`;
    P0(sg, hel, SIL(), 1); L0(sg, hel, C.inkSoft, 2, 0.9);
    L0(sg, `M${f1(hx - r * 0.5)} ${f1(hy - r * 1.28)}C${f1(hx - r * 0.2)} ${f1(hy - r * 1.42)} ${f1(hx + r * 0.2)} ${f1(hy - r * 1.42)} ${f1(hx + r * 0.5)} ${f1(hy - r * 1.28)}`, C.inkSoft, 2, 0.8);
    if (o.rifle) {
      const bx = x + 0.12 * h * fc, by = y - 0.3 * h;
      L0(sg, `M${f1(bx)} ${f1(by)}L${f1(bx + 0.06 * h * fc)} ${f1(y - 1.02 * h)}`, C.inkSoft, 0.026 * h + 2, 0.9);
      L0(sg, `M${f1(bx + 0.06 * h * fc)} ${f1(y - 1.02 * h)}L${f1(bx + 0.075 * h * fc)} ${f1(y - 1.2 * h)}`, C.inkSoft, 2, 0.9);
    }
    return sg;
  }

  // ------------------------------------------------------------------ the stone sarcophagus (origin = centre)
  const LID = 'M-278 -50L278 -50L278 -80L0 -106L-278 -80Z';
  const EARS = 'M-278 -80L-298 -104L-250 -84M278 -80L298 -104L250 -84';
  const BODY = 'M-260 -50L260 -50L260 92L-260 92Z';
  const PANEL = 'M-228 -24L228 -24L228 66L-228 66Z';
  const FOOT = 'M-272 92L272 92L272 106L-272 106Z';
  function sarcophagus(parent, cx, cy, s = 1, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${cx} ${cy}) scale(${s})` });
    const D = BTL.drawing(g);
    D.f(BODY, STONE(), 1); D.f(FOOT, STONE(), 1);
    if (o.open) D.f('M-240 -50L240 -50L240 72L-240 72Z', C.paperDark, 1);
    D.s(BODY, { w: 4 }); D.s(FOOT, { w: 3 });
    if (!o.open) D.s(PANEL, { w: 2.2, color: C.inkSoft });
    const lidG = el(g, 'g');
    let gold = null;
    if (!o.noLid) {
      const L = BTL.drawing(lidG);
      L.f(LID, mix(STONE(), C.ink, 0.05), 1); L.s(LID, { w: 4 }); L.s(EARS, { w: 3 });
      L.s('M-250 -64L250 -64', { w: 2, color: C.inkSoft });
      D.items.push(...L.items);
    }
    gold = L0(g, BODY + FOOT + (o.noLid ? '' : LID), C.gold, 5, 0);
    return { g, D, lidG, gold };
  }

  // what the cutaway shows inside: the faint outline of a skull and a spine, a small oil flask by the head
  function contents(sc, svg, defs, parent, cx, cy) {
    const bones = BTL.drawing(el(sc.g, 'g'));
    bones.s(BTL.E(-150, 10, 26, 22), { w: 2.2, color: C.inkSoft });
    bones.s('M-124 16C-80 20-30 22 20 24M-100 4L-104 30M-70 4L-74 34M-40 6L-44 36', { w: 2, color: C.inkSoft });
    const fl = el(sc.g, 'g', { transform: 'translate(-206 26)' });
    const flaskD = 'M-14 40C-24 20-22-10-10-24L-8-40L8-40L10-24C22-10 24 20 14 40Z';
    const flask = P0(fl, flaskD, mix(C.paperLight, C.stain, 0.4), 1);
    const flaskL = L0(fl, flaskD + 'M-12-44L12-44M8-34C22-34 22-14 12-12', C.ink, 2.5, 0.9);
    const fglow = BTL.glow(svg, defs, cx - 206, cy + 26, 110, C.gold, 0, parent);
    return { bones, set(n, lt) {
      flask.setAttribute('fill', mix(mix(C.paperLight, C.stain, 0.4), C.gold, n));
      flaskL.setAttribute('stroke', n > 0.5 ? C.gold : C.ink);
      fglow.set(0.5 * n + 0.05 * Math.sin(lt));
    } };
  }

  // ------------------------------------------------------------------ the ground in cross-section
  const GY = 640;
  function section(g, svg, defs, o = {}) {
    const S = {};
    const xl = o.xl ?? 380, xr = o.xr ?? 700, fl = o.floor ?? 840, bl = o.bl ?? xl + 22, br = o.br ?? xr - 22;
    S.stars = BTL.stars(g, 80, o.seed || 7, [0, 60, 1080, 560]);
    S.flash = flashes(g, svg, defs, o.flashes || [[860, 600, 300, 0.1], [180, 610, 220, 0.6]]);
    const LS = `M-300 650C0 636 220 646 ${xl} ${GY}`, RS = `M${xr} ${GY}C860 634 1040 650 1380 642`;
    const groundD = `${LS}L${bl} ${fl}L${br} ${fl}L${xr} ${GY}C860 634 1040 650 1380 642L1380 2100L-300 2100Z`;
    S.soil = P0(g, groundD, SOIL(), 1);
    // strata + pebbles, faint
    const cid = 'elS' + (++uid); el(el(defs, 'clipPath', { id: cid }), 'path', { d: groundD });
    const inSoil = el(g, 'g', { 'clip-path': `url(#${cid})` });
    S.inSoil = inSoil;
    let st = ''; for (let i = 0; i < 10; i++) { const y = 720 + i * 128 + (i % 2) * 18;
      st += `M-300 ${y}C80 ${y + 22} 300 ${y - 18} 540 ${y + 6}C800 ${y + 30} 1000 ${y - 12} 1380 ${y + 10}`; }
    L0(inSoil, st, C.inkSoft, 1.6, 0.2);
    const r = rng(o.seed || 7); let pb = '';
    for (let i = 0; i < 70; i++) { const x = r() * 1080, y = 680 + r() * 1200, s = 3 + r() * 6; pb += BTL.E(x, y, s * 1.4, s); }
    L0(inSoil, pb, C.inkSoft, 1.6, 0.28);
    // the trench: dark air, revetment posts, duckboard
    const tr = `M${xl} ${GY}L${bl} ${fl}L${br} ${fl}L${xr} ${GY}Z`;
    P0(g, tr, C.paperDark, 0.9);
    let posts = ''; for (let k = 0; k < 3; k++) { const u = 0.15 + k * 0.33;
      posts += `M${f1(xl + (bl - xl) * u + 10)} ${f1(GY + (fl - GY) * u - 20)}L${f1(xl + (bl - xl) * Math.min(1, u + 0.3) + 10)} ${f1(GY + (fl - GY) * Math.min(1, u + 0.3) - 20)}`;
      posts += `M${f1(xr + (br - xr) * u - 10)} ${f1(GY + (fl - GY) * u - 20)}L${f1(xr + (br - xr) * Math.min(1, u + 0.3) - 10)} ${f1(GY + (fl - GY) * Math.min(1, u + 0.3) - 20)}`; }
    L0(g, `M${xl} ${GY}L${bl} ${fl}M${xr} ${GY}L${br} ${fl}`, C.inkSoft, 2.5, 0.8);
    L0(g, `M${bl + 6} ${fl - 4}L${br - 6} ${fl - 4}`, C.inkSoft, 3, 0.8);
    let ticks = ''; for (let x = bl + 30; x < br - 10; x += 34) ticks += `M${x} ${fl - 10}L${x} ${fl + 2}`;
    L0(g, ticks, C.inkSoft, 2, 0.5);
    L0(g, LS + RS, C.ink, 2.5, 0.7);
    sandbags(g, o.bags || [[xl - 120, GY - 6, 64, 30], [xl - 54, GY - 2, 64, 30], [xl - 88, GY - 32, 62, 28],
      [xr + 54, GY - 2, 64, 30], [xr + 120, GY - 6, 64, 30], [xr + 88, GY - 32, 62, 28]]);
    S.tr = trickle(g, xl + 6, GY + 4, fl - 6, 11, { n: 9 });
    S.update = (lt, k = 1) => { S.stars.update(lt * 2); S.flash.update(lt, k); S.tr.update(lt); };
    S.geo = { xl, xr, fl, bl, br };
    return S;
  }
  // a pick: handle + curved iron head; drawn with its tip at (0,0), handle running up to the left
  function pick(parent, x, y, rot, s = 1) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
    const head = 'M0 0C-20-40-30-90-24-140C40-150 110-150 170-128L168-112C110-126 50-126 8-118C2-80 6-40 0 0Z';
    P0(g, head, mix(C.paperLight, C.ink, 0.25), 1); L0(g, head, C.ink, 3, 0.9);
    const hd = 'M-6-122L-210-560L-190-570L14-132Z';
    P0(g, hd, mix(C.paperLight, C.stain, 0.35), 1); L0(g, hd, C.inkSoft, 2.5, 0.9);
    return g;
  }

  SH.bt_el_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', root = el(canvas(svg, W, H), 'g');
      if (mode === 'open') {
        const S = section(root, svg, defs, { xl: 230, xr: 1040, floor: 950, bl: 250, br: 1010, seed: 9,
          bags: [[120, GY - 4, 64, 30], [180, GY - 30, 62, 28], [60, GY - 2, 64, 30]] });
        const cx = 520, cy = 1000;
        const glow = BTL.glow(svg, defs, cx - 120, cy, 420, C.stain, 0.2, root);
        const sc = sarcophagus(root, cx, cy, 1, { open: true, noLid: true });
        const inside = contents(sc, svg, defs, root, cx, cy);
        // the lid, slid aside and resting on the right of the box
        const L = BTL.drawing(sc.lidG);
        L.f(LID, mix(STONE(), C.ink, 0.05), 1); L.s(LID, { w: 4 }); L.s(EARS, { w: 3 }); L.s('M-250 -64L250 -64', { w: 2, color: C.inkSoft });
        const dust = motes(root, 41, 26, [cx - 280, cy - 300, cx + 100, cy + 40], { alpha: 0.45 });
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.6);
            S.update(lt, 0.6);
            sc.D.reveal(1); L.reveal(1); inside.bones.reveal(BTL.ease(lt, 0.6, 1.6));
            const sl = 90 + 160 * BTL.ease(lt, 0, Math.max(1.5, dur * 0.8));
            sc.lidG.setAttribute('transform', `translate(${f1(sl)} ${f1(-4 - sl * 0.02)}) rotate(${f1(1.5 + sl * 0.006)})`);
            const n = BTL.ease(lt, at - 0.2, 0.9);
            inside.set(n, lt);
            glow.set(0.2 + 0.08 * n + 0.02 * Math.sin(lt * 0.7));
            dust.update(lt * 6);
          },
        };
      }
      if (mode === 'layers') {
        const S = section(root, svg, defs, { seed: 13, flashes: [[880, 590, 320, 0.15], [150, 600, 260, 0.55], [520, 560, 220, 0.85]] });
        const sol = el(root, 'g');
        soldier(sol, 'stand', 450, 836, 230, { rifle: true });
        soldier(sol, 'stand', 545, 836, 236, { rifle: true, face: -1 });
        soldier(sol, 'stand', 630, 836, 226, { rifle: true });
        // two rows of old graves: small sarcophagi and burial jars lying on their side
        const graves = [], glow = BTL.glow(svg, defs, 540, 1040, 520, C.stain, 0, root);
        const row = (y, xs, s, jars) => xs.forEach((x, i) => {
          const gg = el(root, 'g', { transform: `translate(${x} ${y}) scale(${s})` });
          let d;
          if (jars.includes(i)) d = 'M-120 0C-120-46-60-62 10-58C70-54 110-34 116 0C110 34 70 54 10 58C-60 62-120 46-120 0ZM-120-18L-144-22L-144 22L-120 18';
          else d = BODY + LID;
          P0(gg, d, STONE(), 1);
          const ln = L0(gg, d, C.inkSoft, 3 / s, 0.9);
          graves.push({ ln, x, y });
        });
        row(990, [190, 420, 650, 880], 0.36, [1, 3]);
        row(1110, [300, 540, 780], 0.36, [0]);
        // one helmet resting on the right parapet slowly slips off and comes to rest upside down on the ground
        const hm = el(root, 'g'), hr = 26;
        const helD = `M${-hr * 1.5} 0C${-hr * 1.25} ${-hr * 1.75} ${hr * 1.25} ${-hr * 1.75} ${hr * 1.5} 0Z`;
        P0(hm, helD, SIL(), 1); L0(hm, helD + `M${-hr * 1.7} 0L${hr * 1.7} 0`, C.inkSoft, 2.2, 0.95);
        const hglow = BTL.glow(svg, defs, 900, 636, 120, C.stain, 0, root);
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.45), af = cue(cues, 'fall', dur * 0.7);
            S.update(lt);
            const p = BTL.ease(lt, af - 0.1, 1.6);
            const hx = 788 + (900 - 788) * p, hy = 582 + (636 - 582) * p * p - 26 * Math.sin(Math.PI * p);
            hm.setAttribute('transform', `translate(${f1(hx)} ${f1(hy)}) rotate(${f1(180 * p)})`);
            hglow.set(0.25 * BTL.ease(lt, af + 1.2, 1));
            graves.forEach((q, i) => {
              const n = BTL.ease(lt, at - 0.2 + i * 0.22, 0.6);
              q.ln.setAttribute('stroke', n > 0.5 ? C.gold : C.inkSoft);
              q.ln.setAttribute('stroke-opacity', (0.6 + 0.4 * n).toFixed(3));
            });
            glow.set(0.2 * BTL.ease(lt, at, 1.6) + 0.02 * Math.sin(lt));
            sol.setAttribute('opacity', (0.9 + 0.1 * Math.sin(lt * 0.4)).toFixed(3));
          },
        };
      }
      // hook + end: the trench above, one sarcophagus below in its light
      const world = el(root, 'g');
      const S = section(world, svg, defs, { seed: mode === 'end' ? 17 : 7 });
      const cx = 540, cy = 1004;
      const glow = BTL.glow(svg, defs, cx, cy, 470, C.stain, 0.16, root);
      // hook: in the video the sarcophagus stays closed (it opens in scene 4); only the thumbnail (cover without the
      // running hook) shows it as a cutaway with its contents. end: the cutaway, as seen in scene 4
      const sc = sarcophagus(root, cx, cy, 1, { open: mode !== 'hook' });
      const cut = mode === 'hook' ? el(sc.g, 'g') : sc.g;
      if (mode === 'hook') P0(cut, 'M-240 -50L240 -50L240 72L-240 72Z', C.paperDark, 1);
      const inside = contents({ g: cut }, svg, defs, root, cx, cy);
      if (mode === 'hook') pick(world, 590, S.geo.fl + 6, 18, 0.55);
      const grit = mode === 'hook' ? [trickle(world, S.geo.xr - 8, GY + 4, S.geo.fl - 6, 31, { n: 14, spread: 18, speed: 0.4 }), trickle(world, S.geo.xl + 10, GY + 4, S.geo.fl - 6, 37, { n: 14, spread: 18, speed: 0.36 })] : [];
      const dust = motes(root, 23, mode === 'hook' ? 44 : 18, [cx - 320, cy - 190, cx + 320, cy + 150], { alpha: mode === 'hook' ? 0.5 : 0.35, size: mode === 'hook' ? 3 : 2.2 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', mode === 'hook' ? 1.3 : dur * 0.5);
          // the hook doubles as the cover and plays at ~1/3 speed under it: its inner clocks run fast
          const fast = mode === 'hook' ? lt * 3 : lt;
          S.update(fast);
          sc.D.reveal(BTL.ease(lt, 0, 1.4)); inside.bones.reveal(BTL.ease(lt, 0.3, 1.4));
          // the hook is always shown as the cover (lt ~2.2 and on): it lights up early, whatever the cue
          const n = mode === 'hook' ? BTL.ease(lt, Math.min(at, 1.2) - 0.2, 0.9) : 1;
          const rc = document.documentElement.classList, thumb = rc.contains('cover') && !rc.contains('hook');
          if (mode === 'hook') cut.setAttribute('display', thumb ? 'inline' : 'none');
          inside.set(mode === 'hook' ? (thumb ? n : 0) : 0.6 + 0.25 * Math.sin(lt * 0.6) ** 2, fast);
          sc.gold.setAttribute('stroke-opacity', (0.95 * n).toFixed(3));
          if (mode === 'end') {
            const k = BTL.ease(lt, 0.4, Math.max(2, dur - 0.6));
            world.setAttribute('opacity', (1 - 0.7 * k).toFixed(3));
            sc.gold.setAttribute('stroke-opacity', (0.5 + 0.4 * Math.sin(lt * 0.6) ** 2).toFixed(3));
            glow.set(0.24 - 0.05 * k + 0.03 * Math.sin(lt * 0.7));
          } else glow.set(0.16 + 0.12 * n + 0.24 * clamp01((lt - 2.2) / 1.1) + 0.02 * Math.sin(fast * 0.9));   // the light slowly swells under the hook
          dust.update(fast * (mode === 'hook' ? 12 : 5));
          for (const q of grit) q.update(fast);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the tip of Gallipoli and the Dardanelles
  const EUR = [[26.62, 40.7], [26.55, 40.52], [26.42, 40.44], [26.3, 40.37], [26.22, 40.325], [26.255, 40.29], [26.275, 40.24],
    [26.258, 40.2], [26.225, 40.15], [26.19, 40.09], [26.165, 40.05], [26.19, 40.043], [26.215, 40.056], [26.255, 40.078],
    [26.31, 40.11], [26.372, 40.148], [26.36, 40.188], [26.41, 40.24], [26.5, 40.3], [26.6, 40.37], [26.67, 40.41], [26.76, 40.46], [26.9, 40.55], [26.9, 40.7]];
  const ASIA = [[26.0, 39.7], [26.1, 39.82], [26.15, 39.95], [26.19, 40.005], [26.26, 40.03], [26.33, 40.07], [26.37, 40.105],
    [26.405, 40.145], [26.395, 40.19], [26.47, 40.25], [26.58, 40.32], [26.69, 40.345], [26.82, 40.4], [27.1, 40.42], [27.1, 39.7]];
  const IMB = [[25.67, 40.2], [25.8, 40.24], [25.97, 40.2], [25.93, 40.12], [25.76, 40.1], [25.66, 40.14]];
  function closedSmooth(pts) {
    const n = pts.length, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], s0 = m(pts[n - 1], pts[0]);
    let d = `M${f1(s0[0])} ${f1(s0[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], e = m(p, pts[(i + 1) % n]); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(e[0])} ${f1(e[1])}`; }
    return d + 'Z';
  }
  SH.bt_el_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), k = Math.cos(40.2 * Math.PI / 180), s = 1700;
      const X = lon => 60 + (lon - 26.04) * k * s, Y = lat => 180 + (40.5 - lat) * s;
      BTL.glow(svg, defs, X(26.19), Y(40.05), 560, C.stain, 0.12, g);
      let grat = '';
      for (let lon = 25.8; lon <= 27; lon += 0.2) grat += `M${f1(X(lon))} -40L${f1(X(lon))} 1960`;
      for (let lat = 39.6; lat <= 40.8; lat += 0.2) grat += `M-40 ${f1(Y(lat))}L1120 ${f1(Y(lat))}`;
      L0(g, grat, C.inkSoft, 1.4, 0.14);
      // slow sea lines in the Aegean
      const waves = []; for (let i = 0; i < 9; i++) waves.push({ e: L0(g, '', C.inkSoft, 2, 0.3), x: 70 + (i % 3) * 70, y: 380 + i * 90, ph: i * 1.3 });
      const land = [EUR, ASIA, IMB].map(p => closedSmooth(p.map(([a, b]) => [X(a), Y(b)]))).join('');
      P0(g, land, C.paperLight, 1);
      const coast = L0(g, land, C.inkSoft, 2.6, 0.9, { pathLength: 1 }); draw(coast, 0);
      const reg = txt(g, P.region || 'Gelibolu', X(26.42), Y(40.34), 54, { font: BTL.LO, italic: true, color: C.inkSoft, spacing: 0 });
      reg.setAttribute('transform', `rotate(-38 ${f1(X(26.42))} ${f1(Y(40.34))})`);
      const nx = X(26.195), ny = Y(40.05);
      const pg = el(g, 'g', { opacity: 0 });
      const ring = el(pg, 'circle', { cx: nx, cy: ny, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
      const glow = BTL.glow(svg, defs, nx, ny, 90, C.gold, 0.35, pg);
      el(pg, 'circle', { cx: nx, cy: ny, r: 10, fill: C.gold });
      const lab = txt(g, P.label || 'Seddülbahir', nx + 40, ny + 92, 60, { weight: 500, anchor: 'start', halo: true });
      const sub = txt(g, P.sub || '', nx + 40, ny + 152, 48, { font: BTL.LO, italic: true, color: C.gold, anchor: 'start', halo: true });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          draw(coast, BTL.ease(lt, 0, 1.4)); fade(reg, BTL.ease(lt, 0.6, 1));
          fade(pg, BTL.ease(lt, 0.4, 0.6)); fade(lab, BTL.ease(lt, 0.6, 0.8)); fade(sub, BTL.ease(lt, at - 0.3, 0.8));
          const ph = ((lt % 1.8) + 1.8) % 1.8 / 1.8;
          ring.setAttribute('r', f1(16 + 34 * ph)); ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.9));
          glow.set(0.3 + 0.12 * Math.sin(lt * 2));
          for (const q of waves) { const x = q.x + 18 * Math.sin(lt * 0.5 + q.ph);
            q.e.setAttribute('d', `M${f1(x)} ${q.y}q24 -10 48 0t48 0`); q.e.setAttribute('stroke-opacity', f1(0.22 + 0.12 * Math.sin(lt * 0.8 + q.ph))); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ digging the trench at dusk
  SH.bt_el_dig = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), HZ = 640, GS = 740, FL = 1080, XL = 220, XR = 880;
      BTL.stars(g, 40, 3, [0, 60, 1080, 420]);
      const dusk = BTL.glow(svg, defs, 760, HZ, 640, C.stain, 0.22, g);
      // the far shore (Asia) and the sea of the straits
      P0(g, `M560 ${HZ}C640 ${HZ - 30} 760 ${HZ - 44} 880 ${HZ - 30}C960 ${HZ - 22} 1040 ${HZ - 16} 1120 ${HZ - 12}L1120 ${HZ}Z`, mix(C.paperDark, C.paper, 0.5), 1);
      P0(g, `M-40 ${HZ}L1120 ${HZ}L1120 ${GS + 20}L-40 ${GS + 20}Z`, mix(C.paperDark, C.paper, 0.55), 1);
      const glints = []; for (let i = 0; i < 6; i++) glints.push({ e: L0(g, '', C.ink, 1.6, 0.3), y: HZ + 14 + i * 13, w: 30 + i * 12, ph: i * 1.7 });
      // ground + trench
      const groundD = `M-40 ${GS}C100 ${GS - 10} ${XL - 40} ${GS - 4} ${XL} ${GS}L${XL + 30} ${FL}L${XR - 30} ${FL}L${XR} ${GS}C1000 ${GS - 6} 1060 ${GS} 1120 ${GS}L1120 2000L-40 2000Z`;
      P0(g, groundD, SOIL(), 1);
      let st = ''; for (let i = 0; i < 8; i++) { const y = GS + 90 + i * 140; st += `M-40 ${y}C300 ${y + 20} 700 ${y - 16} 1120 ${y + 8}`; }
      const cid = 'elD' + (++uid); el(el(defs, 'clipPath', { id: cid }), 'path', { d: groundD });
      const inSoil = el(g, 'g', { 'clip-path': `url(#${cid})` });
      L0(inSoil, st, C.inkSoft, 1.6, 0.2);
      const r0 = rng(14); let pb = '';
      for (let i = 0; i < 40; i++) { const x = r0() * 1080, y = FL + 60 + r0() * 760, q = 3 + r0() * 6; pb += BTL.E(x, y, q * 1.4, q); }
      L0(inSoil, pb, C.inkSoft, 1.6, 0.26);
      P0(g, `M${XL} ${GS}L${XL + 30} ${FL}L${XR - 30} ${FL}L${XR} ${GS}Z`, C.paperDark, 0.85);
      L0(g, `M${XL} ${GS}L${XL + 30} ${FL}L${XR - 30} ${FL}L${XR} ${GS}`, C.inkSoft, 2.5, 0.8);
      L0(g, `M-40 ${GS}C100 ${GS - 10} ${XL - 40} ${GS - 4} ${XL} ${GS}M${XR} ${GS}C1000 ${GS - 6} 1060 ${GS} 1120 ${GS}`, C.ink, 2.5, 0.7);
      sandbags(g, [[90, GS - 4, 70, 32], [160, GS - 2, 70, 32], [126, GS - 34, 68, 30]]);
      // the spoil heap on the right parapet grows slowly
      const heap = P0(g, '', mix(C.paperLight, C.stain, 0.2), 1), heapL = L0(g, '', C.inkSoft, 2.2, 0.85);
      // one digger, bent over his pick
      const lamp = BTL.glow(svg, defs, 560, FL - 120, 360, C.stain, 0.12, g);
      // a second soldier further back in the trench, fainter, leaning on his shovel
      const back = el(g, 'g', { opacity: 0.45 });
      soldier(back, 'stand', 790, FL - 10, 290, { face: -1 });
      L0(back, `M752 ${FL - 160}L742 ${FL - 4}`, mix(C.paperLight, C.stain, 0.45), 7, 1);
      P0(back, `M728 ${FL - 4}L758 ${FL - 4}L754 ${FL + 4}L732 ${FL + 4}Z`, mix(C.paperLight, C.ink, 0.3), 1);
      soldier(g, 'bend', 450, FL, 360);
      const pk = el(g, 'g');
      // handle from the hands down-right; iron head across its end
      L0(pk, 'M0 0L170 70', mix(C.paperLight, C.stain, 0.45), 9, 1);
      L0(pk, 'M196 12Q186 70 150 122', C.ink, 15, 0.9);
      L0(pk, 'M196 12Q186 70 150 122', mix(C.paperLight, C.ink, 0.3), 10, 1);
      const chips = [], r = rng(5);
      for (let i = 0; i < 9; i++) chips.push({ e: P0(g, '', mix(C.paperLight, C.stain, 0.35), 0), ph: r(), dx: (r() - 0.3) * 120, h: 60 + r() * 90, s: 4 + r() * 4 });
      const fall = trickle(g, XL + 10, GS + 8, FL - 8, 3, { n: 8 });
      return {
        update(lt) {
          dusk.set(0.2 + 0.02 * Math.sin(lt * 0.6));
          lamp.set(0.12 + 0.02 * Math.sin(lt * 1.1));
          for (const q of glints) { const w = q.w * (0.7 + 0.3 * Math.sin(lt * 0.9 + q.ph)), x = 760 + 14 * Math.sin(lt * 0.4 + q.ph);
            q.e.setAttribute('d', `M${f1(x - w)} ${q.y}L${f1(x + w)} ${q.y}`); }
          // pick held at the hands (~ (600, 975)), a slow swing: up to -34 deg, down to 0 (tip on the floor)
          const a = -34 * (0.5 + 0.5 * Math.cos(lt * 2.0));
          pk.setAttribute('transform', `translate(600 975) rotate(${f1(a)})`);
          const hk = BTL.ease(lt, 0, 4);
          const hh = 40 + 36 * hk, hd = `M${XR - 20} ${GS}C${XR + 10} ${f1(GS - hh)} ${XR + 120} ${f1(GS - hh)} ${XR + 170} ${GS}Z`;
          heap.setAttribute('d', hd); heapL.setAttribute('d', hd.slice(0, -1));
          // chips of earth jump from where the pick bites and fall back
          for (const q of chips) {
            const u = ((lt * 0.32 + q.ph) % 1), x = 750 + q.dx * u, y = FL - 12 - q.h * 4 * u * (1 - u);
            q.e.setAttribute('d', BTL.E(x, y, q.s, q.s * 0.8)); q.e.setAttribute('fill-opacity', (0.9 * Math.sin(Math.PI * u)).toFixed(3));
          }
          fall.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the pick meets the stone
  SH.bt_el_strike = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), LT = 870;
      // the dug pit: dark air between soil walls; the stone slab across it; soil below
      P0(g, `M-40 -40L1120 -40L1120 2000L-40 2000Z`, C.paperDark, 0.7);
      const wallL = `M-40 -40L90 -40C70 300 110 600 80 ${LT}L-40 ${LT}Z`, wallR = `M1120 -40L990 -40C1010 300 975 600 1000 ${LT}L1120 ${LT}Z`;
      P0(g, wallL + wallR, SOIL(), 1);
      L0(g, `M90 -40C70 300 110 600 80 ${LT}M990 -40C1010 300 975 600 1000 ${LT}`, C.inkSoft, 2.5, 0.7);
      P0(g, `M-40 ${LT + 130}L1120 ${LT + 130}L1120 2000L-40 2000Z`, SOIL(), 1);
      let st = ''; for (let i = 0; i < 6; i++) { const y = LT + 220 + i * 130; st += `M-40 ${y}C300 ${y + 18} 700 ${y - 14} 1120 ${y + 8}`; }
      L0(g, st, C.inkSoft, 1.6, 0.2);
      const glow = BTL.glow(svg, defs, 560, LT, 460, C.stain, 0.14, g);
      // the slab (lid) and the top of the box under it
      const slab = `M40 ${LT}L1040 ${LT}L1040 ${LT + 118}L40 ${LT + 118}Z`;
      P0(g, slab, STONE(), 1); L0(g, slab, C.ink, 4, 0.9);
      P0(g, `M100 ${LT + 130}L980 ${LT + 130}L980 ${LT + 330}L100 ${LT + 330}Z`, mix(STONE(), C.paperDark, 0.3), 1);
      L0(g, `M100 ${LT + 330}L100 ${LT + 130}L980 ${LT + 130}L980 ${LT + 330}`, C.inkSoft, 3, 0.8);
      let chis = ''; const r = rng(8);
      for (let i = 0; i < 34; i++) { const x = 70 + r() * 940, y = LT + 14 + r() * 92; chis += `M${f1(x)} ${f1(y)}l${f1(10 + r() * 14)} ${f1(-3 + r() * 6)}`; }
      L0(g, chis, C.inkSoft, 2, 0.5);
      // gold crack of light along the top edge, spreading from the contact
      const crL = LD(g, `M560 ${LT}L40 ${LT}`, C.gold, 5, 1), crR = LD(g, `M560 ${LT}L1040 ${LT}`, C.gold, 5, 1);
      const spark = BTL.glow(svg, defs, 560, LT, 160, C.gold, 0, g);
      // the pick: pivot off-frame to the upper left, tip at (560, LT) when it touches
      const pv = [-160, 240], tip = [560, LT - 2];
      const ang = Math.atan2(tip[1] - pv[1], tip[0] - pv[0]), len = Math.hypot(tip[0] - pv[0], tip[1] - pv[1]);
      const pkG = el(g, 'g');
      const inner = el(pkG, 'g', { transform: `translate(${pv[0]} ${pv[1]}) rotate(${f1(ang * 180 / Math.PI)})` });
      // in inner coords the handle runs along +x; the head sits across it near the end, its tip at (len, 0)
      const hx = len - 120;
      L0(inner, `M0 -2L${hx} 0`, mix(C.paperLight, C.stain, 0.45), 22, 1);
      L0(inner, `M0 -12L${hx} -10M0 9L${hx} 10`, C.inkSoft, 2.5, 0.8);
      const headD = `M${hx - 26} -150C${hx + 10} -160 ${hx + 30} -60 ${hx + 30} -10C${hx + 60} 10 ${len - 20} -6 ${len} 0C${len - 30} 22 ${hx + 50} 30 ${hx + 18} 30` +
        `C${hx + 12} 60 ${hx - 4} 100 ${hx - 34} 130L${hx - 54} 120C${hx - 30} 80 ${hx - 24} 40 ${hx - 26} 20C${hx - 40} -40 ${hx - 46} -110 ${hx - 26} -150Z`;
      P0(inner, headD, mix(C.paperLight, C.ink, 0.28), 1); L0(inner, headD, C.ink, 3.5, 0.95);
      const dust = []; const rr = rng(21);
      for (let i = 0; i < 30; i++) dust.push({ e: P0(g, '', C.ink, 0), a: (rr() - 0.5) * Math.PI * 0.9 - Math.PI / 2, v: 60 + rr() * 200, s: 2 + rr() * 3.4, d: rr() * 0.4 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), down = BTL.ease(lt, 0, Math.max(0.6, at));
          pkG.setAttribute('transform', `rotate(${f1(-20 * (1 - down))} ${pv[0]} ${pv[1]})`);
          draw(crL, BTL.ease(lt, at, 1.4)); draw(crR, BTL.ease(lt, at, 1.4));
          spark.set(lt >= at ? 0.55 * Math.exp(-(lt - at) * 1.4) + 0.12 : 0);
          glow.set(0.14 + 0.1 * BTL.ease(lt, at, 1));
          for (const q of dust) {
            const u = clamp01((lt - at - q.d) / 2.6);
            const x = 560 + Math.cos(q.a) * q.v * Math.sqrt(u), y = LT + Math.sin(q.a) * q.v * 0.7 * Math.sqrt(u) + 60 * u * u;
            q.e.setAttribute('d', BTL.E(x, y, q.s, q.s)); q.e.setAttribute('fill-opacity', (u > 0 ? 0.6 * (1 - u) : 0).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ Elaious: the ghost of the city on its headland
  SH.bt_el_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), SEA = 960;
      BTL.stars(g, 60, 19, [0, 60, 1080, 640]);
      const WATER = mix(C.paperDark, C.paper, 0.45);
      P0(g, `M-40 ${SEA}L1120 ${SEA}L1120 2000L-40 2000Z`, WATER, 1);
      // dusk light low on the left, its path running down the water towards the viewer
      const dusk = BTL.glow(svg, defs, 250, SEA, 640, C.stain, 0.24, g);
      const path = BTL.glow(svg, defs, 250, SEA + 420, 520, C.stain, 0.1, g);
      const glints = []; for (let i = 0; i < 22; i++) glints.push({ e: L0(g, '', C.ink, 1.6, 0.3), y: SEA + 14 + i * 26 + i * i * 0.6, w: 18 + i * 7, ph: i * 1.3 });
      // headland from the right: cliff down to the water, its dark reflection below
      const top = `M330 ${SEA}C380 ${SEA - 40} 420 ${SEA - 120} 470 ${SEA - 170}C560 ${SEA - 190} 800 ${SEA - 200} 1120 ${SEA - 196}`;
      P0(g, top + `L1120 ${SEA + 4}L330 ${SEA + 4}Z`, mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, top, C.inkSoft, 2.5, 0.8);
      P0(g, `M330 ${SEA}C380 ${SEA + 34} 420 ${SEA + 100} 470 ${SEA + 140}C560 ${SEA + 156} 800 ${SEA + 164} 1120 ${SEA + 160}L1120 ${SEA}Z`, C.paperDark, 0.55);
      // near shore: dark rocks in the lower corners, small waves breaking on them
      const rocks = `M-40 1520C60 1490 140 1530 220 1560C300 1590 340 1660 420 1700C460 1760 470 1860 480 2000L-40 2000Z` +
        `M1120 1580C1040 1570 960 1610 900 1660C860 1700 830 1800 820 2000L1120 2000Z`;
      P0(g, rocks, mix(C.paperDark, C.paper, 0.25), 1);
      L0(g, `M-40 1520C60 1490 140 1530 220 1560C300 1590 340 1660 420 1700C460 1760 470 1860 480 2000M1120 1580C1040 1570 960 1610 900 1660C860 1700 830 1800 820 2000`, C.inkSoft, 2.2, 0.6);
      const surf = [[200, 1556], [400, 1690], [910, 1650], [1010, 1592]].map(([x, y], i) => ({ e: L0(g, '', C.ink, 1.6, 0.3), x, y, ph: i * 1.7 }));
      const TOP = SEA - 192;
      // the ghost city: wall with towers, houses, a temple; drawn in once in thin lines
      const D = BTL.drawing(el(g, 'g'));
      D.s(`M480 ${TOP + 18}L1080 ${TOP - 2}`, { w: 2.5, color: C.inkSoft });
      D.s(`M500 ${TOP + 16}L500 ${TOP - 54}L540 ${TOP - 54}L540 ${TOP + 14}M1000 ${TOP}L1000 ${TOP - 70}L1044 ${TOP - 70}L1044 ${TOP - 2}`, { w: 2.5, color: C.inkSoft });
      D.s(`M520 ${TOP - 54}l0 -10l8 0l0 10m4 0l0 -10l8 0l0 10M1006 ${TOP - 70}l0 -10l10 0l0 10m8 0l0 -10l10 0l0 10`, { w: 2, color: C.inkSoft });
      let houses = '';
      for (const [x, w, h] of [[560, 56, 40], [620, 48, 34], [930, 52, 44], [972, 30, 30]]) houses += `M${x} ${TOP + 12}L${x} ${TOP + 12 - h}L${x + w} ${TOP + 12 - h}L${x + w} ${TOP + 10}M${x - 4} ${TOP + 12 - h}L${x + w / 2} ${TOP - h - 8}L${x + w + 4} ${TOP + 12 - h}`;
      D.s(houses, { w: 2, color: C.inkSoft });
      // temple: steps, six columns, architrave, pediment
      const t0 = 690, t1 = 900, tb = TOP + 6, th = 150;
      const temple = `M${t0 - 16} ${tb}L${t1 + 16} ${tb}M${t0 - 8} ${tb - 10}L${t1 + 8} ${tb - 10}` +
        [0, 1, 2, 3, 4, 5].map(i => { const x = t0 + 10 + i * (t1 - t0 - 20) / 5; return `M${f1(x - 7)} ${tb - 10}L${f1(x - 6)} ${tb - th}M${f1(x + 7)} ${tb - 10}L${f1(x + 6)} ${tb - th}`; }).join('') +
        `M${t0 - 6} ${tb - th}L${t1 + 6} ${tb - th}L${t1 + 6} ${tb - th - 22}L${t0 - 6} ${tb - th - 22}ZM${t0 - 12} ${tb - th - 22}L${(t0 + t1) / 2} ${tb - th - 74}L${t1 + 12} ${tb - th - 22}`;
      const tFill = P0(g, `M${t0 - 6} ${tb - th - 22}L${(t0 + t1) / 2} ${tb - th - 74}L${t1 + 6} ${tb - th - 22}Z`, C.paperLight, 0);
      D.s(temple, { w: 3, color: C.ink });
      const tGold = L0(g, temple, C.gold, 3.5, 0);
      // an olive tree on the near cliff edge, its crown swaying very slowly
      const ox = 470, oy = TOP + 22;
      L0(g, `M${ox} ${oy}C${ox - 10} ${oy - 40} ${ox + 14} ${oy - 70} ${ox - 4} ${oy - 110}M${ox - 2} ${oy - 70}C${ox - 30} ${oy - 90} ${ox - 50} ${oy - 100} ${ox - 70} ${oy - 120}M${ox + 2} ${oy - 84}C${ox + 30} ${oy - 100} ${ox + 50} ${oy - 116} ${ox + 66} ${oy - 140}`, mix(C.paperDark, C.inkSoft, 0.5), 8, 1);
      const crown = el(g, 'g'), r = rng(12); let lv = '';
      for (let i = 0; i < 26; i++) { const a = r() * TAU, rr = 30 + r() * 70, x = ox + Math.cos(a) * rr * 1.2, y = oy - 140 + Math.sin(a) * rr * 0.6, aa = (r() - 0.5) * 1.2;
        lv += `M${f1(x)} ${f1(y)}q${f1(12 * Math.cos(aa))} ${f1(-8 + 12 * Math.sin(aa))} ${f1(26 * Math.cos(aa))} ${f1(26 * Math.sin(aa))}q${f1(-12 * Math.cos(aa))} ${f1(10)} ${f1(-26 * Math.cos(aa))} ${f1(-26 * Math.sin(aa))}Z`; }
      P0(crown, lv, mix(C.green, C.paperDark, 0.45), 0.95); L0(crown, lv, mix(C.green, C.ink, 0.2), 1.5, 0.6);
      // the name in the empty sky above the headland
      const lab = txt(g, P.label || 'Elaious', 540, 400, 96, { weight: 400, spacing: '0.04em' });
      const sub = txt(g, P.sub || '', 540, 472, 52, { font: BTL.LO, italic: true, color: C.gold });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.3);
          D.reveal(BTL.ease(lt, 0.1, 2.2));
          const n = BTL.ease(lt, at - 0.2, 1);
          tGold.setAttribute('stroke-opacity', (0.85 * n).toFixed(3)); tFill.setAttribute('fill-opacity', (0.5 * n).toFixed(3));
          fade(lab, BTL.ease(lt, at - 0.2, 1)); fade(sub, BTL.ease(lt, at + 0.4, 1));
          crown.setAttribute('transform', `translate(${ox} ${oy}) skewX(${f1(2 * Math.sin(lt * 0.7))}) translate(${-ox} ${-oy})`);
          dusk.set(0.22 + 0.03 * Math.sin(lt * 0.5)); path.set(0.1 + 0.02 * Math.sin(lt * 0.7));
          for (const q of glints) { const w = q.w * (0.7 + 0.3 * Math.sin(lt * 0.9 + q.ph)), x = 250 + (q.y - SEA) * 0.05 + 16 * Math.sin(lt * 0.4 + q.ph);
            q.e.setAttribute('d', `M${f1(x - w)} ${f1(q.y)}L${f1(x + w)} ${f1(q.y)}`); q.e.setAttribute('stroke-opacity', f1(0.2 + 0.14 * Math.sin(lt * 1.1 + q.ph))); }
          for (const q of surf) { const u = 0.5 + 0.5 * Math.sin(lt * 0.9 + q.ph);
            q.e.setAttribute('d', `M${f1(q.x - 50 - 10 * u)} ${f1(q.y - 8 * u)}Q${q.x} ${f1(q.y - 22 - 8 * u)} ${f1(q.x + 50 + 10 * u)} ${f1(q.y - 8 * u)}`); q.e.setAttribute('stroke-opacity', f1(0.15 + 0.25 * u)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ night: the trench becomes an excavation
  SH.bt_el_lamp = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), PT = 400, FL = 1130;
      const st = BTL.stars(g, 40, 29, [0, 60, 1080, 330]);
      const fl = flashes(g, svg, defs, [[820, 370, 300, 0.2], [300, 380, 240, 0.7]]);
      // back wall of the trench (soil), parapet line, floor
      const wall = `M-40 ${PT}C200 ${PT - 12} 600 ${PT + 10} 1120 ${PT - 6}L1120 2000L-40 2000Z`;
      P0(g, wall, SOIL(), 1);
      let s = ''; for (let i = 0; i < 6; i++) { const y = PT + 110 + i * 120; s += `M-40 ${y}C300 ${y + 18} 700 ${y - 14} 1120 ${y + 8}`; }
      L0(g, s, C.inkSoft, 1.6, 0.2);
      sandbags(g, [[280, PT, 80, 36], [370, PT + 2, 80, 36], [326, PT - 32, 78, 34], [880, PT, 80, 36], [970, PT - 2, 80, 36], [925, PT - 34, 78, 34]]);
      L0(g, `M-40 ${PT}C200 ${PT - 12} 600 ${PT + 10} 1120 ${PT - 6}`, C.ink, 2.5, 0.7);
      P0(g, `M-40 ${FL}L1120 ${FL}L1120 2000L-40 2000Z`, mix(SOIL(), C.paperDark, 0.35), 1);
      L0(g, `M-40 ${FL}L1120 ${FL}`, C.inkSoft, 3, 0.8);
      // the lantern on a post at the left
      const lx = 120, ly = 620;
      L0(g, `M70 ${FL}L66 ${PT - 30}M66 ${ly - 120}L${lx + 10} ${ly - 120}L${lx + 10} ${ly - 70}`, mix(C.paperLight, C.stain, 0.35), 9, 1);
      const lamp = BTL.glow(svg, defs, lx + 140, ly + 160, 560, C.stain, 0.3, g);
      // the great jar (pithos) lying in the wall, half cleared of earth; its mouth to the left
      const jx = 770, jy = 880;
      const jg = BTL.drawing(el(g, 'g', { transform: `translate(${jx} ${jy})` }));
      const jar = 'M-230 0C-230-90-120-150 20-146C150-142 250-90 260 0C250 90 150 142 20 146C-120 150-230 90-230 0Z';
      jg.f(jar, mix(C.paperLight, C.stain, 0.42), 1);
      jg.f('M-230-48L-286-56L-286 56L-230 48Z', mix(C.paperLight, C.stain, 0.3), 1);
      jg.f('M-286-40L-286 40L-276 40L-276-40Z', C.paperDark, 1);
      jg.s(jar, { w: 4 }); jg.s('M-230-48L-286-56L-286 56L-230 48', { w: 4 });
      jg.s('M-120-120C-130-40-130 40-120 120M60-140C70-50 70 50 60 140', { w: 2.2, color: C.inkSoft });
      const jGold = L0(g, `M${jx - 230} ${jy}C${jx - 230} ${jy - 90} ${jx - 120} ${jy - 150} ${jx + 20} ${jy - 146}C${jx + 150} ${jy - 142} ${jx + 250} ${jy - 90} ${jx + 260} ${jy}C${jx + 250} ${jy + 90} ${jx + 150} ${jy + 142} ${jx + 20} ${jy + 146}C${jx - 120} ${jy + 150} ${jx - 230} ${jy + 90} ${jx - 230} ${jy}Z` +
        `M${jx - 230} ${jy - 48}L${jx - 286} ${jy - 56}L${jx - 286} ${jy + 56}L${jx - 230} ${jy + 48}`, C.gold, 5, 0);
      // earth still covering the right end of the jar, crumbling away
      const earth = P0(g, '', SOIL(), 1), earthL = L0(g, '', C.inkSoft, 2, 0.6);
      // the kneeling figure beside the jar, his hand with a brush reaching to its mouth
      soldier(g, 'kneel', 240, FL, 320);
      const tool = el(g, 'g');
      L0(tool, 'M0 0L84 -30', mix(C.paperLight, C.stain, 0.45), 6, 1);
      P0(tool, 'M84 -40L118 -50L124 -16L90 -20Z', mix(C.paperLight, C.ink, 0.35), 1);
      L0(tool, 'M84 -40L118 -50L124 -16L90 -20Z', C.ink, 2, 0.8);
      const flame = P0(g, '', C.gold, 0.95), core = P0(g, '', C.ink, 0.9);
      const cage = `M${lx - 18} ${ly - 70}L${lx + 38} ${ly - 70}L${lx + 32} ${ly + 30}L${lx - 12} ${ly + 30}Z`;
      L0(g, cage + `M${lx - 24} ${ly + 30}L${lx + 44} ${ly + 30}M${lx - 12} ${ly - 70}L${lx + 10} ${ly - 92}L${lx + 32} ${ly - 70}`, C.ink, 3, 0.9);
      const fall = trickle(g, jx + 170, jy - 110, FL - 6, 17, { n: 10, spread: 30, speed: 0.28 });
      const crumbs = trickle(g, jx - 286, jy + 50, FL - 6, 23, { n: 8, spread: 20, speed: 0.4 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          st.update(lt * 2); fl.update(lt);
          jg.reveal(BTL.ease(lt, 0, 0.9));
          const c = 0.62 + 0.3 * BTL.ease(lt, 0, Math.max(2, dur));
          const ex = jx - 230 + 490 * c;
          const ed = `M${f1(ex)} ${jy - 170}C${f1(ex - 30)} ${jy - 80} ${f1(ex + 20)} ${jy + 40} ${f1(ex - 10)} ${jy + 170}L1120 ${jy + 170}L1120 ${jy - 170}Z`;
          earth.setAttribute('d', c < 0.99 ? ed : ''); earthL.setAttribute('d', c < 0.99 ? `M${f1(ex)} ${jy - 170}C${f1(ex - 30)} ${jy - 80} ${f1(ex + 20)} ${jy + 40} ${f1(ex - 10)} ${jy + 170}` : '');
          jGold.setAttribute('stroke-opacity', (0.85 * BTL.ease(lt, at - 0.2, 1)).toFixed(3));
          // the hand (~ (365, 948)) sweeps the brush slowly across the jar's mouth
          tool.setAttribute('transform', `translate(365 948) rotate(${f1(-4 + 7 * Math.sin(lt * 1.5))})`);
          const h = 46 + 6 * Math.sin(lt * 2.3) + 3 * Math.sin(lt * 3.7), w = 13, fx = lx + 10, fy = ly + 18, lean = 3 * Math.sin(lt * 1.2);
          flame.setAttribute('d', `M${fx - w} ${fy}C${fx - w} ${f1(fy - h * 0.5)} ${f1(fx + lean)} ${f1(fy - h * 0.8)} ${f1(fx + lean)} ${f1(fy - h)}C${f1(fx + lean)} ${f1(fy - h * 0.8)} ${fx + w} ${f1(fy - h * 0.5)} ${fx + w} ${fy}Z`);
          core.setAttribute('d', `M${fx - 5} ${fy}C${fx - 5} ${f1(fy - h * 0.25)} ${fx} ${f1(fy - h * 0.45)} ${fx} ${f1(fy - h * 0.5)}C${fx} ${f1(fy - h * 0.45)} ${fx + 5} ${f1(fy - h * 0.25)} ${fx + 5} ${fy}Z`);
          lamp.set(0.3 + 0.03 * Math.sin(lt * 2.3) + 0.02 * Math.sin(lt * 3.7));
          fall.update(lt); crumbs.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ 56 graves under the guns
  SH.bt_el_graves = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), N = P.n || 56, HZ = 380;
      BTL.stars(g, 40, 37, [0, 60, 1080, 300]);
      const fl = flashes(g, svg, defs, [[820, HZ, 340, 0.05], [260, HZ, 280, 0.45], [560, HZ, 240, 0.8]]);
      // a low dark ridge on the horizon (the hills inland)
      P0(g, `M-40 ${HZ + 20}C200 ${HZ - 20} 420 ${HZ - 4} 600 ${HZ - 30}C780 ${HZ - 50} 920 ${HZ - 10} 1120 ${HZ - 20}L1120 ${HZ + 40}L-40 ${HZ + 40}Z`, C.paperDark, 1);
      L0(g, `M-40 ${HZ + 20}C200 ${HZ - 20} 420 ${HZ - 4} 600 ${HZ - 30}C780 ${HZ - 50} 920 ${HZ - 10} 1120 ${HZ - 20}`, C.inkSoft, 2, 0.6);
      P0(g, `M-40 ${HZ + 30}L1120 ${HZ + 30}L1120 2000L-40 2000Z`, SOIL(), 1);
      let s = ''; for (let i = 0; i < 9; i++) { const y = HZ + 120 + i * 150; s += `M-40 ${y}C300 ${y + 18} 700 ${y - 14} 1120 ${y + 8}`; }
      L0(g, s, C.inkSoft, 1.6, 0.16);
      const glow = BTL.glow(svg, defs, 540, 930, 560, C.stain, 0.1, g);
      const num = txt(g, '0', 540, 680, 230, { weight: 300, color: C.gold });
      const lab = txt(g, P.label || 'mezar', 540, 760, 56, { font: BTL.LO, italic: true, color: C.ink });
      const cols = 8, rows = Math.ceil(N / cols), x0 = 120, dx = 120, y0 = 850, dy = 46, list = [];
      for (let i = 0; i < N; i++) {
        const x = x0 + (i % cols) * dx, y = y0 + Math.floor(i / cols) * dy;
        const d = `M${x - 38} ${y}L${x + 38} ${y}L${x + 38} ${y - 12}L${x} ${y - 24}L${x - 38} ${y - 12}Z`;
        list.push({ f: P0(g, d, STONE(), 0), l: L0(g, d, C.inkSoft, 2.2, 0) });
      }
      void rows;
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4), run = Math.max(1.2, dur - at - 0.6);
          fl.update(lt);
          const k = BTL.ease(lt, at - 0.2, run), cnt = Math.round(N * k);
          num.textContent = String(cnt); fade(num, BTL.ease(lt, at - 0.4, 0.5)); fade(lab, BTL.ease(lt, at + 0.2, 0.8));
          list.forEach((q, i) => {
            const on = BTL.ease(lt, 0.1 + i * 0.012, 0.6), lit = i < cnt ? 1 : 0;
            q.f.setAttribute('fill-opacity', (on * 0.9).toFixed(3));
            q.l.setAttribute('stroke-opacity', (on * (0.55 + 0.45 * lit)).toFixed(3));
            q.l.setAttribute('stroke', lit ? C.gold : C.inkSoft);
          });
          glow.set(0.1 + 0.12 * k + 0.02 * Math.sin(lt));
        },
      };
    },
  };
})();
