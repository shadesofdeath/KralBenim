// pga_iron: Phineas Gage's tamping iron (parchment ink, brand/kit/BRAND.md §3, §5; boils at 8 Hz; pure function of
// (seed, lt), no Math.random). Written for ag-04-phineas-gage, parametric. Needs pga__lib.js (PGA) + mcB__lib.js (MCB).
//
// mode "spec": the iron lies on an anvil, a hammer strikes it (sparks) from `make`; then a dimension line draws above
//   it with a big Fraunces length (`len`), a paper tag on a string swings below it with the weight (`weight`), and a
//   red ring + gleam marks the sharpened point (`point`).
//   P: {mode: "spec", y: 0.4, from: 0.1, to: 0.78 (0..1 W), make: cue|false, len: {text: "3'7\"", at}, weight: {text: "13 LB", at},
//       point: cue, anvil: true}
// mode "portrait": an oval daguerreotype frame swings in on a nail; inside, the man (bare head, period figure)
//   holds the iron upright, the iron taller than he is; a brass name plate below (`name`).
//   P: {mode: "portrait", x: 0.42, y: 0.42, rx: 0.15 (W), ry: 0.3 (H), name: {text: "PHINEAS GAGE", at}, sit_scale: 1.25,
//       figure: {head: "none", bandage: false, beard}}
// both: kasif: {x, y, scale, pose, face, dir, seq, ...MCB cast} | false, labels: [...MCB], cam: {zoom, focus}
// cues: make, len, weight, point, name, hit (punch) + kasif/labels "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';

  SH.pga_iron = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 7800, mode = P.mode || 'spec';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const castG0 = el(cam, 'g');
      const KZ = P.kasif === false ? null : Object.assign(mode === 'spec'
        ? { who: 'kasif', x: 0.88, y: 0.88, scale: 0.72, pose: 'point', dir: 30, face: 'left' }
        : { who: 'kasif', x: 0.8, y: 0.9, scale: 0.8, pose: 'point', dir: 25, face: 'left' }, P.kasif || {});
      let upd;
      if (mode === 'spec') {
        const y = (P.y ?? 0.4) * H, xa = (P.from ?? 0.1) * W, xb = (P.to ?? 0.78) * W;
        const anvF = inkEl(cam, INK.inkSoft), anvL = inkEl(cam);
        const ironG = el(cam, 'g'), iron = PGA.iron(ironG);
        const hamF = inkEl(cam, INK.inkSoft), hamL = inkEl(cam), sparks = inkEl(cam, INK.gold);
        const dimL = inkEl(cam), ring = inkEl(cam, INK.red), gleam = inkEl(cam, INK.gold);
        const strG = inkEl(cam), tagG = el(cam, 'g'), tagF = inkEl(tagG, INK.paperLight), tagL = inkEl(tagG);
        const tagT = el(tagG, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
        tagT.textContent = (P.weight && P.weight.text) || '13 LB';
        const lenT = el(cam, 'text', { x: (xa + xb) / 2, y: y - 120, 'font-family': FR, 'font-weight': 900, 'font-size': 110, 'text-anchor': 'middle', fill: INK.ink });
        lenT.textContent = (P.len && P.len.text) || '3\'7"';
        const ax = lerp(xa, xb, 0.55), gy = 0.82 * H;
        upd = (lt, t, cues, hit) => {
          const mk = P.make === false ? null : atOr(cues, P.make ?? 'make', 0.2);
          const app = spring(lt, 0, 0.6);
          // anvil
          if (P.anvil !== false) {
            const an = [[ax - 170, y + 22], [ax + 120, y + 22], [ax + 230, y + 40], [ax + 120, y + 70], [ax + 70, y + 120], [ax + 90, gy - 70], [ax + 150, gy], [ax - 190, gy], [ax - 120, gy - 70], [ax - 100, y + 120], [ax - 170, y + 80]];
            anvF.setAttribute('d', inkLoop(an, { seed: sd + 1, t, amp: 1, smooth: false }));
            anvL.setAttribute('d', inkPath(an, { w: 7, seed: sd + 2, t, closed: true, smooth: false }));
          }
          const bob = (1 - app) * -120;
          iron.draw(t, sd + 10, [xa, y + bob], [xb, y + bob], 34, true);
          // hammer strikes (3) + sparks
          let hd = '', hf = '', sp = '';
          if (mk != null && lt >= mk - 0.2 && lt < mk + 2.0) {
            const ph = ((lt - mk) / 0.5), k = ph - Math.floor(ph), down = lt < mk ? 0 : Math.max(0, Math.sin(k * Math.PI));
            const hx = lerp(xa, xb, 0.42), hy = lerp(y - 360, y - 40, down);
            hd = inkPath([[hx, hy], [hx + 200, hy - 160]], { w: 12, seed: sd + 20, t });
            const head = [[hx - 60, hy - 40], [hx + 60, hy - 40], [hx + 60, hy + 22], [hx - 60, hy + 22]];
            hf = inkLoop(head, { seed: sd + 21, t, smooth: false }); hd += ' ' + inkPath(head, { w: 6, seed: sd + 22, t, closed: true, smooth: false });
            if (lt >= mk) { const ks = k < 0.5 ? 0 : (k - 0.5) * 2; if (ks > 0 && ks < 0.8) for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 7), r = 40 + ks * 160; sp += inkPath([[hx + Math.cos(a) * r, y + Math.sin(a) * r * 0.8], [hx + Math.cos(a) * (r + 30), y + Math.sin(a) * (r + 30) * 0.8]], { w: 6, seed: sd + 30 + i, t }) + ' '; } }
          }
          hamL.setAttribute('d', hd); hamF.setAttribute('d', hf); sparks.setAttribute('d', sp);
          // dimension line + length
          const la = P.len ? atOr(cues, P.len.at, null) : null, lp = la != null ? prog(lt, la, 0.7) : 0;
          if (lp > 0.01) {
            const yy = y - 70, xe = lerp(xa, xb, lp);
            dimL.setAttribute('d', inkPath([[xa, yy], [xe, yy]], { w: 5, seed: sd + 40, t }) + ' ' + inkPath([[xa, yy - 22], [xa, yy + 22]], { w: 5, seed: sd + 41, t }) +
              (lp > 0.95 ? ' ' + inkPath([[xb, yy - 22], [xb, yy + 22]], { w: 5, seed: sd + 42, t }) : ''));
            const sp2 = spring(lt, la + 0.4, 0.5), pk = punch(lt, la + 0.4, 0.6);
            lenT.setAttribute('transform', `translate(${f1((xa + xb) / 2)} ${f1(y - 120)}) scale(${(Math.max(0.01, sp2) * (1 + 0.08 * pk)).toFixed(3)}) translate(${f1(-(xa + xb) / 2)} ${f1(-(y - 120))})`);
            lenT.style.opacity = lt > la + 0.4 ? 1 : 0;
          } else { dimL.setAttribute('d', ''); lenT.style.opacity = 0; }
          // weight tag
          const wa = P.weight ? atOr(cues, P.weight.at, null) : null;
          if (wa != null && lt >= wa) {
            const p = spring(lt, wa, 0.5), sw = Math.sin((lt - wa) * 3.2) * 14 * Math.exp(-(lt - wa) * 0.5) + Math.sin(lt * 1.3) * 3;
            const px = lerp(xa, xb, 0.18), py = y + 14, L = 150 * p;
            const ex = px + Math.sin(sw * Math.PI / 180) * L, ey = py + Math.cos(sw * Math.PI / 180) * L;
            strG.setAttribute('d', inkPath([[px, py], [ex, ey]], { w: 4, seed: sd + 50, t }));
            tagG.style.display = '';
            tagG.setAttribute('transform', `translate(${f1(ex)} ${f1(ey + 56)}) rotate(${f1(sw)}) scale(${Math.max(0.01, p).toFixed(3)})`);
            const tb = [[-130, -56], [130, -56], [130, 56], [-130, 56]];
            tagF.setAttribute('d', inkLoop(tb, { seed: sd + 51, t, smooth: false }));
            tagL.setAttribute('d', inkPath(tb, { w: 6, seed: sd + 52, t, closed: true, smooth: false }) + ' ' + inkCircle(0, -36, 9, sd + 53, t, { w: 4 }));
          } else { strG.setAttribute('d', ''); tagG.style.display = 'none'; }
          // the point
          const pa = P.point ? atOr(cues, P.point, null) : null;
          if (pa != null && lt >= pa) {
            const p = spring(lt, pa, 0.5), r = 90 * p * (1 + 0.1 * punch(lt, pa, 0.5));
            ring.setAttribute('d', inkCircle(xb - 40, y, r, sd + 60, t, { w: 8, ry: r * 0.8 }));
            const gs = 1 + 0.3 * Math.sin(lt * 8);
            gleam.setAttribute('d', inkLoop(PGA.burst(xb + 6, y - 6, 34 * gs * p, sd + 61, t, 4), { seed: sd + 62, t, smooth: false }));
          } else { ring.setAttribute('d', ''); gleam.setAttribute('d', ''); }
        };
      } else {
        // portrait
        const cx = (P.x ?? 0.42) * W, cy = (P.y ?? 0.42) * H, rx = (P.rx ?? 0.15) * W, ry = (P.ry ?? 0.3) * H;
        const id = 'pgaclip' + sd;
        const cp = el(defs || svg, 'clipPath', { id });
        const cpE = el(cp, 'ellipse', { cx: 0, cy: 0, rx: rx - 10, ry: ry - 10 });
        const swing = el(cam, 'g');
        const nail = inkEl(cam, INK.ink), string = inkEl(cam, INK.inkSoft);
        const frameF = inkEl(swing, INK.gold), back = inkEl(swing, INK.paperLight), inner = el(swing, 'g', { 'clip-path': `url(#${id})` });
        const hatch = inkEl(inner, INK.paperDark, { 'fill-opacity': 0.6 });
        const figG = el(inner, 'g');
        const FG = Object.assign({ head: 'none' }, P.figure || {});
        const fig = PGA.gage(figG, { scale: (P.sit_scale ?? 1.25), seed: sd + 70, head: FG.head, bandage: !!FG.bandage, beard: FG.beard });
        const ironG = el(inner, 'g'), iron = PGA.iron(ironG);
        const frameL = inkEl(swing), plateF = inkEl(swing, INK.gold), plateL = inkEl(swing);
        const nameT = el(swing, 'text', { x: 0, y: ry + 72, 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
        nameT.textContent = (P.name && P.name.text) || 'PHINEAS GAGE';
        upd = (lt, t, cues, hit) => {
          const app = spring(lt, 0, 0.7), sw = Math.sin(lt * 1.9) * 2.2 * Math.exp(-lt * 0.25) + Math.sin(lt * 0.8) * 0.8;
          const ny = cy - ry - 110;
          swing.setAttribute('transform', `translate(${f1(cx)} ${f1(cy - (1 - app) * 700)}) rotate(${f1(sw)} 0 ${f1(ny - cy)})`);
          nail.setAttribute('d', inkDot(cx, ny, 12, 12, sd + 1, t));
          const ca = sw * Math.PI / 180;
          const lft = [cx + Math.cos(ca) * -rx * 0.5 - Math.sin(ca) * -ry * 0.75, cy - (1 - app) * 700 - ry * 0.85];
          const rgt = [cx + Math.cos(ca) * rx * 0.5, cy - (1 - app) * 700 - ry * 0.85];
          string.setAttribute('d', inkPath([lft, [cx, ny], rgt], { w: 4, seed: sd + 2, t }));
          const oe = inkEllipsePts(0, 0, rx + 26, ry + 26, sd + 3, 22), ie = inkEllipsePts(0, 0, rx - 6, ry - 6, sd + 4, 22);
          frameF.setAttribute('d', inkLoop(oe, { seed: sd + 3, t, amp: 1 }));
          back.setAttribute('d', inkLoop(ie, { seed: sd + 4, t, amp: 1 }));
          frameL.setAttribute('d', inkPath(oe, { w: 7, seed: sd + 5, t, closed: true }) + ' ' + inkPath(ie, { w: 6, seed: sd + 6, t, closed: true }) + ' ' +
            inkPath(inkEllipsePts(0, 0, rx + 10, ry + 10, sd + 7, 22), { w: 3, seed: sd + 8, t, closed: true }));
          let hd = '';
          for (let i = 0; i < 14; i++) { const x = -rx + i * rx / 7; hd += inkPath([[x, ry], [x + 120, ry - 220]], { w: 3, seed: sd + 20 + i, t }) + ' '; }
          hatch.setAttribute('d', hd);
          const f = fig.update(t, 'hold', { x: -rx * 0.22, y: ry * 1.32, face: 1, since: lt, emotion: 'neutral' });
          const hx = (f.hands[0][0] + f.hands[1][0]) / 2, hy = (f.hands[0][1] + f.hands[1][1]) / 2;
          const tipX = f.head[0] + f.headR * 1.9, tipY = -ry * 0.95, m = (tipY - hy) / Math.max(1, tipX - hx);
          iron.draw(t, sd + 30, [hx + (ry * 1.1 - hy) / m, ry * 1.1], [tipX, tipY], 26, true);
          const pl = [[-290, ry + 30], [290, ry + 30], [290, ry + 110], [-290, ry + 110]];
          plateF.setAttribute('d', inkLoop(pl, { seed: sd + 40, t, smooth: false }));
          plateL.setAttribute('d', inkPath(pl, { w: 6, seed: sd + 41, t, closed: true, smooth: false }));
          const na = P.name ? atOr(cues, P.name.at, 0.4) : 0.4, np = spring(lt, na, 0.5), pk = punch(lt, na, 0.6);
          nameT.setAttribute('transform', `translate(0 ${f1(ry + 72)}) scale(${(Math.max(0.01, np) * (1 + 0.08 * pk)).toFixed(3)}) translate(0 ${f1(-(ry + 72))})`);
          fitOnce();
        };
        let fitted = false;
        const fitOnce = () => { if (fitted) return; fitted = true; try { const w = nameT.getComputedTextLength(); if (w > 520) nameT.setAttribute('font-size', Math.max(44, Math.floor(52 * 520 / w))); } catch (e) {} };
      }
      const castG = el(cam, 'g');
      const cs = cast(castG, (P.cast || []).concat(KZ ? [KZ] : []), W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.5] }, hit);
          upd(lt, t, cues, hit);
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
