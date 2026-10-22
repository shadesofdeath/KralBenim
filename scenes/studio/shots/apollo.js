// apollo (+ cabin, below): hand-drawn ink Apollo spacecraft on parchment (brand/kit/BRAND.md §5), made for 05-apollo-13 but parametric.
// The docked stack lies horizontally: service module (engine bell left) + command module "Odyssey" (cone) + lunar
// module "Aquarius" (right). Several modes reuse the same drawings; space backdrop = sparse boiling ink stars.
//
// SHOTS.apollo P: {
//   mode: "stack" | "explode" | "lifeboat" | "jettison" | "filter" | "tank" | "window" | "reentry" | "recovery",
//   // reentry  (cues "los", "out"): lone CM shield-first, plasma tongues + streaks, Earth limb; los -> radio waves ✗ "Sinyal yok"
//   //          (los_text), out -> glow fades; angle: 145 (travel direction, deg), x, y, scale: 1.6
//   // recovery (cue "ship" | ship_at): flat-deck carrier slides in, capsule with collar bobs in the sea (capsule_x: 0.16),
//   //          deck_y: 0.5, ship_name; put the crew on the deck with crew_y = deck_y
//   ring: 520 (explode: shock-ring growth, px/s at scale 1), big: true (explode: bigger plume / shards), plume: 81 (explode: plume direction, deg above the horizon, 90 = up)
//   crew: [{x, pose, face, at, then, seq, to, dur, emotion, text, accessory, beard, scale, y}] bare-headed figures,
//         crew_scale: 0.5, crew_y: 0.9 (ground line, 0..1 H)
//   x: 0.5, y: 0.44, scale: 1.25,        // stack centre (0..1 of frame) and size (stack is ~860 px wide at 1)
//   labels: [{text: "Odyssey", on: "cm"|"sm"|"lm", at: cue|seconds, color: "red"}] (Patrick Hand, >= 44 px),
//   moon: {x: 0.86, y: 0.2, r: 90} | false, earth: {x, y, r} | false,     // optional far discs in the sky
//   drift: true,                          // slow float + rotation of the stack
//   hide_sm: false,                       // draw without the service module (after it was jettisoned)
//   // explode  (cue "hit"): bay-4 panel blows off, shards fly, oxygen plume keeps venting, stack shakes
//   //          window: true -> a small helmeted face-less astronaut silhouette looks out of the CM window
//   // lifeboat (cues "move", "off", "burn"): 3 helmeted crew dots go CM -> LM through the tunnel, the CM goes dark
//   //          (hatched), LM windows glow; burn: {at, dur: 3} LM descent-engine flame + stack nudged forward
//   // jettison (cue "sep"): sep: "sm" (service module drifts away tumbling, missing panel visible) | "lm"
//   // filter   (cues "try", "fix", "ok"): square CM canister vs round LM socket; it bumps + red ✗ at "try";
//   //          adapter: true -> at "fix" plastic bag, cardboard and tape wrap it, a hose reaches the socket,
//   //          green ✓ at "ok", little breath puffs flow through the hose
//   // tank     (cues "drop", "stir", "heat", "weld", "bare", "spark", "burst"): oxygen tank cutaway with heater
//   //          probe, fan, thermostat switch, insulated wires; flags: drop: true (falls ~5 cm, "5 cm" note),
//   //          stir: true (fan spins), heat: true (coil glows, heat waves), weld: true (switch sparks + sticks
//   //          shut, red ring), bare: true (wire insulation peels off), spark: true (sparks -> fire), burst: true
//   //          (tank wall cracks open); gauge: {max: "27°", at} (thermometer outside, pegs at its top)
//   // window   (cue "align"): round CM window, Earth crescent drifts onto the reticle line, "burn" note
//   note: {text, x: 0.5, y: 0.12, at, color: "red"},      // hand-written note (cue "note")
//   kasif: {x: 0.12, y: 0.9, pose: "point", at: cue|seconds, then: "shock", dir: "up-right"|deg, face: "right",
//           scale: 0.7, emotion, then_emotion, then_dir}
// }
// cues: hit, move, off, burn, sep, try, fix, ok, drop, stir, heat, weld, bare, spark, burst, align, note, kasif.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const dirOf = d => d == null ? 0 : typeof d === 'number' ? d : (DIRS[d] ?? 0);
  const faceOf = v => v === 'left' ? -1 : v === 'right' ? 1 : (v ?? 1);

  // immediate-mode pen: paths created on first use inside a layer, cleared when not drawn in a frame
  function mkPen(layers) {
    const m = new Map(); let used = new Set();
    return {
      begin() { used = new Set(); },
      d(key, layer, fill, d, op) {
        let e = m.get(key);
        if (!e) { e = el(layers[layer], 'path', { fill, stroke: 'none' }); e._f = fill; m.set(key, e); }
        if (e._f !== fill) { e.setAttribute('fill', fill); e._f = fill; }
        if (e._op !== op) { if (op == null) e.removeAttribute('fill-opacity'); else e.setAttribute('fill-opacity', op); e._op = op; }
        e.setAttribute('d', d); used.add(key);
      },
      txt(key, layer, text, x, y, size, o = {}) {
        let e = m.get(key);
        if (!e) {
          e = el(layers[layer], 'text', { 'font-family': o.font || INK_FONT, 'font-size': size, 'text-anchor': 'middle', 'font-weight': o.weight || 400,
            style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: ${o.halo ?? 10}px; stroke-linejoin: round` });
          m.set(key, e);
        }
        if (e.textContent !== text) e.textContent = text;
        e.setAttribute('fill', o.color || INK.ink);
        e.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${o.rot || 0}) scale(${(o.s ?? 1).toFixed(3)})`);
        e.style.opacity = o.op ?? 1;
        used.add(key);
      },
      end() { for (const [k, e] of m) if (!used.has(k)) { if (e.tagName === 'text') e.style.opacity = 0; else e.setAttribute('d', ''); } },
    };
  }


  // ---------------------------------------------------------------- figures (Kaşif + bare-headed crew)
  // spec: {x, y, pose, face, dir, emotion, text, at, then, then_emotion, then_dir, then_face, seq: [{at, pose, ...}],
  //        to (walks from x to "to" during the first `dur` s), dur: 1.4, scale, accessory, beard}
  function figPlan(m, T) {
    const st = [{ t0: -1e9, pose: m.pose || 'idle', face: faceOf(m.face), emotion: m.emotion, dir: dirOf(m.dir), text: m.text }];
    const at = T(m.at, null);
    if (m.then && at != null) st.push({ t0: at, pose: m.then, face: faceOf(m.then_face ?? m.face), emotion: m.then_emotion || m.emotion, dir: dirOf(m.then_dir ?? m.dir), text: m.then_text ?? m.text });
    (m.seq || []).forEach(q => { const a = T(q.at, null); if (a != null) st.push({ t0: a, pose: q.pose || 'idle', face: faceOf(q.face ?? m.face), emotion: q.emotion || m.emotion, dir: dirOf(q.dir ?? m.dir), text: q.text ?? m.text }); });
    st.sort((a, b) => a.t0 - b.t0);
    return st;
  }
  function figMake(g, m, isK, seed, defScale) {
    const sc = m.scale ?? defScale;
    return { m, s: sc, rig: KASIF.create(el(g, 'g'), isK ? { scale: sc, hat: true, seed } : { scale: sc, hat: false, accessory: m.accessory || null, beard: m.beard || null, seed }) };
  }
  function figUpdate(f, lt, t, T, W, H, gy) {
    const m = f.m, st = figPlan(m, T);
    let k = 0; while (k + 1 < st.length && lt >= st[k + 1].t0) k++;
    const s = st[k], pv = st[k - 1];
    let x = (m.x ?? 0.5) * W, pose = s.pose, ph = 0, face = s.face;
    if (m.to != null) {
      const d = m.dur ?? 1.4, u = clamp01(lt / d);
      x = lerp((m.x ?? 0.5) * W, m.to * W, u);
      if (u < 1 && k === 0) { pose = 'walk'; face = m.to >= (m.x ?? 0.5) ? 1 : -1; ph = Math.abs(x - (m.x ?? 0.5) * W) / (f.s * (KASIF.gait('walk') || 100)); }
      else if (pose === 'walk') pose = 'idle';
    }
    const since = s.t0 < -1e8 ? lt : lt - s.t0;
    const o = { x, y: m.y != null ? m.y * H : gy, face, ph, since, dir: s.dir, emotion: s.emotion, text: s.text };
    if (pv && since < 0.3) { o.prev = { pose: pv.pose, since: s.t0 - Math.max(0, pv.t0), dir: pv.dir, emotion: pv.emotion, text: pv.text }; o.mix = since / 0.3; }
    f.rig.update(t, pose, o);
  }

  // ---------------------------------------------------------------- local geometry (stack units, centre 0,0)
  const SM = [[-330, -110], [-30, -110], [-30, 110], [-330, 110]];
  const BELL = [[-330, -42], [-330, 42], [-425, 80], [-425, -80]];
  const CM = [[-30, -112], [140, -24], [140, 24], [-30, 112]];
  const TUN = [[140, -18], [176, -18], [176, 18], [140, 18]];
  const LMA = [[176, -70], [236, -92], [292, -80], [300, 70], [240, 88], [176, 64]];        // ascent stage
  const LMD = [[292, -112], [392, -112], [392, 112], [292, 112]];                           // descent stage
  const LMB = [[392, -30], [392, 30], [436, 52], [436, -52]];                               // descent bell
  const LEGS = [[[300, -112], [360, -150], [420, -150]], [[300, 112], [360, 150], [420, 150]]];
  const PANEL = [[-250, -110], [-110, -110], [-110, -18], [-250, -18]];
  const ANCH = { sm: [-180, 0], cm: [50, 0], lm: [300, 0] };

  SH.apollo = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'stack';
      const root = el(svg, 'g');
      const layers = { bg: el(root, 'g'), mid: el(root, 'g'), fx: el(root, 'g'), top: el(root, 'g') };
      const kG = el(root, 'g');
      const pen = mkPen(layers);
      const sd = seed * 1000;
      let kas = null;
      const crewG = el(root, 'g');
      const crew = (P.crew && typeof KASIF !== 'undefined') ? P.crew.map((m, i) => figMake(crewG, m, false, seed + 20 + i * 7, P.crew_scale ?? 0.5)) : [];
      if (P.kasif && typeof KASIF !== 'undefined') kas = figMake(kG, typeof P.kasif === 'object' ? P.kasif : { pose: P.kasif }, true, seed + 3, 0.7);
      // fixed random sets
      const r0 = rng(seed * 7 + 11);
      const stars = Array.from({ length: 34 }, () => [r0() * W, r0() * H * 0.86, 5 + r0() * 7, r0()]);
      const shards = Array.from({ length: P.big ? 22 : 14 }, () => ({ a: -Math.PI * (0.15 + r0() * 0.75), v: (180 + r0() * 420) * (P.big ? 1.4 : 1), s: (8 + r0() * 14) * (P.big ? 1.6 : 1), rot: (r0() * 2 - 1) * 6 }));
      const BIG = P.big ? 1.9 : 1, PA = (P.plume ?? 81) / 180;
      const puffs = Array.from({ length: P.big ? 22 : 16 }, (_, i) => ({ k: i, a: -Math.PI * (PA + (r0() * 2 - 1) * 0.2), v: (120 + r0() * 80) * BIG, r: (22 + r0() * 26) * BIG }));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          pen.begin();
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const T = (k, x) => atOr(cues, k, x);
          // ------------------------------------------------ backdrop: stars, moon, earth
          const showStars = mode !== 'filter' && mode !== 'tank' && mode !== 'recovery';
          if (showStars) {
            let sdd = '';
            stars.forEach((s, i) => {
              const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + s[3] * 9), b = boil(sd + 400 + i, t, 0.8), z = s[2] * tw;
              sdd += inkPath([[s[0] - z + b[0], s[1] + b[1]], [s[0] + z + b[0], s[1] + b[1]]], { w: 3, seed: sd + 500 + i, t, amp: 0.5 }) +
                     inkPath([[s[0] + b[0], s[1] - z + b[1]], [s[0] + b[0], s[1] + z + b[1]]], { w: 3, seed: sd + 600 + i, t, amp: 0.5 });
            });
            pen.d('stars', 'bg', INK.inkSoft, sdd, 0.7);
            const disc = (key, o, kind) => {
              if (!o) return;
              const D = Object.assign(kind === 'moon' ? { x: 0.86, y: 0.2, r: 90 } : { x: 0.12, y: 0.2, r: 80 }, typeof o === 'object' ? o : {});
              const cx = D.x * W + Math.sin(t * 0.2) * 6, cy = D.y * H, r = D.r * spring(lt, 0.1, 0.8);
              if (r < 2) return;
              pen.d(key + 'f', 'bg', INK.paperLight, inkCircle(cx, cy, r, sd + (kind === 'moon' ? 31 : 37), t, { fill: true }));
              let dd = '';
              if (kind === 'moon') {
                [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.4, 0.12], [0.35, -0.35, 0.1]].forEach((c, i) =>
                  dd += inkCircle(cx + c[0] * r, cy + c[1] * r, c[2] * r, sd + 40 + i, t, { w: 3 }));
              } else {
                dd += inkLoop([[cx - r * 0.5, cy - r * 0.3], [cx - r * 0.1, cy - r * 0.55], [cx + r * 0.1, cy - r * 0.1], [cx - r * 0.2, cy + r * 0.3], [cx - r * 0.55, cy + r * 0.1]], { seed: sd + 44, t });
                dd += inkLoop([[cx + r * 0.3, cy + r * 0.2], [cx + r * 0.6, cy + r * 0.1], [cx + r * 0.5, cy + r * 0.55], [cx + r * 0.25, cy + r * 0.5]], { seed: sd + 45, t });
              }
              pen.d(key + 'm', 'bg', kind === 'moon' ? INK.inkSoft : INK.blue, dd, kind === 'moon' ? 0.9 : 0.55);
              pen.d(key + 'r', 'bg', INK.ink, inkCircle(cx, cy, r, sd + (kind === 'moon' ? 31 : 37), t, { w: 5 }));
            };
            disc('moon', P.moon, 'moon');
            disc('earth', P.earth, 'earth');
          }

          // ------------------------------------------------ the docked stack
          const drawStack = (o) => {
            // o: {cx, cy, s, rot, hide: {sm, cm, lm}, smOff: [dx, dy, rot], lmOff, panelGone, cmDark, lmGlow, keyp}
            const c = Math.cos(o.rot), sn = Math.sin(o.rot);
            const X = (p, off) => {
              let x = p[0], y = p[1];
              if (off) { const oc = Math.cos(off[2]), os = Math.sin(off[2]), px = off[3] ?? 0; const xx = x - px, yy = y; x = px + xx * oc - yy * os + off[0]; y = xx * os + yy * oc + off[1]; }
              return [o.cx + (x * c - y * sn) * o.s, o.cy + (x * sn + y * c) * o.s];
            };
            const M = (pts, off) => pts.map(p => X(p, off));
            const kp = o.keyp || 'st';
            const lw = Math.max(4, 6 * Math.min(1.2, o.s));
            const shape = (key, pts, fill, off, opts = {}) => {
              const q = M(pts, off);
              pen.d(kp + key + 'f', 'mid', fill, inkLoop(q, { seed: sd + opts.sd, t, smooth: false, amp: 1.4 }), opts.op);
              pen.d(kp + key + 'r', 'mid', INK.ink, inkPath(q, { seed: sd + opts.sd, t, closed: true, w: lw, smooth: false, amp: 1.4 }));
            };
            const line = (key, pts, off, w = lw * 0.6, col = INK.ink, sdx = 0) => pen.d(kp + key, 'mid', col, inkPath(M(pts, off), { seed: sd + sdx, t, w, smooth: false, amp: 1.2 }));
            const smO = o.smOff, lmO = o.lmOff;
            if (!o.hide?.sm) {
              shape('bell', BELL, INK.paperDark, smO, { sd: 1 });
              shape('sm', SM, INK.paperLight, smO, { sd: 2 });
              let seams = '';
              [-260, -180, -100].forEach((x, i) => seams += inkPath(M([[x, -108], [x, 108]], smO), { seed: sd + 10 + i, t, w: lw * 0.45, smooth: false }));
              seams += inkPath(M([[-326, -60], [-34, -60]], smO), { seed: sd + 14, t, w: lw * 0.3, smooth: false });
              pen.d(kp + 'seams', 'mid', INK.inkSoft, seams);
              // high-gain antenna stub
              line('ant', [[-300, 110], [-300, 160], [-270, 175]], smO, lw * 0.6, INK.ink, 15);
              pen.d(kp + 'antd', 'mid', INK.ink, inkCircle(...X([-262, 182], smO), 14 * o.s, sd + 16, t, { w: lw * 0.6 }));
              if (o.panelGone) {
                const hole = M([[-250, -108], [-110, -108], [-112, -20], [-180, -30], [-248, -18]], smO);
                pen.d(kp + 'hole', 'mid', INK.inkSoft, inkLoop(hole, { seed: sd + 17, t, smooth: false }), 0.85);
                // torn edges + the burst tank inside
                pen.d(kp + 'holer', 'mid', INK.ink, inkPath(hole, { seed: sd + 18, t, closed: true, w: lw * 0.8, smooth: false, amp: 3 }));
                pen.d(kp + 'tankin', 'mid', INK.paperDark, inkCircle(...X([-180, -64], smO), 30 * o.s, sd + 19, t, { fill: true }));
                pen.d(kp + 'tankinr', 'mid', INK.ink, inkPath(M([[-205, -84], [-180, -96], [-160, -86], [-170, -72], [-152, -54], [-180, -36], [-205, -48]], smO), { seed: sd + 20, t, w: lw * 0.5 }));
              } else if (!o.panelFlying) {
                shape('panel', PANEL, INK.paperLight, smO, { sd: 21 });
                pen.d(kp + 'pnum', 'mid', INK.inkSoft, inkCircle(...X([-180, -64], smO), 9 * o.s, sd + 22, t, { fill: true }));
              }
            }
            if (!o.hide?.cm) {
              shape('cm', CM, o.cmDark ? INK.inkSoft : INK.paperLight, null, { sd: 30, op: o.cmDark ? 0.75 : undefined });
              line('shield', [[-30, -112], [-30, 112]], null, lw * 1.5, INK.ink, 31);
              // hatching when dark
              if (o.cmDark) {
                let hd = '';
                for (let i = 0; i < 6; i++) { const x = -18 + i * 26; hd += inkPath(M([[x, -100 + i * 13], [x + 30, -70 + i * 13]]), { seed: sd + 300 + i, t, w: 3 }); }
                pen.d(kp + 'cmh', 'mid', INK.ink, hd, 0.6);
              }
              pen.d(kp + 'cmw', 'mid', o.cmDark ? INK.ink : INK.paperDark, inkCircle(...X([40, -40]), 15 * o.s, sd + 32, t, { fill: true }));
              pen.d(kp + 'cmwr', 'mid', INK.ink, inkCircle(...X([40, -40]), 15 * o.s, sd + 32, t, { w: lw * 0.5 }));
              shape('tun', TUN, INK.paperDark, null, { sd: 33 });
            }
            if (!o.hide?.lm) {
              shape('lmd', LMD, INK.gold, lmO, { sd: 40, op: 0.55 });
              shape('lmb', LMB, INK.paperDark, lmO, { sd: 41 });
              LEGS.forEach((L, i) => line('leg' + i, L, lmO, lw * 0.7, INK.ink, 42 + i));
              shape('lma', LMA, INK.paperLight, lmO, { sd: 44 });
              const glow = o.lmGlow || 0;
              pen.d(kp + 'lmw', 'mid', glow > 0 ? INK.gold : INK.paperDark, inkLoop(M([[214, -46], [252, -58], [256, -20], [218, -12]], lmO), { seed: sd + 45, t, smooth: false }), glow > 0 ? 0.5 + 0.5 * glow : undefined);
              pen.d(kp + 'lmwr', 'mid', INK.ink, inkPath(M([[214, -46], [252, -58], [256, -20], [218, -12]], lmO), { seed: sd + 45, t, closed: true, w: lw * 0.5, smooth: false }));
              let x = ''; [[300, -112, 392, 112], [300, 112, 392, -112]].forEach((q, i) => x += inkPath(M([[q[0], q[1]], [q[2], q[3]]], lmO), { seed: sd + 46 + i, t, w: 3, smooth: false }));
              pen.d(kp + 'lmx', 'mid', INK.inkSoft, x, 0.7);
            }
            return { X, M };
          };

          const S = (P.scale ?? 1.25), CX = (P.x ?? 0.5) * W, CY = (P.y ?? 0.44) * H;
          const ent = spring(lt, 0, 0.9);
          const fl = P.drift === false ? [0, 0, 0] : [Math.sin(t * 0.5) * 10, Math.cos(t * 0.37) * 8, Math.sin(t * 0.29) * 0.025];
          const stackModes = ['stack', 'explode', 'lifeboat', 'jettison'];
          let geo = null;
          if (stackModes.includes(mode)) {
            const hit = T('hit', dur * 0.35);
            let shx = 0, shy = 0, rotK = 0;
            if (mode === 'explode' && lt >= hit) {
              const e = Math.exp(-(lt - hit) * 3);
              shx = Math.sin((lt - hit) * 55) * 22 * e; shy = Math.cos((lt - hit) * 47) * 14 * e;
              rotK = -Math.min(0.12, (lt - hit) * 0.05);          // the stack starts to tumble
            }
            const burnAt = P.burn ? T(P.burn.at || 'burn', dur * 0.4) : null;
            let push = 0;
            if (burnAt != null && lt >= burnAt) push = -prog(lt, burnAt, P.burn.dur ?? 3) * 60;
            const o = {
              cx: CX + fl[0] + shx + push * 0 + (1 - ent) * -260, cy: CY + fl[1] + shy, s: S * lerp(0.92, 1, ent), rot: fl[2] + rotK,
              panelGone: (mode === 'explode' && lt >= hit) || (mode === 'jettison' && P.sep !== 'lm'), panelFlying: false,
              cmDark: mode === 'lifeboat' && P.off !== false && lt >= T('off', dur * 0.6),
              lmGlow: mode === 'lifeboat' ? prog(lt, T('move', dur * 0.3), 0.8) : 0,
              hide: P.hide_sm ? { sm: true } : null,
            };
            if (burnAt != null) o.cx += -push;        // stack is nudged forward (to the right)
            if (mode === 'jettison') {
              const sep = T('sep', dur * 0.25), u = Math.max(0, lt - sep);
              if (P.sep === 'lm') o.lmOff = [u * 55, -u * 22, u * 0.12, 300];
              else o.smOff = [-u * 70, u * 26, -u * 0.16, -180];
              if (P.sep === 'all') { o.lmOff = [u * 45, -u * 20, u * 0.1, 300]; }
            }
            geo = drawStack(o);
            // labels
            (P.labels || []).forEach((L, i) => {
              const a = T(L.at, 0.3 + i * 0.4), sp = spring(lt, a, 0.6);
              if (sp <= 0.001) return;
              const off = L.on === 'sm' ? o.smOff : L.on === 'lm' ? o.lmOff : null;
              const [ax, ay] = geo.X(ANCH[L.on] || ANCH.cm, off);
              const up = L.below ? 1 : -1, ty = ay + up * (165 * o.s + 40), b = boil(sd + 700 + i, t, 1.5);
              pen.txt('lab' + i, 'top', L.text, ax + b[0], ty + (L.below ? 30 : 0) + b[1], L.size || 58, { color: L.color === 'red' ? INK.red : INK.ink, s: lerp(0.6, 1, sp), op: clamp01(sp * 2), rot: -2 });
              pen.d('labl' + i, 'top', INK.ink, inkPath([[ax, ay + up * 112 * o.s], [ax + 6, ty - up * 52 + (L.below ? 0 : 0)]], { seed: sd + 720 + i, t, w: 4 }), 0.8);
            });
            // explode effects
            if (mode === 'explode' && lt >= hit) {
              const u = lt - hit;
              // flash ring
              if (u < 0.9) {
                const [hx, hy] = geo.X([-180, -64]);
                pen.d('ring', 'fx', INK.red, inkCircle(hx, hy, 30 + u * (P.ring ?? 520) * S, sd + 800, t, { w: 10 * (1 - u / 0.9) + 2 }));
                let rays = '';
                for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r1 = 40 + u * 200, r2 = r1 + 60 * (1 - u); rays += inkPath([[hx + Math.cos(a) * r1, hy + Math.sin(a) * r1], [hx + Math.cos(a) * r2, hy + Math.sin(a) * r2]], { seed: sd + 810 + i, t, w: 6 }); }
                pen.d('rays', 'fx', INK.gold, rays);
              }
              // panel flying off
              const [px, py] = geo.X([-180, -64]);
              const pa = u * 1.6, pts = PANEL.map(q => [q[0] + 180, q[1] + 64]).map(q => {
                const cc = Math.cos(pa), ss = Math.sin(pa);
                return [px - u * 260 + (q[0] * cc - q[1] * ss) * S, py - u * 330 + 220 * u * u * 0 + (q[0] * ss + q[1] * cc) * S];
              });
              if (pts.every(q => q[1] > -400)) {
                pen.d('pnl', 'fx', INK.paperLight, inkLoop(pts, { seed: sd + 830, t, smooth: false }));
                pen.d('pnlr', 'fx', INK.ink, inkPath(pts, { seed: sd + 830, t, closed: true, w: 6, smooth: false }));
              }
              // shards
              let sh = '';
              shards.forEach((q, i) => {
                const d = q.v * u, x = px + Math.cos(q.a) * d, y = py + Math.sin(q.a) * d, rr = q.rot * u;
                if (x < -50 || y < -50) return;
                sh += inkLoop([[x - q.s, y], [x + Math.cos(rr) * q.s, y - q.s * 0.6], [x + q.s * 0.5, y + q.s * 0.8]], { seed: sd + 840 + i, t, smooth: false });
              });
              pen.d('shards', 'fx', INK.ink, sh);
              // venting oxygen: puffs keep streaming out of the hole
              let pf = '', pr = '';
              puffs.forEach((q, i) => {
                const per = P.big ? 1.5 : 2.2, ph = ((u + i * per / puffs.length) % per), born = u - ph;
                if (born < 0) return;
                const d = q.v * ph * 1.4, x = px + Math.cos(q.a) * d, y = py + Math.sin(q.a) * d, r = q.r * (0.5 + ph * 0.9);
                pf += inkCircle(x, y, r, sd + 860 + i, t, { fill: true });
                pr += inkCircle(x, y, r, sd + 860 + i, t, { w: 3.5 });
              });
              pen.d('puf', 'fx', INK.paperLight, pf, 0.85);
              pen.d('pur', 'fx', INK.inkSoft, pr);
              if (P.window) {
                const [wx, wy] = geo.X([40, -40]);
                pen.d('helm', 'fx', INK.ink, inkCircle(wx, wy, 9 * S, sd + 880, t, { w: 3 }));
              }
            }
            // lifeboat: crew moving CM -> LM
            if (mode === 'lifeboat') {
              const mv = T('move', dur * 0.3);
              let cd = '', cf = '';
              for (let i = 0; i < 3; i++) {
                const u = progIO(lt, mv + i * 0.45, 1.3);
                const lx = lerp(30 - i * 26, 210 + i * 26, u), ly = lerp(20, -10 + i * 22, u) + Math.sin(u * Math.PI) * -6;
                const [x, y] = geo.X([lx, ly]);
                cf += inkCircle(x, y, 16 * S, sd + 900 + i, t, { fill: true });
                cd += inkCircle(x, y, 16 * S, sd + 900 + i, t, { w: 4 }) + inkPath([[x - 8 * S, y - 3 * S], [x + 8 * S, y - 3 * S]], { seed: sd + 910 + i, t, w: 3 });
              }
              pen.d('crewf', 'fx', INK.paperLight, cf);
              pen.d('crewr', 'fx', INK.ink, cd);
              if (P.burn) {
                const ba = T(P.burn.at || 'burn', dur * 0.4), bd = P.burn.dur ?? 3;
                if (lt >= ba && lt < ba + bd + 0.4) {
                  const k = clamp01((lt - ba) / 0.3) * clamp01((ba + bd + 0.4 - lt) / 0.4), fl2 = 1 + 0.25 * Math.sin(t * 40);
                  const fp = geo.M([[436, -40], [436 + 170 * k * fl2, 0], [436, 40]]);
                  pen.d('flame', 'fx', INK.gold, inkLoop(fp, { seed: sd + 920, t }), 0.85);
                  pen.d('flamei', 'fx', INK.red, inkLoop(geo.M([[436, -20], [436 + 90 * k * fl2, 0], [436, 20]]), { seed: sd + 921, t }), 0.8);
                  pen.d('flamer', 'fx', INK.ink, inkPath(fp, { seed: sd + 920, t, w: 4 }));
                  let sk = '';
                  for (let i = 0; i < 5; i++) { const y = -150 + i * 75, x0 = ((t * 600 + i * 170) % 900); sk += inkPath(geo.M([[-200 - x0 * 0.3 + 300, y], [-320 - x0 * 0.3 + 300, y]]), { seed: sd + 930 + i, t, w: 3 }); }
                  pen.d('streak', 'bg', INK.inkSoft, sk, 0.6 * k);
                }
              }
            }
          }

          // ------------------------------------------------ filter: square canister vs round socket
          if (mode === 'filter') {
            const tryAt = T('try', dur * 0.3), fixAt = P.adapter ? T('fix', dur * 0.55) : null, okAt = P.adapter ? T('ok', dur * 0.8) : null;
            const sx0 = W * 0.27, sy = H * 0.46, rx = W * 0.68;
            const pin = spring(lt, 0, 0.8);
            // socket panel (LM)
            const pnl = [[rx - 190, sy - 230], [rx + 190, sy - 236], [rx + 196, sy + 230], [rx - 186, sy + 236]].map(q => [q[0] + (1 - pin) * 300, q[1]]);
            pen.d('spf', 'mid', INK.paperDark, inkLoop(pnl, { seed: sd + 1, t, smooth: false }));
            pen.d('spr', 'mid', INK.ink, inkPath(pnl, { seed: sd + 1, t, closed: true, w: 6, smooth: false }));
            const sox = rx + (1 - pin) * 300;
            pen.d('sof', 'mid', INK.inkSoft, inkCircle(sox, sy, 105, sd + 2, t, { fill: true }));
            pen.d('sor', 'mid', INK.ink, inkCircle(sox, sy, 105, sd + 2, t, { w: 8 }));
            pen.d('sor2', 'mid', INK.ink, inkCircle(sox, sy, 128, sd + 3, t, { w: 3 }));
            pen.txt('l2', 'top', P.socket_label || 'Aquarius', sox, sy - 270, 56, { s: pin });
            // square canister
            let cx = sx0 - (1 - pin) * 300, wob = 0;
            if (lt >= tryAt && !P.adapter) {
              const u = lt - tryAt;
              const go = progIO(lt, tryAt, 0.7), back = u > 0.7 ? Math.exp(-(u - 0.7) * 5) * Math.sin((u - 0.7) * 20) * 30 : 0;
              cx = lerp(sx0, rx - 230, go) - back; wob = back * 0.01;
            }
            if (P.adapter && fixAt != null) cx = lerp(sx0, sx0 + 60, prog(lt, fixAt, 1));
            const hs = 105, sq = [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]].map(q => [cx + q[0] * Math.cos(wob) - q[1] * Math.sin(wob), sy + q[0] * Math.sin(wob) + q[1] * Math.cos(wob)]);
            const top = [[cx - hs, sy - hs], [cx - hs + 50, sy - hs - 40], [cx + hs + 50, sy - hs - 40], [cx + hs, sy - hs]];
            const side = [[cx + hs, sy - hs], [cx + hs + 50, sy - hs - 40], [cx + hs + 50, sy + hs - 40], [cx + hs, sy + hs]];
            pen.d('sqt', 'mid', INK.paperDark, inkLoop(top, { seed: sd + 5, t, smooth: false }));
            pen.d('sqs', 'mid', INK.inkSoft, inkLoop(side, { seed: sd + 6, t, smooth: false }), 0.7);
            pen.d('sqf', 'mid', INK.paperLight, inkLoop(sq, { seed: sd + 4, t, smooth: false }));
            pen.d('sqr', 'mid', INK.ink, inkPath(sq, { seed: sd + 4, t, closed: true, w: 7, smooth: false }) + inkPath(top, { seed: sd + 5, t, closed: true, w: 5, smooth: false }) + inkPath(side, { seed: sd + 6, t, closed: true, w: 5, smooth: false }));
            let grid = '';
            for (let i = 1; i < 4; i++) { const v = -hs + i * hs / 2; grid += inkPath([[cx - hs + 16, sy + v], [cx + hs - 16, sy + v]], { seed: sd + 10 + i, t, w: 3 }); }
            pen.d('sqg', 'mid', INK.inkSoft, grid);
            pen.txt('l1', 'top', P.box_label || 'Odyssey', cx, sy - hs - 80, 56, { s: pin });
            if (!P.adapter && lt >= tryAt + 0.75) {
              const k = spring(lt, tryAt + 0.75, 0.5), mx = (cx + hs + sox - 105) / 2 + 20, my = sy - 160;
              const z = 46 * k;
              pen.d('x', 'top', INK.red, inkPath([[mx - z, my - z], [mx + z, my + z]], { seed: sd + 20, t, w: 12 }) + inkPath([[mx + z, my - z], [mx - z, my + z]], { seed: sd + 21, t, w: 12 }));
            }
            if (P.adapter && lt >= fixAt) {
              const u = lt - fixAt, k1 = prog(lt, fixAt, 0.8), k2 = prog(lt, fixAt + 0.6, 0.8), k3 = prog(lt, fixAt + 1.1, 1.0);
              // plastic bag wrapping the canister (soft outline)
              const bag = [[cx - hs - 30, sy - hs - 70], [cx + hs + 80, sy - hs - 70], [cx + hs + 120, sy - 30], [cx + hs + 120, sy + 30], [cx + hs + 70, sy + hs + 30], [cx - hs - 30, sy + hs + 30]]
                .map((q, i) => [lerp(cx, q[0], k1), lerp(sy, q[1], k1) + Math.sin(t * 2 + i) * 4]);
              pen.d('bagf', 'fx', INK.paperLight, inkLoop(bag, { seed: sd + 30, t }), 0.45 * k1);
              pen.d('bagr', 'fx', INK.inkSoft, inkPath(bag, { seed: sd + 30, t, closed: true, w: 4 }));
              // cardboard strip
              const cb = [[cx - hs - 10, sy + hs - 10], [cx + hs + 60, sy + hs - 30], [cx + hs + 64, sy + hs + 20], [cx - hs - 6, sy + hs + 40]].map(q => [q[0], q[1] + (1 - k2) * 200]);
              if (k2 > 0.01) {
                pen.d('cbf', 'fx', INK.gold, inkLoop(cb, { seed: sd + 31, t, smooth: false }), 0.6);
                pen.d('cbr', 'fx', INK.ink, inkPath(cb, { seed: sd + 31, t, closed: true, w: 5, smooth: false }));
              }
              // tape bands
              let tp = '';
              [[-0.55], [0.1], [0.7]].forEach((q, i) => {
                const kk = prog(lt, fixAt + 0.9 + i * 0.25, 0.4); if (kk < 0.01) return;
                const x = cx + q[0] * hs * 1.2;
                tp += inkLoop([[x - 18, sy - hs - 74], [x + 18, sy - hs - 74], [x + 18, lerp(sy - hs - 74, sy + hs + 34, kk)], [x - 18, lerp(sy - hs - 74, sy + hs + 34, kk)]], { seed: sd + 40 + i, t, smooth: false });
              });
              pen.d('tape', 'fx', INK.paperDark, tp);
              pen.d('taper', 'fx', INK.inkSoft, tp ? inkPath([[cx - hs, sy - hs - 74], [cx + hs + 80, sy - hs - 74]], { seed: sd + 45, t, w: 2 }) : '');
              // hose from the bag to the socket
              if (k3 > 0.01) {
                const hp = [[cx + hs + 120, sy], [cx + hs + 190, sy - 70], [sox - 200, sy + 60], [sox - 60, sy]];
                const s = inkSpline(hp, false), n = Math.max(2, Math.round(s.length * k3));
                pen.d('hose', 'fx', INK.ink, inkPath(s.slice(0, n), { seed: sd + 50, t, w: 22, taper: 0 }));
                pen.d('hosei', 'fx', INK.paperDark, inkPath(s.slice(0, n), { seed: sd + 50, t, w: 12, taper: 0, amp: 0 }));
                if (k3 >= 1) {
                  let bp = '';
                  for (let i = 0; i < 5; i++) { const ph = ((u * 0.5 + i / 5) % 1), j = Math.floor(ph * (s.length - 1)), q = s[j]; bp += inkCircle(q[0], q[1] - 30 - ph * 10, 10 + ph * 6, sd + 60 + i, t, { w: 3 }); }
                  pen.d('breath', 'fx', INK.blue, bp);
                }
              }
              if (okAt != null && lt >= okAt) {
                const k = spring(lt, okAt, 0.5), mx = sox, my = sy + 190, z = 50 * k;
                pen.d('ok', 'top', INK.green, inkPath([[mx - z, my], [mx - z * 0.3, my + z * 0.7], [mx + z * 1.1, my - z * 0.8]], { seed: sd + 70, t, w: 14 }));
              }
            }
          }

          // ------------------------------------------------ tank cutaway
          if (mode === 'tank') {
            const tcx = (P.x ?? 0.42) * W, R = 255 * (P.scale ?? 1);
            let tcy = (P.y ?? 0.46) * H;
            const pin = spring(lt, 0, 0.8);
            // drop: from a cradle, falls ~5 cm with a bump
            if (P.drop) {
              const da = T('drop', dur * 0.35), u = lt - da;
              const fall = u < 0 ? 0 : u < 0.25 ? 48 * (u / 0.25) ** 2 : 48 - Math.exp(-(u - 0.25) * 8) * Math.abs(Math.sin((u - 0.25) * 22)) * 14;
              tcy += fall - 24;
              // cradle arms
              const ay = (P.y ?? 0.46) * H - 24 - R;
              pen.d('crad', 'mid', INK.ink, inkPath([[tcx - R * 0.9, ay - 60], [tcx - R * 0.9, ay - 140], [tcx + R * 0.9, ay - 140], [tcx + R * 0.9, ay - 60]], { seed: sd + 3, t, w: 7, smooth: false }) +
                inkPath([[tcx, ay - 140], [tcx, ay - 4 + (u > 0 ? Math.min(48, u * 300) : 0)]], { seed: sd + 4, t, w: 5, smooth: false }));
              if (u > 0.25) {
                const k = spring(lt, da + 0.3, 0.5), mx = tcx + R + 120;
                pen.d('meas', 'top', INK.red, inkPath([[mx, tcy - R - 48], [mx, tcy - R]], { seed: sd + 5, t, w: 6 }) +
                  inkPath([[mx - 18, tcy - R - 48], [mx + 18, tcy - R - 48]], { seed: sd + 6, t, w: 5 }) + inkPath([[mx - 18, tcy - R], [mx + 18, tcy - R]], { seed: sd + 7, t, w: 5 }));
                pen.txt('cm5', 'top', P.drop_text || '5 cm', mx + 90, tcy - R - 4, 64, { color: INK.red, s: k, op: clamp01(k * 2) });
                let bl = '';
                for (let i = 0; i < 4; i++) { const a = Math.PI * (0.62 + i * 0.12), r1 = R + 20, r2 = R + 20 + 40 * clamp01((u - 0.25) * 3) * Math.exp(-(u - 0.25) * 2); bl += inkPath([[tcx + Math.cos(a) * r1, tcy + Math.sin(a) * r1], [tcx + Math.cos(a) * r2, tcy + Math.sin(a) * r2]], { seed: sd + 8 + i, t, w: 5 }); }
                pen.d('bump', 'fx', INK.ink, bl);
              }
            }
            const R2 = R * lerp(0.85, 1, pin);
            const heatK = P.heat ? prog(lt, T('heat', dur * 0.3), 2.5) : 0;
            const sparkAt = P.spark ? T('spark', dur * 0.45) : null, burstAt = P.burst ? T('burst', dur * 0.7) : null;
            const fireK = sparkAt != null ? prog(lt, sparkAt + 0.4, 1.4) : 0;
            pen.d('tf', 'mid', INK.paperLight, inkCircle(tcx, tcy, R2, sd + 20, t, { fill: true }));
            if (heatK > 0) pen.d('tglow', 'mid', INK.red, inkCircle(tcx, tcy, R2 * 0.92, sd + 21, t, { fill: true }), 0.18 * heatK + 0.05 * Math.sin(t * 6) * heatK);
            if (fireK > 0) pen.d('tfire', 'mid', INK.gold, inkCircle(tcx, tcy, R2 * 0.93, sd + 22, t, { fill: true }), 0.35 * fireK);
            // shell (half-cut: back half hatched)
            let hd = '';
            for (let i = 0; i < 9; i++) { const y = tcy - R2 * 0.8 + i * R2 * 0.2, w = Math.sqrt(Math.max(0, R2 * R2 * 0.8 - (y - tcy) ** 2)); hd += inkPath([[tcx - w, y], [tcx - w + 40, y - 26]], { seed: sd + 30 + i, t, w: 3 }); }
            pen.d('thatch', 'mid', INK.inkSoft, hd, 0.6);
            // probe (vertical tube from the top), heater coil, fan, thermostat switch
            const top = tcy - R2 - 50, bot = tcy + R2 * 0.6;
            pen.d('probe', 'mid', INK.paperDark, inkLoop([[tcx - 22, top], [tcx + 22, top], [tcx + 22, bot], [tcx - 22, bot]], { seed: sd + 40, t, smooth: false }));
            pen.d('prober', 'mid', INK.ink, inkPath([[tcx - 22, top], [tcx + 22, top], [tcx + 22, bot], [tcx - 22, bot]], { seed: sd + 40, t, closed: true, w: 6, smooth: false }));
            let coil = '';
            const coilPts = [];
            for (let i = 0; i <= 14; i++) coilPts.push([tcx + (i % 2 ? 48 : -48), tcy - R2 * 0.55 + i * R2 * 0.07]);
            coil = inkPath(coilPts, { seed: sd + 41, t, w: 7, smooth: false });
            pen.d('coil', 'mid', heatK > 0.05 ? INK.red : INK.ink, coil);
            if (heatK > 0.2) {
              let hw = '';
              for (let i = 0; i < 5; i++) {
                const x = tcx - 160 + i * 80, ph = (t * 0.8 + i * 0.37) % 1, y0 = tcy + R2 * 0.3 - ph * R2 * 0.9;
                const q = []; for (let j = 0; j < 6; j++) q.push([x + Math.sin(j * 1.6 + t * 4 + i) * 10, y0 - j * 18]);
                hw += inkPath(q, { seed: sd + 50 + i, t, w: 4 });
              }
              pen.d('hwaves', 'fx', INK.red, hw, 0.8 * heatK);
            }
            // fan at the bottom
            const stir = P.stir ? T('stir', dur * 0.3) : null;
            const fa = (stir != null && lt >= stir) ? (lt - stir) * 14 : 0.4;
            let fan = '';
            for (let i = 0; i < 3; i++) { const a = fa + i * Math.PI * 2 / 3; fan += inkLoop([[tcx, bot + 20], [tcx + Math.cos(a - 0.35) * 70, bot + 20 + Math.sin(a - 0.35) * 26], [tcx + Math.cos(a + 0.2) * 74, bot + 20 + Math.sin(a + 0.2) * 28]], { seed: sd + 60 + i, t }); }
            pen.d('fan', 'mid', INK.inkSoft, fan);
            pen.d('fanhub', 'mid', INK.ink, inkCircle(tcx, bot + 20, 12, sd + 64, t, { fill: true }));
            // thermostat switch on the probe
            const swx = tcx + 22, swy = tcy - R2 * 0.7;
            const weldAt = P.weld ? T('weld', dur * 0.5) : null, welded = weldAt != null && lt >= weldAt;
            pen.d('swb', 'mid', INK.paperLight, inkLoop([[swx, swy - 30], [swx + 70, swy - 30], [swx + 70, swy + 30], [swx, swy + 30]], { seed: sd + 70, t, smooth: false }));
            pen.d('swr', 'mid', welded ? INK.red : INK.ink, inkPath([[swx, swy - 30], [swx + 70, swy - 30], [swx + 70, swy + 30], [swx, swy + 30]], { seed: sd + 70, t, closed: true, w: 5, smooth: false }));
            const open = welded ? 0 : (0.5 + 0.5 * Math.sin(t * 3)) * 0.45;   // contact flutters until it welds shut
            pen.d('swc', 'mid', INK.ink, inkPath([[swx + 12, swy + 10], [swx + 58, swy + 10 - open * 40]], { seed: sd + 71, t, w: 6 }));
            if (welded) {
              const k = spring(lt, weldAt, 0.5);
              pen.d('weldring', 'top', INK.red, inkCircle(swx + 35, swy, 62 * k + 4, sd + 72, t, { w: 7 }));
              if (lt - weldAt < 1.2) {
                let sp = '';
                for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 3, r1 = 20, r2 = 20 + 50 * (1 - (lt - weldAt) / 1.2); sp += inkPath([[swx + 58 + Math.cos(a) * r1, swy + Math.sin(a) * r1], [swx + 58 + Math.cos(a) * r2, swy + Math.sin(a) * r2]], { seed: sd + 73 + i, t, w: 4 }); }
                pen.d('weldsp', 'fx', INK.gold, sp);
              }
            }
            // wires (two) along the probe, insulation sleeve (paper-dark) that peels when "bare"
            const bareAt = P.bare ? T('bare', dur * 0.4) : null, peel = bareAt != null ? prog(lt, bareAt, 1.8) : 0;
            const wire = (dx, k) => { const q = []; for (let i = 0; i <= 10; i++) q.push([tcx + dx + Math.sin(i * 1.3 + k) * 6, top + 20 + i * (bot - top - 40) / 10]); return q; };
            [[-36, 0], [34, 2]].forEach(([dx, k], i) => {
              const q = wire(dx, k), n = q.length;
              const keep = Math.max(0, Math.round(n * (1 - peel)));
              if (keep >= 2) pen.d('sl' + i, 'mid', INK.gold, inkPath(q.slice(0, keep), { seed: sd + 80 + i, t, w: 16, taper: 0 }), 0.8);
              pen.d('wi' + i, 'mid', peel > 0.3 ? INK.red : INK.ink, inkPath(q, { seed: sd + 82 + i, t, w: 5 }));
            });
            // sparks + fire
            if (sparkAt != null && lt >= sparkAt) {
              const u = lt - sparkAt;
              let sp = '';
              for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.floor(t * 8) * 0.7, r1 = 10, r2 = 30 + 40 * Math.abs(Math.sin(t * 9 + i)); sp += inkPath([[tcx - 36 + Math.cos(a) * r1, tcy + Math.sin(a) * r1], [tcx - 36 + Math.cos(a) * r2, tcy + Math.sin(a) * r2]], { seed: sd + 90 + i, t, w: 5 }); }
              pen.d('spark', 'fx', INK.gold, sp);
              if (fireK > 0) {
                let fd = '';
                for (let i = 0; i < 6; i++) {
                  const x = tcx - 120 + i * 48, h = (70 + 60 * Math.abs(Math.sin(t * 5 + i * 1.7))) * fireK, y = tcy + R2 * 0.45;
                  fd += inkLoop([[x - 26, y], [x - 10, y - h * 0.6], [x + 4 * Math.sin(t * 7 + i), y - h], [x + 14, y - h * 0.5], [x + 26, y]], { seed: sd + 100 + i, t });
                }
                pen.d('fire', 'fx', INK.red, fd, 0.85);
              }
            }
            // shell outline (burst: cracks + gap)
            const bk = burstAt != null ? prog(lt, burstAt, 0.5) : 0;
            if (bk > 0) {
              const gap = 0.5 * bk, a0 = -Math.PI * 0.62, q = [];
              for (let i = 0; i <= 28; i++) { const a = a0 + gap + i / 28 * (Math.PI * 2 - gap * 2); q.push([tcx + Math.cos(a) * R2, tcy + Math.sin(a) * R2]); }
              pen.d('tr', 'mid', INK.ink, inkPath(q, { seed: sd + 120, t, w: 9 }));
              let cr = '';
              for (let i = 0; i < 4; i++) { const a = a0 + (i - 1.5) * 0.35; cr += inkPath([[tcx + Math.cos(a) * R2 * 0.95, tcy + Math.sin(a) * R2 * 0.95], [tcx + Math.cos(a) * (R2 + 120 * bk), tcy + Math.sin(a) * (R2 + 120 * bk)]], { seed: sd + 121 + i, t, w: 6 }); }
              pen.d('crack', 'fx', INK.red, cr);
            } else {
              pen.d('tr', 'mid', INK.ink, inkCircle(tcx, tcy, R2, sd + 20, t, { w: 9 }));
            }
            // thermometer gauge outside
            if (P.gauge) {
              const G = typeof P.gauge === 'object' ? P.gauge : {}, ga = T(G.at, dur * 0.3);
              const gx = W * 0.8, gy0 = H * 0.72, gy1 = H * 0.24, k = spring(lt, 0.2, 0.7);
              const tube = [[gx - 26, gy1], [gx + 26, gy1], [gx + 26, gy0], [gx - 26, gy0]].map(q => [q[0], lerp(gy0, q[1], k)]);
              pen.d('gtf', 'mid', INK.paperLight, inkLoop(tube, { seed: sd + 130, t, smooth: false }));
              const lvl = lerp(0.2, 1, prog(lt, ga, 1.6)), yy = lerp(gy0, gy1 + 14, lvl);
              pen.d('gfill', 'mid', INK.red, inkLoop([[gx - 14, yy], [gx + 14, yy], [gx + 14, gy0], [gx - 14, gy0]], { seed: sd + 131, t, smooth: false }));
              pen.d('gtr', 'mid', INK.ink, inkPath(tube, { seed: sd + 130, t, closed: true, w: 6, smooth: false }) + inkCircle(gx, gy0 + 34, 44, sd + 132, t, { w: 6 }));
              pen.d('gbulb', 'mid', INK.red, inkCircle(gx, gy0 + 34, 40, sd + 132, t, { fill: true }));
              pen.txt('gmax', 'top', G.max || '27°', gx + 110, gy1 + 20, 64, { color: INK.ink, s: k });
              pen.d('gtick', 'mid', INK.ink, inkPath([[gx + 30, gy1 + 4], [gx + 60, gy1 + 4]], { seed: sd + 133, t, w: 5 }));
              if (lvl >= 0.99) {
                const pk = 1 + 0.08 * Math.sin(t * 10);
                pen.d('gpeg', 'top', INK.red, inkCircle(gx, gy1 + 10, 50 * pk, sd + 134, t, { w: 6 }));
              }
            }
          }

          // ------------------------------------------------ window: Earth crescent onto the reticle
          if (mode === 'window') {
            const wx = W * (P.x ?? 0.48), wy = H * (P.y ?? 0.45), R = 330 * spring(lt, 0, 0.8) + 1;
            const al = T('align', dur * 0.5);
            pen.d('wbg', 'bg', INK.inkSoft, inkCircle(wx, wy, R, sd + 1, t, { fill: true }), 0.85);
            let st = '';
            stars.slice(0, 14).forEach((s, i) => { const x = wx + (s[0] / W - 0.5) * R * 1.6, y = wy + (s[1] / H - 0.45) * R * 1.6; if (Math.hypot(x - wx, y - wy) < R - 20) st += inkCircle(x, y, 3, sd + 200 + i, t, { fill: true }); });
            pen.d('wst', 'bg', INK.paperLight, st, 0.8);
            const u = progIO(lt, 0.2, Math.max(0.5, al - 0.2)), ex = lerp(wx + R * 0.55, wx, u), ey = lerp(wy - R * 0.45, wy, u) + (lt > al ? Math.sin((lt - al) * 9) * 4 * Math.exp(-(lt - al) * 3) : 0);
            const er = R * 0.42;
            pen.d('earthf', 'mid', INK.paperLight, inkCircle(ex, ey, er, sd + 2, t, { fill: true }));
            // night side (terminator): shaded half
            const night = []; for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; night.push([ex + Math.cos(a) * er, ey + Math.sin(a) * er]); }
            for (let i = 12; i >= 0; i--) { const a = Math.PI / 2 + i / 12 * Math.PI; night.push([ex + Math.cos(a) * er * 0.25, ey + Math.sin(a) * er]); }
            pen.d('earthn', 'mid', INK.ink, inkLoop(night, { seed: sd + 3, t }), 0.7);
            pen.d('earthr', 'mid', INK.ink, inkCircle(ex, ey, er, sd + 2, t, { w: 5 }));
            pen.d('earthc', 'mid', INK.blue, inkLoop([[ex + er * 0.1, ey - er * 0.5], [ex + er * 0.6, ey - er * 0.3], [ex + er * 0.5, ey + er * 0.2], [ex + er * 0.15, ey + er * 0.1]], { seed: sd + 4, t }), 0.6);
            // reticle: the terminator must sit on this vertical line
            const rk = prog(lt, 0.3, 0.6), hot = lt >= al;
            pen.d('ret', 'top', hot ? INK.red : INK.gold, inkPath([[wx - er * 0.25, wy - R * 0.85 * rk], [wx - er * 0.25, wy + R * 0.85 * rk]], { seed: sd + 5, t, w: 6 }) +
              inkPath([[wx - R * 0.85 * rk, wy], [wx + R * 0.85 * rk, wy]], { seed: sd + 6, t, w: 4 }));
            // window frame
            pen.d('wfr', 'top', INK.ink, inkCircle(wx, wy, R, sd + 1, t, { w: 18 }) + inkCircle(wx, wy, R + 34, sd + 7, t, { w: 6 }));
            let bolts = '';
            for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; bolts += inkCircle(wx + Math.cos(a) * (R + 17), wy + Math.sin(a) * (R + 17), 7, sd + 10 + i, t, { fill: true }); }
            pen.d('wbolt', 'top', INK.ink, bolts);
            if (hot) { const k = spring(lt, al, 0.5); pen.d('wok', 'top', INK.red, inkCircle(wx - er * 0.25, wy, 40 * k + 2, sd + 20, t, { w: 6 })); }
          }


          // ------------------------------------------------ reentry: lone command module, glowing heat shield, plasma trail
          if (mode === 'reentry') {
            const cx = (P.x ?? 0.46) * W + Math.sin(t * 7) * 3, cy = (P.y ?? 0.46) * H + Math.cos(t * 6) * 3, s = (P.scale ?? 1.6) * spring(lt, 0, 0.8);
            const ang = (P.angle ?? 145) * Math.PI / 180;          // direction of travel (shield first), default down-left
            const ca = Math.cos(ang), sa = Math.sin(ang);
            const X = (q) => [cx + (q[0] * ca - q[1] * sa) * s, cy + (q[0] * sa + q[1] * ca) * s];
            // Earth's limb at the bottom
            const limb = []; for (let i = 0; i <= 16; i++) { const u = i / 16; limb.push([u * W * 1.1 - W * 0.05, H * 0.98 - Math.sin(u * Math.PI) * H * 0.12]); }
            pen.d('limb', 'bg', INK.inkSoft, inkPath(limb, { seed: sd + 1, t, w: 6 }));
            pen.d('limbf', 'bg', INK.blue, inkLoop(limb.concat([[W * 1.05, H * 1.1], [-W * 0.05, H * 1.1]]), { seed: sd + 1, t }), 0.25);
            const out = P.out != null ? T(P.out, null) : T('out', null);
            const heat = out != null && lt >= out ? 1 - prog(lt, out, 1.2) : prog(lt, 0.1, 0.8);
            // streaks trailing behind (opposite to travel)
            let sk = '';
            for (let i = 0; i < 9; i++) {
              const off = (i - 4) * 34, ph = (t * 1.6 + i * 0.37) % 1, d0 = 120 + ph * 520, d1 = d0 + 140;
              sk += inkPath([[cx - ca * d0 * s / 1.6 - sa * off, cy - sa * d0 * s / 1.6 + ca * off], [cx - ca * d1 * s / 1.6 - sa * off, cy - sa * d1 * s / 1.6 + ca * off]], { seed: sd + 10 + i, t, w: 4 });
            }
            pen.d('streak', 'bg', INK.inkSoft, sk, 0.7 * heat + 0.1);
            // plasma: layered flame tongues wrapping the shield and trailing back
            if (heat > 0.01) {
              const tongue = (k, len, wid, sdx) => {
                const q = []; for (let i = 0; i <= 8; i++) { const v = i / 8, w = wid * Math.sin(v * Math.PI) * (1 + 0.25 * Math.sin(t * 18 + v * 9 + sdx)); q.push([-v * len, w]); }
                for (let i = 8; i >= 0; i--) { const v = i / 8, w = wid * Math.sin(v * Math.PI) * (1 + 0.25 * Math.sin(t * 15 + v * 7 + sdx)); q.push([-v * len, -w]); }
                return q.map(p0 => [p0[0] + 40, p0[1] + k]);
              };
              let o1 = '', o2 = '';
              [-90, -30, 30, 90].forEach((k, i) => { o1 += inkLoop(tongue(k, (300 + 60 * Math.sin(t * 5 + i)) * heat, 60, i).map(X), { seed: sd + 30 + i, t }); });
              [-50, 0, 50].forEach((k, i) => { o2 += inkLoop(tongue(k, (200 + 40 * Math.sin(t * 6 + i)) * heat, 34, i + 5).map(X), { seed: sd + 40 + i, t }); });
              pen.d('pl1', 'fx', INK.red, o1, 0.75 * heat);
              pen.d('pl2', 'fx', INK.gold, o2, 0.85 * heat);
              pen.d('halo', 'fx', INK.gold, inkLoop([[150, -150], [190, 0], [150, 150], [118, 0]].map(X), { seed: sd + 50, t }), 0.6 * heat);
            }
            // capsule: shield at +x (front), apex at -x
            const cm = [[120, -112], [-50, -24], [-50, 24], [120, 112]];
            pen.d('cmf', 'top', INK.paperLight, inkLoop(cm.map(X), { seed: sd + 60, t, smooth: false }));
            pen.d('cmr', 'top', INK.ink, inkPath(cm.map(X), { seed: sd + 60, t, closed: true, w: 7, smooth: false }) + inkPath([[120, -112], [140, -60], [140, 60], [120, 112]].map(X), { seed: sd + 61, t, w: 6 }));
            pen.d('shield', 'top', heat > 0.05 ? INK.red : INK.inkSoft, inkLoop([[120, -112], [140, -60], [140, 60], [120, 112]].map(X), { seed: sd + 61, t }));
            pen.d('cmwin', 'top', INK.paperDark, inkCircle(...X([40, -35]), 13 * s, sd + 62, t, { fill: true }));
            // radio blackout
            const los = T('los', null);
            if (los != null && lt >= los) {
              const k = spring(lt, los, 0.5), wx = cx - 40 + 260, wy = cy - 250;
              let wv = '';
              for (let i = 1; i <= 3; i++) wv += inkPath([[wx - 30 * i, wy - 22 * i], [wx, wy - 34 * i], [wx + 30 * i, wy - 22 * i]], { seed: sd + 70 + i, t, w: 5 });
              pen.d('waves', 'top', INK.blue, wv, 0.5);
              const z = 40 * k;
              pen.d('wx', 'top', INK.red, inkPath([[wx - z, wy - 60 - z], [wx + z, wy - 60 + z]], { seed: sd + 75, t, w: 10 }) + inkPath([[wx + z, wy - 60 - z], [wx - z, wy - 60 + z]], { seed: sd + 76, t, w: 10 }));
              pen.txt('losl', 'top', P.los_text || 'Sinyal yok', wx + 10, wy + 50, 56, { color: INK.red, s: k, op: clamp01(k * 2) });
            }
          }

          // ------------------------------------------------ recovery: flat-deck carrier, capsule bobbing in the sea, crew on deck
          if (mode === 'recovery') {
            const sea = H * 0.68, ship = spring(lt, T(P.ship_at ?? 'ship', 0), 0.9);
            // sea waves
            let wv = '';
            for (let r = 0; r < 5; r++) {
              const y = sea + 14 + r * 62, q = [];
              for (let i = 0; i <= 24; i++) { const x = i / 24 * W * 1.05 - 20; q.push([x, y + Math.sin(i * 1.3 + t * 1.6 + r) * 9]); }
              wv += inkPath(q, { seed: sd + 200 + r, t, w: r === 0 ? 6 : 4 });
            }
            pen.d('seaf', 'bg', INK.blue, inkLoop([[-30, sea], [W + 30, sea], [W + 30, H + 30], [-30, H + 30]], { seed: sd + 199, t, smooth: false }), 0.18);
            pen.d('waves', 'bg', INK.inkSoft, wv);
            // carrier silhouette (flat deck + island), slides in from the right
            const ox = (1 - ship) * W * 0.5, bob = Math.sin(t * 0.9) * 4;
            const deckY = H * (P.deck_y ?? 0.5) + bob, x0 = W * 0.34 + ox, x1 = W * 1.04 + ox;
            const hull = [[x0, deckY], [x1, deckY], [x1, sea + 30 + bob], [x0 + 90, sea + 30 + bob]];
            pen.d('hullf', 'mid', INK.paperDark, inkLoop(hull, { seed: sd + 210, t, smooth: false }));
            pen.d('hullr', 'mid', INK.ink, inkPath(hull, { seed: sd + 210, t, closed: true, w: 7, smooth: false }));
            pen.d('deck', 'mid', INK.ink, inkPath([[x0 - 30, deckY], [x1, deckY]], { seed: sd + 211, t, w: 12, smooth: false }));
            let ports = ''; for (let i = 0; i < 9; i++) ports += inkCircle(x0 + 160 + i * 110, deckY + 70, 9, sd + 220 + i, t, { fill: true });
            pen.d('ports', 'mid', INK.inkSoft, ports);
            const isl = [[x1 - 330, deckY], [x1 - 330, deckY - 170], [x1 - 190, deckY - 170], [x1 - 190, deckY - 250], [x1 - 160, deckY - 250], [x1 - 160, deckY - 170], [x1 - 120, deckY - 170], [x1 - 120, deckY]];
            pen.d('islf', 'mid', INK.paperDark, inkLoop(isl, { seed: sd + 230, t, smooth: false }));
            pen.d('islr', 'mid', INK.ink, inkPath(isl, { seed: sd + 230, t, closed: true, w: 6, smooth: false }));
            const flag = Math.sin(t * 4) * 8;
            pen.d('flag', 'mid', INK.red, inkLoop([[x1 - 160, deckY - 250], [x1 - 100, deckY - 238 + flag], [x1 - 160, deckY - 222]], { seed: sd + 231, t }));
            if (P.ship_name) pen.txt('sname', 'top', P.ship_name, x0 + 520, deckY + 150, 56, { color: INK.ink });
            // capsule bobbing in the water with its flotation collar
            const cpx = W * (P.capsule_x ?? 0.16), cpy = sea + 40 + Math.sin(t * 1.4) * 10, rot = Math.sin(t * 1.1) * 0.08;
            const C = [[-90, 30], [-30, -90], [30, -90], [90, 30]].map(q => [cpx + q[0] * Math.cos(rot) - q[1] * Math.sin(rot), cpy + q[0] * Math.sin(rot) + q[1] * Math.cos(rot)]);
            pen.d('capf', 'top', INK.paperLight, inkLoop(C, { seed: sd + 240, t, smooth: false }));
            pen.d('capr', 'top', INK.ink, inkPath(C, { seed: sd + 240, t, closed: true, w: 6, smooth: false }));
            pen.d('collar', 'top', INK.gold, inkLoop([[cpx - 120, cpy + 20], [cpx + 120, cpy + 20], [cpx + 110, cpy + 50], [cpx - 110, cpy + 50]], { seed: sd + 241, t }), 0.85);
            pen.d('collarr', 'top', INK.ink, inkPath([[cpx - 120, cpy + 20], [cpx + 120, cpy + 20], [cpx + 110, cpy + 50], [cpx - 110, cpy + 50]], { seed: sd + 241, t, closed: true, w: 4 }));
            let foam = ''; for (let i = 0; i < 3; i++) { const r = 140 + ((t * 40 + i * 50) % 150); foam += inkPath([[cpx - r, cpy + 54], [cpx - r * 0.5, cpy + 62], [cpx, cpy + 58], [cpx + r * 0.5, cpy + 62], [cpx + r, cpy + 54]], { seed: sd + 250 + i, t, w: 3 }); }
            pen.d('foam', 'top', INK.inkSoft, foam, 0.7);
          }

          // ------------------------------------------------ note + Kaşif
          if (P.note) {
            const N = typeof P.note === 'string' ? { text: P.note } : P.note, a = T(N.at || 'note', dur * 0.5), k = spring(lt, a, 0.6);
            if (k > 0.001) {
              const b = boil(sd + 990, t, 1.5);
              pen.txt('note', 'top', N.text, (N.x ?? 0.5) * W + b[0], (N.y ?? 0.12) * H + b[1], N.size || 68, { color: N.color === 'ink' ? INK.ink : INK.red, s: lerp(0.6, 1, k), op: clamp01(k * 2), rot: -2 });
            }
          }
          pen.end();
          const gyF = (P.ground ?? 0.9) * H;
          crew.forEach(f => figUpdate(f, lt, t, T, W, H, (P.crew_y ?? 0.9) * H));
          if (kas) figUpdate(kas, lt, t, T, W, H, gyF);
        },
      };
    },
  };

  // ---------------------------------------------------------------- cabin: spacecraft interior (second type in this file)
  // SHOTS.cabin P: {
  //   windows: [{x: 0.78, y: 0.32, r: 110, view: "stars"|"moon"|"earth"|"farside"}] (round port holes in the back wall),
  //   panel: {x: 0.06, w: 0.34, y: 0.21, h: 0.1} | false (control panel: dials with wobbling needles, switch rows, blinking lights),
  //   alarm: cue (lights flash red from then on), shake: cue (camera jolts: the bang), cold: true (frost on the windows +
  //   breath puffs above the crew), dark: true (powered down: hatched walls, dead lights), box: {x, at, text} (the
  //   cardboard "mailbox" with a hose on the floor), label: {text, x, y: 0.12, at},
  //   crew: [{x, pose, face, at, then, seq, to, dur, emotion, text, scale}] (bare-headed figures), crew_scale: 0.95, floor: 0.8 (floor line, above the subtitles),
  //   kasif: {x, pose, at, then, seq, to, dur, scale: 0.95, ...}, zoom: 1.06
  // }
  // cues: alarm, shake, box.at, label.at, figure "at"/seq names
  SH.cabin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const layers = { bg: el(cam, 'g'), mid: el(cam, 'g'), fx: el(cam, 'g'), top: el(root, 'g') };
      const crewG = el(cam, 'g'), kG = el(cam, 'g');
      const pen = mkPen(layers), sd = seed * 1000;
      const crew = typeof KASIF !== 'undefined' ? (P.crew || []).map((m, i) => figMake(crewG, m, false, seed + 20 + i * 7, P.crew_scale ?? 0.95)) : [];
      const kas = (P.kasif && typeof KASIF !== 'undefined') ? figMake(kG, typeof P.kasif === 'object' ? P.kasif : { pose: P.kasif }, true, seed + 3, 1.0) : null;
      const r0 = rng(seed * 5 + 9);
      const stars = Array.from({ length: 40 }, () => [r0() * 2 - 1, r0() * 2 - 1]);
      const WINS = P.windows || [{ x: 0.78, y: 0.32, r: 110, view: 'stars' }];
      const gy = H * (P.floor ?? 0.8);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, T = (k, fb) => atOr(cues, k, fb);
          pen.begin();
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const sh = P.shake ? T(P.shake, null) : null;
          let jx = 0, jy = 0;
          if (sh != null && lt >= sh) { const e = Math.exp(-(lt - sh) * 4); jx = Math.sin((lt - sh) * 50) * 26 * e; jy = Math.cos((lt - sh) * 43) * 16 * e; }
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(jx)} ${f1(jy)}) translate(${f1(W / 2)} ${f1(H * 0.6)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.6)})`);
          // cabin shell: curved ceiling, back wall, floor
          const shell = [[W * 0.02, gy], [W * 0.02, H * 0.31], [W * 0.12, H * 0.2], [W * 0.88, H * 0.2], [W * 0.98, H * 0.31], [W * 0.98, gy]];
          pen.d('wall', 'bg', INK.paperLight, inkLoop(shell, { seed: sd + 1, t, smooth: false }), 0.55);
          pen.d('wallr', 'bg', INK.ink, inkPath(shell, { seed: sd + 1, t, w: 8, smooth: false }));
          pen.d('floor', 'bg', INK.ink, inkPath([[0, gy], [W, gy]], { seed: sd + 2, t, w: 8 }));
          let ribs = '';
          [0.22, 0.5, 0.64].forEach((u, i) => ribs += inkPath([[W * u, H * 0.21], [W * u, gy]], { seed: sd + 3 + i, t, w: 3 }));
          ribs += inkPath([[W * 0.03, H * 0.62], [W * 0.97, H * 0.62]], { seed: sd + 8, t, w: 3 });
          pen.d('ribs', 'bg', INK.inkSoft, ribs, 0.6);
          let riv = '';
          for (let i = 0; i < 19; i++) riv += inkCircle(W * (0.14 + i * 0.04), H * 0.23, 4, sd + 20 + i, t, { fill: true });
          pen.d('rivets', 'bg', INK.inkSoft, riv);
          if (P.dark) {
            let hd = '';
            for (let i = 0; i < 26; i++) { const x = W * (0.03 + i * 0.037); hd += inkPath([[x, H * 0.66], [x + 60, H * 0.58]], { seed: sd + 50 + i, t, w: 3 }); }
            pen.d('hatch', 'bg', INK.inkSoft, hd, 0.55);
          }
          // hanging cable loop
          const cb = []; for (let i = 0; i <= 10; i++) { const u = i / 10; cb.push([W * (0.42 + u * 0.16), H * 0.21 + Math.sin(u * Math.PI) * (90 + Math.sin(t * 1.3) * 8)]); }
          pen.d('cable', 'bg', INK.ink, inkPath(cb, { seed: sd + 30, t, w: 6 }));
          // windows
          WINS.forEach((wd, i) => {
            const cx = wd.x * W, cy = wd.y * H, r = (wd.r ?? 110) * spring(lt, 0.05 + i * 0.1, 0.7) + 1;
            pen.d('wf' + i, 'mid', INK.inkSoft, inkCircle(cx, cy, r, sd + 100 + i, t, { fill: true }), 0.9);
            let st = '';
            stars.forEach((q, j) => { const x = cx + q[0] * r * 0.8 + ((t * 6) % 30) * (wd.view === 'farside' ? -1 : 0), y = cy + q[1] * r * 0.8; if (Math.hypot(x - cx, y - cy) < r - 12 && j % 2 === i % 2) st += inkCircle(x, y, 2.5, sd + 110 + j, t, { fill: true }); });
            pen.d('ws' + i, 'mid', INK.paperLight, st, 0.85);
            if (wd.view === 'moon' || wd.view === 'farside') {
              const mx = cx + r * 0.25 - (wd.view === 'farside' ? ((lt * 18) % (r * 1.2)) : 0), my = cy + r * 0.45, mr = r * 0.9;
              const arc = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; arc.push([mx + Math.cos(a) * mr, my + Math.sin(a) * mr * 0.55]); }
              pen.d('wm' + i, 'mid', INK.paperDark, inkLoop(arc.concat([[mx + mr, cy + r], [mx - mr, cy + r]]), { seed: sd + 130 + i, t }));
              let cr = ''; for (let k = 0; k < 4; k++) cr += inkCircle(mx - mr * 0.5 + k * mr * 0.32, my - mr * 0.2 + (k % 2) * 16, 12 + (k % 3) * 6, sd + 140 + k, t, { w: 3 });
              pen.d('wmc' + i, 'mid', INK.inkSoft, cr);
            }
            if (wd.view === 'earth') {
              const ex = cx + Math.sin(t * 0.3) * 8, ey = cy, er = r * 0.38;
              pen.d('we' + i, 'mid', INK.paperLight, inkCircle(ex, ey, er, sd + 150 + i, t, { fill: true }));
              pen.d('wec' + i, 'mid', INK.blue, inkLoop([[ex - er * 0.4, ey - er * 0.2], [ex, ey - er * 0.5], [ex + er * 0.2, ey], [ex - er * 0.2, ey + er * 0.4]], { seed: sd + 151 + i, t }), 0.6);
            }
            if (P.cold) {
              let fr = ''; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + 0.3; fr += inkPath([[cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)], [cx + Math.cos(a + 0.12) * (r - 30), cy + Math.sin(a + 0.12) * (r - 30)]], { seed: sd + 160 + k, t, w: 3 }); }
              pen.d('frost' + i, 'mid', INK.paperLight, fr);
            }
            pen.d('wr' + i, 'mid', INK.ink, inkCircle(cx, cy, r, sd + 100 + i, t, { w: 14 }) + inkCircle(cx, cy, r + 24, sd + 170 + i, t, { w: 5 }));
          });
          // control panel
          if (P.panel !== false) {
            const Pn = P.panel || {}, px = (Pn.x ?? 0.06) * W, pw = (Pn.w ?? 0.34) * W, py = H * (Pn.y ?? 0.21), ph = H * (Pn.h ?? 0.1);
            const box = [[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]];
            pen.d('pf', 'mid', INK.paperDark, inkLoop(box, { seed: sd + 200, t, smooth: false }));
            pen.d('pr', 'mid', INK.ink, inkPath(box, { seed: sd + 200, t, closed: true, w: 6, smooth: false }));
            const alarm = P.alarm ? T(P.alarm, null) : null, alarmOn = alarm != null && lt >= alarm;
            let dials = '', needles = '';
            for (let i = 0; i < 4; i++) {
              const dx = px + pw * (0.14 + i * 0.24), dy = py + ph * 0.32, dr = Math.min(40, pw * 0.09, ph * 0.24);
              dials += inkCircle(dx, dy, dr, sd + 210 + i, t, { w: 4 });
              const a = -Math.PI * 0.75 + (P.dark ? 0 : (0.6 + 0.35 * Math.sin(t * (1.3 + i * 0.4) + i))) * Math.PI * (alarmOn && i < 2 ? 0.1 : 1);
              needles += inkPath([[dx, dy], [dx + Math.cos(a) * dr * 0.8, dy + Math.sin(a) * dr * 0.8]], { seed: sd + 220 + i, t, w: 4 });
            }
            pen.d('dials', 'mid', INK.ink, dials);
            pen.d('needles', 'mid', alarmOn ? INK.red : INK.ink, needles);
            let sw = '', lit = '', litR = '';
            for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) {
              const x = px + pw * (0.08 + i * 0.115), y = py + ph * (0.7 + r * 0.22), up = Math.sin(i * 7.3 + r * 3) > 0;
              sw += inkPath([[x, y], [x + (up ? 5 : -5), y - Math.min(22, ph * 0.14)]], { seed: sd + 230 + r * 8 + i, t, w: 4 });
              const on = !P.dark && Math.sin(t * (2 + i * 0.7) + r * 5 + i) > 0.2;
              if (alarmOn && Math.floor(t * 4) % 2 === 0 && i % 2 === 0) litR += inkCircle(x + 18, y - 6, 8, sd + 260 + r * 8 + i, t, { fill: true });
              else if (on) lit += inkCircle(x + 18, y - 6, 7, sd + 260 + r * 8 + i, t, { fill: true });
            }
            pen.d('switch', 'mid', INK.ink, sw);
            pen.d('lit', 'mid', INK.gold, lit);
            pen.d('litr', 'mid', INK.red, litR);
          }
          // cardboard mailbox on the floor
          if (P.box) {
            const B = P.box, k = spring(lt, T(B.at, 0.4), 0.6), bx = (B.x ?? 0.5) * W, by = gy - 4;
            if (k > 0.01) {
              const q = [[bx - 80 * k, by], [bx + 80 * k, by], [bx + 80 * k, by - 130 * k], [bx - 80 * k, by - 130 * k]];
              pen.d('boxf', 'fx', INK.gold, inkLoop(q, { seed: sd + 300, t, smooth: false }), 0.6);
              pen.d('boxr', 'fx', INK.ink, inkPath(q, { seed: sd + 300, t, closed: true, w: 5, smooth: false }) + inkPath([[bx - 80 * k, by - 70 * k], [bx + 80 * k, by - 70 * k]], { seed: sd + 301, t, w: 9 }));
              const hp = inkSpline([[bx + 80 * k, by - 90 * k], [bx + 160, by - 220], [bx + 120, H * 0.3]], false);
              pen.d('hose', 'fx', INK.ink, inkPath(hp, { seed: sd + 302, t, w: 18, taper: 0 }));
              if (B.text) pen.txt('boxt', 'top', B.text, bx, by - 160 * k - 20, 50, { s: k });
            }
          }
          // breath puffs (cold)
          if (P.cold) {
            let bp = '';
            (P.crew || []).concat(P.kasif ? [P.kasif] : []).forEach((m, i) => {
              for (let j = 0; j < 2; j++) { const ph = (t * 0.5 + i * 0.3 + j * 0.5) % 1, x = ((m.to ?? m.x) ?? 0.5) * W + 40 * (faceOf(m.face) || 1) + ph * 30, y = gy - 470 * (m.scale ?? 0.95) - ph * 80; bp += inkCircle(x, y, 10 + ph * 18, sd + 400 + i * 2 + j, t, { w: 3 }); }
            });
            pen.d('breath', 'fx', INK.inkSoft, bp, 0.7);
          }
          if (P.label) {
            const L = P.label, k = spring(lt, T(L.at, dur * 0.4), 0.6);
            if (k > 0.001) { const b = boil(sd + 500, t, 1.5); pen.txt('label', 'top', L.text, (L.x ?? 0.5) * W + b[0], (L.y ?? 0.12) * H + b[1], L.size || 66, { color: L.color === 'ink' ? INK.ink : INK.red, s: lerp(0.6, 1, k), op: clamp01(k * 2), rot: -2 }); }
          }
          pen.end();
          crew.forEach(f => figUpdate(f, lt, t, T, W, H, gy));
          if (kas) figUpdate(kas, lt, t, T, W, H, gy);
        },
      };
    },
  };
})();
