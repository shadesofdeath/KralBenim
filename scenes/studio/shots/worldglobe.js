// worldglobe: a stylised 3D Earth with real (simplified) continent outlines, a hemisphere tint, the equator ring
// and a pulsing marker with a beam and label. The globe turns until the marker faces the camera at the hit.
// P: {marker: {lat: 48, lon: 10, text: "AVRUPA", sub: "1300'ler"}, hemisphere: "north"|"south"|null,
//     equator: true, spin: 45 (degrees still to turn before the hit), camera: {...}}
// cues: hit (marker lands, beam + label)
'use strict';

// simplified coastlines [lon, lat] (good enough at globe scale)
const WG_LAND = [
  // Eurasia
  [[-9,37],[-9,43.5],[-1.5,43.5],[-4.6,48.4],[1.5,50.9],[4,52],[8.5,53.6],[8.2,56.8],[10.6,57.7],[10.5,54.5],[14,54],[19,54.5],[21,57],[23.5,59.5],[30,60],[23,60.5],[21.5,61.5],[25,65],[21.5,65.8],[17.5,62.5],[18.5,60],[16,56.5],[13,55.5],[11,58.5],[8,58],[5,59],[5,62],[10,64],[14,67.5],[19,70],[25,71],[30,70],[40,67],[44,68],[53,68.5],[60,69],[68,72],[80,73],[88,75],[100,77],[105,77.5],[113,73.5],[130,71],[140,72],[150,71],[160,70],[170,69.5],[180,68],[180,65],[170,60],[163,58],[156,51],[155,59],[143,59],[137,54],[141,52],[140,48],[135,43],[129,41],[129,35],[126,37],[125,40],[121,40],[119,39],[122,37],[120,34],[122,30],[119,25],[113,22],[108,21.5],[106,18],[109,12],[105,8.6],[103,10],[100,13.5],[99,9],[101,6.5],[103.5,1.3],[100,3.5],[98,8],[98,16],[94,16],[92,22],[87,21.5],[80,15],[80,9.5],[77,8],[73,16],[72.5,21],[68,23.5],[62,25],[57,25.7],[56.5,27],[52,27.5],[48,30],[50,26],[51.5,24],[56,26],[58.8,22.4],[55,17],[52,16],[43,12.5],[42.5,15.5],[39,21.5],[35,28],[34.3,31],[35.5,33],[36,36.5],[32,36.3],[28,36.7],[26.3,38.5],[26.5,40.5],[24,40.5],[23,36.5],[21,38],[19.5,41.5],[13.5,45.5],[12.3,44.5],[16,41.5],[18.5,40],[16,38],[15.6,40],[12,42],[10,44],[7.5,43.8],[3,43.3],[3.2,42],[0,39.5],[-0.5,38],[-2,36.7],[-5.5,36],[-9,37]],
  // Africa
  [[-17,21],[-17,15],[-16.5,12],[-13,8],[-8,4.5],[-2,5],[6,4.3],[9.5,3.5],[9.8,-1],[12,-6],[13.5,-11],[12,-17],[15,-27],[18.5,-34.3],[20,-34.8],[26,-33.8],[31,-29],[33,-25.5],[35.5,-24],[35,-19],[40.5,-15],[40,-10],[39,-5],[41.5,-1.5],[48,4.5],[51,11.8],[43.5,11.5],[39.5,15.5],[36.5,22],[33.5,28],[32.3,31.2],[29,30.9],[25,31.7],[20,30.8],[19.5,32.5],[11,33.3],[10.5,37],[9.5,37.3],[3,36.8],[-1,35.5],[-6,35.8],[-9.8,30],[-13,27.5],[-17,21]],
  // North America
  [[-168,65.5],[-162,70],[-156,71.3],[-140,69.6],[-128,70],[-115,68.5],[-95,68],[-90,69],[-82,68],[-80,63],[-93,59],[-94.5,59],[-92,57],[-82,55],[-79,52],[-77,58],[-76,62],[-71,61.5],[-65,60],[-61,56],[-56,52],[-60,47.5],[-64,46],[-66,44.5],[-70,43],[-70,41.6],[-74,40.5],[-76,37],[-75.5,35],[-81,31],[-80,25.3],[-82,27],[-82.7,29.5],[-85,29.7],[-89,30.3],[-90,29],[-94,29.6],[-97.5,27],[-97.5,22],[-95,18.6],[-91,19],[-90.5,21],[-87,21.5],[-88,16],[-84,15],[-83.5,11],[-79.5,9.5],[-77.5,8.3],[-80,7.3],[-83,8.5],[-86,11],[-92,14.5],[-97,16],[-105.5,20],[-105.5,23],[-109,26],[-112.7,31.5],[-114.5,30],[-110,23],[-112,25],[-115,29.5],[-117,32.5],[-120.5,34.5],[-124,40],[-124,47],[-125,49],[-130,54.5],[-137,59],[-146,60.5],[-152,59],[-158,57],[-164,55],[-157,58.5],[-162,60],[-165,62.5],[-168,65.5]],
  // Greenland
  [[-73,78],[-60,82],[-30,83.5],[-20,81],[-18,76],[-22,70],[-32,68],[-40,65],[-43,60],[-48,61],[-52,65],[-54,69],[-57,74],[-66,76],[-73,78]],
  // South America
  [[-77.5,8.3],[-72,12],[-62,10.7],[-60,8.5],[-52,5],[-50,1.8],[-44,-2.5],[-35,-5.5],[-39,-13.5],[-41,-22],[-48.5,-26],[-53,-34],[-58,-38.5],[-62,-39],[-65,-42],[-65.5,-47],[-69,-51],[-68.5,-55],[-72.5,-53.5],[-75,-48],[-73.5,-42],[-73.5,-36],[-71.5,-30],[-70.5,-18],[-76,-14],[-81,-6],[-80,-1],[-77,4],[-77.5,8.3]],
  // Australia
  [[114,-22],[113.5,-26],[115,-34],[118,-35],[124,-33.8],[131,-31.5],[135,-34.5],[138,-35],[140,-38],[146,-39],[150,-37.5],[153.5,-28],[153,-25],[146,-19],[145,-14.5],[142.5,-10.7],[141.5,-13],[141,-17],[136,-15],[137,-12],[131,-11.2],[129,-15],[125,-14],[122,-18],[114,-22]],
  // Britain, Ireland, Japan, Madagascar, Sumatra, Borneo, New Guinea, Java, Iceland
  [[-5.7,50],[1.5,51],[1.7,52.8],[0,53.5],[-1.5,55],[-2,57.6],[-3.5,58.6],[-5,58.6],[-6,56.5],[-4.8,54.8],[-3,54],[-3.1,53.3],[-4.6,52.8],[-5.3,51.7],[-3,51.4],[-5.7,50]],
  [[-6,52],[-6,54],[-7.5,55.3],[-10,54],[-10.3,51.8],[-6,52]],
  [[130,31],[131.5,34],[135,34],[139.8,35.2],[141,38],[141.5,41.5],[140,41],[139.8,40],[139,38],[136.8,37],[135,35.6],[132,35.4],[130,33.5],[130,31]],
  [[44,-25],[47,-25],[50.5,-15.5],[49.3,-12],[44,-17],[44,-25]],
  [[95.3,5.6],[98.5,3.6],[106,-6],[104.5,-5.9],[101,-2],[95.3,5.6]],
  [[109,1.5],[117,7],[119,5],[117.5,1],[116,-4],[110.5,-3],[109,1.5]],
  [[131,-1],[141,-2.6],[150,-10.5],[143,-9],[138,-8],[131,-1]],
  [[105,-6],[114.5,-7.8],[106,-7.4],[105,-6]],
  [[-24,65.5],[-18,66.5],[-13.5,65],[-18,63.4],[-22.5,63.8],[-24,65.5]],
];
const WG_WATER = [
  [[28,41.2],[28,43.7],[30,45.8],[33,46],[32.5,44.5],[34,44.5],[37.5,45],[36.5,45.5],[39,47],[41.5,42],[36,41.6],[31,41.1],[28,41.2]],
  [[47,44.5],[49,46.5],[53,46.5],[53,42],[54,38],[51,36.6],[49,37.5],[50.3,40.5],[47,44.5]],
];
const wgDir = (lat, lon) => V3(Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.sin(lat * DEG), -Math.cos(lat * DEG) * Math.sin(lon * DEG));

