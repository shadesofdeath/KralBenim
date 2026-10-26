// nea_lab: an ancient-DNA clean lab (Neanderthal DNA Short): a Neanderthal skull (long low braincase, occipital bun,
// heavy brow ridge, big nose opening, no chin) sits on a stand on the bench; a gloved hand brings a dental drill to
// the back of the skull and a stream of bone powder falls into a sample tube, which fills; a rack of tubes waits on
// the side. The room is the scene's "set" (interior); this shot draws the bench, skull, hand, drill and tubes.
// P: {skull: {x: 0.4, y: 0.47, s: 1.15}, bench: 1060 (stage px), drill: cue|s (drill reaches the bone),
//     dust: cue|s (powder starts), labels: [...MCB labels]}
// cues: drill, dust, labels' at; "hit" punches the skull.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const CR = [[-180, 40], [-206, -8], [-196, -70], [-150, -116], [-80, -142], [0, -150], [80, -132], [140, -98], [188, -74], [204, -52], [188, -34], [172, -26], [182, -4], [200, 22], [196, 70], [186, 96], [100, 92], [60, 70], [10, 72], [-40, 66], [-110, 62]];
  const JAW = [[184, 102], [178, 140], [168, 166], [116, 178], [40, 170], [16, 150], [8, 96], [26, 84]];
  const ORB = [140, -12, 40, 34];
  const NAS = [[176, 6], [194, 36], [180, 66], [164, 40]];
  const ZYG = [[118, 32], [60, 40], [0, 44], [-30, 40]];
  const SUT = [[-60, -140], [-50, -112], [-66, -88], [-48, -64]];

  SH.nea_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, rr } = window.MCB;
      const sd = seed * 1000 + 3300;
      const BY = P.bench ?? 1100;
      const SK = Object.assign({ x: 0.56, s: 1.15 }, P.skull || {});
      if (SK.y == null) SK.y = (BY - 190 * SK.s - 12) / H;
      const root = el(svg, 'g');
      const benchF = inkEl(root, INK.paperDark), benchL = inkEl(root, INK.ink), benchH = inkEl(root, INK.inkSoft);
      const cabF = inkEl(root, INK.paperLight), cabS = inkEl(root, INK.paperDark), cabL = inkEl(root, INK.ink);
      const rack = inkEl(root, INK.paperLight), rackL = inkEl(root, INK.ink), rackT = inkEl(root, INK.blue);
      const skG = el(root, 'g');
      const standF = inkEl(skG, INK.inkSoft), standL = inkEl(skG, INK.ink);
      const boneF = inkEl(skG, mix(INK.paperLight, INK.paperDark, 0.35)), boneS = inkEl(skG, INK.paperDark), holes = inkEl(skG, INK.ink), boneL = inkEl(skG, INK.ink), boneH = inkEl(skG, INK.inkSoft);
      const tubeF = inkEl(root, INK.paperLight), tubeP = inkEl(root, INK.paperDark), tubeL = inkEl(root, INK.ink);
      const dust = inkEl(root, INK.inkSoft);
      const drillF = inkEl(root, INK.paperLight), drillL = inkEl(root, INK.ink), cable = inkEl(root, INK.ink);
      const gloveF = inkEl(root, INK.paperLight), gloveL = inkEl(root, INK.ink), cuff = inkEl(root, INK.blue);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const K = SK.s, X = SK.x * W, Y = SK.y * H, pk = punch(lt, atOr(cues, 'hit', null), 0.6);
          const S = q => [X + q[0] * K, Y + q[1] * K], Sp = a => a.map(S);
          // bench
          benchF.setAttribute('d', inkLoop([[-40, BY], [W + 40, BY - 6], [W + 40, BY + 70], [-40, BY + 76]], { seed: sd + 1, t, amp: 0.8, smooth: false }));
          benchL.setAttribute('d', inkPath([[-40, BY], [W + 40, BY - 6]], { w: 7, seed: sd + 2, t, amp: 1 }) + ' ' + inkPath([[-40, BY + 76], [W + 40, BY + 70]], { w: 5, seed: sd + 3, t, amp: 1 }));
          let bh = ''; for (let i = 0; i < 12; i++) { const x = 40 + i * 90; bh += inkPath([[x, BY + 14], [x + 40, BY + 62]], { w: 3, seed: sd + 4 + i, t, amp: 0.6 }) + ' '; }
          benchH.setAttribute('d', bh);
          // bench front: a cabinet with drawers and handles down to the bottom of the frame
          const ct = BY + 76;
          cabF.setAttribute('d', inkLoop([[-40, ct], [W + 40, ct - 6], [W + 40, H + 20], [-40, H + 20]], { seed: sd + 140, t, amp: 0.8, smooth: false }));
          let cs2 = '', cl = inkPath([[-40, ct + 30], [W + 40, ct + 24]], { w: 4, seed: sd + 141, t, amp: 0.8 });
          [[30, 330], [370, 710], [750, 1050]].forEach(([a, b], i) => {
            [[ct + 50, ct + 190], [ct + 210, ct + 350]].forEach(([y0, y1], j) => {
              const box = rr(a, y0, b - a, y1 - y0, 10);
              cl += ' ' + inkPath(box, { w: 5, seed: sd + 150 + i * 4 + j, t, closed: true, amp: 0.8 });
              cs2 += inkLoop(rr(a + 8, y1 - 26, b - a - 16, 18, 6), { seed: sd + 170 + i * 4 + j, t, amp: 0.5 }) + ' ';
              const hx = (a + b) / 2, hy = (y0 + y1) / 2;
              cl += ' ' + inkPath([[hx - 40, hy], [hx + 40, hy]], { w: 12, seed: sd + 160 + i * 4 + j, t, amp: 0.5 });
            });
          });
          cabS.setAttribute('d', cs2); cabL.setAttribute('d', cl);
          // rack of tubes (right)
          const rx = W * 0.8, ry = BY;
          rack.setAttribute('d', inkLoop(rr(rx - 120, ry - 70, 240, 70, 8), { seed: sd + 20, t, amp: 0.8 }));
          let rl = inkPath(rr(rx - 120, ry - 70, 240, 70, 8), { w: 5, seed: sd + 21, t, closed: true, amp: 0.8 }), rt = '';
          for (let i = 0; i < 4; i++) { const x = rx - 84 + i * 56; rl += ' ' + inkPath(rr(x - 16, ry - 190, 32, 160, 14), { w: 4.5, seed: sd + 22 + i, t, closed: true, amp: 0.6 });
            rt += inkLoop(rr(x - 12, ry - 90 - i * 8, 24, 56 + i * 8, 10), { seed: sd + 30 + i, t, amp: 0.5 }) + ' '; }
          rackL.setAttribute('d', rl); rackT.setAttribute('d', rt); rackT.setAttribute('fill-opacity', 0.55);
          // skull on a stand
          const sc = 1 + 0.03 * pk;
          skG.setAttribute('transform', `translate(${NEA.f1(X)} ${NEA.f1(BY)}) scale(${sc.toFixed(4)}) translate(${NEA.f1(-X)} ${NEA.f1(-BY)})`);
          const stand = [[X - 60, BY], [X - 40, Y + 190 * K], [X + 40, Y + 190 * K], [X + 60, BY]];
          standF.setAttribute('d', inkLoop(stand, { seed: sd + 40, t, amp: 0.6, smooth: false }));
          standL.setAttribute('d', inkPath(stand, { w: 5, seed: sd + 41, t, closed: true, amp: 0.6, smooth: false }) + ' ' + inkPath([[X - 110, Y + 184 * K], [X + 110, Y + 184 * K]], { w: 12, seed: sd + 42, t, amp: 0.6 }));
          boneF.setAttribute('d', inkLoop(Sp(CR), { seed: sd + 50, t, amp: 1 }) + ' ' + inkLoop(Sp(JAW), { seed: sd + 51, t, amp: 1 }));
          boneS.setAttribute('d', inkLoop(Sp([[-180, 40], [-206, -8], [-196, -70], [-150, -60], [-110, 20], [-110, 62]]), { seed: sd + 52, t, amp: 1 }) + ' ' + inkLoop(Sp([[60, 70], [118, 40], [160, 60], [186, 96], [100, 92]]), { seed: sd + 53, t, amp: 0.8 }));
          holes.setAttribute('d', inkLoop(inkEllipsePts(...S([ORB[0], ORB[1]]), ORB[2] * K, ORB[3] * K, sd + 54, 12), { seed: sd + 54, t, amp: 0.8 }) + ' ' + inkLoop(Sp(NAS), { seed: sd + 55, t, amp: 0.8 }) + ' ' + inkCircle(...S([-40, 40]), 13 * K, sd + 56, t, { fill: true }));
          let bl = inkPath(Sp(CR), { w: 8, seed: sd + 57, t, closed: true, amp: 1.2 }) + ' ' + inkPath(Sp(JAW), { w: 7, seed: sd + 58, t, closed: true, amp: 1.2 });
          bl += ' ' + inkPath(Sp(ZYG), { w: 6, seed: sd + 59, t, amp: 1 }) + ' ' + inkPath(Sp([[150, -70], [196, -56]]), { w: 12, seed: sd + 60, t, amp: 0.8 });
          for (let i = 0; i < 6; i++) { const x = 116 + i * 13; bl += ' ' + inkPath(Sp([[x, 92], [x + 1, 108]]), { w: 4, seed: sd + 61 + i, t, amp: 0.4 }); }
          boneL.setAttribute('d', bl);
          let hh = inkPath(Sp(SUT), { w: 3.5, seed: sd + 70, t, amp: 0.8 });
          for (let i = 0; i < 8; i++) hh += ' ' + inkPath(Sp([[-190 + i * 14, -40 + i * 6], [-170 + i * 14, 30 + i * 2]]), { w: 3, seed: sd + 71 + i, t, amp: 0.6 });
          boneH.setAttribute('d', hh);
          // drill + glove: comes in from the top right, the bit touches the back of the skull
          const target = S([-200, -24]), dAt = atOr(cues, P.drill, 0.6), dp = spring(lt, dAt - 0.6, 0.7);
          const back = 1 - Math.min(1, dp), buzz = lt > dAt ? Math.sin(t * 70) * 2.5 : 0;
          const D = (dx, dy) => [tipP[0] - dx, tipP[1] - dy];          // up-left of the tip
          const tipP = [target[0] - 4 - back * 380 + buzz, target[1] - 8 - back * 380];
          const bodyA = D(44, 44), bodyB = D(230, 230);
          drillF.setAttribute('d', inkPath([bodyA, bodyB], { w: 46, seed: sd + 80, t, amp: 0.6, taper: 0.02 }));
          drillL.setAttribute('d', inkPath([tipP, bodyA], { w: 8, seed: sd + 81, t, amp: 0.4 }) + ' ' + inkPath([[bodyA[0] - 16, bodyA[1] + 16], [bodyB[0] - 16, bodyB[1] + 16]], { w: 5, seed: sd + 82, t, amp: 0.6 }) + ' ' +
            inkPath([[bodyA[0] + 16, bodyA[1] - 16], [bodyB[0] + 16, bodyB[1] - 16]], { w: 5, seed: sd + 83, t, amp: 0.6 }));
          cable.setAttribute('d', inkPath([bodyB, [bodyB[0] - 80, bodyB[1] - 20], [-60, bodyB[1] - 160]], { w: 9, seed: sd + 84, t, amp: 1 }));
          // glove gripping the drill body (from the upper left)
          const gc = D(140, 110);
          const glove = [[60, -10], [40, -50], [0, -60], [-50, -30], [-120, 20], [-100, 70], [-30, 60], [30, 40]].map(q => [gc[0] + q[0], gc[1] + q[1]]);
          gloveF.setAttribute('d', inkLoop(glove, { seed: sd + 85, t, amp: 1 }));
          gloveL.setAttribute('d', inkPath(glove, { w: 6, seed: sd + 86, t, closed: true, amp: 1 }) + ' ' + [0, 1, 2].map(i => inkPath([[gc[0] + 30 - i * 22, gc[1] - 46 + i * 6], [gc[0] + 6 - i * 22, gc[1] + 6 + i * 8]], { w: 4, seed: sd + 87 + i, t, amp: 0.5 })).join(' '));
          cuff.setAttribute('d', inkPath([[gc[0] - 96, gc[1] - 10], [-60, gc[1] + 150]], { w: 90, seed: sd + 90, t, amp: 0.8, taper: 0.02 }));
          // sample tube under the drill site + powder
          const tx = target[0] - 60, ty = BY;
          const tube = rr(tx - 34, ty - 230, 68, 230, 30);
          const duAt = atOr(cues, P.dust, dAt + 0.15), fillP = clamp01((lt - duAt) / Math.max(0.6, dur - duAt));
          tubeF.setAttribute('d', inkLoop(tube, { seed: sd + 100, t, amp: 0.6 })); tubeF.setAttribute('fill-opacity', 0.8);
          tubeP.setAttribute('d', fillP > 0 ? inkLoop(rr(tx - 26, ty - 16 - 110 * fillP, 52, 110 * fillP + 8, 20), { seed: sd + 101, t, amp: 0.5 }) : '');
          tubeL.setAttribute('d', inkPath(tube, { w: 6, seed: sd + 102, t, closed: true, amp: 0.6 }) + ' ' + inkPath([[tx - 48, ty - 230], [tx + 48, ty - 230]], { w: 10, seed: sd + 103, t, amp: 0.5 }));
          let dd = '';
          if (lt > duAt) for (let i = 0; i < 18; i++) {
            const life = 0.7, ph = ((t * 1.0 + i / 18 * life) % life) / life;
            const x = lerp(target[0] - 6, tx, ph) + Math.sin(i * 2.3 + t * 4) * 8, y = lerp(target[1] + 10, ty - 100, ph);
            dd += inkDot(x, y, 4, 4, sd + 110 + i, t, 0.3) + ' ';
          }
          dust.setAttribute('d', dd);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
