// voyager: the Voyager space probe and its journey, four worlds in one type.
// P: {mode: "probe"|"path"|"helio"|"signal", camera: {...}, labels: [...]}
//  probe : close-up of the probe (white dish, magnetometer boom, RTG boom, gold-foil bus, golden record).
//          {beam: true (radio rings leave the dish), dim: true (status lights switch off one by one at hit),
//           earth: true (tiny pale blue dot far behind), labels: [{part: "dish"|"rtg"|"mag"|"record"|"bus"|"earth",
//           text, sub, at: "hit", dx, dy}]}
//  path  : Sun + planet orbits; Voyager's track Earth -> Jupiter -> Saturn, then up out of the planets' plane.
//          {from: "earth"|"jupiter"|"saturn"|"out" (+offset, e.g. "saturn+0.08"), to: ..., titan: true,
//           follow: 0..1 (camera follows the head), labels: [{body: "earth"|"jupiter"|"saturn"|"titan"|"head"|"plane", text, sub, at}]}
//  helio : the heliosphere bubble around the Sun in the interstellar wind; the probe flies out and crosses
//          the boundary (heliopause) with a flash. {from: 0.4, to: 1.25 (fraction of the boundary distance),
//           cross_label: "HELİOPOZ", cross_sub: "Ağustos 2012", labels: [{target: "bubble"|"sun"|"cross"|"head"|"tail", text, sub, at}]}
//  signal: Earth on the left, the probe on the right, radio pulses travelling between them + a time counter.
//          {dir: "out"|"back"|"both", bad: true (garbled red replies), counter: {to: "22,5", unit: "SAAT", label: "tek yön"},
//           labels: [{target: "earth"|"probe", text, sub, at}]}
// cues: hit (probe: lights off / beam; path: head reaches `to`; helio: crossing; signal: pulse arrives), back (signal both: reply arrives)
// Consecutive scenes of the same mode share one world and one continuous camera.
'use strict';

function vgTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  return t;
}
// thin cylinder between two points
function vgStrut(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8, 1), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
// the probe: dish faces +z, bus behind it; returns {g, parts, lights, rtgGlow}
function vgProbe(pal) {
  const g = new THREE.Group();
  const foil = vgTex(256, 256, (c, w, h) => {
    const r = rng(77);
    c.fillStyle = '#b8862c'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, s = 10 + r() * 40, l = r();
      c.fillStyle = l < 0.33 ? '#f2c45a' : l < 0.66 ? '#9a6a1c' : '#ffe39a';
      c.globalAlpha = 0.35 + r() * 0.4;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + s, y + (r() - 0.5) * s); c.lineTo(x + (r() - 0.5) * s, y + s); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
  });
  const mFoil = new THREE.MeshStandardMaterial({ map: foil, metalness: 0.55, roughness: 0.38, emissive: col('#3a2408'), emissiveIntensity: 0.6 });
  const mWhite = new THREE.MeshStandardMaterial({ color: col('#f1f1ec'), roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide });
  const mMetal = new THREE.MeshStandardMaterial({ color: col('#9aa0a8'), roughness: 0.4, metalness: 0.6 });
  const mDark = new THREE.MeshStandardMaterial({ color: col('#3a3c42'), roughness: 0.5, metalness: 0.5 });
  const mGold = new THREE.MeshStandardMaterial({ color: col('#e8b84a'), roughness: 0.22, metalness: 0.85, emissive: col('#6a4a10'), emissiveIntensity: 0.5 });
  const parts = {};
  // bus: decagonal prism, axis along z
  const busGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 10); busGeo.rotateX(Math.PI / 2);
  const bus = new THREE.Mesh(busGeo, mFoil); g.add(bus); parts.bus = bus;
  // high-gain dish: parabola opening towards +z
  const prof = []; for (let i = 0; i <= 24; i++) { const r = i / 24; prof.push(new THREE.Vector2(Math.max(0.001, r * 1.0), 0.26 * r * r)); }
  const dishGeo = new THREE.LatheGeometry(prof, 64); dishGeo.rotateX(Math.PI / 2);
  const dish = new THREE.Mesh(dishGeo, mWhite); dish.position.z = 0.18; g.add(dish); parts.dish = dish;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.018, 6, 64), mWhite); rim.position.z = 0.18 + 0.26; g.add(rim);
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 0.12, 16), mWhite); feed.rotation.x = Math.PI / 2; feed.position.z = 0.9; g.add(feed);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.5; g.add(vgStrut(V3(Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0.42), V3(0, 0, 0.86), 0.012, mWhite)); }
  // RTG boom (+x, down): three generators with fins and a warm glow
  const rA = V3(0.3, -0.22, -0.08), rB = V3(2.0, -0.62, -0.32);
  g.add(vgStrut(rA, rB, 0.025, mMetal));
  const rtgGlow = [];
  [0.55, 0.74, 0.93].forEach((u, k) => {
    const p = rA.clone().lerp(rB, u);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 14), mDark);
    c.position.copy(p); c.quaternion.setFromUnitVectors(V3(0, 1, 0), rB.clone().sub(rA).normalize()); g.add(c);
    for (let f = 0; f < 6; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.12), mDark);
      const a = f / 6 * Math.PI * 2; fin.position.set(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15); fin.rotation.y = -a; c.add(fin);
    }
    const gl = glowSprite('#ff7a3d', 0.55, 0.35); gl.position.copy(p); g.add(gl); rtgGlow.push(gl);
    if (k === 1) parts.rtg = c;
  });
  // science boom (-x, down) with the scan platform
  const sA = V3(-0.32, -0.2, -0.06), sB = V3(-1.75, -0.5, 0.15);
  g.add(vgStrut(sA, sB, 0.025, mMetal));
  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.26), mFoil); plat.position.copy(sB); g.add(plat);
  const cam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 12), mDark); cam1.rotation.x = Math.PI / 2; cam1.position.copy(sB).add(V3(0.05, 0.16, 0.12)); g.add(cam1);
  const cam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 12), mDark); cam2.rotation.x = Math.PI / 2; cam2.position.copy(sB).add(V3(-0.1, 0.16, 0.1)); g.add(cam2);
  parts.scan = plat;
  // magnetometer boom: a long thin lattice to upper left
  const mA = V3(-0.3, 0.2, -0.12), mB = V3(-3.9, 1.35, -0.9);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2, o = V3(0, Math.cos(a) * 0.035, Math.sin(a) * 0.035); g.add(vgStrut(mA.clone().add(o), mB.clone().add(o), 0.008, mMetal)); }
  for (let k = 1; k <= 12; k++) { const p = mA.clone().lerp(mB, k / 12); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 4, 12), mMetal); ring.position.copy(p); ring.lookAt(mB); g.add(ring); }
  const sens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), mWhite); sens.position.copy(mB); sens.quaternion.setFromUnitVectors(V3(0, 1, 0), mB.clone().sub(mA).normalize()); g.add(sens);
  const sens2 = sens.clone(); sens2.position.copy(mA.clone().lerp(mB, 0.6)); g.add(sens2);
  parts.mag = sens2;
  // plasma-wave antennas: two long whips in a V
  g.add(vgStrut(V3(-0.1, 0.1, -0.16), V3(-0.9, 2.3, -0.9), 0.009, mWhite));
  g.add(vgStrut(V3(0.1, 0.1, -0.16), V3(0.9, 2.3, -0.9), 0.009, mWhite));
  // golden record on the +x face of the bus
  const recGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.015, 32); recGeo.rotateZ(Math.PI / 2);
  const rec = new THREE.Mesh(recGeo, mGold); rec.position.set(0.41, 0.06, 0.0); g.add(rec); parts.record = rec;
  const recGlow = glowSprite(pal.accent, 0.5, 0); recGlow.position.set(0.47, 0.06, 0); g.add(recGlow);
  // status lights on the back of the bus
  const lights = [];
  for (let k = 0; k < 6; k++) {
    const a = -0.9 + k * 0.36, s = glowSprite(GREEN, 0.24, 0.9);
    s.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3 - 0.02, -0.18); g.add(s); lights.push(s);
  }
  return { g, parts, lights, rtgGlow, recGlow };
}
function vgSun(scene, size = 1) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3 * size, 32, 20), new THREE.MeshBasicMaterial({ color: col('#fff1c4') })));
  const c1 = glowSprite('#ffb347', 3.2 * size, 0.85), c2 = glowSprite('#ffffff', 1.1 * size, 0.9);
  g.add(c1, c2); scene.add(g);
  return t => { c1.scale.setScalar(3.2 * size * (1 + 0.05 * Math.sin(t * 1.3))); };
}
function vgOrbit(R, color, opacity) {
  const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; pts.push(V3(R * Math.cos(a), 0, -R * Math.sin(a))); }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col(color), transparent: true, opacity }));
}
const vgPos = (R, deg, y = 0) => V3(R * Math.cos(deg * DEG), y, -R * Math.sin(deg * DEG));
function vgLabelHTML(L, pal, big) {
  return `<b style="font-size:${L.size || (big ? 72 : 60)}px;color:${L.color === 'ink' ? pal.ink : (L.color || pal.accent)}">${L.text || ''}</b>` +
    (L.sub ? `<small style="font-size:${L.sub_size || 44}px;color:${pal.ink}">${L.sub}</small>` : '');
}

