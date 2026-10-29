// lh_lab: Seligman & Maier's lab in 1967 (University of Pennsylvania), parchment ink style (brand/kit/BRAND.md §3, §5;
// boils at 8 Hz, pure function of (seed, time)). Left: a dog stands on a table in a canvas hammock sling (stitched
// band under its belly, four leather straps with buckles up to a wooden frame), a small panel next to its head. On
// `zap` small gold zig-zag marks flicker on the table under its paws and the dog startles (ears up, eyes wide), then
// stands again; no pain is drawn. Right: two hatless young psychologists: Seligman (dark hair, glasses, white lab
// coat) writes on a clipboard; Maier (dark hair, sweater) holds the switch box whose lever flips on `zap`, its cable
// runs to the table. Hand-written names over their heads. On the wall a tear-off calendar shows P.year. Foreground: a
// lab bench with glassware down to the frame bottom. Leaves the wall and floor to the scene's "set" (interior).
// P: {year: "1967", gy: 0.6 (floor line, 0..1 H), bench: 0.745 (bench top, 0..1 H), cal: [0.8, 0.215, 230, 250],
//     names: ["Seligman", "Maier"] | false}
// cues: zap (marks + startle + lever). Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 433, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const wood = mix(INK.stain, INK.paperDark, 0.3), leather = mix(INK.stain, INK.ink, 0.45), canvas = mix(INK.stain, INK.paperLight, 0.55);
      const cal = L.calendar(el(root, 'g'), sd + 1);
      const tblF = inkEl(root, wood), tblR = inkEl(root);
      const frameF = inkEl(root, mix(INK.stain, INK.ink, 0.2));
      const panel = inkEl(root, INK.paperDark), panelR = inkEl(root);
      const strapsB = inkEl(root, mix(leather, INK.paperDark, 0.3));
      const dg = L.dog(el(root, 'g'), sd + 10);
      const sling = inkEl(root, canvas), slingR = inkEl(root), stitch = inkEl(root, mix(INK.stain, INK.ink, 0.2)), strapsF = inkEl(root, leather), buckles = inkEl(root, INK.gold), bucklesR = inkEl(root);
      const zaps = [0, 1, 2].map(i => L.zap(el(root, 'g'), sd + 20 + i * 5));
      const cable = inkEl(root);
      const sel = L.person(el(root, 'g'), sd + 40, { kind: 'lab', hair: 'dark', glasses: true });
      const clip = inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), clipP = inkEl(root, INK.paperLight), clipR = inkEl(root), pen = inkEl(root, INK.blue);
      const mai = L.person(el(root, 'g'), sd + 50, { kind: 'sweater', hair: 'dark', glasses: false, col: mix(INK.blue, INK.paperDark, 0.35) });
      const swb = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3)), swbR = inkEl(root), lever = inkEl(root), lamp = inkEl(root, INK.red);
      const names = P.names === false ? [] : (P.names || ['Seligman', 'Maier']).map(n => { const g = el(root, 'g'); const h = L.txt(g, { 'font-family': INK_FONT, 'font-size': 56 * u, fill: 'none', stroke: INK.paperLight, 'stroke-width': 10, 'stroke-linejoin': 'round' }); const x = L.txt(g, { 'font-family': INK_FONT, 'font-size': 56 * u, fill: INK.ink }); h.textContent = x.textContent = n; return g; });
      const bench = L.front(el(root, 'g'), sd + 60, 'bench');
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const zap = L.atOr(cues, 'zap', dur * 0.45);
          const c = P.cal || [0.8, 0.215, 230, 250];
          cal.update(t, c[0] * W, c[1] * H, c[2] * u, c[3] * u, P.year || '1967', 0);
          // table
          const ty = 0.455 * H, tx0 = 30 * u, tx1 = 510 * u;
          tblF.setAttribute('d', inkLoop(L.rect(tx0, ty, tx1, ty + 34 * u), { seed: k + 1, t, smooth: false }));
          tblR.setAttribute('d', inkPath(L.rect(tx0, ty, tx1, ty + 34 * u), { w: 6, seed: k + 2, t, closed: true, smooth: false }) + ' ' +
            [tx0 + 40 * u, tx1 - 40 * u].map((x, i) => inkPath([[x, ty + 34 * u], [x + (i ? 8 : -8) * u, gy]], { w: 14 * u, seed: k + 3 + i, t })).join(' ') + ' ' +
            inkPath([[tx0 + 40 * u, gy - 120 * u], [tx1 - 40 * u, gy - 120 * u]], { w: 8 * u, seed: k + 5, t }));
          // harness frame: two posts and a top bar
          const fx0 = 70 * u, fx1 = 470 * u, ftop = 0.29 * H;
          frameF.setAttribute('d', [fx0, fx1].map((x, i) => inkPath([[x, ty], [x, ftop]], { w: 22 * u, seed: k + 10 + i, t })).join(' ') + ' ' + inkPath([[fx0 - 20 * u, ftop], [fx1 + 20 * u, ftop]], { w: 24 * u, seed: k + 12, t }));
          const pp = L.rect(fx1 - 64 * u, ty - 250 * u, fx1 - 12 * u, ty - 140 * u);
          panel.setAttribute('d', inkLoop(pp, { seed: k + 13, t, smooth: false }));
          panelR.setAttribute('d', inkPath(pp, { w: 5, seed: k + 14, t, closed: true, smooth: false }));
          // the dog: standing; startles on each flash after `zap`
          const flash = lt >= zap && ((t * 5 + 0.37 + (sd + 20) * 0.13) % 1) < 0.55;
          const since = lt - zap, startle = lt >= zap ? clamp01(1 - Math.max(0, since - 0.5) / 0.8) : 0;
          const dx = 240 * u, ds = 0.74 * u;
          const res = dg.update(t, dx, ty, ds, { pose: startle > 0.05 ? 'flinch' : 'stand', prev: 'stand', mix: startle > 0.05 ? clamp01(since / 0.2) : 1, face: 1, shake: flash && startle > 0.2 ? 0.35 : 0, ear: startle > 0.05 ? 0 : -0.1, sway: 0.3 });
          // canvas hammock: a stitched band hugging the belly, four leather straps with buckles
          const bc = res.body, sw = 128 * ds / u * u, bot = bc[1] + 52 * ds / u * u;
          const out = [], inn = [];
          for (let i = 0; i <= 10; i++) { const a = i / 10; const x = lerp(bc[0] - sw, bc[0] + sw, a), y = lerp(bc[1] - 8 * u, bot, Math.sin(a * Math.PI)); out.push([x, y + 26 * u * Math.sin(a * Math.PI)]); inn.push([x, y - 22 * u]); }
          const band = out.concat(inn.reverse());
          sling.setAttribute('d', inkLoop(band, { seed: k + 20, t, amp: 0.8 }));
          slingR.setAttribute('d', inkPath(band, { w: 5, seed: k + 21, t, closed: true, amp: 0.8 }));
          const STI = []; for (let i = 1; i < 10; i++) { const a = out[i], b = inn[10 - i]; const m = [lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5)]; STI.push(inkPath([[m[0] - 9 * u, m[1]], [m[0] + 9 * u, m[1] - 1]], { w: 3, seed: k + 22 + i, t })); }
          stitch.setAttribute('d', STI.join(' '));
          const ends = [inn[10], inn[8], inn[2], inn[0]];
          const S = [], BK = [], BKR = [];
          ends.forEach((e, i) => {
            const top = [lerp(fx0 + 60 * u, fx1 - 60 * u, [0.02, 0.22, 0.78, 0.98][i]), ftop + 10 * u];
            (i === 1 || i === 2 ? S : S).push(inkPath([top, e], { w: 12 * u, seed: k + 40 + i, t, taper: 0 }));
            const bm = [lerp(top[0], e[0], 0.55), lerp(top[1], e[1], 0.55)];
            const br = L.rect(bm[0] - 12 * u, bm[1] - 9 * u, bm[0] + 12 * u, bm[1] + 9 * u);
            BK.push(inkLoop(br, { seed: k + 50 + i, t, smooth: false })); BKR.push(inkPath(br, { w: 3, seed: k + 54 + i, t, closed: true, smooth: false }));
          });
          strapsF.setAttribute('d', S.join(' ')); strapsB.setAttribute('d', '');
          buckles.setAttribute('d', BK.join(' ')); bucklesR.setAttribute('d', BKR.join(' '));
          zaps.forEach((z, i) => z.update(t, (110 + i * 140) * u, ty - 30 * u, 46 * u, lt >= zap ? 1 : 0, i));
          // Maier holds the switch box; the lever flips on `zap`; cable to the table
          const mx = 0.885 * W, s = 0.95 * u;
          const bxp = [mx - 110 * s, gy - 300 * s];
          const flip = lt >= zap ? 1 : 0;
          mai.update(t, mx, gy, s, { face: -1, lean: 4, armL: [bxp[0] - 40 * s, bxp[1] + 10 * s], armR: [bxp[0] + 30 * s, bxp[1] + 12 * s], look: flip ? [4, 8] : [2, 2], brow: flip ? 0.6 : 0 });
          const bb = L.rect(bxp[0] - 60 * s, bxp[1] - 40 * s, bxp[0] + 50 * s, bxp[1] + 40 * s);
          swb.setAttribute('d', inkLoop(bb, { seed: k + 60, t, smooth: false }));
          swbR.setAttribute('d', inkPath(bb, { w: 5, seed: k + 61, t, closed: true, smooth: false }));
          const la = (flip ? -40 : 40) * Math.PI / 180, lb = [bxp[0] - 10 * s, bxp[1] - 40 * s];
          lever.setAttribute('d', inkPath([lb, [lb[0] + Math.sin(la) * 60 * s, lb[1] - Math.cos(la) * 60 * s]], { w: 9 * s, seed: k + 62, t }) + ' ' + inkDot(lb[0] + Math.sin(la) * 60 * s, lb[1] - Math.cos(la) * 60 * s, 12 * s, 12 * s, k + 63, t));
          lamp.setAttribute('d', flip && ((t * 3) % 1) < 0.6 ? inkCircle(bxp[0] + 28 * s, bxp[1] - 10 * s, 12 * s, k + 64, t, { fill: true }) : '');
          cable.setAttribute('d', inkPath([[bxp[0] - 60 * s, bxp[1] + 20 * s], [0.62 * W, gy - 60 * u], [0.53 * W, gy - 10 * u], [tx1 - 40 * u, ty + 60 * u]], { w: 5, seed: k + 65, t }));
          // Seligman writes on a clipboard, glances at the dog on `zap`
          const px = 0.655 * W, glance = lt >= zap && since < 1.6;
          const cb = [px - 96 * s, gy - 310 * s];
          const wr = Math.sin(t * 9) * 10 * s, wy = Math.sin(t * 4.5) * 5 * s;
          sel.update(t, px, gy, s, { face: -1, lean: glance ? 0 : 5, armL: [cb[0] - 30 * s, cb[1] + 30 * s], armR: [cb[0] + 10 * s + wr, cb[1] - 10 * s + wy], look: glance ? [6, -6] : [0, 10], brow: glance ? 0.9 : 0.1 });
          const cp = [[cb[0] - 60 * s, cb[1] - 80 * s], [cb[0] + 50 * s, cb[1] - 86 * s], [cb[0] + 56 * s, cb[1] + 70 * s], [cb[0] - 54 * s, cb[1] + 76 * s]];
          clip.setAttribute('d', inkLoop(cp, { seed: k + 70, t, smooth: false }));
          clipP.setAttribute('d', inkLoop([[cb[0] - 50 * s, cb[1] - 66 * s], [cb[0] + 42 * s, cb[1] - 72 * s], [cb[0] + 46 * s, cb[1] + 60 * s], [cb[0] - 46 * s, cb[1] + 64 * s]], { seed: k + 71, t, smooth: false }));
          const n = Math.floor(clamp01(lt / Math.max(1, dur)) * 5) + 1;
          clipR.setAttribute('d', inkPath(cp, { w: 4.5, seed: k + 72, t, closed: true, smooth: false }) + ' ' + Array.from({ length: n }, (_, i) => inkPath([[cb[0] - 36 * s, cb[1] - 40 * s + i * 22 * s], [cb[0] + 30 * s, cb[1] - 44 * s + i * 22 * s]], { w: 2.5, seed: k + 73 + i, t })).join(' '));
          const pt = [cb[0] + 10 * s + wr, cb[1] - 10 * s + wy];
          pen.setAttribute('d', inkPath([pt, [pt[0] + 26 * s, pt[1] - 50 * s]], { w: 8 * s, seed: k + 80, t }));
          // names
          const NP = [[px - 10 * u, gy - 560 * s], [mx - 10 * u, gy - 560 * s]];
          names.forEach((g, i) => { const p = spring(lt, 0.15 + i * 0.25, 0.5); g.setAttribute('transform', `translate(${L.f1(NP[i][0])} ${L.f1(NP[i][1])}) rotate(-3) scale(${p.toFixed(3)})`); });
          bench.update(t, W, H, (P.bench ?? 0.745) * H);
        },
      };
    },
  };
})();
