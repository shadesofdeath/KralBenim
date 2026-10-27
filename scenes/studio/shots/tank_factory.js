// tank_factory: a 1915-1916 engineering works building the first tanks, parchment ink (BRAND.md §3, §5; set
// "interior" behind). Roof trusses and tall windows, an overhead crane whose chain lowers a swinging armour plate,
// the tank on the shop floor (tank__lib, any variant) with riveting sparks, workers in flat caps swinging hammers
// (bb__lib cast + helmet "flat"), more hulls receding in a row behind it, crates, a stencil that sprays itself onto the
// hull letter by letter, and a tarpaulin that drops over the machine (the secret).
// P: {ground: 0.82, tank: {variant: "male", x: 0.5, s: 0.85, face: 1, label}, row: 0 (hulls behind),
//     crane: {x: 0.3, at} | false, sparks: [{x, y, at}] (0..1), stencils: [{text, x, y, at, size: 80, color: "ink"|"red",
//     rot: 0, cross: cue}], tarp: cue, crates: [{x, w, h, text}], cast: [... + helmet, hammer: true], labels}
// cues: crane.at, sparks, stencils, tarp, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_factory = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 233;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const gy = (P.ground ?? 0.82) * H;
      const lay = { win: L(INK.paperLight), winI: L(INK.inkSoft), truss: L(INK.ink), rowF: L(INK.inkSoft, { 'fill-opacity': 0.55 }), rowI: L(INK.inkSoft),
        crateF: L(INK.paperDark), crateI: L(INK.ink), floor: L(INK.ink), floorS: L(INK.inkSoft) };
      const crateT = (P.crates || []).map(c => { const e = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': c.size || 48, fill: INK.ink, 'text-anchor': 'middle' }); e.textContent = c.text || ''; return e; });
      const tk = P.tank === false ? null : Object.assign({ variant: 'male', x: 0.5, s: 0.85, face: 1 }, P.tank || {});
      const tankR = tk ? T.tank(el(cam, 'g'), { variant: tk.variant, label: tk.label, tail: tk.tail, seed: sd + 3 }) : null;
      const stG = el(cam, 'g');
      const st = (P.stencils || []).map((s2, i) => {
        const g = el(stG, 'g'), size = s2.size || 80;
        const board = s2.board ? { f: inkEl(g, INK.paperLight), r: inkEl(g, INK.ink) } : null;
        const tx = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': size, 'letter-spacing': size * 0.12,
          fill: s2.color === 'red' ? INK.red : INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        const chars = [...String(s2.text).toLocaleUpperCase(LOCALE)].map(ch => { const sp = el(tx, 'tspan'); sp.textContent = ch; return sp; });
        const cross = s2.cross ? inkEl(g, INK.red) : null;
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * chars.length * 0.7; }
        return { s2, g, tx, chars, cross, board, w: w || size * chars.length * 0.7, size };
      });
      const sparkF = L(INK.gold), sparkI = L(INK.red);
      const tarpF = L(INK.paperDark), tarpI = L(INK.ink), tarpS = L(INK.inkSoft);
      const chain = L(INK.ink), plateF = L(INK.paperDark), plateI = L(INK.ink);
      const castG = el(cam, 'g'), hamI = L(INK.ink), capF = L(INK.inkSoft), capI = L(INK.ink);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.2, w: 5 }, extra || {});
          // tall windows + roof trusses
          const WN = [], WNI = [];
          for (let k = 0; k < 3; k++) { const x0 = W * (0.34 + k * 0.23), x1 = x0 + W * 0.11, y0 = H * 0.08, y1 = gy - H * 0.36;
            const r = [[x0, y1], [x0, y0 + 40], [(x0 + x1) / 2, y0], [x1, y0 + 40], [x1, y1]];
            WN.push(inkLoop(r, o(10 + k, { smooth: false }))); WNI.push(inkPath(r.concat([r[0]]), o(20 + k, { smooth: false, w: 4 })));
            for (let j = 1; j < 4; j++) WNI.push(inkPath([[x0, lerp(y0 + 40, y1, j / 4)], [x1, lerp(y0 + 40, y1, j / 4)]], o(30 + k * 5 + j, { w: 2.5 })));
            WNI.push(inkPath([[(x0 + x1) / 2, y0 + 10], [(x0 + x1) / 2, y1]], o(50 + k, { w: 2.5 }))); }
          lay.win.setAttribute('d', WN.join(' ')); lay.winI.setAttribute('d', WNI.join(' '));
          const TR = [inkPath([[640, H * 0.05], [W + 20, H * 0.05]], o(60, { w: 9 })), inkPath([[640, H * 0.12], [W + 20, H * 0.12]], o(61, { w: 7 }))];
          for (let x = 640, k = 0; x < W + 80; x += 160, k++) TR.push(inkPath([[x, H * 0.12], [x + 80, H * 0.05], [x + 160, H * 0.12]], o(62 + k, { w: 4, smooth: false })));
          lay.truss.setAttribute('d', TR.join(' '));
          // hulls in a row behind (production)
          const RF = [], RI = [];
          for (let k = 0; k < (P.row || 0); k++) { const s = 0.42 - k * 0.06, x = W * (0.16 + k * 0.17), y = gy - 70 - k * 18;
            const prof = [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]].map(p => [x + p[0] * s, y + p[1] * s]);
            RF.push(inkLoop(prof, o(70 + k, { smooth: false }))); RI.push(inkPath(prof, o(80 + k, { closed: true, smooth: false, w: 4 }))); }
          lay.rowF.setAttribute('d', RF.join(' ')); lay.rowI.setAttribute('d', RI.join(' '));
          // crates
          const CF = [], CI = [];
          (P.crates || []).forEach((c, k) => { const x = c.x * W, w = (c.w ?? 0.12) * W, h = c.h ?? 140, box = [[x - w / 2, gy], [x + w / 2, gy], [x + w / 2, gy - h], [x - w / 2, gy - h]];
            CF.push(inkLoop(box, o(90 + k, { smooth: false }))); CI.push(inkPath(box, o(95 + k, { closed: true, smooth: false, w: 5 }))); if (!c.text) CI.push(inkPath([[x - w / 2, gy - h], [x + w / 2, gy]], o(97 + k, { w: 3 })));
            crateT[k].setAttribute('x', x); crateT[k].setAttribute('y', gy - h / 2 + 16); });
          lay.crateF.setAttribute('d', CF.join(' ')); lay.crateI.setAttribute('d', CI.join(' '));
          // floor
          lay.floor.setAttribute('d', inkPath([[-30, gy], [W + 30, gy]], o(100, { w: 6 })));
          const FS = []; for (let k = 0; k < 14; k++) { const y = gy + 30 + (k % 4) * 40, x = (k * 173) % W; FS.push(inkPath([[x, y], [x + 120, y]], o(110 + k, { w: 2.4 }))); }
          lay.floorS.setAttribute('d', FS.join(' '));
          // the tank
          let res = null;
          if (tankR) res = tankR.update(t, { x: tk.x * W, y: gy, a: 0, face: tk.face === -1 ? -1 : 1, s: tk.s, ph: 0, fire: 0, dead: 0 });
          // stencils: letter by letter, then optional red cross
          st.forEach(({ s2, g, chars, cross, board, w, size }, i) => {
            const a = at(s2.at, 0.4 + i * 0.6);
            const x = s2.x * W, y = s2.y * H;
            g.setAttribute('transform', `translate(${x} ${y}) rotate(${s2.rot || 0}) scale(${(1 + 0.06 * punch(lt, a + chars.length * 0.06, 0.5)).toFixed(3)})`);
            chars.forEach((c, k) => c.setAttribute('opacity', lt >= a + k * 0.06 ? '1' : '0'));
            if (board) { const bp = [[-w / 2 - 30, -size * 0.75], [w / 2 + 30, -size * 0.75], [w / 2 + 30, size * 0.75], [-w / 2 - 30, size * 0.75]];
              board.f.setAttribute('d', inkLoop(bp, o(135 + i, { smooth: false }))); board.r.setAttribute('d', inkPath(bp, o(137 + i, { closed: true, smooth: false, w: 4 }))); }
            if (cross) { const ca = at(s2.cross, null); if (ca != null && lt >= ca) { const p = progIO(lt, ca, 0.4);
              cross.setAttribute('d', inkPath([[-w / 2 - 20, size * 0.1], [lerp(-w / 2 - 20, w / 2 + 20, p), size * 0.1 - 10 * p]], o(130 + i, { w: 14 }))); } else cross.setAttribute('d', ''); }
          });
          // crane: chain + swinging plate
          if (P.crane !== false && P.crane) {
            const cx = (P.crane.x ?? 0.3) * W, ca = at(P.crane.at, 0.2), dn = progIO(lt, ca, 2.5), sw = Math.sin(lt * 1.6) * 6 * (1 - dn * 0.6);
            const top = cx < 640 ? 230 : H * 0.12, len = lerp(H * 0.12, H * 0.32, dn), bx = cx + sw, by = top + len;
            chain.setAttribute('d', inkPath([[cx, top], [bx, by]], o(140, { w: 5 })) + ' ' + inkPath([[bx - 20, by], [bx, by + 24], [bx + 20, by]], o(141, { w: 6 })));
            const pl = [[bx - 110, by + 30], [bx + 110, by + 30], [bx + 110, by + 150], [bx - 110, by + 150]];
            plateF.setAttribute('d', inkLoop(pl, o(142, { smooth: false })));
            plateI.setAttribute('d', inkPath(pl, o(143, { closed: true, smooth: false, w: 5 })) + ' ' + [0, 1, 2, 3].map(k => inkDot(bx - 85 + k * 56, by + 48, 5, 5, sd + 144 + k, t)).join(' ') +
              ' ' + inkPath([[bx - 20, by + 24], [bx - 100, by + 30]], o(148, { w: 3 })) + ' ' + inkPath([[bx + 20, by + 24], [bx + 100, by + 30]], o(149, { w: 3 })));
          }
          // riveting sparks
          const SP = [], SPI = [];
          (P.sparks || []).forEach((s2, i) => { const a = at(s2.at, 0.3 + i * 0.5); if (lt < a) return; const x = s2.x * W, y = s2.y * H;
            const beat = (lt - a) * 3 % 1; if (beat > 0.5) return;
            for (let k = 0; k < 7; k++) { const an = -Math.PI / 2 + (k - 3) * 0.4, r = 20 + beat * 120; SPI.push(inkPath([[x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.5 + beat * beat * 120], [x + Math.cos(an) * r, y + Math.sin(an) * r + beat * beat * 200]], o(150 + i * 10 + k, { w: 4 }))); }
            SP.push(inkDot(x, y, 18 * (1 - beat), 18 * (1 - beat), sd + 170 + i, t)); });
          sparkF.setAttribute('d', SP.join(' ')); sparkI.setAttribute('d', SPI.join(' '));
          // tarpaulin drop
          const ta = P.tarp != null ? at(P.tarp, null) : null;
          if (ta != null && lt >= ta && res) {
            const p = progIO(lt, ta, 1.1), x0 = tk.x * W - 470 * tk.s, x1 = tk.x * W + 470 * tk.s, top = gy - 380 * tk.s, drop = lerp(-H * 0.6, 0, p);
            const pts = [[x0 - 40, gy + 4], [x0, top + 80], [x0 + 120 * tk.s, top], [x1 - 160 * tk.s, top + 10], [x1, top + 90], [x1 + 40, gy + 4]].map(q => [q[0], Math.min(gy + 4, q[1] + drop)]);
            const wav = Math.sin(lt * 6) * 10 * (1 - p);
            const pp = pts.map((q, k) => [q[0], q[1] + (k % 2 ? wav : -wav)]);
            tarpF.setAttribute('d', inkLoop(pp, o(180, { amp: 1.4 })));
            tarpI.setAttribute('d', inkPath(pp, o(181, { closed: true, w: 6 })));
            const FO = []; for (let k = 0; k < 6; k++) { const fx = lerp(x0 + 60, x1 - 60, k / 5); FO.push(inkPath([[fx, top + 40 + drop], [fx + 20, Math.min(gy - 10, gy - 10 + drop)]], o(182 + k, { w: 2.5 }))); }
            tarpS.setAttribute('d', FO.join(' '));
          } else { tarpF.setAttribute('d', ''); tarpI.setAttribute('d', ''); tarpS.setAttribute('d', ''); }
          // cast + hammers + caps
          const cres = cast.update(lt, t, cues), HM = [], CPF = [], CPI = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return;
            if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 200 + i * 20); CPF.push(h.fill); CPI.push(h.ink); }
            if (m.moustache) CPI.push(T.moustache(q.head, q.face, q.s, t, sd + 260 + i * 7));
            if (m.hammer) { const sh = [q.head[0] + q.face * 14, q.head[1] + 160 * q.s / 0.6], beat = Math.abs(Math.sin(lt * 4 + i)), an = (q.face < 0 ? Math.PI : 0) + q.face * (-1.1 + beat * 1.3);
              const tip = [sh[0] + Math.cos(an) * 130 * q.s / 0.6, sh[1] + Math.sin(an) * 130 * q.s / 0.6], na = an + Math.PI / 2;
              HM.push(inkPath([sh, tip], o(300 + i, { w: 8 })), inkPath([[tip[0] + Math.cos(na) * 26, tip[1] + Math.sin(na) * 26], [tip[0] - Math.cos(na) * 26, tip[1] - Math.sin(na) * 26]], o(320 + i, { w: 20 }))); } });
          hamI.setAttribute('d', HM.join(' ')); capF.setAttribute('d', CPF.join(' ')); capI.setAttribute('d', CPI.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
