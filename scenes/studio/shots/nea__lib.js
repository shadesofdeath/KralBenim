// nea__lib: shared drawing kit for the nea_* shots (Stickstory "Neanderthal DNA" Short). Not a shot type itself.
// Volumetric ink-wash figures instead of stick figures: a stocky Neanderthal (heavy brow ridge, big nose, no chin,
// fur cloak) and a slender modern human (high round skull, chin, tunic), drawn as outlined, washed shapes with
// hatching on the shadow side. Palette tokens only (INK), boils at 8 Hz, pure function of (seed, t).
//
// window.NEA = {fig(group, kind, sd) -> {draw(t, o), els}, head(group, kind, sd) -> {draw(t, o)}, snow(group, W, H, n, sd)}
//   kind: "nean" | "human" | "child"
//   fig.draw(t, o): o = {x, y (ground px under the hips), s: 1 (1 = Neanderthal ~330 px tall), face: 1 (right) | -1,
//     ph: walk phase (cycles), walk: 0..1, look: 0..1 (head turned back over the shoulder), sit: 0..1,
//     arm: "hang"|"spear"|"reach"|"wave"|"hold", a: 1 (fill-opacity multiplier, for fading), fez: false, eyesOpen: 1,
//     spearLen: 1, coat: token (tunic), sil: true (all ink: a shadow)}
//   head.draw(t, o): only the head (portrait close-ups), o = {x, y (head centre px), s, face, a, fez}
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  // head outlines in head units (facing right, centre 0,0, ~ ±60)
  const HEADS = {
    nean: {
      out: [[-30, 52], [-44, 32], [-62, 2], [-54, -30], [-26, -50], [6, -52], [30, -42], [54, -28], [60, -18], [48, -12], [52, -4], [70, 12], [62, 20], [54, 20], [57, 28], [52, 34], [55, 39], [46, 52], [30, 58], [10, 58], [8, 74], [-24, 74]],
      hair: [[-62, 12], [-66, -20], [-56, -46], [-30, -62], [2, -64], [30, -56], [44, -40], [30, -40], [10, -46], [-14, -44], [-30, -34], [-34, -12], [-28, 12], [-36, 40], [-54, 44]],
      beard: [[14, 8], [30, 24], [42, 42], [48, 56], [36, 70], [14, 76], [-6, 68], [-20, 50], [-22, 26], [-8, 18]],
      brow: [[24, -30], [42, -30], [62, -20]], eye: [44, -9], ear: [[-6, -12], [-17, -6], [-18, 8], [-8, 14]],
      mouth: [[44, 34], [53, 34]], nose: [[52, 0], [66, 12], [58, 18]], lid: [[38, -14], [50, -13]],
    },
    human: {
      out: [[-30, 52], [-40, 30], [-48, 4], [-46, -28], [-30, -56], [-2, -66], [24, -58], [38, -38], [42, -20], [42, -6], [48, 4], [56, 14], [48, 20], [46, 26], [44, 32], [46, 36], [44, 44], [49, 50], [40, 58], [20, 60], [8, 60], [6, 74], [-24, 74]],
      hair: [[-50, 6], [-52, -30], [-34, -62], [-2, -76], [28, -68], [42, -46], [34, -50], [10, -56], [-18, -50], [-34, -32], [-38, -6], [-34, 14]],
      beard: null,
      brow: [[28, -22], [42, -21]], eye: [37, -9], ear: [[-4, -12], [-15, -6], [-16, 8], [-6, 14]],
      mouth: [[38, 30], [45, 30]], nose: [[44, -2], [55, 13], [48, 17]], lid: [[31, -13], [42, -13]],
    },
  };
  HEADS.child = HEADS.human;
  const BODY = {   // units: ground y = 0, up = -y
    nean: { hip: [0, -148], sh: [8, -262], neck: [14, -282], head: [22, -316], hs: 0.9, leg: 76, arm: 64, lw: 30, aw: 26,
      cloak: [[-40, -268], [-12, -290], [26, -288], [46, -264], [50, -212], [56, -158], [64, -120], [44, -128], [30, -114], [12, -126], [-6, -112], [-22, -124], [-40, -114], [-54, -128], [-50, -176], [-48, -230]] },
    human: { hip: [0, -168], sh: [6, -292], neck: [10, -310], head: [14, -350], hs: 0.86, leg: 86, arm: 72, lw: 22, aw: 18,
      cloak: [[-30, -296], [-6, -314], [22, -312], [36, -292], [36, -230], [40, -150], [20, -146], [0, -152], [-20, -146], [-36, -150], [-34, -230]] },
    child: { hip: [0, -96], sh: [4, -170], neck: [8, -182], head: [10, -204], hs: 0.58, leg: 50, arm: 42, lw: 18, aw: 15,
      cloak: [[-22, -174], [-4, -188], [16, -186], [26, -170], [28, -130], [32, -88], [12, -84], [-8, -90], [-26, -86], [-26, -130]] },
  };

  function head(group, kind, sd) {
    const H0 = HEADS[kind];
    const fill = inkEl(group, mix(INK.paperLight, INK.paperDark, 0.45)), shadeF = inkEl(group, INK.paperDark), hair = inkEl(group, INK.ink),
      beard = inkEl(group, INK.inkSoft), line = inkEl(group, INK.ink), soft = inkEl(group, INK.inkSoft), hatch = inkEl(group, INK.paperDark),
      fezF = inkEl(group, INK.red), fezL = inkEl(group, INK.ink);
    const els = [fill, shadeF, hair, beard, line, soft, hatch, fezF, fezL];
    return {
      els,
      draw(t, o) {
        const s = o.s ?? 1, fc = o.face ?? 1, a = o.a ?? 1, cx = o.x, cy = o.y, w = Math.max(3.5, 4.2 * Math.sqrt(s * 1.6));
        const T = q => [cx + fc * q[0] * s, cy + q[1] * s], Tp = pts => pts.map(T);
        const k = sd;
        fill.setAttribute('d', inkLoop(Tp(H0.out), { seed: k + 1, t, amp: 1 }));
        // shadow side: back of the skull and under the brow
        shadeF.setAttribute('d', inkLoop(Tp([[-26, 40], [-6, 30], [10, 44], [8, 70], [-22, 70]]), { seed: k + 2, t, amp: 1 }) + ' ' +
          inkLoop(Tp([[H0.eye[0] - 14, H0.eye[1] - 8], [H0.eye[0] + 12, H0.eye[1] - 9], [H0.eye[0] + 8, H0.eye[1] + 7], [H0.eye[0] - 12, H0.eye[1] + 6]]), { seed: k + 3, t, amp: 0.6 }));
        hair.setAttribute('d', inkLoop(Tp(H0.hair), { seed: k + 4, t, amp: 1.2 }));
        beard.setAttribute('d', H0.beard ? inkLoop(Tp(H0.beard), { seed: k + 5, t, amp: 1.2 }) : '');
        let d = inkPath(Tp(H0.out), { w, seed: k + 6, t, closed: true, amp: 1.2 });
        d += ' ' + inkPath(Tp(H0.brow), { w: kind === 'nean' ? w * 2.1 : w * 0.9, seed: k + 7, t, amp: 0.8 });
        const e = T(H0.eye), eo = o.eyesOpen ?? 1;
        d += ' ' + inkDot(e[0], e[1], 5.5 * s, 5.5 * s * Math.max(0.15, eo), k + 8, t);
        d += ' ' + inkPath(Tp(H0.nose), { w: w * 0.8, seed: k + 9, t, amp: 0.8 });
        d += ' ' + inkPath(Tp(H0.mouth), { w: w * 0.7, seed: k + 10, t, amp: 0.6 });
        d += ' ' + inkPath(Tp(H0.ear), { w: w * 0.6, seed: k + 11, t, amp: 0.5 });
        d += ' ' + inkPath(Tp(H0.lid), { w: w * 0.6, seed: k + 12, t, amp: 0.4 });
        if (H0.beard) for (let i = 0; i < 5; i++) d += ' ' + inkPath(Tp([[-10 + i * 10, 34 + i * 3], [-4 + i * 10, 60 + i * 2]]), { w: w * 0.4, seed: k + 13 + i, t, amp: 0.6 });
        line.setAttribute('d', d);
        // hair strands + hatching on the back of the head
        let hs = '';
        for (let i = 0; i < 6; i++) { const y = -30 + i * 12; hs += inkPath(Tp([[-56 + i * 2, y], [-44 + i * 3, y + 10]]), { w: w * 0.45, seed: k + 20 + i, t, amp: 0.6 }) + ' '; }
        hatch.setAttribute('d', hs);
        soft.setAttribute('d', kind === 'nean' ? inkPath(Tp([[30, 20], [40, 26]]), { w: w * 0.5, seed: k + 30, t, amp: 0.5 }) : '');
        if (o.fez) {
          const fz = [[-26, -46], [30, -52], [24, -96], [-16, -94]];
          fezF.setAttribute('d', inkLoop(Tp(fz), { seed: k + 40, t, amp: 0.8, smooth: false }));
          const sw = Math.sin(t * 3) * 6;
          fezL.setAttribute('d', inkPath(Tp(fz), { w: w * 0.9, seed: k + 41, t, closed: true, smooth: false, amp: 0.8 }) + ' ' +
            inkPath(Tp([[4, -95], [-22, -88], [-30 + sw, -62]]), { w: w * 0.8, seed: k + 42, t, amp: 0.6 }) + ' ' +
            inkDot(...T([-30 + sw, -58]), 6 * s, 9 * s, k + 43, t));
        } else { fezF.setAttribute('d', ''); fezL.setAttribute('d', ''); }
        if (o.sil) for (const x of els) x.setAttribute('fill', INK.ink);
        for (const x of els) x.setAttribute('fill-opacity', (o.sil ? 1 : x === fill ? 1 : x === shadeF ? 0.75 : x === hair || x === beard ? 0.85 : 1) * a);
      },
    };
  }

  // two-bone limb: root -> target, joint bent towards side (+1/-1)
  function limb(a, b, l, bend) {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), 2 * l - 0.5) || 1;
    const ux = dx / Math.hypot(dx, dy || 1e-6), uy = dy / Math.hypot(dx, dy || 1e-6), h = Math.sqrt(Math.max(0, l * l - (d / 2) ** 2));
    const m = [a[0] + ux * d / 2, a[1] + uy * d / 2];
    return [a, [m[0] - uy * h * bend, m[1] + ux * h * bend], [a[0] + ux * d, a[1] + uy * d]];
  }

  function fig(group, kind, sd) {
    const B = BODY[kind];
    const shadow = inkEl(group, INK.ink);
    const legB = [inkEl(group, INK.ink), inkEl(group, INK.inkSoft)], armB = [inkEl(group, INK.ink), inkEl(group, INK.inkSoft)];
    const cloakF = inkEl(group, kind === 'nean' ? INK.paperDark : INK.blue), cloakH = inkEl(group, INK.ink), cloakL = inkEl(group, INK.ink);
    const legF = [inkEl(group, INK.ink), inkEl(group, INK.paperDark)];
    const spear = inkEl(group, INK.ink), tip = inkEl(group, INK.inkSoft);
    const armF = [inkEl(group, INK.ink), inkEl(group, INK.paperDark)];
    const hg = el(group, 'g'), hd = head(hg, kind === 'nean' ? 'nean' : 'human', sd + 100);
    const handF = inkEl(group, INK.paperDark), handL = inkEl(group, INK.ink);
    const all = [shadow, ...legB, ...armB, cloakF, cloakH, cloakL, ...legF, spear, tip, ...armF, handF, handL];
    return {
      draw(t, o) {
        const s = o.s ?? 1, fc = o.face ?? 1, a = o.a ?? 1, walk = o.walk ?? 0, ph = (o.ph ?? 0) * Math.PI * 2, sit = o.sit ?? 0;
        const bob = -Math.abs(Math.sin(ph)) * 6 * walk + Math.sin(t * 2.1 + sd) * 1.5;
        const T = q => [o.x + fc * q[0] * s, o.y + q[1] * s], Tp = pts => pts.map(T);
        const up = (q, dy) => [q[0], q[1] + dy];
        const sitDy = sit * (B.hip[1] * -0.42);
        const hip = up(B.hip, bob + sitDy), sh = up(B.sh, bob + sitDy), nk = up(B.neck, bob + sitDy), hc = up(B.head, bob + sitDy);
        const L = B.leg, lw = B.lw * s, aw = B.aw * s, ow = Math.max(4, 4.5 * Math.sqrt(s));
        // legs
        const foot = side => {
          const p = ph + (side ? Math.PI : 0), sw = Math.sin(p) * 0.5 * walk, lift = Math.max(0, Math.cos(p)) * walk * 22;
          const stand = [hip[0] + Math.sin(sw) * L * 1.9 + (side ? -6 : 8), -lift];
          const seat = [hip[0] + 2 * L * 0.78 + (side ? -10 : 0), 0];
          return [lerp(stand[0], seat[0], sit), lerp(stand[1], seat[1], sit)];
        };
        const legPath = (side, els) => {
          const pts = limb(hip, foot(side), L, -1);
          els[0].setAttribute('d', inkPath(Tp(pts), { w: lw + ow * 2, seed: sd + 1 + side, t, amp: 1, taper: 0.05 }));
          els[1].setAttribute('d', inkPath(Tp(pts), { w: lw, seed: sd + 3 + side, t, amp: 0.8, taper: 0.05 }));
        };
        legPath(1, legB); legPath(0, legF);
        // arms
        const sw = Math.sin(ph) * 0.45 * walk;
        const hand = (side) => {
          const arm = o.arm || 'hang', A = B.arm;
          if (!side) {
            if (arm === 'spear') return [sh[0] + A * 1.15, sh[1] + A * 0.8];
            if (arm === 'reach') return [sh[0] + A * 1.7, sh[1] + A * 0.7];
            if (arm === 'wave') return [sh[0] + A * 1.35 + Math.sin(t * 8) * A * 0.4, sh[1] - A * 1.25 + Math.cos(t * 8) * A * 0.15];
            if (arm === 'hold') return [sh[0] + A * 1.2, sh[1] + A * 1.1];
          }
          const k = side ? sw : -sw;
          return [sh[0] + Math.sin(k) * A * 1.9 + (side ? -8 : 6), sh[1] + Math.cos(k) * A * 1.85];
        };
        const armPath = (side, els) => {
          const pts = limb([sh[0] + (side ? -10 : 4), sh[1] + 8], hand(side), B.arm, side ? -1 : (o.arm === 'wave' ? -1 : 1));
          els[0].setAttribute('d', inkPath(Tp(pts), { w: aw + ow * 2, seed: sd + 5 + side, t, amp: 1, taper: 0.1 }));
          els[1].setAttribute('d', inkPath(Tp(pts), { w: aw, seed: sd + 7 + side, t, amp: 0.8, taper: 0.1 }));
          return pts[2];
        };
        armPath(1, armB);
        // cloak / tunic
        const cl = B.cloak.map(q => up(q, bob + sitDy));
        if (sit > 0) for (const q of cl) if (q[1] > hip[1] - 20) q[1] = lerp(q[1], hip[1] + (q[1] - hip[1]) * 0.4, sit);
        cloakF.setAttribute('d', inkLoop(Tp(cl), { seed: sd + 9, t, amp: 1.2, smooth: kind !== 'nean' }));
        cloakL.setAttribute('d', inkPath(Tp(cl), { w: ow, seed: sd + 10, t, closed: true, amp: 1.2, smooth: kind !== 'nean' }));
        let hh = '';
        const xs = cl.map(q => q[0]), x0 = Math.min(...xs), ys = cl.map(q => q[1]), y0 = Math.min(...ys) + 18, y1 = Math.max(...ys) - 10;
        for (let i = 0; i < 7; i++) {
          const yy = lerp(y0, y1, i / 6);
          hh += inkPath(Tp([[x0 + 10, yy], [x0 + 10 + (kind === 'nean' ? 30 : 22), yy - 14]]), { w: Math.max(2, ow * 0.55), seed: sd + 30 + i, t, amp: 0.8 }) + ' ';
        }
        if (kind === 'nean') for (let i = 0; i < 4; i++) {   // fur tufts on the shoulder
          const q = cl[1 + i]; hh += inkPath(Tp([[q[0], q[1] + 6], [q[0] + 6, q[1] + 18]]), { w: Math.max(2, ow * 0.5), seed: sd + 40 + i, t, amp: 0.7 }) + ' ';
        }
        cloakH.setAttribute('d', hh);
        const hf = armPath(0, armF);
        if (o.arm === 'spear') {
          const sl = o.spearLen ?? 1, top = [hf[0] + 14 * sl, hf[1] - 230 * sl], bot = [hf[0] - 8, Math.min(-4, hf[1] + 170)];
          spear.setAttribute('d', inkPath(Tp([bot, top]), { w: Math.max(5, 7 * Math.sqrt(s)), seed: sd + 50, t, amp: 0.8, taper: 0.05 }));
          tip.setAttribute('d', inkLoop(Tp([[top[0] - 12, top[1] + 8], [top[0] + 2, top[1] - 38], [top[0] + 14, top[1] + 6]]), { seed: sd + 51, t, amp: 0.8, smooth: false }) );
        } else { spear.setAttribute('d', ''); tip.setAttribute('d', ''); }
        shadow.setAttribute('d', sit >= 1 ? '' : inkLoop(inkEllipsePts(o.x, o.y + 4, 70 * s, 9 * s, sd + 60, 12), { seed: sd + 60, t, amp: 0.5 }));
        // head: turns back over the shoulder with o.look
        const look = o.look ?? 0, hx = T(hc);
        // a visible hand (palm + fingers) on the front arm when it does something
        if (['wave', 'reach', 'hold'].includes(o.arm)) {
          const hp = T(hf), hr = Math.max(5, B.aw * 0.62 * s), up = o.arm === 'wave' ? -1 : 0;
          handF.setAttribute('d', inkDot(hp[0], hp[1], hr, hr * 1.1, sd + 70, t, 0.6));
          let fd = inkCircle(hp[0], hp[1], hr, sd + 71, t, { w: Math.max(3, ow * 0.7) });
          if (up) for (let i = -1; i <= 1; i++) fd += ' ' + inkPath([[hp[0] + i * hr * 0.6, hp[1] - hr * 0.8], [hp[0] + i * hr * 0.9, hp[1] - hr * 1.9]], { w: Math.max(3, ow * 0.8), seed: sd + 72 + i, t, amp: 0.5 });
          handL.setAttribute('d', fd);
        } else { handF.setAttribute('d', ''); handL.setAttribute('d', ''); }
        hd.draw(t, { x: hx[0], y: hx[1], s: s * B.hs, face: fc * (look > 0.5 ? -1 : 1) * Math.max(0.25, Math.abs(1 - 2 * look)), a, fez: o.fez, eyesOpen: o.eyesOpen, sil: o.sil });
        if (o.coat && !o.sil) cloakF.setAttribute('fill', INK[o.coat] || o.coat);
        if (o.sil) { for (const x of all) x.setAttribute('fill', INK.ink); shadow.setAttribute('d', ''); }
        for (const x of all) x.setAttribute('fill-opacity', (x === shadow ? 0.16 : 1) * a);
      },
    };
  }

  // falling snow: n short ink streaks drifting down-left, wrapping; returns {update(t, a)}
  function snow(group, W, H, n, sd, o = {}) {
    const e = inkEl(group, o.color || INK.inkSoft), R = rng(sd), F = Array.from({ length: n }, () => [R(), R(), R()]);
    return {
      update(t, a = 1, wind = 1) {
        let d = '';
        F.forEach((f, i) => {
          const sp = 160 + f[2] * 260, y = ((f[1] * (H + 200) + t * sp) % (H + 200)) - 100, x = ((f[0] * (W + 400) - t * sp * 0.55 * wind) % (W + 400) + (W + 400)) % (W + 400) - 200;
          const r = 3 + f[2] * 6;
          d += inkDot(x, y, r, r * 0.8, sd + i, t, 0.4) + ' ';
        });
        e.setAttribute('d', d);
        e.setAttribute('fill-opacity', (0.75 * a).toFixed(3));
      },
    };
  }

  window.NEA = { fig, head, snow, f1 };
})();
