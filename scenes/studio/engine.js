// Studio engine: timeline -> frames. window.init(timeline), window.seek(t), window.cover(c).
// One visual style (brand/kit/BRAND.md): sepia parchment + the stick-figure Kaşif ("theme": "parchment").
// Layers (back to front): paper background (canvas, parchment-theme.js) · 2D ink shots ·
// HUD (kicker, captions, brand, progress) · cover.
'use strict';

let D, S = [], W, H;
let PAPER = null, PCAP = null, PBRAND = null, BG_AT = { i: 0, prev: -1, p: 1 };   // parchment-theme.js
const $ = id => document.getElementById(id);

function makeKicker(sc) {
  return PARCHMENT.kicker($('kickers'), W, H, sc.title || {});
}

window.init = async (data) => {
  D = data;
  [W, H] = D.size;
  LOCALE = D.lang === 'en' ? 'en-US' : 'tr-TR';
  document.documentElement.lang = D.lang || 'tr';
  // the channel's narrator (Kaşif's explorer hat, or Stickstory's fez) before any shot builds a rig
  if (typeof KASIF !== 'undefined' && KASIF && KASIF.setNarrator) KASIF.setNarrator(D.narrator);
  const root = document.documentElement;
  root.classList.add(D.format || 'short');
  root.classList.add('parchment');   // the only theme

  const bg = $('bg'); bg.width = W / 2; bg.height = H / 2;
  PAPER = PARCHMENT.background(bg, W, H, { scale: 0.5 });
  // shots measure text while building: fonts must be ready first
  await Promise.all(['900 100px Fraunces', '800 100px Fraunces', '700 100px Lora', '400 100px "Patrick Hand"'].map(f => document.fonts.load(f, 'AĞİŞÇÖÜ0123')));

  S = D.scenes.map((sc, i) => {
    const shot = SHOTS[sc.type];
    if (!shot) throw new Error('unknown studio shot type: ' + sc.type);
    const P = sc.params || {};
    const pal = THEME_PARCHMENT.pal;
    const o = { sc, i, P, pal, dur: sc.end - sc.start, kick: makeKicker(sc) };
    o.el = div($('shots'), 'shot');
    o.el.style.cssText = 'position:absolute;inset:0;visibility:hidden';   // laid out while building (text measuring)
    o.svg = el(o.el, 'svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    o.svg.style.cssText = 'position:absolute;left:0;top:0';
    const defs = el(o.svg, 'defs');
    o.inst = shot.build({ P, pal, W, H, root: o.el, svg: o.svg, defs, seed: i + 1, theme: D.theme });
    o.el.style.display = 'none'; o.el.style.visibility = '';
    return o;
  });
  S.forEach((o, i) => {
    o.env = { prevP: null, prevCam: null };
    // paper slide or a soft cross-dissolve; every third boundary fades
    o.trans = i === 0 ? 'cut' : (o.sc.transition || (i % 3 === 2 ? 'fade' : 'slide'));
    if (!TRANS_WIN[o.trans]) o.trans = 'slide';
    // cue times that belong to this scene (captions colour these words)
    o.cueTimes = Object.values(o.sc.cues || {});
  });
  // captions: parchment strip, cue words in gold (or red with params.caption_color)
  const keys = S.flatMap(s => s.cueTimes);
  const groups = D.captions.map(c => ({ start: c.start, end: c.end, words: c.words.map(w => {
    const so = S[sceneAt(w.t)], key = keys.some(kt => Math.abs(kt - w.t) < 0.01);
    return { t: w.t, text: w.text, cue: key ? (so && so.P.caption_color === 'red' ? 'red' : true) : false };
  }) }));
  PCAP = PARCHMENT.captions($('kickers'), W, H, groups);
  PBRAND = PARCHMENT.brand($('kickers'), W, H, D.channel || '');

  await document.fonts.ready;
  await window.seek(0);
  return true;
};

// ------------------------------------------------------------ background
function drawBg(t) {
  PAPER.update(t, BG_AT.i, BG_AT.prev, BG_AT.p);   // parchment-theme.js: baked paper, stains move per scene
}

// ------------------------------------------------------------ transitions
// returns {show, tf, op, blur} for a shot given its role around the boundary T
function transStyle(kind, role, t, T) {
  const id = { show: true, tf: '', op: 1, blur: 0 };
  if (kind === 'slide') {           // the sheet slides a little while the next one settles in
    if (role === 'out') { const p = lin(t, T - 0.2, 0.42), e = EASE_IO(p); return { show: p < 1, tf: `translateX(${-W * 0.07 * e}px) rotate(${-0.6 * e}deg)`, op: 1 - e, blur: 0 }; }
    const q = lin(t, T - 0.2, 0.5), e = EASE(q); return { show: q > 0, tf: `translateX(${W * 0.09 * (1 - e)}px) rotate(${0.8 * (1 - e)}deg)`, op: clamp01(q * 1.5), blur: 0 };
  }
  if (kind === 'fade') {
    if (role === 'out') { const p = lin(t, T - 0.2, 0.4); return { show: p < 1, tf: '', op: 1 - EASE_IO(p), blur: 0 }; }
    const q = lin(t, T - 0.2, 0.4); return { show: q > 0, tf: `scale(${lerp(1.02, 1, EASE(q))})`, op: EASE_IO(q), blur: 0 };
  }
  // cut: hard switch at T
  if (role === 'out') return { show: t < T, tf: '', op: 1, blur: 0 };
  return { show: t >= T, tf: '', op: 1, blur: 0 };
}
const TRANS_WIN = { cut: [0, 0], slide: [0.2, 0.3], fade: [0.2, 0.2] };

function applyStyle(node, st, extraScale = 1) {
  node.style.display = st.show ? '' : 'none';
  node.style.opacity = st.op;
  node.style.transform = (st.tf || '') + (extraScale !== 1 ? ` scale(${extraScale})` : '');
  node.style.filter = st.blur > 0.3 ? `blur(${st.blur.toFixed(1)}px)` : '';
}

// draw one frame. visible = [{o, lt, st}], hook/cover handled by callers
function compose(t, visible, pend, coverTf) {
  drawBg(t);
  S.forEach(o => { if (!visible.some(v => v.o === o)) o.el.style.display = 'none'; });
  for (const v of visible) {
    const { o, lt, st } = v;
    if (o.inst.pending) { const pr = o.inst.pending(lt); if (pr) pend.push(pr); }
    let pk = 0; for (const c of Object.values(localCues(o))) pk = Math.max(pk, punch(lt, c, 0.5));
    applyStyle(o.el, st, (1 + 0.025 * pk) * lerp(1, 1.035, clamp01(lt / Math.max(o.dur, 1))));
    if (coverTf) o.el.style.transform += ' ' + coverTf;
    if (st.show) o.inst.update(lt, o.dur, localCues(o), Object.assign({ t, pal: o.pal }, o.env));
  }
}

function localCues(o) {
  if (!o._cues) { o._cues = {}; for (const k in o.sc.cues) o._cues[k] = o.sc.cues[k] - o.sc.start; }
  return o._cues;
}

// ------------------------------------------------------------ HUD
function hud(t, i, hooking) {
  S.forEach((s, k) => s.kick.update(k !== i || hooking ? -1 : t - s.sc.start, 1 - prog(t, s.sc.end - 0.15, 0.15)));
  // captions: 1-3 words, each appears when spoken (parchment-theme.js)
  PCAP.update(hooking ? -1 : t);
  $('bar').style.width = (100 * clamp01(t / D.duration)) + '%';
}

// ------------------------------------------------------------ seek
function sceneAt(t) { let i = 0; while (i + 1 < S.length && t >= S[i + 1].sc.start) i++; return i; }

function renderNormal(t, pend) {
  const i = sceneAt(t), o = S[i];
  const vis = [];
  const T = o.sc.start;
  const prev = S[i - 1];
  if (prev && t < T + TRANS_WIN[o.trans][1] + 0.2) vis.push({ o: prev, lt: t - prev.sc.start, st: transStyle(o.trans, 'out', t, T) });
  vis.push({ o, lt: t - T, st: i === 0 ? { show: true, tf: '', op: 1, blur: 0 } : transStyle(o.trans, 'in', t, T) });
  const nx = S[i + 1];
  if (nx && t >= nx.sc.start - TRANS_WIN[nx.trans][0] - 0.01) {
    vis[vis.length - 1].st = transStyle(nx.trans, 'out', t, nx.sc.start);
    vis.push({ o: nx, lt: t - nx.sc.start, st: transStyle(nx.trans, 'in', t, nx.sc.start) });
  }
  BG_AT = { i, prev: prev ? i - 1 : -1, p: prev ? prog(t, T - 0.2, 0.6) : 1 };
  compose(t, vis, pend);
  hud(t, i, false);
}

function renderSolo(t, idx, lt, pend, coverTf) {
  const o = S[idx];
  BG_AT = { i: idx, prev: -1, p: 1 };
  compose(t, [{ o, lt, st: { show: true, tf: '', op: 1, blur: 0 } }], pend, coverTf);
}

function buildCoverText(c) {
  const hl = (c.highlight || []).map(w => w.toLocaleUpperCase(LOCALE));
  const box = $('covertext');
  box.innerHTML = '';
  for (const ln of c.lines || []) {
    const row = document.createElement('span'); row.className = 'line';
    for (const w of ln.split(/\s+/)) {
      const sp = document.createElement('span');
      sp.textContent = w + ' ';
      if (hl.includes(w.toLocaleUpperCase(LOCALE).replace(/[?!.,:]/g, ''))) sp.className = 'hl';
      row.appendChild(sp);
    }
    box.appendChild(row);
  }
  box.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(box).fontSize);
  while (fs > 70 && [...box.querySelectorAll('.line')].some(l => l.scrollWidth > box.clientWidth + 2 || l.offsetHeight > fs * 1.5)) {
    fs -= 6; box.style.fontSize = fs + 'px';
  }
  return box;
}
// cover: a big Kaşif (shock/point) next to the title (BRAND.md §9) when the Kaşif module (shots/kasif.js) is loaded.
// cover.kasif: false | "shock" | {pose, x, y (ground point, stage px), scale, face: 1|-1, emotion, dir}
function coverKasif(c, lt) {
  const node = $('kasifcover');
  node.innerHTML = '';
  if (c.kasif === false || typeof KASIF === 'undefined' || !KASIF || typeof KASIF.create !== 'function') return;
  node.setAttribute('width', W); node.setAttribute('height', H); node.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const portrait = H > W, k = typeof c.kasif === 'object' ? c.kasif : { pose: c.kasif };
  const pose = k.pose || 'shock';
  try {
    const g = el(node, 'g');
    const rig = KASIF.create(g, { scale: k.scale ?? (portrait ? 1.15 : 0.95), seed: 7 });
    rig.update(2 + lt, pose, { x: k.x ?? (portrait ? W * 0.74 : W * 0.47), y: k.y ?? (portrait ? H * 0.97 : H * 0.985),
      face: k.face ?? -1, since: 1.5, emotion: k.emotion || (pose === 'shock' ? 'surprised' : 'happy'), dir: k.dir ?? 40, mouth: 0.6 });
  } catch (e) { console.error('Kaşif cover failed', e); node.innerHTML = ''; }
}
const coverShift = () => D.format === 'long' ? `translateX(${W * 0.2}px) scale(1.12)` : `translateY(${H * 0.17}px)`;

