// mohac_court: people in a real place (14-mohac-1526): a stone palace hall (columns, arch, tapestries, carpet, throne),
// a striped war tent with a map table, a monastery cloister, or a city wall with a gate tower — or no room at all over
// the scene's "set". The cast are period stick figures (KASIF rigs: crown, helmet, turban, beret, beards) that can
// wear a friar's robe, raise swords, hold signs and walk in and out (they turn at once, never slice thin).
// Use "set": false with a room (it paints its own walls and floor); "set": "city" behind the "gate" room.
// P: {room: "hall"|"tent"|"monastery"|"gate"|null, throne: true, throne_x, table: true, gate_x, gy: 820,
//     cast: [{who, accessory, beard, x, y (0..1 H, ground), scale: 0.6, face: "left"|"right", pose, at, then, dir, emotion,
//             text (hold sign), item, robe: true (brown friar's robe + rope belt), sword: cue|true (sword in the raised hand),
//             moves: [{at, to (0..1 W), dur: 1.6}] (walks; faces the way it walks), seq: [{at, pose, dir, emotion, face}],
//             hide_until}],
//     bank: {y: 640} (far river bank strip over a "sea" set), labels: [MCB label entries], props: [{type: "spear"|"banner"|"coins", x (0..1), at, side}]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  SH.mohac_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const GY = P.gy ?? 820;
      const root = el(svg, 'g');
      const roomG = el(root, 'g'), propBack = el(root, 'g'), castG = el(root, 'g'), propFront = el(root, 'g'), labG = el(root, 'g');
      const room = P.room ? M.room(roomG, P.room, W, H, seed * 3, { gy: GY, throne: P.throne, throne_x: P.throne_x, table: P.table, table_x: P.table_x, table_y: P.table_y, gate_x: P.gate_x }) : null;
      // optional far river bank (over a "sea" set whose horizon sits at bank.y): a green strip with a tree line
      const bankF = P.bank ? inkEl(roomG, mix(INK.paperLight, INK.green, 0.35)) : null, bankL = P.bank ? inkEl(roomG, INK.inkSoft) : null;
      // ground line for the engine (and the set) when there is no room
      const ground = !P.room ? inkEl(roomG) : null;
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      const cast = (P.cast || []).map((m, i) => {
        const isK = (m.who || 'kasif') === 'kasif', g = el(castG, 'g');
        const robeF = m.robe ? inkEl(g, mix(INK.stain, INK.ink, 0.25)) : null, robeL = m.robe ? inkEl(g, INK.ink) : null, belt = m.robe ? inkEl(g, INK.gold) : null;
        const rg = el(g, 'g');
        const rig = KASIF.create(rg, { scale: m.scale ?? 0.6, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed * 50 + i * 13 });
        const blade = m.sword ? inkEl(g, INK.paperLight) : null, bladeL = m.sword ? inkEl(g, INK.ink) : null, hilt = m.sword ? inkEl(g, INK.gold) : null;
        return { m, i, g, rig, robeF, robeL, belt, blade, bladeL, hilt };
      });
      const props = (P.props || []).map((pp, i) => ({ pp, i, a: inkEl(pp.type === 'coins' ? propFront : propBack, pp.type === 'banner' ? M.side(pp.side || 'hu') : pp.type === 'coins' ? INK.gold : INK.ink), b: inkEl(propBack, INK.ink) }));
      const labels = P.labels && window.MCB ? window.MCB.labels(labG, P.labels, W, H, seed * 7) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          if (room) room.update(t);
          if (bankF) {
            const by = P.bank.y ?? 640, sh = [[-60, by + 6], [-60, by - 50], [600, by - 64], [1300, by - 44], [W + 60, by - 60], [W + 60, by + 6]];
            bankF.setAttribute('d', inkLoop(sh, { seed: seed + 5, t, amp: 0.8 }));
            let td = inkPath([[-60, by + 4], [W + 60, by + 2]], { w: 3, seed: seed + 6, t });
            for (let k = 0; k < 22; k++) { const q = rng(inkHash(seed + 7, k)), x = q() * W, y = by - 40 - q() * 16, r = 26 + q() * 24; td += inkPath(inkEllipsePts(x, y - r, r, r * 1.2, seed + 8 + k, 9), { w: 2.6, seed: seed + 40 + k, t, closed: true }) + inkPath([[x, y], [x, y + 14]], { w: 2.6, seed: seed + 70 + k, t }); }
            bankL.setAttribute('d', td);
          }
          if (ground) ground.setAttribute('d', inkPath([[-60, GY + 2], [W * 0.5, GY - 2], [W + 60, GY + 1]], { w: 6, seed: seed + 1, t }));
          cast.forEach(({ m, i, g, rig, robeF, robeL, belt, blade, bladeL, hilt }) => {
            const hu = atOr(cues, m.hide_until, null);
            if (hu != null && lt < hu) { g.style.display = 'none'; return; }
            g.style.display = '';
            const sc = m.scale ?? 0.6, gy = (m.y ?? GY / H) * H;
            // pose segments
            const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, emotion: m.emotion0 || m.emotion, face: m.face, text: m.text, item: m.item }];
            const a = atOr(cues, m.at, null);
            if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.dir, emotion: m.emotion, text: m.text, item: m.item });
            (m.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({ text: m.text, item: m.item }, s, { at: sa })); });
            segs.sort((p, q) => p.at - q.at);
            let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
            const s = segs[si];
            let face = faceOf(s.face, faceOf(m.face, 1)), pose = s.pose || 'idle', since = lt - Math.max(0, s.at), ph = 0;
            // walks
            let x = m.x, walked = 0;
            for (const mv of (m.moves || [])) {
              const st = atOr(cues, mv.at, null); if (st == null) continue;
              const d = mv.dur ?? 1.6, u = progIO(lt, st, d), from = x;
              x = lerp(from, mv.to, u); walked += Math.abs(mv.to - from) * u;
              if (lt >= st && lt < st + d) { pose = 'walk'; face = mv.to < from ? -1 : 1; ph = walked * W / (gait * sc); }
              else if (lt >= st + d && mv.face) face = faceOf(mv.face, face);
            }
            const o = { x: x * W, y: gy, face, since, ph, dir: dirOf(s.dir), text: s.text, item: s.item, emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (si > 0 && since < 0.3 && pose !== 'walk') { const pv = segs[si - 1]; o.prev = { pose: pv.pose || 'idle', since: since + 1, dir: dirOf(pv.dir), text: pv.text, item: pv.item }; o.mix = since / 0.3; }
            const res = rig.update(t, pose, o) || {};
            const X = q => x * W + face * sc * q[0], Y = q => gy + sc * q[1];
            if (robeF && res.hip) {
              const hp = res.hip, top = [hp[0], hp[1] - 132];
              const pts = [[top[0] - 44, top[1] + 6], [top[0] + 44, top[1] + 6], [hp[0] + 82, -20], [hp[0] - 82, -20]].map(q => [X(q), Y(q)]);
              robeF.setAttribute('d', inkLoop(pts, { seed: seed + 100 + i, t, amp: 1, smooth: false }));
              const hood = res.head ? inkEllipsePts(X(res.head), Y([0, res.head[1] + 30]), sc * 92, sc * 60, seed + 103 + i, 10) : [];
              robeL.setAttribute('d', inkPath(pts, { w: 5, seed: seed + 101 + i, t, closed: true, smooth: false }) + (hood.length ? inkPath(hood.slice(0, 6), { w: 6, seed: seed + 104 + i, t }) : ''));
              belt.setAttribute('d', inkPath([[X([hp[0] - 50, hp[1] - 10]), Y([0, hp[1] - 10])], [X([hp[0] + 50, hp[1] - 10]), Y([0, hp[1] - 10])], [X([hp[0] + 30, hp[1] + 70]), Y([0, hp[1] + 70])]], { w: 6, seed: seed + 102 + i, t }));
            }
            if (blade) {
              const sa = m.sword === true ? 0 : atOr(cues, m.sword, 0), on = lt >= sa && res.hands;
              if (on) {
                const hs = res.hands.slice().sort((p, q) => p[1] - q[1])[0], hx = X(hs) + face * 14, hy = Y(hs), L = 230 * sc * 1.6 * clamp01((lt - sa) / 0.25 + 0.2);
                const wob = Math.sin(t * 3 + i) * 0.06 + face * 0.38, tip = [hx + Math.sin(wob) * L, hy - Math.cos(wob) * L];
                const bp = [[hx - 6, hy - 10], [tip[0] - 2, tip[1] + 20], tip, [tip[0] + 4, tip[1] + 20], [hx + 6, hy - 10]];
                blade.setAttribute('d', inkLoop(bp, { seed: seed + 110 + i, t, amp: 0.6, smooth: false }));
                bladeL.setAttribute('d', inkPath(bp, { w: 4, seed: seed + 111 + i, t, closed: true, smooth: false }));
                hilt.setAttribute('d', inkLoop([[hx - 30, hy - 14], [hx + 30, hy - 14], [hx + 30, hy - 4], [hx - 30, hy - 4]], { seed: seed + 112 + i, t, amp: 0.6, smooth: false }));
              } else { blade.setAttribute('d', ''); bladeL.setAttribute('d', ''); hilt.setAttribute('d', ''); }
            }
          });
          props.forEach(({ pp, i, a, b }) => {
            const at = atOr(cues, pp.at, 0), x = (pp.x ?? 0.5) * W, gy = (pp.y ?? GY / H) * H;
            if (lt < at) { a.setAttribute('d', ''); b.setAttribute('d', ''); return; }
            if (pp.type === 'spear') {   // a broken lance stuck in the ground, its top splintered off and lying beside it
              b.setAttribute('d', inkPath([[x, gy + 6], [x + 70, gy - 330]], { w: 10, seed: seed + 200 + i, t }) + inkPath([[x + 70, gy - 330], [x + 62, gy - 360], [x + 78, gy - 342], [x + 84, gy - 372]], { w: 5, seed: seed + 201 + i, t, smooth: false })
                + inkPath([[x + 110, gy + 4], [x + 330, gy - 26]], { w: 9, seed: seed + 202 + i, t }) + inkPath([[x + 330, gy - 26], [x + 380, gy - 40], [x + 336, gy - 8]], { w: 5, seed: seed + 203 + i, t, smooth: false }));
              a.setAttribute('d', '');
            } else if (pp.type === 'banner') {   // a fallen banner: the pole on the ground, the cloth slumped over it, stirring
              const wv = Math.sin(t * 2.2 + i) * 8, pole = [[x - 260, gy - 6], [x + 240, gy - 60]];
              b.setAttribute('d', inkPath(pole, { w: 9, seed: seed + 210 + i, t }));
              const cl = [[x + 120, gy - 48], [x + 240, gy - 60], [x + 250 + wv, gy - 150], [x + 320 + wv * 1.5, gy - 110], [x + 300, gy - 20], [x + 180, gy - 6], [x + 100, gy - 10]];
              a.setAttribute('d', inkLoop(cl, { seed: seed + 211 + i, t, amp: 1 }));
              b.setAttribute('d', b.getAttribute('d') + inkPath(cl, { w: 5, seed: seed + 212 + i, t, closed: true }));
            } else if (pp.type === 'coins') {   // coins falling from a hand height and scattering
              let d = '', l = '';
              for (let k = 0; k < 9; k++) {
                const q = rng(inkHash(seed + 220 + i, k)), tt = lt - at - q() * 0.8; if (tt < 0) continue;
                const cx = x + (q() - 0.5) * 120 + tt * (q() - 0.5) * 160, cy = Math.min(gy - 8, gy - 330 + 900 * tt * tt);
                d += inkLoop(inkEllipsePts(cx, cy, 16, cy >= gy - 9 ? 7 : 14, seed + 230 + k, 8), { seed: seed + 230 + k, t, amp: 0.5 });
                l += inkPath(inkEllipsePts(cx, cy, 16, cy >= gy - 9 ? 7 : 14, seed + 230 + k, 8), { w: 3, seed: seed + 240 + k, t, closed: true });
              }
              a.setAttribute('d', d); b.setAttribute('d', l);
            }
          });
          if (labels) labels.update(lt, t, cues);
        },
      };
    },
  };
})();
