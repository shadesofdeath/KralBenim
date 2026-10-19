// kasif: the channel's fixed narrator character "Kaşif" (brand/kit/BRAND.md §2) as a hand-drawn SVG rig, plus the
// 2D shot "stage" (parchment stage with Kaşif, other cast members and simple ink props).
//
// KASIF.create(parentGroup, {scale: 1, hat: true, accessory: null|'laurel'|'beret'|'turban'|'helmet'|'crown', seed: 1})
//   -> {update(t, pose, opts), node}
//   t: global seconds (boil, breathing, blink) · pose: 'idle'|'walk'|'run'|'point'|'think'|'shock'|'shrug'|'talk'|
//   'wave'|'sit'|'hold'|'look' · opts: {x, y (stage px of the ground point under the hip), face: 1|-1 (or between,
//   while turning), ph (walk/run phase in cycles), since (s since this pose began), dir (point: deg, 0 = forward,
//   90 = up), mouth (0..1, narration), emotion ('neutral'|'surprised'|'worried'|'happy'|'angry'), text (hold: sign
//   text), item (hold: prop type instead of a sign), prev: {pose, ph, since, dir, ...}, mix (0..1 blend prev -> pose)}
// KASIF.gait(pose) -> rig units travelled per walk/run cycle (ph = distance / gait keeps the feet planted).
// Rig units: ground at y = 0, hat top ≈ -540; 1 unit = scale px.
//
// SHOTS.stage P: {cast: [{who: "kasif"|name, accessory, x: 0.3, y, scale, pose: "walk", to: 0.45, face: "right",
//   at: "w0" (cue name or seconds), then: "point", dir: "up"|"down"|"left"|"right"|"forward"|deg, text, item,
//   emotion, talk: true|false|[from, to], seq: [{at, pose, to, dur, dir, face, emotion, text, then}]}],
//   props: [{type: "sign|scroll|column|house|ship|volcano|bread|coin|map|clock|door|tree|rock", x, y, scale, at, text, flip}],
//   label: {text, x, y, size, at}, ground: true, bg: false}
// cues: whatever names the cast/props/label reference (w0, hit, ...). Walking with "to" + "at" arrives on the cue.
'use strict';

