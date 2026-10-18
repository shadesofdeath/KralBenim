// sundial: a bronze horizontal sundial on a stone pedestal in a desert; the gnomon's shadow is computed from the
// real sun position (latitude, declination, hour angle), so it sweeps west -> north -> east (clockwise from above)
// in the northern hemisphere and the other way round in the southern one.
// P: {mode: "dial"|"lines"|"arc"|"top"|"south", lat: 45 (south: -35), decl: 10,
//     hours: [from, to] (clock hours, the sun's hour angle moves between them over the scene),
//     labels: [{at: "east"|"west"|"sun"|"shadow"|"arrow"|"below", text, sub, color, dx, dy, cue}],
//     arrow: true (top/south: amber/red trail swept by the shadow tip), camera: {...}}
// cues: hit (dial: sun flare + shadow punch; lines: shadow slides to the next hour line;
//            arc: sun reaches the west horizon; top/south: arrow head lands)
// Consecutive dial -> lines -> arc -> top scenes are one world: the camera glides between them.
'use strict';

function sdTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const SD_ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

// sun direction in world space (x = east, y = up, z = south) for latitude phi, declination dec, hour angle H (radians)
function sdSun(phi, dec, H) {
  const E = -Math.cos(dec) * Math.sin(H);
  const N = Math.cos(phi) * Math.sin(dec) - Math.sin(phi) * Math.cos(dec) * Math.cos(H);
  const U = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  return V3(E, U, -N);
}
// convex hull (monotone chain) of [x, z] points
function sdHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// clip a convex polygon to a disc (approximated by a convex n-gon), Sutherland-Hodgman
function sdClipDisc(poly, R, n = 64) {
  let out = poly;
  for (let k = 0; k < n && out.length; k++) {
    const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
    const A = [R * Math.cos(a0), R * Math.sin(a0)], B = [R * Math.cos(a1), R * Math.sin(a1)];
    const side = q => (B[0] - A[0]) * (q[1] - A[1]) - (B[1] - A[1]) * (q[0] - A[0]);
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const P = inp[i], Q = inp[(i + 1) % inp.length], sp = side(P), sq = side(Q);
      if (sp >= 0) out.push(P);
      if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
    }
  }
  return out;
}

