// bat_lab: a 1930s physics lab in parchment ink (BRAND.md §3, §5): a tall detector cabinet with dials, a needle meter
// and a round scope, a loudspeaker horn on top and a microphone on a stand; a wire cage of bats hanging upside down on
// the bench; period figures (one may hold a bat up to the microphone). On "clicks" the speaker bursts gold zig-zags, the
// scope shows spikes and the needle jumps. Uses bat__lib.js (BAT). Set: "interior".
// P: {floor: 0.86, cabinet: {x: 0.62, w: 0.2, h: 0.5}, mic: {x: 0.44, h: 0.36} | false,
//     cage: {x: 0.2, s: 1, bats: 3} | false, clicks: cue|sec|false,
//     cast: [figure specs (BAT.figure) + hold: "bat" (a folded bat in the hand)], kasif: K, labels: [TD.label specs]}
// cues: hit, clicks, + "at"s.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.bat_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BAT, TD = window.TD, atOr = B.atOr, f1 = B.f1, sd = seed * 1000 + 733;
      const FL = (P.floor ?? 0.86) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bench = inkEl(cam, INK.paperDark), benchR = inkEl(cam);
      const cabF = inkEl(cam, INK.paperDark), cabR = inkEl(cam), panel = inkEl(cam, INK.paperLight), panelR = inkEl(cam);
      const dials = inkEl(cam), scopeF = inkEl(cam, INK.ink), scopeW = inkEl(cam, INK.gold), meterF = inkEl(cam, INK.paperLight), meterR = inkEl(cam), needle = inkEl(cam, INK.red);
      const hornF = inkEl(cam, INK.gold, { 'fill-opacity': 0.55 }), hornR = inkEl(cam), zig = inkEl(cam, INK.gold), zigR = inkEl(cam, INK.red);
      const wires = inkEl(cam, INK.inkSoft), micR = inkEl(cam), micF = inkEl(cam, INK.ink);
      const cageR = inkEl(cam);
      const CG = P.cage === false ? null : Object.assign({ x: 0.2, s: 1, bats: 3 }, P.cage || {});
      const cageBats = CG ? Array.from({ length: CG.bats }, (_, i) => B.bat(el(cam, 'g'), sd + 40 + i * 5)) : [];
      const castG = el(cam, 'g');
      const cast = (P.cast || []).map((K, i) => B.figure(el(castG, 'g'), Object.assign({ hat: false, y: P.floor ?? 0.86 }, K), sd + 60 + i));
      const held = (P.cast || []).map((K, i) => K.hold === 'bat' ? B.bat(el(cam, 'g'), sd + 80 + i) : null);
      const kas = P.kasif ? B.figure(el(root, 'g'), Object.assign({ x: 0.9, y: P.floor ?? 0.86, scale: 0.8, pose: 'point', face: 'left', dir: 30 }, P.kasif), sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ca = P.clicks === false || P.clicks == null ? null : atOr(cues, P.clicks, null);
          const on = ca != null && lt >= ca, hit = punch(lt, atOr(cues, 'hit', ca), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit), cx = W * 0.5, cy = H * 0.55;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          const by = FL - 0.3 * H;
          // bench (left side)
          const bx0 = 0.02 * W, bx1 = 0.4 * W;
          const top = [[bx0, by], [bx1, by], [bx1, by + 30], [bx0, by + 30]];
          bench.setAttribute('d', inkLoop(top, { seed: sd + 1, t, smooth: false }));
          benchR.setAttribute('d', inkPath(top, { w: 6, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[bx0 + 40, by + 30], [bx0 + 40, FL]], { w: 9, seed: sd + 3, t }) + ' ' + inkPath([[bx1 - 40, by + 30], [bx1 - 40, FL]], { w: 9, seed: sd + 4, t }));
          // cabinet
          const C = Object.assign({ x: 0.62, w: 0.2, h: 0.5 }, P.cabinet || {}), cw = C.w * W, chh = C.h * H, x0 = C.x * W - cw / 2, y0 = FL - chh;
          const cab = [[x0, y0], [x0 + cw, y0], [x0 + cw, FL], [x0, FL]];
          cabF.setAttribute('d', inkLoop(cab, { seed: sd + 10, t, smooth: false }));
          cabR.setAttribute('d', inkPath(cab, { w: 7, seed: sd + 11, t, closed: true, smooth: false }));
          const pn = [[x0 + 24, y0 + 24], [x0 + cw - 24, y0 + 24], [x0 + cw - 24, y0 + chh * 0.62], [x0 + 24, y0 + chh * 0.62]];
          panel.setAttribute('d', inkLoop(pn, { seed: sd + 12, t, smooth: false })); panelR.setAttribute('d', inkPath(pn, { w: 4, seed: sd + 13, t, closed: true, smooth: false }));
          // scope (round dark screen)
          const scx = x0 + cw * 0.3, scy = y0 + chh * 0.22, sr = Math.min(cw * 0.2, 70);
          scopeF.setAttribute('d', inkCircle(scx, scy, sr, sd + 14, t, { fill: true, amp: 0.8 }));
          const wv = [];
          for (let k = 0; k <= 24; k++) {
            const u = k / 24, x = scx - sr * 0.85 + u * sr * 1.7;
            const spike = on ? Math.exp(-((((u * 6 + lt * 7) % 1.5) - 0.2) ** 2) * 60) * sr * 0.75 * (k % 2 ? 1 : -1) : 0;
            wv.push([x, scy + Math.sin(u * 20 + lt * 6) * 4 + spike]);
          }
          scopeW.setAttribute('d', inkPath(wv, { w: 4.5, seed: sd + 15, t, amp: 0.5, smooth: false }));
          // meter + needle
          const mx = x0 + cw * 0.72, my = y0 + chh * 0.27, mr = Math.min(cw * 0.2, 66);
          const arcP = []; for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; arcP.push([mx + Math.cos(a) * mr, my + Math.sin(a) * mr]); }
          arcP.push([mx + mr, my + 14], [mx - mr, my + 14]);
          meterF.setAttribute('d', inkLoop(arcP, { seed: sd + 16, t, smooth: false })); meterR.setAttribute('d', inkPath(arcP, { w: 4, seed: sd + 17, t, closed: true, smooth: false }));
          const na = on ? lerp(-2.6, -0.45, 0.75 + 0.25 * Math.sin(lt * 23)) : -2.6 + Math.sin(lt * 1.5) * 0.06;
          needle.setAttribute('d', inkPath([[mx, my + 6], [mx + Math.cos(na) * mr * 0.9, my + 6 + Math.sin(na) * mr * 0.9]], { w: 5, seed: sd + 18, t, amp: 0.4 }));
          let dd = '';
          for (let k = 0; k < 4; k++) { const dx = x0 + cw * (0.2 + k * 0.2), dy = y0 + chh * 0.48; dd += inkCircle(dx, dy, 18, sd + 20 + k, t, { w: 5 }) + ' ' + inkPath([[dx, dy], [dx + Math.cos(k + lt * 0.4) * 14, dy + Math.sin(k + lt * 0.4) * 14]], { w: 4, seed: sd + 25 + k, t, amp: 0.4 }) + ' '; }
          for (let k = 0; k < 3; k++) dd += inkPath([[x0 + 30, y0 + chh * (0.72 + k * 0.08)], [x0 + cw - 30, y0 + chh * (0.72 + k * 0.08)]], { w: 3.4, seed: sd + 30 + k, t, amp: 1 }) + ' ';
          dials.setAttribute('d', dd);
          // speaker horn on top
          const hx = C.x * W, hy = y0 - 8;
          const horn = [[hx - 16, hy], [hx + 16, hy], [hx + 18, hy - 70], [hx + 60, hy - 120], [hx + 170, hy - 150], [hx + 70, hy - 260], [hx + 30, hy - 150], [hx - 14, hy - 80]];
          hornF.setAttribute('d', inkLoop(horn, { seed: sd + 35, t })); hornR.setAttribute('d', inkPath(horn, { w: 6, seed: sd + 36, t, closed: true }) + ' ' + inkPath(B.ell(hx + 120, hy - 205, 30, 66, 12).map(([x, y]) => [hx + 120 + (x - hx - 120) * 0.8 + (y - hy + 205) * 0.6, hy - 205 + (y - hy + 205) * 0.8 - (x - hx - 120) * 0.6]), { w: 6, seed: sd + 34, t, closed: true }));
          const mouthX = hx + 130, mouthY = hy - 210;
          let zz = '', zr = '';
          if (on) {
            for (let k = 0; k < 4; k++) {
              const u = ((lt - ca) * 2.2 + k / 4) % 1, d = 40 + u * 330, a = -0.85 + (k - 1.5) * 0.32, pts = [];
              for (let q = 0; q <= 5; q++) { const r = d + q * 18, side = (q % 2 ? 1 : -1) * 16; pts.push([mouthX + Math.cos(a) * r - Math.sin(a) * side, mouthY + Math.sin(a) * r + Math.cos(a) * side]); }
              const w = 11 * (1 - u) * prog(lt, ca, 0.2);
              if (w > 1) { zz += inkPath(pts, { w, seed: sd + 37 + k, t, amp: 1, smooth: false }) + ' '; zr += inkPath(pts.slice(0, 3), { w: w * 0.35, seed: sd + 41 + k, t, amp: 1, smooth: false }) + ' '; }
            }
          }
          zig.setAttribute('d', zz); zigR.setAttribute('d', zr);
          // microphone on a stand + wire to the cabinet
          let mic = '', micf = '';
          if (P.mic !== false) {
            const M = Object.assign({ x: 0.44, h: 0.36 }, P.mic || {}), mxx = M.x * W, mtop = FL - M.h * H;
            mic = inkPath([[mxx, FL], [mxx, mtop + 40]], { w: 7, seed: sd + 50, t }) + ' ' + inkPath([[mxx - 60, FL], [mxx + 60, FL]], { w: 9, seed: sd + 51, t });
            micf = inkLoop([[mxx - 26, mtop + 44], [mxx - 30, mtop], [mxx, mtop - 22], [mxx + 30, mtop], [mxx + 26, mtop + 44]], { seed: sd + 52, t });
            wires.setAttribute('d', inkPath([[mxx, FL - 8], [mxx + 80, FL - 4], [x0 - 20, FL - 10], [x0, FL - 40]], { w: 4, seed: sd + 53, t }));
          }
          micR.setAttribute('d', mic); micF.setAttribute('d', micf);
          // cage with bats hanging upside down
          if (CG) {
            const gx = CG.x * W, gs = CG.s, gw = 260 * gs, gh = 230 * gs, gy = by;
            let cd = inkPath([[gx - gw / 2, gy], [gx + gw / 2, gy]], { w: 6, seed: sd + 60, t }) + ' ' + inkPath([[gx - gw / 2, gy - gh], [gx + gw / 2, gy - gh]], { w: 6, seed: sd + 61, t });
            for (let k = 0; k <= 7; k++) { const x = gx - gw / 2 + k * gw / 7; cd += inkPath([[x, gy - gh], [x, gy]], { w: 3.4, seed: sd + 62 + k, t, amp: 0.8 }) + ' '; }
            cd += inkPath([[gx - 30, gy - gh], [gx, gy - gh - 40], [gx + 30, gy - gh]], { w: 5, seed: sd + 75, t });
            cageR.setAttribute('d', cd);
            cageBats.forEach((bt, i) => bt.update(t, { x: gx - gw * 0.3 + i * gw * 0.3, y: gy - gh + 58 * gs, s: 0.3 * gs, rot: 180 + Math.sin(lt * 1.2 + i) * 6, fold: 1, ph: 0, mouth: on ? 0.6 : 0.1 }));
          }
          cast.forEach((c, i) => {
            if (!c) return;
            const o = c.update(lt, t, cues, W, H);
            if (held[i]) held[i].update(t, { x: o.hand[0], y: o.hand[1] - 18, s: 0.24 * ((P.cast[i].scale ?? 1) / 0.8), fold: 1, mouth: on ? 0.5 + 0.5 * Math.abs(Math.sin(lt * 9)) : 0.15, rot: Math.sin(lt * 2) * 4 });
          });
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
