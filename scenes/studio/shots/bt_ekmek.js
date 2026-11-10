// bt_ekmek: the charred loaves of Seyitömer Mound (Kütahya, Early Bronze Age, c. 5,000 years ago), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; only slow natural motion (embers breathing, flames, falling
// grains, settling soil, drifting dust). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide
// frame shows it as a centred column.
//   bt_ek_loaf   P: {mode: "hook"|"section"|"museum", label}  cues: hit (section)
//                hook: one big charred loaf in a light pool, its crust cracks glowing like embers, a few sparks rising.
//                section: the loaf cut in half; the pale crumb turns to black charcoal from the crust inwards on "hit"
//                (a thin ember front moves to the centre). museum: the loaf on a low plinth under a narrow spot, a thin
//                glass case, italic label (P.label)
//   bt_ek_mound  P: {mode: "site"|"bury", label}  cues: hit
//                site: cross-section of a tall mound, strata inside, a small burnt room deep down; on "hit" eight small
//                loaves light up one after another in that room. bury: one black loaf at the bottom; layers of soil
//                settle over it one after another, its last ember fading
//   bt_ek_room   P: {mode: "build"|"fire"}  cues: a, b (build)
//                cutaway of a mud-brick room: on "a" a domed oven draws itself, on "b" a wooden shelf against the wall with
//                sacks and loaves. fire: the same room burning, slow flames, smoke rising
//   bt_ek_shelf  cues: hit   close on the shelf: on "hit" the board gives way and tilts down, the loaves slide to the floor,
//                wheat and lentil grains pour slowly from the sacks and settle around them; embers glow behind
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  let UID = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0, 'text-anchor': 'middle' }, o.italic ? { 'font-style': 'italic' } : {}));
  const stroke = (e, p) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); e.setAttribute('stroke-dashoffset', f1(1 - clamp01(p))); };

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const push = (g, lt, dur, cx, cy, amt = 0.035) => {
    const z = 1 + amt * BTL.ease(lt, 0, Math.max(3, dur));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };
  const bg = g => P0(g, 'M-300-200L1380-200L1380 2100L-300 2100Z', C.paper, 1);
  const CHAR = mix(C.paper, C.ink, 0.13), CHAR2 = mix(C.paper, C.ink, 0.07), EARTH = mix(C.paper, C.ink, 0.06);

  // slow motes drifting inside a box (dir: -1 rises, used for sparks and ash)
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: r(), s: (o.size || 2) * (0.7 + r() * 0.9), v: 0.02 + r() * 0.03, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = o.up ? box[3] - u * h : box[1] + u * h, x = box[0] + q.x * w + 14 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.45) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6), x0: o.x0 + (r() - 0.5) * o.spread });
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.06)) % 1, s = 0.5 + 1.2 * u;
      q.e.setAttribute('d', BTL.E(q.x0 + o.dx * u, o.y0 + o.dy * u, q.rx * s, q.rx * s * 0.7));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.16) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  const flameD = (x, y, w, h, ph) => `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.4)} ${f1(x - w * 0.3 + 6 * Math.sin(ph))} ${f1(y - h * 0.7)} ${f1(x + 8 * Math.sin(ph * 0.8))} ${f1(y - h)}C${f1(x + w * 0.3 + 6 * Math.sin(ph + 1))} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.4)} ${f1(x + w)} ${f1(y)}Z`;
  function flames(g, src, seed) {
    const r = rng(seed), list = [];
    for (const [x, y, s] of src) list.push({ o: P0(g, '', C.red, 0.5), i: P0(g, '', C.gold, 0.7), x, y, s, ph: r() * TAU, sp: 0.7 + r() * 0.35 });
    return { update(lt, on = 1) { for (const q of list) {
      const ph = q.ph + lt * q.sp, h = q.s * (130 + 16 * Math.sin(ph * 0.7)) * on, w = q.s * 36 * (0.5 + 0.5 * on);
      q.o.setAttribute('d', flameD(q.x, q.y, w, h, ph)); q.i.setAttribute('d', flameD(q.x, q.y, w * 0.55, h * 0.6, ph + 0.6));
      q.o.setAttribute('fill-opacity', (0.5 * on).toFixed(3)); q.i.setAttribute('fill-opacity', (0.7 * on).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the loaf (origin = centre of the base)
  // a round domed loaf seen slightly from above: ~600 px wide at k = 1. Returns {g, ember} (ember: crack glow element)
  const DOME = 'M-320 50C-326-30-290-110-220-150C-180-172-150-160-110-178C-60-200-10-186 30-192C90-200 140-176 190-160C260-136 316-70 320 40C320 92 180 124 0 124C-180 124-318 98-320 50Z';
  const BELLY = 'M-320 50C-318 98-180 124 0 124C180 124 320 92 320 40C230 82-230 88-320 50Z';
  const CRACKS = 'M-210-110C-170-90-150-104-120-80C-96-62-70-70-40-50M-120-80C-124-50-140-30-132 0M-40-50C-10-60 30-40 60-58' +
    'C90-76 120-60 150-80M60-58C66-30 50-10 70 20M150-80C170-50 200-48 232-30M-250-10C-210 0-180-14-150 4M100-150C110-120 96-100 110-70' +
    'M-60-150C-50-130-64-112-52-96';
  const PITS = (() => { const r = rng(4); let d = ''; for (let i = 0; i < 26; i++) { const u = r() * 2 - 1, v = r();
    const x = u * 270, y = 60 - v * (150 - 80 * u * u) - 10, s = 3 + r() * 5; d += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(-2 * s)} 0`; } return d; })();
  function loaf(parent, x, y, k, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${k})` });
    if (o.shadow !== false) P0(g, BTL.E(0, 112, 330, 44), C.paperDark, 0.9);
    P0(g, DOME, CHAR, 1);
    P0(g, BELLY, CHAR2, 1);
    // a broken edge on the right: a flake gone, the inner crust shows
    P0(g, 'M262-104L306-30L318 34L288 46L270 4L282-50Z', CHAR2, 1);
    L0(g, 'M262-104L282-50L270 4L288 46', C.inkSoft, 2.5 / k, 0.9);
    L0(g, PITS, C.inkSoft, 2 / Math.max(k, 0.5), 0.55);
    const ember = o.ember === false ? null : L0(g, CRACKS, C.gold, 7 / Math.max(k, 0.5), 0.6);
    L0(g, CRACKS, C.ink, 2.4 / Math.max(k, 0.5), 0.75);
    L0(g, DOME, C.ink, 4 / Math.max(k, 0.5), 1);
    L0(g, 'M-262-110C-220-150-170-168-110-180', C.inkSoft, 2.5 / Math.max(k, 0.5), 0.8);
    return { g, ember };
  }

  // ------------------------------------------------------------------ bt_ek_loaf
  SH.bt_ek_loaf = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'section') {
        const cx = 540, cy = 860;
        const pool = BTL.glow(svg, defs, cx, cy - 120, 560, C.stain, 0.3, g);
        P0(g, BTL.E(cx, cy + 100, 380, 50), C.paperDark, 0.9);
        // the cut face: a half dome facing us, crust ring around it
        const face = k => `M${f1(cx - 330 * k)} ${f1(cy + 60 - 60 * (1 - k))}C${f1(cx - 330 * k)} ${f1(cy - 150 * k - 60 * (1 - k))} ${f1(cx - 190 * k)} ${f1(cy - 290 * k)} ${cx} ${f1(cy - 290 * k)}` +
          `C${f1(cx + 190 * k)} ${f1(cy - 290 * k)} ${f1(cx + 330 * k)} ${f1(cy - 150 * k - 60 * (1 - k))} ${f1(cx + 330 * k)} ${f1(cy + 60 - 60 * (1 - k))}Z`;
        // first the whole loaf; a thin cut line splits it; then the cut face shows
        const whole = loaf(g, cx, cy - 10, 1.0, {});
        const cut = L0(g, `M${cx + 4} ${cy - 330}L${cx - 4} ${cy + 150}`, C.gold, 3, 1);
        const fg = el(g, 'g', { opacity: 0 });
        P0(fg, face(1), CHAR, 1);                                   // crust
        P0(fg, face(0.9), mix(C.paper, C.stain, 0.55), 1);           // crumb (warm, pale)
        const coal = P0(fg, face(0.9), mix(C.paper, C.ink, 0.04), 0); // charcoal
        // pores of the crumb
        const r = rng(13); let pores = '';
        for (let i = 0; i < 60; i++) {
          const u = r() * 2 - 1, v = r(), px = cx + u * 270 * Math.sqrt(1 - v * 0.6), py = cy + 40 - v * 270 * Math.sqrt(1 - u * u * 0.8);
          const s = 4 + r() * 9; pores += `M${f1(px - s)} ${f1(py)}a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(-2 * s)} 0`;
        }
        L0(fg, pores, C.inkSoft, 2, 0.7);
        const front = L0(fg, face(0.9), C.gold, 5, 0);
        L0(fg, face(1), C.ink, 4, 1); L0(fg, face(0.9), C.inkSoft, 2.5, 0.9);
        L0(fg, `M${cx - 330} ${cy + 60}C${cx - 300} ${cy + 110} ${cx + 300} ${cy + 110} ${cx + 330} ${cy + 60}`, C.ink, 3, 0.8);
        const lab = P.label ? txt(g, P.label, cx, cy + 260, 54, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
        const ash = motes(g, 5, 18, [cx - 320, cy - 420, cx + 320, cy - 60], { up: true, color: C.gold, alpha: 0.5 });
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.45);
            push(g, lt, dur, cx, cy - 100, 0.04);
            stroke(cut, BTL.ease(lt, 0.1, 0.7));
            const open = BTL.ease(lt, 0.8, 0.6);
            fade(whole.g, 1 - open); fade(fg, open);
            cut.setAttribute('stroke-opacity', (1 - open).toFixed(3));
            whole.ember.setAttribute('stroke-opacity', '0.35');
            const q = BTL.ease(lt, Math.max(1.5, Math.min(hit, dur - 1.5)) - 0.1, 1.2);
            coal.setAttribute('fill-opacity', q.toFixed(3));
            const k = 0.9 * (1 - 0.92 * q);
            front.setAttribute('d', face(Math.max(0.05, k)));
            front.setAttribute('stroke-opacity', (q > 0 && q < 1 ? 0.85 * Math.sin(Math.PI * q) : 0).toFixed(3));
            pool.set(0.3 - 0.1 * q + 0.03 * Math.sin(lt * 0.6));
            ash.update(lt, BTL.ease(lt, hit - 0.3, 1));
            if (lab) fade(lab, BTL.ease(lt, hit + 0.8, 1));
          },
        };
      }
      if (mode === 'museum') {
        const cx = 540, by = 860;
        const spot = BTL.glow(svg, defs, cx, by - 220, 480, C.stain, 0.34, g);
        P0(g, `M${cx - 90} 60L${cx + 90} 60L${cx + 330} ${by + 60}L${cx - 330} ${by + 60}Z`, C.stain, 0.05);
        // floor line and plinth
        L0(g, 'M-300 1120L1380 1120', C.inkSoft, 2, 0.4);
        P0(g, 'M-300 1120L1380 1120L1380 2100L-300 2100Z', C.paperDark, 0.8);
        const pl = `M${cx - 300} ${by + 40}L${cx + 300} ${by + 40}L${cx + 300} 1120L${cx - 300} 1120Z`;
        P0(g, pl, C.paperLight, 1); L0(g, pl, C.inkSoft, 3, 0.9);
        L0(g, `M${cx - 300} ${by + 70}L${cx + 300} ${by + 70}`, C.inkSoft, 2, 0.6);
        const L = loaf(g, cx, by - 74, 0.82, {});
        // glass case: thin lines with one soft highlight
        const glass = `M${cx - 330} ${by + 40}L${cx - 330} 380L${cx + 330} 380L${cx + 330} ${by + 40}`;
        const gl = L0(g, glass, C.inkSoft, 2, 0.7);
        L0(g, `M${cx - 290} 430L${cx - 290} 660`, C.ink, 3, 0.25);
        const lab = txt(g, P.label || 'Kütahya Müzesi', cx, 1012, 58, { font: LO, italic: true, color: C.ink, weight: 400 });
        const ds = motes(g, 31, 22, [cx - 300, 200, cx + 300, by], { alpha: 0.35, size: 2 });
        return {
          update(lt, dur) {
            push(g, lt, dur, cx, by - 100, 0.035);
            stroke(gl, BTL.ease(lt, 0, 1.8));
            if (L.ember) L.ember.setAttribute('stroke-opacity', (0.12 + 0.05 * Math.sin(lt * 0.8)).toFixed(3));
            spot.set(0.3 + 0.04 * Math.sin(lt * 0.5));
            fade(lab, BTL.ease(lt, 0.8, 1.2));
            ds.update(lt);
          },
        };
      }
      // hook: one big loaf, filled from the first frame
      const dim = mode === 'ember', cx = 540, cy = dim ? 930 : 880, K = dim ? 1.9 : 1.05, GL = cy + (dim ? 190 : 120);
      const pool = BTL.glow(svg, defs, cx, cy - (dim ? 230 : 90), dim ? 700 : 620, C.stain, 0.42, g);
      L0(g, `M-300 ${GL}L1380 ${GL}`, C.inkSoft, 2, 0.25);
      P0(g, `M-300 ${GL}L1380 ${GL}L1380 2100L-300 2100Z`, C.paperDark, 0.6);
      const L = loaf(g, cx, cy, K, {});
      const sp = motes(g, 9, dim ? 18 : 34, [cx - 340, cy - (dim ? 700 : 600), cx + 340, cy - (dim ? 420 : 140)], { up: true, color: C.gold, alpha: dim ? 0.6 : 0.9, size: dim ? 3 : 3.6 });
      const ds = motes(g, 17, 20, [60, 300, 1020, 1100], { alpha: 0.25 });
      return {
        update(lt, dur) {
          push(g, lt, dur, cx, cy - 80, 0.04);
          const k = dim ? 1 - 0.8 * BTL.ease(lt, 0.3, Math.max(2, dur - 0.3)) : 1;
          L.ember.setAttribute('stroke-opacity', (k * (0.5 + 0.35 * Math.sin(lt * 1.3))).toFixed(3));
          pool.set(k * (0.42 + 0.09 * Math.sin(lt * 1.3 + 0.4)));
          sp.update(lt); ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ek_mound
  SH.bt_ek_mound = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'site', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'bury') {
        const cx = 540, by = 1110;
        P0(g, 'M-300 1160L1380 1160L1380 2100L-300 2100Z', EARTH, 1);
        let st = ''; const r = rng(71);
        for (let i = 0; i < 30; i++) { const x = -250 + r() * 1580, y = 1190 + r() * 800; st += `M${f1(x)} ${f1(y)}l${f1(30 + r() * 50)} ${f1(-2 + r() * 4)}`; }
        L0(g, st, C.inkSoft, 2, 0.3);
        const glow = BTL.glow(svg, defs, cx, by - 60, 340, C.stain, 0.35, g);
        // layers settle from above, each a soft band with a wavy top line
        const layers = [];
        for (let i = 0; i < 6; i++) {
          const top = 1000 - i * 115, bot = i ? 1000 - (i - 1) * 115 : 1160, r2 = rng(100 + i);
          let wave = `M-300 ${top}`;
          for (let x = -300; x <= 1380; x += 120) wave += `L${x} ${f1(top + (r2() - 0.5) * 22)}`;
          const lg = el(g, 'g', { opacity: 0 });
          P0(lg, `${wave}L1380 ${bot}L-300 ${bot}Z`, mix(C.paper, C.ink, 0.04 + 0.02 * (i % 3)), 1);
          L0(lg, wave, C.inkSoft, 2.5, 0.7);
          let pb = ''; for (let k = 0; k < 10; k++) { const x = -200 + r2() * 1480, y = top + 20 + r2() * Math.max(20, bot - top - 40); pb += `M${f1(x)} ${f1(y)}l${f1(14 + r2() * 26)} 0`; }
          L0(lg, pb, C.inkSoft, 2, 0.35);
          layers.push(lg);
        }
        const L = loaf(g, cx, by - 20, 0.72, {});
        return {
          update(lt, dur) {
            push(g, lt, dur, cx, 900, 0.03);
            layers.forEach((lg, i) => {
              const a = 0.05 + i * Math.min(0.6, dur * 0.7 / 6), q = BTL.ease(lt, a, 0.9);
              fade(lg, q); lg.setAttribute('transform', `translate(0 ${f1(-40 * (1 - q))})`);
            });
            const e = 1 - BTL.ease(lt, 0.3, Math.max(2, dur - 0.5));
            L.ember.setAttribute('stroke-opacity', (0.5 * e).toFixed(3));
            glow.set(0.35 * e + 0.04);
          },
        };
      }
      // site: the mound in cross-section
      const cx = 540, GY = 1140;
      P0(g, `M-300 ${GY}L1380 ${GY}L1380 2100L-300 2100Z`, EARTH, 1);
      L0(g, `M-300 ${GY}L1380 ${GY}`, C.inkSoft, 2, 0.6);
      const mound = `M-200 ${GY}C40 ${GY - 40} 120 560 300 530C420 512 660 512 780 530C960 560 1040 ${GY - 40} 1280 ${GY}Z`;
      P0(g, mound, mix(C.paper, C.ink, 0.08), 1);
      const cid = 'ekm' + (++UID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: mound });
      const inner = el(g, 'g', { 'clip-path': `url(#${cid})` });
      let strata = ''; const r = rng(23);
      for (let i = 1; i < 9; i++) {
        const y = 560 + i * 66; strata += `M-200 ${y}`;
        for (let x = -200; x <= 1280; x += 90) strata += `L${x} ${f1(y + (r() - 0.5) * 16)}`;
      }
      const strE = L0(inner, strata, C.inkSoft, 2, 0.5);
      let pebbles = ''; for (let i = 0; i < 50; i++) { const x = 60 + r() * 960, y = 560 + r() * 560; pebbles += `M${f1(x)} ${f1(y)}l${f1(8 + r() * 14)} 0`; }
      L0(inner, pebbles, C.inkSoft, 2, 0.25);
      const moundE = L0(g, mound.slice(0, -1), C.ink, 3.5, 1);
      // the burnt room deep in the mound
      const RX = 540, RY = 990;
      const pool = BTL.glow(svg, defs, RX, RY - 40, 420, C.stain, 0, g);
      const room = `M${RX - 340} ${RY + 50}L${RX - 340} ${RY - 150}L${RX + 340} ${RY - 150}L${RX + 340} ${RY + 50}Z`;
      const roomG = el(g, 'g', { opacity: 0 });
      P0(roomG, room, mix(C.paper, C.stain, 0.12), 1); L0(roomG, room, C.inkSoft, 2.5, 0.9);
      const loaves = [];
      for (let i = 0; i < 8; i++) {
        const x = RX - 287 + i * 82, y = RY + 34 - (i % 2) * 14;
        const lg = el(g, 'g', { opacity: 0 });
        const d = `M${x - 34} ${y}C${x - 34} ${y - 42} ${x + 34} ${y - 42} ${x + 34} ${y}Z`;
        P0(lg, d, C.gold, 0.85); L0(lg, d, C.ink, 2.5, 0.9);
        loaves.push(lg);
      }
      const lab = txt(g, P.label || 'Seyitömer Höyüğü', cx, 380, 72, { font: LO, italic: true, weight: 400 });
      const rule = L0(g, `M${cx - 120} 420L${cx + 120} 420`, C.gold, 2.5, 1);
      const ds = motes(g, 41, 18, [-100, 300, 1180, 1100], { alpha: 0.25 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          push(g, lt, dur, RX, RY - 60, 0.08);
          stroke(moundE, BTL.ease(lt, 0, 1.4)); stroke(strE, BTL.ease(lt, 0.3, 1.6));
          fade(roomG, BTL.ease(lt, 0.9, 1));
          pool.set(0.12 * BTL.ease(lt, 0.9, 1) + 0.4 * BTL.ease(lt, hit - 0.2, 1.2) + 0.03 * Math.sin(lt * 0.7));
          loaves.forEach((lg, i) => fade(lg, BTL.ease(lt, Math.min(hit, dur - 1.3) - 0.1 + i * 0.1, 0.35)));
          fade(lab, BTL.ease(lt, 0.3, 1.2)); stroke(rule, BTL.ease(lt, 0.7, 1.2));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the room (shared by bt_ek_room)
  const FY = 1060;   // floor
  function roomShell(g) {
    P0(g, `M-300 -200L1380 -200L1380 2100L-300 2100Z`, EARTH, 1);
    const box = `M70 400L1010 400L1010 ${FY}L70 ${FY}Z`;
    P0(g, box, mix(C.paper, C.ink, 0.1), 1);
    // mud-brick courses on the back wall
    let br = '';
    for (let y = 460, row = 0; y < FY; y += 60, row++) { br += `M70 ${y}L1010 ${y}`; for (let x = 70 + (row % 2 ? 60 : 0); x < 1010; x += 120) br += `M${x} ${y - 60}L${x} ${y}`; }
    L0(g, br, C.inkSoft, 1.6, 0.28);
    // roof beams in section
    let bm = ''; for (let x = 120; x < 1000; x += 140) bm += BTL.E(x, 380, 24, 20);
    P0(g, `M40 360L1040 360L1040 400L40 400Z`, mix(C.paper, C.ink, 0.16), 1);
    P0(g, bm, mix(C.paper, C.ink, 0.22), 1); L0(g, bm, C.inkSoft, 2, 0.7);
    L0(g, `M70 400L70 ${FY}M1010 400L1010 ${FY}M40 360L1040 360M40 400L1040 400`, C.ink, 3, 0.9);
    // floor
    P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 0.85);
    L0(g, `M-300 ${FY}L1380 ${FY}`, C.ink, 3, 0.9);
    let st = ''; const r = rng(55);
    for (let i = 0; i < 26; i++) { const x = -250 + r() * 1580, y = FY + 60 + r() * 800; st += `M${f1(x)} ${f1(y)}l${f1(30 + r() * 50)} ${f1(-2 + r() * 4)}`; }
    L0(g, st, C.inkSoft, 2, 0.28);
  }
  const OVEN = `M130 ${FY}C130 880 200 800 310 800C420 800 490 880 490 ${FY}Z`;
  const MOUTH = `M255 ${FY}L255 990Q310 935 365 990L365 ${FY}Z`;
  const SACK = (x, y, s) => `M${x - 62 * s} ${y}C${x - 74 * s} ${y - 34 * s} ${x - 62 * s} ${y - 70 * s} ${x - 34 * s} ${y - 86 * s}` +
    `C${x - 22 * s} ${y - 92 * s} ${x - 14 * s} ${y - 96 * s} ${x - 12 * s} ${y - 102 * s}C${x - 16 * s} ${y - 110 * s} ${x + 16 * s} ${y - 110 * s} ${x + 12 * s} ${y - 102 * s}` +
    `C${x + 14 * s} ${y - 96 * s} ${x + 22 * s} ${y - 92 * s} ${x + 34 * s} ${y - 86 * s}C${x + 62 * s} ${y - 70 * s} ${x + 74 * s} ${y - 34 * s} ${x + 62 * s} ${y}` +
    `C${x + 24 * s} ${y + 8 * s} ${x - 24 * s} ${y + 8 * s} ${x - 62 * s} ${y}Z`;
  const SACKLINES = (x, y, s) => {
    let d = `M${x - 14 * s} ${y - 96 * s}C${x - 4 * s} ${y - 92 * s} ${x + 4 * s} ${y - 92 * s} ${x + 14 * s} ${y - 96 * s}`;
    for (const [u, w] of [[0.18, 0.86], [0.38, 0.92], [0.58, 0.8], [0.76, 0.56]]) {
      const yy = y - u * 90 * s, hw = 60 * s * w;
      for (let x0 = -hw; x0 < hw - 6 * s; x0 += 14 * s) d += `M${f1(x + x0)} ${f1(yy)}l${f1(7 * s)} 0`;
    }
    d += `M${x - 34 * s} ${y - 78 * s}C${x - 30 * s} ${y - 50 * s} ${x - 40 * s} ${y - 24 * s} ${x - 34 * s} ${y - 4 * s}`;
    return d;
  };
  const BURLAP = () => mix(mix(C.paper, C.inkSoft, 0.32), C.stain, 0.15);
  function shelfUnit(g, X0, X1, top, low, o = {}) {
    const posts = `M${X0 + 20} ${FY}L${X0 + 20} ${top - 30}M${X1 - 20} ${FY}L${X1 - 20} ${top - 30}`;
    const boards = `M${X0} ${top}L${X1} ${top}M${X0} ${low}L${X1} ${low}`;
    const pe = L0(g, posts, C.ink, 9, 1), be = L0(g, boards, C.ink, 9, 1);
    const items = el(g, 'g', { opacity: 0 });
    for (const [x, s] of [[X0 + 90, 1], [X0 + 190, 0.9], [X1 - 80, 1]]) { const d = SACK(x, top - 5, s); P0(items, d, BURLAP(), 1); L0(items, d, C.ink, 2.5, 0.9); L0(items, SACKLINES(x, top - 5, s), C.ink, 2, 0.5); }
    for (const x of [X0 + 80, X0 + 170, X1 - 80]) { const d = `M${x - 38} ${low - 5}C${x - 38} ${low - 50} ${x + 38} ${low - 50} ${x + 38} ${low - 5}Z`; P0(items, d, mix(C.paper, C.stain, 0.6), 1); L0(items, d, C.ink, 2.5, 1); }
    return { pe, be, items };
  }

  // ------------------------------------------------------------------ bt_ek_room
  SH.bt_ek_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'build', fire = mode === 'fire', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g); roomShell(g);
      const light = BTL.glow(svg, defs, 540, 820, 560, C.stain, fire ? 0.4 : 0.22, g);
      const ovenG = el(g, 'g');
      P0(ovenG, OVEN, mix(C.paper, C.ink, 0.2), 1);
      P0(ovenG, MOUTH, C.paperDark, 1);
      const ovenE = L0(ovenG, OVEN.slice(0, -1), C.ink, 4, 1), mouthE = L0(ovenG, MOUTH.slice(0, -1), C.ink, 3, 1);
      const mouthGlow = BTL.glow(svg, defs, 310, FY - 30, 120, C.gold, 0, g);
      const sh = shelfUnit(g, 640, 960, 700, 900);
      const soot = P0(g, `M70 400L1010 400L1010 600C860 560 700 640 540 580C380 640 220 570 70 620Z`, C.inkSoft, 0);
      const fl = fire ? flames(g, [[200, FY, 1.1], [420, FY, 1.3], [600, FY, 1.2], [700, 900, 0.8], [880, 900, 0.8], [800, 700, 0.9], [980, FY, 1]], 61) : null;
      const smoke = fire ? puffs(g, 19, 9, { x0: 600, spread: 700, y0: 700, dx: 30, dy: -300, size: 60, rate: 0.06, alpha: 0.2 }) : null;
      const emb = motes(g, 8, fire ? 22 : 12, [120, 520, 980, FY - 20], { up: true, color: fire ? C.gold : C.inkSoft, alpha: fire ? 0.6 : 0.25, size: 2.2 });
      return {
        update(lt, dur, cues) {
          push(g, lt, dur, 540, 820, 0.035);
          if (fire) {
            for (const e of [ovenE, mouthE, sh.pe, sh.be]) stroke(e, 1);
            fade(sh.items, 1);
            const on = BTL.ease(lt, 0, 1.4);
            fl.update(lt, 0.25 + 0.75 * on); smoke.update(lt, on);
            soot.setAttribute('fill-opacity', (0.1 + 0.2 * BTL.ease(lt, 0, Math.max(2, dur))).toFixed(3));
            light.set(0.3 + 0.12 * on + 0.04 * Math.sin(lt * 1.1));
            mouthGlow.set(0.5);
          } else {
            const a = cue(cues, 'a', dur * 0.3), b = cue(cues, 'b', dur * 0.65);
            stroke(ovenE, BTL.ease(lt, a - 0.4, 1.2)); stroke(mouthE, BTL.ease(lt, a, 1));
            fade(ovenG, 0.15 + 0.85 * BTL.ease(lt, a - 0.4, 0.8));
            mouthGlow.set(0.45 * BTL.ease(lt, a + 0.4, 1) + 0.04 * Math.sin(lt * 0.9));
            const bb = Math.min(b, dur - 1.1);
            stroke(sh.pe, BTL.ease(lt, bb - 0.5, 0.6)); stroke(sh.be, BTL.ease(lt, bb - 0.2, 0.6));
            fade(sh.items, BTL.ease(lt, bb + 0.1, 0.6));
            light.set(0.2 + 0.03 * Math.sin(lt * 0.6));
          }
          emb.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ek_shelf
  SH.bt_ek_shelf = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      P0(g, 'M-300 -200L1380 -200L1380 1100L-300 1100Z', mix(C.paper, C.ink, 0.08), 1);
      let br = '';
      for (let y = 160, row = 0; y < 1100; y += 80, row++) { br += `M-300 ${y}L1380 ${y}`; for (let x = -300 + (row % 2 ? 80 : 0); x < 1380; x += 160) br += `M${x} ${y - 80}L${x} ${y}`; }
      L0(g, br, C.inkSoft, 1.6, 0.22);
      const back = BTL.glow(svg, defs, 540, 900, 600, C.red, 0.18, g);
      const FL = 1100;
      P0(g, `M-300 ${FL}L1380 ${FL}L1380 2100L-300 2100Z`, C.paperDark, 0.9);
      L0(g, `M-300 ${FL}L1380 ${FL}`, C.ink, 3, 0.9);
      const fl = flames(g, [[120, FL, 0.9], [960, FL, 1.0], [40, FL, 0.6]], 7);
      // posts
      const PX0 = 230, PX1 = 850, TOP = 560;
      L0(g, `M${PX0} ${FL}L${PX0} 460`, C.ink, 14, 1);
      const rightPost = el(g, 'g');
      L0(rightPost, `M${PX1} ${FL}L${PX1} 760M${PX1 - 6} 760L${PX1 + 10} 740L${PX1 + 2} 724`, C.ink, 14, 1);
      // the board + sacks rotate down around the left post
      const board = el(g, 'g');
      L0(board, `M${PX0 - 60} ${TOP}L${PX1 + 60} ${TOP}`, C.ink, 14, 1);
      const sacks = [[380, 1], [560, 0.95], [740, 1.05]];
      for (const [x, s] of sacks) { const d = SACK(x, TOP - 8, s * 1.6); P0(board, d, BURLAP(), 1); L0(board, d, C.ink, 3, 0.9); L0(board, SACKLINES(x, TOP - 8, s * 1.6), C.ink, 2.5, 0.5); }
      // loaves start on the board, then fall to the floor
      const loaves = [[300, 0.24, 470, -14], [480, 0.22, 650, 10], [660, 0.24, 820, 22]].map(([x, k, ex, rot]) => ({ L: loaf(g, x, TOP - 34, k, { shadow: false }), x, k, ex, rot }));
      // grains
      const r = rng(91), grains = [];
      for (let i = 0; i < 70; i++) {
        const s = sacks[i % 3], wheat = i % 5 < 3;
        const e = P0(g, '', wheat ? C.gold : C.inkSoft, 0);
        grains.push({ e, wheat, sx: s[0] + (r() - 0.5) * 30, ex: s[0] + 40 + (r() - 0.5) * 340, ey: FL - 6 - r() * 26, t: r() * 2.2, rot: r() * 180 });
      }
      const ds = motes(g, 33, 18, [0, 300, 1080, FL], { up: true, color: C.gold, alpha: 0.45, size: 2.2 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.2);
          push(g, lt, dur, 540, 820, 0.03);
          const q = BTL.ease(lt, hit, 1.8), ang = 26 * q;
          board.setAttribute('transform', `rotate(${f1(ang)} ${PX0} ${TOP})`);
          fade(rightPost, 1 - 0.75 * q);
          const rad = ang * Math.PI / 180;
          for (const l of loaves) {
            const f = BTL.ease(lt, hit + 0.4 + (l.x - 300) / 900, 1.6);
            const bx = PX0 + (l.x - PX0) * Math.cos(rad), by = TOP - 34 + (l.x - PX0) * Math.sin(rad);
            const x = lerp(bx, l.ex, f), y = lerp(by, FL - 26, f * f);
            l.L.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(lerp(ang, l.rot, f))}) scale(${l.k})`);
            if (l.L.ember) l.L.ember.setAttribute('stroke-opacity', (0.5 + 0.2 * Math.sin(lt * 0.9 + l.x)).toFixed(3));
          }
          for (const p of grains) {
            const t0 = hit + 0.6 + p.t, f = clamp01((lt - t0) / 1.6);
            if (lt < t0) { p.e.setAttribute('fill-opacity', 0); continue; }
            const sx = PX0 + (p.sx - PX0) * Math.cos(rad), sy = TOP - 30 + (p.sx - PX0) * Math.sin(rad) - 40;
            const x = lerp(sx, p.ex, f), y = lerp(sy, p.ey, f * f), rot = p.rot + 120 * f;
            const rx = p.wheat ? 9 : 6, ry = p.wheat ? 4.5 : 5;
            p.e.setAttribute('d', BTL.E(0, 0, rx, ry));
            p.e.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`);
            p.e.setAttribute('fill-opacity', (p.wheat ? 0.9 : 0.85).toFixed(2));
          }
          fl.update(lt, 0.7); back.set(0.18 + 0.04 * Math.sin(lt * 0.8));
          ds.update(lt);
        },
      };
    },
  };
})();