SHOTS.sundial = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W, mode = P.mode || 'dial', r = rng(77);
    const south = mode === 'south';
    const latDeg = P.lat != null ? P.lat : (south ? -35 : 45);
    const phi = latDeg * DEG, s = Math.sign(latDeg) || 1, aphi = Math.abs(phi);
    const dec = (P.decl != null ? P.decl : (south ? -10 : 10)) * DEG;
    const RD = 2.3;                                   // dial radius
    const O = V3(0, 0, 0.9 * s);                      // gnomon foot (south of centre in the north)
    const LC = 1.65, LY = LC * Math.tan(aphi);        // gnomon: horizontal run toward the pole, height
    const T = V3(0, LY, O.z - s * LC), B = V3(0, 0, O.z - s * LC);
    const shadowDir = (Hh) => { const th = Math.atan2(Math.sin(aphi) * Math.sin(Hh), Math.cos(Hh)); return [Math.sin(th), -s * Math.cos(th)]; };

    // ---------------------------------------------------------------- light, sky, ground
    scene.add(new THREE.HemisphereLight(col(mix(pal.accent2, '#ffffff', 0.3)), col(shade(pal.bg[1], -0.2)), 0.75));
    const sunLight = new THREE.DirectionalLight(col(mix(pal.accent2, '#ffffff', 0.4)), 2.6); scene.add(sunLight); scene.add(sunLight.target);
    const fill = new THREE.PointLight(col(pal.glow), 18, 30); fill.position.set(-5, 4, 6); scene.add(fill);
    const camFill = new THREE.DirectionalLight(col(mix(pal.accent2, '#ffffff', 0.5)), 0.9); camFill.position.set(-6, 3, -3); scene.add(camFill);
    scene.fog = new THREE.Fog(col(pal.bg[1]), 18, 110);
    const GY = -2.45;
    // opaque sky dome (additive sun glows need an opaque backdrop to read as light)
    const skyTex = sdTex(8, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, pal.bg[0]); gr.addColorStop(0.38, mix(pal.bg[0], pal.bg[1], 0.7));
      gr.addColorStop(0.5, mix(pal.bg[1], pal.glow, 0.35)); gr.addColorStop(1, pal.bg[1]);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(140, 32, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
    sky.renderOrder = -10; scene.add(sky);
    const sand = sdTex(512, 512, (g, w, h) => {
      g.fillStyle = mix(pal.bg[1], pal.accent, 0.38); g.fillRect(0, 0, w, h);
      const rr = rng(4);
      for (let i = 0; i < 2600; i++) { g.fillStyle = rr() < 0.5 ? 'rgba(255,230,190,.10)' : 'rgba(40,20,5,.12)'; g.fillRect(rr() * w, rr() * h, 1 + rr() * 3, 1 + rr() * 3); }
      for (let i = 0; i < 26; i++) { const y = rr() * h; g.strokeStyle = 'rgba(255,225,170,.10)'; g.lineWidth = 2 + rr() * 4; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 6); g.stroke(); }
    });
    sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(14, 14);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: sand, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = GY; scene.add(ground);
    // distant dunes (soft, fogged silhouettes)
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2 + r() * 0.4, d = 62 + r() * 18;
      const dune = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshStandardMaterial({ color: col(mix(pal.bg[1], pal.accent, 0.3)), roughness: 1 }));
      dune.scale.set(18 + r() * 14, 4 + r() * 4, 10 + r() * 6); dune.position.set(Math.cos(a) * d, GY, Math.sin(a) * d); dune.rotation.y = r() * 3; scene.add(dune);
    }
    // stones scattered around the pedestal (depth cues)
    const stoneM = new THREE.MeshStandardMaterial({ color: col('#9a8468'), roughness: 0.9, flatShading: true });
    const stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), stoneM, 26); scene.add(stones);
    { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = 5 + r() * 10, sz = 0.08 + r() * 0.2;
        q.setFromEuler(e.set(r() * 3, r() * 3, r() * 3)); m4.compose(V3(Math.cos(a) * d, GY + sz * 0.4, Math.sin(a) * d), q, V3(sz * 1.3, sz * 0.7, sz)); stones.setMatrixAt(i, m4); } }

    // ---------------------------------------------------------------- pedestal + dial
    const stoneTex = sdTex(256, 256, (g, w, h) => {
      g.fillStyle = '#b8a283'; g.fillRect(0, 0, w, h); const rr = rng(12);
      for (let i = 0; i < 1400; i++) { g.fillStyle = rr() < 0.5 ? 'rgba(255,245,225,.12)' : 'rgba(60,40,20,.12)'; g.fillRect(rr() * w, rr() * h, 1 + rr() * 4, 1 + rr() * 2); }
    });
    const mStone = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.85 });
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, -GY - 0.5, 32), mStone); column.position.y = GY + (-GY - 0.5) / 2; scene.add(column);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.3, 32), mStone); plinth.position.y = GY + 0.15; scene.add(plinth);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(RD + 0.18, RD - 0.05, 0.5, 64), mStone); cap.position.y = -0.25; scene.add(cap);
    const dialTex = sdTex(1024, 1024, (g, w, h) => {
      const toC = (x, z) => [(x / RD * 0.5 + 0.5) * w, (z / RD * 0.5 + 0.5) * h];
      const gr = g.createRadialGradient(w * 0.45, h * 0.4, 30, w / 2, h / 2, w * 0.52);
      gr.addColorStop(0, '#d9b36a'); gr.addColorStop(0.6, '#b98a43'); gr.addColorStop(1, '#7c5627');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const rr = rng(21);
      for (let i = 0; i < 900; i++) { g.fillStyle = rr() < 0.6 ? 'rgba(70,120,95,.07)' : 'rgba(255,240,200,.07)'; const x = rr() * w, y = rr() * h; g.beginPath(); g.arc(x, y, 2 + rr() * 9, 0, 7); g.fill(); }
      // chapter ring
      g.strokeStyle = 'rgba(60,35,10,.85)'; g.lineWidth = 6;
      for (const rad of [0.985, 0.86, 0.835]) { g.beginPath(); g.arc(w / 2, h / 2, rad * w / 2, 0, 7); g.stroke(); }
      for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, r0 = k % 6 ? 0.94 : 0.9; g.lineWidth = k % 6 ? 3 : 5;
        g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r0 * w / 2, h / 2 + Math.sin(a) * r0 * w / 2); g.lineTo(w / 2 + Math.cos(a) * 0.985 * w / 2, h / 2 + Math.sin(a) * 0.985 * w / 2); g.stroke(); }
      // compass letters: K (kuzey) G (güney) D (doğu) B (batı)
      g.fillStyle = 'rgba(55,30,8,.95)'; g.font = '900 54px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const [t, x, z] of [['K', 0, -1], ['G', 0, 1], ['D', 1, 0], ['B', -1, 0]]) { const c = toC(x * RD * 0.915, z * RD * 0.915); g.fillText(t, c[0], c[1]); }
      // hour lines radiating from the gnomon foot
      const o = toC(O.x, O.z);
      for (let hh = 5; hh <= 19; hh += 0.5) {
        const Hh = (hh - 12) * 15 * DEG, d = shadowDir(Hh);
        // intersect ray O + t d with circle radius 0.82 RD
        const R2 = RD * 0.82, b = O.x * d[0] + O.z * d[1], cc = O.x * O.x + O.z * O.z - R2 * R2, t = -b + Math.sqrt(b * b - cc);
        const e = toC(O.x + d[0] * t, O.z + d[1] * t), full = hh % 1 === 0;
        g.strokeStyle = full ? 'rgba(50,28,6,.9)' : 'rgba(50,28,6,.45)'; g.lineWidth = full ? 6 : 3;
        const t0 = full ? 0.18 : 0.5;
        const sx = toC(O.x + d[0] * t * t0, O.z + d[1] * t * t0);
        g.beginPath(); g.moveTo(sx[0], sx[1]); g.lineTo(e[0], e[1]); g.stroke();
        if (full && hh >= 5 && hh <= 19) {
          const n = toC(O.x + d[0] * (t - 0.24), O.z + d[1] * (t - 0.24));
          g.save(); g.translate(n[0], n[1]); g.font = `800 ${hh === 12 ? 46 : 38}px Inter`; g.fillText(SD_ROMAN[hh % 12], 0, 0); g.restore();
        }
      }
      g.fillStyle = 'rgba(50,28,6,.9)'; g.beginPath(); g.arc(o[0], o[1], 12, 0, 7); g.fill();
    });
    const face = new THREE.Mesh(new THREE.CircleGeometry(RD, 96), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.6, metalness: 0.3, emissive: col(pal.accent), emissiveIntensity: 0.04 }));
    face.rotation.x = -Math.PI / 2; face.position.y = 0.001; scene.add(face);
    const mBronze = new THREE.MeshStandardMaterial({ color: col('#b98a43'), roughness: 0.3, metalness: 0.75, emissive: col(pal.accent), emissiveIntensity: 0.05 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(RD + 0.01, 0.055, 12, 128), mBronze); rim.rotation.x = Math.PI / 2; rim.position.y = 0.02; scene.add(rim);
    const gShape = new THREE.Shape(); gShape.moveTo(0, 0); gShape.lineTo(LC, 0); gShape.lineTo(LC, LY); gShape.lineTo(0, 0);
    const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }); gGeo.translate(0, 0, -0.035);
    const gnomon = new THREE.Mesh(gGeo, mBronze); gnomon.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; gnomon.position.copy(O); scene.add(gnomon);
    // the style edge catches the light
    const edgeGlow = glowSprite(pal.accent2, 0.5, 0); scene.add(edgeGlow);

    // ---------------------------------------------------------------- shadows (analytic, from the sun direction)
    const mkShadow = (op) => {
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 3 * 80), 3));
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col('#1a0d03'), transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.position.y = 0.004; m.renderOrder = 2; scene.add(m); return m;
    };
    const shCore = mkShadow(0.62), shSoft = mkShadow(0.22);
    const setPoly = (mesh, poly) => {
      const a = mesh.geometry.attributes.position.array; let n = 0;
      for (let i = 1; i + 1 < poly.length && n < 78; i++) for (const q of [poly[0], poly[i], poly[i + 1]]) { a[n * 3] = q[0]; a[n * 3 + 1] = 0; a[n * 3 + 2] = q[1]; n++; }
      mesh.geometry.setDrawRange(0, n); mesh.geometry.attributes.position.needsUpdate = true;
    };
    // pedestal shadow on the sand (soft blob stretched away from the sun)
    const blobTex = sdTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, color: col('#2a1505'), transparent: true, opacity: 0.55, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = GY + 0.01; scene.add(blob);

    // ---------------------------------------------------------------- sun
    const RS = mode === 'arc' ? 6.2 : mode === 'dial' ? 4.7 : 15;
    const sunCore = glowSprite('#fffbe8', 1.6, 1), sunHalo = glowSprite(pal.accent2, 5, 0.6), sunBig = glowSprite(pal.glow, 18, 0.32);
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), new THREE.MeshBasicMaterial({ color: col('#fff6d8'), fog: false }));
    for (const o of [sunBig, sunHalo, sunDisc, sunCore]) { o.material.fog = false; scene.add(o); }
    // dust motes in the light
    const dustN = 260, dpos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) dpos.set([(r() - 0.5) * 16, GY + r() * 8, (r() - 0.5) * 16], i * 3);
    const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: col(pal.accent2), size: 0.04, transparent: true, opacity: 0.6, depthWrite: false }));
    scene.add(dust);

    // ---------------------------------------------------------------- per-mode extras
    const hours = P.hours || { dial: [5.9, 7.3], lines: [9, 10], arc: [5.7, 18.3], top: [6.3, 17.7], south: [6.3, 17.7] }[mode];
    const H0 = (hours[0] - 12) * 15 * DEG, H1 = (hours[1] - 12) * 15 * DEG;
    // hour-line highlights (lines mode): glowing strips over the engraved lines
    const strips = [];
    if (mode === 'lines' || mode === 'dial') {
      for (let hh = 6; hh <= 18; hh++) {
        const Hh = (hh - 12) * 15 * DEG, d = shadowDir(Hh);
        const R2 = RD * 0.82, b = O.x * d[0] + O.z * d[1], cc = O.x * O.x + O.z * O.z - R2 * R2, t = -b + Math.sqrt(b * b - cc);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.07, t * 0.82), new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        const mid = 0.18 * t + t * 0.41;
        m.position.set(O.x + d[0] * mid, 0.006, O.z + d[1] * mid);
        m.rotation.set(-Math.PI / 2, 0, Math.atan2(-d[0], -d[1]));
        const tipGlow = glowSprite(pal.accent2, 0.6, 0); tipGlow.position.set(O.x + d[0] * t * 0.95, 0.05, O.z + d[1] * t * 0.95); scene.add(tipGlow);
        scene.add(m); strips.push({ m, tipGlow, Hh, ang: Math.atan2(d[0], d[1]) });
      }
    }
    // sun path (arc): dotted arc, bright behind the sun, faint ahead
    let pathDone = null, pathAhead = null, pathS = [];
    if (mode === 'arc') {
      const n = 70, dg = new THREE.SphereGeometry(0.07, 10, 8);
      pathDone = new THREE.InstancedMesh(dg, new THREE.MeshBasicMaterial({ color: col(pal.accent), fog: false }), n);
      pathAhead = new THREE.InstancedMesh(dg, new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.35, fog: false }), n);
      scene.add(pathDone, pathAhead);
      const Hr = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(dec))));
      for (let i = 0; i < n; i++) { const Hh = lerp(-Hr, Hr, i / (n - 1)); pathS.push({ Hh, p: sdSun(phi, dec, Hh).multiplyScalar(RS) }); }
    }
    // sweep trail (top / south): ribbon following the shadow tip around the gnomon foot
    let ribbon = null, arrowHead = null, ribPts = [];
    const trailCol = south ? RED : pal.accent;
    if ((mode === 'top' || mode === 'south') && P.arrow !== false) {
      const n = 90, RR = 1.62;
      for (let i = 0; i < n; i++) {
        const Hh = lerp(H0, H1, i / (n - 1)), d = shadowDir(Hh);
        ribPts.push([O.x + d[0] * RR, O.z + d[1] * RR, d]);
      }
      const pos = new Float32Array((n - 1) * 6 * 3), wdt = 0.09;
      for (let i = 0; i < n - 1; i++) {
        const [ax, az, da] = ribPts[i], [bx, bz, db] = ribPts[i + 1];
        const q = [[ax - da[0] * wdt, az - da[1] * wdt], [ax + da[0] * wdt, az + da[1] * wdt], [bx + db[0] * wdt, bz + db[1] * wdt], [bx - db[0] * wdt, bz - db[1] * wdt]];
        [q[0], q[1], q[2], q[0], q[2], q[3]].forEach((v, k) => pos.set([v[0], 0, v[1]], (i * 6 + k) * 3));
      }
      const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      ribbon = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: col(trailCol), transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false }));
      ribbon.position.y = 0.012; ribbon.renderOrder = 3; scene.add(ribbon);
      const ag = new THREE.ConeGeometry(0.24, 0.5, 3); ag.rotateX(Math.PI / 2); ag.scale(1, 0.25, 1);  // flat triangle pointing +z
      arrowHead = new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ color: col(trailCol), depthWrite: false })); arrowHead.renderOrder = 3; scene.add(arrowHead);
    }
    const trailGlow = glowSprite(trailCol, 1.2, 0); scene.add(trailGlow);

    // ---------------------------------------------------------------- labels
    const lblDefs = P.labels || ({
      arc: [{ at: 'east', text: 'DOĞU', dy: -70 }, { at: 'west', text: 'BATI', dy: -70, cue: 'hit' }],
      top: [{ at: 'below', text: 'KUZEYDE', size: 104, color: mix(pal.accent, '#ffffff', 0.35) }],
      south: [{ at: 'below', text: 'GÜNEYDE', size: 104, color: mix(RED, '#ffffff', 0.45) }],
    }[mode] || []);
    const lbls = lblDefs.map(d => ({ d, l: labels.add('layer') }));
    const tmp = V3(0, 0, 0);

    // ---------------------------------------------------------------- camera
    const camDef = {
      dial:  { dist: portrait ? 11.5 : 8.5, yaw: -61, pitch: 11, tx: 0, ty: 1.9, tz: 0, fov: 42, sy: portrait ? 0.36 : 0, drift: 3.2 },
      lines: { dist: portrait ? 14.5 : 7.5, yaw: 12, pitch: 60, tx: 0, ty: 0.3, tz: -0.1, fov: 40, sy: portrait ? 0.2 : 0, drift: 1.4 },
      arc:   { dist: portrait ? 20 : 17, yaw: 194, pitch: 12, tx: 0, ty: 1.0, tz: 1.5, fov: 54, sy: portrait ? 0.24 : 0, drift: 0.8 },
      top:   { dist: portrait ? 17 : 8, yaw: 360, pitch: 84, tx: 0, ty: 0, tz: 0, fov: 40, sy: portrait ? 0.32 : 0, drift: 0.25 },
      south: { dist: portrait ? 17 : 8, yaw: 0, pitch: 84, tx: 0, ty: 0, tz: 0, fov: 40, sy: portrait ? 0.32 : 0, drift: -0.25 },
    }[mode] || {};
    const world = m => (m === 'south' ? 'S' : m === 'arc' ? 'A' : 'N');
    const camAt = (lt, dur, env) => {
      const e = env && env.prevP && world(env.prevP.mode || 'dial') !== world(mode) ? Object.assign({}, env, { prevCam: null }) : env;
      return shotCam(Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) }), e, lt, dur);
    };

    // hour angle as a pure function of lt
    const hourAngle = (lt, dur, hit) => {
      if (mode === 'lines') return lerp(H0, H1, progIO(lt, hit - 0.45, 0.9)) + 0.6 * DEG * lt;
      if (mode === 'arc') { const u = clamp01((lt - 0.05) / Math.max(0.6, dur - 0.25)); return lerp(H0, H1, 0.75 * EASE_IO(u) + 0.25 * u); }
      if (mode === 'top' || mode === 'south') return lerp(H0, H1, progIO(lt, 0.15, Math.max(0.6, hit + 0.1)));
      return lerp(H0, H1, clamp01(lt / Math.max(1, dur)));
    };

    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t;
        const hit = cue(cues, 'hit', Math.min(1.4, dur * 0.45));
        applyCam(camera, camAt(lt, dur, env), W, H);
        const pk = punch(lt, hit, 0.8);
        const Hh = hourAngle(lt, dur, hit);
        const sun = sdSun(phi, dec, Hh);
        const up = clamp01((sun.y - 0.0) / 0.08);          // fades shadows near the horizon
        // sun
        const sp = sun.clone().multiplyScalar(RS);
        for (const o of [sunCore, sunHalo, sunBig, sunDisc]) o.position.copy(sp);
        sunCore.scale.setScalar(1.6 + 0.8 * pk + 0.1 * Math.sin(t * 3));
        sunHalo.scale.setScalar((mode === 'arc' ? 3.6 : 4.5) * (1 + 0.25 * pk) + 0.25 * Math.sin(t * 1.7));
        sunBig.scale.setScalar(mode === 'arc' ? 11 : 18); sunBig.material.opacity = 0.3 + 0.18 * pk;
        sunDisc.scale.setScalar(mode === 'arc' ? 0.9 : 1.3); 

        sunLight.position.copy(sun.clone().multiplyScalar(10)); sunLight.intensity = 0.6 + 2.2 * clamp01(sun.y * 3);
        // gnomon shadow on the dial
        const w = 0.045, k = 1 / Math.max(0.02, sun.y);
        const Tp = [T.x - sun.x * T.y * k, T.z - sun.z * T.y * k];
        const pts = [];
        for (const dx of [-w, w]) pts.push([O.x + dx, O.z], [B.x + dx, B.z], [Tp[0] + dx, Tp[1]]);
        const hull = sdHull(pts), core = sdClipDisc(hull, RD * 0.995);
        const cx = hull.reduce((a, q) => a + q[0], 0) / hull.length, cz = hull.reduce((a, q) => a + q[1], 0) / hull.length;
        const soft = sdClipDisc(hull.map(q => { const dx = q[0] - cx, dz = q[1] - cz, l = Math.hypot(dx, dz) || 1; return [q[0] + dx / l * 0.07, q[1] + dz / l * 0.07]; }), RD * 0.995);
        setPoly(shCore, core); setPoly(shSoft, soft);
        shCore.material.opacity = (0.62 + 0.12 * pk) * up; shSoft.material.opacity = 0.22 * up;
        edgeGlow.position.set(T.x, T.y + 0.02, T.z); edgeGlow.material.opacity = (0.35 + 0.4 * pk) * up; edgeGlow.scale.setScalar(0.6 + 0.4 * Math.sin(t * 2.4) * 0.3);
        // pedestal shadow on the sand
        const hl = Math.hypot(sun.x, sun.z) || 1, len = Math.min(14, 2.2 * hl / Math.max(0.08, sun.y));
        blob.scale.set(2.6, 2.6 + len, 1); blob.position.set(-sun.x / hl * len * 0.5, GY + 0.01, -sun.z / hl * len * 0.5);
        blob.rotation.set(-Math.PI / 2, 0, Math.atan2(-sun.x, -sun.z)); blob.material.opacity = 0.5 * up;
        face.material.emissiveIntensity = 0.04 + 0.1 * pk;
        // hour line highlights: the line under the shadow lights up
        if (strips.length) {
          const sd = [Tp[0] - O.x, Tp[1] - O.z], sang = Math.atan2(sd[0], sd[1]);
          strips.forEach(st => {
            let da = Math.abs(sang - st.ang); if (da > Math.PI) da = 2 * Math.PI - da;
            const near = Math.exp(-Math.pow(da / (4 * DEG), 2));
            const on = mode === 'lines' ? 1 : 0.35;
            st.m.material.opacity = on * near * (0.75 + 0.25 * Math.sin(t * 5)) * up;
            st.tipGlow.material.opacity = on * near * (0.8 + 0.6 * pk) * up; st.tipGlow.scale.setScalar(0.7 + 0.5 * near * (1 + pk));
          });
        }
        // sun path
        if (pathDone) {
          const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
          pathS.forEach((ps, i) => {
            const done = ps.Hh <= Hh;
            m4.compose(ps.p, q, V3(1, 1, 1).multiplyScalar(done ? 1 : 0.0001)); pathDone.setMatrixAt(i, m4);
            m4.compose(ps.p, q, V3(1, 1, 1).multiplyScalar(done ? 0.0001 : 0.7)); pathAhead.setMatrixAt(i, m4);
          });
          pathDone.instanceMatrix.needsUpdate = true; pathAhead.instanceMatrix.needsUpdate = true;
        }
        // sweep trail + arrow head
        if (ribbon) {
          const f = clamp01((Hh - H0) / (H1 - H0)), n = ribPts.length, idx = Math.max(1, Math.round(f * (n - 1)));
          ribbon.geometry.setDrawRange(0, (idx - 0) * 6); ribbon.material.opacity = 0.95 * clamp01(f * 8);
          const a = ribPts[Math.max(0, idx - 2)], b = ribPts[idx] || ribPts[n - 1];
          arrowHead.position.set(b[0], 0.016, b[1]);
          arrowHead.rotation.set(0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0);
          arrowHead.scale.setScalar((0.9 + 0.5 * pk) * clamp01(f * 8));
          trailGlow.position.set(b[0], 0.1, b[1]); trailGlow.material.opacity = (0.55 + 0.4 * pk) * clamp01(f * 8); trailGlow.scale.setScalar(1.1 + 0.6 * pk + 0.1 * Math.sin(t * 4));
        }
        // labels
        const anchors = {
          sun: sp, shadow: V3(Tp[0] * 0.6 + O.x * 0.4, 0, Tp[1] * 0.6 + O.z * 0.4),
          east: pathS.length ? pathS[0].p.clone().setY(0.2) : V3(RD, 0, 0), west: pathS.length ? pathS[pathS.length - 1].p.clone().setY(0.2) : V3(-RD, 0, 0),
          arrow: ribbon ? V3(ribPts[ribPts.length - 1][0], 0, ribPts[ribPts.length - 1][1]) : V3(0, 0, 0),
        };
        lbls.forEach(({ d, l }, k) => {
          const at = cue(cues, d.cue || '__none', 0.25 + k * 0.3);
          const alpha = clamp01(spring(lt, at, 0.5) * 1.4);
          const c = d.color || pal.accent;
          const html = `<b style="font-size:${d.size || (portrait ? 92 : 76)}px;line-height:1.02;color:${c};text-shadow:0 4px 24px rgba(0,0,0,.55)">${d.text}</b>` + (d.sub ? `<small style="font-size:44px">${d.sub}</small>` : '');
          if (d.at === 'below') { l.set(html, W / 2 + (d.dx || 0), (portrait ? H * 0.565 : H * 0.8) + (d.dy || 0) + 30 * (1 - alpha), alpha, null, 0); return; }
          const a = anchors[d.at]; if (!a) { l.set('', 0, 0, 0); return; }
          const sc = toScreen(tmp.copy(a), camera, W, H);
          const x = Math.max(200, Math.min(W - 200, sc[0] + (d.dx || 0))), y = Math.max(400, Math.min(H * 0.58, sc[1] + (d.dy || 0)));
          const off = sc[2] > 1;
          const sz = 1 + 0.08 * punch(lt, at, 0.6);
          l.set(html.replace('font-size:', `transform:scale(${sz.toFixed(3)});display:block;font-size:`), x, y, off ? 0 : alpha, null, 0);
        });
        dust.rotation.y = t * 0.025; dust.position.y = 0.15 * Math.sin(t * 0.35);
      },
    };
  },
};
