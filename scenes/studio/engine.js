// Studio engine: timeline -> frames. window.init(timeline), window.seek(t), window.cover(c).
// One visual style (brand/kit/BRAND.md): sepia parchment + the stick-figure Kaşif ("theme": "parchment").
// Layers (back to front): paper background (canvas, parchment-theme.js) · 2D ink shots ·
// HUD (kicker, captions, brand, progress) · cover.
'use strict';

let D, S = [], W, H;
let PAPER = null, PCAP = null, PBRAND = null, BG_AT = { i: 0, prev: -1, p: 1 };   // parchment-theme.js
const $ = id => document.getElementById(id);

function makeKicker(sc) {
  // scene "source": a short on-screen source note under the kicker ("Kaynak: NASA"), BRAND.md §6.12
  return PARCHMENT.kicker($('kickers'), W, H, Object.assign({}, sc.title || {},
    sc.source ? { source: (D.lang === 'en' ? 'Source: ' : 'Kaynak: ') + sc.source } : {}));
}

window.init = async (data) => {
  D = data;
  [W, H] = D.size;
  LOCALE = D.lang === 'en' ? 'en-US' : 'tr-TR';
  document.documentElement.lang = D.lang || 'tr';
  // the channel's narrator (Kaşif's explorer hat, or Stickstory's fez) before any shot builds a rig
  if (typeof KASIF !== 'undefined' && KASIF && KASIF.setNarrator) KASIF.setNarrator(D.narrator);
  const root = document.documentElement;
  for (const k of ['paper', 'paperLight', 'ink', 'red', 'blue']) root.style.setProperty('--' + k, THEME_PARCHMENT[k]);
  root.classList.add(D.format || 'short');
  root.classList.add('parchment');   // the only theme
  // each channel its own HUD and cover type (BRAND.md §11): Stickstory (fez narrator) never looks like Düşün Bakalım
  const skin = D.narrator === 'fes' ? 'ag' : 'db';
  root.classList.add('ch-' + skin); PARCHMENT.setSkin(skin);

  const bg = $('bg'); bg.width = W / 2; bg.height = H / 2;
  PAPER = PARCHMENT.background(bg, W, H, { scale: 0.5 });
  // shots measure text while building: fonts must be ready first
  await Promise.all(['900 100px Fraunces', '800 100px Fraunces', '700 100px Lora', '400 100px "Patrick Hand"', '700 100px "Zilla Slab"', '600 100px "Zilla Slab"'].map(f => document.fonts.load(f, 'AĞİŞÇÖÜ0123')));

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
    return o;
  });
  // the camera measures each shot while it is still laid out (hidden, untransformed)
  S.forEach((o, i) => {
    const b = measureInk(o);
    o.cam = planCamera(o, i, b); o.set = planSet(o, b);
    o.el.style.display = 'none'; o.el.style.visibility = '';
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
function drawBg(t, visible = []) {
  // parchment-theme.js: baked paper, stains move per scene; then each visible shot's set, under its camera
  const withSet = visible.filter(v => v.o.set && v.st.show && v.st.op > 0.01);
  PAPER.update(t, BG_AT.i, BG_AT.prev, BG_AT.p, withSet.length ? (X) => {
    X.globalCompositeOperation = 'multiply';
    for (const v of withSet) {
      const k = v.cam, cx = W / 2, cy = H / 2;
      X.globalAlpha = v.st.op;
      X.setTransform(k.s, 0, 0, k.s, (cx + k.tx - k.s * cx) / 2, (cy + k.ty - k.s * cy) / 2);
      X.drawImage(v.o.set, 0, 0);
    }
  } : null);
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

function applyStyle(node, st, cam = '') {
  node.style.display = st.show ? '' : 'none';
  node.style.opacity = st.op;
  node.style.transform = (st.tf || '') + (cam ? ' ' + cam : '');
  node.style.filter = st.blur > 0.3 ? `blur(${st.blur.toFixed(1)}px)` : '';
}

// ------------------------------------------------------------ camera
// Shots are drawn on a fixed stage and most keep their action in a band in the middle, which left every frame
// looking alike: a wide shot with empty paper around it. The camera frames each shot instead: it measures where
// the ink really is (leaf element boxes; full-frame backdrops and stray outliers left out), fills the picture
// area above the captions with it, then moves through the scene (push in, pull out, drift), never showing the
// stage's edge. sc.camera overrides it: false (locked wide shot) or
// {zoom, focus: [x, y] (stage px, the close-up's subject), move: 'push'|'pull'|'left'|'right'|'up'|'down'|'still'}.
const CAM_MOVES = ['push', 'left', 'pull', 'push', 'right', 'up'];
function cameraArea() {   // the picture area: under the brand/kicker, above the caption strip
  return H > W ? { x0: 40, x1: W - 40, y0: 300, y1: 1150 } : { x0: 80, x1: W - 80, y0: 210, y1: H - 190 };
}
function measureInk(o) {
  const lt = Math.max(0, o.dur * 0.8);
  try { o.inst.update(lt, o.dur, localCues(o), { t: o.sc.start + lt, pal: o.pal, prevP: null, prevCam: null }); } catch (e) { return null; }
  const R = [];
  let ground = 0;                                                  // a long thin stroke low in the frame: the ground line
  for (const n of o.el.querySelectorAll('*')) {
    if (n.children.length || /^(defs|clipPath|mask|linearGradient|radialGradient|stop|filter|pattern|symbol|title|style)$/i.test(n.tagName)) continue;
    if (n.closest('defs,clipPath,mask,pattern,symbol')) continue;
    const r = n.getBoundingClientRect();
    if (r.width * r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) continue;
    if (r.width > W * 0.5 && r.height < 40 && r.top > H * 0.4 && r.top < H * 0.8) ground = Math.max(ground, (r.top + r.bottom) / 2);
    if (r.width > W * 0.85 || r.height > H * 0.7) continue;          // paper, sky, sea, ground: a backdrop
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
    R.push({ x0, x1, y0, y1, w: Math.sqrt((x1 - x0) * (y1 - y0)) });
  }
  if (R.length < 3) return null;
  const tot = R.reduce((a, r) => a + r.w, 0);
  const pct = (key, q) => { const s = R.slice().sort((a, b) => a[key] - b[key]); let acc = 0; for (const r of s) { acc += r.w; if (acc >= q * tot) return r[key]; } return s[s.length - 1][key]; };
  return { x0: pct('x0', 0.015), x1: pct('x1', 0.985), y0: pct('y0', 0.015), y1: pct('y1', 0.985), ground: ground || null };
}
function planCamera(o, i, b) {
  const c = o.sc.camera, A = cameraArea();
  if (c === false || o.sc.type === 'photo') return null;      // photos frame themselves (Ken Burns)
  const C = typeof c === 'object' && c ? c : {};
  let s, fx, fy;
  if (Array.isArray(C.focus)) {
    [fx, fy] = C.focus; s = C.zoom ?? 1.8;
  } else {
    if (!b) return null;
    const m = 30, bw = b.x1 - b.x0 + 2 * m, bh = b.y1 - b.y0 + 2 * m;
    s = C.zoom ?? Math.min((A.x1 - A.x0) / bw, (A.y1 - A.y0) / bh, H > W ? 1.45 : 1.3);
    fx = (b.x0 + b.x1) / 2; fy = (b.y0 + b.y1) / 2;
  }
  s = Math.max(1, Math.min(3, s));
  const move = C.move || (o.sc.type === 'chapter' ? 'push' : CAM_MOVES[(i * 7 + 3) % CAM_MOVES.length]);
  // a close-up brings its subject to the middle of the picture area; the automatic framing only zooms about the
  // shot's own centre, so a composition laid out to fill the frame (down to the bottom) stays where its author put it
  const close = Array.isArray(C.focus);
  return { s, fx, fy, ax: close ? (A.x0 + A.x1) / 2 : fx, ay: close ? (A.y0 + A.y1) / 2 : fy, move };
}
// transform for scene-local time lt: p -> C + T + s (p - C) about the stage centre, clamped so the stage covers the frame
function cameraAt(o, lt, pk) {
  const k = o.cam, p = progIO(lt, 0, Math.max(o.dur, 1)), cx = W / 2, cy = H / 2;
  if (!k) return { s: (1 + 0.025 * pk) * lerp(1, 1.035, p), tx: 0, ty: 0 };
  const sw = Math.min(k.s - 1, 0.08) + 0.04;              // move amplitude, relative to the framing
  let s = k.s, dx = 0, dy = 0;
  if (k.move === 'push') s *= 1 + 0.07 * p;
  else if (k.move === 'pull') s *= 1.07 - 0.07 * p;
  else if (k.move === 'left' || k.move === 'right') { s *= 1.04; dx = (k.move === 'left' ? 1 : -1) * W * sw * (p - 0.5); }
  else if (k.move === 'up' || k.move === 'down') { s *= 1.04; dy = (k.move === 'up' ? 1 : -1) * H * sw * 0.5 * (p - 0.5); }
  s *= 1 + 0.025 * pk;
  let tx = k.ax - cx - s * (k.fx - cx) + dx, ty = k.ay - cy - s * (k.fy - cy) + dy;
  const lx = (s - 1) * cx, ly = (s - 1) * cy;
  tx = Math.max(-lx, Math.min(lx, tx)); ty = Math.max(-ly, Math.min(ly, ty));
  return { s, tx, ty };
}
const camCss = k => (k.tx || k.ty ? `translate(${k.tx.toFixed(1)}px, ${k.ty.toFixed(1)}px) ` : '') + (k.s !== 1 ? `scale(${k.s.toFixed(4)})` : '');

// the scene's set (sets.js): "set": "<name>" | {name, ground, horizon} | false; a shot with a ground line gets "field"
function planSet(o, b) {
  const v = o.sc.set;
  if (v === false || typeof SETS === 'undefined') return null;
  const name = typeof v === 'string' ? v : (v && v.name) || (b && b.ground ? 'field' : null);
  if (!name || !SETS.names.includes(name)) return null;
  const gy = (v && v.ground) || (b && b.ground) || H * 0.6, hy = v && v.horizon;
  return SETS.bake(name, W / 2, H / 2, gy / 2, (o.i + 1) * 17 + name.length, hy ? hy / 2 : null);
}

// draw one frame. visible = [{o, lt, st}], hook/cover handled by callers
function compose(t, visible, pend, coverCam) {
  for (const v of visible) {   // the cover frames its own focus (stage px); scenes use their camera
    let pk = 0; for (const c of Object.values(localCues(v.o))) pk = Math.max(pk, punch(v.lt, c, 0.5));
    v.cam = coverCam || cameraAt(v.o, v.lt, pk);
  }
  drawBg(t, visible);
  S.forEach(o => { if (!visible.some(v => v.o === o)) o.el.style.display = 'none'; });
  for (const v of visible) {
    const { o, lt, st } = v;
    if (o.inst.pending) { const pr = o.inst.pending(lt); if (pr) pend.push(pr); }
    applyStyle(o.el, st, camCss(v.cam));
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

function renderSolo(t, idx, lt, pend, coverCam) {
  const o = S[idx];
  BG_AT = { i: idx, prev: -1, p: 1 };
  compose(t, [{ o, lt, st: { show: true, tf: '', op: 1, blur: 0 } }], pend, coverCam);
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
  box.style.fontSize = c.size ? c.size + 'px' : '';   // cover.size: start size in px (shrinks to fit)
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
// cover.focus [x, y] (stage px): the ONE object the thumbnail is about (BRAND.md §9). The shot is zoomed
// (cover.zoom, default 1.6 long / 1.25 Short) so that point lands in the free part of the frame; on a long video
// cover the rest of the shot also fades into the paper (#coverfade; cover.fade: false keeps it). The shot's
// transform origin is its centre: p -> C + T + s (p - C).
const coverShift = (c) => {
  const long = D.format === 'long';
  if (c && Array.isArray(c.focus)) {
    const s = c.zoom ?? (long ? 1.6 : 1.25), [fx, fy] = c.focus;
    const tx = long ? W * 0.72 : W * 0.5, ty = long ? H * 0.52 : H * 0.6;
    return { s, tx: tx - W / 2 - s * (fx - W / 2), ty: ty - H / 2 - s * (fy - H / 2) };
  }
  return long ? { s: 1.12, tx: W * 0.2, ty: 0 } : { s: 1, tx: 0, ty: H * 0.17 };
};
const coverFocusClass = (c, on) => document.documentElement.classList.toggle('focus', !!(on && c && Array.isArray(c.focus) && c.fade !== false));

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
      renderSolo(t, m.idx, m.lt + t * 0.35, pend, coverShift(h));
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
  coverFocusClass(c, D.format === 'long');   // thumbnail only: never a full-frame fade layer in video frames
  const run = () => { renderSolo(t, m.idx, m.lt, pend, coverShift(c)); hud(t, m.idx, true); };
  run();
  if (pend.length) return Promise.all(pend).then(() => { run(); return true; });
  return true;
};
