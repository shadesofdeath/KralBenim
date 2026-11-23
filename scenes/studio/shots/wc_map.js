// wc_map — a painted watercolour map: real Natural Earth coastlines (wc_world.js), the sea as a pale wash with a
// darker band along the shore, the land as layered washes (tinted by climate) with a pooled darker edge, an ink
// coastline that paints itself in, mountain hatching on the main ranges, serif sea names; then the story on top:
// places (cities, battles, ships), routes that grow as brush lines, empires spreading as washes, a slow zoom.
// The land is baked once per framing; per frame only what moves is drawn.
// params:
//   region: "turkey"|"anatolia"|"istanbul"|"aegean"|"balkans"|"mediterranean"|"europe"|"middle_east"|"egypt"|
//           "north_africa"|"black_sea"|"caucasus"|"central_asia"|"russia"|"asia"|"east_asia"|"india"|"americas"|
//           "north_america"|"south_america"|"atlantic"|"pacific"|"australia"|"arctic"|"antarctica"|"world"
//           | [lon0, lat0, lon1, lat1]  the area that must be in the picture (the map continues around it);
//           default "mediterranean". Projection: equirectangular scaled by cos(mid-latitude); "world" Mercator;
//           "arctic"/"antarctica" polar. Vertical Shorts frame the region in y 170–1110 and the painted map runs on
//           under the subtitles (a light paper veil behind them) down to y ≈ 1750; labels never sit in y 1162–1330.
//           Long videos: the region above the subtitles, the map fading out under them.
//   paint: seconds for the map to paint itself in (bloom from the centre, then the ink coast) · 0 = already painted (default 1.8)
//   places: [{name, lon, lat, at, kind: "city"|"battle" (crossed swords)|"ship"|"x"|"star"|"none",
//             align: "right"|"left"|"above"|"below", size, color: "red"|"ink"}]   a marker + a hand-written name
//   routes: [{points: [[lon, lat], ...], at, dur, color: "red"|"ink"|"blue", dashed, arrow (default true),
//             ship: true (a ship rides the tip), width}]   a brush line growing along a smooth curve
//   areas:  [{countries: ["TUR", "Greece", ...] (ISO3 or English name) | poly: [[lon, lat], ...], color: token
//             (default "red"), alpha (.42), at, dur (2.4), from: [lon, lat] (where the wash spreads from),
//             label, label_at: [lon, lat], label_size}]   a wash spreading over the land (an empire's extent)
//   labels: [{text, lon, lat, size, italic, caps, color: token, at, spacing}]   serif names (regions, cities)
//   seas:   [{text, lon, lat, size, curve (radians of arc, default .18), at}]  italic serif sea names, written in
//   zoom:   {to: region | [lon0, lat0, lon1, lat1], at, dur (3)}   a slow move (zoom and/or pan) from the first
//           framing to the second; it starts after the paint-in
//   mountains: true|false (painted hills on the main ranges, default true) · grid: true|false (faint graticule; default
//   on for ocean/continent views) · borders: true (faint modern borders) · sea: "wash"|"paper" · land: colour token
// times (at): seconds | cue name | {cue, d}. Text comes from the writer in the script's language (caps via LOCALE).
// Data: 1:50m land/countries for wide views, 1:10m land for close ones (> 55 px per degree; the 1:50m countries are
// grown to the finer coast there); the Golden Horn is hand-traced (too narrow for 1:10m). Labels are kept inside the
// picture; a place name flips side at the frame edge.
'use strict';

