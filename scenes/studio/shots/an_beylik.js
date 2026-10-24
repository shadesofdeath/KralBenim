// an_beylik: "patchwork quilt" map of Anatolia around 1390 in the parchment ink style (BRAND.md §3, §5): a paper sheet
// with a simplified Anatolian coast, hatched sea marks, and 9 beylik patches (Osmanlı + 8 Turkish beyliks), each in
// its own faded palette tone (paperDark, stain, gold wash, inkSoft hatch), names in Patrick Hand. Written for the
// Ankara 1402 long video (scenes 6, 7, 44), parametric. Three things can happen on it:
//   take    — patches turn Ottoman blue one by one (blue hatch fills in, border thickens to blue, name punches);
//   exile   — from every patch a small turbaned bey pictogram walks along a dashed trail to a red-pennant tent at the
//             east edge of the map (the beys gather at its door; the tent punches on `hit`);
//   restore — the reverse: the beys start at the tent, walk home, and each patch's blue fades back to its old tone
//             as its bey arrives; `tent_leave` slides the tent off the east edge of the sheet.
// The narrator (Kaşif) stands beside the sheet; he can track the patch being taken or point at the tent.
//
// P: {
//   view: [lon0, lon1, lat0, lat1] (default [25.7, 39.7, 35.7, 42.3]),
//   sheet: {x, y, w, h} (px; default 16:9 x 130 y 205 w 1420 h 645, portrait 40/300/1000/820),
//   patches: [{id, name, poly: [[lon, lat]...], tone: 0..7, label: [lon, lat], home: [lon, lat]}]  (optional: overrides
//            / adds to the defaults by id; default ids: osmanli, candar, saruhan, germiyan, aydin, mentese, hamid,
//            teke, karaman; polygons are clipped to the land, so they may overshoot into the sea),
//   names: [ids] (which names are printed; default ["saruhan", "germiyan", "aydin", "mentese", "karaman"]: keep the
//          on-screen word count ≤ 5) | "all" | false,
//   own: "osmanli" (patch that is blue from the start) | false,
//   taken: "all" | [ids] (also blue from the start, e.g. scene 7 / 44),
//   take: {at: cue|sec, ids: [...] (default every non-own patch, west → east), gap: 0.4, dur: 0.7}
//         | [{id, at, dur}]                                  (patch fills with the blue hatch, border turns blue),
//   exile: {at: cue|sec, hit: cue|sec (beys reach the tent by then; default at + 2.4), ids: [...] (default all
//           non-own patches), gap: 0.12},
//   restore: {at: cue|sec, dur: 2.2, gap: 0.14, ids: [...] (default all non-own patches)}
//           (beys start at the tent door, walk home; each patch's blue fades over 0.6 s as its bey arrives;
//            with restore the patches start blue unless `taken` says otherwise),
//   tent: {lon: 38.4, lat: 39.4, at: cue|sec (pops in; default visible from the start), scale: 1.25, color: "red"}
//         | false (default: shown when exile or restore is set),
//   tent_leave: {at: cue|sec, dur: 1.4} (tent slides east off the sheet and fades),
//   hit: cue (tent punch; defaults to exile.hit),
//   note: {text, at, x: 0.05, y: 0.12 (0..1 of the sheet), size: 58, color: "red"},
//   kasif: {x: 0.9 (0..1 W), y: 900 (ground px), scale: 0.75, pose: "idle", face: -1, emotion, dir,
//           track: true (during `take`: points at each patch as it turns blue),
//           seq: [{at, pose, dir: deg | "up" | "tent", face, emotion}]} | false,
//   cam: {zoom: 1.04 (slow push over the scene), focus: [0.5, 0.5], pan: 0 (px; + = moves the view east)}
// }
// cues: whatever names the params reference. Everything is a pure function of (seed, lt, cues): no Math.random.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const tc = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);
  const FR = 'Fraunces, Georgia, serif';
  const KX = Math.cos(39 * Math.PI / 180);
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, gold: INK.gold, soft: INK.inkSoft };
  const colOf = (c, fb) => COL[c] || fb || INK.ink;
  const DIRS = { up: 70, down: -38, forward: 8 };
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const sub = (pts, p) => {
    if (p >= 1) return pts;
    if (p <= 0) return pts.slice(0, 1);
    const n = pts.length - 1, x = p * n, k = Math.floor(x), f = x - k, out = pts.slice(0, k + 1);
    if (k < n) out.push([lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)]);
    return out;
  };
  function painter(parent) {
    const els = [];
    return function paint(strokes, t, sd) {
      let k = 0;
      const get = () => { const e = els[k] || (els[k] = inkEl(parent)); k++; e.style.display = ''; return e; };
      for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!s || !s.p || s.p.length < 2) continue;
        const base = { seed: sd + i * 7, t, amp: s.amp ?? 1.2, smooth: s.sm !== 0 };
        if (s.f) { const e = get(); e.setAttribute('fill', s.f); e.setAttribute('fill-opacity', s.fo ?? 1); e.setAttribute('d', inkLoop(s.p, base)); }
        if (s.w !== 0) {
          const e = get(); e.setAttribute('fill', s.col || INK.ink); e.setAttribute('fill-opacity', s.o ?? 1);
          e.setAttribute('d', inkPath(s.p, Object.assign({}, base, { w: s.w ?? 5, closed: !!s.c, taper: s.taper ?? 0.3 })));
        }
      }
      for (let j = k; j < els.length; j++) els[j].style.display = 'none';
    };
  }

  // ---------------------------------------------------------------- geography (lon, lat)
  const LAND = [   // Anatolia (Asian side) + a cut of Thrace; the east runs off the sheet
    [29.05, 41.22], [30.0, 41.15], [31.4, 41.3], [32.6, 41.85], [33.5, 42.02], [34.9, 42.05], [35.2, 41.72], [36.0, 41.65],
    [36.5, 41.3], [37.5, 41.1], [38.4, 40.95], [39.7, 41.02], [40.5, 41.05], [41.5, 41.5], [43, 41.5], [46, 41.5],
    [46, 36.8], [42.5, 37.1], [40, 36.8], [38, 36.75], [36.6, 36.8], [36.2, 36.6], [35.8, 36.78], [34.6, 36.8], [33.6, 36.2],
    [32.5, 36.1], [31.0, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37.0], [27.2, 37.9], [26.4, 38.3],
    [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.7, 40.4], [27.5, 40.35], [29.0, 40.4], [29.4, 40.75],
    [29.05, 41.05]];
  const THRACE = [[28.98, 41.02], [28.0, 40.98], [27.5, 40.97], [26.7, 40.6], [26.2, 40.6], [25.6, 40.85], [25.0, 41.2],
    [24, 41.5], [24, 43], [28.0, 43], [28.0, 42.0], [28.6, 41.6], [29.05, 41.25]];
  const ISLES = [[[25.85, 40.25], [26.0, 40.15], [25.9, 40.1], [25.75, 40.18]], [[26.1, 39.3], [26.6, 39.35], [26.55, 39.05], [26.0, 39.1]],
    [[25.85, 38.6], [26.15, 38.55], [26.05, 38.25], [25.85, 38.3]]];
  const DEF = [
    { id: 'osmanli', name: 'Osmanlı', tone: 0, label: [29.4, 40.0],
      poly: [[24, 39.6], [29.8, 39.6], [31.2, 39.9], [32.2, 39.2], [33.4, 39.0], [34.6, 39.4], [34.2, 40.45], [33.0, 40.5], [31.8, 40.6], [31.6, 41.6], [31.0, 43], [24, 43]] },
    { id: 'candar', name: 'Candar', tone: 6, label: [33.6, 41.3], home: [34.2, 41.05],
      poly: [[31.8, 40.6], [33.0, 40.5], [34.2, 40.45], [35.6, 40.7], [35.9, 42.4], [31.0, 43], [31.6, 41.6]] },
    { id: 'saruhan', name: 'Saruhan', tone: 1, label: [27.85, 39.05], home: [28.3, 38.75],
      poly: [[24, 39.6], [29.0, 39.6], [28.9, 38.9], [28.3, 38.45], [24, 38.45]] },
    { id: 'germiyan', name: 'Germiyan', tone: 3, label: [30.0, 39.05], home: [30.45, 38.75],
      poly: [[29.0, 39.6], [29.8, 39.6], [31.2, 39.9], [31.0, 38.6], [30.3, 38.1], [29.3, 38.0], [28.3, 38.45], [28.9, 38.9]] },
    { id: 'aydin', name: 'Aydın', tone: 2, label: [28.05, 38.02], home: [28.6, 37.85],
      poly: [[24, 38.45], [28.3, 38.45], [29.3, 38.0], [28.9, 37.55], [24, 37.55]] },
    { id: 'mentese', name: 'Menteşe', tone: 4, label: [28.45, 37.12], home: [28.9, 36.9],
      poly: [[24, 37.55], [28.9, 37.55], [29.6, 37.2], [29.5, 35.0], [24, 35.0]] },
    { id: 'hamid', name: 'Hamid', tone: 7, label: [30.6, 37.8], home: [30.75, 37.75],
      poly: [[29.3, 38.0], [30.3, 38.1], [31.0, 38.6], [31.6, 38.5], [31.6, 37.6], [30.4, 37.3], [29.6, 37.2], [28.9, 37.55]] },
    { id: 'teke', name: 'Teke', tone: 5, label: [30.6, 36.95], home: [30.7, 36.95],
      poly: [[29.6, 37.2], [30.4, 37.3], [31.6, 37.6], [31.8, 36.6], [31.6, 35.0], [29.5, 35.0]] },
    { id: 'karaman', name: 'Karaman', tone: 1, label: [33.3, 37.95], home: [33.9, 37.7],
      poly: [[31.0, 38.6], [31.6, 38.5], [31.6, 37.6], [31.8, 36.6], [31.6, 35.0], [35.2, 35.0], [35.3, 37.2], [34.8, 38.4], [34.6, 39.4], [33.4, 39.0], [32.2, 39.2], [31.2, 39.9]] },
  ];
  const TONES = [
    { f: 'paperDark', fo: 1 }, { f: 'stain', fo: 0.36 }, { f: 'gold', fo: 0.22 }, { f: 'paperDark', fo: 0.7, hatch: 1 },
    { f: 'stain', fo: 0.2, hatch: 2 }, { f: 'paperLight', fo: 1, hatch: 1 }, { f: 'stain', fo: 0.5 }, { f: 'paperDark', fo: 1, hatch: 2 },
  ];
  const centroid = pts => { let x = 0, y = 0; pts.forEach(q => { x += q[0]; y += q[1]; }); return [x / pts.length, y / pts.length]; };

  // bey pictogram: local units, ground y = 0, ~100 tall, facing +x; ph = walk phase (cycles)
  function beyStrokes(t, ph, walking, wave) {
    const TAU = Math.PI * 2, s = walking ? Math.sin(ph * TAU) : 0, bob = walking ? -3 * Math.abs(Math.cos(ph * TAU)) : Math.sin(t * 2) * 0.8;
    const hip = [0, -36 + bob], neck = [2, -66 + bob], head = [3, -80 + bob];
    const st = [];
    st.push({ p: [hip, [hip[0] + 16 * s, -2]], w: 5 }, { p: [hip, [hip[0] - 16 * s, -2]], w: 5 });
    st.push({ p: [hip, neck], w: 5.5 });
    const arm = walking ? 12 * s : 0;
    st.push({ p: [[neck[0], neck[1] + 6], [neck[0] - 4 - arm, neck[1] + 22], [neck[0] - 6 - arm * 1.4, neck[1] + 34]], w: 4.5 });
    if (wave) st.push({ p: [[neck[0], neck[1] + 6], [neck[0] + 14, neck[1] - 6], [neck[0] + 18 + Math.sin(t * 9) * 5, neck[1] - 26]], w: 4.5 });
    else st.push({ p: [[neck[0], neck[1] + 6], [neck[0] + 6 + arm, neck[1] + 22], [neck[0] + 8 + arm * 1.4, neck[1] + 34]], w: 4.5 });
    st.push({ p: inkEllipsePts(head[0], head[1], 12, 12, 3, 9), c: 1, f: INK.paperLight, w: 4 });
    st.push({ p: [[head[0] - 15, head[1] - 6], [head[0] - 14, head[1] - 20], [head[0] - 2, head[1] - 28], [head[0] + 12, head[1] - 24], [head[0] + 16, head[1] - 8], [head[0] + 3, head[1] - 4]], c: 1, f: INK.paperLight, w: 4 });
    st.push({ p: [[head[0] - 12, head[1] - 14], [head[0] + 13, head[1] - 16]], w: 2.5, col: INK.inkSoft });
    st.push({ p: inkEllipsePts(head[0] + 1, head[1] - 29, 3.5, 3.5, 5, 6), c: 1, f: INK.red, w: 0 });
    st.push({ p: inkEllipsePts(head[0] + 5, head[1] + 1, 1.8, 1.8, 6, 5), c: 1, f: INK.ink, w: 0 });
    return st;
  }
  // tent with a red pennant: local units, ground y = 0, ~170 tall
  function tentStrokes(t, col) {
    const w = Math.sin(t * 5) * 5, w2 = Math.sin(t * 5 + 1.2) * 7;
    const arc = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI + Math.PI * i / 10; arc.push([Math.cos(a) * 82, -50 + Math.sin(a) * 66]); }
    return [
      { p: [[-92, 0], [-82, -50], ...arc.slice(1, -1), [82, -50], [92, 0]], c: 1, f: INK.paperLight, w: 5 },
      { p: [[-60, -6], [-56, -52]], w: 3, col: INK.inkSoft }, { p: [[60, -6], [56, -52]], w: 3, col: INK.inkSoft },
      { p: [[-22, 0], [-20, -58], [0, -66], [20, -58], [22, 0]], c: 1, f: INK.ink, fo: 0.75, w: 3, sm: 0 },
      { p: [[-84, -48], [84, -48]], w: 4, col: col },
      { p: [[0, -116], [0, -176]], w: 5 },
      { p: [[0, -176], [44, -170 + w], [80, -160 + w2], [42, -150 + w], [0, -144]], c: 1, f: col, w: 3.5 },
    ];
  }

  SH.an_beylik = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W;
      const S = portrait ? { x: 40, y: 300, w: 1000, h: 820 } : { x: 130, y: 205, w: 1420, h: 645 };
      if (P.sheet) Object.assign(S, P.sheet);
      const K0 = P.kasif === false ? null : Object.assign({ x: portrait ? 0.82 : 0.9, y: portrait ? 1150 : 900, scale: portrait ? 0.55 : 0.75, pose: 'idle', face: -1 }, P.kasif || {});
      // patches (defaults + overrides)
      const byId = {};
      DEF.forEach(d => { byId[d.id] = Object.assign({}, d); });
      (P.patches || []).forEach(d => { byId[d.id] = Object.assign(byId[d.id] || { tone: 0 }, d); });
      const list = Object.values(byId);
      const own = P.own === false ? null : (P.own || 'osmanli');
      const others = list.filter(p => p.id !== own).sort((a, b) => centroid(a.poly)[0] - centroid(b.poly)[0]);
      const names = P.names === false ? [] : P.names === 'all' ? list.map(p => p.id) : (P.names || ['saruhan', 'germiyan', 'aydin', 'mentese', 'karaman']);
      // projection (static; the camera group moves the whole sheet)
      const V = P.view || [25.7, 39.7, 35.7, 42.3];
      const sc = Math.min(S.w / ((V[1] - V[0]) * KX), S.h / (V[3] - V[2]));
      const lc = (V[0] + V[1]) / 2, ac = (V[2] + V[3]) / 2;
      const PX = q => [S.x + S.w / 2 + (q[0] - lc) * KX * sc, S.y + S.h / 2 - (q[1] - ac) * sc];
      const PXs = pts => pts.map(PX);

      const root = el(svg, 'g'), cam = el(root, 'g');
      const sheetSh = inkEl(cam, INK.ink, { 'fill-opacity': 0.14 }), sheetE = inkEl(cam, INK.paperLight), sheetR = inkEl(cam);
      const cid = 'anbsheet' + seed, clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: S.x + 6, y: S.y + 6, width: S.w - 12, height: S.h - 12, rx: 8 });
      const mg = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const seaE = inkEl(mg, INK.inkSoft, { 'fill-opacity': 0.55 });
      const landPts = PXs(LAND), thrPts = PXs(THRACE);
      const lid = 'anbland' + seed, lclip = el(defs, 'clipPath', { id: lid });
      el(lclip, 'path', { d: 'M' + landPts.map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L') + ' Z M' + thrPts.map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L') + ' Z' });
      const landE = inkEl(mg, INK.paper);
      const pg = el(mg, 'g', { 'clip-path': `url(#${lid})` });
      const hatch = (key, col, ang, op) => {
        const id = `anbh${seed}_${key}`, p = el(defs, 'pattern', { id, width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: `rotate(${ang})` });
        el(p, 'rect', { x: 0, y: 0, width: 4, height: 18, fill: col, 'fill-opacity': op });
        return `url(#${id})`;
      };
      const H1 = hatch('s1', INK.inkSoft, 35, 0.35), H2 = hatch('s2', INK.inkSoft, -40, 0.3), HB = hatch('b', INK.blue, 38, 0.7);
      const patches = list.map((pd, i) => {
        const tone = TONES[(pd.tone ?? i) % TONES.length], pts = PXs(pd.poly);
        const baseE = el(pg, 'path', { fill: INK[tone.f], 'fill-opacity': tone.fo, stroke: 'none' });
        const hatE = tone.hatch ? el(pg, 'path', { fill: tone.hatch === 1 ? H1 : H2, stroke: 'none' }) : null;
        const tintE = el(pg, 'path', { fill: INK.blue, 'fill-opacity': 0, stroke: 'none' });
        const blueE = el(pg, 'path', { fill: HB, 'fill-opacity': 0, stroke: 'none' });
        const lab = pd.label ? PX(pd.label) : PX(centroid(pd.poly));
        const home = pd.home ? PX(pd.home) : [lab[0], lab[1] + 30];
        return { pd, pts, baseE, hatE, tintE, blueE, lab, home, i };
      });
      const bordG = el(pg, 'g'), paintBord = painter(bordG);
      const coastE = inkEl(mg, INK.inkSoft);
      const trailG = el(mg, 'g');
      const tentG = el(mg, 'g'), paintTent = painter(tentG);
      const labG = el(mg, 'g');
      const beyG = el(mg, 'g');
      const frameE = inkEl(cam, INK.inkSoft);
      const pById = {}; patches.forEach(p => { pById[p.pd.id] = p; });
      const labs = patches.filter(p => names.includes(p.pd.id)).map(p => {
        const t = el(labG, 'text', { 'font-family': INK_FONT, 'font-size': p.pd.size || (portrait ? 44 : 50), 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 9px; stroke-linejoin: round` });
        t.textContent = p.pd.name;
        return { p, t };
      });
      // timing tables
      const takenAll = P.taken === 'all' || (P.taken == null && (P.restore || P.exile));
      const taken0 = new Set(takenAll ? list.map(p => p.id) : (P.taken || []));
      if (own) taken0.add(own);
      const takeAt = {};   // id -> {at, dur}
      const TK = P.take;
      const takeSeq = [];
      if (Array.isArray(TK)) TK.forEach(o => takeSeq.push({ id: o.id, at: o.at, dur: o.dur || 0.7 }));
      else if (TK) {
        const ids = TK.ids || others.map(p => p.id);
        ids.forEach((id, j) => takeSeq.push({ id, at: { base: TK.at, off: j * (TK.gap ?? 0.4) }, dur: TK.dur || 0.7 }));
      }
      const tentP = P.tent === false ? null : (P.tent || ((P.exile || P.restore) ? {} : null));
      const tentPos = tentP ? PX([tentP.lon ?? 38.4, tentP.lat ?? 39.4]) : null;
      const tentCol = tentP ? colOf(tentP.color, INK.red) : INK.red;
      const EX = P.exile, RS = P.restore;
      const beyIds = EX ? (EX.ids || others.map(p => p.id)) : RS ? (RS.ids || others.map(p => p.id)) : [];
      const beys = beyIds.map((id, j) => {
        const p = pById[id]; if (!p || !tentPos) return null;
        const g = el(beyG, 'g'), tr = el(trailG, 'path', { fill: 'none', stroke: INK.inkSoft, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '12 12' });
        // door slot: a small crowd around the tent door (two rows)
        const row = j % 2, col = Math.floor(j / 2), ts0 = (tentP.scale || 1.25) * (portrait ? 0.75 : 1);
        const door = [tentPos[0] - (110 + col * 38 + row * 18) * ts0, tentPos[1] + (4 + row * 28) * ts0];
        const a = p.home, b = door, mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 70 - (j % 3) * 20];
        const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mid[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * mid[1] + u * u * b[1]]); }
        return { id, p, g, paint: painter(g), tr, pts, j };
      }).filter(Boolean);
      // narrator
      const kg = el(root, 'g'), groundE = inkEl(kg, INK.inkSoft);
      const rig = K0 ? KASIF.create(el(kg, 'g'), { scale: K0.scale, hat: true, seed: seed + 5 }) : null;
      // note
      let note = null;
      if (P.note) {
        const N = P.note, g = el(cam, 'g'), box = inkEl(g, INK.paperLight), boxR = inkEl(g);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 58, 'text-anchor': 'start', fill: colOf(N.color, INK.red) });
        t.textContent = N.text;
        note = { N, g, box, boxR, t, tw: null };
      }
      const resolveAt = (a, cues, fb) => (a && typeof a === 'object') ? tc(a.base, cues, fb) + a.off : tc(a, cues, fb);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // camera: settle-in, slow push, optional pan east, punch on hit
          const C = P.cam || {}, pin = spring(lt, 0, 0.7);
          const hitAt = tc(P.hit, cues, EX ? tc(EX.hit, cues, null) : null);
          const z = (C.zoom || 1.04), push = lerp(1, z, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * punch(lt, hitAt, 0.6));
          const fx = (C.focus || [0.5, 0.5])[0] * W, fy = (C.focus || [0.5, 0.5])[1] * H, pan = (C.pan || 0) * progIO(lt, 0.3, Math.max(1, dur - 0.3));
          cam.setAttribute('transform', `translate(${f1(-pan + Math.sin(t * 0.3) * 4)} ${f1((1 - pin) * 50 + Math.cos(t * 0.25) * 3)}) translate(${f1(fx)} ${f1(fy)}) scale(${f1(push * 1000) / 1000}) translate(${f1(-fx)} ${f1(-fy)}) rotate(${f1((1 - pin) * -2 - 0.3)} ${W / 2} ${H / 2})`);
          // sheet
          const sp = [[S.x, S.y], [S.x + S.w, S.y + 2], [S.x + S.w - 2, S.y + S.h], [S.x + 2, S.y + S.h - 2]];
          sheetSh.setAttribute('d', inkLoop(sp.map(q => [q[0] + 10, q[1] + 12]), { seed: seed + 1, t, smooth: false }));
          sheetE.setAttribute('d', inkLoop(sp, { seed: seed + 2, t, smooth: false }));
          sheetR.setAttribute('d', inkPath(sp, { seed: seed + 2, t, w: 4, closed: true, smooth: false }));
          frameE.setAttribute('d', inkPath([[S.x + 18, S.y + 18], [S.x + S.w - 18, S.y + 18], [S.x + S.w - 18, S.y + S.h - 18], [S.x + 18, S.y + S.h - 18]], { seed: seed + 3, t, w: 2.5, closed: true, smooth: false }));
          // sea wave marks
          let wv = '';
          [[27.2, 41.7], [30.5, 42.2], [35.5, 42.25], [38.8, 41.8], [26.0, 36.6], [28.6, 35.9], [32.3, 35.7], [35.6, 35.9], [25.6, 37.4]].forEach(([lo, la], i) => {
            const c = PX([lo, la]), pts = []; for (let j = 0; j <= 6; j++) pts.push([c[0] - 34 + j * 11, c[1] + Math.sin(j * 1.6 + t * 1.6 + i) * 5]);
            wv += inkPath(pts, { seed: seed * 23 + i, t, w: 3, amp: 0.8 }) + ' ';
          });
          seaE.setAttribute('d', wv);
          landE.setAttribute('d', inkLoop(landPts, { seed: seed * 13, t, amp: 1, smooth: false }) + ' ' + inkLoop(thrPts, { seed: seed * 13 + 1, t, amp: 1, smooth: false }));
          coastE.setAttribute('d', inkPath(landPts, { seed: seed * 13, t, w: 4.5, closed: true, amp: 1.2 }) + ' ' + inkPath(thrPts, { seed: seed * 13 + 1, t, w: 4, closed: true, amp: 1.2 })
            + ' ' + ISLES.map((is, i) => inkPath(PXs(is), { seed: seed * 17 + i, t, w: 3.5, closed: true })).join(' '));
          // blue amount per patch
          const k = {}, pk = {};
          patches.forEach(p => { k[p.pd.id] = taken0.has(p.pd.id) ? 1 : 0; pk[p.pd.id] = 0; });
          takeSeq.forEach(o => { const a = resolveAt(o.at, cues, 0.5); k[o.id] = Math.max(k[o.id] || 0, progIO(lt, a, o.dur)); pk[o.id] = Math.max(pk[o.id] || 0, punch(lt, a, 0.6)); });
          // beys
          const rsAt = RS ? tc(RS.at, cues, 0.6) : 0, rsDur = RS ? (RS.dur || 2.2) : 0;
          const exAt = EX ? tc(EX.at, cues, 0.6) : 0, exHit = EX ? tc(EX.hit, cues, exAt + 2.4) : 0;
          beys.forEach(b => {
            let u, walking, a0, d;
            if (EX) { a0 = exAt + b.j * (EX.gap ?? 0.12); d = Math.max(1.0, exHit - 0.15 - a0); u = progIO(lt, a0, d); }
            else { a0 = rsAt + b.j * (RS.gap ?? 0.14); d = rsDur; u = 1 - progIO(lt, a0, d); }
            walking = lt > a0 && lt < a0 + d;
            if (RS) { const arr = a0 + d; k[b.id] = Math.min(k[b.id], 1 - prog(lt, arr - 0.25, 0.6)); pk[b.id] = Math.max(pk[b.id], punch(lt, arr - 0.1, 0.6)); }
            const q = sub(b.pts, u), pos = q[q.length - 1];
            const fc = EX ? (b.pts[b.pts.length - 1][0] >= b.pts[0][0] ? 1 : -1) : (b.pts[0][0] >= b.pts[b.pts.length - 1][0] ? 1 : -1);
            const show = EX ? lt >= a0 - 0.6 : true;
            b.g.style.display = show ? '' : 'none';
            const sIn = EX ? spring(lt, a0 - 0.6, 0.5) : 1, s = (portrait ? 0.7 : 0.95) * sIn;
            const atRest = EX ? u >= 1 : u <= 0;
            const wave = !walking && atRest && RS;   // home again: waves
            b.g.setAttribute('transform', `translate(${f1(pos[0])} ${f1(pos[1])}) scale(${f1(fc * s * 1000) / 1000} ${f1(s * 1000) / 1000})`);
            b.paint(beyStrokes(t, lt * 1.6 + b.j * 0.3, walking, wave && lt > a0 + d + 0.2), t, seed * 100 + b.j * 20);
            // dashed trail behind the walker
            const trail = EX ? sub(b.pts, u) : b.pts.slice(Math.round(u * 24)).reverse();
            const showTrail = EX ? (lt > a0) : (lt > a0 && u > 0.02);
            b.tr.setAttribute('d', showTrail && trail.length > 1 ? 'M' + trail.map(q2 => `${f1(q2[0])} ${f1(q2[1] - 4)}`).join(' L') : '');
            b.tr.setAttribute('stroke-dashoffset', f1(-t * 10));
          });
          // patches
          const bord = [];
          patches.forEach(p => {
            const kk = k[p.pd.id] || 0, d = inkLoop(p.pts, { seed: seed * 31 + p.i, t, amp: 1, smooth: false });
            p.baseE.setAttribute('d', d); if (p.hatE) p.hatE.setAttribute('d', d);
            p.tintE.setAttribute('d', d); p.blueE.setAttribute('d', d);
            p.tintE.setAttribute('fill-opacity', f1(0.16 * kk * 1000) / 1000);
            p.blueE.setAttribute('fill-opacity', f1(kk * 1000) / 1000);
            bord.push({ p: p.pts, c: 1, w: 3, col: INK.inkSoft, o: 1 - kk * 0.8, sm: 0 });
            if (kk > 0.02) bord.push({ p: p.pts, c: 1, w: 3 + 3 * kk, col: INK.blue, o: kk, sm: 0 });
          });
          paintBord(bord, t, seed * 41);
          labs.forEach(({ p, t: te }) => {
            const s = 1 + 0.16 * (pk[p.pd.id] || 0);
            te.setAttribute('transform', `translate(${f1(p.lab[0])} ${f1(p.lab[1])}) rotate(-3) scale(${f1(s * 1000) / 1000})`);
          });
          // tent
          if (tentP) {
            const ta = tc(tentP.at, cues, -1), s2 = ta < 0 ? 1 : spring(lt, ta, 0.6);
            const la = P.tent_leave ? tc(P.tent_leave.at, cues, null) : null, lp = la == null ? 0 : progIO(lt, la, P.tent_leave.dur || 1.4);
            const ts = (tentP.scale || 1.25) * (portrait ? 0.75 : 1) * lerp(0.3, 1, s2) * (1 + 0.18 * punch(lt, hitAt, 0.6));
            tentG.style.display = (ta < 0 || lt >= ta) ? '' : 'none';
            tentG.setAttribute('transform', `translate(${f1(tentPos[0] + lp * 420)} ${f1(tentPos[1])}) scale(${f1(ts * 1000) / 1000})`);
            paintTent(tentStrokes(t, tentCol), t, seed * 53);
          }
          // note
          if (note) {
            const N = note.N, at = tc(N.at, cues, Math.max(0.8, dur * 0.5)), s2 = spring(lt, at, 0.6);
            if (note.tw == null) { try { note.tw = note.t.getComputedTextLength(); } catch (e) { note.tw = 0; } if (!note.tw) note.tw = (N.size || 58) * N.text.length * 0.42; }
            note.g.style.display = lt >= at ? '' : 'none';
            const nx = S.x + (N.x ?? 0.05) * S.w, ny = S.y + (N.y ?? 0.13) * S.h, fs = N.size || 58;
            note.t.setAttribute('x', nx + 24); note.t.setAttribute('y', ny);
            const bp = [[nx, ny - fs * 0.95], [nx + note.tw + 48, ny - fs * 0.95 - 2], [nx + note.tw + 50, ny + fs * 0.4], [nx + 1, ny + fs * 0.42]];
            note.box.setAttribute('d', inkLoop(bp, { seed: seed + 61, t, smooth: false }));
            note.boxR.setAttribute('d', inkPath(bp, { seed: seed + 61, t, w: 3.5, closed: true, smooth: false }));
            note.g.setAttribute('transform', `rotate(${f1(-2 + (1 - s2) * -6)} ${f1(nx)} ${f1(ny)}) translate(${f1(nx * (1 - lerp(0.7, 1, s2)))} ${f1(ny * (1 - lerp(0.7, 1, s2)))}) scale(${f1(lerp(0.7, 1, s2) * 1000) / 1000})`);
          }
          // narrator
          if (rig) {
            const kx = K0.x * W, ky = K0.y, shY = ky - 330 * K0.scale;
            const segs = [{ at: -1, pose: K0.pose, dir: K0.dir, face: K0.face, emotion: K0.emotion }];
            (K0.seq || []).forEach(s => { const a = tc(s.at, cues, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            let s = segs[i]; const pv = i > 0 ? segs[i - 1] : null;
            let since = lt - Math.max(0, s.at);
            const dirOf = (d, face) => {
              if (d === 'tent' && tentPos) { const dx = Math.abs(tentPos[0] - kx), dy = shY - (tentPos[1] - 80); return Math.atan2(dy, dx) * 180 / Math.PI; }
              return typeof d === 'number' ? d : DIRS[d] ?? 12;
            };
            let pose = s.pose || 'idle', dir = dirOf(s.dir ?? K0.dir), face = faceOf(s.face ?? K0.face, -1), emo = s.emotion || (pose === 'shock' ? 'surprised' : K0.emotion || null);
            // track the patch being taken
            if (K0.track !== false && takeSeq.length) {
              const ts = takeSeq.map(o => ({ o, a: resolveAt(o.at, cues, 0.5) }));
              const first = ts[0].a, last = ts[ts.length - 1].a + 0.6;
              if (lt >= first && lt < last) {
                let cur = ts[0]; ts.forEach(x => { if (lt >= x.a) cur = x; });
                const p = pById[cur.o.id];
                if (p) {
                  const dx = Math.abs(p.lab[0] - kx), dy = shY - p.lab[1];
                  pose = 'point'; dir = Math.atan2(dy, dx) * 180 / Math.PI; face = p.lab[0] < kx ? -1 : 1; since = lt - cur.a; emo = 'surprised';
                }
              }
            }
            const o = { x: kx, y: ky, face, since, dir, emotion: emo, mouth: 0 };
            if (pv && since < 0.35 && pose === s.pose) { o.prev = { pose: pv.pose || 'idle', since: since + 1, dir: dirOf(pv.dir ?? K0.dir), emotion: pv.emotion }; o.mix = since / 0.35; }
            groundE.setAttribute('d', inkPath([[kx - 150 * K0.scale / 0.75, ky + 4], [kx, ky + 7], [kx + 150 * K0.scale / 0.75, ky + 3]], { seed: seed + 71, t, w: 5 }));
            rig.update(t, pose, o);
          }
        },
      };
    },
  };
})();
