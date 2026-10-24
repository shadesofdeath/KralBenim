// an_brothers: four princes and an empty throne (parchment ink, brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via
// _ink.js; pure function of (seed, lt), no Math.random). Written for 02-ankara-savasi-1402 (the Ottoman Interregnum,
// 1402-1413), but parametric: any succession fight. 16:9 first; portrait scales the same layout. Needs mcB__lib.js (MCB).
// Middle: a stepped dais and a tall throne with gold finials and a red cushion; on the cushion the sultan's turban
// (a tall white kavuk with a red band, a gold jewel and a plume). Princes (KASIF rigs, hatless, turban, beard varies)
// stand two on each side, each holding a sword (drawn from the hand along the forearm), names in Patrick Hand above.
//   mode "fight": each prince walks in from his side and arrives on his `at` cue (name appears); on `fight` the two
//     pairs turn on each other and duel (swords clash, gold sparks), from `hit` the throne shakes and the turban trembles.
//   mode "unite": all four already stand there; on `win` the other three turn and walk off-stage, the winner walks to
//     the throne, climbs the dais and waves, the turban flies onto his head; `badge` ("1413") drops in; `hit` = gold burst.
// P: {mode: "fight"|"unite",
//     princes: [{name: "Süleyman", at: cue, x: 0.35, from: -0.1, beard: "black"|"grey"|"short", scale: 1, face}],
//     fight: cue (default hit - 1.2 s), hit: cue ("hit"), win: cue ("win"), winner: 3 (index),
//     badge: {text: "1413", at, color: "red"|"blue"|"gold"} | false,
//     throne: {x: 0.5, scale: 1}, floor: 0.82 (ground line, 0..1 H),
//     kasif: {...MCB cast entry: x: 0.93, scale: 0.55, pose, face: "left", at, then, emotion, seq} | false,
//     cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.55]}}
// cues: fight, hit, win, badge.at, princes[].at, plus kasif/cast/label names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const COLS = { red: INK.red, blue: INK.blue, gold: INK.gold, ink: INK.ink };
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  SH.an_brothers = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 6230, portrait = H > W;
      const mode = P.mode === 'unite' ? 'unite' : 'fight';
      const U = portrait ? W / 1920 * 1.45 : H / 1080;
      const GY = (P.floor ?? (portrait ? 0.6 : 0.82)) * H;
      const TH = Object.assign({ x: 0.5, scale: 1 }, P.throne || {});
      const TS = TH.scale * U, cx = TH.x * W;
      const FY = GY - 84 * TS, SY = FY - 128 * TS, BH = 330 * TS, BW = 118 * TS, SW = 150 * TS;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (fill = INK.ink, extra) => inkEl(cam, fill, extra);
      const floorL = mk(INK.inkSoft), daisF = mk(INK.paperDark), daisL = mk();
      const thG = el(cam, 'g');
      const tk = (fill = INK.ink) => inkEl(thG, fill);
      const backF = tk(INK.paperLight), backIn = tk(INK.inkSoft), backL = tk(), finF = tk(INK.gold), finL = tk();
      const seatF = tk(INK.paperLight), seatL = tk(), cushF = tk(INK.red), cushL = tk(), legF = tk(INK.gold), legL = tk();
      const turbG = el(cam, 'g');
      const turbF = inkEl(turbG, INK.paperLight), turbBand = inkEl(turbG, INK.red), turbL = inkEl(turbG), turbJ = inkEl(turbG, INK.gold), turbPl = inkEl(turbG, INK.inkSoft);
      const princeG = el(cam, 'g'), swordsG = el(cam, 'g');
      const swF = inkEl(swordsG, INK.paperLight), swL = inkEl(swordsG), spark = inkEl(swordsG, INK.gold), burst = inkEl(cam, INK.gold);
      const nameG = el(cam, 'g'), castG = el(cam, 'g');
      const badgeG = el(root, 'g'), badgeF = inkEl(badgeG, INK.paperLight), badgeR = inkEl(badgeG, INK.red);
      const BG = Object.assign({ text: '1413', color: 'red' }, P.badge || {});
      const badgeTx = el(badgeG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': Math.round(66 * U),
        'text-anchor': 'middle', 'dominant-baseline': 'central', fill: COLS[BG.color] || INK.red });
      badgeTx.textContent = BG.text;

      const defX = [0.36, 0.2, 0.64, 0.8], defBeard = ['black', 'short', 'black', 'short'];
      const PR = (P.princes || []).slice(0, 4).map((p, i) => {
        const x = p.x ?? defX[i], side = x < TH.x ? -1 : 1;
        const sc = (portrait ? 0.8 : 0.7) * (p.scale || [1.04, 0.96, 1, 1.02][i] || 1) * U;
        const rig = KASIF.create(el(princeG, 'g'), { scale: sc, hat: false, accessory: p.accessory || 'turban', beard: p.beard || defBeard[i], seed: seed + 31 + i * 9 });
        const nm = el(nameG, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': Math.max(44, Math.round((p.size || 60) * U)), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 10px; stroke-linejoin: round` });
        nm.textContent = p.name || '';
        return { p, i, x, side, sc, rig, nm, from: p.from ?? (side < 0 ? -0.08 : 1.08) };
      });
      // duel pairs: the two princes on each side face each other
      const pairOf = i => { const s = PR[i].side; const o = PR.find(q => q !== PR[i] && q.side === s); return o || null; };
      const castList = (P.cast || []).slice();
      if (P.kasif !== false) castList.push(Object.assign({ who: 'kasif', x: 0.94, y: GY / H, scale: portrait ? 0.7 : 0.55, pose: 'idle', face: 'left' }, P.kasif || {}));
      const cs = cast(castG, castList, W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      const r0 = rng(sd + 9), tiles = [];
      for (let i = 0; i < 9; i++) tiles.push([r0() * W, GY + 22 + r0() * 50, 40 + r0() * 50]);

      function sword(res, x, y, f, px, out, kk, t) {    // blade from the right hand along shoulder -> hand
        const X = q => [x + f * px * q[0], y + px * q[1]];
        const hand = X(res.hands[1]), sho = X([res.hip[0] + 6, res.hip[1] - 112]);
        let dx = hand[0] - sho[0], dy = hand[1] - sho[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const len = 210 * px, tip = [hand[0] + dx * len, hand[1] + dy * len], pm = [-dy, dx];
        out.f.push(inkLoop([[hand[0] + pm[0] * 9 * px + dx * 20 * px, hand[1] + pm[1] * 9 * px + dy * 20 * px], tip, [hand[0] - pm[0] * 9 * px + dx * 20 * px, hand[1] - pm[1] * 9 * px + dy * 20 * px]], { seed: sd + 700 + kk, t, amp: 0.8, smooth: false }));
        out.l.push(inkPath([[hand[0] + pm[0] * 9 * px + dx * 20 * px, hand[1] + pm[1] * 9 * px + dy * 20 * px], tip, [hand[0] - pm[0] * 9 * px + dx * 20 * px, hand[1] - pm[1] * 9 * px + dy * 20 * px]], { w: 4, seed: sd + 710 + kk, t, amp: 0.8, smooth: false }));
        out.l.push(inkPath([[hand[0] + pm[0] * 30 * px + dx * 16 * px, hand[1] + pm[1] * 30 * px + dy * 16 * px], [hand[0] - pm[0] * 30 * px + dx * 16 * px, hand[1] - pm[1] * 30 * px + dy * 16 * px]], { w: 8, seed: sd + 720 + kk, t, amp: 0.8 }));
        return tip;
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = atOr(cues, P.hit ?? 'hit', dur * 0.75);
          const fightAt = mode === 'fight' ? atOr(cues, P.fight ?? 'fight', Math.max(0.5, hitAt - 1.2)) : null;
          const winAt = mode === 'unite' ? atOr(cues, P.win ?? 'win', dur * 0.45) : null;
          const hit = punch(lt, hitAt, 0.6);
          const shake = mode === 'fight' && lt >= hitAt ? Math.exp(-(lt - hitAt) * 0.8) * 0.8 + 0.25 : 0;
          // floor + dais
          let fl = inkPath([[-40, GY], [W + 40, GY]], { w: 5, seed: sd + 1, t, amp: 1.2 });
          tiles.forEach((q, i) => { fl += ' ' + inkPath([[q[0], q[1]], [q[0] + q[2], q[1] - 3]], { w: 3, seed: sd + 2 + i, t, amp: 0.8 }); });
          floorL.setAttribute('d', fl);
          const d1 = [[cx - SW * 1.55, GY], [cx - SW * 1.55, GY - 42 * TS], [cx + SW * 1.55, GY - 42 * TS], [cx + SW * 1.55, GY]];
          const d2 = [[cx - SW * 1.25, GY - 42 * TS], [cx - SW * 1.25, FY], [cx + SW * 1.25, FY], [cx + SW * 1.25, GY - 42 * TS]];
          daisF.setAttribute('d', inkLoop(d1, { seed: sd + 10, t, amp: 1, smooth: false }) + ' ' + inkLoop(d2, { seed: sd + 11, t, amp: 1, smooth: false }));
          daisL.setAttribute('d', inkPath(d1, { w: 5, seed: sd + 12, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkPath(d2, { w: 5, seed: sd + 13, t, amp: 1.2, closed: true, smooth: false }));
          // throne (shakes in the fight)
          const tr = shake * Math.sin(lt * 31) * 2.2, tx = shake * Math.sin(lt * 47) * 5;
          thG.setAttribute('transform', `translate(${f1(tx)} 0) rotate(${tr.toFixed(2)} ${f1(cx)} ${f1(FY)})`);
          const back = [[cx - BW, SY], [cx - BW, SY - BH * 0.72], [cx - BW * 0.8, SY - BH * 0.9], [cx - BW * 0.4, SY - BH * 0.99], [cx, SY - BH * 1.03],
            [cx + BW * 0.4, SY - BH * 0.99], [cx + BW * 0.8, SY - BH * 0.9], [cx + BW, SY - BH * 0.72], [cx + BW, SY]];
          const bin = [[cx - BW * 0.68, SY - 24 * TS], [cx - BW * 0.68, SY - BH * 0.66], [cx - BW * 0.35, SY - BH * 0.83], [cx, SY - BH * 0.87], [cx + BW * 0.35, SY - BH * 0.83], [cx + BW * 0.68, SY - BH * 0.66], [cx + BW * 0.68, SY - 24 * TS]];
          backF.setAttribute('d', inkLoop(back, { seed: sd + 20, t, amp: 1.2 }));
          backL.setAttribute('d', inkPath(back, { w: 7, seed: sd + 21, t, amp: 1.5, closed: true }));
          backIn.setAttribute('d', inkPath(bin, { w: 4, seed: sd + 22, t, amp: 1.2 }));
          let ff = '', flL = '';
          [[cx - BW, SY - BH * 0.72], [cx + BW, SY - BH * 0.72], [cx, SY - BH * 1.03]].forEach((q, i) => {
            const r = (i === 2 ? 22 : 17) * TS;
            ff += inkCircle(q[0], q[1] - r * 0.7, r, sd + 30 + i, t, { fill: true }) + ' ';
            flL += inkCircle(q[0], q[1] - r * 0.7, r, sd + 33 + i, t, { w: 4.5 }) + ' ';
          });
          finF.setAttribute('d', ff); finL.setAttribute('d', flL);
          const seat = [[cx - SW, SY], [cx + SW, SY], [cx + SW, SY + 40 * TS], [cx - SW, SY + 40 * TS]];
          seatF.setAttribute('d', inkLoop(seat, { seed: sd + 40, t, amp: 1, smooth: false }));
          seatL.setAttribute('d', inkPath(seat, { w: 6, seed: sd + 41, t, amp: 1.2, closed: true, smooth: false }) + ' ' +
            inkPath([[cx - SW, SY], [cx - SW - 20 * TS, SY - 70 * TS], [cx - SW + 30 * TS, SY - 86 * TS]], { w: 7, seed: sd + 42, t, amp: 1.2 }) + ' ' +
            inkPath([[cx + SW, SY], [cx + SW + 20 * TS, SY - 70 * TS], [cx + SW - 30 * TS, SY - 86 * TS]], { w: 7, seed: sd + 43, t, amp: 1.2 }));
          const cush = [[cx - SW * 0.88, SY + 2], [cx - SW * 0.8, SY - 26 * TS], [cx + SW * 0.8, SY - 26 * TS], [cx + SW * 0.88, SY + 2]];
          cushF.setAttribute('d', inkLoop(cush, { seed: sd + 44, t, amp: 1 }));
          cushL.setAttribute('d', inkPath(cush, { w: 5, seed: sd + 45, t, amp: 1, closed: true }));
          const legs = [[[cx - SW * 0.8, SY + 40 * TS], [cx - SW * 0.86, FY]], [[cx + SW * 0.8, SY + 40 * TS], [cx + SW * 0.86, FY]]];
          legF.setAttribute('d', legs.map((l, i) => inkLoop([[l[0][0] - 12 * TS, l[0][1]], [l[0][0] + 12 * TS, l[0][1]], [l[1][0] + 16 * TS, l[1][1]], [l[1][0] - 16 * TS, l[1][1]]], { seed: sd + 46 + i, t, amp: 0.8, smooth: false })).join(' '));
          legL.setAttribute('d', legs.map((l, i) => inkPath([[l[0][0] - 12 * TS, l[0][1]], [l[0][0] + 12 * TS, l[0][1]], [l[1][0] + 16 * TS, l[1][1]], [l[1][0] - 16 * TS, l[1][1]]], { w: 4.5, seed: sd + 48 + i, t, amp: 0.8, closed: true, smooth: false })).join(' '));

          // princes
          const sw = { f: [], l: [] }, tips = [];
          let winnerHead = null;
          const WI = Math.min(PR.length - 1, P.winner ?? 3);
          PR.forEach((c, i) => {
            const at = atOr(cues, c.p.at, mode === 'fight' ? 0.6 + i * 0.9 : 0);
            let x = c.x * W, y = GY, pose = 'idle', face = -c.side, ph = 0, since = lt, dir = -38, emo = mode === 'fight' ? 'angry' : 'worried';
            let show = true, nameOn = mode === 'unite' || lt >= at - 0.1;
            if (mode === 'fight') {
              const wd = 1.3, st = at - wd;
              if (lt < st) show = false;
              else if (lt < at) { const u = progIO(lt, st, wd); x = lerp(c.from * W, c.x * W, u); pose = 'walk'; face = c.x > c.from ? 1 : -1; ph = Math.abs(x - c.from * W) / (gait * c.sc); }
              else { since = lt - at; emo = 'angry'; }
              if (fightAt != null && lt >= fightAt && show && lt >= at) {
                const o = pairOf(i);
                if (o) {
                  const inner = Math.abs(c.x - TH.x) < Math.abs(o.x - TH.x);
                  face = o.x > c.x ? 1 : -1;
                  const ph2 = (lt - fightAt) * 1.9 + (inner ? 0 : 0.5);
                  const sw2 = Math.sin(ph2 * Math.PI * 2);
                  pose = 'point'; dir = 34 + sw2 * 22; since = lt - fightAt;
                  x = c.x * W + face * (18 + 14 * Math.max(0, sw2)) * U;
                } else { pose = 'point'; dir = 60; since = lt - fightAt; }
              }
            } else {
              face = -c.side;
              if (lt >= winAt) {
                if (i !== WI) {           // the others turn and walk off-stage
                  const st = winAt + 0.15 + i * 0.12, u = progIO(lt, st, 2.4), off = c.side < 0 ? -0.14 : 1.14;
                  x = lerp(c.x * W, off * W, u * u); face = c.side; emo = 'worried';
                  if (lt >= st) { pose = 'walk'; ph = Math.abs(x - c.x * W) / (gait * c.sc); }
                  if (u >= 1) show = false;
                } else {                  // the winner walks to the throne, climbs it, sits
                  const wd = 1.0, u = progIO(lt, winAt, wd), u2 = progIO(lt, winAt + wd, 0.4);
                  x = lerp(c.x * W, cx, u); emo = 'happy';
                  if (u < 1) { pose = 'walk'; face = cx > c.x * W ? 1 : -1; ph = Math.abs(x - c.x * W) / (gait * c.sc); }
                  else { pose = 'wave'; face = 1; since = lt - winAt - wd; y = lerp(GY, FY, sm(u2)); }
                }
              } else {                    // stand-off before the win: blades pointed at the brother opposite
                const o = pairOf(i);
                if (o) { face = o.x > c.x ? 1 : -1; pose = 'point'; dir = 12 + Math.sin(lt * 2.2 + i) * 9; emo = 'angry'; }
              }
            }
            if (!show) { c.rig.node.style.display = 'none'; c.nm.style.display = 'none'; return; }
            c.rig.node.style.display = '';
            const res = c.rig.update(t, pose, { x, y, face, since, ph, dir, emotion: emo });
            const px = c.sc, X = q => [x + face * px * q[0], y + px * q[1]];
            if (res) {
              if (!(mode === 'unite' && i === WI && lt >= winAt)) tips[i] = sword(res, x, y, face, px, sw, i * 3, t);
              if (mode === 'unite' && i === WI) winnerHead = X(res.head);
              const hd = X(res.head);
              c.nm.style.display = nameOn ? '' : 'none';
              const np = mode === 'fight' ? spring(lt, at, 0.45) : 1, b = boil(sd + 400 + i, t, 1);
              c.nm.setAttribute('transform', `translate(${f1(hd[0] + b[0])} ${f1(hd[1] - (mode === 'unite' && i === WI && lt >= winAt ? 120 + 170 * sm(progIO(lt, winAt + 1.0, 0.8)) : 120) * px + b[1])}) rotate(${-2 + i}) scale(${Math.max(0.01, np).toFixed(3)})`);
            }
          });
          // clash sparks between duelling pairs
          let sp = '';
          if (mode === 'fight' && fightAt != null && lt >= fightAt) {
            const done = new Set();
            PR.forEach((c, i) => {
              const o = pairOf(i); if (!o || done.has(i)) return; done.add(i); done.add(o.i);
              const a = tips[i], b = tips[o.i]; if (!a || !b) return;
              const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 10];
              const ph = ((lt - fightAt) * 1.9) % 1, pk = Math.max(0, Math.cos(ph * Math.PI * 2)) ** 3;
              if (pk < 0.15) return;
              for (let j = 0; j < 7; j++) {
                const an = j / 7 * Math.PI * 2 + i, r1 = 14, r2 = 14 + 46 * pk * U;
                sp += inkPath([[m[0] + Math.cos(an) * r1, m[1] + Math.sin(an) * r1], [m[0] + Math.cos(an) * r2, m[1] + Math.sin(an) * r2]], { w: 5, seed: sd + 600 + i * 10 + j, t, amp: 0.8 }) + ' ';
              }
            });
          }
          spark.setAttribute('d', sp);
          swF.setAttribute('d', sw.f.join(' ')); swL.setAttribute('d', sw.l.join(' '));
          // the sultan's turban: on the cushion; trembles in the fight; flies onto the winner's head
          let tx0 = cx, ty0 = SY - 26 * TS, ts = 1, trot = 0;
          if (mode === 'fight' && lt >= hitAt) { const j = boil(sd + 800, t, 4 * shake); tx0 += j[0] + tx; ty0 += j[1] - Math.abs(Math.sin(lt * 23)) * 8 * shake; trot = Math.sin(lt * 29) * 6 * shake; }
          if (mode === 'unite' && winnerHead && lt >= winAt + 1.15) {
            const u = sm(progIO(lt, winAt + 1.15, 0.7));
            const hx = winnerHead[0], hy = winnerHead[1] - 40 * PR[WI].sc;
            tx0 = lerp(tx0, hx, u); ty0 = lerp(ty0, hy, u) - Math.sin(u * Math.PI) * 110 * U; ts = lerp(1, 0.78, u); trot = Math.sin(u * Math.PI) * -18;
          } else ty0 += Math.sin(lt * 1.6) * 3;
          turbG.setAttribute('transform', `translate(${f1(tx0)} ${f1(ty0)}) rotate(${trot.toFixed(2)}) scale(${(ts * TS).toFixed(3)})`);
          const kav = [[-52, 0], [-60, -40], [-50, -92], [-24, -124], [0, -130], [24, -124], [50, -92], [60, -40], [52, 0]];
          turbF.setAttribute('d', inkLoop(kav, { seed: sd + 810, t, amp: 1.2 }));
          turbBand.setAttribute('d', inkLoop([[-56, -2], [-58, -26], [58, -26], [56, -2]], { seed: sd + 811, t, amp: 0.8 }));
          turbL.setAttribute('d', inkPath(kav, { w: 5.5, seed: sd + 812, t, amp: 1.2, closed: true }) + ' ' +
            [-0.55, -0.15, 0.25].map((v, j) => inkPath([[-50, -40 + v * 60 + j * 10], [0, -56 + v * 60 + j * 10], [50, -64 + v * 60 + j * 10]], { w: 3, seed: sd + 813 + j, t, amp: 0.8 })).join(' ') + ' ' +
            inkPath([[-58, -26], [58, -26]], { w: 4, seed: sd + 817, t, amp: 0.8 }));
          const pw = Math.sin(t * 2.4) * 6;
          turbPl.setAttribute('d', inkLoop([[0, -112], [-14 + pw, -170], [-6 + pw * 1.5, -214], [10 + pw, -176], [6, -114]], { seed: sd + 818, t, amp: 0.8 }));
          turbJ.setAttribute('d', inkDot(0, -98, 13, 15, sd + 819, t) + ' ' + inkDot(0, -13, 9, 9, sd + 820, t));
          // gold burst on hit (unite) / badge
          let bu = '';
          if (mode === 'unite' && hitAt != null && lt >= hitAt && lt < hitAt + 1.4) {
            const u = (lt - hitAt) / 1.4, c0 = [tx0, ty0 - 60 * TS];
            for (let j = 0; j < 12; j++) { const an = j / 12 * Math.PI * 2, r1 = (80 + 140 * u) * TS, r2 = r1 + 50 * (1 - u) * TS;
              bu += inkPath([[c0[0] + Math.cos(an) * r1, c0[1] + Math.sin(an) * r1], [c0[0] + Math.cos(an) * r2, c0[1] + Math.sin(an) * r2]], { w: 6 * (1 - u) + 1, seed: sd + 900 + j, t, amp: 0.8 }) + ' '; }
          }
          burst.setAttribute('d', bu);
          const bAt = P.badge === false || mode !== 'unite' && !P.badge ? null : atOr(cues, BG.at, mode === 'unite' ? (hitAt ?? dur * 0.8) : null);
          if (bAt != null && lt >= bAt) {
            badgeG.style.display = '';
            const p = spring(lt, bAt, 0.5), bx = cx + (portrait ? 0.3 : 0.2) * W, by = lerp(-120, H * (portrait ? 0.24 : 0.25), clamp01(p));
            badgeG.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(${f1(-7 + Math.sin(lt * 1.5) * 2)})`);
            const R = 104 * U;
            const pts = []; for (let j = 0; j < 24; j++) { const an = j / 24 * Math.PI * 2, r = j % 2 ? R * 0.9 : R; pts.push([Math.cos(an) * r, Math.sin(an) * r]); }
            badgeF.setAttribute('d', inkLoop(pts, { seed: sd + 950, t, amp: 1, smooth: false }));
            badgeR.setAttribute('d', inkPath(pts, { w: 7, seed: sd + 951, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkCircle(0, 0, R * 0.72, sd + 952, t, { w: 4 }));
          } else badgeG.style.display = 'none';
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.55] }, hit, mode === 'fight' && lt >= hitAt ? shake * 0.5 : 0);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