SHOTS.worldglobe = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W;
    const mk = Object.assign({ lat: 48, lon: 10, text: '', sub: '' }, P.marker || {});
    const hemi = P.hemisphere === undefined ? 'north' : P.hemisphere;
    const stars = starfield(scene, 11);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.6); key.position.set(-3, 2.5, 5); scene.add(key);
    const rimL = new THREE.DirectionalLight(col(pal.accent2), 1.2); rimL.position.set(4, 1, -3); scene.add(rimL);
    const halo = glowSprite(pal.glow, 4.4, 0.45); halo.position.set(0, 0, -0.8); scene.add(halo);
    const tex = (() => {
      const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
      const g = c.getContext('2d'), w = c.width, h = c.height;
      const X = lon => (lon + 180) / 360 * w, Y = lat => (90 - lat) / 180 * h;
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e3a63'); gr.addColorStop(0.5, '#155a8a'); gr.addColorStop(1, '#0e3a63');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); };
      // land
      for (const pts of WG_LAND) { poly(pts); g.fillStyle = '#7d8a4a'; g.fill(); }
      g.fillStyle = '#c9b27a'; for (const pts of WG_LAND) { poly(pts); g.save(); g.clip(); const rr = rng(3); for (let i = 0; i < 900; i++) { g.globalAlpha = 0.18; g.fillRect(rr() * w, rr() * h, 8 + rr() * 30, 4 + rr() * 12); } g.restore(); }
      g.globalAlpha = 1;
      for (const pts of WG_WATER) { poly(pts); g.fillStyle = '#155a8a'; g.fill(); }
      for (const pts of WG_LAND) { poly(pts); g.strokeStyle = 'rgba(255,240,200,.55)'; g.lineWidth = 2.5; g.stroke(); }
      g.fillStyle = '#e8eef5'; g.fillRect(0, Y(-70), w, h - Y(-70));
      // graticule
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2;
      for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(w, Y(lat)); g.stroke(); }
      for (let lon = -180; lon < 180; lon += 30) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), h); g.stroke(); }
      // hemisphere tint
      if (hemi) { g.fillStyle = rgba(pal.accent, 0.2); hemi === 'north' ? g.fillRect(0, 0, w, h / 2) : g.fillRect(0, h / 2, w, h / 2); }
      const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const group = new THREE.Group(); scene.add(group);
    group.rotation.z = 0;   // axis upright: north at the top of the screen
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0.0, emissive: col('#0a1a30'), emissiveIntensity: 0.25 }));
    group.add(globe);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 48), new THREE.MeshBasicMaterial({ color: col('#7cc0ff'), transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(atmo);
    let eq = null;
    if (P.equator !== false) { eq = new THREE.Mesh(new THREE.TorusGeometry(1.004, 0.006, 8, 160), new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.8 })); eq.rotation.x = Math.PI / 2; group.add(eq); }
    // marker
    const mdir = wgDir(mk.lat, mk.lon);
    const mGroup = new THREE.Group(); group.add(mGroup);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.065, 48), new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    const ring2 = ring.clone(); ring2.material = ring.material.clone();
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), new THREE.MeshBasicMaterial({ color: col('#fff6d8') }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 0.5, 12), new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0.9, depthWrite: false }));
    beam.position.y = 0.25;
    const mGlow = glowSprite(pal.accent, 0.4, 0);
    [ring, ring2, dot].forEach(o => mGroup.add(o)); mGroup.add(beam); mGroup.add(mGlow);
    ring.rotation.x = ring2.rotation.x = -Math.PI / 2;
    mGroup.position.copy(mdir.clone().multiplyScalar(1.002));
    mGroup.quaternion.setFromUnitVectors(V3(0, 1, 0), mdir);
    const lbl = labels.add('layer');
    const face = -(mk.lon + 90) * DEG;
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({ dist: portrait ? 6.0 : 4.2, yaw: 0, pitch: mk.lat * 0.45, fov: 34, sy: portrait ? 0.2 : 0, drift: 0.6 }, P.camera || {}) }), null, lt, dur);
    const tmp = V3(0, 0, 0);
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.4, dur * 0.5));
        const c = camAt(lt, dur, env); applyCam(camera, c, W, H); stars(t);
        const pk = punch(lt, hit, 0.8);
        // turn so the marker faces the camera (camera yaw included), then keep a slow drift
        const spin = (P.spin != null ? P.spin : 45) * DEG;
        group.rotation.y = face + c.yaw * DEG + spin * (1 - progIO(lt, 0, Math.max(0.6, hit))) + 0.03 * Math.max(0, lt - hit);
        const on = prog(lt, hit - 0.15, 0.4);
        const pulse = ((lt - hit) % 1.1 + 1.1) % 1.1;
        ring.scale.setScalar(on * (1 + 0.6 * pk)); ring.material.opacity = on;
        ring2.scale.setScalar(on * (1 + pulse * 2.4)); ring2.material.opacity = on * (1 - pulse / 1.1) * 0.9;
        dot.scale.setScalar(0.4 + on * (1 + 0.5 * pk));
        beam.scale.set(1, Math.max(0.001, spring(lt, hit, 0.6)), 1); beam.position.y = 0.25 * beam.scale.y; beam.material.opacity = 0.9 * on;
        mGlow.material.opacity = on * (0.8 + 0.4 * pk); mGlow.scale.setScalar(0.35 + 0.25 * pk + 0.05 * Math.sin(t * 4));
        halo.material.opacity = 0.42 + 0.06 * Math.sin(t * 1.1);
        if (eq) eq.material.opacity = 0.55 + 0.25 * Math.sin(t * 2);
        // label at the top of the beam
        group.updateMatrixWorld(true); const tip = mGroup.localToWorld(V3(0, 0.55, 0));
        const s = toScreen(tmp.copy(tip), camera, W, H);
        const a = clamp01(spring(lt, hit + 0.1, 0.5) * 1.4), sz = 1 + 0.08 * punch(lt, hit + 0.1, 0.6);
        if (mk.text) {
          const html = `<b style="font-size:${portrait ? 104 : 84}px;line-height:1;color:${pal.accent};transform:scale(${sz.toFixed(3)});text-shadow:0 4px 24px rgba(0,0,0,.6)">${mk.text}</b>` + (mk.sub ? `<small style="font-size:52px">${mk.sub}</small>` : '');
          lbl.set(html, Math.max(260, Math.min(W - 260, s[0])), Math.max(340, s[1] - 70), a, null, 0);
        }
      },
    };
  },
};
