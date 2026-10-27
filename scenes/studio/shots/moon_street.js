// moon_street: an 1830s New York street in front of the set's skyline (Stickstory ag-14, Great Moon Hoax): a row of
// brick row-houses with a newspaper office sign, a gas lamp, cobbles, newsboys holding up papers and shouting
// (speech bubbles), passers-by walking through, loose sheets blowing across. Set: "city". Palette tokens only.
// P: {ground: 0.86, houses: true | {from: 0, to: 1}, office: {x: 0.3, text: "THE SUN"} | false, lamp: 0.8 | false,
//     newsboys: [{x, text: "THE SUN", face, scale: 0.62, at, accessory: "slouch", shout: {text, at, dx, dy}}],
//     crowd: [{x, to, at, dur, scale, accessory, beard, text (holds a paper), face}],
//     sheets: 3 (blowing papers), kasif: K, cast: [K], labels: [...],
//     stand: {x: 0.5, w: 0.42, papers: [{head: "SHIPPING", at, size}], price: "6 CENTS", price_at, cross_at} (a newsstand)}
// cues: whatever "at"s reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const TAU = Math.PI * 2;

  SH.moon_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = MOON.line, gy = (P.ground ?? 0.86) * H;
      const root = el(svg, 'g');
      const houseF = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.35)), houseR = inkEl(root), brick = inkEl(root, INK.inkSoft), win = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4));
      const officeG = el(root, 'g'), officeF = inkEl(officeG, INK.paperLight), officeR = inkEl(officeG);
      const officeTx = el(officeG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 62, 'text-anchor': 'middle', fill: INK.ink, 'letter-spacing': 3 });
      officeTx.textContent = (P.office && P.office.text) || 'THE SUN';
      const road = inkEl(root), cobble = inkEl(root, INK.inkSoft), lamp = inkEl(root), lampG = inkEl(root, INK.gold);
      // newsstand: awning, counter with stacks, two papers on the rack (headline on cue), a hanging price sign
      const ST = P.stand ? Object.assign({ x: 0.5, w: 0.42 }, P.stand) : null;
      const stG = ST ? el(root, 'g') : null;
      const stF = ST && inkEl(stG, mix(INK.paperDark, INK.inkSoft, 0.3)), stR = ST && inkEl(stG), awF = ST && inkEl(stG, INK.red), awL = ST && inkEl(stG, INK.paperLight), awR = ST && inkEl(stG);
      const stP = ST && inkEl(stG, INK.paperLight), stPR = ST && inkEl(stG);
      const rack = ST ? (ST.papers || []).map(pp => { const tx = el(stG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': pp.size || 58, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = pp.head; return { pp, tx }; }) : [];
      const priceG = ST && ST.price ? el(stG, 'g') : null, prF = priceG && inkEl(priceG, INK.paperLight), prR = priceG && inkEl(priceG), prX = priceG && inkEl(priceG, INK.red);
      const prTx = priceG && el(priceG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 66, 'text-anchor': 'middle', fill: INK.ink });
      if (prTx) prTx.textContent = ST.price;
      const castG = el(root, 'g');
      const crowd = (P.crowd || []).map((c, i) => MOON.K(el(castG, 'g'), Object.assign({ hat: false, scale: 0.6, pose: c.text ? 'hold' : 'idle', y: P.ground ?? 0.86 },
        c, c.to != null ? { walk: { to: c.to, at: c.at ?? 0, dur: c.dur ?? 4 } } : {}), seed * 3 + i * 7 + 1));
      const boys = (P.newsboys || []).map((b, i) => MOON.K(el(castG, 'g'), Object.assign({ hat: false, scale: 0.62, accessory: 'slouch', pose: 'hold', text: 'THE SUN', y: P.ground ?? 0.86 }, b,
        { seq: (b.seq || []).concat(b.shout ? [{ at: b.shout.at, pose: 'hold', text: b.text || 'THE SUN', emotion: 'happy' }] : []) }), seed * 5 + i * 11 + 3));
      const bubbles = (P.newsboys || []).filter(b => b.shout).map(b => ({ b, g: el(root, 'g') }));
      bubbles.forEach(o => { o.f = inkEl(o.g, INK.paperLight); o.r = inkEl(o.g); o.tx = el(o.g, 'text', { 'font-family': INK_FONT, 'font-size': o.b.shout.size || 54, 'text-anchor': 'middle', fill: INK.red }); o.tx.textContent = o.b.shout.text; });
      const host = [P.kasif].concat(P.cast || []).filter(Boolean).map((c, i) => MOON.K(el(root, 'g'), c, seed * 7 + i * 13 + 5));
      const sheets = Array.from({ length: P.sheets ?? 3 }, () => ({ f: inkEl(root, INK.paperLight), r: inkEl(root) }));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      const HS = P.houses === false ? null : Object.assign({ from: 0, to: 1 }, typeof P.houses === 'object' ? P.houses : {});
      let otw = 0;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // row-houses
          if (HS) {
            let hf = '', hr = '', bk = '', wn = '';
            const x0 = HS.from * W, x1 = HS.to * W, n = Math.max(2, Math.round((x1 - x0) / 330)), hw = (x1 - x0) / n;
            for (let i = 0; i < n; i++) {
              const hx = x0 + i * hw, top = gy - 560 - (i % 2) * 50;
              const q = [[hx, gy], [hx, top], [hx + hw, top], [hx + hw, gy]];
              hf += inkLoop(q, { seed: seed + i, t, amp: 0.8, smooth: false }) + ' ';
              hr += inkPath(q, { w: 4.5, seed: seed + 20 + i, t, amp: 0.8, closed: true, smooth: false }) + ' ' + L([[hx - 6, top], [hx + hw + 6, top]], seed + 40 + i, t, 8, 1, 0.05) + ' ';
              hr += L([[hx + hw * 0.7, top], [hx + hw * 0.7, top - 50]], seed + 60 + i, t, 12, 0.6, 0.05) + ' ';
              for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
                const wx = hx + hw * (0.22 + c * 0.42), wy = top + 50 + r * 140;
                if (wy + 90 > gy - 150) continue;
                const wq = [[wx, wy], [wx + hw * 0.2, wy], [wx + hw * 0.2, wy + 90], [wx, wy + 90]];
                wn += inkLoop(wq, { seed: seed + 100 + i * 9 + r * 3 + c, t, amp: 0.6, smooth: false }) + ' ';
                hr += L([[wx + hw * 0.1, wy], [wx + hw * 0.1, wy + 90]], seed + 200 + i * 9 + r * 3 + c, t, 2.5) + ' ';
              }
              const dx = hx + hw * 0.5;
              hr += inkPath([[dx - 40, gy], [dx - 40, gy - 150], [dx, gy - 175], [dx + 40, gy - 150], [dx + 40, gy]], { w: 4.5, seed: seed + 300 + i, t, amp: 0.8 }) + ' ';
              const r0 = rng(seed * 7 + i);
              for (let b = 0; b < 10; b++) { const bx = hx + 10 + r0() * (hw - 60), by = top + 20 + r0() * (gy - top - 60); bk += L([[bx, by], [bx + 34, by]], seed + 400 + i * 10 + b, t, 2.5) + ' '; }
            }
            houseF.setAttribute('d', hf); houseR.setAttribute('d', hr); brick.setAttribute('d', bk); win.setAttribute('d', wn);
          }
          // the paper's office sign
          if (P.office) {
            const ox = P.office.x * W, oy = gy - 330;
            if (!otw) { try { otw = officeTx.getComputedTextLength(); } catch (e) { otw = 280; } otw = otw || 280; }
            const sw = otw / 2 + 36, sway = Math.sin(t * 1.1) * 1.5;
            const q = [[ox - sw, oy - 52], [ox + sw, oy - 52], [ox + sw, oy + 30], [ox - sw, oy + 30]];
            officeF.setAttribute('d', inkLoop(q, { seed: seed + 500, t, amp: 0.8, smooth: false }));
            officeR.setAttribute('d', inkPath(q, { w: 6, seed: seed + 501, t, amp: 0.8, closed: true, smooth: false }));
            officeTx.setAttribute('x', ox); officeTx.setAttribute('y', oy + 4);
            officeG.setAttribute('transform', `rotate(${sway.toFixed(2)} ${ox} ${oy - 52})`);
          } else officeG.style.display = 'none';
          // road
          road.setAttribute('d', L([[-40, gy], [W + 40, gy + 3]], seed + 600, t, 7, 1.2, 0.05));
          let cb = ''; const rc = rng(seed * 11);
          for (let i = 0; i < 40; i++) { const x = rc() * W, y = gy + 16 + rc() * (H - gy - 16); cb += L([[x, y], [x + 22 + rc() * 18, y + 2]], seed + 610 + i, t, 3) + ' '; }
          cobble.setAttribute('d', cb);
          // gas lamp
          if (P.lamp !== false) {
            const lx = (P.lamp ?? 0.8) * W;
            lamp.setAttribute('d', L([[lx, gy], [lx, gy - 400]], seed + 700, t, 9, 1, 0.05) + ' ' + L([[lx - 30, gy], [lx + 30, gy]], seed + 701, t, 8) +
              ' ' + inkPath([[lx - 34, gy - 400], [lx - 26, gy - 470], [lx + 26, gy - 470], [lx + 34, gy - 400]], { w: 5, seed: seed + 702, t, closed: true, smooth: false }) +
              ' ' + L([[lx - 40, gy - 474], [lx, gy - 500], [lx + 40, gy - 474]], seed + 703, t, 6));
            const fl = 1 + 0.15 * Math.sin(t * 9);
            lampG.setAttribute('d', inkLoop([[lx - 10, gy - 410], [lx, gy - 410 - 40 * fl], [lx + 10, gy - 410]], { seed: seed + 704, t, amp: 1.5 }));
          }
          if (ST) {
            const sx = ST.x * W, hw = ST.w * W / 2, top = gy - 560, ctr = gy - 250;
            const body = [[sx - hw, gy], [sx - hw, ctr], [sx + hw, ctr], [sx + hw, gy]];
            stF.setAttribute('d', inkLoop(body, { seed: seed + 1000, t, amp: 0.8, smooth: false }));
            let sr = inkPath(body, { w: 6, seed: seed + 1001, t, closed: true, amp: 0.8, smooth: false }) + ' ';
            for (let i = 1; i < 6; i++) sr += L([[sx - hw + i * hw / 3, ctr + 8], [sx - hw + i * hw / 3, gy - 6]], seed + 1002 + i, t, 2.5) + ' ';
            sr += L([[sx - hw + 20, top + 60], [sx - hw + 20, ctr]], seed + 1010, t, 8) + ' ' + L([[sx + hw - 20, top + 60], [sx + hw - 20, ctr]], seed + 1011, t, 8) + ' ' + L([[sx - hw + 20, ctr - 160], [sx + hw - 20, ctr - 160]], seed + 1012, t, 5);
            stR.setAttribute('d', sr);
            // striped awning, scalloped edge flapping a little
            let af = '', al = '', ar2 = ''; const n = 8, aw = (2 * hw + 80) / n;
            for (let i = 0; i < n; i++) {
              const x0 = sx - hw - 40 + i * aw, fl = Math.sin(t * 2.4 + i) * 4;
              const q = [[x0, top], [x0 + aw, top], [x0 + aw, top + 70 + fl], [x0 + aw / 2, top + 92 + fl], [x0, top + 70 + fl]];
              const lp = inkLoop(q, { seed: seed + 1020 + i, t, amp: 0.6, smooth: false }) + ' ';
              if (i % 2) af += lp; else al += lp;
              ar2 += inkPath(q, { w: 3.5, seed: seed + 1040 + i, t, closed: true, amp: 0.6, smooth: false }) + ' ';
            }
            awF.setAttribute('d', af); awL.setAttribute('d', al); awR.setAttribute('d', ar2 + L([[sx - hw - 50, top], [sx + hw + 50, top]], seed + 1060, t, 7));
            // stacks on the counter + the two papers standing on the rack
            let sp = '', spr = '';
            for (let k = 0; k < 3; k++) { const bx = sx - hw * 0.66 + k * hw * 0.66, q = [[bx - 90, ctr], [bx - 92, ctr - 40 - k * 6], [bx + 90, ctr - 42 - k * 6], [bx + 92, ctr]]; sp += inkLoop(q, { seed: seed + 1070 + k, t, amp: 0.6, smooth: false }) + ' '; spr += inkPath(q, { w: 3.5, seed: seed + 1075 + k, t, closed: true, amp: 0.6, smooth: false }) + ' '; for (let j = 1; j < 4; j++) spr += L([[bx - 88, ctr - j * 10], [bx + 88, ctr - j * 10]], seed + 1080 + k * 5 + j, t, 1.5) + ' '; }
            rack.forEach((o, k) => {
              const nR = rack.length, px = sx - hw + (k + 0.5) * (2 * hw / nR), pw2 = (2 * hw / nR) - 40, y1 = ctr - 175, y0 = top + 110;
              const q = [[px - pw2 / 2, y0], [px + pw2 / 2, y0 + 4], [px + pw2 / 2 - 4, y1], [px - pw2 / 2 + 2, y1]];
              sp += inkLoop(q, { seed: seed + 1100 + k, t, amp: 0.6, smooth: false }) + ' ';
              spr += inkPath(q, { w: 4, seed: seed + 1105 + k, t, closed: true, amp: 0.6, smooth: false }) + ' ';
              for (let j = 0; j < 4; j++) spr += L([[px - pw2 / 2 + 24, y0 + 120 + j * 26], [px + pw2 / 2 - 24, y0 + 121 + j * 26]], seed + 1110 + k * 9 + j, t, 2.4) + ' ';
              const a = MOON.at(cues, o.pp.at, 0.3 + k * 0.5);
              o.tx.setAttribute('x', px); o.tx.setAttribute('y', y0 + 80);
              o.tx.style.visibility = lt >= a ? 'visible' : 'hidden';
              let fs = o.pp.size || 58; o.tx.setAttribute('font-size', fs);
              try { while (fs > 44 && o.tx.getComputedTextLength() > pw2 - 30) { fs -= 2; o.tx.setAttribute('font-size', fs); } } catch (e) { /* */ }
            });
            stP.setAttribute('d', sp); stPR.setAttribute('d', spr);
            if (priceG) {
              const a = MOON.at(cues, ST.price_at, 0.2), p = spring(lt, a, 0.6), kx = sx, ky = ctr + 120, sw = Math.sin(lt * 1.6) * 3;
              priceG.style.visibility = lt >= a ? 'visible' : 'hidden';
              let tw = 260; try { tw = prTx.getComputedTextLength() || 260; } catch (e) { /* */ }
              const q = [[kx - tw / 2 - 26, ky - 60], [kx + tw / 2 + 26, ky - 60], [kx + tw / 2 + 26, ky + 26], [kx - tw / 2 - 26, ky + 26]];
              prF.setAttribute('d', inkLoop(q, { seed: seed + 1200, t, amp: 0.8, smooth: false }));
              prR.setAttribute('d', inkPath(q, { w: 5, seed: seed + 1201, t, closed: true, amp: 0.8, smooth: false }));
              prTx.setAttribute('x', kx); prTx.setAttribute('y', ky);
              priceG.setAttribute('transform', `rotate(${sw.toFixed(2)} ${kx} ${ky - 60}) translate(${kx} ${ky}) scale(${Math.max(0.01, p).toFixed(3)}) translate(${-kx} ${-ky})`);
              const xa = MOON.at(cues, ST.cross_at, null);
              prX.setAttribute('d', xa != null && lt >= xa ? L([[kx - tw / 2 - 10, ky - 50], [kx + tw / 2 + 10, ky + 14]], seed + 1202, t, 8) : '');
            }
          }
          crowd.forEach(c => c.update(lt, t, cues, W, H));
          boys.forEach(c => c.update(lt, t, cues, W, H));
          bubbles.forEach((o, i) => {
            const s = o.b.shout, a = MOON.at(cues, s.at, 0.5), p = spring(lt, a, 0.5);
            o.g.style.visibility = lt >= a ? 'visible' : 'hidden';
            if (lt < a) return;
            const bx = (o.b.x + (s.dx ?? 0.08)) * W, by = gy - (s.dy ?? 0.5) * H;
            let tw = 0; try { tw = o.tx.getComputedTextLength(); } catch (e) { tw = 300; }
            const rx = (tw / 2 + 40), ry = 58;
            const pts = inkEllipsePts(bx, by, rx, ry, seed + 800 + i, 14);
            o.f.setAttribute('d', inkLoop(pts, { seed: seed + 810 + i, t, amp: 1 }) + ' ' + inkLoop([[bx - rx * 0.45, by + ry * 0.7], [o.b.x * W + 20, gy - 0.3 * H], [bx - rx * 0.15, by + ry * 0.85]], { seed: seed + 820 + i, t, amp: 1 }));
            o.r.setAttribute('d', inkPath(pts, { w: 5, seed: seed + 830 + i, t, closed: true }) + ' ' + L([[bx - rx * 0.45, by + ry * 0.75], [o.b.x * W + 20, gy - 0.3 * H], [bx - rx * 0.12, by + ry * 0.9]], seed + 840 + i, t, 4.5));
            o.tx.setAttribute('x', bx); o.tx.setAttribute('y', by + 18);
            o.g.setAttribute('transform', `translate(${bx} ${by}) scale(${Math.max(0.01, p).toFixed(3)}) translate(${-bx} ${-by})`);
          });
          host.forEach(c => c.update(lt, t, cues, W, H));
          // loose sheets blowing across
          sheets.forEach((s, i) => {
            const per = 5.5 + i * 1.3, q = ((lt + i * 2.1) / per) % 1;
            const x = lerp(-120, W + 120, q), y = gy - 120 - i * 90 + Math.sin(q * TAU * 2 + i) * 60, a = q * TAU * (1.5 + i * 0.3);
            const c = Math.cos(a), sn = Math.sin(a), sq = Math.abs(Math.cos(a * 0.7)) * 0.7 + 0.3;
            const T = p => [x + p[0] * c - p[1] * sn * sq, y + p[0] * sn + p[1] * c * sq];
            const qd = [[-46, -32], [46, -32], [46, 32], [-46, 32]].map(T);
            s.f.setAttribute('d', inkLoop(qd, { seed: seed + 900 + i, t, amp: 0.6, smooth: false }));
            s.r.setAttribute('d', inkPath(qd, { w: 3.5, seed: seed + 910 + i, t, amp: 0.6, closed: true, smooth: false }) + ' ' + L([T([-30, -12]), T([30, -12])], seed + 920 + i, t, 2.5) + ' ' + L([T([-30, 6]), T([24, 6])], seed + 930 + i, t, 2.5));
          });
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