const KASIF = (() => {
  // skeleton lengths (rig units)
  const LEN = { thigh: 94, shin: 94, torso: 132, shoulder: 112, neck: 12, head: 72, upper: 70, fore: 66 };
  const HEAD_FX = 12;                       // 3/4 view: face features shifted toward the facing side
  const EMO = { neutral: [0, 0, 0.1], surprised: [12, 0, 1], worried: [3, 0.9, 0], happy: [6, 0, 0.7], angry: [-3, -0.9, 0] };
  const V = (x, y) => [x, y];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const rot = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // two-bone IK: root a, target b -> [joint, end]; picks the joint solution nearest to hint
  function ik(a, b, l1, l2, hint) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    const mx = l1 + l2 - 0.5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    d = Math.max(d, Math.abs(l1 - l2) + 1, 1);
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const j1 = [a[0] + Math.cos(base + al) * l1, a[1] + Math.sin(base + al) * l1];
    const j2 = [a[0] + Math.cos(base - al) * l1, a[1] + Math.sin(base - al) * l1];
    const dd = j => (j[0] - hint[0]) ** 2 + (j[1] - hint[1]) ** 2;
    return [dd(j1) <= dd(j2) ? j1 : j2, [a[0] + dx, a[1] + dy]];
  }

  // ---------------------------------------------------------------- poses
  // A pose is plain numbers (so any two blend): hip [x, y] over the ground origin, lean (deg, + = forward),
  // tilt (head, deg), sh (shoulder lift), fL/fR feet (ground coords), hL/hR hands and kL/kR elbow hints
  // (torso frame, relative to the shoulder, +x forward, +y down the torso), face: look [dx, dy], eye (size),
  // brow [lift, tilt (+ worried / - angry), arch], skew (one brow higher), smile (-1..1), open (0..1),
  // round (o-mouth), talk (narration gain), props: bino, sign, seat (0..1).
  const base = () => ({ hip: V(0, -184), lean: 2, tilt: 0, sh: 0, fL: V(-26, 0), fR: V(26, 0),
    hL: V(-36, 118), hR: V(36, 118), kL: V(-70, 60), kR: V(70, 60), look: V(0, 0), eye: 1, brow: [0, 0, 0.1], skew: 0,
    smile: 0.35, open: 0, round: 0, talk: 1, bino: 0, sign: 0, seat: 0 });
  const breathe = (p, t, k = 1) => { const b = Math.sin(t * 2.1); p.hip[1] += b * 1.6 * k; p.sh += b * 1.2 * k; p.tilt += Math.sin(t * 0.9 + 1) * 2.5 * k; return p; };

  // feet of a gait: stance (foot glued to the ground, moves back at body speed) then swing (arc forward)
  function gaitFoot(p, half, lift, f) {
    p = ((p % 1) + 1) % 1;
    if (p < f) return V(half * (1 - 2 * p / f), 0);
    const s = (p - f) / (1 - f);
    return V(-half + 2 * half * smooth(s), -lift * Math.sin(Math.PI * s) * (1 - 0.3 * s));
  }
  const GAIT = { walk: { half: 54, lift: 30, f: 0.5 }, run: { half: 70, lift: 62, f: 0.4 } };
  const gait = name => { const g = GAIT[name]; return g ? 2 * g.half / g.f : 0; };

  const POSES = {
    idle(t) {
      const p = breathe(base(), t), sw = Math.sin(t * 0.75);
      p.hip[0] += sw * 4; p.lean += sw * 1.5;
      p.hL = V(-36 + Math.sin(t * 1.1) * 3, 118); p.hR = V(36 - Math.sin(t * 1.3) * 3, 118);
      p.look = V(Math.sin(t * 0.4) * 2.5, 0);
      return p;
    },
    walk(t, o) {
      const g = GAIT.walk, ph = o.ph ?? t / 0.9, p = base();
      p.fL = gaitFoot(ph, g.half, g.lift, g.f); p.fR = gaitFoot(ph + 0.5, g.half, g.lift, g.f);
      p.hip = V(4, -179 + 4 * Math.cos(4 * Math.PI * ph));
      p.lean = 6; p.tilt = 2 * Math.cos(4 * Math.PI * ph);
      const a = Math.cos(2 * Math.PI * ph);           // arms swing against the legs
      p.hR = V(6 + 56 * a, 114 - 14 * Math.abs(a)); p.hL = V(6 - 56 * a, 114 - 14 * Math.abs(a));
      p.kL = V(-60, 50); p.kR = V(-60, 50);
      p.smile = 0.45;
      return p;
    },
    run(t, o) {
      const g = GAIT.run, ph = o.ph ?? t / 0.62, p = base();
      p.fL = gaitFoot(ph, g.half, g.lift, g.f); p.fR = gaitFoot(ph + 0.5, g.half, g.lift, g.f);
      p.hip = V(14, -170 - 9 * Math.abs(Math.sin(2 * Math.PI * ph)));
      p.lean = 20; p.tilt = -10;
      const a = Math.cos(2 * Math.PI * ph);
      p.hR = V(22 + 52 * a, 60 - 18 * a); p.hL = V(22 - 52 * a, 60 + 18 * a);
      p.kL = V(-40, 80); p.kR = V(-40, 80);
      p.brow = [2, -0.3, 0]; p.smile = 0.2; p.open = 0.25;
      return p;
    },
    point(t, o) {
      const p = breathe(base(), t), a = (o.dir ?? 12) + Math.sin(t * 3) * 1.5;
      const jab = 1 + 0.06 * Math.exp(-Math.max(0, (o.since ?? 1) - 0.18) * 8) * ((o.since ?? 1) > 0.18 ? 1 : 0);
      const r = 133 * jab, ar = a * Math.PI / 180;
      p.hR = V(Math.cos(ar) * r, -Math.sin(ar) * r + 8); p.kR = V(60, 70);
      p.hL = V(-18, 100); p.kL = V(-80, 46);                 // other hand on the hip
      p.lean = 4; p.tilt = -a * 0.12; p.look = V(4, -a * 0.04);
      p.brow = [4, 0, 0.5]; p.smile = 0.6; p.open = 0.12;
      return p;
    },
    think(t) {
      const p = breathe(base(), t, 0.6);
      p.hR = V(34, -40 + Math.sin(t * 5) * 2); p.kR = V(70, 40);    // knuckles under the chin, tapping
      p.hL = V(26, 46); p.kL = V(-40, 70);                           // other arm folded, holds the elbow
      p.tilt = -8 + Math.sin(t * 0.8) * 2; p.lean = 0;
      p.look = V(5, -6); p.brow = [4, 0.4, 0.2]; p.skew = 6; p.smile = -0.15;
      return p;
    },
    shock(t, o) {
      const s = o.since ?? 1, j = s < 0.5 ? Math.sin(Math.PI * s / 0.5) : 0, back = smooth(s / 0.32);
      const p = base(), shake = Math.sin(t * 47) * 2.2 * Math.exp(-s * 2.5);
      p.hip = V(-26 * back + shake, -180 - 46 * j);
      p.fL = V(-40 * back - 8 * j, -30 * j); p.fR = V(-6 * back + 8 * j, -24 * j);
      p.lean = -12; p.tilt = -6;
      p.hL = V(-64, -64 + Math.sin(t * 9) * 4); p.kL = V(-90, 10);
      p.hR = V(64, -76 + Math.cos(t * 9) * 4); p.kR = V(90, 0);
      p.eye = 1.45; p.brow = [13, 0.1, 1]; p.smile = 0; p.open = 0.75; p.round = 1;
      return p;
    },
    shrug(t) {
      const p = breathe(base(), t, 0.5), c = 0.5 + 0.5 * Math.sin(t * 2.6);
      p.sh = 6 + 8 * c;
      p.hL = V(-80, 22 - 6 * c); p.kL = V(-30, 80); p.hR = V(82, 20 - 6 * c); p.kR = V(30, 80);
      p.tilt = 10 + 2 * c; p.look = V(-3, -2);
      p.brow = [5, 0.85, 0]; p.smile = -0.3; p.talk = 0.6;
      return p;
    },
    talk(t) {
      const p = breathe(base(), t), g1 = Math.sin(t * 3.3), g2 = Math.sin(t * 2.1 + 1);
      p.hR = V(66 + 14 * g1, 44 + 22 * g2); p.kR = V(30, 90);
      p.hL = V(-26 + 12 * g2, 92 + 12 * g1); p.kL = V(-70, 50);
      p.lean = 4 + 2 * Math.sin(t * 1.7); p.tilt += 3 * Math.sin(t * 2.4);
      p.brow = [3 + 2 * g2, 0, 0.3]; p.smile = 0.45;
      return p;
    },
    wave(t) {
      const p = breathe(base(), t);
      p.hR = V(104 + 14 * Math.sin(t * 9), -78 - 12 * Math.cos(t * 9)); p.kR = V(110, 20);
      p.tilt = -4; p.look = V(3, -1);
      p.brow = [6, 0, 0.6]; p.smile = 0.9; p.open = 0.1;
      return p;
    },
    sit(t) {
      const p = breathe(base(), t, 0.7);
      p.hip = V(-8, -100 + Math.sin(t * 2.1) * 1.2);
      p.fL = V(70, 0); p.fR = V(92, 0); p.lean = 2;
      p.hL = V(82, 104); p.kL = V(10, 80); p.hR = V(98, 100); p.kR = V(20, 80);
      p.seat = 1; p.look = V(2, 1);
      return p;
    },
    hold(t) {
      const p = breathe(base(), t);
      p.hL = V(52, 48); p.kL = V(-10, 80); p.hR = V(70, 52); p.kR = V(0, 90);
      p.lean = 2; p.tilt = 3 + Math.sin(t * 1.4) * 2; p.sign = 1; p.smile = 0.55;
      return p;
    },
    look(t) {
      const p = breathe(base(), t, 0.5), scan = Math.sin(t * 0.6) * 5;
      p.lean = 6; p.tilt = -8 + scan;
      p.hL = V(62, -92); p.kL = V(60, -10); p.hR = V(80, -84); p.kR = V(70, 0);
      p.bino = 1; p.brow = [7, 0, 0.5]; p.smile = 0.2;
      return p;
    },
  };

  function blendPose(a, b, m) {
    if (m >= 1) return b;
    if (m <= 0) return a;
    const o = {};
    for (const k in b) {
      const x = a[k], y = b[k];
      o[k] = Array.isArray(y) ? y.map((v, i) => lerp(x[i], v, m)) : lerp(x, y, m);
    }
    return o;
  }
  function evalPose(t, name, o) {
    const p = (POSES[name] || POSES.idle)(t, o || {});
    if (o && o.emotion && EMO[o.emotion]) p.brow = EMO[o.emotion].slice();
    if (o && o.emotion === 'happy') p.smile = Math.max(p.smile, 0.8);
    if (o && (o.emotion === 'worried' || o.emotion === 'angry')) p.smile = Math.min(p.smile, -0.2);
    return p;
  }

  // ---------------------------------------------------------------- head-frame shapes
  const HAT = {
    crown: [[-56, -44], [-60, -84], [-48, -112], [-18, -120], [2, -110], [24, -122], [50, -114], [62, -86], [58, -44]],
    band: [[-58, -46], [-60, -68], [60, -70], [58, -46]],
    brim: [[-108, -38], [-72, -52], [-20, -56], [40, -54], [102, -48], [126, -38], [98, -28], [40, -32], [-20, -32], [-82, -28]],
  };
  const ACC = {
    beret: { fill: INK.blue, pts: [[-74, -40], [-70, -78], [-30, -100], [30, -100], [80, -80], [92, -54], [60, -42], [0, -46]], nub: [[4, -100], [8, -116]] },
    turban: { fill: INK.paperLight, pts: [[-74, -26], [-82, -70], [-56, -118], [0, -138], [56, -118], [82, -70], [74, -26], [0, -40]],
      folds: [[[-72, -60], [0, -80], [70, -64]], [[-60, -98], [0, -112], [56, -100]]], jewel: [6, -76] },
    helmet: { fill: INK.paperDark, pts: [[-76, -6], [-78, -60], [-50, -102], [0, -114], [50, -102], [78, -60], [76, -6], [40, -40], [-40, -40]],
      crest: [[-60, -100], [-30, -146], [20, -150], [56, -128], [52, -104], [10, -118], [-30, -112]] },
    crown: { fill: INK.gold, pts: [[-56, -50], [-62, -104], [-34, -78], [-14, -118], [6, -80], [30, -120], [46, -80], [66, -106], [60, -50]] },
  };

  function create(parent, cfg = {}) {
    const seed = cfg.seed ?? 1, sc = cfg.scale ?? 1;
    const hasHat = cfg.hat !== false, acc = hasHat ? null : (cfg.accessory || null);
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const shadow = [0.10, 0.08, 0.06].map((o, i) => el(g, 'ellipse', { fill: INK.ink, opacity: o }));
    const seatF = P(INK.paperDark), seatR = P(), seatL = P();
    const legL = P(), legR = P(), footL = P(), footR = P();
    const torso = P();
    const headF = P(INK.paperLight), headR = P();
    const eyes = [P(), P()], brows = [P(), P()], mouthF = P(), mouthR = P();
    // hat / accessory (head frame)
    const hat = hasHat ? { crownF: P(INK.hat), crownR: P(), bandF: P(INK.hatBand), brimF: P(INK.hat), brimR: P(), dent: P() } : null;
    const ac = acc && ACC[acc] ? { f: P(ACC[acc].fill), r: P(), x1: P(acc === 'turban' ? INK.red : acc === 'helmet' ? INK.red : INK.ink), x2: P() } : null;
    const laurel = acc === 'laurel' ? { f: P(INK.green), r: P() } : null;
    const binoF = P(INK.inkSoft), binoR = P(), binoL = P(INK.paperLight);
    const sign = el(g, 'g'), signF = inkEl(sign, INK.paperLight), signR = inkEl(sign), signStick = inkEl(sign);
    const signTxt = el(sign, 'text', { 'font-family': INK_FONT, 'font-size': 44, 'text-anchor': 'middle', fill: INK.ink });
    const armL = P(), armR = P(), handL = P(), handR = P();
    const itemG = el(g, 'g'); let item = null, itemType = null;

    const blinkAt = t => {           // one blink every ~4 s at a seeded moment
      const k = Math.floor((t + seed * 1.7) / 4), r = rng(inkHash(seed + 41, k)); r();
      const bt = k * 4 + 0.6 + r() * 2.6 - seed * 1.7;
      return t >= bt && t < bt + 0.13;
    };

    function update(t, pose, o = {}) {
      let p = evalPose(t, pose, o);
      if (o.prev && o.mix != null && o.mix < 1) p = blendPose(evalPose(t, o.prev.pose, o.prev), p, smooth(o.mix));
      const face = o.face ?? 1, s = sc * (o.scale ?? 1);
      g.setAttribute('transform', `translate(${inkF1(o.x ?? 0)} ${inkF1(o.y ?? 0)}) scale(${(face * s).toFixed(4)} ${s})`);
      g.style.opacity = o.alpha ?? 1;
      const S = (k) => seed * 100 + k;       // stroke seeds
      const ink = (pts, k, w, extra) => inkPath(pts, Object.assign({ w, seed: S(k), t, amp: 1.7 }, extra));
      // skeleton
      const hip = p.hip, up = rot(V(0, -1), p.lean);
      const sho = add(add(hip, [up[0] * LEN.shoulder, up[1] * LEN.shoulder]), [0, -p.sh]);
      const neck = add(hip, [up[0] * LEN.torso, up[1] * LEN.torso]);
      const tilt = p.lean * 0.6 + p.tilt;
      const hu = rot(V(0, -1), p.lean + p.tilt * 0.5);
      const hc = add(neck, [hu[0] * (LEN.neck + LEN.head - 4), hu[1] * (LEN.neck + LEN.head - 4)]);
      const H = (x, y) => add(hc, rot(V(x, y), tilt));
      const Hp = pts => pts.map(q => H(q[0], q[1]));
      const T = v => add(sho, rot(v, p.lean));
      // legs (IK, knees forward)
      for (const [leg, foot, f, k] of [[legL, footL, p.fL, 1], [legR, footR, p.fR, 2]]) {
        const [knee, end] = ik(hip, f, LEN.thigh, LEN.shin, [(hip[0] + f[0]) / 2 + 200, (hip[1] + f[1]) / 2]);
        leg.setAttribute('d', ink([hip, knee, end], k, 7));
        const ang = Math.max(-0.5, Math.min(0.5, (end[1] < -2 ? -0.35 : 0)));
        foot.setAttribute('d', inkLoop(inkEllipsePts(end[0] + 9, end[1] - 4, 19, 9, S(k + 10), 8, ang), { seed: S(k + 10), t, amp: 0.8 }));
      }
      torso.setAttribute('d', ink([hip, add(hip, [up[0] * 66 + 2, up[1] * 66]), neck, add(neck, [hu[0] * 14, hu[1] * 14])], 3, 7, { taper: 0.1 }));
      // seat (sit)
      const seatA = clamp01(p.seat);
      for (const e of [seatF, seatR, seatL]) e.style.opacity = seatA;
      if (seatA > 0.01) {
        const sx = hip[0], sy = 0, rk = [[-74, 0], [-70, -52], [-44, -88], [8, -94], [52, -80], [66, -40], [62, 0]].map(q => [sx + q[0], sy + q[1] * seatA]);
        seatF.setAttribute('d', inkLoop(rk, { seed: S(4), t }));
        seatR.setAttribute('d', ink(rk, 4, 5, { closed: true }));
        seatL.setAttribute('d', ink([[sx - 30, -40 * seatA], [sx - 4, -52 * seatA], [sx + 20, -44 * seatA]], 5, 3.5));
      }
      // shadow: shrinks while airborne
      const air = clamp01(-Math.min(p.fL[1], p.fR[1]) / 80), shx = hip[0] + 6;
      shadow.forEach((e, i) => {
        e.setAttribute('cx', shx); e.setAttribute('cy', 6);
        e.setAttribute('rx', (70 + i * 26) * (1 - 0.35 * air) * (seatA > 0.5 ? 1.25 : 1)); e.setAttribute('ry', 9 + i * 4);
      });
      // head
      const hpts = inkEllipsePts(0, 0, LEN.head, LEN.head * 0.97, S(20), 14).map(q => H(q[0], q[1]));
      headF.setAttribute('d', inkLoop(hpts, { seed: S(20), t, amp: 1.4 }));
      headR.setAttribute('d', ink(hpts, 20, 6, { closed: true, amp: 1.4 }));
      // face
      const fx = HEAD_FX, blink = blinkAt(t);
      const er = 7.5 * p.eye;
      [-1, 1].forEach((sd, i) => {
        const ex = fx + sd * 22 + p.look[0], ey = 6 + p.look[1];
        const c = H(ex, ey);
        eyes[i].setAttribute('d', blink ? inkPath([H(ex - 8, ey), H(ex + 8, ey)], { w: 4, seed: S(30 + i), t, amp: 0.6 })
          : inkDot(c[0], c[1], er, er * 1.08, S(30 + i), t, 0.6));
        const [lift, tl, arch] = p.brow, sk = sd * p.skew * 0.5;
        const by = -16 - lift - sk;
        const inner = [fx + sd * 9, by - tl * 8 + (tl < 0 ? -tl * 4 : 0)], outer = [fx + sd * 34, by + tl * 4];
        const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - arch * 5];
        brows[i].setAttribute('d', inkPath(Hp([inner, mid, outer]), { w: 4.5, seed: S(32 + i), t, amp: 0.8, taper: 0.5 }));
      });
      // mouth: closed lip loop; opens with narration (talk) or the pose (shock "o")
      const op = clamp01(p.open + p.talk * (o.mouth || 0) * 0.85), sm = p.smile;
      const hw = lerp(17, 9, p.round) * (1 - 0.15 * op), mx = fx + 3, my = 34;
      const upY = my - sm * 3 - op * 4 * p.round, loY = my + sm * 6 + op * 22;
      const lip = [[mx - hw, my - sm * 3], [mx, my + sm * 6 - (op > 0.05 ? op * 4 : 0)], [mx + hw, my - sm * 3], [mx, loY + 0.01]];
      if (p.round > 0.5) { lip[1] = [mx, upY - 4 * op]; }
      mouthF.setAttribute('d', inkLoop(Hp(lip), { seed: S(34), t, amp: 0.6 }));
      mouthF.style.opacity = op > 0.04 ? 1 : 0;
      mouthR.setAttribute('d', op > 0.04 ? inkPath(Hp(lip), { w: 4.5, seed: S(34), t, amp: 0.6, closed: true })
        : inkPath(Hp([lip[0], lip[1], lip[2]]), { w: 4.5, seed: S(34), t, amp: 0.6, taper: 0.4 }));
      // hat (Kaşif): turns with the head, never falls
      if (hat) {
        const cr = Hp(HAT.crown), bd = Hp(HAT.band), bm = Hp(HAT.brim);
        hat.crownF.setAttribute('d', inkLoop(cr, { seed: S(40), t }));
        hat.bandF.setAttribute('d', inkLoop(bd, { seed: S(41), t, smooth: false, amp: 1.2 }));
        hat.crownR.setAttribute('d', ink(HAT.crown.map(q => H(q[0], q[1])), 40, 5.5, { closed: true }));
        hat.brimF.setAttribute('d', inkLoop(bm, { seed: S(42), t }));
        hat.brimR.setAttribute('d', ink(bm, 42, 5.5, { closed: true }));
        hat.dent.setAttribute('d', ink(Hp([[-30, -104], [2, -98], [30, -108]]), 43, 3.5, { taper: 0.6 }));
      }
      if (ac) {
        const A = ACC[acc], pts = Hp(A.pts);
        ac.f.setAttribute('d', inkLoop(pts, { seed: S(50), t }));
        ac.r.setAttribute('d', ink(pts, 50, 5.5, { closed: true }));
        if (A.crest) { const c = Hp(A.crest); ac.x1.setAttribute('d', inkLoop(c, { seed: S(51), t })); ac.x2.setAttribute('d', ink(c, 51, 4.5, { closed: true })); }
        else if (A.jewel) { const j = H(A.jewel[0], A.jewel[1]); ac.x1.setAttribute('d', inkDot(j[0], j[1], 11, 13, S(51), t)); ac.x2.setAttribute('d', A.folds.map((f, i) => ink(Hp(f), 52 + i, 3.5)).join(' ')); }
        else if (A.nub) { ac.x2.setAttribute('d', ink(Hp(A.nub), 51, 6)); }
        else { // crown: jewels
          ac.x1.setAttribute('d', [[-34, -66], [6, -66], [44, -66]].map((q, i) => { const j = H(q[0], q[1]); return inkDot(j[0], j[1], 6, 6, S(53 + i), t); }).join(' '));
        }
      }
      if (laurel) {   // two leafy branches around the head
        let df = '', dr = '';
        for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) {
          const a = (-150 + i * 17) * Math.PI / 180, cx = fx * 0.4 + sd * Math.cos(a) * 74, cy = -8 + Math.sin(a) * 74 * 0.9;
          const lp = inkEllipsePts(0, 0, 15, 7, S(60 + i), 8).map(q => rot(q, (sd > 0 ? 180 - (-150 + i * 17) : -150 + i * 17) + 90 * sd)).map(q => H(cx + q[0], cy + q[1]));
          df += inkLoop(lp, { seed: S(60 + i + (sd > 0 ? 9 : 0)), t, amp: 0.7 }) + ' ';
          dr += ink(lp, 60 + i + (sd > 0 ? 9 : 0), 3, { closed: true, amp: 0.7 }) + ' ';
        }
        laurel.f.setAttribute('d', df); laurel.r.setAttribute('d', dr);
      }
      // binoculars (look): two barrels in front of the eyes
      const bA = clamp01(p.bino);
      for (const e of [binoF, binoR, binoL]) e.style.opacity = bA > 0.5 ? 1 : 0;
      if (bA > 0.5) {
        let df = '', dr = '', dl = '';
        [[-1, -10], [1, 6]].forEach(([sd, yy], i) => {
          const x0 = fx + sd * 20 - 14, bar = [[x0, yy - 17], [x0 + 74, yy - 22], [x0 + 74, yy + 22], [x0, yy + 17]];
          const bp = Hp(bar);
          df += inkLoop(bp, { seed: S(70 + i), t, smooth: false }) + ' ';
          dr += ink(bp, 70 + i, 4.5, { closed: true, smooth: false }) + ' ';
          const lc = H(x0 + 74, yy);
          dl += inkLoop(inkEllipsePts(lc[0], lc[1], 8, 21, S(72 + i), 8, (tilt) * Math.PI / 180), { seed: S(72 + i), t, amp: 0.6 }) + ' ';
        });
        binoF.setAttribute('d', df); binoR.setAttribute('d', dr); binoL.setAttribute('d', dl);
      }
      // arms (IK in the torso frame)
      const arm = (h, k) => { const hw2 = T(h), hint = T(k); return ik(sho, hw2, LEN.upper, LEN.fore, hint); };
      const [eL, wL] = arm(p.hL, p.kL), [eR, wR] = arm(p.hR, p.kR);
      // sign (hold): board between the hands, text stays readable when mirrored
      const sA = clamp01(p.sign);
      sign.style.opacity = sA > 0.5 && !o.item ? 1 : 0;
      if (sA > 0.5 && !o.item) {
        const txt = o.text || '';
        if (signTxt.textContent !== txt) signTxt.textContent = txt;
        const bw = Math.max(170, txt.length * 23 + 50), bh = 112;
        const cx = (wL[0] + wR[0]) / 2 + 30, cy = (wL[1] + wR[1]) / 2 - 64;
        const bd = [[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2 - 3], [cx + bw / 2 + 2, cy + bh / 2], [cx - bw / 2 + 1, cy + bh / 2 + 2]];
        signF.setAttribute('d', inkLoop(bd, { seed: S(80), t, smooth: false }));
        signR.setAttribute('d', ink(bd, 80, 5, { closed: true, smooth: false }));
        signStick.setAttribute('d', ink([[cx - 6, cy + bh / 2], [cx - 4, cy + bh / 2 + 52]], 81, 6));
        const b = boil(S(82), t, 0.8);
        signTxt.setAttribute('font-size', 44 / Math.max(0.5, Math.min(1.2, s)));
        signTxt.setAttribute('transform', `translate(${inkF1(cx + b[0])} ${inkF1(cy + 15 + b[1])}) scale(${face < 0 ? -1 : 1} 1)`);
      }
      // held prop (hold + item): a small stage prop between the hands
      if (o.item && sA > 0.5) {
        if (itemType !== o.item) { itemG.innerHTML = ''; item = INK_PROPS.make(itemG, o.item, seed + 7); itemType = o.item; }
        itemG.style.opacity = 1;
        const cx = (wL[0] + wR[0]) / 2 + 20, cy = (wL[1] + wR[1]) / 2 + 30;
        item.update(t, 0, { text: o.text });
        itemG.setAttribute('transform', `translate(${inkF1(cx)} ${inkF1(cy)}) scale(0.45)`);
      } else itemG.style.opacity = 0;
      armL.setAttribute('d', ink([sho, eL, wL], 6, 7));
      armR.setAttribute('d', ink([sho, eR, wR], 7, 7));
      handL.setAttribute('d', inkDot(wL[0], wL[1], 10.5, 10, S(8), t));
      handR.setAttribute('d', inkDot(wR[0], wR[1], 10.5, 10, S(9), t));
      return { head: hc, hip, hands: [wL, wR] };
    }
    return { update, node: g };
  }
  return { create, gait, mouthFromWords: (words, t) => inkTalk(t, words), POSES: Object.keys(POSES), LEN };
})();

