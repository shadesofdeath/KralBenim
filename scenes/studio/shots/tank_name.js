// tank_name: a committee-room door in a 1915 London ministry, parchment ink (BRAND.md §3, §5; set "interior").
// Panelled door with a frosted glass pane, frame, brass knob, a nameplate painted on the glass that writes itself;
// at cue `initials` chosen letters swell and turn red (Water Carrier -> W, C), at cue `cross` a red line strikes the
// name, and labels (bb__lib, e.g. a "TANK" stamp) do the rest. Cast stands beside the door.
// P: {x: 0.5 (door centre), w: 0.3, ground: 0.86, name: "Water Carrier", size: 92, initials: [0, 6] (char indexes),
//     at: 0.3 (name starts writing), cross: cue, cast: [... + helmet/moustache], labels: [...]}
// cues: initials, cross, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_name = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 419;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const gy = (P.ground ?? 0.86) * H, dx = (P.x ?? 0.5) * W, dw = (P.w ?? 0.3) * W, dh = gy - H * 0.12;
      const x0 = dx - dw / 2, x1 = dx + dw / 2, y0 = gy - dh;
      const lay = { wall: L(INK.inkSoft), frameF: L(INK.paperDark), doorF: L(INK.paperDark), glass: L(INK.paperLight), glassS: L(INK.inkSoft), ink: L(INK.ink), knob: L(INK.gold) };
      const size = P.size || 92, gyText = y0 + dh * 0.25;
      const tx = el(cam, 'text', { x: dx, y: gyText, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, 'dominant-baseline': 'central' });
      const chars = [...(P.name || 'Water Carrier')].map(ch => { const s = el(tx, 'tspan'); s.textContent = ch; return s; });
      const strike = L(INK.red);
      const castG = el(cam, 'g'), capF = L(INK.inkSoft), capI = L(INK.ink);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      let tw = 0;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.1, w: 5 }, extra || {});
          // wainscot lines on the wall
          const WL = [inkPath([[-20, gy - 260], [x0 - 60, gy - 260]], o(1, { w: 4 })), inkPath([[x1 + 60, gy - 260], [W + 20, gy - 260]], o(2, { w: 4 })), inkPath([[-20, gy], [W + 20, gy]], o(3, { w: 6 }))];
          for (let x = 40; x < W; x += 140) if (x < x0 - 70 || x > x1 + 70) WL.push(inkPath([[x, gy - 250], [x, gy - 10]], o(10 + x, { w: 2.5 })));
          lay.wall.setAttribute('d', WL.join(' '));
          const frame = [[x0 - 50, gy], [x0 - 50, y0 - 50], [x1 + 50, y0 - 50], [x1 + 50, gy]];
          lay.frameF.setAttribute('d', inkLoop(frame, o(20, { smooth: false })));
          const door = [[x0, gy], [x0, y0], [x1, y0], [x1, gy]];
          lay.doorF.setAttribute('d', inkLoop(door, o(21, { smooth: false })));
          const gl = [[x0 + 40, y0 + 40], [x1 - 40, y0 + 40], [x1 - 40, y0 + dh * 0.48], [x0 + 40, y0 + dh * 0.48]];
          lay.glass.setAttribute('d', inkLoop(gl, o(22, { smooth: false })));
          const GS = []; for (let k = 0; k < 7; k++) { const y = lerp(y0 + 70, y0 + dh * 0.45, k / 6); GS.push(inkPath([[x0 + 70 + (k % 2) * 40, y], [x0 + 140 + (k % 2) * 40, y - 30]], o(30 + k, { w: 2.4 }))); }
          lay.glassS.setAttribute('d', GS.join(' '));
          const IN = [inkPath(frame, o(23, { smooth: false, w: 7 })), inkPath(door.concat([door[0]]), o(24, { smooth: false, w: 6 })), inkPath(gl.concat([gl[0]]), o(25, { smooth: false, w: 5 })),
            inkPath([[x0 + 40, y0 + dh * 0.56], [x1 - 40, y0 + dh * 0.56], [x1 - 40, gy - 40], [x0 + 40, gy - 40], [x0 + 40, y0 + dh * 0.56]], o(26, { smooth: false, w: 4 }))];
          lay.ink.setAttribute('d', IN.join(' '));
          lay.knob.setAttribute('d', inkDot(x1 - 50, y0 + dh * 0.6, 20, 20, sd + 40, t));
          // name writes itself
          const a0 = at(P.at, 0.3), ia = P.initials_at != null ? at(P.initials_at, null) : at('initials', null);
          chars.forEach((c, k) => c.setAttribute('opacity', lt >= a0 + k * 0.07 ? '1' : '0'));
          (P.initials || [0, 6]).forEach(k => { if (!chars[k]) return; const on = ia != null && lt >= ia; const sp = on ? spring(lt, ia, 0.5) : 0;
            chars[k].setAttribute('fill', on ? INK.red : INK.ink); chars[k].setAttribute('font-size', (size * (1 + 0.45 * sp)).toFixed(1)); });
          const b = boil(sd + 50, t, 1); tx.setAttribute('transform', `translate(${b[0]} ${b[1]})`);
          if (!tw) { try { tw = tx.getComputedTextLength(); } catch (e) { tw = 0; } }
          const ca = P.cross != null ? at(P.cross, null) : null;
          if (ca != null && lt >= ca) { const p = progIO(lt, ca, 0.45), w2 = (tw || size * 6) / 2 + 30;
            strike.setAttribute('d', inkPath([[dx - w2, gyText + 6], [lerp(dx - w2, dx + w2, p), gyText - 6 * p]], o(60, { w: 16 }))); } else strike.setAttribute('d', '');
          const cres = cast.update(lt, t, cues), CF = [], CI = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return; if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 200 + i * 20); CF.push(h.fill); CI.push(h.ink); }
            if (m.moustache) CI.push(T.moustache(q.head, q.face, q.s, t, sd + 260 + i * 7)); });
          capF.setAttribute('d', CF.join(' ')); capI.setAttribute('d', CI.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
