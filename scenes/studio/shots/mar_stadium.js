// mar_stadium: the 1904 Olympic stadium in parchment ink (Stickstory "1904 Olympic marathon"): a wooden grandstand full
// of spectators (hats, bunting) that jump and wave on the cheer cue, the cinder track in front, an optional finish tape
// that breaks, a starter's pistol puff, runners / officials / the President's daughter with a wreath, and the narrator.
// Set: "city". Uses mar__lib.js (MAR) + td__lib.js (TD.label).
// P: {ground: 0.8, stands: {x0: -0.02, x1: 1.02, top: 0.36, base: 0.64, rows: 3} | false, cheer: cue | {at, until} | 0..1,
//     track: true, tape: {x: 0.62, h: 170, break: cue} | false, pistol: {x, y (0..1), at: cue},
//     people: [MAR.person specs], grips: [[i, j]] (person i holds person j's arm), kasif: person spec, labels: [TD.label specs]}
// mar_finish: the same stadium, used for the finish-line scenes (tape).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mar_stadium = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MAR, TD = window.TD, atOr = M.atOr, sd = seed * 1000 + 733;
      const G = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g');
      const standG = el(root, 'g'), trackG = el(root, 'g'), tapeG = el(root, 'g'), peopleG = el(root, 'g'), topG = el(root, 'g');
      const ST = P.stands === false ? null : Object.assign({ x0: -0.02, x1: 1.02, top: 0.36, base: 0.64, rows: 3 }, P.stands || {});
      const stands = ST ? M.stands(standG, sd + 1) : null;
      const trackF = inkEl(trackG, INK.paperDark), trackR = inkEl(trackG), lanes = inkEl(trackG, INK.paperLight), rail = inkEl(trackG);
      const TP = P.tape ? Object.assign({ x: 0.62, h: 170 }, P.tape) : null, tape = TP ? M.tape(tapeG, sd + 2) : null;
      const PS = P.pistol ? Object.assign({ x: 0.2, y: 0.4 }, P.pistol) : null, puff = PS ? M.puff(topG, sd + 3) : null;
      const people = (P.people || []).map((K, i) => M.person(peopleG, Object.assign({ y: P.ground ?? 0.8 }, K), sd + 100 + i * 7));
      const kas = P.kasif ? M.person(topG, Object.assign({ x: 0.86, y: P.ground ?? 0.8, scale: 0.9, pose: 'point', face: 'left', dir: 20 }, P.kasif, { hat: true }), sd + 90) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(topG, L, W, H, sd + 400 + i));
      const gripE = inkEl(peopleG, INK.ink);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          let ch = 0;
          if (typeof P.cheer === 'number') ch = P.cheer;
          else if (typeof P.cheer === 'string') ch = prog(lt, atOr(cues, P.cheer, 0), 0.4);
          else if (P.cheer) { const a = atOr(cues, P.cheer.at, 0), b = P.cheer.until != null ? atOr(cues, P.cheer.until, 1e9) : 1e9; ch = prog(lt, a, 0.4) * (1 - prog(lt, b, 0.5)); ch = Math.max(ch, P.cheer.base ?? 0); }
          if (stands) stands.update(t, { x0: ST.x0 * W, x1: ST.x1 * W, top: ST.top * H, base: ST.base * H, rows: ST.rows, cheer: ch, per: ST.per });
          if (P.track !== false) {
            const top = (ST ? ST.base * H : G - 160) + 4, tp = [[-20, top], [W + 20, top], [W + 20, H + 20], [-20, H + 20]];
            trackF.setAttribute('d', inkLoop(tp, { seed: sd + 5, t, smooth: false }));
            trackR.setAttribute('d', inkPath([[-20, top], [W + 20, top]], { w: 7, seed: sd + 6, t }));
            let ld = '';
            for (let k = 0; k < 3; k++) ld += inkPath([[-20, G - 120 + k * 80], [W + 20, G - 120 + k * 80 + 4]], { w: 5, seed: sd + 7 + k, t }) + ' ';
            lanes.setAttribute('d', ld);
            let rd = inkPath([[-20, top + 46], [W + 20, top + 46]], { w: 5, seed: sd + 12, t });
            for (let x = 30; x < W; x += 140) rd += ' ' + inkPath([[x, top + 2], [x, top + 50]], { w: 5, seed: sd + 13 + x, t });
            rail.setAttribute('d', rd);
          }
          if (tape) tape.update(t, TP.x * W, G, TP.h, TP.break != null ? prog(lt, atOr(cues, TP.break, 1e9), 0.5) : 0);
          if (puff) { const a = atOr(cues, PS.at, null); puff.update(t, PS.x * W, PS.y * H, a == null ? 0 : (lt - a) / 1.6); }
          const outs = people.map(p => p && p.update(lt, t, cues, W, H, {}));
          let gd = '';
          (P.grips || []).forEach(([i, j], k) => { const a = outs[i], b = outs[j]; if (!a || !b) return; const sh = [lerp(b.hip[0], b.head[0], 0.62), lerp(b.hip[1], b.head[1], 0.62)]; gd += inkPath([a.hand2, [lerp(a.hand2[0], sh[0], 0.5), lerp(a.hand2[1], sh[1], 0.5) + 10], sh], { w: 7, seed: sd + 700 + k, t }) + ' ' + inkDot(sh[0], sh[1], 11, 11, sd + 720 + k, t) + ' '; });
          gripE.setAttribute('d', gd);
          if (kas) kas.update(lt, t, cues, W, H, {});
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
  SH.mar_finish = { kind: '2d', build: SH.mar_stadium.build };
})();
