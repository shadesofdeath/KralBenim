// sb_camp: the Norwegian camp at Stamford Bridge on a hot morning (brand/kit/BRAND.md §3, §5): a river runs across the
// middle distance with a wooden trestle bridge going over it in perspective, warriors without mail lounge on the near
// bank (sitting, talking, stretching; shields and spears leaning in a pile), a hot gold sun with heat shimmer; big
// foreground grass, a dropped round shield and a spear cropped at the bottom. Also works as the empty field after
// the battle (no warriors, scattered shields, spears stuck in the ground) for a closing host shot.
// The scene's "set" (field / hills, ground ≈ P.ground, horizon ≤ 1/3 H) paints sky and land; this draws the rest.
// Uses sb__lib.js (SB) + mcB__lib.js (MCB.labels).
// P: {ground: 0.585 (feet line, 0..1 H), river: {y: 0.47, h: 0.065} | false, bridge: {near: [0.12, 0.3], far: [0.3, 0.37]} | false,
//     warriors: [SB.warrior K], kasif: SB.warrior K with who "kasif" | false, sun: {x: 0.8, y: 0.2, r: 70} | false, heat: true,
//     pile: {x: 0.5, n: 4} | false (shields leaning on spears), shields: [{x, y, r, side, rot, tilt, kind}] (stage 0..1),
//     dropped: [{x, y, s: 0.6, rot: 80}] (mail shirts dumped on the grass), sweat: [warrior index] (sweat drops),
//     spears: [{x, y, len, rot}], grass: [{x, y, s, n}] (0..1), labels: [MCB label entries], smoke: {x, y} | false (camp-fire smoke)}
// cues: hit (punch), plus names used in seq / labels / moves
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sb_camp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const SB = window.SB, MCB = window.MCB, atOr = SB.atOr, sd = seed * 1000 + 271;
      const GY = (P.ground ?? 0.585) * H;
      const root = el(svg, 'g');
      const sun = P.sun === false ? null : SB.sun(el(root, 'g'), sd + 1);
      const RV = P.river === false ? null : Object.assign({ y: 0.47, h: 0.065 }, P.river || {});
      const riverF = inkEl(root, INK.blue, { 'fill-opacity': 0.28 }), riverR = inkEl(root, INK.inkSoft), riverT = inkEl(root, INK.blue, { 'fill-opacity': 0.7 });
      const BR = P.bridge === false || !RV ? null : Object.assign({ near: [0.1, 0.3], far: [0.3, 0.37] }, P.bridge || {});
      const brF = inkEl(root, INK.paperLight), brR = inkEl(root), brP = inkEl(root, INK.hatBand);
      const bankE = inkEl(root, INK.inkSoft);
      const smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.45 });
      const heat = SB.heat(el(root, 'g'), sd + 3);
      const pileG = el(root, 'g');
      const pile = P.pile === false ? [] : Array.from({ length: (P.pile || {}).n ?? 4 }, (_, i) => ({ sh: SB.shield(pileG, sd + 20 + i), sp: SB.spear(pileG, sd + 30 + i) }));
      const spears = (P.spears || []).map((q, i) => ({ q, d: SB.spear(el(root, 'g'), sd + 40 + i) }));
      const men = (P.warriors || []).map((K, i) => SB.warrior(el(root, 'g'), Object.assign({ y: P.ground ?? 0.585 }, K), sd + 60 + i * 7));
      const kas = P.kasif ? SB.warrior(el(root, 'g'), Object.assign({ who: 'kasif', y: P.ground ?? 0.585, scale: 0.7 }, P.kasif), sd + 140) : null;
      const dropped = (P.dropped || []).map((q, i) => ({ q, d: SB.byrnie(el(root, 'g'), sd + 120 + i) }));   // mail shirts dumped on the grass
      const sweat = inkEl(root, INK.blue, { 'fill-opacity': 0.9 }), sweatR = inkEl(root, INK.ink);
      const shields = (P.shields || []).map((q, i) => ({ q, d: SB.shield(el(root, 'g'), sd + 160 + i) }));
      const grass = SB.grass(el(root, 'g'), sd + 180, (P.grass || []).map(g => ({ x: g.x * W, y: g.y * H, s: g.s ?? 1, n: g.n })));
      const labels = MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 300);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          if (sun) { const S = P.sun || {}; sun.update(t, (S.x ?? 0.8) * W, (S.y ?? 0.2) * H, (S.r ?? 70) * (1 + 0.1 * hit)); }
          if (RV) {
            const y0 = RV.y * H, y1 = (RV.y + RV.h) * H, top = [], bot = [];
            for (let x = -40; x <= W + 40; x += 60) { top.push([x, y0 + Math.sin(x * 0.01 + 1) * 6]); bot.push([x, y1 + Math.sin(x * 0.013) * 8]); }
            riverF.setAttribute('d', inkLoop(top.concat(bot.slice().reverse()), { seed: sd + 5, t, amp: 1, smooth: false }));
            riverR.setAttribute('d', inkPath(top, { w: 4, seed: sd + 6, t, amp: 1 }) + ' ' + inkPath(bot, { w: 5, seed: sd + 7, t, amp: 1 }));
            let rt = '';
            for (let k = 0; k < 10; k++) { const yy = lerp(y0, y1, 0.25 + (k % 3) * 0.25), xx = ((k * 211 + t * 40) % (W + 160)) - 80; rt += inkPath([[xx, yy], [xx + 30, yy - 5], [xx + 60, yy]], { w: 3.5, seed: sd + 8 + k, t, amp: 0.6 }) + ' '; }
            riverT.setAttribute('d', rt);
          }
          if (BR) {
            const yN = (RV.y + RV.h) * H + 22, yF = RV.y * H - 14;
            const nL = BR.near[0] * W, nR = BR.near[1] * W, fL = BR.far[0] * W, fR = BR.far[1] * W;
            const deck = [[nL, yN], [fL, yF], [fR, yF], [nR, yN]];
            brF.setAttribute('d', inkLoop(deck, { seed: sd + 9, t, amp: 0.8, smooth: false }));
            let d = inkPath(deck, { w: 5, seed: sd + 10, t, closed: true, amp: 0.8, smooth: false }) + ' ';
            for (let k = 1; k < 7; k++) { const u = k / 7; d += inkPath([[lerp(nL, fL, u), lerp(yN, yF, u)], [lerp(nR, fR, u), lerp(yN, yF, u)]], { w: 2.5, seed: sd + 11 + k, t, amp: 0.5 }) + ' '; }
            // rails with posts
            for (const [a, b, k] of [[nL, fL, 0], [nR, fR, 1]]) {
              const rh = 70; d += inkPath([[a, yN - rh], [b, yF - rh * 0.45]], { w: 5, seed: sd + 20 + k, t, amp: 0.8 }) + ' ';
              for (let j = 0; j <= 5; j++) { const u = j / 5, x = lerp(a, b, u), y = lerp(yN, yF, u), h = lerp(rh, rh * 0.45, u); d += inkPath([[x, y], [x, y - h]], { w: 4, seed: sd + 24 + k * 6 + j, t, amp: 0.6 }) + ' '; }
            }
            brR.setAttribute('d', d);
            let pd = '';
            for (let j = 0; j <= 4; j++) { const u = j / 4, x = lerp((nL + nR) / 2, (fL + fR) / 2, u), y = lerp(yN, yF, u), w = lerp(nR - nL, fR - fL, u) * 0.42; pd += inkPath([[x - w, y], [x - w, y + lerp(46, 16, u)]], { w: 7, seed: sd + 40 + j, t, amp: 0.6 }) + ' ' + inkPath([[x + w, y], [x + w, y + lerp(46, 16, u)]], { w: 7, seed: sd + 50 + j, t, amp: 0.6 }) + ' '; }
            brP.setAttribute('d', pd);
          }
          if (P.smoke) {
            const x = P.smoke.x * W, y = P.smoke.y * H; let d = '';
            for (let k = 0; k < 5; k++) { const u = ((t * 0.25 + k * 0.2) % 1), r = 18 + u * 46; d += inkLoop(SB.ell(x + Math.sin(u * 5 + k) * 26 + u * 40, y - u * 300, r, r * 0.8, 10), { seed: sd + 60 + k, t, amp: 1.2 }) + ' '; }
            smoke.setAttribute('d', d);
          }
          if (P.heat !== false) heat.update(t, [0.15, 0.32, 0.5, 0.68, 0.86].map((x, i) => ({ x: x * W, y: GY - 300 - (i % 2) * 70 })));
          bankE.setAttribute('d', inkPath([[-20, GY + 4], [W * 0.5, GY - 4], [W + 20, GY + 2]], { w: 5, seed: sd + 70, t, amp: 1 }));
          if (pile.length) {
            const px = ((P.pile || {}).x ?? 0.5) * W;
            pile.forEach((q, i) => {
              const x = px + (i - (pile.length - 1) / 2) * 70;
              q.sp.update(t, { x: x + 30, y: GY + 4, len: 360, rot: (i - 1.5) * 9 });
              q.sh.update(t, { x, y: GY - 78, r: 80, side: i % 2 ? 'nor' : 'nrm', rot: (i - 1.5) * 8 });
            });
          }
          spears.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, len: q.len ?? 420, rot: q.rot ?? 0 }));
          dropped.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, s: q.s ?? 0.6, rot: q.rot ?? 80, sway: 0.4 }));
          const mp = men.map(m => m.update(lt, t, cues, W, H));
          let sw = '', swr = '';
          (P.sweat || []).forEach((wi, k) => {
            const m = mp[wi]; if (!m) return; const R = 70 * ((P.warriors[wi] || {}).scale ?? 0.55);
            for (let j = 0; j < 3; j++) {
              const u = ((t * 0.6 + j / 3 + k * 0.17) % 1), side = j % 2 ? 1 : -1;
              const x = m.head[0] + side * R * (1.15 + 0.1 * j), y = m.head[1] - R * 0.2 + u * R * 1.6, r = R * 0.16;
              const dp = [[x, y - r * 2.2], [x + r, y], [x, y + r], [x - r, y]];
              sw += inkLoop(dp, { seed: sd + 400 + j + k * 5, t, amp: 0.4 }) + ' '; swr += inkPath(dp, { w: 3, seed: sd + 420 + j + k * 5, t, closed: true, amp: 0.4 }) + ' ';
            }
          });
          sweat.setAttribute('d', sw); sweatR.setAttribute('d', swr);
          if (kas) kas.update(lt, t, cues, W, H);
          shields.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, r: q.r ?? 110, side: q.side, rot: q.rot ?? 0, tilt: q.tilt ?? 0.55, kind: q.kind }));
          grass.update(t);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
