// moon_ship: an 1830s sailing ship crossing the open ocean, big in frame (Stickstory ag-14: mail from the Cape to New
// York took weeks). The hull rolls and bobs, the sails belly and flap, a pennant streams, foreground waves roll past and a
// big counter ("WEEK 1" ... "WEEK 8") ticks up. Set: {"name": "ocean", "horizon": ...}. Palette tokens only.
// P: {x: 0.5 (centre at lt 0), drift: -0.12 (x travel over the scene, of W; negative = sails left), y: 0.74 (waterline),
//     s: 1, face: -1 (bow to the left), counter: {label: "WEEK", from: 1, to: 8, at, dur, x: 0.8, y: 0.26} | false,
//     letter: {text: "MAIL", at} (a sealed letter swings from the stern rail), kasif: K, labels: [...]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const TAU = Math.PI * 2;

  SH.moon_ship = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = MOON.line, S = P.s ?? 1, face = P.face ?? -1;
      const root = el(svg, 'g');
      const wake = inkEl(root, INK.paperLight), hullF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.45)), hullR = inkEl(root), planks = inkEl(root, INK.inkSoft);
      const masts = inkEl(root), rig = inkEl(root, INK.inkSoft), sailF = inkEl(root, INK.paperLight), sailR = inkEl(root), flag = inkEl(root, INK.red);
      const letG = el(root, 'g'), letF = inkEl(letG, INK.paperLight), letR = inkEl(letG), seal = inkEl(letG, INK.red);
      const waves = inkEl(root, mix(INK.blue, INK.paperLight, 0.35)), wavesR = inkEl(root, INK.inkSoft);
      const cG = el(root, 'g'), cTx = el(cG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.ink });
      const cBox = inkEl(cG, INK.red);
      const cast = (P.cast || []).concat(P.kasif ? [P.kasif] : []).map((c, i) => MOON.K(el(root, 'g'), c, seed * 3 + i * 7 + 1));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const cx = ((P.x ?? 0.5) + (P.drift ?? -0.12) * clamp01(lt / Math.max(dur, 1))) * W, wy = (P.y ?? 0.74) * H + Math.sin(lt * 1.6) * 8;
          const roll = Math.sin(lt * 1.1) * 3 * Math.PI / 180, c = Math.cos(roll), sn = Math.sin(roll);
          const T = p => { const x = p[0] * S * face, y = p[1] * S; return [cx + x * c - y * sn, wy + x * sn + y * c]; };
          // hull
          const hull = [[-470, -70], [-430, -40], [-380, 40], [380, 40], [430, -20], [520, -110], [470, -95], [-470, -95]];
          hullF.setAttribute('d', inkLoop(hull.map(T), { seed: seed, t, amp: 1, smooth: false }));
          hullR.setAttribute('d', inkPath(hull.map(T), { w: 7, seed: seed + 1, t, closed: true, amp: 1, smooth: false }) + ' ' + L([[-470, -95], [470, -95]].map(T), seed + 2, t, 6) + ' ' + L([[470, -95], [700, -150]].map(T), seed + 3, t, 6));
          let pk = ''; for (let i = 1; i < 4; i++) pk += L([[-450 + i * 10, -95 + i * 32], [440 - i * 30, -95 + i * 32]].map(T), seed + 4 + i, t, 2.5) + ' ';
          for (let i = 0; i < 8; i++) pk += inkCircle(...T([-320 + i * 90, -66]), 9 * S, seed + 10 + i, t, { w: 3 }) + ' ';
          planks.setAttribute('d', pk);
          // two masts, square sails that belly in the wind
          const bel = 1 + 0.08 * Math.sin(t * 2.3);
          let md = '', rg = '', sf = '', sr = '';
          for (const [mx, top] of [[-170, -760], [200, -820]]) {
            md += L([[mx, -95], [mx, top]].map(T), seed + 20 + mx, t, 9, 1, 0.05) + ' ';
            for (const [y0, y1, w] of [[top + 60, top + 230, 150], [top + 260, top + 470, 200], [top + 500, -170, 230]]) {
              const bl = [[mx - w, y0], [mx - w * 1.04 + 20 * bel, (y0 + y1) / 2], [mx - w * 0.92, y1], [mx, y1 + 30 * bel], [mx + w * 0.92, y1], [mx + w * 1.04 - 20 * bel, (y0 + y1) / 2], [mx + w, y0]];
              sf += inkLoop(bl.map(T), { seed: seed + 30 + mx + y0, t, amp: 1 }) + ' ';
              sr += inkPath(bl.map(T), { w: 4.5, seed: seed + 31 + mx + y0, t, closed: true, amp: 1 }) + ' ' + L([[mx - w - 20, y0], [mx + w + 20, y0]].map(T), seed + 32 + mx + y0, t, 6) + ' ';
            }
            rg += L([[mx, top], [-470, -95]].map(T), seed + 40 + mx, t, 2.5) + ' ' + L([[mx, top], [470, -95]].map(T), seed + 41 + mx, t, 2.5) + ' ';
          }
          rg += L([[200, -820], [700, -150]].map(T), seed + 45, t, 2.5);
          masts.setAttribute('d', md); rig.setAttribute('d', rg); sailF.setAttribute('d', sf); sailR.setAttribute('d', sr);
          const fw = Math.sin(t * 6) * 14;
          flag.setAttribute('d', inkLoop([[200, -820], [200 - 170, -800 + fw], [200 - 150, -790 + fw * 0.5], [200, -780]].map(T), { seed: seed + 50, t, amp: 1 }));
          // a sealed letter hanging from the stern rail
          if (P.letter) {
            const a = MOON.at(cues, P.letter.at, 0.4), p = spring(lt, a, 0.6);
            letG.style.visibility = lt >= a ? 'visible' : 'hidden';
            const [ax, ay] = T([-420, -110]), sw = Math.sin(lt * 1.8) * 8, lw = 120 * S * p, lh = 80 * S * p;
            letG.setAttribute('transform', `rotate(${sw.toFixed(2)} ${ax} ${ay})`);
            const q = [[ax - lw / 2, ay + 60], [ax + lw / 2, ay + 60], [ax + lw / 2, ay + 60 + lh], [ax - lw / 2, ay + 60 + lh]];
            letF.setAttribute('d', inkLoop(q, { seed: seed + 60, t, amp: 0.8, smooth: false }));
            letR.setAttribute('d', inkPath(q, { w: 4, seed: seed + 61, t, closed: true, amp: 0.8, smooth: false }) + ' ' + L([[ax - lw / 2, ay + 60], [ax, ay + 60 + lh * 0.55], [ax + lw / 2, ay + 60]], seed + 62, t, 3.5) + ' ' + L([[ax, ay], [ax, ay + 60]], seed + 63, t, 3));
            seal.setAttribute('d', inkDot(ax, ay + 60 + lh * 0.55, 13 * S * p, 13 * S * p, seed + 64, t));
          }
          // wake + foreground waves rolling past
          let wk = ''; for (let i = 0; i < 5; i++) { const q = ((lt * 0.5 + i / 5) % 1); wk += L([T([480 + q * 380, 40 + i * 6]), T([560 + q * 420, 46 + i * 6])], seed + 70 + i, t, 4) + ' '; }
          wake.setAttribute('d', '');
          let wv = '', wr = '';
          for (let row = 0; row < 3; row++) {
            const y0 = wy + 40 + row * 70, ph = lt * (0.6 + row * 0.25) * (face < 0 ? 1 : -1), pts = [];
            for (let i = 0; i <= 24; i++) { const x = -40 + i * (W + 80) / 24; pts.push([x, y0 + Math.sin(i * 1.3 + ph * 3 + row) * (10 + row * 5)]); }
            wv += inkLoop(pts.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: seed + 80 + row, t, amp: 1 }) + ' ';
            wr += L(pts, seed + 90 + row, t, 4 + row) + ' ';
          }
          waves.setAttribute('d', wv); wavesR.setAttribute('d', wr + ' ' + wk);
          // counter
          if (P.counter) {
            const C = P.counter, a = MOON.at(cues, C.at, 0.3), d = C.dur ?? Math.max(1, dur - a - 0.6), q = clamp01((lt - a) / d);
            const v = Math.round(lerp(C.from ?? 1, C.to ?? 8, q)), kx = (C.x ?? 0.8) * W, ky = (C.y ?? 0.26) * H;
            cG.style.visibility = lt >= a ? 'visible' : 'hidden';
            cTx.textContent = `${C.label ?? 'WEEK'} ${v}`;
            cTx.setAttribute('x', kx); cTx.setAttribute('y', ky + 42);
            const hit = punch(lt, a + (Math.floor(q * ((C.to ?? 8) - (C.from ?? 1)) + 1e-6)) / Math.max(1, (C.to ?? 8) - (C.from ?? 1)) * d, 0.3);
            cG.setAttribute('transform', `translate(${kx} ${ky}) scale(${(1 + 0.08 * hit).toFixed(3)}) translate(${-kx} ${-ky})`);
            let w = 400; try { w = cTx.getComputedTextLength() || 400; } catch (e) { /* */ }
            cBox.setAttribute('d', L([[kx - w / 2, ky + 66], [kx + w / 2, ky + 62]], seed + 99, t, 8));
          }
          cast.forEach(k => k.update(lt, t, cues, W, H));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