function coverMoment(c) {
  const idx = Math.min(c.scene ?? 0, S.length - 1), o = S[idx];
  return { idx, lt: Math.min(c.t ?? o.dur * 0.85, o.dur - 0.2) };
}

window.seek = (t) => {
  const pend = [], root = document.documentElement, h = D.hook;
  const run = () => {
    pend.length = 0;
    if (h && t < h.end) {
      if (!root.classList.contains('hook')) { root.classList.add('cover', 'hook'); buildCoverText(h); coverKasif(h, 0); }
      const m = coverMoment(h);
      renderSolo(t, m.idx, m.lt + t * 0.35, pend, coverShift());
      const box = $('covertext');
      box.style.opacity = 1;
      box.style.transform = `scale(${lerp(1.08, 1, prog(t, 0, 0.4))})`;
      $('covershade').style.opacity = 1;
      hud(t, sceneAt(t), true);
      return;
    }
    if (root.classList.contains('hook')) root.classList.remove('cover', 'hook');
    renderNormal(t, pend);
  };
  run();
  if (pend.length) return Promise.all(pend).then(() => { run(); return true; });
  return true;
};

// thumbnail: cover text + the chosen shot frozen at its most dramatic moment
window.cover = (c) => {
  const pend = [];
  const root = document.documentElement;
  root.classList.add('cover');
  root.classList.remove('hook');
  buildCoverText(c);
  $('covertext').style.transform = '';
  $('covertext').style.opacity = 1;
  const m = coverMoment(c);
  const t = S[m.idx].sc.start + m.lt;
  coverKasif(c, m.lt);
  const run = () => { renderSolo(t, m.idx, m.lt, pend, coverShift()); hud(t, m.idx, true); };
  run();
  if (pend.length) return Promise.all(pend).then(() => { run(); return true; });
  return true;
};
