// moon_letter: a hand-written letter or manuscript on a writing desk at candle light (Stickstory ag-14): the sheet,
// a quill that writes the lines one by one (each line is revealed as the nib moves along it), an ink pot, a guttering
// candle, red underlines and stamped tags that slam onto the page. Set: "interior". Palette tokens only.
// P: {sheet: {x: 0.45, y: 0.5, w: 0.5, h: 0.84, rot: -1.5}, heading: "Cape of Good Hope, 1837" (top right, small),
//     lines: [{text, at (starts writing), dur: 1.2, size: 58, color: "ink"|"red", underline: cue|sec}],
//     tags: [{text, x, y (0..1 of W/H), at, rot, color, size}], sign: {text, at}, candle: 0.86 | false,
//     quill: true, kasif: K, cast: [K], labels: [...], sheet: false (no letter),
//     tear: {text: "RETRACTION", at, x, y, w, h, size} (a big sheet that rips in two on its cue)}
// cues: whatever "at"s reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const f1 = v => Math.round(v * 10) / 10;

  SH.moon_letter = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const L = MOON.line;
      const SHT = Object.assign({ x: 0.45, y: 0.5, w: 0.5, h: 0.84, rot: -1.5 }, P.sheet || {});
      const sw = SHT.w * W, sh = SHT.h * H, sx = SHT.x * W - sw / 2, sy = SHT.y * H - sh / 2;
      const root = el(svg, 'g');
      const desk = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), deskR = inkEl(root, INK.inkSoft);
      const page = el(root, 'g', { transform: `rotate(${SHT.rot} ${SHT.x * W} ${SHT.y * H})` });
      if (P.sheet === false) page.style.display = 'none';
      const shadow = inkEl(page, INK.paperDark), sheetF = inkEl(page, INK.paperLight), sheetR = inkEl(page), ruled = inkEl(page, INK.inkSoft);
      const head = el(page, 'text', { x: sx + sw - 50, y: sy + 90, 'font-family': INK_FONT, 'font-size': 46, 'text-anchor': 'end', fill: INK.inkSoft });
      head.textContent = P.heading || '';
      const lines = (P.lines || []).map((ln, i) => {
        const y = sy + 190 + i * ((ln.size || 58) + 30);
        const id = `mlclip${seed}_${i}`;
        const cp = el(defs || svg, 'clipPath', { id }), rect = el(cp, 'rect', { x: sx, y: y - 80, width: 0, height: 110 });
        const tx = el(page, 'text', { x: sx + 60, y, 'font-family': INK_FONT, 'font-size': ln.size || 58, fill: ln.color === 'red' ? INK.red : INK.ink, 'clip-path': `url(#${id})` });
        tx.textContent = ln.text;
        let fs = ln.size || 58; try { while (fs > 44 && tx.getComputedTextLength() > sw - 120) { fs -= 2; tx.setAttribute('font-size', fs); } } catch (e) { /* */ }
        const ul = inkEl(page, INK.red);
        return { ln, y, rect, tx, ul, w: 0 };
      });
      const signTx = P.sign ? el(page, 'text', { x: sx + sw - 70, y: sy + sh - 70, 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'end', fill: INK.ink }) : null;
      if (signTx) signTx.textContent = P.sign.text;
      const pot = inkEl(root, INK.ink), potR = inkEl(root);
      const candF = inkEl(root, INK.paperLight), candR = inkEl(root), glow = inkEl(root, INK.gold), flame = inkEl(root, INK.gold), flameR = inkEl(root, INK.red);
      const quillF = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const tags = (P.tags || []).map(s => {
        const g = el(root, 'g'), col = { red: INK.red, ink: INK.ink, blue: INK.blue }[s.color] || INK.red, size = s.size || 64;
        const box = inkEl(g, col), tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: col, 'letter-spacing': 2 });
        tx.textContent = s.text;
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * s.text.length * 0.6; }
        return { s, g, box, tx, size, w: w || size * s.text.length * 0.6 };
      });
      // tear: a big sheet with one word that rips in two on its cue, the halves falling apart
      const TR = P.tear ? Object.assign({ x: 0.55, y: 0.45, w: 0.36, h: 0.5, size: 96 }, P.tear) : null;
      const tearG = TR ? [0, 1].map(k => { const g = el(root, 'g'), id = `mltear${seed}_${k}`, cp = el(defs || svg, 'clipPath', { id });
        const tw = TR.w * W, th = TR.h * H, tx0 = TR.x * W - tw / 2, ty0 = TR.y * H - th / 2, mid = TR.x * W;
        const zig = []; for (let i = 0; i <= 8; i++) zig.push([mid + (i % 2 ? 18 : -18), ty0 - 10 + i * (th + 20) / 8]);
        const poly = k === 0 ? [[tx0 - 40, ty0 - 40]].concat(zig.map(p => p)).concat([[tx0 - 40, ty0 + th + 40]]) : [[tx0 + tw + 40, ty0 - 40]].concat(zig.map(p => p)).concat([[tx0 + tw + 40, ty0 + th + 40]]);
        el(cp, 'path', { d: 'M' + poly.map(p => p.join(' ')).join(' L') + ' Z' });
        const inner = el(g, 'g', { 'clip-path': `url(#${id})` });
        const f = inkEl(inner, INK.paperLight), r = inkEl(inner), tx = el(inner, 'text', { x: mid, y: TR.y * H + TR.size * 0.35, 'font-family': FR, 'font-weight': 900, 'font-size': TR.size, 'text-anchor': 'middle', fill: INK.red });
        tx.textContent = TR.text || 'RETRACTION';
        return { g, f, r, tx, tw, th, tx0, ty0, zig };
      }) : [];
      const cast = [P.kasif].concat(P.cast || []).filter(Boolean).map((c, i) => MOON.K(el(root, 'g'), c, seed * 3 + i * 7 + 1));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      const dy = 0.8 * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          desk.setAttribute('d', inkLoop([[-20, dy], [W + 20, dy - 10], [W + 20, H + 20], [-20, H + 20]], { seed: seed, t, amp: 1, smooth: false }));
          let dr = L([[-20, dy], [W + 20, dy - 10]], seed + 1, t, 6, 1, 0.05) + ' ';
          for (let i = 0; i < 6; i++) { const y = dy + 30 + i * 36; dr += L([[-20, y], [W + 20, y - 8]], seed + 2 + i, t, 2.2, 1) + ' '; }
          deskR.setAttribute('d', dr);
          const q = [[sx, sy], [sx + sw, sy + 3], [sx + sw - 2, sy + sh], [sx + 3, sy + sh - 2]];
          shadow.setAttribute('d', inkLoop(q.map(p => [p[0] + 14, p[1] + 14]), { seed: seed + 10, t, amp: 1, smooth: false }));
          shadow.setAttribute('fill-opacity', 0.7);
          sheetF.setAttribute('d', inkLoop(q, { seed: seed + 11, t, amp: 1, smooth: false }));
          sheetR.setAttribute('d', inkPath(q, { w: 4, seed: seed + 12, t, closed: true, amp: 1, smooth: false }));
          let rl = ''; for (let i = 0; i < 9; i++) { const y = sy + 210 + i * 88; if (y > sy + sh - 40) break; rl += L([[sx + 50, y], [sx + sw - 50, y + 2]], seed + 20 + i, t, 1.4, 0.6) + ' '; }
          ruled.setAttribute('d', rl);
          // writing
          let nib = null;
          lines.forEach((o, i) => {
            if (!o.w) { try { o.w = o.tx.getComputedTextLength(); } catch (e) { o.w = 600; } o.w = o.w || 600; }
            const a = MOON.at(cues, o.ln.at, 0.3 + i * 1.4), d = o.ln.dur ?? Math.max(0.8, o.w / 520), p = clamp01((lt - a) / d);
            o.rect.setAttribute('width', f1(60 + o.w * p + 10));
            if (p > 0 && p < 1) nib = [sx + 60 + o.w * p, o.y - 6 + Math.sin(lt * 30) * 6];
            const ua = MOON.at(cues, o.ln.underline, null);
            if (ua != null) { const u = clamp01((lt - ua) / 0.45); o.ul.setAttribute('d', u > 0 ? L([[sx + 56, o.y + 16], [sx + 60 + o.w * u, o.y + 12]], seed + 40 + i, t, 7) : ''); }
          });
          if (signTx) signTx.style.visibility = lt >= MOON.at(cues, P.sign.at, 99) ? 'visible' : 'hidden';
          // ink pot + candle
          const px = sx + sw + 90, py = dy + 40;
          pot.setAttribute('d', inkLoop([[px - 50, py], [px - 58, py - 70], [px - 26, py - 92], [px + 26, py - 92], [px + 58, py - 70], [px + 50, py]], { seed: seed + 60, t, amp: 0.8 }));
          potR.setAttribute('d', inkCircle(px, py - 96, 26, seed + 61, t, { w: 4, ry: 8 }));
          if (P.candle !== false) {
            const cx = (P.candle ?? 0.88) * W, cb = dy + 60, ct = cb - 230;
            candF.setAttribute('d', inkLoop([[cx - 30, cb], [cx - 30, ct], [cx + 30, ct + 6], [cx + 30, cb]], { seed: seed + 70, t, amp: 0.8, smooth: false }));
            candR.setAttribute('d', inkPath([[cx - 30, cb], [cx - 30, ct], [cx + 30, ct + 6], [cx + 30, cb]], { w: 5, seed: seed + 71, t, amp: 0.8, smooth: false }) + ' ' +
              L([[cx - 70, cb], [cx + 70, cb]], seed + 72, t, 8) + ' ' + L([[cx, ct], [cx, ct - 18]], seed + 73, t, 3) + ' ' + L([[cx + 18, ct + 4], [cx + 22, ct + 50], [cx + 16, ct + 70]], seed + 74, t, 4));
            const fl = 1 + 0.18 * Math.sin(t * 11) + 0.1 * Math.sin(t * 17), sway = Math.sin(t * 3) * 5;
            let gd = ''; for (let k = 0; k < 3; k++) { const r = (60 + k * 40) * (1 + 0.04 * Math.sin(t * 6 + k)); gd += inkCircle(cx, ct - 50, r, seed + 75 + k, t, { w: 2 }) + ' '; }
            glow.setAttribute('d', gd);
            flame.setAttribute('d', inkLoop([[cx - 16, ct - 18], [cx - 10, ct - 50 * fl], [cx + sway, ct - 90 * fl], [cx + 12, ct - 48 * fl], [cx + 16, ct - 18]], { seed: seed + 80, t, amp: 1.2 }));
            flameR.setAttribute('d', inkLoop([[cx - 6, ct - 18], [cx + sway * 0.5, ct - 50 * fl], [cx + 6, ct - 18]], { seed: seed + 81, t, amp: 0.8 }));
          }
          // quill: at the nib while writing, else resting in the ink pot
          if (P.quill !== false) {
            const tip = nib || [px + 6, py - 80];
            const ang = nib ? -55 * Math.PI / 180 : -80 * Math.PI / 180, len = 330;
            const end = [tip[0] + Math.cos(ang) * len * 0.7, tip[1] + Math.sin(ang) * len];
            const nx = -Math.sin(ang), ny = Math.cos(ang);
            const v = [tip, [lerp(tip[0], end[0], 0.25) + nx * 22, lerp(tip[1], end[1], 0.25) + ny * 22], [end[0] + nx * 8, end[1] + ny * 8], end, [lerp(tip[0], end[0], 0.3) - nx * 14, lerp(tip[1], end[1], 0.3) - ny * 14]];
            quillF.setAttribute('d', inkLoop(v, { seed: seed + 90, t, amp: 1 }));
            let qr = inkPath(v, { w: 4, seed: seed + 91, t, closed: true, amp: 1 }) + ' ' + L([tip, end], seed + 92, t, 3.5) + ' ';
            for (let i = 1; i < 8; i++) { const q2 = 0.25 + i * 0.09, b = [lerp(tip[0], end[0], q2), lerp(tip[1], end[1], q2)]; qr += L([b, [b[0] + nx * 18 - Math.cos(ang) * 14, b[1] + ny * 18 - Math.sin(ang) * 14]], seed + 93 + i, t, 2) + ' '; }
            quillR.setAttribute('d', qr);
          }
          tags.forEach((o, i) => {
            const a = MOON.at(cues, o.s.at, 1 + i * 0.4), p = clamp01((lt - a) / 0.22), hit = punch(lt, a + 0.22, 0.5);
            o.g.style.visibility = lt >= a ? 'visible' : 'hidden';
            if (lt < a) return;
            const sc = lerp(1.7, 1, p) * (1 + 0.06 * hit);
            o.g.setAttribute('transform', `translate(${f1(o.s.x * W)} ${f1(o.s.y * H)}) rotate(${o.s.rot ?? -6}) scale(${sc.toFixed(3)})`);
            o.tx.setAttribute('x', 0); o.tx.setAttribute('y', o.size * 0.36);
            const bw = o.w / 2 + 30, bh = o.size * 0.62;
            o.box.setAttribute('d', inkPath([[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]], { w: 7, seed: seed + 120 + i, t, closed: true, smooth: false, amp: 1.4 }));
          });
          if (TR) {
            const a = MOON.at(cues, TR.at, 1.5), q = clamp01((lt - a) / 1.2), e = q * q;
            tearG.forEach((o, k) => {
              const sgn = k ? 1 : -1, q4 = [[o.tx0, o.ty0], [o.tx0 + o.tw, o.ty0], [o.tx0 + o.tw, o.ty0 + o.th], [o.tx0, o.ty0 + o.th]];
              o.f.setAttribute('d', inkLoop(q4, { seed: seed + 140, t, amp: 0.8, smooth: false }));
              o.r.setAttribute('d', inkPath(q4, { w: 5, seed: seed + 141, t, closed: true, amp: 0.8, smooth: false }) + (q > 0 ? ' ' + MOON.line(o.zig, seed + 142, t, 3) : ''));
              const cxm = TR.x * W, cym = TR.y * H;
              o.g.setAttribute('transform', `translate(${(sgn * (e * 160 + q * 30)).toFixed(1)} ${(e * 220).toFixed(1)}) rotate(${(sgn * e * 24).toFixed(2)} ${cxm} ${cym + o.th / 2})`);
            });
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
