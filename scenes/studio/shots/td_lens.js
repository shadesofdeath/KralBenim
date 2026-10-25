// td_lens + td_lab: the tardigrade up close (Stickstory 2026-10-25 tardigrades-in-space Short), parametric.
// Uses td__lib.js (window.TD). BRAND.md §3/§5: palette tokens only, boil 8 Hz, pure function of (seed, lt).
//
// SHOTS.td_lens — the narrator holds a giant magnifying glass; inside the lens a tardigrade walks over moss (the
//   moss scrolls under it), with drifting water bubbles. It can dry into a "tun", wake up again, and lay eggs that hatch.
//   P: {lens: {x: 0.42, y: 0.37, r: 330}, bear: {s: 0.95, walk: true, x: 0, y: 0.35 (0..1 of the lens radius)},
//       dry: {at: cue|sec, to: 1, from: 0, dur: 1.2} (dries into a tun) | wake: {at, dur: 1.4} (tun -> active, starts walking),
//       eggs: {at, n: 3, hatch: cue|sec} (eggs appear one by one beside the bear, babies climb out on hatch),
//       ruler: {text: "0.5 mm", at} (a scale bar under the bear inside the lens),
//       labels: [{text, x, y, at, size, color, font, box}], kasif: K (holds the lens handle with the higher hand)}
//   cues: hit, dry.at, wake.at, eggs.at/hatch, labels/seq names
//
// SHOTS.td_lab — a lab bench: shelf with flasks behind, a glass dish with a dried tun on the bench, a dropper comes
//   down and lets one drop of water fall on a cue (splash rings, the dish fills); a round callout above shows the tun
//   starting to swell. P: {dish: {x: 0.42}, drop: {at: cue|sec}, callout: true, callout_r: 150, wake: false (the tun in the callout fully revives and walks), ground: 0.53 (bench top, 0..1 H), labels: [...], kasif: K}
//   cues: hit, drop.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  let clipN = 0;

  function lensBody(parent, defs, sd, cx, cy, r) {
    const id = 'tdlens' + (sd % 100000) + '_' + (clipN++);
    const cp = el(defs || parent, 'clipPath', { id }); el(cp, 'circle', { cx, cy, r: r - 6 });
    const back = inkEl(parent, INK.paperLight), water = inkEl(parent, INK.blue, { 'fill-opacity': 0.12 });
    const inner = el(parent, 'g', { 'clip-path': `url(#${id})` });
    return { back, water, inner };
  }

  SH.td_lens = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 511;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const Ln = Object.assign({ x: 0.42, y: 0.37, r: 330 }, P.lens || {});
      const cx = Ln.x * W, cy = Ln.y * H, R = Ln.r;
      const handle = inkEl(cam, INK.hatBand), handleR = inkEl(cam);
      const L = lensBody(cam, defs, sd, cx, cy, R);
      const bub = inkEl(L.inner, INK.paperLight), bubR = inkEl(L.inner, INK.inkSoft);
      const mossB = inkEl(L.inner, INK.green, { 'fill-opacity': 0.55 }), mossR = inkEl(L.inner, INK.ink);
      const B = Object.assign({ s: 0.95, walk: true, x: 0, y: 0.35 }, P.bear || {});
      const eggsG = el(L.inner, 'g');
      const EG = P.eggs ? Object.assign({ n: 3 }, P.eggs) : null;
      const eggs = EG ? Array.from({ length: EG.n }, (_, i) => TD.egg(eggsG, sd + 70 + i * 7)) : [];
      const bear = TD.bear(el(L.inner, 'g'), sd + 5);
      const ruler = P.ruler ? { f: inkEl(L.inner, INK.ink), t: el(L.inner, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }) } : null;
      if (ruler) ruler.t.textContent = P.ruler.text || '0.5 mm';
      const rimR = inkEl(cam), rim2 = inkEl(cam, INK.inkSoft), glint = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.8 });
      const labels = (P.labels || []).map((Lb, i) => TD.label(cam, Lb, W, H, sd + 30 + i));
      const kas = P.kasif === false ? null : TD.figure(el(root, 'g'), Object.assign({ x: 0.82, y: 0.6, scale: 0.85, pose: 'point', face: 'left', dir: 40 }, P.kasif || {}), sd + 6);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          const pin = spring(lt, 0, 0.6), rr = R * lerp(0.85, 1, pin);
          const disc = TD.ell(cx, cy, rr, rr, 28);
          L.back.setAttribute('d', inkLoop(disc, { seed: sd + 1, t, amp: 1 }));
          L.water.setAttribute('d', inkLoop(disc, { seed: sd + 1, t, amp: 1 }));
          // dry / wake state
          let dry = 0, walking = B.walk;
          if (P.dry) { const a = atOr(cues, P.dry.at, dur * 0.4); dry = lerp(P.dry.from ?? 0, P.dry.to ?? 1, lt >= a ? progIO(lt, a, P.dry.dur ?? 1.2) : 0); if (dry > 0.3) walking = false; }
          let wakePk = 0;
          if (P.wake) { const a = atOr(cues, P.wake.at, dur * 0.3); dry = 1 - (lt >= a ? progIO(lt, a, P.wake.dur ?? 1.4) : 0); walking = dry < 0.2; wakePk = punch(lt, a + (P.wake.dur ?? 1.4) * 0.8, 0.6); }
          const speed = walking ? 0.9 : 0, ph = lt * speed;
          // moss scrolls under a walking bear (the bear stays centred in the lens)
          const scroll = (walking ? lt * 70 : 0) % 260;
          const gy = cy + R * B.y;
          let md = '', mr = '';
          for (let k = -1; k < 6; k++) {
            const x0 = cx - R - 40 + k * 260 - scroll;
            const tuft = [[x0, gy + R], [x0, gy + 20], [x0 + 40, gy - 8], [x0 + 90, gy + 14], [x0 + 130, gy - 4], [x0 + 180, gy + 12], [x0 + 220, gy - 6], [x0 + 260, gy + 18], [x0 + 260, gy + R]];
            md += inkLoop(tuft, { seed: sd + 20 + k, t, amp: 1.2 }) + ' ';
            mr += inkPath(tuft.slice(1, -1), { w: 5, seed: sd + 30 + k, t, amp: 1.2 }) + ' ';
            for (let j = 0; j < 3; j++) mr += inkPath([[x0 + 40 + j * 80, gy + 30], [x0 + 52 + j * 80, gy - 30 - (j % 2) * 18]], { w: 3.5, seed: sd + 40 + k * 3 + j, t, amp: 1 }) + ' ';
          }
          mossB.setAttribute('d', md); mossR.setAttribute('d', mr);
          let bd = '', br = '';
          for (let k = 0; k < 7; k++) {
            const bx = cx - R * 0.8 + ((k * 137 + 40) % (R * 1.6)), by = cy + R * 0.3 - ((lt * (30 + k * 6) + k * 90) % (R * 1.2)), r = 9 + (k % 3) * 6;
            const p = TD.ell(bx + Math.sin(lt * 2 + k) * 8, by, r, r, 8);
            bd += inkLoop(p, { seed: sd + 50 + k, t, amp: 0.6 }) + ' ';
            br += inkPath(p, { w: 3, seed: sd + 60 + k, t, closed: true, amp: 0.6 }) + ' ';
          }
          bub.setAttribute('d', bd); bubR.setAttribute('d', br);
          const bs = B.s * (1 + 0.08 * wakePk);
          bear.update(t, { x: cx + B.x * R - 20, y: gy, s: bs, face: 1, ph, dry, rot: walking ? Math.sin(lt * 1.8) * 1.5 : 0 });
          if (EG) {
            const a = atOr(cues, EG.at, dur * 0.3), h = atOr(cues, EG.hatch, null);
            eggs.forEach((e, i) => {
              const ea = a + i * 0.28, p = lt >= ea ? spring(lt, ea, 0.5) : 0;
              const hc = h == null ? 0 : (lt >= h + i * 0.15 ? prog(lt, h + i * 0.15, 0.3) : 0), hb = h == null ? 0 : (lt >= h + 0.3 + i * 0.15 ? progIO(lt, h + 0.3 + i * 0.15, 0.8) : 0);
              e.update(t, { x: cx - R * 0.62 + i * 80, y: gy + 22 + (i % 2) * 14, s: 1.1 * p, crack: hc, baby: hb });
            });
          }
          if (ruler) {
            const a = atOr(cues, P.ruler.at, 0.3), p = lt >= a ? prog(lt, a, 0.5) : 0, w = 420 * bs * p, y = gy + 95, x0 = cx - 20 - 210 * bs;
            ruler.f.setAttribute('d', p > 0.01 ? inkPath([[x0, y], [x0 + w, y]], { w: 6, seed: sd + 90, t }) + ' ' + inkPath([[x0, y - 18], [x0, y + 18]], { w: 6, seed: sd + 91, t }) + ' ' +
              inkPath([[x0 + w, y - 18], [x0 + w, y + 18]], { w: 6, seed: sd + 92, t }) : '');
            ruler.t.setAttribute('x', f1(cx - 20)); ruler.t.setAttribute('y', f1(y + 70));
            ruler.t.setAttribute('opacity', clamp01((p - 0.6) * 3).toFixed(3));
          }
          rimR.setAttribute('d', inkPath(disc, { w: 16, seed: sd + 2, t, closed: true, amp: 1 }));
          rim2.setAttribute('d', inkPath(TD.ell(cx, cy, rr - 18, rr - 18, 28), { w: 4, seed: sd + 3, t, closed: true, amp: 1 }));
          const ga = -2.5 + Math.sin(lt * 0.8) * 0.15, gp = [];
          for (let k = 0; k <= 6; k++) { const a = ga + k * 0.09; gp.push([cx + Math.cos(a) * (rr - 40), cy + Math.sin(a) * (rr - 40)]); }
          for (let k = 6; k >= 0; k--) { const a = ga + k * 0.09; gp.push([cx + Math.cos(a) * (rr - 64), cy + Math.sin(a) * (rr - 64)]); }
          glint.setAttribute('d', inkLoop(gp, { seed: sd + 4, t, amp: 0.8 }));
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) {
            const f = kas.update(lt, t, cues, W, H);
            const hand = f.hand[1] < f.hand2[1] ? f.hand : f.hand2;
            // handle from the rim (towards the hand) to the hand
            const ang = Math.atan2(hand[1] - cy, hand[0] - cx), rim = [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
            const nx = -Math.sin(ang), ny = Math.cos(ang), wdt = 22, end = [hand[0] + Math.cos(ang) * 20, hand[1] + Math.sin(ang) * 20];
            const hp = [[rim[0] + nx * wdt, rim[1] + ny * wdt], [end[0] + nx * wdt, end[1] + ny * wdt], [end[0] - nx * wdt, end[1] - ny * wdt], [rim[0] - nx * wdt, rim[1] - ny * wdt]];
            handle.setAttribute('d', inkLoop(hp, { seed: sd + 7, t, smooth: false }));
            handleR.setAttribute('d', inkPath(hp, { w: 5, seed: sd + 8, t, closed: true, smooth: false }));
          }
        },
      };
    },
  };

  SH.td_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 577;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = H * (P.ground ?? 0.53), dx = (P.dish && P.dish.x || 0.42) * W;
      // back shelf + flasks
      const shelf = inkEl(cam, INK.inkSoft), flF = inkEl(cam, INK.paperLight), flL = inkEl(cam, INK.blue, { 'fill-opacity': 0.35 }), flR = inkEl(cam, INK.inkSoft);
      const bench = inkEl(cam, INK.paperDark), benchR = inkEl(cam);
      const dishF = inkEl(cam, INK.paperLight), dishW = inkEl(cam, INK.blue, { 'fill-opacity': 0 }), dishR = inkEl(cam), ripple = inkEl(cam, INK.blue);
      const tunSmall = TD.bear(el(cam, 'g'), sd + 9);
      const drop = inkEl(cam, INK.blue), dropR = inkEl(cam);
      const pipF = inkEl(cam, INK.paperLight), pipW = inkEl(cam, INK.blue, { 'fill-opacity': 0.4 }), pipR = inkEl(cam), bulb = inkEl(cam, INK.red), bulbR = inkEl(cam);
      const CO = P.callout !== false;
      const coLines = inkEl(cam, INK.inkSoft), coF = inkEl(cam, INK.paperLight), coR = inkEl(cam);
      const coId = 'tdlab' + (sd % 100000) + '_' + (clipN++), coc = el(defs || cam, 'clipPath', { id: coId }), coCirc = el(coc, 'circle');
      const coIn = el(cam, 'g', { 'clip-path': `url(#${coId})` }), coWater = inkEl(coIn, INK.blue, { 'fill-opacity': 0 }), coBear = TD.bear(el(coIn, 'g'), sd + 10);
      const labels = (P.labels || []).map((Lb, i) => TD.label(cam, Lb, W, H, sd + 30 + i));
      const kas = P.kasif === false ? null : TD.figure(el(root, 'g'), Object.assign({ x: 0.82, y: 0.6, scale: 0.85, pose: 'point', face: 'left', dir: 10 }, P.kasif || {}), sd + 6);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          cam.setAttribute('transform', `translate(${f1(dx)} ${f1(gy)}) scale(${z.toFixed(4)}) translate(${f1(-dx)} ${f1(-gy)})`);
          shelf.setAttribute('d', inkPath([[40, H * 0.2], [W - 40, H * 0.205]], { w: 7, seed: sd + 1, t }));
          let ff = '', fl = '', fr = '';
          [[0.1, 1], [0.24, 0.8], [0.66, 1.1], [0.88, 0.85]].forEach(([u, k], i) => {
            const x = u * W, y = H * 0.2, w = 46 * k, h = 130 * k;
            const p = [[x - 14 * k, y - h], [x + 14 * k, y - h], [x + 14 * k, y - h * 0.55], [x + w, y - 4], [x - w, y - 4], [x - 14 * k, y - h * 0.55]];
            ff += inkLoop(p, { seed: sd + 10 + i, t, smooth: false }) + ' ';
            fl += inkLoop([[x - w * 0.62, y - h * 0.24], [x + w * 0.62, y - h * 0.24], [x + w, y - 4], [x - w, y - 4]], { seed: sd + 14 + i, t, smooth: false }) + ' ';
            fr += inkPath(p, { w: 4.5, seed: sd + 18 + i, t, closed: true, smooth: false }) + ' ';
          });
          flF.setAttribute('d', ff); flL.setAttribute('d', fl); flR.setAttribute('d', fr);
          const bp = [[-20, gy], [W + 20, gy], [W + 20, gy + 60], [-20, gy + 60]];
          bench.setAttribute('d', inkLoop(bp, { seed: sd + 2, t, smooth: false }));
          benchR.setAttribute('d', inkPath([[-20, gy], [W + 20, gy]], { w: 7, seed: sd + 3, t }) + ' ' + inkPath([[-20, gy + 60], [W + 20, gy + 60]], { w: 5, seed: sd + 4, t }));
          // dish (perspective ellipse)
          const da = atOr(cues, P.drop && P.drop.at, dur * 0.45), fall = 0.35;
          const land = da + fall, wet = lt >= land ? prog(lt, land, 0.6) : 0;
          const dy = gy - 40, dw = 230, dh = 52;
          const rimP = TD.ell(dx, dy, dw, dh, 20);
          dishF.setAttribute('d', inkLoop(rimP, { seed: sd + 5, t }) + ' ' + inkLoop([[dx - dw, dy], [dx + dw, dy], [dx + dw - 6, dy + 34], [dx - dw + 6, dy + 34]], { seed: sd + 6, t, smooth: false }));
          dishW.setAttribute('fill-opacity', (wet * 0.4).toFixed(3));
          dishW.setAttribute('d', inkLoop(TD.ell(dx, dy + 6, dw * 0.9, dh * 0.75, 18), { seed: sd + 7, t }));
          dishR.setAttribute('d', inkPath(rimP, { w: 6, seed: sd + 8, t, closed: true }) + ' ' + inkPath([[dx - dw, dy], [dx - dw + 6, dy + 34], [dx, dy + dh + 34], [dx + dw - 6, dy + 34], [dx + dw, dy]], { w: 6, seed: sd + 9, t }));
          tunSmall.update(t, { x: dx, y: dy + 16, s: 0.16, dry: 1 - wet * 0.25 });
          let rp = '';
          if (lt >= land) for (let k = 0; k < 3; k++) {
            const q = ((lt - land) * 0.8 + k * 0.33) % 1, r = lerp(20, dw * 0.85, q);
            rp += inkPath(TD.ell(dx, dy + 8, r, r * dh / dw, 18), { w: 4 * (1 - q) + 0.5, seed: sd + 40 + k, t, closed: true, amp: 0.8 }) + ' ';
          }
          ripple.setAttribute('d', rp);
          // dropper: comes down, squeezes on the cue, the drop falls
          const comeIn = spring(lt, 0, 0.7), py = lerp(-200, H * 0.28, comeIn) + Math.sin(lt * 1.5) * 6, sq = punch(lt, da, 0.5);
          const tip = [dx + 10, py + 300];
          const pip = [[dx - 22, py], [dx + 42, py], [dx + 42, py + 220], [dx + 16, py + 300], [dx + 4, py + 300], [dx - 22, py + 220]];
          pipF.setAttribute('d', inkLoop(pip, { seed: sd + 20, t, smooth: false }));
          pipW.setAttribute('d', inkLoop([[dx - 22, py + 150 + 50 * clamp01((lt - da) * 2)], [dx + 42, py + 150 + 50 * clamp01((lt - da) * 2)], [dx + 42, py + 220], [dx + 16, py + 300], [dx + 4, py + 300], [dx - 22, py + 220]], { seed: sd + 21, t, smooth: false }));
          pipR.setAttribute('d', inkPath(pip, { w: 5, seed: sd + 22, t, closed: true, smooth: false }));
          const bw = 52 * (1 - 0.3 * sq), bh = 90 * (1 - 0.25 * sq);
          const bul = TD.ell(dx + 10, py - bh * 0.6, bw, bh, 14);
          bulb.setAttribute('d', inkLoop(bul, { seed: sd + 23, t }));
          bulbR.setAttribute('d', inkPath(bul, { w: 6, seed: sd + 24, t, closed: true }));
          if (lt >= da - 0.4 && lt < land) {
            const grow = clamp01((lt - da + 0.4) / 0.4), f = lt >= da ? clamp01((lt - da) / fall) : 0;
            const yy = lerp(tip[1] + 16 * grow, dy, f * f), r = 16 * grow;
            const dp = [[tip[0], yy - r * 1.9], [tip[0] + r, yy], [tip[0], yy + r], [tip[0] - r, yy]];
            drop.setAttribute('d', inkLoop(dp, { seed: sd + 25, t, amp: 0.6 }));
            dropR.setAttribute('d', inkPath(dp, { w: 4, seed: sd + 26, t, closed: true, amp: 0.6 }));
          } else { drop.setAttribute('d', ''); dropR.setAttribute('d', ''); }
          // callout: the tun up close, starting to swell once wet
          if (CO) {
            const cr = P.callout_r || 150, ccx = dx - 250 - (cr - 150) * 0.4, ccy = H * 0.39 - (cr - 150) * 0.3, cp = spring(lt, 0.2, 0.6), r = cr * cp;
            coCirc.setAttribute('cx', f1(ccx)); coCirc.setAttribute('cy', f1(ccy)); coCirc.setAttribute('r', f1(Math.max(1, r - 4)));
            const cpts = TD.ell(ccx, ccy, Math.max(1, r), Math.max(1, r), 18);
            coF.setAttribute('d', inkLoop(cpts, { seed: sd + 50, t }));
            coR.setAttribute('d', inkPath(cpts, { w: 7, seed: sd + 51, t, closed: true }));
            coLines.setAttribute('d', cp > 0.3 ? inkPath([[ccx + r * 0.7, ccy + r * 0.7], [dx - 10, dy - 6]], { w: 4, seed: sd + 52, t }) : '');
            coWater.setAttribute('fill-opacity', (wet * 0.3).toFixed(3));
            coWater.setAttribute('d', inkLoop(TD.ell(ccx, ccy + cr * 0.5, cr * 1.2, cr * 0.6 + wet * 60, 12), { seed: sd + 53, t }));
            const sw = lt >= land ? progIO(lt, land + 0.1, P.wake ? 1.0 : 1.5) : 0, k = cr / 150;
            const dryC = 1 - sw * (P.wake ? 1 : 0.35), walk = P.wake && sw > 0.85;
            coBear.update(t, { x: ccx - 6 * k, y: ccy + 66 * k, s: 0.5 * k * cp * (1 + Math.sin(lt * 9) * 0.01 * sw), dry: dryC, ph: walk ? lt * 0.9 : 0, rot: Math.sin(lt * 3) * 2 * sw });
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
