// hu_hubble: shots for the Stickstory Short "Hubble's blurry mirror" (2026-11-09): Hubble reached orbit in April 1990
// (STS-31, Discovery) and its first pictures were blurry: the 2.4 m primary mirror was smooth but ground to the wrong
// shape (off by about 1/50 of a human hair, NASA) because a lens in the test tool (reflective null corrector) sat 1.3 mm
// out of place (NASA failure report, 1990). In December 1993 (STS-61, Endeavour) astronauts installed COSTAR, Hubble's
// "glasses". Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via
// _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any telescope / space-repair story.
// Uses lh__lib.js (LH.kasif, LH.label, LH.person, LH.front).
//
// Common: L = labels [{text, x, y, at, size, color, font, card, rot}] (LH.label), K = Kaşif {x, y, scale, pose, face,
//   dir, emotion, seq} (LH.kasif). Set the scene's "set" to "night" (space; the Earth covers the set's ground) or
//   "interior" (rooms).
//
// SHOTS.hu_space — space above the Earth (the planet's curve fills the bottom of the frame, clouds drift).
//   P: {mode, earth: 0.73 (top of the Earth, 0..1 H), labels, kasif}
//   "hook": Hubble drifts and turns towards a big blurry star; its view cone shimmers; cue "hit" makes the blur swell.
//   "deploy": the shuttle's robot arm lifts Hubble out of the open payload bay; the solar wings unroll.
//   "service": Hubble stands in the bay, an astronaut on the arm's end works on its open aft doors.
//   "glasses": close front view of Hubble's open tube; at cue "hit" a pair of ink spectacles drops onto it; through
//     the second lens the stars are sharp, with the four diffraction spikes.
// SHOTS.hu_room — the control room: a big monitor on the wall over a console with blinking buttons, scientists in lab
//   coats standing behind it. P: {mode: "blurry"|"sharp", kasif, labels}. "blurry": the first image, a blurred star
//   with a halo (sharpens a little, then smears again). "sharp": split screen BEFORE (blurred) | AFTER (sharp galaxy);
//   the wipe runs at cue "hit".
// SHOTS.hu_mirror — the clean room. P: {mode, labels}
//   "polish": the 2.4 m primary mirror on its stand (3/4 view, centre hole, reflected grid); a gleam sweeps at cue
//     "smooth"; at cue "hit" the edge zone turns red and the reflected grid bends there; a technician looks on.
//   "test": the mirror lies face up; above it the test tool (a tall tube, cut open: two small mirrors and one lens);
//     a red laser fans down to the mirror; at cue "hit" the lens slips down and a magnifier shows the gap.
//     P.slip: false (tool only, no slip), P.tech: false (no technician), P.mag (magnifier radius, 170), P.magX/magY (0..1). hu_space hook: P.star [x, y].
// SHOTS.hu_hair — close-up: one long dark hair runs in from the right and ends in a small cut-end disc; callout lines
//   from its two edges open onto a big vertical ruler of 50 ticks (the hair's width); at cue "hit" one tick and a slice
//   of the disc turn red; the mirror's rim (red sliver) and a lab bench fill the bottom. P: {labels}
// SHOTS.hu_sky — night hills: Hubble crosses the sky as a small glinting craft; Kaşif on the hill (P.kasif); grass
//   in the foreground. P: {kasif, labels}
// cues: hit (punch) + smooth + labels "at" + Kaşif seq "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const RC = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const TF = (g, x, y, rot = 0, s = 1, fx = 1) => g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${(s * fx).toFixed(4)} ${s.toFixed(4)})`);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const SILVER = () => mix(INK.paperLight, INK.paperDark, 0.4), SILVER_D = () => mix(INK.paperDark, INK.inkSoft, 0.3);
  const PANEL = () => mix(INK.blue, INK.ink, 0.3), PANEL_L = () => mix(INK.blue, INK.paperLight, 0.4);
  const DARK = () => mix(INK.ink, INK.blue, 0.25);
  const GLASS = () => mix(INK.blue, INK.paperLight, 0.62);
  const twoBone = (a, b, l1, l2, bend) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(l1 + l2 - 1, Math.hypot(dx, dy)) || 1;
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    return [a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1];
  };
  const star4 = (x, y, r, sd, t, k = 0.22) => inkLoop([[x, y - r], [x + r * k, y - r * k], [x + r, y], [x + r * k, y + r * k], [x, y + r], [x - r * k, y + r * k], [x - r, y], [x - r * k, y - r * k]], { seed: sd, t, amp: 0.3, smooth: false });

  // ------------------------------------------------------------------ twinkling stars
  function stars(parent, sd, n = 36) {
    const a = inkEl(parent, INK.paperLight), b = inkEl(parent, INK.gold);
    return {
      update(t, W, y0, y1, o = {}) {
        const A = [], B = [];
        for (let i = 0; i < n; i++) {
          const x = hn(sd, i) * W, y = y0 + hn(sd + 1, i) * (y1 - y0);
          if (o.avoid && Math.hypot(x - o.avoid[0], y - o.avoid[1]) < o.avoid[2]) continue;
          const tw = 0.5 + 0.5 * Math.sin(t * (1.4 + 2.2 * hn(sd + 2, i)) + i * 1.7), r = (6 + 10 * hn(sd + 3, i)) * (0.55 + 0.45 * tw);
          (i % 4 === 0 ? B : A).push(star4(x, y, r, sd + 10 + i, t));
        }
        a.setAttribute('d', A.join(' ')); b.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ the Earth's curve, filling the frame bottom
  function earth(parent, sd) {
    const glow = inkEl(parent, mix(INK.blue, INK.paperLight, 0.55));
    const sea = inkEl(parent, mix(INK.blue, INK.paperLight, 0.2)), seaD = inkEl(parent, mix(INK.blue, INK.ink, 0.15), { 'fill-opacity': 0.5 });
    const land = inkEl(parent, mix(INK.green, INK.paperLight, 0.12)), landD = inkEl(parent, mix(INK.green, INK.ink, 0.3));
    const cloud = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    return {
      update(t, W, H, top) {
        const Rr = 1900, cx = W / 2, cy = top + Rr;
        const arc = r => { const P = [], a0 = Math.asin(Math.min(0.99, (W / 2 + 100) / r)); for (let i = 0; i <= 30; i++) { const a = -a0 + 2 * a0 * i / 30; P.push([cx + Math.sin(a) * r, cy - Math.cos(a) * r]); } return P; };
        const yTop = x => cy - Math.sqrt(Math.max(0, Rr * Rr - (x - cx) * (x - cx)));
        const A0 = arc(Rr), A1 = arc(Rr + 34);
        glow.setAttribute('d', inkLoop(A1.concat([[W + 100, H + 100], [-100, H + 100]]), { seed: sd, t, amp: 0.6, smooth: false }));
        sea.setAttribute('d', inkLoop(A0.concat([[W + 100, H + 100], [-100, H + 100]]), { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const SD = []; for (let i = 0; i < 4; i++) { const y = top + 160 + i * 130; SD.push(inkPath([[-60, y + 30], [W * 0.5, y], [W + 60, y + 30]], { w: 10 + 6 * i, seed: sd + 2 + i, t, amp: 1 })); }
        seaD.setAttribute('d', SD.join(' '));
        const L = [], LD = [], CL = [], span = W * 1.8;
        for (let i = 0; i < 6; i++) {
          const x = ((hn(sd + 3, i) * span + t * 16) % span) - W * 0.4, rx = 110 + 90 * hn(sd + 4, i), ry = rx * (0.28 + 0.12 * hn(sd + 5, i));
          const y = Math.max(yTop(x) + ry + 36, top + 60 + hn(sd + 6, i) * (H - top - 60));
          const pts = inkEllipsePts(x, y, rx, ry, sd + 20 + i, 11, 0.1 * (hn(sd + 7, i) - 0.5), 0.28);
          L.push(inkLoop(pts, { seed: sd + 20 + i, t, amp: 0.8 })); LD.push(inkPath(pts, { w: 4, seed: sd + 30 + i, t, closed: true }));
        }
        for (let i = 0; i < 8; i++) {
          const x = ((hn(sd + 8, i) * span + t * 34) % span) - W * 0.4, rx = 90 + 120 * hn(sd + 9, i), ry = 14 + 10 * hn(sd + 10, i);
          const y = Math.max(yTop(x) + ry + 20, top + 30 + hn(sd + 11, i) * (H - top - 40));
          CL.push(inkLoop(inkEllipsePts(x, y, rx, ry, sd + 40 + i, 10, 0, 0.2), { seed: sd + 40 + i, t, amp: 0.8 }));
        }
        land.setAttribute('d', L.join(' ')); landD.setAttribute('d', LD.join(' ')); cloud.setAttribute('d', CL.join(' '));
        rim.setAttribute('d', inkPath(A0, { w: 6, seed: sd + 50, t }) + ' ' + inkPath(A1, { w: 2.5, seed: sd + 51, t }));
      },
    };
  }

  // ------------------------------------------------------------------ Hubble, side view (local units: aperture at x -270, aft at +270)
  function hubble(parent, sd) {
    const g = el(parent, 'g');
    const panB = inkEl(g, PANEL()), panL = inkEl(g, PANEL_L()), panR = inkEl(g);
    const aft = inkEl(g, SILVER_D()), tube = inkEl(g, SILVER()), shine = inkEl(g, INK.paperLight), band = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.15));
    const rails = inkEl(g, INK.gold), mouth = inkEl(g, DARK()), door = inkEl(g, SILVER()), rim = inkEl(g), aftDoor = inkEl(g, DARK());
    return {
      g,
      update(t, x, y, s, rot, o = {}) {
        TF(g, x, y, rot, s, o.face ?? 1);
        const k = o.panels ?? 1, Lw = 30 + 300 * k;
        const W1 = RC(30, -104, 150, -104 - Lw), W2 = RC(30, 104, 150, 104 + Lw);
        panB.setAttribute('d', inkLoop(W1, { seed: sd, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(W2, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const PL = []; for (let i = 0; i < Math.floor(Lw / 46); i++) { const y0 = 112 + i * 46; PL.push(inkLoop(RC(40, y0, 86, y0 + 36), { seed: sd + 2 + i, t, amp: 0.5, smooth: false }), inkLoop(RC(94, -y0, 140, -y0 - 36), { seed: sd + 20 + i, t, amp: 0.5, smooth: false })); }
        panL.setAttribute('d', PL.join(' '));
        const lines = [inkPath(W1, { w: 4, seed: sd + 40, t, closed: true, smooth: false }), inkPath(W2, { w: 4, seed: sd + 41, t, closed: true, smooth: false }),
          inkPath([[90, -88], [90, -104 - Lw]], { w: 4, seed: sd + 42, t }), inkPath([[90, 88], [90, 104 + Lw]], { w: 4, seed: sd + 43, t })];
        panR.setAttribute('d', lines.join(' '));
        const AF = RC(128, -100, 272, 100), TB = RC(-270, -88, 134, 88);
        aft.setAttribute('d', inkLoop(AF, { seed: sd + 50, t, amp: 0.6, smooth: false }));
        tube.setAttribute('d', inkLoop(TB, { seed: sd + 51, t, amp: 0.6, smooth: false }));
        shine.setAttribute('d', inkLoop(RC(-250, -66, 110, -44), { seed: sd + 52, t, amp: 0.5, smooth: false }));
        band.setAttribute('d', inkLoop(RC(-160, -88, -136, 88), { seed: sd + 53, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(RC(-30, -88, -10, 88), { seed: sd + 54, t, amp: 0.5, smooth: false }));
        rails.setAttribute('d', inkPath([[150, -112], [260, -112]], { w: 7, seed: sd + 55, t }) + ' ' + inkPath([[150, 112], [260, 112]], { w: 7, seed: sd + 56, t }));
        // aft bay doors (open in "service")
        aftDoor.setAttribute('d', o.aftOpen ? inkLoop(RC(170, -60, 250, 60), { seed: sd + 57, t, amp: 0.5, smooth: false }) : '');
        mouth.setAttribute('d', inkLoop(inkEllipsePts(-270, 0, 26, 86, sd + 58, 12, 0, 0.02), { seed: sd + 58, t, amp: 0.5 }));
        const a = (o.door ?? 55) * Math.PI / 180, hx = -270, hy = -88, ex = hx - Math.cos(a) * 190, ey = hy - Math.sin(a) * 190, nx = Math.sin(a) * 14, ny = -Math.cos(a) * 14;
        const DR = [[hx, hy], [ex, ey], [ex + nx, ey + ny], [hx + nx, hy + ny]];
        door.setAttribute('d', inkLoop(DR, { seed: sd + 59, t, amp: 0.4, smooth: false }));
        rim.setAttribute('d', [inkPath(TB, { w: 6, seed: sd + 60, t, closed: true, smooth: false }), inkPath(AF, { w: 6, seed: sd + 61, t, closed: true, smooth: false }),
          inkPath(DR, { w: 4, seed: sd + 62, t, closed: true, smooth: false }), inkPath(inkEllipsePts(-270, 0, 26, 86, sd + 58, 12, 0, 0.02), { w: 5, seed: sd + 63, t, closed: true }),
          inkPath([[272, -60], [272, 60]], { w: 8, seed: sd + 64, t }), o.aftOpen ? inkPath(RC(170, -60, 250, 60), { w: 4, seed: sd + 65, t, closed: true, smooth: false }) : ''].join(' '));
        // returns stage points (no rotation applied: callers use small angles or the axis helper below)
        const c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180), fx = o.face ?? 1;
        const P = (lx, ly) => [x + (lx * fx * c - ly * sn) * s, y + (lx * fx * sn + ly * c) * s];
        return { P, front: P(-270, 0), aft: P(250, 0), belly: P(0, 88), aftDoor: P(210, 0) };
      },
    };
  }

  // ------------------------------------------------------------------ space shuttle, side view (nose at +x), open bay, robot arm
  function shuttle(parent, sd) {
    const g = el(parent, 'g');
    const doorB = inkEl(g, mix(INK.paperLight, INK.paperDark, 0.45)), fin = inkEl(g, INK.paperLight), eng = inkEl(g, INK.inkSoft);
    const body = inkEl(g, INK.paperLight), belly = inkEl(g, mix(INK.ink, INK.inkSoft, 0.25)), bay = inkEl(g, DARK()), win = inkEl(g, INK.ink), flag = inkEl(g, INK.red), rim = inkEl(g);
    const front = el(g, 'g');   // the arm and anything held in front of the shuttle are drawn after this group by callers
    const armR = inkEl(parent), arm = inkEl(parent, INK.paperLight), joint = inkEl(parent, INK.inkSoft);
    return {
      g, front,
      update(t, x, y, s, o = {}) {
        TF(g, x, y, 0, s, 1);
        doorB.setAttribute('d', inkLoop([[-300, -70], [230, -70], [205, -190], [-280, -190]], { seed: sd, t, amp: 0.6, smooth: false }));
        const FN = [[-410, -58], [-470, -270], [-400, -270], [-300, -66]];
        fin.setAttribute('d', inkLoop(FN, { seed: sd + 1, t, amp: 0.6, smooth: false }));
        eng.setAttribute('d', [0, 1, 2].map(i => inkLoop([[-428, -46 + i * 26], [-478, -60 + i * 30], [-478, -30 + i * 30], [-428, -26 + i * 26]], { seed: sd + 2 + i, t, amp: 0.4, smooth: false })).join(' '));
        const BD = [[-430, -66], [-300, -72], [260, -72], [350, -58], [420, -26], [446, 2], [420, 28], [300, 44], [-430, 44]];
        body.setAttribute('d', inkLoop(BD, { seed: sd + 5, t, amp: 0.6 }));
        belly.setAttribute('d', inkLoop([[-430, 22], [300, 22], [400, 18], [440, 6], [420, 28], [300, 44], [-430, 44]], { seed: sd + 6, t, amp: 0.5, smooth: false }));
        bay.setAttribute('d', inkLoop(RC(-300, -76, 230, -62), { seed: sd + 7, t, amp: 0.4, smooth: false }));
        win.setAttribute('d', inkLoop([[318, -52], [352, -50], [362, -34], [322, -36]], { seed: sd + 8, t, amp: 0.3, smooth: false }) + ' ' + inkLoop([[366, -46], [392, -38], [398, -26], [370, -30]], { seed: sd + 9, t, amp: 0.3, smooth: false }));
        flag.setAttribute('d', inkLoop(RC(-250, -40, -200, -12), { seed: sd + 10, t, amp: 0.3, smooth: false }));
        rim.setAttribute('d', [inkPath(BD, { w: 6, seed: sd + 11, t, closed: true }), inkPath(FN, { w: 5, seed: sd + 12, t, closed: true, smooth: false }),
          inkPath([[-300, -70], [230, -70], [205, -190], [-280, -190]], { w: 4, seed: sd + 13, t, closed: true, smooth: false }),
          inkPath([[-380, 6], [300, 6]], { w: 3, seed: sd + 14, t })].join(' '));
        // robot arm (stage coords): shoulder at the bay's front end to o.arm [x, y]
        if (o.arm) {
          const sh = [x + 200 * s, y - 80 * s], end = o.arm, el1 = twoBone(sh, end, 300 * s, 300 * s, o.bend ?? -1);
          const pts = [sh, el1, end];
          armR.setAttribute('d', inkPath(pts, { w: 30 * s, seed: sd + 20, t, smooth: false, taper: 0 }));
          arm.setAttribute('d', inkPath(pts, { w: 20 * s, seed: sd + 21, t, smooth: false, taper: 0, amp: 0.6 }));
          joint.setAttribute('d', [sh, el1, end].map((p, i) => inkCircle(p[0], p[1], 16 * s, sd + 22 + i, t, { fill: true })).join(' '));
        } else blank(armR, arm, joint);
      },
    };
  }

  // ------------------------------------------------------------------ astronaut in a white suit (local: feet at y 0, ~240 tall)
  function astro(parent, sd) {
    const g = el(parent, 'g');
    const pack = inkEl(g, mix(INK.paperLight, INK.paperDark, 0.5)), limbsR = inkEl(g), limbs = inkEl(g, INK.paperLight), torso = inkEl(g, INK.paperLight);
    const helm = inkEl(g, INK.paperLight), visor = inkEl(g, INK.gold), glint = inkEl(g, INK.paperLight), rim = inkEl(g), stripe = inkEl(g, INK.red), tool = inkEl(g, INK.inkSoft);
    return {
      g,
      update(t, x, y, s, rot, o = {}) {
        TF(g, x, y, rot, s, o.face ?? 1);
        const sw = Math.sin(t * 1.3) * 6;
        const hip = [0, -92], sh = [4, -168], hd = [10, -212];
        const hand = o.hand || [100 + sw, -150 + sw * 0.5], hand2 = o.hand2 || [70, -100];
        const e1 = twoBone(sh, hand, 62, 62, 1), e2 = twoBone([sh[0] - 10, sh[1] + 6], hand2, 60, 60, 1);
        const k1 = [26, -48 + sw * 0.3], f1p = [14, 0], k2 = [-14, -44], f2p = [-30, -4];
        const LB = [[sh, e1, hand], [[sh[0] - 10, sh[1] + 6], e2, hand2], [hip, k1, f1p], [[hip[0] - 14, hip[1]], k2, f2p]];
        limbsR.setAttribute('d', LB.map((p, i) => inkPath(p, { w: 40, seed: sd + i, t, taper: 0, amp: 0.8 })).join(' '));
        limbs.setAttribute('d', LB.map((p, i) => inkPath(p, { w: 30, seed: sd + 10 + i, t, taper: 0, amp: 0.6 })).join(' '));
        pack.setAttribute('d', inkLoop(RC(-74, -196, -30, -96), { seed: sd + 20, t, amp: 0.6, smooth: false }));
        const TO = [[-38, -188], [42, -188], [44, -84], [-40, -84]];
        torso.setAttribute('d', inkLoop(TO, { seed: sd + 21, t, amp: 0.6 }));
        helm.setAttribute('d', inkCircle(hd[0], hd[1], 42, sd + 22, t, { fill: true }));
        visor.setAttribute('d', inkLoop(inkEllipsePts(hd[0] + 16, hd[1] + 2, 26, 24, sd + 23, 10, 0, 0.03), { seed: sd + 23, t, amp: 0.4 }));
        glint.setAttribute('d', inkLoop(inkEllipsePts(hd[0] + 22, hd[1] - 8, 7, 5, sd + 24, 8, 0, 0.05), { seed: sd + 24, t, amp: 0.3 }));
        stripe.setAttribute('d', inkLoop(RC(-36, -120, 42, -108), { seed: sd + 25, t, amp: 0.4, smooth: false }));
        tool.setAttribute('d', o.tool ? inkPath([hand, [hand[0] + 46, hand[1] - 24]], { w: 12, seed: sd + 26, t }) : '');
        rim.setAttribute('d', [inkPath(TO, { w: 5, seed: sd + 27, t, closed: true }), inkCircle(hd[0], hd[1], 42, sd + 28, t, { w: 5 }), inkPath(RC(-74, -196, -30, -96), { w: 4, seed: sd + 29, t, closed: true, smooth: false }),
          inkCircle(hand[0], hand[1], 15, sd + 30, t, { w: 4 }), inkCircle(hand2[0], hand2[1], 15, sd + 31, t, { w: 4 })].join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a star image: blur 1 = smeared core + halo rings, 0 = sharp point with 4 spikes
  function starImg(parent, sd) {
    const halo = [0, 1, 2, 3].map(() => inkEl(parent, INK.paperLight, { 'fill-opacity': 0.16 }));
    const ring = inkEl(parent, INK.gold, { 'fill-opacity': 0.55 }), core = inkEl(parent, INK.paperLight), spikes = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, r, blur) {
        const pul = 1 + 0.05 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 5.3);
        halo.forEach((h, i) => h.setAttribute('d', blur > 0.02 ? inkLoop(inkEllipsePts(x, y, r * (0.35 + 0.22 * i) * blur * pul, r * (0.33 + 0.21 * i) * blur * pul, sd + i, 16, t * 0.2, 0.06), { seed: sd + i, t, amp: 1.2 }) : ''));
        ring.setAttribute('d', blur > 0.05 ? inkPath(inkEllipsePts(x, y, r * 0.62 * blur * pul, r * 0.6 * blur * pul, sd + 9, 16, 0, 0.04), { w: 10 * blur, seed: sd + 9, t, closed: true }) : '');
        core.setAttribute('d', inkCircle(x, y, lerp(r * 0.06, r * 0.2, blur), sd + 10, t, { fill: true }));
        spikes.setAttribute('d', blur < 0.6 ? star4(x, y, r * 0.9 * (1 - blur), sd + 11, t, 0.06) : '');
      },
    };
  }

  // ------------------------------------------------------------------ a sharp spiral galaxy (turning slowly)
  function galaxy(parent, sd) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.25 }), arms = inkEl(parent, INK.paperLight), core = inkEl(parent, INK.gold), dots = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, r, k = 1) {
        const A = [];
        for (let a = 0; a < 2; a++) {
          const P = []; for (let i = 0; i <= 26; i++) { const q = i / 26, th = a * Math.PI + q * 3.6 + t * 0.15, rr = r * (0.12 + 0.88 * q) * k; P.push([x + Math.cos(th) * rr, y + Math.sin(th) * rr * 0.55]); }
          A.push(inkPath(P, { w: 16 * k, seed: sd + a, t, taper: 0.8 }));
        }
        arms.setAttribute('d', A.join(' '));
        glow.setAttribute('d', inkLoop(inkEllipsePts(x, y, r * 0.5 * k, r * 0.3 * k, sd + 5, 14, 0, 0.05), { seed: sd + 5, t, amp: 0.6 }));
        core.setAttribute('d', inkLoop(inkEllipsePts(x, y, r * 0.14 * k, r * 0.09 * k, sd + 6, 10, 0, 0.04), { seed: sd + 6, t, amp: 0.4 }));
        const D = []; for (let i = 0; i < 9; i++) { const th = hn(sd + 7, i) * 6.28 + t * 0.15, rr = r * (0.3 + 0.7 * hn(sd + 8, i)) * k; D.push(inkCircle(x + Math.cos(th) * rr, y + Math.sin(th) * rr * 0.55, 5 * k, sd + 20 + i, t, { fill: true })); }
        dots.setAttribute('d', D.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.hu_space
  SH.hu_space = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, mode = P.mode || 'hook', u = W / 1080, top = (P.earth ?? 0.73) * H;
      const root = el(svg, 'g');
      const st = stars(el(root, 'g'), sd, 40);
      const cone = inkEl(root, INK.gold, { 'fill-opacity': 0.14 });
      const blur = starImg(el(root, 'g'), sd + 10);
      const ea = earth(el(root, 'g'), sd + 20);
      const shBack = (mode === 'deploy' || mode === 'service') ? shuttle(el(root, 'g'), sd + 40) : null;
      const hb = mode !== 'glasses' ? hubble(el(root, 'g'), sd + 60) : null;
      const shFront = el(root, 'g');
      const as = (mode === 'service') ? astro(el(root, 'g'), sd + 80) : null;
      // glasses mode: front view parts
      const G = mode === 'glasses' ? {
        panels: inkEl(root, PANEL()), panL: inkEl(root, PANEL_L()), panR: inkEl(root),
        door: inkEl(root, SILVER()), doorR: inkEl(root), tube: inkEl(root, SILVER()), tubeD: inkEl(root, SILVER_D()), mouth: inkEl(root, DARK()), sec: inkEl(root, SILVER_D()), vanes: inkEl(root, INK.inkSoft), rim: inkEl(root),
        sharp: starImg(el(root, 'g'), sd + 90), sharp2: starImg(el(root, 'g'), sd + 95),
        lensF: inkEl(root, GLASS(), { 'fill-opacity': 0.3 }), frame: inkEl(root, INK.ink), frameG: inkEl(root, INK.gold),
      } : null;
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), pk = punch(lt, hit);
          st.update(t, W, 0.12 * H, top - 40, mode === 'hook' ? { avoid: [(P.star?.[0] ?? 0.74) * W, (P.star?.[1] ?? 0.36) * H, 230 * u] } : {});
          ea.update(t, W, H, top);
          blank(cone);
          if (mode === 'hook') {
            const rot = -20 + 7 * Math.sin(lt * 0.9), x = 0.36 * W + 40 * u * Math.sin(lt * 0.7), y = 0.5 * H + 26 * u * Math.cos(lt * 0.8);
            const r = hb.update(t, x, y, 0.8 * u, rot, { face: -1, panels: 1 });
            const sx = (P.star?.[0] ?? 0.74) * W, sy = (P.star?.[1] ?? 0.36) * H, b = 1 + 0.35 * pk + 0.12 * Math.sin(lt * 2.4);
            const f = r.front, dx = sx - f[0], dy = sy - f[1], d = Math.hypot(dx, dy), nx = -dy / d, ny = dx / d, w = 150 * u * b;
            cone.setAttribute('d', inkLoop([[f[0] + nx * 40 * u, f[1] + ny * 40 * u], [sx + nx * w, sy + ny * w], [sx - nx * w, sy - ny * w], [f[0] - nx * 40 * u, f[1] - ny * 40 * u]], { seed: sd + 5, t, amp: 1, smooth: false }));
            blur.update(t, sx, sy, 210 * u * b, 1);
          } else if (mode === 'deploy') {
            blur.update(t, -999, -999, 1, 0);
            const sx = 0.5 * W, sy = 0.58 * H;
            shBack.update(t, sx, sy, 1.0 * u, {});
            const lift = prog(lt, 0, Math.max(1.2, dur * 0.8)), hx = 0.47 * W, hy = lerp(0.47 * H, 0.33 * H, lift);
            const r = hb.update(t, hx, hy, 0.82 * u, -6 + 3 * Math.sin(lt * 0.7), { face: -1, panels: clamp01(lt / Math.max(1, dur * 0.85)), door: lerp(5, 55, prog(lt, 0.3, 1.5)) });
            shBack.update(t, sx, sy, 1.0 * u, { arm: r.P(0, 100), bend: 1 });
          } else if (mode === 'service') {
            blur.update(t, -999, -999, 1, 0);
            const sx = 0.48 * W, sy = 0.62 * H;
            shBack.update(t, sx, sy, 1.0 * u, {});
            const hx = 0.4 * W, hy = 0.43 * H;
            const r = hb.update(t, hx, hy, 0.86 * u, 90, { face: 1, panels: 1, aftOpen: true });
            const ax = hx + 200 * u, ay = hy + 10 * u + 8 * u * Math.sin(lt * 1.2);
            shBack.update(t, sx, sy, 1.0 * u, { arm: [ax, ay + 10 * u], bend: 1 });
            as.update(t, ax, ay, 1.15 * u, 0, { face: -1, tool: true, hand: [118 + 10 * Math.sin(lt * 3), -150], hand2: [90, -112] });
          } else {
            blur.update(t, -999, -999, 1, 0);
            const cx = 0.36 * W, cy = 0.42 * H, R0 = 180 * u, bob = 6 * u * Math.sin(lt * 0.9);
            const yy = cy + bob;
            // solar wings behind (sideways)
            const PW = [RC(-60, yy - 70 * u, cx - R0 - 10 * u, yy + 70 * u), RC(cx + R0 + 10 * u, yy - 70 * u, W + 60, yy + 70 * u)];
            G.panels.setAttribute('d', PW.map((p, i) => inkLoop(p, { seed: sd + 200 + i, t, amp: 0.8, smooth: false })).join(' '));
            const PL = []; for (let i = 0; i < 9; i++) { const x0 = -40 + i * 50 * u; if (x0 + 40 * u < cx - R0) PL.push(inkLoop(RC(x0, yy - 60 * u, x0 + 40 * u, yy + 60 * u), { seed: sd + 210 + i, t, amp: 0.4, smooth: false })); }
            for (let i = 0; i < 12; i++) { const x0 = cx + R0 + 20 * u + i * 50 * u; if (x0 < W + 40) PL.push(inkLoop(RC(x0, yy - 60 * u, x0 + 40 * u, yy + 60 * u), { seed: sd + 230 + i, t, amp: 0.4, smooth: false })); }
            G.panL.setAttribute('d', PL.join(' '));
            G.panR.setAttribute('d', PW.map((p, i) => inkPath(p, { w: 4, seed: sd + 250 + i, t, closed: true, smooth: false })).join(' '));
            // aperture door (seen tilted, hinged at the top)
            const DP = inkEllipsePts(cx, yy - R0 - 70 * u, R0 * 1.02, 56 * u, sd + 260, 14, 0, 0.02);
            G.door.setAttribute('d', inkLoop(DP, { seed: sd + 260, t, amp: 0.6 }));
            G.doorR.setAttribute('d', inkPath(DP, { w: 5, seed: sd + 261, t, closed: true }) + ' ' + inkPath([[cx - 30 * u, yy - R0 - 20 * u], [cx - 30 * u, yy - R0 + 4 * u]], { w: 8, seed: sd + 262, t }) + ' ' + inkPath([[cx + 30 * u, yy - R0 - 20 * u], [cx + 30 * u, yy - R0 + 4 * u]], { w: 8, seed: sd + 263, t }));
            G.tubeD.setAttribute('d', inkCircle(cx + 14 * u, yy + 12 * u, R0 * 1.06, sd + 264, t, { fill: true }));
            G.tube.setAttribute('d', inkCircle(cx, yy, R0, sd + 265, t, { fill: true }));
            G.mouth.setAttribute('d', inkCircle(cx, yy, R0 * 0.8, sd + 266, t, { fill: true }));
            G.sec.setAttribute('d', inkCircle(cx, yy, R0 * 0.18, sd + 267, t, { fill: true }));
            G.vanes.setAttribute('d', [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4; return inkPath([[cx + Math.cos(a) * R0 * 0.18, yy + Math.sin(a) * R0 * 0.18], [cx + Math.cos(a) * R0 * 0.8, yy + Math.sin(a) * R0 * 0.8]], { w: 5, seed: sd + 268 + i, t }); }).join(' '));
            G.rim.setAttribute('d', inkCircle(cx, yy, R0, sd + 272, t, { w: 7 }) + ' ' + inkCircle(cx, yy, R0 * 0.8, sd + 273, t, { w: 5 }) + ' ' + inkCircle(cx, yy, R0 * 0.18, sd + 274, t, { w: 4 }));
            // the spectacles drop on at the cue
            const k = spring(lt, hit, 0.6), drop = (1 - k) * -700 * u, gy = yy + drop, L2 = [cx + 2 * R0 + 70 * u, gy + 10 * u], rr = R0 * 1.12 * (1 + 0.06 * pk), r2 = R0 * 0.95 * (1 + 0.06 * pk);
            if (lt >= hit) {
              G.lensF.setAttribute('d', inkCircle(L2[0], L2[1], r2, sd + 280, t, { fill: true }));
              G.sharp.update(t, L2[0] - 30 * u, L2[1] - 20 * u, 150 * u, 0);
              G.sharp2.update(t, L2[0] + 60 * u, L2[1] + 70 * u, 70 * u, 0);
              const br = [[cx + rr * 0.92, gy - 40 * u], [lerp(cx + rr, L2[0] - r2, 0.5), gy - 80 * u], [L2[0] - r2 * 0.94, L2[1] - 46 * u]];
              const tm = [[cx - rr * 0.98, gy - 30 * u], [cx - rr - 120 * u, gy - 90 * u], [cx - rr - 170 * u, gy - 30 * u]];
              G.frame.setAttribute('d', [inkCircle(cx, gy, rr, sd + 281, t, { w: 26 }), inkCircle(L2[0], L2[1], r2, sd + 282, t, { w: 24 }), inkPath(br, { w: 22, seed: sd + 283, t }), inkPath(tm, { w: 20, seed: sd + 284, t })].join(' '));
              G.frameG.setAttribute('d', inkCircle(cx, gy, rr - 4 * u, sd + 285, t, { w: 6 }) + ' ' + inkCircle(L2[0], L2[1], r2 - 4 * u, sd + 286, t, { w: 6 }));
            } else { blank(G.lensF, G.frame, G.frameG); G.sharp.update(t, -999, -999, 1, 0); G.sharp2.update(t, -999, -999, 1, 0); }
          }
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ control-room console (front fills the frame bottom)
  function console_(parent, sd) {
    const top = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.35)), front = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.25)), pan = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.15));
    const bR = inkEl(parent, INK.red), bG = inkEl(parent, INK.green), bY = inkEl(parent, INK.gold), keys = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    return {
      update(t, W, H, y0) {
        const y1 = y0 + 90;
        const TP = [[-60, y0], [W + 60, y0], [W + 60, y1], [-60, y1]];
        top.setAttribute('d', inkLoop(TP, { seed: sd, t, amp: 0.6, smooth: false }));
        front.setAttribute('d', inkLoop(RC(-60, y1, W + 60, H + 60), { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const PN = []; for (let i = 0; i < 4; i++) { const x0 = 40 + i * (W - 80) / 4; PN.push(inkLoop(RC(x0 + 14, y1 + 260, x0 + (W - 80) / 4 - 14, H - 40), { seed: sd + 2 + i, t, amp: 0.6, smooth: false })); }
        pan.setAttribute('d', PN.join(' '));
        const R_ = [], G_ = [], Y_ = [], K = [];
        for (let i = 0; i < 18; i++) {
          const x = 50 + i * (W - 100) / 17, y = y0 + 30 + (i % 2) * 30, on = Math.sin(t * (2 + hn(sd + 3, i) * 3) + i) > 0;
          const d = inkCircle(x, y, on ? 11 : 8, sd + 10 + i, t, { fill: true });
          (i % 3 === 0 ? R_ : i % 3 === 1 ? G_ : Y_).push(d);
        }
        for (let i = 0; i < 12; i++) { const x = 70 + i * (W - 140) / 11; K.push(inkLoop(RC(x - 26, y1 + 40, x + 26, y1 + 80), { seed: sd + 40 + i, t, amp: 0.5, smooth: false }), inkLoop(RC(x - 26, y1 + 100, x + 26, y1 + 140), { seed: sd + 60 + i, t, amp: 0.5, smooth: false })); }
        bR.setAttribute('d', R_.join(' ')); bG.setAttribute('d', G_.join(' ')); bY.setAttribute('d', Y_.join(' ')); keys.setAttribute('d', K.join(' '));
        rim.setAttribute('d', inkPath([[-60, y0], [W + 60, y0]], { w: 6, seed: sd + 80, t }) + ' ' + inkPath([[-60, y1], [W + 60, y1]], { w: 6, seed: sd + 81, t }));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.hu_room
  SH.hu_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 301, mode = P.mode || 'blurry', u = W / 1080;
      const root = el(svg, 'g');
      const frame = inkEl(root, INK.inkSoft), screen = inkEl(root, DARK()), scan = inkEl(root, INK.paperLight, { 'fill-opacity': 0.07 });
      const sA = stars(el(root, 'g'), sd + 5, 16);
      const s1 = starImg(el(root, 'g'), sd + 10), s2 = starImg(el(root, 'g'), sd + 20), s3 = starImg(el(root, 'g'), sd + 30);
      const gx = galaxy(el(root, 'g'), sd + 40), split = inkEl(root, INK.paperLight), monR = inkEl(root);
      const tx1 = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: INK.paperLight }), tx2 = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: INK.gold });
      const p1 = window.LH.person(el(root, 'g'), seed * 3 + 1, { kind: 'lab', hair: 'dark', glasses: true });
      const p2 = window.LH.person(el(root, 'g'), seed * 3 + 2, { kind: 'lab', hair: 'white', glasses: false });
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const cs = console_(el(root, 'g'), sd + 60);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), pk = punch(lt, hit);
          const X0 = 110 * u, X1 = W - 110 * u, Y0 = 0.17 * H, Y1 = 0.45 * H, B = 26 * u;
          frame.setAttribute('d', inkLoop(RC(X0 - B, Y0 - B, X1 + B, Y1 + B), { seed: sd, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(RC(W / 2 - 40 * u, Y1 + B, W / 2 + 40 * u, Y1 + 90 * u), { seed: sd + 1, t, amp: 0.5, smooth: false }));
          screen.setAttribute('d', inkLoop(RC(X0, Y0, X1, Y1), { seed: sd + 2, t, amp: 0.4, smooth: false }));
          const sy = Y0 + ((lt * 0.35) % 1) * (Y1 - Y0);
          scan.setAttribute('d', inkLoop(RC(X0, sy, X1, Math.min(Y1, sy + 40 * u)), { seed: sd + 3, t, amp: 0.2, smooth: false }));
          const mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2;
          if (mode === 'blurry') {
            sA.update(t, W, -9999, -9998);
            const b = 1 - 0.25 * Math.max(0, Math.sin(lt * 1.6)) + 0.25 * pk;
            s1.update(t, mx - 40 * u, my, 230 * u, b); s2.update(t, mx + 250 * u, my - 120 * u, 90 * u, b); s3.update(t, X0 + 130 * u, my + 110 * u, 70 * u, b);
            gx.update(t, -999, -999, 1, 0);
            blank(split); tx1.textContent = ''; tx2.textContent = '';
            monR.setAttribute('d', inkPath(RC(X0 - B, Y0 - B, X1 + B, Y1 + B), { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath(RC(X0, Y0, X1, Y1), { w: 4, seed: sd + 5, t, closed: true, smooth: false }));
          } else {
            const wp = prog(lt, Math.max(0, hit - 0.5), 0.7), xs = lerp(X1, mx, wp);
            s1.update(t, lerp(mx, X0 + (mx - X0) / 2, wp), my + 10 * u, 200 * u, 1); s2.update(t, -999, -999, 1, 0); s3.update(t, -999, -999, 1, 0);
            if (wp > 0.02) { gx.update(t, lerp(X1 + 300 * u, mx + (X1 - mx) / 2, wp), my + 30 * u, 240 * u, 1 + 0.06 * pk); sA.update(t, W, -9999, -9998); }
            else { gx.update(t, -999, -999, 1, 0); sA.update(t, W, -9999, -9998); }
            split.setAttribute('d', wp > 0.02 ? inkPath([[xs, Y0], [xs, Y1]], { w: 8, seed: sd + 6, t }) : '');
            tx1.textContent = 'BEFORE'; tx2.textContent = wp > 0.5 ? 'AFTER' : '';
            tx1.setAttribute('x', f1(lerp(mx, X0 + (mx - X0) / 2, wp))); tx1.setAttribute('y', f1(Y0 + 70 * u)); tx1.setAttribute('font-size', f1(56 * u));
            tx2.setAttribute('x', f1(mx + (X1 - mx) / 2)); tx2.setAttribute('y', f1(Y0 + 70 * u)); tx2.setAttribute('font-size', f1(56 * u * (1 + 0.1 * pk)));
            monR.setAttribute('d', inkPath(RC(X0 - B, Y0 - B, X1 + B, Y1 + B), { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath(RC(X0, Y0, X1, Y1), { w: 4, seed: sd + 5, t, closed: true, smooth: false }));
          }
          // scientists standing behind the console, looking up at the screen
          const gy = 0.66 * H, cheer = mode === 'sharp' ? prog(lt, hit, 0.4) : 0;
          const lean1 = mode === 'blurry' ? 6 * Math.sin(lt * 0.9) : 4;
          const h1 = p1.update(t, 0.2 * W, gy, 1.0 * u, { face: 1, lean: lean1, look: [4, -6], brow: mode === 'blurry' ? 1 : 0.4, armR: mode === 'blurry' ? [0.2 * W + 110 * u, gy - 470 * u] : [lerp(0.2 * W + 70 * u, 0.2 * W + 110 * u, cheer), lerp(gy - 260 * u, gy - 560 * u, cheer)] });
          const sx = mode === 'blurry' ? 0.44 * W : 0.78 * W;
          p2.update(t, sx, gy, 0.95 * u, { face: mode === 'blurry' ? 1 : -1, lean: -3, look: [2, -8], brow: 0.8, armR: [sx + (mode === 'blurry' ? 60 : -60) * u, gy - 350 * u], mouth: mode === 'sharp' ? cheer : 0.4 });
          if (kas) kas.update(lt, t, cues);
          cs.update(t, W, H, 0.6 * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the primary mirror (3/4 view): reflective face, centre hole, rim
  function mirror(parent, sd) {
    const back = inkEl(parent, SILVER_D()), face = inkEl(parent, GLASS()), grid = inkEl(parent, mix(INK.blue, INK.ink, 0.15), { 'fill-opacity': 0.55 }), gleam = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.8 });
    const edge = inkEl(parent, INK.red, { 'fill-opacity': 0.5 }), hole = inkEl(parent, DARK()), rim = inkEl(parent);
    return {
      update(t, cx, cy, rx, ry, o = {}) {
        back.setAttribute('d', inkLoop(inkEllipsePts(cx + 18, cy + 22, rx * 1.03, ry * 1.03, sd, 18, 0, 0.01), { seed: sd, t, amp: 0.6 }));
        const FP = inkEllipsePts(cx, cy, rx, ry, sd + 1, 18, 0, 0.01);
        face.setAttribute('d', inkLoop(FP, { seed: sd + 1, t, amp: 0.5 }));
        // reflected grid lines (bend near the edge when o.bend > 0)
        const GL = [], b = o.bend || 0;
        for (let i = -4; i <= 4; i++) {
          const P1 = [], P2 = [];
          for (let j = -10; j <= 10; j++) {
            const q = j / 10, xi = i / 5, yy = q * Math.sqrt(Math.max(0, 1 - xi * xi)), xx = q * Math.sqrt(Math.max(0, 1 - xi * xi));
            const e1 = Math.pow(Math.hypot(xi, yy), 6) * b, e2 = Math.pow(Math.hypot(xx, xi), 6) * b;
            P1.push([cx + xi * rx * (1 - 0.12 * e1), cy + yy * ry * 0.98 + 30 * e1 * Math.sin(t * 3 + j)]);
            P2.push([cx + xx * rx * 0.98 + 30 * e2 * Math.sin(t * 3 + j), cy + xi * ry * (1 - 0.12 * e2)]);
          }
          GL.push(inkPath(P1, { w: 3, seed: sd + 10 + i, t, amp: 0.6 }), inkPath(P2, { w: 3, seed: sd + 30 + i, t, amp: 0.6 }));
        }
        grid.setAttribute('d', GL.join(' '));
        const gp = o.gleam ?? -1;
        if (gp > -0.9 && gp < 1.6) {
          const gx0 = cx + (gp * 2.4 - 1.2) * rx;
          gleam.setAttribute('d', inkLoop([[gx0 - 30, cy - ry * 0.9], [gx0 + 50, cy - ry * 0.9], [gx0 - 30, cy + ry * 0.9], [gx0 - 110, cy + ry * 0.9]].map(([x, y]) => [Math.max(cx - rx * 0.9, Math.min(cx + rx * 0.9, x)), y]), { seed: sd + 50, t, amp: 0.6, smooth: false }));
        } else gleam.setAttribute('d', '');
        if (o.edge > 0.01) {
          const k = o.edge, ER = inkEllipsePts(cx, cy, rx * (1 - 0.13 * k), ry * (1 - 0.13 * k), sd + 2, 18, 0, 0.01).reverse();
          edge.setAttribute('d', inkLoop(FP, { seed: sd + 1, t, amp: 0.5 }) + ' ' + inkLoop(ER, { seed: sd + 3, t, amp: 0.5 }));
        } else edge.setAttribute('d', '');
        hole.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, rx * 0.2, ry * 0.2, sd + 4, 12, 0, 0.02), { seed: sd + 4, t, amp: 0.4 }));
        rim.setAttribute('d', inkPath(FP, { w: 9, seed: sd + 5, t, closed: true }) + ' ' + inkPath(inkEllipsePts(cx, cy, rx * 0.2, ry * 0.2, sd + 4, 12, 0, 0.02), { w: 5, seed: sd + 6, t, closed: true }) +
          (o.edge > 0.01 ? ' ' + inkPath(inkEllipsePts(cx, cy, rx * (1 - 0.13 * o.edge), ry * (1 - 0.13 * o.edge), sd + 2, 18, 0, 0.01), { w: 3, seed: sd + 7, t, closed: true }) : ''));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.hu_mirror
  SH.hu_mirror = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 501, mode = P.mode || 'polish', u = W / 1080;
      const root = el(svg, 'g');
      const stand = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3)), standR = inkEl(root);
      const tower = mode === 'test' ? { legs: inkEl(root, INK.inkSoft), tube: inkEl(root, SILVER()), cut: inkEl(root, DARK()), m1: inkEl(root, GLASS()), lens: inkEl(root, GLASS()), ghost: inkEl(root), beam: inkEl(root, INK.red, { 'fill-opacity': 0.28 }), beamC: inkEl(root, INK.red), rim: inkEl(root),
        magBg: inkEl(root, INK.paperLight), magIn: inkEl(root, DARK()), magLens: inkEl(root, GLASS()), magGhost: inkEl(root, INK.green), magArrow: inkEl(root, INK.red), magR: inkEl(root), handle: inkEl(root, INK.inkSoft) } : null;
      const mr = mirror(el(root, 'g'), sd + 20);
      const tech = window.LH.person(el(root, 'g'), seed * 3 + 5, { kind: 'lab', hair: 'dark', glasses: true });
      const hood = inkEl(root, INK.paperLight), hoodR = inkEl(root), mask = inkEl(root, INK.paperLight);
      const fr = window.LH.front(el(root, 'g'), seed * 5 + 7, 'bench');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), pk = punch(lt, hit), sm = atOr(cues, 'smooth', dur * 0.3);
          const gy = 0.62 * H;
          let th;
          if (mode === 'polish') {
            const cx = 0.56 * W, cy = 0.36 * H, rx = 340 * u, ry = 320 * u;
            stand.setAttribute('d', inkLoop([[cx - 70 * u, cy + ry * 0.6], [cx + 70 * u, cy + ry * 0.6], [cx + 110 * u, gy], [cx - 110 * u, gy]], { seed: sd, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(RC(cx - 260 * u, gy - 30 * u, cx + 260 * u, gy + 10 * u), { seed: sd + 1, t, amp: 0.5, smooth: false }));
            standR.setAttribute('d', inkPath([[cx - 260 * u, gy - 30 * u], [cx + 260 * u, gy - 30 * u]], { w: 5, seed: sd + 2, t }) + ' ' + inkPath([[cx - rx * 0.96, cy + 20 * u], [cx - rx - 40 * u, cy + 30 * u], [cx - 200 * u, gy - 30 * u]], { w: 10, seed: sd + 3, t }) + ' ' + inkPath([[cx + rx * 0.96, cy + 20 * u], [cx + rx + 40 * u, cy + 30 * u], [cx + 200 * u, gy - 30 * u]], { w: 10, seed: sd + 4, t }));
            const ek = clamp01((lt - hit) / 0.4);
            mr.update(t, cx, cy, rx, ry, { gleam: (lt - sm) / 1.0, edge: ek * (1 + 0.3 * pk), bend: ek });
            th = tech.update(t, 0.12 * W, gy + 40 * u, 0.9 * u, { face: 1, lean: 4 + 3 * Math.sin(lt * 1.1), look: [6, -4], brow: lt > hit ? 1 : 0.2, armR: lt > hit ? [0.12 * W + 150 * u, gy - 470 * u] : [0.12 * W + 70 * u, gy - 230 * u] });
          } else {
            const cx = 0.5 * W, cy = 0.55 * H, rx = 400 * u, ry = 90 * u;
            stand.setAttribute('d', inkLoop(RC(cx - rx - 20 * u, cy + 10 * u, cx + rx + 20 * u, cy + 90 * u), { seed: sd, t, amp: 0.6, smooth: false }));
            standR.setAttribute('d', inkPath(RC(cx - rx - 20 * u, cy + 10 * u, cx + rx + 20 * u, cy + 90 * u), { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
            mr.update(t, cx, cy, rx, ry, { gleam: ((lt * 0.4) % 1.6) - 0.3 });
            // test tower
            const tx = 0.42 * W, ty0 = 0.17 * H, ty1 = 0.33 * H, tw = 70 * u;
            tower.legs.setAttribute('d', inkPath([[tx - tw, ty1], [cx - rx + 40 * u, cy - 10 * u]], { w: 10, seed: sd + 30, t }) + ' ' + inkPath([[tx + tw, ty1], [cx + 60 * u, cy - 20 * u]], { w: 10, seed: sd + 31, t }));
            tower.tube.setAttribute('d', inkLoop(RC(tx - tw, ty0, tx + tw, ty1), { seed: sd + 32, t, amp: 0.5, smooth: false }));
            tower.cut.setAttribute('d', inkLoop(RC(tx - tw + 18 * u, ty0 + 20 * u, tx + tw - 18 * u, ty1 - 14 * u), { seed: sd + 33, t, amp: 0.4, smooth: false }));
            tower.m1.setAttribute('d', inkLoop(inkEllipsePts(tx, ty0 + 60 * u, 40 * u, 10 * u, sd + 34, 10, 0, 0.02), { seed: sd + 34, t, amp: 0.3 }) + ' ' + inkLoop(inkEllipsePts(tx, ty0 + 130 * u, 40 * u, 10 * u, sd + 35, 10, 0, 0.02), { seed: sd + 35, t, amp: 0.3 }));
            const slip = P.slip === false ? 0 : prog(lt, hit, 0.5), ly = ty1 - 70 * u + slip * 34 * u, lx = tx;
            tower.lens.setAttribute('d', inkLoop(inkEllipsePts(lx, ly, 44 * u, 16 * u, sd + 36, 10, 0, 0.02), { seed: sd + 36, t, amp: 0.3 }));
            tower.ghost.setAttribute('d', slip > 0.05 ? inkPath(inkEllipsePts(lx, ty1 - 70 * u, 44 * u, 16 * u, sd + 37, 10, 0, 0.02), { w: 3, seed: sd + 37, t, closed: true }) : '');
            const fan = 0.75 + 0.08 * Math.sin(lt * 4);
            tower.beam.setAttribute('d', inkLoop([[tx - 20 * u, ty1], [tx + 20 * u, ty1], [cx + rx * fan, cy], [cx - rx * fan, cy]], { seed: sd + 38, t, amp: 0.8, smooth: false }));
            tower.beamC.setAttribute('d', inkPath([[tx, ty1], [cx - rx * fan * 0.5, cy]], { w: 3, seed: sd + 39, t }) + ' ' + inkPath([[tx, ty1], [cx + rx * fan * 0.5, cy]], { w: 3, seed: sd + 40, t }));
            tower.rim.setAttribute('d', inkPath(RC(tx - tw, ty0, tx + tw, ty1), { w: 6, seed: sd + 41, t, closed: true, smooth: false }) + ' ' + inkPath(inkEllipsePts(lx, ly, 44 * u, 16 * u, sd + 36, 10, 0, 0.02), { w: 4, seed: sd + 42, t, closed: true }));
            // magnifier on the right shows the gap
            const mk = P.slip === false ? 0 : spring(lt, hit + 0.15, 0.5), mx = (P.magX ?? 0.71) * W, my = (P.magY ?? 0.27) * H, mR = (P.mag ?? 170) * u * mk * (1 + 0.05 * pk);
            if (mk > 0.01) {
              tower.magBg.setAttribute('d', inkCircle(mx, my, mR, sd + 50, t, { fill: true }));
              tower.magIn.setAttribute('d', inkLoop(RC(mx - mR * 0.55, my - mR * 0.85, mx + mR * 0.55, my + mR * 0.85).map(([x, y]) => [x, Math.max(my - Math.sqrt(Math.max(0, mR * mR - (x - mx) * (x - mx))) * 0.98, Math.min(my + Math.sqrt(Math.max(0, mR * mR - (x - mx) * (x - mx))) * 0.98, y))]), { seed: sd + 51, t, amp: 0.4, smooth: false }));
              const g0 = my - mR * 0.32, g1 = my + mR * 0.3;
              tower.magGhost.setAttribute('d', inkPath(inkEllipsePts(mx, g0, mR * 0.48, mR * 0.14, sd + 52, 12, 0, 0.02), { w: 5, seed: sd + 52, t, closed: true, amp: 0.5 }));
              tower.magLens.setAttribute('d', inkLoop(inkEllipsePts(mx, g1, mR * 0.48, mR * 0.14, sd + 53, 12, 0, 0.02), { seed: sd + 53, t, amp: 0.5 }));
              const ax = mx + mR * 0.66;
              tower.magArrow.setAttribute('d', inkPath([[ax, g0], [ax, g1]], { w: 7, seed: sd + 54, t }) + ' ' + inkLoop([[ax - 16 * u, g1 - 22 * u], [ax + 16 * u, g1 - 22 * u], [ax, g1 + 4 * u]], { seed: sd + 55, t, amp: 0.3, smooth: false }) + ' ' + inkLoop([[ax - 16 * u, g0 + 22 * u], [ax + 16 * u, g0 + 22 * u], [ax, g0 - 4 * u]], { seed: sd + 56, t, amp: 0.3, smooth: false }));
              tower.magR.setAttribute('d', inkCircle(mx, my, mR, sd + 57, t, { w: 12 }) + ' ' + inkPath(inkEllipsePts(mx, g1, mR * 0.48, mR * 0.14, sd + 53, 12, 0, 0.02), { w: 4, seed: sd + 58, t, closed: true }) + ' ' + inkPath([[lx + 50 * u, ly], [mx - mR, my + mR * 0.3]], { w: 3, seed: sd + 59, t }));
              tower.handle.setAttribute('d', inkPath([[mx + mR * 0.7, my + mR * 0.7], [mx + mR * 1.05, my + mR * 1.15]], { w: 26 * u, seed: sd + 60, t, taper: 0 }));
            } else blank(tower.magBg, tower.magIn, tower.magGhost, tower.magLens, tower.magArrow, tower.magR, tower.handle);
            th = tech.update(t, 0.13 * W, gy + 60 * u, 0.85 * u, { face: 1, lean: 3 * Math.sin(lt * 1.1), look: [6, -10], brow: lt > hit ? 1 : 0.3, armR: [0.13 * W + 120 * u, gy - 420 * u + 10 * u * Math.sin(lt * 2)] });
          }
          // clean-room hood + face mask over the technician's head
          if (P.tech === false) { tech.g.setAttribute('transform', 'scale(0)'); blank(hood, hoodR, mask); fr.update(t, W, H, 0.69 * H); LB.forEach(l => l.update(lt, t, cues)); return; }
          const hc = th.hc, s = mode === 'polish' ? 0.9 * u : 0.85 * u;
          const HP = inkEllipsePts(hc[0] - 4 * s, hc[1] - 4 * s, 62 * s, 64 * s, sd + 70, 14, 0, 0.04);
          hood.setAttribute('d', inkLoop(HP, { seed: sd + 70, t, amp: 0.6 }));
          hoodR.setAttribute('d', inkPath(HP, { w: 5, seed: sd + 71, t, closed: true }) + ' ' + inkPath(inkEllipsePts(hc[0] + 18 * s, hc[1] - 2 * s, 34 * s, 40 * s, sd + 72, 12, 0, 0.03), { w: 3.5, seed: sd + 72, t, closed: true }));
          mask.setAttribute('d', inkLoop(inkEllipsePts(hc[0] + 28 * s, hc[1] + 18 * s, 24 * s, 16 * s, sd + 73, 10, 0, 0.03), { seed: sd + 73, t, amp: 0.4 }));
          fr.update(t, W, H, 0.69 * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.hu_hair
  SH.hu_hair = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 701, u = W / 1080;
      const root = el(svg, 'g');
      const HAIR = mix(INK.gold, INK.ink, 0.62), HAIR_D = mix(INK.gold, INK.ink, 0.8), END = mix(INK.gold, INK.ink, 0.42);
      const mBack = inkEl(root, SILVER_D()), mFace = inkEl(root, GLASS()), mErr = inkEl(root, INK.red), mRim = inkEl(root);
      const cone = inkEl(root, INK.paperLight, { 'fill-opacity': 0.55 }), coneR = inkEl(root);
      const strand = inkEl(root, HAIR), cut = inkEl(root, HAIR_D), endD = inkEl(root, END), slice = inkEl(root, INK.red), rim = inkEl(root);
      const ruler = inkEl(root, INK.paperLight), ticks = inkEl(root), tickHi = inkEl(root, INK.red);
      const fr = window.LH.front(el(root, 'g'), seed * 5 + 9, 'bench');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), pk = punch(lt, hit), on = clamp01((lt - hit) / 0.3);
          // the mirror's rim behind the bench, a red sliver along its edge
          const my0 = 0.545 * H, MF = [[-60, my0 + 70 * u], [W * 0.35, my0 + 20 * u], [W * 0.7, my0], [W + 60, my0 - 10 * u], [W + 60, H + 60], [-60, H + 60]];
          mBack.setAttribute('d', inkLoop(MF.map(([x, y], i) => i < 4 ? [x, y - 34 * u] : [x, y]), { seed: sd + 100, t, amp: 0.6 }));
          mFace.setAttribute('d', inkLoop(MF, { seed: sd + 101, t, amp: 0.6 }));
          const top = MF.slice(0, 4), ERR = top.concat(top.slice().reverse().map(([x, y]) => [x, y + (12 + 18 * (x / W)) * u * on]));
          mErr.setAttribute('d', on > 0 ? inkLoop(ERR, { seed: sd + 102, t, amp: 0.3 }) : '');
          const GR = []; for (let i = 1; i < 4; i++) GR.push(inkPath([[-40, my0 + 70 * u + i * 70 * u], [W * 0.5, my0 + 15 * u + i * 70 * u], [W + 40, my0 - 10 * u + i * 70 * u]], { w: 3, seed: sd + 103 + i, t }));
          mRim.setAttribute('d', inkPath(top, { w: 8, seed: sd + 110, t }) + ' ' + GR.join(' '));
          // one long hair, cut end at E, running off to the right with a slight curve
          const sw = Math.sin(lt * 0.9) * 8 * u, hw = 27 * u, E = [0.63 * W, 0.335 * H + sw * 0.3];
          const C = []; for (let i = 0; i <= 16; i++) { const q = i / 16; C.push([lerp(E[0], W + 120 * u, q), E[1] - 150 * u * q + 70 * u * Math.sin(q * Math.PI) + sw * q]); }
          const N = C.map((p, i) => { const a = C[Math.min(16, i + 1)], b = C[Math.max(0, i - 1)], dx = a[0] - b[0], dy = a[1] - b[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; });
          const up = C.map((p, i) => [p[0] + N[i][0] * hw, p[1] + N[i][1] * hw]), dn = C.map((p, i) => [p[0] - N[i][0] * hw, p[1] - N[i][1] * hw]);
          strand.setAttribute('d', inkLoop(up.concat(dn.slice().reverse()), { seed: sd, t, amp: 0.6, smooth: false }));
          const CU = []; for (let i = 2; i < 16; i += 2) CU.push(inkPath([up[i], [C[i][0] + 16 * u, C[i][1]], dn[i]], { w: 3, seed: sd + 1 + i, t, amp: 0.4 }));
          cut.setAttribute('d', CU.join(' '));
          // cut end: a small dark disc, the red 1/50 slice across it
          const n0 = N[0], ep = inkEllipsePts(E[0], E[1], 13 * u, hw * 1.02, sd + 30, 12, Math.atan2(n0[1], n0[0]) - Math.PI / 2, 0.02);
          endD.setAttribute('d', inkLoop(ep, { seed: sd + 30, t, amp: 0.3 }));
          const s0 = [E[0] + n0[0] * hw * 0.55, E[1] + n0[1] * hw * 0.55];
          slice.setAttribute('d', on > 0 ? inkPath([[s0[0] - 12 * u, s0[1] + 2 * u], [s0[0] + 12 * u, s0[1] - 2 * u]], { w: 4 + 3 * pk, seed: sd + 31, t, amp: 0.2, taper: 0 }) : '');
          rim.setAttribute('d', inkPath(up, { w: 5, seed: sd + 32, t, amp: 0.5 }) + ' ' + inkPath(dn, { w: 5, seed: sd + 33, t, amp: 0.5 }) + ' ' + inkPath(ep, { w: 4, seed: sd + 34, t, closed: true, amp: 0.3 }));
          // magnifying callout: from the hair's two edges to a big vertical ruler of 50 ticks (the hair's width)
          const T = [E[0] + n0[0] * hw, E[1] + n0[1] * hw], B = [E[0] - n0[0] * hw, E[1] - n0[1] * hw];
          const rx = 0.38 * W, ry0 = 0.25 * H, ry1 = 0.45 * H, k = spring(lt, 0.05, 0.6), r0 = lerp(T[1], ry0, k), r1 = lerp(B[1], ry1, k), rxx = lerp(T[0], rx, k);
          cone.setAttribute('d', inkLoop([T, [rxx + 40 * u, r0], [rxx + 40 * u, r1], B], { seed: sd + 40, t, amp: 0.5, smooth: false }));
          coneR.setAttribute('d', inkPath([T, [rxx + 40 * u, r0]], { w: 3.5, seed: sd + 41, t }) + ' ' + inkPath([B, [rxx + 40 * u, r1]], { w: 3.5, seed: sd + 42, t }));
          const RR = RC(rxx - 40 * u, r0, rxx + 40 * u, r1);
          ruler.setAttribute('d', inkLoop(RR, { seed: sd + 43, t, amp: 0.4, smooth: false }));
          const TK = [inkPath(RR, { w: 5, seed: sd + 44, t, closed: true, smooth: false })];
          for (let i = 0; i <= 50; i++) { const y = lerp(r0, r1, i / 50), L = i % 10 === 0 ? 50 : i % 5 === 0 ? 34 : 18; TK.push(inkPath([[rxx + 40 * u, y], [rxx + 40 * u - L * u, y]], { w: 2.4, seed: sd + 50 + i, t, amp: 0.3 })); }
          ticks.setAttribute('d', TK.join(' '));
          const q0 = lerp(r0, r1, 0.2), q1 = lerp(r0, r1, 0.22);
          tickHi.setAttribute('d', on > 0 ? inkLoop(RC(rxx - 40 * u - 20 * u * pk, q0, rxx + 40 * u + 20 * u * pk, q1), { seed: sd + 110, t, amp: 0.2, smooth: false }) + ' ' + inkPath([[rxx + 44 * u, (q0 + q1) / 2], [s0[0] - 14 * u, s0[1]]], { w: 3, seed: sd + 111, t }) : '');
          fr.update(t, W, H, 0.665 * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.hu_sky
  SH.hu_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 901, u = W / 1080;
      const root = el(svg, 'g');
      const st = stars(el(root, 'g'), sd, 30);
      const trail = inkEl(root, INK.gold, { 'fill-opacity': 0.4 });
      const hb = hubble(el(root, 'g'), sd + 10);
      const glint = inkEl(root, INK.paperLight);
      const hill = inkEl(root, mix(INK.ink, INK.blue, 0.35)), hillR = inkEl(root);
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const fr = window.LH.front(el(root, 'g'), seed * 5 + 3, 'grass');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, p = lin(lt, 0, Math.max(1, dur));
          st.update(t, W, 0.14 * H, 0.5 * H);
          const hx = lerp(0.12 * W, 0.86 * W, p), hy = lerp(0.3 * H, 0.22 * H, p) + 10 * u * Math.sin(p * 3.14);
          trail.setAttribute('d', inkPath([[hx - 300 * u, hy + 40 * u], [hx - 150 * u, hy + 14 * u], [hx - 40 * u, hy]], { w: 14, seed: sd + 1, t, taper: 0.9 }));
          hb.update(t, hx, hy, 0.34 * u, -8 + 10 * p, { face: -1, panels: 1 });
          const gk = 0.5 + 0.5 * Math.sin(lt * 5);
          glint.setAttribute('d', star4(hx - 70 * u, hy - 20 * u, (30 + 30 * gk) * u, sd + 2, t, 0.12));
          const gy = 0.63 * H, HL = [[-60, gy + 40 * u], [W * 0.2, gy - 30 * u], [W * 0.45, gy - 40 * u], [W * 0.75, gy + 10 * u], [W + 60, gy + 30 * u], [W + 60, H + 60], [-60, H + 60]];
          hill.setAttribute('d', inkLoop(HL, { seed: sd + 3, t, amp: 0.8 }));
          hillR.setAttribute('d', inkPath(HL.slice(0, 5), { w: 6, seed: sd + 4, t }));
          if (kas) kas.update(lt, t, cues);
          fr.update(t, W, H, 0.72 * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
