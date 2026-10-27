// mohac__lib: shared ink figures for the mohac_* shots (14-mohac-1526). Not a shot type itself.
// window.MHC = {f1, atOr, side(name) -> fill token, rider(g, o), soldier(g, o), cannon(g, o), puff(cx, cy, r, seed, t),
//   reeds(g, list, sd), banner(g, o), flash(cx, cy, r, seed, t, dir)}
//   rider(g, {side: "hu"|"ot"|"none", head: "helm"|"cap"|"crown"|"turban", crown: true (gold crown on the helmet), barding: true, lance: true, riderless, seed})
//     .update(t, {x, y, s, face: 1|-1, ph (gallop cycles), gallop: 0..1, couch: 0..1 (lance down), rear: 0..1 (horse rears),
//              tumble: 0..1 (rider thrown), op: 1, soft: false (far rows: thinner ink-soft line)})
//   soldier(g, {hat: "bork"|"helm"|"turban", gun: true, pike: false, seed}).update(t, {x, y, s, face, aim: 0..1, kneel: 0..1, fire: 0..1})
//   cannon(g, {seed}).update(t, {x, y, s, face, recoil: 0..1, fire: 0..1 (flash), spin})
// Horses, riders and guns are drawn in local units (horse ~200 long, ground at y = 0) under one group transform.
// Pure function of (seed, t); palette tokens only (INK). Ink width stays ~3-6 screen px at any scale.
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const side = n => n === 'hu' ? INK.red : n === 'ot' ? INK.blue : n === 'gold' ? INK.gold : INK.paperLight;
  const TAU = Math.PI * 2;
  const R = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  // a soft cloud of smoke/dust: lobed closed loop
  function puffPts(cx, cy, r, seed, n = 9) {
    const q = rng(inkHash(seed, 4242)), pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, k = 0.78 + q() * 0.42;
      pts.push([cx + Math.cos(a) * r * k * 1.25, cy + Math.sin(a) * r * k * (a > Math.PI ? 0.95 : 0.6)]);
    }
    return pts;
  }
  const puff = (cx, cy, r, seed, t) => inkLoop(puffPts(cx, cy, r, seed), { seed, t, amp: Math.min(3, r * 0.04) });
  // muzzle flash: a star, pointing along dir (1 right, -1 left)
  function flash(cx, cy, r, seed, t, dir = 1) {
    const pts = [], q = rng(inkHash(seed, inkFrame(t)));
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, k = i % 2 ? 0.35 : (Math.abs(Math.cos(a)) > 0.7 && Math.cos(a) * dir > 0 ? 1.5 : 0.85) * (0.8 + q() * 0.4);
      pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.7]);
    }
    return inkLoop(pts, { seed, t, amp: 1, smooth: false });
  }

  // ------------------------------------------------------------ horse + rider
  function rider(g0, o = {}) {
    const sd = o.seed || 1, g = el(g0, 'g');
    const tail = inkEl(g, INK.ink), legsB = inkEl(g, INK.ink), horse = inkEl(g, INK.paperLight), bard = inkEl(g, side(o.side)),
      lance = inkEl(g, INK.ink), pennon = inkEl(g, side(o.side)), body = inkEl(g, INK.ink), legsF = inkEl(g, INK.ink),
      headF = inkEl(g, INK.paperLight), hat = inkEl(g, o.head === 'crown' ? INK.gold : o.head === 'turban' || o.head === 'cap' ? INK.paperLight : INK.inkSoft),
      plume = inkEl(g, side(o.side)), crownF = inkEl(g, INK.gold), lines = inkEl(g, INK.ink);
    const leg = (hip, ph, off, front, gallop) => {
      const c = Math.sin(TAU * (ph + off)), cc = Math.cos(TAU * (ph + off));
      const th = gallop * 0.62 * c + (1 - gallop) * 0.02;
      const knee = add(hip, R([0, 46], -th));
      const bend = gallop * (front ? -(0.35 + 0.55 * Math.max(0, cc)) : (0.25 + 0.5 * Math.max(0, -cc)));
      const hoof = add(knee, R([0, 50], -th - bend));
      return [hip, knee, hoof];
    };
    return {
      node: g,
      update(t, a) {
        const s = a.s ?? 1, face = a.face ?? 1, gal = a.gallop ?? 0, ph = a.ph ?? 0, couch = a.couch ?? 0, rear = a.rear ?? 0, tum = a.tumble ?? 0;
        const sw = (a.soft ? 3 : 5.2) / Math.max(0.3, Math.min(1.4, s)) * Math.min(1, 0.55 + s * 0.6);
        const tt = t, bob = -gal * 6 * Math.abs(Math.sin(TAU * ph)) + (1 - gal) * Math.sin(t * 2.2 + sd) * 1.2;
        g.setAttribute('transform', `translate(${f1(a.x)} ${f1(a.y)}) scale(${f1(face * s * 1000) / 1000} ${f1(s * 1000) / 1000}) rotate(${f1(-rear * 38 + tum * 10)} -52 0)`);
        g.setAttribute('opacity', a.op ?? 1);
        if (a.soft) [tail, legsB, body, legsF, lines, lance].forEach(n => n.setAttribute('fill', INK.inkSoft));
        const by = -112 + bob, P = (x, y) => [x, y + bob];
        // legs: far pair darker behind the body, near pair in front
        const LF = leg(P(48, -96), ph, 0.0, true, gal), LF2 = leg(P(42, -96), ph, 0.12, true, gal),
          LR = leg(P(-50, -96), ph, 0.5, false, gal), LR2 = leg(P(-44, -96), ph, 0.62, false, gal);
        if (rear > 0) {   // rearing: front legs fold up, rear legs planted
          const fold = p => [p[0], add(p[0], R([0, 40], 1.3 * rear)), add(add(p[0], R([0, 40], 1.3 * rear)), R([0, 42], 2.4 * rear))];
          LF.splice(0, 3, ...fold(LF)); LF2.splice(0, 3, ...fold(LF2));
        }
        legsB.setAttribute('d', inkPath(LF2, { w: sw * 1.4, seed: sd + 1, t: tt, amp: 1 }) + inkPath(LR2, { w: sw * 1.4, seed: sd + 2, t: tt, amp: 1 }));
        legsF.setAttribute('d', inkPath(LF, { w: sw * 1.5, seed: sd + 3, t: tt, amp: 1 }) + inkPath(LR, { w: sw * 1.5, seed: sd + 4, t: tt, amp: 1 }));
        const sway = Math.sin(t * 5 + sd) * 6 * (0.3 + gal);
        tail.setAttribute('d', inkPath([P(-62, -126), P(-88, -118 + sway * 0.3), P(-104, -96 + sway), P(-110, -74 + sway)], { w: sw * 2.2, seed: sd + 5, t: tt, taper: 0.7 }));
        // body + neck + head as one silhouette
        const neckUp = gal ? -6 * Math.sin(TAU * ph) : 0;
        const sil = [P(-66, -118), P(-58, -138), P(-10, -146), P(40, -140), P(62, -176 + neckUp), P(80, -206 + neckUp), P(98, -214 + neckUp),
          P(130, -180 + neckUp), P(134, -164 + neckUp), P(120, -156 + neckUp), P(98, -166 + neckUp), P(84, -150 + neckUp), P(76, -122), P(56, -92), P(-40, -88), P(-64, -98)];
        horse.setAttribute('d', inkLoop(sil, { seed: sd + 6, t: tt, amp: 1 }));
        let d = inkPath(sil, { w: sw, seed: sd + 7, t: tt, closed: true, amp: 1 });
        d += inkDot(103, -190 + bob + neckUp, 4, 4, sd + 8, tt) + inkPath([P(88, -206 + neckUp), P(84, -224 + neckUp)], { w: sw * 0.9, seed: sd + 9, t: tt });
        // mane
        d += inkPath([P(48, -150), P(64, -182 + neckUp), P(82, -208 + neckUp)], { w: sw * 1.6, seed: sd + 10, t: tt, taper: 0.8 });
        // barding (caparison) with a scalloped hem
        if (o.barding !== false) {
          const hem = []; for (let i = 0; i <= 8; i++) { const x = 66 - i * 17; hem.push(P(x, -78 + (i % 2 ? 7 : 0))); }
          const bp = [P(-64, -132), P(-6, -150), P(46, -142), P(70, -118), ...hem, P(-72, -100)];
          bard.setAttribute('d', inkLoop(bp, { seed: sd + 11, t: tt, amp: 1, smooth: false }));
          d += inkPath(bp, { w: sw * 0.8, seed: sd + 12, t: tt, closed: true, smooth: false });
        } else bard.setAttribute('d', '');
        // rider: thrown backwards by tumble
        const seat = P(-4, -146), lean = (couch * 0.32 - tum * 1.4);
        const sh = add(seat, R([0, -70], lean)), hd = add(sh, R([0, -28], lean * 1.2));
        const knee = P(16, -122), foot = P(8, -96);
        const elbow = add(sh, R([22, 22], lean * 0.5)), hand = add(sh, R([34, 34], lean * 0.4));
        if (!o.riderless) d += inkPath([seat, sh], { w: sw * 1.5, seed: sd + 13, t: tt }) + inkPath([seat, knee, foot], { w: sw * 1.3, seed: sd + 14, t: tt })
          + inkPath([sh, elbow, hand], { w: sw * 1.3, seed: sd + 15, t: tt }) + inkPath([sh, add(sh, R([-16, 34], lean)), add(sh, R([-4, 52], lean))], { w: sw * 1.2, seed: sd + 16, t: tt });
        else d += inkPath([P(-30, -146), P(-30, -110)], { w: sw, seed: sd + 13, t: tt }) + inkPath(inkEllipsePts(-30, -100 + bob, 8, 8, sd + 14, 6), { w: sw * 0.8, seed: sd + 15, t: tt, closed: true });
        body.setAttribute('d', d);
        if (o.riderless) { [headF, hat, plume, lines, lance, pennon].forEach(n => n.setAttribute('d', '')); return { head: [a.x, a.y] }; }
        const hr = 21;
        headF.setAttribute('d', inkLoop(inkEllipsePts(hd[0], hd[1], hr, hr, sd + 17, 10), { seed: sd + 17, t: tt, amp: 0.8 }));
        let ld = inkPath(inkEllipsePts(hd[0], hd[1], hr, hr, sd + 17, 10), { w: sw, seed: sd + 18, t: tt, closed: true, amp: 0.8 });
        ld += inkDot(hd[0] + 9, hd[1] - 3, 2.6, 3.2, sd + 19, tt);
        // headgear
        const hx = hd[0], hy = hd[1];
        let hp = [], pl = null;
        if (o.head === 'turban') hp = [[hx - 24, hy - 4], [hx - 26, hy - 26], [hx - 6, hy - 40], [hx + 18, hy - 34], [hx + 26, hy - 8]];
        else if (o.head === 'cap') { hp = [[hx - 22, hy - 8], [hx - 14, hy - 52], [hx + 4, hy - 58], [hx + 12, hy - 48], [hx + 22, hy - 8]]; }
        else if (o.head === 'crown') hp = [[hx - 22, hy - 12], [hx - 24, hy - 38], [hx - 12, hy - 26], [hx, hy - 44], [hx + 12, hy - 26], [hx + 24, hy - 38], [hx + 22, hy - 12]];
        else { hp = [[hx - 24, hy + 2], [hx - 24, hy - 22], [hx - 8, hy - 34], [hx + 12, hy - 32], [hx + 24, hy - 14], [hx + 25, hy + 2], [hx + 4, hy + 2], [hx + 4, hy - 8], [hx - 6, hy - 8], [hx - 6, hy + 2]]; pl = [[hx - 6, hy - 32], [hx - 30, hy - 58], [hx - 48, hy - 50], [hx - 24, hy - 30]]; }
        hat.setAttribute('d', inkLoop(hp, { seed: sd + 20, t: tt, amp: 0.8, smooth: o.head === 'turban' || o.head === 'cap' }));
        ld += inkPath(hp, { w: sw * 0.9, seed: sd + 21, t: tt, closed: true, amp: 0.8, smooth: o.head === 'turban' || o.head === 'cap' });
        if (o.crown) { const cr = [[hx - 20, hy - 26], [hx - 24, hy - 52], [hx - 12, hy - 40], [hx, hy - 60], [hx + 12, hy - 40], [hx + 24, hy - 52], [hx + 20, hy - 26]];
          crownF.setAttribute('d', inkLoop(cr, { seed: sd + 25, t: tt, amp: 0.6, smooth: false })); ld += inkPath(cr, { w: sw * 0.8, seed: sd + 26, t: tt, closed: true, smooth: false }); pl = null; }
        plume.setAttribute('d', pl ? inkLoop(pl.map(p => [p[0] - gal * 4 * Math.sin(t * 9), p[1]]), { seed: sd + 22, t: tt, amp: 1 }) : '');
        lines.setAttribute('d', ld);
        // lance: upright (ready) -> couched forward
        if (o.lance !== false) {
          const ang = lerp(-1.48, -0.06, couch) - tum * 0.9, L = 270, tail0 = add(hand, R([-70, 0], ang)), tip = add(hand, R([L, 0], ang));
          lance.setAttribute('d', inkPath([tail0, tip], { w: sw * 1.1, seed: sd + 23, t: tt, taper: 0.5 }));
          const pa = ang, base = add(tip, R([-34, 0], pa)), flap = Math.sin(t * 8 + sd) * 4;
          pennon.setAttribute('d', inkLoop([tip, add(base, R([0, 0], pa)), add(add(base, R([-6, 0], pa)), R([0, 26 + flap], pa)), add(tip, R([-12, 16 + flap], pa))], { seed: sd + 24, t: tt, amp: 0.8, smooth: false }));
        } else { lance.setAttribute('d', ''); pennon.setAttribute('d', ''); }
        return { head: [a.x + face * s * hd[0], a.y + s * hd[1]] };
      },
    };
  }

  // ------------------------------------------------------------ foot soldier (janissary / pikeman)
  function soldier(g0, o = {}) {
    const sd = o.seed || 1, g = el(g0, 'g');
    const hatF = inkEl(g, o.hat === 'bork' || o.hat === 'turban' ? INK.paperLight : INK.inkSoft), coat = inkEl(g, side(o.side || 'ot')),
      body = inkEl(g, INK.ink), headF = inkEl(g, INK.paperLight), lines = inkEl(g, INK.ink), fl = inkEl(g, INK.gold), fl2 = inkEl(g, INK.red);
    return {
      node: g,
      update(t, a) {
        const s = a.s ?? 1, face = a.face ?? 1, aim = a.aim ?? 0, kn = a.kneel ?? 0, fire = a.fire ?? 0;
        const sw = (a.soft ? 3 : 5) / Math.max(0.3, Math.min(1.4, s)) * Math.min(1, 0.55 + s * 0.6);
        g.setAttribute('transform', `translate(${f1(a.x)} ${f1(a.y)}) scale(${f1(face * s * 1000) / 1000} ${f1(s * 1000) / 1000})`);
        if (a.soft) [body, lines].forEach(n => n.setAttribute('fill', INK.inkSoft));
        const br = Math.sin(t * 2 + sd) * 1.5, rec = fire * 6;
        const wk = a.walk != null ? Math.sin(a.walk * Math.PI * 2) : null, lift = wk == null ? 0 : Math.abs(wk) * 4;
        const hip = [-rec * 0.3, -88 + kn * 34 + br - lift], sh = [hip[0] + 4 - rec * 0.4, hip[1] - 70], hd = [sh[0] + 6, sh[1] - 34];
        let fk = kn ? [hip[0] + 30, hip[1] + 4] : [hip[0] + 8, hip[1] + 44], ff = kn ? [hip[0] + 36, 0] : [hip[0] + 14, 0];
        let bk = kn ? [hip[0] - 18, -6] : [hip[0] - 6, hip[1] + 44], bf = kn ? [hip[0] - 50, 0] : [hip[0] - 16, 0];
        if (wk != null && !kn) { fk = [hip[0] + 4 + wk * 18, hip[1] + 44]; ff = [hip[0] + wk * 34, -Math.max(0, wk) * 10]; bk = [hip[0] + 4 - wk * 18, hip[1] + 44]; bf = [hip[0] - wk * 34, -Math.max(0, -wk) * 10]; }
        let d = inkPath([hip, fk, ff], { w: sw * 1.4, seed: sd + 1, t }) + inkPath([hip, bk, bf], { w: sw * 1.4, seed: sd + 2, t });
        // coat (kaftan) as a short tunic
        const cp = [[sh[0] - 14, sh[1] + 4], [sh[0] + 16, sh[1] + 4], [hip[0] + 22, hip[1] + 26], [hip[0] - 22, hip[1] + 26]];
        coat.setAttribute('d', inkLoop(cp, { seed: sd + 3, t, amp: 0.8, smooth: false }));
        d += inkPath(cp, { w: sw * 0.8, seed: sd + 4, t, closed: true, smooth: false }) + inkPath([hip, sh], { w: sw * 1.4, seed: sd + 5, t });
        // arms + gun: shouldered (aim 0) -> levelled (aim 1)
        const ang = lerp(-1.25, -0.04, aim), hand = add(sh, R([30, 6], ang * 0.3)), gb = add(sh, R([-16, 0], ang)), gt = add(sh, R([o.pike ? 200 : 120, 0], ang));
        d += inkPath([sh, add(sh, R([18, 16], ang * 0.4)), hand], { w: sw * 1.2, seed: sd + 6, t }) + inkPath([sh, add(sh, R([-6, 24], 0)), add(sh, R([10, 40], ang * 0.6))], { w: sw * 1.2, seed: sd + 7, t });
        if (o.gun !== false || o.pike) d += inkPath([gb, gt], { w: sw * (o.pike ? 1 : 1.5), seed: sd + 8, t, taper: 0.2 });
        body.setAttribute('d', d);
        headF.setAttribute('d', inkLoop(inkEllipsePts(hd[0], hd[1], 24, 24, sd + 9, 10), { seed: sd + 9, t, amp: 0.8 }));
        let ld = inkPath(inkEllipsePts(hd[0], hd[1], 24, 24, sd + 9, 10), { w: sw, seed: sd + 10, t, closed: true, amp: 0.8 }) + inkDot(hd[0] + 10, hd[1] - 3, 2.8, 3.4, sd + 11, t);
        let hp;
        if (o.hat === 'bork') hp = [[hd[0] - 20, hd[1] - 14], [hd[0] - 16, hd[1] - 70], [hd[0] + 6, hd[1] - 74], [hd[0] + 20, hd[1] - 14]];
        else if (o.hat === 'turban') hp = [[hd[0] - 26, hd[1] - 6], [hd[0] - 26, hd[1] - 30], [hd[0] - 4, hd[1] - 42], [hd[0] + 20, hd[1] - 36], [hd[0] + 28, hd[1] - 8]];
        else hp = [[hd[0] - 34, hd[1] - 10], [hd[0] - 22, hd[1] - 16], [hd[0] - 18, hd[1] - 36], [hd[0] + 4, hd[1] - 44], [hd[0] + 22, hd[1] - 30], [hd[0] + 26, hd[1] - 16], [hd[0] + 38, hd[1] - 10]];
        hatF.setAttribute('d', inkLoop(hp, { seed: sd + 12, t, amp: 0.8, smooth: o.hat !== 'helm' }));
        ld += inkPath(hp, { w: sw * 0.9, seed: sd + 13, t, closed: true, amp: 0.8, smooth: o.hat !== 'helm' });
        if (o.hat === 'bork') ld += inkPath([[hd[0] - 14, hd[1] - 66], [hd[0] - 40, hd[1] - 46], [hd[0] - 44, hd[1] - 12]], { w: sw * 1.6, seed: sd + 14, t, taper: 0.6 });
        lines.setAttribute('d', ld);
        if (fire > 0.02 && o.gun !== false && !o.pike) { fl.setAttribute('d', flash(gt[0] + 18, gt[1], 26 * fire, sd + 15, t, 1)); fl2.setAttribute('d', flash(gt[0] + 14, gt[1], 11 * fire, sd + 16, t, 1)); }
        else { fl.setAttribute('d', ''); fl2.setAttribute('d', ''); }
        return { muzzle: [a.x + face * s * gt[0], a.y + s * gt[1]], head: [a.x + face * s * hd[0], a.y + s * hd[1]] };
      },
    };
  }

  // ------------------------------------------------------------ field gun on a wheeled carriage (muzzle towards +x)
  function cannon(g0, o = {}) {
    const sd = o.seed || 1, g = el(g0, 'g');
    const trail = inkEl(g, INK.stain), barrelF = inkEl(g, INK.inkSoft), lines = inkEl(g, INK.ink), wheelF = inkEl(g, INK.paperLight), wheel = inkEl(g, INK.ink),
      fl = inkEl(g, INK.gold), fl2 = inkEl(g, INK.red);
    return {
      node: g,
      update(t, a) {
        const s = a.s ?? 1, face = a.face ?? 1, rc = a.recoil ?? 0, fire = a.fire ?? 0;
        const sw = 5.5 / Math.max(0.3, Math.min(1.4, s)) * Math.min(1, 0.55 + s * 0.6);
        g.setAttribute('transform', `translate(${f1(a.x - face * s * rc * 26)} ${f1(a.y)}) scale(${f1(face * s * 1000) / 1000} ${f1(s * 1000) / 1000}) rotate(${f1(-rc * 4)} 0 0)`);
        const tp = [[10, -58], [-170, -8], [-176, 6], [-150, 6], [24, -36]];
        trail.setAttribute('d', inkLoop(tp, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        let d = inkPath(tp, { w: sw, seed: sd + 2, t, closed: true, smooth: false });
        const bp = [[-96, -66], [-92, -96], [176, -96], [178, -74], [-94, -46]];
        barrelF.setAttribute('d', inkLoop(bp, { seed: sd + 3, t, amp: 0.8 }));
        d += inkPath(bp, { w: sw * 1.1, seed: sd + 4, t, closed: true });
        for (const x of [-60, 20, 120, 170]) d += inkPath([[x, -100], [x + 2, -66 + (x > 100 ? -6 : 0)]], { w: sw * 1.4, seed: sd + 5 + x, t });
        d += inkDot(-108, -70, 12, 12, sd + 6, t);
        lines.setAttribute('d', d);
        const wr = 50, cx = 0, cy = -50, spin = (a.spin ?? 0) + rc * 0.6;
        wheelF.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, wr, wr, sd + 7, 14), { seed: sd + 7, t, amp: 0.8 }));
        let wd = inkPath(inkEllipsePts(cx, cy, wr, wr, sd + 7, 14), { w: sw * 1.4, seed: sd + 8, t, closed: true });
        for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI + spin; wd += inkPath([[cx - Math.cos(an) * wr * 0.9, cy - Math.sin(an) * wr * 0.9], [cx + Math.cos(an) * wr * 0.9, cy + Math.sin(an) * wr * 0.9]], { w: sw * 0.8, seed: sd + 9 + k, t }); }
        wd += inkDot(cx, cy, 9, 9, sd + 16, t);
        wheel.setAttribute('d', wd);
        if (fire > 0.02) { fl.setAttribute('d', flash(214, -84, 70 * fire, sd + 17, t, 1)); fl2.setAttribute('d', flash(200, -84, 30 * fire, sd + 18, t, 1)); }
        else { fl.setAttribute('d', ''); fl2.setAttribute('d', ''); }
        return { muzzle: [a.x + face * s * 190, a.y - s * 84], axle: [a.x - face * s * rc * 26, a.y - s * 50] };
      },
    };
  }

  // ------------------------------------------------------------ reeds: [{x, y, h, n, lean}] clumps swaying in the wind
  function reeds(g0, list, sd) {
    const blades = inkEl(g0, INK.inkSoft), tops = inkEl(g0, INK.stain), topsL = inkEl(g0, INK.ink);
    return {
      update(t, wind = 1) {
        let d = '', td = '', tl = '';
        (list || []).forEach((c, i) => {
          const q = rng(inkHash(sd + i, 77)), n = c.n ?? 6;
          for (let k = 0; k < n; k++) {
            const bx = c.x + (q() - 0.5) * (c.w ?? 60), h = (c.h ?? 160) * (0.6 + q() * 0.5), lean = (c.lean ?? 0) + (q() - 0.5) * 0.5;
            const sway = Math.sin(t * 1.6 + bx * 0.02 + k) * 0.12 * wind;
            const top = [bx + Math.sin(lean + sway) * h, c.y - Math.cos(lean + sway) * h];
            const mid = [bx + Math.sin(lean + sway * 0.5) * h * 0.5, c.y - h * 0.5];
            d += inkPath([[bx, c.y], mid, top], { w: c.wd ?? 4, seed: sd + i * 31 + k, t, taper: 0.7 });
            if (k % 2 === 0) {
              const tt = [top[0] - Math.sin(lean + sway) * h * 0.16, top[1] + Math.cos(lean + sway) * h * 0.16];
              const pts = inkEllipsePts((top[0] + tt[0]) / 2, (top[1] + tt[1]) / 2, (c.wd ?? 4) * 2.2, h * 0.09, sd + i * 31 + k, 8, lean + sway);
              td += inkLoop(pts, { seed: sd + i * 31 + k, t, amp: 0.6 });
              tl += inkPath(pts, { w: 2.4, seed: sd + i * 31 + k + 5, t, closed: true, amp: 0.6 });
            }
          }
        });
        blades.setAttribute('d', d); tops.setAttribute('d', td); topsL.setAttribute('d', tl);
      },
    };
  }

  // ------------------------------------------------------------ banner on a pole: {side, seed}; update(t, {x, y (pole foot), h, w, op})
  function banner(g0, o = {}) {
    const sd = o.seed || 1, g = el(g0, 'g'), pole = inkEl(g, INK.ink), flag = inkEl(g, side(o.side)), fl = inkEl(g, INK.ink);
    return {
      update(t, a) {
        const h = a.h ?? 260, w = a.w ?? 120, x = a.x, y = a.y, dir = a.face ?? 1, sw = a.sw ?? 5;
        g.setAttribute('opacity', a.op ?? 1);
        pole.setAttribute('d', inkPath([[x, y], [x, y - h]], { w: sw, seed: sd, t }));
        const top = [], bot = [];
        for (let i = 0; i <= 6; i++) {
          const u = i / 6, wv = Math.sin(t * 6 + u * 5 + sd) * w * 0.07 * u;
          top.push([x + dir * u * w, y - h + wv]); bot.push([x + dir * u * w * (o.tail ? 0.85 : 1), y - h + w * 0.55 * (o.tail ? 1 - u * 0.6 : 1) + wv]);
        }
        const pts = top.concat(bot.reverse());
        flag.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 0.8 }));
        fl.setAttribute('d', inkPath(pts, { w: sw * 0.6, seed: sd + 2, t, closed: true }));
      },
    };
  }

  // tiny figures for far crowds: kind "cav" | "inf" | "camel"; returns {f (fill path d), l (ink path d)}
  function glyph(kind, x, y, s, sd, t, face = 1) {
    const w = Math.max(1.6, 4.2 * s), X = dx => x + face * dx;
    if (kind === 'cav' || kind === 'camel') {
      const cam = kind === 'camel';
      const body = inkEllipsePts(x, y - (cam ? 40 : 30) * s, 24 * s, 11 * s, sd, 8);
      let l = inkPath(body, { w, seed: sd, t, closed: true, amp: 0.6 })
        + inkPath([[X(18 * s), y - (cam ? 46 : 36) * s], [X((cam ? 30 : 34) * s), y - (cam ? 74 : 50) * s], cam ? [X(40 * s), y - 70 * s] : [X(36 * s), y - 50 * s]], { w: w * 1.3, seed: sd + 1, t, amp: 0.6 })
        + inkPath([[X(-16 * s), y - 24 * s], [X(-20 * s), y]], { w, seed: sd + 2, t, amp: 0.5 }) + inkPath([[X(14 * s), y - 24 * s], [X(18 * s), y]], { w, seed: sd + 3, t, amp: 0.5 });
      if (cam) l += inkPath([[X(-14 * s), y - 50 * s], [X(-2 * s), y - 66 * s], [X(10 * s), y - 50 * s]], { w: w * 1.2, seed: sd + 4, t, amp: 0.5 });
      else l += inkPath([[X(-2 * s), y - 40 * s], [X(0), y - 66 * s]], { w: w * 1.2, seed: sd + 4, t, amp: 0.5 }) + inkDot(X(1 * s), y - 74 * s, 7 * s, 7 * s, sd + 5, t, 0.4);
      const f = cam ? inkLoop([[X(-16 * s), y - 52 * s], [X(10 * s), y - 52 * s], [X(10 * s), y - 34 * s], [X(-18 * s), y - 34 * s]], { seed: sd, t, amp: 0.5, smooth: false })
        : inkLoop([[X(-18 * s), y - 42 * s], [X(8 * s), y - 42 * s], [X(14 * s), y - 28 * s], [X(-20 * s), y - 24 * s]], { seed: sd, t, amp: 0.6, smooth: false });
      return { f, l };
    }
    return { f: inkLoop([[x - 9 * s, y - 50 * s], [x + 9 * s, y - 50 * s], [x + 11 * s, y - 24 * s], [x - 11 * s, y - 24 * s]], { seed: sd, t, amp: 0.5, smooth: false }),
      l: inkPath([[x - 8 * s, y], [x, y - 24 * s], [x + 8 * s, y]], { w, seed: sd, t, amp: 0.5 }) + inkPath([[x, y - 24 * s], [x, y - 52 * s]], { w: w * 1.2, seed: sd + 1, t, amp: 0.5 })
        + inkDot(x, y - 62 * s, 9 * s, 9 * s, sd + 2, t, 0.4) + inkPath([[x - 6 * s, y - 68 * s], [x - 4 * s, y - 92 * s], [x + 6 * s, y - 68 * s]], { w: w * 0.9, seed: sd + 3, t, amp: 0.4 }) };
  }

  // ------------------------------------------------------------ rooms drawn behind a scene (use with "set": false):
  // room(g, kind, W, H, sd, o) kind: "hall" (stone palace hall: columns, arch, tapestries, carpet, o.throne),
  //   "tent" (striped war tent: centre pole, sloping roof, hanging lamp, o.table: map table), "monastery" (cloister arcade
  //   with a cross), "gate" (city wall + gate tower, over a "city" set). Ground y = o.gy (820). update(t)
  function room(g0, kind, W, H, sd, o = {}) {
    const GY = o.gy ?? 820, g = el(g0, 'g');
    const wallF = inkEl(g, kind === 'tent' ? mix(INK.paperLight, INK.gold, 0.3) : kind === 'gate' ? mix(INK.paperLight, INK.stain, 0.45) : mix(INK.paperLight, INK.stain, 0.32));
    const openF = inkEl(g, mix(INK.paperLight, INK.blue, 0.35)), darkF = inkEl(g, mix(INK.ink, INK.stain, 0.35));
    const floorF = inkEl(g, mix(INK.paperDark, INK.stain, 0.45)), carpet = inkEl(g, INK.red), gold = inkEl(g, INK.gold), soft = inkEl(g, INK.inkSoft);
    const colF = inkEl(g, mix(INK.paperLight, INK.stain, 0.12)), red = inkEl(g, INK.red), lines = inkEl(g, INK.ink), mapF = inkEl(g, INK.paperLight), mapB = inkEl(g, INK.blue);
    return {
      update(t) {
        const T = (pts, k, w = 5, cl = true, sm = false) => inkPath(pts, { w, seed: sd + k, t, closed: cl, smooth: sm, amp: 1 });
        const L = (pts, k) => inkLoop(pts, { seed: sd + k, t, amp: 0.8, smooth: false });
        let ln = '', sf = '', gd = '', rd = '', cf = '', of = '', df = '', cp = '';
        const wall = kind === 'gate' ? [[-60, 330], [W + 60, 330], [W + 60, GY], [-60, GY]] : [[-60, -60], [W + 60, -60], [W + 60, GY], [-60, GY]];
        if (kind !== 'gate') wallF.setAttribute('d', L(wall, 1));
        floorF.setAttribute('d', L([[-60, GY], [W + 60, GY], [W + 60, H + 60], [-60, H + 60]], 2));
        ln += T([[-60, GY], [W + 60, GY]], 3, 6, false);
        for (let k = 0; k < 9; k++) sf += T([[W / 2 + (k - 4) * 120, GY + 8], [W / 2 + (k - 4) * 420, H + 40]], 10 + k, 2.5, false);
        if (kind === 'hall' || kind === 'monastery') {
          for (let y = kind === 'hall' ? 260 : 120, r = 0; y < GY - 20; y += 70, r++) for (let x = (r % 2) * 90 - 90; x < W + 90; x += 180) sf += T([[x, y], [x + 150, y + 2]], 20 + r * 13 + x, 2, false);
          const cols = kind === 'hall' ? [330, 1640] : [180, 700, 1220, 1740], ctop = kind === 'hall' ? 230 : 120;   // hall: the kicker corner stays clear
          if (kind === 'monastery') {   // arcade openings between the columns, sky + hills seen through them
            for (let i = 0; i + 1 < cols.length; i++) {
              const a0 = cols[i] + 70, a1 = cols[i + 1] - 70, cx = (a0 + a1) / 2, r = (a1 - a0) / 2, top = 330;
              const arch = [[a0, GY - 10]]; for (let k = 0; k <= 10; k++) { const an = Math.PI - k / 10 * Math.PI; arch.push([cx + Math.cos(an) * r, top - Math.sin(an) * r * 0.9]); } arch.push([a1, GY - 10]);
              of += L(arch, 40 + i); ln += T(arch, 50 + i, 6, false, true);
              sf += T([[a0, GY - 160], [a0 + 60, GY - 200], [cx, GY - 170], [a1 - 50, GY - 210], [a1, GY - 170]], 60 + i, 3, false, true);
            }
            const cx = W / 2, cy = 130; gd += L([[cx - 12, cy - 70], [cx + 12, cy - 70], [cx + 12, cy - 20], [cx + 44, cy - 20], [cx + 44, cy + 4], [cx + 12, cy + 4], [cx + 12, cy + 70], [cx - 12, cy + 70], [cx - 12, cy + 4], [cx - 44, cy + 4], [cx - 44, cy - 20], [cx - 12, cy - 20]], 70);
          } else {
            const ax = W / 2, r = 420;   // a big arch between the columns (clear of the kicker), two tapestries
            const arch = []; for (let k = 0; k <= 16; k++) { const an = Math.PI - k / 16 * Math.PI; arch.push([ax + Math.cos(an) * r, 360 - Math.sin(an) * 170]); }
            ln += T(arch, 80, 8, false, true) + T(arch.map(p => [p[0], p[1] + 40]), 81, 4, false, true);
            for (const tx of [560, 1360]) {
              const sw = Math.sin(t * 1.1 + tx) * 4, tp = [[tx - 110, 230], [tx + 110, 230], [tx + 110 + sw, 640], [tx + sw, 690], [tx - 110 + sw, 640]];
              rd += L(tp, 90 + tx); ln += T(tp, 91 + tx, 5);
              ln += T([[tx - 130, 226], [tx + 130, 226]], 92 + tx, 8, false);
              gd += L([[tx - 14 + sw * 0.5, 330], [tx + 14 + sw * 0.5, 330], [tx + 14 + sw * 0.6, 390], [tx + 50 + sw * 0.6, 390], [tx + 50 + sw * 0.6, 418], [tx + 14 + sw * 0.7, 418], [tx + 14 + sw * 0.8, 520], [tx - 14 + sw * 0.8, 520], [tx - 14 + sw * 0.7, 418], [tx - 50 + sw * 0.6, 418], [tx - 50 + sw * 0.6, 390], [tx - 14 + sw * 0.6, 390]], 95 + tx);
            }
            cp += L([[W / 2 - 520, GY + 20], [W / 2 + 520, GY + 20], [W / 2 + 900, H + 40], [W / 2 - 900, H + 40]], 100);
            gd += T([[W / 2 - 480, GY + 50], [W / 2 + 480, GY + 50], [W / 2 + 840, H + 20]], 101, 5, false) + T([[W / 2 - 480, GY + 50], [W / 2 - 840, H + 20]], 102, 5, false);
            if (o.throne) {
              const tx = o.throne_x ?? W / 2, back = [[tx - 120, GY - 10], [tx - 130, GY - 470], [tx - 70, GY - 540], [tx, GY - 570], [tx + 70, GY - 540], [tx + 130, GY - 470], [tx + 120, GY - 10]];
              cf += L(back, 110); ln += T(back, 111, 7);
              rd += L([[tx - 100, GY - 440], [tx + 100, GY - 440], [tx + 96, GY - 220], [tx - 96, GY - 220]], 112);
              gd += L(inkEllipsePts(tx, GY - 520, 26, 26, sd + 113, 10).map(p => p), 113);
            }
          }
          cols.forEach((x, i) => {
            const cw = kind === 'hall' ? 80 : 46, shaft = [[x - cw, ctop], [x + cw, ctop], [x + cw, GY - 40], [x - cw, GY - 40]];
            cf += L(shaft, 120 + i); ln += T(shaft, 121 + i, 6);
            const cap = [[x - cw - 30, ctop - 40], [x + cw + 30, ctop - 40], [x + cw + 10, ctop + 4], [x - cw - 10, ctop + 4]], base = [[x - cw - 26, GY - 40], [x + cw + 26, GY - 40], [x + cw + 30, GY], [x - cw - 30, GY]];
            cf += L(cap, 122 + i) + L(base, 123 + i); ln += T(cap, 124 + i, 6) + T(base, 125 + i, 6);
            for (let k = 1; k < 4; k++) sf += T([[x + cw - k * cw * 0.45, ctop + 20], [x + cw - k * cw * 0.45, GY - 60]], 130 + i * 5 + k, 2.5, false);
          });
        }
        if (kind === 'tent') {
          for (let x = -60, k = 0; x < W + 60; x += 120, k++) { if (k % 2) rd += L([[x, 150], [x + 60, 150], [x + 60, GY], [x, GY]], 200 + k); }
          ln += T([[-60, 150], [W / 2, -40], [W + 60, 150]], 230, 7, false) + T([[-60, 150], [W + 60, 150]], 231, 5, false);
          for (let k = 0; k < 9; k++) sf += T([[W / 2, -30], [W / 2 + (k - 4) * 300, 150]], 232 + k, 3, false);
          cf += L([[W / 2 - 16, -40], [W / 2 + 16, -40], [W / 2 + 16, GY], [W / 2 - 16, GY]], 245); ln += T([[W / 2 - 16, -40], [W / 2 + 16, -40], [W / 2 + 16, GY], [W / 2 - 16, GY]], 246, 5);
          const sw = Math.sin(t * 1.4) * 14, lx = W / 2 + 140 + sw, ly = 330;
          ln += T([[W / 2 + 140, 150], [lx, ly - 40]], 247, 3, false) + T([[lx - 34, ly - 40], [lx + 34, ly - 40], [lx + 24, ly + 30], [lx - 24, ly + 30]], 248, 5);
          gd += L(inkEllipsePts(lx, ly - 6, 16, 22 + Math.sin(t * 9) * 3, sd + 249, 8), 249);
          cp += L([[W / 2 - 600, GY + 20], [W / 2 + 600, GY + 20], [W / 2 + 900, H + 40], [W / 2 - 900, H + 40]], 250);
          if (o.table) {   // map table in front
            const tx = o.table_x ?? W / 2, ty = o.table_y ?? 930, tw = 420;
            const top = [[tx - tw, ty - 50], [tx + tw, ty - 50], [tx + tw + 60, ty + 30], [tx - tw - 60, ty + 30]];
            cf += L(top, 260); ln += T(top, 261, 6);
            for (const lx2 of [tx - tw, tx + tw]) ln += T([[lx2, ty + 30], [lx2, ty + 200]], 262 + lx2, 8, false);
            const map = [[tx - 300, ty - 40], [tx + 280, ty - 44], [tx + 320, ty + 20], [tx - 330, ty + 22]];
            mapF.setAttribute('d', L(map, 265)); ln += T(map, 266, 4);
            mapB.setAttribute('d', inkPath([[tx - 260, ty - 30], [tx - 120, ty - 10], [tx - 20, ty - 26], [tx + 60, ty + 10], [tx + 240, ty - 6]], { w: 8, seed: sd + 267, t }) + inkPath([[tx - 60, ty + 16], [tx + 60, ty + 10]], { w: 6, seed: sd + 268, t }));
            rd += L(inkEllipsePts(tx + 60, ty - 4, 12, 9, sd + 269, 8), 269);
          }
        }
        if (kind === 'gate') {
          const top = 330, wallP = [[-60, top], [W + 60, top], [W + 60, GY], [-60, GY]];
          wallF.setAttribute('d', L(wallP, 300));
          for (let x = -60, k = 0; x < W + 60; x += 110, k++) { const mer = [[x, top], [x, top - 60], [x + 60, top - 60], [x + 60, top]]; wallF.setAttribute('d', wallF.getAttribute('d') + L(mer, 301 + k)); ln += T(mer, 330 + k, 4, false); }
          for (let y = top + 50, r = 0; y < GY; y += 60, r++) for (let x = (r % 2) * 80 - 80; x < W + 80; x += 160) sf += T([[x, y], [x + 140, y + 2]], 360 + r * 17 + x, 2, false);
          const gx = o.gate_x ?? W * 0.62, tw = 230, tt = 120;
          const tower = [[gx - tw, tt], [gx + tw, tt], [gx + tw, GY], [gx - tw, GY]];
          wallF.setAttribute('d', wallF.getAttribute('d') + L(tower, 400)); ln += T(tower, 401, 7);
          for (let k = 0; k < 4; k++) { const mx = gx - tw + k * (2 * tw / 3.5); const mer = [[mx, tt], [mx, tt - 54], [mx + 70, tt - 54], [mx + 70, tt]]; wallF.setAttribute('d', wallF.getAttribute('d') + L(mer, 410 + k)); ln += T(mer, 420 + k, 4, false); }
          const arch = [[gx - 120, GY]]; for (let k = 0; k <= 10; k++) { const an = Math.PI - k / 10 * Math.PI; arch.push([gx + Math.cos(an) * 120, GY - 260 - Math.sin(an) * 110]); } arch.push([gx + 120, GY]);
          df += L(arch, 430); ln += T(arch, 431, 7, false, true);
          for (let k = -2; k <= 2; k++) ln += T([[gx + k * 44, GY - 330 + Math.abs(k) * 20], [gx + k * 44, GY - 200]], 440 + k, 4, false);
          ln += T([[gx - 120, GY - 260], [gx + 120, GY - 260]], 446, 4, false);
          ln += T(top === 330 ? [[-60, top], [W + 60, top]] : [], 447, 5, false);
          ln += T([[gx, tt - 54], [gx, tt - 220]], 448, 6, false);
          const wv = Math.sin(t * 5) * 8;
          o._flag = [[gx, tt - 220], [gx + 150, tt - 205 + wv], [gx + 140, tt - 140 + wv], [gx, tt - 150]];
        }
        lines.setAttribute('d', ln); soft.setAttribute('d', sf); gold.setAttribute('d', gd); colF.setAttribute('d', cf); openF.setAttribute('d', of); darkF.setAttribute('d', df);
        carpet.setAttribute('d', cp);
        red.setAttribute('d', kind === 'gate' && o._flag ? inkLoop(o._flag, { seed: sd + 450, t, amp: 0.8 }) : rd);
        if (kind === 'gate') red.setAttribute('fill', INK.blue);
      },
    };
  }

  window.MHC = { f1, atOr, side, rider, soldier, cannon, puff, puffPts, reeds, banner, flash, glyph, room };
})();
