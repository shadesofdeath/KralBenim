// wc_cards — painted text cards on the watercolour paper: a chapter card, one big painted number, a timeline, a
// document written in by hand (letter, decree, stone, telegram, diary) and a title card. Serif titles (WC.serif),
// hand notes (WC.hand); all text comes from the writer in the script's language (caps via LOCALE). Vertical Shorts
// keep everything in y 200–1150 (subtitles below), long videos above y ≈ 880.
//   wc_chapter  {num: "Bölüm 2"|"Chapter 2" (small spaced caps), title, sub, g: WC.G object painted small as a
//               vignette, o: its options, s: its scale, color: token of the brush dash (default "red")}
//   wc_number   {value: "1453"|"438"|"%40"|"2.900", unit, label (hand-written under it), note (smaller hand note),
//               count: true|false (count up from 0; default: yes unless it looks like a year), color: token of the
//               painted swatch behind it (default "gold"), ink: token of the digits (default "ink"), g, o, s, at}
//   wc_timeline {items: [{year, label, at}], highlight: index (accent colour), title}  vertical in a Short,
//               horizontal in a long video; marks paint in one by one, the line grows to each
//   wc_letter   {lines: [...], sign, date, head, style: "letter"|"decree" (ferman-like, with a painted tuğra-like
//               flourish, not a real tuğra)|"stone" (carved inscription)|"telegram"|"diary", at}  an aged sheet,
//               written in line by line
//   wc_title    {text, sub, g, o, s, color: token of the wash bloom behind (default "skyWarm")}
// times (at): seconds | cue name | {cue, d}
'use strict';

