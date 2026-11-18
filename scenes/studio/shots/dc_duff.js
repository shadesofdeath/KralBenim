// dc_duff: shots for the Stickstory Short "The Duff children" (2026-11-18): in August 1864 Isaac (9), Jane (7) and
// Frank (nearly 4) got lost in the mallee scrub of the Wimmera, Victoria, for nine days and eight nights. More than 30
// locals searched until a thunderstorm erased the tracks; on cold nights Jane covered Frank with her dress; three
// Wotjobaluk trackers (Dick-a-Dick, Jerry, Fred) picked up the trail again and found all three alive.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif, LH.label). Parametric: any
// "lost in the bush" story (children, walkers, trackers, searchers in scrub country).
//
// Common params
//   gy: ground line 0..1 H (default 0.73, figures stand on it) · front: top of the foreground sand 0..1 H (0.77)
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   trees: [[x 0..1, scale, tone 0..1 (0 = near/dark .. 1 = far/pale), dy px]] mallee trees (multi-stemmed scrub gums)
//   bushes: [[x 0..1, scale]] big cropped broom bushes in the foreground (cut by the frame bottom)
//   wind: 0..1 (sway)
// Figures (fig): kinds "man" (shirt, trousers, dark hair, optional beard), "boy" (Isaac: shirt, braces), "girl" (Jane:
//   long blue dress, plait with a red bow; chemise: true = white under-dress), "tot" (Frank: red smock).
//
// SHOTS.dc_bush — the three children in the scrub. P: {mode, kids: {x, s}, trees, bushes, kasif, cairn, labels}
//   mode "hook": they stand lost among tall mallee, looking round (cue "hit" = a small start);
//   "walk": they walk left to right (Isaac and Jane carry broom bundles, Frank holds Jane's hand); P.walk {x0, x1};
//   "ask": Kaşif thinks, then points at three tiny figures walking on the horizon (cue "who");
//   "end": Kaşif waves beside a memorial stone; P.cairn {x, s}; the children walk home small in the distance.
// SHOTS.dc_search — people in the scrub. P: {mode, men: [{x, s, kind, beard, tone}], labels}
//   mode "search": a line of searchers with lanterns calling across the scrub, small footprints in the sand
//   (the trail they keep missing); "trackers": three men walk in single file, the leader bends and points at the
//   ground (cue "hit"), name tags (labels); "find": sunrise under a big mallee, the three children sit exhausted,
//   a tracker kneels and offers his hand, on cue "alive" Jane stands up with Frank in her arms.
// SHOTS.dc_tracks — the ground close-up. P: {mode, prints: [[x, y, rot]], labels}
//   mode "storm": three trails of small shoe prints in the red sand; rain from the start, lightning on cue "storm",
//   the prints fill with water and vanish on cue "gone"; "read": a tracker crouches and points at one faint print
//   and a snapped twig (gold ring, cue "hit"), then a gold dotted trail draws itself into the distance (cue "trail").
// SHOTS.dc_night — the children under the stars. P: {labels}: Isaac and Frank asleep on the sand by a fallen log,
//   Jane in her white chemise sits beside Frank; on cue "dress" she spreads her blue dress over him; breath puffs.
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const R2 = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const PI2 = Math.PI * 2;
  const SAND = () => mix(INK.stain, INK.paperLight, 0.5);
  const SAND_D = () => mix(INK.stain, INK.paperDark, 0.35);
  const PRINT = () => mix(INK.stain, INK.ink, 0.35);
  const LEAF = () => mix(INK.green, INK.paperLight, 0.12);
  const LEAF_D = () => mix(INK.green, INK.ink, 0.3);
  const BARK = () => mix(INK.stain, INK.ink, 0.45);
  const TROU = () => mix(INK.ink, INK.inkSoft, 0.45);
  const SHIRT = () => mix(INK.paperLight, INK.paperDark, 0.25);
  const DRESS = () => mix(INK.blue, INK.paperLight, 0.25);
  const SMOCK = () => mix(INK.red, INK.paperLight, 0.45);
  const HAIR = () => mix(INK.stain, INK.ink, 0.6);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const fade = (c, k) => mix(c, INK.paper, k);
  // P.derive {name: [base cue, seconds]} adds cue "name" = base + seconds (e.g. show a tag a beat earlier/later)
  const derive = (cues, D) => { if (!D) return cues; const c = Object.assign({}, cues); for (const k in D) { const b = cues && cues[D[k][0]]; if (b != null) c[k] = b + D[k][1]; } return c; };

  function twoBone(a, b, l1, l2, bend) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const mx = l1 + l2 - 0.5; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    d = Math.max(d, Math.abs(l1 - l2) + 1);
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) * bend;
    return [[a[0] + Math.cos(base + al) * l1, a[1] + Math.sin(base + al) * l1], [a[0] + dx, a[1] + dy]];
  }

  // ------------------------------------------------------------------ figure (units: ground y = 0, facing +x)
  const KD = {
    man: { th: 95, sh: 95, to: 140, hr: 42, cw: 34, ua: 74, fa: 70, lw: 26 },
    boy: { th: 72, sh: 70, to: 106, hr: 44, cw: 28, ua: 56, fa: 54, lw: 22 },
    girl: { th: 66, sh: 64, to: 98, hr: 43, cw: 26, ua: 52, fa: 50, lw: 9 },
    tot: { th: 44, sh: 42, to: 72, hr: 42, cw: 24, ua: 38, fa: 36, lw: 18 },
  };
  function fig(parent, sd, kind = 'man', o = {}) {
    const K = KD[kind] || KD.man, g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const shadow = E(INK.ink, { 'fill-opacity': 0.12 });
    const armB = E(), armBi = E(kind === 'tot' ? SMOCK() : kind === 'girl' ? DRESS() : SHIRT()), handB = E(INK.paperLight), handBR = E();
    const legO = E(), legI = E(kind === 'tot' ? mix(INK.paperLight, INK.stain, 0.2) : TROU()), shoes = E(INK.ink);
    const body = E(kind === 'girl' ? DRESS() : kind === 'tot' ? SMOCK() : SHIRT()), bodyR = E(), det = E();
    const carry = E(LEAF_D()), carryS = E(BARK());
    const armF = E(), armFi = E(kind === 'tot' ? SMOCK() : kind === 'girl' ? DRESS() : SHIRT()), hands = E(INK.paperLight), handsR = E();
    const plait = E(HAIR()), bow = E(INK.red), stick = E(BARK()), sweat = E(mix(INK.blue, INK.paperLight, 0.35)), sweatR = E();
    const head = E(INK.paperLight), hair = E(kind === 'man' ? INK.ink : HAIR()), beard = E(INK.ink), headR = E(), face = E();
    return {
      // st: {face, ph (walk phase), crouch 0..1, lean (deg), tilt (deg), armF/armB ([x, y] units from the shoulder, facing
      //   frame), reachF/reachB ([x, y] stage px), mouth 0..1, brow -1..1, rot (rad: lie down, PI/2 = head towards +x),
      //   lift (units), chemise, beard, bundle (broom bundle in the back hand), tone 0..1, sit 0..1 (legs forward)}
      update(t, x, gy, s, st = {}) {
        const fc = st.face ?? 1, k = sd, rot = st.rot || 0, tone = st.tone || 0;
        const T = p => { const q = rot ? R2(p, rot) : p; return [x + fc * q[0] * s, gy + (q[1] - (st.lift || 0)) * s]; };
        const toLocal = P => [(P[0] - x) / (fc * s), (P[1] - gy) / s];
        const cr = st.crouch || 0, sit = st.sit || 0, walking = st.ph != null, a = (st.ph || 0) * PI2;
        const leg = K.th + K.sh;
        let hip = [-cr * 12, -leg * (1 - 0.45 * cr) - (walking ? Math.abs(Math.sin(a)) * 4 : 0) + Math.sin(t * 2.2 + sd) * 1.2];
        if (sit) hip = [lerp(hip[0], 0, sit), lerp(hip[1], -K.hr * 0.4, sit)];
        let fN, fB;
        if (walking) { fN = [Math.sin(a) * K.th * 0.42, -Math.max(0, Math.cos(a)) * K.th * 0.16]; fB = [-Math.sin(a) * K.th * 0.42, -Math.max(0, -Math.cos(a)) * K.th * 0.16]; }
        else { fN = [lerp(16, K.th * 0.62, cr), 0]; fB = [lerp(-14, -K.th * 0.22, cr), 0]; }
        if (sit) { fN = [lerp(fN[0], leg * 0.92, sit), 0]; fB = [lerp(fB[0], leg * 0.8, sit), 0]; }
        const lean = ((st.lean || 0) + cr * 22) * Math.PI / 180;
        const TF = (px, py) => add(hip, R2([px, py], lean));
        const neck = TF(0, -K.to), sho = TF(0, -K.to + 14);
        const hc = add(neck, R2([0, -(K.hr + 6)], lean + (st.tilt || 0) * Math.PI / 180));
        // legs
        const L = [fB, fN].map(f => { const [kn, ft] = twoBone(hip, f, K.th, K.sh, sit ? 1 : -1); return [hip, kn, ft]; });
        const lw = K.lw, isStick = kind === 'girl';
        legO.setAttribute('d', L.map((l, i) => inkPath(l.map(T), { w: (isStick ? 7 : lw + 8) * s, seed: k + 1 + i, t, taper: 0 })).join(' '));
        legI.setAttribute('d', isStick ? '' : L.map((l, i) => inkPath(l.map(T), { w: (lw - 2) * s, seed: k + 3 + i, t, taper: 0, amp: 0.6 })).join(' '));
        shoes.setAttribute('d', L.map((l, i) => { const p = T([l[2][0] + 8, l[2][1] - 4]); return inkDot(p[0], p[1], 17 * s, 9 * s, k + 5 + i, t); }).join(' '));
        // arms
        const arm = (tgt, reach, def, bend, i) => {
          let tg = reach ? toLocal(reach) : add(sho, tgt || def);
          return twoBone(sho, tg, K.ua, K.fa, bend);
        };
        const sw = walking ? Math.sin(a) * 26 : Math.sin(t * 1.6 + sd) * 3;
        const [eB, hB] = arm(st.armB, st.reachB, [-12 - sw, K.ua + K.fa - 14], 1, 0);
        const [eF, hF] = arm(st.armF, st.reachF, [14 + sw, K.ua + K.fa - 14], 1, 1);
        const AW = (kind === 'man' ? 22 : 18) * s;
        armB.setAttribute('d', inkPath([sho, eB, hB].map(T), { w: AW + 8 * s, seed: k + 10, t, taper: 0.1 }));
        armBi.setAttribute('d', inkPath([sho, eB, [lerp(eB[0], hB[0], 0.75), lerp(eB[1], hB[1], 0.75)]].map(T), { w: AW - 2 * s, seed: k + 11, t, taper: 0.1, amp: 0.6 }));
        armF.setAttribute('d', inkPath([sho, eF, hF].map(T), { w: AW + 8 * s, seed: k + 12, t, taper: 0.1 }));
        armFi.setAttribute('d', inkPath([sho, eF, [lerp(eF[0], hF[0], 0.75), lerp(eF[1], hF[1], 0.75)]].map(T), { w: AW - 2 * s, seed: k + 13, t, taper: 0.1, amp: 0.6 }));
        const pB = T(hB), pF = T(hF);
        handB.setAttribute('d', inkDot(pB[0], pB[1], 11 * s, 11 * s, k + 14, t)); handBR.setAttribute('d', inkCircle(pB[0], pB[1], 11 * s, k + 16, t, { w: 3.5 }));
        hands.setAttribute('d', inkDot(pF[0], pF[1], 11 * s, 11 * s, k + 15, t));
        handsR.setAttribute('d', inkCircle(pF[0], pF[1], 11 * s, k + 17, t, { w: 3.5 }));
        // clothes
        const cw = K.cw, fl = walking ? Math.sin(a) * 6 : Math.sin(t * 1.4 + sd) * 2;
        let BP, D = [];
        if (kind === 'girl' || kind === 'tot') {
          const hem = kind === 'girl' ? (st.chemise ? K.th * 0.6 : K.th * 0.95) : K.th * 0.55, hw = kind === 'girl' ? cw * 1.9 : cw * 1.6;
          const sk = sit ? leg * 0.35 * sit : 0;
          BP = [TF(-cw, -K.to + 10), TF(cw, -K.to + 10), TF(cw * 0.85, -K.to * 0.5), TF(hw + fl + sk, hem - sk * 0.6), TF(-hw * 0.9 + fl, hem), TF(-cw * 0.85, -K.to * 0.5)];
          D.push(inkPath([TF(-cw * 0.8, -K.to * 0.45), TF(cw * 0.8, -K.to * 0.45)].map(T), { w: 3.5 * s + 1, seed: k + 20, t }));
          if (kind === 'girl' && !st.chemise) D.push(inkPath([TF(-hw * 0.7, hem - 14), TF(hw * 0.75 + sk * 0.8, hem - 14 - sk * 0.5)].map(T), { w: 3 * s + 1, seed: k + 21, t }));
        } else {
          BP = [TF(-cw, -K.to + 8), TF(cw, -K.to + 8), TF(cw * 0.92, 8), TF(-cw * 0.92, 8)];
          D.push(inkPath([TF(-cw * 0.9, -2), TF(cw * 0.9, -2)].map(T), { w: 5 * s + 1, seed: k + 20, t }));
          if (kind === 'boy') D.push(inkPath([TF(-cw * 0.4, -K.to + 8), TF(-cw * 0.3, -4)].map(T), { w: 4 * s + 1, seed: k + 21, t }), inkPath([TF(cw * 0.45, -K.to + 8), TF(cw * 0.3, -4)].map(T), { w: 4 * s + 1, seed: k + 22, t }));
          else D.push(inkPath([TF(cw * 0.1, -K.to + 8), TF(cw * 0.18, -K.to * 0.55)].map(T), { w: 3 * s + 1, seed: k + 21, t }));
        }
        body.setAttribute('fill', kind === 'girl' && st.chemise ? INK.paperLight : fade(st.shirt || (kind === 'girl' ? DRESS() : kind === 'tot' ? SMOCK() : SHIRT()), tone));
        armBi.setAttribute('fill', fade(st.shirt || (kind === 'tot' ? SMOCK() : kind === 'girl' ? DRESS() : SHIRT()), tone)); armFi.setAttribute('fill', fade(st.shirt || (kind === 'tot' ? SMOCK() : kind === 'girl' ? DRESS() : SHIRT()), tone));
        body.setAttribute('d', inkLoop(BP.map(T), { seed: k + 23, t, amp: 0.9 }));
        bodyR.setAttribute('d', inkPath(BP.map(T), { w: 5 * s + 1, seed: k + 24, t, closed: true, amp: 0.9 }));
        det.setAttribute('d', D.join(' '));
        // broom bundle in the back hand
        if (st.bundle) {
          const b0 = add(hB, [-4, -6]), S = [], C = [];
          for (let i = 0; i < 7; i++) { const ang = -0.5 - i * 0.12 + Math.sin(t * 2 + i) * 0.03, Ln = 120 + (i % 3) * 18; const tip = add(b0, [Math.cos(ang + Math.PI) * Ln * 0.5, Math.sin(ang) * Ln]); S.push(inkPath([b0, add(b0, [-(Ln * 0.25), -Ln * 0.55]), tip].map(T), { w: 3 * s + 1, seed: k + 30 + i, t })); C.push(inkCircle(...T(tip), 10 * s, k + 40 + i, t, { fill: true, n: 8 })); }
          carryS.setAttribute('d', S.join(' ')); carry.setAttribute('d', C.join(' '));
        } else blank(carry, carryS);
        // a long walking stick in the back hand
        if (st.stick) { const top = add(hB, R2([10, -K.ua * 1.6], 0.12)), bot = [hB[0] + 16, 0]; stick.setAttribute('d', inkPath([top, hB, bot].map(T), { w: 9 * s + 1, seed: k + 80, t, taper: 0.2 })); } else stick.setAttribute('d', '');
        // head, hair, face
        const hp = T(hc), r = K.hr * s;
        head.setAttribute('d', inkCircle(hp[0], hp[1], r, k + 50, t, { fill: true }));
        headR.setAttribute('d', inkCircle(hp[0], hp[1], r, k + 51, t, { w: 5 * Math.sqrt(s) + 1 }));
        const Hd = (ang, rr) => { const q = add(hc, R2([Math.cos(ang) * rr, Math.sin(ang) * rr], lean)); return T(q); };
        const range = kind === 'boy' ? [175, 330] : kind === 'tot' ? [200, 320] : kind === 'girl' ? [120, 335] : [150, 335];
        const HP = [];
        for (let i = 0; i <= 8; i++) HP.push(Hd((range[0] + (range[1] - range[0]) * i / 8) * Math.PI / 180, K.hr * 1.1));
        for (let i = 8; i >= 0; i--) { const an = (range[0] + (range[1] - range[0]) * i / 8) * Math.PI / 180; HP.push(Hd(an, K.hr * (0.62 + 0.25 * Math.abs(Math.cos(an))))); }
        hair.setAttribute('d', inkLoop(HP, { seed: k + 52, t, amp: 0.8 }));
        if (kind === 'girl') {
          const p0 = Hd(150 * Math.PI / 180, K.hr), sway = Math.sin(t * 2 + sd) * 5;
          const pl = [p0, [p0[0] - fc * (14 + sway) * s, p0[1] + 34 * s], [p0[0] - fc * (10 + sway) * s, p0[1] + 74 * s]];
          plait.setAttribute('d', inkPath(pl, { w: 16 * s + 2, seed: k + 53, t, taper: 0.4 }));
          const b = pl[1];
          bow.setAttribute('d', inkLoop([[b[0], b[1]], [b[0] - 16 * s, b[1] - 10 * s], [b[0] - 16 * s, b[1] + 10 * s]], { seed: k + 54, t, smooth: false, amp: 0.5 }) + ' ' + inkLoop([[b[0], b[1]], [b[0] + 16 * s, b[1] - 10 * s], [b[0] + 16 * s, b[1] + 10 * s]], { seed: k + 55, t, smooth: false, amp: 0.5 }));
        } else blank(plait, bow);
        if (st.beard) {
          const BB = []; for (let i = 0; i <= 8; i++) BB.push(Hd((25 + 100 * i / 8) * Math.PI / 180, K.hr * 1.08));
          BB.push(Hd(118 * Math.PI / 180, K.hr * 0.72), Hd(75 * Math.PI / 180, K.hr * 0.78), Hd(32 * Math.PI / 180, K.hr * 0.8));
          beard.setAttribute('d', inkLoop(BB, { seed: k + 56, t, amp: 0.7 }));
        } else beard.setAttribute('d', '');
        const lk = st.look || [0, 0], br = st.brow || 0, F = [];
        const eyes = [[0.18, -0.12], [0.6, -0.14]].map(q => add(hc, R2([(q[0] + lk[0]) * K.hr, (q[1] + lk[1]) * K.hr], lean)));
        const blink = ((t + sd * 0.37) % 3.7) < 0.12;
        eyes.forEach((e, i) => { const p = T(e); F.push(blink || st.sleep ? inkPath([[p[0] - 6 * s, p[1]], [p[0] + 6 * s, p[1]]], { w: 3 * s + 1, seed: k + 60 + i, t }) : inkDot(p[0], p[1], 5 * s + 1, 5.5 * s + 1, k + 60 + i, t)); });
        eyes.forEach((e, i) => { const q0 = add(e, R2([-10, -16 - br * 4 + (i ? -br * 5 : br * 5)], lean)), q1 = add(e, R2([10, -16 - br * 4 + (i ? br * 5 : -br * 5)], lean)); if (!st.sleep) F.push(inkPath([q0, q1].map(T), { w: 3.5 * s + 1, seed: k + 62 + i, t, amp: 0.4 })); });
        const mo = st.mouth || 0, mc = T(add(hc, R2([0.42 * K.hr, 0.44 * K.hr], lean)));
        if (!st.beard) F.push(mo > 0.05 ? inkCircle(mc[0], mc[1], (4 + 7 * mo) * s, k + 64, t, { w: 3.5 * s + 1 }) : inkPath([[mc[0] - 9 * s, mc[1]], [mc[0] + 9 * s, mc[1] + (st.smile ? -4 : 1) * s]], { w: 3.5 * s + 1, seed: k + 65, t, amp: 0.4 }));
        face.setAttribute('fill', INK.ink);
        face.setAttribute('d', F.join(' '));
        if (st.sweat) {
          const SW = [], SR = [];
          [[1.08, -0.2, 0]].forEach((q, i) => {
            const ph = ((t * 0.7 + q[2]) % 1), c = T(add(hc, R2([q[0] * K.hr, q[1] * K.hr + ph * 18], lean))), r0 = 7 * s;
            const D = [[c[0], c[1] - r0 * 2.2], [c[0] + r0, c[1]], [c[0], c[1] + r0], [c[0] - r0, c[1]]];
            SW.push(inkLoop(D, { seed: k + 82 + i, t, amp: 0.3 })); SR.push(inkPath(D, { w: 2.5 * s + 0.8, seed: k + 84 + i, t, closed: true, amp: 0.3 }));
          });
          sweat.setAttribute('d', SW.join(' ')); sweatR.setAttribute('d', SR.join(' '));
        } else blank(sweat, sweatR);
        const fp = T([0, 0]);
        shadow.setAttribute('d', rot ? '' : inkCircle(fp[0], gy + 4 * s, 70 * s, k + 70, t, { ry: 10 * s, fill: true }));
        return { head: hp, hands: [pB, pF], hip: T(hip), r, top: T(add(hc, [0, -K.hr])) };
      },
    };
  }

  // ------------------------------------------------------------------ mallee: a multi-stemmed scrub gum
  function mallee(parent, sd) {
    const stems = inkEl(parent, BARK()), cD = inkEl(parent, LEAF_D()), cL = inkEl(parent, LEAF()), cR = inkEl(parent);
    return {
      update(t, x, gy, s, o = {}) {
        const tone = o.tone || 0, n = o.n || 5, h = o.h || 560, sp = o.spread || 300, wind = o.wind ?? 0.5;
        stems.setAttribute('fill', fade(BARK(), tone)); cD.setAttribute('fill', fade(LEAF_D(), tone)); cL.setAttribute('fill', fade(LEAF(), tone)); cR.setAttribute('fill', fade(INK.ink, tone * 0.85));
        const S = [], D = [], Lt = [], RR = [];
        for (let i = 0; i < n; i++) {
          const f = n > 1 ? i / (n - 1) - 0.5 : 0, sw = Math.sin(t * 1.2 + i * 0.8 + sd) * 10 * s * (0.4 + wind);
          const bd = (o.bend || 0) * (0.8 + 0.2 * Math.sin(t * 3 + i)) * h * 0.22 * s;
          const base = [x + f * 40 * s, gy], tip = [x + f * sp * s * (0.8 + hn(sd, i) * 0.4) + sw + bd, gy - h * s * (0.72 + hn(sd + 1, i) * 0.3) + Math.abs(bd) * 0.25];
          const mid = [lerp(base[0], tip[0], 0.45) - f * 30 * s, lerp(base[1], tip[1], 0.5)];
          S.push(inkPath([base, mid, tip], { w: (16 - Math.abs(f) * 6) * s + 1.5, seed: sd + 10 + i, t, taper: 0.6 }));
          const tw = [tip[0] + (f + 0.3) * 70 * s, tip[1] + 30 * s];
          S.push(inkPath([[lerp(mid[0], tip[0], 0.5), lerp(mid[1], tip[1], 0.5)], tw], { w: 6 * s + 1, seed: sd + 30 + i, t, taper: 0.6 }));
          [[0, 0, 1], [-60, 24, 0.75], [62, 30, 0.8], [8, -38, 0.7]].forEach((b, j) => {
            const cx = tip[0] + b[0] * s + sw * 0.4, cy = tip[1] + b[1] * s, rx = 82 * b[2] * s, ry = 52 * b[2] * s;
            const pts = inkEllipsePts(cx, cy, rx, ry, sd + 50 + i * 7 + j, 11, 0, 0.12);
            D.push(inkLoop(pts.map(p => [p[0] + 6 * s, p[1] + 12 * s]), { seed: sd + 90 + i * 7 + j, t, amp: 0.8 }));
            Lt.push(inkLoop(pts.map(p => [lerp(cx, p[0], 0.86) - 6 * s, lerp(cy, p[1], 0.8) - 8 * s]), { seed: sd + 130 + i * 7 + j, t, amp: 0.8 }));
            RR.push(inkPath(pts, { w: 3.5 * Math.sqrt(s) + 0.8, seed: sd + 170 + i * 7 + j, t, closed: true, amp: 0.8 }));
          });
        }
        stems.setAttribute('d', S.join(' ')); cD.setAttribute('d', D.join(' ')); cL.setAttribute('d', Lt.join(' ')); cR.setAttribute('d', RR.join(' '));
      },
    };
  }

  // broom bush (broombush / Melaleuca): a dome of upward needle strokes
  function bush(parent, sd) {
    const f = inkEl(parent, LEAF_D()), n = inkEl(parent, LEAF()), r = inkEl(parent);
    return {
      update(t, x, gy, s, o = {}) {
        const tone = o.tone || 0, w = (o.w || 200) * s, h = (o.h || 170) * s;
        f.setAttribute('fill', fade(LEAF_D(), tone)); n.setAttribute('fill', fade(LEAF(), tone)); r.setAttribute('fill', fade(INK.ink, tone * 0.85));
        const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; dome.push([x + Math.cos(a) * w * (0.92 + hn(sd, i) * 0.16), gy + Math.sin(a) * h * (0.85 + hn(sd + 1, i) * 0.25)]); }
        dome.push([x + w, gy + 20 * s], [x - w, gy + 20 * s]);
        f.setAttribute('d', inkLoop(dome, { seed: sd + 2, t, amp: 1 }));
        const N = [], RR = [];
        for (let i = 0; i < 22; i++) {
          const fx = (hn(sd + 3, i) - 0.5) * 1.7, bx = x + fx * w, by = gy - h * (0.15 + hn(sd + 4, i) * 0.45), L = (40 + hn(sd + 5, i) * 50) * s, sw = Math.sin(t * 1.8 + i) * 4 * s;
          RR.push(inkPath([[bx, by], [bx + fx * 20 * s + sw, by - L]], { w: 3 * Math.sqrt(s) + 0.6, seed: sd + 10 + i, t, taper: 0.7 }));
          if (i % 2) N.push(inkCircle(bx + fx * 20 * s + sw, by - L, 9 * s, sd + 40 + i, t, { fill: true, n: 8 }));
        }
        n.setAttribute('d', N.join(' '));
        r.setAttribute('d', inkPath(dome.slice(0, 13), { w: 4.5 * Math.sqrt(s) + 0.6, seed: sd + 70, t }) + ' ' + RR.join(' '));
      },
    };
  }

  // foreground sand down to the frame bottom: wavy top, ripples, tufts, cropped big bushes, shoe prints
  function sandFront(parent, sd) {
    const E = (c, x) => inkEl(parent, c, x);
    const fill = E(SAND()), rip = E(SAND_D()), tufts = E(mix(INK.green, INK.stain, 0.4)), prints = E(PRINT(), { 'fill-opacity': 1 }), wet = E(mix(INK.blue, INK.paperLight, 0.3), { 'fill-opacity': 0 }), edge = E();
    const bg = el(parent, 'g'), B = [0, 1, 2, 3].map(i => bush(bg, sd + 300 + i * 97));
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, P = [];
        for (let i = 0; i <= 12; i++) P.push([-40 + i * (W + 80) / 12, top + Math.sin(i * 1.3 + sd) * 10 * u + hn(sd, i) * 12 * u]);
        fill.setAttribute('fill', o.night ? mix(SAND(), INK.blue, 0.35) : o.wet ? mix(SAND(), INK.blue, 0.18) : SAND());
        fill.setAttribute('d', inkLoop(P.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8 }));
        edge.setAttribute('d', inkPath(P, { w: 5, seed: sd + 2, t }));
        const RP = [];
        for (let i = 0; i < 10; i++) { const y = top + (60 + i * 62) * u + hn(sd + 3, i) * 20 * u, x0 = hn(sd + 4, i) * W * 0.6 - 60, L = (240 + hn(sd + 5, i) * 300) * u; if (y < H) RP.push(inkPath([[x0, y], [x0 + L * 0.5, y - 10 * u], [x0 + L, y + 3]], { w: 3.2, seed: sd + 10 + i, t, amp: 0.6 })); }
        rip.setAttribute('d', RP.join(' '));
        const TF = [];
        for (let i = 0; i < 9; i++) { const x = hn(sd + 6, i) * W, y = top + (30 + hn(sd + 7, i) * (H - top) / u * 0.8) * u, sw = Math.sin(t * 1.7 + i) * 4; for (let j = -2; j <= 2; j++) TF.push(inkPath([[x + j * 6 * u, y], [x + j * 14 * u + sw, y - (30 + (2 - Math.abs(j)) * 14) * u]], { w: 3.5, seed: sd + 20 + i * 5 + j, t, taper: 0.7 })); }
        tufts.setAttribute('d', TF.join(' '));
        // shoe prints: o.prints [[x, y (0..1), rot, size]] ; o.printK 0..1 visibility ; o.wetK 0..1 (water in them)
        const PR = [], WT = [];
        (o.prints || []).forEach((p, i) => {
          const x = p[0] * W, y = p[1] * H, a = p[2] || 0, sz = (p[3] || 1) * u;
          const sole = inkEllipsePts(0, 0, 30 * sz, 13 * sz, sd + 400 + i, 10).map(q => { const v = R2(q, a); return [x + v[0], y + v[1]]; });
          const heel = inkEllipsePts(-40 * sz, 0, 12 * sz, 10 * sz, sd + 450 + i, 8).map(q => { const v = R2(q, a); return [x + v[0], y + v[1]]; });
          PR.push(inkLoop(sole, { seed: sd + 500 + i, t, amp: 0.5 }), inkLoop(heel, { seed: sd + 550 + i, t, amp: 0.5 }));
          WT.push(inkLoop(sole.map(q => [lerp(x, q[0], 0.7), lerp(y, q[1], 0.6)]), { seed: sd + 600 + i, t, amp: 0.5 }));
        });
        prints.setAttribute('fill', o.dark ? mix(INK.stain, INK.ink, 0.7) : PRINT()); prints.setAttribute('fill-opacity', (o.printK ?? 1).toFixed(3)); prints.setAttribute('d', PR.join(' '));
        wet.setAttribute('fill-opacity', (0.8 * (o.wetK || 0) * (o.printK ?? 1)).toFixed(3)); wet.setAttribute('d', WT.join(' '));
        const BK = o.bushes || [[0.03, 1.3], [0.5, 0.75], [0.97, 1.2]];
        B.forEach((b, i) => { const q = BK[i]; if (!q) { b.update(t, -9999, -9999, 0.01); return; } b.update(t, q[0] * W, H + 30 * u, q[1] * u, { w: 260, h: 300 }); });
      },
    };
  }

  // rain streaks + splash rings on the ground
  function rain(parent, sd) {
    const st = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.3)), sp = inkEl(parent, mix(INK.blue, INK.paperLight, 0.2));
    return {
      update(t, W, y0, y1, gy0, k = 1) {
        const S = [], P = [];
        if (k > 0.01) for (let i = 0; i < 110 * k; i++) {
          const span = y1 - y0 + 200, ph = (hn(sd, i) * span + t * 1500 * (0.8 + hn(sd + 1, i) * 0.4)) % span, x = hn(sd + 2, i) * (W + 300) - ph * 0.25, y = y0 - 100 + ph, L = 50 + hn(sd + 3, i) * 50;
          S.push(inkPath([[x, y], [x - L * 0.25, y + L]], { w: 4.5, seed: sd + 10 + i, t, amp: 0.3, taper: 0.5 }));
        }
        if (k > 0.01) for (let i = 0; i < 16 * k; i++) {
          const ph = (t * 1.6 + hn(sd + 4, i)) % 1, x = hn(sd + 5, i) * W, y = gy0 + hn(sd + 6, i) * (y1 - gy0);
          P.push(inkPath(inkEllipsePts(x, y, 10 + ph * 34, 3 + ph * 9, sd + 20 + i, 10), { w: 3.5 * (1 - ph) + 0.5, seed: sd + 40 + i, t, closed: true, amp: 0.4 }));
        }
        st.setAttribute('d', S.join(' ')); sp.setAttribute('d', P.join(' '));
      },
    };
  }

  // twinkling four-point stars
  function stars(parent, sd) {
    const f = inkEl(parent, INK.paperLight), g = inkEl(parent, INK.gold);
    return {
      update(t, W, y0, y1, n = 18) {
        const F = [], G = [];
        for (let i = 0; i < n; i++) {
          const x = hn(sd, i) * W, y = y0 + hn(sd + 1, i) * (y1 - y0), r = (6 + hn(sd + 2, i) * 10) * (0.6 + 0.4 * Math.sin(t * (2 + hn(sd + 3, i) * 2) + i));
          if (x < W * 0.42 && y < 300) continue;
          const pts = [[x, y - r * 2], [x + r * 0.35, y - r * 0.35], [x + r * 2, y], [x + r * 0.35, y + r * 0.35], [x, y + r * 2], [x - r * 0.35, y + r * 0.35], [x - r * 2, y], [x - r * 0.35, y - r * 0.35]];
          (i % 4 ? F : G).push(inkLoop(pts, { seed: sd + 10 + i, t, smooth: false, amp: 0.4 }));
        }
        f.setAttribute('d', F.join(' ')); g.setAttribute('d', G.join(' '));
      },
    };
  }

  // breath puffs (cold air)
  function breath(parent, sd) {
    const f = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.8 }), r = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.3));
    return {
      update(t, p, k = 1, dir = 1) {
        if (!p) { blank(f, r); return; }
        const F = [], R = [];
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.45 + i / 3) % 1, rr = (6 + ph * 20) * k * Math.sin(Math.PI * Math.min(1, ph * 1.3)); if (rr < 2) continue;
          const x = p[0] + dir * (10 + ph * 60) * k, y = p[1] - ph * 50 * k;
          F.push(inkCircle(x, y, rr, sd + i, t, { fill: true, n: 9 })); R.push(inkCircle(x, y, rr, sd + i, t, { w: 2.5, n: 9 }));
        }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // lantern carried by a searcher
  function lantern(parent, sd) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.25 }), body = inkEl(parent, mix(INK.gold, INK.paperLight, 0.3)), rim = inkEl(parent);
    return {
      update(t, p, s) {
        const x = p[0], y = p[1] + 40 * s + Math.sin(t * 3 + sd) * 3 * s, fl = 0.85 + 0.15 * Math.sin(t * 11 + sd);
        glow.setAttribute('d', inkCircle(x, y, 70 * s * fl, sd, t, { fill: true }));
        const B = [[x - 18 * s, y - 26 * s], [x + 18 * s, y - 26 * s], [x + 22 * s, y + 26 * s], [x - 22 * s, y + 26 * s]];
        body.setAttribute('d', inkLoop(B, { seed: sd + 1, t, smooth: false, amp: 0.5 }));
        rim.setAttribute('d', inkPath(B, { w: 4 * s + 1, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 14 * s, y - 26 * s], [x, y - 44 * s], [x + 14 * s, y - 26 * s]], { w: 3.5 * s + 1, seed: sd + 3, t }) + ' ' + inkPath([p, [x, y - 44 * s]], { w: 3 * s + 1, seed: sd + 4, t }));
      },
    };
  }

  // back rows of scrub along the horizon + mid trees
  function scrubRows(root, sd, TR) {
    const far = el(root, 'g'), farB = Array.from({ length: 9 }, (_, i) => bush(far, sd + 10 + i * 13));
    const trees = (TR || []).map((q, i) => ({ q, m: mallee(el(root, 'g'), sd + 200 + i * 71) }));
    return {
      update(t, W, H, gy, wind, u, bend = 0) {
        farB.forEach((b, i) => b.update(t, (i + 0.5) / 9 * W + Math.sin(i * 2.1) * 30, gy - 170 * u, 0.5 * u, { tone: 0.62, w: 230, h: 130 }));
        trees.forEach(({ q, m }) => m.update(t, q[0] * W, gy + (q[3] || 0) * u, q[1] * u, { tone: q[2] || 0, wind, bend }));
      },
    };
  }

  const kids3 = (root, sd) => ({ isaac: fig(el(root, 'g'), sd + 1, 'boy'), jane: fig(el(root, 'g'), sd + 2, 'girl'), frank: fig(el(root, 'g'), sd + 3, 'tot') });

  // ------------------------------------------------------------------ SHOTS.dc_bush
  SH.dc_bush = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 411, u = W / 1080, mode = P.mode || 'hook', root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.77) * H, wind = P.wind ?? 0.5;
      const TR = P.trees || (mode === 'hook' ? [[0.08, 1.25, 0.15, -40], [0.9, 1.35, 0.1, -20], [0.62, 0.7, 0.45, -120], [0.3, 0.6, 0.5, -130]]
        : mode === 'walk' ? [[0.12, 0.8, 0.35, -80], [0.5, 0.65, 0.5, -130], [0.85, 1.0, 0.25, -50]]
        : [[0.06, 1.0, 0.2, -40], [0.55, 0.6, 0.5, -130], [0.92, 0.8, 0.3, -70]]);
      const rows = scrubRows(root, sd, TR);
      const far3 = mode === 'ask' ? [0, 1, 2].map(i => fig(el(root, 'g'), sd + 600 + i, 'man')) : null;
      const cairnG = mode === 'end' ? el(root, 'g') : null;
      const cF = cairnG ? inkEl(cairnG, mix(INK.paperDark, INK.inkSoft, 0.35)) : null, cR = cairnG ? inkEl(cairnG) : null, cP = cairnG ? inkEl(cairnG, mix(INK.gold, INK.paperLight, 0.35)) : null;
      const cT = cairnG ? [0, 1].map(() => window.LH.txt(cairnG, { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, fill: INK.ink })) : null;
      const kids = (mode === 'hook' || mode === 'walk') ? kids3(root, sd) : null;
      const kas = (mode === 'ask' || mode === 'end' || P.kasif) && P.kasif !== false ? window.LH.kasif(el(root, 'g'), Object.assign({ x: 0.32, y: P.gy ?? 0.73, scale: 1.05, pose: 'think', face: 'right', emotion: 'worried' }, P.kasif || {}), W, H, seed) : null;
      const front = sandFront(el(root, 'g'), sd + 800);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues0, env = {}) {
          const cues = derive(cues0, P.derive);
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.4);
          rows.update(t, W, H, gy, wind, u);
          if (far3) {
            far3.forEach((f, i) => {
              const ph = t * 1.5 + i * 0.3;
              // the trackers walk in from the right on cue "come" and stop at x 0.66 / 0.78 / 0.9
              void ph;
              const TK = P.trackers || {}, come = atOr(cues, 'come', dur * 0.45), pr = progIO(lt, come - 0.6, 1.4), s = (TK.s ?? 0.95) * u;
              const x = lerp(1.25 + i * 0.12, (TK.x ?? 0.66) + i * 0.12, pr) * W, walking = pr < 0.98;
              f.update(t, x, gy + (TK.dy ?? -60) * u - i * 14 * u, s * (1 - i * 0.05), { face: -1, ph: walking ? t * 1.5 + i * 0.3 : null, tone: 0.1 + i * 0.08, beard: i < 2, stick: i === 1, shirt: [mix(INK.blue, INK.paperLight, 0.45), mix(INK.stain, INK.paperLight, 0.35), mix(INK.green, INK.paperLight, 0.45)][i], lean: i === 0 ? 10 : 0, tilt: 12, look: [0.05, 0.15] });
            });
          }
          if (cairnG) {
            const C = P.cairn || {}, cx = (C.x ?? 0.68) * W, s = (C.s ?? 1) * u * (1 + 0.04 * punch(lt, atOr(cues, 'touch', -9), 0.7)), cyb = gy + 6 * u;
            const st = [[-110, 0, 70, 46], [0, 4, 80, 50], [105, 2, 66, 44], [-55, -82, 66, 42], [50, -84, 70, 44], [0, -160, 60, 40]];
            cF.setAttribute('d', st.map((q, i) => inkLoop(inkEllipsePts(cx + q[0] * s, cyb - 40 * s + q[1] * s, q[2] * s, q[3] * s, sd + 900 + i, 10, 0, 0.1), { seed: sd + 910 + i, t, amp: 0.8 })).join(' '));
            cR.setAttribute('d', st.map((q, i) => inkPath(inkEllipsePts(cx + q[0] * s, cyb - 40 * s + q[1] * s, q[2] * s, q[3] * s, sd + 900 + i, 10, 0, 0.1), { w: 5, seed: sd + 920 + i, t, closed: true, amp: 0.8 })).join(' ') + ' ' + inkPath([[cx - 50 * s, cyb - 120 * s], [cx + 50 * s, cyb - 122 * s], [cx + 48 * s, cyb - 60 * s], [cx - 48 * s, cyb - 58 * s]], { w: 4, seed: sd + 930, t, closed: true, smooth: false }));
            cP.setAttribute('d', inkLoop([[cx - 50 * s, cyb - 120 * s], [cx + 50 * s, cyb - 122 * s], [cx + 48 * s, cyb - 60 * s], [cx - 48 * s, cyb - 58 * s]], { seed: sd + 931, t, smooth: false, amp: 0.5 }));
            const TX = C.text || ['DUFF', '1864'], fs = (C.size ?? 25) * s;
            cT.forEach((e, i) => { e.textContent = TX[i] || ''; e.setAttribute('x', cx.toFixed(1)); e.setAttribute('y', (cyb - (100 - i * 30) * s).toFixed(1)); e.setAttribute('font-size', fs.toFixed(1)); });
          }
          if (kids) {
            const K = P.kids || {};
            if (mode === 'hook') {
              const sc = (K.s ?? 1.35) * u, cx = (K.x ?? 0.5) * W, st0 = 1 - 0.06 * punch(lt, hit, 0.6);
              const look = Math.sin(t * 0.9) * 14;
              // Jane hugs Frank (he presses against her), Isaac looks back into the scrub; all scared, sweating
              const fx = cx + 120 * sc, fr = kids.frank.update(t, fx, gy + 6 * u, sc * 1.05 * st0, { face: -1, tilt: -14, brow: 1, mouth: 0.35, sweat: true, look: [0, -0.1], armF: [36, 30], armB: [30, 40] });
              kids.jane.update(t, cx + 20 * sc, gy, sc * st0, { face: 1, tilt: 10 + look * 0.3, brow: 1, mouth: 0.3 + 0.1 * Math.sin(t * 3), sweat: true, reachF: [fx + 30 * sc, gy - 150 * sc], reachB: [fx - 10 * sc, gy - 110 * sc] });
              kids.isaac.update(t, cx - 130 * sc, gy + 4 * u, sc * st0, { face: -1, tilt: -look, brow: 1, mouth: 0.4 + 0.3 * punch(lt, hit, 1), sweat: true, armF: [40, -80 - 10 * Math.sin(t * 2)] });
              void fr;
            } else {
              const WK = P.walk || {}, x0 = (WK.x0 ?? 0.2) * W, x1 = (WK.x1 ?? 0.5) * W, prg = lt / Math.max(1, dur), sc = (K.s ?? 1.05) * u;
              const bx = lerp(x0, x1, prg), ph = (bx - x0) / (90 * sc) * 0.5;
              kids.isaac.update(t, bx + 230 * sc, gy, sc, { face: 1, ph: ph + 0.3, bundle: true, look: [0.1, 0] });
              const jx = bx + 40 * sc, fx = bx - 110 * sc;
              const fr = kids.frank.update(t, fx, gy + 2 * u, sc * 1.05, { face: 1, ph: ph * 1.5, reachF: [jx - 50 * sc, gy - 180 * sc] });
              kids.jane.update(t, jx, gy, sc, { face: 1, ph: ph + 0.6, bundle: true, reachB: fr.hands[1] });
            }
          }
          if (kas) kas.update(lt, t, cues);
          front.update(t, W, H, fy, { bushes: P.bushes, prints: P.prints, printK: P.printK, wetK: P.wetK, wet: !!P.wetK, dark: P.darkPrints });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.dc_search
  SH.dc_search = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523, u = W / 1080, mode = P.mode || 'search', root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.77) * H, wind = P.wind ?? 0.45;
      const E = (c, x) => inkEl(root, c, x);
      const sunF = mode === 'find' ? E(INK.gold, { 'fill-opacity': 0.5 }) : null, rays = mode === 'find' ? E(INK.gold) : null;
      const TR = P.trees || (mode === 'find' ? [[0.8, 1.45, 0.05, -10], [0.25, 0.6, 0.5, -130]] : mode === 'trackers' ? [[0.06, 1.1, 0.2, -30], [0.45, 0.62, 0.5, -130], [0.95, 0.9, 0.3, -60]] : [[0.5, 0.62, 0.5, -130], [0.92, 0.95, 0.25, -50]]);
      const rows = scrubRows(root, sd, TR);
      const MEN = P.men || (mode === 'search' ? [
        { x: 0.12, dy: -150, s: 0.48, tone: 0.45 }, { x: 0.42, dy: -120, s: 0.55, tone: 0.35 }, { x: 0.72, dy: -140, s: 0.5, tone: 0.4 },
        { x: 0.3, dy: 0, s: 1.0, call: true }, { x: 0.74, dy: 10, s: 1.08 }]
        : mode === 'trackers' ? [{ x: 0.64, s: 1.4, lead: true, beard: true, shirt: 'blue' }, { x: 0.45, s: 1.36, beard: true, stick: true, shirt: 'stain' }, { x: 0.2, s: 1.32, shirt: 'green', stick: true }]
        : [{ x: 0.3, s: 1.15, beard: true, kneel: true }]);
      const men = MEN.map((m, i) => ({ m, f: fig(el(root, 'g'), sd + 100 + i * 17, 'man'), l: mode === 'search' && !m.call ? lantern(el(root, 'g'), sd + 300 + i * 9) : null }));
      const kids = mode === 'find' ? kids3(root, sd + 700) : null;
      const front = sandFront(el(root, 'g'), sd + 800);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues0, env = {}) {
          const cues = derive(cues0, P.derive);
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          if (sunF) {
            const sx = 0.62 * W, sy = gy - 250 * u, r = 120 * u * (1 + 0.03 * Math.sin(t * 2));
            sunF.setAttribute('d', inkCircle(sx, sy, r, sd + 1, t, { fill: true }));
            const RY = []; for (let i = 0; i < 12; i++) { const a = Math.PI + i / 11 * Math.PI, r0 = r * 1.25, r1 = r * (1.9 + 0.25 * Math.sin(t * 2 + i)); RY.push(inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], { w: 7, seed: sd + 2 + i, t, taper: 0.5 })); }
            rays.setAttribute('d', RY.join(' '));
          }
          rows.update(t, W, H, gy, wind, u);
          men.forEach(({ m, f, l }, i) => {
            const s = m.s * u, y = gy + (m.dy || 0) * u;
            if (mode === 'search') {
              const x = m.x * W + lt * 14 * u * (i % 2 ? 1 : 0.7), ph = t * 0.7 + i * 0.37;
              const call = m.call ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
              const r = f.update(t, x, y, s, { face: i % 2 ? -1 : 1, ph, tone: m.tone || 0, mouth: m.call ? 0.6 + 0.4 * call : 0, reachF: m.call ? null : null, armF: m.call ? [46, -60] : [40, 50], armB: m.call ? [30, -64] : undefined, brow: 0.6, tilt: m.call ? -14 : 0 });
              if (l) l.update(t, r.hands[1], s);
            } else if (mode === 'trackers') {
              const x = m.x * W + lt * 8 * u, ph = t * 0.55 + i * 0.33, h = punch(lt, hit, 0.8), b = progIO(lt, hit - 0.3, 0.7);
              const SHC = { blue: mix(INK.blue, INK.paperLight, 0.45), stain: mix(INK.stain, INK.paperLight, 0.35), green: mix(INK.green, INK.paperLight, 0.45) };
              const pt = P.point ? [P.point[0] * W, P.point[1] * H] : null;
              f.update(t, x, y, s, m.lead ? { face: 1, ph: b > 0.5 ? null : ph, crouch: 0.35 * b, lean: 10 + 18 * b, tilt: 18 + 12 * b, reachF: pt && b > 0.05 ? [lerp(x + 120 * s, pt[0], b), lerp(y - 200 * s, pt[1] - 40 * u, b)] : null, armF: [70, 60], beard: true, shirt: SHC[m.shirt], brow: -0.2 + h * 0.6, look: [0.12, 0.3] }
                : { face: 1, ph, beard: m.beard, stick: m.stick, shirt: SHC[m.shirt], tilt: 10, look: [0.05, 0.15] });
            } else {
              const reach = progIO(lt, 0.2, 1.2);
              f.update(t, m.x * W, y, s, { face: 1, crouch: 0.85, beard: true, armF: [lerp(40, 120, reach), lerp(80, -10, reach)], tilt: 10, look: [0.1, 0.1], smile: true, brow: 0.3 });
            }
          });
          if (kids) {
            const al = atOr(cues, 'alive', dur * 0.5), up = progIO(lt, al - 0.2, 0.9), sc = (P.ks ?? 1.3) * u, bx = (P.kx ?? 0.62) * W;
            kids.isaac.update(t, bx + 150 * sc, gy + 8 * u, sc, { face: -1, sit: 1, sleep: lt < al - 0.4, tilt: -10 + 10 * up, brow: 0.8, armB: [-20, 60], armF: [30, 60] });
            const jx = bx - 30 * sc;
            const ja = kids.jane.update(t, jx, gy, sc, { face: -1, crouch: lerp(0.95, 0, up), brow: 0.6, reachF: [jx - 60 * sc, gy - lerp(70, 150, up) * sc], reachB: [jx - 30 * sc, gy - lerp(100, 190, up) * sc], tilt: -8 });
            kids.frank.update(t, jx - 50 * sc, gy - lerp(10, 125, up) * sc, sc * 0.95, { face: -1, sit: 1 - up, crouch: up * 0.6, sleep: lt < al - 0.2, tilt: 14, brow: 0.5, lift: 0 });
            void ja;
          }
          front.update(t, W, H, fy, { bushes: P.bushes, prints: P.prints });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.dc_tracks
  SH.dc_tracks = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 631, u = W / 1080, mode = P.mode || 'storm', root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? (mode === 'storm' ? 0.56 : 0.64)) * H;
      const E = (c, x) => inkEl(root, c, x);
      const TR = P.trees || (mode === 'storm' ? [[0.1, 0.9, 0.35, -360], [0.55, 0.7, 0.45, -400], [0.9, 1.0, 0.3, -340]] : [[0.88, 0.8, 0.35, -260], [0.5, 0.55, 0.5, -330]]);
      const rows = scrubRows(root, sd, TR);
      const bolt = mode === 'storm' ? E(INK.paperLight) : null, boltR = mode === 'storm' ? E() : null;
      const front = sandFront(el(root, 'g'), sd + 800);
      const trailG = E(INK.gold), ring = E(INK.gold), twig = E(BARK()), twigB = bush(el(root, 'g'), sd + 77);
      const tracker = mode === 'read' ? fig(el(root, 'g'), sd + 100, 'man') : null;
      const rn = mode === 'storm' ? rain(el(root, 'g'), sd + 900) : null;
      const LB = labels(root, P.labels, W, H);
      const PR = P.prints || (mode === 'storm' ? (() => {
        const A = []; [[0.66, 1.5], [0.74, 2.0], [0.84, 2.5]].forEach((row, r) => { for (let i = 0; i < 4; i++) A.push([0.14 + i * 0.24 + r * 0.04, row[0] + (i % 2 ? 0.02 : -0.02) - i * 0.015, -0.22, row[1]]); });
        return A;
      })() : [[0.62, 0.72, -0.3, 1.3], [0.74, 0.705, -0.3, 1.2], [0.86, 0.685, -0.3, 1.1]]);
      return {
        update(lt, dur, cues0, env = {}) {
          const cues = derive(cues0, P.derive);
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.35);
          rows.update(t, W, H, mode === 'storm' ? (P.rowsY ?? 0.62) * H : 0.68 * H, mode === 'storm' ? 1 : 0.4, u, mode === 'storm' ? (P.bend ?? 1) : 0);
          if (bolt) {
            const sAt = atOr(cues, 'storm', dur * 0.2), on = (lt > sAt && lt < sAt + 0.25) || (lt > sAt + 0.45 && lt < sAt + 0.6);
            const BP = (P.bolt || [[0.72, 0.38], [0.66, 0.43], [0.71, 0.44], [0.62, 0.5], [0.67, 0.51], [0.6, 0.57]]).map(q => [q[0] * W, q[1] * H]);
            bolt.setAttribute('d', on ? inkPath(BP, { w: 22, seed: sd + 3, t, smooth: false, taper: 0.4 }) : '');
            boltR.setAttribute('d', on ? inkPath(BP, { w: 5, seed: sd + 4, t, smooth: false }) : '');
          }
          let printK = 1, wetK = 0;
          if (mode === 'storm') { const g = atOr(cues, 'gone', dur * 0.6); wetK = clamp01(lt / Math.max(0.5, g)); printK = 1 - progIO(lt, g - 0.1, 1.1); }
          else printK = 0.55;
          front.update(t, W, H, fy, { bushes: P.bushes || [[0.02, 1.8], [0.98, 1.7]], prints: PR, printK, wetK, wet: mode === 'storm' });
          if (mode === 'read') {
            // the snapped twig on a small broom bush next to the first print
            const bx = (P.twig?.[0] ?? 0.54) * W, by = (P.twig?.[1] ?? 0.665) * H, h = punch(lt, hit, 0.8);
            twigB.update(t, bx, by, 0.7 * u, { w: 150, h: 130 });
            twig.setAttribute('d', inkPath([[bx + 40 * u, by - 70 * u], [bx + 80 * u, by - 120 * u], [bx + 120 * u, by - 106 * u]], { w: 7, seed: sd + 5, t, smooth: false }));
            const ra = spring(lt, hit - 0.1, 0.5);
            ring.setAttribute('d', lt > hit - 0.1 ? inkPath(inkEllipsePts(bx + 80 * u, by - 110 * u, 70 * u * ra * (1 + 0.15 * h), 60 * u * ra * (1 + 0.15 * h), sd + 6, 12), { w: 8, seed: sd + 7, t, closed: true }) : '');
            // gold dotted trail into the distance
            const tr = atOr(cues, 'trail', dur * 0.55), pr = progIO(lt, tr - 0.1, 1.4);
            const path = [[0.86, 0.685], [0.78, 0.66], [0.66, 0.645], [0.6, 0.628], [0.7, 0.612], [0.82, 0.6], [0.74, 0.588], [0.62, 0.58]].map(q => [q[0] * W, q[1] * H]);
            const D = [], n = 30;
            for (let i = 0; i < n * pr; i++) {
              const f = i / n * (path.length - 1), j = Math.floor(f), q = f - j, a = path[j], b = path[Math.min(path.length - 1, j + 1)];
              const x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q), r = (13 - f * 1.2) * u * (1 + 0.2 * Math.sin(t * 4 - i * 0.5));
              D.push(inkCircle(x, y, Math.max(3, r), sd + 40 + i, t, { fill: true, n: 8 }));
            }
            trailG.setAttribute('d', D.join(' '));
            const lean = progIO(lt, hit - 0.4, 0.6);
            tracker.update(t, (P.who?.x ?? 0.26) * W, gy + 30 * u, (P.who?.s ?? 1.55) * u, { face: 1, crouch: 0.9, beard: true, lean: 6 + 8 * lean, tilt: 26, look: [0.12, 0.3], reachF: [bx + lerp(-20, 70, lean) * u, by - lerp(160, 120, lean) * u], armB: [-10, 90], brow: -0.2 });
          } else blank(trailG, ring, twig);
          if (rn) rn.update(t, W, 0, H, fy, 1);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.dc_night
  SH.dc_night = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 733, u = W / 1080, root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.79) * H;
      const st = stars(el(root, 'g'), sd + 1);
      const rows = scrubRows(root, sd, P.trees || [[0.1, 1.0, 0.45, -60], [0.88, 1.15, 0.4, -40]]);
      const E = (c, x) => inkEl(root, c, x);
      const logF = E(BARK()), logR = E(), logE = E(mix(INK.stain, INK.paperLight, 0.3));
      const kids = kids3(root, sd + 100);
      const dressF = E(DRESS()), dressR = E(), dressD = E();
      const br = breath(el(root, 'g'), sd + 300), br2 = breath(el(root, 'g'), sd + 310);
      const front = sandFront(el(root, 'g'), sd + 800);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues0, env = {}) {
          const cues = derive(cues0, P.derive);
          const t = env.t ?? lt, dAt = atOr(cues, 'dress', dur * 0.45), cov = progIO(lt, dAt - 0.5, 1.3);
          st.update(t, W, 0.06 * H, 0.42 * H, 22);
          rows.update(t, W, H, gy, 0.25, u);
          // fallen log behind them
          const lx0 = -0.05 * W, lx1 = 0.84 * W, ly = gy - 120 * u, lr = 50 * u;
          const LG = [[lx0, ly - lr], [lx1, ly - lr * 0.9], [lx1 + 10 * u, ly + lr * 0.9], [lx0, ly + lr]];
          logF.setAttribute('d', inkLoop(LG, { seed: sd + 2, t, amp: 0.8 }));
          logE.setAttribute('d', inkCircle(lx1, ly, lr * 0.9, sd + 3, t, { fill: true }));
          logR.setAttribute('d', inkPath(LG, { w: 5, seed: sd + 4, t, closed: true }) + ' ' + inkCircle(lx1, ly, lr * 0.9, sd + 5, t, { w: 5 }) + ' ' + inkCircle(lx1, ly, lr * 0.45, sd + 6, t, { w: 3 }) + ' ' +
            [0.25, 0.45, 0.65].map((q, i) => inkPath([[lerp(lx0, lx1, q), ly - lr * 0.5], [lerp(lx0, lx1, q + 0.12), ly - lr * 0.45]], { w: 3, seed: sd + 7 + i, t })).join(' '));
          const sc = (P.s ?? 1.5) * u, br0 = Math.sin(t * 1.8) * 2, fx = (P.frank ?? 0.12) * W, jx = (P.jane ?? 0.66) * W;
          // Isaac asleep on the left (head towards the centre), Frank asleep in the middle, Jane sits on the right
          kids.isaac.update(t, (P.isaac ?? 0.88) * W, gy, sc * 0.95, { face: -1, sit: 1, sleep: true, tilt: 28 + br0, lean: -6, armF: [30, 70], armB: [20, 70] });
          const fr = kids.frank.update(t, fx, gy - 4 * u, sc * 1.1, { face: 1, rot: Math.PI / 2, lift: 36 + br0, sleep: true, armF: [20, 60], armB: [-10, 60] });
          const ja = kids.jane.update(t, jx, gy, sc, { face: -1, crouch: 0.9, chemise: true, tilt: -18 - 6 * cov, brow: 1, look: [0, 0.25],
            reachF: [lerp(jx - 110 * sc, fx + 230 * sc, cov), lerp(gy - 110 * sc, gy - 90 * sc, cov)], reachB: [lerp(jx - 80 * sc, fx + 120 * sc, cov), lerp(gy - 120 * sc, gy - 80 * sc, cov)] });
          // the dress: a folded bundle in her hands -> spread over Frank
          const h0 = ja.hands[1], h1 = ja.hands[0], fb = [fx + 30 * sc, gy - 60 * sc];
          const folded = [[h0[0] - 50 * sc, h0[1] - 30 * sc], [h1[0] + 40 * sc, h1[1] - 40 * sc], [h1[0] + 50 * sc, h1[1] + 40 * sc], [h0[0] - 40 * sc, h0[1] + 36 * sc]];
          const spread = [[fx - 30 * sc, gy - 70 * sc], [fx + 175 * sc, gy - 95 * sc], [fx + 205 * sc, gy - 5 * sc], [fx - 40 * sc, gy + 2 * sc]];
          const DP = folded.map((p, i) => [lerp(p[0], spread[i][0], cov), lerp(p[1], spread[i][1], cov) + Math.sin(t * 2 + i) * 3 * cov]);
          dressF.setAttribute('d', inkLoop(DP, { seed: sd + 20, t, amp: 1 }));
          dressR.setAttribute('d', inkPath(DP, { w: 5, seed: sd + 21, t, closed: true, amp: 1 }));
          dressD.setAttribute('d', [0.3, 0.55, 0.8].map((q, i) => inkPath([[lerp(DP[0][0], DP[1][0], q), lerp(DP[0][1], DP[1][1], q) + 6], [lerp(DP[3][0], DP[2][0], q), lerp(DP[3][1], DP[2][1], q) - 6]], { w: 3, seed: sd + 22 + i, t })).join(' '));
          br.update(t, [fr.head[0] - 10 * u, fr.head[1] - 20 * u], 1.1 * u, -1);
          br2.update(t + 1.3, [ja.head[0] - 30 * u, ja.head[1] + 10 * u], 1.0 * u, -1);
          front.update(t, W, H, fy, { bushes: P.bushes || [[0.0, 1.4], [0.45, 0.8], [1.0, 1.3]], night: true });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