// ---------------------------------------------------------------- props: simple ink drawings
// INK_PROPS.make(group, type, seed) -> {update(t, lt, opts)}. Units: origin = bottom centre on the ground, up is -y,
// most props ~200–320 units tall. Each def returns strokes [{p: points, c: closed, f: fill, w, s: smooth, o: opacity}]
// and optionally tf (an extra transform: bobbing ship, swaying tree) and txt ({text, x, y, size}).
const INK_PROPS = (() => {
  const D = {
    sign: (t, o) => {
      const tw = Math.max(200, (o.text || '').length * 26 + 60);
      return { strokes: [{ p: [[0, 0], [2, -190]], w: 9 },
        { p: [[-tw / 2, -300], [tw / 2, -304], [tw / 2 + 3, -186], [-tw / 2 + 2, -183]], c: 1, f: INK.paperLight, s: 0 },
        { p: [[-tw / 2 + 16, -205], [-tw / 2 + 50, -210]], w: 3, o: 0.5 }], txt: o.text ? { text: o.text, x: 0, y: -230, size: 52 } : null };
    },
    scroll: (t, o) => {
      const st = [{ p: [[-90, -250], [90, -252], [92, -60], [-88, -58]], c: 1, f: INK.paperLight, s: 0 },
        { p: inkEllipsePts(0, -252, 104, 15, 3), c: 1, f: INK.paperDark },
        { p: inkEllipsePts(0, -58, 104, 15, 4), c: 1, f: INK.paperDark }];
      if (!o.text) for (let i = 0; i < 4; i++) st.push({ p: [[-62, -212 + i * 34], [-10, -216 + i * 34], [60 - (i % 2) * 30, -210 + i * 34]], w: 4, o: 0.55 });
      return { strokes: st, txt: o.text ? { text: o.text, x: 0, y: -140, size: 46 } : null };
    },
    column: () => ({ strokes: [
      { p: [[-80, 0], [80, 0], [80, -26], [-80, -26]], c: 1, f: INK.paperLight, s: 0 },
      { p: [[-58, -26], [-54, -290], [54, -290], [58, -26]], c: 1, f: INK.paperLight, s: 0 },
      { p: [[-24, -34], [-22, -282]], w: 3.5, o: 0.6 }, { p: [[0, -34], [0, -282]], w: 3.5, o: 0.6 }, { p: [[24, -34], [22, -282]], w: 3.5, o: 0.6 },
      { p: [[-86, -290], [86, -290], [80, -318], [-80, -318]], c: 1, f: INK.paperLight, s: 0 },
      { p: inkEllipsePts(-82, -304, 16, 16, 5, 9), c: 1 }, { p: inkEllipsePts(82, -304, 16, 16, 6, 9), c: 1 }] }),
    house: () => ({ strokes: [
      { p: [[-110, 0], [-110, -170], [110, -170], [110, 0]], c: 1, f: INK.paperLight, s: 0 },
      { p: [[-136, -166], [0, -270], [136, -166]], c: 1, f: INK.red, s: 0 },
      { p: [[-28, 0], [-28, -92], [28, -92], [28, 0]], w: 6, s: 0 },
      { p: [[52, -130], [92, -130], [92, -92], [52, -92]], c: 1, f: INK.paperDark, s: 0 },
      { p: [[72, -130], [72, -92]], w: 3 }] }),
    ship: (t) => {
      const fl = Math.sin(t * 6) * 10;
      return { tf: `rotate(${(Math.sin(t * 1.3) * 3).toFixed(2)} 0 -40) translate(0 ${(Math.sin(t * 1.7) * 6).toFixed(1)})`, strokes: [
        { p: [[-170, -70], [170, -76], [130, 0], [-130, 0]], c: 1, f: INK.paperDark, s: 0 },
        { p: [[-150, -40], [150, -44]], w: 3.5, o: 0.6 },
        { p: [[0, -74], [0, -330]], w: 8 },
        { p: [[8, -320], [120, -110], [8, -100]], c: 1, f: INK.paperLight, s: 0 },
        { p: [[-8, -300], [-110, -120], [-8, -110]], c: 1, f: INK.paperLight, s: 0 },
        { p: [[0, -330], [30, -338 + fl * 0.3], [60, -328 + fl]], w: 6, o: 0.9 },
        { p: [[-230, 12], [-170, 4 + Math.sin(t * 2) * 6], [-100, 14], [-30, 4 + Math.sin(t * 2 + 1) * 6], [40, 14], [110, 4 + Math.sin(t * 2 + 2) * 6], [180, 14], [240, 6]], w: 5 }] };
    },
    volcano: (t) => {
      const st = [{ p: [[-230, 0], [-70, -230], [-30, -214], [30, -222], [70, -232], [230, 0]], c: 1, f: INK.paperDark, s: 0 },
        { p: [[-40, -216], [-54, -150], [-30, -110]], w: 7, f: null, col: INK.red },
        { p: [[38, -222], [56, -170], [44, -120], [70, -70]], w: 7, col: INK.red },
        { p: [[-150, -60], [-120, -90]], w: 3.5, o: 0.5 }, { p: [[130, -40], [150, -80]], w: 3.5, o: 0.5 }];
      for (let i = 0; i < 5; i++) {        // smoke puffs rise, grow and drift (loop every 3 s)
        const u = ((t / 3 + i / 5) % 1), r = 26 + u * 70;
        st.push({ p: inkEllipsePts(Math.sin(i * 2.3) * 30 + u * 60, -250 - u * 330, r, r * 0.85, 20 + i, 10), c: 1, f: INK.paperLight, o: 1 - u * 0.6 });
      }
      return { strokes: st };
    },
    bread: () => {      // Pompeii-style round loaf scored into 8 wedges
      const st = [{ p: inkEllipsePts(0, -70, 120, 66, 7, 14), c: 1, f: INK.gold }];
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; st.push({ p: [[0, -82], [Math.cos(a) * 92, -82 + Math.sin(a) * 42]], w: 4 }); }
      st.push({ p: inkEllipsePts(0, -82, 16, 10, 8, 8), c: 1, f: INK.paperDark });
      return { strokes: st };
    },
    coin: (t) => {
      const k = Math.abs(Math.cos(t * 1.6)) * 0.85 + 0.15;   // slow spin
      return { strokes: [{ p: inkEllipsePts(0, -100, 96 * k, 96, 9, 14), c: 1, f: INK.gold },
        { p: inkEllipsePts(0, -100, 70 * k, 70, 10, 12), c: 1, w: 4 },
        { p: [[-24 * k, -126], [10 * k, -132], [26 * k, -104], [6 * k, -74], [-20 * k, -82]], w: 5 }] };
    },
    map: () => ({ strokes: [
      { p: [[-160, -230], [-54, -214], [54, -232], [160, -216], [160, -20], [54, -36], [-54, -18], [-160, -34]], c: 1, f: INK.paperLight, s: 0 },
      { p: [[-54, -214], [-54, -18]], w: 3, o: 0.5 }, { p: [[54, -232], [54, -36]], w: 3, o: 0.5 },
      { p: [[-120, -180], [-90, -150], [-100, -110], [-60, -90]], w: 4, o: 0.6, col: INK.inkSoft },
      ...[0, 1, 2, 3, 4].map(i => ({ p: [[-40 + i * 34, -100 - i * 8], [-24 + i * 34, -104 - i * 8]], w: 5 })),
      { p: [[110, -170], [140, -140]], w: 8, col: INK.red }, { p: [[140, -170], [110, -140]], w: 8, col: INK.red }] }),
    clock: (t) => {
      const st = [{ p: inkEllipsePts(0, -150, 120, 120, 11, 16), c: 1, f: INK.paperLight }];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; st.push({ p: [[Math.cos(a) * 96, -150 + Math.sin(a) * 96], [Math.cos(a) * (i % 3 ? 104 : 86), -150 + Math.sin(a) * (i % 3 ? 104 : 86)]], w: i % 3 ? 3 : 6 }); }
      const m = t * 1.2, h = t * 0.1 - 1;
      st.push({ p: [[0, -150], [Math.sin(m) * 84, -150 - Math.cos(m) * 84]], w: 6 });
      st.push({ p: [[0, -150], [Math.sin(h) * 56, -150 - Math.cos(h) * 56]], w: 9 });
      st.push({ p: [[0, -30], [0, 0]], w: 8 }, { p: [[-50, 0], [50, 0]], w: 8 });
      return { strokes: st };
    },
    door: () => ({ strokes: [
      { p: [[-80, 0], [-80, -200], [-60, -252], [0, -276], [60, -252], [80, -200], [80, 0]], c: 1, f: INK.paperDark },
      { p: [[-28, -8], [-28, -262]], w: 3.5, o: 0.6 }, { p: [[24, -8], [24, -264]], w: 3.5, o: 0.6 },
      { p: inkEllipsePts(52, -120, 9, 9, 12, 8), c: 1, f: INK.ink }, { p: [[-100, 0], [100, 0]], w: 7 }] }),
    tree: (t) => ({ tf: `rotate(${(Math.sin(t * 0.9) * 1.6).toFixed(2)} 0 0)`, strokes: [
      { p: [[-20, 0], [-14, -140], [-40, -200]], w: 7 }, { p: [[22, 0], [16, -150], [44, -196]], w: 7 },
      { p: [[0, -150], [-2, -210]], w: 4 },
      { p: [[-120, -230], [-130, -300], [-80, -360], [-10, -384], [70, -364], [124, -310], [118, -240], [60, -200], [-50, -196]], c: 1, f: INK.green }] }),
    rock: () => ({ strokes: [{ p: [[-90, 0], [-84, -58], [-50, -100], [10, -108], [62, -90], [84, -44], [80, 0]], c: 1, f: INK.paperDark }] }),
  };
  function make(g, type, seed) {
    const def = D[type] || D.rock, inner = el(g, 'g'), pool = [];
    let txt = null;
    return {
      update(t, lt, o = {}) {
        const out = def(t, o);
        inner.setAttribute('transform', out.tf || '');
        let k = 0;
        out.strokes.forEach((s, i) => {
          const sd = seed * 1000 + i * 7, base = { seed: sd, t, amp: 1.8, smooth: s.s !== 0 };
          if (s.c && s.f) {
            const e = pool[k] || (pool[k] = inkEl(inner)); k++;
            e.setAttribute('fill', s.f); e.setAttribute('d', inkLoop(s.p, base)); e.style.display = ''; e.style.opacity = s.o ?? 1;
          }
          const e = pool[k] || (pool[k] = inkEl(inner)); k++;
          e.setAttribute('fill', s.col || INK.ink);
          e.setAttribute('d', inkPath(s.p, Object.assign(base, { w: s.w ?? 6, closed: !!s.c })));
          e.style.display = ''; e.style.opacity = s.o ?? 1;
        });
        for (; k < pool.length; k++) pool[k].style.display = 'none';
        if (out.txt) {
          if (!txt) txt = el(inner, 'text', { 'font-family': INK_FONT, 'text-anchor': 'middle', fill: INK.ink });
          if (txt.textContent !== out.txt.text) txt.textContent = out.txt.text;
          const b = boil(seed + 5, t, 0.8);
          txt.setAttribute('font-size', (out.txt.size || 48) * (o.textScale || 1));
          txt.setAttribute('x', inkF1(out.txt.x + b[0])); txt.setAttribute('y', inkF1(out.txt.y + 16 + b[1]));
          if (o.flip) txt.setAttribute('transform', `scale(-1 1)`);
        }
      },
    };
  }
  return { make, types: Object.keys(D) };
})();

