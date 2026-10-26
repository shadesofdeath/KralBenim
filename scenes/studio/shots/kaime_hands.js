// kaime_hands: a shop counter in close-up where paper money is refused (Istanbul, 1878-79: shopkeepers stopped taking
// the kaime), parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)).
// Behind the counter: shelves with jars, cloth rolls and sacks; on the counter a few gold/silver coins by the shopkeeper.
// A customer's hand (blue sleeve, from the left) slides a banknote across the counter on `offer`; on `refuse` the
// shopkeeper's open palm rises from the right ("stop"), shakes no, and the note is pushed back; a hand-lettered sign
// swings down from above (optional). Leaves the room to the "set" (interior); the counter's front edge is gy.
// P: {gy: 0.6, sign: {text: "Kaime geçmez!", at: cue}, coins: true, label: {text, x, y, at, size, color}, kasif: K | false}
// cues: offer, refuse, hit (punch), sign.at, label.at. Needs kaime__lib.js (KMA).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.kaime_hands = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 431, M = window.KMA, f1 = M.f1;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, ctop = gy - 0.13 * H;
      // shelves + goods
      const shG = el(root, 'g'), shelves = [0.3, 0.42].map(() => ({ f: inkEl(shG, INK.stain), r: inkEl(shG) }));
      const r = rng(sd + 2), goods = [];
      [0.3, 0.42].forEach((yy, row) => {
        for (let x = 40; x < W - 60;) {
          const kind = ['jar', 'roll', 'sack', 'jar', 'roll'][Math.floor(r() * 5)], w = kind === 'jar' ? 90 : kind === 'roll' ? 70 : 120;
          goods.push({ kind, x: x + w / 2, y: yy * H, w, h: kind === 'jar' ? 120 + r() * 30 : kind === 'roll' ? 150 : 110, col: [INK.blue, INK.red, INK.green, INK.gold][Math.floor(r() * 4)],
            f: inkEl(shG, kind === 'jar' ? INK.paperLight : kind === 'sack' ? INK.paper : null), r2: inkEl(shG), d: inkEl(shG) });
          x += w + 14 + r() * 26;
        }
      });
      goods.forEach(g => { if (g.kind === 'roll') g.f.setAttribute('fill', g.col); });
      // counter
      const ct = { f: inkEl(root, INK.stain), r: inkEl(root), gr: inkEl(root, INK.inkSoft), fr: inkEl(root, INK.inkSoft) };
      const cFront = M.fore(root, 'panel', sd + 27);
      const coins = P.coins === false ? [] : [[0.8, 0, 'gold'], [0.88, 8, 'paperDark'], [0.84, -24, 'gold']].map(([x, dy, c], i) => ({ x: x * W, y: gy - 0.05 * H + dy, c, f: inkEl(root, INK[c]), r: inkEl(root), i }));
      const noteG = el(root, 'g'), note = M.note(noteG, sd + 5);
      const cust = M.hand(el(root, 'g'), sd + 6, { sleeve: 'blue', from: [-0.25 * W, gy + 0.16 * H] });
      const shop = M.hand(el(root, 'g'), sd + 7, { sleeve: 'dark', from: [1.25 * W, gy + 0.2 * H] });
      const sign = P.sign ? { g: el(root, 'g') } : null;
      if (sign) {
        sign.str = inkEl(sign.g); sign.f = inkEl(sign.g, INK.paperLight); sign.r = inkEl(sign.g);
        sign.tx = el(sign.g, 'text', { 'font-family': INK_FONT, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red }); sign.tx.textContent = P.sign.text || 'Kaime geçmez!';
      }
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.12, y: P.gy ?? 0.6, scale: 0.7, pose: 'point', face: 1 }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const offer = M.atOr(cues, 'offer', 0.3), refuse = M.atOr(cues, 'refuse', dur * 0.5), hit = punch(lt, M.atOr(cues, 'hit', refuse), 0.6);
          // shelves
          shelves.forEach((s, i) => { const y = [0.3, 0.42][i] * H, p = [[-20, y], [W + 20, y], [W + 20, y + 26], [-20, y + 26]];
            s.f.setAttribute('d', inkLoop(p, { seed: sd + 10 + i, t, smooth: false })); s.r.setAttribute('d', inkPath(p, { w: 4.5, seed: sd + 12 + i, t, closed: true, smooth: false })); });
          goods.forEach((g, i) => {
            const k = sd + 100 + i * 4, x0 = g.x - g.w / 2, x1 = g.x + g.w / 2, y1 = g.y, y0 = g.y - g.h;
            let p;
            if (g.kind === 'jar') p = [[x0 + 10, y1], [x1 - 10, y1], [x1, y1 - g.h * 0.5], [x1 - 14, y0 + 20], [x1 - 18, y0], [x0 + 18, y0], [x0 + 14, y0 + 20], [x0, y1 - g.h * 0.5]];
            else if (g.kind === 'roll') p = [[x0, y1], [x1, y1], [x1, y0], [x0, y0]];
            else p = [[x0, y1], [x1, y1], [x1 - 10, y0 + 30], [g.x + 14, y0], [g.x - 14, y0], [x0 + 10, y0 + 30]];
            g.f.setAttribute('d', inkLoop(p, { seed: k, t, smooth: g.kind !== 'roll', amp: 1 }));
            g.r2.setAttribute('d', inkPath(p, { w: 4, seed: k + 1, t, closed: true, smooth: g.kind !== 'roll', amp: 1 }));
            g.d.setAttribute('d', g.kind === 'jar' ? inkPath([[x0 + 16, y0 + 20], [x1 - 16, y0 + 20]], { w: 3, seed: k + 2, t }) + ' ' + inkLoop([[x0 + 22, y1 - g.h * 0.55], [x1 - 22, y1 - g.h * 0.55], [x1 - 22, y1 - g.h * 0.3], [x0 + 22, y1 - g.h * 0.3]], { seed: k + 3, t, smooth: false })
              : g.kind === 'roll' ? [0.3, 0.6].map((u, j) => inkPath([[x0, y0 + g.h * u], [x1, y0 + g.h * u + 6]], { w: 2.5, seed: k + 2 + j, t })).join(' ')
              : inkPath([[g.x - 18, y0 + 8], [g.x + 18, y0 + 4]], { w: 5, seed: k + 2, t }));
            g.d.setAttribute('fill', g.kind === 'jar' ? INK.inkSoft : INK.ink);
          });
          // counter
          const cp = [[-30, ctop], [W + 30, ctop], [W + 30, gy], [-30, gy]];
          ct.f.setAttribute('d', inkLoop(cp, { seed: sd + 20, t, smooth: false }));
          ct.r.setAttribute('d', inkPath(cp, { w: 5, seed: sd + 21, t, closed: true, smooth: false }));
          ct.gr.setAttribute('d', [0.3, 0.55, 0.8].map((u, j) => inkPath([[-20, lerp(ctop, gy, u)], [W * 0.5, lerp(ctop, gy, u) + 4], [W + 20, lerp(ctop, gy, u) - 2]], { w: 2, seed: sd + 22 + j, t })).join(' '));
          ct.fr.setAttribute('d', ''); cFront.update(t, W, H, gy);
          coins.forEach(c => { c.f.setAttribute('d', inkLoop(inkEllipsePts(c.x, c.y, 54, 20, sd + 30 + c.i, 12), { seed: sd + 30 + c.i, t }));
            c.r.setAttribute('d', inkPath(inkEllipsePts(c.x, c.y, 54, 20, sd + 30 + c.i, 12), { w: 4, seed: sd + 33 + c.i, t, closed: true })); });
          // customer hand + note: slides in, then is pushed back
          const inP = prog(lt, offer, 0.9), backP = prog(lt, refuse + 0.45, 0.8);
          const wx = lerp(lerp(-0.12 * W, 0.2 * W, inP), 0.02 * W, backP), wy = ctop + 0.06 * H + Math.sin(t * 2) * 3;
          const nx = wx + 260, ny = wy - 6;
          noteG.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(-4 + 6 * backP)}) scale(0.95 0.42)`);
          note.update(t, { seal: 1, value: '100' });
          cust.update(t, [wx, wy], -4, 1.35, 'flat');
          // shopkeeper's palm: rises on refuse, shakes no
          const up = spring(lt, refuse - 0.15, 0.6), shake = lt > refuse + 0.2 ? Math.sin((lt - refuse) * 14) * 26 * Math.exp(-(lt - refuse - 0.2) * 1.5) : 0;
          const sx = lerp(1.15 * W, 0.7 * W, up) + shake + backP * -40, sy = lerp(gy + 0.1 * H, ctop + 0.04 * H, up);
          shop.update(t, [sx, sy], 8 * Math.sin((lt - refuse) * 14) * (shake ? 1 : 0), 1.35 * (1 + 0.05 * hit), 'stop');
          if (sign) {
            const sa = M.atOr(cues, P.sign.at, refuse + 0.3), sp = spring(lt, sa, 0.9), cx = 0.6 * W, top = 0.19 * H;
            if (lt < sa) sign.g.setAttribute('transform', 'scale(0)');
            else {
              const sw = Math.sin((lt - sa) * 4) * 6 * Math.exp(-(lt - sa) * 1.2);
              sign.g.setAttribute('transform', `translate(${f1(cx)} ${f1(lerp(-0.15 * H, top, sp))}) rotate(${f1(sw)})`);
              const b = [[-270, 60], [270, 60], [270, 190], [-270, 190]];
              sign.f.setAttribute('d', inkLoop(b, { seed: sd + 40, t, smooth: false }));
              sign.r.setAttribute('d', inkPath(b, { w: 6, seed: sd + 41, t, closed: true, smooth: false }));
              sign.str.setAttribute('d', inkPath([[-210, 60], [0, -30], [210, 60]], { w: 4, seed: sd + 42, t }));
              sign.tx.setAttribute('x', 0); sign.tx.setAttribute('y', 156);
            }
          }
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
