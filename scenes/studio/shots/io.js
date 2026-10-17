// io: Jupiter's volcanic moon Io in close-up: sulphur-yellow globe, umbrella-shaped volcanic plumes on its limb,
// a big Jupiter crescent behind it. Works for any "volcanic moon" beat.
// P: {plumes: [{angle: 58, height: 0.42, spread: 0.55}] (angle = position on the visible limb in degrees, 0 = right, 90 = top),
//     labels: [{target: "io"|"plume", text, sub, at, dx, dy}]  (default: "İO · Jüpiter'in uydusu" + "FAAL VOLKAN" at hit),
//     jupiter: true, camera: {...}}
// cues: hit (the plumes surge, vents flash)
'use strict';

function ioTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  return t;
}

SHOTS.io = {
  kind: '3d',
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels } = ctx;
    const portrait = H > W;
    const stars = starfield(scene, 33, 1500, 90);
    // ---- Io surface (painted once)
    const ioMap = ioTex(1024, 512, (g, w, h) => {
      const r = rng(41);
      g.fillStyle = '#e9c22c'; g.fillRect(0, 0, w, h);
      const blob = (x, y, rad, colr, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, colr); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
      for (let i = 0; i < 90; i++) blob(r() * w, r() * h, 30 + r() * 90, ['#f5df5a', '#e0871e', '#c8501c', '#fbf2c0', '#a8862a'][i % 5], 0.6);
      for (let i = 0; i < 40; i++) blob(r() * w, r() * h, 18 + r() * 40, '#d8401a', 0.55);          // red sulphur rings
      for (let i = 0; i < 38; i++) { const x = r() * w, y = h * (0.15 + 0.7 * r()), s = 3 + r() * 9;   // dark calderas
        g.globalAlpha = 0.85; g.fillStyle = r() < 0.3 ? '#3a1a10' : '#1c120c'; g.beginPath(); g.ellipse(x, y, s * 1.4, s, r() * 3, 0, 7); g.fill(); }
      g.globalAlpha = 0.35; g.fillStyle = '#8a7a5a'; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08);   // darker poles
      g.globalAlpha = 1;
    });
    const io = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: ioMap, roughness: 0.85, emissive: col('#4a2a06'), emissiveIntensity: 0.18 }));
    scene.add(io);
    // ---- Jupiter crescent behind
    let jup = null;
    if (P.jupiter !== false) {
      const jMap = ioTex(512, 256, (g, w, h) => { const bands = ['#e9d8b8', '#c99a6a', '#f2e6cc', '#b5784a', '#e4c9a0', '#a8683e', '#efe0c2', '#c79868'];
        for (let i = 0; i < 24; i++) { g.fillStyle = bands[i % bands.length]; g.fillRect(0, i * h / 24, w, h / 24 + 1); }
        g.fillStyle = '#b5523a'; g.beginPath(); g.ellipse(330, 168, 36, 16, 0, 0, 7); g.fill(); });
      jup = new THREE.Mesh(new THREE.SphereGeometry(7, 96, 64), new THREE.MeshStandardMaterial({ map: jMap, roughness: 0.9 }));
      jup.position.set(portrait ? 4 : 9, portrait ? 6 : 1.8, -18); jup.rotation.z = 0.12; scene.add(jup);
    }
    const sunDir = V3(-1, 0.3, 0.2).normalize();
    const key = new THREE.DirectionalLight(0xfff2dc, 3.4); key.position.copy(sunDir).multiplyScalar(10); scene.add(key);
    scene.add(new THREE.HemisphereLight(0x6a78a8, 0x1a0e06, 0.35));
    const rim = new THREE.PointLight(col(pal.accent), 18, 10); rim.position.set(2, 1.5, -2.5); scene.add(rim);
    const halo = glowSprite(pal.glow, 3.4, 0.25); halo.position.set(0, 0, -1.2); scene.add(halo);
    // ---- plumes: deterministic umbrella-shaped particle fountains on the limb
    const PL = (P.plumes || [{ angle: 62, height: 0.55, spread: 0.65 }, { angle: 128, height: 0.4, spread: 0.5 }]);
    const NPP = 420, r = rng(9);
    const plumes = PL.map((pl, k) => {
      const a = pl.angle * DEG, n = V3(Math.cos(a), Math.sin(a), 0.12).normalize();
      const t1 = V3(-n.y, n.x, 0).normalize(), t2 = new THREE.Vector3().crossVectors(n, t1).normalize();
      const pos = new Float32Array(NPP * 3), parts = Array.from({ length: NPP }, () => ({ ph: r(), phi: r() * Math.PI * 2, l: 0.55 + 0.45 * r(), sp: 0.35 + 0.3 * r() }));
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: col(k ? pal.accent2 : '#cfe4ff'), size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
      const pts = new THREE.Points(geo, mat); scene.add(pts);
      const vent = glowSprite(pal.accent, 0.5, 0.8), flash = glowSprite('#ffffff', 0.9, 0);
      const base = n.clone().multiplyScalar(1.0); vent.position.copy(base); flash.position.copy(base); scene.add(vent, flash);
      return { pl, n, t1, t2, pos, parts, geo, mat, vent, flash, base };
    });
    const lbls = (P.labels || [{ target: 'io', text: 'İO', sub: "Jüpiter'in uydusu", at: '_start', dx: -420, dy: 40 },
      { target: 'plume', text: 'FAAL VOLKAN', at: 'hit', dx: 300, dy: -60 }]).map(L => ({ L, el: labels.add('layer') }));
    const camDef = { dist: portrait ? 5.2 : 6.6, yaw: 0, pitch: 4, tx: portrait ? 0 : -0.5, ty: portrait ? 0.3 : 0.12, fov: 34, drift: 1.6, sy: portrait ? 0.15 : 0 };
    const PP = Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) });
    const camAt = (lt, dur, env) => shotCam(PP, env, lt, dur);
    const tmp = new THREE.Vector3();
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t;
        applyCam(camera, camAt(lt, dur, env), W, H); camera.updateMatrixWorld();
        stars(t);
        const hit = cue(cues, 'hit', dur * 0.45), pk = punch(lt, hit, 1.2);
        io.rotation.y = 0.6 + t * 0.06;
        if (jup) jup.rotation.y = t * 0.03;
        halo.material.opacity = 0.22 + 0.05 * Math.sin(t * 1.3) + 0.2 * pk;
        const surge = 0.45 + 0.55 * prog(lt, hit - 0.2, 0.9);
        plumes.forEach((p, k) => {
          const H0 = p.pl.height * surge, L0 = p.pl.spread * (0.6 + 0.4 * surge);
          for (let i = 0; i < NPP; i++) {
            const q = p.parts[i], s = (q.ph + t * q.sp) % 1;
            const up = 4 * H0 * q.l * s * (1 - s), lat = L0 * q.l * s;
            const cx = Math.cos(q.phi) * lat, cy = Math.sin(q.phi) * lat;
            tmp.copy(p.base).addScaledVector(p.n, up).addScaledVector(p.t1, cx).addScaledVector(p.t2, cy);
            p.pos[i * 3] = tmp.x; p.pos[i * 3 + 1] = tmp.y; p.pos[i * 3 + 2] = tmp.z;
          }
          p.geo.attributes.position.needsUpdate = true;
          p.mat.opacity = 0.55 + 0.35 * surge;
          p.vent.material.opacity = 0.6 + 0.3 * Math.sin(t * 6 + k) + 0.4 * pk;
          p.flash.material.opacity = pk; p.flash.scale.setScalar(0.9 + 1.4 * (1 - pk));
        });
        scene.updateMatrixWorld();
        lbls.forEach((o, k) => {
          const L = o.L, at = L.at === '_start' ? 0.3 : cue(cues, L.at || 'hit', hit + 0.2);
          let anchor;
          if (L.target === 'plume') { const p = plumes[0]; anchor = toScreen(p.base.clone().addScaledVector(p.n, p.pl.height * 0.6), camera, W, H); }
          else anchor = toScreen(V3(-0.75, 0.0, 0.66), camera, W, H);
          const x = Math.max(240, Math.min(W - 240, anchor[0] + (L.dx ?? -300))), y = Math.max(200, Math.min(portrait ? 1100 : 780, anchor[1] + (L.dy ?? -200)));
          const a = spring(lt, at, 0.6);
          o.el.set(`<b style="font-size:${L.size || 70}px;color:${L.color || pal.accent}">${L.text}</b>` + (L.sub ? `<small style="font-size:44px">${L.sub}</small>` : ''),
            x, y, clamp01(a * 1.5) * (lt >= at - 0.01 ? 1 : 0), [anchor[0], anchor[1]], prog(lt, at, 0.5));
        });
      },
    };
  },
};
