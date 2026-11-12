// mq_swarm: people outdoors on a summer evening (or a night) with mosquito swarms buzzing round some of them,
// parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, time)). Hatless figures in
// sweaters stand on the set's ground; a person (or the fez host) with a swarm flaps one arm at his head, worried, while
// the others stand calm. Each swarm can fly in on a cue. Big grass and flowers fill the foreground down to the frame
// bottom. Leaves sky and ground to the scene's "set".
// P: {gy: 0.6 (ground line, 0..1 H), front: 0.61 (grass top, 0..1 H) | false,
//     people: [{x: 0.7, scale: 1.2, col: "gold"|"blue"|"green"|"red"|"ink", hair: "dark"|"white", glasses: false,
//               face: "left"|"right", swarm: 0 (mosquitoes), kind: "aedes"|"tiger"|"culex", at: cue|sec (swarm flies in),
//               rx: 230, ry: 170, ms: 0.5 (mosquito scale), lift: 120 (swarm centre above the head, px), flap: true}],
//     kasif: {x, y, scale, pose, face, dir, emotion, seq: [...], swarm: 0, kind, at, rx, ry, ms, ring: false, lift: 90 (swarm centre, px above
//             the head centre), dx: 0 (px)} | null,
//     magnet: {x: 0.5, y: 0.22, size: 110, at} (a red horseshoe magnet with pulsing pull arcs below it) | null,
//     labels: [{text, x, y, size, color, at, rot, card, font}] (see LH.label)}
// cues: whatever names the swarms / labels / Kaşif seq use. Needs lh__lib.js (LH) and mq__lib.js (MQ).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mq_swarm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, Q = window.MQ, sd = seed * 1000 + 811, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const COL = { gold: mix(INK.gold, INK.stain, 0.3), blue: mix(INK.blue, INK.paperDark, 0.3), green: mix(INK.green, INK.paperDark, 0.25), red: mix(INK.red, INK.paperDark, 0.25), ink: mix(INK.inkSoft, INK.ink, 0.3) };
      const shadows = inkEl(root, mix(INK.paperDark, INK.ink, 0.25), { 'fill-opacity': 0.35 });
      const people = (P.people || []).map((p, i) => ({ p, fig: L.person(el(root, 'g'), sd + 10 + i * 7, { kind: 'sweater', hair: p.hair || 'dark', glasses: !!p.glasses, col: COL[p.col] || COL.blue }) }));
      const K = P.kasif || null;
      const kas = K ? L.kasif(el(root, 'g'), K, W, H, sd + 3) : null;
      const swarms = [];
      people.forEach((q, i) => { if (q.p.swarm) swarms.push({ who: q, s: Q.swarm(el(root, 'g'), q.p.swarm, sd + 100 + i * 31, q.p.kind || 'aedes'), o: q.p }); });
      if (K && K.swarm) swarms.push({ who: 'kasif', s: Q.swarm(el(root, 'g'), K.swarm, sd + 400, K.kind || 'aedes'), o: K });
      const mg = !!P.magnet;
      const mgP = inkEl(root, INK.red), mgF = inkEl(root, INK.red), mgT = inkEl(root, INK.paperLight), mgR = inkEl(root);
      const fr = P.front === false ? null : L.front(el(root, 'g'), sd + 60, 'grass');
      const labels = (P.labels || []).map(o => L.label(root, o, W, H));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const SHD = [];
          const heads = new Map();
          people.forEach(({ p, fig }, i) => {
            const x = (p.x ?? 0.7) * W, s = (p.scale ?? 1.2) * u, fc = L.faceOf(p.face, 1);
            const at = L.atOr(cues, p.at, 0), bugged = p.swarm && p.flap !== false && lt >= at + 0.4;
            const hcG = [x + 30 * s * fc, gy - 455 * s];
            const swat = Math.sin(t * 9 + i) * 0.5 + 0.5;
            const pose = { face: fc, lean: bugged ? -3 : 0, brow: bugged ? 0.9 : 0, look: bugged ? [0, -8] : [0, 0] };
            if (bugged) pose.armR = [hcG[0] + (30 + 60 * swat) * s * fc, hcG[1] - (40 + 50 * swat) * s];
            const r = fig.update(t, x, gy, s, pose);
            heads.set(i, r.hc);
            SHD.push(inkLoop(inkEllipsePts(x + 10 * s, gy + 4 * s, 120 * s, 18 * s, sd + 200 + i, 10), { seed: sd + 210 + i, t, amp: 0.6 }));
          });
          let kh = null;
          if (kas) {
            const kr = kas.update(lt, t, cues) || {};
            const ks = (K.scale ?? 1) * u, kf = L.faceOf(K.face, 1), rh = kr.head || [0, -420];
            const hd = [(K.x ?? 0.5) * W + kf * ks * rh[0], (K.y ?? 0.6) * H + ks * rh[1]];
            kh = [hd[0] + (K.dx ?? 0) * u, hd[1] - (K.lift ?? 90) * u];
            SHD.push(inkLoop(inkEllipsePts((K.x ?? 0.5) * W, (K.y ?? 0.6) * H + 4, 130 * ks, 20 * ks, sd + 300, 10), { seed: sd + 301, t, amp: 0.6 }));
          }
          shadows.setAttribute('d', SHD.join(' '));
          swarms.forEach(({ who, s, o }, j) => {
            const c = who === 'kasif' ? kh : heads.get(people.indexOf(who));
            if (!c) return;
            const at = L.atOr(cues, o.at, 0), ar = clamp01((lt - at) / 1.1);
            const from = [c[0] < W / 2 ? -160 : W + 160, c[1] - 260 * u];
            s.update(t, c[0], who === 'kasif' ? c[1] : c[1] - (o.lift ?? 120) * u, (o.rx ?? 230) * u, (o.ry ?? 170) * u, (o.ms ?? 0.5) * u, { arrive: lt < at ? 0 : ar, from, ring: !!o.ring });
          });
          if (mg) {
            const M = P.magnet, a = L.atOr(cues, M.at, 0), sp = spring(lt, a, 0.5) * (1 + 0.1 * punch(lt, a, 0.7));
            if (lt < a) { mgF.setAttribute('d', ''); mgT.setAttribute('d', ''); mgR.setAttribute('d', ''); mgP.setAttribute('d', ''); }
            else {
              const x = (M.x ?? 0.5) * W, y = (M.y ?? 0.22) * H + Math.sin(t * 2) * 6 * u, R = (M.size ?? 110) * u * sp, th = R * 0.42, k = sd + 500;
              const arc = (rr, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const q = Math.PI * (1 + i / n); return [x + Math.cos(q) * rr, y + Math.sin(q) * rr]; });
              const outer = arc(R + th / 2), inner = arc(R - th / 2).reverse();
              const leg = (sg) => [[x + sg * (R + th / 2), y], [x + sg * (R - th / 2), y], [x + sg * (R - th / 2), y + R * 0.7], [x + sg * (R + th / 2), y + R * 0.7]];
              const U = outer.concat([[x + R + th / 2, y + R * 0.7], [x + R - th / 2, y + R * 0.7]], inner, [[x - R + th / 2, y + R * 0.7], [x - R - th / 2, y + R * 0.7]]);
              mgF.setAttribute('d', inkLoop(U, { seed: k, t, smooth: false, amp: 1 }));
              const tip = sg => [[x + sg * (R + th / 2), y + R * 0.7], [x + sg * (R - th / 2), y + R * 0.7], [x + sg * (R - th / 2), y + R * 1.0], [x + sg * (R + th / 2), y + R * 1.0]];
              mgT.setAttribute('d', inkLoop(tip(1), { seed: k + 1, t, smooth: false }) + ' ' + inkLoop(tip(-1), { seed: k + 2, t, smooth: false }));
              mgR.setAttribute('d', inkPath(U, { w: 6, seed: k + 3, t, closed: true, smooth: false }) + ' ' + inkPath(tip(1), { w: 5, seed: k + 4, t, closed: true, smooth: false }) + ' ' + inkPath(tip(-1), { w: 5, seed: k + 5, t, closed: true, smooth: false }));
              const PL = [];
              for (let i = 0; i < 3; i++) { const ph = ((t * 0.9) + i / 3) % 1, rr = R * (0.6 + ph * 1.4), yy = y + R * 1.1 + ph * R * 1.1; PL.push(inkPath(Array.from({ length: 7 }, (_, j) => { const q = Math.PI * (0.2 + 0.6 * j / 6); return [x + Math.cos(q) * rr, yy + Math.sin(q) * rr * 0.25 - rr * 0.1]; }), { w: 5 * (1 - ph) + 1, seed: k + 10 + i, t })); }
              mgP.setAttribute('d', PL.join(' '));
            }
          }
          if (fr) fr.update(t, W, H, (P.front ?? 0.61) * H);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
