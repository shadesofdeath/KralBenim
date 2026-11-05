// mar_road: a dusty 1904 country road in parchment ink (Stickstory "1904 Olympic marathon"): the road, fence posts and
// telegraph poles scroll past while runners run, stagger or rest; open touring cars drive along trailing dust; a blazing
// sun with heat shimmer; optional roadside well / water tower / apple trees / chasing dogs; period figures and the
// narrator. Set: "field" | "hills" | "desert" (the set draws sky + far land; this shot draws road and props).
// Uses mar__lib.js (MAR) + td__lib.js (TD.label).
// P: {ground: 0.82 (road line, 0..1 H), speed: 260 (px/s the roadside scrolls; 0 = still), stop: cue (scroll eases to 0),
//     road: true, fence: true, poles: true,
//     sun: {x: 0.86, y: 0.16, r: 70} | false, heat: 0..1 shimmer,
//     dust: 0..1 | {from, to, at, dur} (frame-filling dust), dust_y: 0.2,
//     cars: [{x: 0.5, to, at, dur, s: 0.9, face: 1, dust: true, stop: cue (wheels stop, steam), shake: true}],
//     people: [MAR.person specs (runners, trainers, drivers; ride: {car, from, until, seat, pose, wave})],
//     kasif: person spec (hat true is set automatically),
//     well: {x: 0.2, s: 1, bucket: cue}, tower: {x, s}, trees: [{x, s, rotten: cue}],
//     dogs: [{x, to, at, dur, s: 0.8, face}],
//     scenery: [{type: farmhouse|barn|bridge|milepost|lane|deadtree|cracks|gate, x, s: 1, drift: 0.35 (share of the road scroll), text}],
//     grips: [[i, j]] (person i's second hand holds person j's arm: a short ink arm), labels: [TD.label specs]}
// cues: whatever the "at"s reference.
// Same drawing under three more names so the shot list reads by subject: mar_car (scenes built around the touring car),
// mar_well (the roadside well / water stop), mar_orchard (apple trees by the road).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mar_road = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MAR, TD = window.TD, atOr = M.atOr, sd = seed * 1000 + 517;
      const G = (P.ground ?? 0.82) * H, S0 = P.speed ?? 260;
      const root = el(svg, 'g');
      const sky = el(root, 'g'), farG = el(root, 'g'), roadG = el(root, 'g'), propG = el(root, 'g'), carBack = el(root, 'g'), peopleG = el(root, 'g'), carFront = el(root, 'g'), dustG = el(root, 'g'), fieldG = el(root, 'g'), topG = el(root, 'g');
      const sunS = !P.sun ? null : Object.assign({ x: 0.86, y: 0.16, r: 70 }, P.sun || {});
      const sun = sunS ? M.sun(sky, sd + 1) : null, heat = M.heat(sky, sd + 2);
      const rs = M.roadside(roadG, sd + 3);
      const SC = (P.scenery || []).map(S => Object.assign({ x: 0.5, s: 1, drift: 0.35 }, S)), scen = SC.map((S, i) => M.scenery(farG, sd + 60 + i * 13, S));
      const gripE = inkEl(el(root, 'g'), INK.ink);
      const wellS = P.well ? Object.assign({ x: 0.2, s: 1 }, P.well) : null, well = wellS ? M.well(propG, sd + 4) : null;
      const towS = P.tower ? Object.assign({ x: 0.2, s: 1 }, P.tower) : null, tow = towS ? M.tower(propG, sd + 5) : null;
      const TR = (P.trees || []).map(T => Object.assign({ x: 0.2, s: 1 }, T)), trees = TR.map((T, i) => M.tree(propG, sd + 10 + i));
      const CS = (P.cars || []).map(C => Object.assign({ x: 0.5, s: 0.9, face: 1, dust: true }, C));
      const dusts = CS.map((C, i) => M.dust(dustG, sd + 20 + i));
      const cars = CS.map((C, i) => M.car(carBack, carFront, sd + 30 + i));
      const DG = (P.dogs || []).map(D => Object.assign({ x: 0.1, s: 0.8, face: 1 }, D)), dogs = DG.map((D, i) => M.dog(peopleG, sd + 40 + i));
      const people = (P.people || []).map((K, i) => M.person(peopleG, Object.assign({ y: P.ground ?? 0.82 }, K), sd + 100 + i * 7));
      const kas = P.kasif ? M.person(topG, Object.assign({ x: 0.84, y: P.ground ?? 0.82, scale: 0.85, pose: 'point', face: 'left', dir: 20 }, P.kasif, { hat: true }), sd + 90) : null;
      const field = M.dustField(fieldG, sd + 50);
      const labels = (P.labels || []).map((L, i) => TD.label(topG, L, W, H, sd + 400 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // scroll offset (integral of speed; eases to 0 on "stop")
          const st = P.stop != null ? atOr(cues, P.stop, null) : null;
          let off = S0 * lt, spd = S0;
          if (st != null && lt > st) { const d = Math.min(lt - st, 1.2) / 1.2; off = S0 * st + S0 * 1.2 * (d - d * d / 2); spd = S0 * (1 - d); }
          if (sun) sun.update(t, sunS.x * W, sunS.y * H, sunS.r);
          heat.update(t, W, G - 30, P.heat ?? 0);
          SC.forEach((S, i) => scen[i].update(t, S.x * W - off * S.drift, G - (S.type === 'bridge' ? 0 : 30), S.s));
          rs.update(t, W, G, off, { road: P.road, fence: P.fence, poles: P.poles, pole_h: P.pole_h });
          if (well) well.update(t, wellS.x * W - off * (wellS.scroll ? 1 : 0), G - 30, wellS.s, wellS.bucket != null ? prog(lt, atOr(cues, wellS.bucket, 0), 1.2) : 0);
          if (tow) tow.update(t, towS.x * W, G - 30, towS.s);
          TR.forEach((T, i) => trees[i].update(t, T.x * W, G - 30, T.s, T.rotten != null ? prog(lt, atOr(cues, T.rotten, 0), 1.0) : 0));
          // cars
          CS.forEach((C, i) => {
            const a = atOr(cues, C.at, 0), d = C.dur ?? 3, u = C.to != null ? clamp01((lt - a) / d) : 0;
            const x = C.to != null ? lerp(C.x, C.to, C.ease === false ? u : EASE_IO(u)) * W : C.x * W;
            const sa = C.stop != null ? atOr(cues, C.stop, null) : null, stopped = sa != null && lt >= sa;
            const travel = (C.to != null ? (C.to - C.x) * W * (C.ease === false ? u : EASE_IO(u)) : 0) * C.face;
            const rollD = Math.abs(travel) + (stopped ? S0 * (sa ?? 0) : off) * (C.road_roll === false ? 0 : 1);
            const steam = stopped ? prog(lt, sa, 0.6) : 0;
            cars[i].update(t, { x, y: G + 6, s: C.s, face: C.face, roll: rollD / (66 * C.s), steam, shake: stopped ? 0 : (C.shake === false ? 0 : 1) });
            const moving = !stopped && (spd > 20 || (C.to != null && u > 0 && u < 1));
            dusts[i].update(t, { x: x - C.face * 250 * C.s, y: G, dir: -C.face, len: 560 * C.s, h: 260 * C.s, p: C.dust ? (moving ? 1 : stopped ? 1 - prog(lt, sa, 1.5) : 0.3) : 0 });
          });
          const envP = { cars, off, speed: spd };
          DG.forEach((D, i) => {
            const a = atOr(cues, D.at, 0), d = D.dur ?? 3, u = D.to != null ? clamp01((lt - a) / d) : 0;
            const x = (D.to != null ? lerp(D.x, D.to, u) : D.x) * W + Math.sin(lt * 5 + i) * 10;
            dogs[i].update(t, { x, y: G + (D.dy ?? 10), s: D.s, face: D.face, ph: lt * 2.6 + i * 0.3 });
          });
          const outs = people.map(p => p && p.update(lt, t, cues, W, H, envP));
          let gd = '';
          (P.grips || []).forEach(([i, j], k) => { const a = outs[i], b = outs[j]; if (!a || !b) return; const sh = [lerp(b.hip[0], b.head[0], 0.62), lerp(b.hip[1], b.head[1], 0.62)]; gd += inkPath([a.hand2, [lerp(a.hand2[0], sh[0], 0.5), lerp(a.hand2[1], sh[1], 0.5) + 10], sh], { w: 7, seed: sd + 700 + k, t }) + ' ' + inkDot(sh[0], sh[1], 11, 11, sd + 720 + k, t) + ' '; });
          gripE.setAttribute('d', gd);
          if (kas) kas.update(lt, t, cues, W, H, { cars, off: null, speed: 0 });
          let dk = 0;
          if (typeof P.dust === 'number') dk = P.dust;
          else if (P.dust) dk = lerp(P.dust.from ?? 0, P.dust.to ?? 1, prog(lt, atOr(cues, P.dust.at, 0), P.dust.dur ?? 1.5));
          field.update(t, W, H, dk, P.dust_y ?? 0.2);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
  SH.mar_car = { kind: '2d', build: SH.mar_road.build };
  SH.mar_well = { kind: '2d', build: SH.mar_road.build };
  SH.mar_orchard = { kind: '2d', build: SH.mar_road.build };
})();
