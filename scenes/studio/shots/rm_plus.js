// rm_plus: wraps any 2D parchment shot (map, timeline, board, title...) and adds what it lacks without touching the
// shared files: a uniform scale-up around an origin (bigger type / fuller frame) and a Kaşif / period cast standing on
// top of it (parchment ink style, brand/kit/BRAND.md §2, §5; deterministic, a pure function of lt).
// Written for 03-roma-son-imparator (a map with Kaşif pointing at the route), but parametric.
//   P: {shot: "map", params: {...the inner shot's own P...},
//       scale: 1 (uniform scale of the inner shot), origin: [0.5, 0.2] (0..1 of W/H, fixed point of the scale),
//       cast: [{who: "kasif"|name, accessory, beard, x: 0.8, y: 0.6 (ground, 0..1 H), scale: 0.6, pose: "idle",
//               at: cue, then: "point", dir: deg|"up"|..., face: "left"|"right", emotion, then_emotion,
//               helmet: "roman" (bronze galea with a tall red crest and a cheek guard, drawn over the head; use with
//               accessory: null)}]}
//   cues: whatever the inner shot uses + the cast "at" names
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };

  SH.rm_plus = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const inner = SH[P.shot || 'map'];
      const g = el(svg, 'g');
      const built = inner && inner.build ? inner.build(Object.assign({}, ctx, { P: P.params || {}, svg: g })) : null;
      const s = P.scale || 1, o = P.origin || [0.5, 0.2];
      if (s !== 1) g.setAttribute('transform', `translate(${f1(o[0] * W)} ${f1(o[1] * H)}) scale(${s}) translate(${f1(-o[0] * W)} ${f1(-o[1] * H)})`);
      const castG = el(svg, 'g');
      const base = portrait ? 0.82 : 0.62;
      const cast = typeof KASIF === 'undefined' ? [] : (P.cast || []).map((m, i) => {
        const isK = (m.who || 'kasif') === 'kasif';
        const rg = el(castG, 'g');
        const rig = KASIF.create(rg, { scale: base * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 5 + i * 7 });
        const hg = m.helmet === 'roman' ? { crest: inkEl(castG, INK.red), crestL: inkEl(castG), dome: inkEl(castG, INK.gold), domeL: inkEl(castG), det: inkEl(castG) } : null;
        return { m, rig, hg, s: base * (m.scale || 1) };
      });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (built) built.update(lt, dur, cues, Object.assign({ t }, env));
          cast.forEach(c => {
            const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
            const pose = after ? (m.then || m.pose || 'idle') : (m.pose || 'idle');
            const since = after ? lt - at : lt;
            const dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
            const face = m.face === 'left' ? -1 : m.face === 'right' ? 1 : (typeof m.face === 'number' ? m.face : -1);
            const emo = after ? (m.then_emotion || m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion || null);
            const op = { x: (m.x ?? 0.8) * W, y: (m.y ?? 0.6) * H, face, since, dir, emotion: emo };
            if (after && since < 0.32) { op.prev = { pose: m.pose || 'idle', since: at, dir }; op.mix = since / 0.32; }
            const res = c.rig.update(t, pose, op);
            if (c.hg && res) {     // Roman galea in head coordinates (x mirrored by face), drawn over the rig
              const k = c.s, hx = res.head[0], hy = res.head[1];
              const P2 = q => [op.x + face * k * (hx + q[0]), op.y + k * (hy + q[1])];
              const sd = seed * 100 + 7, io = (n, extra) => Object.assign({ seed: sd + n, t, amp: 1.2 }, extra);
              const dome = [[-80, -8], [-82, -56], [-56, -100], [0, -116], [54, -102], [80, -60], [82, -16], [60, -20], [40, -36], [-40, -40], [-60, -30]].map(P2);
              // crest: a fan-shaped horse-hair brush standing on the dome ridge (outer arc high, inner arc on the dome)
              const outer = [], inner = [];
              for (let j = 0; j <= 8; j++) { const a = Math.PI * (1.08 - j / 8 * 1.16); outer.push([Math.cos(a) * 92, -96 - Math.sin(a) * 120]); inner.push([Math.cos(a) * 64, -96 - Math.sin(a) * 26]); }
              const crest = outer.concat(inner.slice().reverse()).map(P2);
              c.hg.crest.setAttribute('d', inkLoop(crest, io(1, { amp: 1 })));
              c.hg.crestL.setAttribute('d', inkPath(crest, io(1, { w: 4, closed: true })) + ' ' +
                [1, 2, 3, 4, 5, 6, 7].map(j => { const a = Math.PI * (1.08 - j / 8 * 1.16); return inkPath([P2([Math.cos(a) * 68, -96 - Math.sin(a) * 30]), P2([Math.cos(a) * 88, -96 - Math.sin(a) * 112])], io(10 + j, { w: 2.5 })); }).join(' '));
              c.hg.dome.setAttribute('d', inkLoop(dome, io(2, { amp: 1 })));
              const cheek = [[44, -34], [56, 16], [34, 30], [24, -22]].map(P2);
              c.hg.domeL.setAttribute('d', inkPath(dome, io(2, { w: 5, closed: true })) + ' ' + inkPath(cheek, io(3, { w: 4, closed: true })));
              c.hg.det.setAttribute('d', inkPath([P2([-82, -50]), P2([0, -60]), P2([80, -54])], io(4, { w: 3 })) +
                ' ' + inkPath([P2([-82, -10]), P2([-100, 6])], io(5, { w: 5 })));
            }
          });
        },
      };
    },
  };
})();
