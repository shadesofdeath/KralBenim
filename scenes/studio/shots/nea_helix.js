// nea_helix: a big turning DNA double helix drawn in ink (Neanderthal DNA Short). Two backbones wind down the frame
// (back half pale and thin, front half dark and thick: depth), with base-pair rungs between them. On the mark cue
// one rung in fifty (2%) lights up gold with a ring, a hand-written note and arrow, and a big percentage springs in.
// P: {x: 0.5, top: 330, bottom: 1130 (stage px), amp: 200, turns: 2.4, rungs: 50, spin: 0.35 (turns per second),
//     mark: {at: cue|s, rung: 31 (index from the top), n: 1}, big: {text: "2%", x: 0.8, y: 0.3, at: cue, size: 190, color: "red"},
//     labels: [...MCB labels], kasif: {...} | false}
// cues: mark.at / big.at / labels' at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_helix = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, cast, FR } = window.MCB;
      const sd = seed * 1000 + 6200;
      const cx = (P.x ?? 0.5) * W, top = P.top ?? 330, bot = P.bottom ?? 1130, amp = P.amp ?? 200, turns = P.turns ?? 2.4, N = P.rungs ?? 50;
      const root = el(svg, 'g');
      const backA = inkEl(root, INK.inkSoft), rungB = inkEl(root, INK.inkSoft), rungF = inkEl(root, INK.ink);
      const rungC = [inkEl(root, INK.blue), inkEl(root, INK.green)];
      const front = inkEl(root, INK.ink), frontFill = inkEl(root, INK.paperLight);
      const hiGlow = inkEl(root, INK.gold), hiL = inkEl(root, INK.gold), hiRing = inkEl(root, INK.red);
      const bigG = el(root, 'g');
      const BG = P.big || null;
      const bigT = BG ? el(bigG, 'text', { x: 0, y: 0, 'font-family': FR, 'font-size': BG.size ?? 190, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK[BG.color || 'red'] }) : null;
      if (bigT) bigT.textContent = BG.text || '2%';
      const castG = el(root, 'g');
      const cs = P.kasif ? cast(castG, [Object.assign({ who: 'kasif', x: 0.84, y: 0.59, scale: 0.6, pose: 'point', face: 'left' }, P.kasif)], W, H, sd + 300) : null;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const MK = Object.assign({ rung: 31, n: 1 }, P.mark || {});

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ph0 = lt * (P.spin ?? 0.35) * Math.PI * 2;
          const draw = clamp01(lt / 0.7);
          const yAt = u => lerp(top, bot, u);
          // backbones sampled densely; split into back/front pieces by depth
          const strand = off => { const pts = []; for (let i = 0; i <= 160; i++) { const u = i / 160, a = u * turns * Math.PI * 2 + ph0 + off; pts.push({ u, x: cx + Math.sin(a) * amp, y: yAt(u), z: Math.cos(a) }); } return pts; };
          const A = strand(0), B = strand(Math.PI);
          const pieces = (S, wantFront) => { const out = []; let cur = []; for (const p of S) { if (p.u > draw) break; if ((p.z >= 0) === wantFront) cur.push([p.x, p.y]); else { if (cur.length > 1) out.push(cur); cur = []; } } if (cur.length > 1) out.push(cur); return out; };
          let bd = '';
          [A, B].forEach((S, k) => pieces(S, false).forEach((c, i) => { bd += inkPath(c, { w: 10, seed: sd + k * 50 + i, t, amp: 0.8, taper: 0.1 }) + ' '; }));
          backA.setAttribute('d', bd);
          backA.setAttribute('fill-opacity', 0.7);
          // rungs
          const mAt = atOr(cues, MK.at, null), mp = mAt != null ? spring(lt, mAt, 0.5) : 0, mpk = mAt != null ? punch(lt, mAt, 0.7) : 0;
          let rb = '', rf = '', c0 = '', c1 = '', hl = '', hg = '', ring = '';
          for (let i = 0; i < N; i++) {
            const u = (i + 0.5) / N; if (u > draw) break;
            const a = u * turns * Math.PI * 2 + ph0, xa = cx + Math.sin(a) * amp, xb = cx - Math.sin(a) * amp, y = yAt(u);
            const zf = Math.abs(Math.cos(a)), mid = (xa + xb) / 2;
            const isM = i >= MK.rung && i < MK.rung + MK.n && mp > 0.01;
            if (isM) {
              hg += inkLoop(inkEllipsePts(mid, y, Math.max(40, Math.abs(xa - xb) / 2 + 30) * mp, 30 * mp, sd + 200 + i, 14), { seed: sd + 200 + i, t, amp: 1 }) + ' ';
              hl += inkPath([[xa, y], [xb, y]], { w: 20 * (1 + 0.3 * mpk), seed: sd + 210 + i, t, amp: 0.8, taper: 0.05 }) + ' ';
              ring += inkPath(inkEllipsePts(mid, y, (Math.abs(xa - xb) / 2 + 60) * mp, 58 * mp, sd + 220 + i, 18), { w: 8, seed: sd + 220 + i, t, closed: true, amp: 1 }) + ' ';
              continue;
            }
            if (Math.abs(xa - xb) < 14) continue;
            const w = 7 + 4 * zf;
            const seg = [[xa, y], [mid, y]], seg2 = [[mid, y], [xb, y]];
            if (zf < 0.35) rb += inkPath([[xa, y], [xb, y]], { w: 6, seed: sd + 100 + i, t, amp: 0.6, taper: 0.05 }) + ' ';
            else {
              const p1 = inkPath(seg, { w, seed: sd + 100 + i, t, amp: 0.6, taper: 0.05 }), p2 = inkPath(seg2, { w, seed: sd + 150 + i, t, amp: 0.6, taper: 0.05 });
              if (i % 2) { c0 += p1 + ' '; c1 += p2 + ' '; } else { c1 += p1 + ' '; c0 += p2 + ' '; }
              rf += inkCircle(mid, y, 4, sd + 170 + i, t, { fill: true }) + ' ';
            }
          }
          rungB.setAttribute('d', rb); rungB.setAttribute('fill-opacity', 0.55);
          rungC[0].setAttribute('d', c0); rungC[1].setAttribute('d', c1);
          rungF.setAttribute('d', rf);
          hiGlow.setAttribute('d', hg); hiGlow.setAttribute('fill-opacity', 0.35);
          hiL.setAttribute('d', hl); hiRing.setAttribute('d', ring);
          // front backbone: outlined ribbon
          let fd = '', ff = '';
          [A, B].forEach((S, k) => pieces(S, true).forEach((c, i) => {
            fd += inkPath(c, { w: 26, seed: sd + 300 + k * 50 + i, t, amp: 1, taper: 0.15 }) + ' ';
            ff += inkPath(c, { w: 12, seed: sd + 400 + k * 50 + i, t, amp: 0.8, taper: 0.2 }) + ' ';
          }));
          front.setAttribute('d', fd); frontFill.setAttribute('d', ff);
          if (bigT) {
            const ba = atOr(cues, BG.at, mAt ?? 0.5), bp = spring(lt, ba, 0.6), bpk = punch(lt, ba, 0.6);
            bigG.setAttribute('transform', `translate(${NEA.f1((BG.x ?? 0.8) * W)} ${NEA.f1((BG.y ?? 0.3) * H)}) rotate(-4) scale(${(Math.max(0.01, bp) * (1 + 0.1 * bpk)).toFixed(3)})`);
            bigG.style.display = lt < ba ? 'none' : '';
          }
          if (cs) cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