(() => {
  const C = WC.C, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const { clamp, seg, ss, eio, eo, mix, vnoise, fbm, hash } = WC;
  const mkCanvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };

  // ------------------------------------------------------------ data (wc_world.js), decoded once per page
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const DEC = new Int8Array(128).fill(0); for (let i = 0; i < 64; i++) DEC[B64.charCodeAt(i)] = i;
  function decodePts(s, q) {
    const out = []; let x = 0, y = 0, i = 0, vx = 0, odd = false;
    while (i < s.length) {
      let z = 0, sh = 1, c;
      do { c = DEC[s.charCodeAt(i++)]; z += (c & 31) * sh; sh *= 32; } while (c & 32);
      const v = z % 2 ? -(z + 1) / 2 : z / 2;
      if (!odd) { vx = v; odd = true; } else { x += vx; y += v; out.push([x / q, y / q]); odd = false; }
    }
    return out;
  }
  // the data keeps the sphere's habit of jumping from 180° to -180°: unwrap a ring so it runs on (Chukotka at 190°,
  // Fiji across the date line); a ring that goes once around a pole (Antarctica) is closed through the pole
  function unwrapRing(r) {
    const n0 = r.length, closed = n0 > 1 && r[0][0] === r[n0 - 1][0] && r[0][1] === r[n0 - 1][1];
    const pts = closed ? r.slice(0, -1) : r;
    if (pts.length < 3) return pts.slice();
    let off = 0, lat = 0, jumps = false;
    const out = [[pts[0][0], pts[0][1]]];
    for (let k = 1; k < pts.length; k++) {
      const d = pts[k][0] - pts[k - 1][0];
      if (d > 180) { off -= 360; jumps = true; } else if (d < -180) { off += 360; jumps = true; }
      out.push([pts[k][0] + off, pts[k][1]]); lat += pts[k][1];
    }
    if (!jumps) return pts.slice();
    const d = pts[0][0] - pts[pts.length - 1][0];
    if (d > 180) off -= 360; else if (d < -180) off += 360;
    if (off) { const pole = lat < 0 ? -90 : 90, a = pts[0][0]; out.push([a + off, pts[0][1]], [a + off, pole], [a, pole]); }
    return out;
  }
  function withBB(r) {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const p of r) { if (p[0] < a) a = p[0]; if (p[1] < b) b = p[1]; if (p[0] > c) c = p[0]; if (p[1] > d) d = p[1]; }
    r.bb = [a, b, c, d]; return r;
  }
  // a few names writers may use (Turkish and common English forms) -> ISO3
  const ALIAS = {
    'türkiye': 'TUR', 'turkiye': 'TUR', 'yunanistan': 'GRC', 'bulgaristan': 'BGR', 'mısır': 'EGY', 'misir': 'EGY', 'suriye': 'SYR',
    'irak': 'IRQ', 'iran': 'IRN', 'gürcistan': 'GEO', 'ermenistan': 'ARM', 'azerbaycan': 'AZE', 'rusya': 'RUS', 'ukrayna': 'UKR',
    'romanya': 'ROU', 'macaristan': 'HUN', 'sırbistan': 'SRB', 'arnavutluk': 'ALB', 'kıbrıs': 'CYP', 'lübnan': 'LBN', 'israil': 'ISR',
    'ürdün': 'JOR', 'suudi arabistan': 'SAU', 'libya': 'LBY', 'tunus': 'TUN', 'cezayir': 'DZA', 'fas': 'MAR', 'italya': 'ITA',
    'ispanya': 'ESP', 'fransa': 'FRA', 'almanya': 'DEU', 'avusturya': 'AUT', 'ingiltere': 'GBR', 'birleşik krallık': 'GBR',
    'hırvatistan': 'HRV', 'bosna hersek': 'BIH', 'karadağ': 'MNE', 'kuzey makedonya': 'MKD', 'makedonya': 'MKD', 'polonya': 'POL',
    'çin': 'CHN', 'hindistan': 'IND', 'japonya': 'JPN', 'moğolistan': 'MNG', 'kazakistan': 'KAZ', 'özbekistan': 'UZB',
    'türkmenistan': 'TKM', 'kırgızistan': 'KGZ', 'tacikistan': 'TJK', 'afganistan': 'AFG', 'abd': 'USA', 'amerika': 'USA',
    'kanada': 'CAN', 'meksika': 'MEX', 'brezilya': 'BRA', 'arjantin': 'ARG', 'avustralya': 'AUS', 'portekiz': 'PRT', 'slovakya': 'SVK',
    'slovenya': 'SVN', 'çekya': 'CZE', 'kosova': 'XKX', 'moldova': 'MDA', 'yemen': 'YEM', 'umman': 'OMN', 'kuveyt': 'KWT', 'katar': 'QAT',
    'sudan': 'SDN', 'etiyopya': 'ETH', 'somali': 'SOM', 'eritre': 'ERI', 'filistin': 'PSE', 'malta': 'MLT', 'usa': 'USA', 'uk': 'GBR',
    'united states': 'USA', 'russia': 'RUS', 'kosovo': 'XKX', 'northern cyprus': 'CYN', 'kktc': 'CYN',
  };
  let WD = null;
  function world() {
    if (WD) return WD;
    const R = window.WC_WORLD;
    if (!R) throw new Error('wc_map: WC_WORLD (scenes/studio/shots/wc_world.js) is missing');
    const arcs = R.arcs.split('|').map(s => decodePts(s, R.q));
    const ring = refs => {
      const out = [];
      refs.forEach((r, k) => { const a = r >= 0 ? arcs[r] : arcs[~r].slice().reverse(); for (let i = k ? 1 : 0; i < a.length; i++) out.push(a[i]); });
      return withBB(unwrapRing(out));
    };
    const alias = Object.assign({}, ALIAS);
    for (const [k, n] of Object.entries(R.names)) { alias[k.toLowerCase()] = k; alias[n.toLowerCase()] = k; }
    const flat = r => r.bb[3] - r.bb[1] < .01;           // degenerate rings along a pole line
    WD = { R, ring, alias, land: R.land.map(ring).filter(r => !flat(r)), countries: {}, detail: null };
    return WD;
  }
  function countryRings(name) {
    const w = world(), raw = String(name), key = w.R.countries[raw] ? raw : w.alias[raw.toLocaleLowerCase('tr-TR')] || w.alias[raw.toLowerCase()];
    if (!key || !w.R.countries[key]) { console.warn('wc_map: unknown country "' + name + '"'); return []; }
    return w.countries[key] || (w.countries[key] = w.R.countries[key].map(w.ring));
  }
  function detailRings() {
    const w = world();
    if (!w.detail) w.detail = w.R.detail.rings.split('|').map(s => withBB(unwrapRing(decodePts(s, w.R.detail.q)))).filter(r => r.bb[3] - r.bb[1] >= .005 || r.bb[2] - r.bb[0] >= .005);
    return w.detail;
  }

  // ------------------------------------------------------------ regions + projections
  const REG = {
    turkey: [25.6, 35.7, 44.8, 42.2], anatolia: [26.0, 35.9, 38.6, 42.2], istanbul: [28.74, 40.93, 29.26, 41.24],
    aegean: [22.2, 35.1, 28.6, 41.1], balkans: [13.5, 36.6, 30.0, 47.6], mediterranean: [-6.0, 30.0, 36.5, 46.2],
    europe: [-11.0, 35.0, 42.0, 62.0], middle_east: [26.0, 12.5, 63.0, 42.0], egypt: [24.5, 21.8, 36.5, 32.2],
    north_africa: [-17.5, 18.0, 35.0, 38.0], black_sea: [26.8, 40.2, 42.0, 47.2], caucasus: [36.5, 38.6, 51.0, 45.4],
    central_asia: [46.0, 34.0, 88.0, 52.0], russia: { bb: [26.0, 41.0, 180.0, 78.0], grid: true }, asia: { bb: [25.0, -10.0, 150.0, 60.0], grid: true },
    east_asia: [96.0, 18.0, 146.0, 50.0], india: [66.0, 6.0, 92.5, 36.0], americas: { bb: [-168.0, -56.0, -32.0, 72.0], grid: true },
    north_america: { bb: [-168.0, 14.0, -52.0, 72.0], grid: true }, south_america: { bb: [-82.0, -56.0, -34.0, 13.0], grid: true },
    atlantic: { bb: [-82.0, 5.0, 12.0, 58.0], grid: true }, pacific: { bb: [118.0, -48.0, 292.0, 62.0], grid: true },
    australia: [111.0, -44.5, 155.0, -9.5], arctic: { proj: 'npole', r: 36, grid: true }, antarctica: { proj: 'spole', r: 32, grid: true },
    world: { bb: [-180.0, -56.0, 180.0, 78.0], proj: 'merc', grid: true },
  };
  function regionOf(v) {
    if (Array.isArray(v) && v.length === 4) return { bb: v };
    if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    const r = REG[v] || REG.mediterranean;
    return Array.isArray(r) ? { bb: r } : r;
  }
  const mercY = lat => R2D * Math.log(Math.tan(Math.PI / 4 + clamp(lat, -85, 85) * D2R / 2));
  function makeProj(reg) {
    const kind = reg.proj || 'eq';
    if (kind === 'merc') return { kind, f: (lon, lat) => [lon, -mercY(lat)], lat: (x, y) => R2D * (2 * Math.atan(Math.exp(-y * D2R)) - Math.PI / 2), period: 360 };
    if (kind === 'npole') return { kind, f: (lon, lat) => { const r = 90 - lat, a = lon * D2R; return [r * Math.sin(a), r * Math.cos(a)]; }, lat: (x, y) => 90 - Math.hypot(x, y), period: 0 };
    if (kind === 'spole') return { kind, f: (lon, lat) => { const r = 90 + lat, a = lon * D2R; return [r * Math.sin(a), -r * Math.cos(a)]; }, lat: (x, y) => Math.hypot(x, y) - 90, period: 0 };
    const phi = reg.bb ? (reg.bb[1] + reg.bb[3]) / 2 : 40, c = Math.cos(phi * D2R);
    return { kind: 'eq', f: (lon, lat) => [lon * c, -lat], lat: (x, y) => -y, period: 360 * c };
  }
  function projBB(proj, reg) {
    if (reg.r) return [-reg.r, -reg.r, reg.r, reg.r];
    const [a, b, c, d] = reg.bb; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
      if (i && j && i < 8 && j < 8) continue;
      const [x, y] = proj.f(a + (c - a) * i / 8, b + (d - b) * j / 8);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return [x0, y0, x1, y1];
  }

  // ------------------------------------------------------------ mountain ranges (hand-traced ridge lines, lon/lat)
  const RANGES = [
    [[6.0, 44.2], [7.0, 45.9], [8.5, 46.4], [10.5, 46.5], [12.5, 47.0], [14.5, 47.3], [16.0, 47.6]],            // Alps
    [[-1.8, 43.0], [0.5, 42.7], [2.8, 42.5]],                                                                   // Pyrenees
    [[-6.8, 43.0], [-4.5, 43.05], [-2.5, 43.0]],                                                                // Cantabrian
    [[-5.0, 36.9], [-3.3, 37.1], [-1.5, 37.9]],                                                                 // Baetic
    [[8.6, 44.4], [10.5, 44.2], [12.5, 43.2], [13.6, 42.3], [15.0, 41.0], [16.0, 39.8]],                        // Apennines
    [[14.6, 45.4], [16.5, 44.0], [18.5, 43.0], [20.0, 42.1]],                                                   // Dinaric Alps
    [[22.6, 43.4], [24.5, 42.8], [26.5, 42.75], [27.5, 42.7]],                                                  // Balkan Mts
    [[23.6, 41.8], [25.0, 41.6]],                                                                               // Rhodopes
    [[20.6, 40.6], [21.3, 39.5], [21.8, 38.8]],                                                                 // Pindus
    [[17.6, 48.6], [19.5, 49.3], [22.5, 49.0], [24.5, 48.0], [25.8, 46.6], [25.4, 45.5], [23.5, 45.4], [22.2, 45.0]], // Carpathians
    [[37.8, 44.4], [40.0, 43.4], [42.5, 42.9], [44.5, 42.6], [46.5, 41.8], [48.6, 41.1]],                       // Caucasus
    [[31.6, 41.0], [34.0, 41.2], [36.5, 40.8], [39.0, 40.6], [41.5, 40.9], [42.6, 41.1]],                       // Pontic Mts
    [[29.4, 36.9], [31.5, 37.15], [33.0, 37.05], [35.0, 37.4], [36.5, 37.8], [38.5, 38.3], [40.5, 38.6], [42.5, 38.4], [44.0, 38.0]], // Taurus
    [[45.0, 36.8], [46.5, 35.0], [48.0, 33.5], [50.0, 31.5], [52.0, 29.8], [54.5, 28.2], [56.5, 27.5]],         // Zagros
    [[48.6, 37.6], [51.0, 36.3], [53.5, 36.4], [56.0, 37.2]],                                                   // Alborz
    [[35.7, 33.5], [36.3, 34.5]],                                                                               // Lebanon
    [[-9.5, 30.6], [-7.0, 31.3], [-4.5, 32.6], [-1.0, 33.5], [2.5, 34.5], [5.5, 35.3], [8.5, 35.8]],            // Atlas
    [[37.6, 13.5], [38.5, 11.0], [39.5, 9.0], [39.0, 7.0]],                                                     // Ethiopian Highlands
    [[59.0, 51.5], [59.5, 55.0], [59.5, 58.5], [60.0, 62.0], [61.0, 65.0], [64.0, 67.5]],                       // Urals
    [[73.5, 35.5], [76.0, 34.0], [78.5, 32.0], [81.0, 30.0], [84.0, 28.5], [87.0, 27.9], [89.5, 27.8], [92.0, 27.8], [95.0, 28.8]], // Himalaya
    [[67.5, 34.5], [70.0, 35.5], [72.5, 36.2], [74.0, 36.5]],                                                   // Hindu Kush
    [[69.5, 41.5], [73.0, 42.0], [77.0, 42.0], [80.0, 42.2], [84.0, 43.0], [88.0, 43.2], [93.0, 43.5]],         // Tian Shan
    [[84.5, 50.5], [87.0, 49.5], [90.0, 48.5], [94.0, 46.5], [97.0, 45.5]],                                     // Altai
    [[75.5, 36.5], [80.0, 36.0], [85.0, 35.8], [90.0, 36.0], [95.0, 35.8], [99.0, 35.0]],                       // Kunlun
    [[6.5, 59.0], [8.5, 61.5], [12.0, 63.5], [14.5, 65.5], [17.0, 67.5], [20.0, 69.0]],                         // Scandinavian Mts
    [[-122.0, 57.0], [-117.5, 52.0], [-114.5, 48.5], [-111.0, 45.0], [-108.5, 42.0], [-106.0, 39.0], [-106.0, 35.5], [-105.5, 33.0]], // Rockies
    [[-108.5, 30.0], [-105.5, 25.0], [-104.0, 21.5]],                                                           // Sierra Madre
    [[-85.5, 34.0], [-83.0, 35.6], [-80.5, 37.5], [-78.5, 39.5], [-76.0, 41.5], [-73.0, 43.5], [-70.5, 45.0]],  // Appalachians
    [[-75.0, 10.0], [-76.5, 5.0], [-78.0, 0.0], [-79.0, -5.0], [-76.5, -10.0], [-72.5, -14.5], [-69.0, -18.0], [-68.0, -23.0],
      [-69.5, -28.0], [-70.0, -33.0], [-71.0, -38.0], [-71.8, -43.0], [-73.0, -48.0], [-73.0, -51.5]],          // Andes
    [[146.0, -18.0], [148.5, -23.0], [151.0, -28.0], [150.5, -32.0], [149.0, -35.5], [147.0, -37.3]],           // Great Dividing Range
  ];

  // narrow waters too small for 1:10m, hand-traced: centre line [lon, lat] + width in degrees at the mouth and the end
  const WATERS = [
    { name: 'golden_horn', w0: .0062, w1: .0022, pts: [[28.996, 41.019], [28.984, 41.0205], [28.974, 41.0205], [28.963, 41.0255], [28.955, 41.0335],
      [28.947, 41.0395], [28.941, 41.046], [28.9355, 41.0525], [28.937, 41.0605], [28.943, 41.067]] },
  ];

  // ------------------------------------------------------------ helpers
  const tok = (v, fb) => (v && C[v]) ? C[v] : (v && v[0] === '#' ? v : fb);
  // 2D value noise (deterministic), 0..1
  const h2 = (i, j) => { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); };
  function noise2(x, y) {
    const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = h2(i, j), b = h2(i + 1, j), c = h2(i, j + 1), d = h2(i + 1, j + 1);
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  }
  function smoothLL(pts, it = 2) {                 // Chaikin, closed ring (lon/lat)
    let p = pts;
    for (let k = 0; k < it; k++) {
      const q = [];
      for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      p = q;
    }
    return withBB(p);
  }
  function catmull(P, per = 10) {                  // smooth open curve through screen points
    if (P.length < 3) return P.slice();
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const n = Math.max(2, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / per));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    out.push(P[P.length - 1]);
    return out;
  }
  // Sutherland-Hodgman clip of a closed screen ring (and its lon/lat twin) to a rectangle: off-screen parts of
  // big rings (Eurasia) collapse onto the rectangle, which lies outside the picture
  function clipRect(pts, ll, x0, y0, x1, y1) {
    let P = pts.map((p, i) => [p[0], p[1], ll[i]]);
    const edges = [[p => p[0] >= x0, (a, b) => { const t = (x0 - a[0]) / (b[0] - a[0]); return [x0, a[1] + (b[1] - a[1]) * t]; }],
      [p => p[0] <= x1, (a, b) => { const t = (x1 - a[0]) / (b[0] - a[0]); return [x1, a[1] + (b[1] - a[1]) * t]; }],
      [p => p[1] >= y0, (a, b) => { const t = (y0 - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * t, y0]; }],
      [p => p[1] <= y1, (a, b) => { const t = (y1 - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * t, y1]; }]];
    for (const [inside, cut] of edges) {
      if (!P.length) break;
      const inp = P; P = [];
      for (let i = 0; i < inp.length; i++) {
        const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
        if (inside(cur)) { if (!inside(prev)) P.push(cut(prev, cur).concat([[0, 0]])); P.push(cur); }
        else if (inside(prev)) P.push(cut(prev, cur).concat([[0, 0]]));
      }
    }
    return { pts: P.map(p => [p[0], p[1]]), ll: P.map(p => p[2]) };
  }
  const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  // an irregular round path (a wash front): radius R, phase ph
  function blobPath(c, x, y, R, ph, amp = .1, n = 80) {
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, k = 1 + amp * (vnoise(ph + 2.4 * Math.cos(a) + 5) + vnoise(ph * 1.3 + 2.4 * Math.sin(a) + 11) - 1) * 2;
      const px = x + Math.cos(a) * R * k, py = y + Math.sin(a) * R * k;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
  }
  // climate tint of the land by latitude (a painter's suggestion, not data): ice, taiga, temperate, arid, tropics
  function climate(lat) {
    const a = Math.abs(lat);
    const ice = mixc2(C.sky, C.far, .35), boreal = mixc2(C.leafDark, C.far, .5), temp = mixc2(C.mid, C.leaf, .35),
      arid = mixc2(C.ground, C.skyWarm, .55), trop = mixc2(C.leaf, C.mid, .25);
    if (a > 66) return [ice, .5];
    if (a > 58) return [WC.mixc(boreal, ice, ss((a - 58) / 8)), .3];
    if (a > 46) return [WC.mixc(temp, boreal, ss((a - 46) / 12)), .26];
    if (a > 33) return [WC.mixc(arid, temp, ss((a - 30) / 9)), .24];
    if (a > 17) return [arid, .26];
    return [WC.mixc(trop, arid, ss((a - 9) / 8)), .24];
  }
  const mixc2 = (a, b, t) => WC.mixc(a, b, t);

  // ------------------------------------------------------------ the paper edge (shared by every map shot of a size)
  const OVL = {};
  function edgeOverlay(W, H) {
    const key = W + 'x' + H;
    if (OVL[key]) return OVL[key];
    const portrait = H > W, cv = mkCanvas(W, H), c = cv.getContext('2d'), pp = WC.paper();
    const bands = portrait
      // a Short: the map runs on under the subtitles and fades into the paper near the bottom; a light paper veil
      // (no box, soft edges) lies just behind the subtitle band so the captions stay readable over coast and ink
      ? [{ y0: 0, y1: 190, e: x => 92 + (fbm(x * .0042 + 3) - .5) * 80, f: 80, top: true },
        { y0: 1110, y1: H, e: x => 1770 + (fbm(x * .0036 + 11) - .5) * 90, f: 170, veil: y => .34 * ss(seg(y, 1128, 1196)) * (1 - ss(seg(y, 1296, 1372))) }]
      : [{ y0: 0, y1: 70, e: x => 18 + (fbm(x * .003 + 3) - .5) * 40, f: 40, top: true }, { y0: 790, y1: H, e: x => 895 + (fbm(x * .0025 + 11) - .5) * 60, f: 100 }];
    for (const b of bands) {
      const h = b.y1 - b.y0;
      if (pp) c.drawImage(pp, 0, b.y0, W, h, 0, b.y0, W, h); else { c.fillStyle = C.paper; c.fillRect(0, b.y0, W, h); }
      const im = c.getImageData(0, b.y0, W, h), d = im.data, E = new Float32Array(W);
      for (let x = 0; x < W; x++) E[x] = b.e(x);
      for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) {
        const yy = y + b.y0, grain = (noise2(x * .022, yy * .022) - .5) * 34 + (noise2(x * .09 + 50, yy * .09) - .5) * 12;
        let a = clamp((yy - (E[x] + grain - b.f / 2)) / b.f);
        a = b.top ? 1 - ss(a) : ss(a);
        if (b.veil) a = Math.max(a, b.veil(yy + grain * .4));
        d[(y * W + x) * 4 + 3] = Math.round(a * 255);
      }
      c.putImageData(im, 0, b.y0);
    }
    return (OVL[key] = cv);
  }

  // ------------------------------------------------------------ markers (local coords, origin = the place)
  function marker(kind, m, colour) {
    const S = [], red = C.red, ink = WC.mixc(C.ink, C.inkSoft, .15);
    if (kind === 'battle') {
      m *= 1.3;
      S.push(WC.washShape(WC.blobPts(0, 0, 22 * m, 20 * m, 18, .25), red, .32, 3, 2 * m));
      for (const s of [1, -1]) {
        const bc = colour === 'red' ? red : ink;
        S.push(WC.mk(WC.qcurve(-13 * m * s, 13 * m, 15 * m * s, -15 * m, 1.5 * m * s, 6), 4 * m, bc, { prof: 'tip', nb: 0, a: .92 }));
        S.push(WC.mk(WC.qcurve(-14 * m * s, 6 * m, -6 * m * s, 14 * m, 0, 4), 3 * m, bc, { prof: 'even', nb: 0, a: .9 }));
        S.push(WC.mk(WC.qcurve(-13 * m * s, 13 * m, -17 * m * s, 17 * m, 0, 3), 3.4 * m, bc, { prof: 'even', nb: 0, a: .9 }));
      }
    } else if (kind === 'ship') {
      S.push(WC.washShape([[-19 * m, -3 * m], [20 * m, -3 * m], [14 * m, 5 * m], [-14 * m, 5 * m]], C.wood, .85, 2, 1));
      S.push(WC.mk(WC.qcurve(-19 * m, -3 * m, 20 * m, -3 * m, -2 * m, 6), 2.2 * m, C.ink, { prof: 'even', nb: 0, a: .8 }));
      S.push(WC.mk(WC.qcurve(1 * m, -3 * m, 1 * m, -36 * m, 0, 5), 2.2 * m, C.ink, { prof: 'even', nb: 0, a: .85 }));
      S.push(WC.washShape([[3 * m, -33 * m], [17 * m, -12 * m], [3 * m, -8 * m]], C.paperLight, .95, 2, 1));
      S.push(WC.washShape([[-1 * m, -30 * m], [-14 * m, -10 * m], [-1 * m, -7 * m]], WC.mixc(C.paperDark, C.paperLight, .3), .95, 2, 1));
      S.push(...WC.inkLine([[3 * m, -33 * m], [17 * m, -12 * m], [3 * m, -8 * m]], 1.4 * m, C.ink, { step: 2, a: .6 }));
      S.push(WC.mk(WC.qcurve(1 * m, -36 * m, 9 * m, -34 * m, 1, 3), 3 * m, red, { prof: 'tip', nb: 0, a: .9 }));
    } else if (kind === 'x') {
      S.push(WC.mk(WC.qcurve(-12 * m, -12 * m, 12 * m, 12 * m, 2 * m, 6), 6 * m, red, { prof: 'brush', nb: 3, a: .9 }));
      S.push(WC.mk(WC.qcurve(12 * m, -12 * m, -12 * m, 12 * m, -2 * m, 6), 6 * m, red, { prof: 'brush', nb: 3, a: .9 }));
    } else if (kind === 'star') {
      const P = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = (i % 2 ? 6.5 : 16) * m; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
      S.push(WC.washShape(P, colour === 'red' ? red : C.gold, .9, 3, 1));
      S.push(...WC.inkLine(P.concat([P[0]]), 1.6 * m, C.ink, { step: 2, a: .7 }));
    }
    return S;
  }

  // ------------------------------------------------------------ the shot
  SHOTS.wc_map = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const m = portrait ? 1.25 : 1;                                     // marker / text scale
      const FR = portrait ? { x0: 50, y0: 170, x1: 1030, y1: 1110 } : { x0: 70, y0: 60, x1: 1850, y1: 850 };
      const FX = (FR.x0 + FR.x1) / 2, FY = (FR.y0 + FR.y1) / 2;
      const reg0 = regionOf(P.region || 'mediterranean'), proj = makeProj(reg0);
      // a framing that fits the region into the picture; a wide region in a tall Short would show "sea" beyond the
      // poles, so the framing slides back to ±88° latitude (Mercator ±84°) when it can
      const fit = reg => {
        const [x0, y0, x1, y1] = projBB(proj, reg), k = Math.min((FR.x1 - FR.x0) / (x1 - x0), (FR.y1 - FR.y0) / (y1 - y0));
        let cy = (y0 + y1) / 2;
        if (proj.period) {
          const lim = proj.kind === 'merc' ? mercY(84) : 88, top = portrait ? 70 : 10, bot = portrait ? 1760 : 900;
          const lo = -lim - (top - FY) / k, hi = lim - (bot - FY) / k;
          // too tall to fill (a world view in a Short): lift the north pole out of the picture but keep the region in
          // the key area; below the south pole the map fades into the paper (see bake)
          cy = lo <= hi ? clamp(cy, lo, hi) : Math.min(Math.max(cy, lo), y0 - (FR.y0 - FY) / k);
        }
        return { k, cx: (x0 + x1) / 2, cy };
      };
      const V0 = fit(reg0);
      const paint = P.paint === 0 || P.paint === false ? 0 : Math.max(.7, P.paint ?? 1.8);
      const grid = P.grid ?? !!reg0.grid, mountains = P.mountains !== false, seaMode = P.sea || 'wash';
      const landCol = P.land ? tok(P.land, C.ground) : WC.mixc(C.ground, C.paper, .22);
      const inkCol = WC.mixc(C.ink, C.inkSoft, .22);
      const Rmax = Math.hypot(Math.max(FX, W - FX), Math.max(FY, H - FY));
      const toS = (v, wx, wy) => [FX + (wx - v.cx) * v.k, FY + (wy - v.cy) * v.k];
      // lon of a point moved by ±360 so it lies nearest to the first framing's centre (Pacific views)
      const wrapLon = lon => { if (!proj.period) return lon; const c = (V0.cx / proj.f(1, 0)[0]); let l = lon; while (l - c > 180) l -= 360; while (c - l > 180) l += 360; return l; };
      const llS = (v, lon, lat) => { const [x, y] = proj.f(lon, lat); return toS(v, x, y); };

      // ---- zoom: keyframe framings along the move (each ≤ 2.2× apart), all baked
      const Z = P.zoom && P.zoom.to ? P.zoom : null;
      const V1 = Z ? fit(regionOf(Z.to)) : V0;
      const kAt = q => Math.exp(mix(Math.log(V0.k), Math.log(V1.k), q));
      const viewAtQ = q => {
        const k = kAt(q), w = Math.abs(Math.log(V1.k / V0.k)) < .02 ? q : (1 / V0.k - 1 / k) / (1 / V0.k - 1 / V1.k);
        return { k, cx: mix(V0.cx, V1.cx, w), cy: mix(V0.cy, V1.cy, w), q };
      };
      // framings along the move: no two more than 2.2x apart in scale or 45% of the picture apart in a pan
      const panPx = Z ? Math.hypot(V1.cx - V0.cx, V1.cy - V0.cy) * Math.min(V0.k, V1.k) : 0;
      const nK = Z ? Math.max(1, Math.ceil(Math.abs(Math.log(V1.k / V0.k)) / Math.log(2.2)), Math.ceil(panPx / (.45 * Math.min(W, H)))) : 0;
      const KV = Z ? Array.from({ length: nK + 1 }, (_, j) => viewAtQ(j / nK)) : [V0];
      // a moving map bakes each framing with a margin MG around the stage, so a pan never shows a sheet's edge
      const MG = Z ? Math.ceil(.5 * .45 * Math.min(W, H)) + 16 : 0, BW = W + 2 * MG, BH = H + 2 * MG;

      // ---- rings visible in a framing (screen coords + lon/lat for the antimeridian / pole cuts)
      function viewRings(v) {
        const useD = proj.kind !== 'npole' && proj.kind !== 'spole' && v.k > 55;
        const src = useD ? detailRings() : world().land;
        const mg = 40 / v.k, vx0 = v.cx + (-MG - FX) / v.k - mg, vx1 = v.cx + (W + MG - FX) / v.k + mg, vy0 = v.cy + (-MG - FY) / v.k - mg, vy1 = v.cy + (H + MG - FY) / v.k + mg;
        const offs = proj.period ? [-proj.period, 0, proj.period] : [0], out = [];
        const polar = !proj.period;
        for (const r of src) {
          // a polar view never shows the other hemisphere (Antarctica would wrap around the whole north-polar picture)
          if (proj.kind === 'npole' && r.bb[3] < 0) continue;
          if (proj.kind === 'spole' && r.bb[1] > 0) continue;
          let pb = null;
          if (!polar) { const a = proj.f(r.bb[0], r.bb[1]), b = proj.f(r.bb[2], r.bb[3]); pb = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
          for (const o of offs) {
            if (pb && (pb[2] + o < vx0 || pb[0] + o > vx1 || pb[3] < vy0 || pb[1] > vy1)) continue;
            const pts = [], ll = [];
            let lx = -1e9, ly = -1e9;
            for (let i = 0; i < r.length; i++) {
              const [wx, wy] = proj.f(r[i][0], r[i][1]), sx = FX + (wx + o - v.cx) * v.k, sy = FY + (wy - v.cy) * v.k;
              if (Math.abs(sx - lx) + Math.abs(sy - ly) < .8 && i < r.length - 1) continue;
              pts.push([sx, sy]); ll.push(r[i]); lx = sx; ly = sy;
            }
            if (pts.length < 3) continue;
            const cl = clipRect(pts, ll, -220 - MG, -220 - MG, W + 220 + MG, H + 220 + MG);
            if (cl.pts.length < 3) continue;
            pts.length = 0; pts.push(...cl.pts); ll.length = 0; ll.push(...cl.ll);
            if (v.k > 150 && pts.length < 6000) {        // close views: round the 1:10m corners a little (Chaikin, twice)
              let P2 = pts, L2 = ll;
              for (let it = 0; it < 2; it++) {
                const q = [], ql = [];
                for (let i = 0; i < P2.length; i++) {
                  const a = P2[i], b = P2[(i + 1) % P2.length];
                  q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); ql.push(L2[i], L2[i]);
                }
                P2 = q; L2 = ql;
              }
              out.push({ pts: P2, ll: L2 });
            } else out.push({ pts, ll });
          }
        }
        return out;
      }
      const ringPath = (rings, path = new Path2D()) => { for (const r of rings) { r.pts.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y)); path.closePath(); } return path; };

      // ---- coastline ink strokes (runs of ~SEG px along every ring), each with its paint-in time
      function coastStrokes(rings) {
        let total = 0;
        for (const r of rings) total += plen(r.pts);
        const SEG = Math.max(36, total / 2200), out = [], w = portrait ? 2.7 : 2.4;
        const off = p => p[0] < -60 - MG || p[0] > W + 60 + MG || p[1] < -60 - MG || p[1] > H + 60 + MG;
        for (const R of rings) {
          const Pp = R.pts, LL = R.ll, n = Pp.length;
          if (plen(Pp) < 14) continue;
          let run = [Pp[0]], len = 0;
          const flush = () => {
            if (run.length > 1 && len > 3) {
              const s = WC.mk(WC.along(run, Math.max(3, Math.round(len / 6))), w * WC.rnd(.8, 1.2), inkCol, { prof: 'even', nb: 0, a: WC.rnd(.72, .9), rough: .35 });
              const mid = run[Math.floor(run.length / 2)];
              s.tt = Math.hypot(mid[0] - FX, mid[1] - FY) / Rmax; out.push(s);
            }
          };
          for (let i = 1; i <= (R.open ? n - 1 : n); i++) {
            const a = Pp[i - 1], b = Pp[i % n], la = LL[i - 1], lb = LL[i % n];
            // cuts that are not coast: along the date line (1:10m Antarctica), down to a pole, along the 85th parallel
            const onDL = l => Math.abs(Math.abs(l[0]) - 180) < .01;
            const art = (onDL(la) && onDL(lb) && Math.abs(la[0] - lb[0]) < .01) || la[1] <= -89.9 || lb[1] <= -89.9
              || (la[1] < -84.9 && lb[1] < -84.9 && Math.abs(la[1] - lb[1]) < .02);
            if (art || (off(a) && off(b))) { flush(); run = [b]; len = 0; continue; }
            run.push(b); len += Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (len >= SEG) { flush(); run = [b]; len = 0; }
          }
          flush();
        }
        return out;
      }

      // ---- a land mask sampler (quarter resolution) for mountains and tints
      function maskOf(land) {
        const q = 4, cv = mkCanvas(BW / q, BH / q), c = cv.getContext('2d');
        c.scale(1 / q, 1 / q); c.translate(MG, MG); c.fillStyle = '#000'; c.fill(land, 'evenodd');
        const d = c.getImageData(0, 0, cv.width, cv.height).data, w = cv.width;
        return (x, y) => { const i = Math.floor((x + MG) / q), j = Math.floor((y + MG) / q); return i >= 0 && j >= 0 && i < w && j < cv.height && d[(j * w + i) * 4 + 3] > 128; };
      }

      // ---- bake one framing: wash (sea + land + mountains + grid) and ink (coast)
      function bake(v, kseed) {
        return WC.withSeed(seed * 977 + kseed * 31 + 5, () => {
          const rings = viewRings(v), land = ringPath(rings), onLand = maskOf(land);
          const wash = mkCanvas(BW, BH), c = wash.getContext('2d');
          c.translate(MG, MG);
          c.lineJoin = 'round'; c.lineCap = 'round';
          // sea: a pale wash with wide soft streaks, darker along the shore (clipped to the water)
          if (seaMode !== 'paper') {
            c.save();
            const sea = new Path2D(); sea.rect(-MG - 20, -MG - 20, BW + 40, BH + 40); sea.addPath(land); c.clip(sea, 'evenodd');
            c.fillStyle = WC.rgba(WC.mixc(C.water, C.paper, .38), .4); c.fillRect(-MG, -MG, BW, BH);
            for (let i = 0; i < 9; i++) {
              const x = WC.rnd(-MG, W + MG), y = WC.rnd(-MG, H + MG), r = WC.rnd(.25, .5) * Math.max(W, H), g = c.createRadialGradient(x, y, r * .1, x, y, r);
              g.addColorStop(0, WC.rgba(WC.pick([C.waterDeep, C.water, C.sky]), .1)); g.addColorStop(1, WC.rgba(C.water, 0)); c.fillStyle = g; c.fillRect(-MG, -MG, BW, BH);
            }
            // a few long, gently curved streaks: lighter (less pigment) and a little deeper water
            const ns = Math.round(9 * H / 1080);
            for (let i = 0; i < ns; i++) {
              const y = WC.rnd(-40, H + 40), x0 = WC.rnd(-300, W * .6), x1 = x0 + WC.rnd(W * .5, W * 1.2);
              WC.drawS(c, WC.mk(WC.qcurve(x0, y, x1, y + WC.rnd(-60, 60), WC.rnd(-80, 80), 18), WC.rnd(50, 130), WC.pick([C.paperLight, C.paperLight, C.water, C.sky]), { prof: 'leaf', nb: 9, a: WC.rnd(.06, .12) }));
            }
            c.strokeStyle = WC.rgba(C.waterDeep, .08); c.lineWidth = portrait ? 32 : 28; c.stroke(land);
            c.strokeStyle = WC.rgba(C.waterDeep, .11); c.lineWidth = portrait ? 12 : 10; c.stroke(land);
            c.restore();
          }
          // land: three offset passes (edges darken where they disagree), climate tints, soft blooms, a pooled rim
          for (const [dx, dy] of [[0, 0], [1.7, -1.3], [-1.5, 1.6]]) { c.save(); c.translate(dx, dy); c.fillStyle = WC.rgba(landCol, .34); c.fill(land, 'evenodd'); c.restore(); }
          c.save(); c.clip(land, 'evenodd');
          const sp = portrait ? 150 : 170;
          for (let gy = Math.floor(-MG / sp) - 1; gy <= (H + MG) / sp + 1; gy++) for (let gx = Math.floor(-MG / sp) - 1; gx <= (W + MG) / sp + 1; gx++) {
            const x = gx * sp + WC.rnd(-sp * .45, sp * .45), y = gy * sp + WC.rnd(-sp * .45, sp * .45);
            const lat = proj.lat(v.cx + (x - FX) / v.k, v.cy + (y - FY) / v.k), [tc, ta] = climate(lat), r = sp * WC.rnd(.8, 1.35);
            const g = c.createRadialGradient(x, y, r * .15, x, y, r); g.addColorStop(0, WC.rgba(tc, ta)); g.addColorStop(.6, WC.rgba(tc, ta * .6)); g.addColorStop(1, WC.rgba(tc, 0));
            c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
          }
          // wet-in-wet blooms with a slightly darker rim, and a few dry-brush highlights
          const nbm = Math.round(10 * W * H / (1920 * 1080));
          for (let i = 0; i < nbm; i++) {
            const x = WC.rnd(-MG, W + MG), y = WC.rnd(-MG, H + MG), r = WC.rnd(60, 190), cc = WC.pick([C.mid, C.ground, C.stone, C.leaf, C.skyWarm]);
            const pts = WC.blobPts(x, y, r, r * WC.rnd(.5, .8), 40, .16);
            WC.washFill(c, WC.washShape(pts, cc, WC.rnd(.04, .07), 3, 3));
            c.beginPath(); pts.forEach(([px, py], k) => k ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath();
            c.strokeStyle = WC.rgba(WC.mixc(cc, C.ink, .2), .03); c.lineWidth = 2.5; c.stroke();
          }
          for (let i = 0; i < Math.round(6 * W * H / (1920 * 1080)); i++) {
            const x0 = WC.rnd(-200 - MG, W + MG), y = WC.rnd(-MG, H + MG), L = WC.rnd(250, 600);
            WC.drawS(c, WC.mk(WC.polar(x0, y, WC.rnd(-.3, .3), L, WC.rnd(-50, 50), 14), WC.rnd(24, 50), C.paperLight, { prof: 'leaf', nb: 7, a: WC.rnd(.05, .08) }));
          }
          c.strokeStyle = WC.rgba(WC.mixc(landCol, C.stoneDark, .65), .2); c.lineWidth = portrait ? 14 : 12; c.stroke(land);
          c.strokeStyle = WC.rgba(WC.mixc(landCol, C.stoneDark, .7), .34); c.lineWidth = 4; c.stroke(land);
          // mountains: a shadow wash along each range, then painted peaks (light flank, shaded flank, ink ridge), only on land
          if (mountains && v.k > 4) {
            const h = clamp(v.k * .6, 11, 40), stepM = h * 1.15, marks = [];
            for (const rg of RANGES) {
              const scr = catmull(rg.map(([lo, la]) => llS(v, wrapLon(lo), la)), 8);
              const L = plen(scr); if (L < 4) continue;
              if (!scr.some(([x, y]) => x > -100 - MG && x < W + 100 + MG && y > -100 - MG && y < H + 100 + MG)) continue;
              WC.drawS(c, WC.mk(WC.along(scr, Math.max(4, Math.round(L / 10))), h * 2.2, C.stoneDark, { prof: 'leaf', nb: 6, a: .1 }));
              const pts = WC.along(scr, Math.max(2, Math.round(L / stepM)));
              pts.forEach(([x, y], i) => {
                const b = pts[Math.min(pts.length - 1, i + 1)], a0 = pts[Math.max(0, i - 1)], dx = b[0] - a0[0], dy = b[1] - a0[1], dl = Math.hypot(dx, dy) || 1;
                const n = WC.rnd() < .35 ? 2 : 1;
                for (let r = 0; r < n; r++) {
                  if (WC.rnd() < .12) continue;
                  const off = (n === 2 ? (r ? .55 : -.55) : WC.rnd(-.3, .3)) * h;
                  const ox = -dy / dl * off + WC.rnd(-h * .2, h * .2), oy = dx / dl * off + WC.rnd(-h * .1, h * .1);
                  if (onLand(x + ox, y + oy)) marks.push([x + ox, y + oy, h * WC.rnd(.65, 1.2)]);
                }
              });
            }
            marks.sort((a, b) => a[1] - b[1]);
            const mc = WC.mixc(C.stoneDark, C.ink, .3), lightF = WC.mixc(C.stone, C.paperLight, .35);
            for (const [x, y, hh] of marks) {
              const tx = x + WC.rnd(-.08, .08) * hh, ww = hh * WC.rnd(.6, .8);
              // a hill painted with two strokes: the shaded flank as a soft wash, the ridge as one bent ink line
              WC.washFill(c, WC.washShape([[tx, y - hh], [x + ww, y + hh * .04], [x + ww * .5, y + hh * .06], [x - ww * .05, y]], C.stoneDark, .3, 2, .8));
              WC.washFill(c, WC.washShape([[x - ww, y], [tx, y - hh], [x - ww * .05, y]], lightF, .18, 2, .8));
              const ridge = WC.qctrl(x - ww, y + hh * .02, tx - ww * .12, y - hh * 1.08, tx, y - hh, 6).concat(WC.qctrl(tx, y - hh, tx + ww * .25, y - hh * .9, x + ww, y + hh * .04, 6).slice(1));
              WC.drawS(c, WC.mk(ridge, Math.max(1.3, hh * .085), mc, { prof: 'even', nb: 0, a: .62, rough: .3 }));
            }
          }
          c.restore();
          // narrow waters missing from the data (the Golden Horn): erase the land wash, paint water, ink both banks
          const bankLines = [];
          for (const wt of WATERS) {
            const ctr = wt.pts.map(([lo, la]) => llS(v, lo, la)), L = plen(ctr), wpx = wt.w0 * v.k;
            if (L < 20 || wpx < 2.5 || !ctr.some(([x, y]) => x > 0 && x < W && y > 0 && y < H)) continue;
            const cc = catmull(ctr, 4), sides = [[], []];
            cc.forEach((p, i) => {
              const a = cc[Math.max(0, i - 1)], b = cc[Math.min(cc.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
              const hw = mix(wt.w0, wt.w1, i / (cc.length - 1)) * v.k / 2 * (1 + (vnoise(i * .4) - .5) * .25);
              sides[0].push([p[0] - dy / dl * hw, p[1] + dx / dl * hw]); sides[1].push([p[0] + dy / dl * hw, p[1] - dx / dl * hw]);
            });
            const poly = new Path2D(); sides[0].concat(sides[1].slice().reverse()).forEach(([x, y], i) => i ? poly.lineTo(x, y) : poly.moveTo(x, y)); poly.closePath();
            c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(poly); c.restore();
            if (seaMode !== 'paper') { c.fillStyle = WC.rgba(WC.mixc(C.water, C.paper, .3), .5); c.fill(poly); }
            for (const sd of sides) {           // ink only where the channel runs through land (not across its mouth)
              let run = [];
              const flush = () => { if (run.length > 2) bankLines.push({ pts: run, ll: run.map(() => [0, 0]), open: true }); run = []; };
              sd.forEach((p, i) => { if (onLand(cc[i][0], cc[i][1])) run.push(p); else flush(); });
              flush();
            }
          }
          // modern borders (faint, dashed), only on request
          if (P.borders) {
            c.save(); c.clip(land, 'evenodd'); c.setLineDash([6, 7]); c.strokeStyle = WC.rgba(C.inkSoft, .4); c.lineWidth = 1.6;
            for (const key of Object.keys(world().R.countries)) {
              const rr = countryRings(key).map(r => ({ pts: r.map(([lo, la]) => llS(v, wrapLon(lo), la)) }));
              c.stroke(ringPath(rr));
            }
            c.restore();
          }
          // graticule: thin pencil lines every 5/10/15/30 degrees
          if (grid) {
            const k = v.k, g = k < 3.5 ? 30 : k < 9 ? 15 : k < 30 ? 10 : k < 90 ? 5 : 1, gc = WC.mixc(C.inkSoft, C.waterDeep, .3);
            const line = pts => { const L = plen(pts); if (L > 10) WC.drawS(c, WC.mk(WC.along(pts, Math.max(4, Math.round(L / 40))), 1.3, gc, { prof: 'even', nb: 0, a: .3, rough: .2 })); };
            if (proj.period) {
              const lon0 = v.cx / proj.f(1, 0)[0] - 400, lat0 = -85;
              for (let lo = Math.ceil(lon0 / g) * g; lo <= lon0 + 800; lo += g) {
                const pts = []; for (let la = -80; la <= 84; la += 2) pts.push(llS(v, lo, la));
                if (pts.some(([x]) => x > -20 - MG && x < W + 20 + MG)) line(pts.filter(([, y]) => y > -50 - MG && y < H + 50 + MG));
              }
              for (let la = Math.ceil(lat0 / g) * g; la <= 85; la += g) {
                const a = llS(v, lon0, la), b = llS(v, lon0 + 800, la);
                if (a[1] > -10 - MG && a[1] < H + 10 + MG) line([[-10 - MG, a[1]], [W + 10 + MG, b[1]]]);
              }
            } else {
              for (let la = 90 - g; la > 30 && la > -90; la -= g) { const pts = []; for (let lo = 0; lo <= 360; lo += 4) pts.push(llS(v, lo, proj.kind === 'spole' ? -la : la)); line(pts); }
              for (let lo = 0; lo < 360; lo += 30) line([llS(v, lo, proj.kind === 'spole' ? -88 : 88), llS(v, lo, proj.kind === 'spole' ? -30 : 30)]);
            }
          }
          // the ink coast
          const strokes = coastStrokes(rings.concat(bankLines));
          const ink = mkCanvas(BW, BH), ic = ink.getContext('2d');
          ic.translate(MG, MG);
          for (const s of strokes) WC.drawS(ic, s, 1);
          // beyond the poles there is nothing to paint: the map fades into the paper there (wide views in a Short)
          if (proj.period) {
            const lim = proj.kind === 'merc' ? 84 : 86, yN = llS(v, 0, lim)[1], yS = llS(v, 0, -lim)[1];
            for (const cc of [c, ic]) {
              cc.save(); cc.globalCompositeOperation = 'destination-out';
              if (yN > -MG - 60) { const g = cc.createLinearGradient(0, yN + 50, 0, yN - 70); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); cc.fillStyle = g; cc.fillRect(-MG, -MG - 10, BW, yN + 50 + MG + 10); }
              if (yS < H + MG + 60) { const g = cc.createLinearGradient(0, yS - 50, 0, yS + 70); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); cc.fillStyle = g; cc.fillRect(-MG, yS - 50, BW, H + MG + 10 - (yS - 50)); }
              cc.restore();
            }
          }
          // a zoom cross-fades whole pictures: each framing also gets an opaque copy (paper + wash + ink)
          let pic = null;
          if (KV.length > 1) {
            pic = mkCanvas(BW, BH); const pc = pic.getContext('2d'), pp = WC.paper();
            if (pp) pc.drawImage(pp, 0, 0, BW, BH); else { pc.fillStyle = C.paper; pc.fillRect(0, 0, BW, BH); }
            pc.drawImage(wash, 0, 0); pc.drawImage(ink, 0, 0);
          }
          return { v, wash: kseed === 0 || !pic ? wash : null, ink: pic ? null : ink, pic, strokes: kseed === 0 ? strokes : null, land, rings };
        });
      }
      // baked lazily, each framing when a frame first needs it (a render shard that never reaches it pays nothing);
      // every bake runs under its own seed, so the order does not matter
      const Kc = [], NK = KV.length;
      const kfAt = j => Kc[j] || (Kc[j] = Object.assign(bake(KV[j], j), { j }));
      let areas = null;
      function ensure() { if (!areas) areas = makeAreas(); }

      // ---- areas: a wash clipped to the land, baked per framing (cropped), spread by a growing front
      const makeAreas = () => (P.areas || []).map((A, i) => WC.withSeed(seed * 131 + i * 17 + 3, () => {
        const shift = r => { const mid = (r.bb[0] + r.bb[2]) / 2, o = wrapLon(mid) - mid; return o ? withBB(r.map(([lo, la]) => [lo + o, la])) : r; };
        const groups = [];
        if (A.poly && A.poly.length > 2) groups.push([shift(smoothLL(A.poly.map(p => p.slice())))]);
        for (const cn of A.countries || []) { const g = countryRings(cn).map(shift); g.country = true; if (g.length) groups.push(g); }
        const ringsLL = groups.flat();
        const colr = tok(A.color, C.red), alpha = A.alpha ?? .34;
        let cxs = 0, cys = 0, ws = 0;
        for (const r of ringsLL) { const a = (r.bb[2] - r.bb[0]) * (r.bb[3] - r.bb[1]); cxs += (r.bb[0] + r.bb[2]) / 2 * a; cys += (r.bb[1] + r.bb[3]) / 2 * a; ws += a; }
        const centre = ws ? [cxs / ws, cys / ws] : [0, 0];
        // one solid mask of the union (no inner borders), then: offset washes, brush texture, a pooled rim (mask minus
        // its erosion), all cropped to the area's box
        const layerCache = [];
        const layerAt = j => layerCache[j] !== undefined ? layerCache[j] : (layerCache[j] = WC.withSeed(seed * 131 + i * 17 + 3 + j * 7919, () => {
          const kf = kfAt(j);
          const scr = groups.map(g => g.map(r => ({ pts: r.map(([lo, la]) => llS(kf.v, lo, la)) })));
          let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          for (const g of scr) for (const r of g) for (const [x, y] of r.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
          x0 = Math.max(-MG, Math.floor(x0 - 24)); y0 = Math.max(-MG, Math.floor(y0 - 24)); x1 = Math.min(W + MG, Math.ceil(x1 + 24)); y1 = Math.min(H + MG, Math.ceil(y1 + 24));
          if (x1 <= x0 || y1 <= y0) return null;
          const cw = x1 - x0, ch = y1 - y0;
          const mask = mkCanvas(cw, ch), mc = mask.getContext('2d');
          mc.translate(-x0, -y0); mc.save(); mc.clip(kf.land, 'evenodd');
          mc.fillStyle = '#000'; mc.strokeStyle = '#000'; mc.lineJoin = 'round';
          // the stroke closes seams between countries; in close views (1:10m coast, 1:50m countries) it also grows a
          // country out to the finer coastline (it may bleed a little over a land border there)
          const grow = kf.v.k > 55 ? clamp(.11 * kf.v.k, 4, 320) : 4;
          scr.forEach((g, gi) => { const p = ringPath(g); mc.fill(p, 'evenodd'); mc.lineWidth = groups[gi].country ? grow : 4; mc.lineJoin = mc.lineWidth > 12 ? 'bevel' : 'round'; mc.stroke(p); });
          mc.restore();
          const tint = (src, colour) => { const cv = mkCanvas(src.width, src.height), c = cv.getContext('2d'); c.drawImage(src, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = colour; c.fillRect(0, 0, src.width, src.height); return cv; };
          // the rims are worked at half resolution (they are soft anyway) and scaled back up
          const hw = Math.ceil(cw / 2), hh = Math.ceil(ch / 2), small = mkCanvas(hw, hh);
          small.getContext('2d').drawImage(mask, 0, 0, hw, hh);
          const erode = r => { const cv = mkCanvas(hw, hh), c = cv.getContext('2d'); c.drawImage(small, 0, 0); c.globalCompositeOperation = 'destination-in'; for (let k = 0; k < 8; k++) c.drawImage(small, Math.cos(k * Math.PI / 4) * r / 2, Math.sin(k * Math.PI / 4) * r / 2); return cv; };
          const ring = (r, colour) => { const cv = tint(small, colour), c = cv.getContext('2d'); c.globalCompositeOperation = 'destination-out'; c.drawImage(erode(r), 0, 0); return cv; };
          const cv = mkCanvas(cw, ch), c = cv.getContext('2d'), fill = tint(mask, colr);
          c.globalAlpha = alpha * .62; c.drawImage(fill, 0, 0);
          c.globalAlpha = alpha * .32; c.drawImage(fill, 1.8, -1.4); c.drawImage(fill, -1.5, 1.7);
          c.globalAlpha = 1; c.globalCompositeOperation = 'source-atop';
          for (let k = 0; k < 7; k++) WC.drawS(c, WC.mk(WC.polar(WC.rnd(-100, cw), WC.rnd(0, ch), WC.rnd(-.5, .5), WC.rnd(200, 600), WC.rnd(-40, 40), 12), WC.rnd(30, 80), WC.pick([WC.mixc(colr, C.ink, .25), C.paperLight]), { prof: 'leaf', nb: 7, a: WC.rnd(.06, .1) }));
          for (let k = 0; k < 6; k++) { const x = WC.rnd(0, cw), y = WC.rnd(0, ch), r = WC.rnd(50, 140); WC.washFill(c, WC.washShape(WC.blobPts(x, y, r, r * .7, 26, .25), WC.mixc(colr, C.ink, .15), WC.rnd(.06, .1), 2, 3)); }
          c.globalCompositeOperation = 'source-over';
          c.globalAlpha = Math.min(1, alpha * 1.2); c.drawImage(ring(6, WC.mixc(colr, C.ink, .25)), 0, 0, hw * 2, hh * 2);
          c.globalAlpha = Math.min(1, alpha * 1.3); c.drawImage(ring(2.4, WC.mixc(colr, C.ink, .4)), 0, 0, hw * 2, hh * 2);
          c.globalAlpha = 1;
          return { cv, x0, y0 };
        }));
        let b0 = 1e9, b1 = 1e9, b2 = -1e9, b3 = -1e9;
        for (const r of ringsLL) { b0 = Math.min(b0, r.bb[0]); b1 = Math.min(b1, r.bb[1]); b2 = Math.max(b2, r.bb[2]); b3 = Math.max(b3, r.bb[3]); }
        const corners = [[b0, b1], [b2, b1], [b0, b3], [b2, b3], [(b0 + b2) / 2, b1], [(b0 + b2) / 2, b3], [b0, (b1 + b3) / 2], [b2, (b1 + b3) / 2]];
        return { A, i, layerAt, colr, centre, corners, from: A.from ? [wrapLon(A.from[0]), A.from[1]] : centre, ph: hash(i + seed) * 20 };
      }));

      // ---- live elements
      const markers = (P.places || []).map((pl, i) => WC.withSeed(seed * 71 + i * 13 + 1, () => marker(pl.kind || 'city', m * (pl.size || 1), pl.color)));
      const routeCol = c => c === 'ink' ? WC.mixc(C.ink, C.inkSoft, .2) : c === 'blue' ? WC.mixc(C.blue, C.waterDeep, .5) : C.red;
      const routeCache = {};
      const shipS = WC.withSeed(seed * 53 + 9, () => marker('ship', m));
      const ovl = edgeOverlay(W, H);

      const viewAt = (lt, cues) => {
        if (!Z) return V0;
        const z0 = Math.max(WC.timeOf(Z.at, cues, paint + .3), paint), q = eio(seg(lt, z0, z0 + (Z.dur ?? 3)));
        return viewAtQ(q);
      };
      // keyframe pair for a view: [[wide, 1], [narrow, alpha]]
      // the two framings around a view of the move: {base, top, tn}: the base covers more of the picture and is drawn
      // first, the other one is laid over it with weight tn (0..1) and feathered edges
      const cover = (kf, v) => { const [r, tx, ty] = kfT(kf, v), ax = tx - MG * r, ay = ty - MG * r; const w = Math.max(0, Math.min(W, ax + BW * r) - Math.max(0, ax)), h = Math.max(0, Math.min(H, ay + BH * r) - Math.max(0, ay)); return w * h; };
      function pairOf(v) {
        if (NK === 1 || v.q == null) return { base: kfAt(0), top: null, tn: 0 };
        const n = NK - 1, j = Math.min(n - 1, Math.floor(v.q * n)), t = clamp(v.q * n - j);
        if (t < .001) return { base: kfAt(j), top: null, tn: 0 };
        if (t > .999) return { base: kfAt(j + 1), top: null, tn: 0 };
        const A = kfAt(j), B = kfAt(j + 1);
        return cover(A, v) >= cover(B, v) ? { base: A, top: B, tn: t } : { base: B, top: A, tn: 1 - t };
      }
      const kfT = (kf, v) => { const r = v.k / kf.v.k; return [r, FX - FX * r + (kf.v.cx - v.cx) * v.k, FY - FY * r + (kf.v.cy - v.cy) * v.k]; };
      function drawKf(c, kf, v, cv, x0 = 0, y0 = 0, a = 1) {
        if (a <= .003 || !cv) return;
        const [r, tx, ty] = kfT(kf, v);
        c.setTransform(r, 0, 0, r, tx, ty);
        c.globalAlpha = a; c.drawImage(cv, x0, y0);
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
      }
      // every area of one framing, each clipped by its spreading front (screen coords of the current view)
      function drawAreasOn(c, kf, v, lt, cues) {
        const ki = kf.j;
        areas.forEach((ar, i) => {
          const t0 = ar.A.at === -1 ? -99 : WC.timeOf(ar.A.at, cues, paint + .25 + i * 1.3), d = ar.A.dur ?? 2.4, q = eio(seg(lt, t0, t0 + d));
          const L = ar.layerAt(ki);
          if (q <= 0 || !L) return;
          const [ox, oy] = llS(v, ar.from[0], ar.from[1]);
          let far = 0;
          for (const [lo, la] of ar.corners) { const [x, y] = llS(v, lo, la); far = Math.max(far, Math.hypot(x - ox, y - oy)); }
          const R = q * far * 1.05, ph = ar.ph + q * 1.5;
          c.save(); if (q < 1) { blobPath(c, ox, oy, R, ph, .16); c.clip(); }
          drawKf(c, kf, v, L.cv, L.x0, L.y0, 1);
          c.restore();
          if (q < 1 && R > 30) {             // the wet front: pigment gathers at the spreading edge
            c.save(); blobPath(c, ox, oy, R, ph, .16); c.clip();
            c.beginPath(); c.rect(-10, -10, W + 20, H + 20); blobPathAdd(c, ox, oy, R * .9 - 10, ph, .16); c.clip('evenodd');
            drawKf(c, kf, v, L.cv, L.x0, L.y0, .55);
            c.restore();
          }
        });
      }
      // a zoom: the closer framing is composed on its own sheet, its edges feathered while it is still smaller than
      // the screen, and laid over the wider one
      let ZT = null, ZM = null;
      function drawNarrow(nk, v, tn, lt, cues) {
        if (!ZT) { ZT = mkCanvas(W, H).getContext('2d'); ZM = mkCanvas(W, H).getContext('2d'); }
        ZT.setTransform(1, 0, 0, 1, 0, 0); ZT.globalCompositeOperation = 'source-over'; ZT.clearRect(0, 0, W, H);
        drawKf(ZT, nk, v, nk.pic, -MG, -MG); drawAreasOn(ZT, nk, v, lt, cues);
        const [r, tx, ty] = kfT(nk, v), x0 = tx - MG * r, y0 = ty - MG * r, w = BW * r, h = BH * r, f = Math.min(w, h) * .45 * (1 - tn);
        ZM.setTransform(1, 0, 0, 1, 0, 0); ZM.globalCompositeOperation = 'source-over'; ZM.clearRect(0, 0, W, H);
        ZM.fillStyle = '#000'; ZM.fillRect(x0, y0, w, h);
        if (f > .5) {
          ZM.globalCompositeOperation = 'destination-out';
          for (const [gx0, gy0, gx1, gy1, rx, ry, rw, rh] of [[x0, 0, x0 + f, 0, x0, y0, f, h], [x0 + w, 0, x0 + w - f, 0, x0 + w - f, y0, f, h], [0, y0, 0, y0 + f, x0, y0, w, f], [0, y0 + h, 0, y0 + h - f, x0, y0 + h - f, w, f]]) {
            const g = ZM.createLinearGradient(gx0, gy0, gx1, gy1); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            ZM.fillStyle = g; ZM.fillRect(rx, ry, rw, rh);
          }
        }
        ZT.globalCompositeOperation = 'destination-in'; ZT.drawImage(ZM.canvas, 0, 0); ZT.globalCompositeOperation = 'source-over';
        X.globalAlpha = ss(tn); X.drawImage(ZT.canvas, 0, 0); X.globalAlpha = 1;
      }

      function routeStroke(rt, i, v) {
        const key = i + '|' + v.k.toFixed(5) + '|' + v.cx.toFixed(5) + '|' + v.cy.toFixed(5);
        if (routeCache[i] && routeCache[i].key === key) return routeCache[i];
        let prev = null;
        const pts = (rt.points || []).map(([lo, la]) => { let l = prev == null ? wrapLon(lo) : lo; if (prev != null) { while (l - prev > 180) l -= 360; while (prev - l > 180) l += 360; } prev = l; return llS(v, l, la); });
        const curve = catmull(pts, 6), L = plen(curve), w = (rt.width ?? (portrait ? 6 : 5));
        const res = WC.withSeed(seed * 211 + i * 7, () => {
          const n = Math.max(4, Math.round(L / 7));
          if (!rt.dashed) return { key, L, curve, S: [WC.mk(WC.along(curve, n), w, routeCol(rt.color), { prof: 'even', nb: 2, a: .88, rough: .25 })] };
          const S = [], dash = 16 * m, gap = 11 * m, along = WC.along(curve, n);
          const cum = [0]; for (let k = 1; k < along.length; k++) cum.push(cum[k - 1] + Math.hypot(along[k][0] - along[k - 1][0], along[k][1] - along[k - 1][1]));
          const at = s => { let k = 1; while (k < cum.length - 1 && cum[k] < s) k++; const f = (s - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); return [mix(along[k - 1][0], along[k][0], f), mix(along[k - 1][1], along[k][1], f)]; };
          for (let s = 0; s < L; s += dash + gap) { const e = Math.min(L, s + dash), sg = []; for (let u = 0; u <= 4; u++) sg.push(at(mix(s, e, u / 4))); const st = WC.mk(sg, w * .9, routeCol(rt.color), { prof: 'even', nb: 0, a: .9, rough: .3 }); st.s0 = s / L; st.s1 = e / L; S.push(st); }
          return { key, L, curve, S, dashed: true };
        });
        return (routeCache[i] = res);
      }
      function tipOf(curve, p) {
        const L = plen(curve), want = L * p; let acc = 0;
        for (let k = 1; k < curve.length; k++) {
          const d = Math.hypot(curve[k][0] - curve[k - 1][0], curve[k][1] - curve[k - 1][1]);
          if (acc + d >= want) { const f = (want - acc) / (d || 1); return [mix(curve[k - 1][0], curve[k][0], f), mix(curve[k - 1][1], curve[k][1], f), Math.atan2(curve[k][1] - curve[k - 1][1], curve[k][0] - curve[k - 1][0])]; }
          acc += d;
        }
        const a = curve[curve.length - 2] || curve[0], b = curve[curve.length - 1];
        return [b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0])];
      }
      // italic serif along a gentle arc, written in letter by letter
      function arcText(c, txt, x, y, size, curve, p, colour) {
        const chars = [...txt]; if (!chars.length || p <= 0) return;
        c.save(); c.font = WC.font(size, 600, 'serif', true); c.textBaseline = 'alphabetic'; c.textAlign = 'center';
        const sp = size * .14, ws = chars.map(ch => c.measureText(ch).width + sp), total = ws.reduce((a, b) => a + b, 0) - sp;
        c.shadowColor = WC.rgba(C.paperLight, .6); c.shadowBlur = 6;
        let acc = 0;
        chars.forEach((ch, i) => {
          const a = clamp(p * (chars.length + 4) / 1 - i, 0, 4) / 4; acc += ws[i];
          if (a <= 0) return;
          const s = acc - ws[i] / 2 - sp / 2 - total / 2;
          c.save();
          if (Math.abs(curve) < 1e-3) c.translate(x + s, y);
          else { const R = total / curve, th = s / R; c.translate(x + R * Math.sin(th), y + R - R * Math.cos(th)); c.rotate(th); }
          c.globalAlpha = a; c.fillStyle = colour; c.fillText(ch, 0, 0); c.restore();
        });
        c.restore();
      }

      function update(lt, dur, cues) {
        // the engine measures every shot once while it is laid out hidden (camera planning, unused for a calm map
        // without a close-up): skip that pass so the bake happens only where the map is really rendered
        if (ctx.root.style.visibility === 'hidden' && !Kc.length) return;
        ensure();
        X.clear();
        cues = cues || {};
        const v = viewAt(lt, cues), pp = WC.paper();
        if (pp) X.drawImage(pp, 0, 0); else { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); }
        // the map: blooming in from the centre (wash front, then the ink coast), or the baked framing(s)
        if (paint && lt < paint) {
          const u = seg(lt, 0, paint * .72), kf = kfAt(0), R = Rmax * 1.1 * (1 - (1 - u) * (1 - u));
          if (R > 1) {           // the wash blooms out from the centre, a little darker at its wet front
            X.save(); blobPath(X, FX, FY, R, 3, .09); X.clip(); X.drawImage(kf.wash, -MG, -MG);
            if (R < Rmax && R > 40) {
              X.beginPath(); X.rect(-10, -10, W + 20, H + 20); blobPathAdd(X, FX, FY, R - 30, 3, .09); X.clip('evenodd');
              X.globalAlpha = .45; X.drawImage(kf.wash, -MG, -MG); X.globalAlpha = 1;
            }
            X.restore();
          }
          // each ink stroke starts when the wash front reaches it (inverse of the front's ease-out)
          const sd = Math.min(.45, paint * .28);
          for (const s of kf.strokes) { const t0 = paint * .72 * (1 - Math.sqrt(1 - clamp(s.tt / 1.1))) + .04; const p = seg(lt, t0, t0 + sd); if (p > 0) WC.drawS(X, s, p); }
          drawAreasOn(X, kfAt(0), v, lt, cues);
        } else {
          const pr = pairOf(v), wk = pr.base;
          if (pr.top) drawKf(X, pr.top, v, pr.top.pic, -MG, -MG);       // under the base (belt and braces in a pan)
          if (wk.pic) drawKf(X, wk, v, wk.pic, -MG, -MG); else { drawKf(X, wk, v, wk.wash, -MG, -MG); drawKf(X, wk, v, wk.ink, -MG, -MG); }
          drawAreasOn(X, wk, v, lt, cues);
          if (pr.top) drawNarrow(pr.top, v, pr.tn, lt, cues);
        }
        // the picture's painted edge (paper above and below, under the subtitles)
        X.drawImage(ovl, 0, 0);
        // seas
        (P.seas || []).forEach((s, i) => {
          const t0 = WC.timeOf(s.at, cues, paint * .7 + i * .25), p = seg(lt, t0, t0 + 1.4);
          if (p <= 0) return;
          const [x, y] = llS(v, wrapLon(s.lon), s.lat), size = s.size || (portrait ? 44 : 38);
          arcText(X, s.text, fitX(s.text, WC.font(size, 600, 'serif', true), size * .14, x), offBand(y - size * .3, size * 1.3) + size * .3, size, s.curve ?? .18, p, WC.rgba(WC.mixc(C.waterDeep, C.ink, .3), .78));
        });
        // routes
        (P.routes || []).forEach((rt, i) => {
          const t0 = WC.timeOf(rt.at, cues, paint + .5 + i * .8), p = eio(seg(lt, t0, t0 + (rt.dur ?? 2.6)));
          if (p <= 0) return;
          const R = routeStroke(rt, i, v);
          if (R.L < 2) return;
          WC.withSeed(seed * 97 + i, () => {
            if (R.dashed) { for (const s of R.S) if (p > s.s0) WC.drawS(X, s, clamp((p - s.s0) / (s.s1 - s.s0))); }
            else WC.drawS(X, R.S[0], p);
            const [tx, ty, ang] = tipOf(R.curve, p);
            if (rt.ship) {
              X.save(); X.translate(tx, ty + Math.sin(lt * 2.2) * 1.5); if (Math.cos(ang) < 0) X.scale(-1, 1);
              X.rotate(Math.sin(lt * 1.7 + i) * .04); WC.drawList(X, shipS, 1); X.restore();
            } else if (rt.arrow !== false && p > .04) {
              const al = (portrait ? 24 : 20), w = (rt.width ?? (portrait ? 6 : 5)) * .85, colr = routeCol(rt.color);
              for (const sd of [-1, 1]) WC.drawS(X, WC.mk(WC.qcurve(tx + Math.cos(ang + Math.PI + sd * .5) * al, ty + Math.sin(ang + Math.PI + sd * .5) * al, tx, ty, sd * 2, 5), w, colr, { prof: 'even', nb: 0, a: .9 }));
            }
          });
        });
        // area labels (after the wash has spread)
        areas.forEach((ar, i) => {
          if (!ar.A.label) return;
          const t0 = ar.A.at === -1 ? -99 : WC.timeOf(ar.A.at, cues, paint + .25 + i * 1.3), d = ar.A.dur ?? 2.4, p = seg(lt, t0 + d * .55, t0 + d * .55 + 1.2);
          if (p <= 0) return;
          const la = ar.A.label_at ? [wrapLon(ar.A.label_at[0]), ar.A.label_at[1]] : ar.from, [x, y] = llS(v, la[0], la[1]);
          const size = ar.A.label_size || (portrait ? 46 : 40), txt = String(ar.A.label).toLocaleUpperCase(LOCALE);
          WC.serif(X, txt, fitX(txt, WC.font(size, 600), size * .16, x), offBand(y - size * .25, size * 1.05) + size * .25, p, { size, spacing: size * .16, col: WC.mixc(ar.colr, C.ink, .55), a: .92, halo: 8 });
        });
        // labels
        (P.labels || []).forEach((lb, i) => {
          const t0 = WC.timeOf(lb.at, cues, paint + .1 + i * .3), p = seg(lt, t0, t0 + 1.1);
          if (p <= 0) return;
          const [x, y] = llS(v, wrapLon(lb.lon), lb.lat), size = lb.size || (portrait ? 50 : 42);
          const txt = lb.caps ? String(lb.text).toLocaleUpperCase(LOCALE) : String(lb.text);
          const spc = lb.spacing ?? (lb.caps ? size * .14 : 0);
          WC.serif(X, txt, fitX(txt, WC.font(size, 600, 'serif', !!lb.italic), spc, x), offBand(y - size * .25, size * 1.05) + size * .25, p, { size, italic: !!lb.italic, spacing: spc, col: tok(lb.color, C.ink), a: .9, halo: 8 });
        });
        // places: marker, then the hand-written name
        (P.places || []).forEach((pl, i) => {
          const t0 = WC.timeOf(pl.at, cues, paint + .3 + i * .45);
          if (lt < t0) return;
          let [x, y] = llS(v, wrapLon(pl.lon), pl.lat);
          if (portrait && y > SUB0 - 20 && y < SUB1 + 20 && !warned.has(i)) { warned.add(i); console.warn('wc_map: place "' + pl.name + '" lies under the subtitles (y ' + Math.round(y) + '): choose a region that frames it higher'); }
          const kind = pl.kind || 'city', mm = m * (pl.size || 1), p = seg(lt, t0, t0 + .7);
          let rr = 9 * mm;
          if (kind === 'city') {
            const e = eo(p), red = pl.color === 'red';
            X.beginPath(); X.arc(x, y, rr * 2.1 * e, 0, 7); X.fillStyle = WC.rgba(red ? C.red : C.paperLight, red ? .28 : .55); X.fill();
            X.beginPath(); X.arc(x, y, rr * e, 0, 7); X.lineWidth = 2.6 * mm; X.strokeStyle = WC.rgba(C.ink, .88); X.stroke();
            X.beginPath(); X.arc(x, y, rr * .45 * e, 0, 7); X.fillStyle = WC.rgba(red ? C.red : C.ink, .92); X.fill();
          } else if (kind !== 'none') {
            const S = markers[i]; rr = (kind === 'ship' ? 20 : 16) * mm;
            X.save(); X.translate(x, y + (kind === 'ship' ? Math.sin(lt * 2 + i) * 1.6 : 0)); WC.drawList(X, S, p); X.restore();
          } else rr = 0;
          if (!pl.name) return;
          const size = (portrait ? 48 : 40) * (pl.size || 1), gap = rr + 12 * mm, q = seg(lt, t0 + .35, t0 + 1.35), tw = handW(pl.name, size);
          let al = pl.align || 'right';
          if (al === 'right' && x + gap + tw > W - 24) al = 'left'; else if (al === 'left' && x - gap - tw < 24) al = 'right';
          if (al === 'above' || al === 'below') x = clamp(x, tw / 2 + 24, W - tw / 2 - 24);
          const opt = { size, w: 700, col: pl.color === 'red' && kind === 'none' ? C.red : C.ink };
          const hb = size * 1.15;          // never inside the subtitle band of a Short
          if (al === 'left') WC.hand(X, pl.name, x - gap, offBand(y, hb), q, Object.assign(opt, { align: 'right' }));
          else if (al === 'above') WC.hand(X, pl.name, x, offBand(y - gap - size * .45, hb), q, Object.assign(opt, { align: 'center' }));
          else if (al === 'below') WC.hand(X, pl.name, x, offBand(y + gap + size * .5, hb), q, Object.assign(opt, { align: 'center' }));
          else WC.hand(X, pl.name, x + gap, offBand(y, hb), q, Object.assign(opt, { align: 'left' }));
        });
      }
      // keep a centred label of this font inside the picture (x clamped by its measured width)
      function fitX(txt, font, spacing, x) {
        X.save(); X.font = font; X.letterSpacing = (spacing || 0) + 'px'; const w = X.measureText(txt).width; X.restore();
        return clamp(x, w / 2 + 28, W - w / 2 - 28);
      }
      const SUB0 = 1162, SUB1 = 1330, warned = new Set();
      const offBand = (y, h) => !portrait || y + h / 2 < SUB0 || y - h / 2 > SUB1 ? y : (y < (SUB0 + SUB1) / 2 ? SUB0 - h / 2 : SUB1 + h / 2);
      const handW = (txt, size) => { X.save(); X.font = `700 ${size}px ${WC.HANDF}`; const w = X.measureText(txt).width; X.restore(); return w; };
      function blobPathAdd(c, x, y, R, ph, amp = .1, n = 80) {   // a sub-path (no beginPath): an inner ring for evenodd clips
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2, k = 1 + amp * (vnoise(ph + 2.4 * Math.cos(a) + 5) + vnoise(ph * 1.3 + 2.4 * Math.sin(a) + 11) - 1) * 2;
          const px = x + Math.cos(a) * Math.max(0, R) * k, py = y + Math.sin(a) * Math.max(0, R) * k;
          i ? c.lineTo(px, py) : c.moveTo(px, py);
        }
        c.closePath();
      }
      return { update };
    },
  };
})();