SHOTS.voyager = {
  kind: '3d',
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels, renderer } = ctx;
    const mode = P.mode || 'probe', portrait = H > W;
    const stars = starfield(scene, 19, 1800, 90);
    scene.add(new THREE.HemisphereLight(0xb8c8ff, 0x1a1208, 0.55));
    const wv = new THREE.Vector3();
    const scr = obj => { obj.getWorldPosition(wv); return toScreen(wv, camera, W, H); };
    const scrV = v => toScreen(v, camera, W, H);
    const lbls = (mode === 'signal' ? [] : P.labels || []).map(L => ({ L, el: labels.add(L.leader === false ? 'counter' : 'layer') }));
    const showLabel = (o, lt, cues, anchor, fb) => {
      const at = o.L.at ? cue(cues, o.L.at, fb) : fb, a = spring(lt, at, 0.6), grow = prog(lt, at, 0.5);
      const dx = o.L.dx ?? -320, dy = o.L.dy ?? -170;
      if (!anchor || anchor[2] > 1) { o.el.set('', 0, 0, 0); return; }
      const x = clamp01((anchor[0] + dx) / W) * W, y = Math.max(200, Math.min(780, anchor[1] + dy));
      o.el.set(vgLabelHTML(o.L, pal, o.L.big), Math.max(220, Math.min(W - 220, x)), y, clamp01(a * 1.5) * (lt >= at - 0.01 ? 1 : 0), [anchor[0], anchor[1]], grow);
    };
    let camDef, upd;

    if (mode === 'probe') {
      // ------------------------------------------------ close-up of the probe
      const pr = vgProbe(pal); scene.add(pr.g);
      const key = new THREE.DirectionalLight(0xfff4e0, 2.6); key.position.set(4, 3, 5); scene.add(key);
      const fill = new THREE.DirectionalLight(col(pal.accent2), 0.7); fill.position.set(-5, -1, -3); scene.add(fill);
      const rimL = new THREE.PointLight(col(pal.accent2), 30, 16); rimL.position.set(-2, 2, -3); scene.add(rimL);
      const sunS = glowSprite('#ffe2a8', 2.2, 0.9); sunS.position.set(30, 18, 40); scene.add(sunS);
      let earth = null, earthCore = null;
      if (P.earth) {
        const ep = P.earth_pos || [-7.5, 2.4, -12];
        earth = glowSprite('#6fb6ff', 1.1, 0.95); earth.position.set(...ep); scene.add(earth);
        earthCore = glowSprite('#dff0ff', 0.32, 1); earthCore.position.set(...ep); scene.add(earthCore);
        // the sunbeam the dot sits in (Pale Blue Dot)
        const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 30), new THREE.MeshBasicMaterial({ color: col('#ffd9a0'), transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        beam.position.set(...ep); beam.rotation.z = 0.5; scene.add(beam);
      }
      const rings = P.beam ? Array.from({ length: 3 }, () => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 64), new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        pr.g.add(m); return m;
      }) : [];
      camDef = { dist: 6.4, yaw: 38, pitch: 12, tx: -0.5, ty: 0.25, fov: 34, drift: 2.4, sy: portrait ? 0 : 0.16 };
      const anchorOf = part => part === 'earth' ? (earth ? scr(earth) : null) : (pr.parts[part] ? scr(pr.parts[part]) : null);
      upd = (lt, dur, cues, t) => {
        stars(t);
        const hit = cue(cues, 'hit', dur * 0.45);
        pr.g.rotation.z = 0.05 * Math.sin(t * 0.15);
        pr.g.rotation.y = 0.04 * Math.sin(t * 0.11);
        pr.g.position.y = 0.04 * Math.sin(t * 0.6);
        pr.rtgGlow.forEach((s, k) => { s.material.opacity = (P.dim ? lerp(0.4, 0.2, prog(lt, hit, 2)) : 0.4) + 0.12 * Math.sin(t * 2 + k); });
        pr.lights.forEach((s, k) => {
          const off = P.dim ? prog(lt, hit + k * 0.32, 0.25) : 0;
          const keep = P.dim && k === pr.lights.length - 1;           // one light stays on
          const o = keep ? 0.9 : 0.9 * (1 - off);
          s.material.opacity = o * (0.75 + 0.25 * Math.sin(t * 5 + k));
          s.material.color.set(off > 0.5 && !keep ? RED : GREEN);
          if (off > 0.5 && !keep) s.material.opacity = 0.55;
        });
        pr.recGlow.material.opacity = lbls.some(o => o.L.part === 'record') ? 0.3 + 0.5 * punch(lt, hit, 1.2) + 0.15 * Math.sin(t * 3) : 0;
        if (earth) { const p = 0.85 + 0.15 * Math.sin(t * 2.2); earth.material.opacity = 0.95 * p; earth.scale.setScalar(1.1 + 0.25 * punch(lt, hit, 1.0)); }
        rings.forEach((m, k) => {
          const ph = ((t * 0.55 + k / rings.length) % 1);
          m.position.z = 0.6 + ph * 1.8; m.scale.setScalar(0.85 + ph * 0.3); m.material.opacity = 0.3 * Math.sin(ph * Math.PI) * prog(lt, 0.2, 0.6);
        });
        scene.updateMatrixWorld();
        lbls.forEach((o, k) => showLabel(o, lt, cues, anchorOf(o.L.part), hit + k * 0.4));
      };
    } else if (mode === 'path') {
      // ------------------------------------------------ Solar System map and the track
      const sun = vgSun(scene, 1);
      scene.add(new THREE.PointLight(0xfff2d0, 60, 0, 1.2));
      const plane = new THREE.Mesh(new THREE.CircleGeometry(7.4, 96), new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.045, depthWrite: false, side: THREE.DoubleSide }));
      plane.rotation.x = -Math.PI / 2; scene.add(plane);
      const ORB = [[0.75, 0.12], [1.1, 0.12], [1.55, 0.3], [2.1, 0.14], [3.7, 0.32], [5.4, 0.32]];
      ORB.forEach(([R, o]) => scene.add(vgOrbit(R, pal.ink, o)));
      const A = { earth: 200, jupiter: 252, saturn: 298 };
      const pEarth = vgPos(1.55, A.earth), pJup = vgPos(3.7, A.jupiter), pSat = vgPos(5.4, A.saturn);
      const planet = (r, color, pos, tex) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), new THREE.MeshStandardMaterial({ color: col(tex ? '#ffffff' : color), map: tex || null, roughness: 0.8, emissive: col(color), emissiveIntensity: 0.18 }));
        m.position.copy(pos); scene.add(m); return m;
      };
      [[0.75, 120, '#a9a39a', 0.05], [1.1, 160, '#e8c98a', 0.08], [2.1, 235, '#c1532c', 0.06]].forEach(([R, a, c, r]) => planet(r, c, vgPos(R, a)));
      const earth = planet(0.09, '#3d8bff', pEarth);
      const eg = glowSprite('#5aa8ff', 0.5, 0.6); eg.position.copy(pEarth); scene.add(eg);
      const jTex = vgTex(256, 128, (c, w, h) => { const bands = ['#e9d8b8', '#c99a6a', '#f2e6cc', '#b5784a', '#e4c9a0', '#a8683e', '#efe0c2', '#c79868'];
        for (let i = 0; i < 16; i++) { c.fillStyle = bands[i % bands.length]; c.fillRect(0, i * h / 16, w, h / 16 + 1); }
        c.fillStyle = '#b5523a'; c.beginPath(); c.ellipse(170, 84, 18, 9, 0, 0, 7); c.fill(); });
      const jup = planet(0.34, '#d9b48a', pJup, jTex);
      const sTex = vgTex(256, 128, (c, w, h) => { const bands = ['#efe0b8', '#d8c08a', '#f6ead0', '#cdb27e']; for (let i = 0; i < 12; i++) { c.fillStyle = bands[i % 4]; c.fillRect(0, i * h / 12, w, h / 12 + 1); } });
      const sat = planet(0.27, '#e6d3a0', pSat, sTex);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.62, 64), new THREE.MeshBasicMaterial({ color: col('#d9c595'), transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
      ring.position.copy(pSat); ring.rotation.x = -Math.PI / 2 + 0.45; ring.rotation.y = 0.2; scene.add(ring);
      let titan = null;
      if (P.titan) { titan = planet(0.06, '#e09a3a', pSat.clone().add(V3(0.75, 0.04, -0.2))); }
      const jGlow = glowSprite(pal.accent, 1.4, 0), sGlow = glowSprite(pal.accent, 1.4, 0);
      jGlow.position.copy(pJup); sGlow.position.copy(pSat); scene.add(jGlow, sGlow);
      // track: Earth -> Jupiter -> Saturn -> up out of the plane
      const pts = [pEarth, vgPos(2.6, 224, 0.0), pJup.clone().add(V3(0.15, 0.05, 0.3)), vgPos(4.6, 278, 0.05),
        pSat.clone().add(V3(0.35, 0.1, 0.25)), pSat.clone().add(V3(1.3, 0.6, -0.2)), pSat.clone().add(V3(2.6, 1.6, -0.8)), pSat.clone().add(V3(4.6, 3.0, -1.8)), pSat.clone().add(V3(6.4, 4.3, -2.7))];
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const N = 400, RAD = 6;
      const nearU = p => { let best = 0, bd = 1e9; for (let i = 0; i <= N; i++) { const d = curve.getPointAt(i / N).distanceTo(p); if (d < bd) { bd = d; best = i / N; } } return best; };
      const U = { earth: 0, jupiter: nearU(pJup), saturn: nearU(pSat), out: 1 };
      const parseU = s => { if (typeof s === 'number') return s; const m = String(s).match(/^([a-z]+)\s*([+-][\d.]+)?$/); return m ? clamp01((U[m[1]] ?? 0) + (m[2] ? parseFloat(m[2]) : 0)) : 0; };
      const u0 = parseU(P.from ?? 'earth'), u1 = parseU(P.to ?? 'jupiter');
      const tubeGeo = new THREE.TubeGeometry(curve, N, 0.035, RAD, false);
      const track = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: col(pal.accent) })); scene.add(track);
      const ghost = new THREE.Mesh(new THREE.TubeGeometry(curve, N, 0.014, 4, false), new THREE.MeshBasicMaterial({ color: col(pal.ink), transparent: true, opacity: 0.1 })); scene.add(ghost);
      const head = glowSprite(pal.accent, 0.9, 1), headC = glowSprite('#ffffff', 0.25, 1); scene.add(head, headC);
      const uAt = (lt, dur, cues) => lerp(u0, u1, progIO(lt, 0.25, Math.max(0.6, cue(cues || {}, 'hit', dur * 0.75) - 0.25)));
      camDef = { dist: 14, yaw: -8, pitch: 34, tx: 1.6, ty: 0.6, tz: 2.6, fov: 34, drift: 1.2 };
      const bodies = { earth, jupiter: jup, saturn: sat, titan };
      upd = (lt, dur, cues, t) => {
        stars(t); sun(t);
        const u = uAt(lt, dur, cues);
        tubeGeo.setDrawRange(0, Math.max(0, Math.floor(u * N)) * RAD * 6);
        const hp = curve.getPointAt(Math.max(0.0005, u));
        head.position.copy(hp); headC.position.copy(hp);
        head.scale.setScalar(0.8 + 0.15 * Math.sin(t * 5));
        jup.rotation.y = t * 0.5; sat.rotation.y = t * 0.4;
        const passJ = u >= U.jupiter - 0.005, passS = u >= U.saturn - 0.005;
        jGlow.material.opacity = passJ ? 0.25 + 0.6 * Math.exp(-Math.max(0, uTime(U.jupiter)) * 2) : 0;
        sGlow.material.opacity = passS ? 0.25 + 0.6 * Math.exp(-Math.max(0, uTime(U.saturn)) * 2) : 0;
        function uTime(ub) { // seconds since the head passed ub (approx., pure in lt)
          for (let s = 0; s <= 60; s++) { const tt = lt - s * 0.1; if (tt < 0 || uAt(tt, dur, cues) < ub) return s * 0.1; } return 6;
        }
        scene.updateMatrixWorld();
        lbls.forEach((o, k) => {
          const b = o.L.body || 'head';
          let anchor = null, fb = 0.3 + k * 0.4;
          if (b === 'head') anchor = scrV(hp);
          else if (b === 'plane') anchor = scrV(vgPos(4.5, 150));
          else if (bodies[b]) { anchor = scr(bodies[b]); if (U[b] != null && U[b] > u0) fb = Math.max(0.2, lt - uTime(U[b]) + (u >= U[b] ? 0 : 99)); }
          showLabel(o, lt, cues, anchor, fb);
        });
      };
      // the camera can follow the head
      ctx._follow = (c, lt, dur) => {
        const f = P.follow || 0; if (!f) return c;
        const hp = curve.getPointAt(Math.max(0.0005, uAt(lt, dur, null)));
        c.tx = lerp(c.tx, hp.x, f); c.ty = lerp(c.ty, hp.y, f); c.tz = lerp(c.tz, hp.z, f); return c;
      };
    } else if (mode === 'helio') {
      // ------------------------------------------------ heliosphere bubble in the interstellar wind
      const sun = vgSun(scene, 0.8);
      [0.35, 0.55, 0.8, 1.2].forEach(R => scene.add(vgOrbit(R, pal.ink, 0.18)));
      const RX = 4, RY = 4.4, TAIL = 2.8;
      const bubGeo = (k) => {
        const g = new THREE.SphereGeometry(1, 72, 48), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { let x = p.getX(i); if (x < 0) x *= TAIL * (1 - 0.15 * Math.abs(p.getY(i))); p.setXYZ(i, x * RX * k, p.getY(i) * RY * k * (x < 0 ? 1 - 0.12 * Math.min(1, -x / 6) : 1), p.getZ(i) * RY * k); }
        g.computeVertexNormals(); return g;
      };
      const fres = (color, op) => new THREE.ShaderMaterial({
        uniforms: { uC: { value: col(color) }, uO: { value: op } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `uniform vec3 uC; uniform float uO; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4); gl_FragColor = vec4(uC * (0.15 + 1.2 * f), (0.04 + f) * uO); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      });
      const mBub = fres(pal.accent2, 0.9), mShock = fres(pal.accent, 0.4);
      scene.add(new THREE.Mesh(bubGeo(1), mBub));
      scene.add(new THREE.Mesh(bubGeo(0.72), mShock));
      // interstellar wind: particles streaming -x, deflected around the bubble
      const NP = 520, r = rng(5), lanes = Array.from({ length: NP }, () => ({ y: (r() - 0.5) * 14, z: (r() - 0.5) * 10, x: r() * 26, v: 1.2 + r() * 0.8 }));
      const wpos = new Float32Array(NP * 3), wGeo = new THREE.BufferGeometry(); wGeo.setAttribute('position', new THREE.BufferAttribute(wpos, 3));
      scene.add(new THREE.Points(wGeo, new THREE.PointsMaterial({ color: col(pal.accent2), size: 0.12, transparent: true, opacity: 0.7, depthWrite: false })));
      const sm = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
      // probe track
      const dir = V3(1, 0.45, -0.04).normalize();
      const rc = 1 / Math.sqrt((dir.x / RX) ** 2 + (dir.y / RY) ** 2 + (dir.z / RY) ** 2);
      const Lmax = rc * 1.45, NS = 200, RADT = 6;
      const tGeo = new THREE.TubeGeometry(new THREE.LineCurve3(V3(0, 0, 0), dir.clone().multiplyScalar(Lmax)), NS, 0.035, RADT, false);
      scene.add(new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ color: col(pal.accent) })));
      const head = glowSprite(pal.accent, 0.9, 1), headC = glowSprite('#ffffff', 0.25, 1); scene.add(head, headC);
      const crossP = dir.clone().multiplyScalar(rc);
      const flash = glowSprite('#ffffff', 2, 0), flashC = glowSprite(pal.accent2, 4, 0); flash.position.copy(crossP); flashC.position.copy(crossP); scene.add(flash, flashC);
      const f0 = P.from ?? 0.35, f1 = P.to ?? 0.85;
      const crossing = f0 < 1 && f1 > 1;
      // the head reaches the boundary exactly at the hit cue when it crosses
      const fAt = (lt, dur, cues) => {
        const h = cue(cues || {}, 'hit', dur * 0.55);
        if (!crossing) return lerp(f0, f1, progIO(lt, 0.2, Math.max(0.6, dur - 0.6)));
        return lt < h ? lerp(f0, 1, progIO(lt, 0.15, Math.max(0.3, h - 0.15)) ) : lerp(1, f1, prog(lt, h, Math.max(0.6, dur - h)));
      };
      const crossLbl = crossing || P.cross_label ? labels.add('layer') : null;
      camDef = { dist: 17, yaw: 8, pitch: 14, tx: 0.6, ty: 0.9, tz: 0, fov: 34, drift: 1.4, sy: portrait ? 0 : 0.1 };
      upd = (lt, dur, cues, t) => {
        stars(t); sun(t);
        const h = cue(cues, 'hit', dur * 0.55);
        const f = fAt(lt, dur, cues), hp = dir.clone().multiplyScalar(f * rc);
        tGeo.setDrawRange(0, Math.floor(clamp01(f * rc / Lmax) * NS) * RADT * 6);
        head.position.copy(hp); headC.position.copy(hp); head.scale.setScalar(0.8 + 0.15 * Math.sin(t * 5));
        const fl = crossing ? punch(lt, h, 1.6) : 0;
        flash.material.opacity = fl; flash.scale.setScalar(2 + 3 * (1 - fl));
        flashC.material.opacity = crossing && lt >= h ? 0.35 + 0.5 * fl : 0;
        mBub.uniforms.uO.value = 0.9 + 0.6 * fl + 0.08 * Math.sin(t * 1.5);
        for (let i = 0; i < NP; i++) {
          const L = lanes[i]; const x = 13 - ((L.x + t * L.v) % 26);
          const r0 = Math.hypot(L.y, L.z) + 1e-3, Rd = 4.9 * sm(7.5, 3.4, x);
          const rr = Math.sqrt(r0 * r0 + Rd * Rd);
          wpos[i * 3] = x; wpos[i * 3 + 1] = L.y / r0 * rr; wpos[i * 3 + 2] = L.z / r0 * rr;
        }
        wGeo.attributes.position.needsUpdate = true;
        scene.updateMatrixWorld();
        if (crossLbl) {
          const at = crossing ? h : cue(cues, 'hit', dur * 0.4), a = spring(lt, at, 0.6), sp = scrV(crossP);
          crossLbl.set(vgLabelHTML({ text: P.cross_label || 'HELİOPOZ', sub: P.cross_sub, size: 76 }, pal), Math.min(W - 260, sp[0] + 330), Math.max(150, sp[1] - 150), clamp01(a * 1.5) * (lt >= at ? 1 : 0), [sp[0], sp[1]], prog(lt, at, 0.5));
        }
        const anchorOf = tg => tg === 'sun' ? scrV(V3(0, 0, 0)) : tg === 'cross' ? scrV(crossP) : tg === 'head' ? scrV(hp)
          : tg === 'tail' ? scrV(V3(-8.5, 2.2, 0)) : scrV(V3(-0.6, RY * 0.98, 0.6));
        lbls.forEach((o, k) => showLabel(o, lt, cues, anchorOf(o.L.target || 'bubble'), 0.4 + k * 0.6));
      };
    } else {
      // ------------------------------------------------ signal: Earth <-> probe radio pulses
      const EX = -4.4, PX = 4.4;
      const maps = surfaceMaps(renderer, 0, 1.7);
      const earth = new THREE.Mesh(new THREE.SphereGeometry(0.95, 64, 40), new THREE.MeshStandardMaterial({ map: maps.albedo, roughness: 0.7, emissive: col('#0a1a3a'), emissiveIntensity: 0.4 }));
      earth.position.set(EX, 0, 0); scene.add(earth);
      const atmo = glowSprite('#4f9bff', 3.0, 0.55); atmo.position.set(EX, 0, -0.3); scene.add(atmo);
      const key = new THREE.DirectionalLight(0xfff4e0, 2.4); key.position.set(-2, 2, 6); scene.add(key);
      const rimL = new THREE.PointLight(col(pal.accent2), 25, 16); rimL.position.set(2, 2, -3); scene.add(rimL);
      const pr = vgProbe(pal); pr.g.scale.setScalar(0.75); pr.g.position.set(PX, 0.2, 0); pr.g.rotation.y = -Math.PI / 2; scene.add(pr.g);
      // dotted line between them
      const ND = 70, dpos = new Float32Array(ND * 3);
      for (let i = 0; i < ND; i++) dpos.set([lerp(EX + 1.2, PX - 0.8, i / (ND - 1)), 0.05, 0], i * 3);
      const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
      scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({ color: col(pal.ink), size: 0.045, transparent: true, opacity: 0.35, depthWrite: false })));
      const dirMode = P.dir || (P.bad ? 'back' : 'out');
      const outC = pal.accent2, backC = P.bad ? RED : GREEN;
      const mkPulse = c => { const g = new THREE.Group(); [0, 1, 2].forEach(k => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.42 - k * 0.08, 0.028, 8, 48), new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.y = Math.PI / 2; m.position.x = -k * 0.22; g.add(m); }); const gl = glowSprite(c, 1.3, 0); g.add(gl); scene.add(g); return g; };
      const outP = Array.from({ length: 3 }, () => mkPulse(outC)), backP = Array.from({ length: 3 }, () => mkPulse(backC));
      const pulseAt = (g, x, op, back, jit) => {
        g.position.set(x, 0.05 + jit, 0); g.rotation.y = back ? Math.PI : 0;
        g.children.forEach((m, k) => { m.material.opacity = op * (k === 3 ? 0.5 : 1 - k * 0.25); });
        g.visible = op > 0.01;
      };
      const C = P.counter, total = C ? parseNum(C.to) : 0, dec = C && String(C.to).includes(',') ? 1 : 0;
      const cLbl = C ? labels.add('counter') : null;
      const eLbl = labels.add('counter'), pLbl = labels.add('counter');
      const glyph = labels.add('counter');
      camDef = { dist: 11, yaw: 0, pitch: 7, tx: 0, ty: -0.1, fov: 34, drift: 0.8 };
      upd = (lt, dur, cues, t) => {
        stars(t);
        earth.rotation.y = t * 0.15;
        pr.g.position.y = 0.2 + 0.05 * Math.sin(t * 0.8);
        pr.lights.forEach((s, k) => { s.material.opacity = 0.8; });
        const hit = cue(cues, 'hit', dirMode === 'both' ? dur * 0.45 : dur * 0.7);
        const back = cue(cues, 'back', dur * 0.88);
        const span = PX - 0.9 - (EX + 1.1);
        // lead pulse travel windows
        const oS = 0.2, oE = hit, bS = dirMode === 'both' ? hit + 0.3 : 0.2, bE = dirMode === 'both' ? back : hit;
        const doOut = dirMode !== 'back', doBack = dirMode !== 'out';
        outP.forEach((g, k) => {
          const a = oS + k * 0.45, p = lin(lt, a, Math.max(0.5, oE - oS));
          pulseAt(g, EX + 1.1 + span * p, doOut && lt >= a ? (p < 1 ? 1 : Math.exp(-(lt - a - (oE - oS)) * 4)) : 0, false, 0);
        });
        backP.forEach((g, k) => {
          const a = bS + k * 0.45, p = lin(lt, a, Math.max(0.5, bE - bS));
          const jit = P.bad ? 0.12 * Math.sin(t * 37 + k * 5) * Math.sin(t * 13) : 0;
          pulseAt(g, PX - 0.9 - span * p, doBack && lt >= a ? (p < 1 ? (P.bad ? 0.6 + 0.4 * Math.abs(Math.sin(t * 23 + k)) : 1) : Math.exp(-(lt - a - (bE - bS)) * 4)) : 0, true, jit);
        });
        // arrival flashes
        const fo = doOut ? punch(lt, oE, 0.9) : 0, fb = doBack ? punch(lt, bE, 0.9) : 0;
        pr.g.scale.setScalar(0.75 * (1 + 0.08 * fo));
        atmo.material.opacity = 0.55 + 0.4 * fb;
        scene.updateMatrixWorld();
        const sp = scrV(V3(PX, -1.15, 0)), se = scrV(V3(EX, -1.4, 0));
        const lp = P.labels || [];
        const eT = (lp.find(l => l.target === 'earth') || { text: 'DÜNYA' }), pT = (lp.find(l => l.target === 'probe') || { text: 'VOYAGER 1' });
        eLbl.set(vgLabelHTML(Object.assign({ color: 'ink', size: 56 }, eT), pal), se[0], Math.min(810, se[1] + 40), prog(lt, 0.1, 0.5));
        pLbl.set(vgLabelHTML(Object.assign({ color: 'ink', size: 56 }, pT), pal), sp[0], Math.min(810, sp[1] + 40), prog(lt, 0.1, 0.5));
        if (cLbl) {
          let v;
          if (dirMode === 'both') v = lt < oE ? total / 2 * lin(lt, oS, oE - oS) : total / 2 + total / 2 * lin(lt, bS, bE - bS);
          else if (dirMode === 'back') v = total * lin(lt, bS, bE - bS);
          else v = total * lin(lt, oS, oE - oS);
          const pk = punch(lt, dirMode === 'both' ? bE : (doOut ? oE : bE), 0.8);
          cLbl.set(`<b style="font-size:${150 * (1 + 0.1 * pk)}px;color:${pal.accent}">${fmtNum(v, dec)} ${C.unit || ''}</b>` + (C.label ? `<small style="font-size:46px">${C.label}</small>` : ''),
            W / 2, 300, prog(lt, 0.1, 0.4));
        }
        if (P.bad) {
          const rg = rng(1 + Math.floor(t * 9)), CH = '01#%?&@*/!<>$=';
          let s = ''; for (let i = 0; i < 12; i++) s += CH[Math.floor(rg() * CH.length)];
          const a = lt >= bE ? prog(lt, bE, 0.3) : 0;
          glyph.set(`<b style="font-size:84px;color:${RED};letter-spacing:.08em">${s}</b><small style="font-size:46px">${P.bad_label || 'ANLAMSIZ VERİ'}</small>`, Math.max(se[0] + 120, 520), 290, a);
        } else glyph.set('', 0, 0, 0);
      };
    }

    const PP = Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) });
    const camAt = (lt, dur, env) => {
      const same = env && env.prevP && (env.prevP.mode || 'probe') === mode;
      let c = shotCam(PP, same ? env : null, lt, dur);
      if (ctx._follow) c = ctx._follow(c, lt, dur);
      return c;
    };
    return {
      camAt,
      update(lt, dur, cues, env) {
        applyCam(camera, camAt(lt, dur, env), W, H);
        camera.updateMatrixWorld();
        upd(lt, dur, cues, env.t);
      },
    };
  },
};