(() => {
  const C = WC.C;
  const { clamp, seg, ss, eio, eo, mix, vnoise, hash } = WC;
  const mkCanvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };
  const tok = (v, fb) => (v && C[v]) ? C[v] : (v && v[0] === '#' ? v : fb);
  const UP = s => String(s ?? '').toLocaleUpperCase(LOCALE);
  const linIn = p => 1 - Math.cbrt(1 - clamp(p));            // WC.hand reveals with eo(p): this makes it linear

  function paperBase(X, W, H) { const pp = WC.paper(); if (pp) X.drawImage(pp, 0, 0); else { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); } }
  function wrap(c, text, font, maxW, spacing = 0) {
    c.save(); c.font = font; c.letterSpacing = spacing + 'px';
    const out = [];
    for (const para of String(text ?? '').split('\n')) {
      let line = '';
      for (const w of para.split(/\s+/).filter(Boolean)) {
        const t = line ? line + ' ' + w : w;
        if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      }
      out.push(line);
    }
    c.restore();
    return out;
  }
  // wrap into lines of about equal length (no lonely last word)
  function wrapBal(c, text, font, maxW) {
    const first = wrap(c, text, font, maxW);
    if (first.length < 2) return first;
    const total = measure(c, String(text), font);
    let w = Math.max(total / first.length * 1.08, maxW * .45), out = first;
    for (let k = 0; k < 6; k++) { const t = wrap(c, text, font, w); if (t.length === first.length) { out = t; break; } w *= 1.06; }
    return out;
  }
  const measure = (c, txt, font, spacing = 0) => { c.save(); c.font = font; c.letterSpacing = spacing + 'px'; const w = c.measureText(txt).width; c.restore(); return w; };
  // a soft irregular wash that blooms open (scale s) — built once, drawn scaled
  function bloom(colour, x, y, rx, ry, a, n = 3) {
    const S = [];
    for (let i = 0; i < n; i++) S.push(WC.washShape(WC.blobPts(x + WC.rnd(-rx, rx) * .12, y + WC.rnd(-ry, ry) * .12, rx * WC.rnd(.75, 1.05), ry * WC.rnd(.75, 1.05), 48, .22), colour, a, 3, 6));
    return S;
  }
  function drawBloom(c, S, x, y, s, a = 1) {
    if (s <= 0) return;
    c.save(); c.translate(x, y); c.scale(s, s); c.translate(-x, -y); c.globalAlpha = a;
    for (const w of S) WC.washFill(c, w); c.restore();
  }
  // a painter's colour swatch: overlapping horizontal brush strokes with flying white
  function swatch(colour, x0, x1, y0, y1, a = .4) {
    const S = [], n = Math.max(3, Math.round((y1 - y0) / 34)), h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const y = y0 + h * (i + .5) + WC.rnd(-4, 4);
      S.push(WC.mk(WC.qcurve(x0 + WC.rnd(-20, 20), y, x1 + WC.rnd(-30, 30), y + WC.rnd(-6, 6), WC.rnd(-8, 8), 16), h * 1.5, WC.mixc(colour, i % 2 ? C.paperLight : colour, .12), { prof: 'brush', nb: 9, a: a * WC.rnd(.8, 1.1), rough: .3 }));
    }
    return S;
  }
  function brushDash(colour, x, y, len, w) {
    return WC.mk(WC.qcurve(x - len / 2, y + WC.rnd(-2, 2), x + len / 2, y + WC.rnd(-3, 3), WC.rnd(-4, 4), 12), w, colour, { prof: 'brush', nb: 6, a: .88 });
  }
  function vignette(P, sc, seed) {
    if (!P.g || !WC.G[P.g]) { if (P.g) console.warn('wc_cards: unknown object "' + P.g + '"'); return null; }
    return WC.make(P.g, Math.round((P.s ?? 1) * sc * 100) / 100, P.o || {}, seed);
  }
  // scale a scene's timings to its length (cards are short)
  const pace = (dur, need) => clamp(dur / need, .45, 1);

  // ---------------------------------------------------------------- wc_chapter
  SHOTS.wc_chapter = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx), cx = W / 2;
      const g = vignette(P, portrait ? .8 : .62, seed * 7 + 3);
      const tSize = portrait ? 118 : 112, maxW = portrait ? 920 : 1500;
      const tFont = WC.font(tSize, 600), lines = wrapBal(X, P.title, tFont, maxW);
      const lh = tSize * 1.02, subSize = portrait ? 54 : 46;
      const subLines = P.sub ? wrap(X, P.sub, WC.font(subSize, 600, 'serif', true), maxW) : [];
      // vertical stack: [vignette] num, title lines, dash, sub
      const gH = g ? (g.spr.y1 - g.spr.y0) * 1 + 40 : 0;
      const total = gH + 70 + lines.length * lh + 60 + subLines.length * subSize * 1.25;
      const midY = portrait ? 640 : 450;
      let y = midY - total / 2;
      const gy = y + gH - 30; y += gH;
      const numY = y + 40, tY0 = numY + 40 + tSize * .82, dashY = tY0 + (lines.length - 1) * lh + tSize * .42, subY0 = dashY + 30 + subSize;
      const S = WC.withSeed(seed * 31 + 1, () => ({
        bl: bloom(WC.mixc(tok(P.wash, C.sky), C.paper, .25), cx, midY, portrait ? 470 : 760, portrait ? 360 : 300, .16),
        dash: brushDash(tok(P.color, C.red), cx, dashY, portrait ? 180 : 200, portrait ? 11 : 10),
      }));
      const num = typeof P.num === 'number' ? String(P.num) : UP(P.num);
      return {
        update(lt, dur) {
          X.clear(); paperBase(X, W, H);
          const k = pace(dur, 4), T = t => t * k;
          drawBloom(X, S.bl, cx, midY, .55 + .45 * eo(seg(lt, 0, T(1.8))) + .05 * seg(lt, 0, dur), .9);
          if (g) WC.drawObj(X, g, cx, gy, seg(lt, T(.1), T(1.5)));
          if (num) WC.serif(X, num, cx, numY, seg(lt, T(.3), T(1.0)), { size: portrait ? 40 : 34, spacing: portrait ? 10 : 9, col: C.inkSoft, w: 600 });
          lines.forEach((ln, i) => WC.serif(X, ln, cx, tY0 + i * lh, seg(lt, T(.55 + i * .35), T(1.5 + i * .35)), { size: tSize, w: 600 }));
          WC.drawS(X, S.dash, eio(seg(lt, T(1.3 + lines.length * .2), T(1.9 + lines.length * .2))));
          subLines.forEach((ln, i) => WC.serif(X, ln, cx, subY0 + i * subSize * 1.25, seg(lt, T(1.8 + i * .3), T(2.8 + i * .3)), { size: subSize, italic: true, col: C.inkSoft, w: 600 }));
        },
      };
    },
  };

  // ---------------------------------------------------------------- wc_title
  SHOTS.wc_title = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx), cx = W / 2;
      const g = vignette(P, portrait ? .85 : .7, seed * 11 + 5);
      let tSize = portrait ? 132 : 150;
      const maxW = portrait ? 930 : 1560;
      let lines = wrapBal(X, P.text, WC.font(tSize, 600), maxW);
      while (lines.length > 3 && tSize > 80) { tSize -= 8; lines = wrapBal(X, P.text, WC.font(tSize, 600), maxW); }
      const lh = tSize * 1.02, subSize = portrait ? 56 : 50, subLines = P.sub ? wrap(X, P.sub, WC.font(subSize, 600, 'serif', true), maxW) : [];
      const gH = g ? (g.spr.y1 - g.spr.y0) + 30 : 0;
      const total = gH + lines.length * lh + 70 + subLines.length * subSize * 1.25;
      const midY = portrait ? 650 : 470;
      let y = midY - total / 2;
      const gy = y + gH - 20; y += gH;
      const tY0 = y + tSize * .85, dashY = tY0 + (lines.length - 1) * lh + tSize * .45, subY0 = dashY + 34 + subSize;
      const S = WC.withSeed(seed * 37 + 2, () => ({
        bl: bloom(WC.mixc(tok(P.color, C.skyWarm), C.paper, .15), cx, midY, portrait ? 500 : 820, portrait ? 420 : 360, .2, 4),
        bl2: bloom(WC.mixc(tok(P.color, C.skyWarm), C.sky, .5), cx + (portrait ? 80 : 160), midY + 40, portrait ? 300 : 500, portrait ? 240 : 220, .12, 2),
        dash: brushDash(C.red, cx, dashY, portrait ? 200 : 240, portrait ? 12 : 11),
      }));
      return {
        update(lt, dur) {
          X.clear(); paperBase(X, W, H);
          const k = pace(dur, 4), T = t => t * k;
          drawBloom(X, S.bl, cx, midY, .5 + .5 * eo(seg(lt, 0, T(1.6))) + .04 * seg(lt, 0, dur), 1);
          drawBloom(X, S.bl2, cx + (portrait ? 80 : 160), midY + 40, .4 + .6 * eo(seg(lt, T(.4), T(2.2))) + .05 * seg(lt, 0, dur), 1);
          if (g) WC.drawObj(X, g, cx, gy, seg(lt, T(.2), T(1.6)));
          lines.forEach((ln, i) => WC.serif(X, ln, cx, tY0 + i * lh, seg(lt, T(.4 + i * .4), T(1.5 + i * .4)), { size: tSize, w: 600 }));
          WC.drawS(X, S.dash, eio(seg(lt, T(1.2 + lines.length * .3), T(1.8 + lines.length * .3))));
          subLines.forEach((ln, i) => WC.serif(X, ln, cx, subY0 + i * subSize * 1.25, seg(lt, T(1.7 + lines.length * .3 + i * .3), T(2.7 + lines.length * .3 + i * .3)), { size: subSize, italic: true, col: C.inkSoft, w: 600 }));
        },
      };
    },
  };

  // ---------------------------------------------------------------- wc_number
  // the digits are filled with a baked pigment texture (granulation, darker strokes) and get a pooled edge
  SHOTS.wc_number = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const raw = String(P.value ?? '');
      const lang = LOCALE.startsWith('tr') ? 'tr' : 'en', dec = lang === 'tr' ? ',' : '.', grp = lang === 'tr' ? '.' : ',';
      const mm = raw.match(/^(\D*?)(\d[\d.,]*)(\D*)$/);
      let target = null, decimals = 0, grouped = false;
      if (mm) {
        const body = mm[2], hasDec = body.includes(dec) && body.lastIndexOf(dec) > body.length - 4 && !(body.split(dec).length > 2);
        grouped = body.includes(grp) || (!hasDec && body.includes(dec) && body.split(dec).slice(1).every(p => p.length === 3));
        const intPart = hasDec ? body.slice(0, body.lastIndexOf(dec)) : body, frac = hasDec ? body.slice(body.lastIndexOf(dec) + 1) : '';
        target = parseFloat(intPart.replace(/[.,]/g, '') + (frac ? '.' + frac : '')); decimals = frac.length;
      }
      const yearLike = /^\d{3,4}$/.test(raw) && +raw >= 300 && +raw <= 2100;
      const count = target != null && (P.count ?? !yearLike);
      const fmt = v => mm[1] + v.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped }) + mm[3];
      const g = vignette(P, portrait ? .7 : .62, seed * 13 + 7);
      // size: as big as fits (digits + unit)
      const maxW = portrait ? 900 : (g ? 1050 : 1400);
      let size = portrait ? 440 : 400;
      const unitOf = sz => P.unit ? measure(X, P.unit, WC.font(Math.round(sz * .28), 600, 'serif', true)) + 26 : 0;
      while (size > 120 && measure(X, raw, WC.font(size, 600)) + unitOf(size) > maxW) size -= 10;
      const nW = measure(X, raw, WC.font(size, 600)), unitSize = Math.round(size * .28), unitW = unitOf(size);
      X.save(); X.font = WC.font(size, 600); const tm = X.measureText(raw); X.restore();
      const asc = tm.actualBoundingBoxAscent || size * .62, desc = tm.actualBoundingBoxDescent || size * .1;
      const labSize = portrait ? 64 : 56, noteSize = portrait ? 44 : 40;
      const labLines = P.label ? wrap(X, P.label, `700 ${labSize}px ${WC.HANDF}`, portrait ? 900 : 1100) : [];
      // a vertical stack centred in the picture: [vignette] number, label, note (long video: the vignette on the right)
      const gH = g && portrait ? (g.spr.y1 - g.spr.y0) + 40 : 0;
      const blockH = gH + asc + desc + (labLines.length ? 40 + labLines.length * labSize * 1.15 : 0) + (P.note ? noteSize * 1.6 : 0);
      const cx = portrait ? W / 2 : (g ? 780 : W / 2), top = (portrait ? 650 : 470) - blockH / 2;
      const gy = top + gH - 40, base = top + gH + asc;
      const xR = cx + (nW + unitW) / 2 - unitW;        // right edge of the digits (unit after it)
      const labY = base + desc + 40 + labSize * .55;
      // the digits' own small canvas: [GX, GY] + GW x GH on the stage (counting strings are right-aligned at xR)
      const GX = Math.floor(xR - nW - 80), GY = Math.floor(base - asc - 40), GW = Math.ceil(nW + 120), GH = Math.ceil(asc + desc + 80);
      const S = WC.withSeed(seed * 41 + 3, () => {
        const sw = swatch(WC.mixc(tok(P.color, C.gold), C.paper, .15), xR - nW - 50, xR + unitW + 30, base - asc * .72, base + desc * .7 + size * .04, .32);
        // pigment: the digit colour with granulation and darker/lighter strokes, baked once (cropped to the digits)
        const pig = mkCanvas(GW, GH), c = pig.getContext('2d'), ic = tok(P.ink, C.ink);
        c.translate(-GX, -GY);
        c.fillStyle = WC.mixc(ic, C.paper, .12); c.fillRect(GX, GY, GW, GH);
        for (let i = 0; i < 60; i++) {
          const x = WC.rnd(xR - nW - 60, xR + 40), y = WC.rnd(base - size, base + 20);
          WC.drawS(c, WC.mk(WC.polar(x, y, WC.rnd(-1.3, -0.6), WC.rnd(60, 200), WC.rnd(-20, 20), 8), WC.rnd(14, 40), WC.pick([WC.mixc(ic, C.paperLight, .35), WC.mixc(ic, C.ink, .4), WC.mixc(ic, C.waterDeep, .3)]), { prof: 'leaf', nb: 5, a: WC.rnd(.2, .4) }));
        }
        return { sw, pig, edge: WC.mixc(ic, C.ink, .5) };
      });
      const glyph = mkCanvas(GW, GH), gc = glyph.getContext('2d');
      function drawNumber(txt, p) {
        gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'source-over'; gc.clearRect(0, 0, GW, GH);
        gc.font = WC.font(size, 600); gc.textBaseline = 'alphabetic'; gc.textAlign = 'right'; gc.fillStyle = '#000';
        gc.fillText(txt, xR - GX, base - GY);
        gc.globalCompositeOperation = 'source-in'; gc.drawImage(S.pig, 0, 0);
        gc.globalCompositeOperation = 'source-over';
        gc.lineWidth = 2.4; gc.strokeStyle = WC.rgba(S.edge, .35); gc.lineJoin = 'round'; gc.strokeText(txt, xR - GX, base - GY);
        X.save();
        if (p < 1) { const w = measure(X, txt, WC.font(size, 600)) + 60; X.beginPath(); X.rect(xR - w, base - size * 1.2, w * eio(p) + 10, size * 1.6); X.clip(); }
        X.shadowColor = WC.rgba(C.paperLight, .8); X.shadowBlur = 10;
        X.drawImage(glyph, GX, GY); X.restore();
      }
      return {
        update(lt, dur, cues) {
          X.clear(); paperBase(X, W, H);
          const t0 = WC.timeOf(P.at, cues || {}, .2), k = pace(dur, 4.5), T = t => t0 + (t - .2) * k;
          WC.drawList(X, S.sw, eio(seg(lt, T(.2), T(1.1))));
          if (g) WC.drawObj(X, g, portrait ? W / 2 : 1480, portrait ? gy : 690, seg(lt, T(.3), T(1.8)));
          if (count) {
            const q = seg(lt, T(.6), T(2.4)), v = q >= 1 ? null : target * eo(q);
            drawNumber(v == null ? raw : fmt(Math.round(v * 10 ** decimals) / 10 ** decimals), seg(lt, T(.5), T(.9)));
          } else drawNumber(raw, seg(lt, T(.6), T(2.0)));
          if (P.unit) WC.serif(X, P.unit, xR + 24, base, seg(lt, T(1.6), T(2.4)), { size: unitSize, italic: true, align: 'left', col: C.inkSoft, w: 600 });
          labLines.forEach((ln, i) => WC.hand(X, ln, cx, labY + i * labSize * 1.15, linIn(seg(lt, T(2.0 + i * .5), T(2.9 + i * .5))), { size: labSize, w: 700, align: 'center' }));
          if (P.note) WC.hand(X, P.note, cx, labY + labLines.length * labSize * 1.15 + noteSize * .5, linIn(seg(lt, T(2.8), T(3.7))), { size: noteSize, w: 600, align: 'center', col: C.inkSoft });
        },
      };
    },
  };

  // ---------------------------------------------------------------- wc_timeline
  SHOTS.wc_timeline = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const items = (P.items || []).filter(Boolean).slice(0, 8), n = Math.max(1, items.length), hi = P.highlight;
      if (!items.length) return { update() { X.clear(); paperBase(X, W, H); } };
      const yS = portrait ? 78 : 66, lS = portrait ? 54 : 44;
      const hasT = !!P.title, titleY = portrait ? 260 : 150;
      // vertical in a Short (line at lineX, from a0 to a1 in y), horizontal in a long video (line at lineY)
      // the line sits right of the widest year ("c. 280 BC" must not be cut at the left edge); labels get the rest
      X.font = `700 ${Math.round(yS * 1.12)}px ${WC.SERIF}`;
      const yearW = Math.max(0, ...items.map(it => X.measureText(String(it.year ?? '')).width));
      const lineX = portrait ? Math.round(Math.max(330, Math.min(560, yearW + 56 + 70))) : 330, lineY = hasT ? 500 : 470;
      const a0 = portrait ? (hasT ? 360 : 260) : 190, a1 = portrait ? 1100 : 1730;
      const pos = i => a0 + (i + .5) * (a1 - a0) / n;
      const labW = portrait ? W - lineX - 58 - 70 : (a1 - a0) / n - 40;
      const labs = items.map(it => wrapBal(X, it.label || '', `700 ${lS}px ${WC.HANDF}`, labW).slice(0, 3));
      const inkL = WC.mixc(C.ink, C.inkSoft, .25), dabs = [C.sky, C.ground, C.mid, C.skyWarm, C.far];
      const S = WC.withSeed(seed * 43 + 5, () => {
        const L = portrait ? [lineX, a0 - 70, lineX + 4, a1 + 50] : [a0 - 90, lineY + 2, a1 + 70, lineY - 2];
        const ribbon = WC.mk(WC.qcurve(L[0], L[1], L[2], L[3], 8, 24), portrait ? 86 : 78, WC.mixc(C.sky, C.water, .3), { prof: 'leaf', nb: 9, a: .5 });
        const ribbon2 = WC.mk(WC.qcurve(L[0] + (portrait ? 10 : 0), L[1] + (portrait ? 40 : 6), L[2], L[3] - (portrait ? 30 : 0), -6, 24), portrait ? 40 : 36, WC.mixc(C.ground, C.paper, .1), { prof: 'leaf', nb: 7, a: .3 });
        const line = WC.mk(WC.qcurve(L[0], L[1] + (portrait ? 30 : 0), L[2], L[3], 4, 48), 7, inkL, { prof: 'even', nb: 3, a: .9, rough: .3 });
        const marks = items.map((it, i) => {
          const red = i === hi, p = pos(i), x = portrait ? lineX : p, y = portrait ? p : lineY, M = [];
          // a dab of colour under each date (the highlighted one in the accent), then the painted dot and a tick
          M.push(WC.washShape(WC.blobPts(x, y, red ? 60 : 46, red ? 54 : 40, 48, .1), red ? C.red : dabs[i % dabs.length], red ? .32 : .34, 3, 2));
          M.push(WC.washShape(WC.blobPts(x, y, red ? 16 : 12, red ? 15 : 11, 24, .12), red ? C.red : inkL, .95, 2, 1));
          M.push(portrait ? WC.mk(WC.qcurve(x + 18, y, x + 38, y + 1, 0, 4), 3.4, inkL, { prof: 'even', nb: 0, a: .75 }) : WC.mk(WC.qcurve(x, y + 18, x + 1, y + 38, 0, 4), 3.4, inkL, { prof: 'even', nb: 0, a: .75 }));
          return M;
        });
        return { ribbon, ribbon2, line, marks };
      });
      const fullL = portrait ? (a1 + 50) - (a0 - 40) : (a1 + 70) - (a0 - 90), startOff = portrait ? 40 : 90;
      return {
        update(lt, dur, cues) {
          X.clear(); paperBase(X, W, H);
          cues = cues || {};
          const span = Math.max(1, dur * .78 - .8);
          const tAt = i => WC.timeOf(items[i].at, cues, .7 + i * span / n);
          WC.drawS(X, S.ribbon, eio(seg(lt, 0, 1.0)));
          WC.drawS(X, S.ribbon2, eio(seg(lt, .3, 1.3)));
          if (hasT) WC.serif(X, P.title, W / 2, titleY, seg(lt, .1, 1.1), { size: portrait ? 64 : 58, italic: true, col: C.inkSoft });
          // the line grows to the newest mark, then on past the last one
          let reach = 0;
          items.forEach((it, i) => { const q = eio(seg(lt, tAt(i) - .5, tAt(i))); reach = Math.max(reach, mix(i ? pos(i - 1) - a0 + startOff : 0, pos(i) - a0 + startOff, q)); });
          const tail = seg(lt, tAt(n - 1) + .3, tAt(n - 1) + 1.2);
          WC.drawS(X, S.line, clamp(mix(reach / fullL, 1, tail)));
          items.forEach((it, i) => {
            const t0 = tAt(i), p = seg(lt, t0, t0 + .6);
            if (p <= 0) return;
            const red = i === hi, P0 = pos(i), yc = red ? C.red : C.ink, ytxt = String(it.year ?? '');
            WC.drawList(X, S.marks[i], p);
            const lc = red ? WC.mixc(C.red, C.ink, .35) : C.ink;
            if (portrait) {
              WC.serif(X, ytxt, lineX - 56, P0 + yS * .3, seg(lt, t0 + .1, t0 + .8), { size: yS * (red ? 1.12 : 1), align: 'right', col: yc, w: 700 });
              labs[i].forEach((ln, j) => WC.hand(X, ln, lineX + 58, P0 + (j - (labs[i].length - 1) / 2) * lS * 1.08, linIn(seg(lt, t0 + .35 + j * .4, t0 + 1.2 + j * .4)), { size: lS, w: 700, align: 'left', col: lc }));
            } else {
              WC.serif(X, ytxt, P0, lineY - 58, seg(lt, t0 + .1, t0 + .8), { size: yS * (red ? 1.12 : 1), col: yc, w: 700 });
              labs[i].forEach((ln, j) => WC.hand(X, ln, P0, lineY + 92 + j * lS * 1.1, linIn(seg(lt, t0 + .35 + j * .4, t0 + 1.2 + j * .4)), { size: lS, w: 700, align: 'center', col: lc }));
            }
          });
        },
      };
    },
  };

  // ---------------------------------------------------------------- wc_letter
  const MONO = '"Courier New", Courier, "Liberation Mono", "Nimbus Mono PS", monospace';
  // a tuğra-like flourish (calligraphic loops, upright strokes, a long sweep) — ornamental, not a real tuğra
  function flourish(x, y, s) {
    const S = [], gold = WC.mixc(C.gold, C.wood, .38), blue = WC.mixc(C.blue, C.ink, .2), q = (a, b, c2, d, e, f, n = 16) => WC.qctrl(x + a * s, y + b * s, x + c2 * s, y + d * s, x + e * s, y + f * s, n);
    S.push(WC.washShape(WC.blobPts(x - 10 * s, y - 80 * s, 210 * s, 130 * s, 36, .18), WC.mixc(C.gold, C.paper, .5), .28, 3, 4));
    // two nested loops opening to the left
    const loop = (rx, ry, cxo, cyo, w, colour) => { const pts = []; for (let i = 0; i <= 36; i++) { const a = Math.PI * .28 + i / 36 * Math.PI * 1.8; pts.push([x + (cxo + Math.cos(a) * rx) * s, y + (cyo + Math.sin(a) * ry) * s]); } return WC.mk(pts, w * s, colour, { prof: 'leaf', nb: 4, a: .9 }); };
    S.push(loop(160, 88, -70, -34, 12, gold), loop(104, 56, -58, -36, 9, gold), loop(62, 32, -48, -36, 4, blue));
    // three tall upright strokes, thick at the foot, each with a small flag
    for (const [dx, hh] of [[6, 230], [34, 252], [62, 222]]) {
      S.push(WC.mk(q(dx, 6, dx + 7, -hh * .5, dx - 3, -hh), 9 * s, gold, { prof: 'tip', nb: 3, a: .92 }));
      S.push(WC.mk(q(dx - 3, -hh, dx + 18, -hh + 12, dx + 30, -hh + 3, 8), 5 * s, gold, { prof: 'tip', nb: 0, a: .88 }));
    }
    // two long arms sweeping right, and the compact base between the uprights
    S.push(WC.mk(q(-90, 22, 80, 54, 280, -50, 26), 11 * s, gold, { prof: 'leaf', nb: 4, a: .9 }));
    S.push(WC.mk(q(-70, 8, 60, 34, 250, -26, 24), 5 * s, blue, { prof: 'leaf', nb: 0, a: .85 }));
    S.push(WC.mk(q(-30, -4, 20, -40, 80, -8, 12), 8 * s, gold, { prof: 'brush', nb: 2, a: .88 }));
    S.push(WC.mk(q(-20, -18, 24, 8, 84, -20, 12), 3.5 * s, blue, { prof: 'even', nb: 0, a: .75 }));
    for (let i = 0; i < 6; i++) { const a = WC.rnd(-20, 80), b = WC.rnd(-50, -5); S.push(WC.mk(q(a, b, a + 9, b - 12, a + 20, b - 2, 6), 3.4 * s, i % 2 ? blue : gold, { prof: 'leaf', nb: 0, a: .85 })); }
    return S;
  }
  SHOTS.wc_letter = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const style = P.style || 'letter';
      const raw = (P.lines || []).map(String);
      // sheet size and font per style
      const spec = {
        letter: { size: portrait ? 56 : 54, font: s => `600 ${s}px ${WC.HANDF}`, col: WC.mixc(C.ink, C.wood, .35), lh: 1.22, rot: -.014 },
        diary: { size: portrait ? 54 : 52, font: s => `600 ${s}px ${WC.HANDF}`, col: WC.mixc(C.ink, C.blue, .45), lh: 1.3, rot: .01 },
        decree: { size: portrait ? 56 : 48, font: s => WC.font(s, 600, 'serif', true), col: WC.mixc(C.ink, C.night, .25), lh: 1.4, rot: 0 },
        stone: { size: portrait ? 52 : 48, font: s => WC.font(s, 700), col: WC.mixc(C.stoneDark, C.ink, .4), lh: 1.35, rot: 0, caps: true, sp: .1 },
        telegram: { size: portrait ? 38 : 34, font: s => `700 ${s}px ${MONO}`, col: WC.mixc(C.ink, C.inkSoft, .15), lh: 1.75, rot: -.008, caps: true },
      }[style] || null;
      const sp0 = spec || { size: 54, font: s => `600 ${s}px ${WC.HANDF}`, col: C.ink, lh: 1.22, rot: 0 };
      const sw = style === 'decree' ? (portrait ? 800 : 820) : portrait ? 880 : (style === 'telegram' ? 1100 : 960), padX = style === 'telegram' ? 60 : 70;
      const topPad = style === 'decree' ? (portrait ? 450 : 360) : style === 'telegram' ? 150 : (P.date ? 120 : 80);
      const maxH = portrait ? 920 : 780;
      let size = sp0.size, lines, lineH;
      const textOf = s => sp0.caps ? UP(s) : s;
      for (;;) {
        lines = raw.flatMap(s => wrap(X, textOf(s), sp0.font(size), sw - padX * 2, (sp0.sp || 0) * size));
        lineH = size * sp0.lh;
        const need = topPad + lines.length * lineH + (P.sign ? size * 2.2 : 0) + 70;
        if (need <= maxH || size < sp0.size * .62) break;
        size -= 2;
      }
      let sh = Math.min(maxH, topPad + lines.length * lineH + (P.sign ? size * 2.2 : 0) + 80);
      if (style === 'letter' || style === 'diary') sh = Math.max(sh, portrait ? 640 : 560);   // a sheet, not a strip
      if (style === 'decree') sh = Math.max(sh, portrait ? 840 : 760);         // a ferman is a tall sheet
      const cx = W / 2, cy = portrait ? 660 : 460, x0 = cx - sw / 2, y0 = cy - sh / 2;
      const S = WC.withSeed(seed * 47 + 9, () => {
        const L = [];
        // a deckled sheet: jittered edge, lifted off the paper by a soft shadow
        const edge = []; const step = 34;
        for (let x = 0; x <= sw; x += step) edge.push([x0 + x, y0 + WC.rnd(-3, 3)]);
        for (let y = step; y <= sh; y += step) edge.push([x0 + sw + WC.rnd(-3, 3), y0 + y]);
        for (let x = sw - step; x >= 0; x -= step) edge.push([x0 + x, y0 + sh + WC.rnd(-3, 3)]);
        for (let y = sh - step; y > 0; y -= step) edge.push([x0 + WC.rnd(-3, 3), y0 + y]);
        const sheetCol = style === 'stone' ? C.stone : style === 'telegram' ? WC.mixc(C.paperLight, C.skyWarm, .28) : style === 'decree' ? WC.mixc(C.paperLight, C.gold, .1) : style === 'diary' ? WC.mixc(C.paperLight, C.paper, .3) : WC.mixc(C.paperLight, C.stain, .16);
        L.push(WC.washShape(edge.map(([x, y]) => [x + 10, y + 14]), WC.mixc(C.ink, C.paperDark, .6), .14, 3, 6));
        if (style === 'stone') {
          const chips = edge.map(([x, y]) => [x + WC.rnd(-10, 10), y + WC.rnd(-10, 10)]);
          L.push(WC.washShape(chips, WC.mixc(C.stone, C.paperLight, .3), .9, 3, 4), WC.washShape(chips.map(([x, y]) => [x + WC.rnd(-6, 6), y + WC.rnd(-6, 6)]), C.stone, .3, 2, 8));
          for (let i = 0; i < 12; i++) { const r = WC.rnd(40, 130), x = WC.rnd(x0 + r, x0 + sw - r), y = WC.rnd(y0 + r * .6, y0 + sh - r * .6); L.push(WC.washShape(WC.blobPts(x, y, r, r * WC.rnd(.4, .7), 22, .3), WC.pick([C.stoneDark, C.paperLight, C.far, C.stone]), WC.rnd(.05, .1), 2, 4)); }
          // darker lower and right faces: the slab has thickness
          L.push(WC.mk(WC.qcurve(x0 + 10, y0 + sh + 4, x0 + sw - 4, y0 + sh + 2, 2, 20), 12, C.stoneDark, { prof: 'even', nb: 5, a: .35 }));
          L.push(...WC.inkLine(chips.concat([chips[0]]), 2.6, WC.mixc(C.stoneDark, C.ink, .4), { step: 3, a: .6 }));
          for (let i = 0; i < 5; i++) { const x = WC.rnd(x0 + 40, x0 + sw - 40), y = WC.rnd(y0 + 30, y0 + sh - 30); L.push(WC.mk(WC.polar(x, y, WC.rnd(0, 6.28), WC.rnd(20, 70), WC.rnd(-8, 8), 6), 2, C.stoneDark, { prof: 'tip', nb: 0, a: .5 })); }
        } else {
          L.push(WC.washShape(edge, sheetCol, .92, 3, 2));
          // edges darker (pooled), a few age stains
          L.push(...WC.inkLine(edge.concat([edge[0]]), 7, WC.mixc(sheetCol, C.stain, .6), { step: 3, a: .3 }));
          for (let i = 0; i < (style === 'letter' || style === 'decree' ? 6 : 3); i++) { const r = WC.rnd(30, 100), x = WC.rnd(x0 + r * 1.3, x0 + sw - r * 1.3), y = WC.rnd(y0 + r, y0 + sh - r); L.push(WC.washShape(WC.blobPts(x, y, r, r * WC.rnd(.6, .85), 22, .3), C.stain, WC.rnd(.05, .1), 2, 3)); }
          if (style === 'letter') for (const f of [1 / 3, 2 / 3]) {
            const y = y0 + sh * f; L.push(WC.mk(WC.qcurve(x0 + 6, y, x0 + sw - 6, y + WC.rnd(-2, 2), 0, 20), 2.2, C.paperDark, { prof: 'even', nb: 0, a: .55 }), WC.mk(WC.qcurve(x0 + 6, y + 3, x0 + sw - 6, y + 3, 0, 20), 2, C.paperLight, { prof: 'even', nb: 0, a: .6 }));
          }
          if (style === 'diary') {
            for (let k = 0; k < Math.floor((sh - topPad + lineH * .6) / lineH); k++) { const y = y0 + topPad + k * lineH + size * .32; L.push(WC.mk(WC.qcurve(x0 + 20, y, x0 + sw - 20, y, 0, 16), 1.6, C.blue, { prof: 'even', nb: 0, a: .28 })); }
            L.push(WC.mk(WC.qcurve(x0 + padX - 18, y0 + 10, x0 + padX - 18, y0 + sh - 10, 0, 20), 2, C.red, { prof: 'even', nb: 0, a: .45 }));
          }
          if (style === 'decree') {
            const inset = 26, fr = [[x0 + inset, y0 + inset], [x0 + sw - inset, y0 + inset], [x0 + sw - inset, y0 + sh - inset], [x0 + inset, y0 + sh - inset], [x0 + inset, y0 + inset]];
            for (let k = 0; k < 4; k++) {           // a double rule, one brush line per side
              const a = fr[k], b = fr[k + 1], a2 = [a[0] + (a[0] < cx ? 9 : -9), a[1] + (a[1] < cy ? 9 : -9)], b2 = [b[0] + (b[0] < cx ? 9 : -9), b[1] + (b[1] < cy ? 9 : -9)];
              L.push(WC.mk(WC.qcurve(a[0], a[1], b[0], b[1], WC.rnd(-2, 2), 24), 3, WC.mixc(C.gold, C.wood, .3), { prof: 'even', nb: 0, a: .75, rough: .25 }));
              L.push(WC.mk(WC.qcurve(a2[0], a2[1], b2[0], b2[1], WC.rnd(-2, 2), 24), 1.5, C.blue, { prof: 'even', nb: 0, a: .5, rough: .25 }));
            }
          }
          if (style === 'telegram') {
            L.push(WC.washShape([[x0 + 30, y0 + 30], [x0 + sw - 30, y0 + 30], [x0 + sw - 30, y0 + 100], [x0 + 30, y0 + 100]], WC.mixc(C.clothB, C.paper, .35), .35, 2, 1));
          }
        }
        const deco = style === 'decree' ? flourish(cx + 20, y0 + topPad - 95, portrait ? 1.15 : 1) : [];
        // a wax seal for letters with a signature
        const seal = (style === 'letter' && P.sign) ? [WC.washShape(WC.blobPts(x0 + 120, y0 + sh - 90, 38, 36, 22, .18), C.red, .9, 3, 2), WC.washShape(WC.blobPts(x0 + 120, y0 + sh - 90, 22, 21, 18, .15), WC.mixc(C.red, C.ink, .3), .5, 2, 1)] : [];
        // telegram strips (one per line)
        const strips = style === 'telegram' ? lines.map((ln, i) => { const w = measure(X, ln, sp0.font(size)) + 40, y = y0 + topPad + i * lineH; return WC.washShape([[x0 + padX - 16, y - size * .95], [x0 + padX - 16 + w, y - size * .95 + WC.rnd(-2, 2)], [x0 + padX - 16 + w, y + size * .45], [x0 + padX - 16, y + size * .45 + WC.rnd(-2, 2)]], C.paperLight, .9, 2, 1); }) : [];
        const signLine = P.sign && (style === 'letter' || style === 'diary') ? WC.mk(WC.qcurve(x0 + sw - padX - 300, y0 + sh - 58, x0 + sw - padX, y0 + sh - 64, -10, 16), 3.2, sp0.col, { prof: 'brush', nb: 2, a: .8 }) : null;
        return { L, deco, seal, strips, signLine };
      });
      const totalChars = lines.reduce((a, l) => a + l.length, 0) || 1;
      const cps = style === 'telegram' ? 30 : 20;
      return {
        update(lt, dur, cues) {
          X.clear(); paperBase(X, W, H);
          X.save(); X.translate(cx, cy); X.rotate(sp0.rot); X.translate(-cx, -cy);
          WC.drawList(X, S.L, eio(seg(lt, 0, .8)));
          if (S.deco.length) WC.drawList(X, S.deco, seg(lt, .4, 2.0));
          const t0 = WC.timeOf(P.at, cues || {}, S.deco.length ? 1.6 : .8);
          const endBy = Math.max(t0 + 1, dur - (P.sign ? 1.6 : .7)), perChar = Math.min(1 / cps, (endBy - t0) / (totalChars + 6 * lines.length));
          let acc = t0;
          if (style === 'telegram') {
            const head = P.head ?? (LOCALE.startsWith('tr') ? 'TELGRAF' : 'TELEGRAM');
            WC.serif(X, UP(head), x0 + 50, y0 + 82, seg(lt, .3, 1.0), { size: 40, spacing: 12, align: 'left', col: WC.mixc(C.clothB, C.ink, .4), w: 700 });
            if (P.date) WC.hand(X, P.date, x0 + sw - 50, y0 + 66, linIn(seg(lt, .6, 1.4)), { size: 36, align: 'right', col: C.inkSoft });
          } else if (P.date) WC.hand(X, P.date, x0 + sw - padX, y0 + 70, linIn(seg(lt, .5, 1.3)), { size: Math.round(size * .78), align: 'right', col: sp0.col });
          if (P.head && style !== 'telegram') WC.serif(X, P.head, cx, y0 + (style === 'decree' ? topPad - 18 : 64), seg(lt, .6, 1.5), { size: Math.round(size * .9), italic: true, col: sp0.col });
          lines.forEach((ln, i) => {
            const a = acc, b = acc + Math.max(.25, ln.length * perChar); acc = b + perChar * 6;
            const p = seg(lt, a, b);
            if (p <= 0) return;
            const y = y0 + topPad + i * lineH;
            if (style === 'telegram') {
              WC.washFill(X, S.strips[i], Math.min(1, p * 4));
              const nchar = Math.floor(ln.length * p + .001);
              X.save(); X.font = sp0.font(size); X.fillStyle = WC.rgba(sp0.col, .9); X.textBaseline = 'alphabetic'; X.fillText(ln.slice(0, nchar), x0 + padX, y); X.restore();
            } else if (style === 'stone') {
              const sx = cx; X.save(); X.font = sp0.font(size); X.letterSpacing = (sp0.sp * size) + 'px'; X.textAlign = 'center';
              const w = X.measureText(ln).width; X.beginPath(); X.rect(sx - w / 2 - 10, y - size * 1.2, (w + 20) * p, size * 1.6); X.clip();
              // carved: a lit lower edge, a shadowed upper edge, the cut itself
              X.fillStyle = WC.rgba(C.paperLight, .6); X.fillText(ln, sx + 2, y + 2.5);
              X.fillStyle = WC.rgba(WC.mixc(C.stoneDark, C.ink, .5), .75); X.fillText(ln, sx - 1, y - 1.5);
              X.fillStyle = WC.rgba(WC.mixc(C.stoneDark, C.ink, .3), .85); X.fillText(ln, sx, y);
              X.restore();
            } else if (style === 'decree') {
              WC.serif(X, ln, cx, y, p, { size, italic: true, col: sp0.col, w: 600, halo: 0 });
            } else {
              WC.hand(X, ln, x0 + padX, y - size * .3, linIn(p), { size, w: 600, col: sp0.col, a: .9 });
            }
          });
          if (S.seal.length) WC.drawList(X, S.seal, seg(lt, acc + .1, acc + .6));
          if (P.sign) {
            const ps = seg(lt, acc + .2, acc + 1.0), sx = x0 + sw - padX, sy = y0 + sh - 78;
            if (style === 'decree') WC.serif(X, P.sign, cx, y0 + sh - 70, ps, { size: Math.round(size * .9), italic: true, col: WC.mixc(C.gold, C.wood, .5), halo: 0 });
            else if (style === 'stone') WC.serif(X, '— ' + UP(P.sign), cx, y0 + sh - 50, ps, { size: Math.round(size * .8), spacing: 6, col: sp0.col, halo: 0 });
            else if (style === 'telegram') { X.save(); X.font = sp0.font(size); X.fillStyle = WC.rgba(sp0.col, .9); X.textAlign = 'right'; const s = UP(P.sign); X.fillText(s.slice(0, Math.floor(s.length * ps)), x0 + sw - padX, y0 + sh - 50); X.restore(); }
            else { WC.hand(X, P.sign, sx, sy - 6, linIn(ps), { size: Math.round(size * 1.08), w: 700, align: 'right', col: sp0.col }); if (S.signLine) WC.drawS(X, S.signLine, seg(lt, acc + .9, acc + 1.4)); }
          }
          X.restore();
        },
      };
    },
  };
})();
