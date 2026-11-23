// spy_city: New York, the trial and the sea for Stickstory ag-03-nazi-spies-maine (Operation Elster, 1944-45) in
// parchment ink (brand/kit/BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure function of (seed, lt); palette tokens only).
// Parametric for any 1940s dossier / apartment / city-night / tribunal / torpedo / wreck-search moment. Needs mcB__lib.js.
//
// Common P: kasif: K, cast: [MCB cast entries], labels: [MCB labels], zoom: 1.05, focus: [0.5, 0.55]
//
// SHOTS.spy_dossier — full frame: an open manila file on a desk. Left page: a clipped portrait sketch (hatless man)
//   with a name strip; right page: typed lines that appear on cues; an optional red rubber stamp across the file.
//   P: {name: "W. COLEPAUGH", lines: [{text, at}], stamp: {text, at}, tab: "FBI"}   cues: hit, lines/stamp "at"s
// SHOTS.spy_room — a 1940s apartment interior (use "set": {"name": "interior", "ground": <px>}): a door on the right,
//   a table on the left. P: {mode: "radio"|"walkout"|"talk"|"arrest", ground: 0.84,
//   radio: true (a home-built transmitter on the table: glowing tubes, dials, wires, morse dots rising from the key),
//   door: {x: 0.84, open: cue, close: cue}, walker: {x, to, at, dur, scale, accessory} (walkout: a man in a long coat
//   carries two suitcases out of the door), bubbles: [{text, at, x, y}] (talk: speech bubbles)}
// SHOTS.spy_street — New York at night (use "set": {"name": "night", "ground": <px>}): tall buildings with lit windows,
//   sign boards. P: {mode: "club"|"stand"|"porch"|"skyline", ground: 0.86, signs: [{text, x, y, at, color}],
//   stand: {x: 0.5, papers: [{text, hl: true}]} (a newsstand with an awning and a paper rack),
//   porch: {x: 0.5, wreath: true, knock: cue, open: cue} (a Queens house front with a door that opens), money: cue}
// SHOTS.spy_court — a military commission room (use "set": "interior"): a flag on the wall, a long bench for the
//   officers, two defendants at a small table in front. P: {stamp: {text, at}, cast}   cues: hit, stamp.at
// SHOTS.spy_sea — P: {mode: "torpedo"|"sonar"|"wreck", water: 0.5, ship: {x: 0.6}, torpedo: {at, dur: 2.6} + cue hit
//   (splash column), sonar: {at} (survey boat, sonar fans sweep the bottom), depth: {text: "400 FT", at}}
//   torpedo/sonar: "set": {"name": "ocean", "horizon": <px>}; wreck: "set": {"name": "ocean", "horizon": 60}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const FR = 'Fraunces, Georgia, serif', ZS = "'Zilla Slab', Georgia, serif";
  const COL = n => ({ red: INK.red, blue: INK.blue, gold: INK.gold, green: INK.green, ink: INK.ink })[n] || INK.ink;

  function extras(root, P, W, H, sd) {
    const M = window.MCB;
    const list = (P.cast || []).slice();
    if (P.kasif) list.push(Object.assign({ who: 'kasif' }, P.kasif));
    const k = list.length ? M.cast(el(root, 'g'), list, W, H, sd + 501) : null;
    const lb = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 601);
    return { update(lt, t, cues) { if (k) k.update(lt, t, cues); lb.update(lt, t, cues); } };
  }
  function cam(g, lt, dur, W, H, P, hit) {
    const [fx, fy] = (P.focus || [0.5, 0.55]).map((v, i) => v * (i ? H : W));
    const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  function text(parent, s, size, o = {}) {
    const n = el(parent, 'text', Object.assign({ 'font-family': o.font || FR, 'font-size': size, 'font-weight': o.weight ?? 800, fill: o.fill || INK.ink, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': 'central' }, o.attrs || {}));
    n.textContent = s; return n;
  }
  function stamp(root, S, W, H, sd) {
    if (!S) return null;
    const g = el(root, 'g'), box = inkEl(g, INK.red), tx = text(g, String(S.text).toLocaleUpperCase(LOCALE), S.size || 120, { fill: INK.red, weight: 900 });
    let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = 400; }
    return {
      update(lt, t, cues) {
        const a = atOr(cues, S.at, 1); if (lt < a) { g.style.display = 'none'; return; }
        g.style.display = '';
        const s = lerp(2, 1, clamp01(spring(lt, a, 0.45))), x = (S.x ?? 0.5) * W, y = (S.y ?? 0.5) * H, sz = S.size || 120;
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${S.rot ?? -8}) scale(${s.toFixed(3)})`);
        box.setAttribute('d', inkPath(rect(-w / 2 - 40, -sz * 0.7, w / 2 + 40, sz * 0.7), { w: 12, seed: sd, t, closed: true, smooth: false }) + ' ' + inkPath(rect(-w / 2 - 24, -sz * 0.55, w / 2 + 24, sz * 0.55), { w: 5, seed: sd + 1, t, closed: true, smooth: false }));
      },
    };
  }
  // a man in a long coat (stick rig + coat panel) with optional suitcases, hat accessory optional
  function coatMan(parent, sd, o) {
    const coat = inkEl(parent, o.coat ? COL(o.coat) : INK.inkSoft), coatL = inkEl(parent), g = el(parent, 'g');
    const rig = KASIF.create(g, { scale: o.scale, hat: false, accessory: o.accessory || null, seed: sd });
    const caseF = inkEl(parent, INK.red), caseL = inkEl(parent);
    return {
      update(t, x, gy, pose, face, ph, extra = {}, cases = 0) {
        const s = o.scale, top = gy - 318 * s, hip = gy - 150 * s;
        const C = [[x - 34 * s, top], [x + 34 * s, top], [x + 52 * s, hip], [x - 52 * s, hip]];
        coat.setAttribute('d', inkLoop(C, { seed: sd + 1, t, amp: 1 }));
        coatL.setAttribute('d', inkPath(C, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        rig.update(t, pose, Object.assign({ x, y: gy, face, ph, since: 2 }, extra));
        let cd = '', cl = '';
        for (let k = 0; k < cases; k++) {
          const sw = pose === 'walk' ? Math.sin(ph * Math.PI * 2 + k) * 7 * s : 0, cx = x + (k ? -1 : 1) * 64 * s + sw, cy = gy - 150 * s;
          const B = rect(cx - 44 * s, cy, cx + 44 * s, cy + 64 * s);
          cd += inkLoop(B, { seed: sd + 4 + k, t, amp: 0.8, smooth: false }) + ' ';
          cl += inkPath(B, { w: 5, seed: sd + 6 + k, t, closed: true, smooth: false }) + ' ' + inkPath([[cx - 14 * s, cy], [cx - 12 * s, cy - 14 * s], [cx + 12 * s, cy - 14 * s], [cx + 14 * s, cy]], { w: 4, seed: sd + 8 + k, t }) + ' ';
        }
        caseF.setAttribute('d', cd); caseL.setAttribute('d', cl);
      },
    };
  }

  // ============================================================ spy_dossier
  SH.spy_dossier = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx, sd = seed + 13;
      const root = el(svg, 'g');
      const pcid = 'spyph' + seed, pcp = el(defs, 'clipPath', { id: pcid }); el(pcp, 'rect', { x: W * 0.17 + 6, y: H * 0.2 + 6, width: W * 0.25 - 12, height: H * 0.5 - 12 });
      const desk = inkEl(root, INK.paperDark), deskL = inkEl(root, INK.inkSoft);
      const folder = inkEl(root, INK.gold, { 'fill-opacity': 0.55 }), folderL = inkEl(root), pages = inkEl(root, INK.paperLight), pagesL = inkEl(root);
      const tab = inkEl(root, INK.gold, { 'fill-opacity': 0.7 }), tabT = text(root, P.tab || 'FBI', 50, { font: ZS, weight: 700 });
      const photo = inkEl(root, INK.paperDark), photoL = inkEl(root), clip = inkEl(root, INK.inkSoft);
      const pg = el(root, 'g', { 'clip-path': `url(#${pcid})` });
      const face = KASIF.create(el(pg, 'g'), { scale: 1.25, hat: false, seed: sd + 50 });
      const hair = inkEl(pg);
      const nameT = text(root, P.name || 'W. COLEPAUGH', 54, { font: ZS, weight: 700 });
      const lines = (P.lines || []).map(L => ({ L, tx: text(root, L.text, 62, { font: ZS, weight: 700, anchor: 'start' }), ul: inkEl(root, INK.red) }));
      const typeL = inkEl(root, INK.inkSoft);
      const st = stamp(root, P.stamp, W, H, sd + 90);
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.5], zoom: 1.06 }, P), hit);
          desk.setAttribute('d', inkLoop(rect(-60, -60, W + 60, H + 60), { seed: sd, t, smooth: false }));
          let dl = ''; for (let k = 0; k < 9; k++) { const y = 40 + k * 130; dl += inkPath([[-20, y], [W * 0.5, y + 10], [W + 20, y - 6]], { w: 3, seed: sd + 1 + k, t }) + ' '; }
          deskL.setAttribute('d', dl);
          const F = [[W * 0.08, H * 0.14], [W * 0.92, H * 0.13], [W * 0.94, H * 0.95], [W * 0.06, H * 0.97]];
          folder.setAttribute('d', inkLoop(F, { seed: sd + 20, t, smooth: false })); folderL.setAttribute('d', inkPath(F, { w: 6, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath([[W * 0.5, H * 0.09], [W * 0.5, H * 0.96]], { w: 4, seed: sd + 22, t }));
          const p1 = rect(W * 0.11, H * 0.17, W * 0.48, H * 0.92), p2 = rect(W * 0.52, H * 0.17, W * 0.89, H * 0.92);
          pages.setAttribute('d', inkLoop(p1, { seed: sd + 23, t, smooth: false }) + ' ' + inkLoop(p2, { seed: sd + 24, t, smooth: false }));
          pagesL.setAttribute('d', inkPath(p1, { w: 4, seed: sd + 25, t, closed: true, smooth: false }) + ' ' + inkPath(p2, { w: 4, seed: sd + 26, t, closed: true, smooth: false }));
          const TB = [[W * 0.7, H * 0.135], [W * 0.73, H * 0.075], [W * 0.86, H * 0.075], [W * 0.88, H * 0.13]];
          tab.setAttribute('d', inkLoop(TB, { seed: sd + 27, t, smooth: false }));
          tabT.setAttribute('x', f1(W * 0.795)); tabT.setAttribute('y', f1(H * 0.105));
          // portrait
          const ph = rect(W * 0.17, H * 0.2, W * 0.42, H * 0.7);
          photo.setAttribute('d', inkLoop(ph, { seed: sd + 30, t, smooth: false }));
          photoL.setAttribute('d', inkPath(ph, { w: 6, seed: sd + 31, t, closed: true, smooth: false }));
          clip.setAttribute('d', inkPath([[W * 0.28, H * 0.17], [W * 0.28, H * 0.25], [W * 0.31, H * 0.25], [W * 0.31, H * 0.17]], { w: 7, seed: sd + 32, t, smooth: false }));
          const fx = W * 0.295, fy = H * 0.98, hs = 1.25;
          face.update(t, 'idle', { x: fx, y: fy, face: 1, since: 2, emotion: P.emotion || null });
          const hy = fy - 476 * hs, hx = fx + 12 * hs;
          hair.setAttribute('d', inkLoop([[hx - 78 * hs, hy + 40 * hs], [hx - 60 * hs, hy - 8 * hs], [hx, hy - 20 * hs], [hx + 62 * hs, hy - 6 * hs], [hx + 80 * hs, hy + 36 * hs], [hx + 30 * hs, hy + 10 * hs], [hx - 30 * hs, hy + 14 * hs]], { seed: sd + 33, t }));
          nameT.setAttribute('x', f1(W * 0.295)); nameT.setAttribute('y', f1(H * 0.8));
          // typed lines
          let tl = '';
          lines.forEach(({ L, tx, ul }, i) => {
            const a = atOr(cues, L.at, 0.4 + i * 0.8), p = clamp01((lt - a) / 0.5), y = H * (0.26 + i * 0.15), x = W * 0.56;
            tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y)); tx.setAttribute('opacity', p.toFixed(2));
            tx.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${lerp(1.25, 1, spring(lt, a, 0.4)).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
            ul.setAttribute('d', lt > a + 0.3 && L.mark ? inkPath([[x, y + 40], [x + W * 0.3 * prog(lt, a + 0.3, 0.4), y + 44]], { w: 7, seed: sd + 40 + i, t }) : '');
            tl += inkDot(x - 34, y, 10, 10, sd + 60 + i, t) + ' ';
          });
          typeL.setAttribute('d', tl);
          if (st) st.update(lt, t, cues);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_room
  SH.spy_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 31;
      const mode = P.mode || 'radio', GY = (P.ground ?? 0.84) * H;
      const root = el(svg, 'g');
      const D = Object.assign({ x: 0.84 }, P.door || {});
      const doorF = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.9 }), doorL = inkEl(root), doorLeaf = inkEl(root, INK.red), doorLeafL = inkEl(root);
      const tableF = inkEl(root, INK.stain), tableL = inkEl(root);
      const radio = P.radio !== false && (mode === 'radio' || P.radio) ? { f: inkEl(root, INK.paperDark), l: inkEl(root), tubes: inkEl(root, INK.gold), dials: inkEl(root), wire: inkEl(root, INK.red), morse: inkEl(root, INK.ink), sp: inkEl(root, INK.gold) } : null;
      const lamp = inkEl(root, INK.gold, { 'fill-opacity': 0.8 }), lampL = inkEl(root);
      const Wk = P.walker ? Object.assign({ x: 0.3, to: 0.86, scale: 0.6 }, P.walker) : null;
      const walker = Wk ? coatMan(el(root, 'g'), sd + 200, { scale: Wk.scale, accessory: Wk.accessory }) : null;
      const bubbles = (P.bubbles || []).map(B => ({ B, f: inkEl(root, INK.paperLight), l: inkEl(root), tx: text(root, B.text, B.size || 64, { font: ZS, weight: 700 }) }));
      const ex = extras(root, P, W, H, sd);
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.6] }, P), hit);
          // door
          const dx = D.x * W, dw = 230, dh = 560;
          const frame = rect(dx - dw / 2, GY - dh, dx + dw / 2, GY);
          doorF.setAttribute('d', inkLoop(frame, { seed: sd + 1, t, smooth: false }));
          doorL.setAttribute('d', inkPath(frame, { w: 8, seed: sd + 2, t, closed: true, smooth: false }));
          const oa = atOr(cues, D.open, null), ca = atOr(cues, D.close, null);
          let open = oa != null ? spring(lt, oa, 0.8) : 0; if (ca != null && lt > ca) open *= 1 - prog(lt, ca, 0.6);
          const lw = dw * (1 - 0.75 * clamp01(open));
          const leaf = [[dx - dw / 2, GY - dh], [dx - dw / 2 + lw, GY - dh + 20 * open], [dx - dw / 2 + lw, GY - 10 * open], [dx - dw / 2, GY]];
          doorLeaf.setAttribute('d', inkLoop(leaf, { seed: sd + 3, t, smooth: false }));
          doorLeafL.setAttribute('d', inkPath(leaf, { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkDot(dx - dw / 2 + lw - 30, GY - dh * 0.48, 10, 10, sd + 5, t));
          // table
          const tx0 = W * 0.1, tx1 = W * 0.46, ty = GY - 260;
          tableF.setAttribute('d', inkLoop(rect(tx0, ty, tx1, ty + 26), { seed: sd + 6, t, smooth: false }));
          tableL.setAttribute('d', inkPath(rect(tx0, ty, tx1, ty + 26), { w: 6, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath([[tx0 + 30, ty + 26], [tx0 + 20, GY]], { w: 8, seed: sd + 8, t }) + ' ' + inkPath([[tx1 - 30, ty + 26], [tx1 - 20, GY]], { w: 8, seed: sd + 9, t }));
          // lamp on the table
          const lx = tx1 - 70, sw = Math.sin(t * 0.8) * 3;
          lamp.setAttribute('d', inkLoop([[lx - 55, ty - 150 + sw], [lx + 55, ty - 150 - sw], [lx + 30, ty - 220], [lx - 30, ty - 220]], { seed: sd + 10, t, smooth: false }));
          lampL.setAttribute('d', inkPath([[lx, ty - 150], [lx, ty]], { w: 6, seed: sd + 11, t }) + ' ' + inkPath([[lx - 40, ty], [lx + 40, ty]], { w: 7, seed: sd + 12, t }));
          if (radio) {
            const rx = tx0 + 60, ry = ty - 170, rw = 300, rh = 170;
            radio.f.setAttribute('d', inkLoop(rect(rx, ry, rx + rw, ry + rh), { seed: sd + 20, t, smooth: false }));
            radio.l.setAttribute('d', inkPath(rect(rx, ry, rx + rw, ry + rh), { w: 6, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath(rect(rx + 210, ry + 40, rx + 280, ry + 150), { w: 4, seed: sd + 22, t, closed: true, smooth: false }));
            let tu = ''; for (let k = 0; k < 3; k++) { const gx = rx + 50 + k * 55; tu += inkLoop([[gx - 16, ry], [gx - 16, ry - 60], [gx, ry - 78], [gx + 16, ry - 60], [gx + 16, ry]], { seed: sd + 23 + k, t }) + ' '; }
            radio.tubes.setAttribute('d', tu); radio.tubes.setAttribute('fill-opacity', (0.6 + 0.4 * Math.sin(t * 6)).toFixed(2));
            const nd = Math.sin(t * 1.7) * 0.9;
            radio.dials.setAttribute('d', [0, 1].map(k => inkCircle(rx + 70 + k * 100, ry + 105, 34, sd + 30 + k, t, { w: 5 }) + ' ' + inkPath([[rx + 70 + k * 100, ry + 105], [rx + 70 + k * 100 + Math.cos(nd + k * 2) * 28, ry + 105 - Math.sin(nd + k * 2) * 28]], { w: 4, seed: sd + 32 + k, t })).join(' '));
            radio.wire.setAttribute('d', inkPath([[rx + rw, ry + 30], [rx + rw + 80, ry - 60 + Math.sin(t) * 6], [rx + rw + 40, ry - 180]], { w: 4, seed: sd + 34, t }));
            let md = ''; for (let k = 0; k < 8; k++) { const u = ((t * 0.35 + k / 8) % 1), x = rx + 140 + Math.sin(k * 2.3 + u * 3) * 40, y = ry - 90 - u * 140; if (k % 3 === 0) md += inkPath([[x - 18, y], [x + 18, y]], { w: 9, seed: sd + 40 + k, t }) + ' '; else md += inkDot(x, y, 9, 9, sd + 40 + k, t) + ' '; }
            radio.morse.setAttribute('d', md);
            const spk = Math.sin(t * 13) > 0.6 ? inkPath([[rx + rw + 40, ry - 180], [rx + rw + 60, ry - 200]], { w: 4, seed: sd + 50, t }) + ' ' + inkPath([[rx + rw + 40, ry - 180], [rx + rw + 20, ry - 205]], { w: 4, seed: sd + 51, t }) : '';
            radio.sp.setAttribute('d', spk);
          }
          if (walker) {
            const a = atOr(cues, Wk.at, 0.3), d = Wk.dur ?? 3, u = progIO(lt, a, d), moving = lt > a && u < 1;
            const x = lerp(Wk.x, Wk.to, u) * W, face = Wk.to >= Wk.x ? 1 : -1;
            const gone = ca != null && lt > ca;
            if (!gone) walker.update(t, x, GY, moving ? 'walk' : 'idle', face, Math.abs(x - Wk.x * W) / (gait * Wk.scale), {}, 2);
            else walker.update(t, -9999, GY, 'idle', 1, 0, {}, 0);
          }
          bubbles.forEach(({ B, f, l, tx }, i) => {
            const a = atOr(cues, B.at, 0.4 + i * 0.8), p = spring(lt, a, 0.5);
            if (lt < a) { f.setAttribute('d', ''); l.setAttribute('d', ''); tx.setAttribute('opacity', 0); return; }
            const x = B.x * W, y = B.y * H; let w = 300; try { w = tx.getComputedTextLength() + 80; } catch (e) {}
            const s = Math.max(0.01, p), hw = w / 2 * s, hh = 60 * s;
            const Bb = [[x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x + (B.tail ?? -0.3) * hw + 30, y + hh], [x + (B.tail ?? -0.3) * hw, y + hh + 50 * s], [x + (B.tail ?? -0.3) * hw - 10, y + hh], [x - hw, y + hh]];
            f.setAttribute('d', inkLoop(Bb, { seed: sd + 60 + i, t, smooth: false }));
            l.setAttribute('d', inkPath(Bb, { w: 6, seed: sd + 70 + i, t, closed: true, smooth: false }));
            tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y)); tx.setAttribute('opacity', clamp01(p * 2).toFixed(2));
          });
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_street
  SH.spy_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 47;
      const mode = P.mode || 'club', GY = (P.ground ?? 0.86) * H;
      const root = el(svg, 'g');
      const r0 = rng(sd + 1), blds = [];
      for (let x = -40; x < W + 40;) { const w = 150 + r0() * 170; blds.push([x, w, 0.35 + r0() * 0.45, r0()]); x += w + 6; }
      const bF = inkEl(root, INK.inkSoft, { 'fill-opacity': mode === 'porch' ? 0.35 : 0.8 }), bL = inkEl(root), wins = inkEl(root, INK.gold);
      const signs = (P.signs || []).map(S => ({ S, f: inkEl(root, INK.ink, { 'fill-opacity': 0.92 }), l: inkEl(root, COL(S.color || 'red')), bulbs: inkEl(root, INK.gold), tx: text(root, S.text, S.size || 66, { font: ZS, weight: 700, fill: S.color === 'gold' ? INK.gold : INK.paperLight }) }));
      const walk = inkEl(root, INK.paperDark), walkL = inkEl(root);
      const ST = (mode === 'stand' || P.stand) ? Object.assign({ x: 0.5, papers: [] }, P.stand || {}) : null;
      const stand = ST ? { f: inkEl(root, INK.stain), l: inkEl(root), aw: inkEl(root, INK.red), awL: inkEl(root), rack: inkEl(root, INK.paperLight), rackL: inkEl(root), hl: inkEl(root, INK.gold, { 'fill-opacity': 0.6 }),
        tx: ST.papers.map(pp => text(root, pp.text, pp.size || 46, { font: ZS, weight: 700 })), name: text(root, ST.name || 'NEWS', 62, { font: ZS, weight: 700, fill: INK.paperLight }) } : null;
      const PO = mode === 'porch' ? Object.assign({ x: 0.55 }, P.porch || {}) : null;
      const porch = PO ? { f: inkEl(root, INK.paperDark), l: inkEl(root), door: inkEl(root, INK.red), doorL: inkEl(root), light: inkEl(root, INK.gold, { 'fill-opacity': 0.5 }), wreath: inkEl(root, INK.green), bow: inkEl(root, INK.red), knock: inkEl(root, INK.ink), win: inkEl(root, INK.gold) } : null;
      const money = inkEl(root, INK.green, { 'fill-opacity': 0.8 }), moneyL = inkEl(root);
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.6] }, P), hit);
          // buildings
          let bf = '', bl = '', wd = '';
          blds.forEach(([x, w, hk, rr], i) => {
            const top = GY - H * hk * (mode === 'porch' ? 0.6 : 1) - 40, B = rect(x, top, x + w, GY - 120);
            bf += inkLoop(B, { seed: sd + 10 + i, t, smooth: false, amp: 0.8 }) + ' ';
            bl += inkPath([[x, GY - 120], [x, top], [x + w, top], [x + w, GY - 120]], { w: 4, seed: sd + 40 + i, t, smooth: false }) + ' ';
            if (mode !== 'porch') for (let yy = top + 30; yy < GY - 170; yy += 62) for (let xx = x + 22; xx < x + w - 30; xx += 46) {
              const h = inkHash(i * 97 + Math.round(yy), Math.round(xx)) % 100; if (h < 42 || (xx < 450 && yy < 260)) continue;
              const blink = h > 96 && Math.sin(t * 2 + h) > 0.5; if (blink) continue;
              wd += inkLoop(rect(xx, yy, xx + 22, yy + 30), { seed: sd + h, t, smooth: false, amp: 0.5 }) + ' ';
            }
          });
          bF.setAttribute('d', bf); bL.setAttribute('d', bl); wins.setAttribute('d', wd);
          // signs
          signs.forEach(({ S, f, l, bulbs, tx }, i) => {
            const a = atOr(cues, S.at, 0.2 + i * 0.6), p = spring(lt, a, 0.5); if (lt < a) { f.setAttribute('d', ''); l.setAttribute('d', ''); bulbs.setAttribute('d', ''); tx.setAttribute('opacity', 0); return; }
            const x = S.x * W, y = S.y * H; let w = 300; try { w = tx.getComputedTextLength() + 70; } catch (e) {}
            const s = Math.max(0.01, p), B = rect(x - w / 2 * s, y - 52 * s, x + w / 2 * s, y + 52 * s);
            f.setAttribute('d', inkLoop(B, { seed: sd + 80 + i, t, smooth: false })); l.setAttribute('d', inkPath(B, { w: 8, seed: sd + 90 + i, t, closed: true, smooth: false }));
            let bd = ''; const n = Math.max(6, Math.round(w / 50)); for (let k = 0; k < n; k++) { if (((k + Math.floor(t * 4)) % 3) === 0) continue; bd += inkDot(x - w / 2 * s + (k + 0.5) * w * s / n, y - 66 * s, 7, 7, sd + 100 + k, t) + ' ' + inkDot(x - w / 2 * s + (k + 0.5) * w * s / n, y + 66 * s, 7, 7, sd + 130 + k, t) + ' '; }
            bulbs.setAttribute('d', bd);
            tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y)); tx.setAttribute('opacity', clamp01(p * 2).toFixed(2));
          });
          // sidewalk
          walk.setAttribute('d', inkLoop([[-40, GY - 120], [W + 40, GY - 120], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 2, t, smooth: false }));
          let wl = inkPath([[-40, GY - 120], [W + 40, GY - 120]], { w: 6, seed: sd + 3, t });
          for (let k = 0; k < 10; k++) wl += ' ' + inkPath([[k * W / 9 - 40, GY - 120], [k * W / 9 - 120, H + 40]], { w: 3, seed: sd + 4 + k, t });
          walkL.setAttribute('d', wl);
          if (stand) {
            const cx = ST.x * W, w = ST.w ? ST.w * W : 640, top = GY - 560;
            const body = rect(cx - w / 2, top + 120, cx + w / 2, GY - 20);
            stand.f.setAttribute('d', inkLoop(body, { seed: sd + 150, t, smooth: false }));
            stand.l.setAttribute('d', inkPath(body, { w: 7, seed: sd + 151, t, closed: true, smooth: false }));
            const aw = [[cx - w / 2 - 50, top + 140], [cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 + 50, top + 140]];
            stand.aw.setAttribute('d', inkLoop(aw, { seed: sd + 152, t, smooth: false }));
            let al = inkPath(aw, { w: 7, seed: sd + 153, t, smooth: false, closed: true }); for (let k = 1; k < 8; k++) { const u = k / 8; al += ' ' + inkPath([[lerp(cx - w / 2, cx + w / 2, u), top], [lerp(cx - w / 2 - 50, cx + w / 2 + 50, u), top + 140]], { w: 3, seed: sd + 154 + k, t }); }
            stand.awL.setAttribute('d', al);
            stand.name.setAttribute('x', f1(cx)); stand.name.setAttribute('y', f1(top + 60));
            const n = ST.papers.length || 1, pw = (w - 60) / n;
            let rd = '', rl = '', hd = '';
            ST.papers.forEach((pp, k) => {
              const x = cx - w / 2 + 30 + k * pw, B = rect(x + 10, top + 170, x + pw - 10, top + 330), sw = Math.sin(t * 1.5 + k) * 2;
              const Bs = B.map(([a, b]) => [a + sw, b]);
              rd += inkLoop(Bs, { seed: sd + 170 + k, t, smooth: false }) + ' '; rl += inkPath(Bs, { w: 4, seed: sd + 180 + k, t, closed: true, smooth: false }) + ' ';
              for (let j = 0; j < 3; j++) rl += inkPath([[x + 30, top + 270 + j * 18], [x + pw - 30, top + 270 + j * 18]], { w: 3, seed: sd + 190 + k * 3 + j, t }) + ' ';
              if (pp.hl) { const ha = atOr(cues, pp.at, 0), hp = prog(lt, ha, 0.4); if (lt >= ha) hd += inkPath(B.map(([a, b]) => [a + sw, b]), { w: 12 * hp + 1, seed: sd + 200 + k, t, closed: true, smooth: false }); }
              stand.tx[k].setAttribute('x', f1(x + pw / 2 + sw)); stand.tx[k].setAttribute('y', f1(top + 220));
            });
            stand.rack.setAttribute('d', rd); stand.rackL.setAttribute('d', rl); stand.hl.setAttribute('d', hd); stand.hl.setAttribute('fill', 'none');
            stand.hl.setAttribute('d', hd); stand.hl.setAttribute('fill', INK.red); stand.hl.setAttribute('fill-opacity', 1);
          }
          if (porch) {
            const cx = PO.x * W, w = 760, top = GY - 720, B = [[cx - w / 2, GY - 110], [cx - w / 2, top + 160], [cx, top], [cx + w / 2, top + 160], [cx + w / 2, GY - 110]];
            porch.f.setAttribute('d', inkLoop(B, { seed: sd + 300, t, smooth: false }));
            let pl = inkPath(B, { w: 7, seed: sd + 301, t, smooth: false, closed: true });
            for (let y = top + 200; y < GY - 120; y += 34) pl += ' ' + inkPath([[cx - w / 2, y], [cx + w / 2, y]], { w: 2.5, seed: sd + 302 + y, t });
            porch.l.setAttribute('d', pl);
            const oa = atOr(cues, PO.open, null), op = oa != null ? spring(lt, oa, 0.8) : 0;
            const dw = 200, dh = 400, dx = cx - dw / 2, dy = GY - 110 - dh, lw = dw * (1 - 0.8 * clamp01(op));
            porch.light.setAttribute('d', op > 0.05 ? inkLoop(rect(dx, dy, dx + dw, dy + dh), { seed: sd + 305, t, smooth: false }) : '');
            const leaf = rect(dx, dy, dx + lw, dy + dh);
            porch.door.setAttribute('d', inkLoop(leaf, { seed: sd + 306, t, smooth: false }));
            porch.doorL.setAttribute('d', inkPath(rect(dx, dy, dx + dw, dy + dh), { w: 7, seed: sd + 307, t, closed: true, smooth: false }) + ' ' + inkPath(leaf, { w: 5, seed: sd + 308, t, closed: true, smooth: false }));
            porch.win.setAttribute('d', inkLoop(rect(cx + 160, top + 260, cx + 300, top + 400), { seed: sd + 309, t, smooth: false }) + ' ' + inkLoop(rect(cx - 300, top + 260, cx - 160, top + 400), { seed: sd + 310, t, smooth: false }));
            porch.win.setAttribute('fill-opacity', (0.65 + 0.2 * Math.sin(t * 3)).toFixed(2));
            if (PO.wreath !== false && op < 0.4) {
              const wx = dx + lw / 2, wy = dy + 110; let wr = ''; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; wr += inkDot(wx + Math.cos(a) * 52, wy + Math.sin(a) * 52, 20, 16, sd + 320 + k, t) + ' '; }
              porch.wreath.setAttribute('d', wr); porch.bow.setAttribute('d', inkLoop([[wx - 30, wy + 40], [wx, wy + 56], [wx + 30, wy + 40], [wx + 24, wy + 74], [wx, wy + 60], [wx - 24, wy + 74]], { seed: sd + 340, t }));
            } else { porch.wreath.setAttribute('d', ''); porch.bow.setAttribute('d', ''); }
            const ka = atOr(cues, PO.knock, null); let kd = '';
            if (ka != null) for (let k = 0; k < 3; k++) { const s = ka + k * 0.35, u = (lt - s) / 0.5; if (u < 0 || u > 1) continue; const r = 30 + u * 60; kd += inkPath([[dx - 20, dy + dh * 0.5 - r], [dx - 20 - r * 0.5, dy + dh * 0.5], [dx - 20, dy + dh * 0.5 + r]], { w: 6 * (1 - u) + 1, seed: sd + 350 + k, t }) + ' '; }
            porch.knock.setAttribute('d', kd);
          }
          // money flying (club)
          const ma = atOr(cues, P.money, null); let md = '', ml = '';
          if (ma != null) for (let k = 0; k < 10; k++) { const s = ma + k * 0.4, u = (lt - s) / 2.2; if (u < 0 || u > 1) continue; const x = (P.money_x ?? 0.4) * W + (k % 2 ? 1 : -1) * u * 300 + Math.sin(k) * 40, y = GY - 420 - u * 320 + Math.sin(u * 8 + k) * 24; const B = rect(x - 50, y - 22, x + 50, y + 22).map(([a, b]) => [x + (a - x) * Math.cos(u * 5 + k) - (b - y) * Math.sin(u * 5 + k) * 0.5, y + (a - x) * Math.sin(u * 5 + k) * 0.5 + (b - y)]); md += inkLoop(B, { seed: sd + 400 + k, t, smooth: false }) + ' '; ml += inkPath(B, { w: 4, seed: sd + 420 + k, t, closed: true, smooth: false }) + ' '; }
          money.setAttribute('d', md); moneyL.setAttribute('d', ml);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_court
  SH.spy_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 61;
      const GY = (P.ground ?? 0.84) * H;
      const root = el(svg, 'g');
      const flag = { red: inkEl(root, INK.red), white: inkEl(root, INK.paperLight), blue: inkEl(root, INK.blue), stars: inkEl(root, INK.paperLight), l: inkEl(root), pole: inkEl(root) };
      const cast = window.MCB.cast(el(root, 'g'), (P.bench || [{ who: 'officer1', x: 0.38 }, { who: 'officer2', x: 0.5 }, { who: 'officer3', x: 0.62 }]).map(o => Object.assign({ y: 0.62, scale: 0.5, pose: 'idle', face: 'right' }, o)), W, H, sd + 10);
      const bench = inkEl(root, INK.stain), benchL = inkEl(root);
      const defs = window.MCB.cast(el(root, 'g'), (P.defendants || [{ who: 'colepaugh', x: 0.3 }, { who: 'gimpel', x: 0.42 }]).map(o => Object.assign({ y: 0.8, scale: 0.55, pose: 'sit', face: 'right' }, o)), W, H, sd + 30);
      const table = inkEl(root, INK.paperDark), tableL = inkEl(root);
      const st = stamp(root, P.stamp, W, H, sd + 80);
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.5] }, P), hit);
          // flag on a pole, gently waving
          const fx = W * 0.72, fy = H * 0.12, fw = 360, fh = 220;
          const wave = (x, y) => [x, y + Math.sin(t * 1.6 + x * 0.02) * 8 * (x - fx) / fw];
          let rd = '', wd = '';
          for (let k = 0; k < 7; k++) { const y0 = fy + k * fh / 7, y1 = y0 + fh / 7; const B = [wave(fx, y0), wave(fx + fw, y0), wave(fx + fw, y1), wave(fx, y1)]; (k % 2 ? (wd += inkLoop(B, { seed: sd + 200 + k, t, smooth: false, amp: 0.5 }) + ' ') : (rd += inkLoop(B, { seed: sd + 200 + k, t, smooth: false, amp: 0.5 }) + ' ')); }
          flag.red.setAttribute('d', rd); flag.white.setAttribute('d', wd);
          const BB = [wave(fx, fy), wave(fx + fw * 0.42, fy), wave(fx + fw * 0.42, fy + fh * 4 / 7), wave(fx, fy + fh * 4 / 7)];
          flag.blue.setAttribute('d', inkLoop(BB, { seed: sd + 210, t, smooth: false }));
          let sd2 = ''; for (let k = 0; k < 9; k++) { const p = wave(fx + 20 + (k % 3) * 46, fy + 22 + Math.floor(k / 3) * 38); sd2 += inkDot(p[0], p[1], 7, 7, sd + 220 + k, t) + ' '; }
          flag.stars.setAttribute('d', sd2);
          flag.l.setAttribute('d', inkPath([wave(fx, fy), wave(fx + fw, fy), wave(fx + fw, fy + fh), wave(fx, fy + fh)], { w: 5, seed: sd + 230, t, closed: true }));
          flag.pole.setAttribute('d', inkPath([[fx - 8, fy - 30], [fx - 8, GY - 120]], { w: 9, seed: sd + 231, t }));
          cast.update(lt, t, cues);
          const B1 = rect(W * 0.28, H * 0.5, W * 0.72, H * 0.66);
          bench.setAttribute('d', inkLoop(B1, { seed: sd + 240, t, smooth: false }));
          let bl = inkPath(B1, { w: 7, seed: sd + 241, t, closed: true, smooth: false }); for (let k = 1; k < 6; k++) bl += ' ' + inkPath([[W * (0.28 + k * 0.073), H * 0.52], [W * (0.28 + k * 0.073), H * 0.64]], { w: 3, seed: sd + 242 + k, t });
          benchL.setAttribute('d', bl);
          defs.update(lt, t, cues);
          const T = rect(W * 0.2, H * 0.71, W * 0.52, H * 0.75);
          table.setAttribute('d', inkLoop(T, { seed: sd + 250, t, smooth: false }));
          tableL.setAttribute('d', inkPath(T, { w: 6, seed: sd + 251, t, closed: true, smooth: false }) + ' ' + inkPath([[W * 0.22, H * 0.75], [W * 0.22, H * 0.86]], { w: 7, seed: sd + 252, t }) + ' ' + inkPath([[W * 0.5, H * 0.75], [W * 0.5, H * 0.86]], { w: 7, seed: sd + 253, t }));
          if (st) st.update(lt, t, cues);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_sea
  SH.spy_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 71;
      const mode = P.mode || 'torpedo', WY = (P.water ?? 0.5) * H;
      const root = el(svg, 'g');
      const ship = mode === 'wreck' ? null : { g: el(root, 'g') };
      if (ship) { ship.hull = inkEl(ship.g, INK.ink, { 'fill-opacity': 0.85 }); ship.hl = inkEl(ship.g); ship.sup = inkEl(ship.g, INK.paperLight); ship.supL = inkEl(ship.g); ship.fun = inkEl(ship.g, INK.red); ship.smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.5 }); }
      const front = inkEl(root, INK.blue, { 'fill-opacity': 0.3 }), wl = inkEl(root, INK.paperLight);
      const wake = inkEl(root, INK.paperLight), torp = inkEl(root, INK.ink), splash = inkEl(root, INK.paperLight), splashL = inkEl(root);
      const fans = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), fanL = inkEl(root, INK.gold), towL = inkEl(root);
      const bed = inkEl(root, INK.paperDark), bedL = inkEl(root, INK.inkSoft), wreck = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.9 }), wreckL = inkEl(root), rays = inkEl(root, INK.paperLight, { 'fill-opacity': 0.35 }), fish = inkEl(root);
      const depthA = inkEl(root, INK.red), depthT = text(root, (P.depth && P.depth.text) || '400 FT', 96, { fill: INK.red, weight: 900 });
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ha = atOr(cues, 'hit', null), hit = punch(lt, ha, 0.8);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.5] }, P), hit);
          const top = x => WY + Math.sin(x * 0.01 + t * 1.3) * 6 + Math.sin(x * 0.03 - t * 2) * 3;
          if (ship) {
            const S = P.ship || {}, small = mode === 'sonar';
            const sx = (S.x ?? 0.6) * W + (small ? 0 : lt * 10), sc = (S.s ?? (small ? 0.5 : 1)) * W / 1920;
            const list = ha != null && lt > ha ? progIO(lt, ha, 3) * 7 : 0;
            ship.g.setAttribute('transform', `translate(${f1(sx)} ${f1(WY + 6 + Math.sin(t * 1.2) * 5 + list * 4)}) rotate(${(Math.sin(t * 0.9) * 1.2 + list).toFixed(2)}) scale(${sc.toFixed(4)})`);
            const hull = small ? [[-260, -40], [240, -40], [300, -70], [250, 20], [-240, 20]] : [[-560, -90], [520, -90], [600, -140], [540, 40], [-520, 40], [-580, -40]];
            ship.hull.setAttribute('d', inkLoop(hull, { seed: sd + 1, t, smooth: false }));
            ship.hl.setAttribute('d', inkPath(hull, { w: 8, seed: sd + 2, t, closed: true, smooth: false }) + (small ? '' : ' ' + inkPath([[-480, -90], [-480, -300]], { w: 7, seed: sd + 3, t }) + ' ' + inkPath([[420, -90], [420, -300]], { w: 7, seed: sd + 4, t }) + ' ' + inkPath([[-480, -290], [-40, -170], [420, -290]], { w: 3, seed: sd + 5, t })));
            const sup = small ? rect(-120, -150, 60, -40) : rect(-140, -230, 120, -90);
            ship.sup.setAttribute('d', inkLoop(sup, { seed: sd + 6, t, smooth: false }));
            let sl = inkPath(sup, { w: 6, seed: sd + 7, t, closed: true, smooth: false }); if (!small) for (let k = 0; k < 5; k++) sl += ' ' + inkDot(-110 + k * 52, -190, 9, 9, sd + 8 + k, t);
            ship.supL.setAttribute('d', sl);
            const fun = small ? rect(-40, -210, 0, -150) : rect(160, -330, 240, -90);
            ship.fun.setAttribute('d', inkLoop(fun, { seed: sd + 14, t, smooth: false }));
            if (!small) { let sm = ''; for (let k = 0; k < 6; k++) { const u = ((t * 0.3 + k / 6) % 1); sm += inkDot(sx + (200 - u * 500) * sc, WY - (360 + u * 260) * sc, (30 + u * 50) * sc, (24 + u * 40) * sc, sd + 20 + k, t) + ' '; } ship.smoke.setAttribute('d', sm); }
            // torpedo wake
            if (mode === 'torpedo') {
              const T = P.torpedo || {}, ta = atOr(cues, T.at, 0.2), td = T.dur ?? 2.6, end = ha ?? ta + td, u = clamp01((lt - ta) / Math.max(0.3, end - ta));
              const x0 = -40, y0 = H * 0.92, x1 = sx - 80 * sc, y1 = WY + 30, xe = lerp(x0, x1, u), ye = lerp(y0, y1, u);
              wake.setAttribute('d', lt > ta && (ha == null || lt < ha + 1.5) ? inkPath([[x0, y0], [lerp(x0, xe, 0.5), lerp(y0, ye, 0.5) + 6], [xe, ye]], { w: 16, seed: sd + 30, t }) : '');
              torp.setAttribute('d', lt > ta && u < 1 ? inkLoop([[xe - 40, ye - 9], [xe + 30, ye - 6], [xe + 44, ye], [xe + 30, ye + 6], [xe - 40, ye + 9]], { seed: sd + 31, t }) : '');
              if (ha != null && lt > ha) {
                const p = clamp01((lt - ha) / 2.2), hgt = Math.sin(p * Math.PI) * 330, bx = x1;
                const B = [[bx - 90, WY + 10], [bx - 70, WY - hgt * 0.55], [bx - 50, WY - hgt * 0.9], [bx - 15, WY - hgt * 0.7], [bx + 10, WY - hgt], [bx + 40, WY - hgt * 0.75], [bx + 65, WY - hgt * 0.9], [bx + 80, WY - hgt * 0.45], [bx + 100, WY + 10]];
                splash.setAttribute('d', hgt > 10 ? inkLoop(B, { seed: sd + 32, t }) : ''); splashL.setAttribute('d', hgt > 10 ? inkPath(B, { w: 6, seed: sd + 33, t }) : '');
              } else { splash.setAttribute('d', ''); splashL.setAttribute('d', ''); }
            }
            if (mode === 'sonar') {
              const sa = atOr(cues, P.sonar && P.sonar.at, 0.3), u = prog(lt, sa, 1);
              const fx = sx - 60, fy = H * 0.62 + Math.sin(t) * 6;
              towL.setAttribute('d', inkPath([[sx - 240 * sc, WY], [fx, fy]], { w: 3, seed: sd + 40, t }) + ' ' + inkLoop([[fx - 40, fy - 10], [fx + 40, fy - 10], [fx + 50, fy], [fx + 40, fy + 10], [fx - 40, fy + 10]], { seed: sd + 41, t }));
              let fd = '', fl = '';
              [-1, 1].forEach((s2, k) => { const B = [[fx, fy], [fx + s2 * 820 * u, H * 0.96], [fx + s2 * 380 * u, H * 0.98]]; fd += inkLoop(B, { seed: sd + 42 + k, t, smooth: false }) + ' '; });
              for (let k = 0; k < 5; k++) { const ph = ((lt * 0.8 + k / 5) % 1) * u, r = 80 + ph * 500; fl += inkPath([[fx - r * 0.9, fy + r * 0.55], [fx, fy + r * 0.75], [fx + r * 0.9, fy + r * 0.55]], { w: 4 * (1 - ph) + 1, seed: sd + 44 + k, t }) + ' '; }
              fans.setAttribute('d', fd); fanL.setAttribute('d', fl);
              const bp = []; for (let x = -40; x <= W + 40; x += 60) bp.push([x, H * 0.95 + Math.sin(x * 0.006) * 14]);
              bed.setAttribute('d', inkLoop(bp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 50, t, smooth: false }));
              bedL.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 51, t }));
            }
          }
          if (mode === 'wreck') {
            const bp = []; for (let x = -40; x <= W + 40; x += 60) bp.push([x, H * 0.8 + Math.sin(x * 0.005 + 1) * 18]);
            bed.setAttribute('d', inkLoop(bp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 60, t, smooth: false }));
            let bl = inkPath(bp, { w: 6, seed: sd + 61, t }); for (let k = 0; k < 12; k++) { const x = (k * 171) % W, y = H * 0.86 + (k % 3) * 40; bl += ' ' + inkPath([[x, y], [x + 60, y + 4]], { w: 3, seed: sd + 62 + k, t }); }
            bedL.setAttribute('d', bl);
            // a steamer hull lying on the bottom, slightly tilted, broken masts
            const cx = (P.x ?? 0.55) * W, cy = H * 0.78, sc = W / 1920;
            const hull = [[-560, -40], [-500, -150], [480, -170], [600, -120], [560, 20], [-520, 30]].map(([x, y]) => [cx + x * sc, cy + y * sc]);
            wreck.setAttribute('d', inkLoop(hull, { seed: sd + 70, t, smooth: false }));
            let wl2 = inkPath(hull, { w: 7, seed: sd + 71, t, closed: true, smooth: false });
            for (let k = 0; k < 8; k++) wl2 += ' ' + inkPath([[cx + (-420 + k * 110) * sc, cy - 140 * sc], [cx + (-430 + k * 110) * sc, cy + 10 * sc]], { w: 3, seed: sd + 72 + k, t });
            wl2 += ' ' + inkPath([[cx - 300 * sc, cy - 150 * sc], [cx - 380 * sc, cy - 420 * sc]], { w: 7, seed: sd + 81, t }) + ' ' + inkPath([[cx + 120 * sc, cy - 168 * sc], [cx + 150 * sc, cy - 260 * sc], [cx + 260 * sc, cy - 300 * sc]], { w: 7, seed: sd + 82, t });
            for (let k = 0; k < 6; k++) wl2 += ' ' + inkCircle(cx + (-200 + k * 80) * sc, cy - 90 * sc, 14 * sc, sd + 83 + k, t, { w: 3 });
            wreckL.setAttribute('d', wl2);
            // diver torches sweeping
            let rd = ''; [[0.18, 0.3, 0], [0.86, 0.26, 2]].forEach(([x, y, ph], k) => { const a = Math.sin(t * 0.6 + ph) * 0.25 + (k ? 2.4 : 0.75), L = 900, sx = x * W, sy = y * H;
              rd += inkLoop([[sx, sy], [sx + Math.cos(a - 0.12) * L, sy + Math.sin(a - 0.12) * L], [sx + Math.cos(a + 0.12) * L, sy + Math.sin(a + 0.12) * L]], { seed: sd + 90 + k, t, smooth: false }) + ' '; });
            rays.setAttribute('d', rd);
            let fd = ''; for (let k = 0; k < 5; k++) { const x = ((k * 400 + t * (40 + k * 10)) % (W + 200)) - 100, y = H * (0.3 + k * 0.08) + Math.sin(t + k) * 20; fd += inkPath([[x - 30, y], [x, y - 10], [x + 26, y], [x, y + 10], [x - 30, y]], { w: 3, seed: sd + 95 + k, t }) + ' ' + inkPath([[x - 30, y], [x - 46, y - 12], [x - 46, y + 12], [x - 30, y]], { w: 3, seed: sd + 100 + k, t }) + ' '; }
            fish.setAttribute('d', fd);
          }
          if (mode !== 'wreck') {
            const wp = []; for (let x = -40; x <= W + 40; x += 40) wp.push([x, top(x)]);
            front.setAttribute('d', inkLoop(wp.concat([[W + 40, WY + 90], [-40, WY + 90]]), { seed: sd + 110, t, smooth: false }));
            wl.setAttribute('d', inkPath(wp, { w: 4, seed: sd + 111, t }));
          }
          // depth arrow
          if (P.depth) {
            const da = atOr(cues, P.depth.at, 0.6), dp = prog(lt, da, 0.9), x = (P.depth.x ?? 0.9) * W, y0 = (P.depth.y0 ?? 0.05) * H, y1 = lerp(y0, (P.depth.y1 ?? 0.72) * H, dp);
            depthA.setAttribute('d', lt > da ? inkPath([[x, y0], [x, y1]], { w: 8, seed: sd + 120, t }) + ' ' + inkPath([[x - 30, y1 - 40], [x, y1], [x + 30, y1 - 40]], { w: 8, seed: sd + 121, t, smooth: false }) : '');
            const s = spring(lt, da + 0.4, 0.6); depthT.setAttribute('transform', `translate(${f1(P.depth.tx != null ? P.depth.tx * W : x - 70)} ${f1((y0 + (P.depth.y1 ?? 0.72) * H) / 2)}) scale(${Math.max(0.01, s).toFixed(3)})`); depthT.setAttribute('text-anchor', 'end');
          } else depthT.setAttribute('opacity', 0);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ spy_lineup
  // SHOTS.spy_lineup — a police line-up wall (height lines, a number plate per man) with N hatless men in two rows;
  //   on cue "landed" they pop in one by one, on cue "caught" each gets a red cross. P: {n: 8, title, caught: cue,
  //   landed: cue, labels}  (use "set": {"name": "interior", "ground": <px>})
  SH.spy_lineup = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed + 83;
      const root = el(svg, 'g');
      const wall = inkEl(root, INK.paperLight), wallL = inkEl(root, INK.inkSoft);
      const n = P.n || 8, rows = 2, per = Math.ceil(n / rows);
      const men = Array.from({ length: n }, (_, i) => { const g = el(root, 'g'); return { g, rig: KASIF.create(g, { scale: 0.42, hat: false, seed: sd + i * 7 }), plate: inkEl(root, INK.ink), tx: text(root, String(i + 1), 44, { fill: INK.paperLight, font: ZS, weight: 700 }) }; });
      const crosses = inkEl(root, INK.red);
      const title = text(root, P.title || '1942', 84, { weight: 900 });
      const ex = extras(root, P, W, H, sd);
      const X0 = W * 0.12, X1 = W * 0.88, Y0 = H * 0.16, Y1 = H * 0.86;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam(root, lt, dur, W, H, Object.assign({ focus: [0.5, 0.55], zoom: 1.04 }, P), hit);
          wall.setAttribute('d', inkLoop(rect(X0, Y0, X1, Y1), { seed: sd, t, smooth: false }));
          let wl = inkPath(rect(X0, Y0, X1, Y1), { w: 6, seed: sd + 1, t, closed: true, smooth: false });
          for (let k = 1; k < 9; k++) { const y = Y0 + 60 + k * (Y1 - Y0 - 80) / 9; wl += ' ' + inkPath([[X0, y], [X0 + (k % 2 ? 60 : 110), y]], { w: 4, seed: sd + 2 + k, t }) + ' ' + inkPath([[X1, y], [X1 - (k % 2 ? 60 : 110), y]], { w: 4, seed: sd + 20 + k, t }); }
          wallL.setAttribute('d', wl);
          title.setAttribute('x', f1(W * 0.5)); title.setAttribute('y', f1(Y0 + 70));
          const la = atOr(cues, P.landed, 0.2), ca = atOr(cues, P.caught, null);
          let cd = '';
          men.forEach((m, i) => {
            const r = Math.floor(i / per), c = i % per, x = lerp(X0 + 170, X1 - 170, per > 1 ? c / (per - 1) : 0.5) + (r ? 70 : 0), gy = r ? Y1 - 20 : Y0 + 400;
            const a = la + i * 0.18, s = spring(lt, a, 0.5);
            if (lt < a) { m.g.style.display = 'none'; m.plate.setAttribute('d', ''); m.tx.setAttribute('opacity', 0); return; }
            m.g.style.display = '';
            m.rig.update(t, 'idle', { x, y: gy + (1 - s) * 40, face: (i % 2) ? -1 : 1, since: 2 });
            const py = gy - 120;
            m.plate.setAttribute('d', inkLoop(rect(x - 34, py - 26, x + 34, py + 26), { seed: sd + 40 + i, t, smooth: false }));
            m.tx.setAttribute('x', f1(x)); m.tx.setAttribute('y', f1(py)); m.tx.setAttribute('opacity', 1);
            if (ca != null && lt > ca + i * 0.2) { const p = prog(lt, ca + i * 0.2, 0.25), hy = gy - 200, R = 70 * p;
              cd += inkPath([[x - R, hy - R], [x + R, hy + R]], { w: 12, seed: sd + 60 + i, t }) + ' ' + inkPath([[x + R, hy - R], [x - R, hy + R]], { w: 12, seed: sd + 70 + i, t }) + ' '; }
          });
          crosses.setAttribute('d', cd);
          ex.update(lt, t, cues);
        },
      };
    },
  };
})();