// ---------------------------------------------------------------- stage: parchment scene with the cast
(window.SHOTS || (window.SHOTS = {})).stage = {
  kind: '2d',
  build(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const portrait = H > W;
    const gy = P.ground_y ?? (portrait ? 1100 : 820);
    const baseS = portrait ? 1.3 : 1.0;
    const root = el(svg, 'g');
    if (P.bg === true) el(root, 'rect', { x: 0, y: 0, width: W, height: H, fill: INK.paper });
    const world = el(root, 'g');
    // ground: a wobbly hand-drawn line with a faint earth band and a few pebble ticks
    const groundG = el(world, 'g');
    let gBand, gLine, gTicks;
    const gr = rng(seed * 13 + 5), gPts = [], ticks = [];
    if (P.ground !== false) {
      for (let x = -60; x <= W + 60; x += 110) gPts.push([x, gy + 4 + (gr() * 2 - 1) * 5]);
      for (let i = 0; i < 9; i++) { const x = 40 + gr() * (W - 80), y = gy + 22 + gr() * (portrait ? 40 : 26); ticks.push([[x, y], [x + 18 + gr() * 22, y - 2 + gr() * 4]]); }
      gBand = inkEl(groundG, INK.paperDark, { opacity: 0.35 });
      gLine = inkEl(groundG); gTicks = inkEl(groundG, INK.inkSoft, { opacity: 0.6 });
    }
    const propsG = el(world, 'g'), castG = el(world, 'g'), labelG = el(world, 'g');
    const tc = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);
    // props
    const props = (P.props || []).map((pp, i) => {
      const g = el(propsG, 'g');
      return { pp, g, d: INK_PROPS.make(g, pp.type, seed * 10 + i + 1) };
    });
    // label: hand-written caption with an underline
    let label = null;
    if (P.label && P.label.text) {
      const L = P.label, size = L.size || (portrait ? 72 : 60);
      const t = el(labelG, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink });
      t.textContent = L.text;
      label = { L, t, u: inkEl(labelG), size };
    }
    // cast
    const cast = (P.cast || []).map((m, i) => {
      const who = m.who || 'kasif', isK = who === 'kasif';
      const rig = KASIF.create(castG, { scale: baseS * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), seed: i * 7 + 3 + (isK ? 0 : 11) });
      return { m, isK, rig };
    });
    const faceOf = v => v === 'left' ? -1 : v === 'right' ? 1 : null;
    const dirAng = d => typeof d === 'number' ? d : { up: 70, down: -38, forward: 8, left: 10, right: 10, back: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 }[d] ?? 10;
    const dirFace = d => typeof d !== 'string' ? null : /left/.test(d) ? -1 : /right/.test(d) ? 1 : null;
    const BLEND = 0.32;

    // member -> items [{t0, pose, x0, x1, t1, face, ...}] (pure function of cues)
    function plan(c, cues) {
      const m = c.m, segs = [{ at: tc(m.start, cues, 0), pose: m.pose || 'idle', to: m.to, dur: m.dur, dir: m.dir, face: m.face, emotion: m.emotion, text: m.text, item: m.item, then: m.then }];
      const moving = s => (s.pose === 'walk' || s.pose === 'run') && s.to != null;
      if (m.at != null) segs.push({ at: tc(m.at, cues, 1), pose: m.then || 'idle', dir: m.dir, emotion: m.emotion, text: m.text, item: m.item, arrive: moving(segs[0]) });
      for (const s of m.seq || []) segs.push(Object.assign({}, s, { at: tc(s.at, cues, 0) }));
      segs.sort((a, b) => a.at - b.at);
      const items = [], px = baseS * (m.scale || 1);
      let x = (m.x ?? 0.5) * W, face = faceOf(m.face) ?? (moving(segs[0]) ? (m.to > m.x ? 1 : -1) : (m.x ?? 0.5) > 0.5 ? -1 : 1);
      segs.forEach((s, k) => {
        const nx = segs[k + 1];
        const it = { t0: s.at, pose: s.pose, x0: x, x1: x, t1: s.at, dir: s.dir, emotion: s.emotion, text: s.text, item: s.item };
        if (moving(s)) {
          it.x1 = s.to * W;
          const nat = Math.abs(it.x1 - x) / (KASIF.gait(s.pose) * px / (s.pose === 'run' ? 0.62 : 0.9));
          it.t1 = s.at + (s.dur ?? (nx && nx.arrive ? Math.max(0.3, nx.at - s.at) : nat));
          if (nx && !nx.arrive && it.t1 > nx.at) it.t1 = nx.at;
          if (faceOf(s.face) == null && it.x1 !== x) face = it.x1 > x ? 1 : -1;
        }
        const df = dirFace(s.dir);
        if (faceOf(s.face) != null) face = faceOf(s.face); else if (df != null) face = df;
        it.face = face;
        items.push(it);
        x = it.x1;
        if (moving(s) && (!nx || it.t1 < nx.at - 0.01)) items.push({ t0: it.t1, pose: s.then || (k === 0 && m.at == null && m.then) || 'idle', x0: x, x1: x, t1: it.t1, face, dir: s.dir ?? m.dir, emotion: s.emotion, text: m.text, item: m.item });
      });
      return items;
    }
    const phaseOf = (it, lt, px) => {
      if (it.pose !== 'walk' && it.pose !== 'run') return undefined;
      if (it.x1 === it.x0) return lt / (it.pose === 'run' ? 0.62 : 0.9);
      const u = clamp01((lt - it.t0) / Math.max(0.01, it.t1 - it.t0));
      return Math.abs(lerp(it.x0, it.x1, u) - it.x0) / (KASIF.gait(it.pose) * px);
    };
    const posAt = (it, lt) => it.t1 > it.t0 ? lerp(it.x0, it.x1, clamp01((lt - it.t0) / (it.t1 - it.t0))) : it.x1;

    return {
      update(lt, dur, cues, env = {}) {
        const t = env.t ?? lt;
        // word timings: host-provided (ctx.words / env.words); in the Studio engine the optional WORDS global
        const words = env.words || ctx.words || (typeof WORDS !== 'undefined' ? WORDS : null);
        // slow camera drift (2D "kamera kayması")
        world.setAttribute('transform', `translate(${inkF1(Math.sin(lt * 0.35) * 8)} ${inkF1(Math.cos(lt * 0.27) * 4)})`);
        if (gLine) {
          const gp = inkJitter(gPts, seed * 3 + 1, t, 1.6);
          gLine.setAttribute('d', inkPath(gp, { w: 6, seed: seed * 3 + 1, t, amp: 0 }));
          gBand.setAttribute('d', inkLoop([...gp, [W + 60, gy + 90], [-60, gy + 90]], { seed: seed * 3 + 2, t, amp: 0, smooth: false }));
          gTicks.setAttribute('d', ticks.map((tk, i) => inkPath(tk, { w: 4, seed: seed * 50 + i, t })).join(' '));
        }
        props.forEach(({ pp, g, d }, i) => {
          const at = tc(pp.at, cues, 0.1 + i * 0.18), sp = spring(lt, at, 0.6), pk = punch(lt, tc(pp.hit, cues, null), 0.6);
          const s = baseS * (pp.scale || 1);
          g.style.opacity = clamp01(sp * 3);
          const x = (pp.x ?? 0.7) * W, y = pp.y != null ? pp.y * H : gy;
          g.setAttribute('transform', `translate(${inkF1(x)} ${inkF1(y)}) scale(${(s * (pp.flip ? -1 : 1) * (1 + 0.08 * pk)).toFixed(4)} ${(s * lerp(0.2, 1, sp) * (1 + 0.08 * pk)).toFixed(4)})`);
          d.update(t, lt, { text: pp.text, flip: pp.flip });
        });
        if (label) {
          const L = label.L, at = tc(L.at, cues, 0.15), sp = spring(lt, at, 0.6);
          const x = (L.x ?? 0.5) * W, y = (L.y ?? (portrait ? 0.2 : 0.16)) * H, b = boil(seed + 91, t, 1);
          label.t.setAttribute('transform', `translate(${inkF1(x + b[0])} ${inkF1(y + b[1])}) rotate(${-1.5 + b[0] * 0.3}) scale(${lerp(0.7, 1, sp)})`);
          label.t.style.opacity = clamp01(sp * 2);
          const tw = label.t.getComputedTextLength ? Math.min(W * 0.8, label.t.getComputedTextLength()) : label.size * L.text.length * 0.45;
          const pu = prog(lt, at + 0.25, 0.5);
          label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 18], [x - tw / 2 + tw * pu * 0.5, y + 22], [x - tw / 2 + tw * pu, y + 16]], { w: 6, seed: seed + 92, t }) : '');
        }
        for (const c of cast) {
          const items = plan(c, cues), px = baseS * (c.m.scale || 1);
          let k = 0; while (k + 1 < items.length && lt >= items[k + 1].t0) k++;
          const it = items[k], pv = items[k - 1];
          const x = posAt(it, lt), since = lt - it.t0;
          // turning: squash through zero
          let face = it.face;
          if (pv && pv.face !== it.face && since < 0.22) face = lerp(pv.face, it.face, smooth01(since / 0.22));
          const talk = c.m.talk ?? c.isK;
          let mouth = 0;
          if (talk) {
            const win = Array.isArray(talk) ? [tc(talk[0], cues, 0), tc(talk[1], cues, dur)] : [0, dur];
            if (lt >= win[0] && lt <= win[1]) mouth = env.mouth != null ? env.mouth : inkTalk(t, words);
          }
          const opts = { x, y: c.m.y != null ? c.m.y * H : gy, face, ph: phaseOf(it, lt, px), since, dir: dirAng(it.dir), mouth, emotion: it.emotion || c.m.emotion, text: it.text, item: it.item };
          if (pv && since < BLEND) {
            opts.prev = { pose: pv.pose, ph: phaseOf(pv, it.t0, px), since: it.t0 - pv.t0, dir: dirAng(pv.dir), emotion: pv.emotion || c.m.emotion };
            opts.mix = since / BLEND;
          }
          c.rig.update(t, it.pose, opts);
        }
      },
    };
  },
};
const smooth01 = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
